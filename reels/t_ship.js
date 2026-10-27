// t_ship.js: "How a giant steel ship floats" paper pop-up book reel (1080x1920, Canvas2D, deterministic).
// Style: lemo-opuscar paper-popup grammar (cut-paper cards with white border + cardboard edge, back-to-front pop-ups,
// page turns between acts, sliding wave strips, flipping slats, cardboard signs on strings, cream ink subtitles).
import * as P from './styles/popup/popup.js';
const { PAL, W, H, BOOK, card, pop, foldTab, desk, book, board, sign, label, ink, crescent, wobble, ramp, ease, back, lerp, clamp, hash } = P;

const TL = window.TL, PH = TL.p;
const s = i => PH[i].start, e = i => PH[i].end;
const cv = document.getElementById('c');
const g = P.ctx2d(cv);
const mkc = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const LA = mkc(), la = LA.getContext('2d');

// acts: 0 hook+clay (p0-3), 1 Archimedes (p4-10), 2 density (p11-15), 3 Plimsoll + end (p16-20)
const Sa = [0, s(4) - .05, s(11) - .05, s(16) - .05], TW = .85;
const TINT = [PAL.page, '#f1f1e2', '#f6ead9', '#f1f4e6'];
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
const spr = (t, t0, d = .5) => back(ramp(t, t0, d));
function stand(c, key, w, h, art, x, y, k, o = {}, co) { if (k <= .001) return null; const cd = card(key, w, h, art, co); pop(c, cd, x, y, k, o); return cd; }
function standTab(c, key, w, h, art, x, y, k, o = {}, tabW = 90, co) { foldTab(c, x, y, tabW, k); return stand(c, key, w, h, art, x, y, k, o, co); }
const rect = (w, h, m = 8) => [[m, m], [w - m, m], [w - m, h - m], [m, h - m]];

// ==================================================== ART ====================================================
function skyBoard(c, w, h, a = ['#bfe6f5', '#eaf8f7']) {
  const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a[0]); gr.addColorStop(1, a[1]);
  ink(c, rect(w, h, 6), { fill: gr, w: 7 });
  c.save(); c.beginPath(); c.rect(6, 6, w - 12, h - 12); c.clip();
  c.fillStyle = PAL.sun; c.beginPath(); c.arc(w * .8, h * .22, 74, 0, 7); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.stroke();
  const cloud = (x, y, sc) => { c.fillStyle = '#fff'; c.strokeStyle = PAL.ink; c.lineWidth = 5; c.beginPath(); [[0, 0, 44], [46, -14, 56], [100, 0, 44], [50, 16, 50]].forEach(([dx, dy, r]) => c.arc(x + dx * sc, y + dy * sc, r * sc, 0, 7)); c.fill(); c.stroke(); };
  cloud(w * .08, h * .2, .9); cloud(w * .42, h * .08, .65); cloud(w * .6, h * .32, .55);
  c.restore();
}
const labBoard = (c, w, h) => { ink(c, rect(w, h, 6), { fill: '#e3f1f2', w: 7 }); c.save(); c.beginPath(); c.rect(6, 6, w - 12, h - 12); c.clip(); c.fillStyle = 'rgba(255,255,255,.7)'; for (let x = 30; x < w; x += 46) for (let y = 30; y < h; y += 46) { c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill(); } c.restore(); };
const denBoard = (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fde1c4'); gr.addColorStop(1, '#fff0dc'); ink(c, rect(w, h, 6), { fill: gr, w: 7 }); c.save(); c.beginPath(); c.rect(6, 6, w - 12, h - 12); c.clip(); for (let i = 0; i < 22; i++) { c.fillStyle = `rgba(255,255,255,${.15 + hash(i) * .15})`; c.beginPath(); c.arc(hash(i + 1) * w, hash(i + 2) * h, 20 + hash(i + 3) * 40, 0, 7); c.fill(); } c.restore(); };
const portBoard = (c, w, h) => skyBoard(c, w, h, ['#c9e8dd', '#f4fbf1']);

const WAVE_COL = ['#9fd8ec', '#79c3e8', '#4fa8dc'];
function waveArt(i) { return (c, w, h) => {
  const top = 40; c.beginPath(); c.moveTo(0, h);
  for (let x = 0; x <= w; x += 14) c.lineTo(x, top + Math.sin(x * .028 + i * 1.7) * 16 + Math.sin(x * .071 + i) * 5);
  c.lineTo(w, h); c.closePath(); c.fillStyle = WAVE_COL[i]; c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.lineJoin = 'round'; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath();
  for (let x = 20; x <= w - 20; x += 14) { const y = top + 26 + Math.sin(x * .028 + i * 1.7) * 16; x === 20 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
}; }
function shipArt(c, w, h) {   // cargo ship, side view, flat paper
  const hl = [[22, 150], [w - 30, 150], [w - 96, h - 10], [92, h - 10]];
  ink(c, hl, { fill: '#c4453b', w: 6 });
  c.save(); pathOfClip(c, hl); c.fillStyle = '#232f4a'; c.fillRect(0, h - 58, w, 80); c.restore(); ink(c, hl, { w: 6 });
  [['#f2b33d', 60, 36], ['#4fa8dc', 160, 36], ['#6fbf73', 260, 36], ['#e8763a', 360, 36], ['#f2b33d', 110, 82], ['#6fbf73', 210, 82]].forEach(([col, x, y]) => ink(c, [[x, 150 - y - 42], [x + 92, 150 - y - 42], [x + 92, 150 - y + 4], [x, 150 - y + 4]].map(p => [p[0], p[1] + (y > 50 ? 0 : 0)]), { fill: col, w: 5 }));
  ink(c, [[w - 180, 56], [w - 60, 56], [w - 60, 150], [w - 180, 150]], { fill: '#fff7e6', w: 6 });
  [0, 1, 2].forEach(i => ink(c, [[w - 166 + i * 38, 76], [w - 142 + i * 38, 76], [w - 142 + i * 38, 100], [w - 166 + i * 38, 100]], { fill: '#8fd3ee', w: 4 }));
  ink(c, [[w - 140, 14], [w - 100, 14], [w - 100, 56], [w - 140, 56]], { fill: '#f2b33d', w: 5 });
  ink(c, [[w - 140, 14], [w - 100, 14], [w - 100, 28], [w - 140, 28]], { fill: '#c4453b', w: 4 });
}
function pathOfClip(c, pts) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); }
function lumpArt(c, w, h) { const p = wobble(w / 2, h / 2, w * .44, h * .42, 17, .07, 36); crescent(c, p, '#cf9565', '#b3784c', 14, -12); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(w / 2, h / 2, w * .3, 3.6, 4.4); c.stroke(); }
function clayBoatArt(c, w, h) {
  ink(c, [[8, 34], [w - 8, 34], [w - 46, h - 8], [46, h - 8]], { fill: '#cf9565', w: 6 });
  c.save(); pathOfClip(c, [[8, 34], [w - 8, 34], [w - 46, h - 8], [46, h - 8]]); c.fillStyle = '#b3784c'; c.fillRect(0, h * .62, w, h); c.restore();
  ink(c, [[8, 34], [w - 8, 34], [w - 46, h - 8], [46, h - 8]], { w: 6 });
  ink(c, [[w / 2 - 6, 34], [w / 2 - 6, 2], [w / 2 + 6, 2], [w / 2 + 6, 34]], { fill: '#8a5a3a', w: 4 });
}
function quesArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .42, h * .42, 5, .03, 36), { fill: '#ffd966', w: 6 }); c.fillStyle = PAL.ink; c.font = '700 80px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 4); }
function tankFrame(c, w, h) {   // hollow glass tank frame
  const m = 8, t = 22; c.beginPath(); c.rect(m, m, w - 2 * m, h - 2 * m); c.rect(m + t, m + t, w - 2 * m - 2 * t, h - 2 * m - 2 * t);
  c.fillStyle = '#e6f6f8'; c.fill('evenodd'); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.lineJoin = 'round'; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(m + 8, m + 40); c.lineTo(m + 8, h - 80); c.stroke();
}
function steelCubeArt(c, w, h) {
  const m = 14; ink(c, rect(w, h, m), { fill: '#a9b2bd', w: 6 }); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(m + 10, m + 10, w - 2 * m - 20, 12);
  c.fillStyle = PAL.ink; c.font = '700 46px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('steel', w / 2, h / 2 + 6);
}
function waterCubeArt(c, w, h) {
  const m = 14; ink(c, rect(w, h, m), { fill: '#9fd8ec', w: 6 }); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(m + 10, m + 10, w - 2 * m - 20, 12);
  c.fillStyle = PAL.ink; c.font = '700 46px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('water', w / 2, h / 2 + 6);
}
const HULL = { w: 640, h: 300 };
function hullCutArt(c, w, h) {   // cutaway: thin steel wall, mostly air inside
  const out = [[10, 40], [w - 10, 40], [w - 80, h - 10], [90, h - 10]], inn = [[34, 64], [w - 34, 64], [w - 100, h - 36], [110, h - 36]];
  ink(c, out, { fill: '#8e99a6', w: 6 }); ink(c, inn, { fill: '#fff7e6', w: 5 });
  c.fillStyle = 'rgba(180,190,200,.55)'; [[150, 130, 24], [300, 170, 34], [460, 125, 28], [380, 215, 18], [210, 215, 20]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
}
function plimsollArt(c, w, h) {   // the load line mark: ring with a line through it and the letters
  const cx = 150, cy = h / 2;
  ink(c, rect(w, h, 6), { fill: '#3f5a73', w: 6 });
  c.strokeStyle = '#fff7e6'; c.lineWidth = 12; c.beginPath(); c.arc(cx, cy, 70, 0, 7); c.stroke();
  c.fillStyle = '#fff7e6'; c.fillRect(cx - 100, cy - 6, 200, 12);
  c.strokeStyle = '#fff7e6'; c.lineWidth = 10; c.lineCap = 'butt';
  [['TF', -108], ['F', -72], ['T', -36], ['S', 0], ['W', 36]].forEach(([tx, dy], i) => { c.beginPath(); c.moveTo(cx + 120, cy + dy); c.lineTo(cx + 200, cy + dy); c.stroke(); c.fillStyle = '#fff7e6'; c.font = '700 34px Fredoka'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(tx, cx + 214, cy + dy); });
}
function slatArt(txt, col, sub) { return (c, w, h) => { ink(c, rect(w, h, 6), { fill: col, w: 6 }); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(16, 14, w - 32, 8); c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 52px Fredoka'; c.fillText(txt, w / 2, h / 2 - 12); c.font = '500 28px Fredoka'; c.fillText(sub, w / 2, h / 2 + 30); }; }
function crateArt(col) { return (c, w, h) => { ink(c, rect(w, h, 6), { fill: col, w: 5 }); c.strokeStyle = 'rgba(70,40,20,.4)'; c.lineWidth = 4; c.beginPath(); c.moveTo(10, 10); c.lineTo(w - 10, h - 10); c.moveTo(w - 10, 10); c.lineTo(10, h - 10); c.stroke(); }; }

// ==================================================== dynamic bits ====================================================
function tag(c, text, sub, x, y, w, h, col = PAL.cream, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(40,20,8,.3)'; c.filter = 'blur(7px)'; rr(c, x - w / 2 + 3, y - h / 2 + 10, w, h, 22); c.fill(); c.filter = 'none';
  c.fillStyle = col; c.strokeStyle = PAL.ink; c.lineWidth = 5; rr(c, x - w / 2, y - h / 2, w, h, 22); c.fill(); c.stroke();
  c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (sub) { c.font = '700 56px Fredoka'; c.fillText(text, x, y - 14); c.font = '500 30px Fredoka'; c.fillStyle = '#7a5a46'; c.fillText(sub, x, y + h / 2 - 28); } else { c.font = '700 50px Fredoka'; c.fillText(text, x, y + 2); }
  c.restore();
}
function arrowV(c, x, y0, y1, col, wd = 36, a = 1) {   // vertical block arrow from y0 to y1 (head at y1)
  if (a <= 0 || Math.abs(y1 - y0) < 8) return; const dir = Math.sign(y1 - y0), len = Math.abs(y1 - y0), hh = Math.min(46, len * .5);
  c.save(); c.globalAlpha = a; c.beginPath(); c.moveTo(x - wd / 2, y0); c.lineTo(x - wd / 2, y1 - dir * hh); c.lineTo(x - wd, y1 - dir * hh); c.lineTo(x, y1); c.lineTo(x + wd, y1 - dir * hh); c.lineTo(x + wd / 2, y1 - dir * hh); c.lineTo(x + wd / 2, y0); c.closePath();
  c.fillStyle = col; c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 5; c.lineJoin = 'round'; c.stroke(); c.restore();
}
function sub2(c, text, a) {
  if (!text || a <= 0) return; c.save(); c.globalAlpha = a; c.font = '600 44px Fredoka'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const toks = []; text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach(sg => { const b = sg.startsWith('**'); (b ? sg.slice(2, -2) : sg).split(/(\s+)/).filter(Boolean).forEach(w => toks.push([w, b])); });
  const maxW = 900, lines = [[]]; let lw = 0;
  toks.forEach(([w, b]) => { const sp = /^\s+$/.test(w), ww = c.measureText(w).width; if (!sp && lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (sp && !lines[lines.length - 1].length) return; lines[lines.length - 1].push([w, b, ww]); lw += ww; });
  const lwid = ln => { let q = ln.slice(); while (q.length && /^\s+$/.test(q[q.length - 1][0])) q.pop(); return q.reduce((m, t) => m + t[2], 0); };
  const mw = Math.max(...lines.map(lwid)), wCard = Math.min(980, mw + 90), hCard = 40 + lines.length * 62, x0 = (W - wCard) / 2, y0 = 1862 - hCard;
  c.fillStyle = 'rgba(40,20,8,.35)'; c.filter = 'blur(8px)'; rr(c, x0 + 4, y0 + 12, wCard, hCard, 28); c.fill(); c.filter = 'none';
  c.fillStyle = PAL.cream; c.strokeStyle = PAL.ink; c.lineWidth = 5; rr(c, x0, y0, wCard, hCard, 28); c.fill(); c.stroke();
  lines.forEach((ln, li) => { let x = (W - lwid(ln)) / 2; const y = y0 + 20 + 31 + li * 62; ln.forEach(([w, b, ww]) => { c.fillStyle = b ? PAL.coral : PAL.ink; c.fillText(w, x, y); x += ww; }); });
  c.restore();
}
// sliding wave strips in front of the floaters (clipped to the page); sea level y0 = top of the back strip
const PAGE = { x: 94, y: 176, w: 892, h: 1480 };
function waves(c, t, y0, k = 1, shift = 0) {
  if (k <= .001) return; c.save(); c.beginPath(); c.rect(PAGE.x, PAGE.y, PAGE.w, PAGE.h); c.clip();
  for (let i = 0; i < 3; i++) { const cd = card('wave' + i, 1160, 190, waveArt(i), { border: 0, pad: 8, edge: false, grainA: .06 }); const dx = Math.sin(t * (.8 + i * .25) + i * 2) * (16 + i * 8) + shift * (i - 1); pop(c, cd, 540 + dx, y0 + 150 + i * 62 + (1 - k) * 200, 1, { shadowA: 0 }); }
  c.restore();
}
const bob = (t, ph = 0, a = 7) => Math.sin(t * 2.1 + ph) * a;
const SEA = 1360;   // y of the back wave strip's top line


function cloudArt(c, w, h) { c.fillStyle = '#fff'; c.strokeStyle = PAL.ink; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath(); [[.2, .62, .2], [.38, .4, .26], [.62, .45, .24], [.8, .65, .18], [.5, .7, .24]].forEach(([x, y, r]) => { c.moveTo(w * x + h * r, h * y); c.arc(w * x, h * y, h * r, 0, 7); }); c.fill(); c.stroke(); }
function hillArt(col) { return (c, w, h) => { c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 12) c.lineTo(x, h * .45 - Math.sin(x / w * Math.PI * 1.5 + 1) * h * .38 + Math.sin(x * .05) * 4); c.lineTo(w, h); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.stroke(); }; }
function sailArt(c, w, h) { ink(c, [[10, h - 40], [w - 10, h - 40], [w - 50, h - 8], [50, h - 8]], { fill: '#c4453b', w: 5 }); ink(c, [[w / 2 - 4, 6], [w / 2 - 4, h - 40], [w / 2 - 70, h - 46]], { fill: '#fff7e6', w: 5 }); ink(c, [[w / 2 + 6, 20], [w / 2 + 6, h - 46], [w / 2 + 56, h - 46]], { fill: '#fff7e6', w: 5 }); }
function gull(c, x, y, t, sc = 1) { const f = Math.sin(t * 5 + x) * 12 * sc; c.save(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - 34 * sc, y - f); c.quadraticCurveTo(x - 16 * sc, y - 22 * sc + f, x, y); c.quadraticCurveTo(x + 16 * sc, y - 22 * sc + f, x + 34 * sc, y - f); c.stroke(); c.restore(); }
function scenery(c, t, t0, mode) {   // layered paper scenery in the upper board area: hills, far wave strip, sailboat, drifting clouds, gulls
  const k = spr(t, t0 + .25, .7); if (k <= .001) return;
  const dr = t * 14;
  stand(c, 'hillB', 1000, 260, hillArt('#b7dcc0'), 380, 880, k, { shadowA: .12 });
  stand(c, 'hillF', 900, 200, hillArt('#8cc79d'), 780, 880, spr(t, t0 + .4, .7), { shadowA: .12 });
  [[160 + dr % 1000 - 100, 360, 1.0], [700 - dr % 800 + 150, 470, .8], [520 + (dr * .6) % 900 - 200, 640, .65]].forEach(([x, y, sc], i) => { const cx = ((x % 1300) + 1300) % 1300 - 110; stand(c, 'cl' + i, 300, 150, cloudArt, cx, y, spr(t, t0 + .5 + i * .12, .6), { scale: sc, shadowA: .1 }); });
  const kw = spr(t, t0 + .6, .7), wy = 900;
  stand(c, 'farwave', 1060, 130, waveArt(0), 540 + Math.sin(t * .9) * 18, wy + 60, kw, { shadowA: 0 });
  stand(c, 'sail', 220, 190, sailArt, 800 + Math.sin(t * .5) * 40, wy + 28 + bob(t, 2, 5), spr(t, t0 + .9, .6), { scale: .75, shadowA: .12 });
  gull(c, 280 + Math.sin(t * .7) * 30, 560 + Math.sin(t * 1.1) * 12, t, 1.1 * k); gull(c, 360 + Math.sin(t * .7 + 1) * 30, 520 + Math.sin(t * 1.3) * 12, t + .4, .8 * k); gull(c, 860 + Math.sin(t * .6) * 24, 600, t + 1, .9 * k);
}

// ==================================================== ACTS ====================================================
// ---- act 1: the hook and the clay test ----
function act1(c, t) {
  const kb = spr(t, .05, .7); board(c, 'sea', (cc, w, h) => skyBoard(cc, w, h), kb); foldTab(c, 540, BOOK.fold, 820, kb); scenery(c, t, .05);
  const wk = ramp(t, .25, .8); waves(c, t, SEA - 20, ease(wk));
  // hook: the ship floats centre, then slides right as the clay test begins
  const shipX = lerp(540, 790, ease(ramp(t, s(1) - .2, .8))), shipS = lerp(1.0, .62, ease(ramp(t, s(1) - .2, .8)));
  const sk = spr(t, .4, .75);
  if (sk > 0) { const cdS = card('ship', 640, 260, shipArt); c.save(); c.globalAlpha = 1; pop(c, cdS, shipX, SEA + 76 + bob(t, 0, 6) * shipS, sk, { scale: shipS, sway: Math.sin(t * 1.4) * .006 }); c.restore(); }
  waves(c, t, SEA - 20, 0);   // (strips are drawn once, below, to sit in front of floaters)
  // title sign
  const kd = ramp(t, .9, .9), rise = ease(ramp(t, s(1) - .15, .5)), y1 = lerp(-260, 330, ease(kd)) - rise * 640;
  if (kd > 0 && rise < 1) sign(c, 'title', 'Why doesn\'t a\nsteel ship sink?', 540, y1 - 200, y1, 780, 230, Math.sin(ease(kd) * 3.5) * (1 - kd) * .12);
  // phrase 1: a clay lump drops, sinks behind the waves
  if (t > s(1) - .1) {
    const u = ramp(t, s(1) + 1.2, 1.6), y = lerp(SEA - 300, SEA + 320, u * u), vis = spr(t, s(1) + .3, .5);
    const cdL = card('lump', 190, 150, lumpArt); if (vis > 0) pop(c, cdL, 290, y, Math.min(1, vis), { scale: 1.0, sway: Math.sin(t * 5) * .03 * (1 - u) });
    tag(c, 'sinks', '', 280, 1040, 220, 84, '#ffe3e8', ramp(t, s(1) + 2.6, .3) * (1 - ramp(t, s(2) - .1, .25)));
  }
  // phrase 2: the clay boat floats (same clay)
  if (t > s(2) - .1) {
    const k = spr(t, s(2) + .1, .7), cdB = card('clayboat', 320, 120, clayBoatArt);
    pop(c, cdB, 290, SEA + 62 + bob(t, 1.3, 8), Math.min(1, k), { scale: 1.0, sway: Math.sin(t * 1.7) * .01 });
    tag(c, 'floats', '', 280, 1010, 240, 84, '#dff5df', ramp(t, s(2) + 1.1, .3));
  }
  waves(c, t, SEA - 20, ease(wk));
  // phrase 3: same clay, same weight, only shape changed
  if (t > s(3) - .1) {
    const q = ramp(t, s(3) + .1, .35); const cdL = card('lump', 190, 150, lumpArt);
    if (q > 0) { c.save(); c.globalAlpha = q; pop(c, cdL, 330, 1540, 1, { scale: .6 }); c.font = '700 70px Fredoka'; c.fillStyle = PAL.ink; c.textAlign = 'center'; c.fillText('=', 540, 1500); const cdB = card('clayboat', 320, 120, clayBoatArt); pop(c, cdB, 730, 1540, 1, { scale: .6 }); c.restore(); }
    tag(c, 'same clay, same weight', '', 540, 1380, 760, 92, '#fff7e6', ramp(t, s(3) + .6, .3));
  }
}

// ---- act 2: Archimedes: displacement and the push up ----
const TK = { bx: 540, by: 1590, w: 700, h: 500, x0: 214, x1: 866, y0: 1119, base: 1330 };
function tankScene(c, t, st) {   // st: {obj:'lump'|'boat'|'ship', sink:0..1, arrows:0..1, dash:0..1, mode}
  const kt = spr(t, Sa[1] + .15, .7); if (kt <= .001) return;
  const lvl = TK.base - 46 * st.sink * st.vol;
  const objs = { lump: { cd: card('lump', 190, 150, lumpArt), sc: 1.0, wd: 190, dep: 130, drop: 0 }, boat: { cd: card('clayboat', 320, 120, clayBoatArt), sc: 1.55, wd: 320 * 1.55 * .92, dep: 80, drop: 0 } };
  const o = objs[st.obj], by0 = TK.base - 90, by = lerp(by0, lvl + o.dep * (st.obj === 'lump' ? 1.55 : 1.0) - (st.obj === 'boat' ? 14 : 0) + (st.obj === 'lump' ? 100 : 0), ease(st.sink));
  c.save(); c.globalAlpha = Math.min(1, kt);
  // water behind the object
  c.save(); c.beginPath(); c.rect(TK.x0, TK.y0, TK.x1 - TK.x0, TK.by - 28 - TK.y0); c.clip();
  c.fillStyle = '#9fd8ec'; c.fillRect(TK.x0, lvl, TK.x1 - TK.x0, 600);
  c.strokeStyle = PAL.ink; c.lineWidth = 6; c.beginPath(); for (let x = TK.x0; x <= TK.x1; x += 12) { const y = lvl + Math.sin(x * .04 + t * 2) * 4; x === TK.x0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
  // original water level line
  c.setLineDash([14, 12]); c.strokeStyle = 'rgba(40,60,90,.7)'; c.lineWidth = 4; c.beginPath(); c.moveTo(TK.x0, TK.base); c.lineTo(TK.x1, TK.base); c.stroke(); c.setLineDash([]);
  // the displaced water: a dashed shape under the surface
  if (st.dash > 0) { const wd = o.wd * (st.obj === 'lump' ? .9 : 1), top = lvl, bot = by - 4; c.save(); c.globalAlpha = st.dash * .8; c.fillStyle = 'rgba(255,122,89,.35)'; c.strokeStyle = PAL.coral; c.lineWidth = 6; c.setLineDash([14, 10]);
    const poly = st.obj === 'lump' ? [[540 - wd / 2, top], [540 + wd / 2, top], [540 + wd / 2 - 10, bot], [540 - wd / 2 + 10, bot]] : [[540 - wd / 2, top], [540 + wd / 2, top], [540 + wd / 2 - 50, bot], [540 - wd / 2 + 50, bot]];
    c.beginPath(); poly.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.stroke(); c.setLineDash([]); c.restore(); }
  c.restore();
  pop(c, o.cd, 540, by, 1, { scale: o.sc, shadowA: .15, sway: Math.sin(t * 2) * .008 });
  c.save(); c.beginPath(); c.rect(TK.x0, lvl, TK.x1 - TK.x0, 400); c.clip(); c.fillStyle = 'rgba(159,216,236,.45)'; c.fillRect(TK.x0, lvl, TK.x1 - TK.x0, 400); c.restore();   // water over the object's lower part
  // splash droplets while the object enters
  if (st.splash > 0) for (let i = 0; i < 9; i++) { const u = clamp((st.splash * 1.0 - i * .05)), a = Math.sin(u * Math.PI); if (a > 0) { c.fillStyle = '#9fd8ec'; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.arc(540 + (hash(i) - .5) * 380, lvl - u * (80 + hash(i + 3) * 90) + u * u * 90, 9 * a + 2, 0, 7); c.fill(); c.stroke(); } }
  pop(c, card('tank', TK.w, TK.h, tankFrame), TK.bx, TK.by, Math.min(1, kt), { shadowA: .3 });
  // arrows: push up (green) from the object's bottom, weight (brown) from its middle
  if (st.arrows > 0) { const ar = st.arrows; arrowV(c, 650 + 0, by + 6, by + 6 - st.up * ar, '#6fbf73', 34, ar); arrowV(c, 430, by - 40, by - 40 + st.down * ar, '#c98a5a', 34, ar);
    c.save(); c.globalAlpha = ar; c.font = '700 34px Fredoka'; c.fillStyle = PAL.ink; c.textAlign = 'center'; c.fillText('push up', 650, by + 6 - st.up * ar - 18); c.fillText('weight', 430, by - 40 + st.down * ar + 40); c.restore(); }
  c.restore();
}
function act2(c, t) {
  const o = Sa[1];
  const kb = spr(t, o + .1, .7); board(c, 'lab', labBoard, kb); foldTab(c, 540, BOOK.fold, 820, kb); scenery(c, t, o + .1);
  const ks = ramp(t, s(4) - .1, .8); const rise = ease(ramp(t, s(5) - .2, .45));
  if (ks > 0 && rise < 1) sign(c, 'arch', 'Archimedes\'\nprinciple', 540, lerp(-260, 330, ease(ks)) - 200 - rise * 640, lerp(-260, 330, ease(ks)) - rise * 640, 700, 230, Math.sin(ease(ks) * 3.5) * (1 - ks) * .1);
  // timeline of the tank states
  let st;
  const p5 = ramp(t, s(5) + .1, 1.6);
  if (t < s(8) - .1) st = { obj: 'boat', sink: ease(p5), vol: 1, dash: ramp(t, s(6) + .2, .6), arrows: ramp(t, s(7) + .4, .5), up: 150, down: 150, splash: ramp(t, s(5) + .5, 1.2) };
  else if (t < s(9) - .1) { const u = ease(ramp(t, s(8) - .0, 1.0)); st = { obj: 'lump', sink: u, vol: .35, dash: ramp(t, s(8) + .8, .4), arrows: ramp(t, s(8) + 1.2, .4), up: 46, down: 150, splash: ramp(t, s(8) + .2, 1.0) }; }
  else st = { obj: 'boat', sink: 1, vol: 1, dash: ramp(t, s(9) + .3, .4), arrows: ramp(t, s(9) + .8, .4), up: 150, down: 150, splash: 0 };
  tankScene(c, t, st);
  // callouts
  const mid = x => 1 - ramp(t, x, .25);
  tag(c, 'water pushed aside', '', 540, 1040, 640, 90, '#fff7e6', ramp(t, s(5) + 1.2, .3) * (1 - ramp(t, s(6) - .1, .25)));
  tag(c, 'displaced water', '', 540, 1040, 600, 90, '#ffe9de', ramp(t, s(6) + .5, .3) * (1 - ramp(t, s(7) + .8, .25)));
  tag(c, 'push up = weight of it', '', 540, 1000, 760, 90, '#dff5df', ramp(t, s(7) + 2.2, .3) * (1 - ramp(t, s(8) - .1, .25)));
  tag(c, 'small push up', '', 540, 1040, 560, 90, '#ffe3e8', ramp(t, s(8) + 1.8, .3) * (1 - ramp(t, s(9) - .1, .25)));
  tag(c, 'big push up', '', 540, 1040, 520, 90, '#dff5df', ramp(t, s(9) + 1.2, .3) * (1 - ramp(t, s(10) - .1, .25)));
  if (t > s(10) - .1) { const q = ramp(t, s(10) + .2, .35); tag(c, 'push up  =  its weight', 'so it floats', 540, 1010, 780, 150, '#dff5df', q); const kk = spr(t, s(10) + 1.0, .6); if (kk > 0) stand(c, 'ok', 130, 130, (cc, w, h) => { ink(cc, wobble(w / 2, h / 2, w * .42, h * .42, 9, .03, 36), { fill: '#6fbf73', w: 6 }); cc.strokeStyle = '#fff'; cc.lineWidth = 12; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.beginPath(); cc.moveTo(w * .28, h * .52); cc.lineTo(w * .45, h * .68); cc.lineTo(w * .74, h * .34); cc.stroke(); }, 760, 790, kk, { scale: 1 }); }
}

// ---- act 3: average density, air in the hull, a hole, cargo ----
function act3(c, t) {
  const o = Sa[2];
  const kb = spr(t, o + .12, .7); board(c, 'den', denBoard, kb); foldTab(c, 540, BOOK.fold, 820, kb); scenery(c, t, o + .12);
  const ks = ramp(t, s(11) - .1, .8), rise = ease(ramp(t, s(12) - .1, .45));
  if (ks > 0 && rise < 1) sign(c, 'den', 'Average\ndensity', 540, lerp(-260, 330, ease(ks)) - 200 - rise * 640, lerp(-260, 330, ease(ks)) - rise * 640, 640, 230, Math.sin(ease(ks) * 3.5) * (1 - ks) * .1);
  // phrase 12: steel vs water, same size, 8 to 1
  if (t > s(12) - .1 && t < s(13) + .3) {
    const fo = 1 - ramp(t, s(13) + .0, .3);
    const k1 = spr(t, s(12) + .1, .6) * fo, k2 = spr(t, s(12) + .3, .6) * fo; const kk = Math.max(0, Math.min(1, k1));
    stand(c, 'steelcube', 250, 250, steelCubeArt, 330, 1330, kk, { scale: 1.0 }); stand(c, 'watercube', 250, 250, waterCubeArt, 750, 1330, Math.max(0, Math.min(1, k2)), { scale: 1.0 });
    const bq = ramp(t, s(12) + 1.0, .6) * fo; if (bq > 0) { c.save(); c.globalAlpha = fo; const bw = 150; c.fillStyle = '#a9b2bd'; c.strokeStyle = PAL.ink; c.lineWidth = 5; const hS = 280 * ease(bq); rr(c, 330 - bw / 2, 1480 - hS, bw, hS, 10); c.fill(); c.stroke(); c.fillStyle = '#9fd8ec'; const hW = 35 * ease(bq); rr(c, 750 - bw / 2, 1480 - hW, bw, hW, 8); c.fill(); c.stroke(); c.restore(); }
    tag(c, '8', 'x heavier', 330, 1015, 250, 150, '#fff7e6', ramp(t, s(12) + 1.4, .3) * fo); tag(c, '1', 'same size', 750, 1015, 250, 150, '#fff7e6', ramp(t, s(12) + 1.5, .3) * fo);
  }
  // phrase 13+: the hull cutaway, full of air
  const hx = 540, hy = 1320; let sinkHole = ramp(t, s(14) + 1.4, 2.0), cargoN = 0;
  const hk = spr(t, s(13) + .1, .75); const cdH = card('hullcut', HULL.w, HULL.h, hullCutArt);
  if (hk > 0) {
    let dy = lerp(0, 110, ease(sinkHole));
    if (t > s(15)) dy = lerp(110, 0, ease(ramp(t, s(15) - .3, .8)));   // the repaired ship: ok again, then loaded
    const cargoK = ramp(t, s(15) + .5, 1.5); dy = t > s(15) - .3 ? lerp(0, 120, ease(cargoK)) : dy;
    c.save();
    pop(c, cdH, hx, hy + 150 + dy + bob(t, 0, 4), Math.min(1, hk), { scale: 1.0, shadowA: .2 });
    // water filling the hull through the hole (clip to the inner hull polygon)
    const wl = t > s(14) - .1 && t < s(15) - .3 ? ramp(t, s(14) + 1.2, 2.4) : 0;
    if (wl > 0) { c.save(); const bx0 = hx - HULL.w / 2, by0 = hy + 150 + dy - HULL.h - 5 + 0; c.beginPath(); [[34, 64], [HULL.w - 34, 64], [HULL.w - 100, HULL.h - 36], [110, HULL.h - 36]].forEach(([x, y], i) => i ? c.lineTo(bx0 + x, by0 + y) : c.moveTo(bx0 + x, by0 + y)); c.closePath(); c.clip(); c.fillStyle = '#7ec8e8'; c.fillRect(bx0, by0 + lerp(HULL.h - 36, 100, ease(wl)), HULL.w, HULL.h); c.restore(); }
    // the hole
    const hq = ramp(t, s(14) + .35, .35) * (1 - ramp(t, s(15) - .6, .3)); if (hq > 0) { c.save(); c.globalAlpha = hq; c.fillStyle = PAL.ink; c.beginPath(); c.arc(hx - 60, hy + 150 + dy - 50, 20, 0, 7); c.fill(); c.strokeStyle = PAL.coral; c.lineWidth = 6; c.stroke(); c.restore(); }
    // cargo crates dropped on deck
    [['#f2b33d', -150], ['#6fbf73', -40], ['#e8763a', 70], ['#4fa8dc', 175]].forEach(([col, dx], i) => { const q = ramp(t, s(15) + .5 + i * .22, .35), yy = lerp(hy - 200, hy + 150 + dy - HULL.h - 14, q * q); if (q > 0) stand(c, 'crate' + i, 90, 90, crateArt(col), hx + dx, yy + 68 + (i % 2) * 0, 1, { scale: 1.0, shadowA: .2 }); });
    c.restore();
  }
  // waterline: a dashed line across the page at hull level; waves in front
  const wy = 1380; waves(c, t, wy - 12, ramp(t, s(13) - .1, .4) * (t > s(12) - .1 ? 1 : 0));
  if (t > s(13) + .3) {
    tag(c, 'steel + air', 'lighter than water, on average', 540, 1015, 820, 160, '#fff7e6', ramp(t, s(13) + 1.0, .3) * (1 - ramp(t, s(14) - .15, .25)));
    tag(c, 'water in, air out', 'density goes up', 540, 1015, 700, 160, '#ffe3e8', ramp(t, s(14) + 1.0, .3) * (1 - ramp(t, s(15) - .5, .25)));
    tag(c, 'more cargo', 'sits lower', 540, 1015, 560, 160, '#fff1c8', ramp(t, s(15) + .2, .3));
  }
}

// ---- act 4: the Plimsoll line, the slats, the recap, the end card ----
function act4(c, t) {
  const o = Sa[3];
  const kb = spr(t, o + .12, .7); board(c, 'port', portBoard, kb); foldTab(c, 540, BOOK.fold, 820, kb); scenery(c, t, o + .12);
  const sk = spr(t, o + .3, .8);
  const ship = (dy) => { const cdS = card('ship', 640, 260, shipArt); pop(c, cdS, 540, SEA + 76 + dy, Math.min(1, sk), { scale: 1.05, sway: Math.sin(t * 1.4) * .006 }); };
  ship(bob(t, 0, 6));
  // the Plimsoll mark card on the hull, popping out
  const mk = spr(t, s(16) + .6, .55); if (mk > 0) stand(c, 'plim', 440, 170, plimsollArt, 700, SEA + 120, mk, { scale: 1.0, shadowA: .3 });
  waves(c, t, SEA - 20, ramp(t, o + .2, .5));
  const lq = ramp(t, s(16) + 1.4, .3) * (1 - ramp(t, s(17) - .1, .25)); tag(c, 'Plimsoll line', '', 540, 1015, 560, 90, '#fff7e6', lq);
  // phrase 17: deepest safe load: a dashed waterline hugging the mark, ship lowers to it
  const u17 = ramp(t, s(17) + .2, .8); if (u17 > 0 && t < s(19) - .1) { c.save(); c.globalAlpha = u17 * (1 - ramp(t, s(19) - .35, .3)); c.setLineDash([16, 12]); c.strokeStyle = PAL.coral; c.lineWidth = 7; c.beginPath(); c.moveTo(150, SEA + 120); c.lineTo(930, SEA + 120); c.stroke(); c.setLineDash([]); c.restore(); }
  tag(c, 'deepest safe load', '', 540, 1015, 640, 90, '#ffe9de', ramp(t, s(17) + .5, .3) * (1 - ramp(t, s(18) - .1, .25)));
  // phrase 18: pull-tab slats: five marks flip in like a billboard
  if (t > s(18) - .1 && t < s(19) + .1) {
    const names = [['TF', 'tropical fresh', '#bfe6c4'], ['F', 'fresh water', '#bfe6f5'], ['T', 'tropics', '#ffd9a8'], ['S', 'summer', '#fff1c8'], ['W', 'winter', '#d6d9f5']];
    names.forEach(([nm, sb, col], i) => { const q = ramp(t, s(18) + .2 + i * .28, .45), th = q * Math.PI, cth = Math.cos(th), fl = q > .5; const cd = card('slat' + nm, 300, 130, slatArt(nm, col, sb));
      c.save(); c.translate(0, 900 + i * 0 + 0); const x = 160 + (i % 3) * 390 * 0.0 + 0; c.restore();
      const gx = [210, 540, 870, 375, 705][i], gy = [1010, 1010, 1010, 1180, 1180][i]; if (q > 0) { c.save(); c.translate(gx, gy); c.scale(1, Math.max(.04, Math.abs(Math.cos(Math.PI * (q > .5 ? 1 - q : q) * 1))) ); c.globalAlpha = 1; c.drawImage(cd.c, -cd.w / 2, -cd.h / 2); c.restore(); } });
  }
  // phrase 19: equal arrows on the ship, the recap
  if (t > s(19) - .1 && t < s(20) - .3) { const q = ramp(t, s(19) + .2, .5); arrowV(c, 360, SEA + 190, SEA + 190 - 130 * q, '#6fbf73', 34, q); arrowV(c, 720, SEA - 10, SEA - 10 + 130 * q, '#c98a5a', 34, q); tag(c, 'push up = weight', '', 540, 1015, 640, 90, '#dff5df', ramp(t, s(19) + 1.2, .3) * (1 - ramp(t, s(20) - .3, .2))); }
  // end card: the follow sign drops on strings
  const kf = ramp(t, s(20) - .05, .9), yf = lerp(-260, 330, ease(kf));
  if (kf > 0) { sign(c, 'follow', 'Follow for more of\nhow it really works.', 540, yf - 200, yf, 880, 230, Math.sin(ease(kf) * 3.5) * (1 - kf) * .12, { font: '600 62px Fredoka' }); label(c, '@howitreallyworkstudio', 540, yf + 290, { a: ramp(t, s(20) + .6, .3) }); }
}

const ACTS = [act1, act2, act3, act4];

// ==================================================== camera ====================================================
const KEYS = [
  [0, 1.0, 540, 960], [s(1) + 1.0, 1.06, 540, 1180], [s(3) + .2, 1.0, 540, 1100], [Sa[1], 1.0, 540, 960],
  [s(5) + .3, 1.08, 540, 1250], [s(7) + 1.0, 1.1, 540, 1260], [s(10) + .4, 1.0, 540, 1100], [Sa[2], 1.0, 540, 960],
  [s(12) + .2, 1.06, 540, 1200], [s(14) + .6, 1.1, 540, 1280], [s(15) + 1.0, 1.0, 540, 1150], [Sa[3], 1.0, 540, 960],
  [s(17) + .3, 1.08, 540, 1260], [s(19) - .2, 1.0, 540, 1050], [s(20) + .2, 1.0, 540, 960], [TL.total, .96, 540, 950],
];
function camAt(t) {
  if (t <= KEYS[0][0]) return { s: KEYS[0][1], cx: KEYS[0][2], cy: KEYS[0][3] };
  for (let i = 1; i < KEYS.length; i++) if (t <= KEYS[i][0]) { const a = KEYS[i - 1], b = KEYS[i], u = ease(ramp(t, a[0], Math.max(.01, b[0] - a[0]))); return { s: lerp(a[1], b[1], u), cx: lerp(a[2], b[2], u), cy: lerp(a[3], b[3], u) }; }
  const l = KEYS[KEYS.length - 1]; return { s: l[1], cx: l[2], cy: l[3] };
}

// ==================================================== frame ====================================================
function drawWorld(t) {
  let a = 0; for (let i = 1; i < 4; i++) if (t >= Sa[i] - TW) a = i;
  const turning = a >= 1 && t < Sa[a];
  book(g, { pageTint: TINT[a] });
  ACTS[a](g, t);
  if (turning) {
    la.setTransform(1, 0, 0, 1, 0, 0); la.clearRect(0, 0, W, H);
    la.fillStyle = TINT[a - 1]; rr(la, 94, 176, 892, 1480, 10); la.fill();
    ACTS[a - 1](la, t);
    const p = ramp(t, Sa[a] - TW, TW), e2 = ease(p), sy = Math.max(.001, 1 - e2), top = 176;
    const edge = top + 1480 * sy; g.save(); g.filter = 'blur(14px)'; g.fillStyle = `rgba(30,12,2,${.32 * (1 - p * .6)})`; g.fillRect(100, edge - 4, 880, 46); g.filter = 'none'; g.restore();
    g.save(); g.translate(0, top); g.scale(1, sy); g.translate(0, -top); g.drawImage(LA, 0, 0); g.restore();
    g.save(); g.globalAlpha = .28 * e2; g.fillStyle = '#2a1608'; g.fillRect(94, top, 892, Math.max(0, 1480 * sy)); g.restore();
  }
}
window.DUR = TL.total;
window.seek = t => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  desk(g);
  const cm = camAt(t);
  g.save(); g.translate(540, 960); g.scale(cm.s, cm.s); g.translate(-cm.cx, -cm.cy);
  drawWorld(t);
  g.restore();
  let ci = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start) ci = i;
  if (ci >= 0) sub2(g, PH[ci].cap, ramp(t, PH[ci].start, .25));
};

// ==================================================== sound cues ====================================================
const CUES = [], cu = (...a) => CUES.push(a);
cu('pop', .05); [.25, .4].forEach(x => cu('snap', x)); cu('whoosh', .9); cu('thud', 1.75);
cu('slide', s(1) - .2); cu('snap', s(1) + .3); cu('thud', s(1) + 2.4); cu('chime', s(1) + 2.7, 76);
cu('snap', s(2) + .1); cu('chime', s(2) + 1.1, 88); cu('sparkle', s(2) + 1.2);
cu('tick', s(3) + .15); cu('tick', s(3) + .6); cu('note', s(3) + .65, 79);
cu('pageturn', Sa[1] - TW + .1); cu('snap', Sa[1] + .15); cu('whoosh', s(4) + .0); cu('snap', s(4) + .8); cu('chime', s(4) + 1.2, 84);
cu('snap', s(5) + .1); for (let i = 0; i < 6; i++) cu('tick', s(5) + .5 + i * .12); cu('thud', s(5) + 1.5);
cu('chime', s(6) + .5, 86); cu('snap', s(6) + .2);
cu('snap', s(7) + .4); cu('chime', s(7) + 2.2, 88);
cu('thud', s(8) + .9); cu('tick', s(8) + 1.2); cu('tick', s(8) + 1.8); cu('snap', s(9) + .3); cu('chime', s(9) + 1.2, 86);
cu('snap', s(10) + .2); cu('sparkle', s(10) + 1.0); cu('chime', s(10) + .9, 91);
cu('pageturn', Sa[2] - TW + .1); cu('snap', Sa[2] + .15); cu('whoosh', s(11) + .0); cu('snap', s(12) + .1); cu('snap', s(12) + .3); cu('chime', s(12) + 1.4, 84);
cu('snap', s(13) + .1); cu('chime', s(13) + 1.0, 86);
cu('snap', s(14) + .4); cu('bubbles', s(14) + 1.4); cu('thud', s(14) + 3.0);
for (let i = 0; i < 4; i++) cu('thud', s(15) + .5 + i * .22 + .3); cu('chime', s(15) + .2, 80);
cu('pageturn', Sa[3] - TW + .1); cu('snap', Sa[3] + .2); cu('snap', s(16) + .6); cu('chime', s(16) + 1.4, 84);
cu('slide', s(17) + .2); cu('chime', s(17) + .5, 88);
for (let i = 0; i < 5; i++) cu('snap', s(18) + .2 + i * .28 + .2);
cu('chime', s(19) + 1.2, 88); cu('sparkle', s(19) + .6);
cu('snap', s(20) - .05); cu('whoosh', s(20) - .3); cu('chime', s(20) + .5, 88); cu('chime', s(20) + .9, 91);
window.CUES = CUES;

await document.fonts.load('600 60px Fredoka'); await document.fonts.load('700 60px Fredoka'); await document.fonts.load('500 30px Fredoka');
window.seek(0); window.ready = true; window.READY = true;
