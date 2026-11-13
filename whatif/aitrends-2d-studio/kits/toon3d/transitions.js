// kits/toon3d/transitions.js — extra shot transitions for Toon 3D projects (ported from the BEANMEN look).
// Enable once per project (e.g. in scenes/kit.js):   import { useToonTransitions } from '/kits/toon3d/transitions.js'; useToonTransitions();
// Then in story/shots.json on the INCOMING shot:
//   "in": { "type": "iris" }                       iris: the old shot closes to a dot on black, the new one opens from it ("meanwhile…")
//   "in": { "type": "iris", "mode": "open" }        only the opening half, straight over the old shot (BEANMEN style)
//   "in": { "type": "iris", "at": [0.5, 0.42] }     centre of the circle (fractions of the frame)
//   "in": { "type": "whipBlur", "dir": 1 }          fast whip pan with a motion smear + blur (dir 1 = new shot comes from the right, -1 = left)
//   "in": { "type": "flash" } / "whip" / "fade" / "cut"   are engine built-ins and keep working as before.
// Durations: "dur" in seconds (defaults: iris 0.6, whipBlur 0.3). Nothing changes for projects that don't use these types.
import { E, clamp, ease } from '/engine/core.js';

const INK = '#20161a';
let _tmp = null;
const tmp = (w, h) => { if (!_tmp) _tmp = document.createElement('canvas'); if (_tmp.width !== w || _tmp.height !== h) { _tmp.width = w; _tmp.height = h; } return _tmp; };

// iris(g, prev, next, k, p, tr, W, H)  p = linear 0..1 progress
function iris(g, prev, next, k, p, tr, W, H) {
  const [fx, fy] = tr.at || [0.5, 0.45]; const cx = fx * W, cy = fy * H; const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.02;
  const ring = (r) => { g.save(); g.lineWidth = Math.max(3, W * 0.008); g.strokeStyle = INK; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); g.restore(); };
  if (tr.mode === 'open') {   // BEANMEN: the new shot opens in a growing circle over the old one
    const r = ease.out(p) * R; g.drawImage(prev, 0, 0);
    g.save(); g.beginPath(); g.arc(cx, cy, Math.max(0.1, r), 0, Math.PI * 2); g.clip(); g.drawImage(next, 0, 0); g.restore(); if (p < 1) ring(r); return;
  }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const close = p < 0.5; const q = close ? 1 - ease.inOut(p * 2) : ease.inOut((p - 0.5) * 2); const r = Math.max(0.1, q * R);
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip(); g.drawImage(close ? prev : next, 0, 0); g.restore(); ring(r);
}
iris.dur = 0.6;

// whipBlur: both shots slide past with a smeared, blurred streak (the old one leaves, the new one lands and settles)
function whipBlur(g, prev, next, k, p, tr, W, H) {
  const dir = tr.dir || 1; const q = ease.inOut(p); const speed = Math.sin(Math.PI * p);   // 0 at the ends, 1 mid-whip
  const c = tmp(W, H), x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
  x.drawImage(prev, -dir * q * W, 0); x.drawImage(next, dir * (1 - q) * W, 0);
  const blur = speed * W * 0.025; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.filter = blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : 'none';
  const n = 5, smear = speed * W * 0.06;   // directional smear: a few offset copies
  for (let i = 0; i < n; i++) { g.globalAlpha = i === 0 ? 1 : 0.35; g.drawImage(c, dir * (i / (n - 1) - 0.5) * smear, 0); }
  g.filter = 'none'; g.globalAlpha = 1;
}
whipBlur.dur = 0.3;

export const TRANSITIONS = { iris, whipBlur };
export function useToonTransitions(extra = {}) { E.transitions = { ...(E.transitions || {}), ...TRANSITIONS, ...extra }; return E.transitions; }
