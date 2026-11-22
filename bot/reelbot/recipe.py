"""Recipe stage: Claude turns the script + word timings into a shot recipe; the engine's own checker validates it.

The recipe format is the one the PC already renders (finance/render-pc/RECIPE_GUIDE.md). Claude gets the guide and real
example recipes, writes recipe.json, and `node tools/recipe_build.mjs <slug> --check` runs the clip QA and the
frame-0 gate. Every error is fed back to Claude until the check passes (or the attempt limit is hit).
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

from . import channels, claude, locks
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


def _kit_examples(kit: str) -> list[Path]:
    """Recipes in the shorts folders that use this kit (the kit builder's demo is always one)."""
    found = []
    for base in (CFG.shorts_dir, CFG.render_root.parent / "shorts", CFG.repo_root / "finance" / "shorts"):
        if not base.exists():
            continue
        for d in sorted(base.iterdir()):
            r = d / "recipe.json"
            if r.exists() and f'"kit": "{kit}"' in r.read_text(encoding="utf-8", errors="replace").replace('"kit":"', '"kit": "'):
                found.append(d)
    return found


def _examples(style: str, kit: str | None = None) -> str:
    """Real recipes that pass the gate: the style example + the most recent long Shorts, if present."""
    root = CFG.render_root
    picks: list[Path] = []
    if kit:
        picks = _kit_examples(kit)[-3:]
        out = [f"### Example: {d.name}\nscript.txt:\n{_read(d / 'script.txt')}\nrecipe.json:\n{_read(d / 'recipe.json')}"
               for d in picks]
        return "\n\n".join(out) or f"(no {kit} example recipes found; follow the kit guide exactly)"
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


def _git_state() -> tuple[set[str], set[str]]:
    """(modified tracked files, untracked files) under src/, relative to the engine's git root."""
    r = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all", "--", "src"], cwd=CFG.render_root,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    mod, new = set(), set()
    for line in r.stdout.splitlines():
        (new if line.startswith("??") else mod).add(line[3:].strip().strip('"'))
    return mod, new


def _typecheck(slug: str) -> tuple[bool, str]:
    """Build for real and run the same `tsc --noEmit` the render runs. --check doesn't validate every enum/type in
    the generated code (e.g. a board pos "low"), and one bad generated file breaks EVERY kit's render, so on failure
    every file this build touched is rolled back and the errors go back to the writer."""
    npx = shutil.which("npx") or "npx"
    before_mod, before_new = _git_state()
    b = subprocess.run([CFG.node, "tools/recipe_build.mjs", slug, "--shorts", str(CFG.shorts_dir)], cwd=CFG.render_root,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    t = subprocess.run([npx, "--no-install", "tsc", "--noEmit"], cwd=CFG.render_root, capture_output=True, text=True,
                       encoding="utf-8", errors="replace") if b.returncode == 0 else b
    if b.returncode == 0 and t.returncode == 0:
        return True, ""
    mod, new = _git_state()
    root = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=CFG.render_root, capture_output=True,
                          text=True).stdout.strip()
    for f in sorted(mod - before_mod):
        subprocess.run(["git", "checkout", "--", f], cwd=root or CFG.render_root, capture_output=True)
    for f in sorted(new - before_new):
        (Path(root or CFG.render_root) / f).unlink(missing_ok=True)
    out = (t.stdout + "\n" + t.stderr).strip()
    errs = [l for l in out.splitlines() if "error" in l.lower()]
    detail = "\n".join(f"FAIL {l}" for l in errs[:40]) if errs else out[-3000:]
    return False, ("TYPE CHECK FAILED after a successful --check: the generated code has invalid values. Use only the "
                   "allowed values the kit's guide lists for each field (each error names the allowed set):\n" + detail)


def _check(slug: str) -> tuple[bool, str]:
    cmd = [CFG.node, "tools/recipe_build.mjs", slug, "--check", "--shorts", str(CFG.shorts_dir)]
    from .render import ENGINE_LOCK
    with locks.held(ENGINE_LOCK, f"check {slug}"):  # another channel's build may be writing generated files
        r = subprocess.run(cmd, cwd=CFG.render_root, capture_output=True, text=True, encoding="utf-8", errors="replace")
        out = (r.stdout + "\n" + r.stderr).strip()
        if r.returncode != 0:
            return False, out[-6000:]
        ok, terr = _typecheck(slug)
    return ok, (out[-3000:] + ("\n\n" + terr if terr else ""))


def _context(folder: Path) -> tuple[dict, str, str]:
    data = json.loads((folder / "script.json").read_text(encoding="utf-8"))
    slug, style = data["slug"], data["style"]
    ch = channels.get(data.get("channel"))
    timings = (folder / "vo" / "timings.json").read_text(encoding="utf-8")
    gname = f"KIT_{ch.kit.upper()}.md" if ch.kit else "RECIPE_GUIDE.md"
    guide = _read(CFG.render_root / gname) or _read(CFG.repo_root / "finance" / "render-pc" / gname)
    if not guide:
        raise SystemExit(f"{gname} not found under {CFG.render_root}. Set REELBOT_RENDER_ROOT to the PC's blocky-render "
                         f"folder{' and install the ' + ch.kit + ' kit' if ch.kit else ''}.")
    long_note = ""
    if data.get("format") == "landscape":
        long_note = ("\n\nTHIS IS A LONG-FORM LANDSCAPE VIDEO: set \"format\": \"landscape\" and \"chapters\" from the script's "
                     "chapters (title + the word that opens it), and follow LONGFORM.md: a visual change every 3-6 s, "
                     "a new beat every 20-40 s.\n\n=== LONGFORM.md ===\n" + _read(CFG.render_root / "LONGFORM.md"))
    system = (
        f"You are the shot designer for {ch.name}. You write recipe.json files for the Remotion recipe engine "
        "described in the guide below. Follow the schema exactly: every time anchor must be a word that exists in the "
        f"timings, every pose/camera/motion/fx/set/prop must be one the guide lists. {ch.cast_rule} "
        + (f'Set "kit": "{ch.kit}" in the recipe. ' if ch.kit else "") + 
        "Respect the frame-0 gate (close subject, hook text at frame 0, stake on screen by 0.5 s, first cut by ~1.0 s, "
        "no wide shot in the first second), keep captions bottom-centre and props clear of faces, cut every 1.5-3 s, "
        "put the big number on screen when it is said, and end with a loop board that lands on the last spoken word.\n\n"
        f"=== {gname} ===\n" + guide + long_note
    )
    base = (
        f"slug: {slug}\nstyle: {style}\nhook_text (frame 0, keep it): {data['hook_text']}\n"
        f"tag_text: {data['tag_text']}\n\nscript.txt:\n" + "\n".join(data["lines"])
        + f"\n\nvo/timings.json (word anchors come from here):\n{timings}\n\n=== Working examples ===\n{_examples(style, ch.kit)}"
    )
    return data, system, base


def _loop(folder: Path, slug: str, system: str, base: str, feedback: str, tag: str) -> None:
    ch = channels.of_folder(folder)
    history: list[list[str]] = []
    for attempt in range(1, CFG.recipe_attempts + 1):
        print(f"  claude: writing recipe.json ({tag}, attempt {attempt})...")
        res = claude.ask_json(system, base + feedback, RECIPE_SCHEMA)
        try:
            recipe = json.loads(res["recipe_json"])
        except json.JSONDecodeError as e:
            feedback = f"\n\nYour last recipe_json was not valid JSON ({e}). Return valid JSON."
            continue
        recipe["slug"] = slug
        if ch.kit:
            recipe["kit"] = ch.kit
        (folder / "recipe.json").write_text(json.dumps(recipe, indent=1, ensure_ascii=False), encoding="utf-8")
        ok, log = _check(slug)
        (folder / f"recipe_check_{tag}_{attempt}.log").write_text(log, encoding="utf-8")
        if ok:
            print("  recipe: check passed (clip QA + frame-0 gate)")
            return
        print("  recipe: check failed, sending the errors back to Claude")
        fails = [l.strip() for l in log.splitlines() if l.strip().startswith(("FAIL", "CLIP"))]
        history.append(fails)
        earlier = "".join(f"\nattempt {k}: " + " | ".join(h[:12]) for k, h in enumerate(history[:-1], 1) if h)
        feedback = ("\n\n=== Your previous recipe.json ===\n" + json.dumps(recipe, indent=1)
                    + "\n\n=== recipe_build --check output (fix every CLIP and FAIL) ===\n" + log
                    + ("\n\n=== Failures in EARLIER attempts (don't swing back into them) ===" + earlier if earlier else "")
                    + "\n\nIf one board or prop fails 'crosses the frame edge' when big and 'text too small' when "
                      "smaller, stop rescaling it: shorten or drop its text (another board can carry the word), split "
                      "it into two boards, or pull the camera back. Never undo a fix that cleared an earlier failure.")
    raise SystemExit(f"recipe.json still fails the check after {CFG.recipe_attempts} attempts; "
                     f"see {folder}/recipe_check_*.log. Fix by hand or rerun `reelbot recipe {slug}`.")


def build(folder: Path) -> None:
    data, system, base = _context(folder)
    _loop(folder, data["slug"], system, base, "", "new")


def revise(folder: Path, issues: list[dict], rnd: int) -> None:
    """Rewrite the recipe to fix the editors' timestamped issues, keeping everything that works."""
    data, system, base = _context(folder)
    current = (folder / "recipe.json").read_text(encoding="utf-8")
    (folder / f"recipe_before_edit{rnd}.json").write_text(current, encoding="utf-8")
    notes = "\n".join(f"- {i['t_start']:.1f}-{i['t_end']:.1f}s [{i['severity']}/{i['category']}] {i['problem']} -> FIX: {i['fix']}"
                      for i in issues)
    feedback = ("\n\n=== The current recipe.json (rendered and reviewed) ===\n" + current
                + "\n\n=== Editors' notes on the rendered video (fix every blocker and major; minors if cheap) ===\n"
                + notes + "\n\nChange only what the notes need; keep the shots that work. The voice and timings are fixed: "
                  "fix pacing with cuts, camera moves, boards and sound, not by changing the words.")
    _loop(folder, data["slug"], system, base, feedback, f"edit{rnd}")
