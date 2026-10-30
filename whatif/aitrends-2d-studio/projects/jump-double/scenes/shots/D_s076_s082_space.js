// D_s076_s082_space.js — batch D: day 19 at the edge of space (131 km), the 100 km line, "technically an astronaut",
// the silent Earth curve, the fall, re-entry heat, and the shooting star over the town.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, seg, circle, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { spaceEdge } from '../sets/orbit.js';
import { stratosphere } from '../sets/sky.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { gauge } from '../sets/devices.js';
import { JPOSE, jumpStreaks, jumpShake } from '../sets/jump.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { shotWord, gearBack, gearFront, faceGear, riseJ, flyer, dayHUD, meterHUD, plasma, bulletIcon } from './D_lib.js';

const GEAR = { tank: true, mask: true, helmet: true };
const EARTH = { color: '#8ac8ff', dir: [0.2, 1] };       // blue Earthlight from below
const SUNR = { color: '#fff6e0', dir: [0.8, -0.6] };
// a floating figure with gear (actor-based, no squash)
function floater(g, o, pose, extra) { gearBack(g, o, pose, GEAR); actor(g, 'HERO', { ...o, pose, shadow: false, ...extra }); gearFront(g, o, pose, GEAR); }
const floatPose = (t, seed = 2) => idle({ ...JPOSE.apex, hF: [60 + Math.sin(t * 0.9) * 6, -196 + Math.sin(t * 0.7) * 8], hB: [-58, -194 + Math.cos(t * 0.8) * 8], fF: [30 + Math.sin(t * 0.6) * 5, -20], fB: [-26, -22 + Math.sin(t * 0.5) * 5] }, t * 0.5, seed);

// s076 — "Day nineteen. A hundred and thirty-one kilometres."  edge of space; DAY 18 -> 19; HERO floats up into frame; meter 131 km
registerShot('s076', { draw(g, t, info) {
  const st = info.shot.start, tDay = shotWord('day', st, 0.15), tHun = shotWord('hundred', st, 1.27);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-30, 20] });
  const Q = spaceEdge(g, t, cam, { line: 0 });
  const up = ease.out(prog(t, 0, 2.2)), yF = lerp(E.H + 520, E.H * 0.74, up), J = riseJ(t, 0.6 * (1 - up));
  layer(g, cam, 1, (g) => flyer(g, 'HERO', J, { x: E.W * 0.44, gy: yF, s: 1.95, facing: 1, shadow: false, t, rim: SUNR, expr: exprAt(t, [[0, 'determined'], [tHun, 'awe']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(0.5, 0.6) }, GEAR));
  atmos(g, t, cam, { color: '#e8e8ff', far: 10, near: 3 });
  dayHUD(g, t, [[0, 18], [tDay, 19]]);
  meterHUD(g, t, key(t, [[0, 80000], [tHun, 131000]], ease.out));
} });

// s077 — "You've passed the edge of space, a hundred kilometres up."  the dashed 100 km line slides down past the floating hero
registerShot('s077', { draw(g, t, info) {
  const st = info.shot.start, tEdge = shotWord('edge', st, 0.89), tHun = shotWord('hundred', st, 1.91);
  const cam = camMove(t, info.dur, { z: [1.06, 1.1], x: [20, -20], drift: 0.5 });
  const Q = spaceEdge(g, t, cam, { line: ease.out(prog(t, 0, 0.5)), lineY: lerp(E.H * 0.08, E.H * 0.96, ease.inOut(prog(t, tEdge - 0.7, tHun + 1.0))) });
  const o = { x: E.W * 0.56, y: E.H * 0.72 + Math.sin(t * 1.1) * 10, s: 1.95, facing: -1, rot: 0.08 * Math.sin(t * 0.6) };
  layer(g, cam, 1, (g) => floater(g, o, floatPose(t), { t, rim: SUNR, expr: exprAt(t, [[0, 'awe'], [tEdge, 'surprised'], [tHun + 0.4, 'smile']]), blink: blinkFlag(t, 3.6, 4), look: lookToward(-0.3, 1) }));
  atmos(g, t, cam, { color: '#e8e8ff', far: 10, near: 3 });
  dayHUD(g, t, [[0, 19]]);
  meterHUD(g, t, 131000);
} });

// s078 — GIANT FACE: "For a few minutes, you're technically an astronaut."  awe -> delighted, Earth arcs reflected in his eyes; ASTRONAUT? chip
registerShot('s078', { draw(g, t, info) {
  const st = info.shot.start, tTech = shotWord('technically', st, 1.02), tAst = shotWord('astronaut', st, 1.7);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  blurLayer(g, 12, (g) => spaceEdge(g, t, { z: 1.3, x: 0, y: 140 }, { line: 0 }), null, 1);
  const cx = E.W * 0.5, cy = E.H * 0.56, r = 320, tilt = lerp(0.03, -0.03, ease.inOut(t / info.dur));
  const f = faceAt(t, [[0, 'awe'], [tTech, 'delighted'], [tAst + 0.5, 'awe']], 0.2);
  glow(g, cx, E.H * 1.1, 900, '#6ab8ff', 0.35);
  giantFace(g, cx, cy, r, { who: 'HERO', f, rimSide: 1, rimColor: '#8ac8ff', glint: '#bfe2ff', blink: blinkAmt(t, 3.4, 2), breath: Math.sin(t * 1.6), tilt });
  // the Earth's blue limb reflected in both eyes
  g.save(); g.translate(cx, cy); g.rotate(tilt); for (const s of [-1, 1]) { const ex = s * r * 0.34, ey = -r * 0.04 + r * 0.08; g.strokeStyle = alpha('#6ac8ff', 0.85); g.lineWidth = r * 0.022; g.beginPath(); g.arc(ex, ey + r * 0.2, r * 0.17, Math.PI * 1.28, Math.PI * 1.72); g.stroke(); } g.restore();
  faceGear(g, cx, cy, r, { mask: true, helmet: true, tilt });
  for (let i = 0; i < 5; i++) { const ph = (t * 0.7 + i * 0.23) % 1; FX.sparkle(g, cx + (i - 2) * 300, E.H * 0.16 + Math.sin(i * 2.1) * 40, 12 * Math.sin(ph * Math.PI), '#e8f4ff', 0.8); }
  atmos(g, t, cam, { color: '#e8e8ff', far: 8, near: 3 });
  chip(g, t, { str: 'ASTRONAUT?', at: tAst, tone: 'blue', y: E.H * 0.88 });
} });

// s079 — "The Earth curves below you. It's silent."  wide: the curve across the bottom, the hero floating at the apex, slow rotation
registerShot('s079', { draw(g, t, info) {
  const st = info.shot.start, tCurve = shotWord('curves', st, 0.34), tSil = shotWord('silent', st, 1.72);
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], x: [-10, 10], drift: 0.3 });
  const Q = spaceEdge(g, t, cam, { line: 0, curve: 0.42 });
  const o = { x: E.W * 0.6, y: E.H * 0.6 + Math.sin(t * 0.9) * 6, s: 1.9, facing: -1, rot: -0.12 + 0.06 * t };
  layer(g, cam, 1, (g) => floater(g, o, floatPose(t, 5), { t, rim: SUNR, expr: exprAt(t, [[0, 'awe'], [tCurve, 'surprised'], [tSil, 'smile']]), blink: blinkFlag(t, 3.8, 1), look: lookToward(-0.4, 0.9) }));
  atmos(g, t, cam, { color: '#e8e8ff', far: 8, near: 2 });
  meterHUD(g, t, 131000);
} });

// s080 — "Then you fall. All the way."  on 'fall' awe -> shocked, he drops out of the bottom of frame; camera follows; streaks + a faint glow
registerShot('s080', { draw(g, t, info) {
  const st = info.shot.start, tFall = shotWord('fall', st, 1.23), u = Math.max(0, t - tFall + 0.1), d = 1100 * u * u;
  const cam = camMove(t, info.dur, { z: [1.04, 1.08] }); cam.y += d * 0.45;
  const Q = spaceEdge(g, t, cam, { line: 0 });
  const J = t < tFall ? riseJ(t, 0) : { ...riseJ(t, clamp(u * 1.4), { pose: JPOSE.flail, phase: 'fall', dir: -1 }), pose: { ...JPOSE.flail, hF: [58 + Math.sin(t * 16) * 8, -226], hB: [-46, -236 + Math.cos(t * 15) * 8] } };
  layer(g, cam, 1, (g) => { const x = E.W * 0.5, gy = E.H * 0.72 + d;
    if (u > 0.2) glow(g, x, gy - 200, 260, '#ff8a3a', 0.25 * clamp((u - 0.2) * 1.2));
    flyer(g, 'HERO', J, { x, gy, s: 1.95, facing: 1, shadow: false, t, rim: SUNR, expr: exprAt(t, [[0, 'awe'], [tFall, 'shocked']]), blink: blinkFlag(t, 3.3, 3), look: t > tFall ? lookToward(0, 1) : lookToward(0.3, -0.4) }, GEAR); });
  atmos(g, t, cam, { color: '#e8e8ff', far: 8, near: 3 });
  meterHUD(g, t, key(t, [[0, 131000], [tFall, 131000], [info.dur, 112000]]));
} });

// s081 — "To leave the ground that fast, you'd be moving faster than a rifle bullet,"  head-first re-entry, plasma aura grows; speed gauge + bullet
registerShot('s081', { draw(g, t, info) {
  const st = info.shot.start, tFast = shotWord('fast', st, 1.17), tRifle = shotWord('rifle', st, 3.21);
  const cam = camMove(t, info.dur, { z: [1.08, 1.14] }), sk = [Math.sin(t * 37) * 4 * prog(t, 0.5, 3), Math.cos(t * 41) * 4 * prog(t, 0.5, 3)]; cam.x += sk[0]; cam.y += sk[1];
  stratosphere(g, t, cam, { alt: lerp(1, 0.6, ease.in(t / info.dur)), curve: 0.25 });
  const k = ease.inOut(prog(t, 0.2, 2.6)), x = E.W * 0.34, y = E.H * 0.6 + Math.sin(t * 3) * 6;
  layer(g, cam, 1, (g) => {
    jumpStreaks(g, t, x, y - 300, { s: 1.9, dir: -1, a: 0.5, color: '#ffe0b0', count: 22 });
    plasma(g, x, y + 70, 1.9, t, 0.15 + 0.85 * k, [0, 1]);
    const o = { x, y, s: 1.9, facing: 1, rot: Math.PI }, pose = { ...JPOSE.fall, hF: [40, -246 + Math.sin(t * 20) * 4], hB: [-36, -242] };
    floater(g, o, pose, { t, rim: { color: '#ffb060', dir: [0, 1] }, expr: exprAt(t, [[0, 'scared'], [tFast, 'shocked']]), blink: blinkFlag(t, 3.0, 5), look: lookToward(0, -1) });
    plasma(g, x, y + 80, 1.4, t + 0.3, 0.5 * k, [0, 1]);
  });
  gauge(g, t, { x: E.W * 0.64, y: E.H * 0.44, r: 190, at: 0.5, sweep: 2.2, max: 2, value: 1.6, unit: 'km/s', label: 'FALL SPEED', step: 0.5, decimals: 1, red: 1.0, hot: true });
  const bp = ease.outBack(prog(t, tRifle - 0.1, tRifle + 0.3)); if (bp > 0.02) { g.save(); g.translate(E.W * 0.64, E.H * 0.74); g.scale(bp, bp); bulletIcon(g, 0, 0, 1.4); g.restore(); }
  chip(g, t, { str: 'Faster than a bullet', at: tRifle, x: E.W * 0.64, y: E.H * 0.86 });
  meterHUD(g, t, key(t, [[0, 100000], [info.dur, 55000]]), { x: E.W - 120, alpha: 0.85 });
} });

// s082 — "and air at that speed glows hot."  SHOOTING STAR over the town at night: the hero streaks across the sky as a fireball; neighbours look up
const NEIGH = [{ top: 'hoodie', color: '#2f6fd0', legs: '#26304a', head: 'none' }, { top: 'tshirt', color: '#3aa05a', legs: '#223a30', head: 'ponytail' }, { top: 'hoodie', color: '#9a5ad6', legs: '#2a2438', head: 'beanie', headColor: '#e0e0d0' }];
registerShot('s082', { draw(g, t, info) {
  const st = info.shot.start, tGlow = shotWord('glows', st, 1.43), tHit = 1.83, sk = jumpShake(t, tHit, 8);
  const cam = camMove(t, info.dur, { z: [0.82, 0.86], x: [-80, 40], y: [-430, -410] }); cam.x += sk[0]; cam.y += sk[1];
  const R = roofs(g, t, cam, { view: 'houses', mood: 'night', moon: 0.6 });
  // the fireball crosses the open sky above the roofs (screen space: it is far away), then flashes beyond the horizon
  const k = prog(t, 0.05, tHit), fx = lerp(-E.W * 0.05, E.W * 0.86, ease.sine(k)), fy = lerp(E.H * 0.09, E.H * 0.3, ease.sine(k) ** 1.4), hx = E.W * 0.86, hy = E.H * 0.3;
  if (k < 1) { plasma(g, fx, fy, 1.0, t, 0.6 + 0.4 * prog(t, tGlow - 0.5, tGlow), [1, 0.42]); circle(g, fx, fy, 14, '#fff8e0'); }
  const u = t - tHit; if (u > 0) { glow(g, hx, hy, 700, '#ffb060', 0.6 * Math.exp(-u * 2.5)); glow(g, hx, hy, 220, '#ffffff', 0.8 * Math.exp(-u * 5)); for (let i = 0; i < 6; i++) { const r = rng(i + 3); FX.sparkle(g, hx + (r() - 0.5) * 300 * u, hy - r() * 220 * u, 18 * Math.exp(-u * 2), '#ffd080', 0.9); } }
  // neighbours in the foreground, backs to camera, looking up (heads-and-shoulders)
  const look = lookToward(k < 1 ? (fx - E.W * 0.5) / 700 : 1, -0.9);
  layer(g, { z: 1, x: 0, y: 0 }, 1, (g) => NEIGH.forEach((nb, i) => { const x = E.W * [0.12, 0.3, 0.84][i], t0 = 0.3 + i * 0.25;
    actor(g, nb, { x, y: E.H * 1.3, s: 2.7, facing: i === 2 ? -1 : 1, pose: idle(t < t0 ? POSES.relaxed : i === 1 ? reaction('shock', t, tHit, 'pointUp') : reaction('lookUp', t, t0, 'relaxed'), t, i + 2), expr: exprAt(t, [[0, 'neutral'], [t0, 'surprised'], [tHit, 'shocked']]), blink: blinkFlag(t, 3 + i * 0.3, i), look, rim: { color: '#ffd8a0', dir: [0.5, -0.8] }, shadow: false, t }); }));
  atmos(g, t, cam, { color: '#ffd8b0', far: 14, near: 4 });
} });
