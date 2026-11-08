// Space shots: s01-s10, s14-s16, s21. HERO ("you", mustard hoodie) outside the station, no suit.
// "Outward" camera = from the airlock looking away from the station (+Z): the Earth fills the lower frame behind him.
// "Station" camera = from space looking back at the station (-Z): airlock + porthole with a cast cameo.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, tremble, walk } from '/kits/toon3d/rig.js';
import { THREE, at, tag, countdown, o2meter, subPill, iris, space, hero, dev, mina, inPort, floatPose, pivot, thermos, bubbles } from './_lib.js';

const V = new THREE.Vector3();
const GASP = { ...EXPR.shocked, brow: 0.95, browAngle: -0.45, mouth: 'o', mouthW: 1.15 };
const headOf = (P) => { P.updateMatrixWorld(true); return P.bean.parts.head.getWorldPosition(new THREE.Vector3()); };
function heroIn(s, o = {}) { s.h = hero(); s.h.parts.head.traverse(m => { m.castShadow = false; }); s.P = pivot(s.h); s.stage.add(s.P); return s; }

// ---- s01 + s21: the drift out of the airlock (s21 runs with u = t - dur, so its last frame == s01's first frame: loop)
function driftInit(T) { const s = space(T, { target: [0.4, 2, 3.5], outward: true }); heroIn(s); return s; }
function driftDraw(s, u) {
  const k = u + 1.8; s.set.update(u + 10);
  s.P.position.set(0.15 + 0.1 * k, 2.15 - 0.06 * k, 2.6 + 0.55 * k);
  s.P.rotation.set(-0.12 + 0.07 * k, Math.PI + 0.22 * Math.sin(k * 0.9), 0.32 - 0.18 * k);
  s.h.pose(floatPose(u + 10, 1)); s.h.face(GASP, u + 10);
  const c = s.P.position; s.stage.cam([0.3 + 0.05 * Math.sin(u * 2), 2.75, -0.25], [c.x, c.y + 0.95, c.z], 44);
}
registerShot('s01', { kind: '3d', init: driftInit, draw(s, t) { driftDraw(s, t); }, overlay(g, t) { countdown(g, 10 - t * 0.7, 1, 0.165, { r: 100 }); } });
registerShot('s21', { kind: '3d', init: driftInit, draw(s, t, info) { driftDraw(s, t - info.dur); },
  overlay(g, t, info) { countdown(g, 10, 1, 0.165, { r: 100 }); subPill(g, prog(t, 0.05, 0.3) * (1 - prog(t, info.dur - 0.35, info.dur - 0.08)), 0.265); } });

// ---- s02 "Use them." — closer, he steadies and stares into the lens (deadpan)
registerShot('s02', { kind: '3d', init: driftInit,
  draw(s, t) { const u = 1.62 + t, k = u + 1.8; s.set.update(u + 10);
    s.P.position.set(0.15 + 0.1 * k, 2.15 - 0.06 * k, 2.6 + 0.55 * k); s.P.rotation.set(0.05, Math.PI + 0.06 * Math.sin(t * 1.3), 0.08 * Math.sin(t * 0.9));
    s.h.pose(floatPose(u + 10, 0.25)); s.h.face(mixExpr(GASP, { ...EXPR.deadpan, pupil: [0, 0] }, ease.inOut(prog(t, 0.05, 0.4))), u + 10);
    const c = s.P.position; s.stage.cam([c.x - 0.05, c.y + 1.0, c.z - 3.4 + t * 0.3], [c.x, c.y + 0.95, c.z], 38); },
  overlay(g, t) { countdown(g, 10 - (1.62 + t) * 0.7, 1, 0.165, { r: 100 }); } });

// ---- s03 "You just stepped into space." — wide from space: he walks out of the airlock onto nothing
registerShot('s03', { kind: '3d', init(T) { const s = space(T, { target: [0, 2, 1] }); heroIn(s); return s; },
  draw(s, t) { s.set.update(t); s.P.position.set(0.15 + 0.35 * t, 2.25 + 0.05 * t, 0.35 + 0.75 * t); s.P.rotation.set(0, -0.15, 0.05 * Math.sin(t * 2));
    s.h.pose(walk(t, { speed: 1.3 })); s.h.face(mixExpr(EXPR.happy, EXPR.worried, ease.inOut(prog(t, 0.9, 1.4))), t);
    camMove(s.stage, t, [[0, { pos: [2.6, 3.4, 12.5], look: [0, 2.4, 0.5], fov: 40 }], [1.7, { pos: [2.3, 3.3, 11.0], look: [0.2, 2.4, 0.8], fov: 40 }]]); } });

// ---- s04 "No suit." — he looks down at his hoodie, pats it... then the realisation
registerShot('s04', { kind: '3d', init(T) { const s = space(T, { target: [0.8, 2, 2.5] }); heroIn(s); return s; },
  draw(s, t, info) { s.set.update(t); const ts = at(info, 'suit', 0.4); const k = ease.out(prog(t, ts + 0.15, ts + 0.4));
    s.P.position.set(0.8, 2.1, 3.0); s.P.rotation.set(0, -0.2, 0.04 * Math.sin(t * 1.5));
    const pat = Math.sin(t * 14) * 0.12 * (1 - k);
    s.h.pose(mixPose({ ...floatPose(t, 0.15), headNod: 0.45, armR: [1.0, 0.05, 0.9 + pat], elbowR: 2.1, armL: [0.9, 0.05, 0.9 - pat], elbowL: 2.0 }, { ...POSE.panic, headNod: -0.05 }, k));
    s.h.face(mixExpr({ ...EXPR.neutral, pupil: [0, -0.9], lid: 0.35 }, GASP, k), t);
    camMove(s.stage, t, [[0, { pos: [0.9, 2.7, 8.6], look: [0.8, 2.5, 3.0], fov: 34 }], [info.dur, { pos: [0.9, 2.75, 7.8], look: [0.8, 2.6, 3.0], fov: 33 }]]); },
  overlay(g, t, info) { tag(g, 'NO SUIT', prog(t, at(info, 'suit', 0.4) - 0.1, at(info, 'suit', 0.4) + 0.2)); } });

// ---- s05 "But you don't explode." — DEV films from the porthole, waiting for the boom; HERO braces... nothing.
function portInit(who) { return (T) => { const s = space(T, { target: [-2.5, 2, 1] }); heroIn(s); s.c = who === 'dev' ? dev() : mina(); inPort(s.c, 0.15); s.c.rotation.y = 0.15; s.stage.add(s.c); return s; }; }
registerShot('s05', { kind: '3d', init: portInit('dev'),
  draw(s, t, info) { s.set.update(t); const te = at(info, 'explode', 0.8); const k = ease.out(prog(t, te + 0.35, te + 0.6));
    s.P.position.set(-1.75, 2.0, 1.5); s.P.rotation.set(0, -0.35, 0.05 * Math.sin(t));
    s.h.pose(addPose({ ...POSE.stand, armL: [2.7, 0.45, 0], armR: [2.7, 0.45, 0], elbowL: 1.7, elbowR: 1.7, legL: [0.5, 0.1], kneeL: 0.9, headNod: 0.15 }, tremble(t, 1.5 * (1 - k))));
    s.h.face(mixExpr({ ...EXPR.asleep, brow: 0.6, browAngle: -0.5, mouth: 'wavy' }, { ...EXPR.neutral, lidL: 0, lidR: 1, brow: 0.3, browL: 0.5, mouth: 'line', pupil: [0.3, 0] }, k), t);
    s.c.pose(addPose({ ...POSE.stand, armR: [1.75, 0.05, 0], elbowR: 0.55, armL: [0.6, 0.1, 0], elbowL: 1.2 }, idle(t, 2)));
    s.c.face({ ...EXPR.grin, lid: 0.35 }, t);
    camMove(s.stage, t, [[0, { pos: [-2.0, 2.8, 7.8], look: [-2.6, 2.45, 0.8], fov: 38 }], [info.dur, { pos: [-2.0, 2.75, 7.0], look: [-2.6, 2.45, 0.8], fov: 37 }]]); },
  overlay(g, t, info) { const te = at(info, 'explode', 0.8); tag(g, 'BOOM?', prog(t, 0.1, 0.35), 0.14, { size: 60, strike: ease.out(prog(t, te + 0.3, te + 0.55)) }); } });

// ---- s06 "That's a movie thing." — DEV lowers his phone. Disappointed.
registerShot('s06', { kind: '3d', init: portInit('dev'),
  draw(s, t, info) { s.set.update(t); const k = ease.inOut(prog(t, 0.15, 0.7));
    s.P.position.set(-1.75, 2.0, 1.5); s.P.rotation.set(0, -0.35, 0);
    s.h.pose(floatPose(t, 0.2)); s.h.face(EXPR.neutral, t);
    s.c.pose(mixPose({ ...POSE.stand, armR: [1.75, 0.05, 0], elbowR: 0.55, armL: [0.6, 0.1, 0], elbowL: 1.2 }, { ...POSE.relaxed, armR: [0.4, 0.1, 0], elbowR: 0.9, headNod: 0.12, shrugY: -0.03 }, k));
    s.c.face(mixExpr({ ...EXPR.grin, lid: 0.35 }, { ...EXPR.sad, lid: 0.55, pupil: [0, -0.2] }, k), t);
    camMove(s.stage, t, [[0, { pos: [-3.15, 2.55, 3.0], look: [-3.3, 2.45, -0.7], fov: 30 }], [info.dur, { pos: [-3.15, 2.5, 2.6], look: [-3.3, 2.45, -0.7], fov: 29 }]]); },
  overlay(g, t) { tag(g, 'MOVIE MYTH', prog(t, 0.25, 0.5)); } });

// ---- s07 "You don't freeze solid either." — shivers on cue... then notices he's fine
registerShot('s07', { kind: '3d', init(T) { const s = space(T, { target: [0.6, 2, 2.5] }); heroIn(s); return s; },
  draw(s, t, info) { s.set.update(t); const te = at(info, 'either', 1.1); const k = ease.inOut(prog(t, te, te + 0.4));
    s.P.position.set(0.6, 2.1, 2.7); s.P.rotation.set(0, 0.15, 0.03 * Math.sin(t));
    const hug = { ...POSE.stand, armL: [1.15, -0.4, 0.2], armR: [1.15, -0.4, 0.2], elbowL: 1.95, elbowR: 1.95, legL: [0.2, 0.05], legR: [0.2, 0.05], kneeL: 0.4, kneeR: 0.4, shrugY: 0.04 };
    s.h.pose(addPose(mixPose(hug, { ...floatPose(t, 0.15), headTilt: 0.15 }, k), tremble(t, 3 * (1 - k))));
    s.h.face(mixExpr({ ...EXPR.worried, mouth: 'teeth', lid: 0.15 }, { ...EXPR.deadpan, browL: 0.45, pupil: [0, 0] }, k), t);
    camMove(s.stage, t, [[0, { pos: [0.7, 2.8, 8.2], look: [0.6, 2.5, 2.7], fov: 34 }], [info.dur, { pos: [0.7, 2.8, 7.5], look: [0.6, 2.6, 2.7], fov: 33 }]]); },
  overlay(g, t, info) { const te = at(info, 'either', 1.1); tag(g, 'FROZEN SOLID?', prog(t, 0.05, 0.3), 0.14, { strike: ease.out(prog(t, te, te + 0.3)) }); } });

// ---- s08 "Space is basically a giant thermos." — a giant thermos floats by; he pats it, smug
registerShot('s08', { kind: '3d', init(T) { const s = space(T, { target: [0, 2, 4.2], outward: true }); heroIn(s); s.th = thermos(); s.th.scale.setScalar(1.25); s.stage.add(s.th); return s; },
  draw(s, t, info) { s.set.update(t); const tt = at(info, 'thermos', 1.4);
    s.P.position.set(0.45, 2.1, 4.2); s.P.rotation.set(0, Math.PI + 0.25, 0.04 * Math.sin(t));
    s.th.position.set(-0.95 + 0.06 * Math.sin(t), 0.7 + 0.08 * Math.sin(t * 1.3), 4.7 - 0.15 * t); s.th.rotation.set(0.12, t * 0.25, 0.18);
    const pat = ease.out(prog(t, tt - 0.2, tt + 0.1)); const tap = Math.max(0, Math.sin((t - tt) * 16)) * 0.12 * pat;
    s.h.pose(mixPose(floatPose(t, 0.25), { ...floatPose(t, 0.1), armL: [1.2 + tap, 0.75, 0], elbowL: 0.5, headTurn: 0.35 }, pat));
    s.h.face(mixExpr(EXPR.neutral, { ...EXPR.smug, pupil: [0.5, 0] }, pat), t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.7, -0.2], look: [-0.15, 2.3, 4.3], fov: 42 }], [info.dur, { pos: [0.05, 2.65, 0.3], look: [-0.15, 2.3, 4.3], fov: 41 }]]); },
  overlay(g, t) { tag(g, 'VACUUM = INSULATOR', prog(t, 1.0, 1.3), 0.14, { size: 50 }); } });

// ---- s09 + s10: extreme close-up. "The spit on your tongue, though?" ... "That boils." (cartoon fizz, no injury)
function faceInit(T) { const s = space(T, { target: [0.3, 2.5, 3.6], shadowSize: 3, outward: true }); heroIn(s); s.b = bubbles(s.stage, 16, 5); return s; }
function faceSet(s, t) { s.P.position.set(0.3, 2.1, 3.6); s.P.rotation.set(0.04, Math.PI, 0.03 * Math.sin(t * 1.1)); s.h.pose(floatPose(t, 0.15)); }
registerShot('s09', { kind: '3d', init: faceInit,
  draw(s, t, info) { s.set.update(t); faceSet(s, t); const tg = at(info, 'tongue', 0.7); const k = ease.inOut(prog(t, tg - 0.1, tg + 0.25));
    s.h.face(mixExpr({ ...EXPR.suspicious, pupil: [0, 0] }, { ...EXPR.suspicious, pupil: [0, -0.9], mouth: 'o', mouthW: 0.7, lid: 0.4 }, k), t); s.b.update(t, 0, V);
    const hd = headOf(s.P); s.stage.cam([hd.x + 0.05, hd.y + 0.12, hd.z - 3.3 + t * 0.15], [hd.x, hd.y - 0.15, hd.z], 38); } });
registerShot('s10', { kind: '3d', init: faceInit,
  draw(s, t, info) { s.set.update(t); faceSet(s, t); const tb = at(info, 'boils', 0.6); const k = ease.out(prog(t, tb - 0.05, tb + 0.15));
    s.h.face(mixExpr({ ...EXPR.suspicious, pupil: [0, -0.9], mouth: 'o', mouthW: 0.7, lid: 0.4 }, { ...GASP, pupil: [0, -0.5], mouthW: 0.9 }, k), t);
    V.copy(headOf(s.P)).add(new THREE.Vector3(0, -0.2, -0.45)); s.b.update(t, prog(t, tb - 0.1, tb + 0.15), V, -1);
    const hd = headOf(s.P); const sh = Math.sin(t * 40) * 0.012 * k * (1 - prog(t, tb + 0.4, tb + 0.8)); s.stage.cam([hd.x + 0.05 + sh, hd.y + 0.12, hd.z - 3.0], [hd.x, hd.y - 0.15, hd.z], 38); },
  overlay(g, t, info) { const tb = at(info, 'boils', 0.6); tag(g, 'SPIT BOILS', prog(t, tb + 0.15, tb + 0.4)); } });

// ---- s14 "Because about ten seconds in," — MINA times it from the porthole
registerShot('s14', { kind: '3d', init: portInit('mina'),
  draw(s, t, info) { s.set.update(t); s.P.position.set(-1.75, 2.0, 1.5); s.P.rotation.set(0, -0.35, 0.05 * Math.sin(t));
    s.h.pose(floatPose(t, 0.3)); s.h.face({ ...EXPR.worried, lid: 0.35 }, t);
    s.c.position.y = 0.55; s.c.pose(addPose({ ...POSE.stand, armR: [1.85, 0.1, -0.3], elbowR: 0.5 }, idle(t, 3))); s.c.prop.tick(t); s.c.face({ ...EXPR.deadpan, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-2.1, 2.75, 7.4], look: [-2.65, 2.45, 0.8], fov: 37 }], [info.dur, { pos: [-2.2, 2.75, 6.6], look: [-2.75, 2.5, 0.8], fov: 35 }]]); },
  overlay(g, t) { countdown(g, 3.2 - t * 1.55, 1, 0.165, { r: 100 }); } });

// ---- s15 "your brain runs out of oxygen." — eyelids get heavy, the O2 bar drains
registerShot('s15', { kind: '3d', init(T) { const s = space(T, { target: [0.3, 2, 3.6], outward: true }); heroIn(s); return s; },
  draw(s, t, info) { s.set.update(t); const k = ease.inOut(prog(t, 0.2, info.dur));
    s.P.position.set(0.3, 2.1, 3.6); s.P.rotation.set(0.05, Math.PI + 0.1, 0.05 * Math.sin(t * 0.8) + 0.12 * k);
    s.h.pose(addPose(floatPose(t, 0.3 * (1 - k)), { headNod: 0.25 * k + 0.08 * Math.sin(t * 3) * k, headTilt: 0.15 * k }));
    s.h.face({ ...EXPR.neutral, lid: lerp(0.3, 0.82, k), brow: lerp(0.2, -0.2, k), mouth: k > 0.5 ? 'o' : 'line', mouthW: 0.6, pupil: [0, -0.2] }, t, { blink: false });
    const hd = headOf(s.P); camMove(s.stage, t, [[0, { pos: [hd.x + 0.1, hd.y + 0.2, hd.z - 3.4], look: [hd.x, hd.y - 0.25, hd.z], fov: 40 }], [info.dur, { pos: [hd.x + 0.05, hd.y + 0.12, hd.z - 2.9], look: [hd.x, hd.y - 0.2, hd.z], fov: 38 }]]); },
  overlay(g, t, info) { o2meter(g, lerp(0.45, 0.03, prog(t, 0.1, info.dur - 0.2)), prog(t, 0, 0.25)); } });

// ---- s16 "Lights out." — eyes close, he floats limp (peaceful), the iris closes
registerShot('s16', { kind: '3d', init(T) { const s = space(T, { target: [0.3, 2, 4.0], outward: true }); heroIn(s); return s; },
  draw(s, t, info) { s.set.update(t); s.P.position.set(0.3, 2.1 + 0.05 * t, 4.0 + 0.1 * t); s.P.rotation.set(0.1, Math.PI + 0.1, 0.2 + 0.08 * t);
    s.h.pose({ ...floatPose(t, 0.05), armL: [0.6, 1.4, 0], armR: [0.6, 1.4, 0], elbowL: 0.5, elbowR: 0.5, headNod: 0.25, headTilt: 0.2 });
    s.h.face({ ...EXPR.asleep, mouth: 'o', mouthW: 0.5 }, t, { blink: false });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.9, -0.1], look: [0.3, 2.4, 4.0], fov: 38 }], [info.dur, { pos: [0.4, 2.95, 0.3], look: [0.3, 2.45, 4.1], fov: 37 }]]); },
  overlay(g, t, info) { iris(g, ease.in(prog(t, 0.35, info.dur - 0.05)), 0.5, 0.45); } });
