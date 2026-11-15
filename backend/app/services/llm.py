"""Provider-agnostic LLM client.

If `LLM_API_KEY` is empty - the default on a fresh checkout - callers fall back
to deterministic local heuristics. The API must never 500 merely because the
environment is incomplete.
"""

from __future__ import annotations

import httpx

from ..config import settings

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-latest"
OPENAI_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class LLMUnavailable(RuntimeError):
    """Raised when no provider is configured or the call fails."""


def is_configured() -> bool:
    return bool(settings.llm_api_key)


def complete(prompt: str, *, system: str = "", max_tokens: int = 1024) -> str:
    """Return the model's text, or raise LLMUnavailable."""
    if not is_configured():
        raise LLMUnavailable("LLM_API_KEY is not set")

    provider = settings.llm_provider
    if provider == "anthropic":
        return _anthropic(prompt, system, max_tokens)
    if provider in {"openai", "openai-compatible"}:
        return _openai(prompt, system, max_tokens)
    raise LLMUnavailable(f"unsupported LLM_PROVIDER: {provider!r}")


def _anthropic(prompt: str, system: str, max_tokens: int) -> str:
    payload: dict = {
        "model": settings.llm_model or DEFAULT_ANTHROPIC_MODEL,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        payload["system"] = system
    headers = {
        "x-api-key": settings.llm_api_key,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
    }
    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            response = client.post(ANTHROPIC_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise LLMUnavailable(f"anthropic request failed: {exc}") from exc

    text = "".join(
        block.get("text", "")
        for block in data.get("content", [])
        if isinstance(block, dict) and block.get("type") == "text"
    ).strip()
    if not text:
        raise LLMUnavailable("anthropic returned an empty response")
    return text


def _openai(prompt: str, system: str, max_tokens: int) -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    payload = {
        "model": settings.llm_model or DEFAULT_OPENAI_MODEL,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
    }
    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            response = client.post(OPENAI_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise LLMUnavailable(f"openai request failed: {exc}") from exc

    choices = data.get("choices") or []
    text = ""
    if choices and isinstance(choices[0], dict):
        text = (choices[0].get("message") or {}).get("content", "").strip()
    if not text:
        raise LLMUnavailable("openai returned an empty response")
    return text
