// Simple localStorage-backed store
// Keys:
//   'pipeline_data' → { [company_slug]: { contacts, research, deck_url, emails } }
//   'gmail_tokens'  → { access_token, refresh_token, expiry_date }
//   'settings'      → { resume_link: string, loom_link: string }

export function getStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

export function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function updateCompanyData(company_slug, updates) {
  const all = getStore('pipeline_data') || {}
  all[company_slug] = { ...(all[company_slug] || {}), ...updates }
  setStore('pipeline_data', all)
}

export function getAllCompanies() {
  return getStore('pipeline_data') || {}
}

export function updateEmail(company_slug, emailId, updates) {
  const all = getStore('pipeline_data') || {}
  const company = all[company_slug]
  if (!company || !Array.isArray(company.emails)) return

  company.emails = company.emails.map((email) => {
    if (email.id !== emailId) return email
    return { ...email, ...updates }
  })

  all[company_slug] = company
  setStore('pipeline_data', all)
}

export function slugify(companyName) {
  return companyName.toLowerCase().replace(/\s+/g, '_')
}
