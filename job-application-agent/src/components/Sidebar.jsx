import { getAllCompanies } from '../store.js'

const STATUS_STYLE = {
  draft: 'bg-slate-500 text-slate-300',
  approved: 'bg-emerald-500 text-emerald-300',
  skipped: 'bg-rose-500 text-rose-300',
  sent: 'bg-sky-500 text-sky-300'
}

const STATUS_LABEL = {
  draft: 'Draft',
  approved: 'Approved',
  skipped: 'Skipped',
  sent: 'Sent'
}

export default function Sidebar({ selectedCompany, selectedEmailId, onSelectEmail, onSendAll }) {
  const companies = getAllCompanies()
  const entries = Object.entries(companies).filter(([, data]) => Array.isArray(data.emails) && data.emails.length > 0)

  const approvedPending = entries.reduce((total, [, data]) => {
    return total + data.emails.filter((email) => email.status === 'approved').length
  }, 0)

  return (
    <aside className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 px-2 mb-3">Companies</h2>

        {entries.length === 0 && <p className="text-sm text-slate-600 px-2">Run a pipeline first.</p>}

        <div className="space-y-2">
          {entries.map(([slug, company]) => {
            const emails = company.emails || []
            const expanded = slug === selectedCompany

            return (
              <div key={slug}>
                <button
                  type="button"
                  onClick={() => onSelectEmail(slug, emails[0]?.id || '')}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition ${expanded ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/70'}`}
                >
                  <span className="inline-block mr-2">▼</span>
                  <span>{company.company_name || slug}</span>
                  <span className="ml-2 text-xs text-slate-500">({emails.length})</span>
                </button>

                {expanded && (
                  <div className="mt-1 ml-2 space-y-1">
                    {emails.map((email) => (
                      <button
                        key={email.id}
                        type="button"
                        onClick={() => onSelectEmail(slug, email.id)}
                        className={`w-full text-left rounded-md px-3 py-1.5 flex items-center gap-2 text-sm transition ${email.id === selectedEmailId ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-800/60'}`}
                      >
                        <span className={`inline-block h-2 w-2 rounded-full ${STATUS_STYLE[email.status]?.split(' ')[0] || 'bg-slate-500'}`}></span>
                        <span className="truncate flex-1">{email.full_name || email.first_name}</span>
                        <span className="text-xs text-slate-500">{email.title}</span>
                        <span className="text-xs text-slate-500">[{STATUS_LABEL[email.status] || 'Draft'}]</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={onSendAll}
          disabled={approvedPending === 0}
          className="w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          Send All Approved ({approvedPending} emails) →
        </button>
      </div>
    </aside>
  )
}
