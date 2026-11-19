"""recipe_plan_for_critic.py <slug>: write src/plan.gen.ts (SHOTS only) from out/tmp/<slug>.cues.json "cuts", so
tools/critic.py checks a recipe render against the recipe's real cut times (not a hand-built plan).
src/plan.gen.ts is a scratch input to critic.py / shot_sheet.py; it isn't imported by any composition."""
import json, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
d = json.loads((root / "out" / "tmp" / f"{slug}.cues.json").read_text(encoding="utf8"))
cuts = list(d.values())[0]["cuts"]
shots = [{"id": f"S{i + 1:02d}", "t": round(t, 3)} for i, t in enumerate(cuts)]
(root / "src" / "plan.gen.ts").write_text(f"// scratch: from out/tmp/{slug}.cues.json for critic.py\nexport const SHOTS = {json.dumps(shots)} as const;\n", encoding="utf8")
print(f"{slug}: {len(shots)} cuts -> src/plan.gen.ts")
