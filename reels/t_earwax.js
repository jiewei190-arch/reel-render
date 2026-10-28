// t_earwax.js: "What is earwax actually for?" in template #10 paper-popup (Lemo paper-popup grammar; same kit as the ship / skeleton / stomachgrowl reels).
// Demo moves reused: an open pop-up book on a desk under a warm lamp, a standing back board with layered paper scenery, cut-paper cards with a white
// border + cardboard edge + grain + cut-out shadow that spring up around their bottom edge (back to front, with overshoot), cardboard signs dropping on
// strings, paper labels, and acts that fold flat and pop back up (the page-turn beat). The ear canal is a pop-up anatomy page; the conveyor belt is a
// pull-tab mechanism. Safe zones: signs and cards between y 250 and 1230, captions on a paper strip at y 1260-1420, nothing in the right column below 840,
// nothing in the bottom 480 px.
import { W, H, PAL, clamp, lerp, ramp, ease, back, hash, wobble, ink, crescent, bez, card, pop, desk, book, board, sign, label } from './styles/popup/popup.js';
await document.fonts.load('600 60px Fredoka'); await document.fonts.load('500 30px Fredoka');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); const R = ramp;
const SKIN = '#f6c7a8', SKIND = '#e09a7a', WAX = '#f2b441', WAXD = '#c9822a', DRY = '#e9d3a0', DRYD = '#b89a62', GERM = '#8fcf86', DUST = '#c9c2b8', DRUM = '#f7a9b8';
const rect = (w, h, m = 6) => [[m, m], [w - m, m], [w - m, h - m], [m, h - m]];

// ---------- acts (each folds flat and pops back up: the page-turn beat) ----------
const ACT = [[0, s(2) - .4], [s(2) - .4, s(5) - .4], [s(5) - .4, s(9) - .4], [s(9) - .4, s(12) - .4], [s(12) - .4, s(16) - .4], [s(16) - .4, s(18) - .4], [s(18) - .4, TOT + 1]];
const actAt = t => { let i = 0; ACT.forEach((a, k) => { if (t >= a[0]) i = k; }); return i; };
const kAct = (t, i, d = 0) => { const [a, b] = ACT[i]; const up = i === 0 ? 1 : back(R(t, a + .25 + d, .55)), down = i === ACT.length - 1 ? 1 : 1 - ease(R(t, b - .3, .3)); return clamp(up, 0, 1.2) * down; };
const stand = (key, w, h, art, x, y, k, o = {}) => { if (k <= .001) return; pop(g, card(key, w, h, art), x, y, k, o); };

// ---------- art ----------
function face(c, x, y, sc = 1, mood = 'happy') { c.fillStyle = PAL.ink; [[-16, 0], [16, 0]].forEach(([dx]) => { c.beginPath(); c.arc(x + dx * sc, y, 6 * sc, 0, 7); c.fill(); });
  c.lineWidth = 5 * sc; c.strokeStyle = PAL.ink; c.lineCap = 'round'; c.beginPath(); if (mood === 'happy') c.arc(x, y + 12 * sc, 14 * sc, .15 * Math.PI, .85 * Math.PI); else { c.moveTo(x - 12 * sc, y + 22 * sc); c.lineTo(x + 12 * sc, y + 22 * sc); } c.stroke(); }
function waxArt(o = {}) { return (c, w, h) => { const P = wobble(w / 2, h * .56, w * .42, h * .38, o.seed || 3, .07, 40); crescent(c, P, o.dry ? DRY : WAX, o.dry ? DRYD : WAXD, 12, -10);
  if (o.dry) { c.strokeStyle = 'rgba(120,90,40,.5)'; c.lineWidth = 4; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(w * (.25 + hash(i) * .5), h * (.35 + hash(i * 3) * .4)); c.lineTo(w * (.3 + hash(i * 5) * .45), h * (.4 + hash(i * 7) * .4)); c.stroke(); } }
  else { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(w * .36, h * .4, w * .08, h * .05, -.5, 0, 7); c.fill(); }
  if (o.face !== false) face(c, w / 2, h * .55, w / 260, o.mood); if (o.broom) { ink(c, [[w * .82, h * .1], [w * .88, h * .1], [w * .9, h * .62], [w * .84, h * .62]], { fill: '#c9955f', w: 4 }); } }; }
function earArt(c, w, h) { const P = bez([w * .62, h * .06], [w * .02, h * .02], [w * .0, h * .62], [w * .36, h * .72], 22).concat(bez([w * .36, h * .72], [w * .5, h * .78], [w * .42, h * .98], [w * .58, h * .96], 12)).concat(bez([w * .58, h * .96], [w * .9, h * .92], [w * .96, h * .3], [w * .62, h * .06], 22));
  crescent(c, P, SKIN, SKIND, 14, -10); c.strokeStyle = SKIND; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(w * .62, h * .2); c.bezierCurveTo(w * .2, h * .16, w * .16, h * .58, w * .44, h * .6); c.stroke();
  ink(c, wobble(w * .56, h * .5, w * .1, h * .1, 7, .05, 24), { fill: '#7a3f35', w: 5 }); }
function germArt(c, w, h) { const P = wobble(w / 2, h / 2, w * .32, h * .32, 11, .12, 30); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; ink(c, [[w / 2 + Math.cos(a) * w * .3, h / 2 + Math.sin(a) * h * .3], [w / 2 + Math.cos(a) * w * .44, h / 2 + Math.sin(a) * h * .44]], { w: 6, closed: false }); c.fillStyle = GERM; c.beginPath(); c.arc(w / 2 + Math.cos(a) * w * .44, h / 2 + Math.sin(a) * h * .44, 8, 0, 7); c.fill(); }
  ink(c, P, { fill: GERM, w: 6 }); face(c, w / 2, h / 2 - 4, w / 220, 'flat'); }
function dustArt(c, w, h) { const P = wobble(w / 2, h * .55, w * .4, h * .34, 21, .2, 40); ink(c, P, { fill: DUST, w: 5 }); c.strokeStyle = 'rgba(90,80,70,.5)'; c.lineWidth = 3; for (let i = 0; i < 10; i++) { const a = hash(i) * 6.28; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * w * .3, h * .55 + Math.sin(a) * h * .25); c.lineTo(w / 2 + Math.cos(a) * w * .46, h * .55 + Math.sin(a) * h * .4); c.stroke(); } }
function swabArt(c, w, h) { ink(c, [[w * .1, h * .44], [w * .9, h * .44], [w * .9, h * .56], [w * .1, h * .56]], { fill: '#f3ead8', w: 4 }); [[w * .1, 0], [w * .9, 1]].forEach(([x]) => ink(c, wobble(x, h / 2, w * .1, h * .3, x, .08, 20), { fill: '#ffffff', w: 5 })); }
function jawArt(open) { return (c, w, h) => { ink(c, wobble(w / 2, h * .5, w * .44, h * .4, 5, .03, 40), { fill: SKIN, w: 6 }); ink(c, [[w * .2, h * .5 - open * 30], [w * .8, h * .5 - open * 30], [w * .7, h * .5 + open * 30], [w * .3, h * .5 + open * 30]], { fill: '#8a3a3a', w: 5 });
  c.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) c.fillRect(w * (.28 + i * .11), h * .5 - open * 30, w * .08, 14); face(c, w / 2, h * .28, w / 300, 'happy'); }; }
function personArt(col) { return (c, w, h) => { ink(c, wobble(w / 2, h * .28, w * .22, h * .2, 3, .02, 24), { fill: SKIN, w: 5 }); ink(c, [[w * .2, h * .52], [w * .8, h * .52], [w * .9, h * .96], [w * .1, h * .96]], { fill: col, w: 5 }); }; }
function dnaArt(c, w, h) { c.lineWidth = 8; c.lineCap = 'round'; for (let k = 0; k < 2; k++) { c.strokeStyle = k ? '#8fd0ee' : PAL.coral; c.beginPath(); for (let i = 0; i <= 40; i++) { const y = h * .06 + i / 40 * h * .88, x = w / 2 + Math.sin(i / 40 * 6.28 * 1.5 + k * Math.PI) * w * .3; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.strokeStyle = PAL.ink; c.lineWidth = 4; for (let i = 1; i < 12; i++) { const u = i / 12, y = h * .06 + u * h * .88, a = Math.sin(u * 6.28 * 1.5) * w * .3; c.beginPath(); c.moveTo(w / 2 + a, y); c.lineTo(w / 2 - a, y); c.stroke(); } }
function letterArt(ch, col) { return (c, w, h) => { ink(c, wobble(w / 2, h / 2, w * .44, h * .44, ch.charCodeAt(0), .06, 20), { fill: col, w: 6 }); c.fillStyle = PAL.ink; c.font = '700 96px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, w / 2, h / 2 + 4); }; }
function globeArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .46, h * .46, 2, .01, 48), { fill: '#8fd0ee', w: 6 });
  const land = [[[.18, .3], [.42, .22], [.5, .4], [.4, .6], [.26, .55]], [[.48, .26], [.86, .24], [.9, .46], [.74, .58], [.56, .5]], [[.6, .62], [.74, .64], [.72, .8], [.6, .76]]];
  land.forEach((p, i) => ink(c, p.map(([x, y]) => [w * x, h * y]), { fill: i === 1 ? '#f3c87a' : '#8fcf86', w: 4 }));
  ink(c, [[.7, .3], [.84, .3], [.86, .44], [.72, .48]].map(([x, y]) => [w * x, h * y]), { fill: PAL.coral, w: 4 }); }
function shieldArt(c, w, h) { const P = [[w * .5, h * .04], [w * .92, h * .18], [w * .86, h * .62], [w * .5, h * .96], [w * .14, h * .62], [w * .08, h * .18]]; crescent(c, P, WAX, WAXD, 12, -10); face(c, w / 2, h * .48, w / 220, 'happy'); }
function stampArt(txt, col) { return (c, w, h) => { ink(c, wobble(w / 2, h / 2, w * .44, h * .4, 9, .02, 40), { fill: '#fff7e6', w: 6 }); c.strokeStyle = col; c.lineWidth = 10; c.beginPath(); c.ellipse(w / 2, h / 2, w * .36, h * .3, 0, 0, 7); c.stroke(); c.fillStyle = col; c.font = `800 ${Math.round(Math.min(70, w * .66 / (txt.length * .6)))}px Fredoka`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4); }; }
// the canal cross-section, drawn on the board (eardrum left, opening right); conveyor treads move outward
function canal(t, k, { belt = 0, wax = 0, glands = 0, swab = 0, jaw = 0 } = {}) { if (k <= .01) return; g.save(); g.globalAlpha = clamp(k);
  const x0 = 140, x1 = 940, yt = 640, yb = 900, lift = (1 - clamp(k)) * 80; g.translate(0, lift);
  ink(g, [[x0, yt - 120], [x1, yt - 150], [x1 + 30, yt - 40], [x0 + 40, yt]], { fill: SKIN, w: 6 }); ink(g, [[x0 + 40, yb], [x1 + 30, yb + 40], [x1, yb + 150], [x0, yb + 120]], { fill: SKIN, w: 6 });
  ink(g, wobble(x0 + 20, (yt + yb) / 2, 34, 150, 4, .04, 30), { fill: DRUM, w: 6 }); label(g, 'eardrum', x0 + 130, (yt + yb) / 2, { w: 200, a: R(t, ACT[actAt(t)][0] + .8, .4) * (swab > 0 ? 0 : 1) });
  if (glands > 0) for (let i = 0; i < 6; i++) { const x = x0 + 160 + i * 120, p = clamp(glands * 6 - i); g.fillStyle = WAXD; g.beginPath(); g.arc(x, yt - 70, 12 * p, 0, 7); g.fill(); g.beginPath(); g.arc(x + 40, yb + 70, 12 * p, 0, 7); g.fill();
    const d = ((t * .8 + i * .3) % 1) * p; g.fillStyle = WAX; g.beginPath(); g.arc(x, yt - 70 + d * 60, 10 * p, 0, 7); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 3; g.stroke(); }
  if (belt > 0) { const off = (t * 60 * belt) % 60; g.strokeStyle = 'rgba(120,60,40,.6)'; g.lineWidth = 5; for (let x = x0 + 60 + off; x < x1; x += 60) { g.beginPath(); g.moveTo(x, yt - 26); g.lineTo(x + 18, yt - 10); g.stroke(); g.beginPath(); g.moveTo(x, yb + 26); g.lineTo(x + 18, yb + 10); g.stroke(); }
    g.fillStyle = PAL.coral; for (const [y, d] of [[yt - 10, -1], [yb + 10, 1]]) { for (let x = x0 + 160; x < x1; x += 220) { g.beginPath(); g.moveTo(x + 24, y + d * 22); g.lineTo(x + 54, y + d * 22); g.lineTo(x + 46, y + d * 32); g.closePath(); g.fill(); } } }
  if (wax > 0) for (let i = 0; i < 5; i++) { const u = ((t * .09 * belt + i / 5) % 1), x = lerp(x0 + 80, x1 + 40, u), y = (i % 2 ? yt + 10 : yb - 10), dry = clamp((u - .6) / .3), r = 30 * (1 - .3 * dry);
    g.fillStyle = dry > .5 ? DRY : WAX; g.strokeStyle = PAL.ink; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, r * 1.3, r * .7, 0, 0, 7); g.fill(); g.stroke(); if (u > .9) { for (let j = 0; j < 3; j++) { g.fillStyle = DRY; g.beginPath(); g.arc(x + 20 + j * 14, y + 40 + (u - .9) * 600 + j * 18, 7, 0, 7); g.fill(); g.stroke(); } } }
  if (swab > 0) { const x = lerp(x1 + 220, x0 + 240, ease(swab)); g.save(); g.translate(x, (yt + yb) / 2); g.fillStyle = '#f3ead8'; g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); g.roundRect(0, -12, 520, 24, 10); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, 46, 30, 0, 0, 7); g.fill(); g.stroke(); g.restore();
    const pushed = lerp(x0 + 360, x0 + 120, ease(swab)); g.fillStyle = WAX; g.beginPath(); g.ellipse(pushed, (yt + yb) / 2, 60, 80, 0, 0, 7); g.fill(); g.stroke(); }
  g.restore(); }

// ---------- board backgrounds per act ----------
function boardArt(kind) { return (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); const cols = { warm: ['#ffe6cf', '#fff5ea'], canal: ['#ffd9c9', '#fff0e6'], belt: ['#fde9c4', '#fff8e8'], swab: ['#e6f1fb', '#f6fbff'], gene: ['#efe3fb', '#fbf6ff'], end: ['#ffe9c7', '#fff8ea'] }[kind];
  gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,255,255,${.25 + hash(i) * .3})`; c.beginPath(); c.arc(hash(i * 3) * w, hash(i * 7) * h, 8 + hash(i * 5) * 26, 0, 7); c.fill(); } }; }
const BOARD = ['warm', 'canal', 'belt', 'swab', 'gene', 'warm', 'end'];

// ---------- captions on a paper strip (y 1260-1420) ----------
function caption(t) { const ph = PH.findLast(p => t >= p.start - .2); if (!ph || ph.i === PH.length - 1) return; const a = clamp((t - ph.start + .2) / .2) * clamp((PH[ph.i + 1].start - .1 - t) / .15); if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.font = '600 46px Fredoka'; g.textBaseline = 'middle'; const toks = []; ph.cap.split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach(sg => { const b = sg.startsWith('**'); (b ? sg.slice(2, -2) : sg).split(' ').filter(Boolean).forEach(w => toks.push([w, b])); });
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; toks.forEach(([w, b]) => { const ww = g.measureText(w).width; if (lw + ww > 820 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, b, ww]); lw += ww + sp; });
  const hh = 70 + lines.length * 58, y0 = 1340 - hh / 2, x0 = 100, w = 880;
  g.fillStyle = 'rgba(40,20,8,.35)'; g.filter = 'blur(8px)'; g.beginPath(); g.roundRect(x0 + 4, y0 + 10, w, hh, 28); g.fill(); g.filter = 'none';
  g.fillStyle = PAL.cream; g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); g.roundRect(x0, y0, w, hh, 28); g.fill(); g.stroke();
  lines.forEach((ln, li) => { const lwid = ln.reduce((s2, x) => s2 + x[2], 0) + sp * (ln.length - 1); let x = W / 2 - lwid / 2; ln.forEach(([wd, b, ww]) => { g.fillStyle = b ? PAL.coral : PAL.ink; g.fillText(wd, x, y0 + 64 + li * 58); x += ww + sp; }); }); g.restore(); }

// ---------- acts ----------
function act0(t) { const k = kAct(t, 0), wob = Math.sin(t * 3) * .05;
  stand('ear', 560, 640, earArt, 380, 1210, k, { scale: 1.05, lean: wob * .3 });
  // the wax hero pops out of the ear, looks around; at the but-turn the DIRT card folds down and a broom card pops up
  const wk = back(R(t, -.5, .5)); stand('wax0', 260, 240, waxArt({ seed: 3 }), 700, 1010 - 30 * Math.abs(Math.sin(t * 3)), wk * k, { lean: Math.sin(t * 4) * .1 });
  const dk = back(R(t, .4, .4)) * (1 - R(t, s(1) + .3, .3)); stand('dirt', 260, 120, stampArt('DIRT?', PAL.ink), 820, 1200, dk * k, { lean: -.06 });
  if (t > s(1)) { const bk = back(R(t, s(1) + .5, .5)); stand('clean', 300, 120, stampArt('CLEANER', '#3f8f5a'), 800, 1200, bk * k, { lean: .05 }); for (let i = 0; i < 5; i++) { const u = (t * 1.2 + i / 5) % 1; g.save(); g.globalAlpha = bk * (1 - u); g.fillStyle = '#fff7c2'; g.beginPath(); g.arc(700 + Math.cos(i * 1.3) * (60 + u * 120), 860 + Math.sin(i * 1.3) * (60 + u * 120), 10 * (1 - u), 0, 7); g.fill(); g.restore(); } }
  if (t < s(1) - .1) sign(g, 'hook', 'What is earwax\nactually FOR?', 540, 190, 340, 660, 180, Math.sin(t * 2) * .04, { font: '600 64px Fredoka' });
  else sign(g, 'hook2', 'Not dirt.\nA built-in cleaner.', 540, 190, 340 - 60 * (1 - back(R(t, s(1) - .1, .4))), 680, 180, Math.sin(t * 2.4) * .06, { font: '600 60px Fredoka' }); }
function act1(t) { const i = 1, k = kAct(t, i);
  canal(t, k, { glands: R(t, s(2) + .4, 1.4), wax: 0 });
  label(g, 'wax glands', 540, 470, { a: R(t, s(2) + 1.0, .4) * k, sub: 'waxy oil = cerumen', w: 420 });
  // job 1: traps dust + germs (they fly in from the opening and stick)
  if (t > s(3) - .2) { [['dust1', dustArt, 0], ['germ1', germArt, .5], ['dust2', dustArt, 1.0], ['germ2', germArt, 1.4]].forEach(([key, art, d], j) => { const u = ease(R(t, s(3) + d, 1.2)); if (u <= 0) return; const x = lerp(1000, 520 - j * 70, u), y = lerp(560, j % 2 ? 640 : 900, u);
    stand(key, 110, 110, art, x, y + 55, back(R(t, s(3) + d, .3)) * k, { scale: .9, lean: (1 - u) * .4 }); g.save(); g.globalAlpha = k * clamp(u * 2 - 1); g.fillStyle = 'rgba(242,180,65,.75)'; g.beginPath(); g.ellipse(x, y + 20, 70, 26, 0, 0, 7); g.fill(); g.restore(); }); }
  // job 2 + 3: moist + fights bacteria (water drops and a shield card)
  if (t > s(4) - .2) { for (let j = 0; j < 5; j++) { const u = (t * .9 + j / 5) % 1; g.save(); g.globalAlpha = k * R(t, s(4), .4) * (1 - u); g.fillStyle = '#8fd0ee'; g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); g.ellipse(260 + j * 120, 1060 - u * 40, 12, 16, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
    stand('shield1', 200, 230, shieldArt, 780, 1210, back(R(t, s(4) + 1.4, .45)) * k); label(g, 'moist', 300, 1150, { a: R(t, s(4) + .2, .4) * k, w: 200 }); label(g, 'fights bacteria', 560, 1150, { a: R(t, s(4) + 1.6, .4) * k, w: 300 }); }
  const jobs = t < s(3) - .2 ? 'Made in the canal' : t < s(4) - .2 ? 'Job 1: trap dust' : 'Jobs 2 + 3:\nmoist + germ-fighting';
  sign(g, 'jobs' + (t < s(3) - .2 ? 0 : t < s(4) - .2 ? 1 : 2), jobs, 540, 190, 330, 680, t < s(4) - .2 ? 140 : 180, Math.sin(t * 2) * .04, { font: '600 56px Fredoka' }); }
function act2(t) { const i = 2, k = kAct(t, i);
  canal(t, k, { belt: R(t, s(5) + 1.2, .6), wax: R(t, s(5) + 1.4, .4), glands: 1 });
  label(g, 'opening', 780, 770, { a: R(t, s(6) + .8, .4) * k, w: 190 });
  if (t > s(6) - .2) { g.save(); g.globalAlpha = k * R(t, s(6), .4); g.strokeStyle = PAL.coral; g.lineWidth = 10; g.lineCap = 'round'; const y = 1080, x = 200 + ((t - s(6)) * 120) % 120; g.beginPath(); g.moveTo(200, y); g.lineTo(840, y); g.stroke(); g.beginPath(); g.moveTo(820, y - 30); g.lineTo(860, y); g.lineTo(820, y + 30); g.stroke(); g.restore(); label(g, 'slowly outward', 470, 1150, { a: R(t, s(6) + .4, .4) * k, w: 360 }); }
  if (t > s(7) - .2) { const op = Math.abs(Math.sin(t * 7)), jk = back(R(t, s(7) + 1.2, .45)); stand('jaw' + (op > .5 ? 1 : 0), 230, 200, jawArt(op > .5 ? 1 : .2), 200, 560, jk * k * (1 - R(t, s(8) - .4, .3)), { scale: .85 }); }
  if (t > s(8) - .2) label(g, 'dries, flakes, falls out', 700, 1150, { a: R(t, s(8) + .2, .4) * k, w: 420 });
  sign(g, 'belt', t < s(7) - .2 ? 'A conveyor belt' : 'Chew + talk = faster', 540, 190, 330, 640, 140, Math.sin(t * 2) * .04, { font: '600 60px Fredoka' }); }
function act3(t) { const i = 3, k = kAct(t, i);
  if (t < s(11) - .2) { canal(t, k, { swab: R(t, s(10) + .2, 2.2), glands: 1 });
    const nk = back(R(t, s(9) + .9, .4)); stand('no', 200, 160, stampArt('NO', PAL.coral), 790, 1215, nk * k, { lean: Math.sin(t * 5) * .08 });
    if (t > s(10) - .2) label(g, 'pushes wax deeper', 470, 1150, { a: R(t, s(10) + .6, .4) * k, w: 400 }); if (t > s(10) + 2) label(g, 'risks the eardrum', 300, 470, { a: R(t, s(10) + 2.2, .4) * k, w: 360 });
    sign(g, 'swab', 'Skip the swabs', 540, 190, 330, 600, 140, Math.sin(t * 2) * .04, { font: '600 62px Fredoka' }); }
  else { const kk = back(R(t, s(11) - .1, .5)); sign(g, 'mil', '12 MILLION', 540, 190, 340, 620, 150, Math.sin(t * 2) * .05, { font: '800 80px Fredoka' });
    for (let j = 0; j < 12; j++) { const pk = back(R(t, s(11) + .4 + j * .12, .3)); stand('p' + (j % 4), 120, 170, personArt(['#8fd0ee', '#f3c87a', '#8fcf86', '#ffb7c4'][j % 4]), 180 + (j % 6) * 140, j < 6 ? 760 : 1010, pk * kk * k, { scale: .9 }); }
    label(g, 'Americans to a doctor, each year', 540, 1150, { a: R(t, s(11) + 1.8, .4) * k, w: 640 }); } }
function act4(t) { const i = 4, k = kAct(t, i);
  if (t < s(13) - .2) { stand('wet', 300, 280, waxArt({ seed: 5 }), 290, 980, k); stand('dryw', 300, 280, waxArt({ seed: 8, dry: true }), 780, 980, kAct(t, i, .3));
    label(g, 'wet + sticky', 290, 1150, { a: R(t, s(12) + 1.4, .4) * k, w: 300 }); label(g, 'dry + flaky', 760, 1150, { a: R(t, s(12) + 3.4, .4) * k, w: 300, col: '#fff1d6' });
    sign(g, 'weird', 'Wet or dry?', 540, 190, 330, 520, 140, Math.sin(t * 2) * .04, { font: '600 64px Fredoka' }); }
  else if (t < s(15) - .2) { stand('dna', 220, 520, dnaArt, 260, 1150, back(R(t, s(13) - .1, .5)) * k, { lean: Math.sin(t * 2) * .04 });
    sign(g, 'gene', 'One gene: ABCC11', 540, 190, 330, 660, 140, Math.sin(t * 2) * .04, { font: '600 60px Fredoka' });
    if (t < s(14) - .2) { const lk = back(R(t, s(13) + 1.2, .4)); stand('LG', 150, 150, letterArt('G', '#8fcf86'), 560, 900, lk * k); stand('LA', 150, 150, letterArt('A', '#f3c87a'), 760, 900, back(R(t, s(13) + 1.6, .4)) * k); label(g, 'one letter', 660, 1000, { a: R(t, s(13) + 2.0, .4) * k, w: 260 }); }
    else { const r1 = back(R(t, s(14) + .2, .4)), r2 = back(R(t, s(14) + 2.0, .4));
      stand('AA1', 110, 110, letterArt('A', '#f3c87a'), 500, 720, r1 * k, { scale: .9 }); stand('AA2', 110, 110, letterArt('A', '#f3c87a'), 620, 720, r1 * k, { scale: .9 }); stand('dryS', 170, 150, waxArt({ seed: 9, dry: true, face: false }), 790, 730, r1 * k);
      stand('GA1', 110, 110, letterArt('G', '#8fcf86'), 500, 960, r2 * k, { scale: .9 }); stand('GA2', 110, 110, letterArt('?', '#e6f1fb'), 620, 960, r2 * k, { scale: .9 }); stand('wetS', 170, 150, waxArt({ seed: 4, face: false }), 790, 970, r2 * k);
      label(g, '= dry', 620, 790, { a: r1 * k, w: 180 }); label(g, '= wet', 620, 1030, { a: r2 * k, w: 180 }); } }
  else { stand('globe', 460, 460, globeArt, 540, 1130, back(R(t, s(15) - .1, .5)) * k, { lean: Math.sin(t * 1.5) * .04 });
    label(g, 'dry wax: most common in East Asia', 540, 1170, { a: R(t, s(15) + 1.0, .4) * k, w: 700 }); sign(g, 'map', 'Where is wax dry?', 540, 190, 330, 620, 140, Math.sin(t * 2) * .04, { font: '600 60px Fredoka' }); } }
function act5(t) { const i = 5, k = kAct(t, i);
  if (t < s(17) - .2) { canal(t, k, { belt: 1, wax: 1, glands: 1 }); stand('hero', 240, 260, shieldArt, 540, 1220, back(R(t, s(16) + .6, .5)) * k);
    sign(g, 'pay', 'Self-cleaning.\nSelf-moving.', 540, 190, 340, 620, 180, Math.sin(t * 2) * .04, { font: '600 62px Fredoka' }); }
  else { sign(g, 'q', 'Wet or dry?', 540, 190, 330, 560, 140, Math.sin(t * 2) * .05, { font: '600 66px Fredoka' });
    stand('qw', 300, 280, waxArt({ seed: 5 }), 300, 1000, k); stand('qd', 300, 280, waxArt({ seed: 8, dry: true }), 760, 1000, kAct(t, i, .2));
    label(g, 'WET', 300, 1150, { a: R(t, s(17) + .8, .3), w: 200 }); label(g, 'DRY', 760, 1150, { a: R(t, s(17) + 1.1, .3), w: 200, col: '#fff1d6' }); } }
function act6(t) { const i = 6, k = kAct(t, i), t0 = ACT[i][0];
  sign(g, 'end', 'Follow for more of\nhow it really works.', 540, 190, 360, 820, 220, Math.sin(t * 2) * .03, { font: '600 64px Fredoka' });
  label(g, "A new 'wait, really?' every day.", 540, 720, { a: R(t, t0 + .5, .4), w: 760 }); label(g, '@howitreallyworkstudio', 540, 840, { a: R(t, t0 + .8, .4), w: 560, col: '#ffd9c7' });
  // loop back toward frame 0: the ear and its wax hero pop back up
  stand('ear', 560, 640, earArt, 360, 1235, back(R(t, t0 + 1.0, .5)), { scale: .48 }); stand('wax0', 260, 240, waxArt({ seed: 3 }), 680, 1225, back(R(t, t0 + 1.3, .5)), { scale: .6 }); }
const ACTS = [act0, act1, act2, act3, act4, act5, act6];

function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0); desk(g); book(g); const i = actAt(t);
  const z = 1 + .01 * Math.sin(t * .8); g.setTransform(z, 0, 0, z, W / 2 * (1 - z) + 6 * Math.sin(t * .5), H / 2 * (1 - z));   // the lamp-lit camera breathes a little
  board(g, BOARD[i], boardArt(BOARD[i]), kAct(t, i)); ACTS[i](t); g.setTransform(1, 0, 0, 1, 0, 0); caption(t); }
window.DUR = TOT;
// loop: the end act already pops the frame-0 ear back up; the last 0.5 s blends 30% of frame 0 in
window.seek = t => { scene(t); const lp = clamp((t - (TOT - .5)) / .5); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); scene(0); const f0 = g.getImageData(0, 0, W, H); const kk = .3 * ease(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * kk; A[i + 1] += (B[i + 1] - A[i + 1]) * kk; A[i + 2] += (B[i + 2] - A[i + 2]) * kk; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); desk(g); book(g); board(g, 'warm', boardArt('warm'), 1);
  stand('ear', 560, 640, earArt, 360, 1250, 1, { scale: 1.15 }); stand('wax0', 260, 240, waxArt({ seed: 3 }), 740, 1050, 1, { scale: 1.3 });
  sign(g, 'thumb', 'What is earwax\nFOR?', 540, 190, 330, 700, 230, 0, { font: '700 84px Fredoka' }); };
window.seek(0); window.ready = true; window.READY = true;
