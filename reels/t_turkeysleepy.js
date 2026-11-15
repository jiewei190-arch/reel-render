// t_turkeysleepy.js: "Does turkey really make you sleepy?" (Thanksgiving seasonal, unbadged) in template #4 crayon-book
// (lemo-opuscar/styles/crayon-book grammar via reels/styles/crayon, same module as flamingo and owl). Canvas2D 1080x1920, pure function of t.
// A picture-book dinner page drawn live in wax crayon: a warm wall under one amber wash, white-wax steam and stars that resist it,
// colouring as the action, big crayon numbers for the culprits (child logic), the book's printed words on a ragged paper patch.
// Batch N layout: lettering from y 330, the table/floor line at y 1150, the printed words at y 1215-1400, nothing written in the top 250 px,
// the bottom 480 px (floor crayon only) or the right column below y 840.
import * as K from './styles/crayon/crayon.js';
const { line, fill, dab, wash, text, subtitle, knock, ellipse, handCircle, bez, smooth, xf, prog, clamp, lerp, hash } = K;
await Promise.all(['400 54px "Patrick Hand"', '700 80px "Gaegu"'].map(f => document.fonts.load(f)));
const bz = (c, n) => bez(c.length === 3 ? [c[0], c[1], c[1], c[2]] : c, n);
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const P = { out: '#5a2f2a', wall: '#f2b65c', wall2: '#e89a46', floor: '#9a5b3a', floor2: '#7a4430', table: '#c97b4a', cloth: '#ffffff', roast: '#c9662e', roast2: '#9a4420',
  cream: '#f6e3b8', green: '#6fae4a', red: '#e8483b', pink: '#ff9fbb', yellow: '#ffd34d', teal: '#4cb8c4', plum: '#7b3f6e', blue: '#4f7fd6', grey: '#a6abb3', white: '#ffffff', brown: '#8a5a32' };
const R = K.createCrayon(document.getElementById('c'), { wash: [0.99, 0.86, 0.66], vignette: .24 });
const GR = 1150;

// ---------- the page: wall with white-wax stars, an amber wash, the floor ----------
function page(o = {}) { const wall = [[-20, -20], [1100, -20], [1100, GR + 20], [-20, GR + 20]];
  fill(R.bg, wall, { col: o.wall || P.wall, p: .55, gap: 13, w: 12, ang: .05, seed: 3 });
  for (let k = 0; k < 6; k++) { const y = 200 + k * 170 + 30 * hash(k); fill(R.bg, [[-20, y], [1100, y - 20], [1100, y + 40], [-20, y + 54]], { col: o.wall2 || P.wall2, p: .6, gap: 8, w: 9, ang: .02, seed: 30 + k }); }
  for (let i = 0; i < 30; i++) { const x = hash(i * 3.3) * 1060 + 10, y = hash(i * 7.1) * (GR - 200) + 120, r = 6 + hash(i) * 6, st = []; for (let j = 0; j <= 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? r * .45 : r; st.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } fill(R.bg, st, { col: P.white, p: 1, gap: 2.5, w: 4, seed: 60 + i, cross: true }); }
  wash(R.wash, wall, { p: .55 });
  const fl = [[-20, GR], [1100, GR], [1100, 1940], [-20, 1940]]; fill(R.bg, fl, { col: P.floor, p: .8, gap: 10, w: 12, ang: 1.3, seed: 7 }); for (let k = 0; k < 8; k++) line(R.bg, [[-20, GR + 60 + k * 90], [1100, GR + 50 + k * 92]], { col: P.floor2, w: 6, p: .7, seed: 80 + k });
  line(R.bg, [[-20, GR], [1100, GR - 6]], { col: P.out, w: 7, p: .9, seed: 8 }); }
function table(x0, x1, y = 1000) { const top = [[x0, y], [x1, y - 6], [x1 + 10, y + 40], [x0 - 10, y + 46]]; knock(R.knock, top); fill(R.fg, top, { col: P.cloth, p: .95, gap: 6, w: 8, seed: 900 }); line(R.fg, top, { w: 6, seed: 901, closed: true });
  for (let k = 0; k < 6; k++) line(R.fg, [[x0 + 20 + k * (x1 - x0 - 40) / 5, y + 4], [x0 + 26 + k * (x1 - x0 - 40) / 5, y + 40]], { col: P.red, w: 6, p: .9, seed: 905 + k });
  for (const lx of [x0 + 30, x1 - 30]) line(R.fg, [[lx, y + 46], [lx + (lx > 540 ? 6 : -6), GR + 6]], { w: 10, col: P.brown, seed: 910 + lx }); }
// ---------- characters and props (original crayon drawings) ----------
function roast(cx, cy, sc, o = {}) { const X = p => xf(p, { x: cx, y: cy, s: sc }), sd = o.seed || 100, t0 = o.t0 ?? -9, d = .8;
  const plat = X(ellipse(0, 70, 260, 52, 40)); knock(R.knock, plat); fill(R.fg, plat, { col: P.cream, p: .95, gap: 6, w: 8, seed: sd }); line(R.fg, plat, { w: 6, seed: sd + 1, closed: true });
  for (const s2 of [-1, 1]) { const leg = X(smooth([[s2 * 120, -40], [s2 * 210, -80], [s2 * 250, -20], [s2 * 200, 30], [s2 * 120, 30]], 6)); knock(R.knock, leg); fill(R.fg, leg, { col: P.roast, p: .92, gap: 7, w: 9, ang: .4 * s2, seed: sd + 3 + s2, t0, dur: d });
    line(R.fg, leg, { w: 6, seed: sd + 5 + s2, closed: true }); const bone = X(handCircle(s2 * 262, -78, 22, sd + 7 + s2)); knock(R.knock, bone); fill(R.fg, bone, { col: P.white, p: 1, gap: 4, w: 6, seed: sd + 9 }); line(R.fg, bone, { w: 5, seed: sd + 11 + s2 }); }
  const body = X(smooth([[-170, 30], [-160, -110], [-60, -190], [60, -190], [160, -110], [170, 30]], 8)); knock(R.knock, body); fill(R.fg, body, { col: P.roast, p: .92, gap: 8, w: 10, seed: sd + 20, t0, dur: d });
  fill(R.fg, X(ellipse(-40, -120, 70, 26, 24)), { col: P.yellow, p: .6, gap: 5, w: 7, seed: sd + 21 }); line(R.fg, body, { w: 7, seed: sd + 22, closed: true });
  for (let k = 0; k < 3; k++) line(R.fg, X(bz([[-80 + k * 70, -60], [-50 + k * 70, -90], [-20 + k * 70, -60]], 8)), { col: P.roast2, w: 5, seed: sd + 30 + k });
  for (let k = 0; k < 5; k++) { const g2 = X(handCircle(-220 + k * 110 + (k > 2 ? 40 : 0), 60 + (k % 2) * 16, 18, sd + 40 + k)); knock(R.knock, g2); fill(R.fg, g2, { col: P.green, p: .95, gap: 4, w: 6, seed: sd + 45 + k }); line(R.fg, g2, { w: 4, seed: sd + 50 + k }); }
  if (o.halo) { line(R.fg, X(ellipse(0, -270, 120 * o.halo, 28 * o.halo, 40)), { col: P.yellow, w: 14, seed: sd + 60 }); line(R.fg, X(ellipse(0, -270, 120 * o.halo, 28 * o.halo, 40)), { w: 4, seed: sd + 61 }); }
  if (o.steam) for (let k = 0; k < 3; k++) { const x0 = -80 + k * 80, ph = K.CLOCK.td * 1.5 + k; line(R.fg, X(bz([[x0, -220], [x0 + 20 * Math.sin(ph), -270], [x0 - 20 * Math.sin(ph), -320], [x0 + 10, -370]], 10)), { col: P.white, w: 8, p: .9, seed: sd + 70 + k }); } }
function chicken(cx, cy, sc, sd = 200) { const X = p => xf(p, { x: cx, y: cy, s: sc }); const b = X(smooth([[-80, 40], [-100, -10], [-60, -60], [10, -66], [60, -40], [80, 10], [40, 46]], 6)); knock(R.knock, b); fill(R.fg, b, { col: P.white, p: 1, gap: 6, w: 8, seed: sd }); line(R.fg, b, { w: 6, seed: sd + 1, closed: true });
  const h = X(handCircle(56, -86, 36, sd + 2)); knock(R.knock, h); fill(R.fg, h, { col: P.white, p: 1, gap: 5, w: 7, seed: sd + 3 }); line(R.fg, h, { w: 6, seed: sd + 4 }); const bk = X([[88, -92], [120, -82], [88, -72]]); knock(R.knock, bk); fill(R.fg, bk, { col: P.yellow, p: 1, gap: 3, w: 5, seed: sd + 5, cross: true });
  const cm = X(smooth([[40, -118], [52, -142], [64, -124], [76, -142], [84, -116]], 4, false)); line(R.fg, cm, { col: P.red, w: 10, seed: sd + 6 }); dab(R.fg, ...X([[64, -92]])[0], 6 * sc, { col: P.out, seed: sd + 7 });
  for (const lx of [-20, 20]) line(R.fg, X([[lx, 44], [lx, 90], [lx + 16, 96]]), { col: P.yellow, w: 6, seed: sd + 8 + lx }); }
function cheese(cx, cy, sc, sd = 300) { const w = xf([[-120, 50], [120, 50], [120, -10], [-120, -76]], { x: cx, y: cy, s: sc }); knock(R.knock, w); fill(R.fg, w, { col: P.yellow, p: .95, gap: 6, w: 8, seed: sd }); line(R.fg, w, { w: 6, seed: sd + 1, closed: true });
  [[-50, 10, 14], [30, 20, 18], [80, -10, 10]].forEach(([hx, hy, r], i) => dab(R.fg, ...xf([[hx, hy]], { x: cx, y: cy, s: sc })[0], r * sc, { col: '#e0a020', seed: sd + 2 + i })); }
function nut(cx, cy, sc, sd = 330) { const n = xf(ellipse(0, 0, 40, 30, 24), { x: cx, y: cy, s: sc }); knock(R.knock, n); fill(R.fg, n, { col: P.brown, p: .95, gap: 5, w: 7, seed: sd }); line(R.fg, n, { w: 5, seed: sd + 1, closed: true }); }
function plate(cx, cy, sc, sd = 400) { const X = p => xf(p, { x: cx, y: cy, s: sc }); const pl = X(ellipse(0, 14, 120, 36, 36)); knock(R.knock, pl); fill(R.fg, pl, { col: P.white, p: 1, gap: 6, w: 8, seed: sd }); line(R.fg, pl, { w: 6, seed: sd + 1, closed: true });
  [[-50, -10, 40, P.roast], [10, -24, 46, P.cream], [64, -8, 32, P.green], [-6, 0, 30, P.red]].forEach(([x, y, r, c], i) => { const m = X(handCircle(x, y, r, sd + 3 + i)); knock(R.knock, m); fill(R.fg, m, { col: c, p: .95, gap: 5, w: 7, seed: sd + 10 + i }); line(R.fg, m, { w: 5, seed: sd + 20 + i }); }); }
function bread(cx, cy, sc, sd = 500) { const X = p => xf(p, { x: cx, y: cy, s: sc }); const b = X(smooth([[-100, 30], [-110, -30], [-60, -66], [20, -72], [90, -50], [110, 0], [96, 34]], 7)); knock(R.knock, b); fill(R.fg, b, { col: '#e0a24e', p: .95, gap: 7, w: 9, seed: sd }); line(R.fg, b, { w: 6, seed: sd + 1, closed: true });
  [-46, 0, 46].forEach((x, i) => line(R.fg, X([[x - 14, -40], [x + 10, -8]]), { col: P.cream, w: 10, seed: sd + 2 + i })); }
function pie(cx, cy, sc, sd = 520) { const X = p => xf(p, { x: cx, y: cy, s: sc }); const p2 = X([[-110, 40], [110, 40], [0, -80]]); knock(R.knock, p2); fill(R.fg, p2, { col: '#e8853a', p: .95, gap: 6, w: 8, seed: sd }); line(R.fg, p2, { w: 6, seed: sd + 1, closed: true });
  line(R.fg, X([[-110, 40], [110, 40]]), { col: P.cream, w: 16, seed: sd + 2 }); dab(R.fg, ...X([[10, -70]])[0], 22 * sc, { col: P.white, p: 1, seed: sd + 3 }); }
function glass(cx, cy, sc, sd = 540) { const X = p => xf(p, { x: cx, y: cy, s: sc }); const bowl = X(smooth([[-56, -80], [56, -80], [48, -20], [0, 10], [-48, -20]], 6)); knock(R.knock, bowl); fill(R.fg, X([[-50, -50], [50, -50], [44, -20], [0, 8], [-44, -20]]), { col: P.plum, p: .95, gap: 5, w: 7, seed: sd });
  line(R.fg, bowl, { w: 6, seed: sd + 1, closed: true }); line(R.fg, X([[0, 10], [0, 80]]), { w: 7, seed: sd + 2 }); line(R.fg, X([[-44, 84], [44, 84]]), { w: 7, seed: sd + 3 }); }
function sleepy(cx, cy, r, sd = 600) { const c = handCircle(cx, cy, r, sd); knock(R.knock, c); fill(R.fg, c, { col: P.yellow, p: .95, gap: 7, w: 9, seed: sd + 1 }); line(R.fg, c, { w: 6, seed: sd + 2 });
  for (const s2 of [-1, 1]) line(R.fg, bz([[cx + s2 * .4 * r - 16, cy - .05 * r], [cx + s2 * .4 * r, cy + .08 * r], [cx + s2 * .4 * r + 16, cy - .05 * r]], 8), { w: 6, seed: sd + 3 + s2 });
  const m = handCircle(cx, cy + .42 * r, .14 * r, sd + 6); knock(R.knock, m); fill(R.fg, m, { col: P.red, p: 1, gap: 3, w: 5, seed: sd + 7 }); dab(R.fg, cx - .55 * r, cy + .25 * r, .14 * r, { col: P.pink, p: .6, seed: sd + 8 }); dab(R.fg, cx + .55 * r, cy + .25 * r, .14 * r, { col: P.pink, p: .6, seed: sd + 9 }); }
function zzz(x, y, k, sd = 650) { if (k <= 0) return; ['z', 'z', 'Z'].forEach((c, i) => { const fl = (K.CLOCK.td * .6 + i * .3) % 1; text(R.fg, c, x + i * 46 + fl * 10, y - i * 56 - fl * 14, { font: 'Gaegu', weight: 700, size: 70 + i * 26, col: P.blue, reveal: clamp(k * 3 - i), seed: sd + i }); }); }
function beads(x0, y0, n, k, col = P.teal, sd = 700, dx = 52) { for (let i = 0; i < n * k; i++) { const c = handCircle(x0 + i * dx, y0 + 10 * Math.sin(i * 1.3 + K.CLOCK.td * 3), 22, sd + i); knock(R.knock, c); fill(R.fg, c, { col: i === Math.floor(n / 2) ? P.red : col, p: .95, gap: 4, w: 6, seed: sd + 20 + i }); line(R.fg, c, { w: 4, seed: sd + 40 + i }); if (i) line(R.fg, [[x0 + (i - 1) * dx + 22, y0], [x0 + i * dx - 22, y0]], { w: 5, seed: sd + 60 + i }); } }
function brain(cx, cy, sc, sd = 760) { const X = p => xf(p, { x: cx, y: cy, s: sc }); const b = X(smooth([[-120, 30], [-130, -40], [-80, -100], [0, -120], [80, -104], [128, -50], [126, 20], [80, 60], [-60, 66]], 7)); knock(R.knock, b); fill(R.fg, b, { col: P.pink, p: .95, gap: 7, w: 9, seed: sd }); line(R.fg, b, { w: 6, seed: sd + 1, closed: true });
  [[[-80, -40], [-30, -80], [20, -40]], [[-60, 10], [0, -16], [60, 20]], [[40, -86], [80, -40], [100, -10]]].forEach((c, i) => line(R.fg, X(bz(c, 8)), { w: 5, seed: sd + 2 + i })); }
function bigNum(n, x, y, k, col = P.red) { if (k <= 0) return; text(R.fg, String(n), x, y, { font: 'Gaegu', weight: 700, size: 200, col, reveal: k, seed: 800 + n }); }
function letter(str, x, y, o = {}) { text(R.fg, str, x, y, { font: 'Gaegu', weight: 700, size: o.size ?? 96, col: o.col ?? P.out, reveal: o.reveal ?? 1, seed: o.seed ?? 820, align: o.align }); }
function bar(x, y, wMax, v, col, k, sd) { if (k <= 0) return; const w = wMax * v * k, b = [[x, y], [x + w, y - 4], [x + w + 4, y + 52], [x, y + 56]]; knock(R.knock, b); fill(R.fg, b, { col, p: .95, gap: 6, w: 8, seed: sd }); line(R.fg, b, { w: 5, seed: sd + 1, closed: true }); }
function cross(x, y, r, k, sd = 860) { line(R.fg, [[x - r, y - r * .7], [x + r, y + r * .7]], { col: P.red, w: 16, seed: sd, draw: prog(k, .3) }); line(R.fg, [[x + r, y - r * .7], [x - r, y + r * .7]], { col: P.red, w: 16, seed: sd + 1, draw: prog(k + .25, .3) }); }

// ---------- timeline ----------
function drawScene(t) { page();
  if (t < s(1) - .1) {   // hook: the roast steaming on the table; "turkey = sleepy?" crossed out in red
    table(60, 1020); roast(540, 900, 1.2, { steam: true }); zzz(760, 640, 1);
    letter('turkey = sleepy?', 540, 420, { size: 110 }); cross(540, 395, 380, .9);
    letter('MYTH!', 540, 560, { size: 120, col: P.red, reveal: prog(1.3, .4), seed: 830 });
  } else if (t < s(2) - .1) {   // the question
    sleepy(540, 780, 190); zzz(760, 560, prog(s(1), .6)); letter('does it?', 540, 420, { size: 130, reveal: prog(s(1), .5), seed: 831 });
  } else if (t < s(4) - .1) {   // the suspect: tryptophan, a chain of amino-acid beads, -> serotonin -> sleep
    letter('the suspect:', 540, 380, { size: 90, reveal: prog(s(2), .4), seed: 832 }); letter('tryptophan', 540, 500, { size: 120, col: P.red, reveal: prog(s(2) + .4, .5), seed: 833 });
    roast(330, 880, .7, { seed: 120 }); beads(620, 820, 7, prog(s(2) + 1, 1.2), P.teal, 700, 46);
    if (t > s(3) - .1) { line(R.fg, [[540, 600], [540, 700]], { w: 10, col: P.red, seed: 840, draw: prog(s(3), .4) });
      letter('serotonin', 300, 1080, { size: 80, col: P.plum, reveal: prog(s(3) + .3, .5), seed: 834 }); letter('→ sleep', 690, 1080, { size: 80, col: P.blue, reveal: prog(s(3) + 1.6, .5), seed: 835 }); zzz(880, 980, prog(s(3) + 2, .6), 660); }
  } else if (t < s(7) - .1) {   // the bar chart: turkey ≈ chicken; cheddar and nuts have more
    const ch = t > s(6) - .1; letter(ch ? 'and cheese?' : 'tryptophan', 540, 380, { size: 100, reveal: prog(ch ? s(6) : s(4), .5), seed: ch ? 836 : 837, col: ch ? P.red : P.out });
    roast(140, 560, .3, { seed: 140 }); letter('turkey', 260, 540, { size: 56, align: 'left', seed: 850 }); bar(260, 560, 560, .6, P.roast, prog(s(4) + .4, .7), 870);
    chicken(140, 760, .55, 220); letter('chicken', 260, 740, { size: 56, align: 'left', seed: 851, reveal: prog(s(4) + 1.6, .4) }); bar(260, 760, 560, .58, P.white, prog(s(4) + 1.8, .7), 872);
    if (!ch && t > s(5) - .1) { letter('≈ ¼ gram', 540, 960, { size: 110, col: P.blue, reveal: prog(s(5), .5), seed: 838 }); letter('per 100 g of meat', 540, 1050, { size: 60, reveal: prog(s(5) + .5, .5), seed: 839 }); }
    if (ch) { cheese(140, 950, .5); nut(120, 1030, .6); nut(170, 1050, .5, 331); letter('cheese, nuts', 260, 940, { size: 56, align: 'left', seed: 852 }); bar(260, 960, 560, .95, P.yellow, prog(s(6) + .3, .8), 874);
      letter('more!', 760, 1090, { size: 70, col: P.red, reveal: prog(s(6) + 1.2, .4), seed: 853 }); }
  } else if (t < s(8) - .1) {   // the whole meal on the table
    table(60, 1020); roast(540, 820, .85, { steam: true, seed: 160 }); plate(220, 950, .9); bread(480, 965, .7); pie(720, 965, .7); glass(900, 930, .9);
    letter('the whole meal', 540, 400, { size: 110, reveal: prog(s(7), .5), seed: 840 });
  } else if (t < s(10) - .1) {   // culprits 1 and 2: big crayon numbers
    const two = t > s(9) - .1; bigNum(1, 220, 560, prog(s(8), .3)); plate(560, 470, 1.3, 410); plate(600, 560, 1.0, 430); letter('huge meal', 600, 720, { size: 80, reveal: prog(s(8) + .4, .5), seed: 841 });
    if (two) { bigNum(2, 220, 980, prog(s(9), .3)); bread(480, 940, .8, 560); pie(700, 950, .7, 580); letter('carbs', 600, 1100, { size: 80, col: P.red, reveal: prog(s(9) + .3, .4), seed: 842 }); }
    else zzz(840, 660, prog(s(8) + 2.2, .6), 670);
  } else if (t < s(11) - .1) {   // the sugar crash: a crayon line goes up, then drops
    letter('the crash', 540, 400, { size: 120, col: P.red, reveal: prog(s(10), .4), seed: 843 }); const x0 = 140, y0 = 1080, w = 800;
    line(R.fg, [[x0, y0 - 480], [x0, y0], [x0 + w, y0]], { w: 7, seed: 880 }); letter('blood sugar', x0 + 10, y0 - 500, { size: 46, align: 'left', seed: 844 });
    const k = prog(s(10) + .2, 2.2), pts = []; for (let i = 0; i <= 50 * k; i++) { const u = i / 50; pts.push([x0 + u * w, y0 - 100 - 300 * Math.exp(-Math.pow((u - .32) / .12, 2)) + 80 * Math.exp(-Math.pow((u - .72) / .1, 2))]); }
    if (pts.length > 1) line(R.fg, pts, { col: P.red, w: 12, seed: 881 }); bread(x0 + w * .55, y0 - 470, .6, 600); if (k > .7) zzz(x0 + w * .7, y0 - 200, prog(s(10) + 1.8, .5), 680);
  } else if (t < s(12) - .1) {   // insulin: other amino acids step aside, tryptophan reaches the brain
    letter('insulin', 540, 400, { size: 120, col: P.plum, reveal: prog(s(11), .4), seed: 845 }); brain(820, 680, 1.0);
    const gate = prog(s(11) + 1.0, .5); const gt = [[600, 600 - 120 * gate], [640, 600 - 120 * gate], [640, 780 - 120 * gate], [600, 780 - 120 * gate]]; knock(R.knock, gt); fill(R.fg, gt, { col: P.plum, p: .95, gap: 5, w: 7, seed: 890 }); line(R.fg, gt, { w: 5, seed: 891, closed: true });
    for (let i = 0; i < 5; i++) { const u = prog(s(11) + .4 + i * .15, .8), x = lerp(200 + i * 60, 160 + i * 80, u), y = lerp(690, 1040, u); const c = handCircle(x, y, 22, 900 + i); knock(R.knock, c); fill(R.fg, c, { col: P.green, p: .95, gap: 4, w: 6, seed: 910 + i }); line(R.fg, c, { w: 4, seed: 920 + i }); }
    letter('step aside', 330, 1110, { size: 52, reveal: prog(s(11) + 1.4, .4), seed: 846 });
    const tk = prog(s(11) + 1.6, 2.4); const tc = handCircle(lerp(140, 720, tk), 690, 26, 930); knock(R.knock, tc); fill(R.fg, tc, { col: P.red, p: 1, gap: 4, w: 6, seed: 931 }); line(R.fg, tc, { w: 5, seed: 932 });
    letter('tryptophan', lerp(140, 560, tk), 640, { size: 46, seed: 847, reveal: prog(s(11) + 1.6, .3) });
  } else if (t < s(13) - .1) {   // culprit 3: a drink
    bigNum(3, 220, 760, prog(s(12), .3), P.plum); glass(620, 740, 1.8, 560); letter('a drink or two', 560, 400, { size: 100, reveal: prog(s(12) + .3, .5), seed: 848 }); zzz(820, 560, prog(s(12) + 1.8, .6), 690);
  } else if (t < s(14) - .1) {   // the real trio + a sleepy face
    letter('the real trio', 540, 380, { size: 110, reveal: prog(s(13) - .1, .5), seed: 849 });
    bigNum(1, 160, 640, 1); plate(330, 590, .8, 440); bigNum(2, 520, 640, 1, P.red); bread(700, 600, .6, 620); bigNum(3, 160, 920, 1, P.plum); glass(330, 860, .9, 640); sleepy(700, 880, 120, 610); zzz(820, 760, prog(s(13) + 1, .6), 700);
  } else if (t < s(16) - .1) {   // innocent: the roast with a halo; why it gets blamed: the star of the table
    table(60, 1020); const st = t > s(15) - .1; roast(540, 900, 1.15, { halo: K.easeOut(prog(s(14) + .2, .5)), steam: true, seed: 180 });
    letter('innocent!', 540, 420, { size: 130, col: P.red, reveal: prog(s(14) + .6, .5), seed: 854 });
    if (st) { for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .45, x = 540 + Math.cos(a) * 420, y = 760 + Math.sin(a) * 260; const sp = []; for (let j = 0; j <= 10; j++) { const b = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? 14 : 34; sp.push([x + Math.cos(b) * rr, y + Math.sin(b) * rr]); } knock(R.knock, sp); fill(R.fg, sp, { col: P.yellow, p: 1, gap: 4, w: 6, seed: 940 + k, draw: prog(s(15) + k * .12, .3) }); }
      letter('the star of the table', 540, 560, { size: 76, reveal: prog(s(15) + .4, .6), seed: 855 }); }
  } else if (t < s(17) - .1) {   // the question
    letter('nap after dinner?', 540, 420, { size: 104, reveal: prog(s(16), .5), seed: 856 });
    [['yes', 300, P.red], ['no', 780, P.teal]].forEach(([w, x, col], i) => { const k = prog(s(16) + .7 + i * .3, .3); if (k <= 0) return; const b = [[x - 150, 600], [x + 150, 594], [x + 156, 760], [x - 146, 766]]; knock(R.knock, b); fill(R.fg, b, { col, p: .95, gap: 7, w: 9, seed: 960 + i, draw: k }); line(R.fg, b, { w: 6, seed: 962 + i, closed: true, draw: k }); letter(w, x, 712, { size: 100, col: P.white, reveal: k, seed: 964 + i }); });
    sleepy(540, 970, 100, 620); zzz(640, 900, prog(s(16) + 1.4, .6), 710);
  } else {   // end card + the roast (loops to frame 0)
    letter('Follow for more of', 540, 400, { size: 90, reveal: prog(s(17) - .1, .6), seed: 857 }); letter('how it really works.', 540, 510, { size: 90, col: P.red, reveal: prog(s(17) + .4, .6), seed: 858 });
    text(R.fg, "A new 'wait, really?' every day.", 540, 600, { size: 54, col: P.out, reveal: prog(s(17) + .8, .5), seed: 859 }); text(R.fg, '@howitreallyworkstudio', 540, 670, { size: 48, col: P.plum, reveal: prog(s(17) + 1.1, .5), seed: 860 });
    table(160, 920); roast(540, 900, .9, { seed: 190 }); }
  // the book's printed words on a ragged paper patch (Batch N: inside y 1215-1400)
  let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci >= 0 && ci < PH.length - 1) subtitle(R, PH[ci].cap.replace(/\*\*/g, ''), 1240, { size: 50, maxW: 860, reveal: clamp((t - PH[ci].start + .05) / .45), col: P.out, seed: 3 + ci * 7 });
}
function scene(t) { R.begin(t); drawScene(t); R.compose(); }
window.DUR = TOT;
window.seek = t => { scene(t); };
window.render = window.seek;
window.thumb = () => { R.begin(1.6); page(); table(60, 1020); roast(540, 900, 1.2, { steam: true });
  text(R.fg, 'Turkey', 540, 420, { font: 'Gaegu', weight: 700, size: 170, col: P.out, seed: 870 }); text(R.fg, 'sleepy?', 540, 580, { font: 'Gaegu', weight: 700, size: 170, col: P.red, seed: 871 }); zzz(780, 680, 1); R.compose(); };
window.seek(0); window.ready = true; window.READY = true;
