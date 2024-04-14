import { Button } from '@apideck/components'
import { useState, CSSProperties, useEffect } from 'react'
import { Markdown } from './markdown'

const messages = [
  {
    role: 'system',
    content: '使用nodejs帮我写一个发起请求的示例'
  }
]

const chatMessageItemStyle: CSSProperties = {
  boxSizing: 'border-box',
  maxWidth: '100%',
  marginTop: '10px',
  borderRadius: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  padding: '10px',
  fontSize: '14px',
  userSelect: 'text',
  wordBreak: 'break-word',
  border: '1px solid rgb(222, 222, 222)',
  position: 'relative',
  transition: 'all ease 0.3s'
}

export default function Test() {
  const [text, setText] = useState<string>('')

  function fetchStreamData() {
    const ApiKey = localStorage.getItem('chat2hub_pdf_ApiKey')
    const eventSource = new EventSource(
      `/api/test?ApiKey=${ApiKey}&messages=${JSON.stringify(messages)}`
    )
    eventSource.onmessage = function (event) {
      if (event.data === '[DONE]') return

      const eventMessage = JSON.parse(event.data)
      const streamMsg = eventMessage.choices as Array<{ delta: { content: string } }>
      const content = streamMsg[0]?.delta?.content
      if (content) {
        setText((prevText: string) => prevText + content)
      }
    }
    eventSource.onerror = function () {
      eventSource.close()
    }
  }

  useEffect(() => {
    console.warn('www7777: ', text)
  }, [text])

  return (
    <>
      <Button onClick={fetchStreamData}>fetchStreamData</Button>
      <div style={chatMessageItemStyle}>
        <Markdown content={text} />
      </div>
    </>
  )
}
