// t_sunburn.js: "Why can you get sunburned on a cloudy day?" in template #10 paper-popup (Lemo paper-popup grammar; same kit as ship / stomachgrowl).
// Demo moves reused: an open pop-up book on a desk under a warm lamp, a standing back board with layered paper scenery, cut-paper cards with a white
// border + cardboard edge + grain + cut-out shadow that spring up around their bottom edge (back to front, with overshoot), cardboard signs
// dropping on strings and swinging, paper labels, and acts that fold flat and pop back up (the page-turn beat).
// UV is drawn as violet zig-zag arrows (the one thing in the book that is "light you can't see"); they poke straight through the paper clouds.
// Safe zones: signs and cards between y 260 and 1230, captions on a paper strip at y 1260-1420, nothing written below y 1440 or in the right column below 840.
import { W, H, PAL, clamp, lerp, ramp, ease, back, hash, wobble, ink, crescent, bez, card, pop, foldTab, desk, book, board, sign, label, BOOK } from './styles/popup/popup.js';
await document.fonts.load('600 60px Fredoka'); await document.fonts.load('500 30px Fredoka');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let g = cv.getContext('2d'); const R = ramp;
const UV = '#8a5cf6', UVD = '#5b34c9', SKIN = '#f6c9a3', BURN = '#ff8f7a', SAND = '#f3d79a', SEA = '#7fc8e8', SNOW = '#f4fbff', CLOUD = '#e9eef5', CLOUDD = '#b9c4d4';
const rect = (w, h, m = 6) => [[m, m], [w - m, m], [w - m, h - m], [m, h - m]];

// ---------- acts (each folds flat and pops back up: the page-turn beat) ----------
const ACT = [[0, s(2) - .4], [s(2) - .4, s(6) - .4], [s(6) - .4, s(8) - .4], [s(8) - .4, s(11) - .4], [s(11) - .4, s(14) - .4], [s(14) - .4, s(16) - .4], [s(16) - .4, s(17) - .4], [s(17) - .4, TOT + 1]];
const actAt = t => { let i = 0; ACT.forEach((a, k) => { if (t >= a[0]) i = k; }); return i; };
const kAct = (t, i, d = 0) => { const [a, b] = ACT[i]; const up = i === 0 ? 1 : back(R(t, a + .25 + d, .55)), down = i === ACT.length - 1 ? 1 : 1 - ease(R(t, b - .3, .3)); return clamp(up, 0, 1.2) * down; };

// ---------- art ----------
function sunArt(c, w, h) { const cx = w / 2, cy = h / 2; c.save(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ink(c, [[cx + Math.cos(a - .12) * w * .3, cy + Math.sin(a - .12) * h * .3], [cx + Math.cos(a) * w * .47, cy + Math.sin(a) * h * .47], [cx + Math.cos(a + .12) * w * .3, cy + Math.sin(a + .12) * h * .3]], { fill: '#ffb23f', w: 5 }); } c.restore();
  ink(c, wobble(cx, cy, w * .3, h * .3, 3, .03, 40), { fill: '#ffd34f', w: 6 }); c.fillStyle = PAL.ink; [[-.1, -.04], [.1, -.04]].forEach(([x, y]) => { c.beginPath(); c.arc(cx + x * w, cy + y * h, 7, 0, 7); c.fill(); }); c.lineWidth = 5; c.strokeStyle = PAL.ink; c.beginPath(); c.arc(cx, cy + h * .04, 22, .2, Math.PI - .2); c.stroke(); }
function cloudArt(thick = 1) { return (c, w, h) => { const P = [[.22, .62, .2], [.4, .45, .26], [.6, .42, .24], [.78, .6, .19], [.5, .66, .22], [.3, .7, .16], [.7, .7, .16]].map(([x, y, r]) => [w * x, h * y, Math.min(w * r, h * r * 1.9)]);
  const base = thick > 1.3 ? CLOUDD : CLOUD, shade = thick > 1.3 ? '#8e9bb0' : CLOUDD;
  c.strokeStyle = PAL.ink; c.lineWidth = 12; P.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); });
  c.fillStyle = shade; P.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r - 1, 0, 7); c.fill(); });
  c.fillStyle = base; P.forEach(([x, y, r]) => { c.beginPath(); c.arc(x - r * .12, y - r * .14, r * .86, 0, 7); c.fill(); }); }; }
function tag(text, x, y, k, { size = 52, sub = '', col = PAL.cream } = {}) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k); g.font = `700 ${size}px Fredoka`; const w1 = g.measureText(text).width; g.font = `500 ${size * .6}px Fredoka`; const w2 = sub ? g.measureText(sub).width : 0; const w = Math.max(w1, w2) + 60, h = size * 1.3 + (sub ? size * .75 : 0);
  g.translate(x, y); const sc = .6 + .4 * back(clamp(k)); g.scale(sc, sc); g.fillStyle = 'rgba(40,20,8,.3)'; g.beginPath(); g.roundRect(-w / 2 + 5, -h / 2 + 8, w, h, 22); g.fill(); g.fillStyle = col; g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 22); g.fill(); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = PAL.ink; g.font = `700 ${size}px Fredoka`; g.fillText(text, 0, sub ? -size * .35 : 2); if (sub) { g.font = `500 ${size * .6}px Fredoka`; g.fillText(sub, 0, size * .5); } g.restore(); }
function kidArt(burn = 0, hat = false) { return (c, w, h) => { const cx = w / 2; ink(c, [[cx - w * .3, h], [cx - w * .26, h * .62], [cx + w * .26, h * .62], [cx + w * .3, h]], { fill: '#7fc8e8', w: 6 });
  const face = wobble(cx, h * .38, w * .3, h * .3, 5, .02, 40); ink(c, face, { fill: SKIN, w: 6 }); if (burn > 0) { c.save(); c.globalAlpha = burn; ink(c, face, { fill: BURN, w: 6 }); c.restore(); c.fillStyle = 'rgba(255,90,70,.45)'; [[-.15, .45], [.15, .45]].forEach(([x, y]) => { c.beginPath(); c.ellipse(cx + x * w, h * y, 22, 14, 0, 0, 7); c.fill(); }); }
  c.fillStyle = PAL.ink; [[-.1, .36], [.1, .36]].forEach(([x, y]) => { c.beginPath(); c.arc(cx + x * w, h * y, 8, 0, 7); c.fill(); }); c.lineWidth = 5; c.strokeStyle = PAL.ink; c.beginPath(); burn > .5 ? c.arc(cx, h * .52, 20, Math.PI + .3, -.3) : c.arc(cx, h * .45, 20, .3, Math.PI - .3); c.stroke();
  if (hat) { ink(c, [[cx - w * .42, h * .2], [cx + w * .42, h * .2], [cx + w * .3, h * .13], [cx + w * .2, 0], [cx - w * .2, 0], [cx - w * .3, h * .13]], { fill: '#f3c87a', w: 6 }); }
  else ink(c, [[cx - w * .28, h * .2], [cx - w * .1, h * .04], [cx + w * .14, h * .06], [cx + w * .28, h * .22], [cx + w * .1, h * .14], [cx - w * .1, h * .16]], { fill: '#6b4a3a', w: 5 }); }; }
function skinArt(c, w, h) { const L = [[0, .22, '#f6c9a3', 'epidermis'], [.22, .58, '#f4a9a0', 'dermis'], [.58, 1, '#fbe0b8', '']]; L.forEach(([a, b, col]) => ink(c, [[6, h * a + 6], [w - 6, h * a + 6], [w - 6, h * b], [6, h * b]], { fill: col, w: 5 }));
  c.strokeStyle = 'rgba(160,60,70,.45)'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(w * (.12 + i * .2), h * .3); c.quadraticCurveTo(w * (.18 + i * .2), h * .45, w * (.12 + i * .2), h * .56); c.stroke(); } }
function dialArt(c, w, h) { const cx = w / 2, cy = h * .86, r = w * .44, cols = ['#7cc96a', '#7cc96a', '#f3d34f', '#f3d34f', '#f3d34f', '#ff9f4a', '#ff9f4a', '#ff6a5a', '#ff6a5a', '#ff6a5a', '#a86cf0', '#a86cf0'];
  ink(c, [[6, cy + 10], [w - 6, cy + 10], [w - 6, cy - r - 30], [6, cy - r - 30]], { fill: '#fff8ea', w: 6 });
  cols.forEach((col, i) => { const a0 = Math.PI + i / 12 * Math.PI, a1 = Math.PI + (i + 1) / 12 * Math.PI; c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, a1); c.closePath(); c.fill(); });
  c.fillStyle = '#fff8ea'; c.beginPath(); c.arc(cx, cy, r * .55, 0, 7); c.fill(); c.fillStyle = PAL.ink; c.font = '700 34px Fredoka'; c.textAlign = 'center'; c.fillText('UV INDEX', cx, cy - 10);
  [0, 3, 6, 8, 11].forEach(v => { const a = Math.PI + v / 11 * Math.PI; c.font = '600 28px Fredoka'; c.fillText(v === 11 ? '11+' : String(v), cx + Math.cos(a) * r * .78, cy + Math.sin(a) * r * .78 + 10); }); }
function thermoArt(txt) { return (c, w, h) => { ink(c, [[w * .38, h * .06], [w * .62, h * .06], [w * .62, h * .7], [w * .38, h * .7]], { fill: '#fff8ea', w: 6 }); ink(c, wobble(w / 2, h * .8, w * .2, w * .2, 2, .02, 30), { fill: '#7fb3ff', w: 6 }); c.fillStyle = '#7fb3ff'; c.fillRect(w * .45, h * .45, w * .1, h * .3); c.fillStyle = PAL.ink; c.font = '600 34px Fredoka'; c.textAlign = 'center'; c.fillText(txt, w / 2, h * .98); }; }
function surfArt(kind) { return (c, w, h) => { const col = { water: SEA, sand: SAND, snow: SNOW }[kind]; ink(c, rect(w, h), { fill: col, w: 6 });
  c.strokeStyle = kind === 'water' ? 'rgba(255,255,255,.8)' : kind === 'sand' ? 'rgba(170,120,60,.45)' : 'rgba(150,180,210,.6)'; c.lineWidth = 5;
  for (let i = 0; i < 5; i++) { c.beginPath(); if (kind === 'water') { c.moveTo(20, h * (.25 + i * .14)); for (let x = 20; x < w - 20; x += 20) c.lineTo(x, h * (.25 + i * .14) + 8 * Math.sin(x * .06)); } else if (kind === 'sand') { for (let j = 0; j < 6; j++) { c.moveTo(30 + j * 40 + i * 9, h * (.2 + i * .15)); c.arc(30 + j * 40 + i * 9, h * (.2 + i * .15), 2, 0, 7); } } else { c.moveTo(20, h * (.3 + i * .12)); c.lineTo(w - 20, h * (.3 + i * .12) - 10); } c.stroke(); }
  c.fillStyle = PAL.ink; c.font = '700 40px Fredoka'; c.textAlign = 'center'; c.fillText(kind.toUpperCase(), w / 2, h * .92); }; }
function umbrellaArt(c, w, h) { const cx = w / 2; const top = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; top.push([cx + Math.cos(a) * w * .46, h * .42 + Math.sin(a) * h * .36]); } ink(c, top, { fill: '#ff7a59', w: 6 });
  c.strokeStyle = PAL.ink; c.lineWidth = 7; c.beginPath(); c.moveTo(cx, h * .42); c.lineTo(cx, h * .98); c.stroke(); for (let i = 1; i < 4; i++) { c.fillStyle = '#fff8ea'; c.beginPath(); c.moveTo(cx, h * .07); c.lineTo(cx - w * .46 + i * w * .23 - w * .06, h * .42); c.lineTo(cx - w * .46 + i * w * .23 + w * .06, h * .42); c.fill(); } }
function shirtArt(c, w, h) { ink(c, [[w * .3, h * .05], [w * .7, h * .05], [w * .95, h * .25], [w * .82, h * .42], [w * .72, h * .34], [w * .72, h * .95], [w * .28, h * .95], [w * .28, h * .34], [w * .18, h * .42], [w * .05, h * .25]], { fill: '#8fcf86', w: 6 }); }
function bottleArt(c, w, h) { ink(c, [[w * .25, h * .25], [w * .75, h * .25], [w * .8, h * .95], [w * .2, h * .95]], { fill: '#ffd34f', w: 6 }); ink(c, [[w * .38, h * .05], [w * .62, h * .05], [w * .62, h * .25], [w * .38, h * .25]], { fill: '#ff7a59', w: 5 }); c.fillStyle = PAL.ink; c.font = '700 30px Fredoka'; c.textAlign = 'center'; c.fillText('SPF', w / 2, h * .62); }
function clockArt(txt) { return (c, w, h) => { ink(c, wobble(w / 2, h / 2, w * .44, h * .44, 4, .02, 40), { fill: PAL.cream, w: 6 }); c.fillStyle = PAL.ink; c.font = '600 34px Fredoka'; c.textAlign = 'center'; c.fillText(txt, w / 2, h * .74); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillRect(w / 2 + Math.cos(a) * w * .36 - 3, h / 2 + Math.sin(a) * h * .36 - 3, 6, 6); } }; }
const stand = (key, w, h, art, x, y, k, o = {}) => { if (k <= .001) return; pop(g, card(key, w, h, art), x, y, k, o); };
// a UV arrow: violet zig-zag from (x0,y0) to (x1,y1), drawn on with k; optional bounce back up from the end
function uvArrow(x0, y0, x1, y1, k, t, { w = 12, a = 1, bounce = null } = {}) { if (k <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, n = Math.max(2, Math.floor(16 * k));
  g.save(); g.globalAlpha *= a; g.lineCap = 'round'; g.lineJoin = 'round'; for (let pass = 0; pass < 2; pass++) { g.strokeStyle = pass ? UV : PAL.ink; g.lineWidth = pass ? w : w + 8; g.beginPath(); for (let i = 0; i <= n; i++) { const u = i / 16, z = (i % 2 ? 1 : -1) * 14 * Math.min(1, i, 16 - i); g[i ? 'lineTo' : 'moveTo'](x0 + ux * L * u + nx * z, y0 + uy * L * u + ny * z); } g.stroke(); }
  if (k >= 1) { const hx = x1, hy = y1; g.fillStyle = UV; g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(hx + ux * 26, hy + uy * 26); g.lineTo(hx - ux * 6 + nx * 22, hy - uy * 6 + ny * 22); g.lineTo(hx - ux * 6 - nx * 22, hy - uy * 6 - ny * 22); g.closePath(); g.fill(); g.stroke(); }
  g.restore(); if (bounce && k >= 1) uvArrow(x1, y1, bounce[0], bounce[1], R(t, bounce[2], .5), t, { w: w * .8, a: a * .85 }); }
function rays(t, list, k) { list.forEach(([x0, y0, x1, y1, d], i) => uvArrow(x0, y0, x1, y1, R(t, d, .45) * k, t)); }

// ---------- board backgrounds per act ----------
function boardArt(kind) { return (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); const cols = { grey: ['#c9d3e0', '#e9eef5'], skin: ['#ffe2d6', '#fff2ea'], sky: ['#cfe9f6', '#f2fbff'], beach: ['#cfe9f6', '#fff3d6'], snow: ['#d9ecfa', '#ffffff'], end: ['#ffe9c7', '#fff8ea'] }[kind];
  gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 22; i++) { c.fillStyle = `rgba(255,255,255,${.2 + hash(i) * .3})`; c.beginPath(); c.arc(hash(i * 3) * w, hash(i * 7) * h, 8 + hash(i * 5) * 26, 0, 7); c.fill(); }
  if (kind === 'beach' || kind === 'grey') { c.fillStyle = kind === 'grey' ? 'rgba(120,140,160,.25)' : 'rgba(127,200,232,.6)'; c.fillRect(0, h * .78, w, h * .08); c.fillStyle = 'rgba(243,215,154,.8)'; c.fillRect(0, h * .86, w, h * .14); } }; }
const BOARD = ['grey', 'skin', 'grey', 'sky', 'beach', 'grey', 'beach', 'end'];

// ---------- captions on a paper strip (y 1260-1420) ----------
function caption(t) { const ph = PH.findLast(p => t >= p.start - .2); if (!ph || ph.i === PH.length - 1) return; const a = clamp((t - ph.start + .2) / .2) * (ph.i < PH.length - 1 ? clamp((PH[ph.i + 1].start - .1 - t) / .15) : 1); if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.font = '600 46px Fredoka'; g.textBaseline = 'middle'; const toks = []; ph.cap.split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach(sg => { const b = sg.startsWith('**'); (b ? sg.slice(2, -2) : sg).split(' ').filter(Boolean).forEach(w => toks.push([w, b])); });
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; toks.forEach(([w, b]) => { const ww = g.measureText(w).width; if (lw + ww > 760 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, b, ww]); lw += ww + sp; });
  const hh = 70 + lines.length * 58, y0 = 1340 - hh / 2, x0 = 80, w = 820;
  g.fillStyle = 'rgba(40,20,8,.35)'; g.filter = 'blur(8px)'; g.beginPath(); g.roundRect(x0 + 4, y0 + 10, w, hh, 28); g.fill(); g.filter = 'none';
  g.fillStyle = PAL.cream; g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); g.roundRect(x0, y0, w, hh, 28); g.fill(); g.stroke();
  lines.forEach((ln, li) => { const lwid = ln.reduce((s2, x) => s2 + x[2], 0) + sp * (ln.length - 1); let x = x0 + w / 2 - lwid / 2; ln.forEach(([wd, b, ww]) => { g.fillStyle = b ? UVD : PAL.ink; g.fillText(wd, x, y0 + 64 + li * 58); x += ww + sp; }); }); g.restore(); }

// ---------- acts ----------
function act0(t) { const k = kAct(t, 0);   // frame 0: a grey beach day, the sun behind two big paper clouds, UV arrows poking straight through onto a sunburned kid
  stand('sun0', 300, 300, sunArt, 700, 860, k, { scale: 1.1 });
  stand('cloudA', 560, 300, cloudArt(1.6), 420, 900, k, { sway: Math.sin(t * 1.2) * .03 }); stand('cloudB', 480, 260, cloudArt(1.2), 780, 980, k, { sway: Math.sin(t * 1.5 + 1) * .03 });
  stand('kid0', 300, 360, kidArt(clamp(.4 + t * .25), false), 360, 1230, k, { scale: 1.3 });
  const ph = (t * .9) % 1; rays(t, [[660, 650, 420, 1030, -.7], [740, 650, 560, 1050, -.6], [800, 670, 330, 980, -.5]], k); for (let i = 0; i < 3; i++) { const u = (ph + i / 3) % 1; g.save(); g.globalAlpha = (1 - u) * k; g.fillStyle = UV; g.beginPath(); g.arc(lerp(720, 380, u), lerp(700, 1000, u), 10, 0, 7); g.fill(); g.restore(); }
  if (t < s(1) - .1) sign(g, 'hook', 'Cloudy...\nbut burned?', 540, 190, 340, 600, 180, Math.sin(t * 2) * .04, { font: '600 66px Fredoka' });
  else sign(g, 'hook2', 'Light you\ncan\'t see', 540, 190, 340 - 60 * (1 - back(R(t, s(1) - .1, .4))), 600, 180, Math.sin(t * 2.4) * .06, { font: '600 66px Fredoka' }); }
function act1(t) { const i = 1, k = kAct(t, i), t0 = ACT[i][0];   // UV: a slice of skin; UVB stops at the top layer (burn), UVA goes deeper
  stand('skin', 860, 420, skinArt, 540, 1180, k);
  stand('sun1', 220, 220, sunArt, 200, 640, kAct(t, i, .2));
  if (t > s(3) - .2) uvArrow(330, 560, 420, 850, R(t, s(3) + .1, .6) * k, t, { w: 14 }); if (t > s(3) + .7) tag('UVB', 500, 610, R(t, s(3) + .7, .3) * k, { sub: 'burns the top layer', col: '#efe6ff' });
  if (t > s(4) - .2) { const b = R(t, s(4), 1.0) * k; g.save(); g.globalAlpha = b * .8; g.fillStyle = BURN; g.beginPath(); g.roundRect(160, 790, 760, 80, 20); g.fill(); g.restore(); for (let j = 0; j < 4; j++) { const kk = back(R(t, s(4) + 1.6 + j * .2, .3)) * k; if (kk <= 0) continue; g.save(); g.fillStyle = '#fff2f0'; g.strokeStyle = PAL.ink; g.lineWidth = 4; g.beginPath(); g.ellipse(260 + j * 160, 800, 26 * kk, 18 * kk, 0, Math.PI, 0); g.fill(); g.stroke(); g.restore(); } }
  if (t > s(5) - .2) { uvArrow(640, 540, 760, 1010, R(t, s(5) + .1, .7) * k, t, { w: 14 }); tag('UVA', 820, 610, R(t, s(5) + .8, .3) * k, { sub: 'goes deeper', col: '#efe6ff' }); }
  sign(g, 'uv', 'UV light', 540, 190, 340, 460, 140, Math.sin(t * 2) * .04, { font: '600 66px Fredoka' }); }
function act2(t) { const i = 2, k = kAct(t, i), t0 = ACT[i][0];   // thin vs thick cloud: more arrows get through the thin one, fewer (not none) through the thick one
  stand('sun2', 260, 260, sunArt, 540, 680, k, { scale: .9 });
  stand('thin', 360, 200, cloudArt(.9), 290, 840, k); stand('thick', 360, 230, cloudArt(1.9), 790, 860, kAct(t, i, .2));
  const p = R(t, t0 + 1.0, .5) * k; [[200, 0], [270, .2], [340, .4]].forEach(([x, d]) => uvArrow(x + 20, 720, x - 10, 1110, R(t, t0 + 1.0 + d, .5) * k, t, { w: 11 })); uvArrow(800, 760, 790, 1110, R(t, t0 + 1.8, .5) * k, t, { w: 11 });
  tag('thin cloud', 290, 1170, p, { size: 40 }); tag('thick cloud', 750, 1170, R(t, t0 + 1.6, .3) * k, { size: 40, sub: 'blocks more, not all' });
  if (t > s(7) - .3) stand('thermo', 160, 300, thermoArt('cool'), 940, 600, back(R(t, s(7) + .2, .4)) * k, { scale: .8 });
  sign(g, 'clouds', t < s(7) ? 'Clouds ≠ shield' : "You can't feel UV", 540, 190, 340, 620, 140, Math.sin(t * 2) * .04, { font: '600 62px Fredoka' }); }
function act3(t) { const i = 3, k = kAct(t, i), t0 = ACT[i][0];   // the UV index dial (not the thermometer); 3+ = protect; strongest late morning to mid-afternoon
  stand('therm2', 180, 340, thermoArt('18°C'), 200, 1180, k, { scale: .9 });
  stand('dial', 560, 420, dialArt, 600, 1120, kAct(t, i, .2));
  if (k > .9) { const v = lerp(1, 7, ease(R(t, t0 + 1.0, 1.4))) + .3 * Math.sin(t * 3), a = Math.PI + v / 11 * Math.PI, cx = 600, cy = 1120 - 420 + 420 * .86 - 28; g.save(); g.strokeStyle = PAL.ink; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 190, cy + Math.sin(a) * 190); g.stroke(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.fill(); g.restore(); }
  if (t > s(9) - .2) tag('3+ = protect', 600, 560, R(t, s(9) + .3, .3) * k * (1 - R(t, s(10) - .3, .3)), { size: 56, col: '#ffe0b8' });
  if (t > s(10) - .2) { stand('clockL', 170, 170, clockArt('late AM'), 380, 640, back(R(t, s(10) + .1, .35)) * k, { scale: .9 }); stand('clockR', 170, 170, clockArt('mid PM'), 820, 640, back(R(t, s(10) + .5, .35)) * k, { scale: .9 }); tag('strongest', 600, 500, R(t, s(10) + .8, .3) * k, { size: 46 }); }
  sign(g, 'index', 'Check the UV index', 540, 190, 340, 660, 140, Math.sin(t * 2) * .04, { font: '600 60px Fredoka' }); }
function act4(t) { const i = 4, k = kAct(t, i), t0 = ACT[i][0];   // UV bounces: water, sand, snow flaps send arrows back up; snow up to 80%; above + below
  stand('water', 260, 200, surfArt('water'), 220, 1200, k); stand('sand', 260, 200, surfArt('sand'), 500, 1200, kAct(t, i, .15)); stand('snow', 260, 200, surfArt('snow'), 780, 1200, kAct(t, i, .3));
  [[220, 0], [500, .25], [780, .5]].forEach(([x, d]) => uvArrow(x - 90, 600, x - 10, 1000, R(t, t0 + 1.0 + d, .5) * k, t, { w: 11, bounce: [x + 70, 640, t0 + 1.6 + d] }));
  if (t > s(12) - .2) { tag('up to 80%', 760, 560, R(t, s(12) + .3, .3) * k, { size: 52, col: '#e3f2ff' }); for (let j = 0; j < 3; j++) uvArrow(780, 1010, 760 + j * 40 - 40, 680, R(t, s(12) + .6 + j * .15, .4) * k, t, { w: 9, a: .9 }); }
  if (t > s(13) - .3) { const kk = back(R(t, s(13), .4)) * k; stand('kid4', 220, 270, kidArt(.4, false), 500, 860, kk, { scale: .9 }); uvArrow(500, 420, 500, 600, R(t, s(13) + .3, .4) * k, t, { w: 10 }); uvArrow(420, 1040, 470, 880, R(t, s(13) + .6, .4) * k, t, { w: 10 }); }
  sign(g, 'bounce', 'UV bounces', 540, 190, 340, 520, 140, Math.sin(t * 2) * .04, { font: '600 64px Fredoka' }); }
function act5(t) { const i = 5, k = kAct(t, i), t0 = ACT[i][0];   // payoff: the cloud hides the sun, not the UV; then the source-backed basics: UV index, shade, clothing, sunscreen
  if (t < s(15) - .2) { stand('sun5', 280, 280, sunArt, 540, 760, k); stand('cloud5', 620, 320, cloudArt(1.5), 540, 860, kAct(t, i, .2)); rays(t, [[460, 620, 360, 1100, t0 + 1.0], [540, 620, 540, 1100, t0 + 1.2], [620, 620, 720, 1100, t0 + 1.4]], k);
    sign(g, 'pay', 'Clouds hide the sun,\nnot the UV', 540, 190, 340, 720, 200, Math.sin(t * 2) * .04, { font: '600 58px Fredoka' }); }
  else { const kq = R(t, s(15) - .1, .4); sign(g, 'tips', 'Grey day? Check UV', 540, 190, 340, 640, 140, Math.sin(t * 2) * .05, { font: '600 60px Fredoka' });
    stand('dial5', 320, 240, dialArt, 260, 960, back(R(t, s(15) + .3, .4)) * k, { scale: .9 }); stand('umb', 260, 300, umbrellaArt, 620, 960, back(R(t, s(15) + 1.4, .4)) * k); stand('shirt', 200, 200, shirtArt, 300, 1200, back(R(t, s(15) + 2.2, .4)) * k); stand('spf', 150, 220, bottleArt, 700, 1200, back(R(t, s(15) + 3.0, .4)) * k); } }
function act6(t) { const i = 6, k = kAct(t, i), t0 = ACT[i][0];   // the question
  stand('kid6', 320, 380, kidArt(.8, false), 540, 1060, k, { scale: 1 }); stand('cloud6', 420, 220, cloudArt(1.2), 300, 720, kAct(t, i, .2)); stand('sun6', 200, 200, sunArt, 800, 680, kAct(t, i, .3));
  sign(g, 'q', 'Ever burned\non a cloudy day?', 540, 190, 340, 640, 200, Math.sin(t * 2) * .05, { font: '600 60px Fredoka' });
  tag('YES', 240, 1150, R(t, t0 + 1.0, .3), { size: 60, col: '#ffd9c7' }); tag('NO', 820, 1150, R(t, t0 + 1.3, .3), { size: 60, col: '#d9f0f6' }); }
function act7(t) { const i = 7, k = kAct(t, i), t0 = ACT[i][0];   // end card
  sign(g, 'end', 'Follow for more of\nhow it really works.', 540, 190, 360, 820, 220, Math.sin(t * 2) * .03, { font: '600 64px Fredoka' });
  label(g, "A new 'wait, really?' every day.", 540, 720, { a: R(t, t0 + .5, .4), w: 760 }); label(g, '@howitreallyworkstudio', 540, 840, { a: R(t, t0 + .8, .4), w: 560, col: '#e9ddff' });
  stand('kid7', 260, 300, kidArt(0, true), 540, 1190, back(R(t, t0 + 1.0, .5)), { scale: .85 }); }
const ACTS = [act0, act1, act2, act3, act4, act5, act6, act7];

function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0); desk(g); book(g); const i = actAt(t);
  const z = 1 + .01 * Math.sin(t * .8); g.setTransform(z, 0, 0, z, W / 2 * (1 - z) + 6 * Math.sin(t * .5), H / 2 * (1 - z));   // the lamp-lit camera breathes a little
  board(g, BOARD[i], boardArt(BOARD[i]), kAct(t, i)); ACTS[i](t); g.setTransform(1, 0, 0, 1, 0, 0); caption(t); }
window.DUR = TOT;
// loop: the last 0.5 s blends at most 35% of frame 0 over the end card
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = g; g = F0.getContext('2d'); scene(0); g = keep; }
window.seek = t => { scene(t); const k = ease(R(t, TOT - .5, .5)) * .35; if (k > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); desk(g); book(g); board(g, 'grey', boardArt('grey'), 1);
  stand('sun0', 300, 300, sunArt, 700, 820, 1, { scale: 1.1 }); stand('cloudA', 560, 300, cloudArt(1.6), 420, 880, 1); stand('kid0', 300, 360, kidArt(.9, false), 360, 1280, 1, { scale: 1.1 }); uvArrow(640, 640, 420, 1060, 1, 0, { w: 16 });
  sign(g, 'thumb', 'Burned on a\ncloudy day?', 540, 190, 330, 680, 230, 0, { font: '700 80px Fredoka' }); };
window.seek(0); window.ready = true; window.READY = true;
