#!/usr/bin/env python3
"""Automatic QA gate for a finished reel (see QA.md). ffmpeg + numpy + PIL only.
usage: python3 -I reels/qa.py <name> [--mp4 PATH] [--tl PATH] [--spec PATH] [--metrics]
Reads jobs/<name>/<name>.mp4 (+ reels/tl_<name>.js, reels/specs/<name>.json), prints PASS/WARN/FAIL per check,
writes jobs/<name>/qa_<name>.txt and reels/stills/qa_<name>.jpg (the flagged moments). Exit code 1 on any FAIL."""
import json, pathlib, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
FPS, VW, VH = 4, 270, 480            # analysis grid: 4 fps, quarter resolution (1 px here = 4 px of 1080x1920)
S = 1080 / VW

# ---- thresholds (calibrated on approved reels; see QA.md) ----
STATIC_DIFF = 0.35       # mean abs frame difference (0-255) below which a 0.25 s step counts as "no change"
STATIC_MAX_S = 4.0       # FAIL if a no-change run lasts longer than this
EMPTY_EDGE = 0.9         # mean edge strength of a third below which it counts as near-blank
EMPTY_MAX_S = 6.0
STRONG = 60.0           # gradient (sum of |dx|+|dy| on the 1/4-res grey frame) that counts as a strong edge (text, ink lines)
BG_SHARE = 0.5          # strong edges present in more than half of all frames are fixed decoration (frames, HUDs) and are ignored
ZONE_WARN, ZONE_FAIL = 5.0, 20.0   # % of a platform-UI zone covered by foreground strong edges
ZONE_MAX_S = 3.0
BORDER_PCT = 5.0        # % of the outer 24 px band (worst side) covered by foreground strong edges
BORDER_MAX_S = 2.0
LUFS_RANGE = (-16.0, -14.0); TP_WARN, TP_FAIL = -1.0, 0.0   # dBTP: above -1 WARN (platform re-encode headroom), above 0 FAIL (clips)
VOICE_FAIL_DB, VOICE_WARN_DB = 3.5, 6.0   # speech vs the pauses between phrases (approved reels: 4.0-9.4 dB)
LEN_RANGE = (66.0, 86.0)
CLOSING = "Follow for more of how it really works."
BLANK_STD = 1.2             # any single frame whose luminance std is under this is a blank (solid-colour) frame
F0_EDGE, F0_STD = 1.0, 18.0  # frame 0: luminance std (contrast) must be strong; edges only need to exist (big flat type has few edges)
FRAME_WH = (1080, 1920)     # owner rule: 9:16, exactly 1080x1920, square pixels (SAR 1:1), also for the _ep copy
BAR_PX, BAR_SHARE = 60, 0.5  # cropdetect (limit 24): WARN if a black bar over 60 px on any side in more than half of the 1 fps samples

def args():
    a = sys.argv[1:]; o = {"name": a[0], "metrics": "--metrics" in a}
    for k in ("--mp4", "--tl", "--spec"):
        if k in a: o[k[2:]] = a[a.index(k) + 1]
    n = o["name"]
    o.setdefault("mp4", str(ROOT / f"jobs/{n}/{n}.mp4")); o.setdefault("tl", str(HERE / f"tl_{n}.js")); o.setdefault("spec", str(HERE / f"specs/{n}.json"))
    return o

def video(mp4):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vf", f"fps={FPS},scale={VW}:{VH},format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, VH, VW).astype(np.float32)

def edges(f):   # gradient magnitude per pixel (cheap Sobel-like)
    gx = np.abs(np.diff(f, axis=-1))[..., :-1, :]; gy = np.abs(np.diff(f, axis=-2))[..., :, :-1]
    return gx + gy

def runs(mask, min_s):  # [(t0, t1), ...] of True runs longer than min_s (mask sampled at FPS)
    out, i, n = [], 0, len(mask)
    while i < n:
        if mask[i]:
            j = i
            while j < n and mask[j]: j += 1
            if (j - i) / FPS > min_s: out.append((i / FPS, j / FPS))
            i = j
        else: i += 1
    return out

def longest(mask): r = runs(mask, -1); return max([b - a for a, b in r], default=0.0)

def audio(mp4):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", mp4, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    summ = r[r.rfind("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1)); TP = float(re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", summ).group(1))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return I, TP, np.frombuffer(raw, np.float32)

def db(x): return 10 * np.log10(np.mean(x.astype(np.float64) ** 2) + 1e-12)

def main():
    o = args(); n = o["name"]; res = []; flags = []   # res: (status, check, detail); flags: (t, label)
    def add(st, ck, det, fl=()): res.append((st, ck, det)); flags.extend(fl)
    V = video(o["mp4"]); T = len(V) / FPS; E = edges(V); m = {}
    # 1 static stretches
    d = np.abs(np.diff(V, axis=0)).mean(axis=(1, 2)); st = d < STATIC_DIFF; m["static_longest_s"] = longest(st)
    r = runs(st, STATIC_MAX_S)
    add("FAIL" if r else "PASS", "static", f"longest no-change run {m['static_longest_s']:.2f} s (limit {STATIC_MAX_S} s)" + (f"; at {', '.join(f'{a:.1f}-{b:.1f}s' for a, b in r)}" if r else ""), [(a + .5, "static") for a, b in r])
    # 2 empty thirds
    th = [E[:, i * VH // 3:(i + 1) * VH // 3 - 1].mean(axis=(1, 2)) for i in range(3)]; bad = []
    for name, e in zip(("top", "middle", "bottom"), th):
        m[f"empty_{name}_longest_s"] = longest(e < EMPTY_EDGE); bad += [(name, a, b) for a, b in runs(e < EMPTY_EDGE, EMPTY_MAX_S)]
    add("FAIL" if bad else "PASS", "empty thirds", "; ".join(f"{k} third near-blank {a:.1f}-{b:.1f}s" for k, a, b in bad) or f"no third near-blank > {EMPTY_MAX_S} s (longest {max(m[k] for k in m if k.startswith('empty')):.1f} s)", [(a + 1, f"empty {k}") for k, a, b in bad])
    # 3 platform UI safe zones (TikTok/Shorts): right column, bottom strip, top strip
    zones = {"right x>900 y900-1650": (slice(int(900 / S), int(1650 / S) - 1), slice(int(900 / S), VW - 1)),
             "bottom y>1700": (slice(int(1700 / S), VH - 1), slice(0, VW - 1)), "top y<150": (slice(0, int(150 / S)), slice(0, VW - 1))}
    Es = E > STRONG; FG = Es & ~(Es.mean(axis=0) > BG_SHARE)      # foreground strong edges (moving/changing content)
    worst = "PASS"; det = []; fl = []
    for k, (ys, xs) in zones.items():
        e = FG[:, ys, xs].mean(axis=(1, 2)) * 100; m[f"zone[{k}]_p90_pct"] = float(np.percentile(e, 90))
        rf, rw = runs(e > ZONE_FAIL, ZONE_MAX_S), runs(e > ZONE_WARN, ZONE_MAX_S)
        if rf: worst = "FAIL"; det.append(f"{k}: heavy content {', '.join(f'{a:.1f}-{b:.1f}s' for a, b in rf)}"); fl += [(a + .5, "zone") for a, b in rf]
        elif rw: worst = "WARN" if worst == "PASS" else worst; det.append(f"{k}: content {', '.join(f'{a:.1f}-{b:.1f}s' for a, b in rw[:4])}" + (" ..." if len(rw) > 4 else "")); fl += [(a + .5, "zone?") for a, b in rw[:2]]
    add(worst, "safe zones", "; ".join(det) or "UI zones clear")
    # 4 outer 24 px band
    b = int(24 / S); band = np.maximum.reduce([FG[:, :b].mean(axis=(1, 2)), FG[:, -b - 1:-1].mean(axis=(1, 2)), FG[:, :, :b].mean(axis=(1, 2)), FG[:, :, -b - 1:-1].mean(axis=(1, 2))]) * 100
    m["border_p90_pct"] = float(np.percentile(band, 90)); r = runs(band > BORDER_PCT, BORDER_MAX_S)
    add("WARN" if r else "PASS", "outer 24 px", (f"content at the frame edge {', '.join(f'{a:.1f}-{b:.1f}s' for a, b in r[:4])}" + (" ..." if len(r) > 4 else "")) if r else "clear", [(a + .5, "edge?") for a, b in r[:2]])
    # 5 audio: loudness, true peak, voice over music/fx
    I, TP, A = audio(o["mp4"]); m.update(LUFS=I, TP=TP)
    add("PASS" if LUFS_RANGE[0] <= I <= LUFS_RANGE[1] else "FAIL", "loudness", f"{I:.1f} LUFS integrated (want {LUFS_RANGE[0]}..{LUFS_RANGE[1]})")
    add("FAIL" if TP > TP_FAIL else "WARN" if TP > TP_WARN else "PASS", "true peak", f"{TP:.1f} dBTP (WARN above {TP_WARN}, FAIL above {TP_FAIL})")
    try:
        s = pathlib.Path(o["tl"]).read_text(); P = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))["p"]; sr = 16000
        sp = np.concatenate([A[int((p["start"] + .05) * sr):int((p["end"] - .05) * sr)] for p in P])
        gaps = [(P[i]["end"] + .12, P[i + 1]["start"] - .12) for i in range(len(P) - 1) if P[i + 1]["start"] - P[i]["end"] > .45]
        pa = np.concatenate([A[int(a * sr):int(b * sr)] for a, b in gaps]) if gaps else np.zeros(1)
        gap = db(sp) - db(pa); m["voice_gap_db"] = gap
        add("FAIL" if gap < VOICE_FAIL_DB else "WARN" if gap < VOICE_WARN_DB else "PASS", "voice over bed", f"speech {gap:.1f} dB above the pauses ({len(gaps)} pauses; FAIL < {VOICE_FAIL_DB}, WARN < {VOICE_WARN_DB})")
    except Exception as ex: add("FAIL", "voice over bed", f"could not read {o['tl']}: {ex}")
    # 6 length, closing line, spoken years
    add("PASS" if LEN_RANGE[0] <= T <= LEN_RANGE[1] else "FAIL", "length", f"{T:.1f} s (want {LEN_RANGE[0]:.0f}-{LEN_RANGE[1]:.0f})")
    try:
        ph = json.load(open(o["spec"]))["phrases"]; last = ph[-1][1].strip()
        add("PASS" if last == CLOSING else "FAIL", "closing line", f'last spoken: "{last}"')
        yrs = [(i, y) for i, p in enumerate(ph) for y in re.findall(r"(?<![\d,.])(1[1-9]\d\d|20\d\d)(?![\d,])", p[1])]
        add("FAIL" if yrs else "PASS", "spoken years", "; ".join(f"phrase {i}: {y} (write it in words)" for i, y in yrs) or "no 4-digit years in the spoken text")
    except Exception as ex: add("FAIL", "closing line", f"could not read {o['spec']}: {ex}")
    # 7 frame 0
    e0, s0 = float(E[0].mean()), float(V[0].std()); m.update(frame0_edge=e0, frame0_std=s0)
    ok = e0 >= F0_EDGE and s0 >= F0_STD
    add("PASS" if ok else "FAIL", "frame 0", f"edge {e0:.1f} (min {F0_EDGE}), contrast {s0:.1f} (min {F0_STD})", [] if ok else [(0, "frame 0")])
    # 7b blank frames at full frame rate (contrails, Oct 28: solid navy flashes at poster swaps that the FPS samples missed)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", o["mp4"], "-vf", "scale=27:48,format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    Vf = np.frombuffer(raw, np.uint8).reshape(-1, 48, 27).astype(np.float32); fr = len(Vf) / T
    bl = [i / fr for i in np.nonzero(Vf.std(axis=(1, 2)) < BLANK_STD)[0]]; m["blank_frames"] = len(bl)
    add("FAIL" if bl else "PASS", "blank frames", f"{len(bl)} near-uniform frames, first at {', '.join(f'{t:.2f}s' for t in bl[:4])}" if bl else "none", [(bl[0], "blank")] if bl else [])

    # 8 frame geometry (9:16) and black bars
    mp = pathlib.Path(o["mp4"]); ep = mp.with_name(mp.stem + "_ep.mp4"); geo = []
    for f in [mp] + ([ep] if ep.exists() and not mp.stem.endswith("_ep") else []):
        pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,sample_aspect_ratio", "-of", "csv=p=0", str(f)], capture_output=True, text=True).stdout.strip().split(",")
        w, h, sar = int(pr[0]), int(pr[1]), (pr[2] if len(pr) > 2 else "1:1")
        ok = (w, h) == FRAME_WH and sar in ("1:1", "N/A", "0:1"); geo.append((ok, f"{f.name} {w}x{h} SAR {sar}"))
    add("PASS" if all(g[0] for g in geo) else "FAIL", "9:16 frame", "; ".join(g[1] for g in geo) + f" (want {FRAME_WH[0]}x{FRAME_WH[1]}, SAR 1:1)")
    cd = subprocess.run(["ffmpeg", "-nostats", "-i", str(mp), "-vf", "fps=1,cropdetect=limit=24:round=2:reset=1", "-f", "null", "-"], capture_output=True, text=True).stderr
    W0, H0 = (int(x) for x in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(mp)], capture_output=True, text=True).stdout.strip().split(",")[:2]); bars = []
    for cw, ch, cx, cy in re.findall(r"crop=(\d+):(\d+):(\d+):(\d+)", cd):
        cw, ch, cx, cy = map(int, (cw, ch, cx, cy)); bars.append(max(cx, cy, W0 - cw - cx, H0 - ch - cy))
    share = float(np.mean([b > BAR_PX for b in bars])) if bars else 0.0; m["bar_share"] = share; m["bar_median_px"] = float(np.median(bars)) if bars else 0.0
    add("WARN" if share > BAR_SHARE else "PASS", "black bars", f"bar over {BAR_PX} px in {share * 100:.0f}% of samples (median widest bar {m['bar_median_px']:.0f} px)" + ("; a deliberate film-frame border is OK, letterboxing is not" if share > BAR_SHARE else ""))

    # ---- report ----
    worst = "FAIL" if any(r[0] == "FAIL" for r in res) else "WARN" if any(r[0] == "WARN" for r in res) else "PASS"
    lines = [f"QA {n}: {worst}   ({o['mp4']}, {T:.1f} s)"] + [f"  {st:4s}  {ck:15s} {det}" for st, ck, det in res]
    if o["metrics"]: lines += ["  metrics: " + json.dumps({k: round(float(v), 2) for k, v in m.items()})]
    txt = "\n".join(lines); print(txt)
    out = ROOT / f"jobs/{n}"; out.mkdir(parents=True, exist_ok=True); (out / f"qa_{n}.txt").write_text(txt + "\n")
    # contact sheet of flagged moments (or an even spread when nothing is flagged)
    pts = sorted(set((round(t, 1), l) for t, l in flags))[:12] or [(round(T * k / 7, 1), "ok") for k in range(8)]
    tw, thh = 180, 320; sh = Image.new("RGB", (tw * min(6, len(pts)), thh * (-(-len(pts) // 6))), (20, 20, 20))
    for i, (t, l) in enumerate(pts):
        k = min(len(V) - 1, int(t * FPS)); im = Image.fromarray(V[k].astype(np.uint8)).convert("RGB").resize((tw, thh)); dr = ImageDraw.Draw(im)
        dr.rectangle([0, 0, tw, 14], fill=(0, 0, 0)); dr.text((3, 1), f"{t:.1f}s {l}", fill=(255, 220, 0)); sh.paste(im, ((i % 6) * tw, (i // 6) * thh))
    (HERE / "stills").mkdir(exist_ok=True); sh.save(HERE / f"stills/qa_{n}.jpg", quality=85)
    sys.exit(1 if worst == "FAIL" else 0)

if __name__ == "__main__": main()
