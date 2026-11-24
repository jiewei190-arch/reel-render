"""Can the engine SHOW this story? A Short whose subject never appears on screen (a monkey-selfie case with no
monkey, a Zune drawn as a modern phone) fails the editor every time, and re-running doesn't help. So right after the
script, and before any voice or render money is spent, the story's key visual subjects are matched against the
engine's prop catalog (finance/render-pc/src/props/catalog.json). A story whose MAIN subject can't be shown stops
here with a clear message (pick another topic, or add the prop); `continue --force` overrides on purpose."""
from __future__ import annotations

import json
import re
from pathlib import Path

from . import claude
from .config import CFG

SCHEMA = {"type": "object", "additionalProperties": False, "required": ["subjects"],
          "properties": {"subjects": {"type": "array", "items": {
              "type": "object", "additionalProperties": False, "required": ["name", "role"],
              "properties": {"name": {"type": "string", "description": "the physical thing, e.g. 'monkey', 'Zune mp3 player', 'pregnant cow'"},
                             "role": {"type": "string", "enum": ["main", "supporting"]}}}}}}


def catalog() -> dict | None:
    p = Path(CFG.render_root) / "src" / "props" / "catalog.json"
    if not p.exists():
        return None
    data = json.loads(p.read_text(encoding="utf-8"))
    return data if isinstance(data, dict) else {d["kind"]: d for d in data}


def _words(s: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", s.lower()) if len(w) > 2}


def match(name: str, cat: dict) -> str | None:
    """The catalog kind that can stand in for this subject, or None."""
    want = _words(name)
    best, score = None, 0
    for kind, entry in cat.items():
        keys = {kind.lower(), *[k.lower() for k in entry.get("keywords", [])]}
        hit = sum(1 for w in want for k in keys if w == k or w in _words(k))
        if hit > score:
            best, score = kind, hit
    return best


def check(folder: Path, kit: str | None) -> tuple[bool, str]:
    """(ok, message). Only for the story kits (law3d/biz3d/cyber3d); skipped when the engine has no catalog yet."""
    if kit not in ("law3d", "biz3d", "cyber3d"):
        return True, ""
    cat = catalog()
    if cat is None:
        return True, "subject check skipped: the engine has no props catalog yet"
    cat = {k: v for k, v in cat.items() if not v.get("kits") or kit in v["kits"]}
    data = json.loads((folder / "script.json").read_text(encoding="utf-8"))
    res = claude.ask_json(
        "List the 1-3 PHYSICAL things a viewer must SEE for this story to make sense (an animal, a product, a "
        "device, an object at the centre of the case). Not people, not places, not abstract ideas. Mark the single "
        "most important one 'main'.",
        f"Topic: {data.get('topic', '')}\n\nScript:\n" + "\n".join(data["lines"]), SCHEMA, effort="low", max_tokens=2000)
    subjects = res["subjects"]
    found = {s["name"]: match(s["name"], cat) for s in subjects}
    data["visual_subjects"] = [{"name": n, "prop": k} for n, k in found.items()]
    (folder / "script.json").write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    missing_main = [s["name"] for s in subjects if s["role"] == "main" and not found[s["name"]]]
    if missing_main:
        return False, (f"the story's main subject can't be shown with the engine's props: {', '.join(missing_main)}. "
                       "Pick another topic, or add the prop to the catalog first.")
    return True, "subjects: " + ", ".join(f"{n} -> {k or 'none'}" for n, k in found.items())
