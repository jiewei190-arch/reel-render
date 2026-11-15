// t_shiver.js: "Why do we shiver when we're cold?" in template #15 Distilbook (demo 83), same kit and grammar as wrinklyfingers / magnet.
// Demo moves reused: bold stacked lines with the last line in blue, the tilted serif book page with depth blur and marker sweeps, hand-drawn
// felt-tip diagrams with crayon fills, hatching, circle callouts, wavy arrows and handwritten labels with one blue word, white editor cards,
// the dark navy slide with a big pink counter, the diagram shrinking into the white video-player card, the chapter strip, logo end card with a pill.
// Batch N layout: content between y 370 and ~1150 (titles kept below the top-right badge strip), karaoke at y 1330, nothing important in the
// bottom 480 px or the right column below y 840.
import { createDB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/distilbook/distilbook.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const D = createDB(document.getElementById('c')), g = D.g, lg = D.lg, R = ramp;
const SKIN = '#f3c4a2', SKIND = 'rgba(150,70,40,1)', MUS = '#e8746e', MUSD = 'rgba(140,30,30,1)', HEAT = '#f59a3c', COLDB = '#8fb0f0';
const label = (segs, x, y, k, o = {}) => D.rich(segs.map(z => typeof z === 'string' ? { s: z } : z), x, y, { f: 'hand', size: o.size || 48, align: o.align || 'center', write: k, a: o.a });
const stack = (lines, x, y, k, o = {}) => lines.forEach(([w, col], i) => D.text(w, x, y + i * (o.lh || 150), { f: 'sans', size: o.size || 140, wt: 800, col, track: -5, a: R(k, i * .25, .3), align: o.align }));
const jit = (t, a) => [Math.sin(t * 61) * a + Math.sin(t * 37) * a * .5, Math.cos(t * 53) * a * .6];

// ---------- the shivering person (felt tip + crayon), arms hugging; heat = flame inside the torso ----------
function person(x, y, sc, t, k, o = {}) { const c = D.ctx(); const [jx, jy] = jit(t, o.shake ?? 5); c.save(); c.translate(x + jx, y + jy); c.scale(sc, sc); D.use(c);
  const body = [[-110, -60], [110, -60], [130, 240], [-130, 240]]; D.crayon(body, o.coat || '#9fb6e8', { prog: R(k, .1, .5), seed: 301, dark: 'rgba(40,60,120,1)' }); D.ink([...body, body[0]], { w: 6 / sc, prog: R(k, 0, .5), seed: 302 });
  D.crayon(D.circ(0, -150, 80, 30), SKIN, { prog: R(k, .2, .4), seed: 303, dark: SKIND, scribble: false }); D.ink(D.circ(0, -150, 80, 30), { w: 6 / sc, prog: R(k, .1, .5), seed: 304 });
  D.ink([[-30, -165], [-14, -160]], { w: 5 / sc, prog: R(k, .4, .2), seed: 305, wob: 0 }); D.ink([[14, -160], [30, -165]], { w: 5 / sc, prog: R(k, .4, .2), seed: 306, wob: 0 });
  const tch = Math.sin(t * 40) > 0 ? 1 : 0; D.ink(D.seg(-26, -112 + tch * 3, 26, -112 + tch * 3, 6), { w: 5 / sc, prog: R(k, .5, .2), seed: 307, wob: 1.5 });   // chattering mouth
  D.ink([[-110, -20], [40, 60], [110, 30]], { w: 22 / sc, prog: R(k, .3, .4), seed: 308, col: o.coatD || '#6f86c8' }); D.ink([[110, -20], [-40, 70], [-110, 40]], { w: 22 / sc, prog: R(k, .35, .4), seed: 309, col: o.coatD || '#6f86c8' });
  D.ink([[-60, 240], [-70, 420]], { w: 18 / sc, prog: R(k, .4, .3), seed: 310 }); D.ink([[60, 240], [70, 420]], { w: 18 / sc, prog: R(k, .45, .3), seed: 311 });
  if (o.flame > 0) { const f = o.flame, fl = [[0, 160 - 40 * f], [-60 * f, 120], [-40 * f, 40 - 30 * f + Math.sin(t * 9) * 8], [0, -10 - 50 * f], [40 * f, 30 - 30 * f + Math.cos(t * 11) * 8], [60 * f, 120]];
    D.crayon(fl, HEAT, { prog: 1, seed: 312, a: .9 }); D.crayon(fl.map(([a, b]) => [a * .5, 80 + (b - 80) * .5]), C.sun, { prog: 1, seed: 313, a: .9 }); }
  c.restore(); D.use(lg);
  if (o.lines > 0) for (let i = 0; i < 6; i++) { const sd = i % 2 ? 1 : -1, yy = y - 140 * sc + Math.floor(i / 2) * 120 * sc, xx = x + sd * 175 * sc; D.ink([[xx, yy], [xx + sd * 16, yy + 18], [xx, yy + 36], [xx + sd * 16, yy + 54]], { w: 5, prog: o.lines, seed: 320 + i, col: C.blue, wob: 0 }); } }
// heat waves rising
function heatWaves(x, y, w, t, k) { if (k <= 0) return; for (let i = 0; i < 4; i++) { const xx = x - w / 2 + i * w / 3, u = (t * .5 + i * .25) % 1; D.ink(D.wave(xx, y - u * 60, xx + 10, y - 160 - u * 60, 9, 2), { w: 5, prog: k, seed: 330 + i, col: HEAT, a: Math.sin(u * Math.PI) }); } }
// side-view brain with the hypothalamus spot
function brain(x, y, sc, t, k, o = {}) { const c = D.ctx(); c.save(); c.translate(x, y); c.scale(sc, sc); D.use(c);
  const out = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * .95 + i / 40 * Math.PI * 1.1; out.push([Math.cos(a) * 300 * (1 + .04 * Math.sin(a * 5)), Math.sin(a) * 200 * (1 + .03 * Math.cos(a * 7)) - 20]); }
  out.push([210, 60], [120, 120], [40, 110], [-120, 130], [-260, 60]);
  D.crayon(out, '#f2b8c0', { prog: R(k, .2, .5), seed: 340, dark: 'rgba(160,60,80,1)' }); D.ink([...out, out[0]], { w: 6 / sc, prog: R(k, 0, .6), seed: 341 });
  [[-180, -60, 70], [-40, -120, 90], [110, -70, 80], [-90, 30, 60], [60, 20, 60]].forEach(([a, b, r], i) => D.ink(D.circ(a, b, r, 14, .5).slice(0, 10), { w: 4 / sc, prog: R(k, .3 + i * .05, .4), seed: 342 + i, col: 'rgba(150,50,70,.8)' }));
  D.ink([[60, 110], [80, 200], [70, 280]], { w: 26 / sc, prog: R(k, .4, .4), seed: 350, col: '#e9a0aa' });                                   // brainstem
  if (o.hypo > 0) { D.crayon(D.circ(-10, 70, 34, 20), C.blue, { prog: o.hypo, seed: 351 }); D.ink(D.circ(-10, 70, 70, 30), { w: 6 / sc, prog: o.hypo, seed: 352, col: C.red }); }
  c.restore(); D.use(lg); }
// thermostat dial (felt tip): v 0 cold .. 1 warm; set = set-point marker
function dial(x, y, r, v, k, o = {}) { if (k <= 0) return; D.crayon(D.circ(x, y, r, 40), '#ffffff', { prog: k, seed: 360, scribble: false }); D.ink(D.circ(x, y, r, 40), { w: 6, prog: k, seed: 361 });
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (.75 + i / 10 * 1.5); D.ink(D.seg(x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9, 1), { w: 4, prog: k, wob: 0 }); }
  D.text('cold', x - r * .62, y + r * .62, { f: 'hand', size: 34, col: C.blue, align: 'center', a: k }); D.text('warm', x + r * .62, y + r * .62, { f: 'hand', size: 34, col: C.red, align: 'center', a: k });
  if (o.set != null) { const a = Math.PI * (.75 + o.set * 1.5); D.dot(x + Math.cos(a) * r * 1.02, y + Math.sin(a) * r * 1.02, 12, C.pink, k); }
  const a = Math.PI * (.75 + v * 1.5); D.ink(D.seg(x, y, x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7, 2), { w: 9, prog: k, col: C.red, wob: 0 }); D.dot(x, y, 12, C.ink, k); }
// muscle fibre bundle: contraction c 0..1 shortens and fattens it
function muscle(x, y, w, h, c, k, seed = 370) { const ww = w * (1 - .16 * c), hh = h * (1 + .22 * c), pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU; pts.push([x + Math.cos(a) * ww / 2, y + Math.sin(a) * hh / 2 * (1 - .5 * Math.pow(Math.abs(Math.cos(a)), 6))]); }
  D.crayon(pts, MUS, { prog: k, seed, dark: MUSD }); D.ink(pts, { w: 6, prog: k, seed: seed + 1 });
  for (let i = 1; i < 6; i++) { const yy = y - hh / 2 + i * hh / 6; D.ink(D.seg(x - ww * .42, yy, x + ww * .42, yy, 8), { w: 3, prog: R(k, .3, .5), seed: seed + 2 + i, col: 'rgba(120,20,20,.45)' }); }
  D.ink([[x - ww / 2, y], [x - ww / 2 - 90, y]], { w: 16, prog: k, seed: seed + 9, col: '#e8e0cf' }); D.ink([[x + ww / 2, y], [x + ww / 2 + 90, y]], { w: 16, prog: k, seed: seed + 10, col: '#e8e0cf' }); }
function card(x, y, w, h, k) { if (k <= 0) return; const c = lg; c.save(); c.globalAlpha = k; c.shadowColor = 'rgba(40,50,80,.22)'; c.shadowBlur = 50; c.shadowOffsetY = 18; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x, y, w, h, 34); c.fill(); c.restore(); }

// ---------- A: hook: the shivering person, a furnace glowing inside; "Shaking / = heat." ----------
function sceneA(t) { person(540, 830, .9, t, 1, { flame: .55 + .45 * ss(R(t, 0, 2.4)), lines: 1, shake: 6 });
  stack([['Shaking', C.ink], ['= heat.', C.blue]], 540, 450, t < .05 ? 1 : R(t, -.4, .3), { size: 118, lh: 126, align: 'center' });
  label([{ s: 'furnace', col: C.red }], 820, 900, R(t, 1.4, .7), { size: 48 }); D.arrow(D.wave(790, 920, 620, 930, 8, 2), { w: 4.5, prog: R(t, 1.8, .5), seed: 400 }); }
// ---------- B: the book page with the search question ----------
const P = document.createElement('canvas'); P.width = 1500; P.height = 1000; const pg = P.getContext('2d');
const LINES = ["Why do we shiver when we're", 'cold? Shivering is rapid,', 'involuntary contraction and', 'relaxation of muscles. Its job', 'is not movement: shaking', 'makes heat.'];
const HL = []; { pg.fillStyle = C.blue; pg.font = D.font('serif', 104, 700); pg.fillText('7.4', 40, 130); const w = pg.measureText('7.4 ').width; pg.fillStyle = C.ink; pg.fillText('Shivering', 40 + w, 130);
  pg.font = D.font('serif', 60, 400); LINES.forEach((ln, i) => pg.fillText(ln, 40, 300 + i * 100));
  const find = (li, wd, col, t0) => { const x = pg.measureText(LINES[li].slice(0, LINES[li].indexOf(wd))).width + 40; HL.push({ x, y: 300 + li * 100 - 52, w: pg.measureText(wd).width, h: 68, col, t0 }); };
  find(0, "Why do we shiver when we're", C.hlBlue, s(1) + .1); find(1, 'cold?', C.hlBlue, s(1) + .9); find(4, 'shaking', C.pinkL, s(1) + 2.0); find(5, 'makes heat.', C.pinkL, s(1) + 2.3); }
function sceneB(t) { const T = D.T, tg = D.tg; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); const u = ss(R(t, s(1) - .3, 4)), z = 1.0 + .08 * u;
  tg.translate(40 - 20 * u, 470); tg.rotate(-.07); tg.scale(z, z); D.use(tg); HL.forEach(h => D.marker(h.x, h.y, h.w, h.h, h.col, R(t, h.t0, .45))); tg.drawImage(P, 0, 0); D.use(lg);
  const band = (y0, y1, b) => { lg.save(); lg.beginPath(); lg.rect(0, y0, W, y1 - y0); lg.clip(); if (b) lg.filter = `blur(${b}px)`; lg.drawImage(T, 0, 0); lg.restore(); };
  band(0, 480, 7); band(480, 600, 3); band(600, 1000, 0); band(1000, 1110, 3); band(1110, H, 8); }
// ---------- C: the thermostat: brain with the hypothalamus circled + dial; p3: too cold -> switch on shivering ----------
function sceneC(t) { const t0 = s(2); brain(400, 650, .9, t, R(t, t0 - .3, 1.1), { hypo: R(t, t0 + .8, .6) });
  label([{ s: 'hypothalamus', col: C.blue }], 330, 940, R(t, t0 + 1.0, .8), { size: 50 }); D.arrow(D.wave(330, 900, 380, 740, 8, 2), { w: 4.5, prog: R(t, t0 + 1.5, .5), seed: 410 });
  const cold = ss(R(t, s(3) + .2, 1.2)); dial(830, 520, 130, lerp(.55, .12, cold), R(t, t0 + 1.8, .6), { set: .55 }); label(['= ', { s: 'thermostat', col: C.blue }], 830, 730, R(t, t0 + 2.2, .7), { size: 48 });
  if (t > s(3) - .1) { const on = ss(R(t, s(3) + 1.6, .35)); D.crayon(D.rect(700, 860, 240, 220), '#e8ecf6', { prog: R(t, s(3) + .9, .5), seed: 420, scribble: false }); D.ink(D.rect(700, 860, 240, 220), { w: 6, prog: R(t, s(3) + .9, .6), seed: 421, smooth: false });
    const ky = lerp(1000, 900, on); D.crayon(D.rect(780, ky, 80, 80), on > .5 ? C.green : C.grey, { prog: R(t, s(3) + 1.1, .4), seed: 422 }); D.ink(D.rect(780, ky, 80, 80), { w: 5, prog: R(t, s(3) + 1.1, .4), seed: 423, smooth: false });
    label([{ s: on > .5 ? 'SHIVER: ON' : 'too cold', col: on > .5 ? C.blue : C.mid }], 570, 1110, R(t, s(3) + 1.3, .4), { size: 48 }); D.arrow(D.wave(470, 760, 690, 930, 10, 2), { w: 4.5, prog: R(t, s(3) + 1.6, .5), seed: 424, col: C.blue }); } }
// ---------- D: the muscle: tighten / relax, fast, over and over ----------
function sceneD(t) { const t0 = s(4), f = .5 + .5 * Math.sin(t * 22), k = R(t, t0 - .3, .9); muscle(540, 700, 640, 260, f * R(t, t0 + .6, .4), k);
  label([{ s: 'tighten', col: C.red }], 300, 470, R(t, t0 + 1.0, .5), { size: 56 }); label([{ s: 'relax', col: C.blue }], 790, 470, R(t, t0 + 1.6, .5), { size: 56 });
  D.arrow(D.seg(360, 960, 460, 960, 4), { w: 6, prog: R(t, t0 + 1.2, .4), wob: 0 }); D.arrow(D.seg(720, 960, 620, 960, 4), { w: 6, prog: R(t, t0 + 1.2, .4), wob: 0 });
  const n = Math.max(0, Math.floor((t - t0 - .6) * 3.5)); D.text(String(n).padStart(2, '0'), 540, 1110, { f: 'sans', size: 100, wt: 800, col: C.pink, align: 'center', a: R(t, t0 + .6, .3) }); D.text('contractions', 540, 1150, { f: 'mono', size: 24, wt: 600, col: C.mid, align: 'center', a: R(t, t0 + .6, .3) }); }
// ---------- E: shiver patterns: a steady tremble and bursts (editor card with two traces) ----------
function sceneE(t) { const t0 = s(5), ck = ex(R(t, t0 - .2, .6)); card(110, 380, 860, 700, ck);
  D.text('SHIVER PATTERNS', 160, 460, { f: 'mono', size: 26, wt: 700, col: C.mid, a: ck, track: 4 });
  const tr = (y, burst, kk, seed) => { const pts = []; for (let i = 0; i <= 120; i++) { const x = 160 + i * 6.5, env = burst ? (Math.sin(i * .16) > .3 ? 1 : .15) : .55; pts.push([x, y + Math.sin(i * 1.3 + t * 8) * 26 * env]); } D.ink(pts, { w: 4.5, prog: kk, seed, col: burst ? C.red : C.blue, wob: .4 }); };
  label([{ s: 'steady', col: C.blue }, ' tremble'], 320, 560, R(t, t0 + .3, .5), { size: 46, align: 'left' }); tr(650, false, R(t, t0 + .5, 1.2), 430);
  label([{ s: 'bursts', col: C.red }], 320, 830, R(t, t0 + 1.8, .5), { size: 46, align: 'left' }); tr(930, true, R(t, t0 + 2.0, 1.2), 431); }
// ---------- F: re-hook: muscles leak heat: the energy bar (fuel -> a little motion, a lot of heat) ----------
function sceneF(t) { const t0 = s(6); stack([['Muscles', C.ink], ['leak heat.', C.blue]], 120, 470, R(t, t0 - .2, 1.2), { size: 120, lh: 132 });
  const k = R(t, t0 + 1.4, .6); D.crayon(D.rect(140, 760, 800, 120), '#e8ecf6', { prog: k, seed: 440, scribble: false }); D.ink(D.rect(140, 760, 800, 120), { w: 6, prog: k, seed: 441, smooth: false }); label(['fuel'], 140, 735, k, { size: 44, align: 'left' });
  const sp = ss(R(t, t0 + 2.4, 1.4)), mw = 800 * lerp(1, .3, sp); D.crayon(D.rect(140, 760, mw, 120), COLDB, { prog: R(t, t0 + 2.2, .3), seed: 442 }); if (sp > 0) D.crayon(D.rect(140 + mw, 760, 800 - mw, 120), HEAT, { prog: 1, seed: 443 });
  label([{ s: 'motion', col: C.blue }], 240, 960, R(t, t0 + 3.6, .5), { size: 46 }); label([{ s: 'heat', col: C.red }], 720, 960, R(t, t0 + 3.8, .5), { size: 56 }); heatWaves(720, 740, 300, t, R(t, t0 + 3.4, .5)); }
// ---------- G: no real movement: arms jitter in place, distance moved = 0, heat rises off the body ----------
function sceneG(t) { const t0 = s(7); person(400, 760, .9, t, R(t, t0 - .3, .9), { shake: 5, flame: .8 }); heatWaves(400, 540, 220, t, R(t, t0 + 1.2, .5));
  D.ink(D.seg(160, 1110, 640, 1110, 6), { w: 5, prog: R(t, t0 + .6, .5), seed: 450 }); for (let i = 0; i <= 6; i++) D.ink(D.seg(160 + i * 80, 1095, 160 + i * 80, 1125, 1), { w: 4, prog: R(t, t0 + .8, .3), wob: 0 });
  label(['moved: ', { s: '0 m', col: C.red }], 400, 1170 - 20, R(t, t0 + 1.6, .6), { size: 46 });
  card(620, 440, 380, 300, ex(R(t, t0 + 2.4, .5))); D.text('ENERGY', 650, 510, { f: 'mono', size: 24, wt: 700, col: C.mid, a: R(t, t0 + 2.4, .4), track: 4 });
  label(['work → ', { s: 'warmth', col: C.red }], 810, 620, R(t, t0 + 2.8, .7), { size: 50 }); }
// ---------- H: 1988 cold-water study: dark navy slide, the pink counter climbs to 3.5x resting ----------
function sceneH(t) { const t0 = s(8); const k1 = R(t, t0, .8); D.text('COLD-WATER STUDY · 1988', 540, 420, { f: 'mono', size: 30, wt: 700, col: '#aab4d6', align: 'center', a: k1, track: 5 });
  const u = ss(R(t, t0 + 2.6, 2.6)), v = lerp(1, 3.5, u); D.text(v.toFixed(1) + '×', 540, 760, { f: 'sans', size: 230, wt: 800, col: C.pink, align: 'center', a: k1 }); D.text('resting metabolism', 540, 850, { f: 'hand', size: 54, col: '#e8ecfa', align: 'center', a: R(t, t0 + 1.0, .6) });
  const wy = 980; const pts = []; for (let i = 0; i <= 30; i++) pts.push([120 + i * 28, wy + Math.sin(i * .7 + t * 2.4) * 10]); D.ink(pts, { w: 5, prog: R(t, t0 + .4, .8), seed: 460, col: '#8fb0ff' });
  label([{ s: 'shoulder-deep, 18 °C', col: '#8fb0ff' }], 540, 1080, R(t, t0 + 1.4, .8), { size: 46, a: 1 }); }
// ---------- I: fuel: a muscle cell burning its sugar stores (glycogen granules shrinking) ----------
function sceneI(t) { const t0 = s(9), k = R(t, t0 - .3, .8); muscle(540, 720, 700, 320, .4 + .4 * Math.sin(t * 20), k, 470); const burn = ss(R(t, t0 + 1.0, 3));
  for (let i = 0; i < 14; i++) { const x = 330 + (i % 7) * 70, y = 660 + Math.floor(i / 7) * 110, r = 22 * (1 - burn * (hash(i) * .6 + .4)); if (r > 2) { D.crayon(D.rect(x - r, y - r, 2 * r, 2 * r), '#fff3c4', { prog: k, seed: 480 + i, scribble: false }); D.ink(D.rect(x - r, y - r, 2 * r, 2 * r), { w: 3, prog: k, seed: 500 + i, smooth: false }); } }
  label([{ s: 'muscle sugar', col: C.blue }, ' (glycogen)'], 540, 470, R(t, t0 + .3, .7), { size: 50 }); heatWaves(540, 540, 400, t, R(t, t0 + 1.2, .4)); label(['burns ', { s: 'fuel', col: C.red }], 540, 1060, R(t, t0 + 1.6, .6), { size: 54 }); }
// ---------- J: the quiet heater: brown fat cell with glowing mitochondria, no shaking ----------
function sceneJ(t) { const t0 = s(10), k = R(t, t0 - .3, .9); D.crayon(D.circ(540, 720, 300, 50), '#c89a6a', { prog: k, seed: 520, dark: 'rgba(110,60,20,1)' }); D.ink(D.circ(540, 720, 300, 50), { w: 6, prog: k, seed: 521 });
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, x = 540 + Math.cos(a) * 170, y = 720 + Math.sin(a) * 160, gl = .5 + .5 * Math.sin(t * 3 + i); D.crayon(D.circ(x, y, 46, 20, .55), C.sun, { prog: R(k, .3 + i * .04, .3), seed: 530 + i, a: .6 + .4 * gl }); D.ink(D.circ(x, y, 46, 20, .55), { w: 4, prog: R(k, .3 + i * .04, .3), seed: 540 + i }); }
  D.crayon(D.circ(540, 720, 70, 24), '#a66a3a', { prog: R(k, .5, .3), seed: 550 }); label([{ s: 'brown fat', col: C.blue }], 540, 450, R(t, t0 + .4, .7), { size: 60 }); label(['heat ', { s: 'without shaking', col: C.red }], 540, 1110, R(t, t0 + 1.6, .8), { size: 50 }); heatWaves(540, 430, 420, t, R(t, t0 + 1.0, .5) * .7); }
// ---------- K: fever: the set-point moves up while the room is warm; the person shivers anyway ----------
function sceneK(t) { const t0 = s(11), up = ss(R(t, t0 + 1.0, 1.6)); person(330, 780, .75, t, R(t, t0 - .3, .9), { shake: 4, coat: '#f4b8a0', coatD: '#d98a74' });
  dial(780, 560, 140, .5, R(t, t0 + .2, .6), { set: lerp(.5, .85, up) }); label(['set-point ', { s: 'up', col: C.red }], 780, 780, R(t, t0 + 1.6, .6), { size: 50 });
  label([{ s: 'fever', col: C.red }, ' on the way'], 540, 1110, R(t, t0 + .6, .8), { size: 54 }); D.arrow(D.wave(780, 820, 520, 900, 10, 2), { w: 4.5, prog: R(t, t0 + 2.4, .5), seed: 560 }); label(['still shivers'], 330, 440, R(t, t0 + 2.8, .6), { size: 46 }); }
// ---------- L: payoff: thermostat -> muscles -> heat, then the diagram shrinks into the video-player card ----------
function chain(t, k) { brain(250, 560, .45, t, k, { hypo: 1 }); D.arrow(D.wave(400, 560, 520, 560, 6, 2), { w: 5, prog: R(k, .3, .3), seed: 570 }); muscle(680, 560, 260, 110, .5 + .5 * Math.sin(t * 22), R(k, .4, .4), 580);
  D.arrow(D.wave(680, 650, 680, 760, 6, 2), { w: 5, prog: R(k, .6, .3), seed: 571 }); heatWaves(680, 960, 260, t, R(k, .7, .3)); D.crayon(D.circ(680, 870, 70, 24), HEAT, { prog: R(k, .7, .3), seed: 572 });
  label([{ s: 'thermostat', col: C.blue }], 250, 760, R(k, .2, .3), { size: 44 }); label(['tiny contractions'], 680, 470, R(k, .5, .3), { size: 44 }); label([{ s: 'heat', col: C.red }], 830, 880, R(k, .8, .2), { size: 50 }); }
function sceneL(t) { chain(t, R(t, s(12) - .3, 2.4)); }
// ---------- M: question: teeth chatter? two pills + a chattering mouth ----------
function sceneM(t) { const t0 = s(13), c = lg; label(['Teeth chatter?'], 540, 560, R(t, t0 - .1, .7), { size: 96 });
  [['YES', 300, C.pinkL], ['NO', 780, C.hlBlue]].forEach(([w, x, col], i) => { const k = bo(R(t, t0 + .7 + i * .3, .4)); if (k <= 0) return; c.save(); c.translate(x, 820); c.scale(k, k); c.fillStyle = col; c.beginPath(); c.roundRect(-170, -70, 340, 140, 70); c.fill(); c.restore(); D.text(w, x, 850, { f: 'sans', size: 80, wt: 800, align: 'center', a: clamp(k) }); });
  const o = Math.sin(t * 40) > 0 ? 14 : 0; D.crayon(D.rect(440, 990 - o, 200, 40), '#ffffff', { prog: 1, seed: 590, scribble: false }); D.ink(D.rect(440, 990 - o, 200, 40), { w: 5, seed: 591, smooth: false }); D.crayon(D.rect(440, 1036 + o, 200, 40), '#ffffff', { prog: 1, seed: 592, scribble: false }); D.ink(D.rect(440, 1036 + o, 200, 40), { w: 5, seed: 593, smooth: false }); }
// ---------- N: standard end card ----------
function sceneN(t) { const t0 = s(14) - .3, u = ex(R(t, t0, .7)), c = lg; D.logo(540 - 22, 560, 1.4, u, c);
  D.text('Follow for more of', 540, 700, { f: 'sans', size: 64, wt: 800, align: 'center', a: u }); D.text('how it really works.', 540, 790, { f: 'sans', size: 72, wt: 800, align: 'center', col: C.blue, a: u });
  D.text("A new 'wait, really?' every day.", 540, 880, { f: 'sans', size: 40, wt: 600, align: 'center', col: C.mid, a: R(t, t0 + .4, .5) });
  const pk = R(t, t0 + .6, .5); c.save(); c.globalAlpha = pk; c.fillStyle = C.hlBlue; c.beginPath(); c.roundRect(300, 950, 480, 84, 42); c.fill(); c.restore(); D.text('@howitreallyworkstudio', 540, 1005, { f: 'sans', size: 34, wt: 700, align: 'center', col: C.blue, a: pk });
  const lk = R(t, TOT - 1.6, 1.4); if (lk > 0) { c.save(); c.globalAlpha = lk; person(540, 1150, .35, t, 1, { shake: 3, flame: .8 }); c.restore(); } }

// ---------- compositor ----------
const SC = [[0, sceneA, 0], [s(1) - .3, sceneB, 0], [s(2) - .3, sceneC, 0], [s(4) - .3, sceneD, 0], [s(5) - .3, sceneE, 0], [s(6) - .3, sceneF, 0], [s(7) - .3, sceneG, 0],
  [s(8) - .3, sceneH, 1], [s(9) - .3, sceneI, 0], [s(10) - .3, sceneJ, 0], [s(11) - .3, sceneK, 0], [s(12) - .3, sceneL, 0], [s(13) - .3, sceneM, 0], [s(14) - .35, sceneN, 0]];
const TR = .45;
function idx(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; }
function draw(i, t) { D.clearLayer(); SC[i][1](t); }
function blitScene(i, t, o) { if (SC[i][1] === sceneL) { const k = R(t, s(12) + 3.0, .8); if (k > 0) { D.card(k, t / TOT, t, TOT, { cy: 760, h: 900, src: [70, 330, 940, 910] }); return; } } D.blit(o); }
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), dk = i > 0 && u < 1 ? lerp(SC[i - 1][2], SC[i][2], ss(u)) : SC[i][2];
  D.ground(dk);
  if (i > 0 && u < 1) { draw(i - 1, t); blitScene(i - 1, t, { a: 1 - ss(u), z: 1 + .06 * u, blur: 14 * u }); }
  draw(i, t); blitScene(i, t, { a: i > 0 ? ss(u) : 1, z: (i > 0 ? lerp(.95, 1, ex(u)) : 1) * (1 + .012 * Math.sin(t * .9)), dy: 8 * Math.sin(t * .6), blur: i > 0 ? 12 * (1 - u) : 0 });
  const ph = PH.findLast(p => t >= p.start - .25), endc = t >= s(14) - .4;
  if (!endc && ph) D.karaoke(ph, t, 1330, { dark: dk > .5, size: 50, out: ph.i < PH.length - 1 ? PH[ph.i + 1].start - .2 : null });
  chapters(t, dk); D.hud(t, TOT, dk); }
// progress device: chapter strip in the bottom band (Distilbook mono labels + pills); current chapter in blue
const CH = [['thermostat', 2], ['muscles', 4], ['heat', 6], ['fuel', 9], ['fever', 11]];
function chapters(t, dk) { if (t >= s(14) - .4) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); let cur = -1; CH.forEach(([, i], k) => { if (t >= s(i) - .3) cur = k; });
  const x0 = 150, dx = 195, y = 1560; c.globalAlpha = .9; c.strokeStyle = dk > .5 ? 'rgba(200,210,240,.35)' : 'rgba(30,34,46,.2)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + dx * 4, y); c.stroke();
  CH.forEach(([lab], k) => { const x = x0 + k * dx, on = k === cur, done = k < cur; c.fillStyle = on ? C.blue : done ? (dk > .5 ? '#8fb0ff' : C.blueL) : (dk > .5 ? '#3a4466' : '#dfe3ec'); c.beginPath(); c.arc(x, y, on ? 17 : 12, 0, TAU); c.fill();
    c.font = D.font('mono', 22, on ? 700 : 500); c.textAlign = 'center'; c.fillStyle = on ? (dk > .5 ? '#e8ecfa' : C.ink) : (dk > .5 ? 'rgba(200,210,240,.5)' : 'rgba(30,34,46,.4)'); c.fillText(lab.toUpperCase(), x, y + 52); }); c.restore(); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = (1 - f) * .4; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { D.ground(0); D.clearLayer(); person(540, 1080, 1.1, 1.3, 1, { flame: 1, lines: 1, shake: 0 }); heatWaves(540, 860, 300, 1.3, 1);
  [['Why do', C.ink], ['we', C.ink], ['shiver?', C.blue]].forEach(([w, col], i) => D.text(w, 540, 400 + i * 140, { f: 'sans', size: 140, wt: 800, col, align: 'center', track: -5 }));
  D.blit({}); D.hud(12.3, TOT, 0); };
window.seek(0); window.ready = true; window.READY = true;
