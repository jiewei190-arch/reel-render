// C_s082_s088_rule5_camp.js — batch C, shots s082-s088: the lamp flash freeze, the ominous face, RULE 5 card,
// the rainy campsite where Mina is gone, the thermal forest sweep (deer, fox, Dev), and "Except her. Why?"
import { E, V, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake, circle, rng } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { thermalView, heatActor, heatDeer, heatFox, heatBlob, heatRect, whiteOut } from '../sets/thermal.js';
import { chip, ruleCard, darkness } from '../sets/hud.js';
import { HERO, MINA, DEV, TOMAS } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;   // word time, shot-local
// world -> screen for a depth-1 point (HUD crosshair tracking)
const scr = (cam, x, y) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z || 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z || 1) + E.H / 2];

// frozen rain: streaks hang in the air (a freeze-frame), drifting a hair so the frame is never dead
function hangingRain(g, t, o = {}) { const r = rng(o.seed ?? 21), n = o.count ?? 220, a = o.a ?? 0.35;
  g.save(); g.strokeStyle = alpha(o.color || '#b8c8ff', a); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = r() * E.W * 1.2 - E.W * 0.1, y = r() * E.H, l = 18 + r() * 34, dz = r(); g.lineWidth = 1 + dz * 2;
    const dy = t * (2 + dz * 4); g.beginPath(); g.moveTo(x, y + dy); g.lineTo(x + l * 0.18, y + dy + l); g.stroke(); if (dz > 0.85) circle(g, x + l * 0.18, y + dy + l + 3, 2.4, alpha('#dfe8ff', a)); }
  g.restore(); }
// frozen particles around a light (freeze-frame sparks)
function hangingSparks(g, t, x, y, o = {}) { const r = rng(o.seed ?? 7), n = o.count ?? 60;
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = 60 + r() * (o.rad ?? 520), s = 2 + r() * 5; const px = x + Math.cos(a) * d + Math.sin(t * 0.6 + i) * 3, py = y + Math.sin(a) * d * 0.8 + Math.cos(t * 0.5 + i) * 3;
    glow(g, px, py, s * 5, o.color || '#fff2d0', 0.5); circle(g, px, py, s * 0.6, '#fffaf0'); } }

// s082 — FREEZE: "Light is a punch. Remember that..."  the lamp bulb flares to full glare, HERO flinches
registerShot('s082', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.06 * k, x: lerp(-40, 30, k), y: -12 * k };
  const A = apartment(g, t, cam, { power: 1 });
  const lx = A.pos.lampX, ly = A.GY - 330, punch = wt('punch', info, 0.9), rem = wt('remember', info, 1.6);
  layer(g, cam, 1, (g) => {
    // HERO flinching away from the bulb: arm up over the eyes, leaning back; a small recoil on "punch"
    const rec = ease.out(prog(t, punch - 0.1, punch + 0.25)) * (1 - 0.3 * ease.inOut(prog(t, rem, info.dur)));
    const p = breathe(posesAt(t, [[0, 'stand'], [0.15, 'facepalm']], 0.25), t, 0.4, 3);
    actor(g, 'HERO', { x: lx + 230 + rec * 30, y: A.GY + 30, s: 1.75, facing: -1, pose: p, expr: t < rem ? 'shocked' : 'worried', rim: { color: '#fff4dc', dir: [-1, -0.3], w: 7 }, t });
  });
  apartmentFg(g, t, cam);
  // the bulb at full glare: starburst + streak + hanging sparks (the frame is "frozen", only the light breathes)
  const [bx, by] = scr(cam, lx, ly), fl = 0.92 + 0.08 * Math.sin(t * 9);
  glow(g, bx, by, 900, '#ffe9c0', 0.55 * fl); glow(g, bx, by, 260, '#ffffff', 0.9);
  FX.sparkle(g, bx, by, 220 * fl, '#ffffff', 0.95); FX.lensStreak(g, bx, by, E.W * 1.6, '#ffe6cc', 0.5, 4);
  hangingSparks(g, t, bx, by, { count: 70, rad: 620 });
  whiteOut(g, 0.35 * (1 - ease.out(prog(t, 0, 0.6))) + 0.08, { x: bx, y: by });
  chip(g, t, { str: 'Light is a punch', at: punch, x: E.W * 0.66, y: E.H * 0.8, tone: 'coral', dur: info.dur - 0.2 });
} });

// s083 — "because you are about to need it."  giant face, ominous, slow push, eyes fixed off camera
registerShot('s083', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sc = 1 + 0.12 * k, need = wt('need', info, 1.8);
  g.fillStyle = '#05060c'; g.fillRect(0, 0, E.W, E.H);
  blurLayer(g, 18, (g) => { apartment(g, t, { z: 1.2, x: 300 }, { power: 0 }); });
  veil(g, '#02030a', 0.55);
  g.save(); g.translate(E.W / 2, E.H * 0.56); g.scale(sc, sc); g.translate(-E.W / 2, -E.H * 0.56);
  const lookX = lerp(0.55, 0.85, ease.inOut(prog(t, 0.2, 1.4)));
  bigFace(g, E.W * 0.5 + Math.sin(t * 0.8) * 4, E.H * 0.56, 300, { outfit: HERO, expr: t < need ? 'determined' : 'worried', look: [lookX, -0.05], blink: ((t + 0.4) % 2.6) < 0.1, rimColor: '#9fb6ff', rimSide: 1 });
  g.restore();
  darkness(g, 0.75, { x: E.W * 0.5, y: E.H * 0.5, r: E.W * 0.55 });
  FX.dust(g, t, { count: 22, color: '#9fb6ff', a: 0.18 });
} });

// s084 — RULE 5 / COLD HIDES over rainy pines, rain streaks across the letters
registerShot('s084', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * (t / info.dur), x: 40 * (t / info.dur) };
  ruleCard(g, t, info, { n: 5, title: 'COLD HIDES', accent: '#9fd0ff', bg: (g, t) => { forest(g, t, cam, { view: 'camp', rain: true }); FX.dust(g, t, { count: 20, color: '#b8c8ff', a: 0.2 }); } });
  FX.rain(g, t * 1.2, { count: 120, len: 70, w: 2, a: 0.28, seed: 33, angle: 0.18 });       // streaks cross the letters
} });

// s085 — "A school camping trip. Rain on the trees. Mina is gone."  wide camp; on "gone" push to the empty tent and FREEZE (rain hangs)
registerShot('s085', { draw(g, t, info) {
  const gone = wt('gone', info, 3.4), frz = gone + 0.15, ft = Math.min(t, frz);                    // after the freeze, time stops for the rain
  const pk = ease.inOut(prog(t, gone - 0.6, gone + 0.5));
  const cam = { z: lerp(1.0 + 0.04 * ft / info.dur, 1.55, pk), x: lerp(-30 + 30 * ft / info.dur, 420, pk), y: lerp(0, 130, pk) };
  const F = forest(g, ft, cam, { view: 'camp', rain: t < frz });
  const GY = F.GY, tx = F.pos.tentX + 80;
  layer(g, cam, 1, (g) => {
    // the huddle: TOMAS with the lantern, DEV, HERO; MINA fades out of the group as the narrator says she is gone
    const lan = [tx - 150, GY - 128];
    glow(g, lan[0], lan[1], 300, '#ffcf7a', 0.35 + 0.05 * Math.sin(t * 7)); FX.pool(g, tx - 60, GY + 18, 360, 40, '#ffcf7a', 0.22);
    actor(g, 'TOMAS', { x: tx - 180, y: GY, s: 1.05, facing: 1, pose: breathe(POSES.holdFront, ft, 0.6, 1), expr: 'worried', rim: { color: '#ffd59a', dir: [1, -0.4] }, t: ft });
    circle(g, lan[0], lan[1], 10, '#ffe7a8');
    actor(g, 'DEV', { x: tx - 40, y: GY, s: 1.05, facing: 1, pose: breathe(posesAt(ft, [[0, 'crossArms'], [gone - 0.2, 'handsOnHead']]), ft, 0.8, 2), expr: ft > gone - 0.2 ? 'scared' : 'nervous', rim: { color: '#ffd59a', dir: [-1, -0.4] }, t: ft });
    actor(g, 'HERO', { x: tx + 90, y: GY, s: 1.05, facing: ft > gone - 0.3 ? 1 : -1, pose: breathe(POSES.relaxed, ft, 0.8, 3), expr: ft > gone - 0.3 ? 'worried' : 'neutral', rim: { color: '#ffd59a', dir: [-1, -0.4] }, t: ft });
    const ma = 1 - ease.inOut(prog(t, gone - 0.9, gone - 0.1));
    if (ma > 0.01) actor(g, 'MINA', { x: tx + 200, y: GY, s: 1.05, facing: -1, pose: breathe(POSES.stand, ft, 0.6, 4), expr: 'smile', rim: { color: '#ffd59a', dir: [-1, -0.4] }, t: ft, alpha: ma });
    // the empty tent: a dark open flap, a little wind on the door
    const ex = F.pos.tent2X, flap = Math.sin(ft * 3) * 6; g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.moveTo(ex - 34, GY); g.lineTo(ex + flap, GY - 170); g.lineTo(ex + 34, GY); g.closePath(); g.fill();
  });
  forestFg(g, ft, cam);
  if (t >= frz) { hangingRain(g, t - frz, { count: 260, a: 0.42 }); veil(g, '#0a1030', 0.18 * ease.out(prog(t, frz, frz + 0.4))); }
  chip(g, t, { str: 'Mina is gone', at: gone + 0.1, x: E.W * 0.68, y: E.H * 0.84, tone: 'coral' });
} });

// s086 — THERMAL forest sweep: "You scan the forest. Deer. A fox."  camera pans left to right
registerShot('s086', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05, x: lerp(-520, 520, k) }, GY = forestGround(), CX = E.W / 2;
  const tDeer = wt('deer', info, 1.6), tFox = wt('fox', info, 2.6);
  const dx = CX - 420 + Math.sin(t * 0.5) * 20, fx = CX + 520 + t * 40;
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'camp', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatDeer(c, { x: dx, y: GY - 10, s: 1.5, facing: 1, t, heat: 0.76 }); heatBlob(c, dx + 40, GY - 140, 160, 110, 0.25, 0.9);
      heatFox(c, { x: fx, y: GY + 6, s: 1.6, facing: 1, t, heat: 0.82 }); heatBlob(c, fx, GY - 40, 110, 60, 0.25, 0.9);
      // cold rain streaks: thin dark lines over the warm bodies (rain reads as cold)
    }),
    hud: { label: 'THERMAL  SCAN', temp: t < tFox ? '31 C  DEER' : '33 C  FOX', track: t < tFox ? scr(cam, dx + 60, GY - 120) : scr(cam, fx + 20, GY - 40) },
  });
  FX.rain(g, t, { count: 160, angle: 0.18, color: '#2a1050', a: 0.45, seed: 12 });
  chip(g, t, { str: 'Deer', at: tDeer, x: E.W * 0.3, y: E.H * 0.84, tone: 'gold', dur: tFox - 0.05 });
  chip(g, t, { str: 'A fox', at: tFox, x: E.W * 0.66, y: E.H * 0.84, tone: 'gold' });
} });

// s087 — THERMAL two-shot: "Dev, glowing beside you. Everything alive shows up."
registerShot('s087', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.32 + 0.08 * k, x: lerp(-80, 40, k), y: -60 }, GY = forestGround(), CX = E.W / 2;
  const tAlive = wt('alive', info, 2.2);
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'camp', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      const dp = breathe(posesAt(t, [[0, 'relaxed'], [tAlive - 0.3, 'wave']]), t, 1, 2);
      heatActor(c, 'DEV', { x: CX - 120, y: GY, s: 1.6, facing: 1, pose: dp, expr: t > tAlive ? 'happy' : 'confused', t, heat: 0.95 });
      heatActor(c, 'HERO', { x: CX + 260, y: GY, s: 1.6, facing: -1, pose: breathe(POSES.stand, t, 1, 4), t, heat: 0.84 });
      // little warm things in the grass: everything alive shows up
      const r = rng(5); for (let i = 0; i < 7; i++) { const on = ease.out(prog(t, tAlive + i * 0.12, tAlive + i * 0.12 + 0.3)); heatBlob(c, CX - 900 + r() * 1800, GY + 20 + r() * 120, 18, 10, 0.75 * on, 0.6); }
    }),
    hud: { label: 'THERMAL', temp: '35 C  DEV', track: scr(cam, CX - 110, GY - 300) },
  });
  FX.rain(g, t, { count: 140, angle: 0.18, color: '#2a1050', a: 0.4, seed: 14 });
  chip(g, t, { str: 'Everything alive shows up', at: tAlive, x: E.W * 0.5, y: E.H * 0.86, tone: 'gold' });
} });

// s088 — "Except her. Why?"  giant face, searching, eyes darting, rain on the face
registerShot('s088', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sc = 1.04 + 0.08 * k, why = wt('why', info, 1.4);
  forest(g, t, { z: 1.3, x: 200 }, { view: 'camp', rain: false }); veil(g, '#04060f', 0.62);
  const dart = [[0, -0.7], [0.35, 0.7], [0.75, -0.2], [1.1, 0.8], [1.5, -0.6]], look = key(t, dart.map(([tt, x]) => [tt, [x, 0.05]]), ease.out);
  g.save(); g.translate(E.W / 2, E.H * 0.56); g.scale(sc, sc); g.translate(-E.W / 2, -E.H * 0.56);
  bigFace(g, E.W / 2 + Math.sin(t * 1.1) * 6, E.H * 0.56, 300, { outfit: HERO, expr: t < why ? 'worried' : 'confused', look: t < why ? look : [0.1, -0.4], blink: Math.abs(t - 0.9) < 0.05, rimColor: '#b8c8ff', rimSide: -1, tilt: t > why ? 0.06 * ease.out(prog(t, why, why + 0.4)) : 0 });
  g.restore();
  FX.drops(g, t, { count: 26, a: 0.5 });
  FX.rain(g, t * 1.2, { count: 120, len: 80, a: 0.25, angle: 0.18, seed: 41 });
  darkness(g, 0.6, { x: E.W / 2, y: E.H / 2, r: E.W * 0.6 });
} });
