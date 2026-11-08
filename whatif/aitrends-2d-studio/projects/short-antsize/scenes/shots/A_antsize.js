// A_antsize.js — all 16 shots of the I.Awaken Short "What If You Shrank to the Size of an Ant?" (9:16, 26.3 s).
// HOOK s001 (shrinking on frame 1) -> BUILD-UP s002-s008 (grass forest, gust, off the skyscraper, 100 floors, no parachute, 200 km/h)
// -> PAYOFF s009-s015 (tiny bodies barely fall, land at walking speed, the raindrop that won't let go) -> s016 end card (0.9 s).
// Captions on at y 1330 (keep faces above y 1270); Shorts UI: nothing important below y 1440 or right of x 900.
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, mix, glow, rr, seg, circle, ring, poly, linGrad, radGrad, rng, noise, wordTime, text, shake, FONTS, S } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { blueprint, lineFigure } from '/engine/ui2d.js';
import { actor } from '../sets/actors.js';
import { exprAt, idle, reaction, lookToward, blinkFlag, blinkAmt, camMove, atmos, walkAlong, poseAt, EXTRA } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { grassWorld, grassFg, rooftop, facadeFall, lookDown, pavement, waterDrop, chip, airLines, gust, splashes, GROUND } from '../sets/micro.js';

const tw = (info, w, after = 0) => { const x = wordTime(w, info.shot.start + after); return x == null ? 0.5 : x - info.shot.start; };
const GOLD = () => S().ui.gold;
const hero = (g, o) => actor(g, 'HERO', { blink: blinkFlag(o.t ?? 0, 3.1, 2), ...o });
const FALL = { head: [-6, -214], sh: [-4, -178], hip: [0, -100], eF: [-40, -200], hF: [-58, -238], eB: [34, -196], hB: [54, -232], kF: [24, -60], fF: [40, -20], kB: [-20, -54], fB: [-30, -6] };   // arms + legs flung
const FLOAT = { head: [8, -206], sh: [4, -172], hip: [0, -100], eF: [44, -170], hF: [74, -178], eB: [-36, -166], hB: [-66, -172], kF: [20, -52], fF: [30, -8], kB: [-12, -50], fB: [-20, -4] };    // arms out, gliding
const LOUNGE = { head: [-30, -196], sh: [-22, -164], hip: [0, -100], eF: [-44, -196], hF: [-30, -224], eB: [-56, -188], hB: [-44, -220], kF: [40, -120], fF: [60, -70], kB: [44, -110], fB: [74, -66] }; // hands behind head, legs crossed
const PUSH = { head: [8, -206], sh: [4, -172], hip: [0, -100], eF: [48, -170], hF: [82, -186], eB: [40, -160], hB: [78, -150], kF: [14, -50], fF: [26, 0], kB: [-10, -50], fB: [-24, 0] };      // palms on the drop wall
const flap = (p, t, amt = 6) => { const q = {}; for (const k in p) q[k] = [p[k][0] + Math.sin(t * 19 + k.length) * (k[0] === 'h' && k !== 'hip' ? amt : amt * 0.3), p[k][1] + Math.cos(t * 17 + k.length * 2) * amt * 0.5]; return q; };

// ===================================================================================================
// s001 — "What if you shrank to the size of an ant?"  HOOK: frame 1 the hero is already shrinking, the grass world zooms up around them.
registerShot('s001', { draw(g, t, info) {
  const tShr = tw(info, 'shrank'), tAnt = tw(info, 'ant'), k = ease.out(prog(t, 0, 1.6));
  const cam = { z: lerp(0.5, 1.04, k), x: Math.sin(t * 0.7) * 8, y: lerp(260, 0, k), r: Math.sin(t * 2) * 0.01 * (1 - k) };
  const W = grassWorld(g, t, cam, { sneaker: true, dew: false });
  FX.speedLines(g, t, { cx: E.W / 2, cy: 820, count: 70, a: 0.3 * (1 - k * 0.8), inner: 330, color: '#fff3d8' });
  const s = lerp(3.4, 2.05, k), y = lerp(1500, W.GY + 10, k), rot = Math.sin(t * 5) * 0.25 * (1 - k);
  // shrink sparkle rings around the hero
  FX.rings(g, E.W / 2, y - 220 * s / 2, t, { count: 3, r0: 60, r1: 420, color: '#ffe9b0', a: 0.45 * (1 - k * 0.6), speed: 1.8, w: 5 });
  layer(g, cam, 1, () => {});
  const pose = t < tAnt ? reaction('shock', t, 0.05) : reaction('lookUp', t, tAnt, 'shock');
  hero(g, { x: E.W / 2 - 40, y, s, pose: idle(pose, t, 1), expr: exprAt(t, [[0, 'surprised'], [tShr, 'shocked'], [tAnt, 'awe']]), look: t > tAnt ? [0.2, -0.9] : [0, 0], rot, rim: W.rim, t });
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 3; FX.sparkle(g, E.W / 2 - 40 + Math.cos(a) * 200 * s / 2, y - 240 * s / 2 + Math.sin(a) * 260 * s / 2, 18, '#fff4c8', 0.7 * (1 - k * 0.7)); }
  grassFg(g, t, cam);
  atmos(g, t, cam, { color: '#fff0c8', far: 22, near: 8 });
  chip(g, t, tAnt, 'ANT-SIZED YOU', { y: 330 });
} });

// s002 — "Grass becomes a forest."  low angle among blades like tree trunks, a car-sized dew drop glints; awe on 'forest'.
registerShot('s002', { draw(g, t, info) {
  const tF = tw(info, 'forest'), cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [-30, 30], y: [-120, -160] });
  const W = grassWorld(g, t, cam, { cap: true });
  layer(g, cam, 1, (g) => {
    const look = lookToward(0.35, -1);
    hero(g, { x: W.CX - 200, y: W.GY + 40, s: 2.0, pose: idle(reaction('lookUp', t, 0.25), t, 2), expr: exprAt(t, [[0, 'surprised'], [tF, 'awe']]), look, rim: W.rim, t });
    FX.godRays(g, E.W * 0.85, 200, { angle: 2.1, spread: 0.6, len: 1700, a: 0.08, t });
    if (t > tF) FX.sparkle(g, W.CX + 120 - 40, W.GY - 520, 30 * ease.outBack(prog(t, tF, tF + 0.3)), '#ffffff', 0.9);
  });
  grassFg(g, t, cam);
  atmos(g, t, cam, { color: '#fff0c8', far: 26, near: 10 });
} });

// s003 — "Then a gust throws you off a"  ant-scale rooftop parapet, golden city below; the gust hits on 'gust', lifts the hero on 'throws'.
registerShot('s003', { draw(g, t, info) {
  const tG = tw(info, 'gust'), tT = tw(info, 'throws'), sh = t > tG ? shake(t, 6 * (1 - prog(t, tG, tG + 0.6)), 3) : [0, 0];
  const cam = { ...camMove(t, info.dur, { z: [1.02, 1.1], x: [0, 60] }), x: sh[0], y: sh[1] };
  const R = rooftop(g, t, cam);
  const lift = ease.in(prog(t, tT, info.dur)), x = R.CX - 160 + lift * 420, y = R.GY + 30 - lift * 220;
  layer(g, cam, 1, (g) => {
    let pose = t < tG ? 'stand' : t < tT ? 'shock' : FALL; const base = t < tG ? EXTRA.lookUp : null;
    pose = t < tG ? idle(blendPose(POSES.stand, EXTRA.shock, 0.1), t, 3) : t < tT ? reaction('wince', t, tG) : flap(FALL, t, 4);
    hero(g, { x, y, s: 2.0, facing: -1, pose, rot: lift * 0.9, expr: exprAt(t, [[0, 'smile'], [tG, 'nervous'], [tT, 'shocked']]), look: t > tG ? [-0.9, -0.1] : [0.6, 0], rim: R.rim, t });
  });
  if (t > tG - 0.1) gust(g, t, { a: 0.6 * clamp((t - tG + 0.1) / 0.2), y: 500, h: 900 });
  atmos(g, t, cam, { color: '#ffe6c8', far: 20, near: 8 });
} });

// s004 — "skyscraper."  looking straight down the facade: the hero tumbles away toward the street far below.
registerShot('s004', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.12], y: [-40, 30] });
  lookDown(g, t, cam);
  const k = ease.in(prog(t, 0, info.dur)), s = lerp(2.1, 1.35, k), y = lerp(700, 1020, k), x = E.W / 2 + Math.sin(t * 2) * 60;
  hero(g, { x, y, s, pose: flap(FALL, t, 7), rot: t * 4.2, expr: exprAt(t, [[0, 'shocked'], [0.5, 'scared']]), shadow: false, rim: { color: '#ffd09a', dir: [0, -1] }, t });
  gust(g, t * 0.6, { a: 0.4, n: 22, seed: 8 });
  FX.speedLines(g, t, { cx: E.W / 2, cy: 1700, count: 60, a: 0.22, inner: 380 });
  text(g, '↓ 100 FLOORS ↓', E.W / 2, 300, { size: 54, color: GOLD(), weight: 900, glow: 18, glowColor: alpha(GOLD(), 0.5), alpha: ease.out(prog(t, 0.2, 0.5)) });
} });

// s005 — "A hundred floors."  falling past the glass facade; the gold floor counter ticks down 100 -> 80; shocked on 'floors'.
registerShot('s005', { draw(g, t, info) {
  const tH = tw(info, 'hundred'), tFl = tw(info, 'floors'), cam = camMove(t, info.dur, { z: [1.06, 1.0], x: [20, -20] });
  facadeFall(g, t, cam, { speed: 2400, streaks: 0.8 });
  const sh = shake(t, 5, 2.4, 5);
  hero(g, { x: E.W * 0.66 + sh[0], y: 1150 + sh[1], s: 2.1, pose: flap(FALL, t, 6), rot: -0.25 + Math.sin(t * 3) * 0.12, expr: exprAt(t, [[0, 'scared'], [tFl, 'shocked']]), look: [-0.4, 0.8], shadow: false, rim: { color: '#ffd09a', dir: [0.6, -0.8] }, t });
  const n = Math.round(lerp(100, 80, prog(t, tH, info.dur)));
  const pop = 1 + 0.12 * Math.max(0, 1 - ((t * 14) % 1) * 3) * (t > tH ? 1 : 0);
  g.save(); g.translate(E.W * 0.5, 400); g.scale(pop, pop);
  text(g, `FLOOR ${n}`, 0, 0, { size: 96, color: GOLD(), weight: 900, glow: 24, glowColor: alpha(GOLD(), 0.6), stroke: 10, strokeColor: '#1a1428', alpha: ease.out(prog(t, 0, 0.2)) });
  g.restore();
} });

// s006 — "No parachute."  GIANT FACE in the wind: shocked -> worried on 'parachute'; hood flapping, facade streaks behind.
registerShot('s006', { draw(g, t, info) {
  const tP = tw(info, 'parachute'), cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  facadeFall(g, t, cam, { speed: 3000, streaks: 1 });
  veil(g, '#1a1030', 0.25);
  const sh = shake(t, 7, 3, 2), f = faceAt(t, [[0, 'shocked'], [tP, 'worried'], [tP + 0.5, { ...{ eye: 1.25, pupil: 0.5, brow: 0.9, tilt: -0.8, open: 0.6, smile: -0.6, w: 0.6, sweat: 1 } }]]);
  giantFace(g, E.W / 2 + sh[0], 860 + sh[1], 330, { who: 'HERO', f, rimColor: '#ffd09a', rimSide: 1, blink: blinkAmt(t, 3.3, 1), tilt: Math.sin(t * 6) * 0.04 });
  // tiny parachute icon crossed out
  const a = ease.outBack(prog(t, tP, tP + 0.3));
  if (a > 0) { g.save(); g.translate(E.W * 0.66, 300); g.scale(a, a); g.fillStyle = '#ff6f61'; g.beginPath(); g.arc(0, 0, 70, Math.PI, 0); g.closePath(); g.fill(); for (const dx of [-70, -24, 24, 70]) seg(g, [[dx, 0], [0, 90]], 4, '#fff1dc'); seg(g, [[-95, -80], [95, 110]], 14, '#fff1dc'); seg(g, [[-95, -80], [95, 110]], 8, '#d4262e'); g.restore(); }
  gust(g, t, { a: 0.35, n: 20, seed: 12 });
} });

// s007 — "Full size, you'd hit at around"  BLUEPRINT: a 100-floor tower outline; a full-size line figure drops fast; gold FULL SIZE.
registerShot('s007', { draw(g, t, info) {
  const tF = tw(info, 'full'), z = lerp(1, 1.04, t / info.dur); blueprint(g, { grid: 60, a: 0.08 });
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const bp = S().ui.blueprint, d = ease.out(prog(t, 0, 0.8)), top = 260, bot = 1300;
  g.strokeStyle = bp; g.lineWidth = 5; g.beginPath(); g.moveTo(170, bot); g.lineTo(170, lerp(bot, top, d)); g.lineTo(390, lerp(bot, top, d)); g.lineTo(390, bot); g.stroke();
  for (let i = 1; i < 25; i++) { const y = lerp(bot, top, i / 25); if (y > lerp(bot, top, d)) seg(g, [[170, y], [390, y]], 1.5, alpha(bp, 0.4)); }
  seg(g, [[60, bot], [E.W - 60, bot]], 5, bp);
  text(g, '100 FLOORS', 280, top - 50, { size: 44, color: GOLD(), weight: 900, alpha: d });
  const fk = ease.in(prog(t, 0.25, info.dur + 0.4)), fy = lerp(top + 400, bot - 10, fk);
  for (let i = 4; i >= 1; i--) { g.globalAlpha = 0.18 * (5 - i) / 4; lineFigure(g, { x: 700, y: fy - i * 70 * fk, s: 1.1, pose: FALL, color: '#e8f0ff' }); }
  g.globalAlpha = 1; lineFigure(g, { x: 700, y: fy, s: 1.1, pose: FALL, color: '#e8f0ff' });
  for (let i = 0; i < 6; i++) seg(g, [[640 + i * 24, fy - 330 - i * 10], [640 + i * 24, fy - 460 - i * 20]], 3, alpha('#e8f0ff', 0.5));
  // the tiny ant-size "you" for scale
  circle(g, 900, bot - 8, 6, GOLD()); text(g, 'YOU (ANT)', 900, bot - 60, { size: 36, color: alpha(GOLD(), 0.8), weight: 800, alpha: d });
  g.restore();
  chip(g, t, tF, 'FULL SIZE', { y: 250, x: E.W * 0.62 });
} });

// s008 — "two hundred kilometres an hour."  BLUEPRINT GAUGE: needle swings to ~200 on 'two', gold number pops, red zone glows.
registerShot('s008', { draw(g, t, info) {
  const tT = tw(info, 'two'), tH = tw(info, 'hour'); blueprint(g, { grid: 60, a: 0.08 });
  const cx = E.W / 2, cy = 900, R = 360, bp = S().ui.blueprint, z = lerp(1, 1.05, t / info.dur), sh = t > tT && t < tT + 0.3 ? shake(t, 6, 6) : [0, 0];
  g.save(); g.translate(cx + sh[0], cy + sh[1]); g.scale(z, z);
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  g.strokeStyle = alpha(bp, 0.9); g.lineWidth = 8; g.beginPath(); g.arc(0, 0, R, a0, a1); g.stroke();
  g.strokeStyle = alpha('#ff6f61', 0.9); g.lineWidth = 22; g.beginPath(); g.arc(0, 0, R - 26, lerp(a0, a1, 0.72), a1); g.stroke();
  for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); seg(g, [[Math.cos(a) * (R - 50), Math.sin(a) * (R - 50)], [Math.cos(a) * R, Math.sin(a) * R]], i % 5 ? 3 : 6, bp); if (i % 2 === 0) text(g, `${i * 25}`, Math.cos(a) * (R - 100), Math.sin(a) * (R - 100), { size: 38, color: '#e8f0ff', font: FONTS.ui, weight: 800 }); }
  const v = key(t, [[0, 0], [tT, 20], [tT + 0.6, 205, ease.outBack], [info.dur, 200]]), na = lerp(a0, a1, v / 250);
  seg(g, [[0, 0], [Math.cos(na) * (R - 60), Math.sin(na) * (R - 60)]], 10, GOLD()); circle(g, 0, 0, 22, GOLD());
  if (v > 170) glow(g, Math.cos(na) * (R - 60), Math.sin(na) * (R - 60), 140, '#ff6f61', 0.5);
  g.restore();
  const pk = ease.outBack(prog(t, tT, tT + 0.4));
  if (pk > 0) { g.save(); g.translate(cx, 470); g.scale(pk, pk); text(g, '~200 km/h', 0, 0, { size: 120, color: GOLD(), weight: 900, glow: 30, glowColor: alpha(GOLD(), 0.6), stroke: 12, strokeColor: '#0b1324' }); g.restore(); }
  lineFigure(g, { x: cx, y: 1235, s: 0.5, pose: FALL, color: alpha('#e8f0ff', 0.8) });
  if (t > tH) { const k = prog(t, tH, tH + 0.4); for (let i = 0; i < 6; i++) { const a = Math.PI + i / 5 * Math.PI; seg(g, [[cx, 1245], [cx + Math.cos(a) * 90 * k, 1245 + Math.sin(a) * 40 * k]], 4, alpha('#ff6f61', 1 - k)); } }
} });

// s009 — "But tiny bodies barely fall."  back in the golden sky: the tiny hero drifts slowly beside the tower, air streamlines curl
// round them; surprised on 'barely', smile on 'fall'. Chip TINY = SLOW FALL.
registerShot('s009', { draw(g, t, info) {
  const tB = tw(info, 'barely'), tFa = tw(info, 'fall'), cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [0, -30] });
  facadeFall(g, t, cam, { speed: 140, y0: 900 });
  const x = E.W * 0.64, y = 1060 + Math.sin(t * 1.3) * 16;
  airLines(g, t, x, y - 200, { a: 0.5, w: 380 });
  hero(g, { x, y, s: 2.05, pose: idle(t < tB ? flap(FALL, t, 2) : poseAt(t, [[0, FALL], [tB, FLOAT]], 0.4), t, 4), rot: lerp(-0.25, -0.05, prog(t, tB, tB + 0.5)), expr: exprAt(t, [[0, 'scared'], [tB, 'surprised'], [tFa, 'smile']]), look: t > tB ? [-0.5, 0.4] : [0, 0.5], shadow: false, rim: { color: '#ffd09a', dir: [0.6, -0.8] }, t });
  atmos(g, t, cam, { color: '#fff0d0', far: 24, near: 10 });
  chip(g, t, tB, 'TINY = SLOW FALL', { y: 330 });
} });

// s010 — "The air holds you."  the hero lounges on the rising air like a hammock; a leaf floats down at the same speed; smirk on 'holds'.
registerShot('s010', { draw(g, t, info) {
  const tHo = tw(info, 'holds'), cam = camMove(t, info.dur, { z: [1.08, 1.0], x: [-20, 20] });
  facadeFall(g, t, cam, { speed: 110, y0: 2600 });
  const x = E.W * 0.6, y = 1000 + Math.sin(t * 1.1) * 14, p = poseAt(t, [[0, FLOAT], [tHo - 0.1, LOUNGE]], 0.45);
  // cushion of air: soft cream arrows pushing up under the hero
  for (let i = 0; i < 5; i++) { const ax = x - 200 + i * 100, ph = ((t * 1.2 + i * 0.23) % 1), ay = y + 220 - ph * 220; g.save(); g.globalAlpha = 0.55 * Math.sin(ph * Math.PI); seg(g, [[ax, ay + 70], [ax, ay]], 8, '#fff1dc'); poly(g, [[ax - 22, ay + 10], [ax + 22, ay + 10], [ax, ay - 22]], '#fff1dc'); g.restore(); }
  airLines(g, t, x, y - 150, { a: 0.3, w: 420, n: 7 });
  hero(g, { x, y, s: 2.05, pose: idle(p, t, 5), rot: lerp(0, -0.35, prog(t, tHo - 0.1, tHo + 0.4)), expr: exprAt(t, [[0, 'smile'], [tHo, 'smirk']]), look: [-0.6, 0.2], shadow: false, rim: { color: '#ffd09a', dir: [0.6, -0.8] }, t });
  // a dry leaf drifting alongside
  g.save(); g.translate(E.W * 0.28 + Math.sin(t * 1.6) * 60, 760 + Math.cos(t * 1.6) * 30); g.rotate(Math.sin(t * 1.6) * 0.6); g.fillStyle = '#d97a2a'; g.beginPath(); g.ellipse(0, 0, 90, 34, 0, 0, Math.PI * 2); g.fill(); seg(g, [[-90, 0], [90, 0]], 4, '#8a4a1a'); g.restore();
  atmos(g, t, cam, { color: '#fff0d0', far: 24, near: 10 });
} });

// s011 — "You land at walking speed, and walk away."  ant-scale pavement: soft landing + dust puff on 'land', gold ~7 km/h on
// 'walking', then a delighted stroll to the right on 'walk' (walk locked to world x, camera follows).
registerShot('s011', { draw(g, t, info) {
  const tL = tw(info, 'land'), tWk = tw(info, 'walking'), tAw = tw(info, 'walk', 1.2);
  const wx = tAw < 0.4 ? 0 : Math.max(0, t - tAw) * 300 * 1.0;
  const cam = { ...camMove(t, info.dur, { z: [1.05, 1.0] }), x: wx * 0.85 - 40 };
  const P = pavement(g, t, cam);
  const fallK = ease.out(prog(t, 0, tL)), hx = P.CX - 120 + wx, hy = lerp(P.GY - 380, P.GY + 120, fallK);
  layer(g, cam, 1, (g) => {
    let pose, expr;
    if (t < tL) { pose = idle(FLOAT, t, 6); expr = 'smile'; }
    else if (t < tAw) { pose = idle(reaction('delight', t, tWk, 'crouch'), t, 6); if (t < tWk) pose = idle(blendPose(POSES.crouch, POSES.stand, prog(t, tL, tL + 0.3)), t, 6); expr = exprAt(t, [[0, 'surprised'], [tWk, 'joy']]); }
    else { pose = walkAlong(wx, 2.0).pose; expr = 'happy'; }
    hero(g, { x: hx, y: hy, s: 2.0, pose, expr, look: t > tAw ? [1, 0] : [0.3, -0.2], shadow: t > tL - 0.1, rim: P.rim, t });
    if (t > tL) { const k = prog(t, tL, tL + 0.7); for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; circle(g, P.CX - 120 + Math.cos(a) * (60 + k * 160), P.GY + 120 + Math.sin(a) * 30 * k - k * 20, 26 * (1 - k), alpha('#e6d8c8', 0.6 * (1 - k))); } }
  });
  atmos(g, t, cam, { color: '#fff0c8', far: 22, near: 8 });
  chip(g, t, tWk, '~7 km/h  WALKING SPEED', { y: 330, size: 58 });
} });

// s012 — "Then one raindrop"  the sky greys, a drop's shadow swells around the walking hero; lookUp on 'raindrop'; the drop enters from the top.
registerShot('s012', { draw(g, t, info) {
  const tR = tw(info, 'raindrop'), k = prog(t, 0, info.dur), wx = 300 * (2.52 - 1.57 + t);
  const cam = { ...camMove(t, info.dur, { z: [1.0, 0.94] }), x: wx * 0.85 - 40, y: lerp(0, -80, k) };
  const dropY = lerp(-260, 420, ease.in(prog(t, 0, info.dur + 0.1)));
  const P = pavement(g, t, cam, { grey: lerp(0.3, 0.75, k), shadow: { x: P0(wx), r: lerp(120, 420, ease.in(k)), a: 0.4 + 0.8 * k } });
  layer(g, cam, 1, (g) => {
    const stop = t > tR, pose = stop ? idle(reaction('lookUp', t, tR + 0.1, 'stand'), t, 7) : walkAlong(wx, 2.0).pose;
    hero(g, { x: P0(wx), y: P.GY + 120, s: 2.0, pose, expr: exprAt(t, [[0, 'happy'], [tR + 0.1, 'shocked']]), look: stop ? [0, -1] : [1, 0], rim: P.rim, t });
  });
  waterDrop(g, E.W / 2, dropY, 330, t, { wob: 0.04 });
  FX.rain(g, t, { count: 60, a: 0.25 * k, speed: 1800, len: 120, w: 4, color: '#dfeaff' });
  splashes(g, t, P.GY - cam.y, { n: 3, seed: 5 });
} });
const P0 = (wx) => E.W / 2 - 120 + wx + 30;

// s013 — "grabs you, and won't let go."  SPLASH on the cut: the drop sits over the hero; they push the wall, it bulges and snaps back.
registerShot('s013', { draw(g, t, info) {
  const tWo = tw(info, "won't"), tLet = tw(info, 'let'), cam = camMove(t, info.dur, { z: [1.12, 1.04], y: [-40, -20] });
  const P = pavement(g, t, cam, { grey: 0.75 });
  const cx = E.W / 2 - 40, gy = P.GY + 120, R = 400, cy = gy - R * 0.86 + 40;
  const pushK = Math.max(0, Math.sin(clamp((t - 0.6) / 1.2) * Math.PI)) * (t > 0.6 ? 1 : 0);
  layer(g, cam, 1, (g) => {
    const pose = t < 0.5 ? reaction('wince', t, 0) : idle(blendPose(EXTRA.wince, PUSH, prog(t, 0.5, 0.8)), t, 8);
    hero(g, { x: cx - 40 + pushK * 30, y: gy, s: 2.0, pose, expr: exprAt(t, [[0, 'shocked'], [0.6, 'determined'], [tWo, 'worried'], [tLet, 'scared']]), look: [1, -0.1], rim: { color: '#dfe8ff', dir: [0.7, -0.7] }, t });
    // the bulge where the palms push
    if (pushK > 0.05) { g.save(); g.strokeStyle = alpha('#f4fbff', 0.8 * pushK); g.lineWidth = 6; g.beginPath(); g.arc(cx + 220, cy + 40, 120 + pushK * 40, -0.9, 0.9); g.stroke(); g.restore(); }
    waterDrop(g, cx, cy, R, t, { grounded: true, wob: 0.015 + 0.05 * Math.max(0, 1 - t * 2) });
  });
  // splash crown on the first frames
  if (t < 0.5) { const k = t / 0.5; for (let i = 0; i < 14; i++) { const a = Math.PI + i / 13 * Math.PI; circle(g, cx + Math.cos(a) * (R + k * 260), cy + Math.sin(a) * (R * 0.9 + k * 200) - k * (1 - k) * 300, 34 * (1 - k), alpha('#e8f6ff', 0.8 * (1 - k))); } }
  FX.rain(g, t, { count: 50, a: 0.2, speed: 1800, len: 120, w: 4, color: '#dfeaff' });
  splashes(g, t, P.GY, { n: 3, seed: 9 });
  FX.drops(g, t, { count: 14, area: [cx - R * 0.8, cy - R * 0.7, R * 1.6, R * 1.4], rMin: 6, rMax: 18, color: '#e8f6ff', drift: 10 });
  chip(g, t, tWo, 'SURFACE TENSION', { y: 330 });
} });

// s014 — "For you, water is scarier than gravity."  GIANT FACE inside the drop: blue tint, bubbles; worried -> shocked on 'scarier';
// chip WATER > GRAVITY on 'gravity'.
registerShot('s014', { draw(g, t, info) {
  const tSc = tw(info, 'scarier'), tGr = tw(info, 'gravity'), cam = camMove(t, info.dur, { z: [1.0, 1.08] });
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#9ec8ec', '#6a9cd0', '#3a5c94']); g.fillRect(0, 0, E.W, E.H);
  FX.godRays(g, E.W * 0.3, -100, { angle: 1.4, spread: 0.7, len: 2000, a: 0.12, t, color: '#eaf6ff' });
  const f = faceAt(t, [[0, 'worried'], [tSc, 'shocked'], [tGr, 'sheepish']]);
  giantFace(g, E.W / 2 + Math.sin(t * 1.2) * 10, 820, 320, { who: 'HERO', f, rimColor: '#dff2ff', rimSide: -1, glint: '#cfefff', blink: blinkAmt(t, 3.0, 4), tilt: Math.sin(t * 0.9) * 0.05 });
  veil(g, '#6ab0ff', 0.14, 'source-over');
  // rising bubbles + caustic shimmer
  const r = rng(3); for (let i = 0; i < 22; i++) { const x = r() * E.W, sp = 120 + r() * 200, y = E.H - ((r() * E.H + t * sp) % (E.H + 200)), rad = 8 + r() * 26; ring(g, x + Math.sin(t * 2 + i) * 14, y, rad, 3, alpha('#f4fbff', 0.6)); circle(g, x + Math.sin(t * 2 + i) * 14 - rad * 0.3, y - rad * 0.3, rad * 0.25, alpha('#ffffff', 0.7)); }
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const y = 200 + i * 260 + Math.sin(t * 1.5 + i) * 30; g.strokeStyle = alpha('#eaf6ff', 0.08); g.lineWidth = 30; g.beginPath(); g.moveTo(-50, y); for (let x = 0; x <= E.W + 50; x += 60) g.lineTo(x, y + Math.sin(x * 0.01 + t * 2 + i) * 40); g.stroke(); } g.restore();
  // the drop's curved wall at the frame edge
  ring(g, E.W / 2, 860, 1000, 14, alpha('#f4fbff', 0.5));
  chip(g, t, tGr, 'WATER > GRAVITY', { y: 330 });
} });

// s015 — "Would you risk it?"  pull back: the hero trapped in the drop on the wet pavement, rain all around; cheeky look to camera on 'risk'.
registerShot('s015', { draw(g, t, info) {
  const tRk = tw(info, 'risk'), cam = camMove(t, info.dur, { z: [1.12, 0.98], y: [-40, 0] });
  const P = pavement(g, t, cam, { grey: 0.7 });
  const cx = E.W / 2 - 60, gy = P.GY + 120, R = 330, cy = gy - R * 0.86 + 34;
  layer(g, cam, 1, (g) => {
    hero(g, { x: cx, y: gy, s: 1.75, pose: idle(t < tRk ? POSES.crossArms : POSES.shrug, t, 9), expr: exprAt(t, [[0, 'worried'], [tRk, 'smirk']]), look: [0, 0], rim: { color: '#dfe8ff', dir: [0.7, -0.7] }, t });
    waterDrop(g, cx, cy, R, t, { grounded: true, wob: 0.012 });
    waterDrop(g, cx + 470, gy - 120, 130, t + 1, { grounded: true, wob: 0.02 });
  });
  FX.rain(g, t, { count: 80, a: 0.25, speed: 1800, len: 120, w: 4, color: '#dfeaff' });
  splashes(g, t, P.GY - cam.y, { n: 4, seed: 13 });
  const q = ease.outBack(prog(t, tRk + 0.2, tRk + 0.5));
  if (q > 0) { g.save(); g.translate(E.W * 0.7, 520); g.scale(q, q); text(g, '?', 0, 0, { size: 200, color: GOLD(), weight: 900, glow: 30, glowColor: alpha(GOLD(), 0.6), stroke: 12, strokeColor: '#1a1428' }); g.restore(); }
} });

// s016 — end card (0.9 s): "Follow for more What Ifs." quick bright card, the hero (in the drop) waves.
registerShot('s016', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3d3360', '#8a5a86', '#e8956b']); g.fillRect(0, 0, E.W, E.H);
  glow(g, E.W / 2, E.H * 0.42, 700, '#ffd59a', 0.35);
  const k = ease.outBack(prog(t, 0, 0.25));
  g.save(); g.translate(E.W / 2, 560); g.scale(k, k);
  text(g, 'FOLLOW FOR MORE', 0, 0, { size: 84, color: S().ui.cream, weight: 900, stroke: 12, strokeColor: '#1a1428', glow: 20, glowColor: 'rgba(255,150,80,.6)' });
  text(g, 'WHAT IFS', 0, 120, { size: 130, color: GOLD(), weight: 900, stroke: 14, strokeColor: '#1a1428', glow: 30, glowColor: alpha(GOLD(), 0.6) });
  g.restore();
  hero(g, { x: E.W / 2 - 40, y: 1250, s: 1.7, pose: idle(POSES.wave, t, 1), expr: 'happy', rim: { color: '#ffd09a', dir: [0, -1] }, t });
  waterDrop(g, E.W / 2 - 40, 1250 - 300 * 0.86 + 30, 300, t, { grounded: true, wob: 0.01, a: 0.8 });
} });
