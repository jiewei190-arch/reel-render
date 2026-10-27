// t_airfryer.js: "How an air fryer cooks" in template #9 scifi-toon (lemo-opuscar/styles/scifi-toon) grammar.
// 1080x1920. Characters, boil and mouths step at 12 fps; camera, portal swirl and wipes run on ones.
// One palette per world, the portal is the only thing that glows, VT323 world tag typed in, Baloo subtitles with speaker pill,
// Bungee title lockup with orbit ring, hard cuts or swirl wipes only (no dissolves).
import { clamp, lerp, seg, ss, eo, back, spring, hash, vnoise, TAU } from './styles/scifitoon/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, noodle, reset, bands, quad } from './styles/scifitoon/toon.js';
import { juno, spud, fryer, mitt, eye, mouth, sweat, PAL, mix } from './styles/scifitoon/cast_af.js';
await Promise.all(['800 50px "Baloo 2"', '400 50px VT323', '400 50px Bungee'].map(f => document.fonts.load(f)));
init(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, LIP = window.LIP || [];
const q = t => Math.floor(t * 12 + 1e-6) / 12;

// —— lip sync from the voice track (24 Hz envelope, sampled on twos) ——
function talk(t) { const tq = q(t); const on = PH.some(p => tq >= p.start - .02 && tq < p.end + .02); if (!on) return { o: 0, w: 1, talking: false }; const o = LIP[Math.floor(tq * 24)] || 0; return { o: clamp(o * 1.05), w: .85 + .3 * hash(Math.floor(tq * 12)) - .2 * o, talking: true }; }
const blink = (t, ph = 0) => { const k = Math.floor(t * 12 + ph * 7) + 9; return k % 37 === 0 || k % 37 === 1; };

// —— camera ——
function cam(cx, cy, z, shake = 0, t = 0) { reset(); translate(W / 2, H / 2); if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); } scale(z); translate(-cx, -cy); }

// —— portal (the travel device; the only thing that glows) — after lemo-opuscar worlds.js portal (MIT) ——
function portal(cx, cy, r, t, { open = 1, sx = .74, spin = 1 } = {}) {
  if (open <= .001) return; const R = r * open;
  push(); translate(cx, cy); scale(sx, 1);
  fillOnly(ell(0, 0, R * 1.55, R * 1.45, 48), 'rgba(140,255,90,.14)', { boil: .6 }); fillOnly(ell(0, 0, R * 1.28, R * 1.22, 48), 'rgba(140,255,90,.18)', { boil: .6 });
  const rim = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, k = 1 + .18 * (vnoise(i * 1.7 + t * 3) - .5) + .05 * Math.sin(a * 5 + t * 6); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * k]); }
  shape(spline(rim), { fill: '#3fd93a', lw: 8, shade: () => {
    fillOnly(ell(0, 0, R * .9, R * .9, 40), '#6ef24c', { boil: .3 });
    for (let k = 0; k < 5; k++) { const a1 = [], a2 = []; for (let j = 0; j <= 22; j++) { const u = j / 22, rr_ = R * (1 - u) * .95, a = k / 5 * TAU + u * 3.6 + t * 2.6 * spin; a1.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); const b = a + .55 * (1 - u * .7); a2.push([Math.cos(b) * rr_, Math.sin(b) * rr_]); } fillOnly([...a1, ...a2.reverse()], k % 2 ? '#b8ff5a' : '#21b33c', { boil: .4 }); }
    fillOnly(ell(0, 0, R * .3, R * .3, 24), '#dcffa8', { boil: .5 }); fillOnly(ell(0, 0, R * .14, R * .14, 16), '#ffffff', { boil: .5 });
  } });
  for (let i = 0; i < 12; i++) { const a = hash(i) * TAU + t * (1.5 + hash(i + 4) * 2), d = R * (1.05 + .25 * ((t * .8 + hash(i + 9)) % 1)); dot(Math.cos(a) * d, Math.sin(a) * d, 5 + hash(i + 2) * 4, i % 3 ? '#caff7a' : '#ffffff'); }
  pop();
}
const popOpen = x => x <= 0 ? 0 : back(clamp(x / .32), 1.7);

// ———————————————————— worlds (one palette each) ————————————————————
const X0 = -900, X1 = 2000;
function lab(t, o = {}) {           // home: sage kitchen-lab
  fillOnly(rect(X0, -800, X1 - X0, 2400), '#a7c3b1', { boil: 0 });
  for (let x = -800; x < 2000; x += 240) stroke([[x, -800], [x, 1460]], 4, { line: '#7c9d8a' });
  fillOnly(rect(X0, -800, X1 - X0, 260), '#8fae9b', { boil: 0 });
  shape(rr(260, 120, 560, 46, 10), { fill: '#eef6f0', lw: 6 }); stroke([[320, 100], [320, 120]], 5); stroke([[760, 100], [760, 120]], 5);
  // blackboard (history is written here later)
  shape(rr(560, 300, 470, 330, 10), { fill: '#2f4a3f', lw: 8, shade: () => {
    text('FRY ≠ FRY ?', 795, 352, { font: '400 46px VT323', fill: '#e8f0e0' });
    if (o.board) { const n = Math.floor(o.board * 80); const L = ['INVENTOR: FRED VAN DER WEIJ', '(DUTCH ENGINEER)', 'PHILIPS AIRFRYER: 2010']; let k = n; L.forEach((l, i) => { text(l.slice(0, Math.max(0, k)), 590, 420 + i * 52, { font: '400 36px VT323', fill: i === 2 ? '#ffd36e' : '#e8f0e0', align: 'left' }); k -= l.length; }); }
    else { text('hot air  →  ☐ fried', 795, 430, { font: '400 36px VT323', fill: '#e8f0e0' }); text('oil bath →  ☑ fried', 795, 480, { font: '400 36px VT323', fill: '#ffd36e' }); }
  } });
  shape(rr(580, 622, 430, 16, 4), { fill: '#b08a5a', lw: 5 });
  // wall clock + shelf with jars
  push(); translate(170, 340); shape(ell(0, 0, 70, 70, 40), { fill: '#f7f3e8', lw: 8 }); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; stroke([[Math.cos(a) * 54, Math.sin(a) * 54], [Math.cos(a) * 62, Math.sin(a) * 62]], 4); } const sA = Math.floor(t) / 60 * TAU - Math.PI / 2; stroke([[0, 0], [0, -40]], 8); stroke([[0, 0], [36, 18]], 6); stroke([[0, 0], [Math.cos(sA) * 54, Math.sin(sA) * 54]], 2.5, { line: '#e8392b' }); dot(0, 0, 7); pop();
  shape(rr(-60, 560, 400, 22, 4), { fill: '#b08a5a', lw: 6 });
  [['#f2d16b', 'SALT'], ['#ff8c5a', 'PAPRIKA'], ['#9cf23c', '?']].forEach(([c, l], i) => { shape(rr(10 + i * 110, 450, 80, 110, 14), { fill: '#e8f6f4', lw: 6, shade: () => fillOnly(rect(0, 500, 400, 80), c, { boil: .3 }) }); text(l, 50 + i * 110, 480, { font: '800 18px "Baloo 2"', fill: INK }); });
  // floor
  shape(rect(X0, 1460, X1 - X0, 900), { fill: '#6c7c75', lw: 6 }); for (let k = 0; k < 4; k++) stroke([[X0, 1500 + k * 70 + k * k * 14], [X1, 1500 + k * 70 + k * k * 14]], 4, { line: '#58665f' }); shape(rect(X0, 1430, X1 - X0, 32), { fill: '#557065', lw: 6 });
  // counter (left) under the fryer
  shape(rect(-300, 1100, 820, 340), { fill: '#8e7a66', lw: 7, shade: () => fillOnly(rect(-300, 1100, 820, 30), '#a8927c', { boil: .3 }) });
  for (let x = -260; x < 520; x += 250) shape(rr(x, 1160, 220, 230, 8), { fill: '#7a6857', lw: 6 });
  shape(rr(-320, 1076, 860, 34, 6), { fill: '#d9d4c8', lw: 7 });
}
function oilWorld(t) {              // magenta + lime: everything gets dunked
  bands(['#ff4f9a', '#ff6fb0', '#ff8fc2', '#ffb0d4'], -600, 1300);
  for (let i = 0; i < 4; i++) { const x = -200 + i * 420, h = 300 + hash(i) * 200; shape(spline([[x - 160, 1300], [x - 60, 1300 - h], [x + 80, 1300 - h * .9], [x + 180, 1300]]), { fill: '#c23a8a', lw: 6 }); }
  shape(rect(X0, 1300, X1 - X0, 900), { fill: '#7a2a6a', lw: 7 });
  // the giant pot of lime oil
  shape(spline([[120, 1000], [960, 1000], [920, 1560], [780, 1640], [300, 1640], [160, 1560]]), { fill: '#3a3a4a', lw: 9, shade: () => fillOnly(rect(700, 980, 300, 700), '#262633', { boil: .3 }) });
  shape(ell(540, 1010, 430, 70, 50), { fill: '#b8f03c', lw: 8, shade: () => { fillOnly(ell(640, 1030, 300, 40, 40), '#8fd12a', { boil: .4 }); for (let i = 0; i < 9; i++) { const u = (t * .9 + hash(i)) % 1, x = 200 + hash(i * 3) * 680; fillOnly(ell(x, 1010 - u * 10, 14 + u * 22, 8 + u * 12, 14), '#e2ff9a', { boil: .4 }); } } });
  for (let i = 0; i < 6; i++) { const u = (t * 1.3 + hash(i * 7)) % 1, x = 220 + hash(i * 4.1) * 640; shape(ell(x, 990 - u * 140, 12 * (1 - u) + 4, 12 * (1 - u) + 4, 12), { fill: '#e2ff9a', lw: 5 }); }
  for (const hx of [130, 950]) shape(rr(hx - 40, 1060, 80, 40, 14), { fill: '#3a3a4a', lw: 7 });
}
function oilBlob(x, y, t, o = 0) {  // the creature of this world: a cute, slightly gross oil blob
  const wb = Math.sin(t * 7) * 6; shape(spline([[x - 90, y], [x - 80, y - 120], [x - 30 + wb, y - 190], [x + 40 + wb, y - 180], [x + 86, y - 110], [x + 92, y]]), { fill: '#c8ff5a', lw: 7, shade: () => fillOnly(ell(x + 50, y - 80, 30, 90, 16), '#9fe03a', { boil: .3 }) });
  eye(x - 26 + wb, y - 120, 22, 26, { look: [-.5, .2], pupil: 5, skin: '#c8ff5a' }); eye(x + 26 + wb, y - 122, 22, 26, { look: [-.5, .2], pupil: 5, skin: '#c8ff5a' }); mouth(x + wb, y - 66, 46, { o, sm: .9, lw: 5 });
  shape(spline([[x + 10 + wb, y - 52], [x + 28 + wb, y - 36], [x + 18 + wb, y - 20], [x + 4 + wb, y - 34]]), { fill: '#e8637a', lw: 4 });
}
function insideWorld(t, spin = 1) { // orange + teal: the inside of the fryer
  bands(['#ff7a2f', '#ff8d45', '#ffa35c', '#ffb862'], -600, 2600);
  // chamber walls
  shape(rr(70, 240, 940, 1320, 60), { fill: '#2b9c98', lw: 9, shade: () => { fillOnly(rr(130, 300, 820, 1200, 40), '#ffd9a8', { boil: .3 }); fillOnly(rect(780, 300, 170, 1200), '#f3c38a', { boil: .3 }); } });
  // fan (on ones)
  push(); translate(540, 380); shape(ell(0, 0, 200, 46, 30), { fill: '#1f7a77', lw: 7 }); for (let k = 0; k < 4; k++) { const a = t * 9 * spin + k * Math.PI / 2; const c = Math.cos(a); shape([[0, -8], [190 * c, -22], [190 * c, 18], [0, 10]], { fill: '#5fd0c8', lw: 6 }); } shape(ell(0, 0, 28, 20, 16), { fill: '#3a3d4a', lw: 6 }); pop();
  // heating element: a flat zig-zag coil (no glow; glow is the portal's)
  const coil = []; for (let i = 0; i <= 14; i++) coil.push([170 + i * 53, 520 + (i % 2 ? 26 : -26)]); stroke(coil, 30, { line: INK, boil: .6 }); stroke(coil, 18, { line: '#ff4a2a', boil: .6 });
  // basket mesh
  shape(rr(200, 1050, 680, 360, 30), { fill: '#3a3d4a', lw: 8, shade: () => { fillOnly(rr(230, 1070, 620, 320, 20), '#4a4f60', { boil: .3 }); for (let x = 250; x < 860; x += 40) stroke([[x, 1070], [x, 1390]], 3, { line: '#6b7186' }); } });
}
function airLoop(t, a = 1, speed = 1) { // thick outlined air arrows circling the chamber
  if (a <= 0) return; const path = u => { u = ((u % 1) + 1) % 1; const ang = u * TAU; return [540 + Math.cos(ang) * 380, 900 + Math.sin(ang) * 540]; };
  for (let k = 0; k < 6; k++) { const u0 = t * .28 * speed + k / 6; const P = []; for (let j = 0; j <= 10; j++) P.push(path(u0 + j * .012)); stroke(P, 26, { line: INK, alpha: a }); stroke(P, 14, { line: '#fff3d6', alpha: a }); const [hx, hy] = path(u0 + .12), [px, py] = path(u0 + .105), ang = Math.atan2(hy - py, hx - px); push(); translate(hx, hy); rotate(ang); shape([[22, 0], [-14, -20], [-14, 20]], { fill: '#fff3d6', lw: 6, alpha: a }); pop(); }
}
function blanketWorld(t) {          // ultraviolet + gold: the boundary layer
  bands(['#3b1f66', '#46277a', '#52308c', '#5e3a9c'], -600, 2600);
  for (let i = 0; i < 18; i++) { const x = hash(i * 3.3) * 1080, y = hash(i * 5.1) * 1400 + 100, r = 6 + 6 * Math.sin(t * 4 + i); shape([[x, y - r], [x + r * .3, y - r * .3], [x + r, y], [x + r * .3, y + r * .3], [x, y + r], [x - r * .3, y + r * .3], [x - r, y], [x - r * .3, y - r * .3]], { fill: '#e8d84a', lw: 4 }); }
  shape(rect(X0, 1460, X1 - X0, 900), { fill: '#2a1550', lw: 7 });
}
function quilt(cx, cy, rx, ry, k, t, flap = 0) {   // puffy boundary-layer blanket around Spud (k = thickness 0..1)
  if (k <= .02) return; const P = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, w = 1 + .06 * Math.sin(a * 7 + t * 3) + flap * .25 * Math.sin(a * 3 - t * 14) * (Math.cos(a) < 0 ? 1 : .3); P.push([cx + Math.cos(a) * (rx + 70 * k) * w, cy + Math.sin(a) * (ry + 70 * k) * w]); }
  shape(spline(P), { fill: `rgba(190,215,255,${.55 + .3 * k})`, lw: 7, shade: () => { for (let i = 0; i < 5; i++) stroke([[cx - rx - 80, cy - ry + i * ry * .5], [cx + rx + 80, cy - ry + i * ry * .5 + 20]], 4, { line: 'rgba(90,110,170,.6)' }); } });
}
function brownWorld(t) {            // mint + coral: browning
  bands(['#bdf2d5', '#a9ead0', '#95e2c9', '#80d9c2'], -600, 1460);
  for (let i = 0; i < 5; i++) shape(ell(100 + i * 230, 1460, 120, 60, 30), { fill: '#ff7a6b', lw: 6 });
  shape(rect(X0, 1460, X1 - X0, 900), { fill: '#e8604f', lw: 7 });
  shape(rr(180, 1180, 720, 40, 12), { fill: '#3a3d4a', lw: 7 }); for (let x = 220; x < 880; x += 60) stroke([[x, 1180], [x, 1220]], 4, { line: '#6b7186' }); for (const lx of [220, 860]) shape(rr(lx - 14, 1220, 28, 240, 8), { fill: '#3a3d4a', lw: 6 });
}
function normalWorld(t) {           // suspiciously normal: beige + brown
  fillOnly(rect(X0, -800, X1 - X0, 2400), '#f1e3c6', { boil: 0 }); for (let y = -200; y < 1460; y += 120) stroke([[X0, y], [X1, y]], 3, { line: '#e2d0ab' });
  shape(rect(X0, 1460, X1 - X0, 900), { fill: '#a07850', lw: 6 });
  // a plain wall oven with a fan behind the window
  shape(rr(250, 520, 580, 760, 24), { fill: '#d8cdb8', lw: 8, shade: () => fillOnly(rect(700, 500, 160, 800), '#c4b79d', { boil: .3 }) });
  shape(rr(300, 560, 480, 90, 12), { fill: '#bfb29a', lw: 6 }); for (let i = 0; i < 4; i++) shape(ell(360 + i * 120, 605, 24, 24, 16), { fill: '#f1e3c6', lw: 5 });
  shape(rr(300, 690, 480, 480, 20), { fill: '#5a4a3a', lw: 7, shade: () => { push(); translate(540, 930); for (let k = 0; k < 4; k++) { const a = t * 3 + k * Math.PI / 2; shape([[0, 0], [Math.cos(a) * 110 - Math.sin(a) * 30, Math.sin(a) * 110 + Math.cos(a) * 30], [Math.cos(a) * 110 + Math.sin(a) * 30, Math.sin(a) * 110 - Math.cos(a) * 30]], { fill: '#8a7660', lw: 5 }); } pop(); } });
  shape(rr(320, 1196, 440, 30, 10), { fill: '#bfb29a', lw: 6 });
  shape(rr(860, 1080, 120, 380, 10), { fill: '#7a5a3a', lw: 6 }); shape(ell(920, 1040, 60, 60, 24), { fill: '#6fa060', lw: 6 });   // potted plant: the most normal object
}

// ———————————————————— poses ————————————————————
function J(t, o = {}) { const m = talk(t), tq = q(t); return { x: 790, y: 1450, s: 1, face: -1, lid: .5, look: [0, 0], mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), blink: blink(t), ...o }; }
function P(t, o = {}) { const tq = q(t); return { x: 380, y: 1080, s: .62, face: 1, t, nerv: .4, look: [.5, -.2], blink: blink(t, 3), mouth: { o: 0, sm: -.6 }, sq: 1 + .012 * Math.sin(tq * 3.1), ...o }; }
const landSq = (t, tl) => { const u = t - tl; if (u < 0 || u > .5) return 1; return 1 - .22 * Math.exp(-u * 9) * Math.cos(u * 30); };

// ———————————————————— shots ————————————————————
const WIPES = [[s(1) - .25, .3], [s(2) - .3, .3], [s(3) - .3, .3], [s(6) - .3, .3], [s(9) - .3, .3], [s(13) - .3, .3], [s(15) - .3, .3], [s(17) - .25, .25]];
const CUTS = WIPES.map(w => w[0]);
const SHOT = t => { const k = CUTS.filter(c => t >= c).length; return ['lab', 'oil', 'lab2', 'inside', 'blanket', 'brown', 'normal', 'lab3', 'end'][k]; };
const TAGS = [[s(1) - .1, s(2) - .4, 'U-7  OIL WORLD', 'everything gets dunked', '#3a1030', '#b8f03c'], [s(3) - .1, s(6) - .4, 'U-2  INSIDE THE FRYER', 'heater + fan + basket', '#0f3b3a', '#ffb862'], [s(6) - .1, s(9) - .4, 'U-3  THE BLANKET', 'a thin layer of still air', '#1c0d38', '#e8d84a'], [s(9) - .1, s(13) - .4, 'U-4  BROWNING', 'dry, then golden', '#123a2f', '#ff7a6b'], [s(13) - .1, s(15) - .4, 'U-5  A REGULAR OVEN', '(suspiciously normal)', '#5a4630', '#f1e3c6']];

const SH = {
  lab(t, tq) {   // cold open: two-shot, title lockup, Juno twists the fryer dial and the portal opens
    const z = lerp(1.1, 1.14, ss(seg(t, 0, 3))); cam(540, 1010, z); lab(t);
    const po = popOpen(t - (s(1) - .9)); portal(560, 860, 230, t, { open: po });
    fryer(170, 1080, .78, t, { screenTxt: 'FRY', steam: 1 });
    const press = ss(seg(tq, s(1) - 1.4, s(1) - 1.0));
    juno(J(t, { armR: press > 0 ? { h: [150 * press + 30, 120 - 60 * press], bend: -30 } : undefined, look: [press ? .8 : .3, .1] }));
    spud(P(t, { nerv: .6 + po * .6, sweat: t, look: [po > 0 ? -.3 : .6, -.3], mouth: { o: po * .6, sm: -.8 }, eyeS: 1 + po * .25 }));
  },
  oil(t, tq) {   // jump 1: Spud falls toward the oil, the blob licks its lips, reaction close-up
    const u = seg(t, s(1) - .25, s(1) + 1.6), close = t > s(1) + 1.75;
    if (!close) { cam(540, 960, 1); oilWorld(t); oilBlob(840, 1010, t, .2 + .2 * Math.sin(t * 8)); const x = lerp(140, 470, eo(u)), y = lerp(700, 980, u * u) - Math.sin(u * Math.PI) * 220; spud(P(t, { x, y, s: .7, nerv: 1.4, mouth: { o: .9, sm: -1 }, eyeS: 1.35, look: [0, .7], armL: { h: [-70, -40], bend: 10 }, armR: { h: [70, -40], bend: -10 }, lean: -.3 + u * .6, sweat: t })); }
    else { cam(540, 760, 2.0, 7, t); oilWorld(t); spud(P(t, { x: 540, y: 900, s: .9, nerv: 1.6, mouth: { o: .95, w: 1.3, sm: -1 }, eyeS: 1.5, look: [.1, .6], armL: { h: [-60, -70], bend: 10 }, armR: { h: [60, -70], bend: -10 }, sweat: t })); }
  },
  lab2(t, tq) {   // home: Spud spat back out; Juno: it's a tiny convection oven; insert on the fryer screen
    const ins = t > s(2) + 2.6 && t < s(3) - .7;
    if (!ins) { cam(540, 1010, 1.1); lab(t); const po = popOpen(t - (s(2) - .3)) * (1 - ss(seg(t, s(2) + .6, s(2) + .9))) + popOpen(t - (s(3) - .9)); portal(560, 860, 230, t, { open: Math.min(1, po) }); fryer(170, 1080, .78, t, { screenTxt: t > s(2) + 1.2 ? 'OVEN' : 'FRY', steam: 1 });
      const land = s(2) + .2, fl = seg(t, s(2) - .3, land); const sp = t < land ? P(t, { x: lerp(560, 380, fl), y: lerp(860, 1080, fl) - Math.sin(fl * Math.PI) * 200, nerv: 1, mouth: { o: .7, sm: -1 } }) : P(t, { sq: landSq(t, land), nerv: .5, look: [.6, -.2], sweat: t });
      juno(J(t, { armR: t > s(2) + .8 ? { h: [170, -10], bend: -20 } : undefined, look: [.6, 0] })); spud(sp); }
    else { cam(220, 840, 2.4); lab(t); fryer(170, 1080, .78, t, { screenTxt: 'OVEN', steam: 1 }); const tw = seg(t, s(2) + 2.7, s(2) + 3.6); push(); translate(-60, 760); shape(rr(0, 0, 560, 120, 14), { fill: '#17232a', lw: 7 }); text('CONVECTION OVEN'.slice(0, Math.floor(tw * 16)), 280, 44, { font: '400 54px VT323', fill: '#ffb44a' }); text('(tiny. countertop.)'.slice(0, Math.max(0, Math.floor(tw * 30) - 14)), 280, 94, { font: '400 36px VT323', fill: '#ffb44a' }); pop(); }
  },
  inside(t, tq) {   // jump 2: inside the fryer. heater, fan, 200 C, air whips around; Spud's wind-blown reaction
    const close = t > s(5) + 1.4;
    if (!close) { const z = lerp(1.0, 1.05, ss(seg(t, s(3), s(5)))); cam(540, 960, z); insideWorld(t, 1 + (t > s(4) ? 1.5 : 0));
      airLoop(t, ss(seg(t, s(4) + .2, s(4) + .8)), t > s(5) ? 2 : 1);
      spud(P(t, { x: 540, y: 1250, s: .7, nerv: .7, look: [0, -.8], mouth: { o: .3 + .2 * Math.sin(t * 9), sm: -.8 }, eyeS: 1.2, sweat: t }));
      [[860, 300, 'FAN', s(3) + .9], [540, 620, 'HEATER', s(3) + .3]].forEach(([x, y, l, t0]) => { const k = back(seg(tq, t0, t0 + .25), 2); if (k > 0) { push(); translate(x, y); scale(k); text(l, 0, 0, { font: '800 64px "Baloo 2"', fill: '#fff3d6', outlineW: 12 }); pop(); } });
      if (t > s(4) + .5) { const v = Math.round(lerp(20, 200, ss(seg(t, s(4) + .5, s(4) + 3.2)))); push(); translate(540, 1400); shape(rr(-190, -60, 380, 120, 16), { fill: '#0f3b3a', lw: 7 }); text(v + '°C', 0, 6, { font: '400 100px VT323', fill: '#ffb862' }); pop(); } }
    else { cam(540, 1060, 1.9, 4, t); insideWorld(t, 3); airLoop(t, 1, 2.4); spud(P(t, { x: 540, y: 1240, s: .8, nerv: 1.1, lean: -.12, mouth: { o: .5 + .3 * Math.sin(t * 20), w: 1.2, sm: -.6 }, eyeS: .9, lid: .35, look: [.5, 0], armL: { h: [-80, -30], bend: 20 }, armR: { h: [80, 10], bend: -20 } })); for (let i = 0; i < 5; i++) { const y = 860 + i * 70, x = ((t * 900 + i * 250) % 1300) - 150; stroke([[x, y], [x + 140, y]], 8, { line: '#fff3d6' }); } }
  },
  blanket(t, tq) {   // jump 3: the boundary layer as a literal cosy blanket, then fast air blows it thin
    const blow = ss(seg(t, s(8) + .1, s(8) + 1.2)), k = 1 - .75 * blow;
    const z = lerp(1.15, 1.3, ss(seg(t, s(6), s(9)))); cam(540, 1000, z); blanketWorld(t);
    // gold heat arrows: bounce off while the blanket is thick, sink in once it's thin
    for (let i = 0; i < 6; i++) { const ang = -Math.PI / 2 + (i - 2.5) * .45, u = (t * .7 + i / 6) % 1, r0 = 520, rIn = lerp(340, 190, blow), r = lerp(r0, rIn, Math.min(1, u * 1.6)) + (blow < .5 && u > .62 ? (u - .62) * 400 : 0), cx = 540 + Math.cos(ang) * r, cy = 1050 + Math.sin(ang) * r * .9; push(); translate(cx, cy); rotate(ang + Math.PI); shape([[30, 0], [-20, -22], [-8, 0], [-20, 22]], { fill: '#e8d84a', lw: 6 }); pop(); }
    quilt(540, 1080, 170, 230, k, t, blow);
    spud(P(t, { x: 540, y: 1290, s: 1.0, nerv: .2 + blow, lid: lerp(.55, 0, blow), look: [blow ? -.6 : 0, 0], eyeS: 1 + blow * .3, mouth: { o: blow * .6, sm: blow ? -1 : .4 } }));
    if (t > s(8)) for (let i = 0; i < 6; i++) { const y = 820 + i * 90, x = ((t * 1100 + i * 300) % 1400) - 250; stroke([[x, y], [x + 180, y + 10]], 9, { line: '#e8f0ff', alpha: .9 }); }
    if (t > s(6) + 1.6 && t < s(8) + .3) { const kk = back(seg(tq, s(6) + 1.6, s(6) + 1.85), 2); push(); translate(540, 640); scale(kk); text('COOL AIR LAYER', 0, 0, { font: '800 64px "Baloo 2"', fill: '#e8d84a', outlineW: 12 }); pop(); }
  },
  brown(t, tq) {   // jump 4: dries, browns (Maillard), the 140 C zone, a thin coat of oil but no swimming
    cam(540, 960, 1); brownWorld(t);
    const dry = seg(t, s(9), s(9) + 1.6), gold = ss(seg(t, s(9) + 1.2, s(10) + 3.0));
    spud(P(t, { x: 540, y: 1180, s: .85, nerv: .2, gold, look: [0, -.4], mouth: { o: .2 * talk(t).o, sm: gold > .6 ? .9 : -.2 }, lid: gold > .6 ? .2 : 0, oil: t > s(12) + .6 && t < s(13) - .3 }));
    for (let i = 0; i < 6; i++) { const u = (t * .9 + i / 6) % 1; if (dry < 1) shape(ell(420 + i * 45, 940 - u * 160, 9 * (1 - dry), 13 * (1 - dry) + 1, 10), { fill: '#bfe9ff', lw: 4, alpha: 1 - dry }); }
    if (gold > .3) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t, r = 260 + 20 * Math.sin(t * 5 + i), x = 540 + Math.cos(a) * r, y = 1020 + Math.sin(a) * r * .8, rr_ = 12 + 8 * Math.sin(t * 6 + i); shape([[x, y - rr_], [x + rr_ * .3, y - rr_ * .3], [x + rr_, y], [x + rr_ * .3, y + rr_ * .3], [x, y + rr_], [x - rr_ * .3, y + rr_ * .3], [x - rr_, y], [x - rr_ * .3, y - rr_ * .3]], { fill: '#ffe066', lw: 4 }); }
    if (t > s(10) && t < s(12)) { const k = back(seg(tq, s(10), s(10) + .25), 2); push(); translate(540, 470); scale(k); text('MAILLARD', 0, 0, { font: '400 120px Bungee', fill: '#ff7a6b', outlineW: 18 }); text('sugars + proteins → golden', 0, 96, { font: '800 44px "Baloo 2"', fill: '#fff', outlineW: 10 }); pop(); }
    if (t > s(11) - .1 && t < s(12) + .2) { // thermometer readout
      const v = Math.round(lerp(100, 140, ss(seg(t, s(11), s(11) + 1.6)))); push(); translate(900, 760); shape(rr(-50, -260, 100, 520, 50), { fill: '#f7f3ea', lw: 7, shade: () => fillOnly(rect(-60, lerp(220, -140, (v - 100) / 50), 120, 600), '#ff4a2a', { boil: .3 }) }); shape(ell(0, 270, 70, 70, 30), { fill: '#ff4a2a', lw: 7 }); pop();
      push(); translate(300, 760); shape(rr(-200, -70, 400, 140, 16), { fill: '#123a2f', lw: 7 }); text(v + '°C', 0, -8, { font: '400 100px VT323', fill: '#ff7a6b' }); text('frying zone 140-165', 0, 50, { font: '400 34px VT323', fill: '#bdf2d5' }); pop(); }
    if (t > s(12) - .1) {   // oil mister in Juno's mitt + NO SWIMMING sign
      const k = back(seg(tq, s(12) - .1, s(12) + .2), 1.6); push(); translate(lerp(1200, 900, k), 820); rotate(-.3); shape(rr(-40, -120, 80, 160, 20), { fill: '#f3d36b', lw: 7 }); shape(rr(-20, -160, 40, 44, 8), { fill: '#3a3d4a', lw: 6 }); pop(); mitt(lerp(1260, 960, k), 860, Math.PI, 1);
      if (t > s(12) + .4 && t < s(12) + 1.6) for (let i = 0; i < 10; i++) dot(820 - hash(i) * 180, 760 + (hash(i * 3) - .5) * 120, 5, '#ffe27a');
      if (t > s(12) + 1.4) { const kk = back(seg(tq, s(12) + 1.4, s(12) + 1.65), 2); push(); translate(260, 560); scale(kk); rotate(-.06); shape(rr(-190, -80, 380, 160, 16), { fill: '#fff3d6', lw: 8 }); text('NO SWIMMING', 0, 0, { font: '400 50px Bungee', fill: '#e8483b' }); pop(); push(); translate(260, 560); scale(kk); stroke([[-200, 90], [200, -90]], 12, { line: '#e8483b' }); pop(); }
    }
  },
  normal(t, tq) {   // the break: suspiciously normal world, everyone calm
    const z = lerp(1, 1.06, ss(seg(t, s(13), s(15)))); cam(540, 960, z); normalWorld(t);
    juno(J(t, { x: 860, y: 1460, s: .9, look: [.9, 0], armR: t > s(13) + 1.4 && t < s(14) ? { h: [160, -20], bend: -20 } : undefined }));
    const shrug = ss(seg(t, s(14) + .6, s(14) + 1.0)) * (1 - ss(seg(t, s(14) + 2.6, s(14) + 3.0)));
    spud(P(t, { x: 180, y: 1460, s: .72, nerv: 0, lid: .45, look: [.6, 0], mouth: { o: 0, sm: .2 }, brow: shrug * 1.4 - .3, armL: { h: [-60, -50 * shrug + 40], bend: 20 }, armR: { h: [60, -50 * shrug + 40], bend: -20 } }));
  },
  lab3(t, tq) {   // home: history on the blackboard, then a very slow push-in for the question
    const pushIn = ss(seg(t, s(16) - .3, s(17))); cam(lerp(540, 520, pushIn), lerp(1010, 1030, pushIn), lerp(1.1, 1.25, pushIn)); lab(t, { board: seg(t, s(15) + .3, s(15) + 4.2) });
    fryer(170, 1080, .78, t, { screenTxt: '200°C', steam: 1 });
    juno(J(t, { armR: t < s(16) ? { h: [-120, -150], bend: 30 } : undefined, look: t < s(16) ? [-.3, -.9] : [-.7, .2], lid: t > s(16) ? .55 : .5 }));
    spud(P(t, { look: t < s(16) ? [.8, -.8] : [-.8, .1], nerv: .2, sweat: t > s(16) + .8 ? t : null }));
  },
  end(t, tq) {   // end card: dark purple, dim portal, title lockup, closing line
    reset(); screenRect('#241339'); reset(); portal(540, 1080, 420, t * .6, { open: spring(t - CUTS[7], 7, .45), sx: 1 }); screenRect('#241339', .5);
    const k = t - CUTS[7]; if (k > .8) spud(P(t, { x: 540 + Math.sin(k * 1.3) * 60, y: 1340 + Math.cos(k * 1.1) * 12, s: .55, gold: 1, nerv: 0, mouth: { o: 0, sm: 1 }, lid: .2, look: [0, -.3], lean: Math.sin(k * 2) * .3, armL: { h: [-70, -60], bend: 10 }, armR: { h: [70, -60], bend: -10 } }));
    const sc = back(seg(q(t), CUTS[7], CUTS[7] + .3), 2.2); reset(); translate(540, 420); scale(sc * .62); titleArt(t);
    const b = ss(seg(t, CUTS[7] + .3, CUTS[7] + .8)); reset(); g.globalAlpha = b;
    text('Follow for more of', 540, 690, { font: '800 70px "Baloo 2"', fill: '#fff', outlineW: 12 }); text('how it really works.', 540, 780, { font: '800 70px "Baloo 2"', fill: '#ffe066', outlineW: 12 });
    text('@howitreallyworkstudio', 540, 1640, { font: '400 52px VT323', fill: '#b8ff5a', outlineW: 8 }); g.globalAlpha = 1;
  },
};

// ———————————————————— screen layer ————————————————————
function titleArt(t) {   // atomic-age TV lockup: cream block letters, hard magenta offset, cyan orbit ring, orbiting fry, twinkle stars
  const orb = t * 1.6, rx = 560, ry = 92;
  const ring = (a0, a1) => { const P_ = arc(0, 6, rx, ry, a0, a1, 40); stroke(P_, 21, { boil: .5 }); stroke(P_, 9, { line: '#5ee6ff', boil: .5 }); };
  const fry = () => { push(); translate(Math.cos(orb) * rx, 6 + Math.sin(orb) * ry); rotate(orb + 1.2); shape(rr(-12, -34, 24, 68, 6), { fill: '#f2c14e', lw: 6 }); pop(); };
  rotate(-.05); push(); rotate(.12); ring(Math.PI, TAU); if (Math.sin(orb) < 0) fry(); pop();
  text('NOT A', 10, -98, { font: '400 110px Bungee', fill: '#ff4fa3', outlineW: 20, outlineCol: INK }); text('NOT A', 0, -108, { font: '400 110px Bungee', fill: '#fff3d6', outlineW: 20, outlineCol: INK });
  text('FRYER', 12, 52, { font: '400 170px Bungee', fill: '#ff4fa3', outlineW: 22, outlineCol: INK }); text('FRYER', 0, 40, { font: '400 170px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  push(); rotate(.12); ring(0, Math.PI); if (Math.sin(orb) >= 0) fry(); pop();
  for (let i = 0; i < 4; i++) { const x = [-520, 520, -380, 430][i], y = [-170, -150, 150, 160][i], r = 16 + 10 * Math.sin(t * 5 + i * 1.7); shape([[x, y - r], [x + r * .28, y - r * .28], [x + r, y], [x + r * .28, y + r * .28], [x, y + r], [x - r * .28, y + r * .28], [x - r, y], [x - r * .28, y - r * .28]], { fill: '#ffe066', lw: 5 }); }
}
function titleCard(t) {   // popped in on 12 fps steps from frame 0, out before the first jump
  const a = 0, b = s(1) - .3; if (t >= b) return; const u = seg(q(t) + .25, a, a + .25), sc = u < 1 ? back(u, 2.4) : 1, out = 1 - seg(t, b - .2, b);
  reset(); translate(540, 300); scale(sc * out * .92, sc * .92); titleArt(t);
}
function wipe(t) { for (const [tc, hw] of WIPES) { const d = Math.abs(t - tc); if (d > hw) continue; const u = 1 - d / hw, R = 1500 * Math.pow(u, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); if (d < .03) screenRect('#dcffa8', .7); } }
function tag(t) {
  for (const [a, b, id, desc, bg, fg] of TAGS) { if (t < a || t >= b) continue; const n = Math.floor((t - a) * 40), s1 = id.slice(0, n), s2 = desc.slice(0, Math.max(0, n - id.length)); reset(); const pp = back(seg(t, a, a + .18), 2.2);
    push(); translate(50, 70); scale(pp); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '400 54px VT323'; const w1 = Math.max(g.measureText('▶ ' + id).width, g.measureText(desc).width * 40 / 54) + 60;
    shape(rr(0, 0, Math.max(420, w1), 118, 12), { fill: bg, lw: 7 }); text('▶ ' + s1 + (n < id.length && Math.floor(t * 6) % 2 ? '█' : ''), 24, 38, { font: '400 54px VT323', fill: fg, align: 'left' }); text(s2, 26, 86, { font: '400 40px VT323', fill: fg, align: 'left' }); pop(); }
}
function wrapSub(str) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 56px "Baloo 2"'; const words = str.split(' '), L = ['']; words.forEach(w => { const tr = (L[L.length - 1] + ' ' + w).trim(); if (g.measureText(tr).width > 800 && L[L.length - 1]) L.push(w); else L[L.length - 1] = tr; }); return L; }
function subs(t) {   // Baloo ExtraBold, white with thick ink outline, speaker pill in Juno's suit colour
  const i = PH.findIndex((p, k) => t >= p.start - .05 && t < (PH[k + 1] ? PH[k + 1].start - .05 : p.end + 1)); if (i < 0 || SHOT(t) === 'end') return; const p = PH[i]; if (t > p.end + .6) return;
  const cut = CUTS.find(c => c > p.start + .1); if (cut && t > cut - .02 && t < cut + .02) return;
  const str = p.cap.replace(/\*\*/g, ''), lines = wrapSub(str), pp = back(seg(t, p.start - .05, p.start + .07), 2);
  const y0 = 1690 - (lines.length - 1) * 70; reset(); push(); translate(540, y0 - 70); scale(pp); shape(rr(-70, -24, 140, 48, 14), { fill: PAL.suit, lw: 5 }); text('JUNO', 0, 2, { font: '800 30px "Baloo 2"', fill: INK }); pop();
  lines.forEach((l, k) => text(l, 540, y0 + k * 70, { font: '800 56px "Baloo 2"', fill: '#fff', outlineW: 12 }));
}

function render(t) {
  frame(t); screenRect('#000'); const tq = q(t); SH[SHOT(t)](t, tq); wipe(t); titleCard(t); tag(t); subs(t);
}
window.DUR = TL.total;
window.seek = t => { render(t); const fade = Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - fade; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } };
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
