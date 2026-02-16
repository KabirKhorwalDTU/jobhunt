import { google } from 'googleapis'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function getBaseUrl(req) {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  const forwardedProto = req.headers['x-forwarded-proto']
  const forwardedHost = req.headers['x-forwarded-host']
  const host = forwardedHost || req.headers.host
  const protocol = forwardedProto || 'http'

  return `${protocol}://${host}`
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' })
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    return res.status(500).json({ error: 'GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is not configured' })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${getBaseUrl(req)}/api/gmail-callback`
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent'
  })

  return res.redirect(302, authUrl)
}
