// s09, s10, s10b, s13: Byron's letter (1807) and the fellowship joke (a comic daydream: the bear sits the exam)
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, room, byron, don, theBear } from './_lib.js';

const LINES = ['I have got a new friend,', 'the finest in the world,', 'a tame bear.'];
const WRITE = { ...POSE.sit, armR: [1.05, 0.05, 0.2], elbowR: 1.0, armL: [0.95, -0.1, -0.2], elbowL: 1.1, lean: 0.25, headNod: 0.35 };
function writer(s) { s.by = byron(); s.by.position.set(0, -0.12, -1.75); s.stage.add(s.by); s.stage.add(PR.stool({ h: 0.62, color: '#5a3420' }).at(0, 0, -1.8));
  s.q = PR.quill(); s.q.rotation.set(Math.PI * 0.85, 0, 0.3); s.by.hold('R', s.q);
  s.lt = PR.letter(); s.lt.position.set(0.12, s.set.desk.top + 0.005, -0.8); s.lt.rotation.y = 0.08; s.stage.add(s.lt); }
const scribble = (t) => ({ armR: [Math.sin(t * 9) * 0.04, Math.sin(t * 13) * 0.05, 0], elbowR: Math.sin(t * 11) * 0.06 });

// s09 "In 1807, he wrote to a friend:" — candlelit room, Byron scribbling at his desk
registerShot('s09', { kind: '3d',
  init(T) { const s = room(T); writer(s); return s; },
  draw(s, t, info) { s.set.update(t); s.lt.setText(LINES, 0); s.by.pose(addPose(addPose(WRITE, scribble(t)), idle(t, 2, 0.5))); s.by.face({ ...EXPR.happy, lid: 0.45, pupil: [0, -0.6] }, t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.5, 5.2], look: [0.1, 1.55, -1.2], fov: 36 }], [info.dur, { pos: [0.35, 2.3, 3.6], look: [0.1, 1.6, -1.2], fov: 34 }]]); },
  overlay(g, t, info) { const y = at(info, '1807,', 0.15); tag(g, 'CAMBRIDGE, 1807', ease.out(prog(t, y, y + 0.3)), 0.14); },
});
// s10 "I have a new friend," — the letter: Byron's real words appear in handwriting under the quill
registerShot('s10', { kind: '3d',
  init(T) { const s = room(T); writer(s); s.by.visible = false; s.q2 = PR.quill(); s.stage.add(s.q2); return s; },
  draw(s, t, info) { s.set.update(t); const k = clamp(t / (info.dur + 0.1)) * 0.68; s.lt.setText(LINES, k); const top = s.set.desk.top;
    const n = k * LINES.join('').length, line = n < LINES[0].length ? 0 : 1, frac = line ? (n - LINES[0].length) / LINES[1].length : n / LINES[0].length;
    s.q2.position.set(0.12 - 0.24 + clamp(frac) * 0.48, top + 0.01, -0.8 - 0.25 + line * 0.077 + 0.02); s.q2.rotation.set(-0.5 + Math.sin(t * 14) * 0.05, 0, -0.45);
    camMove(s.stage, t, [[0, { pos: [0.12, top + 1.25, -0.45], look: [0.12, top, -0.95], fov: 38 }], [info.dur, { pos: [0.12, top + 1.12, -0.6], look: [0.12, top, -0.95], fov: 38 }]]); },
});
// s10b "the finest in the world." — Byron leans back, hand on heart, dreamy
registerShot('s10b', { kind: '3d',
  init(T) { const s = room(T); writer(s); return s; },
  draw(s, t, info) { s.set.update(t); s.lt.setText(LINES, 0.68); const k = ease.inOut(prog(t, 0.05, 0.45));
    s.by.pose(addPose(mixPose(WRITE, { ...POSE.sit, lean: -0.12, armL: [0.9, -0.3, 0.5], elbowL: 2.0, armR: [0.5, 0.1, 0], elbowR: 0.6, headNod: -0.25, headTilt: 0.15 }, k), idle(t, 2)));
    s.by.face({ ...EXPR.happy, lid: lerp(0.35, 0.55, k), pupil: [0.3, 0.6] }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.35, 2.6], look: [0, 2.0, -1.7], fov: 30 }], [info.dur, { pos: [0.3, 2.3, 2.1], look: [0, 2.05, -1.7], fov: 30 }]]); },
});
// s13 "He said it should sit for a fellowship." — Byron's joke, pictured: the bear in a mortarboard sits the fellowship exam; the dons gasp
registerShot('s13', { kind: '3d',
  init(T) { const s = room(T, { evening: false, deskOn: false }); s.dk = PR.desk({ w: 1.4, d: 0.75, h: 0.8 }).at(0, 0, 0); s.stage.add(s.dk);
    s.stage.add(PR.stool({ h: 0.6 }).at(0, 0, -0.75)); s.be = theBear({ scale: 1.0, mortarboard: true }); s.be.position.set(0, 0.15, -0.7); s.stage.add(s.be);
    const q = PR.quill(); q.rotation.set(Math.PI * 0.8, 0, 0); q.position.set(0, -0.05, 0.08); s.be.paw.R.add(q);
    s.pp = PR.letter(); s.pp.position.set(-0.05, s.dk.top + 0.005, 0.05); s.stage.add(s.pp); s.pp.setText(['FELLOWSHIP EXAM', '', 'Q1. Why bear?'], 1); s.stage.add(PR.inkpot().at(0.5, s.dk.top, -0.05));
    s.d = [don(0), don(1)]; s.d[0].position.set(-1.35, 0, -0.35); s.d[0].rotation.y = 0.55; s.d[1].position.set(1.35, 0, -0.35); s.d[1].rotation.y = -0.55; s.stage.add(...s.d); return s; },
  draw(s, t, info) { const f = at(info, 'fellowship.', 1.5), k = ease.outBack(prog(t, f - 0.05, f + 0.2));
    s.be.update(t, { sit: 1, lid: lerp(0.3, 0.5, clamp(k)), lidAngle: 0.1, look: [0, 0.1], smile: 1, pose: { armR: [-1.1 + Math.sin(t * 10) * 0.08, 0, -0.15], armL: [-1.0, 0, 0.2] } });
    s.d.forEach((d, i) => { d.pose(addPose(mixPose({ ...POSE.stand, armL: [0.2, 0.2, 0], armR: [0.2, 0.2, 0] }, { ...POSE.panic, lean: -0.1 }, clamp(k) * 0.7), idle(t, 4 + i))); d.face(mixExpr({ ...EXPR.suspicious, pupil: [i ? -0.5 : 0.5, -0.2] }, { ...EXPR.shocked, pupil: [i ? -0.5 : 0.5, 0] }, k), t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.9, 8.6], look: [0, 1.45, -0.2], fov: 36 }], [info.dur, { pos: [0, 2.8, 7.8], look: [0, 1.5, -0.2], fov: 35 }]]); },
  overlay(g, t, info) { const f = at(info, 'fellowship.', 1.5); tag(g, 'THE FELLOWSHIP EXAM', ease.out(prog(t, f, f + 0.3)), 0.14); },
});
