// t_stalebread.js: "Why does bread go stale?" in template #18 handdrawn "Japan heat wave" (demo101) grammar, the earpop fieldbook kit.
// 1080x1920 Canvas2D, deterministic. Field-sketchbook pages: a loaf cross-section whose magnified starch field comes from one state
// function (raw granules -> swollen with water -> soft gel -> stiff crystals -> gel again when warmed), the demo's chart (firmness over
// days: counter / fridge / freezer), measurement boxes, red seals, pencil hatching and leader-line notes.
// Batch N layout: chapter label y 300, head y 405, drawings y 440-1180, captions at y 1235-1420, a text-free strip below, nothing written
// in the right column below y 840.
import { createFB, W, H, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const F = createFB(document.getElementById('c')), g = F.g, R = ramp;

// ---------- pages: [start, end, page no] ----------
const PG = [[0, s(2) - .1, 1], [s(2) - .1, s(4) - .1, 2], [s(4) - .1, s(6) - .1, 3], [s(6) - .1, s(8) - .1, 4], [s(8) - .1, s(9) - .1, 5], [s(9) - .1, s(11) - .1, 6], [s(11) - .1, s(12) - .1, 7], [s(12) - .1, s(13) - .1, 8], [s(13) - .1, TL.total + 1, 9]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
const LBY = 300, HDY = 405, CAPY = 1235;
const note = (txt, x, y, tx, ty, k, o = {}) => { if (k <= 0) return; const { col = C.ink, size = 36, align = 'left' } = o; F.pencil([[x + (align === 'left' ? -10 : 10), y - size * .3], [tx, ty]], { col: C.graph, w: 1.2, draw: ss(clamp(k * 2)), wob: .3 }); F.txt(txt, x, y, { size, f: 'hand', col, write: ss(R(k, .3, .7)), align }); };
const ell = (cx, cy, rx, ry, n = 40, a0 = 0) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

// ---------- the loaf (side view with the cut face showing the crumb) ----------
function loaf(x, y, sc, t, o = {}) { g.save(); g.translate(x, y); g.scale(sc, sc); const k = o.k ?? 1;
  const top = []; for (let i = 0; i <= 30; i++) { const u = i / 30; top.push([-260 + u * 520, -120 - Math.sin(u * Math.PI) * 90 - Math.sin(u * Math.PI * 5) * 6]); }
  const body = [...top, [260, 60], [-260, 60]]; F.hatch(body, 'ochre', { alpha: .75 * k }); F.pencil(body, { close: true, w: 2.6, draw: k, seed: 11 });
  for (let i = 0; i < 4; i++) F.pencil([[-150 + i * 100, -175 + Math.abs(i - 1.5) * 18], [-110 + i * 100, -150 + Math.abs(i - 1.5) * 18]], { w: 2.2, draw: ss(R(k, .4, .4)), seed: 12 + i });   // scoring
  // the cut face (an oval) with crumb holes
  const face = ell(250, -40, 70, 100, 30); g.save(); F.path(face); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * k; g.fill(); g.restore(); F.hatch(face, 'graph', { alpha: .15 * k }); F.pencil(face, { close: true, w: 2.4, draw: k, seed: 17 });
  for (let i = 0; i < 12; i++) { const a = hash(i) * 6.28, rr = hash(i + 3) * 60, cx = 250 + Math.cos(a) * rr * .8, cy = -40 + Math.sin(a) * rr * 1.2; F.circ(cx, cy, 4 + hash(i + 7) * 7, { w: 1.4, col: C.graph, alpha: k, wob: .4, seed: 20 + i }); }
  if (o.bag) { const bag = ell(0, -60, 340 + Math.sin(t * 2) * 4, 200, 40); F.pencil(bag, { close: true, w: 1.8, col: C.navy, dash: [12, 9], alpha: o.bag, seed: 30 }); F.pencil([[-40, -262], [0, -300], [40, -262]], { w: 2.2, col: C.navy, alpha: o.bag, seed: 31 }); }
  g.restore(); }
// ---------- the magnified starch field: one state for every page ----------
// st.sw 0..1 water swelling, st.gel 0..1 granules melted into a soft gel mesh, st.cry 0..1 stiff crystal blocks, st.wd water dots shown, st.mig water moving into crystals
const GR = []; for (let i = 0; GR.length < 13 && i < 400; i++) { const x = 130 + hash(i * 3.3) * 820, y = 520 + hash(i * 5.7) * 520; if (GR.every(([a, b]) => Math.hypot(a - x, b - y) > 190)) GR.push([x, y]); }
function starch(st, t, k = 1) { const { sw = 0, gel = 0, cry = 0, wd = 0, mig = 0 } = st;
  // the soft gluten web (ochre hatch) behind everything
  F.hatch([[90, 470], [990, 470], [990, 1160], [90, 1160]], 'ochre', { alpha: .18 * k });
  GR.forEach(([x, y], i) => { const r0 = 46 + hash(i) * 14, r = r0 * (1 + .55 * ss(sw)), jx = Math.sin(t * 1.3 + i) * 3;
    // granule outline fades as the gel forms
    const out = ell(x + jx, y, r * 1.05, r * .92, 26, i); if (gel < 1) { F.hatch(out, 'graph', { alpha: .22 * (1 - gel) * k }); F.pencil(out, { close: true, w: 2.2, alpha: (1 - gel) * k, seed: 40 + i }); for (let j = 1; j <= 2; j++) F.pencil(ell(x + jx, y, r * j * .3, r * j * .26, 20, i), { close: true, w: 1.1, col: C.graph, alpha: (1 - gel) * (1 - sw) * k, seed: 60 + i * 2 + j }); }
    // gel: loose wavy strands
    if (gel > 0) for (let j = 0; j < 4; j++) { const P = []; for (let q = 0; q <= 12; q++) { const u = q / 12; P.push([x - r + u * 2 * r, y - r * .5 + j * r * .33 + Math.sin(u * 9 + t * 1.6 + i + j) * 10 * (1 - cry)]); } F.pencil(P, { w: 2, col: C.navy, alpha: gel * (1 - cry) * k, seed: 80 + i * 4 + j, wob: .6 }); }
    // crystals: tight parallel bars in a block
    if (cry > 0) { const bw = r * 1.3 * ss(cry), bh = r * .9 * ss(cry); g.save(); g.translate(x, y); g.rotate(hash(i * 9) - .5); F.hatch([[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, bh / 2], [-bw / 2, bh / 2]], 'navy', { alpha: .8 * k * cry }); F.rect(-bw / 2, -bh / 2, bw, bh, { w: 2.4, col: C.navy, draw: ss(cry), seed: 120 + i }); g.restore(); }
    // water dots: around/in the granules; migrate into crystals
    if (wd > 0) for (let j = 0; j < 5; j++) { const a = j / 5 * 6.28 + i, d0 = r * 1.6, d1 = r * .25, d = lerp(d0, d1, ss(mig)), wx = x + Math.cos(a + t * .4) * d, wy = y + Math.sin(a + t * .4) * d * .8; F.circ(wx, wy, 6, { col: C.navy, w: 2, alpha: wd * k, wob: .3, seed: 200 + i * 5 + j }); } }); }
// firmness chart (the demo's chart): days on x, firmness on y; counter (graphite), fridge (red, steep), freezer (navy, flat)
function chart(x, y, w, h, t, a, o = {}) { if (a <= 0) return; const cur = (f, n) => { const P = []; for (let i = 0; i <= 40; i++) { const u = i / 40; P.push([x + u * w, y + h - f(u) * h]); } return P; };
  F.pencil([[x, y - 10], [x, y + h], [x + w + 10, y + h]], { w: 1.6, col: C.graph, draw: a });
  for (let d = 0; d <= 6; d++) { F.line(x + d * w / 6, y + h, x + d * w / 6, y + h + 12, { w: 1.4, col: C.graph, alpha: a }); F.txt(String(d), x + d * w / 6, y + h + 44, { size: 26, f: 'mono', align: 'center', col: '#5d5d62', alpha: a }); }
  F.txt('days', x + w - 40, y + h + 84, { size: 28, f: 'hand', col: C.graph, alpha: a }); F.txt('firmness', x - 4, y - 24, { size: 28, f: 'hand', col: C.graph, alpha: a });
  F.pencil(cur(u => .15 + .8 * (1 - Math.exp(-u * 2.2)) * .95, 0), { w: 2.8, draw: ss(R(a, 0, .8)) * (o.counter ?? 1), seed: 300 });
  if (o.fridge) F.pencil(cur(u => .15 + .8 * (1 - Math.exp(-u * 13)), 0), { w: 3, col: C.red, draw: o.fridge, seed: 301 });
  if (o.freezer) F.pencil(cur(u => .15 + .05 * u, 0), { w: 3, col: C.navy, dash: [10, 7], draw: o.freezer, seed: 302 }); }
// toaster sketch with heat squiggles
function toaster(x, y, sc, t, k, glow) { g.save(); g.translate(x, y); g.scale(sc, sc); const body = [[-170, -40], [170, -40], [190, 160], [-190, 160]];
  F.hatch(body, 'graph', { alpha: .35 * k }); F.pencil(body, { close: true, w: 2.6, draw: k, seed: 400 }); F.rect(-120, -40, 90, 16, { w: 2, draw: k }); F.rect(30, -40, 90, 16, { w: 2, draw: k }); F.pencil([[200, 20], [240, 20], [240, 80]], { w: 2.4, draw: k, seed: 401 });
  const up = ss(glow); for (const sx of [-75, 75]) { const sl = [[sx - 40, -40 - 120 * up], [sx + 40, -40 - 120 * up], [sx + 40, -40], [sx - 40, -40]]; F.hatch(sl, 'ochre', { alpha: .9 * k }); F.pencil(sl, { close: true, w: 2.2, draw: k, seed: 402 + sx }); }
  for (let i = 0; i < 4; i++) F.squig(-110 + i * 70, -230 - 120 * up, 80, t + i, { col: C.red, alpha: glow * k, amp: 8 });
  g.restore(); }
function clock(x, y, r, u, k) { F.circ(x, y, r, { w: 2.4, draw: k, seed: 500 }); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; F.line(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8, x + Math.cos(a) * r * .92, y + Math.sin(a) * r * .92, { w: 1.6, alpha: k }); }
  const a = -Math.PI / 2 + u * 6.28; F.pencil([[x, y], [x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7]], { w: 3, col: C.red, alpha: k, wob: 0 }); F.pencil([[x, y], [x + Math.cos(a / 12 - Math.PI / 2 * 0) * r * .45, y + Math.sin(a / 12) * r * .45]], { w: 3, alpha: k, wob: 0 }); }

// ---------- shared devices ----------
function caption(t, o = {}) { if (PREV) return; let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci < 0) return; const p = pageAt(t); if (PH[ci].start < p[0] - .15) return; F.body(PH[ci].cap, 80, o.y || CAPY, 800, t - PH[ci].start + .05, { size: 48, cps: 120, ...o }); }
function chapter(t, label, head, t0) { F.label(label, 80, LBY, t - t0); F.head(head, 76, HDY, t - t0 - .35, { size: 84 }); }
// bottom strip (text-free): a week of tiny loaves; the current state hatched
function strip(t, a) { if (a <= 0) return; const day = t < s(6) ? 1 : t < s(9) ? lerp(1, 6, R(t, s(6), s(9) - s(6))) : t < s(11) ? 2 : t < s(12) ? 4 : 6; for (let i = 0; i < 7; i++) { const x = 150 + i * 120, y = 1510, on = i < day;
    const L = [[x - 44, y + 20], [x - 40, y - 14], [x - 20, y - 30], [x + 20, y - 30], [x + 40, y - 14], [x + 44, y + 20]]; if (on) F.hatch(L, i < 2 ? 'ochre' : 'graph', { alpha: .7 * a }); F.pencil(L, { close: true, w: 2, alpha: a, seed: 600 + i }); } }
const BASE0 = 1;

// ---------- pages ----------
function page1(t) {   // hook: a sealed loaf, "Stale ≠ dried out", a crumb magnifier where crystals already sit
  F.label('FIELD NOTES  ·  KITCHEN', 80, LBY, 9);
  F.txt('Stale', 74, 470, { size: 120, f: 'hand', rot: -.015 }); F.txt('≠ dried out', 380, 466, { size: 92, f: 'hand', col: C.red, rot: -.015 }); F.line(84, 500, 860, 490, { col: C.red, w: 2.6, draw: ss(R(t, 0, .6)), wob: .6 });
  F.seal('BREAD', 900, 400, ss(R(t, .3, .35)), { size: 62, round: true, f: 'mono', fs: 24 });
  loaf(420, 820, 1.05, t, { bag: 1 }); for (let i = 0; i < 6; i++) { const u = (t * .5 + i / 6) % 1; F.circ(640 + hash(i) * 60, 760 + u * 280, 5 + hash(i + 2) * 4, { col: C.ochre, w: 2, alpha: Math.sin(u * Math.PI), wob: .4 }); }
  // magnifier on the crumb: crystal blocks forming
  const mx = 760, my = 1000, mr = 120; g.save(); F.path(ell(mx, my, mr, mr)); g.clip(); g.translate(mx - 540 * .3, my - 800 * .3); g.scale(.3, .3); starch({ gel: 1, cry: .6 + .4 * Math.sin(t * 1.4) ** 2 }, t); g.restore(); F.circ(mx, my, mr, { w: 3, seed: 700 }); F.pencil([[mx - 84, my - 84], [560, 870]], { w: 1.6, col: C.graph, wob: .3 });
  F.txt('airtight bag', 110, 960, { size: 38, f: 'hand', col: C.navy, write: ss(R(t, .8, .8)) });
  if (t > s(1) - .2) { F.box(80, 1040, 380, 120, ss(R(t, s(1) - .2, .5))); F.txt('Why does bread', 106, 1088, { size: 38, f: 'hand', write: ss(R(t, s(1), .7)) }); F.txt('go stale?', 106, 1136, { size: 38, f: 'hand', col: C.red, write: ss(R(t, s(1) + .4, .5)) }); }
  caption(t); strip(t, 1); }
function page2(t, p) {   // the oven: granules swell with water and melt into a gel; then cooling: crystals form
  chapter(t, 'NO. 01 — IN THE OVEN', t < s(3) - .1 ? 'Water in, starch loosens.' : 'Cooling: crystals.', p[0]);
  const sw = ss(R(t, s(2) + .4, 1.8)), gel = ss(R(t, s(2) + 2.6, 1.6)), cry = ss(R(t, s(3) + .6, 2.8));
  starch({ sw, gel, cry, wd: 1 - gel * .7 }, t, ss(R(t, p[0], .6)));
  F.seal(t < s(3) ? 'HOT' : 'COOL', 900, 520, ss(R(t, p[0] + .4, .3)), { size: 60, round: true, f: 'mono', fs: 26 });
  note('starch grain', 120, 520, GR[0][0] - 30, GR[0][1] - 40, R(t, s(2) + .3, .8)); note('water', 560, 1170 - 30, GR[3][0], GR[3][1] + 50, R(t, s(2) + 1.0, .8), { col: C.navy });
  if (t > s(2) + 2.6 && t < s(3)) F.txt('soft gel', 380, 760, { size: 56, f: 'hand', col: C.navy, write: ss(R(t, s(2) + 3.0, .6)) });
  if (t > s(3) + .6) F.txt('stiff crystals', 340, 760, { size: 56, f: 'hand', col: C.red, write: ss(R(t, s(3) + 1.4, .7)) });
  caption(t); strip(t, 1); }
function page3(t, p) {   // retrogradation: water pulled into the crystals; the sealed loaf still stales
  chapter(t, 'NO. 02 — RETROGRADATION', t < s(5) - .1 ? 'Crystals grab water.' : 'Sealed? Still stale.', p[0]);
  if (t < s(5) - .1) { starch({ gel: 1, cry: 1, wd: 1, mig: ss(R(t, s(4) + 1.2, 2.6)) }, t, 1); note('soft parts', 120, 1120, 200, 1040, R(t, s(4) + .6, .8), { col: C.ochre }); note('crystal', 640, 520, GR[1][0], GR[1][1] - 30, R(t, s(4) + .4, .8), { col: C.navy }); }
  else { const k = ss(R(t, s(5) - .1, .6)); loaf(400, 830, .95, t, { bag: 1, k });
    F.box(640, 580, 330, 130, k); F.txt('WATER INSIDE', 666, 618, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', alpha: k }); F.txt('kept', 700, 684, { size: 54, f: 'hand', col: C.navy, write: ss(R(t, s(5) + .8, .5)) });
    F.box(640, 760, 330, 130, ss(R(t, s(5) + 1.6, .6))); F.txt('STARCH', 666, 798, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', alpha: ss(R(t, s(5) + 1.6, .6)) }); F.txt('grabbed it', 680, 864, { size: 48, f: 'hand', col: C.red, write: ss(R(t, s(5) + 2.6, .6)) }); }
  caption(t); strip(t, 1); }
function page4(t, p) {   // the twist: fridge vs counter: the chart; 1 day = 6 days
  chapter(t, 'NO. 03 — THE FRIDGE', 'Cold makes it worse.', p[0]);
  const a = ss(R(t, p[0] + .3, 1.2)); chart(150, 560, 740, 380, t, a, { fridge: ss(R(t, s(6) + 1.6, 1.0)) });
  F.txt('counter', 760, 690, { size: 36, f: 'hand', write: ss(R(t, p[0] + 1.4, .6)) }); if (t > s(6) + 1.8) F.txt('fridge', 250, 600, { size: 40, f: 'hand', col: C.red, write: ss(R(t, s(6) + 2.0, .6)) });
  if (t > s(7) + .4) { const k = ss(R(t, s(7) + .4, .6)); F.box(150, 1040, 330, 130, k); F.txt('FRIDGE', 176, 1078, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', alpha: k }); F.txt('1 day', 220, 1146, { size: 58, f: 'hand', col: C.red, write: ss(R(t, s(7) + .8, .5)) });
    F.txt('=', 520, 1124, { size: 72, f: 'hand', align: 'center', alpha: ss(R(t, s(7) + 1.4, .3)) }); F.box(560, 1040, 330, 130, ss(R(t, s(7) + 1.6, .6))); F.txt('COUNTER', 586, 1078, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', alpha: ss(R(t, s(7) + 1.6, .6)) }); F.txt('6 days', 620, 1146, { size: 58, f: 'hand', write: ss(R(t, s(7) + 2.0, .5)) }); }
  caption(t); strip(t, 1); }
function page5(t, p) {   // freezer: the crystals barely grow (flat line), snowflake seal
  chapter(t, 'NO. 04 — THE FREEZER', 'Almost paused.', p[0]);
  const a = ss(R(t, p[0] + .2, .8)); chart(150, 560, 740, 380, t, a, { fridge: 1, freezer: ss(R(t, s(8) + .6, 1.0)) }); F.txt('freezer', 700, 900, { size: 40, f: 'hand', col: C.navy, write: ss(R(t, s(8) + 1.2, .6)) });
  F.seal('ICE', 880, 1080, ss(R(t, s(8) + 1.6, .3)), { size: 70, round: true, f: 'mono', fs: 40 }); g.save(); F.path(ell(330, 1110, 100, 100)); g.clip(); g.translate(330 - 540 * .3, 1110 - 800 * .3); g.scale(.3, .3); starch({ gel: 1, cry: .15 }, t * .1); g.restore(); F.circ(330, 1110, 100, { w: 2.4, seed: 701 });
  caption(t); strip(t, 1); }
function page6(t, p) {   // the good news: warm it up, the crystals melt back into gel
  chapter(t, 'NO. 05 — THE TOASTER', 'Heat undoes it.', p[0]);
  const heat = ss(R(t, s(10) + .2, 2.4)); toaster(300, 900, 1.0, t, ss(R(t, p[0] + .2, .8)), Math.max(heat, t > s(10) ? 1 : 0));
  const mx = 760, my = 760, mr = 150; g.save(); F.path(ell(mx, my, mr, mr)); g.clip(); g.translate(mx - 540 * .36, my - 800 * .36); g.scale(.36, .36); starch({ gel: 1, cry: 1 - heat }, t); g.restore(); F.circ(mx, my, mr, { w: 3, seed: 702 });
  F.txt(heat > .5 ? 'gel again' : 'crystals', 680, 970, { size: 44, f: 'hand', col: heat > .5 ? C.navy : C.red, write: ss(R(t, p[0] + .8, .5)) });
  if (t < s(10)) F.seal('UNDO', 880, 540, ss(R(t, s(9) + 1.2, .3)), { size: 60, round: true, f: 'mono', fs: 24 });
  if (t > s(10) + 2.6) F.txt('soft!', 120, 620, { size: 64, f: 'hand', col: C.red, write: ss(R(t, s(10) + 2.6, .4)), rot: -.08 });
  caption(t); strip(t, 1); }
function page7(t, p) {   // only for a while: it cools, the crystals come back
  chapter(t, 'NO. 06 — COOLING AGAIN', 'Only for a while.', p[0]);
  const back = ss(R(t, s(11) + .6, 2.6)); starch({ gel: 1, cry: back }, t, 1); clock(860, 560, 80, R(t, s(11), 3), ss(R(t, s(11) + .2, .5)));
  F.txt('crystals return', 300, 760, { size: 52, f: 'hand', col: C.red, write: ss(R(t, s(11) + 1.6, .7)) });
  caption(t); strip(t, 1); }
function page8(t, p) {   // payoff: the cycle diagram gel -> crystals (time, cold) -> gel (heat)
  chapter(t, 'SUMMARY', 'Not dry. Crystals.', p[0]);
  const k = ss(R(t, p[0] + .2, 1)); const A = [300, 700], B = [780, 700], Cc = [540, 1020];
  [[A, 'soft gel', C.navy], [B, 'crystals', C.red], [Cc, 'warm = gel', C.navy]].forEach(([[x, y], lab, col], i) => { F.circ(x, y, 110, { w: 2.6, draw: ss(R(k, i * .2, .4)), seed: 710 + i }); F.txt(lab, x, y + 14, { size: 40, f: 'hand', align: 'center', col, write: ss(R(t, p[0] + .6 + i * .5, .5)) }); });
  F.arrow([[420, 650], [540, 610], [660, 650]], { draw: ss(R(t, p[0] + 1.2, .6)) }); F.txt('time, cold', 470, 590, { size: 32, f: 'hand', col: C.red, write: ss(R(t, p[0] + 1.6, .5)) });
  F.arrow([[760, 830], [700, 940], [650, 980]], { draw: ss(R(t, p[0] + 2.2, .6)), col: C.navy }); F.arrow([[430, 980], [360, 920], [320, 830]], { draw: ss(R(t, p[0] + 2.8, .6)), col: C.navy });
  caption(t); strip(t, 1); }
function page9(t, p) {   // question + end card
  const t0 = s(14) - .1, q = t < t0;
  if (q) { F.label('YOUR KITCHEN', 80, LBY + 120, t - p[0]); [['fridge?', 120, C.red], ['counter?', 420, C.ink], ['freezer?', 720, C.navy]].forEach(([w, x, col], i) => { const k = R(t, p[0] + .3 + i * .35, .5); F.box(x - 40, 560, 270, 140, k); F.txt(w, x - 10, 644, { size: 44, f: 'hand', col, write: ss(R(t, p[0] + .6 + i * .35, .5)) }); });
    loaf(420, 960, .7, t, { bag: .7 }); caption(t); return; }
  F.txt('Follow for more of', 540, 560, { size: 92, f: 'hand', align: 'center', write: ss(R(t, t0 + .15, .6)) });
  F.txt('how it really works.', 540, 670, { size: 92, f: 'hand', align: 'center', col: C.red, write: ss(R(t, t0 + .6, .7)) });
  F.txt("A new 'wait, really?' every day.", 540, 760, { size: 44, f: 'hand', align: 'center', col: C.ink, write: ss(R(t, t0 + 1.1, .6)) });
  F.txt('@howitreallyworkstudio', 540, 830, { size: 30, f: 'mono', align: 'center', col: '#5d5d62', type: (t - t0 - 1.4) * 34 });
  F.seal('END', 860, 1000, ss(R(t, t0 + 1.4, .3)), { size: 54, round: true, f: 'mono', fs: 28 }); loaf(380, 1040, .6, t, { bag: .7 }); }

let BASE = 1, PREV = false;
const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6, 7: page7, 8: page8, 9: page9 };
function scene(t) {
  F.begin(); const p = pageAt(t); F.footer(p[2]);
  const pi = PG.indexOf(p); if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; BASE = 1 - ss(R(t, p[0], .35)); F.alpha(BASE); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01), q); PREV = false; F.alpha(1); }
  BASE = pi === 0 ? 1 : ss(R(t, p[0], .35)); F.alpha(BASE); PAGES[p[2]](t, p); F.alpha(1); BASE = 1;
  const L = R(t, TL.total - .7, .7); if (L > 0) { F.alpha(ss(L) * .5); page1(0); F.alpha(1); }
}
window.DUR = TL.total;
window.seek = t => scene(t);
window.render = window.seek;
window.thumb = () => { F.begin(); F.footer(1); F.label('A FIELD SKETCHBOOK  ·  KITCHEN NOTES', 80, 330, 9);
  F.txt('Why bread', 70, 520, { size: 160, f: 'hand', rot: -.02 }); F.txt('goes STALE', 70, 700, { size: 150, f: 'hand', col: C.red, rot: -.02 }); F.line(84, 730, 900, 716, { col: C.red, w: 3.5, wob: .6 });
  F.seal('BREAD', 930, 420, 1, { size: 70, round: true, f: 'mono', fs: 26 }); loaf(460, 1120, 1.2, 1, { bag: 1 });
  const mx = 800, my = 1360, mr = 140; g.save(); F.path(ell(mx, my, mr, mr)); g.clip(); g.translate(mx - 540 * .35, my - 800 * .35); g.scale(.35, .35); starch({ gel: 1, cry: .9 }, 1); g.restore(); F.circ(mx, my, mr, { w: 3 }); };
window.seek(0); window.ready = true; window.READY = true;
