# Episode badge for TikTok/YouTube copies: jobs/<n>/<n>.mp4 -> jobs/<n>/<n>_ep.mp4
# Usage: python3 -I brand.py <name> [<name> ...]   (episode numbers come from handoff/episodes.csv)
import csv, pathlib, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
F_EP = str(HERE / "styles/aidoom/fonts/Anton.ttf"); F_TX = str(HERE / "styles/distilbook/fonts/Inter.ttf")
EPS = {r["reel"]: int(r["episode"]) for r in csv.DictReader(open(ROOT / "handoff/episodes.csv"))}
# candidate spots (top area, below the TikTok/Shorts top bar, clear of the right-side buttons); the quietest one wins
SPOTS = [(x, y) for y in (196, 260, 330, 400, 470) for x in (44, "R")]
T0 = 5.0  # badge fades in after the hook (HOOKS.md: frame 0 and the first seconds stay clean)
# per-reel overrides (H3 QA, Oct 28): spot (x, y), fade-in time t0, and hide windows [(a, b), ...] where a title/label passes
# under the badge (it fades out 0.3 s before a and back in 0.3 s after b). Found with a 4 fps edge-density scan + frame checks.
OVR = {
    "airfryer": {"t0": 7.0},                                      # the NOT A FRYER logo sits in the top-left until ~6.5 s
    "tap": {"spot": (651, 590), "hide": [(12.7, 17.1)]},          # top band is full-width terminal text; only one long paragraph reaches y 590
    "barcode": {"spot": (44, 1490), "hide": [(8.3, 60.4)]},  # giant headlines fill the top and (on the left) ~40%+ of the low band; TikTok buttons cover the right: show only 5-8 s and the last 8 s, low-left above the subtitles
    "recommend": {"spot": (44, 1430), "hide": [(4.7, 8.6), (27.9, 38.0), (59.2, 66.0)]},  # signs/boards fill the top; low-left above the captions
    # H2 QA, Oct 28
    "skeleton": {"spot": (44, 560)},   # auto spot sat on the hook sign and end-card sign
    "ship": {"spot": (44, 196)},       # mid spots hit labels and the end-card sign
    "skyblue": {"spot": (660, 436)},   # auto spot sat on the end-card title
    "lock": {"spot": (44, 1276)},      # top spots hit the "5 HOLES"/"SPRING" callouts; bottom-left above the NOTE box
}

def frames(src, dur, k=24):
    out = []
    for i in range(k):
        t = T0 + (dur - T0 - 1) * i / (k - 1)
        r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", str(src), "-vframes", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True)
        import io; out.append(Image.open(io.BytesIO(r.stdout)).convert("L").filter(ImageFilter.FIND_EDGES))
    return out

def place(src, dur, bw, bh):
    fr = frames(src, dur); best = None
    for x, y in SPOTS:
        x = 1080 - 44 - bw if x == "R" else x
        box = (x - 12, y - 12, x + bw + 12, y + bh + 12)
        v = sorted(ImageStat.Stat(f.crop(box)).mean[0] for f in fr); busy = v[int(.9 * (len(v) - 1))]  # 90th percentile: avoid spots that are ever busy
        if best is None or busy < best[0]: best = (busy, x, y)
    return best

def badge(ep):
    s = 2; ep_f = ImageFont.truetype(F_EP, 50 * s); tx_f = ImageFont.truetype(F_TX, 19 * s)
    try: tx_f.set_variation_by_axes([700])
    except Exception: pass
    ep_t = f"EP {ep:02d}"; tx_t = "HOW IT REALLY WORKS"
    ew = ep_f.getbbox(ep_t)[2]; tw = tx_f.getbbox(tx_t)[2]
    pad = 18 * s; gap = 16 * s; h = 74 * s; w = pad + ew + gap + 3 * s + gap + tw + pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=(14, 14, 18, 178), outline=(255, 255, 255, 60), width=s)
    d.text((pad, h / 2), ep_t, font=ep_f, fill=(255, 205, 64, 255), anchor="lm")
    x = pad + ew + gap; d.rectangle((x, h * .28, x + 3 * s, h * .72), fill=(255, 255, 255, 110))
    d.text((x + 3 * s + gap, h / 2), tx_t, font=tx_f, fill=(255, 255, 255, 235), anchor="lm")
    return im.resize((w // s, h // s), Image.LANCZOS)

for n in sys.argv[1:]:
    src = ROOT / f"jobs/{n}/{n}.mp4"; dst = ROOT / f"jobs/{n}/{n}_ep.mp4"; png = HERE / f"stills/badge_{n}.png"
    png.parent.mkdir(exist_ok=True); b = badge(EPS[n]); b.save(png)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)], capture_output=True, text=True).stdout)
    o = OVR.get(n, {}); t0 = o.get("t0", T0)
    if "spot" in o: (X, Y), busy = o["spot"], -1
    else: busy, X, Y = place(src, dur, *b.size)
    # fade in at t0 so the hook stays clean; fade out/in around hide windows; hold to the end. 2-pass to the same ~9.6 MB as enc_hq.sh
    vis = f"clip((T-{t0})/0.4,0,1)" + "".join(f"*(1-clip(min((T-{a - .3})/0.3,({b + .3}-T)/0.3),0,1))" for a, b in o.get("hide", []))
    fc = f"[1]format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='alpha(X,Y)*{vis}'[b];[0][b]overlay={X}:{Y}:shortest=1"
    vb = int((9.6 * 8e6 / dur - 72000) / 1000); log = f"/tmp/brand_{n}"
    base = ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-loop", "1", "-i", str(png), "-filter_complex", fc,
            "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-b:v", f"{vb}k", "-pix_fmt", "yuv420p", "-passlogfile", log]
    subprocess.run(base + ["-pass", "1", "-an", "-f", "mp4", "/dev/null"], check=True)
    subprocess.run(base + ["-pass", "2", "-c:a", "copy", "-movflags", "+faststart", str(dst)], check=True)
    print(n, EPS[n], f"spot {X},{Y} busy {busy:.1f}", dst.stat().st_size, flush=True)
