// s01-s06 + s15: the Salarian Gate, night of 24 August 410. Gaius the guard, the doors, the Visigoths (silhouettes only).
import { registerShot, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { bean, CAST, POSE, EXPR, idle, addPose, mixPose, mixExpr, walk, shrug, tremble, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import * as FX from '/kits/toon3d/fx.js';
import { THREE, at, screen, zzz, tag, gateScene, holdSpear, openGate } from './_lib.js';

const guardIdle = (s, t, pose = POSE.lean, seed = 3) => { s.guard.pose(addPose(pose, idle(t, seed))); holdSpear(s.guard, s.spear); };

// s01 "August 24th, 410." — establishing: the wall at night, slow crane down + push
registerShot('s01', { kind: '3d',
  init(T) { const s = gateScene(T); openGate(s, 0); return s; },
  draw(s, t, info) { s.set.update(t); guardIdle(s, t); s.guard.face(EXPR.bored, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 7.5, 21], look: [0, 4.2, 0], fov: 48 }], [info.dur, { pos: [0.2, 4.6, 15.5], look: [-0.4, 3.4, 0], fov: 46 }]], ease.sine); },
});
// s02 "Nobody has broken into Rome in almost eight hundred years." — medium on Gaius, bored, a big yawn on "eight hundred"
registerShot('s02', { kind: '3d',
  init(T) { return gateScene(T); },
  draw(s, t, info) { s.set.update(t); openGate(s, 0); const y0 = at(info, 'eight', 2.2), yawn = Math.sin(Math.PI * prog(t, y0 - 0.1, y0 + 1.1));
    guardIdle(s, t, addPose(POSE.lean, { headNod: -0.25 * yawn, headTilt: -0.12 }));
    s.guard.face(mixExpr(EXPR.bored, { ...EXPR.bored, lid: 0.8, brow: 0.3, mouth: 'scream', mouthW: 0.9 }, yawn), t);
    const d = drift(t, 0.03, 2); camMove(s.stage, t, [[0, { pos: [-0.5 + d[0], 2.3 + d[1], 7.4], look: [-2.2, 2.0, 1.6], fov: 34 }], [info.dur, { pos: [-1.0, 2.25, 6.3], look: [-2.3, 2.05, 1.6], fov: 32 }]]); },
});
// s03 "So this guard is very relaxed." — close-up, lids slide shut, head droops, z z z
registerShot('s03', { kind: '3d',
  init(T) { return gateScene(T); },
  draw(s, t, info) { s.set.update(t); openGate(s, 0); const k = ease.inOut(prog(t, 0.2, at(info, 'relaxed', 1.3) + 0.2));
    guardIdle(s, t, mixPose(POSE.lean, POSE.sleepy, k)); s.guard.face(mixExpr(EXPR.bored, EXPR.asleep, k), t, { blink: k < 0.1 });
    camMove(s.stage, t, [[0, { pos: [-1.4, 2.4, 6.6], look: [-2.3, 2.0, 1.6], fov: 28 }], [info.dur, { pos: [-1.6, 2.35, 5.8], look: [-2.35, 2.0, 1.6], fov: 27 }]]); },
  overlay(g, t, info, s) { const k = prog(t, at(info, 'relaxed', 1.3), at(info, 'relaxed', 1.3) + 0.3); const [x, y] = screen(s.stage, new THREE.Vector3(-2.1, 2.9, 1.7)); zzz(g, x, y, t, k); },
});
// s04 "Then the Salarian Gate opens." — wide-low: the doors swing in, fire light floods the street. Gaius sleeps through it.
registerShot('s04', { kind: '3d',
  init(T) { return gateScene(T); },
  draw(s, t, info) { s.set.update(t); const o0 = at(info, 'Gate', 0.8); openGate(s, ease.inOut(prog(t, o0, o0 + 1.6)) * 0.85);
    guardIdle(s, t, POSE.sleepy); s.guard.face(EXPR.asleep, t, { blink: false });
    camMove(s.stage, t, [[0, { pos: [1.6, 1.1, 9.6], look: [-0.2, 2.9, 0], fov: 46 }], [info.dur, { pos: [1.2, 1.0, 8.4], look: [-0.2, 2.9, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { const [x, y] = screen(s.stage, new THREE.Vector3(-2.1, 2.9, 1.7)); zzz(g, x, y, t, 1); },
});
// s05 "Some say, from the inside." — close-up: eyes SNAP open (shocked), then a slow deadpan look into the lens
registerShot('s05', { kind: '3d',
  init(T) { const s = gateScene(T); openGate(s, 0.85); return s; },
  draw(s, t, info) { s.set.update(t); openGate(s, 0.85); const w = at(info, 'Some', 0.12), l = at(info, 'inside', 0.8);
    const snap = t >= w ? 1 : 0, look = ease.inOut(prog(t, l - 0.15, l + 0.35));
    const p = snap ? addPose(POSE.spearRest, { headNod: -0.05, headTurn: -0.35 * (1 - look) * 0 }) : POSE.sleepy;
    guardIdle(s, t, p); s.guard.face(snap ? mixExpr({ ...EXPR.shocked, pupil: [-0.6, 0.1] }, { ...EXPR.deadpan, pupil: [-0.15, 0], lid: 0.5 }, look) : EXPR.asleep, t, { blink: look > 0.9 });
    const sh = snap ? Math.max(0, 1 - (t - w) * 6) * 0.04 : 0;
    s.stage.cam([-2.05 + Math.sin(t * 60) * sh, 2.3, 5.4], [-2.36, 2.05, 1.6], lerp(27, 22, look)); },
});
// s06 "The Visigoths are in." — low angle through the open gate: silhouettes walk in against the fire
registerShot('s06', { kind: '3d',
  init(T) { const s = gateScene(T, { open: 0.85 }); openGate(s, 0.85); const r = [[-0.7, -7.5, 0.0], [0.6, -8.4, 0.3], [-0.1, -10.2, 0.55], [1.1, -11.0, 0.15], [-1.0, -11.8, 0.4]];
    s.goths = r.map(([x, z, ph], i) => { const b = bean({ ...CAST.goth, silhouette: true, seed: 60 + i, shadowBlob: false }); b.userData.x0 = [x, z, ph]; s.stage.add(b); return b; });
    const sm = FX.smoke({ size: 0.9, rise: 0.9, count: 9, seed: 77, life: 5, spread: 1.2, color: '#2a2428', drift: [0.4, 0] }); sm.position.set(2.2, 3.2, -6); s.stage.add(sm); s.sm = sm; return s; },
  draw(s, t, info) { s.set.update(t); s.sm.update(t + 3); openGate(s, 0.85);
    s.goths.forEach((b, i) => { const [x, z, ph] = b.userData.x0; const tt = t + ph; b.position.set(x, 0, z + tt * 1.4 * WALK_STRIDE * 1.4); b.rotation.y = 0; b.pose(walk(tt, { speed: 1.4 })); b.face(EXPR.angry, tt); });
    guardIdle(s, t, POSE.spearRest); s.guard.face(EXPR.shocked, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 0.55, 5.5], look: [0, 2.3, -4], fov: 50 }], [info.dur, { pos: [0.3, 0.5, 4.6], look: [0, 2.4, -4], fov: 48 }]]); },
});
// s15 "How did the greatest empire on Earth end up here? Subscribe to find out." — gate wide open, fire, the guard shrugs; pull back; gold end card
registerShot('s15', { kind: '3d',
  init(T) { const s = gateScene(T, { open: 1 }); const sm = FX.smoke({ size: 1.8, rise: 1.1, seed: 91, life: 6, spread: 4, color: '#2a2428' }); sm.position.set(0, 4, -3); s.stage.add(sm); s.sm = sm; const em = FX.embers({ area: [10, 9, 6] }); em.position.set(0, 0, -1); s.stage.add(em); s.em = em; return s; },
  draw(s, t, info) { s.set.update(t); s.sm.update(t); s.em.update(t); openGate(s, 1);
    const sh = ease.inOut(prog(t, 0.6, 1.4)) * (1 - ease.inOut(prog(t, 3.4, 4.2)));
    guardIdle(s, t, shrug(POSE.stand, sh)); s.guard.face(mixExpr(EXPR.deadpan, EXPR.worried, sh), t); s.spear.position.set(-2.95, 1.45, 1.4); s.guard.position.x = -1.9; s.spear.rotation.set(0, 0, 0.25);
    camMove(s.stage, t, [[0, { pos: [-1.4, 2.2, 5.6], look: [-1.6, 2.0, 0.8], fov: 36 }], [info.dur, { pos: [0.2, 4.2, 14.5], look: [0, 3.4, 0], fov: 44 }]], ease.inOut); },
  // end card (playbook "Short closers": open question -> "Subscribe to find out.")
  overlay(g, t, info) { const k = ease.out(prog(t, at(info, 'Subscribe', 3.2) - 0.05, at(info, 'Subscribe', 3.2) + 0.3)); tag(g, 'SUBSCRIBE TO FIND OUT', k, 0.2); },
});
