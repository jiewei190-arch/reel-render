"""reelbot: topic -> researched, fact-checked script -> ElevenLabs voice -> shot recipe -> GPU render -> QA'd video.

Nothing is ever uploaded. Finished videos land in REELBOT_OUTPUT_DIR/<slug>/ with UPLOAD.md for a human (or Creator).

  python -m reelbot make "why minimum payments trap you"            # stops after the script so you can read it
  python -m reelbot continue <slug>                                   # voice + recipe + render
  python -m reelbot make "..." --auto                                 # no stop, straight through
  python -m reelbot batch topics.txt                                  # one topic per line, --auto each
  python -m reelbot ideas --n 10                                      # fresh topic ideas (Gemini + Claude)
  python -m reelbot learn                                             # rank our Shorts by retention -> work/learnings.md
  python -m reelbot script|voice|recipe|render <slug>                 # redo one stage
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from . import claude, gemini, learn, recipe, render, script, voice
from .config import CFG
from .cost import COST


def _folder(slug: str) -> Path:
    return CFG.shorts_dir / slug


def _state(folder: Path) -> dict:
    p = folder / "state.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def _mark(folder: Path, stage: str, **extra) -> None:
    st = _state(folder)
    st[stage] = {"done": time.strftime("%Y-%m-%d %H:%M:%S"), **extra}
    (folder / "state.json").write_text(json.dumps(st, indent=1), encoding="utf-8")


def _pick_voice(arg: str) -> str:
    if arg != "auto":
        return arg
    n = sum(1 for p in CFG.shorts_dir.glob("*/voice.lines.json")) if CFG.shorts_dir.exists() else 0
    return "Tyler" if n % 2 == 0 else "Christopher"


def stage_script(topic: str, a) -> Path:
    if a.learn:
        learn.build()
    data = script.write(topic, seconds=a.seconds, style=a.style, notes=a.notes or "", n_hooks=a.hooks)
    folder = _folder(data["slug"])
    script.save(data, folder)
    _mark(folder, "script", topic=topic)
    print(f"\nSCRIPT ({data['style']}, hook: {data['hook_text']}): {folder}")
    for i, l in enumerate(data["lines"], 1):
        print(f"  {i}. {l}")
    if data.get("factcheck_unresolved"):
        print("\n  WARNING: the fact-check did not fully clear. Read sources.md before going further.")
    return folder


def stage_voice(folder: Path, a) -> None:
    v = _pick_voice(a.voice)
    dur = voice.record(folder, v, fit=a.seconds + 6)
    _mark(folder, "voice", voice=v, seconds=round(dur, 2))


def stage_recipe(folder: Path, a) -> None:
    recipe.build(folder)
    _mark(folder, "recipe")


def stage_render(folder: Path, a) -> None:
    final = render.render(folder)
    _mark(folder, "render", video=str(final))
    print(f"\nDONE: {final}")


def run_rest(folder: Path, a) -> None:
    st = _state(folder)
    if a.redo or "voice" not in st:
        stage_voice(folder, a)
    if a.redo or "recipe" not in st:
        stage_recipe(folder, a)
    stage_render(folder, a)


def cmd_ideas(a) -> None:
    text, sources = gemini.grounded(
        "List 25 money/personal-finance topics that are trending or newly surprising for US viewers this month "
        "(new fees, rate changes, viral money myths, tax-season traps, scams). For each: one line on why it is timely, "
        "with the key number and its source. No stock or crypto picks.")
    res = claude.ask_json(
        "You pick Block Money Short topics: Spender vs Saver stories with one clear money gap, a 'you' hook with a "
        "dollar figure in the first sentence, no advice or picks. Prefer topics small finance channels have not done to death.",
        f"From this research, choose the {a.n} best topics.\n\n{text}\n\nOur own retention data:\n{learn.current()}",
        {"type": "object", "additionalProperties": False, "required": ["topics"],
         "properties": {"topics": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                                                              "required": ["topic", "hook", "why"],
                                                              "properties": {"topic": {"type": "string"}, "hook": {"type": "string"}, "why": {"type": "string"}}}}}},
        effort="medium")
    for i, t in enumerate(res["topics"], 1):
        print(f"{i}. {t['topic']}\n   hook: {t['hook']}\n   why: {t['why']}")


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(prog="reelbot", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    def common(p):
        p.add_argument("--voice", default="auto", choices=["auto", "Tyler", "Christopher"])
        p.add_argument("--seconds", type=int, default=45, help="target length (default 45)")
        p.add_argument("--style", choices=["S1", "S2", "S3", "S4", "S5", "S6"])
        p.add_argument("--notes", help="extra direction for the script writer")
        p.add_argument("--redo", action="store_true", help="redo stages even if already done")
        p.add_argument("--hooks", type=int, default=6, help="hook candidates to write and score (0 = off)")
        p.add_argument("--no-learn", dest="learn", action="store_false", help="don't refresh learnings from Studio data first")

    p = sub.add_parser("make"); p.add_argument("topic"); p.add_argument("--auto", action="store_true"); common(p)
    p = sub.add_parser("continue"); p.add_argument("slug"); common(p)
    p = sub.add_parser("batch"); p.add_argument("file"); common(p)
    p = sub.add_parser("ideas"); p.add_argument("--n", type=int, default=10)
    p = sub.add_parser("learn"); p.add_argument("--channel", default="block_money")
    for name in ("script", "voice", "recipe", "render"):
        p = sub.add_parser(name); p.add_argument("slug"); common(p)
    a = ap.parse_args(argv)

    try:
        if a.cmd == "make":
            folder = stage_script(a.topic, a)
            if a.auto:
                run_rest(folder, a)
            else:
                print(f"\nRead it, then run:  python -m reelbot continue {folder.name}")
        elif a.cmd == "continue":
            run_rest(_folder(a.slug), a)
        elif a.cmd == "batch":
            topics = [t.strip() for t in Path(a.file).read_text(encoding="utf-8").splitlines() if t.strip() and not t.startswith("#")]
            for i, t in enumerate(topics, 1):
                print(f"\n=== [{i}/{len(topics)}] {t}")
                try:
                    run_rest(stage_script(t, a), a)
                except SystemExit as e:
                    print(f"  FAILED: {e}  (moving on)")
        elif a.cmd == "ideas":
            cmd_ideas(a)
        elif a.cmd == "learn":
            text = learn.build(a.channel)
            print(text or f"No metrics found under {learn._analytics_dir()} (set REELBOT_ANALYTICS_DIR).")
        elif a.cmd == "script":
            data = json.loads((_folder(a.slug) / "script.json").read_text(encoding="utf-8"))
            stage_script(data["topic"], a)
        elif a.cmd == "voice":
            stage_voice(_folder(a.slug), a)
        elif a.cmd == "recipe":
            stage_recipe(_folder(a.slug), a)
        elif a.cmd == "render":
            stage_render(_folder(a.slug), a)
    except claude.ClaudeError as e:
        sys.exit(f"Claude: {e}")
    finally:
        print(f"\ncost so far: {COST.summary()}")


if __name__ == "__main__":
    main()
