// sets/stopprops.js — "What If You Could Freeze Time for 10 Seconds?" PROPS + kitchen beats (classic What If style, 16:9 1920x1080).
// Draw on home3(g,t,cam,{room:'kitchen'}) (pos.tableX / tableTop / counterTop) or any set. All deterministic (t, rng). Numbers in gold.
// LEGAL: original props only. The power is only ever a finger snap: no remote, no gadget, no clock-face symbols on the hero.
//
// MINA'S STOPWATCH
//   stopwatch(g, t, { x, y, s, sec: number (shown as '0.0'..'10.0'), running: 0|1, press: 0..1 (button pushed), label })
//   swSec(t, { start, stop, from = 0 }) -> seconds shown (counts from `start`, holds at `stop`); swSec with stop === start gives 0.0
// THE KITCHEN CLOCK (the stuck second hand: chronostasis)
//   wallClock(g, t, { x, y, r, h: hours (float), sec: seconds (float), stick: 0..1 (a soft pulse on the hand while it seems stuck) })
//   stickSec(t, { at, sec0, hold = 1.4 }) -> second-hand value that ticks once a second from sec0, but the FIRST tick after `at` holds for
//       `hold` seconds (looks stuck), then ticks normally again (the beat "the second hand doesn't move ... then it ticks")
// THE OVEN CLOCK vs THE HERO'S WATCH (40 s apart)
//   ovenClock(g, x, y, s, { time: 'HH:MM:SS', glow })     a green LED readout set in a black oven panel (with two knobs)
//   heroWatch(g, x, y, s, { time: 'HH:MM:SS', glow })     the chunky black digital watch (too big for the wrist), grey LCD digits
//   timeDiff(g, t, at, x, y, { str: '+40 s' })             a gold tag that pops between them
//   clockStr(sec) -> 'HH:MM:SS'
// JUICE + SOCKS
//   juiceGlass(g, x, y, s, { tip: 0..1 (falls over the table edge), fill: 0..1, rot })
//   juiceSplash(g, t, at, x, y, { s, color, dir })        the landing splash (burst ring, droplets on arcs, a puddle that spreads)
//   juiceArc(t, { from:[x,y], to:[x,y], at, dur, h }) -> { x, y, rot, k, done }   the fall path for the glass
//   socks(g, x, y, s, { stain: 0..1 (white -> orange), wiggle })   Mina's pair of socks on the floor/feet
// MILK JUG + BOWL + PROJECT
//   milkJug(g, x, y, s, { tip: 0..1, level: 0..1, rot })  a cream jug with a blue band; returns the spout point [x, y]
//   milkPour(g, t, { from:[x,y], to:[x,y], k: 0..1, w })   a milk stream (thick ribbon + drops) from spout to target
//   mixingBowl(g, x, y, s, { fill: 0..1 (milk inside), splash: 0..1 })   the big mixing bowl (rim at y)
//   schoolProject(g, t, x, y, s, { wet: 0..1, slide })      Mina's cardboard volcano (paper-mache cone, red lava, a little flag, a label card)
// BIN, BUTTER, TOAST
//   bin(g, x, y, s, { lid: 0..1 (open), wobble, cat: 0..1 (Biscuit's ears + glare poking out) , t })
//   butterDish(g, x, y, s, { bite: 0..1, lid: 0..1 })
//   toast(g, x, y, s, { bite: 0..1, butter: 0..1, rot })  a slice of toast (bites taken out of a corner)
// DEV FILMING
//   devCam(g, t, { x, y, s, rot, at, sec0, zoom, tag: 'DEV CAM', sneeze: 0..1 }, (g, w, h) => content)   Dev's phone UI (home3 filmPhone /
//       spiderprops devPhone) + a little 'FREEZE?' caption chip when o.caption is set
import { E, S, clamp, lerp, ease, prog, rng, noise, seg, circle, ring, rr, poly, alpha, shade, mix, glow, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { devPhone } from './spiderprops.js';

const ui = () => S().ui;
const GOLD = '#FFC93C', INK = '#1a1622';

// ---------------------------------------------------------------- STOPWATCH
export const swSec = (t, o = {}) => { const st = o.start ?? 0, sp = o.stop ?? Infinity, from = o.from ?? 0; return from + clamp(Math.min(t, sp) - st, 0, 1e9); };
export function stopwatch(g, t, o = {}) {
  const x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, s = o.s ?? 1, press = clamp(o.press ?? 0), sec = o.sec ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(10, 14, 150, 150, 0, 0, 7); g.fill();
  // crown + buttons
  rr(g, -26, -200 + press * 10, 52, 40, 10); g.fillStyle = '#b8bec8'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  rr(g, -14, -172, 28, 26, 6); g.fillStyle = '#8a909a'; g.fill(); g.stroke();
  g.save(); g.rotate(0.7); rr(g, -14, -182, 28, 30, 8); g.fillStyle = '#d4262e'; g.fill(); g.stroke(); g.restore();
  // body
  g.fillStyle = linGrad(g, 0, -150, 0, 150, ['#e8ecf2', '#aab2bc']); g.beginPath(); g.arc(0, 0, 150, 0, 7); g.fill(); g.lineWidth = 7; g.stroke();
  g.fillStyle = '#f8f6ee'; g.beginPath(); g.arc(0, 0, 126, 0, 7); g.fill(); g.lineWidth = 4; g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 - Math.PI / 2, l = i % 5 ? 8 : 16; seg(g, [[Math.cos(a) * (120 - l), Math.sin(a) * (120 - l)], [Math.cos(a) * 120, Math.sin(a) * 120]], i % 5 ? 2 : 4, INK); }
  // sweep hand (one turn per 60 s) + digital window
  const a = (sec % 60) / 60 * Math.PI * 2 - Math.PI / 2; seg(g, [[0, 0], [Math.cos(a) * 100, Math.sin(a) * 100]], 4, '#d4262e'); circle(g, 0, 0, 8, '#d4262e');
  rr(g, -82, 22, 164, 64, 12); g.fillStyle = '#20302a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  text(g, sec.toFixed(1), 0, 56, { size: 50, color: o.running ? '#a8ffb8' : '#7ae08a', font: FONTS.ui, weight: 900, glow: o.running ? 10 : 0, glowColor: 'rgba(120,255,150,.6)' });
  if (o.label) text(g, o.label, 0, -60, { size: 26, color: '#5a5462', font: FONTS.ui, weight: 900, spacing: 2 });
  g.restore();
}

// ---------------------------------------------------------------- WALL CLOCK (the stuck second hand)
export function stickSec(t, o = {}) {
  const at = o.at ?? 0, s0 = o.sec0 ?? 0, hold = o.hold ?? 1.4;
  if (t < at) return s0 + Math.floor(t);
  const u = t - at; const base = s0 + Math.floor(at); return u < hold ? base : base + 1 + Math.floor(u - hold);
}
export function wallClock(g, t, o = {}) {
  const x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, r = o.r ?? 140, h = o.h ?? 7.7, sec = o.sec ?? (t % 60), st = clamp(o.stick ?? 0);
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.arc(r * 0.06, r * 0.08, r * 1.06, 0, 7); g.fill();
  circle(g, 0, 0, r * 1.08, '#2a2230'); circle(g, 0, 0, r, '#f6f1e6');
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, l = i % 5 ? r * 0.05 : r * 0.12; seg(g, [[Math.sin(a) * (r * 0.92 - l), -Math.cos(a) * (r * 0.92 - l)], [Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92]], i % 5 ? r * 0.012 : r * 0.03, INK); }
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; text(g, String(i), Math.sin(a) * r * 0.68, -Math.cos(a) * r * 0.68 + r * 0.02, { size: r * 0.17, color: INK, font: FONTS.ui, weight: 900 }); }
  const ha = (h % 12) / 12 * Math.PI * 2, ma = ((h * 60) % 60) / 60 * Math.PI * 2, sa = (sec % 60) / 60 * Math.PI * 2;
  seg(g, [[0, 0], [Math.sin(ha) * r * 0.45, -Math.cos(ha) * r * 0.45]], r * 0.06, INK);
  seg(g, [[0, 0], [Math.sin(ma) * r * 0.7, -Math.cos(ma) * r * 0.7]], r * 0.04, INK);
  if (st > 0) { g.save(); g.globalAlpha *= 0.5 * st * (0.6 + 0.4 * Math.sin(t * 8)); seg(g, [[0, 0], [Math.sin(sa) * r * 0.86, -Math.cos(sa) * r * 0.86]], r * 0.07, alpha('#d4262e', 0.6)); g.restore(); glow(g, 0, 0, r * 1.4, '#9ac8ff', 0.15 * st); }
  seg(g, [[-Math.sin(sa) * r * 0.16, Math.cos(sa) * r * 0.16], [Math.sin(sa) * r * 0.86, -Math.cos(sa) * r * 0.86]], r * 0.018, '#d4262e'); circle(g, 0, 0, r * 0.05, '#d4262e');
  g.restore();
}

// ---------------------------------------------------------------- OVEN CLOCK vs WATCH
export const clockStr = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600) % 24, m = Math.floor(sec / 60) % 60, s = sec % 60; return [h, m, s].map(v => String(v).padStart(2, '0')).join(':'); };
export function ovenClock(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -330, -90, 660, 180, 18); g.fillStyle = '#2a2a30'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  for (const kx of [-250, 250]) { circle(g, kx, 0, 46, '#c8ccd4'); ring(g, kx, 0, 46, 5, INK); seg(g, [[kx, -10], [kx, -40]], 6, INK); }
  rr(g, -170, -54, 340, 108, 10); g.fillStyle = '#0a120c'; g.fill();
  text(g, o.time ?? '18:42:00', 0, 4, { size: 70, color: '#58f07a', font: FONTS.ui, weight: 900, glow: o.glow === false ? 0 : 16, glowColor: 'rgba(88,240,122,.7)', spacing: 2 });
  text(g, 'OVEN', 0, 70, { size: 20, color: '#8a8a92', font: FONTS.ui, weight: 900, spacing: 3 });
  g.restore();
}
export function heroWatch(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  // strap
  rr(g, -90, -230, 180, 120, 20); g.fillStyle = '#1e1e24'; g.fill(); rr(g, -90, 110, 180, 120, 20); g.fill(); for (let i = 0; i < 3; i++) { circle(g, 0, 140 + i * 30, 8, '#3a3a44'); }
  // chunky case + buttons
  for (const [bx, by] of [[-200, -50], [-200, 50], [200, -50], [200, 50]]) { rr(g, bx - 18, by - 16, 36, 32, 8); g.fillStyle = '#3a3a44'; g.fill(); }
  rr(g, -190, -150, 380, 300, 60); g.fillStyle = '#16161c'; g.fill(); g.strokeStyle = '#000'; g.lineWidth = 6; g.stroke();
  rr(g, -176, -136, 352, 272, 50); g.strokeStyle = '#3a3a44'; g.lineWidth = 4; g.stroke();
  rr(g, -140, -70, 280, 140, 14); g.fillStyle = '#b8c4a8'; g.fill(); g.strokeStyle = '#000'; g.lineWidth = 4; g.stroke();
  const tm = o.time ?? '18:42:40'; text(g, tm.slice(0, 5), -16, 4, { size: 74, color: '#1a221a', font: FONTS.ui, weight: 900 }); text(g, tm.slice(6, 8), 104, 22, { size: 36, color: '#1a221a', font: FONTS.ui, weight: 900 });
  text(g, 'MODE', -120, -100, { size: 18, color: '#7a7a84', font: FONTS.ui, weight: 900 }); text(g, 'LIGHT', 112, -100, { size: 18, color: '#7a7a84', font: FONTS.ui, weight: 900 });
  if (o.glow) glow(g, 0, 0, 260, '#9ad0ff', 0.25 * o.glow);
  g.restore();
}
export function timeDiff(g, t, at, x, y, o = {}) {
  const k = ease.outBack(prog(t, at, at + 0.35)); if (k <= 0.01) return; const str = o.str ?? '+40 s', sz = o.size ?? 64;
  g.save(); g.translate(x, y); g.scale(k, k); g.font = `900 ${sz}px "${FONTS.ui}"`; const w = g.measureText(str).width + 60;
  rr(g, -w / 2, -sz * 0.72, w, sz * 1.44, sz * 0.72); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = GOLD; g.lineWidth = 5; g.stroke();
  text(g, str, 0, 2, { size: sz, color: GOLD, font: FONTS.ui, weight: 900, glow: 12, glowColor: alpha(GOLD, 0.5) }); g.restore();
}

// ---------------------------------------------------------------- JUICE + SOCKS
export function juiceArc(t, o = {}) { const [x0, y0] = o.from, [x1, y1] = o.to, at = o.at ?? 0, dur = o.dur ?? 0.7, h = o.h ?? 60, k = clamp((t - at) / dur); return { x: lerp(x0, x1, k), y: lerp(y0, y1, k * k) - Math.sin(k * Math.PI) * h, rot: k * 2.2, k, done: t >= at + dur }; }
export function juiceGlass(g, x, y, s = 1, o = {}) {
  const fill = clamp(o.fill ?? 0.75), rot = o.rot ?? (o.tip ?? 0) * 1.6;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.moveTo(-40, -130); g.lineTo(-32, 0); g.lineTo(32, 0); g.lineTo(40, -130); g.closePath(); g.fillStyle = 'rgba(220,240,255,.35)'; g.fill();
  g.save(); g.clip(); g.fillStyle = '#ffa21a'; g.fillRect(-50, -130 * fill, 100, 140); g.fillStyle = '#ffc45a'; g.fillRect(-50, -130 * fill, 100, 8); g.restore();
  g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); seg(g, [[-26, -112], [-22, -20]], 5, 'rgba(255,255,255,.6)');
  g.restore();
}
export function juiceSplash(g, t, at, x, y, o = {}) {
  const u = t - at; if (u < 0) return; const s = o.s ?? 1, col = o.color ?? '#ffa21a', r = rng(o.seed ?? 5), dir = o.dir ?? 0;
  // puddle (spreads then stays)
  const pk = ease.out(clamp(u / 0.5)); g.fillStyle = alpha(col, 0.85); g.beginPath(); g.ellipse(x, y, 190 * s * pk, 34 * s * pk, 0, 0, 7); g.fill(); g.fillStyle = alpha('#ffd28a', 0.5); g.beginPath(); g.ellipse(x - 40 * s, y - 6 * s, 60 * s * pk, 8 * s * pk, 0, 0, 7); g.fill();
  if (u < 0.9) { const k = u / 0.9; g.strokeStyle = alpha(col, 1 - k); g.lineWidth = 6 * s; g.beginPath(); g.ellipse(x, y, 220 * s * ease.out(k), 50 * s * ease.out(k), 0, 0, 7); g.stroke();
    for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.1 + r() * 0.8) + dir * 0.3, v = (300 + r() * 500) * s; const px = x + Math.cos(a) * v * u, py = y + Math.sin(a) * v * u + 900 * s * u * u; if (py < y + 10) circle(g, px, py, (6 + r() * 8) * s * (1 - k * 0.5), col); } }
}
export function socks(g, x, y, s = 1, o = {}) {
  const st = clamp(o.stain ?? 0), w = Math.sin((o.wiggle ?? 0) * 12) * 0.08 * (o.wiggle ? 1 : 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * 70, 0); g.rotate(w * sd);
    const c = mix('#f6f4ee', '#ffa21a', st); g.fillStyle = c; g.beginPath(); g.moveTo(-34, -150); g.lineTo(34, -150); g.lineTo(34, -30); g.quadraticCurveTo(34, 0, 70 * sd > 0 ? 80 : 80, 0); g.lineTo(-30, 0); g.quadraticCurveTo(-40, -10, -34, -40); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
    rr(g, -36, -160, 72, 30, 8); g.fillStyle = mix('#e8e4da', '#ff8a1a', st); g.fill(); g.stroke();
    if (st > 0.3) for (let i = 0; i < 4; i++) circle(g, -20 + i * 16, -80 + (i % 2) * 30, 6, alpha('#ff7a0a', st)); g.restore(); }
  g.restore();
}

// ---------------------------------------------------------------- MILK JUG + BOWL + PROJECT
export function milkJug(g, x, y, s = 1, o = {}) {
  const rot = o.rot ?? (o.tip ?? 0) * 2.0, lv = clamp(o.level ?? 0.7);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.moveTo(-60, -170); g.lineTo(60, -170); g.lineTo(80, -200); g.lineTo(70, -150); g.quadraticCurveTo(90, -60, 70, 0); g.lineTo(-70, 0); g.quadraticCurveTo(-90, -60, -60, -170); g.closePath();
  g.fillStyle = '#f4efe2'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  rr(g, -78, -90, 156, 26, 6); g.fillStyle = '#4a86c8'; g.fill();
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.arc(-74, -100, 44, Math.PI * 0.55, Math.PI * 1.45); g.stroke(); g.strokeStyle = '#f4efe2'; g.lineWidth = 5; g.stroke();
  if (lv > 0) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(0, -170 + (1 - lv) * 20, 58, 10, 0, 0, 7); g.fill(); }
  g.restore();
  const c = Math.cos(rot), sn = Math.sin(rot); return [x + (80 * c + 200 * sn) * s, y + (80 * sn - 200 * c) * s];
}
export function milkPour(g, t, o = {}) {
  const [x0, y0] = o.from, [x1, y1] = o.to, k = clamp(o.k ?? 1), w = o.w ?? 26; if (k <= 0) return; const ex = lerp(x0, x1, k), ey = lerp(y0, y1, k);
  g.save(); g.strokeStyle = '#fbfbf6'; g.lineCap = 'round'; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(lerp(x0, ex, 0.5) + 30, lerp(y0, ey, 0.3), ex, ey); g.stroke();
  g.strokeStyle = 'rgba(180,200,220,.5)'; g.lineWidth = w * 0.25; g.stroke(); g.restore();
  for (let i = 0; i < 6; i++) { const u = (t * 2 + i / 6) % 1; circle(g, lerp(x0, ex, u) + Math.sin(i * 3) * 16, lerp(y0, ey, u) + 10, 6 + (i % 3) * 2, '#fbfbf6'); }
}
export function mixingBowl(g, x, y, s = 1, o = {}) {
  const f = clamp(o.fill ?? 0), sp = clamp(o.splash ?? 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 170, 200, 22, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-230, 0); g.quadraticCurveTo(-220, 170, 0, 170); g.quadraticCurveTo(220, 170, 230, 0); g.closePath(); g.fillStyle = linGrad(g, 0, 0, 0, 170, ['#7ab0d8', '#4a7aa8']); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  g.fillStyle = '#2a4a6a'; g.beginPath(); g.ellipse(0, 0, 230, 40, 0, 0, 7); g.fill(); g.stroke();
  if (f > 0) { g.fillStyle = '#fbfbf6'; g.beginPath(); g.ellipse(0, 18 * (1 - f) + 2, 200 * (0.7 + 0.3 * f), 30 * (0.7 + 0.3 * f), 0, 0, 7); g.fill(); }
  if (sp > 0 && sp < 1) for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.15 + i * 0.085), r = 80 + sp * 140; circle(g, Math.cos(a) * r, Math.sin(a) * r * 0.9 - 10, 12 * (1 - sp), '#fbfbf6'); }
  seg(g, [[-200, -10], [-140, -26]], 6, 'rgba(255,255,255,.5)');
  g.restore();
}
export function schoolProject(g, t, x, y, s = 1, o = {}) {
  const wet = clamp(o.wet ?? 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -300, -20, 600, 40, 6); g.fillStyle = '#c8a070'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();           // cardboard base
  g.beginPath(); g.moveTo(-230, -20); g.quadraticCurveTo(-120, -160, -60, -300); g.lineTo(60, -300); g.quadraticCurveTo(120, -160, 230, -20); g.closePath(); g.fillStyle = mix('#8a6a4a', '#5a4a3a', wet); g.fill(); g.stroke();
  for (let i = 0; i < 6; i++) seg(g, [[-160 + i * 60, -40], [-120 + i * 46, -180 - (i % 2) * 40]], 3, 'rgba(0,0,0,.2)');                // paper-mache strips
  g.fillStyle = '#e8402a'; g.beginPath(); g.moveTo(-60, -300); g.quadraticCurveTo(-40, -230, -70, -190); g.quadraticCurveTo(-30, -220, -10, -150); g.quadraticCurveTo(10, -240, 40, -200); g.quadraticCurveTo(50, -250, 60, -300); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#ffb02a'; g.beginPath(); g.ellipse(0, -300, 62, 14, 0, 0, 7); g.fill(); g.stroke();
  seg(g, [[150, -60], [150, -200]], 4, INK); poly(g, [[150, -200], [220, -180], [150, -160]], '#d4262e');
  rr(g, -260, 30, 220, 60, 6); g.fillStyle = '#f6f1e6'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); text(g, 'MY VOLCANO', -150, 61, { size: 26, color: INK, font: FONTS.ui, weight: 900 });
  if (wet > 0) { g.fillStyle = alpha('#ffffff', 0.7 * wet); g.beginPath(); g.ellipse(-40, -100, 160, 70, 0.2, 0, 7); g.fill(); }
  g.restore();
}

// ---------------------------------------------------------------- BIN, BUTTER, TOAST
export function bin(g, x, y, s = 1, o = {}) {
  const lid = clamp(o.lid ?? 0), wob = Math.sin((o.t ?? 0) * 20) * 0.04 * (o.wobble ?? 0), ck = clamp(o.cat ?? 0);
  g.save(); g.translate(x, y); g.rotate(wob); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 150, 18, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-130, -360); g.lineTo(130, -360); g.lineTo(110, 0); g.lineTo(-110, 0); g.closePath(); g.fillStyle = linGrad(g, -130, 0, 130, 0, ['#9aa4ae', '#d8dee4', '#8a949e']); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  for (let i = 0; i < 5; i++) seg(g, [[-90 + i * 45, -330], [-80 + i * 40, -30]], 3, 'rgba(0,0,0,.18)');
  rr(g, -40, -60, 80, 30, 8); g.fillStyle = '#5a646e'; g.fill();                                                                    // pedal
  if (ck > 0) { g.save(); g.globalAlpha *= ck; const cy = -360 - 40 * ck; g.fillStyle = '#2a2230'; g.beginPath(); g.ellipse(0, cy + 20, 80, 50, 0, Math.PI, 0); g.fill();
    poly(g, [[-70, cy], [-46, cy - 50], [-24, cy - 4]], '#2a2230'); poly(g, [[70, cy], [46, cy - 50], [24, cy - 4]], '#2a2230');
    for (const sd of [-1, 1]) { g.fillStyle = '#c8f07a'; g.beginPath(); g.ellipse(sd * 28, cy + 4, 16, 7, 0, 0, 7); g.fill(); seg(g, [[sd * 28 - 3, cy], [sd * 28 + 3, cy + 8]], 3, INK); seg(g, [[sd * 48, cy - 16], [sd * 12, cy - 8]], 4, INK); }
    seg(g, [[-30, cy + 30], [30, cy + 30]], 0, INK); g.restore(); }
  g.save(); g.translate(-130, -360); g.rotate(-lid * 1.1); rr(g, 0, -34, 260, 36, 14); g.fillStyle = '#c8ced6'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.restore();
  g.restore();
}
export function butterDish(g, x, y, s = 1, o = {}) {
  const b = clamp(o.bite ?? 0), lid = clamp(o.lid ?? 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#f2f0ea'; g.beginPath(); g.ellipse(0, 0, 150, 30, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  rr(g, -90, -70, 180 - b * 50, 66, 8); g.fillStyle = '#ffe07a'; g.fill(); g.stroke(); rr(g, -90, -70, 180 - b * 50, 16, 6); g.fillStyle = '#fff0a8'; g.fill();
  if (b > 0) for (let i = 0; i < 3; i++) { circle(g, 90 - b * 50, -50 + i * 20, 10, '#f2f0ea'); }
  if (lid < 1) { g.save(); g.translate(0, -lid * 140); g.globalAlpha *= 1 - lid * 0.3; g.beginPath(); g.moveTo(-120, -6); g.quadraticCurveTo(-120, -110, 0, -110); g.quadraticCurveTo(120, -110, 120, -6); g.closePath(); g.fillStyle = 'rgba(230,240,250,.45)'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); circle(g, 0, -116, 14, '#e8e4da'); g.restore(); }
  g.restore();
}
export function toast(g, x, y, s = 1, o = {}) {
  const b = clamp(o.bite ?? 0), bu = clamp(o.butter ?? 0);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  g.beginPath(); g.moveTo(-90, 80); g.lineTo(-90, -40); g.quadraticCurveTo(-110, -110, -40, -110); g.quadraticCurveTo(0, -140, 40, -110); g.quadraticCurveTo(110, -110, 90, -40); g.lineTo(90, 80); g.closePath();
  g.save(); g.clip(); g.fillStyle = '#c87a32'; g.fillRect(-120, -150, 240, 240); g.fillStyle = '#f2c878'; g.fillRect(-80, -100, 160, 170); if (bu > 0) { g.fillStyle = alpha('#ffe07a', 0.85 * bu); g.beginPath(); g.ellipse(-6, -10, 66, 50, 0.2, 0, 7); g.fill(); }
  for (let i = 0; i < Math.round(b * 3); i++) { g.globalCompositeOperation = 'destination-out'; circle(g, 80 - i * 30, -110 + i * 6, 38, '#000'); } g.restore();
  g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- DEV FILMING
export function devCam(g, t, o = {}, content) {
  devPhone(g, t, { tag: 'DEV CAM', ...o }, content);
  if (o.caption) { const x = o.x ?? E.W / 2, y = (o.y ?? E.H / 2) - 260 * (o.s ?? 1), k = ease.outBack(prog(t, o.capAt ?? 0, (o.capAt ?? 0) + 0.3)); if (k > 0.01) { g.save(); g.translate(x, y); g.scale(k, k); g.font = `900 40px "${FONTS.ui}"`; const w = g.measureText(o.caption).width + 50; rr(g, -w / 2, -30, w, 60, 30); g.fillStyle = 'rgba(14,10,20,.88)'; g.fill(); g.strokeStyle = GOLD; g.lineWidth = 4; g.stroke(); text(g, o.caption, 0, 2, { size: 40, color: GOLD, font: FONTS.ui, weight: 900 }); g.restore(); } }
}
