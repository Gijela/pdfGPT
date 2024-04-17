import { useMessages } from 'hooks/useMessages'
import { Markdown } from './markdownRender/markdown'
import React, { useEffect, useRef } from 'react'

export default function GeneratingMessage() {
  const { replyText } = useMessages()
  const GenerateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    GenerateRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [replyText])

  return (
    <>
      {replyText ? (
        <div ref={GenerateRef} className={`flex mb-3 fade-up justify-start `} key={replyText}>
          <img src={'/img/gpt.png'} className="w-9 h-9 rounded-full" alt="avatar" />
          <div
            style={{ maxWidth: 'calc(100% - 45px)' }}
            className={`group relative px-3 py-2 rounded-lg ml-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200`}
          >
            <Markdown content={replyText} />
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}
