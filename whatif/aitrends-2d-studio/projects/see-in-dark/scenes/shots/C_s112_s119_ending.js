// C_s112_s119_ending.js — batch C (v2): what is NOT real (no human sees heat, goggles aren't eyes), the blind-in-the-dark comedy (Dev + Biscuit),
// what it would take (IR sensors, a body that doesn't glow), "not yet", the quiet thermal city, the question, the white-spark freeze, the end screen.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shake, circle, rr, seg, text, FONTS, rng, mix } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { lab, labFg } from '../sets/lab.js';
import { street, streetGround } from '../sets/street.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { thermalView, heat, heatActor, heatCat, heatBlob, heatRect } from '../sets/thermal.js';
import { chip, darkness } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, talkGesture, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { HERO, MINA, DEV, LIN, TOMAS } from '../cast.js';
import { shotWord, handWorld, scr, warmer, hangingRain, tick, cross } from './C_lib.js';

const bpPush = (g, t, dur, fn) => { const z = 1 + 0.035 * (t / dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2); fn(); g.restore(); };
// night-vision goggles (line art for blueprints, or worn on a face)
function goggleArt(g, x, y, s, col, lens = null) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 5; g.lineCap = 'round';
  for (const dx of [-46, 46]) { g.beginPath(); g.arc(dx, 0, 38, 0, 7); g.stroke(); if (lens) { g.fillStyle = lens; g.beginPath(); g.arc(dx, 0, 30, 0, 7); g.fill(); } }
  g.beginPath(); g.moveTo(-8, -4); g.lineTo(8, -4); g.moveTo(-84, 0); g.lineTo(-120, -24); g.moveTo(84, 0); g.lineTo(120, -24); g.stroke(); g.restore(); }

// s112 — BLUEPRINT: "But no human can see heat, goggles aren't eyes,"  eye vs the IR band with a coral X on 'heat'; goggles with a coral X on "aren't eyes"
registerShot('s112', { draw(g, t, info) {
  const st = info.shot.start, tHeat = shotWord('heat', st, 0.9), tArent = shotWord("aren't", st, 1.6), ui = S().ui;
  bpPush(g, t, info.dur, () => {
    BP.board(g, t, { title: 'WHAT IS NOT REAL', fig: 'FIG 11 - SIGHT VS HEAT' });
    const A = BP.eye(g, t, { x: E.W * 0.22, y: E.H * 0.42, r: 170, k: ease.out(prog(t, 0, 1.0)), inset: false });
    BP.wavelength(g, t, { x: E.W * 0.42, y: E.H * 0.2, w: E.W * 0.5, h: E.H * 0.38, k: ease.out(prog(t, 0.2, 1.2)), peak: 9.5 });
    text(g, 'YOUR EYES', E.W * 0.22, E.H * 0.66, { size: 34, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, 0.4, 0.8)) });
    cross(g, E.W * 0.36, E.H * 0.42, prog(t, tHeat, tHeat + 0.5), ui.accent, 40);
    const gk = ease.out(prog(t, tArent - 0.6, tArent)); if (gk > 0) { g.save(); g.globalAlpha *= gk; goggleArt(g, E.W * 0.58, E.H * 0.8, 1.1, ui.blueprint); text(g, 'GOGGLES', E.W * 0.58, E.H * 0.8 - 70, { size: 34, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); }
    cross(g, E.W * 0.74, E.H * 0.8, prog(t, tArent, tArent + 0.5), ui.accent, 40);
  });
  chip(g, t, { str: 'No human can see heat', at: tHeat, x: E.W * 0.3, y: E.H * 0.86, tone: 'coral', dur: tArent - 0.05 });
} });

// s113 — "and without light, cats and goggles are blind."  pitch-black apartment: DEV in NV goggles and BISCUIT both bump into the coffee table
registerShot('s113', { draw(g, t, info) {
  const st = info.shot.start, tLight = shotWord('light', st, 0.4), tBlind = shotWord('blind', st, 1.6), bump = (x) => ease.out(prog(t, tBlind - 0.05, tBlind + 0.05)) * (1 - ease.out(prog(t, tBlind + 0.05, tBlind + 0.4))) * x;
  const cam = camMove(t, info.dur, { z: [1.25, 1.3], x: [-160, -130], y: [80, 84] }); const sk = shake(t * 4, 10 * bump(1)); cam.x += sk[0];
  const A = apartment(g, t, cam, { power: 0 }), GY = A.GY, tx = A.pos.tableX;
  veil(g, '#02030a', 0.35);
  layer(g, cam, 1, (g) => {
    const dx = Math.min(tx - 210, tx - 560 + 150 * t), cx = Math.min(tx + 110, tx + 420 - 160 * t);
    const dw = walkAlong(dx, 1.85, {}), dPose = t < tBlind ? dw.pose : idle(reaction('wince', t, tBlind), t, 2);
    actor(g, 'DEV', { x: dx - bump(18), y: GY + 30, s: 1.85, facing: 1, pose: dPose, expr: exprAt(t, [[0, 'confused'], [tBlind, 'shocked'], [tBlind + 0.5, 'nervous']]), blink: blinkFlag(t, 3.1, 2), rim: A.rim, t });
    const hp = [dx + dPose.head[0] * 1.85, GY + 30 + dPose.head[1] * 1.85]; goggleArt(g, hp[0] + 22, hp[1] - 6, 0.42, '#8a96a8', '#06100a'); glow(g, hp[0] + 22, hp[1] - 6, 40, '#5a7a5a', 0.15);     // the goggles: dark lenses, nothing to amplify
    cat(g, { x: cx + bump(14), y: GY + 4, s: 1.9, facing: -1, pose: t < tBlind ? 'stand' : 'sit', walk: t < tBlind ? t * 9 : 0, eyes: t > tBlind + 0.25 ? 'offended' : 'auto', t, rim: { color: A.rim.color, dir: [-0.4, -1] } });
    if (Math.abs(t - tBlind) < 0.18) { FX.sparkle(g, tx - 150, GY - 70, 26, '#ffffff', 0.8); FX.sparkle(g, tx + 60, GY - 40, 20, '#ffffff', 0.8); }
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#b8c8ff', far: 16, near: 6 });
  chip(g, t, { str: 'Blind without light', at: tBlind + 0.15, x: E.W * 0.5, y: E.H * 0.86, tone: 'blue' });
} });

// s114 — BLUEPRINT: "You'd need infrared sensors, and a body that doesn't glow itself."  line figure with IR sensor eyes and a cooled body
registerShot('s114', { draw(g, t, info) {
  const st = info.shot.start, tIR = shotWord('infrared', st, 0.7), tBody = shotWord('body', st, 2.6), tGlow = shotWord('glow', st, 3.4), ui = S().ui;
  bpPush(g, t, info.dur, () => {
    BP.board(g, t, { title: 'WHAT IT WOULD TAKE', fig: 'FIG 12 - A HEAT-SEEING BODY' });
    const fx = E.W * 0.42, fy = E.H * 0.86, cool = ease.inOut(prog(t, tBody - 0.2, tGlow + 0.4));
    glow(g, fx, fy - 260, 340, '#ff7a30', 0.35 * (1 - cool)); glow(g, fx, fy - 260, 300, '#7fc8ff', 0.25 * cool);
    UI.lineFigure(g, { x: fx, y: fy, s: 2.6, pose: POSES.stand, color: mix('#e8f0ff', '#9fd8ff', cool) });
    const ek = ease.outBack(prog(t, tIR - 0.2, tIR + 0.3)); if (ek > 0) for (const dx of [-12, 14]) { circle(g, fx + 22 + dx, fy - 548, 11 * ek, ui.gold); glow(g, fx + 22 + dx, fy - 548, 40, ui.gold, 0.5 * ek); }
    BP.label(g, t, { at: [fx + 40, fy - 548], to: [fx + 300, fy - 640], str: 'IR SENSORS', start: tIR });
    BP.label(g, t, { at: [fx + 40, fy - 330], to: [fx + 330, fy - 300], str: 'COOLED BODY', start: tBody });
    for (let i = 0; i < 4; i++) { const ph = (t * 0.8 + i / 4) % 1, a = (1 - ph) * (1 - cool); g.strokeStyle = alpha('#ff9a50', 0.5 * a); g.lineWidth = 4; g.beginPath(); g.arc(fx, fy - 260, 160 + ph * 200, -2.4, -0.7); g.stroke(); }
  });
  chip(g, t, { str: "A body that doesn't glow", at: tGlow - 0.4, x: E.W * 0.72, y: E.H * 0.86, tone: 'gold' });
} });

// s115 — "Are we close? Not yet."  DR LIN taps the blueprint wall and shakes her head with a smile; gold chip 'NOT YET' on 'Not'
registerShot('s115', { draw(g, t, info) {
  const st = info.shot.start, tClose = shotWord('close', st, 0.4), tNot = shotWord('not', st, 1.2);
  const cam = camMove(t, info.dur, { z: [1.2, 1.26], x: [-280, -240], y: [70, 74] });
  const L = lab(g, t, cam, { lights: 1, wallT: 5 });
  layer(g, cam, 1, (g) => {
    const shakeNo = t > tNot ? Math.sin((t - tNot) * 12) * 6 * clamp(1 - (t - tNot) / 0.9) : 0, o = { x: L.pos.wallX + 80, y: L.GY + 24, s: 1.95, facing: 1 };
    const pose = idle(poseAt(t, [[0, 'point'], [tClose + 0.2, { ...POSES.point, hF: [70, -176] }], [tNot, 'relaxed']], 0.25), t, 5); pose.head = [pose.head[0] + shakeNo, pose.head[1]];
    actor(g, 'LIN', { ...o, pose, expr: exprAt(t, [[0, 'thinking'], [tNot, 'smile']]), blink: blinkFlag(t, 3.3, 5), look: t < tNot ? lookToward(-0.4, -0.5) : lookToward(1, 0), rim: L.rim, t });
    if (Math.abs(t - tClose - 0.25) < 0.15) FX.rings(g, o.x + 70 * 1.95, o.y - 176 * 1.95, t * 3, { count: 2, r0: 10, r1: 60, color: '#9fd8ff', a: 0.6 });
  });
  labFg(g, t, cam); atmos(g, t, cam, { color: '#cfe0ff' });
  chip(g, t, { str: 'NOT YET', at: tNot, x: E.W * 0.66, y: E.H * 0.8, tone: 'gold' });
} });

// s116 — THERMAL rooftop: "The dark was never empty. It was only quiet."  the city at night softly glowing; HERO sits at the edge, Biscuit beside
registerShot('s116', { draw(g, t, info) {
  const st = info.shot.start, tEmpty = shotWord('empty', st, 1.0), tQuiet = shotWord('quiet', st, 2.4), GY = streetGround(), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-60, 40], y: [-60, -50], drift: 0.6 });
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => {
      layer(c, cam, 0.6, (c) => { const r = rng(7); for (let i = 0; i < 46; i++) { const x = r() * E.W * 1.6 - E.W * 0.3, y = E.H * (0.12 + r() * 0.42), on = ease.out(prog(t, 0.2 + r() * 1.6, 0.6 + r() * 1.6)); heatRect(c, x, y, 22, 30, (0.45 + r() * 0.3) * on, 3); }
        for (let i = 0; i < 6; i++) { const x = CX - 700 + i * 260, w = Math.sin(t * 0.8 + i) * 20; heatActor(c, 'HERO', { x: x + w, y: GY + 30, s: 0.55, facing: i % 2 ? 1 : -1, pose: walkAlong(x + w, 0.55, {}).pose, t, heat: 0.75, halo: false }); }
        heatCat(c, { x: CX + 380, y: E.H * 0.47, s: 0.7, facing: -1, pose: 'loaf', t, heat: 0.6 }); });
      layer(c, cam, 1.15, (c) => { c.fillStyle = heat(0.18); c.fillRect(-E.W, E.H * 0.86, E.W * 3, E.H); heatActor(c, 'HERO', { x: CX - 220, y: E.H * 0.87, s: 1.9, facing: 1, pose: idle(POSES.sit, t, 3), t, heat: 0.88 }); heatCat(c, { x: CX + 60, y: E.H * 0.865, s: 1.9, facing: -1, pose: 'sit', t, heat: 0.62 }); });
    },
    hud: { label: 'THERMAL', temp: t < tQuiet ? '' : 'QUIET' },
  });
  FX.dust(g, t, { count: 24, color: '#ffb070', a: 0.25 });
  chip(g, t, { str: 'Never empty, only quiet', at: tQuiet - 0.2, x: E.W * 0.68, y: E.H * 0.18, tone: 'gold' });
} });

// s117 — GIANT FACE: "So what would you do if you could see in complete darkness?"  HERO turns to camera cheeky, eyes glint orange; the question glows beneath
registerShot('s117', { draw(g, t, info) {
  const st = info.shot.start, tWould = shotWord('would', st, 0.4), tDark = shotWord('darkness', st, 2.2);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  g.fillStyle = '#05060e'; g.fillRect(0, 0, E.W, E.H); blurLayer(g, 18, (g) => apartment(g, t, { z: 1.2, x: -100 }, { power: 0 }), null, 1); veil(g, '#03040c', 0.4);
  const turn = ease.inOut(prog(t, 0, 0.9)), f = faceAt(t, [[0, { look: [-0.9, 0] }], [0.9, 'neutral'], [tWould, 'cheeky'], [tDark, { ...{ eye: 0.75, arc: 0.3, brow: 0.6, smile: 0.8, asym: 0.6, w: 1.1, blush: 0.4, glint: 1 } }]], 0.18);
  layer(g, cam, 1, (g) => { glow(g, E.W * 0.85, E.H * 0.5, 800, '#ff7a30', 0.22); giantFace(g, lerp(E.W * 0.43, E.W * 0.5, turn), E.H * 0.48, 300, { who: 'HERO', f: { ...f, glint: Math.max(f.glint, 0.8) }, rimSide: 1, rimColor: '#ff9a50', glint: '#ff9a40', blink: blinkAmt(t, 3.2, 0.2), breath: Math.sin(t * 2.1), tilt: lerp(-0.08, 0.03, turn) }); });
  if (t > tWould) UI.bigLine(g, t - tWould, { str: 'WHAT WOULD YOU DO?', dur: info.dur - tWould + 0.05, y: E.H * 0.9, size: 76 });
} });

// s118 — FREEZE: "Tell us in the comments. And if you'd trust that tiny white spark,"  HERO and MINA hand in hand in silhouette at the forest edge; spark between them
registerShot('s118', { draw(g, t, info) {
  const st = info.shot.start, tCom = shotWord('comments', st, 0.9), tSpark = shotWord('spark', st, 3.6), GY = forestGround();
  const cam = camMove(t, info.dur, { z: [1.22, 1.3], x: [20, 60], y: [70, 80], drift: 0.5 });
  forest(g, 0.4, cam, { view: 'camp', rain: false }); veil(g, '#01020a', 0.5);
  const ink = '#010206', rim = { color: '#ffd9a0', dir: [0.3, -1], w: 6 }, hx = E.W / 2 + 6, hy = GY - 98;
  layer(g, cam, 1, (g) => {
    actor(g, { ...HERO, color: ink, legs: ink }, { x: E.W / 2 - 110, y: GY + 10, s: 1.95, facing: 1, pose: idle({ ...POSES.stand, hF: [58, -96], eF: [30, -126] }, t, 3), expr: 'smile', ink, rim, t });
    actor(g, { ...MINA, color: ink, legs: ink, scarf: '#3a0a10' }, { x: E.W / 2 + 120, y: GY + 10, s: 2.2, facing: -1, pose: idle({ ...POSES.stand, hF: [64, -84], eF: [34, -118] }, t, 4), expr: 'smile', ink, rim, t });
  });
  const [sx, sy] = scr(cam, hx, hy), pulse = 0.85 + 0.15 * Math.sin(t * 3) + 0.35 * ease.out(prog(t, tSpark - 0.2, tSpark + 0.4));
  glow(g, sx, sy, 460 * pulse, '#ffb24a', 0.35); glow(g, sx, sy, 90 * pulse, '#ffffff', 0.9); FX.sparkle(g, sx, sy, 70 * pulse, '#ffffff', 0.95);
  hangingRain(g, t * 0.4, { count: 110, a: 0.22, color: '#ffe0b0', seed: 19 });
  const bk = ease.outBack(prog(t, tCom - 0.1, tCom + 0.35)); if (bk > 0) { g.save(); g.translate(E.W * 0.76, E.H * 0.24); g.scale(bk, bk); UI.bubble(g, 0, 0, { w: 200, h: 110 }); g.restore(); }
} });

// s119 — END SCREEN: "hit like, and subscribe for more What Ifs."  subscribe pill, like icon, the whole cast + Biscuit, the spark in Mina's hand
registerShot('s119', { draw(g, t, info) {
  const st = info.shot.start, tLike = shotWord('like', st, 0.2), tSub = shotWord('subscribe', st, 0.9), tIfs = shotWord('ifs', st, 2.2), ui = S().ui;
  const z = 1 + 0.03 * (t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  UI.endScreen(g, t, { question: 'WHAT WOULD YOU DO?', cast: [HERO, MINA, DEV, LIN, TOMAS], moodColors: ['#0b0a1c', '#1d1530', '#3a2030'], rim: '#ffb070' });
  const n = 5, gap = Math.min(150, E.W * 0.85 / n), y0 = E.H - 170, mx = E.W / 2 - gap;
  const ck = ease.out(prog(t, 0.8, 1.2)); cat(g, { x: E.W / 2 + 3 * gap, y: y0 + (1 - ck) * 30, s: 0.95, facing: -1, pose: 'sit', eyes: 'auto', t, rim: { color: '#ffb070', dir: [0, 1] } });
  const sk = ease.out(prog(t, 0.9, 1.4)); glow(g, mx + 26, y0 - 96, 130, '#ffb24a', 0.45 * sk); glow(g, mx + 26, y0 - 96, 26, '#ffffff', 0.95 * sk); FX.sparkle(g, mx + 26, y0 - 96, 20 * sk, '#ffffff', 0.9);
  const lk = ease.outBack(prog(t, tLike, tLike + 0.4)); if (lk > 0) { g.save(); g.translate(E.W / 2 - V(420, 300), V(300, 560)); g.scale(lk, lk); rr(g, -90, -34, 180, 68, 34); g.fillStyle = '#2a2a3a'; g.fill(); g.strokeStyle = ui.gold; g.lineWidth = 3; g.stroke(); text(g, 'LIKE', 0, 2, { size: 34, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); }
  if (t > tSub) glow(g, E.W / 2 + V(60, 60), V(300, 560), 260 * (1 + 0.1 * Math.sin((t - tSub) * 8)), '#e0302a', 0.28 * clamp(1 - (t - tSub) / 2));
  const tW = Math.min(tIfs - 0.3, info.dur - 1.4), wk = ease.outBack(prog(t, tW - 0.4, tW)); if (wk > 0) { g.save(); g.translate(E.W / 2, E.H * 0.5); g.scale(wk, wk); text(g, 'MORE WHAT IFS', 0, 0, { size: 86, color: ui.gold, glow: 34, glowColor: 'rgba(255,150,60,.8)', spacing: 6, stroke: 10, strokeColor: '#1a0e14' }); g.restore(); }
  g.restore();
  FX.dust(g, t, { count: 30, color: '#ffcf9a', a: 0.25 });
  const out = ease.inOut(prog(t, info.dur - 0.6, info.dur)); if (out > 0) veil(g, '#000', out * 0.9);
} });
