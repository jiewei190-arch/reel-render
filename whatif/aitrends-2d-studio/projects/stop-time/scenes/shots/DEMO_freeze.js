// DEMO_freeze.js — look-dev for sets/freeze.js (temporary demo_* ids, not bound to the voice). 16:9, classic What If style.
// The kitchen is home3's kitchen as a stand-in (H4 builds morning.js); the juice glass and butter dish are LOCAL placeholders (H2 owns props).
//   demo_fz_snap    cold open: Mina knocks the juice off, the hero SNAPS, the ripple spreads from his fingers and freezes the room; the juice hangs
//   demo_fz_frozen  snap 2's "beautiful" beat: juice beads, Dev mid-sneeze, Biscuit mid-leap at the butter; the hero walks in (warm, alive);
//                   unfreeze whoosh at 4.3 s, colour floods back from his hand and motion resumes
//   demo_fz_black   snap 1: total black, the quiet 1..10 count, then the room returns as a faint cool outline
//   demo_fz_air     snap 2: the hero walks into the WALL OF AIR: frozen N2/O2 pairs, the dented "mattress", squashed against it
//   demo_fz_hold    the giant face: cheeks puffed, can't breathe, molecules pressed up against him
import { E, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rr, seg, circle, poly, alpha, shade, glow, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { home3, home3Fg } from '../sets/home3.js';
import { actor, cat } from '../sets/actors.js';
import { idle, blinkFlag, blinkAmt, exprAt, camMove, walkAlong, lookToward } from '../sets/acting.js';
import { faceAt } from '../sets/faces.js';
import { FZ, frozenTime, freezeAt, snapPose, handWorld, snapBurst, snapRipple, freezeGrade, hangingDust, stillMark, frozenGlow, liquidArc, sneezeSpray, SNEEZE, SNEEZE_FACE,
  leapCat, blackView, countDots, airWall, PRESS, FACE_HOLD, puffCheeks, unfreezeWhoosh, heroST, heroBigFace } from '../sets/freeze.js';

// ---------- local placeholder props ----------
function juiceGlass(g, x, y, rot = 0, fill = 1) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = alpha('#d8f0ff', 0.45); g.beginPath(); g.moveTo(-22, -70); g.lineTo(22, -70); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); g.fill();
  if (fill > 0) { g.fillStyle = FZ.juice; g.beginPath(); g.moveTo(-21 + 3 * (1 - fill), -70 * fill + 6); g.lineTo(21 - 3 * (1 - fill), -70 * fill + 6); g.lineTo(17, -3); g.lineTo(-17, -3); g.closePath(); g.fill(); }
  g.strokeStyle = alpha('#ffffff', 0.85); g.lineWidth = 3; g.beginPath(); g.moveTo(-22, -70); g.lineTo(-18, 0); g.lineTo(18, 0); g.lineTo(22, -70); g.stroke();
  seg(g, [[-13, -60], [-11, -12]], 3, alpha('#ffffff', 0.7));
  g.restore();
}
function butterDish(g, x, y) {
  rr(g, x - 60, y - 12, 120, 14, 6); g.fillStyle = '#eef0f4'; g.fill();
  rr(g, x - 38, y - 40, 76, 30, 5); g.fillStyle = '#f6dc7a'; g.fill(); g.fillStyle = alpha('#ffffff', 0.5); g.fillRect(x - 32, y - 36, 40, 5);
  seg(g, [[x + 20, y - 40], [x + 64, y - 66]], 5, '#c8ccd4');                                                             // the knife
}
function stage(g, t, cam, ft, o = {}) {        // kitchen stand-in (motion clock ft so the wall clock + kettle steam stop when frozen)
  const H = home3(g, ft, cam, { room: 'kitchen', mood: 'day', plate: 0, cereal: 1, kcal: 0, steam: 0.6, lights: 0.6 });
  layer(g, cam, 1, (g) => { const tx = H.pos.tableX, tt = H.pos.tableTop; butterDish(g, tx + 120, tt - 14); rr(g, tx + 220, tt - 66, 40, 52, 8); g.fillStyle = alpha('#f2f2f2', 0.9); g.fill(); o.table?.(g, H); });
  return H;
}
const SPILL = { tS: 0.6, x: 640, y: 600 };
const SWEEP = { head: [8, -206], sh: [3, -173], hip: [0, -100], eF: [30, -150], hF: [64, -160], eB: [-7, -136], hB: [-9, -100], kF: [8, -50], fF: [10, 0], kB: [-6, -50], fB: [-14, 0] };       // the glass at the table's left edge, spill clock origin
function spill(g, t, tt, frozen, H) {               // glass falls + juice arc, both on the spill clock tt
  const u = Math.max(0, tt), rot = 1.7 * ease.out(prog(u, 0, 0.35)), gx = SPILL.x + 170 * u, gy = SPILL.y + 0.5 * 1500 * Math.max(0, u - 0.22) ** 2;
  if (tt <= 0) { juiceGlass(g, SPILL.x, SPILL.y, 0, 0.85); return; }
  liquidArc(g, t, { x0: SPILL.x + 14, y0: SPILL.y - 70, vx: 380, vy: -150, tt: u, kind: 'juice', n: 24, seed: 4, floor: H.GY - 4, frozen, s: 1.15 });
  juiceGlass(g, gx, gy, rot, Math.max(0.1, 0.85 - u * 1.4));
  if (frozen > 0.5) stillMark(g, gx + 26, gy - 70, 0.9, t, 2);
}

// ======================================================================= demo_fz_snap
registerShot('demo_fz_snap', { draw(g, t, info) {
  const tF = 1.15, ft = frozenTime(t, tF), tt = ft - SPILL.tS, fz = freezeAt(t, tF, 1e9, 0.5);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], x: [-10, 30] });
  const H = stage(g, t, cam, ft);
  const MINA = { x: 860, y: H.GY, s: 2.25, facing: -1 }, HERO_O = { x: 1290, y: H.GY, s: 1.95, facing: -1 };
  layer(g, cam, 1, (g) => {
    const mp = ft < SPILL.tS - 0.25 ? idle(POSES.stand, ft, 2) : SWEEP;   // her arm swept the glass, frozen there
    actor(g, 'MINA', { ...MINA, t: ft, pose: mp, expr: exprAt(ft, [[0, 'happy'], [SPILL.tS + 0.15, 'shocked']]), blink: t < tF && blinkFlag(t, 3.1, 4), look: lookToward(-0.6, 0.6), rim: H.rim });
    cat(g, { x: 1600, y: H.GY, s: 2.1, facing: -1, pose: 'sit', t: ft, eyes: ft > 0.9 ? 'wide' : 'auto', rim: H.rim });
    if (fz > 0.5) { stillMark(g, 830, H.GY - 400, 1.1, t, 1); stillMark(g, 1655, H.GY - 175, 0.9, t, 3); }
  });
  home3Fg(g, ft, cam, { room: 'kitchen' });
  layer(g, cam, 1, (g) => {
    const pose = idle(snapPose(t, tF), t, 1), hand = handWorld(HERO_O, pose);
    snapRipple(g, t, { x: hand[0], y: hand[1], t0: tF, dur: 0.75 });
    spill(g, t, tt, fz, H);                                       // the juice stays the colour accent of the frozen frame
    hangingDust(g, t, { at: tF, count: 60, seed: 7 });
    heroST(g, { ...HERO_O, t, pose, expr: exprAt(t, [[0, 'neutral'], [SPILL.tS + 0.2, 'shocked'], [tF + 0.5, 'awe']]), blink: blinkFlag(t, 3.4, 1), look: lookToward(-1, 0.3), rim: { color: '#fff1d6', dir: [-0.8, -0.5] } });
    snapBurst(g, t, { x: hand[0] - 6, y: hand[1] - 10, t0: tF, s: 1.1 });
  });
}});

// ======================================================================= demo_fz_frozen
registerShot('demo_fz_frozen', { draw(g, t, info) {
  const tU = 4.3, fz = 1 - prog(t, tU, tU + 0.6), mt = Math.max(0, t - tU), tt = 0.55 + mt;     // world motion resumes after the unfreeze
  const cam = camMove(t, info.dur, { z: [1.05, 1.12], x: [40, -10] });
  const H = stage(g, t, cam, 1.15 + mt);
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: 860, y: H.GY, s: 2.25, facing: -1, t: 1.15 + mt, pose: SWEEP, expr: 'shocked', blink: false, look: lookToward(-0.6, 0.6), rim: H.rim });
    // Dev mid-sneeze by the counter
    const dev = { x: 300, y: H.GY, s: 1.85, facing: 1 };
    frozenGlow(g, (g) => actor(g, 'DEV', { ...dev, t: 0, pose: SNEEZE, face: SNEEZE_FACE, blink: false, rim: H.rim }), { k: 0.6 * fz });
    const hd = handWorld(dev, SNEEZE, 'head');
    // Biscuit mid-leap off the fridge side, aiming at the butter
    const cx = 1230 - 520 * mt, cy = 470 + 900 * mt * mt;
    frozenGlow(g, (g) => leapCat(g, { x: cx, y: cy, s: 2.0, facing: -1, t, eyes: 'wide', rim: H.rim }), { k: 0.7 * fz });
    if (fz > 0.5) { stillMark(g, cx - 120, cy - 70, 1.1, t, 5); stillMark(g, hd[0] - 10, hd[1] - 60, 1, t, 6); stillMark(g, 830, H.GY - 400, 1, t, 7); }
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
  // the hero walks in, warm and alive, looking around
  const hx = lerp(1820, 1600, ease.out(prog(t, 0, 3.2))), wk = walkAlong(hx, 1.95, { facing: -1 }), walking = t < 3.2;
  const HO = { x: hx, y: H.GY, s: 1.95, facing: -1 };
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1, { clip: t < tU ? null : { x: HO.x - 60, y: H.GY - 330, r: 60 + 2400 * ease.out(prog(t, tU, tU + 0.7)) }, outside: t >= tU });
    hangingDust(g, t, { at: -1, until: tU, count: 70, seed: 9 });
    spill(g, t, tt, fz, H);
    { const hd = handWorld({ x: 300, y: H.GY, s: 1.85, facing: 1 }, SNEEZE, 'head'); sneezeSpray(g, { x: hd[0] + 34, y: hd[1] + 16, dir: 1, tt: 0.3 + mt * 2, s: 1.7, frozen: fz, t }); }
    const pose = walking ? wk.pose : idle(t < tU - 0.5 ? POSES.stand : snapPose(t, tU), t, 3);
    heroST(g, { ...HO, t, pose, expr: exprAt(t, [[0, 'awe'], [2.2, 'happy'], [tU - 0.2, 'smirk']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(-1, t < 1.6 ? -0.4 : 0.2), rim: { color: '#fff1d6', dir: [-0.8, -0.5] } });
    const hand = handWorld(HO, pose); snapBurst(g, t, { x: hand[0] - 6, y: hand[1] - 10, t0: tU, s: 1 }); unfreezeWhoosh(g, t, { x: hand[0], y: hand[1], t0: tU, dur: 0.7 });
  });
}});

// ======================================================================= demo_fz_black
registerShot('demo_fz_black', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04] }), ghostA = 0.3 * ease.inOut(prog(t, 3.3, 4.6));
  const ghost = (g) => {
    const H = home3(g, 1.15, cam, { room: 'kitchen', mood: 'day', plate: 0, cereal: 1, kcal: 0, steam: 0, lights: 0.6 });
    layer(g, cam, 1, (g) => { spill(g, t, 0.55, 0, H); actor(g, 'MINA', { x: 860, y: H.GY, s: 2.25, facing: -1, pose: SWEEP, expr: 'shocked', rim: false });
      heroST(g, { x: 1290, y: H.GY, s: 1.95, facing: -1, pose: snapPose(2, 1.15), expr: 'shocked', rim: false }); });
  };
  backdropBlack(g);
  blackView(g, t, { k: 1, ghost, ghostA, count: { t0: -5.4, x: E.W / 2, y: E.H * 0.84, r: 62 } });
}});
function backdropBlack(g) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); }

// ======================================================================= demo_fz_air
registerShot('demo_fz_air', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.1], x: [-30, 40] });
  const H = stage(g, t, cam, 1.15);
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: 1560, y: H.GY, s: 1.85, facing: -1, t: 0, pose: SNEEZE, face: SNEEZE_FACE, blink: false, rim: H.rim });
    cat(g, { x: 1740, y: H.GY, s: 2.0, facing: -1, pose: 'arch', t: 0, eyes: 'wide', rim: H.rim });
  });
  home3Fg(g, 1.15, cam, { room: 'kitchen' });
  const hit = 1.0, sq = ease.out(prog(t, hit, hit + 0.25)) - 0.4 * ease.inOut(prog(t, hit + 0.25, hit + 0.8));        // squash in, settle
  const hx = lerp(640, 830, ease.inOut(prog(t, 0, hit))), HO = { x: hx, y: H.GY, s: 2.05, facing: 1 };
  const press = { x: 1012 + sq * 18, y: H.GY - 380, r: 250, depth: 0.25 + 0.6 * sq };
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1);
    hangingDust(g, t, { at: -1, count: 50, seed: 3 });
    const pose = t < hit ? walkAlong(hx, 2.05, { facing: 1 }).pose : idle(PRESS, t, 2);
    g.save(); g.translate(hx, H.GY); g.scale(1 - 0.08 * sq, 1 + 0.03 * sq); g.translate(-hx, -H.GY);
    heroST(g, { ...HO, t, pose, expr: exprAt(t, [[0, 'neutral'], [hit, 'shocked'], [hit + 1.4, 'nervous']]), blink: blinkFlag(t, 3.2, 5), look: lookToward(1, 0), rim: { color: '#fff1d6', dir: [-0.8, -0.5] } });
    g.restore();
    airWall(g, t, { k: ease.out(prog(t, 0.2, 1.2)), x: 940, press: t > hit ? press : null, seed: 21, density: 1.1 });
    if (t > hit) { const r2 = ease.out(prog(t, hit, hit + 0.4)); for (let i = 0; i < 3; i++) { g.strokeStyle = alpha('#ffffff', 0.7 * (1 - r2)); g.lineWidth = 3; g.beginPath(); g.arc(press.x, press.y, 60 + r2 * (120 + i * 60), -0.9, 0.9); g.stroke(); } }
  });
}});

// ======================================================================= demo_fz_hold
registerShot('demo_fz_hold', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [0, 20] });
  blurLayer(g, 10, (g) => { stage(g, t, { z: 1.3, x: 120, y: -40 }, 1.15); }, null, 1);
  freezeGrade(g, 1);
  layer(g, cam, 1, (g) => {
    const f = faceAt(t, [[0, 'shocked'], [0.6, FACE_HOLD], [2.2, { ...FACE_HOLD, eye: 0.95, tilt: -0.9, look: [0.2, -0.3] }]]), puff = ease.outBack(prog(t, 0.55, 0.9));
    const cx = 780, cy = 590, r = 300, sq = 0.04 * puff;
    g.save(); g.translate(cx, cy); g.scale(1 - sq, 1 + sq * 0.5); g.translate(-cx, -cy);
    heroBigFace(g, cx, cy, r, { f, blink: blinkAmt(t, 3.0, 2), rimColor: '#cfeaff', rimSide: 1, tilt: -0.05 });
    puffCheeks(g, cx, cy, r, puff, { tilt: -0.05 });
    g.restore();
    airWall(g, t, { k: 1, x: 1010, press: { x: 1090, y: cy - 10, r: 320, depth: 0.5 }, seed: 33, density: 1.4 });
  });
  countDots(g, t, { t0: -2.2, x: E.W * 0.86, y: E.H * 0.2, r: 44 });
}});
