// t_coldtaste.js: "Why can't you taste food when you have a cold?" in template #23 Recipe card (demo t23), same kit as handwarmer.
// The demo's recipe grammar carries the explanation: flavor is a recipe (a few basic tastes + lots of smell + an open nose), poured into a
// cut-away of the mouth and nose the way the demo pours a cocktail into a glass: step header + big counter + checklist card + segmented
// progress bar + a measuring scale (here a "flavor" meter) + the handwritten sign-off, "Good drink." becoming "Good nose."
// Batch N layout: progress bar y 290, header and card inside y 360-830, the face cut-away inside y 760-1130 (left), captions centred at
// y 1290 inside x 180-900, nothing written in the right column below y 840. Pure function of t.
import { create, W, H, TAU, P, clamp, lerp, seg, ss, eo, bo, hash, paper, hand, mono, line, rectPts, circPts, fill, shade, progress, header, card, scale, splats, parse } from './styles/recipe/recipe.js';
await Promise.all([document.fonts.load('700 60px Caveat'), document.fonts.load('500 22px Mono')]);
const g = create(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, r = (i, d) => s(i) + d, TOT = TL.total;
const win = (t, a, b, f = .4) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const STEPS = ['RECIPE', 'TONGUE', 'SMELL', 'COLD', 'TEST', 'NOSE'];
const ROWS = [{ amt: '5', item: 'basic tastes' }, { amt: 'lots of', item: 'smell' }, { amt: '1', item: 'open nose' }];
const TASTE = [['sweet', '#e58aa6'], ['salty', '#9fb7c9'], ['sour', '#d8c24a'], ['bitter', '#7e8f5a'], ['umami', '#b9744a']];

// ---------- the face cut-away (the demo's glass): lower face in profile, facing right ----------
// o: { taste 0..1 (tongue dots), smell 0..1 (aroma particles up the channel), block 0..1 (mucus plug), pinch 0..1 (fingers on the nose), food: 'none'|'bean'|..., flavor 0..1 (sparkle in the mouth) }
const FX = 40, FY = 690, FS = 1.22;   // origin and scale of the cut-away box (440 x 370 units -> y 690-1140)
function face(t, o = {}) {
  const { taste = 0, smell = 0, block = 0, pinch = 0, flavor = 0, k = 1, food = null, cam = null, clip = null, cells = 0, swell = 0 } = o; if (k <= 0) return; const c = g; c.save(); c.globalAlpha *= k;
  if (clip) { const [px, py, pw, ph] = clip; c.save(); c.fillStyle = '#fbf6ee'; c.shadowColor = 'rgba(80,50,20,.16)'; c.shadowBlur = 18; c.beginPath(); c.roundRect(px, py, pw, ph, 22); c.fill(); c.restore(); c.beginPath(); c.roundRect(px, py, pw, ph, 22); c.clip(); }
  if (cam) { const [ux, uy, z, sx, sy] = cam; c.translate(sx - ux * z, sy - uy * z); c.scale(z, z); } else { c.translate(FX, FY); c.scale(FS, FS); }
  const labels = !cam || cam[2] < 1.6;
  // skin profile: forehead -> nose -> lip -> chin -> neck (pencil line), soft fill
  const prof = smooth([[60, 0], [230, 4], [292, 30], [306, 70], [296, 96], [318, 128], [352, 158], [392, 178], [372, 190], [340, 194], [350, 214], [364, 226], [346, 240], [366, 254], [352, 268], [334, 286], [352, 312], [338, 336], [290, 356], [200, 370], [60, 370]]);
  fill(c, prof, '#f3dccb'); shade(c, prof, 'rgba(59,42,31,.06)', 12);
  // nasal cavity (air space) + the channel from the back of the mouth up into the nose (retronasal route)
  const nose = [[120, 120], [300, 112], [372, 172], [338, 186], [250, 178], [130, 176]];
  const chan = [[96, 150], [124, 150], [124, 260], [96, 260]];
  const mouth = [[110, 238], [330, 236], [344, 252], [330, 268], [110, 276]];
  fill(c, nose, '#fbf3ea'); fill(c, chan, '#fbf3ea'); fill(c, mouth, '#f6c9c0');
  line(c, nose, { w: 2.6, close: true, seed: 801 }); line(c, mouth, { w: 2.6, close: true, seed: 803 });
  line(c, [[96, 150], [96, 260]], { w: 2.6, seed: 804 }); line(c, [[124, 176], [124, 238]], { w: 2.6, seed: 805 });
  // smell cells: a fringe on the roof of the nose (glow when highlighted)
  for (let i = 0; i < 9; i++) { const x = 186 + i * 11; line(c, [[x, 116], [x + 2, 128]], { w: 2, col: '#8a5a3a', seed: 811 + i, wob: .2 }); if (cells > 0) { c.save(); c.globalAlpha *= cells * (.5 + .5 * Math.sin(t * 6 + i)); c.fillStyle = '#e0a24a'; c.beginPath(); c.arc(x + 2, 129, 4, 0, TAU); c.fill(); c.restore(); } }
  // swelling: the lining of the channel and the nose puffs up
  if (swell > 0) { const sw = swell, pk = '#e9a79c';
    [[[96, 150], [96 + 13 * sw, 172], [96 + 15 * sw, 228], [96, 260]], [[124, 176], [124 - 12 * sw, 192], [124 - 14 * sw, 224], [124, 238]], [[160, 128], [300, 124], [300, 124 + 14 * sw], [230, 132 + 18 * sw], [160, 130 + 14 * sw]], [[140, 176], [250, 178], [230, 178 - 16 * sw], [150, 176 - 12 * sw]]]
      .forEach((q, i) => { fill(c, q, pk); line(c, q, { w: 2, col: '#b5584a', close: true, seed: 890 + i, wob: .4 }); }); }
  // tongue + the five taste dots
  const tongue = [[124, 262], [300, 254], [322, 262], [300, 272], [124, 274]]; fill(c, tongue, '#e7958c'); line(c, tongue, { w: 2.2, close: true, seed: 806, wob: .5 });
  if (taste > 0) TASTE.forEach(([n, col], i) => { const kk = clamp(taste * 5 - i); if (kk <= 0) return; c.fillStyle = col; c.beginPath(); c.arc(150 + i * 36, 264, 9 * bo(kk), 0, TAU); c.fill(); });
  line(c, prof, { w: 3.4, seed: 800 });
  // eye (closed, content) and a nostril
  line(c, [[230, 64], [250, 72], [270, 64]], { w: 3, seed: 807 }); line(c, circPts(352, 178, 7, 10), { w: 2.4, close: true, seed: 808 });
  // aroma particles: from the food in the mouth, back and up the channel, into the nose (or bounced back by the plug)
  if (smell > 0) for (let i = 0; i < 16; i++) { const u = (t * .45 + i / 16) % 1, st = clamp(u * 3), up = clamp(u * 3 - 1), across = clamp(u * 3 - 2);
    let x = lerp(260, 110, st), y = 250; if (up > 0) { x = 110; y = lerp(250, 160, up); } if (across > 0) { x = lerp(110, 230, across); y = lerp(158, 132, across) + 6 * Math.sin(across * 6); }
    if (block > 0 && up > .45) { x = 110 + 12 * Math.sin(u * 40); y = lerp(205, 240, (u * 7) % 1); }
    c.fillStyle = ['#e0567a', '#7b4a2a', '#d9b84a'][i % 3]; c.globalAlpha = k * smell * (block > 0 ? .9 : 1); c.beginPath(); c.arc(x + 4 * Math.sin(t * 3 + i), y, 5.5, 0, TAU); c.fill(); c.globalAlpha = k; }
  // mucus plug (the cold)
  if (block > 0) { c.save(); c.globalAlpha *= block; const pl = circPts(110, 196, 22, 16, 1.6).map(([x, y], i) => [x + 3 * Math.sin(i + t * 2), y]); fill(c, pl, '#b9cf8a'); line(c, pl, { w: 2.4, close: true, seed: 809 });
    const pl2 = circPts(300, 150, 30, 16, .7); fill(c, pl2, '#b9cf8a'); line(c, pl2, { w: 2.4, close: true, seed: 810 }); c.restore(); }
  // pinching fingers on the nose
  if (pinch > 0) { c.save(); c.globalAlpha *= pinch; const fx = 380 + 40 * (1 - pinch);
    [[fx + 10, 132], [fx + 6, 196]].forEach(([x, y], i) => { const f = rectPts(x, y - 16, 90, 32, 5); fill(c, f, '#f0cdb8'); line(c, f, { w: 2.6, close: true, seed: 820 + i }); }); c.restore(); }
  // food in the mouth
  if (food === 'bean') { c.save(); const b = circPts(270, 252, 22, 18, .62); fill(c, b, '#d9435a'); line(c, b, { w: 2.2, close: true, seed: 830 }); c.restore(); }
  // flavor sparkle in the mouth
  if (flavor > 0) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t, rr = 26 + 8 * Math.sin(t * 4 + i); line(c, [[230 + Math.cos(a) * rr, 248 + Math.sin(a) * rr * .6], [230 + Math.cos(a) * (rr + 16), 248 + Math.sin(a) * (rr + 16) * .6]], { w: 3, col: P.rust, a: flavor, seed: 840 + i, wob: .3 }); }
  // pencil labels on the drawing
  if (labels) { hand(c, 'nose', 300, 104, { size: 30, col: P.soft }); hand(c, 'mouth', 200, 300, { size: 30, col: P.soft }); }
  c.restore(); if (clip) { line(g, rectPts(clip[0], clip[1], clip[2], clip[3]), { w: 3, close: true, seed: 899, a: k }); }
}
// Catmull-Rom smoothing for the profile (the demo's pencil curves)
function smooth(P, n = 6) { const o = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
  for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; o.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3))); } } o.push(P[P.length - 1]); return o; }
// food doodles: strawberry, coffee bean, garlic
function strawberry(x, y, s = 1, a = 1) { const c = g; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); const b = [[0, -40], [34, -30], [40, 0], [22, 40], [0, 56], [-22, 40], [-40, 0], [-34, -30]]; fill(c, b, '#e0566e'); line(c, b, { w: 2.6, close: true, seed: 850 });
  for (let i = 0; i < 9; i++) { c.fillStyle = '#f7e08a'; c.beginPath(); c.ellipse(-20 + (i % 3) * 20, -14 + Math.floor(i / 3) * 20, 2.5, 4, 0, 0, TAU); c.fill(); }
  const lf = [[-30, -40], [0, -54], [30, -40], [12, -34], [0, -46], [-12, -34]]; fill(c, lf, '#7fae5a'); line(c, lf, { w: 2.2, close: true, seed: 851 }); c.restore(); }
function bean(x, y, s = 1, a = 1) { const c = g; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); const b = circPts(0, 0, 34, 20, 1.4); fill(c, b, '#7b4a2a'); line(c, b, { w: 2.6, close: true, seed: 852 }); line(c, [[0, -44], [6, -10], [-6, 14], [0, 44]], { w: 2.6, col: '#3b2a1f', seed: 853 }); c.restore(); }
function garlic(x, y, s = 1, a = 1) { const c = g; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); const b = [[0, -48], [10, -24], [40, -6], [44, 24], [24, 44], [-24, 44], [-44, 24], [-40, -6], [-10, -24]]; fill(c, b, '#f6f0e2'); line(c, b, { w: 2.6, close: true, seed: 854 });
  [-20, 0, 20].forEach((dx, i) => line(c, [[dx * .4, -20], [dx, 10], [dx * .8, 42]], { w: 2, col: P.soft, seed: 855 + i })); c.restore(); }
function jelly(x, y, s = 1, col = '#d9435a', a = 1) { const c = g; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); const b = circPts(0, 0, 60, 24, .62); fill(c, b, col); line(c, b, { w: 3, close: true, seed: 860 }); line(c, [[-30, -18], [10, -26]], { w: 6, col: 'rgba(255,255,255,.7)', seed: 861, wob: .3 }); c.restore(); }
// the flavor meter (the demo's measuring scale), right of the cut-away
let LAST = 0;
function meter(level, a = 1) { LAST = level; scale(g, 700, 1120, 900, [[0, 'none'], [.5, 'some'], [1, 'full']], level, { a }); hand(g, 'flavor', 660, 875, { size: 40, col: P.soft, a }); }
// equation strip under the caption (taste + smell = flavor), lit by the current state
function strip(t) { const sm = clamp((LAST - .25) * 3), y = 1412; g.save(); g.fillStyle = 'rgba(236,220,195,.9)'; g.beginPath(); g.roundRect(170, y - 28, 740, 56, 28); g.fill(); g.restore();
  const dot = (x, col, v) => { g.save(); g.fillStyle = 'rgba(59,42,31,.12)'; g.beginPath(); g.arc(x, y, 14, 0, TAU); g.fill(); g.globalAlpha = clamp(v); g.fillStyle = col; g.beginPath(); g.arc(x, y, 14, 0, TAU); g.fill(); g.restore(); };
  mono(g, 'TASTE', 210, y + 8, { size: 20, col: P.ink, track: 3 }); dot(320, '#e58aa6', 1); hand(g, '+', 360, y + 14, { size: 44 });
  mono(g, 'SMELL', 400, y + 8, { size: 20, col: sm > .5 ? P.ink : P.faint, track: 3 }); dot(510, '#7b4a2a', sm); hand(g, '=', 552, y + 14, { size: 44 });
  mono(g, 'FLAVOR', 600, y + 8, { size: 20, col: P.ink, track: 3 }); dot(730, P.rust, LAST); hand(g, LAST > .6 ? 'full' : LAST > .3 ? 'some' : 'bland', 770, y + 12, { size: 34, col: P.rust }); }

// ---------- scenes ----------
// camera shots on the cut-away: [unit x, unit y, zoom, screen x, screen y]; close-ups sit in a paper panel (y 650-1150)
const WIDE = [200, 185, FS, FX + 200 * FS, FY + 185 * FS], PANEL = [60, 650, 960, 500];
const TONGUE = [215, 262, 3.6, 540, 930], BACK = [190, 245, 3.0, 560, 940], CHAN = [110, 200, 3.0, 400, 900], CELLS = [228, 132, 3.2, 560, 880], NOSE = [200, 175, 2.6, 540, 900];
const mix = (A, B, k) => A.map((v, i) => lerp(v, B[i], k));
const toScr = (cam, x, y) => [cam[3] + (x - cam[0]) * cam[2], cam[4] + (y - cam[1]) * cam[2]];
const vis = (t, a, b, f = .35) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
function hook(t) { const a = 1 - ss(seg(t, s(2) - .4, s(2))); if (a <= 0) return; g.save(); g.globalAlpha = a;
  hand(g, 'Tongue: fine.', 70, 470, { size: 104 }); hand(g, 'Nose: off.', 70, 590, { size: 104, col: P.rust });
  // frame 0: a big strawberry, and the flavor meter beside it draining away
  strawberry(400, 910 + 8 * Math.sin(t * 2.2), 3.0); hand(g, '?', 590, 790, { size: 120, col: P.rust, a: .35 + .65 * seg(t, .3, .9) });
  meter(lerp(1, .06, ss(seg(t, 0, 1.8))));
  const q = "why can't i taste food with a cold", n = Math.floor(q.length * seg(t, r(1, .2), r(1, 2.2))); if (n > 0) { g.save(); g.fillStyle = '#fffaf2'; g.shadowColor = 'rgba(80,50,20,.15)'; g.shadowBlur = 16; g.beginPath(); g.roundRect(70, 640, 860, 84, 42); g.fill(); g.restore();
    line(g, circPts(118, 682, 16, 16), { w: 3, close: true, seed: 356 }); line(g, [[130, 694], [144, 708]], { w: 3.6, seed: 357, wob: 0 }); hand(g, q.slice(0, n) + (n < q.length && (t * 2) % 1 < .5 ? '|' : ''), 160, 696, { size: 46 }); }
  g.restore(); }
function recipe(t) { const a = win(t, s(2) - .3, s(7) + .2, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const T1 = r(3, .6), T2 = r(3, 2.4), T3 = r(6, .4), done = t > T3 ? 3 : t > T2 ? 2 : t > T1 ? 1 : 0, tickK = done ? seg(t, [T1, T2, T3][done - 1], [T1, T2, T3][done - 1] + .35) : 0;
  const cv = vis(t, s(3) + .3, s(4)) + ss(seg(t, s(6) - .1, s(6) + .4)), wide = (t >= s(3) && t < s(4)) || t >= s(6);
  if (cv > 0) { g.save(); g.translate((1 - eo(clamp(cv))) * 520, 0); card(g, { meta: 'SERVES 1 · ANY MEAL', title: ['Flavor'], rows: ROWS, done, cur: done < 3 ? done : -1, footer: 'FROM NIH TASTE & SMELL NOTES', t, tickK }); g.restore(); }
  if (t < s(3) - .1) header(g, { step: 2, of: 6, title: 'the tongue', num: String(Math.max(1, Math.min(5, 1 + Math.floor((t - r(2, 1.6)) / .7)))), unit: 'tastes', sub: 'SWEET·SALTY·SOUR·BITTER·UMAMI', k: seg(t, s(2), s(2) + .6) });
  else if (t < s(5) - .1) header(g, { numSize: 40, step: 3, of: 6, title: 'the rest is smell', num: null, k: seg(t, s(3), s(3) + .6), note: t < s(4) ? 'strawberry, coffee, garlic' : 'up the back channel' });
  else if (t < s(6) - .1) header(g, { numSize: 40, step: 3, of: 6, title: 'smelling from', note: 'the inside: retronasal', num: null, k: seg(t, s(5), s(5) + .6) });
  else header(g, { numSize: 40, step: 3, of: 6, title: 'taste + smell', note: 'your brain mixes: flavor', num: null, k: seg(t, s(6), s(6) + .6) });
  const lvl = t < s(6) ? .2 + .3 * seg(t, r(4, .5), r(5, 2)) : .5 + .5 * seg(t, r(6, 1.2), r(6, 2.0));
  if (t < s(3)) {   // close on the tongue: the five tastes land one by one
    const tk = clamp((t - r(2, 1.4)) / 3.5), cam = mix(TONGUE, [215, 262, 3.9, 540, 930], seg(t, s(2), s(3)));
    face(t, { taste: tk, food: null, cam, clip: PANEL }); meter(lvl, 0);
    TASTE.forEach(([n, col], i) => { const kk = clamp(tk * 5 - i); if (kk <= 0) return; const [x, y] = toScr(cam, 150 + i * 36, 264); hand(g, n, x, i % 2 ? y + 110 : y - 70, { size: 46, col: P.ink, align: 'center', a: kk }); });
  } else if (!wide) {   // the retronasal zoom: follow the smell up the back channel to the smell cells
    const cam = t < r(4, 2.6) ? mix(BACK, CHAN, ss(seg(t, r(4, .3), r(4, 2.4)))) : mix(CHAN, CELLS, ss(seg(t, r(4, 2.6), r(5, .8))));
    const ce = seg(t, r(5, .4), r(5, 1.0));
    face(t, { taste: 1, smell: 1, food: 'bean', cam, clip: PANEL, cells: ce }); meter(lvl, 0);
    hand(g, 'the back channel', 100, 720, { size: 48, col: P.rust, a: seg(t, r(4, 1.2), r(4, 1.7)) * (1 - seg(t, r(4, 2.6), r(4, 3.0))) });
    if (ce > 0) { const [x, y] = toScr(cam, 228, 130); line(g, circPts(x, y, 120, 26, .45), { w: 4, col: P.rust, k: ce, close: true, seed: 872 }); hand(g, 'smell cells', x - 140, y - 90, { size: 54, col: P.rust, a: ce }); }
  } else {   // wide shots
    const sm = seg(t, r(3, .8), r(3, 1.6));
    face(t, { taste: 1, smell: t > s(6) ? 1 : 0, food: 'bean', flavor: seg(t, r(6, 1.2), r(6, 2.0)) });
    if (t < s(4) && sm > 0) { strawberry(130, 620, .8, sm); bean(240, 620, .8, seg(t, r(3, 1.6), r(3, 2.2))); garlic(350, 620, .8, seg(t, r(3, 2.2), r(3, 2.8))); }
    meter(lvl, 1);
    if (t > s(6)) line(g, [[FX + 230 * FS, FY + 250 * FS], [FX + 110 * FS, FY + 250 * FS], [FX + 110 * FS, FY + 160 * FS], [FX + 228 * FS, FY + 132 * FS]], { w: 4, col: P.rust, k: seg(t, s(6), r(6, 1.0)), seed: 870, wob: .5 });
  }
  g.restore(); }
function cold(t) { const a = win(t, s(7) - .3, s(9) + .1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const sw = seg(t, r(7, 1.6), r(7, 2.8)), bk = seg(t, r(7, 2.6), r(7, 3.6)), xk = seg(t, r(7, 4.4), r(7, 4.8));
  header(g, { numSize: 40, step: 4, of: 6, title: 'a cold', note: t < s(8) ? 'swelling + mucus' : 'smell cells cut off', num: null, k: seg(t, s(7), s(7) + .6) });
  if (t < s(8)) {   // close on the nose: the lining swells, mucus fills in, the smell can't reach the cells
    const cam = mix(NOSE, [205, 165, 2.9, 540, 900], seg(t, s(7), s(8)));
    face(t, { taste: 1, smell: 1, block: bk, swell: sw, food: 'bean', cam, clip: PANEL, cells: 1 - xk }); meter(1, 0);
    hand(g, 'swelling', 100, 720, { size: 52, col: '#b5584a', a: sw }); hand(g, 'mucus', 100, 1110, { size: 52, col: '#6f8a3a', a: bk });
    if (xk > 0) { const [cx, cy] = toScr(cam, 228, 128); line(g, [[cx - 50, cy - 40], [cx + 50, cy + 40]], { w: 8, col: P.rust, k: xk, seed: 882 }); line(g, [[cx + 50, cy - 40], [cx - 50, cy + 40]], { w: 8, col: P.rust, k: seg(t, r(7, 4.6), r(7, 5.0)), seed: 883 }); hand(g, 'no smell', cx + 70, cy - 50, { size: 50, col: P.rust, a: xk }); }
  } else {   // wide: the recipe loses its open nose, flavor drains
    const st = seg(t, s(8), r(8, .6));
    g.save(); g.translate((1 - eo(st)) * 520, 0); card(g, { meta: 'SERVES 1 · ANY MEAL', title: ['Flavor'], rows: [ROWS[0], ROWS[1], { amt: '1', item: 'stuffy nose' }], done: 2, cur: 2, footer: 'FROM NIH TASTE & SMELL NOTES', t }); g.restore();
    line(g, [[600, 744], [960, 744]], { w: 5, col: P.rust, k: seg(t, r(8, .6), r(8, 1.0)), seed: 880 });
    face(t, { taste: 1, smell: 1, block: 1, swell: 1, food: 'bean' });
    meter(lerp(1, .06, ss(seg(t, r(8, .4), r(8, 1.8)))));
    hand(g, 'bland', 60, 650, { size: 58, col: P.rust, a: seg(t, r(8, 1.2), r(8, 1.6)) });
  }
  g.restore(); }
// the jellybean test, full frame: a big bean, a big nose and two pinching fingers
function bigNose(t, pin, a = 1) { if (a <= 0) return; const c = g; c.save(); c.globalAlpha *= a;
  // a big profile on the right edge, facing left at the bean: forehead, nose, lips, chin
  const n = smooth([[884, 350], [850, 420], [860, 520], [820, 600], [740, 700], [640, 780], [632, 812], [690, 822], [730, 846], [760, 880], [742, 920], [720, 950], [748, 972], [736, 1000], [712, 1030], [752, 1070], [770, 1150]]);
  fill(c, [[1100, 350], ...n, [1100, 1150]], '#f3dccb'); line(c, n, { w: 3.4, seed: 900 }); line(c, circPts(690, 812, 14, 12, .55), { w: 2.6, close: true, seed: 901 });
  line(c, [[860, 480], [900, 470], [930, 482]], { w: 3, seed: 902 });   // closed eye
  // a finger pressing the nostril shut (slides away on "let go")
  const off = (1 - pin); c.save(); c.translate(700 + off * 200, 830 + off * 160); c.rotate(.75); const f = rectPts(0, -30, 330, 60, 6); fill(c, f, '#ecc4ac'); line(c, f, { w: 2.8, close: true, seed: 905 });
  line(c, [[14, -18], [44, -18]], { w: 2, col: P.soft, seed: 907 }); c.restore();
  c.restore(); }
function cherry(x, y, k) { if (k <= 0) return; const c = g; c.save(); c.globalAlpha *= k; c.translate(x, y); c.scale(bo(k), bo(k));
  line(c, [[-40, 10], [0, -90], [40, 20]], { w: 4, col: '#5d7a3a', seed: 910 }); [[-44, 40], [44, 50]].forEach(([cx, cy], i) => { const b = circPts(cx, cy, 44, 20); fill(c, b, '#c4243e'); line(c, b, { w: 3, close: true, seed: 911 + i }); line(c, [[cx - 20, cy - 16], [cx - 6, cy - 26]], { w: 5, col: 'rgba(255,255,255,.7)', seed: 913 + i, wob: .2 }); }); c.restore(); }
function test(t) { const a = win(t, s(9) - .3, s(12) + .1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const pin = seg(t, r(9, 1.4), r(9, 2.0)) * (1 - ss(seg(t, r(10, 1.2), r(10, 1.6)))), wow = seg(t, s(11), r(11, .6)), drop = bo(seg(t, s(9), r(9, .6)));
  header(g, { numSize: 40, step: 5, of: 6, title: 'the jellybean test', num: null, k: seg(t, s(9), s(9) + .6), note: t < r(10, 1.2) ? 'pinch your nose and chew' : 'let go!' });
  bigNose(t, pin, seg(t, r(9, .8), r(9, 1.3)));
  const chew = t > r(9, 2.2) && t < s(11) ? .08 * Math.sin(t * 9) : 0; g.save(); g.translate(360, 960 - (1 - drop) * 300); g.scale(1, 1 - chew); jelly(0, 0, 3.0 * (1 - .3 * wow)); g.restore();
  meter(t < s(11) ? .12 : lerp(.12, 1, wow), 0);
  hand(g, 'just sweet', 70, 700, { size: 60, a: seg(t, r(10, .1), r(10, .5)) * (1 - seg(t, s(11), r(11, .3))) });
  if (wow > 0) { splats(g, 360, 960, wow, 7); splats(g, 600, 1040, wow, 11); cherry(640, 1000, wow); hand(g, 'cherry!', 70, 720, { size: 96, col: P.rust, a: wow }); }
  g.restore(); }
function smellNotTaste(t) { const a = win(t, s(12) - .3, s(15) + .1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  header(g, { numSize: 40, step: 6, of: 6, title: 'lost taste?', note: 'usually lost smell', num: null, k: seg(t, s(12), s(12) + .6) });
  card(g, { meta: 'SERVES 1 · ANY MEAL', title: ['Flavor'], rows: ROWS, done: 3, cur: -1, footer: 'FROM NIH TASTE & SMELL NOTES', t });
  const back = ss(seg(t, r(13, .6), r(13, 2.6)));
  face(t, { taste: 1, smell: 1, block: 1 - back, swell: 1 - back, food: 'bean', flavor: back, cells: back, cam: mix(WIDE, [200, 185, 1.32, FX + 200 * FS, FY + 185 * FS], seg(t, s(12), s(15))) });
  meter(lerp(.1, 1, back));
  hand(g, 'comes back', 60, 650, { size: 52, col: P.rust, a: seg(t, r(13, 1.6), r(13, 2.2)) * (1 - seg(t, s(14) - .2, s(14) + .2)) });
  if (t > s(14)) { const zk = seg(t, s(14), r(14, .8)); hand(g, 'z', 560, 760 - 20 * Math.sin(t * 2), { size: 50, col: P.soft, a: zk }); hand(g, 'z', 600, 720 - 20 * Math.sin(t * 2 + 1), { size: 40, col: P.soft, a: zk }); hand(g, 'nose on a break', 60, 650, { size: 50, col: P.rust, a: zk }); }
  g.restore(); }
function ending(t) { const a = win(t, s(15) - .3, TOT + 1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const q = 1 - seg(t, s(16) - .3, s(16) + .1);
  if (q > 0) { g.save(); g.globalAlpha *= q; hand(g, 'Tried the', 70, 470, { size: 96 }); hand(g, 'nose-pinch test?', 70, 580, { size: 96, col: P.rust });
    [['yes', 180], ['no', 460]].forEach(([w, x], i) => { const bx = rectPts(x - 80, 640, 200, 110, 5); line(g, bx, { w: 3, close: true, seed: 890 + i, k: seg(t, r(15, .4 + i * .2), r(15, 1.0 + i * .2)) }); hand(g, w, x + 20, 715, { size: 64, align: 'center', a: seg(t, r(15, .8 + i * .2), r(15, 1.2 + i * .2)) }); });
    face(t, { taste: 1, smell: 1, food: 'bean', flavor: 1, cam: [200, 185, .95, 300, 970] }); meter(1); g.restore(); }
  const e1 = seg(t, s(16), r(16, .5));
  if (e1 > 0) { hand(g, 'Good nose.', 540, 500, { size: 130, a: e1, align: 'center' }); splats(g, 860, 430, e1, 3);
    hand(g, 'Follow for more of', 540, 620, { size: 62, a: seg(t, r(16, .3), r(16, .8)), align: 'center' }); hand(g, 'how it really works.', 540, 690, { size: 62, col: P.rust, a: seg(t, r(16, .5), r(16, 1.0)), align: 'center' });
    hand(g, "A new 'wait, really?' every day.", 540, 770, { size: 46, col: P.ink, a: seg(t, r(16, .7), r(16, 1.2)), align: 'center' }); mono(g, '@HOWITREALLYWORKSTUDIO', 540, 830, { size: 22, col: P.rust, track: 3, a: seg(t, r(16, .9), r(16, 1.4)), align: 'center' });
    strawberry(540, 1010 + 6 * Math.sin(t * 2.2), 1.5, seg(t, r(16, .6), r(16, 1.2))); meter(1, 0); }
  g.restore(); }

// captions: the kit's handwritten strip, re-set for Batch N (centred at y 1290, text inside x 180-900)
function caption(cap, a = 1, y0 = 1290) { if (a <= 0) return; let size = 58; const maxW = 700; g.save();
  const words = []; parse(cap).forEach(p => p.t.split(/(\s+)/).forEach(w => w && words.push({ w, b: p.b })));
  const wrap = () => { g.font = `700 ${size}px Caveat`; const lines = [[]]; let cw = 0; for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > maxW && !/^\s+$/.test(w.w) && lines[lines.length - 1].length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines[lines.length - 1].push(w); cw += m; } }
    lines.forEach(l => { while (l.length && /^\s+$/.test(l[l.length - 1].w)) l.pop(); }); return lines; };
  let lines = wrap(); if (lines.length > 3) { size = 50; lines = wrap(); }
  const lh = size + 6, top = y0 - (lines.length - 1) * lh / 2; g.globalAlpha = a; g.textBaseline = 'middle';
  const widest = Math.max(...lines.map(l => l.reduce((s, w) => s + g.measureText(w.w).width, 0))); g.fillStyle = 'rgba(247,240,230,.92)'; g.beginPath(); g.roundRect(W / 2 - widest / 2 - 30, top - lh / 2 - 8, widest + 60, lines.length * lh + 16, 16); g.fill();
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + g.measureText(w.w).width, 0); let x = W / 2 - tw / 2; for (const w of ln) { g.fillStyle = w.b ? P.rust : P.ink; g.fillText(w.w, x, top + i * lh); x += g.measureText(w.w).width; } });
  g.restore(); }
function sub(t) { let cur = 0; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur === PH.length - 1) return;
  const nx = PH[cur + 1].start; caption(PH[cur].cap, (cur === 0 ? 1 : seg(t, PH[cur].start - .05, PH[cur].start + .15)) * (1 - seg(t, nx - .25, nx - .05))); }
// the segmented progress bar (the demo's top strip)
function bar(t) { const b = [s(0), s(2), s(3), s(7), s(9), s(12), TOT]; let cur = 0; for (let i = 0; i < 6; i++) if (t >= b[i]) cur = i; progress(g, STEPS, cur, seg(t, b[cur], b[cur + 1])); }

window.DUR = TOT;
window.seek = t => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paper(), 0, 0); bar(t); hook(t); recipe(t); cold(t); test(t); smellNotTaste(t); ending(t); sub(t); strip(t);
  const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .3; g.fillStyle = '#3b2a1f'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paper(), 0, 0); hand(g, 'Cold?', 70, 470, { size: 150 }); hand(g, "It's your", 70, 610, { size: 120 }); hand(g, 'nose.', 70, 740, { size: 150, col: P.rust });
  strawberry(820, 520, 1.6); face(1, { taste: 1, smell: 1, block: 1, food: 'bean' }); meter(.08); };
window.seek(0); window.ready = true; window.READY = true;
