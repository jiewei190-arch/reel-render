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
const L = (pts, k, o = {}) => SM.line(pts, k, { ...o, lw: (o.lw || 3) * 2.1, col: o.col || '#231f2a' });   // v2: a darker, heavier pencil (closer to the demo's punch)
const WSH = (pts, col, a, o = {}) => SM.wash(pts, col, a, { ...o, op: Math.min(1, (o.op ?? .62) * 1.35) });
const ICE = { sky0: '#b9c3e2', sky1: '#d4d6ea', sky2: '#efd6c6' }, BURN = 'rgba(150,125,110,1)', ICY = '#bcd3ea';

// ---------- props ----------
function steakPts(x, y, sc) { return SM.bez([x - 190 * sc, y], [x - 210 * sc, y - 150 * sc], [x + 120 * sc, y - 190 * sc], [x + 200 * sc, y - 40 * sc], 26).concat(SM.bez([x + 200 * sc, y - 40 * sc], [x + 250 * sc, y + 90 * sc], [x - 60 * sc, y + 140 * sc], [x - 190 * sc, y], 26)); }
function steak(x, y, sc, k, o = {}) { const pts = steakPts(x, y, sc); WSH(pts, o.col || P.rose, ss(R(k, .4, .6)), { op: .7 }); L(pts, k, { seed: o.seed || 10, lw: 3 });
  L(SM.bez([x - 150 * sc, y - 20 * sc], [x - 150 * sc, y - 120 * sc], [x + 60 * sc, y - 150 * sc], [x + 160 * sc, y - 40 * sc], 20), R(k, .3, .5), { seed: (o.seed || 10) + 1, lw: 2, a: .6 });
  const b = o.burn || 0; if (b > 0) [[-90, -60, 70, 40], [60, -20, 80, 50], [120, 50, 50, 30], [-40, 60, 60, 30]].forEach(([dx, dy, rx, ry], i) => { const kk = clamp(b * 1.6 - i * .2); if (kk <= 0) return;
    const pp = E(x + dx * sc, y + dy * sc, rx * sc * kk, ry * sc * kk, 22, 0, TAU, .3 * i); WSH(pp, BURN, kk, { op: .75 }); L(pp, kk, { seed: 30 + i, lw: 1.6, a: .55 }); }); }
function crystal(x, y, r, k, seed) { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; L([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], R(k, i * .2, .4), { seed: seed + i, lw: 2, col: '#5b6f99' }); } }
function vapor(t, x0, y0, w, k, n = 8) { for (let i = 0; i < n; i++) { const ph = (t * .35 + hash(i * 3.3)) % 1, x = x0 + hash(i * 1.9) * w + 18 * Math.sin(ph * 6 + i), y = y0 - ph * 340; SM.drop(x, y, 7 + 5 * hash(i), k * (1 - ph) * .9); } }
function freezer(k, o = {}) { const vx = 540, vy = 600; // the freezer's inside in perspective: walls run to a vanishing point, two shelves
  const box = [[90, 330], [990, 330], [990, 1140], [90, 1140]], inner = [[300, 470], [780, 470], [780, 900], [300, 900]];
  L([...box, box[0]], R(k, 0, .4), { seed: 100, lw: 3.2 }); L([...inner, inner[0]], R(k, .2, .4), { seed: 101, lw: 2 });
  box.forEach(([x, y], i) => L([[x, y], inner[i]], R(k, .3 + i * .05, .3), { seed: 102 + i, lw: 2 }));
  [700, 900].forEach((yy, i) => { const u = (yy - 330) / (1140 - 330); L([[90, yy + 60 * (i ? 1 : 0)], [300, 470 + (900 - 470) * u], [780, 470 + (900 - 470) * u], [990, yy + 60 * (i ? 1 : 0)]], R(k, .5 + i * .1, .4), { seed: 110 + i, lw: 2.2 }); });
  WSH([[300, 470], [780, 470], [780, 900], [300, 900]], ICY, ss(R(k, .5, .5)) * .6, { op: .5 }); }
function bag(x, y, w, h, k, squeeze = 0) { const sq = squeeze * 40, pts = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2 - sq, y + h / 2], [x - w / 2 + sq, y + h / 2]];
  WSH(pts, '#e6eef7', ss(R(k, .4, .6)), { op: .55 }); L([...pts, pts[0]], k, { seed: 200, lw: 2.8 }); L([[x - w / 2 + 14, y - h / 2 + 30], [x + w / 2 - 14, y - h / 2 + 30]], R(k, .5, .4), { seed: 201, lw: 2, col: P.red }); }
function tub(x, y, sc, k, o = {}) { const w = 170 * sc, h = 190 * sc, body = [[x - w, y - h], [x + w, y - h], [x + w * .85, y + h], [x - w * .85, y + h]];
  WSH(body, '#f3e3cf', ss(R(k, .4, .6)), { op: .7 }); L([...body, body[0]], k, { seed: 300, lw: 3 }); L(E(x, y - h, w, 30 * sc, 36), R(k, .2, .4), { seed: 301, lw: 2.4 });
  if (o.cream !== false) { const sc2 = E(x, y - h - 30 * sc, w * .8, 70 * sc, 30, Math.PI, TAU); WSH(sc2.concat([[x + w * .8, y - h - 30 * sc]]), '#f6d6dc', ss(R(k, .5, .5)), { op: .8 }); L(sc2, R(k, .3, .4), { seed: 302, lw: 2.4 }); }
  if (o.ice) for (let i = 0; i < 9; i++) crystal(x - w * .6 + (i % 3) * w * .6, y - h - 40 * sc - Math.floor(i / 3) * 26 * sc, 10 * sc, o.ice, 310 + i * 3);
  if (o.wrap) L([[x - w * .9, y - h - 8 * sc], [x - w * .3, y - h - 22 * sc], [x + w * .3, y - h - 20 * sc], [x + w * .9, y - h - 8 * sc]], o.wrap, { seed: 340, lw: 3.4, col: '#7fa3c9' });
  if (o.lid) { const ly = lerp(y - h - 220 * sc, y - h - 34 * sc, eo(o.lid)); L(E(x, ly, w * 1.04, 32 * sc, 36), 1, { seed: 350, lw: 3 }); WSH(E(x, ly, w * 1.04, 32 * sc, 36), P.lav, 1, { op: .5 }); } }
function thermo(x, y, k, lvl, sc = 1) { g.save(); g.translate(x, y); g.scale(sc, sc); x = 0; y = 0; const tube = [[x - 30, y - 300], [x + 30, y - 300], [x + 30, y + 120], [x - 30, y + 120]]; L([...tube, tube[0]], k, { seed: 400, lw: 2.8 }); L(E(x, y + 170, 60, 60, 30), R(k, .3, .4), { seed: 401, lw: 2.8 });
  WSH(E(x, y + 170, 56, 56, 30), '#9cc0e6', ss(R(k, .5, .5)), { op: .8 }); WSH([[x - 22, y + 120], [x + 22, y + 120], [x + 22, y + 120 - 380 * lvl], [x - 22, y + 120 - 380 * lvl]], '#9cc0e6', ss(R(k, .5, .5)), { op: .8 });
  for (let i = 0; i < 6; i++) L([[x + 30, y - 260 + i * 70], [x + 60, y - 260 + i * 70]], R(k, .4, .3), { seed: 410 + i, lw: 1.6 }); g.restore(); }
function sparkle(x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 12; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.moveTo(x - r * .5, y - r * .5); g.lineTo(x + r * .5, y + r * .5); g.moveTo(x + r * .5, y - r * .5); g.lineTo(x - r * .5, y + r * .5); g.stroke(); g.restore(); }
function frostyPack(t, k = 1, o = {}) { const box = [[150, 470], [930, 430], [960, 1110], [120, 1130]];   // a big frosted freezer package: steak inside, frost and crystals on top
  WSH(box, '#cfe0f2', ss(R(k, .2, .6)), { op: .7 }); L([...box, box[0]], k, { seed: 1000, lw: 3.2 }); L([[150, 540], [930, 500]], R(k, .3, .4), { seed: 1001, lw: 2, col: P.red });
  steak(540, 820, 1.55, 1, { burn: o.burn ?? .9 });
  for (let i = 0; i < 26; i++) { const x = 170 + hash(i * 3.1) * 740, y = 560 + hash(i * 5.7) * 520, rr2 = 10 + 14 * hash(i * 2.2); crystal(x, y, rr2, R(k, .4 + hash(i) * .4, .3), 1010 + i * 3); sparkle(x, y, rr2 * 1.3, Math.max(0, Math.sin(t * 2.4 + i * 1.7)) * .9); }
  WSH([[150, 470], [930, 430], [940, 600], [140, 640]], '#ffffff', ss(R(k, .5, .5)) * .55, { op: .6 }); }
// handwritten karaoke caption (the kit's caption, re-set for Batch N at y 1240-1400)
function caption(ph, t, out) { if (!ph) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; const a = clamp((t - ph.start + .2) / .25) * (out != null ? clamp((out - t) / .2) : 1); if (a <= 0) { g.restore(); return; }
  const size = 64; g.font = `${size}px "Caveat"`; const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  const tot = ws.reduce((s2, w) => s2 + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = g.measureText(w.w).width; });
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; ws.forEach(w => { if (lw + w.ww > 820 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const lh = size * 1.08, y0 = 1300 - (lines.length - 1) * lh / 2; g.globalAlpha = a * .72; g.filter = 'blur(14px)'; g.fillStyle = '#f3ede3'; g.fillRect(90, y0 - lh * .95, W - 180, lh * lines.length + 24); g.filter = 'none';
  lines.forEach((ln, li) => { const w = ln.reduce((s2, x) => s2 + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { const said = t >= wd.t0; g.globalAlpha = a * (said ? 1 : .42); g.fillStyle = wd.hl ? P.red : P.ink; g.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  g.restore(); }

// ---------- scenes (v2: identity camera, everything sized to fill y 350-1150) ----------
const BG = t => { SM.begin(t, { hz: 1180, ...ICE }); SM.cam(1, 540, 960); };
function sceneA(t) { BG(t); SM.cam(1 + .02 * ss(t / 4), 540, 960); frostyPack(t, 1); vapor(t, 330, 700, 420, 1, 9); SM.reset(); SM.text('freezer burn', 540, 395, { f: 'script', size: 130 }); }
function sceneB(t) { const t0 = s(1); BG(t); steak(540, 800, 2.1, R(t, t0 - .2, 1.2), { burn: .9 }); vapor(t, 300, 700, 480, 1, 7); SM.text('what is it?', 540, 400, { f: 'script', size: 120, write: R(t, t0, .8) }); }
function sceneC(t) { const t0 = s(2), cr = t > s(3) - .1; BG(t);
  const lens = E(540, 760, 390, 390, 60, -Math.PI / 2, -Math.PI / 2 + TAU); WSH(lens, '#f1c7cb', ss(R(t, t0, .8)), { op: .6 }); L(lens, R(t, t0 - .2, 1), { seed: 500, lw: 3.4 }); L([[815, 1035], [930, 1140]], R(t, t0 + .6, .4), { seed: 501, lw: 7 });
  for (let i = 0; i < 16; i++) { const x = 300 + (i % 4) * 160 + 40 * (Math.floor(i / 4) % 2) - 20, y = 520 + Math.floor(i / 4) * 160; crystal(x, y, 42, R(t, t0 + .4 + i * .08, .5), 510 + i * 3); sparkle(x, y, 30, Math.max(0, Math.sin(t * 2 + i)) * .8); }
  SM.text('tiny ice crystals', 540, 330, { size: 86, write: R(t, t0 + .4, .8), col: '#3f5682' });
  if (cr) { for (let k = 0; k < 5; k++) { const y = 420 + k * 150, ph = t * 2 + k; L(Array.from({ length: 40 }, (_, j) => [20 + j * 27, y + 14 * Math.sin(j * .5 + ph)]), R(t, s(3) + .1 + k * .1, .6), { seed: 520 + k, lw: 2.4, col: '#6d7398' }); }
    SM.text('dry air', 540, 1120, { size: 96, write: R(t, s(3) + .5, .5), col: P.red }); } }
function sceneD(t) { const t0 = s(4); BG(t);
  const surf = Array.from({ length: 30 }, (_, i) => [30 + i * 35, 960 + 14 * Math.sin(i * .7)]); WSH([...surf, [1060, 1160], [30, 1160]], P.rose, ss(R(t, t0, .6)), { op: .85 }); L(surf, R(t, t0 - .2, .8), { seed: 600, lw: 3.2 });
  for (let i = 0; i < 7; i++) { const x = 120 + i * 140, u = clamp((t - t0 - .6 - i * .22) / 1.6), y = lerp(930, 420, eo(u)); if (u <= 0) crystal(x, 930, 34, 1, 610 + i * 3); else SM.drop(x + 12 * Math.sin(t * 2 + i), y, 20, 1 - u * .5); }
  for (let a = 0; a < 3; a++) { const x = 200 + a * 340, k = R(t, t0 + 1.0 + a * .3, .7); L([[x, 880], [x, 470]], k, { seed: 640 + a, lw: 3 }); L([[x - 26, 500], [x, 462], [x + 26, 500]], R(k, .9, .1), { seed: 650 + a, lw: 3 }); }
  SM.text('ice → vapor', 540, 380, { size: 96, write: R(t, t0 + .3, .7), col: '#3f5682' }); SM.text('no melting', 860, 700, { size: 64, write: R(t, t0 + 2.4, .5), col: P.red });
  if (t > s(5) - .1) SM.text('sublimation', 540, 1100, { f: 'script', size: 120, write: R(t, s(5), .8) }); }
function sceneE(t) { const t0 = s(6), air = t > s(7) - .1; BG(t); SM.cam(1 + .05 * R(t, t0, 9), 540, 960);
  steak(540, 780, 2.0, 1, { burn: R(t, t0 + .3, 2.6) }); vapor(t, 300, 700, 480, 1 - R(t, s(7), 1), 7); SM.reset();
  SM.text('leathery', 300, 440, { size: 90, write: R(t, t0 + 1.8, .5), col: '#6b5246' }); SM.text('grayish, brown', 1000, 1110, { size: 70, write: R(t, t0 + 3.0, .6), col: '#6b5246', align: 'right' });
  if (air) { for (let k = 0; k < 4; k++) { const y = 520 + k * 120; L(Array.from({ length: 14 }, (_, j) => [20 + j * 24 + R(t, s(7), 2) * 80, y + 12 * Math.sin(j + t * 3 + k)]), R(t, s(7) + .2 + k * .15, .5), { seed: 700 + k, lw: 2.4, col: '#5a6a96' }); }
    SM.text('air in', 160, 480, { size: 76, write: R(t, s(7) + .4, .5), col: '#3f5682' }); } }
function sceneF(t) { const t0 = s(8), dry = t > s(9) - .1; BG(t); steak(560, 850, 1.75, 1, { burn: 1 });
  L([[180, 520], [300, 640], [520, 400]], R(t, t0 + 1.0, .5), { seed: 800, lw: 12, col: '#3f7a3a' }); SM.text('safe', 680, 520, { size: 130, write: R(t, t0 + 1.2, .4), col: '#3f7a3a' });
  SM.text('quality ↓', 540, 380, { size: 84, write: R(t, t0 + 2.4, .5), col: P.red });
  if (dry) { for (let k = 0; k < 5; k++) L([[260 + k * 130, 1130], [290 + k * 130, 1080], [260 + k * 130, 1040]], R(t, s(9) + .2 + k * .1, .3), { seed: 810 + k, lw: 2.6, col: '#6b5246' }); SM.text('dry + tough', 820, 700, { size: 80, write: R(t, s(9) + .4, .5) }); } }
function sceneG(t) { const t0 = s(10); BG(t); tub(540, 900, 1.6, R(t, t0 - .2, 1.2), { ice: R(t, t0 + 2.2, 1.4) }); for (let i = 0; i < 6; i++) sparkle(300 + i * 95, 470 - (i % 2) * 30, 22, Math.max(0, Math.sin(t * 2 + i)) * R(t, t0 + 2.4, .6));
  SM.text('ice cream too', 540, 360, { size: 90, write: R(t, t0 + .3, .6) }); SM.text('crunchy crystals', 540, 1150, { size: 66, write: R(t, t0 + 3.0, .6), col: '#3f5682' }); }
function sceneH(t) { const t0 = s(11), fix = t > s(12) - .1; BG(t); SM.text('keep the air out', 540, 400, { f: 'script', size: 110, write: R(t, t0 + .2, .9) });
  if (!fix) { bag(540, 800, 820, 620, R(t, t0, 1)); steak(540, 840, 1.4, 1, { burn: 0, seed: 40 }); for (let i = 0; i < 6; i++) SM.drop(250 + i * 115, 620 + 24 * Math.sin(t * 2 + i), 14, .7); }
  else { const sq = ss(R(t, s(12) + .6, 1.4)); bag(360, 800, lerp(560, 440, sq), lerp(560, 440, sq), 1, sq); steak(360, 830, .85, 1, { seed: 41 });
    for (let i = 0; i < 3; i++) SM.drop(360 + (i - 1) * 90, 700 - sq * 260 - i * 24, 14, (1 - sq) * .85);
    const cb = [[690, 820], [1000, 820], [1000, 1110], [690, 1110]], cb2 = [[730, 560], [960, 560], [960, 780], [730, 780]], ck = R(t, s(12) + 2.6, 1);
    [cb, cb2].forEach((c, i) => { WSH(c, '#dbe7f4', ck, { op: .7 }); L([...c, c[0]], ck, { seed: 900 + i, lw: 3 }); });
    SM.text('squeeze', 360, 1150, { size: 66, write: R(t, s(12) + 1.0, .4), col: P.red }); SM.text('small', 845, 520, { size: 64, write: R(t, s(12) + 3.0, .4), col: '#3f5682' }); } }
function sceneI(t) { const t0 = s(13); BG(t); freezer(R(t, t0 - .3, 1)); thermo(330, 760, R(t, t0 - .2, 1.2), .25, 1.6);
  SM.text('0°F', 740, 680, { size: 170, write: R(t, t0 + .8, .5), col: '#3f5682' }); SM.text('or colder', 740, 800, { size: 76, write: R(t, t0 + 1.6, .5) }); }
function sceneJ(t) { const t0 = s(14); BG(t); tub(540, 900, 1.6, 1, { wrap: R(t, t0 + .8, 1.2), lid: R(t, t0 + 2.6, .8) });
  SM.text('wrap on top', 540, 380, { size: 90, write: R(t, t0 + .5, .6) }); SM.text('then the lid', 540, 1150, { size: 72, write: R(t, t0 + 2.6, .5), col: '#3f5682' }); }
function sceneK(t) { const t0 = s(15); BG(t); bag(540, 820, 820, 560, 1, .3); steak(540, 850, 1.45, 1, { seed: 42 });
  ['no air', 'no sublimation'].forEach((w, i) => SM.text(w, 540, 360 + i * 80, { size: 76, write: R(t, t0 + i * .7, .5) })); SM.text('no freezer burn', 540, 1150, { f: 'script', size: 100, write: R(t, t0 + 1.4, .7), col: P.red }); }
function sceneL(t) { const t0 = s(16); BG(t); steak(540, 900, 1.6, 1, { burn: .8 }); SM.text('found some?', 540, 390, { f: 'script', size: 120, write: R(t, t0, .8) });
  [['yes', 300], ['no', 780]].forEach(([w, x], i) => { const k = R(t, t0 + .9 + i * .3, .5); L(E(x, 580, 150, 86, 36, -Math.PI / 2, -Math.PI / 2 + TAU), k, { seed: 950 + i, lw: 3 }); SM.text(w, x, 610, { size: 96, write: R(k, .4, .6), col: i ? '#3f5682' : P.red }); }); }
function sceneM(t) { const t0 = s(17); BG(t); g.save(); g.translate(0, 50); frostyPack(t, R(t, t0, 1.2), { burn: .6 }); g.restore();
  SM.text('Follow for more of', 540, 330, { size: 80, write: R(t, t0 - .1, .6) }); SM.text('how it really works.', 540, 418, { f: 'script', size: 100, write: R(t, t0 + .4, .8), col: P.red });
  g.save(); g.fillStyle = 'rgba(243,237,227,.85)'; g.filter = 'blur(10px)'; g.fillRect(170, 1190, 740, 150); g.restore();
  SM.text("A new 'wait, really?' every day.", 540, 1245, { size: 58, write: R(t, t0 + .9, .6) }); SM.text('@howitreallyworkstudio', 540, 1315, { size: 54, write: R(t, t0 + 1.2, .6), col: '#3f5682' }); }

const SC = [[0, sceneA], [s(1) - .3, sceneB], [s(2) - .3, sceneC], [s(4) - .3, sceneD], [s(6) - .3, sceneE], [s(8) - .3, sceneF], [s(10) - .3, sceneG], [s(11) - .3, sceneH], [s(13) - .3, sceneI], [s(14) - .3, sceneJ], [s(15) - .3, sceneK], [s(16) - .3, sceneL], [s(17) - .35, sceneM]];
function scene(t) { let i = 0; SC.forEach((c, k) => { if (t >= c[0]) i = k; }); const u = R(t, SC[i][0], .4);
  SC[i][1](t); SM.reset();
  if (i > 0 && u < 1) { g.save(); g.globalAlpha = (1 - ss(u)) * .5; g.fillStyle = '#ece5da'; g.fillRect(0, 0, W, H); g.restore(); } }   // a soft paper dissolve into the new drawing (never a blank frame)
window.DUR = TOT;
window.seek = t => { scene(t); SM.finish(t, { dark: .32 * ss(R(t, TOT - .5, .5)) }); const ph = PH.findLast(p => t >= p.start - .25); if (ph && ph.i < PH.length - 1) caption(ph, t, PH[ph.i + 1].start - .2); };
window.render = window.seek;
window.thumb = () => { SM.begin(2, { hz: 1180, ...ICE }); SM.cam(1, 540, 960); frostyPack(2, 1); vapor(2, 330, 700, 420, 1, 9); SM.reset();
  SM.text('freezer burn', 540, 400, { f: 'script', size: 140 }); SM.text("isn't a burn", 540, 1240, { size: 110, col: P.red }); SM.finish(2); };
window.seek(0); window.ready = true; window.READY = true;
