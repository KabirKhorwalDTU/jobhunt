import { useEffect, useState } from 'react'
import { getStore, setStore } from '../store.js'

export default function SettingsPanel({ gmailConnected, setGmailConnected }) {
  const [resumeLink, setResumeLink] = useState('')
  const [loomLink, setLoomLink] = useState('')
  const [saved, setSaved] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const settings = getStore('settings') || {}
    setResumeLink(settings.resume_link || '')
    setLoomLink(settings.loom_link || '')
  }, [])

  useEffect(() => {
    const onMessage = (event) => {
      if (event?.data?.type === 'GMAIL_AUTH_SUCCESS' && event?.data?.tokens) {
        setStore('gmail_tokens', event.data.tokens)
        setGmailConnected(true)
        setAuthError('')
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setGmailConnected])

  const saveSettings = () => {
    setStore('settings', {
      resume_link: resumeLink.trim(),
      loom_link: loomLink.trim()
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const connectGmail = () => {
    const popup = window.open('/api/gmail-auth', 'gmail-auth', 'width=600,height=600,left=200,top=120')
    if (!popup) {
      setAuthError('Popup blocked. Allow popups for this site and try again.')
    }
  }

  const disconnectGmail = () => {
    localStorage.removeItem('gmail_tokens')
    setGmailConnected(false)
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>

      <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Resume Link (Google Drive public URL)</label>
          <input
            type="url"
            value={resumeLink}
            onChange={(event) => setResumeLink(event.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Loom Video Link</label>
          <input
            type="url"
            value={loomLink}
            onChange={(event) => setLoomLink(event.target.value)}
            placeholder="https://loom.com/share/..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          type="button"
          onClick={saveSettings}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
        >
          {saved ? 'Saved' : 'Save Settings'}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Vercel Environment Keys</h2>
        <div className="space-y-2 text-sm text-slate-300">
          <p>• Apollo API Key: set in Vercel ✓</p>
          <p>• Anthropic API Key: set in Vercel ✓</p>
          <p>• Gamma API Key: set in Vercel ✓</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Gmail</h2>
        <p className="text-sm text-slate-400 mb-3">Current connected Gmail: kabirkhorwaldce@gmail.com</p>

        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${gmailConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span className={`text-sm ${gmailConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {gmailConnected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={connectGmail}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Connect Gmail
          </button>

          {gmailConnected && (
            <button
              type="button"
              onClick={disconnectGmail}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Disconnect
            </button>
          )}
        </div>

        {authError && <p className="mt-3 text-sm text-rose-400">{authError}</p>}
      </div>
    </section>
  )
}
