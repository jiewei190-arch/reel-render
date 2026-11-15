// kit_celboil.js — the cel-boil demo's animation language (from styles/celboil/js/scene.js), packaged for reels.
// Every reel in this style imports it so the motion matches the demo:
//   - exposure sheet: drawings held on twos (2), ones (1) or threes (3), like the demo's SCHED
//   - a new boil per drawing: every character re-rolls its seed each drawing; static things cycle four boils
//   - camera shake (decaying, on the ones clock) and shot push-ins, with the pen weight and boil amplitude
//     following the zoom so lines read "drawn at the same size"
//   - off-register colour (REG): fills sit a few pixels off the ink
//   - paper tooth and graphite dust placed per drawing: every cel is a new sheet
//   - FX vocabulary: sparks, cloud puffs, radial speed lines, stars, glyph titles boiled per drawing
// The demo was drawn at 1920 wide; reels are 1080 wide, so pen widths, boil amplitude, noise scale and REG scale by U.
import {
  PAL, GLOBAL, N3, hs, lerp, clamp, inv, sstep, E, spline, resample, xf, circlePts, boil,
  polyPath, fillPoly, inkStroke, inkLoop, fillShape, hatch, Layers, blit, arclen,
} from './styles/celboil/js/engine.js';
export { PAL, GLOBAL, hs, lerp, clamp, inv, sstep, E, spline, resample, xf, circlePts, boil, polyPath, fillPoly, inkStroke, inkLoop, fillShape, hatch, blit, arclen };

export const FPS = 24;                 // the demo's animation clock
export const W = 1080, H = 1920;       // reel frame (portrait)
export const U = W / 1920;             // demo units -> reel pixels
export const REG = { dx: -5, dy: 4 };  // colour-to-line registration offset (demo units)

let IMG = { paper: null, tooth: null, dust: [] };
let LY = null;
let FONT = null;
export function setImages(im) { IMG = im; }
export function setFont(font) { FONT = font; }
export function initLayers(dpr = 1) { LY = new Layers(W, H, dpr); }

// ------------------------------------------------------------ exposure sheet
// step: 2 = on twos, 1 = on ones, 3 = on threes. `base` keeps drawing ids unique per scene.
export function drawingAt(t, step = 2, base = 0) {
  const f = Math.floor(t * FPS + 1e-6);
  const k = Math.floor(f / step);
  return { f, step, id: base + k, fq: k * step, tq: (k * step) / FPS, t1: f / FPS };
}
// static things cycle through four boils (three on the hold), as in the demo's bv()
export const bv = (D) => (D.step === 3 ? D.id % 3 : D.id % 4);
// characters re-boil on every drawing; backgrounds take the four-boil loop
export const seedFor = (D, j = 0) => 500 + D.id + j * 13;
export const seedBg = (D, j = 0) => 100 + bv(D) * 7 + j * 13;

// ------------------------------------------------------------ camera and shots
// shakes: [{ t0, dur, amp }] in seconds on the on-ones clock; amp in demo units (decays with a squared ease)
export function camera(t1, shakes = []) {
  const f = Math.round(t1 * FPS);
  let x = 0, y = 0;
  shakes.forEach((s, j) => {
    if (t1 >= s.t0 && t1 < s.t0 + s.dur) {
      const a = s.amp * U * Math.pow(1 - (t1 - s.t0) / s.dur, 2);
      x += (hs(f, 1 + 4 * j) - 0.5) * 2 * a;
      y += (hs(f, 2 + 4 * j) - 0.5) * 2 * a;
    }
  });
  return { x, y };
}
export const STAGE = { s: 1, px: W / 2, py: H / 2, X: W / 2, Y: H / 2 };
export function applyShot(c, S) { c.translate(S.X, S.Y); c.scale(S.s, S.s); c.translate(-S.px, -S.py); }
// the demo thins ink and boil as a shot pushes in, so the pen reads the same size at every zoom
export function zoomWeight(S) {
  const zr = Math.min(1, STAGE.s / S.s);
  GLOBAL.ink = 0.2 + 0.8 * zr;
  GLOBAL.amp = 0.2 + 0.8 * zr;
}
export function resetWeight() { GLOBAL.ink = 1; GLOBAL.amp = 1; }

// ------------------------------------------------------------ paper, tooth, dust
export function drawPaper(c, cam) { // paper sheet scaled 4.5% so the camera has room to move
  const s = 1.045;
  c.drawImage(IMG.paper, cam.x + (W - W * s) / 2, cam.y + (H - H * s) / 2, W * s, H * s);
}
// multiply pass of the paper tooth plus dust specks, re-placed for every drawing (screen space)
export function drawTooth(c, D) {
  const v = bv(D);
  const k = (H / 1400) * 1.15;           // tooth is 2400x1400: cover the frame height with room to shift
  const tw = 2400 * k, th = 1400 * k;
  const ox = -hs(v, 51) * (tw - W), oy = -hs(v, 52) * (th - H);
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'multiply';
  c.globalAlpha = 0.5;
  c.drawImage(IMG.tooth, ox, oy, tw, th);
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = 0.22;
  const dw = (1920 / 1080) * H;          // dust sheet is 16:9: cover the height, centred
  c.translate(W / 2, H / 2);
  c.scale(v % 2 ? -1 : 1, v % 3 ? 1 : -1);
  c.drawImage(IMG.dust[v % 4], -dw / 2, -H / 2, dw, H);
  c.restore();
}

// ------------------------------------------------------------ pen and colour
// demo units in, reel pixels out
const up = (o, def) => {
  const r = { ...def, ...o };
  if (r.w != null) r.w *= U;
  r.amp = (r.amp ?? 2.2) * U;
  r.scale = (r.scale ?? 70) * U;
  return r;
};
export function ink(c, P, o = {}) { return inkStroke(c, P, up(o, { w: 6 })); }             // open ink line
export function loopInk(c, P, o = {}) { return inkLoop(c, P, up(o, { w: 6, splits: 1 })); } // closed ink outline
export function paint(c, P, color, o = {}) {                                                 // flat cel fill, off-register
  const r = up(o, {});
  if (o.reg !== false) { r.dx = REG.dx * U; r.dy = REG.dy * U; }
  return fillShape(c, P, color, r);
}
export function hatchInk(c, clip, o = {}) { // hand shading inside a clip polygon
  return hatch(c, clip, { ...o, gap: (o.gap ?? 14) * U, w: (o.w ?? 2.2) * U, amp: (o.amp ?? 1.6) * U });
}

// ------------------------------------------------------------ FX vocabulary
// teardrop spark oriented along (vx, vy)
export function spark(c, x, y, vx, vy, size, seed, o = {}) {
  size *= U;
  const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp;
  const len = size * (1.4 + Math.min(5, sp / 450));
  const r = size * 0.55;
  const P = [[r, 0], [r * 0.7, r * 0.72], [0, r], [-len, 0, 1], [0, -r], [r * 0.7, -r * 0.72]];
  const d = spline(xf(P, { x, y, r: Math.atan2(uy, ux) }), true, 3);
  fillShape(c, d, o.fill ?? PAL.yel, { seed, amp: 1.2 * U, scale: 70 * U, dx: REG.dx * 0.5 * U, dy: REG.dy * 0.5 * U });
  inkLoop(c, d, { seed, w: Math.max(2.2 * U, size * 0.16), amp: U, scale: 70 * U, t0: 3, t1: 10, heavy: 0.2 });
}
// star burst (outline + fill), R in reel pixels
export function star(c, x, y, R, seed, o = {}) {
  const P = spline(xf(starPts(o.n ?? 10, R, R * 0.45, seed, o.rot ?? 0, 0.3), { x, y }), true, 4);
  paint(c, P, o.fill ?? PAL.yel, { seed, amp: 1.5 });
  loopInk(c, P, { seed, w: 6, amp: 1.5 });
}
function starPts(n, rOut, rIn, seed, rot = 0, jit = 0.25) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2 + (hs(seed, i, 1) - 0.5) * (Math.PI / n) * 0.6;
    const ro = rOut * (1 - jit + jit * 2 * hs(seed, i, 2));
    P.push([Math.cos(a) * ro, Math.sin(a) * ro, 1]);
    const b = a + Math.PI / n + (hs(seed, i, 3) - 0.5) * (Math.PI / n) * 0.3;
    const ri = rIn * (0.85 + 0.3 * hs(seed, i, 4));
    P.push([Math.cos(b) * ri, Math.sin(b) * ri]);
  }
  return P;
}
// radial speed lines (r0, r1 in reel pixels)
export function speedLines(c, cx, cy, r0, r1, n, seed, w = 7, dir = 1) {
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + hs(seed, k) * 0.5;
    const a0 = r0 * (0.9 + 0.3 * hs(seed, k, 2)), a1 = r1 * (0.8 + 0.4 * hs(seed, k, 3));
    const P = [[cx + Math.cos(a) * a0, cy + Math.sin(a) * a0], [cx + Math.cos(a) * a1, cy + Math.sin(a) * a1]];
    inkStroke(c, dir > 0 ? P : P.reverse(), {
      seed: seed * 7 + k, w: w * U * (0.6 + 0.8 * hs(seed, k, 4)), t0: 12, t1: 90, min: 0.05,
      amp: 1.5 * U, scale: 70 * U, heavy: 0,
    });
  }
}
// one cloud puff: union of circles with one boiling ink outline (drawn through the layer buffer)
export function puff(c, x, y, r, seed, o = {}) {
  const n = o.n ?? 4, cs = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hs(seed, i) * 1.2;
    const d = i === 0 ? 0 : r * 0.55;
    cs.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.7, r: r * (i === 0 ? 0.8 : 0.5 + 0.25 * hs(seed, i, 2)) });
  }
  cloud(c, cs, seed, o);
}
function cloud(c, cs, seed, o = {}) {
  const fill = o.fill ?? PAL.hi, w = (o.w ?? 6) * U, amp = 1.8 * U, scale = 60 * U;
  const L = LY.get(0);
  L.save(); L.setTransform(c.getTransform());
  L.fillStyle = PAL.ink;
  cs.forEach((q, k) => {
    if (q.r < 1) return;
    const P = circlePts(0, 0, 1, Math.max(12, Math.round(q.r / 3))).map(([ca, sa]) => {
      const a = Math.atan2(sa, ca);
      const ww = w * (0.75 + 0.55 * Math.max(0, Math.cos(a - 0.9)) + 0.25 * N3(ca * 2, sa * 2, seed + k));
      return [q.x + ca * (q.r + ww * 0.5), q.y + sa * (q.r + ww * 0.5)];
    });
    L.beginPath(); polyPath(L, boil(P, seed + k * 7, amp, scale)); L.fill();
  });
  cs.forEach((q, k) => {
    if (q.r >= 1) paint(c, circlePts(q.x, q.y, q.r, Math.max(12, Math.round(q.r / 3))), fill, { seed: seed + k * 7 + 3, amp: 1.8 });
  });
  L.globalCompositeOperation = 'destination-out';
  cs.forEach((q, k) => {
    if (q.r >= 1) {
      L.beginPath();
      polyPath(L, boil(circlePts(q.x, q.y, Math.max(1, q.r - w * 0.5), Math.max(12, Math.round(q.r / 3))), seed + k * 7, amp, scale));
      L.fill();
    }
  });
  L.globalCompositeOperation = 'source-over';
  L.restore();
  blit(c, L);
}

// ------------------------------------------------------------ titles written as boiled glyph outlines
function glyphPolys(font, text, size, tracking) {
  const polys = [];
  let x = 0;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    const path = g.getPath(x, 0, size);
    let cur = [], lx = 0, ly = 0;
    for (const cmd of path.commands) {
      if (cmd.type === 'M') { if (cur.length > 2) polys.push(cur); cur = [[cmd.x, cmd.y]]; lx = cmd.x; ly = cmd.y; }
      else if (cmd.type === 'L') { cur.push([cmd.x, cmd.y]); lx = cmd.x; ly = cmd.y; }
      else if (cmd.type === 'Q') { for (let k = 1; k <= 6; k++) { const u = k / 6, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), cc = u * u; cur.push([a * lx + b * cmd.x1 + cc * cmd.x, a * ly + b * cmd.y1 + cc * cmd.y]); } lx = cmd.x; ly = cmd.y; }
      else if (cmd.type === 'C') { for (let k = 1; k <= 8; k++) { const u = k / 8, a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, cc = 3 * u * u * (1 - u), d = u ** 3; cur.push([a * lx + b * cmd.x1 + cc * cmd.x2 + d * cmd.x, a * ly + b * cmd.y1 + cc * cmd.y2 + d * cmd.y]); } lx = cmd.x; ly = cmd.y; }
      else if (cmd.type === 'Z') { if (cur.length > 2) polys.push(cur); cur = []; }
    }
    if (cur.length > 2) polys.push(cur);
    x += g.advanceWidth * (size / font.unitsPerEm) + tracking;
  }
  return { polys, width: x - tracking };
}
const GCACHE = new Map();
// centred title, `size` in reel pixels; every contour re-boils per drawing and sits off-register like the demo's colour
export function title(c, str, cx, cy, size, color, o = {}) {
  if (!FONT) return;
  const key = `${str}|${size}`;
  let g = GCACHE.get(key);
  if (!g) { g = glyphPolys(FONT, str, size, 0.02 * size); GCACHE.set(key, g); }
  const seed = o.seed ?? 900;
  const x0 = cx - g.width / 2, y0 = cy + size * 0.36;
  const pts = g.polys.map((p) => p.map(([x, y]) => [x0 + x, y0 + y]));
  c.save();
  c.beginPath();
  pts.forEach((p, i) => {
    const b = boil(resample(p, 3, true), seed + i * 0.7 + 0.5, 2.2 * U, 70 * U);
    polyPath(c, b.map(([x, y]) => [x + REG.dx * U, y + REG.dy * U]), true);
  });
  c.fillStyle = color;
  c.fill('nonzero');
  c.restore();
  pts.forEach((p, i) => loopInk(c, resample(p, 3, true), { seed: seed + i * 5 + 2, w: o.w ?? 9, amp: 1.6, splits: 2 }));
}
