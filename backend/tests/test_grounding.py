from __future__ import annotations

from app.data_loader import load_experiments
from app.services import grounding


def test_extract_citations_reads_bracketed_ids() -> None:
    assert grounding.extract_citations("see [abc-1] and [def-2]") == ["abc-1", "def-2"]


def test_validate_drops_ids_that_do_not_exist() -> None:
    allowed = grounding.known_ids(list(load_experiments()))
    assert grounding.validate_citations(["not-a-real-id"], allowed) == []


def test_validate_preserves_order_and_dedupes() -> None:
    records = list(load_experiments())
    allowed = grounding.known_ids(records)
    first = records[0].id
    second = records[1].id
    assert grounding.validate_citations([second, first, second], allowed) == [second, first]


def test_answer_only_cites_selected_records() -> None:
    records = list(load_experiments())[:3]
    insight, citations = grounding.answer(records, "What matters for suppression?")
    assert insight.strip()
    assert set(citations) <= grounding.known_ids(records)


def test_context_includes_every_selected_id() -> None:
    records = list(load_experiments())[:4]
    context = grounding.build_context(records)
    for record in records:
        assert record.id in context
