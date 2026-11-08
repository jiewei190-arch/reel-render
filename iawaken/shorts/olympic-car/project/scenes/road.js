// road shots: s01 (the car overtaking = frame 1), s04-s07 (Lorz quits, hops in, breakdown, jogs), s08-s10 (Hicks + handlers), s19 (loop back to the car).
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, run, walk, tremble } from '/kits/toon3d/rig.js';
import { THREE, at, tag, closer, roadScene, oldCar, seat, runner, lorz, hicks, handler, driver, milePost, cup, egg, bottle, FX } from './_lib.js';

const SIT = { ...POSE.sit, armL: [0.5, 0.15, 0], armR: [0.5, 0.15, 0], elbowL: 0.6, elbowR: 0.6 };
const DRIVE = { ...POSE.sit, armL: [1.1, 0.0, 0], armR: [1.1, 0.0, 0], elbowL: 0.5, elbowR: 0.5 };
const wave = (t, k = 1) => ({ armR: [lerp(0.5, 0.9, k), lerp(0.15, 2.2, k), 0], elbowR: lerp(0.6, 0.9 + Math.sin(t * 14) * 0.5, k) });
const PI2 = Math.PI / 2;

// the car with Lorz lounging in the back + a driver; faces +X
function carRig(st, x = 0, z = 0) {
  const car = oldCar(); car.position.set(x, 0, z); car.rotation.y = PI2; st.add(car);
  const dr = driver(); seat(car, dr, 0.32); const lz = lorz(); seat(car, lz, -0.3, true);
  return { car, dr, lz };
}
// shared car pass (s01 + s19). tau = car time; at tau = 0 this is frame 1 of the Short.
function carPass(s, tau, gt) {
  const vx = 5.2, cx = -2.6 + tau * vx;
  s.car.position.set(cx, Math.abs(Math.sin(gt * 13)) * 0.035, 0.6); s.car.rotation.z = noise(gt * 5, 2) * 0.02; s.car.drive(cx);
  s.dr.pose(DRIVE); s.dr.face(EXPR.deadpan, gt);
  s.lz.pose(addPose({ ...SIT, ...wave(gt), twist: -0.35, headTurn: -0.9 }, idle(gt, 2))); s.lz.face({ ...EXPR.smug, pupil: [-0.2, 0] }, gt);
  s.R.forEach((r, i) => { const rx = -1.5 + i * 1.2 + tau * 1.5; r.position.set(rx, 0, [-1.0, 1.65][i]); r.pose(run(gt + i * 0.3, { speed: 1.9, amp: 1.0 })); r.face(mixExpr(EXPR.sad, { ...EXPR.shocked, pupil: [-0.6, 0] }, prog(cx, rx - 3.5, rx - 1.5)), gt); r.rotation.y = PI2; });
  s.dust.position.set(cx - 2.2, 0.1, 0.6); s.dust.update(gt);
  const camX = -2.3 + tau * 3.8; s.stage.cam([camX + 2.0, 2.9, 10.6], [camX, 1.4, 0.3], 40);
}
function passInit(T) { const s = roadScene(T, { target: [3, 0, 0], shadowSize: 12 }); Object.assign(s, carRig(s.stage)); s.R = [runner(0), runner(1)]; s.R.forEach(r => s.stage.add(r)); return s; }

// s01 "The Olympic marathon winner rode in a car." — frame 1: the car already overtaking two exhausted runners, Lorz waving
registerShot('s01', { kind: '3d', init: passInit, draw(s, t) { carPass(s, t, t); } });

// s19 "Subscribe for more." — LOOP: the same car pass arriving, ending exactly on frame 1's state (tau 0)
registerShot('s19', { kind: '3d', init: passInit,
  draw(s, t, info) { carPass(s, t - info.dur, t - info.dur); },
  overlay(g, t, info) { const a = at(info, 'Subscribe', 0.15); closer(g, 'Subscribe for more.', ease.out(prog(t, a - 0.05, a + 0.3))); },
});

// s04 "Fred Lorz quit at mile nine," — MILE 9 post, Lorz stops, hands on knees, puffing
registerShot('s04', { kind: '3d',
  init(T) { const s = roadScene(T, { target: [0, 0, 0], shadowSize: 8 }); s.post = milePost('MILE 9').at(1.6, 0, -1.9, 0.0); s.stage.add(s.post); s.lz = lorz(); s.lz.rotation.y = PI2 * 0.35; s.stage.add(s.lz); return s; },
  draw(s, t, info) { const q = at(info, 'quit', 0.5), k = ease.inOut(prog(t, q - 0.3, q + 0.3));
    s.lz.position.set(lerp(-2.4, 0, ease.out(prog(t, 0, q + 0.2))), 0, 0.3);
    const tired = { ...POSE.stand, lean: 0.55, armL: [0.95, 0.25, 0.2], armR: [0.95, 0.25, 0.2], elbowL: 0.25, elbowR: 0.25, kneeL: 0.25, kneeR: 0.25, legL: [0.2, 0.12], legR: [0.2, 0.12], headNod: -0.35 };
    s.lz.pose(mixPose(run(t, { speed: 1.6, amp: 0.8 }), addPose(tired, { bob: Math.sin(t * 9) * 0.03, lean: Math.sin(t * 9) * 0.04 }), k));
    s.lz.face(mixExpr(EXPR.sad, { ...EXPR.worried, mouth: 'open', pupil: [0, 0] }, k), t);
    s.dust.update(t); s.dust.position.set(-9, -3, 0);
    camMove(s.stage, t, [[0, { pos: [1.2, 2.1, 6.6], look: [0, 1.4, -0.2], fov: 40 }], [info.dur, { pos: [0.8, 1.9, 5.4], look: [0.3, 1.45, -0.3], fov: 40 }]]); },
  overlay(g, t) { tag(g, 'ST. LOUIS, 1904', ease.out(prog(t, 0.05, 0.35))); },
});

// s05 "and hopped in a car." — the car rolls up, Lorz hops into the back seat, thumbs up
registerShot('s05', { kind: '3d',
  init(T) { const s = roadScene(T, { target: [0, 0, 0], shadowSize: 9 }); Object.assign(s, carRig(s.stage)); s.lz.parent.remove(s.lz); s.stage.add(s.lz); return s; },
  draw(s, t, info) { const h = at(info, 'hopped', 0.25); const cx = lerp(-7, -0.6, ease.out(prog(t, 0, h + 0.1)));
    s.car.position.set(cx, Math.abs(Math.sin(t * 13)) * 0.03, -0.2); s.car.drive(cx); s.dr.pose(DRIVE); s.dr.face(EXPR.deadpan, t);
    const j = prog(t, h + 0.05, h + 0.5), je = ease.inOut(j);
    // from the roadside (z 1.6) up and into the back bench (car local z -0.85 -> world x cx - 0.85, world z = car z + 0.3)
    const sx = lerp(-0.85 + 0.0, cx - 0.85, je), sz = lerp(1.7, -0.2 + 0.3, je), sy = lerp(0, 0.73, je) + Math.sin(Math.PI * j) * 0.9;
    s.lz.position.set(j > 0 ? sx : -0.85, sy, j > 0 ? sz : 1.7); s.lz.rotation.y = lerp(PI2 * 0.6, PI2, je);
    const thumbs = ease.outBack(prog(t, h + 0.55, h + 0.8));
    s.lz.pose(j < 1 ? mixPose({ ...POSE.stand, lean: 0.3, headNod: -0.1 }, SIT, je) : addPose({ ...SIT, armR: [lerp(0.5, 2.5, thumbs), 0.3, 0], elbowR: lerp(0.6, 1.3, thumbs), headTurn: -0.8 * thumbs }, idle(t)));
    s.lz.face(t < h ? EXPR.sad : EXPR.grin, t);
    s.dust.update(t); s.dust.position.set(cx - 2, 0.1, -0.2);
    camMove(s.stage, t, [[0, { pos: [2.6, 3.0, 10.4], look: [-1.0, 1.4, 0], fov: 40 }], [info.dur, { pos: [2.2, 2.8, 9.4], look: [-0.9, 1.5, 0], fov: 40 }]]); },
});

// s06 "When it broke down," — MILE 19: steam bursts from the bonnet, the car shudders and stops
registerShot('s06', { kind: '3d',
  init(T) { const s = roadScene(T, { target: [0, 0, 0], shadowSize: 9 }); Object.assign(s, carRig(s.stage)); s.post = milePost('MILE 19').at(3.2, 0, -1.9); s.stage.add(s.post);
    s.steam = FX.smoke({ count: 14, size: 0.6, rise: 0.9, life: 1.4, spread: 0.6, drift: [0.2, 0], color: '#f4f2ee', seed: 3 }); s.stage.add(s.steam); return s; },
  draw(s, t, info) { const b = at(info, 'broke', 0.25), stop = ease.out(prog(t, 0, b + 0.35)); const cx = lerp(-1.6, 0.6, stop);
    s.car.position.set(cx, (t > b ? Math.abs(Math.sin(t * 31)) * 0.05 * (1 - prog(t, b, b + 0.8)) : Math.abs(Math.sin(t * 13)) * 0.03), 0); s.car.drive(cx); s.car.rotation.z = t > b ? Math.sin(t * 40) * 0.02 * (1 - prog(t, b, b + 0.8)) : 0;
    s.steam.visible = t > b - 0.05; s.steam.position.set(cx + 1.3, 1.45, 0); s.steam.update(t - b);
    s.dr.pose(DRIVE); s.dr.face(t > b + 0.3 ? { ...EXPR.deadpan, pupil: [-0.4, 0] } : EXPR.deadpan, t);
    s.lz.pose(addPose({ ...SIT, headTurn: t > b + 0.3 ? -0.9 : 0 }, idle(t))); s.lz.face(t > b + 0.2 ? { ...EXPR.shocked, pupil: [-0.3, 0] } : EXPR.happy, t);
    s.dust.update(t); s.dust.position.set(cx - 2, 0.1, 0);
    camMove(s.stage, t, [[0, { pos: [3.8, 2.8, 10.2], look: [0.6, 1.5, 0], fov: 40 }], [info.dur, { pos: [3.4, 2.6, 9.0], look: [0.8, 1.55, 0], fov: 40 }]]); },
});

// s07 "he jogged the rest." — Lorz hops out and jogs off, fresh; the driver stares at the lens (reaction)
registerShot('s07', { kind: '3d',
  init(T) { const s = roadScene(T, { target: [1, 0, 0], shadowSize: 9 }); Object.assign(s, carRig(s.stage, 0.6, 0)); s.lz.parent.remove(s.lz); s.stage.add(s.lz);
    s.steam = FX.smoke({ count: 10, size: 0.45, rise: 0.8, life: 1.6, spread: 0.5, drift: [0.15, 0], color: '#f4f2ee', seed: 4 }); s.steam.position.set(1.9, 1.45, 0); s.stage.add(s.steam); return s; },
  draw(s, t, info) { s.steam.update(t + 2); const j = at(info, 'jogged', 0.25);
    const x = lerp(0.6 - 0.85, 4.8, ease.in(prog(t, j - 0.1, info.dur + 0.4))) ; s.lz.position.set(x, 0, 1.55); s.lz.rotation.y = PI2 * 0.75;
    s.lz.pose(addPose(run(t, { speed: 1.5, amp: 0.85 }), { lean: -0.05, headTurn: -0.6 })); s.lz.face({ ...EXPR.happy, pupil: [-0.3, 0] }, t);
    s.dr.pose(addPose({ ...DRIVE, headTurn: lerp(0, -1.0, ease.inOut(prog(t, j + 0.3, j + 0.8))) }, idle(t))); s.dr.face({ ...EXPR.deadpan, lid: 0.55, pupil: [lerp(0, -0.5, prog(t, j + 0.3, j + 0.8)), 0] }, t);
    s.dust.update(t); s.dust.position.set(-9, -3, 0);
    s.stage.cam([lerp(1.4, x + 1.6, prog(t, 0, info.dur)), 2.6, 9.6], [lerp(0.4, x + 0.6, prog(t, 0, info.dur)), 1.45, 0.5], 40); },
  overlay(g, t) { tag(g, 'MILE 19', ease.out(prog(t, 0.0, 0.3))); },
});

// Hicks + two handlers, running toward the camera along +X. Shared by s08-s10.
function hicksInit(T, o = {}) { const s = roadScene(T, { target: [0, 0, 0], shadowSize: 8 }); s.h = hicks(); s.a = handler(0); s.b = handler(1); [s.h, s.a, s.b].forEach(b => { b.rotation.y = PI2; s.stage.add(b); });
  s.cup = cup(); s.a.hold('R', s.cup); s.cup.position.set(0, -0.05, 0.1);
  if (o.props) { s.egg = egg(); s.b.hold('L', s.egg); s.egg.position.set(0, -0.02, 0.12); s.br = bottle('#7a4a1e', 0.42); s.b.hold('R', s.br); s.br.position.set(0, -0.12, 0.05); s.med = bottle('#4a6a7a', 0.26); s.a.hold('L', s.med); s.med.position.set(0, -0.1, 0.05); }
  return s; }
function hicksRun(s, t, x0 = 0) { const x = x0 + t * 1.0; const shuffle = run(t, { speed: 1.35, amp: 0.55 }); shuffle.lean = 0.12; shuffle.headNod = 0.18;
  s.h.position.set(x, 0, 0.2); s.h.pose(addPose(shuffle, { side: Math.sin(t * 4.2) * 0.05 }));
  s.a.position.set(x + 0.3, 0, 1.35); s.b.position.set(x - 0.4, 0, -1.0);
  s.dust.update(t); s.dust.position.set(-9, -3, 0); return x; }

// s08 "The real winner, Thomas Hicks," — Hicks shuffles toward camera, exhausted but going; handlers jog beside
registerShot('s08', { kind: '3d', init: (T) => hicksInit(T),
  draw(s, t, info) { const x = hicksRun(s, t, -2); s.h.face({ ...EXPR.sad, lid: 0.6, mouth: 'open', pupil: [0, 0] }, t);
    s.a.pose(addPose(run(t + 0.2, { speed: 1.35, amp: 0.5 }), { armR: [1.2, 0.2, 0.4], elbowR: 0.9, headTurn: 0.6 })); s.a.face(EXPR.worried, t);
    s.b.pose(addPose(run(t + 0.5, { speed: 1.35, amp: 0.5 }), { headTurn: -0.5 })); s.b.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [x + 6.8, 1.9, 3.2], look: [x, 1.55, 0.1], fov: 38 }], [info.dur, { pos: [x + 5.2, 1.85, 2.6], look: [x, 1.6, 0.1], fov: 38 }]]); },
  overlay(g, t) { tag(g, 'THE REAL WINNER', ease.out(prog(t, 0.1, 0.4))); },
});

// s09 "was kept going with strychnine," — close on the handler's little bottle + cup, offered to Hicks
registerShot('s09', { kind: '3d', init: (T) => hicksInit(T, { props: true }),
  draw(s, t, info) { const x = hicksRun(s, t, 0.2); s.h.face({ ...EXPR.sad, lid: 0.55, pupil: [0.4, -0.1] }, t);
    s.a.pose(addPose(run(t + 0.2, { speed: 1.35, amp: 0.4 }), { armR: [1.35, -0.2, 0.3], elbowR: 0.7, armL: [1.25, -0.1, 0.3], elbowL: 0.8, headTurn: 0.7 })); s.a.face({ ...EXPR.neutral, pupil: [0.5, 0] }, t);
    s.b.pose(run(t + 0.5, { speed: 1.35, amp: 0.5 })); s.b.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [x + 5.6, 2.5, 2.4], look: [x, 1.5, 0.3], fov: 36 }], [info.dur, { pos: [x + 5.0, 2.4, 2.1], look: [x, 1.55, 0.3], fov: 35 }]]); },
  overlay(g, t) { tag(g, 'LEGAL IN 1904', ease.out(prog(t, 0.15, 0.45))); },
});

// s10 "egg whites, and brandy." — the other handler holds up an egg, then the brandy bottle; Hicks keeps shuffling
registerShot('s10', { kind: '3d', init: (T) => hicksInit(T, { props: true }),
  draw(s, t, info) { const x = hicksRun(s, t, 1.8); const e = at(info, 'egg', 0.05), br = at(info, 'brandy', 0.9);
    s.h.face({ ...EXPR.deadpan, lid: 0.62, pupil: [0, 0] }, t);
    const upE = ease.outBack(prog(t, e, e + 0.3)), upB = ease.outBack(prog(t, br - 0.1, br + 0.2));
    s.b.pose(addPose(run(t + 0.5, { speed: 1.35, amp: 0.35 }), { armL: [lerp(0, 2.2, upE), 0.2, 0], elbowL: 0.4, armR: [lerp(0, 2.3, upB), 0.15, 0], elbowR: 0.4, headTurn: -0.4 })); s.b.face(EXPR.happy, t);
    s.a.pose(addPose(run(t + 0.2, { speed: 1.35, amp: 0.45 }), { armR: [1.0, 0.2, 0.3], elbowR: 1.0 })); s.a.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [x + 6.2, 2.0, -3.6], look: [x - 0.2, 1.6, -0.3], fov: 38 }], [info.dur, { pos: [x + 5.4, 1.95, -3.0], look: [x - 0.2, 1.65, -0.3], fov: 37 }]]); },
});
