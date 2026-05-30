import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "accent" | "warn" | "danger" | "success"

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4",
        tone === "neutral" && "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)]",
        tone === "accent" && "border-transparent bg-[color:color-mix(in_oklab,var(--accent)_16%,transparent)] text-[color:var(--accent-strong)]",
        tone === "warn" && "border-transparent bg-[color:color-mix(in_oklab,var(--warn)_18%,transparent)] text-[color:var(--warn-strong)]",
        tone === "danger" && "border-transparent bg-[color:color-mix(in_oklab,var(--danger)_16%,transparent)] text-[color:var(--danger-strong)]",
        tone === "success" && "border-transparent bg-[color:color-mix(in_oklab,var(--success)_16%,transparent)] text-[color:var(--success-strong)]",
        className,
      )}
    >
      {children}
    </span>
  )
}
