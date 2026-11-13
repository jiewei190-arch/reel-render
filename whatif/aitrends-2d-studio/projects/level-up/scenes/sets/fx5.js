// sets/fx5.js — ep 5 "What If You Could Level Up Your Strength Every Day?" EFFECTS + GRADE (the art-upgrade look, STYLE.md sections 3, 5, 8, 9).
// Our own effects: cyan power glow, gold level-up, ink-navy night (never pure black), violet only as a faint rim. Nothing copied from any series.
//
// PALETTE
//   P5 = { ink, navy, deep, cyan, cyan2, glass, gold, goldHi, coral, violet, sodium }   the STYLE.md hexes
// SCREEN PASSES (call after the frame is drawn; they read the canvas)
//   bloom(g, { threshold: 0..1 (0.62), strength: 0..2 (0.8), radius: px (22), tint })   bright areas bleed light (streetlights, the card, phones)
//   nightGrade(g, { k: 0..1, vignette: 0..1, violet: 0..1, cool: 0..1 })   ink-navy night: cool multiply, navy vignette, faint violet backlight,
//       then a 'lighten' floor of P5.ink so nothing is ever pure black. Use LAST (after bloom).
//   heatHaze(g, t, x, y, w, h, { amp, freq })   heat shimmer: re-draws a region of the canvas in wobbling strips (around a hot hero's outline)
// LAYER HELPERS (draw a figure/prop through them)
//   glowDraw(g, fn, { color, blur, strength })   draws fn, plus a blurred additive copy behind it (halation on HUD edges, the Zip, text)
//   rimLight(g, fn, { dir: [x, y] toward the key, color: cyan, width, a, back: { color: violet, width, a } | false, blur })
//       draws fn, then a rim on the silhouette edge that faces `dir` (cyan), and a faint violet rim on the far side. fn(g2) must draw only the figure.
//   trail(g, t, drawAt, { n, dt, a, tint, blend })   motion streaks: drawAt(g2, tt) is called for earlier times tt = t - i*dt as fading,
//       tinted ghosts behind the live frame (slow-mo smears). Then drawAt(g, t) on top.
// TIME
//   slowMo(t, { at, dur, factor })   time remap: normal before `at`, factor (0.25) speed for `dur` seconds, then normal again (continuous)
//   freeze(t, at, frames = 5)       holds t at `at` for N frames (the level-up freeze), then continues from `at`
//   hitShake(t, at, { amp: 3, dur: 0.25 }) -> [dx, dy]   a short decaying camera shake (2-3 px on the level-up)
// FLASHES
//   smashFlash(g, t, at, { color: goldHi, a: 0.7, dur: 0.18 })   the white-gold flash frame (fast decay)
//   impactFrame(g, t, at, { x, y, frames: 3, color })   a 2-3 frame stark impact: the frame drops to ink, cut by radial white-gold/cyan spikes at (x, y)
// GROUND
//   groundCrack(g, t, x, y, { k: 0..1, s, seed, color, glow: 0..1, flat: 0.32 })   radial branching cracks on the ground plane + chips
//   soilSink(g, t, x, y, { k: 0..1 (depth), w, s, seed }) -> { dy }   the lawn gives way: dark soil hole + clods (draw BEFORE the feet);
//   soilLip(g, t, x, y, { k, w, s, seed })   the raised turf lip in front of the ankles (draw AFTER the feet)
//   tileCrack(g, t, x, y, { k: 0..1, cols, rows, tw, th, seed, tile, grout })   a perspective patch of patio tiles cracking from (x, y)
//   dustBurst(g, t, at, x, y, { s, color, count, dir })   a ring of dust puffs kicked out along the ground, settling
// LINES + CAMERA
//   speedLines5(g, t, { mode: 'focus'|'streak', cx, cy, color, a, count, inner, angle, seed })   tapered anime focus lines around a clear
//       centre (never across a person: keep `inner` wider than the figure), or parallel streaks along `angle`
//   lowAngle(t, dur, { z: [a, b], lift, roll, x }) -> cam   a camera looking up at the hero (the world drops by `lift`, slow push-in);
//   lowAngleWrap(g, k, gy, fn)   stretches everything above gy upward by up to 9% (the foreshortened "look up" feel), anchored at the ground
// All deterministic (t, rng, noise). Works at any E.PX.
import { E, clamp, lerp, ease, prog, rng, noise, seg, circle, poly, glow, alpha, mix, shade, radGrad, linGrad } from '/engine/core.js';

export const P5 = { ink: '#0B0F1A', navy: '#141B2D', deep: '#05070C', cyan: '#3FE0FF', cyan2: '#1A9FD6', glass: '#123A5E', gold: '#FFC93C', goldHi: '#FFF3C4', coral: '#FF6B5B', violet: '#7B5CFF', sodium: '#FF9F43' };

// ---------- offscreen canvas pool (same size as the frame buffer) ----------
const POOL = [];
function grab(w, h) { let c = POOL.find((b) => !b.busy && b.width === w && b.height === h); if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; POOL.push(c); } c.busy = true; const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, h); return [c, x]; }
const free = (...cs) => cs.forEach((c) => { c.busy = false; });
const full = (g) => [g.canvas.width, g.canvas.height];
function capture(g, fn) { const [w, h] = full(g), [c, x] = grab(w, h); x.setTransform(g.getTransform()); fn(x); x.setTransform(1, 0, 0, 1, 0, 0); return c; }
function blit(g, c, op = 'source-over', a = 1, filter = 'none') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = op; g.globalAlpha *= a; g.filter = filter; g.drawImage(c, 0, 0, g.canvas.width, g.canvas.height); g.restore(); }

// =====================================================================================================
// SCREEN PASSES
// =====================================================================================================
export function bloom(g, o = {}) {
  const th = clamp(o.threshold ?? 0.62, 0, 0.95), st = o.strength ?? 0.8, rad = o.radius ?? 22; if (st <= 0) return;
  const [w, h] = full(g), k = 0.25, sw = Math.max(8, Math.round(w * k)), sh = Math.max(8, Math.round(h * k));
  const b = 1 / (1 + th), c = 0.5 / (b - 0.5);                                      // brightness then contrast maps `th` -> 0 and 1 -> 1
  const [a, ax] = grab(sw, sh), [bb, bx] = grab(sw, sh);
  ax.filter = `brightness(${b.toFixed(3)}) contrast(${c.toFixed(3)}) saturate(1.25)`; ax.drawImage(g.canvas, 0, 0, sw, sh); ax.filter = 'none';
  if (o.tint) { ax.globalCompositeOperation = 'multiply'; ax.fillStyle = o.tint; ax.fillRect(0, 0, sw, sh); ax.globalCompositeOperation = 'source-over'; }
  bx.filter = `blur(${Math.max(1, rad * k * E.PX)}px)`; bx.drawImage(a, 0, 0); bx.filter = `blur(${Math.max(1, rad * k * E.PX * 3)}px)`; bx.globalAlpha = 0.6; bx.drawImage(a, 0, 0); bx.globalAlpha = 1; bx.filter = 'none';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(st, 0, 2) * 0.5; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(bb, 0, 0, w, h); if (st > 1) g.drawImage(bb, 0, 0, w, h); g.restore();
  free(a, bb);
}
export function nightGrade(g, o = {}) {
  const k = clamp(o.k ?? 1), vg = clamp(o.vignette ?? 0.6), vi = clamp(o.violet ?? 0.35), cool = clamp(o.cool ?? 0.6); if (k <= 0) return;
  g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  if (cool > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = alpha(mix('#ffffff', '#7f93c8', cool), k); g.fillRect(0, 0, E.W, E.H); }
  if (vg > 0) { g.globalCompositeOperation = 'source-over'; g.fillStyle = radGrad(g, E.W / 2, E.H * 0.48, E.H * 0.35, E.H * 1.05, [alpha(P5.navy, 0), alpha(P5.navy, 0.45 * vg * k), alpha(P5.deep, 0.75 * vg * k)]); g.fillRect(0, 0, E.W, E.H); }
  if (vi > 0) { g.globalCompositeOperation = 'screen'; g.fillStyle = radGrad(g, E.W * 0.92, E.H * 0.05, 0, E.H * 0.9, [alpha(P5.violet, 0.16 * vi * k), alpha(P5.violet, 0)]); g.fillRect(0, 0, E.W, E.H); }
  g.globalCompositeOperation = 'lighten'; g.fillStyle = alpha(P5.ink, k); g.fillRect(0, 0, E.W, E.H);            // the floor: never pure black
  g.restore();
}
export function heatHaze(g, t, x, y, w, h, o = {}) {
  const amp = o.amp ?? 3, fq = o.freq ?? 0.045, [W, H] = full(g), px = E.PX, rx = Math.max(0, Math.floor(x * px)), ry = Math.max(0, Math.floor(y * px)), rw = Math.min(W - rx, Math.ceil(w * px)), rh = Math.min(H - ry, Math.ceil(h * px)); if (rw < 2 || rh < 2) return;
  const [c, cx] = grab(W, H); cx.drawImage(g.canvas, rx, ry, rw, rh, rx, ry, rw, rh);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const step = Math.max(2, Math.round(3 * px));
  for (let yy = 0; yy < rh; yy += step) { const u = yy / rh, edge = Math.sin(u * Math.PI), dx = Math.sin((ry + yy) / px * fq + t * 7.3) * amp * px * edge + noise(t * 3 + yy * 0.05, 4) * amp * 0.5 * px * edge; g.drawImage(c, rx, ry + yy, rw, step, rx + dx, ry + yy, rw, step); }
  g.restore(); free(c);
}

// =====================================================================================================
// LAYER HELPERS
// =====================================================================================================
export function glowDraw(g, fn, o = {}) {
  const c = capture(g, fn), bl = (o.blur ?? 14) * E.PX, st = o.strength ?? 1;
  if (o.color) { const x = c.getContext('2d'); x.globalCompositeOperation = 'source-in'; x.fillStyle = o.color; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'source-over'; const c2 = capture(g, fn); blit(g, c, 'lighter', st, `blur(${bl}px)`); blit(g, c, 'lighter', st * 0.6, `blur(${bl * 3}px)`); blit(g, c2); free(c, c2); return; }
  blit(g, c, 'lighter', st, `blur(${bl}px)`); blit(g, c, 'lighter', st * 0.5, `blur(${bl * 3}px)`); blit(g, c); free(c);
}
function rimPass(g, sil, dir, color, width, a, blur) {
  const [w, h] = full(g), [r, rx] = grab(w, h), d = Math.hypot(dir[0], dir[1]) || 1, ox = (dir[0] / d) * width * E.PX, oy = (dir[1] / d) * width * E.PX;
  rx.drawImage(sil, 0, 0); rx.globalCompositeOperation = 'destination-out'; rx.drawImage(sil, -ox, -oy);       // keep only the edge that faces `dir`
  rx.globalCompositeOperation = 'source-in'; rx.fillStyle = color; rx.fillRect(0, 0, w, h); rx.globalCompositeOperation = 'source-over';
  blit(g, r, 'source-over', a, blur > 0 ? `blur(${blur * E.PX}px)` : 'none'); blit(g, r, 'lighter', a * 0.6, `blur(${(blur + width) * E.PX}px)`);
  free(r);
}
export function rimLight(g, fn, o = {}) {
  fn(g); const sil = capture(g, fn), dir = o.dir || [1, -0.4];
  rimPass(g, sil, dir, o.color || P5.cyan, o.width ?? 6, o.a ?? 0.9, o.blur ?? 0.6);
  const bk = o.back === false ? null : { color: P5.violet, width: 4, a: 0.45, ...(o.back || {}) }; if (bk) rimPass(g, sil, [-dir[0], -dir[1] * 0.5 - 0.3], bk.color, bk.width, bk.a, 1);
  free(sil);
}
export function trail(g, t, drawAt, o = {}) {
  const n = o.n ?? 5, dt = o.dt ?? 0.04, a = o.a ?? 0.35, tint = o.tint ?? P5.cyan;
  for (let i = n; i >= 1; i--) { const c = capture(g, (x) => drawAt(x, t - i * dt)), x = c.getContext('2d'); if (tint) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = alpha(tint, 0.55); x.fillRect(0, 0, c.width, c.height); }
    blit(g, c, o.blend || 'lighter', a * (1 - (i - 1) / n), i > 2 ? `blur(${(i - 1) * 1.5 * E.PX}px)` : 'none'); free(c); }
  drawAt(g, t);
}

// =====================================================================================================
// TIME
// =====================================================================================================
export function slowMo(t, o = {}) { const at = o.at ?? 0, dur = o.dur ?? 1, f = o.factor ?? 0.25; return t < at ? t : t < at + dur ? at + (t - at) * f : at + dur * f + (t - at - dur); }
export function freeze(t, at, frames = 5) { const hold = frames / (E.fps || 24); return t < at ? t : t < at + hold ? at : t - hold; }
export function hitShake(t, at, o = {}) { const u = t - at, dur = o.dur ?? 0.25, amp = o.amp ?? 3; if (u < 0 || u > dur) return [0, 0]; const k = 1 - u / dur; return [noise(u * 60, 3) * amp * k, noise(u * 60, 11) * amp * k]; }

// =====================================================================================================
// FLASHES
// =====================================================================================================
export function smashFlash(g, t, at, o = {}) {
  const u = t - at, dur = o.dur ?? 0.18; if (u < 0 || u > dur * 3) return; const k = u < dur ? 1 - u / dur * 0.4 : 0.6 * Math.exp(-(u - dur) * 18);
  g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); g.globalCompositeOperation = 'screen'; g.fillStyle = alpha(o.color || P5.goldHi, (o.a ?? 0.7) * k); g.fillRect(0, 0, E.W, E.H); g.restore();
}
export function impactFrame(g, t, at, o = {}) {
  const fr = (o.frames ?? 3) / (E.fps || 24), u = t - at; if (u < 0 || u >= fr) return; const x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, col = o.color || P5.goldHi, r = rng(o.seed ?? 7), k = u / fr;
  g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.fillStyle = alpha(P5.ink, 0.9); g.fillRect(0, 0, E.W, E.H);        // stark: the frame drops to ink...
  g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(P5.cyan2, 0.08); g.fillRect(0, 0, E.W, E.H); g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2, r0 = 40 + r() * 120, r1 = r0 + 500 + r() * 900, wd = (0.006 + r() * 0.014) * (1 - k * 0.5);
    poly(g, [[x + Math.cos(a - wd) * r0, y + Math.sin(a - wd) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1], [x + Math.cos(a + wd) * r0, y + Math.sin(a + wd) * r0]], alpha(i % 3 ? col : P5.cyan, 0.9)); }   // ...cut by white-gold spikes
  glow(g, x, y, 260, col, 0.9); circle(g, x, y, 70 * (1 - k * 0.5), alpha('#ffffff', 0.9));
  g.globalCompositeOperation = 'lighten'; g.fillStyle = P5.ink; g.fillRect(0, 0, E.W, E.H);
  g.restore();
}

// =====================================================================================================
// GROUND
// =====================================================================================================
const crackPaths = (seed, n, len) => { const r = rng(seed), out = []; for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.5, pts = [[0, 0]]; let a = a0, x = 0, y = 0; const L = len * (0.55 + r() * 0.6), steps = 7;
  for (let s = 0; s < steps; s++) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * L / steps; y += Math.sin(a) * L / steps; pts.push([x, y]); }
  const br = 1 + Math.floor(r() * 3), branches = []; for (let b = 0; b < br; b++) { const at = 2 + Math.floor(r() * 4), bp = pts[at], ba = a0 + (r() > 0.5 ? 1 : -1) * (0.5 + r() * 0.6), bL = L * (0.2 + r() * 0.25); branches.push({ at: at / steps, pts: [bp, [bp[0] + Math.cos(ba) * bL * 0.5, bp[1] + Math.sin(ba) * bL * 0.5], [bp[0] + Math.cos(ba + 0.3) * bL, bp[1] + Math.sin(ba + 0.3) * bL]] }); }
  out.push({ pts, branches }); } return out; };
function partial(pts, k) { if (k >= 1) return pts; const n = pts.length - 1, f = k * n, i = Math.floor(f), u = f - i; const out = pts.slice(0, i + 1); if (i < n) out.push([lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]); return out; }
export function groundCrack(g, t, x, y, o = {}) {
  const k = clamp(o.k ?? 1), s = o.s ?? 1, flat = o.flat ?? 0.32, col = o.color || '#05070C', gl = clamp(o.glow ?? 0); if (k <= 0) return;
  const P = crackPaths(o.seed ?? 5, o.n ?? 9, (o.len ?? 360) * s), e = ease.out(k);
  g.save(); g.translate(x, y); g.scale(1, flat);
  for (const c of P) { const pts = partial(c.pts, e); if (pts.length < 2) continue;
    if (gl > 0) seg(g, pts, 10 * s, alpha(o.glowColor || P5.cyan, 0.35 * gl));
    seg(g, pts, 5 * s, col); seg(g, pts.map(([a, b]) => [a, b - 3 * s]), 1.5 * s, alpha('#ffffff', 0.18));
    for (const b of c.branches) if (e > b.at) seg(g, partial(b.pts, clamp((e - b.at) / (1 - b.at))), 3 * s, col); }
  g.restore();
  if (gl > 0) glow(g, x, y, 160 * s * e, o.glowColor || P5.cyan, 0.35 * gl);
  const r = rng((o.seed ?? 5) + 40), u = prog(k, 0, 0.6); if (u > 0 && u < 1) for (let i = 0; i < 16; i++) { const a = -Math.PI * r(), v = (90 + r() * 220) * s, px = x + Math.cos(a) * v * u * 1.6, py = y + Math.sin(a) * v * u * 0.9 + 420 * s * u * u, sz = (3 + r() * 6) * s;   // chips
    poly(g, [[px - sz, py], [px, py - sz * 0.8], [px + sz, py + sz * 0.3]], alpha(o.chip || '#8a8478', 1 - u)); }
}
export function soilSink(g, t, x, y, o = {}) {
  const k = clamp(o.k ?? 0), s = o.s ?? 1, w = (o.w ?? 220) * s, d = 60 * s * ease.out(k); if (k <= 0) return { dy: 0 };
  g.save(); g.fillStyle = radGrad(g, x, y + d * 0.2, 4, w * 0.6, ['#1c1208', '#3a2814', alpha('#4a3420', 0)]); g.beginPath(); g.ellipse(x, y + 4 * s, w * 0.62 * (0.7 + 0.3 * k), 18 * s + d * 0.35, 0, 0, 7); g.fill();
  g.fillStyle = '#140c06'; g.beginPath(); g.ellipse(x, y + 4 * s, w * 0.46 * (0.6 + 0.4 * k), (10 + d * 0.22), 0, 0, 7); g.fill(); g.restore();
  const r = rng(o.seed ?? 9), u = prog(k, 0, 0.5); for (let i = 0; i < 12; i++) { const a = -Math.PI * (0.1 + r() * 0.8), v = (60 + r() * 120) * s, px = x + Math.cos(a) * v * Math.min(u * 1.4, 1) * 1.4, py = y + Math.sin(a) * v * u * 0.6 * (1 - u) + 6 * s, sz = (5 + r() * 7) * s;
    if (u > 0) circle(g, px, py, sz, i % 3 ? '#4a3420' : '#3e7a32'); }
  return { dy: d };
}
export function soilLip(g, t, x, y, o = {}) {
  const k = clamp(o.k ?? 0), s = o.s ?? 1, w = (o.w ?? 220) * s, r = rng((o.seed ?? 9) + 3); if (k <= 0) return; const h = (8 + 22 * ease.out(k)) * s;
  g.save(); g.fillStyle = '#3a2814'; g.beginPath(); g.moveTo(x - w * 0.62, y + 6 * s); g.quadraticCurveTo(x, y + 6 * s - h * 0.2 + 26 * s, x + w * 0.62, y + 6 * s); g.quadraticCurveTo(x, y + 6 * s + h + 10 * s, x - w * 0.62, y + 6 * s); g.fill();
  g.fillStyle = '#3e7a32'; for (let i = 0; i < 18; i++) { const u = i / 17, px = lerp(x - w * 0.58, x + w * 0.58, u), py = y + 8 * s + Math.sin(u * Math.PI) * (h * 0.7 + 8 * s); poly(g, [[px - 6 * s, py], [px + (r() - 0.5) * 8 * s, py - (10 + r() * 10) * s], [px + 6 * s, py]], i % 2 ? '#3e7a32' : '#4e8e3e'); }
  g.restore();
}
export function tileCrack(g, t, x, y, o = {}) {
  const k = clamp(o.k ?? 1), cols = o.cols ?? 6, rows = o.rows ?? 3, tw = o.tw ?? 150, th = o.th ?? 46, r = rng(o.seed ?? 13), x0 = x - cols * tw / 2;
  const tile = o.tile || '#b8aea0', grout = o.grout || '#6a6258';
  for (let j = 0; j < rows; j++) { const yy = y - th * rows / 2 + j * th, sc = 0.9 + j * 0.1; for (let i = 0; i < cols; i++) { const xx = x + (x0 - x + i * tw) * sc;
    g.fillStyle = shade(tile, (r() - 0.5) * 0.12 - (rows - j) * 0.04); g.fillRect(xx + 2, yy + 2, tw * sc - 4, th - 4); g.fillStyle = alpha('#ffffff', 0.12); g.fillRect(xx + 2, yy + 2, tw * sc - 4, 4); }
    seg(g, [[x + (x0 - x) * sc, yy], [x + (x0 - x + cols * tw) * sc, yy]], 3, grout); }
  if (k <= 0) return; const P = crackPaths(o.seed ?? 13, 6, Math.max(tw, th * rows) * 1.2), e = ease.out(k);
  g.save(); g.beginPath(); g.rect(x - cols * tw * 0.6, y - th * rows / 2, cols * tw * 1.2, th * rows); g.clip(); g.translate(x, y); g.scale(1, 0.45);
  for (const c of P) { const pts = partial(c.pts, e); if (pts.length > 1) { seg(g, pts, 4, '#2a241e'); seg(g, pts.map(([a, b]) => [a + 1, b + 3]), 1.5, alpha('#ffffff', 0.25)); } for (const b of c.branches) if (e > b.at) seg(g, partial(b.pts, clamp((e - b.at) / (1 - b.at))), 2.5, '#2a241e'); }
  g.restore();
  const u = prog(k, 0, 0.5); if (u > 0 && u < 1) for (let i = 0; i < 10; i++) { const a = -Math.PI * (0.15 + r() * 0.7), v = 120 + r() * 160, px = x + Math.cos(a) * v * u, py = y + Math.sin(a) * v * u + 500 * u * u, sz = 3 + r() * 5; poly(g, [[px - sz, py], [px, py - sz], [px + sz, py + sz * 0.4]], alpha(tile, 1 - u)); }
}
export function dustBurst(g, t, at, x, y, o = {}) {
  const u = t - at, s = o.s ?? 1, n = o.count ?? 14, col = o.color || '#c8bca8', dir = o.dir ?? 0; if (u < 0 || u > 2.2) return; const r = rng(o.seed ?? 17);
  g.save(); for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, sp = (160 + r() * 260) * s, life = 1.2 + r() * 0.9, k = clamp(u / life), e = 1 - Math.pow(1 - k, 3);
    const px = x + side * sp * e + dir * 80 * e * s, py = y - (10 + r() * 40) * s * e - 30 * s * k, rad = (26 + r() * 34) * s * (0.4 + e), a = 0.42 * (1 - k) * clamp(u / 0.06);
    g.fillStyle = radGrad(g, px, py, 0, rad, [alpha(col, a), alpha(col, a * 0.5), alpha(col, 0)]); g.beginPath(); g.arc(px, py, rad, 0, 7); g.fill(); }
  g.restore();
}

// =====================================================================================================
// STEAM AURA (night only: body heat, lit cyan from below and amber from the streetlights; rises and fades UP, never pools)
// =====================================================================================================
//   steamAura(g, t, { x, y: feet, h: body height px, k: 0..1, points: [[x, y], ...] (spawn points; default head + shoulders),
//                     cyan: 0..1 (underlight), amber: 0..1 (sodium side light), rate, seed, wind })
export function steamAura(g, t, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? E.H * 0.8, h = o.h ?? 440, r = rng(o.seed ?? 23), wind = o.wind ?? 0.15;
  const pts = o.points || [[x, y - h * 0.97], [x - h * 0.06, y - h * 0.94], [x + h * 0.06, y - h * 0.95], [x - h * 0.13, y - h * 0.8], [x + h * 0.13, y - h * 0.8], [x - h * 0.16, y - h * 0.7], [x + h * 0.16, y - h * 0.7]];
  const n = Math.round((o.rate ?? 38) * k), cy = clamp(o.cyan ?? 0.8), am = clamp(o.amber ?? 0.3), life = 1.5;
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const p = pts[i % pts.length], ph = r(), sp = 0.8 + r() * 0.5, u = ((t * sp / life) + ph) % 1, age = u * life, sd = r() - 0.5, seed = r() * 10;
    const px = p[0] + sd * 34 + Math.sin(age * 2.4 + seed) * 18 * u + wind * 140 * u * u + noise(age * 1.5 + seed, 5) * 16 * u;
    const py = p[1] - (h * 0.42) * (u * 0.85 + u * u * 0.4) - 6;
    const rad = (10 + 34 * u + r() * 10) * (h / 440), a = 0.46 * k * Math.sin(Math.PI * Math.min(1, u * 1.25)) * (1 - u * 0.6);
    const col = mix(mix('#ffffff', P5.cyan, cy * (1 - u) * 0.8), P5.sodium, am * 0.45 * (sd > 0 ? 1 : 0.2));
    g.fillStyle = radGrad(g, px, py, 0, rad, [alpha(col, a), alpha(col, a * 0.4), alpha(col, 0)]); g.beginPath(); g.ellipse(px, py, rad * 0.75, rad, Math.sin(seed + age) * 0.4, 0, 7); g.fill();
  }
  // thin curling strands (breath-like), a few per frame
  for (let i = 0; i < Math.round(7 * k); i++) { const p = pts[(i * 3) % pts.length], u = ((t * 0.6 + i * 0.37) % 1), col = mix('#e8fbff', P5.cyan, cy * 0.5);
    g.strokeStyle = alpha(col, 0.22 * k * Math.sin(Math.PI * u)); g.lineWidth = 3 * (h / 440); g.beginPath();
    for (let j = 0; j <= 12; j++) { const v = j / 12, yy = p[1] - h * 0.08 - v * h * 0.35 * (0.4 + u), xx = p[0] + Math.sin(v * 5 + t * 2 + i) * 14 * v + wind * 80 * v * u; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  g.restore();
  if (cy > 0) glow(g, x, y - h * 0.55, h * 0.75, P5.cyan, 0.08 * k * cy);
}

// =====================================================================================================
// LINES + CAMERA
// =====================================================================================================
export function speedLines5(g, t, o = {}) {
  const mode = o.mode || 'focus', col = o.color || P5.cyan, a = o.a ?? 0.5, n = o.count ?? 70, r = rng(o.seed ?? 31), fr = Math.floor(t * (o.fps ?? 12));   // anime lines re-roll ~12x a second
  const rr2 = rng((o.seed ?? 31) * 97 + fr);
  g.save(); g.globalCompositeOperation = 'lighter';
  if (mode === 'focus') { const cx = o.cx ?? E.W / 2, cy = o.cy ?? E.H / 2, inner = o.inner ?? 360, far = Math.hypot(E.W, E.H);
    for (let i = 0; i < n; i++) { const ang = r() * Math.PI * 2 + (rr2() - 0.5) * 0.02, d0 = inner * (1 + rr2() * 0.35), wd = 0.004 + r() * 0.012;
      poly(g, [[cx + Math.cos(ang - wd) * far, cy + Math.sin(ang - wd) * far], [cx + Math.cos(ang) * d0, cy + Math.sin(ang) * d0], [cx + Math.cos(ang + wd) * far, cy + Math.sin(ang + wd) * far]], alpha(i % 5 ? col : '#ffffff', a * (0.4 + r() * 0.6))); } }
  else { const ang = o.angle ?? 0, ca = Math.cos(ang), sa = Math.sin(ang), span = Math.hypot(E.W, E.H);
    for (let i = 0; i < n; i++) { const off = (r() - 0.5) * span, L = 200 + r() * 700, pos = ((r() * span * 2 + t * (1800 + r() * 1400)) % (span * 2)) - span, wd = 1.5 + r() * 4;
      const cx = E.W / 2 - sa * off + ca * pos, cy = E.H / 2 + ca * off + sa * pos;
      g.fillStyle = linGrad(g, cx - ca * L, cy - sa * L, cx, cy, [alpha(col, 0), alpha(col, a * (0.4 + r() * 0.6))]); g.beginPath(); g.moveTo(cx - ca * L - sa * wd * 0.2, cy - sa * L + ca * wd * 0.2); g.lineTo(cx - sa * wd, cy + ca * wd); g.lineTo(cx + sa * wd, cy - ca * wd); g.closePath(); g.fill(); } }
  g.restore();
}
export function lowAngle(t, dur, o = {}) {
  const k = ease.inOut(clamp(t / Math.max(0.01, dur))), z = o.z || [1.0, 1.08], lift = o.lift ?? 140;
  return { z: lerp(z[0], z[1], k), x: (o.x ?? 0) + Math.sin(t * 0.5) * 4, y: -lift + Math.cos(t * 0.4) * 3, r: (o.roll ?? 0.012) * Math.sin(t * 0.3 + 0.6) };
}
export function lowAngleWrap(g, k, gy, fn) { const st = 1 + 0.09 * clamp(k); g.save(); g.translate(E.W / 2, gy); g.scale(1 + 0.02 * k, st); g.translate(-E.W / 2, -gy); fn(g); g.restore(); }
