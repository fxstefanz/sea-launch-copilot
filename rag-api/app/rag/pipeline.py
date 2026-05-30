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

