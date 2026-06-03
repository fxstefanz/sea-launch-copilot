import type { ReactNode } from "react"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { roleLabel } from "@/features/marketEntry/roleMeta"
import { useMarketEntryStore } from "@/features/marketEntry/store"

export default function Export() {
  const intake = useMarketEntryStore((s) => s.intake)
  const analysis = useMarketEntryStore((s) => s.analysis)

  const dateLabel = useMemo(() => {
    if (!analysis?.generatedAt) return ""
    return new Date(analysis.generatedAt).toLocaleString()
  }, [analysis?.generatedAt])

  if (!analysis) {
    return (
      <div className="min-h-dvh bg-[color:var(--bg)] px-4 py-10 text-[color:var(--fg)]">
        <div className="mx-auto max-w-[960px]">
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <div className="text-sm font-semibold">No analysis available to export yet</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">Go back to the workspace and run Analyze Market Entry first.</div>
            <div className="mt-4">
              <Link to="/">
                <Button variant="primary">
                  <ArrowLeft className="h-4 w-4" />
                  Back to workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[color:var(--bg)] px-4 py-6 text-[color:var(--fg)] print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex max-w-[960px] items-center justify-between gap-4 print:hidden">
        <Link to="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      <div className="mx-auto mt-4 max-w-[960px] rounded-xl border border-[color:var(--border)] bg-white p-6 text-black shadow-sm print:mt-0 print:max-w-none print:rounded-none print:border-none print:shadow-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl font-semibold tracking-tight">Advisor-ready Market Entry Pack</div>
            <div className="mt-1 text-sm text-zinc-600">SEA Launch Copilot • Singapore • TikTok-first</div>
          </div>
          <div className="text-right text-xs text-zinc-600">
            <div>{dateLabel}</div>
            <div className="mt-2">
              <Badge tone="neutral">Readiness {analysis.readinessScore}</Badge>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-[11px] text-zinc-600">Company</div>
            <div className="mt-1 text-sm font-medium">{intake.companyName || "—"}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-[11px] text-zinc-600">Brand</div>
            <div className="mt-1 text-sm font-medium">{intake.brandName || "—"}</div>
          </div>
        </div>

        <Section title="Executive summary">
          <div className="text-sm leading-6 text-zinc-900">{analysis.advisorExport.executiveSummary}</div>
        </Section>

        <Section title="Readiness pillars">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {analysis.pillars.map((p) => (
              <div key={p.id} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="text-sm font-semibold">{p.score}</div>
                </div>
                <div className="mt-2 text-xs text-zinc-700">{p.insight}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Key decisions">
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-900">
            {analysis.advisorExport.keyDecisions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Section>

        <Section title="Checklist (top items)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-[11px] text-zinc-600">
                  <th className="border-b border-zinc-200 pb-2 pr-3 font-medium">Task</th>
                  <th className="border-b border-zinc-200 pb-2 pr-3 font-medium">Category</th>
                  <th className="border-b border-zinc-200 pb-2 pr-3 font-medium">Owner</th>
                  <th className="border-b border-zinc-200 pb-2 pr-3 font-medium">Priority</th>
                  <th className="border-b border-zinc-200 pb-2 font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {analysis.checklist.slice(0, 10).map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="border-b border-zinc-100 py-3 pr-3">
                      <div className="font-medium">{c.title}</div>
                      {c.dueSuggestion ? <div className="mt-1 text-[11px] text-zinc-600">{c.dueSuggestion}</div> : null}
                    </td>
                    <td className="border-b border-zinc-100 py-3 pr-3">{c.category}</td>
                    <td className="border-b border-zinc-100 py-3 pr-3">{roleLabel(c.ownerRole)}</td>
                    <td className="border-b border-zinc-100 py-3 pr-3">{c.priority}</td>
                    <td className="border-b border-zinc-100 py-3 text-[11px] text-zinc-700">{c.evidence ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Risk register">
          <div className="space-y-2">
            {analysis.risks.map((r) => (
              <div key={r.id} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">{r.risk}</div>
                  <span className="text-[11px] text-zinc-600">Owner: {roleLabel(r.ownerRole)}</span>
                </div>
                <div className="mt-2 text-xs text-zinc-700">{r.mitigation}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Localization suggestions">
          <div className="space-y-2">
            {analysis.localization.map((x, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 p-3">
                <div className="text-xs font-semibold text-zinc-700">{x.area}</div>
                <div className="mt-1 text-sm font-medium text-zinc-900">{x.suggestion}</div>
                <div className="mt-1 text-xs text-zinc-700">{x.rationale}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="TikTok-first actions">
          <div className="space-y-2">
            {analysis.tiktokActions.map((a, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">{a.title}</div>
                  <span className="text-[11px] text-zinc-600">{a.phase}</span>
                  <span className="text-[11px] text-zinc-600">Owner: {roleLabel(a.ownerRole)}</span>
                </div>
                <div className="mt-2 text-xs text-zinc-700">{a.why}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-700">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  )
}
