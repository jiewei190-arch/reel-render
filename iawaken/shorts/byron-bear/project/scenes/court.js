// s05, s06, s11, s12, s14, s14b: the court — Byron poses, the college wide, the tame bear, the dons, today.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, WALK_STRIDE, point, nod } from '/kits/toon3d/rig.js';
import { castMember, cat, phone } from '/kits/toon3d/cast.js';
const minaPhone = (m) => { const p = phone(); p.position.set(0, -0.1, 0.06); p.rotation.x = -1.2; m.hold('R', p); return m; };
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, court, byron, don, theBear, lead, wp } from './_lib.js';

const POET = { ...POSE.stand, armR: [2.7, 0.35, 0], elbowR: 0.5, armL: [0.9, -0.25, 0.5], elbowL: 2.0, headTilt: 0.1, headNod: -0.18 };
// s05 "This is the poet Lord Byron," — Byron strikes a poet pose with a quill; the bear copies him
registerShot('s05', { kind: '3d',
  init(T) { const s = court(T, { target: [0.5, 0, 8] }); s.by = byron(); s.by.position.set(-0.35, 0, 8); s.by.rotation.y = 0.15; s.stage.add(s.by); const q = PR.quill(); q.rotation.x = Math.PI; q.position.y = -0.05; s.by.hold('R', q);
    s.be = theBear({ scale: 1.08 }); s.be.position.set(1.05, 0, 7.8); s.be.rotation.y = -0.2; s.stage.add(s.be); return s; },
  draw(s, t, info) { s.set.update(t); const p = ease.outBack(prog(t, 0.1, 0.45)), c = ease.outBack(prog(t, 0.8, 1.15));
    s.by.pose(addPose(mixPose(POSE.stand, POET, p), idle(t, 2))); s.by.face({ ...EXPR.smug, lid: 0.5, pupil: [0.1, 0.35] }, t);
    s.be.update(t, { lid: lerp(0.3, 0.5, c), look: [0.1, 0.35], pose: { armR: [lerp(-0.05, -2.6, c), 0, -0.4], armL: [lerp(-0.05, -0.9, c), 0, lerp(0.25, -0.5, c)] }, headTilt: -0.12 * c, smile: 1 });
    camMove(s.stage, t, [[0, { pos: [0.35, 2.0, 16.4], look: [0.35, 1.75, 8], fov: 29 }], [info.dur, { pos: [0.35, 2.0, 15.6], look: [0.35, 1.8, 8], fov: 29 }]]); },
  overlay(g, t) { tag(g, 'LORD BYRON, POET', ease.out(prog(t, 0.25, 0.55)), 0.14); },
});
// s06 "a student at Trinity College, Cambridge." — crane down over the court: lawns, fountain, gatehouse; the duo crosses the lawn
registerShot('s06', { kind: '3d',
  init(T) { const s = court(T, { target: [0, 0, 8], shadowSize: 16 }); s.by = byron(); s.be = theBear({ scale: 1.08 }); s.stage.add(s.by, s.be); s.ld = lead(s.stage); s.n = new THREE.Vector3(); return s; },
  draw(s, t, info) { s.set.update(t); const V = 1.1 * WALK_STRIDE, x = -3.0 + t * V;
    s.by.position.set(x, 0, 9.5); s.by.rotation.y = Math.PI / 2; s.be.position.set(x - 0.2, 0, 10.7); s.be.rotation.y = Math.PI / 2;
    s.by.pose(addPose(walk(t, { speed: 1.1 }), { armL: [0.55, 0.18, 0], elbowL: 0.7 })); s.by.face(EXPR.smug, t); s.be.update(t, { walk: 1, lid: 0.32 });
    s.be.updateMatrixWorld(true); s.n.set(0, 0.98, 0.3); s.be.parts.upper.localToWorld(s.n); s.ld.update(wp(s.by.hand.L), s.n.clone());
    camMove(s.stage, t, [[0, { pos: [2, 11, 30], look: [0, 3.5, 4], fov: 50 }], [info.dur, { pos: [0.5, 6.5, 24], look: [0, 3.2, 4], fov: 48 }]]); },
  overlay(g, t) { tag(g, 'TRINITY COLLEGE, CAMBRIDGE', ease.out(prog(t, 0.15, 0.45)), 0.14); },
});
// s11 "A tame bear." — on the lawn by the fountain: the bear beams and waves; Byron leans in, grinning at the lens
registerShot('s11', { kind: '3d',
  init(T) { const s = court(T, { target: [-2, 0, 15], shadowSize: 6 }); s.be = theBear({ scale: 1.08 }); s.be.position.set(-2.55, 0, 15.2); s.be.rotation.y = 0.15; s.stage.add(s.be);
    s.by = byron(); s.by.position.set(-1.3, 0, 15.0); s.by.rotation.y = -0.3; s.stage.add(s.by); return s; },
  draw(s, t, info) { s.set.update(t); const k = ease.outBack(prog(t, 0.05, 0.35));
    s.be.update(t, { lid: 0.25, look: [0.15, 0.05], wave: k, smile: 1, headTilt: 0.15 * Math.sin(t * 3) });
    s.by.pose(addPose({ ...POSE.stand, side: 0.22 * k, armR: [0.3, 0.2, 0], armL: [1.2, 0.4, 0], elbowL: 1.2, headTilt: 0.15 }, idle(t, 2))); s.by.face({ ...EXPR.grin, pupil: [0.2, 0.1] }, t);
    camMove(s.stage, t, [[0, { pos: [-1.9, 2.1, 22.0], look: [-1.9, 1.75, 15], fov: 29 }], [info.dur, { pos: [-1.9, 2.1, 21.3], look: [-1.9, 1.8, 15], fov: 29 }]]); },
});
// s12 "They asked him what he planned to do with it." — over Byron's and the bear's shoulders: two dons, arms folded, then one points
registerShot('s12', { kind: '3d',
  init(T) { const s = court(T, { target: [0, 0, 5.5], shadowSize: 6 }); s.d = [don(0), don(1)]; s.d[0].position.set(-0.75, 0, 4.6); s.d[1].position.set(0.75, 0, 4.4); s.d[0].rotation.y = 0.1; s.d[1].rotation.y = -0.1; s.stage.add(...s.d);
    s.by = byron(); s.by.position.set(-1.2, 0, 8.3); s.by.rotation.y = Math.PI - 0.1; s.be = theBear({ scale: 1.08 }); s.be.position.set(1.15, 0, 8.4); s.be.rotation.y = Math.PI + 0.15; s.stage.add(s.by, s.be); return s; },
  draw(s, t, info) { s.set.update(t); const p = at(info, 'do', 1.5), k = ease.out(prog(t, p - 0.2, p + 0.1));
    s.d.forEach((d, i) => { const base = { ...POSE.handsHips, headTilt: i ? -0.1 : 0.1 }; d.pose(addPose(i === 0 ? point(base, 'L', k, { up: 0.15, across: -0.25 }) : base, idle(t, 4 + i))); d.face({ ...(i ? EXPR.suspicious : EXPR.angry), pupil: [i ? 0.2 : -0.1, 0], lid: 0.45 }, t); });
    s.by.pose(addPose({ ...POSE.stand, armL: [0.2, 0.2, 0], headTurn: 0.25 * k }, idle(t, 2))); s.by.face(EXPR.happy, t); s.be.update(t, { lid: 0.3, smile: 1 });
    camMove(s.stage, t, [[0, { pos: [0, 2.35, 12.8], look: [0, 2.0, 4.6], fov: 32 }], [info.dur, { pos: [0, 2.3, 12.0], look: [0, 2.05, 4.6], fov: 31 }]]); },
});
// s14 "Cambridge is still telling the story" — TODAY: DEV films the gate on his phone, MINA reads the story from hers
registerShot('s14', { kind: '3d',
  init(T) { const s = court(T, { target: [0.6, 0, 5] }); s.dev = castMember('dev'); s.dev.position.set(-0.45, 0, 6.3); s.dev.rotation.y = Math.PI * 0.72; s.stage.add(s.dev);
    s.mi = minaPhone(castMember('mina', { prop: false })); s.mi.position.set(1.25, 0, 6.6); s.mi.rotation.y = 0.15; s.stage.add(s.mi); return s; },
  draw(s, t, info) { s.set.update(t); s.dev.pose(addPose({ ...POSE.stand, armR: [1.75, -0.05, 0], elbowR: 0.5, headNod: -0.05 }, idle(t, 7))); s.dev.face(EXPR.happy, t);
    s.mi.pose(addPose({ ...POSE.stand, armR: [1.0, 0.1, 0], elbowR: 1.3, armL: [1.0, -0.1, 0], elbowL: 1.3, headNod: 0.3 }, idle(t, 8))); s.mi.face({ ...EXPR.neutral, pupil: [0, -0.7] }, t);
    camMove(s.stage, t, [[0, { pos: [0.45, 2.2, 14.0], look: [0.45, 2.3, 4], fov: 38 }], [info.dur, { pos: [0.45, 2.15, 13.3], look: [0.45, 2.3, 4], fov: 38 }]]); },
  overlay(g, t) { tag(g, 'TODAY', ease.out(prog(t, 0.1, 0.4)), 0.14); },
});
// s14b "two hundred years later." — MINA looks up at the lens, deadpan; BISCUIT judges from the ledge
registerShot('s14b', { kind: '3d',
  init(T) { const s = court(T, { target: [0.5, 0, 7], shadowSize: 5 }); s.mi = minaPhone(castMember('mina', { prop: false })); s.mi.position.set(-0.15, 0, 7.2); s.mi.rotation.y = 0.15; s.stage.add(s.mi);
    s.stage.add(PR.ledge({ w: 2.2, h: 1.0 }).at(1.15, 0, 6.4)); s.cat = cat({ scale: 0.62 }); s.cat.position.set(0.85, 1.12, 6.45); s.cat.rotation.y = -0.15; s.stage.add(s.cat); return s; },
  draw(s, t, info) { s.set.update(t); const k = ease.inOut(prog(t, 0.1, 0.4));
    s.mi.pose(addPose({ ...POSE.stand, armR: [1.0, 0.1, 0], elbowR: 1.3, armL: [1.0, -0.1, 0], elbowL: 1.3, headNod: lerp(0.3, -0.05, k) }, idle(t, 8))); s.mi.face({ ...EXPR.deadpan, pupil: [0, lerp(-0.7, 0, k)] }, t);
    s.cat.update(t, { lid: 0.62, look: [0, 0], tail: 0.6, headTurn: lerp(-0.5, 0, k) });
    camMove(s.stage, t, [[0, { pos: [0.35, 1.7, 13.0], look: [0.35, 1.35, 6.8], fov: 30 }], [info.dur, { pos: [0.35, 1.65, 12.4], look: [0.35, 1.35, 6.8], fov: 30 }]]); },
  overlay(g, t, info) { const w = at(info, 'two', 0.1); tag(g, '200 YEARS LATER', ease.out(prog(t, w, w + 0.3)), 0.14); },
});
