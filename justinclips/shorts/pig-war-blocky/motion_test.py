#!/usr/bin/env python3
"""pig-war-blocky/motion_test.py: render a short motion test of the BLOCKY Pig War with the normal pipeline.

    python3 justinclips/shorts/pig-war-blocky/motion_test.py --kit <toon3d-fx>/whatif/aitrends-2d-studio [--from 10.4 --to 22.4] [--mix-py PY]

Same pipeline as justinclips/tools/build_short.py, only for a time range:
  1. render.mjs --from/--to (1080x1920, 24 fps, captions on)            -> project/build/motion_silent.mp4
  2. audio/mix.py on the WHOLE Short (real D2 voice + toon3d:upbeat music + SFX cues from lines.json, ducking)
     then build_short's measured pass to -14 LUFS / true peak <= -1 dBTP     -> project/build/master.wav
  3. the same range cut from the master (sample-exact to the video frames, 15 ms edge fades), muxed  -> motion_test.mp4
Default range 10.4-22.4 s = s07-s12 ($10, $100, ARREST HIM, the landing, 461 troops, five warships): the busiest 12 s.
"""
import argparse, hashlib, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
import build_short as BS  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kit", required=True)
    ap.add_argument("--from", dest="t0", type=float, default=10.4)
    ap.add_argument("--to", dest="t1", type=float, default=22.4)
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--mix-py", default=sys.executable, help="python with numpy + scipy for audio/mix.py")
    ap.add_argument("--skip-render", action="store_true")
    a = ap.parse_args()
    kit = os.path.abspath(a.kit); slug = os.path.basename(HERE); rel = f"projects/{slug}"; proj = os.path.join(HERE, "project")
    link = os.path.join(kit, rel); os.makedirs(os.path.join(kit, "projects"), exist_ok=True)
    if os.path.islink(link) or not os.path.exists(link):
        if os.path.islink(link): os.remove(link)
        os.symlink(proj, link)
    env = dict(os.environ)
    if "CHROMIUM_PATH" not in env and os.path.exists("/opt/pw-browsers/chromium"): env["CHROMIUM_PATH"] = "/opt/pw-browsers/chromium"
    fps = 24; f0, f1 = round(a.t0 * fps), round(a.t1 * fps); s0, dur = f0 / fps, (f1 - f0) / fps
    silent = os.path.join(proj, "build", "motion_silent.mp4")
    if not a.skip_render:
        BS.sh(["node", "render.mjs", "--project", rel, "--from", str(a.t0), "--to", str(a.t1), "--workers", str(a.workers), "--out", silent], cwd=kit, env=env)
    # full-length mix (voice + music + SFX), then the measured -14 LUFS / TP pass exactly as build_short.stage_mix does
    BS.sh([a.mix_py, "audio/mix.py", "--project", rel], cwd=kit)
    mixw = os.path.join(proj, "build", "mix.wav"); I, TP = BS.loud(mixw); g = -14.0 - I
    af = f"volume={g:.2f}dB" + (",alimiter=limit=0.85:attack=1:release=60:level=disabled" if TP + g > -1.2 else "")
    master = os.path.join(proj, "build", "master.wav")
    BS.sh(["ffmpeg", "-y", "-v", "error", "-i", mixw, "-af", af, "-ar", "48000", master])
    I2, TP2 = BS.loud(master); print(f"full master: {I2:.2f} LUFS, TP {TP2:.2f} dBTP")
    out = os.path.join(HERE, "motion_test.mp4")
    BS.sh(["ffmpeg", "-y", "-v", "error", "-i", silent, "-ss", f"{s0:.5f}", "-t", f"{dur:.5f}", "-i", master, "-map", "0:v:0", "-map", "1:a:0",
           "-af", f"afade=t=in:d=0.015,afade=t=out:st={dur - 0.015:.4f}:d=0.015", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
    I3, TP3 = BS.loud(out); h = hashlib.sha256(open(out, "rb").read()).hexdigest()
    print(f"motion_test.mp4: {s0:.3f}-{s0 + dur:.3f} s ({f1 - f0} frames), clip loudness {I3:.2f} LUFS, TP {TP3:.2f} dBTP\nsha256 {h}")


if __name__ == "__main__":
    main()
