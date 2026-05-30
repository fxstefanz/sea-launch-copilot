import { TopBar } from "@/pages/dashboard/TopBar"
import { ChecklistSection } from "@/pages/dashboard/ChecklistSection"
import { ExportPreviewSection } from "@/pages/dashboard/ExportPreviewSection"
import { IntakeForm } from "@/pages/dashboard/IntakeForm"
import { LaunchPackSection } from "@/pages/dashboard/LaunchPackSection"
import { ReadinessSummary } from "@/pages/dashboard/ReadinessSummary"
import { RiskSection } from "@/pages/dashboard/RiskSection"
import { useMarketEntryStore } from "@/features/marketEntry/store"
import { roleMeta } from "@/features/marketEntry/roleMeta"

export default function Home() {
  const activeRole = useMarketEntryStore((s) => s.activeRole)
  const analysis = useMarketEntryStore((s) => s.analysis)

  return (
    <div className="min-h-dvh bg-[color:var(--bg)] text-[color:var(--fg)]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1400px_circle_at_15%_0%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_50%),radial-gradient(800px_circle_at_85%_5%,color-mix(in_oklab,var(--warn)_16%,transparent),transparent_55%),radial-gradient(600px_circle_at_50%_80%,color-mix(in_oklab,var(--accent)_8%,transparent),transparent_60%)]" />
      </div>

      <TopBar />

      {/* Role context banner */}
      {analysis && (
        <div className="border-b border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--accent)_8%,transparent)]">
          <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            <span className="text-xs font-medium text-[color:var(--fg)]">
              {roleMeta[activeRole].label} view
            </span>
            <span className="text-xs text-[color:var(--muted)]">
              {activeRole === "founder" && "— full overview, key decisions & advisor export"}
              {activeRole === "accountant" && "— tax compliance, financial modeling & funding risk"}
              {activeRole === "growth" && "— localization, TikTok content & growth actions"}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-6">
        {/* Intake + Readiness always visible */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <IntakeForm />
          </div>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[92px]">
              <ReadinessSummary />
            </div>
          </div>
        </div>

        {/* Role-specific content sections */}
        {analysis && (
          <div className="mt-6 space-y-4">
            {activeRole === "founder" && <FounderView />}
            {activeRole === "accountant" && <AccountantView />}
            {activeRole === "growth" && <GrowthView />}
          </div>
        )}
      </div>
    </div>
  )
}

/** Founder: 总览全局 — Checklist（全部）+ Risk + Export */
function FounderView() {
  return (
    <>
      <ChecklistSection />
      <RiskSection />
      <ExportPreviewSection />
    </>
  )
}

/** Accountant: 税务与财务 — Checklist（Tax/Finance/Compliance）+ Risk */
function AccountantView() {
  return (
    <>
      <ChecklistSection />
      <RiskSection />
    </>
  )
}

/** Growth/Localization: 在地化与增长 — Launch Pack + Checklist（Localization/TikTok） */
function GrowthView() {
  return (
    <>
      <LaunchPackSection />
      <ChecklistSection />
    </>
  )
}
