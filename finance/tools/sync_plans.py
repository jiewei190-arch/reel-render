"""Refresh the engine part of every shorts/*/plan/plan_src.py from tools/plan_engine.py, and set COUNTER from the
'Counter (every shot):' line of plan/beats.md. The story part (SHOTS, ACCENT, TAGS, notes) is left as written.
    python finance/tools/sync_plans.py"""
import json, re
from pathlib import Path
root = Path(__file__).resolve().parent.parent
eng = (root / "tools" / "plan_engine.py").read_text(encoding="utf8")
for p in sorted(root.glob("shorts/*/plan/plan_src.py")):
    src = p.read_text(encoding="utf8").split("# ---- engine")[0].rstrip()
    beats = p.parent / "beats.md"
    if beats.exists():
        m = re.search(r"\*\*Counter \(every shot\):\*\* (.+)", beats.read_text(encoding="utf8"))
        line = "COUNTER = " + json.dumps(m.group(1).strip(), ensure_ascii=False)
        src = re.sub(r"^COUNTER = .*$", line, src, flags=re.M) if re.search(r"^COUNTER = ", src, re.M) \
            else re.sub(r"^(LOOP_NOTE = .*)$", lambda mm: mm.group(1) + "\n" + line, src, count=1, flags=re.M)
    p.write_text(src + "\n\n\n" + eng, encoding="utf8")
    print("synced", p.parent.parent.name)
