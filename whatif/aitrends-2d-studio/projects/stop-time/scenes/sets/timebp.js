// sets/timebp.js — SCIENCE BLUEPRINTS for I.Awaken "What If You Could Freeze Time for 10 Seconds?", bp.js style (navy board, light-blue line
// art, cream detail, GOLD for every label and number). Draw on a bp.board(); every piece takes k = draw-on 0..1 and returns anchor points
// so a shot can attach bp.label() leaders. Numbers and wording exactly as whatif/what-if-stoptime/sources.md. LEGAL: original; nothing from
// any film, show, anime, game or comic.
//
// LIGHT (lines 8-12)
//   lightToEye(g, t, { x, y, s, k, flow: 0..1 (photons travelling), frozen: 0..1 (they hang mid-air and the retina goes dark) })
//       -> { lamp, beam, eye, retina }   a lamp, a stream of photons crossing to a cross-section eye; "~300,000 km EVERY SECOND";
//       frozen: photons stop with small "still" ticks, retina label 'NO LIGHT ARRIVES = DARK'
//   sunToEarth(g, t, { x, y, w, k, travel: 0..1 }) -> { sun, earth, photon }   sun -> Earth, "~150 MILLION km", the timer rolls to 8 min 20 s
// AIR (lines 17-22)
//   airBox(g, t, { x, y, s, k, frozen: 0..1 }) -> { box, mol }   a fingertip-sized cube of jostling molecules: "~25 BILLION BILLION
//       (2.5 x 10^19) PER cm³"; frozen: every molecule stops
//   airRace(g, t, { x, y, w, k, race: 0..1 }) -> { jet, mol }   airliner ~250 m/s vs an air molecule ~500 m/s ("about twice as fast")
//   lungs(g, t, { x, y, s, k, breathe: 0..1, frozen: 0..1 }) -> { diaphragm, airway }   diaphragm moves down, air flows in (arrows);
//       frozen: the arrows stop at the mouth with a coral 'NO PUSH, NO AIR'
//   kitchenAir(g, t, { x, y, s, k, show: 0..2 }) -> { room, scale }   1 the room 4 m x 4 m x 2.5 m = 40 m³, x 1.2 kg/m³; 2 a balance:
//       the room's air '~48 kg' level with a kid figure ('about as much as you')
// MOTION (lines 28-31)
//   newton1(g, t, { x, y, w, k, go: 0..1 }) -> { cat, path }   a leaping cat outline keeps flying along its dashed arc (gold arrow
//       'KEEPS MOVING') until a force acts; caption "...UNLESS A FORCE ACTS"
//   momentum(g, t, { x, y, w, k, show: 0..2 }) -> { formula, glove }   p = m x v; 1 two bars (light+slow vs heavy+fast), 2 a goalkeeper
//       glove pushing against a ball's arrow ('PUSH AGAINST IT')
// THE STOPPED-CLOCK ILLUSION (lines 36-39)
//   chronostasis(g, t, { x, y, w, k, jump: 0..1, fill: 0..1 }) -> { eye, clock, gap }   an eye darting to a clock (saccade arcs,
//       '~3 JUMPS A SECOND'), a timeline where the blurred jump is backfilled by the new view (gold), the first tick stretched;
//       stamp '2001 STUDY, LONDON (UCL)'
// GPS (lines 45-48)
//   gpsClocks(g, t, { x, y, w, k, show: 0..3 }) -> { sat, ground, total }   Earth + an orbiting satellite clock; ledger:
//       1 '+45 µs/day (weaker gravity)', 2 '-7 µs/day (orbital speed)', 3 '= +38 µs/day' and 'uncorrected: off by kilometres'
// THE REAL LAB (line 62)
//   hauLight(g, t, { x, y, w, k, stop: 0..1, release: 0..1 }) -> { cloud, pulse }   a laser pulse enters an ultracold atom cloud, stops
//       ('~1/1000 s'), then leaves again; stamp '2001, HARVARD - LENE HAU'S TEAM'
// All deterministic (t, rng). Colours from S().ui.
import { E, V, S, clamp, lerp, prog, ease, rng, seg, circle, ring, rr, poly, alpha, mix, glow, text, FONTS } from '/engine/core.js';
import { draw, eye } from './bp.js';

const ui = () => S().ui;
const lbl = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? V(30, 34), color: o.color ?? ui().gold, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1, glow: 10, glowColor: alpha(o.color ?? ui().gold, 0.45) });
const cream = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 28, color: ui().cream, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1 });
const arrow = (g, x0, y0, x1, y1, col, w = 5, k = 1) => { if (k <= 0.01) return; const x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y - y0, x - x0); seg(g, [[x0, y0], [x, y]], w, col); poly(g, [[x + Math.cos(a) * 16, y + Math.sin(a) * 16], [x + Math.cos(a + 2.5) * 16, y + Math.sin(a + 2.5) * 16], [x + Math.cos(a - 2.5) * 16, y + Math.sin(a - 2.5) * 16]], col); };
const stamp = (g, str, x, y, k, col, rot = -0.08, size = 40) => { const p = ease.outBack(clamp(k)); if (p <= 0.01) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(p, p); const w = str.length * size * 0.62 + 50; rr(g, -w / 2, -size * 0.85, w, size * 1.7, 12); g.strokeStyle = col; g.lineWidth = 5; g.stroke(); text(g, str, 0, 2, { size, color: col, font: FONTS.title, weight: 700, spacing: 3 }); g.restore(); };
const stillTick = (g, x, y, a = 1) => { g.save(); g.globalAlpha *= a; for (const [dx, dy] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) seg(g, [[x + dx, y + dy], [x + dx * 1.6, y + dy * 1.6]], 2, alpha(ui().cream, 0.8)); g.restore(); };
const photonDot = (g, x, y, r = 9, a = 1) => { glow(g, x, y, r * 4, '#fff6d8', 0.5 * a); circle(g, x, y, r, alpha('#fffbe8', a)); };

// =====================================================================================================
// LIGHT
// =====================================================================================================
export function lightToEye(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, flow = clamp(o.flow ?? 1), fz = clamp(o.frozen ?? 0);
  const lx = x - 620 * s, ex = x + 360 * s, A = { lamp: [lx, y - 60 * s], eye: [ex, y], beam: [x - 120 * s, y], retina: [ex + 0.93 * 200 * s, y] };
  // the lamp
  draw(g, [[lx - 60 * s, y + 160 * s], [lx + 60 * s, y + 160 * s], [lx, y + 140 * s], [lx, y + 10 * s]], k, { w: 5, color: U.cream });
  draw(g, [[lx - 80 * s, y + 10 * s], [lx - 50 * s, y - 90 * s], [lx + 50 * s, y - 90 * s], [lx + 80 * s, y + 10 * s], [lx - 80 * s, y + 10 * s]], k, { w: 5, color: U.blueprint });
  if (k > 0.5) glow(g, lx, y - 20 * s, 160 * s, '#fff6d8', 0.35 * (1 - fz * 0.3));
  eye(g, t, { x: ex, y, r: 200 * s, k, rays: false });
  // the photon stream: moving when flow, hanging still when frozen
  const n = 9, x0 = lx + 90 * s, x1 = ex - 240 * s;
  for (let i = 0; i < n; i++) { const u = fz > 0.5 ? (i + 0.5) / n : ((t * 0.9 * flow + i / n) % 1), px = lerp(x0, x1, u), py = y - 20 * s + Math.sin(i * 1.7) * 30 * s; photonDot(g, px, py, 9 * s, clamp(k * 2 - 1)); if (fz > 0.5) stillTick(g, px, py, fz); }
  if (fz < 0.5 && flow > 0) glow(g, A.retina[0] - 10 * s, y, 70 * s, '#fff6d8', 0.6 * flow * clamp(k * 2 - 1));
  if (k > 0.7) lbl(g, '~300,000 km EVERY SECOND', (x0 + x1) / 2, y - 160 * s, { alpha: clamp((k - 0.7) * 3) * (1 - fz) });
  if (fz > 0.01) { g.save(); g.globalAlpha *= fz; g.fillStyle = 'rgba(4,6,12,.55)'; g.beginPath(); g.arc(ex, y, 196 * s, 0, 7); g.fill(); g.restore(); lbl(g, 'NO LIGHT ARRIVES = DARK', ex, y + 260 * s, { color: U.accent, alpha: fz }); }
  return A;
}
export function sunToEarth(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1400, k = 1 } = o, tr = clamp(o.travel ?? 1), sx = x - w / 2 + 120, ex = x + w / 2 - 120;
  if (k > 0.05) { glow(g, sx, y, 300 * k, '#ffd25a', 0.5); circle(g, sx, y, 110 * k, alpha('#ffd25a', 0.9)); ring(g, sx, y, 110 * k, 5, U.gold); }
  if (k > 0.3) { circle(g, ex, y, 46, alpha(U.blueprint, 0.6)); ring(g, ex, y, 46, 5, U.cream); seg(g, [[ex - 30, y - 10], [ex + 10, y - 30]], 4, U.cream); }
  g.save(); g.setLineDash([16, 14]); draw(g, [[sx + 130, y], [ex - 60, y]], k, { w: 3, color: alpha(U.cream, 0.6) }); g.restore();
  const px = lerp(sx + 130, ex - 60, tr); if (k > 0.5) photonDot(g, px, y, 12);
  lbl(g, '~150 MILLION km', x, y + 100, { alpha: clamp(k * 2 - 1) });
  const secs = Math.round(500 * tr), m = Math.floor(secs / 60), ss = secs % 60;
  if (k > 0.5) { rr(g, x - 190, y - 250, 380, 110, 18); g.fillStyle = 'rgba(10,16,32,.9)'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); text(g, `${m} min ${String(ss).padStart(2, '0')} s`, x, y - 194, { size: 64, color: U.gold, font: FONTS.title, weight: 700, glow: 14, glowColor: alpha(U.gold, 0.6) }); }
  if (tr >= 0.999) cream(g, 'about, on average', x, y - 110, { size: 24 });
  return { sun: [sx, y - 110], earth: [ex, y - 46], photon: [px, y] };
}

// =====================================================================================================
// AIR
// =====================================================================================================
export function airBox(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, fz = clamp(o.frozen ?? 0), L = 300 * s, d = L * 0.4, r = rng(17);
  const P = [[x - L / 2, y + L / 2], [x + L / 2, y + L / 2], [x + L / 2, y - L / 2], [x - L / 2, y - L / 2]];
  draw(g, [...P, P[0]], k, { w: 5, color: U.cream }); draw(g, [P[3], [P[3][0] + d, P[3][1] - d], [P[2][0] + d, P[2][1] - d], P[2]], k, { w: 4, color: U.cream }); draw(g, [[P[2][0] + d, P[2][1] - d], [P[1][0] + d, P[1][1] - d], P[1]], k, { w: 4, color: U.cream });
  const mk = clamp(k * 2 - 1);
  for (let i = 0; i < 60 * mk; i++) { const bx = r(), by = r(), vx = r() - 0.5, vy = r() - 0.5, sp = 0.6 + r(), tt = fz > 0.5 ? 0 : t;
    let u = (bx + vx * tt * sp) % 1, v = (by + vy * tt * sp) % 1; u = Math.abs(u < 0 ? u + 1 : u); v = Math.abs(v < 0 ? v + 1 : v);
    const px = x - L / 2 + 12 + (u > 1 ? 2 - u : u) * (L - 24) + v * d * 0.5, py = y + L / 2 - 12 - (v > 1 ? 2 - v : v) * (L - 24) - v * d * 0.3;
    circle(g, px, py, 6 * s, i % 3 ? alpha(U.blueprint, 0.9) : alpha(U.cream, 0.9)); if (fz < 0.5) seg(g, [[px, py], [px - vx * 24 * s, py + vy * 24 * s]], 2, alpha(U.cream, 0.3)); else if (i % 6 === 0) stillTick(g, px, py, fz * 0.6); }
  lbl(g, '~25 BILLION BILLION', x + d * 0.5, y - L / 2 - d - 70 * s, { size: 34, alpha: mk }); cream(g, '(2.5 x 10^19) molecules in each cm³', x + d * 0.5, y - L / 2 - d - 26 * s, { size: 24, alpha: mk });
  cream(g, '1 cm³', x, y + L / 2 + 40 * s, { size: 30, alpha: mk }); cream(g, '(about a fingertip)', x, y + L / 2 + 76 * s, { size: 24, alpha: mk });
  return { box: [x + L / 2 + d, y - L / 2 - d], mol: [x, y] };
}
export function airRace(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1300, k = 1 } = o, rc = ease.inOut(clamp(o.race ?? 1)), x0 = x - w / 2, L = w - 200;
  seg(g, [[x0, y + 150], [x0 + w, y + 150]], 3, alpha(U.cream, 0.4 * k));
  const jx = x0 + L * 0.5 * rc, mx = x0 + L * rc;
  // the airliner (cream outline)
  if (k > 0.2) { g.save(); g.translate(jx, y - 60); g.strokeStyle = U.cream; g.lineWidth = 5; g.beginPath(); g.moveTo(-120, 0); g.quadraticCurveTo(-110, -22, -60, -24); g.lineTo(110, -24); g.quadraticCurveTo(150, -12, 110, 10); g.lineTo(-100, 10); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(0, -12); g.lineTo(-40, 50); g.lineTo(-10, 50); g.lineTo(40, -12); g.stroke(); g.beginPath(); g.moveTo(-100, -20); g.lineTo(-120, -60); g.lineTo(-90, -60); g.lineTo(-70, -22); g.stroke(); g.restore(); }
  if (k > 0.4) { circle(g, mx, y + 80, 16, U.blueprint); ring(g, mx, y + 80, 16, 4, U.cream); for (let i = 1; i < 4; i++) seg(g, [[mx - 20 - i * 24, y + 80], [mx - 34 - i * 24, y + 80]], 3, alpha(U.cream, 0.6 - i * 0.15)); }
  lbl(g, 'AIRLINER ~250 m/s', jx, y - 140, { alpha: clamp(k * 2 - 1), size: 28 }); lbl(g, 'AIR MOLECULE ~500 m/s', mx, y + 130, { alpha: clamp(k * 2 - 1), size: 28 });
  if (rc > 0.95) cream(g, 'about twice as fast', x, y + 210, { size: 30 });
  return { jet: [jx, y - 60], mol: [mx, y + 80] };
}
export function lungs(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, br = clamp(o.breathe ?? 0.5), fz = clamp(o.frozen ?? 0), dz = 40 * s * br * (1 - fz);
  // body outline + head
  draw(g, [[x - 220 * s, y + 260 * s], [x - 230 * s, y - 120 * s], [x - 120 * s, y - 220 * s], [x - 50 * s, y - 230 * s]], k, { w: 5, color: U.cream }); draw(g, [[x + 220 * s, y + 260 * s], [x + 230 * s, y - 120 * s], [x + 120 * s, y - 220 * s], [x + 50 * s, y - 230 * s]], k, { w: 5, color: U.cream });
  ring(g, x, y - 340 * s, 100 * s * clamp(k * 2), 5, U.cream);
  // airway + two lungs that swell with the breath
  draw(g, [[x, y - 260 * s], [x, y - 120 * s]], k, { w: 12 * s, color: U.blueprint });
  for (const sd of [-1, 1]) { const lx = x + sd * 110 * s, ly = y - 10 * s + dz * 0.3, sw = 1 + 0.12 * br * (1 - fz); g.save(); g.globalAlpha *= clamp(k * 2 - 0.5); g.fillStyle = alpha(U.blueprint, 0.35); g.beginPath(); g.ellipse(lx, ly, 90 * s * sw, 150 * s * sw, 0, 0, 7); g.fill(); g.strokeStyle = U.cream; g.lineWidth = 4; g.stroke(); g.restore(); }
  const dy = y + 170 * s + dz; draw(g, [[x - 210 * s, dy - 20 * s], [x - 100 * s, dy + 10 * s], [x, dy + 20 * s], [x + 100 * s, dy + 10 * s], [x + 210 * s, dy - 20 * s]], k, { w: 7, color: U.gold });
  if (br > 0.05 && fz < 0.5) arrow(g, x, dy - 40 * s, x, dy + 40 * s, U.gold, 5);
  // air flowing in at the mouth (or stuck there)
  for (let i = 0; i < 4; i++) { const u = fz > 0.5 ? 0 : ((t * 0.8 + i / 4) % 1), px = x - 220 * s + u * 200 * s, py = y - 350 * s + i * 14 * s; if (k > 0.5) arrow(g, px - 60 * s, py, px, py, alpha('#bfe0ff', fz > 0.5 ? 0.4 : 0.8 * Math.sin(u * Math.PI) + 0.1), 3); }
  if (fz > 0.01) lbl(g, 'NO PUSH, NO AIR', x, y - 500 * s, { color: U.accent, alpha: fz });
  return { diaphragm: [x + 150 * s, dy], airway: [x, y - 200 * s] };
}
export function kitchenAir(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, sh = o.show ?? 1, A = {};
  // 1: the room box 4 m x 4 m x 2.5 m
  const rk = clamp(sh) * k; if (rk > 0.01) { const bx = x - 360 * s, by = y + 120 * s, W = 320 * s, H = 200 * s, D = 160 * s;
    draw(g, [[bx - W / 2, by], [bx + W / 2, by], [bx + W / 2, by - H], [bx - W / 2, by - H], [bx - W / 2, by]], rk, { w: 5, color: U.cream });
    draw(g, [[bx - W / 2, by - H], [bx - W / 2 + D, by - H - D * 0.5], [bx + W / 2 + D, by - H - D * 0.5], [bx + W / 2, by - H]], rk, { w: 4, color: U.cream }); draw(g, [[bx + W / 2 + D, by - H - D * 0.5], [bx + W / 2 + D, by - D * 0.5], [bx + W / 2, by]], rk, { w: 4, color: U.cream });
    lbl(g, '4 m', bx, by + 40 * s, { size: 28, alpha: rk }); lbl(g, '4 m', bx + W / 2 + D * 0.75, by - D * 0.1, { size: 28, alpha: rk, align: 'left' }); lbl(g, '2.5 m', bx - W / 2 - 20 * s, by - H / 2, { size: 28, alpha: rk, align: 'right' });
    cream(g, '= 40 m³  x  1.2 kg/m³', bx + 60 * s, by + 100 * s, { size: 30, alpha: rk }); A.room = [bx, by - H]; }
  // 2: a balance: the room's air vs a kid
  const bk = clamp(sh - 1) * k; if (bk > 0.01) { g.save(); g.globalAlpha *= bk; const cx = x + 380 * s, cy = y + 40 * s, tilt = 0.02 * Math.sin(t * 1.5);
    poly(g, [[cx, cy], [cx - 30 * s, cy + 150 * s], [cx + 30 * s, cy + 150 * s]], alpha(U.blueprint, 0.9)); g.save(); g.translate(cx, cy); g.rotate(tilt); seg(g, [[-230 * s, 0], [230 * s, 0]], 6, U.cream);
    for (const sd of [-1, 1]) { seg(g, [[sd * 200 * s, 0], [sd * 200 * s, 60 * s]], 3, U.cream); seg(g, [[sd * 200 * s - 70 * s, 60 * s], [sd * 200 * s + 70 * s, 60 * s]], 5, U.cream); }
    for (let i = 0; i < 14; i++) circle(g, -250 * s + (i % 5) * 26 * s, 40 * s - Math.floor(i / 5) * 22 * s, 8 * s, alpha(U.blueprint, 0.9));   // a heap of air
    ring(g, 200 * s, -50 * s, 20 * s, 4, U.cream); seg(g, [[200 * s, -30 * s], [200 * s, 20 * s]], 4, U.cream); seg(g, [[200 * s, 20 * s], [186 * s, 56 * s]], 4, U.cream); seg(g, [[200 * s, 20 * s], [214 * s, 56 * s]], 4, U.cream); seg(g, [[180 * s, -10 * s], [220 * s, -10 * s]], 4, U.cream);
    g.restore(); lbl(g, '~48 kg OF AIR', cx - 200 * s, cy + 200 * s, { size: 30 }); cream(g, 'about as much as you', cx + 200 * s, cy + 200 * s, { size: 26 }); g.restore(); A.scale = [cx, cy]; }
  return A;
}

// =====================================================================================================
// MOTION
// =====================================================================================================
function catOutline(g, x, y, s, col, w = 4) {   // a leaping cat, cream line art
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round';
  g.beginPath(); g.ellipse(0, 0, 70, 26, -0.1, 0, 7); g.stroke(); g.beginPath(); g.arc(78, -18, 24, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(66, -38); g.lineTo(72, -60); g.lineTo(84, -40); g.moveTo(88, -40); g.lineTo(98, -58); g.lineTo(102, -34); g.stroke();
  for (const [a, b] of [[40, 50], [60, 40], [-50, 50], [-30, 56]]) { g.beginPath(); g.moveTo(a, 10); g.lineTo(a + (a > 0 ? 34 : -34), b); g.stroke(); }
  g.beginPath(); g.moveTo(-68, -6); g.quadraticCurveTo(-120, -40, -110, -90); g.stroke(); g.restore();
}
export function newton1(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1300, k = 1 } = o, go = clamp(o.go ?? 1), x0 = x - w / 2, x1 = x + w / 2;
  const path = (u) => [lerp(x0 + 80, x1 - 80, u), y + 140 - Math.sin(u * Math.PI) * 300];
  g.save(); g.setLineDash([14, 12]); draw(g, Array.from({ length: 30 }, (_, i) => path(i / 29)), k, { w: 3, color: alpha(U.cream, 0.55) }); g.restore();
  const u = lerp(0.12, 0.88, ease.inOut(go)), [cx, cy] = path(u), [nx, ny] = path(Math.min(1, u + 0.02)), ang = Math.atan2(ny - cy, nx - cx);
  if (k > 0.3) { g.save(); g.translate(cx, cy); g.rotate(ang); catOutline(g, 0, 0, 1, U.cream); g.restore(); for (let i = 1; i < 4; i++) { const [gx, gy] = path(u - i * 0.03); circle(g, gx, gy, 5 - i, alpha(U.cream, 0.5 - i * 0.12)); } }
  if (k > 0.6) arrow(g, cx + Math.cos(ang) * 120, cy + Math.sin(ang) * 120, cx + Math.cos(ang) * 230, cy + Math.sin(ang) * 230, U.gold, 6);
  lbl(g, 'KEEPS MOVING', cx + 40, cy - 110, { alpha: clamp(k * 2 - 1) });
  cream(g, '...UNLESS A FORCE ACTS', x, y + 230, { size: 32, alpha: clamp(k * 2 - 1) });
  return { cat: [cx, cy - 40], path: path(0.5) };
}
export function momentum(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1300, k = 1 } = o, sh = o.show ?? 2, A = { formula: [x - w * 0.25, y - 220] };
  if (k > 0.05) text(g, 'p = m x v', x - w * 0.25, y - 220, { size: 76, color: U.gold, font: FONTS.title, weight: 700, alpha: clamp(k * 2), glow: 14, glowColor: alpha(U.gold, 0.5) });
  cream(g, 'MOMENTUM = MASS x SPEED', x - w * 0.25, y - 150, { size: 28, alpha: clamp(k * 2 - 0.5) });
  const bk = clamp(sh) * k; if (bk > 0.01) { const x0 = x - w * 0.5 + 40, e = ease.out(bk);
    for (const [i, name, v] of [[0, 'LIGHT + SLOW', 0.25], [1, 'HEAVY + FAST', 1]]) { const yy = y - 40 + i * 90; rr(g, x0, yy, w * 0.42 * v * e, 50, 10); g.fillStyle = alpha(i ? U.gold : U.blueprint, 0.75); g.fill(); cream(g, name, x0 + 10, yy - 18, { align: 'left', size: 24 }); }
    cream(g, 'harder to stop', x0 + w * 0.42 + 20, y + 76, { align: 'left', size: 26, alpha: e }); }
  const gk = clamp(sh - 1) * k; if (gk > 0.01) { g.save(); g.globalAlpha *= gk; const gx = x + w * 0.3, gy = y + 20;
    ring(g, gx - 160, gy, 40, 5, U.cream); for (const a of [0.6, 2.2, 3.9]) seg(g, [[gx - 160 + Math.cos(a) * 14, gy + Math.sin(a) * 14], [gx - 160 + Math.cos(a) * 40, gy + Math.sin(a) * 40]], 3, alpha(U.cream, 0.6));
    arrow(g, gx - 340, gy, gx - 210, gy, U.blueprint, 6);
    rr(g, gx - 80, gy - 90, 110, 160, 40); g.strokeStyle = U.cream; g.lineWidth = 5; g.stroke(); for (let i = 0; i < 4; i++) { rr(g, gx - 76 + i * 26, gy - 140, 22, 60, 10); g.stroke(); } rr(g, gx + 30, gy - 40, 50, 30, 12); g.stroke();
    arrow(g, gx + 140, gy, gx - 10, gy, U.gold, 6); lbl(g, 'PUSH AGAINST IT', gx + 20, gy + 140, { size: 28 }); g.restore(); A.glove = [gx, gy - 90]; }
  return A;
}

// =====================================================================================================
// THE STOPPED-CLOCK ILLUSION (chronostasis)
// =====================================================================================================
export function chronostasis(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1400, k = 1 } = o, jp = clamp(o.jump ?? 1), fl = clamp(o.fill ?? 1), x0 = x - w / 2;
  // the eye (simple) and the clock it jumps to
  const ex = x0 + 160, ey = y - 200, cx = x0 + w - 220, cy = y - 220;
  if (k > 0.05) { g.strokeStyle = U.cream; g.lineWidth = 5; g.beginPath(); g.moveTo(ex - 90, ey); g.quadraticCurveTo(ex, ey - 70, ex + 90, ey); g.quadraticCurveTo(ex, ey + 70, ex - 90, ey); g.stroke(); const lx = lerp(-20, 30, jp); circle(g, ex + lx, ey, 28, U.blueprint); circle(g, ex + lx, ey, 12, '#0b1324'); }
  if (k > 0.2) { ring(g, cx, cy, 110, 6, U.cream); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; seg(g, [[cx + Math.cos(a) * 90, cy + Math.sin(a) * 90], [cx + Math.cos(a) * 104, cy + Math.sin(a) * 104]], 3, U.cream); } const sa = -Math.PI / 2 + (fl > 0.9 ? 0 : 0); seg(g, [[cx, cy], [cx + Math.cos(sa) * 92, cy + Math.sin(sa) * 92]], 5, U.gold); circle(g, cx, cy, 8, U.cream); }
  // saccade arcs (the eye jumps)
  if (k > 0.4) { for (let i = 0; i < 3; i++) { g.save(); g.setLineDash([10, 10]); g.strokeStyle = alpha(U.cream, 0.6 - i * 0.15); g.lineWidth = 3; g.beginPath(); g.moveTo(ex + 120, ey - 20 - i * 20); g.quadraticCurveTo((ex + cx) / 2, ey - 160 - i * 30, cx - 130, cy - i * 16); g.stroke(); g.restore(); } arrow(g, cx - 200, cy - 40, cx - 130, cy - 6, U.gold, 5, jp); lbl(g, '~3 JUMPS A SECOND', (ex + cx) / 2, ey - 210, { size: 30 }); }
  // the timeline: before | blurred jump (hidden) | the new view, backfilled
  const ty = y + 120, tx0 = x0 + 120, tx1 = x0 + w - 120, j0 = lerp(tx0, tx1, 0.35), j1 = lerp(tx0, tx1, 0.47);
  if (k > 0.5) { seg(g, [[tx0, ty], [tx1, ty]], 4, U.cream); rr(g, tx0, ty - 30, j0 - tx0, 60, 10); g.fillStyle = alpha(U.blueprint, 0.5); g.fill(); cream(g, 'LOOKING AWAY', (tx0 + j0) / 2, ty, { size: 22 });
    g.save(); g.setLineDash([6, 6]); rr(g, j0, ty - 30, j1 - j0, 60, 10); g.strokeStyle = alpha(U.cream, 0.6); g.lineWidth = 3; g.stroke(); g.restore(); cream(g, 'BLUR', (j0 + j1) / 2, ty, { size: 22, alpha: 1 - fl });
    const bx0 = lerp(j1, j0, ease.out(fl)); rr(g, bx0, ty - 30, tx1 - bx0, 60, 10); g.fillStyle = alpha(U.gold, 0.6); g.fill(); cream(g, 'THE CLOCK (BRAIN FILLS THE GAP)', (j1 + tx1) / 2, ty, { size: 22 });
    if (fl > 0.5) { arrow(g, j1 + 30, ty + 70, j0 + 10, ty + 70, U.gold, 5); lbl(g, 'FIRST TICK FEELS TOO LONG', (j0 + tx1) / 2, ty + 112, { size: 28 }); } }
  stamp(g, '2001 STUDY, LONDON (UCL)', x, y + 340, clamp(k * 2 - 1.2), U.cream, -0.04, 30);
  return { eye: [ex, ey - 50], clock: [cx, cy - 110], gap: [(j0 + j1) / 2, ty - 30] };
}

// =====================================================================================================
// GPS
// =====================================================================================================
export function gpsClocks(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1400, k = 1 } = o, sh = o.show ?? 3, ex = x - w * 0.28, ey = y + 80;
  // Earth, an orbit, the satellite
  if (k > 0.05) { circle(g, ex, ey, 150 * k, alpha(U.blueprint, 0.5)); ring(g, ex, ey, 150 * k, 5, U.cream); g.save(); g.strokeStyle = alpha(U.cream, 0.6); g.lineWidth = 3; g.beginPath(); g.ellipse(ex, ey, 330, 130, -0.25, 0, 7); g.stroke(); g.restore(); }
  const a = -1.9 + t * 0.25, sx = ex + Math.cos(a) * 330 * Math.cos(-0.25) - Math.sin(a) * 130 * Math.sin(-0.25), sy = ey + Math.cos(a) * 330 * Math.sin(-0.25) + Math.sin(a) * 130 * Math.cos(-0.25);
  if (k > 0.3) { rr(g, sx - 24, sy - 18, 48, 36, 6); g.strokeStyle = U.cream; g.lineWidth = 4; g.stroke(); seg(g, [[sx - 70, sy], [sx - 26, sy]], 10, U.blueprint); seg(g, [[sx + 26, sy], [sx + 70, sy]], 10, U.blueprint); ring(g, sx, sy - 44, 16, 3, U.gold); seg(g, [[sx, sy - 44], [sx, sy - 54]], 2, U.gold); }
  if (k > 0.3) { ring(g, ex, ey - 150 - 30, 16, 3, U.cream); seg(g, [[ex, ey - 180], [ex + 8, ey - 186]], 2, U.cream); }
  // the ledger
  const lx = x + w * 0.05, ly = y - 160, row = (i, str, col) => { const p = clamp(sh - i) * k; if (p <= 0.01) return; text(g, str, lx, ly + i * 90, { size: 52, color: col, font: FONTS.title, weight: 700, align: 'left', alpha: p, glow: 10, glowColor: alpha(col, 0.4) }); };
  row(0, '+45 µs/day', U.gold); if (sh > 0.3) cream(g, 'weaker gravity: ticks faster', lx + 300, ly + 2, { align: 'left', size: 24, alpha: clamp(sh) });
  row(1, '-7 µs/day', U.blueprint); if (sh > 1.3) cream(g, 'orbital speed: ticks slower', lx + 300, ly + 92, { align: 'left', size: 24, alpha: clamp(sh - 1) });
  if (sh > 2) seg(g, [[lx, ly + 140], [lx + 540, ly + 140]], 4, alpha(U.cream, clamp(sh - 2)));
  row(2, '= +38 µs/day', U.gold); if (sh > 2.6) stamp(g, 'UNCORRECTED: OFF BY KILOMETRES', lx + 270, ly + 330, clamp((sh - 2.6) / 0.4), U.accent, -0.05, 30);
  return { sat: [sx, sy - 60], ground: [ex, ey - 190], total: [lx + 200, ly + 180] };
}

// =====================================================================================================
// THE REAL LAB: Lene Hau's team, Harvard, 2001
// =====================================================================================================
export function hauLight(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1400, k = 1 } = o, st = clamp(o.stop ?? 1), rl = clamp(o.release ?? 0), x0 = x - w / 2, x1 = x + w / 2, r = rng(23);
  // the ultracold atom cloud (sodium), a cool glow
  if (k > 0.1) { glow(g, x, y, 260, '#9fd8ff', 0.25 * k); for (let i = 0; i < 90 * k; i++) { const a = r() * 7, d = Math.sqrt(r()) * 200; circle(g, x + Math.cos(a) * d * 1.3, y + Math.sin(a) * d * 0.7, 3 + r() * 2, alpha('#cfeaff', 0.7)); } g.save(); g.setLineDash([8, 8]); g.strokeStyle = alpha(U.cream, 0.6); g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 280, 150, 0, 0, 7); g.stroke(); g.restore(); }
  // the laser + the pulse
  if (k > 0.3) { seg(g, [[x0 + 60, y], [x0 + 200, y]], 18, alpha(U.blueprint, 0.9)); rr(g, x0, y - 40, 80, 80, 10); g.strokeStyle = U.cream; g.lineWidth = 4; g.stroke(); }
  const px = rl > 0 ? lerp(x, x1 - 80, ease.in(rl)) : lerp(x0 + 220, x, ease.out(st));
  if (k > 0.4) { for (let i = 0; i < 5; i++) photonDot(g, px - i * 16 * (st < 1 || rl > 0 ? 1 : 0.2), y, 10 - i, 1 - i * 0.15); if (st >= 1 && rl <= 0) { ring(g, px, y, 34 + 4 * Math.sin(t * 6), 3, alpha(U.gold, 0.8)); stillTick(g, px, y, 1); } }
  cream(g, 'ULTRACOLD ATOMS', x, y + 200, { size: 26, alpha: clamp(k * 2 - 1) });
  if (st >= 1) lbl(g, rl > 0 ? 'LET GO AGAIN' : 'STOPPED ~1/1000 s', x, y - 200);
  stamp(g, "2001, HARVARD: LENE HAU'S TEAM", x, y + 290, clamp(k * 2 - 1.2), U.cream, -0.03, 30);
  return { cloud: [x + 200, y - 120], pulse: [px, y - 30] };
}
