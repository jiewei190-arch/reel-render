// B_s027_s032_week_month1.js — ep 3 batch B: WEEK 1 on the stairs ("Mostly."), MONTH 1 (five sets, Dev films, Mina measures, the HAIR LOG),
// the mirror gag. Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, rr, poly, linGrad, shade, mix, text, FONTS, talkAmount } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { home3, home3Fg, hairLog, tapeMeasure, filmPhone } from '../sets/home3.js';
import { pushUp, trainee, repCounter } from '../sets/train.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpShake } from '../sets/jump.js';
import { heroFace, wt, skipCard, tally, STAIR, stairY, floorY, stairWall, stairs, banister, railY, phoneIn } from './B_lib.js';

// home3 layout constants (same numbers as sets/home3.js pos, CX-relative)
const H0 = { pos: { matX: E.W / 2 + 200, mirrorX: E.W / 2 - 430, mirrorY: E.H * V(0.8, 0.68) - 590 } };
const RIM_HALL = { color: '#ffd59a', dir: [0.8, -0.5] };
// the hall: wall on a 0.85 layer, stairs on the character plane; banister is drawn by the caller after the figure
function hall(g, t, cam) { layer(g, cam, 0.85, (g) => stairWall(g, t)); layer(g, cam, 1, (g) => stairs(g)); }

// s027 — WEEK 1: he walks down the stairs, stiff; the hand hovers just off the rail on "without"
registerShot('s027', { draw(g, t, info) {
  const tWeek = wt(info, 'week', 0.31), tWith = wt(info, 'without', 2.07), tWalk = wt(info, 'walk', 1.29);
  const hx = lerp(STAIR.x0 + 260, STAIR.x0 + 1180, ease.inOut(prog(t, 0.2, info.dur + 0.4))), stepK = ((hx - STAIR.x0) / STAIR.w) % 1;
  const fy = lerp(stairY(hx), stairY(hx + STAIR.w), ease.inOut(clamp((stepK - 0.55) / 0.45))), stiff = Math.sin(clamp((stepK - 0.55) / 0.45) * Math.PI) * 6;
  const cam = { z: 1.0, x: hx - E.W / 2 + 120 + Math.sin(t * 0.5) * 6, y: fy - 800 + Math.cos(t * 0.6) * 4, r: 0.004 * Math.sin(t * 0.4) };
  hall(g, t, cam);
  layer(g, cam, 1, (g) => {
    const w = walkAlong(hx * 0.7, 1.9, { facing: 1 }).pose, hover = ease.inOut(prog(t, tWith - 0.3, tWith + 0.1));
    const pose = { ...w, head: [w.head[0] + 4, w.head[1] + stiff], eF: [lerp(w.eF[0], 26, 0.7), lerp(w.eF[1], -150, 0.7)], hF: [lerp(36, 48, hover), lerp(-128, -140, hover)] };
    actor(g, 'HERO', { x: hx, y: fy, s: 1.9, facing: 1, pose, expr: exprAt(t, [[0, 'worried'], [tWalk, 'nervous'], [tWith + 0.35, 'smirk']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0.6), rim: RIM_HALL, t });
    banister(g, t);
  });
  atmos(g, t, cam, { color: '#ffe8c0', far: 14, near: 5 });
  skipCard(g, t, info, [[tWeek - 0.05, 'WEEK 1']]);
} });

// s028 — "Mostly.": the knee buckles on the last step, both hands grab the rail; GIANT FACE pops in (shocked > sheepish > smirk)
registerShot('s028', { draw(g, t, info) {
  const tPop = 0.58;
  if (t < tPop) {
    const hx = STAIR.x0 + STAIR.n * STAIR.w - 40, fy = floorY(), [sx, sy] = jumpShake(t, 0.1, 10);
    const cam = { z: 1.15, x: hx - E.W / 2 - 80 + sx, y: fy - 760 + sy };
    hall(g, t, cam);
    layer(g, cam, 1, (g) => {
      const k = ease.out(prog(t, 0.05, 0.2)), b = POSES.crouch;
      const pose = { ...b, head: [lerp(6, b.head[0] - 10, k), lerp(-206, b.head[1] + 10, k)], eF: [-10, -150], hF: [-26, -150], eB: [-20, -146], hB: [-40, -150] };
      actor(g, 'HERO', { x: hx, y: fy, s: 1.9, facing: 1, pose, expr: t < 0.12 ? 'worried' : 'shocked', blink: false, look: lookToward(0.2, 1), rim: RIM_HALL, t });
      banister(g, t);
    });
    atmos(g, t, cam, { color: '#ffe8c0', far: 14, near: 5 });
    return;
  }
  const tt = t - tPop, cam = { z: 1.15, x: 760, y: 140 };
  blurLayer(g, 10, (g) => hall(g, t, cam), null, 1); veil(g, '#1a1020', 0.25);
  const pop = ease.outBack(clamp(tt / 0.22)), [sx, sy] = jumpShake(t, tPop, 5), r = 320 * pop;
  if (r > 4) heroFace(g, E.W * 0.5 + sx, E.H * 0.5 + sy, r, { t, f: faceAt(t, [[0, 'shocked'], [tPop + 0.5, 'sheepish'], [tPop + 1.1, 'smirk']], 0.14), rimSide: -1, rimColor: '#ffd59a', blink: blinkAmt(t, 3.0, 2), breath: Math.sin(t * 2.4) });
  atmos(g, t, cam, { color: '#ffe8c0', far: 10, near: 4 });
} });

// s029 — MONTH 1: clean push-ups on the mat, the 5-set tally fills on "five", the counter runs to 100 on "hundred"
registerShot('s029', { draw(g, t, info) {
  const tMonth = wt(info, 'month', 0.15), tH = wt(info, 'hundred', 1.49), tFive = wt(info, 'five', 2.33, 1.8);
  const R = pushUp(t, 1.3, { from: 0 });
    const cam = camMove(t, info.dur, { z: [1.25, 1.28], x: [H0.pos.matX - E.W / 2 - 40, H0.pos.matX - E.W / 2 - 10], y: [120, 125] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'APRIL' });
  layer(g, cam, 1, (g) => trainee(g, 'HERO', R, { x: H.pos.matX - 170, y: H.GY + 30, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.5), expr: exprAt(t, [[0, 'determined'], [tFive, 'smile']]), sweat: 0.35, breath: 1.0 }));
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
  const n = Math.round(100 * ease.inOut(prog(t, tH, tH + 0.9)));
  if (t > tH - 0.1) repCounter(g, n, { since: t < tH + 0.9 ? 0.05 : t - tH - 0.9, label: 'PUSH-UPS', of: 100, x: E.W - 260, y: 190, size: 130 });
  if (t > tH + 0.2) tally(g, t, 5, 5 * ease.out(prog(t, tFive, tFive + 0.7)), { y: E.H * 0.9, labels: ['20', '20', '20', '20', '20'], title: '5 SETS', alpha: clamp((t - tH - 0.2) / 0.3) * clamp((info.dur - t) / 0.3) });
  skipCard(g, t, info, [[tMonth - 0.05, 'MONTH 1']]);
} });

// s030 — THREE-SHOT: Dev films (phone UI pops on "films"); Mina walks in with the tape measure, eyebrows to hairline on "hairline" (6.0 cm)
registerShot('s030', { draw(g, t, info) {
  const tFilm = wt(info, 'films', 0.25), tMina = wt(info, 'mina', 1.71), tHair = wt(info, 'hairline', 2.51, 2.0);
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [H0.pos.matX - E.W / 2 - 120, H0.pos.matX - E.W / 2 - 80], y: [40, 50] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'APRIL' }), hx = H.pos.matX - 40, gy = H.GY + 30;
  let headW = [hx, gy - 300];
  layer(g, cam, 1, (g) => {
    const dO = { x: hx - 560, y: gy, s: 1.9, facing: 1 }, dPose = { ...POSES.kneel, eF: [30, -150], hF: [52, -160], eB: [24, -148], hB: [46, -158] };
    actor(g, 'DEV', { ...dO, pose: idle(dPose, t, 2), expr: exprAt(t, [[0, 'smirk'], [tHair, 'happy']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, -0.1), rim: H.rim, t });
    phoneIn(g, dO.x + 52 * 1.9 + 8, gy - 160 * 1.9, 1.3, 0, t);
    const kp = POSES.kneel; headW = [hx + kp.head[0] * 1.9, gy + kp.head[1] * 1.9];
    actor(g, 'HERO', { x: hx, y: gy, s: 1.9, facing: 1, pose: idle(kp, t, 3), expr: exprAt(t, [[0, 'neutral'], [tMina + 0.3, 'nervous'], [tHair + 0.2, 'confused']]), blink: blinkFlag(t, 3.4, 3), look: t > tMina ? lookToward(0, -1) : lookToward(-1, 0), rim: H.rim, t });
    const mx = lerp(hx + 900, hx + 230, ease.out(prog(t, tMina - 0.1, tHair - 0.2))), walking = t < tHair - 0.2 && t > tMina - 0.1;
    const mp = walking ? { ...walkAlong(mx, 2.0, { kid: true, facing: -1 }).pose, eF: [24, -160], hF: [40, -176] } : { ...POSES.stand, eF: [26, -170], hF: [44, -196], eB: [20, -168], hB: [40, -190] };
    actor(g, 'MINA', { x: mx, y: gy, s: 2.0, facing: -1, pose: idle(mp, t, 1), expr: exprAt(t, [[0, 'determined'], [tHair + 0.2, 'smile']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, -0.2), rim: H.rim, t });
    const k = ease.out(prog(t, tHair - 0.1, tHair + 0.35)); if (k > 0) tapeMeasure(g, headW[0] + 70, headW[1] + 30, 150, { s: 0.55, ext: k, rot: -Math.PI / 2 });
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
  const lk = ease.outBack(prog(t, tHair + 0.15, tHair + 0.45)) * clamp((info.dur - t) / 0.2);
  if (lk > 0.01) { const sx = (headW[0] + 120 - E.W / 2 - cam.x) * cam.z + E.W / 2, sy = (headW[1] - 40 - E.H / 2 - cam.y) * cam.z + E.H / 2; g.save(); g.translate(sx, sy); g.scale(lk, lk); rr(g, 0, -34, 200, 68, 20); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = S().ui.gold; g.lineWidth = 3; g.stroke(); text(g, '6.0 cm', 100, 2, { size: 42, color: S().ui.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
  if (t > tFilm) filmPhone(g, t, { x: E.W * 0.2, y: E.H * 0.24, s: 0.4, rot: -0.04, at: tFilm, sec0: 0 }, (g, w, h) => {
    g.fillStyle = linGrad(g, 0, 0, 0, h, ['#e8d8c0', '#b8a080']); g.fillRect(0, 0, w, h); g.fillStyle = '#6a5a7a'; g.fillRect(0, h * 0.78, w, h * 0.22);
    actor(g, 'HERO', { x: w * 0.5, y: h * 0.86, s: 1.3, facing: -1, pose: POSES.kneel, expr: 'nervous', t });
  });
} });

// s031 — INSERT: Mina's HAIR LOG (top-down): the red cover, it flips open on "notebook", the pencil writes "DAY 30  6.0 cm"
registerShot('s031', { draw(g, t, info) {
  const tWrite = wt(info, 'writes', 0.47), tNote = wt(info, 'notebook', 1.23), tLog = wt(info, 'hair', 2.01, 1.6);
  const k = ease.inOut(t / info.dur), rot = lerp(-0.05, 0.02, k), z = lerp(1.0, 1.06, k);
  // desk (top-down wood), lamp pool, a mug, pencil shavings, the tape measure
  g.fillStyle = linGrad(g, 0, 0, E.W, E.H, ['#8a5a3a', '#6a4028']); g.fillRect(0, 0, E.W, E.H);
  for (let i = 0; i < 22; i++) seg(g, [[0, i * 52 + Math.sin(i) * 8], [E.W, i * 52 + Math.sin(i * 1.3) * 12]], 2, alpha('#3a2014', 0.25));
  glow(g, E.W * 0.32, E.H * 0.28, 900, '#ffd08a', 0.35);
  circle(g, E.W * 0.88, E.H * 0.2, 90, '#e8e2d8'); circle(g, E.W * 0.88, E.H * 0.2, 70, '#5a3a24'); circle(g, E.W * 0.88 - 20, E.H * 0.2 - 20, 18, alpha('#fff', 0.2));
  tapeMeasure(g, E.W * 0.06, E.H * 0.9, E.W * 0.36, { s: 0.8, ext: 1, rot: -0.06 });
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(rot); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const open = ease.inOut(prog(t, tNote, tNote + 0.35));
  if (open < 0.5) {                                                                                 // closed red cover
    const sx = 1 - open * 2; g.save(); g.translate(E.W * 0.5 - 230 * (1 - sx), E.H * 0.5); g.scale(sx, 1);
    rr(g, -230 + 12, -300 + 16, 460, 600, 14); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); rr(g, -230, -300, 460, 600, 14); g.fillStyle = '#d4262e'; g.fill();
    rr(g, -170, -220, 340, 130, 10); g.fillStyle = '#f8f0dc'; g.fill(); text(g, 'HAIR LOG', 0, -156, { size: 64, color: '#1a1418', font: FONTS.title, weight: 700, spacing: 4 });
    circle(g, 0, 80, 70, '#1a1418'); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.0 + i * 0.125); circle(g, Math.cos(a) * 72, 80 + Math.sin(a) * 72, 30, '#1a1418'); }
    seg(g, [[-60, 30], [60, 30]], 12, '#f4f1e8'); seg(g, [[-60, 30], [60, 30]], 4, '#3f9a4a'); g.restore();
  } else hairLog(g, t, { x: E.W * 0.5, y: E.H * 0.5, s: lerp(0.4, 1.05, ease.out((open - 0.5) * 2)), rot: 0, rows: [['DAY 1', '6.0 cm'], ['DAY 30', '6.0 cm']], reveal: ease.inOut(prog(t, tNote + 0.4, info.dur - 0.3)) });
  // the pencil writing (follows the reveal on the right page)
  const rv = prog(t, tNote + 0.4, info.dur - 0.3), px = t < tNote ? E.W * 0.7 + Math.sin(t * 9) * 10 : E.W * 0.55 + (rv * 2 % 1) * 380, py = t < tNote ? E.H * 0.62 : E.H * 0.5 - 180 + Math.floor(rv * 2) * 96 + Math.sin(t * 40) * 4;
  g.save(); g.translate(px, py); g.rotate(-0.7); poly(g, [[0, 0], [14, -26], [26, -20]], '#e8c8a0'); circle(g, 4, -6, 4, '#2a2230'); g.fillStyle = '#f2c21a'; g.beginPath(); g.moveTo(14, -26); g.lineTo(180, -110); g.lineTo(192, -88); g.lineTo(26, -20); g.fill(); g.fillStyle = '#e08aa8'; g.beginPath(); g.moveTo(180, -110); g.lineTo(204, -122); g.lineTo(214, -100); g.lineTo(192, -88); g.fill(); g.restore();
  g.restore();
  atmos(g, t, { z, x: 0, y: 0 }, { color: '#ffe8c0', far: 10, near: 3 });
  chip(g, t, { str: 'Hair Log: day 30', at: tLog + 0.2, x: E.W * 0.5, y: E.H * 0.92, dur: info.dur - 0.05 });
} });

// s032 — MIRROR GAG: he lifts the hoodie to check for abs on "abs" (joy); on "Nothing" — a soft flat tummy (worried)
registerShot('s032', { draw(g, t, info) {
  const tAbs = wt(info, 'abs', 0.39), tNo = wt(info, 'nothing', 1.81);
  const cam = camMove(t, info.dur, { z: [1.1, 1.14], x: [H0.pos.mirrorX - E.W / 2 + 160, H0.pos.mirrorX - E.W / 2 + 180], y: [-10, -14] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'day', steam: 0.15 }), hx = H.pos.mirrorX + 300, gy = H.GY + 10;
  layer(g, cam, 1, (g) => {
    const lift = ease.inOut(prog(t, tAbs - 0.1, tAbs + 0.25)), b = POSES.stand;
    const pose = { ...b, eF: [lerp(b.eF[0], 20, lift), lerp(b.eF[1], -150, lift)], hF: [lerp(b.hF[0], 12, lift), lerp(b.hF[1], -166, lift)], eB: [lerp(b.eB[0], 2, lift), lerp(b.eB[1], -148, lift)], hB: [lerp(b.hB[0], -4, lift), lerp(b.hB[1], -164, lift)] };
    actor(g, 'HERO', { x: hx, y: gy, s: 1.9, facing: -1, pose: idle(pose, t, 2), expr: exprAt(t, [[0, 'happy'], [tAbs, 'joy'], [tNo, 'worried']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(-1, 0.2), rim: H.rim, t });
    if (lift > 0.05) { const s = 1.9, cx = hx - 2 * s, cy = gy - 134 * s; g.save(); g.globalAlpha = lift; g.fillStyle = S().ink; g.beginPath(); g.ellipse(cx, cy, 20 * s, 18 * s, 0, 0, 7); g.fill();       // soft tummy
      circle(g, cx - 4 * s, cy + 4 * s, 2 * s, alpha('#5a4a5a', 0.9)); rr(g, cx - 26 * s, cy - 30 * s, 52 * s, 13 * s, 6 * s); g.fillStyle = '#3f9a4a'; g.fill(); g.restore(); }                       // the rolled-up hoodie
  });
  // the reflection says it all: a tiny dust puff drifts across the mirror on "Nothing"
  layer(g, cam, 1, (g) => { const k = prog(t, tNo - 0.05, tNo + 0.6); if (k > 0) for (let i = 0; i < 3; i++) circle(g, H.pos.mirrorX - 80 + k * 160 + i * 18, H.pos.mirrorY + 40 - Math.sin(k * 6 + i) * 6, 10 + i * 4, alpha('#d8d0c0', 0.6 * (1 - k))); });
  home3Fg(g, t, cam, { room: 'bathroom' }); atmos(g, t, cam, { color: '#f0f6ff', far: 12, near: 4 });
} });
