import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages, ApiKey } = req.query
  const url = `${process.env.BASE_URL}/v1/chat/completions`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${ApiKey as string}`
      },
      body: JSON.stringify({
        messages: JSON.parse(messages as string),
        model: 'gpt-4-32k',
        stream: true
      })
    })

    // get stream reader
    if (!response.body) throw new Error('No response body')
    const reader = response.body?.getReader()

    // read stream & return stream data
    // ![required] headers: { 'Content-Type': 'text/event-stream', 'Content-Encoding': 'none' }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Content-Encoding': 'none' })
    reader.read().then(function processStream({ done, value }): Promise<void> | undefined {
      if (done) {
        res.end()
        return
      }

      res.write(new TextDecoder().decode(value))

      return reader.read().then(processStream)
    })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}
