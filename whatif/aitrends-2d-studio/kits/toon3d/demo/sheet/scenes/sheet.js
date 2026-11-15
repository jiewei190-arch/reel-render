// FX demo sheet: one short shot per new effect / insert / transition / light look. Composed by kits/toon3d/tools/make_fx_sheet.py.
import { registerShot, allShots, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { toonStage, camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, idle, mixExpr } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { emu } from '/kits/toon3d/animals.js';
import { SETS } from '/kits/toon3d/sets.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnySky, sunnyLook } from '/kits/toon3d/sky.js';
import { useToonTransitions } from '/kits/toon3d/transitions.js';
useToonTransitions();

const EXP = { sparkle: EXPR.happy, sweat: EXPR.worried, exclaim: EXPR.shocked, stars: { ...EXPR.shocked, lid: 0.4, mouth: 'wavy' }, zzz: EXPR.asleep, shake: EXPR.panic, flash: EXPR.shocked,
  ripples: EXPR.smug, godrays: EXPR.happy, spotlight: EXPR.grin, speedlines: EXPR.shocked, glow: EXPR.happy };
function world(T, o = {}) {
  const old = o.look === 'old'; const st = toonStage(T, { light: old ? 'day' : 'sunny', fov: 36, target: [0, 0, 1], shadowSize: 10 });
  const set = SETS.outbackFarm(st, { field: [26, 14, -10] }); const sky = old ? null : sunnySky(st, { clouds: 9, seed: 4 });
  const hero = castMember('hero'); hero.position.set(-0.75, 0, 1.6); hero.rotation.y = 0.25; st.add(hero);
  const em = emu({ general: true, seed: 2 }); em.position.set(0.95, 0, 1.0); em.rotation.y = -0.35; st.add(em);
  return { stage: st, set, sky, hero, emu: em };
}
const base = {
  init(T, info) { return world(T, info); },
  draw(s, t, info) { s.set.update(t); s.sky?.update(t); const fx = info.fx;
    s.hero.pose(addPose(fx === 'zzz' ? POSE.sleepy : fx === 'shake' ? POSE.panic : POSE.relaxed, idle(t, 3))); s.hero.face(EXP[fx] || EXPR.neutral, t);
    s.emu.update(t, { lid: fx === 'heartEyes' ? 0.5 : fx === 'question' ? 0.05 : 0.4, headTurn: -0.3, look: [-0.3, 0], blink: false });
    if (info.look) s.stage.cam([0.1, 1.7, 10.5], [0.1, 2.9, 1.2], 42); else camMove(s.stage, t, [[0, { pos: [0.1, 2.15, 9.2], look: [0.1, 1.75, 1.2], fov: 38 }], [1, { pos: [0.1, 2.15, 8.8], look: [0.1, 1.75, 1.2], fov: 38 }]]);
    if (fx === 'shake') shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.25, dur: 0.6 }]); },
};
const sh = (E.shots || []);
// FX tiles
for (const name of ['sparkle', 'sweat', 'exclaim', 'question', 'hearts', 'heartEyes', 'stars', 'zzz', 'shake', 'flash', 'ripples', 'godrays', 'spotlight', 'speedlines', 'glow'])
  registerShot(`fx_${name}`, { kind: '3d', init: base.init, draw: base.draw,
    overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tintAmount: 0.15 }); reactions(g, t, s, [{ fx: name, on: info.on, at: 0, atFeet: true }]); } });
// inserts
const INS = {
  bigtext: { type: 'bigtext', kicker: 'EMU TOP SPEED', title: '50 KM/H', lines: ['flat out'] },
  counter: { type: 'counter', title: 'BULLETS FIRED', value: 9860, lines: ['986 emus claimed'], color: '#ff5a4a' },
  versus: { type: 'versus', title: 'THE PROBLEM', lines: ['MACHINE GUN', 'EMU'], color: '#3b7a3a' },
  list: { type: 'list', title: 'EMU ADVANTAGES', lines: ['50 km/h', 'Tiny groups', 'Bulletproof attitude', 'Unlimited snacks'], highlight: 2 },
  timeline: { type: 'timeline', title: 'THE EMU WAR', lines: ['Nov 2 · first shots', 'Nov 4 · ambush fails', 'Nov 8 · army pulls out', 'Nov 13 · round two'], highlight: 2 },
  map: { type: 'map', title: 'WESTERN AUSTRALIA', lines: ['Perth', 'Campion', 'Walgoolan', 'the wheat'] },
  chart: { type: 'chart', title: 'EMUS vs ARMY', data: [20000, 986, 1], lines: ['emus', 'claimed', 'army wins'], highlight: 0 },
  document: { type: 'document', title: 'ARMY REPORT', lines: ['Rounds: 9,860', 'Emus: 986', 'Result: oh no'], highlight: 2 },
  phone: { type: 'phone', title: 'Commander', lines: ['How is the war going?', 'Define "going"', 'Are we winning?', 'The birds are.'] },
};
for (const [k, ins] of Object.entries(INS)) insertShot(`in_${k}`, { scene: { init: base.init, draw: base.draw }, insert: ins });
// lighting: same shot, old flat 'day' look vs new sunny sky + god rays + warm soft-light tint
registerShot('L_old', { kind: '3d', init: base.init, draw: base.draw });
registerShot('L_new', { kind: '3d', init: base.init, draw: base.draw, overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80] }, tint: '#ffcf8a' }); } });
// transitions: A = wide farm, B = close-up of the hero
const A = { kind: '3d', init: base.init, draw(s, t, info) { base.draw(s, t, info); s.stage.cam([2, 4.5, 15], [0, 2.2, -4], 46); }, overlay(g, t) { sunnyLook(g, t, { rays: true }); } };
const B = { kind: '3d', init: base.init, draw(s, t, info) { base.draw(s, t, { fx: 'sparkle' }); s.stage.cam([-0.55, 2.2, 4.6], [-0.7, 2.05, 1.6], 30); }, overlay(g, t) { sunnyLook(g, t, { rays: false }); } };
for (const id of ['TA1', 'TA2', 'TA3', 'TA4']) registerShot(id, A);
for (const id of ['TB1', 'TB2', 'TB3', 'TB4']) registerShot(id, B);
