// kits/toon3d/react.js — reaction FX drawn over/around a 3D character's head (ported from the BEANMEN look, redrawn for the 3D beans).
// The 3D render stays untouched; the FX are bold 2D cartoon marks drawn in the shot's overlay, pinned to the projected head.
//
//   import { reactions, shakeCam } from '/kits/toon3d/react.js';
//   const FX = [ { fx: 'question', on: 'emu', at: 0.3, until: 1.6 },          // `on` = a key of the shot state (s.emu) or an Object3D or [x,y,z]
//                { fx: 'hearts',   on: 'emu', at: 1.6 },
//                { fx: 'shake',    at: 2.0, amp: 0.08 },  { fx: 'flash', at: 2.0 } ];
//   draw(s, t)          { ...; camMove(s.stage, t, ...); shakeCam(s.stage, t, FX); }      // shake moves the 3D camera (after camMove)
//   overlay(g, t, i, s) { reactions(g, t, s, FX); }                                         // everything else is drawn here
//
// Effects: sparkle, sweat, exclaim (!), question (???), hearts, heartEyes, stars (dizzy), zzz, shake, flash, ripples,
//          godrays (screen), spotlight, speedlines, glow.   Options per item: at, until (fades out over 0.2 s), seed, color, scale, dx/dy (logical px).
// `at`/`until` are shot-local seconds; use `at: wordAt(info, 'hearts')` from the project to land an FX on a word.
// Recommended sfx (kit audio, see README "Audio"): sparkle->toon3d:sparkle, exclaim->toon3d:ding, question->toon3d:boing,
//   hearts->toon3d:pop, sweat->toon3d:squeak, stars->toon3d:boing, zzz->toon3d:clock, shake->toon3d:thud, flash->toon3d:impact, ripples->toon3d:magic.
import { E, clamp, ease, alpha, FONTS } from '/engine/core.js';
import { THREE } from './toon.js';

export const FX_INK = '#2a1c15';
export const FX_FONT = FONTS.ui;      // Nunito 900: the heavy, round display face of the kit's UI
export const FX_SFX = { sparkle: 'toon3d:sparkle', exclaim: 'toon3d:ding', question: 'toon3d:boing', hearts: 'toon3d:pop', heartEyes: 'toon3d:pop', sweat: 'toon3d:squeak',
  stars: 'toon3d:boing', zzz: 'toon3d:clock', shake: 'toon3d:thud', flash: 'toon3d:impact', ripples: 'toon3d:magic', godrays: 'toon3d:chime', spotlight: 'toon3d:click', speedlines: 'toon3d:whoosh' };

const R = (i, seed) => { const x = Math.sin((i * 7.31 + seed * 100) * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();

// ---------- anchors: where a 3D thing is on screen ----------
// project(st, [x,y,z] | Vector3) -> { x, y, s }  logical px; s = logical px per world unit at that depth
export function project(st, p) {
  const cam = st.camera; v3.set(...(Array.isArray(p) ? p : [p.x, p.y, p.z])); const d = v3.distanceTo(cam.position);
  v3.project(cam); return { x: (v3.x + 1) / 2 * E.W, y: (1 - v3.y) / 2 * E.H, s: E.H / (2 * Math.tan((cam.fov * Math.PI) / 360) * Math.max(0.1, d)), behind: v3.z > 1 };
}
// anchor(st, target, o) -> { x, y (top of head), cx, cy (head centre), fx, fy (body centre), r (head radius px), s, sz (FX size factor), eyes: [{x,y}] }
// target: a bean (rig.js), an animal from animals.js, any Object3D (o.height, default 2.6), or a world point [x,y,z].
export function anchor(st, target, o = {}) {
  if (Array.isArray(target) || target?.isVector3) { const p = project(st, target); const sz = clamp(p.s / 220, 0.6, 2.2) * (o.scale ?? 1); return { x: p.x, y: p.y, cx: p.x, cy: p.y, fx: p.x, fy: p.y, r: 0.45 * p.s, s: p.s, sz, eyes: [] }; }
  const head = target.parts?.head || target.head; target.updateWorldMatrix?.(true, true);
  let hr = (target.headR ?? 0.48);
  if (head) { head.getWorldPosition(v4); const ws = new THREE.Vector3(); head.getWorldScale(ws); hr *= target.parts ? ws.y : target.getWorldScale(new THREE.Vector3()).y; }
  else { target.getWorldPosition(v4); v4.y += (o.height ?? 2.6) - 0.45; }
  const c = project(st, v4); const top = project(st, [v4.x, v4.y + hr, v4.z]);
  target.getWorldPosition?.(v3); const footY = v3.y; const mid = project(st, [v4.x, (footY + v4.y) / 2, v4.z]);
  const eyes = []; const EY = target.parts?.eyes ? [target.parts.eyes.L, target.parts.eyes.R] : (target.eyes || []);
  for (const e of EY) { const g = e?.eg; if (!g) continue; g.getWorldPosition(v3); const p = project(st, v3); eyes.push({ x: p.x, y: p.y }); }
  const sz = clamp(c.s / 220, 0.6, 2.2) * (o.scale ?? 1);
  return { x: top.x + (o.dx || 0), y: top.y + (o.dy || 0), cx: c.x, cy: c.y, fx: mid.x, fy: mid.y, r: hr * c.s, s: c.s, sz, eyes, behind: c.behind };
}

// ---------- drawing helpers ----------
const HEART = new Path2D('M 0 20 C -40 -6 -30 -40 -12 -40 C -4 -40 0 -32 0 -26 C 0 -32 4 -40 12 -40 C 30 -40 40 -6 0 20 Z');
const DROP = new Path2D('M 0 -22 Q -16 2 -10 10 Q 0 18 10 10 Q 16 2 0 -22 Z');
const SPARK = new Path2D('M 0 -30 Q 4 -4 30 0 Q 4 4 0 30 Q -4 4 -30 0 Q -4 -4 0 -30 Z');
function mark(g, path, x, y, s, fill, a = 1, rot = 0, stroke = FX_INK, lw = 4) {
  if (s <= 0.001 || a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = fill; g.fill(path);
  if (stroke) { g.lineWidth = lw; g.lineJoin = 'round'; g.strokeStyle = stroke; g.stroke(path); } g.restore();
}
function glyph(g, ch, x, y, size, fill, a = 1, rot = 0) {
  if (size <= 0.5 || a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.font = `900 ${size}px "${FX_FONT}"`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineJoin = 'round'; g.lineWidth = size * 0.18; g.strokeStyle = FX_INK; g.strokeText(ch, 0, 0); g.fillStyle = fill; g.fillText(ch, 0, 0); g.restore();
}
const pop = (age, d = 0.33) => ease.outBack(clamp(age / d));

// drawFx(g, name, age, a, o) — one effect, `age` seconds since it started, `a` = anchor(...) (screen effects ignore it)
export function drawFx(g, name, age, a, o = {}) {
  const t = age, seed = o.seed ?? 1, sz = a?.sz ?? 1, W = E.W, H = E.H;
  switch (name) {
    case 'sparkle': { g.save(); g.globalCompositeOperation = 'screen';
      for (let i = 0; i < 16; i++) { const an = R(i, seed) * Math.PI * 2, d = (120 + R(i + 50, seed) * 260) * sz * 0.8; const ph = (t * 2.2 + R(i + 9, seed)) % 1; const s = Math.sin(ph * Math.PI) * (0.5 + R(i + 3, seed) * 0.9) * sz * clamp(age / 0.2);
        mark(g, SPARK, a.fx + Math.cos(an) * d, a.fy + Math.sin(an) * d * 0.8, s, o.color || '#fff8d0', 1, 0, null); }
      g.restore(); return; }
    case 'sweat':
      for (let i = 0; i < 4; i++) { const life = (t * 1.6 + i / 4) % 1; const side = i % 2 ? 1 : -1;
        const x = a.cx + side * (a.r * 0.9 + life * 110 * sz), y = a.cy - a.r * 0.4 - Math.sin(life * Math.PI) * 110 * sz + life * 60 * sz;
        mark(g, DROP, x, y, sz * 1.1, '#9fd8ff', (1 - life) * clamp(age / 0.15), side * 0.5); }
      return;
    case 'exclaim': { const s = pop(age); glyph(g, '!', a.x + (o.side ?? 0.55) * a.r, a.y - 20 * sz, 120 * s * sz, o.color || '#ff3b30', 1, 0.12 * Math.sin(t * 9) * clamp(1 - age)); return; }
    case 'question':
      for (let i = 0; i < 3; i++) { const s = pop(age - i * 0.12) ; const x = a.x + (i - 1) * 78 * sz, y = a.y - 34 * sz + Math.sin(t * 5 + i) * 10 * sz - (i === 1 ? 30 * sz : 0);
        glyph(g, '?', x, y, 110 * s * sz, o.color || '#ffffff', 1, (i - 1) * 0.18); }
      return;
    case 'hearts':
      for (let i = 0; i < 4; i++) { const life = (t * 0.7 + i / 4) % 1; const x = a.x + (40 + life * 80 + i * 10) * sz * (i % 2 ? 1 : -0.8), y = a.y - 30 * sz - life * 260 * sz;
        mark(g, HEART, x, y, sz * (0.9 + 0.1 * Math.sin(t * 10 + i)) * clamp(age / 0.25), o.color || '#ff4a6a', 1 - life); }
      return;
    case 'heartEyes': {   // BEANMEN "love" face: hearts over both eyes, pulsing
      const pts = a.eyes.length ? a.eyes : [{ x: a.cx - a.r * 0.35, y: a.cy }, { x: a.cx + a.r * 0.35, y: a.cy }];
      const s = Math.max(0.25, a.r / 95) * (1 + Math.sin(t * 10) * 0.08) * pop(age, 0.25) * (o.scale ?? 1);
      pts.forEach(p => mark(g, HEART, p.x, p.y + 8 * s, s, o.color || '#e23b4a', 1, 0, FX_INK, 5)); return; }
    case 'stars':
      for (let i = 0; i < 5; i++) { const an = t * 5 + (i / 5) * Math.PI * 2; const k = Math.sin(an) > 0 ? 1 : 0.75;
        mark(g, SPARK, a.cx + Math.cos(an) * Math.max(110 * sz, a.r * 1.3), a.y - 10 * sz + Math.sin(an) * 30 * sz, 0.9 * sz * k * clamp(age / 0.2), o.color || '#ffe24a', 1, 0, FX_INK, 3); }
      return;
    case 'zzz':
      for (let i = 0; i < 3; i++) { const life = (t * 0.55 + i / 3) % 1; glyph(g, 'Z', a.x + (40 + life * 90) * sz, a.y - 20 * sz - life * 220 * sz, (60 + life * 50) * sz, o.color || '#ffffff', Math.sin(life * Math.PI) * clamp(age / 0.2), -0.2); }
      return;
    case 'ripples': { g.save(); g.globalCompositeOperation = 'screen'; const cx = o.atFeet ? a.fx : a.fx, cy = o.atFeet ? a.fy + a.r * 2.4 : a.fy;
      for (let i = 0; i < 4; i++) { const life = (t * 0.8 + i / 4) % 1; g.strokeStyle = alpha(o.color || '#ffffff', (1 - life) * 0.8 * clamp(age / 0.2)); g.lineWidth = 8; g.beginPath(); g.ellipse(cx, cy, Math.max(0.1, life * 700 * sz * 0.6), Math.max(0.1, life * 260 * sz * 0.6), 0, 0, Math.PI * 2); g.stroke(); }
      g.restore(); return; }
    case 'flash': { const k = clamp(1 - age / (o.dur ?? 0.38)) * 0.9; if (k > 0) { g.fillStyle = alpha(o.color || '#ffffff', k); g.fillRect(0, 0, W, H); } return; }
    case 'godrays': godRays(g, t, { ...o, fade: clamp(age / 0.4) }); return;
    case 'spotlight': { const k = clamp(age / 0.4) * 0.78; const gr = g.createRadialGradient(a.fx, a.cy, 300 * sz * 0.8, a.fx, a.cy, 520 * sz * 0.8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${k})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); return; }
    case 'speedlines': { g.save(); g.strokeStyle = 'rgba(255,255,255,.6)'; const cx = a?.cx ?? W / 2, cy = a?.cy ?? H / 2;
      for (let i = 0; i < 48; i++) { const an = (i / 48) * Math.PI * 2 + R(i, seed) * 0.1; const r0 = 380 + R(i + Math.floor(age * 12), seed) * 200; g.lineWidth = 4 + R(i, seed + 1) * 10; g.beginPath(); g.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); g.lineTo(cx + Math.cos(an) * 1800, cy + Math.sin(an) * 1800); g.stroke(); }
      g.restore(); return; }
    case 'glow': { g.save(); g.globalCompositeOperation = 'screen'; const k = 0.55 + 0.25 * Math.sin(t * 5); const gr = g.createRadialGradient(a.fx, a.fy, 0, a.fx, a.fy, 620 * sz * 0.8);
      gr.addColorStop(0, `rgba(255,226,140,${k})`); gr.addColorStop(0.42, `rgba(255,200,90,${k * 0.4})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); return; }
    case 'shake': return;   // camera effect: see shakeCam()
  }
}

// godRays(g, t, { from: [x, y] (logical, default top-left), color, strength, count }) — soft warm light shafts, screen-blended
export function godRays(g, t, o = {}) {
  const [sx, sy] = o.from || [-0.1 * E.W, -0.08 * E.H]; const col = o.color || '#fff6d8'; const k = (o.strength ?? 1) * (o.fade ?? 1); const n = o.count ?? 6;
  const tx = o.to ? o.to[0] : E.W * 0.75, ty = o.to ? o.to[1] : E.H;
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const sp = (i - (n - 1) / 2) / n; const w0 = 40 + 30 * Math.sin(t * 0.7 + i), w1 = 160 + 90 * ((i * 37) % 5) / 5; const ang = Math.atan2(ty - sy, tx - sx) + sp * 0.75;
    const L = Math.hypot(E.W, E.H) * 1.2; const ex = sx + Math.cos(ang) * L, ey = sy + Math.sin(ang) * L; const nx = -Math.sin(ang), ny = Math.cos(ang);
    const gr = g.createLinearGradient(sx, sy, ex, ey); const a0 = (0.32 + 0.12 * Math.sin(t * 1.3 + i * 1.7)) * k; gr.addColorStop(0, alpha(col, a0)); gr.addColorStop(0.55, alpha(col, a0 * 0.35)); gr.addColorStop(1, alpha(col, 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(sx + nx * w0, sy + ny * w0); g.lineTo(ex + nx * w1, ey + ny * w1); g.lineTo(ex - nx * w1, ey - ny * w1); g.lineTo(sx - nx * w0, sy - ny * w0); g.closePath(); g.fill();
  }
  const sun = g.createRadialGradient(sx, sy, 0, sx, sy, E.W * 0.55); sun.addColorStop(0, alpha(col, 0.55 * k)); sun.addColorStop(1, alpha(col, 0)); g.fillStyle = sun; g.fillRect(0, 0, E.W, E.H);
  g.restore();
}

const SCREEN = new Set(['flash', 'godrays']);
const targetOf = (s, on) => (on == null ? null : typeof on === 'string' ? on.split('.').reduce((o, k) => o?.[k], s) : on);
// reactions(g, t, s, list) — draw every active FX of a track in a shot overlay. s = the shot state (needs s.stage or s itself as the stage).
export function reactions(g, t, s, list) {
  const st = s.stage || s;
  for (const it of list) {
    const name = it.fx, t0 = it.at ?? 0; if (t < t0 || name === 'shake') continue;
    let a = 1; if (it.until != null) { if (t > it.until + 0.2) continue; a = clamp(1 - (t - it.until) / 0.2); }
    const tgt = targetOf(s, it.on); const an = SCREEN.has(name) && !tgt ? null : tgt ? anchor(st, tgt, it) : { x: E.W / 2, y: E.H * 0.35, cx: E.W / 2, cy: E.H * 0.4, fx: E.W / 2, fy: E.H / 2, r: 120, s: 300, sz: 1.2 * (it.scale ?? 1), eyes: [] };
    if (an?.behind) continue;
    g.save(); g.globalAlpha = a; drawFx(g, name, t - t0, an, it); g.restore();
  }
}
// shakeCam(st, t, list | { at, amp, dur }) — after camMove: jolts the camera for every `shake` item (decaying, deterministic)
export function shakeCam(st, t, list) {
  const items = Array.isArray(list) ? list.filter(x => x.fx === 'shake') : [list]; let dx = 0, dy = 0;
  for (const it of items) { const age = t - (it.at ?? 0), dur = it.dur ?? 0.5; if (age < 0 || age > dur) continue; const k = (1 - age / dur) ** 2 * (it.amp ?? 0.06);
    dx += Math.sin(age * 71 + 1.3) * k; dy += Math.sin(age * 53 + 4.1) * k * 0.8; }
  if (dx || dy) { const c = st.camera; const right = new THREE.Vector3(1, 0, 0).applyQuaternion(c.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(c.quaternion);
    c.position.addScaledVector(right, dx).addScaledVector(up, dy); }
  return [dx, dy];
}
