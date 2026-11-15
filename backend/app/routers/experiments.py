from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..data_loader import get_experiment, load_experiments
from ..models import EnrichedExperiment

router = APIRouter(prefix="/experiments", tags=["experiments"])

SORT_OPTIONS = {"relevance", "year", "title", "id"}


@router.get("", response_model=list[EnrichedExperiment])
def list_experiments(
    q: str | None = Query(default=None, description="free-text search"),
    platform: str | None = Query(default=None, description="exact platform match"),
    tag: str | None = Query(default=None, description="single safety tag"),
    sort: str = Query(default="relevance", description="relevance|year|title|id"),
) -> list[EnrichedExperiment]:
    if sort not in SORT_OPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"sort must be one of: {', '.join(sorted(SORT_OPTIONS))}",
        )

    records = list(load_experiments())

    if q:
        needle = q.strip().lower()
        records = [
            record
            for record in records
            if needle in record.title.lower()
            or needle in record.abstract.lower()
            or needle in record.fuel_material.lower()
            or any(needle in finding.lower() for finding in record.key_findings)
        ]
    if platform:
        records = [record for record in records if record.platform == platform]
    if tag:
        records = [record for record in records if tag in record.safety_tags]

    if sort == "relevance":
        records.sort(key=lambda r: (-r.safety_relevance_score, r.id))
    elif sort == "year":
        records.sort(key=lambda r: (-(r.year if r.year is not None else -1), r.id))
    elif sort == "title":
        records.sort(key=lambda r: r.title.lower())
    else:
        records.sort(key=lambda r: r.id)

    return records


@router.get("/{experiment_id}", response_model=EnrichedExperiment)
def read_experiment(experiment_id: str) -> EnrichedExperiment:
    record = get_experiment(experiment_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"unknown experiment id: {experiment_id}")
    return record
