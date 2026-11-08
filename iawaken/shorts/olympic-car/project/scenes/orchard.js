// orchard shots (the legend, said "according to legend"): s12 (jogs into the orchard), s13 (rotten apples), s14 (the nap).
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, run } from '/kits/toon3d/rig.js';
import { at, tag, zzz, screen, orchard, cuban, apple, THREE } from './_lib.js';

const LEG = (g, t) => tag(g, 'ACCORDING TO LEGEND', 1, 0.14, { size: 46 });

// s12 "And according to legend," — wide orchard; the runner jogs in from the road and spots the apples
registerShot('s12', { kind: '3d',
  init(T) { const s = orchard(T, { target: [0, 0, -2], shadowSize: 12 }); s.c = cuban(); s.stage.add(s.c); return s; },
  draw(s, t, info) { const k = ease.out(prog(t, 0, info.dur - 0.2)); s.c.position.set(lerp(-5.5, -0.9, k), 0, lerp(-6, -0.2, k)); s.c.rotation.y = 0.75 - 0.4 * k;
    s.c.pose(mixPose(run(t, { speed: 1.6, amp: 0.8 }), addPose(POSE.stand, { headNod: -0.25, headTurn: 0.3 }), prog(t, info.dur - 0.5, info.dur)));
    s.c.face(t > info.dur - 0.5 ? { ...EXPR.happy, pupil: [0.3, 0.6] } : EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [2.6, 3.6, 9.5], look: [-0.8, 1.6, -2.2], fov: 44 }], [info.dur, { pos: [2.0, 3.1, 8.0], look: [-0.6, 1.8, -1.6], fov: 42 }]]); },
  overlay(g, t) { tag(g, 'ACCORDING TO LEGEND', ease.out(prog(t, 0.1, 0.4)), 0.14, { size: 46 }); },
});

// s13 "a Cuban runner stopped for some rotten apples," — munching happily... then "rotten": the face
registerShot('s13', { kind: '3d',
  init(T) { const s = orchard(T, { target: [0, 0, 0], shadowSize: 6 }); s.c = cuban(); s.c.position.set(-0.6, 0, 0.3); s.c.rotation.y = 0.35; s.stage.add(s.c); s.ap = apple(true); s.c.hold('R', s.ap); s.ap.position.set(0, -0.05, 0.1); return s; },
  draw(s, t, info) { const r = at(info, 'rotten', 1.6); const bite = Math.max(0, Math.sin(t * 7));
    s.c.pose(addPose({ ...POSE.stand, armR: [lerp(1.2, 1.55, bite), 0.05, 0.3], elbowR: 2.0 }, idle(t, 4)));
    const yuck = ease.inOut(prog(t, r + 0.05, r + 0.35));
    s.c.face(mixExpr({ ...EXPR.happy, talk: 0.8 }, { ...EXPR.worried, mouth: 'wavy', lid: 0.35, pupil: [0, 0] }, yuck), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.15, 4.4], look: [-0.5, 1.95, 0.3], fov: 36 }], [info.dur, { pos: [0.1, 2.15, 3.6], look: [-0.5, 2.0, 0.3], fov: 34 }]]); },
  overlay: LEG,
});

// s14 "took a nap," — asleep against the big tree, z z z (a beat of stillness)
registerShot('s14', { kind: '3d',
  init(T) { const s = orchard(T, { target: [0, 0, -1], shadowSize: 6 }); s.c = cuban(); s.c.position.set(0.15, -0.78, -0.95); s.c.rotation.y = 1.0; s.stage.add(s.c); return s; },
  draw(s, t, info) { s.c.pose(addPose({ ...POSE.sit, kneeL: 0.15, kneeR: 0.15, legL: [1.45, 0.2], legR: [1.45, 0.2], armL: [0.3, 0.3, 0], armR: [0.3, 0.3, 0], elbowL: 0.5, elbowR: 0.5, headNod: 0.3, headTilt: 0.25, lean: -0.15 }, { bob: Math.sin(t * 2.2) * 0.01 }));
    s.c.face(EXPR.asleep, t, { blink: false }); s._t = t;
    camMove(s.stage, t, [[0, { pos: [0.9, 1.9, 4.6], look: [0.4, 1.1, -0.6], fov: 38 }], [info.dur, { pos: [0.85, 1.85, 4.2], look: [0.4, 1.1, -0.6], fov: 37 }]]); },
  overlay(g, t, info, s) { LEG(g, t); const p = s && s.c ? screen(s.stage, new THREE.Vector3(0.6, 2.7, -0.7)) : [600, 700]; zzz(g, p[0], p[1], t); },
});
