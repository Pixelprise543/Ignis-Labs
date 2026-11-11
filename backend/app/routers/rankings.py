from __future__ import annotations

from fastapi import APIRouter, Query

from ..data_loader import load_experiments
from ..models import RankedExperiment
from ..services import ranking

router = APIRouter(prefix="/rankings", tags=["rankings"])


@router.get("", response_model=list[RankedExperiment])
def rankings(
    relevance: float = Query(default=0.5, ge=0.0, le=1.0),
    confidence: float = Query(default=0.3, ge=0.0, le=1.0),
    recency: float = Query(default=0.2, ge=0.0, le=1.0),
) -> list[RankedExperiment]:
    return ranking.rank(
        list(load_experiments()),
        relevance=relevance,
        confidence=confidence,
        recency=recency,
    )
