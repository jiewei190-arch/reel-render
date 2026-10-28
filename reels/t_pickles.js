// t_pickles.js: "How does a cucumber turn into a pickle?" in template #23 Recipe card (demo t23), same kit as handwarmer and coldtaste.
// The demo's recipe grammar carries the explanation: fermented dills really are a recipe (cucumbers + salt water + dill, ~3 weeks),
// built the way the demo builds a cocktail: step header + big counter + checklist card with rust ticks + segmented progress bar + a
// measuring scale beside the vessel (here a "sour" scale beside the pickle jar), close-ups in a paper panel; it ends on the
// yes/no question and the standard end card (no "Good ___." sign-off: coldtaste used it). The quick (vinegar) pickle gets its own second card, poured like the demo's liqueur.
// Batch N layout: progress bar y 290 (ends x 620 for the EP badge), header and card in y 360-830, the jar in y 720-1140 (left),
// the scale at x 760 (y 880-1120), captions centred at y 1290 inside x 180-900. Pure function of t.
import { create, W, H, TAU, P, clamp, lerp, seg, ss, eo, bo, hash, paper, hand, mono, line, rectPts, circPts, fill, shade, progress, header, card, scale, splats, parse } from './styles/recipe/recipe.js';
await Promise.all([document.fonts.load('700 60px Caveat'), document.fonts.load('500 22px Mono')]);
const g = create(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, r = (i, d) => s(i) + d, TOT = TL.total;
const win = (t, a, b, f = .4) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const STEPS = ['START', 'SKIN', 'ACID', 'SALT', 'QUICK', 'DONE'];
const ROWS = [{ amt: 'fresh', item: 'cucumbers' }, { amt: 'cold', item: 'water' }, { amt: 'pickling', item: 'salt' }, { amt: 'some', item: 'dill' }, { amt: '~3', item: 'weeks' }];
const QROWS = [{ amt: 'fresh', item: 'cucumbers' }, { amt: 'lots of', item: 'vinegar' }, { amt: 'some', item: 'salt + spice' }, { amt: '0', item: 'bacteria' }];
const GREEN = '#6f9a3e', OLIVE = '#8f8a3a', BRINE = 'rgba(214,226,190,.55)', ACID = P.rust, LAB = '#d9a442', BAD = '#7d8a6a';

// ---------- drawings ----------
// a cucumber: bumpy pencil capsule; age 0 fresh green -> 1 olive pickle
function cuke(x, y, L, rot, age = 0, a = 1, seed = 1) { const c = g; c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot); const h = L * .2, pts = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24, ang = u * TAU; const rx = L / 2, ry = h * (1 + .06 * Math.sin(u * 40)); pts.push([Math.cos(ang) * rx * (Math.abs(Math.cos(ang)) > .9 ? .97 : 1), Math.sin(ang) * ry]); }
  const col = age < .5 ? GREEN : OLIVE; fill(c, pts, `rgb(${lerp(111, 143, age)},${lerp(154, 138, age)},${lerp(62, 58, age)})`); shade(c, pts, 'rgba(40,60,20,.18)', 8);
  for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(240,240,200,.7)'; c.beginPath(); c.arc(-L * .38 + i * L * .11, (hash(seed + i) - .5) * h, 2.6, 0, TAU); c.fill(); }
  line(c, pts, { w: 2.6, close: true, seed: 300 + seed, wob: .8 }); c.restore(); }
function bacterium(x, y, k = 1, rot = 0, col = LAB, sz = 1.7) { if (k <= 0) return; const c = g; c.save(); c.translate(x, y); c.rotate(rot); c.scale(bo(k) * sz, bo(k) * sz); const pts = circPts(0, 0, 16, 16, .38); fill(c, pts, col); line(c, pts, { w: 2, close: true, seed: 401, wob: .3 }); c.restore(); }
function spoiler(x, y, k = 1, t = 0, dead = 0, sz = 1.7) { if (k <= 0) return; const c = g; c.save(); c.translate(x, y); c.scale(bo(k) * (1 - .4 * dead) * sz, bo(k) * (1 - .4 * dead) * sz); const pts = circPts(0, 0, 18, 18).map(([px, py], i) => [px * (1 + .25 * Math.sin(i * 2.3 + t * 3)), py * (1 + .25 * Math.sin(i * 1.7))]);
  fill(c, pts, dead ? '#b8b0a0' : BAD); line(c, pts, { w: 2, close: true, seed: 402, wob: .6 }); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(c, [[Math.cos(a) * 20, Math.sin(a) * 20], [Math.cos(a) * 30, Math.sin(a) * 30]], { w: 1.8, seed: 403 + i, wob: .4 }); } c.restore(); }
const sugar = (x, y, k = 1) => { if (k <= 0) return; const p = rectPts(x - 8, y - 8, 16, 16, 2); fill(g, p, '#ffffff', k); line(g, p, { w: 1.8, close: true, seed: 410, wob: .3, a: k }); };
const drop = (x, y, k = 1, col = ACID) => { if (k <= 0) return; const p = [[x, y - 14], [x + 9, y + 2], [x, y + 10], [x - 9, y + 2]]; fill(g, p, col, k); };
// the jar (the demo's glass): pencil outline, lid, brine, cucumbers, bubbles; o: {brine 0..1 fill, age, bubbles, cloudy, cukes, lid}
function jar(t, x, y, sc, o = {}) { const { brine = 1, age = 0, bubbles = 0, cloudy = 0, cukes = 1, lid = 1, k = 1, vinegar = 0 } = o; if (k <= 0) return; const c = g; c.save(); c.globalAlpha *= k; c.translate(x, y); c.scale(sc, sc);
  const body = [[-120, -150], [120, -150], [132, -120], [132, 170], [110, 190], [-110, 190], [-132, 170], [-132, -120]]; fill(c, body, 'rgba(233,238,240,.7)');
  if (brine > 0) { const top = lerp(190, -110, brine); c.save(); c.beginPath(); body.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.clip(); c.fillStyle = vinegar ? 'rgba(232,214,160,.6)' : BRINE; c.fillRect(-140, top + Math.sin(t * 2) * 2, 280, 400);
    if (cloudy > 0) { c.fillStyle = `rgba(230,228,205,${.45 * cloudy})`; c.fillRect(-140, top, 280, 400); } c.restore(); }
  if (cukes > 0) { c.save(); c.beginPath(); body.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.clip(); } if (cukes > 0) [[-60, 10, 1.45], [0, 30, 1.6], [60, 0, 1.5], [-30, 110, 1.35], [40, 120, 1.4]].forEach(([cx, cy, rr], i) => cuke(cx + 4 * Math.sin(t * 1.3 + i * 2), cy + 7 * Math.sin(t * 1.7 + i), 230, rr + (hash(i) - .5) * .2, age, cukes, i)); if (cukes > 0) c.restore();
  if (bubbles > 0) for (let i = 0; i < 14; i++) { const u = (t * (.25 + hash(i) * .2) + hash(i * 3)) % 1, bx = -100 + hash(i * 5) * 200 + Math.sin(t * 2 + i) * 6, by = lerp(180, lerp(190, -110, brine) + 8, u); c.save(); c.globalAlpha *= bubbles * (1 - u * .3); line(c, circPts(bx, by, 4 + 5 * hash(i * 7), 10), { w: 1.8, close: true, seed: 420 + i, wob: .2, col: P.soft }); c.restore(); }
  line(c, body, { w: 3.2, close: true, seed: 430 }); shade(c, [[-120, -140], [-90, -140], [-90, 180], [-120, 180]], 'rgba(255,255,255,.5)', 7);
  if (lid > 0) { const lp = rectPts(-128, -190 - (1 - lid) * 80, 256, 42, 4); fill(c, lp, '#c9a15a'); line(c, lp, { w: 3, close: true, seed: 431 }); for (let i = 0; i < 6; i++) line(c, [[-110 + i * 42, -186 - (1 - lid) * 80], [-110 + i * 42, -152 - (1 - lid) * 80]], { w: 1.6, col: P.soft, seed: 432 + i }); }
  c.restore(); }
let LAST = 0;
function meter(level, a = 1) { LAST = level; scale(g, 770, 1120, 880, [[0, 'fresh'], [.62, 'safe'], [1, 'sour']], level, { a }); hand(g, 'sour', 720, 860, { size: 44, col: P.soft, a }); }
function panel(fn, a = 1) { if (a <= 0) return; const [px, py, pw, ph] = [60, 650, 960, 500]; g.save(); g.globalAlpha *= a; g.save(); g.fillStyle = '#fbf6ee'; g.shadowColor = 'rgba(80,50,20,.16)'; g.shadowBlur = 18; g.beginPath(); g.roundRect(px, py, pw, ph, 22); g.fill(); g.restore();
  g.save(); g.beginPath(); g.roundRect(px, py, pw, ph, 22); g.clip(); fn(); g.restore(); line(g, rectPts(px, py, pw, ph), { w: 3, close: true, seed: 499 }); g.restore(); }

// ---------- scenes ----------
function hook(t) { const a = 1 - ss(seg(t, s(2) - .4, s(2))); if (a <= 0) return; g.save(); g.globalAlpha = a;
  hand(g, 'The sour?', 70, 470, { size: 110 }); hand(g, 'Made by bacteria.', 70, 590, { size: 92, col: P.rust });
  jar(t, 345, 925, 1.22, { age: .7, bubbles: 1, cloudy: .6 }); for (let i = 0; i < 7; i++) bacterium(560 + hash(i) * 110 + 10 * Math.sin(t * 2 + i), 760 + hash(i * 3) * 300, seg(t, .1 + i * .1, .5 + i * .1), t * .6 + i);
  meter(lerp(.1, .9, ss(seg(t, 0, 2.6))));
  const q = 'how does a cucumber become a pickle', n = Math.floor(q.length * seg(t, r(1, .2), r(1, 2.0))); if (n > 0) { g.save(); g.fillStyle = '#fffaf2'; g.shadowColor = 'rgba(80,50,20,.15)'; g.shadowBlur = 16; g.beginPath(); g.roundRect(70, 640, 860, 84, 42); g.fill(); g.restore();
    line(g, circPts(118, 682, 16, 16), { w: 3, close: true, seed: 356 }); line(g, [[130, 694], [144, 708]], { w: 3.6, seed: 357, wob: 0 }); hand(g, q.slice(0, n) + (n < q.length && (t * 2) % 1 < .5 ? '|' : ''), 160, 696, { size: 46 }); }
  g.restore(); }
function ferment(t) { const a = win(t, s(2) - .3, s(7) + .2, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const TK = [r(2, 1.2), r(2, 2.2), r(2, 3.0), r(2, 4.0), r(6, .6)]; let done = 0; TK.forEach(x => { if (t > x) done++; }); const tickK = done ? seg(t, TK[done - 1], TK[done - 1] + .35) : 0;
  card(g, { meta: 'CLASSIC · 1 JAR · FERMENTED', title: ['Sour dills'], rows: ROWS, done, cur: done < 5 ? done : -1, footer: 'AFTER NCHFP TESTED RECIPES', t, tickK });
  if (t < s(3) - .1) header(g, { step: 1, of: 6, title: 'the recipe', num: String(Math.max(1, Math.min(3, Math.floor((t - r(2, .6)) / .9) + 1))), unit: 'basics', sub: 'THE SOUR GROWS', k: seg(t, s(2), s(2) + .6) });
  else if (t < s(5) - .1) header(g, { numSize: 40, step: 2, of: 6, title: t < s(4) ? 'on the skin' : 'into the brine', note: t < s(4) ? 'lactic acid bacteria' : 'they eat the sugars', num: null, k: seg(t, t < s(4) ? s(3) : s(4), (t < s(4) ? s(3) : s(4)) + .6) });
  else if (t < s(6) - .1) header(g, { numSize: 40, step: 3, of: 6, title: 'sugar → acid', note: 'lactic acid + CO₂ bubbles', num: null, k: seg(t, s(5), s(5) + .6) });
  else header(g, { step: 3, of: 6, title: 'wait', num: String(Math.round(21 * ss(seg(t, r(6, .4), r(6, 4.2))))), unit: 'days', sub: 'ABOUT 3 WEEKS', k: seg(t, s(6), s(6) + .6) });
  if (t < s(3) - .2) { jar(t, 345, 925, 1.22, { brine: ss(seg(t, r(2, 1.8), r(2, 3.2))), cukes: seg(t, r(2, .9), r(2, 1.5)), lid: 0, bubbles: seg(t, r(2, 3.2), r(2, 3.8)) }); meter(0); }
  else if (t < s(4) - .2) panel(() => {   // close-up on the skin: bacteria riding on the bumps
    const zk = seg(t, s(3) - .2, s(3) + .6); g.save(); g.translate(540, 980); g.scale(lerp(1.4, 1.8, zk), lerp(1.4, 1.8, zk)); cuke(0, 0, 560, -.05, 0, 1, 7); g.restore();
    for (let i = 0; i < 9; i++) bacterium(220 + i * 72 + 8 * Math.sin(t * 2 + i), 850 + 18 * Math.sin(i * 1.7) + 5 * Math.cos(t * 3 + i), seg(t, r(3, .4 + i * .12), r(3, .8 + i * .12)), .3 * Math.sin(i + t));
    hand(g, 'lactic acid bacteria', 540, 740, { size: 54, col: P.rust, align: 'center', a: seg(t, r(3, 1.4), r(3, 2.0)) }); });
  else if (t < s(5) - .2) { jar(t, 345, 925, 1.22, { brine: 1, lid: seg(t, r(4, .2), r(4, .8)), bubbles: .7 }); for (let i = 0; i < 10; i++) { const u = (t * .5 + i / 10) % 1; sugar(250 + hash(i) * 160, lerp(1060, 900, u), seg(t, r(4, 1.6), r(4, 2.2)) * (1 - u)); }
    for (let i = 0; i < 6; i++) bacterium(240 + hash(i * 5) * 180 + 10 * Math.sin(t * 2 + i), 880 + hash(i * 9) * 180, seg(t, r(4, 1.0 + i * .1), r(4, 1.4 + i * .1)), t + i);
    hand(g, 'salty brine', 520, 760, { size: 48, col: P.soft, a: seg(t, r(4, .4), r(4, 1.0)) }); hand(g, 'sugars', 520, 820, { size: 44, col: P.rust, a: seg(t, r(4, 2.6), r(4, 3.1)) }); meter(.05); }
  else if (t < s(6) - .2) panel(() => {   // a bacterium turns sugar into acid drops and CO2 bubbles
    const cyc = ((t - s(5)) * .8) % 1; bacterium(540, 920, 1, Math.sin(t) * .2, LAB, 7);
    for (let i = 0; i < 3; i++) { const u = (cyc + i / 3) % 1; g.save(); const sx = lerp(180, 400, u), sy = 920 + (i - 1) * 90; g.translate(sx, sy); g.scale(2.4, 2.4); sugar(0, 0, 1 - u); g.restore(); }
    for (let i = 0; i < 4; i++) { const u = (cyc + i / 4) % 1; g.save(); g.translate(lerp(700, 930, u), 960 + (i - 1.5) * 60); g.scale(2.2, 2.2); drop(0, 0, seg(t, r(5, .8), r(5, 1.2)) * (1 - u * .5)); g.restore(); }
    for (let i = 0; i < 5; i++) { const u = (t * .5 + i / 5) % 1; line(g, circPts(640 + i * 60, lerp(860, 690, u), 18 + 8 * hash(i), 12), { w: 2, close: true, seed: 470 + i, col: P.soft, a: seg(t, r(5, 2.6), r(5, 3.0)) * (1 - u) }); }
    hand(g, 'sugar', 200, 820, { size: 48, a: seg(t, s(5), r(5, .5)) }); hand(g, 'lactic acid', 760, 1090, { size: 48, col: P.rust, a: seg(t, r(5, 1.0), r(5, 1.5)) }); hand(g, 'CO₂', 880, 760, { size: 44, col: P.soft, a: seg(t, r(5, 2.6), r(5, 3.0)) }); });
  else { const w = ss(seg(t, r(6, .4), r(6, 4.2))); jar(t, 345, 925, 1.22, { brine: 1, age: w, bubbles: .5 + .5 * Math.sin(w * 3), cloudy: w }); meter(.05 + .85 * w);
    hand(g, 'green → olive', 530, 760, { size: 44, col: P.soft, a: seg(t, r(6, 3.0), r(6, 3.5)) }); }
  g.restore(); }
function salt(t) { const a = win(t, s(7) - .3, s(12) + .1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  if (t < s(8) - .1) header(g, { step: 4, of: 6, title: 'why all the salt?', num: null, k: seg(t, s(7), s(7) + .5) });
  else if (t < s(9) - .1) header(g, { numSize: 40, step: 4, of: 6, title: 'salt picks a side', note: 'spoilers out, acid-makers in', num: null, k: seg(t, s(8), s(8) + .6) });
  else if (t < s(10) - .1) header(g, { numSize: 40, step: 4, of: 6, title: 'salt pulls', note: 'water + sugar into the brine', num: null, k: seg(t, s(9), s(9) + .6) });
  else if (t < s(11) - .1) header(g, { numSize: 40, step: 4, of: 6, title: 'then acid', note: 'too sour for the bad guys', num: null, k: seg(t, s(10), s(10) + .6) });
  else header(g, { numSize: 40, step: 4, of: 6, title: 'the rule', note: 'never cut the salt', num: null, k: seg(t, s(11), s(11) + .6) });
  const showCard = t < s(8) - .1 || t > s(11) - .1; if (showCard) card(g, { meta: 'CLASSIC · 1 JAR · FERMENTED', title: ['Sour dills'], rows: ROWS, done: 5, cur: -1, footer: 'AFTER NCHFP TESTED RECIPES', t });
  if (t > s(11) - .1) { const k = seg(t, r(11, .6), r(11, 1.2)); line(g, circPts(805, 618, 100, 30, .36), { w: 4, col: P.rust, k, close: true, seed: 480 }); }
  if (t < s(8) - .1) { jar(t, 345, 925, 1.22, { brine: 1, age: 1, cloudy: 1, bubbles: .5 }); meter(.9); for (let i = 0; i < 9; i++) { const u = (t * .8 + i / 9) % 1; g.fillStyle = '#ffffff'; g.fillRect(560 + hash(i) * 100, lerp(700, 900, u), 9, 9); } hand(g, 'salt', 640, 680, { size: 50, col: P.soft }); }
  else if (t < s(9) - .1) panel(() => { const k = seg(t, r(8, .4), r(8, 2.6));
    for (let i = 0; i < 6; i++) spoiler(180 + (i % 3) * 120, 820 + Math.floor(i / 3) * 140 + 6 * Math.sin(t * 2 + i), seg(t, r(8, .2 + i * .1), r(8, .5 + i * .1)), t, k);
    for (let i = 0; i < 6; i++) bacterium(660 + (i % 3) * 120 + 8 * Math.sin(t * 3 + i), 820 + Math.floor(i / 3) * 140, seg(t, r(8, 3.0 + i * .1), r(8, 3.4 + i * .1)), Math.sin(t * 2 + i) * .4);
    line(g, [[540, 700], [540, 1110]], { w: 3, col: P.faint, seed: 490 }); hand(g, 'rot microbes', 300, 740, { size: 46, align: 'center', a: seg(t, r(8, .4), r(8, .9)) }); hand(g, 'held back', 300, 1100, { size: 46, col: P.rust, align: 'center', a: seg(t, r(8, 2.0), r(8, 2.5)) });
    hand(g, 'acid-makers', 780, 740, { size: 46, align: 'center', a: seg(t, r(8, 3.2), r(8, 3.7)) }); hand(g, 'just fine', 780, 1100, { size: 46, col: P.rust, align: 'center', a: seg(t, r(8, 4.4), r(8, 4.9)) }); });
  else if (t < s(10) - .1) panel(() => { g.save(); g.translate(540, 900); g.scale(1.9, 1.9); cuke(0, 0, 420, 0, .5, 1, 9); g.restore();
    for (let i = 0; i < 10; i++) { const u = (t * .45 + i / 10) % 1, side = i % 2 ? 1 : -1, x = 540 + (hash(i) - .5) * 600, y = lerp(900, 900 + side * 220, u); if (i % 3) { g.fillStyle = `rgba(110,160,210,${1 - u})`; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill(); } else sugar(x, y, 1 - u); }
    hand(g, 'water', 180, 720, { size: 46, col: '#4a7fb0', a: seg(t, r(9, .4), r(9, .9)) }); hand(g, '+ sugar', 760, 1110, { size: 46, a: seg(t, r(9, 1.0), r(9, 1.5)) }); hand(g, 'into the brine', 700, 720, { size: 46, col: P.rust, a: seg(t, r(9, 1.8), r(9, 2.3)) }); });
  else if (t < s(11) - .1) { const lv = lerp(.4, 1, ss(seg(t, s(10), r(10, 2.6)))); jar(t, 345, 925, 1.22, { brine: 1, age: 1, cloudy: 1, bubbles: .4 }); meter(lv);
    for (let i = 0; i < 4; i++) { const sx = 640 + (i % 2) * 170, sy = 640 + Math.floor(i / 2) * 140; spoiler(sx, sy, 1, t, seg(t, r(10, 2.2 + i * .15), r(10, 2.6 + i * .15))); const xk = seg(t, r(10, 2.6 + i * .15), r(10, 2.9 + i * .15)); line(g, [[sx - 44, sy - 44], [sx + 44, sy + 44]], { w: 4, col: P.rust, k: xk, seed: 500 + i }); line(g, [[sx + 44, sy - 44], [sx - 44, sy + 44]], { w: 4, col: P.rust, k: xk, seed: 510 + i }); }
    hand(g, "can't grow", 600, 1040, { size: 50, col: P.rust, a: seg(t, r(10, 3.0), r(10, 3.5)) }); }
  else { jar(t, 345, 925, 1.22, { brine: 1, age: 1, cloudy: 1 }); meter(1); }
  g.restore(); }
function quick(t) { const a = win(t, s(12) - .3, s(15) + .1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const T = [r(12, 1.6), r(13, .4), r(13, 1.6), r(13, 3.0)]; let done = 0; T.forEach(x => { if (t > x) done++; }); const tickK = done ? seg(t, T[done - 1], T[done - 1] + .35) : 0;
  const cv = ss(seg(t, s(12) - .1, s(12) + .5)); g.save(); g.translate((1 - eo(cv)) * 520, 0); card(g, { meta: 'FRESH-PACK · QUICK PROCESS', title: ['Quick pickles'], rows: QROWS, done, cur: done < 4 ? done : -1, footer: 'NOT FERMENTED', t, tickK }); g.restore();
  if (t < s(14) - .1) header(g, { numSize: 40, step: 5, of: 6, title: 'the quick way', note: t < s(13) ? 'skip the bacteria' : 'acid already made', num: null, k: seg(t, s(12), s(12) + .6) });
  else header(g, { numSize: 40, step: 5, of: 6, title: 'either way', note: 'enough acid = safe', num: null, k: seg(t, s(14), s(14) + .6) });
  if (t < s(14) - .1) { const pour = seg(t, r(13, .2), r(13, 2.6)); jar(t, 345, 925, 1.22, { brine: pour, vinegar: 1, lid: 0 });
    if (pour > 0 && pour < 1) { g.save(); g.translate(470, 700); g.rotate(-2.2); const b = rectPts(-40, -110, 80, 200, 4); fill(g, b, '#efe2b6'); line(g, b, { w: 3, close: true, seed: 520 }); mono(g, 'VINEGAR', 0, 0, { size: 16, align: 'center', col: P.ink }); g.restore(); line(g, [[400, 750], [370, 760], [340, lerp(1120, 820, pour)]], { w: 6, col: '#d9c27a', seed: 521, wob: .3 }); }
    meter(lerp(.05, .95, ss(seg(t, r(13, .5), r(13, 2.8))))); hand(g, 'no waiting', 560, 1070, { size: 48, col: P.rust, a: seg(t, r(13, 3.0), r(13, 3.5)) }); }
  else { jar(t, 210, 960, .9, { brine: 1, age: 1, cloudy: 1 }); jar(t, 520, 960, .9, { brine: 1, vinegar: 1 }); meter(.95); line(g, [[100, lerp(1120, 880, .62)], [740, lerp(1120, 880, .62)]], { w: 3, col: P.rust, seed: 530, k: seg(t, r(14, .6), r(14, 1.6)) });
    hand(g, 'fermented', 210, 740, { size: 40, align: 'center', col: P.soft }); hand(g, 'quick', 520, 740, { size: 40, align: 'center', col: P.soft }); hand(g, 'enough acid', 420, 1180, { size: 46, col: P.rust, align: 'center', a: seg(t, r(14, 1.4), r(14, 1.9)) }); }
  g.restore(); }
function ending(t) { const a = win(t, s(15) - .3, TOT + 1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const q = 1 - seg(t, s(16) - .3, s(16) + .05);
  if (q > 0) { g.save(); g.globalAlpha *= q; hand(g, 'Made your own', 70, 470, { size: 96 }); hand(g, 'pickles?', 70, 580, { size: 96, col: P.rust });
    [['yes', 180], ['no', 460]].forEach(([w, x], i) => { const bx = rectPts(x - 80, 640, 200, 110, 5); line(g, bx, { w: 3, close: true, seed: 890 + i, k: seg(t, r(15, .4 + i * .2), r(15, 1.0 + i * .2)) }); hand(g, w, x + 20, 715, { size: 64, align: 'center', a: seg(t, r(15, .8 + i * .2), r(15, 1.2 + i * .2)) }); });
    jar(t, 345, 940, 1.15, { brine: 1, age: 1, cloudy: .6, bubbles: .6 }); meter(1); g.restore(); }
  const e1 = seg(t, s(16) - .05, r(16, .4));
  if (e1 > 0) { hand(g, 'Follow for more of', 540, 560, { size: 62, a: seg(t, r(16, .2), r(16, .7)), align: 'center' }); hand(g, 'how it really works.', 540, 640, { size: 62, col: P.rust, a: seg(t, r(16, .4), r(16, .9)), align: 'center' });
    hand(g, "A new 'wait, really?' every day.", 540, 730, { size: 46, col: P.ink, a: seg(t, r(16, .6), r(16, 1.1)), align: 'center' }); mono(g, '@HOWITREALLYWORKSTUDIO', 540, 795, { size: 22, col: P.rust, track: 3, a: seg(t, r(16, .8), r(16, 1.3)), align: 'center' });
    jar(t, 540, 990, .95, { brine: 1, age: 1, cloudy: .6, bubbles: .8, k: seg(t, r(16, .3), r(16, .8)) }); }
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
function bar(t) { const b = [s(0), s(3), s(5), s(7), s(12), s(15), TOT]; let cur = 0; for (let i = 0; i < 6; i++) if (t >= b[i]) cur = i; progress(g, STEPS, cur, seg(t, b[cur], b[cur + 1]), { x1: 620 }); }

window.DUR = TOT;
window.seek = t => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paper(), 0, 0); bar(t); hook(t); ferment(t); salt(t); quick(t); ending(t); sub(t);
  const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .3; g.fillStyle = '#3b2a1f'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paper(), 0, 0); hand(g, 'Cucumber', 70, 470, { size: 130 }); hand(g, '→ pickle?', 70, 610, { size: 130, col: P.rust });
  jar(2, 360, 960, 1.15, { age: .7, bubbles: 1, cloudy: .6 }); for (let i = 0; i < 6; i++) bacterium(660 + hash(i) * 160, 780 + hash(i * 3) * 280, 1, i); };
window.seek(0); window.ready = true; window.READY = true;
