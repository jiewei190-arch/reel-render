"""Recipe stage: Claude turns the script + word timings into a shot recipe; the engine's own checker validates it.

The recipe format is the one the PC already renders (finance/render-pc/RECIPE_GUIDE.md). Claude gets the guide and real
example recipes, writes recipe.json, and `node tools/recipe_build.mjs <slug> --check` runs the clip QA and the
frame-0 gate. Every error is fed back to Claude until the check passes (or the attempt limit is hit).
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from . import claude
from .config import CFG

RECIPE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["recipe_json", "notes"],
    "properties": {
        "recipe_json": {"type": "string", "description": "the complete recipe.json file content"},
        "notes": {"type": "string", "description": "one paragraph: the shot plan and what changed since last attempt"},
    },
}


def _read(p: Path, limit: int | None = None) -> str:
    if not p.exists():
        return ""
    t = p.read_text(encoding="utf-8")
    return t[:limit] if limit else t


def _examples(style: str) -> str:
    """Real recipes that pass the gate: the style example + the most recent long Shorts, if present."""
    root = CFG.render_root
    picks: list[Path] = []
    ex = root / "docs" / "recipe_examples"
    if ex.exists():
        picks += sorted(p for p in ex.iterdir() if p.name.lower().startswith(style.lower() + "-"))
    for slug in ("raise-tax-myth", "minimum-payment-trap"):
        for base in (CFG.shorts_dir, root.parent / "shorts", CFG.repo_root / "finance" / "shorts"):
            if (base / slug / "recipe.json").exists():
                picks.append(base / slug)
                break
    out = []
    for d in picks[:3]:
        out.append(f"### Example: {d.name}\nscript.txt:\n{_read(d / 'script.txt')}\nrecipe.json:\n{_read(d / 'recipe.json')}")
    return "\n\n".join(out) or "(no example recipes found on this machine)"


def _check(slug: str) -> tuple[bool, str]:
    cmd = [CFG.node, "tools/recipe_build.mjs", slug, "--check", "--shorts", str(CFG.shorts_dir)]
    r = subprocess.run(cmd, cwd=CFG.render_root, capture_output=True, text=True, encoding="utf-8", errors="replace")
    out = (r.stdout + "\n" + r.stderr).strip()
    return r.returncode == 0, out[-6000:]


def build(folder: Path) -> None:
    data = json.loads((folder / "script.json").read_text(encoding="utf-8"))
    slug, style = data["slug"], data["style"]
    timings = (folder / "vo" / "timings.json").read_text(encoding="utf-8")
    guide = _read(CFG.render_root / "RECIPE_GUIDE.md") or _read(CFG.repo_root / "finance" / "render-pc" / "RECIPE_GUIDE.md")
    if not guide:
        raise SystemExit(f"RECIPE_GUIDE.md not found under {CFG.render_root}. Set REELBOT_RENDER_ROOT to the PC's blocky-render folder.")
    system = (
        "You are the shot designer for Block Money Shorts. You write recipe.json files for the Remotion recipe engine "
        "described in the guide below. Follow the schema exactly: every time anchor must be a word that exists in the "
        "timings, every pose/camera/motion/fx/set/prop must be one the guide lists. Use only the SPENDER and SAVER cast. "
        "Respect the frame-0 gate (close subject, hook text at frame 0, stake on screen by 0.5 s, first cut by ~1.0 s, "
        "no wide shot in the first second), keep captions bottom-centre and props clear of faces, cut every 1.5-3 s, "
        "put the big number on screen when it is said, and end with a loop board that lands on the last spoken word.\n\n"
        "=== RECIPE_GUIDE.md ===\n" + guide
    )
    base = (
        f"slug: {slug}\nstyle: {style}\nhook_text (frame 0, keep it): {data['hook_text']}\n"
        f"tag_text: {data['tag_text']}\n\nscript.txt:\n" + "\n".join(data["lines"])
        + f"\n\nvo/timings.json (word anchors come from here):\n{timings}\n\n=== Working examples ===\n{_examples(style)}"
    )
    feedback = ""
    for attempt in range(1, CFG.recipe_attempts + 1):
        print(f"  claude: writing recipe.json (attempt {attempt})...")
        res = claude.ask_json(system, base + feedback, RECIPE_SCHEMA)
        try:
            recipe = json.loads(res["recipe_json"])
        except json.JSONDecodeError as e:
            feedback = f"\n\nYour last recipe_json was not valid JSON ({e}). Return valid JSON."
            continue
        recipe["slug"] = slug
        (folder / "recipe.json").write_text(json.dumps(recipe, indent=1, ensure_ascii=False), encoding="utf-8")
        ok, log = _check(slug)
        (folder / f"recipe_check_{attempt}.log").write_text(log, encoding="utf-8")
        if ok:
            print("  recipe: check passed (clip QA + frame-0 gate)")
            return
        print("  recipe: check failed, sending the errors back to Claude")
        feedback = ("\n\n=== Your previous recipe.json ===\n" + json.dumps(recipe, indent=1)
                    + "\n\n=== recipe_build --check output (fix every CLIP and FAIL) ===\n" + log)
    raise SystemExit(f"recipe.json still fails the check after {CFG.recipe_attempts} attempts; "
                     f"see {folder}/recipe_check_*.log. Fix by hand or rerun `reelbot recipe {slug}`.")
