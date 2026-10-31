// C_s062_s064_day4.js — ep 4 batch C part 2: DAY 4 THE HAIRS (Mina's water balloon, the dodge without looking, "You felt the air move").
// LEGAL: airHairs is the only sensing visual (no text, no tingle lines); no franchise anything.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, seg, circle, rr, alpha, glow, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { garden, gardenFg } from '../sets/garden.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { airHairs, dodge, gloves } from '../sets/spider.js';
import { waterBalloon, balloonArc, splash, dayCard } from '../sets/spiderprops.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, fade } from './C_lib.js';

// a small green watering can held at (x, y), spout to +f; water dribbles when pour > 0
function wateringCan(g, t, x, y, f = 1, pour = 1) {
  g.save(); g.translate(x, y); g.scale(f, 1); g.rotate(0.25 * pour);
  rr(g, -40, -10, 80, 60, 12); g.fillStyle = '#3f8f4a'; g.fill(); g.strokeStyle = '#1e4a26'; g.lineWidth = 3; g.stroke();
  seg(g, [[36, 20], [96, -20]], 9, '#3f8f4a'); rr(g, 90, -32, 20, 22, 5); g.fillStyle = '#2f7a3a'; g.fill();
  g.strokeStyle = '#1e4a26'; g.lineWidth = 6; g.beginPath(); g.arc(-6, -10, 30, Math.PI, Math.PI * 2); g.stroke();
  g.restore();
  if (pour > 0) for (let i = 0; i < 6; i++) { const u = (t * 2.2 + i / 6) % 1; circle(g, x + f * (112 + u * 24), y - 8 + u * 120, 4, alpha('#9ad0ff', 0.8 * (1 - u))); }
}

// s062 DAY 4 - THE HAIRS: he waters the flower bed; Mina tiptoes up behind him with a water balloon
registerShot('s062', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [0, 20], y: [-10, -20], drift: 0.4 });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' }), GY = G.GY, tM = wt(info, 'Mina', 1.63), tW = wt(info, 'water', 3.15);
  const hx = E.W * 0.66, mx = lerp(E.W * 0.12, E.W * 0.4, ease.inOut(prog(t, tM - 0.2, info.dur - 0.2)));
  layer(g, cam, 1, (g) => {
    const hp = idle({ ...POSES.holdFront, hF: [40, -128], eF: [24, -140] }, t, 2);
    actor(g, 'HERO', { x: hx, y: GY + 10, s: 1.9, facing: 1, pose: hp, expr: 'happy', blink: blinkFlag(t, 3.2, 2), look: lookToward(1, 0.6), rim: G.rim, t });
    gloves(g, { x: hx, y: GY + 10, s: 1.9, facing: 1 }, hp, { t });
    wateringCan(g, t, hx + 40 * 1.9 + 20, GY + 10 - 128 * 1.9 + 20, 1, 1);
    if (t > tM - 0.3) {
      const W = walkAlong(mx * 0.45, 2.0, { kid: true }).pose, tip = { ...W, fF: [W.fF[0], W.fF[1] - 10], fB: [W.fB[0], W.fB[1] - 10] };
      const up = ease.out(prog(t, tW - 0.3, tW)), pose = up > 0 ? { ...tip, eF: [10, -190], hF: [8, -236], eB: [-6, -188], hB: [-2, -236] } : { ...tip, eF: [20, -150], hF: [30, -126], eB: [12, -150], hB: [22, -124] };
      actor(g, 'MINA', { x: mx, y: GY + 30, s: 2.0, facing: 1, pose, expr: exprAt(t, [[0, 'cheeky']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(1, -0.1), rim: G.rim, t });
      const by = lerp(GY + 30 - 126 * 2 * 0.72 - 10, GY + 30 - 236 * 2 * 0.72 - 40, up); waterBalloon(g, mx + lerp(30, 6, up) * 2 * 0.72, by, 1.1, { t, wobble: 1 });
    }
  });
  gardenFg(g, t, cam, { view: 'garden' });
  const out = 1 - prog(t, 1.4, 1.75); fade(g, out, () => dayCard(g, t, { day: 4, title: 'THE HAIRS', at: wt(info, 'Day', 0.17), y: E.H * 0.4 }));
  atmos(g, t, cam, { color: G.M.key });
} });

// s063 THE DODGE: he steps aside without looking, the balloon bursts where he stood
registerShot('s063', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.04, 1.08], x: [0, 10], y: [-30, -40], drift: 0.4 });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' }), GY = G.GY, tS = wt(info, 'step', 0.41), tA = wt(info, 'aside', 0.63);
  const D = dodge(t, tS, { side: 1, base: POSES.crossArms }), step = ease.out(prog(t, tS, tS + 0.25)), hx = E.W * 0.6 + 170 * step + D.dx;
  const hitX = E.W * 0.6, B = balloonArc(t, { from: [E.W * 0.22, GY - 300], to: [hitX, GY + 10], at: 0.0, dur: tA, h: 140 });
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: hx, y: GY + 10, s: 1.9, facing: -1, pose: idle(D.pose, t, 2), expr: exprAt(t, [[0, 'neutral'], [tS - 0.1, 'smirk']]), blink: t > tS - 0.15 ? true : blinkFlag(t, 3, 2), look: [0, 0], rim: G.rim, t });
    gloves(g, { x: hx, y: GY + 10, s: 1.9, facing: -1 }, D.pose, { t });
    airHairs(g, t, hx + 4, GY + 10 - 196 * 1.9, clamp(1 - Math.abs(t - tS) / 0.5));
    actor(g, 'MINA', { x: E.W * 0.16, y: GY + 30, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, { ...POSES.point, hF: [40, -200] }], [0.4, 'stand'], [tA + 0.15, 'handsOnHead']]), t, 1), expr: exprAt(t, [[0, 'cheeky'], [tA + 0.1, 'surprised']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(1, 0), rim: G.rim, t });
    if (!B.done) waterBalloon(g, B.x, B.y, 1.1, { t, rot: B.rot });
    splash(g, t, hitX, GY + 10, { at: tA, dir: 0.2 });
  });
  gardenFg(g, t, cam, { view: 'garden' });
  atmos(g, t, cam, { color: G.M.key });
} });

// s064 GIANT FACE HERO: eyes closed, calm and smug; the neck hairs bristle and soft air swirls on 'air'
registerShot('s064', { draw(g, t, info) {
  const tA = wt(info, 'air', 0.75), z = lerp(1, 1.05, ease.inOut(t / info.dur));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#9cc4ea', '#d8ecd0', '#7aa860']); g.fillRect(0, 0, E.W, E.H);
  glow(g, E.W * 0.2, E.H * 0.15, 900, '#fff4d0', 0.35);
  for (let i = 0; i < 9; i++) { const u = (t * 0.35 + i / 9) % 1, x = E.W * (0.08 + (i * 0.13) % 0.9), y = E.H * (0.1 + u * 0.8); circle(g, x, y, 6 + (i % 3) * 3, alpha('#cfe8ff', 0.4 * Math.sin(u * Math.PI))); }   // droplets drifting past behind
  const cx = E.W * 0.5, cy = E.H * 0.56, r = 330 * z;
  const f = faceAt(t, [[0, 'smirk'], [tA, { eye: 0.72, brow: 0.5, tilt: 0.1, smile: 0.8, asym: 0.5, w: 1.05, blush: 0.5 }]]);
  giantFace(g, cx, cy, r, { who: 'HERO', f, blink: 1, rimSide: -1, rimColor: '#fff0c8', breath: Math.sin(t * 2.4), tilt: lerp(0.02, -0.02, ease.inOut(t / info.dur)) });
  // airHairs at giant scale around the head + down the neck
  const k = ease.out(prog(t, tA - 0.15, tA + 0.3));
  if (k > 0.01) for (let i = 0; i < 4; i++) { const R = r * (1.18 + i * 0.12) + Math.sin(t * 3 + i) * 6, a0 = Math.PI * (1.05 + i * 0.06) + Math.sin(t * 1.3 + i) * 0.1, a1 = a0 + Math.PI * 0.55 * k;
    g.strokeStyle = alpha('#ffffff', 0.75 - i * 0.12); g.lineWidth = 7 - i; g.lineCap = 'round'; g.beginPath(); for (let a = a0; a <= a1; a += 0.03) { const wv = Math.sin(a * 10 + t * 7 + i) * 9, px = cx + Math.cos(a) * (R + wv) + i * 30 - 40, py = cy - r * 0.1 + Math.sin(a) * (R + wv) * 0.9; a === a0 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
} });
