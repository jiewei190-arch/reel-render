// B_s041_s047_rule2.js — ep 3 batch B: RULE 2 (specificity), the clap push-ups, one-handed + phone, the plateau, light vs heavy, the limit.
// Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, ring, rr, poly, linGrad, shade, mix, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { home3, home3Fg } from '../sets/home3.js';
import { pushUp, trainee, repCounter } from '../sets/train.js';
import { said } from '../sets/body.js';
import * as BP from '../sets/bp.js';
import { chip, ruleCard } from '../sets/hud.js';
import { blinkFlag, exprAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, bpPush, phoneIn } from './B_lib.js';

const CX = E.W / 2, MATX = CX + 200;
const local = (o, p) => [o.x + p[0] * (o.facing ?? 1) * o.s, o.y + p[1] * o.s];
// line-art figure for the boards (blueprint blue)
function bpFigure(g, x, y, s, col, pose = 'stand') {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 4 / s; g.lineCap = 'round';
  const L = (a, b) => { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); };
  if (pose === 'sit') { g.beginPath(); g.arc(0, -96, 16, 0, 7); g.stroke(); L([0, -80], [0, -40]); L([0, -40], [30, -40]); L([30, -40], [30, -6]); L([0, -70], [24, -58]); L([0, -70], [-20, -56]); }
  else { g.beginPath(); g.arc(0, -150, 22, 0, 7); g.stroke(); L([0, -128], [0, -60]); L([0, -60], [-20, 0]); L([0, -60], [20, 0]); L([0, -116], [-34, -80]); L([0, -116], [34, -80]); }
  g.restore();
}

// s041 — RULE 2 card over the dimmed bedroom training corner; the banner lands on "adapts"
registerShot('s041', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [80, 120], y: [-20, -30] });
  ruleCard(g, t, info, { n: 2, title: 'YOUR BODY ONLY ANSWERS THE QUESTION YOU ASK.', bg: (g, t) => { blurLayer(g, 9, (g) => home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JUNE' }), null, 1); veil(g, '#120a1c', 0.3); } });
} });

// s042 — BLUEPRINT FIG 4 - SPECIFICITY: THE QUESTION -> the body -> THE ANSWER; "SPECIFICITY" on "specificity"; "100 PUSH-UPS" on "hundred"
registerShot('s042', { draw(g, t, info) {
  const tSpec = wt(info, 'specificity', 0.81), tAsk = wt(info, 'ask', 2.31, 1.5), tH = wt(info, 'hundred', 2.87, 2.3), ui = S().ui;
  bpPush(g, t, info.dur, () => {
    BP.board(g, t, { title: 'FIG 4 - SPECIFICITY', fig: 'THE BODY ANSWERS WHAT YOU ASK' });
    const y = E.H * 0.55, xs = [E.W * 0.2, E.W * 0.5, E.W * 0.8];
    const card = (x, k, title, body) => { if (k <= 0) return; g.save(); g.globalAlpha *= k; BP.draw(g, [[x - 200, y - 170], [x + 200, y - 170], [x + 200, y + 170], [x - 200, y + 170]], k, { w: 4, close: true }); text(g, title, x, y - 130, { size: 30, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 3 }); body(); g.restore(); };
    const qk = ease.out(prog(t, 0.1, 0.7)), fill = ease.outBack(prog(t, tH, tH + 0.35));
    card(xs[0], qk, 'THE QUESTION', () => { if (fill < 0.05) text(g, '?', xs[0], y + 20, { size: 180, color: alpha(ui.blueprint, 0.9), font: FONTS.title, weight: 700 }); else { g.save(); g.translate(xs[0], y + 20); g.scale(fill, fill); text(g, '100', 0, -30, { size: 110, color: ui.gold, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(ui.gold, 0.6) }); text(g, 'PUSH-UPS', 0, 60, { size: 40, color: ui.gold, font: FONTS.ui, weight: 900 }); g.restore(); } });
    const bk = ease.out(prog(t, 0.5, 1.1)); if (bk > 0) { g.save(); g.globalAlpha *= bk; bpFigure(g, xs[1], y + 130, 1.5, ui.blueprint); glow(g, xs[1], y - 40, 200, ui.blueprint, 0.15 * bk); g.restore(); }
    card(xs[2], ease.out(prog(t, 0.9, 1.5)), 'THE ANSWER', () => text(g, '...', xs[2], y + 20, { size: 120, color: alpha(ui.blueprint, 0.8), font: FONTS.title, weight: 700 }));
    for (const [a, b, t0] of [[xs[0] + 210, xs[1] - 110, 0.4], [xs[1] + 110, xs[2] - 210, 1.0]]) { const k = ease.out(prog(t, t0, t0 + 0.5)); if (k > 0) { seg(g, [[a, y], [lerp(a, b, k), y]], 5, ui.blueprint); if (k > 0.95) poly(g, [[b, y], [b - 22, y - 14], [b - 22, y + 14]], ui.blueprint); } }
    const sk = ease.outBack(prog(t, tSpec, tSpec + 0.4)); if (sk > 0.01) { g.save(); g.translate(E.W / 2, E.H * 0.2); g.scale(sk, sk); text(g, 'SPECIFICITY', 0, 0, { size: 84, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 8, glow: 18, glowColor: alpha(ui.gold, 0.5) }); g.restore(); }
    const ak = ease.out(prog(t, tAsk, tAsk + 0.3)); if (ak > 0) { glow(g, xs[0], y, 300, ui.gold, 0.15 * ak); }
  });
} });

// s043 — SHOWOFF: perfect push-ups, then clap push-ups from "brilliant"; Dev films; 100 + a gold star on "hundred"
registerShot('s043', { draw(g, t, info) {
  const tBri = wt(info, 'brilliant', 0.83), tH = wt(info, 'hundred', 1.63, 1.2);
  const R = pushUp(t, 1.25, { from: 92 }), u = R.u ?? 0, clapOn = t > tBri, clap = clapOn && u > 0.7 ? Math.sin((u - 0.7) / 0.3 * Math.PI) : 0;
  const p = R.pose, pose = clap > 0 ? { ...p, head: [p.head[0], p.head[1] - 30 * clap], sh: [p.sh[0], p.sh[1] - 30 * clap], hip: [p.hip[0], p.hip[1] - 18 * clap], eF: [p.sh[0] + 20, p.sh[1] + 10 - 30 * clap], hF: [p.sh[0] + 30, p.sh[1] + 30 - 40 * clap], eB: [p.sh[0] + 14, p.sh[1] + 12 - 30 * clap], hB: [p.sh[0] + 30, p.sh[1] + 28 - 40 * clap] } : p;
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [MATX - CX - 160, MATX - CX - 120], y: [70, 74], r: [-0.01, 0.01] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JUNE' }), hx = H.pos.matX - 120, gy = H.GY + 30;
  layer(g, cam, 1, (g) => {
    const dO = { x: hx - 620, y: gy - 10, s: 1.9, facing: 1 }, dp = { ...POSES.stand, eF: [26, -150], hF: [46, -158], eB: [22, -148], hB: [42, -156] };
    actor(g, 'DEV', { ...dO, pose: idle(dp, t, 2), expr: exprAt(t, [[0, 'smirk'], [tBri + 0.2, 'surprised'], [tH, 'joy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0.3), rim: H.rim, t });
    phoneIn(g, ...local(dO, [52, -160]), 1.3, 0, t);
    const T = trainee(g, 'HERO', { ...R, pose }, { x: hx, y: gy, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.3), expr: exprAt(t, [[0, 'determined'], [tBri, 'joy']]), sweat: 0.1, breath: 0.7 });
    if (clap > 0.6) { const [cx2, cy2] = local({ x: hx, y: gy, s: 2.0, facing: 1 }, [pose.hF[0], pose.hF[1]]); FX.sparkle(g, cx2 + 10, cy2 - 10, 30 * clap, '#fff1c8', 0.95); for (let i = 0; i < 4; i++) seg(g, [[cx2 + Math.cos(i * 1.6) * 30, cy2 + Math.sin(i * 1.6) * 30], [cx2 + Math.cos(i * 1.6) * 54, cy2 + Math.sin(i * 1.6) * 54]], 4, alpha('#fff1dc', clap)); }
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff1d0', far: 14, near: 5 });
  const n = t < tH ? Math.min(99, R.n) : 100;
  repCounter(g, n, { since: t < tH ? R.since : t - tH, label: 'PUSH-UPS', of: 100, x: E.W - 260, y: 190, size: 130 });
  const sk = ease.outBack(prog(t, tH + 0.05, tH + 0.4)); if (sk > 0.01) { g.save(); g.translate(E.W - 120, 110); g.rotate(t * 0.8); g.scale(sk, sk); poly(g, Array.from({ length: 10 }, (_, j) => { const r2 = j % 2 ? 22 : 52, a = j / 10 * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * r2, Math.sin(a) * r2]; }), S().ui.gold); g.restore(); }
} });

// s044 — TOO EASY: one-handed push-ups while scrolling his phone; a difficulty dial swings red -> green on "easy" and flatlines on "hard"
registerShot('s044', { draw(g, t, info) {
  const tEasy = wt(info, 'easy', 0.93), tHard = wt(info, 'hard', 2.65, 2.0), ui = S().ui;
  const R = pushUp(t, 0.95, { from: 40 }), p = R.pose, hB = [p.head[0] + 34, p.head[1] + 34], pose = { ...p, eB: [lerp(p.sh[0], hB[0], 0.5) + 6, lerp(p.sh[1], hB[1], 0.5) + 14], hB };
  const cam = camMove(t, info.dur, { z: [1.3, 1.34], x: [MATX - CX - 180, MATX - CX - 130], y: [140, 144] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JULY' }), hx = H.pos.matX - 120, gy = H.GY + 30;
  layer(g, cam, 1, (g) => {
    trainee(g, 'HERO', { ...R, pose }, { x: hx, y: gy, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.6, 1), look: lookToward(0.6, 0.9), expr: exprAt(t, [[0, 'neutral'], [tEasy + 0.2, 'sleepy'], [tHard, 'neutral']]), sweat: 0, breath: 0.4 });
    const [px, py] = local({ x: hx, y: gy, s: 2.0, facing: 1 }, hB); phoneIn(g, px + 10, py - 8, 1.2, -0.5, t, false); glow(g, px + 10, py - 8, 60, '#8fb8ff', 0.3);
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff1d0', far: 14, near: 5 });
  // difficulty dial (top right)
  const dx = E.W - 240, dy = 260, r = 120, a0 = Math.PI, swing = ease.inOut(prog(t, tEasy - 0.1, tEasy + 0.6)), fl = t > tHard ? 0 : Math.sin(t * 7) * 0.03 * (1 - swing), ang = a0 + lerp(0.25, 0.92, swing) * Math.PI + fl;
  const pk = ease.outBack(prog(t, 0.1, 0.45)) * clamp((info.dur - t) / 0.25);
  if (pk > 0.01) { g.save(); g.translate(dx, dy); g.scale(pk, pk); rr(g, -r - 40, -r - 70, 2 * r + 80, r + 140, 24); g.fillStyle = 'rgba(14,10,20,.85)'; g.fill(); g.strokeStyle = alpha(ui.gold, 0.6); g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 20; i++) { const a = Math.PI + i / 20 * Math.PI; g.strokeStyle = mix('#e8503a', '#4ac06a', i / 19); g.lineWidth = 20; g.beginPath(); g.arc(0, 0, r, a, a + Math.PI / 20 + 0.01); g.stroke(); }
    text(g, 'HARD', -r + 10, 40, { size: 22, color: '#e8503a', font: FONTS.ui, weight: 900 }); text(g, 'EASY', r - 10, 40, { size: 22, color: '#4ac06a', font: FONTS.ui, weight: 900 }); text(g, 'DIFFICULTY', 0, -r - 40, { size: 26, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
    seg(g, [[0, 0], [Math.cos(ang) * (r - 20), Math.sin(ang) * (r - 20)]], 8, ui.cream); circle(g, 0, 0, 12, ui.gold); g.restore(); }
} });

// s045 — BLUEPRINT: muscle size climbs, then flattens into a PLATEAU on "stops changing"; a tiny line-art hero sits on it, bored
registerShot('s045', { draw(g, t, info) {
  const tStop = wt(info, 'stops', 0.91), tCh = wt(info, 'changing', 1.37, 1.0), ui = S().ui;
  bpPush(g, t, info.dur, () => {
    BP.board(g, t, { title: 'FIG 4 - SPECIFICITY', fig: 'SAME QUESTION, SAME ANSWER' });
    const x0 = E.W * 0.16, y0 = E.H * 0.8, w = E.W * 0.66, h = E.H * 0.5;
    seg(g, [[x0, y0 - h], [x0, y0], [x0 + w, y0]], 4, ui.blueprint); text(g, 'MUSCLE', x0 - 20, y0 - h - 30, { size: 28, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left' }); text(g, 'WEEKS', x0 + w, y0 + 40, { size: 28, color: ui.cream, font: FONTS.ui, weight: 900, align: 'right' });
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, rise = 1 - Math.exp(-u * 7); pts.push([x0 + u * w, y0 - h * 0.75 * rise]); }
    BP.draw(g, pts, ease.inOut(prog(t, 0.05, tStop + 0.6)), { w: 7, color: ui.gold });
    const pk = ease.out(prog(t, tCh, tCh + 0.4)); if (pk > 0) { g.save(); g.globalAlpha = pk; g.setLineDash([12, 10]); seg(g, [[x0 + w * 0.35, y0 - h * 0.75 - 30], [x0 + w, y0 - h * 0.75 - 30]], 3, alpha(ui.gold, 0.7)); g.restore();
      text(g, 'PLATEAU', x0 + w * 0.55, y0 - h * 0.75 - 80, { size: 64, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 6, alpha: pk, glow: 14, glowColor: alpha(ui.gold, 0.5) }); }
    const fk = ease.out(prog(t, tStop + 0.3, tStop + 0.8)); if (fk > 0) { g.save(); g.globalAlpha = fk; bpFigure(g, x0 + w * 0.82, y0 - h * 0.75 - 4, 1.0 + 0.02 * Math.sin(t * 2), ui.cream, 'sit'); g.restore(); text(g, 'z', x0 + w * 0.82 + 40, y0 - h * 0.75 - 130 - (t * 20 % 30), { size: 34, color: ui.cream, font: FONTS.ui, weight: 900, alpha: fk * 0.8 }); }
  });
} });

// s046 — BLUEPRINT FIG 5 - LIGHT vs HEAVY (body.js said panel); "MUSCLE +" on the light card on "build"
registerShot('s046', { draw(g, t, info) {
  const tBuild = wt(info, 'build', 1.45, 0.8);
  bpPush(g, t, info.dur, () => {
    BP.board(g, t, { title: 'FIG 5 - LIGHT vs HEAVY', fig: 'BOTH BUILD, DIFFERENTLY' });
    const P = said(g, t, { x: E.W * 0.5, y: E.H * 0.54, w: 1560, h: 640, k: ease.out(prog(t, 0.05, 1.2)), light: prog(t, 0.1, 0.7), heavy: prog(t, 0.6, 1.2), overload: 0 });
    const k = ease.outBack(prog(t, tBuild, tBuild + 0.35)); if (k > 0.01 && P.light) { glow(g, P.light[0], P.light[1], 200, S().ui.gold, 0.2 * k); BP.label(g, t, { at: P.light, to: [E.W * 0.47, E.H * 0.2], str: 'MUSCLE +', start: tBuild, size: 46 }); }
  });
} });

// s047 — TO THE LIMIT: push-ups until the trembling last reps; his rep bar creeps up to the red LIMIT line on "limit"
registerShot('s047', { draw(g, t, info) {
  const tPush = wt(info, 'push', 1.05, 0.6), tLim = wt(info, 'limit', 1.95, 1.4), ui = S().ui, fat = clamp((t - 0.6) / 1.4);
  const R = pushUp(t, 0.8, { from: 30, fatigue: fat * 0.8, tremble: fat, sag: fat * 0.4 });
  const cam = camMove(t, info.dur, { z: [1.14, 1.22], x: [MATX - CX - 120, MATX - CX - 90], y: [90, 100] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JULY' });
  layer(g, cam, 1, (g) => trainee(g, 'HERO', R, { x: H.pos.matX - 120, y: H.GY + 30, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.0, 1), look: lookToward(1, 0.6), expr: exprAt(t, [[0, 'determined'], [tPush, 'nervous'], [tLim, 'worried']]), sweat: 0.4 + 0.6 * fat, breath: 1.0 + fat }));
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff1d0', far: 14, near: 5 });
  // effort bar (right edge) with the red LIMIT line
  const bx = E.W - 150, top = E.H * 0.16, bot = E.H * 0.84, lim = lerp(bot, top, 0.86), fill = lerp(0.35, 0.86, ease.inOut(prog(t, 0.2, tLim))) + (t > tLim ? Math.sin(t * 30) * 0.004 : 0);
  rr(g, bx - 36, top - 50, 72, bot - top + 100, 30); g.fillStyle = 'rgba(14,10,20,.8)'; g.fill(); g.strokeStyle = alpha(ui.gold, 0.5); g.lineWidth = 3; g.stroke();
  g.fillStyle = linGrad(g, 0, bot, 0, top, ['#4ac06a', '#f2c21a', '#e8503a']); g.fillRect(bx - 14, lerp(bot, top, fill), 28, bot - lerp(bot, top, fill));
  seg(g, [[bx - 50, lim], [bx + 50, lim]], 6, ui.accent); text(g, 'LIMIT', bx - 64, lim, { size: 30, color: ui.accent, font: FONTS.ui, weight: 900, align: 'right', stroke: 6, strokeColor: '#140f18' });
  text(g, 'EFFORT', bx, top - 80, { size: 26, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
  if (t > tLim) glow(g, bx, lim, 120, ui.accent, 0.3 * (0.6 + 0.4 * Math.sin(t * 10)));
  chip(g, t, { str: 'Close to your limit', at: tLim, x: E.W * 0.35, y: E.H * 0.14, dur: info.dur - 0.05, tone: 'coral' });
} });
