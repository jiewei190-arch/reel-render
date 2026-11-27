// s01-s05 + s17: the charge (frame 1 = the emu general already running at camera; s17 runs into it = loop), the army, the emus.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble } from '/kits/toon3d/rig.js';
import { emu } from '/kits/toon3d/animals.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, farm, soldier, commander, flock } from './_lib.js';

// the charge, shared by s01 (u = t) and s17 (u = t - dur, so its last frame == s01's first frame -> seamless loop)
const SPEED = 3.0;
function chargeInit(T) {
  const s = farm(T, { target: [0, 0, 0], shadowSize: 14 });
  s.gen = emu({ general: true, seed: 1 }); s.stage.add(s.gen);
  s.pack = flock(s.stage, 4, [-3.5, 3.5, -16, -10], 7); s.pack.forEach(e => (e.rotation.y = 0));
  s.sold = [[-1.15, -1.0, 0], [1.1, 1.8, 1], [-1.2, 4.6, 2]].map(([x, z, i]) => { const b = soldier(i); b.position.set(x, 0, z); b.rotation.y = x < 0 ? 0.9 : -0.9; s.stage.add(b); return b; });
  return s;
}
function chargeDraw(s, u) {
  const ez = -4 + u * SPEED; s.gen.position.set(0, 0, ez); s.gen.rotation.y = 0; s.gen.update(u + 10, { run: 1, lid: 0.45, lidAngle: 0.18, look: [0, 0.15] });
  s.pack.forEach((e, i) => { e.position.z = -13 + (u + 10) * SPEED * 0.95 - i * 0.6; e.update(u + 10, { run: 1, ph: i * 0.37 }); });
  s.sold.forEach((b, i) => { const close = clamp(1 - Math.abs(b.position.z - ez) / 3.5); const dive = ease.out(close); b.pose(addPose(mixPose(POSE.stand, POSE.panic, dive), { side: (b.position.x < 0 ? -1 : 1) * 0.35 * dive, ...tremble(u, dive) })); b.face(mixExpr(EXPR.worried, EXPR.panic, dive), u + 10 + i); });
  s.set.update(u + 10);
  const sh = Math.sin((u + 10) * 2.6 * Math.PI * 2) * 0.03;
  s.stage.cam([0.5, 1.05 + sh, ez + 4.3], [0, 1.95, ez - 0.4], 44);
}
registerShot('s01', { kind: '3d', init: chargeInit, draw(s, t) { chargeDraw(s, t); } });
registerShot('s17', { kind: '3d', init: chargeInit, draw(s, t, info) { chargeDraw(s, t - info.dur); } });

// s02 "And lost." — the commander, close: proud -> deflates. Emus blur past behind him.
registerShot('s02', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 1], farm: { field: [26, 14, -16] } }); s.c = commander(); s.c.position.set(0, 0, 1.2); s.stage.add(s.c); s.run = flock(s.stage, 3, [-6, -3, -4, -2], 3); return s; },
  draw(s, t, info) { s.set.update(t); const k = ease.inOut(prog(t, at(info, 'lost', 0.3) - 0.05, at(info, 'lost', 0.3) + 0.35));
    s.c.pose(addPose(mixPose({ ...POSE.attention, headNod: -0.12 }, { ...POSE.stand, headNod: 0.18, shrugY: -0.03, armL: [0, 0.05, 0], armR: [0, 0.05, 0] }, k), idle(t, 2)));
    s.c.face(mixExpr({ ...EXPR.smug, mouth: 'line' }, { ...EXPR.sad, lid: 0.55 }, k), t);
    s.run.forEach((e, i) => { e.rotation.y = Math.PI / 2; e.position.x = -6 + t * 7 + i * 1.6; e.update(t, { run: 1, ph: i }); });
    s.stage.cam([0.15, 2.1, 5.3], [0, 1.95, 1.2], 30); },
});
// s03 "The army brought machine guns." — low hero shot: soldiers + Lewis gun, commander points forward
registerShot('s03', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 1], farm: { field: [26, 14, -16] } }); s.gun = PR.lewisGun().at(0.2, 0, 1.9, 1.0); s.stage.add(s.gun);
    s.c = commander(); s.c.position.set(-1.3, 0, 1.2); s.c.rotation.y = 0.2; s.a = soldier(0); s.a.position.set(1.4, 0, 0.9); s.a.rotation.y = -0.3; s.b = soldier(4); s.b.position.set(0.5, 0, -0.4); s.stage.add(s.c, s.a, s.b);
    s.boxes = [PR.ammoBox().at(1.3, 0, 2.3, 0.3), PR.ammoBox().at(1.5, 0.36, 2.3, 0.2)]; s.boxes.forEach(b => s.stage.add(b)); return s; },
  draw(s, t) { s.set.update(t); s.c.pose(addPose(point(POSE.stand, 'R', ease.out(prog(t, 0.2, 0.6)), { up: 0.25 }), idle(t, 1))); s.c.face(EXPR.smug, t);
    s.a.pose(addPose(POSE.handsHips, idle(t, 3))); s.a.face(EXPR.grin, t); s.b.pose(addPose({ ...POSE.attention, armR: [2.9, 0.1, 0], elbowR: 1.4 }, idle(t, 4))); s.b.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 0.95, 7.0], look: [0, 1.8, 0.6], fov: 44 }], [2.3, { pos: [0.4, 0.95, 6.0], look: [0, 1.85, 0.6], fov: 42 }]]); },
});
// s04 "The emus brought..." — the general, close, unimpressed. A beat of silence.
registerShot('s04', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 0], shadowSize: 6 }); s.gen = emu({ general: true }); s.stage.add(s.gen); s.mates = flock(s.stage, 3, [-3, 3, -5, -3], 5); return s; },
  draw(s, t) { s.set.update(t); s.gen.update(t, { run: 0, lid: 0.55, lidAngle: 0.2, look: [0, 0.05], headTurn: -0.05, blink: t > 0.6 }); s.mates.forEach((e, i) => e.update(t, { peck: 1, ph: i }));
    camMove(s.stage, t, [[0, { pos: [0.1, 2.55, 4.0], look: [0, 2.3, 0], fov: 30 }], [1.4, { pos: [0.05, 2.55, 3.5], look: [0, 2.35, 0], fov: 28 }]]); },
});
// s05 "running." — whoosh: the whole flock sprints off screen-right, dust puffs; one soldier left spinning
registerShot('s05', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 0] }); s.f = flock(s.stage, 8, [-3, 2, -3, 1.5], 11); s.f.forEach(e => (e.rotation.y = Math.PI / 2)); s.so = soldier(2); s.so.position.set(-2.4, 0, 2.6); s.stage.add(s.so);
    s.dust = []; for (let i = 0; i < 10; i++) { const d = PR.propGroup(); const b = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshToonMaterial({ color: '#d8b48a' })); d.add(b); s.stage.add(d); s.dust.push(d); } return s; },
  draw(s, t) { s.set.update(t);
    s.f.forEach((e, i) => { const x0 = e.userData.x0 ??= e.position.x; e.position.x = x0 + Math.max(0, t - 0.05) ** 1.4 * 16; e.update(t, { run: 1, ph: i * 0.3, lid: 0.3 }); });
    s.dust.forEach((d, i) => { const e = s.f[i % s.f.length]; const age = (t * 3 + i * 0.37) % 1; d.position.set(e.position.x - 0.8 - age * 1.2, 0.25 + age * 0.4, e.position.z + (i % 2 ? 0.3 : -0.3)); d.scale.setScalar(Math.max(0.01, 0.35 * Math.sin(Math.PI * age) * clamp(t * 5))); });
    s.so.rotation.y = t * 9; s.so.pose(POSE.panic); s.so.face(EXPR.shocked, t);
    s.stage.cam([0, 2.0, 9.5], [0, 1.6, -0.5], 42); },
});
