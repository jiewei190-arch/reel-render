// DEMO_park.js — sheet-check shots for sets/park.js (temporary ids, not in the real shot list).
//   demo_park_spring  dawn, spring blossom, km 1: HERO jogs along the river (tracking pan), MINA rides beside him on her bike
//   demo_park_autumn  dusk, autumn + rain, km 6: HERO trudging through puddles, lamps on, leaves falling
//   demo_park_winter  day, winter + snow, km 9: the route board "10 km (6.2 mi)", HERO jogging, breath puffs, frozen fountain
//   demo_park_finish  summer day, DAY 1,095: DEV holds the toilet-paper finish line, HERO bursts through it, MINA rings her bell
import { E, registerShot, layer, ease, prog, clamp, lerp, circle, alpha } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { park, parkFg, bike, finishLine } from '../sets/park.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';

// jog: the walk cycle with a forward lean, higher knees and bent arms
const jog = (x, s, f = 1) => { const p = walkAlong(x * 0.8, s, { facing: f }).pose, b = Math.abs(Math.sin(x / (104 * s) * Math.PI * 1.6)) * 8; const sh = (q) => [q[0] + 8, q[1] - b]; return { ...p, head: sh(p.head), sh: sh(p.sh), eF: [p.eF[0] + 10, p.eF[1] - 14 - b], hF: [p.hF[0] + 26, p.hF[1] - 40 - b], eB: [p.eB[0] - 6, p.eB[1] - 14 - b], hB: [p.hB[0] + 14, p.hB[1] - 40 - b], hip: [p.hip[0], p.hip[1] - b] }; };
const puffs = (g, t, x, y, a = 1) => { for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1; circle(g, x + 20 + u * 60, y - u * 30, 10 + u * 22, alpha('#ffffff', 0.35 * a * (1 - u))); } };

registerShot('demo_park_spring', { draw(g, t, info) {
  const hx = E.W / 2 + t * 330, cam = { z: 0.92, x: t * 330 - 80 + Math.sin(t * 0.6) * 8, y: -120 + Math.cos(t * 0.5) * 4 };
  const P = park(g, t, cam, { season: 'spring', mood: 'dawn', km: 1 });
  layer(g, cam, 1, (g) => {
    bike(g, t, { x: hx - 330, gy: P.GY + 50, s: 2.0, facing: 1, expr: exprAt(t, [[0, 'smile'], [2.4, 'happy']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(1, -0.3), rim: P.rim, wave: t > 2.4 && t < 3.6 });
    actor(g, 'HERO', { x: hx, y: P.GY + 10, s: 1.9, facing: 1, pose: jog(hx, 1.9), expr: exprAt(t, [[0, 'determined'], [2.6, 'smile']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), rim: P.rim, t });
  });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: P.M.key });
} });

registerShot('demo_park_autumn', { draw(g, t, info) {
  const hx = E.W / 2 + t * 120, cam = { z: 1.0, x: t * 120 + 120 + Math.sin(t * 0.6) * 8, y: -110 };
  const P = park(g, t, cam, { season: 'autumn', mood: 'dusk', rain: 0.7, km: 6 });
  layer(g, cam, 1, (g) => {
    const p = walkAlong(hx, 1.9, { facing: 1 }).pose, sag = { ...p, head: [p.head[0] + 14, p.head[1] + 12], sh: [p.sh[0] + 8, p.sh[1] + 8] };
    actor(g, 'HERO', { x: hx, y: P.GY + 30, s: 1.9, facing: 1, pose: sag, expr: exprAt(t, [[0, 'sad'], [2.5, 'determined']]), blink: blinkFlag(t, 3.0, 3), look: lookToward(1, 0.5), rim: P.rim, t });
  });
  parkFg(g, t, cam, { season: 'autumn', rain: 0.7 }); atmos(g, t, cam, { color: P.M.key });
} });

registerShot('demo_park_winter', { draw(g, t, info) {
  const hx = E.W / 2 - 900 + t * 300, cam = camMove(t, info.dur, { z: [0.9, 0.94], x: [-900, -620], y: [-130, -140] });
  const P = park(g, t, cam, { season: 'winter', mood: 'day', snow: 0.7, km: 9, sign: true });
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: hx, y: P.GY + 10, s: 1.9, facing: 1, pose: jog(hx, 1.9), expr: exprAt(t, [[0, 'squint'], [2.2, 'determined']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), rim: P.rim, t });
    const head = jog(hx, 1.9).head; puffs(g, t, hx + head[0] * 1.9, P.GY + 10 + head[1] * 1.9 + 20);
  });
  parkFg(g, t, cam, { season: 'winter', snow: 0.7 }); atmos(g, t, cam, { color: '#f4f8ff' });
} });

registerShot('demo_park_finish', { draw(g, t, info) {
  const tBreak = 2.6, cam = camMove(t, info.dur, { z: [0.96, 1.02], x: [-120, 40], y: [-120, -130] });
  const P = park(g, t, cam, { season: 'summer', mood: 'day', km: 10, fountain: false });
  const fx = P.pos.finishX, hx = lerp(fx - 1100, fx + 500, t / info.dur), tape = ease.out(prog(t, tBreak, tBreak + 0.6));
  layer(g, cam, 1, (g) => {
    // DEV holds one end, the roll is taped to a bin-post at the other
    seg2(g, fx + 230, P.GY - 30);
    actor(g, 'DEV', { x: fx - 300, y: P.GY + 30, s: 1.85, facing: 1, pose: idle({ ...POSES.stand, eF: [24, -150], hF: [46, -160] }, t, 2), expr: exprAt(t, [[0, 'smile'], [tBreak, 'joy']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, 0), rim: P.rim, t });
    actor(g, 'HERO', { x: hx, y: P.GY + 40, s: 1.9, facing: 1, pose: t > tBreak ? { ...jog(hx, 1.9), eF: [20, -230], hF: [34, -290], eB: [-14, -230], hB: [-24, -290] } : jog(hx, 1.9), expr: exprAt(t, [[0, 'determined'], [tBreak, 'joy']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), rim: P.rim, t });
    finishLine(g, t, { a: [fx - 300 + 46 * 1.85, P.GY + 30 - 160 * 1.85], b: [fx + 230, P.GY - 250], tape, roll: 'b', sag: 40 });
    bike(g, t, { x: hx - 360, gy: P.GY + 70, s: 2.0, facing: 1, expr: t > tBreak ? 'joy' : 'smile', blink: blinkFlag(t, 2.9, 1), rim: P.rim, bell: prog(t, tBreak, tBreak + 0.6) });
  });
  parkFg(g, t, cam, { season: 'summer' }); atmos(g, t, cam, { color: P.M.key });
} });
// the far post the roll is taped to
function seg2(g, x, gy) { g.fillStyle = '#c8a070'; g.fillRect(x - 6, gy - 240, 12, 240); circle(g, x, gy - 244, 9, '#d8b080'); }
