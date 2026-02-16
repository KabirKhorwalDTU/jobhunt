import { useEffect, useState } from 'react'
import PipelineRunner from './components/PipelineRunner.jsx'
import ReviewDashboard from './components/ReviewDashboard.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import { getStore, setStore } from './store.js'

export default function App() {
  const [view, setView] = useState('pipeline')
  const [gmailConnected, setGmailConnected] = useState(Boolean(getStore('gmail_tokens')))

  useEffect(() => {
    const syncGmailStatus = () => {
      setGmailConnected(Boolean(getStore('gmail_tokens')))
    }

    const onMessage = (event) => {
      if (event?.data?.type === 'GMAIL_AUTH_SUCCESS' && event?.data?.tokens) {
        setStore('gmail_tokens', event.data.tokens)
        syncGmailStatus()
      }
    }

    const onStorage = (event) => {
      if (event.key === 'gmail_tokens') {
        syncGmailStatus()
      }
    }

    window.addEventListener('message', onMessage)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="text-lg font-bold tracking-tight">🚀 Job Agent</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === 'pipeline'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Pipeline
          </button>
          <button
            type="button"
            onClick={() => setView('review')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === 'review'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Review
          </button>
          <button
            type="button"
            onClick={() => setView('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === 'settings'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Settings
          </button>

          <div className="ml-3 flex items-center gap-2 text-sm text-slate-300">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${gmailConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span>Gmail: {gmailConnected ? 'Connected' : 'Not'}</span>
          </div>
        </div>
      </nav>

      <main>
        {view === 'pipeline' && <PipelineRunner onComplete={() => setView('review')} />}
        {view === 'review' && <ReviewDashboard />}
        {view === 'settings' && (
          <SettingsPanel gmailConnected={gmailConnected} setGmailConnected={setGmailConnected} />
        )}
      </main>
    </div>
  )
}
