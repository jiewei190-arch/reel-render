// B_s033_s039_block.js — batch B: day 6, the five-storey block (16 m), RULE 2, the fall stats, planning the landings, the gadget montage.
// The 5-storey block is a local prop (B_lib.block5). Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, rr, poly, linGrad, shade, mix, rng, text, FONTS } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { street, streetFg, streetGround } from '../sets/street.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { chip, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, impactFrame, jumpShake, jumpCam } from '../sets/jump.js';
import * as BP from '../sets/bp.js';
import { U, wt, dayHud, meterHud, block5, STOREY, trampoline, poolBack, pool, haystack, PH } from './B_lib.js';

const CX = E.W / 2, BX = CX + 600;                                     // the block's centre x on the street
const JH = 16 * U;
const MARKS = [['HIGH JUMP', 2.45], ['POLE VAULT', 6.31], ['4 STOREYS', 12.8], ['5 STOREYS', 16], ['NIAGARA', 51]];
// pre-fill the frame with the dusk sky so a big tilt never shows an edge
const skyFill = (g, M) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, [M.sky[0], M.sky[0]]); g.fillRect(0, 0, E.W, E.H); };
const streetBlock = (g, t, cam, o = {}) => { const S0 = street(g, t, cam, { mood: o.mood || 'dusk', power: 1 }); layer(g, cam, 1, (g) => block5(g, t, BX, S0.GY, { lit: 0.5 })); return S0; };

// s033 — the 5-storey block: DAY 05 -> 06, the camera tilts up the facade as the meter climbs to 16 m; "5 storeys" chip
registerShot('s033', { draw(g, t, info) {
  const tDay = wt(info, 'day', 0.15), tSix = wt(info, 'sixteen', 1.09), tFive = wt(info, 'five', 2.69, 2.0);
  const tl = ease.inOut(prog(t, tDay + 0.6, info.dur - 0.2)), cam = { z: lerp(0.74, 0.7, tl), x: lerp(160, 560, tl) + Math.sin(t * 0.5) * 6, y: lerp(-300, -3300, tl) + Math.cos(t * 0.6) * 4 };
  const S0 = streetBlock(g, t, cam), hx = BX - 460;
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: hx, y: S0.GY + 10, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tDay + 0.5, 'lookUp']]), t, 3), expr: exprAt(t, [[0, 'neutral'], [tSix, 'awe'], [tFive, 'smirk']]), blink: blinkFlag(t, 3.4, 3), look: lookToward(0.4, -1), rim: S0.rim, t });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
  dayHud(g, t, info, 5, 6, tDay);
  meterHud(g, t, info, { v0: 8, v1: 16, t0: tSix, marks: MARKS });
  chip(g, t, { str: '5 storeys', at: tFive, x: E.W * 0.3, y: E.H * 0.86, dur: info.dur - 0.05 });
} });

// s034 — THE 16 m JUMP: launch on "Jumping", up past the balconies, thumbs up at the roof line on "fine"; on "But falling" the drop starts, red zone
registerShot('s034', { draw(g, t, info) {
  const tJ = wt(info, 'jumping', 0.15), tFine = wt(info, 'fine', 0.79), tBut = wt(info, 'but', 1.63, 1.0), tFall = wt(info, 'falling', 1.75, 1.0);
  const t0 = tJ + 0.12, opt = { crouch: 0.2, up: tFine - 0.1 - t0, hang: tBut + 0.05 - (tFine - 0.1), down: 1.7 }, J = jumpPose(t, t0, JH, opt), T = J.times, hx = BX - 380;
  const cam = jumpCam(t, t0, JH, { ...opt, z: 0.86, x: hx - CX + 120 + 300 * clamp(J.lift / JH * 1.5), y: -200, follow: 0.92, lag: 0.12, zoomOut: 0.12, shake: 0 });
  const S0 = streetBlock(g, t, cam);
  layer(g, cam, 1, (g) => {
    jumpFX(g, t, J, { x: hx, gy: S0.GY + 10, s: 1.9, landing: 'soft', dustColor: '#d8c8b8', dustSize: 1.3 });
    let JJ = J; if (J.phase === 'apex') JJ = { ...J, pose: { ...J.pose, eF: [26, -158], hF: [46, -188] } };       // thumbs up at the roof line
    const fig = jumper(g, 'HERO', JJ, { x: hx, gy: S0.GY + 10, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'determined'], [t0, 'joy'], [tFine, 'smirk'], [tFall, 'shocked']]), blink: blinkFlag(t, 3.3, 6), look: t > tBut ? lookToward(0.2, 1) : lookToward(1, -0.2), rim: S0.rim, t });
    if (J.phase === 'apex') { const fx = hx + 46 * 1.9 * J.sx, fy = S0.GY + 10 - J.lift - 188 * 1.9; circle(g, fx, fy, 15, '#2a1e1a'); seg(g, [[fx, fy - 8], [fx, fy - 34]], 11, '#2a1e1a'); }
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
  meterHud(g, t, info, { value: 16 * J.lift / JH, marks: MARKS, danger: t > tBut ? 12.8 : undefined });
  if (t > tBut) { const k = ease.out(prog(t, tBut, tBut + 0.3)); g.save(); g.globalAlpha = 0.18 * k * (0.7 + 0.3 * Math.sin(t * 12)); g.fillStyle = S().ui.accent; g.fillRect(0, 0, 24, E.H); g.fillRect(E.W - 24, 0, 24, E.H); g.restore(); }
} });

// s035 — RULE 2 card over the dimmed block at dusk, a hero silhouette frozen mid-fall behind the banner
registerShot('s035', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.78, 0.8], x: [140, 170], y: [-1900, -1960] });
  ruleCard(g, t, info, { n: 2, title: "GRAVITY DOESN'T CARE HOW YOU GOT UP THERE.", bg: (g, t) => {
    blurLayer(g, 8, (g) => { const S0 = street(g, t, cam, { mood: 'dusk', power: 1 }); layer(g, cam, 1, (g) => block5(g, t, BX, S0.GY, { lit: 0.5 })); }, null, 1);
    veil(g, '#120a1c', 0.3);
    g.save(); g.translate(E.W * 0.77, E.H * 0.34 + t * 6); g.rotate(-0.25); actor(g, 'HERO', { x: 0, y: 0, s: 1.4, facing: -1, pose: POSES.fall, expr: 'scared', flat: true, alpha: 0.55, t }); g.restore();
    for (let i = 0; i < 10; i++) seg(g, [[E.W * 0.74 + i * 14, E.H * 0.02 + (i % 3) * 30], [E.W * 0.74 + i * 14, E.H * 0.18 + (i % 3) * 30]], 3, alpha('#fff6e6', 0.25));
  } });
} });

// s036 — BLUEPRINT "FIG 2 - FALL HEIGHT": a 5-storey building in line art, a chart icon on "Doctors", the gold 4-storey line on "four"
registerShot('s036', { draw(g, t, info) {
  const tDoc = wt(info, 'doctors', 0.15), tFour = wt(info, 'four', 1.17), tUp = wt(info, 'up', 1.99, 1.6, true);
  const z = 1 + 0.035 * ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2);
  BP.board(g, t, { title: 'HOW HIGH IS TOO HIGH?', fig: 'FIG 2 - FALL HEIGHT' });
  const ui = S().ui, bx = E.W * 0.38, base = E.H * 0.86, w = 380, sh = 128, top = base - 5 * sh, dk = ease.out(prog(t, 0.0, 0.9));
  BP.draw(g, [[bx - w / 2, base], [bx - w / 2, top], [bx + w / 2, top], [bx + w / 2, base]], dk, { w: 5 });
  seg(g, [[bx - w / 2 - 120, base], [bx + w / 2 + 520, base]], 4, alpha(ui.blueprint, 0.8));
  for (let i = 1; i < 5; i++) BP.draw(g, [[bx - w / 2, base - i * sh], [bx + w / 2, base - i * sh]], prog(t, 0.2 + i * 0.12, 0.5 + i * 0.12), { w: 2.5, color: alpha(ui.blueprint, 0.7) });
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const a = prog(t, 0.4 + i * 0.1, 0.7 + i * 0.1); if (a > 0) { g.strokeStyle = alpha(ui.blueprint, 0.6 * a); g.lineWidth = 2; g.strokeRect(bx - w / 2 + 40 + j * 110, base - (i + 1) * sh + 30, 70, 64); } text(g, String(i + 1), bx - w / 2 - 40, base - (i + 0.5) * sh, { size: 34, color: alpha(ui.blueprint, 0.9 * a), font: FONTS.ui, weight: 900 }); }
  // the gold dashed 4-storey line + label
  const lk = ease.out(prog(t, tFour, tFour + 0.4)); if (lk > 0) { g.save(); g.setLineDash([22, 14]); g.lineDashOffset = -t * 40; seg(g, [[bx - w / 2 - 80, base - 4 * sh], [lerp(bx - w / 2 - 80, bx + w / 2 + 460, lk), base - 4 * sh]], 6, ui.gold); g.restore(); glow(g, bx + w / 2, base - 4 * sh, 260, ui.gold, 0.15 * lk);
    text(g, '4 STOREYS', bx + w / 2 + 300, base - 4 * sh + 54, { size: 56, color: ui.gold, font: FONTS.ui, weight: 900, alpha: lk, glow: 10, glowColor: alpha(ui.gold, 0.6) });
    text(g, 'about 12 m', bx + w / 2 + 300, base - 4 * sh + 112, { size: 38, color: ui.gold, font: FONTS.ui, weight: 900, alpha: lk }); }
  // little figure on the roof edge (line art) with a dotted fall arrow
  const fk = prog(t, 0.6, 1.0); if (fk > 0) { const fx = bx + w / 2 - 30, fy = top; g.save(); g.globalAlpha = fk; seg(g, [[fx, fy], [fx, fy - 40]], 4, ui.blueprint); circle(g, fx, fy - 54, 12, ui.blueprint); seg(g, [[fx - 18, fy - 34], [fx + 18, fy - 34]], 4, ui.blueprint); g.restore();
    const ak = ease.inOut(prog(t, tUp - 0.4, tUp + 0.3)); if (ak > 0) { g.save(); g.setLineDash([8, 10]); seg(g, [[fx + 70, fy - 20], [fx + 70, lerp(fy - 20, base - 20, ak)]], 4, alpha(ui.accent, 0.9)); g.restore(); poly(g, [[fx + 56, lerp(fy - 20, base - 20, ak) - 10], [fx + 84, lerp(fy - 20, base - 20, ak) - 10], [fx + 70, lerp(fy - 20, base - 20, ak) + 12]], ui.accent); } }
  // the doctors' chart icon (clipboard + cross) on "Doctors"
  const ck = ease.outBack(prog(t, tDoc, tDoc + 0.4)); if (ck > 0.01) { g.save(); g.translate(E.W * 0.78, E.H * 0.24); g.scale(ck, ck); g.rotate(0.05 * Math.sin(t * 2));
    rr(g, -110, -140, 220, 280, 18); g.strokeStyle = ui.blueprint; g.lineWidth = 5; g.stroke(); rr(g, -50, -160, 100, 40, 10); g.fillStyle = ui.bpBg || '#0b1a33'; g.fill(); g.stroke();
    g.fillStyle = ui.accent; g.fillRect(-20, -90, 40, 110); g.fillRect(-55, -55, 110, 40);
    for (let i = 0; i < 3; i++) seg(g, [[-70, 60 + i * 26], [70 - i * 30, 60 + i * 26]], 4, alpha(ui.blueprint, 0.7)); g.restore(); }
  g.restore();
} });

// s037 — GIANT FACE: he gulps (worried > shocked > determined), "~50%" chip on "half", small shake on "fatal"
registerShot('s037', { draw(g, t, info) {
  const tHalf = wt(info, 'half', 0.65), tFatal = wt(info, 'fatal', 1.77, 1.2);
  const cam = camMove(t, info.dur, { z: [0.86, 0.9], x: [100, 130], y: [-900, -920] });
  blurLayer(g, 10, (g) => { const S0 = street(g, t, cam, { mood: 'dusk', power: 1 }); layer(g, cam, 1, (g) => block5(g, t, BX, S0.GY, { lit: 0.5 })); }, null, 1); veil(g, '#160d22', 0.22);
  const sh = jumpShake(t, tFatal, 12), gulp = Math.sin(clamp((t - 1.25) / 0.3) * Math.PI) * 0.03;
  const cx = E.W * 0.42 + sh[0], cy = E.H * 0.5 + sh[1], r = E.H * 0.31;
  glow(g, cx + r, cy - r * 0.8, r * 1.6, '#ffc68a', 0.18);
  g.save(); g.translate(cx, cy); g.scale(1 + gulp, 1 - gulp); g.translate(-cx, -cy);
  giantFace(g, cx, cy, r, { who: 'HERO', f: faceAt(t, [[0, 'worried'], [0.6, 'shocked'], [tFatal + 0.05, 'determined']], 0.14), rimSide: 1, rimColor: '#ffc68a', blink: blinkAmt(t, 3.1, 4), breath: Math.sin(t * 2.6) });
  g.restore();
  const k = ease.outBack(prog(t, tHalf, tHalf + 0.35)) * clamp((info.dur - t) / 0.3);
  if (k > 0.01) { g.save(); g.translate(E.W * 0.78, E.H * 0.42); g.scale(k, k); rr(g, -190, -110, 380, 220, 30); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = S().ui.gold; g.lineWidth = 5; g.stroke();
    text(g, '~50%', 0, -14, { size: 120, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(S().ui.gold, 0.6) }); text(g, 'of 4-storey falls', 0, 70, { size: 32, color: S().ui.cream, font: FONTS.ui, weight: 900 }); g.restore(); }
  atmos(g, t, cam, { color: '#ffd8b0', far: 14, near: 5 });
} });

// s038 — PLANNING: on the lawn the three kneel round a big paper plan (sketches of landing gear); he stops mid-crouch on "stop jumping"
registerShot('s038', { draw(g, t, info) {
  const tStop = wt(info, 'stop', 0.53), tLand = wt(info, 'landings', 2.45, 1.8), tPlan = wt(info, 'planning', 1.83, 1.2);
  const k = ease.inOut(t / info.dur), cam = { z: lerp(0.94, 1.02, k), x: lerp(-170, -150, k), y: lerp(-170, 10, k) + Math.cos(t * 0.6) * 4, r: 0.003 * Math.sin(t * 0.4) };
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 }), py = R.GY + 26, px = CX - 140, ui = S().ui;
  layer(g, cam, 1, (g) => {
    // DEV (left, drawing) and MINA (right, pointing) kneel; the hero at the back stops mid-crouch then kneels and nods
    const nod = t > tLand ? Math.sin(clamp((t - tLand) / 0.5) * Math.PI * 2) * 6 : 0;
    const hp = t < tStop ? idle(blendPose(POSES.stand, POSES.crouch, ease.inOut(prog(t, 0, tStop))), t, 3) : t < tPlan ? POSES.crouch : idle(poseAt(t - tPlan, [[0, 'crouch'], [0.3, 'kneel']]), t, 3);
    actor(g, 'HERO', { x: px + 40, y: py - 40, s: 1.9, facing: 1, pose: { ...hp, head: [hp.head[0], hp.head[1] + nod] }, expr: exprAt(t, [[0, 'neutral'], [tStop + 0.1, 'sheepish'], [tLand, 'determined']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(0.3, 1), rim: R.rim, t });
    actor(g, 'DEV', { x: px - 430, y: py, s: 1.85, facing: 1, pose: idle({ ...POSES.kneel, eF: [40, -100], hF: [78, -60] }, t, 2), expr: exprAt(t, [[0, 'thinking'], [tPlan, 'smile']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, 0.8), rim: R.rim, t });
    actor(g, 'MINA', { x: px + 470, y: py, s: 2.0, facing: -1, pose: idle(poseAt(t, [[0, 'kneel'], [tPlan + 0.1, { ...POSES.kneel, eF: [36, -120], hF: [74, -96] }]]), t, 1), expr: exprAt(t, [[0, 'smile'], [tPlan + 0.1, 'happy']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0.6), rim: R.rim, t });
    // the paper plan on the grass: three doodles drawing themselves on (trampoline, pool, haystack) + arrows
    g.save(); g.translate(px, py + 4); g.transform(1, 0, -0.35, 0.32, 0, 0);
    rr(g, -330, -40, 660, 300, 8); g.fillStyle = '#f4efe2'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 3; g.stroke();
    const d = (u0) => clamp((t - u0) / 0.6), ink = '#2f5fb0';
    BP.draw(g, [[-280, 160], [-260, 120], [-140, 120], [-120, 160]], d(0.2), { w: 7, color: ink }); BP.draw(g, [[-250, 80], [-200, 20], [-150, 80]], d(0.5), { w: 6, color: ink });
    BP.draw(g, [[-60, 120], [-40, 190], [80, 190], [100, 120], [-60, 120]], d(tPlan - 0.3), { w: 7, color: ink }); BP.draw(g, [[-30, 150], [0, 140], [30, 152], [60, 142]], d(tPlan), { w: 5, color: '#5ab8e8' });
    BP.draw(g, [[160, 190], [190, 110], [240, 80], [290, 110], [310, 190], [160, 190]], d(tPlan + 0.4), { w: 7, color: '#c99a3a' });
    BP.draw(g, [[-120, 0], [-40, 0]], d(1.0), { w: 5, color: ui.accent }); BP.draw(g, [[110, 0], [180, 0]], d(1.3), { w: 5, color: ui.accent });
    g.restore();
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: R.M.key });
  chip(g, t, { str: 'Plan the landings', at: tLand, x: E.W * 0.5, y: E.H * 0.14, dur: info.dur - 0.05 });
} });

// s039 — LANDING-GADGET MONTAGE: trampoline (boing) > paddling pool (splash) > a very large haystack (puff), quick diagonal wipes
const BEATS = (info) => { const a = wt(info, 'trampoline', 0.29), b = wt(info, 'pool', 1.27, 0.9), c = wt(info, 'haystack', 2.77, 2.2); return { a, b, c, w1: b - 0.22, w2: wt(info, 'a', 1.91, 1.75, true) - 0.1 }; };
function gadgetBeat(g, t, info, i, B) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [[-560, 60, 520][i] - 40, [-560, 60, 520][i] + 40], y: [20, 10] });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0, kite: i === 0 ? 1 : 0 }), gx = CX + [-560, 60, 520][i], GY = R.GY + 20;
  let J, gy = GY, sink = 0, kind;
  if (i === 0) { kind = 'boing'; const o1 = { up: 0.4, hang: 0.1, down: 0.5, landing: 'boing' }; J = jumpPose(t, B.a - 1.0, 700, o1); if (t > B.a + 0.07) J = jumpPose(t, B.a + 0.07, 520, { crouch: 0.07, up: 0.42, hang: 0.18, down: 0.45, landing: 'soft' }); gy = GY - 60; }
  else if (i === 1) { kind = 'splash'; J = jumpPose(t, B.b - 0.9, 600, { up: 0.35, hang: 0.1, down: 0.45, landing: 'splash' }); gy = GY - PH + 20; if (t > B.b) sink = 120 * ease.out(prog(t, B.b, B.b + 0.25)) - 30 * ease.inOut(prog(t, B.b + 0.35, B.b + 0.7)); }
  else { kind = 'puff'; J = jumpPose(t, B.c - 1.1, 700, { up: 0.4, hang: 0.1, down: 0.6, landing: 'puff' }); gy = GY - 60; if (t > B.c) sink = 150 * ease.out(prog(t, B.c, B.c + 0.2)); }
  const tL = i === 0 ? B.a : i === 1 ? B.b : B.c, sag = i === 0 && t >= tL ? 40 * Math.exp(-(t - tL) * 6) * Math.cos((t - tL) * 22) : 0;
  const sq = i === 2 && t > tL ? 1 - 0.25 * Math.exp(-(t - tL) * 4) : 1;
  layer(g, cam, 1, (g) => {
    if (i === 0) trampoline(g, gx, GY, 420, sag);
    if (i === 1) poolBack(g, gx, GY, 560, t);
    actor(g, 'DEV', { x: gx - 520, y: GY, s: 1.85, facing: 1, pose: idle(t > tL ? reaction('handsUp', t, tL + 0.05, 'stand') : POSES.stand, t, 2), expr: t > tL ? ['joy', 'smile', 'shocked'][i] : 'awe', blink: blinkFlag(t, 3.0, 2), look: lookToward(1, -0.3), rim: R.rim, t });
    jumper(g, 'HERO', J, { x: gx, gy: gy + sink + (i === 0 ? sag : 0), s: 1.85, facing: 1, expr: exprAt(t, [[0, 'scared'], [tL, ['joy', 'surprised', 'shocked'][i]], [tL + 0.5, ['joy', 'smile', 'sheepish'][i]]]), blink: blinkFlag(t, 3.2, 5), rim: R.rim, t, shadow: sink < 1 });
    if (i === 1) pool(g, gx, GY, 560);
    if (i === 2) haystack(g, gx, GY + 4, 1.5, sq);
    jumpFX(g, t, J, { x: gx, gy: i === 1 ? GY - PH + 20 : i === 0 ? GY - 60 : GY - 60, s: 1.85, landing: kind, size: 1.5, launchDust: false });
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: R.M.key });
  meterHud(g, t, info, { value: Math.max(0.1, J.lift / U), marks: [['HOOP', 3.05], ['HIGH JUMP', 2.45]], span: 1.4 });
  chip(g, t, { str: ['A trampoline', 'A pool', 'A very large haystack'][i], at: tL + 0.05, x: E.W * 0.5, y: E.H * 0.13, tone: ['blue', 'blue', 'gold'][i] });
}
registerShot('s039', { draw(g, t, info) {
  const B = BEATS(info), wipe = (t0) => ease.inOut(prog(t, t0, t0 + 0.16));
  const k1 = wipe(B.w1), k2 = wipe(B.w2), cur = t < B.w1 ? 0 : t < B.w2 ? 1 : 2;
  const clipSlant = (k) => { const x = lerp(-400, E.W + 400, k); g.beginPath(); g.moveTo(-10, -10); g.lineTo(x + 200, -10); g.lineTo(x - 200, E.H + 10); g.lineTo(-10, E.H + 10); g.closePath(); };
  if (cur === 0 || (k1 > 0 && k1 < 1)) gadgetBeat(g, t, info, 0, B);
  if (k1 > 0 && (cur === 1 || k2 < 1)) { g.save(); if (k1 < 1) { clipSlant(k1); g.clip(); } gadgetBeat(g, t, info, 1, B); g.restore(); }
  if (k2 > 0) { g.save(); if (k2 < 1) { clipSlant(k2); g.clip(); } gadgetBeat(g, t, info, 2, B); g.restore(); }
  for (const k of [k1, k2]) if (k > 0 && k < 1) { const x = lerp(-400, E.W + 400, k); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha('#fff1dc', 0.8); g.lineWidth = 18; g.beginPath(); g.moveTo(x + 200, -10); g.lineTo(x - 200, E.H + 10); g.stroke(); g.restore(); }
} });
