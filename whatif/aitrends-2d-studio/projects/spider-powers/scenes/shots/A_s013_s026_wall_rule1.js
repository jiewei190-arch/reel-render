// A_s013_s026_wall_rule1.js — ep 4 batch A, DAY 1 THE WALL + RULE 1 (37.52-85.64): gloves slip, hands + socks stick, climb, wet-sticker
// slide, Dev drops his cereal, the magnifying glass, "No glue.", RULE 1 card, FIG 1 hairy feet / van der Waals / one tip / hundreds of
// thousands / the >170x estimate / geckos peel like tape. LEGAL: no famous-hero anything; gloves never help; no wrist silk.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, shade, glow, text, FONTS, rr, seg, circle, ring, poly, linGrad, rng, talkAmount } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor, gecko } from '../sets/actors.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, label } from '../sets/bp.js';
import { footHairs, vdw, tipTally } from '../sets/spiderbp.js';
import { dayCard } from '../sets/spiderprops.js';
import { garden } from '../sets/garden.js';
import { pip, wallCling, stickMarks, gloves } from '../sets/spider.js';
import { sw, hallWall, SOCKS, pipOutline } from './A_lib.js';

const RIM = { color: '#ffd8a8', dir: [0.8, -0.5] };
const GY = E.H * 0.8, WX = E.W / 2 + 120, HS = 1.9;
const GOLD = () => S().ui.gold;
const push = (g, t, dur, fn, amt = 0.035) => { const z = 1 + amt * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 31 });
const PRESS = { ...POSES.stand, head: [10, -206], sh: [4, -174], eF: [40, -186], hF: [62, -206], eB: [36, -180], hB: [58, -198] };   // palms flat on the wall (+x) at shoulder height
const glovesOnFloor = (g, x) => { for (const [dx, r] of [[0, 0.4], [70, -0.3]]) { g.save(); g.translate(x + dx, GY - 14); g.rotate(r); g.fillStyle = '#7b4bb3'; rr(g, -34, -16, 68, 32, 14); g.fill(); for (let i = 0; i < 4; i++) { rr(g, 26, -14 + i * 8, 26, 9, 4); g.fill(); } g.restore(); } };

// ===================================================================================================
// s013 — "Day one. You press your hands on the hallway wall,"  DAY 1 THE WALL card; HERO (in socks) walks in and presses his purple-gloved
// palms flat on the wall on "press"; on "hands" the gloves slide off and drop (they never help); bare hands flat on the wall on "wall".
registerShot('s013', { draw(g, t, info) {
  const st = info.shot.start, tPress = sw('press', st, 1.51), tHands = sw('hands', st, 1.89), tWall = sw('wall', st + 2, 2.77);
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [WX - E.W / 2 - 320, WX - E.W / 2 - 260], y: [-40, -50] });
  hallWall(g, cam, WX);
  const hxEnd = WX - 62 * HS, k = ease.inOut(prog(t, 0.2, tPress - 0.2)), hx = lerp(WX - 620, hxEnd, k);
  layer(g, cam, 1, (g) => {
    const walking = k > 0 && k < 1, hp = walking ? walkAlong(hx, HS).pose : idle(poseAt(t, [[0, 'stand'], [tPress - 0.25, PRESS]], 0.25), t, 2);
    const o = { x: hx, y: GY, s: HS, facing: 1 };
    actor(g, SOCKS, { ...o, pose: hp, expr: exprAt(t, [[0, 'thinking'], [tPress, 'determined'], [tWall, 'surprised']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(1, -0.2), rim: RIM, t });
    const G = gloves(g, o, hp, { t, slip: t < tHands ? 0 : 1, tSlip: tHands });
    if (t > tHands + 0.35) glovesOnFloor(g, hxEnd + 40);
    if (t > tWall) stickMarks(g, t - tWall, [[WX, GY - 206 * HS], [WX, GY - 198 * HS]], { alpha: 0.4 });
  });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
  dayCard(g, t, { day: 1, title: 'THE WALL', at: 0.15, week: true, x: 290, y: 150, s: 0.9 });
} });

// ===================================================================================================
// s014 — "and they stick. So do your socks."  close on the bare palms: suction rings bloom on "stick", he tugs and the hands stay put; tilt down
// on "So" to the socks: one foot lifts and the sock clings to the skirting, stretching like chewing gum, then snaps back on "socks".
registerShot('s014', { draw(g, t, info) {
  const st = info.shot.start, tStick = sw('stick', st, 0.59), tSo = sw('so', st + 1.2, 1.67), tSocks = sw('socks', st, 2.09);
  const hx = WX - 62 * HS, down = ease.inOut(prog(t, tSo - 0.1, tSo + 0.4));
  const handY = GY - 200 * HS, footY = GY - 60, cam = { z: 2.1, x: WX - E.W / 2 - 120 + Math.sin(t * 0.6) * 5, y: lerp(handY, footY, down) - E.H / 2, r: 0 };
  hallWall(g, cam, WX);
  layer(g, cam, 1, (g) => {
    const tug = t > tStick && t < tSo ? Math.sin((t - tStick) * 9) * 8 : 0;
    const lift = ease.out(prog(t, tSo + 0.05, tSocks - 0.05)) * (1 - ease.out(prog(t, tSocks, tSocks + 0.12)));
    const hp = { ...PRESS, head: [PRESS.head[0] - tug, PRESS.head[1]], sh: [PRESS.sh[0] - tug, PRESS.sh[1]], fF: [44 - lift * 40, -lift * 30], kF: [30 - lift * 10, -50 - lift * 20], fB: [-10, 0], kB: [-6, -50] };
    actor(g, SOCKS, { x: hx, y: GY, s: HS, facing: 1, pose: hp, expr: exprAt(t, [[0, 'surprised'], [tStick, 'awe']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(1, -0.2), rim: RIM, t });
    if (t > tStick) stickMarks(g, t - tStick, [[WX - 4, handY - 12], [WX - 4, handY + 6], [WX - 4, handY + 22]], { alpha: 0.6 });
    // the sock stuck to the skirting, stretching like gum while the foot pulls away
    if (lift > 0.02) { const fx = hx + (44 - lift * 40) * HS + 10, fy = GY - lift * 30 * HS; g.fillStyle = '#e8e2d4'; g.beginPath(); g.moveTo(WX, GY - 40); g.quadraticCurveTo((fx + WX) / 2, fy - 10, fx, fy - 18); g.lineTo(fx, fy); g.quadraticCurveTo((fx + WX) / 2, fy + 10, WX, GY - 10); g.closePath(); g.fill(); }
    glovesOnFloor(g, hx - 160);
  });
  atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
} });

// ===================================================================================================
// s015 — "You climb, then slowly slide back down, like a wet sticker."  hand over hand up the wall (camera rises with him), joy on "climb";
// from "slowly" the slow wet-sticker slide back down, cheek squished, squeaky streaks; sheepish on "sticker". Gloves on the floor below.
registerShot('s015', { draw(g, t, info) {
  const st = info.shot.start, tClimb = sw('climb', st, 0.39), tSlow = sw('slowly', st, 1.01), tStk = sw('sticker', st, 3.07);
  const slide = ease.inOut(prog(t, tSlow, info.dur - 0.1)), rise = ease.out(prog(t, 0.05, tSlow)) * 400;
  const R = wallCling(t, { climb: t < tSlow ? 1 : 0, slide, slideDist: 400 }), hx = WX - 44 * HS, hy = GY - rise + R.dy;
  const cam = { z: 1.4, x: hx - E.W / 2 + 120 + Math.sin(t * 0.6) * 6, y: hy - 320 - E.H / 2 + 100 + Math.cos(t * 0.5) * 4, r: 0 };
  hallWall(g, cam, WX);
  layer(g, cam, 1, (g) => {
    glovesOnFloor(g, hx - 160);
    actor(g, SOCKS, { x: hx, y: hy, s: HS, facing: 1, pose: R.pose, expr: exprAt(t, [[0, 'determined'], [tClimb, 'joy'], [tSlow, 'worried'], [tStk, 'sheepish']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(0.3, -0.8), rim: RIM, t });
    if (t > 0.2) stickMarks(g, t, R.hold.map((p) => [hx + p[0] * HS, hy + p[1] * HS]), { alpha: 0.35 });
    if (slide > 0.05) for (let i = 0; i < 3; i++) seg(g, [[WX - 4, hy - 400 - i * 40], [WX - 4, hy - 300 - i * 40 - slide * 140]], 3, alpha('#ffffff', 0.3));
  });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
} });

// ===================================================================================================
// s016 — "Dev drops his cereal anyway."  wider hallway: HERO sits at the foot of the wall waving sheepishly; DEV in the kitchen doorway drops
// his bowl on "drops" (falls, milk splash, flakes, the bowl lands upright and wobbles), jaw open; his phone shows a tiny REC dot.
registerShot('s016', { draw(g, t, info) {
  const st = info.shot.start, tDrop = sw('drops', st, 0.29), tHit = tDrop + 0.35;
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [WX - E.W / 2 + 200, WX - E.W / 2 + 230], y: [-60, -66] });
  hallWall(g, cam, WX);
  const dX = WX + 760;
  layer(g, cam, 1, (g) => {
    // the kitchen doorway (warm light behind Dev)
    g.fillStyle = '#fff0d0'; g.fillRect(dX - 170, GY - 640, 340, 640); glow(g, dX, GY - 300, 420, '#ffd59a', 0.35); g.fillStyle = '#6a4a32'; g.fillRect(dX - 190, GY - 660, 20, 660); g.fillRect(dX + 170, GY - 660, 20, 660); g.fillRect(dX - 190, GY - 670, 380, 22);
    glovesOnFloor(g, WX - 420);
    actor(g, SOCKS, { x: WX - 150, y: GY - 6, s: HS, facing: 1, pose: idle(poseAt(t, [[0, { ...POSES.sit, hip: [0, -40], kF: [40, -50], fF: [80, -6], kB: [36, -48], fB: [74, -4], sh: [-4, -114], head: [0, -148] }], [0.6, { ...POSES.sit, hip: [0, -40], kF: [40, -50], fF: [80, -6], kB: [36, -48], fB: [74, -4], sh: [-4, -114], head: [0, -148], eF: [24, -150], hF: [36, -190] }]]), t, 4), expr: 'sheepish', blink: blinkFlag(t, 3.2, 4), look: lookToward(1, -0.1), rim: RIM, t });
    const dp = idle(t < tDrop ? { ...POSES.holdFront } : reaction('shock', t, tDrop), t, 5);
    actor(g, 'DEV', { x: dX, y: GY + 10, s: HS, facing: -1, pose: dp, expr: exprAt(t, [[0, 'neutral'], [tDrop, 'shocked']]), blink: t > tDrop ? false : blinkFlag(t, 3.4, 5), look: lookToward(-1, 0.3), rim: { color: '#ffd59a', dir: [1, -0.3] }, t });
    // phone with REC dot in Dev's far hand
    const ph = [dX - dp.hB[0] * HS, GY + 10 + dp.hB[1] * HS]; rr(g, ph[0] - 18, ph[1] - 34, 36, 60, 6); g.fillStyle = '#1a1c22'; g.fill(); if (Math.floor(t * 2) % 2 === 0) circle(g, ph[0], ph[1] - 20, 5, '#ff3b30');
    // the bowl: falls from his hands, lands upright and wobbles; milk + flakes
    const h0 = [dX - 36 * HS, GY + 10 - 152 * HS], fall = prog(t, tDrop, tHit), by = t < tDrop ? h0[1] : lerp(h0[1], GY - 20, ease.in(fall)), bx = h0[0] - fall * 30;
    const wob = t > tHit ? Math.exp(-(t - tHit) * 5) * Math.sin((t - tHit) * 20) * 0.25 : fall * 0.6;
    g.save(); g.translate(bx, by); g.rotate(wob); g.fillStyle = '#e8e4f0'; g.beginPath(); g.moveTo(-50, -10); g.quadraticCurveTo(0, 50, 50, -10); g.closePath(); g.fill(); g.fillStyle = '#2f6fd0'; g.fillRect(-50, -14, 100, 6); g.restore();
    if (t > tHit) { const u = t - tHit, R = rng(8); for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.1 + R() * 0.8), sp = 120 + R() * 200; const x = bx + Math.cos(a) * sp * u * 1.6, y = GY - 30 + Math.sin(a) * sp * u * 1.6 + 600 * u * u; if (y < GY) { if (i % 2) circle(g, x, y, 6, alpha('#fbfaf4', 0.9)); else { rr(g, x - 8, y - 5, 16, 10, 4); g.fillStyle = '#e8b050'; g.fill(); } } } g.fillStyle = alpha('#fbfaf4', 0.85); g.beginPath(); g.ellipse(bx, GY - 4, 60 + u * 80, 10, 0, 0, 7); g.fill(); }
  });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 5 });
} });

// ===================================================================================================
// s017 — "Mina checks your palms with a magnifying glass."  through the lens: palm lines enlarged, no glue, tiny sparkles; on "palms" Mina's
// huge magnified eye swims into the lens and blinks; on "glass" she tilts it and the rim catches the hall light.
registerShot('s017', { draw(g, t, info) {
  const st = info.shot.start, tPalm = sw('palms', st, 0.83), tGlass = sw('glass', st, 2.15);
  const z = lerp(1.08, 1.14, ease.inOut(t / info.dur)), tilt = 0.12 * ease.inOut(prog(t, tGlass, tGlass + 0.4));
  blurLayer(g, 10, (g) => hallWall(g, { z: 1.4, x: WX - E.W / 2 - 300, y: -200 }, WX), null, 1); veil(g, '#2a1e14', 0.15);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const palm = (g, k) => { g.fillStyle = S().ink; g.beginPath(); g.ellipse(E.W * 0.48, E.H * 0.62, 340 * k, 220 * k, -0.1, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { rr(g, E.W * 0.48 - 330 * k - i * 10 * k, E.H * 0.62 - 190 * k + i * 100 * k, 260 * k, 84 * k, 42 * k); g.fill(); } g.fillStyle = '#E1AD01'; rr(g, E.W * 0.48 + 260 * k, E.H * 0.62 - 150 * k, 700 * k, 300 * k, 100 * k); g.fill(); };
  palm(g, 1);
  const lx = E.W * 0.5, ly = E.H * 0.5, lr = 280;
  g.save(); g.translate(lx, ly); g.scale(1 - tilt, 1); g.beginPath(); g.arc(0, 0, lr, 0, 7); g.restore(); g.save(); g.clip();
  g.translate(lx, ly); g.scale(1.9, 1.9); g.translate(-lx, -ly); palm(g, 1);
  g.strokeStyle = alpha('#5a4a6a', 0.9); g.lineWidth = 3; for (const [a, b] of [[0.2, 0.9], [0.4, 1.3], [0.7, 1.7]]) { g.beginPath(); g.arc(E.W * 0.48, E.H * 0.72, 180 + a * 60, Math.PI * (1.1 + a * 0.1), Math.PI * b + 0.4); g.stroke(); }
  for (let i = 0; i < 5; i++) { const ph = (t * 0.9 + i * 0.3) % 1; FX.sparkle(g, E.W * 0.42 + i * 40, E.H * 0.56 + (i % 2) * 40, 10 * Math.sin(ph * Math.PI), '#ffffff', 0.8); }
  g.restore();
  // Mina's magnified eye swims into the lens
  const ek = ease.inOut(prog(t, tPalm - 0.1, tPalm + 0.5)); if (ek > 0) { const ex = lerp(lx + 600, lx + 60, ek), ey = ly - 30, bl = t > tPalm + 0.8 && t < tPalm + 1.0 ? 1 : 0; g.save(); g.beginPath(); g.arc(lx, ly, lr - 6, 0, 7); g.clip(); g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(ex, ey, 150, 110 * (1 - bl * 0.95), 0, 0, 7); g.fill(); circle(g, ex - 20, ey, 64 * (1 - bl), '#3a2a20'); circle(g, ex - 20, ey, 34 * (1 - bl), '#07060c'); circle(g, ex - 40, ey - 20, 14 * (1 - bl), '#ffffff'); g.restore(); }
  // the lens rim + handle (Mina's hand)
  g.save(); g.translate(lx, ly); g.scale(1 - tilt, 1); ring(g, 0, 0, lr, 26, '#3a3036'); ring(g, 0, 0, lr - 12, 4, alpha('#ffffff', 0.4)); g.restore();
  g.save(); g.translate(lx + lr * 0.7, ly + lr * 0.7); g.rotate(0.8); rr(g, -24, 0, 48, 300, 20); g.fillStyle = '#6a4a2c'; g.fill(); g.restore(); circle(g, lx + lr * 0.7 + 150, ly + lr * 0.7 + 150, 56, S().ink);
  if (t > tGlass) { const u = (t - tGlass) / 0.6; if (u < 1) glow(g, lx - lr * 0.6 + u * lr * 0.8, ly - lr * 0.7, 70, '#ffffff', 0.6 * Math.sin(u * Math.PI)); }
  g.restore();
  atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#fff4dc', far: 10, near: 3 });
} });

// ===================================================================================================
// s018 — '"No glue."'  GIANT FACE MINA, lip-synced; the magnifying glass raised beside her face; suspicious > squint > awe; 'NO GLUE' chip.
registerShot('s018', { draw(g, t, info) {
  const st = info.shot.start, tGlue = sw('glue', st, 0.45);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  blurLayer(g, 10, (g) => hallWall(g, { z: 1.3, x: WX - E.W / 2 + 100, y: -150 }, WX), null, 1); glow(g, E.W * 0.8, E.H * 0.2, 600, '#ffd59a', 0.3);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const talk = talkAmount(st + t, st, st + info.dur), f0 = faceAt(t, [[0, 'suspicious'], [0.15, 'squint'], [tGlue, 'awe']], 0.15), f = { ...f0, open: Math.max(f0.open * 0.3, talk * 0.8) };
  giantFace(g, E.W * 0.44, E.H * 0.58, 320, { who: 'MINA', f, rimSide: 1, rimColor: '#ffd59a', glint: '#fff0d0', blink: blinkAmt(t, 2.9, 4), breath: Math.sin(t * 2.4) });
  const gx = E.W * 0.76, gy = E.H * 0.42; ring(g, gx, gy, 130, 20, '#3a3036'); g.fillStyle = alpha('#cfe8ff', 0.18); g.beginPath(); g.arc(gx, gy, 120, 0, 7); g.fill(); g.save(); g.translate(gx + 92, gy + 92); g.rotate(0.8); rr(g, -18, 0, 36, 220, 16); g.fillStyle = '#6a4a2c'; g.fill(); g.restore();
  g.restore();
  chip(g, t, { str: 'NO GLUE', at: tGlue, x: E.W * 0.5, y: E.H * 0.86, dur: info.dur });
} });

// ===================================================================================================
// s019 — "Jumping spiders don't use glue either."  RULE 1 card over the dimmed hallway with the stick rings still glowing; Pip peeks over the
// bottom edge of the banner and taps it with a front leg on "glue".
registerShot('s019', { draw(g, t, info) {
  const st = info.shot.start, tGlue = sw('glue', st, 1.48);
  ruleCard(g, t, info, { n: 1, title: "STICKY ISN'T GLUE.", bg: (g, t) => { blurLayer(g, 8, (g) => { hallWall(g, { z: 1.3, x: WX - E.W / 2 - 100, y: -200 }, WX); }, null, 1); stickMarks(g, t + 2, [[E.W * 0.6, E.H * 0.3], [E.W * 0.6, E.H * 0.36], [E.W * 0.62, E.H * 0.5]], { alpha: 0.5 }); } });
  const pk = ease.out(prog(t, 0.6, 1.0)); if (pk > 0) pip(g, E.W * 0.68, E.H * 0.86 + (1 - pk) * 80, 1.1, { t, wave: prog(t, tGlue - 0.1, tGlue + 0.1) * (1 - prog(t, tGlue + 0.4, tGlue + 0.6)), look: [-0.3, -0.6], blink: blinkAmt(t, 3, 2) });
} });

// ===================================================================================================
// s020 — "Each foot has a tuft of hairs, and every hair splits into even tinier ones."  FIG 1 - HAIRY FEET: the foot tuft draws on, zooms to
// one hair (on "splits"), then into its tiny split tips.
registerShot('s020', { draw(g, t, info) {
  const st = info.shot.start, tTuft = sw('tuft', st, 0.99), tSplit = sw('splits', st, 2.67), tTiny = sw('tinier', st, 3.65);
  board(g, t, { title: 'FIG 1 - HAIRY FEET', fig: 'NO GLUE' });
  push(g, t, info.dur, () => {
    const zoom = key(t, [[1.67, 0], [tSplit, 1], [info.dur, 1.6]]);
    const F = footHairs(g, t, { x: E.W * 0.4, y: E.H * 0.42, s: 0.9, k: ease.out(prog(t, 0.05, 1.05)), zoom, grip: 0 });
    if (zoom < 0.5 && F.foot) label(g, t, { at: F.foot, to: [F.foot[0] + 260, F.foot[1] - 200], str: 'a tuft of hairs', start: tTuft });
    if (zoom >= 0.5 && F.hair) label(g, t, { at: F.hair, to: [E.W * 0.74, E.H * 0.24], str: 'every hair splits', start: tSplit });
    if (zoom > 1.2 && (F.setule || F.tip)) label(g, t, { at: F.setule || F.tip, to: [E.W * 0.76, E.H * 0.7], str: 'even tinier ones', start: tTiny });
  });
  air(g, t);
} });

// ===================================================================================================
// s021 — "Up that close, molecules pull on each other."  setule tips meet the wall (top), the van der Waals strip below: molecules nanometres
// apart; the faint attraction arrows brighten on "pull".
registerShot('s021', { draw(g, t, info) {
  const st = info.shot.start, tClose = sw('close', st, 0.55), tPull = sw('pull', st, 1.51);
  board(g, t, { title: 'FIG 1 - HAIRY FEET', fig: 'UP THAT CLOSE' });
  push(g, t, info.dur, () => {
    footHairs(g, t, { x: E.W * 0.42, y: E.H * 0.32, s: 0.8, k: 1, zoom: lerp(1.6, 2, ease.inOut(prog(t, 0, 1.4))), grip: 0.2 });
    const V = vdw(g, t, { x: E.W * 0.5, y: E.H * 0.8, w: 900, k: ease.out(prog(t, 0.15, 0.9)), gap: lerp(0.6, 0.2, ease.inOut(prog(t, 0.15, tPull))) });
    if (V?.gap) label(g, t, { at: V.gap, to: [E.W * 0.62, E.H * 0.6], str: 'nanometres apart', start: tClose });
    const pk = prog(t, tPull, tPull + 0.8); if (pk > 0 && pk < 1) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W * 0.5, E.H * 0.8, 520, GOLD(), 0.25 * Math.sin(pk * Math.PI)); g.restore(); }
  });
  air(g, t);
} });

// ===================================================================================================
// s022 — "It's called van der Waals force. One tip barely grips."  gold stamp 'VAN DER WAALS FORCE' on "van"; on "One" a single tip, grip 0.1:
// a cream Pip outline dangling from it slips a notch; label 'one tip: barely'.
registerShot('s022', { draw(g, t, info) {
  const st = info.shot.start, tVan = sw('van', st, 0.59), tOne = sw('one', st, 2.37), tBar = sw('barely', st, 2.79);
  board(g, t, { title: 'FIG 1 - HAIRY FEET', fig: 'VAN DER WAALS' });
  push(g, t, info.dur, () => {
    vdw(g, t, { x: E.W * 0.5, y: E.H * 0.8, w: 900, k: 1, gap: 0.2 });
    const sk = ease.outBack(prog(t, tVan, tVan + 0.35)); if (sk > 0) { g.save(); g.translate(E.W * 0.5, E.H * 0.62); g.rotate(-0.04); g.scale(sk, sk); rr(g, -330, -44, 660, 88, 10); g.fillStyle = '#0b1324'; g.fill(); g.strokeStyle = GOLD(); g.lineWidth = 4; g.stroke(); text(g, 'VAN DER WAALS FORCE', 0, 2, { size: 50, color: GOLD(), font: FONTS.title, spacing: 4 }); g.restore(); }
    if (t > tOne - 0.2) {
      const F = footHairs(g, t, { x: E.W * 0.42, y: E.H * 0.3, s: 0.8, k: 1, zoom: 2, grip: 0.1 }), tip = F.tip || [E.W * 0.42, E.H * 0.36];
      const slip = t > tBar + 0.36 ? 18 * ease.outBack(prog(t, tBar + 0.36, tBar + 0.6)) : 0, py = tip[1] + 120 + slip;
      seg(g, [tip, [tip[0], py - 28]], 2, alpha(S().ui.cream, 0.8)); pipOutline(g, tip[0], py, 1.4); seg(g, [tip, [tip[0] + 40, tip[1] - 10]], 4, GOLD());
      label(g, t, { at: tip, to: [tip[0] + 300, tip[1] + 40], str: 'one tip: barely', start: tBar });
    }
  });
  air(g, t);
} });

// ===================================================================================================
// s023 — "Hundreds of thousands grip a lot."  pull back while hundreds of tips light up gold in a wave across the tuft; the tally plate lands on
// "thousands"; on "lot" the whole foot locks onto the wall with a flash.
registerShot('s023', { draw(g, t, info) {
  const st = info.shot.start, tTh = sw('thousands', st, 0.67), tLot = sw('lot', st, 1.61);
  board(g, t, { title: 'FIG 1 - HAIRY FEET', fig: 'ADD THEM UP' });
  const sc = lerp(1.04, 1.0, ease.inOut(t / info.dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
  footHairs(g, t, { x: E.W * 0.38, y: E.H * 0.45, s: 0.9, k: 1, zoom: lerp(2, 1, ease.inOut(prog(t, 0.1, 1.2))), grip: ease.inOut(prog(t, 0.21, 1.09)) });
  tipTally(g, t, { x: E.W * 0.76, y: E.H * 0.5, k: prog(t, 0.21, tTh + 0.2) });
  const fl = prog(t, tLot, tLot + 0.5); if (fl > 0 && fl < 1) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W * 0.38, E.H * 0.55, 600, GOLD(), 0.4 * Math.sin(fl * Math.PI)); g.restore(); }
  g.restore();
  air(g, t);
} });

// ===================================================================================================
// s024 — "In one study, scientists estimated that a jumping spider's feet"  Pip hangs upside down from the shed window glass, totally relaxed,
// waving one leg on "scientists"; a navy inset card slides in (clipboard + gold 'ESTIMATE' stamp on "estimated"); cream 'one study' tag.
registerShot('s024', { draw(g, t, info) {
  const st = info.shot.start, tOne = sw('one', st, 0.29), tSci = sw('scientists', st, 1.19), tEst = sw('estimated', st, 1.61);
  const z = lerp(1.2, 1.26, ease.inOut(t / info.dur)), wx = E.W / 2 - 300, wy = E.H * 0.8 - 820;
  const cam = { z, x: wx - E.W / 2 + 240, y: wy - E.H / 2 + 150, r: 0 };
  blurLayer(g, 4, (g) => garden(g, t, cam, { view: 'shed', mood: 'morning', door: 0.3 }), null, 1);
  layer(g, cam, 1, (g) => { g.save(); g.translate(wx + 40, wy + 70); g.rotate(Math.PI); pip(g, 0, 0, 1.6, { t, wave: prog(t, tSci, tSci + 0.2) * (1 - prog(t, tSci + 1.2, tSci + 1.4)), look: [0.3, -0.2], blink: blinkAmt(t, 3, 2) }); g.restore(); });
  // the inset blueprint card
  const ck = ease.out(prog(t, 0.2, 0.7)), cx = lerp(E.W + 400, E.W * 0.74, ck), cy = E.H * 0.46;
  rr(g, cx - 280, cy - 220, 560, 440, 16); g.fillStyle = '#0b1324'; g.fill(); g.strokeStyle = alpha(S().ui.cream, 0.6); g.lineWidth = 3; g.stroke();
  g.strokeStyle = alpha('#9ad0ff', 0.25); g.lineWidth = 1; for (let x = cx - 260; x < cx + 280; x += 40) { g.beginPath(); g.moveTo(x, cy - 210); g.lineTo(x, cy + 210); g.stroke(); }
  rr(g, cx - 120, cy - 150, 240, 300, 10); g.strokeStyle = S().ui.cream; g.lineWidth = 4; g.stroke(); rr(g, cx - 50, cy - 170, 100, 40, 8); g.stroke(); for (let i = 0; i < 5; i++) seg(g, [[cx - 90, cy - 80 + i * 44], [cx + 90 - (i % 2) * 40, cy - 80 + i * 44]], 3, alpha(S().ui.cream, 0.7));
  const sk = ease.outBack(prog(t, tEst, tEst + 0.3)); if (sk > 0) { g.save(); g.translate(cx + 20, cy + 40); g.rotate(-0.2); g.scale(lerp(2, 1, sk), lerp(2, 1, sk)); g.globalAlpha *= clamp(sk * 2); rr(g, -150, -40, 300, 80, 8); g.strokeStyle = GOLD(); g.lineWidth = 6; g.stroke(); text(g, 'ESTIMATE', 0, 2, { size: 46, color: GOLD(), font: FONTS.title, spacing: 4 }); g.restore(); }
  chip(g, t, { str: 'one study', at: tOne, x: E.W * 0.22, y: E.H * 0.84, dur: info.dur, tone: 'blue' });
  atmos(g, t, cam, { color: '#fff0d0', far: 12, near: 4 });
} });

// ===================================================================================================
// s025 — "could hold more than a hundred and seventy times its own weight."  the tally plate with '>170x ITS WEIGHT (estimate)' highlighted;
// a cream Pip outline holds up a tower of tiny weight blocks counting up in rows of ten; gold '170' on "seventy", '>170x' on "times".
registerShot('s025', { draw(g, t, info) {
  const st = info.shot.start, tMore = sw('more', st, 0.69), tSev = sw('seventy', st, 1.95), tTimes = sw('times', st, 2.35);
  board(g, t, { title: 'FIG 1 - HAIRY FEET', fig: '>170x (ESTIMATE)' });
  push(g, t, info.dur, () => {
    tipTally(g, t, { x: E.W * 0.74, y: E.H * 0.5, k: 1 });
    g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W * 0.74, E.H * 0.56, 300, GOLD(), 0.14 + 0.08 * Math.sin(t * 3)); g.restore();
    const n = Math.floor(170 * ease.out(prog(t, tMore, tSev))), bx = E.W * 0.3, by = E.H * 0.72;
    pipOutline(g, bx, by + 30, 2.2);
    for (let i = 0; i < n; i++) { const r = Math.floor(i / 10), c = i % 10; rr(g, bx - 100 + c * 20, by - 70 - r * 20, 17, 17, 3); g.fillStyle = alpha(GOLD(), 0.85); g.fill(); }
    const lbl = t < tTimes ? String(n) : '>170x'; text(g, lbl, bx, E.H * 0.16, { size: 110 * (t > tSev ? 1 + 0.15 * Math.exp(-(t - tSev) * 6) : 1), color: GOLD(), glow: 20, glowColor: alpha(GOLD(), 0.7), stroke: 10, strokeColor: '#0b1324' });
    text(g, 'estimate: every tip gripping at once', E.W * 0.74, E.H * 0.86, { size: 30, color: alpha(S().ui.cream, 0.8), font: FONTS.ui, weight: 800 });
  });
  air(g, t);
} });

// ===================================================================================================
// s026 — "Geckos stick the same way, and peel their feet off like tape."  FIG 1b GECKOS: a cream gecko climbs a glass pane on "stick"; on
// "peel" one toe peels off from the tip like tape, a tape strip beside it peels in sync; 'peel like tape' label; the toe re-sticks with a flash.
registerShot('s026', { draw(g, t, info) {
  const st = info.shot.start, tStick = sw('stick', st, 0.54), tPeel = sw('peel', st, 1.8), tLike = sw('like', st, 2.66);
  board(g, t, { title: 'FIG 1b - GECKOS', fig: 'PEEL LIKE TAPE' });
  push(g, t, info.dur, () => {
    const px = E.W * 0.22, py = E.H * 0.18, pw = 640, ph = 760, U = S().ui;
    g.strokeStyle = alpha(U.blueprint || '#9ad0ff', 0.8); g.lineWidth = 5; g.strokeRect(px, py, pw, ph); g.fillStyle = alpha('#9ad0ff', 0.06); g.fillRect(px, py, pw, ph);
    for (let i = 0; i < 3; i++) seg(g, [[px + 60 + i * 30, py + 40], [px + 20 + i * 30, py + 160]], 3, alpha('#ffffff', 0.25));
    const climb = ease.inOut(prog(t, tStick - 0.2, tPeel - 0.2)) * 140;
    gecko(g, { x: px + pw / 2, y: py + ph * 0.7 - climb, s: 2.2, rot: -Math.PI / 2, t, fill: U.cream, flat: true });
    // the toe peel: a little arc lifting off at the gecko's front foot, plus a tape strip doing the same beside it
    const pk = Math.sin(clamp((t - tPeel) / 0.9) * Math.PI), fx = px + pw / 2 + 70, fy = py + ph * 0.7 - climb - 120;
    if (pk > 0.01) { g.strokeStyle = GOLD(); g.lineWidth = 6; g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + 30, fy - 40 * pk, fx + 10, fy - 70 * pk); g.stroke(); }
    const tx = E.W * 0.68, ty = E.H * 0.5; rr(g, tx - 220, ty, 440, 50, 6); g.fillStyle = alpha(U.cream, 0.18); g.fill(); g.strokeStyle = U.cream; g.lineWidth = 4; g.stroke();
    g.save(); g.translate(tx + 220, ty); g.fillStyle = alpha(GOLD(), 0.5); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(80 * pk, -140 * pk, -40 * pk, -220 * pk); g.lineTo(-40 * pk - 10, -220 * pk + 46); g.quadraticCurveTo(70 * pk, -110 * pk, 0, 50); g.closePath(); g.fill(); g.restore();
    label(g, t, { at: [tx, ty], to: [tx - 40, ty + 240], str: 'peel like tape', start: tLike });
    const fl = prog(t, tPeel + 0.9, tPeel + 1.3); if (fl > 0 && fl < 1) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, fx, fy, 80, GOLD(), 0.6 * Math.sin(fl * Math.PI)); g.restore(); }
  });
  air(g, t);
} });
