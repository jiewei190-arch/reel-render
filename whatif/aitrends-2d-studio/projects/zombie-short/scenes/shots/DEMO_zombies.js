// DEMO_zombies.js — sheet-check shots for sets/zombies.js (temporary ids, not in the real shot list). Vertical 9:16.
//   demo_lineup   the 6 zombie variants shuffling past on the dusk street (office, tracksuit, chef, granny, kid, delivery)
//   demo_horde    "Squeak. Squeak. Forty heads turn.": a 40-zombie horde, all heads snap to camera at 1.4 s
//   demo_sniff    the delivery scooter pulls up and the horde stops and sniffs; one happy zombie with fries
//   demo_props    beanbag pushed over gently; the delivery app (ORDER ARRIVING -> 5 stars); the zombie who tips in shoes
import { E, registerShot, layer, ease, prog, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { street, streetFg } from '../sets/street.js';
import { apartment } from '../sets/apartment.js';
import { blinkFlag, exprAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { zombie, horde, scooter, takeoutBag, fries, deliveryPhone, beanbag, shoeTip } from '../sets/zombies.js';

registerShot('demo_lineup', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [-60, 60], y: [-80, -90] });
  const S0 = street(g, t, cam, { mood: 'dusk', power: 0.4 });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 6; i++) { const x = S0.CX - 900 + i * 360 + t * 40; zombie(g, x, S0.GY + 10 + (i % 2) * 30, 1.9, { t: t + i, variant: i, walk: x, facing: 1, seed: i, rim: S0.rim }); } });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffc8a0' });
} });

registerShot('demo_horde', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [0, 0], y: [-60, -70] });
  const S0 = street(g, t, cam, { mood: 'dusk', power: 0.3 });
  layer(g, cam, 1, (g) => horde(g, t, { n: 40, rows: 5, x: S0.CX - 1000, w: 2000, y: S0.GY + 120, s: 1.7, turn: ease.out(prog(t, 1.4, 1.7)), seed: 3 }));
  atmos(g, t, cam, { color: '#ffc8a0' });
} });

registerShot('demo_sniff', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [0, 20], y: [-60, -60] });
  const S0 = street(g, t, cam, { mood: 'dusk', power: 0.3 }), arrive = ease.out(prog(t, 0, 1.4)), sn = ease.inOut(prog(t, 1.4, 2.2));
  layer(g, cam, 1, (g) => {
    horde(g, t, { n: 24, rows: 3, x: S0.CX - 900, w: 1800, y: S0.GY + 40, s: 1.6, sniff: sn, seed: 9, facing: -1 });
    scooter(g, lerp(S0.CX + 1200, S0.CX + 380, arrive), S0.GY + 230, 1.5, { t, facing: -1, speed: 1 - arrive, rider: 'DEV', expr: t > 2 ? 'surprised' : 'smile' });
    zombie(g, S0.CX - 120, S0.GY + 260, 2.2, { t, variant: 3, happy: prog(t, 2.6, 3.0), facing: 1, seed: 2, rim: S0.rim });
  });
  atmos(g, t, cam, { color: '#ffc8a0' });
} });

registerShot('demo_props', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.15, 1.2], x: [-120, -100], y: [60, 60] });
  const A = apartment(g, t, cam, { power: 1, mood: 'dusk' });
  layer(g, cam, 1, (g) => {
    beanbag(g, A.CX - 180, A.GY + 10, 1.1, { t, tip: prog(t, 0.6, 2.0) });
    zombie(g, A.CX - 420 + lerp(0, 160, prog(t, 0.6, 2.0)), A.GY + 10, 1.9, { t, variant: 0, walk: t * 60, facing: 1, rim: A.rim });
    zombie(g, A.CX + 260, A.GY + 10, 1.9, { t, variant: 5, tip: prog(t, 2.0, 2.4), facing: -1, seed: 4, rim: A.rim });
  });
  deliveryPhone(g, E.W * 0.74, E.H * 0.22, 0.6, { t, state: t < 2.6 ? 'arriving' : 'rated', stars: Math.floor(lerp(0, 5.99, prog(t, 2.8, 3.6))), buzz: t < 0.8 ? 1 : 0 });
  takeoutBag(g, E.W * 0.15, E.H * 0.62, 0.9, { rot: -0.05 }); fries(g, E.W * 0.32, E.H * 0.62, 0.9, { t, aroma: 1 }); shoeTip(g, E.W * 0.55, E.H * 0.64, 0.8, {});
  atmos(g, t, cam, { color: '#ffd8b0' });
} });
