# Episode badge for TikTok/YouTube copies: jobs/<n>/<n>.mp4 -> jobs/<n>/<n>_ep.mp4
# Usage: python3 -I brand.py <name> [<name> ...]   (episode numbers come from handoff/episodes.csv)
#        python3 -I brand.py <name> --ep <number>     (number assigned by the main session, before it's in episodes.csv)
import csv, pathlib, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
F_EP = str(HERE / "styles/aidoom/fonts/Anton.ttf"); F_TX = str(HERE / "styles/distilbook/fonts/Inter.ttf")
EPS = {r["reel"]: int(r["episode"]) for r in csv.DictReader(open(ROOT / "handoff/episodes.csv"))}
# candidate spots (top area, below the TikTok/Shorts top bar, clear of the right-side buttons); the quietest one wins
SPOTS = [(x, y) for y in (260, 330, 400, 470, 540) for x in (44, "R")]  # y >= 260: TikTok's top tabs cover about the top 240 px (research/TIKTOK.md)
T0 = 5.0  # badge fades in after the hook (HOOKS.md: frame 0 and the first seconds stay clean)
# per-reel overrides (H3 QA, Oct 28): spot (x, y), fade-in time t0, and hide windows [(a, b), ...] where a title/label passes
# under the badge (it fades out 0.3 s before a and back in 0.3 s after b). Found with a 4 fps edge-density scan + frame checks.
OVR = {
    "airfryer": {"t0": 7.0},                                      # the NOT A FRYER logo sits in the top-left until ~6.5 s
    "tap": {"spot": (651, 590), "hide": [(12.7, 17.1)]},          # top band is full-width terminal text; only one long paragraph reaches y 590
    "barcode": {"spot": (44, 1360), "hide": [(7.0, 99.0)]},  # giant headlines fill nearly every frame: badge shows only 5-6.7 s (12 DIGITS lands at 7.0 s), low-left inside the safe zone
    "recommend": {"spot": (44, 1366), "hide": [(4.7, 8.6), (52.6, 57.0)]},  # signs/boards fill the top; low-left above the captions
    # H2 badge fix, Oct 28 (TikTok safe zone: y >= 260, bottom edge <= 1440, out of the right button column at y >= 840)
    "thermos": {"spot": (44, 1360), "hide": [(17.27, 21.6), (22.19, 27.2), (46.05, 51.7)]},   # under the typed caption; hidden while a caption runs to 3 lines
    "ouija": {"spot": (44, 1200)},     # auto spot was y 196; low-left crosses only puppet art
    "match": {"spot": (44, 1320)},     # top spots hit the HALF IS ON THE BOX title; low-left above the caption box
    "magnet": {"spot": ("R", 260), "t0": 7.0},   # the "Cut it in half" headline reaches the top-right until ~6.5 s
    "search": {"spot": ("R", 260)}, "orbit": {"spot": ("R", 360)}, "window": {"spot": ("R", 260)},   # empty top-right band
    "faceid": {"spot": (44, 1300), "hide": [(52.3, 56.0), (57.8, 61.0)]},   # passcode dots, "1 IN 1,000,000"
    "submarine": {"spot": (44, 1360)}, # seabed only
    "snowwhite": {"spot": (44, 1360)},  # top band holds the search bar and handwritten labels; empty strip under the captions
    "yawn": {"spot": (44, 920), "hide": [(63.5, 99.0)]},        # top band holds titles, frames and chalkboards; mid-left wall is the quietest (edge scan)
    "wrinklyfingers": {"spot": ("R", 260), "hide": [(12.8, 17.8), (34.8, 37.8)]},  # captions run to 3 lines here; top-right band is clear
    "handwarmer": {"spot": (44, 1366)},   # titles and labels fill the top; the strip under the captions is always empty
    "popcorn": {"spot": (44, 1050)},     # low-left over stove art, above the captions; top-left hits the hook plaques
    "staticshock": {"spot": (44, 1366)},   # H3: free strip under the captions
    "coldbreath": {"spot": (44, 1366)},   # H3: free strip under the captions
    "stomachgrowl": {"spot": ("R", 260)},   # H2: hanging signs moved down to y 340 so the top-right badge clears them
    "catpurr": {"spot": (44, 680), "hide": [(7.4, 49.6)]},   # H2: plaques fill the top band; mid-left is clear in the hook and from 49.6 s
    "earpop": {"spot": ("R", 260)},   # H4: top-right is clear of the field-note titles
    "brainfreeze": {"spot": (651, 260), "hide": [(3.7, 11.8), (64.4, 99.0)]},   # H1: top-right; hidden in the lab shots where blackboard text sits there
    "slipperyice": {"spot": ("R", 260), "hide": [(67.6, 99.0)]},   # H4: top-right; hidden under the end card
    "eggflip": {"spot": (44, 1366)},   # titles run to the top-right corner; strip under the captions is clear
    "voicerecording": {"spot": ("R", 256), "hide": [(6.0, 13.7)]},   # H2: own HUD leaves the top-right corner empty; hidden under the centred "two paths" title
    "firstsnowsmell": {"spot": (44, 260)},   # H4: posters framed from y 340 so the table strip above them stays clear
    "mpemba": {"spot": (44, 1366)},   # caption card ends at y 1355; navy board below it
    "noisecancel": {"spot": ("R", 256)},   # H2: HUD timecode and top-right bracket removed so the badge owns that corner
    "coldtaste": {"spot": ("R", 260)},   # H2: progress bar shortened to x 60-620 so the top-right badge clears it and the recipe card (y 360+)
    "goosebumps": {"spot": (44, 1366)},   # captions end at y 1355 on the dark sand ground
    "daylightsleep": {"spot": (44, 1368)},   # H4: cut-letter plaques fill the top band; low-left under the (raised) storyteller placard
    "ovenfoil": {"spot": (651, 400)},   # H1: right of the FIG label, above the figure callouts; the top band is the sheet header
    "hiccups": {"spot": (44, 400), "hide": [(67.7, 99.0)]},   # H1: below the left plaques; hidden for the end card
    "snowflake": {"spot": (44, 1366)},   # paper banner ends at y 1355; snow-bank paper only below it
    "goldfishmemory": {"spot": ("R", 260)},   # H1: top-right band over moon/plum art; left side carries status text and the end card
    "microwavelight": {"spot": (651, 400), "hide": [(63.7, 99.0)]},   # H1: right of the night diagrams; hidden once the sketchbook page (title + end card) returns
    "candle": {"spot": (44, 1060), "hide": [(25.4, 28.4)]},   # titles/labels fill y 300-1000 in every shot; low-left sits on the rim-lit audience row (art); hidden under "this is what burns"
    "leafcolor": {"spot": (44, 560)},   # top labels sit at y 300-440 across the middle; mid-left only crosses ensō strokes, the sun and the seal (art)
    "runnynose": {"spot": (44, 1366)},   # subtitle paper patch ends at y 1355; snow hatch only below it
    "cranberries": {"spot": (44, 600), "t0": 7.2, "hide": [(56.2, 99.0)]},   # banner stage until 6.7 s; posters fill y 235-1150 with header/band text top and bottom; mid-left sits over poster art only; the wall and end card are all titles, so hidden from 56.2 s
    "popuptimer": {"spot": (44, 1080), "hide": [(47.3, 52.4)]},   # titles fill the top band in every scene; low-left above the caption box sits on art only; hidden under "3 popped early"
    # H2 QA, Oct 28
    "skeleton": {"spot": (44, 560)},   # auto spot sat on the hook sign and end-card sign
    "ship": {"spot": ("R", 300)},      # sky/sun only, just above the end-card sign (mid spots hit labels)
    "skyblue": {"spot": (660, 436)},   # auto spot sat on the end-card title
    "lock": {"spot": (44, 1276)},      # top spots hit the "5 HOLES"/"SPRING" callouts; bottom-left above the NOTE box
    # H4 QA, Oct 28
    "flush": {"spot": (44, 1300)},       # every top spot hit a seal, headline, label or the end card
    "hurricanewc": {"spot": (44, 300)},  # auto spot sat on the character's head
    "onion": {"spot": (44, 1330)},       # right side is TikTok's button column; y 1300 clipped the "wet surface" label
    # H1 QA, Oct 28 (auto spot covered text on these)
    "darkeyes": {"spot": (44, 1320)}, "foxfire": {"spot": (44, 600)}, "zombieant": {"spot": (44, 860)},
    "catseyes": {"spot": (44, 1280), "hide": [(65.0, 70.0)]}, "owl": {"spot": (44, 1320)}, "spidersilk": {"spot": (44, 1060)}, "pumpkin": {"spot": ("R", 392)},
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

ARGS = sys.argv[1:]; EPOV = {}
if "--ep" in ARGS:  # workers: python3 -I brand.py <name> --ep <number>  (the main session assigns the number)
    i = ARGS.index("--ep"); EPOV[ARGS[i - 1]] = int(ARGS[i + 1]); del ARGS[i:i + 2]
EPS.update(EPOV)
for n in ARGS:
    src = ROOT / f"jobs/{n}/{n}.mp4"; dst = ROOT / f"jobs/{n}/{n}_ep.mp4"; png = HERE / f"stills/badge_{n}.png"
    png.parent.mkdir(exist_ok=True); b = badge(EPS[n]); b.save(png)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)], capture_output=True, text=True).stdout)
    o = OVR.get(n, {}); t0 = o.get("t0", T0)
    if "spot" in o: (X, Y), busy = o["spot"], -1; X = 1080 - 44 - b.size[0] if X == "R" else X
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
