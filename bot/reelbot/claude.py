"""Claude API helper: one structured-JSON call with streaming, adaptive thinking and server-side refusal fallback."""
from __future__ import annotations

import json
import time

import anthropic

from .config import CFG
from .cost import COST

_client: anthropic.Anthropic | None = None


def client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        CFG.require_keys("ANTHROPIC_API_KEY")
        _client = anthropic.Anthropic(max_retries=4)
    return _client


class ClaudeError(RuntimeError):
    pass


def ask_json(system: str, user: str | list, schema: dict, *, effort: str | None = None, max_tokens: int = 64000) -> dict:
    """Ask Claude for a JSON object that matches `schema` (JSON Schema, additionalProperties false).
    `user` is a string, or a list of content blocks (text + images) for a vision request."""
    for attempt in range(3):
        try:
            with client().beta.messages.stream(
                model=CFG.claude_model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": user}],
                thinking={"type": "adaptive"},
                output_config={
                    "effort": effort or CFG.claude_effort,
                    "format": {"type": "json_schema", "schema": schema},
                },
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
            ) as stream:
                msg = stream.get_final_message()
        except anthropic.RateLimitError as e:
            wait = int(e.response.headers.get("retry-after", "30"))
            print(f"  claude: rate limited, waiting {wait}s")
            time.sleep(wait)
            continue
        except anthropic.APIConnectionError:
            if attempt == 2:
                raise
            time.sleep(5 * (attempt + 1))
            continue

        COST.add_claude(msg.usage)
        if msg.stop_reason == "refusal":
            cat = getattr(msg.stop_details, "category", None) if msg.stop_details else None
            raise ClaudeError(f"Claude declined this request (category: {cat}).")
        if msg.stop_reason == "max_tokens":
            raise ClaudeError("Claude ran out of output tokens; try a shorter topic or raise max_tokens.")
        text = next((b.text for b in msg.content if b.type == "text"), None)
        if text is None:
            raise ClaudeError(f"No text in Claude's reply (stop_reason={msg.stop_reason}).")
        return json.loads(text)
    raise ClaudeError("Claude kept rate-limiting; try again later.")
