// C_s052_s062_rule3.js — ep 5 batch C part 1: RULE 3 card + FIG 4 (Newton 3, the car pushes down, ~1,500 + ~50 kg ~15,200 N, P = F / A,
// soles ~0.03 m2, x1..x5, ~380-510 kPa vs ~75 kPa MORE THAN 5x, planks ~7.6 kPa, snowshoes), then MINA drags two planks out.
// Numbers as sources.md (shots.json scene texts). LEGAL: STYLE.md DON'T list (no series names/words, no portals, eyes never glow).
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { garden, gardenFg } from '../sets/garden.js';
import { board, label, draw } from '../sets/bp.js';
import { ruleCard } from '../sets/hud.js';
import { cat } from '../sets/creatures.js';
import { tileCrack } from '../sets/fx5.js';
import { blinkFlag, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { push, goldPop, fade, cTxt, hero, bpFig, bpCar, bpArrow, soles, bar } from './C_lib.js';

const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 52 });
// the family car (LOCAL, side view, classic flat style), (x, y) = ground under its middle; 1 m = 260 units
function car(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot ?? 0);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 6, 520, 26, 0, 0, 7); g.fill();
  const body = '#3f7fb5';
  g.fillStyle = body; g.beginPath(); g.moveTo(-520, -70); g.quadraticCurveTo(-540, -170, -440, -190); g.lineTo(-250, -200); g.quadraticCurveTo(-160, -330, -40, -335); g.lineTo(180, -335); g.quadraticCurveTo(290, -320, 340, -210); g.lineTo(480, -190); g.quadraticCurveTo(540, -170, 530, -70); g.closePath(); g.fill();
  g.fillStyle = shade(body, -0.25); g.fillRect(-520, -90, 1050, 26);
  g.fillStyle = '#bfe0f2'; g.beginPath(); g.moveTo(-220, -205); g.quadraticCurveTo(-150, -310, -50, -312); g.lineTo(60, -312); g.lineTo(60, -205); g.closePath(); g.fill(); g.beginPath(); g.moveTo(90, -205); g.lineTo(90, -312); g.lineTo(170, -312); g.quadraticCurveTo(260, -300, 300, -205); g.closePath(); g.fill();
  circle(g, -520, -130, 14, '#ffe9a8'); circle(g, 525, -130, 12, '#ff6b5b');
  for (const wx of [-330, 330]) { circle(g, wx, -50, 82, '#1a1a1e'); circle(g, wx, -50, 40, '#9aa0a8'); circle(g, wx, -50, 12, '#5a5f66'); }
  g.restore();
}
function patio(g, t, x, y, k) { tileCrack(g, t, x, y, { k, cols: 5, rows: 3, tw: 140, th: 46, seed: 7 }); }

// s052 RULE 3 card over the dimmed garden with the car overhead and the cracked patio
registerShot('s052', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.01 * t, x: 0, y: -40 };
  ruleCard(g, t, info, { n: 3, title: 'PUSH DOWN, AND THE GROUND PUSHES BACK.', bg: (g, t) => { blurLayer(g, 8, (g) => { const G = garden(g, t, cam, { view: 'garden', mood: 'day' }); layer(g, cam, 1, (g) => { patio(g, t, G.CX + 520, G.GY + 40, 1); hero(g, { x: G.CX - 80, y: G.GY + 10, s: 1.9, facing: 1, pose: { ...POSES.stand, ...{ eF: [20, -204], hF: [30, -252], eB: [-10, -204], hB: [-20, -252] } }, expr: 'determined', t }); car(g, G.CX - 80, G.GY + 10 - 252 * 1.9 - 6, 0.42); }); }, null, 1); veil(g, '#140f1c', 0.25); } });
} });

// s053 FIG 4: push and push back (a hand pushes a box, equal arrows)
registerShot('s053', { draw(g, t, info) {
  board(g, t, { title: "FIG 4 - NEWTON'S THIRD LAW", fig: 'ACTION = REACTION' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const bx = E.W * 0.56, by = E.H * 0.55, k = ease.out(prog(t, 0, 0.7));
    draw(g, [[bx - 140, by - 140], [bx + 140, by - 140], [bx + 140, by + 140], [bx - 140, by + 140], [bx - 140, by - 140]], k, { w: 6, color: U.cream });
    draw(g, [[E.W * 0.18, by + 20], [bx - 230, by], [bx - 150, by - 10]], k, { w: 14, color: U.cream }); circle(g, bx - 150, by - 10, 22 * k, U.cream);
    const a = ease.out(prog(t, 0.15, 0.75)), pulse = t > 1.93 ? 1 + 0.08 * Math.sin((t - 1.93) * 12) * Math.exp(-(t - 1.93) * 2) : 1;
    bpArrow(g, bx - 60, by - 220, bx - 60 + 300 * a * pulse, by - 220, a); cTxt(g, 'YOU PUSH', bx + 90, by - 270, { alpha: a, color: U.gold });
    const b = ease.out(prog(t, 0.45, 0.95)); bpArrow(g, bx + 60, by + 230, bx + 60 - 300 * b * pulse, by + 230, b); cTxt(g, 'IT PUSHES BACK', bx - 90, by + 280, { alpha: b, color: U.gold });
    goldPop(g, t, '=', 1.93, bx + 420, by + 10, 140); goldPop(g, t, 'JUST AS HARD', 1.93, bx + 420, by + 140, 52);
  });
  air(g, t);
} });

// s054 FIG 4: push up on a car, it pushes down on you
registerShot('s054', { draw(g, t, info) {
  board(g, t, { title: "FIG 4 - NEWTON'S THIRD LAW", fig: 'THE CAR PUSHES BACK' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const fx = E.W * 0.45, fy = E.H * 0.86, F = bpFig(g, fx, fy, 1.1, ease.out(prog(t, 0, 0.6)), { arms: 1 }); bpCar(g, fx, F.hands[1] - 8, 0.9, ease.out(prog(t, 0.1, 0.8)));
    bpArrow(g, fx - 300, F.hands[1] + 40, fx - 300, F.hands[1] - 160 * ease.out(prog(t, 0.17, 0.6)) + 40, prog(t, 0.17, 0.6) > 0 ? 1 : 0); cTxt(g, 'PUSH UP', fx - 300, F.hands[1] - 160, { color: U.gold, alpha: prog(t, 0.4, 0.7) });
    const d = ease.out(prog(t, 1.43, 1.85)); bpArrow(g, fx + 300, F.hands[1] - 160, fx + 300, F.hands[1] - 160 + 200 * d, d); if (d > 0) cTxt(g, 'PUSHES DOWN', fx + 300, F.hands[1] + 90, { color: U.gold, alpha: d });
    if (t > 1.7) label(g, t, { at: [fx, F.hands[1] - 130], to: [fx + 420, E.H * 0.2], str: 'the car pushes back', start: 1.73 });
  });
  air(g, t);
} });

// s055 FIG 4: car ~1,500 kg + you ~50 kg -> through the feet -> ~15,200 N into the ground
registerShot('s055', { draw(g, t, info) {
  board(g, t, { title: "FIG 4 - NEWTON'S THIRD LAW", fig: 'INTO THE GROUND' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const fx = E.W * 0.36, gy = E.H * 0.74, F = bpFig(g, fx, gy, 1.0, 1, { arms: 1 }); bpCar(g, fx, F.hands[1] - 8, 0.8, 1);
    g.save(); g.beginPath(); g.rect(E.W * 0.08, gy, E.W * 0.84, 160); g.clip(); g.strokeStyle = alpha(U.cream, 0.5); g.lineWidth = 3; for (let i = 0; i < 60; i++) { g.beginPath(); g.moveTo(E.W * 0.08 + i * 32, gy); g.lineTo(E.W * 0.08 + i * 32 - 60, gy + 160); g.stroke(); } g.restore(); seg(g, [[E.W * 0.08, gy], [E.W * 0.92, gy]], 5, U.cream);
    const blk = (y, w, h, str, at) => { const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; g.save(); g.translate(E.W * 0.7, y); g.scale(p, p); rr(g, -w / 2, -h / 2, w, h, 12); g.fillStyle = alpha(U.gold, 0.75); g.fill(); text(g, str, 0, 2, { size: 40, color: '#0b1324', font: FONTS.ui, weight: 900 }); g.restore(); };
    blk(E.H * 0.3, 420, 110, 'CAR ~1,500 kg', 0.3); blk(E.H * 0.43, 220, 70, 'YOU ~50 kg', 0.84);
    const a = ease.inOut(prog(t, 2.44, 2.9)); if (a > 0) bpArrow(g, fx + 120, F.hands[1] - 40, fx + 120, gy + 130 * a, 1, U.gold, 18);
    goldPop(g, t, '~15,200 N', 2.78, E.W * 0.7, E.H * 0.64, 96);
  });
  air(g, t);
} });

// s056 PRESSURE = FORCE / AREA
registerShot('s056', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - PRESSURE', fig: 'FORCE / AREA' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const cx = E.W * 0.44, cy = E.H * 0.5;
    goldPop(g, t, 'PRESSURE', 0.25, cx - 330, cy, 96); goldPop(g, t, '=', 0.45, cx - 60, cy, 110); goldPop(g, t, 'FORCE', 0.63, cx + 170, cy - 80, 96);
    const dl = ease.out(prog(t, 0.9, 1.3)); if (dl > 0) seg(g, [[cx + 20, cy], [cx + 20 + 300 * dl, cy]], 8, U.cream); goldPop(g, t, 'AREA', 1.53, cx + 170, cy + 90, 96);
    const gx = E.W * 0.8, gyy = E.H * 0.55, v = 0.4 + 0.08 * Math.sin(t * 9) * prog(t, 0.6, 1.0); g.strokeStyle = U.cream; g.lineWidth = 6; g.beginPath(); g.arc(gx, gyy, 120, Math.PI, Math.PI * 2); g.stroke();
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; seg(g, [[gx + Math.cos(a) * 100, gyy + Math.sin(a) * 100], [gx + Math.cos(a) * 120, gyy + Math.sin(a) * 120]], 3, U.cream); }
    const na = Math.PI + v * Math.PI; seg(g, [[gx, gyy], [gx + Math.cos(na) * 96, gyy + Math.sin(na) * 96]], 6, U.gold); circle(g, gx, gyy, 12, U.cream);
  });
  air(g, t);
} });

// s057 two shoe soles are tiny (~0.03 m2)
registerShot('s057', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - PRESSURE', fig: 'TWO SOLES' });
  push(g, t, info.dur, () => { soles(g, E.W * 0.45, E.H * 0.55, 1.6, ease.out(prog(t, 0, 0.7))); goldPop(g, t, '~0.03 m² touching', 0.96, E.W * 0.74, E.H * 0.4, 64); }, 0.04);
  air(g, t);
} });

// s058 + s059 (match cut): the pressure bar climbs past soft wet ground, x1..x5, then ~380-510 kPa, MORE THAN 5x, rated to hold
const G75 = 75, MAXP = 560;
function pressureBoard(g, t, info, o) {
  board(g, t, { title: 'FIG 4 - PRESSURE', fig: 'HOLDING THAT CAR' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const fx = E.W * 0.3, gy = E.H * 0.72, dent = o.dent ?? 0, F = bpFig(g, fx, gy + dent * 18, 0.95, 1, { arms: 1 }); bpCar(g, fx, F.hands[1] - 8, 0.75, 1);
    draw(g, [[E.W * 0.08, gy], [fx - 70, gy], [fx - 50, gy + dent * 22], [fx + 50, gy + dent * 22], [fx + 70, gy], [E.W * 0.52, gy]], 1, { w: 5, color: U.cream });
    soles(g, fx, gy + 110, 0.45, 1);
    const B = bar(g, E.W * 0.66, E.H * 0.86, 600, o.v, MAXP, { lines: [[G75, o.lineLbl || 'soft, wet ground rated ~75 kPa', o.lineCol || U.cream]] });
    o.extra && o.extra(B);
  });
  air(g, t);
}
registerShot('s058', { draw(g, t, info) {
  const v = lerp(0, 380, ease.inOut(prog(t, 1.68, info.dur))), n = Math.min(5, Math.floor(1 + 4 * prog(t, 2.0, 2.9)));
  pressureBoard(g, t, info, { v, extra: () => { if (t > 2.0) goldPop(g, t, `x${n}`, 2.0, E.W * 0.85, E.H * 0.3, 120); } });
} });
registerShot('s059', { draw(g, t, info) {
  const U = S().ui, v = lerp(380, 480, ease.out(prog(t, 0, 0.5))) + Math.sin(t * 6) * 6;
  pressureBoard(g, t, info, { v, dent: ease.out(prog(t, 0.4, 1.4)), lineLbl: 'rated to hold ~75 kPa', lineCol: t > 2.33 ? U.accent : U.cream, extra: (B) => {
    goldPop(g, t, '~380-510 kPa', 0, B.top[0] + 230, B.top[1] - 10, 54);
    goldPop(g, t, 'MORE THAN 5x', 0.15, E.W * 0.36, E.H * 0.2, 96, { rot: -0.08 });
    if (t > 2.3) label(g, t, { at: [E.W * 0.66, E.H * 0.86 - 6 - 588 * G75 / MAXP], to: [E.W * 0.5, E.H * 0.82], str: 'rated to hold', start: 2.33, color: U.accent });
    fade(g, prog(t, 2.6, 3.0), () => cTxt(g, 'BS 8004 presumed bearing values', E.W * 0.32, E.H * 0.93, { size: 22, alpha: 0.75 }));
  } });
} });

// s060 spread the force: planks under the feet, pressure drops to ~7.6 kPa
registerShot('s060', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - PRESSURE', fig: 'SPREAD THE FORCE' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const fx = E.W * 0.3, gy = E.H * 0.72, F = bpFig(g, fx, gy - 20, 0.95, 1, { arms: 1 }); bpCar(g, fx, F.hands[1] - 8, 0.75, 1);
    const pk = ease.out(prog(t, 0.15, 0.8)); for (const dy of [0, 22]) { rr(g, fx - 420 * pk, gy - 20 + dy, 840 * pk, 18, 6); g.strokeStyle = U.cream; g.lineWidth = 4; g.stroke(); }
    seg(g, [[E.W * 0.06, gy + 40], [E.W * 0.55, gy + 40]], 5, U.cream);
    soles(g, fx, gy + 150, 0.45, 1, { spread: ease.inOut(prog(t, 0.6, 1.6)) });
    if (t > 1.45) label(g, t, { at: [fx + 300, gy + 150], to: [fx + 340, gy + 260], str: 'bigger area', start: 1.48 });
    const v = lerp(470, 7.6, ease.inOut(prog(t, 1.2, 2.58))), B = bar(g, E.W * 0.68, E.H * 0.86, 600, v, MAXP, { lines: [[G75, 'ground ~75 kPa', U.cream]] });
    goldPop(g, t, '~7.6 kPa', 2.58, B.top[0] + 200, B.top[1] - 40, 64); if (t > 2.7) goldPop(g, t, '✓', 2.7, B.top[0] - 120, B.top[1] - 60, 70);
  });
  air(g, t);
} });

// s061 snowshoes: the same idea
registerShot('s061', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - PRESSURE', fig: 'SNOWSHOES' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const cx = E.W * 0.45, cy = E.H * 0.56, k = ease.out(prog(t, 0, 0.5));
    seg(g, [[E.W * 0.1, cy + 150], [E.W * 0.85, cy + 150]], 5, U.cream); for (let i = 0; i < 10; i++) circle(g, E.W * 0.12 + i * 150, cy + 175 + (i % 2) * 14, 8, alpha(U.cream, 0.5));
    for (const sd of [-1, 1]) { const x = cx + sd * 150; g.save(); g.translate(x, cy + 120); g.scale(1, 0.5); g.strokeStyle = U.cream; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, 110 * k, 220 * k, 0, 0, 7); g.stroke();
      g.beginPath(); g.ellipse(0, 0, 110 * k, 220 * k, 0, 0, 7); g.clip(); g.strokeStyle = alpha(U.gold, 0.6); g.lineWidth = 4; for (let i = -10; i < 10; i++) { g.beginPath(); g.moveTo(i * 24 - 80, -230); g.lineTo(i * 24 + 80, 230); g.stroke(); } g.restore(); }
    if (t > 0.45) label(g, t, { at: [cx + 150, cy + 60], to: [cx + 420, E.H * 0.25], str: 'same idea', start: 0.48 });
  });
  air(g, t);
} });

// s062 MINA fetches two planks (the car set down on the lawn, the cracked patio behind)
registerShot('s062', { draw(g, t, info) {
  const mx = lerp(E.W * 0.78, E.W * 0.5, ease.inOut(prog(t, 0, 0.99))), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [80, -40], y: [-20, -30], drift: 0.4 });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' }), GY = G.GY, drop = prog(t, 0.99, 1.15);
  layer(g, cam, 1, (g) => {
    patio(g, t, G.CX + 760, GY + 50, 1); car(g, G.CX - 560, GY + 20, 0.62);
    hero(g, { x: G.CX - 40, y: GY + 20, s: 1.9, facing: 1, pose: idle(POSES.relaxed, t, 2), expr: exprAt(t, [[0, 'neutral'], [1.1, 'smile']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(1, 0.1), rim: G.rim, t });
    const W = walkAlong(mx * 0.6, 2.0, { kid: true }).pose, pose = t < 0.99 ? { ...W, eF: [16, -140], hF: [30, -118], eB: [-8, -140], hB: [4, -118] } : idle(POSES.stand, t, 1);
    for (const dy of [0, 14]) { const y0 = t < 0.99 ? GY + 30 - 118 * 2 * 0.72 + dy : GY + 30 - 6 + dy * 0.5, x0 = t < 0.99 ? mx - 40 : lerp(mx - 40, G.CX + 40, drop), ang = t < 0.99 ? 0.08 : 0;
      g.save(); g.translate(x0, y0); g.rotate(ang); rr(g, -300, -10, 360, 20, 4); g.fillStyle = dy ? '#e0c48a' : '#ead2a0'; g.fill(); g.strokeStyle = '#a88a52'; g.lineWidth = 2; g.stroke(); g.restore(); }
    actor(g, 'MINA', { x: mx, y: GY + 30, s: 2.0, facing: -1, pose, expr: 'determined', blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0), rim: G.rim, t });
    cat(g, { x: mx + 200, y: GY + 34, s: 1.0, facing: -1, pose: 'stand', eyes: 'open', t, rim: G.rim });
    if (t > 0.99 && t < 1.5) FX.dust(g, t, { count: 10, color: '#d8c8a8', a: 0.3 * (1 - prog(t, 0.99, 1.5)), area: [G.CX - 300, GY - 20, 600, 60], seed: 62 });
  });
  gardenFg(g, t, cam, { view: 'garden' });
  atmos(g, t, cam, { color: G.M.key });
} });
