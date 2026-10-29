// S_stage1_examples.js — the four STAGE-1 proof shots (DONE; batch agents must not redefine these ids):
//   s001 blackout street · s008 thermal view · s011 RULE 1 title card · s012 blueprint eye
// Read these as the working pattern for sets, actors, thermal and blueprint helpers.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow } from '/engine/core.js';
import { POSES, breathe, walkPose, posesAt } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat, mouse } from '../sets/actors.js';
import { street, streetFg } from '../sets/street.js';
import { apartment, apartmentGround } from '../sets/apartment.js';
import { cinema } from '../sets/cinema.js';
import { thermalView, heat, heatBlob, heatRect, heatCat, heatMouse, whiteOut } from '../sets/thermal.js';
import { chip, ruleCard } from '../sets/hud.js';
import * as BP from '../sets/bp.js';

// s001 — "Blackout. Every light on your street dies at once. You keep walking."
registerShot('s001', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1 + 0.07 * k, x: lerp(-60, 90, k), y: -10 * k };
  const power = key(t, [[1.15, 1], [3.3, 0]], ease.linear);                      // lights die house by house between 1.15 s and 3.3 s
  const S = street(g, t, cam, { power });
  layer(g, cam, 1, (g) => {
    const x = lerp(S.CX - 700, S.CX + 140, ease.sine(t / info.dur)), phase = t * Math.PI * 2 * 0.9;
    actor(g, 'HERO', { x, y: S.GY + 18, s: 1.05, facing: 1, pose: walkPose(phase), expr: t > 3.4 ? 'smirk' : 'neutral', rim: S.rim, t });
  });
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 26, color: '#c9d4ff', a: 0.25 });
  if (power > 0.1) FX.lensStreak(g, E.W / 2, E.H * 0.45, E.W * 1.3, '#ffd59a', 0.22 * power);
} });

// s008 — "You can see the mouse by the bin. You can see the toast cooling."  THERMAL VIEW
registerShot('s008', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.03 + 0.04 * k, x: lerp(560, 700, k) };
  const GY = apartmentGround(), CX = E.W / 2;
  const P = { binX: CX + 960, plateX: CX + 1150, fridgeX: CX + 640, fridgeTop: GY - 440, kettleX: CX + 1000 };
  const toastHeat = lerp(0.98, 0.42, ease.out(prog(t, 2.4, 4.3)));                 // the toast cools while we watch
  const mx = P.binX - 120 + Math.sin(t * 2.2) * 26 * (t < 2.2 ? 1 : 0.25), mouseOn = ease.out(prog(t, 0.0, 0.3));
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatMouse(c, { x: mx, y: GY - 2, s: 2.6, facing: -1, t, heat: 0.88 * mouseOn });
      heatRect(c, P.plateX - 40, GY - 214, 80, 10, toastHeat * 0.6, 4); heatRect(c, P.plateX - 28, GY - 238, 56, 26, toastHeat, 8); heatBlob(c, P.plateX, GY - 226, 130, 90, toastHeat * 0.7, 0.9); heatBlob(c, mx, GY - 20, 60, 36, 0.3 * mouseOn, 0.9);
      heatCat(c, { x: P.fridgeX + 30, y: P.fridgeTop, s: 1.3, facing: -1, pose: 'loaf', t, heat: 0.7 });
      heatRect(c, P.kettleX - 22, GY - 258, 44, 54, 0.3, 8);
    }),
    hud: { label: 'THERMAL', temp: t < 2.2 ? '34 C  MOUSE' : `${(24 + toastHeat * 30).toFixed(0)} C  TOAST`, track: t < 2.2 ? [(mx - E.W / 2 - cam.x) * cam.z + E.W / 2, (GY - 20 - E.H / 2) * cam.z + E.H / 2] : [(P.plateX - E.W / 2 - cam.x) * cam.z + E.W / 2, (GY - 226 - E.H / 2) * cam.z + E.H / 2] },
  });
  FX.dust(g, t, { count: 24, color: '#ffb070', a: 0.2 });
  chip(g, t, { str: 'Mouse. Toast. No charger.', at: 2.6, x: E.W / 2, y: E.H * 0.86 });
} });

// s011 — RULE 1 title card (the template for all five rule cards)
registerShot('s011', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * (t / info.dur) };
  ruleCard(g, t, info, { n: 1, title: 'YOUR EYES QUIT FIRST', accent: '#ffd47e', bg: (g, t) => {
    cinema(g, t, cam, { screen: 0.22, door: 0 }); FX.dust(g, t, { count: 40, color: '#9fb6ff', a: 0.35 });
  } });
} });

// s012 — "A human eye holds about one hundred and twenty million rods."  BLUEPRINT
registerShot('s012', { draw(g, t, info) {
  const st = info.shot.start, tMil = (wordTime('million', st) ?? st + 2.4) - st, tRods = (wordTime('rods', st) ?? st + 3) - st;
  const k = ease.out(prog(t, 0.1, 1.9)), cam = 1 + 0.03 * (t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam, cam); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'THE HUMAN EYE', fig: 'FIG 1 - RETINA, ROD CELLS' });
  const ex = E.W * 0.3, ey = E.H * 0.52, r = 230;
  BP.eye(g, t, { x: ex, y: ey, r, k });
  const px = ex + r * 0.93 * 0.98, py = ey - 4;
  BP.label(g, t, { at: [ex + r * 0.5, ey - r * 0.55], to: [ex + r * 0.5, ey - r * 1.15], str: 'RETINA', start: 1.6 });
  const ip = ease.out(prog(t, tRods - 0.5, tRods + 0.3));
  if (ip > 0) {
    const ix = E.W * 0.7, iy = E.H * 0.5; BP.draw(g, [[px, py], [ix - 380, iy - 120]], ip, { w: 2.5, color: 'rgba(255,212,126,.8)' });
    g.save(); g.globalAlpha *= ip; BP.retina(g, t, { x: ix, y: iy, w: 760, h: 420, rods: true, cones: false }); g.restore();
    BP.label(g, t, { at: [ix - 120, iy - 150], to: [ix - 120, iy - 290], str: 'RODS', start: tRods });
  }
  g.restore();
  chip(g, t, { str: 'About 120 million rods', at: tMil, x: E.W * 0.7, y: E.H * 0.86, tone: 'gold' });
} });
