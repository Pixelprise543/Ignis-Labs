"""Weighted ranking with a transparent score_breakdown.

score = 100 * (w_relevance * relevance + w_confidence * confidence + w_recency * recency)
"""

from __future__ import annotations

from ..models import EnrichedExperiment, RankedExperiment, ScoreBreakdown

CURRENT_YEAR = 2026
RECENCY_SPAN_YEARS = 30.0


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def relevance_component(record: EnrichedExperiment) -> float:
    return _clamp01(record.safety_relevance_score / 100.0)


def confidence_component(record: EnrichedExperiment) -> float:
    checks = [
        record.year is not None,
        record.atmosphere.o2_percent is not None,
        record.atmosphere.pressure_kpa is not None,
        record.atmosphere.flow_cm_s is not None,
        bool(record.key_findings),
        bool(record.abstract),
        bool(record.source_url),
    ]
    return sum(1 for check in checks if check) / len(checks)


def recency_component(record: EnrichedExperiment) -> float:
    if record.year is None:
        return 0.0
    age = CURRENT_YEAR - float(record.year)
    return _clamp01(1.0 - (age / RECENCY_SPAN_YEARS))


def rank(
    records: list[EnrichedExperiment],
    relevance: float = 0.5,
    confidence: float = 0.3,
    recency: float = 0.2,
) -> list[RankedExperiment]:
    weights = {
        "relevance": float(relevance),
        "confidence": float(confidence),
        "recency": float(recency),
    }
    scored: list[tuple[float, EnrichedExperiment, ScoreBreakdown]] = []
    for record in records:
        breakdown = ScoreBreakdown(
            relevance=round(relevance_component(record), 4),
            confidence=round(confidence_component(record), 4),
            recency=round(recency_component(record), 4),
            weights=weights,
        )
        total = 100.0 * (
            weights["relevance"] * breakdown.relevance
            + weights["confidence"] * breakdown.confidence
            + weights["recency"] * breakdown.recency
        )
        scored.append((round(total, 2), record, breakdown))

    scored.sort(key=lambda item: (-item[0], item[1].id))
    return [
        RankedExperiment(
            **record.model_dump(), rank=index, score_breakdown=breakdown
        )
        for index, (_total, record, breakdown) in enumerate(scored, start=1)
    ]
