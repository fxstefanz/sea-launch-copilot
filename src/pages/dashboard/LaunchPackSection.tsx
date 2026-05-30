import { CalendarDays, Clapperboard, Languages, Megaphone } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { roleLabel } from "@/features/marketEntry/roleMeta"
import { useMarketEntryStore } from "@/features/marketEntry/store"
import type { TikTokAction } from "@shared/marketEntry"

function phaseLabel(phase: TikTokAction["phase"]) {
  if (phase === "Week0") return "Week 0"
  if (phase === "Week1") return "Week 1"
  if (phase === "Week2") return "Week 2"
  return "Always-on"
}

export function LaunchPackSection() {
  const status = useMarketEntryStore((s) => s.status)
  const analysis = useMarketEntryStore((s) => s.analysis)
  const activeRole = useMarketEntryStore((s) => s.activeRole)

  if (status === "loading") {
    return (
      <Card className="overflow-hidden">
        <CardHeader title="Localization & TikTok Launch Pack" subtitle="Localization recommendations + TikTok-first action plan" />
        <CardBody className="space-y-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-44" />
        </CardBody>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="overflow-hidden">
        <CardHeader title="Localization & TikTok Launch Pack" subtitle="Run analysis first to view the action plan" />
        <CardBody>
          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-xs text-[color:var(--muted)]">
            The launch pack generates localization recommendations, content pillars, and a phased TikTok action plan, each tagged with an owner role.
          </div>
        </CardBody>
      </Card>
    )
  }

  const grouped: Record<string, TikTokAction[]> = {}
  for (const a of analysis.tiktokActions) {
    grouped[a.phase] ??= []
    grouped[a.phase].push(a)
  }

  const phases: TikTokAction["phase"][] = ["Week0", "Week1", "Week2", "AlwaysOn"]

  return (
    <Card className="overflow-hidden" id="launch-pack">
      <CardHeader
        title="Localization & TikTok Launch Pack"
        subtitle="Recommendations turned into deliverable actions — content, creatives, distribution & SOPs"
      />
      <CardBody className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-[color:var(--muted)]" />
            <div className="text-sm font-semibold text-[color:var(--fg)]">Localization</div>
            <Badge tone="neutral">SG</Badge>
          </div>

          <div className="space-y-2">
            {analysis.localization.map((x, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{x.area}</Badge>
                  <Badge tone={activeRole === "growth" ? "accent" : "neutral"}>Owner: Growth</Badge>
                </div>
                <div className="mt-2 text-sm font-medium text-[color:var(--fg)]">{x.suggestion}</div>
                <div className="mt-1 text-xs text-[color:var(--muted)]">{x.rationale}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-4 w-4 text-[color:var(--muted)]" />
            <div className="text-sm font-semibold text-[color:var(--fg)]">TikTok-first actions</div>
          </div>

          <div className="space-y-3">
            {phases.map((p) => (
              <div key={p} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {p === "AlwaysOn" ? (
                      <Megaphone className="h-4 w-4 text-[color:var(--muted)]" />
                    ) : (
                      <CalendarDays className="h-4 w-4 text-[color:var(--muted)]" />
                    )}
                    <div className="text-xs font-semibold text-[color:var(--fg)]">{phaseLabel(p)}</div>
                  </div>
                  <Badge tone="neutral">{(grouped[p] ?? []).length} actions</Badge>
                </div>

                <div className="mt-3 space-y-2">
                  {(grouped[p] ?? []).map((a, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={a.ownerRole === activeRole ? "accent" : "neutral"}>{roleLabel(a.ownerRole)}</Badge>
                        {a.artifacts?.length ? <Badge tone="neutral">{a.artifacts.length} prerequisites</Badge> : null}
                      </div>
                      <div className="mt-2 text-sm font-medium text-[color:var(--fg)]">{a.title}</div>
                      <div className="mt-1 text-xs text-[color:var(--muted)]">{a.why}</div>
                      {a.artifacts?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {a.artifacts.map((t) => (
                            <Badge key={t} tone="neutral">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {(grouped[p] ?? []).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] p-3 text-xs text-[color:var(--muted)]">
                      No actions for this phase.
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
