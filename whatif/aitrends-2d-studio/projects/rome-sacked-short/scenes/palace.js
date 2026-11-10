// s10-s14: the court at Ravenna. The emperor, his chicken "Roma" (Procopius' story, probably a legend), and a messenger.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { toonStage, camMove, drift, canvasTex, toon } from '/kits/toon3d/toon.js';
import { bean, CAST, POSE, EXPR, idle, addPose, mixPose, mixExpr, walk, run, shrug, point, tremble, nod, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { SETS } from '/kits/toon3d/sets.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag } from './_lib.js';

const SEAT_Y = 0.22;
const SIT = { ...POSE.sit, armL: [0.5, 0.15, 0], armR: [0.5, 0.15, 0], elbowL: 0.6, elbowR: 0.6 };
// the palace room with the emperor on the throne, the chicken on a gilded perch with a ROMA plaque, a messenger off-screen left
function palace(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 34, shadowSize: 8, target: [0, 0, -1] }); const set = SETS.romanHouse(st, { palace: true });
  const emp = bean(CAST.emperor); emp.position.set(0, SEAT_Y, -2.35); st.add(emp);
  const post = PR.column(0.8, { r: 0.16, color: '#d4a73a' }).at(1.05, 0, -2.0); st.add(post);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.3), toon('#ffffff', { map: PR.TEX.label('ROMA', '#d4a73a', '#5a2a6a') })); plaque.position.set(1.05, 0.62, -1.73); plaque.userData.noOutline = true; st.add(plaque);
  const hen = PR.chicken(); hen.position.set(1.05, 1.42, -2.0); hen.rotation.y = -0.4; hen.scale.setScalar(0.85); st.add(hen);
  const msg = bean({ ...CAST.citizen, name: 'Messenger', colors: { main: '#3f6fa8' }, seed: 33 }); msg.position.set(-3.5, 0, 0.5); st.add(msg);
  return { stage: st, set, emp, hen, msg };
}
const sitEmp = (s, t, p = SIT, seed = 8) => { s.emp.position.y = SEAT_Y; s.emp.pose(addPose(p, idle(t, seed, 0.6))); };

// s10 "And the emperor? He's not even in Rome. He's in Ravenna." — calm court, the emperor feeds his chicken
registerShot('s10', { kind: '3d',
  init(T) { return palace(T); },
  draw(s, t, info) { s.set.update(t); const feed = 0.5 + 0.5 * Math.sin(t * 2.2);
    sitEmp(s, t, { ...SIT, armL: [0.9 + feed * 0.25, 0.5, 0.2], elbowL: 0.5, headTurn: 0.45, headTilt: 0.1 }); s.emp.face({ ...EXPR.happy, pupil: [0.7, -0.1] }, t);
    s.hen.update(t, { peck: 1 }); s.msg.visible = false;
    camMove(s.stage, t, [[0, { pos: [0.2, 2.9, 8.8], look: [0.3, 1.9, -2.2], fov: 38 }], [info.dur, { pos: [0.4, 2.5, 5.6], look: [0.45, 2.0, -2.1], fov: 34 }]], ease.sine); },
  overlay(g, t, info) { const r = at(info, 'Ravenna', 3.4); tag(g, 'RAVENNA, ITALY', ease.out(prog(t, r - 0.1, r + 0.2))); },
});
// s11 "Told that Rome has perished, he panics." — the messenger bursts in; on "panics" the emperor leaps up
registerShot('s11', { kind: '3d',
  init(T) { return palace(T); },
  draw(s, t, info) { s.set.update(t); const per = at(info, 'perished', 0.9), pan = at(info, 'panics', 1.5);
    const mx = lerp(-3.8, -1.5, ease.out(prog(t, 0, 0.7))); s.msg.position.set(mx, 0, -0.6); s.msg.rotation.y = 1.0;
    s.msg.pose(t < 0.7 ? run(t) : addPose(POSE.panic, tremble(t))); s.msg.face({ ...EXPR.panic, talk: t > 0.6 && t < pan ? 1 : 0 }, t);
    const up = ease.outBack(prog(t, pan - 0.05, pan + 0.3));
    s.emp.position.y = lerp(SEAT_Y, 0.3, up) + Math.sin(Math.PI * clamp(up)) * 0.25; s.emp.pose(addPose(mixPose(SIT, POSE.panic, up), tremble(t, up)));
    s.emp.face(t < per ? { ...EXPR.happy, pupil: [-0.6, 0] } : mixExpr({ ...EXPR.shocked, pupil: [-0.6, 0] }, EXPR.panic, up), t);
    s.hen.update(t, { peck: t < pan ? 1 : 0, look: t > pan ? -0.6 : 0 });
    const z = ease.out(prog(t, pan - 0.05, pan + 0.2));
    s.stage.cam([lerp(-0.6, -0.1, z), lerp(2.6, 2.35, z), lerp(7.2, 4.4, z)], [lerp(-0.8, 0.1, z), lerp(1.7, 2.1, z), -1.8], 36); },
});
// s12 "About his chicken." — the emperor dives at the perch, chicken flaps in panic
registerShot('s12', { kind: '3d',
  init(T) { return palace(T); },
  draw(s, t) { s.set.update(t); s.msg.visible = false; const k = ease.out(prog(t, 0, 0.35));
    s.emp.position.set(lerp(0, 0.35, k), 0, lerp(-2.35, -1.55, k)); s.emp.rotation.y = 0.75;
    s.emp.pose(addPose(point(POSE.panic, 'L', k, { up: 0.1, across: -0.2 }), tremble(t))); s.emp.face({ ...EXPR.panic, pupil: [0.4, 0.1], mouth: 'scream' }, t);
    s.hen.update(t, { flap: 1, panic: 1, look: -0.5 });
    s.stage.cam([0.9, 2.3, 3.6], [0.75, 1.75, -1.9], 34); },
});
// s13 "Named Roma." — chicken close-up, deadpan, next to its plaque
registerShot('s13', { kind: '3d',
  init(T) { return palace(T); },
  draw(s, t) { s.set.update(t); s.msg.visible = false; s.emp.visible = false; s.hen.update(t * 0.2, { look: 0.35 + Math.sin(t * 2) * 0.05 });
    camMove(s.stage, t, [[0, { pos: [1.5, 2.1, 1.4], look: [1.05, 1.7, -2.0], fov: 30 }], [1.2, { pos: [1.4, 2.1, 1.0], look: [1.05, 1.75, -2.0], fov: 28 }]]); },
});
// s14 "Or so the story goes." — the emperor cuddles Roma, relieved; the messenger facepalms
registerShot('s14', { kind: '3d',
  init(T) { return palace(T); },
  draw(s, t) { s.set.update(t);
    s.emp.position.set(0.25, 0, -1.2); s.emp.rotation.y = 0; s.emp.pose(addPose(POSE.holdFront, { ...idle(t, 8), headTilt: 0.18 + Math.sin(t * 3) * 0.05 })); s.emp.face({ ...EXPR.happy, lid: 0.55, lower: 0.5 }, t);
    s.emp.updateMatrixWorld(true); const a = new THREE.Vector3(), b = new THREE.Vector3(); s.emp.hand.L.getWorldPosition(a); s.emp.hand.R.getWorldPosition(b);
    s.hen.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.35, 0.12)); s.hen.rotation.y = 0.2; s.hen.update(t * 0.3, { look: 0.3 });
    s.msg.position.set(-1.45, 0, -0.4); s.msg.rotation.y = 0.45; s.msg.pose(addPose(POSE.facepalm, idle(t, 2))); s.msg.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [-0.5, 2.35, 6.6], look: [-0.5, 1.7, -0.9], fov: 34 }], [1.6, { pos: [-0.45, 2.3, 6.0], look: [-0.5, 1.75, -0.9], fov: 33 }]]); },
});
