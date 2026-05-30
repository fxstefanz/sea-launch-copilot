# TRAE Code Mode — Gemini API Quick Test (Copy/Paste)

This file is designed to be “executable” in the sense that **every command below can be copied into a terminal** in TRAE Code mode (or any local terminal) to verify your Gemini API key and then run the backend.

## 0) Open the project folder

In TRAE, open the repo folder that contains `requirements.txt`, then open a terminal in that folder.

Optional sanity check:

```bash
ls
```

You should see `requirements.txt`, `app/`, `README.md`, etc.

---

## 1) Set environment variables (Gemini)

Replace `YOUR_KEY_HERE` with your real key.

```bash
export GEMINI_API_KEY="YOUR_KEY_HERE"
export GEMINI_MODEL="gemini-1.5-flash"
```

Confirm they are set:

```bash
echo "$GEMINI_MODEL"
test -n "$GEMINI_API_KEY" && echo "GEMINI_API_KEY is set"
```

---

## 2) One-shot key sanity test (Gemini REST)

This should return valid JSON like `{"ok": true}` (or a JSON-wrapped response containing it).

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"Return JSON only: {\"ok\": true}"}]}],"generationConfig":{"responseMimeType":"application/json","temperature":0.2}}'
```

If you get HTTP 401/403: the key is wrong/disabled or lacks access.

---

## 3) Install backend dependencies

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

---

## 4) Run the API server

```bash
. .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Keep this running.

Health check (in a **second terminal**):

```bash
curl http://localhost:8000/health
```

---

## 5) Call the report endpoint (mock RAG generator)

```bash
curl -s http://localhost:8000/v1/market-entry-report \
  -H "Content-Type: application/json" \
  -d @examples/sample_request.json | python -m json.tool
```

---

## 6) Next step (after key is verified)

Once Step 2 works, the next engineering step is to **replace the deterministic generator** with a Gemini-backed generator:

- Create `app/rag/gemini_client.py` to call `generateContent` with:
  - `systemInstruction` = `app/rag/prompt.py::SYSTEM_PROMPT`
  - `contents[0].parts[0].text` = `build_user_prompt(ctx, retrieved)`
  - `generationConfig.responseMimeType = "application/json"`
- Parse the response JSON into `MarketEntryReport`.
- Wire it in `app/rag/pipeline.py` (use deterministic generator as a fallback if JSON parsing fails).

If you want, paste the Step-2 curl output here and I’ll tell you if it looks correct and then generate the exact code patch for `gemini_client.py`.
