// C_s092_s101_blind_spark.js — batch C (v2): the torch whites out the thermal view, blind again, the choice (run or wait),
// Mina shivering under the ledge, "Lights out", the torch clicks off, sixty seconds in the dark, the grey comes back,
// one tiny white spark (PAYOFF), the small hand pulling the twin out of a coat, and HERO's face lit by his own twin.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shake, circle, rr, seg, text, FONTS, rng, mix } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { thermalView, heat, heatActor, heatBlob, heatRect, whiteOut } from '../sets/thermal.js';
import { chip, darkness } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { MINA } from '../cast.js';
import { shotWord, handWorld, scr, warmer, hangingRain, breath } from './C_lib.js';

const MOONRIM = { color: '#b8c8ff', dir: [-0.4, -1], w: 6 };
const torchBeam = (g, hx, hy, ang, a = 1, len = 1300) => { if (a <= 0.01) return; FX.lightCone(g, hx, hy, { angle: ang, spread: 0.38, len, color: '#f4f8ff', a: 0.4 * a }); glow(g, hx, hy, 90, '#ffffff', 0.6 * a); };
const MINA_NOSCARF = { ...MINA, scarf: null };

// s092 — THERMAL climax: "The light slams into your eyes, everything goes white, and you're blind again."  full length
registerShot('s092', { draw(g, t, info) {
  const st = info.shot.start, tSlam = shotWord('slams', st, 0.6), tWhite = shotWord('white', st, 1.9), tBlind = shotWord('blind', st, 3.2);
  const cam = camMove(t, info.dur, { z: [1.12, 1.2], x: [140, 220] }), sk = shake(t * 3, 16 * ease.out(prog(t, tSlam, tSlam + 0.1)) * (1 - prog(t, tSlam + 0.1, tSlam + 0.8))); cam.x += sk[0]; cam.y = (cam.y || 0) + sk[1];
  const GY = forestGround(), CX = E.W / 2, beam = ease.in(prog(t, 0, tSlam)), wo = t < tSlam ? 0.15 * beam : t < tBlind ? 1 : 1 - 0.75 * ease.inOut(prog(t, tBlind, tBlind + 0.9));
  if (t < tBlind + 0.6) {
    thermalView(g, t, {
      cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
      hot: (c) => layer(c, cam, 1, (c) => {
        const bx = lerp(CX - 700, CX + 60, beam); heatBlob(c, bx, GY - 260, lerp(90, 600, beam), lerp(60, 400, beam), 0.9 * beam + 0.1, 0.6);   // the torch beam floods the sensor
        heatActor(c, 'TOMAS', { x: CX - 760, y: GY, s: 1.6, facing: 1, pose: POSES.point, t, heat: 0.84 });
      }),
      hud: t < tSlam + 0.2 ? { label: 'THERMAL', temp: 'BRIGHT LIGHT!' } : null,
    });
    whiteOut(g, wo, { x: E.W * 0.55, y: E.H * 0.45 });
    if (t > tSlam && t < tBlind) { g.save(); g.fillStyle = alpha('#fffdf6', 0.85); g.fillRect(0, 0, E.W, E.H); g.restore(); FX.lensStreak(g, E.W * 0.55, E.H * 0.45, E.W * 1.8, '#ffffff', 0.5, 6); text(g, 'SENSOR OVERLOAD', E.W * 0.5, E.H * 0.16, { size: 40, color: alpha('#ff6a5a', 0.5 + 0.5 * (Math.floor(t * 4) % 2)), font: FONTS.ui, weight: 900, spacing: 6 }); }
  }
  // blind again: the white sinks to a dim grey with HERO's silhouette
  if (t > tBlind) { const k = ease.inOut(prog(t, tBlind, tBlind + 0.9));
    g.save(); g.globalAlpha *= k; g.fillStyle = '#2a2a34'; g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.55, E.H * 0.45, 700, '#ffffff', 0.25 * (1 - k * 0.6));
    layer(g, { z: 1.25, x: 0, y: 40 }, 1, (g) => actor(g, 'HERO', { x: CX + 60, y: GY, s: 1.9, facing: -1, pose: idle(reaction('wince', t, tBlind), t, 3), expr: 'sad', blink: true, rim: { color: '#e8e8f0', dir: [1, -0.4], w: 7 }, t }));
    hangingRain(g, t, { count: 140, a: 0.25, color: '#c8c8d8' }); g.restore(); }
  chip(g, t, { str: 'Everything goes white', at: tWhite, x: E.W * 0.5, y: E.H * 0.86, tone: 'coral', dur: tBlind - 0.05 });
  chip(g, t, { str: 'Blind again', at: tBlind + 0.3, x: E.W * 0.5, y: E.H * 0.86, tone: 'coral' });
} });

// s093 — GIANT FACE: "And now, a choice. Run in blind, or wait in the dark?"  eyes shut, squint -> determined on 'wait'; chips either side
registerShot('s093', { draw(g, t, info) {
  const st = info.shot.start, tChoice = shotWord('choice', st, 0.9), tRun = shotWord('run', st, 1.6), tWait = shotWord('wait', st, 2.9);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08] });
  forest(g, t, { z: 1.3, x: 300 }, { view: 'cave', rain: false }); veil(g, '#04060f', 0.62);
  const f = faceAt(t, [[0, { eye: 0.08, brow: -0.1, tilt: 0.3, smile: -0.1, w: 0.7 }], [tChoice, { eye: 0.1, brow: 0.3, tilt: -0.4, smile: -0.3, w: 0.7 }], [tRun, { eye: 0.12, brow: -0.2, tilt: 0.5, smile: -0.2, w: 0.75, look: [-0.5, 0] }], [tWait, 'determined']], 0.2);
  layer(g, cam, 1, (g) => { giantFace(g, E.W / 2 + Math.sin(t * 0.7) * 4, E.H * 0.56, 320, { who: 'HERO', f: t < tWait ? f : { ...f, eye: Math.min(f.eye, 0.5) }, rimSide: -1, rimColor: '#b8c8ff', breath: Math.sin(t * 2), blink: 0 }); });
  FX.drops(g, t, { count: 30, a: 0.5, seed: 4 }); FX.rain(g, t * 1.2, { count: 130, len: 80, a: 0.25, angle: 0.18, seed: 41 });
  darkness(g, 0.5, { x: E.W / 2, y: E.H / 2, r: E.W * 0.6 });
  chip(g, t, { str: 'RUN IN BLIND', at: tRun, x: E.W * 0.18, y: E.H * 0.5, tone: 'coral' });
  chip(g, t, { str: 'WAIT IN THE DARK', at: tWait, x: E.W * 0.81, y: E.H * 0.5, tone: 'gold' });
} });

// s094 — "Mina is cold, and every minute matters."  under the ledge, dark, moon rim only: MINA curled in her coat, shivering, breath puffs
registerShot('s094', { draw(g, t, info) {
  const st = info.shot.start, tCold = shotWord('cold', st, 0.5), tMin = shotWord('minute', st, 1.6);
  const cam = camMove(t, info.dur, { z: [1.62, 1.72], x: [140, 190], y: [110, 120] });
  const F = forest(g, t, cam, { view: 'cave', rain: true }), GY = F.GY, mx = F.pos.ledgeX + 40;
  veil(g, '#02030a', 0.35);
  layer(g, cam, 1, (g) => {
    const jit = Math.sin(t * 38) * 2.2 * (0.6 + 0.4 * Math.sin(t * 1.7));
    actor(g, MINA_NOSCARF, { x: mx + jit, y: GY, s: 2.1, facing: -1, kid: true, pose: idle(POSES.crouch, t, 4), expr: exprAt(t, [[0, 'sad'], [tCold, 'cry'], [tMin, 'sad']]), blink: blinkFlag(t, 2.6, 9), look: lookToward(-0.6, 0.4), rim: MOONRIM, t });
    breath(g, t, mx - 40, GY - 270, { dir: -1 });
  });
  FX.rain(g, t * 1.1, { count: 110, len: 100, w: 2.4, a: 0.3, seed: 52, angle: 0.18 });                                // rain curtain in front of the ledge
  forestFg(g, t, cam);
  const ui = S().ui, tk = ease.out(prog(t, tMin - 0.1, tMin + 0.3)); if (tk > 0) { g.save(); g.globalAlpha *= tk; g.strokeStyle = alpha(ui.gold, 0.8); g.lineWidth = 5; g.beginPath(); g.arc(E.W * 0.85, E.H * 0.22, 54, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - prog(t, tMin, info.dur + 3))); g.stroke(); g.restore(); }
  chip(g, t, { str: 'Every minute matters', at: tMin, x: E.W * 0.36, y: E.H * 0.86, tone: 'coral' });
} });

// s095 — '"Lights out," you croak. "Everybody."'  HERO raises a flat hand (no lip-sync); TOMAS and DEV turn to him; torch still on
registerShot('s095', { draw(g, t, info) {
  const st = info.shot.start, tLights = shotWord('lights', st, 0.1), tCroak = shotWord('croak', st, 0.8), tEvery = shotWord('everybody', st, 1.5);
  const cam = camMove(t, info.dur, { z: [1.12, 1.17], x: [-200, -150], y: [70, 76] });
  const F = forest(g, t, cam, { view: 'cave', rain: true }), GY = F.GY, CX = F.CX;
  const STOP = { ...POSES.reach, eF: [30, -170], hF: [56, -178] };
  layer(g, cam, 1, (g) => {
    const to = { x: CX - 760, y: GY + 20, s: 1.8, facing: 1 }, tp = idle(poseAt(t, [[0, 'point'], [tEvery, 'holdFront']], 0.3), t, 1);
    actor(g, 'TOMAS', { ...to, pose: tp, expr: exprAt(t, [[0, 'determined'], [tEvery + 0.2, 'surprised']]), blink: blinkFlag(t, 2.8, 5), look: t > tCroak - 0.2 ? lookToward(1, 0) : lookToward(1, -0.2), rim: { color: '#fff2d0', dir: [1, -0.4] }, prop: { type: 'flashlight' }, t });
    const [hx, hy] = handWorld(to, tp); torchBeam(g, hx + 14, hy - 4, 0.05, 0.85, 1200);
    actor(g, 'DEV', { x: CX - 430, y: GY + 14, s: 1.75, facing: 1, pose: idle(POSES.relaxed, t, 2), expr: exprAt(t, [[0, 'worried'], [tCroak, 'surprised']]), blink: blinkFlag(t, 3.2, 2), look: t > tCroak - 0.2 ? lookToward(1, 0) : lookToward(-1, 0), rim: F.rim, t });
    actor(g, 'HERO', { x: CX - 80, y: GY + 28, s: 1.95, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [tLights, STOP]], 0.25), t, 3), expr: exprAt(t, [[0, 'sad'], [tCroak, 'determined']]), blink: true, rim: { color: '#fff2d0', dir: [-1, -0.3] }, t });
  });
  forestFg(g, t, cam); atmos(g, t, cam, { color: '#dfe8ff' });
  chip(g, t, { str: '"Lights out. Everybody."', at: tCroak, x: E.W * 0.62, y: E.H * 0.18, tone: 'gold' });
} });

// s096 — INSERT: "Tomas clicks off his torch. So you wait."  thumb on the switch, the beam dies, three moon-rimmed silhouettes in the rain
registerShot('s096', { draw(g, t, info) {
  const st = info.shot.start, tClick = shotWord('clicks', st, 0.4), tWait = shotWord('wait', st, 1.8), off = ease.out(prog(t, tClick + 0.08, tClick + 0.22));
  const cam = camMove(t, info.dur, { z: [1.0, 1.04] });
  // behind: the three of them in the rain, blurred, dropping to moon-rimmed silhouettes when the beam dies
  blurLayer(g, 10, (g) => { const F = forest(g, t, { z: 1.1, x: -260, y: 60 }, { view: 'cave', rain: true, torch: 1 - off, torchX: E.W / 2 - 520, torchAngle: 0.05 });
    layer(g, { z: 1.1, x: -260, y: 60 }, 1, (g) => { for (const [who, x, f] of [['TOMAS', -640, 1], ['DEV', -400, 1], ['HERO', -120, -1]]) actor(g, who, { x: F.CX + x, y: F.GY, s: 1.6, facing: f, pose: idle(POSES.stand, t, x), expr: 'worried', rim: MOONRIM, t }); }); });
  veil(g, '#02030c', 0.5 * off);
  // the torch in TOMAS's hand, close: olive sleeve, a big black torch, his thumb on the switch
  layer(g, cam, 1, (g) => {
    const cx = E.W * 0.42, cy = E.H * 0.62, press = ease.out(prog(t, tClick - 0.15, tClick)) * (1 - ease.out(prog(t, tClick + 0.1, tClick + 0.35))), ink = S().ink;
    // olive tracksuit sleeve with a cuff
    g.fillStyle = '#3c4832'; rr(g, cx - 760, cy - 70, 520, 190, 70); g.fill(); g.fillStyle = '#2e3826'; rr(g, cx - 300, cy - 80, 70, 210, 24); g.fill();
    // the torch: a ribbed black barrel, a wider head with a chrome ring and the lens
    const bg = g.createLinearGradient(0, cy - 60, 0, cy + 60); bg.addColorStop(0, '#3a3c48'); bg.addColorStop(0.45, '#1c1e26'); bg.addColorStop(1, '#0c0d12'); g.fillStyle = bg; rr(g, cx - 240, cy - 54, 470, 108, 30); g.fill();
    g.strokeStyle = alpha('#ffffff', 0.08); g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(cx - 180 + i * 24, cy - 50); g.lineTo(cx - 180 + i * 24, cy + 50); g.stroke(); }
    g.fillStyle = bg; rr(g, cx + 220, cy - 84, 120, 168, 26); g.fill(); g.strokeStyle = '#9aa0b0'; g.lineWidth = 6; rr(g, cx + 324, cy - 82, 22, 164, 10); g.stroke();
    g.fillStyle = mix('#fffbe8', '#20222c', off); g.beginPath(); g.ellipse(cx + 338, cy, 16, 74, 0, 0, 7); g.fill();
    // the switch and TOMAS's hand wrapped round the barrel: four fingers below, the thumb pressing on top
    rr(g, cx - 10, cy - 70 + press * 8, 64, 22, 8); g.fillStyle = '#e04a3a'; g.fill();
    for (let i = 0; i < 4; i++) { g.fillStyle = ink; rr(g, cx - 150 + i * 48, cy - 10, 46, 86, 22); g.fill(); g.strokeStyle = alpha('#b8c8ff', 0.5); g.lineWidth = 3; g.beginPath(); g.arc(cx - 127 + i * 48, cy + 62, 20, 0.2, 2.9); g.stroke(); }
    g.fillStyle = ink; g.beginPath(); g.ellipse(cx - 160, cy - 6, 120, 92, 0, 0, 7); g.fill();
    g.save(); g.translate(cx - 70, cy - 74 + press * 14); g.rotate(-0.12); rr(g, -96, -28, 150, 56, 28); g.fillStyle = ink; g.fill(); g.strokeStyle = alpha('#b8c8ff', 0.7); g.lineWidth = 4; g.beginPath(); g.arc(40, -2, 26, -1.6, 0.4); g.stroke(); g.restore();
    if (off < 1) { FX.lightCone(g, cx + 340, cy, { angle: 0.0, spread: 0.3, len: 1300, color: '#f4f8ff', a: 0.5 * (1 - off) }); glow(g, cx + 340, cy, 200, '#ffffff', 0.7 * (1 - off)); }
    if (Math.abs(t - tClick) < 0.12) FX.sparkle(g, cx + 0, cy - 70, 26, '#ffffff', 0.7);
  });
  FX.rain(g, t, { count: 120, angle: 0.18, a: 0.25, seed: 61 });
  chip(g, t, { str: 'So you wait', at: tWait, x: E.W * 0.66, y: E.H * 0.86, tone: 'gold' });
} });

// s097 — "Sixty seconds, in the dark, listening to the rain."  three rim-lit silhouettes standing still; gold 60 countdown ticks in the corner
registerShot('s097', { draw(g, t, info) {
  const st = info.shot.start, tSixty = shotWord('sixty', st, 0.1), tRain = shotWord('rain', st, 2.9);
  const cam = camMove(t, info.dur, { z: [1.16, 1.22], x: [-260, -230], y: [60, 66], drift: 0.5 });
  const F = forest(g, t, cam, { view: 'cave', rain: true }), GY = F.GY, CX = F.CX;
  veil(g, '#02030c', 0.4);
  layer(g, cam, 1, (g) => { for (const [who, x, f, sd] of [['TOMAS', -700, 1, 1], ['DEV', -440, 1, 2], ['HERO', -150, 1, 3]])
    actor(g, who, { x: CX + x, y: GY + 18, s: who === 'HERO' ? 1.95 : 1.8, facing: f, pose: idle(poseAt(t, [[0, 'stand'], [tRain, who === 'HERO' ? 'lookUp' : 'crossArms']], 0.5), t, sd), expr: exprAt(t, [[0, 'worried'], [tRain, who === 'HERO' ? 'determined' : 'worried']]), blink: who === 'HERO' ? true : blinkFlag(t, 3 + sd * 0.3, sd), look: lookToward(1, -0.1), rim: MOONRIM, t }); });
  forestFg(g, t, cam); FX.rain(g, t, { count: 160, angle: 0.18, color: '#cfe0ff', a: 0.32, seed: 71 });
  const ui = S().ui, n = Math.max(0, 60 - Math.floor(Math.max(0, t - tSixty))), a = ease.out(prog(t, tSixty, tSixty + 0.3)), cx = E.W * 0.84, cy = E.H * 0.24;
  if (a > 0) { g.save(); g.globalAlpha *= a; ring_(g, cx, cy, 70, alpha(ui.gold, 0.2)); g.strokeStyle = ui.gold; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (n / 60) - ((t - tSixty) % 1) * Math.PI * 2 / 60); g.stroke();
    text(g, String(n), cx, cy + 4, { size: 74, color: ui.gold, glow: 20, glowColor: alpha(ui.gold, 0.6) }); g.restore(); }
} });
const ring_ = (g, x, y, r, col) => { g.strokeStyle = col; g.lineWidth = 8; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); };

// s098 — THERMAL returns: "And slowly, the grey comes back. Rock. Rain."  fade from black, HUD reboots, labels on the words
registerShot('s098', { draw(g, t, info) {
  const st = info.shot.start, tBack = shotWord('back', st, 1.3), tRock = shotWord('rock', st, 2.4), tRain = shotWord('rain', st, 3.3);
  const cam = camMove(t, info.dur, { z: [1.06, 1.12], x: [-60, 40], drift: 0.6 }), GY = forestGround(), CX = E.W / 2, back = 0.18 + 0.82 * ease.inOut(prog(t, 0.1, tBack + 0.8));
  thermalView(g, t, {
    coldGain: lerp(0.3, 0.9, back), coldMax: lerp(0.16, 0.38, back), noise: lerp(0.12, 0.03, back),
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }), hot: (c) => {},
    hud: { label: back < 0.95 ? 'THERMAL  REBOOT' : 'THERMAL', temp: back < 0.95 ? `${Math.round(back * 100)}%` : '11 C' },
  });
  veil(g, '#000', 1 - back);
  FX.rain(g, t, { count: 170, angle: 0.18, color: '#6a5a98', a: 0.45 * back, seed: 72 });
  const ui = S().ui; for (const [tw, str, x, y] of [[tRock, 'ROCK', 0.34, 0.42], [tRain, 'RAIN', 0.66, 0.3]]) { const a = ease.out(prog(t, tw, tw + 0.3)); if (a <= 0) continue; const [px, py] = [E.W * x, E.H * y];
    g.save(); g.globalAlpha *= a; g.strokeStyle = alpha('#fff', 0.85); g.lineWidth = 3; g.beginPath(); g.arc(px, py, 26, 0, 7); g.moveTo(px - 40, py); g.lineTo(px - 14, py); g.moveTo(px + 14, py); g.lineTo(px + 40, py); g.stroke(); text(g, str, px + 56, py, { size: 40, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 4 }); g.restore(); }
} });

// s099 — THERMAL: "And then, low down, one tiny white spark."  slow push down to the low ledge; the spark appears on 'spark'; crosshair snaps to it
registerShot('s099', { draw(g, t, info) {
  const st = info.shot.start, tLow = shotWord('low', st, 0.9), tSpark = shotWord('spark', st, 2.4), GY = forestGround(), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.1, 1.38], x: [0, 140], y: [-40, 90], drift: 0.5 }), sx = CX + 170, sy = GY - 70, on = ease.out(prog(t, tSpark - 0.25, tSpark + 0.15));
  const shim = 0.9 + 0.1 * Math.sin(t * 17);
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => { heatRect(c, sx - 7, sy - 5, 14, 10, on * shim, 3); heatBlob(c, sx, sy, 34, 26, 0.7 * on, 0.5); }),
    hud: { label: 'THERMAL', temp: on > 0.5 ? '54 C  !' : '--', track: on > 0.3 ? scr(cam, sx, sy) : scr(cam, lerp(CX - 300, sx, prog(t, tLow, tSpark)), lerp(GY - 360, sy, prog(t, tLow, tSpark))) },
  });
  const [px, py] = scr(cam, sx, sy); glow(g, px, py, 120 * on, '#ffffff', 0.5 * on); FX.sparkle(g, px, py, 40 * on * shim, '#ffffff', 0.9 * on);
  FX.rain(g, t, { count: 150, angle: 0.18, color: '#3a2a70', a: 0.45, seed: 73 });
  chip(g, t, { str: 'One tiny white spark', at: tSpark + 0.1, x: E.W * 0.5, y: E.H * 0.86, tone: 'gold' });
} });

// s100 — THERMAL macro: "A small hand pulling something out of a coat."  cool small hand pulls the white-hot warmer out of a pocket
registerShot('s100', { draw(g, t, info) {
  const st = info.shot.start, tPull = shotWord('pulling', st, 0.8), tCoat = shotWord('coat', st, 2.2), pull = ease.inOut(prog(t, tPull - 0.2, tCoat + 0.3));
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], drift: 0.6 }), cx = E.W * 0.5, cy = E.H * 0.56;
  thermalView(g, t, {
    cold: (c) => forest(c, t, { z: 2.6, x: 260, y: 180 }, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      c.fillStyle = heat(0.3); c.beginPath(); c.ellipse(cx - 160, cy + 180, 560, 300, -0.1, 0, 7); c.fill();                            // the coat
      c.fillStyle = heat(0.22); rr(c, cx - 120, cy + 40, 300, 46, 18); c.fill();                                                          // the pocket's mouth
      const hx = cx + lerp(0, 120, pull), hy = cy + lerp(70, -90, pull);
      c.fillStyle = heat(0.46 + 0.2 * pull); c.beginPath(); c.ellipse(hx - 30, hy + 20, 70, 50, -0.3, 0, 7); c.fill();                  // the small hand, warming as the spark lights it
      for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(hx + 26 + i * 6, hy - 30 + i * 22, 30, 15, -0.2, 0, 7); c.fill(); }
      heatRect(c, hx + 10, hy - 28, 70, 46, 1.0, 10); heatBlob(c, hx + 45, hy - 5, 150, 120, 0.55 + 0.25 * pull, 0.55);              // the white-hot twin
    }),
    hud: { label: 'THERMAL', temp: `${Math.round(lerp(48, 54, pull))} C`, track: scr(cam, cx + lerp(55, 165, pull), cy + lerp(45, -115, pull)) },
  });
  FX.rain(g, t, { count: 120, angle: 0.18, color: '#3a2a70', a: 0.35, seed: 74 });
  chip(g, t, { str: 'A small hand', at: shotWord('small', st, 0.3), x: E.W * 0.3, y: E.H * 0.86, tone: 'gold' });
} });

// s101 — GIANT FACE: "Mina's hand warmer. The twin."  HERO awe -> delighted, lit white-orange from below by his own twin; sparkles on 'twin'
registerShot('s101', { draw(g, t, info) {
  const st = info.shot.start, tWarm = shotWord('warmer', st, 0.7), tTwin = shotWord('twin', st, 1.5);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07] }); const pk = ease.out(prog(t, tTwin, tTwin + 0.1)) * (1 - ease.out(prog(t, tTwin + 0.1, tTwin + 0.5))); cam.z += 0.04 * pk;
  g.fillStyle = '#04050e'; g.fillRect(0, 0, E.W, E.H); blurLayer(g, 18, (g) => forest(g, t, { z: 1.4, x: 200 }, { view: 'cave', rain: true }), null, 1); veil(g, '#02030a', 0.5);
  const f = faceAt(t, [[0, 'awe'], [tWarm, 'awe'], [tTwin, 'delighted'], [tTwin + 0.6, 'joy']], 0.16);
  const cx = E.W * 0.46, cy = E.H * 0.53, wx = E.W * 0.76, wy = E.H * 0.86;
  layer(g, cam, 1, (g) => {
    glow(g, wx, wy, 760, '#ffb24a', 0.32); glow(g, cx, cy + 260, 520, '#ffd9a0', 0.25);                                                // lit from below
    giantFace(g, cx, cy, 330, { who: 'HERO', f: { ...f, glint: Math.max(f.glint, 0.9) }, rimSide: 1, rimColor: '#ffcf8a', glint: '#ffe0b0', blink: blinkAmt(t, 3.1, 0.4), breath: Math.sin(t * 2.2), tilt: lerp(-0.02, 0.03, ease.inOut(t / info.dur)) });
    warmer(g, wx, wy - 40 + Math.sin(t * 1.4) * 6, 2.6, t);
    if (t > tTwin) for (let i = 0; i < 5; i++) { const ph = (t * 1.1 + i * 0.21) % 1; FX.sparkle(g, wx + Math.cos(i * 1.3) * 160, wy - 150 - i * 40, 22 * Math.sin(ph * Math.PI), '#ffe0b0', 0.9); }
  });
  FX.drops(g, t * 0.7, { count: 18, a: 0.4, seed: 9 });
  chip(g, t, { str: 'The twin', at: tTwin, x: E.W * 0.2, y: E.H * 0.86, tone: 'gold' });
} });
