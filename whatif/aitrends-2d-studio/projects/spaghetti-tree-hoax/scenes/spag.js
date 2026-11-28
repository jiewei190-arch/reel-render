// The 1957 spaghetti-tree hoax. 18 shots, Toon 3D + BEANMEN effects (Justin clips funny-factual style).
// s01 = frame 1 (already moving: a toon farmer on a ladder tugs a noodle off a spaghetti tree; strands sway), 2-line top caption 0-3.5 s.
// s18 ends on frame 1's exact camera at the same tree -> seamless loop.
import { registerShot, ease, prog, clamp, lerp, E, wordTime } from '/engine/core.js';
import { camMove, THREE, toon, rbox, cyl } from '/kits/toon3d/toon.js';
import { POSE, EXPR, mixPose, mixExpr, addPose, idle, shrug, point, tremble, nod, shake } from '/kits/toon3d/rig.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { at, person, chip, stamp, fxr, topCaption, TXT, orchardStage, spagTree, basket, ladder, weevil, tvSet, livingRoom, rotaryPhone, tomatoTin, wateringCan, plateSpag, orchardLook } from './_lib.js';

const gt = (info, t) => info.shot.start + t;
const look = (g, t, o) => orchardLook(g, t, o);
const W2 = E.W / 2;
const CAP = [[['1957:', '#ffffff'], ['SPAGHETTI', '#ffd23a']], [['grows', '#ffffff'], ['on', '#ffffff'], ['TREES?', '#ff5a4a']]];

// ---------------------------------------------------------------- stages
// the orchard: one hero spaghetti tree, a Swiss farmer on a ladder, a basket, family members around
function orchard(T, o = {}) { const s = orchardStage(T, { seed: o.seed || 3 }); s.tree = spagTree({ seed: 2 }); s.stage.add(s.tree);
  [[-5, -4], [5.5, -5], [-9, -9], [8, -10], [0, -12]].forEach(([x, z], i) => { const t2 = spagTree({ seed: 10 + i, n: 14, scale: 0.9 }); t2.position.set(x, 0, z); s.stage.add(t2); (s.bg ||= []).push(t2); });
  s.lad = ladder(); s.lad.position.set(0.9, 0, 0.9); s.lad.rotation.y = -0.5; s.stage.add(s.lad);
  s.f = person(2, { seed: 81, head: 'cap', headColor: '#3a3a3a', colors: { main: '#e8e2d2', legs: '#3a3a5a' } }); s.f.position.set(0.85, 1.25, 1.2); s.f.rotation.y = Math.PI + 0.4; s.stage.add(s.f);
  s.bk = basket(); s.bk.position.set(-0.9, 0, 1.4); s.stage.add(s.bk);
  if (o.family) { s.m = person(3, { seed: 82, hair: 'bun', colors: { main: '#c05a7a', legs: '#5a3a3a' } }); s.m.position.set(-1.6, 0, 1.0); s.m.rotation.y = 0.5; s.k = person(1, { seed: 83, scale: 0.75 }); s.k.position.set(-0.6, 0, 2.0); s.stage.add(s.m, s.k); }
  return s; }
const treeTick = (s, t, u = {}) => { s.orch.update(t); s.tree.update(t, u); (s.bg || []).forEach((b, i) => b.update(t + i)); };
const farmerTug = (s, t) => { const k = (Math.sin(t * 3) + 1) / 2; s.f.pose(addPose(POSE.armsUp, { armR: [2.8, 0.2, 0], elbowR: lerp(0.2, 1.2, k), armL: [0.4, 0.4, 0], lean: -0.1 })); s.f.face(EXPR.happy, t); return k; };

// frame-1 framing (s01 start == s18 end)
const F1 = { pos: [0.4, 2.6, 8.4], look: [0.1, 2.3, 0], fov: 40 };
const F1b = { pos: [0.35, 2.55, 7.6], look: [0.1, 2.3, 0], fov: 40 };

// s01 "In 1957, British TV" — FRAME 1: the spaghetti tree, a farmer on a ladder tugging a noodle (it stretches), top caption
registerShot('s01', { kind: '3d',
  init(T) { return orchard(T, {}); },
  draw(s, t, info) { const k = farmerTug(s, t); treeTick(s, t, { pluck: [3, k] }); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t), CAP); fxr(g, t, s, [{ fx: 'sparkle', on: s.tree.tipPos(3), at: 0.2, scale: 0.6 }]); },
});
// s02 "convinced viewers that spaghetti grows on trees." — 1950s living room: the family on the sofa, the TV shows a spaghetti tree; jaws drop
function room(T) { const s = livingRoom(T); s.tv = tvSet(); s.tv.position.set(0, 0, -1.6); s.stage.add(s.tv);
  s.ppl = [person(0, { seed: 91 }), person(3, { seed: 92, hair: 'bob' }), person(1, { seed: 93, scale: 0.75 })]; s.ppl.forEach((p, i) => { p.position.set(-1.0 + i * 1.0, 0.45, 2.4); p.rotation.y = Math.PI; s.stage.add(p); }); return s; }
const sit = (s, t, expr) => s.ppl.forEach((p, i) => { p.pose(addPose(POSE.sit, idle(t, i + 1, 0.5))); p.face(expr, t + i); });
registerShot('s02', { kind: '3d',
  init(T) { return room(T); },
  draw(s, t, info) { sit(s, t, EXPR.neutral);
    camMove(s.stage, t, [[0, { pos: [3.4, 2.4, -0.9], look: [0, 1.7, 2.4], fov: 40 }], [info.dur, { pos: [3.1, 2.35, -0.5], look: [0, 1.7, 2.4], fov: 40 }]]); },
  overlay(g, t, info, s) { topCaption(g, gt(info, t), CAP); },
});
// s02b "spaghetti grows on trees." — reverse angle over the family's heads onto the TV: the spaghetti tree on screen; jaws drop
registerShot('s02b', { kind: '3d',
  init(T) { return room(T); },
  draw(s, t, info) { const tr = at(info, 'trees', 1.0); sit(s, t, t > tr - 0.2 ? EXPR.shocked : EXPR.neutral);
    camMove(s.stage, t, [[0, { pos: [2.5, 2.4, 3.4], look: [-0.2, 1.45, -1.6], fov: 38 }], [info.dur, { pos: [2.2, 2.3, 2.8], look: [-0.2, 1.45, -1.6], fov: 38 }]]); },
  overlay(g, t, info, s) { topCaption(g, gt(info, t), CAP); const tr = at(info, 'trees', 1.0); fxr(g, t, s, s.ppl.map((p, i) => ({ fx: i === 1 ? 'question' : 'exclaim', on: p, at: tr + i * 0.08, until: info.dur }))); },
});

// s03 "April 1st." — INSERT 1: APRIL 1, 1957
const roomScene = { init(T) { return room(T); }, draw(s, t) { sit(s, t, EXPR.neutral); camMove(s.stage, t, [[0, { pos: [0, 2.4, 6.5], look: [0, 1.6, 0], fov: 40 }], [2, { pos: [0, 2.4, 6], look: [0, 1.6, 0], fov: 40 }]]); } };
insertShot('s03', { scene: roomScene, dim: 0.45, insert: { type: 'bigtext', kicker: 'BRITISH TV', title: 'APRIL 1, 1957', lines: ['a serious news show'], color: '#ffd23a' } });
// s04 "A serious British TV show aired a report from Switzerland." — on the TV screen: the presenter at a desk; zoom into the screen
registerShot('s04', { kind: '3d',
  init(T) { const s = livingRoom(T); s.desk = rbox(2.4, 0.9, 1.0, '#4a3a2a', 0, 0.45, 0.4, 0.05); s.stage.add(s.desk); s.p = person(5, { seed: 95, outfit: 'uniform', colors: { main: '#3a3a44', legs: '#2a2a30' }, hair: 'horseshoe', hairColor: '#5a4a3a' }); s.p.position.set(0, 0, -0.3); s.stage.add(s.p);
    s.mic = cyl(0.03, 0.03, 0.5, '#3a3a3a', 0.35, 1.15, 0.6, 6); s.stage.add(s.mic); return s; },
  draw(s, t, info) { s.p.pose(addPose(POSE.holdFront, idle(t, 2, 0.3))); s.p.face({ ...EXPR.deadpan, talk: 1 }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 4.2], look: [0, 1.9, 0], fov: 38 }], [info.dur, { pos: [0, 2.25, 3.6], look: [0, 1.95, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, E.W, E.H); g.restore();   // 1950s TV = black and white
    g.save(); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < E.H; y += 6) g.fillRect(0, y, E.W, 2); g.restore();
    chip(g, 'SERIOUS NEWS SHOW', W2, E.H * 0.18, t - at(info, 'serious', 0.1), { size: 58, color: '#ffffff', rot: -3 }); },
});
// s04b "aired a report from Switzerland." — wide Ticino: the lake, mountains, a chalet, the orchard
registerShot('s04b', { kind: '3d',
  init(T) { return orchard(T, {}); },
  draw(s, t, info) { farmerTug(s, t); treeTick(s, t); camMove(s.stage, t, [[0, { pos: [-3, 6.5, 18], look: [0, 3, -20], fov: 42 }], [info.dur, { pos: [-2.4, 5.8, 15.5], look: [0, 2.6, -16], fov: 42 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'SWITZERLAND', W2, E.H * 0.2, t - at(info, 'switzerland', 1.0), { size: 72, color: '#ff5a4a', rot: -3, ink: '#ffffff' }); },
});
// s05 "A Swiss family..." — the orchard: mum, dad on the ladder, a kid; everyone smiling
registerShot('s05', { kind: '3d',
  init(T) { return orchard(T, { family: true }); },
  draw(s, t, info) { const k = farmerTug(s, t); treeTick(s, t, { pluck: [3, k] }); s.m.pose(addPose(POSE.holdFront, idle(t, 2))); s.m.face(EXPR.happy, t); s.k.pose(addPose(POSE.armsUp, idle(t, 3))); s.k.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.4, 9.0], look: [-0.3, 1.9, 0.6], fov: 40 }], [info.dur, { pos: [-1.4, 2.35, 8.2], look: [-0.3, 1.9, 0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'A SWISS FAMILY', W2, E.H * 0.18, t - at(info, 'swiss', 0.2), { size: 64, color: '#ffffff', rot: -3 }); fxr(g, t, s, [{ fx: 'hearts', on: 'k', at: 0.4 }]); },
});
// s06 "harvesting spaghetti, straight off the trees." — close: a hand plucks a strand, it stretches... snaps off; the basket fills
registerShot('s06', { kind: '3d',
  init(T) { return orchard(T, { family: true }); },
  draw(s, t, info) { const st = at(info, 'straight', 1.2); const k = ease.inOut(prog(t, 0, st)); treeTick(s, t, { pluck: [5, t < st + 0.2 ? k : 0] }); farmerTug(s, t); s.m.pose(POSE.holdFront); s.m.face(EXPR.happy, t); s.k.pose(POSE.armsUp); s.k.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 4.4], look: [0.2, 2.3, 0.4], fov: 38 }], [info.dur, { pos: [0.5, 2.35, 3.8], look: [0.2, 2.3, 0.4], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const st = at(info, 'straight', 1.2); stamp(g, 'FRESH OFF THE TREE', W2, E.H * 0.18, t - st, { size: 60, rot: -5, color: '#2f9a4a' }); fxr(g, t, s, [{ fx: 'sparkle', on: s.tree.tipPos(5), at: st + 0.15, scale: 0.8 }]); },
});
// s07 "The report even said" — the presenter (B&W) taps a chart of the "harvest": the crop is up
registerShot('s07', { kind: '3d',
  init(T) { return orchard(T, { family: true }); },
  draw(s, t, info) { treeTick(s, t); farmerTug(s, t); s.m.pose(POSE.holdFront); s.m.face(EXPR.happy, t); s.k.pose(POSE.relaxed); s.k.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 4.2, 10.5], look: [0, 2.4, 0], fov: 40 }], [info.dur, { pos: [0, 4.0, 9.6], look: [0, 2.4, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'THE REPORT SAID...', W2, E.H * 0.18, t - 0.05, { size: 62, color: '#ffffff', rot: -3 }); },
});
// s08 "the dreaded spaghetti weevil had virtually disappeared." — a tiny weevil with a suitcase walks off into the distance; MISSING poster
registerShot('s08', { kind: '3d',
  init(T) { const s = orchard(T, {}); s.w = weevil({ scale: 1.3 }); s.stage.add(s.w); return s; },
  draw(s, t, info) { treeTick(s, t); farmerTug(s, t); const di = at(info, 'disappeared', 1.6); const k = prog(t, 0.3, info.dur); s.w.position.set(0.0 + k * 2.2, 0, 3.0 - k * 0.6); s.w.rotation.y = 1.84; s.w.position.y = Math.abs(Math.sin(t * 9)) * 0.06;
    camMove(s.stage, t, [[0, { pos: [0.4, 1.7, 8.8], look: [0.5, 0.7, 2.9], fov: 38 }], [info.dur, { pos: [1.4, 1.7, 8.4], look: [1.7, 0.7, 2.6], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const sw = at(info, 'weevil', 0.8), di = at(info, 'disappeared', 1.6);
    chip(g, 'SPAGHETTI WEEVIL', W2, E.H * 0.17, t - sw, { size: 60, color: '#9acb5a', rot: -3 }); stamp(g, 'GONE', W2, E.H * 0.26, t - di - 0.1, { size: 96, rot: 6 }); fxr(g, t, s, [{ fx: 'sweat', on: s.w, at: 0.2, until: info.dur, scale: 0.7 }]); },
});
// s09 "And it was narrated by one of Britain's most trusted broadcasters." — the presenter, B&W, deadpan; TRUSTED stamp; the family nods along
registerShot('s09', { kind: '3d',
  init(T) { const s = livingRoom(T); s.desk = rbox(2.4, 0.9, 1.0, '#4a3a2a', 0, 0.45, 0.4, 0.05); s.stage.add(s.desk); s.p = person(5, { seed: 95, outfit: 'uniform', colors: { main: '#3a3a44', legs: '#2a2a30' }, hair: 'horseshoe', hairColor: '#5a4a3a' }); s.p.position.set(0, 0, -0.3); s.stage.add(s.p); return s; },
  draw(s, t, info) { s.p.pose(addPose(POSE.holdFront, nod(t, 0.03, 1))); s.p.face({ ...EXPR.deadpan, lid: 0.35, talk: 1 }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 2.6], look: [0, 2.05, 0], fov: 38 }], [info.dur, { pos: [0.25, 2.3, 2.2], look: [0, 2.05, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, E.W, E.H); g.restore();
    chip(g, 'NARRATED BY...', W2, E.H * 0.18, t - at(info, 'narrated', 0.5), { size: 62, color: '#ffffff', rot: -3 }); },
});
// s09b "one of Britain's most trusted broadcasters." — the family on the sofa, nodding along: TRUSTED
registerShot('s09b', { kind: '3d',
  init(T) { return room(T); },
  draw(s, t, info) { s.ppl.forEach((p, i) => { p.pose(addPose(POSE.sit, nod(t + i * 0.2, 0.12, 1.6))); p.face({ ...EXPR.happy, lid: 0.35 }, t + i); });
    camMove(s.stage, t, [[0, { pos: [-3.3, 2.4, -0.9], look: [0, 1.7, 2.4], fov: 40 }], [info.dur, { pos: [-3.0, 2.35, -0.5], look: [0, 1.7, 2.4], fov: 40 }]]); },
  overlay(g, t, info, s) { const tr = at(info, 'trusted', 1.0); stamp(g, 'TRUSTED', W2, E.H * 0.18, t - tr - 0.1, { size: 100, rot: -6, color: '#2f9a4a' }); fxr(g, t, s, [{ fx: 'hearts', on: s.ppl[1], at: tr + 0.2 }]); },
});
// s10 "Back then, pasta was an unusual dish in Britain." — a British family at dinner staring at a plate of spaghetti; dad lifts one noodle like a worm: "???"
registerShot('s10', { kind: '3d',
  init(T) { const s = livingRoom(T); s.tab = rbox(2.4, 0.1, 1.4, '#7a5032', 0, 1.0, 0.8, 0.03); s.stage.add(s.tab); s.stage.add(cyl(0.1, 0.12, 1.0, '#5a3a22', 0, 0.5, 0.8, 8));
    s.pl = plateSpag(); s.pl.position.set(0, 1.06, 0.8); s.stage.add(s.pl); s.ppl = [person(0, { seed: 91 }), person(3, { seed: 92, hair: 'bob' })]; s.ppl[0].position.set(-1.0, 0, 0.0); s.ppl[0].rotation.y = 0.6; s.ppl[1].position.set(1.0, 0, 0.0); s.ppl[1].rotation.y = -0.6; s.ppl.forEach(p => s.stage.add(p));
    s.nd = cyl(0.02, 0.02, 0.6, '#f2d48a', 0, 0, 0, 6); s.stage.add(s.nd); return s; },
  draw(s, t, info) { const un = info.shot.id === 's10b' ? 0.1 : 99; s.ppl[0].pose(addPose(mixPose(POSE.stand, point(POSE.stand, 'L', 1, { up: 0.6 }), ease.out(prog(t, 0.2, 0.6))), { lean: 0.1 })); s.ppl[0].face(t > un ? EXPR.suspicious : EXPR.worried, t); s.ppl[1].pose(POSE.handsHips); s.ppl[1].face(EXPR.worried, t);
    const hp = new THREE.Vector3(); s.ppl[0].hand.L.getWorldPosition(hp); s.nd.position.copy(hp).add(new THREE.Vector3(0, -0.3, 0)); s.nd.rotation.z = Math.sin(t * 6) * 0.25;
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 5.6], look: [0, 1.7, 0.4], fov: 40 }], [info.dur, { pos: [0, 2.55, 5.0], look: [0, 1.7, 0.4], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, '1950s BRITAIN', W2, E.H * 0.18, t - 0.1, { size: 62, color: '#ffffff', rot: -3 }); fxr(g, t, s, [{ fx: 'question', on: s.ppl[1], at: 0.5, until: info.dur }]); },
});

// s10b "unusual dish in Britain." — close: dad dangles one noodle like a worm, "???"
registerShot('s10b', { kind: '3d',
  init(T) { const s = livingRoom(T); s.tab = rbox(2.4, 0.1, 1.4, '#7a5032', 0, 1.0, 0.8, 0.03); s.stage.add(s.tab); s.stage.add(cyl(0.1, 0.12, 1.0, '#5a3a22', 0, 0.5, 0.8, 8));
    s.pl = plateSpag(); s.pl.position.set(0, 1.06, 0.8); s.stage.add(s.pl); s.ppl = [person(0, { seed: 91 }), person(3, { seed: 92, hair: 'bob' })]; s.ppl[0].position.set(-1.0, 0, 0.0); s.ppl[0].rotation.y = 0.6; s.ppl[1].position.set(1.0, 0, 0.0); s.ppl[1].rotation.y = -0.6; s.ppl.forEach(p => s.stage.add(p));
    s.nd = cyl(0.02, 0.02, 0.6, '#f2d48a', 0, 0, 0, 6); s.stage.add(s.nd); return s; },
  draw(s, t, info) { const un = info.shot.id === 's10b' ? 0.1 : 99; s.ppl[0].pose(addPose(mixPose(POSE.stand, point(POSE.stand, 'L', 1, { up: 0.6 }), ease.out(prog(t, 0.2, 0.6))), { lean: 0.1 })); s.ppl[0].face(t > un ? EXPR.suspicious : EXPR.worried, t); s.ppl[1].pose(POSE.handsHips); s.ppl[1].face(EXPR.worried, t);
    const hp = new THREE.Vector3(); s.ppl[0].hand.L.getWorldPosition(hp); s.nd.position.copy(hp).add(new THREE.Vector3(0, -0.3, 0)); s.nd.rotation.z = Math.sin(t * 6) * 0.25;
    camMove(s.stage, t, [[0, { pos: [-0.3, 2.3, 2.6], look: [-0.5, 1.9, 0.2], fov: 38 }], [info.dur, { pos: [-0.3, 2.3, 2.2], look: [-0.5, 1.9, 0.2], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const un = at(info, 'unusual', 0.1); chip(g, 'UNUSUAL DISH', W2, E.H * 0.18, t - un, { size: 66, color: '#ffd23a', rot: -3 }); fxr(g, t, s, [{ fx: 'question', on: s.ppl[0], at: un + 0.1, until: info.dur }, { fx: 'sweat', on: s.ppl[1], at: un + 0.3, until: info.dur }]); },
});

// s11 "But here's the part..." — the living room at night, quiet... the phone on the side table
// s12 "the next day, viewers called in." — the phone rings and hops; RING! RING! chips; more phones
function phoneRoom(T, n = 1) { const s = livingRoom(T); s.tbl = rbox(0.9, 0.08, 0.7, '#7a5032', 0, 1.0, 0.3, 0.02); s.stage.add(s.tbl); s.stage.add(cyl(0.05, 0.06, 1.0, '#5a3a22', 0, 0.5, 0.3, 8));
  s.ph = [rotaryPhone()]; s.ph[0].position.set(0, 1.04, 0.3); s.stage.add(s.ph[0]); return s; }
registerShot('s11', { kind: '3d',
  init(T) { return phoneRoom(T); },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0.6, 1.9, 3.0], look: [0, 1.2, 0.3], fov: 38 }], [info.dur, { pos: [0.5, 1.75, 2.3], look: [0, 1.2, 0.3], fov: 38 }]]); s.stage.exposure = lerp(1.0, 0.8, t / info.dur); },
  overlay(g, t, info, s) { look(g, t, { k: 0.1 }); },
});
registerShot('s12', { kind: '3d',
  init(T) { return phoneRoom(T); },
  draw(s, t, info) { const ring = Math.abs(Math.sin(t * 22)); s.ph[0].position.y = 1.04 + ring * 0.08; s.ph[0].rotation.z = Math.sin(t * 22) * 0.08; s.ph[0].handset.position.y = 0.36 + ring * 0.05;
    camMove(s.stage, t, [[0, { pos: [0.5, 1.7, 2.2], look: [0, 1.2, 0.3], fov: 38 }], [info.dur, { pos: [0.4, 1.7, 1.9], look: [0, 1.2, 0.3], fov: 38 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.0, amp: 0.02, dur: info.dur }]); },
  overlay(g, t, info, s) { look(g, t); ['RING!', 'RING!', 'RING!', 'RING!'].forEach((r, i) => chip(g, r, W2 + [-280, 260, -220, 250][i], E.H * [0.2, 0.28, 0.5, 0.58][i], t - i * 0.3, { size: 64, color: i % 2 ? '#ff5a4a' : '#ffd23a', rot: i % 2 ? 8 : -8, ink: i % 2 ? '#ffffff' : undefined }));
  },
});
// s12b "viewers called in." — a row of phones on a long desk, all ringing and hopping: VIEWERS CALLED IN
registerShot('s12b', { kind: '3d',
  init(T) { const s = livingRoom(T); s.desk = rbox(5.5, 0.1, 0.9, '#7a5032', 0, 1.0, 0.3, 0.02); s.stage.add(s.desk); s.ph = [-2, -1, 0, 1, 2].map((x, i) => { const p = rotaryPhone({ color: ['#20202a', '#c0392b', '#2a5aa8', '#20202a', '#3a7a3a'][i] }); p.position.set(x, 1.05, 0.3); s.stage.add(p); return p; }); return s; },
  draw(s, t, info) { s.ph.forEach((p, i) => { const r = Math.abs(Math.sin(t * 22 + i * 1.3)); p.position.y = 1.05 + r * 0.08; p.rotation.z = Math.sin(t * 22 + i) * 0.08; p.handset.position.y = 0.36 + r * 0.05; });
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 4.6], look: [0, 1.2, 0.3], fov: 40 }], [info.dur, { pos: [0, 2.3, 4.0], look: [0, 1.2, 0.3], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.02, dur: info.dur }]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'VIEWERS CALLED IN', W2, E.H * 0.18, t - at(info, 'called', 0.4), { size: 62, color: '#ffffff', rot: -2 }); ['RING!', 'RING!', 'RING!'].forEach((r, i) => chip(g, r, W2 + [-300, 0, 300][i], E.H * 0.33, t - i * 0.15, { size: 56, color: i % 2 ? '#ff5a4a' : '#ffd23a', rot: i % 2 ? 8 : -8, ink: i % 2 ? '#ffffff' : undefined })); },
});
// s13 "Some wanted to know how to grow their own spaghetti tree." — a man in his garden, phone to ear on a long cord, shovel in hand, hopeful; "HOW DO I GROW ONE?"
registerShot('s13', { kind: '3d',
  init(T) { const s = orchardStage(T, { seed: 21 }); s.m = person(4, { seed: 96, colors: { main: '#6a8ab8', legs: '#4a3a2a' } }); s.stage.add(s.m); s.ph = rotaryPhone(); s.stage.add(s.ph); s.hole = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), toon('#5a3a22')); s.hole.rotation.x = -Math.PI / 2; s.hole.position.set(0.9, 0.02, 0.8); s.stage.add(s.hole); return s; },
  draw(s, t, info) { s.orch.update(t); s.m.pose(addPose(mixPose(POSE.facepalm, POSE.thinking, 0.5), { headTilt: 0.15, armR: [1.4, 0.4, 0.3], elbowR: 2.2 })); s.m.face({ ...EXPR.happy, talk: 1 }, t);
    const hp = new THREE.Vector3(); s.m.hand.R.getWorldPosition(hp); s.ph.handset.position.set(0, 0.36, -0.05); s.ph.position.set(-0.8, 0, 0.6);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 5.4], look: [0, 1.8, 0.4], fov: 40 }], [info.dur, { pos: [0.35, 2.25, 4.8], look: [0, 1.8, 0.4], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'question', on: 'm', at: 0.4, until: info.dur }]); },
});
// s13b "grow their own spaghetti tree." — close: heart eyes
registerShot('s13b', { kind: '3d',
  init(T) { const s = orchardStage(T, { seed: 21 }); s.m = person(4, { seed: 96, colors: { main: '#6a8ab8', legs: '#4a3a2a' } }); s.stage.add(s.m); s.ph = rotaryPhone(); s.stage.add(s.ph); s.hole = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), toon('#5a3a22')); s.hole.rotation.x = -Math.PI / 2; s.hole.position.set(0.9, 0.02, 0.8); s.stage.add(s.hole); return s; },
  draw(s, t, info) { s.orch.update(t); s.m.pose(addPose(mixPose(POSE.facepalm, POSE.thinking, 0.5), { headTilt: 0.15, armR: [1.4, 0.4, 0.3], elbowR: 2.2 })); s.m.face({ ...EXPR.happy, talk: 1 }, t);
    const hp = new THREE.Vector3(); s.m.hand.R.getWorldPosition(hp); s.ph.handset.position.set(0, 0.36, -0.05); s.ph.position.set(-0.8, 0, 0.6);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 3.0], look: [0, 2.0, 0.2], fov: 38 }], [info.dur, { pos: [0.3, 2.3, 2.6], look: [0, 2.05, 0.2], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'HOW DO I GROW ONE?', W2, E.H * 0.18, t - at(info, 'grow', 0.1), { size: 60, color: '#ffd23a', rot: -3 }); fxr(g, t, s, [{ fx: 'heartEyes', on: 'm', at: at(info, 'tree', 1.0) }]); },
});
// s14 "It was an April Fools' joke, of course." — a calendar page flips to APRIL 1; the presenter (B&W) gives a tiny smirk; FOOLS! stamp
registerShot('s14', { kind: '3d',
  init(T) { const s = livingRoom(T); s.desk = rbox(2.4, 0.9, 1.0, '#4a3a2a', 0, 0.45, 0.4, 0.05); s.stage.add(s.desk); s.p = person(5, { seed: 95, outfit: 'uniform', colors: { main: '#3a3a44', legs: '#2a2a30' }, hair: 'horseshoe', hairColor: '#5a4a3a' }); s.p.position.set(0, 0, -0.3); s.stage.add(s.p); return s; },
  draw(s, t, info) { const fo = at(info, 'fools', 0.9); s.p.pose(POSE.holdFront); s.p.face(t > fo ? { ...EXPR.smug, lid: 0.45 } : EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 3.0], look: [0, 2.05, 0], fov: 38 }], [info.dur, { pos: [0.25, 2.3, 2.5], look: [0, 2.05, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { const fo = at(info, 'fools', 0.9); g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, E.W, E.H); g.restore();
    const k = ease.outBack(clamp((t - 0.05) / 0.3)); if (k > 0) { g.save(); g.translate(W2, E.H * 0.24); g.scale(k, k); g.rotate(-0.05); g.fillStyle = '#fbf8f0'; g.strokeStyle = '#2a1c15'; g.lineWidth = 10; g.beginPath(); g.roundRect(-200, -170, 400, 340, 18); g.fill(); g.stroke(); g.fillStyle = '#e8402a'; g.fillRect(-195, -165, 390, 90);
      TXT(g, 'APRIL', 0, -120, 60, { color: '#ffffff' }); TXT(g, '1', 0, 55, 190, { color: '#2a1c15' }); g.restore(); }
    stamp(g, 'APRIL FOOLS!', W2, E.H * 0.42, t - fo - 0.1, { size: 92, rot: 7 }); },
});
// s15 "The reported advice?" — the presenter (B&W) leans in, finger raised
// s16 "Place a sprig of spaghetti in a tin of tomato sauce..." — a man plants a noodle sprig in a tin of tomato sauce, with great care
// s17 "and hope for the best." — PAYOFF: he waters it and waits; sun crosses the sky; the sprig wiggles; zzz
function tinGarden(T) { const s = orchardStage(T, { seed: 22 }); s.m = person(4, { seed: 96, colors: { main: '#6a8ab8', legs: '#4a3a2a' } }); s.m.position.set(-0.9, 0, 0.2); s.m.rotation.y = 0.6; s.stage.add(s.m); s.tin = tomatoTin(); s.tin.position.set(0.3, 0, 0.9); s.stage.add(s.tin); s.wc = wateringCan(); s.stage.add(s.wc); return s; }
registerShot('s15', { kind: '3d',
  init(T) { const s = livingRoom(T); s.desk = rbox(2.4, 0.9, 1.0, '#4a3a2a', 0, 0.45, 0.4, 0.05); s.stage.add(s.desk); s.p = person(5, { seed: 95, outfit: 'uniform', colors: { main: '#3a3a44', legs: '#2a2a30' }, hair: 'horseshoe', hairColor: '#5a4a3a' }); s.p.position.set(0, 0, -0.3); s.stage.add(s.p); return s; },
  draw(s, t, info) { s.p.pose(point(POSE.stand, 'R', 1, { up: 0.8 })); s.p.face({ ...EXPR.deadpan, talk: 1 }, t); camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 3.6], look: [0, 2.0, 0], fov: 38 }], [info.dur, { pos: [0.3, 2.3, 3.0], look: [0, 2.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, E.W, E.H); g.restore(); chip(g, 'THE ADVICE', W2, E.H * 0.18, t - 0.05, { size: 70, color: '#ffffff', rot: -3 }); },
});
registerShot('s16', { kind: '3d',
  init(T) { return tinGarden(T); },
  draw(s, t, info) { s.orch.update(t); s.tin.update(t); const sp = at(info, 'sprig', 0.4); const k = 0.35 * ease.out(prog(t, sp, info.dur)); s.tin.sprig.scale.setScalar(Math.max(0.001, k)); s.tin.sprig.position.y = 0.56 + (1 - k) * 0.6;
    s.m.pose(addPose(mixPose(POSE.holdFront, { ...POSE.holdFront, lean: 0.4 }, k), { headNod: 0.3 })); s.m.face({ ...EXPR.deadpan, lid: 0.3 }, t); s.wc.position.set(-1.6, 0, 1.0);
    camMove(s.stage, t, [[0, { pos: [0.6, 1.6, 3.6], look: [0.1, 0.8, 0.8], fov: 38 }], [info.dur, { pos: [0.55, 1.5, 3.0], look: [0.2, 0.7, 0.8], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'A SPRIG', W2 - 200, E.H * 0.18, t - at(info, 'sprig', 0.4), { size: 60, color: '#ffd23a', rot: -4 }); },
});
registerShot('s16b', { kind: '3d',
  init(T) { return tinGarden(T); },
  draw(s, t, info) { s.orch.update(t); s.tin.update(t); const sp = -0.6, tn = at(info, 'tomato', 0.4); const k = ease.out(prog(t, sp, tn + 0.3)); s.tin.sprig.scale.setScalar(Math.max(0.001, k)); s.tin.sprig.position.y = 0.56 + (1 - k) * 0.6;
    s.m.pose(addPose(mixPose(POSE.holdFront, { ...POSE.holdFront, lean: 0.4 }, k), { headNod: 0.3 })); s.m.face({ ...EXPR.deadpan, lid: 0.3 }, t); s.wc.position.set(-1.6, 0, 1.0);
    camMove(s.stage, t, [[0, { pos: [0.5, 1.3, 2.4], look: [0.3, 0.6, 0.9], fov: 36 }], [info.dur, { pos: [0.45, 1.25, 2.1], look: [0.3, 0.6, 0.9], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'TOMATO SAUCE', W2, E.H * 0.18, t - at(info, 'tomato', 0.3), { size: 64, color: '#ff5a4a', rot: 4, ink: '#ffffff' }); fxr(g, t, s, [{ fx: 'sparkle', on: s.tin, at: at(info, 'sauce', 0.8), scale: 0.6 }]); },
});
registerShot('s17', { kind: '3d',
  init(T) { return tinGarden(T); },
  draw(s, t, info) { s.orch.update(t); s.tin.update(t * 2); const ho = at(info, 'hope', 0.4); s.m.pose(addPose(POSE.sit, { headNod: 0.1 })); s.m.position.set(-1.0, 0, 0.6); s.m.face(t > ho + 0.6 ? EXPR.asleep : { ...EXPR.happy, pupil: [0.5, -0.4] }, t);
    const hp = new THREE.Vector3(); s.wc.position.set(-0.3, 0.35, 0.9); s.wc.rotation.z = -0.4;
    camMove(s.stage, t, [[0, { pos: [0.2, 1.8, 5.2], look: [-0.2, 0.9, 0.6], fov: 38 }], [info.dur, { pos: [0.2, 1.75, 4.6], look: [-0.2, 0.9, 0.6], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const be = at(info, 'best', 1.0); stamp(g, '...AND HOPE', W2, E.H * 0.18, t - be - 0.05, { size: 84, rot: -5, color: '#2f9a4a' }); fxr(g, t, s, [{ fx: 'zzz', on: 'm', at: be + 0.2, until: info.dur }, { fx: 'sparkle', on: s.tin, at: be + 0.4, scale: 0.6 }]); },
});
// s18 "Subscribe for more." — back to the orchard: frame 1's exact framing, the farmer tugging a noodle again -> loop
registerShot('s18', { kind: '3d',
  init(T) { return orchard(T, {}); },
  draw(s, t, info) { const k = farmerTug(s, t); treeTick(s, t, { pluck: [3, k] }); camMove(s.stage, t, [[0, { pos: [0.5, 2.7, 10.2], look: [0.1, 2.3, 0], fov: 40 }], [info.dur, F1]], ease.out); },
  overlay(g, t, info, s) { look(g, t); },
});
