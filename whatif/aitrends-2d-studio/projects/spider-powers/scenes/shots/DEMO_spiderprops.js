// DEMO_spiderprops.js — sheet-check of sets/spiderprops.js (temporary ids demo_sp_*, not bound to the voice). 16:9.
//   demo_sp_feast    the kitchen: nine eggs vanish one by one, Dev's sandwiches go, crumbs + shells pile up; HERO eats, DEV stares
//   demo_sp_burger   the burger looks at you (eyes pop open, sweat drop), then the milkshake gets slurped
//   demo_sp_balloon  Mina's water balloon lobs in, HERO steps aside, splash on the patio
//   demo_sp_phone    Dev's phone filming HERO walking backwards (silk line from the back end), zoom pinch, hearts
//   demo_sp_fence    the fence jump: crouch, arc, land, the fence wobbles; Dev's tape: 1 BODY LENGTH
//   demo_sp_lab      reality-check lab: a climber goes up the glass wall with hand pads; inset pad close-up; the silk spool
//   demo_sp_day      day cards: DAY 3 THE SILK -> DAY 4 THE HAIRS
import { E, registerShot, layer, ease, prog, clamp, lerp, seg, glow } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { HERO, MINA, DEV } from '../cast.js';
import { blinkFlag, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { home3, home3Fg } from '../sets/home3.js';
import { park } from '../sets/park.js';
import { feast, burger, milkshake, waterBalloon, balloonArc, splash, devPhone, fence, fenceJump, bodyLength, lab, glassWall, handPad, silkSpool, dayCard } from '../sets/spiderprops.js';

registerShot('demo_sp_feast', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.4 });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', plate: 0, cereal: 1, steam: 0.3 }), P = H.pos, GY = H.GY ?? E.H * 0.8;
  const k = clamp(t / (info.dur - 0.4));
  layer(g, cam, 1, (g) => {
    actor(g, DEV, { x: P.tableX + 420, y: GY, s: 1.9, facing: -1, pose: idle(POSES.stand, t, 2), expr: exprAt(t, [[0, 'surprised'], [2, 'shocked']]), blink: blinkFlag(t, 3.3, 1), look: lookToward(-1, 0.2), t });
    actor(g, HERO, { x: P.tableX - 420, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [1, 'stand'], [1.4, 'holdFront']]), t, 1), expr: exprAt(t, [[0, 'happy'], [1.6, 'joy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0.3), t });
    feast(g, t, P.tableX, P.tableTop - 14, 1, { eggs: 9 * k, left: 6 * (1 - k), mess: k });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

registerShot('demo_sp_burger', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], drift: 0.3 });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', plate: 0, cereal: 1 }), P = H.pos;
  layer(g, cam, 1, (g) => {
    burger(g, P.tableX - 120, P.tableTop - 10, 1.1, { t, look: ease.outBack(prog(t, 0.6, 0.9)), blink: t > 1.8 && t < 1.92, sweat: prog(t, 1.4, 1.8), wobble: prog(t, 0.6, 0.8) * (1 - prog(t, 1.2, 1.6)) });
    milkshake(g, P.tableX + 170, P.tableTop - 10, 0.9, { t, level: 1 - 0.7 * ease.inOut(prog(t, 2.2, 3.6)), sip: prog(t, 2.0, 2.3) * (1 - prog(t, 3.6, 3.8)) });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

registerShot('demo_sp_balloon', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.3 });
  const S0 = park(g, t, cam, { mood: 'day' }), GY = S0.GY ?? E.H * 0.8;
  const step = ease.out(prog(t, 0.9, 1.2)), hx = 960 + 160 * step;
  const B = balloonArc(t, { from: [420, GY - 280], to: [960, GY], at: 0.6, dur: 0.75, h: 160 });
  layer(g, cam, 1, (g) => {
    actor(g, MINA, { x: 380, y: GY, s: 1.9, facing: 1, pose: poseAt(t, [[0, 'holdFront'], [0.5, 'point']]), expr: exprAt(t, [[0, 'smirk'], [1.4, 'shocked']]), blink: blinkFlag(t, 3, 1), look: lookToward(1, 0), t });
    actor(g, HERO, { x: hx, y: GY, s: 1.9, facing: 1, pose: idle(step > 0 && step < 1 ? walkAlong(hx, 1.9).pose : POSES.relaxed, t, 2), expr: exprAt(t, [[0, 'neutral'], [1.4, 'smirk']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(1, -0.1), t });
    if (t < 0.6) waterBalloon(g, 430, GY - 280, 1.0, { t, wobble: 1 }); else if (!B.done) waterBalloon(g, B.x, B.y, 1.0, { t, rot: B.rot });
    splash(g, t, 960, GY, { at: 1.35, dir: 0.3 });
  });
} });

registerShot('demo_sp_phone', { draw(g, t, info) {
  g.fillStyle = '#2a3a2a'; g.fillRect(0, 0, E.W, E.H);
  devPhone(g, t, { x: E.W / 2, y: E.H * 0.47, s: 1.9, rot: -0.03, at: 0.2, sec0: 12, zoom: lerp(1, 1.8, ease.inOut(prog(t, 1.6, 2.6))), hearts: prog(t, 2.6, 3.2), focusX: 0.55, focusY: 0.6 }, (g, w, h) => {
    const cam = { z: 1, x: 0, y: 0, r: 0 }; const S0 = park(g, t, cam, { mood: 'day' }), GY = S0.GY ?? h * 0.8, x = 1300 - t * 160;
    seg(g, [[1700, GY - 120], [x + 30, GY - 170]], 3, 'rgba(255,255,255,.9)');                         // the silk line from the back end (comedy)
    actor(g, HERO, { x, y: GY, s: 2.2, facing: 1, pose: walkAlong(-x, 2.2, {}).pose, expr: 'sheepish', blink: blinkFlag(t, 3, 2), look: lookToward(1, 0.1), t });
  });
} });

registerShot('demo_sp_fence', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.3 });
  const S0 = park(g, t, cam, { mood: 'day' }), GY = S0.GY ?? E.H * 0.8;
  const J = fenceJump(t, { from: [560, GY], to: [1140, GY - 300], at: 0.4, dur: 0.6, h: 160 }), landT = 0.4 + 0.25 + 0.6;
  layer(g, cam, 1, (g) => {
    rr2(g, 420, GY - 60, 280, 60);                                                                       // the back step
    fence(g, 900, GY, { w: 700, h: 300, t, wobble: Math.exp(-Math.max(0, t - landT) * 4) * (t > landT ? 1 : 0) });
    actor(g, HERO, { x: J.x, y: J.y - (J.k === 0 && t < 0.4 ? 60 : 0), s: 1.8, facing: 1, pose: J.pose, expr: exprAt(t, [[0, 'determined'], [landT, 'joy']]), blink: blinkFlag(t, 3, 2), look: lookToward(1, 0), t });
    actor(g, DEV, { x: 260, y: GY, s: 1.8, facing: 1, pose: idle(POSES.phone, t, 3), expr: 'happy', blink: blinkFlag(t, 3.3, 1), look: lookToward(1, -0.2), t });
    bodyLength(g, 560, GY + 70, 300, { k: prog(t, 2.0, 3.0), s: 1 });
  });
} });
const rr2 = (g, x, y, w, h) => { g.fillStyle = '#9a9488'; g.fillRect(x, y, w, h); g.fillStyle = '#b8b2a4'; g.fillRect(x, y, w, 10); };

registerShot('demo_sp_lab', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.3 });
  const L = lab(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    glassWall(g, t, 700, L.GY, { s: 1, h: 700, climb: ease.inOut(prog(t, 0.2, info.dur - 0.2)) });
    silkSpool(g, t, 1480, L.GY - 120, 0.8, { draw: prog(t, 0.3, 1.5) });
  });
  handPad(g, 300, 330, 0.6, { press: ease.inOut(prog(t, 1.5, 2.2)), t });
} });

registerShot('demo_sp_day', { draw(g, t, info) {
  g.fillStyle = '#4a7a4a'; g.fillRect(0, 0, E.W, E.H); glow(g, E.W / 2, E.H * 0.4, 900, '#ffe8a8', 0.25);
  if (t < 2) dayCard(g, t, { day: 3, title: 'THE SILK', at: 0.1 }); else dayCard(g, t, { day: 4, title: 'THE HAIRS', at: 2.0 });
} });
