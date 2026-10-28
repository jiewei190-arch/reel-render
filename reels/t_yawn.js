// t_yawn.js: "Why are yawns contagious?" in template #13 collage "AI Doom" (demo 78), reusing the faces reel's cast and set pieces.
// Demo moves: little paper sets (wall + floor + baseboard), the kid and the orange box creature, museum frames and plaques, chalkboards
// with chalk handwriting, ransom-note cut-out letters, karaoke caption, watercolour mottle, hard cuts with a short whip blur.
// Batch N layout: captions at y 1160-1420, text out of the top 250 px, the bottom 480 px and the right column (x > 900 from y 840);
// a visible change every few seconds; the last 0.6 s dissolves back into frame 0 (loop).
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
// small rhesus monkey (cut-paper, demo has a typewriter monkey): sitting, head turns by look
function monkey(x, y, sc, t, o = {}) { const c = lg; c.save(); c.translate(x, y); c.scale(sc, sc); AD.use(c); const lk = o.look || 0;
  AD.line([[60, -40], [150, -20], [170, -110]], { lw: 12, lc: '#8a5a3a', t });
  AD.shape(AD.poly(0, -110, 95, 115, 24), '#a9744a', { seed: 260, t }); AD.shape(AD.poly(0, -90, 55, 70, 20), '#d8b08a', { seed: 261, t, lw: 3 });
  for (const sd of [-1, 1]) AD.shape(AD.poly(sd * 60, -10, 50, 26, 16), '#a9744a', { seed: 262 + sd, t });
  const hx = lk * 14; AD.shape(AD.poly(hx - 78, -300, 30, 30, 14), '#d8a07a', { seed: 265, t }); AD.shape(AD.poly(hx + 78, -300, 30, 30, 14), '#d8a07a', { seed: 266, t });
  AD.shape(AD.poly(hx, -300, 80, 78, 26), '#a9744a', { seed: 267, t }); AD.shape(AD.poly(hx, -285, 58, 55, 22), '#e2b48e', { seed: 268, t, lw: 3 });
  for (const sd of [-1, 1]) { AD.shape(AD.poly(hx + sd * 24, -305, 14, 15, 12), '#fff', { seed: 269 + sd, lw: 3 }); AD.shape(AD.poly(hx + sd * 24 + lk * 6, -303, 6, 7, 10), C.ink, { line: false, wob: 0 }); }
  AD.shape(AD.poly(hx, -262, 26, 14, 14), '#c98f6a', { seed: 272, lw: 3 }); AD.line([[hx - 4, -264], [hx - 4, -262]], { lw: 3, wob: 0 }); AD.line([[hx + 4, -264], [hx + 4, -262]], { lw: 3, wob: 0 });
  c.restore(); AD.use(lg); }
function cork(t) { const c = lg; c.fillStyle = '#b98c5a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${hash(i) > .5 ? '90,55,25' : '230,190,140'},${.15 + hash(i * 3) * .25})`; c.fillRect(hash(i * 5) * W, hash(i * 7) * H, 3 + hash(i * 9) * 5, 2 + hash(i * 11) * 4); }
  AD.shape(AD.box(30, 30, W - 60, H - 60, 4), null, { lw: 22, lc: '#7a5232', wob: 1 }); }
// the "face detector": a lab cabinet with a dial, a lamp and a slot (box creature operates it)
function detector(x, y, t, o = {}) { AD.shape(AD.box(x, y, 520, 420, 4), '#6d8a8c', { seed: 280, t, lw: 5 }); AD.shape(AD.box(x + 20, y + 20, 480, 70, 3), '#3a4a4c', { seed: 281, t, lw: 3 });
  AD.text('FACE DETECTOR', x + 260, y + 72, { f: 'type', size: 44, col: '#e8f0e0', align: 'center' });
  const on = o.lamp ?? 1; AD.shape(AD.poly(x + 110, y + 190, 58, 58, 20), on > .5 ? '#ff5a3a' : '#7a3a30', { seed: 282, t, lw: 4 });
  if (on > .5) { lg.save(); lg.globalAlpha = .35; AD.shape(AD.poly(x + 110, y + 190, 92, 92, 20), '#ffb04a', { line: false, wob: 0 }); lg.restore(); }
  AD.text(o.lampLab || 'FACE!', x + 110, y + 300, { f: 'roundX', size: 40, col: '#fff', align: 'center', outline: 6, a: on });
  AD.shape(AD.poly(x + 360, y + 220, 100, 100, 30), '#f3ead6', { seed: 283, t, lw: 4 }); const v = o.dial ?? .5;
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (.8 + i / 10 * 1.4); AD.line([[x + 360 + Math.cos(a) * 78, y + 220 + Math.sin(a) * 78], [x + 360 + Math.cos(a) * 92, y + 220 + Math.sin(a) * 92]], { lw: 3, wob: 0 }); }
  const a = Math.PI * (.8 + v * 1.4); AD.line([[x + 360, y + 220], [x + 360 + Math.cos(a) * 80, y + 220 + Math.sin(a) * 80]], { lw: 7, lc: C.red, wob: 0 });
  AD.text(o.dialLab || 'SENSITIVITY', x + 360, y + 360, { f: 'type', size: 30, col: '#f3ead6', align: 'center' }); }

function brain(cx, cy, sc, t, hot) { const c = lg; c.save(); c.translate(cx, cy); c.scale(sc, sc); AD.use(c);
  AD.shape(AD.poly(0, 0, 300, 220, 36), 'rgba(255,255,255,.08)', { seed: 340, t, lc: '#eaf2ff', lw: 5 });
  [[-150, -60, 90], [-20, -120, 110], [120, -40, 100], [-80, 80, 90], [90, 100, 80]].forEach(([a, b, r], i) => AD.line(AD.poly(a, b, r * .6, r * .35, 14, i).slice(0, 10), { lc: 'rgba(234,242,255,.6)', lw: 3, t }));
  AD.shape([[60, 200], [120, 200], [110, 300], [70, 300]], 'rgba(255,255,255,.08)', { seed: 341, t, lc: '#eaf2ff', lw: 4 });
  if (hot > 0) { c.globalAlpha = hot; AD.shape(AD.poly(140, 130, 70, 40, 18), '#ffcf4a', { seed: 342, t, lc: '#fff', lw: 3 }); AD.shape(AD.poly(220, 60, 50, 32, 16), '#ff8a4a', { seed: 343, t, lc: '#fff', lw: 3 }); c.globalAlpha = 1; }
  c.restore(); AD.use(lg); }

// ---------- yawn pieces ----------
// a huge yawn over the kid's face (eyes squeezed, big oval mouth, arms up). k 0..1 = how open
function kidYawn(x, y, sc, t, k, o = {}) { AD.kid(x, y, sc, t, { mood: k > .3 ? 'closed' : (o.mood || 'smile'), arm: k > .4 ? 'up' : (o.arm || 'down'), flip: o.flip, look: o.look });
  if (k > .05) { const c = lg; c.save(); c.translate(x, y); c.scale(sc * (o.flip ? -1 : 1), sc); AD.use(c); AD.shape(AD.poly(0, -368, 14 + 18 * k, 8 + 26 * k, 20), '#5a2018', { seed: 400, t, lw: 4 });
    if (k > .5) AD.shape(AD.poly(0, -356 + 6 * k, 10 * k, 5 * k, 12), '#d97a7a', { line: false, wob: 0 }); c.restore(); AD.use(lg);
    for (let i = 0; i < 3; i++) { const u = ((t * .7 + i / 3) % 1); AD.text('z', x + sc * 120 + i * 24, y - sc * 520 - u * 90, { f: 'roundX', size: 34 + i * 6, col: C.ink, a: k * (1 - u) }); } } }
// sitting paper dog; yawn 0..1
function dog(x, y, sc, t, o = {}) { const c = lg; c.save(); c.translate(x, y); c.scale(sc * (o.flip ? -1 : 1), sc); AD.use(c); const k = o.yawn || 0;
  AD.shape(AD.poly(0, -120, 110, 120, 24), '#c9945a', { seed: 410, t }); AD.shape(AD.poly(-20, -90, 60, 70, 20), '#ecd2a8', { seed: 411, t, lw: 3 });
  for (const sd of [-1, 1]) AD.shape(AD.poly(sd * 60, -10, 46, 22, 14), '#c9945a', { seed: 412 + sd, t });
  AD.line([[100, -60], [170, -80], [190, -140 + Math.sin(t * 8) * 20]], { lw: 14, lc: '#a8743a', t });
  const hy = -300; AD.shape(AD.poly(0, hy, 95, 85, 26), '#c9945a', { seed: 415, t });
  for (const sd of [-1, 1]) AD.shape([[sd * 70, hy - 60], [sd * 120, hy - 10], [sd * 105, hy + 60], [sd * 72, hy + 10]], '#7a4e2a', { seed: 416 + sd, t });
  AD.shape(AD.poly(0, hy + 40, 52, 36 + 30 * k, 18), '#ecd2a8', { seed: 419, t, lw: 3 }); AD.shape(AD.poly(0, hy + 14, 16, 11, 12), C.ink, { line: false, wob: 0 });
  if (k > .1) AD.shape(AD.poly(0, hy + 52 + 10 * k, 22 * k + 6, 30 * k, 16), '#7a2a20', { seed: 420, lw: 3 });
  for (const sd of [-1, 1]) { if (k > .4) AD.line([[sd * 36 - 12, hy - 22], [sd * 36, hy - 16], [sd * 36 + 12, hy - 22]], { lw: 4, wob: 0 }); else AD.shape(AD.poly(sd * 36, hy - 20, 10, 12, 10), C.ink, { line: false, wob: 0 }); }
  c.restore(); AD.use(lg); }
// old TV set on a stand with a small picture drawn by fn()
function tv(x, y, w, h, t, fn) { AD.shape(AD.rbox(x - 20, y - 20, w + 40, h + 40, 26), '#8a5a35', { seed: 430, t, lw: 5 }); AD.shape(AD.rbox(x, y, w, h, 18), '#2b3a3a', { seed: 431, t, lw: 4 });
  lg.save(); lg.beginPath(); lg.rect(x + 6, y + 6, w - 12, h - 12); lg.clip(); fn(); lg.restore();
  lg.save(); lg.globalAlpha = .12; lg.fillStyle = '#fff'; for (let yy = y; yy < y + h; yy += 8) lg.fillRect(x, yy, w, 2); lg.restore();
  AD.line([[x + w * .3, y + h + 20], [x + w * .2, y + h + 120]], { lw: 8 }); AD.line([[x + w * .7, y + h + 20], [x + w * .8, y + h + 120]], { lw: 8 }); }
// thermometer card
function thermo(x, y, v, t, col) { AD.shape(AD.rbox(x - 22, y, 44, 300, 22), '#f6f0e2', { seed: 440, t, lw: 4 }); AD.shape(AD.poly(x, y + 320, 40, 40, 18), col, { seed: 441, t, lw: 4 });
  AD.shape(AD.box(x - 10, lerp(y + 300, y + 20, v), 20, lerp(0, 280, v), 2), col, { line: false, wob: 0 }); }
// cold pack (blue gel bag with frost marks)
function icepack(x, y, sc, t) { AD.shape(AD.rbox(x - 70 * sc, y - 34 * sc, 140 * sc, 68 * sc, 20 * sc), '#8fd0f0', { seed: 450, t, lw: 4 }); AD.text('*', x - 30 * sc, y + 14 * sc, { f: 'roundX', size: 40 * sc, col: '#fff' }); AD.text('*', x + 24 * sc, y + 6 * sc, { f: 'roundX', size: 30 * sc, col: '#fff' }); }
// chalk bar (bar chart on the chalkboard), grows to v (0..1 of the max height)
function chalkBar(x, base, w, hmax, v, col, lab, val, t) { AD.shape(AD.box(x, base - hmax * v, w, hmax * v, 3), col, { seed: 460 + x, t, lc: '#f3efe0', lw: 4 });
  AD.text(val, x + w / 2, base - hmax * v - 24, { f: 'hand', size: 72, col: '#f3efe0', align: 'center', a: v > .1 ? 1 : 0 }); AD.text(lab, x + w / 2, base - 18, { f: 'hand', size: 40, col: '#1b1410', align: 'center', a: v > .15 ? 1 : 0 }); }
// a yawn "wave" (wavy line with an arrow head) from a to b; k = how far it travelled; w = thickness
function yawnWave(x0, y0, x1, y1, k, w, t, col = C.orange) { if (k <= 0) return; const pts = []; const n = 24; for (let i = 0; i <= n * k; i++) { const u = i / n; pts.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * 14 - t * 6) * 16]); }
  AD.line(pts, { lw: w, lc: col, wob: 0 }); }
// karaoke caption in the Batch N band (y about 1160-1420)
function caption(ph, t, out) { if (!ph) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const size = 54; c.font = AD.font('roundX', size, 800); const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  const tot = ws.reduce((a, w) => a + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = c.measureText(w.w).width; });
  const lines = [[]]; let lw = 0; const sp = c.measureText(' ').width; ws.forEach(w => { if (lw + w.ww > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const a = clamp((t - ph.start + .2) / .2) * (out != null ? clamp((out - t) / .2) : 1), lh = size * 1.2, y0 = 1300 - (lines.length - 1) * lh / 2 + size * .35;
  const bh = lines.length * lh + 50; c.globalAlpha = a * .62; c.fillStyle = '#1b1410'; c.beginPath(); c.roundRect(60, y0 - size * .95 - 6, W - 120, bh, 26); c.fill();
  lines.forEach((ln, li) => { const w = ln.reduce((s2, x) => s2 + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { c.globalAlpha = a; c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = '#1b1410'; c.strokeText(wd.w, x, y0 + li * lh);
    c.fillStyle = t >= wd.t0 ? (wd.hl ? '#ffd24d' : '#fff7e6') : 'rgba(255,247,230,.55)'; c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  c.restore(); }

// ---------- scenes ----------
// A p0-1: frame 0 = the kid mid-yawn, the box creature catching it; ransom title; p1 the search question chalked on the wall
function sceneA(t) { AD.set('#5d4a7a', '#3a2c46', { fy: FY }); lg.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, FY - 34);
  const k1 = .55 + .45 * Math.sin(Math.min(t, 2.6) * 1.2 + .9), k2 = ss(R(t, 1.4, 1.2)) * (t < s(1) + 2 ? 1 : .5 + .5 * Math.sin(t * 2));
  kidYawn(330, FY - 10, 1.15, t, Math.max(.15, k1)); AD.boxy(770, FY - 10, 1.4, t, { mood: k2 > .5 ? 'sleepy' : 'o', hop: t < 1.4 ? t * .8 : 0 });
  if (k2 > .3) { const c = lg; c.save(); AD.shape(AD.poly(770, FY - 10 - 64 * 1.4, 14 + 22 * k2, 10 + 30 * k2, 16), '#7a2a20', { seed: 401, lw: 3 }); c.restore(); }
  yawnWave(450, 560, 690, 760, clamp(t / 1.2), 8, t);
  ransomLine('YAWNS', 320, 104, 3, i => R(t, -1 + i * .05, .2), 560); ransomLine('SPREAD?', 440, 104, 41, i => R(t, -1 + i * .05, .2), 560);
  if (t > s(1)) { const k = R(t, s(1) + .2, 1.6); AD.plaque(460, 520, 420, 150, ['Why are yawns', 'contagious?'], { size: 46, f: 'round', t, top: 64, lh: 56 }); lg.save(); lg.globalAlpha = 1 - k; lg.fillStyle = '#5d4a7a'; lg.fillRect(450, 510, 440 * (1 - k), 170); lg.restore(); } }
// B p2: thinking about yawning: thought bubble with a yawning face; plaque
function sceneB(t) { const t0 = s(2); AD.set('#e6c9a8', C.floor, { fy: FY }); bubble(560, 520, 260, 170, t, bo(R(t, t0 + .2, .5)));
  if (t > t0 + .5) { AD.shape(AD.poly(560, 520, 90, 90, 24), C.skin, { seed: 470, t }); for (const sd of [-1, 1]) AD.line([[560 + sd * 34 - 14, 492], [560 + sd * 34, 500], [560 + sd * 34 + 14, 492]], { lw: 5, wob: 0 }); AD.shape(AD.poly(560, 548, 26, 34 + 8 * Math.sin(t * 3), 16), '#7a2a20', { seed: 471, lw: 3 }); }
  const k = ss(R(t, t0 + 1.8, .9)) * (.6 + .4 * Math.sin((t - t0) * 1.5)); kidYawn(300, FY - 10, 1.3, t, k, { look: 1 });
  AD.plaque(560, 760, 420, 170, ['just THINKING', 'about yawns'], { size: 44, f: 'round', t, top: 70, lh: 56 }); AD.text('one study', 770, 980, { f: 'hand', size: 50, col: C.ink, align: 'center', a: R(t, t0 + 2.4, .4) }); }
// C p3: anatomy of a yawn on the chalkboard: three steps light up in turn
function sceneC(t) { const t0 = s(3); AD.set('#efd9a8', C.floor, { fy: FY }); AD.chalkboard(90, 280, 900, 560, t);
  const steps = [['1  BREATHE IN', t0 + .2], ['2  JAW STRETCH', t0 + 1.4], ['3  BREATHE OUT', t0 + 2.6]];
  steps.forEach(([lab, ts], i) => AD.text(lab, 150, 400 + i * 150, { f: 'hand', size: 70, col: t > ts ? '#ffe9a0' : 'rgba(243,239,224,.35)', write: R(t, ts, .6) }));
  const ph = t < t0 + 1.4 ? 0 : t < t0 + 2.6 ? 1 : 2; const k = ph === 1 ? 1 : ph === 0 ? .4 : .2; kidYawn(820, FY - 10, .95, t, k, { look: -1 });
  if (ph === 0) for (let i = 0; i < 3; i++) yawnWave(620, 900 + i * 30, 760, 940, R(t, t0 + .3 + i * .1, .6), 6, t, '#8fd0f0'); }
// D p4: re-hook: "not just a human thing": gallery with 3 frames (human, dog, chimp)
function sceneD(t) { const t0 = s(4); AD.set('#dfe8c8', '#b9a47e', { fy: FY }); AD.text('NOT JUST HUMANS', 540, 330, { f: 'roundX', size: 74, col: C.ink, align: 'center', write: R(t, t0, .8) });
  [[100, 'kid'], [400, 'dog'], [700, 'chimp']].forEach(([x, who], i) => { const k = bo(R(t, t0 + .3 + i * .5, .5)); if (k <= 0) return; lg.save(); lg.translate(x + 140, 640); lg.scale(k, k); lg.translate(-(x + 140), -640);
    frame(x, 470, 280, 340, t, () => { if (who === 'kid') kidYawn(x + 140, 790, .55, t, .8 + .2 * Math.sin(t * 2)); else if (who === 'dog') dog(x + 140, 790, .6, t, { yawn: .5 + .5 * Math.sin(t * 2.2) }); else monkey(x + 140, 790, .62, t, {}); }, {});
    lg.restore(); }); rope(940, 120, 960 - 60, t); }
// E p5: the dog study: a dog catches the kid's yawn; 29 dog tokens, 21 light up; "later studies: mixed"
function sceneE(t) { const t0 = s(5); AD.set('#f2d6d0', C.floor, { fy: FY }); AD.plaque(160, 270, 520, 90, ['Joly-Mascheroni et al., 2008'], { size: 34, top: 58 });
  kidYawn(250, FY - 10, 1.0, t, .3 + .7 * ss(R(t, t0, 1)) * (t < t0 + 3 ? 1 : .5)); dog(680, FY - 10, 1.05, t, { yawn: ss(R(t, t0 + 1.4, .8)) * (.6 + .4 * Math.sin(t * 2)), flip: true }); yawnWave(330, 640, 600, 760, R(t, t0 + .6, .9), 7, t);
  for (let i = 0; i < 29; i++) { const cx = 140 + (i % 10) * 70, cy = 430 + Math.floor(i / 10) * 64, on = i < 21 && t > t0 + 1.6 + i * .05; AD.shape(AD.poly(cx, cy, 24, 22, 12), on ? C.orange : '#e9dcc8', { seed: 480 + i, lw: 3 }); }
  AD.text('21 / 29', 860, 480, { f: 'poster', size: 80, col: C.red, align: 'center', a: R(t, t0 + 2.8, .4) });
  if (t > t0 + 4.2) AD.plaque(560, 650, 330, 90, ['later: mixed'], { size: 40, f: 'round', top: 58, fill: '#fff3c4' }); }
// F p6: chimpanzees watching a yawning chimp on TV
function sceneF(t) { const t0 = s(6); AD.set('#cfe3dc', '#9fb08e', { fy: FY }); AD.plaque(220, 270, 640, 90, ['Anderson et al., 2004'], { size: 36, top: 58 });
  tv(300, 400, 480, 340, t, () => { lg.fillStyle = '#bfd6a0'; lg.fillRect(300, 400, 480, 340); monkey(540, 740, .82, t, {}); const k = .5 + .5 * Math.sin(t * 2.4); AD.shape(AD.poly(540, 740 - 262 * .82 + 18, 16 + 14 * k, 8 + 24 * k, 14), '#7a2a20', { lw: 3 }); });
  monkey(250, FY - 10, .95, t, { look: .8 }); const k2 = ss(R(t, t0 + 1.8, .8)) * (.6 + .4 * Math.sin(t * 2)); if (k2 > .05) AD.shape(AD.poly(250 + 11, FY - 10 - 262 * .95 + 20, 14 + 14 * k2, 8 + 26 * k2, 14), '#7a2a20', { lw: 3 });
  AD.text('some chimps', 690, 980, { f: 'hand', size: 56, col: C.ink, align: 'center', a: R(t, t0 + 2.6, .4) }); }
// G p7: two big ideas: two doors
function sceneG(t) { const t0 = s(7); AD.set('#efd9a8', C.floor, { fy: FY }); AD.text('TWO BIG IDEAS', 540, 330, { f: 'roundX', size: 80, col: C.ink, align: 'center', write: R(t, t0, .7) });
  [[150, '1', 'COOLING', '#8fd0f0'], [570, '2', 'SOCIAL', C.pink]].forEach(([x, n, lab, col], i) => { const k = bo(R(t, t0 + .4 + i * .6, .5)); if (k <= 0) return; lg.save(); lg.translate(x + 180, FY); lg.scale(1, k); lg.translate(-(x + 180), -FY);
    AD.shape(AD.box(x, 440, 360, FY - 440 - 34, 3), col, { seed: 490 + i, t, lw: 5 }); AD.shape(AD.poly(x + 300, 780, 16, 16, 12), C.yellow, { seed: 495 + i }); AD.text(n, x + 180, 600, { f: 'poster', size: 140, col: C.ink, align: 'center' }); AD.text(lab, x + 180, 740, { f: 'roundX', size: 54, col: C.ink, align: 'center' }); lg.restore(); });
  AD.boxy(540, FY - 10, .9, t, { mood: 'o', hop: t * .5 }); }
// H p8: brain cooling: a brain with radiator fins; cool air arrows into a yawning mouth; thermometer drops
function sceneH(t) { const t0 = s(8), c = lg; c.fillStyle = '#2c5aa0'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  AD.text('IDEA 1: BRAIN COOLING', 540, 330, { f: 'type', size: 54, col: '#eaf2ff', align: 'center', write: R(t, t0, .8) });
  const cool = ss(R(t, t0 + 2.4, 2.4)); brain(470, 640, .9, t, 1 - cool);
  for (let i = 0; i < 6; i++) { const x = 230 + i * 70; AD.shape(AD.box(x, 860, 40, 200, 2), '#cfd8e6', { seed: 500 + i, lc: '#eaf2ff', lw: 3 }); }   // radiator fins
  AD.text('radiator', 420, 1100, { f: 'hand', size: 54, col: '#eaf2ff', align: 'center', a: R(t, t0 + 3.6, .4) });
  thermo(820, 520, lerp(.85, .35, cool), t, cool > .5 ? '#8fd0f0' : '#ff8a4a'); for (let i = 0; i < 4; i++) yawnWave(560, 400 + i * 40, 760, 520 + i * 30, R(t, t0 + 1.2 + i * .15, .8), 6, t, '#bfe8ff'); }
// I p9: the cold-pack experiment: two kids, one with a cold pack; chalk bars 41% vs 9%
function sceneI(t) { const t0 = s(9); AD.set('#cfe3dc', C.floor, { fy: FY }); AD.plaque(220, 270, 640, 90, ['Gallup & Gallup, 2007'], { size: 36, top: 58 });
  AD.chalkboard(110, 400, 860, 420, t); chalkBar(260, 760, 180, 300, ss(R(t, t0 + 2.4, 1.2)) * 1, C.orange, 'warm pack', '41%', t); chalkBar(620, 760, 180, 300, ss(R(t, t0 + 4.4, 1.0)) * (9 / 41), '#8fd0f0', 'cold pack', '9%', t);
  kidYawn(160, FY - 10, .5, t, .5 + .5 * Math.sin(t * 2)); kidYawn(920 - 60, FY - 10, .5, t, .1, { look: -1 }); icepack(860, FY - 10 - 470 * .5, .6, t); }
// J p10: social: the yawn passes along family > friends > strangers with a thinning wave
function sceneJ(t) { const t0 = s(10); AD.set('#f0e1b8', C.floor, { fy: FY }); AD.plaque(220, 270, 640, 90, ['Norscia & Palagi, 2011'], { size: 36, top: 58 });
  const who = [[150, 'FAMILY', 1.0, C.orange], [440, 'FRIENDS', .8, C.yellow], [730, 'STRANGERS', .6, '#c8c0b0']];
  who.forEach(([x, lab, sc, col], i) => { const k = R(t, t0 + 1.2 + i * 1.2, .5); if (k <= 0) return; kidYawn(x, FY - 10, .75 * sc + .2, t + i, (i === 0 ? 1 : .8 - i * .25) * (.6 + .4 * Math.sin(t * 2 + i)), { look: 1 });
    AD.plaque(x - 120, 440, 240, 80, [lab], { size: 34, f: 'roundX', top: 52, fill: col }); });
  yawnWave(240, 620, 380, 640, R(t, t0 + 1.8, .8), 14, t); yawnWave(530, 640, 660, 660, R(t, t0 + 3, .8), 7, t); }
// K p11: contested: the empathy heart gets a CONTESTED stamp; 328 people dot grid, sorted by age
function sceneK(t) { const t0 = s(11); AD.set('#e9dcc0', '#c8b08a', { fy: FY }); AD.plaque(160, 270, 640, 90, ['Bartholomew & Cirulli, 2014'], { size: 34, top: 58 });
  const hk = bo(R(t, t0, .5)); AD.shape([[540, 560 + 0], [430, 470], [470, 400], [540, 440], [610, 400], [650, 470]].map(([x, y]) => [lerp(540, x, hk), lerp(480, y, hk)]), C.pink, { seed: 510, t, lw: 5 });
  AD.text('EMPATHY?', 540, 640, { f: 'roundX', size: 50, col: C.ink, align: 'center', a: hk });
  if (t > t0 + .8) { const k = bo(R(t, t0 + .8, .35)); lg.save(); lg.translate(540, 480); lg.rotate(-.18); lg.scale(k, k); AD.shape(AD.box(-230, -50, 460, 100, 3), null, { lc: C.red, lw: 8, wob: 1 }); AD.text('CONTESTED', 0, 28, { f: 'poster', size: 80, col: C.red, align: 'center' }); lg.restore(); }
  const sortK = ss(R(t, t0 + 3.6, 1.6)); for (let i = 0; i < 328; i++) { const col0 = i % 41, row = Math.floor(i / 41), ag = hash(i * 3.3); const x0 = 120 + col0 * 20, y0 = 720 + row * 22, x1 = 120 + Math.floor(ag * 41) * 20, y1 = y0;
    const yawned = ag < .55 + (1 - ag) * .2 ? hash(i * 7.1) < 1 - ag * .6 : false; lg.fillStyle = t > t0 + 2 + i * .004 ? (yawned ? C.orange : '#6b5a4a') : 'rgba(0,0,0,0)'; lg.beginPath(); lg.arc(lerp(x0, x1, sortK), y1, 7, 0, TAU); lg.fill(); }
  AD.text('young', 160, 940, { f: 'hand', size: 44, col: C.ink, a: sortK }); AD.text('older', 760, 940, { f: 'hand', size: 44, col: C.ink, a: sortK }); AD.text('tracks AGE', 540, 1040, { f: 'roundX', size: 56, col: C.red, align: 'center', a: R(t, t0 + 5, .5) }); }
// L p12: payoff: both doors open together; the kid between them with a thermometer and a heart; "still testing"
function sceneL(t) { const t0 = s(12); AD.set('#efd9a8', C.floor, { fy: FY }); AD.text('BOTH, MAYBE.', 540, 330, { f: 'roundX', size: 84, col: C.ink, align: 'center', write: R(t, t0 + .2, .7) });
  const op = ss(R(t, t0 + .6, 1.2)); [[110, '#8fd0f0', 'COOLING'], [650, C.pink, 'SOCIAL']].forEach(([x, col, lab], i) => { AD.shape(AD.box(x, 440, 320, FY - 474, 3), col, { seed: 520 + i, t, lw: 5 }); AD.text(lab, x + 160, 520, { f: 'roundX', size: 46, col: C.ink, align: 'center' }); });
  kidYawn(540, FY - 10, 1.05, t, op * (.6 + .4 * Math.sin(t * 2))); thermo(350, 600, .4, t, '#8fd0f0'); AD.shape([[730, 720], [690, 680], [705, 650], [730, 668], [755, 650], [770, 680]], C.pink, { seed: 525, t, lw: 4 });
  if (t > t0 + 3) { const k = bo(R(t, t0 + 3, .4)); lg.save(); lg.translate(540, 980); lg.scale(k, k); AD.plaque(-200, -60, 400, 100, ['still testing'], { size: 46, f: 'round', top: 64, fill: '#fff3c4' }); lg.restore(); } }
// M p13: the question: DID YOU YAWN? YES / NO; the kid yawns again (sets up the loop)
function sceneM(t) { const t0 = s(13); AD.set('#5d4a7a', '#3a2c46', { fy: FY }); lg.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, FY - 34);
  ransomLine('DID YOU', 330, 110, 61, i => R(t, t0 + i * .04, .25)); ransomLine('YAWN?', 470, 130, 83, i => R(t, t0 + .3 + i * .04, .25));
  AD.plaque(160, 600, 260, 120, ['YES'], { size: 70, f: 'poster', top: 92, fill: '#c6ecc0' }); AD.plaque(560, 600, 260, 120, ['NO'], { size: 70, f: 'poster', top: 92, fill: '#ffc4c4' });
  kidYawn(330, FY - 10, .9, t, .5 + .5 * Math.sin((t - t0) * 2)); AD.boxy(720, FY - 10, 1.1, t, { mood: 'sleepy' }); }
// N p14: end card on cork (ransom letters) + the standard second line + handle; the kid starts the next yawn (loop)
const ENDL = [['FOLLOW', 330], ['FOR MORE OF', 500], ['HOW IT', 680], ['REALLY', 850], ['WORKS.', 1020]];
function sceneN(t) { const t0 = s(14) - .2; cork(t); ENDL.forEach(([w, y], li) => { const sz = li === 1 ? 96 : 130, step = sz * .78, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, 540 - tw / 2 + step / 2 + i * step, y, sz, li * 23 + i * 5 + 3, R(t, t0 + li * .2 + i * .02, .25)); }); });
  AD.text("A new 'wait, really?' every day.", 540, 1150, { f: 'round', size: 46, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.0, .4) });
  AD.text('@howitreallyworkstudio', 540, 1230, { f: 'type', size: 44, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.3, .4) }); kidYawn(250, 1690, .55, t, .3 + .3 * Math.sin(t * 2)); AD.boxy(780, 1690, .7, t, { mood: 'sleepy' }); }

// ---------- compositor: hard cuts with a short whip blur (demo); the last 0.6 s dissolves into frame 0 (loop) ----------
const SC = [[0, sceneA], [s(2) - .2, sceneB], [s(3) - .2, sceneC], [s(4) - .2, sceneD], [s(5) - .2, sceneE], [s(6) - .2, sceneF], [s(7) - .2, sceneG], [s(8) - .2, sceneH],
  [s(9) - .2, sceneI], [s(10) - .2, sceneJ], [s(11) - .2, sceneK], [s(12) - .2, sceneL], [s(13) - .2, sceneM], [s(14) - .3, sceneN]];
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
function draw(t, cap = true) { const i = idx(t), u = R(t, SC[i][0], .22); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H);
  AD.clear(); SC[i][1](t); AD.blit({ blur: i > 0 && u < 1 ? (1 - u) * 18 : 0, dx: i > 0 && u < 1 ? (1 - eo(u)) * 160 : 0, z: i > 0 && u < 1 ? lerp(1.04, 1, eo(u)) : 1 + .015 * Math.sin(t * .4) });
  wash(); AD.finish(); if (!cap) return; const ph = PH.findLast(p => t >= p.start - .2); if (ph && ph.i < PH.length - 1) caption(ph, t, PH[ph.i + 1].start - .12); }
const LOOP = document.createElement('canvas'); LOOP.width = W; LOOP.height = H;
window.DUR = TOT;
window.seek = t => { const lp = R(t, TOT - .6, .6); if (lp > 0) { draw(0, false); LOOP.getContext('2d').drawImage(g.canvas, 0, 0); }
  draw(t); if (lp > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = ss(lp); g.drawImage(LOOP, 0, 0); g.restore(); } };
window.render = window.seek;
// cover: the kid mid-yawn on the purple set + ransom "WHY YAWNS SPREAD"
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); AD.clear(); AD.set('#5d4a7a', '#3a2c46', { fy: 1380 }); lg.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, 1346);
  kidYawn(330, 1370, 1.3, 1, 1); AD.boxy(780, 1370, 1.3, 1, { mood: 'sleepy' }); AD.shape(AD.poly(780, 1370 - 64 * 1.3, 34, 36, 16), '#7a2a20', { lw: 3 }); yawnWave(450, 820, 700, 1000, 1, 8, 1);
  ransomLine('WHY YAWNS', 400, 120, 5, 1); ransomLine('SPREAD', 570, 140, 47, 1); AD.blit({}); wash(); AD.finish(); };
window.seek(0); window.ready = true; window.READY = true;
