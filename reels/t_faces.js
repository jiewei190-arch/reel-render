// t_faces.js: "Why you see faces (and ghosts) in pumpkins, clouds and outlets" in template #13 collage "AI Doom" (demo 78). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: little paper sets (wall + floor + baseboard), the kid and the orange box creature, museum gallery with gold frames, plaques
// and velvet rope (incl. the demo's Magritte "Ceci n'est pas..." joke), blueprint scene, chalkboards with chalk handwriting, thought bubble,
// lab machine with lamps, ransom-note letters on cork; watercolour mottle inside the flat fills; karaoke caption; hard cuts with a short whip blur.
import { createAD, W, H, TAU, C, clamp, lerp, ramp, ss, eo, bo, hash, FONTS } from './styles/aidoom/aidoom.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const AD = createAD(document.getElementById('c')), g = AD.g, lg = AD.lg, R = ramp;
// watercolour mottle (the demo's fills are blotchy washes, not flat): soft large blotches, multiplied over the set at low alpha
const mot = document.createElement('canvas'); mot.width = W; mot.height = H; { const m = mot.getContext('2d'); m.fillStyle = '#fff'; m.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) { const x = hash(i * 4.1) * W, y = hash(i * 5.3) * H, r = 60 + hash(i * 6.7) * 220, rg = m.createRadialGradient(x, y, 0, x, y, r); const d = 200 + hash(i * 8.9) * 40;
    rg.addColorStop(0, `rgba(${d},${d - 18},${d - 40},.22)`); rg.addColorStop(1, 'rgba(255,255,255,0)'); m.fillStyle = rg; m.fillRect(x - r, y - r, 2 * r, 2 * r); } }
const wash = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.drawImage(mot, 0, 0); g.restore(); };
const ransomLine = (w, y, sz, seed, k = 1, x0 = 540) => { const step = sz * .74, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, x0 - tw / 2 + step / 2 + i * step, y, sz, seed + i * 7, typeof k === 'function' ? k(i) : k); }); };

// ---------- props ----------
// US wall outlet: two slots (eyes) + round ground hole (mouth). blink 0..1 squashes the slots.
function outlet(x, y, sc, t, o = {}) { const c = lg; c.save(); c.translate(x, y); c.scale(sc, sc); AD.use(c);
  AD.shape(AD.rbox(-150, -230, 300, 460, 40), o.plate || '#f3ead6', { seed: 200, t, lw: 6 });
  AD.shape(AD.poly(0, -195, 13, 13, 12), '#ddd2ba', { seed: 201, lw: 3 }); AD.line([[-8, -195], [8, -195]], { lw: 3, wob: 0 });
  AD.shape(AD.poly(0, 195, 13, 13, 12), '#ddd2ba', { seed: 202, lw: 3 }); AD.line([[-8, 195], [8, 195]], { lw: 3, wob: 0 });
  const bl = 1 - (o.blink || 0) * .85, sh = o.glow ? '#ffd64a' : '#3a2a22';
  for (const sd of [-1, 1]) AD.shape(AD.box(sd * 52 - 11, -90 - 44 * bl, 22, 88 * bl, 2), sh, { seed: 203 + sd, t, lw: 4 });
  AD.shape([[-30, 70], [30, 70], [30, 50], [20, 22], [0, 12], [-20, 22], [-30, 50]].map(([a, b]) => [a, b + 20]), sh, { seed: 206, t, lw: 4 });
  c.restore(); AD.use(lg); }
// jack-o'-lantern (paper cut-out): ribs, stem, triangle eyes, zigzag grin glowing yellow
function pumpkin(x, y, r, t, o = {}) { const c = lg; c.save(); c.translate(x, y); AD.use(c);
  [-.62, .62, -.32, .32, 0].forEach((k, i) => AD.shape(AD.poly(k * r, 0, r * (1 - Math.abs(k) * .45), r * .82, 26), i < 4 ? '#d9692a' : '#e8803a', { seed: 210 + i, t, lw: 4 }));
  AD.shape([[-r * .08, -r * .78], [r * .1, -r * .78], [r * .2, -r * 1.08], [r * .06, -r * 1.12]], '#5f7a3a', { seed: 216, t, lw: 4 });
  if (o.face !== false) { const gl = o.glow ?? 1, col = `rgba(255,${200 + 30 * gl},${60 + 40 * gl},1)`; const fc = gl > 0 ? col : '#4a2a14';
    for (const sd of [-1, 1]) AD.shape([[sd * r * .18, -r * .08], [sd * r * .52, -r * .08], [sd * r * .36, -r * .42]], fc, { seed: 217 + sd, t, lw: 4 });
    AD.shape([[-r * .2, r * .12], [r * .2, r * .12], [0, -r * .1]], fc, { seed: 220, t, lw: 4 });
    const m = []; for (let i = 0; i <= 8; i++) m.push([lerp(-r * .55, r * .55, i / 8), r * .28 + (i % 2 ? r * .1 : 0)]); for (let i = 8; i >= 0; i--) m.push([lerp(-r * .55, r * .55, i / 8) * .9, r * .5 - (i % 2 ? 0 : r * .08)]);
    AD.shape(m, fc, { seed: 221, t, lw: 4 }); }
  c.restore(); AD.use(lg); }
// puffy cloud with an accidental face (two dark puffs for eyes + a curved gap)
function cloud(x, y, sc, t, o = {}) { const c = lg; c.save(); c.translate(x, y); c.scale(sc, sc); AD.use(c);
  [[-110, 20, 80], [-40, -30, 100], [60, -20, 95], [130, 30, 70], [0, 50, 110]].forEach(([a, b, r], i) => AD.shape(AD.poly(a, b, r, r * .82, 24), '#f6f2ea', { seed: 230 + i, t, lw: 4 }));
  if (o.face) { AD.shape(AD.poly(-40, 0, 14, 18, 12), '#8d93a8', { seed: 236, lw: 3 }); AD.shape(AD.poly(50, 0, 14, 18, 12), '#8d93a8', { seed: 237, lw: 3 }); AD.line([[-40, 60], [5, 80], [50, 60]], { lw: 5, lc: '#8d93a8', t }); }
  c.restore(); AD.use(lg); }
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

// ---------- A: the hook: an outlet that looks back (haunted parlour wall) ----------
function sceneA(t) { AD.set('#5d4a7a', '#3a2c46', { fy: 1420 }); const c = lg;
  c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) c.fillRect(x, 0, 50, 1386);            // striped wallpaper
  AD.shape(AD.box(0, 1000, W, 16, 2), '#2e2340', { seed: 300, wob: 0 });
  const bl = (t % 2.6 > 2.35) ? 1 : 0, jump = Math.abs(Math.sin(clamp(t / .6) * Math.PI)) * 60;
  outlet(540, 760 + Math.sin(t * 2.2) * 6, 1.25 + .05 * ss(R(t, 0, 2.5)), t, { blink: bl, glow: t > s(1) - .2 ? 0 : 0 });
  if (t > s(1) + .3) { AD.plaque(300, 1140, 480, 120, ['Ceci n\'est pas', 'un visage.'], { size: 40, top: 52, lh: 46, write: R(t, s(1) + .3, 1) }); }
  AD.kid(190, 1420 - jump, .95, t, { mood: 'o', sweat: true, look: 1 }); AD.boxy(890, 1430, .85, t, { mood: t > s(1) ? 'o' : 'happy', look: -1 });
  if (t < s(2)) { const k = i => t < .02 ? 1 : R(t, -.2 + i * .02, .25); ransomLine('DOTS + LINE', 190, 104, 11, k); ransomLine('= FACE!', 320, 118, 61, k); }
  else ransomLine('?', 330, 120, 9, 1); }

// ---------- B: pareidolia gallery ----------
function sceneB(t) { const t0 = s(2); AD.set('#e9dcc0', '#c8b08a'); AD.shape(AD.box(0, 0, 60, 1386, 2), '#ddd', { seed: 310 }); AD.shape(AD.box(1020, 0, 60, 1386, 2), '#ddd', { seed: 311 });
  AD.text('PAREIDOLIA', 540, 230, { f: 'serif', size: 96, col: '#4a3a30', align: 'center', write: R(t, t0 - .1, .9) });
  AD.text('seeing faces in things', 540, 300, { f: 'hand', size: 50, col: '#6a5a50', align: 'center', a: R(t, t0 + .8, .4) });
  const k1 = R(t, t0 + 1.2, .5), k2 = R(t, t0 + 1.9, .5), k3 = R(t, t0 + 2.7, .5);
  if (k1 > 0) frame(110, 420, 380, 300, t, () => { lg.fillStyle = '#9cc4e4'; lg.fillRect(110, 420, 380, 300); cloud(300, 570, .9, t, { face: true }); }, {});
  if (k2 > 0) frame(590, 420, 380, 300, t, () => { lg.fillStyle = '#e6d7bc'; lg.fillRect(590, 420, 380, 300); outlet(780, 570, .5, t, {}); });
  if (k3 > 0) frame(300, 830, 480, 380, t, () => { lg.fillStyle = '#2a2240'; lg.fillRect(300, 830, 480, 380); pumpkin(540, 1050, 150, t, { glow: 1 }); });
  [[300, 760, 'nuage', k1], [780, 760, 'prise', k2], [540, 1260, 'citrouille', k3]].forEach(([x, y, l, k]) => { if (k > 0) AD.plaque(x - 110, y, 220, 60, [l], { size: 32, top: 42 }); });
  rope(1250, 160, 920, t); AD.kid(160, 1640, .8, t, { arm: 'up', mood: 'smile', look: 1 }); AD.boxy(920, 1650, .8, t, { mood: 'happy' }); }

// ---------- C: the always-on face detector (box creature at the controls, objects on a conveyor) ----------
function sceneC(t) { const t0 = s(3); AD.set('#cfe0d6', C.floor, { fy: 1400 }); detector(280, 300, t, { lamp: (Math.floor((t - t0) * 2) % 2) ? 1 : .2, dial: .5 });
  AD.shape(AD.box(320, 210, 440, 70, 2), '#f6f0e2', { seed: 320, lw: 3 }); AD.text('ALWAYS ON', 540, 262, { f: 'poster', size: 54, col: C.red, align: 'center' });
  AD.shape(AD.box(0, 1060, W, 50, 3), '#777', { seed: 321, t }); for (let i = 0; i < 12; i++) AD.shape(AD.poly(40 + i * 92, 1085, 16, 16, 10), '#555', { seed: 322 + i, lw: 3 });
  const sh = (t - t0) * 170; for (let i = 0; i < 6; i++) { const x = ((i * 260 + sh) % 1560) - 240; if (i % 3 === 0) outlet(x, 960, .38, t); else if (i % 3 === 1) pumpkin(x, 980, 72, t, { glow: 0 }); else cloud(x, 960, .5, t, { face: true }); }
  AD.boxy(840, 1560, 1.15, t, { hat: true, mood: 'happy' }); AD.kid(220, 1560, .85, t, { mood: 'smile', arm: 'point', look: 1 }); }

// ---------- D: fast: eyes jump to a face in ~0.1 s (chalkboard + eye with a saccade) ----------
function sceneD(t) { const t0 = s(4); AD.set('#efd9a8', C.floor); AD.chalkboard(90, 220, 900, 420, t);
  AD.text('eyes', 160, 360, { f: 'hand', size: 76, col: '#f4f1e6', write: R(t, t0, .4) }); AD.text('→ face', 330, 360, { f: 'hand', size: 76, col: C.yellow, write: R(t, t0 + .4, .5) });
  AD.text('in ~0.1 s', 160, 480, { f: 'hand', size: 90, col: '#f4f1e6', write: R(t, t0 + 1.4, .6) }); AD.text('(Crouzet et al., 2010)', 160, 590, { f: 'hand', size: 40, col: '#cfd8c8', a: R(t, t0 + 2.4, .4) });
  // big cut-paper eye: pupil snaps to the pumpkin in one jump
  const ex = 330, ey = 950, jmp = ss(R(t, t0 + 1.6, .12)); AD.shape(AD.poly(ex, ey, 200, 120, 30), '#fbf7ef', { seed: 330, t, lw: 6 });
  const px = lerp(ex - 60, ex + 110, jmp), py = lerp(ey + 10, ey + 30, jmp); AD.shape(AD.poly(px, py, 62, 62, 20), '#5b7fb5', { seed: 331, t, lw: 4 }); AD.shape(AD.poly(px, py, 30, 30, 14), C.ink, { line: false, wob: 0 });
  AD.shape(AD.poly(px - 14, py - 16, 9, 9, 8), '#fff', { line: false, wob: 0 });
  if (jmp > 0 && jmp < 1 || R(t, t0 + 1.6, .5) < 1 && t > t0 + 1.6) AD.line([[ex + 220, ey - 10], [790, 1060]], { lw: 6, lc: C.red, t });
  pumpkin(820, 1200, 120, t, { glow: 1 }); const sw = R(t, t0 + .6, .3); AD.shape(AD.poly(900, 760, 80, 80, 26), '#fbf6ea', { seed: 332, t, a: sw });
  const ang = -Math.PI / 2 + clamp((t - t0 - .6) / 4) * TAU * .1 * 10; AD.line([[900, 760], [900 + Math.cos(ang) * 60, 760 + Math.sin(ang) * 60]], { lw: 5, wob: 0, a: sw });
  AD.kid(170, 1580, .78, t, { mood: 'o', look: 1 }); }

// ---------- E: 2020 brain scan: face-like objects handled by the face areas (blueprint lightbox) ----------
function brain(cx, cy, sc, t, hot) { const c = lg; c.save(); c.translate(cx, cy); c.scale(sc, sc); AD.use(c);
  AD.shape(AD.poly(0, 0, 300, 220, 36), 'rgba(255,255,255,.08)', { seed: 340, t, lc: '#eaf2ff', lw: 5 });
  [[-150, -60, 90], [-20, -120, 110], [120, -40, 100], [-80, 80, 90], [90, 100, 80]].forEach(([a, b, r], i) => AD.line(AD.poly(a, b, r * .6, r * .35, 14, i).slice(0, 10), { lc: 'rgba(234,242,255,.6)', lw: 3, t }));
  AD.shape([[60, 200], [120, 200], [110, 300], [70, 300]], 'rgba(255,255,255,.08)', { seed: 341, t, lc: '#eaf2ff', lw: 4 });
  if (hot > 0) { c.globalAlpha = hot; AD.shape(AD.poly(140, 130, 70, 40, 18), '#ffcf4a', { seed: 342, t, lc: '#fff', lw: 3 }); AD.shape(AD.poly(220, 60, 50, 32, 16), '#ff8a4a', { seed: 343, t, lc: '#fff', lw: 3 }); c.globalAlpha = 1; }
  c.restore(); AD.use(lg); }
function sceneE(t) { const t0 = s(5), c = lg; c.fillStyle = '#2c5aa0'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  AD.text('BRAIN SCAN, 2020', 540, 230, { f: 'type', size: 58, col: '#eaf2ff', align: 'center', write: R(t, t0, .8) }); AD.text('Wardle et al., Nature Communications', 540, 290, { f: 'type', size: 30, col: '#cfe0ff', align: 'center', a: R(t, t0 + .8, .4) });
  const hot = .5 + .5 * Math.sin(t * 5); brain(540, 760, 1.25, t, R(t, t0 + 2.8, .5) * (.7 + .3 * hot));
  AD.text('FACE AREAS', 840, 1000, { f: 'roundX', size: 48, col: C.yellow, align: 'center', outline: 6, a: R(t, t0 + 3.0, .4) });
  // two cards feeding the same spot: a real face and an outlet
  const k1 = R(t, t0 + 1.2, .5), k2 = R(t, t0 + 2.0, .5);
  if (k1 > 0) { AD.shape(AD.box(100, 1120, 300, 300, 3), '#fbf6ea', { seed: 344, t, a: k1 }); lg.save(); lg.globalAlpha = k1; AD.kid(250, 1560, .62, t, { mood: 'smile' }); lg.restore(); AD.text('real face', 250, 1470, { f: 'hand', size: 44, col: '#fff', align: 'center', a: k1 }); }
  if (k2 > 0) { AD.shape(AD.box(680, 1120, 300, 300, 3), '#fbf6ea', { seed: 345, t, a: k2 }); outlet(830, 1270, .5, t, { glow: true }); AD.text('outlet', 830, 1470, { f: 'hand', size: 44, col: '#fff', align: 'center', a: k2 }); }
  const ar = R(t, t0 + 2.6, .6); if (ar > 0) { AD.line([[250, 1110], [lerp(250, 690, ar), lerp(1110, 920, ar)]], { lw: 7, lc: C.yellow, t }); AD.line([[830, 1110], [lerp(830, 720, ar), lerp(1110, 920, ar)]], { lw: 7, lc: C.yellow, t }); } }

// ---------- F: within ~0.25 s it is re-sorted as an object (sorting office); but you already saw it ----------
function sceneF(t) { const t0 = s(6); AD.set('#e6c9a8', C.floor); AD.text('SORTING ROOM', 540, 220, { f: 'roundX', size: 64, col: C.ink, align: 'center' });
  const bins = [[110, 'FACES', '#e8a04a'], [600, 'OBJECTS', '#7aa0c4']]; bins.forEach(([x, l, col], i) => { AD.shape([[x, 860], [x + 370, 860], [x + 340, 1180], [x + 30, 1180]], col, { seed: 350 + i, t }); AD.plaque(x + 55, 1040, 260, 80, [l], { size: 40, top: 54, f: 'type' }); });
  // clock dial 0 -> 0.25 s
  const cl = clamp((t - t0 - .3) / 2.4); AD.shape(AD.poly(540, 500, 150, 150, 32), '#fbf6ea', { seed: 352, t, lw: 5 }); lg.save(); lg.globalAlpha = .7; const pts = [[540, 500]]; for (let k = 0; k <= 20; k++) { const a = -Math.PI / 2 + k / 20 * TAU * cl; pts.push([540 + Math.cos(a) * 130, 500 + Math.sin(a) * 130]); } AD.shape(pts, '#f2c14e', { line: false, wob: 0 }); lg.restore();
  AD.text(cl < 1 ? (cl * .25).toFixed(2) + ' s' : '~0.25 s', 540, 730, { f: 'poster', size: 64, align: 'center', col: C.ink });
  // the outlet card: lands in FACES, then slides over to OBJECTS
  const mv = ss(R(t, t0 + 2.4, 1.0)), drop = eo(R(t, t0 - .1, .5)); const x = lerp(295, 785, mv), y = lerp(560, 820, drop) - Math.sin(mv * Math.PI) * 220;
  outlet(x, y, .42, t, { blink: 0 });
  if (t > s(7) - .1) { AD.kid(170, 1640, .7, t, { mood: 'o', sweat: true, look: 1 }); bubble(380, 1330, 110, 80, t, eo(R(t, s(7), .3))); if (t > s(7) + .2) outlet(380, 1330, .2, t); AD.text('TOO LATE!', 760, 1400, { f: 'roundX', size: 72, col: C.red, align: 'center', outline: 7, ocol: '#fff', a: R(t, s(7) + .6, .3) }); }
  else AD.boxy(900, 1600, .9, t, { hat: true, mood: 'happy' }); }

// ---------- G: monkeys too (lab, eye-tracker dots on a face-like object) ----------
function sceneG(t) { const t0 = s(8); AD.set('#dfe8c8', '#b9a47e'); AD.plaque(560, 220, 420, 110, ['Rhesus monkeys, 2017'], { size: 40, top: 70 });
  AD.text('NOT JUST US', 300, 300, { f: 'poster', size: 84, col: C.red, align: 'center', outline: 5, ocol: '#fff', a: R(t, t0, .3) });
  AD.shape(AD.box(140, 420, 800, 520, 4), '#3b3b45', { seed: 360, t }); AD.shape(AD.box(170, 450, 740, 460, 3), '#f0e6d0', { seed: 361, t });
  // two pictures on the monitor: a plain bag vs a bag with a face (a classic pareidolia object), eye-tracker dots cluster on the face one
  AD.shape([[230, 600], [450, 600], [470, 860], [210, 860]], '#c9a36a', { seed: 362, t }); AD.line([[250, 600], [300, 540], [380, 540], [430, 600]], { lw: 5, t });
  AD.shape([[620, 600], [840, 600], [860, 860], [600, 860]], '#c9a36a', { seed: 363, t }); AD.line([[640, 600], [690, 540], [770, 540], [820, 600]], { lw: 5, t });
  AD.shape(AD.poly(690, 690, 16, 20, 10), C.ink, { line: false, wob: 0 }); AD.shape(AD.poly(770, 690, 16, 20, 10), C.ink, { line: false, wob: 0 }); AD.line([[690, 780], [730, 800], [770, 780]], { lw: 6, t });
  const n = Math.floor(clamp((t - t0 - .8) / 2.5) * 26); for (let i = 0; i < n; i++) { const onF = i % 6 !== 0, cx = onF ? 730 + (hash(i) - .5) * 160 : 340 + (hash(i) - .5) * 180, cy = onF ? 720 + (hash(i * 3) - .5) * 160 : 730 + (hash(i * 3) - .5) * 200;
    AD.shape(AD.poly(cx, cy, 10, 10, 8), 'rgba(220,60,50,.75)', { line: false, wob: 0 }); }
  AD.text('looked longer', 730, 1010, { f: 'hand', size: 54, col: C.ink, align: 'center', a: R(t, t0 + 2.6, .4) });
  monkey(320, 1500, 1.0, t, { look: Math.sin(t * 1.4) * .6 + .4 }); AD.boxy(860, 1520, .85, t, { mood: 'o' }); }

// ---------- H: before birth (ultrasound monitor: three dots of light in a face triangle; tiny outline turns) ----------
function sceneH(t) { const t0 = s(9); AD.set('#f2d6d0', C.floor); AD.plaque(260, 210, 560, 100, ['Lancaster University, 2017'], { size: 38, top: 64 });
  AD.shape(AD.box(110, 360, 860, 700, 4), '#3a3a48', { seed: 370, t, lw: 5 }); AD.shape(AD.box(150, 400, 780, 600, 3), '#141418', { seed: 371, t });
  lg.save(); lg.beginPath(); lg.moveTo(540, 430); lg.arc(540, 430, 560, Math.PI * .28, Math.PI * .72); lg.closePath(); lg.clip(); lg.fillStyle = '#2e2a26'; lg.fillRect(150, 400, 780, 600);
  for (let i = 0; i < 900; i++) { lg.fillStyle = `rgba(230,220,200,${hash(i * 3) * .18})`; lg.fillRect(150 + hash(i) * 780, 400 + hash(i * 7) * 600, 3, 2); }
  // tiny curled baby outline (simple, soft), head turns toward the dots
  const turn = ss(R(t, t0 + 2.2, 1.2)); lg.save(); lg.translate(560, 790); lg.rotate(-.2 - turn * .35); AD.use(lg);
  AD.shape(AD.poly(0, 40, 120, 90, 24), 'rgba(235,225,205,.55)', { seed: 372, t, lc: '#efe6d4', lw: 4 }); AD.shape(AD.poly(-120, -40, 70, 66, 22), 'rgba(235,225,205,.6)', { seed: 373, t, lc: '#efe6d4', lw: 4 });
  lg.restore(); AD.use(lg); lg.restore();
  // three dots of light, face triangle
  const dk = R(t, t0 + .8, .4), fl = .75 + .25 * Math.sin(t * 9); [[300, 560], [380, 560], [340, 630]].forEach(([x, y], i) => { if (dk <= 0) return; lg.save(); lg.globalAlpha = dk * fl * .35; AD.shape(AD.poly(x, y, 34, 34, 14), '#ff5a4a', { line: false, wob: 0 }); lg.restore(); AD.shape(AD.poly(x, y, 15, 15, 12), '#ff6a5a', { line: false, wob: 0, a: dk }); });
  AD.text('3 dots', 340, 720, { f: 'hand', size: 44, col: '#ffd0c8', align: 'center', a: dk });
  if (turn > .3) AD.text('↶ turns', 760, 560, { f: 'hand', size: 50, col: C.yellow, align: 'center', a: R(turn, .3, .3) });
  AD.text('third trimester', 540, 1130, { f: 'serif', size: 46, col: '#6a4a40', align: 'center', a: R(t, t0 + .4, .4) });
  AD.kid(200, 1600, .8, t, { mood: 'o', look: 1 }); AD.boxy(880, 1600, .85, t, { mood: 'happy' }); }

// ---------- I: the question (chalkboard) ----------
function sceneI(t) { const t0 = s(10); AD.set('#cfe3dc', C.floor); AD.chalkboard(80, 260, 920, 560, t);
  AD.text('why build a detector', 540, 420, { f: 'hand', size: 74, col: '#f4f1e6', align: 'center', write: R(t, t0, .9) }); AD.text('that makes', 540, 530, { f: 'hand', size: 74, col: '#f4f1e6', align: 'center', write: R(t, t0 + .8, .5) });
  AD.text('MISTAKES?', 540, 690, { f: 'hand', size: 120, col: C.yellow, align: 'center', write: R(t, t0 + 1.2, .6) });
  AD.kid(380, 1500, 1.05, t, { mood: 'worry', arm: 'up', sweat: true }); AD.boxy(800, 1500, 1.0, t, { mood: 'o', look: -1 }); AD.text('?', 800, 1290, { f: 'roundX', size: 110, col: C.ink, align: 'center', a: R(t, t0 + .5, .3) }); }

// ---------- J: tuned to never miss (dial cranked to max; false alarm on a pumpkin) ----------
function sceneJ(t) { const t0 = s(11); AD.set('#cfe0d6', C.floor, { fy: 1400 }); const dial = lerp(.5, 1, ss(R(t, t0 + .3, 1.2))), fa = t > t0 + 2.4;
  detector(280, 300, t, { lamp: fa ? ((Math.floor(t * 4) % 2) ? 1 : .3) : .2, dial, dialLab: 'NEVER MISS', lampLab: 'FALSE ALARM' });
  AD.shape(AD.box(0, 1060, W, 50, 3), '#777', { seed: 380, t }); for (let i = 0; i < 12; i++) AD.shape(AD.poly(40 + i * 92, 1085, 16, 16, 10), '#555', { seed: 381 + i, lw: 3 });
  pumpkin(lerp(1250, 540, eo(R(t, t0 + 1.2, 1.2))), 970, 100, t, { glow: fa ? 1 : 0 });
  if (fa) { const k = bo(R(t, t0 + 2.4, .35)); lg.save(); lg.translate(540, 800); lg.scale(k, k); AD.use(lg); const sp = Array.from({ length: 22 }, (_, j) => { const a = j / 22 * TAU, r = j % 2 ? 90 : 140; return [Math.cos(a) * r * 1.6, Math.sin(a) * r * .8]; }); AD.shape(sp, C.yellow, { seed: 390, t }); AD.text('FACE?!', 0, 26, { f: 'poster', size: 80, col: C.red, align: 'center', outline: 5, ocol: '#fff' }); lg.restore(); AD.use(lg); }
  AD.boxy(840, 1560, 1.15, t, { hat: true, mood: fa ? 'o' : 'happy' }); AD.plaque(90, 1200, 400, 100, ['high sensitivity'], { size: 38, top: 64, a: R(t, t0 + .8, .4) }); }

// ---------- K: the bet: a missed face weighs more than a false alarm (balance scale) ----------
function sceneK(t) { const t0 = s(12); AD.set('#f0e1b8', C.floor); AD.text('WHICH MISTAKE COSTS MORE?', 540, 230, { f: 'roundX', size: 50, col: C.ink, align: 'center' });
  const tilt = .32 * ss(R(t, t0 + .6, 1.2)) + .02 * Math.sin(t * 3) * ss(R(t, t0 + .6, 1.2)), cx = 540, cy = 560;
  AD.shape([[cx - 20, cy], [cx + 20, cy], [cx + 40, 1300], [cx - 40, 1300]], '#8a6a50', { seed: 400, t }); AD.shape(AD.box(cx - 150, 1290, 300, 40, 2), '#6a4a30', { seed: 401, t });
  const ax = Math.cos(tilt) * 400, ay = Math.sin(tilt) * 400; AD.line([[cx - ax, cy + ay], [cx + ax, cy - ay]], { lw: 12, t }); AD.shape(AD.poly(cx, cy, 24, 24, 12), C.yellow, { seed: 402 });
  [[-1, cx - ax, cy + ay], [1, cx + ax, cy - ay]].forEach(([sd, px, py], i) => { AD.line([[px, py], [px - 120, py + 260]], { lw: 3 }); AD.line([[px, py], [px + 120, py + 260]], { lw: 3 }); AD.shape([[px - 150, py + 260], [px + 150, py + 260], [px + 110, py + 300], [px - 110, py + 300]], '#c9a36a', { seed: 403 + i, t });
    if (sd < 0) { lg.save(); lg.translate(px, py + 262); AD.use(lg); AD.kid(0, 0, .45, t, { mood: 'smile', arm: 'up' }); lg.restore(); AD.use(lg); AD.plaque(px - 160, py + 330, 320, 110, ['missing a', 'real face'], { size: 36, top: 46, lh: 44 }); AD.text('costs you', px, py + 500, { f: 'hand', size: 54, col: C.red, align: 'center', a: R(t, t0 + 1.2, .4) }); }
    else { pumpkin(px, py + 200, 62, t, { glow: 1 }); AD.plaque(px - 160, py + 330, 320, 110, ['a face in', 'a pumpkin'], { size: 36, top: 46, lh: 44 }); AD.text('costs a laugh', px, py + 500, { f: 'hand', size: 54, col: '#2a7a3a', align: 'center', a: R(t, t0 + 2.6, .4) }); } });
  if (t > t0 + 2.8) AD.text('ha!', 900, 520, { f: 'roundX', size: 70, col: C.ink, align: 'center', rot: .2 });
  AD.boxy(540, 1600, .85, t, { mood: 'happy', hop: t > t0 + 2.8 ? t * 1.2 : null }); }

// ---------- L: the curtain "ghost" tonight (night window, folds make a face; flashlight reveals a curtain) ----------
function sceneL(t) { const t0 = s(13); AD.set('#2e2a4a', '#1f1b30', { fy: 1420 }); const c = lg;
  AD.shape(AD.box(250, 280, 580, 760, 4), '#1a2a4a', { seed: 410, t, lw: 6 }); AD.shape(AD.poly(680, 420, 70, 70, 26), '#f6edc8', { seed: 411, t, lw: 3 }); for (let i = 0; i < 18; i++) AD.text('✦', 280 + hash(i) * 520, 320 + hash(i * 3) * 600, { f: 'roundX', size: 20 + hash(i * 5) * 16, col: '#f6edc8' });
  AD.shape(AD.box(250, 520, 580, 14, 2), '#6a4a30', { seed: 412, lw: 3 }); AD.shape(AD.box(250, 760, 580, 14, 2), '#6a4a30', { seed: 413, lw: 3 }); AD.shape(AD.box(532, 280, 14, 760, 2), '#6a4a30', { seed: 414, lw: 3 });
  // sheer curtain billowing; two folds + a sag read as a ghost face
  const bil = Math.sin(t * 1.7) * 20, lit = ss(R(t, t0 + 2.2, .6)); const cp = []; for (let i = 0; i <= 12; i++) cp.push([180 + i * 50 + Math.sin(i * 1.3 + t * 2) * 10, 220]); for (let i = 12; i >= 0; i--) cp.push([180 + i * 50 + Math.sin(i * .9 + t * 1.6) * 30 + bil, 1120 + Math.sin(i * 2.1 + t) * 26]);
  AD.shape(cp, `rgba(240,236,250,${.62 + lit * .25})`, { seed: 415, t, lc: '#d8d2ea', lw: 4 }); for (let i = 1; i < 8; i++) AD.line([[220 + i * 80, 240], [230 + i * 80 + bil * .6, 1100]], { lc: 'rgba(150,140,190,.5)', lw: 3, t });
  const fa = 1 - lit * .85; AD.shape(AD.poly(450, 600, 36, 52, 14), `rgba(70,60,110,${.8 * fa})`, { line: false, wob: 0 }); AD.shape(AD.poly(630, 600, 36, 52, 14), `rgba(70,60,110,${.8 * fa})`, { line: false, wob: 0 }); AD.shape(AD.poly(540, 770, 50, 70, 16), `rgba(70,60,110,${.7 * fa})`, { line: false, wob: 0 });
  // flashlight beam from the kid
  if (lit > 0) { c.save(); c.globalAlpha = .28 * lit; c.fillStyle = '#fff3b0'; c.beginPath(); c.moveTo(300, 1180); c.lineTo(200, 380); c.lineTo(880, 520); c.closePath(); c.fill(); c.restore(); }
  AD.kid(250, 1460, .9, t, { mood: lit > .5 ? 'smile' : 'o', arm: 'point', look: 1, sweat: lit < .5 }); AD.boxy(860, 1460, .9, t, { hat: true, mood: 'happy' });
  if (lit > .5) AD.text('just a curtain', 540, 1250, { f: 'hand', size: 60, col: '#fbf6ea', align: 'center', a: R(lit, .5, .4) }); else AD.text('BOO?', 540, 200, { f: 'poster', size: 90, col: '#f6edc8', align: 'center', a: R(t, t0 + .3, .3) }); }

// ---------- M: end card (ransom letters on cork + a grinning pumpkin) ----------
const ENDL = [['FOLLOW', 360], ['FOR MORE OF', 560], ['HOW IT', 780], ['REALLY', 960], ['WORKS.', 1140]];
function sceneM(t) { const t0 = s(14) - .2; cork(t); ENDL.forEach(([w, y], li) => { const sz = li === 1 ? 100 : 140, step = sz * .78, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, 540 - tw / 2 + step / 2 + i * step, y, sz, li * 23 + i * 5 + 3, R(t, t0 + li * .25 + i * .03, .3)); }); });
  AD.text('@howitreallyworkstudio', 540, 1320, { f: 'type', size: 50, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.5, .5) }); pumpkin(300, 1560, 110, t, { glow: 1 }); AD.boxy(780, 1640, .9, t, { mood: 'happy', hop: t }); }

// ---------- compositor: hard cuts with a short whip blur (demo) ----------
const SC = [[0, sceneA], [s(2) - .2, sceneB], [s(3) - .2, sceneC], [s(4) - .2, sceneD], [s(5) - .2, sceneE], [s(6) - .2, sceneF], [s(8) - .2, sceneG], [s(9) - .2, sceneH],
  [s(10) - .2, sceneI], [s(11) - .2, sceneJ], [s(12) - .2, sceneK], [s(13) - .2, sceneL], [s(14) - .3, sceneM]];
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
function scene(t) { const i = idx(t), u = R(t, SC[i][0], .22); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H);
  AD.clear(); SC[i][1](t); AD.blit({ blur: i > 0 && u < 1 ? (1 - u) * 18 : 0, dx: i > 0 && u < 1 ? (1 - eo(u)) * 160 : 0, z: i > 0 && u < 1 ? lerp(1.04, 1, eo(u)) : 1 + .015 * Math.sin(t * .4) });
  wash(); AD.finish(); const ph = PH.findLast(p => t >= p.start - .2); if (ph && ph.i < PH.length - 1) AD.caption(ph, t, { out: PH[ph.i + 1].start - .12 }); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - f; g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// thumbnail / cover: the outlet face on the haunted wall + ransom-note "IT'S NOT A FACE"
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); AD.clear(); AD.set('#5d4a7a', '#3a2c46', { fy: 1420 }); lg.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 120) lg.fillRect(x, 0, 50, 1386);
  outlet(540, 960, 1.15, 1, {}); AD.kid(190, 1560, .8, 1, { mood: 'o', sweat: true, look: 1 }); pumpkin(880, 1500, 110, 1, { glow: 1 });
  ransomLine("IT'S NOT", 400, 130, 5, 1); ransomLine('A FACE', 570, 140, 47, 1); AD.blit({}); wash(); AD.finish(); };
window.seek(0); window.ready = true; window.READY = true;
