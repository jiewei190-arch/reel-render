// C_s075_s081_year2.js — ep 3 batch C: YEAR 2, the hair scare, Rule 4, genes.
//   s075 med: YEAR 2 card flips on 'Year', winter bathroom (frosted window corners), HERO with a towel on his shoulders looks down at the drain on 'drain'
//   s076 insert: his fingers lift a dripping hair clump on 'lot'; whip to the door: DEV pops in, hands on cheeks, gasps on 'gasps', phone already recording
//   s077 face: giant DEV lip-syncs "It's happening." (shocked -> awe -> worried), phone glow on his cheek, punch-in + shake
//   s078 rule: RULE 4 "YOUR HAIR LISTENS TO YOUR GENES, NOT YOUR PUSH-UPS." over the dimmed bathroom; the 50-100 counter ticks under the banner on 'fifty'
//   s079 bp: FIG 10 - FOLLICLE: the follicle cycle draws on; a DNA helix grows from the root on 'genetic', 'MOSTLY GENES'
//   s080 bp: FIG 11 - TWINS: identical twins, the GENES bar fills to ~80% on 'eighty'
//   s081 insert: the hallway photo wall: DAD, GRANDPA, UNCLE, all big dark curls and the same hairline; a gold dashed line links them to HERO's photo on 'genes'
// The HERO keeps his BIG DARK CURLS in every frame (the scare is about the drain, never his head).
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad, talkAmount } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, headPos } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { home3, home3Fg, hairClump } from '../sets/home3.js';
import { follicle, hairCycle, hairCounter, twins } from '../sets/body.js';
import { board, label } from '../sets/bp.js';
import { ruleCard, chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpShake } from '../sets/jump.js';
import { wt, push, skip, helix } from './C_lib.js';

const frost = (g, a = 1) => { g.save(); for (const [cx, cy] of [[0, 0], [E.W, 0], [0, E.H], [E.W, E.H]]) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 420); gr.addColorStop(0, `rgba(230,242,255,${0.45 * a})`); gr.addColorStop(1, 'rgba(230,242,255,0)'); g.fillStyle = gr; g.fillRect(cx - 420, cy - 420, 840, 840); } g.restore(); };

registerShot('s075', { draw(g, t, info) {
  const tYear = wt(info, 'Year', 0.15), tDrain = wt(info, 'drain', 2.91), tShower = wt(info, 'shower', 2.63), s = 1.9;
  const cam = camMove(t, info.dur, { z: [1.16, 1.24], x: [120, 200], y: [20, 80] });
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'dawn', hair: 1, steam: 0.5 }), p = H.pos, hx = p.showerL - 200;
  layer(g, cam, 1, (g) => {
    const o = { x: hx, y: H.GY + 10, s, facing: 1, pose: idle(t > tDrain ? reaction('shock', t, tDrain, 'relaxed') : POSES.relaxed, t, 2), expr: exprAt(t, [[0, 'sleepy'], [tShower, 'neutral'], [tDrain, 'shocked']]), blink: blinkFlag(t, 3.2, 2),
      look: t > tShower - 0.2 ? lookToward(0.7, 0.8) : lookToward(-0.3, 0), rim: H.rim, t };
    actor(g, 'HERO', o);
    // towel over the shoulders + drips off the wet curls
    const [hX, hY, hr] = headPos({ ...o, pose: o.pose }); g.fillStyle = '#e8ecf4'; g.beginPath(); g.ellipse(hX - 6, hY + hr * 1.5, hr * 1.5, hr * 0.5, 0.1, Math.PI, 0); g.fill(); rr(g, hX - hr * 1.2, hY + hr * 1.4, hr * 0.6, hr * 2.4, 8); g.fill();
    for (let i = 0; i < 4; i++) { const u = (t * 1.4 + i / 4) % 1; circle(g, hX - hr + i * hr * 0.6, hY + hr * 0.6 + u * 120, 4, alpha('#cfeaff', 0.85 * (1 - u))); }
  });
  home3Fg(g, t, cam, { room: 'bathroom' }); frost(g, 1); atmos(g, t, cam, { color: '#f0f6ff', far: 14, near: 4 });
  skip(g, t, [[0, 'YEAR 1'], [tYear, 'YEAR 2']]);
} });

registerShot('s076', { draw(g, t, info) {
  const tLot = wt(info, 'lot', 0.29), tDev = wt(info, 'Dev', 1.59), tGasp = wt(info, 'gasps', 1.73), whip = ease.inOut(prog(t, tDev - 0.25, tDev + 0.1));
  if (t < tDev - 0.05) {
    // insert on the drain: green sleeve, fingers pinch the clump and lift it, dripping
    const H0 = home3(g, t, { z: 1, x: 0, y: 0 }, { room: 'bathroom', mood: 'dawn', hair: 0 }), dx = H0.pos.drainX, dy = H0.pos.drainY;
    const cam = { z: 2.6, x: dx - E.W / 2 + 40, y: dy - E.H / 2 - 120 + Math.sin(t * 2) * 4 };
    const H = home3(g, t, cam, { room: 'bathroom', mood: 'dawn', hair: 0 });
    const lift = ease.out(prog(t, tLot - 0.1, tLot + 0.6)) * 170;
    layer(g, cam, 1, (g) => {
      hairClump(g, dx, dy - lift, 1.3, t);
      for (let i = 0; i < 3; i++) { const u = ((t * 2 + i / 3) % 1); if (lift > 10) circle(g, dx - 10 + i * 10, dy - lift + 20 + u * lift, 3, alpha('#cfeaff', 0.85 * (1 - u))); }
      seg(g, [[dx + 240, dy - lift - 340], [dx + 40, dy - lift - 40]], 34, '#3f9a4a'); circle(g, dx + 26, dy - lift - 26, 26, '#2a1e18'); seg(g, [[dx + 16, dy - lift - 16], [dx + 2, dy - lift + 4]], 9, '#2a1e18'); seg(g, [[dx + 36, dy - lift - 10], [dx + 14, dy - lift + 8]], 9, '#2a1e18');
    });
    atmos(g, t, cam, { color: '#f0f6ff', far: 10, near: 3 });
  } else {
    // the doorway: DEV leans in, hands on cheeks, phone up and recording
    const cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [-760, -740], y: [-60, -70] });
    const H = home3(g, t, cam, { room: 'bathroom', mood: 'dawn', hair: 1 }), x = H.CX - 760;
    layer(g, cam, 1, (g) => {
      g.fillStyle = '#3a2a2a'; g.fillRect(x - 260, H.GY - 720, 40, 730); g.fillRect(x + 220, H.GY - 720, 40, 730); g.fillRect(x - 260, H.GY - 740, 520, 40);           // door frame
      g.fillStyle = '#2a2030'; g.fillRect(x - 220, H.GY - 700, 440, 710);                                                                                          // dark hallway beyond
      const pin = ease.outBack(prog(t, tDev - 0.05, tDev + 0.3)), dvx = lerp(x - 300, x, pin);
      const cheeks = { ...POSES.stand, eF: [22, -150], hF: [16, -196], eB: [-20, -150], hB: [-14, -196] };
      const o = { x: dvx, y: H.GY + 10, s: 1.9, facing: 1, pose: idle(t > tGasp ? cheeks : POSES.holdFront, t, 5), expr: exprAt(t, [[0, 'surprised'], [tGasp, 'shocked']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(1, 0.2), rim: H.rim, t };
      actor(g, 'DEV', o);
      // the phone, recording (REC dot blinks)
      const px = dvx + 60, py = H.GY - 330; rr(g, px - 22, py - 40, 44, 80, 8); g.fillStyle = '#16121c'; g.fill(); rr(g, px - 18, py - 36, 36, 72, 6); g.fillStyle = '#3a5a8a'; g.fill(); if (Math.floor(t * 2) % 2 === 0) circle(g, px + 10, py - 26, 5, '#ff3a3a');
      glow(g, px, py, 120, '#8fb8ff', 0.25);
    });
    if (whip < 1) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i++) seg(g, [[0, i * 36], [E.W, i * 36 + 10]], 6, alpha('#ffffff', 0.08 * (1 - whip))); g.restore(); }
    home3Fg(g, t, cam, { room: 'bathroom' }); atmos(g, t, cam, { color: '#f0f6ff', far: 14, near: 4 });
  }
} });

registerShot('s077', { draw(g, t, info) {
  const st = info.shot.start, tHap = wt(info, 'happening', 0.45), punch = ease.out(prog(t, 0, 0.5));
  const cam = camMove(t, info.dur, { z: [1.1, 1.14], x: [-740, -720], y: [-120, -120] });
  blurLayer(g, 10, (g) => home3(g, t, cam, { room: 'bathroom', mood: 'dawn', hair: 1 }), null, 1); veil(g, '#140f1c', 0.3);
  const [sx, sy] = jumpShake(t, tHap, 4), z = lerp(1.0, 1.12, punch), cx = E.W * 0.47 + sx, cy = E.H * 0.56 + sy;
  const talk = talkAmount(st + t, st + 0.1, st + tHap + 0.55), f = faceAt(t, [[0, 'shocked'], [0.5, 'awe'], [1.4, 'worried']]);
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  giantFace(g, cx, cy, 320, { who: 'DEV', f: { ...f, open: Math.max(f.open ?? 0, talk * 0.8) }, rimSide: 1, rimColor: '#9fc8ff', blink: blinkAmt(t, 3.3, 2), breath: Math.sin(t * 2.6), tilt: Math.sin(t * 0.9) * 0.02 });
  g.restore();
  glow(g, E.W * 0.75, E.H * 0.85, 420, '#8fb8ff', 0.3);                                                       // phone screen glow from below-right
  atmos(g, t, cam, { color: '#c9d4ff', far: 10, near: 4 });
} });

registerShot('s078', { draw(g, t, info) {
  const tFifty = wt(info, 'fifty', 2.47), tHun = wt(info, 'hundred', 3.27), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-30, 30] });
  ruleCard(g, t, info, { n: 4, title: 'YOUR HAIR LISTENS TO YOUR GENES, NOT YOUR PUSH-UPS.', bg: (g, t) => { blurLayer(g, 10, (g) => home3(g, t, cam, { room: 'bathroom', mood: 'dawn', hair: 1 }), null, 1); veil(g, '#140f1c', 0.25); } });
  const k = ease.outBack(prog(t, tFifty - 0.1, tFifty + 0.3)) * clamp((info.dur - t) / 0.4); if (k > 0.01) { g.save(); g.translate(E.W / 2, E.H * 0.885); g.scale(0.78 * k, 0.78 * k);
    hairCounter(g, t, { x: 0, y: 0, value: lerp(0, 74, ease.out(prog(t, tFifty, tHun + 0.6))), k: 1 }); g.restore(); }
} });

registerShot('s079', { draw(g, t, info) {
  const tBald = wt(info, 'baldness', 0.65), tGen = wt(info, 'genetic', 1.95);
  board(g, t, { title: 'FIG 10 - THE FOLLICLE', fig: 'HAIR IS MOSTLY GENES' });
  const ph = lerp(0.3, 2.6, ease.inOut(prog(t, 0.2, info.dur)));
  push(g, t, info.dur, () => {
    const F = follicle(g, t, { x: E.W * 0.26, y: E.H * 0.6, s: 1.0, k: ease.out(prog(t, 0.05, 1.0)), phase: ph });
    hairCycle(g, t, { x: E.W * 0.66, y: E.H * 0.46, r: 190, k: ease.out(prog(t, 0.3, 1.6)), phase: ph });
    // the DNA helix grows down out of the follicle root on 'genetic'
    const hk = ease.out(prog(t, tGen - 0.2, tGen + 0.6)); if (hk > 0 && F.bulb) helix(g, t, F.bulb[0] - 50, F.bulb[1] + 50, F.bulb[1] + 320, hk, { amp: 34, turns: 2 });
    if (F.bulb) label(g, t, { at: [F.bulb[0] - 30, F.bulb[1] + 180], to: [E.W * 0.44, E.H * 0.84], str: 'MOSTLY GENES', start: tGen + 0.1 });
  });
  FX.dust(g, t, { count: 14, color: '#bcd4ff', a: 0.1, seed: 31 }); void tBald;
} });

registerShot('s080', { draw(g, t, info) {
  const tEighty = wt(info, 'eighty', 1.53);
  board(g, t, { title: 'FIG 11 - TWINS', fig: 'TWIN STUDIES' });
  push(g, t, info.dur, () => twins(g, t, { x: E.W * 0.5, y: E.H * 0.46, s: 1.0, k: ease.out(prog(t, 0.05, 1.2)), pct: ease.out(prog(t, tEighty - 0.3, tEighty + 0.5)) }));
  FX.dust(g, t, { count: 14, color: '#bcd4ff', a: 0.1, seed: 31 });
} });

// a framed family portrait: head + shoulders, BIG DARK CURLS, the same hairline; name plate under it
function portrait(g, x, y, s, t, o = {}) {
  const U = S().ui, w = 300 * s, h = 360 * s; g.save(); g.translate(x, y); g.rotate(o.rot ?? 0);
  rr(g, -w / 2 - 18 * s, -h / 2 - 18 * s, w + 36 * s, h + 36 * s, 6); g.fillStyle = o.frame || '#6a4a32'; g.fill();
  rr(g, -w / 2, -h / 2, w, h, 4); g.fillStyle = o.bg || '#9ab8d8'; g.fill(); g.save(); rr(g, -w / 2, -h / 2, w, h, 4); g.clip();
  g.fillStyle = o.shirt || '#5a6a8a'; g.beginPath(); g.ellipse(0, h * 0.5, w * 0.48, h * 0.3, 0, Math.PI, 0); g.fill();
  const hr = 70 * s, hy = -h * 0.02; for (let i = 0; i < 11; i++) { const a = Math.PI * (1.0 + i * 0.1); circle(g, Math.cos(a) * hr * 0.95, hy + Math.sin(a) * hr * 0.95 - 6 * s, hr * 0.36, '#14101a'); }   // the curls
  circle(g, 0, hy, hr, '#2a1e22'); if (o.beard) { g.fillStyle = '#e8e8ee'; g.beginPath(); g.ellipse(0, hy + hr * 0.6, hr * 0.7, hr * 0.4, 0, 0, Math.PI); g.fill(); }
  if (o.glasses) { ring(g, -hr * 0.34, hy - 4, hr * 0.22, 3, '#d8d0c0'); ring(g, hr * 0.34, hy - 4, hr * 0.22, 3, '#d8d0c0'); }
  circle(g, -hr * 0.32, hy - 4, 5 * s, '#f6f2ea'); circle(g, hr * 0.32, hy - 4, 5 * s, '#f6f2ea'); g.strokeStyle = '#f6f2ea'; g.lineWidth = 4 * s; g.beginPath(); g.arc(0, hy + hr * 0.3, hr * 0.3, 0.2, Math.PI - 0.2); g.stroke();
  g.restore();
  rr(g, -90 * s, h / 2 + 30 * s, 180 * s, 44 * s, 6); g.fillStyle = '#d8b060'; g.fill(); text(g, o.name, 0, h / 2 + 52 * s, { size: 26 * s, color: '#2a1e14', font: FONTS.ui, weight: 900, spacing: 2 });
  g.restore();
  return [x, y + hy - hr * 0.95];          // hairline point
}
registerShot('s081', { draw(g, t, info) {
  const tGenes = wt(info, 'genes', 1.33), U = S().ui, cam = camMove(t, info.dur, { z: [1.02, 1.06], x: [-60, 60] });
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 - cam.x, -E.H / 2);
  // hallway wall: striped wallpaper, a dado rail, a warm wall lamp (key)
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#6a5a7a', '#4a3a58']); g.fillRect(-200, -100, E.W + 400, E.H + 200);
  for (let x = -200; x < E.W + 200; x += 80) g.fillRect(x, -100, 26, E.H + 200), g.fillStyle = alpha('#ffffff', 0.04);
  g.fillStyle = '#3a2a3a'; g.fillRect(-200, E.H * 0.86, E.W + 400, 30); glow(g, E.W * 0.5, E.H * 0.05, 700, '#ffcf8f', 0.35);
  const A = portrait(g, E.W * 0.2, E.H * 0.36, 0.95, t, { name: 'GRANDPA', glasses: true, beard: true, bg: '#c8b898', frame: '#5a3a22', rot: -0.03, shirt: '#6a5a4a' });
  const B = portrait(g, E.W * 0.47, E.H * 0.33, 1.0, t, { name: 'DAD', bg: '#9ab8d8', rot: 0.02, shirt: '#3a5a8a' });
  const C = portrait(g, E.W * 0.74, E.H * 0.37, 0.92, t, { name: 'UNCLE', bg: '#b8d8a8', frame: '#7a5a3a', rot: -0.02, shirt: '#8a3a3a' });
  const D = portrait(g, E.W * 0.47, E.H * 0.78, 0.62, t, { name: 'ME', bg: '#e8c8a8', frame: '#3f9a4a', rot: 0.03, shirt: '#3f9a4a' });
  // the gold dashed line along the three hairlines, then down to HERO's photo on 'genes'
  const k1 = ease.inOut(prog(t, 0.3, 1.2)), k2 = ease.inOut(prog(t, tGenes - 0.1, tGenes + 0.5));
  g.save(); g.setLineDash([16, 12]); g.strokeStyle = U.gold; g.lineWidth = 5; g.beginPath(); g.moveTo(...A); g.lineTo(lerp(A[0], B[0], clamp(k1 * 2)), lerp(A[1], B[1], clamp(k1 * 2))); if (k1 > 0.5) g.lineTo(lerp(B[0], C[0], clamp(k1 * 2 - 1)), lerp(B[1], C[1], clamp(k1 * 2 - 1))); g.stroke();
  if (k2 > 0) { g.beginPath(); g.moveTo(...B); g.lineTo(lerp(B[0], D[0], k2), lerp(B[1], D[1], k2)); g.stroke(); } g.restore();
  for (const P of [A, B, C]) if (k1 > 0.2) circle(g, P[0], P[1], 9, U.gold);
  if (k2 >= 1) { circle(g, D[0], D[1], 12, U.gold); FX.sparkle(g, D[0], D[1], 30 * (0.8 + 0.2 * Math.sin(t * 6)), '#fff3d0', 0.9); }
  g.restore();
  chip(g, t, { str: 'SAME HAIRLINE', at: tGenes + 0.3, x: E.W * 0.78, y: E.H * 0.86 });
  atmos(g, t, cam, { color: '#ffd8b0', far: 12, near: 4 });
} });
