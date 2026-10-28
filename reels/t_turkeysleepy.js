// t_turkeysleepy.js: "Does turkey really make you sleepy?" (Thanksgiving seasonal, unbadged) in the midcentury "classroom film" kit
// (reels/styles/midcentury, our re-implementation of the Lemo-Opuscar midcentury-toon grammar). Canvas2D 1080x1920, pure function of t.
// Grammar: flat fills printed off a breathing ink line on a 12 fps jitter clock, colour-plane sets with rays and dots, slab titles over
// offset colour plates, the bean-head presenter with a pointer, slam-in ink stamps, numbered culprit cards, a paper caption slab.
// Batch N layout: titles from y 330, the set's floor line at y 1150, the caption slab at y 1170-1400, nothing written in the top 250 px,
// the bottom 480 px (floor colour only) or the right column below y 840 (the presenter and props may stand there, text may not).
import { createMC, PAL, ellipsePts, rrectPts, capsulePts, smooth, quad, hash, clamp, lerp, ramp, easeOut, backOut } from './styles/midcentury/midcentury.js';
await Promise.all([document.fonts.load('400 100px "Alfa Slab One"'), document.fonts.load('700 70px "Oleo Script"'), document.fonts.load('600 40px "Jost"')]);
const M = createMC(document.getElementById('c')), g = M.g, INK = PAL.ink;
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const pop = (t, t0, d = .3) => backOut(ramp(t, t0, d));
const HZ = 1150;
const talk = t => { let on = false; PH.forEach(p => { if (t > p.start && t < p.end) on = true; }); return on ? (Math.sin(t * 16) > .1 ? .75 : .2) : 0; };
const blink = t => (t * 1.4) % 1 > .96;

// ---------- props (from the kit's demo, re-used) ----------
function turkey(x, y, sc, t, o = {}) { g.save(); g.translate(x, y); g.scale(sc, sc);
  const plat = ellipsePts(0, 40, 250, 52); M.shadow(plat, [10, 16]); M.cel(plat, PAL.paper2, { w: 4, seed: 11, off: [6, 6] }); M.ink(ellipsePts(0, 36, 205, 36), { w: 3, seed: 12 });
  [[-196, -4, 1], [196, -4, -1]].forEach(([lx, ly, sd], i) => { const leg = smooth([[lx - sd * 40, ly - 48], [lx + sd * 36, ly - 66], [lx + sd * 112, ly - 20], [lx + sd * 70, ly + 22], [lx - sd * 20, ly + 16]], 6, true);
    M.cel(leg, PAL.roast, { w: 4.4, seed: 20 + i, off: [7, 6], shade: { col: 'rgba(110,40,10,.28)', draw: gg => gg.fillRect(-400, ly + 2, 800, 200) } });
    M.cel(capsulePts(lx + sd * 108, ly - 28, lx + sd * 132, ly - 36, 20), PAL.paper2, { w: 3.6, seed: 22 + i, off: [4, 4] });
    M.cel(ellipsePts(lx + sd * 138, ly - 44, 15, 15, 20), PAL.paper2, { w: 3.6, seed: 24 + i, off: [4, 4] }); M.cel(ellipsePts(lx + sd * 140, ly - 20, 14, 14, 20), PAL.paper2, { w: 3.6, seed: 26 + i, off: [4, 4] }); });
  const body = smooth([[-150, -20], [-140, -118], [-60, -184], [30, -190], [120, -140], [152, -40], [100, 22], [-80, 26]], 7, true);
  M.cel(body, PAL.roast, { w: 4.6, seed: 30, off: [8, 7], shade: { col: 'rgba(110,40,10,.30)', draw: gg => { gg.beginPath(); gg.ellipse(40, 0, 230, 90, 0, 0, 7); gg.rect(-400, -40, 800, 200); gg.fill(); } } });
  M.clipped(body, gg => { gg.fillStyle = 'rgba(255,214,140,.55)'; gg.beginPath(); gg.ellipse(-30, -130, 70, 26, -.3, 0, 7); gg.fill(); }, { seed: 31 });
  [[-70, -60], [10, -80], [80, -56]].forEach(([cx, cy], i) => M.ink(quad([cx - 30, cy + 14], [cx, cy - 12], [cx + 30, cy + 14], 8), { w: 3.4, seed: 40 + i, breaks: false }));
  [[-220, 22], [-196, 46], [226, 20], [204, 44], [-170, 60]].forEach(([px, py], i) => M.cel(ellipsePts(px, py, 17, 13, 16), i % 2 ? PAL.olive : '#6f8a3a', { w: 3, seed: 50 + i, off: [3, 3] }));
  if (o.halo) { const k = o.halo; M.ink(ellipsePts(0, -250 - 10 * Math.sin(t * 3), 110 * k, 26 * k, 40), { w: 6, seed: 55, closed: true, breaks: false }); g.save(); g.globalAlpha = .5 * k; g.strokeStyle = PAL.mustard; g.lineWidth = 14; g.beginPath(); g.ellipse(0, -250 - 10 * Math.sin(t * 3), 110 * k, 26 * k, 0, 0, 7); g.stroke(); g.restore(); }
  g.restore(); }
function zees(x, y, t, col) { [0, 1, 2].forEach(i => { const k = ramp(t, i * .35, .35), fl = (t * .8 + i * .33) % 1; if (k <= 0) return; M.text('Z', x + i * 40 + fl * 12, y - i * 50 - fl * 12, { font: 'Oleo Script', weight: 700, size: 70 + i * 22, col: INK, plate: col, po: [4, 4], alpha: k }); }); }
function loaf(x, y, sc) { g.save(); g.translate(x, y); g.scale(sc, sc); const b = smooth([[-96, 24], [-104, -26], [-60, -58], [10, -66], [74, -50], [104, -6], [90, 28]], 7, true);
  M.cel(b, '#d99a3f', { w: 4.4, seed: 60, off: [7, 6], shade: { col: 'rgba(120,70,10,.28)', draw: gg => gg.fillRect(-300, 6, 700, 100) } });
  [-46, 0, 46].forEach((sx, i) => M.cel(capsulePts(sx - 14, -34, sx + 6, -4, 13), PAL.paper2, { w: 3, seed: 61 + i, off: [3, 3] })); g.restore(); }
function plate(x, y, sc) { g.save(); g.translate(x, y); g.scale(sc, sc); const p = ellipsePts(0, 14, 108, 34); M.cel(p, PAL.paper2, { w: 4, seed: 70, off: [6, 6] });
  [[-42, -4, 32, PAL.tomato], [14, -14, 38, PAL.olive], [58, -2, 28, PAL.mustard], [-6, 0, 26, PAL.roast]].forEach(([cx, cy, r, c], i) => M.cel(ellipsePts(cx, cy, r, r * .8, 22), c, { w: 3.4, seed: 71 + i, off: [4, 4] })); g.restore(); }
function glass(x, y, sc) { g.save(); g.translate(x, y); g.scale(sc, sc); const bowl = smooth([[-52, -70], [52, -70], [44, -14], [0, 12], [-44, -14]], 6, true);
  M.cel(bowl, PAL.paper2, { w: 4, seed: 80, off: [5, 5] }); M.clipped(bowl, gg => { gg.fillStyle = PAL.plum; gg.fillRect(-100, -44, 200, 90); }, { seed: 81 });
  M.cel(capsulePts(0, 8, 0, 60, 12), PAL.paper2, { w: 3.4, seed: 82, off: [4, 4] }); M.cel(ellipsePts(0, 68, 44, 11, 20), PAL.paper2, { w: 3.6, seed: 83, off: [4, 4] }); g.restore(); }
function sleepyFace(x, y, r, t) { const pulse = 1 + .03 * Math.sin(t * 3); g.save(); g.translate(x, y); g.scale(pulse, pulse);
  M.burst(0, 0, r * 1.18, r * 1.38, 14, PAL.mustard, { rot: t * .3, seed: 90 }); M.cel(ellipsePts(0, 0, r, r, 56), PAL.tealL, { w: 4.6, seed: 91, off: [8, 7] });
  M.ink(quad([-62 * r / 128, -10], [-42 * r / 128, 8], [-22 * r / 128, -10], 8), { w: 5, seed: 92, breaks: false }); M.ink(quad([22 * r / 128, -10], [42 * r / 128, 8], [62 * r / 128, -10], 8), { w: 5, seed: 93, breaks: false });
  M.cel(ellipsePts(0, 52 * r / 128, 15 * r / 128, 20 * r / 128, 20), '#7a2b22', { w: 3.6, seed: 94, off: [3, 3] });
  const cap = [[-r * .78, -r * .55], [-r * .2, -r * .9], [r * .45, -r * .82], [r * 1.0, -r * .1], [r * .2, -r * .98], [-r * .45, -r * .98]]; M.cel(smooth(cap, 5, true), PAL.tomato, { w: 4, seed: 95, off: [5, 5] }); M.cel(ellipsePts(r * 1.0, -r * .1, 19 * r / 128, 19 * r / 128, 18), PAL.paper2, { w: 3.4, seed: 96, off: [3, 3] }); g.restore(); }
function chicken(x, y, sc) { g.save(); g.translate(x, y); g.scale(sc, sc); const b = smooth([[-70, 40], [-90, -10], [-60, -60], [0, -70], [50, -50], [70, 0], [40, 40]], 6, true);
  M.cel(b, PAL.paper2, { w: 4, seed: 160, off: [6, 5] }); M.cel(ellipsePts(40, -90, 34, 32, 30), PAL.paper2, { w: 4, seed: 161, off: [5, 4] }); M.cel([[70, -96], [100, -86], [70, -78]], PAL.mustard, { w: 3, seed: 162, off: [3, 3] });
  M.cel(smooth([[30, -122], [40, -140], [52, -126], [62, -140], [66, -118]], 4, false).concat([[40, -118]]), PAL.tomato, { w: 3, seed: 163, off: [3, 3] }); g.fillStyle = INK; g.beginPath(); g.arc(50, -94, 5, 0, 7); g.fill();
  [[-20, 40], [20, 40]].forEach(([lx, ly], i) => M.ink([[lx, ly], [lx, ly + 40], [lx + 14, ly + 46]], { w: 4, seed: 164 + i, breaks: false })); g.restore(); }
function cheese(x, y, sc) { g.save(); g.translate(x, y); g.scale(sc, sc); const w = [[-110, 50], [110, 50], [110, -10], [-110, -70]]; M.cel(w, PAL.mustard, { w: 4.4, seed: 170, off: [7, 6], shade: { col: 'rgba(150,90,10,.25)', draw: gg => gg.fillRect(-200, 10, 400, 60) } });
  [[-50, 10, 14], [30, 20, 18], [70, -10, 10]].forEach(([hx, hy, r], i) => M.cel(ellipsePts(hx, hy, r, r * .8, 18), '#c98a1f', { w: 3, seed: 171 + i, off: [2, 2] })); g.restore(); }
function molecule(x, y, sc, t) { g.save(); g.translate(x, y); g.scale(sc, sc); const hex = (cx, cy) => Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2 + Math.PI / 6; return [cx + Math.cos(a) * 46, cy + Math.sin(a) * 46]; });
  M.cel(hex(-60, 0), PAL.tealL, { w: 4, seed: 180, off: [5, 4] }); M.cel(smooth([[20, -40], [60, -20], [56, 26], [16, 40], [-20, 20]], 2, true), PAL.powder, { w: 4, seed: 181, off: [5, 4] });
  M.ink([[60, -10], [120, -40], [170, -10]], { w: 4, seed: 182, breaks: false }); M.ink([[170, -10], [200, -60]], { w: 4, seed: 183, breaks: false }); M.ink([[170, -10], [220, 20]], { w: 4, seed: 184, breaks: false });
  [[200, -60, PAL.tomato], [220, 20, PAL.tomato], [120, -40, INK]].forEach(([ax, ay, c], i) => M.cel(ellipsePts(ax, ay, 14, 14, 16), c, { w: 3, seed: 185 + i, off: [2, 2] })); g.restore(); }
function brain(x, y, sc) { g.save(); g.translate(x, y); g.scale(sc, sc); const b = smooth([[-110, 20], [-120, -40], [-80, -90], [-10, -110], [60, -100], [110, -60], [120, 0], [90, 50], [-60, 60]], 6, true);
  M.cel(b, PAL.coral, { w: 4.4, seed: 190, off: [7, 6] }); [[-70, -40, -20, -70, 30, -40], [-60, 10, 0, -10, 60, 20], [40, -80, 70, -40, 90, -10]].forEach(([a, b2, c, d, e, f], i) => M.ink(quad([a, b2], [c, d], [e, f], 8), { w: 3.6, seed: 191 + i, breaks: false }));
  M.cel(capsulePts(10, 50, 20, 110, 30), PAL.coral, { w: 4, seed: 195, off: [5, 4] }); g.restore(); }
// caption slab (Batch N: y 1170-1400): cap markdown -> coloured runs, wrapped to 860 px
function caption(cap, a) { if (a <= 0) return; const size = 44, maxW = 860, runs = []; cap.split('**').forEach((sg, k) => sg.split(/(\s+)/).forEach(w => w && runs.push([w, k % 2 ? PAL.tomato : INK])));
  const lines = [[]]; let lw = 0; runs.forEach(r => { const w = M.textW(r[0], size); if (lw + w > maxW && /\S/.test(r[0]) && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (!(lw === 0 && !/\S/.test(r[0]))) { lines[lines.length - 1].push(r); lw += w; } });
  M.capCard(lines, { y: 1172, size, alpha: a, rise: (1 - easeOut(clamp(a))) * 20 }); }
function sub(t) { let cur = -1; PH.forEach((p, i) => { if (t >= p.start - .1) cur = i; }); if (cur < 0 || cur === PH.length - 1) return; const nx = cur < PH.length - 1 ? PH[cur + 1].start : TOT;
  caption(PH[cur].cap, (cur === 0 ? 1 : ramp(t, PH[cur].start - .1, .2)) * (1 - ramp(t, nx - .25, .15))); }
function table(x, w, k = 1) { const ty = (1 - backOut(k)) * 260; M.cel(rrectPts(x, 1040 + ty, w, 40, 10), PAL.olive, { w: 4.4, seed: 100, off: [6, 6] }); M.ink([[x + 40, 1080 + ty], [x + 30, 1150]], { w: 4.4, seed: 101, breaks: false }); M.ink([[x + w - 40, 1080 + ty], [x + w - 30, 1150]], { w: 4.4, seed: 102, breaks: false }); return ty; }
function title(l1, l2, t, t0, o = {}) { const a = easeOut(ramp(t, t0, .4)); if (l1) M.text(l1, 540, (o.y || 340) - (1 - a) * 40, { font: 'Oleo Script', weight: 700, size: o.s1 || 70, col: o.c1 || PAL.tomato, alpha: a });
  if (l2) M.text(l2, 540, (o.y || 340) + (o.dy || 110) - (1 - a) * 50, { size: o.s2 || 96, col: INK, plate: o.plate || PAL.mustard, po: [8, 7], alpha: a }); }
function slam(str, x, y, t, t0, o = {}) { const st = ramp(t, t0, .3); if (st <= 0) return; const sc = lerp(2.6, 1, easeOut(st)), sh = t > t0 + .3 && t < t0 + .55 ? (hash(Math.floor(t * 40)) - .5) * 14 : 0;
  M.stamp(str, x + sh, y + sh, { size: o.size || 170, col: PAL.tomato, rot: o.rot ?? -.13, scale: sc, alpha: st > .15 ? 1 : st / .15 }); }

// ---------- scenes ----------
function sceneA(t) { // hook: the roast, the presenter, MYTH slams in
  M.set(PAL.tealL, '#4e9c98', HZ); M.rays(540, 800, 1500, 24, '#ffffff', .22, t * .06); M.dots(40, 280, 1040, 640, 46, 4, '#ffffff', .32);
  const ty = table(60, 560, t < .02 ? 1 : ramp(t, .1, .3)); turkey(340, 990 + ty, .9, t); zees(170, 860, t - 1.0, PAL.mustard);
  const pt = ramp(t, .5, .35); M.presenter(840, 1060, .74, { flip: true, hand: [lerp(940, 700, easeOut(pt)), lerp(900, 930, pt)], stick: [lerp(860, 480, easeOut(pt)), lerp(940, 880, pt)], kind: 'point', mouth: talk(t), look: [-.6, .2], brow: t > 1.4 ? 1 : 0, blink: blink(t) });
  M.text('TURKEY MAKES', 540, 380, { size: 96, col: INK, plate: PAL.mustard, po: [8, 7] }); M.text('YOU SLEEPY?', 540, 490, { size: 96, col: INK, plate: PAL.mustard, po: [8, 7] });
  slam('MYTH', 540, 640, t, .9, { size: 170 });
  if (t > 1.2) [[120, 560], [960, 560], [560, 760]].forEach(([sx, sy], i) => { const k = ramp(t, 1.2 + i * .06, .25); if (k > 0) M.sparkle(sx, sy, 40 * backOut(k), t * .8 + i, i % 2 ? PAL.tomato : PAL.paper2); }); }
function sceneB(t) { // the question: a sleepy face
  M.set(PAL.powder, '#7fb0c6', HZ); M.rays(540, 760, 1500, 20, '#ffffff', .2, -t * .05);
  title('so...', 'DOES IT?', t, s(1) - .2, { y: 360, s2: 120 }); const fk = pop(t, s(1) + .2, .4); if (fk > 0) sleepyFace(540, 820, 170 * fk, t); zees(720, 700, t - s(1) - .8, PAL.mustard);
  M.text('?', 860, 980, { size: 200, col: INK, plate: PAL.tomato, po: [8, 7], alpha: ramp(t, s(1) + 1.0, .3) }); }
function sceneC(t) { // the suspect: tryptophan on a wanted poster, then -> serotonin -> sleep
  M.set(PAL.coral, '#d98a68', HZ); M.dots(40, 280, 1040, 1100, 50, 4, '#ffffff', .28);
  const k = pop(t, s(2) - .1, .4), sc = .6 + .4 * k; g.save(); g.translate(400, 700); g.scale(sc, sc); g.translate(-400, -700);
  const card = rrectPts(110, 380, 580, 560, 24); M.shadow(card, [14, 16]); M.cel(card, PAL.paper2, { w: 4.6, seed: 200, off: [10, 9] });
  M.text('WANTED', 400, 470, { size: 84, col: INK, plate: PAL.tomato, po: [6, 5] }); M.text('for causing naps', 400, 520, { font: 'Jost', weight: 600, size: 32, col: '#6a554a', reg: false });
  molecule(360, 680, 1.15, t); M.text('TRYPTOPHAN', 400, 880, { size: 64, col: INK, plate: PAL.mustard, po: [6, 5] }); g.restore();
  const pt = ramp(t, s(2) + .6, .4); M.presenter(880, 1060, .7, { flip: true, hand: [lerp(940, 760, easeOut(pt)), lerp(900, 800, pt)], stick: [lerp(860, 640, easeOut(pt)), lerp(900, 700, pt)], kind: 'point', mouth: talk(t), look: [-.6, 0], blink: blink(t) });
  if (t > s(3) - .2) { const a = ramp(t, s(3), .4); g.save(); g.globalAlpha = a; M.ink([[400, 960], [400, 1010]], { w: 8, seed: 210, breaks: false }); M.cel([[376, 1004], [424, 1004], [400, 1036]], PAL.tomato, { w: 4, seed: 211, off: [3, 3] }); g.restore();
    const bk = pop(t, s(3) + .3, .4); if (bk > 0) { g.save(); g.translate(250, 1080); g.scale(bk, bk); M.text('SEROTONIN', 0, 0, { size: 52, col: INK, plate: PAL.tealL, po: [5, 4], align: 'left' }); g.restore(); }
    zees(560, 1060, t - s(3) - 1.6, PAL.mustard); } }
function bars(t, x0, y0, rows, unit) { rows.forEach(([lab, v, col, icon], i) => { const y = y0 + i * 170, k = easeOut(ramp(t, icon.t0, .7)); if (icon.t0 > t + .3) return;
  icon.draw(x0 + 70, y + 40); M.text(lab, x0 + 160, y + 20, { size: 44, col: INK, align: 'left' }); const bw = 520 * v * k; if (bw > 4) M.cel(rrectPts(x0 + 160, y + 40, bw, 50, 10), col, { w: 4, seed: 220 + i, off: [6, 5] }); }); }
function sceneD(t) { // turkey vs chicken: about the same; then cheddar has more
  M.set(PAL.paper2, '#e9d6b4', HZ); M.dots(40, 280, 1040, 1100, 50, 4, '#d8c3a0', .45);
  const ch = t > s(6) - .2;
  title(ch ? 'and the cheese?' : 'tryptophan per bite', ch ? 'EVEN MORE' : 'THE SAME-ISH', t, ch ? s(6) - .1 : s(4) - .1, { y: 350, s2: 92, plate: ch ? PAL.tomato : PAL.mustard });
  const rows = [['TURKEY', .62, PAL.roast, { t0: s(4) + .3, draw: (x, y) => { g.save(); g.translate(x, y); g.scale(.3, .3); turkey(0, 0, 1, t); g.restore(); } }],
    ['CHICKEN', .6, PAL.paper, { t0: s(4) + 1.6, draw: (x, y) => chicken(x, y + 10, .55) }]];
  if (ch) rows.push(['CHEDDAR', .95, PAL.mustard, { t0: s(6) + .2, draw: (x, y) => cheese(x, y + 10, .5) }]);
  bars(t, 70, 540, rows);
  if (t > s(5) - .2 && !ch) { const k = pop(t, s(5), .4); g.save(); g.translate(540, 980); g.scale(k, k); M.text('≈ ¼ GRAM', 0, 0, { size: 80, col: INK, plate: PAL.tealL, po: [7, 6] }); M.text('per 100 g of poultry', 0, 56, { font: 'Jost', weight: 600, size: 36, col: '#6a554a', reg: false }); g.restore(); }
  if (ch) { const k = ramp(t, s(6) + 2.2, .4); M.text('(nobody blames the cheese)', 540, 1060, { font: 'Oleo Script', weight: 700, size: 52, col: PAL.plum, alpha: k }); } }
const CARDS = [['1', 'BIG MEAL', 'a lot of food at once', plate], ['2', 'CARBS', 'stuffing, bread, pie', loaf], ['3', 'A DRINK', 'alcohol makes you drowsy', glass]];
function card(i, y0, k, sc0 = .55) { if (k <= 0) return; const cx = 540, sc = sc0 + (1 - sc0) * k, [n, ttl, sb, icon] = CARDS[i]; g.save(); g.translate(cx, y0 + 90); g.scale(sc, sc); g.translate(-cx, -(y0 + 90));
  const cd = rrectPts(70, y0, 940, 180, 30); M.shadow(cd, [14, 16]); M.cel(cd, PAL.paper2, { w: 4.6, seed: 130 + i, off: [10, 9] });
  M.clipped(cd, gg => { gg.fillStyle = [PAL.mustard, PAL.tomato, PAL.teal][i]; gg.globalAlpha = .9; gg.fillRect(60, y0, 120, 200); gg.globalAlpha = 1; }, { seed: 140 + i, off: [0, 0] });
  M.ink([[180, y0 + 10], [180, y0 + 170]], { w: 4, seed: 150 + i, breaks: false }); M.text(n, 124, y0 + 125, { size: 100, col: PAL.paper2, plate: INK, po: [5, 5] });
  icon(i === 2 ? 296 : 290, y0 + (i === 2 ? 80 : 100), .8); M.text(ttl, 400, y0 + 86, { size: 66, col: INK, plate: [PAL.mustard, PAL.tomato, PAL.teal][i], po: [6, 5], align: 'left' });
  M.text(sb, 402, y0 + 140, { font: 'Jost', weight: 600, size: 34, col: '#6a554a', align: 'left', reg: false }); g.restore(); }
function sceneE(t) { // the real culprits: cards 1 and 2
  M.set(PAL.coral, '#d98a68', HZ); M.rays(540, 700, 1500, 28, '#ffffff', .18, -t * .05);
  title('not the bird...', 'THE WHOLE MEAL', t, s(7) - .1, { y: 340, s2: 86, plate: PAL.teal });
  const meal = (1 - ramp(t, s(8) - .3, .3)) * pop(t, s(7) + .3, .4); if (meal > 0) { g.save(); g.globalAlpha = clamp(meal); g.translate(540, 800); g.scale(meal, meal); g.translate(-540, -800);
    turkey(540, 780, .75, t); plate(260, 980, 1.0); loaf(560, 1000, .9); glass(840, 960, 1.0); g.restore(); }
  card(0, 520, pop(t, s(8) - .1, .35)); card(1, 740, pop(t, s(9) - .1, .35));
  if (t > s(8) + 2.2 && t < s(9)) zees(800, 700, t - s(8) - 2.2, PAL.mustard); }
function sceneF(t) { // the sugar crash: a spike and a drop
  M.set(PAL.powder, '#7fb0c6', HZ); title('carbs...', 'THE CRASH', t, s(10) - .1, { y: 350, s2: 110, plate: PAL.tomato });
  const x0 = 140, y0 = 1040, w = 800, h = 480; M.ink([[x0, y0 - h], [x0, y0], [x0 + w, y0]], { w: 5, seed: 230, breaks: false });
  M.text('blood sugar', x0 + 10, y0 - h - 16, { font: 'Jost', weight: 600, size: 32, col: '#4a3a32', align: 'left', reg: false }); M.text('time', x0 + w - 10, y0 + 46, { font: 'Jost', weight: 600, size: 32, col: '#4a3a32', align: 'right', reg: false });
  const k = ramp(t, s(10) + .2, 2.4), P = []; for (let i = 0; i <= 60 * k; i++) { const u = i / 60; P.push([x0 + u * w, y0 - 120 - 300 * Math.exp(-Math.pow((u - .32) / .12, 2)) + 90 * Math.exp(-Math.pow((u - .72) / .1, 2))]); }
  if (P.length > 1) M.ink(P, { w: 9, col: PAL.tomato, seed: 231, breaks: false });
  loaf(x0 + w * .52, y0 - 470, .7 * pop(t, s(10) + .4, .4)); if (k > .7) { M.text('CRASH', x0 + w * .72, y0 - 210, { size: 70, col: INK, plate: PAL.mustard, po: [6, 5], alpha: ramp(k, .7, .2) }); zees(x0 + w * .78, y0 - 300, t - s(10) - 2.4, PAL.mustard); } }
function sceneG(t) { // insulin clears the way: tryptophan reaches the brain
  M.set(PAL.tealL, '#4e9c98', HZ); M.dots(40, 280, 1040, 1100, 46, 4, '#ffffff', .3); title('meanwhile...', 'INSULIN', t, s(11) - .1, { y: 340, s2: 110, plate: PAL.mustard });
  brain(800, 640, 1.1); const gate = easeOut(ramp(t, s(11) + 1.0, .6));
  M.cel(rrectPts(560, 560 - 140 * gate, 40, 200, 8), PAL.plum, { w: 4, seed: 240, off: [5, 4] }); M.text('the way in', 580, 820, { font: 'Jost', weight: 600, size: 32, col: '#2f4d4b', reg: false });
  for (let i = 0; i < 6; i++) { const ph = clamp(((t - s(11) - 1.4) * .5 + i / 6) % 1), x = lerp(120, 760, ph); if (t > s(11) + 1.4) { g.save(); g.translate(x, 660 + Math.sin(ph * 12 + i) * 14); g.scale(.32, .32); molecule(0, 0, 1, t); g.restore(); } }
  // the other amino acids step aside (into the muscles)
  for (let i = 0; i < 5; i++) { const ph = easeOut(ramp(t, s(11) + .4 + i * .15, .8)), x = lerp(300 + i * 40, 160 + i * 70, ph), y = lerp(660, 980, ph); M.cel(ellipsePts(x, y, 24, 24, 18), PAL.olive, { w: 3, seed: 245 + i, off: [3, 3] }); }
  M.text('other amino acids', 330, 1060, { font: 'Jost', weight: 600, size: 32, col: '#2f4d4b', reg: false, alpha: ramp(t, s(11) + 1.2, .4) });
  const pt = ramp(t, s(11) + 2.6, .4); if (pt > 0) zees(870, 470, t - s(11) - 2.6, PAL.mustard); }
function sceneH(t) { // all three culprits -> sleepy face
  M.set(PAL.coral, '#d98a68', HZ); M.rays(540, 640, 1500, 28, '#ffffff', .18, -t * .05);
  title('the real trio', null, t, s(12) - .3, { y: 340 }); card(0, 380, 1); card(1, 580, 1); card(2, 780, pop(t, s(12) + .1, .35));
  const fk = pop(t, s(13) + .6, .4); if (fk > 0) { g.save(); g.globalAlpha = .9; sleepyFace(820, 1040, 90 * fk, t); g.restore(); } zees(600, 1060, t - s(13) - 1.2, PAL.mustard); }
function sceneI(t) { // innocent: the turkey with a halo, INNOCENT slams in
  M.set(PAL.tealL, '#4e9c98', HZ); M.rays(540, 800, 1500, 24, '#ffffff', .22, t * .06);
  const ty = table(60, 560, 1); turkey(340, 990 + ty, .9, t, { halo: easeOut(ramp(t, s(14) + .2, .5)) });
  M.presenter(840, 1060, .74, { flip: true, hand: [880, 820], kind: 'open', mouth: talk(t), look: [-.3, -.2], blink: blink(t), brow: 1 });
  slam('INNOCENT', 520, 560, t, s(14) + .6, { size: 120, rot: -.08 });
  M.text('blame the whole plate', 540, 760, { font: 'Oleo Script', weight: 700, size: 60, col: PAL.plum, alpha: ramp(t, s(14) + 1.6, .4) }); }
function sceneJ(t) { // question + end card
  M.set(PAL.paper2, '#e9d6b4', HZ); M.rays(540, 760, 1500, 24, '#f0dcb8', .5, t * .05); const q = 1 - ramp(t, s(16) - .25, .25);
  if (q > 0) { g.save(); g.globalAlpha = q; title('after the feast...', 'NAP TIME?', t, s(15) - .2, { y: 360, s2: 110 });
    [['YES', 300, PAL.tomato], ['NO', 780, PAL.teal]].forEach(([w, x, col], i) => { const k = pop(t, s(15) + .8 + i * .3, .35); if (k <= 0) return; g.save(); g.translate(x, 700); g.scale(k, k); const b = rrectPts(-170, -80, 340, 160, 40); M.shadow(b, [10, 12]); M.cel(b, col, { w: 4.6, seed: 260 + i, off: [8, 7] }); M.text(w, 0, 36, { size: 100, col: PAL.paper2, plate: INK, po: [5, 5] }); g.restore(); });
    sleepyFace(540, 980, 80, t); g.restore(); }
  const e = ramp(t, s(16) - .2, .5); if (e > 0) { g.save(); g.globalAlpha = e;
    M.text('Follow for more of', 540, 420, { font: 'Oleo Script', weight: 700, size: 76, col: PAL.tomato }); M.text('HOW IT REALLY', 540, 540, { size: 92, col: INK, plate: PAL.mustard, po: [8, 7] }); M.text('WORKS.', 540, 650, { size: 92, col: INK, plate: PAL.mustard, po: [8, 7] });
    M.text("A new 'wait, really?' every day.", 540, 740, { font: 'Jost', weight: 600, size: 40, col: '#4a3a32', reg: false }); M.text('@howitreallyworkstudio', 540, 800, { font: 'Jost', weight: 600, size: 34, col: PAL.tomato, reg: false });
    const ty = table(260, 560, ramp(t, s(16) + .4, .4)); turkey(540, 990 + ty, .8, t); g.restore(); } }

const SC = [[0, sceneA], [s(1) - .25, sceneB], [s(2) - .25, sceneC], [s(4) - .25, sceneD], [s(7) - .25, sceneE], [s(10) - .25, sceneF], [s(11) - .25, sceneG], [s(12) - .25, sceneH], [s(14) - .25, sceneI], [s(15) - .25, sceneJ]];
// colour-block wipe between scenes (classroom-film cut): the new scene slides in behind a mustard bar
function scene(t) { let i = 0; SC.forEach((c, k) => { if (t >= c[0]) i = k; }); const u = ramp(t, SC[i][0], .35);
  if (i > 0 && u < 1) { g.save(); SC[i - 1][1](t); g.restore(); g.save(); g.beginPath(); g.rect(0, 0, W(), 1920 * easeOut(u)); g.clip(); SC[i][1](t); g.restore(); const by = 1920 * easeOut(u); g.fillStyle = PAL.mustard; g.fillRect(0, by - 26, 1080, 26); g.fillStyle = INK; g.fillRect(0, by - 4, 1080, 4); }
  else SC[i][1](t); }
const W = () => 1080;
window.DUR = TOT;
window.seek = t => { M.begin(t); scene(t); sub(t); M.end(); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = (1 - f) * .35; g.fillStyle = '#f6ead3'; g.fillRect(0, 0, 1080, 1920); g.restore(); } };
window.render = window.seek;
window.thumb = () => { M.begin(2); M.set(PAL.tealL, '#4e9c98', HZ); M.rays(540, 800, 1500, 24, '#ffffff', .22, .1); table(60, 560, 1); turkey(340, 990, .9, 2);
  M.presenter(840, 1060, .74, { flip: true, hand: [700, 930], stick: [480, 880], kind: 'point', mouth: .6, look: [-.6, .2], brow: 1 });
  M.text('DOES TURKEY', 540, 380, { size: 100, col: INK, plate: PAL.mustard, po: [8, 7] }); M.text('MAKE YOU', 540, 495, { size: 100, col: INK, plate: PAL.mustard, po: [8, 7] }); M.text('SLEEPY?', 540, 610, { size: 100, col: INK, plate: PAL.mustard, po: [8, 7] });
  M.stamp('MYTH', 560, 790, { size: 150, col: PAL.tomato, rot: -.13 }); M.end(); };
window.seek(0); window.ready = true; window.READY = true;
