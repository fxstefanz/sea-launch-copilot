import express, { type Request, type Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = express.Router()

function getPartnerApiBase() {
  return process.env.PARTNER_API_URL || 'http://localhost:8000'
}

const CHAT_SYSTEM_PROMPT = `You are SEA Launch Copilot, an expert assistant helping SME brands (especially Chinese F&B / chili sauce brands) enter the Singapore market via a TikTok-first strategy.

Answer questions about:
- Singapore regulatory compliance (SFA import permits, food labelling, allergen declarations, preservative limits)
- Tax & accounting (GST registration, customs duty, IRAS rules)
- Entity setup (ACRA registration, local entity vs distributor/IOR)
- Localization & product positioning
- TikTok Shop / social commerce launch and content compliance (HPB/IMDA claim rules)

Guidelines:
- Always answer in English.
- Be concise and practical — give concrete next steps, not generic advice.
- When relevant, name the specific Singapore agency or regulation.
- Keep answers under ~150 words unless the user asks for detail.
- End sensitive regulatory/tax answers with a brief reminder that this is not legal/tax advice.`

/** Try the partner RAG chat endpoint first; returns reply text or null if unavailable. */
async function tryPartnerChat(message: string, contextTitle?: string, brandName?: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(`${getPartnerApiBase()}/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context_title: contextTitle, brand_name: brandName }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!response.ok) return null
    const data: any = await response.json()
    return data.reply ?? data.answer ?? data.text ?? null
  } catch {
    return null
  }
}

/** Fallback: answer with Claude. */
async function chatWithClaude(message: string, contextTitle?: string, brandName?: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const client = new Anthropic({ apiKey })
  const contextLine = [
    brandName ? `Brand: ${brandName}` : null,
    contextTitle ? `Current context: ${contextTitle}` : null,
  ].filter(Boolean).join('\n')

  const userMessage = contextLine ? `${contextLine}\n\nQuestion: ${message}` : message

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: CHAT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from Claude')
  return textBlock.text.trim()
}

router.post('/chat', async (req: Request, res: Response) => {
  const { message, context_title, brand_name } = req.body as {
    message: string
    context_title?: string
    brand_name?: string
  }

  if (!message?.trim()) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  // 1. Try partner RAG chat endpoint
  const partnerReply = await tryPartnerChat(message, context_title, brand_name)
  if (partnerReply) {
    res.status(200).json({ reply: partnerReply })
    return
  }

  // 2. Fall back to Claude
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const reply = await chatWithClaude(message, context_title, brand_name)
      res.status(200).json({ reply })
      return
    } catch (err: any) {
      console.error('[chat] Claude error:', err.message)
    }
  }

  res.status(503).json({
    error: 'Chat service unavailable. Start the RAG backend (port 8000) or set ANTHROPIC_API_KEY.',
  })
})

export default router
