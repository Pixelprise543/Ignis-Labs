"""Turn a raw record into an EnrichedExperiment.

Uses the LLM when configured, otherwise a deterministic heuristic. Either way the
output is the same shape, so the frontend never has to care which path ran.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from ..models import EnrichedExperiment, Experiment
from . import cache, llm

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
SYSTEM = (
    "You are a fire-safety analyst summarising microgravity combustion research "
    "for human spaceflight. Be precise. Never invent numbers or findings that are "
    "not present in the supplied record."
)

TAG_WEIGHTS: dict[str, float] = {
    "flammability": 12.0,
    "flame-spread": 11.0,
    "suppression": 10.0,
    "material-selection": 9.0,
    "detection": 8.0,
    "extinction": 8.0,
    "smoldering": 7.0,
    "cabin-atmosphere": 6.0,
}


def _load_prompt(name: str) -> str:
    try:
        return (PROMPTS_DIR / name).read_text(encoding="utf-8")
    except OSError:
        return "{record}"


def completeness(record: Experiment) -> float:
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


def heuristic_score(record: Experiment) -> float:
    tag_points = sum(TAG_WEIGHTS.get(tag, 0.0) for tag in record.safety_tags)
    score = 25.0 + min(tag_points, 55.0) + 12.0 * completeness(record)
    o2 = record.atmosphere.o2_percent
    if o2 is not None and o2 >= 30.0:
        score += 6.0
    return round(max(0.0, min(100.0, score)), 1)


def _heuristic_text(record: Experiment) -> tuple[str, str, str]:
    tags = ", ".join(record.safety_tags) if record.safety_tags else "none recorded"
    year = int(record.year) if record.year is not None else None
    when = f"in {year}" if year else "at an unrecorded date"
    summary = (
        f"{record.title} studies {record.fuel_material or 'an unspecified material'} "
        f"on the {record.platform} platform {when}."
    )
    if record.key_findings:
        summary += " Key findings: " + "; ".join(record.key_findings[:3]) + "."

    rationale = (
        f"Safety relevance is driven by the tags this record carries ({tags}) and by "
        f"how complete its atmospheric and materials data is "
        f"({completeness(record) * 100:.0f}% of the expected fields are populated)."
    )

    implications: list[str] = []
    if "suppression" in record.safety_tags:
        implications.append("informs suppression-agent sizing and discharge strategy")
    if "material-selection" in record.safety_tags:
        implications.append("supports material screening for cabin interiors")
    if "detection" in record.safety_tags:
        implications.append("guides smoke and flame detector placement")
    if "flame-spread" in record.safety_tags:
        implications.append("constrains flame-spread limits used in cabin design")
    if "extinction" in record.safety_tags:
        implications.append("helps define the low-velocity blow-off limits relied on for fire response")
    if not implications:
        implications.append("contributes baseline flammability data for cabin-atmosphere planning")

    return summary, rationale, "; ".join(implications).capitalize() + "."


def _cache_key(record: Experiment) -> str:
    payload = json.dumps(record.model_dump(), sort_keys=True, ensure_ascii=False)
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return f"enrich:{digest}"


def enrich(raw: dict) -> EnrichedExperiment:
    """Accept a raw dict (possibly already enriched) and return an enriched model."""
    candidate = EnrichedExperiment.model_validate(raw)
    if candidate.ai_summary and candidate.rationale and candidate.mission_implications:
        return candidate

    record = Experiment.model_validate(raw)
    key = _cache_key(record)
    cached = cache.get(key)
    if cached:
        return EnrichedExperiment(**{**record.model_dump(), **cached})

    if llm.is_configured():
        try:
            summary, rationale, implications = _llm_text(record)
            enriched = EnrichedExperiment(
                **record.model_dump(),
                ai_summary=summary,
                safety_relevance_score=heuristic_score(record),
                rationale=rationale,
                mission_implications=implications,
            )
            cache.set(
                key,
                {
                    "ai_summary": summary,
                    "safety_relevance_score": enriched.safety_relevance_score,
                    "rationale": rationale,
                    "mission_implications": implications,
                },
            )
            return enriched
        except llm.LLMUnavailable:
            pass

    summary, rationale, implications = _heuristic_text(record)
    return EnrichedExperiment(
        **record.model_dump(),
        ai_summary=summary,
        safety_relevance_score=heuristic_score(record),
        rationale=rationale,
        mission_implications=implications,
    )


def _llm_text(record: Experiment) -> tuple[str, str, str]:
    template = _load_prompt("summarize.txt")
    prompt = template.format(record=record.model_dump_json(indent=2))
    text = llm.complete(prompt, system=SYSTEM, max_tokens=700)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    summary = lines[0] if lines else text
    rationale = text
    implications = "See rationale."
    return summary, rationale, implications
