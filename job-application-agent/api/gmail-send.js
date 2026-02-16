import { google } from 'googleapis'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function parseBody(body) {
  if (!body) return {}
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  return body
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

function normalizeTokens(tokens, oauth2Client) {
  const creds = oauth2Client.credentials || {}

  return {
    access_token: creds.access_token || tokens.access_token,
    refresh_token: creds.refresh_token || tokens.refresh_token,
    expiry_date: creds.expiry_date || tokens.expiry_date
  }
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { tokens, to, subject, body } = parseBody(req.body)

  if (!tokens || typeof tokens !== 'object') {
    return res.status(400).json({ error: 'tokens are required' })
  }

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject, and body are required' })
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    return res.status(500).json({ error: 'GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is not configured' })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${getBaseUrl(req)}/api/gmail-callback`
  )

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date
  })

  try {
    // Triggers token refresh if needed when refresh_token exists.
    await oauth2Client.getAccessToken()

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ].join('\n')

    const encoded = Buffer.from(message).toString('base64url')

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encoded }
    })

    return res.status(200).json({
      success: true,
      messageId: result.data.id,
      updatedTokens: normalizeTokens(tokens, oauth2Client)
    })
  } catch (error) {
    if (error?.code === 401 || error?.status === 401) {
      return res.status(401).json({ error: 'Gmail authorization failed. Reconnect Gmail in Settings.' })
    }

    return res.status(500).json({
      error: 'Failed to send Gmail message.',
      details: error?.message || 'Unknown Gmail send error'
    })
  }
}
