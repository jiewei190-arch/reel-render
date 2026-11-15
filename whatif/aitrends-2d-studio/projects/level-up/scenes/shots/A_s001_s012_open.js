// A_s001_s012_open.js — ep 5 batch A, COLD OPEN + TITLE (0.00-38.89): Monday breakfast, the Zip unzips over the cereal, the Stat Card
// floats out, the gold '1', the first LEVEL UP!, Dev reads it, the every-morning strip, the rule on the card (x1.26 / x2), nobody knows +
// Biscuit chomps the card, the title. LEGAL: STYLE.md DON'T list (no series names, no System/Player/Quest words, no portals, eyes never glow).
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, text, FONTS, rr, seg, circle, linGrad, rng } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { chip } from '../sets/hud.js';
import { board, draw, label } from '../sets/bp.js';
import { home3, home3Fg, filmPhone } from '../sets/home3.js';
import { PAL, zip, zipOpen, statCard, roll, levelSpin, xpFill, levelUp, levelFlash, levelShake, freeze, sparks, dumbbell } from '../sets/statcard.js';
import { speedLines5, lowAngle, lowAngleWrap } from '../sets/fx5.js';
import { sw, hero, handAt, bowl, spoon, mug, juice, titleText, CYAN } from './A_lib.js';

const KIT = (g, t, cam, o = {}) => { const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0, ...o }); return { H, P: H.pos, GY: H.GY ?? E.H * 0.8, CX: H.CX ?? E.W / 2 }; };
const SIT_SPOON = (lift = 0) => ({ ...POSES.sit, eF: [40, -126 - lift * 10], hF: [66, -142 - lift * 34] });
const SIT_GLASS = { ...POSES.sit, eF: [22, -118], hF: [34, -134] };
// the breakfast table: hero (spoon), Mina (juice), Biscuit (windowsill), bowl + mug. Returns key points.
function breakfast(g, t, K, o = {}) {
  const { P, GY, CX } = K, hx = P.tableX - 190, mx = P.tableX + 240;
  bowl(g, P.tableX, P.tableTop - 6, 1); mug(g, P.tableX + 120, P.tableTop - 2, t);
  const hp = o.heroPose || idle(SIT_SPOON(o.lift ?? 0), t, 2), ho = { x: hx, y: GY, s: 1.9, facing: 1 };
  hero(g, { ...ho, pose: hp, expr: o.heroExpr || 'sleepy', blink: o.blink ?? blinkFlag(t, 3.4, 2), look: o.heroLook || lookToward(1, 0.3), t });
  const hd = handAt(ho, hp, 'F'); if (o.spoon !== false) spoon(g, hd[0], hd[1], o.spoonAng ?? 0.15, 1.05, o.bend ?? 0);
  if (o.mina !== false) { const mp = o.minaPose || idle(SIT_GLASS, t, 3), mo = { x: mx, y: GY, s: 2.0, facing: -1 }; actor(g, 'MINA', { ...mo, pose: mp, expr: o.minaExpr || 'neutral', blink: blinkFlag(t, 2.9, 3), look: o.minaLook || lookToward(-1, 0.1), t }); const mh = handAt({ ...mo, s: 2.0 * 0.72 }, mp, 'F'); juice(g, mh[0], mh[1] + 10, 0.9, o.pour ?? 0); }
  if (o.cat !== false) cat(g, { x: CX - 760, y: GY - 468, s: 1.6, facing: 1, pose: 'loaf', t, eyes: o.catEyes || 'auto', tilt: o.catTilt });
  return { hx, mx, zipX: P.tableX, zipY: P.tableTop - 150 };
}

// s001 — "Monday. Breakfast."  the kitchen on a Monday morning: HERO sleepy over his cereal, MINA with juice, Biscuit on the windowsill;
// on 'Breakfast.' the hush: Biscuit's ears turn toward the bowl. Slow push toward the bowl.
registerShot('s001', { draw(g, t, info) {
  const st = info.shot.start, tB = sw('breakfast', st, 1.56);
  const cam = camMove(t, info.dur, { z: [0.96, 1.04], x: [-40, -60], y: [-20, -40] });
  const K = KIT(g, t, cam);
  layer(g, cam, 1, (g) => breakfast(g, t, K, { catTilt: t > tB ? 0.22 * ease.out(prog(t, tB, tB + 0.3)) : 0, catEyes: t > tB ? 'open' : 'auto' }));
  home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#ffe0b0' });
  chip(g, t, { str: 'MONDAY', at: 0.0, x: 250, y: 110, dur: info.dur });
} });

// s002 — "You lift your spoon, and the air above your cereal unzips."  close on the bowl: the spoon lifts (milk drips), the Zip unzips just
// above the cereal on 'the'-'unzips.'; the spoon freezes mid-air; cyan light on the milk and the spoon.
registerShot('s002', { draw(g, t, info) {
  const st = info.shot.start, tLift = sw('lift', st, 0.25), tUn = sw('unzips', st, 2.55), tz = 1.65;
  const z = lerp(1.5, 1.58, t / info.dur);
  const K0 = { tableX: E.W / 2 - 60, tableTop: E.H * 0.8 - 250 };
  const cam = { z, x: K0.tableX - E.W / 2 + 20, y: K0.tableTop - 150 - E.H / 2 + 30, r: 0 };
  blurLayer(g, 6, (g) => KIT(g, t, cam), null, 1);
  const K = { P: { tableX: K0.tableX, tableTop: K0.tableTop }, GY: E.H * 0.8, CX: E.W / 2 };
  const lift = ease.out(prog(t, tLift, tLift + 0.7)) * (t > tUn ? 1 : 1);
  layer(g, cam, 1, (g) => {
    const tt = t > tUn ? tUn : t;
    breakfast(g, tt, K, { lift, mina: false, cat: false, heroExpr: t > tz ? 'surprised' : 'sleepy', heroLook: lookToward(0.6, -0.4), spoonAng: -0.1 - lift * 0.25 });
    const zo = zipOpen(t, tz, { dur: 0.9 }); zip(g, t, K0.tableX, K0.tableTop - 150, { w: 280, open: zo, seam: clamp((t - 1.27) * 2) });
    if (zo > 0) glow(g, K0.tableX, K0.tableTop - 110, 260, CYAN, 0.25 * zo);
    for (let i = 0; i < 3; i++) { const ph = ((t * 0.9 + i / 3) % 1); if (lift > 0.5 && t < tUn) circle(g, K0.tableX - 120 + 90, K0.tableTop - 190 + ph * 70, 4 * (1 - ph) + 1, '#fbf6ea'); }
  });
} });

// s003 — "A tiny glowing tear, edged with gold sparks."  macro on the open Zip: gold teeth sparking on 'edged' and 'gold', the cyan glow
// breathing; the HERO's face reflected huge and blurry at the top (two small cyan rectangles on his cheeks, eyes NOT glowing).
registerShot('s003', { draw(g, t, info) {
  const st = info.shot.start, tE = sw('edged', st, 1.24), tG = sw('gold', st, 1.88);
  const z = lerp(1.6, 1.7, t / info.dur), zx = E.W / 2 - 60, zy = E.H * 0.8 - 400, wob = Math.sin(t * 7) * 1;
  const cam = { z, x: zx - E.W / 2, y: zy - E.H / 2 + 60 + wob, r: 0 };
  blurLayer(g, 10, (g) => KIT(g, t, cam), null, 1);
  veil(g, '#0b0f1a', 0.35);
  // the reflection: a huge blurry HERO face in the cyan light at the top of frame
  blurLayer(g, 5, (g) => { g.save(); g.globalAlpha = 0.28; glow(g, E.W / 2, 60, 520, CYAN, 0.35); circle(g, E.W / 2, -60, 300, '#10141e'); for (const sx of [-1, 1]) { rr(g, E.W / 2 + sx * 120 - 22, 90, 44, 22, 6); g.fillStyle = CYAN; g.fill(); } g.restore(); });
  layer(g, cam, 1, (g) => { const Z = zip(g, t, zx, zy, { w: 280, open: 1 }); glow(g, zx, zy, 240, CYAN, 0.18 + 0.06 * Math.sin(t * 3)); sparks(g, t, tE, zx - 120, zy, { n: 18, s: 0.7, seed: 3 }); sparks(g, t, tG, zx + 120, zy, { n: 18, s: 0.7, seed: 5 }); void Z; });
} });

// s004 — "Out of it floats a screen, like a video game."  kitchen medium two-shot: the Stat Card unfolds out of the Zip and bobs at
// shoulder height; HERO leans back surprised, then grins and points on 'video'; MINA's juice stops mid-pour.
registerShot('s004', { draw(g, t, info) {
  const st = info.shot.start, tV = sw('video', st, 1.80);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [0, 20], y: [-40, -50] });
  const K = KIT(g, t, cam), P = K.P;
  layer(g, cam, 1, (g) => {
    const lean = { ...SIT_SPOON(1), head: [-4, -178], sh: [-6, -146] }, pt = { ...POSES.sit, eF: [44, -150], hF: [86, -176], head: [0, -180] };
    const hp = idle(t < tV ? lean : blendPose(lean, pt, ease.out(prog(t, tV, tV + 0.3))), t, 2);
    const B = breakfast(g, t, K, { heroPose: hp, heroExpr: exprAt(t, [[0, 'surprised'], [1.30, 'happy']]), heroLook: lookToward(0.7, -0.7), spoon: t < tV, pour: 0.6, minaExpr: 'surprised', minaLook: lookToward(0.2, -1) });
    const Z = zip(g, t, B.zipX, B.zipY, { w: 280, open: 1 - ease.in(prog(t, 1.4, 1.9)) * 0.7 });
    statCard(g, t, { x: P.tableX + 330, y: P.tableTop - 310, s: 0.9, from: Z.mouth, unfold: ease.out(prog(t, 0.14, 0.54)), lv: 0, str: 40, xp: 0.55 });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// s005 — "A big gold number one. A little dumbbell."  close on the Stat Card: the badge flips 0 -> 1 and the gold '1' lands on 'one.' with
// sparks; on 'A' push across to the dumbbell, which bounces on 'dumbbell.'; the STR odometer starts to roll.
registerShot('s005', { draw(g, t, info) {
  const st = info.shot.start, tOne = sw('one', st, 0.88), tA = sw('a', st + 1.5, 2.00), tDb = sw('dumbbell', st, 2.24);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-60, 40] });
  blurLayer(g, 9, (g) => KIT(g, t, cam), null, 1); veil(g, '#0b0f1a', 0.25);
  const px = lerp(0, -260, ease.inOut(prog(t, tA, tA + 0.8)));
  const sp = levelSpin(t, 0.44, 0.5), cx = E.W / 2 + 60 + px, cy = E.H * 0.5;
  layer(g, cam, 1, (g) => {
    const C = statCard(g, t, { x: cx, y: cy, s: 1.35, tilt: -0.05, lv: sp >= 0.5 ? 1 : 0, lvPrev: 0, spin: sp > 0 && sp < 1 ? sp : 0, str: roll(t, 40, 50, tA, 1.4), xp: 0.58 });
    if (C) { sparks(g, t, tOne, C.badge[0], C.badge[1], { n: 24, s: 1, seed: 7 }); const b = ease.outBack(prog(t, tDb, tDb + 0.35)) * (1 - prog(t, tDb + 0.35, tDb + 0.7)); if (b > 0) glow(g, C.str[0] - 130, C.str[1], 90, CYAN, 0.4 * b); }
  });
} });

// s006 — "And the words "LEVEL UP!""  THE FIRST POP (1.9 s): the bar snaps full, gold LEVEL UP! with the overshoot snap, freeze + shake,
// gold focus lines behind the card, Biscuit's silhouette jumps in the corner; the flash LAST.
registerShot('s006', { draw(g, t, info) {
  const at = 0.62, tf = freeze(t, at, 5), sh = levelShake(t, at, 3);
  const cam = camMove(tf, info.dur, { z: [1.02, 1.08] }); cam.x += sh[0]; cam.y += sh[1];
  blurLayer(g, 8, (g) => KIT(g, tf, cam), null, 1); veil(g, '#0b0f1a', 0.35);
  speedLines5(g, tf, { mode: 'focus', cx: E.W / 2, cy: E.H * 0.58, color: PAL.gold, a: 0.5 * clamp((tf - at) * 4), inner: 520 });
  layer(g, cam, 1, (g) => {
    const X = xpFill(tf, { from: 0.6, to: 1, at0: 0, at1: 0.24, snap: 0.26 });
    statCard(g, tf, { x: E.W / 2, y: E.H * 0.62, s: 1.0, lv: 1, str: 50, xp: X.xp, xpSnap: X.xpSnap });
    levelUp(g, tf, at, { x: E.W / 2, y: E.H * 0.28, s: 1 });
    const j = ease.out(prog(tf, 0.7, 1.1)) * (1 - ease.in(prog(tf, 1.2, 1.6)));
    g.save(); g.globalAlpha = 0.85; cat(g, { x: 190, y: E.H + 20 - j * 160, s: 1.7, facing: 1, pose: 'arch', fill: '#05070c', flat: true, t }); g.restore();
  });
  levelFlash(g, t, at);
} });

// s007 — "Dev reads it out loud. "Strength, fifty kilos.""  kitchen wider: DEV in the doorway right, phone up filming (REC dot), reading
// the card; lip-sync DEV on the quote only; gold '50 kg' pulses on 'fifty'; HERO looks from the card to Dev.
registerShot('s007', { draw(g, t, info) {
  const st = info.shot.start, tS = sw('strength', st, 1.99), tF = sw('fifty', st, 2.29);
  const cam = camMove(t, info.dur, { z: [0.94, 0.98], x: [120, 140], y: [-50, -60] });
  const K = KIT(g, t, cam), P = K.P, dx = P.tableX + 700;
  layer(g, cam, 1, (g) => {
    breakfast(g, t, K, { heroExpr: 'surprised', heroLook: t < tS ? lookToward(1, -0.6) : lookToward(1, -0.1), lift: 1, mina: true, minaExpr: 'surprised', minaLook: lookToward(-0.3, -1) });
    const C = statCard(g, t, { x: P.tableX + 360, y: P.tableTop - 330, s: 0.85, lv: 1, str: 50, xp: 0.02 });
    const dp = idle(POSES.phone, t, 4);
    actor(g, 'DEV', { x: dx, y: K.GY, s: 1.9, facing: -1, pose: dp, expr: exprAt(t, [[0, 'surprised'], [tS, 'happy']]), talk: t > tS && t < info.dur - 0.15, blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, -0.3), t });
    const ph = handAt({ x: dx, y: K.GY, s: 1.9, facing: -1 }, dp, 'F'); rr(g, ph[0] - 16, ph[1] - 50, 32, 56, 6); g.fillStyle = '#16121c'; g.fill(); if (Math.floor(t * 2) % 2 === 0) circle(g, ph[0] + 6, ph[1] - 40, 4, '#ff3b30');
    if (C) { const p = ease.out(prog(t, tF, tF + 0.2)) * (1 - prog(t, tF + 0.6, tF + 1.2)); if (p > 0) glow(g, C.str[0], C.str[1], 120, PAL.gold, 0.6 * p); }
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// s008 — "He's already filming. Every morning, one more level."  over Dev's shoulder onto his phone: the kitchen + HERO + the card, REC;
// on 'Every' the phone image becomes a fast every-morning strip, the card badge ticking 1 -> 2 -> 3 on 'one', 'more', 'level.'
registerShot('s008', { draw(g, t, info) {
  const st = info.shot.start, tEv = sw('every', st, 1.72), tO = sw('one', st, 2.28), tM = sw('more', st, 2.58), tL = sw('level', st, 2.78);
  const cam = camMove(t, info.dur, { z: [1.08, 1.12] });
  blurLayer(g, 10, (g) => KIT(g, t, cam), null, 1); veil(g, '#0b0f1a', 0.3);
  // Dev's shoulder + beanie edge in the near foreground
  g.fillStyle = '#3c4058'; g.beginPath(); g.ellipse(E.W * 0.08, E.H * 1.05, 420, 300, 0, 0, 7); g.fill(); g.fillStyle = '#f08a24'; g.beginPath(); g.ellipse(E.W * 0.02, E.H * 0.42, 200, 160, 0, 0, 7); g.fill();
  filmPhone(g, t, { x: E.W * 0.55, y: E.H * 0.5, s: 1.25, at: 0, rot: -0.03 }, (g, w, h) => {
    if (t < tEv) {
      const K = KIT(g, t, { z: 1, x: 0, y: -40, r: 0 });
      breakfast(g, t, K, { heroExpr: 'happy', mina: false, cat: false });
      statCard(g, t, { x: K.P.tableX + 330, y: K.P.tableTop - 310, s: 0.9, lv: 1, str: 50, xp: 0.05 });
    } else {
      g.fillStyle = '#e0c89a'; g.fillRect(0, 0, w, h);
      const sl = (t - tEv) * 900, lvs = [t > tO ? 2 : 1, t > tM ? 3 : 2, t > tL ? 4 : 3];
      for (let i = 0; i < 3; i++) { const fx = 120 + i * 620 - sl % 620 + 200, fy = 200; rr(g, fx, fy, 560, 680, 20); g.fillStyle = '#f4e4c4'; g.fill(); g.strokeStyle = '#8a6a52'; g.lineWidth = 8; g.stroke();
        bowl(g, fx + 280, fy + 560, 1.1); statCard(g, t, { x: fx + 280, y: fy + 250, s: 0.55, lv: lvs[i], str: Math.round(40 * Math.pow(2, lvs[i] / 3)), xp: 0.3, bob: 0.5 }); }
    }
  });
} });

// s009 — "Each one makes you about a quarter stronger."  blueprint: a row of dumbbell bars, bar 2 grows from bar 1 with a gold '+26%'
// on 'quarter', the arrow 'x1.26 per level' on 'stronger.'; footnote 'start: 40 kg'.
function bars(g, t, n, k) { const x0 = 360, y0 = E.H * 0.62; for (let i = 0; i < n; i++) { const L = 160 * Math.pow(1.26, i) * clamp(k[i] ?? 1); if (L <= 1) continue; const x = x0 + i * 340; seg(g, [[x, y0], [x, y0 - L]], 34, alpha('#bfe0ff', 0.9)); rr(g, x - 46, y0 - L - 24, 92, 24, 8); g.fillStyle = '#bfe0ff'; g.fill(); } }
registerShot('s009', { draw(g, t, info) {
  const st = info.shot.start, tE = sw('each', st, 0.08), tM = sw('makes', st, 0.52), tQ = sw('quarter', st, 1.40), tS = sw('stronger', st, 1.64);
  g.save(); const z = 1 + 0.035 * t / info.dur; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  board(g, t, { title: 'THE RULE ON THE CARD', fig: 'STORY RULE' });
  bars(g, t, 2, [ease.out(prog(t, tE, tE + 0.5)), ease.out(prog(t, tM, tM + 0.6))]);
  label(g, t, { at: [700, E.H * 0.62 - 210], to: [860, E.H * 0.3], str: '+26%', start: tQ });
  if (t > tS) { draw(g, [[420, E.H * 0.74], [700, E.H * 0.74]], ease.out(prog(t, tS, tS + 0.4)), { w: 6, color: '#ffc93c' }); text(g, 'x1.26 per level', 560, E.H * 0.8, { size: 46, color: '#ffc93c', font: FONTS.ui, weight: 900, alpha: ease.out(prog(t, tS, tS + 0.3)) }); }
  text(g, 'start: 40 kg', 1500, E.H * 0.86, { size: 30, color: alpha('#e8f0ff', 0.75), font: FONTS.ui, weight: 700 });
  g.restore();
} });

// s010 — "Stack three, and your strength doubles."  three gold steps stack (x1.26 each) on 'Stack', 'three,', 'and'; on 'doubles.' a big
// gold 'x2' stamp slams across them, the formula strip 'STR = 40 x 2^(level/3)' underneath.
registerShot('s010', { draw(g, t, info) {
  const st = info.shot.start, ts = [sw('stack', st, 0.15), sw('three', st, 0.38), sw('and', st, 0.70)], tD = sw('doubles', st, 1.32);
  const sh = t > tD && t < tD + 0.25 ? Math.sin(t * 90) * 2 : 0;
  g.save(); const z = 1.03 + 0.03 * t / info.dur; g.translate(E.W / 2 + sh, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  board(g, t, { title: 'THE RULE ON THE CARD', fig: 'STORY RULE' });
  bars(g, t, 4, [1, ...ts.map(a => ease.outBack(prog(t, a, a + 0.35)))]);
  ts.forEach((a, i) => { if (t > a) text(g, 'x1.26', 360 + (i + 1) * 340, E.H * 0.68, { size: 34, color: '#ffc93c', font: FONTS.ui, weight: 900 }); });
  if (t > tD) { const k = ease.outBack(prog(t, tD, tD + 0.3)); g.save(); g.translate(1020, E.H * 0.32); g.rotate(-0.12); g.scale(k * 1.0, k * 1.0); text(g, 'x2', 0, 0, { size: 220, color: '#ffc93c', font: FONTS.ui, weight: 900, stroke: 16, strokeColor: '#0b1a33', glow: 30, glowColor: alpha('#ffc93c', 0.6) }); g.restore();
    text(g, 'STR = 40 x 2^(level / 3)', E.W / 2, E.H * 0.84, { size: 44, color: '#e8f0ff', font: FONTS.ui, weight: 800, alpha: ease.out(prog(t, tD + 0.2, tD + 0.6)) }); }
  g.restore();
} });

// s011 — "Nobody knows where it came from. Biscuit tries to eat it."  HERO, MINA and DEV peer around the floating card (Dev checks behind,
// Mina pokes, HERO shrugs on 'knows'); on 'Biscuit' the cat launches off the sill and chomps the card's corner on 'eat'; the card wobbles,
// unharmed, a gold spark pops; Biscuit lands on the table, offended. Shake on the landing.
registerShot('s011', { draw(g, t, info) {
  const st = info.shot.start, tK = sw('knows', st, 0.43), tBi = sw('biscuit', st, 2.37), tEat = sw('eat', st, 3.13), tLand = 3.51;
  const sh = t > tLand && t < tLand + 0.25 ? Math.sin(t * 80) * 2 : 0;
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-20, -40], y: [-60, -60] }); cam.y += sh;
  const K = KIT(g, t, cam), P = K.P, cx = P.tableX + 60, cy = P.tableTop - 360;
  layer(g, cam, 1, (g) => {
    bowl(g, P.tableX - 60, P.tableTop - 6, 1);
    const hp = idle(poseAt(t, [[0, 'stand'], [tK, 'shrug'], [tK + 1.2, 'stand']]), t, 2);
    hero(g, { x: cx - 420, y: K.GY, s: 1.9, facing: 1, pose: hp, expr: exprAt(t, [[0, 'thinking'], [tK, 'confused'], [tBi, 'surprised']]), blink: blinkFlag(t, 3.3, 2), look: t > tBi ? lookToward(-0.6, -0.4) : lookToward(1, -0.5), t });
    actor(g, 'MINA', { x: cx - 120, y: K.GY, s: 2.0, facing: 1, pose: idle({ ...POSES.point, hF: [44, -170], eF: [26, -150] }, t, 3), expr: t > tEat ? 'surprised' : 'thinking', blink: blinkFlag(t, 2.9, 3), look: lookToward(0.3, -1), t });
    actor(g, 'DEV', { x: cx + 380, y: K.GY, s: 1.9, facing: -1, pose: idle({ ...POSES.phone, head: [12, -200] }, t, 4), expr: t > tEat ? 'shocked' : 'thinking', blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, -0.4), t });
    const wob = t > tEat ? Math.sin((t - tEat) * 30) * 0.12 * Math.exp(-(t - tEat) * 4) : 0;
    g.save(); g.translate(cx, cy); g.rotate(wob); g.translate(-cx, -cy); statCard(g, t, { x: cx, y: cy, s: 0.8, lv: 1, str: 50, xp: 0.1 }); g.restore();
    sparks(g, t, tEat, cx + 280, cy - 60, { n: 14, s: 0.7, seed: 9 });
    // Biscuit: sill -> arc -> chomp at the card corner -> lands on the table, offended
    const sx = K.CX - 760, sy = K.GY - 468, ax = cx + 270, ay = cy + 10, lx = P.tableX - 220, ly = P.tableTop;
    let bx = sx, by = sy, pose = 'loaf', eyes = 'auto', fac = 1;
    if (t > tBi) { const u = clamp((t - tBi) / (tEat - tBi)); bx = lerp(sx, ax, u); by = lerp(sy, ay, u) - Math.sin(u * Math.PI) * 220; pose = u < 0.15 ? 'arch' : 'stand'; eyes = 'wide'; }
    if (t > tEat) { const u = clamp((t - tEat) / (tLand - tEat)); bx = lerp(ax, lx, u); by = lerp(ay, ly, u) - Math.sin(u * Math.PI) * 80; pose = 'stand'; fac = -1; eyes = 'wide'; }
    if (t > tLand) { bx = lx; by = ly; pose = 'sit'; eyes = 'offended'; fac = -1; }
    cat(g, { x: bx, y: by, s: 1.6, facing: fac, pose, eyes, t });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// s012 — "Let's see what thirty days does to you."  TITLE: low angle over the breakfast table: HERO stands holding the cereal bowl up like a
// trophy, the card at his shoulder, MINA + DEV either side, Biscuit on the table; '30 DAYS' chip on 'thirty'; title snaps on at 2.3 s.
registerShot('s012', { draw(g, t, info) {
  const st = info.shot.start, tT = sw('thirty', st, 0.61);
  const cam = lowAngle(t, info.dur, { z: [1.0, 1.08], lift: 90 });
  const K = KIT(g, t, cam), P = K.P, hx = P.tableX - 60;
  layer(g, cam, 1, (g) => lowAngleWrap(g, 0.8, K.GY, (g) => {
    const tro = { ...POSES.cheer, hF: [20, -300], eF: [16, -250], hB: [-14, -300], eB: [-12, -250] };
    const hp = idle(tro, t, 2), ho = { x: hx, y: K.GY + 10, s: 1.95, facing: 1 };
    actor(g, 'MINA', { x: hx - 360, y: K.GY + 10, s: 2.0, facing: 1, pose: idle(POSES.cheer, t, 3), expr: 'joy', blink: blinkFlag(t, 2.9, 3), look: lookToward(0.6, -0.6), t });
    actor(g, 'DEV', { x: hx + 380, y: K.GY + 10, s: 1.9, facing: -1, pose: idle(POSES.phone, t, 4), expr: 'happy', blink: blinkFlag(t, 3.1, 5), look: lookToward(-0.6, -0.6), t });
    hero(g, { ...ho, pose: hp, expr: 'joy', blink: blinkFlag(t, 3.3, 2), look: lookToward(0, -1), t, rim: { color: CYAN, dir: [1, -0.4] } });
    const h = handAt(ho, hp, 'F'); bowl(g, h[0] - 10, h[1] - 10, 0.9);
    statCard(g, t, { x: hx + 560, y: K.GY - 640, s: 0.6, lv: 1, str: 50, xp: 0.1 });
    cat(g, { x: P.tableX + 230, y: P.tableTop, s: 1.5, facing: -1, pose: 'sit', t });
  }));
  atmos(g, t, cam, { color: '#ffe0b0' });
  chip(g, t, { str: '30 DAYS', at: tT, x: E.W - 260, y: 110, dur: info.dur });
  titleText(g, t, 2.3, ['WHAT IF YOU COULD', 'LEVEL UP YOUR STRENGTH', 'EVERY DAY?'], E.H * 0.24);
  if (t > 2.3) sparks(g, t, 2.3, E.W / 2, E.H * 0.24, { n: 30, s: 1.2, seed: 12 });
} });
