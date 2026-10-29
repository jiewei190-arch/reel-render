// C_s102_s111_reunion_real.js — batch C (v2): the run to the ledge, the hoodie wrap ("You found me"), "Of course I did" (giant face, no lip-sync),
// Dev cheers / Tomas blames the rain, Mina waves the brick, "Best twin ever" (Mina giant face), the piggyback home ("You owe me hot chocolate"),
// then "So, is any of this real?" in the lab, the checklist (vipers, cameras, goggles) and the single photon.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shake, circle, rr, seg, text, FONTS, rng, mix } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor } from '../sets/actors.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { lab, labFg } from '../sets/lab.js';
import { chip, darkness } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, talkGesture, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { MINA } from '../cast.js';
import { shotWord, handWorld, scr, warmer, breath, tick } from './C_lib.js';

const WARM = { color: '#ffcf8a', dir: [0.6, -0.8], w: 6 };
const MOON = { color: '#b8c8ff', dir: [-0.4, -1], w: 6 };
const MINA_NOSCARF = { ...MINA, scarf: null };
// the mustard hoodie wrapped round Mina's shoulders (drawn over her)
function hoodieWrap(g, o, pose, t) { const s = (o.s ?? 1) * 0.72, f = o.facing ?? 1, [sx, sy] = [o.x + pose.sh[0] * f * s, o.y + pose.sh[1] * s];
  g.save(); g.translate(sx, sy); g.scale(f * s, s); g.fillStyle = '#E1AD01'; g.beginPath(); g.moveTo(-26, -6); g.quadraticCurveTo(0, -20 + Math.sin(t * 2) * 1.5, 26, -6); g.lineTo(30, 52); g.quadraticCurveTo(0, 62, -30, 52); g.closePath(); g.fill();
  g.strokeStyle = '#b8890a'; g.lineWidth = 3; g.beginPath(); g.moveTo(2, -10); g.lineTo(3, 56); g.stroke(); g.fillStyle = alpha('#fff4c8', 0.3); g.fillRect(-24, -2, 7, 46);
  g.fillStyle = '#c99a06'; g.beginPath(); g.ellipse(-4, -14, 22, 9, 0, Math.PI, 0); g.fill(); g.restore(); }
// blurred ferns whipping past in the foreground
function ferns(g, t, speed, seed = 3) { blurLayer(g, 9, (g) => { const r = rng(seed); for (let i = 0; i < 7; i++) { const x = ((r() * E.W * 1.6 - t * speed) % (E.W * 1.6) + E.W * 1.6) % (E.W * 1.6) - E.W * 0.3, h = 260 + r() * 220, c = '#060a08';
  for (let k = 0; k < 9; k++) { g.save(); g.translate(x, E.H + 20); g.rotate(-0.9 + k * 0.22 + Math.sin(t * 2 + i) * 0.05); g.fillStyle = c; g.beginPath(); g.ellipse(0, -h * 0.5, 16, h * 0.5, 0, 0, 7); g.fill(); g.restore(); } } }); }

// s102 — "You run to her. She's curled up under a rock ledge,"  HERO runs through the rain, camera following low; on 'ledge' Mina revealed
registerShot('s102', { draw(g, t, info) {
  const st = info.shot.start, tRun = shotWord('run', st, 0.2), tLedge = shotWord('ledge', st, 2.2), SPEED = 330;
  const GY = forestGround(), CX = E.W / 2, ledgeX = CX + 120, stopX = ledgeX - 260;
  const heroX = (u) => Math.min(stopX, CX - 1100 + SPEED * u);
  const cam = camMove(t, info.dur, { z: [1.25, 1.32], y: [130, 150] }); cam.x = Math.min(heroX(t) - CX + 260, stopX - CX + 180) + Math.sin(t * 0.7) * 6;
  const F = forest(g, t, cam, { view: 'cave', rain: true });
  layer(g, cam, 1, (g) => {
    const rev = ease.out(prog(t, tLedge - 0.3, tLedge + 0.4));
    actor(g, MINA_NOSCARF, { x: ledgeX + 40, y: GY, s: 2.1, facing: -1, kid: true, pose: idle(POSES.crouch, t, 4), expr: 'sad', blink: blinkFlag(t, 2.6, 9), rim: { ...MOON, w: 6 * rev + 1 }, alpha: 0.35 + 0.65 * rev, t });
    const x = heroX(t), arrived = x >= stopX - 1, wk = walkAlong(x, 1.95, { run: true });
    actor(g, 'HERO', { x, y: GY + 24, s: 1.95, facing: 1, pose: arrived ? idle(reaction('lookUp', t, tLedge, 'ready'), t, 3) : wk.pose, expr: exprAt(t, [[0, 'determined'], [tLedge, 'surprised']]), blink: blinkFlag(t, 3.4, 7), look: lookToward(1, 0.2), rim: MOON, t });
  });
  ferns(g, t, 900); FX.rain(g, t, { count: 170, angle: 0.24, a: 0.3, seed: 81 }); atmos(g, t, cam, { color: '#b8c8ff' });
} });

// s103 — 'cold and shivering, and smiling. "You found me," she mumbles.'  HERO kneels and wraps his hoodie round MINA; she smiles and mumbles
registerShot('s103', { draw(g, t, info) {
  const st = info.shot.start, tShiver = shotWord('shivering', st, 0.6), tSmile = shotWord('smiling', st, 1.5), tFound = shotWord('found', st, 2.1), tMum = shotWord('mumbles', st, 2.9);
  const cam = camMove(t, info.dur, { z: [1.5, 1.58], x: [120, 170], y: [120, 128] });
  const F = forest(g, t, cam, { view: 'cave', rain: true }), GY = F.GY, mx = F.pos.ledgeX + 40;
  layer(g, cam, 1, (g) => {
    const wrap = ease.inOut(prog(t, 0.2, tSmile)), jit = Math.sin(t * 38) * 2.2 * (1 - wrap * 0.8);
    glow(g, mx - 90, GY - 110, 260, '#ffb24a', 0.32 + 0.05 * Math.sin(t * 6));
    actor(g, 'HERO', { x: mx - 230, y: GY + 10, s: 1.95, facing: 1, pose: idle(poseAt(t, [[0, 'kneel'], [0.3, { ...POSES.kneel, eF: [40, -130], hF: [70, -150] }]], 0.4), t, 3), expr: exprAt(t, [[0, 'worried'], [tSmile, 'smile'], [tFound + 0.3, 'happy']]), blink: blinkFlag(t, 3.4, 7), look: lookToward(1, 0.1), rim: WARM, t });
    actor(g, MINA_NOSCARF, { x: mx + jit, y: GY, s: 2.1, facing: -1, kid: true, pose: idle(POSES.crouch, t, 4), expr: exprAt(t, [[0, 'sad'], [tSmile, 'smile'], [tFound, 'happy']]), talk: talkAmount(info.globalT, st + tFound - 0.05, st + tMum - 0.05), blink: blinkFlag(t, 2.6, 9), look: lookToward(-1, -0.1), rim: WARM, t });
    g.save(); g.globalAlpha *= wrap; hoodieWrap(g, { x: mx + jit, y: GY, s: 2.1, facing: -1 }, POSES.crouch, t); g.restore();
    warmer(g, mx - 90, GY - 110, 1.4, t);
    breath(g, t, mx - 30, GY - 250, { dir: -1 });
  });
  forestFg(g, t, cam); FX.rain(g, t, { count: 140, angle: 0.18, a: 0.25, seed: 82 });
  chip(g, t, { str: '"You found me."', at: tFound, x: E.W * 0.66, y: E.H * 0.18, tone: 'coral' });
} });

// s104 — 'And you say, "Of course I did."'  GIANT FACE HERO, tender joy, says the line (mouth open driven by talkAmount over 'Of course I did'); warm glow from below, rain easing, soft sparkles
registerShot('s104', { draw(g, t, info) {
  const st = info.shot.start, tOf = shotWord('of', st, 0.6), tCourse = shotWord('course', st, 0.8), tDid = shotWord('did', st, 1.3);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  g.fillStyle = '#05060e'; g.fillRect(0, 0, E.W, E.H); blurLayer(g, 18, (g) => forest(g, t, { z: 1.4, x: 160 }, { view: 'cave', rain: false }), null, 1); veil(g, '#03040c', 0.45);
  const f0 = faceAt(t, [[0, 'neutral'], [tOf - 0.1, { eye: 0.8, arc: 0.6, brow: 0.4, smile: 0.7, w: 1.0, blush: 0.4 }], [tCourse + 0.5, 'joy']], 0.2);
  const talk = talkAmount(info.globalT, st + tOf - 0.05, st + tDid + 0.35); const f = talk > 0 ? { ...f0, open: 0.1 + 0.75 * talk } : f0;
  layer(g, cam, 1, (g) => { glow(g, E.W * 0.5, E.H * 1.05, 900, '#ffb24a', 0.3); giantFace(g, E.W * 0.5, E.H * 0.54, 330, { who: 'HERO', f, rimSide: 1, rimColor: '#ffcf8a', glint: '#ffe0b0', blink: blinkAmt(t, 3.2, 0.8), breath: Math.sin(t * 2.1), tilt: lerp(0.02, -0.04, ease.inOut(t / info.dur)) }); });
  for (let i = 0; i < 4; i++) { const ph = (t * 0.9 + i * 0.27) % 1; FX.sparkle(g, E.W * 0.5 + (i - 1.5) * 260, E.H * 0.18 + Math.sin(i * 2) * 50, 16 * Math.sin(ph * Math.PI), '#ffe0b0', 0.8); }
  FX.rain(g, t, { count: lerp(90, 20, t / info.dur) | 0, len: 70, a: 0.18, angle: 0.18, seed: 83 });
  chip(g, t, { str: '"Of course I did."', at: tCourse, x: E.W * 0.5, y: E.H * 0.86, tone: 'gold' });
} });

// s105 — "Dev cheers. Tomas wipes his eyes and blames the rain."  DEV both arms up on 'cheers'; TOMAS wipes his eyes, points at the sky on 'rain'
registerShot('s105', { draw(g, t, info) {
  const st = info.shot.start, tCheer = shotWord('cheers', st, 0.3), tWipe = shotWord('wipes', st, 1.2), tRain = shotWord('rain', st, 2.9);
  const cam = camMove(t, info.dur, { z: [1.14, 1.2], x: [-120, -60], y: [70, 78] });
  const F = forest(g, t, cam, { view: 'cave', rain: true }), GY = F.GY, CX = F.CX;
  layer(g, cam, 1, (g) => {
    glow(g, CX + 160, GY - 100, 240, '#ffb24a', 0.25);
    const jump = Math.max(0, Math.sin((t - tCheer) * 8)) * 20 * clamp(1 - (t - tCheer) / 1.6) * (t > tCheer ? 1 : 0);
    actor(g, 'DEV', { x: CX - 620, y: GY + 20 - jump, s: 1.85, facing: 1, pose: idle(t > tCheer ? reaction('delight', t, tCheer) : POSES.relaxed, t, 2), expr: exprAt(t, [[0, 'surprised'], [tCheer, 'joy']]), blink: blinkFlag(t, 3.1, 2), rim: WARM, t });
    const to = { x: CX - 290, y: GY + 24, s: 1.9, facing: 1 }, tp = idle(poseAt(t, [[0, 'relaxed'], [tWipe, 'facepalm'], [tRain, 'pointUp']], 0.28), t, 1);
    actor(g, 'TOMAS', { ...to, pose: tp, expr: exprAt(t, [[0, 'happy'], [tWipe, 'cry'], [tRain, 'smile']]), talk: talkAmount(info.globalT, st + tRain - 0.4, st + info.dur), blink: blinkFlag(t, 2.8, 5), look: t > tRain ? lookToward(0.3, -1) : lookToward(1, 0), rim: WARM, t });
    FX.lightCone(g, to.x + 60, GY - 90, { angle: 1.3, spread: 0.3, len: 260, color: '#f4f8ff', a: 0.25 });                                 // torch pointed politely at the ground
    actor(g, 'HERO', { x: CX + 60, y: GY + 10, s: 1.75, facing: -1, pose: idle(POSES.kneel, t, 3), expr: 'happy', blink: blinkFlag(t, 3.4, 7), rim: WARM, t });
    actor(g, MINA_NOSCARF, { x: CX + 170, y: GY, s: 1.9, facing: -1, kid: true, pose: idle(POSES.crouch, t, 4), expr: 'smile', blink: blinkFlag(t, 2.6, 9), rim: WARM, t });
    hoodieWrap(g, { x: CX + 170, y: GY, s: 1.9, facing: -1 }, POSES.crouch, t);
  });
  forestFg(g, t, cam); FX.rain(g, t, { count: 130, angle: 0.18, a: 0.25, seed: 84 });
  chip(g, t, { str: '"It\'s the rain."', at: tRain + 0.1, x: E.W * 0.36, y: E.H * 0.18, tone: 'gold' });
} });

// s106 — "Mina waves the little brick at you."  MINA medium wrapped in the mustard hoodie, waving the glowing warmer, cheeky grin
registerShot('s106', { draw(g, t, info) {
  const st = info.shot.start, tWave = shotWord('waves', st, 0.3), tBrick = shotWord('brick', st, 1.4);
  const cam = camMove(t, info.dur, { z: [1.42, 1.5], x: [180, 220], y: [150, 160] });
  const F = forest(g, t, cam, { view: 'cave', rain: true }), GY = F.GY, mx = F.pos.ledgeX + 40;
  layer(g, cam, 1, (g) => {
    const o = { x: mx, y: GY + 20, s: 2.4, facing: -1, kid: true };
    const wave = { ...POSES.wave, hF: [36 + Math.sin(t * 9) * 10, -236], eF: [28, -196] }, pose = idle(poseAt(t, [[0, 'stand'], [tWave, wave]], 0.25), t, 4);
    actor(g, MINA_NOSCARF, { ...o, pose, expr: exprAt(t, [[0, 'smile'], [tWave, 'happy'], [tBrick, 'smirk']]), blink: blinkFlag(t, 2.6, 9), look: lookToward(-1, 0), rim: WARM, t });
    hoodieWrap(g, o, pose, t);
    const [hx, hy] = handWorld(o, pose); warmer(g, hx - 10, hy - 16, 1.3, t);
  });
  forestFg(g, t, cam); FX.rain(g, t, { count: 110, angle: 0.18, a: 0.22, seed: 85 }); atmos(g, t, cam, { color: '#ffd9a0', far: 18, near: 6 });
} });

// s107 — '"Best twin ever," she says.'  GIANT FACE MINA: worried -> cheeky -> joy, mouth keys on the words
registerShot('s107', { draw(g, t, info) {
  const st = info.shot.start, tBest = shotWord('best', st, 0.2), tEver = shotWord('ever', st, 0.9);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  g.fillStyle = '#05060e'; g.fillRect(0, 0, E.W, E.H); blurLayer(g, 18, (g) => forest(g, t, { z: 1.4, x: 200 }, { view: 'cave', rain: false }), null, 1); veil(g, '#03040c', 0.45);
  const tk = talkAmount(info.globalT, st + tBest - 0.05, st + tEver + 0.4), f = faceAt(t, [[0, 'worried'], [tBest - 0.1, 'cheeky'], [tEver + 0.4, 'joy']], 0.18);
  layer(g, cam, 1, (g) => { glow(g, E.W * 0.7, E.H * 0.95, 700, '#ffb24a', 0.28); giantFace(g, E.W * 0.5, E.H * 0.52, 310, { who: 'MINA', f: { ...f, open: Math.max(f.open, tk * 0.7) }, rimSide: 1, rimColor: '#ffcf8a', blink: blinkAmt(t, 2.7, 0.3), breath: Math.sin(t * 2.4), tilt: 0.05 * Math.sin(t * 1.3) }); });
  for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i * 0.33) % 1; FX.sparkle(g, E.W * (0.24 + i * 0.26), E.H * 0.2, 16 * Math.sin(ph * Math.PI), '#ffe0b0', 0.8); }
  chip(g, t, { str: '"Best twin ever."', at: tBest, x: E.W * 0.5, y: E.H * 0.88, tone: 'coral' });
} });

// s108 — '"You owe me hot chocolate."'  HERO carries MINA piggyback toward the camp lantern; she talks, he rolls his eyes, then smiles
registerShot('s108', { draw(g, t, info) {
  const st = info.shot.start, tOwe = shotWord('owe', st, 0.3), tChoc = shotWord('chocolate', st, 1.3), SPEED = 150;
  const GY = forestGround(), CX = E.W / 2, x = CX - 420 + SPEED * t;
  const cam = camMove(t, info.dur, { z: [1.18, 1.24], y: [90, 100] }); cam.x = x - CX + 120;
  const F = forest(g, t, cam, { view: 'camp', rain: true });
  layer(g, cam, 1, (g) => {
    const lx = F.pos.fireX + 280; glow(g, lx, GY - 30, 360, '#ffcf7a', 0.45); FX.pool(g, lx, GY + 20, 320, 40, '#ffcf7a', 0.25);
    const wk = walkAlong(x, 1.95, {}), bob = Math.abs(Math.sin(wk.phase)) * 6;
    const carry = { ...wk.pose, eF: [30, -120], hF: [12, -108], eB: [-4, -122], hB: [-30, -104] };
    // Mina on his back, arms round his neck, the twins glowing
    actor(g, MINA_NOSCARF, { x: x - 54, y: GY - 110 - bob, s: 1.95, facing: 1, kid: true, pose: idle({ ...POSES.sit, hF: [48, -150], eF: [30, -140] }, t, 4), expr: exprAt(t, [[0, 'happy'], [tOwe, 'smirk'], [tChoc + 0.4, 'happy']]), talk: talkAmount(info.globalT, st + tOwe - 0.2, st + tChoc + 0.5), blink: blinkFlag(t, 2.6, 9), rim: WARM, t });
    hoodieWrap(g, { x: x - 54, y: GY - 110 - bob, s: 1.95, facing: 1 }, POSES.sit, t);
    actor(g, 'HERO', { x, y: GY + 24, s: 1.95, facing: 1, pose: carry, expr: exprAt(t, [[0, 'smile'], [tOwe + 0.2, 'confused'], [tChoc + 0.3, 'happy']]), blink: blinkFlag(t, 3.4, 7), look: t > tOwe + 0.2 && t < tChoc + 0.3 ? lookToward(0.2, -1) : lookToward(1, 0), rim: WARM, t });
    warmer(g, x + 40, GY - 190 - bob, 0.9, t); warmer(g, x - 10, GY - 300 - bob, 0.9, t + 1);
  });
  forestFg(g, t, cam); FX.rain(g, t, { count: 90, angle: 0.18, a: 0.2, seed: 86 });
  chip(g, t, { str: '"You owe me hot chocolate."', at: tOwe, x: E.W * 0.6, y: E.H * 0.16, tone: 'coral' });
} });

// s109 — "So, is any of this real?"  lab, lights on: DR LIN at the blueprint wall turns to camera, eyebrow raised; big question line on 'real'
registerShot('s109', { draw(g, t, info) {
  const st = info.shot.start, tReal = shotWord('real', st, 1.4);
  const cam = camMove(t, info.dur, { z: [1.12, 1.18], x: [-200, -140], y: [60, 66] });
  const L = lab(g, t, cam, { lights: 1, wallT: 4 });
  layer(g, cam, 1, (g) => actor(g, 'LIN', { x: L.pos.wallX + 120, y: L.GY + 20, s: 1.9, facing: t < 0.8 ? -1 : 1, pose: idle(poseAt(t, [[0, 'think'], [0.8, 'relaxed'], [tReal - 0.2, 'shrug']], 0.3), t, 5), expr: exprAt(t, [[0, 'thinking'], [0.8, 'smile'], [tReal - 0.2, 'confused']]), blink: blinkFlag(t, 3.3, 5), look: t < 0.8 ? lookToward(-1, -0.2) : lookToward(0.2, 0), rim: L.rim, t }));
  labFg(g, t, cam); atmos(g, t, cam, { color: '#cfe0ff' });
  if (t > tReal - 0.3) { veil(g, '#02030a', 0.35 * ease.out(prog(t, tReal - 0.3, tReal))); UI.bigLine(g, t - (tReal - 0.3), { str: 'IS ANY OF THIS REAL?', dur: info.dur - tReal + 0.3, y: E.H * 0.42, size: 104 }); }
} });

// s110 — "Pit vipers are. Thermal cameras are. Night-vision goggles are."  checklist card, a gold tick pops on each 'are'
registerShot('s110', { draw(g, t, info) {
  const st = info.shot.start, after = (w, from, fb) => { const gw = wordTime(w, st + from); return (gw == null ? st + fb : gw) - st; }, a1 = after('are', 0, 0.9), a2 = after('are', a1 + 0.2, 2.4), a3 = after('are', a2 + 0.2, 4.0), ui = S().ui;
  const z = 1 + 0.03 * (t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, E.W, E.H); glow(g, E.W / 2, E.H / 2, 900, '#2a3a8a', 0.25); FX.stars(g, t, { count: 80, area: [0, 0, E.W, E.H] });
  const cw = 1300, ch = 760, cx = (E.W - cw) / 2, cy = (E.H - ch) / 2, k = ease.out(prog(t, 0, 0.35));
  g.save(); g.globalAlpha *= k; rr(g, cx, cy, cw, ch, 28); g.fillStyle = ui.card; g.fill(); g.strokeStyle = ui.cardLine; g.lineWidth = 2.5; g.stroke();
  text(g, 'REAL TODAY?', cx + 70, cy + 92, { size: 50, color: ui.text, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
  const rows = [['PIT VIPERS', a1, 'snake'], ['THERMAL CAMERAS', a2, 'cam'], ['NIGHT-VISION GOGGLES', a3, 'nv']];
  rows.forEach(([lab2, ta, ic], i) => { const y = cy + 230 + i * 170, on = ease.out(prog(t, ta - 0.6, ta - 0.1)); g.save(); g.globalAlpha *= 0.35 + 0.65 * on;
    const ix = cx + 150; g.strokeStyle = ui.blueprint; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath();
    if (ic === 'snake') { for (let u = 0; u <= 20; u++) { const x = ix - 60 + u * 6, yy = y - Math.sin(u * 0.6 + t * 2) * 12; u ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); circle(g, ix + 66, y - 6, 9, ui.gold); }
    else if (ic === 'cam') { g.strokeRect(ix - 56, y - 34, 104, 68); g.stroke(); g.beginPath(); g.arc(ix - 56, y, 22, 0, 7); g.stroke(); circle(g, ix + 30, y - 14, 6, '#ff3b30'); }
    else { for (const dx of [-30, 30]) { g.beginPath(); g.arc(ix + dx, y, 26, 0, 7); g.stroke(); } circle(g, ix - 30, y, 14, alpha('#7fe06a', 0.6)); circle(g, ix + 30, y, 14, alpha('#7fe06a', 0.6)); }
    text(g, lab2, cx + 270, y + 2, { size: 50, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 }); g.restore();
    tick(g, cx + cw - 130, y, prog(t, ta, ta + 0.5), ui.gold, 42); });
  g.restore(); g.restore();
} });

// s111 — BLUEPRINT: "Even spotting single photons is real, barely."  one photon blips into the eye; a tiny wobbling gold tick labelled 'barely'
registerShot('s111', { draw(g, t, info) {
  const st = info.shot.start, tPhot = shotWord('photons', st, 1.0), tBare = shotWord('barely', st, 2.4), z = 1 + 0.035 * (t / info.dur), ui = S().ui;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2);
  BP.board(g, t, { title: 'ONE PHOTON', fig: 'FIG 10 - THE LIMIT OF SIGHT' });
  const ex = E.W * 0.36, ey = E.H * 0.52, r = 260, k = ease.out(prog(t, 0.05, 1.4));
  const A = BP.eye(g, t, { x: ex, y: ey, r, k, inset: false });
  BP.label(g, t, { at: A.retina, to: [A.retina[0] + 40, A.retina[1] - r * 0.7], str: 'RETINA', start: 1.0 });
  const pk = (t - tPhot + 0.6) / 1.2; if (pk > 0 && pk < 1.2) BP.photon(g, t, { from: [E.W * 0.92, ey - 60], to: A.retina, k: clamp(pk) });
  if (pk >= 1) { const fl = ease.out(prog(pk, 1, 1.15)) * (1 - ease.out(prog(pk, 1.15, 1.6))); glow(g, A.retina[0], A.retina[1], 80, '#ffffff', 0.9 * fl); }
  const bk = prog(t, tBare, tBare + 0.5); if (bk > 0) { const wob = Math.sin(t * 9) * 0.15 * (1 - prog(t, tBare + 0.5, info.dur)); g.save(); g.translate(E.W * 0.76, E.H * 0.42); g.rotate(wob); tick(g, 0, 0, bk, ui.gold, 30); g.restore(); text(g, 'BARELY', E.W * 0.76, E.H * 0.42 + 70, { size: 40, color: ui.gold, font: FONTS.ui, weight: 900, alpha: ease.out(bk), spacing: 5 }); }
  g.restore();
  chip(g, t, { str: 'Single photons: real', at: tPhot, x: E.W * 0.7, y: E.H * 0.86, tone: 'gold' });
} });
