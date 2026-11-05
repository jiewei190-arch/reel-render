// DEMO_stopprops.js — sheet-check of sets/stopprops.js (temporary ids demo_sp_*, not bound to the voice). 16:9.
//   demo_sp_juice    breakfast table: the juice glass falls off the edge, splashes, Mina's socks go orange; Mina's stopwatch
//   demo_sp_clock    the kitchen clock: the second hand sticks for 1.4 s, then ticks on (chronostasis)
//   demo_sp_watch    the oven clock vs the hero's chunky black watch: '+40 s'
//   demo_sp_rescue   the milk jug tips, Mina's volcano slides away, the mixing bowl catches every drop
//   demo_sp_bin      Biscuit lands in the bin; butter + toast on the table; Dev filming
import { E, registerShot, layer, ease, prog, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove } from '../sets/acting.js';
import { home3 } from '../sets/home3.js';
import { stopwatch, swSec, wallClock, stickSec, ovenClock, heroWatch, timeDiff, clockStr, juiceGlass, juiceArc, juiceSplash, socks, milkJug, milkPour, mixingBowl, schoolProject, bin, butterDish, toast, devCam } from '../sets/stopprops.js';

const kitchen = (g, t, cam) => home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 });

registerShot('demo_sp_juice', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.35, 1.4] }), x: 260, y: 120 }, H = kitchen(g, t, cam), P = H.pos, GY = H.GY ?? E.H * 0.8;
  const A = juiceArc(t, { from: [P.tableX + 240, P.tableTop - 4], to: [P.tableX + 420, GY - 10], at: 0.8, dur: 0.6, h: 40 });
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.tableX + 560, y: GY, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [0.7, 'shock']]), t, 2), expr: exprAt(t, [[0, 'happy'], [0.8, 'shocked']]), blink: blinkFlag(t, 3, 1), look: lookToward(-1, 0.6), t });
    socks(g, P.tableX + 640, GY + 40, 0.45, { stain: prog(t, 1.45, 1.9) });
    butterDish(g, P.tableX - 120, P.tableTop - 4, 0.7); toast(g, P.tableX + 20, P.tableTop - 30, 0.5, { butter: 1, rot: 0.2 });
    if (!A.done) juiceGlass(g, A.x, A.y, 0.9, { rot: A.rot, fill: 0.75 }); else juiceGlass(g, P.tableX + 470, GY - 2, 0.9, { rot: 1.57, fill: 0 });
    juiceSplash(g, t, 1.4, P.tableX + 420, GY + 10, { s: 1 });
  });
  stopwatch(g, t, { x: E.W * 0.17, y: E.H * 0.3, s: 1.1, sec: swSec(t, { start: 0.4, stop: 2.6 }), running: t > 0.4 && t < 2.6, label: "MINA'S" });
} });

registerShot('demo_sp_clock', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] }); kitchen(g, t, { z: 1.25, x: 250, y: -260 });
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, E.W, E.H);
  const sec = stickSec(t, { at: 0.6, sec0: 12, hold: 1.4 }), stuck = t > 0.6 && t < 2.0 ? 1 : 0;
  wallClock(g, t, { x: E.W / 2, y: E.H / 2, r: 360, h: 7.7, sec, stick: stuck });
} });

registerShot('demo_sp_watch', { draw(g, t, info) {
  kitchen(g, t, { z: 1.2, x: 0, y: -80 }); g.fillStyle = 'rgba(10,8,20,.35)'; g.fillRect(0, 0, E.W, E.H);
  const s0 = 18 * 3600 + 42 * 60;
  ovenClock(g, E.W * 0.3, E.H * 0.55, 1.0, { time: clockStr(s0 + t) });
  heroWatch(g, E.W * 0.72, E.H * 0.52, 0.9, { time: clockStr(s0 + 40 + t) });
  timeDiff(g, t, 1.0, E.W * 0.51, E.H * 0.22, { str: '+40 s' });
} });

registerShot('demo_sp_rescue', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.4, 1.45] }), x: 330, y: 150 }, H = kitchen(g, t, cam), P = H.pos, GY = H.GY ?? E.H * 0.8;
  const tip = ease.inOut(prog(t, 0.3, 1.0)), slide = ease.inOut(prog(t, 0.2, 1.2)), pour = prog(t, 1.0, 2.2);
  layer(g, cam, 1, (g) => {
    schoolProject(g, t, lerp(P.tableX + 320, P.tableX + 900, slide), GY - 10, 0.6);
    mixingBowl(g, P.tableX + 320, GY - 120, 0.85, { fill: pour, splash: prog(t, 1.2, 1.8) });
    const sp = milkJug(g, P.tableX + 200, P.tableTop - 4, 0.85, { rot: tip * 1.6, level: 0.8 - pour * 0.6 });
    if (pour > 0) milkPour(g, t, { from: sp, to: [P.tableX + 320, GY - 120], k: 1 });
  });
} });

registerShot('demo_sp_bin', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.3, 1.34] }), x: 260, y: 120 }, H = kitchen(g, t, cam), P = H.pos, GY = H.GY ?? E.H * 0.8;
  layer(g, cam, 1, (g) => {
    butterDish(g, P.tableX - 100, P.tableTop - 4, 0.8, { bite: 0.4 }); toast(g, P.tableX + 120, P.tableTop - 40, 0.6, { bite: prog(t, 0.5, 2.5), butter: 1, rot: -0.15 });
    bin(g, P.tableX + 700, GY + 10, 0.8, { lid: 0.7, wobble: 1 - prog(t, 0, 1), cat: ease.out(prog(t, 0.6, 1.2)), t });
  });
  devCam(g, t, { x: E.W * 0.26, y: E.H * 0.32, s: 0.55, rot: -0.05, at: 0, sec0: 41, caption: 'BIN CAT', capAt: 1.0 }, (g, w, h) => kitchen(g, t, { z: 1.4, x: 500, y: 100 }));
} });
