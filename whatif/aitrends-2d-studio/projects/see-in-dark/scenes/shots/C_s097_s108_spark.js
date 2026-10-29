// C_s097_s108_spark.js — batch C, shots s097-s108: the decision (run blind or wait), torch off, sixty seconds in the dark,
// the grey thermal view returning, the tiny white spark (PAYOFF), the reunion under the ledge, Dev cheering, "best twin ever".
import { E, V, S, mix, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, circle, ring, rr, text, FONTS, rng, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor } from '../sets/actors.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { thermalView, heatActor, heatBlob, heatRect, whiteOut } from '../sets/thermal.js';
import { chip, darkness } from '../sets/hud.js';
import { HERO, MINA } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;
const scr = (cam, x, y) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z || 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z || 1) + E.H / 2];
const WARM = { color: '#ffcf8a', dir: [-1, -0.5] };
// the twin hand warmer: a little brick with a warm glow
function warmer(g, x, y, s = 1, t = 0, hot = 1) { g.save(); g.translate(x, y); g.scale(s, s); glow(g, 0, 0, 70, '#ffb24a', 0.45 * hot * (0.9 + 0.1 * Math.sin(t * 6))); rr(g, -16, -10, 32, 20, 5); g.fillStyle = '#e4ddd0'; g.fill(); g.fillStyle = '#d4262e'; g.fillRect(-16, -3, 32, 6); circle(g, 0, 0, 4, '#fff2c8'); g.restore(); }

// s097 — "Mina is cold, and you are blind. Run in blind..."  HERO, DEV, TOMAS in a tight worried line facing the cave
registerShot('s097', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.12 * k, x: lerp(-260, -160, k), y: 30 };
  const tBlind = wt('blind', info, 1.6), tRun = wt('run', info, 2.4);
  const F = forest(g, t, cam, { view: 'cave', rain: true });
  layer(g, cam, 1, (g) => {
    const x0 = F.CX - 640; FX.pool(g, x0 + 60, F.GY + 12, 260, 30, '#ffcf7a', 0.18);
    actor(g, 'TOMAS', { x: x0 - 130, y: F.GY, s: 1.2, facing: 1, pose: breathe(POSES.crossArms, t, 1, 1), expr: 'worried', rim: F.rim, t });
    actor(g, 'DEV', { x: x0, y: F.GY, s: 1.2, facing: 1, pose: breathe(posesAt(t, [[0, 'relaxed'], [tRun - 0.2, 'think']]), t, 1, 2), expr: 'nervous', rim: F.rim, t });
    // HERO blinks hard (blind), takes half a step toward the cave on "run"
    const step = ease.inOut(prog(t, tRun, tRun + 0.9)) * 40;
    actor(g, 'HERO', { x: x0 + 140 + step, y: F.GY, s: 1.2, facing: 1, pose: breathe(posesAt(t, [[0, 'stand'], [tRun, 'ready']]), t, 1, 3), expr: t > tBlind ? 'determined' : 'worried', blink: t > tBlind && t < tBlind + 0.5, rim: F.rim, t });
  });
  forestFg(g, t, cam);
  darkness(g, 0.35, { x: E.W * 0.4, y: E.H * 0.55, r: E.W * 0.7 });
} });

// s098 — "or wait in the dark? Lights out, you croak. Everybody."  big line over the blurred forest
registerShot('s098', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.06 * k, x: lerp(-60, 60, k) }, tLights = wt('lights', info, 1.6), tEvery = wt('everybody', info, 2.9);
  blurLayer(g, 16, (g) => forest(g, t, cam, { view: 'cave', rain: true }));
  veil(g, '#03040c', 0.5);
  g.save(); const pulse = 1 + 0.02 * Math.sin(t * 4); g.translate(E.W / 2, E.H * 0.42); g.scale(pulse, pulse); g.translate(-E.W / 2, -E.H * 0.42);
  UI.bigLine(g, t, { str: 'RUN BLIND... OR WAIT?', dur: info.dur - 0.05, y: E.H * 0.42, size: 96 }); g.restore();
  chip(g, t, { str: '"Lights out. Everybody."', at: tLights, x: E.W * 0.5, y: E.H * 0.68, tone: 'gold' });
  FX.rain(g, t, { count: 140, angle: 0.18, a: 0.22, seed: 51 });
} });

// s099 — "Tomas clicks off his torch."  the beam snaps out, the forest drops back to blue-black
registerShot('s099', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.35 + 0.08 * k, x: lerp(-420, -360, k), y: 70 }, tOff = wt('off', info, 1.2);
  const on = t < tOff ? 1 : 1 - ease.out(prog(t, tOff, tOff + 0.12));
  const F = forest(g, t, cam, { view: 'cave', rain: true, torch: on, torchX: E.W / 2 - 610, torchAngle: 0.05 + Math.sin(t * 2) * 0.03 });
  layer(g, cam, 1, (g) => {
    actor(g, 'TOMAS', { x: F.CX - 680, y: F.GY, s: 1.35, facing: 1, pose: posesAt(t, [[0, 'point'], [tOff + 0.2, 'relaxed']], 0.3), expr: t < tOff ? 'determined' : 'worried', rim: { color: on > 0.3 ? '#fff2d0' : F.M.rim, dir: [1, -0.3] }, t });
    actor(g, 'HERO', { x: F.CX - 360, y: F.GY, s: 1.35, facing: -1, pose: breathe(POSES.stand, t, 1, 3), expr: 'determined', blink: true, rim: F.rim, t });
  });
  forestFg(g, t, cam);
  if (t > tOff) veil(g, '#020414', 0.35 * ease.out(prog(t, tOff, tOff + 0.3)));            // the forest drops to blue-black
  if (Math.abs(t - tOff) < 0.08) whiteOut(g, 0.15);                                           // the click
} });

// s100 — "You count sixty seconds in the dark."  a 60-second countdown ring on near-black, tiny rain
registerShot('s100', { draw(g, t, info) {
  const k = t / info.dur, ui = S().ui, tSixty = wt('sixty', info, 0.6);
  g.fillStyle = '#020309'; g.fillRect(0, 0, E.W, E.H);
  FX.rain(g, t, { count: 90, angle: 0.18, a: 0.12, seed: 61 });
  const cx = E.W / 2, cy = E.H * 0.46, r = 190, sc = 1 + 0.06 * ease.inOut(k), left = Math.max(0, Math.round(60 - 60 * ease.in(prog(t, tSixty, info.dur + 0.3))));
  g.save(); g.translate(cx, cy); g.scale(sc, sc);
  ring(g, 0, 0, r, 14, alpha(ui.gold, 0.15)); g.strokeStyle = ui.gold; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (left / 60)); g.stroke();
  glow(g, 0, 0, r * 1.4, ui.gold, 0.08);
  for (let i = 0; i < 60; i++) { const a = -Math.PI / 2 + i / 60 * Math.PI * 2, l = i % 5 ? 10 : 22; g.strokeStyle = alpha(ui.cream, i < left ? 0.5 : 0.12); g.lineWidth = 3; g.beginPath(); g.moveTo(Math.cos(a) * (r + 24), Math.sin(a) * (r + 24)); g.lineTo(Math.cos(a) * (r + 24 + l), Math.sin(a) * (r + 24 + l)); g.stroke(); }
  text(g, String(left), 0, 6, { size: 150, color: ui.cream, glow: 30, glowColor: alpha(ui.gold, 0.6) });
  g.restore();
  chip(g, t, { str: 'Sixty seconds', at: tSixty, x: E.W / 2, y: E.H * 0.85, tone: 'gold' });
} });

// s101 — THERMAL wide: "Then it comes back. Grey rock. Grey rain."  the view slowly returns, everything the same flat grey
registerShot('s101', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.08 * k, x: lerp(-80, 120, k) }, back = ease.inOut(prog(t, 0.2, 1.6));
  const tRock = wt('rock', info, 1.6), tRain = wt('rain', info, 2.6);
  thermalView(g, t, {
    coldGain: 0.9, coldMax: 0.4, noise: 0.05,
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => { heatActor(c, 'MINA', { x: E.W / 2 + 140, y: forestGround() - 150, s: 0.9, facing: -1, pose: POSES.crouch, t, heat: 0.33, halo: false }); }),
    hud: { label: 'THERMAL  RESTORING', temp: '--', scale: true },
  });
  veil(g, '#808080', 0.9, 'saturation');                                                       // flat grey: no colour left anywhere
  FX.rain(g, t, { count: 180, angle: 0.18, color: '#9a9aa4', a: 0.35, seed: 71 });
  veil(g, '#000', 1 - back);                                                                   // the view comes back out of black
  chip(g, t, { str: 'Grey rock', at: tRock, x: E.W * 0.34, y: E.H * 0.85, tone: 'blue', dur: tRain - 0.05 });
  chip(g, t, { str: 'Grey rain', at: tRain, x: E.W * 0.64, y: E.H * 0.85, tone: 'blue' });
} });

// s102 — THERMAL insert: "And one tiny white spark, as a small hand pulls it from a coat."  PAYOFF
registerShot('s102', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), tSpark = wt('spark', info, 1.2), tPull = wt('pulls', info, 2.4);
  const cam = { z: 2.1 + 0.25 * k, x: lerp(-60, 0, k), y: 120 };
  const pull = ease.inOut(prog(t, tPull - 0.3, tPull + 0.9)), cx = E.W / 2, GY = forestGround();
  const hx = cx + lerp(-30, 70, pull), hy = GY - 110 - pull * 60, sparkOn = ease.out(prog(t, tSpark - 0.4, tSpark + 0.2));
  thermalView(g, t, {
    coldGain: 0.9, coldMax: 0.4, halo: 22, haloGain: 0.5,
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatBlob(c, cx - 80, GY - 90, 150, 110, 0.34, 0.8);                                      // the cool coat
      heatBlob(c, hx - 20, hy + 10, 40, 22, 0.46, 0.6);                                        // the small hand
      heatRect(c, hx - 8, hy - 7, 16, 11, 1.0 * sparkOn, 3); heatBlob(c, hx, hy - 2, 22, 18, 0.9 * sparkOn, 0.4);   // the white-hot spark
    }),
    hud: { label: 'THERMAL', temp: sparkOn > 0.5 ? '54 C  !!' : '--', track: scr(cam, hx, hy) },
  });
  // everything but the spark goes grey
  veil(g, '#808080', 0.85 * (1 - 0.4 * sparkOn), 'saturation');
  const [sx, sy] = scr(cam, hx, hy); glow(g, sx, sy, 160, '#ffffff', 0.55 * sparkOn); FX.sparkle(g, sx, sy, 60 * sparkOn, '#ffffff', 0.9 * sparkOn);
  FX.rain(g, t, { count: 120, angle: 0.18, color: '#9a9aa4', a: 0.3, seed: 72 });
  chip(g, t, { str: 'One tiny white spark', at: tSpark, x: E.W * 0.5, y: E.H * 0.86, tone: 'gold' });
} });

// s103 — "Mina's hand warmer. The twin."  giant face: realisation, awe, tears of relief, the spark reflected in the eyes
registerShot('s103', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sc = 1.0 + 0.1 * k, tTwin = wt('twin', info, 2.0);
  g.fillStyle = '#030410'; g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.5, E.H * 1.05, 900, '#ffb24a', 0.18);
  const cx = E.W / 2, cy = E.H * 0.55, r = 300;
  g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  bigFace(g, cx, cy + Math.sin(t * 1.2) * 3, r, { outfit: HERO, expr: 'awe', face: t > tTwin - 0.3 ? { mouth: 'smile', tears: true } : { tears: t > 0.8 }, rimColor: '#ffd9a0', rimSide: 1 });
  for (const dx of [-0.34, 0.34]) { const ex = cx + dx * r, ey = cy - r * 0.1; glow(g, ex + r * 0.04, ey - r * 0.03, 34, '#ffffff', 0.85); circle(g, ex + r * 0.04, ey - r * 0.03, 6, '#ffffff'); }   // the spark in both eyes
  g.restore();
  FX.drops(g, t * 0.6, { count: 12, a: 0.35, seed: 9 });
  chip(g, t, { str: 'The twin hand warmer', at: tTwin - 0.2, x: E.W * 0.5, y: E.H * 0.9, tone: 'gold' });
} });

// s104 — "You reach her, curled under a rock ledge."  HERO crouches under the ledge to MINA; embrace
registerShot('s104', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.5 + 0.12 * k, x: lerp(40, 160, k), y: 80 }, tReach = wt('reach', info, 0.4), tCurl = wt('curled', info, 1.0);
  const F = forest(g, t, cam, { view: 'cave', rain: true });
  const mx = F.pos.ledgeX + 80, gy = F.GY;
  layer(g, cam, 1, (g) => {
    glow(g, mx, gy - 60, 220, '#ffb24a', 0.25 + 0.05 * Math.sin(t * 5));                       // the hand warmer's glow lights them
    actor(g, 'MINA', { x: mx, y: gy, s: 1.25, facing: -1, pose: breathe(POSES.crouch, t, 0.6, 4), expr: t > tCurl + 0.8 ? 'smile' : 'sleepy', rim: WARM, t });
    warmer(g, mx - 26, gy - 66, 0.9, t);
    const app = ease.inOut(prog(t, 0, tCurl + 0.6));
    const hp = t < tCurl + 0.6 ? walkPose(t * Math.PI * 2 * 0.8, { stride: 16 }) : posesAt(t - tCurl - 0.6, [[0, 'kneel'], [0.5, 'reach'], [1.2, 'holdFront']], 0.3);
    actor(g, 'HERO', { x: lerp(mx - 420, mx - 120, app), y: gy, s: 1.25, facing: 1, pose: hp, expr: 'happy', rim: WARM, t });
  });
  forestFg(g, t, cam);
} });

// s105 — "She is cold. She is smiling."  giant face of MINA, cold-tinted but smiling, sleepy
registerShot('s105', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sc = 1.02 + 0.08 * k, tSmile = wt('smiling', info, 1.6);
  g.fillStyle = '#040616'; g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.7, E.H * 0.9, 700, '#ffb24a', 0.2);
  const cx = E.W / 2, cy = E.H * 0.55, r = 290;
  g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  bigFace(g, cx, cy + Math.sin(t * 1.1) * 3, r, { outfit: MINA, expr: 'sleepy', face: t > tSmile - 0.3 ? { mouth: 'smile' } : { mouth: 'flat' }, rimColor: '#9fc6ff', rimSide: -1 });
  g.fillStyle = '#d4262e'; g.beginPath(); g.ellipse(cx, cy + r * 1.0, r * 0.95, r * 0.22, 0, 0, Math.PI * 2); g.fill();   // the red scarf at her chin
  g.restore();
  FX.snow(g, t, { count: 24, color: '#cfe0ff', speed: 20 });                                    // cold breath motes
} });

// s106 — "You found me, she mumbles. Of course you did."  MINA mumbles, HERO holds her; warm rim
registerShot('s106', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.75 + 0.1 * k, x: lerp(120, 180, k), y: 140 }, st = info.shot.start;
  const tFound = wt('found', info, 0.2), tMumble = wt('mumbles', info, 1.2), tCourse = wt('course', info, 2.2);
  const F = forest(g, t, cam, { view: 'cave', rain: true });
  const mx = F.pos.ledgeX + 80, gy = F.GY;
  layer(g, cam, 1, (g) => {
    glow(g, mx - 40, gy - 90, 260, '#ffb24a', 0.3);
    actor(g, 'HERO', { x: mx - 70, y: gy, s: 1.3, facing: 1, pose: breathe(POSES.kneel, t, 0.8, 3), expr: t > tCourse ? 'happy' : 'smile', rim: WARM, t });
    actor(g, 'MINA', { x: mx + 30, y: gy, s: 1.3, facing: -1, pose: breathe(POSES.crouch, t, 0.6, 4), expr: 'smile', talk: talkAmount(info.globalT, st + tFound - 0.05, st + tMumble - 0.05), rim: WARM, t });
    warmer(g, mx + 6, gy - 70, 0.9, t);
  });
  forestFg(g, t, cam);
  chip(g, t, { str: '"You found me."', at: tFound + 0.3, x: E.W * 0.68, y: E.H * 0.2, tone: 'coral', dur: tCourse - 0.1 });
  chip(g, t, { str: 'Of course you did', at: tCourse, x: E.W * 0.36, y: E.H * 0.2, tone: 'gold' });
} });

// s107 — "Dev cheers. Tomas wipes his eyes and blames the rain."  medium
registerShot('s107', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.45 + 0.06 * k, x: lerp(-520, -440, k), y: 110 }, tWipe = wt('wipes', info, 1.4), tBlame = wt('blames', info, 2.6), st = info.shot.start;
  const F = forest(g, t, cam, { view: 'cave', rain: true });
  layer(g, cam, 1, (g) => {
    const jump = Math.max(0, Math.sin(t * 7)) * 18 * (1 - prog(t, 2.5, info.dur));
    actor(g, 'DEV', { x: F.CX - 760, y: F.GY - jump, s: 1.4, facing: 1, pose: posesAt(t, [[0, 'cheer'], [0.6, 'jump'], [0.9, 'cheer'], [1.5, 'jump'], [1.8, 'cheer']], 0.2), expr: 'joy', rim: WARM, t });
    actor(g, 'TOMAS', { x: F.CX - 420, y: F.GY, s: 1.4, facing: -1, pose: posesAt(t, [[0, 'relaxed'], [tWipe, 'facepalm'], [tBlame, 'shrug'], [tBlame + 0.7, 'pointUp']], 0.25), expr: t < tBlame ? 'cry' : 'smile', talk: talkAmount(info.globalT, st + tBlame, st + info.dur), rim: WARM, t });
  });
  forestFg(g, t, cam);
  chip(g, t, { str: '"It\'s the rain."', at: tBlame + 0.3, x: E.W * 0.62, y: E.H * 0.2, tone: 'gold' });
} });

// s108 — "Mina waves the little brick. Best twin ever... and you owe me hot chocolate."  end on a slow push into the spark
registerShot('s108', { draw(g, t, info) {
  const st = info.shot.start, tBest = wt('best', info, 1.2), tChoc = wt('chocolate', info, 3.6), push = ease.in(prog(t, info.dur - 1.6, info.dur));
  const F0 = { pos: { ledgeX: E.W / 2 + 120 } }, mx = F0.pos.ledgeX + 30;
  const wave = Math.sin(t * 6) * 14, bx = mx - 14 + wave, by = forestGround() - 150;
  const cam = { z: lerp(1.6 + 0.06 * (t / info.dur), 4.2, push), x: lerp(120, bx - E.W / 2, push), y: lerp(120, by - E.H / 2, push) };
  const F = forest(g, t, cam, { view: 'cave', rain: true });
  layer(g, cam, 1, (g) => {
    glow(g, bx, by, 260, '#ffb24a', 0.35);
    actor(g, 'HERO', { x: mx - 170, y: F.GY, s: 1.3, facing: 1, pose: breathe(POSES.kneel, t, 0.8, 3), expr: t > tChoc ? 'happy' : 'smile', rim: WARM, t });
    actor(g, 'MINA', { x: mx + 20, y: F.GY, s: 1.3, facing: -1, pose: breathe(POSES.wave, t, 0.6, 4), expr: 'happy', talk: talkAmount(info.globalT, st + tBest - 0.05, st + info.dur), rim: WARM, t });
    warmer(g, bx, by, 1.0, t);
  });
  forestFg(g, t, cam);
  const [sx, sy] = scr(cam, bx, by); glow(g, sx, sy, 200 + 300 * push, '#fff2d0', 0.3 + 0.5 * push);
  chip(g, t, { str: '"Best twin ever"', at: tBest, x: E.W * 0.68, y: E.H * 0.2, tone: 'gold', dur: tChoc - 0.2 });
  chip(g, t, { str: '"You owe me hot chocolate"', at: tChoc - 0.3, x: E.W * 0.6, y: E.H * 0.2, tone: 'coral', dur: info.dur - 0.9 });
} });
