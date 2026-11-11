"""Context assembly, citation checking, and answer synthesis for /api/insights.

Every citation returned is validated against the ids actually selected, so the
API can never cite an experiment that does not exist.
"""

from __future__ import annotations

import re

from ..models import EnrichedExperiment
from . import llm

CITATION_RE = re.compile(r"\[([a-z0-9][a-z0-9-]*)\]")

SYSTEM = (
    "You answer questions about microgravity fire-safety research using ONLY the "
    "provided records. Cite each claim with the record id in square brackets, "
    "e.g. [flex-2012-iss]. Never cite an id that is not in the context."
)


def build_context(records: list[EnrichedExperiment]) -> str:
    lines: list[str] = []
    for record in records:
        year = int(record.year) if record.year is not None else "n.d."
        lines.append(
            f"- id={record.id} | {record.title} ({year}) | platform={record.platform} "
            f"| score={record.safety_relevance_score}"
        )
        if record.ai_summary:
            lines.append(f"  summary: {record.ai_summary}")
        if record.key_findings:
            lines.append("  findings: " + "; ".join(record.key_findings))
        if record.mission_implications:
            lines.append(f"  mission: {record.mission_implications}")
    return "\n".join(lines)


def known_ids(records: list[EnrichedExperiment]) -> set[str]:
    return {record.id for record in records}


def extract_citations(text: str) -> list[str]:
    return CITATION_RE.findall(text)


def validate_citations(citations: list[str], allowed: set[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for citation in citations:
        if citation in allowed and citation not in seen:
            seen.add(citation)
            ordered.append(citation)
    return ordered


def _fallback_answer(
    records: list[EnrichedExperiment], question: str | None
) -> tuple[str, list[str]]:
    if not records:
        return "No experiments were selected, so there is nothing to summarise.", []

    ordered = sorted(records, key=lambda r: -r.safety_relevance_score)
    top = ordered[:3]
    lead = (
        f"Question: {question.strip()}\n\n" if question and question.strip() else ""
    )
    parts = [
        lead
        + "Across the selected records, the highest safety relevance comes from "
        + ", ".join(f"{r.title} [{r.id}]" for r in top)
        + "."
    ]
    tags: dict[str, int] = {}
    for record in records:
        for tag in record.safety_tags:
            tags[tag] = tags.get(tag, 0) + 1
    if tags:
        ranked_tags = sorted(tags.items(), key=lambda item: (-item[1], item[0]))
        parts.append(
            "Recurring safety themes: "
            + ", ".join(f"{tag} ({count})" for tag, count in ranked_tags[:5])
            + "."
        )
    implications = [r.mission_implications for r in top if r.mission_implications]
    if implications:
        parts.append("Mission implications: " + " ".join(implications))
    parts.append(
        "This summary is generated without an LLM (LLM_API_KEY is unset); it only "
        "reorders and quotes the selected records."
    )
    return "\n\n".join(parts), [record.id for record in top]


def answer(
    records: list[EnrichedExperiment], question: str | None
) -> tuple[str, list[str]]:
    allowed = known_ids(records)
    if not llm.is_configured():
        return _fallback_answer(records, question)

    prompt = (
        "Selected records:\n"
        + build_context(records)
        + "\n\nQuestion: "
        + (question or "Summarise the fire-safety implications of these experiments.")
        + "\n\nAnswer in at most 150 words. Cite ids in square brackets."
    )
    try:
        text = llm.complete(prompt, system=SYSTEM, max_tokens=600)
    except llm.LLMUnavailable:
        return _fallback_answer(records, question)

    citations = validate_citations(extract_citations(text), allowed)
    if not citations:
        citations = [record.id for record in records[:3]]
    return text, citations
