import { useToast } from '@apideck/components'
import { ChatCompletionRequestMessage } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface ContextProps {
  messages: ChatCompletionRequestMessage[]
  addMessage: (content: string) => Promise<void>
  connectStatus: number
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

const SSE_Max_Connect_Time = 60000 // ms

export function MessagesProvider({ curPdfUrl, children }: IMessagesProvider) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [connectStatus, setConnectStatus] = useState<number>(-1) // SSE_Status_Map

  // 初始化
  useEffect(() => {
    const initializeChat = () => {
      const systemMessage: ChatCompletionRequestMessage = {
        role: 'system',
        content: '你是 ChatGPT 4.0，一个由 OpenAI 训练的大型语言模型。'
      }
      const welcomeMessage: ChatCompletionRequestMessage = {
        role: 'assistant',
        content: '您好，有什么可以帮助您？'
      }
      setMessages([systemMessage, welcomeMessage])
    }

    if (!messages?.length) {
      initializeChat()
    }
  }, [messages?.length, setMessages])

  // pdf 链接存在时，将其添加到系统 prompt 中
  useEffect(() => {
    if (curPdfUrl) {
      const newSystemMsg: ChatCompletionRequestMessage = messages[0]
      newSystemMsg.content += `后续问题请基于本文件进行回答, 文件链接为：${curPdfUrl}`
      setMessages([newSystemMsg, ...messages.slice(1)])
    }
  }, [curPdfUrl])

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
      const eventSource = new EventSource(
        `/api/createMessage?ApiKey=${ApiKey}&messages=${JSON.stringify(newMessages)}`
      )
      setConnectStatus(eventSource.readyState) // connecting status

      const closeSSEConnect = () => {
        eventSource.close()
        setConnectStatus(eventSource.readyState) // closed status
        clearTimeout(timeoutId)
        console.log('流连接已断开')
      }

      // 设置最大超时时间，无响应则断开 SSE 连接
      let timeoutId = setTimeout(closeSSEConnect, SSE_Max_Connect_Time)

      eventSource.onopen = function () {
        setConnectStatus(eventSource.readyState) // open status
        clearTimeout(timeoutId) // 连接建立，清除超时
      }
      eventSource.onmessage = function (event) {
        clearTimeout(timeoutId) // 接收到消息，清除超时
        if (event.data === '[DONE]') return
        const eventMessage = JSON.parse(event.data)
        const streamMessage: ChatCompletionRequestMessage = eventMessage.choices[0]?.message
        // 每获取一个streamMessage(其content是完整消息)，都和 newMessages 组成新的数组，触发重渲染。
        setMessages([...newMessages, streamMessage])

        // 重新设置超时
        timeoutId = setTimeout(closeSSEConnect, SSE_Max_Connect_Time)
      }
      eventSource.onerror = closeSSEConnect
    } catch (error) {
      addToast({ title: '发起对话请求出错！', type: 'error' })
    }
  }

  return (
    <ChatsContext.Provider value={{ connectStatus, messages, addMessage }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
