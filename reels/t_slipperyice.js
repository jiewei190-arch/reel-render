// t_slipperyice.js: "Why is ice slippery?" in template #9 scifi-toon (lemo-opuscar/styles/scifi-toon) grammar.
// 1080x1920. Characters, boil and mouths step at 12 fps; camera, portal swirl and wipes run on ones.
// One palette per world, the portal is the only thing that glows, VT323 world tag typed in, Baloo subtitles with speaker pill,
// Bungee title lockup with orbit ring, hard cuts or swirl wipes only (no dissolves). Story: a suspect line-up; each suspect is a world.
import { clamp, lerp, seg, ss, eo, back, spring, hash, vnoise, TAU } from './styles/scifitoon/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, noodle, reset, bands } from './styles/scifitoon/toon.js';
import { juno, spud, mitt, eye, mouth, sweat, PAL, mix } from './styles/scifitoon/cast_af.js';
await Promise.all(['800 50px "Baloo 2"', '400 50px VT323', '400 50px Bungee'].map(f => document.fonts.load(f)));
init(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, LIP = window.LIP || [];
const q = t => Math.floor(t * 12 + 1e-6) / 12;

function talk(t) { const tq = q(t); const on = PH.some(p => tq >= p.start - .02 && tq < p.end + .02); if (!on) return { o: 0, w: 1, talking: false }; const o = LIP[Math.floor(tq * 24)] || 0; return { o: clamp(o * 1.05), w: .85 + .3 * hash(Math.floor(tq * 12)) - .2 * o, talking: true }; }
const blink = (t, ph = 0) => { const k = Math.floor(t * 12 + ph * 7) + 9; return k % 37 === 0 || k % 37 === 1; };
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
const star = (x, y, r, col = '#ffe066', lw = 4) => shape([[x, y - r], [x + r * .3, y - r * .3], [x + r, y], [x + r * .3, y + r * .3], [x, y + r], [x - r * .3, y + r * .3], [x - r, y], [x - r * .3, y - r * .3]], { fill: col, lw });
const sign = (x, y, w, h, str, t0, tq, o = {}) => { const k = back(seg(tq, t0, t0 + .25), 2); if (k <= 0) return; push(); translate(x, y); rotate(o.rot ?? -.05); scale(k); shape(rr(-w / 2, -h / 2, w, h, 14), { fill: o.bg || '#fff3d6', lw: 7 }); text(str, 0, 3, { font: o.font || '400 46px Bungee', fill: o.col || '#e8483b' }); pop(); };
const stamp = (x, y, k) => { if (k <= 0) return; push(); translate(x, y); scale(k); stroke([[-70, -70], [70, 70]], 26, { line: INK }); stroke([[70, -70], [-70, 70]], 26, { line: INK }); stroke([[-70, -70], [70, 70]], 14, { line: '#e8483b' }); stroke([[70, -70], [-70, 70]], 14, { line: '#e8483b' }); pop(); };
function readout(x, y, w, l1, l2, o = {}) { push(); translate(x, y); shape(rr(-w / 2, -66, w, 132, 16), { fill: o.bg || '#0f3b3a', lw: 7 }); text(l1, 0, -14, { font: '400 76px VT323', fill: o.fg || '#9cf2ff' }); if (l2) text(l2, 0, 40, { font: '400 34px VT323', fill: o.fg2 || '#e8f6f4' }); pop(); }
function thermo(x, y, v, lo, hi, col = '#3fa9ff') { push(); translate(x, y); shape(rr(-40, -230, 80, 440, 40), { fill: '#f7f3ea', lw: 7, shade: () => fillOnly(rect(-50, lerp(190, -200, clamp((v - lo) / (hi - lo))), 100, 600), col, { boil: .3 }) }); shape(ell(0, 230, 58, 58, 28), { fill: col, lw: 7 }); pop(); }

// —— Spud's skates: blades under his shoes, same transform as spud() ——
function skates(P) { const f = P.face ?? 1, s = P.s ?? 1; push(); translate(P.x, P.y + (P.bob || 0)); scale(s * f, s * (P.sq ?? 1)); rotate(P.lean || 0);
  for (const sx of [-1, 1]) { stroke([[sx * 46 - 12, 8], [sx * 46 - 12, 22]], 5); stroke([[sx * 46 + 14, 8], [sx * 46 + 14, 22]], 5); shape(spline([[sx * 46 - 40, 22], [sx * 46 + 40, 22], [sx * 46 + 52, 14], [sx * 46 + 48, 30], [sx * 46 - 40, 30]], true, 4), { fill: '#d7e4ee', lw: 5 }); } pop(); }
function skater(P) { skates(P); spud(P); }

// ———————————————————— worlds (one palette each) ————————————————————
const X0 = -900, X1 = 2000, FLOOR = 1300;
function rink(t, o = {}) {          // home ice: pale blue + coral boards
  bands(['#cfefff', '#bfe6fb', '#aedcf5', '#9fd2ef'], -800, 900);
  for (let i = 0; i < 7; i++) { const x = -300 + i * 260; shape(rr(x, 560, 200, 120, 12), { fill: '#88c6e6', lw: 6, shade: () => { for (let k = 0; k < 4; k++) dot(x + 30 + k * 46, 610 + Math.sin(t * 3 + i + k) * 4, 12, ['#ff8c5a', '#f2d16b', '#9cf23c', '#ff4f9a'][(i + k) % 4]); } }); }
  shape(rect(X0, 760, X1 - X0, 120), { fill: '#ff7a6b', lw: 7, shade: () => { for (let x = -800; x < 2000; x += 180) fillOnly(rect(x, 790, 90, 30), '#fff3d6', { boil: .3 }); } });
  shape(rect(X0, 880, X1 - X0, 1200), { fill: '#eef9ff', lw: 7, shade: () => { for (let i = 0; i < 9; i++) { const y = 940 + i * 60 + i * i * 6; stroke([[X0, y], [X1, y + 20]], 3, { line: '#cfe9f6' }); } stroke(ell(540, 1180, 300, 90, 40), 6, { line: '#ff7a6b' }); } });
  for (let i = 0; i < 7; i++) { const y = 1460 + i * 70; stroke(arc(540 + (i % 2 ? 180 : -180), y + 260, 420 + i * 30, 240, -Math.PI * .85, -Math.PI * .15, 24), 5, { line: i % 3 ? '#cfe9f6' : '#ffb3a8' }); }
  if (o.trail) { const Lt = Math.min(760, 300 + t * 260), x0 = o.trail - 60 - Lt; for (let i = 0; i < 2; i++) { const P_ = []; for (let j = 0; j <= 16; j++) { const u = j / 16, x = lerp(x0, o.trail - 60, u); P_.push([x, 1312 + i * 14 + Math.sin(x / 140) * 10]); } stroke(P_, 6, { line: i ? '#9fd2ef' : '#6fb2dc' }); } }
}
function labW(t, o = {}) {          // home lab: sage walls, blackboard with the suspect line-up
  fillOnly(rect(X0, -800, X1 - X0, 2400), '#a7c3b1', { boil: 0 }); for (let x = -800; x < 2000; x += 240) stroke([[x, -800], [x, FLOOR]], 4, { line: '#7c9d8a' });
  shape(rr(120, 470, 840, 420, 12), { fill: '#2f4a3f', lw: 8, shade: () => {
    text('SUSPECTS', 540, 528, { font: '400 54px VT323', fill: '#e8f0e0' }); stroke([[380, 556], [700, 556]], 3, { line: '#e8f0e0' });
    const rows = o.rows || []; rows.forEach(([str, col], i) => text(str, 170, 620 + i * 70, { font: '400 48px VT323', fill: col || '#e8f0e0', align: 'left' }));
  } });
  shape(rr(140, 882, 800, 18, 4), { fill: '#b08a5a', lw: 5 });
  push(); translate(1000, 300); shape(ell(0, 0, 60, 60, 36), { fill: '#f7f3e8', lw: 7 }); const sA = Math.floor(t) / 60 * TAU - Math.PI / 2; stroke([[0, 0], [0, -34]], 7); stroke([[0, 0], [30, 14]], 5); stroke([[0, 0], [Math.cos(sA) * 46, Math.sin(sA) * 46]], 2.5, { line: '#e8392b' }); dot(0, 0, 6); pop();
  shape(rect(X0, FLOOR, X1 - X0, 900), { fill: '#6c7c75', lw: 6 }); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 70 + k * k * 14], [X1, FLOOR + 40 + k * 70 + k * k * 14]], 4, { line: '#58665f' }); shape(rect(X0, FLOOR - 30, X1 - X0, 32), { fill: '#557065', lw: 6 });
  // a block of ice on a stand (the exhibit)
  shape(rr(-80, 1080, 240, 220, 10), { fill: '#8e7a66', lw: 7 }); shape(rr(-40, 960, 170, 120, 10), { fill: '#d6f2ff', lw: 7, shade: () => { fillOnly(rect(80, 960, 60, 120), '#b6e3f7', { boil: .3 }); stroke([[-10, 990], [30, 980]], 5, { line: '#ffffff' }); } });
}
function pressureWorld(t) {         // U-1886: brass + sepia, a Victorian press over an ice block
  bands(['#f3d9a4', '#ebcb8c', '#e2bd78', '#d8ae66'], -800, FLOOR);
  for (let i = 0; i < 6; i++) { const x = -100 + i * 220; push(); translate(x, 330); rotate(t * (i % 2 ? .6 : -.6)); const P_ = []; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = k % 2 ? 46 : 60; P_.push([Math.cos(a) * r, Math.sin(a) * r]); } shape(P_, { fill: '#b8873a', lw: 6, shade: () => fillOnly(ell(0, 0, 18, 18, 12), '#8a5e22') }); pop(); }
  shape(rect(X0, FLOOR, X1 - X0, 900), { fill: '#7a5230', lw: 7 }); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR], [x + 40, FLOOR + 600]], 4, { line: '#5e3e22' });
}
function frictionWorld(t, sp = 1) { // orange + teal: speed and heat
  bands(['#ff7a2f', '#ff8d45', '#ffa35c', '#ffb862'], -800, 1000);
  for (let i = 0; i < 5; i++) { const x = ((i * 300 - t * 400 * sp) % 1500 + 1500) % 1500 - 200; shape(spline([[x - 120, 1000], [x - 40, 760 - hash(i) * 120], [x + 60, 780], [x + 140, 1000]]), { fill: '#d9582a', lw: 6 }); }
  shape(rect(X0, 1000, X1 - X0, 1200), { fill: '#2b9c98', lw: 7, shade: () => { for (let i = 0; i < 8; i++) { const x = ((i * 220 - t * 900 * sp) % 1800 + 1800) % 1800 - 400; stroke([[x, 1080 + (i % 8) * 110], [x + 160, 1080 + (i % 8) * 110]], 6, { line: '#5fd0c8' }); } for (let i = 0; i < 6; i++) fillOnly(rect(X0, 1500 + i * 90, X1 - X0, 8), '#239089', { boil: .3 }); } });
}
function surfaceWorld(t) {          // ultraviolet + ice blue: the molecular surface
  bands(['#3b1f66', '#46277a', '#52308c', '#5e3a9c'], -800, 2600);
  for (let i = 0; i < 14; i++) { const x = hash(i * 3.3) * 1080, y = hash(i * 5.1) * 500 + 330, r = 6 + 5 * Math.sin(t * 4 + i); star(x, y, r, '#9cf2ff', 3); }
}
// molecules: a stuck lattice below, loose rollers on top; scramble 0..1 jumbles the top rows (the 2025 simulation)
function lattice(t, o = {}) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(0, 0, 870, 1640); g.clip(); latticeIn(t, o); g.restore(); reset(); stroke([[870, (o.y0 ?? 1020) - 60], [870, 1640], [-20, 1640]], 9, { line: '#9cf2ff' }); }
function latticeIn(t, o = {}) { const { y0 = 1020, rows = 6, roll = 1, scramble = 0, hi = -1, z = 1 } = o; const sp = 104 * z;
  for (let r = rows - 1; r >= 0; r--) for (let c = -1; c < 12; c++) { const x0 = c * sp + (r % 2 ? sp / 2 : 0), y = y0 + r * sp * .86; const top = r === 0, jit = scramble * (rows - r) / rows; const jx = (hash(c * 7 + r * 13 + Math.floor(t * 12)) - .5) * 40 * jit, jy = (hash(c * 3 + r * 5 + Math.floor(t * 12) + 9) - .5) * 30 * jit;
    const x = x0 + jx, yy = y + jy;
    if (r < rows - 1 && jit < .3) { stroke([[x, yy], [x + sp / 2, yy + sp * .86]], 6 * z, { line: '#7fb8e6' }); stroke([[x, yy], [x - sp / 2, yy + sp * .86]], 6 * z, { line: '#7fb8e6' }); }
    if (c < 11 && jit < .3) stroke([[x, yy], [x + sp, yy]], 6 * z, { line: '#7fb8e6' });
    mol(x, yy, 30 * z, t, top ? '#bfefff' : '#8fd3ff', top && hi === 1); }
  // loose rollers riding on top
  if (roll > 0) for (let i = 0; i < 6; i++) { const x = ((i * 190 + t * 160) % 1300) - 110, y = y0 - 70 * z - Math.abs(Math.sin(t * 5 + i)) * 10; push(); translate(x, y); rotate(t * 5 + i); mol(0, 0, 28 * z, t, '#ffe066', hi === 2, roll); pop(); }
}
function mol(x, y, r, t, col, glowRing = false, a = 1) { shape(ell(x, y, r, r, 18), { fill: col, lw: 5, alpha: a }); dot(x - r * .7, y + r * .55, r * .38, '#f7f3ea'); dot(x + r * .7, y + r * .55, r * .38, '#f7f3ea'); if (glowRing) stroke(ell(x, y, r + 14, r + 14, 18), 5, { line: '#ff4f9a' }); }

// ———————————————————— poses ————————————————————
function J(t, o = {}) { const m = talk(t), tq = q(t); return { x: 860, y: FLOOR + 10, s: .9, face: -1, lid: .5, look: [0, 0], mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), blink: blink(t), ...o }; }
function P(t, o = {}) { const tq = q(t); return { x: 380, y: FLOOR, s: .8, face: 1, t, nerv: .3, look: [.5, -.2], blink: blink(t, 3), mouth: { o: 0, sm: -.4 }, sq: 1 + .012 * Math.sin(tq * 3.1), ...o }; }
const glide = (t, a, b) => { const u = ((t - a) / (b - a)); return u - Math.floor(u); };

// ———————————————————— shots ————————————————————
const HCUT = s(1) - .1;
const WIPES = [[s(2) - .3, .3], [s(5) - .3, .3], [s(8) - .3, .3], [s(13) - .3, .3], [s(15) - .25, .25]];
const CUTS = WIPES.map(w => w[0]);
const SHOT = t => { if (t < HCUT) return 'hook'; const k = CUTS.filter(c => t >= c).length; return ['lab', 'press', 'fric', 'surf', 'lab3', 'end'][k]; };
const TAGS = [[s(2) - .1, s(5) - .4, 'U-1  PRESSURE WORLD', 'year: 1886', '#3a2410', '#f3d9a4'], [s(5) - .1, s(8) - .4, 'U-2  FRICTION WORLD', 'sliding makes heat', '#0f3b3a', '#ffb862'], [s(8) - .1, s(13) - .4, 'U-3  THE SURFACE', 'zoom: molecules', '#1c0d38', '#9cf2ff']];

const SH = {
  hook(t, tq) {   // frame 0: Spud already gliding across the rink, ice spray; the old theory gets stamped
    cam(540, 1000, 1); const u = (t * .16 + .42) % 1, x = lerp(-200, 1280, u); rink(t, { trail: x });
    skater(P(t, { x, y: 1300, s: 1.35, lean: .14, nerv: .2, look: [.8, -.1], mouth: { o: .4, sm: .6 }, eyeS: 1.15, armL: { h: [-90, -20], bend: 20 }, armR: { h: [90, -30], bend: -20 }, kick: 10 * Math.sin(t * 8) }));
    for (let i = 0; i < 6; i++) { const k = (t * 3 + i / 6) % 1; dot(x - 60 - k * 120, 1290 - Math.sin(k * Math.PI) * 50 - i * 4, 8 * (1 - k) + 3, '#ffffff'); }
    // the myth panel: a weight squashing ice into water, stamped NOT IT
    const pk = back(seg(tq, .9, 1.2), 2) * (1 - seg(t, s(1) - .5, s(1) - .3)); if (pk > 0) { push(); translate(540, 735); scale(pk); shape(rr(-300, -100, 600, 200, 18), { fill: '#fff3d6', lw: 7 }); shape(rr(-250, -80, 120, 90, 10), { fill: '#3a3d4a', lw: 6 }); text('KG', -190, -34, { font: '400 40px Bungee', fill: '#fff3d6' });
      text('→', -80, -30, { font: '800 70px "Baloo 2"', fill: INK }); shape(ell(60, -20, 80, 26, 20), { fill: '#9fd2ef', lw: 6 }); text('MELT?', 180, -30, { font: '400 44px Bungee', fill: '#3a7fb0' }); text('the old answer', 0, 60, { font: '800 40px "Baloo 2"', fill: INK }); pop(); stamp(540, 725, back(seg(tq, 1.9, 2.15), 2.4)); }
  },
  lab(t, tq) {   // two-shot at the board: the suspect line-up, then Juno opens the portal
    const z = lerp(1.0, 1.04, ss(seg(t, HCUT, s(2)))); cam(540, 1000, z);
    labW(t, { rows: [['1  PRESSURE  ?'], ['2  FRICTION  ?'], ['3  ???', '#ffd36e']].slice(0, Math.floor(seg(t, s(1) + 1.0, s(1) + 2.4) * 3 + .999)) });
    const po = popOpen(t - (s(2) - .9)); portal(540, 700, 230, t, { open: po });
    const pt = t > s(1) + .8 && t < s(2) - 1.2; juno(J(t, { armR: pt ? { h: [-170, -140], bend: 30 } : undefined, look: pt ? [-.6, -.6] : [-.4, 0] }));
    skater(P(t, { x: 300, y: FLOOR, nerv: .3 + po * .8, sweat: po > 0 ? t : null, look: [po > 0 ? .3 : .6, -.4], mouth: { o: po * .6 + .2 * Math.sin(t * 2), sm: -.8 }, eyeS: 1 + po * .25, lean: Math.sin(t * 2.4) * .06 }));
  },
  press(t, tq) {   // U-1: a big press drives a skate blade into an ice block; gauge to 466 atm, melt at -3.5; then -35 and the standing-still slip
    const cold = t > s(4) - .1;
    if (!cold) { cam(540, 960, 1); pressureWorld(t); push(); translate(0, -90);
      const dn = ss(seg(t, s(3) + .2, s(3) + 1.6)), py = lerp(520, 690, dn);
      shape(rr(150, 300, 60, 1090, 10), { fill: "#8a5e22", lw: 7 }); shape(rr(870, 300, 60, 1090, 10), { fill: '#8a5e22', lw: 7 }); shape(rr(120, 240, 840, 90, 14), { fill: '#b8873a', lw: 8 });
      shape(rr(500, 330, 80, py - 330 - 60, 8), { fill: '#d6b56a', lw: 6 }); shape(rr(380, py - 70, 320, 70, 12), { fill: '#3a3d4a', lw: 7 });
      shape(spline([[400, py], [680, py], [700, py + 10], [690, py + 24], [400, py + 24]], true, 4), { fill: '#d7e4ee', lw: 6 });
      shape(rr(260, 700, 560, 360, 16), { fill: '#d6f2ff', lw: 8, shade: () => { fillOnly(rect(700, 700, 120, 360), '#b6e3f7', { boil: .3 }); for (let i = 0; i < 3; i++) stroke([[300 + i * 40, 760 + i * 30], [340 + i * 40, 740 + i * 30]], 5, { line: '#ffffff' }); } });
      if (dn > .8) { const m = ss(seg(t, s(3) + 1.6, s(3) + 3.0)); fillOnly(ell(540, 712, 150 * m, 14 * m + 1, 20), '#3fa9ff', { boil: .4 }); for (let i = 0; i < 4; i++) { const u = (t * 1.4 + i / 4) % 1; dot(420 + i * 70, 712 + u * 30, 7 * (1 - u) + 2, '#3fa9ff'); } }
      pop(); if (t > s(3) + 1.0) { const a = Math.round(lerp(1, 466, ss(seg(t, s(3) + 1.0, s(3) + 3.2)))); readout(290, 480, 380, a + ' atm', "Joly's estimate", { bg: '#3a2410', fg: '#f3d9a4' }); }
      if (t > s(3) + 3.0) readout(780, 480, 330, '-3.5°C', 'new melting point', { bg: '#3a2410', fg: '#9cf2ff' });
      juno(J(t, { x: 1010, y: FLOOR + 10, s: .62, look: [-.6, -.4] }));
    } else { cam(540, 960, 1); rink(t); const v = Math.round(lerp(-3.5, -35, ss(seg(t, s(4), s(4) + 1.2))));
      thermo(870, 560, v, -40, 0); readout(870, 900, 300, v.toFixed(v > -10 ? 1 : 0) + '°C', 'people still skate', { bg: '#0f2b3b' });
      const fall = seg(t, s(4) + 2.2, s(4) + 3.2), still = t > s(4) + 1.9;
      if (!still) { const u = glide(t, s(4) - .2, s(4) + 2.3); skater(P(t, { x: lerp(100, 700, u), y: 1300, s: .9, lean: .12, look: [.8, 0], mouth: { o: .3, sm: .7 }, armL: { h: [-90, -20], bend: 20 }, armR: { h: [90, -30], bend: -20 } })); }
      else { const sl = eo(fall); skater(P(t, { x: 360 + sl * 60, y: 1300 - Math.sin(sl * Math.PI) * 60 + sl * 40, s: .9, lean: -sl * 1.3, nerv: 1, look: [0, -.8], eyeS: 1.4, mouth: { o: .9, sm: -1 }, armL: { h: [-90, -90], bend: 10 }, armR: { h: [90, -90], bend: -10 }, sweat: t }));
        sign(320, 820, 520, 110, 'STANDING STILL', s(4) + 1.9, tq, { rot: .04, col: '#3a7fb0' }); }
      stamp(870, 560, back(seg(tq, s(4) + 1.2, s(4) + 1.45), 2.4) * .8);
    }
  },
  fric(t, tq) {   // U-2: Spud speeds up, a sensor on the blade reads warmer with speed; then he stops and the heat fades
    const stop = t > s(7) - .1, spd = stop ? 1 - ss(seg(t, s(7) - .1, s(7) + .8)) : ss(seg(t, s(5), s(6) + 2)), vx = spd;
    cam(540, 960, lerp(1, 1.06, spd), spd * 3, t); frictionWorld(t, .3 + spd * 1.6);
    const sx = 540 + Math.sin(t * 1.3) * 40 * spd;
    if (spd > .1) for (let i = 0; i < 5; i++) { const y = 1080 + i * 46, x = ((t * 1400 + i * 260) % 1300) - 200; stroke([[x, y], [x + 200 * spd, y]], 8, { line: '#fff3d6', alpha: spd }); }
    // heat under the blades
    const heat = clamp(spd * 1.1); if (heat > .05) for (let i = 0; i < 4; i++) { const u = (t * 2 + i / 4) % 1; stroke([[sx - 80 + i * 50, 1070 - u * 60], [sx - 70 + i * 50, 1040 - u * 60], [sx - 80 + i * 50, 1010 - u * 60]], 6, { line: '#ff4a2a', alpha: heat * (1 - u) }); }
    fillOnly(ell(sx, 1092, 120 * heat, 10 * heat + 1, 20), '#3fa9ff', { boil: .4 });
    skater(P(t, { x: sx, y: 1080, s: .95, lean: .2 * spd, nerv: stop ? .6 : .1, look: [.8, 0], mouth: { o: stop ? .6 : .3, sm: stop ? -.8 : .8 }, eyeS: 1.1, armL: { h: [-90, -20 - 30 * spd], bend: 20 }, armR: { h: [90, -30 + 30 * spd], bend: -20 } }));
    // the sensor + two meters (speed and temperature rise together)
    if (t > s(6) - .2) { const k = back(seg(tq, s(6) - .2, s(6) + .05), 2); push(); translate(sx + 50, 1112); scale(k); shape(rr(-16, -10, 32, 20, 5), { fill: '#ffe066', lw: 4 }); pop(); stroke([[sx + 50, 1112], [sx + 160, 1180], [700, 1190]], 4, { line: INK, alpha: k });
      const sp = Math.round(spd * 30), dT = (spd * 2.4).toFixed(1); push(); translate(250, 560); scale(k); readout(0, 0, 360, sp + ' km/h', 'SPEED'); pop(); push(); translate(250, 760); scale(k); readout(0, 0, 360, '+' + dT + '°C', 'BLADE TEMP', { fg: '#ffb862' }); pop(); }
    if (stop) sign(760, 640, 400, 110, 'STOPPED?', s(7), tq, { col: '#0f3b3a' });
  },
  surf(t, tq) {   // U-3: the surface. Faraday's plaque, the two kinds of molecules, the -7 chart, the scramble
    const zoom = ss(seg(t, s(10) - .2, s(10) + .6)), chart = t > s(11) - .15 && t < s(12) - .15, scr = t > s(12) - .15;
    cam(540, 960, 1); surfaceWorld(t);
    if (!chart) {
      const z = lerp(1, 1.25, zoom), y0 = lerp(1080, 960, zoom);
      lattice(t, { y0, z, roll: t > s(8) + 1.2 ? 1 : 0, scramble: scr ? ss(seg(t, s(12) + .6, s(12) + 2.2)) : 0, hi: t > s(10) + 1.4 && t < s(11) ? 2 : t > s(10) + .6 && t < s(10) + 1.4 ? 1 : -1 });
      if (!scr && zoom < .5) skater(P(t, { x: 360 + Math.sin(t * 1.4) * 140, y: y0 - 110, s: .6, lean: Math.sin(t * 2.8) * .25, nerv: .5, look: [0, .6], mouth: { o: .5, sm: .2 }, eyeS: 1.2, armL: { h: [-90, -40], bend: 20 }, armR: { h: [90, -40], bend: -20 } }));
      if (t > s(9) - .1 && t < s(10) - .2) { const k = back(seg(tq, s(9) - .1, s(9) + .15), 2); push(); translate(540, 560); rotate(-.03); scale(k); shape(rr(-330, -120, 660, 240, 20), { fill: '#d6b56a', lw: 8, shade: () => fillOnly(rr(-300, -92, 600, 184, 12), '#f3e2b0', { boil: .3 }) }); text('M. FARADAY · 1850s', 0, -40, { font: '400 44px Bungee', fill: '#5e3e22' }); text('"a thin liquid-like', 0, 20, { font: '800 40px "Baloo 2"', fill: INK }); text('layer on ice"', 0, 64, { font: '800 40px "Baloo 2"', fill: INK }); pop(); }
      if (t > s(10) + .6 && t < s(11) - .2) { const k1 = back(seg(tq, s(10) + .6, s(10) + .85), 2), k2 = back(seg(tq, s(10) + 1.4, s(10) + 1.65), 2);
        push(); translate(300, 560); scale(k1); shape(rr(-210, -60, 420, 120, 16), { fill: '#8fd3ff', lw: 7 }); text('3 BONDS = STUCK', 0, 4, { font: '400 36px Bungee', fill: INK }); pop();
        push(); translate(720, 700); scale(k2); shape(rr(-230, -60, 460, 120, 16), { fill: '#ffe066', lw: 7 }); text('2 BONDS = ROLL', 0, 4, { font: '400 36px Bungee', fill: INK }); pop(); }
      if (t > s(10) && t < s(11) - .2) readout(540, 420, 520, 'AMSTERDAM + MAINZ', '2018', { bg: '#1c0d38', fg: '#9cf2ff' });
      if (scr) { // a block slides over: the top layer scrambles, the thermometer stays cold
        const bx = lerp(-300, 760, ss(seg(t, s(12) + .3, s(12) + 3.6))); push(); translate(bx, y0 - 150 * z); shape(rr(-170, -90, 340, 120, 14), { fill: '#3a3d4a', lw: 7, shade: () => fillOnly(rect(80, -90, 90, 120), '#2a2c36', { boil: .3 }) }); pop();
        readout(540, 420, 560, 'SIMULATION · 2025', 'rubbing, no melting', { bg: '#1c0d38', fg: '#ffe066' });
        sign(540, 610, 560, 110, 'SCRAMBLED, NOT MELTED', s(12) + 2.4, tq, { font: '400 38px Bungee', col: '#ff4f9a' }); }
    } else { // the chart: friction vs temperature, minimum at -7
      push(); translate(540, 900); shape(rr(-420, -330, 840, 640, 20), { fill: '#1c0d38', lw: 8 }); stroke([[-360, -270], [-360, 240], [380, 240]], 6, { line: '#9cf2ff' });
      text('FRICTION', -250, -290, { font: '400 40px VT323', fill: '#9cf2ff' }); text('-100°C', -330, 280, { font: '400 36px VT323', fill: '#e8f6f4' }); text('0°C', 350, 280, { font: '400 36px VT323', fill: '#e8f6f4' });
      const fx = c => -360 + (c + 100) / 100 * 740, fy = c => { const u = (c + 100) / 100; return c < -7 ? lerp(-230, 170, Math.pow(u / .93, 1.6)) : lerp(170, 60, (c + 7) / 7); };
      const dr = ss(seg(t, s(11), s(11) + 1.4)), Pc = []; for (let c = -100; c <= -100 + 100 * dr; c += 2) Pc.push([fx(c), fy(c)]); if (Pc.length > 1) { stroke(Pc, 16, { line: INK }); stroke(Pc, 8, { line: '#ffe066' }); }
      if (dr > .95) { const k = back(seg(tq, s(11) + 1.3, s(11) + 1.55), 2); push(); translate(fx(-7), fy(-7)); scale(k); star(0, 0, 30, '#ff4f9a', 5); pop(); push(); translate(fx(-7) - 290, fy(-7) - 40); scale(k); text('slipperiest', 0, 0, { font: '800 44px "Baloo 2"', fill: '#fff', outlineW: 10 }); text('≈ -7°C', 0, 52, { font: '400 54px VT323', fill: '#ffe066' }); pop(); }
      pop(); }
  },
  lab3(t, tq) {   // verdict on the board, then the three suspect cards for the question
    const qn = t > s(14) - .15; cam(540, 1000, lerp(1, 1.08, ss(seg(t, s(13), s(15)))));
    labW(t, { rows: [['1  PRESSURE  ✗ mostly', '#ff8c7a'], ['2  FRICTION  ✓', '#b8ff5a'], ['3  SURFACE   ✓', '#b8ff5a'], ['THE MIX: DEBATED', '#ffd36e']].slice(0, Math.floor(seg(t, s(13) + .3, s(13) + 4.6) * 4 + .999)) });
    juno(J(t, { look: [-.5, -.3], armR: !qn && t > s(13) + .4 ? { h: [-170, -140], bend: 30 } : undefined }));
    skater(P(t, { x: 300, look: [.6, -.5], nerv: .1, mouth: { o: 0, sm: .5 } }));
    if (qn) [['1', 260, '#f3d9a4'], ['2', 540, '#ffb862'], ['3', 820, '#9cf2ff']].forEach(([n, x, c], i) => { const k = back(seg(tq, s(14) + i * .25, s(14) + i * .25 + .25), 2); if (k <= 0) return; push(); translate(x, 1000); rotate((i - 1) * .06); scale(k); shape(rr(-110, -130, 220, 260, 18), { fill: c, lw: 8 }); text(n, 0, -10, { font: '400 150px Bungee', fill: INK }); text('?', 70, -90, { font: '400 50px Bungee', fill: '#e8483b' }); pop(); });
  },
  end(t, tq) {   // end card: dark purple, dim portal, title lockup, closing line + the series line
    reset(); screenRect('#241339'); reset(); portal(540, 1080, 420, t * .6, { open: spring(t - CUTS[4], 7, .45), sx: 1 }); screenRect('#241339', .5);
    const k = t - CUTS[4]; if (k > .8) skater(P(t, { x: 540 + Math.sin(k * 1.3) * 90, y: 1160 + Math.cos(k * 1.1) * 10, s: .55, nerv: 0, mouth: { o: 0, sm: 1 }, lid: .2, look: [0, -.3], lean: Math.sin(k * 2) * .2, armL: { h: [-70, -60], bend: 10 }, armR: { h: [70, -60], bend: -10 } }));
    const sc = back(seg(q(t), CUTS[4], CUTS[4] + .3), 2.2); reset(); translate(540, 420); scale(sc * .6); titleArt(t);
    const b = ss(seg(t, CUTS[4] + .3, CUTS[4] + .8)); reset(); g.globalAlpha = b;
    text('Follow for more of', 540, 660, { font: '800 70px "Baloo 2"', fill: '#fff', outlineW: 12 }); text('how it really works.', 540, 750, { font: '800 70px "Baloo 2"', fill: '#ffe066', outlineW: 12 });
    text("A new 'wait, really?' every day.", 540, 840, { font: '800 44px "Baloo 2"', fill: '#fff', outlineW: 10 });
    text('@howitreallyworkstudio', 540, 1360, { font: '400 52px VT323', fill: '#b8ff5a', outlineW: 8 }); g.globalAlpha = 1;
  },
};

// ———————————————————— screen layer ————————————————————
function titleArt(t, L1 = 'WHY IS ICE', L2 = 'SLIPPERY?') {   // atomic-age TV lockup: cream block letters, hard magenta offset, cyan orbit ring, orbiting skate, twinkle stars
  const orb = t * 1.6, rx = 540, ry = 70;
  const ring = (a0, a1) => { const P_ = arc(0, 130, rx, ry, a0, a1, 40); stroke(P_, 21, { boil: .5 }); stroke(P_, 9, { line: '#5ee6ff', boil: .5 }); };
  const ice = () => { push(); translate(Math.cos(orb) * rx, 130 + Math.sin(orb) * ry); rotate(orb * .5); shape(rr(-26, -26, 52, 52, 8), { fill: '#d6f2ff', lw: 6 }); stroke([[-12, -10], [4, -16]], 4, { line: '#fff' }); pop(); };
  rotate(-.05); push(); rotate(.12); ring(Math.PI, TAU); if (Math.sin(orb) < 0) ice(); pop();
  text(L1, 10, -98, { font: '400 96px Bungee', fill: '#ff4fa3', outlineW: 20, outlineCol: INK }); text(L1, 0, -108, { font: '400 96px Bungee', fill: '#fff3d6', outlineW: 20, outlineCol: INK });
  text(L2, 12, 52, { font: '400 120px Bungee', fill: '#ff4fa3', outlineW: 22, outlineCol: INK }); text(L2, 0, 40, { font: '400 120px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  push(); rotate(.12); ring(0, Math.PI); if (Math.sin(orb) >= 0) ice(); pop();
  for (let i = 0; i < 4; i++) { const x = [-520, 520, -380, 430][i], y = [-170, -150, 150, 160][i], r = 16 + 10 * Math.sin(t * 5 + i * 1.7); star(x, y, r, '#ffe066', 5); }
}
function titleCard(t) {   // popped in on 12 fps steps from frame 0, out before the first jump
  const b = s(1) + .8; if (t >= b) return; const u = seg(q(t) + .25, 0, .25), sc = u < 1 ? back(u, 2.4) : 1, out = 1 - seg(t, b - .2, b);
  reset(); translate(540, 420); scale(sc * out * .82, sc * .82); titleArt(t);
}
function wipe(t) { for (const [tc, hw] of WIPES) { const d = Math.abs(t - tc); if (d > hw) continue; const u = 1 - d / hw, R = 1500 * Math.pow(u, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); if (d < .03) screenRect('#dcffa8', .7); } }
function tag(t) {
  for (const [a, b, id, desc, bg, fg] of TAGS) { if (t < a || t >= b) continue; const n = Math.floor((t - a) * 40), s1 = id.slice(0, n), s2 = desc.slice(0, Math.max(0, n - id.length)); reset(); const pp = back(seg(t, a, a + .18), 2.2);
    push(); translate(50, 262); scale(pp); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '400 54px VT323'; const w1 = Math.max(g.measureText('▶ ' + id).width, g.measureText(desc).width * 40 / 54) + 60;
    shape(rr(0, 0, Math.max(420, w1), 118, 12), { fill: bg, lw: 7 }); text('▶ ' + s1 + (n < id.length && Math.floor(t * 6) % 2 ? '█' : ''), 24, 38, { font: '400 54px VT323', fill: fg, align: 'left' }); text(s2, 26, 86, { font: '400 40px VT323', fill: fg, align: 'left' }); pop(); }
}
function wrapSub(str) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 54px "Baloo 2"'; const words = str.split(' '), L = ['']; words.forEach(w => { const tr = (L[L.length - 1] + ' ' + w).trim(); if (g.measureText(tr).width > 780 && L[L.length - 1]) L.push(w); else L[L.length - 1] = tr; }); return L; }
function subs(t) {   // Baloo ExtraBold, white with thick ink outline, speaker pill in Juno's suit colour (y 1150-1420 safe band)
  const i = PH.findIndex((p, k) => t >= p.start - .05 && t < (PH[k + 1] ? PH[k + 1].start - .05 : p.end + 1)); if (i < 0 || SHOT(t) === 'end') return; const p = PH[i]; if (t > p.end + .6) return;
  const cut = CUTS.find(c => c > p.start + .1); if (cut && t > cut - .02 && t < cut + .02) return;
  const str = p.cap.replace(/\*\*/g, ''), lines = wrapSub(str), pp = back(seg(t, p.start - .05, p.start + .07), 2);
  const y0 = 1330 - (lines.length - 1) * 66; g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 54px "Baloo 2"'; const mw = Math.max(...lines.map(l => g.measureText(l).width)) + 64;
  reset(); shape(rr(540 - mw / 2, y0 - 46, mw, lines.length * 66 + 26, 18), { fill: 'rgba(27,20,34,.86)', lw: 6, alpha: clamp(pp) }); push(); translate(540, y0 - 68); scale(pp); shape(rr(-70, -24, 140, 48, 14), { fill: PAL.suit, lw: 5 }); text('JUNO', 0, 2, { font: '800 30px "Baloo 2"', fill: INK }); pop();
  lines.forEach((l, k) => text(l, 540, y0 + k * 66, { font: '800 54px "Baloo 2"', fill: '#fff', outlineW: 12 }));
}

function render(t) {
  frame(t); screenRect('#000'); const tq = q(t); SH[SHOT(t)](t, tq); wipe(t); titleCard(t); tag(t); subs(t);
  // loop: the last 0.35 s swirl back to the rink (frame 0's world)
  const L = TL.total - t; if (L < .35) { const u = 1 - L / .35, R = 1500 * Math.pow(u, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); }
}
window.DUR = TL.total;
window.seek = t => render(t);
window.render = window.seek;
// thumbnail / cover (rule 11): the rink, Spud mid-glide, the lockup carrying the question, the myth stamp
window.thumb = () => { const t = 1.2; frame(t); screenRect('#000'); cam(540, 1000, 1); rink(t, { trail: 700 });
  skater(P(t, { x: 640, y: 1360, s: 1.2, lean: .14, look: [.8, -.1], mouth: { o: .5, sm: .6 }, eyeS: 1.2, armL: { h: [-90, -20], bend: 20 }, armR: { h: [90, -30], bend: -20 } }));
  reset(); translate(540, 620); scale(.95); titleArt(t, "IT'S NOT", 'PRESSURE');
  reset(); push(); translate(540, 1530); shape(rr(-300, -54, 600, 108, 16), { fill: '#0f2b3b', lw: 7 }); text('why ice is slippery', 0, 6, { font: '400 64px VT323', fill: '#9cf2ff' }); pop(); };
window.seek(0); window.ready = true; window.READY = true;
