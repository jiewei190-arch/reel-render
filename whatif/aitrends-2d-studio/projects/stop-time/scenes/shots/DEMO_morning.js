// DEMO_morning.js — sheet-check of sets/morning.js (temporary ids demo_m_*, not bound to the voice). 16:9.
//   demo_m_kitchen   Tuesday breakfast (morning): HERO at his seat, MINA at hers with her juice glass, sun shafts over the table
//   demo_m_day       the same kitchen in day light (Wednesday breakfast reuse), Biscuit eyeing the butter
//   demo_m_evening   the evening watch beat: the oven clock reads 18:07, MINA checks HERO's watch under the pendant lamp
//   demo_m_table     Mina's end of the table, low camera, the project stand-in on the placemat, the milk jug, the bowl on the counter
//   demo_m_hall      the hallway / living room in the evening: lamp, radiator socks, the lit kitchen doorway
//   demo_m_door      the doorway gag: HERO leans on a door that bows a hair and doesn't open
import { E, registerShot, layer, ease, prog, clamp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { cat } from '../sets/creatures.js';
import { blinkFlag, idle, lookToward, camMove } from '../sets/acting.js';
import { morning, morningFg } from '../sets/morning.js';

const hero = (g, x, y, o, t) => actor(g, 'HERO', { x, y, s: 1.9, facing: 1, pose: idle(POSES.stand, t, 2), expr: 'happy', blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0), t, ...o });
const mina = (g, x, y, o, t) => actor(g, 'MINA', { x, y, s: 1.9, facing: 1, pose: idle(POSES.stand, t, 1), expr: 'happy', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0), t, ...o });

registerShot('demo_m_kitchen', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.4 }), M = morning(g, t, cam, { view: 'kitchen', mood: 'morning' }), P = M.pos;
  layer(g, cam, 1, (g) => { mina(g, P.minaSeatX - 150, M.GY, { facing: 1, rim: M.rim }, t); hero(g, P.heroSeatX + 150, M.GY, { facing: -1, look: lookToward(-1, 0.2), rim: M.rim }, t); });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });
registerShot('demo_m_day', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.3 }), M = morning(g, t, cam, { view: 'kitchen', mood: 'day' }), P = M.pos;
  layer(g, cam, 1, (g) => cat(g, { x: P.tableX + 470, y: M.GY, s: 1.8, facing: -1, pose: 'loaf', eyes: 'auto', t, rim: M.rim }));
  morningFg(g, t, cam, { view: 'kitchen', mood: 'day' });
} });
registerShot('demo_m_evening', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-120, -160], drift: 0.3 }), M = morning(g, t, cam, { view: 'kitchen', mood: 'evening', breakfast: false, juice: false, butter: false }), P = M.pos;
  layer(g, cam, 1, (g) => { hero(g, P.ovenX + 380, M.GY, { facing: -1, pose: { ...POSES.stand, hF: [40, -170], eF: [36, -130] }, look: lookToward(-1, 0.3), rim: M.rim }, t); mina(g, P.ovenX + 200, M.GY, { facing: 1, pose: { ...POSES.reach, hF: [60, -160] }, expr: 'thinking', rim: M.rim }, t); });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'evening' });
} });
registerShot('demo_m_table', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.3 }); morning(g, t, cam, { view: 'table', mood: 'day', project: true });
  morningFg(g, t, cam, { view: 'table', mood: 'day' });
} });
registerShot('demo_m_hall', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.3 }), M = morning(g, t, cam, { view: 'hall', mood: 'evening' }), P = M.pos;
  layer(g, cam, 1, (g) => hero(g, P.kitchenDoorX + 40, M.GY + 40, { facing: 1, rim: M.rim }, t));
  morningFg(g, t, cam, { view: 'hall', mood: 'evening' });
} });
registerShot('demo_m_door', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.2 }), push = ease.inOut(prog(t, 0.8, 1.6)), M = morning(g, t, cam, { view: 'door', mood: 'day', push }), P = M.pos;
  layer(g, cam, 1, (g) => hero(g, P.handleX - 160, M.GY, { facing: 1, pose: { ...POSES.reach, hF: [80, -150], eF: [50, -160], head: [16, -200] }, expr: push > 0.5 ? 'worried' : 'determined', rim: M.rim }, t));
} });
