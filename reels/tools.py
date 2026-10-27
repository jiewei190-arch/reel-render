"""helpers: python3 -I tools.py sheet <name> <cols>   |  tools.py assemble <name>  |  tools.py times <name>"""
import sys, pathlib, glob, subprocess, json
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent
cmd, name = sys.argv[1], sys.argv[2]
if cmd == "sheet":
    cols = int(sys.argv[3]); w = int(sys.argv[4]) if len(sys.argv) > 4 else 270
    fs = sorted(glob.glob(str(HERE / "stills" / name / "s_*.png")))
    h = int(w * 16 / 9); rows = (len(fs) + cols - 1) // cols
    sh = Image.new("RGB", (w * cols, h * rows))
    for i, f in enumerate(fs): sh.paste(Image.open(f).resize((w, h)), ((i % cols) * w, (i // cols) * h))
    out = HERE / "stills" / f"{name}_sheet.png"; sh.save(out); print(out, len(fs))
elif cmd == "assemble":
    out = HERE / "out" / f"{name}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "30", "-i", str(HERE / "frames" / name / "f%05d.jpg"),
                    "-i", str(HERE / f"mix_{name}.wav"), "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(out)], check=True)
    print(out, out.stat().st_size)
elif cmd == "times":
    d = json.loads((HERE / f"tl_{name}.js").read_text()[len("window.TL="):-1])
    print(d["total"], " ".join(f"{p['i']}:{p['start']}" for p in d["p"]))
