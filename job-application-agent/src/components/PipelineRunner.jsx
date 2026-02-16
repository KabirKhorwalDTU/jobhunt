import { useMemo, useState } from 'react'
import { getAllCompanies, getStore, slugify, updateCompanyData } from '../store.js'

const STEP_CONFIG = [
  { key: 'apollo', label: 'Step 1: Finding contacts...' },
  { key: 'research', label: 'Step 2: Researching company...' },
  { key: 'gamma', label: 'Step 3: Creating deck...' },
  { key: 'draft', label: 'Step 4: Drafting emails...' }
]

function Spinner() {
  return <span className="spinner" aria-hidden="true"></span>
}

export default function PipelineRunner({ onComplete }) {
  const [companyName, setCompanyName] = useState('')
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [stepMessages, setStepMessages] = useState({})
  const [error, setError] = useState('')
  const [completion, setCompletion] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const companies = useMemo(() => getAllCompanies(), [refreshKey])
  const companyEntries = Object.entries(companies)

  const setStepMessage = (key, message) => {
    setStepMessages((prev) => ({ ...prev, [key]: message }))
  }

  const runPipeline = async () => {
    const trimmedCompany = companyName.trim()
    if (!trimmedCompany || running) return

    setRunning(true)
    setActiveStep(0)
    setStepMessages({})
    setError('')
    setCompletion('')

    const companySlug = slugify(trimmedCompany)
    const settings = getStore('settings') || {}

    try {
      // Step 1: Apollo
      setActiveStep(0)
      const apolloResponse = await fetch('/api/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: trimmedCompany })
      })
      const apolloData = await apolloResponse.json()
      if (!apolloResponse.ok) {
        throw new Error(apolloData.error || apolloData.details || 'Failed to fetch contacts from Apollo')
      }
      const contacts = Array.isArray(apolloData.contacts) ? apolloData.contacts : []
      if (!contacts.length) {
        throw new Error(apolloData.error || `No contacts found for ${trimmedCompany}`)
      }
      setStepMessage('apollo', `✓ Found ${contacts.length} contacts`)
      updateCompanyData(companySlug, { company_name: trimmedCompany, contacts })

      // Step 2: Research
      setActiveStep(1)
      const researchResponse = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: trimmedCompany })
      })
      const research = await researchResponse.json()
      if (!researchResponse.ok) {
        throw new Error(research.error || research.details || 'Failed to generate research')
      }
      setStepMessage('research', '✓ Research complete')
      updateCompanyData(companySlug, { research })

      // Step 3: Gamma
      setActiveStep(2)
      const gammaResponse = await fetch('/api/gamma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: trimmedCompany,
          research,
          loom_link: settings.loom_link || '',
          resume_link: settings.resume_link || ''
        })
      })
      const gammaData = await gammaResponse.json()
      if (!gammaResponse.ok || !gammaData.deck_url) {
        throw new Error(gammaData.error || gammaData.details || 'Failed to create deck')
      }
      setStepMessage('gamma', '✓ Deck generated')
      updateCompanyData(companySlug, { deck_url: gammaData.deck_url })

      // Step 4: Draft
      setActiveStep(3)
      const draftResponse = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts,
          research,
          deck_url: gammaData.deck_url,
          loom_link: settings.loom_link || '',
          resume_link: settings.resume_link || ''
        })
      })
      const draftData = await draftResponse.json()
      if (!draftResponse.ok) {
        throw new Error(draftData.error || draftData.details || 'Failed to draft emails')
      }
      const emails = Array.isArray(draftData.emails) ? draftData.emails : []
      setStepMessage('draft', `✓ Drafted ${emails.length} emails`)
      updateCompanyData(companySlug, {
        company_name: research.company_name || trimmedCompany,
        emails
      })

      setCompletion(`✓ Pipeline complete — ${emails.length} emails drafted for ${research.company_name || trimmedCompany}. Go to Review →`)
      setRefreshKey((value) => value + 1)
      setActiveStep(4)
    } catch (pipelineError) {
      setError(pipelineError?.message || 'Pipeline failed')
    } finally {
      setRunning(false)
    }
  }

  const onInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      runPipeline()
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-center mb-2">Pipeline Runner</h1>
      <p className="text-center text-slate-400 mb-8">Run contacts + research + deck + drafting in one flow.</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Enter company name"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          disabled={running}
        />
        <button
          type="button"
          onClick={runPipeline}
          disabled={running || !companyName.trim()}
          className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {running ? 'Running...' : 'Run Pipeline →'}
        </button>
      </div>

      {(running || completion || error) && (
        <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="space-y-3">
            {STEP_CONFIG.map((step, index) => {
              const complete = stepMessages[step.key]
              const active = running && activeStep === index

              return (
                <div key={step.key} className="flex items-center gap-3 text-sm">
                  {complete ? <span className="text-emerald-400">✓</span> : active ? <Spinner /> : <span className="text-slate-600">○</span>}
                  <span className={complete ? 'text-emerald-300' : active ? 'text-slate-100' : 'text-slate-500'}>
                    {complete || step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-rose-900 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>
          )}

          {completion && (
            <div className="mt-4 rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300 flex items-center justify-between gap-4">
              <span>{completion}</span>
              <button
                type="button"
                className="underline decoration-dotted underline-offset-2"
                onClick={onComplete}
              >
                Go to Review →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-3">Previously Run Companies</h2>

        {companyEntries.length === 0 && <p className="text-sm text-slate-600">No runs yet.</p>}

        <div className="space-y-2">
          {companyEntries.map(([slug, data]) => (
            <div key={slug} className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-100">{data.company_name || slug}</p>
                <p className="text-xs text-slate-500">{(data.contacts || []).length} contacts • {(data.emails || []).length} emails</p>
              </div>
              <span className="text-xs text-slate-600">{slug}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
