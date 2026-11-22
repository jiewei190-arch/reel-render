"""Doc-engine long-form writer: plumbing tests with a stubbed claude.ask_json (no API money).

The stub returns the engine's reference chapters (finance/longform/pearson-doc, copied to tests/fixtures). Unit tests
fake the node checker; the integration test at the bottom runs the real `tools/doc_build.mjs --check` when an engine
checkout with node_modules is available (REELBOT_TEST_ENGINE, default ../../rr-all/finance/render-pc).

  cd bot && python -m pytest tests -q
"""
from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path

import pytest

from reelbot import claude, docwriter, recipe, render
from reelbot.config import CFG
from reelbot.cost import COST

FIX = Path(__file__).parent / "fixtures" / "pearson-doc"
REF = {n: (FIX / "chapters" / f"{n:02d}.json").read_text(encoding="utf-8") for n in (1, 2, 3)}
REF_DOC = json.loads((FIX / "doc.json").read_text(encoding="utf-8"))
ENGINE = Path(os.environ.get("REELBOT_TEST_ENGINE",
                             Path(__file__).resolve().parents[3] / "rr-all" / "finance" / "render-pc"))
SLUG = "pearson-doc"


def _script_json() -> dict:
    lines = [l for l in (FIX / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
    return {
        "slug": SLUG, "title": "The $54 Million Pants", "style": "story", "channel": "law", "format": "landscape",
        "hook_text": "A judge sued his dry cleaner for $54 million", "tag_text": "", "lines": lines,
        "chapters": [{"title": "The Missing Pants", "starts_with": "In 2005, Roy Pearson"},
                     {"title": "The $67 Million Demand", "starts_with": "The Chungs tried"},
                     {"title": "The Verdict", "starts_with": "The trial began"}],
        "sources": [{"title": s, "url": "https://example.org/case"} for s in REF_DOC["sources"]], "claims": [],
    }


@pytest.fixture()
def video(tmp_path, monkeypatch):
    """A shorts dir with one long-form law video (script.json + the reference timings) and a stub engine root."""
    shorts, engine = tmp_path / "shorts", tmp_path / "engine"
    folder = shorts / SLUG
    (folder / "vo").mkdir(parents=True)
    shutil.copy2(FIX / "vo" / "timings.json", folder / "vo" / "timings.json")
    shutil.copy2(FIX / "script.txt", folder / "script.txt")
    (folder / "script.json").write_text(json.dumps(_script_json(), indent=1), encoding="utf-8")
    (engine / "out").mkdir(parents=True)
    (engine / "KIT_DOC.md").write_text("# KIT_DOC.md (stub)\n", encoding="utf-8")
    (engine / "KIT_LAW3D.md").write_text("# KIT_LAW3D.md (stub)\n", encoding="utf-8")
    monkeypatch.setattr(CFG, "shorts_dir", shorts)
    monkeypatch.setattr(CFG, "render_root", engine)
    monkeypatch.setattr(CFG, "output_dir", tmp_path / "videos" / "BlockMoney")
    monkeypatch.setattr(render, "ENGINE_LOCK", engine / "out" / "reelbot_engine.lock")
    return folder


class StubClaude:
    """claude.ask_json stand-in: the plan call gets the reference hook/cast; chapter calls get the reference chapters,
    or a scripted bad version first. Every call is recorded and 'costs' 1000 in / 500 out tokens."""

    def __init__(self, bad: dict[int, list[str]] | None = None):
        self.calls: list[dict] = []
        self.bad = {k: list(v) for k, v in (bad or {}).items()}

    def __call__(self, system, user, schema, *, effort=None, max_tokens=64000):
        COST.claude_in += 1000
        COST.claude_out += 500
        if schema is docwriter.PLAN_SCHEMA:
            self.calls.append({"kind": "plan", "user": user, "effort": effort, "max_tokens": max_tokens})
            return {"hook_text": REF_DOC["hook"]["text"], "cast_json": json.dumps(REF_DOC["kit3d"]["cast"]),
                    "beats": ["23:cried", "99:nowhere"], "notes": "stub"}
        assert schema is docwriter.CHAPTER_SCHEMA
        n = int(re.search(r"Write chapter (\d+) of", user).group(1))
        self.calls.append({"kind": "chapter", "n": n, "user": user, "system": system, "effort": effort,
                           "max_tokens": max_tokens})
        body = self.bad[n].pop(0) if self.bad.get(n) else REF[n]
        return {"chapter_json": body, "summary": f"chapter {n} summary", "card": "", "number_exempt": [],
                "notes": "stub"}

    def chapters(self) -> list[int]:
        return [c["n"] for c in self.calls if c["kind"] == "chapter"]


def _fake_checker(monkeypatch, video_logs: list[str] | None = None, tsc: list[tuple[bool, str]] | None = None):
    """Fake node: a chapter fails while it shows '$1,600' (the reference says $1,500); the whole-video check plays
    the given logs in order, then passes. Records every command."""
    seen: list[list[str]] = []
    video_logs = list(video_logs or [])
    tsc = list(tsc or [])

    def run(cmd):
        seen.append(cmd)
        if "--chapter" in cmd:
            n = int(cmd[cmd.index("--chapter") + 1])
            txt = (CFG.shorts_dir / SLUG / "chapters" / f"{n:02d}.json").read_text(encoding="utf-8")
            if "$1,600" in txt:
                return False, ("FAIL  sanity S1: ... 1 number\n--- 1 line(s) to fix:\n"
                               "  FAIL S23 stat shows 1,600 ('$1,600'), a number that is not in the script or sources\n"
                               f"FAILED (chapter {n} only)")
            return True, f"PASSED (chapter {n} only)"
        if video_logs:
            return False, video_logs.pop(0)
        return True, "PASSED (the whole video)"

    monkeypatch.setattr(docwriter, "_run", run)
    monkeypatch.setattr(recipe, "typecheck_build", lambda cmd: (seen.append(["TSC", *cmd]) or (tsc.pop(0) if tsc else (True, ""))))
    return seen


# ------------------------------------------------------------------ routing + outline

def test_applies_only_to_long_law_biz_cyber(video, monkeypatch):
    d = _script_json()
    assert docwriter.applies(d)
    assert not docwriter.applies({**d, "format": "portrait"})        # Shorts keep the kit recipe path
    assert not docwriter.applies({**d, "channel": "blockmoney"})
    monkeypatch.setenv("REELBOT_DOC_ENGINE", "0")
    assert not docwriter.applies(d)


def test_outline_matches_reference_doc(video):
    out = docwriter.outline(_script_json(), docwriter._words(video))
    assert [c["from"] for c in out] == [c["from"] for c in REF_DOC["chapters"]]  # 1:A, 14:The, 22:The
    assert out[0]["card"] == "7:In"                                              # first line after the cold open
    assert docwriter.comp(SLUG) == "PearsonDocDoc"
    assert docwriter.comp("weird-case-long") == "WeirdCaseLongDoc"


def test_route_real_fail_lines(video, monkeypatch):
    _fake_checker(monkeypatch)
    monkeypatch.setattr(claude, "ask_json", StubClaude())
    docwriter.build(video)  # lays down doc.json + the 3 reference chapters
    log = (Path(__file__).parent / "fixtures" / "whole_video_fail.log").read_text(encoding="utf-8")
    details, rows = docwriter.fail_lines(log)
    assert len(details) == 4 and len(rows) == 4
    routed, loose = docwriter.route(video, details)
    assert loose == []
    assert {k: len(v) for k, v in routed.items()} == {1: 1, 2: 2, 3: 1}
    assert "S27" in routed[3][0]       # by scene id (S27 is chapter 3's 2nd scene)
    assert "$1,500" in routed[2][0]    # no id: by its time (88.55 s is in chapter 2)
    assert "S04" in routed[1][0]


# ------------------------------------------------------------------ the writer loop

def test_build_happy_path_one_call_per_chapter(video, monkeypatch):
    seen = _fake_checker(monkeypatch)
    stub = StubClaude()
    monkeypatch.setattr(claude, "ask_json", stub)
    docwriter.build(video)
    assert [c["kind"] for c in stub.calls] == ["plan", "chapter", "chapter", "chapter"]
    assert stub.chapters() == [1, 2, 3]
    assert all(c["effort"] == "medium" and c["max_tokens"] <= 32000 for c in stub.calls)
    doc = json.loads((video / "doc.json").read_text(encoding="utf-8"))
    assert doc["theme"] == "law" and doc["kit"] == "doc" and doc["slug"] == SLUG
    assert doc["hook"]["text"] == "*$54 MILLION* FOR PANTS"
    assert doc["beats"] == ["23:cried"]                       # added for the whole-video check; "99:nowhere" dropped
    c3 = next(c for c in stub.calls if c.get("n") == 3)
    assert "BIG BEATS in this chapter" in c3["user"] and "23:cried" in c3["user"]
    assert "BIG BEATS" not in next(c for c in stub.calls if c.get("n") == 1)["user"]
    assert [c["from"] for c in doc["chapters"]] == ["1:A", "14:The", "22:The"]
    for n in (1, 2, 3):
        assert json.loads((video / "chapters" / f"{n:02d}.json").read_text(encoding="utf-8"))["chapter"] == n
    # chapter 2's prompt has only its own window, plus chapter 1's summary for continuity
    c2 = next(c for c in stub.calls if c.get("n") == 2)
    assert "line 14 (" in c2["user"] and "line 22 (" not in c2["user"] and "line 7 (" not in c2["user"]
    assert "chapter 1 summary" in c2["user"]
    assert c2["system"][0]["cache_control"]["type"] == "ephemeral"
    checks = [c for c in seen if c[0] != "TSC"]
    assert [c[c.index("--chapter") + 1] if "--chapter" in c else "video" for c in checks] == ["1", "2", "3", "video"]
    assert checks[-1][1:] == ["tools/doc_build.mjs", SLUG, "--check", "--shorts", str(CFG.shorts_dir)]
    assert seen[-1][:4] == ["TSC", CFG.node, "tools/doc_build.mjs", SLUG] and "--check" not in seen[-1]
    cost = json.loads((video / "doc_cost.json").read_text(encoding="utf-8"))
    assert set(cost["by_part"]) == {"plan", "chapter 01", "chapter 02", "chapter 03"}
    assert cost["total_usd"] > 0


def test_chapter_retry_feeds_fails_back_to_that_chapter_only(video, monkeypatch):
    _fake_checker(monkeypatch)
    bad2 = REF[2].replace('"value": "$1,500"', '"value": "$1,600"')
    assert bad2 != REF[2]
    stub = StubClaude(bad={2: [bad2, bad2]})
    monkeypatch.setattr(claude, "ask_json", stub)
    docwriter.build(video)
    assert stub.chapters() == [1, 2, 2, 2, 3]
    retries = [c for c in stub.calls if c.get("n") == 2][1:]
    assert "FAIL S23 stat shows 1,600" in retries[0]["user"]
    assert "Failures in EARLIER attempts" in retries[1]["user"]        # history from attempt 1
    assert "$1,500" in (video / "chapters" / "02.json").read_text(encoding="utf-8")
    assert json.loads((video / "doc_cost.json").read_text(encoding="utf-8"))["calls"][2]["attempts"] == 3


def test_chapter_gives_up_after_5_and_keeps_best(video, monkeypatch):
    _fake_checker(monkeypatch)
    bad2 = REF[2].replace('"value": "$1,500"', '"value": "$1,600"')
    stub = StubClaude(bad={2: [bad2] * 5})
    monkeypatch.setattr(claude, "ask_json", stub)
    docwriter.plan(video, _script_json(), docwriter._words(video))
    assert docwriter.write_chapter(video, 2) is False
    assert stub.chapters() == [2] * docwriter.CHAPTER_ATTEMPTS == [2] * 5
    assert "$1,600" in (video / "chapters" / "02.json").read_text(encoding="utf-8")  # the best (only) attempt kept


def test_whole_video_fail_is_routed_to_its_chapter(video, monkeypatch):
    whole = ("FAIL  variety V1: a new shot or scene type at least every 6 s (no scene longer): 1 too long\n"
             "--- 1 line(s) to fix:\n"
             "  FAIL S27 timeline runs 7.6 s (102.66 s-110.23 s): the limit is 6 s: split it with a new scene at \"23:On\"\n"
             "FAILED (the whole video)")
    seen = _fake_checker(monkeypatch, video_logs=[whole])
    stub = StubClaude()
    monkeypatch.setattr(claude, "ask_json", stub)
    docwriter.build(video)
    assert stub.chapters() == [1, 2, 3, 3]           # only chapter 3 rewritten
    fix = stub.calls[-1]
    assert "Whole-video problems in THIS chapter" in fix["user"] and "FAIL S27 timeline runs 7.6 s" in fix["user"]
    assert "=== The current chapters/03.json ===" in fix["user"]
    assert sum(1 for c in seen if c[0] != "TSC" and "--chapter" not in c) == 2


def test_type_check_failure_goes_to_the_chapter_with_the_bad_value(video, monkeypatch):
    err = "src/doc/gen/pearson_doc.doc.gen.ts(3,9): error TS2322: Type '\"slamZoom\"' is not assignable to type 'Preset'."
    _fake_checker(monkeypatch, tsc=[(False, "TYPE CHECK FAILED ...\nFAIL " + err)])
    stub = StubClaude()
    monkeypatch.setattr(claude, "ask_json", stub)
    docwriter.build(video)
    assert stub.chapters() == [1, 2, 3, 2]           # slamZoom is only in chapter 2
    assert "TS2322" in stub.calls[-1]["user"]


def test_editor_revise_rewrites_only_affected_chapters(video, monkeypatch):
    _fake_checker(monkeypatch)
    stub = StubClaude()
    monkeypatch.setattr(claude, "ask_json", stub)
    docwriter.build(video)
    ch1 = (video / "chapters" / "01.json").read_text(encoding="utf-8")
    issues = [{"t_start": 70.0, "t_end": 72.0, "severity": "major", "category": "pacing", "problem": "static chart",
               "fix": "cut sooner"},
              {"t_start": 110.5, "t_end": 112.0, "severity": "blocker", "category": "accuracy", "problem": "wrong date",
               "fix": "show 2007"}]
    docwriter.revise(video, issues, 1)
    assert stub.chapters()[3:] == [2, 3]
    assert "static chart" in stub.calls[4]["user"] and "wrong date" not in stub.calls[4]["user"]
    assert "wrong date" in stub.calls[5]["user"]
    assert (video / "chapters" / "01.json").read_text(encoding="utf-8") == ch1
    docwriter.snapshot(video, "doc_round1")
    (video / "chapters" / "02.json").write_text("{}", encoding="utf-8")
    docwriter.restore(video, "doc_round1")
    assert json.loads((video / "chapters" / "02.json").read_text(encoding="utf-8"))["chapter"] == 2


# ------------------------------------------------------------------ render command

def test_render_builds_and_renders_the_doc_composition(video, monkeypatch):
    _fake_checker(monkeypatch)
    monkeypatch.setattr(claude, "ask_json", StubClaude())
    docwriter.build(video)
    (video / "voice.wav").write_bytes(b"RIFF")
    cmds, plain = [], []

    def fake_run(cmd, *, env=None, cwd=None):
        cmds.append((cmd, env or {}))
        if any("mux_voice.sh" in str(c) for c in cmd):
            Path(cmd[-1]).write_bytes(b"video")
        return ""

    monkeypatch.setattr(render, "_run", fake_run)
    monkeypatch.setattr(render, "_render_plain", lambda comp, muted, entry="": plain.append((comp, entry)))
    monkeypatch.setattr(render.sound, "design", lambda *a: 0)
    monkeypatch.setattr(render, "_loudness", lambda p: "I: -14 LUFS")
    monkeypatch.setattr(render, "_whisper_check", lambda v, l: "skipped")
    monkeypatch.setenv("REELBOT_MOTION_BLUR", "1")  # the doc kit never takes the blur path
    final = render.render(video, on="pc")
    assert cmds[0][0] == [CFG.node, "tools/doc_build.mjs", SLUG, "--shorts", str(CFG.shorts_dir)]
    assert plain == [("PearsonDocDoc", "src/index.doc.ts")]
    mix = next(c for c, _ in cmds if "tools/story_mix.py" in c)
    assert mix[2] == "PearsonDocDoc"
    assert final.exists() and "PearsonDocDoc" in (final.parent / "QA.md").read_text(encoding="utf-8")


def test_shorts_still_use_the_kit_recipe(video, monkeypatch):
    d = _script_json()
    d.update(format="portrait")
    (video / "script.json").write_text(json.dumps(d), encoding="utf-8")
    assert not docwriter.is_doc(video)
    assert render._pascal(SLUG) == "PearsonDocRecipe"


# ------------------------------------------------------------------ the real checker (node), when available

needs_engine = pytest.mark.skipif(not (ENGINE / "tools" / "doc_build.mjs").exists()
                                  or not (ENGINE / "node_modules" / "esbuild").exists(),
                                  reason="no engine checkout with node_modules (set REELBOT_TEST_ENGINE)")


@needs_engine
def test_real_doc_build_check(video, monkeypatch):
    """The assembled doc.json + chapters pass the real `doc_build.mjs --check` (per chapter and whole video), and a
    bad chapter is caught by the real checker and fixed by the retry."""
    monkeypatch.setattr(CFG, "render_root", ENGINE)
    monkeypatch.setattr(render, "ENGINE_LOCK", video.parent / "engine.lock")
    if os.environ.get("REELBOT_TEST_TSC") != "1":  # the full tsc over the engine takes minutes; opt in
        monkeypatch.setattr(recipe, "typecheck_build", lambda cmd: (True, ""))
    bad2 = REF[2].replace('"value": "$1,500"', '"value": "$1,600"')
    stub = StubClaude(bad={2: [bad2]})
    monkeypatch.setattr(claude, "ask_json", stub)
    docwriter.build(video)
    assert stub.chapters() == [1, 2, 2, 3]
    first = (video / "doc_check_ch02_new_1.log").read_text(encoding="utf-8")
    assert "1,600" in first and "FAILED" in first
    ok, log = docwriter.check_video(SLUG)
    assert ok, log
    assert "PASSED (the whole video)" in log
