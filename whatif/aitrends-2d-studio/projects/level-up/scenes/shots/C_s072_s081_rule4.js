// C_s072_s081_rule4.js — ep 5 batch C part 3: RULE 4 card + FIG 5 (~25% movement, ~75% heat, warm skin -> dew point -> cloud,
// "Your aura is steam"), the surprise (1,500 kg x 9.81 x 0.5 m = ~7,360 J; / 25% = ~29,400 J = ~7 kcal = 1 bite of a ~95 kcal apple),
// all night adds up, ~10,000 kcal/day (has said, in training; plain text only, no likeness), most adults ~2,000 kcal.
// Numbers as sources.md (shots.json scene texts). LEGAL: STYLE.md DON'T list; no photo or figure of the real athlete.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { parkFg } from '../sets/park.js';
import { board, label, draw } from '../sets/bp.js';
import { ruleCard, chip } from '../sets/hud.js';
import { steamAura, P5 } from '../sets/fx5.js';
import { blinkFlag, exprAt, idle, lookToward, camMove } from '../sets/acting.js';
import { push, goldPop, fade, cTxt, hero, benchProp, ringPhone, night, post, bpFig, bpCar, bpArrow } from './C_lib.js';

const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 72 });
const RIMN = { color: P5.cyan, dir: [0.8, -0.4] };
const mixPose = (a, b, k) => { const o = {}; for (const key in a) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)]; return o; };
function benchSquat(k) { const p = mixPose(POSES.stand, POSES.crouch, k); return { ...p, eF: [p.sh[0] + 34, p.sh[1] - 2], hF: [p.sh[0] + 22, p.sh[1] - 36], eB: [p.sh[0] - 30, p.sh[1] - 2], hB: [p.sh[0] - 18, p.sh[1] - 36] }; }
// cream board icons
function sandwich(g, x, y, s = 1) { const c = S().ui.cream; g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.moveTo(-90, 40); g.lineTo(90, 40); g.lineTo(0, -60); g.closePath(); g.stroke(); seg(g, [[-60, 16], [60, 16]], 4, alpha(c, 0.7)); seg(g, [[-40, -6], [40, -6]], 4, alpha(c, 0.7)); g.restore(); }
function arm(g, x, y, s = 1, heat = 0, t = 0) { const c = S().ui.cream; g.save(); g.translate(x, y); g.scale(s, s); draw(g, [[-120, 60], [0, 60], [40, -60]], 1, { w: 8, color: c }); g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.ellipse(-20, 30, 50, 34, -0.3, Math.PI, Math.PI * 2); g.stroke(); circle(g, 46, -76, 24, c);
  for (let i = 0; i < 3 * (heat > 0 ? 1 : 0); i++) { const u = (t * 0.6 + i / 3) % 1; g.strokeStyle = alpha(c, heat * (1 - u)); g.lineWidth = 4; g.beginPath(); for (let j = 0; j <= 10; j++) { const yy = -30 - u * 140 - j * 8, xx = -40 + i * 40 + Math.sin(j * 0.9 + t * 4) * 8; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } g.restore(); }
function pie(g, x, y, r, q, h) {   // q = movement share drawn (0..0.25), h = heat share drawn (0..0.75)
  const U = S().ui; ring(g, x, y, r, 5, U.cream); const a0 = -Math.PI / 2;
  if (q > 0) { g.fillStyle = alpha(U.gold, 0.85); g.beginPath(); g.moveTo(x, y); g.arc(x, y, r - 4, a0, a0 + q * Math.PI * 2); g.closePath(); g.fill(); }
  if (h > 0) { g.fillStyle = alpha('#ff8a4a', 0.8); g.beginPath(); g.moveTo(x, y); g.arc(x, y, r - 4, a0 + 0.25 * Math.PI * 2, a0 + (0.25 + h) * Math.PI * 2); g.closePath(); g.fill(); }
}
function apple(g, x, y, s = 1, bite = 0) { const c = S().ui.cream; g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -60); g.bezierCurveTo(60, -100, 120, -30, 90, 40); g.bezierCurveTo(70, 100, 20, 100, 0, 80); g.bezierCurveTo(-20, 100, -70, 100, -90, 40); g.bezierCurveTo(-120, -30, -60, -100, 0, -60); g.stroke(); seg(g, [[0, -60], [6, -96]], 5, c); g.beginPath(); g.ellipse(26, -92, 20, 9, -0.4, 0, 7); g.stroke();
  if (bite > 0) { g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(96, 0, 34 * bite, 0, 7); g.arc(84, 40, 30 * bite, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.arc(96, 0, 34 * bite, Math.PI * 0.6, Math.PI * 1.4); g.stroke(); g.beginPath(); g.arc(84, 40, 30 * bite, Math.PI * 0.6, Math.PI * 1.4); g.stroke(); }
  g.restore(); }
function plate(g, x, y, s = 1, food = 1, seed = 0) { const c = S().ui.cream; g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 0, 90, 26, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(0, -2, 60, 16, 0, 0, 7); g.stroke();
  if (food) { const k = seed % 3; g.beginPath(); if (k === 0) { g.ellipse(-10, -20, 40, 20, 0, Math.PI, 0); } else if (k === 1) { g.moveTo(-40, -6); g.lineTo(0, -50); g.lineTo(40, -6); } else { for (let i = 0; i < 3; i++) g.arc(-24 + i * 24, -18, 14, 0, 7); } g.stroke(); } g.restore(); }

// s072 RULE 4 card over the dimmed night park with the hero's steam aura rising
registerShot('s072', { draw(g, t, info) {
  const cam = { z: 1.06, x: 0, y: -60 };
  ruleCard(g, t, info, { n: 4, title: 'MUSCLES RUN ON FOOD, AND THEY GET HOT.', bg: (g, t) => { blurLayer(g, 8, (g) => { const P = night(g, t, cam, { bench: false }); layer(g, cam, 1, (g) => { hero(g, { x: E.W * 0.5, y: P.GY + 10, s: 1.9, facing: 1, pose: POSES.relaxed, expr: 'neutral', t, rim: RIMN }); steamAura(g, t, { x: E.W * 0.5, y: P.GY + 10, h: 390, k: 1 }); }); }, null, 1); veil(g, '#0b0f1a', 0.3); } });
} });

// s073-s074 FIG 5: food in, heat out (~25% movement, ~75% heat)
function foodBoard(g, t, info, q, h, heat) {
  board(g, t, { title: 'FIG 5 - FOOD IN, HEAT OUT', fig: 'ABOUT 25%' });
  push(g, t, info.dur, () => {
    sandwich(g, E.W * 0.17, E.H * 0.5, 1.2); bpArrow(g, E.W * 0.25, E.H * 0.5, E.W * 0.36, E.H * 0.5, 1, S().ui.cream, 8);
    arm(g, E.W * 0.47, E.H * 0.56, 1.1, heat, t); pie(g, E.W * 0.74, E.H * 0.5, 190, q, h);
  });
  air(g, t);
}
registerShot('s073', { draw(g, t, info) { const q = 0.25 * ease.out(prog(t, 1.9, 2.4)); foodBoard(g, t, info, q, 0, 0); goldPop(g, t, 'MOVEMENT ~25%', 2.23, E.W * 0.74, E.H * 0.2, 60); } });
registerShot('s074', { draw(g, t, info) { const h = 0.75 * ease.inOut(prog(t, 0.38, 1.3)); foodBoard(g, t, info, 0.25, h, prog(t, 0.6, 1.2)); goldPop(g, t, 'MOVEMENT ~25%', -1, E.W * 0.74, E.H * 0.2, 60); goldPop(g, t, 'HEAT ~75%', 1.24, E.W * 0.74, E.H * 0.82, 70, { color: '#ff9a5a' }); } });

// s075 warm skin, rising moisture (a skin cross-section + thermometer)
function skinBoard(g, t, info, cloud) {
  board(g, t, { title: 'FIG 5 - WHY YOU STEAM', fig: 'WARM SKIN, COLD AIR' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const y0 = E.H * 0.72; for (let i = 0; i < 3; i++) { g.strokeStyle = alpha(U.cream, 1 - i * 0.25); g.lineWidth = 6 - i; g.beginPath(); for (let x = E.W * 0.08; x <= E.W * 0.78; x += 20) { const yy = y0 + i * 40 + Math.sin(x * 0.02 + i) * 6; x === E.W * 0.08 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
    cTxt(g, 'SKIN', E.W * 0.1, y0 + 120, { align: 'left' });
    const hk = ease.out(prog(t, 0.48, 1.0)); for (let i = 0; i < 5; i++) bpArrow(g, E.W * (0.16 + i * 0.13), y0 + 110, E.W * (0.16 + i * 0.13), y0 + 110 - 90 * hk, hk, U.gold, 7);
    const dk = prog(t, 2.0, 2.4), dew = E.H * 0.34; for (let i = 0; i < 26; i++) { const u = ((t * 0.35 + i / 26) % 1), x = E.W * 0.1 + (i * 97) % (E.W * 0.66), y = lerp(y0 - 20, dew, u); if (dk <= 0) break; if (cloud > 0 && y < dew + 30) continue; circle(g, x, y, 5, alpha(U.cream, 0.8 * dk)); }
    g.save(); g.setLineDash([14, 10]); seg(g, [[E.W * 0.08, dew], [E.W * 0.78, dew]], 4, alpha(U.cream, 0.6)); g.restore(); cTxt(g, 'dew point', E.W * 0.1, dew - 30, { align: 'left', size: 26 });
    if (cloud > 0) for (let i = 0; i < 7; i++) { const x = E.W * 0.14 + i * 140, p = ease.outBack(clamp(cloud * 2 - i * 0.12)); if (p > 0) { g.save(); g.translate(x, dew - 50); g.scale(p, p); g.strokeStyle = U.cream; g.lineWidth = 5; g.beginPath(); g.arc(-26, 0, 26, Math.PI * 0.5, Math.PI * 1.5); g.arc(0, -16, 30, Math.PI, 0); g.arc(28, 0, 24, Math.PI * 1.5, Math.PI * 0.5); g.closePath(); g.stroke(); g.restore(); } }
    const tx = E.W * 0.88, tt = E.H * 0.22, tb = E.H * 0.78; rr(g, tx - 22, tt, 44, tb - tt, 22); g.strokeStyle = U.cream; g.lineWidth = 5; g.stroke(); circle(g, tx, tb + 10, 34, alpha(U.gold, 0.8)); rr(g, tx - 10, lerp(tb, tt + 40, 0.75), 20, tb - lerp(tb, tt + 40, 0.75), 10); g.fillStyle = alpha(U.gold, 0.8); g.fill();
    cTxt(g, 'cold', tx - 50, tt + 30, { align: 'right', size: 28 }); cTxt(g, 'warm', tx - 50, tb - 20, { align: 'right', size: 28, color: U.gold });
  });
  air(g, t);
}
registerShot('s075', { draw(g, t, info) { skinBoard(g, t, info, 0); } });

// s076 the dots hit the dew point and puff into cloud; then the night park: HERO steaming hard, MINA + DEV breathing small puffs; DEV wipes his lens
registerShot('s076', { draw(g, t, info) {
  if (t < 2.65) { skinBoard(g, t + 2.6, info, ease.out(prog(t, 0.65, 1.6))); if (t > 2.35) { g.fillStyle = alpha('#0b0f1a', prog(t, 2.35, 2.65)); g.fillRect(0, 0, E.W, E.H); } return; }
  const lt = t - 2.65, cam = camMove(t, info.dur, { z: [1.05, 1.08], y: [-50, -50], drift: 0.3 }), P = night(g, t, cam, { bench: false }), GY = P.GY;
  layer(g, cam, 1, (g) => {
    const hx = E.W * 0.5; hero(g, { x: hx, y: GY + 10, s: 1.9, facing: 1, pose: idle(POSES.relaxed, t, 2), expr: 'happy', blink: blinkFlag(t, 3.2, 2), look: [0.4, 0], rim: RIMN, t, trimGlow: 1 }); steamAura(g, t, { x: hx, y: GY + 10, h: 390, k: 1, cyan: 0.85, amber: 0.35 });
    actor(g, 'MINA', { x: E.W * 0.22, y: GY + 20, s: 2.0, facing: 1, pose: idle(POSES.stand, t, 1), expr: 'surprised', blink: blinkFlag(t, 2.9, 1), look: lookToward(1, -0.2), rim: { color: P5.sodium, dir: [-0.8, -0.4] }, t });
    const wipe = t > 3.25 ? Math.sin((t - 3.25) * 14) * 16 : 0, dx = E.W * 0.78;
    actor(g, 'DEV', { x: dx, y: GY + 20, s: 1.9, facing: -1, pose: { ...POSES.phone, eB: [-6, -150], hB: [30 + wipe, -176] }, expr: 'happy', blink: blinkFlag(t, 3.3, 2), look: lookToward(-1, 0), rim: { color: P5.sodium, dir: [0.8, -0.4] }, t });
    ringPhone(g, t, dx - 40 * 1.9, GY + 20 - 172 * 1.9, 1.1, 1);
    for (const [x, y, sd] of [[E.W * 0.22 + 40, GY - 260, 1], [dx - 60, GY - 370, 2]]) { const u = ((lt * 0.9 + sd * 0.4) % 1); glow(g, x + (sd === 1 ? 1 : -1) * u * 60, y - u * 30, 24 + u * 24, '#e8f2ff', 0.3 * (1 - u)); }
    if (lt < 0.4) { g.fillStyle = alpha('#0b0f1a', 1 - lt / 0.4); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
  });
  parkFg(g, t, cam, { season: 'autumn' }); post(g);
} });

// s077 here's a surprise: lifting a car half a metre, once = ~7,360 J
registerShot('s077', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - THE ENERGY BILL', fig: 'ONE LIFT' }); const U = S().ui;
  push(g, t, info.dur, () => {
    const fx = E.W * 0.32, gy = E.H * 0.82, up = ease.inOut(prog(t, 1.2, 2.5)), F = bpFig(g, fx, gy, 0.95, 1, { arms: 0.6 + 0.4 * up }); bpCar(g, fx, F.hands[1] - 8, 0.8, 1);
    seg(g, [[E.W * 0.08, gy], [E.W * 0.6, gy]], 5, U.cream);
    if (t > 2.5) { const bx = fx + 260, y1 = F.hands[1] - 8, y0 = y1 + 120; seg(g, [[bx, y0], [bx, y1]], 5, U.gold); seg(g, [[bx - 20, y0], [bx + 20, y0]], 5, U.gold); seg(g, [[bx - 20, y1], [bx + 20, y1]], 5, U.gold); }
    goldPop(g, t, '0.5 m', 2.63, fx + 360, F.hands[1] + 50, 60); goldPop(g, t, 'ONCE', 2.83, E.W * 0.48, E.H * 0.24, 80, { rot: -0.1 });
    fade(g, prog(t, 0.4, 0.9), () => cTxt(g, '1,500 kg x 9.81 x 0.5 m', E.W * 0.76, E.H * 0.45, { size: 40 })); goldPop(g, t, '= ~7,360 J', 1.0, E.W * 0.76, E.H * 0.56, 70);
  });
  air(g, t);
} });

// s078 ... uses about the food energy of one bite of an apple (~7,360 J / 25% = ~29,400 J = ~7 kcal; apple ~95 kcal)
registerShot('s078', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - THE ENERGY BILL', fig: 'ONE BITE' }); const U = S().ui;
  push(g, t, info.dur, () => {
    fade(g, prog(t, 0.3, 0.8), () => cTxt(g, '~7,360 J / 25% =', E.W * 0.3, E.H * 0.36, { size: 44 })); goldPop(g, t, '~29,400 J', 0.67, E.W * 0.3, E.H * 0.48, 74); goldPop(g, t, '= ~7 kcal', 1.4, E.W * 0.3, E.H * 0.62, 74);
    const ap = ease.outBack(prog(t, 2.0, 2.4)); if (ap > 0) { g.save(); g.translate(E.W * 0.7, E.H * 0.52); g.scale(ap, ap); apple(g, 0, 0, 1.6, ease.out(prog(t, 2.47, 2.7))); g.restore(); cTxt(g, 'apple ~95 kcal', E.W * 0.7, E.H * 0.8, { alpha: ap }); }
    goldPop(g, t, '~7 kcal = 1 bite', 3.09, E.W * 0.7, E.H * 0.2, 64);
  });
  air(g, t);
} });

// s079 doing it all night adds up: bench reps + an apple tally
registerShot('s079', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.1, 1.12], x: [-420, -430], y: [-80, -80], drift: 0.3 }), P = night(g, t, cam, { bench: false }), GY = P.GY;
  const k = 0.5 - 0.5 * Math.cos(t * 2.6 * Math.PI), pose = benchSquat(k), hx = P.pos.benchX;
  layer(g, cam, 1, (g) => { hero(g, { x: hx, y: GY + 10, s: 1.9, facing: 1, pose, expr: 'determined', blink: blinkFlag(t, 3, 2), look: [1, 0], rim: RIMN, t, trimGlow: 1 }); benchProp(g, hx, GY + 10 + (pose.hF[1] - 6) * 1.9, 0.85); steamAura(g, t, { x: hx, y: GY + 10, h: 390, k: 0.9 }); });
  parkFg(g, t, cam, { season: 'autumn' }); post(g);
  const n = 2 + (t > 0.55 ? 3 : 0) + (t > 1.01 ? 4 : 0) + Math.floor(t * 3), U = S().ui;
  rr(g, E.W * 0.62, E.H * 0.05, 640, 150, 20); g.fillStyle = 'rgba(11,19,36,.85)'; g.fill(); g.strokeStyle = U.cream; g.lineWidth = 3; g.stroke();
  for (let i = 0; i < Math.min(n, 12); i++) { g.save(); g.translate(E.W * 0.62 + 50 + i * 48, E.H * 0.05 + 75); g.scale(0.22, 0.22); apple(g, 0, 0, 1, 0.6); g.restore(); }
} });

// s080 ~10,000 kcal a day in training (has said; plain text only, no likeness)
function feastTable(g, t, k) {
  const U = S().ui, y = E.H * 0.72; draw(g, [[E.W * 0.06, y], [E.W * 0.6, y]], 1, { w: 6, color: U.cream }); for (const lx of [E.W * 0.08, E.W * 0.58]) seg(g, [[lx, y], [lx, y + 170]], 6, U.cream);
  const n = Math.round(14 * k); for (let i = 0; i < n; i++) { const row = Math.floor(i / 5), x = E.W * 0.12 + (i % 5) * 130 + row * 50, yy = y - 30 - row * 70; plate(g, x, yy, 0.75, 1, i); }
}
registerShot('s080', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - ALL DAY', fig: 'IN TRAINING' });
  push(g, t, info.dur, () => {
    feastTable(g, t, ease.out(prog(t, 0.1, 1.6)));
    const v = Math.round(lerp(0, 10000, ease.out(prog(t, 1.36, 2.54))) / 100) * 100; if (t > 1.36) goldPop(g, t, `~${v.toLocaleString('en-US')} kcal/day`, 1.36, E.W * 0.76, E.H * 0.42, 70);
    chip(g, t, { str: 'HAFÞÓR (has said, in training)', at: 0.68, x: E.W * 0.76, y: E.H * 0.24, tone: 'blue', dur: 99 });
  });
  air(g, t);
} });

// s081 most adults need about 2,000 (a single plate beside the big table)
registerShot('s081', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - ALL DAY', fig: 'MOST ADULTS' }); const U = S().ui;
  push(g, t, info.dur, () => {
    feastTable(g, t, 1); goldPop(g, t, '~10,000 kcal/day', -1, E.W * 0.32, E.H * 0.24, 56);
    const sx = lerp(E.W * 1.1, E.W * 0.8, ease.out(prog(t, 0.12, 0.7))); seg(g, [[sx - 140, E.H * 0.72], [sx + 140, E.H * 0.72]], 6, U.cream); plate(g, sx, E.H * 0.72 - 30, 0.75, 1, 2);
    cTxt(g, 'MOST ADULTS', sx, E.H * 0.82, { alpha: prog(t, 0.4, 0.8) }); goldPop(g, t, '~2,000 kcal', 1.86, sx, E.H * 0.5, 70);
  });
  air(g, t);
} });
