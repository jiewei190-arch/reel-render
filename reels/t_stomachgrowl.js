// t_stomachgrowl.js: "Why does your stomach growl?" in template #10 paper-popup (Lemo paper-popup grammar; same kit as the approved ship reel).
// Demo moves reused: an open pop-up book on a desk under a warm lamp, a standing back board with layered paper scenery, cut-paper cards with a white
// border + cardboard edge + grain + cut-out shadow that spring up around their bottom edge (back to front, with overshoot), fold tabs, cardboard signs
// dropping on strings and swinging, paper labels, and acts that fold flat and pop back up (the page-turn beat).
// Safe zones (LESSONS 11): signs and cards between y 260 and 1230, captions on a paper strip at y 1260-1420, chapter strip at y 1560, nothing in the right column below 840.
import { W, H, PAL, clamp, lerp, ramp, ease, back, hash, wobble, ink, crescent, bez, card, pop, foldTab, desk, book, board, sign, label, BOOK } from './styles/popup/popup.js';
await document.fonts.load('600 60px Fredoka'); await document.fonts.load('500 30px Fredoka');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); const R = ramp;
const PINK = '#ffb7c4', PINKD = '#e9708a', GUT = '#f6a0ae', GUTD = '#d36b81', BLUE = '#8fd0ee', GAS = '#fff7e6';
const rect = (w, h, m = 6) => [[m, m], [w - m, m], [w - m, h - m], [m, h - m]];

// ---------- acts (each folds flat and pops back up: the page-turn beat) ----------
const ACT = [[0, s(3) - .4], [s(3) - .4, s(6) - .4], [s(6) - .4, s(8) - .4], [s(8) - .4, s(11) - .4], [s(11) - .4, s(14) - .4], [s(14) - .4, s(16) - .4], [s(16) - .4, TOT + 1]];
const actAt = t => { let i = 0; ACT.forEach((a, k) => { if (t >= a[0]) i = k; }); return i; };
const kAct = (t, i, d = 0) => { const [a, b] = ACT[i]; const up = i === 0 ? 1 : back(R(t, a + .25 + d, .55)), down = i === ACT.length - 1 ? 1 : 1 - ease(R(t, b - .3, .3)); return clamp(up, 0, 1.2) * down; };

// ---------- art ----------
function stomachArt(c, w, h, o = {}) { const p = []; const P = bez([w * .2, h * .12], [w * .02, h * .55], [w * .3, h * .98], [w * .66, h * .86], 18).concat(bez([w * .66, h * .86], [w * .98, h * .74], [w * .92, h * .3], [w * .62, h * .34], 14)).concat(bez([w * .62, h * .34], [w * .45, h * .36], [w * .44, h * .2], [w * .36, h * .06], 10));
  crescent(c, P, o.col || PINK, o.shade || PINKD, 14, -12); if (o.food) for (let i = 0; i < 9; i++) ink(c, wobble(w * (.3 + hash(i) * .45), h * (.5 + hash(i * 3) * .3), 22, 18, i, .1, 14), { fill: ['#f3c87a', '#8fcf86', '#c9556f', '#f48fa3'][i % 4], w: 4 });
  if (o.face) { c.fillStyle = PAL.ink; [[.45, .55], [.62, .55]].forEach(([x, y]) => { c.beginPath(); c.arc(w * x, h * y, 9, 0, 7); c.fill(); }); c.lineWidth = 6; c.strokeStyle = PAL.ink; c.beginPath(); c.arc(w * .54, h * .68, 26, Math.PI * .1, Math.PI * .9, o.frown); c.stroke(); } }
function letterArt(ch, col) { return (c, w, h) => { ink(c, wobble(w / 2, h / 2, w * .44, h * .44, ch.charCodeAt(0), .06, 20), { fill: col, w: 6 }); c.fillStyle = PAL.ink; c.font = '700 96px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, w / 2, h / 2 + 4); }; }
function tubeArt(c, w, h) { const top = h * .32, bot = h * .68; ink(c, [[0, top], [w, top], [w, bot], [0, bot]], { fill: GUT, w: 6 }); c.strokeStyle = 'rgba(160,50,70,.25)'; c.lineWidth = 3; for (let x = 30; x < w; x += 60) { c.beginPath(); c.moveTo(x, top + 8); c.quadraticCurveTo(x + 20, h / 2, x, bot - 8); c.stroke(); } }
function clockArt(txt) { return (c, w, h) => { ink(c, wobble(w / 2, h / 2, w * .44, h * .44, 4, .02, 40), { fill: PAL.cream, w: 6 }); c.fillStyle = PAL.ink; c.font = '600 44px Fredoka'; c.textAlign = 'center'; c.fillText(txt, w / 2, h * .82); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillRect(w / 2 + Math.cos(a) * w * .36 - 3, h / 2 + Math.sin(a) * h * .36 - 3, 6, 6); } }; }
function broomArt(c, w, h) { ink(c, [[w * .45, 0], [w * .55, 0], [w * .55, h * .6], [w * .45, h * .6]], { fill: '#c9955f', w: 5 }); ink(c, [[w * .2, h * .58], [w * .8, h * .58], [w * .95, h], [w * .05, h]], { fill: '#f3c87a', w: 6 }); c.strokeStyle = 'rgba(120,80,30,.6)'; c.lineWidth = 3; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(w * (.2 + i * .075), h * .62); c.lineTo(w * (.08 + i * .105), h * .97); c.stroke(); } }
function envArt(txt, col) { return (c, w, h) => { ink(c, rect(w, h), { fill: col, w: 6 }); ink(c, [[6, 6], [w / 2, h * .55], [w - 6, 6]], { w: 5, closed: false }); c.fillStyle = PAL.ink; c.font = '600 40px Fredoka'; c.textAlign = 'center'; c.fillText(txt, w / 2, h - 22); }; }
function brainArt(c, w, h) { const P = wobble(w / 2, h / 2, w * .45, h * .4, 9, .08, 40); ink(c, P, { fill: '#f7c6d0', w: 6 }); c.strokeStyle = 'rgba(160,60,90,.5)'; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(w * (.25 + i * .12), h * (.45 + (i % 2) * .1), 30, 0, Math.PI * 1.3); c.stroke(); } }
function plateArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .44, h * .32, 3, .02, 40), { fill: '#ffffff', w: 6 }); ink(c, wobble(w / 2, h / 2, w * .28, h * .2, 5, .03, 30), { fill: '#f3c87a', w: 5 }); }
function columnArt(c, w, h) { ink(c, rect(w, h * .12), { fill: PAL.cream, w: 5 }); ink(c, [[w * .15, h * .12], [w * .85, h * .12], [w * .85, h * .9], [w * .15, h * .9]], { fill: '#f3ead8', w: 5 }); c.strokeStyle = 'rgba(120,100,70,.5)'; c.lineWidth = 3; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(w * (.15 + i * .14), h * .14); c.lineTo(w * (.15 + i * .14), h * .88); c.stroke(); } ink(c, [[0, h * .9], [w, h * .9], [w, h - 6], [0, h - 6]], { fill: PAL.cream, w: 5 }); }
function forkArt(c, w, h) { ink(c, [[w * .3, h * .45], [w * .38, h * .45], [w * .38, h], [w * .3, h]], { fill: '#d9d9e0', w: 4 }); for (let i = 0; i < 3; i++) ink(c, [[w * (.24 + i * .07), 0], [w * (.28 + i * .07), 0], [w * (.28 + i * .07), h * .45], [w * (.24 + i * .07), h * .45]], { fill: '#d9d9e0', w: 4 }); ink(c, [[w * .62, 0], [w * .74, 0], [w * .72, h], [w * .64, h]], { fill: '#d9d9e0', w: 4 }); }
const stand = (key, w, h, art, x, y, k, o = {}) => { if (k <= .001) return; pop(g, card(key, w, h, art), x, y, k, o); };
// sound arcs (the growl), drawn on the board in front
function arcs(x, y, t, k, n = 3, r0 = 120, col = PAL.ink) { if (k <= 0) return; g.save(); g.globalAlpha = k; g.strokeStyle = col; g.lineWidth = 8; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1, r = r0 + ph * 140; g.globalAlpha = k * (1 - ph); for (const sd of [-1, 1]) { g.beginPath(); g.arc(x, y, r, sd > 0 ? -.5 : Math.PI - .5, sd > 0 ? .5 : Math.PI + .5); g.stroke(); } } g.restore(); }

// ---------- board backgrounds per act ----------
function boardArt(kind) { return (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); const cols = { body: ['#ffd9de', '#ffeef0'], gut: ['#ffe2d6', '#fff2ea'], clock: ['#e6f1fb', '#f6fbff'], brain: ['#efe3fb', '#fbf6ff'], end: ['#ffe9c7', '#fff8ea'] }[kind];
  gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,255,255,${.25 + hash(i) * .3})`; c.beginPath(); c.arc(hash(i * 3) * w, hash(i * 7) * h, 8 + hash(i * 5) * 26, 0, 7); c.fill(); }
  if (kind === 'body' || kind === 'gut') { c.fillStyle = 'rgba(233,112,138,.18)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(w * (.1 + i * .2), h * .92, w * .14, h * .12, 0, 0, 7); c.fill(); } } }; }
const BOARD = ['body', 'gut', 'body', 'clock', 'brain', 'body', 'end'];

// ---------- captions on a 2-line paper strip (y 1260-1420) ----------
function caption(t) { const ph = PH.findLast(p => t >= p.start - .2); if (!ph || ph.i === PH.length - 1) return; const a = clamp((t - ph.start + .2) / .2) * (ph.i < PH.length - 1 ? clamp((PH[ph.i + 1].start - .1 - t) / .15) : 1); if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.font = '600 46px Fredoka'; g.textBaseline = 'middle'; const toks = []; ph.cap.split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach(sg => { const b = sg.startsWith('**'); (b ? sg.slice(2, -2) : sg).split(' ').filter(Boolean).forEach(w => toks.push([w, b])); });
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; toks.forEach(([w, b]) => { const ww = g.measureText(w).width; if (lw + ww > 860 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, b, ww]); lw += ww + sp; });
  const hh = 70 + lines.length * 58, y0 = 1340 - hh / 2, x0 = 80, w = 920;
  g.fillStyle = 'rgba(40,20,8,.35)'; g.filter = 'blur(8px)'; g.beginPath(); g.roundRect(x0 + 4, y0 + 10, w, hh, 28); g.fill(); g.filter = 'none';
  g.fillStyle = PAL.cream; g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); g.roundRect(x0, y0, w, hh, 28); g.fill(); g.stroke();
  lines.forEach((ln, li) => { const lwid = ln.reduce((s2, x) => s2 + x[2], 0) + sp * (ln.length - 1); let x = W / 2 - lwid / 2; ln.forEach(([wd, b, ww]) => { g.fillStyle = b ? PAL.coral : PAL.ink; g.fillText(wd, x, y0 + 64 + li * 58); x += ww + sp; }); }); g.restore(); }
// chapter strip (progress device) in the bottom band
const CH = [['GROWL', 0], ['SQUEEZE', 3], ['EMPTY', 6], ['CLEANING', 8], ['HORMONES', 11], ['ANSWER', 14]];
function chapters(t) { if (t > s(16) - .3) return; let cur = 0; CH.forEach(([, i], k) => { if (t >= s(i) - .4) cur = k; }); g.save(); const x0 = 140, dx = 160, y = 1560;
  g.strokeStyle = 'rgba(255,248,234,.7)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + dx * 5, y); g.stroke();
  CH.forEach(([lab], k) => { const x = x0 + k * dx, on = k === cur; g.fillStyle = on ? PAL.coral : k < cur ? '#f3c87a' : PAL.border; g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); g.arc(x, y, on ? 18 : 12, 0, 7); g.fill(); g.stroke();
    g.font = `${on ? 700 : 600} 22px Fredoka`; g.textAlign = 'center'; g.fillStyle = on ? PAL.ink : 'rgba(74,47,42,.6)'; g.fillText(lab, x, y + 46); }); g.restore(); }

// ---------- acts ----------
function act0(t) { const k = kAct(t, 0), sh = Math.sin(t * 38) * 5 * (t < s(1) + 2 ? 1 : .3);
  g.save(); g.translate(sh, 0); stand('stomach', 420, 360, (c, w, h) => stomachArt(c, w, h, { face: true }), 540, 940, k, { scale: 1.15 }); g.restore();
  arcs(540, 700, t, k, 3, 220, PAL.coral);
  ['G', 'R', 'R', 'R'].forEach((ch, i) => { const kk = back(R(t, -.2 + i * .12, .4)); stand('L' + ch + i, 120, 120, letterArt(ch, ['#f3c87a', '#ff7a59', '#8fd0ee', '#8fcf86'][i]), 240 + i * 200, 1190, kk * k, { scale: 1, lean: Math.sin(t * 9 + i) * .12 }); });
  if (t < s(1) - .1) sign(g, 'hook', 'Not hungry?\nStill growls.', 540, 190, 300, 620, 200, Math.sin(t * 2) * .04, { font: '600 66px Fredoka' });
  else sign(g, 'hook2', 'Why does your\nstomach growl?', 540, 190, 300 - 60 * (1 - back(R(t, s(1) - .1, .4))), 680, 200, Math.sin(t * 2.4) * .06, { font: '600 64px Fredoka' }); }
function act1(t) { const i = 1, k = kAct(t, i), t0 = ACT[i][0];
  // the gut tube standing on the fold; a squeeze ring travels along it pushing gas bubbles and fluid
  stand('tube', 880, 320, tubeArt, 540, 960, k);
  if (k > .9) { const x = 120 + ((t - t0) * 210) % 860, c = g; c.save(); c.fillStyle = GUTD; c.strokeStyle = PAL.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(x - 34, 640, 68, 70, 20); c.fill(); c.stroke(); c.beginPath(); c.roundRect(x - 34, 830, 68, 70, 20); c.fill(); c.stroke(); c.restore();
    for (let j = 0; j < 6; j++) { const bx = x + 60 + j * 70, by = 770 + Math.sin(t * 5 + j) * 18; if (bx > 980) continue; g.save(); g.fillStyle = j % 2 ? GAS : BLUE; g.strokeStyle = PAL.ink; g.lineWidth = 4; g.beginPath(); g.arc(bx, by, j % 2 ? 22 : 18, 0, 7); g.fill(); g.stroke(); g.restore(); } }
  label(g, 'peristalsis', 300, 520, { a: R(t, s(3) + .6, .4) * k, sub: 'muscle waves' });
  if (t > s(4) - .2) { label(g, 'gas + fluid', 780, 520, { a: R(t, s(4), .4) * k }); const gk = back(R(t, s(4) + 1.6, .4)); stand('gurgle', 300, 110, (c, w, h) => { ink(c, rect(w, h), { fill: '#fff7e6', w: 6 }); c.fillStyle = PAL.coral; c.font = '700 64px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GURGLE!', w / 2, h / 2 + 4); }, 760, 1180, gk * k); }
  if (t > s(5) - .2) { const ck = back(R(t, s(5) - .1, .5)); stand('column', 200, 340, columnArt, 230, 1190, ck * k); sign(g, 'borb', 'borborygmi\n= "rumbling"', 640, 190, 300, 600, 200, Math.sin(t * 2.2) * .05, { font: '600 60px Fredoka' }); } }
function act2(t) { const i = 2, k = kAct(t, i), t0 = ACT[i][0];
  stand('full', 330, 290, (c, w, h) => stomachArt(c, w, h, { food: true }), 280, 940, k); stand('empty', 330, 290, (c, w, h) => stomachArt(c, w, h, { col: '#ffc9d2' }), 780, 940, kAct(t, i, .25));
  arcs(280, 790, t, k * .35, 2, 90); arcs(780, 790, t, kAct(t, i, .25), 3, 120, PAL.coral);
  label(g, 'full', 280, 1120, { a: R(t, t0 + .9, .3) * k, sub: 'muffled' }); label(g, 'empty', 780, 1120, { a: R(t, t0 + 1.3, .3) * k, sub: 'LOUD', col: '#ffd9c7' });
  sign(g, 'twist', 'Loudest when\nEMPTY', 540, 190, 290, 560, 200, Math.sin(t * 2) * .04, { font: '600 62px Fredoka' }); }
function act3(t) { const i = 3, k = kAct(t, i), t0 = ACT[i][0];
  stand('clock', 300, 300, clockArt('2 hrs'), 280, 900, k); { const a = (t - t0) * 2.4; g.save(); g.strokeStyle = PAL.ink; g.lineWidth = 8; g.lineCap = 'round'; g.globalAlpha = clamp(k); g.beginPath(); g.moveTo(280, 755); g.lineTo(280 + Math.cos(a) * 80, 755 + Math.sin(a) * 80); g.stroke(); g.restore(); }
  stand('stomach2', 330, 290, (c, w, h) => stomachArt(c, w, h, { col: '#ffc9d2' }), 760, 940, kAct(t, i, .2));
  // phrase 9: the broom sweeps the leftovers along
  if (t > s(9) - .3) { const u = ease(R(t, s(9), 3.2)); stand('broom', 150, 260, broomArt, lerp(620, 960, u), 1190, back(R(t, s(9) - .2, .4)) * k, { lean: -.2 }); for (let j = 0; j < 6; j++) { const cx = lerp(660, 1000, u) + 40 + j * 22 - u * 60; g.save(); g.fillStyle = ['#f3c87a', '#8fcf86', '#c9556f'][j % 3]; g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); g.arc(Math.min(cx, 960), 1170 - (j % 2) * 18, 13, 0, 7); g.fill(); g.stroke(); g.restore(); } }
  if (t > s(10) - .3) { label(g, 'every 90-120 min', 540, 520, { a: R(t, s(10), .4) * k, sub: 'while you fast', w: 560 }); for (let j = 0; j < 4; j++) { const kk = back(R(t, s(10) + .5 + j * .25, .35)); stand('cyc' + j, 110, 110, clockArt(''), 220 + j * 210, 1190, kk * k, { scale: .9 }); } }
  sign(g, 'clean', 'Cleaning wave', 540, 190, 300, 560, 140, Math.sin(t * 2) * .04, { font: '600 62px Fredoka' }); }
function act4(t) { const i = 4, k = kAct(t, i), t0 = ACT[i][0];
  stand('brain', 360, 280, brainArt, 760, 900, k); stand('stomach3', 300, 260, (c, w, h) => stomachArt(c, w, h, {}), 260, 960, kAct(t, i, .2));
  // envelopes fly from gut to brain
  const env = (key, txt, col, t1) => { const u = ease(R(t, t1, 1.8)); if (u <= 0) return; const x = lerp(300, 720, u), y = lerp(860, 700, u) - Math.sin(u * Math.PI) * 160; stand(key, 210, 140, envArt(txt, col), x, y + 140, back(R(t, t1 - .1, .3)) * k, { scale: .9 }); };
  env('env1', 'motilin', '#f3c87a', s(12) + .2); if (t > s(12) + 2.3) { g.save(); g.globalAlpha = R(t, s(12) + 2.3, .3) * k; g.fillStyle = PAL.coral; g.font = '700 110px Fredoka'; g.textAlign = 'center'; g.fillText('?', 900, 690); g.restore(); }
  if (t > s(13) - .3) { env('env2', 'ghrelin', '#8fd0ee', s(13) + .1); for (let j = 0; j < 3; j++) { const kk = back(R(t, s(13) + 1.2 + j * .3, .35)); stand('plate' + j, 170, 110, plateArt, 230 + j * 230, 1190, kk * k, { scale: .9 }); const bh = 60 + j * 0; g.save(); g.globalAlpha = kk * k; g.fillStyle = '#8fd0ee'; g.strokeStyle = PAL.ink; g.lineWidth = 4; const by = 1100 - 90 * kk; g.beginPath(); g.roundRect(170 + j * 230, by, 30, 1100 - by, 6); g.fill(); g.stroke(); g.restore(); } label(g, 'rises before meals', 540, 520, { a: R(t, s(13) + 1.6, .4) * k, w: 560 }); }
  sign(g, 'hunger', 'A hunger signal?', 540, 190, 300, 600, 140, Math.sin(t * 2) * .04, { font: '600 60px Fredoka' }); }
function act5(t) { const i = 5, k = kAct(t, i), t0 = ACT[i][0];
  if (t < s(15) - .2) { stand('stomach4', 380, 320, (c, w, h) => stomachArt(c, w, h, { face: true }), 420, 960, k); stand('broom2', 150, 260, broomArt, 720, 960, kAct(t, i, .2), { lean: Math.sin(t * 4) * .15 }); stand('fork', 140, 220, forkArt, 900, 960, back(R(t, s(14) + 2.6, .4)) * k);
    arcs(420, 760, t, k * .6, 2, 150, PAL.coral); sign(g, 'house', 'Cleaning house', 540, 190, 300, 600, 140, Math.sin(t * 2) * .04, { font: '600 62px Fredoka' }); label(g, 'hunger, same time', 760, 1180, { a: R(t, s(14) + 2.8, .4) * k, w: 400 }); }
  else { const kq = back(R(t, s(15) - .1, .5)); sign(g, 'q', 'Worst moment?', 540, 190, 300, 600, 140, Math.sin(t * 2) * .05, { font: '600 64px Fredoka' }); stand('stomach5', 380, 320, (c, w, h) => stomachArt(c, w, h, { face: true, frown: true }), 540, 960, k);
    arcs(540, 760, t, kq, 3, 200, PAL.coral); label(g, 'YES', 330, 1180, { a: R(t, s(15) + .8, .3), w: 220, col: '#ffd9c7' }); label(g, 'NO', 750, 1180, { a: R(t, s(15) + 1.1, .3), w: 220, col: '#d9f0f6' }); } }
function act6(t) { const i = 6, k = kAct(t, i), t0 = ACT[i][0];
  sign(g, 'end', 'Follow for more of\nhow it really works.', 540, 190, 330, 820, 230, Math.sin(t * 2) * .03, { font: '600 64px Fredoka' });
  label(g, "A new 'wait, really?' every day.", 540, 720, { a: R(t, t0 + .5, .4), w: 760 }); label(g, '@howitreallyworkstudio', 540, 840, { a: R(t, t0 + .8, .4), w: 560, col: '#ffd9c7' });
  // loop back toward frame 0: the stomach and its GRRR letters pop back up
  stand('stomach', 420, 360, (c, w, h) => stomachArt(c, w, h, { face: true }), 540, 1190, back(R(t, t0 + 1.0, .5)), { scale: .75 }); arcs(540, 1020, t, R(t, t0 + 1.3, .4), 2, 160, PAL.coral); }
const ACTS = [act0, act1, act2, act3, act4, act5, act6];

function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0); desk(g); book(g); const i = actAt(t);
  const z = 1 + .01 * Math.sin(t * .8); g.setTransform(z, 0, 0, z, W / 2 * (1 - z) + 6 * Math.sin(t * .5), H / 2 * (1 - z));   // the lamp-lit camera breathes a little
  board(g, BOARD[i], boardArt(BOARD[i]), kAct(t, i)); ACTS[i](t); g.setTransform(1, 0, 0, 1, 0, 0); caption(t); chapters(t); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .3; g.fillStyle = '#2a1608'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); desk(g); book(g); board(g, 'body', boardArt('body'), 1);
  stand('stomach', 420, 360, (c, w, h) => stomachArt(c, w, h, { face: true }), 540, 1000, 1, { scale: 1.3 }); arcs(540, 720, .3, 1, 3, 240, PAL.coral);
  ['G', 'R', 'R', 'R'].forEach((ch, i) => stand('L' + ch + i, 120, 120, letterArt(ch, ['#f3c87a', '#ff7a59', '#8fd0ee', '#8fcf86'][i]), 220 + i * 200, 1300, 1, { scale: 1 }));
  sign(g, 'thumb', 'Why does it\ngrowl?', 540, 190, 330, 680, 230, 0, { font: '700 86px Fredoka' }); };
window.seek(0); window.ready = true; window.READY = true;
