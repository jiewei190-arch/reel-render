"""tables.py <short dir>: print the narration list and the shot table (markdown) from the current voice + shots.json."""
import json, sys, os
D = sys.argv[1]; P = os.path.join(D, "project")
vl = json.load(open(os.path.join(P, "input", "voiceover.lines.json"))); sh = json.load(open(os.path.join(P, "story", "shots.json")))
print("## Narration (exact VO, times from the current voice)")
for l in vl["lines"]: print(f"{l['n']}. {l['text']}  *({l['start']:.2f}–{l['end']:.2f})*")
print("\n## Shots (times from the current voice; source of truth = story/shots.plan.json anchors)")
print("| # | t (s) | VO | in |\n|---|---|---|---|")
for s in sh["shots"]: print(f"| {s['id']} | {s['start']:.2f}–{s['end']:.2f} | {s.get('line','')} | {s.get('in',{}).get('type','cut')} |")
print(f"\nRuntime {sh['duration']:.2f} s, {len(sh['shots'])} shots, shot lengths {min(s['end']-s['start'] for s in sh['shots']):.2f}–{max(s['end']-s['start'] for s in sh['shots']):.2f} s.")
