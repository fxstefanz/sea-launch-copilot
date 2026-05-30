export type Role = "founder" | "accountant" | "growth"

export type MarketEntryIntake = {
  companyName: string
  brandName: string
  industry: "F&B" | "Retail" | "Services" | "Other"
  originCountry: string
  targetMarket: "Singapore"
  cuisineType?: string
  pricePositioning: "value" | "mid" | "premium"
  businessModel: "dine-in" | "delivery" | "hybrid"
  monthlyBudgetSgd: number
  launchTimelineWeeks: number
  teamSize: number
  hasLocalEntity: boolean
  notes?: string
}

export type ReadinessPillarId =
  | "compliance_tax"
  | "finance_ops"
  | "localization"
  | "tiktok_social_commerce"
  | "execution"

export type ReadinessPillar = {
  id: ReadinessPillarId
  label: string
  score: number
  insight: string
}

export type ChecklistItem = {
  id: string
  category: "Compliance" | "Tax" | "Finance" | "Operations" | "Localization" | "TikTok"
  title: string
  ownerRole: Role
  priority: "P0" | "P1" | "P2"
  evidence?: string
  dueSuggestion?: string
  status: "todo" | "in_progress" | "done" | "blocked"
  linkedRiskIds?: string[]
}

export type RiskItem = {
  id: string
  area: "Regulatory" | "Labelling" | "Tax" | "Entity" | "Content" | "Halal" | "Operations" | "Other"
  risk: string
  impact: "low" | "medium" | "high"
  likelihood: "low" | "medium" | "high"
  mitigation: string
  regulatorySource?: string
  ownerRole: Role
  status: "open" | "watch" | "mitigating" | "closed"
}

export type LocalizationSuggestion = {
  area: "Brand" | "Menu" | "Copy" | "Pricing" | "Operational"
  suggestion: string
  rationale: string
}

export type TikTokAction = {
  phase: "Week0" | "Week1" | "Week2" | "AlwaysOn"
  title: string
  why: string
  ownerRole: Role
  artifacts?: string[]
}

export type MarketEntryAnalysis = {
  generatedAt: string
  readinessScore: number
  pillars: ReadinessPillar[]
  checklist: ChecklistItem[]
  risks: RiskItem[]
  localization: LocalizationSuggestion[]
  tiktokActions: TikTokAction[]
  advisorExport: {
    executiveSummary: string
    keyDecisions: string[]
    appendixNotes?: string[]
  }
}
