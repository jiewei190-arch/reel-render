// kits/cozy/base.js — core of the Cozy 2D kit (palette, boiling shapes, camera, lighting, text, shot wrapper).
// Scenes import everything through /kits/cozy/cozy.js.
// Look: wobbly brown outlines with a 3-frame line boil, flat warm fills, soft grain, warm lamp light vs. deep-teal night.
// Deterministic only: every wobble is seeded by (seed, boil index); never Math.random / Date.now.
import { E, registerShot, clamp, lerp, prog, ease, key, rng, noise, alpha, mix, text, measure, radGrad, linGrad } from '/engine/core.js';
export { E, clamp, lerp, prog, ease, key, rng, noise, alpha, mix, text, measure, radGrad, linGrad };

// ======================================================================= palette
export const PAL = {
  line: '#5b3a29',      // warm brown outline
  lineSoft: '#8a6450',
  cream: '#fbefd9', cream2: '#f4e2c4', paper: '#fdf6ea',
  apricot: '#f6b07a', orange: '#f39a4c', orangeDk: '#d9742e',
  sage: '#a9c49a', sageDk: '#7fa383', sageLt: '#cfe0c0',
  pink: '#f5a3a3', blush: '#f58f95', rose: '#e9858c',
  wood: '#c88b5a', woodDk: '#a86d42', woodLt: '#dcaa78',
  wall: '#f1d9bc', wallDk: '#e2c19f', floor: '#d39a68',
  teal: '#1d4f5a', tealDk: '#0f3039', tealDeep: '#0a242c', tealLt: '#3b7480',
  lamp: '#ffd08a', lampHot: '#fff0c8', fridgeLight: '#fff4d6',
  moon: '#fff3cf', white: '#ffffff', ink: '#3b2519',
  cheese: '#ffc23d', cheeseDk: '#f0a020', yolk: '#ffcf3a', egg: '#fffaf0',
  ham: '#f4a0a6', hamDk: '#e07d86', scallion: '#7cc06a', scallionDk: '#4f9a4a',
  soy: '#6b3a1e', rice: '#fffaf0', riceGold: '#f3cf8e', sesame: '#f7ecd0',
  sweat: '#9fd8f0', heart: '#ff7d94', red: '#ff6a5a',
};
export const C = { now: 0, frame: 0, boilFps: 8, boilN: 3, lw: 6, wob: 1.7 };
// boil index: cycles through 3 drawings at 8 changes / s (classic 3-frame line boil)
export const boilI = () => Math.floor(C.now * C.boilFps + 1e-6) % C.boilN;

// ======================================================================= wobbly hand-drawn shapes
function subdiv(pts, step, closed) {
  const out = [], src = closed ? [...pts, pts[0]] : pts;
  for (let i = 0; i < src.length - 1; i++) {
    const [x0, y0] = src[i], [x1, y1] = src[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 0; k < n; k++) out.push([lerp(x0, x1, k / n), lerp(y0, y1, k / n)]);
  }
  if (!closed) out.push(src[src.length - 1]);
  return out;
}
function jitter(P, wob, seed) { const r = rng(seed * 7919 + boilI() * 1013 + 17); return P.map(([x, y]) => [x + (r() - 0.5) * 2 * wob, y + (r() - 0.5) * 2 * wob]); }
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
function pathClosed(g, P) { const n = P.length; g.beginPath(); let m = mid(P[n - 1], P[0]); g.moveTo(m[0], m[1]); for (let i = 0; i < n; i++) { const q = P[i], m2 = mid(P[i], P[(i + 1) % n]); g.quadraticCurveTo(q[0], q[1], m2[0], m2[1]); } g.closePath(); }
function pathOpen(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length - 1; i++) { const m = mid(P[i], P[i + 1]); g.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); } const l = P[P.length - 1]; g.lineTo(l[0], l[1]); }

// shape(g, pts, {fill, line, w, wob, seed, closed, a, step}) — filled polygon with a boiling outline. line:false = no outline
export function shape(g, pts, o = {}) {
  const { fill = null, line = PAL.line, w = C.lw, wob = C.wob, seed = 1, closed = true, a = 1, step = 36 } = o;
  if (a <= 0 || pts.length < 2) return;
  const P = jitter(subdiv(pts, step, closed), wob, seed);
  g.save(); g.globalAlpha *= a; g.lineJoin = 'round'; g.lineCap = 'round';
  closed ? pathClosed(g, P) : pathOpen(g, P);
  if (fill && closed) { g.fillStyle = fill; g.fill(); }
  if (line && w > 0) { g.strokeStyle = line; g.lineWidth = w; g.stroke(); }
  g.restore();
}
// ellipse points (rot in radians)
export function ovalPts(cx, cy, rx, ry, rot = 0, n = null) {
  n = n || Math.round(clamp((rx + ry) / 5, 12, 44)); const c = Math.cos(rot), s = Math.sin(rot), P = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; P.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return P;
}
export const oval = (g, cx, cy, rx, ry, o = {}) => shape(g, ovalPts(cx, cy, rx, ry, o.rot || 0), { step: 1e9, ...o });
export const dot = (g, cx, cy, r, fill, o = {}) => oval(g, cx, cy, r, r, { fill, line: false, ...o });
// rounded rectangle
export function rboxPts(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const P = [], arc = (cx, cy, a0) => { for (let k = 0; k <= 3; k++) { const a = a0 + (k / 3) * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI); return P;
}
export const rbox = (g, x, y, w, h, r, o = {}) => shape(g, rboxPts(x, y, w, h, r), { step: 40, ...o });
// open wobbly line
export const wline = (g, pts, o = {}) => shape(g, pts, { closed: false, fill: null, ...o });
// thick outlined stroke (tails, straws, steam, noodles): brown outline around a coloured core
export function tube(g, pts, width, fill, o = {}) {
  const { line = PAL.line, lw = C.lw, wob = C.wob, seed = 5, a = 1, step = 30 } = o;
  const P = jitter(subdiv(pts, step, false), wob, seed);
  g.save(); g.globalAlpha *= a; g.lineJoin = 'round'; g.lineCap = 'round';
  if (line) { pathOpen(g, P); g.strokeStyle = line; g.lineWidth = width + lw * 2; g.stroke(); }
  pathOpen(g, P); g.strokeStyle = fill; g.lineWidth = width; g.stroke(); g.restore();
}
// smooth curve through control points (Catmull-Rom sampled) -> points for tube/wline
export function curve(ctrl, n = 24) {
  const P = [], get = i => ctrl[clamp(i, 0, ctrl.length - 1)];
  for (let s = 0; s < ctrl.length - 1; s++) for (let k = 0; k < n; k++) {
    const u = k / n, p0 = get(s - 1), p1 = get(s), p2 = get(s + 1), p3 = get(s + 2);
    const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    P.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  P.push(ctrl[ctrl.length - 1]); return P;
}
export function heartPts(cx, cy, s) { const P = []; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); P.push([cx + x * s / 16, cy + y * s / 16]); } return P; }
export const heart = (g, cx, cy, s, fill = PAL.heart, o = {}) => shape(g, heartPts(cx, cy, s), { fill, step: 1e9, ...o });
export function starPts(cx, cy, r, inner = 0.42, n = 4, rot = 0) { const P = []; for (let i = 0; i < n * 2; i++) { const a = rot - Math.PI / 2 + (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * inner : r; P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return P; }
export const sparkle = (g, cx, cy, r, fill = PAL.white, o = {}) => shape(g, starPts(cx, cy, r, 0.3, 4, o.rot || 0), { fill, step: 1e9, w: C.lw * 0.6, ...o });

// local drawing space: draw at (x,y) with scale s (flip = -1 mirrors); line width and wobble stay constant on screen
export function at(g, x, y, s, fn, o = {}) {
  const { flip = 1, rot = 0 } = o; const lw = C.lw, wb = C.wob;
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(s * flip, s); C.lw = lw / s; C.wob = wb / s;
  try { fn(g); } finally { C.lw = lw; C.wob = wb; g.restore(); }
}

// ======================================================================= camera
// cam(g, {z, x, y, r}) : zoom z around focus (x,y) which is moved to the stage centre * (1-follow).  Use inside a shot:
//   K.camera(g, {z: K.lerp(1, 1.15, p), fx: 540, fy: 1000});   fx/fy = point that stays put on screen
export function camera(g, { z = 1, fx = E.W / 2, fy = E.H / 2, dx = 0, dy = 0, r = 0 } = {}) {
  g.translate(fx + dx, fy + dy); if (r) g.rotate(r); g.scale(z, z); g.translate(-fx, -fy);
}
// gentle handheld float [dx, dy]
export const float = (amt = 5, speed = 0.3, seed = 4) => [noise(C.now * speed, seed) * amt, noise(C.now * speed, seed + 7) * amt];
// slow push-in helper: returns zoom for local time t over dur
export const push = (t, dur, z0 = 1, z1 = 1.08) => lerp(z0, z1, ease.sine(t / dur));
// quick pop-in scale (0 -> overshoot -> 1)
export const popIn = (t, t0, d = 0.35) => ease.outBack(prog(t, t0, t0 + d));
export const bounce = (t, t0, d = 0.5, amp = 0.12) => { const k = prog(t, t0, t0 + d); return k <= 0 || k >= 1 ? 0 : Math.sin(k * Math.PI) * amp * (1 - k); };

// ======================================================================= lighting
let _mask = null;
function maskCanvas() { const w = Math.round(E.W * E.PX), h = Math.round(E.H * E.PX); if (!_mask || _mask.width !== w || _mask.height !== h) { _mask = document.createElement('canvas'); _mask.width = w; _mask.height = h; } return _mask; }
// night(g, amt, lights): deep-teal night multiply over everything drawn so far, with holes for light sources.
//   lights: [{x, y, r, k (0..1 how much the hole clears), color (warm glow added on top), glow (0..1)}]
//   Coordinates are in the CURRENT drawing space (camera included).
export function night(g, amt = 0.85, lights = [], o = {}) {
  const { tint = '#2a6270', haze = 0.10 } = o;
  const c = maskCanvas(), x = c.getContext('2d'), m = g.getTransform();
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, c.width, c.height);
  x.fillStyle = alpha(tint, 1); x.fillRect(0, 0, c.width, c.height);
  x.setTransform(m); x.globalCompositeOperation = 'source-over';
  for (const l of lights) { const k = l.k ?? 0.9; x.fillStyle = radGrad(x, l.x, l.y, 0, l.r, [[0, alpha('#ffffff', k)], [0.45, alpha('#ffffff', k * 0.55)], [1, alpha('#ffffff', 0)]]); x.beginPath(); x.arc(l.x, l.y, l.r, 0, Math.PI * 2); x.fill(); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = amt; g.globalCompositeOperation = 'multiply'; g.drawImage(c, 0, 0);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = haze * amt; g.fillStyle = PAL.tealLt; g.fillRect(0, 0, c.width, c.height); g.restore();
  for (const l of lights) if (l.color) warmGlow(g, l.x, l.y, l.gr || l.r * 0.7, l.color, l.glow ?? 0.35);
}
export function warmGlow(g, x, y, r, color = PAL.lamp, k = 0.4) {
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = radGrad(g, x, y, 0, r, [[0, alpha(color, k)], [0.4, alpha(color, k * 0.4)], [1, alpha(color, 0)]]); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
}
// soft light cone (fridge door, lamp): from apex (x,y) spreading to width w at distance len, angle ang (0 = down)
export function cone(g, x, y, len, w0, w1, ang, color = PAL.fridgeLight, k = 0.35) {
  g.save(); g.translate(x, y); g.rotate(ang); g.globalCompositeOperation = 'screen';
  g.fillStyle = linGrad(g, 0, 0, 0, len, [alpha(color, k), alpha(color, k * 0.35), alpha(color, 0)]);
  g.beginPath(); g.moveTo(-w0 / 2, 0); g.lineTo(w0 / 2, 0); g.lineTo(w1 / 2, len); g.lineTo(-w1 / 2, len); g.closePath(); g.fill(); g.restore();
}
// paper vignette in warm brown (softer than the black player vignette)
export function warmVignette(g, k = 0.35, color = '#6b3f26') {
  g.save(); g.fillStyle = radGrad(g, E.W / 2, E.H * 0.52, E.W * 0.38, E.H * 0.72, [[0, alpha(color, 0)], [1, alpha(color, k)]]); g.fillRect(0, 0, E.W, E.H); g.restore();
}
// fine paper speckle (static per boil frame, so it boils with the lines)
export function paper(g, k = 0.05) {
  const r = rng(99 + boilI() * 7); g.save(); g.globalAlpha = k;
  for (let i = 0; i < 260; i++) { const x = r() * E.W, y = r() * E.H, s = 1 + r() * 2.4; g.fillStyle = r() < 0.5 ? '#7a5238' : '#ffffff'; g.fillRect(x, y, s, s); }
  g.restore();
}

// ======================================================================= text
export const FONT = 'Fredoka';
// top caption: rounded bold white with a soft brown outline. Pinned the whole video by cozyShot (config.cozyCaption).
export function topCaption(g, lines, o = {}) {
  const { x = 500, y = 215, size = 86, gap = 1.12, color = PAL.white, outline = '#6b4128', a = 1, scale = 1 } = o;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(scale, scale);
  lines.forEach((s, i) => {
    const yy = i * size * gap; g.font = `700 ${size}px "${FONT}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.save(); g.shadowColor = 'rgba(60,30,15,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6; g.lineWidth = size * 0.2; g.strokeStyle = outline; g.strokeText(s, 0, yy); g.restore();
    g.lineWidth = size * 0.2; g.strokeStyle = outline; g.strokeText(s, 0, yy); g.fillStyle = color; g.fillText(s, 0, yy);
  });
  g.restore();
}
// tiny ingredient label: cream pill with brown outline, pops in at t0
export function label(g, str, x, y, t, t0, o = {}) {
  const { size = 40, dur = 99, fill = PAL.cream, color = PAL.line, rot = -0.04 } = o;
  const k = popIn(t, t0, 0.3), out = 1 - prog(t, t0 + dur, t0 + dur + 0.25); if (k <= 0 || out <= 0) return;
  const w = measure(g, str, size, FONT, 700) + size * 1.1, h = size * 1.5;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k * out, k * out);
  rbox(g, -w / 2, -h / 2, w, h, h / 2, { fill, w: 5, seed: str.length });
  text(g, str, 0, 2, { size, font: FONT, weight: 700, color }); g.restore();
}
// "!" pop / "?" / "♪" bubble above a head
export function pop(g, x, y, k, str = '!', o = {}) {
  if (k <= 0) return; const { size = 120, fill = PAL.white, color = PAL.orangeDk } = o;
  g.save(); g.translate(x, y); g.scale(k, k);
  shape(g, starPts(0, 0, size * 0.72, 0.78, 10, 0.2), { fill, w: 6, step: 1e9, seed: 41 });
  text(g, str, 0, size * 0.04, { size, font: FONT, weight: 700, color, stroke: 0 }); g.restore();
}
// floating Z's (sleep)
export function zzz(g, x, y, t, o = {}) {
  const { n = 3, size = 54, color = PAL.cream, period = 2.4 } = o;
  for (let i = 0; i < n; i++) {
    const ph = ((t / period + i / n) % 1), a = Math.sin(ph * Math.PI);
    text(g, 'z', x + ph * 70 + Math.sin(ph * 6 + i) * 10, y - ph * 150, { size: size * (0.6 + ph * 0.7), font: FONT, weight: 700, color, alpha: a, stroke: 7, strokeColor: alpha(PAL.line, 0.8) });
  }
}
export function hearts(g, x, y, t, o = {}) {
  const { n = 4, size = 34, spread = 140, period = 1.6, t0 = 0 } = o; if (t < t0) return;
  for (let i = 0; i < n; i++) { const ph = (((t - t0) / period + i / n) % 1), a = Math.sin(ph * Math.PI); heart(g, x + (i - (n - 1) / 2) * spread / n + Math.sin(ph * 5 + i * 2) * 14, y - ph * 170, size * (0.6 + 0.5 * a), PAL.heart, { a, w: 4, seed: i + 3 }); }
}
export function sparkles(g, x, y, t, o = {}) {
  const { n = 5, r = 150, size = 26, seed = 3, rate = 1.3 } = o; const R = rng(seed);
  for (let i = 0; i < n; i++) { const ang = R() * Math.PI * 2, d = r * (0.5 + R() * 0.5), ph = (t * rate + R()) % 1; const s = Math.sin(ph * Math.PI); sparkle(g, x + Math.cos(ang) * d, y + Math.sin(ang) * d, size * s, PAL.white, { w: 3.5, a: s, rot: ph }); }
}
export function sweat(g, x, y, s = 1, o = {}) {
  const P = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const r = 1 - 0.55 * Math.max(0, -Math.sin(a)); P.push([x + Math.cos(a) * 18 * s * r, y + Math.sin(a) * 24 * s - (Math.sin(a) < -0.6 ? (Math.sin(a) + 0.6) * 30 * s : 0)]); }
  shape(g, P, { fill: PAL.sweat, step: 1e9, w: 4, seed: 9, ...o }); dot(g, x - 6 * s, y + 4 * s, 4.5 * s, '#ffffff');
}
// little growl squiggle lines next to a tummy
export function squiggle(g, x, y, t, o = {}) {
  const { n = 3, len = 70, a = 1 } = o;
  for (let i = 0; i < n; i++) { const P = []; for (let k = 0; k <= 8; k++) P.push([x + k * len / 8, y + (i - 1) * 34 + Math.sin(k * 2 + t * 30 + i) * 8]); wline(g, P, { w: 5, a, seed: i + 30 }); }
}
// motion / speed lines
export function speedLines(g, x, y, ang, n = 3, len = 60, o = {}) { for (let i = 0; i < n; i++) { const off = (i - (n - 1) / 2) * 26; const cx = x + Math.cos(ang + Math.PI / 2) * off, cy = y + Math.sin(ang + Math.PI / 2) * off; wline(g, [[cx, cy], [cx + Math.cos(ang) * len, cy + Math.sin(ang) * len]], { w: 5, seed: i + 50, ...o }); } }

// ======================================================================= shot wrapper
const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).has('debug');
// cozyShot(id, draw, {caption:true, vignette:0.3, paper:true, bg})
//   Sets C.now/C.frame, fills bg, runs draw(g, t, info) (scene + camera inside), then warm vignette, paper speckle and the pinned
//   top caption from config.json "cozyCaption": {"lines": [...], "x", "y", "size"}. Debug (?debug=1) shades the Instagram UI zones.
export function cozyShot(id, draw, o = {}) {
  registerShot(id, {
    draw(g, t, info) {
      C.now = info.globalT; C.frame = Math.round(info.globalT * E.fps);
      g.fillStyle = o.bg || PAL.cream; g.fillRect(0, 0, E.W, E.H);
      g.save(); draw(g, t, info); g.restore();
      if (o.vignette !== false) warmVignette(g, o.vignette ?? 0.3);
      if (o.paper !== false) paper(g, 0.05);
      const cap = E.cfg.cozyCaption; if (cap && o.caption !== false && info.shot.caption !== false) topCaption(g, cap.lines, cap);
      if (DEBUG) uiZones(g);
    },
  });
}
export function uiZones(g) {
  g.save(); g.fillStyle = 'rgba(255,0,80,.18)'; g.fillRect(0, E.H * 0.8, E.W, E.H * 0.2); g.fillRect(E.W * 0.85, 0, E.W * 0.15, E.H * 0.8);
  g.strokeStyle = 'rgba(255,0,80,.7)'; g.lineWidth = 3; g.strokeRect(0, 0, E.W * 0.85, E.H * 0.8); g.restore();
}
