import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { roleLabel } from "@/features/marketEntry/roleMeta"
import { useMarketEntryStore } from "@/features/marketEntry/store"
import type { ChecklistItem, ReadinessPillarId, Role } from "@shared/marketEntry"

function scoreTone(score: number) {
  if (score >= 80) return "success"
  if (score >= 65) return "accent"
  if (score >= 50) return "warn"
  return "danger"
}

function scoreColor(score: number) {
  if (score >= 80) return "var(--success)"
  if (score >= 65) return "var(--accent)"
  if (score >= 50) return "var(--warn)"
  return "var(--danger)"
}

function scoreLabel(score: number) {
  if (score >= 80) return "Ready"
  if (score >= 65) return "On track"
  if (score >= 50) return "Needs work"
  return "High risk"
}

function nextActionCandidates(list: ChecklistItem[]) {
  const weight = (p: ChecklistItem["priority"]) => (p === "P0" ? 0 : p === "P1" ? 1 : 2)
  return [...list]
    .filter((x) => x.status !== "done")
    .sort((a, b) => weight(a.priority) - weight(b.priority))
}

/** SVG circular progress ring */
function ScoreRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = scoreColor(score)

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-2xl font-bold leading-none tracking-tight" style={{ color }}>
          {score}
        </div>
        <div className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-[color:var(--muted)]">
          / 100
        </div>
      </div>
    </div>
  )
}

/** Each role sees different pillars highlighted */
const rolePillars: Record<Role, ReadinessPillarId[]> = {
  founder: ["compliance_tax", "finance_ops", "localization", "tiktok_social_commerce", "execution"],
  accountant: ["compliance_tax", "finance_ops", "execution"],
  growth: ["localization", "tiktok_social_commerce", "execution"],
}

const roleDescriptions: Record<Role, string> = {
  founder: "Full overview — key decisions & delivery progress",
  accountant: "Compliance, tax & financial risk",
  growth: "Localization & TikTok social commerce",
}

export function ReadinessSummary() {
  const status = useMarketEntryStore((s) => s.status)
  const error = useMarketEntryStore((s) => s.error)
  const analysis = useMarketEntryStore((s) => s.analysis)
  const activeRole = useMarketEntryStore((s) => s.activeRole)

  if (status === "loading") {
    return (
      <Card className="overflow-hidden border-2 border-[color:var(--accent)] bg-gradient-to-b from-[color:color-mix(in_oklab,var(--accent)_22%,var(--surface))] to-[color:var(--surface)] shadow-[0_4px_28px_color-mix(in_oklab,var(--accent)_25%,transparent)]">
        <CardHeader title="AI Readiness Dashboard" subtitle="Generating: score, checklist, risk register & action plan" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-28" />
          <Skeleton className="h-20" />
        </CardBody>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="overflow-hidden border-2 border-[color:var(--accent)] bg-gradient-to-b from-[color:color-mix(in_oklab,var(--accent)_22%,var(--surface))] to-[color:var(--surface)] shadow-[0_4px_28px_color-mix(in_oklab,var(--accent)_25%,transparent)]">
        <CardHeader title="AI Readiness Dashboard" subtitle="Request failed — please try again" />
        <CardBody>
          <div className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--warn-strong)]" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-[color:var(--fg)]">Analysis failed</div>
              <div className="mt-1 text-xs text-[color:var(--muted)]">{error ?? "Unknown error"}</div>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="overflow-hidden border-2 border-[color:var(--accent)] bg-gradient-to-b from-[color:color-mix(in_oklab,var(--accent)_22%,var(--surface))] to-[color:var(--surface)] shadow-[0_4px_28px_color-mix(in_oklab,var(--accent)_25%,transparent)]">
        <CardHeader title="AI Readiness Dashboard" subtitle="Click Analyze Market Entry to generate your report" />
        <CardBody className="space-y-4">
          <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-8 text-center">
            <div className="text-sm font-medium text-[color:var(--fg)]">Waiting for analysis</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">
              Fill in the form and click "Analyze Market Entry" to get started.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32" />
        </CardBody>
      </Card>
    )
  }

  const visiblePillarIds = rolePillars[activeRole]
  const visiblePillars = analysis.pillars.filter((p) => visiblePillarIds.includes(p.id))

  const nextActions = nextActionCandidates(
    analysis.checklist.filter((c) => c.ownerRole === activeRole),
  ).slice(0, 3)

  const myTotal = analysis.checklist.filter((c) => c.ownerRole === activeRole).length
  const myCompleted = analysis.checklist.filter((c) => c.ownerRole === activeRole && c.status === "done").length

  return (
    <Card className="overflow-hidden border-2 border-[color:var(--accent)] bg-gradient-to-b from-[color:color-mix(in_oklab,var(--accent)_22%,var(--surface))] to-[color:var(--surface)] shadow-[0_4px_28px_color-mix(in_oklab,var(--accent)_25%,transparent)]">
      <CardHeader
        title={`${roleLabel(activeRole)} Dashboard`}
        subtitle={`${roleDescriptions[activeRole]} — my tasks ${myCompleted}/${myTotal}`}
      />
      <CardBody className="space-y-5">
        {/* Score + Role */}
        <div className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
          <ScoreRing score={analysis.readinessScore} />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">Readiness Score</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={scoreTone(analysis.readinessScore) as any}>
                {scoreLabel(analysis.readinessScore)}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-[color:var(--muted)]">Singapore market readiness</div>
            <div className="mt-2 rounded-lg border border-[color:color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--accent)_8%,transparent)] px-3 py-1.5">
              <div className="text-[11px] font-medium text-[color:var(--accent-strong)]">{roleLabel(activeRole)} view</div>
            </div>
          </div>
        </div>

        {/* Role-specific pillars */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
              {activeRole === "founder" ? "All dimensions" : "Relevant dimensions"}
            </div>
            <div className="text-[10px] text-[color:var(--muted)]">0 – 100</div>
          </div>
          <div className="space-y-2">
            {visiblePillars.map((p) => {
              const color = scoreColor(p.score)
              const pct = Math.max(4, Math.min(100, p.score))
              return (
                <div key={p.id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[color:var(--fg)]">{p.label}</div>
                    </div>
                    <div className="shrink-0 text-sm font-bold" style={{ color }}>{p.score}</div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] leading-snug text-[color:var(--muted)]">{p.insight}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Next actions for this role */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">Priority actions</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("checklist")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            {nextActions.length ? (
              nextActions.map((x) => (
                <div key={x.id} className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-xs font-medium text-[color:var(--fg)]">{x.title}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone={x.priority === "P0" ? "danger" : x.priority === "P1" ? "warn" : "neutral"}>
                        {x.priority}
                      </Badge>
                      <Badge tone="neutral">{x.category}</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-center text-xs text-[color:var(--muted)]">
                No open items for this role — or all completed.
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
