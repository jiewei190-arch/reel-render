// DEMO_timebp.js — sheet-check shots for sets/timebp.js (temporary ids, not in the real shot list). ~6 s each.
//   demo_tb_light   light reaches the eye (~300,000 km every second), then it freezes: no light arrives = dark; then the 8 min 20 s sunlight trip
//   demo_tb_air     a fingertip cube of air (~25 billion billion molecules, 2.5 x 10^19 per cm³), molecules freeze; airliner ~250 vs molecule ~500 m/s
//   demo_tb_breath  the diaphragm pulls air in, then frozen air: no push, no air; the kitchen's ~48 kg of air
//   demo_tb_motion  Newton's first law (the leaping cat keeps moving), then p = m x v and the goalkeeper's glove
//   demo_tb_clock   the stopped-clock illusion: ~3 jumps a second, the blur backfilled, the first tick feels too long (2001 study, UCL)
//   demo_tb_gps     GPS clocks: +45, -7, = +38 µs/day; uncorrected: off by kilometres
//   demo_tb_hau     2001, Harvard, Lene Hau's team: a light pulse stopped ~1/1000 s in ultracold atoms, then let go
import { E, registerShot, ease, prog, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { board, label } from '../sets/bp.js';
import { lightToEye, sunToEarth, airBox, airRace, lungs, kitchenAir, newton1, momentum, chronostasis, gpsClocks, hauLight } from '../sets/timebp.js';

const push = (g, t, dur, fn) => { const z = 1 + 0.03 * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 41 });
const fade = (g, a, fn) => { if (a <= 0.01) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); };
const two = (g, t, a, b, at) => { fade(g, 1 - prog(t, at, at + 0.4), a); fade(g, prog(t, at + 0.2, at + 0.6), b); };

registerShot('demo_tb_light', { draw(g, t, info) {
  board(g, t, { title: 'FIG 1 - HOW YOU SEE', fig: 'LIGHT TO THE EYE' });
  push(g, t, info.dur, () => two(g, t, () => { const L = lightToEye(g, t, { x: E.W * 0.5, y: E.H * 0.52, s: 1, k: ease.out(prog(t, 0, 1)), flow: 1, frozen: prog(t, 2.0, 2.4) }); label(g, t, { at: L.retina, to: [L.retina[0] - 60, E.H * 0.17], str: 'retina', start: 1.0 }); },
    () => sunToEarth(g, t, { x: E.W * 0.5, y: E.H * 0.55, w: 1400, k: ease.out(prog(t, 3.4, 4.0)), travel: prog(t, 3.8, 5.6) }), 3.1));
  air(g, t);
} });
registerShot('demo_tb_air', { draw(g, t, info) {
  board(g, t, { title: 'FIG 2 - AIR', fig: 'MOLECULES' });
  push(g, t, info.dur, () => two(g, t, () => airBox(g, t, { x: E.W * 0.46, y: E.H * 0.56, s: 1.1, k: ease.out(prog(t, 0, 1)), frozen: prog(t, 2.0, 2.3) }),
    () => airRace(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1300, k: ease.out(prog(t, 3.3, 3.9)), race: prog(t, 3.6, 5.6) }), 3.0));
  air(g, t);
} });
registerShot('demo_tb_breath', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - BREATHING', fig: 'AIR PUSHES IN' });
  push(g, t, info.dur, () => two(g, t, () => lungs(g, t, { x: E.W * 0.5, y: E.H * 0.58, s: 0.75, k: ease.out(prog(t, 0, 1)), breathe: 0.5 + 0.5 * Math.sin(t * 2), frozen: prog(t, 2.0, 2.3) }),
    () => kitchenAir(g, t, { x: E.W * 0.5, y: E.H * 0.55, s: 1, k: 1, show: 2 * prog(t, 3.3, 5.0) }), 3.0));
  air(g, t);
} });
registerShot('demo_tb_motion', { draw(g, t, info) {
  board(g, t, { title: "FIG 4 - NEWTON'S FIRST LAW", fig: 'KEEP MOVING' });
  push(g, t, info.dur, () => two(g, t, () => newton1(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1300, k: ease.out(prog(t, 0, 1)), go: prog(t, 0.6, 2.8) }),
    () => momentum(g, t, { x: E.W * 0.5, y: E.H * 0.55, w: 1400, k: ease.out(prog(t, 3.3, 3.9)), show: 2 * prog(t, 3.6, 5.2) }), 3.0));
  air(g, t);
} });
registerShot('demo_tb_clock', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - THE STOPPED CLOCK', fig: 'THE BRAIN FILLS IN' });
  push(g, t, info.dur, () => chronostasis(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1400, k: ease.out(prog(t, 0, 1.2)), jump: prog(t, 1.2, 1.5), fill: prog(t, 2.0, 3.2) }));
  air(g, t);
} });
registerShot('demo_tb_gps', { draw(g, t, info) {
  board(g, t, { title: 'FIG 6 - SATELLITE CLOCKS', fig: 'RELATIVITY' });
  push(g, t, info.dur, () => gpsClocks(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1400, k: ease.out(prog(t, 0, 1)), show: 3 * prog(t, 0.8, 4.4) }));
  air(g, t);
} });
registerShot('demo_tb_hau', { draw(g, t, info) {
  board(g, t, { title: 'FIG 7 - STOPPING LIGHT', fig: 'A REAL LAB' });
  push(g, t, info.dur, () => hauLight(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1400, k: ease.out(prog(t, 0, 1)), stop: prog(t, 0.8, 2.2), release: prog(t, 4.2, 5.4) }));
  air(g, t);
} });
