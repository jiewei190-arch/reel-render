// "Wojtek, the Bear Who Joined the Army" (wojtek-bear): 15 shots, Toon 3D + BEANMEN FX. No combat shown: only the bear carrying boxes.
import { registerShot, ease, prog, lerp, clamp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, nod, point, shrug, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, tag, bear, soldier, officer, keeper, shellCrate, camp, dock, cassino, zoo, badge, THREE } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' };
const SOFT = { rays: false, tint: '#ffcf8a' };
const CARRY = { armL: [-1.25, 0, 0.15], armR: [-1.25, 0, -0.15] };
function carryCrate(b) { const c = shellCrate(); c.scale.setScalar(0.85); c.position.set(0, 1.12, 0.62); b.add(c); return c; }
const march = (b, t, ph = 0) => { const w = t * 1.6 * Math.PI * 2 + ph; return { legL: [Math.sin(w) * 0.5, 0], legR: [-Math.sin(w) * 0.5, 0], armL: [-Math.sin(w) * 0.45, 0.1, 0], armR: [Math.sin(w) * 0.45, -0.1, 0], bob: Math.abs(Math.sin(w)) * 0.05 }; };

// ---------- frame 1 / loop: the bear marching in step with two soldiers, carrying a crate of shells ----------
const parade = {
  init(T) { const s = camp(T, { target: [0, 0, 1.5], shadowSize: 8 }); s.b = bear({ bow: false, cap: true, seed: 3 }); s.stage.add(s.b); s.crate = carryCrate(s.b);
    s.sol = [0, 1].map(i => { const b = soldier(i); s.stage.add(b); return b; }); return s; },
  draw(s, t, info, o = {}) { s.sky.update(t); const tt = t + (o.t0 || 0); const z = 1.6 + Math.sin(tt * 0.5) * 0.05;
    s.b.position.set(0.25, 0, z); s.b.update(tt, { walk: 1, lid: 0.35, look: [0, 0], smile: 1, pose: CARRY });
    s.sol.forEach((b, i) => { b.position.set(i ? 1.75 : -1.35, 0, z - 0.5); b.pose(march(b, tt, i * 0.2)); b.face(i ? EXPR.deadpan : EXPR.smug, tt); });
    camMove(s.stage, t, o.keys || [[0, { pos: [0.2, 2.0, 8.4], look: [0.2, 1.55, 1.4], fov: 40 }], [info.dur, { pos: [0.25, 1.85, 7.0], look: [0.25, 1.5, 1.4], fov: 40 }]], ease.inOut); },
};
registerShot('w01', { kind: '3d', init: parade.init, draw: (s, t, i) => parade.draw(s, t, i),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: at(info, 'army', 1.4), scale: 0.8 }, { fx: 'exclaim', on: 'sol.0', at: at(info, 'ii', 2.5) }]); } });
registerShot('w15', { kind: '3d', init: parade.init,
  draw: (s, t, i) => parade.draw(s, t, i, { keys: [[0, { pos: [0.25, 1.9, 7.6], look: [0.25, 1.52, 1.4], fov: 40 }], [i.dur, { pos: [0.2, 2.0, 8.4], look: [0.2, 1.55, 1.4], fov: 40 }]] }),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); } });

// w02 insert: the service record over the parade
insertShot('w02', { scene: { init: parade.init, draw: (s, t, i) => parade.draw(s, t + 3.2, i) },
  insert: { type: 'document', title: 'SERVICE RECORD', lines: ['Name: WOJTEK', 'Rank: PRIVATE', 'Serial no.: on file', 'Species: bear'], highlight: 3 } });

// w03 "In 1942, Polish soldiers in Iran adopted a bear cub." two soldiers crouch by a tiny cub: hearts
const adopt = {
  init(T) { const s = camp(T, { target: [0, 0, 2], shadowSize: 6, seed: 6 }); s.cub = bear({ bow: false, scale: 0.42, seed: 9 }); s.cub.position.set(0.1, 0, 2.4); s.stage.add(s.cub);
    s.a = soldier(2); s.a.position.set(-1.0, 0, 2.2); s.a.rotation.y = 0.9; s.b = soldier(3); s.b.position.set(1.15, 0, 2.0); s.b.rotation.y = -0.9; s.stage.add(s.a, s.b); return s; },
  draw(s, t, k = 0) { s.sky.update(t); s.cub.update(t, { lid: 0.15, look: [Math.sin(t * 1.3) * 0.4, 0.2], smile: 1, wave: k, headTilt: Math.sin(t * 2) * 0.12 });
    [s.a, s.b].forEach((b, i) => { b.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, lean: 0.35, kneeL: 0.6, kneeR: 0.6, bob: -0.25 }, 1), idle(t, i))); b.face(EXPR.happy, t); }); },
};
registerShot('w03', { kind: '3d', init: adopt.init,
  draw(s, t, info) { adopt.draw(s, t); camMove(s.stage, t, [[0, { pos: [0.1, 2.4, 10.2], look: [0.1, 1.2, 2.2], fov: 38 }], [info.dur, { pos: [0.1, 2.1, 8.8], look: [0.1, 1.1, 2.2], fov: 38 }]]); },
  overlay(g, t, info, s) { const c = at(info, 'cub', 3.8); sunnyLook(g, t, RAYS); tag(g, 'IRAN, 1942', ease.out(prog(t, 0.2, 0.5))); reactions(g, t, s, [{ fx: 'hearts', on: 'a', at: c - 0.1 }, { fx: 'hearts', on: 'b', at: c + 0.1 }, { fx: 'sparkle', on: 'cub', at: c, scale: 0.6 }]); } });
// w04 "They named him Wojtek." close on the cub waving
registerShot('w04', { kind: '3d', init: adopt.init,
  draw(s, t, info) { adopt.draw(s, t + 4, ease.inOut(prog(t, 0.4, 0.8))); camMove(s.stage, t, [[0, { pos: [0.1, 1.25, 5.6], look: [0.1, 0.75, 2.4], fov: 32 }], [info.dur, { pos: [0.1, 1.2, 5.1], look: [0.1, 0.75, 2.4], fov: 32 }]]); },
  overlay(g, t, info, s) { const w = at(info, 'wojtek', 0.5); sunnyLook(g, t, SOFT); tag(g, 'WOJTEK', ease.out(prog(t, w, w + 0.3))); reactions(g, t, s, [{ fx: 'sparkle', on: 'cub', at: w, scale: 0.7 }, { fx: 'stars', on: 'cub', at: w + 0.15 }]); } });

// w05 "His favourite drink? Beer." the grown bear sits by the tents with a big mug, hearts on "beer"
registerShot('w05', { kind: '3d',
  init(T) { const s = camp(T, { target: [0, 0, 2], shadowSize: 6, seed: 7 }); s.b = bear({ bow: false, seed: 4 }); s.b.position.set(0, 0, 2.2); s.stage.add(s.b);
    const mug = new THREE.Group(); const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.4, 16), new THREE.MeshToonMaterial({ color: '#e8a83a' })); mug.add(glass); const foam = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8), new THREE.MeshToonMaterial({ color: '#fff8e8' })); foam.position.y = 0.2; foam.scale.y = 0.5; mug.add(foam);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 6, 14), new THREE.MeshToonMaterial({ color: '#e8a83a' })); h.position.set(0.19, 0, 0); mug.add(h); mug.position.set(0, 0.05, 0.12); s.b.paw.R.add(mug); s.mug = mug; return s; },
  draw(s, t, info) { s.sky.update(t); const be = at(info, 'beer', 1.6); const k = ease.inOut(prog(t, be - 0.3, be));
    s.b.update(t, { sit: 1, lid: lerp(0.3, 0.6, k), smile: 1, look: [0, 0.1], pose: { armR: [lerp(-0.6, -2.0, k), 0, -0.4], armL: [-0.3, 0, 0.3] }, headTilt: k * 0.15 }); s.b.position.y = -0.45;
    camMove(s.stage, t, [[0, { pos: [0.3, 1.8, 8.0], look: [0, 1.2, 2.2], fov: 36 }], [info.dur, { pos: [0.3, 1.7, 7.2], look: [0, 1.2, 2.2], fov: 36 }]]); },
  overlay(g, t, info, s) { const be = at(info, 'beer', 1.6); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'b', at: 0.1, until: be - 0.15 }, { fx: 'hearts', on: 'b', at: be + 0.05 }]); } });

// w06 "His hobby? Wrestling the soldiers." playful wrestle: everyone laughing, stars, small shake (nobody hurt)
registerShot('w06', { kind: '3d',
  init(T) { const s = camp(T, { target: [0, 0, 2], shadowSize: 6, seed: 8 }); s.b = bear({ bow: false, seed: 5 }); s.b.position.set(0.45, 0, 2.0); s.b.rotation.y = -0.6; s.stage.add(s.b);
    s.s = soldier(1); s.s.position.set(-0.6, 0, 2.3); s.s.rotation.y = 0.7; s.stage.add(s.s); s.w = soldier(0); s.w.position.set(-1.9, 0, 0.6); s.w.rotation.y = 0.5; s.stage.add(s.w); return s; },
  draw(s, t, info) { s.sky.update(t); const w = at(info, 'wrestling', 1.1); const k = ease.inOut(prog(t, w - 0.2, w + 0.2)); const sw = Math.sin(t * 6) * k;
    s.b.update(t, { armsUp: k * 0.7, smile: 1, open: k > 0.5 ? 1 : 0, lid: 0.2, headTilt: sw * 0.15 }); s.b.rotation.z = sw * 0.08;
    s.s.pose(addPose(mixPose(POSE.stand, POSE.armsUp, k * 0.8), { lean: k * 0.25, side: sw * 0.12 })); s.s.face(k > 0.5 ? EXPR.grin : EXPR.neutral, t);
    s.w.pose(addPose(POSE.armsUp, { bob: Math.abs(Math.sin(t * 7)) * 0.1 })); s.w.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.1, 7.4], look: [-0.1, 1.4, 2.0], fov: 38 }], [info.dur, { pos: [-0.2, 2.0, 6.6], look: [-0.1, 1.4, 2.0], fov: 38 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: w, amp: 0.05, dur: 0.5 }]); },
  overlay(g, t, info, s) { const w = at(info, 'wrestling', 1.1); sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'stars', on: 's', at: w + 0.2 }, { fx: 'sweat', on: 's', at: w + 0.5 }, { fx: 'sparkle', on: 'b', at: w + 0.1, scale: 0.7 }]); } });

// ---------- the dock: the British troop ship, NO PETS sign ----------
const port = {
  init(T) { const s = dock(T); s.o = officer(); s.o.position.set(-1.4, 0, 1.7); s.o.rotation.y = 0.4; s.stage.add(s.o);
    s.b = bear({ bow: false, seed: 6 }); s.b.position.set(1.2, 0, 2.3); s.b.rotation.y = -0.35; s.stage.add(s.b); s.sol = soldier(2); s.sol.position.set(2.5, 0, 2.6); s.sol.rotation.y = -0.6; s.stage.add(s.sol); return s; },
};
registerShot('w07', { kind: '3d', init: port.init,
  draw(s, t, info) { s.sky.update(t); const n = at(info, 'no', 1.9); const k = ease.outBack(prog(t, n, n + 0.25));
    s.o.pose(addPose(point(POSE.stand, 'L', k, { up: 0.15 }), idle(t, 1))); s.o.face(mixExpr(EXPR.neutral, EXPR.angry, k), t);
    s.b.update(t, { lid: lerp(0.3, 0, k), brow: k, smile: 1 - k, look: [-0.5, 0.1] }); s.sol.pose(addPose(POSE.stand, idle(t, 3))); s.sol.face(mixExpr(EXPR.neutral, EXPR.worried, k), t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.4, 9.6], look: [0.1, 1.7, 1.6], fov: 40 }], [info.dur, { pos: [0.0, 2.3, 8.6], look: [0, 1.6, 1.6], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: n, amp: 0.04, dur: 0.35 }]); },
  overlay(g, t, info, s) { const n = at(info, 'no', 1.9); sunnyLook(g, t, RAYS); tag(g, 'TROOP SHIP TO ITALY', ease.out(prog(t, 0.2, 0.5))); reactions(g, t, s, [{ fx: 'exclaim', on: 'o', at: n }, { fx: 'sweat', on: 'b', at: n + 0.3 }, { fx: 'sweat', on: 'sol', at: n + 0.45 }]); } });
// w08 "Wait, how do you get a bear on a troop ship?" the soldier, "???"
registerShot('w08', { kind: '3d', init: port.init,
  draw(s, t, info) { s.sky.update(t); s.sol.pose(addPose(shrug(POSE.stand, ease.outBack(prog(t, 0.1, 0.4))), { headTilt: 0.18 })); s.sol.face(EXPR.worried, t); s.b.update(t, { lid: 0.4, look: [0.5, 0] }); s.o.pose(POSE.handsHips); s.o.face(EXPR.angry, t);
    camMove(s.stage, t, [[0, { pos: [2.0, 2.15, 6.6], look: [2.3, 1.75, 2.6], fov: 34 }], [info.dur, { pos: [2.05, 2.15, 6.1], look: [2.3, 1.8, 2.6], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'sol', at: 0.05 }]); } });
// w09 "You see, he wasn't a pet." the bear, deadpan at the lens; the officer squints
registerShot('w09', { kind: '3d', init: port.init,
  draw(s, t, info) { s.sky.update(t); s.b.update(t, { lid: 0.55, look: [0, 0], smile: 0.4 }); s.o.pose(POSE.handsHips); s.o.face(EXPR.suspicious, t); s.sol.pose(POSE.stand); s.sol.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [0.9, 2.1, 6.0], look: [1.15, 1.75, 2.3], fov: 32 }], [info.dur, { pos: [0.95, 2.1, 5.6], look: [1.15, 1.8, 2.3], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); } });
// w10 "He was a private." flash: the army cap pops onto the bear, he salutes; the officer: shocked, "!", shake
registerShot('w10', { kind: '3d',
  init(T) { const s = port.init(T); s.b2 = bear({ bow: false, cap: true, seed: 6 }); s.b2.position.copy(s.b.position); s.b2.rotation.y = s.b.rotation.y; s.stage.add(s.b2); s.b.visible = false; return s; },
  draw(s, t, info) { s.sky.update(t); const p = at(info, 'private', 0.9); const k = ease.outBack(prog(t, p - 0.1, p + 0.2));
    s.b2.update(t, { lid: 0.3, smile: 1, look: [0, 0], pose: { armR: [lerp(-0.1, -2.5, k), 0, lerp(-0.25, -1.0, k)] } }); s.b2.parts.head.children.forEach(c => {});
    s.o.pose(mixPose(POSE.handsHips, POSE.panic, k)); s.o.face(mixExpr(EXPR.suspicious, EXPR.shocked, k), t); s.sol.pose(addPose(POSE.attention, idle(t))); s.sol.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 9.6], look: [0.3, 1.7, 1.9], fov: 40 }], [info.dur, { pos: [0.3, 2.25, 9.0], look: [0.3, 1.7, 1.9], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: p, amp: 0.06, dur: 0.45 }]); },
  overlay(g, t, info, s) { const p = at(info, 'private', 0.9); sunnyLook(g, t, RAYS); tag(g, 'PRIVATE WOJTEK', ease.out(prog(t, p, p + 0.3)));
    reactions(g, t, s, [{ fx: 'exclaim', on: 'o', at: p }, { fx: 'sweat', on: 'o', at: p + 0.25 }, { fx: 'sparkle', on: 'b2', at: p, scale: 0.8 }, { fx: 'stars', on: 'b2', at: p + 0.1 }]); } });

// ---------- Monte Cassino 1944 (dusk, no combat): the route card, then the bear carrying a crate past amazed soldiers ----------
const hills = {
  init(T) { const s = cassino(T); s.b = bear({ bow: false, cap: true, seed: 7 }); s.stage.add(s.b); s.crate = carryCrate(s.b);
    s.a = soldier(0); s.a.position.set(-1.5, 0, 2.4); s.a.rotation.y = 0.6; s.c = soldier(3); s.c.position.set(1.6, 0, 2.8); s.c.rotation.y = -0.7; s.stage.add(s.a, s.c);
    s.small = shellCrate(); s.small.scale.setScalar(0.6); s.small.position.set(0, 1.0, 0.45); s.c.add(s.small); return s; },
  draw(s, t, info) { const x = -1.2 + t * 0.55; s.b.position.set(x, 0, 1.6); s.b.rotation.y = Math.PI / 2 - 0.5; s.b.update(t, { walk: 1, lid: 0.35, smile: 1, pose: CARRY });
    s.a.pose(addPose(POSE.stand, idle(t, 2))); s.a.face(EXPR.shocked, t); s.c.pose(addPose(POSE.holdFront, tremble(t, 1))); s.c.face(EXPR.worried, t); },
};
insertShot('w11', { scene: { init: hills.init, draw: (s, t) => { hills.draw(s, t); s.stage.cam([0, 2.4, 9.5], [0, 1.6, 1.6], 40); } },
  insert: { type: 'map', title: "WOJTEK'S ROUTE", lines: ['Iran 1942', 'Middle East', 'Italy 1944', 'Scotland 1947'] } });
registerShot('w12', { kind: '3d', init: hills.init,
  draw(s, t, info) { hills.draw(s, t + 0.5); camMove(s.stage, t, [[0, { pos: [-0.4, 2.2, 8.6], look: [-0.4, 1.5, 1.6], fov: 40 }], [info.dur, { pos: [0.6, 2.1, 7.6], look: [0.8, 1.5, 1.6], fov: 40 }]]); },
  overlay(g, t, info, s) { const c = at(info, 'crates', 1.3); tag(g, 'MONTE CASSINO, 1944', ease.out(prog(t, 0.1, 0.4)));
    reactions(g, t, s, [{ fx: 'exclaim', on: 'a', at: c }, { fx: 'sweat', on: 'c', at: c + 0.2 }, { fx: 'sparkle', on: 'b', at: c + 0.1, scale: 0.7 }]);
    const r = at(info, 'reported', 0.3); g.save(); g.globalAlpha = clamp((t - r) * 3) * 0.95; g.font = '900 40px Nunito'; g.textAlign = 'center'; g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.strokeText('(reported by his unit)', E.W / 2, E.H * 0.235); g.fillStyle = '#ffffff'; g.fillText('(reported by his unit)', E.W / 2, E.H * 0.235); g.restore(); } });
// w13 "So his company made its badge a bear carrying a shell." the badge card over the blurred hills
registerShot('w13', { kind: '3d', init: hills.init,
  draw(s, t) { hills.draw(s, t + 3.5); s.stage.cam([0, 2.4, 9.5], [0, 1.6, 1.6], 40); },
  overlay(g, t, info, s) { const b = at(info, 'badge', 1.1); dimScene(g, 9, 0.55); badge(g, E.W / 2, E.H * 0.42, 390, prog(t, 0.05, 0.45));
    g.save(); g.globalAlpha = clamp(t * 3); g.font = '900 56px Nunito'; g.textAlign = 'center'; g.lineWidth = 10; g.strokeStyle = '#2a1c15'; g.strokeText('22nd ARTILLERY SUPPLY COMPANY', E.W / 2, E.H * 0.2, E.W * 0.9); g.fillStyle = '#ffd25a'; g.fillText('22nd ARTILLERY SUPPLY COMPANY', E.W / 2, E.H * 0.2, E.W * 0.9); g.restore();
    if (t > b) { g.save(); const k = clamp((t - b) * 2); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 0.6; const x = E.W / 2 + Math.cos(a) * 450, y = E.H * 0.42 + Math.sin(a) * 450; g.globalAlpha = k * (0.6 + 0.4 * Math.sin(t * 6 + i)); g.fillStyle = '#ffe9a8'; g.beginPath(); g.moveTo(x, y - 26); g.quadraticCurveTo(x + 4, y - 4, x + 26, y); g.quadraticCurveTo(x + 4, y + 4, x, y + 26); g.quadraticCurveTo(x - 4, y + 4, x - 26, y); g.quadraticCurveTo(x - 4, y - 4, x, y - 26); g.fill(); } g.restore(); } } });

// w14 "He was promoted to corporal, and retired to Edinburgh Zoo." the zoo: the bear (cap) waves, a keeper, a soldier visits
registerShot('w14', { kind: '3d',
  init(T) { const s = zoo(T); s.b = bear({ bow: false, cap: true, seed: 8 }); s.b.position.set(0.3, 0, 1.4); s.stage.add(s.b); s.k = keeper(); s.k.position.set(1.9, 0, 0.6); s.k.rotation.y = -0.5; s.stage.add(s.k);
    s.v = soldier(1); s.v.position.set(-1.0, 0, 4.4); s.v.rotation.y = Math.PI - 0.3; s.stage.add(s.v); return s; },
  draw(s, t, info) { s.sky.update(t); const c = at(info, 'corporal', 1.0), z = at(info, 'edinburgh', 2.5);
    s.b.update(t, { wave: t > z ? 1 : 0, lid: t > c ? 0.45 : 0.25, smile: 1, look: [0, 0], headTilt: t > z ? 0.12 : 0, pose: t < z ? { armR: [lerp(-0.1, -2.5, ease.outBack(prog(t, c, c + 0.3))), 0, -0.9] } : null });
    s.k.pose(addPose(POSE.relaxed, idle(t, 4))); s.k.face(EXPR.happy, t); s.v.pose(addPose(POSE.attention, idle(t, 2))); s.v.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.3, 8.8], look: [0.4, 1.5, 1.2], fov: 40 }], [info.dur, { pos: [0.3, 2.1, 7.6], look: [0.4, 1.5, 1.2], fov: 40 }]]); },
  overlay(g, t, info, s) { const c = at(info, 'corporal', 1.0), z = at(info, 'edinburgh', 2.5); sunnyLook(g, t, RAYS);
    tag(g, 'CORPORAL WOJTEK', ease.out(prog(t, c, c + 0.3)) * (t < z - 0.1 ? 1 : 0)); tag(g, 'EDINBURGH ZOO', ease.out(prog(t, z, z + 0.3)));
    reactions(g, t, s, [{ fx: 'stars', on: 'b', at: c + 0.05 }, { fx: 'hearts', on: 'k', at: z + 0.1 }, { fx: 'sparkle', on: 'b', at: z, scale: 0.8 }]); } });
