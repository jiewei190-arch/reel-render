// C_lib.js — shared local helpers for ep 5 batch C (s052-s081). Registers no shots.
//   push(g, t, dur, fn, amt)          slow push-in (<= 4%) around the frame centre (boards)
//   goldPop(g, t, str, at, x, y, size, o)   big gold number/word that pops on its word (outBack); o.until fades it, o.color, o.rot
//   fade(g, a, fn)  cTxt(g, str, x, y, o)   alpha wrapper / cream bp text
//   hero(g, o)                         actor('HERO') + the LOCAL cyan zip pull + cuff stripes (cast.js has no trim field)
//   bowl(g, x, y, s)                   the cereal bowl (as DEMO_statcard) + spoon(g, x, y, s, fold 0..1)
//   benchProp(g, x, y, s, rot)         the wooden park bench as a liftable sprite (park({bench:false}) when it is lifted)
//   stopwatch(g, t, x, y, s, sec, run) Mina's stopwatch with gold digits
//   ringPhone(g, t, x, y, s, on)       Dev's phone with a clip-on ring light (glow)
//   night(g, t, cam, o) -> P           the autumn night park (park + its lamps); post(g, o) = bloom then nightGrade (call LAST)
//   bpFig(g, x, y, s, k, o)            a cream line-figure for the boards (o.arms: 0 down .. 1 overhead, o.legs bend)
//   bpCar(g, x, y, s, k)               a cream car outline (side view)
//   bpArrow(g, x0, y0, x1, y1, k, col, w)   a drawn-on arrow
//   soles(g, x, y, s, k, o)            two trainer-sole footprints with gold hatching (o.spread 0..1 stretches the hatch over planks)
//   bar(g, x, y, h, v, max, o)         a vertical pressure bar with marked lines (o.lines: [[value, label, colour]])
import { E, S, clamp, lerp, ease, prog, seg, circle, ring, rr, poly, glow, alpha, shade, text, FONTS } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { draw } from '../sets/bp.js';
import { park } from '../sets/park.js';
import { bloom, nightGrade, P5 } from '../sets/fx5.js';

export function push(g, t, dur, fn, amt = 0.035) { const z = 1 + amt * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); }
export const fade = (g, a, fn) => { if (a <= 0.01) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); };
export function goldPop(g, t, str, at, x, y, size = 110, o = {}) {
  const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; const U = S().ui, out = o.until != null ? clamp((o.until - t) / 0.25) : 1, col = o.color || U.gold;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(p, p); g.globalAlpha *= out; glow(g, 0, 0, size * 1.6, col, 0.2);
  text(g, str, 0, 0, { size, color: col, font: FONTS.title, weight: 700, stroke: size * 0.12, strokeColor: '#140f1c', glow: 18, glowColor: alpha(col, 0.7), spacing: o.spacing ?? 2 }); g.restore();
}
export const cTxt = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 30, color: o.color ?? S().ui.cream, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1 });

// ---------- the hero with his cyan trim ----------
export function hero(g, o) {
  actor(g, 'HERO', o); if (o.rot) return;
  const p = o.pose, s = o.s ?? 1.9, f = o.facing ?? 1, W = (q) => [o.x + q[0] * f * s, o.y + q[1] * s], gl = o.trimGlow ?? 0;
  const z = W([lerp(p.sh[0], p.hip[0], 0.38) + 4, lerp(p.sh[1], p.hip[1], 0.38)]);
  if (gl > 0) glow(g, z[0], z[1], 30 * s, P5.cyan, 0.4 * gl);
  rr(g, z[0] - 2.5 * s / 1.9, z[1] - 6 * s / 1.9, 5 * s / 1.9, 12 * s / 1.9, 2); g.fillStyle = P5.cyan; g.fill();
  for (const [e, h] of [[p.eF, p.hF], [p.eB, p.hB]]) { const a = W([lerp(e[0], h[0], 0.72), lerp(e[1], h[1], 0.72)]), b = W([lerp(e[0], h[0], 0.82), lerp(e[1], h[1], 0.82)]); seg(g, [a, b], 3 * s / 1.9 + 1, alpha(P5.cyan, 0.9)); if (gl > 0) glow(g, a[0], a[1], 18 * s, P5.cyan, 0.3 * gl); }
}

// ---------- kitchen props ----------
export function bowl(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 120, 14, 0, 0, 7); g.fill();
  g.fillStyle = '#f2efe6'; g.beginPath(); g.moveTo(-120, -70); g.quadraticCurveTo(-110, 0, 0, 0); g.quadraticCurveTo(110, 0, 120, -70); g.closePath(); g.fill();
  g.fillStyle = '#fbf6ea'; g.beginPath(); g.ellipse(0, -70, 120, 22, 0, 0, 7); g.fill();
  for (let i = 0; i < 16; i++) circle(g, -90 + (i * 47) % 180, -72 + (i % 3) * 5, 9, i % 2 ? '#e2a64a' : '#c98a32');
  g.fillStyle = '#4a86c8'; rr(g, -100, -46, 200, 10, 5); g.fill(); g.restore();
}
export function spoon(g, x, y, s = 1, fold = 0, rot = -0.5) {   // a steel spoon; fold bends the handle in half
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const b = fold * 2.6, mid = [44, 0], end = [44 + Math.cos(b) * 44, -Math.sin(b) * 44];
  seg(g, [[0, 0], mid, end], 7, '#c8ccd4'); seg(g, [[0, -2], mid], 2, '#f2f4f8');
  g.fillStyle = '#d8dce4'; g.beginPath(); g.ellipse(-14, 0, 18, 11, 0, 0, 7); g.fill(); g.strokeStyle = '#8a909a'; g.lineWidth = 2; g.stroke();
  g.restore();
}
// ---------- park props ----------
export function benchProp(g, x, y, s = 1, rot = 0) {   // centred on (x, y) = middle of the seat; 1 m = 260 units at s 1
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  for (const lx of [-190, 170]) { g.fillStyle = '#2a2a30'; g.fillRect(lx, 0, 20, 90); }
  for (let i = 0; i < 3; i++) { rr(g, -230, -10 + i * 14 - 20, 460, 12, 4); g.fillStyle = i % 2 ? '#8a5a34' : '#9a6a3e'; g.fill(); }
  for (let i = 0; i < 2; i++) { rr(g, -230, -110 + i * 30, 460, 20, 5); g.fillStyle = '#8a5a34'; g.fill(); }
  for (const lx of [-170, 150]) { g.fillStyle = '#2a2a30'; g.fillRect(lx, -110, 14, 90); }
  g.restore();
}
export function stopwatch(g, t, x, y, s = 1, sec = 0, run = true) {
  const U = S().ui; g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -8, -50, 16, 14, 3); g.fillStyle = '#c8ccd4'; g.fill(); circle(g, 0, 0, 40, '#dfe3ea'); circle(g, 0, 0, 33, '#14161c');
  const m = Math.floor(sec / 60), ss = Math.floor(sec % 60); text(g, `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 0, 2, { size: 20, color: U.gold, font: FONTS.ui, weight: 900 });
  if (run) { const a = (t * 6) % (Math.PI * 2); seg(g, [[0, 0], [Math.cos(a) * 28, Math.sin(a) * 28]], 1.5, alpha(U.gold, 0.5)); }
  g.restore();
}
export function ringPhone(g, t, x, y, s = 1, on = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (on > 0) glow(g, 0, -10, 160, '#fff4e0', 0.35 * on);
  ring(g, 0, -10, 24, 7, alpha('#fffaf0', 0.6 + 0.4 * on)); rr(g, -10, -26, 20, 34, 4); g.fillStyle = '#111'; g.fill(); g.fillStyle = '#9fd8ff'; g.fillRect(-7, -22, 14, 26);
  circle(g, 6, 2, 3, '#ff4040'); g.restore();
}
export function night(g, t, cam, o = {}) { return park(g, t, cam, { season: 'autumn', mood: 'night', bridge: false, ...o }); }
export function post(g, o = {}) { bloom(g, { threshold: 0.6, strength: o.bloom ?? 0.8 }); nightGrade(g, { k: 1, vignette: 0.6, violet: o.violet ?? 0.3 }); }

// ---------- blueprint pieces (cream line art, gold accents) ----------
const U = () => S().ui;
export function bpFig(g, x, y, s = 1, k = 1, o = {}) {      // feet at (x, y), ~300 px tall at s 1
  const a = clamp(o.arms ?? 0), bend = o.legs ?? 0, col = o.color || U().cream, w = o.w ?? 6, hip = [x, y - 150 * s + bend * 30 * s], sh = [x, y - 250 * s + bend * 30 * s];
  draw(g, [[x - 34 * s, y], [x - 20 * s - bend * 30 * s, y - 75 * s], hip, [x + 20 * s + bend * 30 * s, y - 75 * s], [x + 34 * s, y]], k, { w, color: col });
  draw(g, [hip, sh], k, { w, color: col });
  for (const sd of [-1, 1]) draw(g, [sh, [x + sd * lerp(40, 46, a) * s, lerp(sh[1] + 60 * s, sh[1] - 46 * s, a)], [x + sd * lerp(46, 40, a) * s, lerp(sh[1] + 110 * s, sh[1] - 110 * s, a)]], k, { w, color: col });
  if (k > 0.5) { ring(g, x, sh[1] - 40 * s, 32 * s, w, alpha(col, clamp(k * 2 - 1))); }
  return { hands: [x, sh[1] - 110 * s], feet: [x, y], head: [x, sh[1] - 40 * s] };
}
export function bpCar(g, x, y, s = 1, k = 1, col) {        // (x, y) = middle of the underside
  const c = col || U().cream;
  draw(g, [[x - 200 * s, y], [x - 210 * s, y - 50 * s], [x - 150 * s, y - 60 * s], [x - 90 * s, y - 115 * s], [x + 70 * s, y - 115 * s], [x + 140 * s, y - 60 * s], [x + 210 * s, y - 50 * s], [x + 205 * s, y], [x - 200 * s, y]], k, { w: 5, color: c });
  if (k > 0.6) { const a = clamp((k - 0.6) / 0.4); g.save(); g.globalAlpha *= a; for (const wx of [-120, 120]) { ring(g, x + wx * s, y + 4 * s, 34 * s, 5, c); circle(g, x + wx * s, y + 4 * s, 10 * s, c); } seg(g, [[x - 80 * s, y - 108 * s], [x - 80 * s, y - 62 * s]], 3, c); seg(g, [[x + 10 * s, y - 112 * s], [x + 10 * s, y - 62 * s]], 3, c); g.restore(); }
}
export function bpArrow(g, x0, y0, x1, y1, k = 1, col, w = 10) {
  if (k <= 0.01) return; const c = col || U().gold, x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y1 - y0, x1 - x0), h = w * 2.6;
  seg(g, [[x0, y0], [x - Math.cos(a) * h * 0.6, y - Math.sin(a) * h * 0.6]], w, c);
  poly(g, [[x, y], [x - Math.cos(a) * h + Math.sin(a) * h * 0.7, y - Math.sin(a) * h - Math.cos(a) * h * 0.7], [x - Math.cos(a) * h - Math.sin(a) * h * 0.7, y - Math.sin(a) * h + Math.cos(a) * h * 0.7]], c);
  glow(g, x, y, h * 2, c, 0.15);
}
export function soles(g, x, y, s = 1, k = 1, o = {}) {      // two footprints side by side, centred on (x, y)
  const sp = clamp(o.spread ?? 0), c = U().cream, gd = U().gold;
  for (const sd of [-1, 1]) { const cx = x + sd * 70 * s;
    const pts = Array.from({ length: 25 }, (_, i) => { const a = i / 24 * Math.PI * 2, rx = 42 * s, ry = 110 * s, pinch = 1 - 0.25 * Math.max(0, Math.sin(a)) * (Math.abs(Math.cos(a)) < 0.4 ? 1 : 0); return [cx + Math.cos(a) * rx * pinch, y + Math.sin(a) * ry]; });
    if (k > 0.3) { g.save(); g.globalAlpha *= clamp((k - 0.3) / 0.4); g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.clip(); g.strokeStyle = alpha(gd, 0.85); g.lineWidth = 3; for (let i = -12; i < 12; i++) { g.beginPath(); g.moveTo(cx + i * 12 * s - 60 * s, y - 120 * s); g.lineTo(cx + i * 12 * s + 60 * s, y + 120 * s); g.stroke(); } g.restore(); }
    draw(g, pts, k, { w: 5, color: c }); }
  if (sp > 0.01) { g.save(); g.globalAlpha *= sp; g.strokeStyle = alpha(gd, 0.5); g.lineWidth = 3; const w = lerp(160, 900, sp) * s; for (let i = -40; i < 40; i++) { const px = x + i * 14 * s; if (Math.abs(px - x) > w / 2) continue; g.beginPath(); g.moveTo(px - 30 * s, y - 120 * s); g.lineTo(px + 30 * s, y + 120 * s); g.stroke(); } g.restore(); }
}
export function bar(g, x, y, h, v, max, o = {}) {          // (x, y) = bottom of the bar
  const c = U().cream, gd = U().gold, w = o.w ?? 70, k = clamp(v / max);
  rr(g, x - w / 2, y - h, w, h, 10); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
  rr(g, x - w / 2 + 6, y - 6 - (h - 12) * k, w - 12, (h - 12) * k, 6); g.fillStyle = alpha(o.color || gd, 0.8); g.fill();
  for (const [lv, lbl, col] of (o.lines || [])) { const ly = y - 6 - (h - 12) * clamp(lv / max); g.save(); g.setLineDash([10, 8]); seg(g, [[x - w / 2 - 30, ly], [x + w / 2 + 30, ly]], 4, col || c); g.restore(); if (lbl) cTxt(g, lbl, x + w / 2 + 44, ly, { align: 'left', size: 26, color: col || c }); }
  return { top: [x, y - 6 - (h - 12) * k] };
}
