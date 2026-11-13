// D_s082_s089_hormones.js — ep 3 batch D: the DHT trial (FIG 12), the winter group run, Dev's beanie, the "no study" stamp,
// the shock to the body (FIG 13), losing weight fast on the scale, telogen effluvium.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, poly, text, measure, FONTS, rng, linGrad, shade } from '/engine/core.js';
import { POSES, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor } from '../sets/actors.js';
import { board, label } from '../sets/bp.js';
import { dht, follicle, hairCycle } from '../sets/body.js';
import { park, parkFg } from '../sets/park.js';
import { home3, home3Fg } from '../sets/home3.js';
import { breathPuff } from '../sets/train.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { shotWord, push, jogPose, EXTRAS, bathScale } from './D_lib.js';

const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 31 });
const MONTHS = 'JFMAMJJASOND';
// 12-month calendar strip that draws on box by box, with a gold "1 YEAR" bracket
function yearStrip(g, t, x, y, t0) { const U = S().ui, bw = 62; for (let i = 0; i < 12; i++) { const k = ease.outBack(prog(t, t0 + i * 0.06, t0 + i * 0.06 + 0.25)); if (k <= 0.01) continue;
    g.save(); g.translate(x + i * (bw + 8) + bw / 2, y); g.scale(k, k); rr(g, -bw / 2, -40, bw, 80, 8); g.strokeStyle = U.blueprint; g.lineWidth = 3; g.stroke(); text(g, MONTHS[i], 0, 2, { size: 30, color: U.cream, font: FONTS.ui, weight: 900 }); g.restore(); }
  const b = ease.out(prog(t, t0 + 0.6, t0 + 1.1)); if (b > 0) { const w = 12 * (bw + 8) - 8; seg(g, [[x, y + 60], [x, y + 74], [x + w * b, y + 74]], 4, U.gold); if (b >= 1) seg(g, [[x + w, y + 74], [x + w, y + 60]], 4, U.gold);
    const p = ease.outBack(prog(t, t0 + 0.9, t0 + 1.3)); if (p > 0.02) { g.save(); g.translate(x + w / 2, y + 120); g.scale(p, p); text(g, '1 YEAR', 0, 0, { size: 52, color: U.gold, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(U.gold, 0.5) }); g.restore(); } } }

// s082 — FIG 12 HORMONES: "Exercise can nudge hormones. In one year-long trial,"  the DHT molecule floats in, nudged up a notch; a 12-month strip
registerShot('s082', { draw(g, t, info) {
  const st = info.shot.start, tNudge = shotWord('nudge', st, 0.43), tYear = shotWord('year', st, 2.35);
  board(g, t, { title: 'FIG 12 - HORMONES', fig: 'EXERCISE CAN NUDGE THEM' });
  push(g, t, info.dur, () => {
    const fl = ease.out(prog(t, 0, 0.8)), nud = ease.outBack(prog(t, tNudge, tNudge + 0.4)), mx = lerp(E.W * 0.12, E.W * 0.26, fl), my = E.H * 0.5 - 50 * nud + Math.sin(t * 1.4) * 6;
    const D = dht(g, t, { x: mx, y: my, r: 70, k: ease.out(prog(t, 0.05, 1.2)), glow: 0.3 + 0.4 * nud });
    if (nud > 0) { const U = S().ui; g.save(); g.globalAlpha *= clamp(nud); seg(g, [[mx + 230, my + 140], [mx + 230, my + 40]], 6, U.gold); poly(g, [[mx + 212, my + 50], [mx + 248, my + 50], [mx + 230, my + 20]], U.gold); g.restore(); }
    label(g, t, { at: D.mol, to: [E.W * 0.3, E.H * 0.2], str: 'DHT', start: 0.6 });
    yearStrip(g, t, E.W * 0.47, E.H * 0.48, tYear - 0.1);
  });
  air(g, t);
} });

// s083 — "men doing an hour of cardio six days a week"  winter group run along the river; HERO among four middle-aged men
const MEN = [EXTRAS[0], EXTRAS[1], EXTRAS[2], EXTRAS[3]];
registerShot('s083', { draw(g, t, info) {
  const st = info.shot.start, tHour = shotWord('hour', st, 0.83), tSix = shotWord('six', st, 1.71), v = 250;
  const hx = E.W / 2 + t * v, cam = { z: 0.95, x: t * v - 60 + Math.sin(t * 0.6) * 8, y: -120 + Math.cos(t * 0.5) * 4 };
  const P = park(g, t, cam, { season: 'winter', mood: 'day', snow: 0.6, km: 4 });
  layer(g, cam, 1, (g) => {
    [[-470, 0, 0], [-250, 16, 1], [230, -10, 2], [430, 12, 3]].forEach(([dx, dy, i]) => { const x = hx + dx, s = 1.8; const pose = jogPose(x, s, { fatigue: 0.3 + 0.15 * (i % 2) });
      actor(g, MEN[i], { x, y: P.GY + 10 + dy, s, facing: 1, pose, expr: exprAt(t, [[0, i % 2 ? 'determined' : 'neutral'], [tSix + i * 0.1, i === 1 ? 'worried' : 'smile']]), blink: blinkFlag(t, 3 + i * 0.3, i), look: lookToward(1, 0), rim: P.rim, t });
      const hp = headPos({ x, y: P.GY + 10 + dy, s, facing: 1, pose }); breathPuff(g, t + i * 0.3, [hp[0] + 22, hp[1] + 10], { rate: 1.2, facing: 1, s: 0.8, cold: true }); });
    const pose = jogPose(hx, 1.9); actor(g, 'HERO', { x: hx, y: P.GY + 22, s: 1.9, facing: 1, pose, expr: exprAt(t, [[0, 'determined'], [tHour, 'smile']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), rim: P.rim, t });
    const hp = headPos({ x: hx, y: P.GY + 22, s: 1.9, facing: 1, pose }); breathPuff(g, t, [hp[0] + 24, hp[1] + 10], { rate: 1.4, facing: 1, s: 0.9, cold: true });
  });
  parkFg(g, t, cam, { season: 'winter', snow: 0.6 }); atmos(g, t, cam, { color: '#f4f8ff', far: 12, near: 4 });
  chip(g, t, { str: '1 HOUR', at: tHour, x: E.W * 0.3, y: E.H * 0.2 });
  chip(g, t, { str: '6 DAYS / WEEK', at: tSix, x: E.W * 0.66, y: E.H * 0.2 });
} });

// s084 — FIG 12: "ended up with slightly more DHT,"  BEFORE / AFTER bars: the DHT bar goes up a SMALL step; 'DHT +'
registerShot('s084', { draw(g, t, info) {
  const st = info.shot.start, tMore = shotWord('more', st, 1.37), tDht = shotWord('dht', st, 1.75), U = S().ui;
  board(g, t, { title: 'FIG 12 - HORMONES', fig: 'AFTER A YEAR OF CARDIO' });
  push(g, t, info.dur, () => {
    const up = ease.outBack(prog(t, tMore - 0.2, tMore + 0.3));
    dht(g, t, { x: E.W * 0.24, y: E.H * 0.5, r: 70, k: 1, glow: 0.3 + 0.3 * up });
    const bx = E.W * 0.55, by = E.H * 0.78, H0 = 360, k = ease.out(prog(t, 0, 0.7));
    seg(g, [[bx - 80, by], [bx + 520, by]], 4, alpha(U.cream, 0.8));
    for (const [i, lab, h] of [[0, 'BEFORE', H0], [1, 'AFTER', H0 * (1 + 0.12 * up)]]) { const x = bx + 40 + i * 260, hh = h * k; rr(g, x, by - hh, 140, hh, 10); g.fillStyle = i ? U.gold : alpha(U.blueprint, 0.8); g.fill(); text(g, lab, x + 70, by + 38, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, spacing: 2 }); }
    if (up > 0) { seg(g, [[bx + 280, by - H0], [bx + 470, by - H0]], 3, alpha(U.cream, 0.6)); }
    const p = ease.outBack(prog(t, tDht, tDht + 0.4)); if (p > 0.02) { g.save(); g.translate(bx + 370, by - H0 * 1.12 - 70); g.scale(p, p); text(g, 'DHT +', 0, 0, { size: 60, color: U.gold, font: FONTS.ui, weight: 900, glow: 12, glowColor: alpha(U.gold, 0.5) }); g.restore(); }
    const sm = ease.out(prog(t, tMore, tMore + 0.4)); if (sm > 0) text(g, 'slightly', bx + 370, by - H0 * 1.12 - 130, { size: 32, color: U.cream, font: FONTS.ui, weight: 800, alpha: sm });
  });
  air(g, t);
} });

// s085 — "a hormone linked to balding."  kitchen: MINA reads from the HAIR LOG; on 'balding' DEV pulls his beanie down over his ears
registerShot('s085', { draw(g, t, info) {
  const st = info.shot.start, tBald = shotWord('balding', st, 1.33);
  const cam = camMove(t, info.dur, { z: [1.3, 1.34], x: [-330, -300], y: [70, 74] });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', kcal: 0, plate: 0 }), GY = H.GY, CX = H.CX;
  layer(g, cam, 1, (g) => {
    const mp = idle({ ...POSES.holdFront, head: [10, -204] }, t, 3), mo = { x: CX - 620, y: GY + 20, s: 2.05, facing: 1 };
    actor(g, 'MINA', { ...mo, pose: mp, t, rim: H.rim, expr: exprAt(t, [[0, 'neutral'], [tBald + 0.2, 'suspicious']]), blink: blinkFlag(t, 2.8, 3), look: t > tBald ? lookToward(1, -0.3) : lookToward(0.4, 0.6) });
    const k = 2.05 * 0.72; g.save(); g.translate(mo.x + 34 * k, mo.y - 150 * k); g.rotate(-0.15); rr(g, -46, -32, 92, 64, 6); g.fillStyle = '#d4262e'; g.fill(); g.fillStyle = '#f8f0dc'; g.fillRect(-40, -26, 80, 52); text(g, 'HAIR LOG', 0, -12, { size: 12, color: '#d4262e', font: FONTS.title, weight: 700 }); g.restore();
    const pull = ease.inOut(prog(t, tBald, tBald + 0.5)), dp = idle(pull > 0 ? poseAt(t, [[tBald - 0.01, 'stand'], [tBald, 'handsOnHead']], 0.2) : POSES.stand, t, 2), dov = { x: CX - 220, y: GY + 16, s: 1.9, facing: -1, pose: dp };
    actor(g, 'DEV', { ...dov, t, rim: H.rim, expr: exprAt(t, [[0, 'neutral'], [tBald, 'worried']]), blink: blinkFlag(t, 3.1, 2), look: t > tBald ? lookToward(-0.3, 0.6) : lookToward(-1, 0) });
    if (pull > 0) { const [hx, hy, hr] = headPos(dov); g.fillStyle = '#f08a24'; g.beginPath(); g.arc(hx, hy - hr * 0.3 + pull * hr * 0.45, hr * 1.12, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill(); rr(g, hx - hr * 1.14, hy - hr * 0.35 + pull * hr * 0.45, hr * 2.28, hr * 0.38, hr * 0.12); g.fillStyle = shade('#f08a24', -0.12); g.fill(); }
  });
  home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
} });

// s086 — MYTH STAMP: "But no study has shown that working out makes you bald."  HAIR LOG page; NO STUDY SHOWS IT slams down; rumour crossed out
registerShot('s086', { draw(g, t, info) {
  const st = info.shot.start, tNo = shotWord('no', st, 0.41), tBald = shotWord('bald', st, 2.83), U = S().ui;
  const z = lerp(1.0, 1.05, ease.inOut(t / info.dur)), hit = t - tNo - 0.2, sk = hit > 0 && hit < 0.3 ? Math.sin(hit * 80) * 8 * (1 - hit / 0.3) : 0;
  g.save(); g.translate(E.W / 2 + sk, E.H / 2); g.scale(z, z); g.rotate(-0.02); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = '#2a1c18'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  rr(g, 140, 60, E.W - 280, E.H - 120, 12); g.fillStyle = linGrad(g, 0, 60, 0, E.H, ['#fbf4e2', '#efe4c8']); g.fill();
  for (let i = 0; i < 14; i++) seg(g, [[170, 170 + i * 62], [E.W - 170, 170 + i * 62]], 2, alpha('#8aa8d8', 0.5)); seg(g, [[300, 70], [300, E.H - 70]], 2.5, alpha('#e07a7a', 0.6));
  text(g, 'HAIR LOG', 340, 120, { size: 54, color: '#d4262e', font: FONTS.title, weight: 700, align: 'left', spacing: 4 }); text(g, 'p. 37', E.W - 220, 120, { size: 30, color: '#7a7680', font: FONTS.title, weight: 600 });
  for (const [hx, hy] of [[420, 840], [1520, 300]]) text(g, '?', hx, hy, { size: 60, color: alpha('#7a7680', 0.7), font: FONTS.title, weight: 700 });
  text(g, 'TRAINING = BALD?', E.W / 2, E.H * 0.42, { size: 120, color: '#3a3640', font: FONTS.title, weight: 600 });
  text(g, 'everyone says so', E.W / 2, E.H * 0.55, { size: 48, color: '#6a6670', font: FONTS.serif, weight: 900, italic: true });
  // red marker cross-out on 'bald'
  const xk = ease.inOut(prog(t, tBald, tBald + 0.35)); if (xk > 0) { const w = 1100; g.save(); g.strokeStyle = '#d4262e'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(E.W / 2 - w / 2, E.H * 0.44); g.lineTo(E.W / 2 - w / 2 + w * xk, E.H * 0.39 + Math.sin(xk * 6) * 6); g.stroke(); g.restore(); }
  g.restore();
  // the stamp slams down on 'no study'
  const sk2 = prog(t, tNo, tNo + 0.22); if (sk2 > 0) { const sc = lerp(1.8, 1, ease.in(sk2)); g.save(); g.translate(E.W / 2, E.H * 0.74); g.rotate(-0.08); g.scale(sc, sc); g.globalAlpha *= clamp(sk2 * 3);
    const str = 'NO STUDY SHOWS IT', w = measure(g, str, 86, FONTS.title, 700) + 110; rr(g, -w / 2, -76, w, 152, 22); g.fillStyle = '#16233e'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 8; g.stroke();
    rr(g, -w / 2 + 16, -60, w - 32, 120, 14); g.strokeStyle = alpha(U.cream, 0.5); g.lineWidth = 3; g.stroke();
    text(g, str, 0, 4, { size: 86, color: U.cream, font: FONTS.title, weight: 700, spacing: 4, glow: 14, glowColor: alpha(U.gold, 0.5) }); g.restore();
    if (hit > 0 && hit < 0.5) for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, d = 360 + hit * 600; circle(g, E.W / 2 + Math.cos(a) * d, E.H * 0.74 + Math.sin(a) * d * 0.4, 8 * (1 - hit * 2), alpha('#f4efe6', 0.8)); } }
  FX.dust(g, t, { count: 12, color: '#fff4dc', a: 0.12, seed: 5 });
} });

// s087 — FIG 13 SHOCK: "What can make hair fall out is a shock to the body,"  a lightning SHOCK hits the silhouette; follicles flip GROWING -> RESTING
registerShot('s087', { draw(g, t, info) {
  const st = info.shot.start, tShock = shotWord('shock', st, 2.11), U = S().ui;
  board(g, t, { title: 'FIG 13 - A SHOCK TO THE BODY', fig: 'GROWING > RESTING' });
  const sh = ease.inOut(prog(t, tShock, tShock + 0.6)), flash = Math.max(0, 1 - Math.abs(t - tShock) * 6);
  push(g, t, info.dur, () => {
    const fx = E.W * 0.2, fy = E.H * 0.8; UI.lineFigure(g, { x: fx, y: fy, s: 2.2, pose: t > tShock ? reaction('shock', t, tShock) : POSES.stand, color: alpha(U.blueprint, 0.95) });
    if (flash > 0) glow(g, fx, fy - 300, 300, '#ffe080', 0.6 * flash);
    const bk = ease.out(prog(t, tShock - 0.35, tShock)); if (bk > 0) { g.save(); g.translate(fx + 40, lerp(80, fy - 560, bk)); poly(g, [[0, 0], [60, 0], [20, 90], [70, 90], [-30, 240], [0, 120], [-50, 120]], U.accent); g.restore(); text(g, 'SHOCK', fx + 200, fy - 600, { size: 50, color: U.accent, font: FONTS.ui, weight: 900, alpha: bk }); }
    for (let i = 0; i < 4; i++) follicle(g, t, { x: E.W * 0.38 + i * 170, y: E.H * 0.74, s: 0.8, k: ease.out(prog(t, 0.1 + i * 0.1, 1.2 + i * 0.1)), phase: 0.15 + 0.85 * clamp(sh * 1.4 - i * 0.08) });
    hairCycle(g, t, { x: E.W * 0.8, y: E.H * 0.42, r: 150, k: ease.out(prog(t, 0.3, 1.4)), phase: 0.2 + 0.8 * sh });
    label(g, t, { at: [E.W * 0.42 + 300, E.H * 0.58], to: [E.W * 0.52, E.H * 0.24], str: 'many at once', start: tShock + 0.2 });
  });
  air(g, t);
} });

// s088 — "like serious stress or losing a lot of weight fast."  bathroom scale: STRESS cloud on 'stress', the needle drops on 'losing', -5 kg
function stormCloud(g, x, y, s, t, k) { if (k <= 0.01) return; g.save(); g.translate(x, y); g.scale(s * k, s * k); for (const [dx, dy, r] of [[-50, 6, 40], [0, -16, 52], [52, 4, 40], [0, 18, 44]]) circle(g, dx, dy, r, '#4a4a5a'); for (const [dx, dy, r] of [[-30, -10, 22], [30, -20, 20]]) circle(g, dx, dy, r, alpha('#8a8a9a', 0.6));
  if (Math.sin(t * 9) > 0.3) poly(g, [[0, 40], [24, 40], [6, 80], [26, 80], [-18, 130], [-4, 92], [-22, 92]], '#ffe066'); g.restore(); }
registerShot('s088', { draw(g, t, info) {
  const st = info.shot.start, tStress = shotWord('stress', st, 1.09), tLose = shotWord('losing', st, 1.89), U = S().ui;
  const cam = camMove(t, info.dur, { z: [1.18, 1.24], x: [-130, -110], y: [30, 40] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'day', hair: 0 }), GY = H.GY, CX = H.CX, x = CX - 60;
  const kg = lerp(70, 65, ease.inOut(prog(t, tLose, tLose + 1.2)));
  layer(g, cam, 1, (g) => {
    bathScale(g, x, GY + 20, 1.1, kg);
    const pose = idle(t < tLose ? POSES.relaxed : { ...EXTRA.sheepish, hF: [14, -150] }, t, 2), o = { x, y: GY + 4, s: 1.9, facing: 1 };
    actor(g, 'HERO', { ...o, pose, t, rim: H.rim, expr: exprAt(t, [[0, 'neutral'], [tStress, 'worried'], [tLose + 0.6, 'scared']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(0.2, 1) });
    const [hx, hy, hr] = headPos({ ...o, pose }); stormCloud(g, hx - 10, hy - hr * 3.6, 1.1, t, ease.outBack(prog(t, tStress, tStress + 0.4)));
  });
  home3Fg(g, t, cam, { room: 'bathroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  chip(g, t, { str: 'STRESS', at: tStress, tone: 'coral', x: E.W * 0.26, y: E.H * 0.24 });
  chip(g, t, { str: '-5 kg', at: tLose + 0.3, x: E.W * 0.72, y: E.H * 0.24 });
} });

// s089 — "A few months later, hair sheds in handfuls. Doctors call it telogen effluvium."  FEW MONTHS arrow; resting hairs drop together; TELOGEN EFFLUVIUM label
registerShot('s089', { draw(g, t, info) {
  const st = info.shot.start, tFew = shotWord('few', st, 0.25), tHand = shotWord('handfuls', st, 1.71), tTel = shotWord('telogen', st, 3.79), U = S().ui;
  board(g, t, { title: 'FIG 13 - A SHOCK TO THE BODY', fig: 'A FEW MONTHS LATER' });
  push(g, t, info.dur, () => {
    const ak = ease.out(prog(t, tFew, tFew + 0.8)), ax = E.W * 0.14, aw = E.W * 0.72, ay = E.H * 0.26;
    seg(g, [[ax, ay], [ax + aw * ak, ay]], 5, U.cream); if (ak > 0.95) poly(g, [[ax + aw, ay - 16], [ax + aw + 30, ay], [ax + aw, ay + 16]], U.cream);
    circle(g, ax, ay, 12, U.accent); text(g, 'SHOCK', ax, ay - 40, { size: 30, color: U.accent, font: FONTS.ui, weight: 900, alpha: ak });
    if (ak > 0.4) text(g, 'A FEW MONTHS', ax + aw / 2, ay - 40, { size: 40, color: U.gold, font: FONTS.ui, weight: 900, alpha: ease.out((ak - 0.4) / 0.6) });
    const drop = prog(t, tHand, tHand + 1.0);
    for (let i = 0; i < 5; i++) follicle(g, t, { x: E.W * 0.2 + i * 300, y: E.H * 0.74, s: 0.85, k: 1, phase: 1 + clamp(drop * 1.6 - i * 0.1) });
    const r = rng(14); if (drop > 0 && drop < 1) for (let i = 0; i < 26; i++) { const x0 = E.W * 0.2 + (i % 5) * 300 + (r() - 0.5) * 60, y0 = E.H * 0.5 + r() * 40, u = clamp(drop * 1.3 - r() * 0.3), y = y0 + u * u * 340, a = r() * 0.8 - 0.4 + u * 2;
      if (u <= 0) continue; g.save(); g.translate(x0 + Math.sin(u * 6 + i) * 20, y); g.rotate(a); seg(g, [[0, -30], [0, 30]], 3, alpha(U.cream, 1 - u * 0.6)); g.restore(); }
    label(g, t, { at: [E.W * 0.2 + 2 * 300, E.H * 0.6], to: [E.W * 0.56, E.H * 0.4], str: 'TELOGEN EFFLUVIUM', start: tTel - 0.1, size: 44 });
  });
  air(g, t);
} });
