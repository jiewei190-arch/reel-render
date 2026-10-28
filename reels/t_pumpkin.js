// t_pumpkin.js: "Why a carved jack-o'-lantern rots so fast" in template #18 handdrawn "Japan heat wave" (demo101) grammar,
// via styles/fieldbook (the module behind the approved flush reel). 1080x1920 Canvas2D, deterministic.
// Field-sketchbook pages: typed chapter labels, handwritten headlines written on, graphite cross-sections with pencil
// hatching, red hatched sun-disc, red seals, double-ruled measurement boxes, a rain-gauge cylinder, day-counter boxes,
// a tick list, a timeline strip in the bottom margin, the setting half-disc end page.
import { createFB, W, H, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const F = createFB(document.getElementById('c')), g = F.g;
const R = ramp;

// ---------- pages: [start, end, page no] ----------
const PG = [[0, s(2) - .05, 1], [s(2) - .05, s(5) - .1, 2], [s(5) - .1, s(8) - .1, 3], [s(8) - .1, s(13) - .1, 4], [s(13) - .1, s(17) - .1, 5], [s(17) - .1, TL.total + 1, 6]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
const inkA = (t, p) => p[2] === 1 ? 1 : ss(R(t, p[0], .35));
let BASE = 1, PREV = false;
const TOP = 160, HEAD = 268, CAPY = 1545;
function caption(t, x = 80, y = CAPY, o = {}) { if (PREV) return; let ci = 0; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); const p = pageAt(t); if (PH[ci].start < p[0] - .1) return; F.body(PH[ci].cap, x, y, o.maxW || 920, ci === 0 ? 99 : t - PH[ci].start + .05, o); }
function chapter(t, label, head, t0, o = {}) { F.label(label, 80, TOP, t - t0); F.head(head, 76, HEAD, t - t0 - .35, o); }
const note = (txt, x, y, tx, ty, k, o = {}) => { if (k <= 0) return; const { col = C.ink, size = 36, align = 'left' } = o; F.pencil([[x + (align === 'left' ? -10 : 10), y - size * .3], [tx, ty]], { col: C.graph, w: 1.2, draw: ss(clamp(k * 2)), wob: .3 }); F.txt(txt, x, y, { size, f: 'hand', col, write: ss(R(k, .3, .7)), align }); };
const el = (cx, cy, rx, ry, n = 48, a0 = 0, a1 = Math.PI * 2) => { const P = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };

// ---------- the jack-o'-lantern: pencil lobes over red hatching; sag 0..1 squashes it and droops the face ----------
function pumpkin(cx, cy, r, o = {}) {
  const { sag = 0, k = 1, carved = true, glow = 0, t = 0, mould = 0 } = o;
  const ry = r * .86 * (1 - sag * .32), by = cy + r * .86 - ry * 1; // bottom stays on the ground
  const out = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; const m = 1 + .045 * Math.cos(a * 5) + sag * .05 * Math.sin(a * 9 + 1); out.push([cx + Math.cos(a) * r * 1.12 * (1 + sag * .06) * m, by + Math.sin(a) * ry * m]); }
  g.save(); F.path(out); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * ss(R(k, .2, .3)); g.fill(); g.restore();
  F.hatch(out, 'ochre', { k: ss(R(k, .3, .5)), alpha: .85 }); F.hatch(out, 'redL', { k: ss(R(k, .35, .5)), alpha: .45 });
  F.pencil(out, { col: C.ink, w: 2.6, draw: ss(R(k, 0, .5)), seed: 1 });
  [-.62, -.25, .25, .62].forEach((f, i) => { const P = []; for (let j = 0; j <= 20; j++) { const a = -Math.PI / 2 + j / 20 * Math.PI; P.push([cx + f * r * 1.05 * Math.cos(a * .2) + Math.sign(f) * Math.cos(a) * r * .18 * Math.abs(f), by + Math.sin(a) * ry * .97]); } F.pencil(P, { col: C.ink, w: 1.6, alpha: .8, draw: ss(R(k, .2 + i * .05, .4)), seed: 3 + i }); });
  // stem
  const st = [[cx - 18, by - ry + 8], [cx - 12, by - ry - 60], [cx + 20, by - ry - 74], [cx + 16, by - ry + 6]]; F.hatch(st, 'ochre', { alpha: .9 * ss(R(k, .4, .3)) }); F.pencil(st, { close: true, w: 2.2, draw: ss(R(k, .3, .4)), seed: 9 });
  if (carved) {
    const fk = ss(R(k, .5, .4)), dr = sag * .5, fy = by - ry * .1;
    const eye = sd => { const ex = cx + sd * r * .4, ey = fy - ry * .28 + sag * 20; const a = sd * dr; const P = [[-38, 26], [0, -34], [38, 26]].map(([x, y]) => [ex + x * Math.cos(a) - y * Math.sin(a), ey + x * Math.sin(a) + y * Math.cos(a) * (1 - sag * .3)]); return P; };
    const nose = [[cx - 18, fy + 6], [cx, fy - 22], [cx + 18, fy + 6]];
    const mo = []; const mw = r * .62, my = fy + ry * .34 + sag * 16; for (let i = 0; i <= 8; i++) { const u = i / 8, x = cx - mw + u * mw * 2, curve = (1 - sag * 1.6) * 34 * Math.sin(u * Math.PI); mo.push([x, my + curve - (i % 2 ? 0 : 16)]); } for (let i = 8; i >= 0; i--) { const u = i / 8, x = cx - mw + u * mw * 2, curve = (1 - sag * 1.6) * 34 * Math.sin(u * Math.PI); mo.push([x, my + curve + 30 + (i % 2 ? 14 : 0)]); }
    [eye(-1), eye(1), nose, mo].forEach((P, i) => { g.save(); F.path(P); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * fk; g.fill(); g.restore(); F.hatch(P, 'redL', { alpha: (.2 + .5 * glow) * fk }); F.pencil(P, { close: true, w: 2.2, draw: fk, seed: 20 + i }); });
    if (glow > 0) for (let i = 0; i < 3; i++) F.squig(cx - 60 + i * 60, by - ry - 90, 90, t + i, { col: C.redL, alpha: .55 * glow, amp: 8 });
  }
  if (sag > .2) for (let i = 0; i < 5; i++) { const x = cx - r * .9 + i * r * .45, y = by - ry * .5 + hash(i) * ry; F.pencil([[x, y], [x + 22, y + 10 * sag], [x + 40, y]], { col: C.ink, w: 1.3, alpha: sag * .8, seed: 40 + i }); }
  if (mould > 0) for (let i = 0; i < 9; i++) { const a = -2.6 + i * .3, x = cx + Math.cos(a) * r * .95, y = by + Math.sin(a) * ry * .9; if (hash(i * 3) > mould) continue; for (let j = 0; j < 5; j++) F.pencil([[x, y], [x + Math.cos(j * 1.25) * 16 * mould, y + Math.sin(j * 1.25) * 16 * mould]], { col: '#7a7a80', w: 1.4, alpha: .9, wob: .4 }); }
}

// ---------- the rind slab (cross-section through the pumpkin wall) used on pages 2-4 ----------
const SX0 = 110, SX1 = 970, SY = 720, RIND = 34, FLESH = 330;
const surf = (x, sag = 0) => SY + Math.sin(x * .012) * 10 + sag * 60 * Math.sin((x - SX0) / (SX1 - SX0) * Math.PI);
function slab(t, o = {}) {
  const { k = 1, cut = 0, dry = 0, sag = 0 } = o, CX = 540, gap = cut * 90;
  const top = x => surf(x, sag), inCut = x => Math.abs(x - CX) < gap * (1 - (0)) ;
  const pieces = cut > 0 ? [[SX0, CX - gap], [CX + gap, SX1]] : [[SX0, SX1]];
  pieces.forEach(([a, b], pi) => {
    const n = 40, T = [], B = [];
    for (let i = 0; i <= n; i++) { const x = lerp(a, b, i / n); T.push([x, top(x)]); B.push([x, top(x) + RIND + FLESH - (cut > 0 ? (pi ? (1 - (x - a) / (b - a)) : (x - a) / (b - a)) ** 6 * 30 * cut : 0)]); }
    const rindP = T.concat(T.slice().reverse().map(([x, y]) => [x, y + RIND]));
    const fleshP = T.map(([x, y]) => [x, y + RIND]).concat(B.slice().reverse());
    F.hatch(fleshP, 'redL', { k: ss(R(k, .3, .5)), alpha: .8 * (1 - dry * .5) });
    if (dry > 0) { const dz = []; const w = 180 * dry; T.forEach(([x, y]) => { if (Math.abs(x - CX) < gap + w) dz.push([x, y + RIND]); }); if (dz.length > 2) { const d2 = dz.concat(dz.slice().reverse().map(([x, y]) => [x, y + 160 * dry])); F.hatch(d2, 'graph', { alpha: .7 * dry }); } }
    F.hatch(rindP, 'red', { k: ss(R(k, .2, .5)), alpha: .95 });
    F.pencil(T, { w: 2.6, draw: ss(R(k, 0, .4)), seed: 1 + pi }); F.pencil(T.map(([x, y]) => [x, y + RIND]), { w: 1.6, col: C.graph, draw: ss(R(k, .1, .4)), seed: 3 + pi }); F.pencil(B, { w: 1.8, col: C.graph, draw: ss(R(k, .15, .4)), seed: 5 + pi });
    F.pencil(T.map(([x, y]) => [x, y - 6]), { w: 2, col: C.ochre, alpha: .9 * ss(R(k, .5, .3)), wob: .6, seed: 7 + pi }); // waxy coat
    if (cut > 0) { const ex = pi ? a : b, ty = top(ex); F.pencil([[ex, ty], [ex + (pi ? 1 : -1) * 6, ty + RIND + FLESH - 30 * cut]], { w: 2.6, seed: 9 + pi }); }
  });
  // stringy pulp below the flesh
  for (let i = 0; i < 10; i++) { const x = SX0 + 40 + i * 85, y0 = SY + RIND + FLESH + 10; F.pencil([[x, y0], [x + 20, y0 + 40], [x + 6, y0 + 80]], { col: C.ochre, w: 1.6, alpha: .7 * ss(R(k, .6, .3)), seed: 60 + i }); }
}

// ---------- pages ----------
function dayBoxes(x, y, n, crossed, t0, t, lab = 'DAY') { for (let i = 0; i < n; i++) { const bx = x + i * 128, k = ss(R(t, t0 + i * .12, .5)); F.box(bx, y, 110, 120, k); F.txt(lab, bx + 55, y + 34, { size: 18, f: 'mono', align: 'center', col: '#5d5d62', alpha: k }); F.txt(String(i + 1), bx + 55, y + 100, { size: 56, f: 'hand', align: 'center', alpha: k, col: i < crossed ? C.red : C.ink }); if (i < crossed) { const a = ss(R(t, t0 + .8 + i * .25, .3)); F.line(bx + 12, y + 12, bx + 98, y + 108, { col: C.red, w: 3, draw: a }); } } }

function page1(t) {
  F.txt('A FIELD SKETCHBOOK  ·  HALLOWEEN NOTES', 80, TOP, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', alpha: .9 });
  F.line(80, TOP + 16, 800, TOP + 16, { w: 1, alpha: .5, wob: .3 });
  // hook caption burned in from frame 0
  const w1 = F.txt('Why it ', 74, 310, { size: 140, f: 'hand', rot: -.015 }); F.txt('sags', 74 + w1, 306, { size: 140, f: 'hand', col: C.red, rot: -.015 }); F.txt('so fast.', 74, 450, { size: 140, f: 'hand', rot: -.015 });
  F.line(84, 482, 640, 476, { col: C.red, w: 2.6, draw: ss(R(t, 0, .6)), wob: .6 });
  F.seal('ROT', 900, 300, ss(R(t, .4, .35)), { size: 46, f: 'mono', fs: 46 });
  caption(t, 80, 570, { size: 48 });
  // the demo's red sun behind the subject; the carved pumpkin is already sagging at frame 0
  const ring = el(560, 1150, 330, 330, 48); F.hatch(ring, 'red', { alpha: .55 }); F.pencil(ring, { col: C.red, w: 2.2, seed: 2 });
  F.pencil([[90, 1410], [990, 1410]], { w: 1.6 });
  const sag = clamp(.15 + t * .12, 0, .75);
  pumpkin(560, 1180, 250, { sag, t, glow: .6 });
  // p1: the uncut pumpkin slides in and the day counters run
  if (t > s(1) - .2) {
    const k = ss(R(t, s(1) - .2, .6)); g.save(); g.globalAlpha = k; g.restore();
    F.box(80, 690, 420, 140, k); F.txt('UNCUT', 110, 740, { size: 24, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', alpha: k }); F.txt('far longer', 110, 805, { size: 52, f: 'hand', col: C.navy, write: ss(R(t, s(1) + .3, .6)) });
    F.box(580, 690, 420, 140, k); F.txt('CARVED', 610, 740, { size: 24, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', alpha: k }); F.txt('a few days', 610, 805, { size: 52, f: 'hand', col: C.red, write: ss(R(t, s(1) + .9, .6)) });
  }
}

function page2(t, p) {
  chapter(t, 'NO. 01 — THE RIND  ·  fig. a', 'A built-in seal.', p[0]);
  slab(t, { k: ss(R(t, p[0] + .2, 1.6)) });
  note('waxy coat', 600, 640, 640, SY - 6, R(t, s(2) + 1.6, .8), { col: '#8a6a22', size: 36 });
  note('hard rind', 160, 640, 220, SY + 16, R(t, s(2) + .8, .8), { col: C.red, size: 38 });
  note('soft flesh', 760, 1170, 720, 1000, R(t, s(2) + 2.2, .8), { size: 36 });
  // p3: water bounces back inside, germs bounce off outside
  if (t > s(3)) { const a = ss(R(t, s(3), .5)); for (let i = 0; i < 4; i++) { const u = (t * .7 + i / 4) % 1, x = 220 + i * 200, y = lerp(980, SY + RIND + 14, Math.sin(u * Math.PI)); F.circ(x, y, 9, { col: C.navy, w: 2, alpha: a, seed: i }); }
    for (let i = 0; i < 4; i++) { const u = (t * .6 + i / 4 + .3) % 1, x = 260 + i * 190, y = lerp(470, SY - 18, Math.sin(u * Math.PI)); [0, 1, 2].forEach(j => F.circ(x + j * 9, y + (j % 2) * 7, 4, { col: C.graph, w: 1.4, alpha: a })); }
    note('water stays in', 120, 1180, 220, 960, R(t, s(3) + .9, .8), { col: C.navy, size: 34 }); note('germs stay out', 640, 470, 640, 560, R(t, s(3) + 1.6, .8), { size: 34 }); }
  // p4: the demo's rain-gauge cylinder: 90% water
  if (t > s(4) - .1) { const k = ss(R(t, s(4) - .1, .6)), base = 1440, top = 1150, x = 800, w = 160; F.box(560, 1110, 460, 380, k); F.pencil([[x, top], [x, base], [x + w, base], [x + w, top]], { w: 2.2, draw: k });
    const f = ss(R(t, s(4) + .5, 1.6)), y = lerp(base, lerp(base, top, .9), f); F.hatch([[x + 4, y], [x + w - 4, y], [x + w - 4, base - 3], [x + 4, base - 3]], 'navy', { alpha: .85 });
    F.txt(Math.round(90 * f) + '%', 690, 1290, { size: 84, f: 'hand', col: C.navy, align: 'center', alpha: k }); F.txt('WATER', 690, 1350, { size: 24, f: 'mono', wt: 700, ls: 3, align: 'center', col: '#5d5d62', alpha: k }); }
  caption(t);
}

// bottom-margin timeline strip (the demo's thin strips): the rot timeline with a red marker riding along
const CYC = () => [['SEALED', 0], ['CUT', s(5)], ['DRYING', s(6)], ['SPORES', s(8)], ['MOULD', s(9)], ['SAG', s(11)]];
function strip(t, a) { if (a <= 0) return; F.alpha(a); const L = CYC(), x0 = 90, x1 = 990, y = 1772, n = L.length;
  F.txt('THE ROT TIMELINE', x0, y - 46, { size: 21, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.line(x0, y, x1, y, { w: 1.4, col: C.graph, wob: .3 });
  let k = 0; L.forEach(([, t0], i) => { if (t >= t0) k = i; });
  L.forEach(([lab], i) => { const x = lerp(x0, x1, i / (n - 1)); F.line(x, y - 9, x, y + 9, { w: 1.4, col: C.graph, wob: .2 }); F.txt(lab, x, y + 42, { size: 26, f: 'hand', align: 'center', col: i === k ? C.red : '#6a6a70' }); });
  const nx = k < n - 1 ? L[k + 1][1] : L[k][1] + 1, u = k < n - 1 ? clamp((t - L[k][1]) / (nx - L[k][1])) : 0, mx = lerp(lerp(x0, x1, k / (n - 1)), lerp(x0, x1, Math.min(k + 1, n - 1) / (n - 1)), u);
  F.hatch([[mx - 13, y - 34], [mx + 13, y - 34], [mx, y - 12]], 'red', { alpha: 1 }); F.pencil([[mx - 13, y - 34], [mx + 13, y - 34], [mx, y - 12]], { close: true, col: C.red, w: 1.8, wob: .3 }); F.alpha(1); }

function page3(t, p) {
  chapter(t, 'NO. 02 — THE CUT  ·  fig. b', 'The seal is broken.', p[0]);
  const cut = ss(R(t, s(5) + .2, .8)), dry = ss(R(t, s(6) + .6, s(7) + 1.5 - s(6))), sag = ss(R(t, s(7), 1.6)) * .8;
  slab(t, { k: 1, cut, dry, sag });
  // the knife: a pencil blade slicing down through the middle
  if (t < s(6)) { const kd = ss(R(t, s(5) - .1, .7)), y = lerp(420, 860, kd); g.save(); g.globalAlpha = 1 - ss(R(t, s(5) + 1.2, .4)); F.pencil([[530, y - 260], [530, y], [556, y - 40], [556, y - 260]], { close: true, w: 2.4 }); F.hatch([[532, y - 380], [554, y - 380], [554, y - 262], [532, y - 262]], 'ochre', { alpha: .9 }); g.restore(); }
  // water escaping as squiggles from the cut
  if (t > s(6)) { const a = ss(R(t, s(6) + .3, .5)); for (let i = 0; i < 5; i++) { const u = (t * .4 + i / 5) % 1; F.squig(480 + i * 28, SY + 120 - u * 260, 90, t + i, { col: C.navy, alpha: a * Math.sin(u * Math.PI), amp: 7 }); }
    note('water escapes', 640, 520, 580, 640, R(t, s(6) + .9, .8), { col: C.navy, size: 38 }); note('dried out', 150, 1180, 400, 900, R(t, s(6) + 2.6, .8), { size: 36 }); }
  // moisture gauge (measurement box)
  if (t > s(6) + .4) { const k = ss(R(t, s(6) + .4, .6)), v = Math.round(lerp(90, 74, dry)); F.box(80, 1180 + 60, 400, 170, k); F.txt('MOISTURE', 108, 1290, { size: 24, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', alpha: k }); F.txt('falling', 108, 1375, { size: 60, f: 'hand', col: C.red, write: ss(R(t, s(6) + .8, .6)) }); void v; }
  if (t > s(7)) pumpkin(800, 1270, 120, { sag: lerp(.3, .8, ss(R(t, s(7), 1.6))), k: ss(R(t, s(7), .6)), t });
  caption(t);
}

function page4(t, p) {
  const sw = s(12) - .2; const a1 = 1 - ss(R(t, sw, .3)), a2 = ss(R(t, sw + .35, .2));
  if (a1 > 0) { F.alpha(F.S.A * a1); chapter(t, 'NO. 03 — THE MOULD  ·  fig. c', 'Spores in the air.', p[0]); F.alpha(BASE); }
  if (a2 > 0) chapter(t, 'NO. 03b — THE ANSWER', 'No more armour.', sw + .3);
  const sagK = ss(R(t, s(11), 1.8));
  slab(t, { k: 1, cut: 1, dry: 1, sag: .8 + .5 * sagK });
  // spores drift down from the air onto the cut
  const sp = ss(R(t, s(8) + .2, .5)); for (let i = 0; i < 14; i++) { const u = ((t - s(8)) * .18 + i / 14) % 1, x = 160 + hash(i) * 760 + Math.sin(t * 1.3 + i) * 30, y = lerp(420, surf(x, 1) - 10, u); if (t < s(8)) continue; F.circ(x, y, 5 + hash(i + 3) * 4, { col: C.graph, w: 1.4, alpha: sp * Math.sin(u * Math.PI) * .9, seed: i }); }
  if (t > s(8)) note('mould spores', 400, 470, 470, 560, R(t, s(8) + .6, .8), { size: 38 });
  // fuzzy grey mould tufts grow on the cut edges
  const mg = ss(R(t, s(9) + 1.2, 2.4)); if (mg > 0) for (let i = 0; i < 16; i++) { const x = 380 + i * 22 - (i > 7 ? -90 : 90) * 0, x2 = i < 8 ? 360 + i * 20 : 560 + (i - 8) * 20, y = surf(x2, 1.3) + RIND * .5 + (hash(i) - .5) * 40; for (let j = 0; j < 6; j++) { const a = -Math.PI / 2 + (j - 2.5) * .45; F.pencil([[x2, y], [x2 + Math.cos(a) * 26 * mg, y + Math.sin(a) * 44 * mg]], { col: '#6f7078', w: 1.4, alpha: .9, wob: .5 }); } void x; }
  if (t > s(9) + 1.4) note('fuzzy grey mould', 120, 600, 380, surf(380, 1.3) - 10, R(t, s(9) + 1.6, .8), { col: '#5d5d62', size: 38 });
  // p10: the microbe names typed into a field-log box
  if (t > s(10) - .1 && t < sw + .2) { const k = ss(R(t, s(10) - .1, .5)) * a1; F.box(80, 1230, 920, 250, k); F.alpha(F.S.A * k);
    F.txt('LOG', 108, 1282, { size: 24, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' });
    [['Penicillium', C.ink, s(10) + .3], ['Aspergillus', C.ink, s(10) + 1.3], ['+ bacteria', C.red, s(10) + 3.0]].forEach(([w, col, t0], i) => F.txt(w, 108 + i * 300, 1380, { size: 52, f: 'hand', col, write: ss(R(t, t0, .6)) }));
    F.alpha(BASE); }
  // p11: soft and saggy (a little pumpkin sags in the corner)
  if (t > s(11) - .2 && t < sw + .2) pumpkin(900, 560, 90, { sag: lerp(.4, .9, sagK), k: ss(R(t, s(11) - .2, .5)) * a1, t });
  // p12: the answer box: water OUT, microbes IN
  if (t > s(12)) { const k = ss(R(t, s(12) + .2, .6)); F.box(80, 1230, 920, 250, k); F.alpha(F.S.A * k);
    F.txt('WATER', 120, 1300, { size: 26, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.txt('OUT', 120, 1420, { size: 110, f: 'hand', col: C.navy, write: ss(R(t, s(12) + 2.4, .5)) });
    F.txt('MICROBES', 560, 1300, { size: 26, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.txt('IN', 560, 1420, { size: 110, f: 'hand', col: C.red, write: ss(R(t, s(12) + 3.6, .5)) }); F.alpha(BASE);
    F.seal('RIND', 960, 430, ss(R(t, s(12) + .8, .3)), { size: 46, round: true, f: 'mono', fs: 22 }); }
  if (t < sw + .3 || t > s(12) + 1) caption(t);
}

function page5(t, p) {
  chapter(t, 'NO. 04 — FIELD TIPS  ·  fig. d', 'How to slow it.', p[0]);
  // p13: candle vs LED, with the demo's thermometer
  const th = (x, v, col, k) => { F.pencil([[x - 16, 470], [x - 16, 830], [x + 16, 830], [x + 16, 470]], { w: 2, draw: k }); F.circ(x, 860, 32, { w: 2, draw: k }); F.hatch(el(x, 860, 28, 28, 24), col, { alpha: k }); const y = lerp(826, 480, v * k); F.hatch([[x - 10, y], [x + 10, y], [x + 10, 832], [x - 10, 832]], col, { alpha: k }); for (let i = 0; i < 6; i++) F.line(x + 18, 500 + i * 60, x + 34, 500 + i * 60, { w: 1, col: C.graph, alpha: k }); };
  const kc = ss(R(t, s(13) - .1, .6));
  pumpkin(330, 840, 130, { k: kc, glow: 1, t, sag: .1 }); th(130, .85, 'red', kc); F.txt('candle', 330, 1030, { size: 46, f: 'hand', align: 'center', alpha: kc });
  if (t > s(13) + 1.4) { F.txt('heat = faster rot', 120, 1100, { size: 40, f: 'hand', col: C.red, write: ss(R(t, s(13) + 1.6, .7)) }); }
  const kl = ss(R(t, s(13) + 2.2, .6)); if (kl > 0) { pumpkin(780, 840, 130, { k: kl, glow: .3, t }); th(960, .3, 'navy', kl); F.txt('LED', 780, 1030, { size: 46, f: 'hand', align: 'center', alpha: kl }); }
  // tick list (the demo's tally marks), ticks land as they are said
  const items = [['scoop out the insides', s(14) + .4], ['keep it cool', s(14) + 2.6], ['out of the sun', s(14) + 3.4], ['petroleum jelly on cuts', s(15) + .3], ['LED, not a candle', s(15) + 3.0]];
  const lk = ss(R(t, s(14) - .1, .5)); if (lk > 0) { F.box(80, 1140, 920, 360, lk); items.forEach(([w, t0], i) => { const x = 110 + (i % 2) * 450, y = 1200 + Math.floor(i / 2) * 100; F.rect(x, y - 30, 40, 40, { w: 2, col: C.graph, alpha: lk }); const tk = ss(R(t, t0, .4)); if (tk > 0) F.pencil([[x + 6, y - 10], [x + 18, y + 4], [x + 44, y - 40]], { col: C.red, w: 3.4, draw: tk, wob: .4 }); F.txt(w, x + 60, y, { size: 34, f: 'hand', alpha: lk, col: tk > .5 ? C.ink : '#8a8a90' }); }); }
  // p16: day counters, a week at most
  if (t > s(16) - .1) { const k = ss(R(t, s(16) - .1, .4)); g.save(); g.fillStyle = C.paper; g.globalAlpha = .9 * k; g.fillRect(70, 420, 950, 680); g.restore(); F.alpha(F.S.A * k);
    F.txt('CARVED PUMPKIN · TYPICAL LIFE', 80, 480, { size: 24, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' });
    dayBoxes(90, 520, 7, 0, s(16), t); F.pencil([[100, 690], [lerp(100, 970, ss(R(t, s(16) + .8, 2.6))), 690]], { col: C.red, w: 4, wob: .5 });
    F.txt('a few days ... a week', 100, 760, { size: 46, f: 'hand', col: C.red, write: ss(R(t, s(16) + 1.6, .8)) });
    F.seal('OCT31', 860, 880, ss(R(t, s(16) + 3.6, .3)), { size: 54, round: true, f: 'mono', fs: 22 });
    F.txt('carve close to Halloween', 100, 900, { size: 46, f: 'hand', write: ss(R(t, s(16) + 3.6, .8)) }); F.alpha(BASE); }
  caption(t);
}

function page6(t, p) {
  const t0 = p[0];
  F.body('Water **out.** Microbes **in.**', 540, 520, 940, t - t0, { size: 50, align: 'center', cps: 40 });
  F.txt('Follow for more of', 540, 700, { size: 92, f: 'hand', align: 'center', write: ss(R(t, t0 + .15, .6)) });
  F.txt('how it really works.', 540, 810, { size: 92, f: 'hand', align: 'center', col: C.red, write: ss(R(t, t0 + .6, .7)) });
  F.seal('END', 880, 1000, ss(R(t, t0 + 1.4, .3)), { size: 54, round: true, f: 'mono', fs: 28 });
  // setting half-disc on the horizon (demo end page), now a pumpkin top with its stem
  const k = ss(R(t, t0 + .2, 1.2)), y0 = 1260, P = []; for (let i = 0; i <= 30; i++) { const a = Math.PI + i / 30 * Math.PI; P.push([540 + Math.cos(a) * 140, y0 + Math.sin(a) * 120 * k]); }
  if (k > .05) { F.hatch(P, 'red', { alpha: .75 }); F.pencil(P, { col: C.red, w: 2.2 }); F.pencil([[532, y0 - 120 * k], [528, y0 - 120 * k - 40 * k], [552, y0 - 120 * k - 46 * k]], { w: 2.4 }); }
  F.line(260, y0, 820, y0, { w: 1.6, draw: ss(R(t, t0, .8)) }); for (let i = 1; i < 4; i++) F.line(420 + i * 20, y0 + i * 14, 660 - i * 20, y0 + i * 14, { w: 1, col: C.redL, alpha: .6 * k });
  F.txt('SOURCES', 80, 1500, { size: 20, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', type: (t - t0 - .6) * 40 });
  ['Utah State Univ. Extension (2020)', 'K-State Research and Extension (2024)', 'Mississippi State Univ. Extension', 'Univ. of Illinois Extension'].forEach((l, i) => F.txt(l, 80, 1540 + i * 32, { size: 20, f: 'mono', col: '#6a6a6e', type: (t - t0 - .9 - i * .3) * 50 }));
}
const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6 };

function scene(t) {
  F.begin(); const p = pageAt(t); F.footer(p[2]);
  const pi = PG.indexOf(p); if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; BASE = 1 - ss(R(t, p[0], .35)); F.alpha(BASE); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01), q); PREV = false; F.alpha(1); }
  BASE = inkA(t, p); F.alpha(BASE); PAGES[p[2]](t, p); F.alpha(1); BASE = 1;
  if (p[2] >= 2 && p[2] <= 4) strip(t, p[2] === 2 ? ss(R(t, p[0] + .3, .5)) : p[2] === 4 ? 1 - ss(R(t, p[1] - .3, .25)) : 1);
  if (t > s(17)) { const a = ss(R(t, s(17) + .5, 2)) * .28; const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(40,30,15,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
}
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.save(); g.globalAlpha = 1 - fade; g.fillStyle = C.dark; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// cover (rule 11): the hook words big inside y 300-1620, the sagging jack-o'-lantern in front of the demo's red sun
window.thumb = () => { F.begin(); F.footer(1);
  F.txt('A FIELD SKETCHBOOK  ·  HALLOWEEN NOTES', 80, 340, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', alpha: .9 });
  const w1 = F.txt('Why it ', 70, 520, { size: 180, f: 'hand', rot: -.02 }); F.txt('sags', 70 + w1, 514, { size: 180, f: 'hand', col: C.red, rot: -.02 });
  F.line(84, 560, 880, 550, { col: C.red, w: 3.5, wob: .6 }); F.seal('ROT', 940, 430, 1, { size: 48, f: 'mono', fs: 48 });
  const ring = el(560, 1180, 340, 340, 48); F.hatch(ring, 'red', { alpha: .55 }); F.pencil(ring, { col: C.red, w: 2.2 });
  F.pencil([[90, 1460], [990, 1460]], { w: 1.6 }); pumpkin(560, 1230, 270, { sag: .55, t: 1, glow: .6, mould: .5 });
};
window.seek(0); window.ready = true; window.READY = true;
