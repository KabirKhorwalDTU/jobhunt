import { useEffect, useMemo, useState } from 'react'
import DeckPreview from './DeckPreview.jsx'
import EmailPreview from './EmailPreview.jsx'
import Sidebar from './Sidebar.jsx'
import { getAllCompanies, getStore, setStore, updateEmail } from '../store.js'

function findFirstSelection(companies) {
  const entries = Object.entries(companies)
  for (const [slug, data] of entries) {
    if (Array.isArray(data.emails) && data.emails.length > 0) {
      return { companySlug: slug, emailId: data.emails[0].id }
    }
  }
  return { companySlug: '', emailId: '' }
}

export default function ReviewDashboard() {
  const [companies, setCompanies] = useState(getAllCompanies())
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedEmailId, setSelectedEmailId] = useState('')
  const [sending, setSending] = useState(false)
  const [sendMessage, setSendMessage] = useState('')

  const reload = () => setCompanies(getAllCompanies())

  useEffect(() => {
    const selection = findFirstSelection(companies)
    if (!selectedCompany && selection.companySlug) {
      setSelectedCompany(selection.companySlug)
      setSelectedEmailId(selection.emailId)
    }
  }, [companies, selectedCompany])

  const selectedCompanyData = useMemo(() => companies[selectedCompany] || null, [companies, selectedCompany])

  const selectedEmail = useMemo(() => {
    if (!selectedCompanyData?.emails) return null
    return selectedCompanyData.emails.find((email) => email.id === selectedEmailId) || null
  }, [selectedCompanyData, selectedEmailId])

  const selectEmail = (companySlug, emailId) => {
    setSelectedCompany(companySlug)
    setSelectedEmailId(emailId)
  }

  const moveToNext = () => {
    const emails = selectedCompanyData?.emails || []
    if (!emails.length || !selectedEmailId) return
    const currentIndex = emails.findIndex((email) => email.id === selectedEmailId)
    if (currentIndex >= 0 && currentIndex < emails.length - 1) {
      setSelectedEmailId(emails[currentIndex + 1].id)
    }
  }

  const approve = () => {
    if (!selectedCompany || !selectedEmailId) return
    updateEmail(selectedCompany, selectedEmailId, { status: 'approved' })
    reload()
    moveToNext()
  }

  const skip = () => {
    if (!selectedCompany || !selectedEmailId) return
    updateEmail(selectedCompany, selectedEmailId, { status: 'skipped' })
    reload()
    moveToNext()
  }

  const save = (body) => {
    if (!selectedCompany || !selectedEmailId) return
    updateEmail(selectedCompany, selectedEmailId, { body, status: 'draft' })
    reload()
  }

  const sendAllApproved = async () => {
    const tokens = getStore('gmail_tokens')
    if (!tokens) {
      setSendMessage('Please connect Gmail first')
      return
    }

    const freshCompanies = getAllCompanies()
    const approved = []

    for (const [slug, data] of Object.entries(freshCompanies)) {
      for (const email of data.emails || []) {
        if (email.status === 'approved') {
          approved.push({ slug, email })
        }
      }
    }

    if (!approved.length) {
      setSendMessage('No approved emails to send')
      return
    }

    setSending(true)
    setSendMessage(`Sending 1/${approved.length}...`)

    let sentCount = 0
    let currentTokens = tokens

    for (let index = 0; index < approved.length; index += 1) {
      const { slug, email } = approved[index]
      setSendMessage(`Sending ${index + 1}/${approved.length}...`)

      try {
        const response = await fetch('/api/gmail-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: currentTokens,
            to: email.to,
            subject: email.subject,
            body: email.body
          })
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          continue
        }

        if (result.updatedTokens) {
          currentTokens = result.updatedTokens
          setStore('gmail_tokens', currentTokens)
        }

        updateEmail(slug, email.id, { status: 'sent' })
        sentCount += 1
      } catch {
        // Skip failure and continue sending other approved emails.
      }
    }

    setSending(false)
    reload()

    if (sentCount === approved.length) {
      setSendMessage('✓ All emails sent! Check your Gmail Sent folder.')
    } else {
      setSendMessage(`Sent ${sentCount}/${approved.length}. Re-approve failed ones and retry.`)
    }
  }

  return (
    <section className="h-[calc(100vh-57px)] flex">
      <div className="w-80 border-r border-slate-800">
        <Sidebar
          selectedCompany={selectedCompany}
          selectedEmailId={selectedEmailId}
          onSelectEmail={selectEmail}
          onSendAll={sendAllApproved}
        />
      </div>

      <div className="flex-1 border-r border-slate-800 min-w-0">
        <EmailPreview
          email={selectedEmail}
          onApprove={approve}
          onSkip={skip}
          onSave={save}
          onNext={moveToNext}
        />
      </div>

      <div className="w-96 min-w-[320px]">
        <DeckPreview
          companyName={selectedCompanyData?.company_name || ''}
          deckUrl={selectedCompanyData?.deck_url || ''}
          loomLink={selectedEmail?.loom_link || ''}
        />
      </div>

      {(sending || sendMessage) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 shadow-xl">
          {sending && <span className="spinner inline-block mr-2 align-middle"></span>}
          {sendMessage}
        </div>
      )}
    </section>
  )
}
