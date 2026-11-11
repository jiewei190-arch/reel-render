// C_s053_s061_silk.js — ep 4 batch C part 1: RULE 3 card, FIG 3 silk (liquid -> solid, the dragline, steel, Kevlar, density, recycling),
// protein comes from food, the 9-egg feast. LEGAL: silk only from the back end / real spiders; no franchise anything.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { DEV } from '../cast.js';
import { garden } from '../sets/garden.js';
import { home3, home3Fg } from '../sets/home3.js';
import { board, label, draw } from '../sets/bp.js';
import { ruleCard, chip } from '../sets/hud.js';
import { pip, silkLine } from '../sets/spider.js';
import { silkGland, silkVsSteel } from '../sets/spiderbp.js';
import { feast } from '../sets/spiderprops.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, push, goldPop, fade, cTxt, vest, orbWeb, gardenBg } from './C_lib.js';
import * as FX from '/engine/fx2d.js';

const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 53 });
const RIM = { color: '#ffe0b0', dir: [0.8, -0.5] };

// s053 RULE 3 card over the dimmed garden with the shiny silk line across the lawn
registerShot('s053', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.01 * t, x: 0, y: 0 };
  ruleCard(g, t, info, { n: 3, title: 'SILK STARTS OUT AS A LIQUID.', bg: (g, t) => { blurLayer(g, 8, (g) => gardenBg(g, t, cam, { silk: 1 }), null, 1); veil(g, '#140f1c', 0.25); } });
  chip(g, t, { str: 'LIQUID PROTEIN', at: wt(info, 'liquid', 1.69), y: E.H * 0.92, dur: info.dur });
} });

// s054 FIG 3: liquid in the gland -> solid fibre at the spinneret (back end)
registerShot('s054', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - SILK', fig: 'LIQUID TO SOLID' });
  const tN = wt(info, 'nozzles,', 1.67), tS = wt(info, 'solid', 3.15);
  push(g, t, info.dur, () => {
    const G = silkGland(g, t, { x: E.W * 0.42, y: E.H * 0.45, s: 1.1, k: ease.out(prog(t, 0, 1.0)), pull: prog(t, 0.55, 3.59) });
    label(g, t, { at: G.gland, to: [G.gland[0] - 180, E.H * 0.16], str: 'liquid protein', start: wt(info, 'As', 0.15) });
    label(g, t, { at: G.spinneret, to: [G.spinneret[0] + 260, G.spinneret[1] - 160], str: 'tiny nozzles', start: tN });
    if (t > tS - 0.05) label(g, t, { at: G.fibre, to: [G.fibre[0] + 200, G.fibre[1] + 40], str: 'solid thread', start: tS });
    if (t > tN) { const p = ease.out(prog(t, tN, tN + 0.4)); ring(g, G.spinneret[0], G.spinneret[1], 40 * p, 3, alpha(S().ui.gold, 0.7 * (1 - prog(t, tN + 0.6, tN + 1.2)))); }
  });
  air(g, t);
} });

// s055 THE SAFETY LINE: Pip drops off the shed shelf on its dragline and bounces gently
registerShot('s055', { draw(g, t, info) {
  const tH = wt(info, 'safety', 0.41), tB = wt(info, 'silk,', 1.57), drop = t < tH ? 0 : (() => { const u = t - tH; const fall = ease.in(clamp(u / (tB - tH))); const b = u > tB - tH ? Math.exp(-(u - (tB - tH)) * 3) * Math.sin((u - (tB - tH)) * 9) * 0.08 : 0; return fall + b; })();
  const camY = lerp(0, 230, ease.inOut(clamp(drop)));
  blurLayer(g, 10, (g) => garden(g, t, { z: 1.7, x: 120, y: -80 + camY * 0.3 }, { view: 'shed', mood: 'day' }), null, 1); veil(g, '#201810', 0.12);
  g.save(); g.translate(0, -camY);
  const shelfY = E.H * 0.36, ex = E.W * 0.46;
  rr(g, -40, shelfY, ex + 40, 60, 6); g.fillStyle = linGrad(g, 0, shelfY, 0, shelfY + 60, ['#a07a52', '#6a4a30']); g.fill(); seg(g, [[-40, shelfY + 2], [ex, shelfY + 2]], 3, alpha('#ffe0b0', 0.6));   // the shelf edge
  rr(g, ex - 300, shelfY - 150, 120, 150, 10); g.fillStyle = '#5a6e8a'; g.fill(); rr(g, ex - 310, shelfY - 160, 140, 24, 6); g.fillStyle = '#3a4a62'; g.fill();          // a paint tin
  const top = [ex - 30, shelfY + 4], py = lerp(shelfY - 2, shelfY + 520, drop), px = lerp(ex - 70, ex + 10, clamp(drop * 3)), hopK = t < tH ? 0 : prog(t, tH, tH + 0.3);
  if (t > tH) silkLine(g, top, [px, py - 120], { t, sag: 0, w: 3 });
  g.save(); g.translate(px, py); if (t > tH + 0.25) g.rotate(Math.sin((t - tH) * 1.3) * 0.25);
  pip(g, 0, 0, 3.0, { t, hop: t < tH + 0.3 ? hopK * 0.5 : 0, wave: t > tB ? 0.6 + 0.4 * Math.sin(t * 3) : 0, look: [0.3, 0.2], blink: blinkAmt(t, 2.6, 4), tilt: Math.sin(t * 1.4) * 0.6 });
  g.restore(); g.restore();
  glow(g, E.W * 0.75, E.H * 0.2, 700, '#fff0d0', 0.22);
  chip(g, t, { str: 'DRAGLINE', at: wt(info, 'dragline', 1.03), x: E.W * 0.72, y: E.H * 0.5, dur: info.dur });
  atmos(g, t, null, { color: '#fff0d0', far: 18, near: 6 });
} });

// s056-s058 FIG 3b: silkVsSteel, one panel per shot
const steelBoard = (g, t, info, show, extra) => {
  board(g, t, { title: 'FIG 3 - SILK', fig: 'WEIGHT FOR WEIGHT' });
  push(g, t, info.dur, () => { const A = silkVsSteel(g, t, { x: E.W * 0.5, y: E.H * 0.52, w: 1400, k: 1, show }); extra && extra(A); }, 0.025);
  air(g, t);
};
registerShot('s056', { draw(g, t, info) {
  const tR = wt(info, 'rivals', 0.97);
  steelBoard(g, t, info, ease.out(prog(t, 0.15, tR)), (A) => {
    if (!A.balance) return; const [bx, by] = A.balance;
    label(g, t, { at: [bx - 200, by + 40], to: [bx - 300, by - 150], str: 'SILK', start: 0.4 });
    label(g, t, { at: [bx + 200, by + 40], to: [bx + 300, by - 150], str: 'STEEL', start: 0.6 });
    if (t > tR) ring(g, bx, by, 40 + 120 * prog(t, tR, tR + 0.6), 3, alpha(S().ui.gold, 0.6 * (1 - prog(t, tR, tR + 0.6))));
  });
} });
registerShot('s057', { draw(g, t, info) {
  const tT = wt(info, 'tougher', 0.57), tB = wt(info, 'bulletproof', 2.43);
  steelBoard(g, t, info, 1 + ease.out(prog(t, 0.37, 1.13)), (A) => {
    goldPop(g, t, 'TOUGHER', tT, E.W * 0.8, E.H * 0.2, 64);
    vest(g, E.W * 0.2, E.H * 0.83, 0.75, prog(t, tB, tB + 0.4));
    fade(g, prog(t, tB + 0.2, tB + 0.6), () => cTxt(g, 'the fibre in bulletproof vests', E.W * 0.2 + 90, E.H * 0.83, { align: 'left', size: 30 }));
  });
} });
registerShot('s058', { draw(g, t, info) {
  const tW = wt(info, 'wins.', 1.46), tL = wt(info, 'lighter.', 3.34), U = S().ui;
  steelBoard(g, t, info, 2 + ease.out(prog(t, wt(info, 'Thread', 0.32), tW)), () => {
    // two equal-thickness threads under the balance: steel wins
    const x0 = E.W * 0.1, y0 = E.H * 0.82, k = ease.out(prog(t, tW - 0.3, tW + 0.2));
    if (k > 0) { seg(g, [[x0, y0], [x0 + 520 * k, y0]], 6, U.blueprint); seg(g, [[x0, y0 + 46], [x0 + 520 * k, y0 + 46]], 6, U.cream); cTxt(g, 'STEEL', x0 - 14, y0, { align: 'right', size: 22, alpha: k }); cTxt(g, 'SILK', x0 - 14, y0 + 46, { align: 'right', size: 22, alpha: k }); }
    goldPop(g, t, 'STEEL WINS', tW, x0 + 260, y0 - 70, 56);
    // a little gold silk sample lifts off the SILK pan and floats up like a feather
    const f = ease.out(prog(t, tL, tL + 0.8)); if (f > 0) { const bx = E.W * 0.5 - 1400 * 0.3 - 200, by = lerp(E.H * 0.52 - 10, E.H * 0.3, f), sw = Math.sin(t * 4) * 14 * f;
      g.save(); g.translate(bx + sw, by); g.rotate(Math.sin(t * 3) * 0.2 * f); for (let i = 0; i < 4; i++) ring(g, 0, -i * 4, 26 - i * 3, 2.5, alpha(U.gold, 0.9)); g.restore();
      goldPop(g, t, 'MUCH LIGHTER', tL + 0.1, bx + 230, by, 50); }
  });
} });

// s059 PROTEIN COMES FROM FOOD: the fridge, a stomach rumble, Pip on his shoulder
registerShot('s059', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [150, 170], y: [-20, -30], drift: 0.4 });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 }), P = H.pos, GY = H.GY, tP = wt(info, 'protein', 0.35), tF = wt(info, 'food.', 1.23);
  const fx = P.fridgeX ?? E.W * 0.3, open = ease.out(prog(t, tP - 0.1, tP + 0.35));
  layer(g, cam, 1, (g) => {
    // the open fridge: cold light spills out, the door swings toward camera
    glow(g, fx + 40, GY - 360, 420 * open, '#cfe8ff', 0.5 * open);
    if (open > 0.02) { rr(g, fx - 150, GY - 630, 300, 610, 14); g.fillStyle = alpha('#5a7088', open); g.fill(); rr(g, fx - 136, GY - 616, 272, 582, 10); g.fillStyle = alpha('#f2faff', open); g.fill(); for (let i = 0; i < 3; i++) seg(g, [[fx - 130, GY - 480 + i * 150], [fx + 130, GY - 480 + i * 150]], 6, alpha('#8aa4c0', open));
      rr(g, fx - 90, GY - 550, 60, 70, 8); g.fillStyle = '#f2e8d6'; g.fill(); rr(g, fx + 20, GY - 380, 90, 50, 8); g.fillStyle = '#e8b04a'; g.fill(); circle(g, fx - 40, GY - 300, 26, '#ff7a5a');
      g.save(); g.translate(fx + 150, GY - 640); g.scale(lerp(-1, 0.35, open), 1); rr(g, 0, 0, 300, 620, 14); g.fillStyle = '#d8dee6'; g.fill(); g.strokeStyle = '#8a96a4'; g.lineWidth = 4; g.stroke(); g.restore(); }
    const o = { x: fx - 300, y: GY, s: 1.9, facing: 1 }, pose = idle(poseAt(t, [[0, 'stand'], [tP, { ...POSES.reach, hF: [40, -170] }]]), t, 2);
    actor(g, 'HERO', { ...o, pose, expr: exprAt(t, [[0, 'neutral'], [tP + 0.1, 'awe'], [tF, 'happy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0), rim: { color: '#cfe8ff', dir: [0.9, -0.3] }, t });
    // stomach rumble
    const rk = prog(t, 0.6, 0.75) * (1 - prog(t, 1.3, 1.5)); if (rk > 0) for (let i = 0; i < 3; i++) { const yy = GY - 130 * 1.9 + i * 18, xx = o.x - 70 + Math.sin(t * 40 + i) * 4; seg(g, [[xx, yy], [xx + 26, yy - 6]], 3, alpha('#fff1dc', 0.8 * rk)); }
    const sh = [o.x + pose.sh[0] * 1.9 - 8, GY + pose.sh[1] * 1.9 - 4]; pip(g, sh[0], sh[1], 0.9, { t, facing: 1, look: [0.6, 0], blink: blinkAmt(t, 2.8, 1), tilt: Math.sin(t * 2) * 0.5 });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
  chip(g, t, { str: 'PROTEIN = FOOD', at: tF, x: E.W * 0.68, y: E.H * 0.2, dur: info.dur });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
} });

// s060 FIG 3c RECYCLED: a cute garden spider rolls its old web up like spaghetti and eats it; arrows loop out as a fresh web
registerShot('s060', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - SILK', fig: 'RECYCLED' });
  const U = S().ui, tE = wt(info, 'eat', 1.25), tR = wt(info, 'recycle', 2.51), roll = ease.inOut(prog(t, tE - 0.2, tE + 0.8));
  push(g, t, info.dur, () => {
    const cx = E.W * 0.32, cy = E.H * 0.5;
    fade(g, 1 - roll, () => orbWeb(g, cx, cy, 260, ease.out(prog(t, 0.1, 1.1))));
    // the ball of old silk being rolled
    const bx = lerp(cx, cx + 120, roll), by = cy + 40; if (roll > 0) { for (let i = 0; i < 6; i++) { g.strokeStyle = alpha(U.cream, 0.8); g.lineWidth = 2.5; g.beginPath(); g.ellipse(bx - 60, by + 60, (24 + i * 9) * roll + 8, (18 + i * 7) * roll + 6, i * 0.7 + t, 0, 7); g.stroke(); } }
    // a cute cream garden-spider outline (round body, 8 bent legs, two dot eyes, a smile)
    g.save(); const sx0 = lerp(cx + 40, cx + 200, roll), sy0 = cy + 40; g.translate(sx0, sy0); g.scale(1.7, 1.7); g.translate(-sx0, -sy0);
    const sx = sx0, sy = sy0, chew = t > tE ? Math.sin(t * 14) * 3 : 0;
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const a = -1.2 + i * 0.5; seg(g, [[sx + sd * 20, sy], [sx + sd * (50 + i * 4), sy - 40 + i * 26], [sx + sd * (70 + i * 6), sy - 10 + i * 30]], 4, U.cream); }
    circle(g, sx + 30, sy + 10, 46, alpha(U.cream, 0.18)); ring(g, sx + 30, sy + 10, 46, 4, U.cream); circle(g, sx - 22, sy - 10 + chew, 28, alpha(U.cream, 0.25)); ring(g, sx - 22, sy - 10 + chew, 28, 4, U.cream);
    circle(g, sx - 32, sy - 16, 5, U.cream); circle(g, sx - 14, sy - 16, 5, U.cream); g.strokeStyle = U.cream; g.lineWidth = 3; g.beginPath(); g.arc(sx - 23, sy - 6 + chew, 8, 0.3, Math.PI - 0.3); g.stroke(); g.restore();
    // recycle arrows: the ball -> the spider -> out as a fresh web on the right
    const ak = ease.out(prog(t, tR - 0.2, tR + 0.5)); if (ak > 0) {
      g.strokeStyle = U.gold; g.lineWidth = 6; g.beginPath(); g.arc(E.W * 0.55, cy, 150, Math.PI * 1.15, Math.PI * (1.15 + 1.6 * ak)); g.stroke();
      const ea = Math.PI * (1.15 + 1.6 * ak), ax = E.W * 0.55 + Math.cos(ea) * 150, ay = cy + Math.sin(ea) * 150; poly(g, [[ax + Math.cos(ea + 1.57) * 22, ay + Math.sin(ea + 1.57) * 22], [ax + Math.cos(ea) * 14, ay + Math.sin(ea) * 14], [ax - Math.cos(ea) * 14, ay - Math.sin(ea) * 14]], U.gold);
      }
    orbWeb(g, E.W * 0.76, E.H * 0.47, 220, ease.out(prog(t, tR + 0.1, tR + 1.0)), { color: U.gold });
    if (t > tR + 0.3) label(g, t, { at: [E.W * 0.76, E.H * 0.47 + 220], to: [E.W * 0.6, E.H * 0.86], str: 'old web -> new silk', start: tR + 0.3 });
  });
  air(g, t);
} });

// s061 THE FEAST: nine eggs and all of Dev's sandwiches
registerShot('s061', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [0, 0], y: [-20, -40], drift: 0.4 });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 }), P = H.pos, GY = H.GY, U = S().ui;
  const tE = wt(info, 'eggs', 1.39), tS = wt(info, 'sandwiches.', 2.67), eggsK = 9 * prog(t, 0.79, tE), left = 6 * (1 - prog(t, 1.81, tS));
  layer(g, cam, 1, (g) => {
    const hx = P.tableX - 420, munch = t > 0.6 && t < tS + 0.4 ? 0.5 + 0.5 * Math.sin(t * 22) : 0.15;
    actor(g, 'HERO', { x: hx, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [1.0, { ...POSES.holdFront, hF: [30, -190] }], [1.6, 'holdFront'], [2.2, { ...POSES.holdFront, hF: [30, -190] }], [2.9, 'holdFront']], 0.2), t, 1), expr: exprAt(t, [[0, 'happy'], [tS + 0.2, 'joy']]), talk: munch, blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0.3), rim: RIM, t });
    actor(g, DEV, { x: P.tableX + 430, y: GY, s: 1.9, facing: -1, pose: idle({ ...POSES.holdFront, hF: [30, -130] }, t, 2), expr: exprAt(t, [[0, 'surprised'], [1.4, 'shocked']]), blink: blinkFlag(t, 3.3, 1), look: lookToward(-1, 0.2), rim: RIM, t });
    // Dev's empty sandwich bag, held out
    const bx = P.tableX + 430 - 30 * 1.9 - 10, by = GY - 130 * 1.9; rr(g, bx - 34, by - 50, 68, 80, 8); g.fillStyle = alpha('#f4f0e6', 0.75); g.fill(); g.strokeStyle = '#b8b0a0'; g.lineWidth = 3; g.stroke(); seg(g, [[bx - 30, by - 40], [bx + 30, by - 40]], 3, '#5ab0e0');
    feast(g, t, P.tableX, P.tableTop - 14, 1, { eggs: eggsK, left, mess: prog(t, 0.8, tS) });
    pip(g, P.tableX + 3, P.tableTop - 14 - 80, 0.7, { t, look: [-0.8, 0], blink: blinkAmt(t, 2.6, 3), tilt: Math.sin(t * 1.6) });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
  const n = Math.min(9, Math.floor(eggsK + 0.001)); if (t > 0.79) { const land = ease.outBack(prog(t, tE, tE + 0.3)); g.save(); g.translate(E.W * 0.5, E.H * 0.16); g.scale(1 + 0.15 * land * (1 - prog(t, tE + 0.3, tE + 0.6)), 1 + 0.15 * land * (1 - prog(t, tE + 0.3, tE + 0.6)));
    rr(g, -190, -50, 380, 100, 50); g.fillStyle = 'rgba(11,19,36,.85)'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); text(g, `EGGS: ${n}`, 0, 4, { size: 58, color: U.gold, font: FONTS.title, weight: 700, spacing: 3, glow: 14, glowColor: alpha(U.gold, 0.6) }); g.restore(); }
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
} });
