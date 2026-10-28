// t_bananabrown.js: "Why do bananas turn brown?" in template #13 collage "AI Doom" (demo 78) with a fresh palette (leaf green, teal, butter, terracotta)
// and a fresh cast (banana characters, the PPO enzyme, the oxygen twins, a fridge) so it does not read like eyeblink/sneeze. Demo moves: little paper
// sets, museum frames and plaques, chalkboards, ransom-note letters, watercolour mottle, hard cuts with a short whip blur, karaoke caption.
// Batch N layout: captions at y 1160-1420, text below y 345 (badge strip), nothing written in the right column below y 840 or the bottom 480 px.
import { createAD, W, H, TAU, C, clamp, lerp, ramp, ss, eo, bo, hash, FONTS } from './styles/aidoom/aidoom.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const AD = createAD(document.getElementById('c')), g = AD.g, lg = AD.lg, R = ramp;
const mot = document.createElement('canvas'); mot.width = W; mot.height = H; { const m = mot.getContext('2d'); m.fillStyle = '#fff'; m.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) { const x = hash(i * 4.1) * W, y = hash(i * 5.3) * H, r = 60 + hash(i * 6.7) * 220, rg = m.createRadialGradient(x, y, 0, x, y, r); const d = 200 + hash(i * 8.9) * 40;
    rg.addColorStop(0, `rgba(${d},${d - 18},${d - 40},.22)`); rg.addColorStop(1, 'rgba(255,255,255,0)'); m.fillStyle = rg; m.fillRect(x - r, y - r, 2 * r, 2 * r); } }
const wash = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.drawImage(mot, 0, 0); g.restore(); };
const ransomLine = (w, y, sz, seed, k = 1, x0 = 540) => { const step = sz * .74, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, x0 - tw / 2 + step / 2 + i * step, y, sz, seed + i * 7, typeof k === 'function' ? k(i) : k); }); };
const FY = 1120;
const set0 = AD.set; AD.set = (wall, floor, o = {}) => { set0(wall, floor, o); const fy = o.fy || 1380, c = lg; c.save(); c.strokeStyle = 'rgba(40,25,15,.35)'; c.lineWidth = 3;
  for (let k = 1; k < 12; k++) { const y = fy + k * k * 8 + k * 14; if (y > H) break; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(540 + k * 60, fy); c.lineTo(540 + k * 260, H); c.stroke(); } c.restore(); };   // floor line: characters stand here, the caption band sits below it
function frame(x, y, w, h, t, inner, o = {}) { AD.shape(AD.box(x - 22, y - 22, w + 44, h + 44, 3), '#d9a632', { seed: 240 + x, t, lw: 5 }); AD.shape(AD.box(x, y, w, h, 3), o.bg || '#e9e2cf', { seed: 241 + x, t, lw: 3 }); if (inner) { lg.save(); lg.beginPath(); lg.rect(x, y, w, h); lg.clip(); inner(); lg.restore(); } }
function rope(y, x0, x1, t) { for (const x of [x0, x1]) { AD.shape(AD.box(x - 8, y, 16, 170, 2), C.yellow, { seed: x }); AD.shape(AD.poly(x, y - 4, 20, 20, 12), C.yellow, { seed: x + 1 }); } const m = (x0 + x1) / 2; AD.line([[x0, y + 30], [m, y + 90], [x1, y + 30]], { lc: C.red, lw: 9, t }); }
function bubble(x, y, w, h, t, k = 1) { if (k <= 0) return; AD.shape(AD.poly(x, y, w * k, h * k, 30), '#fbf6ea', { seed: 250, t, lw: 4 }); [[.55, 1.05, 22], [.7, 1.25, 14]].forEach(([a, b, r], i) => AD.shape(AD.poly(x - w * a, y + h * b, r * k, r * k, 12), '#fbf6ea', { seed: 251 + i, lw: 3 })); }
function cork(t) { const c = lg; c.fillStyle = '#b98c5a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${hash(i) > .5 ? '90,55,25' : '230,190,140'},${.15 + hash(i * 3) * .25})`; c.fillRect(hash(i * 5) * W, hash(i * 7) * H, 3 + hash(i * 9) * 5, 2 + hash(i * 11) * 4); }
  AD.shape(AD.box(30, 30, W - 60, H - 60, 4), null, { lw: 22, lc: '#7a5232', wob: 1 }); }
function brain(cx, cy, sc, t, hot) { const c = lg; c.save(); c.translate(cx, cy); c.scale(sc, sc); AD.use(c);
  AD.shape(AD.poly(0, 0, 300, 220, 36), 'rgba(255,255,255,.08)', { seed: 340, t, lc: '#eaf2ff', lw: 5 });
  [[-150, -60, 90], [-20, -120, 110], [120, -40, 100], [-80, 80, 90], [90, 100, 80]].forEach(([a, b, r], i) => AD.line(AD.poly(a, b, r * .6, r * .35, 14, i).slice(0, 10), { lc: 'rgba(234,242,255,.6)', lw: 3, t }));
  AD.shape([[60, 200], [120, 200], [110, 300], [70, 300]], 'rgba(255,255,255,.08)', { seed: 341, t, lc: '#eaf2ff', lw: 4 });
  if (hot > 0) { c.globalAlpha = hot; AD.shape(AD.poly(140, 130, 70, 40, 18), '#ffcf4a', { seed: 342, t, lc: '#fff', lw: 3 }); AD.shape(AD.poly(220, 60, 50, 32, 16), '#ff8a4a', { seed: 343, t, lc: '#fff', lw: 3 }); c.globalAlpha = 1; }
  c.restore(); AD.use(lg); }
function tv(x, y, w, h, t, fn) { AD.shape(AD.rbox(x - 20, y - 20, w + 40, h + 40, 26), '#8a5a35', { seed: 430, t, lw: 5 }); AD.shape(AD.rbox(x, y, w, h, 18), '#2b3a3a', { seed: 431, t, lw: 4 });
  lg.save(); lg.beginPath(); lg.rect(x + 6, y + 6, w - 12, h - 12); lg.clip(); fn(); lg.restore();
  lg.save(); lg.globalAlpha = .12; lg.fillStyle = '#fff'; for (let yy = y; yy < y + h; yy += 8) lg.fillRect(x, yy, w, 2); lg.restore();
  AD.line([[x + w * .3, y + h + 20], [x + w * .2, y + h + 120]], { lw: 8 }); AD.line([[x + w * .7, y + h + 20], [x + w * .8, y + h + 120]], { lw: 8 }); }
// karaoke caption in the Batch N band (y about 1160-1420)
function caption(ph, t, out) { if (!ph) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  let size = 54; c.font = AD.font('roundX', size, 800); const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  const tot = ws.reduce((a, w) => a + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = c.measureText(w.w).width; });
  const lines = [[]]; let lw = 0; const sp = c.measureText(' ').width; ws.forEach(w => { if (lw + w.ww > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  if (lines.length > 3) { size = 42; c.font = AD.font('roundX', size, 800); return caption2(ws, ph, t, out, size); }
  const a = clamp((t - ph.start + .2) / .2) * (out != null ? clamp((out - t) / .2) : 1), lh = size * 1.2, y0 = 1300 - (lines.length - 1) * lh / 2 + size * .35;
  const bh = lines.length * lh + 50; c.globalAlpha = a * .62; c.fillStyle = '#1b1410'; c.beginPath(); c.roundRect(60, y0 - size * .95 - 6, W - 120, bh, 26); c.fill();
  lines.forEach((ln, li) => { const w = ln.reduce((s2, x) => s2 + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { c.globalAlpha = a; c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = '#1b1410'; c.strokeText(wd.w, x, y0 + li * lh);
    c.fillStyle = t >= wd.t0 ? (wd.hl ? '#ffd24d' : '#fff7e6') : 'rgba(255,247,230,.55)'; c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  c.restore(); }

function caption2(ws, ph, t, out, size) { const c = g; ws.forEach(w => { w.ww = c.measureText(w.w).width; }); const sp = c.measureText(' ').width, lines = [[]]; let lw = 0;
  ws.forEach(w => { if (lw + w.ww > 960 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const a = clamp((t - ph.start + .2) / .2) * (out != null ? clamp((out - t) / .2) : 1), lh = size * 1.2, y0 = 1290 - (lines.length - 1) * lh / 2 + size * .35;
  const bh = lines.length * lh + 44; c.globalAlpha = a * .62; c.fillStyle = '#1b1410'; c.beginPath(); c.roundRect(50, y0 - size * .95 - 6, W - 100, bh, 26); c.fill();
  lines.forEach((ln, li) => { const w = ln.reduce((s2, x) => s2 + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { c.globalAlpha = a; c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = '#1b1410'; c.strokeText(wd.w, x, y0 + li * lh);
    c.fillStyle = t >= wd.t0 ? (wd.hl ? '#ffd24d' : '#fff7e6') : 'rgba(255,247,230,.55)'; c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  c.restore(); }
function stamp(txt, x, y, k, rot = -.16, size = 80, col = C.red) { if (k <= 0) return; lg.save(); lg.translate(x, y); lg.rotate(rot); lg.scale(bo(k), bo(k)); const w = AD.measure(txt, 'poster', size) + 60; AD.shape(AD.box(-w / 2, -size * .66, w, size * 1.2, 3), 'rgba(255,255,255,.75)', { lc: col, lw: 8, wob: 1 }); AD.text(txt, 0, size * .34, { f: 'poster', size, col, align: 'center' }); lg.restore(); }
// ---------- bananabrown palette + cast (fresh: leaf green / teal / butter / terracotta; bananas, an enzyme, the oxygen twins, a fridge) ----------
const P = { leaf: '#4f7d4a', leafD: '#355a33', teal: '#2f6f73', tealD: '#1f4f52', butter: '#f2d16b', butterD: '#c9a83f', terra: '#c8643c', terraD: '#8e4428', cream: '#fbf3e0',
  peelG: '#8cbf4a', peelY: '#f5d23a', peelYD: '#d9ae1f', spot: '#6b3e1c', black: '#2b2118', flesh: '#f6eac4' };
// banana (cut paper): x,y = centre of the curve, sc scale, ripe 0 green .. 1 yellow, spots 0..1, dark 0..1 (chilled peel), face, rot
function banana(x, y, sc, t, o = {}) { const c = lg; c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(sc * (o.flip ? -1 : 1), sc); AD.use(c);
  const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, a = Math.PI * (1.15 + u * .7); pts.push([Math.cos(a) * 260, Math.sin(a) * 260 + 300 - Math.sin(u * Math.PI) * 26]); }
  for (let i = 24; i >= 0; i--) { const u = i / 24, a = Math.PI * (1.15 + u * .7); pts.push([Math.cos(a) * 190, Math.sin(a) * 190 + 250]); }
  let col = o.ripe == null ? P.peelY : (o.ripe < .5 ? P.peelG : P.peelY); if (o.dark) col = mixc(col, P.black, o.dark);
  AD.shape(pts, col, { seed: o.seed || 700, t, lw: 6 }); AD.shape([[-120, 90], [-150, 40], [-138, 30], [-104, 84]], P.leafD, { seed: 701, lw: 4 });   // stem
  AD.line(pts.slice(3, 20).map(([a, b]) => [a * .9, b * .96 + 18]), { lw: 3, lc: 'rgba(80,60,20,.35)', wob: .5 });
  const ns = Math.round((o.spots || 0) * 14); for (let i = 0; i < ns; i++) { const u = .15 + hash(i * 3.1) * .7, a = Math.PI * (1.15 + u * .7), r = 205 + hash(i * 7.3) * 45; AD.shape(AD.poly(Math.cos(a) * r, Math.sin(a) * r + 270, 9 + hash(i) * 9, 7 + hash(i + 1) * 7, 10), P.spot, { line: false, wob: 0 }); }
  if (o.face !== false) { const fx = 0, fy = 38; for (const sd of [-1, 1]) { AD.shape(AD.poly(fx + sd * 34, fy, 15, 17, 12), '#fff', { seed: 702 + sd, lw: 3 }); AD.shape(AD.poly(fx + sd * 34 + (o.look || 0) * 5, fy + 2, 7, 8, 10), C.ink, { line: false, wob: 0 }); }
    if (o.shades) { AD.shape(AD.rbox(-74, fy - 22, 66, 40, 10), '#222', { lw: 3 }); AD.shape(AD.rbox(8, fy - 22, 66, 40, 10), '#222', { lw: 3 }); AD.line([[-8, fy - 6], [8, fy - 6]], { lw: 4, wob: 0 }); }
    if (o.mood === 'o') AD.shape(AD.poly(fx, fy + 44, 11, 13, 12), '#7a2a20', { lw: 3 }); else if (o.mood === 'sad') AD.line([[fx - 18, fy + 50], [fx, fy + 40], [fx + 18, fy + 50]], { lw: 4 }); else AD.line([[fx - 20, fy + 38], [fx, fy + 50], [fx + 20, fy + 38]], { lw: 4 });
    if (o.shiver) for (const sd of [-1, 1]) AD.line([[sd * 300, 40], [sd * 316, 60], [sd * 300, 80], [sd * 316, 100]], { lw: 4, lc: '#9fd4f0', wob: 0 }); }
  c.restore(); AD.use(lg); }
const mixc = (a, b, u) => { const q = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = q(a), B = q(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join(''); };
// gas puff (ethylene) with the C2H4 sketch inside
function puff(x, y, r, t, k, lab = true) { if (k <= 0) return; AD.shape(AD.poly(x, y, r * k, r * .7 * k, 26, t * .3), 'rgba(220,240,200,.85)', { seed: 710, t, lw: 3, lc: P.leafD });
  if (k > .6 && lab) { const c = lg; c.save(); c.translate(x, y); c.scale(k * r / 120, k * r / 120); AD.use(c); AD.line([[-30, 0], [30, 0]], { lw: 5, wob: 0 }); AD.line([[-30, -8], [30, -8]], { lw: 5, wob: 0 });
    for (const [a, b] of [[-30, -4], [30, -4]]) for (const sd of [-1, 1]) { AD.line([[a, b], [a + Math.sign(a) * 34, b + sd * 30]], { lw: 4, wob: 0 }); AD.text('H', a + Math.sign(a) * 46, b + sd * 38 + 12, { f: 'roundX', size: 30, align: 'center' }); }
    AD.text('C', -30, 14 - 40, { f: 'roundX', size: 30, align: 'center', col: P.leafD }); AD.text('C', 30, 14 - 40, { f: 'roundX', size: 30, align: 'center', col: P.leafD }); c.restore(); AD.use(lg); } }
// the enzyme (PPO): a little scissor-armed blob; the oxygen twins: two linked bubbles with faces
function enzyme(x, y, sc, t, o = {}) { const c = lg; c.save(); c.translate(x, y); c.scale(sc, sc); AD.use(c); AD.shape(AD.poly(0, 0, 70, 60, 20, t * .5), P.terra, { seed: 720, t, lw: 5 });
  for (const sd of [-1, 1]) { const a = Math.sin(t * 6 + sd) * .3; AD.line([[sd * 60, -10], [sd * 110, -40 + a * 40]], { lw: 8, lc: P.terraD }); AD.shape(AD.poly(sd * 118, -46 + a * 40, 16, 12, 10), P.terraD, { lw: 3 }); }
  for (const sd of [-1, 1]) { AD.shape(AD.poly(sd * 22, -10, 11, 12, 10), '#fff', { lw: 3 }); AD.shape(AD.poly(sd * 22, -8, 5, 6, 8), C.ink, { line: false, wob: 0 }); } AD.line([[-14, 22], [0, 28], [14, 22]], { lw: 4 });
  if (o.lab) AD.text('PPO', 0, 100, { f: 'roundX', size: 34, align: 'center', col: P.cream, outline: 6 }); c.restore(); AD.use(lg); }
function oxygen(x, y, sc, t) { const c = lg; c.save(); c.translate(x, y + Math.sin(t * 3 + x) * 10); c.scale(sc, sc); AD.use(c); for (const sd of [-1, 1]) { AD.shape(AD.poly(sd * 34, 0, 40, 40, 18), '#bfe6ff', { seed: 730 + sd, t, lw: 4 }); AD.shape(AD.poly(sd * 34 - 8, -6, 6, 7, 8), C.ink, { line: false, wob: 0 }); AD.shape(AD.poly(sd * 34 + 10, -6, 6, 7, 8), C.ink, { line: false, wob: 0 }); }
  AD.text('O₂', 0, 70, { f: 'roundX', size: 30, align: 'center', col: P.tealD }); c.restore(); AD.use(lg); }
function jar(x, y, w, h, lab, col, t, crack = 0) { AD.shape(AD.rbox(x, y, w, h, 18), 'rgba(230,245,250,.6)', { seed: 740 + x, t, lw: 5 }); AD.shape(AD.box(x + 14, y + h * .4, w - 28, h * .55, 2), col, { seed: 741 + x, t, lw: 3 });
  AD.shape(AD.box(x - 8, y - 22, w + 16, 30, 2), P.butterD, { seed: 742 + x, lw: 4 }); AD.plaque(x + 10, y + 24, w - 20, 60, [lab], { size: 30, f: 'roundX', top: 42, fill: P.cream });
  if (crack > 0) { AD.line([[x + w * .5, y + 10], [x + w * .4, y + h * .3], [x + w * .6, y + h * .5], [x + w * .45, y + h * .7]].slice(0, 1 + Math.ceil(crack * 3)), { lw: 5, lc: C.ink }); } }
function fridge(x, y, w, h, t, open = 0) { AD.shape(AD.rbox(x, y, w, h, 30), '#e8f0f4', { seed: 750, t, lw: 6 }); AD.line([[x, y + h * .32], [x + w, y + h * .32]], { lw: 5 }); AD.shape(AD.box(x + w - 50, y + 40, 18, 90, 2), '#9aa8b0', { seed: 751, lw: 3 }); AD.shape(AD.box(x + w - 50, y + h * .32 + 40, 18, 140, 2), '#9aa8b0', { seed: 752, lw: 3 });
  for (let i = 0; i < 6; i++) AD.text('*', x + 40 + hash(i) * (w - 120), y + h * .4 + hash(i + 3) * h * .5, { f: 'roundX', size: 40, col: '#9fd4f0', a: .8 }); }
function thermo(x, y, v, t, col) { AD.shape(AD.rbox(x - 22, y, 44, 300, 22), '#f6f0e2', { seed: 760, t, lw: 4 }); AD.shape(AD.poly(x, y + 320, 40, 40, 18), col, { seed: 761, t, lw: 4 }); AD.shape(AD.box(x - 10, lerp(y + 300, y + 20, v), 20, lerp(0, 280, v), 2), col, { line: false, wob: 0 }); }
function sun(x, y, r, t, k) { if (k <= 0) return; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .3; AD.line([[x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2], [x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6]], { lw: 8, lc: P.butterD, a: k }); } AD.shape(AD.poly(x, y, r * k, r * k, 26), P.butter, { seed: 770, t, lw: 5 }); }
function dopa(x, y, sc, t, k = 1) { if (k <= 0) return; const c = lg; c.save(); c.translate(x, y); c.scale(sc, sc); AD.use(c); const hex = AD.poly(0, 0, 60, 60, 6, Math.PI / 6); AD.shape(hex, null, { lw: 6, a: k, wob: 0 }); AD.shape(AD.poly(0, 0, 36, 36, 18), null, { lw: 4, a: k, wob: 0 });
  AD.line([[52, -30], [110, -60], [160, -30]], { lw: 6, a: k, wob: 0 }); AD.text('NH₂', 200, -20, { f: 'roundX', size: 34, align: 'center', a: k }); AD.text('OH', -100, -50, { f: 'roundX', size: 34, align: 'center', a: k }); AD.text('OH', -100, 60, { f: 'roundX', size: 34, align: 'center', a: k }); c.restore(); AD.use(lg); }
const SETG = (wall, floor) => { AD.set(wall, floor, { fy: FY }); lg.fillStyle = 'rgba(0,0,0,.10)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, FY - 34); };

// ---------- scenes ----------
// A p0-1: frame 0: a spotted banana in sunglasses under a sun lamp; spots appear one by one; ransom SUNTAN?; p1 plaque + a gas puff
function sceneA(t) { SETG(P.teal, P.tealD); sun(860, 470, 80, t, 1); banana(470, 640, 1.25, t, { ripe: 1, spots: .25 + .75 * ss(R(t, 0, 3.2)), shades: t < s(1) + .4, mood: 'smile' });
  ransomLine('SUNTAN?', 360, 96, 7, i => R(t, -1 + i * .05, .2), 470); AD.text('melanin', 860, 640, { f: 'hand', size: 50, col: P.cream, align: 'center', a: R(t, .8, .5) });
  if (t > s(1)) { AD.plaque(560, 820, 420, 150, ['Why do bananas', 'turn brown?'], { size: 44, f: 'round', top: 64, lh: 56, fill: P.cream }); puff(230, 880, 110, t, bo(R(t, s(1) + 2.4, .6))); } }
// B p2: ethylene: the ripe banana breathes out puffs; green bananas nearby turn yellow
function sceneB(t) { const t0 = s(2); SETG(P.leaf, P.leafD); AD.plaque(200, 340, 680, 90, ['ETHYLENE: a ripening gas'], { size: 40, f: 'roundX', top: 60, fill: P.cream });
  banana(300, 700, .8, t, { ripe: 1, spots: .3 }); for (let i = 0; i < 3; i++) { const u = ((t - t0) * .4 + i / 3) % 1; puff(lerp(420, 700, u), lerp(620, 560, u), 70, t + i, Math.sin(u * Math.PI), i === 0); }
  const turn = ss(R(t, t0 + 1.6, 1.4)); banana(780, 820, .55, t, { ripe: turn, rot: .2, mood: turn > .5 ? 'smile' : 'o' }); banana(860, 980, .45, t, { ripe: ss(R(t, t0 + 2.4, 1.2)), rot: -.1, face: false }); }
// C p3: extremely sensitive: a chalkboard dot field, one dot of ethylene per billion
function sceneC(t) { const t0 = s(3); SETG(P.butter, P.butterD); AD.chalkboard(110, 380, 860, 560, t);
  AD.text('15 parts per', 540, 480, { f: 'hand', size: 70, col: '#f3efe0', align: 'center', write: R(t, t0 + .2, .7) }); AD.text('BILLION', 540, 590, { f: 'hand', size: 110, col: '#ffe9a0', align: 'center', write: R(t, t0 + 1.0, .6) });
  const k = R(t, t0 + 1.8, 1.6); for (let i = 0; i < 300; i++) { const x = 150 + (i % 30) * 26.5, y = 650 + Math.floor(i / 30) * 26; if (i / 300 < k) { lg.fillStyle = i === 137 ? '#7cff6a' : 'rgba(243,239,224,.35)'; lg.beginPath(); lg.arc(x, y, i === 137 ? 10 : 5, 0, TAU); lg.fill(); } }
  if (t > t0 + 3.6) AD.text('enough to start ripening', 540, 1060, { f: 'hand', size: 50, col: P.cream, align: 'center', write: R(t, t0 + 3.6, .8) }); banana(900, FY + 20, .35, t, { ripe: .3, rot: -.3, face: false }); }
// D p4: inside the peel: two jars on a shelf, kept apart by a paper wall
function sceneD(t) { const t0 = s(4); SETG(P.terra, P.terraD); AD.plaque(200, 340, 680, 90, ['inside the peel cells'], { size: 40, f: 'round', top: 60, fill: P.cream });
  AD.shape(AD.box(110, 900, 860, 30, 2), '#8a5a35', { seed: 780, lw: 4 }); jar(170, 560, 260, 340, 'ENZYME', P.terra, t); jar(650, 560, 260, 340, 'DOPAMINE', '#7a5a9a', t);
  AD.shape(AD.box(520, 480, 40, 420, 2), P.cream, { seed: 781, lw: 4 }); AD.text('kept apart', 540, 1040, { f: 'hand', size: 56, col: P.cream, align: 'center', write: R(t, t0 + 2.4, .8) });
  enzyme(300, 760, .7, t); }
// E p5: re-hook: dopamine, the same molecule your brain uses: two museum frames (banana / brain) + the molecule sketch
function sceneE(t) { const t0 = s(5); SETG('#e9dcc0', '#c8b08a'); AD.text('SAME MOLECULE', 540, 400, { f: 'roundX', size: 72, col: C.ink, align: 'center', write: R(t, t0 + .2, .7) });
  const k1 = bo(R(t, t0 + .5, .5)), k2 = bo(R(t, t0 + 1.0, .5)); if (k1 > 0) { lg.save(); lg.translate(280, 640); lg.scale(k1, k1); lg.translate(-280, -640); frame(130, 480, 300, 320, t, () => banana(280, 620, .45, t, { ripe: 1, spots: .5, face: false }), { bg: '#f0e6c8' }); lg.restore(); }
  if (k2 > 0) { lg.save(); lg.translate(800, 640); lg.scale(k2, k2); lg.translate(-800, -640); frame(650, 480, 300, 320, t, () => brain(800, 640, .4, t, 0), { bg: '#2c5aa0' }); lg.restore(); }
  dopa(470, 950, .9, t, R(t, t0 + 2.2, .6)); AD.text('dopamine', 540, 1080, { f: 'hand', size: 54, col: '#7a3a9a', align: 'center', write: R(t, t0 + 2.8, .6) }); rope(FY - 190, 120, 960, t); }
// F p6: the jars crack; the enzyme grabs the oxygen twins and turns dopamine into brown pigment blobs on a conveyor
function sceneF(t) { const t0 = s(6); SETG(P.terra, P.terraD); const cr = R(t, t0 + .3, 1); jar(110, 480, 220, 300, 'ENZYME', P.terra, t, cr); jar(750, 480, 220, 300, 'DOPAMINE', '#7a5a9a', t, cr);
  AD.shape(AD.box(110, 900, 860, 40, 2), '#555', { seed: 790, lw: 4 }); for (let i = 0; i < 9; i++) AD.shape(AD.poly(150 + i * 100, 940, 18, 18, 10), '#888', { lw: 3 });
  enzyme(540, 720, .9, t, { lab: true }); for (let i = 0; i < 2; i++) oxygen(380 + i * 320, 560, .8, t + i);
  for (let i = 0; i < 6; i++) { const u = ((t - t0) * .25 + i / 6) % 1, x = lerp(160, 940, u), col = u < .45 ? '#9a7ab8' : mixc('#9a7ab8', P.spot, (u - .45) / .3); AD.shape(AD.poly(x, 880, 26, 20, 12, i), col, { seed: 800 + i, lw: 3 }); }
  AD.text('brown pigment', 760, 1060, { f: 'hand', size: 50, col: P.cream, align: 'center', write: R(t, t0 + 3.2, .7) }); }
// G p7: bruises brown faster: a banana gets bonked, the bruise darkens fast; stamp
function sceneG(t) { const t0 = s(7); SETG(P.teal, P.tealD); const hit = R(t, t0 + .8, .2), dk = ss(R(t, t0 + 1.0, 1.6)); banana(500, 700, 1.0, t, { ripe: 1, spots: .3, mood: hit > 0 ? 'o' : 'smile' });
  if (dk > 0) { AD.shape(AD.poly(440, 900, 70 * dk + 10, 46 * dk + 6, 20), mixc(P.peelY, P.spot, dk), { seed: 810, lw: 0, line: false }); }
  const fx = lerp(980, 560, ss(R(t, t0, .8))); AD.shape(AD.rbox(fx - 20, 560, 220, 70, 20), '#a87a4a', { seed: 811, lw: 4 }); if (hit > 0 && hit < 1) AD.text('BONK', 700, 520, { f: 'poster', size: 70, col: C.red, align: 'center' });
  stamp('BRUISE = FASTER', 540, 400, R(t, t0 + 2.4, .35), -.1, 64); }
// H p8: the fridge: below 13 °C the peel gets chill damage; the banana shivers inside; thermometer
function sceneH(t) { const t0 = s(8); SETG('#cfe3ee', '#9fb8c8'); fridge(150, 380, 560, 720, t); const dk = ss(R(t, t0 + 1.6, 3)); banana(430, 830, .62, t, { ripe: 1, spots: .3, dark: dk * .8, shiver: true, mood: 'sad' });
  thermo(860, 440, lerp(.6, .25, ss(R(t, t0 + .4, 1.2))), t, '#8fd0f0'); AD.text('13 °C', 860, 860, { f: 'roundX', size: 52, col: C.ink, align: 'center', a: R(t, t0 + 1.0, .4) }); AD.text('(55 °F)', 860, 910, { f: 'round', size: 34, col: C.ink, align: 'center', a: R(t, t0 + 1.2, .4) });
  AD.text('chill damage', 430, 1080, { f: 'hand', size: 56, col: C.ink, align: 'center', write: R(t, t0 + 2.8, .7) }); }
// I p9: cut open: peel dark brown/black, the fruit inside fresh
function sceneI(t) { const t0 = s(9); SETG('#e9dcc0', '#c8b08a'); const k = R(t, t0 + .2, .8);
  banana(330, 700, .75, t, { ripe: 1, dark: .9, face: false, rot: -.1 }); const op = ss(R(t, t0 + .8, 1)); lg.save(); lg.translate(760, 720); lg.rotate(-.1); AD.shape(AD.rbox(-150, -120 - 60 * op, 300, 240 + 120 * op, 120), P.black, { seed: 820, lw: 5 }); AD.shape(AD.rbox(-115, -90 - 50 * op, 230, 180 + 100 * op, 100), P.flesh, { seed: 821, lw: 4 });
  for (let i = 0; i < 3; i++) AD.shape(AD.poly(0, -50 + i * 50, 10, 6, 8), '#c9b48a', { line: false, wob: 0 }); lg.restore();
  AD.plaque(560, 960, 400, 90, ['inside: fresh'], { size: 44, f: 'round', top: 60, fill: '#c6ecc0', a: k }); AD.text('peel: dark', 330, 1070, { f: 'hand', size: 50, col: C.ink, align: 'center', write: R(t, t0 + 1.4, .6) }); }
// J p10: the trick: counter first, fridge once ripe (two numbered plaques + arrow)
function sceneJ(t) { const t0 = s(10); SETG(P.leaf, P.leafD); AD.text('THE TRICK', 540, 400, { f: 'roundX', size: 76, col: P.cream, align: 'center', write: R(t, t0 + .1, .6) });
  AD.plaque(110, 470, 380, 100, ['1  counter'], { size: 46, f: 'roundX', top: 66, fill: P.butter }); AD.plaque(590, 470, 380, 100, ['2  then fridge'], { size: 42, f: 'roundX', top: 66, fill: '#cfe3ee', a: R(t, t0 + 1.6, .4) });
  banana(300, 800, .6, t, { ripe: ss(R(t, t0 + .4, 1.4)), spots: .2 }); if (t > t0 + 1.6) { fridge(640, 640, 300, 420, t); banana(790, 880, .3, t, { ripe: 1, spots: .2, face: false }); }
  AD.line([[420, 760], [520, 720], [620, 760]], { lw: 8, lc: P.cream }); AD.text('once ripe', 520, 1080, { f: 'hand', size: 50, col: P.cream, align: 'center', write: R(t, t0 + 2.6, .6) }); }
// K p11: payoff: the summary chalkboard
function sceneK(t) { const t0 = s(11); SETG(P.butter, P.butterD); AD.chalkboard(100, 380, 880, 600, t);
  [['ETHYLENE  →  ripe', '#c6ecc0', .3], ['ENZYME + O₂  →  spots', '#ffd9a0', 1.6], ['COLD  →  dark peel', '#cfe3ee', 3.0]].forEach(([s2, col, d], i) => AD.text(s2, 150, 500 + i * 160, { f: 'hand', size: 64, col, write: R(t, t0 + d, .9) }));
  banana(880, FY + 30, .4, t, { ripe: 1, spots: .6, rot: -.25 }); }
// L p12: the question: BROWN SPOTS? YES / NO
function sceneL(t) { const t0 = s(12); SETG(P.teal, P.tealD); ransomLine('BROWN', 380, 110, 61, i => R(t, t0 + i * .04, .25)); ransomLine('SPOTS?', 520, 120, 83, i => R(t, t0 + .3 + i * .04, .25));
  AD.plaque(140, 640, 260, 120, ['YES'], { size: 70, f: 'poster', top: 92, fill: '#c6ecc0' }); AD.plaque(680, 640, 260, 120, ['NO'], { size: 70, f: 'poster', top: 92, fill: '#ffc4c4' });
  banana(540, 900, .55, t, { ripe: 1, spots: .7, mood: 'smile' }); }
// M p13: end card on cork (ransom) + the standard second line + handle; the spotted banana returns (loop)
const ENDL = [['FOLLOW', 330], ['FOR MORE OF', 500], ['HOW IT', 680], ['REALLY', 850], ['WORKS.', 1020]];
function sceneM(t) { const t0 = s(13) - .2; cork(t); ENDL.forEach(([w, y], li) => { const sz = li === 1 ? 96 : 130, step = sz * .78, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, 540 - tw / 2 + step / 2 + i * step, y, sz, li * 23 + i * 5 + 9, R(t, t0 + li * .2 + i * .02, .25)); }); });
  AD.text("A new 'wait, really?' every day.", 540, 1180, { f: 'round', size: 46, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.0, .4) });
  AD.text('@howitreallyworkstudio', 540, 1260, { f: 'type', size: 44, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.3, .4) }); }

// ---------- compositor: hard cuts with a short whip blur (demo); the last 0.6 s dissolves into frame 0 (loop) ----------
const SC = [[0, sceneA], [s(2) - .2, sceneB], [s(3) - .2, sceneC], [s(4) - .2, sceneD], [s(5) - .2, sceneE], [s(6) - .2, sceneF], [s(7) - .2, sceneG], [s(8) - .2, sceneH],
  [s(9) - .2, sceneI], [s(10) - .2, sceneJ], [s(11) - .2, sceneK], [s(12) - .2, sceneL], [s(13) - .3, sceneM]];
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
function draw(t, cap = true) { const i = idx(t), u = R(t, SC[i][0], .22); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H);
  AD.clear(); SC[i][1](t); AD.blit({ blur: i > 0 && u < 1 ? (1 - u) * 18 : 0, dx: i > 0 && u < 1 ? (1 - eo(u)) * 160 : 0, z: i > 0 && u < 1 ? lerp(1.04, 1, eo(u)) : 1 + .015 * Math.sin(t * .4) });
  wash(); AD.finish(); if (!cap) return; const ph = PH.findLast(p => t >= p.start - .2); if (ph && ph.i < PH.length - 1) caption(ph, t, PH[ph.i + 1].start - .12); }
const LOOP = document.createElement('canvas'); LOOP.width = W; LOOP.height = H;
window.DUR = TOT;
window.seek = t => { const lp = R(t, TOT - .6, .6); if (lp > 0) { draw(0, false); LOOP.getContext('2d').drawImage(g.canvas, 0, 0); }
  draw(t); if (lp > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = ss(lp); g.drawImage(LOOP, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); AD.clear(); AD.set(P.teal, P.tealD, { fy: 1380 }); lg.fillStyle = 'rgba(0,0,0,.10)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, 1346);
  sun(860, 900, 90, 1, 1); banana(470, 1060, 1.5, 1, { ripe: 1, spots: 1, shades: true }); ransomLine('WHY BANANAS', 400, 104, 5, 1); ransomLine('GO BROWN', 560, 130, 47, 1); AD.blit({}); wash(); AD.finish(); };
window.seek(0); window.ready = true; window.READY = true;
