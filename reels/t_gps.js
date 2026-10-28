// t_gps.js: "How does your phone's GPS know where you are?" in template #1 paper-lantern (Paper-cut Lightbox, lemo-opuscar paper-lantern),
// same module as foxfire. Every shot is one lit shadow box: baked cut-paper layers (back light -> front dark, backlight + pulp mottle, cast shadows,
// blurred front layer), emissive light (here: the satellites' signals, the blue dot), paper strips that grow from an edge, handwritten tags,
// a vertical title strip with a red seal, paper-on-a-stick motion and dissolves.
// Batch N layout: the lamp window is moved to y 270-1130 (BOX override) so nothing is written in the top 250 px; captions sit on the dark room
// below the lamp at y 1180-1400; the bottom 480 px is only the table and the lamp's spill light; nothing written in the right column below y 840.
import { createLantern, W, H, BOX, PAL, clamp, lerp, seg, ss, eo, backOut, hash, glow, rr, subtitle, tag, makeSheet, putSheet,
  layer, put, lampFrame, vignette, strip, vstrip, sealMark, bloom, flick } from './styles/lantern/lantern.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"'), document.fonts.load('700 40px Caveat')]);
BOX.y = 270; BOX.h = 860;
const g = createLantern(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, r = (i, d) => T(i) + d, TOT = TL.total;
const BW = BOX.w, BH = BOX.h, TAU = Math.PI * 2;
const win = (t, a, b, f = .45) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const SIG = '140,210,255', DOT = '90,160,255';

// ---------- baked paper layers (box-local) ----------
const NIGHT = { light: [470, 200], lightCol: '150,180,255' };
function earthP(g2, cy, rad) { g2.beginPath(); g2.arc(470, cy, rad, 0, TAU); g2.fill(); }
function townP(g2, y) { g2.beginPath(); g2.moveTo(-100, BH + 100); g2.lineTo(-100, y); for (let i = 0; i < 26; i++) { const x = -60 + i * 44, h = 30 + 90 * hash(i * 3.1); g2.lineTo(x, y - h); g2.lineTo(x + 36, y - h); g2.lineTo(x + 36, y - 10 * hash(i)); } g2.lineTo(1100, y); g2.lineTo(1100, BH + 100); g2.fill(); }
function hillsP(g2, y, amp, n) { g2.beginPath(); g2.moveTo(-100, BH + 100); for (let x = -100; x <= 1100; x += 20) g2.lineTo(x, y - amp * Math.sin(x / 1000 * Math.PI * n + 1)); g2.lineTo(1100, BH + 100); g2.fill(); }
const L = {
  earth: layer(g2 => earthP(g2, 1450, 900), { col: '#2f5fa8', trans: .85, light: [470, 560], lightCol: '120,190,255' }),
  earthBig: layer(g2 => earthP(g2, 560, 300), { col: '#2f6fb3', trans: .9, light: [420, 470], lightCol: '140,200,255' }),
  land: layer(g2 => { [[380, 470, 90, 60], [520, 560, 70, 90], [430, 650, 60, 40], [560, 440, 40, 30]].forEach(([x, y, a, b]) => { g2.beginPath(); g2.ellipse(x, y, a, b, .4, 0, TAU); g2.fill(); }); }, { col: '#5f9e63', trans: .6, light: [420, 470], lightCol: '180,255,180' }),
  hills: layer(g2 => hillsP(g2, 720, 40, 2), { col: '#28356f', trans: .5, ...NIGHT }),
  town: layer(g2 => townP(g2, 790), { col: '#141b3f', trans: .2, ...NIGHT }),
  front: layer(g2 => { g2.beginPath(); g2.ellipse(-40, BH + 20, 260, 170, 0, 0, TAU); g2.ellipse(BW + 40, BH + 30, 280, 180, 0, 0, TAU); g2.fill(); }, { col: '#070a1c', trans: 0, blur: 3 }),
};
// small cut-paper sprites
const SAT = makeSheet(260, 140, c => { c.fillStyle = '#000'; c.fillRect(100, 40, 60, 60); for (const x of [10, 170]) { c.fillRect(x, 50, 80, 40); } c.fillRect(90, 66, 80, 8); c.beginPath(); c.arc(130, 30, 14, 0, TAU); c.fill();
  c.globalCompositeOperation = 'destination-out'; for (const x0 of [10, 170]) for (let i = 1; i < 4; i++) c.fillRect(x0 + i * 20 - 1, 52, 2, 36); }, { col: '#e9d6a8' });
const PHONE = makeSheet(200, 360, c => { c.fillStyle = '#000'; rr(c, 10, 10, 180, 340, 30); c.fill(); c.globalCompositeOperation = 'destination-out'; rr(c, 26, 50, 148, 250, 10); c.fill(); }, { col: '#2a2140' });
const CLOCK = makeSheet(300, 300, c => { c.fillStyle = '#000'; c.beginPath(); c.arc(150, 150, 140, 0, TAU); c.fill(); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.arc(150 + Math.cos(a) * 112, 150 + Math.sin(a) * 112, i % 3 ? 5 : 9, 0, TAU); c.fill(); } }, { col: '#f1dfb4' });
function sky(t, o = {}) { const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, '#0b1233'); gr.addColorStop(1, o.warm ? '#3a2c5e' : '#22306e'); g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.3) * BW, y = hash(i * 7.1) * BH * .8, tw = .5 + .5 * Math.sin(t * 2 + i); g.fillStyle = `rgba(255,240,210,${.25 + .5 * tw * hash(i)})`; g.beginPath(); g.arc(x, y, 1.2 + 1.6 * hash(i * 2), 0, TAU); g.fill(); } }
function sat(x, y, sc = 1, a = 1, t = 0) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(.15 * Math.sin(t * .7 + x)); putSheet(g, SAT, -130 * sc, -70 * sc, { sc, sh: .8 }); g.restore(); glow(g, x, y - 40 * sc, 34 * sc, '255,220,160', .6 * a); }
function phone(x, y, sc, t, o = {}) { const a = o.a ?? 1; g.save(); g.globalAlpha *= a;
  const sx = x - 100 * sc, sy = y - 180 * sc; g.fillStyle = '#d9e6f2'; g.fillRect(sx + 26 * sc, sy + 50 * sc, 148 * sc, 250 * sc);   // the map on the screen
  g.strokeStyle = 'rgba(120,140,170,.7)'; g.lineWidth = 3 * sc; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(sx + 26 * sc, sy + (90 + i * 60) * sc); g.lineTo(sx + 174 * sc, sy + (70 + i * 66) * sc); g.stroke(); }
  putSheet(g, PHONE, sx, sy, { sc, sh: .9 }); const dx = o.dx || 0, p = .7 + .3 * Math.sin(t * 4);
  if (o.dot !== false) { g.fillStyle = 'rgba(70,130,255,.25)'; g.beginPath(); g.arc(x + dx, y + 0, 34 * sc * p, 0, TAU); g.fill(); g.fillStyle = '#3a7bff'; g.strokeStyle = '#fff'; g.lineWidth = 4 * sc; g.beginPath(); g.arc(x + dx, y, 14 * sc, 0, TAU); g.fill(); g.stroke(); }
  g.restore(); }
function ring(x, y, rad, a, col = SIG, w = 4) { if (a <= 0 || rad <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${col},${.8 * a})`; g.lineWidth = w; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.stroke(); g.lineWidth = w * 4; g.strokeStyle = `rgba(${col},${.15 * a})`; g.stroke(); g.restore(); }
function pulse(x0, y0, x1, y1, u, a = 1) { if (u <= 0 || u >= 1) return; const x = lerp(x0, x1, u), y = lerp(y0, y1, u); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${SIG},${.35 * a})`; g.lineWidth = 3; g.setLineDash([6, 10]); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore(); bloom(g, x, y, 40, SIG, a); }
function clockFace(x, y, sc, t, speed = 1, o = {}) { putSheet(g, CLOCK, x - 150 * sc, y - 150 * sc, { sc, sh: .8 }); const a = t * speed;
  g.save(); g.translate(x, y); g.strokeStyle = '#2a2140'; g.lineCap = 'round'; g.lineWidth = 9 * sc; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a / 12 - Math.PI / 2) * 60 * sc, Math.sin(a / 12 - Math.PI / 2) * 60 * sc); g.stroke();
  g.lineWidth = 5 * sc; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - Math.PI / 2) * 95 * sc, Math.sin(a - Math.PI / 2) * 95 * sc); g.stroke(); g.restore();
  if (o.atom) for (let i = 0; i < 3; i++) { const ang = i * TAU / 3; g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = 'rgba(255,200,120,.7)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, 150 * sc, 46 * sc, 0, 0, TAU); g.stroke(); const e = t * 3 + i; bloom(g, Math.cos(e) * 150 * sc, Math.sin(e) * 46 * sc, 16, '255,210,140', .8); g.restore(); } }
const cam0 = { x: 0, y: 0 };

// ---------- shots ----------
const S = [];
// A: hook: satellites over the curve of the Earth, signals raining down on a phone with a blue dot
S.push([0, T(1), t => { sky(t); const cam = { x: 20 * Math.sin(t * .3), y: 0 }; put(g, L.earth, cam, .2);
  [[150, 190], [400, 120], [650, 170], [830, 260]].forEach(([x, y], i) => { sat(x + 6 * Math.sin(t + i), y, .6, 1, t); pulse(x, y, 520, 660, ((t * .45 + i * .25) % 1), .9); });
  put(g, L.town, cam, .6); phone(520, 660, .55, t); put(g, L.front, cam, 1); vstrip(g, 'GPS', 80, 30, 1, { size: 60, seal: 'GPS' });
  strip(g, 'clocks in space', 560, 410, t < .02 ? 1 : seg(t, 0, .6), { size: 64, rot: -.03 }); }]);
// B: the question: the phone close, the blue dot pulsing
S.push([T(1) - .3, T(2), t => { sky(t); put(g, L.hills, cam0, .4); put(g, L.town, cam0, .6); phone(470, 520, 1.15, t); put(g, L.front, cam0, 1);
  strip(g, 'how does it know?', 470, 80, seg(t, T(1), T(1) + .7), { size: 70, seal: true }); tag(g, 'you are here', 700, 300, { k: backOut(seg(t, T(1) + 1, T(1) + 1.4)), rot: .05 }); }]);
// C: the constellation: Earth, six orbit planes, about thirty satellites
S.push([T(2) - .3, T(3), t => { sky(t); put(g, L.earthBig, cam0, .2); put(g, L.land, cam0, .2);
  for (let p = 0; p < 6; p++) { const rot = p / 6 * Math.PI; g.save(); g.translate(470, 560); g.rotate(rot); g.strokeStyle = 'rgba(255,230,180,.28)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 420, 130, 0, 0, TAU); g.stroke();
    for (let k = 0; k < 5; k++) { const a = (t - T(2)) * .35 + k / 5 * TAU + p, x = Math.cos(a) * 420, y = Math.sin(a) * 130; if (Math.sin(a) < 0 && Math.hypot(x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)) < 300) continue; g.fillStyle = '#ffe6b0'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); } g.restore(); }
  strip(g, '≈ 30 satellites', 300, 90, seg(t, T(2) + .3, T(2) + .9), { size: 60 }); tag(g, '20,200 km up', 700, 170, { k: backOut(seg(t, T(2) + 2.4, T(2) + 2.8)) }); tag(g, 'twice a day', 240, 800, { k: backOut(seg(t, T(2) + 1.4, T(2) + 1.8)), rot: .04 }); }]);
// D: one satellite broadcasting: where it is + what time it is
S.push([T(3) - .3, T(4), t => { sky(t); put(g, L.earth, cam0, .2); const x = 470, y = 300; for (let i = 0; i < 4; i++) ring(x, y, ((t * 120 + i * 90) % 360) + 40, 1 - (((t * 120 + i * 90) % 360) / 360));
  sat(x, y, 1.3, 1, t); strip(g, 'where I am', 280, 560, seg(t, r(3, 1.6), r(3, 2.2)), { size: 60 }); strip(g, 'what time it is', 560, 680, seg(t, r(3, 2.7), r(3, 3.3)), { size: 60, seal: true }); }]);
// E: the delay -> the distance
S.push([T(4) - .3, T(6), t => { sky(t); put(g, L.hills, cam0, .4); put(g, L.town, cam0, .6); const sx = 200, sy = 140, px = 700, py = 640; sat(sx, sy, .8, 1, t);
  const u = ((t - T(4)) * .45) % 1; pulse(sx, sy, px, py - 40, u); phone(px, py, .6, t, { dot: t > T(5) }); put(g, L.front, cam0, 1);
  strip(g, 'speed of light', 470, 70, seg(t, r(4, .3), r(4, .9)), { size: 58 }); tag(g, '≈ 0.07 s', 330, 420, { k: backOut(seg(t, r(4, 2.4), r(4, 2.8))), size: 50 });
  if (t > T(5) - .2) { g.save(); g.strokeStyle = 'rgba(255,230,180,.9)'; g.lineWidth = 3; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(sx + 40, sy + 60); g.lineTo(px - 60, py - 100); g.stroke(); g.restore();
    tag(g, 'delay → distance', 560, 330, { k: backOut(seg(t, r(5, .4), r(5, .8))), size: 46, rot: .08 }); } }]);
// F: trilateration: spheres -> a circle -> two points -> one point
S.push([T(6) - .3, T(10), t => { sky(t); const P0 = [470, 560], sats = [[150, 150], [800, 170], [480, 60], [880, 520]];
  const kN = [seg(t, T(6) + .2, T(6) + 1.4), seg(t, T(7) + .1, T(7) + 1.2), seg(t, r(7, 1.6), r(7, 2.6)), seg(t, T(8) + .2, T(8) + 1.2)];
  sats.forEach(([x, y], i) => { if (kN[i] <= 0 && i > 0) return; sat(x, y, .55, 1, t); const d = Math.hypot(P0[0] - x, P0[1] - y); ring(x, y, d * eo(kN[i]), 1, i === 3 ? '255,200,140' : SIG, 4); });
  const pts = t < T(7) ? 0 : t < r(7, 1.6) ? 1 : t < T(8) ? 2 : 3;
  if (pts === 2 || pts === 3) { const q = [[470, 560], [430, 300]]; q.forEach(([x, y], j) => { if (pts === 3 && j === 1) return; bloom(g, x, y, 30, '255,240,200', .9); }); }
  if (pts >= 3 && kN[3] >= 1) { bloom(g, P0[0], P0[1], 70, DOT, 1); g.fillStyle = '#3a7bff'; g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(P0[0], P0[1], 16, 0, TAU); g.fill(); g.stroke(); tag(g, 'you!', 620, 640, { k: backOut(seg(t, r(8, 1.4), r(8, 1.8))) }); }
  strip(g, ['a sphere', 'a circle', 'two points', 'one point'][pts], 470, 790, 1, { size: 58 });
  if (t > T(9) - .1) strip(g, 'trilateration', 470, 680, seg(t, T(9), T(9) + .6), { size: 76, seal: true }); }]);
// G: the twist: an atomic clock in every satellite; then "Einstein"
S.push([T(10) - .3, T(12), t => { sky(t, { warm: true }); clockFace(470, 430, 1.2, t, 3, { atom: true }); bloom(g, 470, 430, 200, '255,200,140', .25);
  strip(g, 'atomic clock', 470, 760, seg(t, r(10, 3.4), r(10, 4.0)), { size: 70 }); tag(g, 'timing must be perfect', 470, 90, { k: backOut(seg(t, r(10, 1.0), r(10, 1.4))), size: 44 });
  if (t > T(11) - .1) { vstrip(g, 'EINSTEIN', 860, 20, seg(t, T(11), T(11) + 1.0), { size: 52, seal: 'E=mc²' }); } }]);
// H: relativity: ground clock vs satellite clock: -7, +45, net +38 microseconds a day
S.push([T(12) - .3, T(15), t => { sky(t); put(g, L.earth, cam0, .2); const net = t > T(14) - .1;
  clockFace(250, 470, .7, t, 2); tag(g, 'ground', 250, 680, { k: 1, size: 40 }); sat(700, 230, .7, 1, t); clockFace(700, 470, .7, t, net ? 2.3 : t > T(13) - .1 ? 2.6 : 1.6);
  if (t > T(12)) { strip(g, 'speed: −7 µs a day', 470, 80, seg(t, r(12, .6), r(12, 1.2)), { size: 50, a: t < T(13) - .1 ? 1 : .45 }); }
  if (t > T(13) - .1) strip(g, 'gravity: +45 µs a day', 470, 160, seg(t, r(13, .4), r(13, 1.0)), { size: 50, a: net ? .45 : 1 });
  if (net) strip(g, '+38 µs a day', 470, 780, seg(t, r(14, .3), r(14, .9)), { size: 82, seal: true }); }]);
// I: uncorrected: the blue dot drifts off across the map, about 10 km a day
S.push([T(15) - .3, T(16), t => { sky(t); put(g, L.hills, cam0, .4); put(g, L.town, cam0, .6); const u = ss(seg(t, r(15, .6), r(15, 3.6)));
  phone(470, 520, 1.15, t, { dx: lerp(0, 70, u) }); put(g, L.front, cam0, 1); strip(g, 'uncorrected', 470, 80, seg(t, T(15), T(15) + .6), { size: 66 });
  tag(g, `+${Math.round(10 * u)} km`, 760, 360, { k: backOut(seg(t, r(15, 1.0), r(15, 1.4))), size: 56, rot: .06 }); tag(g, 'every day', 760, 450, { k: backOut(seg(t, r(15, 2.6), r(15, 3.0))), size: 40, rot: .04 }); }]);
// J: corrected: the dot snaps back
S.push([T(16) - .3, T(17), t => { sky(t); put(g, L.hills, cam0, .4); put(g, L.town, cam0, .6); const u = 1 - eo(seg(t, r(16, .6), r(16, 1.4)));
  phone(470, 520, 1.15, t, { dx: 70 * u }); put(g, L.front, cam0, 1); strip(g, 'corrected', 470, 80, seg(t, T(16), T(16) + .6), { size: 66, seal: true }); bloom(g, 470, 520, 80 * (1 - u), DOT, .7 * (1 - u)); }]);
// K: the question
S.push([T(17) - .3, T(18), t => { sky(t); put(g, L.earth, cam0, .2); strip(g, 'your phone needs Einstein?', 470, 180, seg(t, T(17), T(17) + .8), { size: 58 });
  sat(470, 520, .8, 1, t); }]);
// L: the standard end card (loops to the satellites over the Earth)
S.push([T(18) - .35, TOT + 1, t => { sky(t); put(g, L.earth, cam0, .2); [[150, 560], [790, 600]].forEach(([x, y], i) => sat(x, y, .5, 1, t));
  strip(g, 'Follow for more of', 470, 150, seg(t, T(18) - .2, T(18) + .5), { size: 60 }); strip(g, 'how it really works.', 470, 270, seg(t, T(18) + .3, T(18) + 1.0), { size: 72, seal: true });
  }]);

function scene(t) { g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H); g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .45, b); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  vignette(g, .5); g.restore(); lampFrame(g, '140,190,255', .28); }
function sub(t) { let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur < 0 || cur === PH.length - 1) return;
  const p = PH[cur], nx = PH[cur + 1].start, a = seg(t, p.start - .05, p.start + .15) * (1 - seg(t, nx - .25, nx - .05)); subtitle(g, p.cap, cur === 0 ? (1 - seg(t, nx - .25, nx - .05)) : a, 1240); }
window.DUR = TOT;
// the room under the lamp (Batch N band y 1180-1420): the yes/no tags and the end-card lines are paper tags lying on the table
function room(t) { if (t > T(17) - .2 && t < T(18) - .3) { const a = 1 - seg(t, T(18) - .6, T(18) - .3); tag(g, 'YES', 330, 1395, { k: backOut(seg(t, r(17, 1.0), r(17, 1.4))), size: 64, col: '#ffd9a0', a }); tag(g, 'NO', 750, 1395, { k: backOut(seg(t, r(17, 1.3), r(17, 1.7))), size: 64, col: '#bcd6ff', a }); }
  if (t > T(18) - .35) { tag(g, "A new 'wait, really?' every day.", 540, 1230, { k: backOut(seg(t, T(18) + .8, T(18) + 1.2)), size: 50 }); tag(g, '@howitreallyworkstudio', 540, 1340, { k: backOut(seg(t, T(18) + 1.0, T(18) + 1.4)), size: 44, col: '#ffd9a0' }); } }
window.seek = t => { scene(t); sub(t); room(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .35; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { const t = 2; g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H); g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  sky(t); put(g, L.earth, cam0, .2); [[150, 190], [400, 120], [650, 170], [830, 260]].forEach(([x, y], i) => { sat(x, y, .6, 1, t); pulse(x, y, 520, 660, .3 + i * .15, .9); });
  put(g, L.town, cam0, .6); phone(520, 660, .55, t); strip(g, 'HOW GPS', 470, 380, 1, { size: 96 }); strip(g, 'FINDS YOU', 470, 500, 1, { size: 96, seal: true }); vignette(g, .45); g.restore(); lampFrame(g, '140,190,255', .3); };
window.seek(0); window.ready = true; window.READY = true;
