// B_s048_s053_overload.js — ep 3 batch B: heavy loads (the sofa gag), progressive overload (the coach's plan, the staircase, "100 forever"),
// Dev's textbook backpack ("Wear this.") and the backwards flip to DAY 1?. Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, rr, poly, linGrad, shade, mix, rng, text, FONTS, talkAmount } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { home3, home3Fg } from '../sets/home3.js';
import { pushUp, trainee, repCounter, backpack, fatigue } from '../sets/train.js';
import * as BP from '../sets/bp.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos, talkGesture } from '../sets/acting.js';
import { jumpShake } from '../sets/jump.js';
import { wt, skipCard, bpPush, crisps, bookBag } from './B_lib.js';

const CX = E.W / 2, MATX = CX + 200;
const local = (o, p) => [o.x + p[0] * (o.facing ?? 1) * o.s, o.y + p[1] * o.s];

// s048 — HEAVY GAG: he tries to lift the end of the sofa with Dev on it eating crisps; it doesn't budge on "heavier"; chip on "win"
registerShot('s048', { draw(g, t, info) {
  const tStr = wt(info, 'strength', 0.63), tHeavy = wt(info, 'heavier', 1.21), tWin = wt(info, 'win', 1.69, 1.4);
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [-60, -30], y: [-20, -26] });
  const A = apartment(g, t, cam, { mood: 'day', power: 1 }), sx = A.pos.sofaX, strain = ease.out(prog(t, tStr, tHeavy)), tr = (Math.sin(t * 40) + Math.sin(t * 57)) * 1.5 * strain;
  layer(g, cam, 1, (g) => {
    const sit = POSES.sit, dy = A.GY - 100 - sit.hip[1] * 1.9 + Math.sin(t * 30) * 2 * strain;
    const dO = { x: sx - 40, y: dy, s: 1.9, facing: 1 }, dp = t > tWin ? reaction({ ...sit, eF: [24, -150], hF: [46, -176], eB: [-12, -150], hB: [-30, -176] }, t, tWin, sit) : { ...sit, eF: [22, -120], hF: [34, -138], eB: [18, -110], hB: [30, -120] };
    actor(g, 'DEV', { ...dO, pose: idle(dp, t, 2), expr: exprAt(t, [[0, 'happy'], [tHeavy + 0.2, 'smirk']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, 0.2), rim: A.rim, t });
    if (t < tWin) { const [cx, cy] = local(dO, [34, -138]); crisps(g, cx + 6, cy - 6, 1.1); circle(g, cx + 30, cy - 50 - (t * 40 % 30), 5, '#f2c21a'); }
    const lift = { ...POSES.crouch, eF: [30, -84], hF: [46, -66], eB: [26, -86], hB: [40, -68] };
    const hp = fatigue ? fatigue(blendPose(POSES.stand, lift, ease.out(prog(t, 0, tStr))), t, { tremble: strain }) : lift;
    actor(g, 'HERO', { x: sx + 380 + tr, y: A.GY + 10, s: 1.9, facing: -1, pose: hp, expr: exprAt(t, [[0, 'determined'], [tHeavy, 'worried']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(-1, 0.6), rim: A.rim, t });
    if (strain > 0.3) for (let i = 0; i < 3; i++) { const u = (t * 2 + i / 3) % 1; circle(g, sx + 400 + Math.sin(i * 2) * 30, A.GY - 380 - u * 60, 4, alpha('#a8dcff', 0.8 * (1 - u))); }   // sweat
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: A.M.key, far: 14, near: 5 });
  chip(g, t, { str: 'Heavy = strength', at: tWin, x: E.W * 0.68, y: E.H * 0.14, dur: info.dur - 0.05 });
} });

// s049 — INSERT: a coach's training plan on a clipboard; the numbers climb 10 > 12 > 15 > 18, the pencil adds 20 on "adding", an up-arrow on "more"
registerShot('s049', { draw(g, t, info) {
  const tAdd = wt(info, 'adding', 1.47), tMore = wt(info, 'more', 2.05, 1.6), ui = S().ui;
  const k = ease.inOut(t / info.dur), rot = lerp(0.04, -0.02, k), z = lerp(1.0, 1.06, k);
  g.fillStyle = linGrad(g, 0, 0, E.W, E.H, ['#5a6a7a', '#3a4654']); g.fillRect(0, 0, E.W, E.H);                         // gym bench vinyl
  for (let i = 0; i < 8; i++) seg(g, [[0, i * 150], [E.W, i * 150 + 40]], 3, alpha('#000', 0.15));
  glow(g, E.W * 0.4, E.H * 0.3, 900, '#fff4dc', 0.2);
  for (const [x, y, c] of [[E.W * 0.88, E.H * 0.25, '#2f6fd0'], [E.W * 0.1, E.H * 0.8, '#d4262e']]) { rr(g, x - 30, y - 90, 60, 180, 24); g.fillStyle = c; g.fill(); rr(g, x - 20, y - 110, 40, 30, 8); g.fillStyle = '#1a1a22'; g.fill(); }   // water bottles
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(rot); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const bx = E.W * 0.5, by = E.H * 0.53, W = 1100, H = 760;
  rr(g, bx - W / 2 + 14, by - H / 2 + 18, W, H, 22); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); rr(g, bx - W / 2, by - H / 2, W, H, 22); g.fillStyle = '#a87848'; g.fill();
  rr(g, bx - W / 2 + 40, by - H / 2 + 50, W - 80, H - 80, 6); g.fillStyle = '#fbf8f0'; g.fill();
  rr(g, bx - 120, by - H / 2 - 30, 240, 90, 16); g.fillStyle = '#b8bcc8'; g.fill(); rr(g, bx - 80, by - H / 2 - 10, 160, 40, 10); g.fillStyle = '#8a8e9a'; g.fill();
  text(g, 'TRAINING PLAN', bx - W / 2 + 90, by - H / 2 + 120, { size: 46, color: '#2a2630', font: FONTS.title, weight: 700, align: 'left' });
  text(g, 'push-ups / set', bx + W / 2 - 90, by - H / 2 + 120, { size: 28, color: '#6a6470', font: FONTS.ui, weight: 800, align: 'right' });
  const cols = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4', 'WEEK 5'], vals = ['10', '12', '15', '18', '20'], cw = (W - 180) / 5, y0 = by - 80;
  cols.forEach((c, i) => { const x = bx - W / 2 + 90 + i * cw + cw / 2; text(g, c, x, y0, { size: 26, color: '#4a4650', font: FONTS.ui, weight: 900 }); seg(g, [[x - cw / 2, y0 + 30], [x + cw / 2, y0 + 30]], 2, '#c8c0b0');
    const ap = i < 4 ? ease.out(prog(t, 0.2 + i * 0.25, 0.5 + i * 0.25)) : ease.out(prog(t, tAdd, tAdd + 0.4)); if (ap <= 0) return;
    text(g, vals[i], x, y0 + 110 - 20 * i, { size: 74 + i * 6, color: ui.gold, font: FONTS.ui, weight: 900, alpha: ap, stroke: 6, strokeColor: '#5a4020' }); });
  // the pencil writing the fifth number
  const px = bx - W / 2 + 90 + 4.5 * cw + Math.sin(t * 30) * 6 * clamp(1 - Math.abs(t - tAdd - 0.2) * 3), py = y0 + 60 + Math.cos(t * 26) * 6, pv = t > tAdd - 0.4;
  if (pv) { g.save(); g.translate(px + 40, py + 30); g.rotate(-0.6); poly(g, [[0, 0], [14, -26], [26, -20]], '#e8c8a0'); circle(g, 4, -6, 4, '#2a2230'); g.fillStyle = '#f2c21a'; g.beginPath(); g.moveTo(14, -26); g.lineTo(220, -140); g.lineTo(232, -118); g.lineTo(26, -20); g.fill(); g.restore(); }
  const ak = ease.outBack(prog(t, tMore, tMore + 0.35)); if (ak > 0.01) { const ax = bx + W / 2 - 160, ay = by + 230; g.save(); g.translate(ax, ay); g.scale(ak, ak); poly(g, [[-40, 40], [40, 40], [40, -40], [70, -40], [0, -120], [-70, -40], [-40, -40]], ui.gold); g.restore(); text(g, 'ADD DIFFICULTY', ax - 120, ay + 90, { size: 34, color: shade(ui.gold, -0.3), font: FONTS.ui, weight: 900, alpha: ak }); }
  // a climbing line drawn under the numbers
  BP.draw(g, [[bx - W / 2 + 90 + cw / 2, y0 + 200], [bx - W / 2 + 90 + 1.5 * cw, y0 + 175], [bx - W / 2 + 90 + 2.5 * cw, y0 + 145], [bx - W / 2 + 90 + 3.5 * cw, y0 + 110], [bx - W / 2 + 90 + 4.5 * cw, y0 + 80]], ease.inOut(prog(t, 0.3, tAdd + 0.4)), { w: 5, color: '#d4262e' });
  g.restore();
  atmos(g, t, { z, x: 0, y: 0 }, { color: '#fff4dc', far: 10, near: 3 });
} });

// s050 — BLUEPRINT: the climbing staircase gets "PROGRESSIVE OVERLOAD" on "progressive"; on "overload" a FLAT line "YOUR PLAN" slides in beside it
registerShot('s050', { draw(g, t, info) {
  const tProg = wt(info, 'progressive', 0.69), tOver = wt(info, 'overload', 1.07, 0.9), ui = S().ui;
  bpPush(g, t, info.dur, () => {
    BP.board(g, t, { title: 'FIG 5 - PROGRESSIVE OVERLOAD', fig: 'KEEP ADDING A LITTLE MORE' });
    const x0 = E.W * 0.12, y0 = E.H * 0.82, sw = 150, sh = 70, pts = [[x0, y0]];
    for (let i = 0; i < 7; i++) { const [x, y] = pts[pts.length - 1]; pts.push([x + sw, y], [x + sw, y - sh]); }
    BP.draw(g, pts, ease.inOut(prog(t, 0.0, tProg + 0.2)), { w: 7, color: ui.blueprint });
    const lk = ease.outBack(prog(t, tProg, tProg + 0.4)); if (lk > 0.01) { g.save(); g.translate(x0 + 4 * sw, y0 - 7 * sh - 60); g.rotate(-0.4); g.scale(lk, lk); text(g, 'PROGRESSIVE OVERLOAD', 0, 0, { size: 52, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3, glow: 14, glowColor: alpha(ui.gold, 0.5) }); g.restore(); }
    const fk = ease.out(prog(t, tOver, tOver + 0.5)), fy = y0 + 70, fx0 = lerp(E.W + 40, x0 + 160, fk);
    if (fk > 0) { seg(g, [[fx0, fy], [fx0 + 1100, fy]], 7, ui.accent); for (let i = 0; i < 6; i++) text(g, '100', fx0 + 90 + i * 180, fy - 34, { size: 30, color: ui.gold, font: FONTS.ui, weight: 900 }); text(g, 'YOUR PLAN', fx0 + 40, fy + 46, { size: 40, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 4, align: 'left' }); }
  });
} });

// s051 — INSERT GAG: the wall calendar with "100" written in every day; gold 100 on "hundred", the camera pans along endless 100s, FOREVER stamps down
const MONTHS = ['JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE'];
registerShot('s051', { draw(g, t, info) {
  const tH = wt(info, 'hundred', 0.83), tFor = wt(info, 'forever', 1.91, 1.4), ui = S().ui;
  const pan = 3400 * ease.in(prog(t, tH + 0.2, info.dur + 0.6)) + 30 * t, cw = 170, chh = 132, top = E.H * 0.2;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#7a86a8', '#5a6488']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(-pan, 0);
  const i0 = Math.floor(pan / cw) - 1, i1 = i0 + Math.ceil(E.W / cw) + 3;
  for (let c = i0; c <= i1; c++) { const x = 120 + c * cw, m = Math.floor(c / 7);
    if (c % 7 === 0) { rr(g, x - 6, top - 120, cw * 7 + 12, chh * 5 + 150, 10); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(); }
    g.fillStyle = '#fbf7ee'; g.fillRect(x, top - 100, cw, chh * 5 + 100);
    for (let r = 0; r < 5; r++) { const y = top + r * chh; g.strokeStyle = '#d8d0c0'; g.lineWidth = 2; g.strokeRect(x, y, cw, chh); text(g, String(((c % 7 + 7) % 7) + r * 7 + 1), x + 18, y + 20, { size: 18, color: '#8a8490', font: FONTS.ui, weight: 800, align: 'left' });
      text(g, '100', x + cw / 2, y + chh / 2 + 10, { size: 48, color: '#d4262e', font: FONTS.title, weight: 700 }); } }
  for (let c = i0 - 7; c <= i1; c++) if (((c % 7) + 7) % 7 === 0) { const x = 120 + c * cw, m = Math.floor(c / 7); g.fillStyle = '#d4262e'; g.fillRect(x, top - 100, cw * 7, 80); text(g, MONTHS[((m % 12) + 12) % 12], x + cw * 3.5, top - 60, { size: 46, color: '#fff', font: FONTS.title, weight: 700, spacing: 6 }); }
  g.restore();
  // the gold 100 on "hundred" (first visible square) + the FOREVER stamp
  const hk = ease.outBack(prog(t, tH, tH + 0.35)) * clamp(1 - prog(t, tH + 0.9, tH + 1.2)); if (hk > 0.01) { const x = 120 + cw * 2 + cw / 2 - pan, y = top + chh * 1.5 + 10; g.save(); g.translate(x, y); g.scale(hk * 1.6, hk * 1.6); glow(g, 0, 0, 120, ui.gold, 0.4); text(g, '100', 0, 0, { size: 60, color: ui.gold, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#1a1020' }); g.restore(); }
  const sk = prog(t, tFor, tFor + 0.18), [shx, shy] = jumpShake(t, tFor + 0.18, 12);
  if (sk > 0) { const sc = lerp(2.4, 1, ease.in(sk)); g.save(); g.translate(E.W / 2 + shx, E.H * 0.55 + shy); g.rotate(-0.14); g.scale(sc, sc); g.globalAlpha = Math.min(1, sk * 2); rr(g, -400, -110, 800, 220, 26); g.strokeStyle = ui.gold; g.lineWidth = 16; g.stroke(); g.fillStyle = alpha('#140f18', 0.75); g.fill(); text(g, 'FOREVER', 0, 6, { size: 150, color: ui.gold, font: FONTS.title, weight: 700, spacing: 10 }); g.restore(); }
  atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#fff4dc', far: 10, near: 3 });
} });

// s052 — TWO-SHOT: Dev staggers in with a bulging backpack of textbooks and drops it into his arms on "backpack"; he sinks under it
registerShot('s052', { draw(g, t, info) {
  const tBag = wt(info, 'backpack', 0.77), tText = wt(info, 'textbooks', 1.49, 1.0);
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [MATX - CX - 240, MATX - CX - 200], y: [30, 36] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JULY' }), gy = H.GY + 30, hx = H.pos.matX + 40;
  const dx = lerp(hx - 1100, hx - 330, ease.out(prog(t, 0, tBag - 0.05))), [sx, sy] = jumpShake(t, tBag + 0.05, 8);
  const sink = t > tBag ? ease.out(prog(t, tBag, tBag + 0.3)) : 0;
  layer(g, cam, 1, (g) => {
    const walking = t < tBag - 0.05, dp = walking ? { ...walkAlong(dx * 0.8, 1.9, { facing: 1 }).pose, eF: [26, -140], hF: [40, -128], eB: [20, -140], hB: [34, -130] } : idle(poseAt(t - tBag, [[0, 'stand'], [0.4, 'crossArms']]), t, 2);
    const dO = { x: dx, y: gy + (walking ? Math.abs(Math.sin(t * 9)) * 6 : 0), s: 1.9, facing: 1 };
    actor(g, 'DEV', { ...dO, pose: dp, expr: exprAt(t, [[0, 'nervous'], [tBag + 0.1, 'cheeky']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, 0), rim: H.rim, t });
    const hp = blendPose({ ...POSES.stand, eF: [26, -140], hF: [42, -130], eB: [20, -140], hB: [36, -132] }, { ...POSES.crouch, eF: [30, -96], hF: [44, -86], eB: [24, -98], hB: [38, -88] }, sink);
    actor(g, 'HERO', { x: hx + sx, y: gy, s: 1.9, facing: -1, pose: idle(hp, t, 3), expr: exprAt(t, [[0, 'neutral'], [tBag, 'surprised'], [tText, 'worried']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(-1, 0.3), rim: H.rim, t });
    const from = local(dO, [40, -128]), to = local({ x: hx, y: gy, s: 1.9, facing: -1 }, hp.hF), k = ease.inOut(prog(t, tBag - 0.25, tBag));
    bookBag(g, lerp(from[0] + 40, to[0] - 20, k) + sx, lerp(from[1] + 40, to[1] + 40, k) - Math.sin(k * Math.PI) * 60 + sy, 1.15, Math.sin(t * 3) * 0.04 * (1 - sink));
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff1d0', far: 14, near: 5 });
  chip(g, t, { str: 'Full of textbooks', at: tText, x: E.W * 0.3, y: E.H * 0.14, dur: info.dur - 0.05, tone: 'blue' });
} });

// s053 — Dev: "Wear this." (lip-sync); backpack on, he drops into a push-up and trembles at once; the time-skip card flips back to "DAY 1?"
registerShot('s053', { draw(g, t, info) {
  const st = info.shot.start, tWear = wt(info, 'wear', 0.15), tSud = wt(info, 'suddenly', 1.51, 1.0), tDay = wt(info, 'day', 2.09, 1.8), tAgain = wt(info, 'again', 2.41, 2.0);
  const tDrop = tSud, R = pushUp(t, 0.5, { t0: tDrop + 0.2, from: 0, fatigue: 1, tremble: 1, sag: 0.6 }), down = t > tDrop;
  const [sx, sy] = jumpShake(t, tDrop + 0.15, 10);
  const cam = camMove(t, info.dur, { z: [1.15, 1.22], x: [MATX - CX - 200, MATX - CX - 150], y: [90, 100] }); cam.x += sx; cam.y += sy;
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'JULY' }), gy = H.GY + 30, hx = H.pos.matX - 120;
  layer(g, cam, 1, (g) => {
    const tg = talkGesture ? talkGesture(t, 2, {}) : null, dp = t < tWear + 0.9 ? { ...POSES.point, hF: [44, -70], eF: [24, -110] } : POSES.crossArms;
    actor(g, 'DEV', { x: hx - 520, y: gy - 10, s: 1.9, facing: 1, pose: idle(dp, t, 2), expr: exprAt(t, [[0, 'smirk'], [tAgain, 'cheeky']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0.4), talk: talkAmount(st + t, st + tWear - 0.05, st + tWear + 0.9), rim: H.rim, t });
    if (!down) { const p = idle(POSES.stand, t, 3), o = { x: hx + 60, y: gy, s: 1.9, facing: 1 }; backpack(g, { ...o, pose: p, load: 1, layer: 'back', t }); actor(g, 'HERO', { ...o, pose: p, expr: 'determined', blink: blinkFlag(t, 3.2, 1), look: lookToward(-1, 0), rim: H.rim, t }); backpack(g, { ...o, pose: p, load: 1, layer: 'front', t }); }
    else trainee(g, 'HERO', R, { x: hx, y: gy, s: 2.0, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.5), expr: exprAt(t, [[0, 'determined'], [tDay, 'shocked']]), backpack: 1, sweat: 0.8, breath: 1.5 });
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff1d0', far: 14, near: 5 });
  if (t > tDrop + 0.2) repCounter(g, 1, { since: t - tDrop - 0.2, label: 'PUSH-UPS', of: 100, x: E.W - 260, y: 190, size: 130 });
  skipCard(g, t, info, [[tDay - 0.4, 'MONTH 3'], [tDay - 0.02, 'DAY 1?']], { until: info.dur + 1 });
} });
