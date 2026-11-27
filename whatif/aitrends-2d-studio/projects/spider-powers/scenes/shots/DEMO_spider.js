// DEMO_spider.js — sheet-check shots for sets/spider.js (temporary ids, not in the real shot list). 16:9.
//   demo_pip       Pip on the hero's thumb: tilts its head, hops, waves one leg (the long stare)
//   demo_pipface   the giant close-up: huge glossy eyes with a window in them, a slow blink, a tilt
//   demo_wall      hallway: hands and socks stick, he climbs, then slides down like a wet sticker; a purple glove slips off
//   demo_ceiling   he wakes stuck to the ceiling, peels off and drops onto the bed
//   demo_silk      the comedy silk puff from the back end, then a dragline lowering a bundle (the scarf) from the shed roof
//   demo_dodge     Mina's water balloon flies in; he steps aside without looking (air hairs), it splats past him
import { E, registerShot, layer, ease, prog, clamp, lerp, rr, seg, circle, glow, linGrad, alpha, shade } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { roofs } from '../sets/roofs.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { pip, pipFace, wallCling, stickMarks, drawCeiling, silkLine, silkPuff, silkAnchor, dodge, airHairs, gloves } from '../sets/spider.js';

const RIM = { color: '#ffd8a8', dir: [0.8, -0.5] };

registerShot('demo_pip', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.6, 1.7], x: [-60, -40], y: [-120, -130] });
  const A = apartment(g, t, cam, { power: 1, mood: 'day' });
  layer(g, cam, 1, (g) => {
    const hx = A.CX - 160, pose = { ...POSES.stand, eF: [30, -150], hF: [62, -168] };
    actor(g, 'HERO', { x: hx, y: A.GY, s: 1.9, facing: 1, pose: idle(pose, t, 2), expr: exprAt(t, [[0, 'awe'], [2.4, 'smile']]), blink: blinkFlag(t, 3.6, 2), look: lookToward(1, -0.1), rim: RIM, t });
    const thumb = [hx + 62 * 1.9 + 4, A.GY - 168 * 1.9 - 14];
    pip(g, thumb[0], thumb[1], 1.7, { t, tilt: Math.sin(t * 1.2) * (t > 1 ? 1 : 0.2), hop: prog(t, 2.6, 3.1), wave: prog(t, 3.3, 3.5) * (1 - prog(t, 4.4, 4.6)), look: [-0.6, -0.2], blink: blinkAmt(t, 3.0, 1) });
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#fff4dc' });
} });

registerShot('demo_pipface', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#c8b89a', '#8a7a60']); g.fillRect(0, 0, E.W, E.H);
  glow(g, E.W * 0.3, E.H * 0.2, 900, '#fff4dc', 0.3);
  pipFace(g, E.W * 0.5, E.H * 0.55, E.H * 0.42 * lerp(1, 1.06, t / info.dur), { t, look: [Math.sin(t * 0.8) * 0.4, 0], blink: blinkAmt(t, 2.6, 0), tilt: Math.sin(t * 0.9) });
} });

function hallWall(g, cam, wx) { layer(g, cam, 1, (g) => { g.fillStyle = linGrad(g, 0, -800, 0, 1000, ['#e8d8c0', '#c8b498']); g.fillRect(-1400, -1400, 4800, 3000); g.fillStyle = '#d0bea0'; g.fillRect(wx, -1400, 2400, 3000); seg(g, [[wx, -1400], [wx, 2000]], 6, alpha('#8a7a60', 0.6)); g.fillStyle = '#8a6a4a'; g.fillRect(-1400, E.H * 0.8, 4800, 400); rr(g, wx + 200, 200, 160, 220, 6); g.fillStyle = '#7a8aa8'; g.fill(); g.strokeStyle = '#3a2a22'; g.lineWidth = 10; g.stroke(); }); }
registerShot('demo_wall', { draw(g, t, info) {
  const wx = E.W / 2 + 120, GY = E.H * 0.8, slide = ease.inOut(prog(t, 2.2, 4.6)), rise = ease.out(prog(t, 0.3, 2.0)) * 380;
  const R = wallCling(t, { climb: t < 2.0 ? 1 : 0, slide, slideDist: 380 }), hx = wx - 44 * 1.9, hy = GY - rise + R.dy;
  const cam = { z: 1.45, x: hx - E.W / 2 + 80, y: hy - 300 - E.H / 2 + 100 };
  hallWall(g, cam, wx);
  layer(g, cam, 1, (g) => {
    const o = { x: hx, y: hy, s: 1.9, facing: 1 };
    actor(g, 'HERO', { ...o, pose: R.pose, expr: exprAt(t, [[0, 'determined'], [1.8, 'joy'], [2.3, 'worried'], [3.6, 'sheepish']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(0.3, -0.8), rim: RIM, t });
    gloves(g, o, R.pose, { t, slip: prog(t, 2.6, 3.0) + (t > 3.0 ? 1 : 0) * 0, tSlip: 3.0 });
    if (t > 0.4) stickMarks(g, t, R.hold.map(p => [hx + p[0] * 1.9, hy + p[1] * 1.9]), { alpha: 0.35 });
    if (slide > 0.05) for (let i = 0; i < 3; i++) seg(g, [[hx + 84, hy - 400 - i * 40], [hx + 84, hy - 300 - i * 40 - slide * 120]], 3, alpha('#ffffff', 0.25));   // squeaky slide streaks
  });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
} });

registerShot('demo_ceiling', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [0, 0], y: [-20, -30] }), ceilY = E.H * 0.1;
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#d8ccb8', '#b8a88c']); g.fillRect(-400, -400, E.W + 800, E.H + 800); g.fillStyle = '#efe8dc'; g.fillRect(-400, -400, E.W + 800, ceilY + 400);
    seg(g, [[-400, ceilY], [E.W + 400, ceilY]], 6, '#a8987c'); rr(g, E.W * 0.68, E.H * 0.18, 260, 300, 8); g.fillStyle = '#9ab8d8'; g.fill();
    rr(g, E.W * 0.3, E.H * 0.7, 700, 120, 20); g.fillStyle = '#3a5a8a'; g.fill(); rr(g, E.W * 0.32, E.H * 0.66, 160, 60, 20); g.fillStyle = '#f4f0e8'; g.fill();   // bed
    const peel = prog(t, 2.0, 3.0), D = drawCeiling(g, 'HERO', { t, x: E.W * 0.5, ceilY: ceilY + 10, s: 1.7, peel, dropTo: E.H * 0.52, expr: t < 2 ? 'surprised' : 'shocked', blink: blinkFlag(t, 3, 1), rim: RIM });
  });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
} });

registerShot('demo_silk', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.86, 0.9], x: [160, 200], y: [-560, -600] });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 });
  layer(g, cam, 1, (g) => {
    const o = { x: R.pos.roofX + 200, y: R.pos.roofY - 30, s: 1.9, facing: -1 }, pose = idle(poseAt(t, [[0, 'stand'], [0.4, 'crouch'], [1.4, { ...POSES.stand, eF: [24, -140], hF: [40, -120] }]]), t, 2);
    actor(g, 'HERO', { ...o, pose, expr: exprAt(t, [[0, 'determined'], [0.6, 'shocked'], [1.6, 'sheepish']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(0.5, 0.5), rim: R.rim, t });
    const a = silkAnchor(o, pose); silkPuff(g, t, 0.6, a[0], a[1], { dir: -1 });
    const low = ease.inOut(prog(t, 1.6, 4.0)), hand = [o.x - 40 * 1.9, o.y - 120 * 1.9], end = [hand[0] - 40, lerp(hand[1] + 40, R.GY - 80, low)];
    if (t > 1.3) { silkLine(g, hand, end, { t, sag: 4, k: 1 }); rr(g, end[0] - 40, end[1], 80, 60, 20); g.fillStyle = '#d4262e'; g.fill(); circle(g, end[0], end[1] + 10, 18, '#2a2230'); }   // Biscuit wrapped in the scarf
  });
  atmos(g, t, cam, { color: R.M.key });
} });

registerShot('demo_dodge', { draw(g, t, info) {
  const t0 = 1.5, cam = camMove(t, info.dur, { z: [1.1, 1.14], x: [-40, 0], y: [-60, -60] });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 }), D = dodge(t, t0 - 0.35, { side: -1, base: POSES.crossArms }), hx = R.CX - 200 + D.dx;
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: hx, y: R.GY + 20, s: 1.9, facing: -1, pose: idle(D.pose, t, 2), expr: exprAt(t, [[0, 'neutral'], [t0 - 0.3, 'smirk']]), blink: t > t0 - 0.3 && t < t0 + 1 ? true : blinkFlag(t, 3, 2), look: [0, 0], rim: R.rim, t });
    airHairs(g, t, hx - 10, R.GY + 20 - 206 * 1.9, clamp(1 - Math.abs(t - t0 + 0.2) / 0.6));
    actor(g, 'MINA', { x: R.CX + 700, y: R.GY + 20, s: 2.0, facing: -1, pose: idle(poseAt(t, [[0, { ...POSES.stand, eB: [-20, -150], hB: [-34, -190] }], [t0 - 0.5, 'point']]), t, 1), expr: exprAt(t, [[0, 'cheeky'], [t0 + 0.4, 'surprised']]), blink: blinkFlag(t, 2.9, 1), rim: R.rim, t });
    const u = prog(t, t0 - 0.5, t0 + 0.3), bx = lerp(R.CX + 620, R.CX - 420, u), by = R.GY - 470 - Math.sin(u * Math.PI) * 60 + u * 380;
    if (u < 1) { circle(g, bx, by, 34, '#3aa0e8'); circle(g, bx - 10, by - 12, 10, alpha('#ffffff', 0.6)); }
    else { const k = prog(t, t0 + 0.3, t0 + 1.2); for (let i = 0; i < 12; i++) { const a = -Math.PI + i / 11 * Math.PI; circle(g, R.CX - 420 + Math.cos(a) * 120 * k, R.GY + 10 + Math.sin(a) * 80 * k + 120 * k * k, 8 * (1 - k), alpha('#9ad0ff', 0.8 * (1 - k))); } g.fillStyle = alpha('#3a6a9a', 0.4); g.beginPath(); g.ellipse(R.CX - 420, R.GY + 30, 120 * k, 16, 0, 0, 7); g.fill(); }
  });
  atmos(g, t, cam, { color: R.M.key });
} });
