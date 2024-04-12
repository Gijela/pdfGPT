import { useToast } from '@apideck/components'
import { ChatCompletionRequestMessage } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { sendMessage } from './sendMessage'

interface ContextProps {
  messages: ChatCompletionRequestMessage[]
  addMessage: (content: string) => Promise<void>
  isLoadingAnswer: boolean
}

const ChatsContext = createContext<Partial<ContextProps>>({})

interface IMessagesProvider {
  curPdfUrl: string
  children: ReactNode
}

export function MessagesProvider({ curPdfUrl, children }: IMessagesProvider) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)

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
    setIsLoadingAnswer(true)
    try {
      // 添加问题到 Messages
      const newMessage: ChatCompletionRequestMessage = { role: 'user', content }
      const newMessages = [...messages, newMessage]
      setMessages(newMessages)

      // 发起请求
      const { data } = await sendMessage(newMessages)

      // 添加回复到 Messages
      const reply = data.choices[0].message
      setMessages([...newMessages, reply])
    } catch (error) {
      addToast({ title: '请确保 ApiKey 已正确填入', type: 'error' })
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  return (
    <ChatsContext.Provider value={{ messages, addMessage, isLoadingAnswer }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
