import { cn } from "@/lib/utils"

export type TabOption<T extends string> = {
  value: T
  label: string
  description?: string
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
  className,
  size = "md",
}: {
  value: T
  options: TabOption<T>[]
  onChange: (next: T) => void
  className?: string
  size?: "sm" | "md"
}) {
  return (
    <div
      className={cn(
        "inline-flex items-stretch rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1",
        className,
      )}
      role="tablist"
      aria-label="Role tabs"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-left transition",
              size === "sm" && "px-2.5 py-1.5",
              active
                ? "bg-[color:var(--accent)] text-white shadow-md font-semibold"
                : "text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--fg)]",
            )}
            onClick={() => onChange(opt.value)}
          >
            <span className={cn("text-sm font-medium", size === "sm" && "text-xs")}>{opt.label}</span>
            {opt.description ? (
              <span className={cn("hidden text-xs text-[color:var(--muted)] md:inline", active && "text-white/75")}>
                {opt.description}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

