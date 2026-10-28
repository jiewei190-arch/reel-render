// t_hotsauce.js: "Why does spicy food feel hot?" in template #9 scifi-toon (lemo-opuscar/styles/scifi-toon) grammar, built on H1's brainfreeze rig.
// 1080x1920. Characters, boil and mouths step at 12 fps; camera, portal swirl and wipes run on ones.
// One palette per world, the portal is the only thing that glows, VT323 world tag typed in, Baloo subtitles with speaker pill,
// Bungee title lockup with orbit ring, hard cuts or swirl wipes only. Batch N layout: captions y 1180-1400, no text in the
// top 250 px, the bottom 480 px or the right column (x > 900 from y 840); the end swirls back into frame 0.
import { clamp, lerp, seg, ss, eo, back, spring, hash, vnoise, TAU } from './styles/scifitoon/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, noodle, reset, bands } from './styles/scifitoon/toon.js';
import { juno, spud, mitt, eye, mouth, sweat, PAL, mix } from './styles/scifitoon/cast_af.js';
await Promise.all(['800 50px "Baloo 2"', '400 50px VT323', '400 50px Bungee'].map(f => document.fonts.load(f)));
init(document.getElementById('c'));
// own colourway (brainfreeze and slipperyice are also scifi-toon): chili-orange suit + navy boots, so the episodes don't look identical
Object.assign(PAL, { suit: '#ff8a3d', suitS: '#d9622a', boot: '#2a3a6e', bootS: '#1c284f' });
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, LIP = window.LIP || [];
const HCUT = s(1) - .1;   // hard cut from the hook close-up to the lab two-shot
const q = t => Math.floor(t * 12 + 1e-6) / 12;

// —— lip sync from the voice track (24 Hz envelope, sampled on twos) ——
function talk(t) { const tq = q(t); const on = PH.some(p => tq >= p.start - .02 && tq < p.end + .02); if (!on) return { o: 0, w: 1, talking: false }; const o = LIP[Math.floor(tq * 24)] || 0; return { o: clamp(o * 1.05), w: .85 + .3 * hash(Math.floor(tq * 12)) - .2 * o, talking: true }; }
const blink = (t, ph = 0) => { const k = Math.floor(t * 12 + ph * 7) + 9; return k % 37 === 0 || k % 37 === 1; };
function cam(cx, cy, z, shake = 0, t = 0) { reset(); translate(W / 2, H / 2); if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); } scale(z); translate(-cx, -cy); }

// —— portal (the travel device; the only thing that glows) — after lemo-opuscar worlds.js portal (MIT), as in t_airfryer ——
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
const star4 = (x, y, r, fill = '#ffe066', lw = 4) => shape([[x, y - r], [x + r * .28, y - r * .28], [x + r, y], [x + r * .28, y + r * .28], [x, y + r], [x - r * .28, y + r * .28], [x - r, y], [x - r * .28, y - r * .28]], { fill, lw });
const pop_ = (tq, t0, k = 2) => back(seg(tq, t0, t0 + .25), k);
function label(str, x, y, size, fill, k = 1, rot = 0) { if (k <= 0) return; push(); translate(x, y); rotate(rot); scale(k); text(str, 0, 0, { font: `800 ${size}px "Baloo 2"`, fill, outlineW: Math.round(size / 5) }); pop(); }

// ———————————————————— props ————————————————————
function chili(x, y, s, ang = 0, col = '#e8392b') {   // a curved red chili with a green cap
  push(); translate(x, y); rotate(ang); scale(s);
  shape(spline([[-20, -90], [24, -92], [40, -40], [36, 40], [14, 120], [-6, 150], [-10, 120], [-6, 40], [-22, -30]]), { fill: col, lw: 6, shade: () => { fillOnly(spline([[14, -70], [30, -40], [26, 40], [10, 110], [4, 100], [14, 30], [16, -40]]), mix(col, '#7a0f0f', .35), { boil: .3 }); stroke([[-6, -60], [-2, 20]], 5, { line: '#ff9a8a' }); } });
  shape(spline([[-30, -96], [30, -98], [22, -78], [-24, -76]]), { fill: '#3fae4a', lw: 6 }); shape(rr(-6, -132, 12, 40, 6), { fill: '#3fae4a', lw: 5 });
  pop();
}
function flames(x, y, s, t, k = 1, ang = -Math.PI / 2) {   // cartoon fire burst (on twos), pointing along ang
  if (k <= 0) return; const tq = q(t); push(); translate(x, y); rotate(ang + Math.PI / 2); scale(s * k);
  [['#ff4a2a', 1], ['#ffb03a', .7], ['#fff1a0', .4]].forEach(([c, f], j) => { const P_ = []; for (let i = 0; i <= 12; i++) { const u = i / 12, a = Math.PI + u * Math.PI, wob = 1 + .25 * Math.sin(tq * 14 + i * 2.1 + j); const r = 120 * f * (i % 2 ? .55 : 1) * wob; P_.push([Math.cos(a) * 70 * f * (i % 2 ? .7 : 1), Math.sin(a) * r - 10]); } P_.push([60 * f, 20], [0, 50 * f], [-60 * f, 20]); shape(spline(P_), { fill: c, lw: j ? 5 : 7 }); });
  pop();
}
function capKey(x, y, s, ang = 0, glow = 0) {   // capsaicin as a little red key with a tiny chili bow (the molecule that picks the lock)
  push(); translate(x, y); rotate(ang); scale(s);
  if (glow > 0) fillOnly(ell(0, 0, 90, 60, 20), `rgba(255,90,60,${.35 * glow})`, { boil: .5 });
  shape(ell(-46, 0, 30, 30, 20), { fill: '#e8392b', lw: 6, shade: () => fillOnly(ell(-46, 0, 12, 12, 12), '#7a0f0f', { boil: .3 }) });
  shape(rr(-20, -10, 86, 20, 6), { fill: '#e8392b', lw: 6 }); shape(rect(40, 8, 12, 18), { fill: '#e8392b', lw: 5 }); shape(rect(58, 8, 10, 12), { fill: '#e8392b', lw: 5 });
  pop();
}
function sensor(x, y, s, t, { open = 0, lit = 0, label = '' } = {}) {   // TRPV1 as a sci-fi gate on a nerve ending: two jaws + a keyhole; opens to let the zap in
  push(); translate(x, y); scale(s);
  shape(rr(-150, 40, 300, 120, 30), { fill: '#ffd36e', lw: 7, shade: () => fillOnly(rect(-150, 120, 300, 60), '#e8b04a', { boil: .3 }) });   // nerve-ending bulb
  const gap = 40 * open; [-1, 1].forEach(sd => { push(); translate(sd * (60 + gap), 0); shape(rr(-52, -110, 104, 160, 22), { fill: lit ? mix('#7c5ce0', '#ff4a2a', lit) : '#7c5ce0', lw: 7, shade: () => fillOnly(rect(sd > 0 ? 20 : -52, -110, 32, 160), '#5a3fb8', { boil: .3 }) }); pop(); });
  if (open < .3) { shape(ell(0, -40, 16, 16, 12), { fill: INK, lw: 4 }); shape(rect(-7, -36, 14, 34), { fill: INK, lw: 4 }); }
  if (lit > 0) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .4, d = 170 + 20 * Math.sin(t * 9 + i); stroke([[Math.cos(a) * 140, Math.sin(a) * 120 - 20], [Math.cos(a) * d, Math.sin(a) * d * .85 - 20]], 8, { line: '#ff4a2a', alpha: lit }); }
  if (label) text(label, 0, 210, { font: '400 54px Bungee', fill: '#fff3d6', outlineW: 12 });
  pop();
}
function thermo(x, y, v, s = 1) { push(); translate(x, y); scale(s); shape(rr(-40, -220, 80, 420, 40), { fill: '#f7f3ea', lw: 7, shade: () => fillOnly(rect(-50, lerp(180, -180, v), 100, 600), v > .5 ? '#ff4a2a' : '#5ab8ff', { boil: .3 }) }); shape(ell(0, 220, 58, 58, 28), { fill: v > .5 ? '#ff4a2a' : '#5ab8ff', lw: 7 }); pop(); }
function brain(x, y, s, t, col = '#ff9cb4') {
  push(); translate(x, y); scale(s);
  const P_ = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = 1 + .07 * Math.sin(a * 9); P_.push([Math.cos(a) * 150 * r, Math.sin(a) * 110 * r]); }
  shape(spline(P_), { fill: col, lw: 7, shade: () => { fillOnly(ell(60, 40, 90, 60, 20), mix(col, '#c24a74', .35), { boil: .3 }); stroke([[0, -105], [8, -60], [-6, -20], [6, 30], [0, 100]], 6); for (let i = 0; i < 5; i++) { const xx = -120 + i * 60; stroke([[xx, -60 + (i % 2) * 20], [xx + 30, -30], [xx + 10, 10], [xx + 34, 50]], 5); } } });
  pop();
}
function siren(x, y, s, t, on = 1) { push(); translate(x, y); scale(s); shape(rr(-60, 0, 120, 30, 8), { fill: '#3a3d4a', lw: 6 }); shape(spline([[-46, 4], [-40, -70], [0, -96], [40, -70], [46, 4]]), { fill: on && Math.floor(t * 8) % 2 ? '#ff2a2a' : '#b8162e', lw: 6 });
  if (on) for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * .6; stroke([[Math.cos(a) * 110, Math.sin(a) * 110 - 40], [Math.cos(a) * 150, Math.sin(a) * 150 - 40]], 8, { line: '#ff4a2a' }); } pop(); }
function glass(x, y, s, fill, lab = '') { push(); translate(x, y); scale(s); shape(spline([[-60, -170], [60, -170], [48, 0], [-48, 0]]), { fill: 'rgba(220,240,255,.55)', lw: 7, shade: () => fillOnly(rect(-70, -120, 140, 130), fill, { boil: .3 }) }); if (lab) text(lab, 0, 50, { font: '800 40px "Baloo 2"', fill: '#fff', outlineW: 9 }); pop(); }
function casein(x, y, s, t, grab = 0) {   // casein: a round little grabber with arms (like soap on grease)
  push(); translate(x, y); scale(s); const tq = q(t);
  shape(ell(0, 0, 46, 42, 20), { fill: '#fffaf0', lw: 6, shade: () => fillOnly(ell(14, 14, 26, 20, 12), '#e8e0cf', { boil: .3 }) });
  [-1, 1].forEach(sd => stroke([[sd * 40, 0], [sd * (70 - 20 * grab), -20 + 10 * Math.sin(tq * 8)], [sd * (60 - 40 * grab), -50 + 20 * grab]], 7));
  eye(-14, -6, 9, 10, { skin: '#fffaf0', look: [0, 0], pupil: 3, lw: 4 }); eye(14, -6, 9, 10, { skin: '#fffaf0', look: [0, 0], pupil: 3, lw: 4 }); mouth(0, 16, 22, { o: 0, sm: .8, lw: 4 });
  pop();
}
const X0 = -900, X1 = 2000;

// ———————————————————— worlds (one palette each) ————————————————————
// ———————————————————— worlds (one palette each) ————————————————————
function lab(t, o = {}) {           // home: sage ice-cream lab (wall, freezer, blackboard, clock, shelf of tubs)
  fillOnly(rect(X0, -800, X1 - X0, 2400), '#f3c9a5', { boil: 0 });
  for (let x = -800; x < 2000; x += 240) stroke([[x, -800], [x, 1150]], 4, { line: '#dba27c' });
  fillOnly(rect(X0, -800, X1 - X0, 300), '#e6b48c', { boil: 0 });
  shape(rr(300, 160, 520, 44, 10), { fill: '#eef6f0', lw: 6 }); stroke([[360, 140], [360, 160]], 5); stroke([[760, 140], [760, 160]], 5);
  shape(rr(560, 300, 470, 300, 10), { fill: '#2f4a3f', lw: 8, shade: () => {
    const L = o.bare ? [] : o.board || ['SPICY = HOT ?', 'chili → mouth → ???', '']; L.forEach((l, i) => text(l, 795, 360 + i * 64, { font: `400 ${i ? 38 : 48}px VT323`, fill: i === 2 ? '#ffd36e' : '#e8f0e0' }));
  } });
  shape(rr(580, 592, 430, 16, 4), { fill: '#b08a5a', lw: 5 });
  push(); translate(170, 360); shape(ell(0, 0, 70, 70, 40), { fill: '#f7f3e8', lw: 8 }); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; stroke([[Math.cos(a) * 54, Math.sin(a) * 54], [Math.cos(a) * 62, Math.sin(a) * 62]], 4); } const sA = Math.floor(t) / 60 * TAU - Math.PI / 2; stroke([[0, 0], [0, -40]], 8); stroke([[0, 0], [36, 18]], 6); stroke([[0, 0], [Math.cos(sA) * 54, Math.sin(sA) * 54]], 2.5, { line: '#e8392b' }); dot(0, 0, 7); pop();
  shape(rr(-60, 560, 400, 22, 4), { fill: '#b08a5a', lw: 6 });
  [['#e8392b', 'HOT'], ['#ff8a3d', 'MED'], ['#3fae4a', 'MILD']].forEach(([c, l], i) => { shape(rr(10 + i * 110, 470, 90, 90, 12), { fill: '#f4f1ea', lw: 6, shade: () => fillOnly(rect(0, 470, 400, 26), c, { boil: .3 }) }); if (!o.bare) text(l, 55 + i * 110, 530, { font: '800 18px "Baloo 2"', fill: INK }); });
  // freezer chest (left) with frost
  shape(rr(-80, 760, 460, 380, 20), { fill: '#e6f2f7', lw: 8, shade: () => { fillOnly(rect(300, 760, 100, 400), '#c9dde6', { boil: .3 }); for (let i = 0; i < 5; i++) fillOnly(ell(-40 + i * 90, 780, 40, 14, 12), '#ffffff', { boil: .4 }); } });
  shape(rr(-90, 730, 480, 50, 12), { fill: '#bcd6e2', lw: 7 }); shape(rr(120, 860, 120, 24, 10), { fill: '#7c9aa8', lw: 5 });
  for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; stroke([[60 + i * 110, 730 - u * 60], [70 + i * 110, 700 - u * 60]], 5, { line: '#ffffff', alpha: 1 - u }); }
  // floor
  shape(rect(X0, 1140, X1 - X0, 1200), { fill: '#7a6a8c', lw: 6 }); for (let k = 0; k < 6; k++) stroke([[X0, 1190 + k * 80 + k * k * 12], [X1, 1190 + k * 80 + k * k * 12]], 4, { line: '#665878' }); shape(rect(X0, 1116, X1 - X0, 30), { fill: '#5c4e70', lw: 6 });
}
function tongueWorld(t, heat = 0) {   // coral + gold: inside the mouth; the tongue is the floor, a nerve ending pokes up
  bands(['#ffd0b8', '#ffc0a6', '#ffb094', '#ffa082'], -600, 1200);
  for (let i = 0; i < 9; i++) shape(rr(40 + i * 112, 236, 84, 74, 24), { fill: '#fffbe8', lw: 6 });
  shape(spline([[-200, 1000], [200, 900], [540, 870], [880, 900], [1280, 1000], [1280, 1500], [-200, 1500]]), { fill: mix('#e8506f', '#ff2a1a', heat * .4), lw: 9, shade: () => { for (let i = 0; i < 18; i++) dot(60 + hash(i * 3.1) * 960, 940 + hash(i * 1.7) * 160, 6, '#ff8aa4'); } });
  shape(rect(X0, 1150, X1 - X0, 900), { fill: '#7a2440', lw: 7 });
}
function wireWorld(t) {               // ultraviolet + red: the nerve as a wire from the mouth up to the brain
  bands(['#2a1550', '#341a62', '#3f2075', '#4a2788'], -600, 1200);
  for (let i = 0; i < 14; i++) { const x = hash(i * 3.3) * 1080, y = 270 + hash(i * 5.1) * 880; star4(x, y, 6 + 5 * Math.sin(t * 4 + i), '#ffb03a', 3); }
  shape(rect(X0, 1150, X1 - X0, 900), { fill: '#1c0d38', lw: 7 });
}
function prizeWorld(t) {              // navy + gold: the prize hall
  bands(['#14204a', '#18285a', '#1d306a', '#22387a'], -600, 1140);
  for (let i = 0; i < 7; i++) shape(rr(-60 + i * 180, 300, 60, 840, 8), { fill: '#2a3f86', lw: 6 });
  shape(rect(X0, 1140, X1 - X0, 900), { fill: '#0f1838', lw: 7 }); for (let k = 0; k < 5; k++) stroke([[X0, 1190 + k * 90], [X1, 1190 + k * 90]], 4, { line: '#0a1028' });
}
function kitchenWorld(t) {            // mint + cream: the cooling kitchen
  bands(['#c8f5dc', '#b6efd2', '#a3e8c8', '#90e0be'], -600, 1140);
  for (let x = -40; x < 1120; x += 120) for (let y = 300; y < 1140; y += 120) shape(rr(x + 6, y + 6, 108, 108, 10), { fill: (Math.floor(x / 120) + Math.floor(y / 120)) % 2 ? '#bff0d6' : '#aee8ca', lw: 3 });
  shape(rect(X0, 1140, X1 - X0, 900), { fill: '#e8604f', lw: 7 }); for (let x = -40; x < 1120; x += 160) stroke([[x, 1140], [x - 60, 1920]], 4, { line: '#c94a3c' });
}

// ———————————————————— poses ————————————————————
function J(t, o = {}) { const m = talk(t), tq = q(t); return { x: 810, y: 1130, s: .82, face: -1, lid: .5, look: [0, 0], mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), blink: blink(t), ...o }; }
function P(t, o = {}) { const tq = q(t); return { x: 380, y: 1130, s: .62, face: 1, t, nerv: .4, look: [.5, -.2], blink: blink(t, 3), mouth: { o: 0, sm: -.6 }, sq: 1 + .012 * Math.sin(tq * 3.1), ...o }; }
const head = (p) => [p.x + 2 * p.s * (p.face ?? 1), p.y - 150 * p.s];   // Spud's head centre
function burningSpud(t, o = {}) {   // Spud mid chili-burn: chili in hand, fire from the mouth, sweat, steam
  const p = P(t, { nerv: 1.3, lid: .2, eyeS: 1.3, mouth: { o: .95, w: 1.3, sm: -1 }, brow: -1.2, armL: { h: [-60, -120], bend: 30 }, armR: { h: [90, -60], bend: -20 }, sweat: t, ...o });
  spud(p); const [hx, hy] = head(p), sc = p.s; chili(p.x + 170 * sc, p.y - 210 * sc, sc * .9, .5);
  flames(hx + 10 * sc, hy + 40 * sc, sc * 1.15, t, o.fx ?? 1, -Math.PI / 2 + .25);
  for (const sx of [-1, 1]) { const u = (t * .9 + (sx > 0 ? .5 : 0)) % 1; push(); translate(hx + sx * 110 * sc, hy - 40 * sc - u * 80 * sc); shape(ell(0, 0, 22 * sc * (1 + u), 16 * sc * (1 + u), 14), { fill: `rgba(255,255,255,${.8 * (1 - u)})`, lw: 5 }); pop(); }
  return p;
}
const WIPES = [[s(2) - .3, .3], [s(5) - .3, .3], [s(8) - .3, .3], [s(9) - .3, .3], [s(12) - .3, .3], [s(14) - .25, .25]];
const CUTS = WIPES.map(w => w[0]);
const SHOT = t => { if (t < HCUT) return 'hook'; const k = CUTS.filter(c => t >= c).length; return ['lab', 'mouth', 'alarm', 'prize', 'fix', 'lab3', 'end'][k]; };
const TAGS = [[s(2) - .1, s(5) - .4, 'U-1  THE TONGUE', 'nerve endings + sensors', '#5a1030', '#ffd36e'], [s(5) - .1, s(8) - .4, 'U-2  THE NERVE', 'sensor → brain', '#1c0d38', '#ffb03a'], [s(8) - .1, s(9) - .4, 'U-3  THE PRIZE', 'Nobel, 2021', '#0f1838', '#ffd36e'], [s(9) - .1, s(12) - .4, 'U-4  THE KITCHEN', 'water vs milk', '#2e6a52', '#fff3d6']];

const SH = {
  hook(t, tq) {   // frame 0: Spud mid chili-burn, fire from his mouth; camera shake; lockup on top
    cam(400, 900, 1.9, 6, t); lab(t, { bare: true });
    burningSpud(t, { x: 400, y: 1080 });
  },
  lab(t, tq) {   // two-shot: Juno points a thermometer at the chili: it's room temperature; NOT HOT; portal opens
    cam(540, 960, 1); lab(t, { bare: true }); const po = popOpen(t - (s(2) - 1.0)); portal(560, 860, 230, t, { open: po });
    const cool = ss(seg(t, s(1) + .6, s(1) + 2.6)); juno(J(t, { armR: { h: [150, -40], bend: -20 }, look: [-.6, 0] }));
    if (cool < 1) burningSpud(t, { x: 300, fx: 1 - cool }); else { const p = P(t, { x: 300, look: [.6, -.3], nerv: .5 + po, mouth: { o: .3, sm: -.6 }, eyeS: 1 + po * .25, armR: { h: [90, -60], bend: -20 } }); spud(p); chili(p.x + 170 * p.s, p.y - 260 * p.s, p.s * .9, .5); }
    thermo(560, 860, .25, .5); label('CHILI: 21°C', 560, 700, 52, '#5ab8ff', pop_(tq, s(1) + .4));
    if (t > s(1) + 1.6) label('NOT HOT', 540, 330 + 30, 80, '#ffd36e', pop_(tq, s(1) + 1.6), -.05);
  },
  mouth(t, tq) {   // jump 1: on the tongue: capsaicin keys tumble in; a nerve ending with its TRPV1 gate; real heat (a flame) opens it
    const z = lerp(1.0, 1.06, ss(seg(t, s(2), s(5)))); cam(540, 960, z); const heat = ss(seg(t, s(4) + .4, s(4) + 1.4)) * (1 - ss(seg(t, s(5) - .6, s(5) - .3)));
    tongueWorld(t, heat);
    const kk = seg(t, s(2) + .2, s(2) + 2.4); for (let i = 0; i < 6; i++) { const u = clamp(kk * 1.4 - i * .08); if (u <= 0) continue; capKey(140 + i * 150, lerp(300, 860 + (i % 2) * 40, eo(u)) + Math.sin(t * 2 + i) * 8, .9, Math.sin(t * 1.5 + i) * .4 + (1 - u) * 3); }
    if (t > s(2) + 1.0 && t < s(3)) label('CAPSAICIN', 540, 560, 76, '#ff4a2a', pop_(tq, s(2) + 1.0), -.04);
    const sk = back(seg(tq, s(3) + .2, s(3) + .6), 1.6); if (sk > 0) { push(); translate(540, 980); scale(sk); translate(-540, -980); sensor(540, 760, 1.15, t, { open: heat, lit: heat, label: t > s(3) + .8 ? 'TRPV1' : '' }); pop(); }
    if (t > s(4)) { thermo(860, 700, lerp(.3, .9, heat), .5); flames(250, 820, .7, t, heat, 0); if (heat > .3) label('> 43°C', 860, 470, 66, '#ff4a2a', pop_(tq, s(4) + .8)); if (heat > .5) label('OUCH!', 250, 560, 66, '#ffd36e', pop_(tq, s(4) + 1.2), -.1); }
  },
  alarm(t, tq) {   // jump 2: the trick: a capsaicin key turns in the gate with NO flame; the zap runs the wire to the brain; sirens: FIRE!; then FALSE ALARM
    cam(540, 960, 1); wireWorld(t);
    const turn = ss(seg(t, s(5) + 1.0, s(5) + 1.8)), wire = [[540, 1000], [540, 900], [420, 760], [560, 600], [430, 470]];
    stroke(wire, 30, { line: INK }); stroke(wire, 16, { line: '#ffd36e' });
    brain(430, 400, .62, t, turn > .5 ? '#ff9c8a' : '#ff9cb4'); siren(640, 360, .8, t, t > s(6) + .6 ? 1 : 0);
    sensor(540, 980, .9, t, { open: turn, lit: turn }); capKey(lerp(160, 470, ss(seg(t, s(5) + .2, s(5) + 1.0))), 930, 1.1, lerp(0, 0, 1) + turn * Math.PI / 2, turn);
    thermo(880, 780, .3, .45); label('NO HEAT', 880, 590, 44, '#5ab8ff', pop_(tq, s(5) + 1.6));
    if (turn > .9) { const u = ((t - s(5) - 1.8) * .9) % 1, n = wire.length - 1, x_ = clamp(1 - u) * n, a = Math.floor(Math.min(x_, n - 1e-6)), f = x_ - a; star4(lerp(wire[a][0], wire[a + 1][0], f), lerp(wire[a][1], wire[a + 1][1], f), 30 + 6 * Math.sin(tq * 30), '#ffffff', 5); }
    if (t > s(6) + .6 && t < s(7)) { label('FIRE!', 760, 520, 110, '#ff4a2a', pop_(tq, s(6) + .6, 2.4), -.08); flames(430, 330, .45, t, 1); }
    if (t > s(7)) { const k = pop_(tq, s(7) + .2, 2.2); push(); translate(560, 640); rotate(-.06); scale(k); shape(rr(-300, -60, 600, 120, 14), { fill: '#fff3d6', lw: 7 }); text('FALSE ALARM', 0, 4, { font: '400 66px Bungee', fill: '#e8483b' }); pop(); }
  },
  prize(t, tq) {   // jump 3: the prize hall: a gold medal, a plaque, the chili that found the sensor
    const z = lerp(1, 1.08, ss(seg(t, s(8), s(9)))); cam(540, 900, z); prizeWorld(t);
    const k = back(seg(tq, s(8) + .1, s(8) + .5), 1.8); push(); translate(540, 600); scale(k); rotate(.05 * Math.sin(t * 1.4));
    stroke([[-80, -300], [0, -120], [80, -300]], 26, { line: '#2a6ad9' }); shape(ell(0, 0, 150, 150, 40), { fill: '#f2c14e', lw: 8, shade: () => { fillOnly(ell(30, 30, 110, 110, 30), '#d9a030', { boil: .3 }); shape(ell(0, 0, 105, 105, 30), { fill: '#f7d36e', lw: 5 }); } });
    text('NOBEL', 0, -20, { font: '400 50px Bungee', fill: '#8a5a10' }); text('2021', 0, 40, { font: '400 50px Bungee', fill: '#8a5a10' }); pop();
    chili(840, 760, .8, .4 + .1 * Math.sin(t * 2));
    const pk = pop_(tq, s(8) + 1.4, 1.6); push(); translate(540, 900); scale(pk); shape(rr(-360, -70, 720, 140, 14), { fill: '#17232a', lw: 7 }); text('DAVID JULIUS · TRPV1', 0, -18, { font: '400 54px VT323', fill: '#ffd36e' }); text('shared with Ardem Patapoutian (touch)', 0, 30, { font: '400 36px VT323', fill: '#e8f0e0' }); pop();
    for (let i = 0; i < 6; i++) star4(160 + i * 150, 330 + (i % 2) * 50, 14 + 6 * Math.sin(t * 5 + i), '#ffd36e', 4);
  },
  fix(t, tq) {   // jump 4: the kitchen: water bounces off oily capsaicin; casein grabbers in milk wrap it up and carry it away
    cam(540, 960, 1); kitchenWorld(t);
    const p9 = t < s(10) - .1, p10 = t >= s(10) - .1 && t < s(11) - .1;
    if (p9) { const sp = burningSpud(t, { x: 300, y: 1120, s: .55, fx: .9 }); const reach = ss(seg(t, s(9) + .2, s(9) + .8)); glass(lerp(820, 640, reach), 1100, .9, 'rgba(120,190,255,.7)', 'WATER');
      if (t > s(9) + 1.0) { const k = pop_(tq, s(9) + 1.0, 2); push(); translate(640, 900); scale(k); stroke([[-90, -90], [90, 90]], 26, { line: '#e8392b' }); stroke([[90, -90], [-90, 90]], 26, { line: '#e8392b' }); pop(); } }
    else if (p10) { // oil vs water: capsaicin in an oily film on the tongue; water drops slide off
      shape(spline([[60, 900], [540, 830], [1020, 900], [1020, 1100], [60, 1100]]), { fill: '#e8506f', lw: 8 });
      for (let i = 0; i < 5; i++) { fillOnly(ell(160 + i * 170, 880, 70, 22, 16), 'rgba(255,200,60,.55)', { boil: .4 }); capKey(160 + i * 170, 870, .6, Math.sin(t + i) * .3); }
      for (let i = 0; i < 6; i++) { const u = (t * .8 + i / 6) % 1, x = 120 + i * 150, y = lerp(380, 860, Math.min(1, u * 1.6)) - (u > .62 ? Math.sin((u - .62) / .38 * Math.PI) * 140 : 0); shape(spline([[x, y - 26], [x + 18, y + 6], [x, y + 20], [x - 18, y + 6]]), { fill: '#7ac4ff', lw: 5 }); }
      label('OIL + WATER', 540, 560, 76, '#e8604f', pop_(tq, s(10) + .3)); label("DON'T MIX", 540, 650, 62, '#2e6a52', pop_(tq, s(10) + .9)); }
    else { // milk: casein grabbers wrap the capsaicin keys and swim off
      glass(860, 1100, 1.0, '#fffaf0', 'MILK'); const grab = ss(seg(t, s(11) + .6, s(11) + 1.6)), away = ss(seg(t, s(11) + 2.4, s(11) + 5.0));
      for (let i = 0; i < 4; i++) { const bx = 180 + i * 150, by = 880 + (i % 2) * 40, cx = lerp(760, bx + 40, grab), cy = lerp(1000, by - 30, grab), ox = away * (700 - i * 60), oy = -away * 120;
        capKey(bx + ox, by + oy, .7, Math.sin(t + i) * .2); casein(cx + ox, cy + oy, .9, t + i, grab); }
      label('CASEIN', 380, 560, 86, '#2e6a52', pop_(tq, s(11) + .4), -.04); if (t > s(11) + 3.6) label('EVEN SKIM', 420, 680, 58, '#e8604f', pop_(tq, s(11) + 4.2)); }
  },
  lab3(t, tq) {   // home: payoff (board: FALSE FIRE ALARM), Spud calm with milk; then the question with a push-in
    const pushIn = ss(seg(t, s(13) - .3, s(14) - .3)); cam(lerp(540, 420, pushIn), lerp(960, 900, pushIn), lerp(1, 1.16, pushIn));
    lab(t, { board: t < s(13) ? ['SPICY = FALSE', 'FIRE ALARM', 'capsaicin → TRPV1'] : ['MILK', 'OR WATER?', 'one word'] });
    juno(J(t, { armR: t < s(13) ? { h: [-120, -150], bend: 30 } : undefined, look: t < s(13) ? [-.3, -.9] : [-.7, .2] }));
    const p = P(t, { x: 300, look: t < s(13) ? [.8, -.6] : [-.6, .1], nerv: .2, mouth: { o: 0, sm: .6 }, armR: { h: [90, -60], bend: -20 } }); spud(p); glass(p.x + 130 * p.s, p.y - 120 * p.s, .5, '#fffaf0');
    if (t > s(13)) { const k1 = pop_(tq, s(13) + .3, 1.8), k2 = pop_(tq, s(13) + .9, 1.8); push(); translate(470, 1100); scale(k1); glass(0, 0, .8, '#fffaf0', 'MILK'); pop(); push(); translate(620, 1100); scale(k2); glass(0, 0, .8, 'rgba(120,190,255,.7)', 'WATER'); pop(); label('?', 545, 860, 110, '#ffd36e', pop_(tq, s(13) + 1.4, 2)); }
  },
  end(t, tq) {   // end card: dark plum, dim portal, title lockup, closing lines; Spud floats with a glass of milk
    reset(); screenRect('#2a1020'); reset(); portal(540, 1000, 380, t * .6, { open: spring(t - CUTS[5], 7, .45), sx: 1 }); screenRect('#2a1020', .5);
    const k = t - CUTS[5]; if (k > .5) { const p = P(t, { x: 540 + Math.sin(k * 1.3) * 60, y: 1180 + Math.cos(k * 1.1) * 12, s: .5, nerv: 0, mouth: { o: 0, sm: 1 }, lid: .2, look: [0, -.3], lean: Math.sin(k * 2) * .3, armL: { h: [-70, -60], bend: 10 }, armR: { h: [90, -60], bend: -20 } }); spud(p); glass(p.x + 90 * p.s, p.y - 120 * p.s, .45, '#fffaf0'); }
    const sc = back(seg(q(t), CUTS[5], CUTS[5] + .3), 2.2); reset(); translate(540, 450); scale(sc * .6); titleArt(t);
    const b = ss(seg(t, CUTS[5] + .3, CUTS[5] + .8)); reset(); g.globalAlpha = b;
    text('Follow for more of', 540, 680, { font: '800 70px "Baloo 2"', fill: '#fff', outlineW: 12 }); text('how it really works.', 540, 770, { font: '800 70px "Baloo 2"', fill: '#ffb03a', outlineW: 12 });
    text("A new 'wait, really?' every day.", 540, 870, { font: '800 46px "Baloo 2"', fill: '#fff', outlineW: 9 });
    text('@howitreallyworkstudio', 540, 1330, { font: '400 52px VT323', fill: '#ffd36e', outlineW: 8 }); g.globalAlpha = 1;
  },
};

// ———————————————————— screen layer ————————————————————
function titleArt(t, L1 = 'SPICY', L2 = '= HOT?') {   // atomic-age TV lockup: cream block letters, hard red offset, orange orbit ring, orbiting chili, twinkle stars
  const orb = t * 1.6, rx = 600, ry = 92;
  const ring = (a0, a1) => { const P_ = arc(0, 6, rx, ry, a0, a1, 40); stroke(P_, 21, { boil: .5 }); stroke(P_, 9, { line: '#ffb03a', boil: .5 }); };
  const cube = () => { push(); translate(Math.cos(orb) * rx, 6 + Math.sin(orb) * ry); rotate(orb + 1.2); chili(0, 0, .4, 0); pop(); };
  rotate(-.05); push(); rotate(.12); ring(Math.PI, TAU); if (Math.sin(orb) < 0) cube(); pop();
  text(L1, 10, -98, { font: '400 120px Bungee', fill: '#e8392b', outlineW: 20, outlineCol: INK }); text(L1, 0, -108, { font: '400 120px Bungee', fill: '#fff3d6', outlineW: 20, outlineCol: INK });
  text(L2, 12, 52, { font: '400 170px Bungee', fill: '#ffb03a', outlineW: 22, outlineCol: INK }); text(L2, 0, 40, { font: '400 170px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  push(); rotate(.12); ring(0, Math.PI); if (Math.sin(orb) >= 0) cube(); pop();
  for (let i = 0; i < 4; i++) { const x = [-540, 540, -400, 450][i], y = [-170, -150, 150, 160][i], r = 16 + 10 * Math.sin(t * 5 + i * 1.7); star4(x, y, r, '#ffe066', 5); }
}
function titleCard(t) {   // on from frame 0 (popped on 12 fps steps after a beat), out before the cut to the lab
  const b = HCUT; if (t >= b) return; const sc = 1 + .04 * Math.sin(q(t) * 6), out = 1 - seg(t, b - .2, b);
  reset(); translate(540, 470); scale(sc * out * .72, sc * .72); titleArt(t);
}
function wipe(t) { for (const [tc, hw] of WIPES) { const d = Math.abs(t - tc); if (d > hw) continue; const u = 1 - d / hw, R = 1500 * Math.pow(u, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); if (d < .03) screenRect('#dcffa8', .7); } }
function tag(t) {
  for (const [a, b, id, desc, bg, fg] of TAGS) { if (t < a || t >= b) continue; const n = Math.floor((t - a) * 40), s1 = id.slice(0, n), s2 = desc.slice(0, Math.max(0, n - id.length)); reset(); const pp = back(seg(t, a, a + .18), 2.2);
    push(); translate(50, 270); scale(pp); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '400 54px VT323'; const w1 = Math.max(g.measureText('▶ ' + id).width, g.measureText(desc).width * 40 / 54) + 60;
    shape(rr(0, 0, Math.max(420, w1), 118, 12), { fill: bg, lw: 7 }); text('▶ ' + s1 + (n < id.length && Math.floor(t * 6) % 2 ? '█' : ''), 24, 38, { font: '400 54px VT323', fill: fg, align: 'left' }); text(s2, 26, 86, { font: '400 40px VT323', fill: fg, align: 'left' }); pop(); }
}
function wrapSub(str) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 54px "Baloo 2"'; const words = str.split(' '), L = ['']; words.forEach(w => { const tr = (L[L.length - 1] + ' ' + w).trim(); if (g.measureText(tr).width > 720 && L[L.length - 1]) L.push(w); else L[L.length - 1] = tr; }); return L; }
function subs(t) {   // Baloo ExtraBold, white with thick ink outline, the bold words in ice blue, speaker pill in Juno's suit colour
  const i = PH.findIndex((p, k) => t >= p.start - .05 && t < (PH[k + 1] ? PH[k + 1].start - .05 : p.end + 1)); if (i < 0 || SHOT(t) === 'end') return; const p = PH[i]; if (t > p.end + .6) return;
  const cut = CUTS.find(c => c > p.start + .1); if (cut && t > cut - .02 && t < cut + .02) return;
  const BW = []; p.cap.split('**').forEach((chunk, k) => chunk.split(' ').filter(Boolean).forEach(w => BW.push(k % 2 === 1)));
  const lines = wrapSub(p.cap.replace(/\*\*/g, '')), pp = back(seg(t, p.start - .05, p.start + .07), 2);
  const y0 = 1290 - (lines.length - 1) * 33, X = 510; reset(); push(); translate(X, y0 - 72); scale(pp); shape(rr(-70, -24, 140, 48, 14), { fill: PAL.suit, lw: 5 }); text('JUNO', 0, 2, { font: '800 30px "Baloo 2"', fill: INK }); pop();
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 54px "Baloo 2"';
  let wi = 0; lines.forEach((l, k) => { const ws = l.split(' '), sp = g.measureText(' ').width, tw = g.measureText(l).width; let x = X - tw / 2;
    ws.forEach(w => { const ww = g.measureText(w).width; text(w, x + ww / 2, y0 + k * 66, { font: '800 54px "Baloo 2"', fill: BW[wi++] ? '#ffd36e' : '#fff', outlineW: 12 }); x += ww + sp; }); });
}

function render(t) { frame(t); screenRect('#000'); const tq = q(t); SH[SHOT(t)](t, tq); wipe(t); titleCard(t); tag(t); subs(t); }
window.DUR = TL.total;
// loop: the last 0.5 s rushes into a portal (template wipe) and comes out on frame 0, so the reel restarts seamlessly
window.seek = t => { const T = TL.total, a = T - .5; if (t <= a) return render(t);
  const u = (t - a) / .5; if (u < .5) { render(t); const R = 1500 * Math.pow(u * 2, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); }
  else { render(0); const R = 1500 * Math.pow(Math.max(0, 1 - (u - .5) * 2), .6) * (1 - u) * 2; reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); } };
window.render = window.seek;
// thumbnail / cover (rule 11): Spud mid brain-freeze, the lockup carrying the question
window.thumb = () => { const t = 1.2; frame(t); screenRect('#000'); cam(400, 980, 1.7); lab(t, { bare: true }); burningSpud(t, { x: 400, y: 1180 });
  reset(); translate(540, 470); scale(.8); titleArt(t, 'WHY SPICY', 'FEELS HOT');
  reset(); push(); translate(540, 1330); shape(rr(-300, -54, 600, 108, 16), { fill: '#17232a', lw: 7 }); text("it's a false alarm", 0, 6, { font: '400 72px VT323', fill: '#ffb03a' }); pop(); };
window.seek(0); window.ready = true; window.READY = true;
