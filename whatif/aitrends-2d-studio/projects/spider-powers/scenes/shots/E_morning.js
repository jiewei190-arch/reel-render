// E_morning.js — batch E part 2 (s108-s111): the next morning, Pip waves, the real-life staring contest.
//   s108 bedroom at dawn: tilt down from the empty sunlit ceiling to HERO waking in bed (Biscuit asleep on him under the red scarf)
//   s109 the shed window: PIP on the sill waves one leg, tilts its head
//   s110 REAL LIFE: the frame desaturates, HERO crouched nose to nose with PIP on the workbench, both staring
//   s111 giant face HERO loses the staring contest: blinks on 'nothing', watering eyes, PIP 1 - YOU 0
// LEGAL: original hero only. No red-and-blue, no mask/bodysuit, no web logo or web pattern, no wrist shooters, no building swinging,
// no "spider sense" text or graphic.
import { E, registerShot, layer, veil, ease, prog, clamp, lerp, alpha, shade, glow, rr, seg, circle, poly, text, FONTS, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { HERO } from '../cast.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { garden, gardenFg } from '../sets/garden.js';
import { home3, home3Fg } from '../sets/home3.js';
import { pip, gloves } from '../sets/spider.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';

const RED = '#d4262e', CREAM = '#fff1dc', S = 1.9;

// ---------------------------------------------------------------- s108 next morning: in bed, not on the ceiling
registerShot('s108', { draw(g, t, info) {
  const tWake = 0.91, tilt = ease.inOut(prog(t, tWake - 0.2, tWake + 0.9));
  const cam = camMove(t, info.dur, { z: [1.6, 1.66], x: [-690, -680], y: [0, 0], drift: 0.5 });
  cam.y += lerp(-480, 130, tilt);
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 7, clock: '7:12' }), P = H.pos, GY = H.GY ?? E.H * 0.8;
  layer(g, cam, 1, (g) => {
    // HERO lying on the bed, head on the pillow (right end), the mustard hoodie on the bedpost
    const bx = P.bedX, top = P.bedTop - 26, look = t > 1.67 ? lookToward(0.2, -1) : lookToward(1, -0.2);
    rr(g, bx + 236, P.bedTop - 260, 70, 120, 18); g.fillStyle = HERO.color; g.fill(); seg(g, [[bx + 271, P.bedTop - 250], [bx + 271, P.bedTop - 150]], 3, shade(HERO.color, -0.3));   // hoodie on the post
    actor(g, 'HERO', { x: bx - 150, y: P.bedTop + 90, s: S, facing: 1, rot: Math.PI / 2, pose: idle(POSES.lie, t, 2), expr: exprAt(t, [[0, 'sleepy'], [1.3, 'neutral'], [2.0, 'smile']]), blink: t < 1.25 ? true : blinkFlag(t, 3.2, 2), look, t });
    rr(g, bx - 380, P.bedTop - 60, 470, 70, 26); g.fillStyle = '#5a7aa0'; g.fill(); g.strokeStyle = '#2a3040'; g.lineWidth = 4; g.stroke();     // the duvet over him
    const breathe = Math.sin(t * 1.6) * 3;
    cat(g, { x: bx - 120, y: P.bedTop - 54 + breathe, s: 1.5, facing: 1, pose: 'loaf', eyes: 'blink', t });                           // Biscuit asleep on his chest, forgiven
    seg(g, [[bx - 170, P.bedTop - 92 + breathe], [bx - 110, P.bedTop - 100 + breathe], [bx - 56, P.bedTop - 88 + breathe], [bx - 40, P.bedTop - 50]], 12, RED);   // the red scarf draped over her
    if (t > 2.0) for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; text(g, 'z', bx - 20 + u * 40, P.bedTop - 150 - u * 90, { size: 30 + i * 6, color: alpha(CREAM, 0.6 * (1 - u)), font: FONTS.ui, weight: 900 }); }
  });
  // the empty ceiling with a sunbeam where he was stuck on day 0 (above the room's wall)
  layer(g, cam, 1, (g) => { const cy = GY - 1180; g.fillStyle = linGrad(g, 0, cy - 600, 0, cy + 60, ['#e8dcc8', '#d6c8b0']); g.fillRect(-E.W, cy - 600, E.W * 3, 600); seg(g, [[-E.W, cy], [E.W * 2, cy]], 8, '#a8987c');
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#ffd8a0', 0.18); g.beginPath(); g.moveTo(P.windowX - 200, cy); g.lineTo(P.windowX + 300, cy); g.lineTo(P.windowX + 500, cy - 300); g.lineTo(P.windowX + 60, cy - 300); g.closePath(); g.fill(); g.restore(); });
  home3Fg(g, t, cam, { room: 'bedroom' });
  FX.dust(g, t, { count: 18, color: '#ffe8c0', a: 0.2, seed: 12 });
} });

// ---------------------------------------------------------------- s109 in the shed, Pip waves one leg
registerShot('s109', { draw(g, t, info) {
  const z = lerp(1.5, 1.56, ease.inOut(clamp(t / info.dur)));
  const sx = E.W / 2 - 300, sy = E.H * 0.8 - 820 + 286;                                                // shed windowsill (garden.js shed pos)
  const cam = { z, x: sx + 60 - E.W / 2 + Math.sin(t * 0.6) * 5, y: sy - 90 - E.H / 2 + Math.cos(t * 0.5) * 4, r: 0 };
  const G = garden(g, t, cam, { view: 'shed', mood: 'morning', door: 0.4 });
  layer(g, cam, 1, (g) => {
    rr(g, sx - 200, sy - 4, 400, 22, 4); g.fillStyle = '#5a4430'; g.fill(); g.fillStyle = alpha('#fff0d0', 0.25); g.fillRect(sx - 200, sy - 4, 400, 5);     // the sill
    const w = (u) => clamp(u < 0.5 ? u * 2 : 2 - u * 2), wv = t < 0.97 ? 0 : t < 2.4 ? w(((t - 0.97) / 0.7) % 1) : ease.out(prog(t, 2.4, 2.6)) * (1 - prog(t, 2.9, 3.2));
    pip(g, sx + 60, sy - 2, 2.4, { t, wave: wv, tilt: ease.inOut(prog(t, 1.57, 1.85)) * (1 - prog(t, 2.6, 2.9) * 0.5), look: [-0.3, -0.05], blink: blinkAmt(t, 2.8, 1) });
  });
  if (t > 1.27) for (let i = 0; i < 6; i++) { const a = i * 1.05 + t, u = prog(t, 1.27, 2.2); glow(g, E.W * 0.33 + Math.cos(a) * 120 * u, E.H * 0.2 + Math.sin(a) * 60 * u, 18, '#fff4dc', 0.6 * (1 - u)); }   // cobweb glints
  gardenFg(g, t, cam, { view: 'shed' });
  atmos(g, t, cam, { color: '#fff0d0', far: 12, near: 4 });
} });

// ---------------------------------------------------------------- s110 IN REAL LIFE: a staring contest with a spider
registerShot('s110', { draw(g, t, info) {
  const bx = E.W / 2 - 300, top = E.H * 0.8 - 330;                                                      // the workbench
  const z = lerp(1.18, 1.26, ease.inOut(clamp(t / info.dur))), cam = { z, x: bx + 150 - E.W / 2 + Math.sin(t * 0.6) * 4, y: top - 70 - E.H / 2, r: 0 };
  const G = garden(g, t, cam, { view: 'shed', mood: 'morning', door: 0.3 });
  layer(g, cam, 1, (g) => {
    const o = { x: bx + 250, y: G.GY, s: S, facing: -1 }, pose = idle({ ...POSES.crouch, head: [22, -168], sh: [10, -130], eF: [26, -96], hF: [34, -70] }, t, 3);
    actor(g, 'HERO', { ...o, pose, expr: exprAt(t, [[0, 'neutral'], [1.21, 'determined']]), blink: t > 1.0 ? false : blinkFlag(t, 3.2, 3), look: lookToward(-1, 0.25), rim: G.rim, t });
    gloves(g, o, pose, { t });
    pip(g, bx + 130, top - 4, 1.6, { t, facing: 1, look: [0.8, -0.1], tilt: t < 1.2 ? Math.sin(t * 2) * 0.3 : 0 });
  });
  gardenFg(g, t, cam, { view: 'shed' });
  veil(g, '#808080', 0.35 * ease.out(prog(t, 0.1, 0.5)), 'saturation');                                // the reality check drains a little colour
  const k = ease.out(prog(t, 0.29, 0.7));
  if (k > 0) { g.save(); g.translate(lerp(-260, 70, k), 80); rr(g, 0, -34, 260, 68, 10); g.fillStyle = alpha('#140f1c', 0.88); g.fill(); g.strokeStyle = CREAM; g.lineWidth = 3; g.stroke(); text(g, 'REAL LIFE', 130, 2, { size: 38, color: CREAM, font: FONTS.ui, weight: 900, spacing: 4 }); g.restore(); }
} });

// ---------------------------------------------------------------- s111 GIANT FACE: gives you nothing but a staring contest
registerShot('s111', { draw(g, t, info) {
  const z = lerp(1.0, 1.04, ease.inOut(clamp(t / info.dur))), tBl = 0.73;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#5a4330', '#3a2a1e', '#2a1e16']); g.fillRect(0, 0, E.W, E.H);
  for (let x = 0; x < E.W; x += 90) seg(g, [[x, 0], [x, E.H]], 3, alpha('#000', 0.25));                // shed planks
  glow(g, E.W * 0.82, E.H * 0.1, 700, '#ffe0a8', 0.35);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const bl = t >= tBl && t < tBl + 0.16 ? 1 : t > 1.2 ? blinkAmt(t, 2.2, 1) : 0;
  giantFace(g, E.W * 0.46, E.H * 0.5, 330, { who: 'HERO', f: faceAt(t, [[0, 'squint'], [tBl, 'worried'], [1.77, 'sheepish']]), blink: bl, rimColor: '#ffd8a0', rimSide: -1 });
  const wet = ease.out(prog(t, 0.2, 0.7));                                                              // watering eyes: a tear wells and runs
  for (const sx of [-1, 1]) { const ex = E.W * 0.46 + sx * 330 * 0.34, ey = E.H * 0.5 - 13, run = prog(t, 0.8, 2.6);
    g.fillStyle = alpha('#a8dcff', 0.9 * wet); g.beginPath(); g.ellipse(ex + sx * 40, ey + 50 + run * 150, 11, 16, 0, 0, 7); g.fill(); }
  // the purple glove (a knuckle) at the bottom of frame with PIP on it, unblinking
  const kx = E.W * 0.74, ky = E.H * 0.93; g.fillStyle = '#7b4bb3'; g.beginPath(); g.ellipse(kx, ky + 40, 170, 90, -0.15, 0, 7); g.fill();
  for (let i = 0; i < 4; i++) { rr(g, kx - 130 + i * 62, ky - 40 + Math.abs(i - 1.5) * 8, 58, 70, 26); g.fill(); } seg(g, [[kx - 120, ky + 10], [kx + 110, ky - 6]], 3, alpha('#000', 0.18));
  pip(g, kx - 20, ky - 40, 2.6, { t, facing: -1, look: [-0.7, -0.1], tilt: 0.1 * Math.sin(t) });
  g.restore();
  chip(g, t, { str: 'STARING CONTEST: PIP 1 - YOU 0', at: 1.29, x: E.W * 0.5, y: E.H * 0.1 });
} });
