// t_search.js: "How a search engine finds an answer in a second" in template #14 explainer "Alchemy Infra" (demo 80). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: point -> line -> diamond -> gridded cube with dimension line + callout (A); isometric block field with lit blocks (B, H);
// dotted globe with cyan arcs flanked by big stats (C, J); white flash card with serif italic word (D); glass terminal card with traffic lights + 200 OK (E-G, K);
// "One platform to power your / <serif word>." swap over a card carousel (I); indigo disc + ring (L); motion-blur number (M); indigo flash with kinetic type (N);
// lens-flare logo reveal (O). Kinetic letter slides with horizontal smear throughout.
import { createAL, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/alchemy/alchemy.js';
import { isLand } from './lib/landmask.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const A = createAL(document.getElementById('c')), g = A.g, lg = A.lg, R = ramp;

// ---------- A: hook + cube build ----------
function cubeGrid(x, y, sz, h, k) {                               // 3x3 grid lines over the three faces
  const T = [[x, y - sz * .58], [x + sz, y], [x, y + sz * .58], [x - sz, y]], L0 = (a, b, c2, d2, u) => A.line(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(c2[0], d2[0], u), lerp(c2[1], d2[1], u), { w: 1.6, prog: k, col: 'rgba(225,228,255,.75)' });
  for (const u of [1 / 3, 2 / 3]) { L0(T[0], T[3], T[1], T[2], u); L0(T[0], T[1], T[3], T[2], u);
    const B3 = [T[3][0], T[3][1] + h], B2 = [T[2][0], T[2][1] + h], B1 = [T[1][0], T[1][1] + h];
    L0(T[3], B3, T[2], B2, u); L0(T[2], B2, T[1], B1, u); L0(T[3], T[2], B3, B2, u); L0(T[2], T[1], B2, B1, u); } }
function sceneA(t) { const t0 = s(0), out = R(t, t0 + 3.3, .6), cx = 540, cy = 1010;
  A.kinetic("Google doesn't", 90, 430, t < .01 ? 1 : R(t, -1, 1), { size: 108, out });
  A.kinetic('search the web.', 90, 560, t < .01 ? 1 : R(t, -1, 1), { f: 'serif', wt: 400, size: 150, col: C.indL, track: 0, out });
  A.kinetic('It already did that,', 90, 430, R(t, t0 + 3.5, .8), { size: 92 }); A.kinetic('before you asked.', 90, 560, R(t, t0 + 4.0, .8), { f: 'serif', wt: 400, size: 132, col: C.indL, track: 0 });
  const p = R(t, 0, .5), l = ex(R(t, .5, .7)), dmd = ex(R(t, 1.2, .7)), ext = ex(R(t, 1.9, .8)), sz = 230;
  if (dmd <= 0) { A.dot(cx, cy, 9, '#fff', 1, 20); const c = lg; c.save(); c.strokeStyle = 'rgba(200,205,255,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 30 + 20 * p, 0, TAU); c.stroke(); c.restore();
    if (l > 0) { A.line(cx, cy, cx - 250 * l, cy, { w: 3, col: '#fff' }); A.line(cx, cy, cx + 250 * l, cy, { w: 3, col: '#fff' }); } }
  else { const yy = cy - ext * 140; A.iso(cx, yy, lerp(250, sz, dmd), ext * 280, { top: '#5a5aff', left: '#3c3cdc', right: '#26268f' }); if (ext > .5) cubeGrid(cx, yy, sz, 280, R(ext, .5, .5));
    const dk = R(t, 2.6, .6); if (dk > 0) { A.line(cx + sz + 70, yy, cx + sz + 70, yy + 280, { w: 2, prog: ex(dk) }); A.line(cx + sz + 55, yy, cx + sz + 85, yy, { w: 2, a: dk }); A.line(cx + sz + 55, yy + 280, cx + sz + 85, yy + 280, { w: 2, a: dk }); }
    A.callout(cx - sz, yy, cx - sz - 90, yy - 150, 'INDEX #0', 'built before you asked', R(t, t0 + 3.6, 1.0), { shelf: 260 }); }
}

// ---------- B / H: isometric block field ----------
const FS = 64, FIELD = []; for (let j = -9; j <= 9; j++) for (let i = -9; i <= 9; i++) FIELD.push({ i, j, h: 20 + hash(i * 7.1 + j * 3.3) * 120 }); FIELD.sort((a, b) => (a.i + a.j) - (b.i + b.j));
const PATH = [[-3, 2], [-1, 1], [0, -1], [2, -2], [3, 0], [1, 2], [4, 3], [5, 1]];
function fieldXY(i, j, cam) { return [540 + (i - j) * FS - cam[0], 1080 + (i + j) * FS * .58 - cam[1]]; }
function sceneB(t) { const t0 = s(1), cam = [lerp(-80, 80, ss(R(t, t0 - .3, 6))), lerp(60, -40, ss(R(t, t0 - .3, 6)))], vis = R(t, t0 + .3, 4.6) * (PATH.length - 1), lit = new Set(); for (let k = 0; k <= Math.floor(vis); k++) lit.add(PATH[k].join());
  FIELD.forEach(b => { const [x, y] = fieldXY(b.i, b.j, cam); if (y < 560 || y > 1640) return; const L = lit.has(b.i + ',' + b.j), fadeY = clamp((y - 560) / 160) * clamp((1640 - y) / 160);
    A.iso(x, y - b.h, FS, b.h, { a: fadeY * (L ? 1 : .8), top: L ? '#7b7bff' : '#2c2c9c', left: L ? '#4d4de6' : '#1c1c6a', right: L ? '#3434b0' : '#121247', edge: L ? 'rgba(230,232,255,.9)' : 'rgba(110,115,220,.35)', edgeW: 1.2 }); });
  // crawler: bright small cube hopping along the path, link lines behind it
  for (let k = 0; k < Math.min(PATH.length - 1, Math.floor(vis) + 1); k++) { const a = PATH[k], b = PATH[k + 1], u = clamp(vis - k), [x0, y0] = fieldXY(a[0], a[1], cam), [x1, y1] = fieldXY(b[0], b[1], cam), ha = FIELD.find(f => f.i === a[0] && f.j === a[1]).h, hb = FIELD.find(f => f.i === b[0] && f.j === b[1]).h;
    A.arc(x0, y0 - ha, x1, y1 - hb, 90, ex(u), { col: C.cyan, w: 3, a: .9 }); }
  const k = Math.min(PATH.length - 2, Math.floor(vis)), u = ex(clamp(vis - k)), a = PATH[k], b = PATH[k + 1], [x0, y0] = fieldXY(a[0], a[1], cam), [x1, y1] = fieldXY(b[0], b[1], cam);
  const hx = lerp(x0, x1, u), hy = lerp(y0 - FIELD.find(f => f.i === a[0] && f.j === a[1]).h, y1 - FIELD.find(f => f.i === b[0] && f.j === b[1]).h, u) - Math.sin(u * Math.PI) * 90 - 30;
  A.iso(hx, hy, 22, 26, { top: '#ffffff', left: '#b9bbff', right: '#8a8cff', edgeW: 0 }); A.dot(hx, hy, 40, 'rgba(140,140,255,.25)');
  A.callout(hx, hy - 20, hx + 120, hy - 170, 'CRAWLER', 'following links', R(t, t0 + .8, .9), { dir: 1, shelf: 220 });
  A.kinetic('crawlers', 90, 430, R(t, t0 - .2, .8), { size: 150 }); A.kinetic('follow every link.', 90, 540, R(t, t0 + 2.2, .8), { f: 'serif', wt: 400, size: 104, col: C.indL, track: 0 });
}

// ---------- C: globe + stats ----------
const ARCS = Array.from({ length: 14 }, (_, n) => { const pick = m => { for (let q = 0; q < 50; q++) { const la = -50 + hash(m * 3.1 + q) * 110, lo = -170 + hash(m * 7.7 + q * 1.3) * 340; if (isLand(la, lo)) return [la, lo]; } return [0, 0]; }; return [pick(n * 2 + 1), pick(n * 2 + 2), n]; });
function globeArcs(t, t0, cx, cy, r, rot, n, a = 1) { ARCS.slice(0, n).forEach(([p, q, m]) => { const [x0, y0, z0] = A.proj(cx, cy, r, rot, p[0], p[1]), [x1, y1, z1] = A.proj(cx, cy, r, rot, q[0], q[1]); if (z0 < .1 || z1 < .1) return;
  const k = R(t, t0 + m * .22, 1.1); A.arc(x0, y0, x1, y1, 80 + Math.hypot(x1 - x0, y1 - y0) * .35, ex(k), { col: m % 3 ? C.cyan : '#e8eaff', w: 3.5, tail: .55, a }); }); }
function rollNum(v, digits) { return Math.round(v).toLocaleString('en-US'); }
function sceneC(t) { const t0 = s(2), cx = 540, cy = 960, r = 320, rot = -1.6 + (t - t0) * .12;
  A.globe(cx, cy, r, rot, isLand, { a: ex(R(t, t0 - .3, .8)) }); globeArcs(t, t0 + .2, cx, cy, r, rot, 14);
  const k1 = R(t, t0 + .9, .8); A.line(90, 360, 500, 360, { prog: ex(k1), w: 1.5, col: 'rgba(200,205,255,.4)' }); A.kinetic('100s of billions', 90, 470, k1, { size: 100 }); A.text('PAGES IN THE INDEX', 92, 530, { f: 'mono', size: 26, col: C.grey, track: 6, a: R(t, t0 + 1.3, .5) });
  const k2 = R(t, t0 + 3.2, .6), v = 100000000 * ex(R(t, t0 + 3.2, 1.8)); A.line(580, 1350, 990, 1350, { prog: ex(k2), w: 1.5, col: 'rgba(200,205,255,.4)' });
  if (k2 > 0) A.text(rollNum(v) + (v > 99999990 ? '+' : ''), 990, 1450, { size: 96, wt: 800, align: 'right', a: k2, track: -2, blur: (1 - R(t, t0 + 4.4, .6)) * 3 }); A.text('GIGABYTES  ·  INDEX SIZE', 990, 1505, { f: 'mono', size: 26, col: C.grey, track: 6, align: 'right', a: R(t, t0 + 3.6, .5) });
}

// ---------- D: white card, back-of-book index ----------
const BOOK = [['blue', '12, 57, 88'], ['magnet', '21, 40'], ['sky', '4, 12, 31, 57, 88'], ['why', '3, 12, 57, 64, 88']];
function sceneD(t) { const t0 = s(3), ink = '#15172e';
  A.kinetic('like the', 90, 420, R(t, t0 - .3, .7), { size: 88, col: ink }); A.kinetic('index', 80, 640, R(t, t0, .9), { f: 'serif', wt: 400, size: 280, col: ink, track: 0 });
  A.text('AT THE BACK OF A BOOK', 94, 720, { f: 'mono', size: 28, col: '#6b6f8f', track: 7, a: R(t, t0 + .8, .5) });
  BOOK.forEach(([w, p], i) => { const k = R(t, t0 + 1.4 + i * .45, .6), y = 900 + i * 130; if (k <= 0) return; A.text(w, 94, y, { size: 58, wt: 700, col: ink, a: k }); const ww = A.measure(w, 'sans', 58, 700);
    const c = lg; c.save(); c.globalAlpha = k * .5; c.fillStyle = ink; for (let x = 94 + ww + 24; x < 560; x += 18) c.fillRect(x, y - 8, 5, 5); c.restore(); A.text(p, 990, y, { f: 'mono', size: 44, wt: 600, col: C.ind, align: 'right', write: R(k, .3, .7) }); });
  A.line(90, 1440, 990, 1440, { prog: ex(R(t, t0 + 1.2, 1)), w: 2, col: 'rgba(21,23,46,.25)' }); A.text('an entry for every word', 94, 1500, { f: 'serif', size: 64, col: C.ind, a: R(t, t0 + 3.0, .6) });
}

// ---------- E/F/G: terminal + lists + intersection ----------
const LISTS = [['why', [3, 12, 57, 64, 88]], ['is', [1, 3, 12, 40, 57, 88]], ['the', [1, 4, 12, 21, 40, 57, 88]], ['sky', [4, 12, 31, 57, 88]], ['blue', [12, 57, 77, 88]]];
const COMMON = [12, 57, 88];
function chip(x, y, n, o = {}) { const c = lg, w = 92, h = 64; c.save(); c.globalAlpha *= o.a ?? 1; c.fillStyle = o.on ? C.ind : 'rgba(40,44,110,.7)'; if (o.on) { c.shadowColor = C.ind; c.shadowBlur = 24; } c.beginPath(); c.roundRect(x, y - h / 2, w, h, 14); c.fill(); c.shadowBlur = 0;
  c.strokeStyle = o.on ? '#c9caff' : 'rgba(140,140,255,.35)'; c.lineWidth = 2; c.stroke(); c.restore(); A.text(String(n), x + w / 2, y + 14, { f: 'mono', size: 34, wt: 700, align: 'center', a: (o.a ?? 1), col: o.on ? '#fff' : '#c6c9ec' }); }
function sceneE(t) { const t0 = s(4), k = ex(R(t, t0 - .3, .7)); A.glass(90, 560 + (1 - k) * 80, 900, 720, { title: '~/index — zsh', pill: '200 OK', a: k });
  A.text('$', 140, 760, { f: 'mono', size: 40, col: C.cyan, a: k }); A.text('lookup "sky"', 190, 760, { f: 'mono', size: 40, write: R(t, t0, .8) });
  const rk = R(t, t0 + .9, .4); if (rk > 0) { const c = lg; c.save(); c.globalAlpha = rk; c.fillStyle = 'rgba(88,230,212,.10)'; c.fillRect(120, 820, 840, 110); c.restore(); A.text('sky →', 150, 892, { f: 'mono', size: 40, col: C.cyan, a: rk }); LISTS[3][1].forEach((n, i) => chip(330 + i * 112, 875, n, { a: R(t, t0 + 1.0 + i * .12, .3) })); }
  A.text('LIST OF PAGES', 140, 1050, { f: 'mono', size: 28, col: C.grey, track: 6, a: R(t, t0 + 1.4, .5) }); A.text('every word gets one', 140, 1150, { size: 72, wt: 800, a: R(t, t0 + 1.6, .5), track: -2 });
}
function sceneF(t) { const t0 = s(5), k = ex(R(t, t0 - .3, .6)), c = lg; // search bar
  c.save(); c.globalAlpha = k; c.shadowColor = 'rgba(90,90,255,.6)'; c.shadowBlur = 30; c.fillStyle = 'rgba(18,20,58,.95)'; c.beginPath(); c.roundRect(90, 380, 900, 130, 65); c.fill(); c.shadowBlur = 0; c.strokeStyle = 'rgba(140,140,255,.9)'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = C.indL; c.lineWidth = 6; c.beginPath(); c.arc(170, 438, 24, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(188, 456); c.lineTo(206, 474); c.stroke(); c.restore();
  const q = 'why is the sky blue', tw = R(t, t0 + .1, 1.4); A.text(q, 240, 466, { size: 52, wt: 600, write: tw }); if (tw < 1 || Math.floor(t * 2) % 2) { const x = 240 + A.measure(q.slice(0, Math.floor(q.length * tw)), 'sans', 52, 600); A.line(x + 6, 420, x + 6, 478, { w: 3, a: k }); }
  const ix = R(t, s(6) - .1, .6);                                             // intersection
  LISTS.forEach(([w, ids], r) => { const y = 650 + r * 150, kk = R(t, t0 + 2.6 + r * .3, .5); if (kk <= 0) return; A.text(w, 90, y + 16, { size: 52, wt: 800, a: kk });
    ids.forEach((n, i) => { const on = COMMON.includes(n) && ix > 0, x = 250 + i * 104; chip(x, y, n, { a: R(kk, i * .08, .4) * (ix > 0 && !COMMON.includes(n) ? 1 - .7 * ix : 1), on }); }); });
  const mk = R(t, s(6) + 1.2, .6); if (mk > 0) { A.glass(90, 1430, 900, 150, { a: ex(mk), r: 30 }); A.text('MATCH', 140, 1522, { f: 'mono', size: 34, wt: 700, col: C.green, track: 6, a: mk }); COMMON.forEach((n, i) => chip(420 + i * 130, 1505, n, { on: true, a: R(mk, .2 + i * .15, .3) })); }
}

// ---------- H: pile -> ranked ----------
const BARS = Array.from({ length: 7 }, (_, i) => ({ h: 60 + hash(i * 5.3 + 2) * 340, i })); const ORDER = BARS.slice().sort((a, b) => b.h - a.h).map(b => b.i);
function sceneH(t) { const t0 = s(7), sort = ss(R(t, t0 + 1.7, 1.2));
  A.kinetic('a huge pile.', 90, 430, R(t, t0 - .3, .7), { size: 116, out: R(t, t0 + 1.4, .5) }); A.kinetic('Then:', 90, 430, R(t, t0 + 1.6, .6), { size: 116 }); A.kinetic('rank.', 420, 430, R(t, t0 + 1.9, .6), { f: 'serif', wt: 400, size: 170, col: C.indL, track: 0 });
  const draw = []; BARS.forEach((b, n) => { const rank = ORDER.indexOf(n), pos = lerp(n, rank, sort); draw.push({ pos, b, rank }); }); draw.sort((a, b) => a.pos - b.pos);
  draw.forEach(({ pos, b, rank }) => { const x = 300 + pos * 82, y = 1250 + pos * 47 - (1 - sort) * 0, k = ex(R(t, t0 - .2 + b.i * .08, .6)); const top = rank === 0 && sort > .9;
    A.iso(x, y - b.h * k, 60, b.h * k, { top: top ? '#9a9bff' : '#5656ff', left: '#3a3ad8', right: '#25258f' }); if (sort > .9) A.text('#' + (rank + 1), x, y + 60, { f: 'mono', size: 26, col: top ? '#fff' : C.grey, align: 'center', a: R(t, t0 + 2.9 + rank * .06, .3) }); });
}

// ---------- I: factor carousel ----------
const FACT = ['Meaning.', 'Relevance.', 'Quality.', 'Usability.', 'Context.'];
function sceneI(t) { const t0 = s(8), dur = e(8) - t0, fi = clamp(Math.floor(((t - t0) / dur) * 5.3), 0, 4), fu = ((t - t0) / dur) * 5.3 - fi;
  A.text('Every result is weighed by', 90, 410, { size: 46, wt: 500, a: R(t, t0 - .3, .5) });
  FACT.forEach((w, i) => { if (Math.abs(i - fi) > 1) return; const kin = i === fi ? R(fu, 0, .25) : 0, out = i === fi - 1 ? 1 : i === fi ? 0 : 0; if (i === fi) A.kinetic(w, 86, 560, t < t0 ? 0 : kin, { f: 'serif', wt: 400, size: 150, col: C.indL, track: 0 }); });
  // carousel: cards on an arc, current one in front
  const pos = lerp(fi - 1, fi, ex(R(fu, 0, .35))); const cards = FACT.map((w, i) => ({ i, d: i - pos })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  cards.forEach(({ i, d }) => { if (Math.abs(d) > 2.2) return; const sc = 1 - Math.min(1, Math.abs(d)) * .28 - Math.max(0, Math.abs(d) - 1) * .15, x = 540 + Math.sin(d * .7) * 520, y = 1080 + Math.abs(d) * 30, w = 560 * sc, h = 640 * sc, c = lg;
    c.save(); c.translate(x, y); c.transform(1, d * -.08, 0, 1, 0, 0); A.use(c); A.glass(-w / 2, -h / 2, w, h, { a: (1 - Math.min(1, Math.abs(d)) * .45) * ex(R(t, t0 - .3, .6)), r: 30 * sc });
    A.text(FACT[i].replace('.', '').toUpperCase(), -w / 2 + 40 * sc, -h / 2 + 80 * sc, { f: 'mono', size: 30 * sc, wt: 700, track: 4, col: '#fff' });
    for (let b = 0; b < 4; b++) { c.fillStyle = b === 0 ? C.ind : 'rgba(120,125,220,.35)'; c.beginPath(); c.roundRect(-w / 2 + 40 * sc, -h / 2 + (160 + b * 70) * sc, (w - 80 * sc) * (.9 - b * .18 - (i * .07) % .2), 34 * sc, 10 * sc); c.fill(); }
    A.text(['what you mean', 'does it answer it', 'is it trustworthy', 'easy to use?', 'where you are'][i], -w / 2 + 40 * sc, h / 2 - 50 * sc, { size: 34 * sc, wt: 500, col: C.grey }); c.restore(); });
}

// ---------- J: links in ----------
const SITES = ['ENCYCLOPEDIA', 'UNIVERSITY', 'NEWS SITE', 'MUSEUM', 'SCIENCE MAG', 'GOV AGENCY'];
function sceneJ(t) { const t0 = s(9), cx = 540, cy = 1060;
  A.kinetic('Who links', 90, 430, R(t, t0 - .3, .7), { size: 116 }); A.kinetic('to it?', 90, 560, R(t, t0 + .2, .7), { f: 'serif', wt: 400, size: 150, col: C.indL, track: 0 });
  SITES.forEach((nm, i) => { const a = -Math.PI * .85 + i / (SITES.length - 1) * Math.PI * 1.7 + Math.PI / 2, x = cx + Math.cos(a) * 380, y = cy + Math.sin(a) * 330 * (i % 2 ? 1 : .92), k = R(t, t0 + .3 + i * .15, .5);
    if (k <= 0) return; A.dot(x, y, 16, C.indL, k, 20); A.text(nm, x, y + (y < cy ? -36 : 56), { f: 'mono', size: 22, col: C.grey, align: 'center', track: 3, a: k }); A.arc(x, y, cx, cy, -60 + (i % 3) * 40, ex(R(t, t0 + .9 + i * .25, .8)), { col: C.cyan, w: 3.5 }); });
  const pk = ex(R(t, t0, .6)); A.glass(cx - 170, cy - 110, 340, 220, { a: pk, r: 26 }); A.text('YOUR PAGE', cx, cy - 20, { f: 'mono', size: 30, wt: 700, align: 'center', track: 5, a: pk });
  const n = Math.min(6, Math.floor(clamp((t - t0 - 1.0) / 1.6) * 6.99)); A.text(`+${n} links`, cx, cy + 50, { size: 50, wt: 800, align: 'center', col: C.cyan, a: R(t, t0 + 1.0, .3) });
  A.text('one sign of quality', 540, 1560, { f: 'serif', size: 72, col: C.indL, align: 'center', a: R(t, t0 + 2.4, .6) });
}

// ---------- K: spelling + synonyms ----------
function sceneK(t) { const t0 = s(10), k = ex(R(t, t0 - .3, .6)), c = lg, fix = R(t, t0 + 1.6, .6);
  c.save(); c.globalAlpha = k; c.shadowColor = 'rgba(90,90,255,.6)'; c.shadowBlur = 30; c.fillStyle = 'rgba(18,20,58,.95)'; c.beginPath(); c.roundRect(90, 380, 900, 130, 65); c.fill(); c.shadowBlur = 0; c.strokeStyle = 'rgba(140,140,255,.9)'; c.lineWidth = 3; c.stroke(); c.restore();
  const bad = 'why is teh sky blu', good = 'why is the sky blue'; if (fix < .5) { A.text(bad, 150, 466, { size: 52, wt: 600, write: R(t, t0 - .2, 1.1), a: 1 - fix * 2 }); const sq = R(t, t0 + 1.0, .4);
    if (sq > 0) [[bad.indexOf('teh'), 3], [bad.indexOf('blu'), 3]].forEach(([i0, n]) => { const x0 = 150 + A.measure(bad.slice(0, i0), 'sans', 52, 600), x1 = x0 + A.measure(bad.slice(i0, i0 + n), 'sans', 52, 600); c.save(); c.strokeStyle = C.red; c.lineWidth = 3.5; c.globalAlpha = sq; c.beginPath(); for (let x = x0; x <= x1; x += 4) c.lineTo(x, 482 + Math.sin(x * .5) * 4); c.stroke(); c.restore(); }); }
  else A.text(good, 150, 466, { size: 52, wt: 600, a: (fix - .5) * 2 });
  A.text('DID YOU MEAN', 94, 590, { f: 'mono', size: 26, col: C.green, track: 6, a: R(t, t0 + 1.6, .4) });
  const syn = [['blue', 'azure'], ['why', 'reason'], ['sky', 'atmosphere']]; syn.forEach(([a, b], i) => { const kk = R(t, t0 + 2.4 + i * .35, .5), y = 760 + i * 130; if (kk <= 0) return; A.glass(90, y - 55, 900, 100, { a: ex(kk), r: 50 });
    A.text(a, 200, y + 14, { size: 50, wt: 700, a: kk }); A.text('≈', 540, y + 18, { size: 64, wt: 700, col: C.indL, align: 'center', a: kk }); A.text(b, 880, y + 14, { f: 'serif', size: 64, col: C.indL, align: 'right', a: kk }); });
  const rk = R(t, t0 + 3.8, .6); if (rk > 0) { A.glass(90, 1200, 900, 300, { title: 'result', a: ex(rk) }); A.text('Why the atmosphere', 140, 1390, { size: 52, wt: 700, a: rk }); A.text('looks azure', 140, 1455, { size: 52, wt: 700, a: rk }); A.text('no exact words, still a match', 140, 1185, { f: 'mono', size: 24, col: C.grey, a: rk }); }
}

// ---------- L: fraction of a second (indigo disc + ring) ----------
function sceneL(t) { const t0 = s(11), k = bo(R(t, t0 - .3, .6)), c = lg, cx = 540, cy = 1000;
  for (let i = 0; i < 3; i++) { const u = ((t - t0) * .6 + i / 3) % 1; c.save(); c.globalAlpha = (1 - u) * .35; c.strokeStyle = C.indL; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 300 + u * 300, 0, TAU); c.stroke(); c.restore(); }
  c.save(); c.translate(cx, cy); c.scale(k, k); c.shadowColor = C.ind; c.shadowBlur = 80; c.fillStyle = C.ind; c.beginPath(); c.arc(0, 0, 290, 0, TAU); c.fill(); c.shadowBlur = 0; c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 190, 0, TAU); c.stroke(); c.restore();
  A.text('< 1 s', cx, cy + 50, { size: 140, wt: 800, align: 'center', a: R(t, t0, .4), track: -4 }); A.text('A FRACTION OF A SECOND', cx, cy + 420, { f: 'mono', size: 30, col: C.grey, track: 8, align: 'center', a: R(t, t0 + .4, .5) });
}

// ---------- M: 15% with motion blur ----------
function sceneM(t) { const t0 = s(12), c = lg, tun = R(t, t0 - .3, .8);
  if (tun < 1) { c.save(); c.globalAlpha = 1 - tun; for (let i = 0; i < 90; i++) { const a = hash(i) * TAU, r0 = 80 + hash(i * 3) * 300 + tun * 600; c.strokeStyle = `rgba(140,140,255,${.15 + hash(i * 7) * .3})`; c.lineWidth = 2 + hash(i * 5) * 4; c.beginPath(); c.moveTo(540 + Math.cos(a) * r0, 980 + Math.sin(a) * r0); c.lineTo(540 + Math.cos(a) * (r0 + 400), 980 + Math.sin(a) * (r0 + 400)); c.stroke(); } c.restore(); }
  const k = R(t, t0 + .2, .9), v = Math.round(15 * ex(k)); if (k > 0) A.text(v + '%', 540, 1100, { size: 400, wt: 800, align: 'center', track: -12, blur: (1 - ex(k)) * 14, a: clamp(k * 3) });
  A.text('OF SEARCHES EACH DAY', 540, 1210, { f: 'mono', size: 32, col: C.grey, track: 8, align: 'center', a: R(t, t0 + 1.4, .5) }); A.text('are brand new.', 540, 1330, { f: 'serif', size: 110, col: C.indL, align: 'center', a: R(t, t0 + 2.6, .6) });
  A.text('SOURCE: GOOGLE, 2019', 540, 1450, { f: 'mono', size: 24, col: C.dim, track: 6, align: 'center', a: R(t, t0 + 3.2, .5) });
}

// ---------- N: question on indigo flash ----------
function sceneN(t) { const t0 = s(13); A.kinetic('the strangest', 90, 760, R(t, t0 - .2, .7), { size: 124 }); A.kinetic('thing', 90, 900, R(t, t0 + .2, .7), { size: 124 });
  A.kinetic("you've ever searched?", 90, 1060, R(t, t0 + .6, .8), { f: 'serif', wt: 400, size: 116, col: '#fff', track: 0 }); }

// ---------- O: lens flare + logo end card ----------
function sceneO(t) { const t0 = s(14) - .3, c = lg, fl = R(t, t0, .9), cx = 540, cy = 760;
  if (fl < 1) { c.save(); c.globalAlpha = Math.sin(fl * Math.PI); const gr = c.createLinearGradient(0, cy, W, cy); gr.addColorStop(0, 'rgba(120,120,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(120,120,255,0)'); c.fillStyle = gr; c.fillRect(0, cy - 3, W, 6);
    c.strokeStyle = 'rgba(160,160,255,.8)'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, 80 + fl * 360, 0, TAU); c.stroke(); A.dot(cx, cy, 30 + 30 * Math.sin(fl * Math.PI), '#fff', 1, 60); c.restore(); }
  const mk = ex(R(t, t0 + .5, .6)); c.save(); c.globalAlpha = mk; c.strokeStyle = C.ind; c.lineWidth = 16; c.beginPath(); c.arc(cx - 20, cy - 20, 52, 0, TAU); c.stroke(); c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + 18, cy + 18); c.lineTo(cx + 58, cy + 58); c.stroke(); c.restore();
  A.kinetic('howitreallyworks', cx, cy + 190, R(t, t0 + .6, .7), { size: 70, wt: 600, align: 'center', track: -1 });
  A.text('Follow for more of', cx, 1120, { size: 62, wt: 500, align: 'center', col: '#c9cdf0', a: R(t, t0 + 1.0, .5) }); A.text('how it really works.', cx, 1220, { size: 88, wt: 800, align: 'center', a: R(t, t0 + 1.2, .5), track: -2 });
  A.text('@HOWITREALLYWORKSTUDIO', cx, 1330, { f: 'mono', size: 26, col: C.grey, align: 'center', track: 6, a: R(t, t0 + 1.5, .5) });
}

// ---------- compositor ----------
// [start, fn, ground: 0 dark | 1 indigo flash | 2 white, hud bottom-left label]
const SC = [[0, sceneA, 0, 'SC 01  QUERY'], [s(1) - .3, sceneB, 0, 'SC 02  CRAWL'], [s(2) - .3, sceneC, 0, 'SC 03  INDEX'], [s(3) - .3, sceneD, 2, 'SC 04  BOOK'], [s(4) - .2, sceneE, 0, 'SC 05  LIST'],
  [s(5) - .3, sceneF, 0, 'SC 06  MATCH'], [s(7) - .3, sceneH, 0, 'SC 07  RANK'], [s(8) - .3, sceneI, 0, 'SC 08  WEIGH'], [s(9) - .3, sceneJ, 0, 'SC 09  LINKS'], [s(10) - .3, sceneK, 0, 'SC 10  SPELL'],
  [s(11) - .3, sceneL, 0, 'SC 11  SPEED'], [s(12) - .3, sceneM, 0, 'SC 12  NEW'], [s(13) - .3, sceneN, 1, 'SC 13  YOU'], [s(14) - .3, sceneO, 0, 'SC 14  END']];
const TR = .4;
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
const gmode = (m, u) => ({ fl: m === 1 ? u : 0, wh: m === 2 ? u : 0 });
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), cur = SC[i][2], prev = i > 0 ? SC[i - 1][2] : cur;
  const a = gmode(prev, 1 - ss(u)), b = gmode(cur, ss(u)); const flashCut = i > 0 && u < 1 && cur !== prev ? Math.sin(u * Math.PI) * .9 : 0;   // demo: indigo flash frame between sections
  A.ground(Math.max(a.fl + b.fl, cur === 2 || prev === 2 ? 0 : flashCut), a.wh + b.wh);
  if (i > 0 && u < 1) { A.clear(); SC[i - 1][1](t); A.blit({ a: 1 - ss(u), z: 1 + .08 * u, blur: 16 * u, dx: -120 * ex(u) }); }
  A.clear(); SC[i][1](t); A.blit({ a: i > 0 ? ss(u) : 1, z: i > 0 ? lerp(.96, 1, ex(u)) : 1, blur: i > 0 ? 14 * (1 - u) : 0, dx: i > 0 ? 120 * (1 - ex(u)) : 0 });
  const ph = PH.findLast(p => t >= p.start - .2), white = cur === 2 && u > .5;
  if (ph && ph.i < PH.length - 1) A.caption(ph, t, 1700, { white, out: PH[ph.i + 1].start - .15 });
  A.hud(t, { bl: SC[i][3], white: white ? 1 : 0 });
}
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - f; g.fillStyle = C.bg0; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
