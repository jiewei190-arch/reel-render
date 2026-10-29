# Main session helper: merge one finished Batch N reel from a worker branch.
# Usage: python3 -I handoff/merge_reel.py <reel> <branch> <ep> <date> <tiktok_time> <youtube_time> "<title>" "<template>"
# Copies jobs/<reel> and reels/*<reel>* from the branch, appends the STYLE_FIT row, adds episodes.csv,
# schedule_batchN.csv and topics status, prints basic checks and writes work/merge/<reel>_sheet.jpg for a look.
import csv, pathlib, subprocess, sys
reel, branch, ep, date, ttt, ytt, title, tmpl = sys.argv[1:9]
ROOT = pathlib.Path(__file__).resolve().parent.parent
run = lambda *a, **k: subprocess.run(a, cwd=ROOT, capture_output=True, text=True, **k)
files = [f for f in run("git", "diff", "--name-only", "HEAD", branch, "--", "reels").stdout.split() if reel in f]
run("git", "checkout", branch, "--", f"jobs/{reel}", *files)
row = [l for l in run("git", "show", f"{branch}:STYLE_FIT.md").stdout.splitlines() if l.lower().startswith(f"| {reel}")]
sf = (ROOT / "STYLE_FIT.md").read_text()
if row and row[0] not in sf: (ROOT / "STYLE_FIT.md").write_text(sf.rstrip("\n") + "\n" + row[0] + "\n")
def add(path, new, key):
    rows = list(csv.reader(open(ROOT / path)))
    if not any(key(r) for r in rows[1:]): rows += new
    csv.writer(open(ROOT / path, "w", newline="")).writerows(rows)
add("handoff/episodes.csv", [[ep, reel, date, ttt]], lambda r: r[1] == reel)
v = f"jobs/{reel}/{reel}_ep.mp4"
add("handoff/schedule_batchN.csv", [["tiktok", date, ttt, reel, ep, v, "approved, to schedule"], ["youtube", date, ytt, reel, ep, v, "approved, to schedule"]], lambda r: r[3] == reel)
mp4 = ROOT / f"jobs/{reel}/{reel}.mp4"
info = run("ffprobe", "-v", "error", "-show_entries", "stream=width,height:format=duration", "-of", "csv=p=0", str(mp4)).stdout.split()
print(reel, "EP", ep, "|", " ".join(info), "| _ep exists:", (ROOT / v).exists(), "| qa:", (ROOT / f"jobs/{reel}/qa_{reel}.txt").exists())
qa = ROOT / f"jobs/{reel}/qa_{reel}.txt"
if qa.exists(): print("\n".join(l for l in qa.read_text().splitlines() if "FAIL" in l or l.startswith("QA")))
out = ROOT / "work/merge"; out.mkdir(parents=True, exist_ok=True)
src = ROOT / v if (ROOT / v).exists() else mp4
run("ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", "fps=1/5,scale=150:-1,tile=8x2", "-frames:v", "1", str(out / f"{reel}_sheet.jpg"))
print("sheet:", out / f"{reel}_sheet.jpg", "| title:", title, "| template:", tmpl)
