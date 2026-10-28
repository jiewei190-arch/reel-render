# Copy every episode's upload files into one folder, in posting order, for manual uploading.
# Usage (from the repo root, after pulling the handoff branch):
#   python handoff/export_uploads.py "<destination folder>" [first_ep] [last_ep]
# Makes <dest>/EP001_glowstick/ with: tiktok_youtube.mp4 (badged), instagram.mp4, cover.jpg, caption.txt (short, new), caption_long.txt (old), pinned_comment.txt (post it as the first comment and pin it)
import csv, pathlib, shutil, sys
root = pathlib.Path(__file__).resolve().parent.parent
dest = pathlib.Path(sys.argv[1]).expanduser()
lo = int(sys.argv[2]) if len(sys.argv) > 2 else 1
hi = int(sys.argv[3]) if len(sys.argv) > 3 else 10**6
rows = sorted(csv.DictReader(open(root / "handoff/episodes.csv")), key=lambda r: int(r["episode"]))
done, missing = 0, []
for r in rows:
    ep, n = int(r["episode"]), r["reel"]
    if not lo <= ep <= hi: continue
    src, out = root / "jobs" / n, dest / f"EP{ep:03d}_{n}"
    out.mkdir(parents=True, exist_ok=True)
    for name, to in [(f"{n}_ep.mp4", "tiktok_youtube.mp4"), (f"{n}.mp4", "instagram.mp4"), (f"thumb_{n}.jpg", "cover.jpg"), (f"caption_short_{n}.txt", "caption.txt"), (f"caption_{n}.md", "caption_long.txt"), (f"pinned_{n}.md", "pinned_comment.txt")]:
        if (src / name).exists(): shutil.copy2(src / name, out / to)
        else: missing.append(f"EP{ep} {name}")
    done += 1
print(f"{done} episodes copied to {dest}")
if missing: print("missing:", ", ".join(missing))
