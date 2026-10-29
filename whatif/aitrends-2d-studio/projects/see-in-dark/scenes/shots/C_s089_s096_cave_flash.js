// C_s089_s096_cave_flash.js — batch C, shots s089-s096: rain makes everything the same grey (blueprint), Tomas shouts,
// the cave mouth, Mina blending into the rock in thermal, the squint, the torch swing, the white-out freeze, blind again.
import { E, V, S, mix, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake, circle, rr, text, FONTS, rng, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { thermalView, heatActor, heatBlob, heatRect, heatColor, whiteOut } from '../sets/thermal.js';
import { chip, darkness } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { HERO } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;
const scr = (cam, x, y) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z || 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z || 1) + E.H / 2];
const hc = (v, grey = 0) => mix(`rgb(${heatColor(v).map(Math.round).join(',')})`, '#6c6a74', grey);
function hangingRain(g, t, o = {}) { const r = rng(o.seed ?? 21), n = o.count ?? 220, a = o.a ?? 0.35;
  g.save(); g.strokeStyle = alpha(o.color || '#b8c8ff', a); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = r() * E.W * 1.2 - E.W * 0.1, y = r() * E.H, l = 18 + r() * 34, dz = r(); g.lineWidth = 1 + dz * 2; const dy = t * (2 + dz * 4); g.beginPath(); g.moveTo(x, y + dy); g.lineTo(x + l * 0.18, y + dy + l); g.stroke(); }
  g.restore(); }

// s089 — BLUEPRINT: "Rain has soaked everything cold. Warm and cool fade to the same grey."
registerShot('s089', { draw(g, t, info) {
  const st = info.shot.start, tFade = wt('fade', info, 2.4), tGrey = wt('grey', info, 3.4), cam = 1 + 0.035 * (t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam, cam); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'WHY THE RAIN HIDES HER', fig: 'FIG 9 - THERMAL CONTRAST' });
  const ui = S().ui, drain = ease.inOut(prog(t, 0.6, tGrey + 0.3));                     // contrast drains to flat grey
  // left: a little thermal picture (a person against rock) whose colours flatten
  const px = E.W * 0.08, py = E.H * 0.2, pw = E.W * 0.42, ph = E.H * 0.58, k = ease.out(prog(t, 0.05, 0.6));
  g.save(); g.globalAlpha *= k; rr(g, px, py, pw, ph, 10); g.clip();
  const rock = lerp(0.22, 0.4, drain), body = lerp(0.86, 0.44, drain), sky = lerp(0.08, 0.36, drain), gr = drain * 0.85;
  g.fillStyle = hc(sky, gr); g.fillRect(px, py, pw, ph); g.fillStyle = hc(rock, gr); g.beginPath(); g.moveTo(px, py + ph); g.lineTo(px, py + ph * 0.45); g.lineTo(px + pw * 0.4, py + ph * 0.3); g.lineTo(px + pw, py + ph * 0.5); g.lineTo(px + pw, py + ph); g.fill();
  const fx = px + pw * 0.52, fy = py + ph * 0.86; g.fillStyle = hc(body, gr); g.beginPath(); g.ellipse(fx, fy - 70, 70, 54, 0, 0, 7); g.fill(); g.beginPath(); g.arc(fx + 64, fy - 116, 30, 0, 7); g.fill();
  // rain streaks over the picture
  g.strokeStyle = alpha('#d8e4ff', 0.35); g.lineWidth = 2; const r = rng(3); for (let i = 0; i < 40; i++) { const x = px + r() * pw, y = py + ((r() * ph + t * 420) % ph); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + 26); g.stroke(); }
  g.restore(); g.strokeStyle = alpha(ui.blueprint, 0.8); g.lineWidth = 3; rr(g, px, py, pw, ph, 10); g.stroke();
  text(g, drain < 0.5 ? 'DRY: SHE GLOWS' : 'SOAKED: SAME GREY', px + pw / 2, py - 30, { size: 30, color: ui.gold, font: FONTS.ui, weight: 900 });
  // right: two thermometers converging
  const tx0 = E.W * 0.64, tx1 = E.W * 0.8, base = E.H * 0.8, top = E.H * 0.24, conv = ease.inOut(prog(t, 0.8, tGrey + 0.2));
  for (const [x, lab, v0, col] of [[tx0, 'BODY', 0.9, '#ff7a4a'], [tx1, 'ROCK', 0.2, '#7fb6ff']]) {
    const kk = ease.out(prog(t, 0.3, 1.0)); if (kk <= 0) continue; g.save(); g.globalAlpha *= kk;
    const v = lerp(v0, 0.5, conv), h = (base - top) * v;
    rr(g, x - 22, top, 44, base - top, 22); g.strokeStyle = alpha(ui.blueprint, 0.9); g.lineWidth = 3; g.stroke(); circle(g, x, base + 20, 34, alpha(col, 0.85));
    rr(g, x - 12, base - h, 24, h + 10, 12); g.fillStyle = alpha(col, 0.85); g.fill(); glow(g, x, base - h, 60, col, 0.3);
    for (let i = 1; i < 8; i++) { const y = lerp(base, top, i / 8); g.beginPath(); g.moveTo(x + 26, y); g.lineTo(x + 40, y); g.stroke(); }
    text(g, lab, x, base + 86, { size: 30, color: ui.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
  // the meeting line
  const ml = ease.out(prog(t, tGrey - 0.2, tGrey + 0.4)); if (ml > 0) BP.draw(g, [[tx0 - 60, lerp(base, top, 0.5)], [tx1 + 60, lerp(base, top, 0.5)]], ml, { w: 3, color: alpha(ui.gold, 0.9) });
  g.restore();
  chip(g, t, { str: 'Wet = same temperature', at: tFade, x: E.W * 0.72, y: E.H * 0.9, tone: 'gold' });
} });

// s090 — "So where is she? Ranger Tomas, in his blue cap, shouts that it is hopeless."  medium: Tomas shouts and waves, HERO looks around
registerShot('s090', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.38 + 0.06 * k, x: lerp(-120, -40, k), y: 110 }, st = info.shot.start;
  const tShout = wt('shouts', info, 2.6), tHope = wt('hopeless', info, 4.0);
  const F = forest(g, t, cam, { view: 'camp', rain: true });
  layer(g, cam, 1, (g) => {
    const tp = t < tShout ? breathe(POSES.relaxed, t, 1, 1) : posesAt(t - tShout, [[0, 'cheer'], [0.45, 'shrug'], [0.9, 'cheer'], [1.35, 'handsOnHead'], [1.9, 'shrug']], 0.22);
    actor(g, 'TOMAS', { x: F.CX - 220, y: F.GY, s: 1.55, facing: 1, pose: tp, expr: t < tShout ? 'worried' : 'angry', talk: talkAmount(info.globalT, st + tShout - 0.1, st + info.dur), rim: F.rim, t });
    // HERO silent beside him, looking around (head turns via facing flips + look)
    const lookAround = t < 1.6 ? -1 : t < 3.2 ? 1 : -1;
    actor(g, 'HERO', { x: F.CX + 200, y: F.GY, s: 1.55, facing: lookAround, pose: breathe(POSES.stand, t, 1, 3), expr: 'worried', look: [0.6, -0.1], rim: F.rim, t });
    // Tomas's lantern swinging on his belt
    const lx = F.CX - 160, ly = F.GY - 120 + Math.sin(t * 6) * 6; glow(g, lx, ly, 200, '#ffcf7a', 0.35); circle(g, lx, ly, 10, '#ffe7a8');
  });
  forestFg(g, t, cam);
  chip(g, t, { str: '"It\'s hopeless!"', at: tHope, x: E.W * 0.32, y: E.H * 0.2, tone: 'coral' });
} });

// s091 — "You find a cave mouth."  wide, everything grey, HERO approaches slowly
registerShot('s091', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.1 * k, x: lerp(-160, 60, k), y: -20 * k };
  const F = forest(g, t, cam, { view: 'cave', rain: true });
  layer(g, cam, 1, (g) => { const x = lerp(F.CX - 760, F.CX - 380, ease.sine(t / info.dur)); actor(g, 'HERO', { x, y: F.GY, s: 1.05, facing: 1, pose: walkPose(t * Math.PI * 2 * 0.55, { stride: 18 }), expr: 'determined', rim: F.rim, t }); });
  veil(g, '#7a8296', 0.12, 'saturation');
  forestFg(g, t, cam);
  FX.fog(g, F.GY - 220, 300, '#8a94b0', 0.18);
} });

// s092 — THERMAL insert: "Mina's coat is zipped, her skin cool, her body blending into the rock."  a curled shape barely warmer than stone
registerShot('s092', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.9 + 0.12 * k, x: lerp(-360, -280, k), y: 90 }, GY = forestGround();
  const tBlend = wt('blending', info, 2.8), mx = E.W / 2 - 300, my = GY - 10;
  const search = [mx + 120 + Math.sin(t * 1.7) * 150, my - 40 + Math.cos(t * 1.3) * 60], lock = ease.inOut(prog(t, tBlend, tBlend + 0.8)), tr = [lerp(search[0], mx + 40, lock), lerp(search[1], my - 10, lock)];
  thermalView(g, t, {
    coldGain: 0.85, coldMax: 0.36, halo: 10, haloGain: 0.2,
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatActor(c, 'MINA', { x: mx, y: my + 10, s: 1.1, facing: -1, pose: POSES.crouch, t, heat: 0.36 + 0.015 * Math.sin(t * 2.1), halo: false });
      heatBlob(c, mx + 30, my - 50, 90, 60, 0.12, 0.9);
      heatBlob(c, mx - 6, my - 74, 26, 10, 0.2, 0.9);                                          // the scarf: the faintest smear
    }),
    hud: { label: 'THERMAL', temp: lock > 0.5 ? '22 C  ?' : '--', track: scr(cam, tr[0], tr[1]) },
  });
  FX.rain(g, t, { count: 120, angle: 0.18, color: '#2a1050', a: 0.4, seed: 17 });
  chip(g, t, { str: 'Blending into the rock', at: tBlend, x: E.W * 0.5, y: E.H * 0.86, tone: 'blue' });
} });

// s093 — "Almost enough. Not quite."  giant face squinting hard
registerShot('s093', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sc = 1.06 + 0.1 * k, tNot = wt('not', info, 1.0);
  forest(g, t, { z: 1.4, x: 300 }, { view: 'cave', rain: false }); veil(g, '#04060f', 0.65);
  const shakeNo = t > tNot ? Math.sin((t - tNot) * 14) * 0.05 * (1 - prog(t, tNot, tNot + 0.8)) : 0;
  g.save(); g.translate(E.W / 2, E.H * 0.56); g.scale(sc, sc); g.translate(-E.W / 2, -E.H * 0.56);
  bigFace(g, E.W / 2, E.H * 0.56, 300, { outfit: HERO, expr: 'determined', face: { eyes: t < tNot ? 'happy' : 'closed' }, rimColor: '#b8c8ff', rimSide: 1, tilt: shakeNo });
  g.restore();
  FX.rain(g, t * 1.2, { count: 110, len: 80, a: 0.25, angle: 0.18, seed: 43 });
  darkness(g, 0.6, { x: E.W / 2, y: E.H / 2, r: E.W * 0.6 });
} });

// s094 — "Tomas swings his torch at the cave."  over the shoulder: the beam sweeps across HERO's shoulder
registerShot('s094', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.2 + 0.08 * k, x: lerp(80, 180, k), y: -30 };
  const tSwing = wt('swings', info, 0.9), sw = ease.inOut(prog(t, tSwing, tSwing + 1.4)), on = ease.out(prog(t, tSwing - 0.3, tSwing));
  const F = forest(g, t, cam, { view: 'cave', rain: true, torch: on, torchX: E.W / 2 - 360, torchAngle: lerp(-1.1, 0.12, sw) });
  layer(g, cam, 1, (g) => {
    actor(g, 'TOMAS', { x: F.CX - 380, y: F.GY, s: 1.2, facing: 1, pose: posesAt(t, [[0, 'relaxed'], [tSwing - 0.2, 'point']], 0.3), expr: 'determined', rim: { color: '#fff2d0', dir: [1, -0.3] }, t });
  });
  forestFg(g, t, cam);
  // HERO's shoulder in the blurred foreground; the beam hits it at the end of the swing
  blurLayer(g, 10, (g) => { actor(g, 'HERO', { x: E.W * 0.86, y: E.H * 1.28, s: 3.2, facing: 1, pose: POSES.stand, expr: 'worried', rim: { color: '#fff2d0', dir: [-1, -0.2], w: 12 * sw }, t }); });
  const blast = ease.in(prog(t, info.dur - 0.9, info.dur)); whiteOut(g, blast * 0.8, { x: E.W * 0.75, y: E.H * 0.45 });
} });

// s095 — FREEZE: "Light slams into your eyes. Everything goes white."  HERO's silhouette recoils, everything blown out
registerShot('s095', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.25 + 0.05 * k, x: 40, y: -20 }, tWhite = wt('white', info, 2.2);
  const F = forest(g, 0.2, cam, { view: 'cave', rain: false, torch: 1, torchX: E.W / 2 - 360, torchAngle: 0.12 });
  layer(g, cam, 1, (g) => { actor(g, 'HERO', { x: F.CX + 120, y: F.GY, s: 1.5, facing: -1, pose: POSES.fall, expr: 'shocked', rim: { color: '#ffffff', dir: [-1, 0], w: 10 }, t: 0.2 }); });
  hangingRain(g, t * 0.3, { count: 240, a: 0.5, color: '#ffffff' });
  const wk = 0.55 + 0.45 * ease.inOut(prog(t, tWhite - 0.4, tWhite + 0.4));
  whiteOut(g, wk, { x: E.W * 0.3, y: E.H * 0.45 }); FX.lensStreak(g, E.W * 0.3, E.H * 0.45, E.W * 1.8, '#ffffff', 0.6, 6);
  FX.speedLines(g, t, { cx: E.W * 0.3, cy: E.H * 0.45, count: 50, a: 0.3 * (1 - wk * 0.6) });
  chip(g, t, { str: 'Everything goes white', at: tWhite, x: E.W * 0.6, y: E.H * 0.84, tone: 'coral' });
} });

// s096 — "You are blind... again. Time is short."  giant face, eyes squeezed shut, rim white, dark and still
registerShot('s096', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sc = 1.02 + 0.06 * k, tShort = wt('short', info, 2.6);
  g.fillStyle = '#020308'; g.fillRect(0, 0, E.W, E.H);
  const after = 1 - ease.out(prog(t, 0, 1.6)); if (after > 0) glow(g, E.W * 0.3, E.H * 0.45, 900, '#ffffff', 0.35 * after);   // the afterimage fades
  g.save(); g.translate(E.W / 2, E.H * 0.56); g.scale(sc, sc); g.translate(-E.W / 2, -E.H * 0.56);
  bigFace(g, E.W / 2, E.H * 0.56 + Math.sin(t * 1.4) * 3, 300, { outfit: HERO, expr: 'sad', face: { eyes: 'closed' }, rimColor: '#ffffff', rimSide: -1 });
  g.restore();
  FX.drops(g, t * 0.5, { count: 14, a: 0.4, seed: 8 });
  // a slow ticking ring: time is short
  const tk = ease.out(prog(t, tShort - 0.2, tShort + 0.3)); if (tk > 0) { g.save(); g.globalAlpha *= tk; g.strokeStyle = alpha(S().ui.gold, 0.7); g.lineWidth = 5; g.beginPath(); g.arc(E.W * 0.84, E.H * 0.24, 60, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - prog(t, tShort, info.dur + 2))); g.stroke(); g.restore(); }
  darkness(g, 0.7, { x: E.W / 2, y: E.H / 2, r: E.W * 0.55 });
} });
