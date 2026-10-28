// t_eggflip.js: "Why do eggs turn solid when you cook them?" in template #18 handdrawn "Japan heat wave" (demo101) grammar,
// via styles/fieldbook (the module behind the approved flush and pumpkin reels). 1080x1920 Canvas2D, deterministic.
// Field-sketchbook pages: typed chapter labels, handwritten headlines written on, graphite drawings with pencil hatching,
// a magnifier loupe, a rain-gauge cylinder (water %), a thermometer scale with red seals, double-ruled measurement boxes,
// page changes = ink fades off the sheet, a beat of paper, then the next page types in.
// Batch N layout: nothing typed in the top 250 px or the bottom 480 px, captions y 1240-1400, no text right of x 900 below y 840.
// The end page fades its ink back to page 1 at frame 0 (the paper never fades), so the reel loops.
import { createFB, W, H, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
// own palette (H4's earpop is also #18): a kitchen notebook, cream ruled paper, blue ink lines, pink margin, yolk-amber accents
Object.assign(C, { paper: '#fbf3da', red: '#c47410', redL: '#efb54a', ochre: '#f2b51c', navy: '#4a78a4' });
const F = createFB(document.getElementById('c')), g = F.g;
const R = ramp, TAU = Math.PI * 2;

// ---------- pages: [start, end, page no] ----------
const PG = [[0, s(2) - .05, 1], [s(2) - .05, s(5) - .1, 2], [s(5) - .1, s(8) - .1, 3], [s(8) - .1, s(10) - .1, 4], [s(10) - .1, s(15) - .1, 5], [s(15) - .1, TL.total + 1, 6]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
const inkA = (t, p) => p[2] === 1 ? 1 : ss(R(t, p[0], .35));
let PREV = false;
const TOP = 300, HEAD = 400, CAPY = 1240;
function caption(t, x = 80, y = CAPY, o = {}) { if (PREV) return; let ci = 0; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); const p = pageAt(t); if (PH[ci].start < p[0] - .1) return; F.body(PH[ci].cap, x, y, o.maxW || 800, ci === 0 ? 99 : t - PH[ci].start + .05, { size: 48, ...o }); }
function chapter(t, label, head, t0, o = {}) { F.label(label, 80, TOP, t - t0); F.head(head, 76, HEAD, t - t0 - .35, o); }
const note = (txt, x, y, tx, ty, k, o = {}) => { if (k <= 0) return; const { col = C.ink, size = 36, align = 'left' } = o; F.pencil([[x + (align === 'left' ? -10 : 10), y - size * .3], [tx, ty]], { col: C.graph, w: 1.2, draw: ss(clamp(k * 2)), wob: .3 }); F.txt(txt, x, y, { size, f: 'hand', col, write: ss(R(k, .3, .7)), align }); };
const el = (cx, cy, rx, ry, n = 48, a0 = 0, a1 = TAU) => { const P = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
const mono = (str, x, y, o = {}) => F.txt(str, x, y, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', ...o });

// ---------- drawings ----------
// the counter at the bottom of every page (printed furniture: keeps the bottom band from going blank; no text there)
function counter() { g.save(); g.globalAlpha = .5; g.strokeStyle = '#9cc2e2'; g.lineWidth = 2; for (let y = 262; y < 1700; y += 66) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 1); g.stroke(); }
  g.strokeStyle = '#e88a9a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(56, 0); g.lineTo(57, H); g.stroke(); g.globalAlpha = .9; g.fillStyle = '#efe6cc'; [420, 960, 1500].forEach(y => { g.beginPath(); g.arc(28, y, 13, 0, TAU); g.fill(); }); g.restore();
  F.pencil([[60, 1730], [1020, 1726]], { w: 1.6, seed: 9 }); F.hatch([[60, 1734], [1020, 1730], [1020, 1820], [60, 1820]], 'ochre', { alpha: .35 }); }
// irregular fried-egg white outline
const blob = (cx, cy, r, sc = 1) => { const P = []; for (let i = 0; i <= 44; i++) { const a = i / 44 * TAU, k = 1 + .1 * Math.sin(a * 3 + 1) + .06 * Math.sin(a * 5 + 2); P.push([cx + Math.cos(a) * r * k * sc + (Math.cos(a) > 0 ? 10 : 0), cy + Math.sin(a) * r * .8 * k * sc]); } return P; };
// pan seen from above + an egg whose white sets from the rim inward (set 0..1); yolk ochre
function panEgg(cx, cy, r, set, t, o = {}) {
  const pan = el(cx, cy, r * 1.55, r * 1.3, 60); F.hatch(pan, 'navyL', { alpha: .5 }); F.pencil(pan, { w: 2.4, seed: 3 }); F.pencil(el(cx, cy, r * 1.42, r * 1.18, 60), { w: 1.2, alpha: .6, seed: 5 });
  F.pencil([[cx + r * 1.5, cy - 18], [cx + r * 2.4, cy - 34], [cx + r * 2.4, cy + 10], [cx + r * 1.5, cy + 22]], { w: 2.2, seed: 6 }); F.hatch([[cx + r * 1.5, cy - 18], [cx + r * 2.4, cy - 34], [cx + r * 2.4, cy + 10], [cx + r * 1.5, cy + 22]], 'graph', { alpha: .7 });
  const outer = blob(cx, cy, r), inner = blob(cx, cy, r, Math.max(.001, 1 - set));
  g.save(); g.beginPath(); outer.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); inner.slice().reverse().forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip('evenodd');
  g.globalAlpha = F.S.A; g.fillStyle = F.paperPat(); g.fillRect(cx - r * 1.5, cy - r * 1.2, r * 3, r * 2.4); g.globalAlpha = F.S.A * .55; g.fillStyle = F.pat('graph'); g.fillRect(cx - r * 1.5, cy - r * 1.2, r * 3, r * 2.4); g.restore();
  F.pencil(outer, { w: 2.2, seed: 7, col: set > .2 ? C.ink : C.graph, alpha: set > .2 ? 1 : .6 });
  if (set > .02 && set < .98) F.pencil(inner, { w: 1.2, col: C.graph, alpha: .5, seed: 8, dash: [6, 8] });
  // clear part: a few pan lines show through the raw white
  if (set < .9) for (let i = 0; i < 3; i++) F.line(cx - r * .5, cy - r * .3 + i * r * .25, cx + r * .2, cy - r * .32 + i * r * .25, { w: 1, alpha: .35 * (1 - set), col: C.navy });
  const y = el(cx + 8, cy - 4, r * .34, r * .3, 36); F.hatch(y, 'ochre', { alpha: .9 }); F.pencil(y, { w: 2.2, col: '#8a6a22', seed: 2 }); F.pencil(el(cx - r * .1, cy - r * .12, r * .08, r * .05, 12, 3.6, 5.6), { w: 2, col: '#fff8e0' });
  if (o.bubbles) for (let i = 0; i < 6; i++) { const a = hash(i * 3.1) * TAU, d = r * (.55 + hash(i) * .35), ph = (t * 1.3 + hash(i * 7)) % 1; if (set < d / r) F.circ(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, 4 + ph * 7, { w: 1.2, col: C.graph, alpha: 1 - ph }); }
}
// a protein chain: folded into a ball (u = 0) or unfolded into a wavy strand (u = 1); jitter shakes it
function chain(cx, cy, rad, u, seed, o = {}) { const { jit = 0, t = 0, ang = hash(seed) * Math.PI, len = rad * 6, col = C.red, w = 2.2, draw = 1 } = o; const N = 46, P = [];
  let x = 0, y = 0; const F_ = []; for (let i = 0; i < N; i++) { const a = hash(seed * 31 + i) * TAU; x += Math.cos(a) * rad * .45; y += Math.sin(a) * rad * .45; const d = Math.hypot(x, y); if (d > rad) { x *= rad / d; y *= rad / d; } F_.push([x, y]); }
  for (let i = 0; i < N; i++) { const v = i / (N - 1) - .5, ux = v * len, uy = Math.sin(i * .7 + seed) * rad * .35; const lx = Math.cos(ang) * ux - Math.sin(ang) * uy, ly = Math.sin(ang) * ux + Math.cos(ang) * uy;
    const jx = jit ? Math.sin(t * 40 + i * 2.1 + seed) * jit : 0, jy = jit ? Math.cos(t * 37 + i * 1.7 + seed) * jit : 0; P.push([cx + lerp(F_[i][0], lx, u) + jx, cy + lerp(F_[i][1], ly, u) + jy]); }
  F.pencil(P, { w, col, seed, wob: .6, draw }); return P; }
// magnifier loupe frame with a handle (the field-notes inset)
function loupe(cx, cy, r, k, inner) { if (k <= 0) return; const ring = el(cx, cy, r, r, 64); F.pencil(ring, { w: 2.6, draw: ss(k) }); F.pencil(el(cx, cy, r + 12, r + 12, 64), { w: 1.2, alpha: .6, draw: ss(k) });
  const hx = cx - r * .72, hy = cy + r * .72; F.pencil([[hx, hy], [hx - 80, hy + 80]], { w: 10, col: C.graph, alpha: .8, draw: ss(R(k, .5, .5)) });
  if (k > .3) { g.save(); F.path(ring); g.clip(); F.hatch(ring, 'navyL', { alpha: .22 }); inner(); g.restore(); } }
// vertical thermometer scale (°C) with tick marks; returns y for a value
function thermo(x, y0, y1, lo, hi, v, k) { const Y = c => lerp(y1, y0, (c - lo) / (hi - lo)); F.pencil([[x - 22, y0 - 10], [x - 22, y1], [x + 22, y1], [x + 22, y0 - 10]], { w: 2.2, draw: ss(k) }); F.circ(x, y1 + 40, 44, { w: 2.2, draw: ss(k) });
  F.hatch(el(x, y1 + 40, 42, 42, 30), 'red', { alpha: .9 * k }); if (k > .3) F.hatch([[x - 12, Y(v)], [x + 12, Y(v)], [x + 12, y1 + 10], [x - 12, y1 + 10]], 'red', { alpha: .95 });
  for (let c = lo; c <= hi; c += 5) F.line(x + 22, Y(c), x + (c % 10 ? 36 : 48), Y(c), { w: 1.4, alpha: .7 * k }); for (let c = lo; c <= hi; c += 10) mono(c + '°', x - 40, Y(c) + 8, { size: 20, align: 'right', alpha: k }); return Y; }

// ---------- pages ----------
function page1(t) {   // hook: the egg is already setting at frame 0, heat lines rising; the headline asks the search question
  mono('KITCHEN NOTEBOOK  ·  EGG NOTES', 80, TOP, { size: 25, col: '#45454c', alpha: .9 }); F.line(80, TOP + 16, 800, TOP + 16, { w: 1, alpha: .5, wob: .3 });
  const w1 = F.txt('Why it turns ', 74, 440, { size: 112, f: 'hand', rot: -.015 }); F.txt('solid.', 74, 560, { size: 112, f: 'hand', col: C.red, rot: -.015 });
  F.line(84, 586, 420, 582, { col: C.red, w: 2.6, draw: ss(R(t, 0, .6)), wob: .6 });
  F.seal('EGG', 900, 470, ss(R(t, .3, .35)), { size: 48, f: 'mono', fs: 48 });
  const set = clamp(.18 + t * .19, 0, 1); panEgg(470, 900, 210, set, t, { bubbles: true });
  for (let i = 0; i < 3; i++) F.squig(250 + i * 220, 1210, 70, t + i, { col: C.redL, alpha: .55 });
  if (t > s(1) - .1) { const k = R(t, s(1) - .1, .8); note('clear → white', 650, 660, 560, 790, k, { col: C.navy, size: 40 }); note('runny → solid', 60, 1150, 300, 1040, R(t, s(1) + .5, .8), { col: C.red, size: 40 }); }
  caption(t);
}
function page2(t, p) {   // the white: ~88% water (rain-gauge cylinder); in the loupe, folded chains shake and unfold
  chapter(t, 'NO. 01 — THE WHITE  ·  fig. a', 'Water, with chains in it.', p[0]);
  const k = ss(R(t, p[0] + .2, .8)), base = 1110, top = 600, x = 120, w = 150; F.box(80, 560, 230, 640, k * 0);
  F.pencil([[x, top], [x, base], [x + w, base], [x + w, top]], { w: 2.2, draw: k }); for (let i = 1; i < 10; i++) F.line(x, lerp(base, top, i / 10), x + 18, lerp(base, top, i / 10), { w: 1, alpha: .6 * k });
  const f = ss(R(t, s(2) + .4, 1.6)), y = lerp(base, lerp(base, top, .88), f); F.hatch([[x + 4, y], [x + w - 4, y], [x + w - 4, base - 3], [x + 4, base - 3]], 'navy', { alpha: .85 });
  F.hatch([[x + 4, lerp(base, top, .99)], [x + w - 4, lerp(base, top, .99)], [x + w - 4, y], [x + 4, y]], 'red', { alpha: .7 * f });
  F.txt('~' + Math.round(88 * f) + '%', x + w / 2, 560, { size: 66, f: 'hand', col: C.navy, align: 'center', alpha: k }); mono('WATER', x + w / 2, 1150, { align: 'center', alpha: k });
  const unf = ss(R(t, s(4) + 1.6, 1.4)), shake = R(t, s(4), .3) * (1 - unf * .7);
  loupe(620, 830, 250, R(t, s(2) + 1.2, .8), () => {
    for (let i = 0; i < 6; i++) { const cx = 470 + (i % 3) * 150 + Math.sin(t * .8 + i) * 12, cy = 720 + Math.floor(i / 3) * 210 + Math.cos(t * .7 + i * 2) * 10; chain(cx, cy, 34, unf, i + 1, { jit: shake * 7, t, len: 190 }); }
    for (let i = 0; i < 10; i++) F.circ(420 + hash(i * 3.3) * 400, 620 + hash(i * 5.7) * 420, 6, { w: 1.2, col: C.navy, alpha: .5 }); });
  if (t > s(3) + .6 && t < s(4) + 1.6) note('folded chain', 700, 600, 640, 700, R(t, s(3) + .6, .8), { col: C.red, size: 38 });
  if (t > s(4)) for (let i = 0; i < 3; i++) F.squig(480 + i * 140, 1150, 60, t * 2 + i, { col: C.red, alpha: .7 });
  if (t > s(4) + 1.4) note('snap!', 380, 620, 470, 700, R(t, s(4) + 1.4, .6), { col: C.red, size: 40 });
  if (t > s(4) + 3.6) { const k = ss(R(t, s(4) + 3.6, .3)); F.rect(700, 520, 300, 58, { col: C.red, w: 2.6, draw: k }); F.txt('DENATURED', 850, 562, { size: 30, f: 'mono', wt: 700, ls: 3, col: C.red, align: 'center', type: (t - s(4) - 3.7) * 30 }); }
  caption(t);
}
function page3(t, p) {   // the net: strands grab each other (red link dots), water drops are caught in the mesh; light bounces off
  chapter(t, 'NO. 02 — THE NET  ·  fig. b', 'Tangled into a net.', p[0]);
  const link = ss(R(t, s(5) + .9, 1.4)), catchW = ss(R(t, s(6) + 2.2, 1.2)), Sx = [];
  loupe(480, 740, 250, R(t, p[0] + .2, .8), () => {
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI + .2, cx = 480 + Math.cos(i * 2.4) * 60 * (1 - link * .5), cy = 740 + Math.sin(i * 1.9) * 60 * (1 - link * .5); Sx.push(chain(cx, cy, 30, 1, i + 3, { ang: a, len: 380, jit: 2, t, w: 2 })); }
    if (link > 0) for (let i = 0; i < 26; i++) { const A = Sx[i % 9], B = Sx[(i * 4 + 3) % 9], pa = A[(i * 7) % A.length]; let best = null, bd = 1e9; B.forEach(q => { const d = Math.hypot(q[0] - pa[0], q[1] - pa[1]); if (d < bd) { bd = d; best = q; } }); if (bd < 60 && hash(i) < link) F.circ((pa[0] + best[0]) / 2, (pa[1] + best[1]) / 2, 5, { w: 3, col: C.red }); }
    for (let i = 0; i < 12; i++) { const fx = 300 + hash(i * 2.2) * 360, fy = 560 + hash(i * 4.4) * 360, dx = Math.sin(t * 1.8 + i) * 40 * (1 - catchW), dy = Math.cos(t * 1.5 + i * 2) * 30 * (1 - catchW); F.circ(fx + dx, fy + dy, 9, { w: 1.8, col: C.navy }); F.hatch(el(fx + dx, fy + dy, 8, 8, 14), 'navy', { alpha: .6 }); } });
  if (t > s(5) + 1.2) note('links', 760, 560, 600, 640, R(t, s(5) + 1.2, .7), { col: C.red, size: 40 });
  if (t > s(6) + 2.4) note('water, caught', 780, 960, 640, 860, R(t, s(6) + 2.4, .7), { col: C.navy, size: 38 });
  // light bounces off the mesh (schematic) on "clear into white"
  if (t > s(7) - .2) { const k = R(t, s(7) - .2, 1); for (let i = 0; i < 3; i++) { const y0 = 640 + i * 90; F.arrow([[60, y0], [240, y0 + 20]], { draw: ss(k), col: C.ochre, w: 2.4 }); F.arrow([[240, y0 + 20], [150, y0 + 20 + (i - 1) * 90]], { draw: ss(R(k, .5, .5)), col: C.ochre, w: 2 }); } }
  const kb = ss(R(t, s(7) + .3, .6)); F.box(80, 1030, 380, 140, kb); mono('BEFORE', 110, 1076, { alpha: kb }); F.txt('clear · runny', 110, 1140, { size: 44, f: 'hand', col: C.navy, write: ss(R(t, s(7) + .5, .6)) });
  F.box(500, 1030, 390, 140, kb); mono('AFTER', 530, 1076, { alpha: kb }); F.txt('white · solid', 530, 1140, { size: 44, f: 'hand', col: C.red, write: ss(R(t, s(7) + 1.2, .6)) });
  caption(t);
}
function page4(t, p) {   // the heat: a thermometer scale with the setting points; the egg cross-section sets; too long = rubbery
  chapter(t, 'NO. 03 — THE HEAT  ·  fig. c', 'Each one has its own heat.', p[0]);
  const t63 = s(8) + 4.0, t70 = s(8) + 6.9, v = t < t63 ? lerp(40, 63, ss(R(t, p[0] + .3, t63 - p[0] - .3))) : t < t70 ? lerp(63, 70, ss(R(t, t63, t70 - t63))) : lerp(70, 90, ss(R(t, s(9), 2.5)));
  const Y = thermo(200, 520, 1080, 40, 90, v, ss(R(t, p[0] + .2, .8)));
  [[63, 'white starts to set', t63 - .3, C.ink], [70, 'yolk sets', t70 - .3, '#8a6a22'], [80, 'white firm (main protein)', t70 + .8, C.graph]].forEach(([c, l, t0, col]) => { if (t > t0) { F.line(240, Y(c), 300, Y(c), { col: C.red, w: 2, draw: ss(R(t, t0, .3)) }); F.txt(c + ' °C', 310, Y(c) + 12, { size: 40, f: 'hand', col: C.red, write: ss(R(t, t0 + .1, .4)) }); F.txt(l, 450, Y(c) + 12, { size: 34, f: 'hand', col, write: ss(R(t, t0 + .3, .6)) }); } });
  // halved boiled egg (right): white sets past 63, yolk past 70
  const cx = 790, cy = 1000, wk = clamp((v - 58) / 10), yk = clamp((v - 66) / 6), shell = el(cx, cy, 110, 140, 48);
  if (wk > 0) F.hatch(shell, 'graph', { alpha: .45 * wk + (v > 80 ? .3 : 0) }); F.pencil(shell, { w: 2.4, seed: 4 });
  const yo = el(cx, cy + 16, 52, 52, 36); F.hatch(yo, 'ochre', { alpha: .5 + .45 * yk }); F.pencil(yo, { w: 2, col: '#8a6a22', seed: 6 });
  if (yk < .9) for (let i = 0; i < 3; i++) F.pencil(el(cx, cy + 16, 20 + i * 11, 20 + i * 11, 24), { w: 1, col: '#8a6a22', alpha: .4 * (1 - yk), dash: [4, 6] });
  if (t > s(9) + 1.4) { const k = R(t, s(9) + 1.4, .8); for (let i = 0; i < 4; i++) { const u = (t * .8 + i / 4) % 1; F.circ(700 + i * 55, 1060 + u * 90, 7, { w: 1.6, col: C.navy, alpha: k * (1 - u) }); } F.seal('RUBBERY', 960, 620, ss(R(t, s(9) + 2.4, .3)), { size: 30, f: 'mono', fs: 26, rot: .05 }); note('too many links', 290, 1160, 690, 1020, k, { col: C.red, size: 38 }); }
  caption(t);
}
function page5(t, p) {   // uncook? not in a kitchen (red X); 2015: dissolve, spin in a vortex fluid device, one protein refolds
  chapter(t, 'NO. 04 — UNCOOK?  ·  fig. d', 'Can you uncook it?', p[0]);
  const kk = ss(R(t, p[0] + .3, .8)), fade = 1 - .7 * ss(R(t, s(12), .6));
  // left: cooked -> raw arrow, crossed out
  F.alpha(F.S.A * fade); const c1 = el(200, 600, 90, 110, 36); F.hatch(c1, 'graph', { alpha: .45 * kk }); F.pencil(c1, { w: 2.2, draw: kk }); F.hatch(el(200, 615, 40, 40, 20), 'ochre', { alpha: .9 * kk });
  const c2 = el(200, 870, 90, 105, 36); F.pencil(c2, { w: 1.6, draw: kk, col: C.graph, dash: [6, 7] }); F.hatch(el(200, 885, 40, 40, 20), 'ochre', { alpha: .6 * kk }); mono('COOKED', 200, 750, { align: 'center', alpha: kk }); mono('RAW', 200, 1012, { align: 'center', alpha: kk });
  F.arrow([[330, 640], [360, 760], [330, 870]], { draw: ss(R(t, p[0] + .6, .6)), col: C.graph });
  if (t > s(11)) { const x = ss(R(t, s(11), .4)); F.line(290, 700, 400, 820, { col: C.red, w: 5, draw: x }); F.line(400, 700, 290, 820, { col: C.red, w: 5, draw: ss(R(t, s(11) + .2, .4)) }); }
  F.alpha(F.S.A / fade);
  // right: the vortex fluid device (a tilted spinning tube), tangle in, one protein ball out
  if (t > s(12) - .2) { const k = ss(R(t, s(12) - .2, .8)), cx = 680, cy = 700, ang = -.6;
    g.save(); g.translate(cx, cy); g.rotate(ang); const tube = [[-60, -260], [60, -260], [60, 260], [-60, 260]]; F.hatch(tube, 'navyL', { alpha: .35 * k }); F.pencil(tube, { w: 2.4, draw: k, close: true });
    for (let i = 0; i < 6; i++) { const y = -220 + i * 80, ph = t * 6 + i; F.pencil(el(0, y, 52, 14, 24, ph, ph + 4.2), { w: 1.6, col: C.navy, alpha: .8 * k }); } g.restore();
    F.pencil([[cx - 40, cy + 300], [cx + 120, cy + 300]], { w: 2, alpha: k }); F.pencil([[cx + 40, cy + 300], [cx + 40, cy + 220]], { w: 3, alpha: k });
    F.seal('2015', 880, 560, ss(R(t, s(12) + .2, .3)), { size: 40, round: true, f: 'mono', fs: 24 });
    mono('UC IRVINE + FLINDERS UNIV.', 80, 470, { size: 20, type: (t - s(12) - .4) * 40, col: '#45454c' });
    const st = [['1', 'DISSOLVE', s(13) + .2], ['2', 'SPIN', s(13) + 2.2], ['3', 'REFOLD', s(13) + 4.6]];
    st.forEach(([n, l, t0], i) => { const kb = ss(R(t, t0, .5)); const bx = 80 + i * 280; F.box(bx, 1040, 250, 120, kb); mono(n, bx + 24, 1090, { alpha: kb, col: C.red }); F.txt(l, bx + 56, 1094, { size: 30, f: 'mono', wt: 700, col: '#3a3a40', type: (t - t0 - .2) * 30 }); });
    if (t > s(13) + 4.6) { const u = ss(R(t, s(13) + 4.6, 1.2)); chain(500, 980 - 30, 34, 1 - u, 7, { len: 170, t }); note('lysozyme', 300, 930, 460, 950, R(t, s(13) + 5.2, .7), { col: C.red, size: 38 }); }
    }
  caption(t);
}
function page6(t, p) {   // payoff strip (ball -> strand -> net), the question, then the end card over the same pan as frame 0
  const t0 = p[0], endT = s(17) - .1;
  if (t < endT) {
    chapter(t, 'NO. 05 — THE ANSWER', 'Protein origami, in reverse.', t0, { size: 70 });
    const k = R(t, t0 + .3, 2.4); chain(200, 720, 40, 0, 4, { draw: ss(R(k, 0, .3)) }); F.arrow([[270, 720], [340, 720]], { draw: ss(R(k, .25, .2)), col: C.graph });
    chain(480, 720, 40, 1, 4, { len: 200, draw: ss(R(k, .35, .3)) }); F.arrow([[600, 720], [670, 720]], { draw: ss(R(k, .6, .2)), col: C.graph });
    if (k > .7) for (let i = 0; i < 5; i++) chain(800, 720, 30, 1, i + 3, { ang: i / 5 * Math.PI, len: 170, w: 1.8 });
    mono('FOLDED', 200, 830, { align: 'center', alpha: ss(R(k, .1, .3)) }); mono('UNFOLDED', 480, 830, { align: 'center', alpha: ss(R(k, .45, .3)) }); mono('TANGLED', 800, 830, { align: 'center', alpha: ss(R(k, .75, .3)) });
    if (t > s(16) - .2) { const q = R(t, s(16) - .2, 1); F.box(140, 920, 300, 130, q); F.txt('runny', 190, 1004, { size: 56, f: 'hand', col: C.navy, write: ss(R(q, .3, .4)) }); F.box(560, 920, 300, 130, q); F.txt('hard', 640, 1004, { size: 56, f: 'hand', col: C.red, write: ss(R(q, .5, .4)) }); }
    caption(t); return; }
  const a = t - endT;
  F.txt('Follow for more of', 540, 540, { size: 92, f: 'hand', align: 'center', write: ss(R(a, .1, .6)) });
  F.txt('how it really works.', 540, 650, { size: 92, f: 'hand', align: 'center', col: C.red, write: ss(R(a, .5, .7)) });
  F.txt("A new 'wait, really?' every day.", 540, 740, { size: 44, f: 'body', wt: 700, align: 'center', col: '#3a3a40', type: (a - .9) * 40 });
  panEgg(470, 990, 150, 1, t); F.seal('END', 850, 1150, ss(R(a, 1.2, .3)), { size: 46, round: true, f: 'mono', fs: 24 });
  F.txt('@howitreallyworkstudio', 540, 1330, { size: 34, f: 'mono', wt: 700, align: 'center', col: '#45454c', type: (a - 1.0) * 30 });
}
const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6 };

function scene(t) {
  F.begin(); counter(); const p = pageAt(t);
  const pi = PG.indexOf(p); if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; F.alpha(1 - ss(R(t, p[0], .35))); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01), q); PREV = false; F.alpha(1); }
  F.alpha(inkA(t, p)); PAGES[p[2]](t, p); F.alpha(1);
}
window.DUR = TL.total;
// loop: in the last 0.5 s the end page's ink fades off (paper stays) and page 1 inks back in exactly as frame 0
window.seek = t => { const T = TL.total, a = T - .5; if (t <= a) return scene(t);
  const u = (t - a) / .5; F.begin(); counter(); if (u < .55) { F.alpha(1 - ss(u / .55)); page6(Math.min(t, T - .5), PG[5]); } else { F.alpha(ss((u - .55) / .45)); page1(0); } F.alpha(1); };
window.render = window.seek;
// cover (rule 11): the question big inside y 300-1620, the egg setting in the pan
window.thumb = () => { F.begin(); counter();
  mono('KITCHEN NOTEBOOK  ·  EGG NOTES', 80, 340, { size: 25, col: '#45454c', alpha: .9 });
  F.txt('Why eggs', 70, 540, { size: 180, f: 'hand', rot: -.02 }); F.txt('go solid.', 70, 730, { size: 190, f: 'hand', col: C.red, rot: -.02 });
  F.line(84, 770, 700, 760, { col: C.red, w: 3.5, wob: .6 }); F.seal('EGG', 900, 470, 1, { size: 56, f: 'mono', fs: 56 });
  panEgg(470, 1110, 210, .55, 1, { bubbles: true });
};
window.seek(0); window.ready = true; window.READY = true;
