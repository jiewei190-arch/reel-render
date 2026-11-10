// B_s021_s026_stadium.js — batch B: RULE 1 card + day 4 at the stadium (2.45 m bar, the crunch, "ow"). Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, rr, text, FONTS, mix, shade } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { court } from '../sets/court.js';
import { stadium, stadiumFg } from '../sets/stadium.js';
import { chip, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, impactFrame, jumpShake, jumpCam } from '../sets/jump.js';
import * as BP from '../sets/bp.js';
import { U, wt, dayHud, meterHud, painStars } from './B_lib.js';

const JH = 4 * U;                                                      // day 4: a 4 m jump
const MARKS = [['HOOP', 3.05], ['HIGH JUMP', 2.45], ['POLE VAULT', 6.31], ['5 STOREYS', 16]];

// s021 — RULE 1 card over the dimmed dusk court; on "down" a little hero silhouette drops through the bottom of the card
registerShot('s021', { draw(g, t, info) {
  const tNob = wt(info, 'nobody', 0.91), tDown = wt(info, 'down', 4.11);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-60, 20], y: [-150, -170] });
  ruleCard(g, t, info, { n: 1, title: "JUMPING IS EASY. LANDING ISN'T.", bg: (g, t) => { blurLayer(g, 9, (g) => court(g, t, cam, { mood: 'dusk', hoopFt: 10 }), null, 1); veil(g, '#120a1c', 0.35); } });
  // the drop: a small ink figure falls from the top through the card and out of the bottom, a dust puff at the frame edge
  const u = prog(t, tDown - 0.55, tDown + 0.05);
  if (u > 0 && u < 1) { g.save(); const y = lerp(-120, E.H + 140, u * u), x = E.W * 0.5 + 340; g.translate(x, y); g.rotate(Math.sin(t * 10) * 0.15);
    actor(g, 'HERO', { x: 0, y: 0, s: 0.75, facing: 1, pose: POSES.fall, expr: 'scared', alpha: 0.9, t }); g.restore(); }
  const k = prog(t, tDown, tDown + 0.3); if (k > 0 && k < 1) { for (let i = 0; i < 8; i++) circle(g, E.W * 0.5 + 340 + (i - 3.5) * 40 * (0.5 + k), E.H - 10 - k * 30 * (i % 3), 20 * (1 - k) + 8, alpha('#fff1dc', 0.5 * (1 - k))); }
  chip(g, t, { str: 'Every metre up comes down', at: tNob + 1.4, x: E.W * 0.5, y: E.H * 0.93, dur: info.dur - 0.05, tone: 'gold' });
} });

// s022 — STADIUM establishing: the bar way above his head, DAY 03 -> 04, meter 2 -> 4 m
registerShot('s022', { draw(g, t, info) {
  const tDay = wt(info, 'day', 0.15), tFour = wt(info, 'four', 1.63, 1.2);
  const cam = camMove(t, info.dur, { z: [0.84, 0.88], x: [-420, -300], y: [-170, -190] });
  const A = stadium(g, t, cam, { mood: 'dusk', hjBar: 2.45, crowd: 0.6, cheer: 0.2, board: 'HIGH JUMP  2.45 m' });
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: A.pos.hjX - 300, y: A.GY + 20, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tFour - 0.3, 'lookUp']]), t, 3), expr: exprAt(t, [[0, 'neutral'], [tFour, 'smirk']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(0.6, -0.8), rim: A.rim, t });
    // a measuring-tape leader from the turf up to the bar: the bar is higher than he is
    const k = ease.out(prog(t, 0.5, 1.2)); if (k > 0) { seg(g, [[A.pos.hjX - 120, A.GY + 10], [A.pos.hjX - 120, lerp(A.GY + 10, A.pos.barY, k)]], 5, alpha(S().ui.gold, 0.8)); for (let m = 1; m <= 2; m++) if (A.GY - m * U > lerp(A.GY, A.pos.barY, k)) seg(g, [[A.pos.hjX - 134, A.GY - m * U], [A.pos.hjX - 106, A.GY - m * U]], 4, S().ui.gold); }
  });
  stadiumFg(g, t, cam); atmos(g, t, cam, { color: '#eef4ff' });
  dayHud(g, t, info, 3, 4, tDay);
  meterHud(g, t, info, { v0: 2, v1: 4, t0: tFour, marks: MARKS });
} });

// s023 — STANDING JUMP: no run-up, launch on "float", he rises past the bar; the camera orbits at the apex as the bar slides under him
registerShot('s023', { draw(g, t, info) {
  const tFloat = wt(info, 'float', 0.19), tBar = wt(info, 'bar', 2.19, 1.6), t0 = tFloat + 0.24, opt = { up: 1.15, hang: 1.4, down: 1.0 };
  const J = jumpPose(t, t0, JH, opt), T = J.times;
  const cam = jumpCam(t, t0, JH, { ...opt, z: 0.86, x: -260, y: -140, follow: 0.58, lag: 0.1, zoomOut: 0.1, shake: 0 });
  const orb = ease.inOut(prog(t, T.tA - 0.4, info.dur)); cam.x += lerp(0, 260, orb); cam.r = (cam.r || 0) + 0.025 * Math.sin(orb * Math.PI);
  const A = stadium(g, t, cam, { mood: 'dusk', hjBar: 2.45, crowd: 0.7, cheer: 0.25 + 0.5 * prog(t, T.tA, tBar) });
  const hx = lerp(A.pos.hjX - 280, A.pos.hjX - 40, ease.inOut(prog(t, T.t0, T.tA)));
  layer(g, cam, 1, (g) => {
    for (const [who, dx, s, sd] of [['DEV', -880, 1.85, 2], ['MINA', -660, 2.0, 1]]) {           // the two watching from the turf, heads tilt up with him
      const lk = t > T.t0 ? lookToward(0.3, -1) : lookToward(1, 0);
      actor(g, who, { x: A.pos.hjX + dx, y: A.GY + 30, s, facing: 1, pose: idle(t > T.t0 + 0.1 ? reaction('lookUp', t, T.t0 + 0.1, 'stand') : POSES.stand, t, sd), expr: exprAt(t, [[0, 'neutral'], [T.t0 + 0.1, 'awe']]), blink: blinkFlag(t, 3.0, sd), look: lk, rim: A.rim, t });
    }
    jumpFX(g, t, J, { x: A.pos.hjX - 280, gy: A.GY + 20, s: 1.9, landing: 'soft', dustColor: '#e8b8a0' });
    jumper(g, 'HERO', J, { x: hx, gy: A.GY + 20, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'determined'], [T.t0, 'joy'], [tBar, 'awe']]), blink: blinkFlag(t, 3.4, 5), rim: A.rim, t });
  });
  stadiumFg(g, t, cam); atmos(g, t, cam, { color: '#eef4ff' });
  meterHud(g, t, info, { value: 4 * J.lift / JH, marks: MARKS });
} });

// s024 — APEX HANG over the bar (slow-mo): gold "2.45 m" label to the bar on "two", chip "standing start", cheer swells
registerShot('s024', { draw(g, t, info) {
  const tTwo = wt(info, 'two', 0.15), tStand = wt(info, 'standing', 2.61, 1.5), tFrom = wt(info, 'from', 2.09, 1.5);
  const opt = { up: 1.15, hang: 5.2, down: 1.0 }, J = jumpPose(t + 1.6, 0, JH, opt);
  const GY0 = E.H * V(0.8, 0.68), cy = GY0 - 1080;
  const cam = { z: lerp(0.84, 0.9, ease.inOut(t / info.dur)), x: lerp(-170, -110, ease.inOut(t / info.dur)) + Math.sin(t * 0.6) * 6, y: cy - E.H / 2 - 10 + Math.cos(t * 0.5) * 4, r: -0.012 + 0.006 * Math.sin(t * 0.4) };
  const A = stadium(g, t, cam, { mood: 'dusk', hjBar: 2.45, crowd: 0.8, cheer: lerp(0.3, 1, ease.inOut(prog(t, tFrom - 0.3, tFrom + 0.4))) });
  layer(g, cam, 1, (g) => {
    jumper(g, 'HERO', J, { x: A.pos.hjX - 30, gy: A.GY + 20, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'awe'], [tTwo + 0.4, 'joy'], [tStand, 'smirk']]), blink: blinkFlag(t, 3.2, 6), rim: A.rim, t, speedLines: false, trail: false });
    BP.label(g, t, { at: [A.pos.hjX + 150, A.pos.barY], to: [A.pos.hjX + 470, A.pos.barY - 130], str: '2.45 m', start: tTwo, size: 58 });
  });
  // slow-mo: a few frozen dust motes + a soft letterbox-free vignette pulse
  stadiumFg(g, t, cam); atmos(g, t, cam, { color: '#eef4ff' });
  chip(g, t, { str: 'From a standing start', at: tStand, x: E.W * 0.36, y: E.H * 0.88, dur: info.dur - 0.05, tone: 'gold' });
  meterHud(g, t, info, { value: 4, marks: MARKS });
} });

// s025 — LANDING CRUNCH: speed lines, he overshoots the mat and lands on the track on "land", impact frame, cracks, the bar drops
registerShot('s025', { draw(g, t, info) {
  const tLand = wt(info, 'land', 0.47), tCr = wt(info, 'crunch', 1.19, 0.8), opt = { up: 1.15, hang: 0.5, down: 1.0, landing: 'thud', recover: 'wince' };
  const t0 = tLand - (opt.up + opt.hang + opt.down), J = jumpPose(t, t0, JH, opt), T = J.times;
  const cam = jumpCam(t, t0, JH, { ...opt, z: 0.9, x: 260, y: -150, follow: 0.7, lag: 0.04, zoomOut: 0.06, shake: 26 });
  const [cx, cy] = jumpShake(t, tCr, 9); cam.x += cx; cam.y += cy;
  const A = stadium(g, t, cam, { mood: 'dusk', hjBar: 2.45, crowd: 0.8, cheer: t < T.tL ? 0.8 : 0.15, barDrop: ease.in(prog(t, T.tL + 0.05, T.tL + 0.6)), barWobble: t > T.tL ? Math.exp(-(t - T.tL) * 3) : 0 });
  const lx = A.pos.hjX + 620, gy = A.GY + 60;
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: lx + 520, y: A.GY + 30, s: 1.85, facing: -1, pose: t < T.tL ? idle(poseAt(t, [[0, 'lookUp']]), t, 2) : reaction('shock', t, T.tL + 0.05, 'stand'), expr: exprAt(t, [[0, 'awe'], [T.tL + 0.05, 'shocked'], [tCr + 0.2, 'worried']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(-1, t < T.tL ? -0.6 : 0.2), rim: A.rim, t });
    jumpFX(g, t, J, { x: lx, gy, s: 1.9, landing: 'thud', launchDust: false, dustColor: '#e8a890' });
    jumper(g, 'HERO', J, { x: lx, gy, s: 1.9, facing: -1, expr: exprAt(t, [[0, 'scared'], [T.tL, 'shocked'], [tCr, 'worried']]), blink: blinkFlag(t, 3.4, 7), rim: A.rim, t });
  });
  stadiumFg(g, t, cam); atmos(g, t, cam, { color: '#eef4ff' });
  impactFrame(g, t, T.tL, { x: E.W * 0.5, y: E.H * 0.78 });
  meterHud(g, t, info, { value: 4 * J.lift / JH, marks: MARKS });
} });

// s026 — GIANT FACE "ow": shocked > worried > sheepish, gritted teeth, a tear welling, pain stars at the bottom, small shake on "hurt"
registerShot('s026', { draw(g, t, info) {
  const tHurt = wt(info, 'hurt', 0.43), tNew = wt(info, 'new', 1.07, 0.6);
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [-60, -30], y: [-460, -470] });
  blurLayer(g, 10, (g) => stadium(g, t, cam, { mood: 'dusk', crowd: 0.8, cheer: 0.1 }), null, 1); veil(g, '#160d22', 0.25);
  const sh = jumpShake(t, tHurt, 14), cx = E.W * 0.5 + sh[0], cy = E.H * 0.47 + sh[1], r = E.H * 0.3;
  glow(g, cx - r * 0.9, cy - r, r * 1.6, '#eef4ff', 0.2);
  const f = faceAt(t, [[0, 'shocked'], [0.25, { eye: 0.4, brow: 0.9, tilt: -0.9, open: 0.3, smile: -0.7, w: 1.1, sweat: 1 }], [tNew + 0.1, 'sheepish']], 0.12);
  giantFace(g, cx, cy, r, { who: 'HERO', f, rimSide: -1, rimColor: '#eef4ff', blink: blinkAmt(t, 3.0, 2), breath: Math.sin(t * 3) });
  if (t > 0.25 && t < tNew + 0.1) { g.save(); g.strokeStyle = '#fff6ec'; g.lineWidth = 5; for (let i = -3; i <= 3; i++) seg(g, [[cx + i * r * 0.07, cy + r * 0.36], [cx + i * r * 0.07, cy + r * 0.48]], 4, '#5a4a52'); g.restore(); }   // gritted teeth lines
  const tear = ease.out(prog(t, 0.6, 1.4)); if (tear > 0) { circle(g, cx - r * 0.34, cy + r * 0.12 + tear * r * 0.08, r * 0.045 * tear, alpha('#a8dcff', 0.9)); glow(g, cx - r * 0.34, cy + r * 0.12, r * 0.12, '#cfeeff', 0.3 * tear); }
  painStars(g, t, E.W * 0.5, E.H * 0.93, ease.outBack(prog(t, tHurt, tHurt + 0.3)) * clamp((info.dur - t) / 0.3));
  atmos(g, t, cam, { color: '#eef4ff', far: 14, near: 5 });
  chip(g, t, { str: 'Knees: new feature', at: tNew, x: E.W * 0.78, y: E.H * 0.2, dur: info.dur - 0.05, tone: 'coral' });
} });
