// S_showcase.js — the QUALITY-BAR showcase: s001 s008 s011 s012 (re-done stage-1 shots) + s002 / s005 (TEMPORARY ids reused for two new showcase shots,
// see HANDOFF.md: s002 = giant-face reaction, s005 = three-character apartment scene). Read QUALITY_BAR.md first; copy the patterns here.
//   s001 street walk-and-blackout (medium tracking shot, crowd with signature colours, torches)   s002 HERO giant face shocked -> delighted
//   s005 apartment trio (Mina + Hero + Biscuit, torch beam sweeps to the cat)                    s008 thermal view (bright, legible, big mouse + toast + cat)
//   s011 RULE 1 lock-up over the audience hall                                                    s012 blueprint eye with rods inset
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shake, shade, mix } from '/engine/core.js';
import { POSES, drawFigure, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat, mouse } from '../sets/actors.js';
import { street, streetFg } from '../sets/street.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { cinema, cinemaFg } from '../sets/cinema.js';
import { thermalView, heat, heatBlob, heatRect, heatCat, heatMouse, heatActor } from '../sets/thermal.js';
import { chip, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, talkGesture, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';

const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };   // shot-local seconds of a spoken word (fallback if the word is missing)
// world position of a hand in the figure's local pose (for torches / props). o = the same object you pass to actor()
const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };

// ===================================================================================================
// s001 — "Blackout. Every light on your street dies at once. You keep walking."
// MEDIUM tracking shot: hero ~42% of frame height, camera follows him, bystanders with signature colours look up from their phones and switch on torches,
// the hero (who needs no light) keeps walking. 4 parallax depths (sky .12, skyline .3, facades .6, street 1.0, blurred railing 1.7).
registerShot('s001', { draw(g, t, info) {
  const st = info.shot.start, tB = shotWord('blackout', st, 0.9), SPEED = 160;                 // walk speed in world units / s (foot phase is locked to x, so no sliding)
  const heroX = (u) => 1920 / 2 - 560 + SPEED * u + Math.sin(u * 1.4) * 6;
  const cam = camMove(t, info.dur, { z: [1.02, 1.09], y: [-10, 6] }); cam.x = heroX(t) - 960 + 300 + Math.sin(t * 0.8) * 8;
  const power = key(t, [[tB - 0.05, 1], [tB + 1.9, 0]], ease.linear);                           // lights die house by house
  const A = street(g, t, cam, { power });
  const GY = A.GY, CX = A.CX;
  const crowd = [  // signature colours, one per person
    { x: CX - 190, s: 1.5, c: { top: 'hoodie', color: '#d4262e', legs: '#2a2438', head: 'none' }, seed: 1, dly: 0.15 },
    { x: CX + 20, s: 1.45, c: { top: 'tshirt', color: '#2f6fd0', legs: '#26304a', head: 'beanie', headColor: '#f2c21a' }, seed: 2, dly: 0.4 },
    { x: CX + 380, s: 1.5, c: { top: 'hoodie', color: '#9a5ad6', legs: '#2a2438', head: 'ponytail' }, seed: 3, dly: 0.25 },
    { x: CX + 640, s: 1.5, c: { top: 'jersey', color: '#3aa05a', legs: '#223a30', head: 'cap', headColor: '#e0e0d0' }, seed: 4, dly: 0.55 },
    { x: CX + 900, s: 1.45, c: { top: 'tshirt', color: '#e08aa8', legs: '#3a2a3a', head: 'bun' }, seed: 5, dly: 0.35 },
  ];
  layer(g, cam, 1, (g) => {
    for (const p of crowd) {
      const u = t - tB - p.dly, o = { x: p.x, y: GY + 4 + (p.seed % 2) * 10, s: p.s, facing: p.seed % 2 ? -1 : 1, outfit: p.c };
      const pose = idle(poseAt(t, [[0, 'phoneLow'], [tB + p.dly, 'shock'], [tB + p.dly + 0.7, 'phoneLow']], 0.25), t, p.seed);
      const torch = ease.out(prog(u, 0.7, 1.0));
      const fig = { ...o, pose, expr: exprAt(t, [[0, 'neutral'], [tB + p.dly, 'surprised'], [tB + p.dly + 1.2, 'confused']]), blink: blinkFlag(t, 3 + p.seed * 0.3, p.seed), look: u > 0 ? lookToward(0.3, -1) : [0, 0.8], rim: A.rim, prop: { type: 'phone', glow: u < 0.7 ? '#9fd8ff' : '#ffffff' }, t };
      actor(g, p.c, fig);
      if (u > 0.6) { const [hx, hy] = handWorld({ ...o, kid: false }, pose, 'hF'); FX.lightCone(g, hx + 6, hy - 14, { angle: o.facing > 0 ? -0.18 : Math.PI + 0.18, spread: 0.42, len: 620, color: '#f4f8ff', a: 0.34 * torch }); glow(g, hx + 6, hy - 14, 70, '#ffffff', 0.5 * torch); }
      else if (p.seed % 2) { const [hx, hy] = handWorld({ ...o, kid: false }, pose, 'hF'); glow(g, hx + 6, hy - 10, 60, '#9fd8ff', 0.28 * (1 - torch)); }     // phone-screen face glow before the blackout
    }
    const f = { x: heroX(t), y: GY + 46, s: 1.95, facing: 1, t, rim: A.rim };
    const wk = walkAlong(f.x, f.s, {}); const look = t > tB - 0.1 && t < tB + 1.0 ? lookToward(0.2, -1) : [1, 0];
    actor(g, 'HERO', { ...f, pose: wk.pose, expr: exprAt(t, [[0, 'neutral'], [tB, 'surprised'], [tB + 0.8, 'awe'], [shotWord('walking', st, 3.8), 'smirk']]), blink: blinkFlag(t, 3.4, 7), look });
  });
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: '#c9d4ff' });
  if (power > 0.1) FX.lensStreak(g, E.W / 2, E.H * 0.45, E.W * 1.3, '#ffd59a', 0.2 * power);
  veil(g, '#05060f', 0.12 * (1 - power));
} });

// ===================================================================================================
// s002 (TEMP id) — GIANT FACE reaction: HERO goes from searching in the dark -> double-take -> SHOCKED -> DELIGHTED (he can see heat).
// Face fills ~76% of frame height incl. hood, orange light from off-screen right, eyes pick up an orange glint on delight, blink -> pop, sweat drop, punch-in + shake.
registerShot('s002', { draw(g, t, info) {
  const T_SHOCK = 0.82, T_JOY = 1.55;                                                          // beats: bind these to wordTime() in the real script
  const punch = ease.out(prog(t, T_SHOCK, T_SHOCK + 0.12)) * (1 - ease.out(prog(t, T_SHOCK + 0.12, T_SHOCK + 0.55)));
  const cam = camMove(t, info.dur, { z: [1.0, 1.07] }); cam.z += 0.045 * punch; { const sk = shake(t * 3, 14 * punch, 4, 3); cam.x += sk[0]; cam.y += sk[1]; }
  blurLayer(g, 16, (c) => apartment(c, t, cam, { power: 0 }), null, 1); veil(g, '#05060f', 0.45);
  glow(g, E.W * 0.84, E.H * 0.55, 900, '#ff7a30', 0.2 + 0.28 * ease.out(prog(t, T_SHOCK, T_JOY)));                 // heat-glow off-screen right
  FX.lightCone(g, E.W + 80, E.H * 0.6, { angle: Math.PI, spread: 0.9, len: 1500, color: '#ff8a40', a: 0.12 * ease.out(prog(t, T_SHOCK, T_JOY)) });
  const f = faceAt(t, [[0, 'squint'], [0.35, { ...{ look: [-0.6, 0.1] }, eye: 0.55, brow: -0.2, tilt: 0.5, smile: 0, w: 0.8 }], [0.5, 'neutral'], [T_SHOCK, 'shocked'], [T_JOY, 'delighted'], [2.2, 'joy']], 0.14);
  const bl = Math.max(blinkAmt(t, 3.1, 0.6) * (t < 0.7 || t > 1.7 ? 1 : 0), ease.out(prog(t, 0.56, 0.62)) * (1 - ease.out(prog(t, 0.66, 0.74))));   // blink -> double take -> eyes pop
  const gl = ease.out(prog(t, T_SHOCK + 0.2, T_JOY + 0.2)), br = Math.sin(t * 2.2);
  layer(g, cam, 1, (g) => {
    const cx = E.W * 0.5 + (t > T_SHOCK ? 0 : Math.sin(t * 3) * 6), cy = E.H * 0.55;
    giantFace(g, cx, cy, 330, { who: 'HERO', f: { ...f, glint: Math.max(f.glint, gl * 0.9) }, rimSide: 1, rimColor: '#ff9a50', breath: br, blink: bl, glint: '#ff9a40', tilt: lerp(-0.03, 0.04, ease.inOut(t / info.dur)) });
    glow(g, cx + 250, cy, 380, '#ff7a30', 0.2 * gl);                                              // warm spill on the cheek
    if (t > T_JOY) for (let i = 0; i < 4; i++) { const ph = (t * 1.1 + i * 0.27) % 1; FX.sparkle(g, cx + (i - 1.5) * 190, cy - 380 + Math.sin(i * 2) * 60, 18 * Math.sin(ph * Math.PI), '#ffd8a0', 0.9); }
  });
  FX.dust(g, t, { count: 34, color: '#ffb070', a: 0.35, seed: 6 }); FX.dust(g, t * 1.7, { count: 14, color: '#ffb070', a: 0.4, seed: 12, size: 3.4 });
  veil(g, '#000', 0.0);
} });

// ===================================================================================================
// s005 (TEMP id) — THREE CHARACTERS in the apartment: Mina stumbles in torch-first, Hero turns, Biscuit on the fridge catches the torch beam (eyeshine) and looks offended.
// Medium-wide pan with 3 figures at 36-41% of frame height, walk locked to x, talk gestures, expression changes on beats, 4 parallax depths + blurred plant foreground.
registerShot('s005', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: lerp(1.02, 1.1, k), x: lerp(-180, 230, k) + Math.sin(t * 0.6) * 6, y: lerp(-10, 0, k) + Math.cos(t * 0.5) * 4, r: Math.sin(t * 0.37) * 0.002 };
  const A = apartment(g, t, cam, { power: 0 }), GY = A.GY, CX = A.CX, P = A.pos;
  const minaX = lerp(CX - 640, CX - 270, ease.out(prog(t, 0, 1.9))), walking = t < 1.9;
  const wk = walkAlong(minaX, 2.0, { kid: true, facing: 1 });
  const mina = { x: minaX, y: GY + 38, s: 2.0, facing: 1, kid: true };
  const minaPose = walking ? wk.pose : idle(poseAt(t, [[1.9, 'stand'], [2.0, 'phoneLow'], [2.45, 'point']], 0.3), t, 2);
  const beamAng = lerp(-0.05, -0.42, ease.inOut(prog(t, 1.9, 2.8))), beamOn = ease.out(prog(t, 0.15, 0.4));
  const hero = { x: CX + 90, y: GY + 20, s: 1.85, facing: -1 };
  const heroPose = idle(poseAt(t, [[0, 'relaxed'], [0.55, 'lookUp'], [1.0, 'relaxed'], [2.5, 'shrug']], 0.35), t, 5);
  const catGlint = ease.out(prog(t, 2.35, 2.55)), catEyes = t > 3.0 ? 'offended' : catGlint > 0.5 ? 'glint' : 'open';
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...hero, pose: heroPose, t, rim: A.rim, expr: exprAt(t, [[0, 'neutral'], [0.5, 'surprised'], [1.3, 'smirk'], [2.5, 'smirk']]), blink: blinkFlag(t, 3.6, 3), look: lookToward(-1, t < 1.0 ? -0.4 : 0.1) });
    const [bx, by] = handWorld(mina, minaPose, 'hF');
    actor(g, 'MINA', { ...mina, pose: minaPose, t, rim: A.rim, expr: exprAt(t, [[0, 'worried'], [1.0, 'nervous'], [2.0, 'smile'], [2.6, 'surprised']]), talk: t > 2.0 ? talkAmount(info.globalT, info.shot.start + 2.0, info.shot.end) : 0, blink: blinkFlag(t, 2.8, 9), look: lookToward(1, 0.1), prop: { type: 'phone', glow: '#ffffff' } });
    FX.lightCone(g, bx + 14, by - 18, { angle: beamAng, spread: 0.34, len: 1500, color: '#f4f8ff', a: 0.42 * beamOn }); glow(g, bx + 14, by - 18, 110, '#ffffff', 0.55 * beamOn);
    cat(g, { x: P.fridgeX + 30, y: P.fridgeTop - 2, s: 1.9, facing: -1, pose: 'sit', eyes: catEyes, t, rim: { color: A.rim.color, dir: [-0.4, -1] } });
    if (catGlint > 0.1) glow(g, P.fridgeX + 30 - 14 * 1.9, P.fridgeTop - 78 * 1.9, 120, '#c8f07a', 0.5 * catGlint * (t > 3.0 ? 0.3 : 1));
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: '#b8c8ff' });
  FX.dust(g, t * 1.3, { count: 18, color: '#ffffff', a: 0.3, seed: 21, area: [0, 0, E.W, E.H] });
} });

// ===================================================================================================
// s008 — THERMAL VIEW: "You can see the mouse by the bin. You can see the toast cooling."
// Bright and legible: violet-magenta cool background with real structure, white-yellow mouse (ears hot), toast fading white -> orange, cat on the fridge, warm kettle + mug.
registerShot('s008', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: lerp(1.2, 1.34, k), x: lerp(640, 780, k), y: lerp(-30, -50, k) };
  const GY = apartmentGround(), CX = E.W / 2, st = info.shot.start;
  const P = { binX: CX + 960, plateX: CX + 1150, fridgeX: CX + 640, fridgeTop: GY - 440, kettleX: CX + 1000 };
  const tToast = shotWord('toast', st, 2.1), toastHeat = lerp(0.95, 0.4, ease.out(prog(t, tToast + 0.2, tToast + 2.0)));
  const mx = P.binX - 150 + Math.sin(t * 1.9) * 24 * (t < tToast ? 1 : 0.25), mouseOn = ease.out(prog(t, 0.0, 0.25)), fr = t < tToast;
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0, moon: 1.4, cityLit: 0.6 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatMouse(c, { x: mx, y: GY - 2, s: 5.2, facing: -1, t, heat: 0.6 * mouseOn });
      heatRect(c, P.plateX - 52, GY - 216, 104, 12, toastHeat * 0.6, 5); heatRect(c, P.plateX - 40, GY - 252, 80, 40, toastHeat, 12); heatBlob(c, P.plateX, GY - 236, 180, 120, toastHeat * 0.75, 0.9);
      heatCat(c, { x: P.fridgeX + 30, y: P.fridgeTop, s: 2.0, facing: -1, pose: 'loaf', t, heat: 0.55 });
      heatRect(c, P.kettleX - 24, GY - 262, 48, 58, 0.34, 9); heatRect(c, P.plateX - 150, GY - 232, 34, 30, 0.5, 6);
      heatBlob(c, P.fridgeX + 70, GY - 150, 70, 150, 0.2, 0.9);                                                   // the fridge motor leaks a little heat
    }),
    hud: { label: 'THERMAL', temp: fr ? '34 C  MOUSE' : `${(24 + toastHeat * 30).toFixed(0)} C  TOAST`, track: fr ? [(mx - E.W / 2 - cam.x) * cam.z + E.W / 2, (GY - 40 - E.H / 2 - cam.y) * cam.z + E.H / 2] : [(P.plateX - E.W / 2 - cam.x) * cam.z + E.W / 2, (GY - 234 - E.H / 2 - cam.y) * cam.z + E.H / 2] },
  });
  FX.dust(g, t, { count: 30, color: '#ffb070', a: 0.28 }); FX.dust(g, t * 1.6, { count: 10, color: '#ffd8a0', a: 0.35, seed: 8, size: 3.2 });
  chip(g, t, { str: 'Mouse. Toast. No charger.', at: tToast + 0.15, x: E.W / 2, y: E.H * 0.88 });
} });

// ===================================================================================================
// s011 — RULE 1 lock-up over the audience hall (heads in varied colours, screen flicker). Big extruded numeral, outlined title on a banner.
registerShot('s011', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], x: [-30, 30] });
  ruleCard(g, t, info, { n: 1, title: 'YOUR EYES QUIT FIRST', accent: '#ffd47e', bg: (g, t) => {
    cinema(g, t, cam, { screen: 0.55, door: 0 }); FX.dust(g, t, { count: 44, color: '#9fb6ff', a: 0.4 }); cinemaFg(g, t, cam);
  } });
} });

// ===================================================================================================
// s012 — BLUEPRINT: "A human eye holds about one hundred and twenty million rods."
// Clean line-art eye (cornea, iris, lens, retina, fovea, optic nerve) draws on, light rays converge, gold labels, dashed zoom to a rods inset with disc-stripe rods.
registerShot('s012', { draw(g, t, info) {
  const st = info.shot.start, tMil = shotWord('million', st, 2.4), tRods = shotWord('rods', st, 3.0);
  const k = ease.out(prog(t, 0.1, 1.9)), z = 1 + 0.035 * (t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2);
  BP.board(g, t, { title: 'THE HUMAN EYE', fig: 'FIG 1 - RETINA, ROD CELLS' });
  const ex = E.W * 0.3, ey = E.H * 0.52, r = 270;
  const A = BP.eye(g, t, { x: ex, y: ey, r, k, inset: true });
  BP.label(g, t, { at: A.cornea, to: [A.cornea[0] + 10, A.cornea[1] + r * 0.95], str: 'CORNEA', start: 1.0 });
  BP.label(g, t, { at: A.lens, to: [A.lens[0] + 20, A.lens[1] - r * 0.82], str: 'LENS', start: 1.3 });
  BP.label(g, t, { at: A.retina, to: [A.retina[0] + 40, A.retina[1] - r * 0.62], str: 'RETINA', start: 1.6 });
  const ip = ease.out(prog(t, tRods - 0.5, tRods + 0.35)), ix = E.W * 0.73, iy = E.H * 0.5, iw = 780, ih = 470;
  if (ip > 0) {
    const [fx, fy] = A.fovea; BP.draw(g, [[fx + r * 0.2, fy - 8], [ix - iw / 2, iy - 40]], ip, { w: 2.5, color: 'rgba(255,212,126,.85)' }); BP.draw(g, [[fx + r * 0.15, fy + r * 0.14], [ix - iw / 2, iy + ih / 2 - 20]], ip, { w: 2.5, color: 'rgba(255,212,126,.85)' });
    g.save(); g.globalAlpha *= ip; g.translate(ix, iy); g.scale(0.94 + 0.06 * ip, 0.94 + 0.06 * ip); g.translate(-ix, -iy); BP.retina(g, t, { x: ix, y: iy, w: iw, h: ih, rods: true, cones: false }); g.restore();
    const gap = iw / (Math.max(8, Math.round(iw / 52)) + 1), rodX = ix - iw / 2 + gap * 6;
    BP.label(g, t, { at: [rodX, iy - ih / 2 + 150], to: [rodX, iy - ih / 2 - 46], str: 'ROD CELL', start: tRods });
  }
  g.restore();
  chip(g, t, { str: 'About 120 million rods', at: tMil, x: E.W * 0.73, y: E.H * 0.86, tone: 'gold' });
} });
