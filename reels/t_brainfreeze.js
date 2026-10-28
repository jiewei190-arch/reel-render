// t_brainfreeze.js: "Why do you get brain freeze?" in template #9 scifi-toon (lemo-opuscar/styles/scifi-toon) grammar.
// 1080x1920. Characters, boil and mouths step at 12 fps; camera, portal swirl and wipes run on ones.
// One palette per world, the portal is the only thing that glows, VT323 world tag typed in, Baloo subtitles with speaker pill,
// Bungee title lockup with orbit ring, hard cuts or swirl wipes only. Batch N layout: captions y 1180-1400, no text in the
// top 250 px, the bottom 480 px or the right column (x > 900 from y 840); the end swirls back into frame 0.
import { clamp, lerp, seg, ss, eo, back, spring, hash, vnoise, TAU } from './styles/scifitoon/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, noodle, reset, bands } from './styles/scifitoon/toon.js';
import { juno, spud, mitt, eye, mouth, sweat, PAL, mix } from './styles/scifitoon/cast_af.js';
await Promise.all(['800 50px "Baloo 2"', '400 50px VT323', '400 50px Bungee'].map(f => document.fonts.load(f)));
init(document.getElementById('c'));
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
function cone(x, y, s, ang = 0, bite = 0, scoop = '#ff9cc2') {   // waffle cone + one scoop, held at the tip (x, y)
  push(); translate(x, y); rotate(ang); scale(s);
  shape([[-46, -120], [46, -120], [0, 30]], { fill: '#e8a85a', lw: 6, shade: () => { for (let i = -3; i <= 3; i++) { stroke([[i * 22 - 30, -130], [i * 22 + 30, 40]], 3, { line: '#b9773a' }); stroke([[i * 22 + 30, -130], [i * 22 - 30, 40]], 3, { line: '#b9773a' }); } } });
  const P = []; for (let i = 0; i < 18; i++) { const a = Math.PI + i / 17 * Math.PI, r = 62 * (1 + .06 * Math.sin(i * 2.3)); P.push([Math.cos(a) * r, -128 + Math.sin(a) * r * .95]); }
  P.push([52, -120], [34, -100], [20, -116], [0, -96], [-18, -114], [-40, -98], [-56, -118]);
  shape(spline(P), { fill: scoop, lw: 6, shade: () => { fillOnly(ell(24, -150, 30, 36, 16), mix(scoop, '#ffffff', .45), { boil: .3 }); for (let i = 0; i < 4; i++) dot(-30 + i * 18, -170 + (i % 2) * 22, 4, ['#ff5a5a', '#5ad0ff', '#ffe066', '#7ad65a'][i]); } });
  if (bite > 0) fillOnly(ell(44, -176, 26 * bite, 22 * bite, 14), '#a7c3b1', { boil: .3 });
  pop();
}
function freezeFX(x, y, r, t, k = 1) {   // brain-freeze burst around a head centre: ice shards, zig-zag zaps, shiver ticks
  if (k <= 0) return; const tq = q(t);
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .42, d = r * (1.05 + .12 * Math.sin(tq * 9 + i)), x0 = x + Math.cos(a) * d, y0 = y + Math.sin(a) * d * .9;
    const L = r * .5 * k; push(); translate(x0, y0); rotate(a + Math.PI / 2); shape([[-14, 0], [0, -L], [14, 0], [0, 12]], { fill: '#d9f4ff', lw: 5 }); pop(); }
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * .8, x0 = x + Math.cos(a) * r * 1.3, y0 = y + Math.sin(a) * r * 1.25, j = hash(Math.floor(tq * 12) + i * 9) * 10;
    const Z = [[0, 0], [16, -26], [-6, -40], [14, -70]].map(([px, py]) => [x0 + (px * Math.cos(a + 1.57) - py * Math.sin(a + 1.57)) * k * .9 + j, y0 + (px * Math.sin(a + 1.57) + py * Math.cos(a + 1.57)) * k * .9]);
    stroke(Z, 16, { line: INK }); stroke(Z, 8, { line: '#5ee6ff' }); }
  for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) { const xx = x + sx * r * (1.25 + i * .18), yy = y + 30 + i * 30; stroke([[xx, yy - 16], [xx + sx * 6, yy], [xx, yy + 16]], 6); }
}
function brain(x, y, s, t, col = '#ff9cb4') {   // a cute brain (it has no pain sensors)
  push(); translate(x, y); scale(s);
  const P = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = 1 + .07 * Math.sin(a * 9); P.push([Math.cos(a) * 150 * r, Math.sin(a) * 110 * r - (Math.sin(a) > 0 ? -10 : 0)]); }
  shape(spline(P), { fill: col, lw: 7, shade: () => { fillOnly(ell(60, 40, 90, 60, 20), mix(col, '#c24a74', .35), { boil: .3 });
    stroke([[0, -105], [8, -60], [-6, -20], [6, 30], [0, 100]], 6); for (let i = 0; i < 5; i++) { const xx = -120 + i * 60; stroke([[xx, -60 + (i % 2) * 20], [xx + 30, -30], [xx + 10, 10], [xx + 34, 50]], 5); } } });
  pop();
}
function vessel(P, w, t, flow = 0, k = 0) {   // a blood vessel: dark rim + red core; width w; flowing cells when open
  stroke(P, w + 14, { line: INK }); stroke(P, w, { line: '#e8394f' }); stroke(P, Math.max(2, w * .35), { line: '#ff7a86', alpha: .7 });
  if (flow > 0) { const n = P.length - 1; for (let i = 0; i < 7; i++) { const u = ((t * .45 * flow + i / 7) % 1) * n, a = Math.floor(u), f = u - a, b = Math.min(n, a + 1); const x = lerp(P[a][0], P[b][0], f), y = lerp(P[a][1], P[b][1], f); shape(ell(x, y, w * .26, w * .18, 12), { fill: '#b8162e', lw: 4 }); } }
}
function thermo(x, y, v, s = 1) { push(); translate(x, y); scale(s); shape(rr(-40, -220, 80, 420, 40), { fill: '#f7f3ea', lw: 7, shade: () => fillOnly(rect(-50, lerp(180, -180, v), 100, 600), v > .5 ? '#ff4a2a' : '#5ab8ff', { boil: .3 }) }); shape(ell(0, 220, 58, 58, 28), { fill: v > .5 ? '#ff4a2a' : '#5ab8ff', lw: 7 }); pop(); }

// ———————————————————— worlds (one palette each) ————————————————————
const X0 = -900, X1 = 2000;
function lab(t, o = {}) {           // home: sage ice-cream lab (wall, freezer, blackboard, clock, shelf of tubs)
  fillOnly(rect(X0, -800, X1 - X0, 2400), '#a7c3b1', { boil: 0 });
  for (let x = -800; x < 2000; x += 240) stroke([[x, -800], [x, 1150]], 4, { line: '#7c9d8a' });
  fillOnly(rect(X0, -800, X1 - X0, 300), '#8fae9b', { boil: 0 });
  shape(rr(300, 160, 520, 44, 10), { fill: '#eef6f0', lw: 6 }); stroke([[360, 140], [360, 160]], 5); stroke([[760, 140], [760, 160]], 5);
  shape(rr(560, 300, 470, 300, 10), { fill: '#2f4a3f', lw: 8, shade: () => {
    const L = o.bare ? [] : o.board || ['BRAIN = FROZEN ?', 'cold → mouth → ???', '']; L.forEach((l, i) => text(l, 795, 360 + i * 64, { font: `400 ${i ? 38 : 48}px VT323`, fill: i === 2 ? '#ffd36e' : '#e8f0e0' }));
  } });
  shape(rr(580, 592, 430, 16, 4), { fill: '#b08a5a', lw: 5 });
  push(); translate(170, 360); shape(ell(0, 0, 70, 70, 40), { fill: '#f7f3e8', lw: 8 }); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; stroke([[Math.cos(a) * 54, Math.sin(a) * 54], [Math.cos(a) * 62, Math.sin(a) * 62]], 4); } const sA = Math.floor(t) / 60 * TAU - Math.PI / 2; stroke([[0, 0], [0, -40]], 8); stroke([[0, 0], [36, 18]], 6); stroke([[0, 0], [Math.cos(sA) * 54, Math.sin(sA) * 54]], 2.5, { line: '#e8392b' }); dot(0, 0, 7); pop();
  shape(rr(-60, 560, 400, 22, 4), { fill: '#b08a5a', lw: 6 });
  [['#ff9cc2', 'BERRY'], ['#bff2d0', 'MINT'], ['#7a4a2a', 'CHOC']].forEach(([c, l], i) => { shape(rr(10 + i * 110, 470, 90, 90, 12), { fill: '#f4f1ea', lw: 6, shade: () => fillOnly(rect(0, 470, 400, 26), c, { boil: .3 }) }); if (!o.bare) text(l, 55 + i * 110, 530, { font: '800 18px "Baloo 2"', fill: INK }); });
  // freezer chest (left) with frost
  shape(rr(-80, 760, 460, 380, 20), { fill: '#e6f2f7', lw: 8, shade: () => { fillOnly(rect(300, 760, 100, 400), '#c9dde6', { boil: .3 }); for (let i = 0; i < 5; i++) fillOnly(ell(-40 + i * 90, 780, 40, 14, 12), '#ffffff', { boil: .4 }); } });
  shape(rr(-90, 730, 480, 50, 12), { fill: '#bcd6e2', lw: 7 }); shape(rr(120, 860, 120, 24, 10), { fill: '#7c9aa8', lw: 5 });
  for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; stroke([[60 + i * 110, 730 - u * 60], [70 + i * 110, 700 - u * 60]], 5, { line: '#ffffff', alpha: 1 - u }); }
  // floor
  shape(rect(X0, 1140, X1 - X0, 1200), { fill: '#6c7c75', lw: 6 }); for (let k = 0; k < 6; k++) stroke([[X0, 1190 + k * 80 + k * k * 12], [X1, 1190 + k * 80 + k * k * 12]], 4, { line: '#58665f' }); shape(rect(X0, 1116, X1 - X0, 30), { fill: '#557065', lw: 6 });
}
function palateWorld(t, chill = 0) {   // pink + ice blue: inside the mouth, the palate is the sky
  bands(['#ffc2d4', '#ffb0c8', '#ff9dbb', '#ff8aae'], -600, 1200);
  // the palate vault with ridges (rugae), frosted where the ice touched
  const vault = spline([[-200, 260], [1280, 260], [1280, 600], [1000, 700], [540, 760], [80, 700], [-200, 600]]);
  shape(vault, { fill: mix('#e8577e', '#a8dcff', chill * .7), lw: 9, shade: () => { for (let i = 0; i < 6; i++) stroke(arc(540, 470 + i * 40, 420 - i * 40, 60, .15, Math.PI - .15, 24), 6, { line: mix('#c23a62', '#5aa8e0', chill * .7) }); stroke([[540, 300], [540, 740]], 7, { line: mix('#c23a62', '#5aa8e0', chill * .7) }); } });
  for (let i = 0; i < 9; i++) shape(rr(40 + i * 112, 236, 84, 74, 24), { fill: '#fffbe8', lw: 6 });   // top teeth
  // tongue floor
  shape(spline([[-200, 1060], [200, 960], [540, 930], [880, 960], [1280, 1060], [1280, 1500], [-200, 1500]]), { fill: '#e8506f', lw: 9, shade: () => { stroke([[540, 950], [540, 1140]], 6, { line: '#b8304e' }); for (let i = 0; i < 14; i++) dot(80 + hash(i * 3.1) * 920, 1000 + hash(i * 1.7) * 110, 5, '#ff8aa4'); } });
  for (let i = 0; i < 9; i++) shape(rr(40 + i * 112, 1100, 84, 70, 22), { fill: '#fffbe8', lw: 6 });   // bottom teeth
  shape(rect(X0, 1150, X1 - X0, 900), { fill: '#7a2440', lw: 7 });
}
function studyWorld(t) {            // navy + amber: the 1990s-hospital lab study world
  bands(['#1d2a4a', '#223156', '#283a62', '#2e436e'], -600, 1140);
  for (let i = 0; i < 6; i++) stroke([[-100 + i * 240, -600], [-100 + i * 240, 1140]], 4, { line: '#17223d' });
  shape(rect(X0, 1140, X1 - X0, 900), { fill: '#141c33', lw: 7 }); for (let k = 0; k < 5; k++) stroke([[X0, 1190 + k * 90], [X1, 1190 + k * 90]], 4, { line: '#0f1528' });
}
function nerveWorld(t) {            // ultraviolet + yellow: a giant head in profile, the nerve as a wire
  bands(['#2a1550', '#341a62', '#3f2075', '#4a2788'], -600, 1200);
  for (let i = 0; i < 14; i++) { const x = hash(i * 3.3) * 1080, y = 270 + hash(i * 5.1) * 880; star4(x, y, 6 + 5 * Math.sin(t * 4 + i), '#e8d84a', 3); }
  // head silhouette facing left
  const head = spline([[420, 300], [640, 270], [860, 330], [960, 480], [980, 700], [930, 900], [860, 1010], [720, 1060], [600, 1070], [520, 1010], [430, 990], [360, 940], [330, 880], [300, 830], [250, 800], [280, 760], [250, 700], [190, 650], [230, 610], [260, 540], [280, 440], [330, 360]]);
  shape(head, { fill: '#b9a6ea', lw: 9, shade: () => fillOnly(ell(820, 640, 200, 360, 30), '#a28fdc', { boil: .3 }) });
  shape(ell(730, 640, 46, 70, 20), { fill: '#a28fdc', lw: 7 });   // ear
  eye(340, 560, 30, 26, { look: [-.8, 0], pupil: 6, skin: '#b9a6ea', lid: .3 });
  shape(rect(X0, 1150, X1 - X0, 900), { fill: '#1c0d38', lw: 7 });
}
function cafWorld(t) {              // mint + coral: the school-cafeteria experiment
  bands(['#c8f5dc', '#b6efd2', '#a3e8c8', '#90e0be'], -600, 1140);
  for (let i = 0; i < 9; i++) stroke([[-40, 280 + i * 100], [1120, 280 + i * 100]], 3, { line: '#86d1b0' });
  shape(rect(X0, 1140, X1 - X0, 900), { fill: '#e8604f', lw: 7 }); for (let x = -40; x < 1120; x += 160) stroke([[x, 1140], [x - 60, 1920]], 4, { line: '#c94a3c' });
}

// ———————————————————— poses ————————————————————
function J(t, o = {}) { const m = talk(t), tq = q(t); return { x: 810, y: 1130, s: .82, face: -1, lid: .5, look: [0, 0], mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), blink: blink(t), ...o }; }
function P(t, o = {}) { const tq = q(t); return { x: 380, y: 1130, s: .62, face: 1, t, nerv: .4, look: [.5, -.2], blink: blink(t, 3), mouth: { o: 0, sm: -.6 }, sq: 1 + .012 * Math.sin(tq * 3.1), ...o }; }
const head = (p) => [p.x + 2 * p.s * (p.face ?? 1), p.y - 150 * p.s];   // Spud's head centre (screen space under cam 1)
function frozenSpud(t, o = {}) {   // Spud mid brain-freeze, cone up in his right hand
  const p = P(t, { nerv: 1.3, lid: .95, eyeS: 1.15, mouth: { o: .85, w: 1.25, sm: -1 }, brow: -1.6, armL: { h: [-40, -150], bend: 30 }, armR: { h: [90, -60], bend: -20 }, ...o });
  spud(p); const [hx, hy] = head(p), sc = p.s; cone(p.x + 84 * sc + 90 * sc, p.y - 150 * sc - 60 * sc, sc * 1.05, .25, .6);
  freezeFX(hx, hy - 30 * sc, 150 * sc, t, o.fx ?? 1);
  return p;
}

// ———————————————————— shots ————————————————————
const WIPES = [[s(3) - .3, .3], [s(6) - .3, .3], [s(9) - .3, .3], [s(12) - .3, .3], [s(15) - .3, .3], [s(18) - .25, .25]];
const CUTS = WIPES.map(w => w[0]);
const SHOT = t => { if (t < HCUT) return 'hook'; const k = CUTS.filter(c => t >= c).length; return ['lab', 'palate', 'study', 'nerve', 'caf', 'lab3', 'end'][k]; };
const TAGS = [[s(3) - .1, s(6) - .4, 'U-1  THE PALATE', 'the roof of your mouth', '#5a1030', '#a8dcff'], [s(6) - .1, s(9) - .4, 'U-2  THE LAB STUDY', '13 volunteers + ice water', '#0f1528', '#ffb44a'], [s(9) - .1, s(12) - .4, 'U-3  THE NERVE', 'trigeminal: the face wire', '#1c0d38', '#e8d84a'], [s(12) - .1, s(15) - .4, 'U-4  THE CAFETERIA', '145 students, one stopwatch', '#123a2f', '#ff7a6b']];

const SH = {
  hook(t, tq) {   // frame 0: Spud already deep in brain freeze, cone up, ice shards + zaps; camera shake; lockup on top
    cam(400, 900, 1.9, 6, t); lab(t, { bare: true });
    frozenSpud(t, { x: 400, y: 1080, fx: 1 });
  },
  lab(t, tq) {   // two-shot: Juno explains; Spud thaws; insert of a brain on a pedestal under a dome: PAIN SENSORS 0
    const ins = t >= s(2) - .05 && t < s(3) - .9;
    if (!ins) { cam(540, 960, 1); lab(t); const po = popOpen(t - (s(3) - 1.0)); portal(560, 860, 230, t, { open: po });
      const thaw = ss(seg(t, s(1), s(1) + 2.5)); juno(J(t, { armR: t > s(1) + 1.2 ? { h: [150, -40], bend: -20 } : undefined, look: [-.6, 0] }));
      if (thaw < 1) frozenSpud(t, { x: 300, fx: 1 - thaw, nerv: 1.3 - thaw }); else { const p = P(t, { x: 300, look: [po > 0 ? .3 : .6, -.3], nerv: .3 + po, mouth: { o: po * .6, sm: -.6 }, eyeS: 1 + po * .25, armR: { h: [90, -60], bend: -20 } }); spud(p); cone(p.x + 84 * p.s + 90 * p.s, p.y - 210 * p.s, p.s * 1.05, .25, .6); }
      if (t > s(1) + 2.6) label('NOT FROZEN', 540, 300, 72, '#5ee6ff', pop_(tq, s(1) + 2.6), -.05); }
    else { cam(540, 900, 1.15); lab(t); const k = pop_(tq, s(2) - .05, 1.6);
      push(); translate(540, 1000); shape(rr(-200, 0, 400, 140, 12), { fill: '#d9d4c8', lw: 7 }); pop();
      brain(540, 860, .9, t); shape(arc(540, 1000, 250, 330, Math.PI, TAU, 30), { fill: 'rgba(220,245,255,.35)', lw: 7 });
      const poke = ss(seg(t, s(2) + 1.2, s(2) + 1.6)) * (1 - ss(seg(t, s(2) + 2.4, s(2) + 2.8))); mitt(lerp(1000, 720, poke), 820, Math.PI * .95, 1.1);
      if (poke > .8) for (let i = 0; i < 3; i++) star4(690 + i * 20, 760 - i * 30, 10, '#fff3d6');
      push(); translate(540, 450); scale(k); shape(rr(-270, -70, 540, 140, 14), { fill: '#17232a', lw: 7 }); text('PAIN SENSORS: 0', 0, 4, { font: '400 72px VT323', fill: '#ffb44a' }); pop();
      eye(500, 840, 16, 18, { look: [.6, -.2], skin: '#ff9cb4', lid: poke > .8 ? .5 : 0 }); eye(560, 840, 16, 18, { look: [.6, -.2], skin: '#ff9cb4', lid: poke > .8 ? .5 : 0 }); mouth(530, 890, 40, { o: 0, sm: .9, lw: 5 }); }
  },
  palate(t, tq) {   // jump 1: inside the mouth; ice lands on the palate, frost spreads, the two vessels pinch then balloon
    const ice = eo(seg(t, s(4) + .2, s(4) + .6)), chill = ss(seg(t, s(4) + .5, s(4) + 2.2)) * (1 - .6 * ss(seg(t, s(5) + 2.4, s(5) + 3.6)));
    const z = lerp(1.0, 1.06, ss(seg(t, s(3), s(6)))); cam(540, 960, z); palateWorld(t, chill);
    const tight = ss(seg(t, s(5) + .9, s(5) + 1.4)), wide = ss(seg(t, s(5) + 2.0, s(5) + 2.5)), w = 46 * (1 - .65 * tight * (1 - wide)) + 34 * wide;
    vessel([[-60, 640], [200, 610], [420, 650], [660, 615], [880, 650], [1140, 620]], w, t, wide * 2.2);
    vessel([[-60, 520], [240, 545], [520, 515], [760, 545], [1140, 520]], w * .8, t + .4, wide * 2.2);
    if (ice > 0) { push(); translate(540, lerp(1100, 560, ice)); shape(spline([[-110, 0], [-80, -60], [0, -80], [90, -60], [120, 0], [70, 50], [-60, 50]]), { fill: '#f1fbff', lw: 7, shade: () => fillOnly(ell(40, -20, 50, 30, 14), '#c9ecff', { boil: .3 }) }); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + .3; push(); translate(Math.cos(a) * 120 * chill, Math.sin(a) * 60 * chill); rotate(a); shape([[-10, 0], [0, -26], [10, 0], [0, 10]], { fill: '#d9f4ff', lw: 4 }); pop(); } pop(); }
    const sp = P(t, { x: 540, y: 1010, s: .55, nerv: .4 + chill, look: [0, -.9], eyeS: 1.2 + .2 * chill, mouth: { o: .3 + chill * .5, sm: -.8 }, sweat: chill > .5 ? null : t });
    spud(sp); if (chill > .3) freezeFX(sp.x, sp.y - 160 * sp.s, 130 * sp.s, t, chill);
    if (t > s(4) + .9 && t < s(5) + .8) label('BRRR', 220, 830, 70, '#a8dcff', pop_(tq, s(4) + .9), -.1);
    if (tight > .2 && wide < .5) label('TIGHTEN', 280, 830, 74, '#5ee6ff', pop_(tq, s(5) + .9), -.06); if (wide > .2) label('WIDE OPEN', 300, 830, 80, '#ff4a5a', pop_(tq, s(5) + 2.0), -.06);
  },
  study(t, tq) {   // jump 2: the volunteer sips ice water; the Doppler screen spikes as the front artery widens; hand up, then down
    cam(540, 960, 1); studyWorld(t);
    const pain = ss(seg(t, s(8) + .3, s(8) + .8)) * (1 - ss(seg(t, s(8) + 4.6, s(8) + 5.4)));
    // the cart + CRT monitor
    shape(rr(280, 740, 520, 40, 10), { fill: '#3a4566', lw: 7 }); shape(rr(510, 780, 60, 340, 8), { fill: '#3a4566', lw: 6 });
    shape(rr(200, 400, 680, 360, 30), { fill: '#c9c1a8', lw: 9, shade: () => fillOnly(rect(760, 380, 140, 400), '#b0a88e', { boil: .3 }) });
    shape(rr(240, 430, 520, 300, 18), { fill: '#0e1a14', lw: 7, shade: () => {
      text('BLOOD FLOW · FRONT ARTERY', 500, 464, { font: '400 30px VT323', fill: '#7affb0' });
      const P_ = []; for (let i = 0; i <= 60; i++) { const tt = t - (60 - i) * .06; const pk = ss(seg(tt, s(8) + .3, s(8) + .8)) * (1 - ss(seg(tt, s(8) + 4.6, s(8) + 5.4))); const beat = Math.max(0, Math.sin(tt * 7.5)) ** 6; P_.push([260 + i * 8, 680 - 40 - pk * 120 - beat * (30 + pk * 30)]); }
      stroke(P_, 6, { line: '#7affb0' }); text('Serrador et al. (abstract), 2012', 500, 710, { font: '400 26px VT323', fill: '#4fae78' }); } });
    // volunteer Spud on a stool: glass of ice water, straw to the palate
    shape(rr(140, 1000, 160, 26, 8), { fill: '#8a6a4a', lw: 6 }); stroke([[160, 1026], [150, 1130]], 8); stroke([[280, 1026], [290, 1130]], 8);
    const sip = t < s(8) + .2;
    const sp = P(t, { x: 220, y: 1010, s: .6, nerv: pain * 1.3, lid: pain * .9, brow: -pain * 1.4, mouth: { o: sip ? .15 : .2 + pain * .6, sm: -.8 }, look: [.6, -.2], armL: pain > .3 ? { h: [-30, -200], bend: 30 } : { h: [-40, 50], bend: -10 }, armR: { h: [110, -20], bend: -20 } });
    spud(sp); if (pain > .3) freezeFX(sp.x, sp.y - 160 * sp.s, 130 * sp.s, t, pain);
    push(); translate(330, 980); shape(spline([[-40, -110], [40, -110], [34, 0], [-34, 0]]), { fill: 'rgba(200,236,255,.7)', lw: 6 }); for (let i = 0; i < 3; i++) shape(rr(-26 + i * 18, -70 + (i % 2) * 20, 22, 22, 4), { fill: '#f1fbff', lw: 4 }); stroke([[0, -100], [-40, -170], [-96, -150]], 7, { line: '#ff5a7a' }); pop();
    // artery icon (right, inside x < 880): narrow -> wide on the pain
    const w = 30 + pain * 40; vessel([[640, 980], [700, 940], [780, 980], [860, 950]], w, t, pain * 2);
    label(pain > .5 ? 'WIDENS!' : 'artery', 760, 880, 46, pain > .5 ? '#ff7a86' : '#ffb44a', 1);
    if (t > s(7) + .6 && t < s(8) + .3) label('13 VOLUNTEERS', 400, 820, 56, '#ffb44a', pop_(tq, s(7) + .6));
    if (t > s(8) + 4.9) label('PAIN FADES', 400, 820, 60, '#7affb0', pop_(tq, s(8) + 4.9));
  },
  nerve(t, tq) {   // jump 3: the trigeminal nerve wire; a zap runs mouth -> knot; the brain reads it as forehead pain
    cam(540, 960, 1); nerveWorld(t);
    const K = [640, 640], V1 = [[640, 640], [560, 520], [430, 430], [330, 400]], V2 = [[640, 640], [520, 680], [380, 700], [270, 740]], V3 = [[640, 640], [600, 780], [480, 880], [380, 940]];
    const draw = ss(seg(t, s(9) + .3, s(9) + 1.4));
    for (const B of [V1, V2, V3]) { const n = Math.max(2, Math.ceil(B.length * draw)); const Pp = B.slice(0, n); stroke(Pp, 26, { line: INK }); stroke(Pp, 14, { line: '#ffe066' }); }
    shape(ell(K[0], K[1], 40, 34, 16), { fill: '#ffe066', lw: 7 });
    // ice-cream bite at the mouth + zap travelling V2 backwards, then out V1 to the forehead
    cone(220, 840, .7, -1.2, .6);
    const zap = (t - s(10)) % 2.2, along = (B, u) => { const n = B.length - 1, x = clamp(u) * n, a = Math.floor(Math.min(x, n - 1e-6)), f = x - a; return [lerp(B[a][0], B[a + 1][0], f), lerp(B[a][1], B[a + 1][1], f)]; };
    if (t > s(10)) { const u = zap / 1.1, P_ = u < 1 ? along(V2, 1 - u) : along(V1, u - 1); star4(P_[0], P_[1], 26 + 6 * Math.sin(tq * 30), '#ffffff', 5); }
    const blame = ss(seg(t, s(11) + .1, s(11) + .5));
    if (blame > 0) { freezeFX(380, 360, 90, t, blame); push(); translate(380, 330); shape(spline([[-20, -60], [20, -60], [10, 0], [0, 20], [-10, 0]]), { fill: '#ff4a5a', lw: 6 }); pop(); }
    if (t > s(9) + 1.6 && t < s(11)) label('TRIGEMINAL NERVE', 520, 1040, 62, '#ffe066', pop_(tq, s(9) + 1.6));
    if (t > s(10) + .3 && t < s(11)) { label('mouth', 200, 1000, 44, '#fff3d6', 1); label('forehead', 180, 420, 44, '#fff3d6', 1); }
    if (t > s(11) + .2 && t < s(11) + 1.9) { const k = pop_(tq, s(11) + .2, 2.2); push(); translate(520, 1040); rotate(-.05); scale(k); shape(rr(-230, -50, 460, 100, 12), { fill: '#fff3d6', lw: 7 }); text('WRONG SPOT!', 0, 4, { font: '400 52px Bungee', fill: '#e8483b' }); pop(); }
    if (t > s(11) + 1.9) label('REFERRED PAIN', 540, 1040, 66, '#ff9cc2', pop_(tq, s(11) + 1.9));
  },
  caf(t, tq) {   // jump 4: 145 students as cones, split into fast and slow, bars 27% vs 13%; Spud gulps
    cam(540, 960, 1); cafWorld(t);
    const split = ss(seg(t, s(14) - .2, s(14) + .8)), appear = seg(t, s(13) + .2, s(13) + 2.0);
    for (let i = 0; i < 145; i++) { if (i / 145 > appear) break; const fast = i % 2 === 0, j = Math.floor(i / 2), col = j % 9, row = Math.floor(j / 9);
      const x0 = 150 + (i % 15) * 56, y0 = 430 + Math.floor(i / 15) * 30, x1 = (fast ? 120 : 560) + col * 40, y1 = 430 + row * 30;
      const x = lerp(x0, x1, split), y = lerp(y0, y1, split); shape(spline([[x - 9, y - 6], [x + 9, y - 6], [x, y + 14]]), { fill: '#e8a85a', lw: 3 }); shape(ell(x, y - 10, 11, 10, 10), { fill: fast ? '#ff9cc2' : '#bff2d0', lw: 3 }); }
    if (t > s(13) + 1.0 && t < s(14) - .1) label('145 STUDENTS', 500, 800, 70, '#e8604f', pop_(tq, s(13) + 1.0));
    if (split > .5 && t < s(14) + 3.4) { label('< 5 s', 280, 790, 56, '#e8604f', pop_(tq, s(14) + .4)); label('> 30 s', 720, 790, 56, '#2e8a6a', pop_(tq, s(14) + .4)); }
    const bar = ss(seg(t, s(14) + 3.6, s(14) + 5.4)), bx = [[300, 27, '#e8604f'], [720, 13, '#2e8a6a']];
    if (t > s(14) + 3.4) bx.forEach(([x, v, c], i) => { const h = 250 * v / 27 * bar; shape(rect(x - 90, 1120 - h, 180, h + 4), { fill: c, lw: 7 }); label(Math.round(v * bar) + '%', x, 1080 - h - 20, 70, c, 1); label(i ? 'slow' : 'fast', x, 1090, 40, '#fff', bar); });
    if (t > s(14) + 1.6 && t < s(14) + 3.6) label('2×', 540, 860, 150, '#e8604f', pop_(tq, s(14) + 1.6, 2.6));
    // Spud gulping at speed (on ones: a fast bob), in front left, then frozen
    if (t < s(14) + 3.4) { const g_ = ss(seg(t, s(14) + .6, s(14) + 1.2)); const p = P(t, { x: 200, y: 1130, s: .5, bob: g_ < 1 ? -Math.abs(Math.sin(t * 30)) * 10 : 0, nerv: g_ * 1.3, lid: g_ * .9, brow: -g_ * 1.4, mouth: { o: .8, sm: -1 }, armR: { h: [80, -90], bend: -20 } }); spud(p); cone(p.x + 120 * p.s, p.y - 240 * p.s, p.s, -.4, .3 + g_ * .5); if (g_ > .3) freezeFX(p.x, p.y - 160 * p.s, 130 * p.s, t, g_); }
  },
  lab3(t, tq) {   // home: the fix (tongue to the palate, thermometer warms, frost melts), the alarm sign, a slow push-in on the question
    const fixOn = t < s(16) - .1;
    if (fixOn) { cam(540, 960, 1); lab(t, { board: ['THE FIX', 'tongue → roof of mouth', 'warm it back up'] });
      const warm = ss(seg(t, s(15) + 1.0, s(15) + 3.2)); juno(J(t, { armR: { h: [150, -40], bend: -20 }, look: [-.6, 0] }));
      const p = P(t, { x: 300, nerv: .8 * (1 - warm), lid: .6 * (1 - warm), mouth: { o: .25, sm: warm > .6 ? .8 : -.6 }, look: [.5, -.3] }); spud(p); if (warm < .9) freezeFX(p.x, p.y - 160 * p.s, 130 * p.s, t, 1 - warm);
      // inset: mouth cross-section, tongue presses up, palate warms from blue to pink
      push(); translate(300, 520); shape(ell(0, 0, 180, 150, 40), { fill: '#fff3d6', lw: 8, shade: () => {
        shape(arc(0, 40, 150, 110, Math.PI, TAU, 24).concat([[150, 40], [-150, 40]]), { fill: mix('#a8dcff', '#e8577e', warm), lw: 6 });
        const up = ss(seg(t, s(15) + .3, s(15) + .9)); shape(spline([[-130, 120], [-80, lerp(80, -10, up)], [0, lerp(60, -40, up)], [80, lerp(80, -10, up)], [130, 120]]), { fill: '#ff6f8f', lw: 6 }); } }); pop();
      thermo(560, 820, .2 + .6 * warm, .6); }
    else { const pushIn = ss(seg(t, s(17) - .3, s(18))); cam(lerp(540, 420, pushIn), lerp(960, 900, pushIn), lerp(1, 1.18, pushIn)); lab(t, { board: ['ALARM: MOUTH  ✓', 'BRAIN ICE      ✗', 'harmless + quick'] });
      juno(J(t, { armR: t < s(17) ? { h: [-120, -150], bend: 30 } : undefined, look: t < s(17) ? [-.3, -.9] : [-.7, .2] }));
      const p = P(t, { x: 300, look: t < s(17) ? [.8, -.6] : [-.6, .1], nerv: .2, mouth: { o: 0, sm: .5 }, armR: { h: [90, -60], bend: -20 } }); spud(p); cone(p.x + 84 * p.s + 90 * p.s, p.y - 210 * p.s, p.s * 1.05, .25, .6); }
  },
  end(t, tq) {   // end card: dark purple, dim portal, title lockup, closing lines; Spud floats with his cone
    reset(); screenRect('#241339'); reset(); portal(540, 1000, 380, t * .6, { open: spring(t - CUTS[5], 7, .45), sx: 1 }); screenRect('#241339', .5);
    const k = t - CUTS[5]; if (k > .5) { const p = P(t, { x: 540 + Math.sin(k * 1.3) * 60, y: 1180 + Math.cos(k * 1.1) * 12, s: .5, nerv: 0, mouth: { o: 0, sm: 1 }, lid: .2, look: [0, -.3], lean: Math.sin(k * 2) * .3, armL: { h: [-70, -60], bend: 10 }, armR: { h: [90, -60], bend: -20 } }); spud(p); cone(p.x + 87 * p.s, p.y - 210 * p.s, p.s, .25, .6); }
    const sc = back(seg(q(t), CUTS[5], CUTS[5] + .3), 2.2); reset(); translate(540, 450); scale(sc * .6); titleArt(t);
    const b = ss(seg(t, CUTS[5] + .3, CUTS[5] + .8)); reset(); g.globalAlpha = b;
    text('Follow for more of', 540, 680, { font: '800 70px "Baloo 2"', fill: '#fff', outlineW: 12 }); text('how it really works.', 540, 770, { font: '800 70px "Baloo 2"', fill: '#ffe066', outlineW: 12 });
    text("A new 'wait, really?' every day.", 540, 870, { font: '800 46px "Baloo 2"', fill: '#fff', outlineW: 9 });
    text('@howitreallyworkstudio', 540, 1330, { font: '400 52px VT323', fill: '#b8ff5a', outlineW: 8 }); g.globalAlpha = 1;
  },
};

// ———————————————————— screen layer ————————————————————
function titleArt(t, L1 = 'BRAIN', L2 = 'FREEZE') {   // atomic-age TV lockup: cream block letters, hard magenta offset, cyan orbit ring, orbiting ice cube, twinkle stars
  const orb = t * 1.6, rx = 600, ry = 92;
  const ring = (a0, a1) => { const P_ = arc(0, 6, rx, ry, a0, a1, 40); stroke(P_, 21, { boil: .5 }); stroke(P_, 9, { line: '#5ee6ff', boil: .5 }); };
  const cube = () => { push(); translate(Math.cos(orb) * rx, 6 + Math.sin(orb) * ry); rotate(orb + 1.2); shape(rr(-30, -30, 60, 60, 10), { fill: '#d9f4ff', lw: 6 }); stroke([[-14, -14], [6, -18]], 5, { line: '#ffffff' }); pop(); };
  rotate(-.05); push(); rotate(.12); ring(Math.PI, TAU); if (Math.sin(orb) < 0) cube(); pop();
  text(L1, 10, -98, { font: '400 120px Bungee', fill: '#ff4fa3', outlineW: 20, outlineCol: INK }); text(L1, 0, -108, { font: '400 120px Bungee', fill: '#fff3d6', outlineW: 20, outlineCol: INK });
  text(L2, 12, 52, { font: '400 170px Bungee', fill: '#5ee6ff', outlineW: 22, outlineCol: INK }); text(L2, 0, 40, { font: '400 170px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
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
    ws.forEach(w => { const ww = g.measureText(w).width; text(w, x + ww / 2, y0 + k * 66, { font: '800 54px "Baloo 2"', fill: BW[wi++] ? '#9fe8ff' : '#fff', outlineW: 12 }); x += ww + sp; }); });
}

function render(t) { frame(t); screenRect('#000'); const tq = q(t); SH[SHOT(t)](t, tq); wipe(t); titleCard(t); tag(t); subs(t); }
window.DUR = TL.total;
// loop: the last 0.5 s rushes into a portal (template wipe) and comes out on frame 0, so the reel restarts seamlessly
window.seek = t => { const T = TL.total, a = T - .5; if (t <= a) return render(t);
  const u = (t - a) / .5; if (u < .5) { render(t); const R = 1500 * Math.pow(u * 2, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); }
  else { render(0); const R = 1500 * Math.pow(Math.max(0, 1 - (u - .5) * 2), .6) * (1 - u) * 2; reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); } };
window.render = window.seek;
// thumbnail / cover (rule 11): Spud mid brain-freeze, the lockup carrying the question
window.thumb = () => { const t = 1.2; frame(t); screenRect('#000'); cam(400, 980, 1.7); lab(t, { bare: true }); frozenSpud(t, { x: 400, y: 1180 });
  reset(); translate(540, 470); scale(.8); titleArt(t, 'WHY BRAIN', 'FREEZE?');
  reset(); push(); translate(540, 1330); shape(rr(-300, -54, 600, 108, 16), { fill: '#17232a', lw: 7 }); text("it's not your brain", 0, 6, { font: '400 72px VT323', fill: '#5ee6ff' }); pop(); };
window.seek(0); window.ready = true; window.READY = true;
