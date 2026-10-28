// t_sneeze.js: "Why do we sneeze?" in template #13 collage "AI Doom" (demo 78). Canvas2D 1080x1920, pure function of t.
// Demo moves reused (via styles/aidoom/aidoom.js): little paper sets (wall + floor + baseboard), the spiky-haired kid and the orange box
// creature, museum plaques and velvet rope, chalkboards with chalk handwriting, a lab panel with lamps, a theatre curtain, ransom-note
// letters; watercolour mottle inside the flat fills; hard cuts with a short whip blur. Batch N layout: titles y >= 278, the karaoke caption
// sits on a dark band at y 1150-1360 (left-aligned, x 90-880), nothing written in the bottom 480 px or the right column below y 840.
import { createAD, W, H, TAU, C, clamp, lerp, ramp, ss, eo, bo, hash, FONTS } from './styles/aidoom/aidoom.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total, N = PH.length;
const AD = createAD(document.getElementById('c')), g = AD.g, lg = AD.lg, R = ramp;
const mot = document.createElement('canvas'); mot.width = W; mot.height = H; { const m = mot.getContext('2d'); m.fillStyle = '#fff'; m.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) { const x = hash(i * 4.1) * W, y = hash(i * 5.3) * H, r = 60 + hash(i * 6.7) * 220, rg = m.createRadialGradient(x, y, 0, x, y, r); const d = 200 + hash(i * 8.9) * 40;
    rg.addColorStop(0, `rgba(${d},${d - 18},${d - 40},.22)`); rg.addColorStop(1, 'rgba(255,255,255,0)'); m.fillStyle = rg; m.fillRect(x - r, y - r, 2 * r, 2 * r); } }
const wash = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.drawImage(mot, 0, 0); g.restore(); };
const ransomLine = (w, y, sz, seed, k = 1, x0 = 540) => { const step = sz * .74, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, x0 - tw / 2 + step / 2 + i * step, y, sz, seed + i * 7, typeof k === 'function' ? k(i) : k); }); };
const pop = (t, t0, n, gap = .07) => i => bo(R(t, t0 + i * gap, .22));
const FY = 1140;                                     // floor line: the caption band sits on the floor
const set = (wall, floor = '#b98a5a') => { AD.set(wall, floor, { fy: FY }); lg.strokeStyle = 'rgba(60,35,20,.35)'; lg.lineWidth = 3; for (let y = FY + 90; y < H; y += 120) { lg.beginPath(); lg.moveTo(0, y); lg.lineTo(W, y); lg.stroke(); }
  for (let i = 0; i < 9; i++) { const y = FY + 30 + Math.floor(i / 3) * 120, x = 80 + hash(i) * 900; lg.beginPath(); lg.moveTo(x, y + 30); lg.lineTo(x, y + 150); lg.stroke(); } };

// ---------- props ----------
function flowers(t, y0 = FY - 34) { for (let i = 0; i < 9; i++) { const x = 60 + i * 120 + (hash(i) - .5) * 30, h = 150 + hash(i * 3) * 120, sw = Math.sin(t * 1.4 + i) * 6;
  AD.line([[x, y0], [x + sw, y0 - h]], { lw: 5, lc: '#4f7a3a', seed: 300 + i, t }); for (let p = 0; p < 6; p++) { const a = p / 6 * TAU; AD.shape(AD.poly(x + sw + Math.cos(a) * 26, y0 - h + Math.sin(a) * 26, 18, 18, 10), ['#f2a7b8', '#f5c518', '#ffffff'][i % 3], { seed: 310 + i * 7 + p, t, lw: 3 }); }
  AD.shape(AD.poly(x + sw, y0 - h, 16, 16, 12), '#e8734a', { seed: 380 + i, t, lw: 3 }); } }
function pollen(x, y, r, t, sd = 1) { const P = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .5, rr = i % 2 ? r : r * .7; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } AD.shape(P, '#f5c518', { seed: 400 + sd, t, lw: 3 }); }
function dust(x, y, r, t, sd = 1) { AD.shape(AD.poly(x, y, r, r * .8, 9, sd), '#a89f92', { seed: 420 + sd, t, lw: 3, wob: 5 }); }
function germ(x, y, r, t, sd = 1) { const P = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, rr = r * (1 + .14 * Math.sin(a * 5 + t * 3)); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } AD.shape(P, '#7cc36d', { seed: 440 + sd, t, lw: 3.5 });
  for (const ex of [-.3, .3]) AD.shape(AD.poly(x + ex * r, y - .15 * r, r * .16, r * .2, 10), '#fff', { seed: 460 + sd, lw: 2.5 }); AD.line([[x - .25 * r, y + .3 * r], [x, y + .4 * r], [x + .25 * r, y + .3 * r]], { lw: 3, wob: 0 }); }
function bits(x, y, k, t, sd = 1) { const i = sd % 3; if (i === 0) pollen(x, y, 22 * k, t, sd); else if (i === 1) dust(x, y, 18 * k, t, sd); else germ(x, y, 22 * k, t, sd); }
// big cut-paper face profile on the left edge, looking right; nostril at (NX, NY)
const NX = 455, NY = 735;
function profile(t, o = {}) { const P = [[-40, 260], [210, 270], [300, 360], [330, 470], [350, 560], [470, 700], [480, 748], [430, 765], [400, 790], [420, 830], [390, 900], [420, 950], [380, 1010], [330, 1060], [300, 1140], [-40, 1140]];
  AD.shape(P, C.skin, { seed: 500, t, lw: 5 }); AD.shape(AD.poly(NX - 22, NY + 12, 26, 13, 16, -.3), '#5a2a22', { seed: 501, t, lw: 3 }); AD.shape(AD.poly(230, 560, 34, o.eyeShut ? 4 : 22, 16), o.eyeShut ? C.ink : '#fbf7ef', { seed: 502, t, lw: 4 });
  if (!o.eyeShut) AD.shape(AD.poly(244, 562, 10, 12, 12), C.ink, { line: false, wob: 0 }); AD.shape([[-40, 240], [180, 230], [290, 330], [250, 300], [120, 300], [-40, 330]], C.hair, { seed: 503, t, wob: 3 });
  AD.line([[180, 520], [270, 505]], { lw: 5, seed: 504, t }); }
function chalkLine(P, k, o = {}) { if (k <= 0) return; const n = Math.max(2, Math.ceil(P.length * clamp(k))); lg.save(); lg.globalAlpha = .9; lg.strokeStyle = o.col || '#f2efe4'; lg.lineWidth = o.w || 7; lg.lineCap = 'round'; lg.lineJoin = 'round'; lg.setLineDash(o.dash || []);
  lg.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = P[i]; const j = (hash(i * 3.1 + (o.seed || 0)) - .5) * 2.4; i ? lg.lineTo(x + j, y + j) : lg.moveTo(x, y); } lg.stroke(); lg.restore(); }
const curve = (pts, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, m = pts.length - 1, f = u * m, k = Math.min(m - 1, Math.floor(f)), v = f - k; o.push([lerp(pts[k][0], pts[k + 1][0], v), lerp(pts[k][1], pts[k + 1][1], v)]); } return o; };
const chalk = (s2, x, y, size, k, o = {}) => AD.text(s2, x, y, { f: 'hand', size, wt: 700, col: o.col || '#f2efe4', align: o.align || 'center', write: k, a: .95 });
// chalk head profile + trigeminal nerve (three branches from a ganglion in front of the ear) + brainstem
const HEAD = curve([[300, 920], [250, 760], [270, 600], [360, 470], [520, 430], [660, 470], [720, 560], [760, 600], [740, 640], [760, 700], [730, 730], [740, 780], [700, 800], [690, 870], [610, 900], [560, 980]], 90);
const GANG = [520, 640], STEM = [430, 800], NOSE = [740, 660];
const V1 = curve([GANG, [600, 590], [680, 560]], 20), V2 = curve([GANG, [620, 650], [730, 665]], 20), V3 = curve([GANG, [600, 720], [690, 800]], 20), ROOT = curve([GANG, [480, 720], STEM], 24);
function chalkHead(t, k, o = {}) { chalkLine(HEAD, k, { seed: 1 }); chalkLine(curve([[430, 760], [425, 860], [415, 940]], 10), k, { seed: 2, w: 16, col: 'rgba(242,239,228,.6)' });
  if (o.nerve) { const kn = o.nerve; for (const [P, sd] of [[V1, 3], [V2, 4], [V3, 5], [ROOT, 6]]) chalkLine(P, kn, { seed: sd, col: '#f5d76e', w: 8 }); lg.save(); lg.globalAlpha = kn; lg.fillStyle = '#f5d76e'; lg.beginPath(); lg.arc(GANG[0], GANG[1], 16, 0, TAU); lg.fill(); lg.restore(); }
  if (o.eye) { chalkLine(curve([[640, 560], [660, 548], [690, 558], [668, 572], [640, 560]], 14), 1, { seed: 7, w: 5 }); } }
function signal(P, u, col = '#ffef9a') { const i = Math.min(P.length - 1, Math.floor(clamp(u) * (P.length - 1))), [x, y] = P[i]; const rg = lg.createRadialGradient(x, y, 0, x, y, 44); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,239,154,0)'); lg.fillStyle = rg; lg.fillRect(x - 44, y - 44, 88, 88); }
function panel(x, y, w, h, title, t) { AD.shape(AD.rbox(x, y, w, h, 18), '#4f6f73', { seed: 600, t, lw: 5 }); AD.shape(AD.box(x + 40, y + 24, w - 80, 70, 2), '#e9e1cf', { seed: 601, t, lw: 3 }); AD.text(title, x + w / 2, y + 74, { f: 'type', size: 44, align: 'center' });
  for (const [sx, sy] of [[x + 18, y + 18], [x + w - 18, y + 18], [x + 18, y + h - 18], [x + w - 18, y + h - 18]]) AD.shape(AD.poly(sx, sy, 7, 7, 8), '#c9c2b3', { lw: 2, wob: 0 }); }
function lamp(x, y, on, label, t, sd) { const rg = on > 0 ? lg.createRadialGradient(x, y, 10, x, y, 90) : null; if (rg) { rg.addColorStop(0, `rgba(255,200,80,${.55 * on})`); rg.addColorStop(1, 'rgba(255,200,80,0)'); lg.fillStyle = rg; lg.fillRect(x - 90, y - 90, 180, 180); }
  AD.shape(AD.poly(x, y, 36, 36, 18), on > .5 ? '#ffb43a' : '#6b4a3a', { seed: 610 + sd, t, lw: 4 }); AD.text(label, x + 70, y + 14, { f: 'type', size: 40, col: '#f4efe4', a: .5 + .5 * clamp(on * 2) }); }
function gauge(x, y, r, v, t) { AD.shape(AD.poly(x, y, r, r, 36), '#f4efe4', { seed: 620, t, lw: 6 }); lg.save(); lg.lineWidth = 16; lg.strokeStyle = '#d9534f'; lg.beginPath(); lg.arc(x, y, r - 22, -Math.PI * .1, Math.PI * .25); lg.stroke(); lg.restore();
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (.75 + i / 8 * 1.5); AD.line([[x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14)], [x + Math.cos(a) * (r - 36), y + Math.sin(a) * (r - 36)]], { lw: 4, wob: 0 }); }
  const a = Math.PI * (.75 + clamp(v) * 1.5); AD.line([[x, y], [x + Math.cos(a) * (r - 30), y + Math.sin(a) * (r - 30)]], { lw: 8, lc: '#c0392b', wob: 0 }); AD.shape(AD.poly(x, y, 14, 14, 12), C.ink, { line: false, wob: 0 }); AD.text('PRESSURE', x, y + r * .55, { f: 'type', size: 36, align: 'center' }); }
function ecg(x, y, w, h, t, o = {}) { AD.shape(AD.rbox(x - 30, y - 30, w + 60, h + 60, 22), '#5d6b70', { seed: 630, t, lw: 5 }); AD.shape(AD.box(x, y, w, h, 3), '#10231c', { seed: 631, t, lw: 3 });
  lg.save(); lg.beginPath(); lg.rect(x, y, w, h); lg.clip(); lg.strokeStyle = 'rgba(80,200,140,.15)'; lg.lineWidth = 2; for (let gx = x; gx < x + w; gx += 40) { lg.beginPath(); lg.moveTo(gx, y); lg.lineTo(gx, y + h); lg.stroke(); }
  lg.strokeStyle = '#6dfca8'; lg.lineWidth = 6; lg.lineJoin = 'round'; lg.shadowColor = '#6dfca8'; lg.shadowBlur = 14; lg.beginPath(); const cy = y + h * .6, head = x + w * fr2(t * .3);
  for (let px = 0; px <= w; px += 4) { const tt = t - (w - px) / 240; let beat = (tt % .85 + .85) % .85; if (o.sneezeAt != null && Math.abs(tt - o.sneezeAt) < .6) beat = ((tt - o.sneezeAt * 0) % 1.25 + 1.25) % 1.25;   // around the sneeze the beat spacing stretches, then recovers
    const yv = beat < .06 ? -h * .38 * Math.sin(beat / .06 * Math.PI) : beat < .1 ? h * .1 * Math.sin((beat - .06) / .04 * Math.PI) : beat > .3 && beat < .42 ? -h * .08 * Math.sin((beat - .3) / .12 * Math.PI) : 0;
    px ? lg.lineTo(x + px, cy + yv) : lg.moveTo(x + px, cy + yv); } lg.stroke(); lg.restore(); }
const fr2 = v => v - Math.floor(v);
function heartShape(x, y, r, t, beat) { const sc = 1 + .08 * beat, P = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; P.push([x + sc * r * Math.pow(Math.sin(a), 3), y - sc * r * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); } AD.shape(P, '#d9534f', { seed: 640, t, lw: 5 }); }
function curtain(t, open = 1) { lg.fillStyle = '#3a1418'; lg.fillRect(0, 0, W, FY); for (const sd of [-1, 1]) { const x0 = sd < 0 ? 0 : W, w = 300 * open + 60; for (let i = 0; i < 6; i++) { const xa = x0 - sd * (i / 6) * w, xb = x0 - sd * ((i + 1) / 6) * w;
  AD.shape([[xa, 0], [xb, 0], [xb + sd * 10 * Math.sin(t + i), FY], [xa, FY]], i % 2 ? '#9e1f2a' : '#b8283a', { seed: 650 + i + sd * 10, t, lw: 3 }); } }
  AD.shape(AD.box(0, 0, W, 90, 3), '#8a1c26', { seed: 670, t, lw: 4 }); const rg = lg.createRadialGradient(540, 700, 60, 540, 700, 520); rg.addColorStop(0, 'rgba(255,240,190,.35)'); rg.addColorStop(1, 'rgba(255,240,190,0)'); lg.fillStyle = rg; lg.fillRect(0, 0, W, FY); }
function sun(x, y, r, t, k = 1) { if (k <= 0) return; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .3; AD.shape([[x + Math.cos(a - .12) * r * 1.15, y + Math.sin(a - .12) * r * 1.15], [x + Math.cos(a) * r * (1.6 + .1 * Math.sin(t * 3 + i)), y + Math.sin(a) * r * (1.6 + .1 * Math.sin(t * 3 + i))], [x + Math.cos(a + .12) * r * 1.15, y + Math.sin(a + .12) * r * 1.15]], '#f5c518', { seed: 680 + i, t, lw: 3, a: k }); }
  AD.shape(AD.poly(x, y, r, r, 30), '#f7d64a', { seed: 695, t, lw: 4, a: k }); }
function spray(x, y, k, t, dir = 1) { if (k <= 0) return; for (let i = 0; i < 9; i++) { const a = (i / 8 - .5) * .9, L = 60 + 260 * eo(k) * (.6 + .4 * hash(i)); AD.line([[x + dir * Math.cos(a) * 30, y + Math.sin(a) * 30], [x + dir * Math.cos(a) * L, y + Math.sin(a) * L]], { lw: 5, lc: '#8fb7d9', seed: 700 + i, a: 1 - k * .5 }); }
  for (let i = 0; i < 10; i++) { const u = clamp(k * 1.2 - hash(i) * .2), a = (hash(i * 3) - .5) * 1, L = 40 + 330 * u; AD.shape(AD.poly(x + dir * Math.cos(a) * L, y + Math.sin(a) * L, 8, 8, 8), '#cfe6f5', { seed: 720 + i, lw: 2, a: 1 - u * .6 }); } }
function sneezeKid(x, y, sc, t, k, o = {}) { const lean = k < .35 ? -.12 * ss(k / .35) : -.12 + .3 * eo((k - .35) / .2) - .18 * ss((k - .7) / .3); lg.save(); lg.translate(x, y); lg.rotate(lean); AD.kid(0, 0, sc, t, { mood: k > .25 && k < .9 ? 'closed' : 'o', look: o.look ?? 1, arm: o.arm, sweat: o.sweat }); lg.restore();
  const nx = x + Math.sin(lean) * 372 * sc + 14, ny = y - Math.cos(lean) * 372 * sc; if (k > .45) spray(nx, ny, (k - .45) / .4, t, o.dir || 1); return [nx, ny]; }
function exitSign(x, y, k, t) { if (k <= 0) return; lg.save(); lg.globalAlpha = clamp(k * 2); AD.shape(AD.rbox(x, y, 300, 130, 12), '#1f8a4c', { seed: 740, t, lw: 5 }); AD.text('EXIT', x + 180, y + 92, { f: 'poster', size: 80, col: '#fff', align: 'center' });
  const rx = x + 62, ry = y + 70, ph = Math.sin(t * 8); AD.shape(AD.poly(rx, ry - 34, 11, 11, 10), '#fff', { line: false, wob: 0 }); AD.line([[rx, ry - 20], [rx - 6, ry + 10]], { lw: 8, lc: '#fff', wob: 0 }); AD.line([[rx - 6, ry + 10], [rx - 22 + ph * 10, ry + 40]], { lw: 8, lc: '#fff', wob: 0 }); AD.line([[rx - 6, ry + 10], [rx + 14 - ph * 10, ry + 40]], { lw: 8, lc: '#fff', wob: 0 }); AD.line([[rx - 3, ry - 10], [rx + 20, ry - 2 + ph * 6]], { lw: 7, lc: '#fff', wob: 0 }); lg.restore(); }
const kidsRow = (t, lit, sneezeK) => { [190, 400, 610, 820].forEach((x, i) => { if (i === 2) sneezeKid(x, FY, .7, t, sneezeK, { look: 0 }); else AD.kid(x, FY, .7, t, { mood: 'smile', look: (i - 1.5) * .3 }); if (i === 2 && lit > 0) { lg.save(); lg.globalAlpha = .3 * lit; lg.fillStyle = '#fff3b0'; lg.beginPath(); lg.moveTo(x - 30, 260); lg.lineTo(x + 30, 260); lg.lineTo(x + 140, FY); lg.lineTo(x - 140, FY); lg.closePath(); lg.fill(); lg.restore(); } }); };

// ---------- scenes (one per phrase; lt = time since the cut) ----------
const S = [];
S[0] = (t, lt) => { set('#bfe0e6', '#a77d4f'); sun(880, 420, 70, t); flowers(t); for (let i = 0; i < 14; i++) { const u = fr2(t * .18 + hash(i)), x = lerp(80 + hash(i * 3) * 300, 560, u), y = lerp(500 + hash(i * 5) * 500, 650, u); pollen(x, y, 9 + hash(i) * 6, t, i); }
  const k = clamp((t - .2) / 1.6); sneezeKid(560, FY + 170, 1.55, t, k, { look: .8 }); if (t < 1.1) ransomLine(t < .55 ? 'AH...' : 'AH... AH...', 360, 96, 3, i => 1); else ransomLine('ACHOO!', 380, 150, 11, pop(t, 1.1, 6, .05)); AD.boxy(170, FY + 4, .8, t, { mood: k > .5 ? 'o' : 'happy' }); };
S[1] = (t, lt) => { set('#bfe0e6', '#a77d4f'); flowers(t); AD.kid(560, FY, 1.15, t, { mood: 'worry', look: 0, sweat: true }); AD.boxy(170, FY + 4, .8, t, { mood: 'o', look: 1 }); ransomLine('WHY DO', 340, 120, 21, pop(lt + 9, 9, 6)); ransomLine('WE SNEEZE?', 490, 110, 37, pop(lt, .25, 10, .05)); };
S[2] = (t, lt) => { set('#d9cdb5', '#8a6a4a'); AD.plaque(200, 380, 680, 330, ['The Sneeze', 'a reflex,', 'not a choice'], { size: 70, top: 110, lh: 92, write: R(lt, .2, 1.2), t }); AD.line([[150, 860], [930, 860]], { lw: 10, lc: '#a8232f', seed: 750, t });
  for (const px of [150, 930]) { AD.shape(AD.box(px - 10, 830, 20, 300, 2), '#c9a43a', { seed: 751 + px, t, lw: 3 }); AD.shape(AD.poly(px, 820, 22, 22, 12), '#e8c547', { seed: 753 + px, t, lw: 3 }); } AD.kid(300, FY, 1, t, { arm: 'point', mood: 'smile', look: 1 }); AD.boxy(760, FY + 4, .8, t, { mood: 'happy', hat: true }); };
S[3] = (t, lt) => { set('#f2c6c0', '#a06d5a'); profile(t); [['dust', 0], ['pollen', 1], ['germ', 2]].forEach(([w, i]) => { const u = eo(R(lt, .3 + i * .6, 1.4)), x = lerp(960, NX + 20, u), y = lerp(420 + i * 220, NY, u) + (1 - u) * 30 * Math.sin(t * 3 + i);
  bits(x, y, 1.9 - u, t, [1, 0, 2][i]); AD.text(w, x, y - 70, { f: 'hand', size: 56, wt: 700, align: 'center', a: (1 - u) * R(lt, .2 + i * .6, .3) }); }); ransomLine('ITCH!', 360, 110, 41, pop(lt, 2.2, 5)); };
const board = t => { set('#cdbb99', '#8a6a4a'); AD.chalkboard(110, 360, 860, 720, t); };
S[4] = (t, lt) => { board(t); chalkHead(t, R(lt, 0, .8), { nerve: R(lt, .8, 1.4) }); chalk('trigeminal nerve', 560, 1020, 60, R(lt, 1.6, .9)); chalk('nose', 840, 610, 46, R(lt, .6, .4), { col: '#ffd3c4' }); chalkLine(curve([[600, 1000], [560, 900], [560, 700]], 12), R(lt, 2.2, .5), { dash: [12, 14], w: 5 }); };
S[5] = (t, lt) => { board(t); chalkHead(t, 1, { nerve: 1 }); const u = R(lt, .3, 1.4); signal(curve([NOSE, GANG], 20), R(u, 0, .45)); if (u > .45) signal(ROOT, R(u, .45, .55));
  const k2 = R(lt, 1.6, .5); lg.save(); lg.globalAlpha = k2; lg.strokeStyle = '#ffef9a'; lg.lineWidth = 6; lg.beginPath(); lg.arc(STEM[0], STEM[1], 46 + 6 * Math.sin(t * 8), 0, TAU); lg.stroke(); lg.restore();
  chalk('brainstem', 300, 1010, 56, R(lt, 1.7, .6)); chalk('sneeze centre?', 300, 700, 50, R(lt, 2.4, .8), { col: '#ffd3c4' }); chalkLine(curve([[330, 720], [380, 760], [410, 785]], 8), R(lt, 3, .4), { w: 5 }); };
const ROUT = ['eyes shut', 'deep breath', 'pressure', 'BLAST'];
function routine(t, lit) { panel(150, 320, 780, 760, 'SNEEZE ROUTINE', t); ROUT.forEach((w, i) => lamp(270, 520 + i * 150, clamp(lit - i), w, t, i)); }
S[6] = (t, lt) => { set('#c9d6cf', '#7d6a55'); const br = ss(R(lt, .9, 1.2)); lg.save(); lg.translate(540, FY + 120); lg.scale(1 + .06 * br, 1 + .03 * br); AD.kid(0, 0, 1.55, t, { mood: lt > .3 ? 'closed' : 'o', look: 0 }); lg.restore();
  for (let i = 0; i < 3; i++) { const u = fr2(lt * .8 + i / 3); AD.line([[880 - u * 200, 450 + i * 30], [800 - u * 200, 450 + i * 30]], { lw: 6, lc: '#8fb7d9', a: br * (1 - u) }); } ransomLine(lt < 1 ? 'SHUT.' : 'INHALE...', 330, 100, 51, pop(lt, lt < 1 ? .1 : 1, 9, .04)); };
S[7] = (t, lt) => { set('#c9d6cf', '#7d6a55'); const v = R(lt, 0, 1.4); gauge(300, 560, 190, v * .92 + .02 * Math.sin(t * 30) * v, t); const k = R(lt, 1.2, 1.4); sneezeKid(700, FY, 1.05, t, .3 + k * .6, { look: 1, dir: 1 }); if (k > .1) ransomLine('ACHOO!', 380, 140, 61, pop(lt, 1.5, 6, .05)); };
S[8] = (t, lt) => { set('#f2c6c0', '#a06d5a'); profile(t, { eyeShut: lt < 1.2 }); for (let i = 0; i < 12; i++) { const u = eo(R(lt, .1 + i * .08, 1.6)), x = lerp(NX + 10, 840 + hash(i) * 120, u), y = lerp(NY, 380 + hash(i * 4) * 640, u); bits(x, y, .8 + u, t, i); }
  spray(NX + 20, NY, R(lt, 0, .8), t); AD.text('out!', 780, 1060, { f: 'hand', size: 70, wt: 700, align: 'center', a: R(lt, 1, .4) }); };
S[9] = (t, lt) => { set('#f6e3a6', '#a77d4f'); sun(540, 330, 60, t); kidsRow(t, R(lt, 1.2, .5), clamp((lt - 1.6) / 1.6)); ransomLine('1 IN 4', 520, 120, 71, pop(lt, .3, 6)); AD.plaque(300, 640, 480, 110, ['25.6% in a 2019 study'], { size: 40, top: 70, t, write: R(lt, 1, .8) }); };
S[10] = (t, lt) => { const u = eo(R(lt, .2, 1.6)); set('#2f2a3a', '#4a3a30'); lg.fillStyle = '#fbf0c2'; lg.fillRect(560, 300, 520, FY - 300); sun(860, 470, 70, t); AD.shape(AD.box(540, 290, 30, FY - 290, 2), '#6a4a32', { seed: 760, t, lw: 4 });
  const x = lerp(260, 720, u); if (u < 1) AD.kid(x, FY, 1, t, { mood: 'smile', walk: lt * 1.3, look: 1 }); else sneezeKid(x, FY, 1, t, clamp((lt - 1.8) / 1.5), { look: 1 }); ransomLine('PHOTIC SNEEZE', 360, 84, 81, pop(lt, .1, 13, .04)); };
S[11] = (t, lt) => { board(t); chalkHead(t, 1, { nerve: 1, eye: 1 }); chalkLine(curve([[960, 400], [820, 480], [690, 556]], 14), R(lt, .3, .6), { col: '#f5d76e', w: 9 }); sun(930, 420, 30, t, R(lt, .1, .3));
  chalkLine(curve([[650, 566], [600, 600], [560, 630]], 10), R(lt, 1.2, .8), { dash: [10, 12], w: 6, col: '#ffd3c4' }); chalk('one idea', 300, 520, 60, R(lt, 1.8, .6), { col: '#ffd3c4' }); chalk('?', 260, 640, 110, R(lt, 2.6, .3), { col: '#ffd3c4' }); chalk('nobody knows for sure', 540, 1020, 50, R(lt, 3.2, .9)); };
S[12] = (t, lt) => { set('#3a1418', '#4a2a20'); curtain(t, eo(R(lt, 0, 1))); AD.plaque(220, 560, 640, 300, ['MYTH:', 'your heart stops', 'when you sneeze'], { size: 58, top: 90, lh: 80, t, write: R(lt, .6, 1.2) }); ransomLine('MYTH?', 380, 140, 91, pop(lt, 1.6, 5)); };
S[13] = (t, lt) => { set('#e8d6c8', '#7d6a55'); const v = lt < 1.6 ? R(lt, 0, 1.4) * .85 : .85 - R(lt, 1.6, .8) * .6; gauge(320, 600, 190, v, t);
  const ph = lt > 1.4 && lt < 2.2 ? 0 : Math.max(0, Math.sin(t * 7.4)); heartShape(770, 620, 120, t, ph); AD.text('chest', 320, 860, { f: 'hand', size: 56, wt: 700, align: 'center' }); AD.text('heart', 770, 860, { f: 'hand', size: 56, wt: 700, align: 'center' });
  AD.text('the rhythm shifts, briefly', 540, 340, { f: 'hand', size: 60, wt: 700, align: 'center', a: R(lt, 1.4, .4) }); AD.line([[470, 600], [600, 610]], { lw: 6, seed: 790, t, a: R(lt, .9, .3) }); };
S[14] = (t, lt) => { set('#c9d6cf', '#7d6a55'); ecg(120, 420, 840, 420, t); heartShape(540, 1000, 70, t, Math.max(0, Math.sin(t * 7.4))); ransomLine('BUSTED', 330, 120, 101, pop(lt, 1.3, 6)); AD.text('the signal keeps going', 540, 920, { f: 'hand', size: 60, wt: 700, align: 'center', a: R(lt, .5, .4) }); };
S[15] = (t, lt) => { set('#f2c6c0', '#a06d5a'); profile(t); exitSign(520, 380, R(lt, .3, .4), t); for (let i = 0; i < 10; i++) { const u = fr2(lt * .45 + i / 10), x = lerp(NX + 10, 1100, u), y = NY + Math.sin(u * 6 + i) * 40 - u * 80 + (hash(i) - .5) * 200 * u; bits(x, y, .8 + u * .6, t, i); }
  AD.line([[NX + 40, NY - 20], [560, 540]], { lw: 5, seed: 770, t, a: R(lt, .6, .3) }); };
S[16] = (t, lt) => { set('#f6e3a6', '#a77d4f'); sun(820, 470, 80, t); sneezeKid(420, FY, 1.1, t, clamp((lt - .2) / 1.4), { look: 1 }); AD.boxy(820, FY + 4, .85, t, { mood: 'happy', hop: t * .8 });
  AD.shape(AD.box(762, FY - 116, 116, 26, 2), '#1d1d1d', { seed: 780, t, lw: 3 }); ransomLine('SUN-', 330, 110, 111, pop(lt, .1, 4)); ransomLine('SNEEZER?', 470, 110, 131, pop(lt, .3, 8)); };
const ENDL = [['FOLLOW', 380, 130], ['FOR MORE OF', 560, 96], ['HOW IT', 730, 130], ['REALLY', 900, 130], ['WORKS.', 1065, 130]];
function cork(t) { lg.fillStyle = '#b98a5a'; lg.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { lg.fillStyle = hash(i) > .5 ? 'rgba(90,55,25,.25)' : 'rgba(240,200,150,.2)'; lg.fillRect(hash(i * 2.3) * W, hash(i * 3.7) * H, 3 + hash(i * 5) * 5, 2 + hash(i * 7) * 4); } }
S[17] = (t, lt) => { cork(t); ENDL.forEach(([w, y, sz], li) => { const step = sz * .76, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, 540 - tw / 2 + step / 2 + i * step, y, sz, li * 23 + i * 5 + 3, R(lt, li * .2 + i * .03, .25)); }); });
  AD.text("A new 'wait, really?' every day.", 540, 1190, { f: 'serif', size: 46, align: 'center', col: '#2b1d10', a: R(lt, 1.3, .5) }); AD.text('@howitreallyworkstudio', 540, 1270, { f: 'type', size: 48, col: '#2b1d10', align: 'center', a: R(lt, 1.5, .5) });
  AD.boxy(540, 1640, .9, t, { mood: 'happy', hop: t * .6 }); };

// ---------- caption: karaoke words on a dark band, y 1150-1360 ----------
function caption(t) { const ph = PH.findLast(p => t >= p.start - .2); if (!ph || ph.i >= N - 1) return; const out = PH[ph.i + 1].start - .12, a = clamp((t - ph.start + .2) / .2) * clamp((out - t) / .2); if (a <= 0) return;
  const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = .82 * a; c.fillStyle = '#1b1410'; c.beginPath(); c.roundRect(50, 1158, 980, 196, 26); c.fill(); c.globalAlpha = a;
  let size = 48; c.font = AD.font('roundX', size, 800); const ws = []; ph.cap.split(/(\*\*)/).reduce((hl, p) => { if (p === '**') return !hl; p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); return hl; }, false);
  const tot = ws.reduce((q, w) => q + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = c.measureText(w.w).width; });
  const wrap = () => { const sp = c.measureText(' ').width, L = [[]]; let lw = 0; ws.forEach(w => { w.ww = c.measureText(w.w).width; if (lw + w.ww > 790 && L[L.length - 1].length) { L.push([]); lw = 0; } L[L.length - 1].push(w); lw += w.ww + sp; }); return [L, sp]; };
  let [lines, sp] = wrap(); if (lines.length > 3) { size = 42; c.font = AD.font('roundX', size, 800); [lines, sp] = wrap(); }   // 4 lines would leave the band: shrink to fit 3
  const lh = size * 1.2, y0 = 1256 - (lines.length - 1) * lh / 2 + 16; lines.forEach((ln, li) => { let x = 90; ln.forEach(wd => { c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = '#1b1410'; c.strokeText(wd.w, x, y0 + li * lh);
    c.fillStyle = t >= wd.t0 ? (wd.hl ? '#ff9a5c' : C.yellow) : '#fbf6ea'; c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); }); c.restore(); }

// ---------- compositor: hard cuts with a short whip blur (demo) ----------
const START = PH.map(p => p.start - .2); START[0] = 0;
const idx = t => { let i = 0; for (let k = 0; k < N; k++) if (t >= START[k]) i = k; return i; };
function scene(t) { const i = idx(t), u = R(t, START[i], .22); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H);
  AD.clear(); S[i](t, t - START[i]); AD.blit({ blur: i > 0 && u < 1 ? (1 - u) * 18 : 0, dx: i > 0 && u < 1 ? (1 - eo(u)) * 160 : 0, z: i > 0 && u < 1 ? lerp(1.04, 1, eo(u)) : 1 + .015 * Math.sin(t * .4) });
  wash(); AD.finish(); caption(t); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H;
const r = (i, d = 0) => s(i) + d;
window.CUES = [['tick', .5], ['tick', 1.2], ['whoosh', 2.0], ['pop', 2.1], ['pop', 2.2], ['pop', 2.3], ['whoosh', r(1, -.2)], ['pop', r(1, .3)], ['pop', r(1, .5)], ['whoosh', r(2, -.2)], ['scribble', r(2, .2), r(2, 1.4)], ['whoosh', r(3, -.2)], ['slide', r(3, .4)], ['slide', r(3, 1)], ['slide', r(3, 1.6)], ['pop', r(3, 2.3)],
  ['whoosh', r(4, -.2)], ['scribble', r(4, 0), r(4, 2.4)], ['whoosh', r(5, -.2)], ['sparkle', r(5, .4)], ['chime', r(5, 1.7), 76], ['scribble', r(5, 2.4), r(5, 3.2)],
  ['whoosh', r(6, -.2)], ['slide', r(6, .9)], ['whoosh', r(7, -.2)], ['bubbles', r(7, .2)], ['thud', r(7, 1.5)], ['whoosh', r(8, -.2)], ['pop', r(8, .3)], ['pop', r(8, .6)], ['pop', r(8, .9)], ['whoosh', r(9, -.2)], ['pop', r(9, .3)], ['chime', r(9, 1.2), 79], ['whoosh', r(9, 2.2)],
  ['whoosh', r(10, -.2)], ['slide', r(10, .3)], ['pop', r(10, .2)], ['whoosh', r(10, 2.4)], ['whoosh', r(11, -.2)], ['scribble', r(11, .3), r(11, 2)], ['whoosh', r(12, -.2)], ['slide', r(12, 0)], ['thud', r(12, 1.6)], ['whoosh', r(13, -.2)], ['heartbeat', r(13, .2), 5, .7],
  ['whoosh', r(14, -.2)], ['heartbeat', r(14, .1), 4, .7], ['thud', r(14, 1.3)], ['whoosh', r(15, -.2)], ['pop', r(15, .4)], ['whoosh', r(16, -.2)], ['whoosh', r(16, 1)], ['chime', r(17, .2), 84]];
window.DUR = TOT;
window.seek = t => { scene(t); const k = ss(R(t, TOT - .5, .5)) * .4; if (k > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); AD.clear(); S[0](2.6, 2.6); AD.blit({}); wash(); AD.finish(); };
scene(0); { const c = F0.getContext('2d'); c.drawImage(g.canvas, 0, 0); }
window.seek(0); window.ready = true; window.READY = true;
