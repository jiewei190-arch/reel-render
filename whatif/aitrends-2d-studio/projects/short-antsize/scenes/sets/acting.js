// sets/acting.js — reusable ACTING + CAMERA helpers (deterministic: only t / seed, never Math.random).
//   blinkFlag(t, period, seed)      -> bool   pass as `blink:` to actor()/drawFigure (period 2.5-4 s, vary per character via seed)
//   blinkAmt(t, period, seed)       -> 0..1   smooth blink for creatures / giantFace
//   exprAt(t, [[0,'neutral'],[1.2,'shocked']])            -> expression name that is active at t (for drawFigure `expr`)
//   poseAt(t, [[0,'stand'],[0.8,'shock'],[2,'delight']], blend)   -> pose; accepts every POSES name + the EXTRA poses below
//   idle(pose, t, seed)             -> breathing + weight shift on any pose (use on EVERY standing figure)
//   talkGesture(t, seed, {energy})  -> pose cycling talk/explain/shrug gestures with a head nod (for quoted lines only)
//   reaction(kind, t, t0)           -> pose for 'shock'|'delight'|'wince'|'lookUp'|'sheepish' starting at t0 (with overshoot)
//   walkAlong(x, s, {facing, kid})  -> walk pose whose foot phase is locked to world x (no foot sliding at ANY speed)
//   pointAndLook(t, t0, [dx,dy], o) -> { pose, look, head } : eyes lead (t0), arm follows (t0+0.25), then holds
//   lookToward(dx, dy)              -> unit look vector for drawFigure's `look`
//   camMove(t, dur, { z:[a,b], x:[a,b], y:[a,b], r:[a,b], drift })   -> cam object with ease.inOut and a faint deterministic handheld drift
//   atmos(g, t, cam, { color, near, far })  -> dust at TWO parallax depths (far slow, near fast + soft)
import { E, clamp, lerp, ease, key, prog } from '/engine/core.js';
import { POSES, posesAt, blendPose, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';

// ---------- blinking ----------
export const blinkFlag = (t, period = 3.2, seed = 0) => ((t + seed * 0.83) % period) > period - 0.13;
export function blinkAmt(t, period = 3.2, seed = 0) { const p = ((t + seed * 0.83) % period) - (period - 0.18); return p < 0 ? 0 : Math.sin(clamp(p / 0.18) * Math.PI); }

// ---------- extra poses (same 11 points as rig2d POSES) ----------
export const EXTRA = {
  shock:    { head: [-9, -206], sh: [-6, -174], hip: [0, -100], eF: [26, -150], hF: [42, -188], eB: [12, -150], hB: [26, -190], kF: [10, -50], fF: [16, 0], kB: [-8, -50], fB: [-22, 0] },
  delight:  { head: [4, -214], sh: [1, -177], hip: [0, -100], eF: [26, -176], hF: [38, -214], eB: [-14, -172], hB: [-20, -208], kF: [8, -50], fF: [10, 0], kB: [-8, -50], fB: [-16, 0] },
  wince:    { head: [14, -196], sh: [8, -166], hip: [0, -100], eF: [20, -150], hF: [22, -186], eB: [8, -146], hB: [14, -182], kF: [8, -50], fF: [6, 0], kB: [-4, -50], fB: [-12, 0] },
  lookUp:   { head: [-2, -212], sh: [-2, -175], hip: [0, -100], eF: [10, -137], hF: [14, -102], eB: [-8, -136], hB: [-10, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  sheepish: { head: [8, -200], sh: [3, -170], hip: [0, -100], eF: [14, -140], hF: [8, -166], eB: [2, -138], hB: [-2, -108], kF: [6, -50], fF: [2, 0], kB: [-4, -50], fB: [-10, 0] },
  handsUp:  { head: [2, -208], sh: [0, -174], hip: [0, -100], eF: [30, -160], hF: [48, -190], eB: [-26, -160], hB: [-44, -190], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  phoneLow: { head: [6, -204], sh: [1, -172], hip: [0, -100], eF: [22, -132], hF: [38, -142], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  reachHigh:{ head: [6, -210], sh: [2, -174], hip: [0, -100], eF: [20, -204], hF: [30, -252], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] },
};
const ALL = { ...POSES, ...EXTRA };
const named = (p) => (typeof p === 'string' ? (ALL[p] || POSES.stand) : p);

export const exprAt = (t, keys) => { let cur = keys[0][1]; for (const [ti, e] of keys) if (t >= ti) cur = e; return cur; };
export function poseAt(t, keys, blend = 0.3) { return posesAt(t, keys.map(([ti, p]) => [ti, named(p)]), blend); }
export const idle = (pose, t, seed = 0) => {
  const q = breathe(pose, t, 1, seed), w = Math.sin(t * 0.55 + seed * 3) * 1.6;      // slow weight shift
  q.head = [q.head[0] + w * 0.4, q.head[1]]; return q;
};

// ---------- talking ----------
const GEST = ['talk', 'explain', 'talk', 'relaxed', 'explain', 'shrug', 'talk', 'point'];
export function talkGesture(t, seed = 0, o = {}) {
  const per = 0.9 / (o.energy ?? 1), u = t / per + seed * 1.7, i = Math.floor(u), f = u - i;
  const a = named(GEST[((i % GEST.length) + GEST.length) % GEST.length]), b = named(GEST[(((i + 1) % GEST.length) + GEST.length) % GEST.length]);
  const p = blendPose(a, b, clamp((f - 0.62) / 0.38)), nod = Math.sin(t * 7 + seed) * 1.4;
  const q = idle(p, t, seed); q.head = [q.head[0], q.head[1] + nod]; return q;
}

// ---------- reactions (anticipation -> overshoot -> settle) ----------
export function reaction(kind, t, t0 = 0, base = 'stand') {
  const u = t - t0, B = named(base), T = named(kind);
  if (u < 0) return B;
  const kk = u < 0.1 ? ease.out(u / 0.1) * 1.18 : lerp(1.18, 1, ease.out((u - 0.1) / 0.3));   // snap with a little overshoot
  const out = {}; for (const k in B) out[k] = [lerp(B[k][0], T[k][0], kk), lerp(B[k][1], T[k][1], kk)];
  return out;
}

// ---------- walking ----------
// phase locked to distance covered: one full cycle (two steps) = 104 * s units of travel, so feet never slide.
export function walkAlong(x, s = 1, o = {}) {
  const eff = s * (o.kid ? 0.72 : 1), f = o.facing ?? 1, phase = (x * f) / (104 * eff) * Math.PI * 2;
  return { pose: walkPose2(phase, o), phase };
}
import { walkPose } from '/engine/rig2d.js';
const walkPose2 = (phase, o) => walkPose(phase, o);

// ---------- looking / pointing ----------
export function lookToward(dx, dy) { const d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; }
export function pointAndLook(t, t0, dir, o = {}) {
  const look = lookToward(dir[0], dir[1]), eyes = ease.out(prog(t, t0, t0 + 0.18)), arm = ease.out(prog(t, t0 + 0.25, t0 + 0.55));
  const base = named(o.base || 'stand'), tgt = named(dir[1] < -0.5 ? 'pointUp' : 'point');
  const pose = blendPose(base, tgt, arm);
  return { pose, look: [look[0] * eyes, look[1] * eyes], head: pose.head };
}

// ---------- camera ----------
export function camMove(t, dur, o = {}) {
  const k = ease.inOut(t / dur), d = o.drift ?? 1, rng2 = (a) => a ? lerp(a[0], a[1], k) : null;
  const c = { z: rng2(o.z) ?? 1, x: rng2(o.x) ?? 0, y: rng2(o.y) ?? 0, r: rng2(o.r) ?? 0 };
  c.x += Math.sin(t * 0.63) * 7 * d; c.y += Math.cos(t * 0.51) * 5 * d; c.r += Math.sin(t * 0.37) * 0.0018 * d; return c;
}
export function atmos(g, t, cam, o = {}) {
  const color = o.color || '#c9d4ff', far = o.far ?? 30, near = o.near ?? 10;
  FX.dust(g, t * 0.6, { count: far, color, a: 0.2, seed: 3 });
  FX.dust(g, t * 1.6 + 4, { count: near, color, a: 0.32, seed: 9 });
}
