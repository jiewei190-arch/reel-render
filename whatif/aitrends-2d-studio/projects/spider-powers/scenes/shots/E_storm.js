// E_storm.js — batch E part 1 (s099-s107): DAY 7 THE STORM, the rescue of Biscuit from the apple tree.
//   s099 DAY 7 card, the storm rolls into the garden, lightning on 'storm', MINA clutching her red scarf
//   s100 a gust rips the scarf off MINA's neck, it tumbles into the apple tree; whip-pan right
//   s101 BISCUIT scrambles up the trunk after it and is stuck on the branch; lightning on 'stuck'
//   s102 HERO climbs branch by branch the normal way (hands and feet, no sticking); RULE 2 chip on 'Rule'
//   s103 close on his forearm: the hairs bristle before the gust, he hugs the trunk, the gust HITS on 'hits.'
//   s104 at the top fork: one arm round the trunk, reaches for Biscuit, wobbles; looks trunk -> cat -> trunk
//   s105 the silk puff from the back end, ties the dragline on the branch, scarf burrito, lowers her hand over hand
//   s106 giant face HERO in the rain: determined -> joy -> smirk, EASY chip, the bundle descending behind him
//   s107 the bundle lands in MINA's arms, BISCUIT pops out, offended, grumble squiggle
// LEGAL: original hero only (sandy hair, mustard hoodie, purple gloves, green wellies). No red-and-blue, no mask/bodysuit, no web logo or
// web pattern, no wrist shooters (silk only from the back end, comedic), no swinging between buildings, no "spider sense" text or graphic.
import { E, registerShot, layer, ease, prog, clamp, lerp, alpha, shade, glow, rr, seg, circle, poly, text, FONTS, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { HERO, MINA } from '../cast.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { garden, gardenFg, lightningAt } from '../sets/garden.js';
import { silkLine, silkPuff, silkAnchor, airHairs, gloves } from '../sets/spider.js';
import { dayCard } from '../sets/spiderprops.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';

const RED = '#d4262e', CREAM = '#fff1dc';
const MINA_NS = { ...MINA, scarf: null };                                    // after the gust takes the scarf
const WET = { ...HERO, color: shade(HERO.color, -0.22) };                    // the hoodie soaked darker in the rain
const S = 1.9;
const shake = (t, t0, amp = 14) => { const u = t - t0; if (u < 0 || u > 0.6) return [0, 0]; const k = Math.exp(-u * 7) * amp; return [Math.sin(u * 70) * k, Math.cos(u * 55) * k * 0.6]; };
const addShake = (cam, d) => ({ ...cam, x: cam.x + d[0], y: cam.y + d[1] });

// the red scarf flying loose (a ribbon that flaps along its length)
function scarfRibbon(g, x, y, rot, t, s = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const pts = []; for (let i = 0; i <= 8; i++) pts.push([-i * 22, Math.sin(t * 14 + i * 0.9) * (4 + i * 2.2)]);
  seg(g, pts, 13, RED); seg(g, pts.slice(0, 4), 3, shade(RED, 0.35));
  for (const k of [7, 8]) seg(g, [pts[k], [pts[k][0] - 10, pts[k][1] + 8]], 3, shade(RED, -0.2));   // fringe at the end
  g.restore();
}
// normal tree climbing (faces +x = the trunk): alternate reach -> pull -> step, like a ladder
function treeClimb(ph, k = 1) {
  const a = Math.sin(ph) * k, b = Math.cos(ph) * k;
  return { head: [14, -206], sh: [8, -172], hip: [0, -98], eF: [30, -196 - a * 8], hF: [40, -236 - a * 22], eB: [26, -168 + a * 8], hB: [40, -200 + a * 22], kF: [30, -70 + b * 14], fF: [28, -24 + b * 16], kB: [20, -48 - b * 10], fB: [22, 0 - b * 10] };
}
// both arms round the trunk, cheek to the bark
const HUG = { head: [26, -200], sh: [12, -170], hip: [0, -98], eF: [44, -160], hF: [58, -176], eB: [40, -150], hB: [56, -164], kF: [28, -60], fF: [26, -6], kB: [18, -50], fB: [14, 0] };
// one arm round the trunk (behind), the other reaching out along the branch (+x)
const reachOut = (k) => ({ head: [10 + 8 * k, -206], sh: [6 + 6 * k, -172], hip: [0, -100], eB: [-18, -160], hB: [-30, -176], eF: [lerp(20, 56, k), lerp(-150, -186, k)], hF: [lerp(30, 104, k), lerp(-130, -196, k)], kF: [12, -52], fF: [16, 0], kB: [-8, -50], fB: [-14, 0] });
// the scarf burrito: red bundle with BISCUIT's head poking out (eyes 'offended' or open)
function burrito(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 2.2) * 0.08 + (o.rot ?? 0)); g.scale(s, s);
  rr(g, -46, -30, 92, 66, 30); g.fillStyle = RED; g.fill(); g.strokeStyle = '#140f1c'; g.lineWidth = 4; g.stroke();
  for (let i = 0; i < 3; i++) seg(g, [[-40 + i * 10, -22 + i * 18], [40 - i * 4, -10 + i * 18]], 4, shade(RED, -0.25));   // wrap folds
  seg(g, [[40, 4], [62, 20 + Math.sin(t * 8) * 6], [70, 40]], 9, RED);                                                          // loose end
  const hp = o.head ?? 1; if (hp > 0) {
    g.save(); g.translate(-6, -30 - 16 * hp); const c = '#2a2230';
    poly(g, [[-18, -8], [-14, -30], [-2, -14]], c); poly(g, [[18, -8], [14, -30], [2, -14]], c);                                   // ears
    for (let i = 0; i < 7; i++) seg(g, [[-16 + i * 5.5, -12], [-18 + i * 6, -22 - (i % 2) * 5]], 3, c);                          // soaked spiky fur
    circle(g, 0, 0, 20, c);
    for (const sx of [-7, 7]) { if (o.eyes === 'offended') { g.fillStyle = '#c8f07a'; g.beginPath(); g.ellipse(sx, 1, 4.6, 3.4, 0, 0, Math.PI); g.fill(); seg(g, [[sx - 6, -3 + (sx < 0 ? -1.6 : 1.6)], [sx + 6, -3 + (sx < 0 ? 1.6 : -1.6)]], 2.6, '#4a4054'); }
      else { circle(g, sx, 0, 5, '#c8f07a'); circle(g, sx + 0.5, 0, 1.6, '#0a0810'); } }
    seg(g, [[-3, 9], [0, 11], [3, 9]], 2, '#4a4054');
    g.restore();
  }
  g.restore();
}
const grumble = (g, x, y, t, k) => { if (k <= 0) return; g.save(); g.globalAlpha *= k; g.strokeStyle = CREAM; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 24; i++) { const px = x + i * 4, py = y - i * 1.2 + Math.sin(i * 1.4 + t * 12) * 7; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore(); };

// ---------------------------------------------------------------- s099 DAY 7: the storm rolls in
registerShot('s099', { draw(g, t, info) {
  const storm = lerp(0.3, 1, ease.inOut(clamp(t / info.dur))), flash = lightningAt(t, [1.69]);
  const cam = addShake(camMove(t, info.dur, { z: [0.94, 0.98], x: [-60, -20], y: [-130, -140] }), shake(t, 1.99, 8));
  const G = garden(g, t, cam, { view: 'garden', mood: 'dusk', storm, flash });
  layer(g, cam, 1, (g) => {
    const mx = G.CX - 120, pose = idle(poseAt(t, [[0, { ...POSES.holdFront, hF: [26, -170], hB: [20, -168] }], [1.75, { ...POSES.holdFront, hF: [22, -176], hB: [16, -174], head: [0, -204] }]]), t, 4);
    actor(g, 'MINA', { x: mx, y: G.GY + 40, s: 2.0, facing: 1, pose, expr: exprAt(t, [[0, 'worried'], [1.75, 'scared']]), blink: blinkFlag(t, 2.9, 4), look: lookToward(0.6, -0.6), rim: G.rim, t });
  });
  gardenFg(g, t, cam, { view: 'garden', storm });
  dayCard(g, t, { day: 7, title: 'THE STORM', at: 0.15, x: 330, y: 210, s: 0.62 });
} });

// ---------------------------------------------------------------- s100 the scarf flies into the tree
registerShot('s100', { draw(g, t, info) {
  const pan = ease.inOut(prog(t, 0.25, 2.1)), cam = camMove(t, info.dur, { z: [0.95, 0.97], x: [-180, -180], y: [-130, -150], drift: 0.6 });
  cam.x += pan * 520;
  const G = garden(g, t, cam, { view: 'garden', mood: 'dusk', storm: 1 }), tGust = 0.15, tIn = 2.01;
  const mx = G.CX - 380, my = G.GY + 40, neck = [mx + 2, my - 170 * 1.44];
  layer(g, cam, 1, (g) => {
    const lost = t >= tGust;
    actor(g, lost ? MINA_NS : MINA, { x: mx, y: my, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [0.35, 'reachHigh']]), t, 4), expr: exprAt(t, [[0, 'worried'], [0.3, 'shocked']]), blink: blinkFlag(t, 2.9, 4), look: lookToward(1, -0.8), rim: G.rim, t });
    if (lost && t < tIn + 0.25) {                                                          // the scarf tumbles up and across into the canopy
      const u = ease.inOut(prog(t, tGust, tIn)), tx = G.pos.treeX + 30, ty = G.GY - 620;
      const x = lerp(neck[0], tx, u), y = lerp(neck[1], ty, u) - Math.sin(u * Math.PI) * 260, a = 1 - prog(t, tIn, tIn + 0.25);
      g.save(); g.globalAlpha *= a; scarfRibbon(g, x, y, -0.4 + u * 5 + Math.sin(t * 6) * 0.4, t, 1.25 - u * 0.25); g.restore();
    }
    if (t > tIn) { const k = 1 - prog(t, tIn, tIn + 0.6); for (let i = 0; i < 9; i++) { const a = i * 0.7; circle(g, G.pos.treeX + 30 + Math.cos(a) * 90 * (1 - k), G.GY - 620 + Math.sin(a) * 60 * (1 - k) + (1 - k) * 60, 9 * k, alpha('#3f6a3a', k)); } }   // leaves shaken loose
  });
  gardenFg(g, t, cam, { view: 'garden', storm: 1 });
} });

// ---------------------------------------------------------------- s101 Biscuit goes after it
registerShot('s101', { draw(g, t, info) {
  const flash = lightningAt(t, [2.56]), cam = addShake(camMove(t, info.dur, { z: [0.94, 0.98], x: [-70, -40], y: [-60, -200] }), shake(t, 2.81, 7));
  const G = garden(g, t, cam, { view: 'tree', mood: 'dusk', storm: 1, flash, scarf: true }), P = G.pos;
  layer(g, cam, 1, (g) => {
    const up = ease.inOut(prog(t, 0.4, 1.1)), along = ease.inOut(prog(t, 1.1, 1.75)), tx = P.trunkX + 22;
    if (t < 0.4) cat(g, { x: tx - 260 + ease.out(prog(t, 0, 0.4)) * 230, y: G.GY + 20, s: 1.8, facing: 1, pose: 'walk', walk: t * 16, eyes: 'wide', t, rim: G.rim });
    else if (up < 1) { g.save(); const y = lerp(G.GY - 20, P.branchY + 20, up); g.translate(tx - 10, y); g.rotate(-Math.PI / 2 + 0.15); cat(g, { x: 0, y: 0, s: 1.8, facing: 1, pose: 'walk', walk: t * 22, eyes: 'wide', t }); g.restore(); }
    else if (along < 1) cat(g, { x: lerp(tx + 30, P.branchX, along), y: P.branchY - 4, s: 1.8, facing: 1, pose: 'walk', walk: t * 14, eyes: 'open', t, rim: G.rim });
    else cat(g, { x: P.branchX, y: P.branchY - 4, s: 1.8, facing: -1, pose: 'loaf', eyes: t > 2.5 ? 'wide' : 'auto', t, rim: G.rim });
  });
  gardenFg(g, t, cam, { view: 'tree', storm: 1 });
} });

// ---------------------------------------------------------------- s102 climb the normal way + RULE 2 chip
registerShot('s102', { draw(g, t, info) {
  const steps = [[0.25, 0.5], [0.5, 0.85], [1.05, 1.5], [1.9, 2.6], [2.9, 3.6]], rise = steps.reduce((a, [a0, a1]) => a + ease.inOut(prog(t, a0, a1)), 0);
  const cam = camMove(t, info.dur, { z: [1.02, 1.06], x: [-160, -150], y: [-40, -230] }), flash = 0;
  const G = garden(g, t, cam, { view: 'tree', mood: 'dusk', storm: 1, flash, scarf: true }), P = G.pos;
  layer(g, cam, 1, (g) => {
    cat(g, { x: P.branchX, y: P.branchY - 4, s: 1.8, facing: -1, pose: 'loaf', eyes: flash > 0.3 ? 'wide' : 'auto', t, rim: G.rim });
    const o = { x: P.trunkX - 64, y: G.GY + 10 - rise * 62, s: S, facing: 1 }, pose = treeClimb(rise * Math.PI, 1);
    actor(g, WET, { ...o, pose, expr: exprAt(t, [[0, 'determined'], [2.7, 'worried'], [3.3, 'determined']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(0.4, -1), rim: G.rim, t });
    gloves(g, o, pose, { t });
  });
  gardenFg(g, t, cam, { view: 'tree', storm: 1 });
  chip(g, t, { str: "RULE 2: BIG THINGS CAN'T STICK", at: 3.21, x: E.W * 0.3, y: E.H * 0.86 });
} });

// ---------------------------------------------------------------- s103 feel the gust coming, hug the trunk
registerShot('s103', { draw(g, t, info) {
  const tG = 1.13, tHug = 3.19, tHit = 4.41, flash = lightningAt(t, [tHit]);
  const hx = E.W / 2 - 260 - 64, hy = gardenGroundY() - 250;
  const z = lerp(1.32, 1.0, ease.inOut(prog(t, 0.2, info.dur - 0.2))), fx = lerp(hx + 70, hx + 30, ease.inOut(prog(t, 0.2, info.dur))), fy = lerp(hy - 330, hy - 230, ease.inOut(prog(t, 0.2, info.dur)));
  const cam = addShake({ z, x: fx - E.W / 2 + Math.sin(t * 0.6) * 6, y: fy - E.H / 2, r: Math.sin(t * 0.4) * 0.002 }, shake(t, tHit, 20));
  const G = garden(g, t, cam, { view: 'tree', mood: 'dusk', storm: 1, flash }), P = G.pos;
  layer(g, cam, 1, (g) => {
    const o = { x: P.trunkX - 64, y: hy, s: S, facing: 1 }, hug = ease.inOut(prog(t, tHug - 0.15, tHug + 0.3));
    const pose = blend(treeClimb(0.2, 0.3), HUG, hug);
    actor(g, WET, { ...o, pose, expr: exprAt(t, [[0, 'determined'], [tG, 'surprised'], [tHug, 'worried'], [tHit + 0.25, 'determined']]), blink: t > tHit && t < tHit + 0.3 ? true : blinkFlag(t, 3.4, 2), look: t < tHug ? lookToward(-1, 0) : lookToward(1, 0.2), rim: G.rim, t });
    gloves(g, o, pose, { t });
    const fa = [o.x + pose.eF[0] * S - 6, o.y + pose.eF[1] * S - 4];                       // the bare forearm (sleeve pushed up)
    airHairs(g, t, fa[0], fa[1] + 30, clamp(prog(t, tG - 0.35, tG) * (1 - prog(t, tG + 1.0, tG + 1.4)) + prog(t, tHit - 0.9, tHit - 0.5) * (1 - prog(t, tHit + 0.3, tHit + 0.8))));
    for (const [a0, a1] of [[tG - 0.8, tG + 0.1], [tHit - 1.1, tHit]]) { const u = prog(t, a0, a1); if (u > 0 && u < 1) for (let i = 0; i < 4; i++) {   // wavy air arriving from the left, a beat before the gust
      const x0 = lerp(fa[0] - 700, fa[0] - 40, u) - i * 70, y0 = fa[1] - 60 + i * 34; g.strokeStyle = alpha('#e8f4ff', 0.45 * Math.sin(u * Math.PI)); g.lineWidth = 3; g.beginPath();
      for (let k = 0; k <= 12; k++) { const px = x0 + k * 14, py = y0 + Math.sin(k * 0.9 + t * 10) * 6; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); } }
  });
  gardenFg(g, t, cam, { view: 'tree', storm: 1 });
  const hit = prog(t, tHit, tHit + 0.2) * (1 - prog(t, tHit + 0.5, tHit + 0.77));        // the gust slams leaves + rain sideways
  if (hit > 0) { g.save(); g.globalAlpha *= hit; for (let i = 0; i < 40; i++) { const y = (i * 97) % E.H, x = ((i * 233 + t * 3200) % (E.W + 400)) - 200; seg(g, [[x, y], [x + 180, y + 26]], 3, alpha('#dfe8ff', 0.5)); if (i % 4 === 0) circle(g, x + 90, y + 13, 9, alpha('#4a7a3a', 0.9)); } g.restore(); }
} });
const gardenGroundY = () => E.H * 0.8;
const blend = (a, b, k) => { const p = {}; for (const key in a) p[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)]; return p; };

// ---------------------------------------------------------------- s104 at the top: can't hold on and hold a cat
// the hero stands on the low fork, left of the trunk; Biscuit is out on THE branch, just past his reach
const topSpot = (P) => ({ x: P.trunkX - 30, y: P.branchY + 250 });
registerShot('s104', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.12, 1.15], x: [-60, -40], y: [-150, -160], r: [0, 0] });
  cam.r += Math.sin(t * 1.3) * 0.008;                                                       // gentle sway in the wind
  const G = garden(g, t, cam, { view: 'tree', mood: 'dusk', storm: 1, scarf: true }), P = G.pos, H = topSpot(P);
  layer(g, cam, 1, (g) => {
    cat(g, { x: P.branchX + 20, y: P.branchY - 4, s: 1.8, facing: -1, pose: 'loaf', eyes: 'auto', t, rim: G.rim });
    const k = ease.out(prog(t, 0.9, 1.25)) * (1 - ease.inOut(prog(t, 1.4, 1.75)) * 0.7), wob = prog(t, 1.15, 1.3) * (1 - prog(t, 1.6, 2.0));
    const o = { x: H.x, y: H.y, s: S, facing: 1 }, pose = idle(reachOut(k), t, 3);
    g.save(); g.translate(o.x, o.y); g.rotate(Math.sin(t * 22) * 0.05 * wob); g.translate(-o.x, -o.y);
    const lk = t < 1.85 ? lookToward(1, -0.3) : t < 2.05 ? lookToward(-1, -0.2) : t < 2.4 ? lookToward(1, -0.3) : lookToward(-1, 0);
    actor(g, WET, { ...o, pose, expr: exprAt(t, [[0, 'determined'], [0.99, 'worried'], [1.85, 'nervous']]), blink: blinkFlag(t, 3.2, 3), look: lk, rim: G.rim, t });
    gloves(g, o, pose, { t });
    g.restore();
  });
  gardenFg(g, t, cam, { view: 'tree', storm: 1 });
} });

// ---------------------------------------------------------------- s105 the silk line rescue
registerShot('s105', { draw(g, t, info) {
  const tTie = 0.57, tWrap = 2.13, tLow = 3.61, flash = lightningAt(t, [3.91]);
  const tilt = ease.inOut(prog(t, tLow - 0.1, info.dur)), cam = camMove(t, info.dur, { z: [1.1, 1.06], x: [-40, -20], y: [-160, -150] });
  cam.y += tilt * 210;
  const G = garden(g, t, cam, { view: 'tree', mood: 'dusk', storm: 1, flash, scarf: t < tWrap }), P = G.pos, H = topSpot(P);
  layer(g, cam, 1, (g) => {
    const o = { x: H.x, y: H.y, s: S, facing: 1 };
    const knot = [P.trunkX + 70, P.branchY + 6], low = ease.inOut(prog(t, tLow, info.dur + 0.4));
    const lowerPose = { ...reachOut(0.55), eF: [44, -176 + Math.sin(t * 9) * 8], hF: [70, -168 + Math.sin(t * 9) * 16], eB: [30, -150], hB: [56, -140 - Math.sin(t * 9) * 16] };
    const pose = idle(poseAt(t, [[0, 'crouch'], [0.3, { ...POSES.crouch, head: [10, -160] }], [1.0, reachOut(0.7)], [tWrap - 0.2, reachOut(0.9)], [tWrap + 0.6, reachOut(0.5)], [tLow, lowerPose]]), t, 2);
    actor(g, WET, { ...o, pose, expr: exprAt(t, [[0, 'determined'], [tTie + 0.05, 'surprised'], [1.0, 'determined'], [tLow + 0.6, 'smirk']]), blink: blinkFlag(t, 3.1, 2), look: t < tWrap ? lookToward(1, -0.2) : lookToward(0.7, 0.7), rim: G.rim, t });
    gloves(g, o, pose, { t });
    const a = silkAnchor(o, pose); silkPuff(g, t, tTie, a[0], a[1], { dir: -1 });          // pfft: from the back end
    const hand = [o.x + pose.hF[0] * S, o.y + pose.hF[1] * S];
    if (t > tTie + 0.1) {
      const k = ease.out(prog(t, tTie + 0.1, tTie + 0.6)); silkLine(g, [a[0], a[1]], [lerp(a[0], knot[0], k), lerp(a[1], knot[1], k)], { t, sag: 10, k: 1, w: 2 });
      if (k >= 1) { g.strokeStyle = alpha('#f4f6ff', 0.9); g.lineWidth = 3; g.beginPath(); g.ellipse(knot[0], knot[1] + 2, 16, 10, 0.3, 0, 7); g.stroke(); }     // the knot round the branch
    }
    if (t < tWrap) cat(g, { x: P.branchX + 20, y: P.branchY - 4, s: 1.8, facing: -1, pose: 'loaf', eyes: 'auto', t, rim: G.rim });
    else {
      const b0 = [P.branchX - 10, P.branchY - 20], bx = lerp(b0[0], b0[0] + 30, low), by = lerp(b0[1], G.GY - 120, low), pop = ease.outBack(prog(t, tWrap, tWrap + 0.35));
      if (t > tLow - 0.2) { silkLine(g, knot, hand, { t, sag: 6, w: 2 }); silkLine(g, hand, [bx, by - 40], { t, sag: 4, w: 2.2 }); }
      g.save(); g.translate(bx, by); g.scale(pop, pop); burrito(g, 0, 0, 1.15, t, { eyes: 'offended' }); g.restore();
      if (flash > 0.4 && t > tLow) glow(g, (hand[0] + bx) / 2, (hand[1] + by) / 2, 160, '#ffffff', 0.4 * flash);   // the line catches the lightning
    }
  });
  gardenFg(g, t, cam, { view: 'tree', storm: 1 });
} });

// ---------------------------------------------------------------- s106 GIANT FACE: one soggy cat is easy
registerShot('s106', { draw(g, t, info) {
  const flash = lightningAt(t, [0.41]), z = lerp(1.0, 1.06, ease.inOut(clamp(t / info.dur)));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#141a2a', '#26304a', '#3a3040']); g.fillRect(0, 0, E.W, E.H);
  FX.clouds(g, { y: E.H * 0.08, h: 260, count: 7, color: '#0e121c', a: 0.6, seed: 3 });
  g.save(); g.filter = 'blur(6px)';                                                          // soft-focus behind: the bundle going down on the glinting line
  const by = lerp(E.H * 0.3, E.H * 0.7, ease.inOut(clamp(t / info.dur))); silkLine(g, [E.W * 0.8, -20], [E.W * 0.8, by - 40], { t, sag: 2, w: 3 }); burrito(g, E.W * 0.8, by, 1.5, t, { head: 1 });
  g.restore();
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  giantFace(g, E.W * 0.4, E.H * 0.56, 330, { who: 'HERO', f: faceAt(t, [[0, 'determined'], [0.77, 'joy'], [1.09, 'smirk']]), blink: blinkAmt(t, 3.0, 2), rimColor: '#dfe8ff', rimSide: 1 });
  for (let i = 0; i < 4; i++) { const u = ((t * 1.3 + i * 0.27) % 1), x = E.W * 0.4 - 160 + i * 90; circle(g, x, E.H * 0.56 - 330 + u * 160, 9 * (1 - u * 0.5), alpha('#b8d8ff', 0.8 * (1 - u))); }   // the sandy hair dripping
  g.restore();
  FX.rain(g, t, { angle: 0.2, count: 160, a: 0.3, color: '#c8d4ee', seed: 9 });
  if (flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#dfe8ff', 0.4 * flash); g.fillRect(0, 0, E.W, E.H); g.restore(); }
  chip(g, t, { str: 'EASY', at: 1.09, x: E.W * 0.74, y: E.H * 0.2 });
} });

// ---------------------------------------------------------------- s107 Biscuit lands in Mina's arms, furious
registerShot('s107', { draw(g, t, info) {
  const storm = lerp(1, 0.6, ease.inOut(clamp(t / info.dur))), tLand = 0.45, tFur = 1.57;
  const cam = addShake(camMove(t, info.dur, { z: [1.42, 1.5], x: [250, 270], y: [150, 140] }), shake(t, tLand, 6));
  const G = garden(g, t, cam, { view: 'tree', mood: 'dusk', storm }), P = G.pos;
  layer(g, cam, 1, (g) => {
    const mx = P.trunkX + 520, my = G.GY + 40, ks = 2.0 * 0.72;
    const pose = idle(poseAt(t, [[0, 'reachHigh'], [tLand, { ...POSES.holdFront, hF: [30, -138], hB: [24, -140] }], [1.9, { ...POSES.holdFront, hF: [24, -146], hB: [18, -148], head: [10, -200] }]]), t, 4);
    const arms = [mx + 30 * ks, my - 150 * ks], fall = ease.in(prog(t, -0.2, tLand)), bx = arms[0], by = lerp(arms[1] - 520, arms[1] - 30, fall);
    silkLine(g, [bx + 6, -400], [bx, by - 44], { t, sag: 3, w: 2.2 });
    actor(g, MINA_NS, { x: mx, y: my, s: 2.0, facing: -1, pose, expr: exprAt(t, [[0, 'worried'], [tLand + 0.2, 'surprised'], [1.0, 'joy']]), blink: blinkFlag(t, 2.9, 4), look: t < tLand ? lookToward(0, -1) : lookToward(0, 0.5), rim: G.rim, t });
    const head = ease.outBack(prog(t, 0.9, 1.25)); burrito(g, bx - 10, by + (t > tLand ? Math.sin((t - tLand) * 16) * 6 * Math.exp(-(t - tLand) * 5) : 0), 1.2, t, { head, eyes: t > tFur - 0.1 ? 'offended' : 'open', rot: -0.1 });
    grumble(g, bx + 30, by - 90, t, prog(t, tFur, tFur + 0.2) * (1 - prog(t, tFur + 0.9, tFur + 1.1)));
  });
  gardenFg(g, t, cam, { view: 'tree', storm });
  atmos(g, t, cam, { color: G.M.key });
} });
