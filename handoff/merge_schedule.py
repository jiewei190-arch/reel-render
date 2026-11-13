# Main session helper: resolve a git merge conflict in handoff/schedule_batchN.csv.
# The main session owns dates, times, episodes and rows; the PC session owns the status column.
# Usage (during a conflicted merge): python3 -I handoff/merge_schedule.py && git add handoff/schedule_batchN.csv
import csv, io, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parent.parent; F = "handoff/schedule_batchN.csv"
show = lambda stage: list(csv.reader(io.StringIO(subprocess.run(["git", "show", f":{stage}:{F}"], cwd=ROOT, capture_output=True, text=True, check=True).stdout)))
ours, theirs = show(2), show(3)
st = {(r[0], r[3]): r[6] for r in theirs[1:] if len(r) >= 7}
out = [ours[0]] + [r[:6] + [st[(r[0], r[3])]] if st.get((r[0], r[3]), "approved, to schedule") != "approved, to schedule" else r for r in ours[1:]]
keys = {(r[0], r[3]) for r in ours[1:]}
out += [r for r in theirs[1:] if len(r) >= 7 and (r[0], r[3]) not in keys]
csv.writer(open(ROOT / F, "w", newline="")).writerows(out)
print(f"{len(out) - 1} rows; {sum(1 for r in out[1:] if r[6] != 'approved, to schedule')} with a PC-session status")
