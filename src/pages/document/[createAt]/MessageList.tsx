import { useMessages, SSE_Status_Map } from 'hooks/useMessages'
import { Markdown } from './markdownRender/markdown'
import { useEffect, useRef } from 'react'
import GeneratingMessage from './GeneratingMessage'

const MessagesList = () => {
  const { connectStatus, messages } = useMessages()
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (connectStatus === SSE_Status_Map.CONNECTING) {
      loadingRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [connectStatus])

  return (
    <div className="max-w-3xl mx-auto pt-3">
      {messages?.map((message, i) => {
        const isUser = message.role === 'user'
        if (message.role === 'system') return null
        return (
          <div
            id={`message-${i}`}
            className={`flex mb-3 fade-up justify-start ${i === 1 ? 'max-w-md' : ''}`}
            key={message.content + String(i)}
          >
            <img
              src={isUser ? '/img/logo.png' : '/img/gpt.png'}
              className="w-9 h-9 rounded-full"
              alt="avatar"
            />
            <div
              style={{ maxWidth: 'calc(100% - 45px)' }}
              className={`group relative px-3 py-2 rounded-lg ml-2 ${
                isUser
                  ? 'bg-gradient-to-br from-primary-700 to-primary-600 text-white text-[0.875rem]'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
              }`}
            >
              {isUser ? message.content?.trim() : <Markdown content={message.content!} />}
            </div>
          </div>
        )
      })}
      {/* loading animation */}
      {connectStatus === SSE_Status_Map.CONNECTING && (
        <div ref={loadingRef} className="flex justify-start mb-4">
          <img src="/img/gpt.png" className="w-9 h-9 rounded-full" alt="avatar" />
          <div className="loader ml-2 p-2.5 px-4 bg-gray-200 dark:bg-gray-800 rounded-lg space-x-1.5 flex justify-between items-center relative">
            <span className="block w-3 h-3 rounded-full"></span>
            <span className="block w-3 h-3 rounded-full"></span>
            <span className="block w-3 h-3 rounded-full"></span>
          </div>
        </div>
      )}
      {/* 流式信息未获得'data: [DONE]'时显示 */}
      <GeneratingMessage />
    </div>
  )
}

export default MessagesList
