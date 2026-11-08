// 1966 test-chamber shots: s11-s13, s17-s20. The volunteer (never named) sits in a vacuum chamber in a pressure suit;
// a hose pops off, his spit fizzes, he blacks out; DR LIN repressurises; he wakes up fine. No injury is ever shown.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble } from '/kits/toon3d/rig.js';
import { THREE, at, tag, airLines, lab, lin, volunteer, seatVolunteer, bubbles } from './_lib.js';

const V = new THREE.Vector3();
const SLUMP = { ...POSE.sit, side: 0.22, lean: 0.12, headNod: 0.5, headTilt: 0.35, armL: [0.2, 0.1, 0], armR: [0.2, 0.1, 0], elbowL: 0.2, elbowR: 0.2 };
const OUT = { ...EXPR.asleep, mouth: 'o', mouthW: 0.45 };
function labInit(T) { const s = lab(T); s.v = seatVolunteer(volunteer()); s.stage.add(s.v); s.l = lin(); s.l.position.set(3.63, 0, 0.81); s.l.rotation.y = -0.5; s.stage.add(s.l); s.b = bubbles(s.stage, 10, 8); s.b.update(0, 0, V); return s; }
// hose: 0 attached .. 1 popped off and floating loose
function hose(s, k) { s.v.hose.rotation.set(0, 0, -1.1 * k); s.v.hose.position.set(0.12 + 0.5 * k, 1.55 - 0.3 * k, 0.25 + 0.2 * k); }
const PORTCAM = (t, dur) => [[0, { pos: [0.22, 2.4, 4.6], look: [0, 2.2, -1.0], fov: 34 }], [dur, { pos: [0.18, 2.38, 4.0], look: [0, 2.2, -1.0], fov: 33 }]];

// s11 "In 1966," — the lab, wide. DR LIN at the console, the volunteer seated in the chamber.
registerShot('s11', { kind: '3d', init: labInit,
  draw(s, t, info) { hose(s, 0); s.v.pose(addPose(POSE.sit, idle(t, 4, 0.5))); s.v.face({ ...EXPR.neutral, pupil: [0.2, 0] }, t);
    s.l.pose(addPose({ ...POSE.stand, armL: [0.9, 0.1, 0.3], elbowL: 0.9 }, idle(t, 2))); s.l.face({ ...EXPR.neutral, pupil: [-0.4, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [1.9, 3.1, 11.0], look: [1.6, 2.2, 0.2], fov: 40 }], [info.dur, { pos: [1.8, 3.0, 9.8], look: [1.5, 2.2, 0.2], fov: 40 }]]); },
  overlay(g, t) { tag(g, '1966 · NASA TEST', prog(t, 0.1, 0.4)); } });

// s12 "a NASA test volunteer felt it bubbling..." — through the porthole: the hose pops off, then the fizz
registerShot('s12', { kind: '3d', init: labInit,
  draw(s, t, info) { const tp = 0.55, tb = at(info, 'bubbling', 2.0); const kp = ease.outBack(prog(t, tp, tp + 0.25)); hose(s, kp);
    const ks = ease.out(prog(t, tp + 0.05, tp + 0.25));
    s.v.pose(addPose(mixPose(POSE.sit, { ...POSE.sit, armL: [0.9, 0.3, 0.4], elbowL: 1.2, headNod: 0.1, shrugY: 0.04 }, ks), tremble(t, 0.6 * ks)));
    s.v.face(mixExpr(mixExpr(EXPR.neutral, GASPV, ks), { ...GASPV, pupil: [0, -0.8], mouth: 'o', mouthW: 0.8 }, prog(t, tb - 0.2, tb + 0.1)), t);
    s.stage.scene.updateMatrixWorld(true); s.v.parts.head.getWorldPosition(V); V.y -= 0.2; V.z += 0.45; s.b.update(t, prog(t, tb - 0.15, tb + 0.1) * 0.8, V, 1);
    camMove(s.stage, t, PORTCAM(t, info.dur)); },
  overlay(g, t) { tag(g, 'SUIT HOSE POPS OFF', prog(t, 0.7, 0.95), 0.14, { size: 50 }); } });
const GASPV = { ...EXPR.shocked, brow: 0.9, browAngle: -0.4, mouth: 'o' };

// s13 "right before he blacked out." — eyes close, he slumps on the stool, the chamber lamp dims
registerShot('s13', { kind: '3d', init: labInit,
  draw(s, t, info) { hose(s, 1); const k = ease.inOut(prog(t, 0.6, 1.4));
    s.v.pose(mixPose({ ...POSE.sit, armL: [0.9, 0.3, 0.4], elbowL: 1.2 }, SLUMP, k)); s.v.face(mixExpr({ ...GASPV, pupil: [0, -0.8] }, OUT, k), t, { blink: false });
    s.b.update(t, 0.6 * (1 - prog(t, 0.2, 0.8)), (s.stage.scene.updateMatrixWorld(true), s.v.parts.head.getWorldPosition(V), V.y -= 0.2, V.z += 0.45, V), 1);
    s.set.lamp.intensity = lerp(7, 2.5, k);
    camMove(s.stage, t, PORTCAM(t, info.dur)); } });

// s17 "That volunteer?" — DR LIN slams the big red button
registerShot('s17', { kind: '3d', init: labInit,
  draw(s, t) { hose(s, 1); s.v.pose(SLUMP); s.v.face(OUT, t, { blink: false }); s.set.lamp.intensity = 2.5;
    const kb = ease.in(prog(t, 0.45, 0.75)), up = ease.out(prog(t, 0.0, 0.45));
    s.l.pose(mixPose({ ...POSE.stand, armL: [1.9 * up + 0.1, 0.3, 0], elbowL: 0.4 }, { ...POSE.stand, armL: [0.85, 0.25, 0], elbowL: 0.35, lean: 0.25, headNod: 0.15 }, kb));
    s.l.face(mixExpr({ ...EXPR.worried, lid: 0.1 }, { ...EXPR.angry, mouth: 'teeth' }, prog(t, 0.3, 0.6)), t);
    s.set.button.position.y = 1.28 - 0.05 * prog(t, 0.72, 0.78);
    camMove(s.stage, t, [[0, { pos: [1.8, 2.75, 4.6], look: [3.3, 1.9, 1.0], fov: 34 }], [1.3, { pos: [1.95, 2.7, 4.1], look: [3.3, 1.85, 1.0], fov: 33 }]]); } });

// s18 "They pumped the air back in," — air rushes, the gauge needle swings back up, the lamp comes back
registerShot('s18', { kind: '3d', init: labInit,
  draw(s, t, info) { hose(s, 1); s.v.pose(SLUMP); s.v.face(OUT, t, { blink: false }); const k = ease.inOut(prog(t, 0.1, info.dur));
    s.set.gauge.set(lerp(0.0, 0.55, k)); s.set.lamp.intensity = lerp(2.5, 6, k);
    camMove(s.stage, t, [[0, { pos: [0.75, 2.5, 8.2], look: [0.7, 2.25, 0], fov: 44 }], [info.dur, { pos: [0.75, 2.5, 7.6], look: [0.7, 2.25, 0], fov: 43 }]]); },
  overlay(g, t, info) { airLines(g, t, 1 - prog(t, info.dur - 0.4, info.dur)); } });

// s19 "in under ninety seconds." — 87 s: the needle hits green; his eyelids flutter
registerShot('s19', { kind: '3d', init: labInit,
  draw(s, t, info) { hose(s, 1); s.v.pose(SLUMP); const kf = prog(t, info.dur - 0.6, info.dur);
    s.v.face({ ...OUT, lid: 1 - 0.25 * Math.max(0, Math.sin(kf * Math.PI * 3)) * kf }, t, { blink: false });
    s.set.gauge.set(lerp(0.55, 1.0, ease.out(prog(t, 0, 0.9)))); s.set.lamp.intensity = 7;
    camMove(s.stage, t, [[0, { pos: [0.75, 2.45, 7.4], look: [0.7, 2.25, 0], fov: 43 }], [info.dur, { pos: [0.75, 2.45, 6.9], look: [0.7, 2.25, 0], fov: 42 }]]); },
  overlay(g, t, info) { tag(g, '87 SECONDS', prog(t, at(info, 'ninety', 0.5) - 0.05, at(info, 'ninety', 0.5) + 0.2), 0.14, { size: 64 }); } });

// s20 "He woke up fine." — he sits up, grins, thumbs up
registerShot('s20', { kind: '3d', init: labInit,
  draw(s, t, info) { hose(s, 1); const k = ease.out(prog(t, 0.1, 0.5)), th = ease.outBack(prog(t, 0.45, 0.75));
    s.v.pose(mixPose(SLUMP, { ...POSE.sit, armR: [1.3 * th + 0.3, 0.35, -0.6 * th], elbowR: 1.6 * th, headNod: -0.05 }, k));
    s.v.face(mixExpr(OUT, { ...EXPR.grin, pupil: [0, 0] }, prog(t, 0.15, 0.45)), t, { blink: false }); s.set.lamp.intensity = 7; s.set.gauge.set(1);
    camMove(s.stage, t, PORTCAM(t, info.dur)); },
  overlay(g, t) { tag(g, 'NO LONG-TERM EFFECTS', prog(t, 0.55, 0.8), 0.14, { size: 48 }); } });
