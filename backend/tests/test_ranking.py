from __future__ import annotations

from app.data_loader import load_experiments
from app.models import RankedExperiment
from app.services import ranking


def _total(record: RankedExperiment) -> float:
    breakdown = record.score_breakdown
    weights = breakdown.weights
    return (
        weights["relevance"] * breakdown.relevance
        + weights["confidence"] * breakdown.confidence
        + weights["recency"] * breakdown.recency
    )


def test_ranks_are_contiguous_from_one() -> None:
    ranked = ranking.rank(list(load_experiments()))
    assert ranked, "expected at least one record (mock fallback)"
    assert [record.rank for record in ranked] == list(range(1, len(ranked) + 1))


def test_sorted_by_weighted_score_descending() -> None:
    ranked = ranking.rank(list(load_experiments()))
    totals = [_total(record) for record in ranked]
    assert totals == sorted(totals, reverse=True)


def test_weights_are_echoed_in_breakdown() -> None:
    ranked = ranking.rank(list(load_experiments()), relevance=0.8, confidence=0.1, recency=0.1)
    assert ranked[0].score_breakdown.weights == {
        "relevance": 0.8,
        "confidence": 0.1,
        "recency": 0.1,
    }


def test_components_stay_in_unit_range() -> None:
    for record in ranking.rank(list(load_experiments())):
        breakdown = record.score_breakdown
        for value in (breakdown.relevance, breakdown.confidence, breakdown.recency):
            assert 0.0 <= value <= 1.0


def test_unknown_year_gets_zero_recency() -> None:
    records = list(load_experiments())
    record = records[0].model_copy(update={"year": None})
    assert ranking.recency_component(record) == 0.0
