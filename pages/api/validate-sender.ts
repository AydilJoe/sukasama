import type { NextApiRequest, NextApiResponse } from 'next'
import Mailjet from 'node-mailjet'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_API_SECRET || ''
  })

  try {
    const result = await mailjet
      .post('sender', { version: 'v3' })
      .id(6484969524)
      .action('validate')
      .request()

    console.log(result.body)
    res.status(200).json({ message: 'Sender validated successfully', data: result.body })
  } catch (error) {
    console.error('Error validating sender:', error)
    res.status(500).json({ error: 'Failed to validate sender' })
  }
}