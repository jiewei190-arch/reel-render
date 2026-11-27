// DEMO_home3.js — H4 stage A demo shots for sets/home3.js (temporary ids, sheet-check only; not bound to the voice).
//   demo_bathroom  dawn: HERO at the mirror turns and finds the hair clump in the shower drain (push in, shocked)
//   demo_kitchen   day: HERO at the table, the 700 kcal tag pops; he glances up at the cereal hidden on the fridge (sparkle)
//   demo_bedroom   dawn: the 5:30 alarm rings, HERO stretches on the mat, a new red X lands on the wall calendar
//   demo_hairlog   insert: Mina's HAIR LOG writes itself on, the tape measure pulls out
//   demo_timeskip  the time-skip card flips WEEK 1 > MONTH 3 > YEAR 2 > DAY 1,095 over the dimmed bedroom
//   demo_film      DEV films on his phone (REC, timer); then the full-frame viewfinder
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { home3, home3Fg, hairLog, tapeMeasure, timeSkip, filmPhone, filmFrame } from '../sets/home3.js';

registerShot('demo_bathroom', { draw(g, t, info) {
  const tTurn = 1.6, cam = camMove(t, info.dur, { z: [1.18, 1.4], x: [-80, 220], y: [70, 150] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'dawn', hair: 1, steam: 0.3 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.CX - 150, y: H.GY + 10, s: 1.95, facing: t < tTurn ? -1 : 1, pose: idle(t < tTurn ? POSES.relaxed : reaction('shock', t, tTurn + 0.3, 'relaxed'), t, 2), expr: exprAt(t, [[0, 'sleepy'], [tTurn, 'neutral'], [tTurn + 0.3, 'shocked']]), blink: blinkFlag(t, 3.2, 2), look: t < tTurn ? lookToward(-1, -0.2) : lookToward(1, 0.6), rim: H.rim, t }));
  home3Fg(g, t, cam, { room: 'bathroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
} });

registerShot('demo_kitchen', { draw(g, t, info) {
  const tUp = 2.6, cam = camMove(t, info.dur, { z: [1.12, 1.17], x: [60, 120], y: [-70, -80] });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', kcal: prog(t, 0.6, 1.0) });
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: H.pos.tableX - 360, y: H.GY + 6, s: 1.9, facing: 1, pose: idle({ ...POSES.sit, hF: [44, -110] }, t, 2), expr: exprAt(t, [[0, 'happy'], [tUp, 'suspicious']]), blink: blinkFlag(t, 3.0, 2), look: t > tUp - 0.2 ? lookToward(0.8, -0.6) : lookToward(1, 0.3), rim: H.rim, t });
    const sp = prog(t, tUp + 0.1, tUp + 0.8); if (sp > 0) FX.sparkle(g, H.pos.cerealX + 40, H.pos.fridgeTop - 120, 28 * Math.sin(sp * Math.PI), '#ffe8b0', 0.95);
  });
  home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
} });

registerShot('demo_bedroom', { draw(g, t, info) {
  const tUp = 1.4, tX = 3.0, cam = camMove(t, info.dur, { z: [1.1, 1.18], x: [-40, 40], y: [0, 10] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: t < tX ? 12 : 13, month: 'MARCH', ring: t < tUp ? 1 : 0, hl: t >= tX ? 13 : 0 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.pos.matX - 40, y: H.GY + 30, s: 1.95, facing: 1, pose: idle(poseAt(t, [[0, 'relaxed'], [tUp, 'cheer'], [tUp + 1.0, EXTRA.handsUp], [tX, 'point']], 0.35), t, 3), expr: exprAt(t, [[0, 'sleepy'], [tUp, 'determined'], [tX, 'smile']]), blink: blinkFlag(t, 3.4, 4), look: t > tX - 0.2 ? lookToward(0, -1) : lookToward(-1, 0), rim: H.rim, t }));
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
} });

registerShot('demo_hairlog', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] });
  blurLayer(g, 14, (g) => home3(g, t, cam, { room: 'bedroom', mood: 'day' }), null, 1); veil(g, '#1a1020', 0.35);
  hairLog(g, t, { x: E.W * 0.5, y: E.H * 0.5, s: lerp(1.2, 1.26, t / info.dur), reveal: prog(t, 0.3, info.dur - 0.5) });
  tapeMeasure(g, E.W * 0.12, E.H * 0.86, E.W * 0.6, { s: 1, ext: ease.out(prog(t, 0.2, 1.6)), rot: -0.03 });
  atmos(g, t, cam, { color: '#fff4dc', far: 10, near: 3 });
} });

registerShot('demo_timeskip', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.1] });
  blurLayer(g, 10, (g) => home3(g, t, cam, { room: 'bedroom', mood: t < 2.4 ? 'dawn' : 'night', marks: 31 }), null, 1); veil(g, '#0a0812', 0.45);
  timeSkip(g, t, { x: E.W * 0.5, y: E.H * 0.24, s: 1.05, keys: [[0.1, 'WEEK 1'], [1.3, 'MONTH 3'], [2.5, 'YEAR 2'], [3.7, 'DAY 1,095', 'THREE YEARS']] });
  atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
} });

registerShot('demo_film', { draw(g, t, info) {
  const tFull = 2.8, cam = camMove(t, info.dur, { z: [1.2, 1.26], x: [-300, -260], y: [30, 30] });
  if (t < tFull) {
    const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 20 });
    layer(g, cam, 1, (g) => {
      actor(g, 'HERO', { x: H.pos.matX - 60, y: H.GY + 30, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'crouch'], [0.8, 'stand'], [1.6, 'crouch'], [2.4, 'stand']], 0.35), t, 2), expr: 'determined', blink: blinkFlag(t, 3, 2), rim: H.rim, t });
      actor(g, 'DEV', { x: H.pos.matL - 520, y: H.GY + 20, s: 1.9, facing: 1, pose: idle(POSES.holdFront, t, 3), expr: exprAt(t, [[0, 'smirk'], [1.6, 'joy']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0), rim: H.rim, t });
    });
    filmPhone(g, t, { x: E.W * 0.5, y: E.H * 0.25, s: 0.72, rot: -0.04, at: 0.3, sec0: 12 }, (g) => { const H2 = home3(g, t, { z: 1.5, x: 120, y: 60 }, { room: 'bedroom', mood: 'day', marks: 20 }); layer(g, { z: 1.5, x: 120, y: 60 }, 1, (g) => actor(g, 'HERO', { x: H2.pos.matX - 60, y: H2.GY + 30, s: 1.9, facing: -1, pose: poseAt(t, [[0, 'crouch'], [0.8, 'stand'], [1.6, 'crouch'], [2.4, 'stand']], 0.35), expr: 'determined', rim: H2.rim, t })); });
  } else {
    const c2 = { z: 1.6, x: 140, y: 80 + Math.sin(t * 2) * 6 }, H = home3(g, t, c2, { room: 'bedroom', mood: 'day', marks: 20 });
    layer(g, c2, 1, (g) => actor(g, 'HERO', { x: H.pos.matX - 60, y: H.GY + 30, s: 1.9, facing: -1, pose: idle(poseAt(t, [[2.8, 'stand'], [3.4, 'crouch'], [4.2, 'stand']], 0.35), t, 2), expr: exprAt(t, [[0, 'determined'], [3.9, 'smile']]), blink: blinkFlag(t, 3, 2), look: lookToward(-1, 0), rim: H.rim, t }));
    filmFrame(g, t, { at: 0.3, sec0: 12, focusX: 0.42, focusY: 0.42 });
  }
  atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
} });
