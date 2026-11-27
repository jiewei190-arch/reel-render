// What if you fell into a black hole? — 22 shots, Toon 3D + BEANMEN effects. A THOUGHT EXPERIMENT (said in line 2, chip on s03).
// Tone: cartoon physics. The astronaut stretches like a rubber noodle and looks puzzled, never hurt; nothing breaks, no gore.
// Loop: s22 replays s01's drift backwards in time, so the last frame is s01's frame 1 (same camera, same pose).
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, project } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import {
  at, THREE, spaceStage, astronaut, friend, scientist, blackHole, rocket, noReturnSign, spaghettiPlate,
  topCaption, richLine, stamp, chip, arrow, clock, binocs, insT, CARD_INK, glow, ball, cyl, rbox, toon, flat, outline,
} from './_lib.js';

const HOOK = (g, t, info) => topCaption(g, t + info.shot.start, [['WHAT IF', '#ffd25a'], ['you fell into', '#ffffff']], [['a', '#ffffff'], ['BLACK HOLE?', '#ff5a4a']], { until: 3.5, still: info.shot.start > 0 });
const FLOAT = (t, sd = 1) => ({ ...idle(t, sd, 0.7), armL: [0.25 + Math.sin(t * 1.3 + sd) * 0.15, 0.55, 0], armR: [0.2 + Math.sin(t * 1.1 + sd) * 0.15, 0.55, 0], legL: [0.15 + Math.sin(t * 1.2) * 0.12, 0.08], legR: [-0.1 + Math.sin(t * 1.4) * 0.12, 0.08], kneeL: 0.35, kneeR: 0.2 });
const pose = (a, base, t, sd = 1) => a.pose(addPose(base, FLOAT(t, sd)));

// ---------------------------------------------------------------- frame-1 set: a SMALL black hole below-right, astronaut drifting feet-first
function smallSet(T, o = {}) {
  const s = spaceStage(T, { seed: o.seed || 7, fov: 40 });
  s.bh = blackHole({ r: 1.0, disk: 4.0, tilt: -1.25 }); s.bh.position.set(1.3, -3.4, -3); s.stage.add(s.bh);
  s.a = astronaut(); s.stage.add(s.a);
  return s;
}
const F1 = { pos: [0.2, 0.6, 10.2], look: [0.3, -0.5, 0], fov: 42 };
// state of the frame-1 drift at time u (u may be negative: s22 rewinds into it)
function drift(s, u) {
  s.a.position.set(-0.3 + u * 0.05, -1.35 - u * 0.1, 0); s.a.rotation.set(0, 0.25 + Math.sin(u * 0.6) * 0.08, 0.38 + u * 0.03);
  s.a.stretch(1.08 + Math.max(0, u) * 0.05); pose(s.a, POSE.stand, u, 3); s.a.face(mixExpr(EXPR.worried, EXPR.shocked, 0.35), u);
  s.bh.update(u + 10, s.stage.camera); s.update(u + 10);
}

// s01 — FRAME 1 / HOOK. Already moving: the astronaut tumbles feet-first toward a small black hole; top caption on frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return smallSet(T); },
  draw(s, t, info) { camMove(s.stage, t, [[0, F1], [info.dur, { pos: [0.2, 0.5, 9.2], look: [0.3, -0.6, 0], fov: 42 }]], ease.out); drift(s, t); },
  overlay(g, t, info, s) { HOOK(g, t, info); reactions(g, t, s, [{ fx: 'sweat', on: 'a', at: 0.7, scale: 0.8 }, { fx: 'speedlines', at: 0.0, until: info.dur }]); },
});
// s02 — "...you'd turn into SPAGHETTI." Close: SNAP, he stretches into a long noodle. Puzzled, not hurt.
registerShot('s02', { kind: '3d',
  init(T) { return smallSet(T, { seed: 8 }); },
  draw(s, t, info) {
    const w = at(info, 'spaghetti', 0.4) + 0.05, k = ease.outBack(prog(t, w, w + 0.35));
    s.a.position.set(-0.3, -1.4 - k * 1.6, 0); s.a.rotation.set(0, 0.2, 0.3); s.a.stretch(1.1 + k * 1.8);
    pose(s.a, mixPose(POSE.stand, POSE.armsUp, k), t, 3); s.a.face(mixExpr(EXPR.worried, EXPR.shocked, k), t);
    s.bh.update(t + 12, s.stage.camera); s.update(t + 12);
    camMove(s.stage, t, [[0, { pos: [0, 0.8, 8.0], look: [0, 0.0, 0], fov: 46 }], [info.dur, { pos: [0, 0.8, 9.6], look: [0, -0.2, 0], fov: 50 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: w, amp: 0.06, dur: 0.3 }]);
  },
  overlay(g, t, info, s) { HOOK(g, t, info); const w = at(info, 'spaghetti', 0.4) + 0.05;
    reactions(g, t, s, [{ fx: 'exclaim', on: 'a', at: w + 0.05, color: '#ff3b30' }, { fx: 'flash', at: w, dur: 0.18 }]);
    stamp(g, t, 'SPAGHETTI?!', { at: w + 0.15, x: 560, y: 1150, size: 92, color: '#ffffff', fill: '#e8413a', rot: -0.07 }); },
});

// s03 — "It's a THOUGHT EXPERIMENT..." Normal-size astronaut floats, chin in hand; thought cloud; chip.
registerShot('s03', { kind: '3d',
  init(T) { const s = spaceStage(T, { seed: 11 }); s.a = astronaut(); s.stage.add(s.a); s.mini = blackHole({ r: 0.35, disk: 3.6, tilt: -1.3, halo: 0.2 }); s.mini.position.set(1.25, 3.6, -0.5); s.stage.add(s.mini); return s; },
  draw(s, t, info) { s.update(t); s.mini.update(t, s.stage.camera); s.a.position.set(-0.3, Math.sin(t * 1.4) * 0.05, 0); s.a.rotation.set(0, 0.25, 0.05);
    s.a.stretch(1); s.a.pose(addPose(POSE.thinking, idle(t, 4, 0.6))); s.a.face({ ...EXPR.suspicious, pupil: [0.6, 0.6] }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.2, 6.6], look: [0.3, 2.2, 0], fov: 38 }], [info.dur, { pos: [0.3, 2.2, 6.0], look: [0.3, 2.25, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { HOOK(g, t, info);
    g.save(); g.globalAlpha = 0.95 * clamp(t / 0.2); g.fillStyle = '#ffffff'; g.strokeStyle = CARD_INK; g.lineWidth = 7;
    [[600, 1000, 18], [650, 930, 28]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke(); }); g.restore();
    chip(g, t, 'THOUGHT EXPERIMENT', "don't try this at home", { at: at(info, 'thought', 0.2) - 0.05, y: 560, w: 860, size: 72, color: '#6a3ad0' }); },
});
// s04 — "...what SCIENTISTS say would happen." A scientist with a hologram black hole, pointing.
registerShot('s04', { kind: '3d',
  init(T) { const s = spaceStage(T, { seed: 12, bg: ['#0b0a24', '#1b1450', '#2a2060'] }); s.sc = scientist(); s.sc.position.set(-0.7, 0, 0); s.sc.rotation.y = 0.35; s.stage.add(s.sc);
    s.holo = blackHole({ r: 0.4, disk: 3.4, tilt: -1.2, halo: 0.25 }); s.holo.position.set(1.0, 1.9, 0.2); s.stage.add(s.holo);
    s.pad = cyl(0.55, 0.6, 0.12, '#5a6a8a', 1.0, 0.06, 0.2, 28); outline(s.pad, { px: 2.4 }); s.stage.add(s.pad); s.beam = glow(2.6, '#7fd0ff', 0.35); s.beam.position.set(1.0, 1.1, 0.2); s.stage.add(s.beam);
    s.floor = new THREE.Mesh(new THREE.CircleGeometry(4, 40), toon('#2a2850')); s.floor.rotation.x = -Math.PI / 2; s.floor.userData.noOutline = true; s.stage.add(s.floor); return s; },
  draw(s, t, info) { s.update(t); s.holo.update(t, s.stage.camera); const p = ease.out(prog(t, 0.15, 0.45));
    s.sc.pose(point(addPose(POSE.stand, idle(t, 5, 0.6)), 'L', p, { up: 0.3 })); s.sc.face(mixExpr(EXPR.neutral, EXPR.happy, 0.5), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.0, 6.4], look: [0.2, 1.6, 0], fov: 38 }], [info.dur, { pos: [0.2, 1.95, 5.8], look: [0.2, 1.6, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { chip(g, t, 'WHAT SCIENTISTS SAY', 'NASA + astronomers', { at: 0.1, y: 470, w: 820, size: 70, color: '#2f6ad0' }); reactions(g, t, s, [{ fx: 'sparkle', on: 'holo', at: 0.2, scale: 0.7 }]); },
});

// s05 — "Near a small one, gravity pulls your FEET harder than your HEAD." Feet-first toward the hole; two arrows (big at the feet).
function feetSet(T) { const s = spaceStage(T, { seed: 13 }); s.bh = blackHole({ r: 0.9, disk: 4.0, tilt: -1.2 }); s.bh.position.set(0, -4.4, -2); s.stage.add(s.bh); s.a = astronaut(); s.stage.add(s.a); return s; }
registerShot('s05', { kind: '3d',
  init(T) { return feetSet(T); },
  draw(s, t, info) { s.update(t); s.bh.update(t, s.stage.camera); s.a.position.set(0, -0.6 - t * 0.08, 0); s.a.rotation.set(0, 0, 0.04); s.a.stretch(1.05);
    pose(s.a, POSE.stand, t, 5); s.a.face(mixExpr(EXPR.neutral, EXPR.worried, prog(t, 0.6, 1.0)), t);
    camMove(s.stage, t, [[0, { pos: [0, 0.4, 9.5], look: [0, -1.0, 0], fov: 50 }], [info.dur, { pos: [0, 0.3, 9.0], look: [0, -1.0, 0], fov: 50 }]]); },
  overlay(g, t, info, s) {
    const f = at(info, 'feet', 0.8), h = at(info, 'head', 1.6);
    const ft = project(s.stage, [s.a.position.x, s.a.position.y + 0.1, 0]), hd = project(s.stage, [s.a.position.x, s.a.position.y + 2.2, 0]);
    const kf = ease.out(prog(t, f - 0.1, f + 0.2)), kh = ease.out(prog(t, h - 0.1, h + 0.2));
    arrow(g, ft.x - 230, ft.y - 60, ft.x - 230, ft.y + 220, { k: kf, w: 60, color: '#ff3b30' }); arrow(g, ft.x + 230, ft.y - 60, ft.x + 230, ft.y + 220, { k: kf, w: 60, color: '#ff3b30' });
    if (t > f) insT(g, 'STRONG PULL', ft.x, ft.y + 290, 60, { color: '#ff5a4a', stroke: CARD_INK });
    arrow(g, hd.x + 250, hd.y - 50, hd.x + 250, hd.y + 30, { k: kh, w: 24, color: '#7fd0ff' }); if (t > h) insT(g, 'weak pull', hd.x + 250, hd.y - 95, 46, { color: '#9fe0ff', stroke: CARD_INK });
    chip(g, t, 'SMALL BLACK HOLE', 'a few times the Sun', { at: 0.05, until: f - 0.05, y: 360, w: 760, size: 62, color: '#e8413a' });
  },
});
// s06 — "...harder than your head." Close on the legs: they lengthen, he looks down. Sweat.
registerShot('s06', { kind: '3d',
  init(T) { return feetSet(T); },
  draw(s, t, info) { s.update(t); s.bh.update(t + 3, s.stage.camera); const k = ease.inOut(prog(t, 0.1, info.dur));
    s.a.position.set(0, 0.6 - k * 0.6, 0); s.a.rotation.set(0, 0.3, 0.04); s.a.stretch(1.05 + k * 0.5);
    s.a.pose(addPose(mixPose(POSE.stand, POSE.panic, 0.4), { ...FLOAT(t, 6), headNod: 0.45, legL: [0, 0], legR: [0, 0], kneeL: 0, kneeR: 0 })); s.a.face({ ...EXPR.worried, pupil: [0, -1] }, t);
    camMove(s.stage, t, [[0, { pos: [1.6, 2.6, 6.8], look: [0, 1.0, 0], fov: 44 }], [info.dur, { pos: [1.5, 2.4, 6.2], look: [0, 0.8, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sweat', on: 'a', at: 0.1 }, { fx: 'question', on: 'a', at: 0.5, scale: 0.7 }]); },
});

// s07 — "You'd stretch long and thin." Mid shot: boing, a long noodle astronaut. Speedlines.
registerShot('s07', { kind: '3d',
  init(T) { return smallSet(T, { seed: 14 }); },
  draw(s, t, info) { s.update(t); s.bh.update(t + 5, s.stage.camera); const l = at(info, 'long', 0.3), k = ease.outBack(prog(t, l - 0.1, l + 0.4)), th = at(info, 'thin', 0.9), q = ease.outBack(prog(t, th - 0.1, th + 0.25));
    s.a.position.set(-0.3, lerp(-1.0, -3.6, k), 0); s.a.rotation.set(0, 0.15, 0.22); s.a.stretch(1 + k * 2.2, 1 / Math.sqrt(1 + k * 2.2) * (1 - q * 0.35));
    pose(s.a, mixPose(POSE.stand, POSE.armsUp, 0.7), t, 7); s.a.face(mixExpr(EXPR.shocked, { ...EXPR.deadpan, pupil: [0, 0] }, q), t);
    camMove(s.stage, t, [[0, { pos: [0, 0.6, 12.5], look: [0.2, 0.2, 0], fov: 50 }], [info.dur, { pos: [0, 0.6, 12.0], look: [0.2, 0.2, 0], fov: 50 }]]); },
  overlay(g, t, info, s) { const l = at(info, 'long', 0.3); reactions(g, t, s, [{ fx: 'speedlines', at: l - 0.1, until: l + 0.8 }, { fx: 'stars', on: 'a', at: l + 0.3, scale: 0.8 }]);
    stamp(g, t, 'LONG', { at: l, x: 300, y: 560, size: 80, color: '#ffffff', fill: '#e8413a', rot: -0.1 }); stamp(g, t, 'THIN', { at: at(info, 'thin', 0.9), x: 780, y: 760, size: 64, color: '#ffffff', fill: '#6a3ad0', rot: 0.1 }); },
});
// s08 — "Scientists really call it SPAGHETTIFICATION." The real term, stamped over a plate of spaghetti; noodle astronaut beside it.
registerShot('s08', { kind: '3d',
  init(T) { const s = spaceStage(T, { seed: 15 }); s.p = spaghettiPlate(); s.p.position.set(0.9, 0.2, 0.6); s.p.rotation.x = 0.35; s.stage.add(s.p); s.a = astronaut(); s.a.position.set(-1.0, -2.4, 0); s.stage.add(s.a); return s; },
  draw(s, t, info) { s.update(t); s.p.rotation.y = t * 0.4; s.p.position.y = 0.2 + Math.sin(t * 1.5) * 0.05; s.a.stretch(2.4); s.a.rotation.set(0, 0.35, 0.05);
    const w = at(info, 'spaghettification', 0.9); s.a.pose(addPose(shrug(POSE.stand, ease.out(prog(t, w, w + 0.3))), idle(t, 8, 0.6))); s.a.face(mixExpr(EXPR.deadpan, EXPR.grin, prog(t, w + 0.4, w + 0.7)), t);
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 11.0], look: [0, 1.2, 0], fov: 50 }], [info.dur, { pos: [0, 1.4, 10.4], look: [0, 1.2, 0], fov: 50 }]]); },
  overlay(g, t, info, s) { const w = at(info, 'spaghettification', 0.9);
    chip(g, t, 'REAL SCIENCE WORD:', null, { at: 0.05, y: 360, w: 760, size: 60, color: '#2f6ad0' });
    stamp(g, t, 'SPAGHETTIFICATION', { at: w - 0.05, x: 540, y: 520, size: 74, color: '#ffffff', fill: '#e8413a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: w, scale: 1.0 }]); },
});

// ---------------------------------------------------------------- the SUPERMASSIVE one: huge, gentle at the edge
function bigSet(T, o = {}) { const s = spaceStage(T, { seed: o.seed || 21, fov: 44 }); s.bh = blackHole({ r: 9, disk: 3.6, tilt: -1.32, hot: '#ffe0a0', warm: '#ff9a3a', cool: '#a03a8a', halo: 0.3, spin: 0.08 }); s.bh.position.set(0, 9, -26); s.stage.add(s.bh);
  s.a = astronaut(); s.stage.add(s.a); return s; }
// s09 — "BUT a SUPERMASSIVE black hole..." Whip: a giant hole fills the sky; the astronaut is tiny in front of it.
const S09 = { init(T) { return bigSet(T); },
  draw(s, t, info) { s.update(t); s.bh.update(t, s.stage.camera); s.a.position.set(0.2, -0.4, 0); s.a.rotation.set(0, 0.0, 0.1); s.a.stretch(1); pose(s.a, POSE.stand, t, 9);
    s.a.face(mixExpr(EXPR.shocked, { ...EXPR.shocked, pupil: [0, 1] }, 0.6), t);
    camMove(s.stage, t, [[0, { pos: [0, -1.5, 11], look: [0, 4.5, -10], fov: 52 }], [info.dur, { pos: [0, -1.6, 9.5], look: [0, 4.6, -10], fov: 52 }]], ease.out); },
  overlay(g, t, info, s) { const w = at(info, 'supermassive', 0.3); stamp(g, t, 'SUPERMASSIVE', { at: w, x: 540, y: 340, size: 88, color: '#ffffff', fill: '#a03ad0', rot: -0.06 });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'a', at: w + 0.1, color: '#ffd25a', scale: 0.8 }]); } };
registerShot('s09', { kind: '3d', ...S09 });
// s10 — INSERT CARD: "about 4 million times the Sun's mass"
insertShot('s10', { scene: S09, insert: { type: 'bigtext', kicker: 'ABOUT', title: '4,000,000', lines: ["× the Sun's mass"], color: '#ffd25a' } });
// s11 — "...is DIFFERENT." The astronaut relaxes: thumbs-up-ish wave, smile.
registerShot('s11', { kind: '3d',
  init(T) { return bigSet(T, { seed: 22 }); },
  draw(s, t, info) { s.update(t); s.bh.update(t + 2, s.stage.camera); s.a.position.set(0, 0, 0); s.a.rotation.set(0, 0.2, 0.05); s.a.stretch(1);
    const k = ease.outBack(prog(t, 0.05, 0.35)); s.a.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [0.4, 2.4, 0], elbowR: 1.2 }, k), idle(t, 10, 0.6))); s.a.face(mixExpr(EXPR.neutral, EXPR.happy, k), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.2, 5.0], look: [0, 1.8, 0], fov: 40 }], [info.dur, { pos: [0.4, 2.2, 4.6], look: [0, 1.85, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'a', at: 0.1, scale: 0.8 }]); },
});
// s12 — "The stretch at its edge is so GENTLE..." He floats toward the giant hole, relaxed, sign ahead: POINT OF NO RETURN.
function edgeSet(T, o = {}) { const s = bigSet(T, o); s.sign = noReturnSign(); s.stage.add(s.sign); return s; }
registerShot('s12', { kind: '3d',
  init(T) { return edgeSet(T, { seed: 23 }); },
  draw(s, t, info) { s.update(t); s.bh.update(t + 4, s.stage.camera); s.a.position.set(-0.6 + t * 0.15, 0.3, -t * 0.6); s.a.rotation.set(0, Math.PI * 0.85, 0.08); s.a.stretch(1);
    s.a.pose(addPose(POSE.relaxed, { ...FLOAT(t, 11), armL: [0.2, 1.4, 0], armR: [0.2, 1.4, 0], elbowL: 1.6, elbowR: 1.6 })); s.a.face(EXPR.happy, t);
    s.sign.position.set(1.4, 1.2, -5); s.sign.rotation.set(0, -0.3, 0.06 + Math.sin(t) * 0.03);
    camMove(s.stage, t, [[0, { pos: [0.6, 1.8, 6.5], look: [0, 1.6, -6], fov: 44 }], [info.dur, { pos: [0.6, 1.8, 5.6], look: [0, 1.7, -6], fov: 44 }]]); },
  overlay(g, t, info, s) { const w = at(info, 'gentle', 1.2); chip(g, t, 'BARELY ANY STRETCH', 'at a giant one\'s edge', { at: w - 0.05, y: 1160, w: 800, size: 62, color: '#2f8a5a' }); },
});
// s13 — "...you'd CROSS the point of no return..." He drifts past the sign, waving at it, oblivious.
registerShot('s13', { kind: '3d',
  init(T) { return edgeSet(T, { seed: 24 }); },
  draw(s, t, info) { s.update(t); s.bh.update(t + 6, s.stage.camera); const x = lerp(-2.6, 1.6, t / info.dur); s.a.position.set(x, 2.5, 0.4); s.a.rotation.set(0, 0.9, 0.05); s.a.stretch(1);
    const wv = Math.sin(t * 9) * 0.3; s.a.pose(addPose(POSE.relaxed, { ...FLOAT(t, 12), armR: [0.2, 2.6 + wv, 0], elbowR: 0.6 })); s.a.face(EXPR.grin, t);
    s.sign.position.set(0, 1.1, -0.6); s.sign.rotation.set(0, 0, 0.05);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 9.0], look: [0, 2.1, 0], fov: 46 }], [info.dur, { pos: [0, 2.0, 8.4], look: [0, 2.1, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { const c = at(info, 'cross', 0.2); reactions(g, t, s, [{ fx: 'sparkle', on: 'sign', at: c + 0.4 }, { fx: 'hearts', on: 'a', at: c + 0.6, scale: 0.6 }]); },
});
// s14 — "...without noticing." Close-up: deadpan shrug, "???". Nothing happened (yet).
registerShot('s14', { kind: '3d',
  init(T) { return bigSet(T, { seed: 25 }); },
  draw(s, t, info) { s.update(t); s.bh.update(t + 8, s.stage.camera); s.a.position.set(0, 0, 0); s.a.rotation.set(0, 0.15, 0); s.a.stretch(1);
    s.a.pose(addPose(shrug(POSE.stand, ease.out(prog(t, 0.15, 0.45))), idle(t, 13, 0.6))); s.a.face({ ...EXPR.deadpan, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.15, 3.3], look: [0, 2.0, 0], fov: 38 }], [info.dur, { pos: [0.2, 2.15, 3.0], look: [0, 2.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'a', at: 0.2 }]); chip(g, t, 'NO RETURN... NO NOTICE', null, { at: 0.25, y: 1150, w: 820, size: 58, color: '#6a3ad0' }); },
});

// ---------------------------------------------------------------- the friend, far away
// s15 — "BUT to a FRIEND watching from far away..." Iris in: a little rocket far off, a friend with binoculars at the window.
registerShot('s15', { kind: '3d',
  init(T) { const s = spaceStage(T, { seed: 31 }); s.r = rocket(); s.r.position.set(-1.9, 0.2, -1.5); s.r.rotation.z = 0.15; s.stage.add(s.r); s.f = friend(); s.f.position.set(0.5, -0.4, 0.6); s.f.rotation.y = -0.5; s.stage.add(s.f); s.f.hand.R.add(s.f.bin);
    s.bh = blackHole({ r: 0.5, disk: 3.6, tilt: -1.3, halo: 0.3 }); s.bh.position.set(-6, 5, -30); s.stage.add(s.bh); return s; },
  draw(s, t, info) { s.update(t); s.bh.update(t, s.stage.camera); s.r.position.y = 0.2 + Math.sin(t * 1.2) * 0.06; s.f.position.y = -0.4 + Math.sin(t * 1.4 + 1) * 0.05;
    s.f.pose(addPose(POSE.stand, { ...idle(t, 14, 0.5), armL: [1.5, 0.3, 0], armR: [1.5, -0.3, 0], elbowL: 1.4, elbowR: 1.4, headNod: -0.15 })); s.f.face(EXPR.neutral, t);
    s.f.bin.position.set(-0.06, 0.12, 0.15); s.f.bin.rotation.set(-0.3, 0, 0);
    camMove(s.stage, t, [[0, { pos: [1.2, 1.4, 8.4], look: [-0.3, 1.0, 0], fov: 42 }], [info.dur, { pos: [1.0, 1.4, 7.6], look: [-0.3, 1.0, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { chip(g, t, 'YOUR FRIEND', 'far, far away', { at: at(info, 'friend', 0.3) - 0.05, y: 420, w: 640, size: 64, color: '#6a3ad0' }); },
});
// binocular POV at the giant hole's edge: the astronaut, tiny, slowing, reddening, freezing (u = 0..1 freeze amount)
function povSet(T) { const s = bigSet(T, { seed: 33 }); return s; }
function povDraw(s, t, ph, frz, cam) { s.update(t); s.bh.update(t * (1 - frz * 0.95) + 20, s.stage.camera); s.a.position.set(0, 1.0, 0); s.a.rotation.set(0, Math.PI * 0.9, 0.1); s.a.stretch(1);
  s.a.pose(addPose(POSE.relaxed, { ...FLOAT(ph, 15), armR: [0.3, 2.5 + Math.sin(ph * 6) * 0.35, 0], elbowR: 0.5 })); s.a.face(EXPR.happy, ph);
  camMove(s.stage, t, cam); }
// s16 — "...you'd NEVER quite get there." Binoculars up: he's at the edge, waving back. A bit slow already.
registerShot('s16', { kind: '3d',
  init(T) { return povSet(T); },
  draw(s, t, info) { povDraw(s, t, t * 0.7, 0.2, [[0, { pos: [0, 2.4, 9], look: [0, 2.2, 0], fov: 56 }], [info.dur, { pos: [0, 2.4, 8.4], look: [0, 2.2, 0], fov: 56 }]]); },
  overlay(g, t, info, s) { binocs(g, ease.out(prog(t, 0, 0.3))); const n = at(info, 'never', 0.6); stamp(g, t, 'NEVER QUITE THERE', { at: n, x: 540, y: 1270, size: 64, color: '#ffffff', fill: '#e8413a', rot: -0.04 }); },
});
// s17 — "You'd SLOW down, fade to RED, and seem to FREEZE..." Same POV: the wave slows, the picture goes red and dim, then stops.
registerShot('s17', { kind: '3d',
  init(T) { return povSet(T); },
  draw(s, t, info) { const fr = at(info, 'freeze', info.dur * 0.8), sl = at(info, 'slow', 0.1);
    const ph = t < sl ? t : sl + (1 - Math.exp(-(t - sl) * 1.4)) / 1.4; const frz = clamp(prog(t, sl, fr));
    const cut = at(info, 'fade', 1.2) - 0.08, cam = t < cut ? [[0, { pos: [0, 2.4, 8.0], look: [0, 2.2, 0], fov: 52 }], [cut, { pos: [0, 2.4, 7.7], look: [0, 2.2, 0], fov: 52 }]]
      : [[cut, { pos: [0.4, 2.4, 6.0], look: [0, 2.2, 0], fov: 44 }], [info.dur, { pos: [0.4, 2.4, 5.6], look: [0, 2.2, 0], fov: 44 }]];
    povDraw(s, t, Math.min(ph, sl + (1 - Math.exp(-(fr - sl) * 1.4)) / 1.4) + 3, frz, cam); },
  overlay(g, t, info, s) { const fr = at(info, 'freeze', info.dur * 0.8), rd = at(info, 'red', 1.0), r = clamp(prog(t, rd - 0.2, fr));
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(255,${Math.round(255 - r * 170)},${Math.round(255 - r * 190)})`; g.fillRect(0, 0, E.W, E.H); g.restore();
    g.save(); g.fillStyle = `rgba(10,0,6,${r * 0.35})`; g.fillRect(0, 0, E.W, E.H); g.restore();
    binocs(g, 1);
    const sl = at(info, 'slow', 0.1), hand = t < sl ? t * 0.8 : sl * 0.8 + (1 - Math.exp(-(t - sl) * 1.2)) * 0.5; clock(g, 860, 440, 95, Math.min(hand, sl * 0.8 + (1 - Math.exp(-(fr - sl) * 1.2)) * 0.5));
    if (t > rd) insT(g, 'redder + dimmer', 540, 1250, 58, { color: '#ff8a7a', stroke: CARD_INK });
    stamp(g, t, 'FROZEN?', { at: fr, x: 540, y: 560, size: 100, color: '#bfe8ff', fill: 'rgba(20,40,80,0.85)', rot: -0.08 });
    reactions(g, t, s, [{ fx: 'shake', at: fr, amp: 0.02, dur: 0.2 }]); },
});
// s18 — "...at the edge." The friend lowers the binoculars and waits... and waits. zzz.
registerShot('s18', { kind: '3d',
  init(T) { const s = spaceStage(T, { seed: 34 }); s.r = rocket(); s.r.position.set(-1.9, 0.2, -1.5); s.r.rotation.z = 0.15; s.stage.add(s.r); s.f = friend(); s.f.position.set(0.5, -0.4, 0.6); s.f.rotation.y = -0.3; s.stage.add(s.f); s.f.hand.R.add(s.f.bin); return s; },
  draw(s, t, info) { s.update(t); const k = ease.inOut(prog(t, 0.1, 0.5));
    s.f.pose(addPose(POSE.stand, { ...idle(t, 16, 0.5), armL: [lerp(1.5, 0.3, k), 0.3, 0], armR: [lerp(1.5, 0.3, k), -0.3, 0], elbowL: lerp(1.4, 0.5, k), elbowR: lerp(1.4, 0.5, k), headTilt: 0.15 * k })); s.f.face(mixExpr(EXPR.neutral, EXPR.bored, k), t);
    s.f.bin.position.set(-0.06, 0.12, 0.15); s.f.bin.rotation.set(-0.3, 0, 0);
    camMove(s.stage, t, [[0, { pos: [0.9, 1.9, 4.6], look: [0.4, 1.4, 0.6], fov: 38 }], [info.dur, { pos: [0.8, 1.9, 4.2], look: [0.4, 1.4, 0.6], fov: 38 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'zzz', on: 'f', at: 0.45 }, { fx: 'question', on: 'f', at: 0.1, until: 0.5, scale: 0.6 }]); },
});

// ---------------------------------------------------------------- inside
// s19 — "BUT inside, every path leads to the CENTER." Deep red-violet; every arrow points at one glowing point.
const S19 = { init(T) { const s = spaceStage(T, { seed: 41, bg: ['#12020a', '#3a0a20', '#12020a'], stars: 300 }); s.a = astronaut(); s.stage.add(s.a); s.c = glow(3.5, '#ffffff', 0.95); s.c.position.set(0, -1.4, -3); s.stage.add(s.c); s.c2 = glow(9, '#ff5a3a', 0.5); s.c2.position.copy(s.c.position); s.stage.add(s.c2); return s; },
  draw(s, t, info) { s.update(t); s.c.material.opacity = 0.8 + 0.2 * Math.sin(t * 8); s.a.position.set(0, 1.0 - t * 0.1, 0); s.a.rotation.set(0, Math.sin(t * 1.5) * 0.5, 0.05); s.a.stretch(1.1);
    s.a.pose(addPose(POSE.panic, { ...tremble(t, 0.5), headTurn: Math.sin(t * 2.2) * 0.6 })); s.a.face(EXPR.worried, t);
    const cut = info.shot.id === 's19' ? at(info, 'leads', 99) - 0.08 : 99;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 2.4, 8.4], look: [0, 0.6, 0], fov: 42 }], [info.dur, { pos: [0, 2.3, 7.6], look: [0, 0.5, 0], fov: 42 }]]);
    else camMove(s.stage, t, [[cut, { pos: [1.6, -0.2, 6.0], look: [0, 1.2, 0], fov: 44 }], [info.dur, { pos: [1.5, -0.2, 5.6], look: [0, 1.2, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { const c = [540, 1330]; const r = ease.out(prog(t, 0.1, 0.8));
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.2, R0 = 760, R1 = 300; arrow(g, c[0] + Math.cos(a) * R0, c[1] + Math.sin(a) * R0 * 0.9, c[0] + Math.cos(a) * R1, c[1] + Math.sin(a) * R1 * 0.9, { k: r, w: 26, color: i % 2 ? '#ffd25a' : '#ff7a5a' }); }
    stamp(g, t, 'NO WAY OUT', { at: 0.15, x: 540, y: 420, size: 88, color: '#ffffff', fill: '#a01a3a', rot: -0.05 });
    const ce = at(info, 'center', 1.5); if (t > ce) insT(g, 'THE CENTER', 540, 1700, 60, { color: '#ffe0a0', stroke: CARD_INK }); } };
registerShot('s19', { kind: '3d', ...S19 });
// s19b — "NASA's SIMULATION says..." He checks his wrist: a countdown clock starts; his legs begin to stretch.
registerShot('s19b', { kind: '3d',
  init(T) { return S19.init(T); },
  draw(s, t, info) { s.update(t); const k = ease.out(prog(t, 0.0, 0.3)); s.a.position.set(0, 0.9 - t * 0.25, 0); s.a.rotation.set(0, 0.2, 0.03); s.a.stretch(1.1 + ease.in(prog(t, 0.3, info.dur)) * 0.35);
    s.a.pose(addPose(POSE.stand, { ...idle(t, 18, 0.5), armL: [1.3 * k, -0.2, 0.6], elbowL: 1.9 * k, headNod: 0.35 * k, headTurn: 0.25 * k })); s.a.face({ ...EXPR.worried, pupil: [0.4, -0.8] }, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 4.6], look: [0, 1.7, 0], fov: 40 }], [info.dur, { pos: [0.6, 2.3, 4.2], look: [0, 1.6, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { chip(g, t, 'NASA SIMULATION', 'a supercomputer fall', { at: 0.05, y: 420, w: 780, size: 64, color: '#2f6ad0' }); clock(g, 820, 1080, 120, t * 1.4); reactions(g, t, s, [{ fx: 'sweat', on: 'a', at: 0.3 }]); },
});
// s20 — INSERT CARD: "NASA's simulation ... 12.8 seconds later"
insertShot('s20', { scene: S19, insert: { type: 'bigtext', kicker: "NASA'S SIMULATION", title: '12.8 SEC', lines: ['from the edge to the stretch'], color: '#ff7a5a' } });

// s21 — PAYOFF: "So either way... it's SPAGHETTI. Just LATER." Noodle astronaut next to the plate, winks; LATER stamp.
registerShot('s21', { kind: '3d',
  init(T) { const s = spaceStage(T, { seed: 42 }); s.p = spaghettiPlate({ seed: 5 }); s.p.position.set(1.0, 0.7, 0.4); s.p.rotation.x = 0.4; s.stage.add(s.p); s.a = astronaut(); s.a.position.set(-0.9, -2.2, 0); s.stage.add(s.a); return s; },
  draw(s, t, info) { s.update(t); s.p.rotation.y = t * 0.5; const sp = at(info, 'spaghetti', 0.8), k = ease.outBack(prog(t, sp - 0.05, sp + 0.3));
    s.a.stretch(1 + k * 1.5); s.a.rotation.set(0, 0.35, 0.04); s.a.pose(addPose(mixPose(POSE.stand, POSE.handsHips, k), idle(t, 17, 0.6)));
    const lt = at(info, 'later', 1.6), wk = ease.inOut(prog(t, lt, lt + 0.15)) * (1 - ease.inOut(prog(t, lt + 0.5, lt + 0.65)));
    s.a.face({ ...mixExpr(EXPR.deadpan, EXPR.smug, k), lidR: Math.max(0.4, wk), pupil: [0, 0] }, t);
    const cut = at(info, 'just', 1.4) - 0.08;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 1.6, 11.0], look: [0, 1.0, 0], fov: 50 }], [cut, { pos: [0, 1.6, 10.5], look: [0, 1.0, 0], fov: 50 }]]);
    else camMove(s.stage, t, [[cut, { pos: [-0.4, 2.9, 4.8], look: [-0.7, 2.7, 0], fov: 40 }], [info.dur, { pos: [-0.4, 2.9, 4.4], look: [-0.7, 2.7, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { const sp = at(info, 'spaghetti', 0.8), lt = at(info, 'later', 1.6);
    stamp(g, t, 'SPAGHETTI', { at: sp - 0.05, x: 540, y: 420, size: 96, color: '#ffffff', fill: '#e8413a', rot: -0.06 });
    stamp(g, t, 'JUST LATER', { at: lt - 0.05, x: 560, y: 1180, size: 80, color: '#ffffff', fill: '#6a3ad0', rot: 0.06 });
    reactions(g, t, s, [{ fx: 'flash', at: sp - 0.05, dur: 0.15 }, { fx: 'sparkle', on: 'p', at: sp }]); },
});
// s22 — "Subscribe for more." Back to the small black hole: rewinds into frame 1's exact camera + pose (seamless loop).
registerShot('s22', { kind: '3d',
  init(T) { return smallSet(T); },
  draw(s, t, info) { const u = t - info.dur; camMove(s.stage, u, [[-1, { pos: [0.2, 1.0, 12.0], look: [0.3, -0.3, 0], fov: 42 }], [0, F1]], ease.out); drift(s, u); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'speedlines', at: 0.0, until: info.dur + 1 }]); },
});
