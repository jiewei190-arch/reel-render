// shots/earthhole.js — all 18 shots of "What If You Jumped Into a Hole Through the Earth?" (9:16, 28.5 s).
// Canvas 1080x1920. Captions at y 1330 (keep faces/key action above y 1270); Shorts UI: nothing important below y 1440 or right of x 900.
// Classic I.Awaken look: bright, warm key, rim light, parallax, atmosphere, gold numbers. Original designs only.
import { E, registerShot, layer, blurLayer, ease, prog, clamp, lerp, seg, circle, ring, rr, alpha, shade, glow, text, FONTS, shake, wordTime } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { idle, blinkFlag, blinkAmt, exprAt, poseAt, camMove, lookToward, atmos } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { surface, holeFront, inHole, shaft, shaftFg, globeCut, gauge, chip, heatHaze, coreGlow, GOLD, CREAM, CORAL, LAVA, WHITEHOT } from '../sets/earth.js';

const STAR = { head: [3, -214], sh: [0, -178], hip: [0, -100], eF: [36, -176], hF: [74, -190], eB: [-34, -176], hB: [-72, -190], kF: [22, -52], fF: [40, -10], kB: [-22, -52], fB: [-40, -10] };
// word time relative to this shot (falls back to `def` if the word is not found)
const wt = (info, word, def) => { const w = wordTime(word, info.shot.start - 0.3); return w != null && isFinite(w) ? w - info.shot.start : def; };
const flail = (t, base = 'fall', amt = 0.35) => blendPose(base, 'jump', amt * (0.5 + 0.5 * Math.sin(t * 9)));
const RIM_DAY = { color: '#ffe2b8', dir: [-0.6, -0.8] }, RIM_HOT = { color: '#ffb060', dir: [0, 1] }, RIM_CORE = { color: '#fff4c8', dir: [0, 1] }, RIM_NIGHT = { color: '#9fe8ff', dir: [0.6, -0.8] };
function hero(g, o) { actor(g, 'HERO', { s: 2.4, facing: 1, blink: blinkFlag(o.t ?? 0, 3.1, 1), rim: RIM_DAY, ...o }); }
function space(g, t, cam) {
  layer(g, cam, 0.15, (g) => { g.fillStyle = '#0a1030'; g.fillRect(-1000, -1000, 3100, 3900); glow(g, 540, 800, 1200, '#3a4aa0', 0.5); FX.stars(g, t, { count: 220, area: [-200, -200, 1500, 2300], seed: 9 }); });
  layer(g, cam, 0.4, (g) => { FX.stars(g, t, { count: 60, area: [-200, -200, 1500, 2300], seed: 19, color: '#ffe6c0' }); });
}

// ======================= s001 HOOK: you are already mid-jump over the hole at the North Pole
registerShot('s001', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-60, 90] });
  const S = surface(g, t, cam, { side: 'north' }), Hh = S.hole, u = t / info.dur;
  const x = lerp(360, 540, ease.out(clamp(u * 1.2))), y = lerp(860, 1330, u * u) - Math.sin(Math.min(1, u * 1.6) * Math.PI) * 90;
  const pose = poseAt(t, [[0, 'jump'], [0.55, flail(t)]], 0.25), jumpT = wt(info, 'jumped', 0.48);
  inHole(g, Hh, cam, (g) => hero(g, { x, y, t, pose, rot: lerp(-0.15, 0.1, u), expr: exprAt(t, [[0, 'joy'], [jumpT + 0.25, 'shocked']]), look: lookToward(0.3, 1) }));
  holeFront(g, Hh, cam, false);
  layer(g, cam, 1, (g) => atmos(g, t, cam, { color: '#ffffff', far: 30, near: 12 }));
  FX.snow(g, t, { count: 50, speed: 40, seed: 2 });
  chip(g, t, 'POLE TO POLE · NO AIR', 540, 210, 0.05, { size: 44, color: CREAM });
}});

// ======================= s002 straight through the Earth: the cutaway globe, the tunnel draws on
registerShot('s002', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] }); space(g, t, cam);
  layer(g, cam, 1, (g) => {
    globeCut(g, t, 540, 780, 390, { pos: -1, labels: prog(t, 0.35, 1.3) });
    const k = ease.inOut(prog(t, 0.1, wt(info, 'Earth', 1.05) + 0.2)), y1 = lerp(780 - 390, 780 + 390, k);
    g.save(); g.setLineDash([26, 18]); g.lineDashOffset = -t * 120; seg(g, [[540, 390], [540, y1]], 9, GOLD); g.restore();
    glow(g, 540, y1, 70, GOLD, 0.8); circle(g, 540, y1, 12, GOLD);
    text(g, 'N', 540, 330, { size: 52, color: CREAM, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#0a1030' });
    text(g, 'S', 540, 1235, { size: 52, color: CREAM, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#0a1030', alpha: prog(t, 0.9, 1.2) });
  });
  atmos(g, t, cam, { color: '#c9d4ff', far: 20, near: 6 });
}});

// ======================= s003 You fall.
registerShot('s003', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.12, 1.0] }), sc = 260 * t + 260 * t * t, fallT = wt(info, 'fall', 0.32);
  shaft(g, t, cam, { scroll: sc, heat: 0, speed: 0.35 });
  const op = 1 - prog(t, 0, info.dur);                       // the opening above shrinks away
  glow(g, 540, -60, 520 * op + 120, '#ffe6b0', 0.8); circle(g, 540, -40, 220 * op + 30, alpha('#fff3d8', 0.9));
  layer(g, cam, 1, (g) => hero(g, { x: 540, y: 1120 + Math.sin(t * 3) * 14, t, pose: flail(t, 'fall', 0.6), rot: Math.sin(t * 2.2) * 0.12, expr: exprAt(t, [[0, 'surprised'], [fallT, 'shocked']]), look: lookToward(0, -1), rim: { color: '#fff1d6', dir: [0, -1] } }));
  shaftFg(g, t, cam, { scroll: sc, heat: 0 });
}});

// ======================= s004 Faster every second.
registerShot('s004', { draw(g, t, info) {
  const sh = shake(t, 4, 6), cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [sh[0], sh[0]], y: [sh[1], sh[1]] }), sc = 900 * t + 500 * t * t;
  const fT = wt(info, 'Faster', 0.15), sT = wt(info, 'second', 0.69);
  shaft(g, t, cam, { scroll: sc, heat: 0.08, speed: 0.6 + 0.3 * prog(t, 0, info.dur) });
  layer(g, cam, 1, (g) => hero(g, { x: 560, y: 840, t, pose: blendPose('dive', 'fall', 0.15 + 0.15 * Math.sin(t * 8)), rot: Math.PI + Math.sin(t * 3) * 0.08, expr: exprAt(t, [[0, 'surprised'], [fT, 'joy'], [sT, 'shocked']]), look: lookToward(0, 1), rim: { color: '#fff1d6', dir: [0, 1] }, trail: { count: 3, dx: 0, dy: -50, a: 0.25 } }));
  shaftFg(g, t, cam, { scroll: sc, heat: 0.08 });
  gauge(g, 230, 330, 140, lerp(0.15, 0.55, ease.inOut(prog(t, fT, info.dur))), { label: 'SPEED', str: '' });
}});

// ======================= s005 But then the rock starts to glow.
registerShot('s005', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.1], x: [30, -20] }), sc = 1300 * t, gT = wt(info, 'glow', 1.31), heat = lerp(0.1, 0.62, ease.inOut(prog(t, 0.3, gT + 0.3)));
  shaft(g, t, cam, { scroll: sc, heat, speed: 0.7 });
  layer(g, cam, 1, (g) => hero(g, { x: 600, y: 1150, t, s: 2.5, pose: flail(t, 'fall', 0.3), rot: -0.12 + Math.sin(t * 2) * 0.05, facing: -1, expr: exprAt(t, [[0, 'neutral'], [wt(info, 'rock', 0.6), 'worried'], [gT, 'scared']]), look: lookToward(-1, 0.1), rim: heat > 0.3 ? RIM_HOT : RIM_DAY }));
  shaftFg(g, t, cam, { scroll: sc, heat });
  heatHaze(g, t, heat);
}});

// ======================= s006 The heat and pressure keep rising. (giant face)
registerShot('s006', { draw(g, t, info) {
  const sh = shake(t, 3 + 5 * prog(t, 0.6, info.dur), 7), cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  blurLayer(g, 4, (g) => shaft(g, t, cam, { scroll: 1100 * t, heat: 0.75, speed: 0.6 }));
  const hT = wt(info, 'heat', 0.33), pT = wt(info, 'pressure', 0.63), rT = wt(info, 'rising', 1.13);
  const f = faceAt(t, [[0, 'worried'], [hT, { ...FACE_HOT, sweat: 0.6 }], [pT, 'shocked'], [rT + 0.3, { ...FACE_HOT, sweat: 1, eye: 0.6, tilt: -0.9 }]]);
  layer(g, cam, 1, (g) => giantFace(g, 540 + sh[0], 820 + sh[1], 300, { who: 'HERO', f, rimColor: '#ffb060', rimSide: 1, blink: blinkAmt(t, 3, 2), breath: Math.sin(t * 6), glint: '#ffb060' }));
  heatHaze(g, t, 0.9); FX.dust(g, t * 1.5, { count: 30, color: '#ffa040', a: 0.6, size: 3, seed: 4 });
  gauge(g, 210, 300, 120, lerp(0.2, 0.97, ease.inOut(prog(t, pT - 0.1, info.dur))), { label: 'PRESSURE', color: CORAL });
  chip(g, t, '× 3,600,000 AIR PRESSURE', 540, 1215, pT, { size: 50 });
}});
const FACE_HOT = { eye: 0.85, pupil: 0.9, brow: 0.4, tilt: -0.7, open: 0.25, smile: -0.4, w: 0.8, sweat: 0.8 };

// ======================= s007 Near the core, it's about as hot (cutaway, zooming in, you're nearly at the core)
registerShot('s007', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.18], y: [0, 120] }); space(g, t, cam);
  const cT = wt(info, 'core', 0.49);
  layer(g, cam, 1, (g) => {
    globeCut(g, t, 540, 860, 470, { pos: lerp(-0.62, -0.25, ease.inOut(prog(t, 0, info.dur))), labels: 0.25 + 0.5 * prog(t, cT - 0.1, cT + 0.2), trail: (i) => lerp(-0.62, -0.25, ease.inOut(prog(t - i * 0.05, 0, info.dur))) });
    glow(g, 540, 860, 330, WHITEHOT, 0.3 * prog(t, cT, cT + 0.4));
  });
  atmos(g, t, cam, { color: '#ffe0b0', far: 20, near: 8 });
}});

// ======================= s008 ...as the surface of the Sun.  ~5,400 °C
registerShot('s008', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.04, 1.0] }), sT = wt(info, 'Sun', 1.2);
  layer(g, cam, 0.2, (g) => { g.fillStyle = '#1a0a14'; g.fillRect(-800, -800, 2700, 3500); glow(g, 540, 760, 1000, '#ff6a2a', 0.35); FX.stars(g, t, { count: 80, area: [-100, -100, 1300, 2100], seed: 3, color: '#ffd0a0' }); });
  layer(g, cam, 1, (g) => {
    const pulse = 1 + 0.03 * Math.sin(t * 6);
    glow(g, 290, 720, 300, '#fff0b0', 0.8); circle(g, 290, 720, 150 * pulse, WHITEHOT); circle(g, 270, 700, 60, '#ffffff');
    text(g, "EARTH'S CORE", 290, 940, { size: 46, color: CREAM, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#1a0a14' });
    const k = ease.outBack(prog(t, 0.35, 0.75));
    g.save(); g.translate(760, 720); g.scale(k, k); FX.sun(g, 0, 0, 130, '#fff3c0', '#ffb040', 3);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.4; seg(g, [[Math.cos(a) * 160, Math.sin(a) * 160], [Math.cos(a) * 215, Math.sin(a) * 215]], 12, '#ffcf50'); } g.restore();
    text(g, "SUN'S SURFACE", 760, 940, { size: 46, color: CREAM, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#1a0a14', alpha: prog(t, 0.5, 0.8) });
    text(g, '≈', 530, 720, { size: 150, color: GOLD, font: FONTS.ui, weight: 900, alpha: prog(t, sT - 0.4, sT), glow: 20, glowColor: alpha(GOLD, 0.6) });
  });
  chip(g, t, '~5,400 °C', 540, 1150, sT, { size: 96 });
  FX.dust(g, t, { count: 30, color: '#ffc080', a: 0.4, seed: 6 });
}});

// ======================= s009 And it gets weirder. (giant face in the white-gold core light)
registerShot('s009', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08] }), wT = wt(info, 'weirder', 0.67);
  blurLayer(g, 5, (g) => shaft(g, t, cam, { scroll: 1500 * t, heat: 1, core: 0.5, speed: 0.8 }));
  const f = faceAt(t, [[0, { ...FACE_HOT, sweat: 0.7 }], [wT - 0.15, 'awe'], [wT + 0.4, { ...FACE_HOT, eye: 1.2, brow: 1, tilt: 0.2, smile: 0.25, open: 0.1, sweat: 0.3, glint: 1, look: [0.5, -0.3] }]]);
  layer(g, cam, 1, (g) => giantFace(g, 540, 800, 310, { who: 'HERO', f, rimColor: WHITEHOT, rimSide: 1, blink: blinkAmt(t, 3.3, 5), breath: Math.sin(t * 4), glint: '#fff0b0' }));
  coreGlow(g, t, 0.5 + 0.4 * prog(t, wT, info.dur));
}});

// ======================= s010 At the center, you're weightless.  0 g
registerShot('s010', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.15], r: [0.02, -0.02] }), wT = wt(info, 'weightless', 1.19);
  shaft(g, t, cam, { scroll: 1700 * t, heat: 1, core: 0.75, speed: 0.9 });
  layer(g, cam, 1, (g) => hero(g, { x: 540, y: 1080 + Math.sin(t * 2.2) * 30, t, s: 2.5, pose: blendPose(STAR, 'cheer', 0.5 + 0.5 * Math.sin(t * 2)), rot: 0.35 * t - 0.2, expr: exprAt(t, [[0, 'surprised'], [wT, 'joy']]), look: lookToward(0.3, -0.5), rim: RIM_CORE }));
  coreGlow(g, t, 0.8);
  for (let i = 0; i < 8; i++) FX.sparkle(g, 160 + i * 110, 500 + Math.sin(i * 2 + t * 2) * 300, 14, '#ffffff', 0.5 + 0.5 * Math.sin(t * 4 + i));
  chip(g, t, '0 g', 540, 330, wT - 0.05, { size: 130 });
}});

// ======================= s011 racing at eight kilometers per second.  8 km/s
registerShot('s011', { draw(g, t, info) {
  const sh = shake(t, 6, 9), cam = camMove(t, info.dur, { z: [1.12, 1.02], x: [sh[0], sh[0]], y: [sh[1], sh[1]] }), eT = wt(info, 'eight', 0.71);
  const heat = lerp(1, 0.7, prog(t, 0, info.dur)), sc = 2600 * t;
  shaft(g, t, cam, { scroll: sc, heat, core: lerp(0.6, 0.1, prog(t, 0, info.dur)), speed: 1 });
  FX.speedLines(g, t, { cx: 540, cy: 900, count: 70, color: '#fff3d0', a: 0.3, inner: 300 });
  layer(g, cam, 1, (g) => hero(g, { x: 540, y: 780, t, pose: blendPose('dive', 'cheer', 0.25 + 0.1 * Math.sin(t * 10)), rot: Math.PI, expr: exprAt(t, [[0, 'shocked'], [eT, 'joy']]), look: lookToward(0, 1), rim: RIM_HOT, trail: { count: 5, dx: 0, dy: -70, a: 0.3 } }));
  shaftFg(g, t, cam, { scroll: sc, heat });
  gauge(g, 230, 300, 130, lerp(0.6, 1, ease.out(prog(t, 0, eT + 0.3))) - 0.02 * Math.sin(t * 30), { label: 'SPEED', color: GOLD });
  chip(g, t, '8 km/s', 600, 1170, eT, { size: 110 });
}});

// ======================= s012 Then you slow down, and
registerShot('s012', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08] }), sT = wt(info, 'slow', 0.57), v = lerp(1, 0.25, ease.inOut(prog(t, sT - 0.2, info.dur)));
  const sc = 2000 * t - 700 * t * t, heat = lerp(0.6, 0.25, prog(t, 0, info.dur));
  shaft(g, t, cam, { scroll: sc, heat, speed: v * 0.8 });
  layer(g, cam, 1, (g) => hero(g, { x: 520, y: 1150, t, pose: poseAt(t, [[0, flail(t, 'fall', 0.4)], [sT + 0.1, idle(POSES.shrug, t, 2)]], 0.4), rot: lerp(0.3, 0, prog(t, sT, info.dur)), expr: exprAt(t, [[0, 'joy'], [sT, 'confused']]), look: lookToward(0, -1), rim: RIM_HOT }));
  shaftFg(g, t, cam, { scroll: sc, heat });
  gauge(g, 230, 300, 130, v, { label: 'SPEED', color: GOLD });
  heatHaze(g, t, heat);
}});

// ======================= s013 about thirty-eight minutes later   38 MIN
registerShot('s013', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.02, 1.0] }); space(g, t, cam);
  const mT = wt(info, 'thirty-eight', 0.39), P = (tt) => lerp(0.05, 0.99, ease.inOut(prog(tt, 0, info.dur - 0.1)));
  layer(g, cam, 1, (g) => globeCut(g, t, 540, 780, 400, { pos: P(t), labels: 0, trail: (i) => P(t - i * 0.06) }));
  FX.clock(g, 200, 270, 95, t, { speed: 60 });
  chip(g, t, '38 MIN', 540, 1230, mT, { size: 110 });
}});

// ======================= s014 you pop out on the other side.  (South Pole, night, aurora, penguins)
registerShot('s014', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.1, 1.02], y: [40, -40] });
  const S = surface(g, t, cam, { side: 'south' }), Hh = S.hole, pT = wt(info, 'pop', 0.15), u = clamp((t - pT + 0.1) / 1.2);
  const y = Hh.y + 520 - 920 * (1 - (1 - u) * (1 - u));
  inHole(g, Hh, cam, (g) => hero(g, { x: 540, y, t, pose: poseAt(t, [[0, 'dive'], [pT + 0.25, 'cheer']], 0.3), expr: exprAt(t, [[0, 'shocked'], [pT + 0.35, 'joy']]), look: lookToward(-0.3, -0.5), rim: RIM_NIGHT }));
  holeFront(g, Hh, cam, true);
  if (t > pT) { FX.rings(g, 540, Hh.y, t - pT, { count: 2, r0: 60, r1: 320, color: '#ffe6c0', a: 0.5 * (1 - prog(t, pT, pT + 0.8)) }); FX.dust(g, t, { count: 30, color: '#ffffff', a: 0.6, seed: 13, area: [300, Hh.y - 300, 480, 300] }); }
  FX.snow(g, t, { count: 40, speed: 30, seed: 6 });
  chip(g, t, 'SOUTH POLE', 540, 140, 0.05, { size: 52, color: CREAM });
}});

// ======================= s015 With no air to stop you,  (you hang at the top...)
registerShot('s015', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.08, 1.14], y: [40, 60] });
  const S = surface(g, t, cam, { side: 'south' }), Hh = S.hole, nT = wt(info, 'no', 0.73), aT = wt(info, 'air', 0.99), sT = wt(info, 'stop', 1.31);
  const drop = prog(t, info.dur - 0.35, info.dur), y = Hh.y - 170 + Math.sin(t * 2) * 6 + 120 * drop * drop;
  inHole(g, Hh, cam, (g) => hero(g, { x: 540, y, t, pose: poseAt(t, [[0, idle(POSES.cheer, t, 3)], [nT, 'shrug'], [sT, 'handsOnHead']], 0.25), expr: exprAt(t, [[0, 'joy'], [nT, 'confused'], [sT, 'scared']]), look: lookToward(0, 1), rim: RIM_NIGHT }));
  holeFront(g, Hh, cam, true);
  chip(g, t, 'NO AIR = NO BRAKES', 540, 1170, aT, { size: 60 });
  atmos(g, t, cam, { color: '#cfe0ff', far: 20, near: 8 });
}});

// ======================= s016 you fall back.
registerShot('s016', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.2, 1.05], y: [-120, 60] });
  const S = surface(g, t, cam, { side: 'south' }), Hh = S.hole, u = prog(t, 0, 0.85), y = Hh.y - 120 + 900 * u * u;
  inHole(g, Hh, cam, (g) => hero(g, { x: 540, y, t, pose: flail(t, 'jump', 0.5), rot: Math.sin(t * 5) * 0.1, expr: 'shocked', look: lookToward(0, -1), rim: RIM_NIGHT }));
  holeFront(g, Hh, cam, true);
  glow(g, 540, Hh.y + 100, 300, '#ff9a4a', 0.2 * prog(t, 0.6, 1.0));
  FX.snow(g, t, { count: 40, speed: 30, seed: 7 });
}});

// ======================= s017 Forever.  (you swing pole to pole on the cutaway, over and over)
registerShot('s017', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 0.94] }); space(g, t, cam);
  const P = (tt) => -Math.cos(tt * Math.PI * 2 / 0.62 + 0.4) * 0.98;
  layer(g, cam, 1, (g) => globeCut(g, t, 540, 790, 410, { pos: P(t), labels: 0, trail: (i) => P(t - i * 0.02) }));
  chip(g, t, 'FOREVER ∞', 540, 1230, wt(info, 'Forever', 0.15) - 0.05, { size: 90 });
}});

// ======================= s018 Would you jump?  (giant face at the edge of the hole, cheeky) -> hard cut
registerShot('s018', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [0, 30] }), jT = wt(info, 'jump', 0.43);
  blurLayer(g, 4, (g) => surface(g, t, { z: 1.25, x: 0, y: 200 }, { side: 'north' }));
  const f = faceAt(t, [[0, 'smirk'], [jT - 0.1, 'cheeky'], [jT + 0.35, { ...{ eye: 0.8, arc: 0.2, brow: 0.8, tilt: 0.1, open: 0.15, smile: 0.9, asym: 0.6, w: 1.1, blush: 0.5, glint: 0.8, look: [0.1, 0.2] } }]]);
  layer(g, cam, 1, (g) => giantFace(g, 540, 760, 320, { who: 'HERO', f, tilt: lerp(0, 0.08, ease.out(prog(t, jT, jT + 0.4))), rimColor: '#ffd6a0', rimSide: 1, blink: blinkAmt(t, 3.5, 3), breath: Math.sin(t * 3), glint: '#ffd6a0' }));
  FX.snow(g, t, { count: 40, speed: 40, seed: 8 });
}});
