// B_s033_s040_abs_month3.js — ep 3 batch B: abs that won't show (blueprint, sit-ups, plank, "no spot reduction"), MONTH 3 (too easy, bored).
// Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, ring, rr, poly, linGrad, shade, mix, text, FONTS } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { home3, home3Fg } from '../sets/home3.js';
import { pushUp, sitUp, squat, trainee, repCounter, stopwatch } from '../sets/train.js';
import { abs } from '../sets/body.js';
import * as BP from '../sets/bp.js';
import { faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, pointAndLook, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, skipCard, tally, bpPush, heroFace, BORED, YAWN } from './B_lib.js';

const CX = E.W / 2, GY = () => E.H * V(0.8, 0.68);
const BED = { matX: CX + 200, bedX: CX - 700 }, BATH = { mirrorX: CX - 430, sinkX: CX - 430 };

// s033 — BLUEPRINT FIG 3 - ABS: muscle under a fat layer; the muscle pulses on "Sit-ups", the fat stays exactly the same on "fat"
function absBoard(g, t, info, o) {
  BP.board(g, t, { title: 'FIG 3 - ABS', fig: 'SIT-UPS TRAIN MUSCLE, NOT FAT' });
  return abs(g, t, { x: E.W * 0.4, y: E.H * 0.5, w: 560, h: 520, k: o.k, strength: o.strength, fat: 1 });
}
registerShot('s033', { draw(g, t, info) {
  const tSit = wt(info, 'sit', 0.15), tFat = wt(info, 'fat', 2.11, 1.6);
  bpPush(g, t, info.dur, () => {
    const pulse = t > tSit ? 0.5 + 0.5 * Math.sin((t - tSit) * 6) * Math.exp(-(t - tSit) * 0.6) : 0;
    const A = absBoard(g, t, info, { k: ease.out(prog(t, 0.05, 1.5)), strength: 0.4 + 0.5 * ease.out(prog(t, tSit, tSit + 1.2)) });
    if (pulse > 0) glow(g, A.muscle[0], A.muscle[1], 220, S().ui.gold, 0.25 * pulse);
    BP.label(g, t, { at: A.muscle, to: [E.W * 0.72, E.H * 0.6], str: 'MUSCLE', start: tSit + 0.3 });
    BP.label(g, t, { at: A.fat, to: [E.W * 0.72, E.H * 0.3], str: 'FAT - unchanged', start: tFat });
  });
} });

// s034 — SIT-UPS on the mat, feet tucked under the bed, Biscuit watching; "6 WEEKS" strip fills on "six weeks", chip "One study"
registerShot('s034', { draw(g, t, info) {
  const tStudy = wt(info, 'study', 0.61), tSix = wt(info, 'six', 1.17);
  const R = sitUp(t, 0.9, { from: 0 });
  const cam = camMove(t, info.dur, { z: [1.22, 1.26], x: [-480, -440], y: [120, 125] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'MAY' }), hx = H.pos.bedX + 470;
  layer(g, cam, 1, (g) => {
    trainee(g, 'HERO', R, { x: hx, y: H.GY + 30, s: 2.0, facing: -1, t, rim: H.rim, blink: blinkFlag(t, 3.2, 1), look: lookToward(-1, -0.2), expr: exprAt(t, [[0, 'determined'], [tSix, 'nervous']]), sweat: 0.4, breath: 1.1 });
    cat(g, { x: hx + 420, y: H.GY + 30, s: 1.9, facing: -1, pose: 'sit', t, eyes: t > tSix ? 'offended' : 'auto', rim: H.rim });
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
  // the 6-week strip (gold numbers) above him
  const k = ease.out(prog(t, tSix, tSix + 0.8)), a = clamp((t - tSix + 0.1) / 0.25) * clamp((info.dur - t) / 0.25);
  if (a > 0) tally(g, t, 6, 6 * k, { x: E.W * 0.5, y: E.H * 0.13, w: 100, h: 60, labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'], title: '6 WEEKS', alpha: a });
  chip(g, t, { str: 'One study', at: tStudy, x: E.W * 0.2, y: E.H * 0.88, dur: info.dur - 0.05, tone: 'blue' });
} });

// s035 — PLANK INSERT: steady plank, the stopwatch ticks past 2:00 (gold), chip "Endurance +" on "longer"
registerShot('s035', { draw(g, t, info) {
  const tLong = wt(info, 'longer', 1.71, 1.2);
  const R = pushUp(-1, 1, { t0: 0 });                                                          // held at the top (plank)
  const p = R.pose, fore = { ...p, eF: [p.hF[0] - 8, -8], hF: [p.hF[0] + 26, -4], eB: [p.hB[0] - 12, -8], hB: [p.hB[0] + 22, -4] };   // on the forearms
  const sh = Math.sin(t * 2.2) * 1.5;
  const cam = camMove(t, info.dur, { z: [1.5, 1.56], x: [BED.matX - CX - 140, BED.matX - CX - 120], y: [190, 195] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'MAY' });
  layer(g, cam, 1, (g) => trainee(g, 'HERO', { ...R, pose: { ...fore, head: [fore.head[0], fore.head[1] + sh] } }, { x: H.pos.matX - 120, y: H.GY + 30, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.4, 4), look: lookToward(1, 0.6), expr: exprAt(t, [[0, 'neutral'], [tLong, 'smirk']]), sweat: 0.2, breath: 0.6 }));
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
  stopwatch(g, 118 + t * 1.6, { x: 230, y: 250, r: 120 });
  chip(g, t, { str: 'Endurance +', at: tLong, x: E.W * 0.74, y: E.H * 0.16, dur: info.dur - 0.05 });
} });

// s036 — BLUEPRINT: a BELLY FAT bar stays flat, the fat layer doesn't move (dashed "before" outline sits on it), "= 0" stamps on "all"
registerShot('s036', { draw(g, t, info) {
  const tShr = wt(info, 'shrink', 0.57), tAll = wt(info, 'all', 1.81, 1.3), ui = S().ui;
  bpPush(g, t, info.dur, () => {
    const A = absBoard(g, t, info, { k: 1, strength: 0.9 });
    // bar chart: BELLY FAT before vs after six weeks — identical bars
    const bx = E.W * 0.72, by = E.H * 0.78, bw = 110, bh = 300, gk = ease.out(prog(t, 0.1, 0.7));
    seg(g, [[bx - 90, by], [bx + 330, by]], 4, alpha(ui.blueprint, 0.9)); text(g, 'BELLY FAT', bx + 120, by - bh - 70, { size: 34, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 2 });
    for (const [i, lab] of [[0, 'WEEK 0'], [1, 'WEEK 6']]) { const x = bx - 40 + i * 200, hh = bh * gk; g.strokeStyle = ui.blueprint; g.lineWidth = 4; g.strokeRect(x, by - hh, bw, hh); g.fillStyle = alpha(ui.blueprint, 0.25); g.fillRect(x, by - hh, bw, hh); text(g, lab, x + bw / 2, by + 30, { size: 24, color: ui.cream, font: FONTS.ui, weight: 900 }); }
    const ak = ease.inOut(prog(t, tShr, tShr + 0.6)); if (ak > 0) { g.save(); g.setLineDash([10, 8]); seg(g, [[bx + 70, by - bh - 14], [lerp(bx + 70, bx + 160, ak), by - bh - 14]], 4, ui.gold); g.restore(); }
    const sk = ease.outBack(prog(t, tAll, tAll + 0.3)); if (sk > 0.01) { g.save(); g.translate(bx + 120, by - bh / 2); g.rotate(-0.12); g.scale(sk * (1 + 0.3 * Math.exp(-(t - tAll) * 10)), sk); rr(g, -110, -60, 220, 120, 20); g.fillStyle = 'rgba(14,10,20,.92)'; g.fill(); g.strokeStyle = ui.gold; g.lineWidth = 6; g.stroke(); text(g, '= 0', 0, 4, { size: 84, color: ui.gold, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(ui.gold, 0.6) }); g.restore(); }
  });
} });

// s037 — BATHROOM: he pokes his belly, then tries to "point" the fat over to his arm; nothing happens. Biscuit on the sink, unimpressed
registerShot('s037', { draw(g, t, info) {
  const tChoose = wt(info, 'choose', 0.47), tOff = wt(info, 'off', 1.31, 0.9);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [BATH.mirrorX - CX + 220, BATH.mirrorX - CX + 280], y: [-20, -24] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'day' }), hx = H.pos.mirrorX + 380, gy = H.GY + 10;
  layer(g, cam, 1, (g) => {
    const poke = { ...POSES.stand, eF: [18, -120], hF: [10, -128] };
    const pl = pointAndLook(t, tChoose + 0.2, [-1, -0.2], { base: poke });
    const pose = t < tChoose + 0.2 ? idle({ ...poke, hF: [10 + Math.sin(t * 14) * 3, -128] }, t, 2) : idle(pl.pose, t, 2);
    actor(g, 'HERO', { x: hx, y: gy, s: 1.9, facing: -1, pose, expr: exprAt(t, [[0, 'determined'], [tChoose + 0.3, 'thinking'], [tOff, 'sheepish']]), blink: blinkFlag(t, 3.2, 2), look: t < tChoose + 0.2 ? lookToward(-0.2, 1) : pl.look, rim: H.rim, t });
    const mk = prog(t, tChoose + 0.5, tOff); if (mk > 0 && mk < 1) { for (let i = 0; i < 5; i++) { const u = (mk * 2 + i * 0.2) % 1; circle(g, hx - 60 - u * 160, gy - 250 - Math.sin(u * Math.PI) * 40, 6, alpha(S().ui.gold, 0.6 * (1 - u))); } }   // "magic" sparkles that fizzle out
    cat(g, { x: H.pos.sinkX + 70, y: H.pos.sinkTop, s: 1.6, facing: 1, pose: 'loaf', t, eyes: t > tOff ? 'offended' : 'auto', rim: H.rim });
  });
  home3Fg(g, t, cam, { room: 'bathroom' }); atmos(g, t, cam, { color: '#f0f6ff', far: 12, near: 4 });
  chip(g, t, { str: 'No spot reduction', at: tChoose, x: E.W * 0.68, y: E.H * 0.14, dur: info.dur - 0.05, tone: 'coral' });
} });

// s038 — MONTH 3: mid-squat set in summer light, the counter climbs fast; on "get" he pauses at the top, expecting it to hurt
registerShot('s038', { draw(g, t, info) {
  const tMonth = wt(info, 'month', 0.15), tH = wt(info, 'hundreds', 1.65, 1.2), tGet = wt(info, 'get', 1.99, 1.7);
  const tq = Math.min(t, tGet + 0.05), R = squat(tq, 1.1, { from: 60 }), stop = t > tGet + 0.05;
  const cam = camMove(t, info.dur, { z: [1.12, 1.18], x: [BED.matX - CX - 60, BED.matX - CX - 20], y: [40, 46] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 28, month: 'JUNE' });
  layer(g, cam, 1, (g) => trainee(g, 'HERO', { ...R, pose: stop ? idle(blendPose(R.pose, POSES.stand, ease.out(prog(t, tGet, tGet + 0.3))), t, 3) : R.pose }, { x: H.pos.matX - 40, y: H.GY + 30, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.3, 3), look: stop ? lookToward(0.3, -0.4) : lookToward(1, 0.2), expr: exprAt(t, [[0, 'determined'], [tGet, 'worried']]), sweat: 0.3, breath: 0.9 }));
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff1d0', far: 14, near: 5 });
  const n = Math.min(100, Math.round(lerp(60, 98, ease.out(prog(t, tH - 0.2, tGet)))));
  repCounter(g, n, { since: stop ? t - tGet : 0.04, label: 'SQUATS', of: 100, x: E.W - 260, y: 190, size: 130 });
  skipCard(g, t, info, [[-1, 'MONTH 1'], [tMonth - 0.05, 'MONTH 3']], { until: tMonth + 1.4 });
} });

// s039 — EASY: a grin on "easy", fast clean push-ups, the tally shows only two sets (50 + 50), 100 on "hundred", he pops up on "sets"
registerShot('s039', { draw(g, t, info) {
  const tEasy = wt(info, 'easy', 0.15), tH = wt(info, 'hundred', 1.43, 1.0), tTwo = wt(info, 'two', 2.31, 1.8), tSets = wt(info, 'sets', 2.51, 2.0);
  const R = pushUp(t, 1.9, { from: 0 }), up = ease.out(prog(t, tSets, tSets + 0.3)), hop = Math.sin(clamp((t - tSets - 0.1) / 0.35) * Math.PI) * 60;
  const cam = camMove(t, info.dur, { z: [1.1, 1.18], x: [BED.matX - CX - 80, BED.matX - CX - 40], y: [60, 60] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JUNE' }), hx = H.pos.matX - 160, gy = H.GY + 30;
  layer(g, cam, 1, (g) => {
    if (up < 0.5) trainee(g, 'HERO', R, { x: hx, y: gy, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.5), expr: exprAt(t, [[0, 'neutral'], [tEasy, 'joy']]), sweat: 0.05, breath: 0.6 });
    else actor(g, 'HERO', { x: hx + 140, y: gy - hop, s: 2.0, facing: 1, pose: idle(t < tSets + 0.5 ? POSES.jump : POSES.relaxed, t, 3), expr: 'joy', blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0), rim: H.rim, t });
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff1d0', far: 14, near: 5 });
  const n = Math.round(100 * ease.inOut(prog(t, tEasy, tH)));
  repCounter(g, n, { since: t < tH ? 0.04 : t - tH, label: 'PUSH-UPS', of: 100, x: E.W - 260, y: 190, size: 130 });
  const a = clamp((t - tH + 0.2) / 0.3) * clamp((info.dur - t) / 0.25);
  if (a > 0) tally(g, t, 2, 2 * ease.out(prog(t, tTwo - 0.1, tTwo + 0.4)), { y: E.H * 0.9, labels: ['50', '50'], title: '2 SETS', alpha: a, w: 150 });
} });

// s040 — GIANT FACE, bored: neutral > squint > heavy-lidded, a huge yawn on "bored"
registerShot('s040', { draw(g, t, info) {
  const tTired = wt(info, 'tired', 0.47), tBored = wt(info, 'bored', 1.87, 1.5);
  const cam = camMove(t, info.dur, { z: [1.1, 1.12], x: [BED.matX - CX - 60, BED.matX - CX + 20], y: [-60, -64] });
  blurLayer(g, 10, (g) => home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JUNE' }), null, 1); veil(g, '#1a1020', 0.2);
  const f = faceAt(t, [[0, 'neutral'], [tTired + 0.2, 'squint'], [tBored - 0.25, BORED], [tBored, YAWN], [tBored + 1.0, BORED]], 0.18);
  heroFace(g, E.W * 0.5 + Math.sin(t * 0.4) * 10, E.H * 0.5, 330, { t, f, rimSide: -1, rimColor: '#fff1d0', blink: blinkAmt(t, 3.6, 1), breath: Math.sin(t * 1.6), tilt: t > tBored ? -0.06 * Math.sin(clamp((t - tBored) / 1.0) * Math.PI) : 0 });
  atmos(g, t, cam, { color: '#fff1d0', far: 10, near: 4 });
  chip(g, t, { str: 'Not tired. Bored.', at: tBored + 0.3, x: E.W * 0.78, y: E.H * 0.86, dur: info.dur - 0.05, tone: 'blue' });
} });
