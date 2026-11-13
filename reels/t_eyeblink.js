// t_eyeblink.js: "Why do we blink so much?" in template #13 collage "AI Doom" (demo 78), with the yawn reel's cast, sets and caption band.
// Demo moves: little paper sets, the kid and the orange box creature, museum frames and plaques, chalkboards, theatre curtains,
// ransom-note cut-out letters, watercolour mottle, hard cuts with a short whip blur. Batch N layout: captions at y 1160-1420,
// no text in the top 250 px, the bottom 480 px or the right column below y 840; the last 0.6 s dissolves back into frame 0 (loop).
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
// ---------- blink pieces ----------
// periodic blink: closed for ~0.18 s every `per` seconds (phase ph); extra blink times in `at`
const blinkOn = (t, per = 3.4, ph = 0, at = []) => ((t + ph) % per) < .18 || at.some(a => t >= a && t < a + .2);
// a kid that blinks: mood closed while blinking
function kidB(x, y, sc, t, o = {}) { const cl = o.closed ?? blinkOn(t, o.per || 3.4, o.ph || 0, o.at || []); AD.kid(x, y, sc, t, { ...o, mood: cl ? 'closed' : (o.mood || 'smile') }); }
function boxyB(x, y, sc, t, o = {}) { const cl = o.closed ?? blinkOn(t, o.per || 3.9, o.ph || 1.3, o.at || []); AD.boxy(x, y, sc, t, { ...o, mood: cl ? 'sleepy' : (o.mood || 'o') }); }
// a big paper eye: lid k 0 open .. 1 shut; tear film shown while the lid sweeps
function bigEye(cx, cy, r, t, k, o = {}) { const c = lg;
  AD.shape(AD.poly(cx, cy, r * 1.25, r * .78, 36), '#fbf6ea', { seed: 600, t, lw: 6 });
  c.save(); c.beginPath(); AD.poly(cx, cy, r * 1.25, r * .78, 36).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip();
  AD.shape(AD.poly(cx + (o.look || 0) * r * .2, cy, r * .52, r * .52, 28), o.iris || C.teal, { seed: 601, t, lw: 4 }); AD.shape(AD.poly(cx + (o.look || 0) * r * .2, cy, r * .24, r * .24, 20), C.ink, { line: false, wob: 0 });
  AD.shape(AD.poly(cx + (o.look || 0) * r * .2 - r * .14, cy - r * .16, r * .08, r * .08, 12), '#fff', { line: false, wob: 0 });
  if (o.film) { c.globalAlpha = o.film; c.fillStyle = '#8fd0f0'; c.fillRect(cx - r * 1.3, cy - r * .9, r * 2.6, r * 1.8); c.globalAlpha = 1; }
  const ly = lerp(cy - r * .8, cy + r * .8, clamp(k)); c.fillStyle = C.skin; c.fillRect(cx - r * 1.3, cy - r, r * 2.6, ly - (cy - r)); c.restore();
  if (k > .02) AD.line([[cx - r * 1.2, ly], [cx, ly + r * .08], [cx + r * 1.2, ly]], { lw: 6, t });
  for (let i = -3; i <= 3; i++) AD.line([[cx + i * r * .3, ly - 2], [cx + i * r * .34, ly + (k > .9 ? 26 : -26)]], { lw: 5, wob: 0 });   // lashes
  AD.shape(AD.poly(cx, cy, r * 1.25, r * .78, 36), null, { seed: 600, t, lw: 7 }); }
// lamp + label (brain network indicator)
function lamp(x, y, on, lab, col, t) { AD.shape(AD.poly(x, y, 54, 54, 20), on > .5 ? col : '#5a5a60', { seed: 610 + x, t, lw: 4 });
  if (on > .5) { lg.save(); lg.globalAlpha = .3 * on; AD.shape(AD.poly(x, y, 92, 92, 20), col, { line: false, wob: 0 }); lg.restore(); }
  AD.text(lab, x, y + 104, { f: 'type', size: 34, col: '#eaf2ff', align: 'center' }); }
function meter(x, y, v, lab, t) { AD.shape(AD.box(x - 26, y - 220, 52, 240, 2), '#2b3a3a', { seed: 620 + x, t, lc: '#eaf2ff', lw: 4 }); AD.shape(AD.box(x - 18, y + 12 - 228 * v, 36, 228 * v, 2), C.yellow, { line: false, wob: 0 });
  AD.text(lab, x, y + 76, { f: 'type', size: 34, col: '#eaf2ff', align: 'center' }); }
function stamp(txt, x, y, k, rot = -.16, size = 80, col = C.red) { if (k <= 0) return; lg.save(); lg.translate(x, y); lg.rotate(rot); lg.scale(bo(k), bo(k)); const w = AD.measure(txt, 'poster', size) + 60; AD.shape(AD.box(-w / 2, -size * .66, w, size * 1.2, 3), 'rgba(255,255,255,.75)', { lc: col, lw: 8, wob: 1 }); AD.text(txt, 0, size * .34, { f: 'poster', size, col, align: 'center' }); lg.restore(); }
function curtains(t, open = 1) { const c = lg; for (const sd of [-1, 1]) { const w = lerp(560, 150, open); const x0 = sd < 0 ? 0 : W - w; AD.shape(AD.box(x0, 240, w, FY - 274, 3), '#9a2a2a', { seed: 630 + sd, t, lw: 5 });
    c.save(); c.strokeStyle = 'rgba(40,10,10,.35)'; c.lineWidth = 6; for (let i = 1; i < 5; i++) { const x = x0 + w * i / 5; c.beginPath(); c.moveTo(x, 250); c.lineTo(x + Math.sin(t + i) * 6, FY - 40); c.stroke(); } c.restore(); }
  AD.shape(AD.box(0, 200, W, 80, 3), '#7a1f1f', { seed: 633, t, lw: 5 }); }
// cinema screen with a tiny film drawn by fn
function screen(x, y, w, h, t, fn, dark = 0) { AD.shape(AD.box(x - 14, y - 14, w + 28, h + 28, 3), '#2a2a2a', { seed: 640, t, lw: 4 }); lg.save(); lg.beginPath(); lg.rect(x, y, w, h); lg.clip(); lg.fillStyle = '#f3ead6'; lg.fillRect(x, y, w, h); fn();
  if (dark > 0) { lg.globalAlpha = dark; lg.fillStyle = '#141018'; lg.fillRect(x, y, w, h); } lg.restore(); }
// a row of audience heads (back of seats) facing us; all blink on the `at` times
function audience(y, t, at, o = {}) { const xs = [150, 330, 540, 750, 930]; xs.forEach((x, i) => { const cl = at.some(a => t >= a + (o.jit ? hash(i) * .12 : 0) && t < a + .22 + (o.jit ? hash(i) * .12 : 0)) || (o.own && blinkOn(t, 2.7 + i * .4, i * .9));
    if (i % 2) { AD.boxy(x, y + 60, .95, t, { mood: cl ? 'sleepy' : 'o' }); } else AD.kid(x, y + 290, .62, t, { mood: cl ? 'closed' : 'smile', look: 0 }); });
  AD.shape(AD.box(0, y + 40, W, 140, 3), '#6b2a3a', { seed: 650, t, lw: 5 }); for (let i = 0; i < 6; i++) AD.line([[i * 200 + 80, y + 40], [i * 200 + 80, y + 180]], { lw: 3 }); }
// tiny film pictures
const filmBall = (x, y, w, h, t, u) => { AD.shape(AD.box(x, y + h * .75, w, h * .25, 2), '#9fb08e', { line: false, wob: 0 }); const bx = lerp(x + w * .2, x + w * .75, clamp(u)), by = y + h * .75 - 30 - Math.abs(Math.sin(clamp(u) * Math.PI * 2)) * h * .35; AD.shape(AD.poly(bx, by, 26, 26, 14), C.orange, { seed: 660, lw: 3 }); };
const filmHero = (x, y, w, h, t, gone) => { AD.shape(AD.box(x, y + h * .75, w, h * .25, 2), '#c9b48f', { line: false, wob: 0 }); if (!gone) AD.kid(x + w * .5, y + h * .9, .32, t, { mood: 'smile' }); };
const filmLong = (x, y, w, h, t) => { AD.shape([[x, y + h * .8], [x + w * .3, y + h * .45], [x + w * .55, y + h * .7], [x + w * .8, y + h * .4], [x + w, y + h * .75], [x + w, y + h], [x, y + h]], '#7bb36a', { seed: 661, t, lw: 3 }); };
function filmStrip(x, y, fw, fh, n, t, draw) { const w = n * (fw + 30) + 30; AD.shape(AD.box(x, y, w, fh + 80, 3), '#2a2420', { seed: 670, t, lw: 4 });
  for (let i = 0; i < w / 40 - 1; i++) { lg.fillStyle = '#f3ead6'; lg.fillRect(x + 16 + i * 40, y + 10, 20, 16); lg.fillRect(x + 16 + i * 40, y + fh + 54, 20, 16); }
  for (let i = 0; i < n; i++) { const fx = x + 30 + i * (fw + 30), fy = y + 40; lg.save(); lg.beginPath(); lg.rect(fx, fy, fw, fh); lg.clip(); lg.fillStyle = '#efe6cf'; lg.fillRect(fx, fy, fw, fh); draw(i, fx, fy); lg.restore(); AD.shape(AD.box(fx, fy, fw, fh, 2), null, { lw: 3, wob: 0 }); } }
// closed-eye stamp
function eyeShut(x, y, sc, k) { if (k <= 0) return; lg.save(); lg.translate(x, y); lg.scale(sc * bo(k), sc * bo(k)); AD.shape(AD.poly(0, 0, 60, 36, 22), '#fbf6ea', { lw: 4, wob: 0 }); AD.line([[-48, 0], [0, 18], [48, 0]], { lw: 6, wob: 0 }); for (let i = -2; i <= 2; i++) AD.line([[i * 18, 12], [i * 22, 30]], { lw: 4, wob: 0 }); lg.restore(); }
// MRI scanner (ring + sliding bed)
function scanner(cx, cy, t, slide) { AD.shape(AD.poly(cx, cy, 330, 330, 40), '#e9e2d0', { seed: 680, t, lw: 6 }); AD.shape(AD.poly(cx, cy, 170, 170, 36), '#3a3440', { seed: 681, t, lw: 5 });
  AD.text('BRAIN SCAN', cx, cy - 220, { f: 'type', size: 42, col: C.ink, align: 'center' });
  const bx = lerp(cx - 520, cx - 180, ss(slide)); AD.shape(AD.box(bx, cy + 40, 520, 40, 2), '#cfd8e6', { seed: 682, t, lw: 4 });
  lg.save(); lg.translate(bx + 120, cy + 30); lg.rotate(-Math.PI / 2); AD.use(lg); AD.kid(0, 0, .42, t, { mood: blinkOn(t, 2.6) ? 'closed' : 'o' }); lg.restore();
  AD.shape(AD.box(cx - 120, cy + 300, 240, 140, 3), '#e9e2d0', { seed: 683, t, lw: 5 }); }
// deck chair + box creature resting (micro-break)
function deckChair(x, y, t) { AD.line([[x - 90, y], [x + 30, y - 150]], { lw: 10, lc: '#8a5a35' }); AD.line([[x + 90, y], [x - 30, y - 150]], { lw: 10, lc: '#8a5a35' });
  AD.shape([[x - 70, y - 40], [x + 70, y - 40], [x + 40, y - 170], [x - 40, y - 170]], '#e9a0a8', { seed: 690, t, lw: 4 }); for (let i = 0; i < 3; i++) AD.line([[x - 60 + i * 0, y - 40 - i * 45], [x + 60, y - 40 - i * 45]], { lc: '#fbf6ea', lw: 10, wob: 0 }); }

// ---------- scenes ----------
const DIM = t => { let d = 0; [.9, 2.7, 4.4].forEach(a => { d = Math.max(d, 1 - Math.abs(t - a - .09) / .12); }); return clamp(d); };
// A p0-1: frame 0 = the kid in close-up mid-blink; the whole set dims on each blink ("blind for a moment"); ransom 15 A MINUTE; p1 plaque
function sceneA(t) { AD.set('#5d4a7a', '#3a2c46', { fy: FY }); lg.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, FY - 34);
  const at = [.9, 2.7, 4.4, 6.1]; kidB(330, FY - 10, 1.25, t, { at, per: 99 }); boxyB(790, FY - 10, 1.35, t, { at: at.map(a => a + .05), per: 99, hop: t < 1.6 ? t * .8 : 0 });
  ransomLine('BLINK', 340, 104, 3, i => R(t, -1 + i * .05, .2), 470); ransomLine('15x A MINUTE', 460, 76, 41, i => R(t, .3 + i * .04, .2), 470);
  const n = at.filter(a => t > a).length; if (t < s(1)) AD.plaque(640, 540, 300, 110, ['blinks: ' + n], { size: 46, f: 'roundX', top: 72, fill: '#fff3c4' });
  if (t > s(1)) { const k = R(t, s(1) + .2, 1.4); AD.plaque(540, 540, 440, 150, ['Why do we', 'blink so much?'], { size: 46, f: 'round', t, top: 64, lh: 56 }); lg.save(); lg.globalAlpha = 1 - k; lg.fillStyle = '#5d4a7a'; lg.fillRect(530, 530, 460 * (1 - k), 170); lg.restore(); } }
// B p2: museum: the big eye exhibit, the lid wipes a tear film; the kid and box creature behind a velvet rope
function sceneB(t) { const t0 = s(2); AD.set('#e6c9a8', C.floor, { fy: FY }); AD.text('EXHIBIT 1', 400, 340, { f: 'serif', size: 52, col: '#4a3a30', align: 'center' });
  const ph = ((t - t0) % 2.4) / 2.4, k = ph < .18 ? Math.sin(ph / .18 * Math.PI) : 0, film = ph < .45 ? 1 - ph / .45 : 0;
  frame(160, 400, 760, 440, t, () => bigEye(540, 620, 210, t, k, { film: film * .45 }), { bg: '#f0d9c0' });
  AD.plaque(300, 900, 480, 100, ['THE TEAR WIPER'], { size: 42, top: 64 }); kidB(170, FY - 10, .62, t, { look: 1, per: 2.9 }); boxyB(900 - 40, FY - 10, .7, t, {}); rope(FY - 190, 260, 820, t); }
// C p3: the kid glued to a phone; the blink counter drops 15 -> 5-7; AAO plaque
function sceneC(t) { const t0 = s(3); AD.set('#cfe3dc', '#9fb08e', { fy: FY }); AD.plaque(220, 345, 640, 90, ['American Academy of Ophthalmology'], { size: 30, top: 58 });
  kidB(320, FY - 10, 1.1, t, { arm: 'phone', mood: 'o', per: 9, ph: 3 }); lg.save(); lg.globalAlpha = .3; AD.shape(AD.poly(320, FY - 10 - 270 * 1.1, 170, 120, 20), '#8fd3ff', { line: false, wob: 0 }); lg.restore();
  AD.chalkboard(560, 440, 360, 360, t); const u = ss(R(t, t0 + 1.0, 1.6)); AD.text('blinks / min', 740, 510, { f: 'hand', size: 44, col: '#f3efe0', align: 'center' });
  AD.text(u < .5 ? '15' : '5-7', 740, 680, { f: 'hand', size: 150, col: u < .5 ? '#f3efe0' : '#ffe9a0', align: 'center' }); if (u > .5) AD.line([[640, 560], [690, 600], [740, 570]], { lc: '#ffe9a0', lw: 6 });
  if (t > t0 + 3.6) AD.plaque(500, 860, 360, 90, ['eyes cope'], { size: 42, f: 'round', top: 58, fill: '#fff3c4' }); }
// D p4: chalkboard question WHEN? with the box creature pointing
function sceneD(t) { const t0 = s(4); AD.set('#efd9a8', C.floor, { fy: FY }); AD.chalkboard(120, 370, 840, 520, t);
  AD.text('not WHY...', 540, 490, { f: 'hand', size: 80, col: 'rgba(243,239,224,.55)', align: 'center', write: R(t, t0 + .1, .6) });
  AD.text('WHEN?', 540, 730, { f: 'hand', size: 200, col: '#ffe9a0', align: 'center', write: R(t, t0 + 1.2, .6) });
  boxyB(300, FY - 10, 1.0, t, { hop: (t - t0) * .5 }); kidB(780, FY - 10, .9, t, { look: -1, mood: 'o' }); }
// E p5: theatre: an audience watching the same film blinks together (re-hook)
const SYNC = i => [s(5) + 1.6, s(5) + 3.3, s(5) + 4.8, s(6) + .6, s(6) + 2.2, s(6) + 3.8][i];
function sceneE(t) { const t0 = s(5); AD.set('#3a2c46', '#2a2034', { fy: FY }); curtains(t, ss(R(t, t0, 1.2))); AD.plaque(180, 300, 420, 80, ['Nakano et al., 2009'], { size: 32, top: 54 });
  screen(250, 420, 580, 330, t, () => filmBall(250, 420, 580, 330, t, ((t - t0) / 3.2) % 1));
  const at = [0, 1, 2].map(SYNC); audience(800, t, at); const sy = at.some(a => t >= a && t < a + .22); AD.text('in sync!', 540, 720, { f: 'roundX', size: 64, col: C.yellow, align: 'center', outline: 8, a: t > at[0] ? (sy ? 1 : .8) : 0 }); }
// F p6: the blinks land on calm moments: film strip, closed-eye marks over ACTION ENDS / HERO GONE / LONG SHOT
function sceneF(t) { const t0 = s(6); AD.set('#2a2034', '#1f1828', { fy: FY }); AD.text('WHERE THE BLINKS LAND', 540, 385, { f: 'roundX', size: 56, col: '#fbf6ea', align: 'center', write: R(t, t0, .8) });
  filmStrip(60, 430, 280, 230, 3, t, (i, fx, fy) => { if (i === 0) filmBall(fx, fy, 280, 230, t, 1); else if (i === 1) filmHero(fx, fy, 280, 230, t, true); else filmLong(fx, fy, 280, 230, t); });
  [['ACTION ENDS', 1.0], ['HERO GONE', 2.4], ['LONG SHOT', 3.8]].forEach(([lab, d], i) => { const k = R(t, t0 + d, .35); eyeShut(260 + i * 310 - 60 + 40, 590, 1.0, k); AD.text(lab, 200 + i * 310 + 10, 790, { f: 'type', size: 34, col: '#fbf6ea', align: 'center', a: k }); });
  kidB(540, FY - 10, .6, t, { at: [1, 2].map(i => SYNC(i + 2)), per: 99 }); }
// G p7: a sentence with pauses; blink marks fall in the gaps
function sceneG(t) { const t0 = s(7); AD.set('#efd9a8', C.floor, { fy: FY }); AD.plaque(260, 345, 560, 90, ['natural pauses'], { size: 44, f: 'round', top: 60 });
  const words = [['the hero', 120], ['opens the door', 380], ['...', 690], ['and leaves.', 820]]; const ty = 560;
  AD.shape(AD.box(70, 460, 940, 200, 3), '#fbf6ea', { seed: 710, t, lw: 4 });
  words.forEach(([w, x], i) => AD.text(w, x, ty, { f: 'type', size: 44, col: C.ink, align: 'left', a: R(t, t0 + .2 + i * .5, .3) }));
  [[340, 1.4], [640, 2.2], [1000 - 40, 3.0]].forEach(([x, d]) => eyeShut(x, 640, .6, R(t, t0 + d, .3)));
  const u = clamp((t - t0) / 4); AD.line([[90, 720], [990, 720]], { lw: 5 }); AD.shape(AD.poly(lerp(90, 990, u), 720, 16, 16, 12), C.red, { lw: 3 });
  AD.text('least likely to miss something', 540, 830, { f: 'hand', size: 52, col: C.ink, align: 'center', a: R(t, t0 + 2.6, .4) });
  kidB(200, FY - 10, .55, t, { at: [t0 + 1.4, t0 + 2.2, t0 + 3.0], per: 99 }); boxyB(880 - 20, FY - 10, .6, t, { at: [t0 + 1.45, t0 + 2.25, t0 + 3.05], per: 99 }); }
// H p8: brain-scan study: the kid slides into the scanner
function sceneH(t) { const t0 = s(8); AD.set('#cfe3dc', '#9fb08e', { fy: FY }); AD.plaque(220, 345, 640, 80, ['Nakano et al., 2013 · PNAS'], { size: 32, top: 54 });
  scanner(540, 760, t, R(t, t0 + .1, 1.4)); }
// I p9: the brain on blueprint blue: ATTENTION meter dips, DEFAULT MODE lamp lights, right after each blink
function sceneI(t) { const t0 = s(9), c = lg; c.fillStyle = '#2c5aa0'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  AD.text('RIGHT AFTER A BLINK', 540, 385, { f: 'type', size: 50, col: '#eaf2ff', align: 'center', write: R(t, t0, .8) });
  const bt = [t0 + .8, t0 + 2.8, t0 + 4.8]; const after = bt.reduce((m, a) => Math.max(m, t > a ? Math.exp(-(t - a - .5) * (t - a - .5) * 3) : 0), 0);
  brain(400, 640, .72, t, after); bigEye(820, 470, 60, t, bt.some(a => t >= a && t < a + .2) ? 1 : 0);
  meter(230, 1020, lerp(.85, .35, after), 'ATTENTION', t); lamp(560, 950, after, 'DEFAULT MODE', '#ffcf4a', t); AD.text('resting network', 840, 960, { f: 'hand', size: 40, col: '#eaf2ff', align: 'center', a: R(t, t0 + 3.2, .4) }); }
// J p10: re-hook: the micro-break: the box creature on a deck chair inside the brain, "MICRO-BREAK?"
function sceneJ(t) { const t0 = s(10); AD.set('#f2d6d0', C.floor, { fy: FY }); ransomLine('MICRO-BREAK?', 390, 82, 91, i => R(t, t0 + i * .04, .2));
  AD.shape(AD.poly(540, 720, 400, 290, 40), '#f2b8c0', { seed: 720, t, lw: 6 }); [[-200, -80, 110], [-40, -150, 130], [150, -60, 120], [-120, 100, 110], [120, 120, 100]].forEach(([a, b, r], i) => AD.line(AD.poly(540 + a, 720 + b, r * .6, r * .35, 14, i).slice(0, 10), { lc: '#c06a7a', lw: 4, t }));
  deckChair(540, 860, t); boxyB(540, 820, .8, t, { closed: true }); AD.text('z', 640, 560 - ((t * 40) % 60), { f: 'roundX', size: 48, col: C.ink, a: .8 });
  const ck = bo(R(t, t0 + 2.4, .4)); if (ck > 0) AD.plaque(330, 1000, 420, 90, ['a tiny reset?'], { size: 44, f: 'round', top: 60, fill: '#fff3c4' }); kidB(150, FY - 10, .5, t, { look: 1 }); }
// K p11: the catch: the screen goes dark instead (fake blink): lamp stays off: NO SHIFT
function sceneK(t) { const t0 = s(11); AD.set('#3a2c46', '#2a2034', { fy: FY }); curtains(t, 1); AD.text('FAKE BLINK', 540, 390, { f: 'roundX', size: 70, col: '#fbf6ea', align: 'center', write: R(t, t0, .6) });
  const dk = [t0 + 1.4, t0 + 2.6, t0 + 3.8].some(a => t >= a && t < a + .3) ? 1 : 0; screen(250, 450, 580, 300, t, () => filmBall(250, 450, 580, 300, t, ((t - t0) / 3) % 1), dk * .92);
  AD.text(dk ? 'screen dark' : '', 540, 620, { f: 'type', size: 44, col: '#fbf6ea', align: 'center' }); lamp(540, 860, 0, '', '#ffcf4a', t); AD.text('DEFAULT MODE', 540, 966, { f: 'type', size: 34, col: '#fbf6ea', align: 'center' });
  stamp('NO SHIFT', 540, 860, R(t, t0 + 4.0, .35)); }
// L p12: payoff: two jobs: WET EYES (ticked) and BRAIN BREAKS? (still testing)
function sceneL(t) { const t0 = s(12); AD.set('#efd9a8', C.floor, { fy: FY }); AD.text('TWO JOBS?', 540, 395, { f: 'roundX', size: 84, col: C.ink, align: 'center', write: R(t, t0 + .2, .7) });
  [[110, '#8fd0f0', 'WET EYES', 1.0], [600, C.pink, 'BRAIN BREAKS?', 3.2]].forEach(([x, col, lab, d], i) => { const k = bo(R(t, t0 + d, .5)); if (k <= 0) return; lg.save(); lg.translate(x + 185, FY); lg.scale(1, k); lg.translate(-(x + 185), -FY); AD.shape(AD.box(x, 450, 370, FY - 484, 3), col, { seed: 730 + i, t, lw: 5 }); AD.text(lab, x + 185, 540, { f: 'roundX', size: i ? 40 : 50, col: C.ink, align: 'center' }); lg.restore(); });
  if (t > t0 + 1.8) AD.line([[200, 700], [270, 770], [400, 620]], { lw: 16, lc: '#2f7a3a' }); if (t > t0 + 4.6) { lg.save(); lg.translate(785, 700); lg.scale(bo(R(t, t0 + 4.6, .4)), bo(R(t, t0 + 4.6, .4))); AD.plaque(-165, -50, 330, 90, ['still testing'], { size: 40, f: 'round', top: 58, fill: '#fff3c4' }); lg.restore(); }
  kidB(540, FY - 10, .85, t, { per: 2.6 }); }
// M p13: the question: DID YOU BLINK? YES / NO
function sceneM(t) { const t0 = s(13); AD.set('#5d4a7a', '#3a2c46', { fy: FY }); lg.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, FY - 34);
  ransomLine('DID YOU', 400, 110, 61, i => R(t, t0 + i * .04, .25)); ransomLine('BLINK?', 545, 130, 83, i => R(t, t0 + .3 + i * .04, .25));
  AD.plaque(140, 660, 260, 120, ['YES'], { size: 70, f: 'poster', top: 92, fill: '#c6ecc0' }); AD.plaque(680, 660, 260, 120, ['NO'], { size: 70, f: 'poster', top: 92, fill: '#ffc4c4' });
  kidB(400, FY - 10, .6, t, { per: 1.7 }); boxyB(700, FY - 10, .9, t, { per: 2.1 }); }
// N p14: end card on cork; the kid blinks below (loop)
const ENDL = [['FOLLOW', 330], ['FOR MORE OF', 500], ['HOW IT', 680], ['REALLY', 850], ['WORKS.', 1020]];
function sceneN(t) { const t0 = s(14) - .2; cork(t); ENDL.forEach(([w, y], li) => { const sz = li === 1 ? 96 : 130, step = sz * .78, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, 540 - tw / 2 + step / 2 + i * step, y, sz, li * 23 + i * 5 + 3, R(t, t0 + li * .2 + i * .02, .25)); }); });
  AD.text("A new 'wait, really?' every day.", 540, 1180, { f: 'round', size: 46, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.0, .4) });
  AD.text('@howitreallyworkstudio', 540, 1260, { f: 'type', size: 44, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.3, .4) }); }

// ---------- compositor: hard cuts with a short whip blur (demo); the last 0.6 s dissolves into frame 0 (loop) ----------
const SC = [[0, sceneA], [s(2) - .2, sceneB], [s(3) - .2, sceneC], [s(4) - .2, sceneD], [s(5) - .2, sceneE], [s(6) - .2, sceneF], [s(7) - .2, sceneG], [s(8) - .2, sceneH],
  [s(9) - .2, sceneI], [s(10) - .2, sceneJ], [s(11) - .2, sceneK], [s(12) - .2, sceneL], [s(13) - .2, sceneM], [s(14) - .3, sceneN]];
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
function draw(t, cap = true) { const i = idx(t), u = R(t, SC[i][0], .22); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H);
  AD.clear(); SC[i][1](t); AD.blit({ blur: i > 0 && u < 1 ? (1 - u) * 18 : 0, dx: i > 0 && u < 1 ? (1 - eo(u)) * 160 : 0, z: i > 0 && u < 1 ? lerp(1.04, 1, eo(u)) : 1 + .015 * Math.sin(t * .4) });
  if (i === 0) { const d = DIM(t); if (d > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .55 * d; g.fillStyle = '#120c10'; g.fillRect(0, 0, W, H); g.restore(); } }
  wash(); AD.finish(); if (!cap) return; const ph = PH.findLast(p => t >= p.start - .2); if (ph && ph.i < PH.length - 1) caption(ph, t, PH[ph.i + 1].start - .12); }
const LOOP = document.createElement('canvas'); LOOP.width = W; LOOP.height = H;
window.DUR = TOT;
window.seek = t => { const lp = R(t, TOT - .6, .6); if (lp > 0) { draw(0, false); LOOP.getContext('2d').drawImage(g.canvas, 0, 0); }
  draw(t); if (lp > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = ss(lp); g.drawImage(LOOP, 0, 0); g.restore(); } };
window.render = window.seek;
// cover: the big eye half shut + ransom WHY WE BLINK
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); AD.clear(); AD.set('#5d4a7a', '#3a2c46', { fy: 1380 }); lg.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, 1346);
  bigEye(540, 860, 300, 1, .45); kidB(250, 1370, .9, 1, { closed: true }); AD.boxy(830, 1370, 1.0, 1, { mood: 'sleepy' });
  ransomLine('WHY WE', 400, 120, 5, 1); ransomLine('BLINK', 560, 150, 47, 1); AD.blit({}); wash(); AD.finish(); };
window.seek(0); window.ready = true; window.READY = true;
