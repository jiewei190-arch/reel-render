# Usage savers (apply to every reel)
1. Scaffold with newreel.py; fill only the V[i] bodies. Never re-read whole style modules; read PRIMITIVES.md and ONE example reel at most.
2. QA with contact.py: one image per review. Single frames only for flagged tiles.
3. Don't regenerate things that already work (voice, mix) when only visuals change: rerun only the step that changed.
4. Keep research tight: 5-8 sources, write sources_<name>.md as you go, drop unverifiable claims instead of digging.
5. Delegate plain plumbing (file moves, tracking.csv rows, encode/cleanup) to scripts or a small model; Claude designs and checks.
6. Reuse spec/ev patterns: copy events from a similar reel and retime them (see mkspecs.py / existing ev_*.json) rather than hand-authoring 100+ events.
7. Render: 2 chunks in parallel only (rq.sh), one reel at a time; delete frames/<name> after encode.
8. Never edit a reel's real t_<name>.js with a generator once it exists (newreel.py overwrites!).
