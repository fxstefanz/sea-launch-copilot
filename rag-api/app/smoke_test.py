from __future__ import annotations

import json
from pathlib import Path

from fastapi.testclient import TestClient

from .main import app


def main() -> None:
    client = TestClient(app)
    repo_root = Path(__file__).resolve().parents[1]
    sample_request_path = repo_root / "examples" / "sample_request.json"
    payload = json.loads(sample_request_path.read_text(encoding="utf-8"))
    r = client.post("/v1/market-entry-report", json=payload)
    r.raise_for_status()
    data = r.json()
    print("OK. Keys:", sorted(list(data.keys())))
    print("readiness_score:", data["readiness_score"])
    print("citations:", [c["id"] for c in data.get("citations", [])])


if __name__ == "__main__":
    main()
