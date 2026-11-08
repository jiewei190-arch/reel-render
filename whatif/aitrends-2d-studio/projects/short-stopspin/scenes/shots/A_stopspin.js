// A_stopspin.js — "What If the Earth Stopped Spinning for One Second?" (9:16 short, 26 s, classic bright I.Awaken look).
// EAST = screen-right everywhere. Captions burn in at y ~1330: faces / key action above y 1250, nothing important below y 1440
// or right of x 900 (Shorts UI). Word times come from wordTime() so graphics land on the spoken word.
//   s001 hook   tiny planet spinning, you on top sipping coffee, smirk -> curious on "one second"
//   s002 wide   street racing east (camera locked to the ground, a gold EAST arrow on "racing")
//   s003 med    you sip coffee, totally calm; smirk on "feel"
//   s004 insert the globe spins fast, then FREEZES on "stops" (white ring, shake)
//   s005 face   giant face: calm -> shocked on "Instantly"
//   s006 med    the street is frozen; you keep going: launched east on "don't", coffee flies
//   s007 wide   the air keeps going: wind streaks, trees bend, hats and papers fly
//   s008 wide   the oceans keep going: the sea leaps over the wall, the lighthouse (bolted down) stays
//   s009 med    you flail mid-air; speedometer climbs on "fast"
//   s010 insert globe with the gold equator on "equator", counter climbing
//   s011 med    1,670 km/h slams in on "seventy"; you fly past with speed lines
//   s012 wide   up in the sky: you overtake a jet on "jet"
//   s013 wide   houses' loose stuff, cars, benches lift off and fly east
//   s014 bp     blueprint: bedrock stays (hatched), everything above it -> east arrows
//   s015 closer you sail off waving; end card <= 0.8 s, hard cut
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, rng, noise, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad, radGrad, wordTime, shake } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, walkAlong, camMove, atmos, reaction } from '../sets/acting.js';
import { chip } from '../sets/hud.js';
import { gauge } from '../sets/devices.js';
import { stratosphere } from '../sets/sky.js';
import * as BP from '../sets/bp.js';
import { globe, tinyPlanet, sunnyStreet, streetFgBlur, coast, windStreaks, flyingJunk, bigNumber, punchFlash, drawClouds, SKYC, HERO_RIM } from '../sets/spin.js';

const W = (word, after = 0) => wordTime(word, after) ?? after;          // global word time
const L = (info, word, after) => W(word, after ?? info.shot.start) - info.shot.start;   // local (shot) word time
const CHIP_Y = 250;
const sunAtmos = (g, t, cam) => atmos(g, t, cam, { color: '#fff6dc', far: 22, near: 8 });

// a flying hero: tumbling pose with a motion trail and flapping hood strings
function flyHero(g, t, x, y, s, o = {}) {
  const rot = o.rot ?? (-0.5 + Math.sin(t * 5) * 0.25);
  actor(g, 'HERO', { x, y, s, facing: 1, pose: poseAt((t + (o.ph || 0)) % 1.6, [[0, 'fall'], [0.8, 'handsUp']], 0.6), rot, expr: o.expr || 'shocked', blink: blinkFlag(t, 3.1, 4), rim: HERO_RIM, t, shadow: false, trail: o.trail === false ? null : { count: 4, dx: -60 * s / 2, dy: 6, a: 0.25 } });
}

// ---------------------------------------------------------------- s001 HOOK
registerShot('s001', { draw(g, t, info) {
  const tOne = L(info, 'one'), cam = camMove(t, info.dur, { z: [1.12, 1.0], y: [-40, 0], drift: 0.6 });
  const P = tinyPlanet(g, t, cam, { rot: t * 0.32, r: 1250 });
  layer(g, cam, 1, (g) => {
    const pose = idle(poseAt(t, [[0, 'relaxed'], [tOne, 'holdFront']]), t, 1);
    actor(g, 'HERO', { x: 470, y: P.GY + 4, s: 2.35, facing: 1, pose, prop: 'cup', expr: exprAt(t, [[0, 'smirk'], [tOne, 'thinking']]), look: t > tOne ? lookToward(0.3, 0.8) : null, blink: blinkFlag(t, 3.3, 2), rim: P.rim, t });
    // gold spin arrows on the planet rim, pointing east
    const k = ease.out(prog(t, 0.05, 0.6)); g.save(); g.globalAlpha = k;
    for (const [x, y, s] of [[180, P.GY + 110, 1], [760, P.GY + 120, 1]]) { seg(g, [[x - 90 * s, y], [x + 70 * s, y - 6]], 16, '#ffd47e'); poly(g, [[x + 110 * s, y - 8], [x + 60 * s, y - 40], [x + 60 * s, y + 26]], '#ffd47e'); }
    g.restore();
  });
  sunAtmos(g, t, cam);
  // little spinning-Earth bug, top-left: "EARTH SPIN: ON"
  globe(g, t, 150, 230, 78, t * 2.2, { glowK: 0.6 });
  chip(g, t, { str: 'EARTH SPIN: ON', at: 0.1, x: 470, y: 230, tone: 'blue' });
  punchFlash(g, t, 0, 0.35);
} });

// ---------------------------------------------------------------- s002 street racing east
registerShot('s002', { draw(g, t, info) {
  const tRace = L(info, 'racing'), sc = (info.globalT) * 420, cam = camMove(t, info.dur, { z: [1.0, 1.06], drift: 0.5 });
  const P = sunnyStreet(g, t, cam, { scroll: sc });
  // the hero is carried with the ground (stands still relative to it, so camera tracks with him)
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: 420, y: P.GY + 40, s: 2.1, facing: 1, pose: idle(POSES.relaxed, t, 3), prop: 'cup', expr: exprAt(t, [[0, 'neutral'], [tRace, 'smile']]), blink: blinkFlag(t, 3.0, 5), rim: P.rim, t });
  });
  // speed blur on the background edges = the whole city is moving east with you
  windStreaks(g, t, 0.35, { y0: 300, y1: 900, seed: 3 });
  // gold EAST arrow sweeps across on "racing"
  const k = ease.outBack(prog(t, tRace - 0.15, tRace + 0.3)); if (k > 0.01) { g.save(); g.translate(560, 380); g.scale(k, k); rr(g, -260, -60, 420, 120, 60); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = 4; g.stroke(); text(g, 'EAST', -60, 4, { size: 70, color: '#ffd47e', font: FONTS.ui, weight: 900, spacing: 4 }); poly(g, [[230, 0], [150, -70], [150, 70]], '#ffd47e'); seg(g, [[60, 0], [160, 0]], 26, '#ffd47e'); g.restore(); }
  streetFgBlur(g, t, cam, { scroll: sc });
  sunAtmos(g, t, cam);
} });

// ---------------------------------------------------------------- s003 can't feel it
registerShot('s003', { draw(g, t, info) {
  const tFeel = L(info, 'feel'), sc = info.globalT * 420, cam = camMove(t, info.dur, { z: [1.5, 1.6], x: [-150, -170], y: [120, 110], drift: 0.6 });
  const P = sunnyStreet(g, t, cam, { scroll: sc });
  layer(g, cam, 1, (g) => {
    const sip = prog(t, 0.2, 0.7) - prog(t, 1.0, 1.4);
    const pose = idle(poseAt(t, [[0, 'relaxed'], [0.2, { head: [6, -206], sh: [1, -172], hip: [0, -100], eF: [24, -150], hF: [16, -188], eB: [-8, -137], hB: [-14, -104], kF: [8, -50], fF: [10, 0], kB: [-4, -50], fB: [-12, 0] }], [1.1, 'relaxed'], [tFeel, 'shrug']], 0.35), t, 2);
    actor(g, 'HERO', { x: 420, y: P.GY + 40, s: 2.3, facing: 1, pose, prop: 'cup', expr: exprAt(t, [[0, 'happy'], [0.25, 'sleepy'], [1.0, 'neutral'], [tFeel, 'smirk']]), blink: blinkFlag(t, 2.9, 7), rim: P.rim, t });
    // steam from the coffee
    for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; g.strokeStyle = alpha('#ffffff', 0.5 * (1 - ph)); g.lineWidth = 5; g.beginPath(); g.moveTo(470 + i * 10, P.GY - 410 - ph * 120); g.quadraticCurveTo(490 + Math.sin(t * 3 + i) * 20, P.GY - 450 - ph * 120, 470, P.GY - 500 - ph * 120); g.stroke(); }
  });
  streetFgBlur(g, t, cam, { scroll: sc });
  sunAtmos(g, t, cam);
} });

// ---------------------------------------------------------------- s004 it stops
registerShot('s004', { draw(g, t, info) {
  const tStop = L(info, 'stops'), u = t - tStop, frozen = u >= 0;
  const spinT = frozen ? tStop : t, rot = spinT * 3.6 + spinT * spinT * 0.6;       // spinning fast, then dead stop
  const [sx, sy] = frozen && u < 0.4 ? [Math.sin(u * 90) * 22 * (1 - u / 0.4), Math.cos(u * 70) * 16 * (1 - u / 0.4)] : [0, 0];
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0b1430', '#1a2a5a', '#2a3a7a']); g.fillRect(0, 0, E.W, E.H);
  FX.stars(g, 0, { area: [0, 0, E.W, E.H], count: 160, seed: 5 });
  g.save(); g.translate(sx, sy);
  const z = frozen ? 1.0 + 0.05 * Math.exp(-u * 6) : lerp(0.92, 1.0, t / Math.max(0.1, tStop));
  g.translate(E.W / 2, 700); g.scale(z, z); g.translate(-E.W / 2, -700);
  if (!frozen) for (let i = 0; i < 3; i++) { g.strokeStyle = alpha('#9fd8ff', 0.35 - i * 0.1); g.lineWidth = 8; g.beginPath(); g.arc(E.W / 2, 700, 400 + i * 26, -2.6 + (t * 6 + i) % 1, -1.2 + (t * 6 + i) % 1); g.stroke(); }
  globe(g, t, E.W / 2, 700, 380, rot, { arrow: frozen ? 0 : 1, freeze: frozen ? clamp(1 - u / 0.6) : 0, glowK: 1 });
  g.restore();
  chip(g, t, { str: frozen ? 'EARTH SPIN: OFF' : 'EARTH SPIN: ON', at: frozen ? tStop : 0.05, x: E.W / 2, y: 1180, tone: frozen ? 'coral' : 'blue' });
  punchFlash(g, t, tStop, 0.7);
} });

// ---------------------------------------------------------------- s005 Instantly (giant face)
registerShot('s005', { draw(g, t, info) {
  const tIn = L(info, 'instantly'), cam = camMove(t, info.dur, { z: [1.0, 1.08], drift: 0.4 });
  const [sx, sy] = t > tIn && t < tIn + 0.35 ? [Math.sin(t * 80) * 12, Math.cos(t * 66) * 9] : [0, 0];
  sunnyStreet(g, 0, { ...cam, z: 2.2, y: -260 }, { scroll: W('stops') * 420 });       // the street frozen mid-frame, soft behind the face
  veil(g, '#fff6dc', 0.25);
  blurLayer(g, 0, () => {}, null, 1);
  g.save(); g.translate(sx, sy);
  giantFace(g, E.W / 2 - 40, 720, 330, { who: 'HERO', f: faceAt(t, [[0, 'neutral'], [tIn, 'shocked'], [tIn + 0.7, { ...{ eye: 1.3, pupil: 0.45, brow: 1, tilt: -0.5, open: 0.95, smile: -0.2, w: 0.6, sweat: 1 } }]]), blink: blinkAmt(t, 3.4, 1) * (t < tIn ? 1 : 0), rimColor: '#fff1d6', rimSide: -1, glint: '#ffd47e' });
  g.restore();
  if (t > tIn) FX.speedLines(g, t, { cx: E.W / 2 - 40, cy: 720, count: 50, color: '#ffffff', a: 0.25 * clamp(1 - (t - tIn) / 0.8), inner: 420 });
  punchFlash(g, t, tIn, 0.35);
} });

// ---------------------------------------------------------------- s006 But you don't
registerShot('s006', { draw(g, t, info) {
  const tDont = L(info, "don't"), u = t - tDont, sc = W('stops') * 420;     // street frozen
  const cam = camMove(t, info.dur, { z: [1.15, 1.1], x: [-60, 60], drift: 0.4 });
  const P = sunnyStreet(g, W('stops'), cam, { scroll: sc });
  layer(g, cam, 1, (g) => {
    if (u < 0) {    // tipping forward, arms windmilling
      const tip = ease.in(prog(t, 0, tDont));
      actor(g, 'HERO', { x: 380 + tip * 60, y: P.GY + 40, s: 2.2, facing: 1, pose: poseAt(t, [[0, 'shock'], [0.15, 'handsUp']], 0.2), rot: tip * 0.5, prop: 'cup', expr: 'scared', blink: false, rim: P.rim, t });
    } else {        // launched east
      const x = 440 + u * 1100, y = P.GY - 60 - Math.sin(clamp(u / 1.2) * Math.PI) * 160;
      flyHero(g, t, x, y, 2.2, { rot: 0.9 + u * 2.5, expr: 'shocked' });
      // the coffee goes too
      g.save(); g.translate(x + 260 + u * 300, y - 260 - u * 80); g.rotate(u * 9); g.fillStyle = '#f2efe8'; g.fillRect(-14, -18, 28, 36); g.restore();
      for (let i = 0; i < 10; i++) circle(g, x + 200 + u * 260 - i * 20, y - 240 - u * 60 + Math.sin(i) * 14, 8 - i * 0.5, alpha('#6a3a1a', 0.8));
    }
  });
  if (u >= 0) windStreaks(g, t, 0.5 * clamp(u / 0.2), { y0: 500, y1: 1150 });
  chip(g, t, { str: 'YOU KEEP GOING', at: tDont + 0.1, x: E.W / 2 - 40, y: CHIP_Y, tone: 'gold' });
  streetFgBlur(g, W('stops'), cam, { scroll: sc });
  sunAtmos(g, t, cam);
} });

// ---------------------------------------------------------------- s007 Neither does the air
registerShot('s007', { draw(g, t, info) {
  const tAir = L(info, 'air'), wk = 0.55 + 0.45 * ease.out(prog(t, tAir - 0.3, tAir + 0.2)), sc = W('stops') * 420;
  const [sx, sy] = [Math.sin(t * 47) * 6 * wk, Math.cos(t * 39) * 5 * wk];
  const cam = { ...camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.8 }), x: sx, y: sy };
  const P = sunnyStreet(g, t, cam, { scroll: sc, wind: wk });
  windStreaks(g, t, wk, { y0: 100, y1: 1250, seed: 9 });
  flyingJunk(g, t, wk, { y0: 300, y1: 1150, seed: 4, n: 30 });
  // a parasol and a café chair tumble by
  layer(g, cam, 1, (g) => { const x = ((t * 1300) % 1700) - 300; g.save(); g.translate(x, 760); g.rotate(t * 6); poly(g, [[-120, 0], [0, -70], [120, 0]], '#d4262e'); seg(g, [[0, -70], [0, 90]], 6, '#2a2a3a'); g.restore(); });
  chip(g, t, { str: 'THE AIR KEEPS GOING', at: tAir, x: E.W / 2 - 40, y: CHIP_Y, tone: 'blue' });
  streetFgBlur(g, t, cam, { scroll: sc });
} });

// ---------------------------------------------------------------- s008 Neither do the oceans
registerShot('s008', { draw(g, t, info) {
  const tOc = L(info, 'oceans'), surge = clamp((t - 0.05) / (info.dur - 0.1)), cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [0, -60], drift: 0.8 });
  const [sx, sy] = t > tOc ? [Math.sin(t * 50) * 8, Math.cos(t * 43) * 6] : [0, 0];
  g.save(); g.translate(sx, sy);
  coast(g, t, cam, { surge });
  windStreaks(g, t, 0.6, { y0: 120, y1: 900, seed: 13 });
  g.restore();
  chip(g, t, { str: 'THE OCEANS KEEP GOING', at: tOc, x: E.W / 2 - 40, y: CHIP_Y, tone: 'blue' });
} });

// ---------------------------------------------------------------- s009 how fast?
registerShot('s009', { draw(g, t, info) {
  const tFast = L(info, 'fast'), cam = camMove(t, info.dur, { z: [1.05, 1.0], drift: 1 });
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, -200, 0, E.H, SKYC); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
  layer(g, cam, 0.25, (g) => { g.save(); g.translate(-t * 900 % E.W, 0); drawClouds(g, 0, { y: 200, h: 1000, n: 8, seed: 21, a: 0.85 }); g.translate(E.W, 0); drawClouds(g, 0, { y: 200, h: 1000, n: 8, seed: 21, a: 0.85 }); g.restore(); });
  windStreaks(g, t, 0.8, { y0: 0, y1: 1300, seed: 17 });
  layer(g, cam, 1, (g) => flyHero(g, t, 470 + Math.sin(t * 2) * 30, 640 + Math.cos(t * 2.4) * 30, 2.2, { rot: -1.2 + Math.sin(t * 4) * 0.3, expr: exprAt(t, [[0, 'scared'], [tFast, 'shocked']]), trail: false }));
  gauge(g, t, { preset: 'terminal', x: 720, y: 1030, r: 170, at: tFast, value: 1670, max: 2000, step: 500, red: 1500, unit: 'km/h', label: 'YOUR SPEED', sweep: 3.2, pinned: false });
} });

// ---------------------------------------------------------------- s010 at the equator
registerShot('s010', { draw(g, t, info) {
  const tEq = L(info, 'equator'), tSix = L(info, 'sixteen'), cam = camMove(t, info.dur, { z: [1.0, 1.06], drift: 0.4 });
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0b1430', '#1a2a5a', '#2a3a7a']); g.fillRect(0, 0, E.W, E.H);
  FX.stars(g, t * 0.2, { area: [0, 0, E.W, E.H], count: 160, seed: 5 });
  layer(g, cam, 1, (g) => {
    globe(g, t, E.W / 2 - 30, 680, 360, 0.6 + t * 0.02, { equator: ease.out(prog(t, tEq, tEq + 0.5)), glowK: 1 });
    // a tiny hero on the equator rim, flying off east with a gold arrow
    const k = ease.out(prog(t, tEq + 0.2, tEq + 0.8));
    if (k > 0) { seg(g, [[E.W / 2 + 340, 700], [E.W / 2 + 340 + 120 * k, 700]], 12, '#ffd47e'); poly(g, [[E.W / 2 + 380 + 120 * k, 700], [E.W / 2 + 340 + 120 * k, 672], [E.W / 2 + 340 + 120 * k, 728]], '#ffd47e'); }
    BP.label(g, t, { at: [E.W / 2 - 30, 708], to: [E.W / 2 - 220, 1120], str: 'EQUATOR', start: tEq + 0.1 });
  });
  // counter climbing toward 1,670
  const v = Math.round(1670 * ease.out(prog(t, tSix - 0.4, info.dur + 0.3)) * 0.98);
  if (t > tSix - 0.4) { rr(g, 300, 160, 480, 120, 22); g.fillStyle = alpha('#0b1324', 0.88); g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = 3; g.stroke(); text(g, `${v.toLocaleString('en-US')} km/h`, 540, 222, { size: 64, color: '#ffd47e', font: FONTS.ui, weight: 900, glow: 12, glowColor: 'rgba(255,212,126,.6)' }); }
} });

// ---------------------------------------------------------------- s011 1,670 km/h
registerShot('s011', { draw(g, t, info) {
  const tSev = L(info, 'seventy'), cam = camMove(t, info.dur, { z: [1.1, 1.0], drift: 1 });
  const [sx, sy] = t > tSev && t < tSev + 0.3 ? [Math.sin(t * 90) * 14, Math.cos(t * 70) * 10] : [0, 0];
  g.save(); g.translate(sx, sy);
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, -200, 0, E.H, SKYC); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
  layer(g, cam, 0.25, (g) => { g.save(); g.translate(-(t * 1500) % E.W, 0); drawClouds(g, 0, { y: 600, h: 900, n: 7, seed: 31, a: 0.8 }); g.translate(E.W, 0); drawClouds(g, 0, { y: 600, h: 900, n: 7, seed: 31, a: 0.8 }); g.restore(); });
  FX.speedLines(g, t, { cx: 300, cy: 900, count: 70, color: '#ffffff', a: 0.3, inner: 380 });
  windStreaks(g, t, 1, { y0: 500, y1: 1250, seed: 23 });
  layer(g, cam, 1, (g) => flyHero(g, t, 470, 960, 2.3, { rot: 1.25 + Math.sin(t * 3) * 0.12, expr: exprAt(t, [[0, 'scared'], [tSev, 'awe']]) }));
  g.restore();
  bigNumber(g, t, '1,670', E.W / 2 - 40, 360, tSev, { size: 190, sub: 'KM/H  (1,040 MPH)' });
  punchFlash(g, t, tSev, 0.45);
} });

// ---------------------------------------------------------------- s012 faster than a jet
registerShot('s012', { draw(g, t, info) {
  const tJet = L(info, 'jet'), cam = camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.8 });
  const Y = stratosphere(g, t, { ...cam, y: 260 }, { alt: 0.05, jet: null });
  // the jet cruises left-to-right slowly; you overtake it
  layer(g, cam, 0.9, (g) => {
    const jx = 300 + t * 60, jy = 860;
    for (let i = 0; i < 30; i++) { g.fillStyle = alpha('#ffffff', 0.5 * (1 - i / 30)); g.beginPath(); g.ellipse(jx - 200 - i * 40, jy + 4, 50, 4 + i, 0, 0, 7); g.fill(); }
    g.save(); g.translate(jx, jy); g.scale(1.5, 1.5); const b = '#e8ecf4', d = '#9aa4b8'; rr(g, -150, -14, 300, 28, 14); g.fillStyle = b; g.fill(); poly(g, [[150, -14], [190, 0], [150, 14]], b); poly(g, [[-20, 4], [-90, 70], [-60, 70], [30, 6]], d); poly(g, [[-20, -4], [-70, -40], [-50, -40], [20, -6]], shade(d, -0.15)); poly(g, [[-130, -10], [-160, -60], [-140, -60], [-110, -10]], d); for (let i = 0; i < 12; i++) circle(g, -100 + i * 18, -4, 2.6, '#3a4a6a'); g.restore();
    text(g, '~900 km/h', jx, jy + 120, { size: 40, color: '#ffd47e', font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#0b1324' });
  });
  windStreaks(g, t, 0.7, { y0: 300, y1: 1250, seed: 29 });
  layer(g, cam, 1, (g) => { const hx = lerp(-150, 900, ease.inOut(prog(t, 0, info.dur))); flyHero(g, t, hx, 700, 2.1, { rot: 1.3, expr: exprAt(t, [[0, 'scared'], [tJet, 'joy']]) }); });
  chip(g, t, { str: 'FASTER THAN A JET', at: tJet, x: E.W / 2 - 40, y: CHIP_Y, tone: 'gold' });
} });

// ---------------------------------------------------------------- s013 everything not bolted down
registerShot('s013', { draw(g, t, info) {
  const sc = W('stops') * 420, lift = ease.in(prog(t, 0.1, info.dur)), cam = camMove(t, info.dur, { z: [1.05, 0.98], drift: 1 });
  const [sx, sy] = [Math.sin(t * 53) * 7, Math.cos(t * 41) * 5];
  const c2 = { ...cam, x: cam.x + sx, y: cam.y + sy };
  const P = sunnyStreet(g, t, c2, { scroll: sc, wind: 1 });
  windStreaks(g, t, 1, { y0: 100, y1: 1250, seed: 31 });
  layer(g, c2, 1, (g) => {
    // a car, a bench, a bin and a postbox lift off and slide east
    const items = [[120, 'car'], [520, 'bench'], [740, 'bin'], [-200, 'car2']];
    items.forEach(([x0, kind], i) => {
      const u = clamp(lift * 1.4 - i * 0.12), x = x0 + u * u * 1600, y = P.GY + 60 - u * (200 + i * 90), r = u * (1.5 + i * 0.6);
      g.save(); g.translate(x, y); g.rotate(r);
      if (kind.startsWith('car')) { const col = kind === 'car' ? '#2f6fd0' : '#f08a24'; rr(g, -170, -60, 340, 60, 18); g.fillStyle = col; g.fill(); poly(g, [[-100, -60], [-60, -120], [70, -120], [120, -60]], col); g.fillStyle = '#cfe8ff'; poly(g, [[-80, -64], [-52, -110], [60, -110], [96, -64]], '#cfe8ff'); for (const wx of [-100, 100]) { circle(g, wx, 0, 30, '#1a1a24'); circle(g, wx, 0, 14, '#9a9aa8'); } }
      else if (kind === 'bench') { rr(g, -90, -30, 180, 14, 4); g.fillStyle = '#7a5a3a'; g.fill(); rr(g, -90, -64, 180, 12, 4); g.fill(); }
      else { rr(g, -30, -80, 60, 80, 8); g.fillStyle = '#3aa05a'; g.fill(); }
      g.restore();
    });
  });
  flyingJunk(g, t, 1, { y0: 200, y1: 1150, seed: 12, n: 34 });
  chip(g, t, { str: 'NOT BOLTED DOWN?', at: L(info, 'not'), x: E.W / 2 - 40, y: CHIP_Y, tone: 'coral' });
} });

// ---------------------------------------------------------------- s014 blueprint: only bedrock stays
registerShot('s014', { draw(g, t, info) {
  const tBed = L(info, 'bedrock'), tEast = L(info, 'east', W('bedrock')), ui = S().ui;
  BP.board(g, t, { title: 'FIG 1 - WHAT STAYS PUT' });
  const gy = 900, k = ease.out(prog(t, 0, 0.9));
  // ground layers: soil (moves), bedrock (hatched, stays)
  BP.draw(g, [[60, gy], [1020, gy]], k, { w: 5 });
  BP.draw(g, [[60, gy + 140], [1020, gy + 140]], k, { w: 4 });
  g.save(); g.beginPath(); g.rect(60, gy + 140, 960 * k, 300); g.clip(); g.strokeStyle = alpha(ui.blueprint, 0.5); g.lineWidth = 3; for (let x = 0; x < 1400; x += 34) { g.beginPath(); g.moveTo(x, gy + 140); g.lineTo(x - 300, gy + 440); g.stroke(); } g.restore();
  const bk = ease.outBack(prog(t, tBed, tBed + 0.4)); if (bk > 0.01) { glow(g, 540, gy + 290, 420, ui.gold, 0.18 * bk); g.save(); g.translate(540, gy + 290); g.scale(bk, bk); text(g, 'BEDROCK: STAYS', 0, 0, { size: 52, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3, stroke: 8, strokeColor: '#0b1324' }); g.restore(); }
  // things on top: house, tree, person, car, sea wave — they slide east once "east" lands
  const go = ease.in(prog(t, tEast - 0.2, info.dur + 0.2));
  const things = [[160, 'house'], [380, 'tree'], [560, 'you'], [740, 'car'], [920, 'wave']];
  for (const [x0, kind] of things) {
    const x = x0 + go * 700, a = clamp(1 - go * 1.4); if (a <= 0) continue; g.save(); g.globalAlpha = a; g.translate(x, gy);
    const c = ui.blueprint;
    if (kind === 'house') BP.draw(g, [[-60, 0], [-60, -110], [0, -170], [60, -110], [60, 0]], k, { w: 4, color: c });
    if (kind === 'tree') { BP.draw(g, [[0, 0], [0, -80]], k, { w: 4, color: c }); ring(g, 0, -120, 46 * k, 4, c); }
    if (kind === 'you') { ring(g, 0, -150, 22, 4, '#ffd47e'); BP.draw(g, [[0, -128], [0, -60], [-22, 0]], k, { w: 4, color: '#ffd47e' }); BP.draw(g, [[0, -60], [22, 0]], k, { w: 4, color: '#ffd47e' }); BP.draw(g, [[-30, -110], [30, -100]], k, { w: 4, color: '#ffd47e' }); }
    if (kind === 'car') { BP.draw(g, [[-70, -14], [-70, -50], [-30, -80], [40, -80], [70, -50], [70, -14]], k, { w: 4, color: c }); ring(g, -40, -10, 14, 4, c); ring(g, 40, -10, 14, 4, c); }
    if (kind === 'wave') BP.draw(g, [[-60, 0], [-40, -70], [0, -110], [40, -90], [20, -60]], k, { w: 4, color: c });
    g.restore();
  }
  // east arrows over the soil + air
  const ak = ease.out(prog(t, tEast - 0.1, tEast + 0.4));
  for (const y of [520, 640, gy + 70]) if (ak > 0) { BP.draw(g, [[140, y], [140 + 700 * ak, y]], 1, { w: 6, color: ui.gold }); poly(g, [[180 + 700 * ak, y], [140 + 700 * ak, y - 22], [140 + 700 * ak, y + 22]], ui.gold); }
  if (ak > 0) text(g, 'EAST  1,670 km/h', 540, 450, { size: 46, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 2, alpha: ak });
} });

// ---------------------------------------------------------------- s015 closer + end card
registerShot('s015', { draw(g, t, info) {
  const tF = L(info, 'follow'), tEnd = info.dur - 0.75, cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.6 });
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, -200, 0, E.H, SKYC); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.sun(g, 760, 300, 64, '#fffaf0', '#ffe2a8', 3.5); });
  layer(g, cam, 0.25, (g) => { g.save(); g.translate(-(t * 500) % E.W, 0); drawClouds(g, 0, { y: 300, h: 900, n: 7, seed: 41, a: 0.85 }); g.translate(E.W, 0); drawClouds(g, 0, { y: 300, h: 900, n: 7, seed: 41, a: 0.85 }); g.restore(); });
  windStreaks(g, t, 0.5, { y0: 200, y1: 1250, seed: 37 });
  // you, now gliding superhero-style, wave at the camera and shrink away east
  const s = lerp(2.4, 1.2, ease.inOut(prog(t, 0.3, tEnd))), x = lerp(380, 820, ease.inOut(prog(t, 0.2, tEnd))), y = lerp(760, 560, ease.inOut(prog(t, 0.2, tEnd)));
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x, y, s, facing: 1, pose: poseAt(t, [[0, 'fall'], [tF, 'wave']], 0.3), rot: lerp(1.1, 0.4, prog(t, 0, 0.6)), expr: exprAt(t, [[0, 'surprised'], [tF, 'joy']]), blink: blinkFlag(t, 3.2, 8), rim: HERO_RIM, t, shadow: false }));
  sunAtmos(g, t, cam);
  // end card (<= 0.75 s)
  if (t > tEnd) { const k = ease.out(prog(t, tEnd, tEnd + 0.2)); veil(g, '#0b1324', 0.82 * k); g.save(); g.translate(E.W / 2 - 40, 620); g.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
    globe(g, t, 0, -220, 110, t * 1.5, { glowK: 0.8 });
    text(g, 'FOLLOW FOR MORE', 0, 0, { size: 64, color: '#fff1dc', font: FONTS.ui, weight: 900, spacing: 3, alpha: k });
    text(g, 'WHAT IFs', 0, 100, { size: 110, color: '#ffd47e', font: FONTS.title, weight: 900, stroke: 12, strokeColor: '#3a2408', alpha: k, glow: 16, glowColor: 'rgba(255,212,126,.7)' });
    g.restore(); }
} });
