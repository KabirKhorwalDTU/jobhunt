import { google } from 'googleapis'

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' })
  }

  const code = typeof req.query?.code === 'string' ? req.query.code : ''

  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth authorization code' })
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    return res.status(500).json({ error: 'GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is not configured' })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${getBaseUrl(req)}/api/gmail-callback`
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Gmail Connected</title>
  </head>
  <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #0f172a; color: #e2e8f0; display: grid; place-items: center; height: 100vh; margin: 0;">
    <div style="text-align: center; max-width: 420px; padding: 24px; border: 1px solid #334155; border-radius: 14px; background: #0b1220;">
      <h1 style="margin: 0 0 8px; font-size: 20px;">Gmail connected</h1>
      <p style="margin: 0; color: #94a3b8;">You can close this window.</p>
    </div>
    <script>
      window.opener.postMessage({ type: 'GMAIL_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
      window.close();
    </script>
  </body>
</html>`)
  } catch (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(500).send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Gmail Connection Failed</title>
  </head>
  <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #1f0a0a; color: #fecaca; display: grid; place-items: center; height: 100vh; margin: 0;">
    <div style="text-align: center; max-width: 420px; padding: 24px; border: 1px solid #7f1d1d; border-radius: 14px; background: #2a0f0f;">
      <h1 style="margin: 0 0 8px; font-size: 20px;">Gmail connection failed</h1>
      <p style="margin: 0; color: #fca5a5;">${error?.message || 'Unknown OAuth error'}</p>
    </div>
  </body>
</html>`)
  }
}
