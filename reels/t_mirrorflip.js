// t_mirrorflip.js: "Why do mirrors flip left and right but not up and down?" in template #9 scifi-toon (lemo-opuscar/styles/scifi-toon)
// grammar, same kit and cast as slipperyice: boiling constant-width ink line, flat fill + hard shadow, one palette per world, the portal is
// the only thing that glows, VT323 world tags typed in, Baloo subtitles with a speaker pill, Bungee title lockup with an orbit ring,
// hard cuts or swirl wipes only. Story: Juno's lab tests the mirror. The explanation is drawn the classic way, as a top-down floor plan on
// the lab board: you face north at a mirror line, your image faces south, and your raised right hand stays on the east side for both.
// A ghost twin "walks around" to show the imagined turn that swaps the hands.
// 1080x1920. Characters, boil and mouths step at 12 fps; camera, portal swirl and wipes run on ones. Batch N: subtitles at y 1150-1420.
import { clamp, lerp, seg, ss, eo, back, spring, hash, vnoise, TAU } from './styles/scifitoon/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, noodle, reset, bands } from './styles/scifitoon/toon.js';
import { juno, spud, mitt, eye, mouth, sweat, PAL, mix } from './styles/scifitoon/cast_af.js';
await Promise.all(['800 50px "Baloo 2"', '400 50px VT323', '400 50px Bungee'].map(f => document.fonts.load(f)));
init(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, LIP = window.LIP || [];
const q = t => Math.floor(t * 12 + 1e-6) / 12;
function talk(t) { const tq = q(t); const on = PH.some(p => tq >= p.start - .02 && tq < p.end + .02); if (!on) return { o: 0, w: 1, talking: false }; const o = LIP[Math.floor(tq * 24)] || 0; return { o: clamp(o * 1.05), w: .85 + .3 * hash(Math.floor(tq * 12)), talking: true }; }
const blink = (t, ph = 0) => { const k = Math.floor(t * 12 + ph * 7) + 9; return k % 37 === 0 || k % 37 === 1; };
function cam(cx, cy, z, shake = 0, t = 0) { reset(); translate(W / 2, H / 2); if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); } scale(z); translate(-cx, -cy); }

// —— portal (after slipperyice / lemo-opuscar worlds.js portal, MIT) ——
function portal(cx, cy, r, t, { open = 1, sx = .74, spin = 1 } = {}) {
  if (open <= .001) return; const R = r * open;
  push(); translate(cx, cy); scale(sx, 1);
  fillOnly(ell(0, 0, R * 1.55, R * 1.45, 48), 'rgba(140,255,90,.14)', { boil: .6 }); fillOnly(ell(0, 0, R * 1.28, R * 1.22, 48), 'rgba(140,255,90,.18)', { boil: .6 });
  const rim = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, k = 1 + .18 * (vnoise(i * 1.7 + t * 3) - .5) + .05 * Math.sin(a * 5 + t * 6); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * k]); }
  shape(spline(rim), { fill: '#3fd93a', lw: 8, shade: () => {
    fillOnly(ell(0, 0, R * .9, R * .9, 40), '#6ef24c', { boil: .3 });
    for (let k = 0; k < 5; k++) { const a1 = []; for (let j = 0; j <= 22; j++) { const u = j / 22, rr_ = R * (1 - u) * .95, a = k / 5 * TAU + u * 3.6 + t * 2.6 * spin; a1.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); } stroke(a1, 10, { line: '#2fb52a', boil: .3 }); }
    fillOnly(ell(0, 0, R * .3, R * .3, 24), '#dcffa8', { boil: .5 }); fillOnly(ell(0, 0, R * .14, R * .14, 16), '#ffffff', { boil: .5 });
  } });
  for (let i = 0; i < 12; i++) { const a = hash(i) * TAU + t * (1.5 + hash(i + 4) * 2), d = R * (1.05 + .25 * ((t * .8 + hash(i + 9)) % 1)); dot(Math.cos(a) * d, Math.sin(a) * d, 5 + hash(i + 2) * 4, i % 3 ? '#caff7a' : '#ffffff'); }
  pop();
}
const popOpen = x => x <= 0 ? 0 : back(clamp(x / .32), 1.7);
const star = (x, y, r, col = '#ffe066', lw = 4) => shape([[x, y - r], [x + r * .3, y - r * .3], [x + r, y], [x + r * .3, y + r * .3], [x, y + r], [x - r * .3, y + r * .3], [x - r, y], [x - r * .3, y - r * .3]], { fill: col, lw });
const sign = (x, y, w, h, str, t0, tq, o = {}) => { const k = back(seg(tq, t0, t0 + .25), 2); if (k <= 0) return; push(); translate(x, y); rotate(o.rot ?? -.05); scale(k); shape(rr(-w / 2, -h / 2, w, h, 14), { fill: o.bg || '#fff3d6', lw: 7 }); text(str, 0, 3, { font: o.font || '400 44px Bungee', fill: o.col || INK }); pop(); };
const stamp = (x, y, k) => { if (k <= 0) return; push(); translate(x, y); scale(k); stroke([[-70, -70], [70, 70]], 26, { line: INK }); stroke([[70, -70], [-70, 70]], 26, { line: INK }); stroke([[-70, -70], [70, 70]], 14, { line: '#e8483b' }); stroke([[70, -70], [-70, 70]], 14, { line: '#e8483b' }); pop(); };
function readout(x, y, w, l1, l2, o = {}) { push(); translate(x, y); shape(rr(-w / 2, -66, w, 132, 16), { fill: o.bg || '#0f3b3a', lw: 7 }); text(l1, 0, -14, { font: o.f1 || '400 64px VT323', fill: o.fg || '#9cf2ff' }); if (l2) text(l2, 0, 40, { font: '400 34px VT323', fill: o.fg2 || '#e8f6f4' }); pop(); }

// ———————————————————— worlds (one palette each) ————————————————————
const X0 = -900, X1 = 2000, FLOOR = 1300;
function labW(t, o = {}) {   // home lab: sage walls, the board, a wall clock, a tall mirror on a stand
  fillOnly(rect(X0, -800, X1 - X0, 2400), '#a7c3b1', { boil: 0 }); for (let x = -800; x < 2000; x += 240) stroke([[x, -800], [x, FLOOR]], 4, { line: '#7c9d8a' });
  shape(rr(120, 440, 840, 460, 12), { fill: '#2f4a3f', lw: 8, shade: () => { if (o.board) o.board(); } });
  shape(rr(140, 892, 800, 18, 4), { fill: '#b08a5a', lw: 5 });
  push(); translate(1010, 420); shape(ell(0, 0, 50, 50, 36), { fill: '#f7f3e8', lw: 7 }); const sA = Math.floor(t) / 60 * TAU - Math.PI / 2; stroke([[0, 0], [0, -28]], 6); stroke([[0, 0], [24, 12]], 5); stroke([[0, 0], [Math.cos(sA) * 38, Math.sin(sA) * 38]], 2.5, { line: '#e8392b' }); dot(0, 0, 5); pop();
  shape(rect(X0, FLOOR, X1 - X0, 900), { fill: '#6c7c75', lw: 6 }); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 70 + k * k * 14], [X1, FLOOR + 40 + k * 70 + k * k * 14]], 4, { line: '#58665f' }); shape(rect(X0, FLOOR - 30, X1 - X0, 32), { fill: '#557065', lw: 6 });
}
function testWorld(t) {      // U-1: mirror-silver + cobalt, a hall of glass panes
  bands(['#d9e6f2', '#c9dbef', '#b8cfea', '#a7c3e4'], -800, FLOOR);
  for (let i = 0; i < 6; i++) { const x = -60 + i * 220; shape(rr(x, 250, 150, 300, 10), { fill: '#e9f2fb', lw: 6, shade: () => { stroke([[x + 30, 290], [x + 70, 260]], 5, { line: '#ffffff' }); stroke([[x + 40, 330 + 10 * Math.sin(t * 2 + i)], [x + 110, 280]], 4, { line: '#ffffff' }); } }); }
  shape(rect(X0, FLOOR, X1 - X0, 900), { fill: '#3b4f8f', lw: 7 }); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR], [x + 40, FLOOR + 600]], 4, { line: '#2e3f75' });
}
function imagineWorld(t) {   // U-2: pink + violet: the world in your head
  bands(['#ff9ec7', '#f58bbd', '#e679b4', '#d468aa'], -800, FLOOR);
  for (let i = 0; i < 10; i++) { const x = hash(i * 3.3) * 1080, y = 260 + hash(i * 5.1) * 300, r = 8 + 6 * Math.sin(t * 4 + i); star(x, y, r, '#fff3d6', 3); }
  shape(rect(X0, FLOOR, X1 - X0, 900), { fill: '#7a3a8c', lw: 7 }); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR], [x + 40, FLOOR + 600]], 4, { line: '#5e2a70' });
}

// ———————————————————— the floor plan (top-down view) ————————————————————
// a person from above: shoulders, head, nose toward dir (-1 = north/up, 1 = south/down), hands at E (+x) and W (-x); raise: 'E'|'W'|null; ghost = outline only
function person(x, y, dir, o = {}) { const { raise = null, ghost = false, col = PAL.suit, sc = 1, point = 0, rot = null } = o; push(); translate(x, y); if (rot != null) rotate(rot); else if (dir > 0) rotate(Math.PI); scale(sc);
  const a = ghost ? .45 : 1; shape(ell(0, 0, 80, 34, 24), { fill: col, lw: 6, alpha: a }); shape(ell(0, -4, 34, 34, 20), { fill: PAL.skin, lw: 6, alpha: a }); shape([[-12, -34], [0, -60], [12, -34]], { fill: PAL.skin, lw: 5, alpha: a });
  for (const sd of [-1, 1]) { const up = (raise === 'E' && sd > 0) || (raise === 'W' && sd < 0); const hx = sd * (up ? 96 : 86), hy = up ? -26 : 8; shape(ell(hx, hy, up ? 22 : 15, up ? 22 : 15, 14), { fill: up ? PAL.mitt : PAL.skinS, lw: 5, alpha: a }); }
  if (point) { stroke([[70, -10], [70 + 10, -10 - 120 * point]], 10, { line: INK }); stroke([[70, -10], [70 + 10, -10 - 120 * point]], 5, { line: PAL.skin }); }
  pop(); }
// the board's plan: mirror line across the middle, compass, the person (south of the line, facing north) and the image (north, facing south)
function plan(t, o = {}) { const { cx = 540, cy = 670, me = 1, img = 1, raise = null, point = 0, dist = 0, axes = 0, ghost = null } = o;
  text('N', cx + 380, cy - 190, { font: '400 44px VT323', fill: '#e8f0e0' }); text('S', cx + 380, cy + 210, { font: '400 44px VT323', fill: '#e8f0e0' }); text('E', cx + 380 + 34, cy + 10, { font: '400 36px VT323', fill: '#e8f0e0' }); text('W', cx + 380 - 34, cy + 10, { font: '400 36px VT323', fill: '#e8f0e0' });
  stroke([[cx + 380, cy - 160], [cx + 380, cy + 180]], 3, { line: '#e8f0e0' }); stroke([[cx + 350, cy + 10], [cx + 410, cy + 10]], 3, { line: '#e8f0e0' });
  // the mirror (edge-on, seen from above)
  shape(rr(cx - 330, cy - 10, 620, 20, 6), { fill: '#bfe6ff', lw: 6, shade: () => stroke([[cx - 300, cy - 2], [cx - 200, cy - 2]], 3, { line: '#ffffff' }) }); text('MIRROR', cx - 40, cy - 34, { font: '400 30px VT323', fill: '#bfe6ff' });
  if (me > 0) { push(); translate(0, (1 - back(me, 1.5)) * 40); person(cx - 40, cy + 150, -1, { raise, point, sc: 1.3 }); pop(); text('YOU', cx - 40, cy + 245, { font: '400 36px VT323', fill: '#ffd36e' }); }
  if (img > 0) { person(cx - 40, cy - 150, 1, { raise, point, col: '#9cc9f2', sc: 1.3 }); text('IMAGE', cx - 40, cy - 250, { font: '400 36px VT323', fill: '#9cf2ff' }); }
  if (dist > 0) { for (const dx of [-120, 0, 90]) { const k = clamp(dist * 1.2); stroke([[cx - 40 + dx, cy + 130], [cx - 40 + dx, lerp(cy + 130, cy - 130, k)]], 3, { line: '#ffd36e', alpha: .9 }); }
    for (const yy of [cy + 70, cy - 70]) text('|—|', cx + 120, yy, { font: '400 40px VT323', fill: '#ffd36e', alpha: clamp(dist * 2 - 1) }); }
  if (axes > 0) { const k = clamp(axes); push(); translate(cx - 270, cy + 160); scale(k); stroke([[-50, 0], [50, 0]], 6, { line: '#b8ff5a' }); text('E–W same', 0, 34, { font: '400 30px VT323', fill: '#b8ff5a' }); pop();
    push(); translate(cx - 270, cy - 160); scale(clamp(axes * 2 - .6)); stroke([[0, -40], [0, 40]], 6, { line: '#ff8c7a' }); text('N–S FLIPPED', 0, 66, { font: '400 30px VT323', fill: '#ff8c7a' }); pop(); }
  if (ghost) ghost(); }

// ———————————————————— poses ————————————————————
function J(t, o = {}) { const m = talk(t), tq = q(t); return { x: 830, y: FLOOR + 10, s: .72, face: -1, lid: .5, look: [-.5, -.3], mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .05 + (m.talking ? (m.o - .3) * .06 : 0), blink: blink(t), ...o }; }
function P(t, o = {}) { const tq = q(t); return { x: 190, y: FLOOR, s: .7, face: 1, t, nerv: .2, look: [.5, -.4], blink: blink(t, 3), mouth: { o: 0, sm: .2 }, sq: 1 + .012 * Math.sin(tq * 3.1), ...o }; }

// ———————————————————— shots ————————————————————
const HCUT = s(1) - .1;
const WIPES = [[s(2) - .3, .3], [s(6) - .3, .3], [s(11) - .3, .3], [s(14) - .25, .25]];
const CUTS = WIPES.map(w => w[0]);
const SHOT = t => { if (t < HCUT) return 'hook'; const k = CUTS.filter(c => t >= c).length; return ['lab', 'test', 'imagine', 'lab3', 'end'][k]; };
const TAGS = [[s(2) - .1, s(6) - .4, 'U-1  MIRROR TEST', 'top-down view', '#14234f', '#bfe6ff'], [s(6) - .1, s(11) - .4, 'U-2  IMAGINE WORLD', 'inside your head', '#3a0f40', '#ffd1ec']];

const SH = {
  hook(t, tq) {   // frame 0: Spud waving at a tall mirror; his image waves back; the "L ⇄ R" panel gets stamped
    cam(540, 1000, 1); labW(t, { board: () => plan(t, { raise: Math.sin(t * 6) > 0 ? 'E' : null }) });
    spud(P(t, { x: 200, s: .78, armR: { h: [60 + 20 * Math.sin(t * 8), -150], bend: -20 }, mouth: { o: .4, sm: .8 }, look: [.6, -.5] }));
    const pk = back(seg(tq, 1.0, 1.25), 2) * (1 - seg(t, s(1) - .5, s(1) - .3)); if (pk > 0) { push(); translate(760, 1120); scale(pk); shape(rr(-170, -60, 340, 120, 18), { fill: '#fff3d6', lw: 7 }); text('LEFT ⇄ RIGHT?', 0, 4, { font: '400 40px Bungee', fill: INK }); pop(); stamp(760, 1120, back(seg(tq, 2.0, 2.25), 2.4) * .9); }
  },
  lab(t, tq) {   // the board line-up of axes, then Juno opens the portal
    const z = lerp(1.0, 1.04, ss(seg(t, HCUT, s(2)))); cam(540, 1000, z);
    const rows = [['1  LEFT / RIGHT  ?'], ['2  UP / DOWN     ?'], ['3  FRONT / BACK  ?', '#ffd36e']].slice(0, Math.floor(seg(t, s(1) + .8, s(1) + 2.2) * 3 + .999));
    labW(t, { board: () => { text('WHICH WAY DOES IT FLIP?', 540, 500, { font: '400 50px VT323', fill: '#e8f0e0' }); rows.forEach(([str, col], i) => text(str, 190, 600 + i * 80, { font: '400 56px VT323', fill: col || '#e8f0e0', align: 'left' })); } });
    const po = popOpen(t - (s(2) - .9)); portal(540, 700, 230, t, { open: po });
    juno(J(t, { armR: t > s(1) + .6 && t < s(2) - 1.2 ? { h: [-170, -140], bend: 30 } : undefined }));
    spud(P(t, { nerv: .2 + po * .7, sweat: po > 0 ? t : null, look: [po > 0 ? .3 : .6, -.4], mouth: { o: po * .6, sm: -.6 }, eyeS: 1 + po * .25 }));
  },
  test(t, tq) {   // U-1: the floor plan, big: right hand stays east; pointing; up stays up; the one flipped axis; equal distances
    cam(540, 960, 1); testWorld(t);
    push(); shape(rr(70, 330, 940, 820, 18), { fill: '#14234f', lw: 8 }); const ph = t < s(3) - .1 ? 'hand' : t < s(4) - .1 ? 'point' : t < s(5) - .1 ? 'axes' : 'dist';
    plan(t, { cx: 540, cy: 680, raise: ph === 'hand' ? (t > s(2) + .8 ? 'E' : null) : null, point: ph === 'point' ? ss(seg(t, s(3) + 2.0, s(3) + 2.6)) : 0, axes: ph === 'axes' ? seg(t, s(4) + .6, s(4) + 2.4) : ph === 'dist' ? 1 : 0, dist: ph === 'dist' ? seg(t, s(5) + .4, s(5) + 2.4) : 0 });
    pop();
    if (ph === 'hand') { sign(300, 1060, 380, 96, 'YOUR RIGHT: EAST', s(2) + 1.6, tq, { font: '400 34px Bungee' }); sign(770, 1060, 380, 96, 'IMAGE: EAST TOO', s(2) + 2.6, tq, { font: '400 34px Bungee', col: '#3a7fb0' }); }
    if (ph === 'point') { readout(290, 1060, 360, 'UP → UP', 'same', { fg: '#b8ff5a' }); if (t > s(3) + 2.2) readout(780, 1060, 400, 'AT YOU', 'points straight back', { fg: '#ff8c7a' }); }
    if (ph === 'axes') sign(540, 1070, 640, 100, 'ONLY INTO THE GLASS', s(4) + 2.6, tq, { col: '#e8483b' });
    if (ph === 'dist') sign(540, 1070, 640, 100, 'SAME DISTANCE BEHIND', s(5) + 2.2, tq, { col: '#3a7fb0' });
  },
  imagine(t, tq) { // U-2: from us. A ghost twin walks around to face you; its right hand lands on the west; up/down vs the ground; the head-over-heels gag
    cam(540, 960, 1); imagineWorld(t); const ph = t < s(7) - .1 ? 'us' : t < s(9) - .1 ? 'walk' : t < s(10) - .1 ? 'rules' : 'flip';
    if (ph === 'us') { spud(P(t, { x: 540, y: FLOOR, s: 1.25, look: [0, -.6], mouth: { o: .3, sm: .4 }, armR: { h: [20, -170], bend: -30 } })); const k = back(seg(tq, s(6) + .6, s(6) + .9), 2); push(); translate(780, 640); scale(k); shape(spline([[-160, -90], [160, -90], [180, 80], [-180, 80]]), { fill: '#fff3d6', lw: 7 }); text('FROM US!', 0, -6, { font: '400 54px Bungee', fill: INK }); pop(); }
    if (ph === 'walk' || ph === 'rules') { push(); shape(rr(70, 330, 940, 820, 18), { fill: '#3a0f40', lw: 8 });
      const u = ss(seg(t, s(7) + .5, s(7) + 3.0)), gx = 500 + Math.sin(u * Math.PI) * 300, gy = lerp(830, 530, u);
      plan(t, { cx: 540, cy: 680, img: 1, raise: 'E', ghost: () => { person(gx, gy, 0, { ghost: true, raise: 'E', col: '#ffd1ec', rot: lerp(0, Math.PI, u) }); if (u > .95) text('PRETEND TWIN', gx + 250, gy - 10, { font: '400 34px VT323', fill: '#ffd1ec' }); } });
      if (t > s(8) + .4) { const k = back(seg(tq, s(8) + .4, s(8) + .65), 2); push(); translate(250, 520); scale(k); text('ITS RIGHT', 0, 0, { font: '400 36px VT323', fill: '#ffd1ec' }); text('= WEST', 0, 36, { font: '400 36px VT323', fill: '#ffd1ec' }); pop(); }
      pop();
      if (ph === 'walk') sign(540, 940, 600, 100, '"IT\'S FLIPPED!"', s(8) + 2.6, tq, { col: '#c0307a' });
      else { readout(310, 1070, 440, 'L/R = YOU', 'relative to yourself', { bg: '#3a0f40', fg: '#ffd1ec' }); if (t > s(9) + 3.0) readout(780, 1070, 420, 'UP = SKY', 'set by the ground', { bg: '#3a0f40', fg: '#b8ff5a' }); } }
    if (ph === 'flip') { const fl = ss(seg(t, s(10) + 1.6, s(10) + 3.4)); push(); translate(540, 1000); rotate(fl * Math.PI); translate(-540, -1000); spud(P(t, { x: 540, y: 1150, s: 1.0, nerv: .8, mouth: { o: .8, sm: -1 }, eyeS: 1.3, armL: { h: [-90, -80], bend: 10 }, armR: { h: [90, -80], bend: -10 } })); pop();
      readout(540, 470, 520, 'UP / DOWN', 'set by the ground', { bg: '#3a0f40', fg: '#b8ff5a' }); sign(540, 640, 640, 100, 'NOBODY TURNS LIKE THIS', s(10) + 2.4, tq, { font: '400 38px Bungee', col: '#c0307a' }); }
  },
  lab3(t, tq) {   // verdict on the board; Harrison's line; yes/no cards
    const qn = t > s(13) - .15; cam(540, 1000, lerp(1, 1.06, ss(seg(t, s(11), s(14)))));
    const rows = [['FRONT / BACK  ✓ FLIPPED', '#b8ff5a'], ['LEFT / RIGHT  ✗ (YOU)', '#ff8c7a'], ['UP / DOWN     ✗ (GROUND)', '#ff8c7a']].slice(0, Math.floor(seg(t, s(11) + .3, s(11) + 3.0) * 3 + .999));
    labW(t, { board: () => { text('VERDICT', 540, 500, { font: '400 54px VT323', fill: '#e8f0e0' }); rows.forEach(([str, col], i) => text(str, 170, 610 + i * 84, { font: '400 54px VT323', fill: col, align: 'left' })); } });
    juno(J(t, { armR: !qn && t > s(11) + .4 ? { h: [-170, -140], bend: 30 } : undefined }));
    spud(P(t, { look: [.6, -.5], mouth: { o: 0, sm: .6 } }));
    if (t > s(12) - .1 && !qn) { const k = back(seg(tq, s(12), s(12) + .25), 2); push(); translate(540, 1080); scale(k); readout(0, 0, 640, 'D. HARRISON · U. TORONTO', '"front and back are being reversed"', { f1: '400 46px VT323', bg: '#14234f', fg: '#bfe6ff' }); pop(); }
    if (qn) [['YES', 330, '#b8ff5a'], ['NO', 750, '#ff8c7a']].forEach(([n, x, c], i) => { const k = back(seg(tq, s(13) + 1.8 + i * .25, s(13) + 2.05 + i * .25), 2); if (k <= 0) return; push(); translate(x, 1060); rotate((i - .5) * .1); scale(k); shape(rr(-130, -80, 260, 160, 18), { fill: c, lw: 8 }); text(n, 0, 6, { font: '400 72px Bungee', fill: INK }); pop(); });
  },
  end(t, tq) {   // end card: dark navy, dim portal, title lockup, closing line + series line
    reset(); screenRect('#141b3a'); reset(); portal(540, 1080, 420, t * .6, { open: spring(t - CUTS[3], 7, .45), sx: 1 }); screenRect('#141b3a', .5);
    const k = t - CUTS[3]; if (k > .8) spud(P(t, { x: 540 + Math.sin(k * 1.3) * 90, y: 1170, s: .55, nerv: 0, mouth: { o: 0, sm: 1 }, look: [0, -.3], armR: { h: [60, -150], bend: -20 } }));
    const sc = back(seg(q(t), CUTS[3], CUTS[3] + .3), 2.2); reset(); translate(540, 440); scale(sc * .6); titleArt(t);
    const b = ss(seg(t, CUTS[3] + .3, CUTS[3] + .8)); reset(); g.globalAlpha = b;
    text('Follow for more of', 540, 680, { font: '800 70px "Baloo 2"', fill: '#fff', outlineW: 12 }); text('how it really works.', 540, 770, { font: '800 70px "Baloo 2"', fill: '#ffe066', outlineW: 12 });
    text("A new 'wait, really?' every day.", 540, 860, { font: '800 44px "Baloo 2"', fill: '#fff', outlineW: 10 });
    text('@howitreallyworkstudio', 540, 1360, { font: '400 52px VT323', fill: '#b8ff5a', outlineW: 8 }); g.globalAlpha = 1;
  },
};

// ———————————————————— screen layer ————————————————————
function titleArt(t, L1 = 'MIRRORS FLIP', L2 = 'FRONT↔BACK') {   // atomic-age TV lockup with an orbiting hand mirror
  const orb = t * 1.6, rx = 540, ry = 70;
  const ring = (a0, a1) => { const P_ = arc(0, 130, rx, ry, a0, a1, 40); stroke(P_, 21, { boil: .5 }); stroke(P_, 9, { line: '#5ee6ff', boil: .5 }); };
  const mir = () => { push(); translate(Math.cos(orb) * rx, 130 + Math.sin(orb) * ry); rotate(orb * .5); shape(ell(0, -10, 28, 34, 20), { fill: '#bfe6ff', lw: 6 }); shape(rr(-7, 20, 14, 36, 4), { fill: '#e8483b', lw: 5 }); pop(); };
  rotate(-.05); push(); rotate(.12); ring(Math.PI, TAU); if (Math.sin(orb) < 0) mir(); pop();
  text(L1, 10, -98, { font: '400 92px Bungee', fill: '#ff4fa3', outlineW: 20, outlineCol: INK }); text(L1, 0, -108, { font: '400 92px Bungee', fill: '#fff3d6', outlineW: 20, outlineCol: INK });
  text(L2, 12, 52, { font: '400 104px Bungee', fill: '#ff4fa3', outlineW: 22, outlineCol: INK }); text(L2, 0, 40, { font: '400 104px Bungee', fill: '#fff3d6', outlineW: 22, outlineCol: INK });
  push(); rotate(.12); ring(0, Math.PI); if (Math.sin(orb) >= 0) mir(); pop();
  for (let i = 0; i < 4; i++) { const x = [-520, 520, -380, 430][i], y = [-170, -150, 150, 160][i], r = 16 + 10 * Math.sin(t * 5 + i * 1.7); star(x, y, r, '#ffe066', 5); }
}
function titleCard(t) { const b = s(1) + .8; if (t >= b) return; const u = seg(q(t) + .25, 0, .25), sc = u < 1 ? back(u, 2.4) : 1, out = 1 - seg(t, b - .2, b); reset(); translate(540, 380); scale(sc * out * .78, sc * .78); titleArt(t); }
function wipe(t) { for (const [tc, hw] of WIPES) { const d = Math.abs(t - tc); if (d > hw) continue; const u = 1 - d / hw, R = 1500 * Math.pow(u, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); if (d < .03) screenRect('#dcffa8', .7); } }
function tag(t) {
  for (const [a, b, id, desc, bg, fg] of TAGS) { if (t < a || t >= b) continue; const n = Math.floor((t - a) * 40), s1 = id.slice(0, n), s2 = desc.slice(0, Math.max(0, n - id.length)); reset(); const pp = back(seg(t, a, a + .18), 2.2);
    push(); translate(50, 262); scale(pp); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '400 54px VT323'; const w1 = Math.min(560, Math.max(g.measureText('▶ ' + id).width, g.measureText(desc).width * 40 / 54) + 60);
    shape(rr(0, 0, Math.max(420, w1), 118, 12), { fill: bg, lw: 7 }); text('▶ ' + s1 + (n < id.length && Math.floor(t * 6) % 2 ? '█' : ''), 24, 38, { font: '400 54px VT323', fill: fg, align: 'left' }); text(s2, 26, 86, { font: '400 40px VT323', fill: fg, align: 'left' }); pop(); }
}
function wrapSub(str) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 54px "Baloo 2"'; const words = str.split(' '), L = ['']; words.forEach(w => { const tr = (L[L.length - 1] + ' ' + w).trim(); if (g.measureText(tr).width > 780 && L[L.length - 1]) L.push(w); else L[L.length - 1] = tr; }); return L; }
function subs(t) {
  const i = PH.findIndex((p, k) => t >= p.start - .05 && t < (PH[k + 1] ? PH[k + 1].start - .05 : p.end + 1)); if (i < 0 || SHOT(t) === 'end') return; const p = PH[i]; if (t > p.end + .6) return;
  const cut = CUTS.find(c => c > p.start + .1); if (cut && t > cut - .02 && t < cut + .02) return;
  const str = p.cap.replace(/\*\*/g, ''), lines = wrapSub(str), pp = back(seg(t, p.start - .05, p.start + .07), 2);
  const y0 = 1360 - (lines.length - 1) * 66; g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 54px "Baloo 2"'; const mw = Math.max(...lines.map(l => g.measureText(l).width)) + 64;
  reset(); shape(rr(540 - mw / 2, y0 - 46, mw, lines.length * 66 + 26, 18), { fill: 'rgba(27,20,34,.86)', lw: 6, alpha: clamp(pp) }); push(); translate(540, y0 - 68); scale(pp); shape(rr(-70, -24, 140, 48, 14), { fill: PAL.suit, lw: 5 }); text('JUNO', 0, 2, { font: '800 30px "Baloo 2"', fill: INK }); pop();
  lines.forEach((l, k) => text(l, 540, y0 + k * 66, { font: '800 54px "Baloo 2"', fill: '#fff', outlineW: 12 }));
}
function render(t) {
  frame(t); screenRect('#000'); const tq = q(t); SH[SHOT(t)](t, tq); wipe(t); titleCard(t); tag(t); subs(t);
  const L = TL.total - t; if (L < .35) { const u = 1 - L / .35, R = 1500 * Math.pow(u, .6); reset(); portal(540, 960, R, t, { open: 1, sx: 1, spin: 2.2 }); }
}
window.DUR = TL.total;
window.seek = t => render(t);
window.render = window.seek;
window.thumb = () => { const t = 1.2; frame(t); screenRect('#000'); cam(540, 1000, 1); labW(t, { board: () => plan(t, { raise: 'E' }) }); spud(P(t, { x: 200, s: .8, armR: { h: [60, -150], bend: -20 }, mouth: { o: .5, sm: .8 } }));
  reset(); translate(540, 300); scale(.82); titleArt(t, "IT'S NOT", 'LEFT↔RIGHT'); };
window.seek(0); window.ready = true; window.READY = true;
