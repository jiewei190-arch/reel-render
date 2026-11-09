// _camp.js — "Head Count" set, built inside this project (the kit has no woods/campfire/tents).
// Night woods, a ring of log seats round a campfire, two tents. ONE accent: campfire orange.
// Everything is drawn in WORLD coords; shots frame it with a camera {z, fx, fy, dx, dy}.
import * as K from '/kits/sticks/sticks.js';
const { INK, clamp, lerp, prog, ease, rng, noise, alpha, mix } = K;
K.setAccent('orange');
export const ORANGE = K.K.accent;

// ---------------------------------------------------------------- layout
export const FIRE = [540, 1000];           // fire centre (base of the flames)
export const RING = { rx: 360, ry: 150 };  // ellipse of the log seats
export const HORIZON = 760;
const D2R = Math.PI / 180;
// facing camera, sitting on a log (knees out, hands on knees)
export const SIT_FRONT = { lean: 0, tilt: 0, aL: [-0.55, 0.85], aR: [0.55, -0.85], lL: [-1.25, 1.15], lR: [1.25, -1.15], seated: true };
export const SIT_SIDE = K.POSES.sit;
export const seatAt = (deg, k = 1) => [FIRE[0] + RING.rx * k * Math.cos(deg * D2R), FIRE[1] + RING.ry * k * Math.sin(deg * D2R)];
export const depthS = (y) => 0.6 + clamp((y - (FIRE[1] - RING.ry)) / (2 * RING.ry)) * 0.32;
// the five people I count, left to right (angle on the ring; 90 = front = my seat)
export const FRIENDS = [
  { deg: 167, side: 1, seed: 21 },
  { deg: 236, side: 0, seed: 33 },
  { deg: 282, side: 0, seed: 45 },
  { deg: 318, side: 0, seed: 57 },
  { deg: 14, side: -1, seed: 69 },
].map(f => { const [x, y] = seatAt(f.deg); return { ...f, x, y: y - 6, s: depthS(y) }; });
export const ME = (() => { const [x, y] = seatAt(90); return { x: x - 130, y: y + 70, s: 1.12 }; })();
// head position of a seated friend (world)
export function headOf(f) { const pose = f.side ? SIT_SIDE : SIT_FRONT; const R = K.rig(pose, f.x, f.y, f.s, { anchor: 'hip' }); return R.head; }
// the sixth: stands at the edge of the firelight, between friends 4 and 5, a little too tall
export const SIXTH = (() => { const [x, y] = seatAt(257, 1.5); return { x, y }; })();

// ---------------------------------------------------------------- camera
export function cam(g, c) { K.camera(g, c.z, c.fx ?? FIRE[0], c.fy ?? FIRE[1], c.dx || 0, c.dy || 0); }
export function toScreen(c, p) { const fx = c.fx ?? FIRE[0], fy = c.fy ?? FIRE[1]; return [(p[0] - fx) * c.z + fx + (c.dx || 0), (p[1] - fy) * c.z + fy + (c.dy || 0)]; }

// ---------------------------------------------------------------- fire light (shared so every layer agrees)
export function fireLight(t, o = {}) {
  const { k = 1, pops = [] } = o;
  let f = 0.84 + 0.1 * noise(t * 5.5, 3) + 0.06 * noise(t * 13, 9);
  for (const p of pops) { const d = t - p; if (d >= 0 && d < 0.35) f += 0.35 * (1 - d / 0.35); }
  return clamp(f, 0, 1.4) * k;
}

// ---------------------------------------------------------------- woods
const TREES = (() => { const r = rng(1234), out = []; for (let i = 0; i < 26; i++) { const d = r(); out.push({ x: -60 + r() * 1200, d, w: lerp(2, 7, d), a: lerp(0.16, 0.55, d), base: HORIZON + lerp(-10, 60, d), lean: (r() - 0.5) * 0.05, br: r() }); } return out.sort((a, b) => a.d - b.d); })();
export function woods(g, t) {
  g.fillStyle = INK.bg; g.fillRect(-1200, -1200, 3480, 4320);
  // ground: slightly lifted, warm near the fire
  g.fillStyle = '#0b0b0f'; g.fillRect(-1200, HORIZON, 3480, 3000);
  K.chalk(g, [[-1200, HORIZON + 6], [-300, HORIZON - 4], [300, HORIZON + 8], [900, HORIZON - 2], [2300, HORIZON + 6]], { w: 2.5, a: 0.35, seed: 700, double: false });
  for (const T of TREES) {
    const top = -700, x0 = T.x, x1 = T.x + T.lean * (T.base - top);
    K.chalk(g, [[x0, T.base], [x1, top]], { w: T.w, a: T.a, seed: 710 + Math.round(T.x), wob: 1.4, double: T.d > 0.6 });
    if (T.d > 0.35) { const by = lerp(T.base, top, 0.35 + T.br * 0.3), bx = lerp(x0, x1, 0.35 + T.br * 0.3), sx = T.br > 0.5 ? 1 : -1; K.chalk(g, [[bx, by], [bx + sx * 70 * T.d, by - 90 * T.d], [bx + sx * 110 * T.d, by - 120 * T.d]], { w: T.w * 0.6, a: T.a * 0.9, seed: 760 + Math.round(T.x), double: false }); }
  }
  // grass ticks in the firelight
  const r = rng(77); for (let i = 0; i < 40; i++) { const x = FIRE[0] + (r() - 0.5) * 1100, y = HORIZON + 60 + r() * 600; K.chalk(g, [[x, y], [x + (r() - 0.5) * 10, y - 14 - r() * 12]], { w: 2, a: 0.28, seed: 800 + i, double: false }); }
}
export function tents(g) {
  const T = (x, y, w, h, s) => { K.chalk(g, [[x - w / 2, y], [x, y - h], [x + w / 2, y]], { w: 4, a: 0.75, seed: s }); K.chalk(g, [[x, y - h], [x + w * 0.62, y - h * 0.9], [x + w * 0.85, y - 4]], { w: 3, a: 0.5, seed: s + 1 }); K.chalk(g, [[x, y - h * 0.62], [x - 26, y], [x + 26, y]], { w: 3, a: 0.6, seed: s + 2 }); g.fillStyle = '#030305'; g.beginPath(); g.moveTo(x, y - h * 0.6); g.lineTo(x - 24, y - 2); g.lineTo(x + 24, y - 2); g.closePath(); g.fill(); };
  T(170, 880, 300, 210, 820); T(900, 860, 240, 170, 830);
}
// ---------------------------------------------------------------- seats
export function logs(g, list) { for (const L of list) { const [x, y] = L, w = (L[2] || 120); K.chalk(g, [[x - w / 2, y], [x + w / 2, y + 4]], { w: 7, a: 0.75, seed: 840 + Math.round(x) }); K.ellipse(g, x - w / 2, y + 2, 7, 12, { w: 3, a: 0.6, seed: 850 + Math.round(x) }); } }
// ---------------------------------------------------------------- the fire
export function fire(g, t, o = {}) {
  const { k = 1, pops = [] } = o, [fx, fy] = FIRE;
  // stone ring + crossed logs
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; K.ellipse(g, fx + Math.cos(a) * 92, fy + 6 + Math.sin(a) * 30, 20, 12, { w: 3, a: 0.7, seed: 870 + i }); }
  K.chalk(g, [[fx - 80, fy + 14], [fx + 70, fy - 22]], { w: 10, a: 0.85, seed: 881 }); K.chalk(g, [[fx - 70, fy - 22], [fx + 80, fy + 14]], { w: 10, a: 0.85, seed: 882 });
  // embers in the logs
  const em = rng(Math.floor(t * 8) + 5); g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) { g.fillStyle = alpha(ORANGE, 0.35 + em() * 0.5); g.beginPath(); g.arc(fx + (em() - 0.5) * 120, fy - 4 + (em() - 0.5) * 24, 2 + em() * 3, 0, Math.PI * 2); g.fill(); }
  g.restore();
  if (k > 0.01) {
    // flame tongues (filled, boiling)
    const b = K.boil(12);
    for (let i = 0; i < 5; i++) {
      const u = (i - 2) / 2, h = (150 + 50 * noise(t * 3.1, i * 7) - Math.abs(u) * 60) * k, sway = noise(t * 2.2, i + 40) * 26 * k, w = (46 - Math.abs(u) * 10) * Math.max(0.4, k);
      const bx = fx + u * 44 * Math.max(0.5, k), by = fy - 6, r = rng(b * 13 + i);
      const tip = [bx + sway + (r() - 0.5) * 10, by - h];
      const col = mix(ORANGE, '#ffffff', i === 2 ? 0.35 : 0.08);
      g.save(); g.fillStyle = alpha(col, 0.92);
      g.beginPath(); g.moveTo(bx - w, by);
      g.quadraticCurveTo(bx - w * 0.9 + sway * 0.3, by - h * 0.55, tip[0], tip[1]);
      g.quadraticCurveTo(bx + w * 0.9 + sway * 0.3, by - h * 0.5, bx + w, by); g.closePath(); g.fill();
      g.fillStyle = alpha(mix(ORANGE, '#ffffff', 0.7), 0.85); g.beginPath(); g.moveTo(bx - w * 0.4, by); g.quadraticCurveTo(bx - w * 0.3 + sway * 0.2, by - h * 0.35, bx + sway * 0.6, by - h * 0.55); g.quadraticCurveTo(bx + w * 0.35, by - h * 0.3, bx + w * 0.4, by); g.closePath(); g.fill();
      g.restore();
    }
  }
  // sparks
  g.save(); g.globalCompositeOperation = 'lighter';
  const n = Math.round(16 * Math.max(k, 0.15));
  for (let i = 0; i < n; i++) { const rr = rng(i * 91 + 7), sp = 0.45 + rr() * 0.4, ph = (t * sp + rr()) % 1; const x = fx + (rr() - 0.5) * 70 + Math.sin(ph * 7 + i) * 24, y = fy - 40 - ph * (380 + rr() * 220) * Math.max(0.4, k); g.fillStyle = alpha(mix(ORANGE, '#fff', 0.3), (1 - ph) * 0.9); g.fillRect(x, y, 3, 3); }
  for (const p of pops) { const d = t - p; if (d < 0 || d > 0.9) continue; const rr = rng(Math.round(p * 100)); for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (rr() - 0.5) * 1.8, v = 300 + rr() * 500; const x = fx + Math.cos(a) * v * d, y = fy - 40 + Math.sin(a) * v * d + 420 * d * d; g.fillStyle = alpha(mix(ORANGE, '#fff', 0.5), 1 - d / 0.9); g.fillRect(x, y, 4, 4); } }
  g.restore();
}
export function glow(g, t, o = {}) { const L = fireLight(t, o), [fx, fy] = FIRE; K.lightPool(g, fx, fy - 60, 760 * Math.max(0.25, L), ORANGE, 0.75 * L); K.lightPool(g, fx, fy - 50, 220, '#ffffff', 0.25 * L); return L; }
export function dark(g, t, o = {}) { const L = fireLight(t, o), [fx, fy] = FIRE; K.darkness(g, o.amt ?? 0.84, [{ x: fx, y: fy - 40, r: (o.r ?? 880) * Math.max(0.3, L), k: 1, soft: 0.35 }]); return L; }

// ---------------------------------------------------------------- people
// draw the five friends. o.faces(i) -> face options; o.light(i) -> extra white brightness on that head (the count)
export function friends(g, t, o = {}) {
  const list = FRIENDS.map((f, i) => ({ ...f, i })).sort((a, b) => a.y - b.y);
  for (const f of list) {
    const base = f.side ? SIT_SIDE : SIT_FRONT;
    const pose = { ...base, ...(o.pose ? o.pose(f.i) || {} : {}), tilt: (base.tilt || 0) + noise(t * 0.5, f.seed) * 0.08 + (o.tilt ? o.tilt(f.i) : 0), lean: (base.lean || 0) + (o.bob ? o.bob(f.i) : 0) };
    const lookToFire = f.side ? [1, 0.2] : [(FIRE[0] - f.x) / 300, 0.3];
    const fc = { eyes: 'dot', mouth: 'flat', look: o.lookAtMe ? [0, 0.2] : lookToFire, blink: ((t + f.seed * 0.37) % 3.7) < 0.12 ? 1 : 0, ...(o.faces ? o.faces(f.i) || {} : {}) };
    if (o.skip && o.skip(f.i)) continue;
    const yOff = o.hop ? o.hop(f.i) : 0;
    const R = K.stickFigure(g, pose, fc, { x: f.x, y: f.y - yOff, s: f.s, flip: f.side === -1 ? -1 : 1, anchor: 'hip', seed: f.seed });
    if (o.light) { const k = o.light(f.i); if (k > 0) K.lightPool(g, R.head[0], R.head[1], 120 * f.s, '#ffffff', 0.55 * k); }
    if (o.after) o.after(g, f.i, R);
  }
  logs(g, FRIENDS.map(f => [f.x, f.y + 12 * f.s, f.side ? 150 * f.s : 130 * f.s]));
}
export function me(g, t, o = {}) {
  const pose = { ...SIT_FRONT, tilt: noise(t * 0.4, 99) * 0.05 };
  K.stickFigure(g, pose, {}, { x: ME.x, y: ME.y, s: ME.s, back: true, anchor: 'hip', seed: 101, a: o.a ?? 1 });
  logs(g, [[ME.x, ME.y + 14, 150]]);
}
// a seated head that turns from profile (looking at the fire) to face the camera. k 0..1
export function turningHead(g, x, y, r, k, o = {}) {
  g.save(); g.translate(x, y); g.rotate(0.3 * ease.inOut(clamp((k - 0.5) * 2)) * (o.dir || 1)); g.translate(-x, -y);
  K.blob(g, x, y, r, r, INK.head, { seed: 911, wob: 1.2 });
  const off = (1 - ease.inOut(k)) * r * 0.62 * (o.dir || 1);
  g.save(); g.beginPath(); g.arc(x, y, r * 0.98, 0, Math.PI * 2); g.clip();
  K.face(g, x + off, y, r, { eyes: k > 0.6 ? 'pin' : 'dot', mouth: { w: 0.42, c: 0, o: 0 }, eyeGap: 0.36 - (1 - k) * 0.14 }, { seed: 912 });
  g.restore(); g.restore();
}
// my hand (screen space): arm from the bottom-right corner to a fingertip at p
export function hand(g, p, o = {}) {
  const base = o.base || [Math.min(p[0] + 330, 1180), p[1] + 720], dx = p[0] - base[0], dy = p[1] - base[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const wrist = [p[0] - ux * 95, p[1] - uy * 95];
  K.chalk(g, [base, [lerp(base[0], wrist[0], 0.5) + 30, lerp(base[1], wrist[1], 0.5) + 10], wrist], { w: 16, seed: 931, wob: 1.6 });
  K.blob(g, wrist[0], wrist[1], 30, 26, INK.head, { seed: 932 });
  K.chalk(g, [[wrist[0] + ux * 18, wrist[1] + uy * 18], p], { w: 10, seed: 933, wob: 0.8, double: false });
  K.chalk(g, [[wrist[0] - uy * 22 + ux * 6, wrist[1] + ux * 22 + uy * 6], [wrist[0] - uy * 18 + ux * 30, wrist[1] + ux * 18 + uy * 30]], { w: 7, seed: 934, a: 0.8, double: false });
  K.lightPool(g, wrist[0], wrist[1], 200, ORANGE, 0.35);
}
// fingertip target just under a head (screen)
export const under = (h, c, s) => { const p = toScreen(c, h); return [p[0] + 4, p[1] + 70 * c.z * s]; };
// fog: soft grey banks drifting across the ground (k 0..1)
export function fog(g, t, k = 1) {
  if (k <= 0) return; g.save();
  for (let i = 0; i < 9; i++) {
    const r = rng(500 + i), y = HORIZON - 40 + r() * 520, w = 520 + r() * 620, h = 70 + r() * 90, sp = (14 + r() * 22) * (i % 2 ? 1 : -1);
    const x = ((r() * 2200 + t * sp) % 2200 + 2200) % 2200 - 560;
    g.save(); g.translate(x, y); g.scale(1, h / w);
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, w); grd.addColorStop(0, alpha('#b9b4a6', 0.13 * k)); grd.addColorStop(0.6, alpha('#b9b4a6', 0.05 * k)); grd.addColorStop(1, alpha('#b9b4a6', 0));
    g.fillStyle = grd; g.fillRect(-w, -w, w * 2, w * 2); g.restore();
  }
  g.restore();
}
export { K };
