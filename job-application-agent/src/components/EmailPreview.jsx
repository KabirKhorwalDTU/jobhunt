import { useEffect, useMemo, useState } from 'react'

export default function EmailPreview({ email, onApprove, onSkip, onSave, onNext }) {
  const [editing, setEditing] = useState(false)
  const [draftBody, setDraftBody] = useState('')

  useEffect(() => {
    setEditing(false)
    setDraftBody(email?.body || '')
  }, [email?.id])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!email || editing) return

      if (event.key === 'a' || event.key === 'A') {
        event.preventDefault()
        onApprove()
      }

      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault()
        setEditing(true)
        setDraftBody(email.body || '')
      }

      if (event.key === 's' || event.key === 'S') {
        event.preventDefault()
        onSkip()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editing, email, onApprove, onSkip, onNext])

  const statusLabel = useMemo(() => {
    if (!email?.status) return 'Draft'
    return email.status.charAt(0).toUpperCase() + email.status.slice(1)
  }, [email?.status])

  if (!email) {
    return (
      <div className="h-full grid place-items-center text-slate-600 text-sm px-6 text-center">
        Select a contact from the sidebar to load an email preview.
      </div>
    )
  }

  return (
    <section className="h-full flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 space-y-2">
        <div className="text-xs inline-flex rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300">{statusLabel}</div>
        <div className="text-sm text-slate-300">To: {email.to}</div>
        <div className="text-sm text-slate-300">Subject: {email.subject}</div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {editing ? (
          <textarea
            value={draftBody}
            onChange={(event) => setDraftBody(event.target.value)}
            className="w-full h-full min-h-[320px] rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoFocus
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200 font-sans">{email.body}</pre>
        )}
      </div>

      <footer className="border-t border-slate-800 px-6 py-3 flex items-center gap-2 flex-wrap">
        {editing ? (
          <>
            <button
              type="button"
              onClick={() => {
                onSave(draftBody)
                setEditing(false)
              }}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setDraftBody(email.body || '')
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              ✓ Approve
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(true)
                setDraftBody(email.body || '')
              }}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
            >
              ✎ Edit
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg bg-rose-900/60 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-800/70"
            >
              ✗ Skip
            </button>
            <button
              type="button"
              onClick={onNext}
              className="ml-auto rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Next →
            </button>
          </>
        )}
      </footer>
    </section>
  )
}
