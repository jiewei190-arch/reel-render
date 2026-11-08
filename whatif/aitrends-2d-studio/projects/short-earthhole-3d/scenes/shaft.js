// s003-s006, s009, s011, s012: falling down the tunnel. Rock strata stream past, then glow orange -> red -> white-gold near the core.
import { registerShot } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble } from '/kits/toon3d/rig.js';
import { THREE, at, chip, popK, screen, sweat, shaft, gauge, thermometer, FALL, FLOAT, ease, prog, clamp, lerp } from './_lib.js';

const HY = -1.25; // hero root y (body centre ~0)
const place = (s, t, rotY = 0) => { s.hero.position.set(0, HY, 0); s.hero.rotation.set(0, rotY, 0); };

// s003 "You fall." — cartoon hang: he hovers, looks down, gulps... then drops
registerShot('s003', { kind: '3d',
  init(T) { return shaft(T, { seed: 4 }); },
  draw(s, t, info) { const t0 = 0.42, a = 10, tt = Math.max(0, t - t0); s.update(t, 0.5 * a * tt * tt, a * tt, 0);
    place(s); const drop = ease.out(prog(t, t0, t0 + 0.25));
    s.hero.pose(mixPose(addPose(POSE.stand, { headNod: 0.45, armL: [0.1, 0.4, 0], armR: [0.1, 0.4, 0] }), FALL(t), drop));
    s.hero.face(t < t0 ? { ...EXPR.worried, pupil: [0, -0.9], mouth: 'line', mouthW: 0.5 } : mixExpr(EXPR.shocked, EXPR.panic, drop), t);
    const y = t < t0 ? 0 : 0.35 * drop; s.hero.position.y = HY + y;
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 2.9], look: [0, 0.2, 0], fov: 58 }], [info.dur, { pos: [0, 1.1, 2.6], look: [0, 0.4, 0], fov: 62 }]]); },
});
// s004 "Faster every second." — low angle looking up: arms flailing, streaks getting longer
registerShot('s004', { kind: '3d',
  init(T) { return shaft(T, { seed: 5 }); },
  draw(s, t, info) { const v = 8 + t * 9.8; s.update(t, 8 * t + 4.9 * t * t, v, 0.04); place(s, t, 0.15); s.hero.pose(FALL(t)); s.hero.face({ ...EXPR.panic, pupil: [0, 0.2] }, t);
    const d = drift(t * 6, 0.05 * clamp(v / 20), 3); camMove(s.stage, t, [[0, { pos: [0.3 + d[0], -1.6 + d[1], 2.7], look: [0, 0.5, 0], fov: 64 }], [info.dur, { pos: [0.2 + d[0], -1.3 + d[1], 2.3], look: [0, 0.6, 0], fov: 60 }]]); },
  overlay(g, t, info) { const k = popK(t, at(info, 'second', 0.6)); chip(g, '+35 km/h EVERY SECOND', k, 0.15, { size: 50 }); },
});
// s005 "But then the rock starts to glow." — he glances at the wall; on "glow" the strata light up orange. Double take.
registerShot('s005', { kind: '3d',
  init(T) { return shaft(T, { seed: 6 }); },
  draw(s, t, info) { const g0 = at(info, 'glow', 1.1), heat = 0.45 * ease.inOut(prog(t, g0 - 0.2, g0 + 0.5)); const d = 30 + 20 * t; s.update(t, d, 20, heat);
    place(s, t); const look = ease.inOut(prog(t, 0.15, 0.55)), take = ease.outBack(prog(t, g0, g0 + 0.2));
    s.hero.pose(addPose(FALL(t, 0.4), { headTurn: 0.55 * look - 0.3 * take, headNod: -0.05 }));
    s.hero.face(t < g0 ? { ...EXPR.deadpan, pupil: [0.9, 0] } : { ...EXPR.shocked, pupil: [0.7, 0] }, t);
    const d2 = drift(t, 0.03, 4); camMove(s.stage, t, [[0, { pos: [1.2 + d2[0], 0.7 + d2[1], 2.5], look: [0.1, 0.5, 0], fov: 56 }], [info.dur, { pos: [1.0, 0.8, 2.1], look: [0.1, 0.6, 0], fov: 54 }]]); },
});
// s006 "The heat and pressure keep rising." — he's holding a pressure gauge (needle climbing), a thermometer filling beside him; sweating
registerShot('s006', { kind: '3d',
  init(T) { const s = shaft(T, { seed: 7 }); s.gauge = gauge('PRESSURE'); s.stage.add(s.gauge); s.th = thermometer(); s.th.scale.setScalar(0.75); s.th.position.set(-1.3, -0.6, 0.6); s.th.rotation.z = 0.2; s.stage.add(s.th); return s; },
  draw(s, t, info) { const heat = lerp(0.45, 0.72, prog(t, 0, info.dur)); s.update(t, 60 + 22 * t, 22, heat);
    const p0 = at(info, 'pressure', 0.6), h0 = at(info, 'heat', 0.1);
    place(s, t); s.hero.pose(addPose(POSE.holdFront, { ...tremble(t, 0.6), headNod: 0.28, armL: [0.2, 0, 0], armR: [0.2, 0, 0], legL: [0.3, 0.15], legR: [0.15, 0.15], kneeL: 0.5, kneeR: 0.3 }));
    s.hero.face(mixExpr({ ...EXPR.worried, pupil: [0, -0.7] }, { ...EXPR.shocked, pupil: [0, -0.8] }, prog(t, p0 + 0.3, p0 + 0.5)), t);
    s.hero.updateMatrixWorld(true); const a = new THREE.Vector3(), b = new THREE.Vector3(); s.hero.hand.L.getWorldPosition(a); s.hero.hand.R.getWorldPosition(b);
    s.gauge.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.18, 0.15)); s.gauge.rotation.x = -0.35; s.gauge.scale.setScalar(0.6);
    s.gauge.set(ease.inOut(prog(t, p0, p0 + 0.9)) * 0.95 + Math.sin(t * 40) * 0.015 * prog(t, p0, p0 + 0.9));
    s.th.set(ease.inOut(prog(t, h0, h0 + 1.6)) * 0.92); s.th.position.y = -0.6 + Math.sin(t * 2) * 0.05;
    camMove(s.stage, t, [[0, { pos: [0.35, 1.0, 2.6], look: [-0.15, 0.25, 0], fov: 56 }], [info.dur, { pos: [0.3, 0.85, 2.2], look: [-0.15, 0.25, 0], fov: 54 }]]); },
  overlay(g, t, info, s) { const k = popK(t, at(info, 'pressure', 0.6)); chip(g, '× 3,600,000 AIR PRESSURE', k, 0.15, { size: 50 });
    const [x, y] = screen(s.stage, new THREE.Vector3(0, 1.2, 0.3)); sweat(g, x, y - 150, t, prog(t, 0.2, 0.6)); },
});
// s009 "And it gets weirder." — near the core: white-gold light from below, slow push to his face; one eyebrow goes up
registerShot('s009', { kind: '3d',
  init(T) { return shaft(T, { seed: 8 }); },
  draw(s, t, info) { s.update(t, 120 + 30 * t, 26, lerp(0.85, 1, prog(t, 0, info.dur))); place(s, t);
    const w0 = at(info, 'weirder', 0.6), k = ease.inOut(prog(t, w0 - 0.1, w0 + 0.3));
    s.hero.pose(addPose(FALL(t, 0.25), { headNod: 0.2, headTilt: 0.15 * k }));
    s.hero.face(mixExpr({ ...EXPR.deadpan, pupil: [0, -0.8] }, { ...EXPR.suspicious, pupil: [0.1, -0.1], browL: 0.6, browR: -0.3 }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 2.8], look: [0, 0.9, 0], fov: 46 }], [info.dur, { pos: [0, 1.15, 1.75], look: [0, 0.9, 0], fov: 40 }]], ease.sine); },
});
// s011 "racing at eight kilometers per second." — view from below, up the tunnel: he dives at us skydiver-style, streaks at max
registerShot('s011', { kind: '3d',
  init(T) { const s = shaft(T, { seed: 9 }); return s; },
  draw(s, t, info) { const heat = lerp(1, 0.85, prog(t, 0, info.dur)); s.update(t, 200 + 60 * t, 60, heat);
    s.hero.position.set(0, 0, -1.0); s.hero.rotation.set(Math.PI / 2 * 0.86, 0, Math.sin(t * 3) * 0.08);
    s.hero.pose(addPose({ armL: [0.3, 1.5, 0], armR: [0.3, 1.5, 0], elbowL: 0.4, elbowR: 0.4, legL: [-0.25, 0.25], legR: [-0.25, 0.25], kneeL: 0.6, kneeR: 0.6 }, { headNod: 0.25, ...tremble(t, 1.5) }));
    const e0 = at(info, 'eight', 0.9); s.hero.face(t < e0 ? { ...EXPR.shocked, mouth: 'scream' } : { ...EXPR.grin, lid: 0.12, brow: 0.6 }, t);
    const sh = 0.04; s.stage.camera.up.set(0, 0, 1);
    camMove(s.stage, t, [[0, { pos: [Math.sin(t * 51) * sh, -3.2, Math.cos(t * 43) * sh], look: [0, 10, -0.4], fov: 74 }], [info.dur, { pos: [Math.sin(t * 51) * sh, -2.6, Math.cos(t * 43) * sh], look: [0, 10, -0.4], fov: 70 }]]); },
  overlay(g, t, info) { const k = popK(t, at(info, 'eight', 0.9)); chip(g, '8 km/s', k, 0.16, { size: 110 }); chip(g, 'ABOUT 28,800 km/h', popK(t, at(info, 'second', 1.9)), 0.245, { size: 44, color: '#ffffff' }); },
});
// s012 "Then you slow down, and" — the glow fades, streaks shrink; he relaxes into a float, relieved
registerShot('s012', { kind: '3d',
  init(T) { return shaft(T, { seed: 10 }); },
  draw(s, t, info) { const k = ease.out(prog(t, 0, info.dur)); const v = lerp(26, 2, k); s.update(t, 300 + 26 * t - 12 * t * t, v, lerp(0.6, 0.15, k));
    place(s, t, -0.2); s.hero.pose(mixPose(FALL(t, 0.5), addPose(FLOAT(t), { headNod: -0.1 }), ease.inOut(prog(t, 0.2, 0.9))));
    s.hero.face(mixExpr(EXPR.worried, { ...EXPR.happy, lid: 0.45, lower: 0.35 }, ease.inOut(prog(t, at(info, 'slow', 0.3), at(info, 'slow', 0.3) + 0.4))), t);
    camMove(s.stage, t, [[0, { pos: [0.9, 0.9, 2.6], look: [0, 0.4, 0], fov: 58 }], [info.dur, { pos: [0.8, 0.8, 2.9], look: [0, 0.4, 0], fov: 60 }]], ease.sine); },
});
