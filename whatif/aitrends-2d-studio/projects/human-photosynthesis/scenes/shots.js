// human-photosynthesis: LOL. Hero turns green -> still starves -> 1% -> tennis court of skin -> 290 h of sun a day -> plants don't walk.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { THREE, camMove, cyl, floor, toon, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, hero, meadow, bigPot, sunflower, court, GREEN } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 1.1 }, tint: '#ffcf8a' };
const ARMS_SUN = { ...POSE.armsUp, armL: [0.5, 2.3, 0], armR: [0.5, 2.3, 0], elbowL: 0.1, elbowR: 0.1, headNod: -0.3 };
const flash = (t) => clamp(0.5 + 0.5 * Math.sin(t * 22)) * (1 - prog(t, 1.2, 1.9)) + prog(t, 0.2, 1.9);   // flicker -> fully green

// s1 (frame 1 = the loop target): hero mid-transformation, arms flinging up to the sun, skin flashing green, fast low push-in
registerShot('s1', { kind: '3d',
  init(T) { const s = meadow(T, { target: [0, 0, 0], shadowSize: 6 }); s.h = hero(); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.sky.update(t); const k = ease.outBack(prog(t, 0, 0.45));
    s.h.green(clamp(flash(t))); s.h.pose(addPose(mixPose(POSE.panic, ARMS_SUN, k), { ...idle(t, 3), bob: Math.abs(Math.sin(t * 9)) * 0.05 * (1 - prog(t, 1, 1.6)) }));
    s.h.face(mixExpr(EXPR.shocked, EXPR.happy, prog(t, 0.9, 1.4)), t); s.h.rotation.y = 0.15;
    camMove(s.stage, t, [[0, { pos: [1.2, 0.7, 5.4], look: [0, 2.4, 0], fov: 46 }], [info.dur, { pos: [0.6, 1.1, 3.9], look: [0, 2.3, 0], fov: 44 }]], ease.out); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'glow', on: 'h', at: 0, color: '#9cff6a', scale: 1.4 }, { fx: 'sparkle', on: 'h', at: 0, scale: 1.1 }, { fx: 'sparkle', on: 'h', at: 0.9, scale: 0.8, dx: 120, dy: 60 }]); },
});

// s2 "Bad news..." : fully green, blissed out, eyes shut, soaking up the sun
registerShot('s2', { kind: '3d',
  init(T) { const s = meadow(T, { target: [0, 0, 0], shadowSize: 6, seed: 6 }); s.h = hero(); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.sky.update(t + 2); s.h.green(1); s.h.pose(addPose({ ...ARMS_SUN, armL: [0.3, 1.6, 0], armR: [0.3, 1.6, 0], headNod: -0.35 }, idle(t, 4)));
    s.h.face({ ...EXPR.happy, lid: 1, mouth: 'smile' }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 3.6], look: [0, 2.3, 0], fov: 34 }], [info.dur, { pos: [0, 2.35, 3.1], look: [0, 2.35, 0], fov: 33 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'h', at: 0.1, scale: 0.7 }]); },
});

// s3 "you'd still starve." : stomach grumble, snap from bliss to panic, hands on belly, camera jolt
registerShot('s3', { kind: '3d',
  init(T) { const s = meadow(T, { target: [0, 0, 0], shadowSize: 6, seed: 7 }); s.h = hero(); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.sky.update(t + 4); s.h.green(1); const st = at(info, 'starve', 0.45);
    const k = ease.outBack(prog(t, st - 0.1, st + 0.15));
    s.h.pose(addPose(mixPose(POSE.holdFront, { ...POSE.holdFront, armL: [0.5, 0.35, 0.6], armR: [0.5, 0.35, 0.6], elbowL: 1.6, elbowR: 1.6, lean: 0.25, headNod: 0.15 }, k), { ...tremble(t, k * 2) }));
    s.h.face(mixExpr(EXPR.neutral, { ...EXPR.shocked, pupil: [0, 0] }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 5.0], look: [0, 1.7, 0], fov: 36 }], [info.dur, { pos: [0, 2.0, 4.4], look: [0, 1.7, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: st, amp: 0.08, dur: 0.5 }]); },
  overlay(g, t, info, s) { const st = at(info, 'starve', 0.45); sunnyLook(g, t, { rays: false });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: st }, { fx: 'sweat', on: 'h', at: st + 0.15 }, { fx: 'ripples', on: 'h', at: st, atFeet: true }]); },
});

// s4 "about 1 percent of the energy you need" : counter card over the hero standing in the sun
const stand = { init(T) { const s = meadow(T, { target: [0, 0, 0], shadowSize: 6, seed: 8 }); s.h = hero(); s.stage.add(s.h); return s; },
  draw(s, t) { s.sky.update(t); s.h.green(1); s.h.pose(addPose(ARMS_SUN, idle(t, 2))); s.h.face(EXPR.worried, t); s.stage.cam([0.4, 1.6, 6.8], [0, 1.9, 0], 40); } };
insertShot('s4', { scene: stand, insert: { type: 'counter', title: 'ENERGY FROM YOUR SKIN', value: 1, suffix: '%', lines: ['of what you need'], color: '#7be04a' } });

// s5 close-up: stomach still grumbling, deadpan stare into the lens
registerShot('s5', { kind: '3d',
  init(T) { const s = meadow(T, { target: [0, 0, 0], shadowSize: 6, seed: 9 }); s.h = hero(); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.sky.update(t); s.h.green(1); s.h.pose(addPose({ ...POSE.holdFront, armL: [0.5, 0.35, 0.6], armR: [0.5, 0.35, 0.6], elbowL: 1.6, elbowR: 1.6 }, idle(t, 5)));
    s.h.face({ ...EXPR.deadpan, lid: 0.55, pupil: [0, 0], mouth: 'wavy' }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 3.0], look: [0, 2.15, 0], fov: 30 }], [info.dur, { pos: [0, 2.2, 2.7], look: [0, 2.15, 0], fov: 30 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'sweat', on: 'h', at: 0.2 }]); },
});

// s6 "To fix that, you'd need skin about the size of a..." : hero kicks a giant green roll of "skin", it unrolls away down the meadow
function rollRig(st) { const g = new THREE.Group(); const roll = cyl(1, 1, 14.6, GREEN, 0, 0, 0, 28); roll.rotation.x = Math.PI / 2; const rg = new THREE.Group(); rg.add(roll); outline(rg, { px: 2.6 }); g.add(rg);
  const sheet = new THREE.Group(); const p = floor(1, 14.6, GREEN, 0.5, 0); p.position.y = 0.025; sheet.add(p);
  for (const z of [-7.3, -5.47, 5.47, 7.3]) { const l = floor(1, 0.12, '#ffffff', 0.5, z); l.position.y = 0.035; sheet.add(l); }
  st.add(sheet); st.add(g); return { roll: g, rollMesh: rg, sheet }; }
registerShot('s6', { kind: '3d',
  init(T) { const s = meadow(T, { target: [6, 0, 0], shadowSize: 14, seed: 10 }); s.h = hero(); s.h.position.set(-1.6, 0, 0); s.h.rotation.y = Math.PI / 2; s.stage.add(s.h); Object.assign(s, rollRig(s.stage)); return s; },
  draw(s, t, info) { s.sky.update(t); s.h.green(1); const kick = 0.35, go = ease.out(prog(t, kick, info.dur + 0.6)); const x = lerp(0, 22, go); const r = lerp(1.0, 0.45, go);
    s.roll.position.set(x, r, 0); s.rollMesh.scale.set(r, 1, r); s.rollMesh.rotation.z = -x / Math.max(r, 0.3);
    s.sheet.scale.x = Math.max(0.001, x); s.sheet.position.x = 0;
    const kk = Math.sin(clamp((t - 0.05) / 0.5) * Math.PI); s.h.pose(addPose(POSE.stand, { legR: [-0.2 + kk * 1.3, 0.05], kneeR: 0.3 * (1 - kk), armL: [-0.3 * kk, 0.5, 0], armR: [0.4 * kk, 0.4, 0], lean: -0.1 * kk }));
    s.h.face(t < 0.6 ? EXPR.angry : EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [-2.9, 2.0, 7.2], look: [-1.0, 1.3, 0], fov: 44 }], [info.dur, { pos: [-6.5, 6.5, 8.5], look: [7, 0, 0], fov: 52 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.7 } }); },
});

// s7 "...tennis court, by one estimate." : crane up, the unrolled skin IS a full tennis court, hero tiny on his back in the middle
registerShot('s7', { kind: '3d',
  init(T) { const s = meadow(T, { target: [0, 0, 0], shadowSize: 20, seed: 11 }); s.c = court(); s.stage.add(s.c); s.h = hero(); s.h.rotation.x = -Math.PI / 2; s.h.position.set(-3, 0.35, 0); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.sky.update(t); s.h.green(1); s.h.pose({ ...POSE.stand, armL: [0, 1.4, 0], armR: [0, 1.4, 0], legL: [0, 0.3], legR: [0, 0.3] }); s.h.face({ ...EXPR.deadpan, pupil: [0, 0.3] }, t);
    camMove(s.stage, t, [[0, { pos: [-3, 5, 3.5], look: [-3, 0, 0], fov: 40 }], [1.2, { pos: [-2, 22, 18], look: [-1, 0, -0.5], fov: 44 }], [info.dur, { pos: [-1.5, 26, 20], look: [-0.5, 0, -0.5], fov: 44 }]], ease.inOut); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.6 } }); },
});
// s7b close on the hero lying in the middle of his court: blink, deadpan
registerShot('s7b', { kind: '3d',
  init(T) { const s = meadow(T, { target: [-3, 0, 0], shadowSize: 6, seed: 12 }); s.c = court(); s.stage.add(s.c); s.h = hero(); s.h.rotation.x = -Math.PI / 2; s.h.position.set(-3, 0.35, 0); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.sky.update(t); s.h.green(1); s.h.pose({ ...POSE.stand, armL: [0, 1.4, 0], armR: [0, 1.4, 0], legL: [0, 0.3], legR: [0, 0.3] }); s.h.face({ ...EXPR.deadpan, lid: 0.6, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-3.0, 4.6, -1.6], look: [-3, 0.3, -2.1], fov: 34 }], [info.dur, { pos: [-3.0, 4.1, -1.7], look: [-3, 0.3, -2.1], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'sweat', on: 'h', at: 0.25 }]); },
});

// s8 "Or 290 hours of sunshine..." : counter card over the hero sunbathing on his court
const bathe = { init(T) { const s = meadow(T, { target: [-3, 0, 0], shadowSize: 8, seed: 13 }); s.c = court(); s.stage.add(s.c); s.h = hero(); s.h.rotation.x = -Math.PI / 2; s.h.position.set(-3, 0.35, 0); s.stage.add(s.h); return s; },
  draw(s, t) { s.sky.update(t); s.h.green(1); s.h.pose({ ...POSE.stand, armL: [0, 1.4, 0], armR: [0, 1.4, 0], legL: [0, 0.3], legR: [0, 0.3] }); s.h.face(EXPR.asleep, t); s.stage.cam([0.5, 6.5, 6], [-3, 0, -0.5], 44); } };
insertShot('s8', { scene: bathe, insert: { type: 'counter', title: 'SUN NEEDED PER DAY', value: 290, suffix: ' HOURS', lines: ['by another estimate'], color: '#ffd23a' } });
// s9 "every single day." : versus card
insertShot('s9', { scene: { init: bathe.init, draw: (s, t) => bathe.draw(s, t + 2.5) }, insert: { type: 'versus', title: 'EVERY SINGLE DAY', lines: ['NEED 290 H', 'DAY: 24 H'], colorL: '#3f9a2e', color: '#d8342c' } });

// s10 "That's why plants don't walk." : the hero planted in a giant pot next to a sunflower, both dead still. Last frame cuts to s1.
registerShot('s10', { kind: '3d',
  init(T) { const s = meadow(T, { target: [0, 0, 0], shadowSize: 6, seed: 14 }); s.pot = bigPot(1); s.pot.position.set(-0.4, 0, 0); s.stage.add(s.pot);
    s.h = hero(); s.h.position.set(-0.4, s.pot.top - 0.75, 0); s.stage.add(s.h); s.f = sunflower(1.25); s.f.position.set(1.7, 0, -0.2); s.stage.add(s.f); return s; },
  draw(s, t, info) { s.sky.update(t); s.h.green(1); const w = at(info, 'walk', 1.1);
    s.h.pose({ ...ARMS_SUN, armL: [0.2, 1.9, 0.3], armR: [0.2, 1.9, 0.3], elbowL: 0.5, elbowR: 0.5, headNod: 0 }); s.h.face({ ...EXPR.deadpan, pupil: [t > w ? 0 : 0.6, 0] }, t);
    s.f.head.rotation.z = 0.08 * Math.sin(t * 1.3);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.6, 9.0], look: [0.6, 2.3, 0], fov: 42 }], [info.dur, { pos: [0.5, 2.6, 8.0], look: [0.5, 2.4, 0], fov: 42 }]]); },
  overlay(g, t) { sunnyLook(g, t, RAYS); },
});
