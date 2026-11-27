#!/usr/bin/env python3
"""justinclips/tools/build_short.py: build (or re-voice) a Justin clips Short from its per-line script.

One command re-renders a Short with any voice:

    python3 justinclips/tools/build_short.py justinclips/shorts/<slug> --kit <toon3d-fx checkout>/whatif/aitrends-2d-studio
    python3 justinclips/tools/build_short.py justinclips/shorts/<slug> --kit ... --voice-cmd "python3 my_tts.py {script_md} {wav}"

The Short's `project/lines.json` is the single source of truth: the spoken lines and, per line, the shots that play
over it. A shot starts at the start of its line, or at a word of that line ("word", optional "nth" and "offset"), so
shot timing is driven by the voice's own line and word timings (Whisper alignment). Nothing else has hard-coded times:
scenes sync to words with `at(info, word)`. A new voice = new timings = the same cut, re-timed.

Stages (default: all): voice -> time -> render -> mix
  voice   writes project/input/tts_script.md (numbered lines, the format chatterbox_d2.py / fenrir.py read) and
          project/input/script.txt (plain, one line per line), then runs the voice command, which must write {wav}.
          Default command = the current D2 Chatterbox deadpan (exaggeration 0.3, cfg 0.3, Whisper QA):
            {chatterbox_py} {voice_dir}/chatterbox_d2.py {script_md} {wav} {plain} --gap 0.2 --lead 0.05 --beat 0.4
          Placeholders: {script_md} {plain} {wav} {voice_dir} {chatterbox_py} {project}.
  time    tools/transcribe.py (Whisper small, script-aligned words) -> timeline/words.json, then story/shots.json and
          config.json "duration" from lines.json + the word timings. Prints every shot length (target 1.0-2.6 s).
  render  render.mjs (Toon 3D, 1080x1920, 24 fps) -> project/build/video_silent.mp4
  mix     audio/mix.py (music + SFX cues + ducking, loudnorm), then a measured second pass so the master lands on
          -14 LUFS integrated with true peak <= -1 dBTP; muxed with -c:v copy -> <short>/video.mp4 + video.sha256.

Options: --stages voice,time  --workers 4  --voice-dir DIR  --chatterbox-py PY  --whisper-py PY  --voice-cmd CMD
Linux: export CHROMIUM_PATH=/opt/pw-browsers/chromium (or pass --chromium).
"""
import argparse, hashlib, json, os, re, shlex, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D2_CMD = "{chatterbox_py} {voice_dir}/chatterbox_d2.py {script_md} {wav} {plain} --gap 0.2 --lead 0.05 --beat 0.4"


def sh(cmd, cwd=None, env=None):
    print("$ " + (cmd if isinstance(cmd, str) else " ".join(shlex.quote(c) for c in cmd)), flush=True)
    subprocess.run(cmd, cwd=cwd, env=env, check=True, shell=isinstance(cmd, str))


def norm(w):
    return re.sub(r"[^\w']", "", w.lower())


def load(p):
    return json.load(open(p, encoding="utf-8"))


def dump(obj, p):
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)
        f.write("\n")


def stage_voice(a, proj, L):
    inp = os.path.join(proj, "input"); os.makedirs(inp, exist_ok=True)
    md = os.path.join(inp, "tts_script.md"); plain = os.path.join(inp, "script.txt"); wav = os.path.join(inp, "voiceover.wav")
    with open(md, "w", encoding="utf-8") as f:
        f.write(f"# {L.get('title', '')}: narration (generated from lines.json)\n\n")
        for i, ln in enumerate(L["lines"], 1):
            f.write(f"{i}. {ln.get('tts', ln['text'])}\n")   # optional per-line "tts" = pronunciation respelling (same word count)
    with open(plain, "w", encoding="utf-8") as f:
        f.write("\n".join(ln["text"] for ln in L["lines"]) + "\n")
    cmd = (a.voice_cmd or D2_CMD).format(script_md=shlex.quote(md), plain=shlex.quote(plain + ".voice.txt"), wav=shlex.quote(wav),
                                         voice_dir=shlex.quote(a.voice_dir), chatterbox_py=shlex.quote(a.chatterbox_py), project=shlex.quote(proj))
    sh(cmd)
    if os.path.exists(plain + ".voice.txt"): os.remove(plain + ".voice.txt")
    # keep script.txt = exactly the lines.json wording (captions use it)
    with open(plain, "w", encoding="utf-8") as f:
        f.write("\n".join(ln["text"] for ln in L["lines"]) + "\n")


def stage_time(a, proj, L, kit):
    sh([a.whisper_py, os.path.join(kit, "tools", "transcribe.py"), "--project", proj, "--script", os.path.join(proj, "input", "script.txt"),
        "--lang", "en", "--model", "small"], cwd=kit)
    wj = load(os.path.join(proj, "timeline", "words.json")); words = wj.get("words", wj) if isinstance(wj, dict) else wj
    # map words to lines (the script is aligned token for token, in order)
    toks = []
    for li, ln in enumerate(L["lines"]):
        for tk in re.findall(r"\S+", ln["text"]):
            toks.append(li)
    assert len(toks) == len(words), f"word count mismatch: script {len(toks)} vs words.json {len(words)}"
    lw = [[] for _ in L["lines"]]
    for li, w in zip(toks, words): lw[li].append(w)
    tail = float(L.get("tail", 0.45)); lead = float(L.get("cut_lead", 0.06))
    dur = round(words[-1]["end"] + tail, 3)
    shots = []
    for li, ln in enumerate(L["lines"]):
        for k, s in enumerate(ln["shots"]):
            s = dict(s)
            if "word" in s:
                key = norm(s.pop("word")); nth = int(s.pop("nth", 1)); hits = [w for w in lw[li] if norm(w["word"]).startswith(key)]
                if len(hits) < nth: raise SystemExit(f"shot {s['id']}: word '{key}' #{nth} not in line {li + 1}")
                t = hits[nth - 1]["start"] - lead
            else:
                t = lw[li][0]["start"] - lead if (li or k) else 0.0
            t += float(s.pop("offset", 0))
            s.pop("at", None)
            shots.append({"id": s.pop("id"), "start": max(0.0, round(t, 3)), **s, "_line": li})
    shots[0]["start"] = 0.0
    for i, s in enumerate(shots):
        s["end"] = shots[i + 1]["start"] if i + 1 < len(shots) else dur
        s["line"] = " ".join(w["word"] for w in words if w["start"] >= s["start"] - 0.01 and w["start"] < s["end"] - 0.01)
        s.pop("_line")
    story_p = os.path.join(proj, "story", "shots.json"); os.makedirs(os.path.dirname(story_p), exist_ok=True)
    ordered = [{"id": s["id"], "start": s["start"], "end": round(s["end"], 3), "line": s["line"], **{k: v for k, v in s.items() if k not in ("id", "start", "end", "line")}} for s in shots]
    dump({"duration": dur, "generated_from": "lines.json + timeline/words.json (build_short.py time)", "shots": ordered}, story_p)
    cfg_p = os.path.join(proj, "config.json"); cfg = load(cfg_p); cfg["duration"] = dur; dump(cfg, cfg_p)
    print(f"\nduration {dur:.2f} s, {len(ordered)} shots")
    for s in ordered:
        d = s["end"] - s["start"]; flag = "" if 0.9 <= d <= 2.7 else "   <-- check length"
        print(f"  {s['id']:>4}  {s['start']:6.2f}-{s['end']:6.2f}  {d:4.2f}s  {s['line'][:60]}{flag}")
    for li, ws in enumerate(lw):
        print(f"  line {li + 1}: {ws[0]['start']:.2f}-{ws[-1]['end']:.2f}")


def stage_render(a, proj, kit, rel):
    env = dict(os.environ)
    if a.chromium: env["CHROMIUM_PATH"] = a.chromium
    elif "CHROMIUM_PATH" not in env and os.path.exists("/opt/pw-browsers/chromium"):
        env["CHROMIUM_PATH"] = "/opt/pw-browsers/chromium"
    sh(["node", "render.mjs", "--project", rel, "--out", f"{rel}/build/video_silent.mp4", "--workers", str(a.workers)], cwd=kit, env=env)


def loud(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1]); return float(j["input_i"]), float(j["input_tp"])


def stage_mix(a, proj, kit, rel, short):
    sh([a.mix_py, "audio/mix.py", "--project", rel, "--video", f"{rel}/build/video_silent.mp4", "--out", f"{rel}/out/video_mixpy.mp4"], cwd=kit)
    mixw = os.path.join(proj, "build", "mix.wav"); I, TP = loud(mixw)
    print(f"mix.py master: {I:.2f} LUFS, TP {TP:.2f} dBTP")
    # second, measured pass: exact gain to -14 LUFS, then a true-peak limiter at -1.2 dBTP if needed
    fin = os.path.join(proj, "build", "master.wav"); g = -14.0 - I
    af = f"volume={g:.2f}dB" + (",alimiter=limit=0.85:attack=1:release=60:level=disabled" if TP + g > -1.2 else "")
    sh(["ffmpeg", "-y", "-v", "error", "-i", mixw, "-af", af, "-ar", "48000", fin])
    I2, TP2 = loud(fin); print(f"master: {I2:.2f} LUFS, TP {TP2:.2f} dBTP")
    out = os.path.join(short, "video.mp4")
    sh(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(proj, "build", "video_silent.mp4"), "-i", fin, "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    I3, TP3 = loud(out)
    h = hashlib.sha256(open(out, "rb").read()).hexdigest()
    open(os.path.join(short, "video.sha256"), "w").write(f"{h}  video.mp4\n")
    pr = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames,width,height,r_frame_rate",
                         "-show_entries", "format=duration,size", "-of", "json", out], capture_output=True, text=True)
    info = json.loads(pr.stdout); qc = {"lufs_i": round(I3, 2), "true_peak_dbtp": round(TP3, 2), "sha256": h, **info["streams"][0], **info["format"]}
    dump(qc, os.path.join(short, "project", "qc.json")); print("QC", json.dumps(qc))
    contact_sheet(out, os.path.join(proj, "story", "shots.json"), os.path.join(short, "contact_sheet.png"))


def contact_sheet(video, shots_json, png):
    """first tile = frame 1 (t=0.04), then one frame from the middle of every other shot; 5 columns, 270 px wide tiles"""
    sh = load(shots_json)["shots"]; ts = [0.04] + [round((s["start"] + s["end"]) / 2, 2) for s in sh[1:]]
    tmp = os.path.join(os.path.dirname(png), ".cs"); os.makedirs(tmp, exist_ok=True)
    for i, t in enumerate(ts):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1", "-vf", "scale=270:-2", os.path.join(tmp, f"{i:03d}.png")], check=True)
    cols = 5; rows = (len(ts) + cols - 1) // cols
    sh_ = ["ffmpeg", "-y", "-v", "error", "-framerate", "1", "-i", os.path.join(tmp, "%03d.png"), "-vf", f"tile={cols}x{rows}:padding=6:margin=6:color=0x141414", "-frames:v", "1", png]
    subprocess.run(sh_, check=True); shutil.rmtree(tmp)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("short", help="justinclips/shorts/<slug>")
    ap.add_argument("--kit", required=True, help="whatif/aitrends-2d-studio of an origin/iawaken/toon3d-fx checkout")
    ap.add_argument("--stages", default="voice,time,render,mix")
    ap.add_argument("--voice-cmd", help="replacement voice command; must write {wav}")
    ap.add_argument("--voice-dir", default=os.environ.get("VOICE_DIR", "whatif/voice"), help="folder with chatterbox_d2.py (origin/voice-test)")
    ap.add_argument("--chatterbox-py", default=os.path.expanduser("~/.venvs/chatterbox/bin/python"))
    ap.add_argument("--whisper-py", default=None, help="python with faster-whisper (default: --chatterbox-py)")
    ap.add_argument("--mix-py", default=sys.executable, help="python with numpy + scipy for audio/mix.py")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--chromium")
    a = ap.parse_args(); a.whisper_py = a.whisper_py or a.chatterbox_py
    short = os.path.abspath(a.short); slug = os.path.basename(short.rstrip("/")); proj_src = os.path.join(short, "project")
    kit = os.path.abspath(a.kit); rel = f"projects/{slug}"; proj = os.path.join(kit, rel)
    os.makedirs(os.path.join(kit, "projects"), exist_ok=True)
    if os.path.islink(proj) or not os.path.exists(proj):
        if os.path.islink(proj): os.remove(proj)
        os.symlink(proj_src, proj)          # the kit renders the Short's own project/ folder in place
    L = load(os.path.join(proj_src, "lines.json")); st = a.stages.split(",")
    if "voice" in st: stage_voice(a, proj_src, L)
    if "time" in st: stage_time(a, proj_src, L, kit)
    if "render" in st: stage_render(a, proj_src, kit, rel)
    if "mix" in st: stage_mix(a, proj_src, kit, rel, short)


if __name__ == "__main__":
    main()
