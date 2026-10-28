// t_thermos.js: "How does a thermos keep drinks hot AND cold?" in template #18 handdrawn "Japan heat wave" (demo 101), field-sketchbook module.
// Demo moves reused: warm notebook paper with crop marks, typed chapter label "NO. 0x — TOPIC" + hairline, handwritten headline written on,
// thin graphite drawings that draw on, red/navy/ochre pencil hatching as the only fills, big red hatched sun behind the title drawing, red seals,
// double-ruled measurement boxes, the demo's row of day boxes (21 22 23 24 25 → 21-25 Dec 1892), heat squiggles, typed body text with red words,
// mono footer + swatch chips, page change = ink fades off, ending = centred lines with a red line, round seal and a half disc on the horizon.
// Safe zones (LESSONS 11): label/headline from y 270, drawing y 430-1130, typed caption y 1200-1400, the route strip at y 1560, nothing in the right column.
import { createFB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const F = createFB(document.getElementById('c')), g = F.g, R = ramp;
const TOP = 280, HEAD = 386, CAPY = 1230;

// ---------- pages (start, end, number) ----------
const PG = [[0, s(2) - .1, 1], [s(2) - .1, s(4) - .1, 2], [s(4) - .1, s(8) - .1, 3], [s(8) - .1, s(11) - .1, 4], [s(11) - .1, s(14) - .1, 5], [s(14) - .1, s(16) - .2, 6], [s(16) - .2, TOT + 1, 7]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
let PREV = false;
function caption(t, y = CAPY, o = {}) { if (PREV) return; let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci < 0 || ci === PH.length - 1) return; const p = pageAt(t); if (PH[ci].start < p[0] - .1) return;
  F.body(PH[ci].cap, o.x ?? 80, y, o.maxW || 900, t - PH[ci].start + .05, { size: o.size || 50, ...o }); }
function chapter(t, label, head, t0, o = {}) { F.label(label, 80, TOP, t - t0); F.head(head, 76, HEAD, t - t0 - .35, { size: o.size || 76 }); }

// ---------- the flask in cross-section ----------
// x,y = centre of the inner bottle's base; sc scale; o: fill ('red'|'navy'), fillK, draw k, vac (show vacuum label), silver, stopper, labels
function flaskPts(x, y, w, h, neck, nh) { return [[x - neck, y - h - nh], [x - neck, y - h], [x - w / 2, y - h + 70], [x - w / 2, y - 30], [x - w / 2 + 30, y], [x + w / 2 - 30, y], [x + w / 2, y - 30], [x + w / 2, y - h + 70], [x + neck, y - h], [x + neck, y - h - nh]]; }
function flask(x, y, sc, t, o = {}) { const k = o.k ?? 1; g.save(); g.translate(x, y); g.scale(sc, sc);
  const outer = flaskPts(0, 0, 380, 640, 105, 90), inner = flaskPts(0, -40, 300, 560, 70, 110);
  // liquid inside the inner bottle (hatched), level ~ 75%
  if (o.fill) { const lv = -40 - 560 * .72, liq = [[-150, lv], [150, lv], [150, -70], [120, -40], [-120, -40], [-150, -70]]; F.hatch(liq, o.fill, { k: o.fillK ?? 1, alpha: .8 }); }
  // vacuum gap: very faint dotted paper (almost nothing)
  F.pencil(outer, { w: 2.8, draw: R(k, 0, .5), seed: 11 }); F.pencil(inner, { w: 2.4, draw: R(k, .25, .5), seed: 12, col: o.silver ? C.navy : C.ink });
  if (o.silver) F.pencil(inner.map(([a, b]) => [a + (a > 0 ? 7 : -7), b + 4]), { w: 3.4, col: '#8d97b8', alpha: .9 * o.silver, seed: 13, draw: o.silver });
  // join at the neck (the bridge where the walls meet)
  F.pencil([[-105, -730], [-70, -710]], { w: 2.6, draw: R(k, .6, .3), seed: 14 }); F.pencil([[105, -730], [70, -710]], { w: 2.6, draw: R(k, .6, .3), seed: 15 });
  if (o.stopper) { const st = [[-82, -820], [82, -820], [74, -690], [-74, -690]]; F.hatch(st, 'ochre', { k: o.stopper, alpha: .85 }); F.pencil(st, { close: true, w: 2.6, draw: o.stopper, seed: 16 }); }
  if (o.vac) { for (let i = 0; i < 14; i++) { const side = i % 2 ? 1 : -1, yy = -100 - i * 38; g.save(); g.globalAlpha = .5 * o.vac; g.fillStyle = C.graph; g.beginPath(); g.arc(side * 172, yy, 2.2, 0, TAU); g.fill(); g.restore(); } }
  g.restore(); }
// heat arrows: radial out (hot) or in (cold); blocked = stop at the gap and bounce
function heatArrows(x, y, sc, t, k, o = {}) { if (k <= 0) return; const dir = o.dir || 1, col = o.col || C.red; for (let i = 0; i < 5; i++) { const yy = y - (140 + i * 95) * sc;
  for (const side of [-1, 1]) { const ph = (t * .8 + i * .17) % 1, x0 = x + side * (dir > 0 ? 110 : 330) * sc, x1 = x + side * (dir > 0 ? 160 : 210) * sc, u = ss(R(ph, 0, .6)), back = ss(R(ph, .6, .4));
    const xe = lerp(x0, x1, u) - (x1 - x0) * back * .8; F.arrow([[x0, yy], [xe, yy]], { col, w: 2.4, draw: k, alpha: (1 - back * .6) * k, seed: i * 3 + (side > 0 ? 1 : 0) }); } } }
const strike = (x, y, r, k, col = C.red) => { F.pencil([[x - r, y - r], [x + r, y + r]], { col, w: 3, draw: k, wob: .5 }); F.pencil([[x + r, y - r], [x - r, y + r]], { col, w: 3, draw: R(k, .4, .6), wob: .5 }); };
const note = (txt, x, y, k, o = {}) => F.txt(txt, x, y, { size: o.size || 40, f: 'hand', col: o.col || C.ink, write: ss(k), align: o.align, rot: -.012 });

// ---------- p1: title page (frame 0 = flask flipping hot/cold behind the big headline) ----------
function page1(t) { F.txt('A FIELD SKETCHBOOK  ·  HEAT NOTES', 80, TOP, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', alpha: .9 }); F.line(80, TOP + 16, 760, TOP + 16, { w: 1, alpha: .5, wob: .3 });
  const wHot = F.txt('Hot? ', 74, 430, { size: 128, f: 'hand', col: C.red, rot: -.015 }); F.txt('Cold?', 74 + wHot, 426, { size: 128, f: 'hand', col: C.navy, rot: -.015 });
  F.txt('It has no idea.', 80, 540, { size: 70, f: 'hand', rot: -.012 }); F.line(84, 562, 560, 556, { col: C.red, w: 2.6, draw: ss(R(t, 0, .6)), wob: .6 });
  F.seal('VACUUM', 900, 360, ss(R(t, .4, .35)), { size: 30, f: 'mono', fs: 26 });
  const cx = 540, cy = 860, r = 300, ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; ring.push([cx + Math.cos(a) * r * (1 + Math.sin(a * 5) * .01), cy + Math.sin(a) * r]); }
  F.hatch(ring, 'red', { alpha: .55 }); F.pencil(ring, { col: C.red, w: 2.2, seed: 2 });
  const hot = Math.floor(t / 1.6) % 2 === 0; flask(540, 1140, .62, t, { fill: hot ? 'red' : 'navy', stopper: 1, vac: 1 });
  if (hot) for (let i = 0; i < 3; i++) F.squig(500 + i * 40, 600, 70, t + i, { col: C.red, alpha: .7 }); else for (let i = 0; i < 3; i++) F.rect(470 + i * 50, 830 + (i % 2) * 30, 34, 34, { col: C.navy, w: 2, seed: 40 + i });
  F.box(760, 600, 240, 130, 1); F.txt('CONTENTS', 784, 646, { size: 22, f: 'mono', col: '#5d5d62' }); F.txt(hot ? 'HOT' : 'COLD', 784, 708, { size: 56, f: 'hand', col: hot ? C.red : C.navy });
  caption(t); }

// ---------- p2: it blocks heat both ways; three routes ----------
function page2(t) { const t0 = s(2) - .1; chapter(t, 'NO. 01 — IT BLOCKS HEAT  ·  fig. a', 'Not a heater. A wall.', t0);
  if (t < s(3) - .2) { flask(300, 1110, .5, t, { fill: 'red', stopper: 1, k: R(t, t0, 1) }); flask(780, 1110, .5, t, { fill: 'navy', stopper: 1, k: R(t, t0 + .3, 1) });
    heatArrows(300, 1110, .5, t, R(t, t0 + 1.2, .5), { dir: 1, col: C.red }); heatArrows(780, 1110, .5, t, R(t, t0 + 2.0, .5), { dir: -1, col: C.red });
    note('heat out?', 300, 520, R(t, t0 + 1.4, .6), { align: 'center' }); note('heat in?', 780, 520, R(t, t0 + 2.2, .6), { align: 'center' }); note('both blocked', 540, 1180, R(t, t0 + 3.0, .7), { align: 'center', col: C.red, size: 46 }); }
  else { const t1 = s(3); const ROUTES = [['conduction', 'touching'], ['convection', 'moving air'], ['radiation', 'infrared']];
    ROUTES.forEach(([a, b], i) => { const x = 90 + i * 310, y = 520, k = R(t, t1 + i * .9, .7); F.box(x, y, 280, 560, k); F.txt(String(i + 1), x + 24, y + 56, { size: 30, f: 'mono', wt: 700, col: C.red, alpha: k });
      F.txt(a, x + 140, y + 500, { size: 38, f: 'hand', align: 'center', write: R(t, t1 + i * .9 + .3, .6) }); F.txt(b, x + 140, y + 540, { size: 22, f: 'mono', align: 'center', col: '#6a6a70', alpha: R(t, t1 + i * .9 + .5, .4) });
      const cx = x + 140, cy = y + 260, d = R(t, t1 + i * .9 + .2, .8);
      if (i === 0) { F.rect(cx - 90, cy - 20, 180, 40, { draw: d, seed: 60 }); for (let j = 0; j < 5; j++) { const u = (t * .7 + j / 5) % 1; g.save(); g.globalAlpha = d * (1 - u); g.fillStyle = C.red; g.beginPath(); g.arc(cx - 80 + u * 160, cy, 7, 0, TAU); g.fill(); g.restore(); } }
      if (i === 1) for (let j = 0; j < 3; j++) { const P = []; for (let q = 0; q <= 24; q++) { const a = q / 24 * TAU * .85 + t * 1.5 + j * 2; P.push([cx + Math.cos(a) * (40 + j * 28), cy + Math.sin(a) * (60 + j * 22)]); } F.pencil(P, { col: C.red, w: 2.2, draw: d, alpha: .8, seed: 70 + j }); }
      if (i === 2) for (let j = 0; j < 4; j++) { const P = []; for (let q = 0; q <= 20; q++) { const u = q / 20; P.push([cx - 100 + u * 200, cy - 90 + j * 60 + Math.sin(u * 14 - t * 6) * 10]); } F.pencil(P, { col: C.red, w: 2, draw: d, alpha: .85, seed: 80 + j }); } }); }
  caption(t); }

// ---------- p3: the vacuum and the silvered walls ----------
function page3(t) { const t0 = s(4) - .1, k = R(t, t0, 1.4), sil = ss(R(t, s(7) + .4, 1.0));
  chapter(t, 'NO. 02 — THE VACUUM  ·  fig. b', 'Two walls, nothing between.', t0, { size: 70 });
  flask(470, 1130, .78, t, { fill: 'red', stopper: R(t, t0 + 1, .6), vac: R(t, t0 + 1.4, .8), silver: sil, k });
  note('vacuum', 860, 700, R(t, t0 + 1.8, .6), { col: C.navy, size: 44 }); F.arrow([[850, 690], [620, 760]], { col: C.navy, draw: R(t, t0 + 2.2, .5), w: 2.2 });
  // phrase 5: conduction + convection can't cross: two struck symbols in the gap
  if (t > s(5)) { const k5 = R(t, s(5) + .3, .6); F.box(760, 820, 250, 200, k5); F.txt('conduction', 785, 875, { size: 30, f: 'hand', write: k5 }); strike(960, 865, 18, R(t, s(5) + 1.3, .5));
    F.txt('convection', 785, 955, { size: 30, f: 'hand', write: R(t, s(5) + .6, .6) }); strike(960, 945, 18, R(t, s(5) + 2.6, .5)); }
  // phrase 6-7: infrared wavy arrows cross the gap ... then bounce off the silvered wall
  if (t > s(6) - .1) { const bounce = sil > .5; for (let i = 0; i < 4; i++) { const yy = 650 + i * 90, ph = (t * .7 + i * .23) % 1, P = []; const xa = 470 + 95, xb = bounce ? 470 + 120 : 470 + 200;
      for (let q = 0; q <= 16; q++) { const u = q / 16; let x = lerp(xa, xb, u); if (bounce && u > .5) x = lerp(xb, xa, (u - .5) * 2) + 0; P.push([x, yy + Math.sin(u * 12 - t * 8) * 6 + (bounce ? (u > .5 ? (u - .5) * 40 : 0) : 0)]); }
      F.pencil(P, { col: C.red, w: 2.4, draw: R(t, s(6) + i * .15, .5) * (.6 + .4 * Math.sin(ph * Math.PI)), alpha: .9, seed: 90 + i }); }
    note(bounce ? 'bounced back' : 'infrared', 700, 600, R(t, bounce ? s(7) + 1.2 : s(6) + .4, .6), { col: C.red, size: 42 }); }
  if (sil > 0) note('silvered', 860, 1090, sil, { col: C.navy, size: 42 });
  caption(t); }

// ---------- p4: the weak point: the neck ----------
function page4(t) { const t0 = s(8) - .1; chapter(t, 'NO. 03 — THE WEAK POINT  ·  fig. c', 'Heat sneaks out the top.', t0, { size: 70 });
  // zoomed neck: flask scaled big, only its top visible
  g.save(); g.beginPath(); g.rect(60, 450, 960, 700); g.clip(); flask(540, 1950, 1.6, t, { fill: 'red', stopper: R(t, t0 + .6, .6), silver: 1, vac: 1, k: R(t, t0, 1.2) }); g.restore(); F.rect(60, 450, 960, 700, { w: 1.4, col: C.graph, alpha: .6 });
  // conduction path through the join and the stopper: red dots creeping up
  if (t > s(9) - .2) { const kj = R(t, s(9), .6); for (const side of [-1, 1]) for (let j = 0; j < 6; j++) { const u = (t * .5 + j / 6) % 1, x = 540 + side * lerp(168, 112, u), y = lerp(1120, 690, u); g.save(); g.globalAlpha = kj * (1 - u * .6); g.fillStyle = C.red; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); g.restore(); }
    F.circ(540 - 150, 790, 64, { col: C.red, w: 2.4, draw: R(t, s(9) + .8, .6) }); note('walls join here', 650, 900, R(t, s(9) + 1.2, .7), { col: C.red, size: 40 }); }
  if (t > s(10) - .2) { F.box(80, 470, 330, 150, R(t, s(10), .5)); F.txt('neck', 104, 520, { size: 24, f: 'mono', col: '#5d5d62', alpha: R(t, s(10) + .2, .3) }); F.txt('narrow', 104, 590, { size: 56, f: 'hand', col: C.red, write: R(t, s(10) + .4, .5) });
    F.box(670, 470, 330, 150, R(t, s(10) + .9, .5)); F.txt('stopper', 694, 520, { size: 24, f: 'mono', col: '#5d5d62', alpha: R(t, s(10) + 1.1, .3) }); F.txt('thick', 694, 590, { size: 56, f: 'hand', col: C.red, write: R(t, s(10) + 1.3, .5) }); }
  caption(t); }

// ---------- p5: 1892: the demo's day boxes; Dewar; never patented; Thermos ----------
function page5(t) { const t0 = s(11) - .1; chapter(t, 'NO. 04 — WHO MADE IT  ·  fig. d', 'Christmas Day, 1892.', t0, { size: 72 });
  [21, 22, 23, 24, 25].forEach((d, i) => { const x = 80 + i * 150, k = R(t, t0 + .5 + i * .18, .4); F.box(x, 470, 130, 150, k); F.txt(String(d), x + 65, 575, { size: 72, f: 'hand', align: 'center', col: d === 25 ? C.red : C.ink, write: k });
    if (d === 25) F.circ(x + 65, 545, 74, { col: C.red, w: 2.4, draw: R(t, t0 + 1.8, .6) }); });
  F.txt('DEC 1892  ·  ROYAL INSTITUTION, LONDON', 80, 662, { size: 22, f: 'mono', col: '#5d5d62', type: (t - t0 - 2.2) * 40 });
  // Dewar's lab flask with liquid gas (navy) + frost marks
  flask(300, 1150, .5, t, { fill: 'navy', vac: 1, k: R(t, t0 + 1.2, 1.2) }); note('James Dewar', 300, 725, R(t, t0 + 2.6, .7), { align: 'center', size: 44 });
  if (t > s(12) - .2) { note('liquid gases', 300, 1190, R(t, s(12) + .2, .6), { align: 'center', col: C.navy, size: 38 }); for (let i = 0; i < 6; i++) F.squig(250 + i * 20, 1000, 50, t + i, { col: C.navy, alpha: .5, amp: 4 });
    for (let i = 0; i < 4; i++) F.squig(250 + i * 33, 660, 60, t + i * .7, { col: C.navy, alpha: .55, amp: 6 });
  F.seal('NO PATENT', 560, 980, ss(R(t, s(12) + 2.4, .35)), { size: 26, f: 'mono', fs: 22 }); }
  if (t > s(13) - .2) { const k13 = R(t, s(13), .8); flask(780, 1150, .4, t, { fill: 'red', stopper: 1, k: k13 }); F.txt('1904  ·  THERMOS', 780, 760, { size: 26, f: 'mono', wt: 700, align: 'center', col: C.red, type: (t - s(13) - .6) * 30 }); }
  caption(t); }

// ---------- p6: payoff + question ----------
function page6(t) { const t0 = s(14) - .1; chapter(t, 'NO. 05 — THE ANSWER  ·  fig. e', 'Heat can’t get across.', t0, { size: 72 });
  flask(300, 1110, .5, t, { fill: 'red', stopper: 1, silver: 1, vac: 1 }); flask(780, 1110, .5, t, { fill: 'navy', stopper: 1, silver: 1, vac: 1 });
  heatArrows(300, 1110, .5, t, R(t, t0 + .4, .5), { dir: 1 }); heatArrows(780, 1110, .5, t, R(t, t0 + .8, .5), { dir: -1 });
  note('hot stays hot', 300, 520, R(t, t0 + 1.2, .6), { align: 'center', col: C.red }); note('cold stays cold', 780, 520, R(t, t0 + 2.0, .6), { align: 'center', col: C.navy });
  if (t > s(15) - .2) { const kq = R(t, s(15), .5); [['COFFEE', 300, C.red], ['ICE WATER', 780, C.navy]].forEach(([w, x, col], i) => { const k = bo(R(t, s(15) + .5 + i * .3, .4)); if (k <= 0) return; F.box(x - 170, 1150, 340, 110, k); F.txt(w, x, 1222, { size: 40, f: 'mono', wt: 700, align: 'center', col, alpha: clamp(k) }); }); F.txt('or', 540, 1222, { size: 40, f: 'hand', align: 'center', alpha: kq }); }
  else caption(t); }

// ---------- p7: end card (demo's last page: centred lines, red line second, round seal, half disc on the horizon) ----------
function page7(t) { const t0 = s(16) - .2, k = R(t, t0, .6);
  F.txt('Follow for more of', 540, 640, { size: 76, f: 'hand', align: 'center', write: ss(k) }); F.txt('how it really works.', 540, 740, { size: 80, f: 'hand', align: 'center', col: C.red, write: ss(R(t, t0 + .4, .7)) });
  F.txt("A new 'wait, really?' every day.", 540, 830, { size: 34, f: 'body', align: 'center', col: '#5d5d62', alpha: R(t, t0 + .8, .5) });
  F.txt('@howitreallyworkstudio', 540, 900, { size: 28, f: 'mono', wt: 700, align: 'center', col: '#45454c', alpha: R(t, t0 + 1.0, .5) });
  F.seal('END', 540, 1020, ss(R(t, t0 + 1.2, .35)), { round: true, size: 40, f: 'mono', fs: 24 });
  const hz = 1180, disc = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; disc.push([540 + Math.cos(a) * 110, hz + Math.sin(a) * 110]); } F.hatch(disc, 'red', { alpha: .75, k: R(t, t0 + .3, .8) }); F.pencil(disc, { col: C.red, w: 2, draw: R(t, t0 + .3, .8) }); F.line(240, hz, 840, hz, { w: 1.4, col: C.graph }); }

// ---------- route strip (progress device in the bottom band) ----------
const ROUTES = [['CONDUCTION', s(5) + 1.3], ['CONVECTION', s(5) + 2.6], ['RADIATION', s(7) + 1.2]];
function routeStrip(t) { if (t < s(3) || t > s(16) - .3) return; const a = R(t, s(3), .5), y = 1560; F.alpha(a); F.txt('HEAT ROUTES BLOCKED', 90, y - 40, { size: 21, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.line(90, y, 990, y, { w: 1.2, col: C.graph, wob: .3 });
  ROUTES.forEach(([lab, tb], i) => { const x = 210 + i * 330, done = t >= tb; F.txt(lab, x, y + 50, { size: 26, f: 'mono', wt: 700, align: 'center', col: done ? C.red : '#77787e' }); if (done) strike(x, y + 40, 20, R(t, tb, .5)); }); F.alpha(1); }

const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6, 7: page7 };
function scene(t) { F.begin(); const p = pageAt(t); F.footer(p[2]); const pi = PG.indexOf(p);
  { const z = 1 + .011 * Math.sin(t * .8), dx = 7 * Math.sin(t * .55), dy = 9 * Math.sin(t * .7 + 1); g.setTransform(z, 0, 0, z, W / 2 * (1 - z) + dx, H / 2 * (1 - z) + dy); }   // the camera breathes over the page (nothing holds still > 4 s)
  if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; F.alpha(1 - ss(R(t, p[0], .35))); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01)); PREV = false; F.alpha(1); }
  F.alpha(pi === 0 ? 1 : ss(R(t, p[0], .35))); PAGES[p[2]](t); F.alpha(1); routeStrip(t); }
window.DUR = TOT;
// ending: at most 30% dim at the edges; the loop restarts on the title page
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .4); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = (1 - f) * .3; g.fillStyle = C.dark; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// thumbnail: the title-page composition with a 3-word handwritten hook
window.thumb = () => { F.begin(); F.footer(1); const cx = 540, cy = 1000, r = 330, ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; ring.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  F.hatch(ring, 'red', { alpha: .55 }); F.pencil(ring, { col: C.red, w: 2.2 }); flask(540, 1330, .7, 0, { fill: 'red', stopper: 1, vac: 1, silver: 1 }); for (let i = 0; i < 3; i++) F.squig(500 + i * 40, 740, 80, i, { col: C.red, alpha: .7 });
  const w = F.txt('Hot ', 80, 440, { size: 150, f: 'hand', col: C.red, rot: -.015 }); F.txt('AND', 80 + w, 436, { size: 150, f: 'hand', rot: -.015 }); F.txt('cold?', 80, 600, { size: 150, f: 'hand', col: C.navy, rot: -.015 }); F.seal('VACUUM', 900, 380, 1, { size: 30, f: 'mono', fs: 26 }); };
window.seek(0); window.ready = true; window.READY = true;
