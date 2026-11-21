"""Claude helper: one structured-JSON call, through either of two backends.

- "cli" (default when no ANTHROPIC_API_KEY is set): runs the Claude Code CLI already installed and logged in on this PC
  (`claude -p ... --output-format json --json-schema ...`), so the work counts against the owner's Claude
  subscription plan limits instead of API billing. ANTHROPIC_API_KEY is removed from the CLI's environment so it can
  never silently switch to API billing. For personal use on this PC only; heavy volume can hit plan limits, which
  also slows other Claude sessions on the same subscription.
- "api": the Anthropic API with streaming, adaptive thinking, structured output and server-side refusal fallback.

Pick with REELBOT_CLAUDE_BACKEND=cli|api.
"""
from __future__ import annotations

import base64
import json
import os
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

from .config import CFG
from .cost import COST


class ClaudeError(RuntimeError):
    pass


def backend() -> str:
    b = os.environ.get("REELBOT_CLAUDE_BACKEND", "").strip().lower()
    if b in ("cli", "api"):
        return b
    return "api" if os.environ.get("ANTHROPIC_API_KEY") else "cli"


def ask_json(system: str, user: str | list, schema: dict, *, effort: str | None = None, max_tokens: int = 64000) -> dict:
    """Ask Claude for a JSON object that matches `schema` (JSON Schema, additionalProperties false).
    `user` is a string, or a list of content blocks (text + base64 images) for a vision request."""
    if backend() == "cli":
        return _ask_cli(system, user, schema)
    return _ask_api(system, user, schema, effort=effort, max_tokens=max_tokens)


# ---------------------------------------------------------------- subscription (Claude Code CLI)

def _claude_bin() -> str:
    exe = os.environ.get("REELBOT_CLAUDE_CLI") or shutil.which("claude") or shutil.which("claude.cmd")
    if not exe:
        raise ClaudeError("Claude Code CLI not found. Install it and log in (`claude`, then /login), "
                          "or set REELBOT_CLAUDE_CLI to its path, or use REELBOT_CLAUDE_BACKEND=api with an API key.")
    return exe


def _parse_result(stdout: str) -> dict:
    try:
        env = json.loads(stdout)
    except json.JSONDecodeError:
        raise ClaudeError(f"Claude CLI did not return JSON: {stdout[:400]}")
    if isinstance(env, list):  # some versions print a list of messages; the last one is the result
        env = next((m for m in reversed(env) if isinstance(m, dict) and m.get("type") == "result"), env[-1])
    COST.cli_calls += 1
    COST.cli_estimate_usd += float(env.get("total_cost_usd") or 0)
    if env.get("structured_output") is not None:
        return env["structured_output"]
    if env.get("is_error"):
        raise ClaudeError(f"Claude CLI error: {str(env.get('result'))[:400]}")
    text = str(env.get("result") or "").strip()
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ClaudeError(f"Claude CLI returned no JSON object: {text[:400]}")
    return json.loads(m.group(0))


def _ask_cli(system: str, user: str | list, schema: dict) -> dict:
    with tempfile.TemporaryDirectory(prefix="reelbot_") as tmp:
        tmpd = Path(tmp)
        (tmpd / "system.md").write_text(system, encoding="utf-8")
        extra: list[str] = []
        if isinstance(user, list):  # vision: write the images to files and let Claude Read them
            parts, n = [], 0
            for block in user:
                if block.get("type") == "text":
                    parts.append(block["text"])
                elif block.get("type") == "image":
                    n += 1
                    p = tmpd / f"frame_{n:03d}.jpg"
                    p.write_bytes(base64.b64decode(block["source"]["data"]))
                    parts.append(f"[image file: {p}]")
            prompt_body = "\n".join(parts) + "\n\nOpen and look at every image file listed above with the Read tool before answering."
            extra = ["--allowedTools", "Read", "--add-dir", str(tmpd), "--max-turns", str(n + 10)]
        else:
            prompt_body = user
            extra = ["--max-turns", "6"]
        cmd = [_claude_bin(), "-p", "Do the task described in the input below. Answer only with the requested JSON.",
               "--output-format", "json", "--json-schema", json.dumps(schema, separators=(",", ":")),
               "--model", CFG.claude_model, "--system-prompt-file", str(tmpd / "system.md"), *extra]
        env = {k: v for k, v in os.environ.items() if k not in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN")}
        for attempt in range(3):
            r = subprocess.run(cmd, input=prompt_body, capture_output=True, text=True, encoding="utf-8",
                               errors="replace", env=env, cwd=tmp, timeout=1800)
            if r.returncode == 0 and r.stdout.strip():
                return _parse_result(r.stdout)
            err = (r.stderr or r.stdout or "").strip()
            if re.search(r"usage limit|rate limit|limit reached|try again", err, re.I) and attempt < 2:
                print(f"  claude (subscription): limit hit, waiting 5 min: {err[:160]}")
                time.sleep(300)
                continue
            raise ClaudeError(f"Claude CLI failed (exit {r.returncode}): {err[:600]}")
    raise ClaudeError("Claude CLI kept hitting the plan limit; try later or switch to REELBOT_CLAUDE_BACKEND=api.")


# ---------------------------------------------------------------- API

_client = None


def client():
    global _client
    if _client is None:
        import anthropic
        CFG.require_keys("ANTHROPIC_API_KEY")
        _client = anthropic.Anthropic(max_retries=4)
    return _client


def _ask_api(system: str, user: str | list, schema: dict, *, effort: str | None, max_tokens: int) -> dict:
    import anthropic
    for attempt in range(3):
        try:
            with client().beta.messages.stream(
                model=CFG.claude_model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": user}],
                thinking={"type": "adaptive"},
                output_config={"effort": effort or CFG.claude_effort, "format": {"type": "json_schema", "schema": schema}},
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
