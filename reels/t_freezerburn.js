// t_freezerburn.js: "What is freezer burn?" in template #19 handdrawn "Sketch music" (demo 102), same module as zombieant. Canvas2D 1080x1920, pure function of t.
// Demo moves reused: one thin pencil line building every scene in real time (pen tip leads), pastel washes laid in after the line (here icy
// lavender -> powder blue -> peach), perspective lines to a vanishing point (the freezer's inside), glassy drops drifting over the drawing (here
// they are the ice turning to vapour and rising away), old-film grain/flicker/vignette, a copperplate script title, slow camera glide, dim ending.
// Batch N layout: drawings in y 300-1150, the handwritten karaoke caption re-set at y 1240-1400 (the kit's sits at 1715), nothing written in the
// top 250 px, the bottom 480 px or the right column below y 840.
import { createSM, W, H, TAU, P, clamp, lerp, ramp, ss, eo, hash, FONTS } from './styles/sketchmusic/sketchmusic.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const SM = createSM(document.getElementById('c')), g = SM.g, R = ramp, E = SM.ell;
const L = (pts, k, o = {}) => SM.line(pts, k, { ...o, lw: (o.lw || 3) * 1.5 });   // a slightly heavier pencil so it reads at phone size
const ICE = { sky0: '#b9c3e2', sky1: '#d4d6ea', sky2: '#efd6c6' }, BURN = 'rgba(150,125,110,1)', ICY = '#bcd3ea';

// ---------- props ----------
function steakPts(x, y, sc) { return SM.bez([x - 190 * sc, y], [x - 210 * sc, y - 150 * sc], [x + 120 * sc, y - 190 * sc], [x + 200 * sc, y - 40 * sc], 26).concat(SM.bez([x + 200 * sc, y - 40 * sc], [x + 250 * sc, y + 90 * sc], [x - 60 * sc, y + 140 * sc], [x - 190 * sc, y], 26)); }
function steak(x, y, sc, k, o = {}) { const pts = steakPts(x, y, sc); SM.wash(pts, o.col || P.rose, ss(R(k, .4, .6)), { op: .7 }); L(pts, k, { seed: o.seed || 10, lw: 3 });
  L(SM.bez([x - 150 * sc, y - 20 * sc], [x - 150 * sc, y - 120 * sc], [x + 60 * sc, y - 150 * sc], [x + 160 * sc, y - 40 * sc], 20), R(k, .3, .5), { seed: (o.seed || 10) + 1, lw: 2, a: .6 });
  const b = o.burn || 0; if (b > 0) [[-90, -60, 70, 40], [60, -20, 80, 50], [120, 50, 50, 30], [-40, 60, 60, 30]].forEach(([dx, dy, rx, ry], i) => { const kk = clamp(b * 1.6 - i * .2); if (kk <= 0) return;
    const pp = E(x + dx * sc, y + dy * sc, rx * sc * kk, ry * sc * kk, 22, 0, TAU, .3 * i); SM.wash(pp, BURN, kk, { op: .75 }); L(pp, kk, { seed: 30 + i, lw: 1.6, a: .55 }); }); }
function crystal(x, y, r, k, seed) { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; L([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], R(k, i * .2, .4), { seed: seed + i, lw: 2, col: '#5b6f99' }); } }
function vapor(t, x0, y0, w, k, n = 8) { for (let i = 0; i < n; i++) { const ph = (t * .35 + hash(i * 3.3)) % 1, x = x0 + hash(i * 1.9) * w + 18 * Math.sin(ph * 6 + i), y = y0 - ph * 340; SM.drop(x, y, 7 + 5 * hash(i), k * (1 - ph) * .9); } }
function freezer(k, o = {}) { const vx = 540, vy = 600; // the freezer's inside in perspective: walls run to a vanishing point, two shelves
  const box = [[90, 330], [990, 330], [990, 1140], [90, 1140]], inner = [[300, 470], [780, 470], [780, 900], [300, 900]];
  L([...box, box[0]], R(k, 0, .4), { seed: 100, lw: 3.2 }); L([...inner, inner[0]], R(k, .2, .4), { seed: 101, lw: 2 });
  box.forEach(([x, y], i) => L([[x, y], inner[i]], R(k, .3 + i * .05, .3), { seed: 102 + i, lw: 2 }));
  [700, 900].forEach((yy, i) => { const u = (yy - 330) / (1140 - 330); L([[90, yy + 60 * (i ? 1 : 0)], [300, 470 + (900 - 470) * u], [780, 470 + (900 - 470) * u], [990, yy + 60 * (i ? 1 : 0)]], R(k, .5 + i * .1, .4), { seed: 110 + i, lw: 2.2 }); });
  SM.wash([[300, 470], [780, 470], [780, 900], [300, 900]], ICY, ss(R(k, .5, .5)) * .6, { op: .5 }); }
function bag(x, y, w, h, k, squeeze = 0) { const sq = squeeze * 40, pts = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2 - sq, y + h / 2], [x - w / 2 + sq, y + h / 2]];
  SM.wash(pts, '#e6eef7', ss(R(k, .4, .6)), { op: .55 }); L([...pts, pts[0]], k, { seed: 200, lw: 2.8 }); L([[x - w / 2 + 14, y - h / 2 + 30], [x + w / 2 - 14, y - h / 2 + 30]], R(k, .5, .4), { seed: 201, lw: 2, col: P.red }); }
function tub(x, y, sc, k, o = {}) { const w = 170 * sc, h = 190 * sc, body = [[x - w, y - h], [x + w, y - h], [x + w * .85, y + h], [x - w * .85, y + h]];
  SM.wash(body, '#f3e3cf', ss(R(k, .4, .6)), { op: .7 }); L([...body, body[0]], k, { seed: 300, lw: 3 }); L(E(x, y - h, w, 30 * sc, 36), R(k, .2, .4), { seed: 301, lw: 2.4 });
  if (o.cream !== false) { const sc2 = E(x, y - h - 30 * sc, w * .8, 70 * sc, 30, Math.PI, TAU); SM.wash(sc2.concat([[x + w * .8, y - h - 30 * sc]]), '#f6d6dc', ss(R(k, .5, .5)), { op: .8 }); L(sc2, R(k, .3, .4), { seed: 302, lw: 2.4 }); }
  if (o.ice) for (let i = 0; i < 9; i++) crystal(x - w * .6 + (i % 3) * w * .6, y - h - 40 * sc - Math.floor(i / 3) * 26 * sc, 10 * sc, o.ice, 310 + i * 3);
  if (o.wrap) L([[x - w * .9, y - h - 8 * sc], [x - w * .3, y - h - 22 * sc], [x + w * .3, y - h - 20 * sc], [x + w * .9, y - h - 8 * sc]], o.wrap, { seed: 340, lw: 3.4, col: '#7fa3c9' });
  if (o.lid) { const ly = lerp(y - h - 220 * sc, y - h - 34 * sc, eo(o.lid)); L(E(x, ly, w * 1.04, 32 * sc, 36), 1, { seed: 350, lw: 3 }); SM.wash(E(x, ly, w * 1.04, 32 * sc, 36), P.lav, 1, { op: .5 }); } }
function thermo(x, y, k, lvl) { const tube = [[x - 30, y - 300], [x + 30, y - 300], [x + 30, y + 120], [x - 30, y + 120]]; L([...tube, tube[0]], k, { seed: 400, lw: 2.8 }); L(E(x, y + 170, 60, 60, 30), R(k, .3, .4), { seed: 401, lw: 2.8 });
  SM.wash(E(x, y + 170, 56, 56, 30), '#9cc0e6', ss(R(k, .5, .5)), { op: .8 }); SM.wash([[x - 22, y + 120], [x + 22, y + 120], [x + 22, y + 120 - 380 * lvl], [x - 22, y + 120 - 380 * lvl]], '#9cc0e6', ss(R(k, .5, .5)), { op: .8 });
  for (let i = 0; i < 6; i++) L([[x + 30, y - 260 + i * 70], [x + 60, y - 260 + i * 70]], R(k, .4, .3), { seed: 410 + i, lw: 1.6 }); }
// handwritten karaoke caption (the kit's caption, re-set for Batch N at y 1240-1400)
function caption(ph, t, out) { if (!ph) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; const a = clamp((t - ph.start + .2) / .25) * (out != null ? clamp((out - t) / .2) : 1); if (a <= 0) { g.restore(); return; }
  const size = 64; g.font = `${size}px "Caveat"`; const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  const tot = ws.reduce((s2, w) => s2 + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = g.measureText(w.w).width; });
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; ws.forEach(w => { if (lw + w.ww > 820 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const lh = size * 1.08, y0 = 1300 - (lines.length - 1) * lh / 2; g.globalAlpha = a * .72; g.filter = 'blur(14px)'; g.fillStyle = '#f3ede3'; g.fillRect(90, y0 - lh * .95, W - 180, lh * lines.length + 24); g.filter = 'none';
  lines.forEach((ln, li) => { const w = ln.reduce((s2, x) => s2 + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { const said = t >= wd.t0; g.globalAlpha = a * (said ? 1 : .42); g.fillStyle = wd.hl ? P.red : P.ink; g.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  g.restore(); }

// ---------- scenes ----------
function sceneA(t) { SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1 + .03 * ss(t / 4), 540, 760); freezer(1); steak(540, 830, 1.15, 1, { burn: .8 + .2 * ss(t / 3) });
  SM.reset(); SM.text('freezer burn', 540, 420, { f: 'script', size: 120, write: t < .02 ? 1 : 1 }); vapor(t, 380, 760, 320, 1, 7); }
function sceneB(t) { const t0 = s(1); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); steak(540, 800, 1.3, R(t, t0 - .2, 1.2), { burn: .9 }); SM.reset();
  SM.text('what is it?', 540, 440, { f: 'script', size: 110, write: R(t, t0, .8) }); }
function sceneC(t) { const t0 = s(2), cr = t > s(3) - .1; SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760);
  const lens = E(540, 720, 330, 330, 60, -Math.PI / 2, -Math.PI / 2 + TAU); SM.wash(lens, '#f1d2d4', ss(R(t, t0, .8)), { op: .5 }); L(lens, R(t, t0 - .2, 1), { seed: 500, lw: 3.4 }); L([[773, 953], [900, 1080]], R(t, t0 + .6, .4), { seed: 501, lw: 7 });
  for (let i = 0; i < 16; i++) { const x = 330 + (i % 4) * 140 + 30 * (Math.floor(i / 4) % 2), y = 540 + Math.floor(i / 4) * 120; crystal(x, y, 26, R(t, t0 + .4 + i * .08, .5), 510 + i * 3); }
  SM.reset(); SM.text('tiny ice crystals', 540, 360, { size: 80, write: R(t, t0 + .4, .8), col: '#4f6690' });
  if (cr) { for (let k = 0; k < 4; k++) { const y = 360 + k * 46, ph = (t * 2 + k) % 6; L(Array.from({ length: 14 }, (_, j) => [60 + j * 26, y + 8 * Math.sin(j * .9 + ph)]), R(t, s(3) + .2 + k * .1, .5), { seed: 520 + k, lw: 2, col: '#8a8fb0' }); }
    SM.text('dry air', 1010, 1110, { size: 76, write: R(t, s(3) + .6, .5), col: P.red, align: 'right' }); } }
function sceneD(t) { const t0 = s(4); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760);
  const surf = Array.from({ length: 30 }, (_, i) => [90 + i * 31, 900 + 10 * Math.sin(i * .7)]); L(surf, R(t, t0 - .2, .8), { seed: 600, lw: 3.2 }); SM.wash([...surf, [990, 1140], [90, 1140]], P.rose, ss(R(t, t0, .6)), { op: .6 });
  for (let i = 0; i < 7; i++) { const x = 160 + i * 120, u = clamp((t - t0 - .8 - i * .25) / 1.4), y = lerp(870, 470, eo(u)); if (u <= 0) crystal(x, 870, 22, 1, 610 + i * 3); else SM.drop(x + 10 * Math.sin(t * 2 + i), y, 13, 1 - u * .6); }
  L(SM.bez([180, 760], [180, 640], [180, 600], [180, 520], 8), R(t, t0 + 1.2, .5), { seed: 640, lw: 2.4 }); L([[166, 540], [180, 520], [194, 540]], R(t, t0 + 1.6, .2), { seed: 641, lw: 2.4 });
  SM.reset(); SM.text('ice → vapor', 540, 400, { size: 86, write: R(t, t0 + .4, .7), col: '#4f6690' }); SM.text('no melting', 760, 620, { size: 60, write: R(t, t0 + 2.4, .5), col: P.red });
  if (t > s(5) - .1) SM.text('sublimation', 540, 1060, { f: 'script', size: 110, write: R(t, s(5), .8) }); }
function sceneE(t) { const t0 = s(6), air = t > s(7) - .1; SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1 + .06 * R(t, t0, 8), 540, 760);
  steak(540, 760, 1.25, 1, { burn: R(t, t0 + .3, 2.6) }); vapor(t, 330, 700, 420, 1 - R(t, s(7), 1), 6);
  SM.reset(); SM.text('leathery', 260, 480, { size: 72, write: R(t, t0 + 1.8, .5), col: '#7a6458' }); SM.text('grayish, brown', 760, 1100, { size: 60, write: R(t, t0 + 3.0, .6), col: '#7a6458', align: 'right' });
  if (air) { for (let k = 0; k < 3; k++) { const y = 560 + k * 110; L(Array.from({ length: 10 }, (_, j) => [70 + j * 22 + R(t, s(7), 2) * 60, y + 10 * Math.sin(j + t * 3 + k)]), R(t, s(7) + .2 + k * .15, .5), { seed: 700 + k, lw: 2.2, col: '#7f8db4' }); }
    SM.text('air in', 150, 520, { size: 64, write: R(t, s(7) + .4, .5), col: '#4f6690' }); } }
function sceneF(t) { const t0 = s(8), dry = t > s(9) - .1; SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); steak(560, 820, 1.3, 1, { burn: 1 });
  const ck = R(t, t0 + 1.0, .5); L([[300, 540], [380, 620], [520, 440]], ck, { seed: 800, lw: 9, col: '#5f8f5a' }); SM.reset(); SM.text('safe', 620, 560, { size: 96, write: R(t, t0 + 1.2, .4), col: '#5f8f5a' });
  SM.text('quality ↓', 540, 380, { size: 70, write: R(t, t0 + 2.4, .5), col: P.red });
  if (dry) { SM.cam(1, 540, 760); for (let k = 0; k < 4; k++) L([[330 + k * 110, 1060], [350 + k * 110, 1020], [330 + k * 110, 990]], R(t, s(9) + .2 + k * .1, .3), { seed: 810 + k, lw: 2.4, col: '#7a6458' }); SM.reset(); SM.text('dry + tough', 540, 1110, { size: 66, write: R(t, s(9) + .4, .5) }); } }
function sceneG(t) { const t0 = s(10); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); tub(540, 840, 1.25, R(t, t0 - .2, 1.2), { ice: R(t, t0 + 2.2, 1.4) });
  SM.reset(); SM.text('ice cream too', 540, 400, { size: 80, write: R(t, t0 + .3, .6) }); SM.text('crunchy crystals', 540, 1100, { size: 60, write: R(t, t0 + 3.0, .6), col: '#4f6690' }); }
function sceneH(t) { const t0 = s(11), fix = t > s(12) - .1; SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); SM.reset(); SM.text('keep the air out', 540, 400, { f: 'script', size: 100, write: R(t, t0 + .2, .9) }); SM.cam(1, 540, 760);
  if (!fix) { bag(540, 760, 620, 480, R(t, t0, 1)); steak(540, 790, .95, 1, { burn: 0, seed: 40 }); for (let i = 0; i < 4; i++) SM.drop(380 + i * 110, 640 + 20 * Math.sin(t * 2 + i), 10, .6); }
  else { const sq = ss(R(t, s(12) + .6, 1.4)); bag(380, 760, lerp(420, 330, sq), lerp(380, 300, sq), 1, sq); steak(380, 780, .55, 1, { seed: 41 });
    for (let i = 0; i < 3; i++) SM.drop(380 + (i - 1) * 60, 700 - sq * 200 - i * 20, 9, (1 - sq) * .8);
    const cb = [[640, 860], [920, 860], [920, 1080], [640, 1080]]; const ck = R(t, s(12) + 2.6, 1); SM.wash(cb, '#e6eef7', ck, { op: .6 }); L([...cb, cb[0]], ck, { seed: 900, lw: 2.8 }); SM.reset();
    SM.text('squeeze', 380, 1110, { size: 56, write: R(t, s(12) + 1.0, .4), col: P.red }); SM.text('small', 780, 820, { size: 56, write: R(t, s(12) + 3.0, .4), col: '#4f6690' }); } }
function sceneI(t) { const t0 = s(13); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); freezer(R(t, t0 - .3, 1)); steak(720, 860, .55, 1, { seed: 44 }); thermo(380, 700, R(t, t0 - .2, 1.2), .25);
  SM.reset(); SM.text('0°F', 640, 640, { size: 130, write: R(t, t0 + .8, .5), col: '#4f6690' }); SM.text('or colder', 640, 740, { size: 60, write: R(t, t0 + 1.6, .5) }); }
function sceneJ(t) { const t0 = s(14); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); tub(540, 860, 1.2, 1, { wrap: R(t, t0 + .8, 1.2), lid: R(t, t0 + 2.6, .8) });
  SM.reset(); SM.text('wrap on top', 540, 400, { size: 80, write: R(t, t0 + .5, .6) }); SM.text('then the lid', 540, 490, { size: 64, write: R(t, t0 + 2.6, .5), col: '#4f6690' }); }
function sceneK(t) { const t0 = s(15); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); bag(540, 760, 620, 480, 1, .4); steak(540, 790, .95, 1, { seed: 42 });
  SM.reset(); ['no air', 'no sublimation', 'no freezer burn'].forEach((w, i) => SM.text(w, 540, 380 + i * 70 + (i === 2 ? 760 : 0), { size: i === 2 ? 88 : 64, write: R(t, t0 + i * .7, .5), col: i === 2 ? P.red : P.ink, f: i === 2 ? 'script' : undefined })); }
function sceneL(t) { const t0 = s(16); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); steak(540, 920, .9, 1, { burn: .8 }); SM.reset();
  SM.text('found some?', 540, 420, { f: 'script', size: 110, write: R(t, t0, .8) });
  [['yes', 330], ['no', 750]].forEach(([w, x], i) => { const k = R(t, t0 + .9 + i * .3, .5); SM.cam(1, 540, 760); L(E(x, 620, 120, 70, 36, -Math.PI / 2, -Math.PI / 2 + TAU), k, { seed: 950 + i, lw: 3 }); SM.reset(); SM.text(w, x, 645, { size: 80, write: R(k, .4, .6), col: i ? '#4f6690' : P.red }); }); }
function sceneM(t) { const t0 = s(17); SM.begin(t, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); steak(540, 900, 1.0, R(t, t0 + .4, 1), { burn: .6 }); SM.reset(); vapor(t, 400, 880, 280, 1, 5); SM.cam(1, 540, 760);
  SM.reset(); SM.text('Follow for more of', 540, 400, { size: 76, write: R(t, t0 - .1, .6) }); SM.text('how it really works.', 540, 500, { f: 'script', size: 96, write: R(t, t0 + .4, .8), col: P.red });
  SM.text("A new 'wait, really?' every day.", 540, 590, { size: 54, write: R(t, t0 + .9, .6) }); SM.text('@howitreallyworkstudio', 540, 660, { size: 50, write: R(t, t0 + 1.2, .6), col: '#4f6690' }); }

const SC = [[0, sceneA], [s(1) - .3, sceneB], [s(2) - .3, sceneC], [s(4) - .3, sceneD], [s(6) - .3, sceneE], [s(8) - .3, sceneF], [s(10) - .3, sceneG], [s(11) - .3, sceneH], [s(13) - .3, sceneI], [s(14) - .3, sceneJ], [s(15) - .3, sceneK], [s(16) - .3, sceneL], [s(17) - .35, sceneM]];
function scene(t) { let i = 0; SC.forEach((c, k) => { if (t >= c[0]) i = k; }); const u = R(t, SC[i][0], .4);
  SC[i][1](t); SM.reset();
  if (i > 0 && u < 1) { g.save(); g.globalAlpha = (1 - ss(u)) * .5; g.fillStyle = '#ece5da'; g.fillRect(0, 0, W, H); g.restore(); } }   // a soft paper dissolve into the new drawing (never a blank frame)
window.DUR = TOT;
window.seek = t => { scene(t); SM.finish(t, { dark: .32 * ss(R(t, TOT - .5, .5)) }); const ph = PH.findLast(p => t >= p.start - .25); if (ph && ph.i < PH.length - 1) caption(ph, t, PH[ph.i + 1].start - .2); };
window.render = window.seek;
window.thumb = () => { SM.begin(2, { hz: 1150, ...ICE }); SM.cam(1, 540, 760); freezer(1); steak(540, 820, .9, 1, { burn: 1 }); SM.reset(); vapor(2, 380, 760, 320, 1, 7);
  SM.text('freezer burn', 540, 400, { f: 'script', size: 130 }); SM.text("isn't a burn", 540, 1110, { size: 96, col: P.red }); SM.finish(2); };
window.seek(0); window.ready = true; window.READY = true;
