import { useToast } from '@apideck/components'
import { fetchEventSource, EventStreamContentType } from '@fortaine/fetch-event-source'
import { ChatCompletionRequestMessage } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { prettyObject } from 'utils'

interface ContextProps {
  replyText: string
  messages: ChatCompletionRequestMessage[]
  addMessage: (content: string) => Promise<void>
  connectStatus: number
  controllerSSE: AbortController
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
  const [replyText, setReplyText] = useState<string>('')
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [connectStatus, setConnectStatus] = useState<number>(-1) // SSE_Status_Map
  const [controllerSSE, setControllerSSE] = useState<AbortController>(
    {} as unknown as AbortController
  )

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
    // controllerSSE?.abort()
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
          if (
            !res.ok ||
            !res.headers.get('content-type')?.startsWith(EventStreamContentType) ||
            res.status !== 200
          ) {
            let extraInfo = await res.clone().text()
            try {
              const resJson = await res.clone().json()
              extraInfo = prettyObject(resJson)
            } catch (error) {
              console.log('onopen - error', error)
            }

            let responseText = ''
            if (extraInfo) {
              responseText = extraInfo
            }

            setReplyText(responseText || '请求出错')
          }
        },
        onmessage: function (event) {
          if (event.data === '[DONE]') return
          const eventMessage = JSON.parse(event.data)
          // streamMessage.content 是完整的消息
          const streamMessage = eventMessage.choices[0]?.message as {
            role: string
            content: string
          }
          setReplyText(streamMessage.content)
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

  useEffect(() => {
    if (connectStatus === SSE_Status_Map.CLOSED) {
      const replyTemplate = {
        role: 'assistant',
        content: replyText
      } as ChatCompletionRequestMessage
      setMessages([...messages, replyTemplate])
      setReplyText('')
    }
  }, [connectStatus])

  return (
    <ChatsContext.Provider
      value={{ connectStatus, controllerSSE, closeSSEConnect, replyText, messages, addMessage }}
    >
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
