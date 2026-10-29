// C_s082_s091_forest_search.js — batch C (v2): RULE 5 card, the rainy camp, Mina gone, the thermal search (deer, fox, Dev, no match),
// rain greys everything (thermal + blueprint), Mina blending into the rock, Tomas shouting, the torch swing at the cave.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shake, circle, rr, text, FONTS, rng, mix } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, deer, fox } from '../sets/actors.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { thermalView, heat, heatActor, heatDeer, heatFox, heatOwl, heatGecko, heatBlob, heatRect, heatColor, whiteOut } from '../sets/thermal.js';
import { chip, ruleCard, darkness } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, talkGesture, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { shotWord, handWorld, scr, EXTRAS, hangingRain } from './C_lib.js';

const torchBeam = (g, hx, hy, ang, a = 1, len = 1300) => { FX.lightCone(g, hx, hy, { angle: ang, spread: 0.38, len, color: '#f4f8ff', a: 0.4 * a }); glow(g, hx, hy, 90, '#ffffff', 0.6 * a); };

// s082 — RULE 5 'COLD THINGS HIDE' over the rainy camp, drawn dim; rain streaks in front of the banner
registerShot('s082', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], x: [-40, 40] });
  ruleCard(g, t, info, { n: 5, title: 'COLD THINGS HIDE', accent: '#9fd0ff', bg: (g, t) => { forest(g, t, cam, { view: 'camp', rain: true }); forestFg(g, t, cam); atmos(g, t, cam, { color: '#b8c8ff' }); } });
  FX.rain(g, t * 1.15, { count: 150, len: 80, w: 2.2, a: 0.3, seed: 33, angle: 0.18 });
} });

// s083 — "School camping trip, rain pouring through the trees,"  establishing wide; classmates with torches; camera booms down through the pines
registerShot('s083', { draw(g, t, info) {
  const st = info.shot.start, tRain = shotWord('rain', st, 1.2);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-120, -40], y: [-230, -20] });
  const F = forest(g, t, cam, { view: 'camp', rain: true }), GY = F.GY, CX = F.CX;
  layer(g, cam, 1, (g) => {
    const kids = [[CX - 560, 0, 1, 1.05], [CX - 470, 1, -1, 1.0], [CX - 260, 2, 1, 1.02], [CX + 190, 3, -1, 1.0], [CX + 260, 4, 1, 1.04]];
    for (const [x, i, f, s] of kids) { const o = { x, y: GY + 6 + (i % 2) * 8, s, facing: f }, pose = idle(poseAt(t, [[0, 'holdFront'], [tRain + i * 0.12, 'lookUp'], [tRain + 0.9 + i * 0.1, 'holdFront']], 0.3), t, i);
      actor(g, EXTRAS[i], { ...o, pose, expr: exprAt(t, [[0, 'neutral'], [tRain + i * 0.12, 'worried']]), blink: blinkFlag(t, 2.9 + i * 0.3, i), look: lookToward(f * 0.4, -0.6), rim: F.rim, prop: { type: 'flashlight' }, t });
      const [hx, hy] = handWorld(o, pose); torchBeam(g, hx + 14 * f, hy - 4, f > 0 ? -0.25 - i * 0.06 : Math.PI + 0.25 + i * 0.06, 0.8, 700); }
    const h = { x: CX - 60, y: GY + 12, s: 1.15, facing: 1 };
    actor(g, 'HERO', { ...h, pose: idle(poseAt(t, [[0, 'relaxed'], [tRain, 'lookUp']], 0.35), t, 7), expr: exprAt(t, [[0, 'neutral'], [tRain + 0.2, 'worried']]), blink: blinkFlag(t, 3.4, 7), look: lookToward(0.3, -0.7), rim: F.rim, t });
  });
  forestFg(g, t, cam); atmos(g, t, cam, { color: '#b8c8ff' });
} });

// s084 — "and Mina is gone. You scan the forest."  medium at the empty tent; her red scarf on a log; HERO turns worried, then scans determined
registerShot('s084', { draw(g, t, info) {
  const st = info.shot.start, tGone = shotWord('gone', st, 0.6), tScan = shotWord('scan', st, 1.8);
  const cam = camMove(t, info.dur, { z: [1.18, 1.26], x: [300, 380], y: [60, 80] });
  const F = forest(g, t, cam, { view: 'camp', rain: true }), GY = F.GY, tx = F.pos.tent2X;
  layer(g, cam, 1, (g) => {
    // the empty tent's open flap breathing in the wind, the scarf draped on a log
    const flap = Math.sin(t * 2.6) * 8; g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.moveTo(tx - 40, GY); g.lineTo(tx + flap, GY - 190); g.lineTo(tx + 40, GY); g.closePath(); g.fill();
    const lx = tx - 230; rr(g, lx - 90, GY - 40, 180, 44, 20); g.fillStyle = '#2a2018'; g.fill(); g.fillStyle = alpha(F.M.rim, 0.25); g.fillRect(lx - 80, GY - 40, 160, 5);
    g.strokeStyle = '#d4262e'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx - 70, GY - 46); g.quadraticCurveTo(lx - 10, GY - 30 + Math.sin(t * 1.3) * 2, lx + 40, GY - 44); g.lineTo(lx + 60, GY - 4); g.stroke();
    glow(g, lx, GY - 40, 120, '#d4262e', 0.18);
    const h = { x: tx - 470, y: GY + 30, s: 1.95, facing: t < tScan ? 1 : -1 };
    const pose = idle(poseAt(t, [[0, 'stand'], [tGone, 'sad'], [tScan, 'ready']], 0.3), t, 3);
    actor(g, 'HERO', { ...h, pose, expr: exprAt(t, [[0, 'neutral'], [tGone, 'worried'], [tScan, 'determined']]), blink: blinkFlag(t, 3.4, 7), look: t < tScan ? lookToward(1, 0.5) : lookToward(1, -0.1), rim: F.rim, t });
  });
  forestFg(g, t, cam); atmos(g, t, cam, { color: '#b8c8ff' });
  chip(g, t, { str: 'Mina is gone', at: tGone + 0.1, x: E.W * 0.68, y: E.H * 0.84, tone: 'coral', dur: tScan - 0.1 });
} });

// s085 — THERMAL pan: "A deer, a fox, Dev glowing beside you."  crosshair hops deer -> fox -> Dev
registerShot('s085', { draw(g, t, info) {
  const st = info.shot.start, tDeer = shotWord('deer', st, 0.3), tFox = shotWord('fox', st, 1.1), tDev = shotWord('dev', st, 1.8);
  const cam = camMove(t, info.dur, { z: [1.1, 1.14], x: [-560, 520] }), GY = forestGround(), CX = E.W / 2;
  const D = [CX - 620, GY - 4], Fx = [CX + 60 + Math.sin(t * 1.4) * 30, GY + 8], V2 = [CX + 980, GY + 20];
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'camp', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatDeer(c, { x: D[0], y: D[1], s: 1.75, facing: 1, t, graze: 0.5 + 0.5 * Math.sin(t * 0.9), heat: 0.62 });
      heatFox(c, { x: Fx[0], y: Fx[1], s: 2.6, facing: 1, t, heat: 0.62 });
      heatActor(c, 'DEV', { x: V2[0], y: V2[1], s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'relaxed'], [tDev, 'wave']]), t, 2), t, heat: 0.93 });
      heatActor(c, 'HERO', { x: V2[0] + 280, y: V2[1] + 10, s: 1.9, facing: -1, pose: idle(POSES.stand, t, 4), t, heat: 0.84 });
    }),
    hud: { label: 'THERMAL', temp: t < tFox ? '38 C  DEER' : t < tDev ? '39 C  FOX' : '37 C  DEV', track: t < tFox ? scr(cam, D[0] + 60, D[1] - 150) : t < tDev ? scr(cam, Fx[0] + 50, Fx[1] - 60) : scr(cam, V2[0], V2[1] - 380) },
  });
  FX.rain(g, t, { count: 170, angle: 0.18, color: '#3a2a70', a: 0.5, seed: 12 });
  chip(g, t, { str: 'Deer', at: tDeer, x: E.W * 0.28, y: E.H * 0.86, dur: tFox - 0.05 }); chip(g, t, { str: 'Fox', at: tFox, x: E.W * 0.5, y: E.H * 0.86, dur: tDev - 0.05 }); chip(g, t, { str: 'Dev', at: tDev, x: E.W * 0.72, y: E.H * 0.86 });
} });

// s086 — THERMAL sweep: "Everything alive shows up, except her. Why?"  owl, gecko, fox light up; NO MATCH on 'her'; camera stops on grey rock on 'Why?'
registerShot('s086', { draw(g, t, info) {
  const st = info.shot.start, tAlive = shotWord('alive', st, 0.5), tHer = shotWord('her', st, 1.9), tWhy = shotWord('why', st, 2.6);
  const stop = ease.out(prog(t, tWhy - 0.3, tWhy + 0.4)), k = ease.inOut(prog(t, 0, tWhy));
  const cam = { z: 1.2, x: lerp(-420, 260, k), y: 10 + Math.cos(t * 0.5) * 4 }, GY = forestGround(), CX = E.W / 2;
  const sx = lerp(CX - 300, CX + 420, k);
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      const on = (d) => ease.out(prog(t, tAlive + d, tAlive + d + 0.3));
      heatOwl(c, { x: CX - 760, y: GY - 520, s: 2.0, t, turn: Math.sin(t * 0.8), heat: 0.62 * on(0) + 0.01 });
      heatGecko(c, { x: CX - 250, y: GY - 300, s: 2.4, t, rot: -1.2, heat: 0.3 + 0.32 * on(0.2) });
      heatFox(c, { x: CX - 520, y: GY + 10, s: 2.2, facing: 1, t, heat: 0.6 * on(0.4) + 0.01 });
      heatBlob(c, CX + 120, GY - 60, 40, 24, 0.5 * on(0.6), 0.6);                                       // a mouse-sized warm spot
    }),
    hud: { label: 'THERMAL  SEARCH', temp: t > tHer ? 'NO MATCH' : 'SCANNING', track: scr(cam, sx + Math.sin(t * 3) * 20 * (1 - stop), GY - 200) },
  });
  FX.rain(g, t, { count: 170, angle: 0.18, color: '#3a2a70', a: 0.5, seed: 13 });
  if (t > tHer && Math.floor((t - tHer) * 4) % 2 === 0) chip(g, t, { str: 'NO MATCH', at: tHer, x: E.W * 0.5, y: E.H * 0.2, tone: 'coral' });
  chip(g, t, { str: 'Everything alive shows up', at: tAlive, x: E.W * 0.5, y: E.H * 0.86, dur: tHer - 0.05 });
} });

// s087 — THERMAL: "Because the rain has soaked everything cold,"  readouts count down, everything slides to one even violet-grey
registerShot('s087', { draw(g, t, info) {
  const st = info.shot.start, tSoak = shotWord('soaked', st, 1.4), cool = ease.inOut(prog(t, 0.2, info.dur - 0.2));
  const cam = camMove(t, info.dur, { z: [1.15, 1.22], x: [120, 200] }), GY = forestGround(), CX = E.W / 2;
  thermalView(g, t, {
    coldGain: lerp(0.95, 0.6, cool), coldMax: lerp(0.42, 0.33, cool),
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => { heatBlob(c, CX - 300, GY - 200, 220, 180, 0.32 * (1 - cool), 0.9); heatBlob(c, CX + 380, GY - 380, 160, 240, 0.28 * (1 - cool), 0.9); }),
    hud: { label: 'THERMAL', temp: `${Math.round(lerp(16, 11, cool))} C  ROCK` },
  });
  veil(g, '#5a4a78', 0.45 * cool, 'color');                                                            // one even violet-grey
  FX.rain(g, t * 1.3, { count: 380, len: 90, angle: 0.18, color: '#b8a8e8', a: 0.5, seed: 14 });
  // readouts on rocks and trees counting down
  const ui = S().ui; for (const [x, y, a0, d] of [[0.28, 0.4, 17, 0.0], [0.62, 0.3, 15, 0.3], [0.78, 0.62, 18, 0.6], [0.4, 0.68, 16, 0.2]]) {
    const v = Math.round(lerp(a0, 11, ease.inOut(prog(t, 0.3 + d, info.dur - 0.2)))), a = ease.out(prog(t, 0.2 + d, 0.5 + d));
    g.save(); g.globalAlpha *= a; circle(g, E.W * x, E.H * y, 6, ui.gold); text(g, `${v} C`, E.W * x + 16, E.H * y, { size: 38, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left' }); g.restore(); }
  chip(g, t, { str: 'Soaked cold', at: tSoak, x: E.W * 0.5, y: E.H * 0.86, tone: 'blue' });
} });

// s088 — BLUEPRINT: "warm and cool fade into the same grey."  two swatches slide together on 'fade' and merge into one flat grey
registerShot('s088', { draw(g, t, info) {
  const st = info.shot.start, tFade = shotWord('fade', st, 0.8), tGrey = shotWord('grey', st, 1.7), z = 1 + 0.035 * (t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2);
  BP.board(g, t, { title: 'WHY RAIN HIDES HEAT', fig: 'FIG 9 - THERMAL CONTRAST' });
  const ui = S().ui, m = ease.inOut(prog(t, tFade, tGrey + 0.2)), w = 360, h = 300, y = E.H * 0.48, k = ease.out(prog(t, 0, 0.6));
  const warm = mix('#ff8a3a', '#6c6a78', m), coolc = mix('#7a4ad8', '#6c6a78', m), lx = lerp(E.W * 0.3, E.W * 0.5 - w * 0.25, m), rx = lerp(E.W * 0.7, E.W * 0.5 + w * 0.25, m);
  g.save(); g.globalAlpha *= k;
  for (const [x, c, lab] of [[lx, warm, 'WARM'], [rx, coolc, 'COOL']]) { rr(g, x - w / 2, y - h / 2, w, h, 16); g.fillStyle = c; g.fill(); g.strokeStyle = alpha(ui.blueprint, 0.9); g.lineWidth = 5; g.stroke(); if (m < 0.6) text(g, lab, x, y - h / 2 - 40, { size: 40, color: ui.gold, font: FONTS.ui, weight: 900, alpha: 1 - m / 0.6, spacing: 3 }); }
  // the rain drops crossing both swatches
  g.strokeStyle = alpha('#dfe8ff', 0.5); g.lineWidth = 3; const r = rng(4); for (let i = 0; i < 24; i++) { const x = E.W * 0.15 + r() * E.W * 0.7, yy = y - h / 2 + ((r() * h + t * 380) % h); g.beginPath(); g.moveTo(x, yy); g.lineTo(x + 6, yy + 28); g.stroke(); }
  g.restore();
  const sk = ease.out(prog(t, tGrey, tGrey + 0.4)); if (sk > 0) { BP.draw(g, [[E.W * 0.5 - w * 0.75, y + h / 2 + 40], [E.W * 0.5 + w * 0.75, y + h / 2 + 40]], sk, { w: 5, color: ui.gold }); text(g, 'SAME GREY', E.W / 2, y + h / 2 + 100, { size: 56, color: ui.gold, font: FONTS.ui, weight: 900, alpha: sk, spacing: 6 }); }
  g.restore();
} });

// s089 — THERMAL close on the ledge: "Her skin is cool, and she's blending into the rock."  nothing marked
registerShot('s089', { draw(g, t, info) {
  const st = info.shot.start, tCool = shotWord('cool', st, 0.9), tBlend = shotWord('blending', st, 2.0), F0 = { ledgeX: E.W / 2 + 120, ledgeY: forestGround() - 150 };
  const cam = { z: lerp(1.75, 1.95, ease.inOut(t / info.dur)), x: -90 + Math.sin(t * 0.5) * 6, y: 100 + Math.cos(t * 0.4) * 4 }, GY = forestGround();
  thermalView(g, t, {
    coldGain: 0.95, coldMax: 0.4, halo: 8, haloGain: 0.18,
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => { const mx = F0.ledgeX - 250, br = 1 + 0.02 * Math.sin(t * 2.3); c.fillStyle = heat(0.288); c.beginPath(); c.ellipse(mx, GY - 66, 118 * br, 70 * br, -0.08, 0, 7); c.fill(); c.beginPath(); c.arc(mx + 96, GY - 118, 44, 0, 7); c.fill(); c.fillStyle = heat(0.297); c.beginPath(); c.arc(mx + 104, GY - 124, 30, 0, 7); c.fill(); heatBlob(c, mx + 30, GY - 80, 170, 110, 0.03, 0.9);   /* a curled small shape, barely warmer than the rock */ }),
    hud: { label: 'THERMAL', temp: `${Math.round(lerp(26, 22, ease.out(prog(t, tCool, tBlend + 0.6))))} C` },
  });
  FX.rain(g, t, { count: 150, angle: 0.18, color: '#3a2a70', a: 0.45, seed: 17 });
} });

// s090 — "Ranger Tomas, in his blue cap, shouts that it's hopeless,"  Tomas shouts into the rain, torch in hand; HERO and DEV behind
registerShot('s090', { draw(g, t, info) {
  const st = info.shot.start, tShout = shotWord('shouts', st, 1.4), tHope = shotWord('hopeless', st, 2.6);
  const cam = camMove(t, info.dur, { z: [1.16, 1.22], x: [-260, -200], y: [70, 80] }); const sk = shake(t * 2, 3 * prog(t, tShout, tShout + 0.3)); cam.x += sk[0];
  const F = forest(g, t, cam, { view: 'camp', rain: true }), GY = F.GY, CX = F.CX;
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: CX - 120, y: GY - 8, s: 1.6, facing: -1, pose: idle(POSES.crossArms, t, 2), expr: exprAt(t, [[0, 'nervous'], [tHope, 'scared']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(-1, -0.2), rim: F.rim, t });
    actor(g, 'HERO', { x: CX + 40, y: GY - 6, s: 1.6, facing: -1, pose: idle(POSES.stand, t, 3), expr: exprAt(t, [[0, 'worried'], [tHope + 0.3, 'determined']]), blink: blinkFlag(t, 3.5, 7), look: t < tHope ? lookToward(-1, 0) : lookToward(1, 0.1), rim: F.rim, t });
    const o = { x: CX - 520, y: GY + 30, s: 1.9, facing: 1 };
    const pose = t < tShout ? idle(POSES.holdFront, t, 1) : idle(poseAt(t - tShout, [[0, 'shrug'], [0.5, 'handsUp'], [1.1, 'shrug'], [1.6, 'handsOnHead']], 0.22), t, 1);
    actor(g, 'TOMAS', { ...o, pose, expr: exprAt(t, [[0, 'worried'], [tShout, 'angry'], [tHope, 'sad']]), talk: talkAmount(info.globalT, st + tShout - 0.05, st + info.dur), blink: blinkFlag(t, 2.8, 5), rim: F.rim, prop: { type: 'flashlight' }, t });
    const [hx, hy] = handWorld(o, pose); torchBeam(g, hx + 14, hy - 4, -0.5 + Math.sin(t * 3) * 0.2, 0.7, 900);
    const lx = F.pos.fireX + 280; glow(g, lx, GY - 30, 220, '#ffcf7a', 0.3);
  });
  forestFg(g, t, cam); atmos(g, t, cam, { color: '#b8c8ff' });
  chip(g, t, { str: '"It\'s hopeless!"', at: tHope, x: E.W * 0.3, y: E.H * 0.18, tone: 'coral' });
} });

// s091 — OVER THE SHOULDER: "and swings his torch at a cave mouth."  the beam sweeps across the trees to the cave on 'cave'
registerShot('s091', { draw(g, t, info) {
  const st = info.shot.start, tSwing = shotWord('swings', st, 0.4), tCave = shotWord('cave', st, 1.6);
  const sw = ease.inOut(prog(t, tSwing, tCave + 0.1)), cam = camMove(t, info.dur, { z: [1.12, 1.18], x: [60, 140], y: [40, 50] });
  const F = forest(g, t, cam, { view: 'cave', rain: true, torch: 0.9, torchX: E.W / 2 - 520, torchAngle: lerp(-1.0, 0.08, sw) }), GY = F.GY;
  layer(g, cam, 1, (g) => {
    const o = { x: F.CX - 600, y: GY + 10, s: 1.7, facing: 1 }, pose = idle(poseAt(t, [[0, 'holdFront'], [tSwing, 'point']], 0.3), t, 1);
    actor(g, 'TOMAS', { ...o, pose, expr: exprAt(t, [[0, 'worried'], [tCave, 'determined']]), blink: blinkFlag(t, 2.8, 5), look: lookToward(1, -0.1), rim: { color: '#fff2d0', dir: [1, -0.4] }, prop: { type: 'flashlight' }, t });
  });
  forestFg(g, t, cam);
  // HERO's hood in the blurred foreground (over the shoulder)
  blurLayer(g, 12, (g) => actor(g, 'HERO', { x: E.W * 0.86, y: E.H * 1.42, s: 3.6, facing: 1, pose: POSES.stand, expr: 'worried', rim: { color: '#fff2d0', dir: [-1, -0.3], w: 10 }, t }), null, 1);
  atmos(g, t, cam, { color: '#dfe8ff' });
  const hit = ease.in(prog(t, tCave, info.dur)); glow(g, E.W * 0.62, E.H * 0.45, 500, '#ffffff', 0.25 * hit);
} });
