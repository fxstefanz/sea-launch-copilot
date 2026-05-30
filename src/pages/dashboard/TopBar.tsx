import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Download, Loader2, Moon, Sparkles, Sun } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Tabs } from "@/components/ui/Tabs"
import { useTheme } from "@/hooks/useTheme"
import { roleMeta } from "@/features/marketEntry/roleMeta"
import { useMarketEntryStore } from "@/features/marketEntry/store"
import type { Role } from "@shared/marketEntry"

const roleOptions = (Object.keys(roleMeta) as Role[]).map((r) => ({
  value: r,
  label: roleMeta[r].label,
  description: roleMeta[r].description,
}))

export function TopBar() {
  const nav = useNavigate()
  const { theme, toggleTheme, isDark } = useTheme()

  const activeRole = useMarketEntryStore((s) => s.activeRole)
  const setRole = useMarketEntryStore((s) => s.setRole)
  const analyze = useMarketEntryStore((s) => s.analyze)
  const status = useMarketEntryStore((s) => s.status)
  const analysis = useMarketEntryStore((s) => s.analysis)

  const subtitle = useMemo(() => {
    if (!analysis) return "Chili sauce → Singapore — fill in · analyze · collaborate · export"
    const date = new Date(analysis.generatedAt)
    return `上次分析：${date.toLocaleString()}`
  }, [analysis])

  return (
    <div className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)] text-white shadow-sm">
            <span className="text-base leading-none">🌶</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-display text-[15px] font-bold tracking-tight text-[color:var(--fg)]">
                SEA Launch Copilot
              </div>
              <span className="hidden rounded-full bg-[color:color-mix(in_oklab,var(--accent)_14%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--accent-strong)] sm:inline">
                Chili sauce → SG
              </span>
            </div>
            <div className="mt-0.5 truncate text-[11px] text-[color:var(--muted)]">{subtitle}</div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Tabs value={activeRole} options={roleOptions} onChange={setRole} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            onClick={() => nav("/export")}
            disabled={!analysis}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            variant="primary"
            onClick={() => analyze()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze Market Entry
          </Button>

          <Button variant="ghost" aria-label={`Theme ${theme}`} onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pb-3 md:hidden">
        <Tabs value={activeRole} options={roleOptions} onChange={setRole} className="w-full" size="sm" />
      </div>
    </div>
  )
}

