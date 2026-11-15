// C_s054_s061_year1.js — ep 3 batch C: YEAR 1, the sub-55 run and the calorie maths.
//   s054 wide: YEAR 1 card flips, summer dawn, HERO runs past KM 10, gold '10 km' on 'Ten'
//   s055 med: finish sprint at the bench, stopwatch stops at 54:48 on 'fifty-five', '< 55 MIN' chip, fist pump, breath puffs
//   s056 bp: FIG 6 - FUEL: line-art runner on a scale + flame; '~' 'roughly', '1 kcal' 'calorie', '/ kg' 'kilo'
//   s057 med: bathroom, he steps onto the scale on 'someone', the dial lands on '70 kg' on 'seventy'
//   s058 graphic: '~700 kcal' lands on 'seven hundred'; 'Every day' swipes in four seasons of the same run, each with a 700 flame chip
//   s059 insert: top-down plate pie '~2,500 kcal / day', a slice just over a quarter lights up on 'quarter', his fork reaches in on 'needs'
//   s060 two: kitchen, HERO wolfs the 700 kcal plate (belly growl on 'hungry'), MINA on a chair slides the cereal onto the fridge on 'hides'
//   s061 two: MINA lip-syncs "For your own good." hands on hips; 'It isn't' cut-in to HERO staring up at the cereal box
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad, talkAmount } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { park, parkFg, kmMarker } from '../sets/park.js';
import { home3, home3Fg, cerealBox, plate700 } from '../sets/home3.js';
import { runCycle, trainee, stopwatch } from '../sets/train.js';
import { board, label } from '../sets/bp.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, talkGesture, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { wt, push, skip, goldPop, bathScale } from './C_lib.js';

const FLAME = (g, x, y, s, t) => { const f = 1 + 0.06 * Math.sin(t * 14); g.save(); g.translate(x, y); g.scale(s, s * f); g.fillStyle = '#ff7a3a'; g.beginPath(); g.moveTo(0, -60); g.bezierCurveTo(34, -24, 30, 10, 0, 22); g.bezierCurveTo(-30, 10, -34, -24, 0, -60); g.fill(); g.fillStyle = '#ffd47e'; g.beginPath(); g.moveTo(0, -24); g.bezierCurveTo(16, -6, 14, 12, 0, 18); g.bezierCurveTo(-14, 12, -16, -6, 0, -24); g.fill(); g.restore(); glow(g, x, y, 70 * s, '#ff9a4a', 0.35); };

registerShot('s054', { draw(g, t, info) {
  const tYear = wt(info, 'Year', 0.15), tTen = wt(info, 'Ten', 1.81), CX = E.W / 2, mx = CX + 420, s = 1.7;
  const hx = mx - 620 + 340 * t, cam = { z: 0.9, x: hx - CX + 260 + Math.sin(t * 0.6) * 8, y: -110 + Math.cos(t * 0.5) * 4 };
  const P = park(g, t, cam, { season: 'summer', mood: 'dawn', km: 10 });
  layer(g, cam, 1, (g) => trainee(g, 'HERO', runCycle(t, 0, { mode: 'run', x: hx, s, facing: 1 }), { x: hx, y: P.GY + 10, s, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3.2, 2), look: lookToward(1, 0),
    expr: exprAt(t, [[0, 'determined'], [tTen, 'smile']]), sweat: 0.25, breath: 1.2 }));
  parkFg(g, t, cam, { season: 'summer' }); atmos(g, t, cam, { color: P.M.key });
  goldPop(g, t, '10 km', tTen, E.W * 0.62, E.H * 0.3, 120);
  skip(g, t, [[0, 'MONTH 3'], [tYear, 'YEAR 1']]);
} });

registerShot('s055', { draw(g, t, info) {
  const tUnder = wt(info, 'under', 0.53), tFive = wt(info, 'fifty-five', 0.73), CX = E.W / 2, s = 1.9;
  const stopX = CX - 120, k = ease.out(prog(t, 0, tFive)), hx = stopX - 520 * (1 - k);
  const cam = camMove(t, info.dur, { z: [1.05, 1.12], x: [-480, -440], y: [-60, -70] });
  const P = park(g, t, cam, { season: 'summer', mood: 'dawn', km: 10, bench: true });
  const stopped = t >= tFive, R = stopped ? { pose: idle(poseAt(t, [[tFive, 'stand'], [tFive + 0.18, 'cheer']], 0.2), t, 2), shadow: [0, 40] } : runCycle(t, 0, { mode: 'sprint', x: hx, s, facing: 1 });
  layer(g, cam, 1, (g) => trainee(g, 'HERO', R, { x: hx, y: P.GY + 20, s, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3.2, 2), look: stopped ? lookToward(0.3, -0.6) : lookToward(1, 0),
    expr: exprAt(t, [[0, 'determined'], [tFive, 'joy']]), sweat: 0.6, breath: stopped ? 2.0 : 1.4 }));
  parkFg(g, t, cam, { season: 'summer' }); atmos(g, t, cam, { color: P.M.key });
  const sec = stopped ? 54 * 60 + 48 : 54 * 60 + 40 + 8 * (t / tFive);
  stopwatch(g, sec, { x: E.W - 250, y: 250, r: 150, label: stopped ? 'FINISH' : null });
  chip(g, t, { str: '< 55 MIN', at: tUnder, x: E.W - 250, y: 470 });
} });

registerShot('s056', { draw(g, t, info) {
  const tRough = wt(info, 'roughly', 0.83), tOne = wt(info, 'one', 1.31), tCal = wt(info, 'calorie', 1.65), tKilo = wt(info, 'kilo', 2.29), U = S().ui;
  board(g, t, { title: 'FIG 6 - FUEL', fig: 'RUNNING BURNS ENERGY' });
  push(g, t, info.dur, () => {
    const x = E.W * 0.3, y = E.H * 0.64, dk = ease.out(prog(t, 0.1, 1.0));
    // the scale platform + the line-art runner on it (run pose cycling in place)
    g.save(); g.globalAlpha *= dk; rr(g, x - 200, y, 400, 40, 12); g.strokeStyle = U.blueprint; g.lineWidth = 5; g.stroke(); seg(g, [[x - 150, y + 40], [x - 160, y + 70]], 5, U.blueprint); seg(g, [[x + 150, y + 40], [x + 160, y + 70]], 5, U.blueprint);
    rr(g, x - 50, y + 8, 100, 24, 6); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); text(g, 'kg', x, y + 21, { size: 20, color: U.gold, font: FONTS.ui, weight: 900 }); g.restore();
    UI.lineFigure(g, { x, y, s: 1.7, pose: runCycle(t, 1.4, { mode: 'run' }).pose, color: alpha(U.cream, dk), facing: 1 });
    if (t > 0.5) FLAME(g, x + 230, y - 300, 1.2 * ease.outBack(prog(t, 0.5, 0.9)), t);
    // the equation builds word by word: ~  1 kcal  / kg
    const ex = E.W * 0.52, ey = E.H * 0.45;
    goldPop(g, t, '~', tRough, ex, ey, 110); goldPop(g, t, '1 kcal', Math.min(tOne, tCal), ex + 250, ey, 110); goldPop(g, t, '/ kg', tKilo, ex + 560, ey, 110);
    label(g, t, { at: [x + 230, y - 330], to: [ex + 30, E.H * 0.24], str: 'energy burned', start: 0.9 });
  });
  FX.dust(g, t, { count: 14, color: '#bcd4ff', a: 0.1, seed: 31 });
} });

registerShot('s057', { draw(g, t, info) {
  const tKm = wt(info, 'kilometre', 0.45), tSome = wt(info, 'someone', 1.93), tSev = wt(info, 'seventy', 2.63), s = 1.9;
  const cam = camMove(t, info.dur, { z: [1.12, 1.2], x: [-160, -120], y: [20, 90] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'day', hair: 0, steam: 0.15 }), sx = H.CX - 60, sy = H.GY + 30;
  const step = ease.inOut(prog(t, tSome - 0.25, tSome + 0.3)), hx = lerp(sx - 300, sx, step), lift = step * 40;
  const kg = t < tSome ? 0 : t < tSev ? lerp(0, 72, ease.out(prog(t, tSome, tSev))) : 70 + 2 * Math.exp(-(t - tSev) * 6) * Math.cos((t - tSev) * 20);
  layer(g, cam, 1, (g) => {
    bathScale(g, sx, sy, 1.2, kg, t);
    const walking = step > 0.02 && step < 0.98, pose = walking ? runCycle(t, 0, { mode: 'walk', x: hx, s, facing: 1 }).pose : idle(POSES.relaxed, t, 3);
    actor(g, 'HERO', { x: hx, y: sy - lift - 6, s, facing: 1, pose, expr: exprAt(t, [[0, 'neutral'], [tSev + 0.1, 'smile']]), blink: blinkFlag(t, 3.1, 2), look: t > tSome ? lookToward(0.2, 1) : lookToward(1, 0), rim: H.rim, t });
  });
  home3Fg(g, t, cam, { room: 'bathroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  goldPop(g, t, '70 kg', tSev, E.W * 0.78, E.H * 0.5, 120);
  chip(g, t, { str: '1 kcal / kg / km', at: 0.05, x: E.W * 0.78, y: E.H * 0.12 });
  if (t > tKm) { const p = ease.outBack(prog(t, tKm, tKm + 0.3)); g.save(); g.translate(E.W * 0.78 + 160, E.H * 0.12 - 46); g.scale(p, p); FX.sparkle(g, 0, 0, 22, S().ui.gold, 0.9); g.restore(); }
} });

// one season panel of the same run (screen-space content drawn into a vertical strip)
function seasonRun(g, t, season, seed) {
  const CX = E.W / 2, hx = CX + 200 * t + seed * 300, cam = { z: 1.25, x: hx - CX + 40, y: -40 };
  const P = park(g, t, cam, { season, mood: season === 'winter' ? 'day' : 'day', snow: season === 'winter' ? 0.7 : 0, km: 3 + seed });
  layer(g, cam, 1, (g) => trainee(g, 'HERO', runCycle(t, 0, { mode: 'run', x: hx, s: 1.9, facing: 1 }), { x: hx, y: P.GY + 20, s: 1.9, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3, seed), expr: 'determined', breath: season === 'winter' ? 1.4 : 0, cold: season === 'winter' }));
  parkFg(g, t, cam, { season, snow: season === 'winter' ? 0.7 : 0 });
}
registerShot('s058', { draw(g, t, info) {
  const tSev = wt(info, 'seven', 0.59), tEvery = wt(info, 'Every', 2.53), U = S().ui;
  const cam = camMove(t, info.dur, { z: [1.02, 1.06], x: [0, 60] });
  if (t < tEvery - 0.15) { const hx = E.W / 2 + 300 * t, c2 = { ...cam, x: cam.x + 300 * t - 100 }, P = park(g, t, c2, { season: 'summer', mood: 'day', km: 4 });
    layer(g, c2, 1, (g) => trainee(g, 'HERO', runCycle(t, 0, { mode: 'run', x: hx, s: 1.8, facing: 1 }), { x: hx, y: P.GY + 20, s: 1.8, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3, 2), expr: exprAt(t, [[0, 'determined'], [tSev + 0.4, 'smile']]), sweat: 0.4 }));
    parkFg(g, t, c2, { season: 'summer' }); veil(g, '#140f1c', 0.25);
    FLAME(g, E.W * 0.5 - 330, E.H * 0.42, 1.4 * ease.outBack(prog(t, tSev - 0.1, tSev + 0.2)), t);
    // the counter rolls up to 700 on 'seven hundred'
    const v = Math.round(lerp(0, 700, ease.out(prog(t, tSev, tSev + 0.8)))); if (t > tSev) goldPop(g, t, `~${v} kcal`, tSev, E.W * 0.56, E.H * 0.42, 140);
  } else {
    // four vertical panels wipe in one after another: spring / summer / autumn / winter
    const seasons = ['spring', 'summer', 'autumn', 'winter'], pw = E.W / 4;
    g.fillStyle = '#140f1c'; g.fillRect(0, 0, E.W, E.H);
    seasons.forEach((sn, i) => { const w = ease.out(prog(t, tEvery - 0.15 + i * 0.12, tEvery + 0.25 + i * 0.12)); if (w <= 0) return;
      g.save(); g.beginPath(); g.rect(i * pw, 0, pw * w, E.H); g.clip(); g.translate(i * pw + pw / 2 - E.W / 2, 0); seasonRun(g, t + i * 0.7, sn, i); g.restore();
      seg(g, [[i * pw, 0], [i * pw, E.H]], 6, '#140f1c');
      const cp = ease.outBack(prog(t, tEvery + 0.2 + i * 0.12, tEvery + 0.5 + i * 0.12)); if (cp > 0.01) { g.save(); g.translate(i * pw + pw / 2, E.H * 0.16); g.scale(cp, cp); rr(g, -110, -40, 220, 80, 40); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); FLAME(g, -62, 6, 0.5, t); text(g, '700', 26, 2, { size: 48, color: U.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
      text(g, sn.toUpperCase(), i * pw + pw / 2, E.H * 0.9, { size: 34, color: '#fff1dc', font: FONTS.ui, weight: 900, spacing: 4, stroke: 8, strokeColor: '#140f1c', alpha: w }); });
  }
  atmos(g, t, cam, { color: '#fff1dc', far: 12, near: 4 });
} });

registerShot('s059', { draw(g, t, info) {
  const tQ = wt(info, 'quarter', 0.71), tNeeds = wt(info, 'needs', 2.51), U = S().ui, cx = E.W * 0.47, cy = E.H * 0.55, R = 330;
  push(g, t, info.dur, () => {
    // table top (wood planks) + napkin + glass
    g.fillStyle = linGrad(g, 0, 0, E.W, E.H, ['#8a5a3a', '#6a4028']); g.fillRect(0, 0, E.W, E.H); for (let i = 0; i < 7; i++) seg(g, [[0, i * 170 + 40], [E.W, i * 170 + 60]], 3, alpha('#3a2014', 0.4));
    rr(g, E.W * 0.78, E.H * 0.2, 260, 300, 14); g.fillStyle = '#e8e2f0'; g.fill(); circle(g, E.W * 0.15, E.H * 0.28, 90, alpha('#cfe8ff', 0.35)); ring(g, E.W * 0.15, E.H * 0.28, 90, 6, alpha('#ffffff', 0.6));
    glow(g, cx - 200, cy - 300, 700, '#ffe8c0', 0.25);                                                                         // pendant light pool
    // the plate is the pie: the day's ~2,500 kcal; the run's ~700 (28%) slice lights up gold on 'quarter'
    circle(g, cx + 10, cy + 16, R + 40, 'rgba(0,0,0,.3)'); circle(g, cx, cy, R + 40, '#f4f2ee'); ring(g, cx, cy, R + 20, 3, '#d8d4ce');
    const foods = ['#c8803a', '#5a9a4a', '#e8d8a8', '#b84a3a', '#d8a050'], a0 = -Math.PI / 2, hl = ease.out(prog(t, tQ, tQ + 0.35)), r = rng(8);
    let a = a0 + 0.28 * Math.PI * 2; for (let i = 0; i < 5; i++) { const a1 = a + 0.72 * Math.PI * 2 / 5; g.fillStyle = foods[i]; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a, a1); g.closePath(); g.fill(); for (let j = 0; j < 6; j++) { const aa = lerp(a, a1, r()), rr2 = R * (0.3 + 0.6 * r()); circle(g, cx + Math.cos(aa) * rr2, cy + Math.sin(aa) * rr2, 10 + r() * 10, shade(foods[i], 0.2)); } a = a1; }
    const out = 26 * hl, mid = a0 + 0.14 * Math.PI * 2, ox = Math.cos(mid) * out, oy = Math.sin(mid) * out;
    g.fillStyle = mix('#c8803a', U.gold, hl); g.beginPath(); g.moveTo(cx + ox, cy + oy); g.arc(cx + ox, cy + oy, R, a0, a0 + 0.28 * Math.PI * 2); g.closePath(); g.fill(); if (hl > 0) { g.strokeStyle = alpha('#fff6d8', hl); g.lineWidth = 6; g.stroke(); glow(g, cx + ox + Math.cos(mid) * R * 0.5, cy + oy + Math.sin(mid) * R * 0.5, 260, U.gold, 0.35 * hl); }
    for (let i = 0; i < 6; i++) seg(g, [[cx, cy], [cx + Math.cos(a0 + 0.28 * Math.PI * 2 + i * 0.72 * Math.PI * 2 / 5) * R, cy + Math.sin(a0 + 0.28 * Math.PI * 2 + i * 0.72 * Math.PI * 2 / 5) * R]], 3, alpha('#2a1a14', 0.4));
    goldPop(g, t, '> 1/4', tQ + 0.1, cx + Math.cos(mid) * R * 1.35 + 60, cy + Math.sin(mid) * R * 1.35, 90);
    // the fork (green hoodie sleeve) reaches in from the lower right on 'needs'
    const fk = ease.inOut(prog(t, tNeeds - 0.4, tNeeds + 0.2)), fx = lerp(E.W * 1.1, cx + 160, fk), fy = lerp(E.H * 1.1, cy - 60, fk);
    if (fk > 0) { seg(g, [[fx + 300, fy + 260], [fx + 40, fy + 40]], 70, '#3f9a4a'); circle(g, fx + 30, fy + 30, 34, '#2a1e18'); seg(g, [[fx + 20, fy + 20], [fx - 70, fy - 70]], 12, '#c8ccd4'); for (let i = -1; i <= 1; i++) seg(g, [[fx - 70 + i * 10, fy - 70 - i * 10], [fx - 110 + i * 10, fy - 110 - i * 10]], 5, '#c8ccd4'); }
  });
  chip(g, t, { str: '~2,500 kcal / day', at: 0.15, x: E.W * 0.47, y: E.H * 0.1 });
  FX.dust(g, t, { count: 12, color: '#ffe8c0', a: 0.12, seed: 9 });
} });

registerShot('s060', { draw(g, t, info) {
  const tHun = wt(info, 'hungry', 0.67), tHides = wt(info, 'hides', 2.17), s = 1.9;
  const cam = camMove(t, info.dur, { z: [1.06, 1.1], x: [-120, 260], y: [-60, -70] });
  const lifted = t > tHides + 0.5, H = home3(g, t, cam, { room: 'kitchen', mood: 'day', kcal: prog(t, 0.2, 0.6), cereal: lifted ? 1 : 0 });
  const p = H.pos;
  layer(g, cam, 1, (g) => {
    // HERO at the table, shovelling the 700 kcal plate; belly growl on 'hungry'
    const eat = Math.sin(t * 9) * 0.5 + 0.5, hp = idle({ ...POSES.sit, hF: [52, -120 - eat * 50], eF: [30, -118] }, t, 2);
    actor(g, 'HERO', { x: p.tableX - 330, y: H.GY + 6, s, facing: 1, pose: hp, expr: exprAt(t, [[0, 'happy'], [tHun, 'worried'], [tHides + 0.3, 'suspicious']]), blink: blinkFlag(t, 3.0, 2), look: t > tHides ? lookToward(1, -0.5) : lookToward(1, 0.4), rim: H.rim, t });
    if (t > tHun && t < tHun + 1.0) { const u = (t - tHun) / 1.0; g.strokeStyle = alpha('#fff1dc', 0.8 * (1 - u)); g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(p.tableX - 300, H.GY - 150, 30 + i * 20 + u * 30, -0.6, 0.6); g.stroke(); } }
    // MINA on a chair by the fridge: lifts the cereal box up and slides it onto the fridge top on 'hides'
    const cx = p.fridgeX - 250; FX.chair(g, cx, H.GY + 10, 1.5, '#5a3a2a');
    const up = ease.inOut(prog(t, tHides - 0.5, tHides + 0.1)), slide = ease.inOut(prog(t, tHides, tHides + 0.5));
    actor(g, 'MINA', { x: cx, y: H.GY + 10 - 110, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [tHides - 0.5, EXTRA.reachHigh], [tHides + 0.6, 'relaxed']], 0.3), t, 4), expr: exprAt(t, [[0, 'suspicious'], [tHides + 0.5, 'smirk']]), blink: blinkFlag(t, 2.8, 4), look: t > tHides + 0.5 ? lookToward(-1, 0.3) : lookToward(1, -0.6), rim: H.rim, t });
    if (!lifted) cerealBox(g, lerp(cx + 60, p.cerealX, slide), lerp(H.GY - 230, p.cerealY - 4, up), 1.0, 0);
  });
  home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
} });

registerShot('s061', { draw(g, t, info) {
  const st = info.shot.start, tGood = wt(info, 'good', 0.67), tIt = wt(info, 'It', 1.77), s = 1.9;
  const cut = t >= tIt - 0.12;
  if (!cut) {
    const cam = camMove(t, tIt, { z: [1.45, 1.52], x: [280, 290], y: [20, 30] });
    const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 1 }), p = H.pos;
    layer(g, cam, 1, (g) => {
      const hips = { ...POSES.stand, eF: [20, -140], hF: [6, -104], eB: [-22, -140], hB: [-8, -104] }, tg = talkGesture(t, 3, { energy: 0.4 });
      actor(g, 'MINA', { x: p.fridgeX - 380, y: H.GY + 10, s: 2.05, facing: -1, pose: idle(t < tGood ? { ...hips, head: tg.head || hips.head } : hips, t, 4), expr: exprAt(t, [[0, 'smirk'], [tGood, 'happy']]), talk: talkAmount(st + t, st + 0.1, st + tGood + 0.45), blink: blinkFlag(t, 2.8, 4), look: lookToward(-1, 0.1), rim: H.rim, t });
    });
    home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  } else {
    const cam = camMove(t - tIt, info.dur - tIt, { z: [1.08, 1.14], x: [340, 360], y: [-40, -50] });
    const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 1 }), p = H.pos;
    layer(g, cam, 1, (g) => {
      actor(g, 'HERO', { x: p.fridgeX - 420, y: H.GY + 10, s, facing: 1, pose: idle(POSES.relaxed, t, 2), expr: exprAt(t, [[0, 'worried'], [tIt + 0.5, 'sad']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(0.5, -1), rim: H.rim, t });
      const sp = prog(t, tIt + 0.1, tIt + 0.7); if (sp > 0) FX.sparkle(g, p.cerealX + 40, p.cerealY - 110, 30 * Math.sin(sp * Math.PI), '#ffe8b0', 0.95);
      const tg = wt(info, "isn't", 1.91); if (t > tg) { const u = clamp((t - tg) / 0.8); g.strokeStyle = alpha('#fff1dc', 0.8 * (1 - u)); g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(p.fridgeX - 390, H.GY - 160, 30 + i * 20 + u * 30, -0.6, 0.6); g.stroke(); } }
    });
    home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  }
} });
