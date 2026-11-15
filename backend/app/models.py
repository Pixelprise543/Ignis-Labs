"""Pydantic models mirroring CONTRACT.md."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Platform = Literal[
    "ISS",
    "drop tower",
    "parabolic flight",
    "sounding rocket",
    "free-flyer",
    "other",
]

SafetyTag = Literal[
    "flammability",
    "material-selection",
    "detection",
    "suppression",
    "smoldering",
    "flame-spread",
    "extinction",
    "cabin-atmosphere",
]


class Atmosphere(BaseModel):
    o2_percent: float | None = None
    pressure_kpa: float | None = None
    flow_cm_s: float | None = None


class Experiment(BaseModel):
    """A raw record, exactly as stored in data/experiments.json."""

    id: str
    title: str
    year: float | None = None
    platform: Platform = "other"
    fuel_material: str = ""
    atmosphere: Atmosphere = Field(default_factory=Atmosphere)
    abstract: str = ""
    key_findings: list[str] = Field(default_factory=list)
    safety_tags: list[SafetyTag] = Field(default_factory=list)
    source_url: str = ""


class EnrichedExperiment(Experiment):
    """Raw record plus the AI layer's additions."""

    ai_summary: str = ""
    safety_relevance_score: float = Field(default=0.0, ge=0, le=100)
    rationale: str = ""
    mission_implications: str = ""


class ScoreBreakdown(BaseModel):
    relevance: float
    confidence: float
    recency: float
    weights: dict[str, float]


class RankedExperiment(EnrichedExperiment):
    rank: int
    score_breakdown: ScoreBreakdown


class InsightRequest(BaseModel):
    experiment_ids: list[str] = Field(min_length=1)
    question: str | None = None


class InsightResponse(BaseModel):
    insight: str
    citations: list[str]


class HealthResponse(BaseModel):
    status: str = "ok"
