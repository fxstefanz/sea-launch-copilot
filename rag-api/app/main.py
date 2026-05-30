from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .rag.pipeline import RagPipeline
from .schemas import BusinessContext, MarketEntryReport


app = FastAPI(
    title="Singapore Packaged-Food Launch Copilot API",
    version="demo-v0.1",
    description="Hackathon demo backend for generating first-pass Singapore packaged-food (bottled chili sauce) market-entry prep reports.",
)

# Demo-friendly CORS (lock down for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = RagPipeline()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/v1/market-entry-report", response_model=MarketEntryReport)
def market_entry_report(payload: BusinessContext) -> MarketEntryReport:
    """
    Accept business context and return a structured preparation report.

    Guardrail: not legal/tax advice; provides first-pass prep steps and risks.
    """

    return pipeline.run(payload)
