// A_s001_s017_cold_open.js — stop-time batch A (H1): COLD OPEN (Tuesday breakfast, snap 1, the black, the juice lands, orange socks),
// nobody knows, the TITLE, Dev films / Mina's stopwatch, Dev's jump-cut clip, "why was it dark?", lights on + sun out.
// LEGAL: original story and designs; nothing from any film, show, anime, game or comic.
import { E, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rng, seg, circle, ring, rr, poly, alpha, shade, glow, text, FONTS, shake, veil } from '/engine/core.js';
import { POSES, posesAt } from '/engine/rig2d.js';
import { cat } from '../sets/actors.js';
import { idle, blinkFlag, blinkAmt, exprAt, poseAt, camMove, lookToward, atmos } from '../sets/acting.js';
import { faceAt } from '../sets/faces.js';
import { juiceGlass, juiceSplash, socks, stopwatch, devCam } from '../sets/stopprops.js';
import { SNAP_PREP, SNAP_HIT, snapPose, handWorld, snapBurst, snapRipple, freezeGrade, hangingDust, stillMark, frozenGlow, leapCat, blackView, unfreezeWhoosh, heroBigFace } from '../sets/freeze.js';
import { GOLD, CREAM, CORAL, kitchen, kitchenFg, hero, mina, dev, readout, tueSpill, TUE_TT, SIT_EAT, SIT_REACH, ARMS_OUT, SCRATCH, sunbeam, chipText } from './A_lib.js';

const SIT_PREP = { ...SIT_EAT, eF: [22, -118], hF: [26, -160] }, SIT_HIT = { ...SIT_EAT, eF: [28, -122], hF: [42, -158] };
const sitSnap = (t, t0) => posesAt(t, [[-1e9, SIT_EAT], [t0 - 0.4, SIT_PREP], [t0, SIT_HIT]], 0.1);
const HERO_SEAT = (P) => ({ x: P.heroSeatX, facing: -1 }), MINA_SEAT = (P) => ({ x: P.minaSeatX, facing: 1 });
// Tuesday spill clock per shot: s002 knocks (slow tip), slides off on 'off', then slow-mo fall; s003 freezes it on the snap
const S2 = { knock: 0.42, off: 1.82, dur: 2.73 };
const tt002 = (t) => t < S2.knock ? 0 : t < S2.off ? 0.3 * prog(t, S2.knock, S2.off) : 0.3 + (t - S2.off) * 0.25;
const TT003_0 = tt002(S2.dur), SNAP1 = 1.37, tt003 = (t) => TT003_0 + 0.1 * Math.min(t, SNAP1);

function biscuitSill(g, t, P, o = {}) { cat(g, { x: P.windowX + 150, y: P.windowY + 380, s: 1.6, facing: -1, pose: 'loaf', t, eyes: o.eyes || 'auto', rim: o.rim }); }
function tableKids(g, t, P, GY, o = {}) {     // seated hero + Mina (o.frozen freezes both)
  const fr = o.frozen;
  mina(g, { ...MINA_SEAT(P), y: GY, t, pose: o.minaPose || (fr ? SIT_REACH : idle(POSES.sit, t, 4)), expr: o.minaExpr || 'happy', look: lookToward(1, -0.1), frozen: fr });
  if (o.hero !== false) hero(g, { ...HERO_SEAT(P), y: GY, t, pose: o.heroPose || idle(SIT_EAT, t, 1), expr: o.heroExpr || 'neutral', look: o.heroLook || lookToward(-1, 0.3), frozen: false });
}
function edgeBlack(g, k) {                         // the light dies from the edges in (k 0..1)
  if (k <= 0.001) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const W = g.canvas.width, H = g.canvas.height, R = Math.hypot(W, H) * 0.55;
  const r0 = R * (1 - k) * 0.9; const gr = g.createRadialGradient(W / 2, H / 2, r0, W / 2, H / 2, Math.max(r0 + 1, r0 + R * 0.6 * (1 - k * 0.7)));
  gr.addColorStop(0, 'rgba(1,1,4,0)'); gr.addColorStop(1, `rgba(1,1,4,${Math.min(1, 0.6 + k)})`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (k > 0.8) { g.fillStyle = `rgba(1,1,4,${(k - 0.8) * 5})`; g.fillRect(0, 0, W, H); } g.restore();
}
// the frozen Tuesday kitchen at the snap (used by s003/s004 and the s025 split)
export function frozenTuesday(g, t, cam, o = {}) {
  const K = kitchen(g, 1.15, cam, { steam: 0 }), P = K.P, GY = K.GY;
  layer(g, cam, 1, (g) => {
    biscuitSill(g, 0, P, { eyes: 'wide', rim: K.rim });
    dev(g, { x: 330, y: GY, t: 0, frozen: true, expr: 'surprised', look: lookToward(1, 0.3) });
    tableKids(g, t, P, GY, { frozen: true, minaExpr: 'shocked', hero: false });
    tueSpill(g, t, P, o.tt ?? TUE_TT, 1);
  });
  kitchenFg(g, 1.15, cam);
  return K;
}

// ======================================================================= s001 Tuesday. Breakfast.
registerShot('s001', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.96, 1.04], x: [20, -10] }), K = kitchen(g, t, cam), P = K.P, GY = K.GY;
  layer(g, cam, 1, (g) => {
    biscuitSill(g, t, P, { rim: K.rim });
    dev(g, { x: 330, y: GY, t, expr: 'happy', look: lookToward(1, 0.2), pose: idle(POSES.relaxed, t, 7), prop: { type: 'phone' } });
    tueSpill(g, t, P, 0, 0);
    tableKids(g, t, P, GY, { minaPose: poseAt(t, [[0, idle(POSES.sit, t, 4)], [1.68, SIT_REACH]], 0.35), minaExpr: exprAt(t, [[0, 'happy'], [1.68, 'smile']]), heroExpr: 'sleepy', heroPose: idle(SIT_EAT, t, 1) });
    atmos(g, t, cam, { color: '#ffe6c0', far: 24, near: 8 });
  });
  kitchenFg(g, t, cam);
  chipText(g, t, 'TUESDAY', 0.0, 230, 110);
}});

// ======================================================================= s002 the juice goes over
registerShot('s002', { draw(g, t, info) {
  const sh = t > S2.knock && t < S2.knock + 0.3 ? shake(t, 5, 9) : [0, 0];
  const cam = camMove(t, info.dur, { z: [1.3, 1.38], x: [-190 + sh[0], -170 + sh[0]], y: [60 + sh[1], 70 + sh[1]] });
  const tt = tt002(t);
  blurLayer(g, 4, (g) => { kitchen(g, t, cam); }, null, 1);
  // morning.js kitchen layout (constant): tableX = CX + 40, tableTop = GY - 240
  const P = { juiceX: E.W / 2 + 40 - 210, juiceY: E.H * 0.8 - 240 - 14, minaSeatX: E.W / 2 + 40 - 300, heroSeatX: E.W / 2 + 40 + 300, floorY: E.H * 0.8 }, GY = E.H * 0.8;
  layer(g, cam, 1, (g) => {
    const reach = poseAt(t, [[0, SIT_REACH], [S2.knock, { ...SIT_REACH, eB: [26, -118], hB: [40, -128] }], [2.24, { ...SIT_REACH, eF: [32, -120], hF: [62, -104] }]], 0.2);
    mina(g, { ...MINA_SEAT(P), y: GY, t, pose: reach, expr: exprAt(t, [[0, 'happy'], [S2.knock + 0.1, 'surprised'], [2.24, 'shocked']]), look: lookToward(0.4, 0.6) });
    tueSpill(g, t, P, tt, 0);
    // the hero's striped sleeve enters frame right
    const sx = lerp(1500, 1180, ease.out(prog(t, 1.9, 2.6)));
    g.save(); g.translate(sx, 560); g.rotate(-0.12); rr(g, 0, -30, 420, 60, 30); g.fillStyle = '#2f8f8a'; g.fill(); g.save(); g.clip(); for (let i = 0; i < 8; i++) { g.fillStyle = CREAM; g.fillRect(30 + i * 52, -40, 16, 80); } g.restore(); circle(g, -6, 0, 26, '#14121a'); g.restore();
  });
}});

// ======================================================================= s003 you snap your fingers
registerShot('s003', { draw(g, t, info) {
  const Hx = E.W / 2 + 40 + 300, GY = E.H * 0.8, HO = { x: Hx, y: GY, s: 1.9, facing: -1 };
  const pose = idle(sitSnap(t, SNAP1), t, 1), hand = handWorld(HO, pose);
  const cam = camMove(t, info.dur, { z: [1.5, 1.56], x: [hand[0] - E.W / 2 - 160, hand[0] - E.W / 2 - 120], y: [hand[1] - E.H / 2 + 40, hand[1] - E.H / 2 + 30] });
  const tt = tt003(t), fz = prog(t, SNAP1, SNAP1 + 0.4);
  const K = kitchen(g, Math.min(t, SNAP1) + 30, cam, { steam: 0.5 }), P = K.P;
  layer(g, cam, 1, (g) => {
    mina(g, { ...MINA_SEAT(P), y: GY, t, pose: { ...SIT_REACH, eF: [32, -120], hF: [62, -104] }, expr: 'shocked', frozen: t > SNAP1, look: lookToward(0.4, 0.6) });
    tueSpill(g, t, P, tt, fz);
  });
  kitchenFg(g, t, cam);
  layer(g, cam, 1, (g) => {
    snapRipple(g, t, { x: hand[0], y: hand[1], t0: SNAP1, dur: 0.5 });
    hangingDust(g, t, { at: SNAP1, count: 40, seed: 3 });
    hero(g, { ...HO, t, pose, expr: exprAt(t, [[0, 'shocked'], [SNAP1 + 0.3, 'surprised']]), look: lookToward(-1, 0.4) });
    snapBurst(g, t, { x: hand[0] - 4, y: hand[1] - 12, t0: SNAP1, s: 0.8 });
  });
  edgeBlack(g, 0.3 * ease.inOut(prog(t, 1.93, info.dur)));
  readout(g, t, 0.5 * prog(t, SNAP1, info.dur), { k: prog(t, SNAP1, SNAP1 + 0.25) });
}});

// ======================================================================= s004 Everything goes black.
registerShot('s004', { draw(g, t, info) {
  const Hx = E.W / 2 + 40 + 300, GY = E.H * 0.8, HO = { x: Hx, y: GY, s: 1.9, facing: -1 }, hand = handWorld(HO, SIT_HIT);
  const cam = camMove(t, info.dur, { z: [1.56, 1.5], x: [hand[0] - E.W / 2 - 120, hand[0] - E.W / 2 - 150], y: [hand[1] - E.H / 2 + 30, hand[1] - E.H / 2 + 30] }, { drift: 0.3 });
  frozenTuesday(g, t, cam, { tt: TT003_0 + 0.1 * SNAP1 });
  layer(g, cam, 1, (g) => { freezeGrade(g, 1); hero(g, { ...HO, t, pose: SIT_HIT, expr: 'surprised', look: lookToward(-1, 0.4) }); });
  edgeBlack(g, lerp(0.3, 1, ease.inOut(prog(t, 0.09, 0.71))));
  readout(g, t, lerp(0.5, 1.5, t / info.dur));
}});

// ======================================================================= s005 Silent. You can't even see your own hand.
function handOutline(g, x, y, s, rot, a) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha *= a; g.strokeStyle = CREAM; g.lineWidth = 3 / s * 1.4; g.setLineDash([10 / s, 9 / s]); g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, 0, 46, 56, 0, 0, 7); g.stroke();
  for (const [fx, len, an] of [[-30, 70, -0.25], [-10, 86, -0.08], [12, 90, 0.05], [32, 76, 0.18]]) { g.beginPath(); g.moveTo(fx, -46); g.lineTo(fx + Math.sin(an) * len, -46 - Math.cos(an) * len); g.stroke(); }
  g.beginPath(); g.moveTo(-44, 10); g.quadraticCurveTo(-90, -10, -96, -50); g.stroke();
  g.beginPath(); g.moveTo(-20, 56); g.lineTo(-24, 160); g.moveTo(30, 52); g.lineTo(34, 160); g.stroke();
  g.restore();
}
registerShot('s005', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.3 });
  blackView(g, t, { k: 1 });
  const a = 0.12 * prog(t, 1.41, 1.7) * (1 - prog(t, 3.1, info.dur)), wave = Math.sin((t - 1.41) * 5) * 0.25;
  layer(g, cam, 1, (g) => handOutline(g, 960 + Math.sin((t - 1.41) * 5) * 40, 600, 2.1, wave, a));
  readout(g, t, lerp(1.5, 4.0, t / info.dur));
}});

// ======================================================================= s006 You count to ten.
registerShot('s006', { draw(g, t, info) {
  blackView(g, t, { k: 1 });
  const sec = lerp(4, 10, ease.inOut(prog(t, 0, 0.67))), land = prog(t, 0.67, 1.2);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.2 });
  layer(g, cam, 1, (g) => {
    glow(g, 860, 470, 420, GOLD, 0.12 + 0.2 * (1 - land) * (t > 0.67 ? 1 : 0));
    stopwatch(g, t, { x: 860, y: 470, s: 1.2, sec, running: t < 0.67 });
    text(g, sec >= 10 ? '10' : sec.toFixed(1), 860, 820, { size: sec >= 10 ? 150 : 110, color: GOLD, font: FONTS.ui, weight: 900, glow: 22, glowColor: alpha(GOLD, 0.7), stroke: 10, strokeColor: '#1a1206' });
    if (t > 0.67) { ring(g, 860, 470, 200 + 260 * land, 8 * (1 - land), alpha(GOLD, 0.8 * (1 - land))); }
    for (let i = 0; i < 10; i++) { const on = sec >= i + 1, x = 1240 + (i % 5) * 54, y = 380 + Math.floor(i / 5) * 120; rr(g, x - 9, y - 42, 18, 84, 9); g.fillStyle = on ? CREAM : alpha(CREAM, 0.12); g.fill(); if (on) glow(g, x, y, 50, CREAM, 0.25); }
  });
}});

// ======================================================================= s007 the light comes back, the juice lands
registerShot('s007', { draw(g, t, info) {
  const LAND = 1.88, sh = t > LAND && t < LAND + 0.3 ? shake(t, 6, 9) : [0, 0];
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-60 + sh[0], -40 + sh[0]], y: [sh[1], sh[1]] });
  const tt = TUE_TT + 0.14 * Math.max(0, t - 0.3), back = ease.inOut(prog(t, 0.08, 0.6));
  const K = kitchen(g, 40 + t, cam), P = K.P, GY = K.GY;
  const Hx = P.heroSeatX - 120, HO = { x: Hx, y: GY, s: 1.9, facing: -1 };
  layer(g, cam, 1, (g) => {
    biscuitSill(g, t, P, { rim: K.rim, eyes: t < 1.9 ? 'open' : 'wide' });
    dev(g, { x: 330, y: GY, t, expr: exprAt(t, [[0, 'surprised'], [LAND, 'shocked']]), look: lookToward(1, 0.4) });
    mina(g, { ...MINA_SEAT(P), y: GY, t, pose: t < 0.5 ? { ...SIT_REACH, eF: [32, -120], hF: [62, -104] } : idle(POSES.sit, t, 4), expr: exprAt(t, [[0, 'shocked'], [LAND + 0.05, 'surprised']]), look: lookToward(0.3, 0.8) });
    const gp = tueSpill(g, t, P, t < LAND ? tt : -1, 0);
    if (t >= LAND) { juiceGlass(g, P.minaSeatX + 20, GY - 4, 0.62, { rot: -1.57, fill: 0 }); }
    juiceSplash(g, t, LAND, P.minaSeatX + 60, GY + 6, { s: 0.7, dir: 1 });
    hero(g, { ...HO, t, pose: idle(ARMS_OUT, t, 1), expr: exprAt(t, [[0, 'surprised'], [LAND, 'shocked']]), look: lookToward(-1, 0.4) });
    atmos(g, t, cam, { color: '#ffe6c0', far: 20, near: 6 });
  });
  kitchenFg(g, t, cam);
  layer(g, cam, 1, (g) => { freezeGrade(g, 1 - back); unfreezeWhoosh(g, t, { x: P.windowX, y: P.windowY + 160, t0: 0.08, dur: 0.6 }); });
  blackView(g, t, { k: 1 - ease.inOut(prog(t, 0.08, 0.46)) });
  const flash = t < 1.0 ? (Math.floor(t * 6) % 2 ? 1 : 0.4) : 1 - prog(t, 1.0, 1.4);
  readout(g, t, 10, { k: flash * (1 - prog(t, 1.0, 1.4)), running: false });
}});

// ======================================================================= s008 and Mina's socks are orange.
registerShot('s008', { draw(g, t, info) {
  const P = { minaSeatX: E.W / 2 + 40 - 300 }, GY = E.H * 0.8, fx = P.minaSeatX + 66;
  const tilt = ease.inOut(prog(t, 0.9, 2.2)), cam = camMove(t, info.dur, { z: [2.3, 2.2], x: [fx - E.W / 2 + 40, fx - E.W / 2 - 20], y: [GY - E.H / 2 - 120, GY - E.H / 2 - 120] });
  cam.y = lerp(GY - E.H / 2 - 110, GY - 330 - E.H / 2, tilt) + Math.cos(t * 0.5) * 3;
  kitchen(g, 45 + t, cam);
  layer(g, cam, 1, (g) => {
    juiceSplash(g, 2, 0, P.minaSeatX + 60, GY + 6, { s: 0.7, dir: 1 });
    juiceGlass(g, P.minaSeatX + 20, GY - 4, 0.62, { rot: -1.57, fill: 0 });
    mina(g, { ...MINA_SEAT(P), y: GY, t, pose: idle(POSES.sit, t, 4), expr: exprAt(t, [[0, 'surprised'], [1.33, 'angry']]), face: t > 1.33 ? { eyes: 'dot', brows: 'angry', mouth: 'frown' } : null, look: lookToward(0.2, t < 1.0 ? 0.9 : 0.1) });
    const wig = t > 0.81 && t < 1.6 ? t - 0.81 : 0;
    socks(g, fx + 4, GY + 2, 0.17, { stain: 1, wiggle: wig });
    for (let i = 0; i < 4; i++) { const u = ((t * 0.9 + i * 0.27) % 1); circle(g, fx - 6 + i * 5, GY - 14 + u * 22, 1.8, alpha('#ffa21a', 1 - u)); }
    hero(g, { x: fx + 210, y: GY, t, pose: idle(POSES.stand, t, 1), expr: 'sheepish', look: lookToward(-1, 0.5), s: 1.9 });
  });
}});

// ======================================================================= s009 Nobody knows why your snap does this.
registerShot('s009', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [40, 60] }), K = kitchen(g, 50 + t, cam), P = K.P, GY = K.GY;
  const HO = { x: 1080, y: GY, s: 1.9, facing: -1 }, LOOK = { ...POSES.holdFront, head: [8, -200], hF: [34, -160], eF: [22, -140] };
  const tp = posesAt(t, [[-1e9, LOOK], [1.0, { ...LOOK, eF: [24, -146], hF: [32, -172] }], [1.22, { ...LOOK, eF: [26, -148], hF: [42, -170] }], [1.6, LOOK]], 0.12), hand = handWorld(HO, tp);
  layer(g, cam, 1, (g) => {
    dev(g, { x: 740, y: GY, t, facing: 1, pose: idle({ ...POSES.phone, head: [16, -200], sh: [6, -170] }, t, 7), expr: exprAt(t, [[0, 'thinking'], [1.3, 'confused']]), look: lookToward(1, 0.3) });
    mina(g, { x: 1420, y: GY, facing: -1, t, pose: idle({ ...POSES.stand, head: [12, -200] }, t, 4), expr: exprAt(t, [[0, 'thinking'], [1.3, 'confused']]), look: lookToward(1, 0.6), face: null });
    hero(g, { ...HO, t, pose: idle(tp, t, 1), expr: exprAt(t, [[0, 'thinking'], [1.3, 'confused']]), look: lookToward(1, 0.9) });
    if (t > 1.22) { const u = prog(t, 1.22, 1.8); for (let i = 0; i < 3; i++) { const an = -1.9 + i * 0.6; circle(g, hand[0] + Math.cos(an) * 30 * u, hand[1] - 10 + Math.sin(an) * 30 * u, 5 * (1 - u), alpha(CREAM, 1 - u)); } }
  });
  kitchenFg(g, 50 + t, cam);
  chipText(g, t, '?', 1.74, hand[0] - 30 - (cam.x || 0), hand[1] - 120, { color: CREAM, size: 56 });
}});

// ======================================================================= s010 GIANT FACE: Not even you.
registerShot('s010', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] });
  blurLayer(g, 12, (g) => kitchen(g, 55 + t, { z: 1.4, x: 240, y: -60 }), null, 1);
  veil(g, '#2a1a10', 0.15);
  layer(g, cam, 1, (g) => {
    const f = faceAt(t, [[0, { ...faceParams('neutral'), look: [0.1, 0.8] }], [0.33, { ...faceParams('worried'), look: [0.1, 0.6] }], [0.55, { ...faceParams('sheepish'), look: [0, 0] }]]);
    heroBigFace(g, 920, 580, 330, { f, blink: blinkAmt(t, 3.0, 4), rimColor: '#ffd9a0', rimSide: -1, breath: Math.sin(t * 2.4) });
  });
}});
import { FACE } from '../sets/faces.js';
const faceParams = (n) => ({ ...FACE[n] });

// ======================================================================= s011 TITLE
registerShot('s011', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-20, 20] }), K = kitchen(g, 1.15, cam, { steam: 0 }), P = K.P, GY = K.GY;
  layer(g, cam, 1, (g) => {
    dev(g, { x: 330, y: GY, t: 0, frozen: true, pose: { ...POSES.holdFront, hF: [26, -186], eF: [26, -150] }, prop: { type: 'cup' }, expr: 'happy', face: { eyes: 'closed', brows: null, mouth: 'smallFlat' } });
    tableKids(g, t, P, GY, { frozen: true, minaExpr: 'shocked', hero: false });
    tueSpill(g, t, P, TUE_TT, 1);
    frozenGlow(g, (g) => leapCat(g, { x: P.tableX + 120, y: P.tableTop - 150, s: 1.7, facing: 1, t: 0, eyes: 'wide', rim: K.rim }), { k: 0.6 });
    stillMark(g, P.tableX + 250, P.tableTop - 200, 1, t, 4); stillMark(g, 360, GY - 420, 0.9, t, 5);
  });
  kitchenFg(g, 1.15, cam);
  const HO = { x: lerp(1560, 1420, ease.out(prog(t, 0, 2.0))), y: GY, s: 1.9, facing: -1 };
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1); hangingDust(g, t, { at: -1, count: 70, seed: 11 });
    hero(g, { ...HO, t, pose: idle(snapPose(t, 1.95), t, 1), expr: exprAt(t, [[0, 'awe'], [1.95, 'smirk']]), look: lookToward(-1, 0) });
    const hand = handWorld(HO, snapPose(t, 1.95)); snapBurst(g, t, { x: hand[0] - 4, y: hand[1] - 10, t0: 1.95, s: 0.9 });
  });
  chipText(g, t, '10 SECONDS', 0.59, 1500, 140);
  titleLock(g, t, 2.0);
}});
function titleLock(g, t, at) {
  const k = ease.outBack(prog(t, at, at + 0.45)), u = t - at; if (u < 0) return;
  const cx = E.W / 2, cy = E.H * 0.42;
  if (u < 1.2) { const rk = ease.out(clamp(u / 1.0)); ring(g, cx, cy, 80 + 900 * rk, 6, alpha('#ffffff', 0.7 * (1 - rk))); ring(g, cx, cy, 60 + 760 * rk, 3, alpha('#6fe0ff', 0.6 * (1 - rk))); }
  g.save(); g.translate(cx, cy); g.scale(k, k);
  g.fillStyle = 'rgba(8,12,26,.55)'; rr(g, -760, -190, 1520, 380, 40); g.fill();
  const st = { font: FONTS.title, weight: 700, stroke: 14, strokeColor: '#141026', glow: 18 };
  text(g, 'WHAT IF YOU COULD', 0, -110, { ...st, size: 86, color: CREAM, glowColor: 'rgba(255,240,200,.45)' });
  text(g, 'FREEZE TIME FOR', 0, 0, { ...st, size: 108, color: CREAM, glowColor: 'rgba(160,220,255,.6)' });
  text(g, '10 SECONDS?', 0, 118, { ...st, size: 112, color: GOLD, glowColor: 'rgba(255,200,60,.7)' });
  g.restore();
}

// ======================================================================= s012 You tell Dev and Mina. Dev starts filming.
registerShot('s012', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-30, 0] }), K = kitchen(g, 60 + t, cam, { juice: false }), P = K.P, GY = K.GY;
  layer(g, cam, 1, (g) => {
    mina(g, { x: 420, y: GY, facing: 1, t, pose: idle(POSES.crossArms, t, 4), expr: 'suspicious', face: { eyes: 'dot', brows: 'angry', mouth: 'smallFlat' }, look: lookToward(1, -0.2) });
    orangeFeet(g, 420, GY, 2.0, 1);
    const dp = poseAt(t, [[0, POSES.relaxed], [1.91, POSES.phone]], 0.3);
    dev(g, { x: 740, y: GY, facing: 1, t, pose: idle(dp, t, 7), expr: exprAt(t, [[0, 'smile'], [1.91, 'happy']]), look: lookToward(1, -0.1), prop: { type: 'phone', glow: t > 2.35 ? '#ff6a6a' : '#9fd8ff' } });
    if (t > 2.35 && Math.floor(t * 3) % 2 === 0) { const ph = handWorld({ x: 740, y: GY, s: 1.9, facing: 1 }, POSES.phone); circle(g, ph[0] + 10, ph[1] - 40, 7, '#ff3b30'); glow(g, ph[0] + 10, ph[1] - 40, 30, '#ff3b30', 0.5); }
    const hp = poseAt(t, [[0, POSES.explain], [0.43, SNAP_PREP], [1.5, POSES.explain], [2.4, POSES.talk]], 0.3);
    hero(g, { x: 1180, y: GY, facing: -1, t, pose: idle(hp, t, 1), expr: exprAt(t, [[0, 'happy'], [0.43, 'joy'], [1.6, 'smile']]), look: lookToward(-1, 0) });
    atmos(g, t, cam, { color: '#ffe6c0', far: 20, near: 6 });
  });
  kitchenFg(g, 60 + t, cam);
}});
export function orangeFeet(g, x, y, s, f = 1) {   // Mina's orange-soaked socks (pose stand/crossArms feet)
  const k = s * 0.72; for (const fx of [3, -11]) { g.fillStyle = '#ffa21a'; g.beginPath(); g.ellipse(x + (fx + 6) * k * f, y - 5 * k, 11 * k, 6 * k, 0, 0, 7); g.fill(); }
}

// ======================================================================= s013 Mina starts her stopwatch.
registerShot('s013', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.2, 1.26] });
  blurLayer(g, 12, (g) => kitchen(g, 65 + t, { z: 1.5, x: -260, y: -40 }), null, 1);
  veil(g, '#1a1020', 0.18);
  const press = t > 0.41 && t < 0.62 ? 1 : 0, sec = Math.max(0, 1.5 * prog(t, 0.81, info.dur));
  layer(g, cam, 1, (g) => {
    const sw = Math.sin(t * 2.2) * 30;                                                    // her red scarf end swings in
    g.save(); g.translate(260 + sw, -40); g.rotate(0.25 + sw * 0.002); rr(g, -60, 0, 120, 640, 50); g.fillStyle = '#d4262e'; g.fill(); g.fillStyle = shade('#d4262e', -0.25); for (let i = 0; i < 4; i++) g.fillRect(-60, 560 + i * 18, 120, 6); g.restore();
    seg(g, [[820, -40], [930, 260]], 5, '#2a2230');                                       // the cord
    stopwatch(g, t, { x: 960, y: 560, s: 1.5, sec, running: t > 0.81, press, label: "MINA'S" });
    // her hands: two dark kid mitts holding the sides, the thumb on the crown
    for (const sd of [-1, 1]) { g.fillStyle = '#14121a'; g.beginPath(); g.ellipse(960 + sd * 240, 640, 70, 90, sd * 0.4, 0, 7); g.fill(); }
    const ty = 270 + press * 14; seg(g, [[1150, 520], [1060, ty + 40], [985, ty]], 46, '#14121a');
    if (sec > 0.05) text(g, (sec < 10 ? '0' : '') + sec.toFixed(1), 1460, 300, { size: 110, color: GOLD, font: FONTS.ui, weight: 900, stroke: 10, strokeColor: '#1a1206', glow: 16, glowColor: alpha(GOLD, 0.6) });
  });
}});

// ======================================================================= s014 To them, nothing happened.
registerShot('s014', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.02, 1.05], x: [60, 80] }), K = kitchen(g, 70 + t, cam, { juice: false }), P = K.P, GY = K.GY;
  layer(g, cam, 1, (g) => {
    const sp = (base) => poseAt(t, [[0, base], [0.49, POSES.shrug], [1.5, base]], 0.2);
    dev(g, { x: 900, y: GY, facing: 1, t, pose: idle(sp({ ...POSES.relaxed }), t, 7), expr: exprAt(t, [[0, 'neutral'], [0.49, 'confused']]), look: lookToward(1, 0), prop: { type: 'phone' } });
    mina(g, { x: 1300, y: GY, facing: -1, t, pose: idle(sp(POSES.holdFront), t, 4), expr: exprAt(t, [[0, 'neutral'], [0.49, 'confused']]), look: lookToward(1, -0.3) });
    orangeFeet(g, 1300, GY, 2.0, -1);
    atmos(g, t, cam, { color: '#ffe6c0', far: 18, near: 6 });
  });
  kitchenFg(g, 70 + t, cam);
  blurLayer(g, 8, (g) => hero(g, { x: 260, y: GY + 260, s: 3.2, facing: 1, t, pose: idle(POSES.stand, t, 1), expr: 'neutral', look: lookToward(1, 0) }), cam, 1.4);
}});

// ======================================================================= s015 Dev's clip: in the chair, then in the puddle
registerShot('s015', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.1, 1.15] });
  blurLayer(g, 12, (g) => kitchen(g, 75 + t, { z: 1.3, x: 300, y: -40 }), null, 1);
  veil(g, '#14101c', 0.3);
  const NEXT = 2.0, scrub = t > 2.64 ? Math.sin((t - 2.64) * 7) : 0, showStand = t >= NEXT + 0.05 && scrub > -0.3;
  layer(g, cam, 1, (g) => {
    devCam(g, t, { x: E.W * 0.54, y: E.H * 0.48, s: 1.25, rot: -0.02, at: t, sec0: 3 }, (g, w, h) => {
      const kc = { z: 1.15, x: 120, y: 30 }, KK = kitchen(g, 1, kc, { steam: 0 }), P = KK.P, GY = KK.GY;
      layer(g, kc, 1, (g) => {
        mina(g, { ...MINA_SEAT(P), y: GY, t: 1, pose: { ...SIT_REACH, eF: [32, -120], hF: [62, -104] }, expr: 'shocked', look: lookToward(0.4, 0.6) });
        if (!showStand) { tueSpill(g, 0, P, 0.35, 0); hero(g, { ...HERO_SEAT(P), y: GY, t: 1, pose: SIT_EAT, expr: 'neutral' }); }
        else { juiceSplash(g, 3, 0, P.minaSeatX + 60, GY + 6, { s: 0.7 }); juiceGlass(g, P.minaSeatX + 20, GY - 4, 0.62, { rot: -1.57, fill: 0 }); hero(g, { x: P.heroSeatX - 120, y: GY, t: 1, pose: ARMS_OUT, expr: 'surprised' }); }
      });
      if (t > NEXT - 0.02 && t < NEXT + 0.06) { g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(0, 0, w, h); }
    });
    text(g, '00:03', E.W * 0.54, E.H * 0.48 + 300, { size: 60, color: GOLD, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#1a1206' });
  });
  // over Dev's shoulder: the orange beanie + his thumb scrubbing
  blurLayer(g, 6, (g) => { circle(g, 140, 980, 260, '#14121a'); g.fillStyle = '#f08a24'; g.beginPath(); g.arc(140, 900, 250, Math.PI * 1.05, Math.PI * 1.95); g.fill(); circle(g, 1560, 1020, 200, '#3c4058'); }, null, 1);
  const thx = 1300 + scrub * 70; seg(g, [[1520, 1100], [thx + 40, 880], [thx, 840]], 54, '#14121a');
}});

// ======================================================================= s016 But why was it dark?
registerShot('s016', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [80, 100] }), K = kitchen(g, 80 + t, cam, { juice: false }), P = K.P, GY = K.GY;
  const HO = { x: 1240, y: GY, s: 2.05, facing: -1 };
  layer(g, cam, 1, (g) => {
    const p = poseAt(t, [[0, POSES.stand], [0.4, SCRATCH]], 0.3), sc = Math.sin(t * 14) * (t > 0.5 ? 3 : 0);
    hero(g, { ...HO, t, pose: idle({ ...p, hF: [p.hF[0] + sc, p.hF[1]] }, t, 1), expr: exprAt(t, [[0, 'neutral'], [0.78, 'thinking']]), look: t > 0.26 ? lookToward(-0.6, -0.8) : lookToward(-1, 0) });
    const hd = handWorld(HO, POSES.stand, 'head'); for (const dx of [-12, 12]) { glow(g, hd[0] + dx * 2.05 - 30, hd[1] - 10, 16, '#fff6e0', 0.8); }
    atmos(g, t, cam, { color: '#ffe6c0', far: 20, near: 6 });
  });
  kitchenFg(g, 80 + t, cam);
}});

// ======================================================================= s017 The lights were on. The sun was out.
registerShot('s017', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.12, 1.12], x: [200, -240], y: [-60, -40] }), K = kitchen(g, 85 + t, cam, { juice: false }), P = K.P, GY = K.GY;
  const pulse = Math.exp(-((t - 0.24) ** 2) / 0.08), sun = ease.out(prog(t, 1.82, 2.6));
  layer(g, cam, 1, (g) => {
    glow(g, P.tableX, P.tableTop - 330, 420, '#ffe2a8', 0.25 + 0.4 * pulse);
    hero(g, { x: P.tableX + 260, y: GY, facing: -1, t, pose: idle(t < 1.6 ? POSES.pointUp : POSES.point, t, 1), expr: exprAt(t, [[0, 'smile'], [1.82, 'happy']]), look: t < 1.6 ? lookToward(-0.3, -1) : lookToward(-1, -0.4) });
    sunbeam(g, P.windowX, P.windowY + 200, P.tableX - 60, P.tableTop, 120, 220, 0.04 + 0.12 * sun);
    atmos(g, t, cam, { color: '#ffe6c0', far: 30, near: 10 });
  });
  kitchenFg(g, 85 + t, cam);
}});
