// t_planelift.js: "How do planes actually stay in the air?" in the Blueprint style (#3, lemo-opuscar/styles/blueprint grammar).
// 1080x1920 Canvas2D, deterministic, pure function of t. One wing section (cambered airfoil at an angle of attack); the
// streamlines, the air parcels and the pressure marks are computed from the same geometry.
// Batch N layout: the title block (status = the verdict) moves to the top band (y 300-428), the figure viewport is y 490-1130,
// the double-ruled NOTE box (subtitles) sits at y 1150-1412; nothing but sheet rules below y 1440.
import { createBP, W, H, VP, DASH, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/blueprint/blueprint.js';
await Promise.all(['700 40px "Caveat"', '600 20px "Poppins"', '800 40px "Poppins"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const B = createBP(document.getElementById('c')), g = B.g;
const R = (t, t0, d) => ramp(t, t0, d);
VP.y = 490; VP.h = 640;

// ---------- wing geometry (sheet units): cambered 12% airfoil, chord 700, angle of attack 6 deg ----------
const LE = [140, 790], CH = 700, AOA = 6 * Math.PI / 180;
function airfoil(n = 70) {
  const up = [], lo = [], m = .04, p = .4, th = .12;
  for (let i = 0; i <= n; i++) { const b = i / n * Math.PI, x = (1 - Math.cos(b)) / 2;
    const yt = 5 * th * (.2969 * Math.sqrt(x) - .126 * x - .3516 * x * x + .2843 * x ** 3 - .1015 * x ** 4);
    const yc = x < p ? m / (p * p) * (2 * p * x - x * x) : m / ((1 - p) ** 2) * ((1 - 2 * p) + 2 * p * x - x * x);
    up.push([x, yc + yt]); lo.push([x, yc - yt]); }
  const tf = ([x, y]) => { const X = x * CH, Y = -y * CH, c = Math.cos(AOA), sn = Math.sin(AOA); return [LE[0] + X * c - Y * sn, LE[1] + X * sn + Y * c]; };
  return { up: up.map(tf), lo: lo.map(tf) };
}
const AF = airfoil(), WING = AF.up.concat(AF.lo.slice().reverse());
const TE = AF.up[AF.up.length - 1];
// streamline with offset d (negative = above the wing): upwash ahead, downwash behind (sheet y grows downward)
const SLX0 = -40, SLX1 = 1120;
function stream(d, n = 90) { const P = [], k = 1 - Math.min(1, Math.abs(d) / 520); const D = 130 * k * k + 20;
  for (let i = 0; i <= n; i++) { const x = lerp(SLX0, SLX1, i / n); const sig = 1 / (1 + Math.exp(-(x - 620) / 120)), up = Math.exp(-(((x - 260) / 150) ** 2));
    let y = 800 + d + D * sig - .45 * D * up;
    if (d < 0) { const top = surfY(AF.up, x); if (top != null) y = Math.min(y, top - 46 - (-d - 110) * .55); }
    if (d > 0) { const bot = surfY(AF.lo, x); if (bot != null) y = Math.max(y, bot + 40 + (d - 110) * .5); }
    P.push([x, y]); }
  return P; }
function surfY(S, x) { for (let i = 1; i < S.length; i++) { const a = S[i - 1], b = S[i]; if ((x - a[0]) * (x - b[0]) <= 0 && a[0] !== b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return null; }
const LINES = [-330, -230, -150, 150, 230, 330].map(d => ({ d, P: stream(d) }));
const cum = P => { const L = [0]; for (let i = 1; i < P.length; i++) L[i] = L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function along(P, L, u) { const T = L[L.length - 1] * clamp(u); for (let i = 1; i < P.length; i++) if (L[i] >= T) { const k = (T - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; } return P[P.length - 1]; }
const UPL = cum(AF.up), LOL = cum(AF.lo);

// ---------- parts ----------
const tint = (pts, a) => { g.save(); g.globalAlpha = B.S.A * a; g.fillStyle = '#E7F0F9'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); };
function callout(txt, x, y, tx, ty, k, o = {}) {
  if (k <= .02) return; const size = o.size || 34, w = B.measure(txt, size, { font: 'Poppins', weight: 600 }) + 34, h = size * 1.35; const lk = ss(clamp(k * 1.5));
  const bx = x, by = y + (ty > y ? h / 2 : -h / 2); if (tx != null) { B.line(bx, by, lerp(bx, tx, lk), lerp(by, ty, lk), { w: 1.4, nib: false }); if (lk >= 1) { g.save(); g.globalAlpha = B.S.A; g.fillStyle = C.ink; g.beginPath(); g.arc(tx, ty, 4.5 * B.S.k, 0, 7); g.fill(); g.restore(); } }
  B.paper([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], .96); B.rect(x - w / 2, y - h / 2, w, h, { w: 1.6, nib: false, draw: clamp(k * 2) }); B.txt(txt, x, y + 2, { size, align: 'center', write: R(k, .3, .7), font: 'Poppins', weight: 600 }); }
function wing(t, d = 1) {
  B.paper(WING, .95); tint(WING, .1); B.hatch(WING, { ang: -Math.PI / 4, sp: 14, alpha: .35, draw: d });
  B.poly(WING, { w: 3, close: true, draw: d });
  B.poly([[LE[0] - 60, LE[1]], [LE[0] + CH * Math.cos(AOA) + 80, LE[1] + CH * Math.sin(AOA)]], { w: 1.2, dash: DASH.centre, draw: d, alpha: .7, nib: false }); // chord line
}
function streamlines(t, a, speedUp = 1.25) { if (a <= 0) return;
  LINES.forEach(({ d, P }, i) => { B.poly(P, { w: 1.6, alpha: .55 * a, nib: false, dash: [14, 10] });
    const L = cum(P); for (let j = 0; j < 4; j++) { const v = d < 0 ? .16 * speedUp : .16, u = (t * v + j / 4 + i * .13) % 1, [x, y] = along(P, L, u); g.save(); g.globalAlpha = B.S.A * a * Math.sin(u * Math.PI); g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.restore(); } }); }
// two marked parcels from the leading edge: `fast` = how much quicker the top one is (1 = myth: same time)
function parcels(t, t0, dur, fast, a = 1) { if (t < t0 || a <= 0) return; const u = (t - t0) / dur;
  const top = along(AF.up, UPL, clamp(u * fast)), bot = along(AF.lo, LOL, clamp(u));
  [[top, 'A'], [bot, 'B']].forEach(([[x, y], lab], i) => { g.save(); g.globalAlpha = B.S.A * a; g.fillStyle = i ? '#ffd27a' : '#ff8a7a'; g.beginPath(); g.arc(x, y + (i ? 26 : -26), 15, 0, 7); g.fill(); g.restore(); B.circ(x, y + (i ? 26 : -26), 15, { w: 2.2, nib: false }); B.txt(lab, x, y + (i ? 76 : -56), { size: 36, align: 'center' }); });
  return { topDone: u * fast >= 1, botDone: u >= 1 }; }
function arrowV(x, y0, y1, w, k, lab, o = {}) { if (k <= 0) return; const y = lerp(y0, y1, ss(k)); B.poly([[x, y0], [x, y]], { w, nib: false }); B.arrowhead(x, y, y1 > y0 ? Math.PI / 2 : -Math.PI / 2, { w: w * .8 }); if (lab && k > .6) B.txt(lab, x + (o.dx ?? 26), (y0 + y) / 2, { size: o.size || 40, write: R(k, .6, .4) }); }
function pressureMarks(t, k) { if (k <= 0) return;
  for (let i = 0; i < 6; i++) { const x = 260 + i * 100, y = surfY(AF.up, x) - 60 - 20 * Math.sin(i * 1.7); const kk = R(k, i * .08, .3); if (kk > 0) B.txt('−', x, y, { size: 64, align: 'center', write: kk, col: '#bfe3ff' }); }
  for (let i = 0; i < 5; i++) { const x = 300 + i * 110, y = surfY(AF.lo, x) + 70; const kk = R(k, .4 + i * .08, .3); if (kk > 0) B.txt('+', x, y, { size: 58, align: 'center', write: kk, col: '#ffd27a' }); } }
function sail(t, d) { const P = []; for (let i = 0; i <= 40; i++) { const u = i / 40; P.push([lerp(220, 860, u), 820 - Math.sin(u * Math.PI) * 120 + u * 40]); }
  B.poly(P, { w: 4, draw: d }); B.poly(P.map(([x, y]) => [x, y + 10]), { w: 1.6, draw: d, nib: false, alpha: .7 }); }
function jet(x, y, s, d) { const P = [[0, -18], [300, -24], [360, 0], [300, 24], [0, 18], [-60, 0]].map(([a, b]) => [x + a * s, y + b * s]); B.paper(P, .92); B.poly(P, { w: 2.6, close: true, draw: d });
  B.poly([[x + 120 * s, y - 20 * s], [x + 60 * s, y - 160 * s], [x + 100 * s, y - 160 * s], [x + 190 * s, y - 22 * s]], { w: 2.4, close: true, draw: d }); B.poly([[x + 120 * s, y + 20 * s], [x + 60 * s, y + 160 * s], [x + 100 * s, y + 160 * s], [x + 190 * s, y + 22 * s]], { w: 2.4, close: true, draw: d });
  B.poly([[x - 40 * s, y - 14 * s], [x - 90 * s, y - 70 * s], [x - 60 * s, y - 70 * s], [x, y - 16 * s]], { w: 2.2, close: true, draw: d }); }

// ---------- camera per phrase ----------
const CAM = [[490, 800, 1.2], [490, 800, 1.17], [490, 800, 1.22], [490, 800, 1.2], [500, 800, 1.22], [540, 790, 1.15], [540, 820, 1.0], [510, 810, 1.15], [510, 800, 1.13], [490, 800, 1.2], [500, 800, 1.17], [510, 805, 1.13], [500, 790, 1.13], [500, 790, 1.13]];
function camAt(t) { let i = 0; for (let k = 0; k < PH.length; k++) if (t >= PH[k].start - .05) i = k; const a = CAM[Math.max(0, i - 1)], b = CAM[i], u = ss(R(t, s(i) - .05, 1.0)); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }

// ---------- sheet chrome, moved for Batch N ----------
function frame2(fl) {
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 3.2; g.strokeRect(60, 60, W - 120, H - 120); g.lineWidth = 1.2; g.strokeRect(70, 70, W - 140, H - 140); g.restore();
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 1.4; g.globalAlpha = .9; g.strokeRect(VP.x + 8, VP.y, VP.w - 16, VP.h); g.restore();
  // drafting margin devices in the lower sheet (no text): a scale bar and a north-style flow arrow
  for (let i = 0; i <= 10; i++) B.line(160 + i * 76, 1560, 160 + i * 76, 1560 + (i % 5 ? 14 : 28), { w: 1.4, nib: false, alpha: .6 }); B.line(160, 1560, 920, 1560, { w: 1.6, nib: false, alpha: .6 });
  B.poly([[160, 1660], [700, 1660]], { w: 1.4, dash: DASH.centre, nib: false, alpha: .5 }); B.arrowhead(700, 1660, 0, { w: 1.4, alpha: .5 });
  if (fl.figOld && fl.figK < 1) { B.txt(fl.figOld, 98, 470, { size: 40, alpha: 1 - ss(fl.figK * 2) }); B.line(94, 470, 94 + B.measure(fl.figOld, 40) + 8, 470, { w: 3, draw: ramp(fl.figK, 0, .35), nib: false }); }
  B.txt(fl.fig + (fl.figSub ? '  ·  ' + fl.figSub : ''), 98, 470, { size: 40, write: fl.figOld ? ramp(fl.figK, .35, .65) : 1 });
}
function titleBlock2(o) { const { status, write = 1 } = o; const y0 = 290, h = 128, x0 = 100, x1 = 900;
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 2.4; g.strokeRect(x0, y0, x1 - x0, h); g.lineWidth = 1.3; [[380, 0, 380, h], [x0, 64, x1, 64]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, y0 + b); g.lineTo(c, y0 + d); g.stroke(); }); g.restore();
  const cells = [['TITLE', 'WING SECTION', 112, 0], ['DRAWN BY', '@howitreallyworkstudio', 112, 64], ['STATUS', status, 392, 0], ['SOURCES', 'NASA GLENN · CAMBRIDGE', 392, 64]];
  cells.forEach(([k, v, x, dy], i) => { const wk = ramp(write, i * .11, .3); B.txt(k, x, y0 + dy + 15, { size: 17, font: 'Poppins', weight: 600, alpha: .7, ls: 2, write: wk }); B.txt(v, x, y0 + dy + 44, { size: v.length > 18 ? 30 : 40, write: wk }); }); }
function note2(n, cap, tSince) { const y = 1150, h = 262, size = 52, x = 90, w = 810;
  g.save(); g.globalAlpha = clamp(tSince / .15); g.fillStyle = 'rgba(14,34,82,.66)'; g.fillRect(x, y, w, h); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.strokeRect(x, y, w, h); g.lineWidth = 1; g.strokeRect(x + 7, y + 7, w - 14, h - 14); g.restore();
  B.txt('NOTE', x + 24, y + 28, { size: 17, font: 'Poppins', weight: 600, alpha: .8, ls: 3 }); B.txt(String(n).padStart(2, '0'), x + 92, y + 28, { size: 22, font: 'Poppins', weight: 600 });
  const toks = []; cap.split('**').forEach((sg, k) => sg.split(' ').filter(Boolean).forEach(wd => toks.push({ w: wd, b: k % 2 === 1 }))); const sp = B.measure(' ', size), maxW = w - 70; const lines = [[]]; let acc = 0;
  toks.forEach(tk => { const ww = B.measure(tk.w, size); if (acc + ww > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0; } lines[lines.length - 1].push({ ...tk, ww }); acc += ww + sp; });
  const lh = size * 1.1, ty = y + 54 + (h - 54 - lines.length * lh) / 2 + lh / 2; const total = toks.length; let idx = 0;
  lines.forEach((l, li) => { let xx = x + 36; l.forEach(tk => { const wk = clamp((tSince - .05) / .4 * total - idx); idx++; if (wk > 0) { B.txt(tk.w, xx, ty + li * lh, { size, write: wk }); if (tk.b && wk >= 1) B.line(xx, ty + li * lh + size * .42, xx + tk.ww, ty + li * lh + size * .42, { w: 1.6, nib: false, alpha: .9 }); } xx += tk.ww + sp; }); }); }

// ---------- fig labels ----------
const FIGS = [[0, 'FIG. 1', 'WING, SIDE SECTION'], [s(5), 'FIG. 2', 'A SAIL'], [s(6), 'FIG. 3', 'WHAT HOLDS IT UP'], [s(7), 'FIG. 1', 'TURNING THE AIR'], [s(9), 'FIG. 1', 'PRESSURE'], [s(11), 'FIG. 1', 'BOTH, TOGETHER']];
function figLabel(t) { let i = 0; FIGS.forEach((f, k) => { if (t >= f[0]) i = k; }); const f = FIGS[i], old = i > 0 ? FIGS[i - 1] : null; return { fig: f[1], figSub: f[2], figK: old ? R(t, f[0], .9) : 1, figOld: old ? old[1] + (old[2] ? '  ·  ' + old[2] : '') : '' }; }
function statusAt(t) { if (t < s(1)) return 'LONGER PATH?'; if (t < s(3) + .5) return 'WHY DOES IT FLY?'; if (t < s(7)) return 'INCORRECT THEORY'; if (t < s(10)) return 'TURNS AIR DOWN'; return 'TURNING + PRESSURE'; }

// ---------- frame ----------
function scene(t) {
  B.begin(); const fl = figLabel(t);
  B.txt('HOW IT REALLY WORKS', 100, 270, { size: 22, font: 'Poppins', weight: 600, alpha: .85, ls: 3 }); B.txt('SHEET 1 / 1', 900, 270, { size: 22, font: 'Poppins', weight: 600, align: 'right', alpha: .85, ls: 3 });
  frame2(fl);
  const [cx, cy, z] = camAt(t); B.camBegin(cx, cy, z);
  const sailA = t > s(5) - .2 && t < s(6) + .2 ? ss(R(t, s(5) - .2, .4)) * (1 - ss(R(t, s(6), .3))) : 0, jetA = t > s(6) - .1 && t < s(7) + .1 ? ss(R(t, s(6) - .1, .3)) * (1 - ss(R(t, s(7), .3))) : 0;
  const wingA = 1 - Math.max(sailA, jetA);
  B.alpha(wingA);
  // the flow: always running behind the wing (frame 0 moves)
  streamlines(t, (t < s(2) || t > s(7) - .3) ? 1 : .35, t > s(4) ? 1.35 : 1.0);
  wing(t, 1);
  // hook + myth: "farther to go": a dimension along the top surface vs the bottom
  if (t < s(4)) { const k = R(t, .3, .6) * (1 - R(t, s(4) - .3, .3)); if (k > 0) { B.poly(AF.up.map(([x, y]) => [x, y - 70]), { w: 1.6, draw: k, nib: false, alpha: .8 }); callout('LONGER PATH?', 520, 630, 520, surfY(AF.up, 520) - 70, k, { size: 34 }); } }
  // the classic story: parcels split and meet (same time) ... then NASA's stamp
  if (t > s(2) && t < s(4)) parcels(t, s(2) + 1.2, 3.2, 1.0, 1 - R(t, s(4) - .3, .3));
  if (t > s(3) && t < s(5)) { B.stamp('INCORRECT', 500, 690, R(t, s(3) + 1.0, .45) * (1 - R(t, s(4) + .1, .3)), { size: 92, rot: -.12 }); callout('NASA GLENN: "INCORRECT"', 540, 990, null, null, R(t, s(3) + 1.6, .5) * (1 - R(t, s(5) - .3, .3)), { size: 30 }); }
  // smoke tests: the top parcel gets to the back first
  if (t > s(4) - .1 && t < s(5)) { const r = parcels(t, s(4) + .1, 2.6, 1.45, 1); if (r && r.topDone) callout('TOP ARRIVES FIRST', 600, 630, TE[0], TE[1] - 30, R(t, s(4) + .1 + 2.6 / 1.45, .4), { size: 32 }); }
  // the turning: downwash arrows behind the trailing edge, angle of attack
  if (t > s(7) - .1) { const k = R(t, s(7) + .4, .8); [0, 1, 2].forEach(i => { const x = TE[0] + 10 + i * 34, y0 = TE[1] + 10 + i * 30; B.poly([[x - 60, y0 - 20], [x, y0 + 50 * ss(k)]], { w: 3, draw: k, nib: false }); if (k > .9) B.arrowhead(x, y0 + 50, Math.atan2(70, 60), { w: 2.4 }); });
    if (t < s(9)) callout('AIR TURNED DOWN', 560, 990, TE[0] + 30, TE[1] + 60, R(t, s(7) + 1.2, .5) * (1 - R(t, s(8) - .2, .3)), { size: 32 });
    if (t < s(8)) { B.poly([[LE[0], LE[1]], [LE[0] + 260, LE[1]]], { w: 1.4, dash: DASH.hidden, nib: false, draw: R(t, s(7) + .6, .5) }); B.txt('α', LE[0] + 200, LE[1] + 4, { size: 48, write: R(t, s(7) + 1.0, .4) }); } }
  // Newton: big LIFT arrow up, AIR arrow down
  if (t > s(8) - .1) { const k = R(t, s(8) + .2, .6); arrowV(480, 770, 590, 7, k, 'LIFT', { dx: 30, size: 48 }); arrowV(TE[0] + 40, TE[1] + 30, TE[1] + 150, 6, R(t, s(8) + .7, .6), 'AIR', { dx: -100, size: 42 });
    if (t < s(9)) callout("NEWTON'S 3RD LAW", 340, 990, null, null, R(t, s(8) + 1.4, .5) * (1 - R(t, s(9) - .2, .3)), { size: 32 }); }
  // pressure: LOW above, HIGH below
  if (t > s(9) - .1) { pressureMarks(t, R(t, s(9) + .3, 1.6)); if (t < s(10) + 1) { callout('LOW PRESSURE', 260, 640, null, null, R(t, s(9) + 1.4, .5), { size: 30 }); callout('HIGH PRESSURE', 500, 1000, null, null, R(t, s(9) + 2.4, .5), { size: 30 }); } }
  // the catch: both true together
  if (t > s(10) + .5 && t < s(12)) B.stamp('BOTH TRUE', 500, 640, R(t, s(10) + 1.2, .45) * (1 - R(t, s(12) - .3, .3)), { size: 84, rot: -.1 });
  B.alpha(1);
  // FIG. 2 sail (same length both sides) and FIG. 3 the jet
  if (sailA > 0) { B.alpha(sailA); sail(t, R(t, s(5) - .2, 1.0)); B.dim(220, 860, 860, 900, 'SAME LENGTH', { off: 60, draw: R(t, s(5) + 1.0, .6), size: 30 }); arrowV(540, 690, 590, 6, R(t, s(5) + 1.8, .5), 'LIFT', { size: 40 }); B.alpha(1); }
  if (jetA > 0) { B.alpha(jetA); jet(360, 820, 1.3, R(t, s(6) - .1, .8)); B.txt('?', 880, 760, { size: 160, write: R(t, s(6) + .5, .4) }); B.alpha(1); }
  // the question: two check boxes
  if (t > s(12) - .1 && t < s(13)) { const k = R(t, s(12), .4); B.alpha(k); [['YES', 330], ['NO', 750]].forEach(([w, x], i) => { const kk = R(t, s(12) + .2 + i * .3, .4); B.rect(x - 150, 610, 70, 70, { w: 2.6, draw: kk }); B.txt(w + '?', x - 60, 650, { size: 64, write: kk }); }); B.alpha(1); }
  B.camEnd();
  // end card (standard): framed title lettered on over the faded drawing
  if (t > s(13) - .1) { const k = R(t, s(13) - .1, .6); g.save(); g.globalAlpha = .55 * k; g.fillStyle = '#18336B'; g.fillRect(VP.x + 9, VP.y + 1, VP.w - 18, VP.h - 2); g.restore();
    const bx = 120, by = 560, bw = 780, bh = 440; g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(14,34,82,.92)'; g.fillRect(bx, by, bw, bh); g.restore(); B.rect(bx, by, bw, bh, { w: 3, draw: k, nib: false }); B.rect(bx + 9, by + 9, bw - 18, bh - 18, { w: 1.3, draw: k, nib: false });
    B.txt('Follow for more of', 510, by + 100, { size: 72, align: 'center', write: R(t, s(13) + .1, .6) }); B.txt('how it really works.', 510, by + 190, { size: 72, align: 'center', write: R(t, s(13) + .5, .7) });
    B.line(180, by + 240, 840, by + 240, { w: 2, draw: R(t, s(13) + .9, .5), nib: false });
    B.txt("A new 'wait, really?' every day.", 510, by + 310, { size: 48, align: 'center', write: R(t, s(13) + 1.1, .6) }); B.txt('@howitreallyworkstudio', 510, by + 380, { size: 32, font: 'Poppins', weight: 600, align: 'center', write: R(t, s(13) + 1.4, .5) }); }
  // subtitle note (double-ruled, lettered on); the closing line lives on the end card
  let ci = -1; PH.forEach((p, k) => { if (t >= p.start) ci = k; }); if (ci >= 0 && ci < PH.length - 1) note2(ci + 1, PH[ci].cap, t - PH[ci].start);
  titleBlock2({ status: statusAt(t), write: 1 });
}
window.DUR = TL.total;
window.seek = t => scene(t);
window.render = window.seek;
// thumbnail / cover (rule 11): the wing with the stamp, big lettering
window.thumb = () => { const t = s(4) + 2.2; B.begin(); frame2({ fig: 'FIG. 1', figSub: 'WING, SIDE SECTION', figK: 1, figOld: '' }); titleBlock2({ status: 'INCORRECT THEORY' });
  B.txt('WHY PLANES', 540, 620, { size: 120, align: 'center' }); B.txt('STAY UP', 540, 740, { size: 140, align: 'center' });
  VP.y = 800; VP.h = 700; B.camBegin(530, 820, 1.0); streamlines(t, 1, 1.35); wing(t, 1); B.stamp('NOT LONGER PATH', 560, 980, 1, { size: 64, rot: -.1 }); B.camEnd(); VP.y = 490; VP.h = 640; };
window.seek(0); window.ready = true; window.READY = true;
