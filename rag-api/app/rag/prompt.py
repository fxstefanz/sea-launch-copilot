from __future__ import annotations

from dataclasses import dataclass

from ..schemas import BusinessContext
from .retriever import RetrievedChunk


@dataclass(frozen=True)
class PromptBundle:
    system: str
    user: str


SYSTEM_PROMPT = """\
You are SEA Launch Copilot, an assistant that helps SMEs prepare for overseas market entry.
You produce a STRUCTURED JSON report for first-pass preparation, NOT legal or tax advice.

Hard rules:
- Always include the disclaimer.
- Be specific, actionable, and role-aware.
- When making claims, attach citations from the provided context whenever possible.
- If uncertain, say what to verify and who should verify it (lawyer/accountant/regulator/local partner).
"""


def build_user_prompt(context: BusinessContext, retrieved: list[RetrievedChunk]) -> str:
    retrieved_block = "\n\n".join(
        f"[{i+1}] {c.doc.title}\nURL: {c.doc.url or 'N/A'}\nExcerpt: {c.snippet}"
        for i, c in enumerate(retrieved)
    )

    return f"""\
Business context:
- Brand: {context.brand_name}
- Origin: {context.origin_country}
- Target market: {context.target_market}
- Business type: {context.business_type}
- Products/services: {', '.join(context.products_services)}
- Entry mode: {context.entry_mode}
- User role: {context.user_role}
- Timeline horizon (months): {context.timeline_horizon_months}
- Budget band: {context.budget_band}
- Constraints: {', '.join(context.constraints or []) or 'None provided'}

Retrieved context (use for citations):
{retrieved_block}

Return ONLY valid JSON with the required schema fields.
"""


def build_prompt_bundle(context: BusinessContext, retrieved: list[RetrievedChunk]) -> PromptBundle:
    return PromptBundle(system=SYSTEM_PROMPT, user=build_user_prompt(context, retrieved))

