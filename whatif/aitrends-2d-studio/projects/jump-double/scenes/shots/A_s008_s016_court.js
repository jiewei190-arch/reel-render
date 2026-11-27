// A_s008_s016_court.js — batch A (H1), the basketball court, days 1-3: s008 Dev's bet, s009 the miss (Biscuit doesn't look up), s010 day 2 one step,
// s011 the slow-motion dunk, s012 the freeze + Dev drops his phone, s013 giant-face Dev "Do that again", s014 the 12 ft crank, s015 the effortless dunk,
// s016 the vertical-leap blueprint. Built to QUALITY_BAR.md: moving camera, word-synced acting, blink + idle, parallax, atmosphere, rim light.
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, glow, shake, text, FONTS, rr, seg, circle, poly, linGrad, rng, talkAmount } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { court, courtFg, basketball, courtGround, M2U } from '../sets/court.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import * as BP from '../sets/bp.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, walkAlong, pointAndLook, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, impactFrame, jumpShake, jumpCam } from '../sets/jump.js';
import { dayCounter, heightMeter } from '../sets/devices.js';

const sw = (w, st, fb) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m)); return (hit ? hit.start : st + fb) - st; };
const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
const MARKS = [['HOOP 10 FT', 3.05], ['HALF A METRE', 0.5], ['HIGH JUMP', 2.45], ['POLE VAULT', 6.31]];
const corner = (g, t, keys) => dayCounter(g, t, { x: 230, y: 112, s: 0.5, keys });                    // the DAY counter, small in the top-left corner

// ===================================================================================================
// s008 — "Day one. Dev bets you can't touch the basketball rim."  Two-shot at golden hour: the counter flips 01 on "Day"; DEV spins a ball on one finger,
// points at the rim on "rim" (eyes first); HERO smirks and cracks his knuckles; Biscuit asleep on the bench.
registerShot('s008', { draw(g, t, info) {
  const st = info.shot.start, tDay = sw('day', st, 0.15), tBet = sw('bets', st, 1.37), tRim = sw('rim', st, 3.15);
  const cam = camMove(t, info.dur, { z: [0.94, 0.98], x: [-150, -40], y: [-170, -190] });
  const C = court(g, t, cam, { mood: 'dusk', hoopFt: 10, crowd: 0 }), GY = C.GY, CX = C.CX;
  layer(g, cam, 1, (g) => {
    cat(g, { x: C.pos.benchX + 10, y: C.pos.benchTop, s: 1.9, facing: 1, pose: 'loaf', eyes: 'blink', t, rim: C.rim });
    const dv = { x: CX - 300, y: GY + 8, s: 1.9, facing: 1 }, pl = pointAndLook(t, tRim - 0.2, [1, -0.8], { base: 'pointUp' });
    const dPose = idle(t < tRim - 0.2 ? POSES.pointUp : pl.pose, t, 2);
    actor(g, 'DEV', { ...dv, pose: dPose, expr: exprAt(t, [[0, 'smirk'], [tBet, 'happy'], [tRim, 'smirk']]), blink: blinkFlag(t, 3.1, 2), look: t < tRim - 0.2 ? lookToward(0.6, -0.9) : pl.look, talk: 0, rim: C.rim, t });
    if (t < tRim) { const [hx, hy] = handWorld(dv, dPose); basketball(g, hx + 4, hy - 34, 34, t * 9); }
    else { const u = t - tRim, [hx, hy] = handWorld(dv, dPose); basketball(g, hx + 10 + u * 160, Math.min(GY - 34, hy - 34 + 900 * u * u), 34, t * 9); }
    const hk = Math.sin(t * 14) * (t > 1.0 && t < 1.8 ? 1 : 0);                 // knuckle-crack jiggle
    actor(g, 'HERO', { x: CX + 120, y: GY + 12, s: 1.95, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [0.9, 'holdFront'], [2.0, 'crossArms']]), t, 5),
      expr: exprAt(t, [[0, 'neutral'], [tBet, 'smirk'], [tRim + 0.1, 'determined']]), blink: blinkFlag(t, 3.4, 5), look: t > tRim ? lookToward(0.8, -0.8) : lookToward(-1, 0), rim: C.rim, t });
    if (Math.abs(hk) > 0.5) FX.sparkle(g, CX + 60, GY - 300, 10, '#fff1c8', 0.7);
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
  corner(g, t, [[0, 0], [tDay, 1]]);
} });

// ===================================================================================================
// s009 — "You jump, you miss, and Biscuit doesn't even look up."  HERO jumps for the rim on "jump" (0.5 m) and misses by a mile (the gap gag);
// sheepish on "miss"; on "Biscuit" the framing slides to the bench: she yawns (eyes shut, tail flick) and doesn't look up.
registerShot('s009', { draw(g, t, info) {
  const st = info.shot.start, tJ = sw('jump', st, 0.27) + 0.08, tMiss = sw('miss', st, 0.91), tBis = sw('biscuit', st, 1.53);
  const H = 0.5 * M2U, J = jumpPose(t, tJ, H, { landing: 'thud', recover: 'stand' }), T = J.times;
  const slide = ease.inOut(prog(t, tBis - 0.25, tBis + 0.45));
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], y: [-260, -240] }); cam.x = lerp(230, -560, slide) + Math.sin(t * 0.6) * 6; cam.z = lerp(cam.z, 1.3, slide); cam.y = lerp(cam.y, 60, slide);
  { const k = jumpShake(t, T.tL, 10); cam.x += k[0]; cam.y += k[1]; }
  const C = court(g, t, cam, { mood: 'dusk', hoopFt: 10 }), GY = C.GY, CX = C.CX, hx = C.pos.rimX - 70;
  layer(g, cam, 1, (g) => {
    cat(g, { x: C.pos.benchX + 10, y: C.pos.benchTop, s: 1.9, facing: 1, pose: 'loaf', eyes: t > tBis + 0.3 && t < tBis + 1.1 ? 'blink' : 'blink', t, rim: C.rim });
    if (t > tBis + 0.25) { const yk = Math.sin(clamp((t - tBis - 0.25) / 0.8) * Math.PI); if (yk > 0.05) { g.save(); g.globalAlpha = yk; text(g, 'z', C.pos.benchX + 120, C.pos.benchTop - 150 - yk * 40, { size: 54, color: '#fff1c8', font: FONTS.title, stroke: 6, strokeColor: '#2a1a14' }); text(g, 'z', C.pos.benchX + 160, C.pos.benchTop - 210 - yk * 50, { size: 38, color: '#fff1c8', font: FONTS.title, stroke: 5, strokeColor: '#2a1a14' }); g.restore(); } }
    actor(g, 'DEV', { x: CX - 200, y: GY + 8, s: 1.9, facing: 1, pose: idle(t < T.tA ? POSES.crossArms : reaction('delight', t, T.tL, 'crossArms'), t, 2), expr: exprAt(t, [[0, 'smirk'], [T.tL, 'happy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.5), rim: C.rim, t });
    jumpFX(g, t, J, { x: hx, gy: GY + 12, s: 1.95, landing: 'thud' });
    jumper(g, 'HERO', J, { x: hx, gy: GY + 12, s: 1.95, facing: 1, expr: exprAt(t, [[0, 'determined'], [T.t0, 'determined'], [tMiss, 'sheepish']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(0.5, -1), rim: C.rim, t });
    // the gap: a dashed line from his fingertips to the rim at the apex
    const gk = (J.phase === 'apex' || (J.phase === 'rise' && J.k > 0.85)) ? 1 : 1 - prog(t, T.tB, T.tB + 0.3);
    if (gk > 0.02 && t > T.t0) { g.save(); g.globalAlpha = gk; g.setLineDash([16, 12]); seg(g, [[hx + 40, GY + 12 - J.lift - 560], [C.pos.rimX, C.pos.rimY + 10]], 5, '#ff7a5a'); g.setLineDash([]);
      text(g, 'MISS', (hx + C.pos.rimX) / 2 + 90, C.pos.rimY + 80, { size: 64, color: '#ff7a5a', font: FONTS.title, stroke: 8, strokeColor: '#2a1014' }); g.restore(); }
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
  heightMeter(g, t, { value: Math.max(0.06, 0.5 * (t < T.t0 ? 0.1 : t > T.tL ? 1 : Math.max(0.1, J.lift / H))), marks: MARKS, alpha: 1 - slide });
  corner(g, t, [[0, 1]]);
} });

// ===================================================================================================
// s010 — "Day two. One metre. You take one step,"  Counter 01 -> 02 on "Day", the meter jumps to 1 m on "One"; HERO takes ONE step toward the hoop
// on "step", ball in hand, eyes locked on the rim; DEV behind, arms crossed, smirking. Low angle, slow push.
registerShot('s010', { draw(g, t, info) {
  const st = info.shot.start, tDay = sw('day', st, 0.15), tOne = sw('one', st, 0.73), tStep = sw('step', st, 2.11);
  const cam = camMove(t, info.dur, { z: [1.05, 1.12], x: [120, 170], y: [-40, -80] });
  const C = court(g, t, cam, { mood: 'dusk', hoopFt: 10 }), GY = C.GY, CX = C.CX;
  const x0 = CX - 40, x1 = CX + 120, hx = lerp(x0, x1, ease.inOut(prog(t, tStep - 0.45, tStep + 0.25)));
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: CX - 420, y: GY - 10, s: 1.85, facing: 1, pose: idle(POSES.crossArms, t, 2), expr: exprAt(t, [[0, 'smirk'], [tOne, 'surprised'], [tOne + 0.6, 'smirk']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.2), rim: C.rim, t });
    const moving = t > tStep - 0.45 && t < tStep + 0.25, o = { x: hx, y: GY + 14, s: 1.95, facing: 1 };
    const pose = moving ? walkAlong(hx, 1.95, {}).pose : idle(POSES.holdFront, t, 5);
    actor(g, 'HERO', { ...o, pose, expr: exprAt(t, [[0, 'neutral'], [tOne, 'determined']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(0.7, -0.75), rim: C.rim, t });
    const [bx, by] = handWorld(o, pose); basketball(g, bx + 16, by - 6, 34, t * 0.6);
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
  heightMeter(g, t, { value: t < tOne ? 0.5 : lerp(0.5, 1, ease.outBack(prog(t, tOne, tOne + 0.35))), marks: MARKS });
  corner(g, t, [[0, 1], [tDay, 2]]);
  chip(g, t, { str: '1 m', at: tOne, x: E.W * 0.4, y: E.H * 0.2, dur: info.dur - 0.05 });
} });

// ===================================================================================================
// s011 — "rise, and dunk on a regular ten-foot hoop."  SLOW-MOTION DUNK: launch on "rise" (dust ring), the camera rises beside him, apex hang with
// hoodie flutter, the DUNK on "dunk" (net swish, rim rattle), gold "10 ft" on "ten-foot". Height meter 1 m against the hoop tick.
registerShot('s011', { draw(g, t, info) {
  const st = info.shot.start, tR = sw('rise', st, 0.15), tD = sw('dunk', st, 0.83), tTen = sw('ten', st, 1.87);
  const H = 1.0 * M2U, opt = { up: tD - tR, hang: 0.6, down: 0.55, landing: 'soft' }, J = jumpPose(t, tR, H, opt), T = J.times;
  const cam = jumpCam(t, tR, H, { ...opt, z: 1.15, x: 380, y: -200, follow: 0.7, lag: 0.08, zoomOut: 0.05, shake: 10 });
  const sw2 = Math.sin(clamp((t - tD) / 0.5) * Math.PI) * (t > tD ? 1 : 0), wob = t > tD ? Math.exp(-(t - tD) * 3) : 0;
  const C = court(g, t, cam, { mood: 'dusk', hoopFt: 10, swish: sw2, wobble: wob }), GY = C.GY, hx = C.pos.rimX - 90;
  layer(g, cam, 1, (g) => {
    jumpFX(g, t, J, { x: hx, gy: GY + 12, s: 1.95, landing: 'soft' });
    const r = jumper(g, 'HERO', J, { x: hx, gy: GY + 12, s: 1.95, facing: 1, expr: exprAt(t, [[0, 'determined'], [tR, 'determined'], [tD, 'joy']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(0.6, -0.7), rim: C.rim, t });
    // the ball: up with him in his front hand, through the hoop on "dunk", bouncing below
    if (t < tD) basketball(g, r.head[0] + 70, r.head[1] - 40 - 90 * prog(t, tR, tD), 34, t * 2);
    else { const u = t - tD, by = C.pos.rimY + 20 + 900 * u * u; basketball(g, C.pos.rimX + 6, Math.min(by, GY - 34) - (by > GY - 34 ? Math.abs(Math.sin(u * 9)) * 120 * Math.exp(-u * 2) : 0), 34, t * 6); }
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
  if (t > tD && t < tD + 0.25) { glow(g, E.W * 0.6, E.H * 0.35, 380, '#fff1c8', 0.4 * (1 - prog(t, tD, tD + 0.25))); }
  heightMeter(g, t, { value: Math.max(0.5, 1 * (t < tR ? 0.5 : t > T.tL ? 1 : Math.max(0.5, J.lift / H))), marks: MARKS });
  chip(g, t, { str: '10 FT HOOP', at: tTen, x: E.W * 0.38, y: E.H * 0.2, dur: info.dur - 0.05 });
  corner(g, t, [[0, 2]]);
} });

// ===================================================================================================
// s012 — "The whole court goes silent. Dev drops his phone."  FREEZE three-shot: onlookers with phones behind the fence, HERO hanging off the rim;
// everything freezes on "silent" (only the net and a rolling ball keep moving); on "drops" a punch-in on DEV's hand: the phone slips, tumbles, clacks on "phone".
registerShot('s012', { draw(g, t, info) {
  const st = info.shot.start, tSil = sw('silent', st, 1.09), tDrop = sw('drops', st, 2.47), tPh = sw('phone', st, 3.01);
  const tf = Math.min(t, tSil + 0.1);                                                                   // frozen time for the people
  const punch = ease.inOut(prog(t, tDrop - 0.25, tDrop + 0.1));
  const C0 = { z: lerp(1.02, 1.07, ease.inOut(t / info.dur)), x: 160, y: -170 };
  const C = court(g, t, { ...C0 }, { mood: 'dusk', hoopFt: 10, crowd: 0.6, wobble: Math.exp(-t * 2) * 0.6, swish: 0 }), GY = C.GY, CX = C.CX;
  const dv = { x: CX - 260, y: GY + 8, s: 1.9, facing: 1 }, dPose = idle(poseAt(tf, [[0, 'phone'], [0.4, 'phoneLow']]), tf, 2), [phx, phy] = handWorld(dv, dPose);
  // camera: the three-shot, then punch in on DEV's hand
  const cam = { z: lerp(C0.z, 2.1, punch), x: lerp(C0.x, phx - E.W / 2 + 40, punch), y: lerp(C0.y, phy - E.H / 2 + 120, punch), r: 0 };
  if (punch > 0.01) court(g, t, cam, { mood: 'dusk', hoopFt: 10, crowd: 0.6 });
  layer(g, cam, 1, (g) => {
    cat(g, { x: C.pos.benchX + 10, y: C.pos.benchTop, s: 1.9, facing: 1, pose: 'loaf', eyes: 'blink', t: tf, rim: C.rim });
    actor(g, 'DEV', { ...dv, pose: dPose, expr: exprAt(t, [[0, 'surprised'], [tSil - 0.3, 'shocked']]), blink: blinkFlag(tf, 3.1, 2), look: lookToward(1, -0.7), rim: C.rim, prop: t < tDrop ? { type: 'phone', glow: '#9fd8ff' } : undefined, t: tf });
    if (t >= tDrop) { const u = t - tDrop, y = Math.min(phy + 700 * u * u, GY), x = phx + 40 * u; g.save(); g.translate(x, y); g.rotate(u * 9); rr(g, -20, -36, 40, 72, 8); g.fillStyle = '#16121c'; g.fill(); rr(g, -15, -30, 30, 60, 5); g.fillStyle = '#9fd8ff'; g.fill(); g.restore(); }
    // HERO hanging off the rim, then dropping down
    const drop = ease.in(prog(t, 2.0, 2.45)), hang = { x: C.pos.rimX - 40, y: lerp(C.pos.rimY + 420, GY + 12, drop), s: 1.95, facing: -1 };
    actor(g, 'HERO', { ...hang, pose: idle(drop < 1 ? POSES.cheer : reaction('sheepish', t, 2.45, 'stand'), tf, 5), expr: exprAt(t, [[0, 'joy'], [tSil, 'surprised'], [2.5, 'sheepish']]), blink: blinkFlag(tf, 3.4, 5), look: lookToward(-1, 0.2), rim: C.rim, t: tf });
    // the ball still rolling across the court (it alone keeps moving)
    basketball(g, CX + 200 - t * 120, GY - 34, 34, -t * 3.5);
  });
  courtFg(g, t, cam);
  atmos(g, tf, cam, { color: C.M.key });
  if (t >= tSil) { const k = 1 - prog(t, tSil, tSil + 0.5); if (k > 0) glow(g, E.W / 2, E.H / 2, 1200, '#ffffff', 0.12 * k); veil(g, '#1a1020', 0.12 * (1 - punch)); }
  if (t >= tPh && t < tPh + 0.3) { const sk = 1 - prog(t, tPh, tPh + 0.3); text(g, 'CLACK', E.W * 0.6, E.H * 0.7, { size: 90 * (0.8 + 0.4 * sk), color: '#fff1c8', font: FONTS.title, stroke: 10, strokeColor: '#2a1014', alpha: sk }); }
  corner(g, t, [[0, 2]]);
} });

// ===================================================================================================
// s013 — "\"Do that again.\" Day three."  GIANT FACE DEV (orange beanie), lip-synced on the quote: shocked -> delighted -> determined, sweat + glint,
// punch zoom + shake on "again"; the small DAY counter flips 02 -> 03 on "Day".
registerShot('s013', { draw(g, t, info) {
  const st = info.shot.start, tDo = sw('do', st, 0.15), tAg = sw('again', st, 0.45), tDay = sw('day', st, 1.49);
  const punch = ease.out(prog(t, tAg, tAg + 0.1)) * (1 - ease.out(prog(t, tAg + 0.1, tAg + 0.5)));
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] }); cam.z += 0.05 * punch; { const k = shake(t * 3, 14 * punch, 4, 3); cam.x += k[0]; cam.y += k[1]; }
  blurLayer(g, 14, (c) => court(c, t, { z: 1.1, x: -200, y: -200 }, { mood: 'dusk', hoopFt: 10, crowd: 0.5 }), null, 1); veil(g, '#1a0e08', 0.3);
  glow(g, E.W * 0.85, E.H * 0.35, 900, '#ffb060', 0.3);
  const talk = talkAmount(st + t, st + tDo - 0.05, st + tAg + 0.4);
  const f0 = faceAt(t, [[0, 'shocked'], [0.3, 'delighted'], [1.2, 'determined']], 0.14), f = { ...f0, open: Math.max(f0.open * 0.4, talk * 0.85), sweat: 1 };
  layer(g, cam, 1, (g) => giantFace(g, E.W * 0.48, E.H * 0.56, 330, { who: 'DEV', f, rimSide: 1, rimColor: '#ffb060', glint: '#ffd59a', breath: Math.sin(t * 2.4), blink: blinkAmt(t, 2.8, 3), tilt: lerp(-0.03, 0.04, ease.inOut(t / info.dur)) }));
  for (let i = 0; i < 4; i++) { const ph = (t * 1.3 + i * 0.25) % 1; FX.sparkle(g, E.W * 0.48 + (i - 1.5) * 200, E.H * 0.14 + Math.sin(i * 2) * 40, 16 * Math.sin(ph * Math.PI), '#ffd8a0', 0.8 * prog(t, 0.3, 0.6)); }
  atmos(g, t, cam, { color: '#ffd8b0', far: 18, near: 6 });
  corner(g, t, [[0, 2], [tDay, 3]]);
} });

// ===================================================================================================
// s014 — "Two metres. Dev raises the hoop to twelve feet, as high as it goes."  The meter pops to 2 m on "Two"; close on the crank box as DEV winds it,
// then the camera tilts up the telescoping pole to the 12 ft rim: gold "12 FT" on "twelve", a MAX sticker on "high". HERO waits, bored.
registerShot('s014', { draw(g, t, info) {
  const st = info.shot.start, tTwo = sw('two', st, 0.15), tRa = sw('raises', st, 1.35), tTw = sw('twelve', st, 2.49), tHi = sw('high', st, 3.29);
  const crank = key(t, [[tRa - 0.2, 0], [tTw + 0.1, 1]], ease.inOut), ft = 10 + 2 * crank, tilt = ease.inOut(prog(t, 1.6, tTw + 0.4));
  const GY = courtGround(), CX = E.W / 2, rimY = GY - ft * 0.3048 * M2U, C0 = { pos: { crankY: GY - 360 } };        // geometry only (court.js: crankY = GY - 360)
  const cam = camMove(t, info.dur, { z: [1.35, 1.25], x: [560, 600] }); cam.y = lerp(C0.pos.crankY - E.H / 2 - 40, rimY - E.H / 2 + 220, tilt) + Math.cos(t * 0.5) * 5;
  const C = court(g, t, cam, { mood: 'dusk', hoopFt: ft, crank: crank * 2 });
  layer(g, cam, 1, (g) => {
    const dv = { x: C.pos.poleX - 150, y: C.GY + 4, s: 1.9, facing: 1 }, wind = Math.sin(t * 9) * (crank > 0 && crank < 1 ? 1 : 0);
    const dPose = idle({ ...POSES.reach, hF: [POSES.reach.hF[0] + wind * 8, POSES.reach.hF[1] + Math.cos(t * 9) * 10 * (crank > 0 && crank < 1 ? 1 : 0)] }, t, 2);
    actor(g, 'DEV', { ...dv, pose: dPose, expr: exprAt(t, [[0, 'determined'], [tTw, 'happy']]), blink: blinkFlag(t, 3.1, 2), look: t > tTw ? lookToward(0.3, -1) : lookToward(1, -0.2), rim: C.rim, t });
    actor(g, 'HERO', { x: C.pos.poleX - 560, y: C.GY + 12, s: 1.95, facing: 1, pose: idle(poseAt(t, [[0, 'crossArms'], [2.6, 'relaxed']]), t, 5), expr: exprAt(t, [[0, 'sleepy'], [tTw, 'smirk']]), blink: blinkFlag(t, 2.6, 5), look: lookToward(1, -0.6), rim: C.rim, t });
    if (crank > 0 && crank < 1) for (let k = 0; k < 3; k++) seg(g, [[C.pos.crankX + 50 + k * 12, C.pos.crankY - 30 + k * 16], [C.pos.crankX + 70 + k * 12, C.pos.crankY - 40 + k * 16]], 4, alpha('#fff1c8', 0.8));
    // MAX sticker slapped on the pole on "high"
    const mk = ease.outBack(prog(t, tHi, tHi + 0.3)); if (mk > 0.02) { g.save(); g.translate(C.pos.poleX + 6, rimY + 260); g.rotate(-0.12); g.scale(mk, mk); rr(g, -70, -32, 140, 64, 10); g.fillStyle = '#d4262e'; g.fill(); g.strokeStyle = '#fff1e0'; g.lineWidth = 5; g.stroke(); text(g, 'MAX', 0, 3, { size: 44, color: '#fff1e0', font: FONTS.title, weight: 700 }); g.restore(); }
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
  heightMeter(g, t, { value: t < tTwo ? 1 : lerp(1, 2, ease.outBack(prog(t, tTwo, tTwo + 0.35))), marks: [['HOOP 12 FT', 3.66], ['HIGH JUMP', 2.45], ['POLE VAULT', 6.31]] });
  chip(g, t, { str: '2 m', at: tTwo, x: E.W * 0.3, y: E.H * 0.18, dur: 1.6 });
  chip(g, t, { str: '12 FT', at: tTw, x: E.W * 0.36, y: E.H * 0.2, dur: info.dur - 0.05 });
  corner(g, t, [[0, 3]]);
} });

// ===================================================================================================
// s015 — "You dunk it like it's nothing. Your jump is now"  EFFORTLESS DUNK at 2 m on the 12 ft hoop: he is already rising, dunks on "dunk"
// (swish + rim rattle), lands soft and strolls off "like it's nothing"; DEV throws his beanie. Follow cam; meter 2 m above the 12 ft tick.
registerShot('s015', { draw(g, t, info) {
  const st = info.shot.start, tD = sw('dunk', st, 0.29), tNo = sw('nothing', st, 1.07), tNow = sw('now', st, 2.71);
  const H = 2 * M2U, opt = { up: 0.62, hang: 0.25, down: 0.6, landing: 'soft' }, t0 = tD - 0.62, J = jumpPose(t, t0, H, opt), T = J.times;
  const cam = jumpCam(t, t0, H, { ...opt, z: 1.02, x: 300, y: -250, follow: 0.55, lag: 0.08, zoomOut: 0.04, shake: 8 });
  const sw2 = Math.sin(clamp((t - tD) / 0.5) * Math.PI) * (t > tD ? 1 : 0), wob = t > tD ? Math.exp(-(t - tD) * 3) : 0;
  const C = court(g, t, cam, { mood: 'dusk', hoopFt: 12, swish: sw2, wobble: wob, crowd: 0.4 }), GY = C.GY, CX = C.CX;
  const walk = Math.max(0, t - T.tEnd), hx = C.pos.rimX - 90 - walk * 160;
  layer(g, cam, 1, (g) => {
    // DEV throws his beanie (a little orange arc) when the ball goes in
    const bk = prog(t, tD + 0.2, tD + 1.4); actor(g, 'DEV', { x: CX - 300, y: GY + 8, s: 1.9, facing: 1, pose: idle(t < tD + 0.2 ? POSES.handsOnHead : reaction('delight', t, tD + 0.2, 'handsOnHead'), t, 2), expr: exprAt(t, [[0, 'surprised'], [tD, 'shocked'], [tD + 0.4, 'joy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.6), rim: C.rim, t });
    if (bk > 0 && bk < 1) { const bx = CX - 280 + bk * 260, by = GY - 520 - Math.sin(bk * Math.PI) * 360; g.save(); g.translate(bx, by); g.rotate(bk * 8); circle(g, 0, 0, 34, '#f08a24'); rr(g, -36, 6, 72, 14, 6); g.fillStyle = '#c86a14'; g.fill(); g.restore(); }
    jumpFX(g, t, J, { x: C.pos.rimX - 90, gy: GY + 12, s: 1.95, landing: 'soft', launchDust: false });
    if (t < T.tEnd) { const r = jumper(g, 'HERO', J, { x: hx, gy: GY + 12, s: 1.95, facing: 1, expr: exprAt(t, [[0, 'smirk'], [tD, 'happy'], [tNo, 'smirk']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(0.6, -0.6), rim: C.rim, t });
      if (t < tD) basketball(g, r.head[0] + 66, r.head[1] - 60, 34, t * 2); }
    else actor(g, 'HERO', { x: hx, y: GY + 12, s: 1.95, facing: -1, pose: walkAlong(hx, 1.95, { facing: -1 }).pose, expr: exprAt(t, [[0, 'smirk'], [tNow, 'neutral']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(-1, 0), rim: C.rim, t });
    if (t >= tD) { const u = t - tD, by = C.pos.rimY + 20 + 900 * u * u; basketball(g, C.pos.rimX + 6, Math.min(by, GY - 34), 34, t * 6); }
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
  heightMeter(g, t, { value: Math.max(1, 2 * (t > T.tL ? 1 : Math.max(0.5, J.lift / H))), marks: [['HOOP 12 FT', 3.66], ['HIGH JUMP', 2.45], ['POLE VAULT', 6.31]] });
  corner(g, t, [[0, 3]]);
} });

// ===================================================================================================
// s016 — "higher than the best vertical leap any athlete has ever recorded."  BLUEPRINT mini-card: an athlete reaches the record line (gold 1.6 m,
// GUINNESS tag) while HERO's 2 m rises past it on "higher"; labels pop on their words; the board scales slowly (<= 4 %).
function stick(g, x, gy, s, k, lift, arms) {   // a blueprint figure (line art), feet at gy - lift, s = px per metre
  const y = gy - lift, h = 1.75 * s, hd = h * 0.12, col = '#cfe4ff';
  BP.draw(g, [[x - h * 0.12, y], [x, y - h * 0.48], [x + h * 0.12, y]], k, { w: 5, color: col });                 // legs
  BP.draw(g, [[x, y - h * 0.48], [x, y - h * 0.8]], k, { w: 5, color: col });                                       // spine
  BP.draw(g, arms === 'up' ? [[x - h * 0.08, y - h * 1.08], [x, y - h * 0.78], [x + h * 0.06, y - h * 1.12]] : [[x - h * 0.2, y - h * 0.55], [x, y - h * 0.78], [x + h * 0.2, y - h * 0.55]], k, { w: 5, color: col });
  if (k > 0.6) { g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.arc(x, y - h * 0.8 - hd, hd, 0, Math.PI * 2); g.stroke(); }
}
registerShot('s016', { draw(g, t, info) {
  const st = info.shot.start, tHi = sw('higher', st, 0.15), tBest = sw('best', st, 0.97), tAth = sw('athlete', st, 2.39), tRec = sw('recorded', st, 3.45);
  const z = 1 + 0.035 * ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'FIG 1 - VERTICAL LEAP', fig: 'STANDING JUMP, FEET OFF THE GROUND' });
  const gy = E.H * 0.86, S = 150, x0 = E.W * 0.2, x1 = E.W * 0.84, k = ease.out(prog(t, 0.05, 1.4)), Y = (m) => gy - m * S;
  BP.draw(g, [[x0, gy], [x1, gy]], k, { w: 5 });                                                                    // ground
  BP.draw(g, [[x0 + 30, gy], [x0 + 30, Y(2.6)]], k, { w: 4 }); for (let m = 0; m <= 2.5; m += 0.5) if (k > m / 2.6) { seg(g, [[x0 + 20, Y(m)], [x0 + 44, Y(m)]], 3, '#9fc8ff'); text(g, `${m} m`, x0 - 10, Y(m), { size: 26, color: '#9fc8ff', font: FONTS.ui, weight: 800, align: 'right' }); }
  // the record line at 1.6 m (dashed gold) and the 2 m line
  const rk = ease.out(prog(t, tBest - 0.2, tBest + 0.6)); g.save(); g.setLineDash([18, 12]); BP.draw(g, [[x0 + 60, Y(1.6)], [x1 - 40, Y(1.6)]], rk, { w: 4, color: '#f2c21a' }); g.restore();
  // the athlete: jumps on "best" to the record line (feet 1.6 m up) and holds; HERO rises past it on "higher" to 2 m
  const aL = 1.6 * S * ease.out(prog(t, tBest, tBest + 0.6)) * (1 - 0.0 * prog(t, 3.6, 4.4)), hL = 2.0 * S * ease.outBack(prog(t, tHi, tHi + 0.9));
  stick(g, E.W * 0.42, gy, S, k, aL, 'up'); stick(g, E.W * 0.62, gy, S, k, hL, 'up');
  if (hL > 10) { glow(g, E.W * 0.62, Y(2) - 160, 140, '#f2c21a', 0.25); g.save(); g.setLineDash([10, 10]); seg(g, [[E.W * 0.62, gy - 6], [E.W * 0.62, gy - hL + 6]], 3, alpha('#f2c21a', 0.7)); g.restore(); }
  if (rk > 0.9) text(g, '1.6 m', x1 - 30, Y(1.6) - 26, { size: 34, color: '#f2c21a', font: FONTS.ui, weight: 900, align: 'right' });
  BP.label(g, t, { at: [E.W * 0.42 - 30, Y(1.6) - 130], to: [E.W * 0.24, Y(3.3)], str: 'BEST ATHLETE ~1.6 m', start: tAth });
  BP.label(g, t, { at: [E.W * 0.62 + 30, Y(2) - 130], to: [E.W * 0.74, Y(3.6)], str: 'YOU: 2 m', start: tHi + 0.3 });
  const gk = ease.outBack(prog(t, tRec, tRec + 0.35)); if (gk > 0.02) { g.save(); g.translate(E.W * 0.8, Y(1.6) + 70); g.rotate(-0.08); g.scale(gk, gk); rr(g, -150, -40, 300, 80, 12); g.strokeStyle = '#f2c21a'; g.lineWidth = 6; g.stroke(); text(g, 'GUINNESS', 0, 4, { size: 48, color: '#f2c21a', font: FONTS.title, weight: 700 }); g.restore(); }
  g.restore();
  FX.dust(g, t * 0.4, { count: 18, color: '#9fc8ff', a: 0.14, seed: 6 });
} });
