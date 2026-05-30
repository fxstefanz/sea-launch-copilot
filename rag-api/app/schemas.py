from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class BusinessContext(BaseModel):
    """Request payload for generating a first-pass market-entry report."""

    brand_name: str = Field(..., description="Brand name, e.g. 'Xiang La Yue'.")
    origin_country: str = Field(..., description="Origin country, e.g. 'China'.")
    target_market: str = Field(..., description="Target market, e.g. 'Singapore'.")
    business_type: str = Field(
        ...,
        description="Business type, e.g. 'CPG condiment brand', 'packaged food importer', 'processed food brand'.",
    )
    products_services: list[str] = Field(
        ...,
        description="List of products/services, e.g. ['Bottled Hunan chili sauce (shelf-stable, glass jar)'].",
        min_length=1,
    )
    entry_mode: str = Field(
        ...,
        description="Entry mode, e.g. 'processed packaged food import', 'distributor', 'retail', 'online marketplaces', 'TikTok/social commerce'.",
    )
    user_role: str = Field(
        ...,
        description="User role, e.g. 'founder', 'accountant', 'localization manager'.",
    )

    # Optional demo-friendly fields
    timeline_horizon_months: int | None = Field(
        default=6, description="Planning horizon in months for the checklist."
    )
    budget_band: Literal["unknown", "lean", "standard", "aggressive"] = Field(
        default="unknown",
        description="Rough budget band for prioritization heuristics (demo only).",
    )
    constraints: list[str] | None = Field(
        default=None,
        description="Known constraints, e.g. ['need halal-friendly option', 'no local cofounder yet'].",
    )


class ChecklistItem(BaseModel):
    area: str = Field(..., description="Category/area, e.g. 'Food safety licensing'.")
    item: str = Field(..., description="Actionable checklist item.")
    priority: Literal["P0", "P1", "P2"] = Field(..., description="P0=blocker, P1=important, P2=nice-to-have.")
    rationale: str = Field(..., description="Why this matters for the stated entry mode.")
    evidence_needed: list[str] = Field(default_factory=list)
    suggested_owner: str = Field(..., description="Suggested owner role, not a real person.")
    suggested_timing: str = Field(
        ...,
        description="Rough timing guidance, e.g. 'Weeks 0-2', 'Before first shipment'.",
    )


class LocalizationRecommendation(BaseModel):
    area: str
    recommendation: str
    rationale: str
    quick_win: bool = False


class TikTokLaunchSuggestion(BaseModel):
    suggestion: str
    why_it_helps: str
    prerequisite: str | None = None


class RiskItem(BaseModel):
    risk_level: Literal["low", "medium", "high"]
    area: str
    issue: str
    evidence: str = Field(
        ...,
        description="Short evidence statement; should reference citations when possible.",
    )
    next_action: str
    owner: str = Field(..., description="Suggested owner role.")


class Citation(BaseModel):
    id: str
    title: str
    url: str | None = None
    snippet: str = Field(..., description="Short excerpt from retrieved context.")
    source_type: Literal["official", "industry", "internal_demo_pack"] = "internal_demo_pack"


class MarketEntryReport(BaseModel):
    report_version: str = "demo-v0.1"
    generated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    # Core outputs
    readiness_score: float = Field(..., ge=0, le=100)
    executive_summary: str
    compliance_checklist: list[ChecklistItem]
    tax_and_accounting_checklist: list[ChecklistItem]
    localization_recommendations: list[LocalizationRecommendation]
    tiktok_social_commerce_launch_suggestions: list[TikTokLaunchSuggestion]
    risk_register: list[RiskItem]
    citations: list[Citation]
    advisor_ready_memo: str

    # Guardrails
    disclaimer: str = Field(
        default=(
            "Not legal/tax advice. This is a first-pass preparation checklist for SMEs. "
            "Verify requirements with qualified Singapore professionals and official sources."
        )
    )
