import { ChatCompletionRequestMessage } from 'openai'

export const sendMessage = async (messages: ChatCompletionRequestMessage[]) => {
  try {
    const apiKey = localStorage.getItem('chat2hub_pdf_ApiKey') || ''

    const response = await fetch('/api/createMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages, apiKey })
    })

    return await response.json()
  } catch (error) {
    console.log(error)
  }
}
