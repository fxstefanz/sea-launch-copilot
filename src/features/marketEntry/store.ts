import { create } from "zustand"
import type { ChecklistItem, MarketEntryAnalysis, MarketEntryIntake, RiskItem, Role } from "@shared/marketEntry"
import { analyzeMarketEntry } from "./client"
import { demoIntake, emptyIntake } from "./defaults"

type Status = "idle" | "loading" | "ready" | "error"

type MarketEntryState = {
  activeRole: Role
  intake: MarketEntryIntake
  analysis: MarketEntryAnalysis | null
  status: Status
  error: string | null

  setRole: (role: Role) => void
  setIntake: (patch: Partial<MarketEntryIntake>) => void
  resetIntake: () => void
  fillDemo: () => void

  analyze: () => Promise<void>

  setChecklistStatus: (id: string, status: ChecklistItem["status"]) => void
  setRiskStatus: (id: string, status: RiskItem["status"]) => void
}

export const useMarketEntryStore = create<MarketEntryState>((set, get) => ({
  activeRole: "founder",
  intake: emptyIntake,
  analysis: null,
  status: "idle",
  error: null,

  setRole: (role) => set({ activeRole: role }),
  setIntake: (patch) => set({ intake: { ...get().intake, ...patch } }),
  resetIntake: () => set({ intake: emptyIntake }),
  fillDemo: () => set({ intake: demoIntake }),

  analyze: async () => {
    const intake = get().intake
    set({ status: "loading", error: null })
    try {
      const analysis = await analyzeMarketEntry(intake)
      set({ analysis, status: "ready" })
    } catch (e) {
      const message = e instanceof Error ? e.message : "分析失败，请稍后重试"
      set({ status: "error", error: message })
    }
  },

  setChecklistStatus: (id, status) => {
    const current = get().analysis
    if (!current) return
    set({
      analysis: {
        ...current,
        checklist: current.checklist.map((c) => (c.id === id ? { ...c, status } : c)),
      },
    })
  },

  setRiskStatus: (id, status) => {
    const current = get().analysis
    if (!current) return
    set({
      analysis: {
        ...current,
        risks: current.risks.map((r) => (r.id === id ? { ...r, status } : r)),
      },
    })
  },
}))

