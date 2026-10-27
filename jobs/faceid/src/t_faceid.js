// faceid: generative & neon (recipe: awesome-opus-5-5 "Generative art": procedural particles on dark, neon palette, motion on the beat). Original code.
import { clamp, ramp, ease, eo, lerp, pop, rnd, s, e, TL, captions } from './rl.js';
const cv = document.getElementById('c'), ctx = cv.getContext('2d'); const W = 540, H = 960;
const CY = '#27f3ff', MG = '#ff3df0', LI = '#c6ff3d', VI = '#8a5cff', WH = '#ffffff', BG = '#06050e';
const MONO = "'JetBrains Mono', monospace", SANS = "'Inter', sans-serif";
const beat = 60 / 88, pulse = t => Math.exp(-((t % beat)) * 5);
// glow sprites
const spr = {}; function sprite(c) { if (spr[c]) return spr[c]; const k = document.createElement('canvas'); k.width = k.height = 64; const x = k.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, '#fff'); g.addColorStop(.18, c); g.addColorStop(.5, c + '55'); g.addColorStop(1, c + '00'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return spr[c] = k; }
const dot = (x, y, r, c, a = 1) => { ctx.globalAlpha = clamp(a); ctx.drawImage(sprite(c), x - r, y - r, r * 2, r * 2); };
const hexA = c => c;
const mixc = (a, b, k) => { const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
// face height field (x right, y up)
const g = (x, y, sx, sy) => Math.exp(-(x * x / sx + y * y / sy));
function zf(x, y) { const r2 = (x / .82) ** 2 + (y / 1.12) ** 2; if (r2 > 1) return null; let z = .5 * Math.sqrt(1 - r2);
  z += .32 * g(x, y + .12, .012, .07) * (y > -.38 ? 1 : .3); z -= .09 * (g(x - .33, y - .24, .018, .008) + g(x + .33, y - .24, .018, .008)); z += .05 * (g(Math.abs(x) - .3, y - .38, .05, .004));
  z += .05 * g(x, y + .52, .04, .004); z -= .035 * g(x, y + .56, .05, .0006); z += .07 * g(x, y + .95, .05, .01); z += .1 * g(x, y + .3, .02, .01) * .3; return z; }
const pts = []; const R = rnd(5);
for (let y = -1.12; y <= 1.12; y += .042) for (let x = -.82; x <= .82; x += .042) { const z = zf(x + (R() - .5) * .01, y); if (z === null) continue; pts.push({ x, y, z, d: Math.hypot(x / .82, y / 1.12), r: R() }); }
const beard = pts.filter(p => p.y < -.62 && p.y > -1.08 && Math.abs(p.x) < .6 && Math.abs(p.x) > .05 || (p.y < -.4 && Math.abs(p.x) > .45 && p.y > -.9)).map(p => ({ ...p, z: p.z + .08 + (p.r * .05) }));
const FX = 270, FY = 350, FS = 168;
function proj(p, yaw, pitch, scale = FS, cx = FX, cy = FY, zoff = 0) { const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch); let x = p.x * cyw + p.z * syw, z = -p.x * syw + p.z * cyw, y = p.y; const y2 = y * cp - z * sp, z2 = y * sp + z * cp; const f = 1 / (1 - (z2 + zoff) * .22); return { x: cx + x * scale * f, y: cy - y2 * scale * f, z: z2, f }; }
const depthCol = z => mixc(CY, MG, clamp(z / .85));
// text helpers
function text(str, x, y, size, color, o = {}) { ctx.globalAlpha = o.a ?? 1; ctx.font = `${o.w ?? 800} ${size}px ${o.f ?? SANS}`; ctx.textAlign = o.al ?? 'center'; ctx.textBaseline = 'middle'; if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow; } ctx.fillStyle = color; if (o.ls) ctx.letterSpacing = o.ls + 'px'; else ctx.letterSpacing = '0px'; ctx.fillText(str, x, y); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
const tag = (str, x, y, color, a, al = 'center') => { ctx.font = `600 13px ${MONO}`; ctx.letterSpacing = '2px'; const w = ctx.measureText(str).width + 22; const x0 = al === 'center' ? x - w / 2 : al === 'left' ? x : x - w; ctx.globalAlpha = a * .9; ctx.fillStyle = 'rgba(10,8,24,.8)'; ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect(x0, y - 15, w, 30, 6); ctx.fill(); ctx.stroke(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x0 + 11, y + 1); ctx.letterSpacing = '0px'; ctx.globalAlpha = 1; };
const chapter = (n, label, a, t) => { const k = ramp(t, a, .3); text(n, 28, 52, 15, CY, { w: 700, f: MONO, al: 'left', a: k, ls: 3 }); text(label, 64, 52, 15, '#cfc8ff', { w: 500, f: MONO, al: 'left', a: k, ls: 3 }); ctx.globalAlpha = k; ctx.fillStyle = CY; ctx.fillRect(28, 66, 24 * k + 4, 2); ctx.globalAlpha = 1; };
// background: dark with faint grid + drifting motes
const motes = Array.from({ length: 70 }, () => ({ x: R() * W, y: R() * H, s: .3 + R(), c: [CY, MG, VI][Math.floor(R() * 3)] }));
function bg(t) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); const gr = ctx.createRadialGradient(270, 400, 20, 270, 400, 520); gr.addColorStop(0, 'rgba(70,40,160,.28)'); gr.addColorStop(1, 'rgba(6,5,14,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(120,100,255,.07)'; ctx.lineWidth = 1; for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = (t * 6) % 30; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter'; motes.forEach(m => dot(m.x + Math.sin(t * .3 + m.y) * 8, (m.y - t * 10 * m.s + 2000) % H, 5 * m.s, m.c, .35)); ctx.globalCompositeOperation = 'source-over'; }
// phone-top
const PX = 270, PY = 628;
function phone(t, a, lens = false) { ctx.globalAlpha = a; ctx.strokeStyle = '#7d6cff'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(16,12,40,.9)'; ctx.beginPath(); ctx.roundRect(150, PY - 20, 240, 130, 26); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#0b0920'; ctx.beginPath(); ctx.roundRect(PX - 56, PY - 16, 112, 26, 13); ctx.fill(); ctx.globalAlpha = 1; dot(PX - 20, PY - 3, 9, CY, a * (.6 + .4 * pulse(t))); dot(PX + 22, PY - 3, 9, lens ? LI : VI, a * (lens ? .9 : .6)); }
const unitReveal = (p, t, a) => ramp(t, a + p.d * 1.1, .35);
// ----- scenes
const S = [];
const sc = (a, b, fn) => S.push({ a, b, fn });
// A hook
sc(0, s(2) - .1, t => {
  chapter('00', 'FACE ID', .1, t);
  const yaw = Math.sin(t * .8) * .55, pitch = Math.sin(t * .5) * .08; ctx.globalCompositeOperation = 'lighter';
  pts.forEach(p => { const k = ramp(t + .35, p.d * 1.1, .4); if (k <= 0) return; const q = proj(p, yaw, pitch); const c = depthCol(p.z); dot(q.x, q.y, (2.4 + 2.2 * p.z) * q.f * (1 + .5 * pulse(t) * (1 - p.d)), c, k * (.55 + .5 * p.z)); });
  const sy = FY + Math.sin(t * 2.2) * 215; ctx.globalAlpha = .55; ctx.fillStyle = CY; ctx.fillRect(FX - 150, sy, 300, 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const k = pop(ramp(t + .35, .1, .5)); text('NOT A PHOTO', 270, 150, 46 * (.6 + .4 * k), WH, { glow: 18, a: clamp(k * 3) }); text('A SHAPE', 270, 198, 46 * (.6 + .4 * pop(ramp(t, 1.7, .5))), MG, { glow: 24, a: ramp(t, 1.7, .15) });
});
// B projector
const T2 = s(2);
function dotsLanding(t, t0, yaw, pitch, mode) {
  ctx.globalCompositeOperation = 'lighter';
  pts.forEach((p, i) => { const q = proj(p, yaw, pitch); const delay = t0 + p.d * 1.6 + (p.r) * .5; const k = ramp(t, delay, .7);
    if (k > 0 && k < 1) { const x = lerp(PX - 20, q.x, eo(k)), y = lerp(PY - 3, q.y, eo(k)); dot(x, y, 3, CY, .8); }
    if (k >= 1) { const c = mode === 'depth' ? depthCol(p.z) : CY; dot(q.x, q.y, (2.6 + (mode === 'depth' ? 2.2 * p.z : 0)) * q.f, c, mode === 'depth' ? .9 : .65); } });
  ctx.globalCompositeOperation = 'source-over';
}
sc(T2 - .1, s(3) - .1, t => { chapter('01', 'PROJECT', T2, t); phone(t, 1); dotsLanding(t, T2 + .3, Math.sin(t * .8) * .3, 0, 'flat');
  tag('DOT PROJECTOR', 110, 590, CY, ramp(t, T2 + .8, .3)); tag('THOUSANDS OF DOTS', 410, 250, MG, ramp(t, T2 + 2.2, .3)); });
// B2 camera reads
sc(s(3) - .1, s(4) - .1, t => { chapter('02', 'READ', s(3), t); const yaw = Math.sin(t * .8) * .3; phone(t, 1, true);
  ctx.globalCompositeOperation = 'lighter'; pts.forEach((p, i) => { const q = proj(p, yaw, 0); dot(q.x, q.y, 2.6 * q.f, CY, .55); if (i % 9 === 0) { const k = ramp(t, s(3) + .3 + (i % 17) * .04, .5) * (1 - ramp(t, s(3) + 1.4 + (i % 7) * .05, .5)); if (k > 0 && k < 1) { ctx.globalAlpha = .6; ctx.strokeStyle = LI; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(lerp(q.x, PX + 22, k), lerp(q.y, PY - 3, k)); ctx.stroke(); dot(lerp(q.x, PX + 22, k), lerp(q.y, PY - 3, k), 5, LI, .9); } } });
  ctx.globalCompositeOperation = 'source-over'; const rr = 14 + 26 * ((t - s(3)) % .9) / .9; ctx.globalAlpha = .7 * (1 - ((t - s(3)) % .9) / .9); ctx.strokeStyle = LI; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(PX + 22, PY - 3, rr, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  tag('INFRARED CAMERA', 420, 590, LI, ramp(t, s(3) + .4, .3)); });
// B3 depth map
sc(s(4) - .1, s(5) - .1, t => { chapter('03', 'DEPTH MAP', s(4), t); const yaw = Math.sin(t * 1.1) * .75, pitch = Math.sin(t * .6) * .12; ctx.globalCompositeOperation = 'lighter';
  const w = ramp(t, s(4) + 1.2, 1.4); pts.forEach(p => { const q = proj(p, yaw, pitch); const c = mixc(CY, depthCol(p.z), w); dot(q.x, q.y, (2.6 + 2.8 * p.z * w) * q.f, c, .55 + .45 * w * p.z / .85); });
  ctx.globalCompositeOperation = 'source-over';
  const lx = 440, ly = 280; ctx.globalAlpha = ramp(t, s(4) + .6, .4); const gr = ctx.createLinearGradient(0, ly - 60, 0, ly + 60); gr.addColorStop(0, MG); gr.addColorStop(1, CY); ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(lx, ly - 60, 14, 120, 7); ctx.fill(); ctx.globalAlpha = 1; text('NEAR', lx + 7, ly - 76, 12, MG, { f: MONO, w: 600, a: ramp(t, s(4) + .6, .4), ls: 2 }); text('FAR', lx + 7, ly + 76, 12, CY, { f: MONO, w: 600, a: ramp(t, s(4) + .6, .4), ls: 2 });
  tag('NOSE = NEAR', 120, 520, MG, ramp(t, s(4) + 1.6, .3)); tag('CHEEK = FARTHER', 400, 560, CY, ramp(t, s(4) + 2.2, .3)); });
// B4 infrared picture
sc(s(5) - .1, s(6) - .1, t => { chapter('04', 'INFRARED IMAGE', s(5), t); const k = ramp(t, s(5), .5); ctx.save(); ctx.globalAlpha = k;
  const gr = ctx.createRadialGradient(FX, FY - 20, 20, FX, FY, 230); gr.addColorStop(0, '#9dffb8'); gr.addColorStop(.7, '#2a8f6a'); gr.addColorStop(1, '#0a2a2a'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(FX, FY, .82 * FS, 1.12 * FS, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#07241e'; [-1, 1].forEach(sx => { ctx.beginPath(); ctx.ellipse(FX + sx * .33 * FS, FY - .24 * FS, 24, 11, 0, 0, 7); ctx.fill(); }); ctx.beginPath(); ctx.ellipse(FX, FY + .52 * FS, 38, 8, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#0c3a30'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(FX, FY - .05 * FS); ctx.lineTo(FX - 8, FY + .2 * FS); ctx.lineTo(FX + 10, FY + .2 * FS); ctx.stroke();
  ctx.globalAlpha = .12 * k; ctx.fillStyle = '#000'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2); ctx.restore(); ctx.globalAlpha = 1;
  tag('FLAT · NO DEPTH', 270, 640, LI, ramp(t, s(5) + .7, .3)); });
// C: chip + numbers
const digits = Array.from({ length: 22 }, (_, i) => ({ x: 50 + i * 22, sp: 40 + R() * 90, off: R() * 600 }));
function chip(t, a, x = 270, y = 420, w = 190, h = 190, label = 'SECURE ENCLAVE') {
  ctx.globalAlpha = a; ctx.strokeStyle = VI; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(18,12,48,.95)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 16); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(138,92,255,.7)'; for (let i = 0; i < 6; i++) { const o = -w / 2 + 24 + i * (w - 48) / 5; [[0, -1], [0, 1]].forEach(([_, d]) => { ctx.beginPath(); ctx.moveTo(x + o, y + d * h / 2); ctx.lineTo(x + o, y + d * (h / 2 + 18)); ctx.stroke(); }); const o2 = -h / 2 + 24 + i * (h - 48) / 5;[-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(x + d * w / 2, y + o2); ctx.lineTo(x + d * (w / 2 + 18), y + o2); ctx.stroke(); }); }
  ctx.globalAlpha = 1; text(label, x, y - h / 2 - 34, 14, '#d9d2ff', { f: MONO, w: 700, ls: 3, a }); dot(x, y, 70 + 10 * pulse(t), VI, .5 * a); }
const bars = Array.from({ length: 22 }, () => R());
function barRow(x, y, w, h, t, col, a = 1, seed = 0, jitter = 0) { const n = 22, bw = w / n; for (let i = 0; i < n; i++) { const v = clamp(.15 + .85 * bars[(i + seed) % n] + jitter * Math.sin(t * 7 + i * 1.9) * .08); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(x + i * bw + 1.5, y + h - v * h, bw - 3, v * h); } ctx.globalAlpha = 1; }
sc(s(6) - .1, s(8) - .1, t => { chapter('05', 'TURN INTO NUMBERS', s(6), t); const k = ramp(t, s(6) + .2, .6);
  chip(t, k, 270, 400);
  ctx.globalCompositeOperation = 'lighter'; const yaw = Math.sin(t) * .5;
  const absorb = ramp(t, s(6) + .6, 2.2); pts.forEach((p, i) => { if (i % 3) return; const q = proj(p, yaw, 0, 85 * (1 - absorb * .9), 270, 400 - 0, 0); const dx = (R() * 0, 0); dot(q.x, q.y, 2.4, depthCol(p.z), (1 - absorb) * .9); });
  ctx.globalCompositeOperation = 'source-over';
  ctx.font = `500 15px ${MONO}`; digits.forEach((d, i) => { const yy = ((t * d.sp + d.off) % 560) + 130; const a = (i % 3 === 0 ? .8 : .35) * k * (1 - ramp(t, s(7) + .5, .6)); text(String(Math.floor((t * 8 + i * 13) % 10)), d.x, yy, 17, i % 4 ? CY : LI, { f: MONO, w: 600, a }); });
  const m = ramp(t, s(7) - .2, .6); barRow(150, 560, 240, 90, t, LI, m, 0, 1); text('A LIST OF NUMBERS', 270, 690, 14, LI, { f: MONO, w: 700, ls: 3, a: m });
  // photo crossed
  const pk = ramp(t, s(7) + .8, .5); ctx.globalAlpha = pk; ctx.strokeStyle = '#ff5a6e'; ctx.lineWidth = 3; ctx.strokeRect(85, 175, 70, 90); ctx.beginPath(); ctx.moveTo(78, 168); ctx.lineTo(162, 272); ctx.stroke(); ctx.moveTo(162, 168); ctx.lineTo(78, 272); ctx.stroke(); ctx.globalAlpha = 1; text('NOT A PHOTO', 120, 295, 13, '#ff5a6e', { f: MONO, w: 700, ls: 2, a: pk }); });
// D compare
sc(s(8) - .1, s(10) - .1, t => { chapter('06', 'COMPARE', s(8), t); const k = ramp(t, s(8) + .2, .5);
  text('SAVED', 150, 250, 14, CY, { f: MONO, w: 700, ls: 3, a: k }); text('NEW', 390, 250, 14, MG, { f: MONO, w: 700, ls: 3, a: ramp(t, s(8) + 1.1, .4) });
  barRow(60, 270, 190, 120, t, CY, k, 0, 0); const nk = ramp(t, s(8) + 1.1, .5); barRow(290, 270, 190, 120, t, MG, nk, 0, ramp(t, s(8) + 3, 1) < 1 ? 1 : 0);
  const mk = ramp(t, s(8) + 2.4, 1); ctx.strokeStyle = LI; ctx.lineWidth = 1.5; ctx.globalAlpha = .7 * mk; for (let i = 0; i < 22; i += 2) { ctx.beginPath(); ctx.moveTo(60 + i * 190 / 22 + 4, 400); ctx.lineTo(290 + i * 190 / 22 + 4, 400); ctx.stroke(); } ctx.globalAlpha = 1;
  // small faces
  [[150, 520, CY], [390, 520, MG]].forEach(([x, y, c], j) => { const kk = ramp(t, s(8) + .5 + j * .8, .5); ctx.globalCompositeOperation = 'lighter'; pts.forEach((p, i) => { if (i % 2) return; const q = proj(p, Math.sin(t * .9) * .4, 0, 62, x, y); dot(q.x, q.y, 2, c, .7 * kk); }); ctx.globalCompositeOperation = 'source-over'; });
  const u = ramp(t, s(9) - .2, .35); if (u > 0) { ctx.globalAlpha = u; ctx.fillStyle = 'rgba(6,5,14,.78)'; ctx.fillRect(0, 130, W, 520); ctx.globalAlpha = 1; const q = pop(ramp(t, s(9) - .1, .5)); dot(270, 380, 230 * q, LI, .55); text('MATCH', 270, 330, 62 * q, LI, { glow: 28 }); lock(270, 440, t - s(9)); } });
function lock(x, y, k) { const o = ease(ramp(k, .2, .5)); ctx.strokeStyle = LI; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y - 28 - 18 * o, 26, Math.PI, 0); ctx.lineTo(x + 26, y - 28 + (o ? 0 : 0)); ctx.stroke(); ctx.fillStyle = LI; ctx.beginPath(); ctx.roundRect(x - 44, y - 28, 88, 66, 12); ctx.fill(); ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(x, y - 2, 8, 0, 7); ctx.fill(); ctx.fillRect(x - 3, y - 2, 6, 20); }
// E on device
sc(s(10) - .1, s(11) - .1, t => { chapter('07', 'ON YOUR DEVICE', s(10), t); const k = ramp(t, s(10), .5); ctx.globalAlpha = k; ctx.strokeStyle = '#7d6cff'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(16,12,40,.95)'; ctx.beginPath(); ctx.roundRect(190, 210, 160, 300, 28); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
  barRow(210, 330, 120, 70, t, LI, k, 3, 0); ctx.globalAlpha = k; ctx.fillStyle = LI; ctx.beginPath(); ctx.roundRect(252, 440, 36, 28, 6); ctx.fill(); ctx.strokeStyle = LI; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(270, 440, 12, Math.PI, 0); ctx.stroke(); ctx.globalAlpha = 1;
  // cloud with blocked arrow
  const ck = ramp(t, s(10) + 1.1, .5); ctx.globalAlpha = ck * .9; ctx.fillStyle = '#2a2158'; ctx.strokeStyle = '#8a7cff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(440, 190, 30, 0, 7); ctx.arc(480, 205, 24, 0, 7); ctx.arc(400, 207, 22, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  const ak = ramp(t, s(10) + 1.6, 1.2); const ax = lerp(350, 400, Math.min(.8, ak)); ctx.strokeStyle = MG; ctx.lineWidth = 3; ctx.globalAlpha = ck; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(350, 300); ctx.lineTo(ax, lerp(300, 235, Math.min(.8, ak))); ctx.stroke(); ctx.setLineDash([]); const bk = ramp(t, s(10) + 2, .3); ctx.globalAlpha = bk; ctx.strokeStyle = '#ff5a6e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(366, 250); ctx.lineTo(396, 280); ctx.moveTo(396, 250); ctx.lineTo(366, 280); ctx.stroke(); ctx.globalAlpha = 1;
  tag('STAYS ON THE PHONE', 270, 560, LI, ramp(t, s(10) + 1, .3)); });
// F no depth (photo)
sc(s(11) - .1, s(12) - .1, t => { chapter('08', 'FLAT PHOTO TEST', s(11), t); const sw = ramp(t, s(11) + 1.6, .5); const yaw = Math.sin(t * 1.2) * .7;
  ctx.globalCompositeOperation = 'lighter'; pts.forEach(p => { const q0 = proj({ x: p.x, y: p.y, z: 0 }, yaw, 0, FS * .95, 135, 400); const q1 = proj(p, yaw, 0, FS * .95, 405, 400); dot(q0.x, q0.y, 2.6, '#ff6a7a', .6); dot(q1.x, q1.y, (2.4 + 2.2 * p.z), depthCol(p.z), .7); }); ctx.globalCompositeOperation = 'source-over';
  const a1 = ramp(t, s(11) + .5, .3); tag('PHOTO · DEPTH 0', 135, 600, '#ff5a6e', a1); tag('REAL FACE', 405, 600, LI, ramp(t, s(11) + 1.4, .3));
  const xk = pop(ramp(t, s(11) + 1.2, .5)); ctx.globalAlpha = xk; ctx.strokeStyle = '#ff5a6e'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(110, 150); ctx.lineTo(160, 200); ctx.moveTo(160, 150); ctx.lineTo(110, 200); ctx.stroke(); ctx.strokeStyle = LI; ctx.beginPath(); ctx.moveTo(380, 178); ctx.lineTo(398, 200); ctx.lineTo(432, 150); ctx.stroke(); ctx.globalAlpha = 1; });
// G attention
sc(s(12) - .1, s(13) - .1, t => { chapter('09', 'ATTENTION AWARE', s(12), t); const k = ramp(t, s(12), .5); const look = ramp(t, s(12) + 2.2, .6), blink = (t > s(12) + 1 && t < s(12) + 1.4) ? Math.abs(Math.sin((t - s(12) - 1) * 7.85)) : 1; const op = (1 - .9 * (1 - blink));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(270, 360); ctx.strokeStyle = CY; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(20,16,50,.9)'; ctx.beginPath(); ctx.moveTo(-130, 0); ctx.quadraticCurveTo(0, -120 * op, 130, 0); ctx.quadraticCurveTo(0, 120 * op, -130, 0); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.moveTo(-130, 0); ctx.quadraticCurveTo(0, -120 * op, 130, 0); ctx.quadraticCurveTo(0, 120 * op, -130, 0); ctx.clip(); const ix = lerp(-50, 0, look), iy = lerp(-14, 36, look); dot(ix, iy, 120, VI, .6); ctx.fillStyle = '#7d6cff'; ctx.beginPath(); ctx.arc(ix, iy, 46, 0, 7); ctx.fill(); ctx.fillStyle = BG; ctx.beginPath(); ctx.arc(ix, iy, 20, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ix - 14, iy - 14, 8, 0, 7); ctx.fill(); ctx.restore(); ctx.restore();
  // gaze line to phone
  const gl = ramp(t, s(12) + 2.2, .8); phone(t, k); ctx.globalAlpha = gl * .8; ctx.strokeStyle = LI; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(270, 396); ctx.lineTo(270, PY - 24); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  tag('EYES OPEN', 120, 520, CY, ramp(t, s(12) + .8, .3)); tag('LOOKING AT THE SCREEN', 330, 560, LI, ramp(t, s(12) + 2.4, .3)); });
// H adapts + passcode
sc(s(13) - .1, s(15) - .1, t => { const ad = t < s(14) - .1; chapter('10', ad ? 'ADAPTS' : 'BIG CHANGE', ad ? s(13) : s(14), t); const yaw = Math.sin(t * .9) * .4;
  const grow = ad ? ramp(t, s(13) + .8, 2) : 1 - ramp(t, s(14) + .8, 1.2); ctx.globalCompositeOperation = 'lighter';
  pts.forEach(p => { const q = proj(p, yaw, 0, FS * .9, 270, 360); dot(q.x, q.y, (2.4 + 2 * p.z) * q.f, depthCol(p.z), .6); }); beard.forEach((p, i) => { const k = clamp(grow * 1.4 - (i % 10) / 14); if (k <= 0) return; const q = proj(p, yaw, 0, FS * .9, 270, 360); dot(q.x, q.y, 5 * k + 1.5, LI, .9 * Math.min(1, k * 3)); }); ctx.globalCompositeOperation = 'source-over';
  if (ad) { tag('SMALL CHANGES: LEARNS', 270, 620, LI, ramp(t, s(13) + 1.2, .3)); }
  else { const pk = ramp(t, s(14) + 1.5, .5); tag('FULL BEARD GONE', 270, 600, '#ff9a5a', ramp(t, s(14) + .6, .3)); ctx.globalAlpha = pk; for (let i = 0; i < 6; i++) { ctx.strokeStyle = CY; ctx.lineWidth = 2.5; ctx.fillStyle = i < Math.floor(ramp(t, s(14) + 2.2, 1.4) * 6.99) ? CY : 'rgba(0,0,0,0)'; ctx.beginPath(); ctx.arc(190 + i * 32, 665, 9, 0, 7); ctx.fill(); ctx.stroke(); } ctx.globalAlpha = 1; text('PASSCODE', 270, 705, 15, '#d9d2ff', { f: MONO, w: 700, ls: 4, a: pk }); } });
// I one in a million
const mil = document.createElement('canvas'); mil.width = mil.height = 400; { const x = mil.getContext('2d'); const im = x.createImageData(400, 400); for (let i = 0; i < 400 * 400; i++) { const v = 40 + R() * 70; im.data[i * 4] = v * .6; im.data[i * 4 + 1] = v * .5; im.data[i * 4 + 2] = v * 1.4; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); }
sc(s(15) - .1, s(16) - .1, t => { chapter('11', 'RANDOM STRANGER', s(15), t); const k = ramp(t, s(15), .6); ctx.globalAlpha = k; ctx.imageSmoothingEnabled = false; ctx.drawImage(mil, 70, 190, 400, 400); ctx.globalAlpha = 1; ctx.strokeStyle = '#7d6cff'; ctx.lineWidth = 2; ctx.strokeRect(69, 189, 402, 402);
  const hk = ramp(t, s(15) + 1.2, .4); dot(380, 300, 40 + 20 * pulse(t), LI, hk * .9); ctx.globalAlpha = hk; ctx.fillStyle = LI; ctx.fillRect(378, 298, 5, 5); ctx.globalAlpha = 1;
  text('1 IN 1,000,000', 270, 640, 44, WH, { glow: 22, a: ramp(t, s(15) + 1.6, .4) }); text('(or less)', 270, 680, 18, CY, { f: MONO, w: 600, a: ramp(t, s(15) + 2.4, .4), ls: 3 }); });
// J twins
sc(s(16) - .1, s(17) - .1, t => { chapter('12', 'LOOK-ALIKES', s(16), t); const yaw = Math.sin(t * .8) * .3; ctx.globalCompositeOperation = 'lighter'; [[145, CY], [395, MG]].forEach(([x, c], j) => { const kk = ramp(t, s(16) + j * .3, .5); pts.forEach(p => { const q = proj(p, yaw * (j ? -1 : 1), 0, 100, x, 360); dot(q.x, q.y, 2.6, c, .75 * kk); }); }); ctx.globalCompositeOperation = 'source-over';
  const q = pop(ramp(t, s(16) + .9, .5)); text('=', 270, 360, 60 * q, LI, { glow: 18 }); text('?', 270, 420, 34 * q, LI, {});
  tag('TWINS', 120, 560, CY, ramp(t, s(16) + 1.2, .3)); tag('SIBLINGS', 270, 600, LI, ramp(t, s(16) + 2.1, .3)); tag('UNDER 13', 420, 560, MG, ramp(t, s(16) + 2.9, .3)); });
// K shape
sc(s(17) - .1, s(18) - .15, t => { chapter('13', 'SHAPE', s(17), t); const yaw = Math.sin(t * .8) * .6; ctx.globalCompositeOperation = 'lighter'; pts.forEach(p => { const k = ramp(t, s(17) + p.d * .6, .4); const q = proj(p, yaw, 0, FS * 1.05); dot(q.x, q.y, (2.6 + 2.2 * p.z) * q.f * (1 + .5 * pulse(t) * (1 - p.d)), depthCol(p.z), k * (.55 + .5 * p.z)); }); ctx.globalCompositeOperation = 'source-over';
  text('SHAPE', 270, 150, 66, WH, { glow: 24, a: ramp(t, s(17) + 1.4, .3) }); text('NOT FACE', 270, 205, 40, MG, { glow: 22, a: ramp(t, s(17) + 1.9, .3) }); });
// L end
sc(s(18) - .15, 1e9, t => { const k = pop(ramp(t, s(18) - .1, .6)); const q = ramp(t, s(18) - .1, .3); ctx.globalCompositeOperation = 'lighter'; pts.forEach(p => { const pp = proj(p, Math.sin(t) * .5, 0, FS * (.7 + .3 * k), 270, 330); dot(pp.x, pp.y, 2.4 * pp.f, depthCol(p.z), .28); }); ctx.globalCompositeOperation = 'source-over';   text('Follow for more of', 270, 570, 30, '#e9e6ff', { w: 600, a: q }); text('how it really works.', 270, 630, 41 * (.8 + .2 * k), LI, { glow: 22, a: q }); });
const capUp = captions(document.getElementById('cap'));
window.seek = t => { ctx.setTransform(2, 0, 0, 2, 0, 0); bg(t); S.forEach(o => { if (t >= o.a && t < o.b) { const f = ramp(t, o.a, .12) * (o.b > 1e8 ? 1 : 1 - ramp(t, o.b - .12, .12)); ctx.save(); ctx.globalAlpha = 1; o.fn(t); ctx.restore(); if (f < 1 && o.a > 0) { ctx.globalAlpha = (1 - f) * .85; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } } }); capUp(t); };
window.ready = true;
