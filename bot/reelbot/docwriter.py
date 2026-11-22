"""Long-form recipe stage for the law / biz / cyber channels: a documentary video in the engine's "doc" kit.

Instead of one huge recipe.json (one 128K-token call per attempt), the video is written the way KIT_DOC.md asks:

  1. doc.json (the outline), mostly deterministic: theme = channel, chapters from script.json "chapters" (each starts on
     the first word of its line; chapter 1 starts on the first word and its card plays after the 30 s cold open),
     sources from the script's sources + fact-checked claims. One small Claude call adds the cold-open hook text, the
     3D cast (for the channel's 3D kit) and the big-beat words.
  2. ONE Claude call PER CHAPTER -> chapters/NN.json, from that chapter's lines + word timings, KIT_DOC.md, the 3D
     kit's guide and the previous chapter's summary. Each chapter is checked with
     `node tools/doc_build.mjs <slug> --check --chapter N`; its FAIL lines go back to that chapter only (with the
     history of earlier attempts), up to REELBOT_DOC_CHAPTER_ATTEMPTS (5) attempts.
  3. The whole-video `--check` (N1 spoken numbers, C1 chapter cards, budgets, S-rules, the long-form gate). Each FAIL
     line is routed to the chapter that holds it (by scene id, "chapter N" or its time) and only those chapters are
     rewritten. Up to REELBOT_DOC_ROUNDS (3) rounds.
  4. The real build + `tsc --noEmit` (shared with the Shorts path: a broken generated file is rolled back) under the
     engine lock.

The editor's revise step maps each timestamped issue to its chapter and rewrites only those chapters.
Cost per chapter is logged to doc_cost.json in the video's folder and printed.
"""
from __future__ import annotations

import difflib
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

from . import channels, claude, locks
from .config import CFG
from .cost import COST

KIT3D = {"law": "law3d", "biz": "biz3d", "cyber": "cyber3d"}
ENTRY = "src/index.doc.ts"
CHAPTER_ATTEMPTS = int(os.environ.get("REELBOT_DOC_CHAPTER_ATTEMPTS", "5"))
ROUNDS = int(os.environ.get("REELBOT_DOC_ROUNDS", "3"))
CHAPTER_MAX_TOKENS = int(os.environ.get("REELBOT_DOC_MAX_TOKENS", "32000"))
COLD_OPEN_S = 30.0  # KIT_DOC C1: no chapter card in the first 30 s

PLAN_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["hook_text", "cast_json", "beats", "notes"],
    "properties": {
        "hook_text": {"type": "string", "description": "cold-open title: <= 6 words, exactly one *accent* word in stars"},
        "cast_json": {"type": "string", "description": "the 3D kit's \"cast\" object as JSON: {id: CastSpec, ...}"},
        "beats": {"type": "array", "items": {"type": "string"},
                  "description": "big-beat words as \"N:word\" (line N): the twist, the verdict, the reveal"},
        "notes": {"type": "string"},
    },
}

CHAPTER_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["chapter_json", "summary", "card", "number_exempt", "notes"],
    "properties": {
        "chapter_json": {"type": "string", "description": "the complete chapters/NN.json file content"},
        "summary": {"type": "string", "description": "3-5 sentences for the next chapter's writer: what this chapter "
                    "showed, its hero set, the scene types/sets/cameras of its LAST 45 s, any open tease ids"},
        "card": {"type": "string", "description": "doc.json \"card\" word for this chapter, or \"\" to keep it"},
        "number_exempt": {"type": "array", "description": "extra doc.json numberExempt entries (rarely needed)",
                          "items": {"type": "object", "additionalProperties": False, "required": ["word", "why"],
                                    "properties": {"word": {"type": "string"}, "why": {"type": "string"}}}},
        "notes": {"type": "string", "description": "one paragraph: the scene plan and what changed since last attempt"},
    },
}


# ------------------------------------------------------------------ when the doc engine applies

def applies(data: dict) -> bool:
    """Long-form (landscape) videos on law / biz / cyber use the doc kit (REELBOT_DOC_ENGINE=0 turns it off)."""
    return (os.environ.get("REELBOT_DOC_ENGINE", "1") != "0" and data.get("format") == "landscape"
            and data.get("channel") in KIT3D)


def _script(folder: Path) -> dict:
    return json.loads((folder / "script.json").read_text(encoding="utf-8"))


def is_doc(folder: Path) -> bool:
    """True for a video this module writes (the render and editor stages branch on it)."""
    return (folder / "script.json").exists() and applies(_script(folder))


def comp(slug: str) -> str:
    """The composition id doc_build.mjs registers in src/index.doc.ts: PascalCase slug + "Doc"."""
    return "".join(w[:1].upper() + w[1:] for w in slug.split("-")) + "Doc"


def build_cmd(slug: str, *extra: str) -> list[str]:
    return [CFG.node, "tools/doc_build.mjs", slug, *extra, "--shorts", str(CFG.shorts_dir)]


# ------------------------------------------------------------------ words and anchors

def _clean(w: str) -> str:
    """A voice word as an anchor token: outer punctuation off (a leading $ stays)."""
    w = w.strip()
    w = re.sub(r"^[^\w$]+", "", w)
    return re.sub(r"[^\w]+$", "", w)


def _words(folder: Path) -> list[dict]:
    t = json.loads((folder / "vo" / "timings.json").read_text(encoding="utf-8"))
    return [{"w": w["w"], "turn": tn["turn"], "t": w["t"], "end": w["end"]} for tn in t["turns"] for w in tn["words"]]


def resolve(at, words: list[dict]) -> float:
    """Time of an anchor this module writes or reads back: seconds, "N:word", "N:word#k", "word", "line:N"."""
    if isinstance(at, (int, float)):
        return float(at)
    s = str(at)
    if s.startswith("line:"):
        n = int(s[5:])
        return next(w["t"] for w in words if w["turn"] == n)
    m = re.match(r"^(?:(\d+):)?(.+?)(?:#(\d+))?(?:[+-][\d.]+)?$", s)
    turn, word, k = (int(m.group(1)) if m.group(1) else None), m.group(2), int(m.group(3) or 1)
    key = _clean(word).lower()
    hits = [w for w in words if (turn is None or w["turn"] == turn) and _clean(w["w"]).lower() == key]
    if len(hits) < k:
        raise KeyError(f"{at!r} is not a word of the voice-over")
    return hits[k - 1]["t"]


def _line_start(words: list[dict], turn: int) -> str:
    w = next(w for w in words if w["turn"] == turn)
    return f"{turn}:{_clean(w['w'])}"


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9$ ]+", "", s.lower()).strip()


def _find_line(lines: list[str], starts_with: str, after: int) -> int:
    """1-based line number whose text starts with `starts_with` (the script writer's chapter marker), at or after `after`."""
    want = _norm(starts_with)
    for i in range(after, len(lines) + 1):
        if _norm(lines[i - 1]).startswith(want) or (want and want in _norm(lines[i - 1])[: len(want) + 20]):
            return i
    best = max(range(after, len(lines) + 1),
               key=lambda i: difflib.SequenceMatcher(None, want, _norm(lines[i - 1])[: len(want)]).ratio())
    return best


# ------------------------------------------------------------------ doc.json

def outline(data: dict, words: list[dict]) -> list[dict]:
    """[{n, title, line, from, card?}] from script.json "chapters" (title + the first words of its opening line)."""
    lines, chs = data["lines"], data.get("chapters") or []
    if len(chs) < 3:
        raise SystemExit(f"{data['slug']}: the doc kit needs at least 3 chapters in script.json (has {len(chs)}); "
                         "rerun the script stage with --long")
    starts, after = [], 1
    for c in chs:
        ln = _find_line(lines, c["starts_with"], after)
        starts.append(ln)
        after = ln + 1
    t_of = {w["turn"]: w["t"] for w in reversed(words)}  # first word time per line
    out = []
    for i, (c, ln) in enumerate(zip(chs, starts)):
        frm = ln if i else 1  # chapter 1 starts on the first word; the cold open belongs to it
        out.append({"n": i + 1, "title": c["title"], "line": frm, "from": _line_start(words, frm)})
    # chapter 1's card: its own opening line if that comes after the cold open, else the first line start after 30 s
    card_line = starts[0] if t_of.get(starts[0], 0) >= COLD_OPEN_S else next(
        (n for n in sorted(t_of) if t_of[n] >= COLD_OPEN_S + 0.5 and n < out[1]["line"]), None)
    if card_line:
        out[0]["card"] = _line_start(words, card_line)
    return out


def _sources(data: dict) -> list[str]:
    src = [f"{s['title']} ({s['url']})" for s in data.get("sources", [])]
    src += [f"{c['claim']} (basis: {c['basis']})" for c in data.get("claims", [])]
    return src or ["(no sources listed in script.json)"]


def _fix_hook(text: str, fallback: str) -> str:
    """<= 6 words, exactly one *accent* (the doc schema's rule); repaired locally instead of another call."""
    for cand in (text, fallback):
        plain = cand.replace("*", "").split()
        if 0 < len(plain) <= 6 and len(re.findall(r"\*[^*]+\*", cand)) == 1:
            return cand.strip()
    plain = fallback.replace("*", "").split()[:6] or ["WATCH"]
    k = next((i for i, w in enumerate(plain) if re.search(r"[\d$]", w)), max(range(len(plain)), key=lambda i: len(plain[i])))
    plain[k] = f"*{plain[k]}*"
    return " ".join(plain)


def _kit_guide(kit: str) -> str:
    return _read_engine(f"KIT_{kit.upper()}.md")


def _read_engine(name: str) -> str:
    for p in (CFG.render_root / name, CFG.repo_root / "finance" / "render-pc" / name):
        if p.exists():
            return p.read_text(encoding="utf-8")
    return ""


def _kit_doc() -> str:
    g = _read_engine("KIT_DOC.md")
    if not g:
        raise SystemExit(f"KIT_DOC.md not found under {CFG.render_root}. Pull the engine branch with the doc kit "
                         "(src/doc, tools/doc_build.mjs) into REELBOT_RENDER_ROOT.")
    return g


def _numbered(lines: list[str]) -> str:
    return "\n".join(f"{i}. {l}" for i, l in enumerate(lines, 1))


def plan(folder: Path, data: dict, words: list[dict], errors: str = "") -> dict:
    """Write doc.json: the deterministic outline + one small Claude call for hook, 3D cast and beats."""
    ch = channels.get(data["channel"])
    kit = KIT3D[ch.id]
    out = outline(data, words)
    doc_path = folder / "doc.json"
    prev = json.loads(doc_path.read_text(encoding="utf-8")) if doc_path.exists() else None
    system = (f"You plan a documentary long-form video for {ch.name} in the doc kit below. Return the cold-open hook "
              f"text, the 3D cast for the {kit} kit (generic characters only: {ch.cast_rule}) and the big-beat words. "
              "Cast ids are short lowercase names (e.g. the plaintiff's surname); give everyone a role the kit lists, "
              "and every person the story shows in a human moment. A beat is \"N:word\" where N is the script line and "
              "word is a word on that line: the twist, the verdict, the reveal, the refusal, the arrest (3-8 beats).\n\n"
              "=== KIT_DOC.md ===\n" + _kit_doc() + f"\n\n=== KIT_{kit.upper()}.md (the 3D kit: its cast section is "
              "what cast_json follows) ===\n" + _kit_guide(kit))
    user = (f"Title: {data['title']}\nHook text of the script: {data['hook_text']}\n\nChapters:\n"
            + "\n".join(f"{c['n']}. {c['title']} (from line {c['line']})" for c in out)
            + "\n\nScript (numbered lines):\n" + _numbered(data["lines"])
            + (f"\n\nThe previous doc.json failed these checks; fix them:\n{errors}\n\nPrevious doc.json:\n"
               + json.dumps(prev, indent=1) if errors and prev else ""))
    print("  claude: planning doc.json (hook, 3D cast, beats)...")
    before = _spent()
    res = claude.ask_json(system, user, PLAN_SCHEMA, effort="medium", max_tokens=16000)
    _log_cost(folder, "plan", _spent() - before)
    try:
        cast = json.loads(res["cast_json"])
    except json.JSONDecodeError:
        cast = (prev or {}).get("kit3d", {}).get("cast", {})
    beats = []
    for b in res.get("beats", []):
        try:
            resolve(b, words)
            beats.append(b)
        except (KeyError, StopIteration, ValueError, AttributeError):
            pass  # a beat that isn't a voice word would fail the whole doc: drop it
    doc = {
        "kit": "doc", "slug": data["slug"], "theme": ch.id, "title": data["title"],
        "music": os.environ.get("REELBOT_DOC_MUSIC", "suspense"),
        "hook": {"text": _fix_hook(res.get("hook_text", ""), data["hook_text"])},
        "voice": {"timings": "vo/timings.json"},
        "chapters": [{"file": f"chapters/{c['n']:02d}.json", "title": c["title"], "from": c["from"],
                      **({"card": c["card"]} if c.get("card") else {})} for c in out],
        "kit3d": {"cast": cast},
        "sources": _sources(data),
    }
    # The planned beats are held in doc_writer.json until every chapter exists: with --chapter N, a doc.json beat in
    # a chapter not written yet is judged against chapter N's last scene (engine quirk). Each chapter writer gets its
    # own beats to mark "beat": true; finish() adds them to doc.json before the whole-video check.
    st = _state(folder)
    st["beats"] = beats
    _save_state(folder, st)
    if prev and prev.get("beats"):
        doc["beats"] = prev["beats"]
    if prev and len(prev.get("chapters", [])) == len(doc["chapters"]):  # keep cards the chapter writers set
        for c, p in zip(doc["chapters"], prev["chapters"]):
            if p.get("card"):
                c["card"] = p["card"]
    if prev and prev.get("numberExempt"):
        doc["numberExempt"] = prev["numberExempt"]
    doc_path.write_text(json.dumps(doc, indent=1, ensure_ascii=False), encoding="utf-8")
    (folder / "chapters").mkdir(exist_ok=True)
    return doc


# ------------------------------------------------------------------ chapter windows

def bounds(folder: Path) -> list[dict]:
    """[{n, t0, t1, l0, l1}] per chapter: start/end time and first/last script line."""
    doc = json.loads((folder / "doc.json").read_text(encoding="utf-8"))
    words = _words(folder)
    end = max(w["end"] for w in words)
    ts = [resolve(c["from"], words) for c in doc["chapters"]]
    ls = [int(str(c["from"]).split(":")[0]) if re.match(r"^\d+:", str(c["from"])) else
          next(w["turn"] for w in words if w["t"] >= t) for c, t in zip(doc["chapters"], ts)]
    last = max(w["turn"] for w in words)
    return [{"n": i + 1, "t0": ts[i], "t1": ts[i + 1] if i + 1 < len(ts) else end,
             "l0": ls[i], "l1": ls[i + 1] - 1 if i + 1 < len(ls) else last} for i in range(len(ts))]


def chapter_at(bs: list[dict], t: float) -> int:
    n = 1
    for b in bs:
        if t >= b["t0"] - 1e-6:
            n = b["n"]
    return n


def _window(folder: Path, data: dict, b: dict) -> str:
    words = _words(folder)
    out = []
    for ln in range(b["l0"], b["l1"] + 1):
        ws = [w for w in words if w["turn"] == ln]
        if not ws:
            continue
        out.append(f"line {ln} ({ws[0]['t']:.2f}-{ws[-1]['end']:.2f} s): {data['lines'][ln - 1]}\n  words: "
                   + " ".join(f"{w['w']}@{w['t']:.2f}" for w in ws))
    return "\n".join(out)


# ------------------------------------------------------------------ checks (engine lock held)

def _run(cmd: list[str]) -> tuple[bool, str]:
    from .render import ENGINE_LOCK
    with locks.held(ENGINE_LOCK, " ".join(cmd[1:4])):  # the builder writes out/tmp bundles shared by every run
        r = subprocess.run(cmd, cwd=CFG.render_root, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.returncode == 0, (r.stdout + "\n" + r.stderr).strip()


def check_chapter(slug: str, n: int) -> tuple[bool, str]:
    return _run(build_cmd(slug, "--check", "--chapter", str(n)))


def check_video(slug: str) -> tuple[bool, str]:
    return _run(build_cmd(slug, "--check"))


ROW = re.compile(r"^FAIL\s+(variety|budget|numbers|chapters C1|text T|sanity|legal|teases|3D |long-form)")


def fail_lines(log: str) -> tuple[list[str], list[str]]:
    """(detail lines, gate rows). A gate row is the one-line summary of a rule ("FAIL  variety V1: ... (see Doc
    gates)"); the details ("FAIL S27 timeline runs 7.6 s ...", schema and compile errors) say what to change."""
    details, rows = [], []
    for raw in log.splitlines():
        s = raw.strip()
        if re.match(r"^(FAIL|CLIP)\b", s) and not s.startswith("FAILED"):  # not the "FAILED (scope)" footer
            (rows if ROW.match(s) else details).append(s)
    return details, rows


def _scene_index(folder: Path) -> dict[str, int]:
    """Global scene id (S01, S02, ... in order over all chapters, as compile.ts numbers them) and user ids -> chapter."""
    doc = json.loads((folder / "doc.json").read_text(encoding="utf-8"))
    out, i = {}, 0
    for n, c in enumerate(doc["chapters"], 1):
        p = folder / c["file"]
        try:
            scenes = json.loads(p.read_text(encoding="utf-8")).get("scenes", []) if p.exists() else []
        except json.JSONDecodeError:
            scenes = []
        for s in scenes:
            i += 1
            out[f"S{i:02d}"] = n
            if isinstance(s, dict) and s.get("id"):
                out.setdefault(str(s["id"]), n)
    return out


def route(folder: Path, lines: list[str]) -> tuple[dict[int, list[str]], list[str]]:
    """Each FAIL line -> the chapter(s) that hold it: by scene id, by "chapter N", else by its first time ("12.34 s").
    Returns ({chapter: [lines]}, [lines no chapter owns])."""
    idx, bs = _scene_index(folder), bounds(folder)
    nch = len(bs)
    out: dict[int, list[str]] = {}
    loose = []
    for l in lines:
        chs = set()
        for sid in re.findall(r"\bS\d{2,3}\b", l):
            if sid in idx:
                chs.add(idx[sid])
                break  # the first id named is the scene to change
        if not chs:
            m = re.search(r"\bchapters?[ /]+(\d+)", l, re.I) or re.search(r"chapters/(\d+)\.json", l)
            if m and 1 <= int(m.group(1)) <= nch:
                chs.add(int(m.group(1)))
        if not chs:
            m = re.search(r"(\d+\.\d+) s\b", l)
            if m:
                chs.add(chapter_at(bs, float(m.group(1))))
        if not chs:
            m = re.search(r'"(\d+):[^"]+"', l)  # an anchor like "19:$1,500"
            if m:
                chs.add(chapter_at(bs, next((b["t0"] for b in bs if b["l0"] <= int(m.group(1)) <= b["l1"]), 0.0)))
        for c in chs:
            out.setdefault(c, []).append(l)
        if not chs:
            loose.append(l)
    return out, loose


# ------------------------------------------------------------------ cost

def _spent() -> float:
    return COST.claude_usd() + COST.cli_estimate_usd


def _log_cost(folder: Path, key: str, usd: float, attempts: int = 1) -> None:
    p = folder / "doc_cost.json"
    log = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"calls": []}
    log["calls"].append({"what": key, "usd": round(usd, 4), "attempts": attempts})
    tot: dict[str, float] = {}
    for c in log["calls"]:
        tot[c["what"]] = round(tot.get(c["what"], 0.0) + c["usd"], 4)
    log["by_part"], log["total_usd"] = tot, round(sum(tot.values()), 4)
    p.write_text(json.dumps(log, indent=1), encoding="utf-8")


def cost_summary(folder: Path) -> str:
    p = folder / "doc_cost.json"
    if not p.exists():
        return "doc cost: nothing logged"
    log = json.loads(p.read_text(encoding="utf-8"))
    parts = ", ".join(f"{k} ${v:.2f}" for k, v in log["by_part"].items())
    return f"doc recipe cost ${log['total_usd']:.2f} ({parts})"


# ------------------------------------------------------------------ the chapter writer

def _system(data: dict, doc: dict) -> list[dict]:
    ch = channels.get(data["channel"])
    kit = KIT3D[ch.id]
    static = (
        f"You are the documentary editor for {ch.name}. You write ONE chapter file (chapters/NN.json) at a time for the "
        "doc kit described below: a run of scenes, each starting on a word of the voice-over, 3-6 s long. Follow the "
        "schema exactly; every FAIL line the checker prints says what to change. Facts in 2D scenes (stat, compare, "
        "chart, timeline, document, quote, map, evidenceboard, recap), people in scene3d. Every spoken figure on a board "
        "within 1.5 s, in the exact value said. Names, places, dates and numbers on screen only from the script or "
        f"sources. Never a verdict word the voice does not say. {ch.cast_rule} Big beats get \"beat\": true and people, "
        "a document, a quote or a compare. Vary types, moves, sets and cameras (no identical type+set+camera within "
        "45 s, also across the chapter edge with the previous chapter). At most about one scene3d in three. Use only "
        "the actor ids in doc.json kit3d.cast.\n\n"
        f"=== KIT_DOC.md ===\n{_kit_doc()}\n\n=== KIT_{kit.upper()}.md (the scene3d fields) ===\n{_kit_guide(kit)}")
    video = ("=== This video ===\ndoc.json:\n" + json.dumps(doc, indent=1, ensure_ascii=False)
             + "\n\nThe whole script (numbered lines; the line number is the N in \"N:word\"):\n" + _numbered(data["lines"]))
    # two cache breakpoints: the kit docs are the same for every chapter of every video; the video block is the same
    # for every chapter of this video (until a card patch changes doc.json)
    return [{"type": "text", "text": static, "cache_control": {"type": "ephemeral"}},
            {"type": "text", "text": video, "cache_control": {"type": "ephemeral"}}]


def _state(folder: Path) -> dict:
    p = folder / "doc_writer.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"summaries": {}}


def _save_state(folder: Path, st: dict) -> None:
    (folder / "doc_writer.json").write_text(json.dumps(st, indent=1, ensure_ascii=False), encoding="utf-8")


def _n_fails(log: str) -> int:
    d, r = fail_lines(log)
    return len(d) + len(r)


def write_chapter(folder: Path, n: int, feedback: str = "", tag: str = "new") -> bool:
    """Write chapters/NN.json with Claude and validate it with --check --chapter N; FAIL lines go back to this chapter
    only, with the history of earlier attempts. Keeps the best attempt. True when the chapter check passes."""
    data = _script(folder)
    slug = data["slug"]
    doc_path = folder / "doc.json"
    doc = json.loads(doc_path.read_text(encoding="utf-8"))
    ref = doc["chapters"][n - 1]
    path = folder / ref["file"]
    path.parent.mkdir(parents=True, exist_ok=True)
    bs = bounds(folder)
    b = bs[n - 1]
    st = _state(folder)
    prev_sum = st["summaries"].get(str(n - 1), "") if n > 1 else ""
    nxt = doc["chapters"][n]["from"] if n < len(doc["chapters"]) else "(the end of the video)"
    base = (f"Write chapter {n} of {len(bs)}: \"{ref['title']}\". It starts on \"{ref['from']}\" ({b['t0']:.2f} s) and "
            f"runs to {nxt} ({b['t1']:.2f} s, {b['t1'] - b['t0']:.1f} s long). The first scene's \"at\" is \"{ref['from']}\". "
            f"Return \"chapter\": {n}.\n"
            + (f"The chapter card plays at \"{ref['card']}\".\n" if ref.get("card") else "")
            + ("This chapter holds the COLD OPEN (the first 30 s, before the chapter card): show the most shocking "
               "moments, mark each promised moment with \"tease\" and pay it off later with that id.\n" if n == 1 else "")
            + (f"BIG BEATS in this chapter (give the scene that holds each word \"beat\": true and people, a document, "
               f"a quote or a compare): {', '.join(mine)}\n" if (mine := [x for x in _state(folder).get("beats", [])
                                                                   if b["t0"] <= _safe_t(x, folder) < b["t1"]]) else "")
            + (f"\nThe previous chapter's summary (for continuity; don't repeat its last shots):\n{prev_sum}\n" if prev_sum else "")
            + f"\nThis chapter's lines and word timings (anchor words come from here):\n{_window(folder, data, b)}\n")
    system = _system(data, doc)
    history: list[list[str]] = []
    best: tuple[int, str] | None = None
    if path.exists() and feedback:  # a rewrite: the current file is the baseline any attempt must beat
        cur = path.read_text(encoding="utf-8")
        best = (_n_fails(check_chapter(slug, n)[1]), cur)
        feedback = f"\n\n=== The current {ref['file']} ===\n{cur}" + feedback
    before = _spent()
    ok, attempt = False, 0
    for attempt in range(1, CHAPTER_ATTEMPTS + 1):
        print(f"  claude: writing {ref['file']} ({tag}, attempt {attempt})...")
        res = claude.ask_json(system, base + feedback, CHAPTER_SCHEMA, effort="medium", max_tokens=CHAPTER_MAX_TOKENS)
        try:
            chap = json.loads(res["chapter_json"])
            if not isinstance(chap, dict):
                raise ValueError("not an object")
        except (json.JSONDecodeError, ValueError) as e:
            feedback = f"\n\nYour last chapter_json was not a valid JSON object ({e}). Return valid JSON."
            continue
        chap["chapter"] = n
        path.write_text(json.dumps(chap, indent=1, ensure_ascii=False), encoding="utf-8")
        _apply_patch(doc_path, n, res)
        ok, log = check_chapter(slug, n)
        (folder / f"doc_check_ch{n:02d}_{tag}_{attempt}.log").write_text(log, encoding="utf-8")
        nf = _n_fails(log)
        if best is None or nf < best[0] or ok:
            best = (nf, path.read_text(encoding="utf-8"))
        if ok:
            st = _state(folder)
            st["summaries"][str(n)] = res.get("summary", "")
            _save_state(folder, st)
            print(f"  doc: chapter {n} passes its check")
            break
        details, rows = fail_lines(log)
        fails = details or rows or [log[-1500:]]
        if any(l.startswith("FAIL  doc.json") for l in fails):  # the outline itself is wrong: fix doc.json first
            plan(folder, data, _words(folder), "\n".join(l for l in fails if l.startswith("FAIL  doc.json")))
            system = _system(data, json.loads(doc_path.read_text(encoding="utf-8")))
        print(f"  doc: chapter {n} has {len(fails)} FAIL line(s), sending them back")
        history.append(fails)
        earlier = "".join(f"\nattempt {k}: " + " | ".join(h[:12]) for k, h in enumerate(history[:-1], 1) if h)
        feedback = (f"\n\n=== Your previous {ref['file']} ===\n" + json.dumps(chap, indent=1, ensure_ascii=False)
                    + f"\n\n=== doc_build --check --chapter {n} FAIL lines (fix every one) ===\n" + "\n".join(fails)
                    + ("\n\n=== Failures in EARLIER attempts (don't swing back into them) ===" + earlier if earlier else "")
                    + "\n\nChange only what the FAIL lines need; never undo a fix that cleared an earlier failure.")
    _log_cost(folder, f"chapter {n:02d}", _spent() - before, attempt)
    if not ok and best:
        path.write_text(best[1], encoding="utf-8")  # keep the attempt with the fewest FAIL lines
        print(f"  doc: chapter {n} still fails after {CHAPTER_ATTEMPTS} attempts; kept the best one ({best[0]} FAIL line(s))")
    return ok


def _safe_t(at: str, folder: Path) -> float:
    try:
        return resolve(at, _words(folder))
    except (KeyError, StopIteration, ValueError, AttributeError):
        return -1.0


def _add_beats(folder: Path) -> None:
    """Every chapter exists now: the planned beats go into doc.json for the whole-video V5 check."""
    beats = _state(folder).get("beats") or []
    doc_path = folder / "doc.json"
    doc = json.loads(doc_path.read_text(encoding="utf-8"))
    if beats and doc.get("beats") != beats:
        doc["beats"] = sorted(set(doc.get("beats", [])) | set(beats), key=lambda x: _safe_t(x, folder))
        doc_path.write_text(json.dumps(doc, indent=1, ensure_ascii=False), encoding="utf-8")


def _apply_patch(doc_path: Path, n: int, res: dict) -> None:
    doc = json.loads(doc_path.read_text(encoding="utf-8"))
    changed = False
    card = (res.get("card") or "").strip()
    if card and doc["chapters"][n - 1].get("card") != card:
        doc["chapters"][n - 1]["card"] = card
        changed = True
    ex = doc.setdefault("numberExempt", [])
    for e in res.get("number_exempt") or []:
        if e.get("word") and e.get("why") and not any(x["word"] == e["word"] for x in ex):
            ex.append({"word": e["word"], "why": e["why"]})
            changed = True
    if not ex:
        doc.pop("numberExempt")
    if changed:
        doc_path.write_text(json.dumps(doc, indent=1, ensure_ascii=False), encoding="utf-8")


# ------------------------------------------------------------------ whole video + type gate

def _typecheck(folder: Path, slug: str) -> tuple[bool, str]:
    from . import recipe
    from .render import ENGINE_LOCK
    with locks.held(ENGINE_LOCK, f"doc build {slug}"):
        return recipe.typecheck_build(build_cmd(slug))


def _route_tsc(folder: Path, err: str) -> dict[int, list[str]]:
    """A tsc error names a bad literal ('"low"' is not assignable): send it to the chapters whose JSON has it."""
    lits = set(re.findall(r"""['"]"([^"']{1,40})"['"]""", err)) | set(re.findall(r"""Type '"([^"']{1,40})"'""", err))
    doc = json.loads((folder / "doc.json").read_text(encoding="utf-8"))
    out: dict[int, list[str]] = {}
    for n, c in enumerate(doc["chapters"], 1):
        txt = (folder / c["file"]).read_text(encoding="utf-8") if (folder / c["file"]).exists() else ""
        if any(f'"{x}"' in txt for x in lits):
            out[n] = [err]
    return out or {n: [err] for n in range(1, len(doc["chapters"]) + 1)}


def finish(folder: Path, feedback: dict[int, list[str]] | None = None, tag: str = "fix") -> None:
    """Whole-video gate: route FAIL lines back to their chapters until the video passes, then the tsc gate."""
    slug = _script(folder)["slug"]
    _add_beats(folder)
    pending = feedback or {}
    for rnd in range(1, ROUNDS + 1):
        for n in sorted(pending):
            write_chapter(folder, n, "\n\n=== Whole-video problems in THIS chapter (fix every one) ===\n"
                          + "\n".join(pending[n]), f"{tag}{rnd}")
        ok, log = check_video(slug)
        (folder / f"doc_check_video_{tag}{rnd}.log").write_text(log, encoding="utf-8")
        if ok:
            tok, terr = _typecheck(folder, slug)
            if tok:
                print(f"  doc: whole-video check + type check passed ({rnd} round(s))")
                return
            print("  doc: type check failed (rolled back); sending the errors to the chapters that use the bad values")
            (folder / f"doc_tsc_{tag}{rnd}.log").write_text(terr, encoding="utf-8")
            pending = _route_tsc(folder, terr)
            continue
        details, rows = fail_lines(log)
        routed, loose = route(folder, details)
        if not details:  # only gate rows (e.g. the shared long-form gate): route those by their times
            routed, loose = route(folder, rows)
        for l in loose:  # nobody owns it (a video-wide rule): every chapter sees it as context
            for n in range(1, len(bounds(folder)) + 1):
                routed.setdefault(n, []).append(l + "  (video-wide: fix it if your chapter can)")
        print(f"  doc: whole-video check failed: {sum(len(v) for v in routed.values())} line(s) routed to chapter(s) "
              f"{', '.join(str(k) for k in sorted(routed))}")
        pending = routed
    raise SystemExit(f"doc video still fails the whole-video check after {ROUNDS} rounds; see "
                     f"{folder}/doc_check_video_*.log. Fix by hand or rerun `reelbot recipe {slug}`.")


def build(folder: Path) -> None:
    """The recipe stage for a doc video: doc.json, then each chapter in order, then the whole-video gate."""
    data = _script(folder)
    words = _words(folder)
    (folder / "doc_cost.json").unlink(missing_ok=True)
    (folder / "doc.json").unlink(missing_ok=True)  # a fresh outline (plan() keeps cards only on a re-plan)
    _save_state(folder, {"summaries": {}})
    doc = plan(folder, data, words)
    print(f"  doc: {len(doc['chapters'])} chapters, theme {doc['theme']}, hook {doc['hook']['text']!r}")
    for n in range(1, len(doc["chapters"]) + 1):
        write_chapter(folder, n)
    finish(folder)
    print("  " + cost_summary(folder))


def revise(folder: Path, issues: list[dict], rnd: int) -> None:
    """Editor round: map each timestamped issue to its chapter and rewrite only those chapters."""
    bs = bounds(folder)
    per: dict[int, list[str]] = {}
    for i in issues:
        n = chapter_at(bs, float(i["t_start"]))
        per.setdefault(n, []).append(f"- {i['t_start']:.1f}-{i['t_end']:.1f}s [{i['severity']}/{i['category']}] "
                                     f"{i['problem']} -> FIX: {i['fix']}")
    notes = {n: ["Editors' notes on the rendered video (fix every blocker and major; minors if cheap). Change only "
                 "what the notes need; keep the scenes that work. The voice and timings are fixed.", *v]
             for n, v in per.items()}
    print(f"  doc: editor round {rnd}: rewriting chapter(s) {', '.join(str(k) for k in sorted(notes))} only")
    finish(folder, notes, f"edit{rnd}-")
    print("  " + cost_summary(folder))


# ------------------------------------------------------------------ best-round keeping (cli.stage_edit)

def snapshot(folder: Path, name: str) -> None:
    dst = folder / name
    shutil.rmtree(dst, ignore_errors=True)
    dst.mkdir()
    shutil.copy2(folder / "doc.json", dst / "doc.json")
    shutil.copytree(folder / "chapters", dst / "chapters")


def restore(folder: Path, name: str) -> None:
    src = folder / name
    shutil.copy2(src / "doc.json", folder / "doc.json")
    shutil.rmtree(folder / "chapters", ignore_errors=True)
    shutil.copytree(src / "chapters", folder / "chapters")
