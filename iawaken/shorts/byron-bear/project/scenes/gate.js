// s01, s02, s15: the NO DOGS gate. s15 ends exactly where s01 starts (loop).
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { THREE, at, tag, court, byron, porter, theBear, lead, wp } from './_lib.js';

const SPEED = 1.1, V = SPEED * WALK_STRIDE, Z0 = -1.2;
function duo(s) { s.by = byron(); s.be = theBear({ scale: 1.08 }); s.stage.add(s.by, s.be); s.ld = lead(s.stage); s.neck = new THREE.Vector3(); }
function stroll(s, t, z, o = {}) {
  s.by.position.set(-0.3, 0, z); s.be.position.set(0.8, 0, z + 0.1);
  s.by.pose(addPose(walk(t, { speed: SPEED }), { armL: [0.55, 0.18, 0], elbowL: 0.7, headTurn: o.byTurn || 0 })); s.by.face(o.byExpr || EXPR.smug, t);
  s.be.update(t, { walk: 1, lid: 0.32, look: o.beLook || [0, 0.05], wave: o.wave || 0, headTurn: o.beTurn || 0 });
  s.be.updateMatrixWorld(true); s.neck.set(0, 0.98, 0.3); s.be.parts.upper.localToWorld(s.neck); s.ld.update(wp(s.by.hand.L), s.neck.clone());
}
const CAM = (z = 11.5) => ({ pos: [1.25, 2.0, z], look: [1.2, 1.85, 0.4], fov: 38 });

// s01 "His college banned dogs." FRAME 1: Byron + the bear already strolling in under the gate, past the NO DOGS sign
registerShot('s01', { kind: '3d',
  init(T) { const s = court(T, { target: [0.8, 0, 0.5] }); duo(s); s.po = porter(); s.po.position.set(3.3, 0, 2.3); s.po.rotation.y = -0.7; s.stage.add(s.po); return s; },
  draw(s, t, info) { s.set.update(t); stroll(s, t, Z0 + t * V, { beLook: [-0.1, 0.05] });
    s.po.pose(addPose(POSE.attention, idle(t, 3))); s.po.face(mixExpr(EXPR.bored, EXPR.shocked, ease.out(prog(t, 1.2, 1.45))), t);
    camMove(s.stage, t, [[0, CAM(11.5)], [info.dur, CAM(10.9)]], ease.linear || ((x) => x)); },
});
// s02 "So he got a bear." porter close-up: bored -> jaw drop as the bear strolls past in the foreground
registerShot('s02', { kind: '3d',
  init(T) { const s = court(T, { target: [2, 0, 2.5], shadowSize: 6 }); s.po = porter(); s.po.position.set(2.2, 0, 2.6); s.po.rotation.y = -0.55; s.stage.add(s.po); s.be = theBear({ scale: 1.08 }); s.stage.add(s.be); return s; },
  draw(s, t, info) { s.set.update(t); const b = at(info, 'bear.', 0.8);
    s.be.position.set(0.95, 0, 3.3 + t * 0.6); s.be.rotation.y = 0.25; s.be.update(t, { walk: 1, lid: 0.3, look: [0.5, 0], headTurn: t > b ? 0.6 : 0.2, wave: ease.out(prog(t, b + 0.05, b + 0.3)) });
    const k = ease.outBack(prog(t, b - 0.05, b + 0.2)); s.po.pose(addPose(mixPose(POSE.attention, { ...POSE.panic, lean: -0.15 }, clamp(k) * 0.6), idle(t, 3)));
    s.po.face(mixExpr({ ...EXPR.bored, pupil: [-0.6, 0] }, { ...EXPR.shocked, pupil: [-0.7, -0.1] }, k), t);
    camMove(s.stage, t, [[0, { pos: [1.35, 2.1, 8.2], look: [1.55, 1.95, 2.6], fov: 30 }], [info.dur, { pos: [1.4, 2.1, 7.6], look: [1.6, 2.0, 2.6], fov: 29 }]]); },
});
// s15 "Subscribe for more." same framing as s01: the duo strolls up to the arch; the bear waves at us. Ends where s01 begins.
registerShot('s15', { kind: '3d',
  init(T) { const s = court(T, { target: [0.8, 0, 0.5] }); duo(s); s.po = porter(); s.po.position.set(3.3, 0, 2.3); s.po.rotation.y = -0.7; s.stage.add(s.po); return s; },
  draw(s, t, info) { s.set.update(t); const z = Z0 - (info.dur - t) * V; const wv = ease.inOut(prog(t, 0.25, 0.55)) * (1 - ease.inOut(prog(t, info.dur - 0.45, info.dur - 0.1)));
    stroll(s, t, z, { wave: wv, beLook: [0, 0.05] }); s.po.pose(addPose(POSE.attention, idle(t, 3))); s.po.face(EXPR.bored, t);
    s.stage.cam(CAM(11.5).pos, CAM(11.5).look, 38); },
});
