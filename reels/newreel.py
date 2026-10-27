#!/usr/bin/env python3
"""Scaffold t_<name>.js from specs/<name>.json so Claude only fills the per-phrase scene bodies.
usage: python3 -I newreel.py <name>      (needs specs/<name>.json and tl_<name>.js from voice2.py)
Creates a neon-engine template: imports lib/lib2d.js primitives, has one V[i](lt,u,t) stub per phrase with the
spoken line as a comment, the scene() orchestrator (cross-fade, caption) and window.seek wiring.
For another style, change the two import lines (createNeon -> that style's factory)."""
import json, sys, pathlib
H = pathlib.Path(__file__).resolve().parent; n = sys.argv[1]
spec = json.load(open(H / "specs" / f"{n}.json"))
stubs = "\n".join(
    f"// {i}: {text}\nV[{i}] = (lt, u, t) => {{\n  // TODO scene for phrase {i}. Use P.text/P.arrow/P.node/P.bar/P.counter/P.timeline/P.rings; lt=seconds into phrase, u=0..1 across phrase.\n}};\n"
    for i, (cap, text) in enumerate(spec["phrases"]))
out = f"""// t_{n}.js: scaffold from newreel.py. Fill in V[i] bodies; do NOT rewrite the helpers (see lib/lib2d.js, PRIMITIVES.md).
import {{ createNeon, W, H, COL }} from './styles/neon/neon.js';
import {{ prims, phases, seg, ss, eo, lerp, clamp, hash }} from './lib/lib2d.js';
await document.fonts.load('700 60px Poppins');
const R = createNeon(document.getElementById('c')), S = R.S, P = prims(S);
const TL = window.TL, {{ PH, info }} = phases(TL), CX = 540;
const {{ cyan: CY, pink: PK, orange: OR, violet: VI, white: WH }} = COL;
const V = [];
{stubs}
function caption(t, i) {{ /* captions come from PH[i].cap; copy caption() from t_bats.js if this style needs a drawn caption box */ }}
function scene(t) {{
  const {{ i, lt, u, fi, fo }} = info(t);
  S.save(); S.globalAlpha = fi * fo; V[i](lt, u, t); S.restore(); caption(t, i); return i;
}}
window.DUR = TL.total;
window.seek = t => {{ R.begin(); scene(t); R.finish(t, {{ fade: 1 }}); }};
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
"""
dest = H / f"t_{n}.js"
if dest.exists() and "--force" not in sys.argv: sys.exit(f"{dest.name} exists; refusing to overwrite (use --force)")
dest.write_text(out); print("wrote", f"t_{n}.js", len(spec["phrases"]), "scene stubs")
