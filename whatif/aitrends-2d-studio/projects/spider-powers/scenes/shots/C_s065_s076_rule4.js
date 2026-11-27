// C_s065_s076_rule4.js — ep 4 batch C part 3: RULE 4 card, FIG 4 trichobothria (near the physical limit), FIG 4b the 2016 Cornell
// hearing study (3 m, ~600 body lengths, no ears just hairs, the low hum, most froze), the eight eyes (telephoto pair, motion all round).
// Numbers as sources.md. LEGAL: no "sensing" text or tingle lines; Pip stays cute; no franchise anything.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, linGrad, text, FONTS } from '/engine/core.js';
import { board, label } from '../sets/bp.js';
import { ruleCard, chip } from '../sets/hud.js';
import { pip, pipFace } from '../sets/spider.js';
import { trichobothria, hearing, eyes8 } from '../sets/spiderbp.js';
import { blinkAmt, camMove } from '../sets/acting.js';
import { wt, push, goldPop, fade, cTxt, gauge, wasp, gardenBg } from './C_lib.js';
import * as FX from '/engine/fx2d.js';

const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 65 });
const U = () => S().ui;

// s065 RULE 4 card over the dimmed lawn with the burst-balloon puddle
registerShot('s065', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.01 * t, x: 0, y: 0 };
  ruleCard(g, t, info, { n: 4, title: 'YOU CAN HEAR WITH HAIR.', bg: (g, t) => { blurLayer(g, 8, (g) => gardenBg(g, t, cam, { puddle: 1 }), null, 1); veil(g, '#140f1c', 0.25); } });
  chip(g, t, { str: 'TRICHOBOTHRIA', at: wt(info, 'trichobothria.', 1.77), y: E.H * 0.92, dur: info.dur });
} });

// a soft gold puff of air drifting in from the left
function puff(g, t, x, y, k) { if (k <= 0.01) return; for (let i = 0; i < 5; i++) { const px = x + i * 34 + Math.sin(t * 3 + i) * 8, py = y + Math.cos(t * 2.4 + i * 1.7) * 18; glow(g, px, py, 60 - i * 6, U().gold, 0.18 * k); }
  g.save(); g.globalAlpha *= k; g.strokeStyle = alpha(U().gold, 0.7); g.lineWidth = 3; for (let j = 0; j < 3; j++) { g.beginPath(); for (let i = 0; i <= 20; i++) { const xx = x - 60 + i * 12, yy = y - 30 + j * 30 + Math.sin(i * 0.7 + t * 6 + j) * 6; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } g.restore(); }

// s066 FIG 4: the faintest puff bends the hairs
registerShot('s066', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - FEELING THE AIR', fig: 'TRICHOBOTHRIA' });
  const tP = wt(info, 'puff', 0.79), tB = wt(info, 'bends', 1.25);
  push(g, t, info.dur, () => {
    const T = trichobothria(g, t, { x: E.W * 0.5, y: E.H * 0.6, s: 1, k: ease.out(prog(t, 0, 0.9)), air: ease.inOut(prog(t, tP, tB)) });
    puff(g, t, lerp(E.W * 0.08, E.W * 0.36, ease.out(prog(t, tP - 0.1, tB + 0.3))), E.H * 0.33, prog(t, tP - 0.1, tP + 0.2));
    label(g, t, { at: T.hair, to: [T.hair[0] + 220, E.H * 0.18], str: 'hairs feel the air', start: wt(info, 'faintest', 0.39) });
  });
  air(g, t);
} });

// s067 FIG 4: close to the physical limit of any sensor
registerShot('s067', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - FEELING THE AIR', fig: 'NEAR THE LIMIT' });
  const tL = wt(info, 'limit', 1.69), tS = wt(info, 'sensor', 2.95);
  push(g, t, info.dur, () => {
    trichobothria(g, t, { x: E.W * 0.3, y: E.H * 0.62, s: 0.62, k: 1, air: 0.45 + 0.25 * Math.sin(t * 1.6) });
    const v = lerp(0.1, 0.9, ease.inOut(prog(t, 0.4, tL))), cx = E.W * 0.72, cy = E.H * 0.62, Gq = gauge(g, t, cx, cy, 240, v, { limit: 0.92 });
    cTxt(g, 'SENSITIVITY', cx, cy + 80, { size: 30 });
    if (t > tL - 0.05) label(g, t, { at: Gq.limit, to: [Gq.limit[0] - 60, E.H * 0.2], str: 'PHYSICAL LIMIT', start: tL });
    if (t > tL) ring(g, cx, cy, 240 + 60 * prog(t, tL, tL + 0.5), 3, alpha(U().gold, 0.6 * (1 - prog(t, tL, tL + 0.5))));
    fade(g, prog(t, tS, tS + 0.4), () => cTxt(g, 'close to the limit of any sensor', E.W * 0.5, E.H * 0.88, { size: 34, color: U().gold }));
  });
  air(g, t);
} });

// FIG 4b shared: the hearing board with a lab-bench outline. d stops at 0.985 (spiderbp only prints its combined 3 m label at d >= 0.99),
// so this batch draws its own 3 m tick + gold '3 m' and the '~600 BODY LENGTHS' on their words.
const HX = E.W * 0.5, HY = E.H * 0.5, HW = 1400, SX = HX - HW / 2 + 40, X1 = HX - HW / 2 + HW * 0.9;
function hearBoard(g, t, info, o, extra) {
  board(g, t, { title: 'FIG 4 - HEARING WITH HAIR', fig: '2016, CORNELL' });
  push(g, t, info.dur, () => {
    const k = o.k ?? 1; g.save(); g.globalAlpha *= k; seg(g, [[SX - 120, HY + 230], [X1 + 140, HY + 230]], 5, alpha(U().cream, 0.8)); for (const lx of [SX - 60, X1 + 80]) seg(g, [[lx, HY + 230], [lx, HY + 330]], 5, alpha(U().cream, 0.6)); g.restore();   // the lab bench
    const A = hearing(g, t, { x: HX, y: HY, w: HW, k, d: Math.min(0.985, o.d ?? 0), hum: o.hum ?? 0 });
    if (o.tick) { seg(g, [[X1, HY + 58], [X1, HY + 82]], 3, U().gold); seg(g, [[lerp(SX, X1, 0.985), HY + 70], [X1, HY + 70]], 4, U().gold); cTxt(g, '3 m', X1, HY + 110, { size: 26 }); }
    extra && extra(A);
  });
  air(g, t);
}

// s068 2016, CORNELL
registerShot('s068', { draw(g, t, info) {
  hearBoard(g, t, info, { k: ease.out(prog(t, 0.19, 1.2)), d: 0 }, () => {
    goldPop(g, t, '2016', wt(info, '2016,', 0.29), E.W * 0.22, E.H * 0.24, 110, { rot: -0.06 });
    const tC = wt(info, 'Cornell', 1.99), p = ease.outBack(prog(t, tC, tC + 0.35)); if (p > 0.01) { g.save(); g.translate(E.W * 0.22, E.H * 0.35); g.scale(p, p); rr(g, -130, -30, 260, 60, 12); g.fillStyle = 'rgba(10,16,32,.9)'; g.fill(); g.strokeStyle = U().cream; g.lineWidth = 3; g.stroke(); cTxt(g, 'CORNELL', 0, 2, { size: 34 }); g.restore(); }
  });
} });

// s069 3 METRES: the rings cross the board, the line stretches to 3 m, the spider's leg hairs twitch
registerShot('s069', { draw(g, t, info) {
  const tM = wt(info, 'metres', 2.71), tA = wt(info, 'away.', 3.03), d = ease.inOut(prog(t, 1.09, tM));
  hearBoard(g, t, info, { d, tick: t >= tM }, () => {
    goldPop(g, t, '3 m', tM, (SX + X1) / 2, HY - 130, 96);
    const tw = Math.exp(-Math.max(0, t - tA) * 5) * (t > tA ? 1 : 0); if (tw > 0.02) for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.4; seg(g, [[SX + Math.cos(a) * 30, HY + Math.sin(a) * 30], [SX + Math.cos(a + Math.sin(t * 40 + i) * 0.3 * tw) * 50, HY + Math.sin(a + Math.sin(t * 40 + i) * 0.3 * tw) * 50]], 2, alpha(U().gold, tw)); }
  });
} });

// s070 ~600 BODY LENGTHS: tiny spider icons fill the 3 m line nose to tail
registerShot('s070', { draw(g, t, info) {
  const tB = wt(info, 'body', 0.89);
  hearBoard(g, t, info, { d: 1, tick: 1 }, () => {
    goldPop(g, t, '3 m', -1, (SX + X1) / 2, HY - 130, 96, { until: 0.3 });
    const n = Math.floor(60 * ease.inOut(prog(t, 0.17, tB + 0.1))), step = (X1 - SX) / 60;
    for (let i = 0; i < n; i++) { const x = SX + 10 + i * step, y = HY + 30; circle(g, x, y, 5, U().cream); circle(g, x + 7, y - 1, 3.5, U().cream); for (const sd of [-1, 1]) seg(g, [[x, y], [x - 4, y + sd * 9]], 1.5, U().cream); }
    if (n > 0) cTxt(g, `x${Math.round(n * 10)}`, SX + 10 + n * step, HY - 6, { size: 22, align: 'left', color: U().gold });
    goldPop(g, t, '~600 BODY LENGTHS', tB, (SX + X1) / 2, HY - 140, 80);
  });
} });

// s071 NO EARS, JUST HAIRS: giant Pip; cartoon ears get a gold X, then the fuzz ripples and a gold tick
registerShot('s071', { draw(g, t, info) {
  const tN = wt(info, 'No', 0.16), tE = wt(info, 'ears.', 0.34), tJ = wt(info, 'Just', 1.4), tH = wt(info, 'hairs.', 1.7), u = U();
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#c8b89a', '#8a7a60']); g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.3, E.H * 0.2, 900, '#fff4dc', 0.3);
  const cx = E.W * 0.5, cy = E.H * 0.56, r = E.H * 0.38 * lerp(1, 1.04, t / info.dur), rip = prog(t, tJ, tJ + 0.3);
  pipFace(g, cx, cy, r, { t: t + rip * Math.sin(t * 9) * 0.4, look: [Math.sin(t * 0.8) * 0.3, 0], blink: blinkAmt(t, 2.6, 2), tilt: Math.sin(t * 1.1) * 0.6 });
  if (rip > 0) for (let j = 0; j < 3; j++) { g.strokeStyle = alpha('#fff4dc', 0.55 * rip * (1 - j * 0.25)); g.lineWidth = 4; g.beginPath(); for (let a = Math.PI * 1.05; a <= Math.PI * 1.95; a += 0.04) { const rr2 = r * (1.12 + j * 0.09) + Math.sin(a * 14 - t * 10 + j) * 10; const px = cx + Math.cos(a) * rr2 * 1.05, py = cy + Math.sin(a) * rr2 * 0.9; a === Math.PI * 1.05 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
  // the cartoon ears beside its head, then the X
  const ek = ease.outBack(prog(t, tN, tN + 0.25)) * (1 - prog(t, tJ - 0.2, tJ + 0.1));
  for (const sd of [-1, 1]) if (ek > 0.01) { g.save(); g.translate(cx + sd * r * 1.3, cy - r * 0.55); g.scale(ek * sd, ek); g.strokeStyle = u.cream; g.lineWidth = 8; g.beginPath(); g.moveTo(-10, -60); g.bezierCurveTo(60, -80, 70, 30, 10, 60); g.stroke(); g.beginPath(); g.moveTo(2, -30); g.bezierCurveTo(36, -30, 36, 20, 4, 24); g.stroke(); g.restore();
    const xk = ease.outBack(prog(t, tE, tE + 0.2)); if (xk > 0) { g.save(); g.translate(cx + sd * r * 1.33, cy - r * 0.55); g.scale(xk, xk); seg(g, [[-50, -50], [50, 50]], 12, u.gold); seg(g, [[50, -50], [-50, 50]], 12, u.gold); g.restore(); } }
  const tk = ease.outBack(prog(t, tH, tH + 0.3)); if (tk > 0) { g.save(); g.translate(cx + r * 1.3, cy - r * 0.6); g.scale(tk, tk); glow(g, 0, 0, 120, u.gold, 0.3); g.strokeStyle = u.gold; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, 0); g.lineTo(-10, 34); g.lineTo(50, -40); g.stroke(); g.restore(); cTxt(g, 'HAIRS', cx + r * 1.3, cy - r * 0.6 + 90, { size: 36, color: u.gold, alpha: tk }); }
} });

// s072 THE LOW HUM: a slow gold waveform from the speaker; a small friendly wasp with matching wingbeat
registerShot('s072', { draw(g, t, info) {
  const tW = wt(info, 'wingbeat', 2.38), tA = wt(info, 'wasps', 3.16), hum = ease.out(prog(t, 0.62, 1.1));
  hearBoard(g, t, info, { d: 1, tick: 1, hum }, (A) => {
    if (hum > 0) { g.save(); g.globalAlpha *= hum; g.strokeStyle = U().gold; g.lineWidth = 4; g.beginPath(); const x0 = X1 - 40, len = (X1 - SX - 120) * ease.out(prog(t, 0.62, 2.0)); for (let i = 0; i <= 120; i++) { const xx = x0 - len * i / 120, yy = HY - 10 + Math.sin(i * 0.35 + t * 7) * 26; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); g.restore(); }
    wasp(g, t, X1 - 120, HY - 260, 1.1, prog(t, tW, tW + 0.35));
    if (t > tA - 0.05) label(g, t, { at: [X1 - 160, HY - 250], to: [X1 - 420, HY - 330], str: 'like a hunting wasp\'s wings', start: tA });
  });
} });

// s073 MOST FROZE: five cute jumping spiders mid-hop on a leaf freeze; Pip frozen mid-wave
registerShot('s073', { draw(g, t, info) {
  const tF = wt(info, 'froze.', 0.45), tt = Math.min(t, tF), fr = t >= tF, cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: fr ? 0 : 0.4 });
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#9ec88a', '#5e8e4a']); g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.7, E.H * 0.15, 900, '#fff8d8', 0.3);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2, -E.H / 2);
  const ly = E.H * 0.66; g.fillStyle = linGrad(g, 0, ly - 60, 0, ly + 140, ['#7ac05a', '#3e7a32']); g.beginPath(); g.moveTo(E.W * 0.04, ly + 40); g.quadraticCurveTo(E.W * 0.5, ly - 120, E.W * 0.96, ly + 20); g.quadraticCurveTo(E.W * 0.5, ly + 200, E.W * 0.04, ly + 40); g.fill();
  seg(g, [[E.W * 0.06, ly + 40], [E.W * 0.94, ly + 22]], 5, alpha('#d8f0b0', 0.6));
  const cols = [0, 1, 2, 3, 4];
  for (const i of cols) { const x = E.W * (0.18 + i * 0.16), y = ly - 10 + (i - 2) ** 2 * 6, ph = ((tt * 1.3 + i * 0.27) % 1);
    g.save(); if (i !== 2) { g.filter = i % 2 ? 'saturate(0.6) brightness(1.15)' : 'brightness(0.85)'; }
    pip(g, x, y, i === 2 ? 2.6 : 2.2, { t: tt, hop: i === 2 ? 0 : ph, wave: i === 2 ? 1 : 0, facing: i < 2 ? 1 : -1, look: [i < 2 ? 0.5 : -0.5, 0], blink: 0, tilt: i === 2 ? 0.5 : Math.sin(i) * 0.4 });
    g.restore(); }
  g.restore();
  if (fr) { const fl = 1 - prog(t, tF, tF + 0.5); g.fillStyle = alpha('#bfe4ff', 0.18 + 0.35 * fl); g.fillRect(0, 0, E.W, E.H); g.fillStyle = alpha('#ffffff', 0.4 * fl); g.fillRect(0, 0, E.W, E.H); }
  chip(g, t, { str: 'MOST FROZE', at: tF, x: E.W * 0.5, y: E.H * 0.2, dur: info.dur, tone: 'blue' });
} });

// s074 EIGHT EYES: giant Pip; eight gold ticks count 1..8, the eyes light, a gold 8 pops
registerShot('s074', { draw(g, t, info) {
  const tE = wt(info, 'eight', 0.75), tY = wt(info, 'eyes.', 0.95), u = U(), z = lerp(1, 1.06, ease.inOut(t / info.dur));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#c8b89a', '#8a7a60']); g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.3, E.H * 0.2, 900, '#fff4dc', 0.3);
  const cx = E.W * 0.5, cy = E.H * 0.6, r = E.H * 0.36 * z;
  pipFace(g, cx, cy, r, { t, look: [0, -0.1], blink: blinkAmt(t, 2.6, 6), tilt: Math.sin(t * 1.2) * 0.3 });
  const eyesXY = [[-0.36, 0.05, 0.32], [0.36, 0.05, 0.32], [-0.8, -0.12, 0.09], [0.8, -0.12, 0.09]];
  const lit = Math.floor(8 * prog(t, tE - 0.12, tY + 0.05));
  eyesXY.forEach(([ex, ey, er], i) => { if (lit > [0, 1, 2, 3][i] * 2) glow(g, cx + ex * r, cy + ey * r, er * r * 2.2, u.gold, 0.35); });
  for (let i = 0; i < 8; i++) if (i < lit) { const a = Math.PI * (1.15 + i * 0.1), px = cx + Math.cos(a) * r * 1.25, py = cy + Math.sin(a) * r * 1.12; circle(g, px, py, 26, alpha('#0b1324', 0.8)); ring(g, px, py, 26, 3, u.gold); text(g, String(i + 1), px, py + 2, { size: 30, color: u.gold, font: FONTS.ui, weight: 900 }); }
  goldPop(g, t, '8', tY, E.W * 0.84, E.H * 0.3, 220);
} });

// s075 FIG 4c TELEPHOTO PAIR: the two big front eyes' narrow cones reach far forward
registerShot('s075', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - EIGHT EYES', fig: 'TELEPHOTO PAIR' });
  const tF = wt(info, 'front', 0.57), tZ = wt(info, 'zoom', 2.55);
  push(g, t, info.dur, () => {
    const Y = eyes8(g, t, { x: E.W * 0.5, y: E.H * 0.62, s: 0.8, k: ease.out(prog(t, 0, 0.7)), fov: 0.5 * ease.inOut(prog(t, tF, 2.85)) });
    goldPop(g, t, '2', wt(info, 'Two', 0.15), E.W * 0.32, E.H * 0.34, 120);
    if (t > tZ - 0.05) { label(g, t, { at: Y.front, to: [Y.front[0] + 220, Y.front[1] + 30], str: 'telephoto pair', start: tZ }); fade(g, prog(t, tZ + 0.3, tZ + 0.6), () => cTxt(g, 'like zoom lenses', Y.front[0] + 234, Y.front[1] + 76, { align: 'left', size: 28 })); }
  });
  air(g, t);
} });

// s076 FIG 4c ALMOST ALL THE WAY ROUND: the side eyes' wide motion arcs sweep round; a moving dot circles and the arcs light as it passes
registerShot('s076', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - EIGHT EYES', fig: 'MOTION ALL ROUND' });
  const tA = wt(info, 'almost', 1.33), u = U(), cx = E.W * 0.5, cy = E.H * 0.62;
  push(g, t, info.dur, () => {
    const fov = lerp(0.5, 1, ease.inOut(prog(t, 0.61, 2.43))), Y = eyes8(g, t, { x: cx, y: cy, s: 0.8, k: 1, fov });
    const a = -Math.PI / 2 + (t - 0.4) * 2.2, R = 300; if (t > 0.4) { const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R * 0.9; glow(g, px, py, 70, u.gold, 0.4); circle(g, px, py, 10, u.gold); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(u.blueprint, 0.16); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 420 * 0.8 * fov, a - 0.5, a + 0.5); g.closePath(); g.fill(); g.restore(); }
    const L = [2 * cx - Y.side[0], Y.side[1]]; label(g, t, { at: L, to: [L[0] - 80, L[1] - 260], str: 'movement, almost all round', start: tA });
  });
  air(g, t);
} });
