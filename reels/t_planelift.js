// t_planelift.js: "How do planes actually stay in the air?" in template #9 scifi-toon (lemo-opuscar/styles/scifi-toon) grammar.
// 1080x1920. Characters, boil and mouths step at 12 fps; camera, portal swirl and wipes run on ones.
// One palette per world, the portal is the only thing that glows, VT323 world tag typed in, Baloo subtitles on a dark plate,
// Bungee title lockup with orbit ring, hard cuts or swirl wipes only. Story: the lab's wind tunnel; worlds = the textbook myth,
// the tunnel's smoke pulses, a sail, turning the air, pressure; the lab board gives the verdict (INCORRECT -> BOTH TRUE).
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

// ———————————————————— the wing (one airfoil, used in every world) ————————————————————
function foil(cx, cy, chord, aoa = .1) { const P = []; const n = 28;
  const pt = (x, up) => { const th = .12, m = .05, p = .4; const yt = 5 * th * (.2969 * Math.sqrt(x) - .126 * x - .3516 * x * x + .2843 * x ** 3 - .1015 * x ** 4); const yc = x < p ? m / (p * p) * (2 * p * x - x * x) : m / ((1 - p) ** 2) * ((1 - 2 * p) + 2 * p * x - x * x); const X = (x - .4) * chord, Y = -(yc + (up ? yt : -yt)) * chord; const c = Math.cos(aoa), sn = Math.sin(aoa); return [cx + X * c - Y * sn, cy + X * sn + Y * c]; };
  for (let i = 0; i <= n; i++) P.push(pt((1 - Math.cos(i / n * Math.PI)) / 2, true)); for (let i = n; i >= 0; i--) P.push(pt((1 - Math.cos(i / n * Math.PI)) / 2, false)); return P; }
function wingPiece(cx, cy, chord, aoa, col = '#e8ecf4') { const P = foil(cx, cy, chord, aoa); shape(P, { fill: col, lw: 9, shade: () => fillOnly(foil(cx, cy + chord * .02, chord * .96, aoa).slice(29), '#c7cede', { boil: .3 }) }); return P; }
// streamline around the wing (y grows down): upwash ahead, downwash behind, bent around the surfaces
function flowPath(cx, cy, chord, d, turn = 1) { const P = []; for (let i = 0; i <= 40; i++) { const x = cx - chord * 1.0 + i / 40 * chord * 2.3, u = (x - cx) / chord; const sig = 1 / (1 + Math.exp(-(u - .45) / .18)), up = Math.exp(-(((u + .45) / .25) ** 2)); const k = Math.exp(-Math.abs(d) / (chord * .55));
  let y = cy + d + turn * chord * .22 * k * sig - turn * chord * .08 * k * up; if (Math.abs(u) < .65) y += (d < 0 ? -1 : 1) * chord * .08 * k * Math.cos(u / .65 * Math.PI / 2); P.push([x, y]); } return P; }
function puffs(P, t, sp, col, n = 4, r = 12) { for (let j = 0; j < n; j++) { const u = (t * sp + j / n) % 1, i = Math.floor(u * (P.length - 1)), [x, y] = P[i]; dot(x, y, r * Math.sin(u * Math.PI) + 3, col); } }
// an air parcel character: a small cloud with eyes
function parcel(x, y, s, col, t, look = 1, o = 0) { push(); translate(x, y); scale(s); shape(spline([[-46, 12], [-50, -14], [-24, -36], [6, -40], [36, -28], [50, -2], [40, 20], [0, 26]]), { fill: col, lw: 6 }); eye(-14, -8, 10, 12, { look: [look, 0], pupil: 3.4, skin: col }); eye(14, -8, 10, 12, { look: [look, 0], pupil: 3.4, skin: col }); mouth(0, 12, 18, { o, sm: .6, lw: 4 }); pop(); }
function bigArrow(x0, y0, x1, y1, w, col, a = 1) { if (a <= 0) return; const ang = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0) * a; push(); translate(x0, y0); rotate(ang); shape([[0, -w / 2], [L - w, -w / 2], [L - w, -w], [L, 0], [L - w, w], [L - w, w / 2], [0, w / 2]], { fill: col, lw: 7 }); pop(); }

// ———————————————————— worlds (one palette each) ————————————————————
const X0 = -900, X1 = 2000, FLOOR = 1300;
function tunnel(t, o = {}) {        // home lab's wind tunnel: teal steel + orange stripes, a glass test section, smoke rake on the left
  fillOnly(rect(X0, -800, X1 - X0, 2600), '#1f6f73', { boil: 0 }); for (let x = -800; x < 2000; x += 120) stroke([[x, -800], [x, 1800]], 4, { line: '#185b5e' });
  shape(rr(40, 420, 1000, 700, 40), { fill: '#e9f6f6', lw: 9, shade: () => { fillOnly(rect(40, 420, 1000, 40), '#cde9ea', { boil: .3 }); for (let i = 0; i < 6; i++) stroke([[80 + i * 170, 440], [160 + i * 170, 1100]], 6, { line: 'rgba(255,255,255,.6)' }); } });
  for (let i = 0; i < 9; i++) { dot(70 + i * 118, 438, 7, INK); dot(70 + i * 118, 1102, 7, INK); }
  shape(rr(40, 1120, 1000, 60, 10), { fill: '#ff8c3a', lw: 7, shade: () => { for (let x = 60; x < 1040; x += 90) fillOnly([[x, 1120], [x + 45, 1120], [x + 15, 1180], [x - 30, 1180]], '#2b2b33', { boil: .3 }); } });
  shape(rr(-30, 470, 70, 600, 14), { fill: '#3a3d4a', lw: 7 }); for (let i = 0; i < 9; i++) shape(ell(40, 500 + i * 66, 14, 10, 12), { fill: '#d7dbe2', lw: 4 });   // smoke rake
  shape(rect(X0, FLOOR, X1 - X0, 900), { fill: '#16494c', lw: 7 }); for (let k = 0; k < 6; k++) stroke([[X0, FLOOR + 60 + k * 90], [X1, FLOOR + 60 + k * 90]], 4, { line: '#123e40' });
}
function labW(t, o = {}) {          // home lab: sage walls, blackboard
  fillOnly(rect(X0, -800, X1 - X0, 2400), '#a7c3b1', { boil: 0 }); for (let x = -800; x < 2000; x += 240) stroke([[x, -800], [x, FLOOR]], 4, { line: '#7c9d8a' });
  shape(rr(120, 470, 840, 420, 12), { fill: '#2f4a3f', lw: 8, shade: () => {
    text(o.head || 'WHY PLANES FLY', 540, 528, { font: '400 54px VT323', fill: '#e8f0e0' }); stroke([[340, 556], [740, 556]], 3, { line: '#e8f0e0' });
    (o.rows || []).forEach(([str, col], i) => text(str, 170, 620 + i * 70, { font: '400 48px VT323', fill: col || '#e8f0e0', align: 'left' }));
    if (o.sketch) { const P = foil(540, 760, 300, .1); stroke(P.concat([P[0]]), 4, { line: '#e8f0e0' }); stroke(flowPath(540, 760, 300, -90, 0), 3, { line: '#bcd0c2' }); stroke(flowPath(540, 760, 300, 90, 0), 3, { line: '#bcd0c2' }); }
  } });
  shape(rr(140, 882, 800, 18, 4), { fill: '#b08a5a', lw: 5 });
  push(); translate(1050, 330); shape(ell(0, 0, 60, 60, 36), { fill: '#f7f3e8', lw: 7 }); const sA = Math.floor(t) / 60 * TAU - Math.PI / 2; stroke([[0, 0], [0, -34]], 7); stroke([[0, 0], [30, 14]], 5); stroke([[0, 0], [Math.cos(sA) * 46, Math.sin(sA) * 46]], 2.5, { line: '#e8392b' }); dot(0, 0, 6); pop();
  shape(rect(X0, FLOOR, X1 - X0, 900), { fill: '#6c7c75', lw: 6 }); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 70 + k * k * 14], [X1, FLOOR + 40 + k * 70 + k * k * 14]], 4, { line: '#58665f' }); shape(rect(X0, FLOOR - 30, X1 - X0, 32), { fill: '#557065', lw: 6 });
  // a model plane on a stand (the exhibit)
  shape(rr(-80, 1080, 240, 220, 10), { fill: '#8e7a66', lw: 7 }); shape([[-60, 1040], [150, 1030], [190, 1046], [150, 1060], [-60, 1056]], { fill: '#e8ecf4', lw: 6 }); shape([[30, 1040], [70, 980], [96, 980], [80, 1040]], { fill: '#e8ecf4', lw: 5 });
}
function mythWorld(t) {             // magenta + lime: the textbook race track over a giant wing
  bands(['#ff4f9a', '#ff6fb0', '#ff8fc2', '#ffb0d4'], -800, 1300);
  for (let i = 0; i < 5; i++) { const x = -100 + i * 300; shape(rr(x, 520 + (i % 2) * 40, 160, 220, 20), { fill: '#c23a8a', lw: 6 }); text('A+', x + 80, 600 + (i % 2) * 40, { font: '400 60px Bungee', fill: '#ffb0d4' }); }
  shape(rect(X0, 1300, X1 - X0, 900), { fill: '#7a2a6a', lw: 7 });
}
function seaWorld(t) {              // sea blue + sand: a sailboat
  bands(['#bfe6ff', '#a9dcfb', '#93d1f6', '#7cc5f0'], -800, 1050);
  shape(rect(X0, 1050, X1 - X0, 1200), { fill: '#2f7fc1', lw: 7, shade: () => { for (let i = 0; i < 8; i++) { const x = ((i * 220 - t * 120) % 1600 + 1600) % 1600 - 300; stroke(arc(x, 1110 + (i % 3) * 60, 60, 14, Math.PI, TAU, 10), 5, { line: '#9fd2ef' }); } } });
}
function skyWorld(t) {              // sunset: a jet crossing
  bands(['#ffb862', '#ff9a52', '#ff7a4a', '#e8583e'], -800, 1500);
  shape(ell(800, 520, 120, 120, 40), { fill: '#ffe066', lw: 7 }); for (let i = 0; i < 4; i++) { const x = ((i * 380 - t * 60) % 1500 + 1500) % 1500 - 200; shape(spline([[x, 900], [x + 60, 860], [x + 140, 870], [x + 200, 900]]), { fill: '#ffd1a0', lw: 6 }); }
  shape(rect(X0, 1500, X1 - X0, 900), { fill: '#7a3a2e', lw: 7 });
}
function turnWorld(t) {             // ultraviolet + gold: the air being turned
  bands(['#3b1f66', '#46277a', '#52308c', '#5e3a9c'], -800, 2600);
  for (let i = 0; i < 14; i++) { const x = hash(i * 3.3) * 1080, y = hash(i * 5.1) * 400 + 300, r = 6 + 5 * Math.sin(t * 4 + i); star(x, y, r, '#e8d84a', 3); }
}
function pressWorld(t) {            // split world: thin air above (pale), crowded air below (warm)
  fillOnly(rect(X0, -800, X1 - X0, 1600), '#cfe9ff', { boil: 0 }); fillOnly(rect(X0, 800, X1 - X0, 1600), '#ffd8a8', { boil: 0 });
  for (let i = 0; i < 18; i++) { const x = hash(i * 7.1) * 1080, y = 330 + hash(i * 3.7) * 380; dot(x + Math.sin(t * 2 + i) * 10, y, 9, '#7fb8e6'); }
  for (let i = 0; i < 60; i++) { const x = hash(i * 2.3) * 1080, y = 880 + hash(i * 4.9) * 300; dot(x + Math.sin(t * 2 + i) * 6, y, 10, '#e8873a'); }
}
// ———————————————————— poses ————————————————————
function J(t, o = {}) { const m = talk(t), tq = q(t); return { x: 860, y: FLOOR + 10, s: .9, face: -1, lid: .5, look: [0, 0], mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), blink: blink(t), ...o }; }
function P(t, o = {}) { const tq = q(t); return { x: 380, y: FLOOR, s: .8, face: 1, t, nerv: .3, look: [.5, -.2], blink: blink(t, 3), mouth: { o: 0, sm: -.4 }, sq: 1 + .012 * Math.sin(tq * 3.1), ...o }; }
// ———————————————————— shots ————————————————————
const HCUT = s(1) - .1;
const WIPES = [[s(2) - .3, .3], [s(4) - .3, .3], [s(5) - .3, .3], [s(6) - .25, .25], [s(7) - .3, .3], [s(9) - .3, .3], [s(10) - .3, .3], [s(13) - .25, .25]];
const CUTS = WIPES.map(w => w[0]);
const SHOT = t => { if (t < HCUT) return 'hook'; const k = CUTS.filter(c => t >= c).length; return ['lab', 'myth', 'tunnel', 'sail', 'sky', 'turn', 'press', 'lab3', 'end'][k]; };
const TAGS = [[s(2) - .1, s(4) - .4, 'U-1  THE TEXTBOOK', 'the equal-time story', '#3a1030', '#b8f03c'], [s(4) - .1, s(5) - .4, 'U-2  WIND TUNNEL', 'smoke pulses', '#0f3b3a', '#ffb862'], [s(5) - .1, s(6) - .3, 'U-3  A SAIL', 'same length both sides', '#123a5a', '#bfe6ff'], [s(7) - .1, s(9) - .4, 'U-4  TURNING', 'air goes down, wing goes up', '#1c0d38', '#e8d84a'], [s(9) - .1, s(10) - .4, 'U-5  PRESSURE', 'low above, high below', '#5a3010', '#ffd8a8']];
const WCX = 520, WCY = 820, WCH = 640;
function wingFlow(t, turn, a = 1, fast = 1.25) { for (const d of [-260, -170, -95, 95, 170, 260]) { const P = flowPath(WCX, WCY, WCH, d, turn); stroke(P, 7, { line: `rgba(255,255,255,${.75 * a})` }); puffs(P, t, d < 0 ? .5 * fast : .5, `rgba(255,255,255,${a})`, 3, 10); } }

const SH = {
  hook(t, tq) {   // frame 0: the wind tunnel already blowing smoke past the wing; the textbook slams in and gets an X
    cam(540, 800, 1.02 + .02 * Math.sin(t)); tunnel(t); wingFlow(t, 1); wingPiece(WCX, WCY, WCH, .1); shape(rr(WCX - 12, WCY + 40, 24, 280, 6), { fill: '#3a3d4a', lw: 6 });
    const k = back(seg(tq, .5, .8), 2); if (k > 0) { push(); translate(540, 700); rotate(-.08); scale(k * .85); shape(rr(-170, -110, 340, 220, 14), { fill: '#e8563a', lw: 8, shade: () => fillOnly(rect(-170, -110, 40, 220), '#b52c2c', { boil: .3 }) }); text('TEXTBOOK', 10, -40, { font: '400 44px Bungee', fill: '#fff3d6' }); text('longer path!', 10, 30, { font: '800 40px "Baloo 2"', fill: '#fff3d6' }); pop(); stamp(540, 700, .85 * back(seg(tq, 1.3, 1.55), 2.4)); }
  },
  lab(t, tq) {   // the board: the textbook diagram with "farther to go"; Juno opens the portal
    cam(540, 1000, lerp(1.0, 1.04, ss(seg(t, HCUT, s(2))))); labW(t, { head: 'THE TEXTBOOK SAYS', sketch: 1, rows: [] });
    if (t > s(1) + 2.6) text('top: farther to go?', 540, 860, { font: '400 42px VT323', fill: '#ffd36e' });
    const po = popOpen(t - (s(2) - .9)); portal(540, 700, 230, t, { open: po });
    juno(J(t, { armR: t > s(1) + 1 && t < s(2) - 1.2 ? { h: [-170, -140], bend: 30 } : undefined, look: [-.5, -.3] }));
    spud(P(t, { x: 300, nerv: .3 + po * .8, sweat: po > 0 ? t : null, look: [.6, -.4], mouth: { o: po * .6, sm: -.6 }, eyeS: 1 + po * .25 }));
  },
  myth(t, tq) {   // U-1: two air parcels race over and under a giant wing, the textbook says they meet at the back; then INCORRECT
    cam(540, 900, 1); mythWorld(t); const cx = 540, cy = 900, ch = 860;
    const P = wingPiece(cx, cy, ch, .08, '#fff3d6'); stroke([[cx + ch * .6 - 10, cy - 60], [cx + ch * .6 - 10, cy + 90]], 10, { line: INK }); text('FINISH', cx + ch * .6 - 10, cy - 90, { font: '400 36px Bungee', fill: INK });
    const u = clamp((t - s(2) - 1.0) / 3.4), top = P.slice(0, 29), bot = P.slice(29).reverse(); const pa = top[Math.floor(u * 28)], pb = bot[Math.floor(u * 28)];
    parcel(pa[0], pa[1] - 52, 1.1, '#ffffff', t, 1, u > .95 ? .5 : .2); parcel(pb[0], pb[1] + 52, 1.1, '#fff3a8', t, 1, u > .95 ? .5 : .2);
    if (u > .98 && t < s(3)) sign(540, 1110, 520, 100, 'SAME TIME?', s(2) + 4.4, tq, { col: '#7a2a6a' });
    if (t > s(3) + .8) { const k = back(seg(tq, s(3) + .8, s(3) + 1.05), 2); push(); translate(540, 620); rotate(-.12); scale(k); shape(rr(-300, -70, 600, 140, 12), { fill: '#fff3d6', lw: 9 }); text('INCORRECT', 0, 6, { font: '400 84px Bungee', fill: '#e8483b' }); pop(); }
    if (t > s(3) + 1.8) readout(540, 1110, 560, 'NASA GLENN', 'one of the most widely circulated', { bg: '#3a1030', fg: '#b8f03c' });
  },
  tunnel(t, tq) {   // U-2: smoke pulses, the top pulse reaches the back first
    cam(540, 800, 1.02); tunnel(t); wingFlow(t, 1, .6); wingPiece(WCX, WCY, WCH, .1); shape(rr(WCX - 12, WCY + 40, 24, 280, 6), { fill: '#3a3d4a', lw: 6 });
    const u = clamp((t - s(4) - .3) / 3.6); [-160, -115, -75, -40, 30, 55, 80, 105].forEach(d => { const P = flowPath(WCX, WCY, WCH, d, 1), top = d < 0, uu = clamp(.3 + u * .62 * (top ? 1.35 : 1)), k = Math.floor(uu * (P.length - 1)); for (let j = 0; j < 4; j++) { const [x, y] = P[Math.max(0, k - j)]; dot(x, y, 15 - j * 3, top ? '#e8483b' : '#2f6fd0'); } });
    if (u > .75) sign(760, 600, 460, 100, 'TOP: FIRST!', s(4) + .3 + 3.6 * .75, tq, { col: '#0f3b3a' });
  },
  sail(t, tq) {   // U-3: a sail with the same length on both sides still lifts
    cam(540, 900, 1); seaWorld(t); const bob = Math.sin(t * 2) * 8;
    shape([[260, 1060 + bob], [820, 1060 + bob], [740, 1140 + bob], [330, 1140 + bob]], { fill: '#b0652e', lw: 8 }); stroke([[540, 1060 + bob], [540, 420 + bob]], 12);
    shape(spline([[548, 440 + bob], [700, 560 + bob], [760, 800 + bob], [740, 1030 + bob], [548, 1030 + bob]]), { fill: '#fff3d6', lw: 8 });
    if (t > s(5) + 1.0) sign(330, 640, 420, 100, 'SAME LENGTH', s(5) + 1.0, tq, { col: '#2f7fc1' });
    bigArrow(860, 820, 980, 620, 40, '#ffe066', ss(seg(t, s(5) + 2.0, s(5) + 2.6)));
  },
  sky(t, tq) {   // a jet: so what really holds it up?
    cam(540, 900, 1); skyWorld(t); const x = lerp(-300, 1300, (t - s(6) + .25) / 2.2);
    push(); translate(x, 760); shape([[-200, -20], [180, -26], [240, 0], [180, 26], [-200, 20], [-240, 0]], { fill: '#e8ecf4', lw: 7 }); shape([[-20, -10], [-120, -150], [-70, -150], [60, -12]], { fill: '#d7dbe2', lw: 6 }); shape([[-20, 10], [-120, 150], [-70, 150], [60, 12]], { fill: '#d7dbe2', lw: 6 }); shape([[-200, -10], [-250, -80], [-220, -80], [-160, -14]], { fill: '#d7dbe2', lw: 5 }); pop();
    text('?', 540, 1050, { font: '400 220px Bungee', fill: '#fff3d6', outlineW: 18 });
  },
  turn(t, tq) {   // U-4: the curved, tilted wing bends the air down; Newton: air down, wing up
    cam(540, 820, 1); turnWorld(t); const k = ss(seg(t, s(7) + .3, s(7) + 1.4));
    wingFlow(t, .3 + .7 * k, 1, 1.25); wingPiece(WCX, WCY, WCH, .1 + .06 * k);
    spud(P(t, { x: WCX - 40, y: WCY - 36, s: .42, nerv: .2, look: [.6, -.3], mouth: { o: .3, sm: .6 }, lean: -.1 }));
    if (t > s(7) + 1.4) for (let i = 0; i < 3; i++) bigArrow(WCX + WCH * .55 + i * 50, WCY + 40 + i * 40, WCX + WCH * .55 + 80 + i * 50, WCY + 200 + i * 40, 28, '#9cf2ff', ss(seg(t, s(7) + 1.4 + i * .15, s(7) + 2.0 + i * .15)));
    if (t > s(8)) { bigArrow(WCX - 40, WCY - 110, WCX - 40, WCY - 420, 60, '#ffe066', ss(seg(t, s(8) + .2, s(8) + .8))); if (t > s(8) + .9) text('LIFT', WCX + 70, WCY - 330, { font: '400 72px Bungee', fill: '#ffe066', outlineW: 12 }); if (t > s(8) + 1.6) sign(540, 1110, 560, 100, "NEWTON'S 3RD LAW", s(8) + 1.6, tq, { col: '#3b1f66', font: '400 40px Bungee' }); }
  },
  press(t, tq) {   // U-5: low pressure above, high below
    cam(540, 820, 1); pressWorld(t); wingFlow(t, 1, .5); wingPiece(WCX, WCY, WCH, .14);
    if (t > s(9) + .8) readout(320, 470, 360, 'LOW', 'above the wing', { bg: '#123a5a', fg: '#cfe9ff' });
    if (t > s(9) + 2.0) readout(320, 1100, 360, 'HIGH', 'below the wing', { bg: '#5a3010', fg: '#ffd8a8' });
    bigArrow(WCX - 40, WCY - 110, WCX - 40, WCY - 360, 50, '#ffe066', ss(seg(t, s(9) + 2.8, s(9) + 3.4)));
  },
  lab3(t, tq) {   // the verdict board, BOTH TRUE, then the question cards
    const qn = t > s(12) - .15; cam(540, 1000, lerp(1, 1.06, ss(seg(t, s(10), s(12)))));
    labW(t, { head: 'VERDICT', rows: [['1  LONGER PATH  ✗', '#ff8c7a'], ['2  TURNS AIR DOWN  ✓', '#b8ff5a'], ['3  LOW PRESSURE ON TOP  ✓', '#b8ff5a'], ['2 + 3: SAME STORY', '#ffd36e']].slice(0, Math.floor(seg(t, s(10) + .3, s(10) + 3.6) * 4 + .999)) });
    juno(J(t, { look: [-.5, -.3], armR: !qn && t > s(10) + .3 && t < s(11) ? { h: [-170, -140], bend: 30 } : undefined }));
    spud(P(t, { x: 300, look: [.6, -.5], nerv: .1, mouth: { o: 0, sm: .5 } }));
    if (t > s(10) + 3.0 && !qn) { const k = back(seg(tq, s(10) + 3.0, s(10) + 3.25), 2); push(); translate(470, 960); rotate(-.06); scale(k); shape(rr(-280, -70, 560, 140, 12), { fill: '#fff3d6', lw: 9 }); text('BOTH TRUE', 0, 6, { font: '400 84px Bungee', fill: '#2f9e44' }); pop(); }
    if (qn) [['YES', 330, '#2f9e44'], ['NO', 750, '#e8483b']].forEach(([n, x, c], i) => { const k = back(seg(tq, s(12) + i * .25, s(12) + i * .25 + .25), 2); if (k <= 0) return; push(); translate(x, 1050); rotate((i - .5) * .1); scale(k); shape(rr(-150, -100, 300, 200, 18), { fill: c, lw: 8 }); text(n + '?', 0, 6, { font: '400 90px Bungee', fill: '#fff3d6' }); pop(); });
  },
  end(t, tq) {   // end card: dark purple, dim portal, title lockup, closing line + the series line
    reset(); screenRect('#241339'); reset(); portal(540, 1080, 420, t * .6, { open: spring(t - CUTS[7], 7, .45), sx: 1 }); screenRect('#241339', .5);
    const sc = back(seg(q(t), CUTS[7], CUTS[7] + .3), 2.2); reset(); translate(540, 470); scale(sc * .6); titleArt(t);
    const b = ss(seg(t, CUTS[7] + .3, CUTS[7] + .8)); reset(); g.globalAlpha = b;
    text('Follow for more of', 540, 660, { font: '800 70px "Baloo 2"', fill: '#fff', outlineW: 12 }); text('how it really works.', 540, 750, { font: '800 70px "Baloo 2"', fill: '#ffe066', outlineW: 12 });
    text("A new 'wait, really?' every day.", 540, 840, { font: '800 44px "Baloo 2"', fill: '#fff', outlineW: 10 });
    text('@howitreallyworkstudio', 540, 1360, { font: '400 52px VT323', fill: '#b8ff5a', outlineW: 8 }); g.globalAlpha = 1;
    reset(); push(); translate(540, 1110); scale(.4); wingPiece(0, 0, 640, .1); pop();
  },
};

// ———————————————————— screen layer ————————————————————
function titleArt(t, L1 = 'WHY PLANES', L2 = 'STAY UP') {   // atomic-age TV lockup: cream block letters, hard magenta offset, cyan orbit ring, an orbiting wing, twinkle stars
  const orb = t * 1.6, rx = 540, ry = 70;
  const ring = (a0, a1) => { const P_ = arc(0, 130, rx, ry, a0, a1, 40); stroke(P_, 21, { boil: .5 }); stroke(P_, 9, { line: '#5ee6ff', boil: .5 }); };
  const ice = () => { push(); translate(Math.cos(orb) * rx, 130 + Math.sin(orb) * ry); rotate(Math.sin(orb) * .3); wingPiece(0, 0, 110, .1); pop(); };
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
  reset(); shape(rr(500 - mw / 2, y0 - 46, mw, lines.length * 66 + 26, 18), { fill: 'rgba(27,20,34,.86)', lw: 6, alpha: clamp(pp) }); push(); translate(500, y0 - 68); scale(pp); shape(rr(-70, -24, 140, 48, 14), { fill: PAL.suit, lw: 5 }); text('JUNO', 0, 2, { font: '800 30px "Baloo 2"', fill: INK }); pop();
  lines.forEach((l, k) => text(l, 500, y0 + k * 66, { font: '800 54px "Baloo 2"', fill: '#fff', outlineW: 12 }));
}

function render(t) {
  frame(t); screenRect('#000'); const tq = q(t); SH[SHOT(t)](t, tq); wipe(t); titleCard(t); tag(t); subs(t);
  // loop: the last 0.35 s swirl back to the wind tunnel (frame 0's world)
  const L = TL.total - t; if (L < .35) { const u = 1 - L / .35, R = 1500 * Math.pow(u, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); }
}
window.DUR = TL.total;
window.seek = t => render(t);
window.render = window.seek;
// thumbnail / cover (rule 11): the wind tunnel, the textbook X'd, the lockup carrying the hook
window.thumb = () => { const t = 2.2; frame(t); screenRect('#000'); cam(540, 860, 1); tunnel(t); wingFlow(t, 1); wingPiece(WCX, WCY + 100, WCH, .1);
  reset(); translate(540, 520); scale(.9); titleArt(t, 'TEXTBOOK', 'IS WRONG');
  reset(); push(); translate(540, 1420); shape(rr(-330, -54, 660, 108, 16), { fill: '#0f3b3a', lw: 7 }); text('how planes really fly', 0, 6, { font: '400 64px VT323', fill: '#ffb862' }); pop(); };
window.seek(0); window.ready = true; window.READY = true;
