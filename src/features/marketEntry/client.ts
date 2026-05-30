import type { MarketEntryAnalysis, MarketEntryIntake } from "@shared/marketEntry"
import { getMockMarketEntryAnalysis } from "@shared/marketEntry.mock"

type DataMode = "mock" | "api"

function getMode(): DataMode {
  const fromEnv = (import.meta.env.VITE_DATA_MODE as DataMode | undefined) ?? "api"
  return fromEnv === "api" ? "api" : "mock"
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function analyzeMarketEntry(intake: MarketEntryIntake): Promise<MarketEntryAnalysis> {
  if (getMode() === "mock") {
    await delay(900)
    return getMockMarketEntryAnalysis()
  }

  const res = await fetch("/api/analyze-market-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intake),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed (${res.status})`)
  }

  return (await res.json()) as MarketEntryAnalysis
}
