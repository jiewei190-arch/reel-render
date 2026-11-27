// DEMO_statcard.js — sheet-check of sets/statcard.js (temporary ids demo_sc_*, not bound to the voice). 16:9.
//   demo_sc_morning  the breakfast recipe: the Zip opens over the cereal, the Stat Card unfolds, bar snaps, LV 6 -> 7, STR 95 -> 101, flash + LEVEL UP!
//   demo_sc_night    night: the card floats in ink-navy, bar filling, a coral one-liner types on ("Bones: not included."), then folds back into the Zip
//   demo_sc_pop      the LEVEL UP! pop on its own: freeze, flash, shake, starburst, sparks
//   demo_sc_roll     a big jump: STR odometer 101 -> 212, badge flips 7 -> 8
//   demo_sc_biscuit  the tiny Zip over Biscuit's head and his mini card (LV 1, STR 0.4 kg)
import { E, registerShot, layer, ease, prog, clamp, lerp, rr, circle, glow, linGrad, alpha } from '/engine/core.js';
import { camMove } from '../sets/acting.js';
import { home3 } from '../sets/home3.js';
import { cat } from '../sets/creatures.js';
import { PAL, zip, zipOpen, statCard, roll, levelSpin, xpFill, levelUp, levelFlash, levelShake, freeze, morningPop, miniCard, sparks } from '../sets/statcard.js';

// a cereal bowl on the table (look-dev stand-in until H4's kitchen lands)
function bowl(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 120, 14, 0, 0, 7); g.fill();
  g.fillStyle = '#f2efe6'; g.beginPath(); g.moveTo(-120, -70); g.quadraticCurveTo(-110, 0, 0, 0); g.quadraticCurveTo(110, 0, 120, -70); g.closePath(); g.fill();
  g.fillStyle = '#fbf6ea'; g.beginPath(); g.ellipse(0, -70, 120, 22, 0, 0, 7); g.fill();
  for (let i = 0; i < 16; i++) circle(g, -90 + (i * 47) % 180, -72 + (i % 3) * 5, 9, i % 2 ? '#e2a64a' : '#c98a32');
  g.fillStyle = '#4a86c8'; rr(g, -100, -46, 200, 10, 5); g.fill(); g.restore();
}
// an ink-navy night with sodium lights far off and a faint violet rim
function night(g, t, cam) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [PAL.ink, PAL.navy, '#1a2236']); g.fillRect(0, 0, E.W, E.H);
  layer(g, cam, 0.4, (g) => {
    glow(g, E.W * 0.85, E.H * 0.15, 700, PAL.violet, 0.1);
    for (let i = 0; i < 9; i++) { const x = 120 + i * 220, h = 120 + (i * 53) % 140; g.fillStyle = '#10172a'; g.fillRect(x - 90, E.H * 0.72 - h, 180, h + 400); for (let w = 0; w < 4; w++) if ((i + w) % 3) { g.fillStyle = alpha('#ffcf7a', 0.5); g.fillRect(x - 60 + w * 34, E.H * 0.72 - h + 30, 14, 18); } }
    for (let i = 0; i < 6; i++) { const x = 160 + i * 330; glow(g, x, E.H * 0.6, 120, '#FF9F43', 0.4); circle(g, x, E.H * 0.6, 6, '#ffd9a0'); }
  });
  g.fillStyle = linGrad(g, 0, E.H * 0.78, 0, E.H, ['#0e1424', '#0b0f1a']); g.fillRect(0, E.H * 0.78, E.W, E.H * 0.22);
  for (let i = 0; i < 6; i++) { g.fillStyle = alpha('#FF9F43', 0.08); g.fillRect(160 + i * 330 - 8, E.H * 0.8, 16, 160); }   // wet reflections
}

registerShot('demo_sc_morning', { draw(g, t, info) {
  const at = 0.7, tf = freeze(t, at + 1.15, 5), sh = levelShake(t, at + 1.15, 3);
  const cam = { ...camMove(tf, info.dur, { z: [1.0, 1.06] }), y: 0 }; cam.x = (cam.x || 0) + sh[0]; cam.y += sh[1];
  const H = home3(g, tf, cam, { room: 'kitchen', mood: 'day', plate: 0 }), P = H.pos;
  layer(g, cam, 1, (g) => {
    bowl(g, P.tableX, P.tableTop - 6, 1);
    morningPop(g, tf, { at, zipX: P.tableX, zipY: P.tableTop - 140, cardX: P.tableX + 330, cardY: P.tableTop - 310, s: 1, lv: [6, 7], str: [95, 101], popX: P.tableX - 400, popY: P.tableTop - 380, popS: 0.75 });
  });
  levelFlash(g, t, at + 1.15);
} });

registerShot('demo_sc_night', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] }); night(g, t, cam);
  const zx = E.W * 0.5, zy = E.H * 0.7, close = info.dur - 0.9;
  layer(g, cam, 1, (g) => {
    const zo = zipOpen(t, 0.2, { close: close + 0.2 }), Z = zip(g, t, zx, zy, { open: zo, seam: clamp(zo * 4) });
    const uf = ease.out(prog(t, 0.5, 1.05)) * (1 - ease.in(prog(t, close, close + 0.35))), X = xpFill(t, { from: 0.1, to: 0.72, at0: 1.0, at1: 3.0 });
    statCard(g, t, { x: E.W * 0.5, y: E.H * 0.4, s: 1.15, from: Z.mouth, unfold: uf, lv: 23, str: 640, xp: X.xp, warn: 'Bones: not included.', warnAt: 1.6 });
  });
} });

registerShot('demo_sc_pop', { draw(g, t, info) {
  const at = 0.5, tf = freeze(t, at, 5), sh = levelShake(t, at, 3), cam = camMove(tf, info.dur, { z: [1.0, 1.08] });
  g.save(); g.translate(sh[0], sh[1]); night(g, tf, cam);
  layer(g, cam, 1, (g) => { statCard(g, tf, { x: E.W * 0.5, y: E.H * 0.66, s: 0.8, lv: 12, str: 168, xp: 0.04 }); levelUp(g, tf, at, { x: E.W * 0.5, y: E.H * 0.3, s: 1, hold: 2 }); });
  g.restore(); levelFlash(g, t, at);
} });

registerShot('demo_sc_roll', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.1] }); night(g, t, cam);
  const sp = levelSpin(t, 1.2, 0.5);
  layer(g, cam, 1, (g) => statCard(g, t, { x: E.W * 0.5, y: E.H * 0.48, s: 1.35, lv: sp >= 0.5 ? 8 : 7, lvPrev: 7, spin: sp > 0 && sp < 1 ? sp : 0, str: roll(t, 101, 212, 0.4, 2.4), xp: clamp(t / info.dur), tilt: -0.04 }));
  sparks(g, t, 1.2, E.W * 0.5 - 404 * 1.35 * 0.98, E.H * 0.48 - 10, { n: 22, s: 0.9, seed: 4 });
} });

registerShot('demo_sc_biscuit', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.25, 1.32] }), y: 60 };
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', plate: 0 }), GY = H.GY ?? E.H * 0.8, bx = E.W * 0.5 + 320, hy = GY - 290;
  layer(g, cam, 1, (g) => {
    cat(g, { x: bx, y: GY, s: 1.9, facing: -1, pose: 'sit', eyes: t > 1.0 ? 'wide' : 'auto', t, tilt: t > 1.0 ? -0.1 : 0 });
    const zo = zipOpen(t, 0.6, { dur: 0.3 }), Z = zip(g, t, bx - 10, hy, { w: 110, open: zo, seam: clamp(zo * 4) });
    miniCard(g, t, { x: bx - 150, y: hy - 140, s: 1.05, from: Z.mouth, unfold: ease.out(prog(t, 0.9, 1.4)), lv: 1, str: 0.4 });
  });
} });
