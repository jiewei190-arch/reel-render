// Toon 3D FX demo: sunny sky + god rays, an emu with "???" then hearts, a 50 KM/H stat card, whip + iris transitions.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble } from '/kits/toon3d/rig.js';
import { emu } from '/kits/toon3d/animals.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, farm, soldier, commander, flock } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 1 }, tint: '#ffcf8a' };

// d1 "About twenty thousand emus are eating" — the farm in the new sunny look: deep blue sky, clouds, warm sun, god rays
registerShot('d1', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, -5], shadowSize: 16 }); s.f = flock(s.stage, 22, [-8, 8, -14, 3], 31); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f.forEach((e, i) => e.update(t, { peck: 1, ph: i * 0.41 }));
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 9], look: [0, 3.2, -6], fov: 48 }], [info.dur, { pos: [0, 4.6, 12.5], look: [0, 2.4, -6], fov: 50 }]], ease.inOut); },
  overlay(g, t) { sunnyLook(g, t, RAYS); },
});

// d2 "the wheat in Western Australia." — close on the general: "???" at the lens, then it finds the wheat: hearts + heart eyes + sparkle
const D2 = [{ fx: 'question', on: 'gen', at: 0.08, until: 1.0 }, { fx: 'hearts', on: 'gen', at: 1.15 }, { fx: 'heartEyes', on: 'gen', at: 1.15 }, { fx: 'sparkle', on: 'gen', at: 1.4, scale: 0.8 }];
registerShot('d2', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 0], shadowSize: 8, seed: 5 }); s.gen = emu({ general: true, seed: 1 }); s.gen.position.set(0, 0, 1.2); s.stage.add(s.gen);
    s.f = flock(s.stage, 5, [-4, 4, -6, -1.5], 41); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f.forEach((e, i) => e.update(t, { peck: 1, ph: i * 0.6 }));
    const love = ease.inOut(prog(t, 1.0, 1.3));
    s.gen.update(t, { lid: lerp(0.1, 0.5, love), lidAngle: lerp(-0.15, -0.05, love), look: [0, 0.05], headTurn: lerp(Math.sin(t * 7) * 0.25 * (1 - love), 0, love), peck: t > 1.5 ? 0.6 : 0, blink: t > 1.2 });
    s.gen.position.y = love * Math.abs(Math.sin(t * 6)) * 0.08;
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 6.6], look: [0, 2.45, 0.8], fov: 38 }], [info.dur, { pos: [0.1, 2.2, 5.8], look: [0, 2.45, 0.8], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.7 } }); reactions(g, t, s, D2); },
});

// d3 "The emus are faster than the truck." — side-on chase: emus overtake, the gunner sweats, speed lines
function truckRig(st) { const tr = PR.truck().at(0, 0, 0, Math.PI / 2); st.add(tr); const gun = PR.lewisGun(); gun.scale.setScalar(0.8); gun.position.set(0, tr.bedTop, -1.0); tr.add(gun);
  const gunner = soldier(1); gunner.position.set(0, tr.bedTop, -1.85); tr.add(gunner); return { tr, gunner }; }
const chase = {
  init(T) { const s = farm(T, { target: [0, 0, -2], shadowSize: 16, farm: { wheat: false } }); Object.assign(s, truckRig(s.stage));
    s.f = [0, 1, 2, 3].map(i => { const e = emu({ seed: 70 + i, general: i === 0 }); e.rotation.y = Math.PI / 2; s.stage.add(e); return e; }); return s; },
  draw(s, t) { s.set.update(t); s.sky.update(t); const vx = 6.5, x = t * vx;
    const bump = Math.abs(noise(t * 6, 3)) * 0.22 + Math.abs(Math.sin(t * 11)) * 0.06; s.tr.position.set(x, bump, 0); s.tr.rotation.z = noise(t * 5, 7) * 0.06; s.tr.drive(x);
    s.gunner.pose(addPose(POSE.panic, { ...tremble(t, 2), bob: Math.abs(Math.sin(t * 11)) * 0.18 })); s.gunner.face(EXPR.panic, t); s.gunner.position.y = s.tr.bedTop + Math.abs(Math.sin(t * 11)) * 0.15;
    s.f.forEach((e, i) => { const lane = [-2.4, -3.6, -1.9, -4.6][i]; e.position.set(x - 2 + t * (2.2 + i * 0.35) + i * 1.2, 0, lane); e.update(t, { run: 1, ph: i * 0.3, lid: 0.45, look: [-0.6, 0], headTurn: i === 0 ? -0.6 : 0 }); });
    s.stage.cam([x - 0.6, 3.1, 11], [x - 0.4, 1.7, -0.6], 42); },
};
const D3 = [{ fx: 'sweat', on: 'gunner', at: 0.3 }, { fx: 'exclaim', on: 'gunner', at: 0.9, until: 1.8 }];
registerShot('d3', { kind: '3d', init: chase.init, draw: chase.draw, overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, D3); } });

// d4 — full-screen stat card over the chase (still playing, blurred + darkened)
insertShot('d4', { scene: { init: chase.init, draw: (s, t) => chase.draw(s, t + 2.45) },
  insert: { type: 'bigtext', kicker: 'EMU TOP SPEED', title: '50 KM/H', lines: ['flat out'] } });

// d5 "Final score: Emus, one. Army, zero." — sparkle on "one" (the general), "!" + shake + sweat on "zero" (the commander)
const sb = {
  init(T) { const s = farm(T, { target: [0, 0, 6], shadowSize: 8, farm: { field: [26, 18, -6] }, seed: 9 }); const fz = 3.6;
    s.sb = PR.scoreboard({ lines: ['EMUS  1', 'ARMY  0'], w: 1.7, h: 1.15 }).at(-0.35, 0, fz + 0.45, 0.1); s.stage.add(s.sb);
    s.gen = emu({ general: true }); s.gen.position.set(0.95, 0, fz + 1.9); s.gen.rotation.y = -0.3; s.stage.add(s.gen);
    s.c = commander(); s.c.position.set(-0.95, 0, fz + 2.4); s.c.rotation.y = 0.35; s.stage.add(s.c); s.fz = fz; return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); const z = at(info, 'zero', 2.5), one = at(info, 'one', 1.37);
    s.gen.update(t, { lid: lerp(0.4, 0.6, prog(t, one, one + 0.3)), lidAngle: 0.2, look: [-0.2, 0], headTurn: t > one ? 0.25 : -0.4 }); s.gen.position.y = t > one ? Math.abs(Math.sin((t - one) * 6)) * 0.1 : 0;
    const sag = ease.inOut(prog(t, z - 0.1, z + 0.4)); s.c.pose(addPose(mixPose(POSE.attention, { ...POSE.panic }, sag), idle(t, 2))); s.c.face(mixExpr(EXPR.worried, EXPR.shocked, sag), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, s.fz + 9.4], look: [0, 1.5, s.fz + 0.8], fov: 40 }], [info.dur, { pos: [0, 2.0, s.fz + 8.4], look: [0, 1.5, s.fz + 0.8], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: z, amp: 0.09, dur: 0.5 }]); },
};
registerShot('d5', { kind: '3d', init: sb.init, draw: sb.draw,
  overlay(g, t, info, s) { const z = at(info, 'zero', 2.5), one = at(info, 'one', 1.37); sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'gen', at: one, scale: 0.7 }, { fx: 'stars', on: 'gen', at: one + 0.1 }, { fx: 'exclaim', on: 'c', at: z }, { fx: 'sweat', on: 'c', at: z + 0.15 }, { fx: 'flash', at: z, dur: 0.25 }]); },
});
// d6 — FINAL SCORE versus card over the scoreboard scene
insertShot('d6', { scene: { init: sb.init, draw: (s, t, info) => sb.draw(s, t + 3.6, { ...info, shot: { start: 10.2 } }) },
  insert: { type: 'versus', title: 'FINAL SCORE', lines: ['EMUS  1', 'ARMY  0'], colorL: '#d8342c', color: '#3b7a3a' } });
