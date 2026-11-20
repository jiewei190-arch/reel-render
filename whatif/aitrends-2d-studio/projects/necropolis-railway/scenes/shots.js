// London's corpse train — 14 shots, Toon 3D + BEANMEN effects. WTF / LOL, deadpan. Closed coffins only; nobody hurt.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, coffin, mourner, driver, fireman, clerk, digger, corpseTrain, coffinWagon, countryside, platformSet, churchyard,
  barSet, mug, cabSet, terminusNight, golfSet, golfBag, club, hookText, stamp, ticket, carriagePlan, routeMap, rbox, cyl, ball, plane, floor, label, outline, E,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.35 }, tint: '#ffd49a', tintAmount: 0.1 };
const soft = { rays: { from: [-70, -60], strength: 0.4 }, tint: '#ffe0b0' };
const HOOK = [[['the', '#ffffff'], ['corpse', '#ff5a4a']], [['train', '#ffd25a']]];
const CARS = [{ type: 'wagon', cls: [1, 2, 2, 1], sign: 'COFFINS ONLY' }, { type: 'wagon', cls: [2, 1, 1, 2], sign: 'COFFINS ONLY' }, { type: 'carriage' }];

// the hero train in the countryside (s01 = frame 1, s14 = the payoff; same set + framing so the loop is seamless)
function heroSet(T) {
  const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 16, target: [-4, 1, 0] });
  const env = countryside(st, { seed: 3 });
  const tr = corpseTrain(st, { cars: CARS, speed: 3 });
  return { stage: st, env, tr };
}
const X0 = -6, SPEED = 3;
// camera rides alongside the train (high 3/4 view: the coffin wagons fill the lower frame, the engine leads at the top right)
const heroKey = (x, k) => ({ pos: [x + lerp(-2.2, -2.8, k), lerp(8.4, 7.8, k), lerp(11.6, 10.6, k)], look: [x - 8.6, 1.6, 0], fov: lerp(44, 43, k) });
const HERO0 = heroKey(X0, 0);

// s01 — HOOK. A Victorian steam train whose open wagons carry coffins, already chugging toward us. Top caption "the corpse train".
registerShot('s01', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) {
    s.env.update(t); const x = X0 + SPEED * t; s.tr.position.x = x; s.tr.update(t, x);
    const k = ease.out(prog(t, 0, info.dur)); const v = heroKey(x, k); s.stage.cam(v.pos, v.look, v.fov);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.012, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookText(g, t, HOOK, { y: 270, size: 118 });
    stamp(g, t, 'LONDON, 1854', { at: at(info, 'dead', 1.4) - 0.1, x: 760, y: 560, size: 58, color: '#ffffff', fill: '#b8322a', rot: 0.06 });
  },
});

// s02 — "From 1854, it carried coffins and mourners" London platform: porters load a coffin, mourners in top hats wait.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 42, shadowSize: 12, target: [0, 1.5, 2] });
    const set = platformSet(st, { sign: 'NECROPOLIS', signX: -4 });
    const w = coffinWagon({ cls: [1, 3, 3, 3], n: 3 }); w.position.set(-1.2, 0, 0); st.add(w);
    const cf = coffin({ cls: 1 }); st.add(cf);
    const p1 = bean0('#4a3a2a', 31), p2 = bean0('#4a3a2a', 33, 'tan'); [p1, p2].forEach(p => st.add(p));
    const ms = [mourner({ seed: 3, moustache: true }), mourner({ seed: 7, woman: true, skin: 'light' }), mourner({ seed: 9, skin: 'tan', hair: 'horseshoe', hairColor: '#8a8580' })];
    ms.forEach((m, i) => { m.position.set(2.6 + i * 1.25, 1.0, 4.0 + (i % 2) * 0.7); m.rotation.y = -0.5; st.add(m); });
    return { stage: st, set, w, cf, p: [p1, p2], ms };
  },
  draw(s, t, info) {
    const k = ease.inOut(prog(t, 0, info.dur)); const cz = lerp(3.6, 2.0, k), cx = 0.6;
    s.cf.position.set(cx, 1.0 + 1.05, cz); s.cf.rotation.y = 0;
    s.p.forEach((p, i) => { p.position.set(cx + (i ? 1.45 : -1.45), 1.0, cz); p.rotation.y = i ? -Math.PI / 2 : Math.PI / 2; p.pose(addPose(POSE.holdFront, { ...idle(t, i + 2, 0.4), armL: [1.2, 0.1, 0], armR: [1.2, -0.1, 0], elbowL: 0.4, elbowR: 0.4 })); p.face(EXPR.deadpan, t); });
    s.ms.forEach((m, i) => { m.pose(addPose(POSE.stand, { ...idle(t, 4 + i, 0.4), headNod: 0.25 })); m.face(mixExpr(EXPR.sad, EXPR.deadpan, 0.3), t); });
    const cut = at(info, 'coffins', 1.8) - 0.12;   // hard punch-in on "coffins"
    if (t < cut) camMove(s.stage, t, [[0, { pos: [6.5, 4.0, 11.5], look: [0.5, 2.0, 2], fov: 44 }], [cut, { pos: [6.1, 3.9, 10.8], look: [0.5, 2.0, 2], fov: 44 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [3.2, 3.4, 7.2], look: [1.2, 2.1, 2.6], fov: 40 }], [info.dur - cut, { pos: [3.6, 3.5, 7.6], look: [1.8, 2.1, 2.8], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    hookText(g, t, HOOK, { y: 270, size: 118, until: 3.55 - info.shot.start });   // top caption held to 3.5 s across the cut
    stamp(g, t, '1854', { at: 0.05, x: 200, y: 520, size: 80, color: '#e23b2e', rot: -0.14 });
  },
});
function bean0(color, seed, skin = 'light') { return clerkLike(color, seed, skin); }
import { bean } from '/kits/toon3d/rig.js';
function clerkLike(color, seed, skin) { return bean({ name: 'Porter', outfit: 'uniform', head: 'cap', headColor: '#2a2a32', skin, hair: 'bowl', colors: { main: color }, seed }); }

// s03 — "23 miles out to Brookwood Cemetery." Route map card over the countryside line.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 16, target: [0, 1, 0] });
    const env = countryside(st, { seed: 6, graves: true });
    const tr = corpseTrain(st, { cars: CARS, speed: 4 }); return { stage: st, env, tr };
  },
  draw(s, t, info) {
    s.env.update(t); const x = -14 + 4 * t; s.tr.position.x = x; s.tr.update(t, x);
    camMove(s.stage, t, [[0, { pos: [0, 4, 16], look: [0, 2, 0], fov: 40 }], [info.dur, { pos: [0, 4, 15], look: [0, 2, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft); dimScene(g, 5, 0.3);
    routeMap(g, t, { travel: Math.max(1.2, at(info, 'Cemetery.', 1.7) - 0.2), milesT: at(info, '23', 0.1) - 0.05, y: E.H * 0.44 });
  },
});

// s04 — "London's graveyards were so full, every new grave cut into an old one." A packed churchyard; the digger's spade
// hits an older coffin lid (closed, wood only) — clunk, "!" . Punch-in on "every".
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'day', fov: 42, shadowSize: 12, target: [0, 1, 0] });
    const set = churchyard(st, { seed: 9 });
    const d = digger(); d.position.set(-0.9, 0, 1.4); d.rotation.y = 0.9; st.add(d);
    const spade = new THREE.Group(); spade.add(cyl(0.04, 0.04, 1.5, '#8a6a42', 0, 0.75, 0, 8), rbox(0.32, 0.4, 0.05, '#9a9aa2', 0, -0.1, 0, 0.04)); outline(spade, { px: 2.4 }); st.add(spade);
    return { stage: st, set, d, spade };
  },
  draw(s, t, info) {
    s.set.update(t);
    const hit = at(info, 'cut', 2.7) - 0.05;
    const dig = t < hit ? (Math.sin(t * 5) * 0.5 + 0.5) : 1 - ease.out(prog(t, hit, hit + 0.25)) * 0.4;
    const shock = ease.outBack(prog(t, hit + 0.05, hit + 0.3));
    s.d.pose(addPose(mixPose(POSE.holdFront, POSE.panic, shock * 0.4), { lean: 0.35 + dig * 0.2, armL: [1.0 + dig * 0.4, 0.1, 0], armR: [1.0 + dig * 0.4, -0.1, 0], ...tremble(t, shock * 0.6) }));
    s.d.face(mixExpr(EXPR.bored, EXPR.shocked, shock), t);
    const hp = new THREE.Vector3(); s.d.hand.R.getWorldPosition(hp); s.spade.position.copy(hp); s.spade.position.y -= 0.9; s.spade.rotation.set(0.35 - dig * 0.25, 0, -0.5);
    const cut = at(info, 'every', 2.0) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0.5, 5.5, 13], look: [0, 1.6, -2], fov: 44 }], [cut, { pos: [0.5, 5.2, 12], look: [0, 1.5, -2], fov: 44 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [3.0, 3.8, 7.8], look: [-0.1, 1.2, 1.0], fov: 42 }], [info.dur - cut, { pos: [2.7, 3.5, 7.0], look: [0.0, 1.0, 1.1], fov: 41 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.05, dur: 0.3 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#e8e0d0', tintAmount: 0.12 });
    stamp(g, t, 'FULL', { at: at(info, 'full,', 1.3) - 0.1, x: 540, y: 470, size: 110, color: '#e23b2e', fill: 'rgba(250,244,226,0.9)', rot: -0.1, until: at(info, 'every', 2.0) - 0.1 });
    const hit = at(info, 'cut', 2.7) - 0.05;
    reactions(g, t, s, [{ fx: 'exclaim', on: s.d, at: hit + 0.05, color: '#ff3b30' }, { fx: 'ripples', on: [0.4, 0.2, 1.1], at: hit, atFeet: true }]);
    stamp(g, t, 'NO ROOM', { at: hit + 0.2, x: 540, y: 400, size: 90, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
  },
});

// s05 — "So the dead got train tickets. One way, of course." Ticket clerk + a coffin on a trolley; ticket card; ONE WAY stamp.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 3] });
    const set = platformSet(st, { sign: 'TICKETS', signX: 0.5 });
    const ck = clerk(); ck.position.set(-0.6, 1.0, 3.8); ck.rotation.y = 0.35; st.add(ck);
    const trol = new THREE.Group(); trol.add(rbox(2.5, 0.12, 1.0, '#6a4a2a', 0, 0.55, 0, 0.03)); for (const x of [-1, 1]) for (const z of [-0.4, 0.4]) trol.add(cyl(0.15, 0.15, 0.08, '#2a2428', x, 0.15, z, 12).rotateX(Math.PI / 2)); outline(trol, { px: 2.4 });
    const cf = coffin({ cls: 1 }); cf.position.y = 0.62; trol.add(cf); trol.position.set(1.3, 1.0, 3.3); trol.rotation.y = -0.25; st.add(trol);
    const tk = rbox(0.4, 0.25, 0.02, '#f2e2b0', 0, 0, 0, 0.01); st.add(tk);
    return { stage: st, set, ck, trol, tk };
  },
  draw(s, t, info) {
    const give = ease.inOut(prog(t, 0.2, 0.7));
    s.ck.pose(addPose(point(POSE.stand, 'R', give, { up: 0.1, across: 0.2 }), idle(t, 6, 0.4))); s.ck.face(EXPR.deadpan, t);
    s.ck.hand.R.getWorldPosition(s.tk.position); s.tk.rotation.set(0.2, 0.3, 0.1);
    camMove(s.stage, t, [[0, { pos: [0.4, 3.3, 9.4], look: [0.2, 2.2, 3.4], fov: 38 }], [info.dur, { pos: [0.4, 3.0, 8.2], look: [0.2, 2.1, 3.4], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    const t0 = at(info, 'tickets.', 1.2) - 0.25;
    if (t > t0) { dimScene(g, 5, 0.42); ticket(g, t - t0, { title: 'COFFIN', sub: 'FIRST CLASS', y: E.H * 0.42 });
      stamp(g, t, 'ONE WAY', { at: at(info, 'One', 1.9) - 0.08, x: 560, y: E.H * 0.42 + 110, size: 110, color: '#d8342c', rot: -0.18, fill: 'rgba(250,244,226,0.55)' }); }
  },
});

// s06 — "And the carriages were split by religion and by class... for the living AND the dead." Blueprint of the split.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 12, target: [0, 1.5, 2] });
    const set = platformSet(st, { sign: 'NECROPOLIS', signX: 0 });
    const tr = corpseTrain(st, { cars: [{ type: 'carriage' }, { type: 'wagon' }] }); tr.position.x = 10;
    return { stage: st, set, tr };
  },
  draw(s, t, info) { s.tr.update(t, 0); camMove(s.stage, t, [[0, { pos: [0, 3.5, 10], look: [-1, 2, 0], fov: 40 }], [info.dur, { pos: [0, 3.3, 9], look: [-1, 2, 0], fov: 40 }]]); },
  overlay(g, t, info, s) {
    dimScene(g, 6, 0.4);
    const r = at(info, 'religion', 1.3) - 0.1, c = at(info, 'class...', 2.2) - 0.1, l = at(info, 'living', 3.2) - 0.1, d = at(info, 'dead.', 3.8) - 0.12;
    const zoom = 1 + 0.04 * prog(t, 0, info.dur); g.save(); g.translate(540, 900); g.scale(zoom, zoom); g.translate(-540, -900);
    g.translate(540, E.H * 0.40); g.scale(0.88, 0.88); g.translate(-540, -E.H * 0.40); carriagePlan(g, t, { relT: r, clsT: c, livT: l, deadT: d, y: E.H * 0.40 }); g.restore();
  },
});

// s07 — "No corpse had to share a compartment with the wrong crowd." Hearse-van cutaway: a polished 1st-class coffin and a
// plain 3rd-class one, a partition between them; a top-hatted mourner peeks over at the plain one and turns up his nose.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.2, 0] });
    const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#5a3a2a', 0, 0));
    const wall = plane(30, 9, '#6a2a32', 0, 4.5, -2); g.add(wall);
    for (let i = -6; i <= 6; i++) g.add(plane(0.08, 9, '#5a2028', i * 1.2, 4.5, -1.98));
    const part = rbox(0.22, 3.0, 3.6, '#4a2a1a', 0, 1.5, -0.2, 0.05); g.add(part); outline(part, { px: 2.4 });
    const shelfL = rbox(2.8, 0.7, 1.4, '#3a2418', -1.8, 0.35, -0.4, 0.05), shelfR = rbox(2.8, 0.7, 1.4, '#3a2418', 1.8, 0.35, -0.4, 0.05); g.add(shelfL, shelfR); outline(shelfL, { px: 2.4 }); outline(shelfR, { px: 2.4 });
    const c1 = coffin({ cls: 1, tag: '1ST' }); c1.position.set(-1.8, 0.72, -0.4); g.add(c1);
    const c3 = coffin({ cls: 3, tag: '3RD' }); c3.position.set(1.8, 0.72, -0.4); g.add(c3);
    const l1 = label('1ST CLASS', 1.9, 0.42, { bg: '#e0b84a' }); l1.position.set(-1.8, 2.7, -1.95); g.add(l1);
    const l3 = label('3RD CLASS', 1.9, 0.42, { bg: '#c8c0b0' }); l3.position.set(1.8, 2.7, -1.95); g.add(l3);
    const m = mourner({ seed: 3, moustache: true }); m.position.set(-2.4, 0, 1.7); m.rotation.y = 0.5; st.add(m);
    return { stage: st, m };
  },
  draw(s, t, info) {
    const peek = ease.inOut(prog(t, 0.3, 0.9)), snub = ease.outBack(prog(t, at(info, 'wrong', 1.7) - 0.1, at(info, 'wrong', 1.7) + 0.25));
    s.m.rotation.y = lerp(0.5, 0.9, peek) - snub * 0.9;
    s.m.pose(addPose(POSE.stand, { ...idle(t, 3, 0.4), lean: peek * 0.15 - snub * 0.1, headTilt: snub * 0.2, headNod: -snub * 0.35 }));
    s.m.face(mixExpr(mixExpr(EXPR.neutral, EXPR.suspicious, peek), EXPR.smug, snub), t);
    camMove(s.stage, t, [[0, { pos: [-0.3, 3.4, 11.5], look: [-0.3, 1.5, -0.4], fov: 40 }], [info.dur, { pos: [-0.6, 3.2, 10.5], look: [-0.5, 1.5, -0.4], fov: 39 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    reactions(g, t, s, [{ fx: 'sparkle', on: [-1.8, 1.5, -0.4], at: 0.1, scale: 0.7 }, { fx: 'question', on: s.m, at: 0.9, until: at(info, 'wrong', 1.7) - 0.1, scale: 0.8 }]);
    stamp(g, t, 'NO MIXING', { at: at(info, 'compartment', 0.8) - 0.1, x: 540, y: 420, size: 96, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
  },
});

// s08 — "But here's the part... golfers dressed up as mourners" Three mourners in a row; the middle one has a golf bag.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 10, target: [0, 1.5, 3] });
    const set = platformSet(st, { sign: 'NECROPOLIS', signX: 3.2 });
    const ms = [mourner({ seed: 5, woman: true }), mourner({ seed: 11, skin: 'tan', moustache: true }), mourner({ seed: 15, skin: 'light', hair: 'horseshoe', hairColor: '#6a5a4a' })];
    ms.forEach((m, i) => { m.position.set(-1.6 + i * 1.6, 1.0, 3.8); m.rotation.y = 0; st.add(m); });
    const bag = golfBag(); st.add(bag);
    return { stage: st, set, ms, bag };
  },
  draw(s, t, info) {
    const gk = at(info, 'golfers', 1.8) - 0.1, rev = ease.outBack(prog(t, gk, gk + 0.3));
    s.ms.forEach((m, i) => { const shifty = i === 1 ? rev : 0;
      m.pose(addPose(POSE.stand, { ...idle(t, 3 + i, 0.4), headNod: 0.25 * (1 - shifty), headTurn: i === 1 ? Math.sin(t * 5) * 0.3 * shifty : 0 }));
      m.face(i === 1 ? mixExpr(EXPR.sad, { ...EXPR.suspicious, pupil: [Math.sin(t * 5) > 0 ? 0.8 : -0.8, 0] }, shifty) : EXPR.sad, t); });
    const m = s.ms[1]; s.bag.position.set(m.position.x + 0.45, 1.0 + 0.35, m.position.z - 0.45); s.bag.rotation.set(-0.15, 0, -0.35);
    if (t < gk) camMove(s.stage, t, [[0, { pos: [0, 3.6, 11], look: [0, 2.4, 3.8], fov: 40 }], [gk, { pos: [0, 3.4, 9.6], look: [0, 2.4, 3.8], fov: 40 }]]);
    else camMove(s.stage, t - gk, [[0, { pos: [0.5, 3.7, 8.6], look: [0.2, 2.9, 3.8], fov: 38 }], [info.dur - gk, { pos: [0.4, 3.65, 8.2], look: [0.2, 2.9, 3.8], fov: 37 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    const gk = at(info, 'golfers', 1.8) - 0.1;
    reactions(g, t, s, [{ fx: 'sweat', on: s.ms[1], at: gk + 0.2 }, { fx: 'spotlight', at: gk, until: info.dur }]);
    stamp(g, t, 'GOLFERS?!', { at: gk, x: 540, y: 430, size: 104, color: '#ffffff', fill: '#2f6a3a', rot: -0.07 });
  },
});

// s09 — "...to ride it to a golf course." The same "mourner", top hat on, tees off beside the cemetery fence.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0] });
    const set = golfSet(st);
    const m = mourner({ seed: 11, skin: 'tan', moustache: true }); m.position.set(-0.6, 0, 1.2); m.rotation.y = 1.2; st.add(m);
    const cl = club(); st.add(cl); const bl = ball(0.07, '#ffffff', 0, 0.07, 0, 10); st.add(bl);
    return { stage: st, set, m, cl, bl };
  },
  draw(s, t, info) {
    s.set.update(t);
    const sw = ease.inOut(prog(t, 0.0, 0.25)), hit = ease.out(prog(t, 0.25, 0.4));
    const a = lerp(lerp(0.9, 2.6, sw), -1.2, hit);
    s.m.pose(addPose(POSE.stand, { armL: [a, 0.1, 0], armR: [a, -0.3, 0], elbowL: 0.1, elbowR: 0.1, twist: lerp(0.5, -0.6, hit), lean: 0.2, headNod: 0.3 * (1 - hit) }));
    s.m.face(mixExpr(EXPR.deadpan, EXPR.grin, hit), t);
    const hp = new THREE.Vector3(); s.m.hand.R.getWorldPosition(hp); s.cl.position.copy(hp); s.cl.rotation.set(0, 1.2, a - Math.PI * 0.95);
    const f = clamp((t - 0.38) / 1.2); s.bl.position.set(0.0 + f * 9, 0.07 + Math.sin(f * Math.PI) * 4, 1.6 - f * 12);
    camMove(s.stage, t, [[0, { pos: [1.6, 2.6, 7.4], look: [-0.4, 1.6, 1.0], fov: 40 }], [info.dur, { pos: [1.9, 2.7, 6.8], look: [0.2, 1.9, 0.4], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: s.m, at: 0.4, scale: 0.8 }, { fx: 'speedlines', at: 0.3, until: 0.8 }]);
    stamp(g, t, 'FORE!', { at: 0.35, x: 760, y: 470, size: 90, color: '#ffffff', fill: '#2f6a3a', rot: 0.08 });
  },
});

// s10 — "And in 1867, the driver got so drunk at the cemetery bar," Driver at the station bar, mug in hand, swaying; stars.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.5, 0] });
    const set = barSet(st);
    const d = driver(); d.position.set(-0.4, 0, 0.2); st.add(d);
    const mg = mug(); st.add(mg);
    const mugs = [-2.2, -1.6, 1.4, 2.0].map((x, i) => { const m = mug(); m.position.set(x, set.counterY, -1.4 + (i % 2) * 0.2); st.add(m); return m; });
    return { stage: st, set, d, mg };
  },
  draw(s, t, info) {
    const dk = at(info, 'drunk', 2.2) - 0.1, w = ease.inOut(prog(t, dk - 0.3, dk + 0.3));
    s.d.position.x = -0.4 + Math.sin(t * 2.2) * 0.12 * w;
    s.d.pose(addPose(POSE.stand, { ...idle(t, 2, 0.5), armR: [1.6 + Math.sin(t * 3) * 0.15, -0.2, 0], elbowR: 1.2, side: Math.sin(t * 2.2) * 0.18 * w, headTilt: Math.sin(t * 2.2 + 1) * 0.25 * w, lean: -0.05 * w }));
    s.d.face(mixExpr({ ...EXPR.happy, lid: 0.35 }, { ...EXPR.happy, lid: 0.7, mouth: 'wavy', pupil: [Math.sin(t * 4) * 0.5, 0.1] }, w), t);
    s.d.hand.R.getWorldPosition(s.mg.position); s.mg.position.y -= 0.15; s.mg.rotation.z = Math.sin(t * 3) * 0.2;
    if (t < dk) camMove(s.stage, t, [[0, { pos: [0, 3.0, 7.6], look: [0, 2.0, -0.5], fov: 38 }], [dk, { pos: [0, 2.9, 7.0], look: [0, 2.0, -0.5], fov: 38 }]]);
    else camMove(s.stage, t - dk, [[0, { pos: [0.3, 2.6, 4.6], look: [-0.3, 2.2, 0], fov: 36 }], [info.dur - dk, { pos: [0.2, 2.55, 4.2], look: [-0.3, 2.2, 0], fov: 35 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffbf7a', tintAmount: 0.18 });
    stamp(g, t, '1867', { at: 0.15, x: 200, y: 470, size: 92, color: '#e23b2e', rot: -0.14 });
    const dk = at(info, 'drunk', 2.2) - 0.1;
    reactions(g, t, s, [{ fx: 'stars', on: s.d, at: dk + 0.05, until: info.dur, scale: 0.9 }]);
  },
});

// s11 — "the fireman had to drive the train home." In the cab: the fireman grips the regulator, sweating; the driver dozes.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 6, target: [0, 1.5, 0] });
    const set = cabSet(st);
    const f = fireman(); f.position.set(0.7, 0, -0.3); f.rotation.y = -0.6; st.add(f);
    const d = driver(); d.position.set(-0.9, 0, 0.9); d.rotation.y = 0.6; st.add(d);
    return { stage: st, set, f, d };
  },
  draw(s, t, info) {
    s.set.update(t);
    s.f.pose(addPose(POSE.stand, { ...tremble(t, 0.5), armR: [1.5, -0.4, 0], elbowR: 0.5, armL: [0.6, 0.3, 0], lean: 0.12 })); s.f.face(mixExpr(EXPR.worried, EXPR.panic, 0.35 + 0.15 * Math.sin(t * 4)), t);
    s.set.lever.rotation.x = -0.4 - Math.sin(t * 3) * 0.05;
    s.d.position.y = -0.85; s.d.pose(addPose(POSE.sit, { headTilt: 0.45, headNod: 0.4, side: 0.15, ...idle(t, 6, 0.5) })); s.d.face({ ...EXPR.asleep, mouth: 'o' }, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 5.4], look: [0, 1.6, -0.6], fov: 44 }], [info.dur, { pos: [0.1, 2.5, 4.8], look: [0, 1.6, -0.6], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.015, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffaf6a', tintAmount: 0.2 });
    reactions(g, t, s, [{ fx: 'sweat', on: s.f, at: 0.1 }, { fx: 'zzz', on: s.d, at: 0.2, scale: 0.8 }]);
    stamp(g, t, 'FIREMAN DRIVING', { at: at(info, 'fireman', 0.3) - 0.05, x: 540, y: 430, size: 70, color: '#ffffff', fill: '#b8322a', rot: -0.05 });
  },
});

// s12 — "It ran for 87 years..." The train streams past the camera; counter 87 YEARS.
registerShot('s12', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 16, target: [0, 1, 0] });
    const env = countryside(st, { seed: 8 });
    const tr = corpseTrain(st, { cars: [...CARS, { type: 'wagon', cls: [1, 1, 3, 3] }], speed: 7 }); return { stage: st, env, tr };
  },
  draw(s, t, info) {
    s.env.update(t); const x = -4 + 7 * t; s.tr.position.x = x; s.tr.update(t, x);
    camMove(s.stage, t, [[0, { pos: [2, 2.6, 9.5], look: [-2, 2, 0], fov: 42 }], [info.dur, { pos: [2.5, 2.6, 9.0], look: [-1, 2, 0], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft); dimScene(g, 4, 0.3);
    drawInsert(g, { type: 'counter', title: 'IN SERVICE', value: 87, from: 0, suffix: ' YEARS', lines: ['1854 - 1941'], color: '#ffcf4a' }, t);
  },
});

// s13 — "until a 1941 air raid wrecked its London station." Night: the empty terminus, searchlights, fire + smoke. Nobody shown.
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'night', fov: 42, shadowSize: 14, target: [-2, 3, -3] });
    const set = terminusNight(st); return { stage: st, set };
  },
  draw(s, t, info) {
    s.set.update(t);
    const wk = at(info, 'wrecked', 1.5) - 0.05;
    if (t < wk) camMove(s.stage, t, [[0, { pos: [2, 4.2, 15], look: [-1.5, 4.4, -3], fov: 42 }], [wk, { pos: [2, 4.1, 14], look: [-1.5, 4.4, -3], fov: 42 }]]);
    else camMove(s.stage, t - wk, [[0, { pos: [-1, 3.6, 9.5], look: [-3.5, 4.0, -3], fov: 40 }], [info.dur - wk, { pos: [-1, 3.6, 9.0], look: [-3.5, 4.1, -3], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: wk, amp: 0.09, dur: 0.5 }]);
  },
  overlay(g, t, info, s) {
    // searchlights (2D beams from the bottom of frame, sweeping)
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const [x0, ph, sp] of [[180, 0, 0.5], [880, 2, 0.4], [520, 4, 0.33]]) { const a = -Math.PI / 2 + Math.sin(t * sp + ph) * 0.5; g.save(); g.translate(x0, E.H + 40); g.rotate(a + Math.PI / 2);
      const gr = g.createLinearGradient(0, 0, 0, -1900); gr.addColorStop(0, 'rgba(220,230,255,0.28)'); gr.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-25, 0); g.lineTo(25, 0); g.lineTo(150, -1900); g.lineTo(-150, -1900); g.closePath(); g.fill(); g.restore(); }
    g.restore();
    const wk = at(info, 'wrecked', 1.5) - 0.05;
    reactions(g, t, s, [{ fx: 'flash', at: wk, dur: 0.25, color: '#ffd8a0' }]);
    stamp(g, t, 'APRIL 1941', { at: at(info, '1941', 0.3) - 0.1, x: 540, y: 400, size: 96, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
    stamp(g, t, 'AIR RAID', { at: at(info, 'raid', 1.0) - 0.05, x: 760, y: 560, size: 70, color: '#ffd25a', rot: 0.1 });
  },
});

// s14 — PAYOFF: "The corpse train never ran again." The same train in frame 1's place, parked; the steam thins. The camera
// settles on frame 1's framing, so the cut back to frame 1 (the train chugging on) loops.
registerShot('s14', { kind: '3d',
  init(T) { const s = heroSet(T); s.tr.position.x = X0; return s; },
  draw(s, t, info) {
    s.env.update(t); s.tr.position.x = X0; s.tr.update(t, X0);
    s.tr.smoke.scale.setScalar(Math.max(0.05, 1 - prog(t, 0, info.dur * 0.8))); s.tr.trail.scale.setScalar(Math.max(0.05, 1 - prog(t, 0, info.dur * 0.6)));
    camMove(s.stage, t, [[0, { pos: [5.2, 3.6, 5.2], look: [-3.5, 2.0, 0], fov: 38 }], [info.dur, HERO0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.5 }, tint: '#ffc890', tintAmount: 0.18 });
    stamp(g, t, 'NEVER RAN AGAIN', { at: at(info, 'never', 0.9) - 0.1, x: 540, y: 420, size: 82, color: '#ffffff', fill: '#2a2630', rot: -0.05 });
  },
});
