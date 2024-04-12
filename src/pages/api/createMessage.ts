import { NextApiRequest, NextApiResponse } from 'next'

export default async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  const { messages, apiKey } = req.body
  // const apiKey = process.env.OPENAI_API_KEY
  const url = `${process.env.BASE_URL}/v1/chat/completions`

  const body = JSON.stringify({
    messages,
    model: 'gpt-4-32k',
    stream: false
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body
    })
    const data = await response.json()
    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}
