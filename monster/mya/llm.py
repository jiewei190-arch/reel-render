"""Text generation adapters. Default: a LOCAL Ollama model (not Claude). Optional: the user's own Claude Code CLI.

There is deliberately no metered-API adapter. Strict local mode refuses non-local endpoints and cloud model tags.
Every response is validated against a JSON schema; invalid output is retried a bounded number of times.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import urllib.parse

import jsonschema
import requests

from .config import cfg


class LLMError(RuntimeError):
    pass


class Deferred(RuntimeError):
    """The chosen backend is unavailable right now (usage limit, server down). Retry later; never switch providers."""


LOCAL_HOSTS = {"127.0.0.1", "localhost", "::1"}


def backend() -> str:
    return os.environ.get("MYA_LLM", cfg().runtime.get("primary_llm_backend", "ollama_local"))


def ollama_model() -> str:
    m = os.environ.get("MYA_OLLAMA_MODEL") or cfg().runtime.get("ollama_model")
    if not m:
        raise LLMError("no Ollama model configured: run `python -m mya doctor` and set runtime.ollama_model "
                       "(or MYA_OLLAMA_MODEL) to an installed model")
    return m


def _check_local(endpoint: str, model: str) -> None:
    host = urllib.parse.urlparse(endpoint).hostname or ""
    if host not in LOCAL_HOSTS:
        raise LLMError(f"strict local mode: Ollama endpoint {endpoint} is not local")
    if re.search(r"(:|-)cloud\b", model):
        raise LLMError(f"strict local mode: '{model}' is a cloud model tag; choose a locally installed model")


def _ollama(system: str, user: str, schema: dict, temperature: float, max_tokens: int) -> dict:
    rt = cfg().runtime
    endpoint = os.environ.get("MYA_OLLAMA", rt["ollama_endpoint"])
    model = ollama_model()
    _check_local(endpoint, model)
    body = {"model": model, "stream": False, "format": schema, "keep_alive": "2m",
            "options": {"temperature": temperature, "num_ctx": rt.get("ollama_context_tokens_initial", 8192),
                        "num_predict": max_tokens, "repeat_penalty": 1.1},
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
    try:
        r = requests.post(endpoint.rstrip("/") + "/api/chat", json=body, timeout=900)
    except requests.RequestException as e:
        raise Deferred(f"local Ollama is not reachable at {endpoint}: {e}") from e
    if r.status_code != 200:
        raise LLMError(f"Ollama error {r.status_code}: {r.text[:300]}")
    text = r.json().get("message", {}).get("content", "")
    return json.loads(text)


def unload() -> None:
    """Release the local model's memory before GPU-heavy work (render)."""
    if backend() != "ollama_local":
        return
    try:
        requests.post(cfg().runtime["ollama_endpoint"].rstrip("/") + "/api/generate",
                      json={"model": ollama_model(), "keep_alive": 0}, timeout=30)
    except Exception:
        pass


def _claude_cli(system: str, user: str, schema: dict) -> dict:
    """The user's own Claude Code install (their account and limits). Prompt via stdin; API keys stripped."""
    exe = shutil.which("claude") or shutil.which("claude.cmd")
    if not exe:
        raise LLMError("MYA_LLM=claude_cli but the `claude` command is not installed")
    env = {k: v for k, v in os.environ.items() if k not in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN")}
    with tempfile.TemporaryDirectory() as d:
        sp = os.path.join(d, "system.md")
        open(sp, "w", encoding="utf-8").write(system)
        r = subprocess.run([exe, "-p", "--output-format", "json", "--json-schema", json.dumps(schema),
                            "--system-prompt-file", sp, "--max-turns", "4"], input=user, env=env, capture_output=True,
                           text=True, encoding="utf-8", errors="replace", timeout=900)
    out = (r.stdout or "") + (r.stderr or "")
    if re.search(r"usage limit|rate limit|limit reached", out, re.I):
        raise Deferred("Claude Code usage limit reached; job deferred (no switch to a billed API)")
    try:
        env_ = json.loads(r.stdout)
        if isinstance(env_, list):
            env_ = next((e for e in reversed(env_) if isinstance(e, dict) and e.get("type") == "result"), {})
        if env_.get("structured_output") is not None:
            return env_["structured_output"]
        return json.loads(env_.get("result", ""))
    except Exception as e:
        raise LLMError(f"Claude Code returned no structured output: {out[-400:]}") from e


def ask(system: str, user: str, schema: dict, *, temperature: float = 0.4, attempts: int | None = None,
        max_tokens: int = 800) -> dict:
    attempts = attempts or cfg().runtime.get("max_regenerations_per_stage", 2) + 1
    last = None
    for i in range(attempts):
        try:
            if backend() == "ollama_local":
                out = _ollama(system, user, schema, temperature, max_tokens)
            elif backend() == "claude_cli":
                out = _claude_cli(system, user, schema)
            else:
                raise LLMError(f"unknown LLM backend '{backend()}' (allowed: ollama_local, claude_cli)")
            jsonschema.validate(out, schema)
            return out
        except (json.JSONDecodeError, jsonschema.ValidationError) as e:
            last = e
            user = user + f"\n\nYour previous answer was invalid ({str(e)[:200]}). Return JSON matching the schema exactly."
            time.sleep(0.5)
    raise LLMError(f"model output failed schema validation {attempts} times: {last}")


def describe() -> str:
    if backend() == "ollama_local":
        try:
            return f"local Ollama model '{ollama_model()}' (this is NOT Claude)"
        except LLMError as e:
            return str(e)
    return "the user's own Claude Code CLI (their account limits apply)"
