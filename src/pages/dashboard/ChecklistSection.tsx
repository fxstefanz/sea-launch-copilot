import { useMemo, useState } from "react"
import { Filter, ShieldCheck, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Select } from "@/components/ui/Field"
import { Skeleton } from "@/components/ui/Skeleton"
import { roleLabel } from "@/features/marketEntry/roleMeta"
import { useMarketEntryStore } from "@/features/marketEntry/store"
import { openChatWithContext } from "@/components/ChatBot"
import type { ChecklistItem, Role } from "@shared/marketEntry"

type OwnerFilter = "role" | "all"

/** Which checklist categories each role cares about */
const roleCategoryMap: Record<Role, ChecklistItem["category"][]> = {
  founder: ["Compliance", "Tax", "Finance", "Operations", "Localization", "TikTok"], // all
  accountant: ["Tax", "Finance", "Compliance"],
  growth: ["Localization", "TikTok"],
}

const roleTitles: Record<Role, { title: string; subtitle: string }> = {
  founder: {
    title: "Full Checklist — All Categories",
    subtitle: "Cross-role overview of all tasks and progress",
  },
  accountant: {
    title: "Tax, Finance & Compliance Checklist",
    subtitle: "Tax, funding & compliance tasks for your role",
  },
  growth: {
    title: "Localization & TikTok Checklist",
    subtitle: "Localization and social commerce tasks for your role",
  },
}

function priorityTone(p: ChecklistItem["priority"]) {
  if (p === "P0") return "danger"
  if (p === "P1") return "warn"
  return "neutral"
}

function statusTone(s: ChecklistItem["status"]) {
  if (s === "done") return "success"
  if (s === "in_progress") return "accent"
  if (s === "blocked") return "danger"
  return "neutral"
}

export function ChecklistSection() {
  const status = useMarketEntryStore((s) => s.status)
  const analysis = useMarketEntryStore((s) => s.analysis)
  const activeRole = useMarketEntryStore((s) => s.activeRole)
  const setChecklistStatus = useMarketEntryStore((s) => s.setChecklistStatus)

  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("role")

  const { title, subtitle } = roleTitles[activeRole]
  const relevantCategories = roleCategoryMap[activeRole]

  const items = useMemo(() => {
    const list = analysis?.checklist ?? []
    const categoryFiltered = list.filter((c) => relevantCategories.includes(c.category))
    if (ownerFilter === "role") {
      return categoryFiltered.filter((c) => c.ownerRole === activeRole)
    }
    return categoryFiltered
  }, [analysis, activeRole, ownerFilter, relevantCategories])

  if (status === "loading") {
    return (
      <Card className="overflow-hidden">
        <CardHeader title={title} subtitle={subtitle} />
        <CardBody className="space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-40" />
        </CardBody>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="overflow-hidden">
        <CardHeader title={title} subtitle="Run analysis first to view the checklist" />
        <CardBody>
          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-xs text-[color:var(--muted)]">
            The checklist is generated after analysis. Each item is tagged with an owner role and evidence requirements.
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden" id="checklist">
      <CardHeader
        title={title}
        subtitle={subtitle}
        right={
          <div className="flex items-center gap-2">
            <Button
              variant={ownerFilter === "role" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setOwnerFilter("role")}
            >
              <Filter className="h-4 w-4" />
              Mine
            </Button>
            <Button
              variant={ownerFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setOwnerFilter("all")}
            >
              All
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-xs text-[color:var(--muted)]">
            No items match the current filter. Try switching to All.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-[11px] text-[color:var(--muted)]">
                    <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Task</th>
                    <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Category</th>
                    <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Priority</th>
                    <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Owner</th>
                    <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Evidence needed</th>
                    <th className="border-b border-[color:var(--border)] pb-2 pr-3 font-medium">Status</th>
                    <th className="border-b border-[color:var(--border)] pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="align-top">
                      <td className="border-b border-[color:var(--border)] py-3 pr-3">
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--muted)]" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[color:var(--fg)]">{c.title}</div>
                            {c.dueSuggestion ? (
                              <div className="mt-1 text-[11px] text-[color:var(--muted)]">Due: {c.dueSuggestion}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[color:var(--border)] py-3 pr-3">
                        <Badge tone="neutral">{c.category}</Badge>
                      </td>
                      <td className="border-b border-[color:var(--border)] py-3 pr-3">
                        <Badge tone={priorityTone(c.priority)}>{c.priority}</Badge>
                      </td>
                      <td className="border-b border-[color:var(--border)] py-3 pr-3">
                        <Badge tone={c.ownerRole === activeRole ? "accent" : "neutral"}>{roleLabel(c.ownerRole)}</Badge>
                      </td>
                      <td className="border-b border-[color:var(--border)] py-3 pr-3">
                        <div className="text-xs text-[color:var(--muted)]">{c.evidence ?? "—"}</div>
                      </td>
                      <td className="border-b border-[color:var(--border)] py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                          <Select
                            className="w-[150px] text-xs"
                            value={c.status}
                            onChange={(e) => setChecklistStatus(c.id, e.target.value as ChecklistItem["status"])}
                          >
                            <option value="todo">todo</option>
                            <option value="in_progress">in progress</option>
                            <option value="blocked">blocked</option>
                            <option value="done">done</option>
                          </Select>
                        </div>
                      </td>
                      <td className="border-b border-[color:var(--border)] py-3">
                        <button
                          onClick={() => openChatWithContext({ title: c.title }, `How do I complete this step: ${c.title}?`)}
                          className="flex items-center gap-1 rounded-lg border border-[color:var(--accent)] px-2 py-1 text-[11px] font-medium text-[color:var(--accent)] transition hover:bg-[color:color-mix(in_oklab,var(--accent)_10%,transparent)]"
                          title="Ask AI for next steps"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Ask AI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 md:hidden">
              {items.map((c) => (
                <div key={c.id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] p-3">
                  <div className="text-sm font-medium text-[color:var(--fg)]">{c.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="neutral">{c.category}</Badge>
                    <Badge tone={priorityTone(c.priority)}>{c.priority}</Badge>
                    <Badge tone={c.ownerRole === activeRole ? "accent" : "neutral"}>{roleLabel(c.ownerRole)}</Badge>
                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                  </div>
                  {c.evidence ? <div className="mt-2 text-xs text-[color:var(--muted)]">Evidence: {c.evidence}</div> : null}
                  <div className="mt-2 flex items-center gap-2">
                    <Select
                      value={c.status}
                      onChange={(e) => setChecklistStatus(c.id, e.target.value as ChecklistItem["status"])}
                    >
                      <option value="todo">todo</option>
                      <option value="in_progress">in progress</option>
                      <option value="blocked">blocked</option>
                      <option value="done">done</option>
                    </Select>
                    <button
                      onClick={() => openChatWithContext({ title: c.title }, `How do I complete this step: ${c.title}?`)}
                      className="flex items-center gap-1 rounded-lg border border-[color:var(--accent)] px-2 py-1.5 text-[11px] font-medium text-[color:var(--accent)] transition hover:bg-[color:color-mix(in_oklab,var(--accent)_10%,transparent)]"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Ask AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}
