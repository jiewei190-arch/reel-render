// t_leafcolor.js: "Why do leaves change color in the fall?" Template #25 Ink moon (demo t25), same kit as harvestmoon.
// Rice paper, stippled dry-brush ink peaks over mist, a moon with halo, birds, a maple branch (the demo's plum branch, now
// with leaves whose colour comes from three pigment layers), ensō insets for the close-ups, serif labels, vermilion seals.
// Batch N safe zones: scene art and labels in y 260-1150, a quiet serif subtitle at y 1180-1400 inside x 180-900,
// nothing written in the right column below y 840. Every frame is a pure function of t.
import { createInkMoon, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, paper, range, putRange, mist, haze, moon, birds, enso,
  serif, column, sealMark, parse, ripples, VERM } from './styles/inkmoon/inkmoon.js';
await document.fonts.load('italic 700 60px "Cormorant Garamond"');
const g = createInkMoon(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .5) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const ink = a => `rgba(30,28,30,${clamp(a)})`;
const GREEN = '#4c7a36', GOLD = '#dfa52c', RED = '#b8382a', BROWN = '#7a5a3a', SUGAR = '#f6f1e2';

// ---------------- the landscape (baked ranges, lifted so the art ends above the subtitle band) ----------------
const FAR = range([[60, 200, 240], [340, 290, 260], [650, 220, 240], [940, 280, 260]], 1000, { far: true, dots: 9000, seed: 3, fade: 200 });
const NEAR = range([[150, 300, 240], [480, 220, 210], [800, 380, 250], [1070, 250, 210]], 1120, { dots: 140000, seed: 7, fade: 200 });
function land(t, { mx = 300, my = 640, mr = 120, o = .2, birdsA = 1, moonA = 1 } = {}) {
  g.drawImage(paper(), 0, 0);
  moon(g, mx, my, mr, o, { a: moonA });
  putRange(g, FAR); mist(g, 1000, 100, t, { seed: 2 }); putRange(g, NEAR); mist(g, 1140, 80, t, { seed: 5, a: .8 });
  ripples(g, 1440, t, { a: .6 });
  if (birdsA > 0) { g.save(); g.globalAlpha *= birdsA; birds(g, t, { x0: 120, y0: 420, sp: 28 }); g.restore(); }
}

// ---------------- the leaf: three pigment layers over a gold base ----------------
// st: { green, red, brown } in 0..1. Gold (carotenoids) is always underneath.
function leafPath(s) {
  const p = new Path2D(), n = 120;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + i / n * TAU, lobes = Math.pow(Math.abs(Math.cos(2.5 * (a + Math.PI / 2))), 2.2), base = Math.max(0, Math.sin(a)) ** 3, saw = .05 * Math.abs(Math.sin(a * 15));
    const rr = s * (.38 + .62 * lobes + saw) * (1 - .55 * base);
    i ? p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  p.closePath(); return p;
}
const LP = new Map();
function leaf(x, y, s, rot, st, o = {}) {
  const key = Math.round(s); if (!LP.has(key)) LP.set(key, leafPath(key)); const p = LP.get(key);
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= o.a ?? 1;
  g.strokeStyle = ink(.85); g.lineWidth = Math.max(2, s * .05); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, s * .2); g.lineTo(0, s * (.75 + (o.stem ?? 0))); g.stroke();
  g.fillStyle = GOLD; g.fill(p);
  if (st.red > 0) { g.globalAlpha *= 1; g.save(); g.globalAlpha *= st.red; g.fillStyle = RED; g.fill(p); g.restore(); }
  if (st.green > 0) { g.save(); g.globalAlpha *= st.green; g.fillStyle = GREEN; g.fill(p); g.restore(); }
  if (st.brown > 0) { g.save(); g.globalAlpha *= st.brown; g.fillStyle = BROWN; g.fill(p); g.restore(); }
  g.strokeStyle = ink(.82); g.lineWidth = Math.max(1.5, s * .03); g.stroke(p);
  g.strokeStyle = ink(.45); g.lineWidth = Math.max(1, s * .018);
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .62; g.beginPath(); g.moveTo(0, s * .12); g.lineTo(Math.cos(a) * s * .78, Math.sin(a) * s * .78); g.stroke(); }
  g.restore();
}
// a maple branch from the top-right (the demo's plum branch); leaf colours vary slightly along it
const BR = [[[0, 0], [-170, 46], [-320, 80], [-460, 150]], [[-170, 46], [-210, 130], [-250, 190]], [[-320, 80], [-350, 14], [-400, -20]], [[-460, 150], [-500, 220]]];
const LEAVES = [[-110, 70, 46, .4], [-230, 190, 50, -.3], [-260, 120, 40, .8], [-350, 10, 44, -.6], [-420, -20, 38, .2], [-450, 190, 48, .5], [-510, 240, 42, -.2], [-200, 30, 36, 1.0], [-380, 120, 40, -.9]];
function branch(t, st, { x = W + 20, y = 260, s = 1, fall = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  BR.forEach((pts, bi) => { g.strokeStyle = ink(.9); g.lineCap = 'round'; for (let i = 1; i < pts.length; i++) { g.lineWidth = (bi ? 7 : 15) * (1 - i / (pts.length + 1)); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0] + (hash(i + bi) - .5) * 6, pts[i][1]); g.stroke(); } });
  LEAVES.forEach(([lx, ly, ls, rot], i) => {
    const v = hash(i * 3.7), lst = { green: clamp(st.green * (.85 + .3 * v)), red: clamp(st.red * (.5 + .7 * hash(i * 5.1))), brown: clamp(st.brown * (.7 + .5 * v)) };
    const f = clamp(fall * 1.6 - i * .07); if (f >= 1) return;
    const sw = .06 * Math.sin(t * 1.4 + i);
    leaf(lx + f * 120 * Math.sin(i), ly + f * 900, ls, rot + sw + f * 3 * (v - .5), lst, { a: 1 - f });
  });
  g.restore();
}
// falling leaves (drifting particles)
function falling(t, n, st, { a = 1, y0 = 200, x0 = 0 } = {}) {
  if (a <= 0) return;
  for (let i = 0; i < n; i++) { const sp = 60 + 40 * hash(i * 2.3), ph = (t * sp / 900 + hash(i * 7.1)) % 1, y = y0 + ph * 950, x = x0 + hash(i * 1.9) * W + 40 * Math.sin(t * 1.3 + i * 2);
    const fade = Math.min(1, ph * 6, (1 - ph) * 5);
    leaf(x, y, 22 + 10 * hash(i * 4.4), t * (1 + hash(i)) * (i % 2 ? 1 : -1), { green: st.green, red: clamp(st.red * hash(i * 9.9) * 1.4), brown: st.brown }, { a: a * fade }); }
}
function rays(cx, cy, n, r0, r1, k, col = 'rgba(217,118,62,.85)') { if (k <= 0) return; g.save(); g.strokeStyle = col; g.lineWidth = 6; g.lineCap = 'round'; g.setLineDash([18, 12]);
  for (let i = 0; i < n; i++) { const a = Math.PI * (.62 + .76 * i / (n - 1)), L = lerp(r0, r1, k); g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy - Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * L, cy - Math.sin(a) * L); g.stroke(); }
  g.restore(); }
function sun(x, y, rr, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; haze(g, x, y, rr * 3, '230,120,70', .35); g.fillStyle = '#d9763e'; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.restore(); }
// pigment dots inside an ensō: the "microscope" view of a leaf cell
function pigments(cx, cy, R, st, t, seed = 1) {
  g.save(); g.beginPath(); g.arc(cx, cy, R - 14, 0, TAU); g.clip();
  g.fillStyle = 'rgba(246,238,214,.92)'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  for (let i = 0; i < 90; i++) { const a = hash(seed + i * 1.7) * TAU, d = Math.sqrt(hash(seed + i * 3.1)) * (R - 30), x = cx + Math.cos(a) * d + 4 * Math.sin(t * 2 + i), y = cy + Math.sin(a) * d + 4 * Math.cos(t * 1.7 + i);
    const kind = i % 3, k = kind === 0 ? 1 : kind === 1 ? st.green : st.red; if (k <= 0) continue;
    g.fillStyle = [GOLD, GREEN, RED][kind]; g.globalAlpha = clamp(k); g.beginPath(); g.ellipse(x, y, 13 * (.6 + .4 * k), 9 * (.6 + .4 * k), i, 0, TAU); g.fill(); }
  g.restore();
}

// ---------------- scenes ----------------
const S = [];
// A (p0-p1): frame 0 is one big leaf inside an ensō, green already draining to reveal gold; at the question the ink landscape comes in:
// mountains under a pale moon, a maple branch in red and gold, the question in a vertical column, the first leaves falling
S.push([0, T(2), t => {
  const k = ss(seg(t, T(1) - .2, T(1) + .7));
  land(t, { mx: 190, my: 760, mr: 95, o: .25, birdsA: k });
  if (k > 0) { g.save(); g.globalAlpha *= k; branch(t, { green: 0, red: .85, brown: 0 }, { y: 300 });
    falling(t, 7, { green: 0, red: .8, brown: 0 }, { a: ss(seg(t, T(1), T(1) + .8)), y0: 260 });
    column(g, ['WHY DO', 'LEAVES', 'TURN?'], 400, 320, seg(t, T(1) + .1, T(1) + 1.1), { size: 84, gap: 1.05, seal: 'fall' }); g.restore(); }
  if (k < 1) { g.save(); g.globalAlpha *= 1 - k; g.drawImage(paper(), 0, 0);
    const gr = 1 - ss(seg(t, .15, 2.6));
    enso(g, 540, 770, 390, 1, { lw: 20, seed: 4 });
    leaf(540 + 6 * Math.sin(t * 1.3), 795, 290, .04 * Math.sin(t * .9), { green: gr, red: 0, brown: 0 });
    serif(g, 'gold, all along', 540, 300, { size: 64, w: 700, a: seg(t, 1.6, 2.0) });
    g.restore(); }
}]);
// B (p2-p5): one big leaf: green all summer (sunlight -> food), nights lengthen, chlorophyll breaks down, gold revealed
S.push([T(2) - .5, T(6) - .1, t => {
  g.drawImage(paper(), 0, 0); putRange(g, FAR, { a: .5, dy: 60 });
  const night = ss(seg(t, r(3, .3), r(3, 3.5))), gfade = ss(seg(t, r(3, 1.6), T(4) + .8));
  const st = { green: 1 - gfade, red: 0, brown: 0 };
  // day-length strip: sun arc shrinks, the night band grows (top)
  const k0 = seg(t, T(2) - .3, T(2) + .5);
  g.save(); g.globalAlpha *= k0; g.fillStyle = 'rgba(40,40,60,.75)'; const nw = lerp(300, 560, night); g.fillRect(540 - 400, 300, 800, 36); g.fillStyle = '#e8c07a'; g.fillRect(540 - 400, 300, 800 - nw, 36);
  g.strokeStyle = ink(.8); g.lineWidth = 3; g.strokeRect(540 - 400, 300, 800, 36); g.restore();
  serif(g, 'day', 200, 270, { size: 46, w: 700, a: k0 }); serif(g, 'night', 880 - 40, 270, { size: 46, w: 700, a: k0 });
  serif(g, 'nights get longer', 540, 380, { size: 52, w: 700, a: seg(t, r(3, .4), r(3, 1.0)) * (1 - seg(t, T(4) - .2, T(4) + .2)) });
  // the leaf in an ensō
  enso(g, 540, 790, 280, seg(t, T(2) - .2, T(2) + .8), { lw: 16, seed: 4 });
  leaf(540, 800, 200, .05 * Math.sin(t * .8), st);
  // p2: sunlight in, sugar out
  const sk = seg(t, r(2, 1.0), r(2, 2.0)) * (1 - seg(t, T(3) + .2, T(3) + .7));
  sun(160, 520, 46, sk); rays(160, 520, 1, 60, 300, sk);
  if (sk > 0) for (let i = 0; i < 6; i++) { const u = (t * .5 + i / 6) % 1; g.save(); g.globalAlpha *= sk * (1 - u); g.fillStyle = SUGAR; g.strokeStyle = ink(.7); g.lineWidth = 2; g.fillRect(560 + i * 18, 760 + u * 300, 18, 18); g.strokeRect(560 + i * 18, 760 + u * 300, 18, 18); g.restore(); }
  serif(g, 'chlorophyll', 540, 440, { size: 66, w: 700, a: seg(t, r(2, .9), r(2, 1.5)) * (1 - seg(t, T(3) - .2, T(3) + .2)), tone: .9 });
  serif(g, 'sunlight → food', 540, 1120, { size: 50, w: 700, a: sk });
  // p4-p5: carotenoids revealed; the pigment inset
  const pk = seg(t, r(4, .6), r(4, 1.4));
  if (pk > 0) { g.save(); g.globalAlpha *= pk; enso(g, 220, 1000, 130, 1, { seed: 6 }); pigments(220, 1000, 130, st, t, 3); g.restore(); }
  serif(g, 'carotenoids', 540, 440, { size: 66, w: 700, a: seg(t, r(4, .5), r(4, 1.1)) });
  sealMark(g, 790, 440, 56, 'there all along', seg(t, r(4, 2.4), r(4, 3.0)));
  // p5: the green "sheet" slides off
  const cov = seg(t, T(5) - .1, E(5));
  if (cov > 0 && cov < 1) { g.save(); g.globalAlpha *= (1 - cov) * .9; g.fillStyle = GREEN; g.fillRect(700 + cov * 300, 520, 280, 420); g.strokeStyle = ink(.7); g.lineWidth = 3; g.strokeRect(700 + cov * 300, 520, 280, 420); g.restore(); }
}]);
// C (p6-p10): the twist: red is made fresh. Cork layer at the stem traps sugar; sun + sugar -> anthocyanins; maybe a sunscreen
S.push([T(6) - .5, T(11) - .1, t => {
  g.drawImage(paper(), 0, 0); putRange(g, FAR, { a: .5, dy: 60 });
  const red = ss(seg(t, r(7, .8), r(9, 2.2))), st = { green: 0, red, brown: 0 };
  serif(g, 'the twist', 540, 300, { size: 60, w: 700, a: seg(t, T(6), r(6, .5)) * (1 - seg(t, T(7) - .2, T(7) + .2)) });
  serif(g, 'anthocyanins', 540, 300, { size: 66, w: 700, a: seg(t, r(7, .9), r(7, 1.5)) * (1 - seg(t, T(8) - .2, T(8) + .2)) });
  sealMark(g, 800, 330, 56, 'new', seg(t, r(7, 2.4), r(7, 2.9)) * (1 - seg(t, T(8) - .2, T(8) + .2)));
  enso(g, 540, 700, 290, seg(t, T(6) - .3, T(6) + .6), { lw: 16, seed: 7 });
  leaf(540, 690, 200, .05 * Math.sin(t * .8), st, { stem: .9 });
  // cork-like layer across the stem + trapped sugar (p8)
  const ck = seg(t, r(8, .4), r(8, 1.4));
  if (ck > 0) { g.save(); g.strokeStyle = 'rgba(122,90,58,.95)'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(540 - 50 * ck, 925); g.lineTo(540 + 50 * ck, 925); g.stroke(); g.restore();
    serif(g, 'cork-like layer', 340, 940, { size: 48, w: 700, a: seg(t, r(8, 1.0), r(8, 1.6)) * (1 - seg(t, T(11) - .6, T(11) - .2)) }); }
  const sg = seg(t, r(8, 2.4), r(8, 3.4));
  if (sg > 0) for (let i = 0; i < 10; i++) { const a = hash(i * 2.2) * TAU, d = 40 + 90 * hash(i * 4.1), x = 540 + Math.cos(a) * d, y = 670 + Math.sin(a) * d * .8 + 6 * Math.sin(t * 2 + i);
    g.save(); g.globalAlpha *= sg; g.fillStyle = SUGAR; g.strokeStyle = ink(.7); g.lineWidth = 2; g.fillRect(x - 9, y - 9, 18, 18); g.strokeRect(x - 9, y - 9, 18, 18); g.restore(); }
  serif(g, 'sugar, trapped', 340, 1030, { size: 50, w: 700, a: sg * (1 - seg(t, T(10) - .2, T(10) + .2)) });
  // p9: sunshine + sugar -> red
  const sk = seg(t, T(9), r(9, .8)) * (1 - seg(t, E(10) - .3, E(10) + .2));
  sun(170, 420, 48, sk); rays(170, 420, 1, 62, 300, sk);
  serif(g, 'sun + sugar = red', 560, 300, { size: 58, w: 700, a: seg(t, r(9, .5), r(9, .8)) * (1 - seg(t, T(10) - .2, T(10) + .2)) });
  // p10: like a sunscreen: rays stop at the red leaf (dashed rays end at the edge)
  const sc = seg(t, T(10), r(10, .8));
  if (sc > 0) { g.save(); g.globalAlpha *= sc; g.strokeStyle = 'rgba(217,118,62,.9)'; g.lineWidth = 6; g.setLineDash([18, 12]); [[-60], [0], [60]].forEach(([dx], i) => { g.beginPath(); g.moveTo(230 + dx, 470); g.lineTo(400 + dx * .5, 570 + i * 20); g.stroke(); }); g.restore();
    serif(g, 'a sunscreen?', 560, 300, { size: 62, w: 700, a: sc }); }
}]);
// D (p11): weather: warm sunny day + cool night -> brightest reds over the ink landscape
S.push([T(11) - .5, T(12) - .1, t => {
  const nt = ss(seg(t, r(11, 2.2), r(11, 3.4)));
  land(t, { mx: lerp(240, 300, nt), my: lerp(980, 560, nt), mr: 100, o: .1, moonA: nt, birdsA: 1 - nt });
  sun(lerp(300, 240, nt), lerp(520, 980, nt), 60, 1 - nt);
  g.save(); g.globalAlpha *= .22 * nt; g.fillStyle = 'rgb(40,46,70)'; g.fillRect(0, 0, W, H); g.restore();
  branch(t, { green: .05, red: lerp(.6, 1, seg(t, T(11), E(11))), brown: 0 }, { y: 300 });
  serif(g, 'warm, sunny days', 330, 300, { size: 56, w: 700, a: seg(t, r(11, .5), r(11, 1.0)) * (1 - seg(t, r(11, 2.2), r(11, 2.5))) });
  serif(g, 'cool nights', 330, 300, { size: 56, w: 700, a: seg(t, r(11, 2.6), r(11, 2.9)) });
  sealMark(g, 160, 410, 56, 'bright red', seg(t, r(11, 3.6), r(11, 4.2)));
}]);
// E (p12-p13): brown last (tannins); the cork layer seals and the leaf lets go, drifting down to the water
S.push([T(12) - .5, T(14) - .1, t => {
  land(t, { mx: 280, my: 600, mr: 100, o: .3, birdsA: 0 });
  const br = ss(seg(t, r(12, .6), r(12, 2.4)));
  const drop = ss(seg(t, r(13, 1.0), E(13) + .6));
  const st = { green: 0, red: .7 * (1 - br), brown: br * .85 };
  enso(g, 540, 600, 270, seg(t, T(12) - .3, T(12) + .6), { lw: 14, seed: 9 });
  leaf(540 + 60 * Math.sin(drop * 5) * drop, 600 + drop * 520, 170 * (1 - .4 * drop), drop * 2.5, st, { stem: .6 });
  serif(g, 'tannins', 540, 300, { size: 66, w: 700, a: seg(t, r(12, .5), r(12, 1.1)) * (1 - seg(t, T(13) - .2, T(13) + .2)) });
  serif(g, 'brown comes last', 540, 970, { size: 50, w: 700, a: seg(t, r(12, 1.8), r(12, 2.4)) * (1 - seg(t, T(13) - .2, T(13) + .2)) });
  serif(g, 'the leaf lets go', 540, 300, { size: 62, w: 700, a: seg(t, r(13, .7), r(13, 1.0)) });
  falling(t, 6, { green: 0, red: .5, brown: .6 }, { a: seg(t, T(13), r(13, 1)), y0: 280 });
}]);
// F (p14): payoff: three ensō, green leaving / gold revealed / red made
S.push([T(14) - .5, T(15) - .1, t => {
  g.drawImage(paper(), 0, 0); putRange(g, FAR, { a: .45, dy: 60 });
  const xs = [190, 540, 890], sts = [{ green: .8 - .8 * ss(seg(t, r(14, .4), r(14, 1.6))), red: 0, brown: 0 }, { green: 0, red: 0, brown: 0 }, { green: 0, red: 1, brown: 0 }];
  const labs = ['green leaves', 'gold revealed', 'red made'], ts = [.1, 1.4, 3.0];
  xs.forEach((x, i) => { const k = seg(t, r(14, ts[i]), r(14, ts[i] + .7)); enso(g, x, 560, 150, k, { seed: 2 + i }); if (k > .3) { g.save(); g.globalAlpha *= seg(k, .3, 1); leaf(x, 570, 100, .1 * Math.sin(t + i), sts[i]); g.restore(); }
    serif(g, labs[i], Math.min(x, 860), 770, { size: 46, w: 700, a: seg(t, r(14, ts[i] + .3), r(14, ts[i] + .8)) }); });
  serif(g, 'fall color', 540, 330, { size: 74, w: 700, a: seg(t, T(14) - .2, r(14, .4)) });
}]);
// G (p15-p16): question (red or gold) and the end card under the moon, branch back in place (loops to frame 0)
S.push([T(15) - .5, TL.total + 1, t => {
  land(t, { mx: 190, my: 760, mr: 95, o: .25, birdsA: 1 - seg(t, T(16) - .6, T(16) - .1) });
  branch(t, { green: 0, red: .85, brown: 0 }, { y: lerp(300, 640, ss(seg(t, T(16) - .5, T(16) + .3))) });
  const q = 1 - seg(t, T(16) - .3, T(16) + .1);
  if (q > 0) { g.save(); g.globalAlpha *= q; enso(g, 300, 900, 130, seg(t, T(15), r(15, .6)), { seed: 3 }); enso(g, 780, 760, 130, seg(t, r(15, .3), r(15, .9)), { seed: 6 });
    leaf(300, 905, 85, .1, { green: 0, red: 1, brown: 0 }); leaf(780, 765, 85, -.1, { green: 0, red: 0, brown: 0 });
    serif(g, 'red', 300, 1090, { size: 60, w: 700 }); serif(g, 'gold', 780, 590, { size: 60, w: 700 }); g.restore(); }
  const e = seg(t, T(16), r(16, .8));
  serif(g, 'Follow for more of', 540, 300, { size: 64, w: 600, reveal: e });
  serif(g, 'how it really works.', 540, 390, { size: 74, w: 700, reveal: seg(t, r(16, .4), r(16, 1.2)) });
  serif(g, "A new 'wait, really?' every day.", 540, 470, { size: 48, w: 600, reveal: seg(t, r(16, .8), r(16, 1.5)) });
  serif(g, '@howitreallyworkstudio', 540, 540, { size: 46, w: 700, tone: .7, reveal: seg(t, r(16, 1.1), r(16, 1.8)) });
}]);

function scene(t) {
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .5, b, .5); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
}
// quiet centred subtitle (the kit's, re-set for the Batch N caption band: y 1180-1400, x 180-900)
function subtitle(cap, a) {
  if (a <= 0) return; const SZ = 54, maxW = 700; g.save(); g.globalAlpha = a; g.textBaseline = 'middle';
  const toks = []; parse(cap).forEach(p => p.t.split(/\s+/).filter(Boolean).forEach(w => toks.push({ w, b: p.b })));
  const m = tk => { g.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; return g.measureText(tk.w + ' ').width; };
  const lines = [[]]; let cw = 0; for (const tk of toks) { const w = m(tk); if (cw + w > maxW && lines[lines.length - 1].length) { lines.push([]); cw = 0; } lines[lines.length - 1].push(tk); cw += w; }
  const lh = 60, top = 1262 - (lines.length - 1) * lh / 2;
  g.fillStyle = 'rgba(239,232,216,.78)'; g.beginPath(); g.roundRect(150, top - 50, 780, (lines.length - 1) * lh + 100, 30); g.fill();
  lines.forEach((ln, i) => { const tw = ln.reduce((s, tk) => s + m(tk), 0); let x = W / 2 - tw / 2; if (i === 0) { g.fillStyle = VERM; g.fillRect(x - 30, top - 7, 13, 13); }
    for (const tk of ln) { g.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; g.lineJoin = 'round'; g.strokeStyle = 'rgba(239,232,216,.92)'; g.lineWidth = 10; g.strokeText(tk.w, x, top + i * lh);
      g.fillStyle = tk.b ? (tk.w.match(/red|anthocyanin/i) ? '#b8462a' : tk.w.match(/yellow|gold|carotenoid/i) ? '#a8741a' : tk.w.match(/green|chlorophyll/i) ? '#3f6a2c' : ink(.98)) : ink(.84); g.fillText(tk.w, x, top + i * lh); x += m(tk); } });
  g.restore();
}
function sub(t) {
  let cur = 0; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start, a = (cur === 0 ? 1 : seg(t, p.start - .05, p.start + .15)) * (1 - seg(t, nx - .25, nx - .05));
  subtitle(p.cap, a);
}
// pigment strip (the three layers' levels across the whole reel), under the caption in y 1395-1435
function pigStrip(t) {
  const hook = t < T(2) - .3;
  const chl = hook ? 1 - ss(seg(t, .15, 2.6)) : 1 - ss(seg(t, T(3) + .5, T(4) + 1)) + ss(seg(t, T(14) + .1, T(14) + 1.2)) * 0;
  const gold = 1 - .6 * ss(seg(t, T(12), T(13))) + .6 * ss(seg(t, T(14) - .3, T(14) + .3));
  const red = hook ? 0 : ss(seg(t, T(7) + .8, T(9) + 2)) * (1 - .7 * ss(seg(t, T(12), T(13)))) + .7 * ss(seg(t, T(14) - .3, T(14) + .3)) * ss(seg(t, T(7), T(9)));
  g.save(); g.fillStyle = 'rgba(239,232,216,.85)'; g.strokeStyle = ink(.6); g.lineWidth = 2; g.beginPath(); g.roundRect(160, 1392, 760, 46, 22); g.fill(); g.stroke();
  [['green', GREEN, chl], ['gold', GOLD, gold], ['red', RED, red]].forEach(([lab, col, v], i) => { const x = 190 + i * 245;
    g.font = 'italic 700 30px "Cormorant Garamond"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = ink(.85); g.fillText(lab, x, 1415);
    g.fillStyle = 'rgba(30,28,30,.12)'; g.fillRect(x + 78, 1407, 130, 16); g.fillStyle = col; g.fillRect(x + 78, 1407, 130 * clamp(v), 16); });
  g.restore();
}
window.DUR = TL.total;
window.seek = t => { scene(t); sub(t); pigStrip(t); const f = Math.min(1, (TL.total - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .3; g.fillStyle = '#2a2622'; g.fillRect(0, 0, W, H); g.restore(); } };
window.thumb = () => { const t = 3; land(t, { mx: 280, my: 700, mr: 130, o: .3, birdsA: 0 }); branch(t, { green: 0, red: .9, brown: 0 }, { y: 760, s: 1.25 });
  leaf(300, 1150, 170, .1, { green: .35, red: 0, brown: 0 });
  serif(g, 'WHY DO LEAVES', 540, 380, { size: 104, w: 700, ls: 3 }); serif(g, 'CHANGE COLOR?', 540, 500, { size: 104, w: 700, ls: 3 }); sealMark(g, 900, 590, 64, 'fall'); };
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
