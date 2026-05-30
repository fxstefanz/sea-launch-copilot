import { Building2, Loader2, MapPin, Sparkles, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Field, Input, Select, Textarea } from "@/components/ui/Field"
import { useMarketEntryStore } from "@/features/marketEntry/store"

export function IntakeForm() {
  const intake = useMarketEntryStore((s) => s.intake)
  const setIntake = useMarketEntryStore((s) => s.setIntake)
  const fillDemo = useMarketEntryStore((s) => s.fillDemo)
  const resetIntake = useMarketEntryStore((s) => s.resetIntake)
  const analyze = useMarketEntryStore((s) => s.analyze)
  const status = useMarketEntryStore((s) => s.status)
  const analysis = useMarketEntryStore((s) => s.analysis)

  const isLoading = status === "loading"
  const canAnalyze = intake.companyName.trim() && intake.brandName.trim()

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Market Entry Intake"
        subtitle="Chili sauce brand entering Singapore — fill in your details and run analysis"
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fillDemo}>
              Demo fill
            </Button>
            <Button variant="ghost" size="sm" onClick={resetIntake}>
              Clear
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Legal entity name" hint="Internal use">
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[color:var(--muted)]" />
              <Input
                className="pl-9"
                value={intake.companyName}
                onChange={(e) => setIntake({ companyName: e.target.value })}
                placeholder="e.g. Xiang La Ji Food Co., Ltd."
              />
            </div>
          </Field>

          <Field label="Brand name" hint="Customer-facing">
            <Input
              value={intake.brandName}
              onChange={(e) => setIntake({ brandName: e.target.value })}
              placeholder="e.g. Xiang La Ji"
            />
          </Field>

          <Field label="Industry">
            <Select
              value={intake.industry}
              onChange={(e) => setIntake({ industry: e.target.value as any })}
            >
              <option value="F&B">F&B</option>
              <option value="Retail">Retail</option>
              <option value="Services">Services</option>
              <option value="Other">Other</option>
            </Select>
          </Field>

          <Field label="Target market">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[color:var(--muted)]" />
              <Input
                className="pl-9"
                value="Singapore"
                disabled
              />
            </div>
          </Field>

          <Field label="Product / proposition">
            <div className="relative">
              <UtensilsCrossed className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[color:var(--muted)]" />
              <Input
                className="pl-9"
                value={intake.cuisineType ?? ""}
                onChange={(e) => setIntake({ cuisineType: e.target.value })}
                placeholder="e.g. Chili sauce / bottled condiment"
              />
            </div>
          </Field>

          <Field label="Price range">
            <Select
              value={intake.pricePositioning}
              onChange={(e) => setIntake({ pricePositioning: e.target.value as any })}
            >
              <option value="value">Value</option>
              <option value="mid">Mid-range</option>
              <option value="premium">Premium</option>
            </Select>
          </Field>

          <Field label="Business model">
            <Select
              value={intake.businessModel}
              onChange={(e) => setIntake({ businessModel: e.target.value as any })}
            >
              <option value="dine-in">Dine-in</option>
              <option value="delivery">Delivery / E-commerce</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </Field>

          <Field label="Monthly budget (SGD)" hint="Singapore market costs only">
            <Input
              type="number"
              value={intake.monthlyBudgetSgd}
              onChange={(e) => setIntake({ monthlyBudgetSgd: Number(e.target.value) })}
              min={0}
            />
          </Field>

          <Field label="Launch timeline (weeks)" hint="from today">
            <Input
              type="number"
              value={intake.launchTimelineWeeks}
              onChange={(e) => setIntake({ launchTimelineWeeks: Number(e.target.value) })}
              min={1}
            />
          </Field>

          <Field label="Team size">
            <Input
              type="number"
              value={intake.teamSize}
              onChange={(e) => setIntake({ teamSize: Number(e.target.value) })}
              min={1}
            />
          </Field>

          <Field label="Local entity registered?">
            <Select
              value={String(intake.hasLocalEntity)}
              onChange={(e) => setIntake({ hasLocalEntity: e.target.value === "true" })}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
          </Field>
        </div>

        <Field label="Additional notes" hint="Product lines, channel preferences, concerns">
          <Textarea
            value={intake.notes ?? ""}
            onChange={(e) => setIntake({ notes: e.target.value })}
            placeholder="e.g. Hunan-style chili sauce, planning TikTok Shop + Shopee first, want to validate in 8 weeks…"
          />
        </Field>

        {/* Prominent Analyze CTA */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-strong)] p-px shadow-lg">
          <div className="rounded-[calc(1rem-1px)] bg-[color:color-mix(in_oklab,var(--accent)_12%,var(--surface))] px-5 py-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <div className="text-sm font-semibold text-[color:var(--fg)]">
                  {analysis ? "Re-analyze — refresh your market entry report" : "Ready? Get your AI-powered market entry report"}
                </div>
                <div className="mt-0.5 text-xs text-[color:var(--muted)]">
                  Readiness score · compliance checklist · risk register · TikTok action plan · advisor export
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => analyze()}
                disabled={isLoading || !canAnalyze}
                className="w-full whitespace-nowrap sm:w-auto"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {isLoading ? "Analyzing…" : "Analyze Market Entry"}
              </Button>
            </div>
            {!canAnalyze && (
              <div className="mt-2 text-center text-xs text-[color:var(--warn-strong)] sm:text-left">
                Please fill in your legal entity name and brand name to continue
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
