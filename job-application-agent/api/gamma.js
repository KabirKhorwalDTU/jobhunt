import Anthropic from '@anthropic-ai/sdk'
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

function extractGammaUrl(payload) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload)
  const match = text.match(/https:\/\/gamma\.app\/[^\s"'<>\\\]]+/i)
  return match ? match[0] : ''
}

function buildPrompt(companyName, research, loomLink, resumeLink) {
  const fitAngle = research?.kabir_fit_angle || ''
  const hook1 = research?.personalization_hook_1 || ''
  const hook2 = research?.personalization_hook_2 || ''
  const slideResumeLine = resumeLink ? `• 📎 Resume: ${resumeLink}` : '• Resume attached'

  return `Create a 2-slide professional presentation using Gamma with these exact slides:

SLIDE 1 — Title: 'Kabir Khorwal — Product Manager'
Content:
• Associate PM at DealShare — E-commerce Unicorn ($400M funded)
• Search & Discovery: Add-to-Bag 32%→46% | $1M+ topline uplift
• Customer Support: Tickets cut 80% (3000→600) | $300K+ cost savings
• Built & shipped 2 AI Agents — Voice of Customer + Expense Tracker (0 to 1)
• B.Tech CSE, Delhi Technological University

SLIDE 2 — Title: 'What I'd bring to ${companyName}'
Content:
• ${fitAngle}
• ${hook1}
• ${hook2}
• 🎥 Loom: ${loomLink}
${slideResumeLine}

Style: Clean, dark navy, minimal, professional. No clipart.`
}

async function createWithMcpServers(client, payload, gammaApiKey) {
  const mcpServer = {
    type: 'url',
    url: 'https://mcp.gamma.app/mcp',
    name: 'gamma'
  }

  if (gammaApiKey) {
    mcpServer.authorization_token = gammaApiKey
  }

  return client.messages.create({
    ...payload,
    mcp_servers: [mcpServer]
  })
}

async function createWithLegacyMcpTool(client, payload, gammaApiKey) {
  const tool = {
    type: 'mcp',
    server_label: 'gamma',
    server_url: 'https://mcp.gamma.app/mcp',
    require_approval: 'never'
  }

  if (gammaApiKey) {
    tool.authorization_token = gammaApiKey
  }

  return client.messages.create({
    ...payload,
    tools: [tool]
  })
}

export default async function handler(req, res) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { company_name, research, loom_link, resume_link } = parseBody(req.body)
  const companyName = typeof company_name === 'string' ? company_name.trim() : ''

  if (!companyName || !research || typeof research !== 'object') {
    return res.status(400).json({ error: 'company_name and research are required' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured in Vercel Environment Variables' })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const loomLink = (typeof loom_link === 'string' && loom_link.trim()) || KABIR.loom_link
  const prompt = buildPrompt(companyName, research, loomLink, typeof resume_link === 'string' ? resume_link.trim() : '')

  const requestPayload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: 'You are generating a professional 2-slide presentation for Kabir Khorwal using Gamma. Use the Gamma MCP generate tool to create the deck. Return only the shareable URL.',
    messages: [{ role: 'user', content: prompt }]
  }

  try {
    let response
    try {
      response = await createWithMcpServers(anthropic, requestPayload, process.env.GAMMA_API_KEY)
    } catch {
      response = await createWithLegacyMcpTool(anthropic, requestPayload, process.env.GAMMA_API_KEY)
    }

    const deckUrl = extractGammaUrl(response)

    if (!deckUrl) {
      return res.status(500).json({
        error: 'Gamma deck generation completed but no shareable gamma.app URL was returned.',
        raw: response
      })
    }

    return res.status(200).json({ deck_url: deckUrl })
  } catch (error) {
    return res.status(500).json({
      error: 'Gamma generation failed.',
      details: error?.message || 'Unknown error'
    })
  }
}
