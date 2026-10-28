// t_wetdog.js: "Why do wet dogs smell so bad?" in template #23 Recipe card (demo t23), same engine as the handwarmer reel. Canvas2D 1080x1920, pure function of t.
// The demo's recipe grammar carries the explanation: wet dog smell is a recipe (a dog, its microbes, their smelly molecules, a splash of water, time to dry),
// told with the step header + big counter + % scale + checklist card + progress bar; the dog is the demo's glass, the STINK scale its fill level,
// and the "Good drink." sign-off becomes "Good stink." Batch N layout: captions at y ~1290, content inside y 250-1130, x < 900 below y 840.
import { create, W, H, TAU, P, clamp, lerp, seg, ss, eo, bo, hash, paper, hand, mono, line, rectPts, circPts, fill, shade, progress, header, card, scale, splats, caption } from './styles/recipe/recipe.js';
await Promise.all([document.fonts.load('700 60px Caveat'), document.fonts.load('500 22px Mono')]);
const g = create(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, r = (i, d) => s(i) + d, TOT = TL.total;
const win = (t, a, b, f = .4) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const STEPS = ['RECIPE', 'DOG', 'SMELLS', 'WATER', 'DRY', 'THE MIX'];
const ROWS = [{ amt: '1', item: 'dog' }, { amt: 'lots of', item: 'microbes' }, { amt: 'their', item: 'smelly molecules' }, { amt: '1 splash', item: 'water' }, { amt: 'some', item: 'time to dry' }];
const TW = [r(3, .5), r(3, 2.6), r(5, .9), r(7, .4), r(9, .4)];      // tick times, on the words
const C = { fur: '#d9a86c', furD: '#b9864e', wet: '#bf8f5c', patch: '#8a5a34', collar: '#b5533a', water: '#7fa6c0', waterL: 'rgba(127,166,192,.2)', stink: '#7d9a3c', mol: '#8a64a8', bact: '#6f9a4a', yeast: '#d6b65a', pink: '#e7a3a0' };

// ---------- the dog (the demo's glass): sitting, side view, nose right ----------
function dogPts(x, y, sc) { const T = (px, py) => [x + px * sc, y + py * sc];
  return { body: circPts(0, 0, 1).map((_, i, A) => { const an = i / A.length * TAU; return T(Math.cos(an) * 92, -96 + Math.sin(an) * 84); }),
    haunch: circPts(0, 0, 1).map((_, i, A) => { const an = i / A.length * TAU; return T(-42 + Math.cos(an) * 74, -50 + Math.sin(an) * 52); }),
    head: circPts(0, 0, 1).map((_, i, A) => { const an = i / A.length * TAU; return T(72 + Math.cos(an) * 62, -196 + Math.sin(an) * 58); }),
    snout: circPts(0, 0, 1).map((_, i, A) => { const an = i / A.length * TAU; return T(128 + Math.cos(an) * 44, -176 + Math.sin(an) * 28); }), T };
}
function stinkLine(x, y, h, t, seed, a = 1, col = C.stink, w = 3.4) { if (a <= 0) return; const n = 10; line(g, Array.from({ length: n }, (_, j) => { const u = j / (n - 1); return [x + 12 * Math.sin(t * 3 + seed + u * 7), y - u * h]; }), { w, col, a, seed: 900 + seed, wob: .2 }); }
function dog(t, { x = 330, y = 1120, sc = 1, wet = 0, shake = 0, k = 1, stink = 0, blink = 1, tail = 1 } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= k;
  const wag = Math.sin(t * (wet > .5 ? 4 : 9)) * .5 * tail, sh = shake * Math.sin(t * 34) * .16;
  g.save(); g.translate(x, y - 120 * sc); g.rotate(sh); g.translate(-x, -(y - 120 * sc));
  const D = dogPts(x, y, sc), T = D.T, furC = wet > 0 ? lerp(0, 1, wet) : 0, base = wet > .5 ? C.wet : C.fur;
  // tail (wags; droops when wet)
  const ta = -1.9 + wag - wet * .9, tl = 90 * sc; line(g, [T(-88, -70), [T(-88, -70)[0] + Math.cos(ta) * tl * .55, T(-88, -70)[1] + Math.sin(ta) * tl * .55 - 10 * sc], [T(-88, -70)[0] + Math.cos(ta) * tl, T(-88, -70)[1] + Math.sin(ta) * tl]], { w: 16 * sc, col: C.furD, seed: 801, wob: .4 });
  fill(g, D.body, base); fill(g, D.haunch, base); fill(g, D.head, base); fill(g, D.snout, wet > .5 ? '#c8a07a' : '#ecc995');
  fill(g, circPts(...T(-10, -120), 34 * sc, 18), C.patch, .8);
  if (wet > 0) { [D.body, D.haunch, D.head].forEach(p => fill(g, p, C.waterL, wet)); }
  shade(g, D.body, 'rgba(59,42,31,.1)', 10); shade(g, D.haunch, 'rgba(59,42,31,.12)', 8);
  [[D.body, 802], [D.haunch, 803], [D.head, 804], [D.snout, 805]].forEach(([p, sd]) => line(g, p, { w: 3.4, close: true, seed: sd }));
  // fur tufts around the outline: spiky out when dry, flattened and dripping when wet
  D.body.concat(D.head).forEach(([px, py], i) => { if (i % 2) return; const cx = i < D.body.length ? T(0, -96) : T(72, -196), dx = px - cx[0], dy = py - cx[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const len = 9 * sc * (1 - wet * .5), dr = wet * .9; line(g, [[px, py], [px + (ux * (1 - dr)) * len, py + (uy * (1 - dr) + dr) * len]], { w: 2.6, col: P.ink, seed: 810 + i, wob: .3 }); });
  // legs + paws
  line(g, [T(40, -30), T(46, 0)], { w: 22 * sc, col: base, seed: 820, wob: .3 }); line(g, [T(40, -30), T(46, 0)], { w: 3, seed: 821, wob: .5 }); fill(g, circPts(...T(54, -2), 22 * sc, 14, .55), base); line(g, circPts(...T(54, -2), 22 * sc, 14, .55), { w: 3, close: true, seed: 822 });
  fill(g, circPts(...T(-30, -2), 30 * sc, 14, .5), base); line(g, circPts(...T(-30, -2), 30 * sc, 14, .5), { w: 3, close: true, seed: 823 });
  // ear (floppy), collar, eye, nose, mouth
  const ear = [T(36, -232), T(66, -240), T(52, -170), T(34, -150), T(22, -176)]; fill(g, ear, C.patch); line(g, ear, { w: 3, close: true, seed: 830 });
  line(g, [T(14, -150), T(60, -136), T(100, -142)], { w: 12 * sc, col: C.collar, seed: 831, wob: .3 }); fill(g, circPts(...T(62, -124), 9 * sc, 12), '#e0b040');
  if (blink > .5) fill(g, circPts(...T(92, -210), 7 * sc, 12), P.ink); else line(g, [T(84, -210), T(92, -204), T(100, -210)], { w: 3, seed: 832, wob: .2 });
  fill(g, circPts(...T(170, -184), 12 * sc, 14, .8), P.ink); line(g, [T(150, -160), T(132, -152), T(112, -158)], { w: 3, seed: 833, wob: .3 });
  if (wet <= .3) fill(g, [T(128, -153), T(140, -150), T(138, -128), T(128, -126)], C.pink, 1 - wet * 3);
  g.restore();
  // shake: motion arcs + droplets flying off
  if (shake > 0) { for (let i = 0; i < 4; i++) { const sd = i % 2 ? 1 : -1; line(g, Array.from({ length: 7 }, (_, j) => { const an = -1.2 + j * .4; return [x + sd * (150 + i * 16) * sc * Math.cos(an) * .5 + sd * 130 * sc, y - 120 * sc + (150 + i * 16) * sc * Math.sin(an) * .5]; }), { w: 3, col: P.soft, a: shake * .8, seed: 840 + i }); }
    for (let i = 0; i < 26; i++) { const an = hash(i) * TAU, u = (t * 1.6 + hash(i * 3)) % 1, d = (90 + 260 * u) * sc, px = x + Math.cos(an) * d, py = y - 130 * sc + Math.sin(an) * d * .8 + 120 * u * u * sc; fill(g, circPts(px, py, (9 - 5 * u) * sc, 10, 1.3), C.water, shake * (1 - u)); } }
  if (wet > 0 && shake <= 0) for (let i = 0; i < 6; i++) { const u = (t * .9 + hash(i * 7)) % 1, px = x + (-70 + hash(i) * 150) * sc; fill(g, circPts(px, y - 30 * sc + u * 60 * sc, 6 * sc, 10, 1.4), C.water, wet * (1 - u)); }
  // stink lines rising off the dog
  for (let i = 0; i < Math.ceil(stink * 5); i++) stinkLine(x + (-80 + i * 46) * sc, y - (200 + 30 * (i % 2)) * sc, 110 * sc * (.6 + .4 * stink), t, i * 1.7, clamp(stink * 5 - i));
  g.restore(); }

// ---------- doodles ----------
function microbe(x, y, kind, t, sd, a = 1) { if (a <= 0) return; const j = 3 * Math.sin(t * 4 + sd), jx = x + j, jy = y + 2 * Math.cos(t * 3.3 + sd);
  if (kind === 0) { const an = hash(sd) * 3; line(g, [[jx - 16 * Math.cos(an), jy - 16 * Math.sin(an)], [jx + 16 * Math.cos(an), jy + 16 * Math.sin(an)]], { w: 13, col: C.bact, seed: sd, wob: .2, a }); line(g, [[jx - 16 * Math.cos(an), jy - 16 * Math.sin(an)], [jx + 16 * Math.cos(an), jy + 16 * Math.sin(an)]], { w: 2, col: P.ink, seed: sd + 1, wob: .2, a: a * .6 }); }
  else { fill(g, circPts(jx, jy, 15, 16, .8), C.yeast, a); line(g, circPts(jx, jy, 15, 16, .8), { w: 2.4, close: true, seed: sd, a }); fill(g, circPts(jx + 15, jy - 10, 8, 12), C.yeast, a); line(g, circPts(jx + 15, jy - 10, 8, 12), { w: 2.2, close: true, seed: sd + 2, a }); }
  if (a > .5) { fill(g, circPts(jx - 4, jy - 2, 2, 6), P.ink, a); fill(g, circPts(jx + 4, jy - 2, 2, 6), P.ink, a); } }
function molecule(x, y, a = 1, sd = 1) { if (a <= 0) return; fill(g, circPts(x, y, 7, 10), C.mol, a); fill(g, circPts(x + 9, y - 5, 5, 10), C.mol, a); line(g, [[x, y], [x + 9, y - 5]], { w: 2, col: P.ink, seed: sd, wob: 0, a }); }
// loupe on the fur: hairs, microbes living on them, molecules stuck (m) then knocked loose (loose)
function loupe(t, cx, cy, rr, { k = 1, micro = 1, m = 0, loose = 0, wet = 0, label = '' } = {}) { if (k <= 0) return; g.save(); g.globalAlpha *= k;
  fill(g, circPts(cx, cy, rr, 36), '#fbf6ee'); if (wet > 0) fill(g, circPts(cx, cy, rr, 36), C.waterL, wet);
  g.save(); g.beginPath(); g.arc(cx, cy, rr - 3, 0, TAU); g.clip();
  const drift = (t * 22) % (rr * .55); for (let i = -1; i < 4; i++) { const x0 = cx - rr + i * rr * .55 + drift, sag = wet * 30; line(g, Array.from({ length: 8 }, (_, j) => { const u = j / 7; return [x0 + u * rr * 1.1, cy + rr - u * rr * 2 + sag * Math.sin(u * Math.PI)]; }), { w: 14, col: C.furD, seed: 860 + i, wob: .3 }); }
  const M = [[-50, 40, 0], [10, -10, 1], [55, 30, 0], [-20, -60, 0], [40, -60, 1], [-60, -20, 1], [5, 60, 0], [-80, 10, 0], [70, -20, 1], [-35, 80, 1], [30, 85, 0], [80, 50, 0], [-70, -60, 0], [0, -90, 1]];
  M.forEach(([dx, dy, kind], i) => microbe(cx + dx * rr / 110, cy + dy * rr / 110, kind, t, 870 + i * 3, clamp(micro * 7 - i)));
  for (let i = 0; i < 14; i++) { const ap = clamp(m * 14 - i); if (ap <= 0) continue; const bx = cx + (hash(i * 3.1) - .5) * rr * 1.4, by = cy + (hash(i * 5.3) - .5) * rr * 1.2, u = clamp(loose * 1.4 - hash(i) * .4);
    molecule(bx + 20 * Math.sin(t * 2 + i) * u, by - u * rr * 1.2, ap, 880 + i); }
  g.restore(); line(g, circPts(cx, cy, rr, 36), { w: 4, close: true, seed: 890 }); line(g, [[cx + rr * .72, cy + rr * .72], [cx + rr * 1.15, cy + rr * 1.15]], { w: 14, seed: 891, wob: .3 });
  if (label) hand(g, label, cx, cy - rr - 18, { size: 40, align: 'center', col: P.soft, w: 500 });
  g.restore(); }
function nose(x, y, react = 0, a = 1) { if (a <= 0) return; line(g, [[x - 30, y - 90], [x - 10, y - 40], [x + 20, y], [x + 4, y + 18], [x - 18, y + 14]], { w: 3.6, seed: 900, a }); line(g, circPts(x - 2, y + 6, 8, 10, .6), { w: 2.6, close: true, seed: 901, a });
  if (react > 0) { hand(g, '!!', x - 60, y - 100, { size: 70, col: P.rust, a: a * react }); for (let i = 0; i < 3; i++) line(g, [[x - 40 - i * 6, y + 30 + i * 10], [x - 66 - i * 10, y + 36 + i * 12]], { w: 3, col: P.rust, a: a * react, seed: 902 + i, wob: .3 }); } }
function bucket(x, y, tip, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(tip * 1.1); const b = [[-40, -40], [40, -40], [30, 40], [-30, 40]]; fill(g, b, '#cfd8dd'); shade(g, b, 'rgba(59,42,31,.1)', 8); line(g, b, { w: 3.4, close: true, seed: 910 }); line(g, Array.from({ length: 9 }, (_, i) => [-40 + i * 10, -40 - 30 * Math.sin(i / 8 * Math.PI)]), { w: 3, seed: 911 }); g.restore(); }
function pour(x0, y0, x1, y1, t, a) { if (a <= 0) return; for (let i = 0; i < 16; i++) { const u = (t * 2.2 + i / 16) % 1, px = lerp(x0, x1, u) + 10 * Math.sin(i), py = lerp(y0, y1, u) + 40 * u * u; fill(g, circPts(px, py, 8, 10, 1.4), C.water, a); } line(g, [[x0, y0], [lerp(x0, x1, .5), lerp(y0, y1, .5) + 10], [x1, y1]], { w: 10, col: C.waterL, seed: 915, wob: .2, a }); }
function mushroom(x, y, a = 1) { const cap = Array.from({ length: 14 }, (_, i) => { const an = Math.PI + i / 13 * Math.PI; return [x + Math.cos(an) * 60, y - 40 + Math.sin(an) * 44]; }); fill(g, cap, '#c0543a', a); line(g, cap, { w: 3.4, close: true, seed: 920, a }); [[-25, -62], [12, -70], [30, -52]].forEach(([dx, dy], i) => fill(g, circPts(x + dx, y + dy, 7, 10), '#fbf6ee', a));
  const st = rectPts(x - 18, y - 40, 36, 52, 3); fill(g, st, '#f1e4cc', a); line(g, st, { w: 3, close: true, seed: 921, a }); }
function cherry(x, y, a = 1) { [[-22, 0], [22, 8]].forEach(([dx, dy], i) => { fill(g, circPts(x + dx, y + dy, 26, 18), '#b33a3a', a); line(g, circPts(x + dx, y + dy, 26, 18), { w: 3, close: true, seed: 925 + i, a }); line(g, [[x + dx, y + dy - 24], [x + 4, y - 80]], { w: 3, seed: 927 + i, a }); }); fill(g, [[x + 4, y - 80], [x + 40, y - 92], [x + 18, y - 70]], '#7d9a3c', a); }
function flower(x, y, a = 1) { for (let i = 0; i < 6; i++) { const an = i * TAU / 6; fill(g, circPts(x + Math.cos(an) * 28, y - 40 + Math.sin(an) * 28, 20, 14), '#e7a3a0', a); } fill(g, circPts(x, y - 40, 16, 14), '#e0b040', a); line(g, [[x, y - 20], [x - 4, y + 12]], { w: 4, col: '#7d9a3c', seed: 930, a }); }
function poop(x, y, a = 1) { [[0, 0, 52, 18], [0, -24, 40, 16], [2, -46, 26, 13]].forEach(([dx, dy, rx, ry], i) => { const p = circPts(x + dx, y + dy, rx, 20, ry / rx); fill(g, p, '#8a5a34', a); line(g, p, { w: 3, close: true, seed: 935 + i, a }); });
  line(g, [[x + 2, y - 59], [x + 10, y - 72], [x + 2, y - 80]], { w: 3, seed: 939, a }); fill(g, circPts(x - 12, y - 26, 4, 8), P.ink, a); fill(g, circPts(x + 12, y - 26, 4, 8), P.ink, a); line(g, [[x - 10, y - 14], [x, y - 8], [x + 10, y - 14]], { w: 2.6, seed: 938, a }); }
function bowl(x, y, w, a = 1) { const b = Array.from({ length: 16 }, (_, i) => { const an = i / 15 * Math.PI; return [x + Math.cos(an) * w / 2, y + Math.sin(an) * w * .32]; }); fill(g, b, '#ecdcc3', a); shade(g, b, 'rgba(59,42,31,.1)', 9, a); line(g, b, { w: 3.6, close: true, seed: 940, a }); }
function tub(x, y, w, h, a = 1) { const b = rectPts(x, y, w, h, 8); fill(g, b, '#eef3f5', a); shade(g, b, 'rgba(59,42,31,.08)', 10, a); line(g, b, { w: 3.6, close: true, seed: 945, a }); line(g, [[x + 40, y + h], [x + 30, y + h + 30]], { w: 5, seed: 946, a }); line(g, [[x + w - 40, y + h], [x + w - 30, y + h + 30]], { w: 5, seed: 947, a }); }

// ---------- scenes ----------
function hook(t) { const a = 1 - ss(seg(t, s(2) - .4, s(2))); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const sh = 1 - ss(seg(t, 2.2, 2.9)), lp = ss(seg(t, r(1, 1.2), r(1, 1.9)));
  dog(t, { x: 360, y: 1130, sc: 1.45, wet: 1, shake: sh, stink: .9 - .5 * lp, blink: sh > .5 ? 0 : 1 });
  loupe(t, 760, 880, 150, { k: bo(seg(t, r(1, 1.2), r(1, 1.8))), micro: seg(t, r(1, 1.6), r(1, 2.6)), wet: 1, label: 'who lives on it' });
  if (lp > 0) line(g, [[520, 920], [610, 900]], { w: 3, col: P.soft, k: lp, seed: 950 });
  hand(g, 'Wet dog.', 70, 430, { size: 128 }); hand(g, 'Why the stink?', 70, 560, { size: 120, col: P.rust });
  // the search question (typed)
  const q = 'why do wet dogs smell so bad', n = Math.floor(q.length * seg(t, .3, 2.0)); if (n > 0 && t < r(1, 1.2)) { g.save(); g.globalAlpha *= 1 - seg(t, r(1, .8), r(1, 1.2)); g.fillStyle = '#fffaf2'; g.shadowColor = 'rgba(80,50,20,.15)'; g.shadowBlur = 16; g.beginPath(); g.roundRect(70, 610, 880, 84, 42); g.fill(); g.restore();
    line(g, circPts(118, 652, 16, 16), { w: 3, close: true, seed: 956 }); line(g, [[130, 664], [144, 678]], { w: 3.6, seed: 957, wob: 0 }); hand(g, q.slice(0, n) + (n < q.length && (t * 2) % 1 < .5 ? '|' : ''), 160, 668, { size: 50, a: 1 - seg(t, r(1, .8), r(1, 1.2)) }); }
  g.restore(); }

const DX = 330, DY = 1120;   // the dog's spot in the recipe section
function recipe(t) { const a = win(t, s(2) - .3, s(10) - .1, .4); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const nd = TW.filter(x => t >= x).length, cur = Math.min(ROWS.length - 1, nd), tickK = nd ? seg(t, TW[nd - 1], TW[nd - 1] + .35) : 0;
  const slide = eo(seg(t, s(2) - .3, s(2) + .5)); g.save(); g.translate((1 - slide) * 520, 0);
  card(g, { meta: 'SERVES 1 NOSE · NO OVEN', title: ['Wet Dog', 'Smell'], rows: ROWS, done: nd, cur: t > s(2) + .6 && nd < 5 ? cur : -1, footer: 'ACS REACTIONS · VET STUDIES', t, tickK }); g.restore();
  // STINK scale (the demo's % scale beside the glass)
  const lev = t < s(5) ? .05 : t < s(7) ? lerp(.05, .12, seg(t, s(5), s(6))) : t < s(9) ? lerp(.12, .4, seg(t, r(8, .2), r(8, 1.4))) : lerp(.4, .95, seg(t, r(9, .8), r(9, 3.0)));
  scale(g, 130, DY - 6, DY - 250, [[0, '0'], [.25, '25'], [.5, '50'], [.75, '75'], [1, '100%']], lev, { a: seg(t, s(2), s(2) + .4) }); mono(g, 'STINK', 90, DY - 270, { size: 18, col: P.rust, track: 3, a: seg(t, s(2), s(2) + .4) });
  const wet = t < s(7) ? 0 : ss(seg(t, r(7, .5), r(7, 1.6))) * (1 - .55 * ss(seg(t, r(9, .6), r(9, 3.5))));
  dog(t, { x: DX, y: DY, sc: .95, wet, k: seg(t, s(2) - .2, s(2) + .4), stink: lev, blink: (t % 3.1) < 2.9 ? 1 : 0 });
  if (t < s(3) - .2) header(g, { title: 'the recipe', note: 'for wet dog smell' });
  else if (t < s(5) - .2) { const k2 = bo(seg(t, r(3, 2.2), r(3, 2.8))), zz = ss(seg(t, r(4, .2), r(4, 2.2))) * (1 - ss(seg(t, s(5) - 1.4, s(5) - .3)));
    loupe(t, lerp(740, 690, zz), lerp(960, 930, zz), lerp(130, 185, zz), { k: k2, micro: seg(t, r(3, 2.5), r(3, 3.6)) + seg(t, r(4, 2.2), r(4, 5.0)) });
    if (t < s(4) - .2) header(g, { step: 1, of: 4, title: 'Add a dog', num: '1', unit: 'dog', sub: 'SKIN + FUR', note: 'home to bacteria + yeast' });
    else { header(g, { title: 'Totally normal', note: 'furry skin: the richest mix' }); mono(g, 'TEXAS A&M VET STUDY', 60, 640, { size: 20, col: P.rust, track: 4, a: seg(t, r(4, 1.2), r(4, 1.8)) });
      for (let i = 0; i < 3; i++) line(g, [[620 + i * 40, 800 - i * 6], [640 + i * 40, 830]], { w: 3, col: P.rust, k: seg(t, r(4, 3) + i * .1, r(4, 3.4) + i * .1), seed: 960 + i }); } }
  else if (t < s(7) - .2) { const m = seg(t, r(5, .6), r(5, 2.4)); loupe(t, 740, 960, 130, { micro: 1, m });
    if (t < s(6) - .2) header(g, { step: 2, of: 4, title: 'Microbes make smells', note: 'tiny smelly molecules' });
    else { header(g, { title: 'Dry: they stay put', note: 'you barely notice' }); hand(g, 'zzz', 860, 830, { size: 50, col: P.soft, align: 'right', a: seg(t, r(6, .8), r(6, 1.4)) }); } }
  else if (t < s(9) - .2) { const tip = ss(seg(t, s(7) - .1, r(7, .5))) * (1 - ss(seg(t, r(8, 1.0), r(8, 1.6)))); bucket(250, 820, tip, seg(t, s(7) - .2, s(7) + .2)); pour(290, 830, 330, 960, t, tip);
    loupe(t, 740, 960, 130, { micro: 1, m: 1, loose: seg(t, r(8, .3), r(8, 1.8)) * .35, wet: seg(t, r(7, .6), r(7, 1.4)) });
    if (t < s(8) - .2) header(g, { step: 3, of: 4, title: 'Add water', num: '1', unit: 'splash', note: 'the dog gets soaked' }); else header(g, { title: 'Knocked loose', note: 'molecules come off the fur' }); }
  else { const up = seg(t, r(9, .6), r(9, 3.6)); loupe(t, 560, 960, 110, { micro: 1, m: 1, loose: .35 + .65 * up, wet: 1 - .5 * up });
    for (let i = 0; i < 12; i++) { const u = (t * .45 + i / 12) % 1, px = lerp(360, 790, u) + 16 * Math.sin(t * 2 + i), py = lerp(980, 860, u) - 160 * Math.sin(u * Math.PI); line(g, [[px - 10, py + 20], [px, py], [px - 6, py - 18]], { w: 3, col: C.water, a: up * (1 - u) * .8, seed: 970 + i, wob: .4 }); molecule(px + 12, py - 4, up * (1 - u * .6), 980 + i); }
    nose(850, 900, seg(t, r(9, 2.6), r(9, 3.2)), seg(t, r(9, .2), r(9, .8)));
    header(g, { step: 4, of: 4, title: 'Let it dry', note: 'evaporation lifts them' }); }
  g.restore(); }

function mix(t) { const a = win(t, s(10) - .3, s(17) - .1, .4); if (a <= 0) return; g.save(); g.globalAlpha = a;
  card(g, { meta: 'SERVES 1 NOSE · NO OVEN', title: ['Wet Dog', 'Smell'], rows: ROWS, done: 5, cur: -1, footer: 'ACS REACTIONS · VET STUDIES', t, tickK: 1 });
  if (t < s(12) - .2) {   // how many smells: 16 dry vs 22 wet
    const k = seg(t, r(11, .4), r(11, 2.2)), k2 = seg(t, r(11, 3.6), r(11, 4.8));
    hand(g, 'wet', 80, 960, { size: 54, col: P.rust, a: seg(t, r(11, .2), r(11, .6)) }); hand(g, 'dry', 80, 1080, { size: 54, col: P.soft, a: seg(t, r(11, 3.4), r(11, 3.8)) });
    for (let i = 0; i < 22; i++) { const kk = clamp(k * 22 - i); if (kk > 0) { g.save(); g.translate(205 + i * 30, 950 + 8 * Math.sin(t * 3 + i)); g.scale(1.5, 1.5); molecule(0, 0, kk, 990 + i); g.restore(); } }
    for (let i = 0; i < 16; i++) { const kk = clamp(k2 * 16 - i); if (kk > 0) { g.save(); g.translate(205 + i * 30, 1070); g.scale(1.5, 1.5); molecule(0, 0, kk, 1020 + i); g.restore(); } }
    if (t < s(11) - .2) { header(g, { title: 'How many smells?', note: 'in that drying cloud' }); dog(t, { x: 380, y: 1120, sc: .9, wet: .5, stink: .9 }); }
    else header(g, { title: 'Key odor compounds', num: '22', unit: 'wet', sub: 'ONE SMALL STUDY', note: 'dry hair: 16' }); }
  else if (t < s(14) - .2) {   // what they smell like
    const P4 = [[170, mushroom, 'mushroom', r(12, .3)], [380, cherry, 'fruity', r(12, 1.4)], [580, flower, 'floral', r(12, 2.3)], [790, poop, 'poop', r(13, .9)]];
    P4.forEach(([x, f, lab, t0], i) => { const k = bo(seg(t, t0, t0 + .45)); if (k <= 0) return; g.save(); g.translate(x, 1050); g.scale(k * 1.35, k * 1.35); f(0, 0, 1); g.restore(); hand(g, lab, x, 1118, { size: 44, align: 'center', col: i === 3 ? P.rust : P.soft, a: clamp(k) });
      if (i === 3) for (let j = 0; j < 3; j++) stinkLine(x - 30 + j * 30, 940, 80, t, j * 2.1, clamp(k)); });
    header(g, t < s(13) - .2 ? { title: 'What they smell like', note: 'a little of everything' } : { title: '...and some', num: 'poop', unit: '', note: 'p-cresol: fecal', numSize: 140 }); }
  else if (t < s(15) - .2) {   // one compound x32
    const k = seg(t, r(14, .8), r(14, 2.6)), bx = [300, 520], base = 1110, top = 860;
    line(g, [[200, base], [700, base]], { w: 3, seed: 1040 }); fill(g, rectPts(bx[0] - 50, base - (base - top) / 32, 100, (base - top) / 32, 2), P.faint); fill(g, rectPts(bx[1] - 50, base - (base - top) * k, 100, (base - top) * k, 2), P.rust);
    line(g, rectPts(bx[1] - 50, base - (base - top) * k, 100, (base - top) * k, 2), { w: 3, close: true, seed: 1041, a: k > 0 ? 1 : 0 });
    hand(g, 'dry', bx[0], base + 50 - 6, { size: 44, align: 'center', col: P.soft }); hand(g, 'wet', bx[1], base + 50 - 6, { size: 44, align: 'center', col: P.rust });
    nose(820, 990, seg(t, r(14, 2.4), r(14, 2.9))); header(g, { title: 'One jumped', num: '32×', unit: 'higher', sub: 'BENZALDEHYDE', note: 'once the hair got wet' }); }
  else if (t < s(16) - .2) {   // the whole mix: everything into the bowl
    bowl(500, 1040, 440); const st = seg(t, r(15, .2), r(15, 1.6));
    [[mushroom, 220, -1], [cherry, 420, 0], [flower, 610, 1], [poop, 800, 2]].forEach(([f, x0, i]) => { const u = ss(clamp(st * 1.4 - (i + 1) * .12)); g.save(); g.translate(lerp(x0, 440 + i * 50, u), lerp(1040, 1020, u) - 160 * Math.sin(u * Math.PI)); g.scale(1.2 - .5 * u, 1.2 - .5 * u); f(0, 0, 1); g.restore(); });
    const sp = t * 2.4; line(g, [[500 + 60 * Math.cos(sp), 1000 + 14 * Math.sin(sp)], [560 + 40 * Math.cos(sp), 850]], { w: 8, col: '#9a6a3a', seed: 1050, wob: .2, a: seg(t, r(15, 1.2), r(15, 1.6)) });
    for (let i = 0; i < 4; i++) stinkLine(400 + i * 60, 990, 120, t, i * 1.3, seg(t, r(15, 1.6), r(15, 2.2)));
    header(g, { title: 'No single molecule', note: "it's the whole mix", k: 1 }); hand(g, '= wet dog', 860, 880, { size: 56, col: P.rust, align: 'right', write: seg(t, r(15, 1.8), r(15, 2.6)) }); }
  else {   // the bath
    const k = seg(t, s(16) - .2, s(16) + .4); tub(180, 960, 520, 150, k); dog(t, { x: 380, y: 1075, sc: .8, wet: 1, k, stink: seg(t, r(16, 1.2), r(16, 2.6)) });
    g.save(); g.beginPath(); g.rect(170, 990, 540, 200); g.clip(); fill(g, rectPts(176, 990, 528, 125, 6), 'rgba(207,224,234,.92)'); for (let i = 0; i < 16; i++) { const bx = 200 + hash(i) * 480, by = 985 + 10 * Math.sin(t * 2 + i); line(g, circPts(bx, by, 10 + 10 * hash(i * 3), 12), { w: 2.4, col: '#6f8fa3', close: true, seed: 1060 + i }); } g.restore();
    line(g, rectPts(180, 960, 520, 150, 8), { w: 3.6, close: true, seed: 945 });
    header(g, { title: 'Bath time?', note: 'you just added water', k: 1 }); hand(g, '+ water', 860, 900, { size: 56, col: P.rust, align: 'right', write: seg(t, r(16, 2.6), r(16, 3.2)) }); }
  g.restore(); }

function signoff(t) { const a = win(t, s(17) - .3, s(19) - .1, .4); if (a <= 0) return; g.save(); g.globalAlpha = a;
  if (t < s(18) - .2) { const k = seg(t, s(17) + .2, s(17) + 1.6); hand(g, 'Good stink.', 540, 640, { size: 170, align: 'center', write: k }); splats(g, 900, 520, seg(t, s(17) + 1.5, s(17) + 2), 7); splats(g, 180, 700, seg(t, s(17) + 1.7, s(17) + 2.2), 13);
    mono(g, 'FUR · MICROBES · WATER · YOUR NOSE', 540, 740, { size: 22, col: P.soft, align: 'center', track: 4, a: seg(t, s(17) + 1.2, s(17) + 1.8) });
    dog(t, { x: 420, y: 1130, sc: 1.05, wet: .6, stink: 1, blink: 1 }); nose(820, 960, seg(t, r(17, 2.4), r(17, 3)), 1); }
  else { hand(g, 'Does yours stink', 540, 520, { size: 104, align: 'center' }); hand(g, 'when wet?', 540, 640, { size: 110, align: 'center', col: P.rust });
    [['yes', 360], ['no', 700]].forEach(([w, x], i) => { const k = seg(t, s(18) + .8 + i * .3, s(18) + 1.3 + i * .3); line(g, circPts(x - 70, 860, 30, 20), { w: 3.4, close: true, seed: 1100 + i, k }); hand(g, w, x - 20, 885, { size: 90, a: k }); });
    dog(t, { x: 540, y: 1130, sc: .7, wet: .3, stink: .6 }); }
  g.restore(); }

function endcard(t) { const t0 = s(19) - .25, a = ss(seg(t, t0, t0 + .5)); if (a <= 0) return; g.save(); g.globalAlpha = a;
  mono(g, 'HOW IT REALLY WORKS · RECIPE CARD', 540, 560, { size: 20, col: P.rust, align: 'center', track: 5 });
  hand(g, 'Follow for more of', 540, 700, { size: 92, align: 'center', write: seg(t, t0 + .1, t0 + .8) }); hand(g, 'how it really works.', 540, 820, { size: 110, align: 'center', write: seg(t, t0 + .5, t0 + 1.3) });
  line(g, [[300, 850], [540, 846], [780, 842]], { w: 3, seed: 1110, k: seg(t, t0 + 1.0, t0 + 1.5) });
  hand(g, "A new 'wait, really?' every day.", 540, 930, { size: 50, align: 'center', col: P.soft, w: 500, a: seg(t, t0 + 1.2, t0 + 1.6) });
  mono(g, '@howitreallyworkstudio', 540, 1010, { size: 26, col: P.ink, align: 'center', track: 2, a: seg(t, t0 + 1.4, t0 + 1.8) });
  dog(t, { x: 520, y: 1140, sc: .42, stink: .4 }); splats(g, 860, 640, seg(t, t0 + 1.3, t0 + 1.8), 21); g.restore(); }

function stepIndex(t) { if (t < s(3)) return [0, seg(t, s(2), s(3))]; if (t < s(5)) return [1, seg(t, s(3), s(5))]; if (t < s(7)) return [2, seg(t, s(5), s(7))]; if (t < s(9)) return [3, seg(t, s(7), s(9))]; if (t < s(10)) return [4, seg(t, s(9), s(10))]; return [5, seg(t, s(10), s(17))]; }
function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(paper(), 0, 0);
  hook(t); recipe(t); mix(t); signoff(t); endcard(t);
  if (t > s(2) - .3 && t < s(17)) { const [i, u] = stepIndex(t); g.save(); g.globalAlpha = seg(t, s(2) - .3, s(2) + .2) * (1 - seg(t, s(17) - .4, s(17))); progress(g, STEPS, i, u); g.restore(); }
  const ph = PH.findLast(p => t >= p.start - .1); if (ph && ph.i < PH.length - 1) { const nx = PH[ph.i + 1].start; caption(g, ph.cap, seg(t, ph.start - .1, ph.start + .12) * (1 - seg(t, nx - .2, nx - .05)), 1290); }
}
window.DUR = TOT;
// loop: blend the frame-0 hook back in over the last 0.5 s (max 30%)
window.seek = t => { scene(t); const lp = seg(t, TOT - .5, TOT); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); scene(0); const f0 = g.getImageData(0, 0, W, H); const k = .3 * ss(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paper(), 0, 0); dog(.37, { x: 420, y: 1330, sc: 1.6, wet: 1, shake: 1, stink: 1, blink: 0 });
  mono(g, 'STEP 1 / 4 · THE RECIPE', 90, 360, { size: 26, col: P.rust, track: 5 }); hand(g, 'Wet dog', 80, 520, { size: 170 }); hand(g, 'smell?', 80, 690, { size: 170, col: P.rust }); hand(g, "it's a microbe recipe", 540, 1520, { size: 70, align: 'center' }); splats(g, 900, 560, 1, 3); };
window.seek(0); window.ready = true; window.READY = true;
