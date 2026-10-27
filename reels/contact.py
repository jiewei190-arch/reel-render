#!/usr/bin/env python3
"""Contact-sheet QA: ONE labelled image per reel instead of dozens of frames.
usage: python3 -I contact.py <name> [cols=4] [maxframes=12] [src=up|out]
Picks one frame per narration beat (middle of each phrase from tl_<name>.js, evenly thinned),
always adds the first frame (blank-start check) and the last (end-card check).
Writes contact_<name>.jpg (about 1500 visual tokens). Re-inspect single frames only for tiles that look wrong."""
import json, subprocess, sys, pathlib, tempfile
from PIL import Image, ImageDraw
H = pathlib.Path(__file__).resolve().parent
n = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4
mx = int(sys.argv[3]) if len(sys.argv) > 3 else 12; src = sys.argv[4] if len(sys.argv) > 4 else "up"
mp4 = H / src / f"{n}.mp4"
dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(mp4)]))
s = (H / f"tl_{n}.js").read_text(); tl = json.loads(s[s.index("=")+1:].rstrip().rstrip(";"))
mids = [(p["start"]+p["end"])/2 for p in tl["p"]]
keep = mx - 2
if len(mids) > keep: mids = [mids[round(i*(len(mids)-1)/(keep-1))] for i in range(keep)]
times = [0.15] + mids + [max(0, dur-0.5)]
tw, th = 270, 480; rows = -(-len(times)//cols)
sheet = Image.new("RGB", (cols*tw, rows*th), (20,20,20))
with tempfile.TemporaryDirectory() as d:
    for i, t in enumerate(times):
        f = f"{d}/{i}.png"
        subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{t:.2f}","-i",str(mp4),"-frames:v","1","-vf",f"scale={tw}:{th}",f],check=True)
        im = Image.open(f).convert("RGB"); dr = ImageDraw.Draw(im)
        dr.rectangle([0,0,52,16], fill=(0,0,0)); dr.text((3,2), f"{t:5.1f}s", fill=(255,255,0))
        sheet.paste(im, ((i%cols)*tw, (i//cols)*th))
out = H / f"contact_{n}.jpg"; sheet.save(out, quality=82); print(out, f"{len(times)} tiles, {dur:.1f}s")
