# SEA Launch Copilot — Hackathon Demo

AI workbench helping SME brands enter Singapore via a TikTok-first strategy. Demo scenario: chili sauce brand from China entering Singapore.

## Architecture

```
Frontend (React/Vite :5173)
    ↓
Backend (Express :3001)  →  RAG API (FastAPI :8000)  →  Mock fallback
```

The backend calls the RAG API first. If unavailable, it falls back to Claude API, then to built-in mock data.

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/fxstefanz/sea-launch-copilot.git
cd sea-launch-copilot
npm install
cp .env.example .env
```

### 2. Start the RAG API backend (Python)

```bash
cd rag-api
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Keep this running in a separate terminal. Verify it works:
```bash
curl http://localhost:8000/docs
```

### 3. Start the frontend + Node backend

In another terminal (from the project root):

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### 4. Environment variables

Edit `.env` if needed:

```
PARTNER_API_URL=http://localhost:8000   # RAG API address
ANTHROPIC_API_KEY=sk-ant-...            # Optional Claude fallback
```

## Data flow

| Priority | Source | When used |
|----------|--------|-----------|
| 1st | RAG API (`rag-api/`) | RAG service running on port 8000 |
| 2nd | Claude API | `ANTHROPIC_API_KEY` set and RAG unavailable |
| 3rd | Mock data | Both APIs unavailable |

## Project structure

```
├── src/               # React frontend
├── api/               # Express backend
├── shared/            # Shared TypeScript types + mock data
├── rag-api/           # Python FastAPI RAG backend
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── rag/
│   └── requirements.txt
└── .env.example
```

## Roles

| Role | Focus |
|------|-------|
| Founder | Full overview — readiness score, all risks, advisor export |
| Accountant | Tax, finance & compliance tasks |
| Localization/Growth | Localization recommendations & TikTok action plan |
