// t_ovenfoil.js: "Why does aluminum foil have a shiny side and a dull side?" in the Blueprint style (template #3,
// lemo-opuscar/styles/blueprint grammar, via styles/blueprint like the approved lock reel). 1080x1920 Canvas2D, pure function of t.
// White line work on the cyanotype sheet, drafting order with a glowing nib, dimension lines, balloons, callouts, FIG numbers
// as transitions, a title block whose STATUS carries the verdict, double-ruled NOTE subtitles, ONE red stamp (EITHER SIDE).
// Batch N layout: the sheet furniture is re-laid inside the safe band: header y 280-420, figure window y 440-1000,
// title block y 1010-1138, NOTE box y 1150-1425 (x 100-900); the bottom band carries a drawing only (a foil roll, no text).
import { createBP, W, H, VP, DASH, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/blueprint/blueprint.js';
await Promise.all(['700 40px "Caveat"', '600 20px "Poppins"', '800 40px "Poppins"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const B = createBP(document.getElementById('c')), g = B.g;
const R = (t, t0, d) => ramp(t, t0, d);
VP.y = 440; VP.h = 560;                              // figure window inside the Batch N safe band
const VCY = VP.y + VP.h / 2;

// ---------- figure schedule (FIG number = transition) ----------
const FIGS = [[0, 'FIG. 1', 'TWO FACES'], [s(2) - .3, 'FIG. 2', 'ROLLING MILL'], [s(5) - .3, 'FIG. 3', 'DOUBLE ROLLING'], [s(9) - .3, 'FIG. 4', 'MILL SPEED'], [s(10) - .3, 'FIG. 5', 'IN THE OVEN'], [s(14) - .3, 'FIG. 6', 'THE FINGERPRINT']];
const figAt = t => { let i = 0; FIGS.forEach((f, k) => { if (t >= f[0]) i = k; }); return i; };
// camera per figure (sheet coords centred on (540, VCY) at z = 1)
function camAt(t) { const i = figAt(t);
  if (i === 2) { const z = lerp(1, 2.3, ss(R(t, s(6) - .2, 1.0))) * (1 - ss(R(t, s(8) - .2, .8))) + ss(R(t, s(8) - .2, .8)); return [lerp(540, 470, ss(R(t, s(6) - .2, 1.0)) * (1 - ss(R(t, s(8) - .2, .8)))), VCY, z]; }
  if (i === 0) { const k = ss(R(t, s(1) + .2, 1.2)); return [lerp(540, 660, k), lerp(VCY, 790, k), lerp(1, 1.9, k)]; }   // push in on the edge by the but-turn
  return [540, VCY, 1]; }

// ---------- helpers ----------
const circPts = (cx, cy, r, n = 48) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * r, cy + Math.sin(i / n * Math.PI * 2) * r]);
const tint = (pts, a) => { g.save(); g.globalAlpha = B.S.A * a; g.fillStyle = '#E7F0F9'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); };
function callout(txt, x, y, tx, ty, k, o = {}) { if (k <= .02) return; const size = o.size || 34, w = B.measure(txt, size) + 30, h = size * 1.3, lk = ss(clamp(k * 1.5));
  if (tx != null) { const by = y + (ty > y ? h / 2 : -h / 2); B.line(x, by, lerp(x, tx, lk), lerp(by, ty, lk), { w: 1.4, nib: false }); if (lk >= 1) { g.save(); g.globalAlpha = B.S.A; g.fillStyle = C.ink; g.beginPath(); g.arc(tx, ty, 4.5 * B.S.k, 0, 7); g.fill(); g.restore(); } }
  B.paper([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], .96); B.rect(x - w / 2, y - h / 2, w, h, { w: 1.6, nib: false, draw: clamp(k * 2) }); B.txt(txt, x, y + 2, { size, align: 'center', write: R(k, .3, .6) }); }
const co = (t, txt, x, y, tx, ty, t0, t1, o) => callout(txt, x, y, tx, ty, R(t, t0, .45) * (1 - R(t, t1, .3)), o);
// a work roll: circle with centre marks, rotating spokes (on ones), bearing chock
function roll(cx, cy, r, ang, k = 1) { B.paper(circPts(cx, cy, r), .9); B.circ(cx, cy, r, { w: 3, draw: k }); B.circ(cx, cy, r * .22, { w: 1.6, draw: k, nib: false });
  B.line(cx - r - 26, cy, cx + r + 26, cy, { w: 1, dash: DASH.centre, alpha: .7, nib: false, draw: k }); B.line(cx, cy - r - 26, cx, cy + r + 26, { w: 1, dash: DASH.centre, alpha: .7, nib: false, draw: k });
  for (let j = 0; j < 4; j++) { const a = ang + j * Math.PI / 2; B.line(cx + Math.cos(a) * r * .3, cy + Math.sin(a) * r * .3, cx + Math.cos(a) * r * .85, cy + Math.sin(a) * r * .85, { w: 1.4, nib: false, alpha: .7 * k }); } }
// a strip of metal along y (top..bottom thickness th), from x0 to x1; rough = jagged top face
function strip(x0, x1, yTop, th, o = {}) { const { k = 1, hatch = true, roughTop = false, roughBot = false, alpha = 1 } = o; if (k <= 0) return; const xe = lerp(x0, x1, ss(k)), top = [], bot = [];
  for (let x = x0; x <= xe; x += 6) { top.push([x, yTop + (roughTop ? (hash(x * .37) - .5) * 5 : 0)]); bot.push([x, yTop + th + (roughBot ? (hash(x * .53) - .5) * 5 : 0)]); }
  const poly = top.concat(bot.slice().reverse()); B.paper(poly, .95); if (hatch) B.hatch(poly, { sp: 9, alpha: .35 * alpha }); B.poly(top, { w: 2.2, nib: false, alpha }); B.poly(bot, { w: 2.2, nib: false, alpha }); }

// ---------- figures ----------
function fig1(t) {   // two faces of a sheet of foil, in isometric; the faces are labelled; heat arrows on both with a "?"
  const a = 1 - R(t, s(2) - .3, .3); if (a <= 0) return; B.alpha(B.S.A * a);
  const P = [[260, 620], [700, 560], [860, 760], [420, 830]]; const wav = p => p.map(([x, y], i) => [x, y + Math.sin(t * 2.2 + i * 1.3) * 10]);
  const top = wav(P); B.paper(top, .95); B.poly(top, { w: 2.6, close: true }); tint(top, .14);
  { const gx = ((t * .45) % 1.4 - .2), Q = [0, 1, 2, 3].map(i => top[i]); const band = [.0, .12].map(o => [lerp(Q[0][0], Q[1][0], gx + o), lerp(Q[0][1], Q[1][1], gx + o)]).concat([.12, .0].map(o => [lerp(Q[3][0], Q[2][0], gx + o - .1), lerp(Q[3][1], Q[2][1], gx + o - .1)])); g.save(); g.beginPath(); top.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip(); tint(band, .35); g.restore(); }   // a light glint sweeps the shiny face
  for (let i = 1; i < 8; i++) { const u = i / 8; B.line(lerp(260, 700, u), lerp(620, 560, u), lerp(420, 860, u), lerp(830, 760, u), { w: 1, alpha: .3, nib: false }); }   // shiny streaks
  const und = [[420, 830], [860, 760], [870, 800], [430, 872]]; B.paper(und, .95); B.hatch(und, { sp: 6, alpha: .6 }); B.poly(und, { w: 2.2, close: true, nib: false });
  co(t, 'SHINY', 330, 500, 420, 640, -1, s(1) + .2, {}); co(t, 'DULL', 760, 930, 700, 830, -1, s(1) + .2, {});
  if (t > s(1) + .9) { B.txt('SHINY', 600, 735, { size: 30, align: 'center', write: R(t, s(1) + .9, .5) }); B.txt('DULL', 520, 868, { size: 30, align: 'center', write: R(t, s(1) + 1.4, .5) }); }
  if (t > s(1) + 1.6) { B.txt('?', 880, 560, { size: 120, write: R(t, s(1) + 1.6, .4) }); }
  B.alpha(1); }
const ROLLS = { x: 540, yT: VCY - 140, yB: VCY + 140, r: 125 };
function mill(t, { th = 40, two = false, ang = 0, peel = 0, k = 1, ext = 1 } = {}) {   // side view: entry strip left, two rolls, thin strip out right
  const { x, yT, yB, r } = ROLLS, gap = VCY;
  roll(x, yT, r, -ang, k); roll(x, yB, r, ang, k);
  const thIn = two ? 26 : th, thOut = two ? 12 : Math.max(8, th * .55);
  if (!two) { strip(120, x, gap - thIn / 2, thIn, { k: k * ext }); strip(x, 960, gap - thOut / 2, thOut, { k: k * ext }); }
  else { strip(120, x, gap - thIn, thIn - 1, { k: k * ext }); strip(120, x, gap + 1, thIn - 1, { k: k * ext });
    // after the nip: two thin sheets, peeling apart with peel
    const P1 = [], P2 = []; for (let xx = x; xx <= 960; xx += 8) { const u = (xx - x) / (960 - x), d = peel * Math.pow(u, 1.6) * 160; P1.push([xx, gap - thOut / 2 - 3 - d]); P2.push([xx, gap + 3 + d]); }
    B.poly(P1, { w: 4, nib: false }); B.poly(P2, { w: 4, nib: false }); B.poly(P1.map(([a, b]) => [a, b + 6]), { w: 1.4, nib: false, alpha: .8, dash: [3, 4] }); B.poly(P2.map(([a, b]) => [a, b - 6]), { w: 1.4, nib: false, alpha: .8, dash: [3, 4] }); }
  // feed arrows
  for (let j = 0; j < 2; j++) { const u = ((t * .8 + j / 2) % 1); B.arrowhead(160 + u * 200, gap - 60, 0, { alpha: .8 }); B.line(110 + u * 200, gap - 60, 160 + u * 200, gap - 60, { w: 1.4, nib: false, alpha: .8 }); }
}
function fig2(t) {   // one thick sheet squeezed thinner pass after pass; then the tear
  const a = R(t, s(2) - .3, .4) * (1 - R(t, s(5) - .3, .3)); if (a <= 0) return; B.alpha(B.S.A * a);
  const passes = Math.min(6, Math.floor(Math.max(0, t - s(3)) / .8)), th = 60 * Math.pow(.72, passes);
  mill(t, { th, ang: t * 3, k: R(t, s(2) - .2, .9) });
  if (t < s(3)) B.dim(150, VCY - 30, 150, VCY + 30, '≈ 1 mm', { off: -60, draw: R(t, s(2) + .8, .8), size: 32 });
  if (t > s(3)) B.txt('PASS ' + (passes + 1), 820, VP.y + 70, { size: 46, align: 'center' });
  if (t > s(4) + .8) { const k = R(t, s(4) + .8, .6); const cx = 870, cy = VCY; B.poly([[cx - 30, cy - 20], [cx - 10, cy + 2], [cx - 26, cy + 14], [cx + 4, cy + 34]], { w: 2.6, draw: k, dash: DASH.hidden }); co(t, 'TEARS!', 820, VCY + 190, 865, VCY + 10, s(4) + .9, s(5) - .3, {}); }
  B.alpha(1); }
function fig3(t) {   // double rolling: two sheets in the nip; zoom: outer faces on polished rolls = shiny, inner faces = matte; peel apart
  const a = R(t, s(5) - .3, .4) * (1 - R(t, s(9) - .3, .3)); if (a <= 0) return; B.alpha(B.S.A * a);
  const peel = ss(R(t, s(8), 1.6)); mill(t, { two: true, ang: t * 3, peel, k: R(t, s(5) - .2, .9) });
  co(t, '2 SHEETS', 260, VP.y + 80, 260, VCY - 20, s(5) + .4, s(6) - .2, {});
  // zoomed labels at the nip (sheet space, small because the camera is in)
  if (t > s(6) && t < s(8)) { const kk = R(t, s(6) + .6, .5); const nipX = ROLLS.x - 70;
    B.poly([[nipX - 60, VCY - 26], [nipX + 40, VCY - 26]], { w: 4, nib: false, alpha: kk }); B.txt('POLISHED ROLL', nipX - 10, VCY - 70, { size: 18, align: 'center', write: R(t, s(6) + .6, .5) }); B.txt('SHINY', nipX - 10, VCY - 40, { size: 20, align: 'center', write: R(t, s(6) + 1.6, .4) });
    if (t > s(7)) { const k2 = R(t, s(7), .5); const P = []; for (let x = nipX - 60; x <= nipX + 40; x += 3) P.push([x, VCY + (hash(x * .9) - .5) * 4]); B.poly(P, { w: 1.6, nib: false, alpha: k2 }); B.txt('MATTE', nipX - 10, VCY + 22, { size: 20, align: 'center', write: R(t, s(7) + .4, .4) }); B.txt('SHEET ON SHEET', nipX - 10, VCY + 46, { size: 16, align: 'center', write: R(t, s(7) + .8, .5) }); } }
  if (t > s(8) + 1.0) { co(t, 'SHINY', 860, VP.y + 70, 880, VCY - 110, s(8) + 1.0, s(9) - .3, { size: 30 }); co(t, 'DULL', 700, VP.y + 120, 820, VCY - 82, s(8) + 1.3, s(9) - .3, { size: 30 }); co(t, 'SHINY', 860, VP.y + VP.h - 60, 880, VCY + 110, s(8) + 1.6, s(9) - .3, { size: 30 }); }
  B.alpha(1); }
function fig4(t) {   // speed: rolls spinning on ones with speed lines; the number in a dimension box
  const a = R(t, s(9) - .3, .4) * (1 - R(t, s(10) - .3, .3)); if (a <= 0) return; B.alpha(B.S.A * a);
  mill(t, { two: true, ang: t * 18, peel: 1, k: 1 });
  for (let j = 0; j < 7; j++) { const y = VCY - 240 + j * 80, x = ((t * 1500 + j * 260) % 1100) - 80; B.line(x, y, x + 160, y, { w: 1.4, nib: false, alpha: .6 }); }
  callout('UP TO 2,500 m / MIN', 540, VP.y + 60, null, null, R(t, s(9) + 1.4, .5), { size: 40 });
  B.alpha(1); }
function tray(cx, cy, shinyOut, t, k) {   // a baking tray with a wrapped potato; the foil's outside face shown shiny (streaks) or dull (stipple)
  B.poly([[cx - 160, cy + 70], [cx + 160, cy + 70], [cx + 140, cy + 100], [cx - 140, cy + 100]], { w: 2.4, close: true, draw: k });
  const blob = circPts(cx, cy, 120, 40).map(([x, y]) => [x, cy + (y - cy) * .6]); B.paper(blob, .95); B.poly(blob, { w: 2.6, close: true, draw: k });
  if (shinyOut) { for (let i = 0; i < 5; i++) B.line(cx - 90 + i * 40, cy - 40, cx - 60 + i * 40, cy + 30, { w: 1, alpha: .5, nib: false }); } else B.hatch(blob, { sp: 6, alpha: .5 });
  for (let j = 0; j < 3; j++) { const u = (t * .9 + j / 3) % 1, x = cx - 80 + j * 80; B.poly([[x, cy + 200 - u * 60], [x + 10, cy + 180 - u * 60], [x - 6, cy + 160 - u * 60], [x + 4, cy + 140 - u * 60]], { w: 1.6, nib: false, alpha: 1 - u }); }
}
function fig5(t) {   // in the oven: shiny out vs dull out, same heat; verdict stamp; then the non-stick exception
  const a = R(t, s(10) - .3, .4) * (1 - R(t, s(14) - .3, .3)); if (a <= 0) return; B.alpha(B.S.A * a);
  if (t < s(13)) { tray(300, VCY - 30, true, t, R(t, s(10), .8)); tray(780, VCY - 30, false, t, R(t, s(10) + .3, .8)); B.txt('=', 540, VCY - 10, { size: 120, align: 'center', write: R(t, s(11), .4) });
    B.txt('SHINY OUT', 300, VP.y + 60, { size: 34, align: 'center', write: R(t, s(10) + .2, .5) }); B.txt('DULL OUT', 780, VP.y + 60, { size: 34, align: 'center', write: R(t, s(10) + .5, .5) });
    B.stamp('EITHER SIDE', 540, VCY + 150, R(t, s(11) + 1.4, .35), { size: 64 });
    co(t, 'GDA: "EQUIVALENT"', 540, VP.y + VP.h - 50, null, null, s(12) + .6, s(13) - .2, { size: 34 }); }
  else { const k = R(t, s(13) - .1, .6); g.save(); const zz = 1 + .3 * R(t, s(13), 6.5); g.translate(540, VCY); g.scale(zz, zz); g.translate(-540, -VCY); strip(180, 900, VCY + 40, 18, { k, roughTop: true });
    for (let j = 0; j < 7; j++) { const u = (t * .9 + j / 7) % 1, x = 380 + j * 45; B.poly([[x, VCY - 110 - u * 90], [x + 12, VCY - 130 - u * 90], [x - 8, VCY - 150 - u * 90], [x + 6, VCY - 170 - u * 90]], { w: 1.8, nib: false, alpha: 1 - u }); } B.poly([[180, VCY + 34], [900, VCY + 34]], { w: 3, dash: [6, 6], nib: false, alpha: k });
    const food = circPts(540, VCY - 40, 110, 40).map(([x, y]) => [x, VCY - 40 + (y - VCY + 40) * .55]); B.paper(food, .95); B.poly(food, { w: 2.6, close: true, draw: R(t, s(13) + .6, .6) });
    co(t, 'NON-STICK COATING', 330, VP.y + 120, 330, VCY + 34, s(13) + .9, s(14) - .3, { size: 30 }); co(t, 'ON THE DULL SIDE', 620, VCY + 150, 680, VCY + 40, s(13) + 2.4, s(14) - .3, { size: 30 }); g.restore(); }
  B.alpha(1); }
function fig6(t) {   // the fingerprint: the nip again, small, with a magnified matte texture; the question
  const a = R(t, s(14) - .3, .4); if (a <= 0) return; B.alpha(B.S.A * a);
  mill(t, { two: true, ang: t * 3, peel: 1, k: 1 });
  const k = R(t, s(14) + .6, .8); for (let r_ = 30; r_ <= 120; r_ += 18) B.circ(830, VP.y + 130, r_ * ss(k), { w: 1.3, nib: false, alpha: .8 });   // fingerprint whorl
  if (t > s(15) - .2) { callout('SHINY  or  DULL ?', 540, VP.y + VP.h - 60, null, null, R(t, s(15) - .2, .5), { size: 44 }); }
  B.alpha(1); }
// the bottom band: a foil roll in phantom line, drawing only (no text in the bottom 480 px)
function rollDetail(t) { const cx = 540, cy = 1660, rx = 150, ry = 150; B.line(160, cy, 920, cy, { w: 1, dash: DASH.centre, alpha: .5, nib: false });
  B.circ(cx - 260, cy, 150, { w: 2, nib: false, alpha: .7 }); B.circ(cx - 260, cy, 40, { w: 1.6, nib: false, alpha: .7 });
  const sp = []; for (let a = 0; a < Math.PI * 9; a += .1) { const r_ = 40 + a * 3.8; sp.push([cx - 260 + Math.cos(a + t * .4) * r_, cy + Math.sin(a + t * .4) * r_]); } B.poly(sp, { w: 1, nib: false, alpha: .45 });
  B.line(cx - 260, cy - 150, cx + 300, cy - 150, { w: 2, nib: false, alpha: .7 }); B.line(cx - 260, cy + 150, cx + 300, cy + 150, { w: 2, nib: false, alpha: .7 });
  B.poly(circPts(cx + 300, cy, 150, 48).map(([x, y]) => [cx + 300 + (x - cx - 300) * .35, y]), { w: 2, nib: false, alpha: .7, close: true });
  const tail = []; for (let x = cx + 300; x <= 980; x += 10) tail.push([x, cy + 150 + Math.sin((x - cx) * .02 + t) * 6]); B.poly(tail, { w: 2, nib: false, alpha: .7 }); }

// ---------- sheet furniture re-laid for Batch N ----------
function header(t) { const fi = figAt(t), f = FIGS[fi], prev = fi ? FIGS[fi - 1] : null, fk = R(t, f[0], .6);
  B.txt('HOW IT REALLY WORKS', 100, 292, { size: 22, font: 'Poppins', weight: 600, alpha: .85, ls: 3 }); B.txt('SHEET 1/1', 980, 292, { size: 22, font: 'Poppins', weight: 600, align: 'right', alpha: .85, ls: 3 });
  B.txt('ALUMINUM FOIL', 540, 345, { size: 66, align: 'center' }); B.line(100, 376, 980, 376, { w: 1.5, nib: false, alpha: .8 });
  if (prev && fk < 1) { B.txt(prev[1] + '  ·  ' + prev[2], 98, 414, { size: 36, alpha: 1 - ss(fk * 2) }); B.line(94, 414, 94 + B.measure(prev[1] + '  ·  ' + prev[2], 36) + 8, 414, { w: 3, draw: R(fk, 0, .35), nib: false }); }
  B.txt(f[1] + '  ·  ' + f[2], 98, 414, { size: 36, write: prev ? R(fk, .35, .65) : 1 });
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 3.2; g.strokeRect(60, 250, W - 120, H - 310); g.lineWidth = 1.4; g.globalAlpha = .9; g.strokeRect(VP.x + 8, VP.y, VP.w - 16, VP.h); g.restore(); }
function titleBlock(t, status) { const y0 = 1010, h = 128, x0 = 100, w = 800; g.save(); g.strokeStyle = C.ink; g.lineWidth = 2.4; g.strokeRect(x0, y0, w, h); g.lineWidth = 1.3;
  [[380, 0, 380, h], [640, 0, 640, h]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, y0 + b); g.lineTo(c2, y0 + d); g.stroke(); }); g.beginPath(); g.moveTo(x0, y0 + 64); g.lineTo(x0 + w, y0 + 64); g.stroke(); g.restore();
  const cells = [['TITLE', 'HOUSEHOLD FOIL', 112, 0], ['DRAWN BY', '@howitreallyworkstudio', 112, 64], ['STATUS', status, 392, 0], ['SHEET', '1 OF 1', 392, 64], ['SCALE', 'NOT TO SCALE', 652, 0], ['SOURCES', 'SEE CAPTION', 652, 64]];
  cells.forEach(([k, v, x, dy], i) => { const wk = 1; B.txt(k, x, y0 + dy + 15, { size: 16, font: 'Poppins', weight: 600, alpha: .7, ls: 2, write: wk }); B.txt(v, x, y0 + dy + 44, { size: v.length > 13 ? 26 : 32, write: wk }); }); }
function note(n, cap, tS) { const x = 100, y = 1150, w = 800, h = 275, size = 50; g.save(); g.globalAlpha = clamp(tS / .15); g.fillStyle = 'rgba(14,34,82,.62)'; g.fillRect(x, y, w, h); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.strokeRect(x, y, w, h); g.lineWidth = 1; g.strokeRect(x + 8, y + 8, w - 16, h - 16); g.restore();
  B.txt('NOTE', x + 24, y + 30, { size: 16, font: 'Poppins', weight: 600, alpha: .8, ls: 3 }); B.txt(String(n).padStart(2, '0'), x + 92, y + 30, { size: 20, font: 'Poppins', weight: 600 });
  const toks = []; cap.split('**').forEach((sg, k) => sg.split(' ').filter(Boolean).forEach(wd => toks.push({ w: wd, b: k % 2 === 1 }))); const sp = B.measure(' ', size), maxW = w - 64; const lines = [[]]; let acc = 0;
  toks.forEach(tk => { const ww = B.measure(tk.w, size); if (acc + ww > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0; } lines[lines.length - 1].push({ ...tk, ww }); acc += ww + sp; });
  const lh = size * 1.12, ty = y + 58 + (h - 58 - lines.length * lh) / 2 + lh / 2; const total = toks.length; let idx = 0;
  lines.forEach((l, li) => { const lw = l.reduce((a, tk) => a + tk.ww + sp, -sp); let xx = x + w / 2 - lw / 2; l.forEach(tk => { const wk = clamp((tS - .05) / .4 * total - idx); idx++; if (wk > 0) { B.txt(tk.w, xx, ty + li * lh, { size, write: wk }); if (tk.b && wk >= 1) B.line(xx, ty + li * lh + size * .42, xx + tk.ww, ty + li * lh + size * .42, { w: 1.4, nib: false, alpha: .9 }); } xx += tk.ww + sp; }); }); }

function scene(t) {
  B.begin(); header(t);
  const [cx, cy, z] = camAt(t); B.camBegin(cx, cy, z); fig1(t); fig2(t); fig3(t); fig4(t); fig5(t); fig6(t); B.camEnd();
  // end card over the faded figure window
  if (t > s(16) - .1) { const k = R(t, s(16) - .1, .6); g.save(); g.globalAlpha = .55 * k; g.fillStyle = '#18336B'; g.fillRect(VP.x + 9, VP.y + 1, VP.w - 18, VP.h - 2); g.restore();
    const bx = 150, by = 520, bw = 780, bh = 400; g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(14,34,82,.92)'; g.fillRect(bx, by, bw, bh); g.restore(); B.rect(bx, by, bw, bh, { w: 3, draw: k, nib: false }); B.rect(bx + 9, by + 9, bw - 18, bh - 18, { w: 1.2, draw: k, nib: false });
    B.txt('Follow for more of', 540, by + 90, { size: 70, align: 'center', write: R(t, s(16) + .1, .8) }); B.txt('how it really works.', 540, by + 175, { size: 70, align: 'center', write: R(t, s(16) + .6, .8) });
    B.line(210, by + 225, 870, by + 225, { w: 2, draw: R(t, s(16) + 1.2, .5), nib: false }); B.txt("A new 'wait, really?' every day.", 540, by + 285, { size: 46, align: 'center', write: R(t, s(16) + 1.4, .7) }); B.txt('@howitreallyworkstudio', 540, by + 350, { size: 40, align: 'center', write: R(t, s(16) + 1.8, .7) }); }
  rollDetail(t);
  let ci = 0; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci >= 0 && ci < PH.length - 1) note(ci + 1, PH[ci].cap, ci === 0 ? 9 : t - PH[ci].start + .05);
  const status = t < s(11) + 1.4 ? 'SIDE MATTERS?' : t < s(13) ? 'EITHER SIDE' : t < s(14) ? 'NON-STICK: DULL' : 'EITHER SIDE';
  titleBlock(t, status);
}
window.DUR = TL.total;
// loop: the last 0.5 s crossfades into frame 0 (same sheet), so the reel restarts seamlessly
const LOOP = document.createElement('canvas'); LOOP.width = W; LOOP.height = H;
window.seek = t => { const Tt = TL.total, lp = clamp((t - (Tt - .5)) / .5); if (lp > 0) { scene(0); LOOP.getContext('2d').drawImage(g.canvas, 0, 0); } scene(t); if (lp > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = ss(lp); g.drawImage(LOOP, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { B.begin(); header(0); B.camBegin(540, VCY, 1); mill(1, { two: true, ang: .3, peel: 1, k: 1 }); B.camEnd(); rollDetail(0);
  g.save(); g.fillStyle = 'rgba(14,34,82,.92)'; g.fillRect(120, 1100, 840, 330); g.restore(); B.rect(120, 1100, 840, 330, { w: 3, nib: false }); B.txt('SHINY SIDE', 540, 1215, { size: 120, align: 'center' }); B.txt('DULL SIDE?', 540, 1350, { size: 120, align: 'center' });
  B.stamp('WHY?', 820, 560, 1, { size: 70 }); };
window.seek(0); window.ready = true; window.READY = true;
