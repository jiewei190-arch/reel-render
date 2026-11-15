// t_owl.js: "How owls fly almost silently" in template #4 crayon-book (lemo-opuscar/styles/crayon-book) via reels/styles/crayon.
// A picture-book night page drawn live in wax crayon: indigo sky under one ultramarine wash, white-wax stars that resist it,
// a moon with a sleepy face, numbers in the sky (child logic), colouring as the action, the book's printed words on a ragged paper patch.
import * as K from './styles/crayon/crayon.js';
const { line, fill, dab, wash, text, subtitle, knock, ellipse, handCircle, fluff, bez, smooth, tube, xf, prog, clamp, lerp, hash } = K;
await Promise.all(['400 54px "Patrick Hand"', '700 80px "Gaegu"'].map(f => document.fonts.load(f)));
const bz = (c, n) => bez(c.length === 3 ? [c[0], c[1], c[1], c[2]] : c, n);   // quadratic-style 3-point curves
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
// crayon box (outline indigo-plum, never black) + one watercolour: ultramarine for night
const P = { out: '#33295a', sky: '#3c4f9a', sky2: '#2c3b7c', moon: '#f2c94c', moonS: '#f08a3c', brown: '#9a6b3f', tan: '#d9a86a', cream: '#f3e2bd', grass: '#5a9a4a', grass2: '#3f7a3a',
  grey: '#a6abb3', grey2: '#6e7380', pink: '#ff9fbb', red: '#e8483b', teal: '#4cb8c4', white: '#ffffff', yellow: '#ffd34d' };
const R = K.createCrayon(document.getElementById('c'), { wash: [0.42, 0.50, 0.86], vignette: .26 });
const GR = 1360;   // ground line

// ---------- the page background: crayon sky + white-wax stars + one ultramarine wash; grass; moon ----------
function page(t, o = {}) {
  const sky = [[-20, -20], [1100, -20], [1100, GR + 30], [-20, GR + 30]];
  fill(R.bg, sky, { col: P.sky, p: .55, gap: 13, w: 12, ang: .05, seed: 3 });
  for (let k = 0; k < 7; k++) { const y = 160 + k * 170 + 30 * hash(k); fill(R.bg, [[-20, y], [1100, y - 20], [1100, y + 46], [-20, y + 60]], { col: P.sky2, p: .75, gap: 7, w: 9, ang: .02, seed: 30 + k }); }
  for (let i = 0; i < 46; i++) { const x = hash(i * 3.3) * 1060 + 10, y = hash(i * 7.1) * (GR - 120) + 40, r = 7 + hash(i) * 7; const st = []; for (let j = 0; j <= 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? r * .45 : r; st.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } fill(R.bg, st, { col: P.white, p: 1, gap: 2.5, w: 4, seed: 60 + i, cross: true }); }
  wash(R.wash, sky, { p: .62 });
  const gr = []; for (let x = -20; x <= 1100; x += 20) gr.push([x, GR - 18 * Math.abs(Math.sin(x / 120)) - 8 * Math.sin(x / 47)]);
  fill(R.bg, [...gr, [1100, 1940], [-20, 1940]], { col: P.grass, p: .8, gap: 9, w: 11, ang: 1.2, seed: 7 });
  line(R.bg, gr, { col: P.grass2, w: 6, p: .9, seed: 8 });
  for (let i = 0; i < 26; i++) { const x = 20 + i * 42 + 10 * hash(i), y = GR - 6 - 10 * hash(i * 2); line(R.bg, [[x, y + 20], [x + 6 * (hash(i * 5) - .5), y - 30 - 20 * hash(i * 9)]], { col: P.grass2, w: 5, p: .9, seed: 90 + i }); }
  if (o.moon !== false) moon(o.mx ?? 935, o.my ?? 165, o.mr ?? 78, t, o.moonFace);
}
function moon(x, y, r, t, face = 'sleepy') {
  const c = handCircle(x, y, r, 11); knock(R.knock, c); fill(R.fg, c, { col: P.moon, p: .9, gap: 7, w: 10, seed: 12 }); line(R.fg, c, { col: P.moonS, w: 6, seed: 13 });
  [[-.4, -.3, .18], [.35, .25, .14], [-.1, .45, .1]].forEach(([a, b, k], i) => dab(R.fg, x + a * r, y + b * r, k * r, { col: P.moonS, p: .55, seed: 14 + i }));
  if (face) { for (const sx of [-1, 1]) { line(R.fg, bz([[x + sx * .42 * r - 18, y - .05 * r], [x + sx * .42 * r, y + .06 * r], [x + sx * .42 * r + 18, y - .05 * r]], 8), { w: 6, seed: 20 + sx }); } dab(R.fg, x - .55 * r, y + .25 * r, 16, { col: P.moonS, p: .5, seed: 24 }); dab(R.fg, x + .55 * r, y + .25 * r, 16, { col: P.moonS, p: .5, seed: 25 }); }
}

// ---------- the owl (original): origin = body centre; flying pose; flap 0/1 = the two key drawings (substitution on the beat) ----------
function owl(cx, cy, sc, o = {}) {
  const { flap = 0, t0 = -9, dur = .8, seed = 100, tilt = 0, perch = false, blink = false, look = 0 } = o, d = dur;
  const X = pts => xf(pts, { x: cx, y: cy, s: sc, r: tilt });
  const body = X(ellipse(0, 40, 120, 150, 48));
  const head = X(handCircle(0, -120, 105, seed, .1));
  const wingUp = flap === 0, wing = sx => X(smooth([[sx * 80, -10], [sx * 210, wingUp ? -190 : 60], [sx * 360, wingUp ? -230 : 150], [sx * 400, wingUp ? -150 : 230], [sx * 330, wingUp ? -60 : 260], [sx * 250, wingUp ? 0 : 200], [sx * 150, 70]], 8));
  if (!perch) for (const sx of [-1, 1]) { const w = wing(sx); knock(R.knock, w); fill(R.fg, w, { col: P.brown, p: .88, gap: 8, w: 10, ang: .9 * sx, seed: seed + 3 + sx, t0: t0 + d * .2, dur: d * .5 }); line(R.fg, w, { w: 7, seed: seed + 5 + sx, closed: true, t0, dur: d * .5 });
    for (let k = 1; k < 4; k++) { const a = w[Math.floor(w.length * (.25 + k * .14))], b = X([[sx * (150 + k * 50), wingUp ? -40 + k * 10 : 90 + k * 10]])[0]; line(R.fg, [b, a], { col: P.tan, w: 5, p: .9, seed: seed + 10 + k + sx * 7, t0: t0 + d * .5, dur: d * .3 }); } }
  else for (const sx of [-1, 1]) { const w = X(smooth([[sx * 70, -20], [sx * 130, 40], [sx * 120, 170], [sx * 60, 200]], 8, false)); line(R.fg, w, { w: 7, seed: seed + 60 + sx, t0, dur: d * .5 }); }
  [body, head].forEach(p => knock(R.knock, p));
  fill(R.fg, body, { col: P.tan, p: .88, gap: 8, w: 10, seed: seed + 20, t0: t0 + d * .2, dur: d * .5 });
  for (let k = 0; k < 6; k++) { const p0 = X([[-60 + (k % 3) * 60, 20 + Math.floor(k / 3) * 60]])[0]; line(R.fg, bz([[p0[0] - 12, p0[1]], [p0[0], p0[1] + 12], [p0[0] + 12, p0[1]]], 6), { col: P.brown, w: 5, seed: seed + 30 + k, t0: t0 + d * .6, dur: .2 }); }
  fill(R.fg, head, { col: P.brown, p: .88, gap: 8, w: 10, seed: seed + 21, t0: t0 + d * .2, dur: d * .5 });
  const disc = X(smooth([[0, -60], [-60, -150], [-95, -125], [-90, -70], [0, -40], [90, -70], [95, -125], [60, -150]], 6));
  fill(R.fg, disc, { col: P.cream, p: .95, gap: 6, w: 9, seed: seed + 22, t0: t0 + d * .4, dur: d * .4 });
  line(R.fg, body, { w: 7.5, seed: seed + 23, closed: true, t0, dur: d * .5 }); line(R.fg, head, { w: 8, seed: seed + 24, t0, dur: d * .5 });
  for (const sx of [-1, 1]) { const tuft = X([[sx * 55, -205], [sx * 85, -265], [sx * 95, -195]]); knock(R.knock, tuft); fill(R.fg, tuft, { col: P.brown, p: .95, gap: 5, w: 7, seed: seed + 40 + sx }); line(R.fg, tuft, { w: 6, seed: seed + 42 + sx, t0, dur: d * .4 }); }
  for (const sx of [-1, 1]) { const [ex, ey] = X([[sx * 45, -115]])[0]; const er = 34 * sc;
    if (blink) { line(R.fg, [[ex - er, ey], [ex + er, ey]], { w: 7, seed: seed + 50 + sx }); continue; }
    const eyeC = handCircle(ex, ey, er, seed + 52 + sx); fill(R.fg, eyeC, { col: P.yellow, p: 1, gap: 4, w: 7, seed: seed + 54 + sx }); line(R.fg, eyeC, { w: 6, seed: seed + 56 + sx });
    dab(R.fg, ex + look * er * .3, ey, er * .48, { col: P.out, seed: seed + 58 + sx }); dab(R.fg, ex + look * er * .3 + er * .18, ey - er * .2, er * .14, { col: P.white, p: 1, seed: seed + 60 + sx }); }
  const beak = X([[-14, -85], [14, -85], [0, -52]]); knock(R.knock, beak); fill(R.fg, beak, { col: P.moonS, p: 1, gap: 3, w: 6, seed: seed + 70, cross: true }); line(R.fg, beak, { w: 5, seed: seed + 71, closed: true });
  if (!perch) for (const sx of [-1, 1]) { const ft = X([[sx * 30, 180], [sx * 36, 215]]); line(R.fg, ft, { col: P.moonS, w: 9, seed: seed + 80 + sx }); }
}
function mouse(x, y, sc, o = {}) { const { seed = 300, look = 0, eat = 0 } = o;
  const body = xf(ellipse(0, 0, 70, 46, 36), { x, y, s: sc }), head = xf(handCircle(-70, -14, 36, seed), { x, y, s: sc });
  [body, head].forEach(p => knock(R.knock, p)); fill(R.fg, body, { col: P.grey, p: .9, gap: 6, w: 8, seed }); fill(R.fg, head, { col: P.grey, p: .9, gap: 6, w: 8, seed: seed + 1 });
  line(R.fg, body, { w: 6, seed: seed + 2, closed: true }); line(R.fg, head, { w: 6, seed: seed + 3 });
  for (const [ex, ey] of [[-78, -52], [-48, -50]]) { const ear = xf(handCircle(ex, ey, 22, seed + ex), { x, y, s: sc }); knock(R.knock, ear); fill(R.fg, ear, { col: P.pink, p: .9, gap: 4, w: 6, seed: seed + 5 }); line(R.fg, ear, { w: 5, seed: seed + 6 }); }
  const [ex, ey] = xf([[-86 + look * 6, -20]], { x, y, s: sc })[0]; dab(R.fg, ex, ey, 6 * sc, { col: P.out, seed: seed + 7 });
  line(R.fg, xf(bz([[70, 0], [130, -10], [150, 30], [190, 20]], 10), { x, y, s: sc }), { col: P.pink, w: 5, seed: seed + 8 });
  if (eat) { const sd = xf(ellipse(-112, 6 + Math.sin(eat * 9) * 3, 11, 8, 16), { x, y, s: sc }); fill(R.fg, sd, { col: P.tan, p: 1, gap: 3, w: 5, seed: seed + 9 }); line(R.fg, sd, { w: 4, seed: seed + 10, closed: true }); } }
// crayon sky numbers (child logic, like the demo's "1 2 3 4 5")
function skyNum(n, x, y, k, col = P.yellow) { if (k <= 0) return; text(R.fg, String(n), x, y, { font: 'Gaegu', weight: 700, size: 130, col, reveal: k, seed: 500 + n }); }
function letter(str, x, y, o = {}) { text(R.fg, str, x, y, { font: 'Gaegu', weight: 700, size: o.size ?? 96, col: o.col ?? P.yellow, reveal: o.reveal ?? 1, seed: o.seed ?? 600, align: o.align }); }
// big wing diagram: airflow lines, back-edge turbulence, owl tricks
function wingDiagram(t, o = {}) { const { owlW = false, comb = 0, fringe = 0, velvet = 0, calm = 0, noise = 1 } = o;
  const top = smooth([[150, 760], [300, 650], [520, 610], [760, 650], [930, 760]], 10, false), bot = smooth([[150, 760], [400, 790], [700, 800], [930, 760]], 10, false);
  const wingP = [...top, ...bot.slice().reverse()]; knock(R.knock, wingP);
  fill(R.fg, wingP, { col: owlW ? P.brown : P.grey, p: .88, gap: 8, w: 10, seed: 700 }); line(R.fg, wingP, { w: 8, seed: 701, closed: true });
  if (velvet > 0) for (let i = 0; i < 40 * velvet; i++) { const u = hash(i * 3.1), x = lerp(220, 880, u), y = lerp(680, 760, hash(i * 7.7)) - 40 * Math.sin(u * Math.PI); dab(R.fg, x, y, 7, { col: P.cream, p: .9, seed: 710 + i }); }
  if (comb > 0) { const n = Math.floor(18 * comb); for (let i = 0; i < n; i++) { const a = top[Math.floor(i / 18 * top.length * .55)]; line(R.fg, [[a[0], a[1]], [a[0] - 34, a[1] - 22]], { w: 5, seed: 760 + i }); } }
  if (fringe > 0) { const n = Math.floor(16 * fringe); for (let i = 0; i < n; i++) { const u = .55 + i / 16 * .45, a = top[Math.min(top.length - 1, Math.floor(u * top.length))], b = bot[Math.min(bot.length - 1, Math.floor(u * bot.length))]; const m = [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)];
    if (u > .9) for (let j = 0; j < 4; j++) line(R.fg, bz([[930, 760], [960 + j * 12, 740 + j * 14], [1000 + j * 10, 750 + j * 18]], 8), { col: P.tan, w: 4, seed: 790 + j }); } }
  // airflow lines left to right; turbulence curls behind the back edge (shrink with calm)
  for (let k = 0; k < 5; k++) { const y0 = 520 + k * 70 + (k > 2 ? 230 : 0); const pts = []; for (let x = -10; x <= 160; x += 20) pts.push([x, y0]); const sh = k < 3 ? -1 : 1; pts.push([300, y0 + sh * 40 + (k > 2 ? -40 : 30)], [600, (k < 3 ? 560 : 850) + k * 10], [940, y0 + (k < 3 ? 160 : -20)]); line(R.fg, smooth(pts, 6, false), { col: P.white, w: 5, p: .9, seed: 820 + k }); }
  const cur = 1 - calm; for (let c = 0; c < 4; c++) { const cx0 = 990 + (c % 2) * 50, cy0 = 640 + c * 70, rr = (26 + 10 * c) * (.3 + .7 * cur); const sp = []; for (let j = 0; j <= 24; j++) { const a = j * .5 + K.CLOCK.td * 6 * (c % 2 ? 1 : -1), r = rr * (1 - j / 30); sp.push([cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r]); } line(R.fg, sp, { col: P.white, w: 5, p: .9, seed: 840 + c }); }
  if (noise > 0) for (let k = 0; k < 3; k++) { const z = []; for (let j = 0; j <= 8; j++) z.push([880 + j * 22, 520 - k * 40 + (j % 2 ? -18 : 18) * noise]); line(R.fg, z, { col: P.red, w: 6, p: .95, seed: 870 + k }); }
}

// a giant flight feather (diagonal): shaft, vane, barbs; comb teeth on the front edge, soft fringe on the back edge, velvet fluff
function feather(t, o = {}) { const { comb = 0, fringe = 0, velvet = 0, calm = 0, airCalm = 0, brush = 0 } = o;
  const A = [130, 1180], B = [960, 560]; const shaft = [A, B]; const nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny), ux = nx / nl, uy = ny / nl;
  const pt = (u, d) => [lerp(A[0], B[0], u) + ux * d, lerp(A[1], B[1], u) + uy * d];
  const front = [], back = []; for (let i = 0; i <= 20; i++) { const u = i / 20, wd = Math.sin(Math.PI * Math.min(1, u * 1.15)) * 1; front.push(pt(u, -70 * wd)); back.push(pt(u, 150 * wd)); }
  const vane = [...front, ...back.slice().reverse()]; knock(R.knock, vane); fill(R.fg, vane, { col: P.brown, p: .9, gap: 9, w: 11, ang: -.6, seed: 1100 }); line(R.fg, vane, { w: 7, seed: 1101, closed: true });
  line(R.fg, shaft, { w: 9, col: P.cream, seed: 1102 }); for (let i = 1; i < 16; i++) { const u = i / 16; line(R.fg, [pt(u, 0), pt(u + .04, 130 * Math.sin(Math.PI * u))], { col: P.tan, w: 4, p: .9, seed: 1110 + i }); }
  if (comb > 0) for (let i = 0; i < 18 * comb; i++) { const u = .08 + i / 18 * .84, q = pt(u, -70 * Math.sin(Math.PI * Math.min(1, u * 1.15))); line(R.fg, [q, [q[0] - ux * 70 - 16, q[1] - uy * 70]], { w: 8, col: P.cream, seed: 1130 + i }); line(R.fg, [q, [q[0] - ux * 70 - 16, q[1] - uy * 70]], { w: 3, seed: 1150 + i }); }
  if (fringe > 0) for (let i = 0; i < 22 * fringe; i++) { const u = .08 + i / 22 * .84, q = pt(u, 150 * Math.sin(Math.PI * Math.min(1, u * 1.15))); line(R.fg, bz([q, [q[0] + ux * 30, q[1] + uy * 30 + 14], [q[0] + ux * 60, q[1] + uy * 60 + 26], [q[0] + ux * 90 + 10 * Math.sin(i), q[1] + uy * 90 + 30]], 8), { col: P.cream, w: 6, seed: 1160 + i }); }
  if (velvet > 0) for (let i = 0; i < 60 * velvet; i++) { const u = .1 + hash(i * 3.1) * .8, d = (hash(i * 7.7) - .3) * 140 * Math.sin(Math.PI * u); const q = pt(u, d); dab(R.fg, q[0], q[1], 8, { col: P.cream, p: .9, seed: 1200 + i }); }
  // air lines arriving at the front edge (straighter once combed); turbulence swirls past the back edge (shrink with calm)
  for (let k = 0; k < 4; k++) { const y0 = 420 + k * 90, wig = 26 * (1 - airCalm); const pts = []; for (let x = -10; x <= 600; x += 40) pts.push([x, y0 + Math.sin(x / 50 + k + K.CLOCK.td * 4) * wig + x * .3]); line(R.fg, pts, { col: P.white, w: 5, p: .9, seed: 1250 + k }); }
  for (let c = 0; c < 4; c++) { const q = pt(.3 + c * .18, 220), rr = (34 + 8 * c) * (.25 + .75 * (1 - calm)); const sp = []; for (let j = 0; j <= 24; j++) { const a = j * .5 + K.CLOCK.td * 6 * (c % 2 ? 1 : -1), r = rr * (1 - j / 30); sp.push([q[0] + Math.cos(a) * r, q[1] + Math.sin(a) * r]); } line(R.fg, sp, { col: P.white, w: 5, p: .9, seed: 1270 + c }); }
  if (brush > 0) { const bx = 860, by = 960; const handle = [[bx - 200, by + 60], [bx - 10, by - 6], [bx, by + 12], [bx - 196, by + 80]]; knock(R.knock, handle); fill(R.fg, handle, { col: P.red, p: .95, gap: 5, w: 7, seed: 1290, draw: brush }); line(R.fg, handle, { w: 5, seed: 1291, closed: true, draw: brush }); for (let j = 0; j < 6; j++) line(R.fg, bz([[bx, by + 3], [bx + 30, by - 4 + j * 3], [bx + 55, by - 10 + j * 5], [bx + 80, by - 14 + j * 7]], 6), { col: P.brown, w: 4, seed: 1292 + j, draw: brush }); }
}
// a crow close-up: stiff, sharp feather tips; jagged noise lines
function crowClose(t) { const fl = Math.floor(t * 6) % 2; const body = xf(ellipse(0, 0, 230, 120, 40), { x: 560, y: 860 }); knock(R.knock, body); fill(R.fg, body, { col: P.grey2, p: .95, gap: 7, w: 9, seed: 1300 }); line(R.fg, body, { w: 7, seed: 1301, closed: true });
  for (const sx of [-1, 1]) { const w = [[560 + sx * 150, 800], [560 + sx * 470, fl ? 520 : 1040], [560 + sx * 420, fl ? 600 : 1080], [560 + sx * 380, fl ? 640 : 1060], [560 + sx * 340, fl ? 680 : 1030], [560 + sx * 180, 900]]; knock(R.knock, w); fill(R.fg, w, { col: P.grey2, p: .95, gap: 7, w: 9, seed: 1302 + sx }); line(R.fg, w, { w: 7, seed: 1304 + sx, closed: true }); }
  const head = handCircle(330, 800, 70, 1310); knock(R.knock, head); fill(R.fg, head, { col: P.grey2, p: .95, gap: 6, w: 8, seed: 1311 }); line(R.fg, head, { w: 7, seed: 1312 }); dab(R.fg, 305, 785, 10, { col: P.white, p: 1, seed: 1313 }); const bk = [[265, 790], [200, 815], [265, 830]]; knock(R.knock, bk); fill(R.fg, bk, { col: P.yellow, p: 1, gap: 3, w: 5, seed: 1314, cross: true }); line(R.fg, bk, { w: 5, seed: 1315, closed: true });
  for (let j = 0; j < 4; j++) { const z = []; for (let q = 0; q <= 8; q++) z.push([700 + q * 40, 1120 + j * 34 + (q % 2 ? -14 : 14)]); line(R.fg, z, { col: P.red, w: 6, seed: 1320 + j }); } letter('FLAP!', 860, 1060, { size: 80, col: P.red, seed: 1330 }); }
function soundRings(x, y, n, maxR, k, col = P.white) { for (let i = 0; i < n; i++) { const u = (K.CLOCK.td * .8 + i / n) % 1, r = 40 + u * maxR; if (u > k) continue; line(R.fg, ellipse(x, y, r, r * .6, 32, -.6, .6), { col, w: 5, p: .9 * (1 - u), seed: 900 + i }); } }

// ---------- timeline ----------
function drawScene(t) {
  const P0 = (a) => t >= a;
  page(t, { moonFace: t > s(15) - .1 ? 'sleepy' : 'sleepy' });
  if (t < s(2) - .1) {   // the swoop: owl large, already mid-flight at frame 0; mouse below; a noisy crow for contrast
    const u = clamp(t / (s(2) - .1)), ox = lerp(740, 300, u), oy = lerp(700, 960, u) + Math.sin(u * 6) * 20;
    owl(ox, oy, .95, { flap: Math.floor(t * 4) % 2, tilt: -.25, seed: 100 });
    mouse(620, GR + 70, 1.1, { eat: t, look: 0, seed: 300 });
    letter('Shh. Silent wings.', 520, 320, { size: 108, reveal: 1 });
    if (P0(s(1) - .1)) { const k = prog(s(1) - .1, .4); const cx = 860, cy = 300; // a crow flapping loudly, top right, with jagged noise lines
      const crow = xf(ellipse(0, 0, 70, 40, 30), { x: cx, y: cy }); knock(R.knock, crow); fill(R.fg, crow, { col: P.grey2, p: .95, gap: 5, w: 8, seed: 400, draw: k }); line(R.fg, crow, { w: 6, seed: 401, closed: true, draw: k });
      const fl = Math.floor(t * 6) % 2; for (const sx of [-1, 1]) line(R.fg, [[cx + sx * 30, cy - 10], [cx + sx * 110, cy + (fl ? -70 : 40)]], { w: 9, col: P.grey2, seed: 402 + sx, draw: k });
      for (let j = 0; j < 3; j++) { const z = []; for (let q = 0; q <= 6; q++) z.push([cx - 120 + q * 40, cy + 110 + j * 26 + (q % 2 ? -10 : 10)]); line(R.fg, z, { col: P.red, w: 5, seed: 410 + j, draw: k }); }
      letter('FLAP!', 860, 520, { size: 70, col: P.red, reveal: prog(s(1) + .3, .4), seed: 620 }); }
  } else if (t < s(3) - .1) {   // the noisy back edge: a stiff plain wing with turbulence
    wingDiagram(t, { owlW: false, calm: 0, noise: 1 });
    letter('back edge', 760, 980, { size: 70, reveal: prog(s(2) + .4, .5), seed: 630 }); letter('turbulence!', 540, 450, { size: 80, col: P.white, reveal: prog(s(2) + 2, .5), seed: 631 });
  } else if (t < s(4) - .1) {   // a crow close-up: sharp stiff feather tips, jagged noise
    crowClose(t); letter('sharp + stiff = loud', 520, 330, { size: 74, col: P.red, reveal: prog(s(3) + .2, .6), seed: 632 });
  } else if (t < s(5) - .1) {   // three tricks: perched owl spreads a wing, numbers in the sky point at the parts
    owl(400, 860, .95, { perch: true, seed: 140, look: .4 }); const w = smooth([[470, 760], [700, 560], [930, 600], [960, 760], [820, 900], [520, 900]], 8); knock(R.knock, w); fill(R.fg, w, { col: P.brown, p: .9, gap: 8, w: 10, ang: .5, seed: 145, t0: s(4), dur: .5 }); line(R.fg, w, { w: 7, seed: 146, closed: true, t0: s(4), dur: .5 });
    letter('3 tricks', 520, 330, { size: 108, reveal: prog(s(4), .4), seed: 640 }); skyNum(1, 760, 500, prog(s(4) + .3, .3)); skyNum(2, 1000, 960, prog(s(4) + .6, .3)); skyNum(3, 760, 760, prog(s(4) + .9, .3), P.white);
  } else if (t < s(6) - .1) {   // trick 1: a giant feather, comb teeth along the front edge combing the air
    feather(t, { comb: prog(s(5) + .2, 1.2), airCalm: prog(s(5) + 1.6, 1.5) }); skyNum(1, 140, 520, 1); letter('comb', 520, 330, { size: 108, reveal: prog(s(5), .4), seed: 641 });
  } else if (t < s(8) - .1) {   // trick 2: a soft fringe on the back edge, like a paintbrush tip; the swirls shrink
    feather(t, { comb: 1, fringe: prog(s(6) + .2, 1.2), calm: prog(s(7), 2.2), brush: prog(s(6) + 1.6, .6) }); skyNum(2, 140, 520, 1); letter('fringe', 520, 330, { size: 108, reveal: prog(s(6), .4), seed: 642 });
    if (t > s(7)) letter('slips away quietly', 520, 1300, { size: 64, col: P.white, reveal: prog(s(7) + .8, .6), seed: 644 });
  } else if (t < s(9) - .1) {   // trick 3: velvet surface soaks up the sound rings
    feather(t, { comb: 1, fringe: 1, calm: 1, velvet: prog(s(8) + .2, 1.4) }); skyNum(3, 140, 520, 1); letter('velvet', 520, 330, { size: 108, reveal: prog(s(8), .4), seed: 643 });
    soundRings(560, 760, 4, lerp(260, 60, prog(s(8) + .8, 2)), 1);
  } else if (t < s(13) - .1) {   // slow glide over the field; sound rings shrink before reaching the mouse
    const u = clamp((t - s(9)) / (s(13) - s(9))), ox = lerp(880, 380, u), oy = lerp(520, 760, u);
    owl(ox, oy, .8, { flap: Math.floor(t * 1.5) % 2, tilt: -.15, seed: 120 });
    mouse(560, GR + 80, 1.1, { eat: t, look: 0, seed: 310 });
    soundRings(ox - 40, oy + 160, 4, lerp(420, 120, prog(s(10), 1.6)), 1);
    if (P0(s(9))) letter('slow…', 300, 520, { size: 80, reveal: prog(s(9) + .3, .4), seed: 650 });
    if (P0(s(10))) letter('hears, unheard', 520, 330, { size: 80, col: P.yellow, reveal: prog(s(10) + .4, .6), seed: 651 });
    if (P0(s(11))) letter('…?', 470, GR - 40, { size: 70, col: P.white, reveal: prog(s(11) + .5, .3), seed: 652 });
    if (P0(s(12))) letter('stealth hunter', 760, GR + 200, { size: 54, col: P.out, reveal: prog(s(12) + .2, .5), seed: 653 });
  } else if (t < s(14) - .1) {   // the proof: a fish owl by a river, no comb, no fringe
    const riv = [[-20, GR + 80], [1100, GR + 40], [1100, GR + 220], [-20, GR + 260]]; knock(R.knock, riv); fill(R.fg, riv, { col: P.teal, p: .85, gap: 8, w: 10, seed: 950 });
    owl(560, 800, .9, { perch: true, seed: 140, look: .6 }); const fish = xf(ellipse(0, 0, 60, 24, 24), { x: 300, y: GR + 150 }); knock(R.knock, fish); fill(R.fg, fish, { col: P.moonS, p: .95, gap: 5, w: 7, seed: 951 }); line(R.fg, fish, { w: 5, seed: 952, closed: true });
    letter('fish owl', 520, 330, { size: 92, reveal: prog(s(13), .5), seed: 660 }); letter('mostly no comb or fringe', 560, 1180, { size: 62, col: P.white, reveal: prog(s(13) + 1.6, .6), seed: 661 });
  } else if (t < s(15) - .1) {   // engineers copy the fringe: a wind turbine and a fan
    const hx = 380, hy = 560; line(R.fg, [[hx, hy], [hx - 10, GR], [hx + 10, GR]], { w: 10, col: P.white, seed: 970 });
    for (let k = 0; k < 3; k++) { const a = K.CLOCK.td * 1.5 + k * 2.094, tip = [hx + Math.cos(a) * 300, hy + Math.sin(a) * 300], bl = [[hx, hy], [hx + Math.cos(a - .08) * 150, hy + Math.sin(a - .08) * 150], tip, [hx + Math.cos(a + .1) * 140, hy + Math.sin(a + .1) * 140]]; knock(R.knock, bl); fill(R.fg, bl, { col: P.white, p: 1, gap: 5, w: 8, seed: 971 + k }); line(R.fg, bl, { w: 6, seed: 975 + k, closed: true });
      for (let j = 0; j < 5; j++) { const u = .5 + j * .1, p0 = [hx + Math.cos(a + .1) * 300 * u, hy + Math.sin(a + .1) * 300 * u]; line(R.fg, [p0, [p0[0] + Math.cos(a + 1.2) * 22, p0[1] + Math.sin(a + 1.2) * 22]], { col: P.tan, w: 4, seed: 980 + j + k * 5 }); } }
    const fc = handCircle(820, 1000, 130, 990); knock(R.knock, fc); fill(R.fg, fc, { col: P.teal, p: .8, gap: 8, w: 9, seed: 991 }); line(R.fg, fc, { w: 7, seed: 992 }); for (let k = 0; k < 4; k++) { const a = K.CLOCK.td * 3 + k * 1.57; line(R.fg, [[820, 1000], [820 + Math.cos(a) * 110, 1000 + Math.sin(a) * 110]], { w: 12, col: P.white, seed: 993 + k }); }
    letter('owl fringes', 520, 330, { size: 92, reveal: prog(s(14), .5), seed: 670 });
  } else if (t < s(16) - .1) {   // the question: the owl on a branch under the moon
    line(R.fg, smooth([[-20, 980], [300, 940], [620, 990], [800, 960]], 8, false), { w: 22, col: P.brown, seed: 1000 }); owl(520, 770, .95, { perch: true, seed: 160, blink: Math.floor(t * 2) % 5 === 0 });
    letter('What would you', 520, 340, { size: 84, reveal: prog(s(15), .5), seed: 680 }); letter('make quieter?', 520, 440, { size: 84, reveal: prog(s(15) + .5, .5), seed: 681 });
  } else {   // end: the closing line lettered on the page
    owl(540, 800, .7, { perch: true, seed: 180 }); line(R.fg, smooth([[200, 1000], [540, 970], [880, 1000]], 8, false), { w: 20, col: P.brown, seed: 1010 });
    letter('Follow for more of', 530, 380, { size: 86, reveal: prog(s(16) - .1, .6), seed: 690 }); letter('how it really works.', 530, 490, { size: 86, col: P.white, reveal: prog(s(16) + .4, .6), seed: 691 });
  }
  // the book's printed words: ragged paper patch at the bottom (never a dark box)
  let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci >= 0) subtitle(R, PH[ci].cap.replace(/\*\*/g, ''), 1610, { size: 52, maxW: 900, reveal: clamp((t - PH[ci].start + .05) / .45), col: P.out, seed: 3 + ci * 7 });
}
function scene(t) { R.begin(t); drawScene(t); R.compose(); }
window.DUR = TL.total;
window.seek = t => { scene(t); };
window.render = window.seek;
// thumbnail / cover (rule 11): big owl mid-swoop over the night page, hook text in yellow crayon lettering
window.thumb = () => { R.begin(1.4); page(1.4); owl(560, 1010, 1.05, { flap: 0, tilt: -.2, seed: 100 }); mouse(560, GR + 150, 1.0, { seed: 300 });
  text(R.fg, 'Silent', 520, 470, { font: 'Gaegu', weight: 700, size: 190, col: P.yellow, seed: 700 }); text(R.fg, 'wings', 520, 650, { font: 'Gaegu', weight: 700, size: 190, col: P.yellow, seed: 701 }); R.compose(); };
window.seek(0); window.ready = true; window.READY = true;
