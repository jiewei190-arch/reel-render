// Man versus Horse Marathon (Llanwrtyd Wells, Wales). 22 shots, Toon 3D + BEANMEN effects (Justin clips funny-factual style).
// s01 = frame 1 (already moving: runner and smug horse bouncing at the start line), 2-line top caption 0-3.5 s.
// s22 ends on frame 1's exact camera at the same start line -> seamless loop.
import { registerShot, ease, prog, clamp, lerp, E, wordTime } from '/engine/core.js';
import { camMove, THREE, toon, rbox } from '/kits/toon3d/toon.js';
import { POSE, EXPR, mixPose, mixExpr, addPose, idle, run, shrug, point, tremble, nod, shake } from '/kits/toon3d/rig.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { at, person, signPost, chip, stamp, fxr, topCaption, richLine, TXT, hillStage, finishArch, horse, rider, runner, pubSet, pint, trophy, moneyBag, hillLook } from './_lib.js';

const atN = (info, word, n, fb = 0) => { let tt = info.shot.start - 0.1, r = null; for (let i = 0; i < n; i++) { r = wordTime(word, tt); if (r == null) return fb; tt = r + 0.05; } return r - info.shot.start; };
const gt = (info, t) => info.shot.start + t;
const look = (g, t, o) => hillLook(g, t, o);
const W2 = E.W / 2;
const CAP = [[['HUMANS', '#ffd23a'], ['vs.', '#ffffff'], ['HORSES', '#ff5a4a']], [['a', '#ffffff'], ['22-mile', '#ffffff'], ['race', '#ffffff'], ['in', '#ffffff'], ['Wales', '#ffffff']]];

// ---------------------------------------------------------------- stages
// start line: runner (left) + horse with rider (right), both facing camera
function startLine(T, o = {}) { const s = hillStage(T, { seed: o.seed || 5, target: [0, 0, 0] });
  s.r = runner({ num: o.num || '1' }); s.r.position.set(-1.15, 0, 0.6); s.stage.add(s.r);
  s.h = horse({ glasses: o.glasses ?? true }); s.h.position.set(1.3, 0, -0.3); s.h.rotation.y = -0.75; s.stage.add(s.h);
  s.rd = rider({ seed: 33 }); s.stage.add(s.rd);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.18), toon('#f4f4ee')); line.rotation.x = -Math.PI / 2; line.position.set(0, 0.02, 1.4); line.userData.noOutline = true; s.stage.add(line);
  return s; }
const bounce = (s, t, u = {}) => { s.r.pose(addPose(run(t * 0.55, { amp: 0.35 }), { bob: Math.abs(Math.sin(t * 7)) * 0.04 })); s.r.face(u.rface || mixExpr(EXPR.worried, EXPR.neutral, 0.4), t);
  s.h.update(t, { gallop: u.gallop ?? 0.15, speed: 1.4, lid: u.lid ?? 0.5, lidAngle: u.lidAngle ?? 0.25, look: u.look || [-0.4, 0], glasses: u.glasses, jaw: u.jaw || 0, headUp: u.headUp || 0.3 }); s.rd.ride(t, s.h, 0.2); s.rd.face(EXPR.smug, t); };
// a running scene on the course: n runners + m horses heading toward camera
function raceCourse(T, o = {}) { const s = hillStage(T, { seed: o.seed || 7, target: [0, 0, -4] }); s.rs = []; s.hs = [];
  (o.runners || [[-1.2, 0], [0.4, -2.5], [-0.6, -5]]).forEach(([x, z], i) => { const r = runner({ num: String(i + 2), color: ['#e8402a', '#2a8a5a', '#7a4ab8'][i % 3], hair: ['spiky', 'bowl', 'curly'][i % 3], seed: 50 + i }); r.position.set(x, 0, z); s.stage.add(r); s.rs.push(r); });
  (o.horses || [[1.2, -1.2], [-0.4, -4.0]]).forEach(([x, z], i) => { const h = horse({ color: ['#a8612e', '#5a4a3a', '#d8c8a8'][i % 3], num: String(i + 7) }); h.position.set(x, 0, z); s.stage.add(h); const rd = rider({ seed: 60 + i, color: ['#2a5aa8', '#c0392b'][i % 2] }); s.stage.add(rd); s.hs.push({ h, rd }); });
  s.move = (t, k = 1) => { s.rs.forEach((r, i) => { r.pose(run(t * 1.1 + i * 0.3)); r.face(EXPR.worried, t + i); r.userData.z0 ??= r.position.z; r.position.z = r.userData.z0 + t * 1.6 * k; });
    s.hs.forEach(({ h, rd }, i) => { h.userData.z0 ??= h.position.z; h.position.z = h.userData.z0 + t * 2.1 * k; h.update(t + i, { gallop: 1, speed: 2.0, lid: 0.45, lidAngle: 0.2 }); rd.ride(t, h, 1); rd.face(EXPR.happy, t); }); };
  return s; }

// frame-1 framing (s01 start == s22 end)
const F1 = { pos: [0.2, 2.6, 9.8], look: [0.1, 1.9, 0], fov: 40 };
const F1b = { pos: [0.2, 2.55, 9.0], look: [0.1, 1.9, 0], fov: 40 };

// s01 "Every year in Wales," — FRAME 1: start line, runner bouncing, smug horse in sunglasses; top caption
registerShot('s01', { kind: '3d',
  init(T) { return startLine(T); },
  draw(s, t, info) { s.hills.update(t); bounce(s, t); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t), CAP); fxr(g, t, s, [{ fx: 'sweat', on: 'r', at: 0.2, until: info.dur }, { fx: 'sparkle', on: 'h', at: 0.4, scale: 0.7 }]); },
});
// s02 "people race horses..." — the horse lowers its sunglasses at the runner; the runner gulps
registerShot('s02', { kind: '3d',
  init(T) { return startLine(T); },
  draw(s, t, info) { s.hills.update(t); const lw = ease.inOut(prog(t, 0.3, 0.8)); bounce(s, t, { glasses: t < 0.55, lid: lerp(0.5, 0.6, lw), lidAngle: 0.45, look: [-0.8, -0.2], headUp: lerp(0.3, -0.1, lw), rface: EXPR.worried });
    camMove(s.stage, t, [[0, { pos: [-0.9, 3.0, 4.6], look: [0.4, 2.8, 0.4], fov: 40 }], [info.dur, { pos: [-0.8, 3.0, 4.1], look: [0.4, 2.8, 0.4], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t), CAP); fxr(g, t, s, [{ fx: 'sweat', on: 'r', at: 0.2, until: info.dur }, { fx: 'sparkle', on: 'h', at: 0.55, scale: 0.6 }]); },
});
// s03 "on foot." — low: sneakers next to hooves; the runner shrugs, the horse "???"
registerShot('s03', { kind: '3d',
  init(T) { return startLine(T); },
  draw(s, t, info) { s.hills.update(t); bounce(s, t, { lidAngle: 0.1, lid: 0.3, look: [-0.6, -0.3] }); s.r.pose(mixPose(POSE.stand, shrug(POSE.stand, 1), ease.out(prog(t, 0.2, 0.5)))); s.r.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [-0.3, 0.6, 4.8], look: [0, 0.8, 0.4], fov: 40 }], [info.dur, { pos: [-0.3, 0.7, 4.3], look: [0, 0.9, 0.4], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'ON FOOT', W2, E.H * 0.2, t - at(info, 'foot', 0.2), { size: 78, color: '#ffd23a', rot: -4 }); fxr(g, t, s, [{ fx: 'question', on: 'h', at: 0.3, until: info.dur }]); },
});

// s04 "It started in 1980," — the pub: two blokes with pints at a table, warm light; "1980"
function pubScene(T) { const s = pubSet(T); s.a = person(0, { seed: 71 }); s.a.position.set(-2.5, 0, 0.9); s.a.rotation.y = 0.7; s.b = person(5, { seed: 72 }); s.b.position.set(-0.7, 0, 0.9); s.b.rotation.y = -0.7;
  s.l = person(3, { seed: 73, hair: 'horseshoe', moustache: true }); s.l.position.set(2.2, 0, -2.6); s.stage.add(s.a, s.b, s.l);
  s.p1 = pint(); s.p1.position.set(-1.9, 1.1, 0.5); s.p2 = pint(); s.p2.position.set(-1.3, 1.1, 0.7); s.stage.add(s.p1, s.p2); return s; }
registerShot('s04', { kind: '3d',
  init(T) { return pubScene(T); },
  draw(s, t, info) { s.a.pose(addPose(POSE.relaxed, idle(t, 1))); s.b.pose(addPose(POSE.relaxed, idle(t, 2))); s.a.face(EXPR.happy, t); s.b.face(EXPR.happy, t + 1); s.l.pose(addPose(POSE.holdFront, idle(t, 3))); s.l.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.6, 8.0], look: [-0.6, 1.6, -0.6], fov: 40 }], [info.dur, { pos: [-0.3, 2.5, 7.2], look: [-0.8, 1.6, -0.4], fov: 40 }]]); },
  overlay(g, t, info, s) { chip(g, '1980', W2, E.H * 0.18, t - at(info, '1980', 0.4), { size: 90, color: '#ffd23a', rot: -4 }); },
});
// s05 "with an argument in a Welsh pub." — the two blokes argue: angry faces, pints raised, "!"
registerShot('s05', { kind: '3d',
  init(T) { return pubScene(T); },
  draw(s, t, info) { const ar = at(info, 'argument', 0.2); const k = ease.out(prog(t, ar - 0.1, ar + 0.2));
    s.a.pose(addPose(mixPose(POSE.relaxed, point(POSE.stand, 'R', 1, { up: 0.2 }), k), { lean: 0.15 * k, ...nod(t, 0.06 * k, 4) })); s.a.face(mixExpr(EXPR.happy, { ...EXPR.angry, talk: 1 }, k), t);
    s.b.pose(addPose(mixPose(POSE.relaxed, POSE.handsHips, k), shake(t, 0.12 * k, 3))); s.b.face(mixExpr(EXPR.happy, EXPR.angry, k), t);
    s.l.pose(POSE.holdFront); s.l.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.4, 5.0], look: [-1.6, 2.0, 0.6], fov: 40 }], [info.dur, { pos: [-1.6, 2.35, 4.4], look: [-1.6, 2.0, 0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { const ar = at(info, 'argument', 0.2); fxr(g, t, s, [{ fx: 'exclaim', on: 'a', at: ar, until: info.dur }, { fx: 'sweat', on: 'b', at: ar + 0.3, until: info.dur }]);
    chip(g, 'A WELSH PUB', W2, E.H * 0.18, t - at(info, 'pub', 1.2), { size: 66, color: '#ffffff', rot: 3 }); },
});
// s06 "Over a long distance, could a human keep up with a horse?" — A taps his own chest; B shakes his head; "HUMAN = HORSE?"
registerShot('s06', { kind: '3d',
  init(T) { return pubScene(T); },
  draw(s, t, info) { const hu = at(info, 'human', 1.2), ho = at(info, 'horse', 2.0);
    s.a.pose(addPose(POSE.armsUp, { lean: -0.05 })); s.a.face({ ...EXPR.smug, talk: t < hu + 0.4 ? 1 : 0 }, t);
    s.b.pose(addPose(POSE.handsHips, shake(t, t > ho ? 0.2 : 0, 3))); s.b.face(t > ho ? EXPR.suspicious : EXPR.deadpan, t); s.l.pose(POSE.holdFront); s.l.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.6, 6.4], look: [-1.6, 1.9, 0.6], fov: 40 }], [info.dur, { pos: [-1.6, 2.55, 5.6], look: [-1.6, 1.9, 0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { const hu = at(info, 'human', 1.2), ho = at(info, 'horse', 2.0);
    chip(g, 'HUMAN', W2 - 190, E.H * 0.18, t - hu, { size: 66, color: '#ffd23a', rot: -4 }); chip(g, '=', W2, E.H * 0.18, t - ho + 0.15, { size: 66, color: '#ffffff' }); chip(g, 'HORSE?', W2 + 200, E.H * 0.18, t - ho, { size: 66, color: '#ff5a4a', rot: 4, ink: '#ffffff' });
    fxr(g, t, s, [{ fx: 'question', on: 'b', at: ho + 0.1, until: info.dur }]); },
});
// s07 "The landlord overheard..." — the landlord polishing a glass; his eyes slide sideways; sparkle of an idea
registerShot('s07', { kind: '3d',
  init(T) { const s = pubScene(T); s.gl = pint(); s.stage.add(s.gl); return s; },
  draw(s, t, info) { const ov = at(info, 'overheard', 0.4); s.a.pose(POSE.relaxed); s.b.pose(POSE.relaxed); s.a.face({ ...EXPR.angry, talk: 1 }, t); s.b.face(EXPR.angry, t);
    s.l.pose(addPose(POSE.holdFront, { headTurn: lerp(0, 0.35, ease.inOut(prog(t, ov, ov + 0.4))) })); s.l.face(t > ov ? { ...EXPR.suspicious, pupil: [0.8, 0] } : EXPR.neutral, t);
    const hp = new THREE.Vector3(); s.l.hand.R.getWorldPosition(hp); s.gl.position.copy(hp).add(new THREE.Vector3(0.15, -0.1, 0.1)); s.gl.rotation.y = t * 6;
    camMove(s.stage, t, [[0, { pos: [2.6, 2.6, 1.6], look: [2.2, 2.0, -2.6], fov: 38 }], [info.dur, { pos: [2.5, 2.6, 1.0], look: [2.2, 2.05, -2.6], fov: 38 }]]); },
  overlay(g, t, info, s) { const ov = at(info, 'overheard', 0.4); chip(g, 'THE LANDLORD', W2, E.H * 0.18, t - at(info, 'landlord', 0.1), { size: 62, color: '#ffffff', rot: -3 }); fxr(g, t, s, [{ fx: 'sparkle', on: 'l', at: ov + 0.5, scale: 0.9 }]); },
});
// s08 "and set up a race to find out." — the hills: a finish arch drops in, flags, the landlord points: "RACE!"
registerShot('s08', { kind: '3d',
  init(T) { const s = hillStage(T, { seed: 8 }); s.arch = finishArch('START / FINISH'); s.arch.position.set(0, 0, -1); s.stage.add(s.arch); s.l = person(3, { seed: 73, hair: 'horseshoe', moustache: true }); s.l.position.set(2.8, 0, 1.6); s.l.rotation.y = -0.5; s.stage.add(s.l); return s; },
  draw(s, t, info) { s.hills.update(t); const ra = at(info, 'race', 0.4); s.arch.position.y = lerp(8, 0, ease.outBack(prog(t, ra - 0.2, ra + 0.25))); s.l.pose(point(POSE.stand, 'R', 1, { up: 0.4 })); s.l.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.4, 10.5], look: [0, 2.2, 0], fov: 40 }], [info.dur, { pos: [0.4, 2.3, 9.6], look: [0, 2.2, 0], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: ra + 0.05, amp: 0.06, dur: 0.25 }]); },
  overlay(g, t, info, s) { look(g, t); stamp(g, 'RACE!', W2, E.H * 0.18, t - at(info, 'race', 0.4) - 0.1, { size: 100, rot: -6 }); },
});

// s09 "22 miles over the Welsh hills:" — INSERT 1: "22 MILES" over the hills
const hillsScene = { init(T) { const s = hillStage(T, { seed: 9 }); return s; }, draw(s, t) { s.hills.update(t); camMove(s.stage, t, [[0, { pos: [0, 7, 16], look: [0, 1, -20], fov: 42 }], [3, { pos: [0, 7.5, 14], look: [0, 1, -20], fov: 42 }]]); } };
insertShot('s09', { scene: hillsScene, dim: 0.42, insert: { type: 'bigtext', kicker: 'THE COURSE', title: '22 MILES', lines: ['over the Welsh hills'], color: '#ffd23a' } });
// s10 "runners versus horses and riders." — the pack streams down the course toward camera
registerShot('s10', { kind: '3d',
  init(T) { return raceCourse(T); },
  draw(s, t, info) { s.hills.update(t); s.move(t); camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 9.5], look: [0, 1.6, -3], fov: 40 }], [info.dur, { pos: [0.2, 2.2, 11.2], look: [0, 1.6, -1], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'RUNNERS', W2 - 170, E.H * 0.17, t - at(info, 'runners', 0.05), { size: 58, color: '#ffd23a', rot: -4 }); chip(g, 'vs.', W2 + 20, E.H * 0.17, t - at(info, 'versus', 0.4), { size: 50, color: '#ffffff' });
    chip(g, 'HORSES', W2 + 200, E.H * 0.17, t - at(info, 'horses', 0.7), { size: 58, color: '#ff5a4a', rot: 4, ink: '#ffffff' }); fxr(g, t, s, [{ fx: 'speedlines', at: 0, until: info.dur }]); },
});

// s11 "For 25 years, the horses won." — INSERT 2: counter 0 -> 25 YEARS
const podiumScene = { init(T) { const s = hillStage(T, { seed: 11 }); s.h = horse({ glasses: true }); s.h.rotation.y = -0.6; s.stage.add(s.h); return s; }, draw(s, t) { s.hills.update(t); s.h.update(t, { lid: 0.55, lidAngle: 0.4, headUp: 0.4 }); camMove(s.stage, t, [[0, { pos: [0, 2.6, 7], look: [0, 2.0, 0], fov: 40 }], [3, { pos: [0, 2.6, 6.4], look: [0, 2.0, 0], fov: 40 }]]); } };
insertShot('s11', { scene: podiumScene, dim: 0.45, insert: { type: 'counter', value: 25, from: 0, suffix: ' YEARS', title: 'HORSES WON', lines: ['from 1980'], color: '#ff5a4a' } });
// s12 "Every. Single. Time." — the horse on a podium; a trophy drops in on each word (1, 2, 3 trophies); punch-ins
registerShot('s12', { kind: '3d',
  init(T) { const s = hillStage(T, { seed: 12 }); s.pod = rbox(2.6, 0.8, 1.8, '#f4f4ee', 0, 0.4, 0, 0.06); s.stage.add(s.pod); s.h = horse({ glasses: true }); s.h.position.y = 0.8; s.h.rotation.y = -0.6; s.stage.add(s.h);
    s.tr = [-1.8, 1.8, 0].map((x, i) => { const tr = trophy(); tr.position.set(x, 0, 1.6 - (i === 2 ? -0.2 : 0)); tr.scale.setScalar(1.3); s.stage.add(tr); return tr; }); return s; },
  draw(s, t, info) { s.hills.update(t); const w = [at(info, 'every', 0.05), at(info, 'single', 0.5), at(info, 'time', 1.0)];
    s.h.update(t, { lid: 0.55, lidAngle: 0.45, headUp: 0.5, look: [0, 0] }); s.tr.forEach((tr, i) => { const k = ease.outBack(prog(t, w[i], w[i] + 0.25)); tr.position.y = lerp(6, i === 2 ? 0.8 : 0, k); tr.visible = t > w[i] - 0.3; if (i === 2) tr.position.x = 1.0; });
    const n = t < w[1] - 0.05 ? 0 : t < w[2] - 0.05 ? 1 : 2; const cams = [{ pos: [0, 2.6, 9], look: [0, 2.0, 0], fov: 40 }, { pos: [-0.5, 3.6, 6.4], look: [-0.5, 3.0, 0.6], fov: 38 }, { pos: [-1.3, 4.0, 4.2], look: [-0.7, 3.7, 1.0], fov: 36 }];
    const c = cams[n]; s.stage.cam(c.pos, c.look, c.fov); },
  overlay(g, t, info, s) { look(g, t); const w = [at(info, 'every', 0.05), at(info, 'single', 0.5), at(info, 'time', 1.0)]; const words = ['EVERY.', 'SINGLE.', 'TIME.'];
    words.forEach((wd, i) => chip(g, wd, W2, E.H * (0.15 + i * 0.07), t - w[i], { size: 64, color: i === 2 ? '#ff5a4a' : '#ffd23a', rot: i % 2 ? 3 : -3, ink: i === 2 ? '#ffffff' : undefined })); fxr(g, t, s, [{ fx: 'sparkle', on: 'h', at: w[2], scale: 0.9 }]); },
});

// s13 "But here's the part..." — the start line again: the runner stops bouncing, stares down the course (determined); the horse yawns
registerShot('s13', { kind: '3d',
  init(T) { return startLine(T, { num: '2004' }); },
  draw(s, t, info) { s.hills.update(t); bounce(s, t, { lid: 0.85, lidAngle: 0.1, jaw: Math.max(0, Math.sin(t * 2.2)) * 0.9 }); s.r.pose(addPose(POSE.attention, { lean: 0.1 })); s.r.face({ ...EXPR.angry, mouth: 'line' }, t);
    camMove(s.stage, t, [[0, { pos: [-1.0, 2.8, 4.6], look: [-0.9, 2.2, 0.6], fov: 38 }], [info.dur, { pos: [-1.0, 2.7, 3.6], look: [-0.95, 2.25, 0.6], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'zzz', on: 'h', at: 0.3, until: info.dur }]); },
});
// s14 "in 2004, a runner named Huw Lobb" — a generic toon runner sprinting down the hill course, speed lines, "2004"
registerShot('s14', { kind: '3d',
  init(T) { const s = hillStage(T, { seed: 14 }); s.r = runner({ num: '2004', color: '#2a8a5a' }); s.stage.add(s.r); return s; },
  draw(s, t, info) { s.hills.update(t); s.r.pose(run(t * 1.3)); s.r.face({ ...EXPR.angry, mouth: 'grin' }, t); s.r.position.z = -6 + t * 3.2;
    camMove(s.stage, t, [[0, { pos: [1.6, 1.8, -1.0], look: [0, 1.6, -6], fov: 40 }], [info.dur, { pos: [1.6, 1.8, -6 + info.dur * 3.2 + 4.2], look: [0, 1.6, -6 + info.dur * 3.2], fov: 40 }]], (x) => x); },
  overlay(g, t, info, s) { look(g, t); chip(g, '2004', W2, E.H * 0.16, t - at(info, '2004', 0.05), { size: 90, color: '#ffd23a', rot: -4 }); chip(g, 'HUW LOBB', W2, E.H * 0.24, t - at(info, 'huw', 1.0), { size: 60, color: '#ffffff', rot: 3 });
    fxr(g, t, s, [{ fx: 'speedlines', at: 0.2, until: info.dur }]); },
});
// s15 "beat them all." — the finish: the runner breaks the tape; the horse arrives behind, jaw drop, sunglasses fall off
registerShot('s15', { kind: '3d',
  init(T) { const s = hillStage(T, { seed: 15 }); s.arch = finishArch('FINISH'); s.arch.position.set(0, 0, 0); s.stage.add(s.arch); s.r = runner({ num: '2004', color: '#2a8a5a' }); s.stage.add(s.r);
    s.h = horse({ glasses: true }); s.stage.add(s.h); s.rd = rider({ seed: 33 }); s.stage.add(s.rd);
    s.tape = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 0.03), toon('#e8402a')); s.tape.position.set(0, 1.3, 0); s.stage.add(s.tape); return s; },
  draw(s, t, info) { s.hills.update(t); const be = at(info, 'beat', 0.1); const rz = lerp(-3, 2.6, ease.out(clamp(t / (be + 0.5)))); s.r.position.set(-0.5, 0, rz);
    s.r.pose(t < be + 0.4 ? run(t * 1.3) : POSE.armsUp); s.r.face(t < be + 0.4 ? EXPR.angry : EXPR.grin, t); s.tape.scale.x = rz > 0 ? 0.001 : 1;
    const hz = lerp(-14, -2.0, ease.out(clamp(t / (info.dur - 0.1)))); s.h.position.set(1.2, 0, hz); const late = t > be + 0.5;
    s.h.update(t, { gallop: late ? 0.3 : 1, speed: 2.0, lid: late ? 0 : 0.45, jaw: late ? 1 : 0, glasses: !late, ears: late ? 1 : 0 }); s.rd.ride(t, s.h, late ? 0.3 : 1); s.rd.face(late ? EXPR.shocked : EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 9.5], look: [0, 1.8, 0], fov: 42 }], [info.dur, { pos: [0.4, 2.3, 8.6], look: [0, 1.9, 0], fov: 42 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: be + 0.4, amp: 0.05, dur: 0.25 }]); },
  overlay(g, t, info, s) { look(g, t); const be = at(info, 'beat', 0.1); stamp(g, 'HUMAN WINS', W2, E.H * 0.17, t - be - 0.4, { size: 92, rot: -6, color: '#2f9a4a' });
    fxr(g, t, s, [{ fx: 'exclaim', on: 'h', at: be + 0.55, until: info.dur }, { fx: 'sparkle', on: 'r', at: be + 0.45, scale: 1.0 }]); },
});
// s16 "By about 2 minutes." — close on the horse: double take, sweat; stopwatch chip "~2 MIN"
registerShot('s16', { kind: '3d',
  init(T) { return startLine(T, { glasses: false }); },
  draw(s, t, info) { s.hills.update(t); const k = t > 0.35; s.h.update(t, { lid: 0, jaw: 0.8, look: [Math.sin(t * 14) * (k ? 0.5 : 0) - 0.3, 0], ears: 1, headUp: 0.1 }); s.rd.ride(t, s.h, 0); s.rd.face(EXPR.shocked, t); s.r.visible = false;
    camMove(s.stage, t, [[0, { pos: [-0.8, 3.1, 3.8], look: [0.4, 2.85, 0.5], fov: 38 }], [info.dur, { pos: [-0.7, 3.1, 3.4], look: [0.4, 2.85, 0.5], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, '~2 MIN', W2, E.H * 0.13, t - at(info, '2', 0.4), { size: 70, color: '#ffd23a', rot: -3 }); fxr(g, t, s, [{ fx: 'sweat', on: 'h', at: 0.2, until: info.dur }, { fx: 'question', on: 'rd', at: 0.5, until: info.dur }]); },
});
// s17 "And he took home a 25,000 pound prize." — a money bag drops into the runner's arms; "£25,000"
registerShot('s17', { kind: '3d',
  init(T) { const s = hillStage(T, { seed: 17 }); s.r = runner({ num: '2004', color: '#2a8a5a' }); s.stage.add(s.r); s.bag = moneyBag(); s.stage.add(s.bag); return s; },
  draw(s, t, info) { s.hills.update(t); const pr = at(info, '25,000', 0.6); const k = ease.outBounce ? ease.outBounce(prog(t, pr - 0.3, pr + 0.2)) : ease.out(prog(t, pr - 0.3, pr + 0.2));
    s.bag.position.set(0.0, lerp(7, 0.9, k), 0.6); s.r.pose(mixPose(POSE.armsUp, POSE.holdFront, prog(t, pr, pr + 0.2))); s.r.face(t > pr ? { ...EXPR.grin, lower: 0.6 } : EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 6.4], look: [0, 1.9, 0], fov: 40 }], [info.dur, { pos: [0, 2.35, 5.8], look: [0, 1.9, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); const pr = at(info, '25,000', 0.6); chip(g, '£25,000', W2, E.H * 0.18, t - pr, { size: 96, color: '#2f9a4a', rot: -4, ink: '#ffffff' }); fxr(g, t, s, [{ fx: 'heartEyes', on: 'r', at: pr + 0.15 }, { fx: 'sparkle', on: 'bag', at: pr + 0.1, scale: 0.8 }]); },
});

// s18 "Since then, humans have won just 4 more times," — scoreboard over the finish: 2004 + four more years tick on
const YEARS = ['2004', '2007', '2022', '2023', '2025'];
function board(g, n, age, o = {}) { const k = ease.outBack(clamp(age / 0.3)); if (k <= 0) return; g.save(); g.translate(W2, o.y || E.H * 0.3); g.scale(k, k);
  g.fillStyle = '#20302a'; g.strokeStyle = '#6a4228'; g.lineWidth = 18; g.beginPath(); g.roundRect(-400, -250, 800, 500, 24); g.fill(); g.stroke();
  TXT(g, 'HUMAN WINS', 0, -185, 60, { color: '#ffd23a' });
  YEARS.forEach((y, i) => { if (i >= n) return; const x = -270 + (i % 3) * 270, yy = -70 + Math.floor(i / 3) * 140; TXT(g, y, x, yy, 76, { color: i === 4 ? '#7ae07a' : '#ffffff' }); });
  g.restore(); }
registerShot('s18', { kind: '3d',
  init(T) { return raceCourse(T, { seed: 18, runners: [[-1.0, 1.0], [0.6, -0.4]], horses: [[1.6, -3.5]] }); },
  draw(s, t, info) { s.hills.update(t); s.move(t, 0.5); camMove(s.stage, t, [[0, { pos: [0, 3.0, 11], look: [0, 1.8, 0], fov: 40 }], [info.dur, { pos: [0, 2.9, 10], look: [0, 1.8, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); const f = at(info, '4', 1.0); const n = 1 + Math.min(4, Math.floor(clamp((t - f + 0.1) / 0.28) * 4 + (t > f - 0.1 ? 1 : 0))); board(g, t < f - 0.1 ? 1 : n, t); },
});
// s19 "most recently in 2025." — a 2025 runner crosses, medal; a horse sulks behind
registerShot('s19', { kind: '3d',
  init(T) { const s = hillStage(T, { seed: 19 }); s.arch = finishArch('FINISH'); s.arch.position.z = -0.5; s.stage.add(s.arch); s.r = runner({ num: '2025', color: '#7a4ab8', hair: 'curly', seed: 77 }); s.r.position.set(-0.6, 0, 1.6); s.stage.add(s.r);
    s.h = horse({ color: '#5a4a3a' }); s.h.position.set(1.6, 0, -1.8); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.hills.update(t); s.r.pose(addPose(POSE.armsUp, idle(t, 2))); s.r.face(EXPR.grin, t); s.h.update(t, { lid: 0.6, lidAngle: -0.4, look: [-0.5, -0.3], headUp: -0.4 });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 8.4], look: [0.2, 1.9, 0], fov: 40 }], [info.dur, { pos: [0.4, 2.35, 7.6], look: [0.2, 1.9, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, '2025', W2, E.H * 0.3, t - at(info, '2025', 0.6), { size: 90, color: '#7ae07a', rot: -4 }); fxr(g, t, s, [{ fx: 'sparkle', on: 'r', at: 0.3, scale: 0.9 }, { fx: 'sweat', on: 'h', at: 0.4, until: info.dur }]); },
});
// s20 "Humans: 5 wins." — PAYOFF 1: a giant scoreboard HUMANS 5
// s21 "Horses: pretty much all the rest." — PAYOFF 2: the horse puts its sunglasses back on, trophy pile behind it
function score(g, age, n2) { const k = ease.outBack(clamp(age / 0.3)); if (k <= 0) return; g.save(); g.translate(W2, E.H * 0.24); g.scale(k, k); g.fillStyle = '#20302a'; g.strokeStyle = '#6a4228'; g.lineWidth = 18; g.beginPath(); g.roundRect(-420, -170, 840, 340, 24); g.fill(); g.stroke();
  TXT(g, 'HUMANS', -200, -90, 58, { color: '#ffd23a' }); TXT(g, '5', -200, 40, 150, { color: '#ffffff' }); TXT(g, 'HORSES', 200, -90, 58, { color: '#ff5a4a' }); if (n2) TXT(g, 'THE REST', 200, 40, 66, { color: '#ffffff' }); g.restore(); }
registerShot('s20', { kind: '3d',
  init(T) { return startLine(T, { glasses: false }); },
  draw(s, t, info) { s.hills.update(t); bounce(s, t, { glasses: false, lid: 0.2, lidAngle: -0.2, look: [-0.5, 0], rface: EXPR.grin });
    camMove(s.stage, t, [[0, { pos: [0.1, 2.6, 7.6], look: [0, 2.2, 0], fov: 40 }], [info.dur, { pos: [0.1, 2.55, 7.0], look: [0, 2.2, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); score(g, t - 0.05, false); fxr(g, t, s, [{ fx: 'sparkle', on: 'r', at: at(info, '5', 0.5), scale: 0.8 }]); },
});
registerShot('s21', { kind: '3d',
  init(T) { const s = startLine(T, { glasses: true }); s.tr = []; for (let i = 0; i < 9; i++) { const tr = trophy(); tr.position.set(1.0 + (i % 3 - 1) * 0.9, Math.floor(i / 3) * 0.95, -2.2 - (i % 2) * 0.2); tr.scale.setScalar(0.9); s.stage.add(tr); s.tr.push(tr); } return s; },
  draw(s, t, info) { s.hills.update(t); const rs = at(info, 'rest', 1.2); const gl = t > rs - 0.2; bounce(s, t, { glasses: gl, lid: 0.55, lidAngle: 0.45, look: [-0.5, 0], headUp: 0.5, rface: EXPR.deadpan }); s.r.pose(shrug(POSE.stand, 1));
    camMove(s.stage, t, [[0, { pos: [-0.6, 3.1, 5.8], look: [0.6, 2.4, 0], fov: 40 }], [info.dur, { pos: [-0.55, 3.1, 5.2], look: [0.6, 2.5, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); score(g, 1, t > at(info, 'rest', 1.2) - 0.1); fxr(g, t, s, [{ fx: 'sparkle', on: 'h', at: at(info, 'rest', 1.2), scale: 0.9 }]); },
});
// s22 "Subscribe for more." — back to frame 1: the start line, both bouncing again, camera settles on F1 -> loop
registerShot('s22', { kind: '3d',
  init(T) { return startLine(T); },
  draw(s, t, info) { s.hills.update(t); bounce(s, t); camMove(s.stage, t, [[0, { pos: [0.2, 2.8, 11.4], look: [0.1, 1.9, 0], fov: 40 }], [info.dur, F1]], ease.out); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'sweat', on: 'r', at: 0.2, until: info.dur }]); },
});
