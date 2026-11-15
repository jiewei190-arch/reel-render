// C_s061_s066_clouds_everest.js — batch C: days 13-15, above the clouds and almost to the top of Everest.
//   s061 insert: blur montage: DAY 12 -> 13 -> 14 flips fast, meter races 2 km -> 4 km, a motion-blurred HERO zips up through frame twice
//   s062 med: HERO punches up through the cloud deck on 'above' (ice crystals), shivers on 'colder' (breath puff), drips on 'wetter'
//   s063 two: back on the lawn, he lands with a squelch, a little rain cloud over his head; DEV hands him a towel, deadpan; DAY 14 -> 15 on 'Day'
//   s064 wide: the Himalaya at golden hour, meter 8 km on 'Eight', the camera rises with him beside Everest, chip on 'Everest'
//   s065 med: stall just BELOW the summit flag: meter 8,192 m vs the gold label 8,849 m, fingertips centimetres from the flag
//   s066 face: SO CLOSE: determined -> worried -> sheepish, frost on the brows, the flag in his eyes, then he drops out of frame
import { E, S, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rng, rr, seg, circle, poly, glow, alpha, shade, text, FONTS, linGrad, veil } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, headPos } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { stratosphere, breathFog } from '../sets/sky.js';
import { peaks, peaksFg, cloudLayer, peaksGround } from '../sets/peaks.js';
import { faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpStreaks, splash, jumpShake } from '../sets/jump.js';
import { dayCounter } from '../sets/devices.js';
import { wt, TEE, teeFace, dayC, meter } from './C_lib.js';

registerShot('s061', { draw(g, t, info) {
  const tThir = Math.max(0.3, wt(info, 'thirteen', 0.3)), tFour = wt(info, 'fourteen', 0.91), tTwo = wt(info, 'Two', 2.53), tFr = wt(info, 'Four', 3.69, 3.0);
  const cam = camMove(t, info.dur, { z: [1.02, 1.08], y: [0, -40] });
  stratosphere(g, t, cam, { alt: lerp(0.05, 0.22, t / info.dur) });
  // the sky streaks past: clouds rushing down, long vertical light streaks
  layer(g, cam, 0.5, (g) => { const r = rng(14); for (let i = 0; i < 8; i++) { const x = r() * E.W * 1.2 - 100, y = ((r() * E.H * 2 + t * (900 + r() * 500)) % (E.H * 2.2)) - E.H * 0.6; g.fillStyle = alpha('#ffffff', 0.55); g.beginPath(); g.ellipse(x, y, 180 + r() * 140, 60 + r() * 40, 0, 0, 7); g.fill(); } });
  g.save(); g.globalCompositeOperation = 'lighter'; const r2 = rng(6); for (let i = 0; i < 40; i++) { const x = r2() * E.W, L = 200 + r2() * 400, y = ((r2() * E.H * 2 + t * 2400) % (E.H * 2)) - L; seg(g, [[x, y], [x, y + L]], 2 + r2() * 3, alpha('#ffffff', 0.18)); } g.restore();
  // two zips: the hero shoots up through frame (motion-blurred: a trail of ghosts)
  [[tFour + 0.1, 0.24, 1], [tTwo - 0.45, 0.62, 1], [tFr - 0.45, 0.34, -1]].forEach(([tz, xf, f], i) => { const u = (t - tz) / 0.6; if (u < -0.1 || u > 1.1) return; const y = lerp(E.H * 1.4, -E.H * 0.5, u), x = E.W * xf;
    layer(g, { x: 0, y: 0, z: 1 }, 1, (g) => { for (let k = 4; k >= 1; k--) actor(g, TEE, { x, y: y + k * 70 + 240, s: 1.9, facing: f, pose: POSES.jump, alpha: 0.12 * (5 - k), t, shadow: false });
      jumpStreaks(g, t, x, y + 100, { s: 1.9, dir: 1, a: 0.7, count: 18, seed: 3 + i });
      actor(g, TEE, { x, y: y + 240, s: 1.9, facing: f, pose: POSES.jump, expr: ['joy', 'joy', 'determined'][i], blink: blinkFlag(t, 3, i), t, shadow: false, rim: { color: '#ffffff', dir: [0.6, -0.8] } }); }); });
  atmos(g, t, cam, { color: '#ffffff', far: 12, near: 5 });
  // big flip counter centre-top, meter on the right
  const pop = 1 + 0.06 * (Math.exp(-Math.max(0, t - tThir) * 7) + Math.exp(-Math.max(0, t - tFour) * 7));
  g.save(); g.translate(E.W * 0.5, E.H * 0.24); g.scale(pop, pop); dayCounter(g, t, { x: 0, y: 0, s: 1.0, flip: 0.24, keys: [[0, 12], [tThir, 13], [tFour, 14]] }); g.restore();
  const v = t < tTwo ? lerp(1000, 2000, ease.inOut(prog(t, 0.3, tTwo))) : lerp(2000, 4000, ease.inOut(prog(t, tTwo + 0.2, tFr)));
  meter(g, t, v, { text: t < tTwo - 0.05 ? null : t < tFr ? '2 km' : '4 km' });
} });

registerShot('s062', { draw(g, t, info) {
  const tAbove = wt(info, 'above', 0.49), tCold = wt(info, 'colder', 1.79), tWet = wt(info, 'wetter', 2.53);
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-80, -40], y: [80, 40] });
  const P = peaks(g, t, cam, { mood: 'golden', label: 0, wind: 0.6 });
  const burst = ease.out(prog(t, tAbove - 0.1, tAbove + 0.7)), up = ease.out(prog(t, 0, tAbove + 0.8));
  const deckY = E.H * 0.8, hx = E.W * 0.44 + (t > tCold ? Math.sin(t * 70) * 5 * Math.exp(-(t - tCold) * 0.8) : 0), hy = lerp(E.H * 1.5, E.H * 0.83, up) + Math.sin(t * 1.8) * 6;
  const pose = idle(poseAt(t, [[0, 'jump'], [tAbove + 0.6, 'relaxed'], [tCold, { ...POSES.stand, eF: [-14, -150], hF: [-26, -168], eB: [22, -150], hB: [34, -168] }]], 0.25), t, 3);   // hugs himself on 'colder'
  const o = { x: hx, y: hy, s: 1.9, facing: 1, pose, expr: exprAt(t, [[0, 'determined'], [tAbove + 0.3, 'awe'], [tCold, 'shocked'], [tWet + 0.2, 'sad']]), blink: blinkFlag(t, 3.2, 1), look: t < tCold ? [0.6, -0.4] : [0.3, 0.6], rim: P.rim, t, shadow: false };
  layer(g, { x: 0, y: 0, z: 1 }, 1, (g) => {
    actor(g, TEE, o);
    const [mx, my, mr] = headPos({ ...o, outfit: TEE });
    // dripping after 'wetter': drops off the hem + elbows, a wet sheen on the shirt
    if (t > tWet - 0.1) { const wk = ease.out(prog(t, tWet - 0.1, tWet + 0.3)), r = rng(5); for (let i = 0; i < 9; i++) { const u = ((t * 1.3 + r()) % 1), dx = hx - 50 + r() * 100; circle(g, dx, hy - 180 + u * 260, 5, alpha('#cfeaff', 0.85 * wk * (1 - u))); }
      for (let i = 0; i < 4; i++) seg(g, [[hx - 24 + i * 14, hy - 300], [hx - 28 + i * 14, hy - 240]], 3, alpha('#e8f6ff', 0.4 * wk)); circle(g, mx - mr * 0.6, my - mr * 0.6, 7, alpha('#cfeaff', 0.9 * wk)); }
    if (t > tCold - 0.1) breathFog(g, mx + mr * 0.8, my + mr * 0.3, t, clamp((t - tCold + 0.1) * 3));
  });
  // the cloud deck he punches through: torn open on 'above', ice crystals glitter
  cloudLayer(g, t, { x: 0, y: 0, z: 1 }, { y: deckY, burst, burstX: E.W * 0.44, crystals: lerp(0.4, 1, burst) });
  peaksFg(g, t, cam);
  atmos(g, t, cam, { color: '#e8f0ff' });
  dayC(g, t, [[0, 14]]);
  meter(g, t, 4000, { text: '4 km' });
} });

registerShot('s063', { draw(g, t, info) {
  const tL = wt(info, 'down', 0.27, 0) < 0.6 ? 0.27 : 0.27, tSoak = wt(info, 'soaked', 0.77), tDay = wt(info, 'Day', 1.17);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [40, 60], y: [-10, -20] }); const [sx, sy] = jumpShake(t, tL, 10); cam.x += sx; cam.y += sy;
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 1, kite: 0 }), GY = R.GY + 30, hx = R.CX + 80, dvx = R.CX - 300;
  const fallY = lerp(-500, GY, ease.in(prog(t, -0.2, tL))), sq = t > tL ? 1 - 0.22 * Math.exp(-(t - tL) * 9) * Math.cos((t - tL) * 24) : 1;
  const towelIn = ease.out(prog(t, tSoak + 0.1, tSoak + 0.6)), took = t > tDay + 0.3;
  layer(g, cam, 1, (g) => {
    // squelch puddle
    if (t > tL) { const k = ease.out(prog(t, tL, tL + 0.2)); g.fillStyle = alpha('#5a8ab8', 0.45); g.beginPath(); g.ellipse(hx, GY + 6, 170 * k, 24 * k, 0, 0, 7); g.fill(); }
    splash(g, t, tL, hx, GY, { s: 1.9, size: 0.7, color: '#cfe8ff' });
    // DEV, deadpan, holds out the towel (towel in his front hand)
    const dpose = idle(towelIn > 0.5 && !took ? POSES.holdFront : POSES.relaxed, t, 2), D = { x: dvx + 180 * towelIn, y: GY, s: 1.9, facing: 1, pose: dpose, expr: exprAt(t, [[0, 'neutral'], [tDay, 'smirk']]), blink: blinkFlag(t, 3.6, 5), look: lookToward(1, -0.2), rim: R.rim, t };
    actor(g, 'DEV', D);
    const tx = (took ? hx + 10 : D.x + 70), ty = took ? GY - 400 : GY - 200; if (towelIn > 0.05) { g.save(); g.translate(tx, ty); g.rotate(took ? -0.2 : 0.1); rr(g, -50, -20, 100, took ? 90 : 120, 10); g.fillStyle = '#e8eef6'; g.fill(); for (let i = 0; i < 3; i++) seg(g, [[-44, 8 + i * 26], [44, 8 + i * 26]], 4, '#9ab8d8'); g.restore(); }
    // the hero: drops in, squelch, stands dripping (a little rain cloud over his head)
    const o = { x: hx, y: t < tL ? fallY : GY, s: 1.9, facing: -1, pose: t < tL ? POSES.jump : idle(poseAt(t, [[tL, 'crouch'], [tL + 0.35, 'sad'], [tDay + 0.3, took ? 'stand' : 'sad']], 0.25), t, 4),
      expr: exprAt(t, [[0, 'surprised'], [tL, 'shocked'], [tSoak, 'sad'], [tDay + 0.3, 'sheepish']]), blink: blinkFlag(t, 3.0, 2), look: t > tSoak ? lookToward(-1, 0) : [0, 1], rim: R.rim, t, shadow: t > tL - 0.1 };
    g.save(); g.translate(hx, GY); g.scale(1 / sq, sq); g.translate(-hx, -GY); actor(g, TEE, o); g.restore();
    const [mx, my, mr] = headPos({ ...o, outfit: TEE });
    if (t > tL) { const r = rng(4); for (let i = 0; i < 10; i++) { const u = ((t * 1.6 + r()) % 1), dx = hx - 60 + r() * 120; circle(g, dx, GY - 380 + u * 380, 4.5, alpha('#a8d4ff', 0.9 * (1 - u))); }
      const cy = my - mr - 90 + Math.sin(t * 2) * 6, ck = ease.outBack(prog(t, tL + 0.2, tL + 0.6)); g.save(); g.translate(mx, cy); g.scale(ck, ck); for (const [dx, dy, rr2] of [[-50, 4, 40], [0, -16, 52], [52, 6, 38], [-10, 18, 40], [30, 20, 34]]) circle(g, dx, dy, rr2, '#8a96aa'); g.restore();
      for (let i = 0; i < 6; i++) { const u = ((t * 2 + i / 6) % 1), dx = mx - 60 + i * 24; if (ck > 0.5) seg(g, [[dx, cy + 40 + u * 120], [dx - 3, cy + 58 + u * 120]], 3, alpha('#a8d4ff', 0.9 * (1 - u))); } }
  });
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: R.M.key });
  dayC(g, t, [[0, 14], [tDay, 15]]);
} });

registerShot('s064', { draw(g, t, info) {
  const tEight = wt(info, 'Eight', 0.15), tEv = wt(info, 'Everest', 3.15), rise = ease.inOut(prog(t, 0, info.dur));
  const cam = camMove(t, info.dur, { z: [0.92, 0.98], x: [-160, -120] }); cam.y = lerp(420, 0, rise);
  const P = peaks(g, t, cam, { mood: 'golden', label: 0, wind: 1 }), [sx, sy] = P.pos.summitScreen(cam);
  const hx = sx - 420, hy = lerp(E.H * 1.25, E.H * 0.62, ease.out(prog(t, 0, info.dur * 0.8))) + Math.sin(t * 2) * 6;
  jumpStreaks(g, t, hx, hy - 60, { s: 1.6, dir: 1, a: 0.4 * (1 - rise), count: 14, seed: 8 });
  layer(g, { x: 0, y: 0, z: 1 }, 1, (g) => actor(g, TEE, { x: hx, y: hy + 200, s: 1.6, facing: 1, pose: idle(poseAt(t, [[0, 'jump'], [tEv - 0.5, 'lookUp']], 0.3), t, 3), expr: exprAt(t, [[0, 'determined'], [tEight + 0.8, 'awe'], [tEv, 'joy']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(1, -0.6), rim: P.rim, t, shadow: false }));
  peaksFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffe8d0' });
  chip(g, t, { str: 'MOUNT EVEREST', at: tEv, x: sx, y: Math.max(E.H * 0.1, sy - 140) });
  dayC(g, t, [[0, 15]]);
  meter(g, t, lerp(7000, 8000, ease.out(prog(t, 0, tEight + 0.6))), { at: tEight, text: '8 km' });
} });

registerShot('s065', { draw(g, t, info) {
  const tTh = wt(info, 'thousand', 0.58), tFn = wt(info, 'forty-nine', 2.31), tM = wt(info, 'metres', 2.74);
  const cam = camMove(t, info.dur, { z: [1.1, 1.14], x: [-40, -20], y: [-80, -100] });
  const P = peaks(g, t, cam, { mood: 'golden', label: ease.out(prog(t, 0.15, tTh + 0.3)), wind: 1 }), [sx, sy] = P.pos.summitScreen(cam), zp = 1 + (cam.z - 1) * 0.6;
  // fingertips stop just short of the flag cloth
  const fx = sx + 10 * zp, fy = sy - 66 * zp, reach = ease.inOut(prog(t, 0.4, 1.6)), s = 1.9, hand = [30 * s, -252 * s];
  const hx = fx - hand[0] - lerp(160, 34, reach), hy = fy - hand[1] + 60 + Math.sin(t * 2.2) * 4;
  layer(g, { x: 0, y: 0, z: 1 }, 1, (g) => actor(g, TEE, { x: hx, y: hy, s, facing: 1, pose: idle(poseAt(t, [[0, 'jump'], [0.4, 'reachHigh']], 0.4), t, 3), rot: 0.04 * Math.sin(t * 0.9), expr: exprAt(t, [[0, 'awe'], [tTh, 'determined'], [tFn, 'worried']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(0.9, -0.5), rim: P.rim, t, shadow: false }));
  // the gap: a tiny bracket between fingertips and flag
  const gp = ease.out(prog(t, tFn - 0.3, tFn)); if (gp > 0.01) { const gx = fx - 24, gy = fy + 10; g.save(); g.globalAlpha *= gp; g.strokeStyle = S().ui.gold; g.lineWidth = 3; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(gx - 20, gy); g.lineTo(gx + 20, gy); g.stroke(); g.setLineDash([]); for (const d of [-1, 1]) seg(g, [[gx + d * 20, gy - 10], [gx + d * 20, gy + 10]], 3, S().ui.gold); g.restore(); }
  peaksFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffe8d0' });
  dayC(g, t, [[0, 15]]);
  meter(g, t, 8192, { text: '8,192 m', marks: [['EVEREST', 8849], ['BURJ KHALIFA', 828], ['CLOUDS', 2000], ['JETS', 11000]] });
} });

registerShot('s066', { draw(g, t, info) {
  const tClose = wt(info, 'close', 0.21), drop = ease.in(prog(t, 1.6, info.dur));
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-40, -20] }); cam.y = -160;
  blurLayer(g, 8, (g) => peaks(g, t, cam, { mood: 'golden', label: 0, wind: 1 }), null, 1); veil(g, '#2a1020', 0.18);
  const f = faceAt(t, [[0, 'determined'], [Math.max(0.4, tClose + 0.2), 'worried'], [1.3, 'sheepish']]);
  const cx = E.W * 0.45, cy = E.H * 0.54 + drop * E.H * 1.3 + Math.sin(t * 1.6) * 5, r = 320, z = lerp(1.0, 1.04, ease.inOut(prog(t, 0, 1.6)));
  if (drop > 0) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const x = cx - 360 + i * 66, L = 200 + drop * 400; seg(g, [[x, cy - r - L], [x, cy - r - 40]], 3, alpha('#ffffff', 0.25 * drop)); } g.restore(); }
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  teeFace(g, cx, cy, r, { f: { ...f, look: [0.35, -0.45] }, rimSide: 1, rimColor: '#ffb060', glint: '#ff6a4a', blink: blinkAmt(t, 2.8, 4), breath: Math.sin(t * 2.4), tilt: Math.sin(t * 0.9) * 0.02 });
  // frost on the eyebrows + the red summit flag reflected in both eyes
  const r2 = rng(12); for (const ex of [-1, 1]) { for (let i = 0; i < 9; i++) { const u = r2(); circle(g, cx + ex * r * 0.34 + (u - 0.5) * r * 0.36, cy - r * 0.42 - r2() * 16, 3 + r2() * 4, alpha('#f4fbff', 0.9)); }
    const ex2 = cx + ex * r * 0.34 + 0.35 * r * 0.145 * 0.55, ey2 = cy - r * 0.04 - 0.45 * r * 0.2 * 0.5; seg(g, [[ex2 + 6, ey2 + 8], [ex2 + 6, ey2 - 12]], 2.5, '#2a2436'); poly(g, [[ex2 + 6, ey2 - 12], [ex2 + 20, ey2 - 9], [ex2 + 6, ey2 - 4]], '#ff5a48'); }
  g.restore();
  for (let i = 0; i < 18; i++) { const u = (t * 0.25 + i / 18) % 1; circle(g, (i * 211) % E.W + Math.sin(t + i) * 30, u * E.H, 2 + (i % 3), alpha('#ffffff', 0.6)); }       // drifting ice
  atmos(g, t, cam, { color: '#ffe8d0', far: 10, near: 4 });
} });
