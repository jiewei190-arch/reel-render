// C_s062_s068_shins.js — ep 3 batch C: RULE 3, shin splints, the stress fracture, four in ten runners.
//   s062 rule: RULE 3 "EVERY STEP ADDS UP. SO DOES THE DAMAGE." over the dimmed autumn path; a red shin-glow line pulses on 'bone'
//   s063 bp: FIG 7 - SHIN: tibia line art, the shin-splint glow on 'splints'; a footstrike counter races on 'overuse'
//   s064 insert: the wall calendar: every square RUN, more RUN stickers pile on on 'much', the one REST sticker peels off on 'little'
//   s065 med: autumn path, a slight limp, each footstrike sends a red ring up the shin; on 'fracture' the camera punches in on the shin
//   s066 insert: macro on the tibia: the hairline crack draws on on 'crack', magnifier ring + 'TINY CRACK'
//   s067 wide: ten runners on the autumn path, HERO among them, a dashed 'OVER TIME' arrow along the path
//   s068 med: four runners pull up one after another from 'four', red flash each, gold '4 / 10' on 'ten'; HERO glances back
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { park, parkFg } from '../sets/park.js';
import { home3 } from '../sets/home3.js';
import { runCycle, trainee, repCounter } from '../sets/train.js';
import { shin } from '../sets/body.js';
import { board, label } from '../sets/bp.js';
import { ruleCard, chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { jumpShake } from '../sets/jump.js';
import { wt, push, goldPop, runner } from './C_lib.js';

const toW = (o, q) => [o.x + q[0] * o.s * (o.facing ?? 1), o.y + q[1] * o.s];

registerShot('s062', { draw(g, t, info) {
  const tBone = wt(info, 'bone', 2.75), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-30, 30] });
  ruleCard(g, t, info, { n: 3, title: 'EVERY STEP ADDS UP. SO DOES THE DAMAGE.', bg: (g, t) => { blurLayer(g, 8, (g) => park(g, t, cam, { season: 'autumn', mood: 'day' }), null, 1); veil(g, '#140f1c', 0.25); parkFg(g, t, cam, { season: 'autumn' }); } });
  const k = ease.out(prog(t, tBone - 0.1, tBone + 0.15)); if (k > 0) { const U = S().ui, y = E.H - 70, pulse = 0.7 + 0.3 * Math.sin((t - tBone) * 14);
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i <= 12; i++) glow(g, lerp(E.W * 0.2, E.W * 0.8, i / 12), y, 90, U.accent, 0.18 * k * pulse); g.restore(); seg(g, [[E.W * 0.2, y], [lerp(E.W * 0.2, E.W * 0.8, k), y]], 7, alpha(U.accent, 0.95)); }
} });

registerShot('s063', { draw(g, t, info) {
  const tSp = wt(info, 'splints', 1.13), tOver = wt(info, 'overuse', 2.49);
  board(g, t, { title: 'FIG 7 - SHIN', fig: 'OVERUSE INJURY' });
  push(g, t, info.dur, () => {
    const Sh = shin(g, t, { x: E.W * 0.38, y: E.H * 0.53, h: 820, k: ease.out(prog(t, 0.05, 1.0)), splint: ease.out(prog(t, tSp - 0.1, tSp + 0.5)) });
    label(g, t, { at: Sh.tibia, to: [E.W * 0.62, E.H * 0.24], str: 'tibia', start: 0.6 });
    label(g, t, { at: Sh.splint, to: [E.W * 0.62, E.H * 0.5], str: 'SHIN SPLINTS', start: tSp });
  });
  if (t > tOver - 0.1) { const n = Math.max(0, Math.floor((t - tOver + 0.1) * 26)), since = ((t - tOver) * 26) % 1 / 26; repCounter(g, n, { x: E.W * 0.78, y: E.H * 0.74, size: 110, since, label: 'FOOTSTRIKES' }); }
  FX.dust(g, t, { count: 14, color: '#bcd4ff', a: 0.1, seed: 31 });
} });

// a sticker on the calendar (RUN in gold, REST in green)
function sticker(g, x, y, w, h, str, col, rot = 0, a = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a; rr(g, -w / 2, -h / 2, w, h, 8); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke(); text(g, str, 0, 2, { size: h * 0.5, color: '#1a1420', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); }
registerShot('s064', { draw(g, t, info) {
  const tMuch = wt(info, 'much', 0.29), tLit = wt(info, 'little', 1.15), U = S().ui;
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-20, 20] });
  blurLayer(g, 10, (g) => home3(g, t, { z: 1.6, x: 160, y: -200 }, { room: 'bedroom', mood: 'day', marks: 0 }), null, 1); veil(g, '#1a1020', 0.25);
  push(g, t, info.dur, () => {
    const x0 = E.W * 0.17, y0 = E.H * 0.1, w = E.W * 0.66, h = E.H * 0.8, cw = w / 7, ch = (h - 150) / 5;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0 + 14, y0 + 18, w, h); g.fillStyle = '#fbf6ea'; g.fillRect(x0, y0, w, h); g.fillStyle = '#d4262e'; g.fillRect(x0, y0, w, 100);
    text(g, 'OCTOBER', x0 + w / 2, y0 + 52, { size: 56, color: '#fff', font: FONTS.title, weight: 700, spacing: 6 });
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => text(g, d, x0 + cw * (i + 0.5), y0 + 126, { size: 28, color: '#5a5262', font: FONTS.ui, weight: 900 }));
    const r = rng(4), restCell = 17;
    for (let i = 0; i < 35; i++) { const cx = x0 + cw * (i % 7 + 0.5), cy = y0 + 150 + ch * (Math.floor(i / 7) + 0.5); g.strokeStyle = '#d8d0c0'; g.lineWidth = 2; g.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch); text(g, String(i + 1), cx - cw / 2 + 18, cy - ch / 2 + 20, { size: 20, color: '#8a8294', font: FONTS.ui, weight: 900 });
      if (i === restCell) { // the one REST sticker peels off on 'little' and flutters down
        const u = prog(t, tLit, tLit + 1.2); const fx = cx + Math.sin(u * 8) * 60 * u, fy = cy + 8 + u * u * 700; sticker(g, fx, fy, cw * 0.74, ch * 0.5, 'REST', '#5fd39a', -0.08 + Math.sin(u * 10) * 0.6 * u, 1 - clamp((u - 0.8) * 5));
        continue; }
      sticker(g, cx, cy + 8, cw * 0.74, ch * 0.5, 'RUN', U.gold, (r() - 0.5) * 0.14);
      // extra RUN stickers pile on top on 'much'
      for (let j = 0; j < 2; j++) { const tp = tMuch + (i % 9) * 0.04 + j * 0.18, p = ease.outBack(prog(t, tp, tp + 0.2)); if (p <= 0.01) continue; g.save(); g.translate(cx + (r() - 0.5) * 20, cy + 8 + (r() - 0.5) * 14); g.scale(p, p); sticker(g, 0, 0, cw * 0.74, ch * 0.5, 'RUN', shade(U.gold, -0.06 * j), (r() - 0.5) * 0.4); g.restore(); }
    }
    seg(g, [[x0 + w / 2 - 80, y0 - 10], [x0 + w / 2 + 80, y0 - 10]], 10, '#5a5262');
  });
  FX.dust(g, t, { count: 12, color: '#fff4dc', a: 0.12, seed: 4 });
} });

registerShot('s065', { draw(g, t, info) {
  const tPound = wt(info, 'pounding', 0.35), tFr = wt(info, 'fracture', 2.01), s = 1.9, CX = E.W / 2, v = 250, hx = CX - 200 + v * t;
  const R = runCycle(t, 0, { mode: 'limp', x: hx, s, facing: 1 }), punch = ease.out(prog(t, tFr - 0.1, tFr + 0.25));
  const o = { x: hx, y: 0, s, facing: 1 }, P0 = { GY: E.H * 0.8 }, shinW = toW({ ...o, y: P0.GY + 20 }, [(R.pose.kF[0] + R.pose.fF[0]) / 2, (R.pose.kF[1] + R.pose.fF[1]) / 2]);
  let cam = { z: lerp(1.08, 1.9, punch), x: hx - CX + 120 + Math.sin(t * 0.6) * 8, y: lerp(-60, shinW[1] - E.H / 2 + 0, punch) };
  cam.x = lerp(cam.x, shinW[0] - E.W / 2, punch); const [dx, dy] = jumpShake(t, tFr, 6); cam.x += dx; cam.y += dy;
  const P = park(g, t, cam, { season: 'autumn', mood: 'day', rain: 0, puddles: true, km: 6 });
  // footfall flash: phase is locked to x; a new footfall every half cycle
  const ph = R.phase / Math.PI, frac = ph - Math.floor(ph), flash = Math.exp(-frac * 7);
  layer(g, cam, 1, (g) => {
    trainee(g, 'HERO', R, { x: hx, y: P.GY + 20, s, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0.2 + 0.4 * punch), expr: exprAt(t, [[0, 'determined'], [tPound + 0.1, 'nervous'], [tFr, 'scared']]), sweat: 0.5, breath: 1.3 });
    const p = R.pose, front = Math.floor(ph) % 2 === 0, k1 = toW({ ...o, y: P.GY + 20 }, front ? p.kF : p.kB), f1 = toW({ ...o, y: P.GY + 20 }, front ? p.fF : p.fB);
    if (t > tPound - 0.2) { const U = S().ui; for (let i = 0; i < 3; i++) { const u = clamp(frac * 2 - i * 0.25); if (u <= 0 || u >= 1) continue; const yy = lerp(f1[1], k1[1], u), xx = lerp(f1[0], k1[0], u); g.strokeStyle = alpha(U.accent, 0.9 * (1 - u)); g.lineWidth = 4; g.beginPath(); g.ellipse(xx, yy, 26 + u * 20, 10 + u * 6, 0, 0, 7); g.stroke(); }
      glow(g, (k1[0] + f1[0]) / 2, (k1[1] + f1[1]) / 2, 80, U.accent, 0.5 * flash); }
  });
  parkFg(g, t, cam, { season: 'autumn' }); atmos(g, t, cam, { color: P.M.key });
} });

registerShot('s066', { draw(g, t, info) {
  const tCrack = wt(info, 'crack', 0.57), U = S().ui;
  board(g, t, { title: 'FIG 8 - STRESS FRACTURE', fig: 'A TINY CRACK IN THE BONE' });
  push(g, t, info.dur, () => {
    // zoomed in on the mid-shaft: the leg drawn big so the crack sits near the centre
    const Sh = shin(g, t, { x: E.W * 0.46, y: E.H * 0.5 - 380, h: 1700, k: 1, splint: 0.5, fracture: ease.out(prog(t, tCrack - 0.05, tCrack + 0.35)) });
    const [mx, my] = Sh.crack, mk = ease.outBack(prog(t, tCrack + 0.1, tCrack + 0.45));
    if (mk > 0.01) { g.save(); g.translate(mx, my); g.scale(mk, mk); ring(g, 0, 0, 150, 10, U.cream); ring(g, 0, 0, 160, 3, alpha(U.gold, 0.7)); seg(g, [[106, 106], [220, 220]], 22, U.cream); g.restore(); }
    label(g, t, { at: [mx + 60, my - 20], to: [E.W * 0.72, E.H * 0.26], str: 'TINY CRACK', start: tCrack + 0.3 });
  });
  FX.dust(g, t, { count: 14, color: '#bcd4ff', a: 0.1, seed: 31 });
} });

// the running group: 10 runners (index 4 is the HERO) spread along the path, each with its own pace offset
const GROUP = [-760, -560, -380, -220, 0, 180, 340, 520, 700, 880];
function group(g, t, cam, P, gx, o = {}) {
  const r = rng(12), stops = o.stops || {};
  GROUP.forEach((dx, i) => { const lane = (i % 3) * 22, s = i === 4 ? 1.75 : 1.55 + (i % 3) * 0.06, stopT = stops[i];
    let x = gx + dx + Math.sin(t * 0.7 + i) * 20; if (stopT != null && t > stopT) x = gx + dx - (t - stopT) * (o.v ?? 300) + Math.sin(stopT * 0.7 + i) * 20;
    const stopped = stopT != null && t > stopT, y = P.GY + 4 + lane;
    if (i === 4) { trainee(g, 'HERO', runCycle(t, 0, { mode: 'run', x, s, facing: 1 }), { x, y, s, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3.1, 2), look: o.heroLook || lookToward(1, 0), expr: o.heroExpr || 'determined', sweat: 0.3 }); return; }
    const pose = stopped ? idle(EXTRA.wince, t, i) : runCycle(t, 0, { mode: 'jog', x: x * (1 + i * 0.01), s, facing: 1 }).pose;
    actor(g, runner(i), { x, y, s, facing: 1, pose, expr: stopped ? 'sad' : ['determined', 'neutral', 'smile'][i % 3], blink: blinkFlag(t, 2.8 + i * 0.2, i), look: lookToward(1, stopped ? 0.6 : 0), rim: P.rim, t });
    if (stopped) { const u = t - stopT; if (u < 0.5) glow(g, x + 10 * s, y - 60 * s, 90, S().ui.accent, 0.6 * (1 - u / 0.5)); } });
}

registerShot('s067', { draw(g, t, info) {
  const tOver = wt(info, 'over', 1.75), v = 300, CX = E.W / 2, gx = CX + v * t;
  const cam = { z: 0.82, x: gx - CX + 60 + Math.sin(t * 0.5) * 10, y: -150 };
  const P = park(g, t, cam, { season: 'autumn', mood: 'day', km: 5 });
  layer(g, cam, 1, (g) => {
    group(g, t, cam, P, gx);
    // the dashed OVER TIME arrow along the path
    const k = ease.inOut(prog(t, tOver - 0.4, tOver + 0.4)); if (k > 0) { const U = S().ui, y = P.GY + 140, x0 = gx - 900, x1 = lerp(x0, gx + 1100, k); g.save(); g.setLineDash([24, 18]); seg(g, [[x0, y], [x1, y]], 7, U.gold); g.restore(); poly(g, [[x1, y - 22], [x1 + 40, y], [x1, y + 22]], U.gold);
      text(g, 'OVER TIME', (x0 + x1) / 2, y + 54, { size: 44, color: U.gold, font: FONTS.ui, weight: 900, spacing: 4, stroke: 8, strokeColor: '#140f1c', alpha: k }); }
  });
  parkFg(g, t, cam, { season: 'autumn' }); atmos(g, t, cam, { color: P.M.key });
} });

registerShot('s068', { draw(g, t, info) {
  const tFour = wt(info, 'four', 0.35), tTen = wt(info, 'ten', 0.95), v = 300, CX = E.W / 2, gx = CX + 300 + v * t;
  const cam = { z: 1.12, x: gx - CX + 20 + Math.sin(t * 0.5) * 10, y: -40 };
  const P = park(g, t, cam, { season: 'autumn', mood: 'day', km: 6 });
  const stops = { 8: tFour, 6: tFour + 0.22, 9: tFour + 0.44, 7: tFour + 0.66 };
  layer(g, cam, 1, (g) => group(g, t, cam, P, gx, { stops, v, heroLook: t > tFour + 0.3 ? lookToward(-1, 0.1) : lookToward(1, 0), heroExpr: t > tFour + 0.3 ? 'worried' : 'determined' }));
  parkFg(g, t, cam, { season: 'autumn' }); atmos(g, t, cam, { color: P.M.key });
  goldPop(g, t, '4 / 10', tTen, E.W * 0.5, E.H * 0.18, 130);
} });
