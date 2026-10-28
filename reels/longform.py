# Long-form 16:9 compilation from finished reels: jobs/long_tech/long_tech.mp4
# Layout 1920x1080: reel at full height in the centre (608x1080), left panel = chapter card + key idea, right panel = sourced
# fact cards timed to the reel + a 6-chapter progress list. New narration (cold open, bridges, outro) from specs/lt_*.json.
# usage: python3 -I longform.py            (needs vo/mix for lt_* already made with voice2.py + mix2.py)
import json, pathlib, re, subprocess, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
OUT = ROOT / "jobs/long_tech"; OUT.mkdir(parents=True, exist_ok=True); TMP = HERE / "out/long_tech"; TMP.mkdir(parents=True, exist_ok=True)
FPS, W, H, CW, CX = 30, 1920, 1080, 608, 656
ANTON = str(HERE / "styles/aidoom/fonts/Anton.ttf"); INTER = str(HERE / "styles/distilbook/fonts/Inter.ttf")
GOLD, INK, GREY, PAPER = (255, 205, 64), (22, 22, 28), (110, 108, 104), (239, 232, 218)
def run(a): subprocess.run(a, check=True)
def dur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)
def tl(path): return json.loads(re.sub(r"^window.TL=|;$", "", pathlib.Path(path).read_text().strip()))

CH = [  # name, title, subtitle, key idea, [(t in reel, fact, source)], recap/outro clip start
 ("barcode", "BARCODES", "What the stripes really hold", "A barcode holds only a number. The store's computer looks up the price.",
  [(4.5, "Most U.S. products carry a 12-digit number (UPC-A).", "GS1; Wikipedia: Universal Product Code"), (37.4, "The last digit is a check digit: a bit of math catches misreads.", "Wikipedia: Universal Product Code"), (55.0, "First scan: a 10-pack of Juicy Fruit gum, Troy, Ohio, June 26, 1974.", "Wikipedia: UPC (Smithsonian)")], 4.5),
 ("search", "SEARCH", "Why results arrive in a split second", "Google answers from an index it built before you asked.",
  [(11.2, "The index: hundreds of billions of pages, over 100,000,000 GB.", "Google, How Search works"), (40.0, "Ranking weighs meaning, relevance, quality, usability and context.", "Google, How Search works"), (58.3, "About 15% of daily searches have never been seen before.", "Google blog, Oct 2019")], 11.2),
 ("faceid", "FACE ID", "How your phone knows it's you", "Your phone measures the 3D shape of your face, not a photo.",
  [(6.2, "Thousands of invisible infrared dots build a depth map.", "Apple Support: About Face ID"), (35.0, "The face data stays on the device, in the Secure Enclave.", "Apple Platform Security guide"), (55.9, "Chance a random person unlocks it: less than 1 in 1,000,000.", "Apple Support: About Face ID")], 14.3),
 ("recommend", "YOUR FEED", "Who picks what you see", "A funnel: millions of videos, a few hundred candidates, a few dozen on your screen.",
  [(8.3, "Funnel: millions → hundreds → dozens of videos.", "Covington et al., RecSys 2016"), (28.1, "The 2016 system ranked by predicted watch time.", "Covington et al., RecSys 2016"), (37.8, "Today: also surveys, shares, likes and dislikes.", "YouTube Official Blog, 2021")], 8.3),
 ("wifi", "WI-FI", "Why it goes through walls", "Radio waves slip through most walls, losing a little energy each time.",
  [(17.3, "2.4 GHz Wi-Fi waves are about 12 cm long.", "c = f × λ; Wikipedia: Wi-Fi"), (30.8, "Microwave ovens use 2.45 GHz at 600-1,200 W.", "Wikipedia: Microwave oven"), (53.5, "5 GHz: about 6 cm waves, absorbed more by walls.", "Wikipedia: Wi-Fi")], 43.9),
 ("tap", "TAP TO PAY", "How a card with no battery pays", "The terminal's magnetic field powers the card, and every payment uses a one-time code.",
  [(8.0, "The field flips about 13.56 million times a second (NFC).", "Wikipedia: Near-field communication"), (26.0, "Range: about 4 cm or less.", "Wikipedia: Near-field communication"), (34.0, "Each payment carries a one-time security code.", "EMVCo")], 8.0),
]
TLS = {n: tl(f"/tmp/claude-0/tl/{n}.js") for n, *_ in CH}
NICE = ['Barcodes', 'Search', 'Face ID', 'Your feed', 'Wi-Fi', 'Tap to pay']
THUMB = {n: Image.open(ROOT / f"jobs/{n}/thumb_{n}.jpg").convert("RGB").resize((150, 267)) for n, *_ in CH}

# ---------------- timeline ----------------
segs = []; t = 0.0
def add(kind, d, **k): global t; segs.append(dict(kind=kind, t0=t, d=d, **k)); t += d
add("intro", dur(HERE / "mix_lt_intro.wav"))
for i, (n, *_r) in enumerate(CH):
    add("bridge", dur(HERE / f"mix_lt_b{i+1}.wav"), i=i)
    p = TLS[n]["p"]; cut = min(p[-2]["end"] + .35, p[-1]["start"] - .05); add("chapter", cut, i=i)
add("outro", dur(HERE / "mix_lt_outro.wav"))
TOTAL = t; print("total", round(TOTAL, 2))

# ---------------- panels (PIL) ----------------
def F(path, size, wt=None):
    f = ImageFont.truetype(path, size)
    if wt:
        try: f.set_variation_by_axes([wt])
        except Exception: pass
    return f
rng = np.random.default_rng(3)
noise = (rng.normal(0, 6, (H, W, 1))).astype(np.float32)
bg = np.ones((H, W, 3), np.float32) * np.array(PAPER, np.float32) + noise
yy, xx = np.mgrid[0:H, 0:W]; vg = 1 - .10 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2); bg *= vg[..., None]
BG = Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8))
sh = Image.new("L", (W, H), 0); ImageDraw.Draw(sh).rectangle((CX - 6, 18, CX + CW + 6, H - 18), fill=150); sh = sh.filter(ImageFilter.GaussianBlur(18))
BG.paste(Image.new("RGB", (W, H), (60, 50, 40)), (0, 0), sh)
def wrap(d, text, font, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        tst = (cur + " " + w).strip()
        if d.textlength(tst, font=font) > maxw and cur: lines.append(cur); cur = w
        else: cur = tst
    return lines + [cur]
def card(d, x, y, w, text, src=None, size=28, alpha=1.0, bar=GOLD):
    f = F(INTER, size, 600); fs = F(INTER, 17, 500); L = wrap(d, text, f, w - 56); h = 28 + len(L) * int(size * 1.3) + (36 if src else 8)
    d.rounded_rectangle((x, y, x + w, y + h), radius=14, fill=(255, 253, 248, int(255 * alpha)), outline=(220, 210, 190, int(255 * alpha)), width=2)
    d.rectangle((x, y + 14, x + 6, y + h - 14), fill=bar + (int(255 * alpha),))
    for k, l in enumerate(L): d.text((x + 28, y + 20 + k * int(size * 1.3)), l, font=f, fill=INK + (int(255 * alpha),))
    if src: d.text((x + 28, y + h - 30), "Source: " + src, font=fs, fill=GREY + (int(255 * alpha),))
    return h
def panel(state):
    im = BG.copy().convert("RGBA"); ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.text((60, 46), "HOW IT REALLY WORKS", font=F(INTER, 22, 800), fill=INK); d.rectangle((60, 80, 150, 86), fill=GOLD)
    d.text((W - 60, 46), "6 EVERYDAY TECH SECRETS", font=F(INTER, 22, 800), fill=GREY, anchor="ra")
    k = state["kind"]
    if k == "intro":
        d.text((60, 170), "6 EVERYDAY", font=F(ANTON, 92), fill=INK); d.text((60, 285), "TECH SECRETS", font=F(ANTON, 92), fill=INK)
        d.rectangle((60, 410, 300, 418), fill=GOLD); d.text((60, 440), "you use every day", font=F(INTER, 34, 500), fill=GREY)
        card(d, 60, 560, 540, "You use all six of these today. Do you know how any of them work?", size=32)
    elif k in ("bridge", "chapter"):
        n, title, sub, idea = CH[state["i"]][:4]
        if k == "bridge": d.text((60, 140), "UP NEXT", font=F(INTER, 22, 800), fill=GREY)
        d.rounded_rectangle((60, 180, 330, 240), radius=30, fill=GOLD); d.text((195, 210), f"CHAPTER {state['i']+1:02d}", font=F(ANTON, 34), fill=INK, anchor="mm")
        d.text((60, 270), title, font=F(ANTON, 96), fill=INK); d.text((62, 400), sub, font=F(INTER, 30, 500), fill=GREY)
        d.text((60, 520), "THE KEY IDEA", font=F(INTER, 20, 800), fill=GREY); hh = card(d, 60, 556, 540, idea, size=32)
        ty = 556 + hh + 36; d.text((60, ty), "ALSO A 60-SECOND SHORT", font=F(INTER, 20, 800), fill=GREY); state['_thumb'] = (n, 60, ty + 34)
    elif k == "outro":
        d.text((60, 170), "RECAP", font=F(ANTON, 110), fill=INK); d.rectangle((60, 320, 260, 328), fill=GOLD)
        hl = state.get("hl", -1)
        for j, c in enumerate(CH):
            y = 380 + j * 92; on = j == hl
            if on: d.rounded_rectangle((52, y - 8, 610, y + 72), radius=14, fill=(255, 253, 248), outline=GOLD, width=3)
            d.text((70, y), f"{j+1:02d}", font=F(ANTON, 40), fill=GOLD if on else GREY); d.text((140, y + 4), c[1], font=F(ANTON, 34), fill=INK if on else GREY)
        if state.get("q"): card(d, 60, 935, 540, "Which one surprised you most?", size=30)
    # right panel: facts + progress
    rx = 1320
    if k == "chapter":
        d.text((rx, 140), "THE FACTS", font=F(INTER, 22, 800), fill=GREY); d.rectangle((rx, 172, rx + 90, 178), fill=GOLD)
        y = 200
        for j, a in state["facts"]:
            _, fact, src = CH[state["i"]][4][j]; y += card(d, rx, y, 540, fact, src, size=25, alpha=a) + 12
    elif k in ("intro", "bridge"):
        d.text((rx, 140), "IN THIS VIDEO" if k == "intro" else "SO FAR", font=F(INTER, 22, 800), fill=GREY); d.rectangle((rx, 172, rx + 90, 178), fill=GOLD)
    cur = state.get("i", -1) if k != "outro" else 6
    py = 700 if k == "chapter" else 210; d.text((rx, py - 40), "6 CHAPTERS", font=F(INTER, 20, 800), fill=GREY) if k == "chapter" else None
    for j, c in enumerate(CH):
        y = py + j * 62; done = j < cur or k == "outro"; on = j == cur and k != "outro"
        if on: d.rounded_rectangle((rx - 10, y - 8, rx + 550, y + 46), radius=23, fill=GOLD)
        d.text((rx + 8, y), f"{j+1:02d}", font=F(ANTON, 32), fill=INK if on else GREY)
        d.text((rx + 70, y + 4), NICE[j], font=F(INTER, 28, 700 if on else 500), fill=INK if (on or done) else GREY)
        if done: d.text((rx + 520, y + 2), "✓", font=F(INTER, 30, 700), fill=(60, 140, 80), anchor="ra")
    im.alpha_composite(ov); im = im.convert("RGB")
    if state.get('_thumb'):
        n, x, y = state['_thumb']; im.paste(THUMB[n], (x, y)); ImageDraw.Draw(im).rectangle((x - 1, y - 1, x + 150, y + 267), outline=(200, 190, 170), width=2)
    return im

# states: (time, state dict); fade-ins as 4 alpha steps over .3 s
states = []
for s in segs:
    k = s["kind"]
    if k == "intro": states.append((s["t0"], dict(kind="intro")))
    elif k == "bridge": states.append((s["t0"], dict(kind="bridge", i=s["i"])))
    elif k == "chapter":
        facts = CH[s["i"]][4]; shown = []
        states.append((s["t0"], dict(kind="chapter", i=s["i"], facts=[])))
        for j, (ft, *_r) in enumerate(facts):
            if ft >= s["d"]: continue
            for st, a in enumerate((.25, .5, .75, 1.0)):
                states.append((s["t0"] + ft + st * .075, dict(kind="chapter", i=s["i"], facts=[(q, 1.0) for q in shown] + [(j, a)])))
            shown.append(j)
    elif k == "outro":
        op = tl(HERE / "tl_lt_outro.js")["p"]
        states.append((s["t0"], dict(kind="outro", hl=-1)))
        for j in range(6): states.append((s["t0"] + op[j + 1]["start"] - .1, dict(kind="outro", hl=j)))
        states.append((s["t0"] + op[7]["start"] - .1, dict(kind="outro", hl=-1, q=True)))
states.sort(key=lambda x: x[0])
lst = TMP / "panels.txt"; lines = []
for k, (t0, st) in enumerate(states):
    p = TMP / f"p{k:03d}.png"; panel(st).save(p); t1 = states[k + 1][0] if k + 1 < len(states) else TOTAL
    lines += [f"file '{p.name}'", f"duration {max(1 / FPS, t1 - t0):.4f}"]
lines.append(f"file '{p.name}'"); lst.write_text("\n".join(lines) + "\n")
print("panels", len(states))

# ---------------- centre video pieces + audio ----------------
SCALE = f"scale={CW}:{H}:flags=lanczos,setsar=1,fps={FPS},format=yuv420p"
def vclip(src, ss, d, out, speed=1.0):
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{d / speed:.3f}" if speed == 1 else f"{d * speed:.3f}", "-i", str(src), "-an", "-vf", f"setpts=PTS/{speed},{SCALE}", "-t", f"{d:.3f}", "-c:v", "libx264", "-preset", "fast", "-crf", "14", str(out)])
def still_clip(img, d, out):   # slow push-in so the frame never sits still
    n = int(round(d * FPS)); run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", str(img), "-vf", f"scale={CW*2}:{H*2},zoompan=z='1+0.10*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={CW}x{H}:fps={FPS},format=yuv420p", "-frames:v", str(n), "-c:v", "libx264", "-preset", "fast", "-crf", "14", str(out)])
def aseg(src, out, ss=0, d=None, fade=0):
    a = ["ffmpeg", "-v", "error", "-y"] + (["-ss", f"{ss:.3f}"] if ss else []) + ["-i", str(src)] + (["-t", f"{d:.3f}"] if d else [])
    af = "aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-15:TP=-2:LRA=11" + (f",afade=t=out:st={d - fade:.3f}:d={fade}" if fade else "")
    run(a + ["-af", af, "-ar", "48000", "-c:a", "pcm_s16le", str(out)])
grid = TMP / "grid.png"; G = Image.new("RGB", (CW, H), PAPER)
for j, (n, *_r) in enumerate(CH):
    th = Image.open(ROOT / f"jobs/{n}/thumb_{n}.jpg").convert("RGB").resize((304, 540)).crop((0, 90, 304, 450)); G.paste(th, ((j % 2) * 304, (j // 2) * 360))
G.save(grid)
vparts, aparts = [], []
for k, s in enumerate(segs):
    v = TMP / f"v{k:02d}.mp4"; a = TMP / f"a{k:02d}.wav"
    if s["kind"] == "intro":
        L = s["d"] / 6; subs = []
        for j, (n, *_r) in enumerate(CH): sp = TMP / f"v{k:02d}_{j}.mp4"; vclip(ROOT / f"jobs/{n}/{n}.mp4", 0.2, L, sp); subs.append(sp)
        (TMP / "c.txt").write_text("".join(f"file '{p.name}'\n" for p in subs)); run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(TMP / "c.txt"), "-c", "copy", str(v)])
        aseg(HERE / "mix_lt_intro.wav", a)
    elif s["kind"] == "bridge":
        n = CH[s["i"]][0]; src = ROOT / f"jobs/{n}/{n}.mp4"; vclip(src, dur(src) * .3, s["d"], v, speed=.5); aseg(HERE / f"mix_lt_b{s['i']+1}.wav", a)
    elif s["kind"] == "chapter":
        n = CH[s["i"]][0]; src = ROOT / f"jobs/{n}/{n}.mp4"; vclip(src, 0, s["d"], v); aseg(src, a, d=s["d"], fade=.3)
    elif s["kind"] == "outro":
        op = tl(HERE / "tl_lt_outro.js")["p"]; subs = []
        marks = [0.0] + [op[j + 1]["start"] - .1 for j in range(6)] + [op[7]["start"] - .1, s["d"]]
        for j in range(len(marks) - 1):
            sp = TMP / f"v{k:02d}_{j}.mp4"; d = marks[j + 1] - marks[j]
            if 1 <= j <= 6: n = CH[j - 1][0]; vclip(ROOT / f"jobs/{n}/{n}.mp4", CH[j - 1][5], d, sp)
            else: still_clip(grid, d, sp)
            subs.append(sp)
        (TMP / "c.txt").write_text("".join(f"file '{p.name}'\n" for p in subs)); run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(TMP / "c.txt"), "-c", "copy", str(v)])
        aseg(HERE / "mix_lt_outro.wav", a)
    vparts.append(v); aparts.append(a)
(TMP / "v.txt").write_text("".join(f"file '{p.name}'\n" for p in vparts)); (TMP / "a.txt").write_text("".join(f"file '{p.name}'\n" for p in aparts))
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(TMP / "v.txt"), "-c", "copy", str(TMP / "centre.mp4")])
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(TMP / "a.txt"), "-c", "copy", str(TMP / "audio.wav")])

# ---------------- compose: panels + centre + audio; ~8 Mbps H.264, AAC 192k; loudness -14 LUFS with a true-peak limiter ----------------
out = OUT / "long_tech.mp4"
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-i", str(TMP / "centre.mp4"), "-i", str(TMP / "audio.wav"),
     "-filter_complex", f"[0:v]fps={FPS},format=yuv420p[p];[p][1:v]overlay={CX}:0:shortest=1,format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.79:level=false:latency=true[a]",
     "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-b:v", "8M", "-maxrate", "10M", "-bufsize", "16M", "-r", str(FPS),
     "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{TOTAL:.3f}", str(out)])
# chapters.txt
def ts(x): x = int(x); return f"{x // 60}:{x % 60:02d}"
ch = ["0:00 Intro"] + [f"{ts(s['t0'])} {NICE[s['i']]}" for s in segs if s["kind"] == "bridge"] + [f"{ts(segs[-1]['t0'])} Recap"]
(OUT / "chapters.txt").write_text("\n".join(ch) + "\n"); print("\n".join(ch)); print(out, out.stat().st_size, dur(out))
json.dump([{k: v for k, v in s.items()} for s in segs], open(OUT / "segments.json", "w"), indent=1)
