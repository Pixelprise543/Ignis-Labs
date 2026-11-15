from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..data_loader import load_experiments
from ..models import EnrichedExperiment

router = APIRouter(prefix="/compare", tags=["compare"])


@router.get("", response_model=list[EnrichedExperiment])
def compare(
    ids: str = Query(..., description="comma-separated experiment ids, e.g. a,b,c"),
) -> list[EnrichedExperiment]:
    wanted = [item.strip() for item in ids.split(",") if item.strip()]
    if not wanted:
        raise HTTPException(status_code=400, detail="ids must contain at least one id")

    by_id = {record.id: record for record in load_experiments()}
    missing = [item for item in wanted if item not in by_id]
    if missing:
        raise HTTPException(
            status_code=404, detail=f"unknown experiment id(s): {', '.join(missing)}"
        )
    return [by_id[item] for item in wanted]
