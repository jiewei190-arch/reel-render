// kits/toon3d/rig.js — "bean" characters for the Toon 3D style.
// Big round head on a pill body, thin stick limbs, ball hands and feet, toon shading + dark outline.
// Faces do the acting: big eyes with animated upper/lower LIDS, thick brows, pupils, a small mouth decal.
//
//   import { bean, POSE, EXPR, walk, point, shrug, idle, mixPose, mixExpr } from '/kits/toon3d/rig.js';
//   const guard = bean({ outfit: 'armour', head: 'helmet', skin: '#e2b48c', colors: { main: '#a3352b' }, seed: 3 });
//   guard.position.set(0, 0, 0); stage.add(guard);
//   // every frame:
//   guard.pose(mixPose(POSE.stand, idle(t), 1));   guard.face(EXPR.bored, t);
//
// Coordinates: the character faces +Z, its LEFT is +X. Feet on y = 0. Height ~2.55 units (head top).
import { THREE, toon, flat, canvasTex, outline, INK, blob } from './toon.js';
import { mixVal, rng, clamp, lerp, ease, noise } from '/engine/core.js';

// ---------- dimensions (units) ----------
export const DIM = {
  headR: 0.48, bodyH: 1.0, bodyR: 0.36, hipY: 0.9, thigh: 0.42, shin: 0.4, legR: 0.038,
  upper: 0.36, fore: 0.33, armR: 0.034, handR: 0.075, shoulderX: 0.31, shoulderY: 0.64, headY: 1.2,
};
const D = DIM;
const SKIN = { light: '#f3dcc8', fair: '#ecc9aa', tan: '#d2a27e', brown: '#a8714c', dark: '#6e4630', olive: '#dcb48e' };
export { SKIN };

// ---------- POSES ----------
// arm: [fwd, out, twist] radians (fwd: + swings forward, out: + away from the body). elbow: bend (forearm forward).
// leg: [fwd, out]; knee: bend (shin back). lean (+ forward), side (+ tilt to its left), twist (+ turn upper body left), bob (y), crouch.
// head: headTurn (+ looks to its left), headTilt (+ tilts to its left), headNod (+ looks down).
export const POSE_DEFAULT = { armL: [0.05, 0.16, 0], elbowL: 0.12, armR: [0.05, 0.16, 0], elbowR: 0.12, legL: [0, 0.04], kneeL: 0, legR: [0, 0.04], kneeR: 0, lean: 0, side: 0, twist: 0, bob: 0, headTurn: 0, headTilt: 0, headNod: 0, shrugY: 0 };
const P = (o) => ({ ...POSE_DEFAULT, ...o });
export const POSE = {
  stand: P({}),
  relaxed: P({ armL: [0.08, 0.1, 0], armR: [0.08, 0.1, 0], elbowL: 0.2, elbowR: 0.2, headTilt: 0.04 }),
  attention: P({ armL: [0, 0.06, 0], armR: [0, 0.06, 0], elbowL: 0.02, elbowR: 0.02, legL: [0, 0.01], legR: [0, 0.01] }),
  handsHips: P({ armL: [-0.15, 0.75, -1.4], armR: [-0.15, 0.75, -1.4], elbowL: 1.9, elbowR: 1.9, legL: [0, 0.1], legR: [0, 0.1] }),
  armsUp: P({ armL: [0.2, 2.6, 0], armR: [0.2, 2.6, 0], elbowL: 0.2, elbowR: 0.2, headNod: -0.15 }),
  panic: P({ armL: [0.5, 2.2, 0.3], armR: [0.5, 2.2, 0.3], elbowL: 0.9, elbowR: 0.9, legL: [0.1, 0.18], legR: [-0.1, 0.18], kneeL: 0.25, kneeR: 0.15, headNod: -0.1 }),
  facepalm: P({ armR: [1.25, 0.2, 0.3], elbowR: 2.35, headNod: 0.28, headTilt: -0.1 }),
  thinking: P({ armR: [0.9, 0.05, 0.2], elbowR: 2.35, armL: [0.55, 0.1, 1.2], elbowL: 1.6, headTilt: 0.12 }),
  sit: P({ legL: [1.45, 0.12], legR: [1.45, 0.12], kneeL: 1.45, kneeR: 1.45, armL: [0.55, 0.12, 0], armR: [0.55, 0.12, 0], elbowL: 0.5, elbowR: 0.5 }),
  holdFront: P({ armL: [0.85, 0.25, 0.5], armR: [0.85, 0.25, 0.5], elbowL: 1.0, elbowR: 1.0 }),  // carrying something in front
  spearRest: P({ armR: [0.35, 0.22, 0.2], elbowR: 1.1, armL: [0.05, 0.12, 0], elbowL: 0.15 }),   // holding a spear upright in the right hand
  lean: P({ lean: 0, side: -0.1, armR: [0.35, 0.22, 0.2], elbowR: 1.15, legL: [0.12, -0.08], legR: [0, 0.12], headTilt: -0.12 }),
  sleepy: P({ side: -0.12, armR: [0.35, 0.22, 0.2], elbowR: 1.15, headTilt: -0.3, headNod: 0.25, legL: [0.12, -0.08], legR: [0, 0.12] }),
};
export function mixPose(a, b, k) { return mixVal(P(a), P(b), clamp(k)); }
// addPose(base, delta): adds numbers (for layering idle/breathing on a pose)
export function addPose(a, d) { const o = { ...P(a) }; for (const k in d) { if (Array.isArray(d[k])) o[k] = o[k].map((v, i) => v + (d[k][i] || 0)); else if (typeof d[k] === 'number') o[k] = (o[k] || 0) + d[k]; } return o; }

// ---------- motion helpers (return pose deltas or full poses) ----------
// idle(t, seed): breathing + tiny sway; add it on top of any pose: addPose(POSE.stand, idle(t))
export function idle(t, seed = 1, amp = 1) {
  const n = (f, s) => noise(t * f, seed * 7 + s) * amp;
  return { bob: Math.sin(t * 2.1 + seed) * 0.008 * amp, headTilt: n(0.35, 1) * 0.05, headTurn: n(0.25, 2) * 0.06, headNod: n(0.3, 3) * 0.03, armL: [n(0.4, 4) * 0.04, 0, 0], armR: [n(0.4, 5) * 0.04, 0, 0], side: n(0.2, 6) * 0.015 };
}
// walk(t, { speed: cycles/s, amp }) -> full pose. Move the root yourself (stride ~ 1.05 units per cycle at amp 1).
export function walk(t, o = {}) {
  const { speed = 1.6, amp = 1, base = POSE.stand } = o; const ph = t * speed * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph);
  return P({ ...base, legL: [s * 0.45 * amp, 0.04], legR: [-s * 0.45 * amp, 0.04], kneeL: Math.max(0, -c) * 0.7 * amp + 0.05, kneeR: Math.max(0, c) * 0.7 * amp + 0.05,
    armL: [-s * 0.42 * amp, 0.14, 0], armR: [s * 0.42 * amp, 0.14, 0], elbowL: 0.3 + Math.max(0, -s) * 0.3, elbowR: 0.3 + Math.max(0, s) * 0.3,
    bob: Math.abs(Math.cos(ph)) * 0.05 * amp - 0.02, lean: 0.06 * amp, twist: s * 0.07 * amp, side: c * 0.02 * amp });
}
export const WALK_STRIDE = 1.05;
// run = a faster, bigger walk with arms pumping
export const run = (t, o = {}) => { const p = walk(t, { speed: 2.6, amp: 1.35, ...o }); p.lean = 0.2; p.elbowL += 0.9; p.elbowR += 0.9; return p; };
// point(side 'R'|'L', k 0..1, { up }) -> pose layer: arm straight at the target direction (forward)
export function point(base = POSE.stand, side = 'R', k = 1, o = {}) { const { up = 0.1, across = 0 } = o; return mixPose(base, { ...P(base), [`arm${side}`]: [1.45 + up, 0.2 + across, 0], [`elbow${side}`]: 0.05, headTurn: (side === 'R' ? -1 : 1) * 0.08 }, k); }
// shrug(base, k): palms up, shoulders up, head tilt
export function shrug(base = POSE.stand, k = 1) { return mixPose(base, { ...P(base), armL: [0.15, 0.55, 1.2], armR: [0.15, 0.55, 1.2], elbowL: 1.55, elbowR: 1.55, shrugY: 0.05, headTilt: 0.16 }, k); }
// nodding / shaking the head layers
export const nod = (t, amp = 0.15, f = 3) => ({ headNod: Math.sin(t * f * Math.PI * 2) * amp });
export const shake = (t, amp = 0.25, f = 3) => ({ headTurn: Math.sin(t * f * Math.PI * 2) * amp });
// tremble (scared)
export const tremble = (t, amp = 1) => ({ side: Math.sin(t * 47) * 0.012 * amp, bob: Math.sin(t * 61) * 0.006 * amp, headTurn: Math.sin(t * 39) * 0.02 * amp });

// ---------- EXPRESSIONS ----------
// lid: upper lid closed 0 (wide) .. 1 (shut). lidAngle: + = angry (inner corners down), - = sad/worried.
// lower: lower lid up 0..1 (smile squint). brow: -1 (down) .. 1 (up), browAngle: + angry, - worried. browL/browR: per-side extra offsets.
// pupil: [x, y] -1..1 (x + = its left, i.e. screen right when facing camera), pupilSize ~1. mouth: shape name, mouthW width scale, talk 0..1.
export const EXPR_DEFAULT = { lid: 0.28, lidAngle: 0, lower: 0.05, brow: 0, browAngle: 0, browL: 0, browR: 0, pupil: [0, 0], pupilSize: 1, mouth: 'line', mouthW: 1, mouthY: 0, talk: 0 };
const X = (o) => ({ ...EXPR_DEFAULT, ...o });
export const EXPR = {
  neutral: X({}),
  bored: X({ lid: 0.56, lower: 0.12, brow: -0.15, mouth: 'line', mouthW: 0.8, pupil: [0, -0.1] }),
  smug: X({ lid: 0.5, lidAngle: -0.08, lower: 0.18, brow: 0.05, browL: 0.35, browR: -0.15, browAngle: 0.1, mouth: 'smirk' }),
  shocked: X({ lid: 0.0, lower: 0, brow: 1, browAngle: -0.15, mouth: 'o', pupilSize: 0.72 }),
  panic: X({ lid: 0.0, lower: 0, brow: 0.9, browAngle: -0.55, mouth: 'scream', pupilSize: 0.6 }),
  angry: X({ lid: 0.38, lidAngle: 0.34, lower: 0.2, brow: -0.55, browAngle: 0.55, mouth: 'teeth' }),
  sad: X({ lid: 0.45, lidAngle: -0.3, brow: 0.2, browAngle: -0.6, mouth: 'frown', pupil: [0, -0.25] }),
  happy: X({ lid: 0.18, lower: 0.45, brow: 0.35, mouth: 'smile' }),
  grin: X({ lid: 0.3, lower: 0.5, brow: 0.25, mouth: 'grin' }),
  worried: X({ lid: 0.22, lidAngle: -0.15, brow: 0.45, browAngle: -0.55, mouth: 'wavy', pupil: [0.3, 0] }),
  suspicious: X({ lid: 0.6, lidAngle: 0.15, lower: 0.3, brow: -0.2, browL: 0.25, browR: -0.25, mouth: 'line', pupil: [-0.5, 0] }),
  asleep: X({ lid: 1, lower: 0.1, brow: -0.1, mouth: 'o', mouthW: 0.6 }),
  deadpan: X({ lid: 0.48, lower: 0.08, brow: 0, mouth: 'line', mouthW: 0.7 }),
};
export const mixExpr = (a, b, k) => mixVal(X(a), X(b), clamp(k));

// ---------- mouth decals ----------
const MOUTHS = ['line', 'smile', 'frown', 'smirk', 'o', 'open', 'grin', 'wavy', 'teeth', 'scream'];
let _mouthTex = null;
function mouthTextures() {
  if (_mouthTex) return _mouthTex; _mouthTex = {};
  const ink = '#2a1414', inside = '#5a1a1e', tongue = '#d0606a';
  for (const s of MOUTHS) _mouthTex[s] = canvasTex(256, 128, (g, w, h) => {
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 13; const cx = w / 2, cy = h / 2;
    const fillMouth = (path) => { g.fillStyle = inside; path(); g.fill(); g.save(); path(); g.clip(); g.fillStyle = tongue; g.beginPath(); g.ellipse(cx, cy + 34, 40, 22, 0, 0, 7); g.fill(); g.restore(); g.lineWidth = 9; path(); g.stroke(); };
    if (s === 'line') { g.beginPath(); g.moveTo(cx - 34, cy + 2); g.quadraticCurveTo(cx, cy + 5, cx + 34, cy); g.stroke(); }
    if (s === 'smile') { g.beginPath(); g.moveTo(cx - 44, cy - 10); g.quadraticCurveTo(cx, cy + 30, cx + 44, cy - 10); g.stroke(); }
    if (s === 'frown') { g.beginPath(); g.moveTo(cx - 36, cy + 16); g.quadraticCurveTo(cx, cy - 16, cx + 36, cy + 16); g.stroke(); }
    if (s === 'smirk') { g.beginPath(); g.moveTo(cx - 34, cy + 6); g.quadraticCurveTo(cx + 10, cy + 10, cx + 40, cy - 12); g.stroke(); }
    if (s === 'wavy') { g.lineWidth = 10; g.beginPath(); g.moveTo(cx - 44, cy + 4); for (let i = 1; i <= 8; i++) g.lineTo(cx - 44 + i * 11, cy + 4 + (i % 2 ? -7 : 7)); g.stroke(); }
    if (s === 'o') fillMouth(() => { g.beginPath(); g.ellipse(cx, cy + 4, 22, 28, 0, 0, 7); });
    if (s === 'open') fillMouth(() => { g.beginPath(); g.moveTo(cx - 40, cy - 12); g.quadraticCurveTo(cx, cy - 6, cx + 40, cy - 12); g.quadraticCurveTo(cx + 30, cy + 40, cx, cy + 42); g.quadraticCurveTo(cx - 30, cy + 40, cx - 40, cy - 12); g.closePath(); });
    if (s === 'scream') fillMouth(() => { g.beginPath(); g.ellipse(cx, cy + 6, 38, 50, 0, 0, 7); });
    if (s === 'grin' || s === 'teeth') {
      const path = () => { g.beginPath(); if (s === 'grin') { g.moveTo(cx - 54, cy - 14); g.quadraticCurveTo(cx, cy - 4, cx + 54, cy - 14); g.quadraticCurveTo(cx + 30, cy + 40, cx, cy + 40); g.quadraticCurveTo(cx - 30, cy + 40, cx - 54, cy - 14); } else { g.roundRect(cx - 48, cy - 18, 96, 40, 14); } g.closePath(); };
      g.fillStyle = '#fbf6ee'; path(); g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(60,30,30,.6)'; g.beginPath(); g.moveTo(cx - 50, cy + 2); g.lineTo(cx + 50, cy + 2); for (let x = -30; x <= 30; x += 20) { g.moveTo(cx + x, cy - 16); g.lineTo(cx + x, cy + 22); } g.save(); path(); g.clip(); g.stroke(); g.restore();
      g.strokeStyle = ink; g.lineWidth = 9; path(); g.stroke();
    }
  });
  return _mouthTex;
}

// ---------- outfit textures (wrapped round the pill body; front of the body = canvas centre x) ----------
function bodyTexture(outfit, c) {
  return canvasTex(512, 512, (g, W, H) => {
    const band = (y0, y1, col) => { g.fillStyle = col; g.fillRect(0, H * (1 - y1), W, H * (y1 - y0)); };   // y in body height 0 (bottom)..1 (top)
    const cx = W / 2, Y = (y) => H * (1 - y);
    if (outfit === 'tunic') {
      band(0, 1, c.main); band(0, 0.06, shadeHex(c.main, -0.18));
      band(0.4, 0.47, c.belt || '#5a3a22'); g.fillStyle = c.trim || '#e8c25a'; g.fillRect(cx - 14, Y(0.47), 28, H * 0.07);
      g.fillStyle = shadeHex(c.main, -0.25); g.beginPath(); g.moveTo(cx - 40, Y(1)); g.lineTo(cx, Y(0.84)); g.lineTo(cx + 40, Y(1)); g.fill();
      if (c.stripe) { g.fillStyle = c.stripe; g.fillRect(cx - 70, 0, 14, Y(0.47)); g.fillRect(cx + 56, 0, 14, Y(0.47)); }
    } else if (outfit === 'toga') {
      band(0, 1, c.main || '#f1ead8');
      g.strokeStyle = 'rgba(120,100,70,.28)'; g.lineWidth = 5; for (let i = -6; i < 12; i++) { g.beginPath(); g.moveTo(i * 50, 0); g.quadraticCurveTo(i * 50 + 80, H * 0.5, i * 50 + 30, H); g.stroke(); }
      // the broad sash, from its left shoulder (front) down across to the right hip
      g.save(); g.translate(cx, Y(0.55)); g.rotate(-0.62); g.fillStyle = c.sash || c.main || '#e9dfc6'; g.fillRect(-W, -46, W * 2, 92);
      g.strokeStyle = c.trim || '#7a2a5a'; g.lineWidth = 16; g.beginPath(); g.moveTo(-W, -46); g.lineTo(W, -46); g.stroke();
      g.strokeStyle = 'rgba(110,90,60,.3)'; g.lineWidth = 4; for (const o of [-20, 6, 28]) { g.beginPath(); g.moveTo(-W, o); g.lineTo(W, o); g.stroke(); } g.restore();
      band(0, 0.035, c.trim || '#7a2a5a');
    } else if (outfit === 'armour') {
      band(0, 0.42, c.main || '#a3352b'); band(0, 0.04, shadeHex(c.main || '#a3352b', -0.25));
      // pteruges (leather strips) over the skirt
      for (let x = 0; x < W; x += 34) { g.fillStyle = (x / 34) % 2 ? '#6a4228' : '#7c5030'; g.fillRect(x + 3, Y(0.42), 28, H * 0.2); g.fillStyle = c.trim || '#c9a14a'; g.fillRect(x + 8, Y(0.24) - 10, 18, 8); }
      // lorica: horizontal steel bands with brass rivets
      const steel = c.metal || '#b8b4ac';
      for (let i = 0; i < 6; i++) { const y0 = 0.44 + i * 0.09; band(y0, y0 + 0.085, i % 2 ? steel : shadeHex(steel, -0.08)); g.fillStyle = 'rgba(40,30,30,.45)'; g.fillRect(0, Y(y0 + 0.085), W, 4); }
      g.fillStyle = c.trim || '#c9a14a'; for (let i = 0; i < 6; i++) for (const dx of [-60, 60]) { g.beginPath(); g.arc(cx + dx, Y(0.48 + i * 0.09), 6, 0, 7); g.fill(); }
      g.fillStyle = shadeHex(steel, -0.12); g.fillRect(cx - 6, Y(0.98), 12, H * 0.5);
      band(0.41, 0.46, c.belt || '#4a2e1c'); g.fillStyle = c.trim || '#c9a14a'; for (let x = 10; x < W; x += 40) g.fillRect(x, Y(0.455), 22, H * 0.04);
    } else if (outfit === 'uniform') {
      band(0, 1, c.main || '#4f5e3a'); band(0, 0.38, c.legsTop || shadeHex(c.main || '#4f5e3a', -0.12));
      band(0.38, 0.44, c.belt || '#2e2a20'); g.fillStyle = c.trim || '#d8b04a'; g.fillRect(cx - 16, Y(0.44), 32, H * 0.06);
      g.fillStyle = c.trim || '#d8b04a'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(cx, Y(0.52 + i * 0.11), 9, 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 5; for (const dx of [-95, 95]) { g.strokeRect(cx + dx - 34, Y(0.86), 68, H * 0.16); g.beginPath(); g.moveTo(cx + dx - 34, Y(0.82)); g.lineTo(cx + dx + 34, Y(0.82)); g.stroke(); }
      g.fillStyle = c.trim || '#d8b04a'; for (const dx of [-95, 95]) { g.beginPath(); g.arc(cx + dx, Y(0.81), 6, 0, 7); g.fill(); }
      g.beginPath(); g.moveTo(cx, Y(1)); g.lineTo(cx, Y(0.44)); g.stroke();
    } else if (outfit === 'striped') {
      band(0, 0.4, c.legsTop || '#262a3a');
      for (let i = 0; i < 9; i++) band(0.4 + i * 0.0667, 0.4 + (i + 1) * 0.0667, i % 2 ? (c.main || '#f2efe8') : (c.stripe || '#23222a'));
    } else if (outfit === 'rags') {
      band(0, 1, c.main || '#7a6a52'); const r = rng(9); for (let i = 0; i < 5; i++) { const x = r() * W, y = H * (0.15 + r() * 0.7), w = 40 + r() * 30; g.fillStyle = shadeHex(c.main || '#7a6a52', i % 2 ? 0.12 : -0.12); g.fillRect(x, y, w, w * 0.8); g.strokeStyle = 'rgba(40,25,15,.5)'; g.lineWidth = 3; g.setLineDash([6, 6]); g.strokeRect(x + 4, y + 4, w - 8, w * 0.8 - 8); g.setLineDash([]); }
      band(0.42, 0.47, c.belt || '#3a2a1a');
    } else if (outfit === 'robe') {
      band(0, 1, c.main || '#6a3a7a'); g.fillStyle = c.trim || '#e8c25a'; g.fillRect(cx - 18, 0, 36, H); band(0, 0.04, c.trim || '#e8c25a'); band(0.96, 1, c.trim || '#e8c25a');
    } else if (outfit === 'hoodie') {
      band(0, 1, c.main || '#d9a21b'); band(0, 0.4, c.legsTop || '#2e3a52');
      band(0.4, 0.46, shadeHex(c.main || '#d9a21b', -0.18));
      g.fillStyle = shadeHex(c.main || '#d9a21b', -0.1); g.beginPath(); g.roundRect(cx - 80, Y(0.68), 160, H * 0.2, 24); g.fill();
      g.strokeStyle = shadeHex(c.main || '#d9a21b', -0.35); g.lineWidth = 5; g.stroke();
      g.strokeStyle = '#f2ead6'; g.lineWidth = 7; g.lineCap = 'round'; for (const dx of [-26, 26]) { g.beginPath(); g.moveTo(cx + dx, Y(1)); g.lineTo(cx + dx * 1.1, Y(0.8)); g.stroke(); }
    } else if (outfit === 'labcoat') {
      band(0, 1, c.main || '#f4f2ec'); band(0, 0.4, c.legsTop || '#3a3f4a'); g.fillStyle = c.main || '#f4f2ec'; g.fillRect(0, Y(0.4), W, H * 0.12);
      g.fillStyle = c.shirt || '#7aa0c8'; g.beginPath(); g.moveTo(cx - 46, Y(1)); g.lineTo(cx, Y(0.62)); g.lineTo(cx + 46, Y(1)); g.fill();
      g.strokeStyle = 'rgba(80,80,90,.45)'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 46, Y(1)); g.lineTo(cx, Y(0.62)); g.lineTo(cx + 46, Y(1)); g.moveTo(cx, Y(0.62)); g.lineTo(cx, Y(0.28)); g.stroke();
      for (const dx of [-90, 90]) g.strokeRect(cx + dx - 32, Y(0.5), 64, H * 0.1);
      if (c.lanyard) { g.strokeStyle = c.lanyard; g.lineWidth = 10; g.beginPath(); g.moveTo(cx - 60, Y(1)); g.lineTo(cx - 12, Y(0.7)); g.moveTo(cx + 60, Y(1)); g.lineTo(cx + 12, Y(0.7)); g.stroke(); g.fillStyle = '#ffffff'; g.fillRect(cx - 28, Y(0.71), 56, H * 0.1); g.fillStyle = c.lanyard; g.fillRect(cx - 28, Y(0.71), 56, H * 0.03); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 3; g.strokeRect(cx - 28, Y(0.71), 56, H * 0.1); }
    } else if (outfit === 'tee') {
      band(0, 1, c.main || '#3f8a7a'); band(0, 0.4, c.legsTop || '#c2a878'); band(0.4, 0.43, shadeHex(c.legsTop || '#c2a878', -0.3));
      g.strokeStyle = shadeHex(c.main || '#3f8a7a', -0.3); g.lineWidth = 8; g.beginPath(); g.arc(cx, Y(1.02), 46, 0, Math.PI); g.stroke();
      if (c.print) { g.fillStyle = c.print; g.beginPath(); g.arc(cx, Y(0.72), 40, 0, 7); g.fill(); g.fillStyle = c.main || '#3f8a7a'; g.beginPath(); g.arc(cx, Y(0.72), 22, 0, 7); g.fill(); }
    } else band(0, 1, c.main || '#888');
  }, { wrap: true, offset: [0.5, 0] });
}
function shadeHex(hex, k) { const c = new THREE.Color(hex); const t = k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1); c.lerp(t, Math.abs(k)); return '#' + c.getHexString(); }
export { shadeHex };

// outfit defaults: legs/feet/sleeves per outfit
const OUTFIT = {
  tunic:   { main: '#3f6fa8', legs: 'skin', feet: '#6a4428', sleeve: true },
  toga:    { main: '#f1ead8', trim: '#7a2a5a', legs: 'skin', feet: '#7a5030', sleeve: true },
  armour:  { main: '#a3352b', legs: 'skin', feet: '#5a3820', sleeve: true, pads: true },
  uniform: { main: '#4f5e3a', legs: '#3f4a2e', feet: '#1e1a18', sleeve: true },
  striped: { main: '#f2efe8', stripe: '#23222a', legs: '#262a3a', feet: '#1e1a18', sleeve: true },
  rags:    { main: '#7a6a52', legs: 'skin', feet: '#4a3020', sleeve: false },
  robe:    { main: '#6a3a7a', trim: '#e8c25a', legs: '#6a3a7a', feet: '#c9a14a', sleeve: true },
  hoodie:  { main: '#d9a21b', legs: '#2e3a52', feet: '#f2ead6', longSleeve: true },
  labcoat: { main: '#f4f2ec', legs: '#3a3f4a', feet: '#2a2220', longSleeve: true },
  tee:     { main: '#3f8a7a', legs: '#c2a878', feet: '#3a2a22', sleeve: true },
};
export const OUTFITS = Object.keys(OUTFIT);
export const HEADS = ['none', 'helmet', 'laurel', 'cap', 'cone', 'hood', 'beanie', 'ballcap', 'slouch'];
export const HAIRS = ['bald', 'bowl', 'curly', 'swoop', 'spiky', 'bun', 'horseshoe', 'long', 'bob', 'pigtails', 'messy'];

// pill-shaped body profile (slightly fuller at the hips), uv.y = height 0..1 so outfit bands line up
function bodyGeometry() {
  const pts = [], N = 40, H = D.bodyH, Rb = D.bodyR;
  for (let i = 0; i <= N; i++) { const y = i / N; const u = y * 2 - 1; const r = Rb * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.4)), 1 / 2.4) * (1 + 0.06 * (1 - y)); pts.push(new THREE.Vector2(Math.max(r, i === 0 || i === N ? 0 : 0.001), y * H)); }
  const g = new THREE.LatheGeometry(pts, 40); const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, pos.getY(i) / H);
  g.computeVertexNormals(); return g;
}
let _bodyGeo = null, _limbGeo = null, _sph = null;
const limbGeo = () => (_limbGeo ||= (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 10); g.translate(0, -0.5, 0); return g; })());   // unit limb hanging from the pivot
const sph = () => (_sph ||= new THREE.SphereGeometry(1, 28, 20));

// ---------- the factory ----------
// bean({ name, outfit, colors:{main,trim,stripe,belt,metal,sash,legsTop}, skin, hair, hairColor, head, headColor, beard, scale, seed, silhouette, outlinePx, shadowBlob })
export function bean(o = {}) {
  const seed = o.seed ?? 1, outfitName = o.outfit || 'tunic', base = OUTFIT[outfitName] || OUTFIT.tunic;
  const c = { ...base, ...(o.colors || {}) };
  const sil = !!o.silhouette, SIL = o.silhouetteColor || '#1b1216';
  const skinC = sil ? SIL : (SKIN[o.skin] || o.skin || SKIN.fair);
  const hairC = sil ? SIL : (o.hairColor || '#4a2e1e');
  const m = (col) => toon(sil ? SIL : col);
  const root = new THREE.Group(); root.name = o.name || 'bean';
  const rig = new THREE.Group(); rig.scale.setScalar(o.scale || 1); root.add(rig);

  // legs (stay planted when the upper body twists)
  const legM = c.legs === 'skin' ? m(skinC) : m(c.legs), footM = m(c.feet);
  const legs = {};
  for (const [side, s] of [['L', 1], ['R', -1]]) {
    const hip = new THREE.Group(); hip.position.set(s * 0.13, D.hipY, 0); rig.add(hip);
    const thigh = new THREE.Mesh(limbGeo(), legM); thigh.scale.set(D.legR, D.thigh, D.legR); thigh.castShadow = true; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -D.thigh; hip.add(knee);
    const kj = new THREE.Mesh(sph(), legM); kj.scale.setScalar(D.legR); kj.userData.noOutline = true; knee.add(kj);
    const shin = new THREE.Mesh(limbGeo(), legM); shin.scale.set(D.legR, D.shin, D.legR); shin.castShadow = true; knee.add(shin);
    const foot = new THREE.Mesh(sph(), footM); foot.scale.set(0.088, 0.072, 0.125); foot.position.set(0, -D.shin - 0.005, 0.035); foot.castShadow = true; knee.add(foot);
    legs[side] = { hip, knee, foot };
  }
  // upper body
  const upper = new THREE.Group(); upper.position.y = D.hipY; rig.add(upper);
  _bodyGeo ||= bodyGeometry();
  const bodyTex = sil ? null : bodyTexture(outfitName, c);
  const body = new THREE.Mesh(_bodyGeo, sil ? m(SIL) : toon('#ffffff', { map: bodyTex })); body.position.y = -0.08; body.castShadow = true; body.receiveShadow = true; upper.add(body);
  if (c.pads && !o.noPads) for (const s of [1, -1]) { const pad = new THREE.Mesh(sph(), m(c.metal || '#b8b4ac')); pad.scale.set(0.16, 0.09, 0.17); pad.position.set(s * 0.27, D.shoulderY + 0.04, 0); pad.rotation.z = s * -0.5; pad.castShadow = true; upper.add(pad); }
  if (outfitName === 'toga' && !o.noDrape) { const dr = new THREE.Mesh(sph(), m(c.sash || c.main || '#f1ead8')); dr.scale.set(0.09, 0.2, 0.17); dr.position.set(0.28, D.shoulderY - 0.02, 0.02); dr.rotation.z = -0.35; dr.castShadow = true; upper.add(dr); }
  // arms
  const arms = {};
  for (const [side, s] of [['L', 1], ['R', -1]]) {
    const sh = new THREE.Group(); sh.position.set(s * D.shoulderX, D.shoulderY, 0); sh.rotation.order = 'ZXY'; upper.add(sh);
    const up = new THREE.Mesh(limbGeo(), m(c.longSleeve ? (c.sleeveColor || c.main) : skinC)); up.scale.set(D.armR * (c.longSleeve ? 1.5 : 1), D.upper, D.armR * (c.longSleeve ? 1.5 : 1)); up.castShadow = true; sh.add(up);
    if (c.sleeve) { const sl = new THREE.Mesh(sph(), outfitName === 'striped' && !sil ? toon('#ffffff', { map: stripeTex(c) }) : m(c.sleeveColor || (outfitName === 'armour' ? c.main : c.main))); sl.scale.set(0.068, 0.15, 0.068); sl.position.y = -0.06; sl.castShadow = true; sh.add(sl); }
    const el = new THREE.Group(); el.position.y = -D.upper; sh.add(el);
    const ej = new THREE.Mesh(sph(), m(c.longSleeve ? (c.sleeveColor || c.main) : skinC)); ej.scale.setScalar(D.armR * (c.longSleeve ? 1.45 : 1)); ej.userData.noOutline = true; el.add(ej);
    const fo = new THREE.Mesh(limbGeo(), m(c.longSleeve ? (c.sleeveColor || c.main) : skinC)); fo.scale.set(D.armR * (c.longSleeve ? 1.4 : 1), D.fore * (c.longSleeve ? 0.9 : 1), D.armR * (c.longSleeve ? 1.4 : 1)); fo.castShadow = true; el.add(fo);
    const hand = new THREE.Group(); hand.position.y = -D.fore; el.add(hand);
    const hb = new THREE.Mesh(sph(), m(c.gloves || skinC)); hb.scale.setScalar(D.handR); hb.castShadow = true; hand.add(hb);
    arms[side] = { sh, el, hand };
  }
  // head
  const head = new THREE.Group(); head.position.y = D.headY; upper.add(head); if (o.headScale) head.scale.set(...o.headScale);
  const R = D.headR;
  const skull = new THREE.Mesh(sph(), m(skinC)); skull.scale.set(R * 1.02, R * 0.97, R * 0.97); skull.castShadow = true; skull.receiveShadow = true; head.add(skull);
  const surf = (x, y) => { const v = new THREE.Vector3(x, y, Math.sqrt(Math.max(0.0001, 1 - x * x - y * y))); return v.normalize(); };
  const Zv = new THREE.Vector3(0, 0, 1);
  // eyes
  const eyeWhite = sil ? flat('#f4efe6') : toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 });
  const lidM = m(o.lidColor || shadeHex(skinC, -0.06)), pupM = flat('#1a1214');
  const lidGeo = new THREE.SphereGeometry(1.1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const lowGeo = new THREE.SphereGeometry(1.08, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const rimGeo = new THREE.TorusGeometry(1.1, 0.075, 6, 24, Math.PI); rimGeo.rotateX(Math.PI / 2);  // front half of the lid rim (z > 0)
  const eyes = {};
  const ER = 0.29 * R;
  for (const [side, s] of [['L', 1], ['R', -1]]) {
    const n = surf(s * 0.36, 0.08); const eg = new THREE.Group(); eg.position.copy(n).multiplyScalar(R * 0.9); eg.quaternion.setFromUnitVectors(Zv, n);
    eg.scale.set(ER, ER * 1.16, ER * 0.62); head.add(eg);
    const ball = new THREE.Mesh(sph(), eyeWhite); ball.userData.outlinePx = 2.2; eg.add(ball);
    const pupG = new THREE.Group(); eg.add(pupG);
    const pup = new THREE.Mesh(sph(), pupM); pup.scale.set(0.3, 0.33, 0.1); pup.position.z = 0.96; pup.userData.noOutline = true; pupG.add(pup);
    const lidRoll = new THREE.Group(); eg.add(lidRoll);
    const lidPiv = new THREE.Group(); lidRoll.add(lidPiv);
    const lid = new THREE.Mesh(lidGeo, lidM); lid.userData.noOutline = true; lidPiv.add(lid);
    const rim = new THREE.Mesh(rimGeo, flat(INK)); rim.userData.noOutline = true; lidPiv.add(rim);
    const lowPiv = new THREE.Group(); lidRoll.add(lowPiv);
    const low = new THREE.Mesh(lowGeo, lidM); low.userData.noOutline = true; lowPiv.add(low);
    const lrim = new THREE.Mesh(rimGeo, flat(INK)); lrim.scale.set(0.98, 0.98, 0.6); lrim.userData.noOutline = true; lowPiv.add(lrim);
    eyes[side] = { eg, pupG, pup, lidRoll, lidPiv, lowPiv };
  }
  // brows
  const browGeo = new THREE.CapsuleGeometry(0.052, 0.16, 4, 10); browGeo.rotateZ(Math.PI / 2);
  const browM = m(o.browColor || (sil ? SIL : shadeHex(hairC, -0.25)));
  const brows = {};
  for (const [side, s] of [['L', 1], ['R', -1]]) {
    const bg = new THREE.Group(); head.add(bg); const bm = new THREE.Mesh(browGeo, browM); bm.scale.set(1, 1, 0.55); bm.castShadow = false; bg.add(bm);
    brows[side] = { bg, bm, s };
  }
  // mouth decal (a patch of a sphere just above the skin)
  const mouthR = 1.012 * R;
  const mw = 0.62, mh = 0.3, mEl = -0.36;
  const mouthGeo = new THREE.SphereGeometry(mouthR, 12, 8, Math.PI / 2 - mw / 2, mw, Math.PI / 2 - mEl - mh / 2, mh);
  const mouthMat = new THREE.MeshBasicMaterial({ map: mouthTextures().line, transparent: true, alphaTest: 0.35, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat); mouth.userData.noOutline = true; mouth.renderOrder = 2;
  const mouthG = new THREE.Group(); mouthG.add(mouth); mouthG.scale.set(1, 0.97, 0.97); head.add(mouthG);
  if (sil) mouth.visible = false;

  // hair
  const hair = o.hair ?? 'bowl'; const hM = m(hairC);
  const cap = (theta, rad = 1.06, tilt = 0.3) => { const g = new THREE.SphereGeometry(R * rad, 32, 14, 0, Math.PI * 2, 0, theta); const me = new THREE.Mesh(g, hM); me.rotation.x = -tilt; me.castShadow = true; me.scale.set(1.02, 0.97, 0.97); return me; };
  const hairG = new THREE.Group(); head.add(hairG);
  if (hair === 'bowl') hairG.add(cap(1.12, 1.06, 0.38));
  if (hair === 'swoop') { hairG.add(cap(1.05, 1.05, 0.4)); const q = new THREE.Mesh(sph(), hM); q.scale.set(R * 0.42, R * 0.22, R * 0.36); q.position.set(R * 0.2, R * 0.88, R * 0.35); q.rotation.z = -0.3; q.castShadow = true; hairG.add(q); }
  if (hair === 'curly' || hair === 'long') { const r = rng(seed * 3 + 1); hairG.add(cap(1.0, 1.03, 0.45)); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, el = 0.55 + r() * 0.5; const v = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)); if (v.z > 0.55 && v.y < 0.85) continue; const b = new THREE.Mesh(sph(), hM); b.scale.setScalar(R * (0.2 + r() * 0.06)); b.position.copy(v.multiplyScalar(R * 1.0)); b.castShadow = true; hairG.add(b); } }
  if (hair === 'long') { const b = new THREE.Mesh(sph(), hM); b.scale.set(R * 0.9, R * 0.85, R * 0.45); b.position.set(0, -R * 0.15, -R * 0.62); b.castShadow = true; hairG.add(b); }
  if (hair === 'spiky') { hairG.add(cap(0.95, 1.03, 0.4)); for (let i = 0; i < 7; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(R * 0.16, R * 0.45, 8), hM); const a = -0.9 + i * 0.3; sp.position.set(Math.sin(a) * R * 0.55, R * 0.92, Math.cos(a) * R * 0.1 - R * 0.05); sp.rotation.z = -a * 0.7; sp.castShadow = true; hairG.add(sp); } }
  if (hair === 'bun') { hairG.add(cap(1.1, 1.05, 0.4)); const b = new THREE.Mesh(sph(), hM); b.scale.setScalar(R * 0.3); b.position.set(0, R * 0.95, -R * 0.35); b.castShadow = true; hairG.add(b); }
  if (hair === 'bob') { hairG.add(cap(1.15, 1.06, 0.3)); for (const sx of [1, -1]) { const sd = new THREE.Mesh(sph(), hM); sd.scale.set(R * 0.3, R * 0.62, R * 0.62); sd.position.set(sx * R * 0.86, -R * 0.08, -R * 0.2); sd.castShadow = true; hairG.add(sd); } const bk = new THREE.Mesh(sph(), hM); bk.scale.set(R * 0.9, R * 0.65, R * 0.4); bk.position.set(0, -R * 0.1, -R * 0.7); hairG.add(bk); }
  if (hair === 'pigtails') { hairG.add(cap(1.12, 1.05, 0.38)); for (const sx of [1, -1]) { const pt = new THREE.Mesh(sph(), hM); pt.scale.set(R * 0.2, R * 0.38, R * 0.2); pt.position.set(sx * R * 1.05, R * 0.15, -R * 0.25); pt.rotation.z = sx * 0.6; pt.castShadow = true; hairG.add(pt); const tie = new THREE.Mesh(sph(), m(o.tieColor || '#d63a3a')); tie.scale.setScalar(R * 0.08); tie.position.set(sx * R * 0.9, R * 0.4, -R * 0.25); hairG.add(tie); } }
  if (hair === 'messy') { hairG.add(cap(1.1, 1.06, 0.36)); const r = rng(seed + 2); for (let i = 0; i < 4; i++) { const tf = new THREE.Mesh(new THREE.ConeGeometry(R * 0.13, R * 0.42, 8), hM); const a = -0.5 + i * 0.33; tf.position.set(Math.sin(a) * R * 0.5, R * 0.95, R * 0.28 - i * 0.04); tf.rotation.set(0.6 + r() * 0.3, 0, -a * 1.2 - 0.3); tf.castShadow = true; hairG.add(tf); } }
  if (hair === 'horseshoe') { const r = rng(seed + 5); for (let i = 0; i < 13; i++) { const a = Math.PI * (0.95 + i / 12 * 1.1); const v = new THREE.Vector3(Math.cos(a) * 0.93, 0.18 + r() * 0.08, Math.sin(a) * 0.93 * -1); if (v.z > 0.45) continue; const b = new THREE.Mesh(sph(), hM); b.scale.setScalar(R * 0.2); b.position.copy(v.multiplyScalar(R)); b.castShadow = true; hairG.add(b); } }
  // beard
  if (o.beard) { const g = new THREE.SphereGeometry(R * 1.05, 32, 12, Math.PI / 2 - 1.45, 2.9, Math.PI / 2 + 0.5, 0.95); const b = new THREE.Mesh(g, m(o.beardColor || hairC)); b.scale.set(1.02, 0.98, 1.02); b.castShadow = true; head.add(b); }
  // headgear
  const hg = o.head || 'none', hc = o.headColor;
  if (hg === 'helmet') {
    const metal = m(hc || '#b9b3a8'), brass = m(o.helmetTrim || '#c9a14a'), crest = m(o.crestColor || '#c43a2e');
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.1, 32, 14, 0, Math.PI * 2, 0, 1.05), metal); dome.rotation.x = -0.32; dome.castShadow = true; head.add(dome);
    const brow = new THREE.Mesh(new THREE.TorusGeometry(R * 0.96, R * 0.07, 8, 32), brass); brow.rotation.x = Math.PI / 2 - 0.32; brow.position.y = R * 0.52; brow.position.z = -R * 0.17; head.add(brow);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.95, R * 1.2, R * 0.3, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76), metal); neck.position.set(0, R * 0.25, -R * 0.12); neck.material.side = THREE.DoubleSide; head.add(neck);
    for (const s of [1, -1]) { const ch = new THREE.Mesh(sph(), metal); ch.scale.set(R * 0.09, R * 0.42, R * 0.3); ch.position.set(s * R * 0.98, -R * 0.05, -R * 0.02); ch.rotation.z = s * 0.12; ch.castShadow = true; head.add(ch); }
    const cr = new THREE.Mesh(sph(), crest); cr.scale.set(R * 0.13, R * 0.34, R * 0.95); cr.position.set(0, R * 1.18, -R * 0.12); cr.castShadow = true; head.add(cr);
    const knob = new THREE.Mesh(sph(), brass); knob.scale.setScalar(R * 0.1); knob.position.set(0, R * 1.03, R * 0.12); head.add(knob);
  }
  if (hg === 'laurel') {
    const lm = m(hc || '#5f8a3a'); const leafG = new THREE.SphereGeometry(1, 10, 6);
    for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; if (Math.abs(Math.sin(a) - 1) < 0.02) continue; const lf = new THREE.Mesh(leafG, lm); lf.scale.set(R * 0.11, R * 0.05, R * 0.22); const rr = R * 0.92; lf.position.set(Math.cos(a) * rr, R * 0.5 + Math.sin(a) * R * 0.08 * 0, Math.sin(a) * rr - R * 0.08); lf.rotation.y = -a; lf.rotation.x = 0.5; lf.castShadow = true; if (Math.sin(a) > 0.92) continue; head.add(lf); }
  }
  if (hg === 'cap') {
    const cm = m(hc || '#3e4a2e'); const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.02, R * 0.9, R * 0.5, 28), cm); top.position.set(0, R * 0.78, -R * 0.06); top.rotation.x = -0.12; top.castShadow = true; head.add(top);
    const vis = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.6, R * 0.6, R * 0.05, 24, 1, false, -1.1, 2.2), m('#1e1a18')); vis.position.set(0, R * 0.58, R * 0.42); vis.rotation.x = 0.15; head.add(vis);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.93, R * 0.92, R * 0.12, 28), m(shadeHex(hc || '#3e4a2e', -0.3))); band.position.set(0, R * 0.6, -R * 0.04); band.rotation.x = -0.12; head.add(band);
    const badge = new THREE.Mesh(sph(), m('#d8b04a')); badge.scale.setScalar(R * 0.07); badge.position.set(0, R * 0.68, R * 0.9); head.add(badge);
  }
  if (hg === 'cone') {   // simple conical iron helmet with a nose guard (late-antique/early-medieval look)
    const cm = m(hc || '#8a8580'); const cone = new THREE.Mesh(new THREE.ConeGeometry(R * 1.04, R * 1.0, 28, 1, true), cm); cone.material.side = THREE.DoubleSide; cone.position.y = R * 0.95; cone.rotation.x = -0.18; cone.castShadow = true; head.add(cone);
    const rimm = new THREE.Mesh(new THREE.TorusGeometry(R * 1.0, R * 0.07, 8, 28), m(shadeHex(hc || '#8a8580', -0.25))); rimm.rotation.x = Math.PI / 2 - 0.18; rimm.position.set(0, R * 0.47, -R * 0.08); head.add(rimm);
    const nose = new THREE.Mesh(sph(), cm); nose.scale.set(R * 0.07, R * 0.3, R * 0.06); nose.position.set(0, R * 0.32, R * 0.92); nose.rotation.x = 0.3; head.add(nose);
  }
  if (hg === 'hood') { const hm = m(hc || '#5a4a3a'); const hd = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 32, 14, Math.PI * 0.5 + 0.75, Math.PI * 2 - 1.5, 0, 2.3), hm); hd.material.side = THREE.DoubleSide; hd.castShadow = false; head.add(hd); }

  if (hg === 'beanie') { const bm = m(hc || '#e8712a'); const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.08, 32, 14, 0, Math.PI * 2, 0, 1.25), bm); dome.rotation.x = -0.22; dome.scale.y = 1.12; dome.castShadow = true; head.add(dome);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(R * 1.0, R * 0.12, 10, 32), m(shadeHex(hc || '#e8712a', -0.12))); cuff.rotation.x = Math.PI / 2 - 0.22; cuff.position.set(0, R * 0.36, -R * 0.08); head.add(cuff);
    if (o.pompom !== false) { const pom = new THREE.Mesh(sph(), m(shadeHex(hc || '#e8712a', 0.25))); pom.scale.setScalar(R * 0.2); pom.position.set(0, R * 1.22, -R * 0.25); head.add(pom); } }
  if (hg === 'ballcap') { const cm = m(hc || '#2f6fc0'); const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.07, 32, 12, 0, Math.PI * 2, 0, 1.2), cm); dome.rotation.x = -0.2; dome.castShadow = true; head.add(dome);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.62, R * 0.62, R * 0.06, 24, 1, false, -1.25, 2.5), cm); brim.position.set(0, R * 0.5, R * 0.62); brim.rotation.x = 0.22; brim.scale.z = 1.2; brim.castShadow = true; head.add(brim);
    const btn = new THREE.Mesh(sph(), cm); btn.scale.setScalar(R * 0.08); btn.position.set(0, R * 1.06, -R * 0.2); head.add(btn); }
  if (hg === 'hoodDown' || o.hoodDown) { const hm = m(hc || c.main); const hd = new THREE.Mesh(new THREE.TorusGeometry(R * 0.62, R * 0.2, 10, 28), hm); hd.rotation.x = Math.PI / 2 + 0.35; hd.position.set(0, D.headY - R * 0.75, -R * 0.28); hd.scale.set(1, 1.15, 1); hd.castShadow = true; upper.add(hd); }
  if (hg === 'slouch') {   // Australian slouch hat: wide brim, left side pinned up, puggaree band
    const hm = m(hc || '#8a6e48'); const crown = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.72, R * 0.92, R * 0.55, 28), hm); crown.position.set(0, R * 0.88, -R * 0.04); crown.rotation.x = -0.1; crown.castShadow = true; head.add(crown);
    const dent = new THREE.Mesh(sph(), m(shadeHex(hc || '#8a6e48', -0.15))); dent.scale.set(R * 0.55, R * 0.12, R * 0.3); dent.position.set(0, R * 1.13, -R * 0.06); head.add(dent);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.93, R * 0.16, 28), m(o.bandColor || '#4f5e3a')); band.position.set(0, R * 0.68, -R * 0.03); band.rotation.x = -0.1; head.add(band);
    const brimR = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.55, R * 1.55, R * 0.05, 32, 1, false, Math.PI, Math.PI), hm); brimR.position.set(0, R * 0.6, 0); brimR.rotation.x = -0.08; brimR.castShadow = true; head.add(brimR);
    const brimL = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.75, R * 0.75, R * 0.05, 32, 1, false, 0, Math.PI), hm); brimL.scale.set(1, 1, 1.9); brimL.position.set(R * 0.9, R * 0.95, 0); brimL.rotation.z = 1.45; brimL.castShadow = true; head.add(brimL);
    const badge = new THREE.Mesh(sph(), m('#d8b04a')); badge.scale.set(R * 0.05, R * 0.12, R * 0.12); badge.position.set(R * 0.97, R * 0.95, 0); head.add(badge);
  }
  if (o.moustache) { const mm = m(o.moustache === true ? shadeHex(hairC, -0.1) : o.moustache); for (const sx of [1, -1]) { const ms = new THREE.Mesh(sph(), mm); ms.scale.set(R * 0.2, R * 0.08, R * 0.08); const n = surf(sx * 0.13, -0.2); ms.position.copy(n).multiplyScalar(R * 1.0); ms.rotation.z = sx * -0.25; ms.castShadow = true; head.add(ms); } }
  if (o.glasses) { const gm = m(o.glassesColor || '#2a2228'); for (const sx of [1, -1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.33, R * 0.035, 8, 28), gm); const n = surf(sx * 0.36, 0.08); ring.position.copy(n).multiplyScalar(R * 1.07); ring.quaternion.setFromUnitVectors(Zv, n); ring.userData.noOutline = true; head.add(ring); } const br = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.03, R * 0.03, R * 0.14, 6), gm); br.rotation.z = Math.PI / 2; br.position.set(0, R * 0.16, R * 1.02); head.add(br); }
  if (o.scarf) { const sm = m(o.scarf); const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.6, R * 0.17, 10, 28), sm); ring.rotation.x = Math.PI / 2; ring.position.y = D.headY - R * 0.82; ring.castShadow = true; upper.add(ring); const tail = new THREE.Mesh(sph(), sm); tail.scale.set(R * 0.17, R * 0.42, R * 0.08); tail.position.set(R * 0.32, D.headY - R * 1.25, R * 0.62); tail.rotation.z = 0.15; tail.castShadow = true; upper.add(tail); }
  // contact shadow
  if (o.shadowBlob !== false) root.add(blob(0.55, 0.3));
  outline(rig, { px: o.outlinePx ?? 3.2 });

  // ---------- runtime API ----------
  const api = root;
  api.parts = { rig, upper, body, head, eyes, brows, mouth, legs, arms, hairG };
  api.hand = { L: arms.L.hand, R: arms.R.hand };
  api.hold = (side, obj) => { arms[side].hand.add(obj); return obj; };
  let curPose = P({});
  api.pose = (p) => {
    p = P(p); curPose = p;
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const a = p[`arm${side}`]; arms[side].sh.rotation.set(-a[0], s * (a[2] || 0), s * a[1]); arms[side].el.rotation.set(-p[`elbow${side}`], 0, 0);
      const l = p[`leg${side}`]; legs[side].hip.rotation.set(-l[0], 0, s * l[1]); legs[side].knee.rotation.set(p[`knee${side}`], 0, 0);
      legs[side].foot.rotation.x = -(p[`knee${side}`]) * 0 + (l[0] - p[`knee${side}`]) * 0.6;
      arms[side].sh.position.y = D.shoulderY + p.shrugY;
    }
    upper.rotation.set(p.lean, p.twist, -p.side); upper.position.y = D.hipY + p.bob;
    head.rotation.set(p.headNod, p.headTurn, -p.headTilt); head.position.y = D.headY + p.shrugY * 0.3;
    return api;
  };
  // blink schedule (deterministic per character)
  const blinks = []; { const r = rng(seed * 13 + 7); let tt = 0.6 + r() * 1.5; while (tt < 600) { blinks.push(tt); tt += 2.2 + r() * 2.8; } }
  api.blinkAt = (t) => { for (const b of blinks) { if (b > t + 0.2) break; const d = t - b; if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI); } return 0; };
  const mt = mouthTextures(); let curMouth = 'line';
  // face(expr, t?, { blink: true }) — t enables blinking and talking
  api.face = (e, t = null, fo = {}) => {
    e = X(e); const bl = t != null && fo.blink !== false ? api.blinkAt(t) : 0;
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const E2 = eyes[side]; const lid = clamp(Math.max(e.lid, bl) + (e[`lid${side}`] || 0));
      E2.lidPiv.rotation.x = lerp(-1.05, 1.5708, lid);
      E2.lowPiv.rotation.x = lerp(1.35, 0.1, clamp(e.lower * (1 - bl) + bl * 0.4));
      E2.lidRoll.rotation.z = s * (e.lidAngle || 0);
      const [px, py] = e.pupil; E2.pupG.rotation.set(-py * 0.42, px * 0.5 * 1, 0);
      E2.pup.scale.set(0.3 * e.pupilSize, 0.33 * e.pupilSize, 0.1);
      const B = brows[side]; const bY = 0.5 + e.brow * 0.13 + (e[`brow${side}`] || 0) * 0.13 - Math.max(0, e.lid - 0.45) * 0.08; const n = surf(s * 0.36, bY);
      B.bg.position.copy(n).multiplyScalar(R * 1.0); B.bg.quaternion.setFromUnitVectors(Zv, n);
      B.bm.rotation.z = s * (e.browAngle * 0.55) - s * 0.06;
    }
    let shape = e.mouth, open = 0;
    if (e.talk > 0 && t != null) { open = e.talk * Math.max(0, Math.sin(t * 15) * 0.6 + Math.sin(t * 9.3) * 0.5); if (open > 0.3) shape = shape === 'smile' || shape === 'grin' ? 'grin' : 'open'; }
    if (shape !== curMouth && mt[shape]) { mouth.material.map = mt[shape]; mouth.material.needsUpdate = true; curMouth = shape; }
    const big = ['o', 'open', 'scream'].includes(shape);
    mouthG.scale.set(e.mouthW, 0.97 * (big ? 0.8 + open * 0.4 : 1), 0.97); mouthG.rotation.x = -e.mouthY * 0.1;
    return api;
  };
  api.pose(POSE.stand); api.face(EXPR.neutral);
  return api;
}
let _stripeTex = new Map();
function stripeTex(c) { const k = `${c.main}|${c.stripe}`; if (_stripeTex.has(k)) return _stripeTex.get(k); const t = canvasTex(64, 64, (g, w, h) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? (c.main || '#f2efe8') : (c.stripe || '#23222a'); g.fillRect(0, (i * h) / 4, w, h / 4); } }); _stripeTex.set(k, t); return t; }

// ---------- character presets for the I.Awaken Rome stories (original designs) ----------
export const CAST = {
  // Gaius: bored night guard. Armour, red crest, stubble-free, heavy lids.
  guard: { name: 'Gaius', outfit: 'armour', head: 'helmet', skin: 'fair', hair: 'bald', colors: { main: '#a3352b' }, seed: 3 },
  // Senator Lucius Pomponius: toga with purple trim, horseshoe hair, panics easily.
  senator: { name: 'Pomponius', outfit: 'toga', head: 'none', skin: 'light', hair: 'horseshoe', hairColor: '#8a8580', colors: { trim: '#6a2a6a' }, seed: 5 },
  // Emperor (late Western court): purple robe, gold laurel.
  emperor: { name: 'Emperor', outfit: 'robe', head: 'laurel', headColor: '#d4a73a', skin: 'light', hair: 'bowl', hairColor: '#3a2618', colors: { main: '#5a2a6a', trim: '#e0b84a' }, seed: 8 },
  // a Visigoth warrior, normally drawn as a silhouette against fire
  goth: { name: 'Goth', outfit: 'rags', head: 'cone', skin: 'tan', hair: 'long', hairColor: '#6a4a2a', beard: true, colors: { main: '#6a5a40' }, seed: 11 },
  citizen: { name: 'Citizen', outfit: 'tunic', head: 'none', skin: 'tan', hair: 'curly', hairColor: '#2a1a12', colors: { main: '#c9853a' }, seed: 13 },
  prisoner: { name: 'Prisoner', outfit: 'striped', head: 'none', skin: 'fair', hair: 'bowl', hairColor: '#5a3a22', seed: 17 },
};
