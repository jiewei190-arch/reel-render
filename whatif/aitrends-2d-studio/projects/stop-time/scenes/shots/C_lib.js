// C_lib.js — shared LOCAL helpers for stop-time batch C (s069-s101). Registers no shots.
//   hero(g, o)                    actor('HERO') + the LOCAL look: cowlick tuft, round tortoiseshell glasses, cream stripes + long sleeves on
//                                 the teal tee, cream stars on the navy pyjama legs, mismatched socks (green / yellow), the chunky black
//                                 digital watch (near wrist). o.blur draws him soft (background).
//   heroFace(g, cx, cy, r, f, o)  giantFace HERO + LOCAL cowlick, glasses (o.reflect: a tiny clock in the lenses) and a striped crew-neck tee
//   kitchen(g, t, cam, o) -> M    morning.js kitchen (H4) + the KITCHEN CLOCK (stopprops.js wallClock, H2) on its hook; o.sec, o.stick,
//                                 o.mood, o.cocoa (steam 0..1 / 'frozen'); M.clock = [x, y, r] in screen space at cam
//   cast3(g, t, M, o)             MINA (spoon) + DEV (phone) at the table; o.frozen holds them still (no idle, no blink)
//   --- freeze.js (H1) had not landed when batch C was written: LOCAL stand-ins with the HANDOFF names/behaviour ---
//   snapHand(g, t, at, x, y, s)   a big finger-snap hand (teal/cream cuff) + snapRing(g, t, at, x, y) the ring ripple
//   freezeGrade(g, k, t)          cool blue-grey, desaturated, hanging dust motes (draw LAST; draw the HERO after it to keep him warm)
//   unfreeze(g, t, at)            the UNFREEZE whoosh (warm flash ring + speed streaks)
//   readout(g, t, sec, o)         the 10-second read-out: stopprops.js STOPWATCH as a small HUD dial top-right + big gold digits
//   goldPop / cTxt / fade / push / creamChip / bracket / bpArrow    text + board pieces (gold numbers, cream line art)
import { E, S, clamp, lerp, ease, prog, rng, seg, circle, ring, rr, poly, glow, alpha, shade, text, veil, blurLayer, layer, measure, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { giantFace } from '../sets/faces.js';
import { morning, morningFg } from '../sets/morning.js';
import { stopwatch, wallClock } from '../sets/stopprops.js';

export const TEAL = '#2f8f8a', CREAM = '#efe3c8', HAIR = '#16141c', TORT = '#8a5a2b', SOCK1 = '#3aa05a', SOCK2 = '#ffd23c', INK = '#1a1622';
export const U = () => S().ui;

export function push(g, t, dur, fn, amt = 0.035) { const z = 1 + amt * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); }
export const fade = (g, a, fn) => { if (a <= 0.01) return; g.save(); g.globalAlpha *= Math.min(1, a); fn(); g.restore(); };
export function goldPop(g, t, str, at, x, y, size = 110, o = {}) {
  const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; const out = o.until != null ? clamp((o.until - t) / 0.25) : 1, col = o.color || U().gold;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(p * (o.scale ?? 1), p * (o.scale ?? 1)); g.globalAlpha *= out; glow(g, 0, 0, size * 1.6, col, 0.2);
  text(g, str, 0, 0, { size, color: col, font: FONTS.title, weight: 700, stroke: size * 0.12, strokeColor: '#140f1c', glow: 18, glowColor: alpha(col, 0.7), spacing: o.spacing ?? 2, align: o.align ?? 'center' }); g.restore();
}
export const cTxt = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 30, color: o.color ?? U().cream, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1 });
export function creamChip(g, t, str, at, x, y, o = {}) {   // a cream-on-dark pill (non-number labels)
  const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; const sz = o.size ?? 38, w = measure(g, str, sz, FONTS.ui, 900) + 60, h = sz + 30, col = o.color || U().cream;
  g.save(); g.translate(x, y); g.scale(p, p); rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = 'rgba(12,10,22,.88)'; g.fill(); g.strokeStyle = alpha(col, 0.9); g.lineWidth = 3; g.stroke();
  text(g, str, 0, 2, { size: sz, color: col, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
}
export function bracket(g, x0, x1, y, k, str, o = {}) {      // a gold under-bracket with a label (k draws it on)
  if (k <= 0.01) return; const col = o.color || U().gold, d = o.up ? -1 : 1, xm = (x0 + x1) / 2, hw = (x1 - x0) / 2 * ease.out(k);
  seg(g, [[xm - hw, y], [xm - hw, y + 18 * d], [xm + hw, y + 18 * d], [xm + hw, y]], 5, col); seg(g, [[xm, y + 18 * d], [xm, y + 34 * d]], 5, col);
  if (str) text(g, str, xm, y + 66 * d, { size: o.size ?? 40, color: col, font: FONTS.ui, weight: 900, spacing: 2, alpha: k, glow: 10, glowColor: alpha(col, 0.5) });
}
export function bpArrow(g, x0, y0, x1, y1, k = 1, col, w = 8) {
  if (k <= 0.01) return; const c = col || U().gold, x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y1 - y0, x1 - x0), h = w * 2.6;
  seg(g, [[x0, y0], [x - Math.cos(a) * h * 0.6, y - Math.sin(a) * h * 0.6]], w, c);
  poly(g, [[x, y], [x - Math.cos(a) * h + Math.sin(a) * h * 0.7, y - Math.sin(a) * h - Math.cos(a) * h * 0.7], [x - Math.cos(a) * h - Math.sin(a) * h * 0.7, y - Math.sin(a) * h + Math.cos(a) * h * 0.7]], c);
}

// ---------------------------------------------------------------- THE HERO (LOCAL look on top of cast.js)
const L = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
function star(g, x, y, r, c) { poly(g, Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; return [x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]; }), c); }
export function hero(g, o) {
  if (o.blur) { blurLayer(g, o.blur, (g) => hero(g, { ...o, blur: 0 })); return; }
  const p = o.pose || POSES.stand, s = o.s ?? 1.9, f = o.facing ?? 1;
  actor(g, 'HERO', { s: 1.9, ...o });
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha; g.translate(o.x, o.y); g.scale(f * s, s);
  if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
  // pyjama stars + socks
  for (const [a, b] of [[p.hip, p.kF], [p.kF, p.fF]]) for (const u of [0.3, 0.75]) { const q = L(a, b, u); star(g, q[0] + (u > 0.5 ? 2 : -3), q[1], 2.6, alpha(CREAM, 0.9)); }
  for (const [ft, c] of [[p.fB, SOCK2], [p.fF, SOCK1]]) { rr(g, ft[0] - 6, ft[1] - 11, 20, 9, 4); g.fillStyle = c; g.fill(); }
  // tee stripes, long sleeve (near arm) with stripes, watch on the near wrist
  for (const u of [0.18, 0.4, 0.62, 0.84]) { const q = L(p.sh, p.hip, u); seg(g, [[q[0] - 11, q[1]], [q[0] + 11, q[1]]], 3.2, CREAM); }
  const cuff = L(p.eF, p.hF, 0.74); seg(g, [p.sh, p.eF, cuff], 15.5, TEAL);
  for (const [a, b] of [[p.sh, p.eF], [p.eF, cuff]]) for (const u of [0.35, 0.75]) { const q = L(a, b, u), an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; seg(g, [[q[0] - Math.cos(an) * 7, q[1] - Math.sin(an) * 7], [q[0] + Math.cos(an) * 7, q[1] + Math.sin(an) * 7]], 2.6, CREAM); }
  const w = L(p.eF, p.hF, 0.84), wa = Math.atan2(p.hF[1] - p.eF[1], p.hF[0] - p.eF[0]);
  g.save(); g.translate(w[0], w[1]); g.rotate(wa); rr(g, -6, -7.5, 12, 15, 3); g.fillStyle = '#0c0c10'; g.fill(); rr(g, -3.5, -4.5, 7, 9, 1.5); g.fillStyle = o.watchGlow ? '#cfe8ff' : '#8a9a84'; g.fill(); g.restore();
  // cowlick + glasses
  const h = p.head; g.fillStyle = HAIR; g.beginPath(); g.moveTo(h[0] - 8, h[1] - 23); g.quadraticCurveTo(h[0] - 6, h[1] - 40, h[0] - 14, h[1] - 50); g.quadraticCurveTo(h[0] + 2, h[1] - 42, h[0] + 4, h[1] - 24); g.closePath(); g.fill();
  g.strokeStyle = TORT; g.lineWidth = 2.6; for (const dx of [-6.5, 10]) { g.beginPath(); g.arc(h[0] + 9 + dx, h[1] - 4, 7.5, 0, Math.PI * 2); g.stroke(); }
  seg(g, [[h[0] + 10, h[1] - 5], [h[0] + 11.5, h[1] - 5]], 2.4, TORT); seg(g, [[h[0] - 5, h[1] - 5], [h[0] - 18, h[1] - 8]], 2.4, TORT);
  g.restore();
}
export function heroFace(g, cx, cy, r, f, o = {}) {
  giantFace(g, cx, cy, r, { who: 'HERO', f, ...o });
  g.save(); g.translate(cx, cy + (o.breath ?? 0) * r * 0.012); if (o.tilt) g.rotate(o.tilt);
  // striped crew-neck tee over the body
  g.save(); g.beginPath(); g.moveTo(-r * 1.9, r * 2.3); g.quadraticCurveTo(-r * 1.7, r * 1.15, -r * 0.62, r * 0.98); g.lineTo(r * 0.62, r * 0.98); g.quadraticCurveTo(r * 1.7, r * 1.15, r * 1.9, r * 2.3); g.closePath(); g.clip();
  for (let i = 0; i < 8; i++) { const y = r * (1.12 + i * 0.17); g.fillStyle = alpha(CREAM, 0.9); g.fillRect(-r * 2, y, r * 4, r * 0.07); } g.restore();
  g.strokeStyle = CREAM; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(-r * 0.62, r * 0.98); g.quadraticCurveTo(0, r * 1.3, r * 0.62, r * 0.98); g.stroke();
  // cowlick
  g.fillStyle = HAIR; g.beginPath(); g.moveTo(-r * 0.22, -r * 0.92); g.quadraticCurveTo(-r * 0.18, -r * 1.45, -r * 0.42, -r * 1.75); g.quadraticCurveTo(r * 0.05, -r * 1.5, r * 0.1, -r * 0.94); g.closePath(); g.fill();
  // glasses
  const lk = f.look || [0, 0], ex = r * 0.34, ey = -r * 0.04, lr = r * 0.25;
  for (const sd of [-1, 1]) {
    if (o.reflect) { g.save(); g.beginPath(); g.arc(sd * ex, ey, lr, 0, 7); g.clip(); g.globalAlpha *= o.reflect; const rx = sd * ex + lr * 0.35, ry = ey - lr * 0.38; circle(g, rx, ry, lr * 0.26, alpha('#f6f1e6', 0.55)); seg(g, [[rx, ry], [rx, ry - lr * 0.2]], r * 0.012, '#d4262e'); g.restore(); }
    g.fillStyle = alpha('#cfe4ff', 0.08); g.beginPath(); g.arc(sd * ex, ey, lr, 0, 7); g.fill(); ring(g, sd * ex, ey, lr, r * 0.05, TORT); ring(g, sd * ex, ey, lr - r * 0.03, r * 0.012, shade(TORT, 0.3));
  }
  seg(g, [[-ex + lr, ey - r * 0.02], [ex - lr, ey - r * 0.02]], r * 0.04, TORT); for (const sd of [-1, 1]) seg(g, [[sd * (ex + lr), ey - r * 0.03], [sd * r * 0.98, ey - r * 0.1]], r * 0.04, TORT);
  g.restore(); void lk;
}

// ---------------------------------------------------------------- KITCHEN + CLOCK + CAST
export function kitchen(g, t, cam, o = {}) {
  const md = o.mood || 'morning', M = morning(g, t, cam, { view: 'kitchen', mood: md, butter: false, ...(o.k || {}) }), P = M.pos, r = o.clockR ?? 104;
  layer(g, cam, 0.55, (g) => wallClock(g, t, { x: P.clockX, y: P.clockY, r, h: o.h ?? 7.72, sec: o.sec ?? (12 + Math.floor(t)), stick: o.stick ?? 0 }));
  if (o.cocoa) layer(g, cam, 1, (g) => cocoa(g, t, P.heroSeatX - 120, P.tableTop - 6, 1, o.cocoa));
  return M;
}
export function cocoa(g, t, x, y, s = 1, steam = 1) {     // a red mug of cocoa; steam === 'frozen' holds the curls still
  g.save(); g.translate(x, y); g.scale(s, s); rr(g, -26, -56, 52, 56, 8); g.fillStyle = '#c8402e'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#c8402e'; g.lineWidth = 8; g.beginPath(); g.arc(28, -30, 13, -1.3, 1.3); g.stroke(); g.fillStyle = '#5a3020'; g.beginPath(); g.ellipse(0, -54, 22, 5, 0, 0, 7); g.fill();
  const tt = steam === 'frozen' ? 0.6 : t, a = steam === 'frozen' ? 0.75 : clamp(steam);
  for (let i = 0; i < 3; i++) { g.strokeStyle = alpha('#ffffff', 0.5 * a); g.lineWidth = 5; g.beginPath(); for (let j = 0; j <= 10; j++) { const yy = -62 - j * 9, xx = -12 + i * 12 + Math.sin(j * 0.7 + tt * 3 + i) * 7; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  g.restore();
}
export function cast3(g, t, M, o = {}) {
  const P = M.pos, fr = !!o.frozen, rim = M.rim;
  const mina = { x: P.minaSeatX - 40, y: M.GY, s: 1.9, facing: 1, pose: o.minaPose || POSES.sit, expr: o.minaExpr || (fr ? 'surprised' : 'happy'), blink: fr ? 0 : (o.blinkAt != null ? (Math.abs(t - o.blinkAt) < 0.09 ? 1 : 0) : blinkF(t, 3.1, 1)), look: o.minaLook || [1, 0.15], rim, t: fr ? 0 : t };
  actor(g, 'MINA', mina);
  if (o.spoon !== false) { const s = 1.9 * 0.72, hx = mina.x + mina.pose.hF[0] * s, hy = mina.y + mina.pose.hF[1] * s, up = fr ? 0.6 : 0.5 + 0.5 * Math.sin(t * 4); seg(g, [[hx, hy], [hx + 18, hy - 20 - up * 18]], 4, '#c8ccd4'); circle(g, hx + 20, hy - 24 - up * 18, 6, '#d8dce4'); }
  if (o.dev !== false) {
    const dp = o.devPose || POSES.phone, dx = o.devX ?? P.minaSeatX - 330;
    actor(g, 'DEV', { x: dx, y: M.GY, s: 1.9, facing: 1, pose: dp, expr: o.devExpr || (fr ? 'surprised' : 'happy'), blink: fr ? 0 : (o.blinkAt != null ? (Math.abs(t - o.blinkAt - 0.05) < 0.09 ? 1 : 0) : blinkF(t, 3.4, 2)), look: o.devLook || [1, 0], rim, prop: { type: 'phone', glow: '#9fd8ff' }, rot: fr ? 0 : Math.sin(t * 9) * 0.004 * (o.wobble ?? 0) });
  }
}
export function blinkF(t, period = 3.2, seed = 0) { const p = ((t + seed * 0.83) % period) - (period - 0.16); return p > 0 ? 1 : 0; }

// ---------------------------------------------------------------- SNAP / GRADE / UNFREEZE (local stand-ins for freeze.js)
export function snapHand(g, t, at, x, y, s = 1) {
  const done = t >= at, k = ease.out(prog(t, at, at + 0.08)), ink = S().ink;
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.15);
  rr(g, -95, 120, 190, 260, 30); g.fillStyle = TEAL; g.fill(); for (let i = 0; i < 6; i++) { g.fillStyle = CREAM; g.fillRect(-95, 150 + i * 40, 190, 14); }
  rr(g, -105, 108, 210, 46, 18); g.fillStyle = shade(TEAL, -0.15); g.fill();
  const fing = (tx, ty, rot, w, l) => { g.save(); g.translate(tx, ty); g.rotate(rot); rr(g, -w / 2, -l, w, l + 10, w / 2); g.fillStyle = ink; g.fill(); g.strokeStyle = 'rgba(255,214,170,.55)'; g.lineWidth = 5; g.stroke(); g.restore(); };
  g.fillStyle = ink; g.beginPath(); g.ellipse(0, 40, 92, 104, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,214,170,.45)'; g.lineWidth = 5; g.stroke();   // palm (warm rim)
  fing(60, -20, 0.15 + Math.PI, 44, 80); fing(92, 20, 0.35 + Math.PI, 42, 70);                                                           // ring + little finger curled in
  fing(30, -50, -0.08, 44, 170);                                                                                                          // index up
  fing(-10, -40, lerp(-1.48, 1.25, k), 48, lerp(185, 150, k));                                                                                          // middle: pressed on the thumb tip, then snapped down
  fing(-70, 10, lerp(-1.1, -0.55, k), 50, 150);                                                                                                // thumb up-left (in front)
  if (!done) { glow(g, -200, -60, 60, '#ffffff', 0.15); }
  g.restore();
  return [x - 205 * s, y - 45 * s];
}
export function snapRing(g, t, at, x, y, o = {}) {
  const u = t - at; if (u < 0 || u > 1.4) return; const max = o.max ?? 2400;
  g.save(); g.globalCompositeOperation = 'lighter';
  glow(g, x, y, 220 * (1 - clamp(u / 0.3)), '#ffffff', 0.9 * (1 - clamp(u / 0.3)));
  for (let i = 0; i < 3; i++) { const v = u - i * 0.09; if (v <= 0) continue; const R = ease.out(clamp(v / 0.9)) * max, a = (1 - clamp(v / 1.0)) * 0.85; ring(g, x, y, R, 10 - i * 3, alpha(i ? '#9ad8ff' : '#ffffff', a)); }
  for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2 + 0.3, r0 = 40 + u * 500, r1 = r0 + 60; if (u < 0.35) seg(g, [[x + Math.cos(an) * r0, y + Math.sin(an) * r0], [x + Math.cos(an) * r1, y + Math.sin(an) * r1]], 5, alpha('#ffffff', 1 - u / 0.35)); }
  g.restore();
}
const MOTES = (() => { const R = rng(4242); return Array.from({ length: 70 }, () => [R() * 1920, R() * 1080, 1 + R() * 3, R()]); })();
export function freezeGrade(g, k, t = 0) {
  if (k <= 0.01) return; g.save();
  g.globalCompositeOperation = 'saturation'; g.fillStyle = `rgba(128,128,128,${0.86 * k})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(60,92,140,${0.26 * k})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const gr = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.3, E.W / 2, E.H / 2, E.H * 0.95); gr.addColorStop(0, 'rgba(10,16,30,0)'); gr.addColorStop(1, `rgba(10,16,30,${0.4 * k})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
  for (const [x, y, r, ph] of MOTES) { circle(g, x * E.W / 1920, y * E.H / 1080, r, alpha('#e6f0ff', 0.45 * k * (0.5 + 0.5 * ph))); if (ph > 0.8) { g.save(); g.globalAlpha *= k * 0.6; seg(g, [[x - 5, y], [x + 5, y]], 1.2, '#ffffff'); seg(g, [[x, y - 5], [x, y + 5]], 1.2, '#ffffff'); g.restore(); } }
  g.restore();
}
export function unfreeze(g, t, at) {
  const u = t - at; if (u < 0 || u > 0.8) return; g.save(); g.globalCompositeOperation = 'lighter';
  const R = ease.out(clamp(u / 0.6)) * 1500, a = 1 - clamp(u / 0.7); ring(g, E.W / 2, E.H / 2, R, 40 * a + 4, alpha('#ffd9a0', 0.5 * a)); glow(g, E.W / 2, E.H / 2, 900, '#ffe8c0', 0.25 * a);
  const R2 = rng(77); for (let i = 0; i < 26; i++) { const y = R2() * E.H, x = ((R2() * E.W) + u * 4200) % (E.W + 600) - 300; seg(g, [[x, y], [x + 220 + R2() * 200, y]], 3, alpha('#fff4dc', 0.4 * a)); }
  g.restore();
}
export function readout(g, t, sec, o = {}) {
  const x = o.x ?? E.W - 220, y = o.y ?? 210, s = o.s ?? 0.62, a = o.alpha ?? 1; if (a <= 0.01) return;
  g.save(); g.globalAlpha *= a; stopwatch(g, t, { x, y, s, sec, running: o.running ?? 1 });
  const land = o.land != null ? ease.outBack(prog(t, o.land, o.land + 0.3)) : 0;
  text(g, sec.toFixed(1), x, y + 150 * s + 50, { size: 64 * (1 + 0.15 * land * (1 - prog(t, o.land + 0.3, o.land + 0.8))), color: U().gold, font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#140f1c', glow: 14 + 20 * land, glowColor: alpha(U().gold, 0.7) });
  g.restore();
}
// a cream line kitchen (board picture): window, clock, table + toast. Returns anchor points.
export function bpKitchen(g, x, y, w, k = 1, o = {}) {
  const c = o.color || U().cream, h = w * 0.56, x0 = x - w / 2, y0 = y - h / 2; g.save(); g.globalAlpha *= clamp(k * 1.5); g.lineWidth = 4; g.strokeStyle = c; g.lineJoin = 'round';
  g.strokeRect(x0, y0, w, h);
  const win = [x0 + w * 0.2, y0 + h * 0.32], clk = [x0 + w * 0.62, y0 + h * 0.22], tst = [x0 + w * 0.78, y0 + h * 0.74];
  g.strokeRect(win[0] - w * 0.12, win[1] - h * 0.18, w * 0.24, h * 0.36); seg(g, [[win[0], win[1] - h * 0.18], [win[0], win[1] + h * 0.18]], 3, c); seg(g, [[win[0] - w * 0.12, win[1]], [win[0] + w * 0.12, win[1]]], 3, c);
  ring(g, clk[0], clk[1], h * 0.13, 4, c); seg(g, [clk, [clk[0], clk[1] - h * 0.1]], 4, c); seg(g, [clk, [clk[0] + h * 0.06, clk[1]]], 4, c);
  seg(g, [[x0 + w * 0.35, y0 + h * 0.8], [x0 + w * 0.95, y0 + h * 0.8]], 5, c); seg(g, [[x0 + w * 0.4, y0 + h * 0.8], [x0 + w * 0.4, y0 + h]], 4, c); seg(g, [[x0 + w * 0.9, y0 + h * 0.8], [x0 + w * 0.9, y0 + h]], 4, c);
  rr(g, tst[0] - w * 0.04, tst[1] - h * 0.07, w * 0.08, h * 0.1, 8); g.stroke();
  g.restore(); return { win, clk, tst, x0, y0, w, h };
}
export function cuteBrain(g, x, y, s = 1, col) {     // a cream brain icon
  const c = col || U().cream; g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = alpha(c, 0.16); g.strokeStyle = c; g.lineWidth = 5;
  g.beginPath(); for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI, r = 70 + (i % 2 ? 10 : 0); g.lineTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 0.8); } g.lineTo(80, 20); g.quadraticCurveTo(0, 50, -80, 20); g.closePath(); g.fill(); g.stroke();
  seg(g, [[0, -60], [0, 30]], 4, c); for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 38, -14, 22, 0.3, 2.6); g.stroke(); }
  g.restore();
}
export const kitchenBlur = (g, t, cam, o = {}) => blurLayer(g, o.blur ?? 8, (g) => kitchen(g, t, cam, o));
export { veil, morningFg };
