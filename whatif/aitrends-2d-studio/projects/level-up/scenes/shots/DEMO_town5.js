// DEMO_town5.js — sheet-check of sets/town5.js (temporary ids demo_t5_*, not bound to the voice). 16:9.
//   demo_t5_kitchen  breakfast: sun shafts over the table, the cereal bowl (the Zip spot is marked by a faint gold ring), steam off the kettle
//   demo_t5_living   the living room at dusk; the sofa lifts (no characters: lift is a prop opt) and the TV remote shows underneath
//   demo_t5_drive    driveway + lawn + Mum's patio; the car lifts, the lawn holes appear, then the patio tiles crack
//   demo_t5_park     the night park on the hill road: sodium lamps, wet road, the town below; the bench lifts
//   demo_t5_field    the muddy field road: the pumpkin truck stuck, wheel spinning; planks, gravel and sand arrive; the truck comes out
import { E, registerShot, layer, ease, prog, clamp, lerp, ring, glow } from '/engine/core.js';
import { camMove } from '../sets/acting.js';
import { town5, town5Fg, sofa, familyCar, parkBench } from '../sets/town5.js';

registerShot('demo_t5_kitchen', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], drift: 0.4 });
  const T = town5(g, t, cam, { view: 'kitchen', mood: 'morning', milk: 1, spill: prog(t, 2.6, 3.0) });
  layer(g, cam, 1, (g) => { const k = 0.5 + 0.5 * Math.sin(t * 3); ring(g, T.pos.bowlX, T.pos.bowlY - 120, 50 + 6 * k, 3, 'rgba(255,201,60,.6)'); glow(g, T.pos.bowlX, T.pos.bowlY - 120, 120, '#FFC93C', 0.2); });
  town5Fg(g, t, cam, { view: 'kitchen' });
} });

registerShot('demo_t5_living', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.3 });
  const T = town5(g, t, cam, { view: 'living', mood: 'dusk', sofa: false, tv: 0.7 }), P = T.pos;
  layer(g, cam, 1, (g) => sofa(g, P.sofaX, P.sofaY, 1, { t, lift: 200 * ease.inOut(prog(t, 1.0, 2.4)), tilt: -0.04 * ease.inOut(prog(t, 1.0, 2.4)) }));
  town5Fg(g, t, cam, { view: 'living' });
} });

registerShot('demo_t5_drive', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.3 });
  const T = town5(g, t, cam, { view: 'drive', car: false, sink: prog(t, 1.4, 2.0), crack: prog(t, 2.6, 2.9) }), P = T.pos;
  layer(g, cam, 1, (g) => familyCar(g, P.carX, P.carY, 1, { t, lift: 130 * ease.out(prog(t, 0.6, 1.4)) }));
  town5Fg(g, t, cam, { view: 'drive' });
} });

registerShot('demo_t5_park', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.3 });
  const T = town5(g, t, cam, { view: 'park', bench: false, wet: 0.7, cold: 0.6 }), P = T.pos;
  layer(g, cam, 1, (g) => parkBench(g, P.benchX, P.benchY, 1, { lift: 180 * ease.inOut(prog(t, 1.2, 2.4)) }));
  town5Fg(g, t, cam, { view: 'park' });
} });

registerShot('demo_t5_field', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-60, -60], drift: 0.3 });
  town5(g, t, cam, { view: 'field', spin: t < 1.2 ? t * 3 : 3.6, planks: prog(t, 1.2, 1.5), gravel: prog(t, 1.6, 2.2), sand: prog(t, 2.0, 2.8), lift: 80 * ease.inOut(prog(t, 1.4, 2.4)), out: ease.inOut(prog(t, 2.8, 3.8)) });
  town5Fg(g, t, cam, { view: 'field' });
} });
