import type { Role } from "@shared/marketEntry"

export const roleMeta: Record<Role, { label: string; short: string; description: string }> = {
  founder: { label: "Founder", short: "Founder", description: "Overview & key decisions" },
  accountant: { label: "Accountant", short: "Acct", description: "Tax, finance & compliance" },
  growth: { label: "Localization/Growth", short: "Growth", description: "Localization & TikTok" },
}

export function roleLabel(role: Role) {
  return roleMeta[role].label
}

