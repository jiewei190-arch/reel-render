// t_fingerprints.js: "Why do we have fingerprints?" in template #8 urban-sketch, in-house engine reels/styles/urbansketch.
// Grammar kept: sepia fineliner first, transparent wash after, paper white reserved, lines boil at 12 fps, the one coloured thing
// (skin), handwritten margin note + handwritten caption, page turns between spreads, a slow hand-held camera.
// Batch N: drawings inside y 250-1130, captions in the lower margin (y ~1180-1400), nothing written right of x 900 below y 840.
// Ideas are labelled as ideas on the page (IDEA tags), the busted claim gets a "BUSTED?" stamp with "not quite".
import { createUS, W, H, clamp, lerp, seg, ss, eo, eio, backOut, hash, PAPER, INK, INK2, PAL, mix, rgba } from './styles/urbansketch/urbansketch.js';
await document.fonts.load('600 60px Caveat');
const R = createUS(document.getElementById('c')), g = R.g;
const TL = window.TL, PH = TL.p, s = i => PH[i].start, r = (i, d) => s(i) + d, TOT = TL.total;
const C = { skin: '#eab48e', skinD: '#c98a66', plastic: '#9cc4d8', water: PAL.slate, vib: '#8d6bb0', rec: PAL.rose, womb: '#e9a3a0', dna: PAL.sage, stamp: '#c0392b', rough: PAL.ochre, steel: PAL.steel };

// ---------- camera ----------
function cam(z, x, y, t) { const dx = 6 * Math.sin(t * .37), dy = 5 * Math.sin(t * .29 + 1); g.setTransform(z, 0, 0, z, 540 - (x + dx) * z, 960 - (y + dy) * z); }
const screen = () => g.setTransform(1, 0, 0, 1, 0, 0);
const close = p => p.concat([p[0]]);
const ell = (cx, cy, rx, ry, n = 30, a0 = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(a0 + i / n * 6.2832) * rx, cy + Math.sin(a0 + i / n * 6.2832) * ry]);
const drift = t => cam(1.01 + .012 * Math.sin(t * .4), 540 + 12 * Math.sin(t * .6), 960 + 10 * Math.sin(t * .5), t);

// ---------- fingerprint ridges: whorl / loop / arch, in unit coords; the seed changes the details (ridge endings) ----------
const CACHE = {};
function ridgeLines(type, seed, n) {
  const key = type + seed + '_' + n; if (CACHE[key]) return CACHE[key]; const L = [];
  const wob = (x, y, j) => [x + .025 * Math.sin(y * 7 + seed + j), y + .025 * Math.sin(x * 6 + seed * 1.7 + j)];
  if (type === 'whorl') for (let j = 1; j <= n; j++) { const rr = j / n * 1.5, a0 = hash(seed + j * 3.1) * 6.28, pts = [];
    for (let q = 0; q <= 48; q++) { const th = a0 + q / 48 * (6.28 - .45), k = 1 + .06 * Math.sin(3 * th + seed); pts.push(wob(Math.cos(th) * rr * .82 * k, Math.sin(th) * rr * k - .1, j)); } L.push(pts); }
  if (type === 'loop') { for (let j = 0; j < n; j++) { const d = (j + .6) / n * 1.15, pts = [];
      for (let q = 0; q <= 10; q++) pts.push([-d, 1.6 - q / 10 * 1.6]); for (let q = 1; q <= 16; q++) { const th = Math.PI + q / 16 * Math.PI; pts.push([Math.cos(th) * d, Math.sin(th) * d]); } for (let q = 1; q <= 10; q++) pts.push([d, q / 10 * 1.6]);
      L.push(pts.map(([x, y]) => wob(x + (1.6 - y) * .0 + y * .35, y - .1, j))); }
    for (let j = 0; j < 5; j++) { const y0 = -1.42 - j * .15, pts = []; for (let q = 0; q <= 24; q++) { const x = -1.6 + q / 24 * 3.2; pts.push(wob(x, y0 - .25 * Math.exp(-x * x), j + 40)); } L.push(pts); } }
  if (type === 'arch') for (let j = 0; j < n; j++) { const y0 = -1.5 + j / (n - 1) * 3, h = .55 * (1 - Math.abs(y0) / 1.8), pts = []; for (let q = 0; q <= 26; q++) { const x = -1.6 + q / 26 * 3.2; pts.push(wob(x, y0 - h * Math.exp(-x * x * 1.6), j)); } L.push(pts); }
  // ridge endings: split a few ridges with a short gap, chosen by the seed (this is what differs between twins)
  const out = []; L.forEach((pl, j) => { if (hash(seed * 1.3 + j * 7.7) < .35 && pl.length > 12) { const c = 3 + Math.floor(hash(seed + j) * (pl.length - 8)); out.push(pl.slice(0, c), pl.slice(c + 2)); } else out.push(pl); });
  return (CACHE[key] = out);
}
function fp(cx, cy, sc, type, seed, k, o = {}) { if (k <= 0) return; const L = ridgeLines(type, seed, o.n ?? 12), rot = o.rot ?? 0, cs = Math.cos(rot), sn = Math.sin(rot);
  L.forEach((pl, j) => R.pen(pl.map(([x, y]) => [cx + (x * cs - y * sn) * sc, cy + (x * sn + y * cs) * sc]), { w: o.w ?? 3, col: o.col ?? INK, a: o.a ?? .85, prog: clamp(k * 1.6 - j / L.length * .6), seed: seed + j * 3, boil: o.boil !== false, over: 0, gaps: false, wob: o.wob ?? 1.2 })); }
// the ridge endings of a print, for circling differences
function endings(cx, cy, sc, type, seed, n = 12) { const L = ridgeLines(type, seed, n), E = []; for (let j = 0; j + 1 < L.length; j++) { const a = L[j], b = L[j + 1]; const e = a[a.length - 1], f = b[0]; if (Math.hypot(e[0] - f[0], e[1] - f[1]) < .2) E.push([cx + e[0] * sc, cy + e[1] * sc]); } return E; }

// a finger seen from the pad side: rounded top, straight sides; ridges clipped inside
function tipPts(cx, top, w, bottom) { const rr = w / 2, o = []; for (let q = 0; q <= 20; q++) { const th = Math.PI + q / 20 * Math.PI; o.push([cx + Math.cos(th) * rr, top + rr + Math.sin(th) * rr * 1.15]); } o.push([cx + rr * .97, bottom]); o.push([cx - rr * .97, bottom]); return o; }
function finger(t, cx, top, w, bottom, o = {}) { const P = tipPts(cx, top, w, bottom), k = o.k ?? 1;
  R.wash(P, C.skin, { a: .62 * (o.col ?? 1), seed: o.seed ?? 10, smooth: true, step: 60, shade: .35 });
  g.save(); g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
  fp(cx, top + w * .62, w * .5, o.type ?? 'whorl', o.seed ?? 10, o.ridge ?? k, { n: o.n ?? 13, w: o.rw ?? 3, col: '#7a4a32' }); g.restore();
  R.pen(P.slice(0, 21).concat([[cx + w / 2 * .97, bottom]]).reverse().concat([[cx - w / 2 * .97, bottom]]).reverse(), { w: 4, prog: k, seed: (o.seed ?? 10) + 5, boil: true, over: 4, gaps: false }); }
// a finger seen from the side, pad down (for the friction test)
function sideFinger(t, cx, top, w, padY, sc = 1, seed = 300) { const rr = w / 2, P = [[cx - rr, top]]; for (let q = 0; q <= 18; q++) { const th = Math.PI - q / 18 * Math.PI; P.push([cx + Math.cos(th) * rr, padY - rr + Math.sin(th) * rr * .9]); } P.push([cx + rr, top]);
  R.wash(P, C.skin, { a: .6, seed, smooth: true, step: 60, shade: .35 }); R.pen(P, { w: 4, seed: seed + 1, boil: true, over: 4, gaps: false });
  R.pen([[cx + rr * .5, padY - rr * 1.6], [cx + rr * .82, padY - rr * .9], [cx + rr * .6, padY - rr * .35]], { w: 3, seed: seed + 2, boil: true, a: .6, over: 0, gaps: false });   // nail
  for (let i = 0; i < 7; i++) { const x = cx - rr * .7 + i * rr * .23; R.pen([[x, padY - 4], [x + 6, padY + 3], [x + 12, padY - 4]], { w: 2.2, seed: seed + 10 + i, boil: true, a: .7, over: 0, gaps: false }); } }
function tag(txt, x, y, k, seed, col = PAL.accent, size = 54) { if (k <= 0) return; const w = R.measure(txt, size) + 40; R.rect(x - w / 2, y - size * .95, w, size * 1.25, { w: 3.4, prog: k, seed, col }); R.text(txt, x, y, { size, col, reveal: k }); }
function check(x, y, k, seed, col = PAL.sage) { R.pen([[x, y], [x + 22, y + 26], [x + 66, y - 34]], { w: 6, prog: k, seed, col, over: 4, gaps: false }); }
function cross(x0, y0, x1, k, seed) { R.pen([[x0, y0 + 4], [x1, y0 - 6]], { w: 5, prog: k, seed, col: C.stamp, over: 6, gaps: false }); }

// ---------- pages ----------
// A: the hook: a fingertip, a loupe over the ridges, "better grip?" that wobbles
function pageA(t) {
  const out = eio(seg(t, .2, 2.2)), z = lerp(1.45, 1.0, out), cy = lerp(640, 760, out); cam(z, lerp(420, 540, out), cy, t);
  finger(t, 600, 360, 470, Math.min(1130, cy + 175 / z), { seed: 11, type: 'whorl' });
  const lx = 330, ly = 600, lr = 150; R.wash(ell(lx, ly, lr, lr, 32), '#fbf3e4', { a: .85, smooth: true, step: 1e4, seed: 20, blooms: 0 });
  g.save(); g.beginPath(); g.arc(lx, ly, lr - 5, 0, 6.29); g.clip(); R.wash(ell(lx, ly, lr, lr, 32), C.skin, { a: .55, smooth: true, step: 1e4, seed: 21 });
  fp(lx + 230, ly + 140, 470, 'whorl', 11, 1, { n: 13, w: 6.5, col: '#7a4a32', wob: 2 });
  for (let i = 0; i < 9; i++) R.fillCirc(lx - 100 + hash(i * 3) * 200, ly - 100 + hash(i * 5) * 200, 4, '#7a4a32', { a: .6, seed: 30 + i, blooms: 0, edge: 1 });
  g.restore(); R.circle(lx, ly, lr, { w: 7, seed: 22 }); R.circle(lx, ly, lr + 10, { w: 3, seed: 23, a: .6 });
  R.pen([[lx - 100, ly + 112], [lx - 190, ly + 250]], { w: 22, seed: 24, col: PAL.rope, a: .9, over: 0, gaps: false }); R.pen([[lx - 100, ly + 112], [lx - 190, ly + 250]], { w: 4, seed: 25, over: 0, gaps: false });
  const q = seg(t, r(1, .3), r(1, 1.0)); if (q > 0) {
    const wb = 5 * Math.sin(t * 9) * seg(t, r(1, 1.6), r(1, 2.2)); R.text('grip?', 830 + wb, 470, { size: 96, col: PAL.accent, reveal: q, rot: .06 * Math.sin(t * 6) * seg(t, r(1, 1.6), r(1, 2.2)) });
    check(780, 560, seg(t, r(1, 1.0), r(1, 1.5)), 40); R.text('?', 880, 600, { size: 110, col: C.stamp, reveal: seg(t, r(1, 2.0), r(1, 2.5)) }); } }
// B1: the friction test (Warman & Ennos): a plastic sheet dragged under a fingertip, a spring gauge reads the pull
function pageB1(t) { drift(t); const pull = Math.max(0, t - (s(2) - .2)), off = -(pull * 70) % 120, gk = seg(t, r(2, .6), r(2, 1.4));
  const sheet = [[60, 840], [1020, 840], [1020, 890], [60, 890]]; R.wash(sheet, C.plastic, { a: .55, seed: 100, dens: false, shade: .3 }); R.pen([[60, 840], [1020, 840]], { w: 3.6, seed: 101 }); R.pen([[60, 890], [1020, 890]], { w: 3.6, seed: 102 });
  for (let i = 0; i < 10; i++) { const x = 120 + i * 120 + off; if (x > 80 && x < 1000) R.pen([[x, 852], [x + 30, 878]], { w: 2.2, a: .5, seed: 110 + i, over: 0, gaps: false }); }
  sideFinger(t, 600, 250, 230, 838, 1, 300);
  R.pen([[60, 865], [10, 865]], { w: 3, seed: 120, over: 0 });
  // the gauge: a dial with a needle that settles
  const dx = 230, dy = 560, dr = 120, ang = lerp(-2.4, -.9 + .12 * Math.sin(t * 5), gk) - .55 * seg(t, r(3, 3.2), r(3, 4.4));
  R.wash(ell(dx, dy, dr, dr, 30), '#fbf3e4', { a: .9, smooth: true, step: 1e4, seed: 130, blooms: 0 }); R.circle(dx, dy, dr, { w: 4.5, seed: 131 });
  for (let i = 0; i <= 8; i++) { const a = -2.6 + i / 8 * 2.0; R.pen([[dx + Math.cos(a) * (dr - 10), dy + Math.sin(a) * (dr - 10)], [dx + Math.cos(a) * (dr - 30), dy + Math.sin(a) * (dr - 30)]], { w: 2.6, seed: 140 + i, over: 0, gaps: false }); }
  R.pen([[dx, dy], [dx + Math.cos(ang) * (dr - 24), dy + Math.sin(ang) * (dr - 24)]], { w: 5, seed: 150, col: C.stamp, over: 0, gaps: false }); R.fillCirc(dx, dy, 10, INK, { a: .9, seed: 151, blooms: 0 });
  R.pen([[dx, dy + dr], [dx - 40, 760], [70, 862]], { w: 3, seed: 152, over: 0, gaps: false }); R.text('friction', dx, dy - dr - 24, { size: 58, col: INK2, reveal: seg(t, r(2, 1.0), r(2, 1.6)) });
  const ak = seg(t, r(2, .3), r(2, 1.0)); R.pen([[960, 960], [700, 960]], { w: 5, prog: ak, seed: 160, col: PAL.accent }); R.pen([[740, 935], [700, 960], [740, 985]], { w: 5, prog: seg(t, r(2, .9), r(2, 1.2)), seed: 161, col: PAL.accent, over: 0 });
  R.text('pull the plastic', 760, 1060, { size: 56, col: PAL.accent, reveal: seg(t, r(2, 1.1), r(2, 1.9)) });
  R.text('press', 820, 420, { size: 54, col: INK2, reveal: seg(t, r(2, 2.0), r(2, 2.5)) }); R.pen([[790, 440], [730, 520]], { w: 3, prog: seg(t, r(2, 2.3), r(2, 2.8)), seed: 170 }); }
// B2: the contact patch, seen from below: flat skin vs ridges (about a third less contact)
function pageB2(t) { drift(t); const k1 = seg(t, s(3) - .3, r(3, .6)), k2 = seg(t, r(3, .6), r(3, 1.8)), cy = 640;
  const A = ell(290, cy, 170, 230, 34), B = ell(790, cy, 170, 230, 34);
  R.wash(A, C.skinD, { a: .7 * k1, smooth: true, step: 1e4, seed: 200 }); R.pen(close(A), { w: 4, prog: k1, seed: 201, closed: true, over: 0, gaps: false, boil: true });
  R.pen(close(B), { w: 4, prog: k2 > 0 ? 1 : 0, seed: 202, closed: true, over: 0, gaps: false, boil: true, a: .5 });
  if (k2 > 0) { g.save(); g.beginPath(); B.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
    for (let i = 0; i < 16; i++) { const y = cy - 240 + i * 31, kk = clamp(k2 * 16 - i); if (kk <= 0) break; const band = [[600, y], [600 + 380 * kk, y + 6], [600 + 380 * kk, y + 26], [600, y + 20]]; R.wash(band, C.skinD, { a: .75, seed: 210 + i, dens: false, blooms: 0, jit: 1.5 }); }
    g.restore(); }
  R.text('no ridges', 290, cy + 300, { size: 56, col: INK2, reveal: seg(t, r(3, .2), r(3, .8)) }); R.text('ridges', 790, cy + 300, { size: 56, col: INK2, reveal: seg(t, r(3, 1.4), r(3, 2.0)) });
 
  R.text('−⅓ contact', 540, 1060, { size: 104, col: PAL.accent, reveal: seg(t, r(3, 2.0), r(3, 2.8)) });
  const lk = seg(t, r(3, 3.6), r(3, 4.4)); if (lk > 0) { R.pen([[460, 1100], [620, 1100]], { w: 4, prog: lk, seed: 220, col: PAL.accent }); } }
// B3: "BUSTED?" stamp, then "not quite": two small sketches of the rough-surface and wet-surface ideas
function pageB3(t) { drift(t); const st = seg(t, s(4) - .1, r(4, .35)), nq = seg(t, r(4, .9), r(4, 1.6));
  const sc = lerp(1.6, 1, eo(st)); if (st > 0) { g.save(); g.translate(540, 520); g.rotate(-.12); g.scale(sc, sc); g.globalAlpha = st;
    R.rect(-270, -90, 540, 150, { w: 8, seed: 230, col: C.stamp }); R.text('BUSTED?', 0, 30, { size: 130, col: C.stamp, weight: 700, halo: false }); g.restore(); }
  R.text('not quite.', 790, 670, { size: 84, col: INK, reveal: nq });
  const k1 = seg(t, r(4, 2.2), r(4, 3.0)), k2 = seg(t, r(4, 3.4), r(4, 4.2));
  // rough: bumpy surface, ridges interlock
  if (k1 > 0) { const base = [], ox = 290, oy = 960; for (let q = 0; q <= 20; q++) { const x = ox - 200 + q * 20; base.push([x, oy + 18 * Math.sin(q * 1.9) + 8 * hash(q)]); }
    R.wash(base.concat([[ox + 200, oy + 90], [ox - 200, oy + 90]]), C.rough, { a: .55 * k1, seed: 240 }); R.pen(base, { w: 3.6, prog: k1, seed: 241, boil: true });
    const pad = []; for (let q = 0; q <= 20; q++) { const x = ox - 170 + q * 17; pad.push([x, oy - 30 + 10 * Math.sin(q * 2.2)]); } R.wash(pad.concat([[ox + 170, oy - 160], [ox - 170, oy - 160]]), C.skin, { a: .6 * k1, seed: 242 }); R.pen(pad, { w: 3.6, prog: k1, seed: 243, boil: true });
    R.text('rough', ox, oy + 150, { size: 60, col: INK2, reveal: k1 }); }
  if (k2 > 0) { const ox = 760, oy = 960; R.wash(R.rectPts(ox - 190, oy, 380, 80), C.plastic, { a: .5 * k2, seed: 250, dens: false }); R.pen([[ox - 190, oy], [ox + 150, oy]], { w: 3.6, prog: k2, seed: 251 });
    const pad = []; for (let q = 0; q <= 20; q++) { const x = ox - 160 + q * 15.5; pad.push([x, oy - 14 + 12 * Math.sin(q * 2.0)]); } R.wash(pad.concat([[ox + 150, oy - 150], [ox - 160, oy - 150]]), C.skin, { a: .6 * k2, seed: 252 }); R.pen(pad, { w: 3.6, prog: k2, seed: 253, boil: true });
    for (let i = 0; i < 6; i++) { const u = (t * .9 + i / 6) % 1, x = ox - 150 + i * 52; R.fillCirc(x, oy - 6, 8, C.water, { a: .8 * k2, seed: 260 + i, blooms: 0, edge: 1 }); R.fillCirc(x + 10 + u * 60, oy + 30 + u * 30, 6 * (1 - u), C.water, { a: .6 * k2, seed: 270 + i, blooms: 0, edge: 1 }); }
    R.text('wet', ox - 60, oy + 150, { size: 60, col: INK2, reveal: k2 }); }
  tag('IDEA', 540, 1080, seg(t, r(4, 4.0), r(4, 4.6)), 280, PAL.accent, 56); }
// C1: the twist: for touch? the fingertip stroking a fabric swatch
function pageC1(t) { const z = eio(seg(t, s(5) - .3, r(5, 2.2))); cam(lerp(1.0, 1.05, z), 540, 900, t);
  const sw = []; for (let q = 0; q <= 24; q++) sw.push([120 + q * 35, 920 + 6 * Math.sin(q * 1.3)]); R.wash(sw.concat([[960, 1060], [120, 1060]]), PAL.violet, { a: .45, seed: 300 });
  for (let i = 0; i < 10; i++) R.pen([[140 + i * 80, 940], [180 + i * 80, 1040]], { w: 2.4, a: .5, seed: 310 + i, over: 0, gaps: false }); R.pen(sw, { w: 3.6, seed: 320 });
  const fx = 460 + 120 * Math.sin(t * 1.3); finger(t, fx, 440, 300, 915, { seed: 12, n: 11 });
  for (let i = 0; i < 3; i++) { const a = seg(t, r(5, .8) + i * .2, r(5, 1.4) + i * .2); R.pen([[fx + 170 + i * 26, 850 - i * 40], [fx + 200 + i * 30, 830 - i * 40]], { w: 4, prog: a, seed: 330 + i, col: C.vib }); }
  R.text('for touch?', 540, 400, { size: 120, col: PAL.accent, reveal: seg(t, r(5, .4), r(5, 1.2)) }); }
// C2: the Scheibert et al. sensor: a ridged sensor slides over a rough surface; ridges turn texture into vibration
function pageC2(t) { drift(t); const sx = 540 + 150 * Math.sin((t - s(6)) * 1.2), vk = seg(t, s(7) - .2, r(7, 1.2));
  const surf = []; for (let q = 0; q <= 48; q++) { const x = 60 + q * 20; surf.push([x, 900 + 7 * Math.sin(q * 2.7) + 5 * Math.sin(q * 5.3 + 1)]); }
  R.wash(surf.concat([[1020, 1000], [60, 1000]]), C.rough, { a: .55, seed: 400 }); R.pen(surf, { w: 3.6, seed: 401 });
  for (let i = 0; i < 26; i++) R.fillCirc(80 + hash(i * 2.3) * 920, 930 + hash(i * 4.1) * 50, 4, INK, { a: .5, seed: 410 + i, blooms: 0, edge: 1 });
  const top = 700, bot = 885, bw = 280; const body = [[sx - bw / 2, top], [sx + bw / 2, top], [sx + bw / 2, bot - 22], [sx - bw / 2, bot - 22]]; R.wash(body, C.steel, { a: .5, seed: 420, dens: false, shade: .3 });
  const teeth = [[sx - bw / 2, bot - 22]]; for (let i = 0; i < 9; i++) { const x = sx - bw / 2 + i * bw / 9; teeth.push([x + bw / 36, bot], [x + bw / 18 * 1.5, bot], [x + bw / 9, bot - 22]); } R.pen(teeth, { w: 3.4, seed: 421, boil: true, over: 0 });
  R.pen([[sx - bw / 2, bot - 22], [sx - bw / 2, top], [sx + bw / 2, top], [sx + bw / 2, bot - 22]], { w: 3.8, seed: 422, boil: true, over: 0 }); R.text('sensor', sx, top + 110, { size: 54, col: INK, reveal: seg(t, r(6, .6), r(6, 1.2)) });
  R.text('ridges', sx - bw / 2 - 90, bot + 70, { size: 48, col: PAL.accent, reveal: seg(t, r(6, 1.6), r(6, 2.2)) }); R.pen([[sx - bw / 2 - 60, bot + 40], [sx - bw / 2 + 10, bot - 6]], { w: 3, prog: seg(t, r(6, 1.8), r(6, 2.3)), seed: 423, col: PAL.accent });
  const ak = seg(t, r(6, 2.6), r(6, 3.4)); R.pen([[sx - 90, 640], [sx + 90, 640]], { w: 4, prog: ak, seed: 424 }); R.pen([[sx + 66, 622], [sx + 90, 640], [sx + 66, 658]], { w: 4, prog: ak, seed: 425, over: 0 }); R.pen([[sx - 66, 622], [sx - 90, 640], [sx - 66, 658]], { w: 4, prog: ak, seed: 426, over: 0 });
  if (vk > 0) { const wv = []; for (let q = 0; q <= 80; q++) { const x = 100 + q * 10, ph = q * .9 - t * 18; wv.push([x, 470 + 46 * Math.sin(ph) * (.7 + .3 * Math.sin(q * .31)) * clamp(vk * 2 - q / 80)]); }
    R.pen(wv, { w: 5, prog: vk, seed: 430, col: C.vib, over: 0, gaps: false }); R.text('vibrations', 540, 380, { size: 66, col: C.vib, reveal: seg(t, r(7, .9), r(7, 1.6)) }); }
  const pk = seg(t, r(7, 3.2), r(7, 4.2)); if (pk > 0) { const px = 820, py = 1060; for (let i = 0; i < 4; i++) R.pen(close(ell(px, py, 26 + i * 12, 16 + i * 8, 22)), { w: 2.6, prog: pk, seed: 440 + i, col: C.rec, closed: true, over: 0, gaps: false, boil: true });
    const pulse = .5 + .5 * Math.sin(t * 14); R.fillCirc(px, py, 10 + 3 * pulse, C.rec, { a: .8 * pk, seed: 450, blooms: 0 });
    R.text('deep touch sensor', 560, 1078, { size: 50, col: INK2, reveal: seg(t, r(7, 3.8), r(7, 4.6)) }); } }
// C3: idea: feel fine textures; three swatches and a fingertip gliding across them
const SW = [['silk', PAL.rose, .5], ['denim', PAL.slate, 2], ['sandpaper', PAL.ochre, 5]];
function pageC3(t) { drift(t); SW.forEach(([lab, col, ro], i) => { const x0 = 90 + i * 310, P = R.rectPts(x0, 800, 280, 260), k = seg(t, s(8) - .2 + i * .25, s(8) + .4 + i * .25);
    R.wash(P, col, { a: .5 * k, seed: 500 + i, dens: false }); R.rect(x0, 800, 280, 260, { w: 3.4, prog: k, seed: 510 + i });
    for (let j = 0; j < ro * 6; j++) R.fillCirc(x0 + 20 + hash(j * 3 + i) * 240, 820 + hash(j * 7 + i) * 220, 2 + ro * .5, INK, { a: .35 * k, seed: 520 + i * 40 + j, blooms: 0, edge: 1 });
    R.text(lab, x0 + 140, 1110, { size: 52, col: INK2, reveal: k }); });
  const fx = 245 + ((t - s(8)) * 260) % 930; finger(t, fx, 440, 230, 820, { seed: 13, n: 10 });
  tag('IDEA', 540, 380, seg(t, r(8, .6), r(8, 1.2)), 530); }
// D1: they form before birth: a curled baby, a month line 1-9, the ridges growing between month 3 and month 6
function baby(t, x, y, k, seed) { const P = ell(x, y, 170, 150, 30); R.wash(ell(x, y, 220, 200, 30), C.womb, { a: .35 * k, smooth: true, step: 1e4, seed });
  R.wash(P, C.skin, { a: .55 * k, smooth: true, step: 1e4, seed: seed + 1 }); R.pen(close(P), { w: 3.6, prog: k, seed: seed + 2, boil: true, closed: true, over: 0, gaps: false });
  const hd = ell(x + 60, y - 70, 80, 74, 24); R.wash(hd, C.skin, { a: .55 * k, smooth: true, step: 1e4, seed: seed + 3 }); R.pen(close(hd), { w: 3.6, prog: k, seed: seed + 4, boil: true, closed: true, over: 0, gaps: false });
  R.pen([[x + 100, y - 50], [x + 112, y - 44]], { w: 3, prog: k, seed: seed + 5 }); R.pen([[x + 10, y + 10], [x + 80, y + 40], [x + 110, y + 20]], { w: 3.4, prog: k, seed: seed + 6, boil: true }); R.circle(x + 118, y + 14, 14, { w: 3, prog: k, seed: seed + 7 }); }
function pageD1(t) { drift(t); baby(t, 330, 560, seg(t, s(9) - .3, r(9, .9)), 600);
  const ly = 900, x0 = 110, x1 = 870, mx = m => lerp(x0, x1, (m - 1) / 8), lk = seg(t, r(9, 1.0), r(9, 1.8)); R.pen([[x0, ly], [x1, ly]], { w: 4, prog: lk, seed: 610 });
  for (let m = 1; m <= 9; m++) { const kk = seg(t, r(9, 1.0) + m * .08, r(9, 1.3) + m * .08); R.pen([[mx(m), ly - 14], [mx(m), ly + 14]], { w: 3, prog: kk, seed: 620 + m }); R.text(String(m), mx(m), ly + 64, { size: 48, col: INK2, reveal: kk }); }
  R.text('months', 490, ly + 130, { size: 50, col: INK2, reveal: lk });
  const grow = seg(t, r(10, .3), r(10, 4.2)), mk = seg(t, s(10) - .1, r(10, .5)); if (mk > 0) { const m = lerp(3, 6, grow); R.wash(R.rectPts(mx(3), ly - 18, mx(m) - mx(3) + 2, 36), PAL.accent, { a: .5, seed: 630, dens: false });
    R.fillCirc(mx(m), ly, 16, PAL.accent, { a: .9 * mk, seed: 631, blooms: 0 }); R.text('start', mx(3), ly - 40, { size: 46, col: PAL.accent, reveal: mk }); R.text('done', mx(6), ly - 40, { size: 46, col: PAL.accent, reveal: seg(t, r(10, 3.6), r(10, 4.2)) }); }
  const ck = seg(t, r(9, .8), r(9, 1.6)); if (ck > 0) { const cx = 700, cy = 560, cr = 150; R.wash(ell(cx, cy, cr, cr, 30), C.skin, { a: .55, smooth: true, step: 1e4, seed: 640 });
    g.save(); g.beginPath(); g.arc(cx, cy, cr - 4, 0, 6.29); g.clip(); fp(cx, cy + 20, 120, 'loop', 41, grow, { n: 12, w: 4, col: '#7a4a32' }); g.restore(); R.circle(cx, cy, cr, { w: 4.5, prog: ck, seed: 641 }); R.pen([[cx - 120, cy + 90], [440, 600]], { w: 2.6, prog: ck, seed: 642, a: .6 }); } }
// D2: genes -> the general pattern; the womb -> the details
function helix(x, y, h, k, seed) { const A = [], B = []; for (let q = 0; q <= 30; q++) { const yy = y + q / 30 * h, ph = q / 30 * 9 + R.t * 1.2; A.push([x + 46 * Math.sin(ph), yy]); B.push([x - 46 * Math.sin(ph), yy]); }
  R.pen(A, { w: 4, prog: k, seed, col: C.dna }); R.pen(B, { w: 4, prog: k, seed: seed + 1, col: PAL.slate }); for (let q = 1; q < 30; q += 3) if (q / 30 < k) R.pen([A[q], B[q]], { w: 2.4, seed: seed + 2 + q, a: .6, over: 0, gaps: false }); }
function pageD2(t) { drift(t); const k1 = seg(t, s(11) - .3, r(11, .9)), k2 = seg(t, r(11, 2.4), r(11, 3.4));
  helix(180, 420, 300, k1, 700); R.text('genes', 180, 790, { size: 64, col: C.dna, reveal: k1 }); R.pen([[260, 570], [360, 570]], { w: 4, prog: k1, seed: 710 }); R.pen([[340, 556], [362, 570], [340, 584]], { w: 4, prog: k1, seed: 711, over: 0 });
  [['whorl', 520], ['loop', 690], ['arch', 860]].forEach(([ty, x], i) => { const kk = seg(t, r(11, .6) + i * .3, r(11, 1.4) + i * .3); if (kk <= 0) return; R.wash(ell(x, 570, 70, 92, 26), C.skin, { a: .5 * kk, smooth: true, step: 1e4, seed: 720 + i });
    g.save(); g.beginPath(); g.ellipse(x, 570, 68, 90, 0, 0, 6.29); g.clip(); fp(x, 580, 60, ty, 50 + i, kk, { n: 10, w: 2.4, col: '#7a4a32' }); g.restore(); R.text(ty, x, 710, { size: 46, col: INK2, reveal: kk }); });
  R.text('the pattern', 690, 400, { size: 58, col: C.dna, reveal: seg(t, r(11, 1.4), r(11, 2.0)) });
  if (k2 > 0) { R.wash(ell(180, 980, 110, 100, 26), C.womb, { a: .45 * k2, smooth: true, step: 1e4, seed: 730 }); R.text('womb', 180, 1000, { size: 60, col: PAL.accent, reveal: k2 }); R.pen([[300, 980], [400, 980]], { w: 4, prog: k2, seed: 731 }); R.pen([[378, 966], [400, 980], [378, 994]], { w: 4, prog: k2, seed: 732, over: 0 });
    const cx = 610, cy = 990; R.wash(ell(cx, cy, 170, 110, 28), C.skin, { a: .5, smooth: true, step: 1e4, seed: 733 }); g.save(); g.beginPath(); g.ellipse(cx, cy, 168, 108, 0, 0, 6.29); g.clip(); fp(cx, cy + 260, 300, 'loop', 52, 1, { n: 14, w: 3.4, col: '#7a4a32' }); g.restore();
    const E = endings(cx, cy + 260, 300, 'loop', 52, 14).filter(([x, y]) => Math.hypot((x - cx) / 160, (y - cy) / 100) < .85).slice(0, 3); E.forEach(([x, y], i) => R.circle(x, y, 22, { w: 3.4, prog: seg(t, r(11, 3.2) + i * .3, r(11, 3.7) + i * .3), seed: 740 + i, col: PAL.accent }));
    R.text('the details', 610, 860, { size: 58, col: PAL.accent, reveal: seg(t, r(11, 3.4), r(11, 4.0)) }); } }
// D3: identical twins, different prints
function kid(x, y, k, seed) { const hd = ell(x, y, 56, 60, 22); R.wash(hd, C.skin, { a: .55 * k, smooth: true, step: 1e4, seed }); R.pen(close(hd), { w: 3.6, prog: k, seed: seed + 1, boil: true, closed: true, over: 0, gaps: false });
  R.pen([[x - 52, y - 20], [x - 20, y - 66], [x + 30, y - 64], [x + 54, y - 18]], { w: 5, prog: k, seed: seed + 2, col: PAL.rope, boil: true }); R.fillCirc(x - 18, y, 5, INK, { a: k, seed: seed + 3, blooms: 0 }); R.fillCirc(x + 18, y, 5, INK, { a: k, seed: seed + 4, blooms: 0 });
  R.pen([[x - 14, y + 26], [x, y + 32], [x + 14, y + 26]], { w: 3, prog: k, seed: seed + 5 }); const bd = [[x - 70, y + 180], [x - 54, y + 74], [x + 54, y + 74], [x + 70, y + 180]]; R.wash(bd, PAL.sky, { a: .55 * k, seed: seed + 6 }); R.pen(bd, { w: 3.6, prog: k, seed: seed + 7, boil: true }); }
function pageD3(t) { drift(t); const k = seg(t, s(12) - .3, r(12, .5)); kid(300, 400, k, 800); kid(780, 400, k, 820); R.text('=', 540, 440, { size: 110, col: INK2, reveal: k });
  const pk = seg(t, r(12, .6), r(12, 1.8)); [[300, 61], [780, 67]].forEach(([x, sd], i) => { const cy = 840; R.wash(ell(x, cy, 160, 200, 30), C.skin, { a: .5 * pk, smooth: true, step: 1e4, seed: 830 + i }); g.save(); g.beginPath(); g.ellipse(x, cy, 158, 198, 0, 0, 6.29); g.clip(); fp(x, cy + 20, 150, 'whorl', sd, pk, { n: 12, w: 3.2, col: '#7a4a32' }); g.restore(); R.pen(close(ell(x, cy, 160, 200, 30)), { w: 3.6, prog: pk, seed: 840 + i, closed: true, over: 0, gaps: false });
    const E = endings(x, cy + 20, 150, 'whorl', sd).filter(([ex, ey]) => Math.hypot((ex - x) / 150, (ey - cy) / 190) < .8).slice(0, 2); E.forEach(([ex, ey], j) => R.circle(ex, ey, 22, { w: 3.4, prog: seg(t, r(12, 2.0) + j * .3, r(12, 2.5) + j * .3), seed: 850 + i * 5 + j, col: PAL.accent })); });
  R.text('≠', 540, 880, { size: 140, col: PAL.accent, reveal: seg(t, r(12, 1.6), r(12, 2.2)) }); }
// E: the payoff list
function pageE(t) { drift(t); const L = [['grip on smooth things', 0, r(13, .4)], ['grip on rough or wet surfaces', 1, r(13, 3.2)], ['a sharper sense of touch', 1, r(13, 6.0)]];
  finger(t, 790, 420, 200, 700, { seed: 14, n: 10, k: seg(t, s(13) - .3, r(13, .5)) });
  L.forEach(([txt, ok, t0], i) => { const y = 740 + i * 140, k = seg(t, t0, t0 + .8); if (k <= 0) return; R.rect(90, y - 50, 56, 56, { w: 3.6, prog: k, seed: 900 + i });
    R.text(txt, 180, y, { size: 62, col: ok ? INK : INK2, reveal: k, align: 'left' });
    if (ok) { check(96, y - 30, seg(t, t0 + .7, t0 + 1.1), 910 + i); R.text('idea', 180 + R.measure(txt, 62) + 20, y, { size: 44, col: PAL.accent, reveal: seg(t, t0 + 1.0, t0 + 1.5), align: 'left' }); }
    else { R.pen([[90, y - 50], [146, y + 6]], { w: 5, prog: seg(t, t0 + .7, t0 + 1.0), seed: 920, col: C.stamp, over: 0 }); R.pen([[146, y - 50], [90, y + 6]], { w: 5, prog: seg(t, t0 + .9, t0 + 1.2), seed: 921, col: C.stamp, over: 0 }); cross(176, y - 20, 176 + R.measure(txt, 62), seg(t, t0 + 1.0, t0 + 1.6), 922); } });
  R.text('probably not:', 90, 640, { size: 54, col: INK2, reveal: seg(t, r(13, .1), r(13, .6)), align: 'left' }); }
// F: the question: press a fingertip, yes or no
function pageF(t) { const z = eio(seg(t, s(14) - .3, r(14, 2.5))); cam(lerp(1, 1.06, z), 540, 900, t); finger(t, 540, 420, 420, 900 + 170 / lerp(1, 1.06, z), { seed: 15, type: 'loop', n: 13 });
  for (let i = 0; i < 4; i++) { const u = (t * .8 + i / 4) % 1; R.circle(540, 640, 230 + u * 100, { w: 3, a: .5 * (1 - u), seed: 950 + i }); } }
function margin(t) {
  const N = [[0, s(2) - .3, 'Tues. 9:40 pm, my own thumb, a loupe'], [s(2) - .3, s(3) - .2, 'test: Manchester, 2009'], [s(3) - .2, s(4) - .2, 'contact patch, from below'], [s(4) - .2, s(5) - .2, 'idea 1: grip where it counts'],
    [s(5) - .2, s(6) - .2, 'the twist'], [s(6) - .2, s(8) - .2, 'test: a ridged sensor, 2009'], [s(8) - .2, s(9) - .2, 'idea 2: feel fine textures'], [s(9) - .2, s(11) - .2, 'made before birth'],
    [s(11) - .2, s(12) - .2, 'pattern vs details'], [s(12) - .2, s(13) - .2, 'identical twins'], [s(13) - .2, s(14) - .2, 'so, why the ridges?'], [s(14) - .2, s(15) - .3, 'can you feel them?']];
  screen(); N.forEach(([a, b, txt], i) => { if (t < a || t >= b) return; R.text(txt, 80, 330, { size: i === 0 ? 46 : 54, col: i === 0 ? INK2 : INK, reveal: seg(t, a + .1, a + .1 + Math.min(1.2, txt.length * .03)), align: 'left', weight: i === 0 ? 500 : 600 }); });
  if (t >= s(14) - .2 && t < s(15) - .3) [['yes', 640], ['no', 800]].forEach(([w, x], i) => { const k = seg(t, r(14, .8) + i * .3, r(14, 1.3) + i * .3); R.rect(x - 60, 296, 40, 40, { w: 3, prog: k, seed: 1800 + i }); R.text(w, x - 8, 334, { size: 60, reveal: k, align: 'left' }); }); }
function parse(c) { const o = []; c.split('**').forEach((x, i) => x && x.split(/(\s+)/).forEach(w => w && o.push({ w, b: i % 2 === 1 }))); return o; }
function caption(t) {
  const ph = PH.findLast(p => t >= p.start - .1); if (!ph || ph.i === PH.length - 1) return; const nx = PH[ph.i + 1].start, k = seg(t, ph.start - .1, ph.start + .5), out = 1 - seg(t, nx - .2, nx - .05); if (k <= 0 || out <= 0) return;
  screen(); g.save(); const size = 58; g.font = `600 ${size}px "Caveat"`; const words = parse(ph.cap), lines = [[]]; let cw = 0;
  for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > 760 && !/^\s+$/.test(w.w) && lines.at(-1).length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines.at(-1).push(w); cw += m; } }
  const lh = 64, y0 = 1290 - (lines.length - 1) * lh / 2 + 18, total = lines.reduce((a, l) => a + l.length, 0); let idx = 0; g.globalAlpha = out;
  lines.forEach((ln, li) => { const tw = ln.reduce((a, w) => a + g.measureText(w.w).width, 0); let x = 520 - tw / 2; ln.forEach(w => { const show = idx / total < k * 1.05; idx++; if (show) { g.lineJoin = 'round'; g.strokeStyle = rgba(PAPER, .9); g.lineWidth = 12; g.strokeText(w.w, x, y0 + li * lh); g.fillStyle = w.b ? PAL.accent : rgba(INK, .95); g.fillText(w.w, x, y0 + li * lh); } x += g.measureText(w.w).width; }); });
  g.restore(); }
function endcard(t) { const t0 = s(15) - .3; screen();
  R.text('Follow for more of', 540, 700, { size: 92, reveal: seg(t, t0 + .1, t0 + .8) }); R.text('how it really works.', 540, 820, { size: 110, reveal: seg(t, t0 + .5, t0 + 1.3), col: PAL.accent });
  R.pen([[300, 852], [540, 848], [780, 844]], { w: 3, prog: seg(t, t0 + 1.0, t0 + 1.5), seed: 1900 });
  R.text("A new 'wait, really?' every day.", 540, 930, { size: 52, col: INK2, reveal: seg(t, t0 + 1.2, t0 + 1.6), weight: 500 }); R.text('@howitreallyworkstudio', 540, 1010, { size: 44, reveal: seg(t, t0 + 1.4, t0 + 1.8), weight: 500 });
  cam(1, 540, 960, t); const k = seg(t, t0 + .4, t0 + 1.6); R.wash(ell(540, 500, 90, 115, 26), C.skin, { a: .5 * k, smooth: true, step: 1e4, seed: 1950 }); g.save(); g.beginPath(); g.ellipse(540, 500, 88, 113, 0, 0, 6.29); g.clip(); fp(540, 510, 85, 'whorl', 11, k, { n: 11, w: 2.6, col: '#7a4a32' }); g.restore(); }
function turn(t, t0, oldF, newF) { const u = eio(seg(t, t0, t0 + .55)); if (u <= 0) { oldF(t); return; } if (u >= 1) { newF(t); return; }
  oldF(t); const ex = W * (1 - u); screen(); g.save(); g.beginPath(); g.rect(ex, 0, W - ex + 10, H); g.clip(); g.drawImage(R.paperImg, 0, 0); newF(t); g.restore();
  screen(); const gr = g.createLinearGradient(ex - 60, 0, ex + 20, 0); gr.addColorStop(0, 'rgba(60,40,20,0)'); gr.addColorStop(1, 'rgba(60,40,20,.28)'); g.fillStyle = gr; g.fillRect(ex - 60, 0, 80, H); g.fillStyle = 'rgba(255,250,240,.6)'; g.fillRect(ex, 0, 3, H); }
const PAGES = () => [[0, pageA], [s(2) - .4, pageB1], [s(3) - .4, pageB2], [s(4) - .4, pageB3], [s(5) - .4, pageC1], [s(6) - .4, pageC2], [s(8) - .4, pageC3], [s(9) - .4, pageD1], [s(11) - .4, pageD2], [s(12) - .4, pageD3], [s(13) - .4, pageE], [s(14) - .4, pageF], [s(15) - .4, endcard]];
function scene(t) {
  R.begin(t);
  const L = PAGES(); let i = 0; for (let k = 0; k < L.length; k++) if (t >= L[k][0]) i = k;
  if (i > 0) turn(t, L[i][0], L[i - 1][1], L[i][1]); else L[0][1](t);
  if (t < s(15) - .4) margin(t);
  caption(t); screen(); R.finish();
}
window.DUR = TOT;
window.seek = t => { scene(t); const lp = seg(t, TOT - .5, TOT); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); scene(0); const f0 = g.getImageData(0, 0, W, H); const k = .3 * ss(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { R.begin(2); cam(1.1, 520, 820, 2); finger(2, 600, 360, 470, 1130, { seed: 11 }); screen();
  R.text('Why the', 80, 420, { size: 150, align: 'left' }); R.text('ridges?', 80, 570, { size: 170, align: 'left', col: PAL.accent }); R.text('not for grip (mostly)', 540, 1500, { size: 76 }); R.finish(); };
window.seek(0); window.ready = true; window.READY = true;
