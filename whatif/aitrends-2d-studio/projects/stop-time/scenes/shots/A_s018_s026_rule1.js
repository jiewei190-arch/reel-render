// A_s018_s026_rule1.js — stop-time batch A (H1): RULE 1 "YOU ONLY SEE LIGHT THAT ARRIVES." + FIG 1-3 (light speed, it has to travel,
// sun to Earth 8 min 20 s, the eye + retina), frozen light hanging, none arrives, "wouldn't look frozen" split, nothing at all.
// Numbers exactly as sources.md: ~300,000 km/s, 8 min 20 s, ~150 million km. LEGAL: original; nothing from any film, show, anime, game or comic.
import { E, S, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rng, seg, circle, ring, rr, poly, alpha, shade, glow, text, FONTS, veil } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { idle, blinkFlag, exprAt, poseAt, camMove, lookToward, atmos } from '../sets/acting.js';
import { ruleCard } from '../sets/hud.js';
import { board, draw, label, eye, retina, photon } from '../sets/bp.js';
import { lightToEye, sunToEarth } from '../sets/timebp.js';
import { stopwatch } from '../sets/stopprops.js';
import { freezeGrade, hangingDust, blackView } from '../sets/freeze.js';
import { GOLD, CREAM, CORAL, kitchen, kitchenFg, hero, sunbeam, photonDust } from './A_lib.js';
import { frozenTuesday } from './A_s001_s017_cold_open.js';

const push = (g, t, dur, fn, amt = 0.04) => { const z = 1 + amt * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const goldText = (g, str, x, y, size, a = 1, o = {}) => text(g, str, x, y, { size, color: GOLD, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(GOLD, 0.6), stroke: 8, strokeColor: '#0b1324', alpha: a, ...o });
const creamText = (g, str, x, y, size, a = 1, o = {}) => text(g, str, x, y, { size, color: CREAM, font: FONTS.ui, weight: 900, alpha: a, spacing: 2, ...o });

// ======================================================================= s018 RULE 1 card
registerShot('s018', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 1, title: 'YOU ONLY SEE LIGHT THAT ARRIVES.', bg: (g, t) => {
    blurLayer(g, 10, (g) => { const K = kitchen(g, 90 + t, { z: 1.25, x: -260, y: -40 }); sunbeam(g, K.P.windowX, K.P.windowY + 200, K.P.tableX - 60, K.P.tableTop, 120, 220, 0.12); }, null, 1);
    veil(g, '#0a0812', 0.35);
    const u = prog(t, 0.5, 0.95); if (u > 0 && u < 1) { const x = lerp(-80, E.W + 80, u), y = lerp(260, 200, u); for (let i = 0; i < 12; i++) circle(g, x - i * 34, y + i * 4, 9 - i * 0.6, alpha(i ? CREAM : '#ffffff', 0.9 - i * 0.07)); glow(g, x, y, 110, GOLD, 0.8); }
  } });
}});

// ======================================================================= s019 FIG 1 - LIGHT SPEED
registerShot('s019', { draw(g, t, info) {
  board(g, t, { title: 'FIG 1 - THE FASTEST THING', fig: 'LIGHT' });
  push(g, t, info.dur, () => {
    const y = 520, x0 = 240, x1 = 1680;
    g.save(); g.setLineDash([14, 12]); draw(g, [[x0, y], [x1, y]], ease.out(prog(t, 0, 0.6)), { w: 3, color: alpha(S().ui.blueprint, 0.6) }); g.restore();
    for (let pass = 0; pass < 3; pass++) {                                              // the photon streaks across again and again
      const u = ((t - 0.14) * 0.9 - pass * 0.33); const k = u - Math.floor(u); if (t < 0.14 + pass * 0.37) continue;
      const px = lerp(x0, x1, k); for (let i = 0; i < 16; i++) circle(g, px - i * 22, y, 11 - i * 0.6, alpha(CREAM, 0.7 - i * 0.04));
      photon(g, t, { from: [x0, y], to: [x1, y], k });
    }
    label(g, t, { at: [960, y - 20], to: [960, y - 150], str: 'nothing is faster', start: 0.14 });
    const roll = ease.out(prog(t, 0.4, 1.6)), km = Math.round(300000 * roll / 1000) * 1000;
    if (t > 0.4) goldText(g, `~${km.toLocaleString('en-US')} km`, 900, 760, 110);
    if (t > 2.6) { const k = ease.outBack(prog(t, 2.6, 2.95)); g.save(); g.translate(1300, 760); g.scale(k, k); goldText(g, '/ s', 0, 0, 110); g.restore(); creamText(g, 'EVERY SECOND', 960, 860, 40, k); }
  });
}});

// ======================================================================= s020 IT STILL HAS TO TRAVEL
registerShot('s020', { draw(g, t, info) {
  board(g, t, { title: 'FIG 1 - THE FASTEST THING', fig: 'LIGHT' });
  push(g, t, info.dur, () => {
    const A = lightToEye(g, t, { x: E.W * 0.5, y: E.H * 0.54, s: 0.95, k: ease.out(prog(t, 0, 0.7)), flow: 1 });
    stopwatch(g, t, { x: E.W * 0.5 - 120, y: E.H * 0.2, s: 0.32, sec: t * 1.5, running: true });
    const ak = ease.out(prog(t, 1.13, 1.6));
    if (ak > 0) { const xa = A.lamp[0] + 110, xb = A.eye[0] - 250, y = E.H * 0.54 + 110; draw(g, [[xa, y], [lerp(xa, xb, ak), y]], 1, { w: 8, color: GOLD }); if (ak > 0.95) poly(g, [[xb + 26, y], [xb - 6, y - 20], [xb - 6, y + 20]], GOLD); goldText(g, 'IT HAS TO TRAVEL', (xa + xb) / 2, y + 60, 44, ak); }
  });
}});

// ======================================================================= s021 FIG 2 - SUN TO EARTH
registerShot('s021', { draw(g, t, info) {
  board(g, t, { title: 'FIG 2 - SUN TO EARTH', fig: 'SUNLIGHT' });
  push(g, t, info.dur, () => {
    const A = sunToEarth(g, t, { x: E.W * 0.5, y: E.H * 0.56, w: 1500, k: ease.out(prog(t, 0, 0.5)), travel: ease.inOut(prog(t, 0.24, 3.74)) });
    if (t > 3.74) { const k = prog(t, 3.74, 4.2); glow(g, A.earth[0], A.earth[1] + 46, 120, '#fff6d8', 0.7 * (1 - k * 0.5)); }
  });
}});

// ======================================================================= s022 FIG 3 - THE EYE
registerShot('s022', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - WHERE YOU SEE', fig: 'THE EYE' });
  push(g, t, info.dur, () => {
    const zk = ease.inOut(prog(t, 2.91, 3.5)), ex = lerp(E.W * 0.5, E.W * 0.33, zk);
    const A = eye(g, t, { x: ex, y: E.H * 0.55, r: 250, k: ease.out(prog(t, 0, 1.0)), rays: t > 0.71 });
    if (t > 1.01 && t < 2.2) { const k = prog(t, 1.01, 1.4); glow(g, A.fovea[0], A.fovea[1], 90, GOLD, 0.9 * (1 - k * 0.6)); circle(g, A.fovea[0], A.fovea[1], 10, GOLD); }
    if (t < 2.91) label(g, t, { at: A.cornea, to: [A.cornea[0] - 60, E.H * 0.22], str: 'light in', start: 0.71 });
    if (zk > 0) {
      const ix = E.W * 0.72, iy = E.H * 0.5, w = 640 * zk, h = 380 * zk;
      g.save(); g.setLineDash([12, 10]); g.strokeStyle = alpha(GOLD, 0.8 * zk); g.lineWidth = 3; g.beginPath(); g.moveTo(A.fovea[0], A.fovea[1] - 30); g.lineTo(ix - w / 2, iy - h / 2); g.moveTo(A.fovea[0], A.fovea[1] + 30); g.lineTo(ix - w / 2, iy + h / 2); g.stroke(); g.restore();
      if (zk > 0.15) retina(g, t, { x: ix, y: iy, w, h, rods: true, cones: true, flood: 0.3 });
      creamText(g, 'THE BACK WALL', ix, iy - h / 2 - 40, 34, zk);
    }
    if (t > 3.89) label(g, t, { at: [E.W * 0.72, E.H * 0.5 + 150], to: [E.W * 0.72 + 120, E.H * 0.86], str: 'RETINA', start: 3.89 });
  });
}});

// ======================================================================= s023 FREEZE THE LIGHT
registerShot('s023', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-60, -20] }), K = kitchen(g, 1.15, cam, { steam: 0 }), P = K.P, GY = K.GY;
  const beam = { x0: P.windowX - 40, y0: P.windowY + 190, x1: P.tableX - 40, y1: P.tableTop - 10 }, fk = ease.out(prog(t, 0.06, 0.6));
  layer(g, cam, 1, (g) => { sunbeam(g, beam.x0, beam.y0, beam.x1, beam.y1, 110, 200, 0.14 * (1 - fk)); });
  kitchenFg(g, 1.15, cam);
  const HO = { x: P.tableX + 120, y: GY, s: 1.95, facing: -1 }, rp = poseAt(t, [[0, POSES.stand], [1.5, POSES.reach]], 0.4);
  layer(g, cam, 1, (g) => {
    freezeGrade(g, fk); hangingDust(g, t, { at: 0.06, count: 40, seed: 5 });
    photonDust(g, t, { ...beam, w: 150, n: 420, k: fk, seed: 7 });
    hero(g, { ...HO, t, pose: idle(rp, t, 1), expr: exprAt(t, [[0, 'surprised'], [1.82, 'awe']]), look: lookToward(-1, -0.3) });
  });
}});

// ======================================================================= s024 BETWEEN THE WINDOW AND YOUR EYES - NONE ARRIVES
registerShot('s024', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - WHERE YOU SEE', fig: 'FROZEN LIGHT' });
  push(g, t, info.dur, () => {
    const zk = ease.inOut(prog(t, 2.65, 3.2));
    g.save(); g.globalAlpha *= 1 - zk * 0.75;
    const A = lightToEye(g, t, { x: E.W * 0.5, y: E.H * 0.54, s: 0.95, k: 1, flow: 0, frozen: 1 });
    const bk = ease.out(prog(t, 0.69, 1.1)), bx0 = A.lamp[0] + 90, bx1 = A.eye[0] - 230, by = E.H * 0.54 - 120;
    if (bk > 0) { draw(g, [[bx0, by + 30], [bx0, by], [bx1, by], [bx1, by + 30]], bk, { w: 6, color: GOLD }); goldText(g, 'STUCK', (bx0 + bx1) / 2, by - 40, 52, bk); }
    g.restore();
    if (zk > 0) {
      const w = 900 * zk, h = 440 * zk; retina(g, t, { x: E.W / 2, y: E.H / 2, w, h, rods: true, cones: true, dim: 1 });
      if (zk > 0.5) { g.save(); g.fillStyle = alpha('#02030a', 0.55 * zk); rr(g, E.W / 2 - w / 2, E.H / 2 - h / 2, w, h, 20); g.fill(); g.restore(); creamText(g, 'YOUR RETINA', E.W / 2, E.H / 2 - h / 2 - 40, 34, zk); }
      if (t > 2.99) { const k = ease.outBack(prog(t, 2.99, 3.3)); g.save(); g.translate(E.W / 2, E.H * 0.88); g.scale(k, k); rr(g, -330, -48, 660, 96, 20); g.fillStyle = 'rgba(10,16,32,.92)'; g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke(); goldText(g, 'LIGHT ARRIVING: 0', 0, 2, 52); g.restore(); }
    }
  });
}});

// ======================================================================= s025 WOULDN'T LOOK FROZEN (split)
registerShot('s025', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.4 });
  frozenTuesday(g, t, cam);
  freezeGrade(g, 1); hangingDust(g, t, { at: -1, count: 40, seed: 2 });
  const drain = ease.inOut(prog(t, 1.52, 2.1)), mid = E.W / 2;
  g.save(); g.beginPath(); g.rect(mid, -10, E.W, E.H + 20); g.clip(); g.fillStyle = `rgba(1,1,4,${0.08 + 0.92 * drain})`; g.fillRect(mid, 0, E.W, E.H); g.restore();
  seg(g, [[mid, 0], [mid, E.H]], 8, '#0b1324'); seg(g, [[mid, 0], [mid, E.H]], 3, alpha(CREAM, 0.8));
  const lk = ease.outBack(prog(t, 0.15, 0.5));
  for (const [x, str] of [[mid / 2, "WHAT YOU'D EXPECT"], [mid + mid / 2, "WHAT YOU'D SEE"]]) { g.save(); g.translate(x, 110); g.scale(lk, lk); rr(g, -270, -40, 540, 80, 40); g.fillStyle = 'rgba(11,19,36,.9)'; g.fill(); g.strokeStyle = alpha(CREAM, 0.8); g.lineWidth = 3; g.stroke(); creamText(g, str, 0, 2, 38); g.restore(); }
}});

// ======================================================================= s026 LIKE NOTHING AT ALL
registerShot('s026', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.3 });
  const slide = ease.inOut(prog(t, 0.15, 0.7)), edge = lerp(E.W / 2, -20, slide);
  if (slide < 1) { frozenTuesday(g, t, cam); freezeGrade(g, 1); }
  g.save(); g.fillStyle = '#010104'; g.fillRect(edge, -10, E.W - edge + 20, E.H + 20); g.restore();
  if (slide < 1) { seg(g, [[edge, 0], [edge, E.H]], 3, alpha(CREAM, 0.8)); }
  const fade = 1 - ease.inOut(prog(t, 0.67, 1.9));
  if (fade > 0 && slide > 0.5) layer(g, cam, 1, (g) => { g.save(); g.globalAlpha = 0.28 * fade; hero(g, { x: 960, y: 900, s: 1.9, facing: 1, t, pose: idle(POSES.stand, t, 1), expr: 'worried', rim: { color: '#ffb070', dir: [0, -1] } }); g.restore(); });
  const r = rng(3); for (let i = 0; i < 40; i++) circle(g, r() * E.W, r() * E.H, 1 + r() * 1.6, alpha(CREAM, 0.12 + 0.12 * Math.sin(t * 2 + i)));
}});
