const APOLLO_SEARCH_URL = 'https://api.apollo.io/v1/mixed_people/search'

const TARGET_TITLES = [
  'VP of Product',
  'Vice President of Product',
  'Director of Product',
  'Head of Product',
  'Senior Product Manager',
  'Product Manager',
  'Talent Acquisition',
  'Recruiter',
  'HR Manager',
  'People Operations'
]

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

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { company_name } = parseBody(req.body)
  const companyName = typeof company_name === 'string' ? company_name.trim() : ''

  if (!companyName) {
    return res.status(400).json({ error: 'company_name is required' })
  }

  if (!process.env.APOLLO_API_KEY) {
    return res.status(500).json({ error: 'APOLLO_API_KEY is not configured in Vercel Environment Variables' })
  }

  try {
    const apolloResponse = await fetch(APOLLO_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.APOLLO_API_KEY
      },
      body: JSON.stringify({
        organization_name: companyName,
        person_titles: TARGET_TITLES,
        contact_email_status: ['verified', 'likely to engage'],
        per_page: 10
      })
    })

    if (apolloResponse.status === 401) {
      return res.status(401).json({ error: 'Apollo authentication failed (401). Check APOLLO_API_KEY.' })
    }

    if (apolloResponse.status === 429) {
      return res.status(429).json({ error: 'Apollo rate limit reached (429). Retry in a minute.' })
    }

    if (!apolloResponse.ok) {
      const errorText = await apolloResponse.text()
      return res.status(500).json({
        error: `Apollo request failed (${apolloResponse.status}).`,
        details: errorText || 'No response body from Apollo.'
      })
    }

    const data = await apolloResponse.json()
    const rawContacts = Array.isArray(data.people)
      ? data.people
      : Array.isArray(data.contacts)
        ? data.contacts
        : []

    if (rawContacts.length === 0) {
      return res.status(200).json({
        contacts: [],
        total: 0,
        error: `No contacts found for "${companyName}". Try a broader company name.`
      })
    }

    const contacts = rawContacts
      .map((person) => {
        const firstName = person.first_name || ''
        const lastName = person.last_name || ''

        return {
          id: crypto.randomUUID(),
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          title: person.title || '',
          email: person.email || '',
          company: person.organization?.name || companyName,
          linkedin_url: person.linkedin_url || ''
        }
      })
      .filter((contact) => contact.email)

    if (contacts.length === 0) {
      return res.status(200).json({
        contacts: [],
        total: 0,
        error: `Apollo returned people for "${companyName}" but no verified email contacts.`
      })
    }

    return res.status(200).json({ contacts, total: contacts.length })
  } catch (error) {
    return res.status(500).json({
      error: 'Unexpected Apollo proxy error.',
      details: error?.message || 'Unknown error'
    })
  }
}
