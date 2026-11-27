// B_s027_s030_slide.js — ep 4 batch B: DAY 2 THE SLIDE (the drainpipe, still sticky, the glove falls, "Because you're enormous"), RULE 2 card.
// LEGAL: original hero only (sandy hair, mustard hoodie, purple gloves, cargo trousers, wellies); no web-slinger references. QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, rr, linGrad, text, FONTS } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { garden, gardenFg } from '../sets/garden.js';
import { pip, wallCling, stickMarks, gloves } from '../sets/spider.js';
import { dayCard } from '../sets/spiderprops.js';
import { chip, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, W, bricks } from './B_lib.js';

const S19 = 1.9, CX = E.W / 2, GY = () => E.H * 0.8, PIPE = () => CX + 160;
// the hero on the drainpipe wall at feet height y (wall on his +x side, the pipe just right of his hands)
const heroOn = (y) => ({ x: PIPE() - 44 * S19 - 90, y, s: S19, facing: 1 });

// s027 — DAY 2: halfway up the drainpipe; on "sliding" he starts sliding again; the camera tilts up then follows him down
registerShot('s027', { draw(g, t, info) {
  const tDay = wt(info, 'day', 0.17), tSl = wt(info, 'sliding', 3.15, 2.6);
  const climbUp = ease.out(prog(t, 0, tSl - 0.3)) * 160, slide = ease.in(prog(t, tSl, info.dur + 0.6));
  const R = wallCling(t, { climb: t < tSl - 0.3 ? 1 : 0, slide, slideDist: 520 }), o = heroOn(GY() - 620 - climbUp + R.dy);
  const tilt = ease.inOut(prog(t, 0, 1.6)), cam = { z: 1.08, x: o.x - CX + 120 + Math.sin(t * 0.5) * 6, y: lerp(GY() - 900, o.y - 860, tilt) + Math.cos(t * 0.6) * 4 };
  const G = garden(g, t, cam, { view: 'wall', mood: 'day' });
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...o, pose: R.pose, expr: exprAt(t, [[0, 'determined'], [tSl, 'worried']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(0.3, t > tSl ? 0.8 : -0.8), rim: G.rim, t });
    gloves(g, o, R.pose, { t });
    stickMarks(g, t, R.hold.map(p => W(o, p)), { alpha: t > tSl ? 0.5 : 0.3 });
    if (slide > 0.02) for (let i = 0; i < 4; i++) seg(g, [[o.x + 84 + i * 10, o.y - 420], [o.x + 84 + i * 10, o.y - 420 - 40 - slide * 160]], 3, alpha('#ffffff', 0.3));
  });
  gardenFg(g, t, cam, { view: 'wall' }); atmos(g, t, cam, { color: G.M.key });
  dayCard(g, t, { day: 2, title: 'THE SLIDE', at: tDay, x: E.W * 0.15, y: E.H * 0.15, s: 0.55 });
} });

// s028 — INSERT: his bare hand on the brick, still sticking (rings glow, STILL STICKY) but dragged down by his weight; a glove tumbles past
registerShot('s028', { draw(g, t, info) {
  const tTrick = wt(info, 'trick', 0.87), tStop = wt(info, 'stopped', 1.01, 0.9);
  const drag = t * 46, camy = t * 18;
  g.save(); g.translate(0, -camy); bricks(g, -40, -200, E.W + 80, E.H + 600, { seed: 4 }); g.restore();
  glow(g, E.W * 0.7, E.H * 0.1, 700, '#fff4dc', 0.25);
  const hx = E.W * 0.5, hy = E.H * 0.42 + drag - camy;
  // squeak streaks above the hand (where it slid from)
  for (let i = 0; i < 4; i++) { const x = hx - 60 + i * 40; g.fillStyle = linGrad(g, 0, hy - 260, 0, hy - 40, ['rgba(255,255,255,0)', 'rgba(255,255,255,.22)']); g.fillRect(x - 6, hy - 260, 12, 220); }
  // the hand: ink palm + fingers, sticky rings under each fingertip
  g.save(); g.translate(hx, hy); g.rotate(-0.08); const ink = S().ink;
  g.fillStyle = ink; g.beginPath(); g.ellipse(0, 40, 110, 120, 0, 0, 7); g.fill(); rr(g, -70, 120, 140, 260, 60); g.fill();
  const tips = [[-90, -150, -0.3], [-30, -190, -0.1], [30, -190, 0.08], [86, -150, 0.28], [130, 30, 1.1]];
  for (const [fx, fy, a] of tips) { g.save(); g.rotate(a); rr(g, fx * 0.9 - 22, fy, 44, 160, 22); g.fill(); g.restore(); }
  g.restore();
  stickMarks(g, t, tips.map(([fx, fy]) => [hx + fx * 0.9, hy + fy + 10]), { alpha: 0.6 + 0.2 * Math.sin(t * 8) });
  // the purple glove from his other hand tumbles past camera
  const gk = prog(t, tStop, tStop + 1.2); if (gk > 0 && gk < 1) { g.save(); g.translate(lerp(E.W * 0.8, E.W * 0.62, gk), lerp(-160, E.H + 200, gk * gk)); g.rotate(gk * 7); g.scale(7, 7);
    rr(g, -12, 4, 24, 16, 5); g.fillStyle = '#5a3a88'; g.fill(); g.fillStyle = '#7b4bb3'; g.beginPath(); g.ellipse(0, -6, 14, 13, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { rr(g, -12 + i * 6.5, -30, 6, 18, 3); g.fill(); } g.restore(); }
  chip(g, t, { str: 'Still sticky', at: tTrick, x: E.W * 0.26, y: E.H * 0.16, dur: info.dur - 0.05 });
  const tk = ease.outBack(prog(t, tTrick, tTrick + 0.3)); if (tk > 0.01) { g.save(); g.translate(E.W * 0.26 - 170, E.H * 0.16); g.scale(tk, tk); seg(g, [[-14, 0], [-4, 10], [14, -12]], 6, S().ui.gold); g.restore(); }
} });

// s029 — GIANT FACE: cheek pressed to the brick, worried > sheepish; Pip sits on his nose; pull-back on "enormous"
registerShot('s029', { draw(g, t, info) {
  const tEn = wt(info, 'enormous', 0.57), z = lerp(1.08, 1.0, ease.inOut(prog(t, tEn, tEn + 0.6)));
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  bricks(g, -100, -100, E.W + 200, E.H + 200, { seed: 6 }); g.fillStyle = 'rgba(30,20,20,.25)'; g.fillRect(-100, -100, E.W + 200, E.H + 200);
  glow(g, E.W * 0.2, E.H * 0.1, 900, '#fff4dc', 0.25);
  const cx = E.W * 0.5, cy = E.H * 0.52, r = 330;
  g.save(); g.translate(cx, cy); g.scale(1.05, 0.97); g.translate(-cx, -cy);                                    // squashed against the wall
  giantFace(g, cx, cy, r, { who: 'HERO', f: faceAt(t, [[0, 'worried'], [tEn, 'sheepish']], 0.14), rimSide: -1, rimColor: '#fff1d8', blink: blinkAmt(t, 3.2, 2), breath: Math.sin(t * 2), look: [0, -0.3] });
  g.restore();
  pip(g, cx + 6, cy + r * 0.42, 3.4, { t, tilt: Math.sin(t * 2) * 0.6, look: [0, 0.4], blink: blinkAmt(t, 2.4, 1) });
  g.restore();
  atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#fff4dc', far: 10, near: 4 });
} });

// s030 — RULE 2 card over the dimmed garden wall; a purple glove drifts down past the card edge
registerShot('s030', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [40, 60], y: [-300, -320] });
  ruleCard(g, t, info, { n: 2, title: "BIG THINGS CAN'T STICK.", bg: (g, t) => { blurLayer(g, 9, (g) => garden(g, t, cam, { view: 'wall', mood: 'day' }), null, 1); veil(g, '#120a1c', 0.3); } });
  const u = prog(t, 0.2, info.dur), gx = E.W * 0.86 + Math.sin(t * 3) * 40, gy = lerp(-100, E.H * 0.8, u);
  g.save(); g.translate(gx, gy); g.rotate(Math.sin(t * 2.4) * 0.6); g.scale(2.4, 2.4); rr(g, -12, 4, 24, 16, 5); g.fillStyle = '#5a3a88'; g.fill(); g.fillStyle = '#7b4bb3'; g.beginPath(); g.ellipse(0, -6, 14, 13, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { rr(g, -12 + i * 6.5, -30, 6, 18, 3); g.fill(); } g.restore();
} });
