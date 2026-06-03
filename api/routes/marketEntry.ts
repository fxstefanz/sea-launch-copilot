import express, { type Request, type Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { getMockMarketEntryAnalysis } from '../../shared/marketEntry.mock.js'
import type { MarketEntryIntake, MarketEntryAnalysis, Role } from '../../shared/marketEntry.js'

const router = express.Router()

// ── Partner API (primary) ──────────────────────────────────────────────

function getPartnerApiBase() {
  return process.env.PARTNER_API_URL || 'http://localhost:8000'
}

/** Convert our intake form to partner's request format */
function toPartnerRequest(intake: MarketEntryIntake) {
  return {
    brand_name: intake.brandName || intake.companyName,
    origin_country: intake.originCountry || 'China',
    target_market: intake.targetMarket,
    business_type: `CPG condiment brand (${intake.cuisineType || 'bottled chili sauce'})`,
    products_services: [
      `Bottled ${intake.cuisineType || 'chili sauce'} (shelf-stable)`,
    ],
    entry_mode: intake.businessModel === 'delivery'
      ? 'processed packaged food import + e-commerce'
      : 'processed packaged food import + TikTok/social commerce',
    user_role: 'founder',
    timeline_horizon_months: Math.ceil((intake.launchTimelineWeeks || 8) / 4),
    budget_band: intake.monthlyBudgetSgd >= 50000 ? 'premium' : intake.monthlyBudgetSgd >= 20000 ? 'standard' : 'lean',
    constraints: [
      ...(!intake.hasLocalEntity ? ['no local entity yet'] : []),
      'need fast validation',
      'avoid risky health claims in ads',
      ...(intake.notes ? [intake.notes] : []),
    ],
  }
}

/** Map partner owner strings to our Role type */
function mapOwnerRole(owner: string): Role {
  const lower = (owner || '').toLowerCase()
  if (lower.includes('account') || lower.includes('finance') || lower.includes('tax')) return 'accountant'
  if (lower.includes('local') || lower.includes('growth') || lower.includes('content') || lower.includes('marketing')) return 'growth'
  return 'founder'
}

/** Convert partner API response (MarketEntryReport) to our MarketEntryAnalysis format */
function adaptPartnerResponse(partnerData: any): MarketEntryAnalysis {
  const baseScore = Math.round(partnerData.readiness_score ?? 50)
  const riskRegister: any[] = partnerData.risk_register || []
  const complianceChecklist: any[] = partnerData.compliance_checklist || []
  const taxChecklist: any[] = partnerData.tax_and_accounting_checklist || []
  const locRecs: any[] = partnerData.localization_recommendations || []
  const tiktokSuggs: any[] = partnerData.tiktok_social_commerce_launch_suggestions || []
  const citations: any[] = partnerData.citations || []
  const executiveSummary: string = partnerData.executive_summary || ''
  const advisorMemo: string = partnerData.advisor_ready_memo || ''

  // Build risk items
  const riskItems: MarketEntryAnalysis['risks'] = riskRegister.map((r: any, idx: number) => ({
    id: `r${idx + 1}`,
    area: mapRiskArea(r.area),
    risk: r.issue || '',
    impact: mapLevel(r.risk_level),
    likelihood: mapLevel(r.risk_level),
    mitigation: r.next_action || '',
    regulatorySource: r.evidence || '',
    ownerRole: mapOwnerRole(r.owner),
    status: 'open' as const,
  }))

  const highCount = riskRegister.filter((r: any) => r.risk_level === 'high').length

  // Build checklist from compliance + tax checklists
  const checklist: MarketEntryAnalysis['checklist'] = []
  const mapChecklistItem = (item: any, idx: number, category: string) => ({
    id: `c${checklist.length + idx + 1}`,
    category: category as any,
    title: item.item || '',
    ownerRole: mapOwnerRole(item.suggested_owner),
    priority: (item.priority || 'P1') as 'P0' | 'P1' | 'P2',
    evidence: (item.evidence_needed || []).join('; ') || undefined,
    dueSuggestion: item.suggested_timing || '',
    status: 'todo' as const,
    linkedRiskIds: [] as string[],
  })

  complianceChecklist.forEach((item: any, idx: number) => {
    checklist.push(mapChecklistItem(item, idx, 'Compliance'))
  })
  taxChecklist.forEach((item: any, idx: number) => {
    checklist.push(mapChecklistItem(item, idx, 'Tax'))
  })

  // Build localization
  const localization: MarketEntryAnalysis['localization'] = locRecs.map((r: any) => ({
    area: mapLocArea(r.area),
    suggestion: r.recommendation || '',
    rationale: r.rationale || '',
  }))

  // Build TikTok actions
  const phaseLabels = ['Week0', 'Week1', 'Week2', 'AlwaysOn'] as const
  const tiktokActions: MarketEntryAnalysis['tiktokActions'] = tiktokSuggs.map((s: any, idx: number) => ({
    phase: phaseLabels[Math.min(idx, phaseLabels.length - 1)],
    title: s.suggestion || '',
    why: s.why_it_helps || '',
    ownerRole: 'growth' as const,
    artifacts: s.prerequisite ? [s.prerequisite] : [],
  }))

  // Pillar scores derived from risk distribution
  const areaRisks = (keywords: string[]) => riskRegister.filter((r: any) =>
    keywords.some(k => (r.area || '').toLowerCase().includes(k.toLowerCase()))
  )
  const pillarScore = (keywords: string[]) => {
    const relevant = areaRisks(keywords)
    if (relevant.length === 0) return Math.min(baseScore + 15, 80)
    const highRatio = relevant.filter((r: any) => r.risk_level === 'high').length / relevant.length
    return Math.round(Math.max(20, (1 - highRatio * 0.6) * 75))
  }

  return {
    generatedAt: partnerData.generated_at || new Date().toISOString(),
    readinessScore: baseScore,
    pillars: [
      {
        id: 'compliance_tax',
        label: 'Compliance & Tax',
        score: pillarScore(['import', 'registration', 'label', 'claim', 'compliance']),
        insight: `${complianceChecklist.length} compliance tasks open, ${areaRisks(['label', 'import', 'registration']).length} related risks identified.`,
      },
      {
        id: 'finance_ops',
        label: 'Finance & Operations',
        score: pillarScore(['tax', 'bookkeeping', 'accounting']),
        insight: `${taxChecklist.length} tax and finance tasks to complete.`,
      },
      {
        id: 'localization',
        label: 'Localization',
        score: Math.min(baseScore + 10, 75),
        insight: `${locRecs.length} localization recommendations generated.`,
      },
      {
        id: 'tiktok_social_commerce',
        label: 'TikTok / Social Commerce',
        score: pillarScore(['marketing', 'brand', 'tiktok', 'content']),
        insight: `${tiktokSuggs.length} TikTok launch actions — establish a content compliance playbook.`,
      },
      {
        id: 'execution',
        label: 'Execution Readiness',
        score: Math.round(baseScore * 0.95),
        insight: `${highCount} high-risk items to resolve — prioritize blockers first.`,
      },
    ],
    checklist,
    risks: riskItems,
    localization,
    tiktokActions,
    advisorExport: {
      executiveSummary: executiveSummary || getMockMarketEntryAnalysis().advisorExport.executiveSummary,
      keyDecisions: [
        'Import pathway: apply for SFA permit directly vs use a local distributor / IOR',
        'GST registration strategy and customs duty valuation model',
        'Full label overhaul: English, allergens, nutrition claim compliance',
        'TikTok content compliance playbook and review process',
        'Data privacy (PDPA) compliance strategy',
      ],
      appendixNotes: [
        `Source: SEA Launch Copilot RAG Pipeline (${partnerData.report_version || 'demo'})`,
        ...citations.map((c: any) => `[${c.id}] ${c.title}${c.url ? ' - ' + c.url : ''}`),
        partnerData.disclaimer || '',
      ].filter(Boolean),
    },
  }
}

function mapRiskArea(area: string): any {
  const lower = (area || '').toLowerCase()
  if (lower.includes('label') || lower.includes('claim') || lower.includes('nutrition')) return 'Labelling'
  if (lower.includes('import') || lower.includes('registration') || lower.includes('clearance') || lower.includes('regulatory') || lower.includes('compliance') || lower.includes('sfa')) return 'Regulatory'
  if (lower.includes('tax') || lower.includes('gst') || lower.includes('bookkeep') || lower.includes('accounting')) return 'Tax'
  if (lower.includes('entity') || lower.includes('company') || lower.includes('corppass')) return 'Entity'
  if (lower.includes('content') || lower.includes('marketing') || lower.includes('brand') || lower.includes('tiktok') || lower.includes('ad')) return 'Content'
  if (lower.includes('halal')) return 'Halal'
  if (lower.includes('privacy') || lower.includes('pdpa') || lower.includes('data')) return 'Operations'
  if (lower.includes('operation') || lower.includes('traceab') || lower.includes('recall')) return 'Operations'
  return 'Other'
}

function mapLocArea(area: string): 'Brand' | 'Menu' | 'Copy' | 'Pricing' | 'Operational' {
  const lower = (area || '').toLowerCase()
  if (lower.includes('brand') || lower.includes('position')) return 'Brand'
  if (lower.includes('menu') || lower.includes('product')) return 'Menu'
  if (lower.includes('copy') || lower.includes('label') || lower.includes('language')) return 'Copy'
  if (lower.includes('pric') || lower.includes('trial') || lower.includes('pack')) return 'Pricing'
  return 'Operational'
}

function mapLevel(level: string): 'low' | 'medium' | 'high' {
  const l = (level || '').toLowerCase()
  if (l === 'high') return 'high'
  if (l === 'medium') return 'medium'
  return 'low'
}

function mapRiskStatus(status: string): 'open' | 'watch' | 'mitigating' | 'closed' {
  const s = (status || '').toLowerCase()
  if (s.includes('action')) return 'open'
  if (s.includes('verify')) return 'watch'
  if (s.includes('low') || s.includes('monitor')) return 'watch'
  if (s.includes('mitigat')) return 'mitigating'
  if (s.includes('closed') || s.includes('resolved')) return 'closed'
  return 'open'
}


async function analyzeWithPartnerAPI(intake: MarketEntryIntake): Promise<MarketEntryAnalysis> {
  const partnerReq = toPartnerRequest(intake)
  const apiBase = getPartnerApiBase()
  console.log('[market-entry] Calling partner API:', apiBase)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(`${apiBase}/v1/market-entry-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnerReq),
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Partner API error ${res.status}: ${text}`)
    }

    const data = await res.json()
    console.log('[market-entry] Partner API response received, adapting...')
    return adaptPartnerResponse(data)
  } finally {
    clearTimeout(timeout)
  }
}

// ── Claude API (secondary) ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert market entry consultant specializing in helping Chinese F&B/FMCG brands enter the Singapore market via TikTok-first strategies.

You will receive a brand's intake form data. Based on this, generate a comprehensive market entry analysis in JSON format.

Your response MUST be a valid JSON object (no markdown, no code fences) matching this exact TypeScript type:

{
  "generatedAt": string (ISO date),
  "readinessScore": number (0-100, overall readiness),
  "pillars": [
    { "id": "compliance_tax" | "finance_ops" | "localization" | "tiktok_social_commerce" | "execution", "label": string, "score": number (0-100), "insight": string }
  ] (exactly 5 pillars),
  "checklist": [
    { "id": string, "category": "Compliance" | "Tax" | "Finance" | "Operations" | "Localization" | "TikTok", "title": string, "ownerRole": "founder" | "accountant" | "growth", "priority": "P0" | "P1" | "P2", "evidence": string, "dueSuggestion": string, "status": "todo", "linkedRiskIds": string[] }
  ] (8-12 items, distributed across roles),
  "risks": [
    { "id": string (r1, r2...), "area": "Regulatory" | "Labelling" | "Tax" | "Entity" | "Content" | "Halal" | "Operations" | "Other", "risk": string, "impact": "low" | "medium" | "high", "likelihood": "low" | "medium" | "high", "mitigation": string, "regulatorySource": string (specific regulation/agency name), "ownerRole": "founder" | "accountant" | "growth", "status": "open" }
  ] (8-10 risks, each with specific Singapore regulatory source),
  "localization": [
    { "area": "Brand" | "Menu" | "Copy" | "Pricing" | "Operational", "suggestion": string, "rationale": string }
  ] (4-6 suggestions),
  "tiktokActions": [
    { "phase": "Week0" | "Week1" | "Week2" | "AlwaysOn", "title": string, "why": string, "ownerRole": "founder" | "accountant" | "growth", "artifacts": string[] }
  ] (6-8 actions),
  "advisorExport": {
    "executiveSummary": string (2-3 sentences),
    "keyDecisions": string[] (4-6 items),
    "appendixNotes": string[]
  }
}

Important guidelines:
- All text content should be in Chinese (Simplified), except for English brand names and technical terms
- Focus specifically on the Singapore market regulations (SFA, GST, ACRA, MOM)
- For food products: emphasize SFA import permits, labeling requirements, ingredient compliance
- Distribute checklist items and risks across all three roles (founder, accountant, growth)
- TikTok actions should be practical and specific to the product
- The readiness score should realistically reflect the brand's preparation level based on their inputs
- If hasLocalEntity is false, score compliance lower and add entity setup to checklist
- Consider the budget, timeline, and team size when scoring execution readiness`

async function analyzeWithClaude(intake: MarketEntryIntake): Promise<MarketEntryAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const client = new Anthropic({ apiKey })

  const userMessage = `Please analyze this market entry intake and generate the JSON analysis:

${JSON.stringify(intake, null, 2)}

Respond with ONLY the JSON object, no other text.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  let jsonStr = textBlock.text.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const analysis = JSON.parse(jsonStr) as MarketEntryAnalysis
  return analysis
}

// ── Route: cascading fallback ──────────────────────────────────────────
// Priority: Partner API → Claude API → Mock data

router.post('/analyze-market-entry', async (req: Request, res: Response) => {
  const intake = req.body as MarketEntryIntake

  // 1. Try partner API first
  try {
    const analysis = await analyzeWithPartnerAPI(intake)
    console.log('[market-entry] Partner API success, readiness:', analysis.readinessScore)
    res.status(200).json(analysis)
    return
  } catch (err: any) {
    console.warn('[market-entry] Partner API unavailable:', err.message)
  }

  // 2. Try Claude API
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('[market-entry] Falling back to Claude API...')
      const analysis = await analyzeWithClaude(intake)
      console.log('[market-entry] Claude API success, readiness:', analysis.readinessScore)
      res.status(200).json(analysis)
      return
    } catch (err: any) {
      console.error('[market-entry] Claude API error:', err.message)
    }
  }

  // 3. Fall back to mock
  console.log('[market-entry] Using mock data')
  const analysis = getMockMarketEntryAnalysis()
  res.status(200).json(analysis)
})

export default router
