import { KABIR } from './_kabir_context.js'

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

function firstNameFromContact(contact) {
  if (contact.first_name && contact.first_name.trim()) return contact.first_name.trim()
  if (contact.full_name && contact.full_name.trim()) {
    return contact.full_name.trim().split(' ')[0]
  }
  return 'there'
}

function buildEmailBody({ firstName, companyName, hook1, hook2, loomLink, deckUrl, resumeLink }) {
  const resumeLine = resumeLink ? `\n📎 Resume: ${resumeLink}` : ''

  return `Hi ${firstName},

This is Kabir — I'm currently an Associate Product Manager at DealShare
(an e-commerce unicorn with $400M in funding). I'm exploring my next role.

Why me?
1. Owned end-to-end Search & Discovery and Customer Support charters at DealShare —
   contributing to $1M+ topline growth and $300K+ in cost savings. Drove key product
   decisions and executive-level alignment.
2. Love building with AI. Shipped a Voice of Customer AI Agent (now used internally
   by Ops & CS teams) and an Expense Tracker Agent — both built 0 to 1.

Why ${companyName}?
1. ${hook1}
2. ${hook2}

P.S. — Attached my resume and a quick 30-sec Loom. Would love to connect.

🎥 Loom: ${loomLink}
📊 Deck: ${deckUrl}${resumeLine}

Best,
Kabir
+91 9310404400 | kabirkhorwaldce@gmail.com`
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { contacts, research, deck_url, loom_link, resume_link } = parseBody(req.body)

  if (!Array.isArray(contacts) || !research || typeof research !== 'object') {
    return res.status(400).json({ error: 'contacts (array) and research (object) are required' })
  }

  const companyName = research.company_name || 'Unknown Company'
  const hook1 = research.personalization_hook_1 || 'I admire what your team is building and would love to contribute.'
  const hook2 = research.personalization_hook_2 || 'My Search/CS/AI execution background maps directly to your product goals.'
  const loomLink = (typeof loom_link === 'string' && loom_link.trim()) || KABIR.loom_link
  const deckUrl = typeof deck_url === 'string' && deck_url.trim() ? deck_url.trim() : 'N/A'
  const resumeLink = typeof resume_link === 'string' && resume_link.trim() ? resume_link.trim() : ''

  const emails = contacts
    .filter((contact) => contact?.email)
    .map((contact) => {
      const firstName = firstNameFromContact(contact)

      return {
        id: crypto.randomUUID(),
        to: contact.email,
        first_name: firstName,
        full_name: contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        title: contact.title || '',
        company: companyName,
        subject: `APM → PM | ${companyName} | Kabir Khorwal`,
        body: buildEmailBody({
          firstName,
          companyName,
          hook1,
          hook2,
          loomLink,
          deckUrl,
          resumeLink
        }),
        deck_url: deckUrl,
        loom_link: loomLink,
        status: 'draft'
      }
    })

  return res.status(200).json({ emails })
}
