import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export function Button({
  className,
  variant = "secondary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" && [
          "border-transparent bg-[color:var(--accent)] text-white",
          "hover:bg-[color:var(--accent-strong)]",
        ],
        variant === "secondary" && [
          "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--fg)]",
          "hover:bg-[color:var(--surface-2)]",
        ],
        variant === "ghost" && [
          "border-transparent bg-transparent text-[color:var(--fg)]",
          "hover:bg-[color:var(--surface-2)]",
        ],
        variant === "danger" && [
          "border-transparent bg-[color:var(--danger)] text-white",
          "hover:bg-[color:var(--danger-strong)]",
        ],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  )
}

