// t_pumpkin.js: "Why a carved jack-o'-lantern rots so fast" in template #18 handdrawn "Japan heat wave" (demo101) grammar,
// reusing reels/styles/fieldbook (built for flush): field-notebook pages, pencil drawings that draw on, red/navy/ochre hatching,
// red seals, measurement boxes and counters, thin bar charts, day-counter boxes, typed captions.
import { createFB, W, H, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const F = createFB(document.getElementById('c')), g = F.g, R = ramp;

// ---------- pages (cross-dissolve, no blank frames) ----------
const PG = [[0, s(2) - .1, 1], [s(2) - .1, s(4) - .1, 2], [s(4) - .1, s(7) - .1, 3], [s(7) - .1, s(10) - .1, 4], [s(10) - .1, s(15) - .1, 5], [s(15) - .1, s(17) - .1, 6], [s(17) - .1, TL.total + 1, 7]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
const inkA = (t, p) => p[2] === 1 ? 1 : ss(R(t, p[0], .35));
const TOP = 160, HEAD = 268, CAPY = 1560;
let BASE = 1, PREV = false;
function caption(t, x = 80, y = CAPY, o = {}) { if (PREV) return; let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci < 0) return; const p = pageAt(t); if (PH[ci].start < p[0] - .1) return; F.body(PH[ci].cap, x, y, o.maxW || 920, t - PH[ci].start + .05, o); }
function chapter(t, label, head, t0) { F.label(label, 80, TOP, t - t0); F.head(head, 76, HEAD, t - t0 - .35); }
const note = (txt, x, y, tx, ty, k, o = {}) => { if (k <= 0) return; const { col = C.ink, size = 38, align = 'left' } = o; F.pencil([[x + (align === 'left' ? -10 : 10), y - size * .3], [tx, ty]], { col: C.graph, w: 1.2, draw: ss(clamp(k * 2)), wob: .3 }); F.txt(txt, x, y, { size, f: 'hand', col, write: ss(R(k, .3, .7)), align }); };
const circP = (cx, cy, rx, ry, n = 40, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

// ---------- the jack-o'-lantern (pencil + orange hatching) ----------
// o: k draw-on, cut 0..1 face cut progress, glow 0..1, shrivel 0..1 (cut edges shrink, sag), mould 0..1, t
function pumpkin(cx, cy, r, o = {}) { const { k = 1, cut = 1, glow = 0, shrivel = 0, mould = 0, t = 0 } = o; const sag = 1 - .12 * shrivel;
  const body = circP(cx, cy, r * 1.18, r * sag, 48);
  F.hatch(body, 'ochre', { k: ss(R(k, .3, .5)), alpha: 1 }); F.hatch(body, 'ochre', { k: ss(R(k, .35, .5)), alpha: .8, dir: 'down' }); F.hatch(body, 'redL', { k: ss(R(k, .4, .5)), alpha: .85 }); F.hatch(body, 'red', { k: ss(R(k, .45, .5)), alpha: .25 });
  F.pencil(body, { w: 2.6, draw: ss(R(k, 0, .45)), seed: 1, close: true });
  for (const f of [-.62, -.25, .25, .62]) F.pencil(circP(cx + f * r * .55, cy, r * (.55 - Math.abs(f) * .3), r * sag * .98, 24, -Math.PI / 2, Math.PI / 2).map(([x, y]) => [x * (f < 0 ? 1 : 1), y]), { w: 1.6, col: C.graph, draw: ss(R(k, .2, .5)), seed: 3 + f * 10, alpha: .8 });
  const stem = [[cx - 14, cy - r * sag + 6], [cx - 8, cy - r * sag - 52], [cx + 18, cy - r * sag - 60], [cx + 14, cy - r * sag + 6]]; F.hatch(stem, 'graph', { alpha: .8 }); F.pencil(stem, { w: 2.2, draw: ss(R(k, .25, .3)), seed: 7 });
  // face: triangle eyes, a nose, a jagged grin; cut progressively
  const sh = 1 - .25 * shrivel, fy = cy - r * .12;
  const eyes = [-1, 1].map(sx => [[cx + sx * r * .42 - r * .17 * sh, fy], [cx + sx * r * .42, fy - r * .3 * sh], [cx + sx * r * .42 + r * .17 * sh, fy]]);
  const nose = [[cx - r * .08 * sh, fy + r * .22], [cx, fy + r * .08], [cx + r * .08 * sh, fy + r * .22]];
  const mouth = []; const mw = r * .78 * sh, my = cy + r * .36; for (let i = 0; i <= 8; i++) mouth.push([cx - mw + i * mw / 4, my + (i % 2 ? r * .1 : 0) - Math.sin(i / 8 * Math.PI) * r * .08]); for (let i = 8; i >= 0; i--) mouth.push([cx - mw + i * mw / 4, my + r * .2 + (i % 2 ? -r * .06 : 0) - Math.sin(i / 8 * Math.PI) * r * .1]);
  [eyes[0], eyes[1], nose, mouth].forEach((hole, i) => { const ck = clamp(cut * 4 - i); if (ck <= 0) return;
    g.save(); F.path(hole); g.globalAlpha = F.S.A; g.fillStyle = glow > 0 ? `rgba(255,${200 - 40 * (1 - glow)},90,${.55 + .45 * glow})` : '#4a3a2a'; g.fill(); g.restore();
    F.pencil(hole, { close: true, w: 2.2, draw: ck, seed: 20 + i }); if (shrivel > 0) F.pencil(hole.map(([x, y]) => [x + (cx - x) * .06, y + (cy - y) * .06]), { close: true, w: 1.2, col: C.graph, alpha: .7 * shrivel, seed: 30 + i }); });
  if (glow > 0) { const rg = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6); rg.addColorStop(0, `rgba(255,200,90,${.25 * glow * F.S.A})`); rg.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = rg; g.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4); }
  if (mould > 0) for (let i = 0; i < 9; i++) { const u = clamp(mould * 9 - i); if (u <= 0) continue; const a = hash(i * 3.3) * Math.PI * 2, d = r * (.25 + .5 * hash(i * 5.1)); const mx = cx + Math.cos(a) * d * 1.1, my2 = fy + r * .2 + Math.sin(a) * d * .6; const mr = (16 + 14 * hash(i)) * u;
    F.hatch(circP(mx, my2, mr, mr, 16), 'navy', { alpha: .9 }); for (let j = 0; j < 8; j++) { const b = j / 8 * Math.PI * 2; F.pencil([[mx + Math.cos(b) * mr, my2 + Math.sin(b) * mr], [mx + Math.cos(b) * (mr + 7), my2 + Math.sin(b) * (mr + 7)]], { w: 1, col: C.navy, alpha: .8, wob: .2 }); } }
}
function knife(x, y, ang, k = 1) { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(ang); const blade = [[0, 0], [150, -14], [170, 0], [150, 12], [0, 14]], handle = [[-120, -16], [0, -16], [0, 18], [-120, 18]]; F.hatch(handle, 'graph', { alpha: .9 }); F.pencil(handle, { close: true, w: 2.2, seed: 40 }); F.pencil(blade, { close: true, w: 2, seed: 41 }); g.restore(); }
// rind cross-section: rind band (navy), flesh (ochre), strings; open = cut gap
function wall(t, o = {}) { const { open = 0, k = 1, drops = 1, microbes = 1, inflow = 0, outflow = 0 } = o; const x0 = 140, x1 = 940, yR = 640, yF = 700, yI = 1180;
  const gap = open * 160, gx = 540;
  const segs = gap > 2 ? [[x0, gx - gap / 2], [gx + gap / 2, x1]] : [[x0, x1]];
  segs.forEach(([a, b], i) => { F.hatch([[a, yR], [b, yR], [b, yF], [a, yF]], 'navy', { k, alpha: .9 }); F.hatch([[a, yF], [b, yF], [b, yI], [a, yI]], 'ochre', { k, alpha: .85 }); F.pencil([[a, yR], [b, yR], [b, yI], [a, yI]], { close: true, w: 2.2, draw: k, seed: 50 + i }); F.line(a, yF, b, yF, { w: 1.4, col: C.graph, draw: k }); });
  for (let i = 0; i < 9; i++) { const x = x0 + 40 + i * 90; if (Math.abs(x - gx) < gap / 2 + 20) continue; const P = []; for (let j = 0; j < 8; j++) P.push([x + Math.sin(j * 1.3 + i) * 14, yI + j * 22]); F.pencil(P, { w: 1.6, col: C.ochre, draw: k, alpha: .9 }); }
  // microbes outside (red dots/rods), moisture drops inside (navy)
  for (let i = 0; i < 12; i++) { const u = (t * .25 + hash(i * 7.3)) % 1, x = x0 + hash(i * 3.1) * (x1 - x0); let y = lerp(420, yR - 20, Math.min(1, u * 1.4)); if (inflow > 0 && Math.abs(x - gx) < gap / 2 + 120) { y = lerp(420, yF + 220, u); }
    if (microbes > 0) { const rr = 7; if (i % 2) F.hatch(circP(x, y, rr, rr, 12), 'red', { alpha: microbes }); else F.pencil([[x - 9, y], [x + 9, y]], { w: 5, col: C.red, alpha: microbes }); } }
  for (let i = 0; i < 10; i++) { const u = (t * .3 + hash(i * 2.9)) % 1, x = x0 + 60 + hash(i * 6.1) * (x1 - x0 - 120); let y = lerp(yI - 40, yF + 30, (Math.sin(u * Math.PI * 2) + 1) / 2); let a = drops;
    if (outflow > 0 && Math.abs(x - gx) < gap / 2 + 180) { y = lerp(yF + 60, 380, u); a = drops * (1 - u); }
    if (a > 0) { const dr = [[x, y - 14], [x + 8, y + 2], [x, y + 9], [x - 8, y + 2]]; F.hatch(dr, 'navy', { alpha: a }); F.pencil(dr, { close: true, w: 1.4, col: C.navy, alpha: a }); } }
  return { x0, x1, yR, yF, yI };
}

// ---------- pages ----------
function page1(t) {   // frame 0: knife mid-cut through the face, rot clock counting
  F.txt('A FIELD SKETCHBOOK  ·  HALLOWEEN NOTES', 80, TOP, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', alpha: .9 }); F.line(80, TOP + 16, 800, TOP + 16, { w: 1, alpha: .5, wob: .3 });
  const wT = F.txt('The rot ', 74, 320, { size: 130, f: 'hand', rot: -.015 }); F.txt('clock', 74 + wT, 316, { size: 130, f: 'hand', col: C.red, rot: -.015 }); F.txt('starts.', 74, 450, { size: 130, f: 'hand', rot: -.015 });
  F.line(84, 480, 560, 474, { col: C.red, w: 2.6, draw: ss(R(t, 0, .6)), wob: .6 });
  F.seal('ROT', 900, 300, ss(R(t, .4, .3)), { size: 46, round: true, f: 'mono', fs: 26 });
  caption(t, 80, 560, { size: 46 });
  const cut = .25 + .75 * ss(R(t, 0, 2.4)), glow = ss(R(t, 2.4, .8));
  pumpkin(560, 1120, 290, { cut, glow, t }); if (t < 2.6) { const a = t * 3.2; knife(470 + Math.cos(a) * 60, 1010 + Math.sin(a) * 30, -.5 + Math.sin(a) * .2, 1); }
  // rot clock: day counter boxes (the demo's day boxes)
  const day = t < s(1) ? 0 : Math.min(5, Math.floor((t - s(1)) / .8) + 1); for (let i = 0; i < 6; i++) { const x = 110 + i * 150; F.rect(x, 1460, 120, 70, { w: 1.6, col: C.graph, seed: 60 + i }); F.txt(String(i), x + 60, 1515, { size: 50, f: 'hand', align: 'center', col: i <= day ? C.red : '#9a9a9e' }); if (i < day) F.seal('X', x + 98, 1478, 1, { size: 20, round: true, f: 'mono', fs: 14 }); }
  F.txt('DAYS SINCE CARVING', 110, 1446, { size: 20, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' });
}
function page2(t, p) {   // whole vs carved: two timelines (the demo's thin bars)
  chapter(t, 'NO. 01 — WHOLE VS CARVED', 'Months… or days.', p[0]);
  pumpkin(300, 700, 150, { cut: 0, k: ss(R(t, p[0] + .2, 1.2)), t }); pumpkin(780, 700, 150, { cut: 1, k: ss(R(t, p[0] + .5, 1.2)), glow: .6, t });
  F.txt('uncarved', 300, 920, { size: 44, f: 'hand', align: 'center', write: ss(R(t, p[0] + .8, .5)) }); F.txt('carved', 780, 920, { size: 44, f: 'hand', align: 'center', col: C.red, write: ss(R(t, s(3), .5)) });
  // time axis in days (0..90)
  const x0 = 120, x1 = 960, dx = d => lerp(x0, x1, d / 90), y1 = 1110, y2 = 1250; const ak = ss(R(t, p[0] + .6, .8));
  F.line(x0, 1330, x1, 1330, { w: 1.4, col: C.graph, draw: ak }); [0, 30, 60, 90].forEach(d => { F.line(dx(d), 1322, dx(d), 1338, { w: 1.2, col: C.graph, alpha: ak }); F.txt(d + ' d', dx(d), 1370, { size: 22, f: 'mono', align: 'center', col: '#5d5d62', alpha: ak }); });
  const b1 = ss(R(t, s(2) + .2, 1.6)), b2 = ss(R(t, s(3) + .2, .8));
  if (b1 > 0) { F.hatch([[x0, y1], [lerp(x0, dx(75), b1), y1], [lerp(x0, dx(75), b1), y1 + 46], [x0, y1 + 46]], 'navy', { alpha: .85 }); F.pencil([[dx(60), y1 - 10], [dx(60), y1 + 56]], { w: 1.4, col: C.navy, dash: [6, 6], alpha: b1 }); F.txt('2-3 months (cool, dry)', x0, y1 - 18, { size: 34, f: 'hand', col: C.navy, write: ss(R(t, s(2) + 1, .6)) }); }
  if (b2 > 0) { F.hatch([[x0, y2], [lerp(x0, dx(5), b2), y2], [lerp(x0, dx(5), b2), y2 + 46], [x0, y2 + 46]], 'red', { alpha: .9 }); F.txt('3-5 days', dx(5) + 24, y2 + 36, { size: 46, f: 'hand', col: C.red, write: ss(R(t, s(3) + .6, .5)) }); }
  caption(t);
}
function page3(t, p) {   // the rind: keeps moisture in and microbes out; carving cuts the wall open
  chapter(t, 'NO. 02 — THE RIND  ·  fig. a', 'A wall with two jobs.', p[0]);
  const open = ss(R(t, s(5) + .2, .9));
  wall(t, { k: ss(R(t, p[0] + .2, 1.2)), open, inflow: ss(R(t, s(6), .8)), outflow: ss(R(t, s(6), .8)) });
  note('rind', 960, 600, 900, 660, R(t, s(4) + .6, .8), { col: C.navy, size: 40, align: 'right' }); note('flesh', 960, 980, 900, 900, R(t, s(4) + 1.0, .8), { size: 40, align: 'right' });
  note('microbes: blocked', 140, 400, 300, 560, R(t, s(4) + 2.2, .8), { col: C.red, size: 38 }); note('moisture: kept in', 140, 1440, 300, 1100, R(t, s(4) + 2.8, .8), { col: C.navy, size: 38 });
  if (open > 0) { knife(540, 560 - 160 * (1 - open), Math.PI / 2, 1 - ss(R(t, s(6) - .3, .3))); F.seal('CUT', 860, 520, ss(R(t, s(5) + 1.0, .3)), { size: 40, round: true, f: 'mono', fs: 22 }); }
  caption(t);
}
function page4(t, p) {   // two enemies (water loss, mould + bacteria) and warmth
  chapter(t, 'NO. 03 — TWO ENEMIES', 'Drying out, and moving in.', p[0]);
  const shriv = ss(R(t, s(7) + .4, 3)), mould = ss(R(t, s(8) + .4, 3.4)), heat = ss(R(t, s(9), 1.5));
  pumpkin(560, 900, 260, { cut: 1, glow: t > s(9) ? .9 : .25, shrivel: shriv, mould, t, k: ss(R(t, p[0] + .1, 1)) });
  // measurement boxes: water left, microbes, temperature
  const bx = (x, lab, val, col, k) => { F.box(x, 1230, 290, 150, k); F.txt(lab, x + 22, 1278, { size: 20, f: 'mono', wt: 700, ls: 2, col: '#5d5d62', alpha: k }); F.txt(val, x + 22, 1352, { size: 58, f: 'hand', col, alpha: k }); };
  bx(70, 'WATER', Math.round(100 - 35 * shriv) + '%', C.navy, ss(R(t, s(7) + .2, .5)));
  bx(395, 'MOULD SPOTS', String(Math.round(mould * 9)), C.ink, ss(R(t, s(8) + .2, .5)));
  bx(720, 'INSIDE', (t > s(9) ? 'warm ↑' : 'cool'), C.red, ss(R(t, s(9), .5)));
  if (t > s(9) + .2) { const fl = [[560, 900], [548, 870], [560, 830], [572, 870]]; F.hatch(fl, 'ochre', { alpha: .95 }); F.pencil(fl, { close: true, w: 2, col: C.red }); for (let i = 0; i < 3; i++) F.squig(500 + i * 60, 600, 120, t + i, { col: C.red, alpha: .7 * heat }); }
  note('cut edges shrink', 120, 560, 400, 860, R(t, s(7) + 1.4, .8), { col: C.navy, size: 36 });
  caption(t);
}
function page5(t, p) {   // field notes: a checklist with small sketches, red ticks as each is said
  chapter(t, 'NO. 04 — FIELD NOTES', 'A longer-lasting lantern.', p[0]);
  const items = [['scrape out the stringy insides', s(11)], ['seal cut edges: petroleum jelly', s(12)], ['cool, shaded, out of the rain', s(13)], ['electric candle, not a flame', s(14)]];
  items.forEach(([txt, t0], i) => { const y = 470 + i * 250, k = ss(R(t, t0 - .1, .5)); if (k <= 0) return;
    F.rect(90, y - 40, 56, 56, { w: 2.2, draw: k, seed: 70 + i }); if (t > t0 + .8) F.pencil([[96, y - 10], [116, y + 12], [156, y - 52]], { col: C.red, w: 4, draw: ss(R(t, t0 + .8, .3)) });
    F.txt(txt, 180, y + 6, { size: 44, f: 'hand', write: ss(R(t, t0, .7)) });
    // tiny sketch on the right of each line
    const sx = 880, sy = y - 10;
    if (i === 0) { F.pencil(circP(sx, sy, 50, 34, 20, 0, Math.PI), { w: 2, draw: k }); F.pencil([[sx + 40, sy - 20], [sx + 90, sy - 70]], { w: 3, draw: k }); for (let j = 0; j < 3; j++) F.pencil([[sx - 30 + j * 25, sy + 6], [sx - 34 + j * 25, sy + 40]], { w: 1.4, col: C.ochre, draw: k }); }
    if (i === 1) { F.rect(sx - 40, sy - 40, 80, 80, { w: 2, draw: k }); F.hatch([[sx - 38, sy - 10], [sx + 38, sy - 10], [sx + 38, sy + 38], [sx - 38, sy + 38]], 'ochre', { k, alpha: .6 }); F.txt('JELLY', sx, sy - 18, { size: 18, f: 'mono', wt: 700, align: 'center', alpha: k }); }
    if (i === 2) { F.pencil(circP(sx, sy - 10, 70, 50, 20, Math.PI, Math.PI * 2), { w: 2.2, draw: k }); F.pencil([[sx, sy - 10], [sx, sy + 50]], { w: 2, draw: k }); for (let j = 0; j < 4; j++) F.pencil([[sx - 60 + j * 40, sy + 50], [sx - 66 + j * 40, sy + 70]], { w: 1.4, col: C.navy, alpha: k }); }
    if (i === 3) { F.rect(sx - 22, sy - 20, 44, 70, { w: 2, draw: k }); const fl = [[sx, sy - 22], [sx - 10, sy - 44], [sx, sy - 70], [sx + 10, sy - 44]]; F.hatch(fl, 'ochre', { alpha: k }); F.pencil(fl, { close: true, w: 1.6, col: C.ochre, alpha: k }); F.txt('LED', sx, sy + 24, { size: 18, f: 'mono', wt: 700, align: 'center', alpha: k }); }
  });
  pumpkin(540, 1340, 150, { cut: 1, glow: .7, t, k: ss(R(t, p[0] + .1, 1)) });
  caption(t);
}
function page6(t, p) {   // how long: day boxes (the demo's day counters) with red stamps, careless vs with care
  chapter(t, 'NO. 05 — HOW LONG', 'Count the days.', p[0]);
  const row = (y, n, lab, col, t0) => { F.txt(lab, 90, y - 24, { size: 40, f: 'hand', col, write: ss(R(t, t0, .5)) }); for (let i = 0; i < 11; i++) { const k = ss(R(t, t0 + .2 + i * .12, .3)); if (k <= 0) continue; const x = 90 + i * 84; F.rect(x, y, 72, 72, { w: 1.6, col: C.graph, draw: k, seed: 80 + i + y }); F.txt(String(i + 1), x + 36, y + 52, { size: 40, f: 'hand', align: 'center', col: i < n ? col : '#b0b0b4', alpha: k }); if (i < n) F.seal('✓', x + 60, y + 14, k, { size: 18, round: true, f: 'mono', fs: 14 }); } };
  row(520, 4, 'warm, no care: ~3-5 days', C.red, p[0] + .3); row(820, 10, 'with care: 8-11 days (NC State Extension)', C.navy, s(15) + .5);
  pumpkin(540, 1220, 180, { cut: 1, glow: .8, t, k: ss(R(t, p[0] + .3, 1)) });
  if (t > s(16)) F.txt('yours: ?', 540, 1480, { size: 90, f: 'hand', align: 'center', col: C.red, write: ss(R(t, s(16) + .3, .6)) });
  caption(t);
}
function page7(t, p) { const t0 = p[0];
  F.body('Carving opens the **rind.** Care buys **days.**', 540, 520, 940, t - t0, { size: 50, align: 'center', cps: 40 });
  F.txt('Follow for more of', 540, 700, { size: 92, f: 'hand', align: 'center', write: ss(R(t, t0 + .15, .6)) });
  F.txt('how it really works.', 540, 810, { size: 92, f: 'hand', align: 'center', col: C.red, write: ss(R(t, t0 + .6, .7)) });
  F.txt('@howitreallyworkstudio', 540, 900, { size: 30, f: 'mono', align: 'center', col: '#5d5d62', type: (t - t0 - 1.5) * 34 });
  F.seal('END', 880, 1060, ss(R(t, t0 + 1.4, .3)), { size: 54, round: true, f: 'mono', fs: 28 });
  pumpkin(540, 1230, 120, { cut: 1, glow: .9, t, k: ss(R(t, t0, 1)) });
  F.txt('SOURCES', 80, 1520, { size: 20, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', type: (t - t0 - .6) * 40 });
  ["The Old Farmer's Almanac: keep pumpkins from rotting", 'NC State Extension: picking and keeping pumpkins'].forEach((l, i) => F.txt(l, 80, 1560 + i * 32, { size: 20, f: 'mono', col: '#6a6a6e', type: (t - t0 - .9 - i * .3) * 50 }));
}
const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6, 7: page7 };
function scene(t) {
  F.begin(); const p = pageAt(t); F.footer(p[2]);
  const pi = PG.indexOf(p); if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; BASE = 1 - ss(R(t, p[0], .35)); F.alpha(BASE); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01), q); PREV = false; F.alpha(1); }
  BASE = inkA(t, p); F.alpha(BASE); PAGES[p[2]](t, p); F.alpha(1); BASE = 1;
  if (t > s(17)) { const a = ss(R(t, s(17) + .5, 3)) * .28; const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(40,30,15,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
}
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.save(); g.globalAlpha = 1 - fade; g.fillStyle = C.dark; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// thumbnail / cover (rule 11): the glowing carved pumpkin with mould spots starting, "Days, not months." in the notebook hand
window.thumb = () => { F.begin(); F.footer(1); F.txt('A FIELD SKETCHBOOK  ·  HALLOWEEN NOTES', 80, 330, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', alpha: .9 });
  F.txt('Days,', 70, 520, { size: 190, f: 'hand', col: C.red, rot: -.02 }); F.txt('not months.', 70, 700, { size: 160, f: 'hand', rot: -.02 }); F.line(84, 740, 900, 730, { col: C.red, w: 3.5, wob: .6 });
  F.seal('ROT', 940, 430, 1, { size: 56, round: true, f: 'mono', fs: 30 }); pumpkin(560, 1160, 300, { cut: 1, glow: .9, shrivel: .3, mould: .35, t: 1 }); };
window.seek(0); window.ready = true; window.READY = true;
