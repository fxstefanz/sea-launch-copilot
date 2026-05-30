import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_2px_16px_rgba(0,0,0,0.07)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] px-5 py-4">
      <div>
        <div className="text-[13px] font-semibold tracking-tight text-[color:var(--fg)]">{title}</div>
        {subtitle ? <div className="mt-0.5 text-xs text-[color:var(--muted)]">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  )
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>
}
