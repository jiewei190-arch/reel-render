// A_s028_s039_rule2.js — batch A, Rule 2 "dark isn't empty": infrared, the thermal flat, Dr Lin's lab, long-wave IR, warm eyes, the pit viper (s028-s039).
import { E, V, S, css, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake, talkAmount, text, FONTS, rr, seg, circle, poly, ring, linGrad, radGrad, shade, mix, backdrop, rng } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, blendPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat, snake } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { lab, labFg, labGround } from '../sets/lab.js';
import { forest, forestFg } from '../sets/forest.js';
import { thermalView, heatActor, heatBlob, heatRect, heatCat, heatColor } from '../sets/thermal.js';
import { chip, ruleCard, darkness } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { HERO, LIN } from '../cast.js';

const W = (word, st, fb) => (wordTime(word, st) ?? st + fb) - st;     // shot-local time of a spoken word (fallback: fb s into the shot)
// exact word match (wordTime() matches prefixes, so 'you' would also hit 'your')
const exact = (word, after, fb) => { const w = E.words.find(w => w.start >= after - 0.05 && w.word.toLowerCase().replace(/[^\w']/g, '') === word); return (w ? w.start : after + fb) - after; };
const hc = (v) => css(heatColor(v));
const toScreen = (x, y, cam) => [(x - E.W / 2 - (cam.x || 0)) * cam.z + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * cam.z + E.H / 2];   // depth-1 world -> screen

// s028 — RULE 2 title card over the blacked-out flat, a faint thermal glow breathing behind the letters
registerShot('s028', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * (t / info.dur), x: -40 + 30 * (t / info.dur) };
  ruleCard(g, t, info, { n: 2, title: "DARK ISN'T EMPTY", accent: '#ff9a4a', bg: (g, t) => {
    apartment(g, t, cam, { power: 0, moon: 0.5 });
    const br = 0.5 + 0.5 * Math.sin(t * 2.2);
    layer(g, cam, 1, (g) => { glow(g, E.W / 2 - 150, apartmentGround() - 150, 420, '#ff6a20', 0.12 + 0.1 * br); glow(g, E.W / 2 + 640, apartmentGround() - 470, 160, '#ffb040', 0.08 + 0.08 * br); });
    FX.dust(g, t, { count: 40, color: '#ffb070', a: 0.25 });
  } });
} });

// s029 — "Anything above absolute zero glows with infrared."  blueprint: IR waves radiate from a warm cup, a rock and a body
registerShot('s029', { draw(g, t, info) {
  const st = info.shot.start, tZero = W('zero', st, 1.2), tGlow = W('glows', st, 1.8), tIR = W('infrared', st, 2.7), k = t / info.dur, c = 1.0 + 0.04 * k;
  const ui = S().ui, bc = ui.blueprint;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(c, c); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'EVERYTHING GLOWS', fig: 'FIG 4 - INFRARED' });
  const d = ease.out(prog(t, 0.1, 1.4)), y0 = E.H * 0.62;
  const objs = [{ x: E.W * 0.22, h: 160, warm: 0.6, draw: (x, y) => { BP.draw(g, [[x - 70, y - 160], [x - 60, y], [x + 60, y], [x + 70, y - 160]], d, { w: 5, color: bc }); BP.draw(g, [[x + 70, y - 120], [x + 115, y - 110], [x + 112, y - 50], [x + 64, y - 40]], d, { w: 5, color: bc }); for (let i = 0; i < 3; i++) BP.draw(g, [[x - 30 + i * 30, y - 190], [x - 20 + i * 30 + Math.sin(t * 3 + i) * 8, y - 240], [x - 30 + i * 30, y - 290]], d, { w: 3, color: alpha(ui.cream, 0.5) }); } },
    { x: E.W * 0.5, h: 120, warm: 0.35, draw: (x, y) => BP.draw(g, [[x - 130, y], [x - 110, y - 80], [x - 40, y - 120], [x + 60, y - 110], [x + 120, y - 60], [x + 130, y]], d, { w: 5, color: bc, close: true }) },
    { x: E.W * 0.78, h: 330, warm: 0.9, draw: (x, y) => UI.lineFigure(g, { x, y, s: 1.5, pose: POSES.stand, color: alpha(bc, d) }) }];
  objs.forEach((o, i) => {
    o.draw(o.x, y0);
    // wavy infrared lines rippling outward, stronger for warmer things
    const on = ease.out(prog(t, tZero + i * 0.15, tGlow + 0.3 + i * 0.15));
    for (let j = 0; j < 4; j++) { const ph = (t * 0.7 + j / 4) % 1, r = 60 + ph * 260; g.save(); g.globalAlpha *= on * (1 - ph) * (0.35 + 0.65 * o.warm);
      g.strokeStyle = '#ff7a3a'; g.lineWidth = 4; g.beginPath(); for (let a = -1.2; a <= 1.2; a += 0.05) { const rr2 = r + Math.sin(a * 14 + t * 6) * 8; const px = o.x + Math.sin(a) * rr2, py = y0 - o.h * 0.55 - Math.cos(a) * rr2; a === -1.2 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); g.restore(); }
    glow(g, o.x, y0 - o.h * 0.5, 160, '#ff6a20', 0.18 * on * o.warm);
  });
  BP.label(g, t, { at: [E.W * 0.5 + 40, y0 - 300], to: [E.W * 0.5 + 40, y0 - 440], str: 'INFRARED', start: tIR });
  text(g, '> 0 K', E.W * 0.12, E.H * 0.2, { size: 46, color: alpha(ui.gold, ease.out(prog(t, tZero - 0.2, tZero + 0.3))), font: FONTS.ui, weight: 900, align: 'left' });
  g.restore();
  chip(g, t, { dur: info.dur - 0.05, str: 'Everything warm glows', at: tGlow, x: E.W * 0.5, y: E.H * 0.88, tone: 'gold' });
} });

// s030 — "Your couch. Your cat. You."  THERMAL view of the flat: couch faint, Biscuit orange, HERO white-hot, labelled as spoken
registerShot('s030', { draw(g, t, info) {
  const st = info.shot.start, tC = W('couch', st, 0.4), tCat = W('cat', st, 1.4), tYou = exact('you', st, 3.0), k = ease.inOut(t / info.dur);
  const cam = { z: 1.15 + 0.08 * k, x: lerp(40, 150, k), y: 60 };
  const GY = apartmentGround(), CX = E.W / 2, sofaX = CX - 150, catX = CX + 640, catY = GY - 440, heroX = CX + 260;
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatRect(c, sofaX - 230, GY - 150, 460, 120, 0.3, 26); heatRect(c, sofaX - 250, GY - 240, 60, 210, 0.28, 20); heatRect(c, sofaX + 190, GY - 240, 60, 210, 0.28, 20);  // the couch: barely warm
      heatBlob(c, sofaX + 40, GY - 140, 160, 50, 0.36, 0.9);                                                                     // where someone sat
      heatCat(c, { x: catX + 30, y: catY, s: 1.3, facing: -1, pose: 'loaf', t, heat: 0.72 });
      heatActor(c, 'HERO', { x: heroX, y: GY, s: 1.5, facing: -1, pose: breathe(POSES.relaxed, t, 1), t, heat: 0.98 });
    }),
    hud: { label: 'THERMAL', temp: t < tCat ? '22 C  COUCH' : t < tYou ? '38 C  CAT' : '37 C  YOU', track: t < tCat ? toScreen(sofaX, GY - 130, cam) : t < tYou ? toScreen(catX + 10, catY - 30, cam) : toScreen(heroX, GY - 200, cam) },
  });
  const lab2 = (str, at, x, y) => { const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; const [sx, sy] = toScreen(x, y, cam); g.save(); g.translate(sx, sy); g.scale(p, p); text(g, str, 0, 0, { size: 46, color: '#fff3dc', font: FONTS.ui, weight: 900, spacing: 6, glow: 18, glowColor: 'rgba(255,170,80,.9)' }); g.restore(); };
  lab2('COUCH', tC, sofaX, GY - 300); lab2('CAT', tCat, catX + 10, catY - 120); lab2('YOU', tYou, heroX, GY - 400);
} });

// s031 — "Dr. Lin, in her green lanyard, kills every light in the lab."  LIN at the switch; the ceiling strips die in a ripple
registerShot('s031', { draw(g, t, info) {
  const st = info.shot.start, tLany = W('lanyard', st, 1.7), tKill = W('kills', st, 2.1), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.08 * k, x: lerp(-260, -160, k), y: 20 };
  const lights = key(t, [[tKill, 1], [tKill + 0.9, 0.04]], ease.inOut);
  const L = lab(g, t, cam, { lights }), sw = L.pos.doorX + 300;
  layer(g, cam, 1, (g) => {
    // the light switch on the wall
    rr(g, sw - 26, L.GY - 330, 52, 80, 8); g.fillStyle = '#e8e4dc'; g.fill(); rr(g, sw - 9, L.GY - 312 + (t > tKill ? 26 : 0), 18, 20, 4); g.fillStyle = '#9a96a0'; g.fill();
    if (t > tKill && t < tKill + 0.3) FX.sparkle(g, sw, L.GY - 300, 20, '#ffffff', 0.8);
    const lp = breathe(posesAt(t, [[0, 'stand'], [tLany - 0.2, 'holdFront'], [tKill - 0.35, 'reach'], [tKill + 0.6, 'cheer']], 0.3), t, 1, 3);
    actor(g, 'LIN', { x: sw - 110, y: L.GY, s: 1.25, facing: 1, pose: lp, expr: t > tKill + 0.3 ? 'happy' : 'smile', look: [0.6, -0.4], rim: { color: mix('#cfe0ff', '#7fb0ff', 1 - lights), dir: [1, -0.4] }, t });
    if (t > tLany - 0.2 && t < tLany + 0.9) glow(g, sw - 104, L.GY - 190, 50, '#2fb85a', 0.5 * Math.sin(prog(t, tLany - 0.2, tLany + 0.9) * Math.PI));
    actor(g, 'HERO', { x: L.CX + 380, y: L.GY, s: 1.0, facing: -1, pose: breathe(POSES.relaxed, t, 1), expr: t > tKill + 0.5 ? 'smirk' : 'neutral', look: [-0.8, 0], rim: { color: '#7fb0ff', dir: [-1, -0.4] }, t });
  });
  labFg(g, t, cam);
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.12 + 0.12 * lights });
} });

// s032 — "She holds up one hand. You count five warm fingers."  THERMAL insert: a raised hand, five fingers counted 1-5
registerShot('s032', { draw(g, t, info) {
  const st = info.shot.start, tHand = W('hand', st, 0.7), tFive = W('five', st, 2.0), tFing = W('fingers', st, 2.8), k = ease.inOut(t / info.dur);
  const rise = ease.out(prog(t, 0.0, Math.max(0.5, tHand))), hx = E.W * 0.5 + Math.sin(t * 1.2) * 12, hy = E.H * 0.62 + (1 - rise) * 500;
  const z = 1.0 + 0.07 * k, fing = [[-150, -170, -0.32], [-75, -240, -0.12], [0, -260, 0], [75, -238, 0.12], [150, -200, 0.75]];
  thermalView(g, t, {
    cold: (c) => { lab(c, t, { z: 2.2, x: -200, y: -100 }, { lights: 0 }); },
    hot: (c) => { c.save(); c.translate(E.W / 2, E.H / 2); c.scale(z, z); c.translate(-E.W / 2, -E.H / 2);
      heatRect(c, hx - 110, hy + 130, 220, 400, 0.4, 40);                                     // sleeve (lab coat: cooler)
      heatRect(c, hx - 120, hy - 120, 240, 270, 0.88, 70);                                    // palm
      fing.forEach(([fx, fy, a], i) => { c.save(); c.translate(hx + fx, hy + (i === 4 ? 0 : -80)); c.rotate(a); heatRect(c, -30, fy * (i === 4 ? 0.6 : 0.62), 60, -fy * (i === 4 ? 0.6 : 0.62) + 20, 0.93, 30); c.restore(); });
      heatBlob(c, hx, hy - 80, 320, 340, 0.3, 0.9); c.restore(); },
    hud: { label: 'THERMAL', temp: '35 C  HAND', track: null },
  });
  // gold numbers 1-5 count off over the fingertips from "five" to "fingers"
  fing.forEach(([fx, fy, a], i) => { const at = lerp(tFive - 0.1, tFing + 0.1, i / 4), p = ease.outBack(prog(t, at, at + 0.3)); if (p <= 0.01) return;
    const ty = fy * (i === 4 ? 0.6 : 0.62), bx = hx + fx, by = hy + (i === 4 ? 0 : -80), wx = bx - ty * Math.sin(a), wy = by + ty * Math.cos(a);   // fingertip (rotated local (0, ty))
    const tipX = (wx - E.W / 2) * z + E.W / 2, tipY = (wy - E.H / 2) * z + E.H / 2;
    g.save(); g.translate(tipX, tipY - 40); g.scale(p, p); text(g, String(i + 1), 0, 0, { size: 64, color: S().ui.gold, font: FONTS.title, weight: 700, glow: 18, glowColor: 'rgba(255,170,80,.9)', stroke: 8, strokeColor: '#1a0a14' }); g.restore(); });
} });

// s033 — "She is not scared. She is thrilled."  giant face of DR LIN in the blueprint-wall glow: grinning, glasses glinting
registerShot('s033', { draw(g, t, info) {
  const st = info.shot.start, tThr = W('thrilled', st, 2.2), k = ease.inOut(t / info.dur), z = 1 + 0.08 * k;
  backdrop(g, ['#05080f', '#0a1428', '#05060c']);
  g.save(); g.translate(E.W / 2, E.H * 0.55); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.55);
  glow(g, E.W * 0.2, E.H * 0.4, 900, '#4a7aff', 0.22);
  bigFace(g, E.W * 0.52, E.H * 0.52, 290, { outfit: LIN, expr: t < tThr - 0.3 ? 'smile' : 'joy', look: [-0.2, 0], blink: (t % 2.7) < 0.08, rimColor: '#7fb0ff', rimSide: -1, tilt: Math.sin(t * 1.4) * 0.04 });
  const gl = ease.out(prog(t, tThr - 0.2, tThr + 0.2)) * (1 - prog(t, tThr + 0.4, tThr + 1.0));
  for (const dx of [-0.34, 0.34]) FX.sparkle(g, E.W * 0.52 + dx * 290 - 40, E.H * 0.52 - 290 * 0.3, 40, '#e8f2ff', 0.25 + 0.75 * gl);
  g.restore();
  FX.dust(g, t, { count: 30, color: '#9fc0ff', a: 0.22 });
} });

// s034 — "This is thermal vision, she whispers. Not magic. Physics."  LIN whispers to HERO in the glow; chip on "Physics"
registerShot('s034', { draw(g, t, info) {
  const st = info.shot.start, tWh = W('whispers', st, 1.8), tNot = W('not', st, 3.0), tPhy = W('physics', st, 4.6), k = ease.inOut(t / info.dur);
  const cam = { z: 1.55 + 0.08 * k, x: lerp(-160, -120, k), y: 120 };
  const L = lab(g, t, cam, { lights: 0.03 });
  layer(g, cam, 1, (g) => {
    const rim = { color: '#7fb0ff', dir: [0, -1] }, lean = ease.inOut(prog(t, 0.2, 1.2));
    const talk = talkAmount(info.globalT, st, st + tWh - 0.1) + talkAmount(info.globalT, st + tNot - 0.05, st + info.dur);
    const lp = breathe(posesAt(t, [[0, 'stand'], [0.4, 'talk'], [tNot, 'explain'], [tPhy, 'pointUp']], 0.35), t, 0.8, 2);
    actor(g, 'LIN', { x: L.CX - 330, y: L.GY, s: 1.6, facing: 1, pose: lp, expr: t > tPhy ? 'joy' : 'smile', talk: clamp(talk) * 0.6, look: [0.8, 0], rim, t });
    const hp = breathe(blendPose(POSES.stand, { ...POSES.think, head: [16, -200] }, lean), t, 0.8);
    actor(g, 'HERO', { x: L.CX - 40, y: L.GY, s: 1.6, facing: -1, pose: hp, expr: t > tPhy ? 'awe' : 'thinking', look: [-0.8, 0], rim, t });
    if (t < tWh + 0.5) for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; text(g, '~', L.CX - 250 + ph * 120, L.GY - 380 - ph * 30, { size: 40, color: alpha('#cfe0ff', 0.6 * (1 - ph)), font: FONTS.ui, weight: 900 }); }
  });
  labFg(g, t, cam);
  chip(g, t, { dur: info.dur - 0.05, str: 'Not magic. Physics.', at: tPhy, x: E.W * 0.5, y: E.H * 0.86, tone: 'blue' });
  FX.dust(g, t, { count: 30, color: '#9fc0ff', a: 0.2 });
} });

// s035 — "Human skin glows most strongly near nine and a half micrometres."  blueprint wavelength chart, peak at 9.5 um
registerShot('s035', { draw(g, t, info) {
  const st = info.shot.start, tNine = W('nine', st, 2.1), k = t / info.dur, c = 1.0 + 0.04 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(c, c); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'WHAT SKIN GIVES OFF', fig: 'FIG 5 - EMISSION SPECTRUM' });
  BP.wavelength(g, t, { x: 300, y: 210, w: 1320, h: 560, k: ease.inOut(prog(t, 0.2, Math.max(1.0, tNine + 0.2))), peak: 9.5 });
  UI.lineFigure(g, { x: 1640, y: 760, s: 1.1, pose: POSES.stand, color: alpha(S().ui.blueprint, 0.8) });
  g.restore();
  chip(g, t, { dur: info.dur - 0.05, str: 'Skin peak: ~9.5 micrometres', at: tNine + 0.5, x: E.W * 0.5, y: E.H * 0.9, tone: 'gold' });
} });

// s036 — "That is long-wave infrared. Thermal cameras read exactly that band."  LIN's camera on its tripod; rack-focus to its screen showing HERO in false colour
registerShot('s036', { draw(g, t, info) {
  const st = info.shot.start, tLW = W('long-wave', st, 0.5), tCam = W('cameras', st, 2.2), k = ease.inOut(t / info.dur);
  const rack = ease.inOut(prog(t, tCam - 0.6, tCam + 0.4)), cam = { z: 1.9 + 0.12 * k, x: 470, y: 60 };
  // background: the dark lab with HERO standing by the wall (soft, then softer as focus racks to the screen)
  blurLayer(g, 3 + 8 * rack, (g) => { const L = lab(g, t, cam, { lights: 0.03 }); layer(g, cam, 1, (g) => actor(g, 'HERO', { x: L.CX + 260, y: L.GY, s: 1.5, facing: -1, pose: breathe(POSES.relaxed, t, 1), expr: 'neutral', rim: { color: '#7fb0ff', dir: [-1, -0.3] }, t })); });
  // the thermal camera in the foreground (sharp after the rack)
  blurLayer(g, 10 * (1 - rack), (g) => {
    const bx = E.W * 0.36, by = E.H * 0.42;
    seg(g, [[bx + 120, by + 170], [bx + 20, E.H + 40]], 14, '#1a1a24'); seg(g, [[bx + 120, by + 170], [bx + 220, E.H + 40]], 14, '#1a1a24'); seg(g, [[bx + 120, by + 170], [bx + 120, E.H + 40]], 14, '#1a1a24');
    rr(g, bx - 230, by - 180, 520, 350, 30); g.fillStyle = '#2a2a36'; g.fill(); g.strokeStyle = alpha('#9fc0ff', 0.35); g.lineWidth = 3; g.stroke();
    rr(g, bx + 290, by - 90, 110, 170, 24); g.fillStyle = '#1c1c26'; g.fill(); circle(g, bx + 400, by - 5, 60, '#0c0c14'); ring(g, bx + 400, by - 5, 60, 8, '#3a3a4a'); circle(g, bx + 405, by - 15, 16, alpha('#7f6aff', 0.35));   // lens
    // the little screen: HERO in the palette
    const sx = bx - 200, sy = by - 150, sw = 400, sh = 290; rr(g, sx, sy, sw, sh, 14); g.fillStyle = '#0d0018'; g.fill();
    g.save(); rr(g, sx, sy, sw, sh, 14); g.clip(); g.fillStyle = linGrad(g, 0, sy, 0, sy + sh, ['#1a0030', '#2a0050']); g.fillRect(sx, sy, sw, sh);
    glow(g, sx + sw * 0.5, sy + sh * 0.55, 160, hc(0.7), 0.6);
    actor(g, { top: 'hoodie', color: hc(0.62), legs: hc(0.5), head: 'none' }, { x: sx + sw * 0.5, y: sy + sh + 20, s: 1.15, facing: -1, pose: breathe(POSES.relaxed, t, 1), ink: hc(0.94), inkFar: hc(0.8), rim: false, shadow: false, expr: 'neutral', t });
    for (let y = sy; y < sy + sh; y += 4) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(sx, y, sw, 1.5); }
    text(g, 'LWIR', sx + 18, sy + 24, { size: 22, color: S().ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 }); if (Math.floor(t * 1.6) % 2 === 0) circle(g, sx + sw - 22, sy + 22, 7, '#ff3b30');
    g.restore();
  });
  // the band label
  const bl = ease.out(prog(t, tLW - 0.1, tLW + 0.4)) * clamp((info.dur - t) / 0.3);
  if (bl > 0.01) { g.save(); g.globalAlpha *= bl; rr(g, E.W * 0.62, E.H * 0.18, 560, 90, 45); g.fillStyle = alpha('#0b1324', 0.9); g.fill(); g.strokeStyle = S().ui.gold; g.lineWidth = 3; g.stroke(); text(g, 'LONG-WAVE INFRARED', E.W * 0.62 + 280, E.H * 0.18 + 46, { size: 38, color: S().ui.gold, font: FONTS.ui, weight: 900, spacing: 3 }); text(g, '8 - 14 um', E.W * 0.62 + 280, E.H * 0.18 + 120, { size: 30, color: '#cfe0ff', font: FONTS.ui, weight: 800 }); g.restore(); }
  FX.dust(g, t, { count: 26, color: '#9fc0ff', a: 0.2 });
} });

// s037 — "Your own eyes can't. One reason? They are warm too."  blueprint eye washed with its own orange glow
registerShot('s037', { draw(g, t, info) {
  const st = info.shot.start, tWarm = W('warm', st, 3.1), tCant = W("can't", st, 0.7), k = t / info.dur, c = 1.0 + 0.05 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(c, c); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'WHY YOUR EYES CANNOT', fig: 'FIG 6 - A WARM EYE' });
  const gk = ease.inOut(prog(t, tWarm - 1.2, tWarm + 0.4));
  BP.eye(g, t, { x: E.W * 0.45, y: E.H * 0.52, r: 260, k: 1, rays: false, glowK: gk });
  // incoming long-wave rays fade out before they reach the retina ("can't")
  const rk = ease.out(prog(t, tCant - 0.4, tCant + 0.4)); for (let i = -2; i <= 2; i++) { const ph = (t * 0.5 + i * 0.17) % 1; const x0 = E.W * 0.06 + ph * 300, y = E.H * 0.52 + i * 40; seg(g, [[x0, y], [x0 + 140, y]], 4, alpha('#ff7a3a', 0.7 * rk * (1 - ph))); }
  BP.label(g, t, { at: [E.W * 0.45 + 220, E.H * 0.52 - 100], to: [E.W * 0.45 + 380, E.H * 0.52 - 300], str: 'EYES ARE WARM TOO', start: tWarm });
  text(g, '37 C', E.W * 0.45 + 60, E.H * 0.52 + 40, { size: 52, color: alpha('#ffb070', gk), font: FONTS.ui, weight: 900, glow: 20, glowColor: 'rgba(255,120,40,.8)' });
  g.restore();
} });

// s038 — "It's like reading a dim screen with a torch in your face."  gag: HERO squints at a dim phone while a torch blasts his face
registerShot('s038', { draw(g, t, info) {
  const st = info.shot.start, tTorch = W('torch', st, 1.8), k = ease.inOut(t / info.dur);
  const cam = { z: 1.75 + 0.08 * k, x: lerp(-60, -20, k), y: 140 };
  const L = lab(g, t, cam, { lights: 0.03 });
  const blast = ease.out(prog(t, tTorch - 0.25, tTorch + 0.1)), hx = L.CX - 80, headY = L.GY - 210 * 1.6;
  layer(g, cam, 1, (g) => {
    const hp = breathe(posesAt(t, [[0, 'phone'], [tTorch + 0.2, { ...POSES.phone, head: [-2, -200] }]]), t, 0.8);
    const H = { x: hx, y: L.GY, s: 1.6, facing: 1, pose: hp };
    actor(g, 'HERO', { ...H, expr: blast > 0.3 ? 'angry' : 'thinking', look: [0.6, 0.6], blink: blast > 0.3 && (t % 0.6) < 0.25, rim: { color: mix('#7fb0ff', '#fff6dc', blast), dir: [1, -0.2] }, t });
    const px = hx + 28 * 1.6, py = L.GY - 166 * 1.6; rr(g, px - 8, py - 26, 30, 48, 6); g.fillStyle = '#0c0c14'; g.fill(); rr(g, px - 4, py - 22, 22, 40, 4); g.fillStyle = alpha('#9fc0ff', 0.25 * (1 - blast * 0.7)); g.fill();   // the dim phone
    // the torch on the right, aimed straight at his face
    const tx = hx + 520, ty = headY + 20; rr(g, tx - 20, ty - 26, 140, 52, 14); g.fillStyle = '#3a3a48'; g.fill(); circle(g, tx - 20, ty, 30, '#e8e4dc');
    if (blast > 0) { FX.lightCone(g, tx - 20, ty, { angle: Math.PI, spread: 0.28, len: 700, color: '#fff6dc', a: 0.4 * blast }); glow(g, tx - 20, ty, 160, '#ffffff', 0.9 * blast); }
  });
  labFg(g, t, cam);
  veil(g, '#fff6e0', 0.22 * blast * (0.85 + 0.15 * Math.sin(t * 20)), 'lighter');
  FX.dust(g, t, { count: 30, color: '#fff6dc', a: 0.15 + 0.2 * blast });
} });

// s039 — "Nature found a workaround. Pit vipers have a hollow pit on their face."  macro: a pit viper in the wet undergrowth, the pit circled in gold
// (tPit is the 'pit' after 'hollow', not the 'Pit' of 'Pit vipers')
registerShot('s039', { draw(g, t, info) {
  const st = info.shot.start, tPit = (wordTime('pit', wordTime('hollow', st) ?? st + 2.9) ?? st + 3.3) - st, tViper = W('vipers', st, 2.0), k = ease.inOut(t / info.dur);
  const cam = { z: 1.0 + 0.1 * k, x: lerp(-40, 40, k), y: 0 };
  layer(g, cam, 0.5, (g) => { backdrop(g, ['#070a12', '#0b1220', '#05070c']); glow(g, E.W * 0.8, E.H * 0.1, 800, '#9fb6d8', 0.15); for (let i = 0; i < 9; i++) FX.pine(g, 80 + i * 230, E.H * 0.9, 1.6 + (i % 3) * 0.3, '#0c1418'); });
  const s = 6, sx = 1060, sy = 890, st2 = t * 0.5, fl = ease.out(prog(t, 0.0, 1.2));
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 14; i++) { const lx = -100 + i * 160, ly = E.H * 0.9; poly(g, [[lx, ly], [lx + 60, ly - 180 - (i % 3) * 40], [lx + 120, ly]], '#0e1a14'); }      // undergrowth leaves
    // a wet highlight along the back
    g.save(); g.globalAlpha *= 0.25; snake(g, { x: sx - 4, y: sy - 6, s: s * 0.98, facing: 1, t: st2, len: 200, fill: '#9fb6d8', flat: true }); g.restore();
    snake(g, { x: sx, y: sy, s, facing: 1, t: st2, len: 200, fill: '#2c3a2a' });
  });
  // the head sits at the end of the curve: pit just in front of the eye (local [h+27, h+1]), circled on "pit"
  const headY = -10 - Math.sin(9 - st2 * 3) * 14 * 0.6 - 42, hpX = sx + 27 * s, hpY = sy + (headY + 1) * s;   // snake(): head end of the curve, pit at (+27, +1)
  const pk = ease.outBack(prog(t, tPit - 0.15, tPit + 0.3));
  if (pk > 0.01) { const [px, py] = [(hpX - E.W / 2 - cam.x) * cam.z + E.W / 2, (hpY - E.H / 2 - cam.y) * cam.z + E.H / 2]; g.save(); g.translate(px, py); g.scale(pk, pk); ring(g, 0, 0, 60, 7, S().ui.gold); glow(g, 0, 0, 120, S().ui.gold, 0.35); g.restore(); UI.callout(g, t, { at: [px + 50, py - 40], to: [px + 260, py - 230], str: 'HOLLOW PIT', start: tPit + 0.1 }); }
  FX.rain(g, t, { count: 160, a: 0.25 });
  for (let i = 0; i < 6; i++) { const ph = (t * 0.9 + i / 6) % 1; circle(g, E.W * (0.15 + i * 0.14), lerp(E.H * 0.1, E.H * 0.85, ph), 4, alpha('#cfe0ff', 0.5 * (1 - ph))); }   // drips
  chip(g, t, { dur: info.dur - 0.05, str: 'Pit vipers', at: tViper, x: E.W * 0.78, y: E.H * 0.8, tone: 'gold', dur: tPit - 0.1 });
} });
