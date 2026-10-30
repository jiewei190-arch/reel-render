// A_s017_s026_day2_rule1.js — batch A, DAY 2 + RULE 1 (50.51-83.61): too sore to brush, Mina checks the brush ("Still all there."),
// RULE 1 card, DOMS blueprint, the new move, the slow squat, the calendar, the milder second time, the repeated bout effect.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, shade, glow, text, FONTS, rr, seg, circle, poly, rng, talkAmount } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, blendPose, breathe } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, label } from '../sets/bp.js';
import { muscle, soreCurve } from '../sets/body.js';
import { home3, home3Fg, timeSkip, calendar } from '../sets/home3.js';
import { pushUp, squat, soreStand, fatigue, trainee } from '../sets/train.js';
import { sw, hairbrush, stepStool, handAt } from './A_lib.js';

const GOLD = () => S().ui.gold;
const push = (g, t, dur, fn, amt = 0.035) => { const z = 1 + amt * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 31 });
// the bathroom mirror reflection: the same figure, flipped, clipped to the glass and tinted
function reflect(g, H, who, o) {
  const mx = H.pos.mirrorX, my = H.pos.mirrorY;
  g.save(); rr(g, mx - 150, my + 10, 300, 240, 10); g.clip(); g.globalAlpha *= 0.55;
  actor(g, who, { ...o, x: mx - (o.x - mx) * 0.35, facing: -(o.facing ?? 1), shadow: false, rim: false });
  g.fillStyle = alpha('#c8d8e4', 0.25); g.fillRect(mx - 150, my + 10, 300, 240);
  g.restore();
}
const heatGlow = (g, p, o, a) => { if (a <= 0.01) return; const s = o.s, f = o.facing ?? 1, k = [(p.hip[0] + p.kF[0]) / 2, (p.hip[1] + p.kF[1]) / 2]; glow(g, o.x + k[0] * f * s, o.y + k[1] * s, 70 * s, '#ff4a3a', 0.55 * a); };

// ===================================================================================================
// s017 — "Day two, you can't lift your arms to brush your hair."  DAY 2 card flips in; at the mirror HERO tries to lift the hairbrush on
// "lift": the arms only reach chest height, trembling, then drop. The mirror repeats the struggle.
registerShot('s017', { draw(g, t, info) {
  const st = info.shot.start, tDay = sw('day', st, 0.15), tLift = sw('lift', st, 1.25), tHair = sw('hair', st + 2, 2.49);
  const cam = camMove(t, info.dur, { z: [1.16, 1.22], x: [-240, -200], y: [20, 14] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'dawn', steam: 0.1 });
  const lift = key(t, [[tLift - 0.1, 0], [tLift + 0.6, 0.8], [tHair - 0.1, 0.7], [tHair + 0.35, 0.05]]);
  const o = { x: H.pos.mirrorX + 300, y: H.GY + 20, s: 1.9, facing: -1 };
  const pose = soreStand(t, { lift, seed: 2 });
  const fx = { expr: exprAt(t, [[0, 'sleepy'], [tLift, 'nervous'], [tHair, 'cry']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(-1, -0.2 - 0.4 * lift), t };
  layer(g, cam, 1, (g) => {
    reflect(g, H, 'HERO', { ...o, pose, ...fx });
    actor(g, 'HERO', { ...o, pose, ...fx, rim: H.rim });
    const [bx, by] = handAt(o, pose); hairbrush(g, bx, by, 2.4 - lift * 0.9, 1.3);
    if (lift > 0.3) for (let i = 0; i < 3; i++) { const a = -1.9 + i * 0.4, r0 = 60 + ((t * 3 + i * 0.3) % 1) * 30; seg(g, [[bx + Math.cos(a) * r0, by + Math.sin(a) * r0], [bx + Math.cos(a) * (r0 + 16), by + Math.sin(a) * (r0 + 16)]], 4, alpha('#fff6dc', 0.7)); }   // strain marks
  });
  home3Fg(g, t, cam, { room: 'bathroom' });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  timeSkip(g, t, { x: E.W - 260, y: 70, s: 0.42, keys: [[0, 'DAY 1'], [tDay, 'DAY 2']] });
} });

// ===================================================================================================
// s018 — "Mina does it, then checks the brush."  MINA on a step stool brushes his curls on "does" (the curls bounce); on "checks" she holds
// the brush up to the light and squints at it. HERO droops.
registerShot('s018', { draw(g, t, info) {
  const st = info.shot.start, tDoes = sw('does', st, 0.45), tChk = sw('checks', st, 1.05);
  const cam = camMove(t, info.dur, { z: [1.2, 1.24], x: [-170, -140], y: [10, 6] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'dawn', steam: 0.1 });
  const hx = H.pos.mirrorX + 260, ho = { x: hx, y: H.GY + 20, s: 1.9, facing: -1 };
  const mX = hx + 150, stoolS = 1.3, mo = { x: mX, y: H.GY + 20 - 70 * stoolS, s: 2.0, facing: -1 };
  const strokeK = t > tDoes - 0.1 && t < tChk ? Math.sin((t - tDoes) * 13) : 0;
  const brushP = { ...POSES.reach, eF: [34, -196], hF: [60 + strokeK * 8, -210 + Math.abs(strokeK) * 10] };
  const checkP = { ...POSES.pointUp, head: [6, -212], eF: [16, -206], hF: [24, -250] };
  const mp = idle(poseAt(t, [[0, 'stand'], [tDoes - 0.25, brushP], [tChk, checkP]], 0.25), t, 3);
  if (t > tDoes - 0.1 && t < tChk) mp.hF = brushP.hF;
  layer(g, cam, 1, (g) => {
    const bob = Math.abs(strokeK) * 4, hp = idle({ ...POSES.sad }, t, 2); hp.head = [hp.head[0], hp.head[1] + bob];
    reflect(g, H, 'HERO', { ...ho, pose: hp, expr: 'sad', t });
    actor(g, 'HERO', { ...ho, pose: hp, expr: exprAt(t, [[0, 'sad'], [tDoes, 'sleepy'], [tChk, 'worried']]), blink: blinkFlag(t, 3.1, 2), look: t > tChk ? lookToward(1, -0.6) : lookToward(-1, 0.3), rim: H.rim, t });
    stepStool(g, mX, H.GY + 20, stoolS);
    actor(g, 'MINA', { ...mo, pose: mp, expr: exprAt(t, [[0, 'smile'], [tChk, 'confused']]), blink: blinkFlag(t, 2.8, 3), look: t > tChk ? lookToward(-0.1, -1) : lookToward(-1, 0.1), rim: H.rim, t });
    const [bx, by] = handAt({ ...mo, s: mo.s * 0.72 }, mp); hairbrush(g, bx, by, t > tChk ? 0.1 : -1.1 + strokeK * 0.3, 1.3);
    if (t > tChk) { const u = t - tChk; glow(g, bx, by - 40, 160, '#fff4dc', 0.35 * clamp(u * 3)); if (u < 0.6) FX.sparkle(g, bx + 20, by - 70, 24 * (1 - u / 0.6), '#ffffff', 0.9); }
  });
  home3Fg(g, t, cam, { room: 'bathroom' });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
} });

// ===================================================================================================
// s019 — ""Still all there.""  GIANT FACE MINA, lip-synced, the clean brush held up beside her face: squint > suspicious > smirk, tiny nod.
registerShot('s019', { draw(g, t, info) {
  const st = info.shot.start, tAll = sw('all', st, 0.33);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  blurLayer(g, 10, (g) => home3(g, t, { z: 1.25, x: -430, y: -160 }, { room: 'bathroom', mood: 'dawn', steam: 0.1 }), null, 1); veil(g, '#101418', 0.2);
  glow(g, E.W * 0.2, E.H * 0.15, 640, '#fff4dc', 0.35);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 + cam.x * 0.3, -E.H / 2 + cam.y * 0.3);
  const talk = talkAmount(st + t, st, st + info.dur);
  const f0 = faceAt(t, [[0, 'squint'], [0.4, 'suspicious'], [1.1, 'smirk']], 0.16), f = { ...f0, open: Math.max(f0.open * 0.3, talk * 0.75) };
  const nod = t > 1.2 && t < 1.8 ? Math.sin((t - 1.2) / 0.6 * Math.PI * 2) * 0.03 : 0;
  giantFace(g, E.W * 0.44, E.H * 0.6, 320, { who: 'MINA', f, rimSide: -1, rimColor: '#fff4dc', glint: '#ffffff', breath: Math.sin(t * 2.6), blink: blinkAmt(t, 2.9, 6), tilt: nod });
  const bk = ease.out(prog(t, 0, 0.35)); hairbrush(g, E.W * 0.8, lerp(E.H * 1.2, E.H * 0.56, bk), 0.18 + Math.sin(t * 2) * 0.04, 5.2);
  if (t > tAll) FX.sparkle(g, E.W * 0.8 - 20, E.H * 0.3, 40 * Math.sin(clamp((t - tAll) / 0.6) * Math.PI), '#ffffff', 0.9);
  g.restore();
  atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
} });

// ===================================================================================================
// s020 — "That ache has a name: delayed onset muscle soreness."  RULE 1 card over the dimmed training corner; gold 'DOMS' chip on "delayed".
registerShot('s020', { draw(g, t, info) {
  const st = info.shot.start, tDel = sw('delayed', st, 1.39);
  ruleCard(g, t, info, { n: 1, title: "SORE ISN'T BROKEN.", bg: (g, t) => { blurLayer(g, 10, (g) => home3(g, t, { z: 1.1 + t * 0.01, x: 160, y: -40 }, { room: 'bedroom', mood: 'dawn', marks: 2 }), null, 1); } });
  chip(g, t, { str: 'DOMS', at: tDel, x: E.W * 0.5, y: E.H * 0.935, dur: info.dur });
} });

// ===================================================================================================
// s021 — "It usually peaks one to three days after the workout."  BLUEPRINT FIG 1: the muscle fibre bundle draws on (micro-tears),
// the soreness curve rises and peaks; gold '1-3 DAYS' bracket on "one to three".
registerShot('s021', { draw(g, t, info) {
  const st = info.shot.start, tPeak = sw('peaks', st, 0.85), tOne = sw('one', st, 1.17);
  board(g, t, { title: "FIG 1 - SORE ISN'T BROKEN", fig: 'DOMS' });
  push(g, t, info.dur, () => {
    const M = muscle(g, t, { x: E.W * 0.31, y: E.H * 0.47, w: 700, h: 320, k: ease.out(prog(t, 0.05, 1.5)), tears: ease.out(prog(t, 0.9, 1.6)) });
    label(g, t, { at: M.tear, to: [M.tear[0] + 140, E.H * 0.18], str: 'micro-tears', start: 1.0 });
    const C = soreCurve(g, t, { x: E.W * 0.76, y: E.H * 0.5, w: 560, h: 340, k: ease.out(prog(t, 0.3, tPeak + 0.4)) });
    if (C?.peak) { const u = prog(t, tOne, tOne + 0.6); if (u > 0 && u < 1) glow(g, C.peak[0], C.peak[1] + 60, 220, GOLD(), 0.35 * Math.sin(u * Math.PI)); label(g, t, { at: C.peak, to: [C.peak[0] + 150, C.peak[1] - 40], str: 'PEAK', start: tOne }); }
  });
  air(g, t);
} });

// ===================================================================================================
// s022 — "It hits hardest after moves your muscles aren't used to,"  NEW MOVE: DEV demonstrates jump-lunges, HERO copies on "moves",
// wobbling, the lowering half shaky; faint red glow on the thighs; gold chip 'NEW MOVE' on "used".
const LUNGE = {
  up:   { head: [4, -208], sh: [1, -174], hip: [0, -100], eF: [22, -140], hF: [10, -104], eB: [-16, -140], hB: [-6, -104], kF: [26, -52], fF: [44, 0], kB: [-24, -50], fB: [-58, 0] },
  down: { head: [8, -160], sh: [4, -126], hip: [0, -52], eF: [22, -92], hF: [10, -58], eB: [-14, -92], hB: [-4, -58], kF: [44, -52], fF: [46, 0], kB: [-30, -6], fB: [-78, -4] },
  air:  { head: [4, -214], sh: [1, -180], hip: [0, -106], eF: [26, -196], hF: [36, -230], eB: [-20, -190], hB: [-30, -222], kF: [20, -62], fF: [26, -14], kB: [-18, -60], fB: [-34, -16] },
};
const swapLegs = (p) => ({ ...p, kF: [-p.kB[0], p.kB[1]], fF: [-p.fB[0], p.fB[1]], kB: [-p.kF[0], p.kF[1]], fB: [-p.fF[0], p.fF[1]] });
function jumpLunge(t, per = 1.0) {           // down (0-.4) > explode (.4-.62, airborne, legs switch) > land into the other lunge
  const n = Math.floor(t / per), u = t / per - n, side = n % 2 ? swapLegs : (p) => p;
  if (u < 0.4) return { pose: blendPose(side(LUNGE.up), side(LUNGE.down), ease.inOut(u / 0.4)), lift: 0 };
  if (u < 0.62) { const k = (u - 0.4) / 0.22; return { pose: blendPose(side(LUNGE.down), LUNGE.air, ease.out(Math.min(1, k * 2))), lift: Math.sin(k * Math.PI) * 70 }; }
  const k = (u - 0.62) / 0.38; return { pose: blendPose(LUNGE.air, (n % 2 ? (p) => p : swapLegs)(LUNGE.up), ease.out(k)), lift: 0 };
}
registerShot('s022', { draw(g, t, info) {
  const st = info.shot.start, tHard = sw('hardest', st, 0.57), tMoves = sw('moves', st, 1.45), tUsed = sw('used', st, 2.79);
  const cam = camMove(t, info.dur, { z: [1.18, 1.22], x: [60, 100], y: [-40, -46] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 4 });
  const dX = H.pos.matL - 60, hX = H.pos.matX + 170, s = 1.9;
  layer(g, cam, 1, (g) => {
    const D = jumpLunge(t + 0.3, 1.0);
    actor(g, 'DEV', { x: dX, y: H.GY + 26 - D.lift * s, s, facing: 1, pose: D.pose, shadow: D.lift < 5, expr: exprAt(t, [[0, 'determined'], [tUsed, 'smirk']]), blink: blinkFlag(t, 3.4, 6), look: t > tMoves ? lookToward(1, 0) : lookToward(1, 0.2), rim: H.rim, t });
    // HERO: watches, then copies on "moves" at half speed, the lowering shaky and wobbling
    let hp, lift = 0, rot = 0;
    if (t < tMoves) hp = idle(POSES.crossArms, t, 4);
    else { const J = jumpLunge((t - tMoves) * 0.7, 1.0), u = ((t - tMoves) * 0.7) % 1; hp = fatigue(J.pose, t, { tremble: u < 0.4 ? 1 : 0.3, seed: 5 }); lift = J.lift * 0.6; rot = Math.sin(t * 7) * 0.05 * (u < 0.4 ? 1 : 0.3); }
    const ho = { x: hX, y: H.GY + 26 - lift * s, s, facing: -1 };
    actor(g, 'HERO', { ...ho, pose: hp, rot, shadow: lift < 5, expr: exprAt(t, [[0, 'determined'], [tHard, 'nervous'], [tMoves + 0.4, 'cry']]), blink: blinkFlag(t, 3.1, 4), look: lookToward(-1, 0.1), rim: H.rim, t });
    heatGlow(g, hp, ho, t > tMoves ? 0.4 + 0.3 * Math.sin(t * 6) : 0);
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  chip(g, t, { str: 'NEW MOVE', at: tUsed, x: E.W * 0.5, y: E.H * 0.86, dur: info.dur });
} });

// ===================================================================================================
// s023 — "especially the lowering part, like sinking into a squat."  one very slow squat: the lowering starts on "lowering" with a gold
// down-arrow riding his hips; on "squat" the thighs flash red and tremble. The camera sinks with him.
registerShot('s023', { draw(g, t, info) {
  const st = info.shot.start, tLow = sw('lowering', st, 0.85), tSq = sw('squat', st, 2.87);
  const R = squat(clamp(t - tLow, 0, (tSq - tLow) + 0.05), 0.6 / (tSq - tLow + 0.05), { tremble: clamp((t - tSq + 0.5) / 0.6) });
  const d = R.depth, cam = camMove(t, info.dur, { z: [1.18, 1.26], x: [200, 230], y: [-70, -40] }); cam.y += d * 70;
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 4 });
  const ho = { x: H.pos.matX, y: H.GY + 30, s: 2.0, facing: 1 };
  layer(g, cam, 1, (g) => {
    trainee(g, 'HERO', R, { ...ho, t, rim: H.rim, expr: exprAt(t, [[0, 'determined'], [tLow, 'worried'], [tSq, 'cry']]), blink: blinkFlag(t, 3.2, 7), look: lookToward(1, 0), sweat: 0.4 + 0.5 * d, breath: 1.2 });
    heatGlow(g, R.pose, ho, t > tSq ? 0.6 + 0.4 * Math.sin(t * 9) : 0);
    // the LOWERING arrow rides the hips
    const a = ease.out(prog(t, tLow, tLow + 0.3)); if (a > 0) {
      const hx = ho.x - 130, hy = ho.y + R.pose.hip[1] * ho.s;
      g.save(); g.globalAlpha *= a; seg(g, [[hx, hy - 120], [hx, hy + 20]], 14, GOLD()); poly(g, [[hx - 32, hy + 6], [hx + 32, hy + 6], [hx, hy + 52]], GOLD());
      text(g, 'LOWERING', hx - 30, hy - 60, { size: 42, color: GOLD(), align: 'right', stroke: 8, strokeColor: '#140f1c', glow: 12, glowColor: alpha(GOLD(), 0.6) }); g.restore();
    }
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
} });

// ===================================================================================================
// s024 — "The good news? Do the same workout again,"  CALENDAR INSERT: red X marks slap onto days 2, 3, 4 on "news"; in the blurred
// foreground his curls and arms bob through the same push-up set again, faster, on "again".
registerShot('s024', { draw(g, t, info) {
  const st = info.shot.start, tNews = sw('news', st, 0.51), tAgain = sw('again', st, 2.63);
  const z = lerp(1.1, 1.15, ease.inOut(t / info.dur));
  blurLayer(g, 10, (g) => home3(g, t, { z: 1.6, x: 160, y: -560 }, { room: 'bedroom', mood: 'day', marks: 0, mat: 0 }), null, 1); veil(g, '#140e18', 0.25);
  const slaps = [tNews, tNews + 0.24, tNews + 0.48], marks = 1 + slaps.filter((x) => t >= x).length;
  const cx = E.W * 0.5, cy = E.H * 0.1, cs = 2.55;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  calendar(g, cx, cy, cs, { marks, month: 'MARCH', hl: marks });
  // slap animation on the newest X (big -> cell size)
  slaps.forEach((ts, i) => { const u = t - ts; if (u < 0 || u > 0.25) return; const d = i + 1, c = d % 7, r = Math.floor(d / 7), x = cx + (-160 + 26 + c * 44.5) * cs, y = cy + (76 + r * 44) * cs, k = 1 + 1.4 * (1 - ease.out(u / 0.25));
    g.save(); g.translate(x, y); g.scale(k, k); seg(g, [[-13 * cs, -12 * cs], [13 * cs, 12 * cs]], 4 * cs, '#d4262e'); seg(g, [[13 * cs, -12 * cs], [-13 * cs, 12 * cs]], 4 * cs, '#d4262e'); g.restore(); });
  g.restore();
  // blurred foreground: his curls + green arms bobbing through push-ups at the bottom of frame (faster after "again")
  const rate = t > tAgain ? 2.4 : 1.4, R = pushUp(t, rate);
  blurLayer(g, 7, (g) => { trainee(g, 'HERO', R, { x: E.W * 0.36, y: E.H * 1.1, s: 4.2, facing: 1, t, rim: { color: '#fff4dc', dir: [0, -1] }, expr: 'determined', shadow: false }); }, null, 1);
  atmos(g, t, { z: z, x: 0, y: 0 }, { color: '#fff4dc', far: 12, near: 4 });
} });

// ===================================================================================================
// s025 — "and the soreness is usually much milder."  SECOND TIME: bathroom, he lifts the brush to his curls with only a small wince;
// a gold SORENESS gauge chip swings from red to the green zone on "milder".
function soreGauge(g, t, x, y, v, at) {
  const a = ease.outBack(prog(t, at, at + 0.4)); if (a <= 0.01) return; const U = S().ui, r = 110;
  g.save(); g.translate(x, y); g.scale(a, a);
  rr(g, -r - 40, -r - 50, 2 * r + 80, r + 120, 26); g.fillStyle = 'rgba(11,19,36,.9)'; g.fill(); g.strokeStyle = alpha(U.gold, 0.8); g.lineWidth = 3; g.stroke();
  const zones = [['#5fd37a', 0, 0.4], ['#f2c230', 0.4, 0.7], ['#e04a3a', 0.7, 1]];
  for (const [c, a0, a1] of zones) { g.strokeStyle = c; g.lineWidth = 22; g.beginPath(); g.arc(0, 30, r, Math.PI + a0 * Math.PI, Math.PI + a1 * Math.PI); g.stroke(); }
  const ang = Math.PI + v * Math.PI; seg(g, [[0, 30], [Math.cos(ang) * (r - 14), 30 + Math.sin(ang) * (r - 14)]], 7, '#f4f1e8'); circle(g, 0, 30, 12, '#f4f1e8');
  text(g, 'SORENESS', 0, 66, { size: 30, color: U.gold, font: FONTS.ui, weight: 900, spacing: 3 });
  g.restore();
}
registerShot('s025', { draw(g, t, info) {
  const st = info.shot.start, tSore = sw('soreness', st, 0.67), tMild = sw('milder', st, 2.11);
  const cam = camMove(t, info.dur, { z: [1.16, 1.2], x: [-240, -210], y: [20, 16] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'day', steam: 0.05 });
  const o = { x: H.pos.mirrorX + 300, y: H.GY + 20, s: 1.9, facing: -1 };
  const stroke = t > tSore + 0.3 ? Math.sin((t - tSore) * 9) : 0;
  const brushP = { ...POSES.stand, head: [6, -206], eF: [30, -194], hF: [14 + stroke * 6, -234 + Math.abs(stroke) * 6] };
  let pose = idle(poseAt(t, [[0, 'relaxed'], [tSore - 0.2, brushP]], 0.45), t, 2);
  if (t < tMild) pose = fatigue(pose, t, { tremble: 0.25, seed: 3 });
  const fx = { expr: exprAt(t, [[0, 'worried'], [tSore + 0.3, 'nervous'], [tMild, 'joy']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(-1, -0.15), t };
  layer(g, cam, 1, (g) => {
    reflect(g, H, 'HERO', { ...o, pose, ...fx });
    actor(g, 'HERO', { ...o, pose, ...fx, rim: H.rim });
    const [bx, by] = handAt(o, pose); hairbrush(g, bx, by, t > tSore ? -2.6 : 2.4, 1.3);
    if (t > tMild && t < tMild + 0.6) FX.sparkle(g, o.x - 10, o.y - 470, 30 * Math.sin((t - tMild) / 0.6 * Math.PI), '#ffe8b0', 0.9);
  });
  home3Fg(g, t, cam, { room: 'bathroom' });
  atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  const v = key(t, [[tSore, 0.88], [tMild - 0.1, 0.84], [tMild + 0.5, 0.18]], ease.outBack) + Math.sin(t * 20) * 0.01;
  soreGauge(g, t, E.W - 250, E.H * 0.24, v, tSore - 0.1);
} });

// ===================================================================================================
// s026 — "Scientists call it the repeated bout effect. Your muscles learn."  BLUEPRINT continued: the fibres repair thicker, the second
// soreness bump is much lower; 'REPEATED BOUT EFFECT' writes on in gold on "repeated"; on "learn" a tiny graduation cap lands on the
// repaired fibre, the bundle thickens a touch (1.0 -> 1.03), sparkle.
function gradCap(g, x, y, s, k) {
  if (k <= 0) return; const U = S().ui; g.save(); g.translate(x, y - (1 - ease.out(k)) * 200); g.rotate(-0.15); g.scale(s, s);
  poly(g, [[-60, 0], [0, -24], [60, 0], [0, 24]], '#0b1324'); g.strokeStyle = U.gold; g.lineWidth = 4; g.beginPath(); g.moveTo(-60, 0); g.lineTo(0, -24); g.lineTo(60, 0); g.lineTo(0, 24); g.closePath(); g.stroke();
  rr(g, -30, 4, 60, 30, 6); g.fillStyle = '#0b1324'; g.fill(); g.stroke();
  seg(g, [[0, 0], [42, 10], [44, 44]], 3, U.gold); circle(g, 44, 48, 6, U.gold);
  g.restore();
}
registerShot('s026', { draw(g, t, info) {
  const st = info.shot.start, tRep = sw('repeated', st, 1.05), tLearn = sw('learn', st, 3.27);
  board(g, t, { title: "FIG 1 - SORE ISN'T BROKEN", fig: 'REPEATED BOUT EFFECT' });
  push(g, t, info.dur, () => {
    const thick = 1 + 0.03 * ease.outBack(prog(t, tLearn, tLearn + 0.4)), mx = E.W * 0.31, my = E.H * 0.47;
    g.save(); g.translate(mx, my); g.scale(1, thick); g.translate(-mx, -my);
    const M = muscle(g, t, { x: mx, y: my, w: 700, h: 320, k: 1, tears: 1, repair: ease.inOut(prog(t, 0.1, 1.6)) });
    g.restore();
    label(g, t, { at: M.repair, to: [M.repair[0] - 120, E.H * 0.82], str: 'repaired, thicker', start: 0.6 });
    const C = soreCurve(g, t, { x: E.W * 0.76, y: E.H * 0.5, w: 560, h: 340, k: 1, second: ease.inOut(prog(t, tRep, tRep + 1.2)) });
    if (C?.second) label(g, t, { at: C.second, to: [C.second[0] + 40, C.second[1] - 150], str: '2nd time: milder', start: tRep + 0.9 });
    gradCap(g, M.repair[0], M.repair[1] - 40, 1.1, prog(t, tLearn, tLearn + 0.35));
    if (t > tLearn + 0.3) FX.sparkle(g, M.repair[0] + 70, M.repair[1] - 90, 30 * Math.sin(clamp((t - tLearn - 0.3) / 0.7) * Math.PI), GOLD(), 0.9);
  });
  // REPEATED BOUT EFFECT writes on, letter by letter
  const str = 'REPEATED BOUT EFFECT', n = Math.floor(str.length * ease.out(prog(t, tRep, tRep + 0.9)));
  if (n > 0) text(g, str.slice(0, n), E.W * 0.5, E.H * 0.13, { size: 64, color: GOLD(), glow: 18, glowColor: alpha(GOLD(), 0.7), stroke: 10, strokeColor: '#0b1324', spacing: 4 });
  air(g, t);
} });
