// B_s031_s042_size.js — ep 4 batch B: RULE 2 science (square-cube x2/x8/x4, the law, tiny-and-strong, scale-up flop, 225 species, mites to
// geckos, ~200-fold, the human: ~40% pads / US size 114 shoes, the SIZE LIMIT verdict). Numbers as sources.md. LEGAL: original hero only.
import { E, S, registerShot, layer, blurLayer, ease, prog, clamp, lerp, alpha, glow, seg, circle, ring, rr, poly, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { garden, gardenFg } from '../sets/garden.js';
import { pip, gloves } from '../sets/spider.js';
import { board, label, draw } from '../sets/bp.js';
import { squareCube, padShare } from '../sets/spiderbp.js';
import { blinkFlag, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, W, stamp, goldTag, ant, daisy, giantShoe, pads, floorBalance } from './B_lib.js';

const CX = E.W / 2;
const push = (g, t, dur, fn) => { const z = 1 + 0.035 * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const BOARD2 = (g, t, fig) => board(g, t, { title: 'FIG 2 - THE SIZE PROBLEM', fig });

// s031 — the cube doubles in height: "x2 TALL" on "twice", the weight readout runs to x8 on "eight"
registerShot('s031', { draw(g, t, info) {
  const tTw = wt(info, 'twice', 0.77), tTall = wt(info, 'tall', 1.41, 1.0), tEi = wt(info, 'eight', 2.97, 2.5);
  BOARD2(g, t, 'SQUARE-CUBE LAW');
  push(g, t, info.dur, () => {
    const grow = 0.6 * ease.inOut(prog(t, tTw, tTall)) + 0.4 * ease.inOut(prog(t, tTall + 0.3, tEi));
    const C = squareCube(g, t, { x: E.W * 0.5, y: E.H * 0.42, s: 1.2, k: ease.out(prog(t, 0.05, 0.95)), grow });
    goldTag(g, t, tTw, 'x2 TALL', C.big[0] - 300, C.big[1] - 60);
    goldTag(g, t, tEi, 'WEIGHT x8', E.W * 0.78, E.H * 0.2, { size: 54 });
  });
} });

// s032 — the foot face lights, "AREA x4" on "four"; a balance below tips: WEIGHT x8 outweighs AREA x4
registerShot('s032', { draw(g, t, info) {
  const tFour = wt(info, 'four', 2.55, 2.0), tTimes = wt(info, 'times', 2.83, 2.4), ui = S().ui;
  BOARD2(g, t, 'SQUARE-CUBE LAW');
  push(g, t, info.dur, () => {
    const C = squareCube(g, t, { x: E.W * 0.5, y: E.H * 0.34, s: 1.0, k: 1, grow: 1 });
    const fk = ease.out(prog(t, tFour - 0.5, tFour)); if (fk > 0) { const L = 240, bx = C.big[0], by = C.big[1] + L; g.fillStyle = alpha(ui.gold, 0.35 * fk); g.fillRect(bx - L / 2, by - 10, L, 20); glow(g, bx, by, 200, ui.gold, 0.2 * fk); }   // the foot face
    goldTag(g, t, tFour, 'AREA x4', E.W * 0.22, E.H * 0.3, { size: 54 });
    floorBalance(g, t, E.W * 0.5, E.H * 0.72, ease.outBack(prog(t, tTimes, tTimes + 0.4)));
  });
} });

// s033 — the SQUARE-CUBE LAW stamp + a small formula strip
registerShot('s033', { draw(g, t, info) {
  const tSq = wt(info, 'square', 0.85), ui = S().ui;
  BOARD2(g, t, 'AREA GROWS SLOWER THAN WEIGHT');
  push(g, t, info.dur, () => {
    squareCube(g, t, { x: E.W * 0.5, y: E.H * 0.3, s: 0.9, k: 1, grow: 1 });
    stamp(g, t, tSq, 'SQUARE-CUBE LAW', E.W * 0.5, E.H * 0.72, { size: 70 });
    const fk = ease.out(prog(t, tSq + 0.3, tSq + 0.9)); if (fk > 0) text(g, 'area ~ L²     weight ~ L³', E.W * 0.5, E.H * 0.86, { size: 42, color: ui.cream, font: FONTS.ui, weight: 800, alpha: fk });
  });
} });

// s034 — TINY AND STRONG: lawn macro, an ant marches past with a giant crumb, Pip watches from a daisy; behind, he strains at a watering can
registerShot('s034', { draw(g, t, info) {
  const tTiny = wt(info, 'tiny', 0.91, 0.5), tStr = wt(info, 'strong', 2.49, 2.0);
  const cam = camMove(t, info.dur, { z: [1.5, 1.56], x: [-60, -40], y: [170, 176] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  blurLayer(g, 5, (g) => {                                                                                      // the hero in soft focus behind
    const o = { x: G.CX - 520, y: G.GY + 10, s: 1.9, facing: 1 }, strain = ease.out(prog(t, 1.2, tStr)), tr = Math.sin(t * 40) * 2 * strain;
    const p = idle({ ...POSES.crouch, eF: [30, -90], hF: [46, -70 - 30 * strain], eB: [24, -92], hB: [40, -72 - 30 * strain] }, t, 2);
    actor(g, 'HERO', { ...o, x: o.x + tr, pose: p, expr: exprAt(t, [[0, 'determined'], [tStr, 'worried']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0.6), rim: G.rim, t });
    gloves(g, o, p, { t }); const [hx, hy] = W(o, p.hF); rr(g, hx - 10, hy - 20 - 30 * strain, 150, 110, 18); g.fillStyle = '#3a8a5a'; g.fill(); seg(g, [[hx + 140, hy + 10 - 30 * strain], [hx + 240, hy - 40 - 30 * strain]], 14, '#3a8a5a');   // the watering can
  }, cam, 1);
  layer(g, cam, 1.15, (g) => {
    const gy = G.GY + 230; for (let i = 0; i < 40; i++) seg(g, [[G.CX - 900 + i * 50, gy + 10], [G.CX - 900 + i * 50 + Math.sin(t + i) * 6, gy - 30 - (i % 4) * 12]], 5, '#4a8a3a');   // grass blades
    const ax = lerp(G.CX - 600, G.CX + 300, prog(t, tTiny - 0.5, info.dur + 0.5)); ant(g, ax, gy, 3.2, t, { facing: 1 });
    const top = daisy(g, G.CX + 420, gy, 2.6, t); pip(g, top[0], top[1] + 4, 1.6, { t, tilt: Math.sin(t * 1.4) * 0.8, look: [-1, 0.3], blink: blinkFlag(t, 2.6, 1) ? 1 : 0 });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
} });

// s035 — SCALE IT UP: the ant outline grows to human size, the ADVANTAGE bar shrinks to zero, its thin legs buckle and it flops
function antArt(g, x, y, s, flop, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 3 / s * 2; g.lineCap = 'round';
  const L = (a, b) => { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); };
  const body = flop * 22;
  for (const cx of [-24, 0, 26]) { g.beginPath(); g.ellipse(cx, -40 + body, cx === 0 ? 10 : 14, 11, 0, 0, 7); g.stroke(); }
  for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { const kx = -10 + i * 10, kn = [kx + sd * 6, -26 + body * 0.5 + flop * 10], ft = [kx + sd * (14 + flop * 18), 0]; L([kx, -36 + body], kn); L(kn, ft); }
  L([32, -46 + body], [44, -64 + body]); L([30, -48 + body], [38, -66 + body]);
  g.restore();
}
registerShot('s035', { draw(g, t, info) {
  const tSc = wt(info, 'scale', 0.3), tUp = wt(info, 'up', 0.56, 0.4, true), tAdv = wt(info, 'advantage', 1.2, 0.9), tDis = wt(info, 'disappears', 1.68, 1.4), ui = S().ui;
  BOARD2(g, t, 'BIGGER = WEAKER FOR ITS SIZE');
  push(g, t, info.dur, () => {
    const sc = lerp(1.2, 9, ease.inOut(prog(t, tSc, tUp + 0.3))), flop = ease.in(prog(t, tDis, tDis + 0.35));
    antArt(g, E.W * 0.42, E.H * 0.8, sc, flop, ui.cream);
    // scale reference: a human line figure beside it
    g.save(); g.strokeStyle = alpha(ui.blueprint, 0.7); g.lineWidth = 4; const hx = E.W * 0.75, hb = E.H * 0.8; g.beginPath(); g.arc(hx, hb - 400, 34, 0, 7); g.stroke(); seg(g, [[hx, hb - 366], [hx, hb - 180]], 4, alpha(ui.blueprint, 0.7)); seg(g, [[hx - 60, hb], [hx, hb - 180], [hx + 60, hb]], 4, alpha(ui.blueprint, 0.7)); seg(g, [[hx - 70, hb - 260], [hx, hb - 330], [hx + 70, hb - 260]], 4, alpha(ui.blueprint, 0.7)); g.restore();
    const bar = 1 - ease.inOut(prog(t, tAdv, tDis + 0.1)), bx = E.W * 0.12, by = E.H * 0.2;
    text(g, 'ADVANTAGE', bx, by - 34, { size: 32, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
    rr(g, bx, by, 520, 34, 17); g.strokeStyle = alpha(ui.gold, 0.7); g.lineWidth = 3; g.stroke(); if (bar > 0.01) { rr(g, bx + 4, by + 4, 512 * bar, 26, 13); g.fillStyle = ui.gold; g.fill(); }
  });
} });

// s036-s039, s042 — the 225-species chart (padShare)
const CHART = { x: E.W * 0.5, y: E.H * 0.54, w: 1400, h: 560 };
registerShot('s036', { draw(g, t, info) {
  const tCam = wt(info, 'cambridge', 0.24), tTw = wt(info, 'twenty', 2.64, 2.0);
  board(g, t, { title: 'FIG 2b - 225 CLIMBING SPECIES', fig: 'PAD SHARE vs BODY SIZE' });
  push(g, t, info.dur, () => {
    padShare(g, t, { ...CHART, k: lerp(0.05, 0.95, prog(t, tCam, info.dur - 0.4)), human: 0 });
    goldTag(g, t, tCam, 'CAMBRIDGE', E.W * 0.82, E.H * 0.18, { size: 34, color: S().ui.cream });
    goldTag(g, t, tTw, '225 SPECIES', E.W * 0.32, E.H * 0.2, { size: 54 });
  });
} });
registerShot('s037', { draw(g, t, info) {
  const tMi = wt(info, 'mites', 0.75), tGe = wt(info, 'geckos', 1.41, 1.0), ui = S().ui;
  board(g, t, { title: 'FIG 2b - 225 CLIMBING SPECIES', fig: 'FROM MITES TO GECKOS' });
  push(g, t, info.dur, () => {
    const P = padShare(g, t, { ...CHART, k: 1, human: 0 });
    const sw = ease.inOut(prog(t, tMi, tGe)); if (sw > 0) { const x = lerp(P.mite[0], P.gecko[0], sw), y = lerp(P.mite[1], P.gecko[1], sw); glow(g, x, y, 90, ui.gold, 0.5); circle(g, x, y, 10, ui.gold); }
    label(g, t, { at: P.mite, to: [P.mite[0] + 40, P.mite[1] - 160], str: 'mites', start: tMi });
    label(g, t, { at: P.gecko, to: [P.gecko[0] + 120, P.gecko[1] + 120], str: 'geckos', start: tGe });
    const mk = ease.outBack(prog(t, tMi, tMi + 0.3)); if (mk > 0.01) { g.save(); g.translate(P.mite[0], P.mite[1] + 50); g.scale(mk, mk); circle(g, 0, 0, 7, ui.cream); for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) seg(g, [[0, 0], [sd * 12, -6 + i * 4]], 1.5, ui.cream); g.restore(); }
    const gk = ease.outBack(prog(t, tGe, tGe + 0.3)); if (gk > 0.01) { g.save(); g.translate(P.gecko[0] - 30, P.gecko[1] + 60); g.scale(gk, gk); g.strokeStyle = ui.cream; g.lineWidth = 4; g.beginPath(); g.ellipse(0, 0, 44, 14, 0, 0, 7); g.stroke(); seg(g, [[40, 0], [80, -10], [110, 6]], 4, ui.cream); circle(g, -52, -4, 12, 'rgba(0,0,0,0)'); g.beginPath(); g.arc(-56, -4, 13, 0, 7); g.stroke(); for (const [dx, dy] of [[-24, 14], [24, 14], [-24, -14], [24, -14]]) seg(g, [[dx, dy * 0.6], [dx + Math.sign(dx) * 6, dy * 2]], 4, ui.cream); g.restore(); }
  });
} });
registerShot('s038', { draw(g, t, info) {
  const tBig = wt(info, 'bigger', 0.43), tSt = wt(info, 'sticky', 2.53, 2.0), ui = S().ui;
  board(g, t, { title: 'FIG 2b - 225 CLIMBING SPECIES', fig: 'BIGGER NEEDS MORE FOOT' });
  push(g, t, info.dur, () => {
    const P = padShare(g, t, { ...CHART, k: 1, human: 0 });
    const gk = ease.out(prog(t, tBig, tBig + 1.2)); for (let i = 0; i <= 6; i++) { const u = i / 6, x = lerp(P.mite[0], P.gecko[0], u), y = lerp(P.mite[1], P.gecko[1], u) - 50; g.fillStyle = alpha(ui.gold, 0.5 * gk); g.beginPath(); g.ellipse(x, y, 4 + 26 * u * gk, 3 + 12 * u * gk, 0, 0, 7); g.fill(); }   // pad patches growing with body size
    const bk = ease.out(prog(t, tSt, tSt + 0.4)); if (bk > 0) { const bx = P.gecko[0] + 60; seg(g, [[bx, P.mite[1]], [bx + 20, P.mite[1]], [bx + 20, P.gecko[1]], [bx, P.gecko[1]]], 4, alpha(ui.gold, bk)); goldTag(g, t, tSt, '~200-FOLD', bx + 150, (P.mite[1] + P.gecko[1]) / 2, { size: 46 }); }
  });
} });
registerShot('s039', { draw(g, t, info) {
  const tHu = wt(info, 'human', 0.49), tCl = wt(info, 'climb', 0.99, 0.7);
  board(g, t, { title: 'FIG 2b - 225 CLIMBING SPECIES', fig: 'NOW A HUMAN' });
  push(g, t, info.dur, () => {
    const turn = Math.sin(clamp((t - tCl) / 0.6) * Math.PI) * 10;
    g.save(); g.translate(turn, 0); padShare(g, t, { ...CHART, k: 1, human: ease.out(prog(t, tHu, tHu + 0.5)) }); g.restore();
  });
} });

// s040 — 40% OF YOUR BODY: on the lawn, grey sticky pads fill in over 40% of him; the gold counter rolls to 40%
registerShot('s040', { draw(g, t, info) {
  const tFo = wt(info, 'forty', 0.35), tPc = wt(info, 'percent', 0.72), tSt = wt(info, 'sticky', 2.47, 2.0), ui = S().ui;
  const cam = camMove(t, info.dur, { z: [1.4, 1.48], x: [-300, -280], y: [80, 70] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' });
  layer(g, cam, 1, (g) => {
    const o = { x: G.CX - 300, y: G.GY + 20, s: 1.9, facing: 1 }, p = idle(poseAt(t, [[0, { ...POSES.stand, eF: [24, -136], hF: [44, -110], eB: [-18, -136], hB: [-36, -110] }], [tSt - 0.3, 'shrug']]), t, 3);
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'worried'], [tSt, 'sheepish']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(0.2, 1), rim: G.rim, t });
    gloves(g, o, p, { t });
    pads(g, o, p, ease.out(prog(t, tFo, tPc + 0.4)));
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
  const n = Math.round(40 * ease.out(prog(t, tFo, tPc + 0.3))); if (t > tFo - 0.05) goldTag(g, t, tFo, `${n}%`, E.W * 0.74, E.H * 0.3, { size: 110 });
  if (t > tPc) text(g, 'OF YOUR BODY: STICKY PADS', E.W * 0.72, E.H * 0.4, { size: 34, color: ui.cream, font: FONTS.ui, weight: 900, alpha: clamp((t - tPc) * 3), stroke: 6, strokeColor: '#140f18' });
} });

// s041 — US SIZE 114: he stands in two enormous sticky-sole shoes (his wellies beside them for scale), flappy step; Mina's jaw drops; Pip rides a toe
registerShot('s041', { draw(g, t, info) {
  const tSh = wt(info, 'shoes', 0.29), tOne = wt(info, 'one', 1.39, 1.0), tF = wt(info, 'fourteen', 2.61, 2.0);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-80, -20], y: [60, 54] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' }), gy = G.GY + 40;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: G.CX + 700, y: G.GY + 10, s: 2.0, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [tSh + 0.3, 'handsOnHead']]), t, 1), expr: exprAt(t, [[0, 'smile'], [tSh + 0.3, 'shocked']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0.3), rim: G.rim, t });
    const step = Math.sin(clamp((t - tSh) / 0.6) * Math.PI), hx = G.CX - 200;
    giantShoe(g, hx - 60, gy + 10, 760); giantShoe(g, hx + 40 + step * 60, gy - step * 40, 760);
    const o = { x: hx, y: gy - 46, s: 1.9, facing: 1 }, p = idle(poseAt(t, [[0, 'stand'], [tSh, { ...POSES.stand, kF: [16, -60], fF: [30, -30] }], [tSh + 0.6, 'stand']]), t, 2);
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'neutral'], [tSh + 0.2, 'sheepish']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(0.4, 0.8), rim: G.rim, t }); gloves(g, o, p, { t });
    for (const dx of [-560, -500]) { rr(g, hx + dx, gy - 120, 48, 120, 10); g.fillStyle = '#3f8f4a'; g.fill(); rr(g, hx + dx - 6, gy - 20, 70, 22, 8); g.fill(); }   // the green wellies, for scale
    pip(g, hx + 40 + 380 + step * 60, gy - 60 - step * 40, 1.6, { t, tilt: Math.sin(t * 2), look: [1, 0], blink: blinkFlag(t, 2.6, 2) ? 1 : 0 });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
  const n = t < tOne ? 0 : Math.round(lerp(1, 114, ease.inOut(prog(t, tOne, tF)))); if (n > 0) goldTag(g, t, tOne, `US SIZE ${n}`, E.W * 0.5, E.H * 0.16, { size: 64 });
} });

// s042 — THE VERDICT: stamp on "verdict", the SIZE LIMIT line at the gecko on "limit"; the human outline slides off the chart on "sticky"
registerShot('s042', { draw(g, t, info) {
  const tV = wt(info, 'verdict', 0.27), tLim = wt(info, 'limit', 2.39, 1.8), tSt = wt(info, 'sticky', 3.55, 3.0), ui = S().ui;
  board(g, t, { title: 'FIG 2b - THE VERDICT', fig: 'GECKOS: ABOUT THE SIZE LIMIT' });
  push(g, t, info.dur, () => {
    const off = ease.in(prog(t, tSt, tSt + 0.8));
    g.save(); g.globalAlpha *= 1; const P = padShare(g, t, { ...CHART, k: 1, human: 1 - off }); g.restore();
    const lk = ease.inOut(prog(t, tLim, tLim + 0.6)); if (lk > 0) { const y = P.gecko[1] - 30, x0 = CHART.x - CHART.w / 2; seg(g, [[x0, y], [lerp(x0, x0 + CHART.w, lk), y]], 6, ui.gold); text(g, 'SIZE LIMIT', x0 + 20, y - 34, { size: 40, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', alpha: lk }); }
    stamp(g, t, tV, 'VERDICT', E.W * 0.8, E.H * 0.2, { size: 64, rot: 0.08 });
  });
} });
