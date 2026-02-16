import Anthropic from '@anthropic-ai/sdk'

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

function extractTextBlocks(response) {
  if (!response?.content || !Array.isArray(response.content)) return ''

  return response.content
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n')
    .trim()
}

function cleanJsonText(text) {
  const withoutCodeFences = text
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .trim()

  const start = withoutCodeFences.indexOf('{')
  const end = withoutCodeFences.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    return withoutCodeFences
  }

  return withoutCodeFences.slice(start, end + 1)
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

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured in Vercel Environment Variables' })
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search'
        }
      ],
      system: "You are a research assistant helping Kabir Khorwal, a Product Manager, prepare personalized cold outreach.\nKabir's background: Search & Discovery PM, Customer Support PM, AI Agent builder at DealShare (e-commerce).\nResearch the given company and return ONLY valid JSON — no prose, no markdown, no backticks.",
      messages: [
        {
          role: 'user',
          content: `Research the company: ${companyName}.\nReturn ONLY this exact JSON structure:\n{\n  \"company_name\": \"official full name\",\n  \"what_they_build\": \"2-3 sentence description of core product\",\n  \"recent_news\": \"most recent notable development, launch, or funding in 2024-2025\",\n  \"product_challenges\": \"likely product growth areas or problems they are solving\",\n  \"kabir_fit_angle\": \"specific explanation of how Kabir's search/CS/AI background fits this company\",\n  \"personalization_hook_1\": \"compelling specific reason Kabir is reaching out — reference a real product, feature, or mission\",\n  \"personalization_hook_2\": \"second hook — connect to a challenge or domain Kabir has directly worked in\"\n}`
        }
      ]
    })

    const responseText = extractTextBlocks(response)
    const jsonText = cleanJsonText(responseText)

    if (!jsonText) {
      return res.status(500).json({
        error: 'Research response did not contain JSON text.',
        raw: response
      })
    }

    const parsed = JSON.parse(jsonText)

    return res.status(200).json(parsed)
  } catch (error) {
    return res.status(500).json({
      error: 'Research generation failed.',
      details: error?.message || 'Unknown error'
    })
  }
}
