# Singapore Packaged-Food Launch Copilot (Hackathon Demo Backend)

Backend API that generates a **first-pass** market-entry preparation report for SME founders (not legal/tax advice).

## Run locally

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## API

### `POST /v1/market-entry-report`

Request JSON (example):

```json
{
  "brand_name": "Xiang La Yue Chili",
  "origin_country": "China",
  "target_market": "Singapore",
  "business_type": "CPG condiment brand (bottled chili sauce)",
  "products_services": ["Bottled Hunan chili sauce (shelf-stable, glass jar)"],
  "entry_mode": "processed packaged food import + TikTok/social commerce",
  "user_role": "founder",
  "timeline_horizon_months": 6,
  "budget_band": "standard",
  "constraints": ["no local cofounder yet", "need fast validation", "avoid risky health claims in ads"]
}
```

Response: structured JSON report (see FastAPI OpenAPI docs at `http://localhost:8000/docs`).

## Architecture (demo)

`app/rag/` contains a mock RAG pipeline:
- `corpus.py`: static “knowledge pack” documents
- `retriever.py`: in-memory keyword retriever + simple scoring
- `generator.py`: deterministic report generator (swap for an LLM later)
- `pipeline.py`: end-to-end orchestration

Swap-in points:
- replace retriever with a vector store (FAISS/pgvector/etc.)
- replace generator with LLM call using prompt templates (`app/rag/prompt.py`)
