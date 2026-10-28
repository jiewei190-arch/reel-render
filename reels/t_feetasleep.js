// t_feetasleep.js: "Why does your foot fall asleep?" in template #18 handdrawn "Japan heat wave" (demo 101), field-sketchbook module.
// Demo moves reused: warm notebook paper with crop marks, typed chapter label "NO. 0x — TOPIC" + hairline, handwritten headline written on,
// thin graphite drawings that draw on, red/navy pencil hatching as the only fills, a big red hatched sun behind the title drawing, red seals,
// double-ruled measurement boxes (here: nerve-signal readouts), the demo's row of boxes as a "pins and needles" timeline strip,
// typed body text with red words, mono footer + swatch chips, page change = ink fades off, ending = centred lines + round seal + half disc.
// Safe zones: label/headline from y 280 (top-right kept clear for the badge), drawing y 430-1130, typed caption y 1230-1400 (x 80-880),
// nothing typed in the right column below y 840.
import { createFB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const F = createFB(document.getElementById('c')), g = F.g, R = ramp;
const TOP = 280, HEAD = 386, CAPY = 1240;

// ---------- pages (start, end, number) ----------
const PG = [[0, s(2) - .1, 1], [s(2) - .1, s(5) - .1, 2], [s(5) - .1, s(9) - .1, 3], [s(9) - .1, s(11) - .1, 4], [s(11) - .1, s(13) - .1, 5], [s(13) - .1, s(14) - .2, 6], [s(14) - .2, TOT + 1, 7]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
let PREV = false;
function caption(t, y = CAPY, o = {}) { if (PREV) return; let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci < 0 || ci === PH.length - 1) return; const p = pageAt(t); if (PH[ci].start < p[0] - .1) return;
  F.body(PH[ci].cap, o.x ?? 80, y, o.maxW || 800, t - PH[ci].start + .05, { size: o.size || 50, ...o }); }
function chapter(t, label, head, t0, o = {}) { F.label(label, 80, TOP, t - t0); F.head(head, 76, HEAD, t - t0 - .35, { size: o.size || 76 }); }
const note = (txt, x, y, k, o = {}) => F.txt(txt, x, y, { size: o.size || 40, f: 'hand', col: o.col || C.ink, write: ss(k), align: o.align, rot: -.012 });
const strike = (x, y, r, k, col = C.red) => { F.pencil([[x - r, y - r], [x + r, y + r]], { col, w: 3, draw: k, wob: .5 }); F.pencil([[x + r, y - r], [x - r, y + r]], { col, w: 3, draw: R(k, .4, .6), wob: .5 }); };
const ringPts = (cx, cy, r, n = 48, sy = 1) => { const P = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU; P.push([cx + Math.cos(a) * r * (1 + Math.sin(a * 5) * .01), cy + Math.sin(a) * r * sy]); } return P; };

// ---------- the foot (side view, toes to the right); x,y = under the heel; wig = toe wiggle 0..1 ----------
function footPts(wig = 0, t = 0) { const w = Math.sin(t * 9) * 10 * wig;
  return [[-30, -520], [-34, -300], [-48, -130], [-70, -60], [-62, -8], [-20, 0], [120, 4], [230, 6], [300, 4 + w * .3], [338, -4 + w], [342, -22 + w], [318, -36 + w * .6], [250, -52], [170, -80], [80, -112], [46, -150], [40, -300], [44, -520]]; }
// the nerve inside: up the back of the leg, under the arch, out to the toes
const NERVE = [[0, -520], [-6, -330], [-18, -150], [-10, -60], [60, -34], [170, -24], [260, -20], [318, -18]];
function foot(x, y, sc, t, o = {}) { const k = o.k ?? 1; g.save(); g.translate(x, y); g.scale(sc, sc);
  const P = footPts(o.wig || 0, t);
  if (o.numb) F.hatch(P, 'navyL', { k: o.numb, alpha: .55 });
  if (o.tingle) for (let i = 0; i < 26; i++) { const u = hash(i * 3.1), v = hash(i * 7.7), px = lerp(-40, 310, u), py = lerp(-20, -90, v) + (px < 40 ? -lerp(0, 380, hash(i * 5.3)) : 0), on = Math.sin(t * 13 + i * 2.3) > .2;
    if (on) { g.save(); g.globalAlpha = o.tingle * .9; g.strokeStyle = C.red; g.lineWidth = 3 / sc; g.lineCap = 'round'; const a = hash(i) * TAU, L = 14 / sc; g.beginPath(); g.moveTo(px - Math.cos(a) * L, py - Math.sin(a) * L); g.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); g.moveTo(px - Math.cos(a + 1.57) * L * .6, py - Math.sin(a + 1.57) * L * .6); g.lineTo(px + Math.cos(a + 1.57) * L * .6, py + Math.sin(a + 1.57) * L * .6); g.stroke(); g.restore(); } }
  F.pencil(P, { w: 2.8 / sc, draw: R(k, 0, .8), seed: 3 });
  // toenail + ankle bone marks
  F.pencil([[300, -26 + Math.sin(t * 9) * 10 * (o.wig || 0)], [326, -30 + Math.sin(t * 9) * 10 * (o.wig || 0)]], { w: 2 / sc, draw: R(k, .7, .3), seed: 4 });
  F.pencil([[-20, -150], [-4, -168], [12, -150]], { w: 1.6 / sc, draw: R(k, .7, .3), seed: 5, alpha: .6 });
  if (o.nerve) F.pencil(NERVE, { col: o.nerveCol || C.red, w: 4 / sc, draw: o.nerve, seed: 6 });
  g.restore(); }
// a dot riding the nerve, u 0 (toes) .. 1 (top of leg)
function nervePt(x, y, sc, u) { const P = F.walk(F.dense(NERVE.slice().reverse()), u); const [a, b] = P[P.length - 1]; return [x + a * sc, y + b * sc]; }
function signals(x, y, sc, t, k, o = {}) { if (k <= 0) return; const stop = o.stop ?? 1.1; for (let j = 0; j < 6; j++) { let u = (t * .45 + j / 6) % 1; if (u > stop) continue; const [px, py] = nervePt(x, y, sc, u);
    g.save(); g.globalAlpha = k * (o.fade && u > stop - .1 ? (stop - u) * 10 : 1); g.fillStyle = C.red; g.beginPath(); g.arc(px, py, 9, 0, TAU); g.fill(); g.restore(); } }

// ---------- cross-section: nerve bundle + blood vessel, squash 0..1, fibres lit 0..1 (mode: 'ok' | 'off' | 'messy') ----------
function section(cx, cy, r, t, o = {}) { const sq = o.sq || 0, k = o.k ?? 1, sy = 1 - .55 * sq;
  F.pencil(ringPts(cx, cy, r, 48, sy), { w: 2.6, draw: k, seed: 21 });
  for (let i = 0; i < 13; i++) { const a = i / 13 * TAU + .3, rr = i < 6 ? r * .55 : r * .25, fx = cx + Math.cos(a) * rr * (i === 12 ? 0 : 1), fy = cy + Math.sin(a) * rr * sy * (i === 12 ? 0 : 1), fr = r * .17;
    let lit = 0; if (o.mode === 'ok') lit = (Math.sin(t * 6 + i) > 0) ? 1 : .3; else if (o.mode === 'messy') lit = hash(i * 1.7) < .35 ? 0 : (Math.sin(t * (14 + i * 3) + i) > -.2 ? 1 : 0);
    const P = ringPts(fx, fy, fr, 20, sy); if (lit > 0 && k > .5) F.hatch(P, 'red', { alpha: .7 * lit });
    F.pencil(P, { w: 1.6, draw: R(k, .3, .7), seed: 30 + i, col: C.graph }); }
  // blood vessel beside it: a red tube end-on
  const vx = cx + r * 1.55, vr = r * .5, P = ringPts(vx, cy + r * .2, vr, 32, 1 - .8 * sq); F.hatch(P, 'redL', { k, alpha: .55 * (1 - .6 * sq) + .2 * (o.flow || 0) }); F.pencil(P, { col: C.red, w: 2.4, draw: k, seed: 40 });
  if (o.flow) for (let j = 0; j < 4; j++) { const u = (t * 1.2 + j / 4) % 1; g.save(); g.globalAlpha = o.flow * Math.sin(u * Math.PI); g.fillStyle = C.red; g.beginPath(); g.arc(vx - vr * .5 + u * vr, cy + r * .2 + Math.sin(u * 6 + j) * vr * .3, 6, 0, TAU); g.fill(); g.restore(); } }
// signal readout: double-ruled box with a trace (demo's measurement boxes)
function readout(x, y, w, h, t, k, mode, label) { if (k <= 0) return; F.box(x, y, w, h, k); F.txt(label, x + 22, y + 38, { size: 22, f: 'mono', wt: 700, col: '#5d5d62', alpha: k });
  const P = [], base = y + h * .62, amp = h * .3; for (let i = 0; i <= 70; i++) { const u = i / 70, xx = x + 20 + u * (w - 40), ph = u * 10 - t * 3; let v = 0;
    if (mode === 'ok') v = Math.pow(Math.max(0, Math.sin(ph * 2)), 8); else if (mode === 'off') v = .02 * Math.sin(ph * 9); else v = (hash(Math.floor(ph * 3) + i * .01) > .5 ? 1 : .1) * Math.abs(Math.sin(ph * 7)) * (hash(Math.floor(ph * 3) * 1.3) * 1.1);
    P.push([xx, base - v * amp]); }
  F.pencil(P, { col: mode === 'off' ? C.graph : C.red, w: 2.2, draw: R(k, .3, .7), wob: .3, seed: 50 }); }
// pressure weight (the other leg / a hatched block) pressing down
function weight(x, y, w, h, k, lab) { if (k <= 0) return; const P = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; F.hatch(P, 'graph', { k, alpha: .8 }); F.pencil(P, { close: true, w: 2.4, draw: k, seed: 60 }); if (lab) F.txt(lab, x + w / 2, y + h / 2 + 10, { size: 26, f: 'mono', wt: 700, align: 'center', alpha: k }); }
function brain(x, y, sc, k, o = {}) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(sc, sc);
  const P = []; for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI, rr = 1 + .07 * Math.sin(i * 1.3); P.push([Math.cos(a) * 110 * rr, Math.sin(a) * 80 * rr + 20]); } P.push([110, 30], [-110, 30]);
  if (o.lit) F.hatch(P, 'redL', { alpha: .5 * o.lit }); F.pencil(P, { w: 2.6 / sc, draw: k, seed: 70 });
  F.pencil([[-60, -30], [-30, -10], [-50, 10]], { w: 1.8 / sc, draw: k, seed: 71 }); F.pencil([[20, -50], [40, -20], [10, 5]], { w: 1.8 / sc, draw: k, seed: 72 }); F.pencil([[70, -20], [60, 15]], { w: 1.8 / sc, draw: k, seed: 73 });
  F.txt('BRAIN', 0, 70, { size: 24, f: 'mono', wt: 700, align: 'center', col: '#5d5d62', alpha: k }); for (let i = 0; i < 5; i++) F.pencil([[-90 + i * 40, -40 + (i % 2) * 20], [-75 + i * 40, -10], [-95 + i * 40, 15]], { w: 1.4 / sc, draw: k, seed: 74 + i, alpha: .7 });
  g.restore(); if (o.q) F.txt('?', x + 140 * sc, y - 10, { size: 90, f: 'hand', col: C.red, alpha: o.q }); }
function zzz(x, y, t, k) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const u = (t * .35 + i / 3) % 1; F.txt('z', x + u * 90 + i * 10, y - u * 170, { size: 46 + u * 50, f: 'hand', col: C.navy, alpha: k * Math.sin(u * Math.PI) }); } }

// ---------- p1: title page (frame 0 = a big foot with its toes twitching, Zzz rising, red sun behind) ----------
function page1(t) { F.txt('A FIELD SKETCHBOOK  ·  BODY NOTES', 80, TOP, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', alpha: .9 }); F.line(80, TOP + 16, 700, TOP + 16, { w: 1, alpha: .5, wob: .3 });
  F.txt('Why does my foot', 74, 410, { size: 92, f: 'hand', rot: -.015 }); F.txt('fall asleep?', 74, 510, { size: 104, f: 'hand', col: C.navy, rot: -.015 });
  const cx = 660, cy = 860, ring = ringPts(cx, cy, 230); F.hatch(ring, 'red', { alpha: .5 }); F.pencil(ring, { col: C.red, w: 2.2, seed: 2 });
  const tk = s(1), turn = R(t, tk + .4, .8);
  foot(170, 1160, 1.12 + .04 * Math.sin(t * 1.3), t, { wig: 1 - turn, numb: .7 * (1 - turn), nerve: R(t, tk + 1.2, 1.0) });
  zzz(700, 700, t, 1 - turn); if (turn > 0) { F.txt('Zzz', 720, 700, { size: 70, f: 'hand', col: C.navy, alpha: turn }); strike(770, 680, 46, R(t, tk + .6, .5)); }
  note('a squeezed nerve', 560, 1110, R(t, s(1) + 1.8, .8), { col: C.red, size: 46 });
  caption(t); }

// ---------- p2: nerves are wires; pressure squeezes nerve + vessel; the signal is blocked ----------
function page2(t) { const t0 = s(2) - .1; chapter(t, 'NO. 01 — THE WIRING  ·  fig. a', 'Nerves are wires.', t0);
  const fx = 180, fy = 1140, sc = .82;
  foot(fx, fy, sc, t, { k: R(t, t0, 1.2), nerve: R(t, t0 + .8, 1.0), numb: ss(R(t, s(4) + .8, 1.2)) * .8 });
  brain(820, 520, .9, R(t, t0 + .6, .8), { lit: t < s(4) + .6 ? .8 + .2 * Math.sin(t * 6) : 0, q: R(t, s(4) + 1.2, .5) });
  // wire from the top of the leg to the brain
  const top = [fx + 0 * sc, fy - 520 * sc]; F.pencil([top, [top[0] + 40, 520], [700, 540]], { col: C.red, w: 3, draw: R(t, t0 + 1.6, .8), seed: 80, dash: t > s(4) + .4 ? [10, 12] : null });
  const blocked = t > s(4) - .2, pinchU = .55;
  signals(fx, fy, sc, t, R(t, s(2) + 1.4, .5), { stop: blocked ? pinchU : 1.1, fade: blocked });
  // pressure: the other leg presses on the back of the knee area; inset cross-section
  if (t > s(3) - .2) { const kp = R(t, s(3), .6), [px, py] = nervePt(fx, fy, sc, pinchU);
    weight(px - 120, py - 70 - 30 * (1 - kp), 110, 120, kp, 'LEG'); F.arrow([[px - 65, py - 150], [px - 65, py - 80]], { draw: kp, col: C.graph });
    const kb = R(t, s(3) + .8, .6); F.box(430, 700, 420, 330, kb); F.txt('CROSS-SECTION', 452, 738, { size: 22, f: 'mono', wt: 700, col: '#5d5d62', alpha: kb });
    section(570, 880, 82, t, { k: kb, sq: ss(R(t, s(3) + 2.0, 1.0)), mode: blocked ? 'off' : 'ok' });
    note('nerve', 520, 1000, R(t, s(3) + 1.4, .5), { size: 36 }); note('vessel', 700, 1000, R(t, s(3) + 3.0, .5), { size: 36, col: C.red });
    F.pencil([[px + 10, py], [430, 860]], { col: C.graph, w: 1.4, dash: [6, 8], draw: kb, alpha: .7 }); }
  if (blocked) note('numb', 480, 1120, R(t, s(4) + 1.4, .5), { col: C.navy, size: 54 });
  caption(t); }

// ---------- p3: the worst part comes after: waking up; messy restart; pins and needles ----------
function page3(t) { const t0 = s(5) - .1; chapter(t, 'NO. 02 — WAKING UP  ·  fig. b', 'The worst part comes after.', t0, { size: 66 });
  const lift = ss(R(t, s(6) + .2, 1.0));
  if (t < s(8) - .1) {
    // cross-section, big: pressure lifts, blood flows back, fibres restart
    weight(210, 470 - lift * 120, 300, 90, 1 - lift, 'PRESSURE');
    section(360, 830, 190, t, { sq: 1 - lift, mode: t < s(6) + .6 ? 'off' : (t < s(7) ? 'ok' : 'messy'), flow: lift });
    note(t < s(6) ? 'still squeezed' : 'blood back in', 600, 700, R(t, t < s(6) ? t0 + 1 : s(6) + .8, .6), { col: C.red, size: 42 });
    if (t > s(7)) { note('some quiet', 80, 600, R(t, s(7) + 1.0, .6), { col: C.graph, size: 40 }); note('some too loud', 420, 600, R(t, s(7) + 2.2, .6), { col: C.red, size: 40 }); }
    readout(500, 1030, 380, 170, t, R(t, t0 + 1.6, .6), t < s(6) + .6 ? 'off' : (t < s(7) ? 'ok' : 'messy'), 'SIGNAL');
  } else {
    // pins and needles: the foot fizzing; three typed boxes
    const k8 = R(t, s(8) - .1, .5); foot(240, 1130, .9, t, { k: 1, tingle: k8, nerve: 1 });
    ['tingle', 'buzz', 'prickle'].forEach((w, i) => { const kb = bo(R(t, s(8) + 1.4 + i * .5, .4)); if (kb <= 0) return; F.box(560, 520 + i * 170, 320, 130, clamp(kb)); F.txt(w, 720, 600 + i * 170, { size: 56, f: 'hand', align: 'center', col: C.red, write: clamp(kb) }); });
    F.seal('PINS', 400, 600, ss(R(t, s(8) + .5, .35)), { round: true, size: 44, f: 'mono', fs: 26 });
  }
  caption(t); }

// ---------- p4: not just feet (arm under the head); the fix: move; the timeline strip ----------
function sleeper(x, y, t, k, numb, sc = 1) { // a figure asleep on its arm: head on a pillow, arm crooked under the head
  g.save(); g.translate(x, y); g.scale(sc, sc);
  F.pencil([[-260, 60], [260, 60], [270, 110], [-270, 110]], { close: true, w: 2.4, draw: k, seed: 90 }); // mattress
  F.pencil(ringPts(-150, -10, 62, 32), { w: 2.6, draw: k, seed: 91 }); // head
  const arm = [[-60, 40], [-120, 50], [-200, 50], [-230, 30], [-210, 10]]; if (numb) { const hand = ringPts(-215, 20, 26, 20); F.hatch(hand, 'navy', { alpha: .7 * numb }); }
  F.pencil(arm, { w: 3, draw: k, seed: 92 }); F.pencil([[-90, 0], [40, -20], [220, -10], [250, 30], [-60, 40]], { w: 2.6, draw: k, seed: 93 }); // body under the blanket
  g.restore(); zzz(x - 60, y - 90, t, k); }
const STRIP = [['PRESSURE', 'graph'], ['NUMB', 'navy'], ['MOVE', 'ochre'], ['TINGLE', 'red'], ['NORMAL', null]];
function page4(t) { const t0 = s(9) - .1;
  if (t < s(10) - .1) { chapter(t, 'NO. 03 — NOT JUST FEET  ·  fig. c', 'Arms do it too.', t0); sleeper(560, 820, t, R(t, t0 + .3, 1.2), R(t, s(9) + 2.0, .8), 1.6); note('hand: numb', 120, 1060, R(t, s(9) + 2.4, .6), { col: C.navy, size: 44 }); }
  else { const t1 = s(10) - .1; chapter(t, 'NO. 04 — THE FIX  ·  fig. d', 'Move.', t1, { size: 96 });
    foot(230, 860, .56, t, { k: 1, wig: 1, tingle: 1 - R(t, s(10) + 2.4, 1.0), nerve: 1 });
    for (let i = 0; i < 3; i++) F.pencil([[440, 790 + i * 26], [466 + 10 * Math.sin(t * 9 + i), 782 + i * 26]], { col: C.graph, w: 2, wob: .4 });
    // the timeline strip (the demo's row of day boxes): pressure -> numb -> move -> tingle -> normal
    const cur = Math.floor(clamp((t - s(10) + .2) / 3.8) * 4.99);
    STRIP.forEach(([w, pat], i) => { const x = 80 + i * 164, y = 930, k = R(t, t1 + .4 + i * .3, .4); F.box(x, y, 150, 120, k); if (pat) F.hatch([[x + 18, y + 18], [x + 132, y + 18], [x + 132, y + 52], [x + 18, y + 52]], pat, { k, alpha: .8 });
      F.txt(w, x + 75, y + 94, { size: 21, f: 'mono', wt: 700, align: 'center', col: i === cur ? C.red : '#5d5d62', alpha: k }); if (i < 4) F.txt('→', x + 157, y + 70, { size: 22, f: 'mono', align: 'center', alpha: k }); });
    F.pencil(ringPts(80 + cur * 164 + 75, 990, 92, 32, .75), { col: C.red, w: 2.4, draw: R(t, s(10), .5), seed: 95 + cur });
    F.box(560, 520, 300, 220, R(t, t1 + .8, .5)); F.txt('FADES', 590, 570, { size: 24, f: 'mono', wt: 700, col: '#5d5d62', alpha: R(t, t1 + 1, .3) }); note('quickly', 710, 670, R(t, s(10) + 2.6, .6), { col: C.red, size: 64, align: 'center' }); }
  caption(t); }

// ---------- p5: the answer + when to see a doctor ----------
function page5(t) { const t0 = s(11) - .1; chapter(t, 'NO. 05 — THE ANSWER  ·  fig. e', 'It never slept.', t0, { size: 80 });
  if (t < s(12) - .1) { const fx = 200, fy = 1140, sc = .82; foot(fx, fy, sc, t, { k: 1, nerve: 1, tingle: .5 * (1 - R(t, s(11) + 3, 1.5)) }); signals(fx, fy, sc, t, 1);
    brain(820, 560, .9, 1, { lit: .7 + .3 * Math.sin(t * 6) }); const top = [fx, fy - 520 * sc]; F.pencil([top, [top[0] + 40, 560], [700, 580]], { col: C.red, w: 3, seed: 80 });
    F.box(470, 760, 420, 170, R(t, t0 + .8, .5)); F.txt('SIGNAL', 492, 800, { size: 22, f: 'mono', wt: 700, col: '#5d5d62', alpha: R(t, t0 + 1, .3) }); note('lost → coming back', 680, 880, R(t, s(11) + 2.6, .8), { col: C.red, size: 42, align: 'center' }); }
  else { const t1 = s(12) - .1, rows = [['now and then', 'harmless', C.navy], ['often', 'see a doctor', C.red], ['no pressure', 'see a doctor', C.red], ['with weakness', 'see a doctor', C.red]];
    rows.forEach(([a, b, col], i) => { const y = 520 + i * 150, k = R(t, t1 + .3 + i * .7, .5); F.box(80, y, 820, 120, k); F.txt(a, 110, y + 76, { size: 46, f: 'hand', write: k }); F.txt(b, 870, y + 76, { size: 40, f: 'hand', align: 'right', col, write: R(t, t1 + .6 + i * .7, .5) }); });
    F.seal('MD', 820, 1120, ss(R(t, s(12) + 4.2, .35)), { round: true, size: 40, f: 'mono', fs: 28 }); }
  caption(t); }

// ---------- p6: the question ----------
function page6(t) { const t0 = s(13) - .1; chapter(t, 'NO. 06 — YOUR TURN  ·  fig. f', 'Foot or arm?', t0, { size: 86 });
  foot(170, 1060, .66, t, { k: R(t, t0, .8), wig: 1, numb: .6 }); sleeper(660, 900, t, R(t, t0 + .3, .8), 1);
  [['FOOT', 280], ['ARM', 660]].forEach(([w, x], i) => { const k = bo(R(t, s(13) + .6 + i * .5, .4)); if (k <= 0) return; F.box(x - 130, 1080, 260, 110, clamp(k)); F.txt(w, x, 1152, { size: 44, f: 'mono', wt: 700, align: 'center', col: i ? C.navy : C.red, alpha: clamp(k) }); });
  F.txt('or', 470, 1152, { size: 44, f: 'hand', align: 'center', alpha: R(t, s(13) + 1.0, .4) }); }

// ---------- p7: end card (demo's last page) ----------
function page7(t) { const t0 = s(14) - .2, k = R(t, t0, .6);
  F.txt('Follow for more of', 540, 640, { size: 76, f: 'hand', align: 'center', write: ss(k) }); F.txt('how it really works.', 540, 740, { size: 80, f: 'hand', align: 'center', col: C.red, write: ss(R(t, t0 + .4, .7)) });
  F.txt("A new 'wait, really?' every day.", 540, 830, { size: 34, f: 'body', align: 'center', col: '#5d5d62', alpha: R(t, t0 + .8, .5) });
  F.txt('@howitreallyworkstudio', 540, 900, { size: 28, f: 'mono', wt: 700, align: 'center', col: '#45454c', alpha: R(t, t0 + 1.0, .5) });
  F.seal('END', 540, 1020, ss(R(t, t0 + 1.2, .35)), { round: true, size: 40, f: 'mono', fs: 24 });
  const hz = 1180, disc = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; disc.push([540 + Math.cos(a) * 110, hz + Math.sin(a) * 110]); } F.hatch(disc, 'red', { alpha: .75, k: R(t, t0 + .3, .8) }); F.pencil(disc, { col: C.red, w: 2, draw: R(t, t0 + .3, .8) }); F.line(240, hz, 840, hz, { w: 1.4, col: C.graph }); }

const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6, 7: page7 };
function scene(t) { F.begin(); const p = pageAt(t); F.footer(p[2]); const pi = PG.indexOf(p);
  { const z = 1 + .011 * Math.sin(t * .8), dx = 7 * Math.sin(t * .55), dy = 9 * Math.sin(t * .7 + 1); g.setTransform(z, 0, 0, z, W / 2 * (1 - z) + dx, H / 2 * (1 - z) + dy); }   // the camera breathes over the page
  if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; F.alpha(1 - ss(R(t, p[0], .35))); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01)); PREV = false; F.alpha(1); }
  F.alpha(pi === 0 ? 1 : ss(R(t, p[0], .35))); PAGES[p[2]](t); F.alpha(1); }
window.DUR = TOT;
// loop: the last 0.5 s blends at most 35% of frame 0 over the end card
window.seek = t => { const a = TOT - .5; scene(t); if (t > a) { const c = document.getElementById('c'), im = g.getImageData(0, 0, W, H); scene(0); const k = .35 * ss((t - a) / .5), f0 = g.getImageData(0, 0, W, H), d = im.data, f = f0.data; for (let i = 0; i < d.length; i += 4) { d[i] += (f[i] - d[i]) * k; d[i + 1] += (f[i + 1] - d[i + 1]) * k; d[i + 2] += (f[i + 2] - d[i + 2]) * k; } g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.putImageData(im, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { F.begin(); F.footer(1); const ring = ringPts(600, 960, 300); F.hatch(ring, 'red', { alpha: .5 }); F.pencil(ring, { col: C.red, w: 2.2 });
  foot(280, 1300, 1.15, 0, { numb: .7, nerve: 1 }); zzz(660, 720, 1.2, 1);
  F.txt('Why does my', 70, 440, { size: 130, f: 'hand', rot: -.015 }); F.txt('foot sleep?', 70, 590, { size: 140, f: 'hand', col: C.navy, rot: -.015 }); F.seal('PINS', 880, 1380, 1, { round: true, size: 50, f: 'mono', fs: 28 }); };
window.seek(0); window.ready = true; window.READY = true;
