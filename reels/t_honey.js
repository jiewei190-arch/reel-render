// t_honey.js: "How do bees turn nectar into honey?" in template #23 Recipe card (demo t23), on the in-house recipe kit (as handwarmer, EP 36).
// The demo's grammar carries it: a recipe card with a ticked checklist (sip, pass, invertase, dry, ~18%, wax cap), a step header with a big
// handwritten counter, a % scale with a rust pointer (water left in the honey), a segmented progress bar, thin pencil doodles with pale fills,
// and the "Good drink." sign-off as "Good honey." Batch N layout: captions at y ~1290 (max 3 lines), content inside y 250-1130, x < 900 below y 840.
import { create, W, H, TAU, P, clamp, lerp, seg, ss, eo, bo, hash, paper, hand, mono, line, rectPts, circPts, fill, shade, progress, header, card, scale, splats, caption } from './styles/recipe/recipe.js';
await Promise.all([document.fonts.load('700 60px Caveat'), document.fonts.load('500 22px Mono')]);
const g = create(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, r = (i, d) => s(i) + d, TOT = TL.total;
const win = (t, a, b, f = .4) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const C = { honey: '#e3a33a', honeyD: '#b9771e', nectar: '#f3df9a', wax: '#f1dfb0', waxD: '#cfb47a', wing: '#cfe0ea', bee: '#e7b23e', stripe: '#3b2a1f', petal: '#e9a6b4', leaf: '#9cb878' };
const STEPS = ['SIP', 'PASS', 'ENZYME', 'DRY', 'FAN', 'CAP'];
const ROWS = [{ amt: '1 crop', item: 'flower nectar' }, { amt: 'pass', item: 'mouth to mouth' }, { amt: 'add', item: 'invertase' }, { amt: 'dry', item: 'tongue + wings' }, { amt: '~18%', item: 'water left' }, { amt: '1', item: 'wax cap' }];
const TICK = [r(2, 2.4), r(3, 1.8), r(4, 1.6), r(8, 2.6), r(9, 2.4), r(10, 1.6)];

// ---------- doodles ----------
const ell = (x, y, rx, ry, n = 24, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * TAU, c = Math.cos(rot), sn = Math.sin(rot), px = Math.cos(a) * rx, py = Math.sin(a) * ry; return [x + px * c - py * sn, y + px * sn + py * c]; });
// a honey bee in profile facing right; crop = how full the honey stomach is (a pale amber blob seen through the body); flap = wing beat speed
function bee(t, x, y, sc = 1, o = {}) { const k = o.k ?? 1; if (k <= 0) return; const flap = o.flap ?? 1, wy = Math.sin(t * 40 * flap) * 10 * Math.min(1, flap), seed = o.seed ?? 1, face = o.face ?? 1;
  g.save(); g.translate(x, y + 3 * Math.sin(t * 3 + seed)); g.scale(sc * face, sc); g.rotate(o.rot ?? 0); g.globalAlpha *= k;
  const ab = ell(-48, 6, 46, 30, 26), th = ell(4, 0, 26, 24, 20), hd = ell(40, -2, 18, 17, 18);
  [[-6, -26 - wy, 40, 18, -.5], [6, -22 - wy * .8, 32, 14, -.2]].forEach(([wx, wy2, rx, ry, rot], i) => { const w = ell(wx, wy2, rx, ry, 18, rot); fill(g, w, C.wing, .7); line(g, w, { w: 2.2, close: true, seed: seed + i, wob: .5 }); });
  fill(g, ab, C.bee); if (o.crop) fill(g, ell(-30, 8, 24 * o.crop, 16 * o.crop, 16), C.honey, .85);
  g.save(); g.beginPath(); ab.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.clip(); for (let i = 0; i < 3; i++) { g.fillStyle = C.stripe; g.fillRect(-82 + i * 22, -30, 9, 70); } g.restore();
  line(g, ab, { w: 2.8, close: true, seed: seed + 3, wob: .5 }); fill(g, th, '#d8a237'); line(g, th, { w: 2.8, close: true, seed: seed + 4, wob: .5 }); fill(g, hd, '#5a4030'); line(g, hd, { w: 2.8, close: true, seed: seed + 5, wob: .5 });
  g.fillStyle = '#fff'; g.beginPath(); g.arc(46, -7, 4, 0, TAU); g.fill();
  line(g, [[44, -16], [56, -40], [66, -44]], { w: 2.4, seed: seed + 6, wob: .3 }); line(g, [[38, -17], [44, -42], [54, -48]], { w: 2.4, seed: seed + 7, wob: .3 });
  for (let i = 0; i < 3; i++) line(g, [[-6 + i * 12, 20], [-14 + i * 12, 42 + 3 * Math.sin(t * 6 + i)]], { w: 2.2, seed: seed + 8 + i, wob: .3 });
  if (o.tongue) { const L = 22 + 16 * o.tongue; line(g, [[54, 6], [54 + L, 14]], { w: 3, seed: seed + 12, wob: .2 }); if (o.drop) { fill(g, ell(56 + L + o.drop * 8, 16, 6 + 9 * o.drop, 5 + 8 * o.drop, 16), C.nectar, .95); line(g, ell(56 + L + o.drop * 8, 16, 6 + 9 * o.drop, 5 + 8 * o.drop, 16), { w: 2, close: true, seed: seed + 13, wob: .3 }); } }
  g.restore(); }
function flower(x, y, sc, k, seed) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha *= k;
  line(g, [[0, 30], [4, 150]], { w: 3.4, seed }); const lf = ell(30, 110, 30, 12, 16, -.5); fill(g, lf, C.leaf, .8); line(g, lf, { w: 2.4, close: true, seed: seed + 1 });
  for (let i = 0; i < 6; i++) { const a = i * TAU / 6, p = ell(Math.cos(a) * 34, Math.sin(a) * 34, 30, 18, 16, a); fill(g, p, C.petal, .8); line(g, p, { w: 2.4, close: true, seed: seed + 2 + i, wob: .6 }); }
  fill(g, ell(0, 0, 20, 20, 16), C.honey); line(g, ell(0, 0, 20, 20, 16), { w: 2.6, close: true, seed: seed + 9 }); g.restore(); }
const hexPts = (x, y, rr, rot = 0) => Array.from({ length: 6 }, (_, i) => [x + Math.cos(i * TAU / 6 + rot) * rr, y + Math.sin(i * TAU / 6 + rot) * rr]);
const COMB = (() => { const o = []; for (let c = 0; c < 6; c++) for (let rw = 0; rw < 3; rw++) o.push([170 + c * 78, 930 + rw * 90 + (c % 2) * 45]); return o.filter(([, y]) => y < 1130); })();
function comb(t, f, cap, o = {}) { COMB.forEach(([x, y], i) => { const hp = hexPts(x, y, 50); fill(g, hp, C.wax, .7);
  const fi = clamp(f * 1.3 - hash(i) * .3); if (fi > 0) fill(g, hexPts(x, y + 4, 40 * Math.sqrt(fi)), mixc(C.nectar, C.honey, o.ripe ?? 0), .9);
  const ck = clamp(cap * 1.6 - i / COMB.length * .6); if (ck > 0) { fill(g, hexPts(x, y, 44), C.wax, ck); shade(g, hexPts(x, y, 44), 'rgba(120,90,40,.18)', 7, ck); }
  line(g, hp, { w: 2.8, close: true, seed: 900 + i, wob: .5 }); }); }
function mixc(a, b, u) { const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(u)))).join(',')})`; }
function air(x0, y0, x1, y1, t, k, seed) { if (k <= 0) return; for (let j = 0; j < 3; j++) { const u = (t * .9 + j / 3) % 1, pts = Array.from({ length: 10 }, (_, i) => { const q = i / 9; return [lerp(x0, x1, q), lerp(y0, y1, q) + 8 * Math.sin(q * 9 + t * 4 + j)]; });
  line(g, pts.slice(Math.floor(u * 6), Math.floor(u * 6) + 4), { w: 3, col: '#7fa6c0', a: k * (1 - u * .5), seed: seed + j, wob: .3 }); } }
function steam(x, y, t, k, seed) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const ph = t * 2 + i * 1.7; line(g, Array.from({ length: 7 }, (_, j) => [x + i * 26 + 9 * Math.sin(ph + j * .9), y - j * 14]), { w: 2.6, col: '#7fa6c0', a: k * .8, seed: seed + i, wob: .3 }); } }
function ring6(x, y, rr, k, seed, col = P.ink, rot = 0) { line(g, hexPts(x, y, rr, rot), { w: 3.2, close: true, seed, k, col, wob: .4 }); }
function jar(x, y, w, h, f, t, k = 1, seed = 950) { if (k <= 0) return; const body = rectPts(x, y, w, h, 6); g.save(); g.globalAlpha *= k; fill(g, body, '#f6efe4', 1);
  if (f > 0) { const fy = y + h - h * .9 * f; fill(g, rectPts(x + 6, fy, w - 12, y + h - fy - 6, 4), C.honey, .92); shade(g, rectPts(x + 6, fy, w - 12, y + h - fy - 6, 4), 'rgba(140,80,20,.18)', 9); }
  line(g, body, { w: 3.4, close: true, seed }); fill(g, rectPts(x - 10, y - 34, w + 20, 34, 3), '#c98a4a'); line(g, rectPts(x - 10, y - 34, w + 20, 34, 3), { w: 3, close: true, seed: seed + 1 });
  line(g, [[x + 20, y + 30], [x + 30, y + h - 30]], { w: 5, col: 'rgba(255,255,255,.8)', seed: seed + 2, wob: .3 }); g.restore(); }

// ---------- scenes ----------
function hook(t) { const a = 1 - ss(seg(t, s(2) - .4, s(2))); if (a <= 0) return; g.save(); g.globalAlpha = a;
  flower(200, 960, 1.3, 1, 10); bee(t, 340, 910, 1.45, { seed: 20, tongue: .4, crop: .4 });
  jar(640, 780, 280, 330, 1, t);
  // the water counter is already running at frame 0 (nectar -> honey: water falls to about 18%)
  const wd = ss(seg(t, 0, 2.2)), wv = Math.round(lerp(60, 18, wd)); hand(g, `${wv}%`, 70, 760, { size: 130, col: P.rust }); mono(g, 'WATER LEFT', 76, 800, { size: 22, col: P.soft, track: 5 });
  scale(g, 600, 1110, 800, [[0, '0'], [.18, '18%'], [.6, '60']], lerp(.6, .18, wd)); hand(g, 'HONEY', 780, 980, { size: 66, align: 'center', col: '#fff8ea' });
  const dr = (t * .7) % 1; fill(g, ell(780, 744 + dr * 30, 7, 10 + dr * 6, 14), C.honey, 1 - dr * .3);
  hand(g, 'Nectar', 70, 430, { size: 128 }); hand(g, '→ honey?', 70, 560, { size: 128, col: P.rust });
  const ar = seg(t, r(1, .4), r(1, 1.4)); if (ar > 0) { line(g, [[420, 840], [520, 860], [590, 900]], { w: 4, col: P.rust, k: ar, seed: 30 }); hand(g, 'two changes', 380, 1110, { size: 54, col: P.rust, write: seg(t, r(1, 2.0), r(1, 3.0)) });
    [['1', 300], ['2', 520]].forEach(([n, x], i) => { const kk = seg(t, r(1, 2.6) + i * .4, r(1, 3.0) + i * .4); line(g, circPts(x, 1000, 34, 20), { w: 3.4, col: P.rust, close: true, seed: 31 + i, k: kk }); hand(g, n, x, 1020, { size: 56, align: 'center', col: P.rust, a: kk }); }); }
  g.restore(); }

function recipe(t) { const a = win(t, s(2) - .3, s(11) - .1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const nd = TICK.filter(x => t >= x).length, tickK = nd ? seg(t, TICK[nd - 1], TICK[nd - 1] + .35) : 0, slide = eo(seg(t, s(2) - .3, s(2) + .5));
  g.save(); g.translate((1 - slide) * 520, 0); card(g, { meta: 'RAW · 1 HIVE · MANY BEES', title: ['Honey'], rows: ROWS, done: nd, cur: nd < 6 ? nd : -1, footer: 'BEE-MADE · NO STOVE NEEDED', t, tickK, h: 480 }); g.restore();
  if (t < s(3) - .2) { const k = seg(t, s(2) - .2, s(2) + .5), sip = seg(t, r(2, .6), r(2, 3.2));
    flower(230, 920, 1.3, k, 40); bee(t, 380 + 10 * Math.sin(t), 890, 1.6, { seed: 41, tongue: .6, crop: .2 + .8 * sip, face: -1 });
    hand(g, 'honey crop', 620, 1060, { size: 46, col: P.rust, write: seg(t, r(2, 2.4), r(2, 3.2)) }); line(g, [[600, 1040], [440, 930]], { w: 3, col: P.rust, k: seg(t, r(2, 2.6), r(2, 3.2)), seed: 42 });
    header(g, { step: 1, of: 6, title: 'Sip the nectar', note: 'into the honey crop', k }); }
  else if (t < s(4) - .2) { const k = seg(t, s(3) - .2, s(3) + .4), u = ((t - s(3)) * .6) % 1;
    bee(t, 230, 980, 1.7, { seed: 50, crop: 1 - .5 * u }); bee(t, 640, 980, 1.7, { seed: 51, crop: .5 + .5 * u, face: -1 });
    fill(g, ell(lerp(335, 535, u), 982, 14, 11, 14), C.nectar, .95); line(g, ell(lerp(335, 535, u), 982, 14, 11, 14), { w: 2, close: true, seed: 52, wob: .3 });
    header(g, { step: 2, of: 6, title: 'Pass it on', note: 'mouth to mouth, bee to bee', k }); }
  else if (t < s(5) - .2) { const k = seg(t, s(4) - .2, s(4) + .4), cut = ss(seg(t, r(4, 2.6), r(4, 4.0))), y = 990;
    ring6(320 - 70 * cut, y + 8 * Math.sin(t * 1.3) * cut, 70, k, 60, P.ink, .5 * cut * t); ring6(460 + 70 * cut, y - 8 * Math.sin(t * 1.3) * cut, 70, k, 61, P.ink, -.5 * cut * t); bee(t, 700 + 90 * Math.sin(t * .8), 930, .9, { seed: 64, face: Math.cos(t * .8) > 0 ? 1 : -1, crop: .7 }); if (cut < .5) line(g, [[390, y], [390, y]], { w: 4, seed: 62, a: 1 - cut * 2 });
    hand(g, 'sucrose', 390, 900, { size: 46, align: 'center', col: P.soft, a: (1 - cut) * k });
    if (cut > 0) { hand(g, 'glucose', 260, 1100, { size: 46, align: 'center', col: P.rust, a: cut }); hand(g, 'fructose', 520, 1100, { size: 46, align: 'center', col: P.rust, a: cut }); }
    const sx = 390, sy = 860 + 40 * seg(t, r(4, 2.0), r(4, 2.6)), op = .5 + .5 * Math.sin(t * 8); line(g, [[sx - 30, sy - 30], [sx, sy + 20 * op], [sx + 30, sy - 30]], { w: 4, col: P.rust, seed: 63, k: seg(t, r(4, 1.6), r(4, 2.2)) });
    header(g, { step: 3, of: 6, title: 'Add invertase', note: 'an enzyme: cuts sugar in two', k }); }
  else if (t < s(6) - .2) { const k = seg(t, s(5) - .2, s(5) + .4), bub = seg(t, r(5, .2), r(5, 1.2));
    const jx = 240 + 4 * Math.sin(t * 17) * seg(t, r(5, 2.6), r(5, 3.0)); jar(jx, 900, 260, 210, .85, t, k, 70); fill(g, rectPts(jx + 6, 925, 248, 180, 4), C.nectar, .7 * k);
    for (let i = 0; i < 10 * bub; i++) { const u = (t * .8 + hash(i)) % 1; line(g, circPts(270 + hash(i * 3) * 200, 1090 - u * 170, 6 + 4 * hash(i), 10), { w: 2, close: true, seed: 71 + i, a: 1 - u }); }
    hand(g, 'ferment!', 640, 1000, { size: 64, col: P.rust, write: seg(t, r(5, 2.6), r(5, 3.4)) }); line(g, [[560, 1020], [500, 1000]], { w: 3, col: P.rust, k: bub, seed: 72 });
    header(g, { title: 'Too watery', note: 'stored like this, it spoils', k }); }
  else if (t < s(7) - .2) { const k = seg(t, s(6) - .2, s(6) + .4), fl = ss(seg(t, r(6, 2.2), r(6, 6.4)));
    flower(170, 960, .8, k, 80); line(g, [[240, 900], [380, 860], [560, 880], [700, 940]], { w: 2.6, col: P.faint, seed: 81, k: fl });
    bee(t, lerp(250, 690, fl), lerp(900, 930, fl) - 30 * Math.sin(fl * 3.1), 1.0, { seed: 82, crop: .6 + .4 * fl });
    for (let i = 0; i < 4; i++) { const hx = 740 + (i % 2) * 70, hy = 980 + Math.floor(i / 2) * 70; line(g, hexPts(hx, hy, 38), { w: 2.6, close: true, seed: 83 + i, k }); }
    header(g, { step: 4, of: 6, title: 'Dry on the way', num: '×2', unit: 'sugar', note: 'in the crop vs the flower', k: 1, numSize: 140 }); }
  else if (t < s(8) - .2) { const k = seg(t, s(7) - .2, s(7) + .4), cyc = (t * .7) % 1, drop = Math.sin(cyc * Math.PI);
    bee(t, 330, 980, 2.0, { seed: 90, tongue: drop, drop, crop: .7 }); steam(560, 940, t, drop * k, 91);
    hand(g, 'out, in, out, in', 520, 1100, { size: 46, col: P.soft, write: seg(t, r(7, 2.0), r(7, 3.2)) });
    header(g, { step: 4, of: 6, title: 'Tongue drying', note: 'tiny droplets, again and again', k }); }
  else if (t < s(9) - .2) { const k = seg(t, s(8) - .2, s(8) + .4), fan = seg(t, r(8, 2.0), r(8, 2.6));
    comb(t, seg(t, s(8) - .2, r(8, 1.6)), 0); [[180, 860], [420, 850], [640, 870]].forEach(([x, y], i) => bee(t, x, y, .8, { seed: 100 + i, flap: .3 + 2.2 * fan }));
    air(140, 900, 820, 880, t, fan, 110); air(140, 1000, 820, 990, t + .4, fan, 120);
    header(g, { step: 5, of: 6, title: 'Fan the wings', note: 'moving air dries the cells', k }); }
  else if (t < s(10) - .2) { const k = seg(t, s(9) - .2, s(9) + .4), dw = ss(seg(t, s(9) - .2, r(9, 3.4)));
    comb(t, 1, 0, { ripe: dw }); [[180, 860], [640, 870]].forEach(([x, y], i) => bee(t, x, y, .8, { seed: 130 + i, flap: 2.5 })); steam(400, 860, t, 1 - dw, 131);
    scale(g, 830, 1110, 880, [[0, '0'], [.18, '18%'], [.5, '50'], [1, '100%']], lerp(.6, .18, dw), { a: k }); hand(g, 'water', 830, 860, { size: 40, align: 'center', col: P.soft, a: k });
    header(g, { step: 5, of: 6, title: 'Down to about', num: String(Math.round(lerp(60, 18, dw))), unit: '% water', sub: 'NECTAR: 40-80% WATER', k: 1, numSize: 140 }); }
  else { const k = seg(t, s(10) - .2, s(10) + .4); comb(t, 1, seg(t, r(10, .4), r(10, 2.6)), { ripe: 1 }); bee(t, 640, 860, .8, { seed: 140, flap: .5 });
    header(g, { step: 6, of: 6, title: 'Seal with wax', note: 'a lid on every cell', k }); }
  g.restore(); }

function signoff(t) { const a = win(t, s(11) - .3, s(13) - .1, .4); if (a <= 0) return; g.save(); g.globalAlpha = a;
  if (t < s(12) - .2) { const k = seg(t, s(11) + .2, s(11) + 1.6); hand(g, 'Good honey.', 540, 600, { size: 170, align: 'center', write: k }); splats(g, 900, 480, seg(t, s(11) + 1.5, s(11) + 2), 7); splats(g, 180, 660, seg(t, s(11) + 1.7, s(11) + 2.2), 13);
    mono(g, 'ENZYMES · TONGUE + WINGS · WAX', 540, 700, { size: 22, col: P.soft, align: 'center', track: 4, a: seg(t, s(11) + 1.2, s(11) + 1.8) });
    jar(370, 820, 300, 290, 1, t); hand(g, 'HONEY', 520, 1010, { size: 66, align: 'center', col: '#fff8ea' }); bee(t, 520 + 290 * Math.cos(t * 1.1), 900 + 70 * Math.sin(t * 2.2), .9, { seed: 150, face: Math.sin(t * 1.1) < 0 ? 1 : -1 }); }
  else { hand(g, 'Bees dry it', 540, 520, { size: 110, align: 'center' }); hand(g, 'with their wings?', 540, 640, { size: 110, align: 'center', col: P.rust });
    bee(t, 540, 780, 1.1, { seed: 160, flap: 2.5 });
    [['yes', 360], ['no', 700]].forEach(([w, x], i) => { const k = seg(t, s(12) + .8 + i * .3, s(12) + 1.3 + i * .3); line(g, circPts(x - 70, 960, 30, 20), { w: 3.4, close: true, seed: 600 + i, k }); hand(g, w, x - 20, 985, { size: 90, a: k }); }); }
  g.restore(); }
function endcard(t) { const t0 = s(13) - .25, a = ss(seg(t, t0, t0 + .5)); if (a <= 0) return; g.save(); g.globalAlpha = a;
  mono(g, 'HOW IT REALLY WORKS · RECIPE CARD', 540, 560, { size: 20, col: P.rust, align: 'center', track: 5 });
  hand(g, 'Follow for more of', 540, 700, { size: 92, align: 'center', write: seg(t, t0 + .1, t0 + .8) }); hand(g, 'how it really works.', 540, 820, { size: 110, align: 'center', write: seg(t, t0 + .5, t0 + 1.3) });
  line(g, [[300, 850], [540, 846], [780, 842]], { w: 3, seed: 610, k: seg(t, t0 + 1.0, t0 + 1.5) });
  hand(g, "A new 'wait, really?' every day.", 540, 930, { size: 50, align: 'center', col: P.soft, w: 500, a: seg(t, t0 + 1.2, t0 + 1.6) });
  mono(g, '@howitreallyworkstudio', 540, 1010, { size: 26, col: P.ink, align: 'center', track: 2, a: seg(t, t0 + 1.4, t0 + 1.8) });
  bee(t, 820, 640, .7, { seed: 170 }); g.restore(); }

function stepIndex(t) { const b = [s(2), s(3), s(4), s(6), s(8), s(10), s(11)]; for (let i = 0; i < 6; i++) if (t < b[i + 1]) return [i, seg(t, b[i], b[i + 1])]; return [5, 1]; }
function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(paper(), 0, 0);
  g.save(); g.translate(8 * Math.sin(t * .45), 6 * Math.sin(t * .33)); hook(t); recipe(t); signoff(t); endcard(t); g.restore();
  if (t > s(2) - .3 && t < s(11)) { const [i, u] = stepIndex(t); g.save(); g.globalAlpha = seg(t, s(2) - .3, s(2) + .2) * (1 - seg(t, s(11) - .4, s(11))); progress(g, STEPS, i, u); g.restore(); }
  const ph = PH.findLast(p => t >= p.start - .1); if (ph && ph.i < PH.length - 1) { const nx = PH[ph.i + 1].start; caption(g, ph.cap, seg(t, ph.start - .1, ph.start + .12) * (1 - seg(t, nx - .2, nx - .05)), 1250); }
}
window.DUR = TOT;
// loop: blend the frame-0 hook back in over the last 0.5 s (30%)
window.seek = t => { scene(t); const lp = seg(t, TOT - .5, TOT); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); scene(0); const f0 = g.getImageData(0, 0, W, H); const k = .3 * ss(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paper(), 0, 0); jar(560, 900, 360, 400, 1, 2); bee(2, 330, 1000, 1.8, { seed: 20, crop: 1 });
  mono(g, 'STEP 1 / 6 · THE RECIPE', 90, 360, { size: 26, col: P.rust, track: 5 }); hand(g, 'Nectar', 80, 520, { size: 170 }); hand(g, '→ honey?', 80, 700, { size: 170, col: P.rust }); hand(g, 'bees dry it with their wings', 540, 1480, { size: 66, align: 'center' }); splats(g, 900, 560, 1, 3); };
window.seek(0); window.ready = true; window.READY = true;
