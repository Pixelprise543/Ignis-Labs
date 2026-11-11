"""Every endpoint must return the shape CONTRACT.md promises."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.data_loader import load_experiments
from app.main import app

client = TestClient(app)

RECORD_KEYS = {
    "id",
    "title",
    "year",
    "platform",
    "fuel_material",
    "atmosphere",
    "abstract",
    "key_findings",
    "safety_tags",
    "source_url",
}
ENRICHED_KEYS = RECORD_KEYS | {
    "ai_summary",
    "safety_relevance_score",
    "rationale",
    "mission_implications",
}


def _first_id() -> str:
    records = load_experiments()
    assert records, "expected mock fallback records"
    return records[0].id


def test_health_shape() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_experiments_list_shape() -> None:
    response = client.get("/api/experiments")
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    for item in body:
        assert ENRICHED_KEYS <= set(item)
        assert set(item["atmosphere"]) == {"o2_percent", "pressure_kpa", "flow_cm_s"}
        assert 0 <= item["safety_relevance_score"] <= 100


def test_experiments_filters_and_sort() -> None:
    assert client.get("/api/experiments?q=zzz-no-match").json() == []
    assert client.get("/api/experiments?platform=ISS").status_code == 200
    assert client.get("/api/experiments?tag=suppression").status_code == 200
    assert client.get("/api/experiments?sort=year").status_code == 200
    assert client.get("/api/experiments?sort=bogus").status_code == 400


def test_experiment_detail_and_404() -> None:
    detail = client.get(f"/api/experiments/{_first_id()}")
    assert detail.status_code == 200
    assert ENRICHED_KEYS <= set(detail.json())
    assert client.get("/api/experiments/definitely-not-real").status_code == 404


def test_rankings_shape() -> None:
    response = client.get("/api/rankings?relevance=0.5&confidence=0.3&recency=0.2")
    assert response.status_code == 200
    body = response.json()
    assert body
    for item in body:
        assert ENRICHED_KEYS <= set(item)
        assert {"rank", "score_breakdown"} <= set(item)
        assert set(item["score_breakdown"]) == {"relevance", "confidence", "recency", "weights"}
    assert [item["rank"] for item in body] == list(range(1, len(body) + 1))


def test_compare_shape_and_order() -> None:
    records = load_experiments()
    wanted = [records[1].id, records[0].id]
    response = client.get("/api/compare", params={"ids": ",".join(wanted)})
    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == wanted
    assert client.get("/api/compare", params={"ids": "nope"}).status_code == 404


def test_insights_shape() -> None:
    response = client.post(
        "/api/insights",
        json={"experiment_ids": [_first_id()], "question": "Why does this matter?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"insight", "citations"}
    assert isinstance(body["insight"], str) and body["insight"].strip()
    assert isinstance(body["citations"], list)


def test_insights_rejects_unknown_ids() -> None:
    response = client.post("/api/insights", json={"experiment_ids": ["not-real"]})
    assert response.status_code == 404
