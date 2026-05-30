from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Protocol

from .corpus import Document


@dataclass(frozen=True)
class RetrievedChunk:
    doc: Document
    score: float
    snippet: str


class Retriever(Protocol):
    def retrieve(self, query: str, top_k: int = 6) -> list[RetrievedChunk]: ...


_TOKEN_RE = re.compile(r"[a-zA-Z0-9]+")


def _tokenize(text: str) -> set[str]:
    return {t.lower() for t in _TOKEN_RE.findall(text)}


class InMemoryKeywordRetriever:
    """
    Lightweight retriever for hackathon demos.

    Scoring: overlap(query_tokens, doc_tokens) with small boosts for tag hits.
    """

    def __init__(self, corpus: list[Document]):
        self._corpus = corpus
        self._doc_tokens: dict[str, set[str]] = {d.id: _tokenize(d.text + " " + d.title) for d in corpus}
        self._tag_tokens: dict[str, set[str]] = {d.id: {t.lower() for t in d.tags} for d in corpus}

    def retrieve(self, query: str, top_k: int = 6) -> list[RetrievedChunk]:
        q = _tokenize(query)
        if not q:
            return []

        scored: list[RetrievedChunk] = []
        for d in self._corpus:
            dt = self._doc_tokens[d.id]
            overlap = len(q.intersection(dt))
            tag_boost = 0.5 * len(q.intersection(self._tag_tokens[d.id]))
            score = overlap + tag_boost
            if score <= 0:
                continue

            snippet = d.text
            if len(snippet) > 260:
                snippet = snippet[:257].rstrip() + "…"

            scored.append(RetrievedChunk(doc=d, score=score, snippet=snippet))

        scored.sort(key=lambda x: x.score, reverse=True)
        return scored[:top_k]

