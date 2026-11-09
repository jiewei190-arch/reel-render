// kits/sticks/sticks.js — "Sticks After Dark" stick-figure horror kit (9:16, 1080x1920 logical, 24 fps).
// Import from a project scene file:   import * as K from '/kits/sticks/sticks.js';
// Everything is drawn in logical units (1080 x 1920). No Math.random / Date.now: all noise is seeded by frame,
// so renders are deterministic and parallel-safe.
import { E, registerShot, clamp, lerp, prog, ease, key, rng, noise, alpha, mix, text, measure, radGrad, linGrad, mixVal } from '/engine/core.js';

// ======================================================================= palette / accent
export const INK = {
  bg: '#07080d',        // deep blue-black
  bg2: '#0d1018',       // slightly lifted (walls in light)
  charcoal: '#14161c',
  chalk: '#e9e4d4',     // off-white chalk / ink line
  dim: '#7d7a70',       // far / unlit lines
  head: '#f1ede1',      // stick-figure head fill
  feature: '#0a0b0f',   // eyes / mouth on the head
  shadow: '#000000',
};
export const ACCENTS = { yellow: '#d9cf6a', red: '#ff3b3b', blue: '#8fb2ff', green: '#a6d98c', orange: '#ff9a3c' };
export const K = { accent: ACCENTS.yellow, now: 0, frame: 0, boilFps: 10, light: 1 };
// one accent colour per story: K.setAccent('yellow' | 'red' | 'blue' | '#hex')
export function setAccent(c) { K.accent = ACCENTS[c] || c; }

// ======================================================================= time helpers
// boil index: changes ~10x per second so lines "boil" like hand-drawn animation on 2s/3s
export const boil = (fps = K.boilFps) => Math.floor(K.now * fps + 1e-6);
// time a little late (the "frame-late" reflection / follower): sample your animation at lag(t, 0.4)
export const lag = (t, delay) => t - delay;
// true on exactly `frames` frames starting at global time `at` (for 1-frame jitters / flashes)
export function onFrames(at, frames = 1) { const f0 = Math.round(at * E.fps); return K.frame >= f0 && K.frame < f0 + frames; }
// slow light flicker 0..1: gentle wobble + occasional sharp dips. dies: global time when the light dies (stays 0 after)
export function flicker(o = {}) {
  const { seed = 1, depth = 0.18, dips = 0.6, rate = 1, dies = null, t = K.now } = o;
  if (dies != null && t >= dies) return 0;
  let v = 1 - depth * (0.5 + 0.5 * noise(t * 2.3 * rate, seed));
  const r = rng(seed * 977 + Math.floor(t * 8 * rate))();               // 8 chances per second
  if (r < 0.06 * dips) v *= 0.25 + 0.5 * rng(seed + Math.floor(t * 24))();
  if (dies != null && t > dies - 0.35) {                                  // stutter before it dies
    const k = prog(t, dies - 0.35, dies), f = Math.floor(t * 24);
    v *= (f % 3 === 0 || rng(seed + f)() < k) ? 0.05 : 1;
  }
  return clamp(v);
}
// handheld drift for a camera: [dx, dy]
export const drift = (amt = 6, speed = 0.35, seed = 4) => [noise(K.now * speed, seed) * amt, noise(K.now * speed, seed + 7) * amt];

// ======================================================================= chalk lines
// pts: [[x,y],...]. Lines are subdivided and each point wobbles per boil frame (hand-drawn boil).
export function chalk(g, pts, o = {}) {
  const { w = 4, color = INK.chalk, a = 1, wob = 2.0, seed = 1, closed = false, step = 46, double = true, cap = 'round' } = o;
  if (pts.length < 2 || a <= 0) return;
  const r = rng(seed * 7919 + boil() * 131), P = [];
  const src = closed ? [...pts, pts[0]] : pts;
  for (let i = 0; i < src.length - 1; i++) {
    const [x0, y0] = src[i], [x1, y1] = src[i + 1], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(L / step));
    for (let k = 0; k < n; k++) { const u = k / n; P.push([lerp(x0, x1, u) + (r() - 0.5) * 2 * wob, lerp(y0, y1, u) + (r() - 0.5) * 2 * wob]); }
  }
  const last = src[src.length - 1]; P.push(closed ? P[0] : [last[0] + (r() - 0.5) * wob, last[1] + (r() - 0.5) * wob]);
  const path = () => { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length - 1; i++) { const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2; g.quadraticCurveTo(P[i][0], P[i][1], mx, my); } g.lineTo(P[P.length - 1][0], P[P.length - 1][1]); };
  g.save(); g.lineCap = cap; g.lineJoin = 'round'; g.strokeStyle = alpha(color, a); g.lineWidth = w; path(); g.stroke();
  if (double && w >= 2) { g.translate((r() - 0.5) * w * 0.6, (r() - 0.5) * w * 0.6); g.strokeStyle = alpha(color, a * 0.28); g.lineWidth = Math.max(1, w * 0.45); path(); g.stroke(); }
  g.restore();
}
export const line = (g, x0, y0, x1, y1, o) => chalk(g, [[x0, y0], [x1, y1]], o);
export const rect = (g, x, y, w, h, o = {}) => chalk(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { ...o, closed: true });
export function ellipse(g, cx, cy, rx, ry, o = {}) { const n = o.n || 22, a0 = o.from ?? 0, a1 = o.to ?? Math.PI * 2, full = o.to == null && o.from == null; const pts = []; for (let i = 0; i < (full ? n : n + 1); i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } chalk(g, pts, { ...o, closed: full, step: 30 }); }
export const circleLine = (g, cx, cy, r, o) => ellipse(g, cx, cy, r, r, o);
// filled shape with a wobbly edge (for heads, dark shapes, glass)
export function blob(g, cx, cy, rx, ry, fill, o = {}) { const { seed = 3, wob = 1.6, n = 20 } = o; const r = rng(seed * 31 + boil() * 17); g.fillStyle = fill; g.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, k = 1 + (r() - 0.5) * wob / Math.max(rx, 1) * 2; const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.fill(); }
export function fillPoly(g, pts, fill) { g.fillStyle = fill; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }

// ======================================================================= stick figure
// Lengths at scale 1 (a standing figure is ~420 units tall). Angles in radians, 0 = pointing straight DOWN,
// positive = swings toward +x (screen right). Elbow/knee angles are relative to the upper bone.
export const BONES = { head: 34, neck: 10, torso: 140, upperArm: 74, foreArm: 68, thigh: 90, shin: 88 };
export const POSES = {
  stand:   { lean: 0, tilt: 0, aL: [-0.16, 0.06], aR: [0.16, -0.06], lL: [-0.12, 0.02], lR: [0.12, -0.02] },
  idle:    { lean: 0.02, tilt: 0.05, aL: [-0.1, 0.1], aR: [0.12, -0.04], lL: [-0.1, 0], lR: [0.14, -0.04] },
  slump:   { lean: 0.12, tilt: 0.35, aL: [-0.04, 0.05], aR: [0.06, -0.02], lL: [-0.1, 0.05], lR: [0.1, -0.02] },
  brush:   { lean: 0.03, tilt: 0.02, aL: [-0.18, 0.08], aR: [0.55, 2.55], lL: [-0.1, 0], lR: [0.12, 0] },        // right hand at the mouth
  rubEyes: { lean: 0.1, tilt: 0.25, aL: [-0.55, -2.5], aR: [0.55, 2.5], lL: [-0.1, 0], lR: [0.12, 0] },        // both hands to the face
  lean:    { lean: 0.32, tilt: -0.12, aL: [0.15, 0.25], aR: [0.5, 0.15], lL: [-0.18, 0.05], lR: [-0.02, 0.0] }, // leaning toward +x (a sink/mirror)
  leanIn:  { lean: 0.0, tilt: 0, aL: [-0.62, 0.32], aR: [0.62, -0.32], lL: [-0.12, 0], lR: [0.12, 0] },        // facing camera, hands on a counter
  scared:  { lean: -0.08, tilt: -0.05, aL: [-0.5, -2.2], aR: [0.5, 2.2], lL: [-0.2, 0.05], lR: [0.2, -0.05] }, // hands up to chest
  freeze:  { lean: 0, tilt: 0, aL: [-0.06, 0], aR: [0.06, 0], lL: [-0.07, 0], lR: [0.07, 0] },                // arms stiff at sides
  reach:   { lean: 0.15, tilt: 0.05, aL: [-0.2, 0.1], aR: [1.45, 0.1], lL: [-0.15, 0], lR: [0.2, 0] },
  point:   { lean: 0, tilt: 0, aL: [-0.15, 0.05], aR: [1.55, 0], lL: [-0.1, 0], lR: [0.12, 0] },
  handsUp: { lean: -0.05, tilt: -0.05, aL: [-2.5, -0.3], aR: [2.5, 0.3], lL: [-0.18, 0], lR: [0.18, 0] },
  hug:     { lean: 0.08, tilt: 0.2, aL: [-0.4, -2.1], aR: [0.4, 2.1], lL: [-0.08, 0], lR: [0.08, 0] },
  phone:   { lean: 0.06, tilt: 0.3, aL: [-0.1, 0.05], aR: [0.35, 2.35], lL: [-0.1, 0], lR: [0.12, 0] },        // looking down at a phone in the right hand
  sit:     { lean: -0.05, tilt: 0.05, aL: [-0.3, -0.5], aR: [0.3, 0.5], lL: [1.45, -1.45], lR: [1.35, -1.4], seated: true },
  crouch:  { lean: 0.35, tilt: -0.1, aL: [0.4, 0.4], aR: [0.6, 0.3], lL: [1.2, -2.2], lR: [0.9, -2.0] },
  peek:    { lean: -0.35, tilt: -0.25, aL: [-0.3, 0.1], aR: [-0.1, 0.1], lL: [-0.1, 0], lR: [0.1, 0] },
};
export function walk(phase, o = {}) { const s = Math.sin(phase * Math.PI * 2), c = Math.cos(phase * Math.PI * 2), k = o.stride ?? 0.38; return { lean: 0.05, tilt: 0.02, aL: [-0.08 - s * k * 0.8, 0.15], aR: [0.08 + s * k * 0.8, -0.15], lL: [s * k, Math.max(0, -c) * 0.5], lR: [-s * k, Math.max(0, c) * 0.5], bob: Math.abs(c) * 6 }; }
export const posesMix = (a, b, k) => mixVal(typeof a === 'string' ? POSES[a] : a, typeof b === 'string' ? POSES[b] : b, clamp(k));
// pose animation over time: poseAt(t, [[0,'stand'],[1.2,'brush'],...])
export function poseAt(t, frames, fn = ease.inOut) { return key(t, frames.map(([tt, p, f]) => [tt, typeof p === 'string' ? POSES[p] : p, f]), fn); }

const dirv = a => [Math.sin(a), Math.cos(a)];
// joint positions for a pose. Origin x,y = the floor point between the feet (or the hip if pose.seated / o.anchor==='hip').
export function rig(pose, x, y, s = 1, o = {}) {
  const p = typeof pose === 'string' ? POSES[pose] : pose, B = BONES;
  const leg = (l) => { const k = [0, 0], d1 = dirv(l[0]), d2 = dirv(l[0] + l[1]); const knee = [d1[0] * B.thigh * s, d1[1] * B.thigh * s]; return [knee, [knee[0] + d2[0] * B.shin * s, knee[1] + d2[1] * B.shin * s]]; };
  const [kL, fL] = leg(p.lL), [kR, fR] = leg(p.lR);
  let hip; if (p.seated || o.anchor === 'hip') hip = [x, y]; else hip = [x, y - Math.max(fL[1], fR[1]) - (p.bob || 0) * s];
  const td = [Math.sin(p.lean), -Math.cos(p.lean)];
  const neck = [hip[0] + td[0] * B.torso * s, hip[1] + td[1] * B.torso * s];
  const sh = [hip[0] + td[0] * B.torso * 0.9 * s, hip[1] + td[1] * B.torso * 0.9 * s];
  const ha = p.lean + (p.tilt || 0), hd = [Math.sin(ha), -Math.cos(ha)];
  const head = [neck[0] + hd[0] * (B.neck + B.head) * s, neck[1] + hd[1] * (B.neck + B.head) * s];
  const arm = (a) => { const d1 = dirv(a[0] + p.lean), d2 = dirv(a[0] + a[1] + p.lean); const el = [sh[0] + d1[0] * B.upperArm * s, sh[1] + d1[1] * B.upperArm * s]; return [el, [el[0] + d2[0] * B.foreArm * s, el[1] + d2[1] * B.foreArm * s]]; };
  const [eL, hL] = arm(p.aL), [eR, hR] = arm(p.aR);
  const add = (v) => [hip[0] + v[0], hip[1] + v[1]];
  return { hip, neck, sh, head, headR: B.head * s, tilt: ha, eL, hL, eR, hR, kL: add(kL), fL: add(fL), kR: add(kR), fR: add(fR) };
}
// stickFigure(g, pose, face, {x, y, s, flip, color, headFill, w, back, a, seed})
//   pose: name in POSES or a pose object (mix them with posesMix / poseAt)
//   face: see face() below. back:true draws the back of the head (no face).
//   Returns the rig (joint positions) so props can be attached to hands (r.hR = right hand).
export function stickFigure(g, pose, faceO = {}, o = {}) {
  const { x = E.W / 2, y = 1600, s = 1, flip = 1, color = INK.chalk, headFill = INK.head, w = 7, a = 1, seed = 11, back = false, wob = 1.6 } = o;
  const R = rig(pose, 0, 0, s, { anchor: o.anchor });
  g.save(); g.translate(x, y); g.scale(flip, 1); g.globalAlpha *= a;
  const lw = w * Math.max(0.55, s), oo = { w: lw, color, wob: wob * Math.max(0.6, s), step: 36 * s, double: false };
  chalk(g, [R.hip, R.kL, R.fL], { ...oo, seed: seed + 1 }); chalk(g, [R.hip, R.kR, R.fR], { ...oo, seed: seed + 2 });
  chalk(g, [R.hip, R.neck], { ...oo, seed: seed + 3 });
  chalk(g, [R.sh, R.eL, R.hL], { ...oo, seed: seed + 4 }); chalk(g, [R.sh, R.eR, R.hR], { ...oo, seed: seed + 5 });
  // head
  blob(g, R.head[0], R.head[1], R.headR, R.headR, headFill, { seed: seed + 6, wob: 1.2 * Math.max(0.6, s) });
  if (!back) { g.save(); g.translate(R.head[0], R.head[1]); g.rotate(R.tilt * 0.6); face(g, 0, 0, R.headR, faceO, { seed }); g.restore(); }
  g.restore();
  const T = (p) => [x + p[0] * flip, y + p[1]];   // world coords of joints
  return Object.fromEntries(Object.entries(R).map(([k, v]) => [k, Array.isArray(v) ? T(v) : v]));
}

// ======================================================================= faces (on a round white head)
// face(g, cx, cy, r, f):
//   eyes: 'dot' | 'wide' | 'pin' | 'closed' | 'half' | 'glow' | 'none'     look: [-1..1, -1..1]  blink: 0..1
//   brows: null | 'worried' | 'angry' | 'flat' | 'raised'
//   mouth: 'none' | 'flat' | 'smile' | 'grin' | 'frown' | 'o' | 'wide' | 'tooWide'  or {w, c, o}
//          w = width in head-radii (head is 2 wide; > 2 runs OFF the head: drawn in chalk outside it), c = curve (+ smile, - frown), o = open
export const MOUTHS = { none: null, flat: { w: 0.55, c: 0, o: 0 }, smile: { w: 0.7, c: 0.3, o: 0 }, grin: { w: 1.0, c: 0.42, o: 0 }, frown: { w: 0.55, c: -0.22, o: 0 }, o: { w: 0.22, c: 0, o: 0.22 }, wide: { w: 1.5, c: 0.5, o: 0 }, tooWide: { w: 2.9, c: 0.62, o: 0 } };
export function face(g, cx, cy, r, f = {}, o = {}) {
  const { eyes = 'dot', look = [0, 0], blink = 0, brows = null, mouth = 'flat', color = INK.feature, eyeGap = 0.36, eyeY = -0.08 } = f;
  const seed = o.seed || 1, lw = Math.max(2.2, r * 0.085);
  const lx = look[0] * r * 0.14, ly = look[1] * r * 0.1;
  for (const sx of [-1, 1]) {
    const ex = cx + sx * r * eyeGap + lx, ey = cy + r * eyeY + ly, er = r * 0.12;
    if (eyes === 'none') continue;
    if (eyes === 'closed' || blink >= 0.92) { chalk(g, [[ex - er * 1.2, ey], [ex + er * 1.2, ey]], { w: lw, color, wob: 0.4, double: false, seed: seed + sx }); continue; }
    g.save(); g.translate(ex, ey); g.scale(1, 1 - blink * 0.9);
    if (eyes === 'dot' || eyes === 'half') { g.fillStyle = color; g.beginPath(); g.arc(0, 0, er, 0, Math.PI * 2); g.fill(); }
    if (eyes === 'pin') { g.fillStyle = color; g.beginPath(); g.arc(0, 0, er * 0.45, 0, Math.PI * 2); g.fill(); }
    if (eyes === 'wide') { g.strokeStyle = color; g.lineWidth = lw * 0.8; g.beginPath(); g.arc(0, 0, er * 1.6, 0, Math.PI * 2); g.stroke(); g.fillStyle = color; g.beginPath(); g.arc(0, 0, er * 0.45, 0, Math.PI * 2); g.fill(); }
    if (eyes === 'glow') { g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, 0, 0, 0, er * 3, [alpha(K.accent, 0.9), alpha(K.accent, 0.25), alpha(K.accent, 0)]); g.beginPath(); g.arc(0, 0, er * 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, er * 0.5, 0, Math.PI * 2); g.fill(); }
    g.restore();
    if (eyes === 'half') chalk(g, [[ex - er * 1.4, ey - er * 0.2], [ex + er * 1.4, ey - er * 0.2]], { w: lw, color, wob: 0.3, double: false });
  }
  if (brows) {
    const by = cy - r * 0.36, bw = r * 0.2;
    for (const sx of [-1, 1]) {
      const bx = cx + sx * r * eyeGap; const inner = { worried: -0.12, angry: 0.12, flat: 0, raised: -0.1 }[brows] ?? 0, lift = brows === 'raised' ? -0.08 : 0;
      chalk(g, [[bx - sx * bw, by + (lift + inner) * r], [bx + sx * bw, by + (lift - inner * 0.3) * r]], { w: lw * 0.9, color, wob: 0.4, double: false, seed: seed + 9 });
    }
  }
  drawMouth(g, cx, cy, r, typeof mouth === 'string' ? MOUTHS[mouth] : mouth, color, lw, seed);
}
function drawMouth(g, cx, cy, r, m, color, lw, seed) {
  if (!m) return; const wide = clamp((m.w - 1.2) / 0.8), my = cy + r * (0.42 - 0.3 * wide), hw = (m.w * r) / 2, c = m.c * r;
  const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16 * 2 - 1; pts.push([cx + u * hw, my + c * (0.55 + 0.15 * wide) * (1 - u * u) - c * 0.14 * u * u - c * 0.5 * Math.max(0, m.w - 1.2) * u ** 4]); }
  if (m.o > 0.01) { g.save(); g.fillStyle = color; g.beginPath(); g.ellipse(cx, my, Math.max(hw, r * 0.08), m.o * r * 0.6, 0, 0, Math.PI * 2); g.fill(); g.restore(); if (m.w < 0.4) return; }
  if (hw <= r * 0.92) { chalk(g, pts, { w: lw, color, wob: 0.5, double: false, seed: seed + 21, step: 18 }); return; }
  // the part of the mouth ON the head is dark ink; the part that runs past the head is drawn in chalk (wrong, too wide)
  g.save(); g.beginPath(); g.arc(cx, cy, r * 0.985, 0, Math.PI * 2); g.clip(); chalk(g, pts, { w: lw, color, wob: 0.5, double: false, seed: seed + 21, step: 18 }); g.restore();
  g.save(); g.beginPath(); g.rect(cx - r * 6, cy - r * 6, r * 12, r * 12); g.arc(cx, cy, r * 1.0, 0, Math.PI * 2, true); g.clip(); chalk(g, pts, { w: lw * 1.05, color: INK.chalk, wob: 0.8, double: true, seed: seed + 22, step: 18 }); g.restore();
}
// a big close-up head (+ optional neck/shoulder lines). Same face options as above.
export function stickHead(g, x, y, r, f = {}, o = {}) {
  const { neck = true, color = INK.chalk, headFill = INK.head, tilt = 0, seed = 5, a = 1, w = Math.max(6, r * 0.06) } = o;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(tilt);
  if (neck) { chalk(g, [[0, r * 0.95], [0, r * 1.6]], { w, color, seed: seed + 1 }); chalk(g, [[-r * 1.5, r * 2.1], [0, r * 1.6], [r * 1.5, r * 2.1]], { w, color, seed: seed + 2 }); }
  blob(g, 0, 0, r, r, headFill, { seed, wob: r * 0.025 }); face(g, 0, 0, r, f, { seed });
  g.restore();
}

// ======================================================================= light & darkness FX
// additive coloured light (bulb, phone, moon). k = 0..1 intensity
export function lightPool(g, x, y, r, color = K.accent, k = 1) { if (k <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, x, y, 0, r, [[0, alpha(color, 0.5 * k)], [0.25, alpha(color, 0.2 * k)], [1, alpha(color, 0)]]); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
// a cone of light (window beam, flashlight): from (x,y) toward angle, length, spread
export function beam(g, x, y, ang, len, spread, color = K.accent, k = 0.5) { g.save(); g.globalCompositeOperation = 'lighter'; const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, w = len * Math.tan(spread); g.fillStyle = linGrad(g, x, y, x + dx * len, y + dy * len, [alpha(color, 0.3 * k), alpha(color, 0)]); g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx * len + nx * w, y + dy * len + ny * w); g.lineTo(x + dx * len - nx * w, y + dy * len - ny * w); g.closePath(); g.fill(); g.restore(); }
// darkness(g, amount, lights): veils the frame in near-black except soft holes around lights [{x,y,r,k}]
let _dk = null;
export function darkness(g, amt = 0.8, lights = [], color = INK.bg) {
  if (amt <= 0) return; const W = Math.round(E.W * E.PX), H = Math.round(E.H * E.PX);
  if (!_dk || _dk.width !== W || _dk.height !== H) { _dk = document.createElement('canvas'); _dk.width = W; _dk.height = H; }
  const x = _dk.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H);
  x.fillStyle = alpha(color, clamp(amt)); x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'destination-out'; x.setTransform(g.getTransform());
  for (const L of lights) { const k = clamp(L.k ?? 1); if (k <= 0) continue; x.fillStyle = radGrad(x, L.x, L.y, 0, L.r, [[0, `rgba(0,0,0,${k})`], [L.soft ?? 0.4, `rgba(0,0,0,${k * 0.8})`], [1, 'rgba(0,0,0,0)']]); x.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(_dk, 0, 0); g.restore();
}
export function vignette(g, k = 0.75) { g.save(); g.fillStyle = radGrad(g, E.W / 2, E.H * 0.46, E.W * 0.42, E.H * 0.7, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${k})`]]); g.fillRect(0, 0, E.W, E.H); g.restore(); }
// film dust / hairs, different every frame (on top of the player's grain)
export function specks(g, k = 1) {
  const r = rng(K.frame * 7 + 3); g.save();
  for (let i = 0; i < 7; i++) { g.fillStyle = alpha(INK.chalk, (0.06 + r() * 0.12) * k); g.beginPath(); g.arc(r() * E.W, r() * E.H, 1 + r() * 2.2, 0, Math.PI * 2); g.fill(); }
  if (r() < 0.18) { const x = r() * E.W; g.strokeStyle = alpha(INK.chalk, 0.07 * k); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 30, E.H); g.stroke(); }
  if (r() < 0.12) { const x = r() * E.W, y = r() * E.H; g.strokeStyle = alpha(INK.chalk, 0.12 * k); g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y + 10, x + 6, y + 30); g.stroke(); }
  g.restore();
}
// heavier grain (procedural, per frame). The player already adds light grain; use this for extra-dark shots.
export function grain(g, k = 0.06) { const r = rng(K.frame * 13 + 1); g.save(); g.globalAlpha = k; for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? '#fff' : '#000'; g.fillRect(r() * E.W, r() * E.H, 2, 2); } g.restore(); }
// 1-frame jitter offset at given global times: [dx, dy, rot] or null
export function jitterAt(times = [], amp = 22, frames = 1) { for (const at of times) if (onFrames(at, frames)) { const r = rng(K.frame * 3 + 5); return [(r() - 0.5) * 2 * amp, (r() - 0.5) * 2 * amp, (r() - 0.5) * 0.03]; } return null; }

// ======================================================================= props (chalk line drawings)
// hanging bulb: x,y = ceiling point; len cord; swing angle (rad); on 0..1 (use flicker()). Returns bulb centre.
export function bulb(g, x, y, o = {}) {
  const { len = 300, swing = 0, on = 1, size = 1, color = K.accent, glowR = 520 } = o;
  const bx = x + Math.sin(swing) * len, by = y + Math.cos(swing) * len;
  chalk(g, [[x, y], [bx, by - 28 * size]], { w: 2.5, wob: 1.2, double: false, seed: 41 });
  rect(g, bx - 11 * size, by - 34 * size, 22 * size, 16 * size, { w: 3, seed: 42, double: false });
  g.save(); g.fillStyle = on > 0.05 ? mix(INK.bg, color, 0.35 + 0.65 * on) : INK.charcoal; g.beginPath(); g.ellipse(bx, by, 22 * size, 26 * size, 0, 0, Math.PI * 2); g.fill(); g.restore();
  circleLine(g, bx, by, 23 * size, { w: 3, seed: 43, double: false });
  if (on > 0.02) { lightPool(g, bx, by, glowR * (0.8 + 0.2 * on), color, on); lightPool(g, bx, by, 70 * size, '#ffffff', on * 0.8); }
  return [bx, by];
}
export function door(g, x, y, w, h, o = {}) {
  const { open = 0, gapFill = '#000', lit = 0, seed = 51, a = 1 } = o;  // open 0..1: the door swings in, showing a dark (or lit) gap
  if (open > 0) { const gw = w * open; g.fillStyle = lit > 0 ? mix(INK.bg, K.accent, 0.25 * lit) : gapFill; g.fillRect(x, y, gw, h); rect(g, x + gw, y, w * (1 - open) * 0.25 + 4, h, { w: 3, seed, a: a * 0.8 }); }
  rect(g, x, y, w, h, { w: 4, seed: seed + 1, a });
  if (open < 0.5) circleLine(g, x + w * 0.85, y + h * 0.52, 7, { w: 3, seed: seed + 2, a });
}
export function windowFrame(g, x, y, w, h, o = {}) {
  const { moon = false, moonColor = INK.chalk, bars = true, seed = 61, a = 1, sky = '#0b0f1c' } = o;
  g.fillStyle = sky; g.fillRect(x, y, w, h);
  if (moon) { const mx = x + w * 0.7, my = y + h * 0.3; lightPool(g, mx, my, w * 0.8, moonColor, 0.35); circleLine(g, mx, my, w * 0.12, { w: 3, seed: seed + 5, color: moonColor }); }
  rect(g, x, y, w, h, { w: 5, seed, a }); if (bars) { line(g, x + w / 2, y, x + w / 2, y + h, { w: 3, seed: seed + 1, a }); line(g, x, y + h / 2, x + w, y + h / 2, { w: 3, seed: seed + 2, a }); }
}
export function phone(g, x, y, o = {}) { const { s = 1, glow = 1, rot = 0, color = K.accent } = o; g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = mix(INK.bg, color, 0.5 * glow); g.fillRect(-18 * s, -32 * s, 36 * s, 64 * s); rect(g, -20 * s, -34 * s, 40 * s, 68 * s, { w: 3, seed: 71, double: false }); g.restore(); if (glow > 0) lightPool(g, x, y, 260 * s, color, glow); }
export function bed(g, x, y, w, o = {}) { const h = w * 0.28; chalk(g, [[x, y], [x, y - h * 1.6]], { w: 4, seed: 81 }); chalk(g, [[x, y - h * 0.5], [x + w, y - h * 0.5]], { w: 4, seed: 82 }); chalk(g, [[x + w, y], [x + w, y - h]], { w: 4, seed: 83 }); chalk(g, [[x, y - h], [x + w * 0.2, y - h * 1.1], [x + w, y - h]], { w: 3, seed: 84, a: 0.8 }); ellipse(g, x + w * 0.12, y - h * 0.95, w * 0.08, h * 0.25, { w: 3, seed: 85 }); }
export function tv(g, x, y, w, o = {}) { const { on = 0, seed = 91 } = o; const h = w * 0.62; if (on > 0) { const r = rng(K.frame + 9); g.fillStyle = mix(INK.bg, '#9aa8c8', 0.25 * on); g.fillRect(x, y, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = alpha('#ffffff', r() * 0.25 * on); g.fillRect(x + r() * w, y + r() * h, 3 + r() * 20, 2); } lightPool(g, x + w / 2, y + h / 2, w * 1.4, '#9fb4ff', on * 0.6); } rect(g, x, y, w, h, { w: 4, seed }); line(g, x + w * 0.3, y + h, x + w * 0.2, y + h + 30, { w: 3 }); line(g, x + w * 0.7, y + h, x + w * 0.8, y + h + 30, { w: 3 }); }
export function stairsUp(g, x, y, w, n = 7, o = {}) { const { rise = 70, run = 60, seed = 101 } = o; for (let i = 0; i < n; i++) { const yy = y - i * rise, xx = x + i * run * 0.4, ww = w - i * run * 0.8; chalk(g, [[xx, yy], [xx, yy - rise], [xx + ww, yy - rise]], { w: 3.5, seed: seed + i, a: 1 - i / (n + 2) }); } }

// ======================================================================= rooms (line-sets). Each returns a layout with useful anchors.
// One-point-perspective box: back wall rect [bx, by, bw, bh] inside the 1080x1920 frame. Draws wall/floor/ceiling edges.
export function roomBox(g, o = {}) {
  const { back = [170, 430, 740, 1000], wall = INK.bg2, floor = '#0a0c12', a = 1, seed = 200 } = o;
  const [bx, by, bw, bh] = back, X0 = -40, X1 = E.W + 40, Y0 = -40, Y1 = E.H + 40;
  g.fillStyle = INK.bg; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  g.fillStyle = wall; g.fillRect(bx, by, bw, bh);
  fillPoly(g, [[bx, by + bh], [bx + bw, by + bh], [X1, Y1], [X0, Y1]], floor);
  rect(g, bx, by, bw, bh, { w: 4, seed, a });
  const ext = (px, py, tx, ty) => line(g, px, py, tx, ty, { w: 3.5, seed: seed + px + py, a: a * 0.85 });
  ext(bx, by, X0, by - (by - Y0) * 1.0 - 200); ext(bx + bw, by, X1, by - 200 - (by - Y0)); ext(bx, by + bh, X0, Y1 + 100); ext(bx + bw, by + bh, X1, Y1 + 100);
  return { back, floorY: by + bh, cx: bx + bw / 2 };
}
// BATHROOM: back wall with a mirror over a sink. o.mirror (default [330,560,420,430]) = mirror rect on the back wall.
export function bathroom(g, t, o = {}) {
  const L = roomBox(g, { back: o.back || [150, 420, 780, 1060], seed: 210 }); const [bx, by, bw, bh] = L.back;
  const m = o.mirror || [330, 560, 420, 430], counterY = m[1] + m[3] + 120;
  // tiles below the counter
  for (let i = 1; i < 6; i++) line(g, bx, counterY + 30 + i * ((by + bh - counterY - 30) / 6), bx + bw, counterY + 30 + i * ((by + bh - counterY - 30) / 6), { w: 1.6, a: 0.25, seed: 230 + i, double: false });
  for (let i = 1; i < 9; i++) line(g, bx + i * bw / 9, counterY + 30, bx + i * bw / 9, by + bh, { w: 1.6, a: 0.25, seed: 240 + i, double: false });
  // counter + basin + tap
  const cx0 = m[0] - 40, cx1 = m[0] + m[2] + 40;
  chalk(g, [[cx0, counterY], [cx1, counterY]], { w: 5, seed: 250 }); chalk(g, [[cx0, counterY + 30], [cx1, counterY + 30]], { w: 3, seed: 251 });
  chalk(g, [[cx0, counterY], [cx0, counterY + 30]], { w: 3, seed: 252 }); chalk(g, [[cx1, counterY], [cx1, counterY + 30]], { w: 3, seed: 253 });
  ellipse(g, (cx0 + cx1) / 2, counterY + 4, (cx1 - cx0) * 0.28, 16, { w: 3, seed: 254, from: 0, to: Math.PI });
  const tx = (cx0 + cx1) / 2; chalk(g, [[tx, counterY - 6], [tx, counterY - 52], [tx + 34, counterY - 52], [tx + 34, counterY - 38]], { w: 4, seed: 255 });
  // drip
  if (o.drip !== false) { const p = (t * 0.7) % 1, dy = counterY - 34 + ease.in(p) * 46; if (p < 0.9) { g.fillStyle = alpha(INK.chalk, 0.8); g.beginPath(); g.ellipse(tx + 34, dy, 3.5, 5, 0, 0, Math.PI * 2); g.fill(); } }
  // cabinet under the sink, towel ring on the right wall
  rect(g, cx0 + 30, counterY + 30, cx1 - cx0 - 60, 220, { w: 3, seed: 256, a: 0.7 }); line(g, tx, counterY + 30, tx, counterY + 250, { w: 2.5, seed: 257, a: 0.6 });
  circleLine(g, bx + bw + 60, by + 470, 34, { w: 3, seed: 258, a: 0.7 }); chalk(g, [[bx + bw + 30, by + 480], [bx + bw + 36, by + 640], [bx + bw + 90, by + 650], [bx + bw + 86, by + 480]], { w: 3, seed: 259, a: 0.7 });
  // door on the left wall (perspective)
  chalk(g, [[bx - 60, by + bh + 60], [bx - 60, by + 240], [bx - 20, by + 270], [bx - 20, by + bh + 20]], { w: 3.5, seed: 260, a: 0.75 });
  return { ...L, mirror: m, counterY, tap: [tx, counterY - 52] };
}
// mirror glass: clip to [x,y,w,h] and draw the reflected world with inside(g). Cool dark glass, streaks, chalk frame.
export function mirror(g, m, inside, o = {}) {
  const [x, y, w, h] = m, { glass = '#0b0e15', tint = 0.16, frame = true, seed = 300 } = o;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = glass; g.fillRect(x, y, w, h);
  inside && inside(g);
  g.fillStyle = alpha('#0a1430', tint); g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha('#ffffff', 0.05); g.lineWidth = 18; g.beginPath(); g.moveTo(x + w * 0.15, y + h); g.lineTo(x + w * 0.55, y); g.moveTo(x + w * 0.35, y + h); g.lineTo(x + w * 0.65, y + h * 0.3); g.stroke();
  g.restore();
  if (frame) { rect(g, x - 10, y - 10, w + 20, h + 20, { w: 5, seed }); rect(g, x, y, w, h, { w: 2.5, seed: seed + 1, a: 0.6 }); }
}
// BEDROOM: bed, window with moon, a door (open 0..1) on the right.
export function bedroom(g, t, o = {}) {
  const L = roomBox(g, { back: o.back || [150, 470, 780, 980], seed: 400 }); const [bx, by, bw, bh] = L.back;
  windowFrame(g, bx + 70, by + 120, 260, 300, { moon: o.moon ?? true, seed: 410, moonColor: o.moonColor || INK.chalk });
  bed(g, bx + 40, by + bh - 10, 420); door(g, bx + bw - 250, by + bh - 560, 200, 560, { open: o.doorOpen ?? 0.15, seed: 420, lit: o.doorLit || 0 });
  rect(g, bx + 500, by + bh - 150, 90, 150, { w: 3, seed: 430, a: 0.8 }); // nightstand
  return { ...L, door: [bx + bw - 250, by + bh - 560, 200, 560], window: [bx + 70, by + 120, 260, 300], bed: [bx + 40, by + bh - 10, 420] };
}
// HALLWAY: deep one-point corridor, doors on both sides and one at the end (endOpen 0..1).
export function hallway(g, t, o = {}) {
  const back = o.back || [400, 700, 280, 520]; const L = roomBox(g, { back, seed: 500, wall: '#05060a' }); const [bx, by, bw, bh] = back;
  door(g, bx + 50, by + 60, bw - 100, bh - 60, { open: o.endOpen ?? 0, seed: 510, lit: o.endLit || 0 });
  const side = (sx, k, s) => { const xn = sx < 0 ? lerp(bx, -40, k) : lerp(bx + bw, E.W + 40, k), yt = lerp(by + 80, -100, k * 0.9), yb = lerp(by + bh, E.H + 60, k); const xf = sx < 0 ? lerp(bx, -40, k + 0.14) : lerp(bx + bw, E.W + 40, k + 0.14); const ytf = lerp(by + 80, -100, (k + 0.14) * 0.9), ybf = lerp(by + bh, E.H + 60, k + 0.14); chalk(g, [[xn, yb], [xn, yt], [xf, ytf], [xf, ybf]], { w: 3, seed: s, a: 0.75 }); };
  side(-1, 0.2, 520); side(-1, 0.55, 521); side(1, 0.3, 522); side(1, 0.62, 523);
  return { ...L, endDoor: [bx + 50, by + 60, bw - 100, bh - 60] };
}
// KITCHEN: counter, fridge, window over the sink.
export function kitchen(g, t, o = {}) {
  const L = roomBox(g, { back: o.back || [130, 450, 820, 1000], seed: 600 }); const [bx, by, bw, bh] = L.back; const cy = by + bh - 380;
  windowFrame(g, bx + 300, by + 150, 300, 260, { moon: o.moon ?? false, seed: 610 });
  chalk(g, [[bx, cy], [bx + bw - 230, cy]], { w: 5, seed: 620 }); rect(g, bx + 20, cy + 20, bw - 270, 340, { w: 3, seed: 621, a: 0.7 });
  for (let i = 1; i < 4; i++) line(g, bx + 20 + i * (bw - 270) / 4, cy + 20, bx + 20 + i * (bw - 270) / 4, cy + 360, { w: 2.5, seed: 630 + i, a: 0.6 });
  rect(g, bx + bw - 200, by + 280, 180, bh - 280, { w: 4, seed: 640 }); line(g, bx + bw - 200, by + 520, bx + bw - 20, by + 520, { w: 3, seed: 641 }); line(g, bx + bw - 180, by + 330, bx + bw - 180, by + 470, { w: 4, seed: 642 });
  return { ...L, counterY: cy, fridge: [bx + bw - 200, by + 280, 180, bh - 280], window: [bx + 300, by + 150, 300, 260] };
}
// LIVING ROOM: couch facing camera, TV on the left (on 0..1 = static glow), window.
export function livingRoom(g, t, o = {}) {
  const L = roomBox(g, { back: o.back || [140, 460, 800, 1000], seed: 700 }); const [bx, by, bw, bh] = L.back;
  windowFrame(g, bx + bw - 300, by + 140, 240, 300, { moon: o.moon ?? true, seed: 710 });
  const cy = by + bh - 60; chalk(g, [[bx + 180, cy], [bx + 180, cy - 260], [bx + 620, cy - 260], [bx + 620, cy]], { w: 4, seed: 720 }); chalk(g, [[bx + 150, cy - 100], [bx + 650, cy - 100]], { w: 4, seed: 721 }); rect(g, bx + 150, cy - 160, 50, 160, { w: 3, seed: 722 }); rect(g, bx + 600, cy - 160, 50, 160, { w: 3, seed: 723 });
  tv(g, bx + 20, by + 380, 160, { on: o.tv ?? 0 });
  return { ...L, couchY: cy - 100, couch: [bx + 150, cy - 260, 500, 260] };
}
// STAIRS: a staircase climbing into the dark (top swallowed by darkness).
export function stairs(g, t, o = {}) { const L = roomBox(g, { back: o.back || [250, 300, 580, 900], seed: 800, wall: '#05060a' }); stairsUp(g, 120, 1720, 840, 12, { rise: 95, run: 70 }); chalk(g, [[110, 1500], [560, 450]], { w: 4, seed: 810, a: 0.8 }); return L; }
// OUTSIDE: a house at night (one window lit with the accent), a bare tree, moon.
export function outside(g, t, o = {}) {
  g.fillStyle = INK.bg; g.fillRect(-40, -40, E.W + 80, E.H + 80); const gy = o.groundY || 1420;
  line(g, -40, gy, E.W + 40, gy, { w: 3, seed: 900, a: 0.7 });
  if (o.moon !== false) { lightPool(g, 820, 360, 300, o.moonColor || INK.chalk, 0.25); circleLine(g, 820, 360, 60, { w: 3, seed: 901 }); }
  const hx = 200, hw = 640, hh = 520; chalk(g, [[hx, gy], [hx, gy - hh], [hx + hw / 2, gy - hh - 260], [hx + hw, gy - hh], [hx + hw, gy]], { w: 4.5, seed: 902 });
  windowFrame(g, hx + 80, gy - hh + 90, 150, 170, { seed: 903, sky: o.litWindow ? mix(INK.bg, K.accent, 0.45) : '#05060a' }); if (o.litWindow) lightPool(g, hx + 155, gy - hh + 175, 220, K.accent, 0.5);
  windowFrame(g, hx + hw - 230, gy - hh + 90, 150, 170, { seed: 904, sky: '#05060a' }); door(g, hx + hw / 2 - 60, gy - 260, 120, 260, { seed: 905, open: o.doorOpen || 0 });
  chalk(g, [[960, gy], [940, gy - 600], [880, gy - 760]], { w: 6, seed: 906 }); chalk(g, [[945, gy - 450], [1040, gy - 620]], { w: 4, seed: 907 }); chalk(g, [[930, gy - 640], [990, gy - 820]], { w: 3, seed: 908 });
  return { groundY: gy, house: [hx, gy - hh, hw, hh], door: [hx + hw / 2 - 60, gy - 260, 120, 260] };
}

// ======================================================================= the thing (never fully shown)
// too-tall silhouette: thin black stick figure with over-long limbs, tiny head. Stand it in a lit doorway.
export function tallFigure(g, x, y, h = 900, o = {}) {
  const { lean = 0.03, tilt = 0.15, a = 1, rim = 0.35, eyes = false, armSwing = 0, color = '#020203', seed = 950 } = o;
  const s = h / 420; const pose = { lean, tilt, aL: [-0.05 - armSwing, 0.02], aR: [0.05 + armSwing, -0.02], lL: [-0.05, 0], lR: [0.05, 0] };
  const R = rig(pose, x, y, s);
  const longArm = (sh, hand) => [sh, [lerp(sh[0], hand[0], 1.45), lerp(sh[1], hand[1], 1.45)]];
  g.save(); g.globalAlpha *= a;
  const draw = (col, w, ww) => { const oo = { w, color: col, wob: 1.2, double: false, step: 50 }; chalk(g, [R.hip, R.kL, R.fL], { ...oo, seed }); chalk(g, [R.hip, R.kR, R.fR], { ...oo, seed: seed + 1 }); chalk(g, [R.hip, R.neck], { ...oo, seed: seed + 2 }); chalk(g, longArm(R.sh, R.hL), { ...oo, seed: seed + 3 }); chalk(g, longArm(R.sh, R.hR), { ...oo, seed: seed + 4 }); blob(g, R.head[0], R.head[1], R.headR * 0.7 + ww, R.headR * 0.78 + ww, col, { seed: seed + 5 }); };
  if (rim > 0) draw(alpha(INK.chalk, rim * 0.5), 10 * Math.max(1, s * 0.6) + 5, 3);
  draw(color, 10 * Math.max(1, s * 0.6), 0);
  if (eyes) { eyesInDark(g, R.head[0], R.head[1], { gap: R.headR * 0.5, size: R.headR * 0.13, ...(typeof eyes === 'object' ? eyes : {}) }); }
  g.restore(); return R;
}
// two eyes in the dark. blink 0..1, k = brightness
export function eyesInDark(g, x, y, o = {}) {
  const { gap = 26, size = 5, k = 1, blink = 0, color = K.accent } = o; if (k <= 0) return;
  for (const sx of [-1, 1]) { const ex = x + sx * gap; lightPool(g, ex, y, size * 9, color, 0.6 * k); g.save(); g.translate(ex, y); g.scale(1, 1 - 0.95 * blink); g.fillStyle = alpha(mix(color, '#ffffff', 0.6), k); g.beginPath(); g.ellipse(0, 0, size, size * 0.8, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
}
// long fingers curling around a vertical edge (door frame / mirror / bed). side: 'left' = hand comes from the left of x
export function handOnFrame(g, x, y, o = {}) {
  const { side = 'right', len = 70, curl = 1, a = 1, color = INK.chalk, fingers = 4, gap = 26, seed = 970 } = o; const sx = side === 'right' ? 1 : -1;
  for (let i = 0; i < fingers; i++) {
    const fy = y + i * gap, L = len * (i === 0 || i === fingers - 1 ? 0.8 : 1), c = clamp(curl);
    const p0 = [x + sx * 26, fy - 6], p1 = [x, fy], p2 = [x - sx * L * 0.55, fy + 6 * c], p3 = [x - sx * L * (0.55 + 0.35 * (1 - c)), fy + 6 + 22 * c];
    chalk(g, [p0, p1, p2, p3], { w: 4.5, color, a, seed: seed + i, wob: 1.1, double: false, step: 14 });
  }
}
// a head + shoulder peeking past an edge (x,y = where it shows). amount 0..1 how far it leans out.
export function peek(g, x, y, o = {}) {
  const { amount = 1, side = 'right', r = 34, eyes = 'dot', a = 1, dark = true } = o; const sx = side === 'right' ? 1 : -1, ox = x - sx * r * (1.6 - amount * 1.6);
  g.save(); g.beginPath(); side === 'right' ? g.rect(x - 4000, y - 4000, 4000, 8000) : g.rect(x, y - 4000, 4000, 8000); g.clip(); g.globalAlpha *= a;
  if (dark) { blob(g, ox, y, r * 0.9, r, '#010102', { seed: 990 }); eyesInDark(g, ox - sx * r * 0.15, y - 4, { gap: r * 0.32, size: r * 0.1 }); } else stickHead(g, ox, y, r, { eyes }, { neck: false });
  chalk(g, [[ox, y + r], [ox - sx * r * 0.2, y + r * 4]], { w: 6, color: dark ? '#010102' : INK.chalk, seed: 991 });
  g.restore();
}

// ======================================================================= captions
// 1-3 words at a time, bold white with a black outline, lower-middle. Keeps clear of the bottom 20% and the right 15%.
// Groups break after punctuation; words listed in `punch` always get a caption to themselves.
// Optional story/captions.json overrides the automatic grouping: [{ "start": 3.9, "end": 4.6, "text": "Tonight," }, ...]
export const CAPTION = { x: 470, y: 1250, size: 96, maxW: 780, max: 3, punch: [], color: '#ffffff', stroke: '#000000', hold: 0.35, uppercase: false };
let _capGroups = null, _manual = null;
try { const r = await fetch('/project/story/captions.json'); if (r.ok) _manual = await r.json(); } catch (e) {}
const nw = s => s.toLowerCase().replace(/[^\w']/g, '');
function groups(o) {
  if (_manual) return _manual.map(c => ({ start: c.start, end: c.end, text: c.text }));
  if (_capGroups) return _capGroups; const W = E.words || [], out = []; let cur = [];
  const flush = () => { if (cur.length) out.push(cur); cur = []; };
  W.forEach((w, i) => {
    const isP = o.punch.map(nw).includes(nw(w.word)); if (isP) { flush(); cur.push(w); flush(); return; }
    cur.push(w); const nx = W[i + 1];
    if (/[.?!,;:…]["”)]?$/.test(w.word) || cur.length >= o.max || (nx && nx.start - w.end > 0.45) || (nx && o.punch.map(nw).includes(nw(nx.word)))) flush();
  }); flush();
  _capGroups = out.map((ws, i) => { const nxt = out[i + 1]; const end = Math.min(nxt ? nxt[0].start - 0.02 : 1e9, ws[ws.length - 1].end + o.hold); return { start: ws[0].start - 0.04, end, text: ws.map(w => w.word).join(' ') }; });
  return _capGroups;
}
export function captions(g, globalT, opts = {}) {
  const o = { ...CAPTION, ...(E.cfg.stickCaptions || {}), ...opts }; const G = groups(o); const c = G.find(c => globalT >= c.start && globalT < c.end); if (!c) return;
  let s = c.text.replace(/[.,;:]+(?=\s|$)/g, '').replace(/[“”"]/g, ''); if (o.uppercase) s = s.toUpperCase();
  const size = Math.min(o.size, o.size * o.maxW / Math.max(1, measure(g, s, o.size, 'Fredoka', 700)));
  const pop = 1 + 0.06 * (1 - ease.out(prog(globalT, c.start, c.start + 0.12)));
  g.save(); g.translate(o.x, o.y); g.scale(pop, pop);
  text(g, s, 0, 0, { size, font: 'Fredoka', weight: 700, color: o.color, stroke: size * 0.2, strokeColor: o.stroke });
  text(g, s, 0, 0, { size, font: 'Fredoka', weight: 700, color: o.color });
  g.restore();
}
// debug overlay: platform UI zones (bottom 20%, right 15%) + caption box
export function safeZones(g) { g.save(); g.fillStyle = 'rgba(255,0,0,.18)'; g.fillRect(0, E.H * 0.8, E.W, E.H * 0.2); g.fillRect(E.W * 0.85, 0, E.W * 0.15, E.H); g.strokeStyle = 'rgba(0,255,120,.6)'; g.lineWidth = 3; g.strokeRect(CAPTION.x - CAPTION.maxW / 2, CAPTION.y - 70, CAPTION.maxW, 140); g.restore(); }

// ======================================================================= end card
export function endCard(g, t, o = {}) {
  const { str = 'Follow for more.', y = 860, size = 92 } = o;
  g.fillStyle = '#000'; g.fillRect(-40, -40, E.W + 80, E.H + 80);
  text(g, str, 470, y, { size, font: 'Fredoka', weight: 600, color: '#ffffff' });
}

// ======================================================================= shot wrapper
// stickShot('s01', (g, t, info) => {...}, { captions: true, fx: true, vignette: 0.75, jitter: [globalTimes], bg })
// Sets K.now/K.frame (for boil, flicker, specks), clears to the background, applies jitter, then vignette + dust + captions.
export function stickShot(id, draw, o = {}) {
  registerShot(id, {
    draw(g, t, info) {
      K.now = info.globalT; K.frame = Math.round(info.globalT * E.fps);
      g.fillStyle = o.bg || INK.bg; g.fillRect(-60, -60, E.W + 120, E.H + 120);
      const j = jitterAt(info.jitter || info.shot?.jitter || o.jitter || [], o.jitterAmp || 22);
      g.save(); if (j) { g.translate(E.W / 2 + j[0], E.H / 2 + j[1]); g.rotate(j[2]); g.translate(-E.W / 2, -E.H / 2); }
      draw(g, t, info); g.restore();
      if (o.fx !== false) { vignette(g, o.vignette ?? 0.78); specks(g); }
      if (o.captions !== false && info.captions !== false && info.shot?.captions !== false) captions(g, info.globalT);
      if (new URLSearchParams(location.search).has('debug')) safeZones(g);
    },
  });
}
// camera helper: zoom z around focus (fx,fy), plus offset. Call inside g.save()/g.restore().
export function camera(g, z = 1, fx = E.W / 2, fy = E.H / 2, dx = 0, dy = 0) { g.translate(fx + dx, fy + dy); g.scale(z, z); g.translate(-fx, -fy); }
export { clamp, lerp, prog, ease, key, rng, noise, alpha, mix, text };
