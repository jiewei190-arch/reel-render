// C_s069_s076_snap4_clock.js — batch C (H3): Biscuit's long cold look, SNAP 4 (ten quiet seconds), time restarts, the KITCHEN CLOCK sticks,
// giant face HERO, it ticks, ticks again, normal. Sets: morning.js (H4) kitchen, stopprops.js (H2) bin / wallClock / stopwatch,
// LOCAL snap / freezeGrade / unfreeze (C_lib.js; freeze.js had not landed). LEGAL: original; the power is only the finger snap.
import { E, registerShot, layer, ease, prog, clamp, lerp, glow, circle, seg, alpha, blurLayer, veil } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { cat } from '../sets/creatures.js';
import { camMove, poseAt, exprAt, lookToward } from '../sets/acting.js';
import { faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { bin, wallClock } from '../sets/stopprops.js';
import { hero, heroFace, kitchen, cast3, cocoa, snapHand, snapRing, freezeGrade, unfreeze, readout, goldPop, creamChip, blinkF, morningFg } from './C_lib.js';

const SIT = { ...POSES.sit }, SITBACK = { ...POSES.sitBack, hF: [20, -128], eF: [10, -112] };   // sitBack holding the mug up
const heroSeat = (P) => P.heroSeatX + 60;

// s069 THE LONG, COLD LOOK
registerShot('s069', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.22, 1.32], drift: 0.4 }), x: lerp(300, 360, ease.inOut(t / info.dur)), y: 140 }, M = kitchen(g, t, cam, { cocoa: 0.6 }), P = M.pos, GY = M.GY;
  const bx = P.fridgeX + 30, by = GY + 40, bs = 0.62, top = by - 360 * bs;
  const jump = prog(t, 0.47, 1.25), floorX = bx - 250;
  layer(g, cam, 1, (g) => {
    hero(g, { x: P.tableX + 260, y: GY + 40, facing: 1, pose: poseAt(t, [[0, 'crouch'], [2.9, 'kneel']]), expr: exprAt(t, [[0, 'surprised'], [2.97, 'nervous']]), blink: blinkF(t, 3.3, 1), look: lookToward(1, t < 1.3 ? -0.4 : 0.15), rim: { color: M.rim, dir: [-1, -0.4] }, t });
    bin(g, bx, by, bs, { lid: t < 0.47 ? 0.5 : 0.9, wobble: clamp(1 - Math.abs(t - 0.5) * 2), cat: t < 0.47 ? 1 : 0, t });
    if (t >= 0.47) {
      const k = ease.inOut(jump), x = lerp(bx, floorX, k), y = lerp(top + 10, GY + 40, k) - Math.sin(k * Math.PI) * 120, sit = t > 1.3;
      cat(g, { x, y, s: 1.8, facing: -1, pose: sit ? 'sit' : 'stand', eyes: t > 2.17 ? 'offended' : 'open', t, tilt: sit ? -0.06 : -0.25 + k * 0.2, rim: { color: M.rim, dir: [-1, -0.4] } });
      // the paper napkin stuck on one ear
      const hx = x - 52, hy = y - (sit ? 150 : 96); g.save(); g.translate(hx, hy); g.rotate(-0.5 + Math.sin(t * 3) * 0.04); g.fillStyle = '#f6f2ea'; g.beginPath(); g.moveTo(-14, -6); g.lineTo(18, -16); g.lineTo(22, 12); g.lineTo(-10, 16); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke(); g.restore();
    }
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });

// s070 FOURTH SNAP — TEN QUIET SECONDS
registerShot('s070', { draw(g, t, info) {
  const SN = 0.39, cut = 0.62, R = ease.in(prog(t, SN + 0.05, cut + 0.25)) * 2300;
  const wide = (g) => {
    const cam = camMove(t, info.dur, { z: [1.02, 1.05], drift: 0 }), M = kitchen(g, t, cam, { cocoa: 0, sec: 31, stick: 0 }), P = M.pos;
    layer(g, cam, 1, (g) => { cast3(g, t, M, { frozen: true, minaPose: { ...POSES.sit, hF: [30, -128], eF: [22, -110] }, devPose: POSES.phone }); });
    morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
    freezeGrade(g, ease.inOut(prog(t, SN, SN + 0.4)), t);
    layer(g, cam, 1, (g) => { const p = poseAt(t, [[0, 'sit'], [0.9, SITBACK]]); hero(g, { x: heroSeat(P), y: M.GY, facing: -1, pose: p, expr: t > 1.0 ? 'smile' : 'neutral', blink: blinkF(t, 2.6, 2), look: lookToward(-1, -0.2), rim: { color: '#ffd9a0', dir: [1, -0.5] }, t });
      const s = 1.9, hx = heroSeat(P) - p.hF[0] * s, hy = M.GY + p.hF[1] * s; cocoa(g, t, hx - 10, hy + 26, 0.75, 'frozen'); });
  };
  if (t < cut + 0.25) {   // the hand close-up on a soft kitchen, then the ripple opens onto the frozen wide
    blurLayer(g, 10, (g) => kitchen(g, t, { z: 1.5, x: 300, y: -60, r: 0 }, { sec: 31 })); veil(g, '#1a1020', 0.25);
    const tip = snapHand(g, t, SN, E.W * 0.5, E.H * 0.6, 1.25);
    if (t > SN) { g.save(); g.beginPath(); g.arc(tip[0], tip[1], R, 0, 7); g.clip(); wide(g); g.restore(); }
    snapRing(g, t, SN, tip[0], tip[1]);
  } else { wide(g); snapRing(g, t, SN, E.W * 0.45, E.H * 0.38); }
  chip(g, t, { str: 'SNAP 4', at: 0.19, x: E.W * 0.17, y: E.H * 0.12, tone: 'gold' });
  const sec = 10 * ease.inOut(prog(t, 0.62, 2.09));
  if (t > 0.45) readout(g, t, sec, { land: 2.09, running: t < 2.09 });
  goldPop(g, t, '10', 1.59, E.W * 0.5, E.H * 0.2, 150 + 30 * Math.max(0, Math.sin((t - 1.59) * 9)) * (t < 2.09 ? 1 : 0), { scale: t > 2.09 ? 1.12 : 1 });
} });

// s071 TIME RESTARTS
registerShot('s071', { draw(g, t, info) {
  const U0 = 0.35, cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.4 }), fr = t < U0, M = kitchen(g, t, cam, { sec: fr ? 31 : 31 + Math.floor(t - U0 + 1), cocoa: 0 }), P = M.pos;
  layer(g, cam, 1, (g) => cast3(g, t, M, { frozen: fr, minaPose: fr ? { ...POSES.sit, hF: [30, -128], eF: [22, -110] } : poseAt(t, [[0, { ...POSES.sit, hF: [30, -128], eF: [22, -110] }], [0.6, 'sit']]), wobble: 1 }));
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
  freezeGrade(g, 1 - ease.inOut(prog(t, U0, U0 + 0.35)), t);
  layer(g, cam, 1, (g) => { hero(g, { x: heroSeat(P), y: M.GY, facing: -1, pose: SITBACK, expr: 'smile', blink: blinkF(t, 2.6, 2), look: lookToward(-1, -0.1), rim: { color: M.rim, dir: [1, -0.5] }, t });
    const s = 1.9; cocoa(g, t, heroSeat(P) - SITBACK.hF[0] * s - 10, M.GY + SITBACK.hF[1] * s + 26, 0.75, fr ? 'frozen' : clamp((t - U0) * 2)); });
  unfreeze(g, t, U0);
  readout(g, t, 10, { alpha: 1 - prog(t, 0.4, 0.8), running: 0 });
} });

// s072 YOU GLANCE UP AT THE KITCHEN CLOCK
registerShot('s072', { draw(g, t, info) {
  const tilt = ease.inOut(prog(t, 0.45, 1.5)), cam = { ...camMove(t, info.dur, { z: [1.25, 1.3], drift: 0.3 }), x: 260, y: lerp(120, -330, tilt) };
  const M = kitchen(g, t, cam, { sec: 40 + Math.floor(t), cocoa: 1 }), P = M.pos;
  layer(g, cam, 1, (g) => hero(g, { x: heroSeat(P), y: M.GY, facing: -1, pose: SIT, expr: t > 0.27 ? 'thinking' : 'smile', blink: blinkF(t, 2.8, 1), look: t < 0.2 ? lookToward(-1, 0.1) : lookToward(t < 0.27 ? -0.2 : 0.35, -0.95), rim: { color: M.rim, dir: [1, -0.5] }, t }));
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });

// s073 THE SECOND HAND DOESN'T MOVE
registerShot('s073', { draw(g, t, info) {
  blurLayer(g, 12, (g) => kitchen(g, t, { z: 1.6, x: 360, y: -420, r: 0 }, { sec: 42, clockR: 1 }));
  veil(g, '#0c0a14', 0.3);
  const z = 1 + 0.03 * ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  wallClock(g, t, { x: E.W / 2, y: E.H / 2 + 10, r: 400, h: 7.72, sec: t < 0.15 ? 42 : 43, stick: clamp((t - 0.6) * 1.5) });
  g.restore();
  const gr = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.35, E.W / 2, E.H / 2, E.H * 0.85); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${0.55 * prog(t, 0.3, 1.6)})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
} });

// s074 GIANT FACE HERO, HEART JUMPS
registerShot('s074', { draw(g, t, info) {
  blurLayer(g, 10, (g) => kitchen(g, t, { z: 1.3, x: 200, y: -200, r: 0 }, { sec: 43 }));
  veil(g, '#1a1020', 0.18);
  const J = 0.52, pz = 1 + 0.08 * ease.outBack(prog(t, J, J + 0.18)) - 0.03 * prog(t, J + 0.2, 1.5), sh = t > J && t < J + 0.35 ? 2 * Math.sin(t * 90) * 4 : 0;
  g.save(); g.translate(E.W / 2 + sh, E.H / 2 + sh * 0.6); g.scale(pz, pz); g.translate(-E.W / 2, -E.H / 2);
  heroFace(g, E.W / 2, E.H * 0.47, 330, faceAt(t, [[0, 'neutral'], [0.26, 'shocked'], [0.52, 'worried']]), { rimColor: '#ffc68a', rimSide: 1, reflect: 1, look: [0.3, -0.5] });
  g.restore();
  if (t > 0.26) { const p = 1 - clamp((t - 0.26) / 0.5); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W / 2, E.H * 0.9, 600, '#ff6a6a', 0.25 * p); g.restore(); }
} });

// s075 IS IT STILL FROZEN? THEN IT TICKS
registerShot('s075', { draw(g, t, info) {
  const TK = 2.17, cam = { ...camMove(t, info.dur, { z: [1.32, 1.36], drift: 0.3 }), x: 60, y: 140 };
  const M = kitchen(g, t, cam, { sec: 43, cocoa: 1 }), P = M.pos;
  layer(g, cam, 1, (g) => {
    cast3(g, t, M, { dev: false, blinkAt: 0.95, minaLook: [1, 0.1], minaExpr: 'happy' });
    hero(g, { x: heroSeat(P), y: M.GY, facing: -1, pose: SIT, expr: 'worried', blink: blinkF(t, 2.9, 2), look: t < 0.35 ? lookToward(0.4, -0.9) : lookToward(-1, 0.05), rim: { color: M.rim, dir: [1, -0.5] }, t });
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
  if (t < TK) veil(g, '#202838', 0.08);   // the room feels held (no sound)
  blurLayer(g, 4, (g) => wallClock(g, t, { x: E.W * 0.87, y: E.H * 0.2, r: 230, h: 7.72, sec: t < TK ? 43 : 44, stick: t < TK ? 0.6 : 0 }));
  if (t > TK) { const p = 1 - clamp((t - TK) / 0.4); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W * 0.87 + 80, E.H * 0.2 - 160, 90, '#ffd23c', 0.9 * p); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; seg(g, [[E.W * 0.87 + 80 + Math.cos(a) * 20, E.H * 0.2 - 160 + Math.sin(a) * 20], [E.W * 0.87 + 80 + Math.cos(a) * (30 + 40 * (1 - p)), E.H * 0.2 - 160 + Math.sin(a) * (30 + 40 * (1 - p))]], 4, alpha('#ffd23c', p)); } g.restore(); }
} });

// s076 AND TICKS AGAIN. NORMAL.
registerShot('s076', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.3, 1.33], drift: 0.2 }), x: 240, y: 60 };
  blurLayer(g, 7, (g) => { const M = kitchen(g, t, cam, { sec: 44, cocoa: 1, clockR: 1 }), P = M.pos;
    layer(g, cam, 1, (g) => hero(g, { x: heroSeat(P), y: M.GY, facing: -1, pose: poseAt(t, [[0, 'sit'], [1.6, SITBACK]]), expr: t > 1.65 ? 'smile' : 'worried', blink: blinkF(t, 2.7, 1), look: lookToward(-0.6, -0.6), rim: { color: M.rim, dir: [1, -0.5] }, t })); });
  const sec = 44 + (t > 0.26 ? 1 : 0) + (t > 1.38 ? 1 : 0) + (t > 2.38 ? 1 : 0) + (t > 3.38 ? 1 : 0);
  wallClock(g, t, { x: E.W * 0.36, y: E.H * 0.5, r: 330, h: 7.72, sec });
  creamChip(g, t, 'NORMAL', 1.65, E.W * 0.36, E.H * 0.88);
} });
