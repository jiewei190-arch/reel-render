# Carousel builder: jobs/<n>/<n>.mp4 frames + slide text -> jobs/<n>/carousel/<n>_01.jpg ... (1080x1350, 4:5)
# Usage: python3 -I carousel.py <name> [<name> ...]   (frames from MP4 env var or jobs/<n>/<n>.mp4)
# Layout rules (main session, Oct 28): text inside 60 px margins; slides 1-6 keep the bottom 200 px free of text
# (Instagram's dots and caption cover it); slide 1 = hook question over the hook visual; 2-5 = one idea + frame;
# 6 = the "wait, really?" twist; 7 = CTA. Each reel uses its own template's fonts and colours.
import io, json, os, pathlib, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
W, H, M, FREE = 1080, 1350, 60, 200
S = HERE / "styles"
CTA_TOP = "Full animated version on our page"

def frame(mp4, t):
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", str(mp4), "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True)
    return Image.open(io.BytesIO(r.stdout)).convert("RGB")

def font(path, size, wght=None):
    f = ImageFont.truetype(str(path), size)
    if wght is not None:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f

def runs(s):  # "**x**" -> accent runs
    return [(p, i % 2 == 1) for i, p in enumerate(s.split("**")) if p]

def wrap(d, text, f, maxw):
    words = []
    for p, b in runs(text):
        for w in re.split(r"(\s+)", p):
            if not w: continue
            if words and not w.isspace() and not words[-1][-1][0].isspace(): words[-1].append((w, b))  # glue "away" + ","
            else: words.append([(w, b)])
    lines, cur, cw = [], [], 0
    for grp in words:
        gw = sum(d.textlength(w, font=f) for w, _ in grp)
        if cur and not grp[0][0].isspace() and cw + gw > maxw:
            while cur and cur[-1][0].isspace(): cw -= cur.pop()[2]
            lines.append(cur); cur, cw = [], 0
        for w, b in grp:
            ww = d.textlength(w, font=f)
            if w.isspace() and not cur: continue
            cur.append((w, b, ww)); cw += ww
    if cur: lines.append(cur)
    return lines

def draw_text(d, text, f, y, col, acc, align="left", lh=1.18, maxw=W - 2 * M, shadow=None):
    lines = wrap(d, text, f, maxw); asc = f.size
    for ln in lines:
        tw = sum(w[2] for w in ln); x = M if align == "left" else (W - tw) / 2
        for w, b, ww in ln:
            if shadow: d.text((x + 3, y + 3), w, font=f, fill=shadow)
            d.text((x, y), w, font=f, fill=acc if b else col); x += ww
        y += asc * lh
    return y

def place_crop(img, fr, crop, top, bottom=H, bg=None):
    y0, ch = crop; c = fr.crop((0, y0, 1080, y0 + ch))
    avail = bottom - top; s = min(1.0, avail / ch, W / 1080); cw2, ch2 = int(1080 * s), int(ch * s)
    c = c.resize((cw2, ch2), Image.LANCZOS)
    img.paste(c, ((W - cw2) // 2, bottom - ch2))

def build(n, C):
    mp4 = pathlib.Path(os.environ.get("MP4_DIR", ROOT / "jobs" / n)) / f"{n}.mp4"
    out = ROOT / "jobs" / n / "carousel"; out.mkdir(parents=True, exist_ok=True)
    bg, col, acc = C["bg"], C["ink"], C["accent"]
    # snap every slide to the end of its phrase (minus 0.1 s) so labels and write-ons have finished drawing
    tlp = pathlib.Path(os.environ.get("TL_DIR", HERE)) / (f"tl_{n}.js" if "TL_DIR" not in os.environ else "tl.js")
    PH = json.loads(re.sub(r"^window.TL=|;\s*$", "", tlp.read_text().strip()))["p"] if tlp.exists() else []
    def snap(t):
        for p in PH:
            if p["start"] - .4 <= t <= p["end"] + .4: return round(p["end"] - .1 - sum(0 for _ in []), 2)
        return t
    fh, fb = C["head"], C["body"]
    for k, sl in enumerate(C["slides"], 1):
        fr = frame(mp4, snap(sl["t"]) if not sl.get("exact") else sl["t"]); print(n, k, sl["t"], "->", snap(sl["t"]) if not sl.get("exact") else sl["t"]); img = Image.new("RGB", (W, H), bg); d = ImageDraw.Draw(img)
        if sl.get("kind") == "cover":
            y = draw_text(d, sl["text"], font(fh[0], sl.get("size", 96), fh[1]), M + 6, col, acc, lh=1.1)
            place_crop(img, fr, sl["crop"], int(y) + 30, H - FREE)
        elif sl.get("kind") == "cta":
            y = draw_text(d, CTA_TOP, font(fb[0], 50, fb[1]), M + 20, col, acc, align="center")
            place_crop(img, fr, sl["crop"], int(y) + 30, H - 330)
            y = H - 300
            y = draw_text(d, "Follow for more of", font(fh[0], 74, fh[1]), y, col, acc, align="center", lh=1.1)
            y = draw_text(d, "**how it really works.**", font(fh[0], 74, fh[1]), y, col, acc, align="center", lh=1.1)
            draw_text(d, "@howitreallyworkstudio", font(fb[0], 38, fb[1]), y + 14, C.get("muted", col), acc, align="center")
        else:
            y = M + 6
            if sl.get("kicker"): y = draw_text(d, sl["kicker"], font(fb[0], C.get("ksize", 32), fb[1]), y, C.get("muted", col), acc) + 8
            y = draw_text(d, sl["title"], font(fh[0], sl.get("size", 70), fh[1]), y, col, acc, lh=1.1) + 10
            y = draw_text(d, sl["body"], font(fb[0], C.get("bsize", 46), fb[1]), y, col, acc, lh=1.25)
            place_crop(img, fr, sl["crop"], int(y) + 24, H - FREE)
        img.save(out / f"{n}_{k:02d}.jpg", quality=92)
    (out / "carousel_caption.md").write_text(C["caption"].strip() + "\n")
    print(n, len(C["slides"]), "slides ->", out)

# ---------------------------------------------------------------- per-reel configs (text sourced from each reel's script + sources_<n>.md)
D, B, F, A, L = S / "distilbook/fonts", S / "blueprint", S / "fieldbook/fonts", S / "aidoom/fonts", S / "lantern/fonts"
CFG = {
 "magnet": dict(bg="#f7f7f5", ink="#16181d", accent="#3b5bdb", muted="#6b6f78", head=(D / "Inter.ttf", 800), body=(D / "Inter.ttf", 500),
  slides=[
   dict(kind="cover", t=3.8, crop=(560, 640), text="Cut a magnet in half and you get **two magnets.** Why?"),
   dict(t=14.4, crop=(860, 420), kicker="1 · THE SECRET", title="Not one big magnet.", body="A magnet is built from **billions of tiny ones.**"),
   dict(t=17.9, crop=(300, 1000), kicker="2 · THE TINIEST", title="Every electron is a magnet.", body="Each one acts like a teeny magnet, with its own **north and south.**"),
   dict(t=35.6, crop=(300, 1000), kicker="3 · IN IRON", title="Electrons line up in **domains.**", body="Zones about **0.1 mm to a few mm** across. In a plain nail they point every which way."),
   dict(t=49.7, crop=(300, 1000), kicker="4 · WHY IT STICKS", title="The domains **swing into line.**", body="Bring a magnet close and the nail becomes **a magnet too.**"),
   dict(t=67.4, crop=(300, 1000), kicker="WAIT, REALLY?", title="Your fridge magnet is **stripes.**", body="Alternating poles push the grip to **one side.** Flip it over and it barely sticks."),
   dict(kind="cta", t=3.8, crop=(300, 1000)),
  ],
  caption="""Cut a magnet in half and you get two magnets, every single time.
- A magnet is built from billions of tiny magnets: electrons.
- In iron, they line up in domains about 0.1 mm to a few mm across.
- A fridge magnet's alternating stripes push the grip to one side.

Sources: National MagLab "Magnetic Domains"; HyperPhysics (Georgia State) "Ferromagnetism"; Univ. of Illinois Physics Van; K&J Magnetics "Halbach Arrays"; CERN MoEDAL.

#magnets #physics #science #howitworks #learnontiktok"""),
 "catseyes": dict(bsize=56, ksize=36, bg="#1d2350", ink="#f3ead6", accent="#ff8a6b", muted="#b9b4cf", head=(L / "Caveat.ttf", 700), body=(L / "Caveat.ttf", 500),
  slides=[
   dict(kind="cover", t=3.3, crop=(230, 1230), size=104, text="Why do cats' eyes **glow** in photos, but yours turn **red?**"),
   dict(t=12.2, crop=(250, 1000), kicker="1 · NO LIGHT OF THEIR OWN", title="Cats' eyes don't make light.", body="To see, light has to hit the **light-sensing cells** at the back of the eye."),
   dict(t=21.1, crop=(250, 1000), kicker="2 · A HIDDEN LAYER", title="The **tapetum lucidum.**", body="A layer behind the retina that works like a **mirror.**"),
   dict(t=24.1, crop=(250, 1000), kicker="3 · SECOND CHANCE", title="Light **bounces back.**", body="Light that slipped past gets a **second chance** to be seen. Great in dim light."),
   dict(t=41.9, crop=(250, 1000), kicker="4 · THE PHOTO", title="Flash in, **straight back** out.", body="On a phone the flash sits right beside the lens, so the mirror sends it into the camera."),
   dict(t=47.8, crop=(250, 1000), kicker="WAIT, REALLY?", title="People **don't have** this mirror.", body="So the flash lights up the **blood-rich layer** at the back of your eye, and the photo shows red."),
   dict(kind="cta", t=56.7, crop=(250, 1000)),
  ],
  caption="""Why cats' eyes glow in flash photos but yours turn red.
- Cats have a mirror layer behind the retina: the tapetum lucidum.
- It bounces light back for a second chance, which helps in dim light.
- People don't have it, so the flash shows the blood-rich layer instead: red eye.

Sources: Wikipedia ("Tapetum lucidum"); Colorado State University (Dr. Cynthia Powell, veterinary ophthalmologist); Mental Floss ("Why do we get red eye in photos?").

#cats #science #halloween #howitworks #learnontiktok"""),
 "spidersilk": dict(bsize=56, ksize=36, bg="#1c3a78", ink="#eef4ff", accent="#ffd36b", muted="#a9bde6", head=(B / "Caveat.ttf", 700), body=(B / "Caveat.ttf", 500),
  slides=[
   dict(kind="cover", t=3.3, crop=(250, 1000), size=104, text="Is spider silk really **stronger than steel?**"),
   dict(t=15.1, crop=(180, 1000), kicker="1 · THE MYTH", title="Not stronger. **Lighter.**", body="Thread for thread, good silk is about as strong as **mid-range steel**, but about **six times lighter.**"),
   dict(t=24.0, crop=(180, 1000), kicker="2 · HOW IT'S MADE", title="It starts as a **liquid.**", body="A protein stored in glands, pulled out through tiny **spigots**, where it hardens into a fiber."),
   dict(t=38.9, crop=(180, 1000), kicker="3 · TOUGH", title="It stretches and **soaks up energy.**", body="Pound for pound, some spider silks are even **tougher than Kevlar.**"),
   dict(t=50.8, crop=(180, 1000), kicker="4 · THE WEB", title="The spokes take the hit.", body="Much of the energy turns into **heat**, so the bug doesn't bounce back out."),
   dict(t=53.7, crop=(180, 1000), kicker="WAIT, REALLY?", title="The sticky spiral is **10× stretchier.**", body="Up to ten times stretchier than the spokes, so it holds the bug in place."),
   dict(kind="cta", t=59.7, crop=(180, 1000)),
  ],
  caption="""Spider silk isn't stronger than steel. It's lighter, tougher, and built to catch.
- Thread for thread, about as strong as mid-range steel, but about 6x lighter.
- Some spider silks are tougher than Kevlar, pound for pound.
- In a web, the spokes take the hit and the sticky spiral holds the bug.

Sources: University of Cambridge / The Conversation, "Spider silk is a wonder of nature, but it's not stronger than steel"; Encyclopaedia Britannica, "Is spider silk stronger than steel?"; Sensenig et al., J. R. Soc. Interface (2012); Babb et al., Nature Genetics (2017).

#spiders #science #halloween #howitworks #learnontiktok"""),
 "flush": dict(bg="#f2ebdc", ink="#2f3038", accent="#c9452f", muted="#5d5d62", head=(F / "Kalam-Regular.ttf", None), body=(F / "Nunito.ttf", 600),
  slides=[
   dict(kind="cover", t=1.2, crop=(820, 640), size=112, text="Your toilet doesn't push. It **sucks.**"),
   dict(t=14.0, crop=(300, 1000), kicker="NO. 01 — THE TRAPWAY", title="A hidden pipe.", body="In most North American toilets a curved pipe climbs **up, over a hump**, then drops to the drain."),
   dict(t=27.6, crop=(300, 1000), kicker="NO. 02 — THE SEAL", title="Still water = a **seal.**", body="Water stops right at the hump and keeps **sewer gas** out of your bathroom."),
   dict(t=41.3, crop=(300, 1000), kicker="NO. 03 — THE FLUSH", title="Too fast to spill over.", body="Tank water rushes in and fills the **whole pipe**, top to bottom."),
   dict(t=48.1, crop=(300, 1000), kicker="NO. 04 — THE SIPHON", title="A full pipe **pulls.**", body="Water falling down the far side pulls the bowl with it, until air sneaks in: **the gurgle.**"),
   dict(t=10.4, crop=(820, 640), kicker="WAIT, REALLY?", title="A bucket can flush it.", body="Plumbers say a **bucket of water**, poured in fast, flushes a siphonic toilet with **no handle at all.**"),
   dict(kind="cta", t=48.1, crop=(300, 1000)),
  ],
  caption="""Your toilet doesn't push the water down. It sucks it.
- A hidden S-shaped trapway holds a water seal against sewer gas.
- A fast flush fills the whole pipe and turns it into a siphon.
- That gurgle at the end is air breaking the siphon.

Sources: Wikipedia "Flush toilet" and "Low-flush toilet"; US EPA WaterSense (Energy Policy Act 1992, 1.6 gpf); Explain That Stuff "How toilets work"; plumbing guides on bucket flushing (Benjamin Franklin Plumbing, HomeServe); Architizer "How to Specify: Toilets".

#toilet #plumbing #science #howitworks #learnontiktok"""),
 "faces": dict(bg="#3a2a22", ink="#fff3d6", accent="#ffd24d", muted="#d9c8a8", head=(A / "Sniglet-ExtraBold.ttf", None), body=(A / "Sniglet.ttf", None),
  slides=[
   dict(kind="cover", t=3.2, crop=(150, 1300), size=92, text="Why do you see **faces** in outlets and pumpkins?"),
   dict(t=9.1, crop=(160, 1300), kicker="1 · IT HAS A NAME", title="**Pareidolia.**", body="Faces in clouds, in outlets, in pumpkins. Your brain sees them everywhere."),
   dict(t=14.9, crop=(160, 1300), kicker="2 · ALWAYS ON", title="A **face detector** that never switches off.", body="Your eyes can start moving toward a face in about a **tenth of a second.**"),
   dict(t=26.7, crop=(160, 1300), kicker="3 · BRAIN SCAN, 2020", title="Handled like **real faces.**", body="Face-like objects lit up the brain's **face areas**, then got sorted back into objects within about a quarter of a second."),
   dict(t=56.2, crop=(160, 1300), kicker="4 · WHY MISTAKES?", title="Tuned to **never miss.**", body="Missing a real face could cost you. Seeing one in a pumpkin costs **a laugh.**"),
   dict(t=44.4, crop=(160, 1300), kicker="WAIT, REALLY?", title="Even babies in the **womb.**", body="In one study, babies in the third trimester turned toward three dots of light arranged like a **face.**"),
   dict(kind="cta", t=62.1, crop=(160, 1300)),
  ],
  caption="""Two dots and a line, and your brain yells: face!
- It's called pareidolia, and your face detector never switches off.
- Face-like objects are first handled by the brain's face areas.
- It's tuned to never miss a real face, even at the cost of false alarms.

Sources: Wardle et al., Nature Communications (2020); Crouzet, Kirchner & Thorpe, Journal of Vision (2010); Taubert et al., Current Biology (2017); Reid et al., Current Biology (2017); University of Sydney (Alais et al., 2021).

#pareidolia #brain #halloween #psychology #learnontiktok"""),
 "harvestmoon": dict(bsize=52, ksize=34, bg="#efe8d8", ink="#2c2a28", accent="#c2412d", muted="#6e6a64", head=(L / "CormorantGaramond-Italic.ttf", 700), body=(L / "CormorantGaramond-Italic.ttf", 600),
  slides=[
   dict(kind="cover", t=3.2, crop=(430, 1020), size=96, text="Why does the October moon look **huge and orange?**"),
   dict(t=17.9, crop=(130, 1300), kicker="I · THE COLOR", title="Through much more air.", body="Near the horizon, moonlight crosses **much more air** to reach you."),
   dict(t=20.9, crop=(130, 1300), kicker="II · SCATTERED", title="The air scatters the **blue** away.", body="Mostly **orange and red** get through, the same trick that makes sunsets red."),
   dict(t=35.7, crop=(130, 1300), kicker="III · THE SIZE", title="It's the **same width.**", body="Photos agree: the moon is just as wide near the horizon as overhead."),
   dict(t=47.5, crop=(130, 1300), kicker="IV · AN ILLUSION", title="Made by **your brain.**", body="One idea: hills and trees make it seem **farther away**, so your brain sees it bigger."),
   dict(t=50.5, crop=(130, 1300), kicker="WAIT, REALLY?", title="Astronauts see it too.", body="In orbit, with **no hills at all.** Scientists still can't fully explain it."),
   dict(kind="cta", t=3.2, crop=(130, 1300)),
  ],
  caption="""The October moon isn't really bigger, and it isn't really orange.
- Low moonlight crosses much more air, which scatters the blue away.
- Photos show it's the same width near the horizon as overhead.
- The size is a brain illusion that scientists still can't fully explain.

Sources: NASA Science ("The Moon Illusion"); NASA Astronomy Picture of the Day; StarDate (McDonald Observatory); Old Farmer's Almanac.

#moon #huntersmoon #halloween #astronomy #learnontiktok"""),
}

if __name__ == "__main__":
    for n in sys.argv[1:]: build(n, CFG[n])
