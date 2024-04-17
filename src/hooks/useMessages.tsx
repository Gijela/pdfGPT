import { useToast } from '@apideck/components'
import { fetchEventSource, EventStreamContentType } from '@fortaine/fetch-event-source'
import { ChatCompletionRequestMessage } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { prettyObject } from 'utils'

interface ContextProps {
  messages: ChatCompletionRequestMessage[]
  addMessage: (content: string) => Promise<void>
  connectStatus: number
  closeSSEConnect: () => void
}

const ChatsContext = createContext<Partial<ContextProps>>({})

interface IMessagesProvider {
  curPdfUrl: string
  children: ReactNode
}

export enum SSE_Status_Map {
  DEFAULT_STATUS = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSED = 2
}

export function MessagesProvider({ curPdfUrl, children }: IMessagesProvider) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [connectStatus, setConnectStatus] = useState<number>(-1) // SSE_Status_Map
  const [controllerSSE, setControllerSSE] = useState<AbortController>({
    signal: '',
    abort: () => {}
  } as unknown as AbortController)

  // 初始化
  useEffect(() => {
    if (curPdfUrl) {
      const systemMessage: ChatCompletionRequestMessage = {
        role: 'system',
        content: `你是 ChatGPT 4.0，一个由 OpenAI 训练的大型语言模型。下面我会给你提供一个PDF文件链接，后续所有问题请优先基于本文件进行回答，文件链接为：${curPdfUrl}。`
      }
      const welcomeMessage: ChatCompletionRequestMessage = {
        role: 'assistant',
        content: '您好，有什么可以帮助您？'
      }
      setMessages([systemMessage, welcomeMessage])
    }
  }, [curPdfUrl])

  const closeSSEConnect = () => {
    controllerSSE.abort()
    setConnectStatus(SSE_Status_Map.CLOSED)
    console.log('流连接已断开')
  }

  // 提问 openAI
  const addMessage = async (content: string) => {
    const ApiKey = localStorage.getItem('chat2hub_pdf_ApiKey')
    if (!ApiKey) {
      addToast({ title: '未填写 ApiKey ！', type: 'error' })
      return
    }

    try {
      // 添加问题到 Messages
      const newMessage: ChatCompletionRequestMessage = { role: 'user', content }
      const newMessages = [...messages, newMessage]
      setMessages(newMessages)

      // 发起请求 & 返回流式数据
      const newControllerSSE = new AbortController()
      setControllerSSE(newControllerSSE)

      setConnectStatus(SSE_Status_Map.CONNECTING)
      fetchEventSource('/api/createMessage', {
        method: 'POST',
        body: JSON.stringify({ messages: newMessages, ApiKey }),
        signal: newControllerSSE.signal,
        openWhenHidden: true,
        onopen: async function (res) {
          setConnectStatus(SSE_Status_Map.OPEN)

          // 异常处理
          const contentType = res.headers.get('content-type')
          if (contentType?.startsWith('text/plain')) {
            const responseText = await res.clone().text()
            const mockResponse = {
              role: 'assistant',
              content: responseText
            } as ChatCompletionRequestMessage

            setMessages([...newMessages, mockResponse])
            return
          }

          if (
            !res.ok ||
            !res.headers.get('content-type')?.startsWith(EventStreamContentType) ||
            res.status !== 200
          ) {
            const responseTexts = []
            let extraInfo = await res.clone().text()
            try {
              const resJson = await res.clone().json()
              extraInfo = prettyObject(resJson)
            } catch {}

            if (res.status === 401) {
              responseTexts.push('检测到无效 ApiKey，请在右上角检查 ApiKey 是否配置正确')
            }

            if (extraInfo) {
              responseTexts.push(extraInfo)
            }

            const responseText = responseTexts.join('\n\n')
            const mockResponse = {
              role: 'assistant',
              content: responseText
            } as ChatCompletionRequestMessage

            setMessages([...newMessages, mockResponse])
            return
          }
        },
        onmessage: function (event) {
          if (event.data === '[DONE]') return
          const eventMessage = JSON.parse(event.data)
          const streamMessage: ChatCompletionRequestMessage = eventMessage.choices[0]?.message
          // 每获取一个streamMessage(其content是完整消息)，都和 newMessages 组成新的数组，触发重渲染。
          setMessages([...newMessages, streamMessage])
        },
        onclose() {
          closeSSEConnect()
        },
        onerror(e) {
          closeSSEConnect()
          throw e
        }
      })
    } catch (error) {
      addToast({ title: '发起对话请求出错！', type: 'error' })
    }
  }

  return (
    <ChatsContext.Provider value={{ connectStatus, closeSSEConnect, messages, addMessage }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
