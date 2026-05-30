import { useMemo, useState } from "react"
import { AlertOctagon, Filter } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Select } from "@/components/ui/Field"
import { Skeleton } from "@/components/ui/Skeleton"
import { roleLabel } from "@/features/marketEntry/roleMeta"
import { useMarketEntryStore } from "@/features/marketEntry/store"
import type { RiskItem, Role } from "@shared/marketEntry"

function levelTone(x: "low" | "medium" | "high") {
  if (x === "high") return "danger"
  if (x === "medium") return "warn"
  return "neutral"
}

function statusTone(s: RiskItem["status"]) {
  if (s === "closed") return "success"
  if (s === "mitigating") return "accent"
  if (s === "watch") return "warn"
  return "neutral"
}

const roleSubtitles: Record<Role, string> = {
  founder: "Full risk register — owner & status",
  accountant: "Tax & finance risks",
  growth: "Localization & growth risks",
}

export function RiskSection() {
  const status = useMarketEntryStore((s) => s.status)
  const analysis = useMarketEntryStore((s) => s.analysis)
  const activeRole = useMarketEntryStore((s) => s.activeRole)
  const setRiskStatus = useMarketEntryStore((s) => s.setRiskStatus)
  const [showAll, setShowAll] = useState(false)

  const risks = useMemo(() => {
    const list = analysis?.risks ?? []
    if (activeRole === "founder" || showAll) return list
    return list.filter((r) => r.ownerRole === activeRole)
  }, [analysis, activeRole, showAll])

  if (status === "loading") {
    return (
      <Card className="overflow-hidden">
        <CardHeader title="Risk Register" subtitle="Loading…" />
        <CardBody className="space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-44" />
        </CardBody>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="overflow-hidden">
        <CardHeader title="Risk Register" subtitle="Run analysis first to view the risk register" />
        <CardBody>
          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-xs text-[color:var(--muted)]">
            The risk register identifies each risk's owner and mitigation actions.
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden" id="risks">
      <CardHeader
        title="Risk Register"
        subtitle={roleSubtitles[activeRole]}
        right={
          activeRole !== "founder" ? (
            <div className="flex items-center gap-2">
              <Button
                variant={!showAll ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowAll(false)}
              >
                <Filter className="h-4 w-4" />
                Mine
              </Button>
              <Button
                variant={showAll ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowAll(true)}
              >
                All
              </Button>
            </div>
          ) : undefined
        }
      />
      <CardBody className="space-y-3">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[11px] text-[color:var(--muted)]">
                <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Risk</th>
                <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Area</th>
                <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Impact</th>
                <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Likelihood</th>
                <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Owner</th>
                <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Mitigation</th>
                <th className="border-b border-[color:var(--border)] pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr
                  key={r.id}
                  className={r.ownerRole === activeRole ? "bg-[color:color-mix(in_oklab,var(--accent)_6%,transparent)]" : ""}
                >
                  <td className="border-b border-[color:var(--border)] py-3 pr-3">
                    <div className="flex items-start gap-2">
                      <AlertOctagon className="mt-0.5 h-4 w-4 text-[color:var(--muted)]" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[color:var(--fg)]">{r.risk}</div>
                        {r.regulatorySource && (
                          <div className="mt-1 text-[11px] text-[color:var(--muted)]">Source: {r.regulatorySource}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-[color:var(--border)] py-3 pr-3">
                    <Badge tone="neutral">{r.area}</Badge>
                  </td>
                  <td className="border-b border-[color:var(--border)] py-3 pr-3">
                    <Badge tone={levelTone(r.impact)}>{r.impact}</Badge>
                  </td>
                  <td className="border-b border-[color:var(--border)] py-3 pr-3">
                    <Badge tone={levelTone(r.likelihood)}>{r.likelihood}</Badge>
                  </td>
                  <td className="border-b border-[color:var(--border)] py-3 pr-3">
                    <Badge tone={r.ownerRole === activeRole ? "accent" : "neutral"}>{roleLabel(r.ownerRole)}</Badge>
                  </td>
                  <td className="border-b border-[color:var(--border)] py-3 pr-3">
                    <div className="text-xs text-[color:var(--muted)]">{r.mitigation}</div>
                  </td>
                  <td className="border-b border-[color:var(--border)] py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                      <Select
                        className="w-[150px] text-xs"
                        value={r.status}
                        onChange={(e) => setRiskStatus(r.id, e.target.value as RiskItem["status"])}
                      >
                        <option value="open">open</option>
                        <option value="watch">watch</option>
                        <option value="mitigating">mitigating</option>
                        <option value="closed">closed</option>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 md:hidden">
          {risks.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] p-3"
            >
              <div className="text-sm font-medium text-[color:var(--fg)]">{r.risk}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="neutral">{r.area}</Badge>
                <Badge tone={levelTone(r.impact)}>{`impact: ${r.impact}`}</Badge>
                <Badge tone={levelTone(r.likelihood)}>{`likelihood: ${r.likelihood}`}</Badge>
                <Badge tone={r.ownerRole === activeRole ? "accent" : "neutral"}>{roleLabel(r.ownerRole)}</Badge>
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </div>
              {r.regulatorySource && (
                <div className="mt-2 text-[11px] text-[color:var(--muted)]">Source: {r.regulatorySource}</div>
              )}
              <div className="mt-2 text-xs text-[color:var(--muted)]">{r.mitigation}</div>
              <div className="mt-2">
                <Select
                  value={r.status}
                  onChange={(e) => setRiskStatus(r.id, e.target.value as RiskItem["status"])}
                >
                  <option value="open">open</option>
                  <option value="watch">watch</option>
                  <option value="mitigating">mitigating</option>
                  <option value="closed">closed</option>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
