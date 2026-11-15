// s09-s12, s14: the gun on the truck, the chase the truck can't win, the ammo, the report, the army goes home.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { emu } from '/kits/toon3d/animals.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, farm, soldier, commander, flock } from './_lib.js';

const SIT = { ...POSE.sit, armL: [0.4, 0.15, 0], armR: [0.4, 0.15, 0], elbowL: 0.6, elbowR: 0.6 };
// sitting on a flat surface (bed / ground): legs out, root lowered by FLOOR_Y
const FLOOR = { ...POSE.sit, kneeL: 0.15, kneeR: 0.15, legL: [1.45, 0.2], legR: [1.45, 0.2], armL: [0.3, 0.3, 0], armR: [0.3, 0.3, 0], elbowL: 0.5, elbowR: 0.5 }; const FLOOR_Y = -0.78;
// truck + gun on the bed + gunner (crouching behind the gun) + driver
function truckRig(st, x = 0, z = 0, ry = 0) {
  const tr = PR.truck().at(x, 0, z, ry); st.add(tr);
  const gun = PR.lewisGun(); gun.scale.setScalar(0.8); gun.position.set(0, tr.bedTop, -1.0); tr.add(gun);
  const gunner = soldier(1); gunner.position.set(0, tr.bedTop, -1.85); tr.add(gunner);
  const driver = soldier(3, { head: 'slouch' }); driver.position.set(-0.35, 0.95, 0.65); driver.scale.setScalar(0.85); driver.visible = false; tr.add(driver);
  return { tr, gun, gunner, driver };
}
// s09 "So the soldiers mount a gun on a truck." — the gun drops onto the bed, the gunner gives a thumbs-up
registerShot('s09', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 0], farm: { field: [26, 14, -16] } }); Object.assign(s, truckRig(s.stage, 0, 0, -0.6)); s.helper = soldier(2); s.helper.position.set(1.7, 0, -1.4); s.helper.rotation.y = -0.6; s.stage.add(s.helper); return s; },
  draw(s, t, info) { s.set.update(t); const m = at(info, 'mount', 0.65), land = ease.outBack(prog(t, m - 0.1, m + 0.35));
    s.gun.position.y = s.tr.bedTop + (1 - clamp(land)) * 1.6; s.gun.rotation.y = (1 - clamp(land)) * 0.6;
    s.gunner.position.y = s.tr.bedTop + FLOOR_Y; s.gunner.pose(addPose(mixPose(FLOOR, { ...FLOOR, armR: [2.6, 0.3, 0], elbowR: 1.2 }, ease.out(prog(t, m + 0.5, m + 0.8))), idle(t, 1))); s.gunner.face(t > m + 0.5 ? EXPR.grin : EXPR.happy, t);
    s.driver.pose(SIT); s.driver.face(EXPR.deadpan, t); s.helper.pose(addPose(POSE.holdFront, idle(t, 5))); s.helper.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [-4.2, 4.2, -4.2], look: [0.5, 1.3, -0.5], fov: 42 }], [info.dur, { pos: [-3.6, 3.8, -4.6], look: [0.5, 1.4, -0.5], fov: 40 }]]); },
});
// s10 "The emus are faster than the truck." — tracking side-on: the truck bounces, the gunner can't even aim, the emus overtake
registerShot('s10', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, -2], shadowSize: 16, farm: { wheat: false } }); Object.assign(s, truckRig(s.stage, 0, 0, Math.PI / 2));
    s.f = [0, 1, 2, 3, 4].map(i => { const e = emu({ seed: 70 + i, general: i === 0 }); e.rotation.y = Math.PI / 2; s.stage.add(e); return e; }); return s; },
  draw(s, t) { s.set.update(t); const vx = 6.5, x = t * vx;
    const bump = Math.abs(noise(t * 6, 3)) * 0.22 + Math.abs(Math.sin(t * 11)) * 0.06; s.tr.position.set(x, bump, 0); s.tr.rotation.z = noise(t * 5, 7) * 0.06; s.tr.rotation.x = noise(t * 4.3, 9) * 0.05; s.tr.drive(x);
    s.gunner.pose(addPose(POSE.panic, { ...tremble(t, 2), bob: Math.abs(Math.sin(t * 11)) * 0.18 })); s.gunner.face(EXPR.panic, t); s.gunner.position.y = s.tr.bedTop + Math.abs(Math.sin(t * 11)) * 0.15;
    s.driver.pose(SIT); s.driver.face(EXPR.worried, t);
    s.f.forEach((e, i) => { const lane = [2.6, 3.6, 1.9, 4.4, 3.1][i]; e.position.set(x - 3 + t * (2.2 + i * 0.35) + i * 1.2, 0, lane); e.update(t, { run: 1, ph: i * 0.3, lid: 0.45, look: [-0.6, 0], headTurn: i === 0 ? -0.6 : 0 }); });
    s.stage.cam([x + 1.2, 2.6, 11.5], [x + 1.6, 1.4, 1.2], 40); },
});
// s11 "Thousands of rounds later," — empty ammo boxes piled high; two exhausted soldiers slumped against them
registerShot('s11', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 0], shadowSize: 8, farm: { field: [26, 14, -16] } }); let k = 0;
    for (let y = 0; y < 4; y++) for (let i = 0; i < 5 - y; i++) { const b = PR.ammoBox({ open: (k++ % 3) === 0 }).at(-1.2 + i * 0.62 + y * 0.31, y * 0.36, -0.6 + (i % 2) * 0.05, (i - 2) * 0.05); s.stage.add(b); }
    s.a = soldier(0); s.a.position.set(-0.9, 0.0, 0.6); s.b = soldier(3); s.b.position.set(0.9, 0.0, 0.7); s.b.rotation.y = -0.2; s.stage.add(s.a, s.b);
    s.e = emu({ seed: 81 }); s.e.position.set(3.0, 0, -3); s.e.rotation.y = -0.8; s.stage.add(s.e); return s; },
  draw(s, t) { s.set.update(t); s.a.position.y = FLOOR_Y; s.b.position.y = FLOOR_Y; s.a.pose(addPose({ ...FLOOR, headNod: 0.3, headTilt: 0.2 }, idle(t, 1))); s.a.face(EXPR.asleep, t, { blink: false });
    s.b.pose(addPose({ ...FLOOR, headTilt: -0.15 }, idle(t, 2))); s.b.face({ ...EXPR.deadpan, lid: 0.65 }, t); s.e.update(t, { peck: 1, lid: 0.5 });
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 6.6], look: [0, 1.2, -0.2], fov: 40 }], [2.4, { pos: [0, 1.8, 5.6], look: [0, 1.15, -0.2], fov: 40 }]]); },
});
// s12 "the commander reported nine hundred and eighty-six birds." — at his field desk, writing, deadpan; then a slow look up
registerShot('s12', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 0], shadowSize: 6, farm: { field: [26, 14, -16] } }); s.d = PR.fieldDesk().at(0, 0, 0.9); s.stage.add(s.d); s.c = commander(); s.c.position.set(0, -0.18, 0.2); s.stage.add(s.c);
    s.st = PR.stool().at(0, 0, 0.2); s.stage.add(s.st); return s; },
  draw(s, t, info) { s.set.update(t); const n = at(info, 'nine', 0.6), up = ease.inOut(prog(t, n + 1.4, n + 1.9));
    const write = Math.sin(t * 14) * 0.08 * (1 - up);
    s.c.pose(addPose({ ...POSE.sit, armR: [1.0 + write, 0.15, 0.3], elbowR: 1.1, armL: [0.9, 0.3, 0.6], elbowL: 1.2, headNod: lerp(0.35, -0.02, up) }, idle(t, 3, 0.5)));
    s.c.face(mixExpr({ ...EXPR.deadpan, pupil: [0, -0.6] }, { ...EXPR.deadpan, lid: 0.45, pupil: [0, 0] }, up), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 4.6], look: [0, 1.6, 0.5], fov: 34 }], [info.dur, { pos: [0.2, 2.25, 3.9], look: [0, 1.75, 0.4], fov: 32 }]]); },
  overlay(g, t, info) { const n = at(info, 'nine', 0.6); tag(g, 'REPORTED: 986 BIRDS', ease.out(prog(t, n + 1.1, n + 1.4))); },
});
// s14 "The army went home." — the truck drives off down the dirt road, soldiers slumped on the bed; an emu waves them off
registerShot('s14', { kind: '3d',
  init(T) { const s = farm(T, { target: [-7, 0, -8], shadowSize: 16 }); Object.assign(s, truckRig(s.stage, -7, 0, Math.PI));
    s.e = emu({ general: true }); s.e.position.set(-2.3, 0, 2.2); s.e.rotation.y = Math.PI * 0.8; s.stage.add(s.e); return s; },
  draw(s, t) { s.set.update(t); const z = -2 - t * t * 2.2; s.tr.position.set(-7, Math.abs(Math.sin(t * 9)) * 0.04, z); s.tr.drive(-z);
    s.gunner.position.y = s.tr.bedTop + FLOOR_Y; s.gunner.pose({ ...FLOOR, headNod: 0.35 }); s.gunner.face(EXPR.sad, t); s.driver.pose(SIT); s.driver.face(EXPR.sad, t);
    s.e.update(t, { lid: 0.55, lidAngle: 0.2, headTurn: 0.2 });
    s.stage.cam([-3.6, 2.4, 7.5], [-6.4, 1.6, -4], 40); },
});
