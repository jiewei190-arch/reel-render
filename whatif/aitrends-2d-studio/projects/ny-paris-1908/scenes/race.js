// The 1908 New York to Paris Race — 15 shots, Toon 3D + BEANMEN effects. LOL / wow. Nobody hurt; no flags; no brand logos.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, car, driver, villager, onlooker, timesSquare, railLine, snowField, steamer, mudPlain, parisFinish, train,
  hookText, stamp, sixCars, ball, rbox, cyl, box, toon, rng, canvasTex,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const GREY = { rays: false, tint: '#c9d4e0', tintAmount: 0.18 };

// seat a bean in a car (child of car.body so it bounces with it)
function seat(c, b, i) { const [x, z] = c.seats[i]; b.position.set(x, c.seatY - 0.82, z); c.body.add(b); return b; }
const SIT = (t, seed, extra = {}) => addPose(POSE.sit, { ...idle(t, seed, 0.4), ...extra });
// brown mud gobs thrown back from a spinning wheel (local to the car)
function mudSpray(c, n = 14, seed = 3) {
  const r = rng(seed); const m = toon('#5a3a22'); const P = [];
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), m); b.scale.setScalar(0.08 + r() * 0.1); b.userData.noOutline = true; c.add(b); P.push({ b, sx: r() < 0.5 ? -1 : 1, ph: r(), vx: (r() - 0.5) * 1.2, vy: 2.5 + r() * 2, vz: -(2 + r() * 2.5) }); }
  return { update(t, on = 1) { P.forEach(p => { const a = ((t * 1.6 + p.ph) % 1); const tt = a * 0.9; p.b.visible = on > 0.1; p.b.position.set(p.sx * 0.9 + p.vx * tt, 0.5 + p.vy * tt - 4.9 * tt * tt, -1.55 + p.vz * tt); }); } };
}

// ---------------------------------------------------------------- hero mud set (s01 = frame 1, s15 = payoff; same framing -> loop)
function mudHero(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 11, target: [0, 1, -1] });
  const env = mudPlain(st, { seed: 11 });
  const c = car({ team: 'USA', mud: 1, seed: 4, trophy: !!o.trophy }); c.position.set(0, -0.32, -1.2); st.add(c);   // sunk in the mud
  const d = seat(c, driver({ seed: 3, skin: 'fair' }), 0);
  const pull = [driver({ seed: 6, skin: 'tan', coat: '#8a7a5a', cap: '#3a3a3a', over: { hair: 'bowl' } }), driver({ seed: 8, skin: 'light', coat: '#6a5a4a', moustache: false, over: { hair: 'curly', hairColor: '#8a5a2a' } })];
  pull.forEach((p, i) => { p.position.set(i ? 1.0 : -1.0, 0, 4.6 + i * 0.5); st.add(p); });
  const ropeM = toon('#c8b080'); const ropes = pull.map(() => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), ropeM); st.add(r); return r; });
  const vill = [0, 1, 2, 3].map(i => { const v = villager({ seed: 31 + i * 7 }); v.position.set(i < 2 ? -3.6 - i * 1.2 : 3.4 + (i - 2) * 1.2, 0, 2.4 - (i % 2) * 1.4); v.rotation.y = i < 2 ? 0.9 : -0.9; st.add(v); return v; });
  const spray = mudSpray(c, 16, 5);
  return { stage: st, env, c, d, pull, ropes, vill, spray };
}
const HERO0 = { pos: [5.5, 4.6, 15.5], look: [0, 1.4, 1.2], fov: 46 }, HERO1 = { pos: [4.8, 4.2, 13.6], look: [0, 1.5, 1.2], fov: 45 };
function mudHeroDraw(s, t) {
  s.env.update(t);
  const tug = Math.sin(t * 5.5); s.c.drive(t * 9); s.c.bounce(t, 0.7, 9); s.c.position.z = -1.2 + Math.max(0, tug) * 0.06; s.spray.update(t);
  s.pull.forEach((p, i) => { p.pose(addPose(POSE.stand, { armR: [-0.5, 0.35, 0], elbowR: 1.6, armL: [0.9, 0.2, 0.3], elbowL: 0.8, lean: 0.45 + Math.max(0, tug) * 0.12, legL: [0.5, 0.05], legR: [-0.45, 0.05], kneeL: 0.5, kneeR: 0.15, ...tremble(t, 0.8), bob: -0.1 })); p.rotation.y = i ? -0.25 : 0.25;
    p.face(mixExpr(EXPR.panic, EXPR.angry, 0.5 + 0.5 * Math.sin(t * 3 + i)), t);
    const hand = new THREE.Vector3(); p.hand.R.getWorldPosition(hand); const front = new THREE.Vector3(i ? 0.5 : -0.5, 0.75, 1.05 + s.c.position.z + 0.2); front.y += -0.32;
    const r = s.ropes[i]; const mid = hand.clone().add(front).multiplyScalar(0.5); r.position.copy(mid); const dir = hand.clone().sub(front); r.scale.y = dir.length(); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()); });
  s.d.pose(SIT(t, 3, { armL: [0.9, 0.2, 0.4], armR: [0.9, 0.2, 0.4], elbowL: 0.9, elbowR: 0.9, ...tremble(t, 0.6) })); s.d.face(EXPR.worried, t);
  s.vill.forEach((v, i) => { v.pose(addPose(i % 2 ? POSE.handsHips : POSE.relaxed, { ...idle(t, 10 + i, 0.5), ...nod(t * 0.4 + i, 0.06) })); v.face(i === 1 ? EXPR.grin : mixExpr(EXPR.bored, EXPR.smug, (i % 3) * 0.4), t); });
}

// s01 — HOOK. "In 1908, six cars raced around the world to Paris." A 1908 car sunk in Siberian mud, crew hauling on ropes,
// villagers watching, unimpressed. Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return mudHero(T); },
  draw(s, t, info) { mudHeroDraw(s, t); camMove(s.stage, t, [[0, HERO0], [info.dur, HERO1]], ease.out); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, GREY);
    hookText(g, t, ['a car race', 'AROUND THE WORLD'], { y: 290, sizes: [70, 92], colors: ['#ffffff', '#ffd25a'] });
    stamp(g, t, 'IN 1908 CARS', { at: 0.35, x: 540, y: 520, size: 70, color: '#ffffff', fill: '#c0392b', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sweat', on: s.pull[0], at: 0.3 }, { fx: 'sweat', on: s.pull[1], at: 0.5 }]);
  },
});

// s02 — "They left Times Square in February," Snowy street, cars lined up under the banner, a crowd in coats. FEB 12, 1908.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'day', fov: 42, shadowSize: 12, target: [0, 1, -4], bg: ['#9fb4cc', '#dfe6ee'] });
    const set = timesSquare(st, { seed: 2 });
    const cars = [['USA', -1.6, -3], ['GER', 1.6, -3.5], ['ITA', -1.6, -10], ['FRA', 1.6, -10.5]].map(([tm, x, z]) => { const c = car({ team: tm }); c.position.set(x, 0, z); c.scale.setScalar(0.62); st.add(c); return c; });
    const ds = cars.slice(0, 2).map((c, i) => seat(c, driver({ seed: 3 + i * 5, skin: i ? 'light' : 'fair', coat: i ? '#5a5a62' : '#a88a5a' }), 0));
    const crowd = []; for (let i = 0; i < 8; i++) { const p = onlooker({ seed: 50 + i }); const sx = i % 2 ? 1 : -1; p.position.set(sx * (4.0 + (i % 3) * 0.6), 0, 1.5 - Math.floor(i / 2) * 2.4); p.rotation.y = -sx * 0.9; st.add(p); crowd.push(p); }
    return { stage: st, set, cars, ds, crowd };
  },
  draw(s, t, info) {
    s.cars.forEach((c, i) => c.bounce(t + i, 0.25, 14));
    s.ds.forEach((d, i) => { d.pose(SIT(t, 4 + i, { armR: [1.0, 0.2, 0.3], elbowR: 0.8 })); d.face(EXPR.happy, t); });
    s.crowd.forEach((p, i) => { const cheer = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.3); p.pose(addPose(mixPose(POSE.relaxed, POSE.armsUp, i % 3 === 0 ? cheer : 0.15), idle(t, 20 + i, 0.6))); p.face(i % 2 ? EXPR.happy : EXPR.grin, t); });
    camMove(s.stage, t, [[0, { pos: [0, 4.6, 12.5], look: [0, 3.6, -8], fov: 52 }], [info.dur, { pos: [0, 4.2, 10.8], look: [0, 3.4, -8], fov: 50 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#dfe8ff', tintAmount: 0.12 });
    hookText(g, t, ['a car race', 'AROUND THE WORLD'], { y: 290, sizes: [70, 92], colors: ['#ffffff', '#ffd25a'], until: Math.max(0, 3.5 - info.shot.start) });
    stamp(g, t, 'FEB 12, 1908', { at: at(info, 'February,', 1.0) - 0.1, x: 540, y: 1180, size: 80, color: '#c0392b', fill: 'rgba(250,244,226,0.94)', rot: -0.07 });
    reactions(g, t, s, [{ fx: 'flash', at: 0, dur: 0.15, color: '#ffffff' }]);
  },
});

// s03 — "with almost no roads ahead." The car rolls to the end of the road: a signpost, then just snow. Driver's jaw drops.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0] });
    const env = snowField(st, { seed: 7 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(4, 14), toon('#8a7a6a')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.015, 8); st.add(road);
    const c = car({ team: 'USA' }); st.add(c); const d = seat(c, driver({ seed: 3 }), 0);
    const sign = new THREE.Group(); sign.add(cyl(0.08, 0.08, 2.6, '#6a4a32', 0, 1.3, 0, 6));
    const tx = canvasTex(512, 160, (x, W, H) => { x.fillStyle = '#f6efd8'; x.fillRect(0, 0, W, H); x.strokeStyle = '#2a1c15'; x.lineWidth = 14; x.strokeRect(7, 7, W - 14, H - 14); x.fillStyle = '#a8322a'; x.font = '900 76px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ROAD ENDS', W / 2, H / 2 + 4); });
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.56), toon('#ffffff', { map: tx })); sp.position.set(0, 2.4, 0.06); sp.userData.noOutline = true; sign.add(sp, rbox(1.9, 0.62, 0.08, '#6a4a32', 0, 2.4, 0, 0.02)); sign.position.set(-2.6, 0, 1.4); sign.rotation.y = 0.35; st.add(sign);
    return { stage: st, env, c, d };
  },
  draw(s, t, info) {
    s.env.update(t);
    const stop = ease.out(prog(t, 0, 0.9)); const z = lerp(9, 2.6, stop); s.c.position.z = z; s.c.drive(z * -1); s.c.bounce(t, 1 - stop * 0.7, 10);
    const drop = prog(t, 0.6, 0.85);
    s.d.pose(SIT(t, 3, { armL: [0.9, 0.2, 0.4], armR: [0.9, 0.2, 0.4], elbowL: 0.9, elbowR: 0.9, headTurn: drop * 0.2 })); s.d.face(mixExpr(EXPR.happy, EXPR.shocked, drop), t);
    camMove(s.stage, t, [[0, { pos: [3.2, 2.6, -6.5], look: [0, 1.6, 3], fov: 44 }], [info.dur, { pos: [2.6, 2.3, -4.6], look: [0, 1.8, 2.8], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'question', on: s.d, at: 0.85, scale: 0.9 }]);
    stamp(g, t, 'ROADS: ALMOST NONE', { at: at(info, 'roads', 0.7) - 0.05, x: 540, y: 380, size: 64, color: '#ffffff', fill: '#2a3a5a', rot: -0.05 });
  },
});

// s04 — "When the roads ran out, they drove on railway tracks, tie to tie, for hundreds of miles." The car straddles the
// rails and bangs over every tie; punch-in on the crew rattling at "hundreds".
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 12, target: [0, 1, -2] });
    const env = railLine(st, { snow: true });
    const c = car({ team: 'USA' }); c.position.set(0, 0.28, 0); st.add(c);
    const d = seat(c, driver({ seed: 3 }), 0), d2 = seat(c, driver({ seed: 6, skin: 'tan', coat: '#8a7a5a', cap: '#3a3a3a', over: { hair: 'bowl' } }), 1);
    const d3 = seat(c, driver({ seed: 8, skin: 'light', coat: '#6a5a4a', moustache: false, over: { hair: 'curly', hairColor: '#8a5a2a' } }), 2);
    return { stage: st, env, c, crew: [d, d2, d3] };
  },
  draw(s, t, info) {
    s.env.update(t);
    const v = 4.2, z = -t * v; s.c.position.z = z; s.c.drive(-z);
    const tie = (((-z) % 0.9) / 0.9); const bump = Math.pow(1 - tie, 6);   // a sharp jolt on every tie
    s.c.body.position.y = bump * 0.16; s.c.body.rotation.x = (bump - 0.3) * 0.05; s.c.body.rotation.z = Math.sin(t * 13) * 0.02;
    s.crew.forEach((d, i) => { d.pose(SIT(t, 3 + i, { ...tremble(t, 2.2), bob: bump * 0.12, headNod: -bump * 0.25, ...(i === 0 ? { armL: [0.9, 0.2, 0.4], armR: [0.9, 0.2, 0.4], elbowL: 0.9, elbowR: 0.9 } : {}) })); d.face(mixExpr(EXPR.worried, EXPR.shocked, bump), t); });
    const cut = at(info, 'hundreds', 3.2) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [7.2, 3.6, z + 9.0], look: [0, 1.8, z - 1], fov: 46 }], [cut, { pos: [6.6, 3.4, z + 8.0], look: [0, 1.8, z - 1], fov: 46 }]]);
    else { const zz = z; s.stage.cam([3.2, 3.2, zz + 5.0], [0, 2.4, zz - 0.6], 42); }
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.45 }, tint: '#ffe8c8' });
    stamp(g, t, 'ON THE RAILS', { at: at(info, 'railway', 0.5) - 0.1, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#2a3a5a', rot: -0.06, until: at(info, 'tie', 2.0) - 0.05 });
    stamp(g, t, 'BUMP', { at: at(info, 'tie', 2.0), x: 300, y: 520, size: 68, color: '#e23b2e', rot: -0.2, until: at(info, 'hundreds', 3.2) - 0.1 });
    stamp(g, t, 'BUMP', { at: at(info, 'tie', 2.3, 2), x: 770, y: 600, size: 68, color: '#e23b2e', rot: 0.18, until: at(info, 'hundreds', 3.2) - 0.1 });
    stamp(g, t, 'HUNDREDS OF MILES', { at: at(info, 'hundreds', 3.2), x: 540, y: 380, size: 66, color: '#ffffff', fill: '#c0392b', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'speedlines', at: 0, until: info.dur }]);
  },
});

// s05 — "Alaska was so impossible," The car is buried to its bonnet in snow; the driver stands on the seat and shrugs.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0] });
    const env = snowField(st, { seed: 9 });
    const c = car({ team: 'USA' }); c.position.set(0, -0.45, 0); c.rotation.y = 0.9; st.add(c);
    const r = rng(2); for (let i = 0; i < 9; i++) { const b = ball(1.0 + r() * 0.5, '#f6f8fc', (-2 + r() * 4) * 1.1, 0.1, -2.6 + r() * 5.2, 12); b.scale.y = 0.55; st.add(b); }
    const d = driver({ seed: 3 }); d.position.set(0.3, 1.0, 0.4); c.body.add(d);
    return { stage: st, env, c, d };
  },
  draw(s, t, info) {
    s.env.update(t);
    const sh = ease.inOut(prog(t, 0.5, 0.9));
    s.d.pose(addPose(shrug(POSE.stand, sh), { ...idle(t, 3, 0.4), legL: [0, 0.12], legR: [0, 0.12] })); s.d.face(mixExpr(EXPR.deadpan, EXPR.worried, sh), t);
    camMove(s.stage, t, [[0, { pos: [1.5, 4.0, 11.0], look: [0, 1.8, 0], fov: 44 }], [info.dur, { pos: [1.2, 3.6, 9.4], look: [0, 1.9, 0], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.4 }, tint: '#dfe8ff', tintAmount: 0.15 });
    stamp(g, t, 'ALASKA', { at: 0.05, x: 300, y: 330, size: 76, color: '#2a5a9a', fill: 'rgba(250,250,255,0.94)', rot: -0.1 });
    stamp(g, t, 'IMPOSSIBLE', { at: at(info, 'impossible,', 0.9) - 0.05, x: 650, y: 540, size: 80, color: '#e23b2e', rot: 0.08 });
    reactions(g, t, s, [{ fx: 'sweat', on: s.d, at: 0.6 }]);
  },
});

// s06 — "the race was rerouted by steamer to Japan." The car rides the deck of a rocking steamer; driver hangs on.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 14, target: [0, 2, -2] });
    const env = steamer(st);
    const c = car({ team: 'USA' }); c.scale.setScalar(0.62); c.position.set(0, env.deckY, 0.5); c.rotation.y = 0.0; env.ship.add(c);
    const d = seat(c, driver({ seed: 3 }), 0);
    return { stage: st, env, c, d };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.d.pose(SIT(t, 3, { armL: [0.9, 0.2, 0.4], armR: [0.9, 0.2, 0.4], elbowL: 0.9, elbowR: 0.9, side: Math.sin(t * 1.2) * 0.1 })); s.d.face(mixExpr(EXPR.worried, EXPR.bored, 0.4), t);
    camMove(s.stage, t, [[0, { pos: [9, 6.5, 12], look: [0, 2.5, -2], fov: 46 }], [info.dur, { pos: [7.5, 5.6, 10], look: [0, 2.5, -2], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'BY STEAMER', { at: at(info, 'steamer', 0.5) - 0.1, x: 540, y: 330, size: 74, color: '#ffffff', fill: '#2a3a5a', rot: -0.06 });
    stamp(g, t, '→ JAPAN', { at: at(info, 'Japan.', 1.2) - 0.05, x: 540, y: 480, size: 80, color: '#c0392b', fill: 'rgba(250,244,226,0.94)', rot: 0.05 });
  },
});

// s07 — "Then Siberia's spring thaw turned the plains into mud." Two cars wallow in a sea of mud; wheels spin, mud flies.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 13, target: [0, 1, -3] });
    const env = mudPlain(st, { seed: 14 });
    const c1 = car({ team: 'USA', mud: 1, seed: 2 }); c1.position.set(-1.6, -0.35, 0); c1.rotation.y = 0.15; st.add(c1);
    const c2 = car({ team: 'GER', mud: 1, seed: 6 }); c2.position.set(2.2, -0.45, -6); c2.rotation.y = -0.1; st.add(c2);
    const d1 = seat(c1, driver({ seed: 3 }), 0), d2 = seat(c2, driver({ seed: 21, skin: 'light', coat: '#5a5a62', cap: '#2a2a32' }), 0);
    const sp1 = mudSpray(c1, 16, 7), sp2 = mudSpray(c2, 12, 9);
    return { stage: st, env, cars: [c1, c2], ds: [d1, d2], sp: [sp1, sp2] };
  },
  draw(s, t, info) {
    s.env.update(t);
    const sink = ease.inOut(prog(t, 0, info.dur));
    s.cars.forEach((c, i) => { c.drive(t * 10); c.bounce(t + i, 0.6, 8); c.position.y = (i ? -0.45 : -0.35) - sink * 0.2; s.sp[i].update(t + i * 0.3); });
    s.ds.forEach((d, i) => { d.pose(SIT(t, 3 + i, { armL: [0.9, 0.2, 0.4], armR: [0.9, 0.2, 0.4], elbowL: 0.9, elbowR: 0.9, ...tremble(t, 1) })); d.face(i ? EXPR.angry : EXPR.panic, t); });
    camMove(s.stage, t, [[0, { pos: [3.5, 4.6, 13.5], look: [0.4, 1.2, -3], fov: 46 }], [info.dur, { pos: [3.0, 4.0, 11.8], look: [0.4, 1.2, -3], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, GREY);
    stamp(g, t, 'SIBERIA', { at: at(info, "Siberia's", 0.3) - 0.1, x: 280, y: 330, size: 70, color: '#ffffff', fill: '#2a3a5a', rot: -0.1 });
    stamp(g, t, 'MUD', { at: at(info, 'mud.', 2.0) - 0.05, x: 640, y: 520, size: 120, color: '#ffffff', fill: '#6a4a2a', rot: 0.08 });
    shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'mud.', 2.0), amp: 0.04, dur: 0.4 }]);
  },
});

// Paris finish (s08-s09 Germans, s11 Americans)
function paris(T, team, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 12, target: [0, 1, -4] });
  const env = parisFinish(st, { seed: 6 });
  const c = car({ team, mud: 0.6, seed: 8, trophy: !!o.trophy }); st.add(c);
  const coat = team === 'GER' ? '#5a5a62' : '#a88a5a', cap = team === 'GER' ? '#2a2a32' : '#5a4a3a';
  const d = seat(c, driver({ seed: team === 'GER' ? 21 : 3, skin: team === 'GER' ? 'light' : 'fair', coat, cap }), 0);
  const d2 = seat(c, driver({ seed: team === 'GER' ? 23 : 6, skin: team === 'GER' ? 'fair' : 'tan', coat, cap, moustache: team === 'GER' ? false : true, over: { hair: 'bowl' } }), 1);
  const crowd = []; for (let i = 0; i < 8; i++) { const p = onlooker({ seed: 70 + i }); const sx = i % 2 ? 1 : -1; p.position.set(sx * (4.3 + (i % 3) * 0.6), 0, 2 - Math.floor(i / 2) * 2.6); p.rotation.y = -sx * 0.8; st.add(p); crowd.push(p); }
  return { stage: st, env, c, crew: [d, d2], crowd };
}
const crowdDraw = (s, t, k = 1) => s.crowd.forEach((p, i) => { const cheer = (0.5 + 0.5 * Math.sin(t * 7 + i * 1.7)) * k; p.pose(addPose(mixPose(POSE.relaxed, POSE.armsUp, i % 2 ? cheer : cheer * 0.6), idle(t, 40 + i, 0.6))); p.face(k > 0.5 ? (i % 2 ? EXPR.happy : EXPR.grin) : EXPR.shocked, t); });

// s08 — "But here's the part... the Germans reached Paris first." The GER car rolls under the FINISH banner; crew cheers.
registerShot('s08', { kind: '3d',
  init(T) { return paris(T, 'GER'); },
  draw(s, t, info) {
    s.env.update(t);
    const arr = at(info, 'Germans', 1.0) - 0.3; const roll = ease.out(prog(t, arr, arr + 1.3)); const z = lerp(-26, -4, roll); s.c.position.z = z; s.c.drive(z); s.c.bounce(t, 0.4 * (1 - roll), 10);
    const win = prog(t, at(info, 'first.', 2.2) - 0.1, at(info, 'first.', 2.2) + 0.2);
    s.crew.forEach((d, i) => { d.pose(addPose(mixPose(POSE.sit, addPose(POSE.sit, { armL: [0.2, 2.6, 0], armR: [0.2, 2.6, 0], elbowL: 0.2, elbowR: 0.2 }), win), idle(t, 21 + i, 0.4))); d.face(mixExpr(EXPR.neutral, EXPR.grin, win), t); });
    crowdDraw(s, t, win);
    const sus = prog(t, 0, arr);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.5], look: [0, 3.6, -30], fov: 40 }], [Math.max(0.1, arr), { pos: [0, 2.6, 7.0], look: [0, 3.0, -30], fov: 40 }], [info.dur, { pos: [1.8, 2.6, 5.6], look: [0, 1.8, -4], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const arr = at(info, 'Germans', 1.0) - 0.3;
    if (t < arr) { g.save(); g.fillStyle = 'rgba(10,12,24,0.35)'; g.fillRect(0, 0, 1080, 1920); g.restore(); stamp(g, t, 'BUT…', { at: 0.05, x: 540, y: 760, size: 140, color: '#ffffff', fill: '#c0392b', rot: -0.06, until: arr }); }
    stamp(g, t, 'GERMANY: FIRST!', { at: at(info, 'first.', 2.2) - 0.05, x: 540, y: 340, size: 72, color: '#ffffff', fill: '#3a4a62', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.crew[0], at: at(info, 'first.', 2.2), scale: 0.8 }]);
  },
});

// s09 — "They got a thirty day penalty," Same finish. A giant red stamp: +30 DAYS. The crew's arms drop.
registerShot('s09', { kind: '3d',
  init(T) { return paris(T, 'GER'); },
  draw(s, t, info) {
    s.env.update(t); s.c.position.z = -4; s.c.drive(-4);
    const hit = at(info, 'penalty,', 0.9) - 0.15; const k = prog(t, hit, hit + 0.25);
    s.crew.forEach((d, i) => { d.pose(addPose(mixPose(addPose(POSE.sit, { armL: [0.2, 2.6, 0], armR: [0.2, 2.6, 0], elbowL: 0.2, elbowR: 0.2 }), POSE.sit, k), { ...idle(t, 21 + i, 0.4), headNod: k * 0.15 })); d.face(mixExpr(EXPR.grin, EXPR.shocked, k), t); });
    crowdDraw(s, t, 1 - k);
    camMove(s.stage, t, [[0, { pos: [1.6, 2.5, 3.6], look: [0, 2.2, -4.5], fov: 38 }], [info.dur, { pos: [1.2, 2.4, 2.6], look: [0, 2.3, -4.5], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit + 0.1, amp: 0.05, dur: 0.35 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    const hit = at(info, 'penalty,', 0.9) - 0.15;
    stamp(g, t, '+30 DAYS', { at: hit, x: 540, y: 520, size: 150, color: '#e23b2e', fill: 'rgba(255,248,232,0.95)', rot: -0.1 });
    stamp(g, t, 'PENALTY', { at: hit + 0.12, x: 540, y: 720, size: 80, color: '#ffffff', fill: '#c0392b', rot: 0.05 });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.crew[0], at: hit + 0.2, color: '#ff3b30' }, { fx: 'flash', at: hit, dur: 0.18, color: '#ffdddd' }]);
  },
});

// s10 — "for skipping Japan and shipping their car part of the way by train." The GER car rides a flatcar behind a steam loco.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [0, 1, -4] });
    const env = railLine(st, { snow: false, ground: '#b8c07a' });
    const tr = train(); st.add(tr);
    const c = car({ team: 'GER', mud: 0.4, seed: 6 }); c.scale.setScalar(0.62); c.position.set(0, tr.flatTop, 0); tr.flat.add(c);
    const d = seat(c, driver({ seed: 21, skin: 'light', coat: '#5a5a62', cap: '#2a2a32' }), 0);
    return { stage: st, env, tr, c, d };
  },
  draw(s, t, info) {
    s.env.update(t);
    const z = -t * 5; s.tr.position.z = z; s.tr.update(t, -z);
    s.d.pose(addPose(POSE.sit, { ...idle(t, 21, 0.5), armL: [0.3, 0.6, 1.2], armR: [0.3, 0.6, 1.2], elbowL: 2.0, elbowR: 2.0, lean: -0.15 })); s.d.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [7.5, 4.0, z + 2], look: [0, 1.8, z - 6], fov: 44 }], [info.dur, { pos: [6.0, 3.4, z - 1], look: [0, 2.0, z - 7.5], fov: 42 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'SKIPPED JAPAN', { at: at(info, 'skipping', 0.2) - 0.05, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#c0392b', rot: -0.06 });
    stamp(g, t, 'BY TRAIN', { at: at(info, 'train.', 2.2) - 0.1, x: 540, y: 480, size: 80, color: '#c0392b', fill: 'rgba(250,244,226,0.94)', rot: 0.06 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.d, at: 0.4, scale: 0.6 }]);
  },
});

// s11 — "So the American Thomas Flyer won," The USA car rolls in under the banner, trophy on the bonnet; the crowd goes wild.
registerShot('s11', { kind: '3d',
  init(T) { return paris(T, 'USA', { trophy: true }); },
  draw(s, t, info) {
    s.env.update(t);
    const roll = ease.out(prog(t, 0, 1.0)); const z = lerp(-16, -4, roll); s.c.position.z = z; s.c.drive(z); s.c.bounce(t, 0.3 * (1 - roll), 10);
    const win = prog(t, at(info, 'won,', 1.4) - 0.2, at(info, 'won,', 1.4) + 0.1);
    s.crew.forEach((d, i) => { d.pose(addPose(mixPose(POSE.sit, addPose(POSE.sit, { armL: [0.2, 2.6, 0], armR: [0.2, 2.6, 0], elbowL: 0.2, elbowR: 0.2 }), win), idle(t, 3 + i, 0.4))); d.face(mixExpr(EXPR.happy, EXPR.grin, win), t); });
    crowdDraw(s, t, 1);
    if (s.c.trophy) s.c.trophy.rotation.y = t * 1.5;
    camMove(s.stage, t, [[0, { pos: [-1.8, 2.2, 6.0], look: [0, 2.0, -5], fov: 42 }], [info.dur, { pos: [-1.4, 2.4, 4.4], look: [0, 2.2, -4.5], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'USA WINS', { at: at(info, 'won,', 1.4) - 0.05, x: 540, y: 340, size: 92, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.crew[0], at: at(info, 'won,', 1.4), scale: 1 }, { fx: 'stars', on: s.crew[1], at: at(info, 'won,', 1.4) + 0.1, scale: 0.8 }]);
  },
});

// s12 — "after 169 days and about 16,700 kilometers." Counters over the blurred celebration.
registerShot('s12', { kind: '3d',
  init(T) { return paris(T, 'USA', { trophy: true }); },
  draw(s, t, info) {
    s.env.update(t); s.c.position.z = -4; s.crew.forEach((d, i) => { d.pose(addPose(POSE.sit, { armL: [0.2, 2.6, 0], armR: [0.2, 2.6, 0], elbowL: 0.2, elbowR: 0.2, ...idle(t, 3 + i, 0.5) })); d.face(EXPR.grin, t); });
    crowdDraw(s, t, 1); if (s.c.trophy) s.c.trophy.rotation.y = t * 1.5;
    camMove(s.stage, t, [[0, { pos: [2.4, 3.0, 6.5], look: [0, 2.0, -4], fov: 44 }], [info.dur, { pos: [2.0, 2.8, 5.5], look: [0, 2.0, -4], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    const k0 = at(info, 'about', info.dur * 0.5) - 0.15;
    dimScene(g, 7, 0.45);
    if (t < k0) drawInsert(g, { type: 'bigtext', kicker: 'NEW YORK → PARIS', title: '169 DAYS', lines: ['FEB 12 → JULY 30, 1908'], color: '#ffcf4a' }, t);
    else drawInsert(g, { type: 'bigtext', kicker: 'ABOUT', title: '16,700 KM', size: 150, lines: ['DRIVEN TO WIN'], color: '#7fd06a' }, t - k0);
  },
});

// s13 — "Only three of the six cars ever finished." Six car cards: three French cars crossed out, three get a check.
registerShot('s13', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 40, bg: ['#2a3a5a', '#4a5a7a'] }); return { stage: st }; },
  draw(s, t, info) { s.stage.cam([0, 2, 8], [0, 1, 0], 40); },
  overlay(g, t, info, s) {
    const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#24345a'); gr.addColorStop(1, '#3a2a4a'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
    sixCars(g, t, { out: [3, 4, 5], crossAt: at(info, 'three', 0.4) + 0.1, fin: [0, 1, 2], finAt: at(info, 'finished.', 1.6) - 0.1 });
    stamp(g, t, 'ONLY 3 OF 6 FINISHED', { at: at(info, 'finished.', 1.6), x: 540, y: 330, size: 64, color: '#ffffff', fill: '#c0392b', rot: -0.04 });
  },
});

// s14 — "The winning margin? Twenty-six days..." Counter 0 -> 26 DAYS over the Paris finish (empty road: nobody else yet).
registerShot('s14', { kind: '3d',
  init(T) { const s = paris(T, 'USA', { trophy: true }); s.c.visible = false; return s; },
  draw(s, t, info) {
    s.env.update(t); crowdDraw(s, t, 0.3);
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 6], look: [0, 3.0, -30], fov: 40 }], [info.dur, { pos: [0, 2.4, 5], look: [0, 3.0, -30], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const c0 = at(info, '26', 0.9) - 0.15;
    if (t < c0) stamp(g, t, 'WINNING MARGIN?', { at: 0.05, x: 540, y: 760, size: 80, color: '#ffffff', fill: '#2a3a5a', rot: -0.04 });
    else { dimScene(g, 6, 0.4); drawInsert(g, { type: 'bigtext', kicker: 'WINNING MARGIN', title: '26 DAYS', color: '#ffcf4a' }, t - c0); }
  },
});

// s15 — PAYOFF: "still called the largest in motorsport history." Back in the Siberian mud, same framing as frame 1: the crew
// still hauling the car (now with its trophy). The cut back to s01 loops.
registerShot('s15', { kind: '3d',
  init(T) { return mudHero(T, { trophy: true }); },
  draw(s, t, info) { mudHeroDraw(s, t); camMove(s.stage, t, [[0, { pos: [1.6, 2.0, 8.0], look: [0, 1.7, 0.6], fov: 40 }], [info.dur, HERO0]], ease.inOut); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, GREY);
    stamp(g, t, 'LARGEST WIN MARGIN', { at: at(info, 'largest', 0.4) - 0.1, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
    stamp(g, t, 'IN MOTORSPORT', { at: at(info, 'motorsport', 0.9) - 0.1, x: 540, y: 480, size: 64, color: '#2f6a3a', fill: 'rgba(250,244,226,0.94)', rot: 0.04 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.d, at: 0.2, scale: 0.8 }]);
  },
});
