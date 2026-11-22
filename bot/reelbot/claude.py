"""Claude helper: one structured-JSON call, through either of two backends.

- "cli" (default when no ANTHROPIC_API_KEY is set): runs the Claude Code CLI already installed and logged in on this PC
  (`claude -p ... --output-format json --json-schema ...`), so the work counts against the owner's Claude
  subscription plan limits instead of API billing. ANTHROPIC_API_KEY is removed from the CLI's environment so it can
  never silently switch to API billing. For personal use on this PC only; heavy volume can hit plan limits, which
  also slows other Claude sessions on the same subscription.
- "api": the Anthropic API with streaming, adaptive thinking, structured output and server-side refusal fallback.

Pick with REELBOT_CLAUDE_BACKEND=cli|api|auto. Default: auto when ANTHROPIC_API_KEY is set (API credits first; when
the key's credit or monthly spend cap runs out, the same call is redone on the subscription and the API is retried
after REELBOT_API_RETRY_HOURS, default 12), else cli.
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


_client = None
_client_slot = None
EXHAUSTED_FLAG = Path(__file__).resolve().parent.parent / "work" / "api_exhausted.json"


def api_keys() -> list[tuple[int, str]]:
    """[(slot, key)] from ANTHROPIC_API_KEY (slot 1), ANTHROPIC_API_KEY_2, _3, ... Keys are never printed."""
    out = []
    if os.environ.get("ANTHROPIC_API_KEY"):
        out.append((1, os.environ["ANTHROPIC_API_KEY"]))
    for n in range(2, 21):
        k = os.environ.get(f"ANTHROPIC_API_KEY_{n}")
        if k:
            out.append((n, k))
    return out


def backend() -> str:
    """cli = subscription only; api = API keys only; auto (default with a key) = API keys first (one after another),
    then the subscription once every key's credit or spend cap has run out."""
    b = os.environ.get("REELBOT_CLAUDE_BACKEND", "").strip().lower()
    if b in ("cli", "api", "auto"):
        return b
    return "auto" if api_keys() else "cli"


def _exhausted_slots() -> dict:
    if not EXHAUSTED_FLAG.exists():
        return {}
    try:
        data = json.loads(EXHAUSTED_FLAG.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return {}
    ttl = float(os.environ.get("REELBOT_API_RETRY_HOURS", "12")) * 3600
    return {int(k): v for k, v in data.get("keys", {}).items() if time.time() - v["epoch"] < ttl}


def _live_keys() -> list[tuple[int, str]]:
    dead = _exhausted_slots()
    return [(slot, k) for slot, k in api_keys() if slot not in dead]


def _api_exhausted_recently() -> bool:
    return not _live_keys()


def _mark_exhausted(reason: str, slot: int = 1) -> None:
    data = {"keys": {}}
    if EXHAUSTED_FLAG.exists():
        try:
            data = json.loads(EXHAUSTED_FLAG.read_text(encoding="utf-8"))
            data.setdefault("keys", {})
        except Exception:  # noqa: BLE001
            data = {"keys": {}}
    data["keys"][str(slot)] = {"epoch": time.time(), "utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                               "reason": reason[:300]}
    EXHAUSTED_FLAG.parent.mkdir(parents=True, exist_ok=True)
    EXHAUSTED_FLAG.write_text(json.dumps(data, indent=1), encoding="utf-8")
    left = len(_live_keys())
    nxt = f"switching to API key slot {_live_keys()[0][0]}" if left else "switching to your Claude plan (subscription)"
    print(f"  claude: API key slot {slot} is out of credit; {nxt}. It is tried again after "
          f"{os.environ.get('REELBOT_API_RETRY_HOURS', '12')} h.")


class APIExhausted(ClaudeError):
    pass


class WebUnavailable(ClaudeError):
    """The API's server-side web search returned no usable results (often: web search is disabled for the
    organization in the Claude Console). Research must not continue without live sources."""


def _is_exhausted(e) -> bool:
    """Out of API credit or over the monthly spend cap (not an ordinary, temporary rate limit)."""
    import anthropic
    if not isinstance(e, anthropic.APIStatusError):
        return False
    if e.status_code == 402 or getattr(e, "type", None) == "billing_error":
        return True
    body = e.body if isinstance(getattr(e, "body", None), dict) else {}
    err = body.get("error", {}) if isinstance(body.get("error"), dict) else {}
    code = (err.get("details") or {}).get("error_code") if isinstance(err.get("details"), dict) else None
    if e.status_code == 429 and code == "enforced_spend_limit_reached":
        return True
    return e.status_code == 400 and "credit balance" in str(e).lower()  # older accounts report low credit as a 400


def _use_api() -> bool:
    return backend() in ("api", "auto") and bool(_live_keys())


def _with_keys(fn):
    """Run fn on each live API key in turn; a key that runs out is marked and the same call moves to the next.
    Returns (True, result) or (False, None) when every key is exhausted."""
    global _client, _client_slot
    while True:
        live = _live_keys()
        if not live or backend() == "cli":
            return False, None
        slot, key = live[0]
        if _client_slot != slot:
            import anthropic
            _client, _client_slot = anthropic.Anthropic(api_key=key, max_retries=4), slot
            COST.api_slot = slot
        try:
            return True, fn()
        except APIExhausted as e:
            _mark_exhausted(str(e), slot)
            if backend() == "api" and not _live_keys():
                raise


def ask_json(system: str, user: str | list, schema: dict, *, effort: str | None = None, max_tokens: int = 64000) -> dict:
    """Ask Claude for a JSON object that matches `schema` (JSON Schema, additionalProperties false).
    `user` is a string, or a list of content blocks (text + base64 images) for a vision request."""
    ok, res = _with_keys(lambda: _ask_api(system, user, schema, effort=effort, max_tokens=max_tokens))
    return res if ok else _ask_cli(system, user, schema)


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


WEB_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["text", "sources"],
    "properties": {"text": {"type": "string"},
                   "sources": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                               "required": ["title", "url"], "properties": {"title": {"type": "string"}, "url": {"type": "string"}}}}},
}


WEB_SYSTEM = ("You are a careful researcher. Use web search and web fetch to find current, reliable sources. "
              "Prefer primary and official sources. Never invent a source or a number; say 'not found' instead.")


def ask_web(prompt: str) -> tuple[str, list[dict]]:
    """Web research. Returns (text, [{title, url}]). API credits first (server-side web search) when a key is set,
    then the subscription CLI's own WebSearch/WebFetch. Used instead of Gemini grounding."""
    try:
        ok, res = _with_keys(lambda: _web_api(prompt))
    except WebUnavailable as e:
        print(f"  claude: {e} Using the Claude plan's web search for this step instead.")
        ok, res = False, None
    if ok:
        return res
    res = _ask_cli("You are a careful researcher. Use WebSearch and WebFetch to find current, reliable sources. "
                   "Prefer primary and official sources. Never invent a source or a number; say 'not found' instead. "
                   "Put the findings in `text` and every URL you actually used in `sources`.",
                   prompt, WEB_SCHEMA, tools=["WebSearch", "WebFetch"])
    return res["text"], res["sources"]


def _ask_cli(system: str, user: str | list, schema: dict, tools: list[str] | None = None) -> dict:
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
            extra = ["--allowedTools", *tools, "--max-turns", "25"] if tools else ["--max-turns", "6"]
        cmd = [_claude_bin(), "-p", "Do the task described in the input below. Answer only with the requested JSON.",
               "--output-format", "json", "--json-schema", json.dumps(schema, separators=(",", ":")),
               "--model", CFG.claude_model, "--system-prompt-file", str(tmpd / "system.md"), *extra]
        # the subscription login only: drop every API key and anything that could redirect the CLI to API billing
        # (keys, base URL, and CLAUDE_CODE_* vars inherited when reelbot itself runs inside a Claude Code session)
        env = {k: v for k, v in os.environ.items()
               if not (k.startswith("ANTHROPIC_") or k.startswith("CLAUDE_CODE_") or k in ("CLAUDECODE",))}
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

def client():
    global _client, _client_slot
    if _client is None:
        import anthropic
        live = _live_keys() or api_keys()
        if not live:
            CFG.require_keys("ANTHROPIC_API_KEY")
        _client_slot, key = live[0]
        _client = anthropic.Anthropic(api_key=key, max_retries=4)
        COST.api_slot = _client_slot
    return _client


def _web_api(prompt: str) -> tuple[str, list[dict]]:
    """Server-side web search + fetch on the API. No structured output here (it can't be combined with the
    citations these tools return), so the text and the result URLs are collected from the content blocks."""
    import anthropic
    messages = [{"role": "user", "content": prompt}]
    texts, sources, seen, errors, searches = [], [], set(), [], 0
    for _ in range(6):  # pause_turn: send the paused turn back so the server continues it
        try:
            with client().beta.messages.stream(
                model=CFG.claude_model, max_tokens=32000, system=WEB_SYSTEM, messages=messages,
                thinking={"type": "adaptive"}, output_config={"effort": "medium"},
                tools=[{"type": "web_search_20260209", "name": "web_search", "max_uses": 8},
                       {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 5}],
                betas=["server-side-fallback-2026-07-01"], fallbacks="default",
            ) as stream:
                msg = stream.get_final_message()
        except anthropic.APIStatusError as e:
            if _is_exhausted(e):
                raise APIExhausted(str(e)) from e
            raise
        COST.add_claude(msg.usage)
        stu = getattr(msg.usage, "server_tool_use", None)
        searches += int(getattr(stu, "web_search_requests", 0) or 0) if stu else 0
        for b in msg.content:
            if b.type == "text":
                texts.append(b.text)
            elif b.type in ("web_search_tool_result", "web_fetch_tool_result") and not isinstance(b.content, list) \
                    and getattr(b.content, "error_code", None):
                errors.append(str(b.content.error_code))  # server-tool errors come back as a result object, not a raise
            elif b.type == "web_fetch_tool_result" and getattr(b.content, "url", None) \
                    and not getattr(b.content, "error_code", None):  # a page fetched successfully is a source too
                url = b.content.url
                if url not in seen:
                    seen.add(url)
                    doc = getattr(b.content, "content", None)
                    sources.append({"title": getattr(doc, "title", "") or "", "url": url})
            elif b.type == "web_search_tool_result" and isinstance(b.content, list):  # an error result is an object
                for r in b.content:
                    url = getattr(r, "url", None)
                    if url and url not in seen:
                        seen.add(url)
                        sources.append({"title": getattr(r, "title", "") or "", "url": url})
        if msg.stop_reason == "refusal":
            raise ClaudeError("Claude declined this research request.")
        if msg.stop_reason != "pause_turn":
            break
        messages = [{"role": "user", "content": prompt}, {"role": "assistant", "content": msg.content}]
    COST.web_searches += searches
    if not sources and errors and not prompt.startswith("[retry]"):
        print(f"  claude: web fetch failed ({sorted(set(errors))}); retrying with web search only")
        return _web_api("[retry] Those pages could not be fetched. Use web_search (not web_fetch) and answer from the "
                        "search results.\n\n" + prompt)
    if not sources:
        raise WebUnavailable(f"API web search returned no sources ({searches} search request(s); errors: "
                             f"{sorted(set(errors)) or 'none'}). Is web search enabled for this organization in the Claude Console?")
    return "\n".join(texts).strip(), sources


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
        except anthropic.APIStatusError as e:
            if _is_exhausted(e):  # out of credit / spend cap: hand over to the subscription instead of retrying
                raise APIExhausted(str(e)) from e
            if not isinstance(e, anthropic.RateLimitError):
                raise
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
