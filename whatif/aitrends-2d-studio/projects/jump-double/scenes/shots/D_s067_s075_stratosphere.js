// D_s067_s075_stratosphere.js — batch D: day 16 above the jets, RULE 4, the pass-out face, the tank + helmet gags,
// days 17-18 above the balloons, the 41 km record balloon, blue to black.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, text, FONTS, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { stratosphere, breathFog, vision, skyFg } from '../sets/sky.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { ruleCard, chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { shotWord, gearBack, gearFront, riseJ, flyer, dayHUD, meterHUD, weatherBalloon } from './D_lib.js';

const SUN = { color: '#fff6e0', dir: [0.7, -0.7] };
const GEAR = { tank: true, mask: true, helmet: true };
// arm waving down at the jet (pose with the near hand low and forward)
const waveDown = (t) => { const w = Math.sin(t * 9) * 10; return { ...POSES.stand, head: [8, -206], eF: [30, -150], hF: [56 + w * 0.4, -128 + w], eB: [-8, -136], hB: [-12, -102], kF: [10, -52], fF: [12, -4], kB: [-8, -50], fB: [-14, -2] }; };

// s067 — "Day sixteen. Sixteen kilometres."  HERO rises into frame from below the deep-blue sky; DAY 15 -> 16, meter 16 km
registerShot('s067', { draw(g, t, info) {
  const st = info.shot.start, tDay = shotWord('day', st, 0.15), tKm = shotWord('sixteen', st, 1.07, 0.6);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-20, 20], y: [10, -10] });
  const Y = stratosphere(g, t, cam, { alt: 0.05 });
  const up = ease.out(prog(t, 0, 1.7)), yF = lerp(E.H + 560, E.H * 0.8, up), J = riseJ(t, 1 - up);
  layer(g, cam, 1, (g) => flyer(g, 'HERO', J, { x: E.W * 0.42, gy: yF, s: 1.95, facing: 1, shadow: false, t, rim: SUN, expr: exprAt(t, [[0, 'determined'], [tKm, 'joy']]), blink: blinkFlag(t, 3.3, 4), look: lookToward(0.3, -0.6) }));
  skyFg(g, t, cam, { alt: 0.05 }); atmos(g, t, cam, { color: '#ffffff', far: 14, near: 5 });
  dayHUD(g, t, [[0, 15], [tDay, 16]]);
  meterHUD(g, t, key(t, [[0, 9000], [tKm, 16000]], ease.out));
} });

// s068 — "You're higher than Everest, higher than passenger jets."  a jet + contrail slides below; Everest then JETS pass on the meter
registerShot('s068', { draw(g, t, info) {
  const st = info.shot.start, tEv = shotWord('everest', st, 0.83), tPass = shotWord('passenger', st, 2.01), tJets = shotWord('jets', st, 2.47);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-60, 40], y: [30, 40] });
  const Y = stratosphere(g, t, cam, { alt: 0.1, jet: prog(t, tPass - 1.3, tPass + 1.7) });
  const by = E.H * 0.6 + Math.sin(t * 1.2) * 10, pose = idle(t < tPass - 0.4 ? poseAt(t, [[0, 'relaxed'], [tEv, 'lookUp']], 0.3) : waveDown(t), t, 2);
  layer(g, cam, 1, (g) => { const o = { x: E.W * 0.4, y: by, s: 1.95, facing: 1 };
    actor(g, 'HERO', { ...o, pose, t, rim: SUN, shadow: false, expr: exprAt(t, [[0, 'smirk'], [tEv, 'happy'], [tJets, 'joy']]), blink: blinkFlag(t, 3.4, 2), look: t > tPass - 0.6 ? lookToward(0.6, 0.8) : lookToward(0.5, -0.3) }); });
  skyFg(g, t, cam, { alt: 0.1 }); atmos(g, t, cam, { color: '#ffffff', far: 14, near: 5 });
  dayHUD(g, t, [[0, 16]]);
  meterHUD(g, t, key(t, [[0, 7000], [tEv, 8849], [tJets, 11000], [info.dur, 16000]]));
} });

// s069 — RULE 4 "THE SKY RUNS OUT OF AIR."  over the dimmed stratosphere; the whole card gasps (squash) on 'breathe'
registerShot('s069', { draw(g, t, info) {
  const st = info.shot.start, tBr = shotWord('breathe', st, 1.85), cam = camMove(t, info.dur, { z: [1.0, 1.04] });
  stratosphere(g, t, cam, { alt: 0.4 }); atmos(g, t, cam, { color: '#ffffff', far: 12, near: 4 });
  const u = t - tBr, gasp = u > 0 ? Math.sin(clamp(u / 0.5) * Math.PI) * Math.exp(-u * 1.5) : 0;
  g.save(); g.translate(E.W / 2, E.H * 0.6); g.scale(1 + 0.05 * gasp, 1 - 0.08 * gasp); g.translate(-E.W / 2, -E.H * 0.6);
  ruleCard(g, t, info, { n: 4, title: 'THE SKY RUNS OUT OF AIR.', bg: () => {} });
  g.restore();
} });

// s070 — GIANT FACE: "Up here, you'd pass out in seconds."  breath fog thins to nothing, eyes droop, pass-out vignette closes
registerShot('s070', { draw(g, t, info) {
  const st = info.shot.start, tPass = shotWord('pass', st, 0.8), tSec = shotWord('seconds', st, 1.55);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  blurLayer(g, 14, (g) => stratosphere(g, t, cam, { alt: 0.72 }), null, 1); veil(g, '#0a0a2a', 0.25);
  const beat = Math.max(0, Math.sin(t * Math.PI * 2 * 50 / 60)) ** 6, z = 1 + 0.015 * beat;
  const f = faceAt(t, [[0, 'worried'], [tPass, 'squint'], [tSec, 'shocked']], 0.2), droop = 0.55 * prog(t, tSec + 0.2, info.dur);
  const cx = E.W * 0.5, cy = E.H * 0.53, r = 330;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  giantFace(g, cx, cy, r, { who: 'HERO', f, rimSide: 1, rimColor: '#9ab8ff', glint: '#cfe0ff', blink: Math.max(blinkAmt(t, 3.0, 1), droop), breath: Math.sin(t * 1.4), tilt: lerp(0, 0.05, prog(t, tSec, info.dur)) });
  breathFog(g, cx + r * 0.32, cy + r * 0.5, t, 1 - prog(t, 0.1, tSec));
  g.restore();
  atmos(g, t, cam, { color: '#dfe8ff', far: 10, near: 3 });
  vision(g, 0.85 * ease.inOut(prog(t, tPass - 0.2, info.dur)));
} });

// backyard gag set-up (shared by s071/s072)
const yard = (g, t, cam) => roofs(g, t, cam, { view: 'houses', mood: 'day' });
const tankAt = (g, x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); rr(g, -46, -14, 92, 28, 13); g.fillStyle = '#9fc4d8'; g.fill(); g.strokeStyle = '#1a2430'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#d4262e'; g.fillRect(-14, -14, 9, 28); circle(g, 50, 0, 7, '#3a3a44'); g.restore(); };
const helmetAt = (g, x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#f4f1e8'; g.beginPath(); g.arc(0, 0, 31, Math.PI * 1.03, Math.PI * 1.97); g.closePath(); g.fill(); seg(g, [[-31, -1], [29, -1]], 4, '#2a2632'); text(g, 'DEV', 4, -14, { size: 14, color: '#f08a24', font: FONTS.title, weight: 700 }); g.restore(); };

// s071 — "Mina makes you wear a diving tank."  MINA heaves the tank onto HERO's back on 'tank'; he sags; mask already on his forehead
registerShot('s071', { draw(g, t, info) {
  const st = info.shot.start, tTank = shotWord('tank', st, 1.51), on = t >= tTank;
  const cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [-230, -200], y: [70, 74] });
  const R = yard(g, t, cam), GY = R.GY, CX = R.CX, hx = CX - 140, mx = CX - 420;
  layer(g, cam, 1, (g) => {
    const sag = on ? Math.exp(-(t - tTank) * 3) * Math.sin((t - tTank) * 14) * 0.3 + 0.7 : 0;
    const hp = idle(on ? poseAt(t - tTank, [[0, 'sad'], [0.5, { ...POSES.sad, head: [16, -186] }]], 0.15) : POSES.relaxed, t, 3), ho = { x: hx, y: GY + 20 + sag * 6, s: 1.95, facing: 1 };
    if (on) gearBack(g, ho, hp, { tank: true, sag });
    actor(g, 'HERO', { ...ho, pose: hp, t, rim: R.rim, expr: exprAt(t, [[0, 'neutral'], [tTank, 'surprised'], [tTank + 0.4, 'worried']]), blink: blinkFlag(t, 3.5, 7), look: on ? lookToward(-1, 0.3) : lookToward(-1, 0) });
    gearFront(g, ho, hp, { tank: on, mask: true });
    const lift = ease.inOut(prog(t, 0, tTank)), mp = idle(on ? reaction('delight', t, tTank + 0.1, 'holdFront') : { ...POSES.holdFront, hF: [36, lerp(-120, -170, lift)], hB: [30, lerp(-122, -172, lift)] }, t, 5);
    actor(g, 'MINA', { x: mx + lerp(0, 120, ease.inOut(prog(t, 0.2, tTank))), y: GY + 24, s: 2.05, facing: 1, pose: mp, t, rim: R.rim, expr: exprAt(t, [[0, 'determined'], [tTank + 0.2, 'smile']]), blink: blinkFlag(t, 2.9, 3), look: lookToward(1, -0.4) });
    if (!on) { const k = 2.05 * 0.72, mxx = mx + lerp(0, 120, ease.inOut(prog(t, 0.2, tTank))); tankAt(g, mxx + 36 * k, GY + 24 + lerp(-120, -170, lift) * k, -0.2 + 0.3 * lift); }
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: '#fff6dc', far: 16, near: 5 });
  chip(g, t, { str: 'Diving tank', at: tTank + 0.1, tone: 'blue', x: E.W * 0.62, y: E.H * 0.18 });
} });

// s072 — "Dev makes you wear a helmet with his name on it."  DEV plonks the helmet on; 'DEV' chip on 'name'; HERO deadpan in full gear
registerShot('s072', { draw(g, t, info) {
  const st = info.shot.start, tHel = shotWord('helmet', st, 1.01), tName = shotWord('name', st, 1.73), on = t >= tHel + 0.25;
  const cam = camMove(t, info.dur, { z: [1.32, 1.4], x: [-120, -90], y: [70, 76] });
  const R = yard(g, t, cam), GY = R.GY, CX = R.CX, hx = CX - 200, dx = CX + 130;
  layer(g, cam, 1, (g) => {
    const hp = idle(POSES.stand, t, 3), ho = { x: hx, y: GY + 20, s: 1.95, facing: 1 }, bonk = on ? Math.exp(-(t - tHel - 0.25) * 8) * 6 : 0;
    const hp2 = { ...hp, head: [hp.head[0], hp.head[1] + bonk] };
    gearBack(g, ho, hp2, { tank: true });
    actor(g, 'HERO', { ...ho, pose: hp2, t, rim: R.rim, expr: exprAt(t, [[0, 'neutral'], [tHel + 0.25, 'sleepy'], [tName + 0.3, 'neutral']]), blink: blinkFlag(t, 3.8, 1), look: lookToward(0.2, -0.2) });
    gearFront(g, ho, hp2, { tank: true, mask: true, helmet: on });
    const dp = idle(t < tHel + 0.3 ? poseAt(t, [[0, 'holdFront'], [tHel - 0.5, { ...POSES.reach, eF: [30, -200], hF: [52, -236] }]], 0.3) : reaction('delight', t, tName, 'relaxed'), t, 4);
    actor(g, 'DEV', { x: dx, y: GY + 18, s: 1.9, facing: -1, pose: dp, t, rim: R.rim, expr: exprAt(t, [[0, 'smirk'], [tHel + 0.3, 'joy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(-1, -0.2) });
    if (!on) { const k = prog(t, tHel - 0.25, tHel + 0.25), devH = [dx - lerp(46, 52, k) * 1.9, GY + 18 - lerp(150, 236, ease.out(prog(t, 0, tHel - 0.3))) * 1.9], headP = [hx + 1 * 1.95, GY + 20 - 211 * 1.95];
      helmetAt(g, lerp(devH[0], headP[0], ease.in(k)), lerp(devH[1] - 20, headP[1], ease.in(k)), 1.95); }
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: '#fff6dc', far: 16, near: 5 });
  chip(g, t, { str: 'DEV', at: tName, tone: 'gold', x: E.W * 0.36, y: E.H * 0.16 });
} });

// s073 — "On days seventeen and eighteen, you go higher than any balloon."  DAY 16 > 17 > 18; a weather balloon rises below; stars come out
registerShot('s073', { draw(g, t, info) {
  const st = info.shot.start, t17 = shotWord('seventeen', st, 1.05), t18 = shotWord('eighteen', st, 1.93), tBal = shotWord('balloon', st, 3.73);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [-40, 40], y: [0, -20] }), alt = lerp(0.3, 0.5, ease.inOut(t / info.dur));
  stratosphere(g, t, cam, { alt });
  const bk = ease.out(prog(t, tBal - 1.6, tBal + 0.4));
  layer(g, cam, 0.7, (g) => weatherBalloon(g, E.W * 0.66, lerp(E.H + 320, E.H * 0.62, bk), 1.25, t));
  const yF = E.H * 0.84 - 60 * ease.inOut(t / info.dur), J = riseJ(t, 0.35);
  layer(g, cam, 1, (g) => flyer(g, 'HERO', J, { x: E.W * 0.38, gy: yF, s: 1.95, facing: 1, shadow: false, t, rim: SUN, expr: exprAt(t, [[0, 'neutral'], [t17, 'smirk'], [tBal, 'surprised']]), blink: blinkFlag(t, 3.2, 6), look: t > tBal - 0.5 ? lookToward(0.7, 0.7) : lookToward(0.4, -0.5) }, GEAR));
  skyFg(g, t, cam, { alt }); atmos(g, t, cam, { color: '#ffffff', far: 12, near: 4 });
  dayHUD(g, t, [[0, 16], [t17, 17], [t18, 18]]);
  meterHUD(g, t, key(t, [[0, 16000], [t17, 20000], [t18, 32000], [info.dur, 36000]]));
} });

// s074 — "Higher than the highest skydive ever, forty-one kilometres up."  the record balloon + gold 41 km marker fade in; HERO rises past it
registerShot('s074', { draw(g, t, info) {
  const st = info.shot.start, tSky = shotWord('skydive', st, 1.13), t41 = shotWord('forty', st, 2.17);
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-20, 30] }), bk = ease.out(prog(t, t41 - 0.6, t41 + 0.3));
  const Y = stratosphere(g, t, cam, { alt: 0.55, balloon: bk });
  // a tiny skydiver standing on the gondola (depth 0.5, like the balloon)
  if (bk > 0) layer(g, cam, 0.5, (g) => { const bx = Y.pos.balloonX, by = Y.pos.balloonY + Math.sin(t * 0.6) * 8 + 330; g.save(); g.globalAlpha *= bk; circle(g, bx, by - 30, 5, '#141018'); seg(g, [[bx, by - 25], [bx, by - 10]], 4, '#141018'); seg(g, [[bx, by - 10], [bx - 4, by]], 3, '#141018'); seg(g, [[bx, by - 10], [bx + 4, by]], 3, '#141018'); seg(g, [[bx, by - 22], [bx + 8, by - 30]], 2.5, '#141018'); g.restore(); });
  const yF = lerp(E.H * 1.02, E.H * 0.42, ease.inOut(prog(t, 0, info.dur))), J = riseJ(t, 0.5);
  layer(g, cam, 1, (g) => flyer(g, 'HERO', J, { x: E.W * 0.34, gy: yF, s: 1.95, facing: 1, shadow: false, t, rim: SUN, expr: exprAt(t, [[0, 'determined'], [tSky, 'surprised'], [t41 + 0.4, 'awe']]), blink: blinkFlag(t, 3.6, 2), look: t > t41 - 0.3 ? lookToward(1, 0.3) : lookToward(0.3, -0.6) }, GEAR));
  atmos(g, t, cam, { color: '#ffffff', far: 12, near: 4 });
  dayHUD(g, t, [[0, 18]]);
  meterHUD(g, t, key(t, [[0, 30000], [t41, 41000], [info.dur, 45000]]));
} });

// s075 — "The sky above you turns from blue to black."  looking up past the hero: alt 0.55 -> 1, stars pop in, Earth-blue rim from below
registerShot('s075', { draw(g, t, info) {
  const st = info.shot.start, tBlue = shotWord('blue', st, 1.64), tBlack = shotWord('black', st, 2.12);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-1000, -1120] }), alt = key(t, [[0, 0.55], [tBlue, 0.62], [tBlack + 0.4, 1]], ease.inOut);
  stratosphere(g, t, cam, { alt, curve: 0.3 });
  const r = rng(41); for (let i = 0; i < 24; i++) { const at = tBlue + r() * 1.4, x = r() * E.W, y = r() * E.H * 0.6, p = ease.outBack(prog(t, at, at + 0.25)); if (p > 0.02) FX.sparkle(g, x, y, (6 + r() * 10) * p, '#ffffff', 0.85); }
  const pose = idle({ ...EXTRA.handsUp, head: [-2, -214] }, t * 0.7, 4);
  layer(g, cam, 1, (g) => { const o = { x: E.W * 0.5, y: E.H * 1.18 + cam.y, s: 3.0, facing: 1, rot: -0.05 + Math.sin(t * 0.6) * 0.02 };
    gearBack(g, o, pose, GEAR); actor(g, 'HERO', { ...o, pose, t, shadow: false, rim: { color: '#7fc0ff', dir: [0, 1] }, expr: exprAt(t, [[0, 'awe'], [tBlack, 'surprised']]), blink: blinkFlag(t, 3.4, 3), look: lookToward(0, -1) }); gearFront(g, o, pose, GEAR); });
  atmos(g, t, cam, { color: '#dfe8ff', far: 10, near: 3 });
  meterHUD(g, t, key(t, [[0, 45000], [info.dur, 60000]]));
} });
