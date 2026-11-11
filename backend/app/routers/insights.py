from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..data_loader import load_experiments
from ..models import InsightRequest, InsightResponse
from ..services import grounding

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("", response_model=InsightResponse)
def insights(payload: InsightRequest) -> InsightResponse:
    by_id = {record.id: record for record in load_experiments()}
    missing = [item for item in payload.experiment_ids if item not in by_id]
    if missing:
        raise HTTPException(
            status_code=404, detail=f"unknown experiment id(s): {', '.join(missing)}"
        )
    selected = [by_id[item] for item in payload.experiment_ids]
    insight, citations = grounding.answer(selected, payload.question)
    return InsightResponse(insight=insight, citations=citations)
