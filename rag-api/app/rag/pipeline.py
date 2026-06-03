from __future__ import annotations

from ..schemas import BusinessContext, MarketEntryReport
from .corpus import load_demo_corpus
from .generator import generate_report
from .retriever import InMemoryKeywordRetriever


class RagPipeline:
    """
    Mock RAG pipeline for the hackathon demo.

    Swappable components:
    - corpus loader (static pack → DB → vector store)
    - retriever (keyword → embeddings)
    - generator (deterministic → LLM)
    """

    def __init__(self):
        self._corpus = load_demo_corpus()
        self._retriever = InMemoryKeywordRetriever(self._corpus)

    def run(self, ctx: BusinessContext) -> MarketEntryReport:
        query = " ".join(
            [
                ctx.brand_name,
                ctx.origin_country,
                ctx.target_market,
                ctx.business_type,
                ctx.entry_mode,
                ctx.user_role,
                " ".join(ctx.products_services),
                " ".join(ctx.constraints or []),
            ]
        )
        retrieved = self._retriever.retrieve(query=query, top_k=6)
        return generate_report(ctx, retrieved=retrieved)

    def answer(self, message: str, context_title: str | None = None) -> dict:
        """
        Lightweight RAG chat: retrieve relevant knowledge-pack chunks and
        compose a concise, extractive answer (no external LLM required).
        """
        query = message if not context_title else f"{message} {context_title}"
        retrieved = self._retriever.retrieve(query=query, top_k=3)

        if not retrieved:
            reply = (
                "I couldn't find a specific match in the Singapore knowledge pack for that. "
                "Try asking about SFA import permits, food labelling, allergen declarations, "
                "GST registration, customs duties, or TikTok Shop content compliance.\n\n"
                "This is a first-pass prep assistant — not legal or tax advice."
            )
            return {"reply": reply, "sources": []}

        lead = "Here's what the Singapore knowledge pack suggests:"
        if context_title:
            lead = f"On \"{context_title}\" — here's what the Singapore knowledge pack suggests:"

        bullets = []
        sources = []
        for c in retrieved:
            bullets.append(f"• {c.doc.title}: {c.snippet}")
            sources.append({"id": c.doc.id, "title": c.doc.title, "url": c.doc.url})

        sources_line = ""
        if sources:
            names = ", ".join(s["title"] for s in sources)
            sources_line = f"\n\nSources: {names}"

        reply = (
            f"{lead}\n\n"
            + "\n\n".join(bullets)
            + sources_line
            + "\n\nThis is a first-pass prep assistant — not legal or tax advice. "
            "Verify with official Singapore sources."
        )
        return {"reply": reply, "sources": sources}

