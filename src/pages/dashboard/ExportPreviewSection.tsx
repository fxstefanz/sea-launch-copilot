import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Copy, Download, Printer } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { useMarketEntryStore } from "@/features/marketEntry/store"

function buildExportText({
  company,
  brand,
  summary,
  decisions,
}: {
  company: string
  brand: string
  summary: string
  decisions: string[]
}) {
  const lines = [
    `SEA Launch Copilot — Advisor-ready Export`,
    ``,
    `Company: ${company || "—"}`,
    `Brand: ${brand || "—"}`,
    ``,
    `Executive summary`,
    summary,
    ``,
    `Key decisions`,
    ...decisions.map((d) => `- ${d}`),
    ``,
  ]
  return lines.join("\n")
}

export function ExportPreviewSection() {
  const nav = useNavigate()
  const status = useMarketEntryStore((s) => s.status)
  const intake = useMarketEntryStore((s) => s.intake)
  const analysis = useMarketEntryStore((s) => s.analysis)
  const [copied, setCopied] = useState(false)

  const exportText = useMemo(() => {
    if (!analysis) return ""
    return buildExportText({
      company: intake.companyName,
      brand: intake.brandName,
      summary: analysis.advisorExport.executiveSummary,
      decisions: analysis.advisorExport.keyDecisions,
    })
  }, [analysis, intake.brandName, intake.companyName])

  if (status === "loading") {
    return (
      <Card className="overflow-hidden">
        <CardHeader title="Advisor-Ready Export Preview" subtitle="Formatted for advisor review — preview" />
        <CardBody className="space-y-3">
          <Skeleton className="h-52" />
        </CardBody>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="overflow-hidden">
        <CardHeader title="Advisor-Ready Export Preview" subtitle="Run analysis first to generate the export preview" />
        <CardBody>
          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-xs text-[color:var(--muted)]">
            The export preview organizes your score, checklist, risk register & launch pack into an advisor-ready format.
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden" id="export-preview">
      <CardHeader
        title="Advisor-Ready Export Preview"
        subtitle="Copy, print, or open full preview — PDF export coming soon"
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(exportText)
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 1200)
                } catch {
                  setCopied(false)
                }
              }}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => nav("/export")}>
              <Download className="h-4 w-4" />
              Full preview
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        }
      />
      <CardBody>
        <div className="rounded-xl border border-[color:var(--border)] bg-white p-5 text-black">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">SEA Launch Copilot</div>
              <div className="mt-0.5 text-xs text-zinc-600">Advisor-ready export preview</div>
            </div>
            <div className="text-right text-xs text-zinc-600">
              <div>{analysis.generatedAt ? new Date(analysis.generatedAt).toLocaleString() : ""}</div>
              <div className="mt-1">
                <Badge tone="neutral">Readiness {analysis.readinessScore}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 p-3">
              <div className="text-[11px] text-zinc-600">Company</div>
              <div className="mt-1 text-sm font-medium">{intake.companyName || "—"}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3">
              <div className="text-[11px] text-zinc-600">Brand</div>
              <div className="mt-1 text-sm font-medium">{intake.brandName || "—"}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Executive summary</div>
            <div className="mt-2 text-sm leading-6 text-zinc-900">{analysis.advisorExport.executiveSummary}</div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Key decisions</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-900">
              {analysis.advisorExport.keyDecisions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

