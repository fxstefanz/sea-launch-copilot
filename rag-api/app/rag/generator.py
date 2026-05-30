from __future__ import annotations

from typing import Iterable

from ..schemas import (
    BusinessContext,
    ChecklistItem,
    Citation,
    LocalizationRecommendation,
    MarketEntryReport,
    RiskItem,
    TikTokLaunchSuggestion,
)
from .retriever import RetrievedChunk


def _mk_citations(retrieved: list[RetrievedChunk]) -> list[Citation]:
    citations: list[Citation] = []
    for c in retrieved:
        citations.append(
            Citation(
                id=c.doc.id,
                title=c.doc.title,
                url=c.doc.url,
                snippet=c.snippet,
                source_type=c.doc.source_type,  # type: ignore[arg-type]
            )
        )
    return citations


def _has_any(text: str, terms: Iterable[str]) -> bool:
    t = text.lower()
    return any(x.lower() in t for x in terms)


def generate_report(context: BusinessContext, retrieved: list[RetrievedChunk]) -> MarketEntryReport:
    """
    Mock "LLM" generator:
    - deterministic, fast, and safe for hackathon demos
    - keeps output shape stable for frontend integration

    Swap-in point:
    - replace this with an actual LLM call that uses prompt.build_prompt_bundle(...)
    """

    citations = _mk_citations(retrieved)

    entry_mode = context.entry_mode.lower()
    # Pivot: packaged processed food (e.g., bottled chili sauce) entering Singapore.
    # Keep restaurant detection only as a fallback signal; we de-emphasize it in outputs.
    is_restaurant = _has_any(entry_mode, ["restaurant", "dine", "dine-in", "food shop"])
    is_packaged = _has_any(
        entry_mode,
        [
            "packaged",
            "processed",
            "bottled",
            "sauce",
            "condiment",
            "cpg",
            "fmcg",
            "import",
            "distributor",
            "retail",
            "e-commerce",
        ],
    )
    is_tiktok_first = _has_any(entry_mode, ["tiktok", "social", "commerce", "online", "shop", "live"])

    # Simple readiness heuristic (demo only)
    score = 58.0
    if context.constraints:
        score -= 5.0
    if is_packaged:
        score -= 2.0  # import + labeling complexity
    if is_tiktok_first:
        score += 5.0
    if context.budget_band == "lean":
        score -= 5.0
    if context.budget_band == "aggressive":
        score += 3.0
    score = max(0.0, min(100.0, score))

    go_to_market_phrase = "TikTok-first go-to-market" if is_tiktok_first else "go-to-market"
    executive_summary = (
        f"{context.brand_name} is planning {context.entry_mode} expansion from {context.origin_country} "
        f"to {context.target_market}. This report is a first-pass preparation pack to help a "
        f"{context.user_role} identify key compliance, tax/accounting, localization, and {go_to_market_phrase} "
        f"steps before engaging Singapore professionals."
    )

    compliance: list[ChecklistItem] = []
    # Packaged processed food import (primary demo path)
    compliance += [
        ChecklistItem(
            area="Importer registration & regulated food checks (SFA)",
            item="Confirm whether your importer must be registered and whether the chili sauce category has additional controls; document your import flow and responsibilities.",
            priority="P0",
            rationale="Importer setup and food category controls can block first shipment if missed.",
            evidence_needed=[
                "Importer-of-record decision",
                "Product category + HS code hypothesis",
                "Manufacturer details + facility certificates (if available)",
            ],
            suggested_owner="Supply chain lead",
            suggested_timing="Weeks 0-2",
        ),
        ChecklistItem(
            area="Customs clearance readiness",
            item="Finalize HS classification, landed cost model, and required shipment documents; align Incoterms and decide who files permits (you vs distributor).",
            priority="P0",
            rationale="Incorrect HS codes or missing documents commonly cause clearance delays and extra fees.",
            evidence_needed=["Commercial invoice template", "Packing list", "COO (if applicable)", "Distributor/forwarder SOP"],
            suggested_owner="Supply chain lead",
            suggested_timing="Before first shipment",
        ),
        ChecklistItem(
            area="Food labelling (ingredients, allergens, origin, storage)",
            item="Prepare Singapore-ready labels: ingredients list, allergen declarations, net weight, manufacturer/importer info, storage instructions, and country-of-origin where required; keep label versions controlled.",
            priority="P0",
            rationale="Label non-compliance can trigger relabeling, disposal, or recall risk.",
            evidence_needed=[
                "Final ingredient list (with percentages if needed)",
                "Allergen statement",
                "Label artwork files + translations",
                "Shelf-life and storage conditions",
            ],
            suggested_owner="Localization/packaging lead",
            suggested_timing="Weeks 1-4",
        ),
        ChecklistItem(
            area="Nutrition panel & claim review",
            item="Decide whether to include a nutrition information panel; review all on-pack and TikTok ad claims (e.g., 'healthy', 'low sodium') for substantiation and compliance-safe wording.",
            priority="P0",
            rationale="Unsubstantiated nutrition/health claims are a high-risk compliance and ad rejection vector.",
            evidence_needed=["Lab test plan/results (if making claims)", "Claim list (label + ads)", "Approved copy guidelines"],
            suggested_owner="Marketing + compliance owner",
            suggested_timing="Weeks 2-6",
        ),
        ChecklistItem(
            area="Traceability & recall readiness",
            item="Implement batch/lot traceability (factory batch → shipment → warehouse → customer) and a recall playbook; define complaint handling SOP.",
            priority="P1",
            rationale="Traceability reduces the blast radius of quality incidents and speeds regulator/customer responses.",
            evidence_needed=["Batch coding convention", "Warehouse lot tracking method", "Customer support SOP"],
            suggested_owner="Operations manager",
            suggested_timing="Weeks 2-8",
        ),
    ]
    compliance += [
        ChecklistItem(
            area="Company setup & government access",
            item="Decide legal entity + incorporation approach; set up CorpPass and a compliance calendar for filings.",
            priority="P1",
            rationale="Smooth filings and government portal access reduce avoidable delays.",
            evidence_needed=["Shareholding plan", "Director/officer appointments", "Signing authority matrix"],
            suggested_owner="Founder/ops",
            suggested_timing="Weeks 0-3",
        ),
        ChecklistItem(
            area="Privacy & marketing consent (PDPA)",
            item="Draft a privacy notice + consent language for lead capture, loyalty programs, delivery orders, and TikTok campaigns; define retention & access controls.",
            priority="P1",
            rationale="TikTok-first growth often collects customer data early; consent issues create brand and enforcement risk.",
            evidence_needed=["Privacy notice draft", "Data inventory", "Vendor list (CRM, delivery, analytics)"],
            suggested_owner="Marketing/ops",
            suggested_timing="Weeks 1-4",
        ),
    ]

    tax_and_accounting: list[ChecklistItem] = [
        ChecklistItem(
            area="Bookkeeping + inventory accounting",
            item="Set up bookkeeping workflow (invoices, marketplace fees, shipping, storage) and inventory tracking (COGS, landed cost, write-offs) suitable for Singapore reporting.",
            priority="P0",
            rationale="For imported packaged foods, inventory + landed cost accuracy is critical for unit economics, tax, and investor/distributor diligence.",
            evidence_needed=["Bank accounts", "Sales channels list", "Warehouse/3PL invoices", "Monthly close owner"],
            suggested_owner="Accountant/finance lead",
            suggested_timing="Weeks 0-2",
        ),
        ChecklistItem(
            area="GST readiness",
            item="Assess GST registration triggers, invoicing requirements, and how GST applies to local sales vs marketplace/social commerce; confirm with a Singapore accountant.",
            priority="P1",
            rationale="GST mistakes are common and can be costly; early design prevents rework.",
            evidence_needed=["Revenue model", "Sales channels", "Projected turnover", "Invoice templates"],
            suggested_owner="Accountant/finance lead",
            suggested_timing="Weeks 2-6",
        ),
        ChecklistItem(
            area="Marketplace and cross-border payment flows",
            item="Map how money moves (TikTok Shop/marketplaces, payment processors, FX, chargebacks) and ensure fees/taxes are recorded correctly; align with a finance owner.",
            priority="P1",
            rationale="Social commerce often creates reconciliation complexity; clean mappings avoid surprises in margin and tax.",
            evidence_needed=["Payment processor list", "Marketplace fee schedules", "Refund/return policy"],
            suggested_owner="Accountant/finance lead",
            suggested_timing="Weeks 2-6",
        ),
    ]

    localization_recs: list[LocalizationRecommendation] = [
        LocalizationRecommendation(
            area="Product positioning & usage occasions",
            recommendation="Package the chili sauce around Singapore-relevant usage occasions (noodles, hotpot, toast, fried rice) and make the spice level explicit on-pack.",
            rationale="Improves conversion in retail/social commerce by reducing uncertainty and increasing trial intent.",
            quick_win=True,
        ),
        LocalizationRecommendation(
            area="Label language and clarity",
            recommendation="Ensure English label clarity (ingredients/allergens/storage) and keep Chinese branding secondary; avoid translation mismatches between languages.",
            rationale="Reduces compliance risk and customer complaints, especially online where labels are scrutinized.",
            quick_win=True,
        ),
        LocalizationRecommendation(
            area="Trial pack strategy",
            recommendation="Launch with a small trial bottle and a bundle (2–3 flavors/heat levels) to maximize sampling and gifting; test price points vs local competitors.",
            rationale="Pack architecture is a fast lever for TikTok conversion and repeat purchase.",
            quick_win=False,
        ),
    ]

    tiktok_suggestions: list[TikTokLaunchSuggestion] = []
    if is_tiktok_first:
        tiktok_suggestions = [
            TikTokLaunchSuggestion(
                suggestion="Build a 30-day content calendar around real usage: hotpot/noodles/toast/fried-rice recipes, 'one spoon' heat reactions, and before/after flavor tests with common Singapore foods.",
                why_it_helps="Makes the product legible in 2–5 seconds and drives trial intent through repeatable recipe formats.",
                prerequisite="Assign an on-site content owner and a weekly shoot schedule.",
            ),
            TikTokLaunchSuggestion(
                suggestion="Run a micro-creator sampling program (10–20 Singapore creators) with a simple brief: 1 recipe + 1 tasting reaction + 1 usage tip; use trackable codes and a small starter bundle.",
                why_it_helps="Creator sampling quickly validates flavor-market fit and content angles with local audiences.",
                prerequisite="Creator brief, sampling budget, and fulfillment capacity.",
            ),
            TikTokLaunchSuggestion(
                suggestion="Create a 'label-safe claims' playbook for ads and creators (no disease/health claims; avoid 'low sodium/healthy' unless substantiated); pre-approve scripts and on-screen text.",
                why_it_helps="Reduces ad rejections and compliance risk while keeping messaging consistent across UGC.",
                prerequisite="Approved copy guidelines and a claim-by-claim review against your label.",
            ),
            TikTokLaunchSuggestion(
                suggestion="Validate TikTok Shop economics with a controlled test: 1 hero SKU + 1 bundle, A/B thumbnail + hook, and a clear usage CTA; track CAC, AOV, repeat intent, and refund/return rate.",
                why_it_helps="Confirms whether social commerce can work profitably before scaling inventory and ad spend.",
                prerequisite="Shop setup, product listings, and basic analytics (pixel/events) with defined KPIs.",
            ),
        ]

    # Risks: tie to citations when possible
    def ev(doc_id: str, fallback: str) -> str:
        return fallback + (f" (See citation: {doc_id})" if any(c.id == doc_id for c in citations) else "")

    risks: list[RiskItem] = [
        RiskItem(
            risk_level="high" if is_packaged else "medium",
            area="Importer registration & border clearance",
            issue="Importer setup, HS classification, or missing documents may delay first shipment or increase landed costs.",
            evidence=ev(
                "sg-sfa-importer-registration",
                "Packaged/processed food imports may require importer readiness and category checks; customs processes rely on correct classification and documents.",
            ),
            next_action="Confirm importer-of-record, validate HS code with a broker, and pre-build a shipment document pack + SOP with your forwarder/distributor.",
            owner="Supply chain lead",
        ),
        RiskItem(
            risk_level="high",
            area="Food labelling & claims",
            issue="Non-compliant labels or unsubstantiated nutrition/health claims can trigger relabeling, ad rejection, or enforcement risk.",
            evidence=ev(
                "sg-food-labelling",
                "Packaged food labels commonly require ingredients/allergens and other mandatory particulars; claims must be supportable.",
            ),
            next_action="Create a label compliance checklist, do a claim-by-claim review, and (if making claims) plan lab testing before scaling ads.",
            owner="Localization/packaging lead",
        ),
        RiskItem(
            risk_level="medium" if is_tiktok_first else "low",
            area="Marketing claims & brand safety",
            issue="Over-claiming (health/quality) or poor moderation can cause ad rejection or reputational damage.",
            evidence=ev("tiktok-commerce", "TikTok-first growth requires supportable claims and brand safety controls."),
            next_action="Create claim guidelines (aligned to label-safe wording), moderation SOP, and creator briefing templates; pre-approve scripts.",
            owner="Marketing lead",
        ),
        RiskItem(
            risk_level="medium",
            area="Data privacy (PDPA)",
            issue="Lead capture and loyalty programs may collect personal data without proper notice/consent.",
            evidence=ev("sg-pdpa", "PDPA requires consent/purpose limitation and reasonable security for customer data."),
            next_action="Draft privacy notice, define data inventory and retention, and audit vendors (CRM, delivery, analytics).",
            owner="Ops/marketing",
        ),
        RiskItem(
            risk_level="medium",
            area="Tax & bookkeeping",
            issue="Inadequate bookkeeping and GST readiness can create compliance exposure and make unit economics unclear.",
            evidence=ev("sg-gst-basics", "GST and record-keeping obligations require early finance setup."),
            next_action="Implement monthly close, channel-level revenue + fees mapping, and consult a Singapore accountant on GST triggers and e-commerce treatment.",
            owner="Accountant/finance lead",
        ),
    ]

    advisor_ready_memo = (
        "Advisor-ready memo (bring to lawyer/accountant/local partners):\n"
        f"1) Business snapshot: {context.brand_name} ({context.origin_country} → {context.target_market}), "
        f"entry mode: {context.entry_mode}; products/services: {', '.join(context.products_services)}.\n"
        "2) Decisions needed (next 2 weeks): entity setup approach, importer-of-record/distributor arrangement, "
        "HS code + clearance flow, label/claim strategy, and sales channels (retail/distributor/TikTok shop).\n"
        "3) Key questions for advisors:\n"
        "   - Import/compliance: What SFA/importer requirements apply to our chili sauce category and supply chain? Any controlled ingredients?\n"
        "   - Labelling/claims: What must be on the label (ingredients/allergens/origin) and what claims are risky or require substantiation?\n"
        "   - Tax/accounting: GST registration triggers for our projected turnover and channels; invoicing and record-keeping setup for marketplaces?\n"
        "   - Data/privacy: PDPA-compliant consent language for marketing and delivery/loyalty workflows.\n"
        "4) Evidence pack to prepare: ingredient/allergen list, manufacturer dossier, label proofs, "
        "revenue model + projections, and vendor list (forwarder, warehouse/3PL, TikTok/ads tooling).\n"
        "\nDisclaimer: Not legal/tax advice; verify with official sources and qualified Singapore professionals."
    )

    return MarketEntryReport(
        readiness_score=score,
        executive_summary=executive_summary,
        compliance_checklist=compliance,
        tax_and_accounting_checklist=tax_and_accounting,
        localization_recommendations=localization_recs,
        tiktok_social_commerce_launch_suggestions=tiktok_suggestions,
        risk_register=risks,
        citations=citations,
        advisor_ready_memo=advisor_ready_memo,
    )
