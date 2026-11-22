"""reelbot: topic -> researched, fact-checked script -> ElevenLabs voice -> shot recipe -> GPU render -> QA'd video.

Nothing is ever uploaded. Finished videos land in REELBOT_OUTPUT_DIR/<slug>/ with UPLOAD.md for a human (or Creator).

  python -m reelbot make "why minimum payments trap you"            # stops after the script so you can read it
  python -m reelbot continue <slug>                                   # voice + recipe + render
  python -m reelbot make "..." --auto                                 # no stop, straight through
  python -m reelbot batch topics.txt                                  # one topic per line, --auto each
  python -m reelbot ideas --n 10                                      # fresh topic ideas (Gemini + Claude)
  python -m reelbot bend "<a winning video or format>" --channel law  # adapt a proven format into ranked, checked topics
  python -m reelbot make "..." --channel biz --long                  # any channel: blockmoney, law, biz, cyber; --long = 16:9 ~10 min
  python -m reelbot learn                                             # rank our Shorts by retention -> work/learnings.md
  python -m reelbot script|voice|recipe|render <slug>                 # redo one stage
  python -m reelbot review <slug>                                     # AI editors review (and fix) the finished video
  python -m reelbot lambda setup                                      # once: AWS Lambda rendering (bot/aws/SETUP.md)
  python -m reelbot render <slug> --on lambda                         # render in the cloud instead of the PC
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

from . import bend, channels, claude, editor, gemini, lambda_render, learn, recipe, render, script, tone, voice, safety
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
    ch = channels.active()
    vs = ch.voices
    if getattr(_pick_voice, "long", False) and ch.long_voices:
        vs = ch.long_voices
    n = sum(1 for p in CFG.shorts_dir.glob("*/voice.lines.json")) if CFG.shorts_dir.exists() else 0
    return vs[n % len(vs)]


def stage_script(topic: str, a) -> Path:
    if a.learn:
        learn.build()
    data = script.write(topic, seconds=a.seconds, style=a.style, notes=a.notes or "", n_hooks=a.hooks)
    if data.get("format") == "landscape" and not data["slug"].endswith("-long"):
        data["slug"] += "-long"
    folder, n = _folder(data["slug"]), 2
    while folder.exists():  # never overwrite an earlier video's folder
        folder, n = _folder(f"{data['slug']}-{n}"), n + 1
    data["slug"] = folder.name
    script.save(data, folder)
    _mark(folder, "script", topic=topic)
    print(f"\nSCRIPT ({data['style']}, hook: {data['hook_text']}): {folder}")
    for i, l in enumerate(data["lines"], 1):
        print(f"  {i}. {l}")
    if data.get("factcheck_unresolved"):
        print("\n  WARNING: the fact-check did not fully clear. Read sources.md before going further.")
    return folder


def _voice_safety(folder: Path) -> None:
    sj = folder / "script.json"
    data = json.loads(sj.read_text(encoding="utf-8"))
    lines, vl, log = safety.fix(data["lines"], data.get("voice_lines"), data.get("topic", ""))
    if not log:
        print("  voice safety: all lines clear")
        return
    print("  voice safety: rewrote line(s) that read like a scam or debt demand out of context:")
    for l in log:
        print("    " + l)
    data["lines"], data["voice_lines"] = lines, vl
    data.setdefault("voice_safety", []).extend(log)
    sj.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    (folder / "script.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


def stage_voice(folder: Path, a) -> None:
    channels.use(channels.of_folder(folder))
    tone.apply(folder)  # emotion must fit each line's mood before anything is voiced
    _voice_safety(folder)  # nothing that reads like a scam/debt demand ever reaches ElevenLabs
    _pick_voice.long = json.loads((folder / "script.json").read_text(encoding="utf-8")).get("format") == "landscape"
    v = _pick_voice(a.voice)
    target = json.loads((folder / "script.json").read_text(encoding="utf-8")).get("target_seconds") or a.seconds
    dur = voice.record(folder, v, fit=target * 1.12 + 2)
    _mark(folder, "voice", voice=v, seconds=round(dur, 2))


def stage_recipe(folder: Path, a) -> None:
    ch = channels.use(channels.of_folder(folder))
    if not ch.renders:
        raise SystemExit(f"{ch.name}: script + voice are done in {folder}. This channel renders in its own engine "
                         f"({ch.entry}); hand it voice.wav + vo/timings.json + script.txt.")
    recipe.build(folder)
    _mark(folder, "recipe")


def stage_edit(folder: Path, final: Path, a) -> dict:
    """Review the render; while editors find serious problems, fix the recipe and re-render (up to --edit-rounds).
    A revise round can make things worse, so every round's video is kept and the BEST-scoring one (hook, then overall)
    ends up as the final video, with its recipe restored."""
    import shutil
    lines = json.loads((folder / "script.json").read_text(encoding="utf-8"))["lines"]
    r, rounds = {}, []
    for rnd in range(1, a.edit_rounds + 2):
        r = editor.review(final, lines)
        editor.report(final.parent, rnd, r)
        keep = final.with_name(f"{final.stem}.round{rnd}{final.suffix}")
        shutil.copy2(final, keep)
        shutil.copy2(folder / "recipe.json", folder / f"recipe_round{rnd}.json")
        rounds.append((rnd, r, keep))
        print(f"  editor round {rnd}: hook {r['hook']}, overall {r['scores']['overall']}, "
              f"predicted stayed {r['predicted_stayed_pct']}%, {len(r['serious'])} serious issue(s)")
        if r["passed"]:
            print("  editor: PASS")
            break
        if rnd > a.edit_rounds:
            print("  editor: still has issues after the last round; see EDIT_REPORT.md before posting")
            break
        fixes = [i for i in r["issues"] if i["severity"] != "minor"] or r["issues"]
        recipe.revise(folder, fixes, rnd)
        final = render.render(folder, on=a.on)
    best = max(rounds, key=lambda x: (x[1].get("passed", False), x[1]["hook"], x[1]["scores"]["overall"], -len(x[1]["serious"])))
    if best[0] != rounds[-1][0]:
        print(f"  editor: round {best[0]} scored better (hook {best[1]['hook']}, overall {best[1]['scores']['overall']}) "
              f"than the last round; keeping round {best[0]}'s video and recipe")
        shutil.copy2(best[2], final)
        shutil.copy2(folder / f"recipe_round{best[0]}.json", folder / "recipe.json")
        r = best[1]
        with open(final.parent / "EDIT_REPORT.md", "a", encoding="utf-8") as fh:
            fh.write(f"\n## Final video = round {best[0]} (best score)\n")
    for _, _, p in rounds:
        p.unlink(missing_ok=True)
    _mark(folder, "edit", passed=r.get("passed"), hook=r.get("hook"), predicted=r.get("predicted_stayed_pct"),
          best_round=best[0])
    return r


def stage_render(folder: Path, a) -> None:
    channels.use(channels.of_folder(folder))
    final = render.render(folder, on=a.on)
    _mark(folder, "render", video=str(final))
    if a.edit_rounds >= 0:
        stage_edit(folder, final, a)
    print(f"\nDONE: {final}  (edit notes: {final.parent / 'EDIT_REPORT.md'})")


def run_rest(folder: Path, a) -> None:
    sd = json.loads((folder / "script.json").read_text(encoding="utf-8"))
    if sd.get("factcheck_unresolved") and not getattr(a, "force", False):
        raise SystemExit(f"fact-check did not clear for {folder.name}: not voicing it (no credits spent). Read "
                         f"sources.md; fix the script and run `continue {folder.name} --force` to go on anyway.")
    st = _state(folder)
    if a.redo or "voice" not in st:
        stage_voice(folder, a)
    if a.redo or "recipe" not in st:
        stage_recipe(folder, a)
    stage_render(folder, a)


def cmd_ideas(a) -> None:
    text, sources = gemini.grounded(
        ("List 25 money/personal-finance topics that are trending or newly surprising for US viewers this month "
         "(new fees, rate changes, viral money myths, tax-season traps, scams). For each: one line on why it is timely, "
         "with the key number and its source. No stock or crypto picks.") if channels.active().id == "blockmoney" else
        (f"For this YouTube channel: {channels.active().brief}\nList 25 specific, TRUE, well-documented stories that "
         "would make gripping videos now: some timely (in the news this month), some evergreen classics. For each: the "
         "story in one line, why it grabs people, the key number or detail, and a source."))
    res = claude.ask_json(
        f"You pick video topics for this channel: {channels.active().brief} Hook rules: {channels.active().hook_rules} "
        "No advice of any kind. Prefer specific, true, documentable stories that small channels have not done to death.",
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
        p.add_argument("--channel", choices=list(channels.CHANNELS), help="which channel (default REELBOT_CHANNEL or blockmoney)")
        p.add_argument("--voice", default="auto", choices=["auto", *CFG.voices])
        p.add_argument("--long", action="store_true", help="long-form video: 16:9, chapters, ~10 min (sets --seconds 660: writers run ~14% short, so this lands at 9-10 min, past the 8-min mid-roll line)")
        p.add_argument("--seconds", type=int, default=45, help="target length (default 45)")
        p.add_argument("--style", choices=["S1", "S2", "S3", "S4", "S5", "S6"])
        p.add_argument("--notes", help="extra direction for the script writer")
        p.add_argument("--redo", action="store_true", help="redo stages even if already done")
        p.add_argument("--force", action="store_true", help="continue even though the fact-check did not clear")
        p.add_argument("--edit-rounds", type=int, default=int(os.environ.get("REELBOT_EDIT_ROUNDS", "1")), help="AI editor fix-and-rerender rounds after render (-1 = skip review)")
        p.add_argument("--hooks", type=int, default=6, help="hook candidates to write and score (0 = off)")
        p.add_argument("--no-learn", dest="learn", action="store_false", help="don't refresh learnings from Studio data first")
        p.add_argument("--on", choices=["pc", "lambda"], help="where to render (default REELBOT_RENDER_ON or pc)")

    p = sub.add_parser("make"); p.add_argument("topic"); p.add_argument("--auto", action="store_true"); common(p)
    p = sub.add_parser("continue"); p.add_argument("slug"); common(p)
    p = sub.add_parser("batch"); p.add_argument("file"); common(p)
    p = sub.add_parser("ideas"); p.add_argument("--n", type=int, default=10)
    p.add_argument("--channel", choices=list(channels.CHANNELS))
    p = sub.add_parser("bend"); p.add_argument("reference"); p.add_argument("--n", type=int, default=10)
    p.add_argument("--channel", choices=list(channels.CHANNELS))
    p = sub.add_parser("learn"); p.add_argument("--channel", choices=list(channels.CHANNELS))
    p = sub.add_parser("lambda"); p.add_argument("action", choices=["setup", "quotas"]); p.add_argument("--increase", action="store_true")
    for name in ("script", "voice", "recipe", "render", "review"):
        p = sub.add_parser(name); p.add_argument("slug"); common(p)
    a = ap.parse_args(argv)
    channels.use(channels.get(getattr(a, "channel", None)))
    if getattr(a, "long", False) and a.seconds == 45:
        a.seconds = 660

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
        elif a.cmd == "lambda":
            if a.action == "setup":
                lambda_render.setup()
            elif a.increase:
                lambda_render.quotas_increase()
            else:
                lambda_render.quotas()
        elif a.cmd == "bend":
            bend.run(a.reference, a.n)
        elif a.cmd == "ideas":
            cmd_ideas(a)
        elif a.cmd == "learn":
            text = learn.build()
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
        elif a.cmd == "review":
            ch = channels.use(channels.of_folder(_folder(a.slug)))
            v = channels.output_dir(ch) / a.slug / "video.mp4"
            stage_edit(_folder(a.slug), v, a)
    except claude.ClaudeError as e:
        sys.exit(f"Claude: {e}")
    finally:
        print(f"\ncost so far: {COST.summary()}")


if __name__ == "__main__":
    main()
