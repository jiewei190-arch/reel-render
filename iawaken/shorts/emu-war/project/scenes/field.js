// s06-s08, s13, s15, s16: the wheat farm, 20,000 hungry emus, the farmer, the stare, the scoreboard.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, nod } from '/kits/toon3d/rig.js';
import { emu } from '/kits/toon3d/animals.js';
import { cat } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, farm, soldier, commander, farmer, flock } from './_lib.js';

// s06 "It's 1932." — wide establishing: Western Australian wheat farm, windmill turning; a few emus already in the crop
registerShot('s06', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, -6], shadowSize: 16 }); s.f = flock(s.stage, 6, [-6, 6, -10, -2], 21); return s; },
  draw(s, t) { s.set.update(t); s.f.forEach((e, i) => e.update(t, { peck: 1, ph: i * 0.5 }));
    camMove(s.stage, t, [[0, { pos: [2, 4.5, 15], look: [0, 2.2, -8], fov: 46 }], [2.1, { pos: [1.2, 3.6, 12.5], look: [0, 2.0, -8], fov: 44 }]]); },
  overlay(g, t) { tag(g, 'WESTERN AUSTRALIA, 1932', ease.out(prog(t, 0.05, 0.35))); },
});
// s07 "About twenty thousand emus are eating" — crane up over a field full of pecking emus
registerShot('s07', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, -5], shadowSize: 16 }); s.f = flock(s.stage, 26, [-8, 8, -14, 3], 31); return s; },
  draw(s, t, info) { s.set.update(t); s.f.forEach((e, i) => e.update(t, { peck: 1, ph: i * 0.41 }));
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 7.5], look: [0, 1.7, 0], fov: 42 }], [info.dur, { pos: [0, 7.5, 12], look: [0, 0.5, -5], fov: 48 }]], ease.inOut); },
  overlay(g, t, info) { const k = ease.out(prog(t, at(info, 'twenty', 0.2), at(info, 'twenty', 0.2) + 0.3)); tag(g, '~20,000 EMUS', k); },
});
// s08 "the wheat in Western Australia." — the farmer, furious, while two emus chew his crop right behind him
registerShot('s08', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 0], shadowSize: 8 }); s.fa = farmer(); s.fa.position.set(-0.25, 0, 1.4); s.fa.rotation.y = 0.15; s.stage.add(s.fa); s.e = [emu({ seed: 41 }), emu({ seed: 42 })]; s.e[0].position.set(0.9, 0, -0.4); s.e[0].rotation.y = -0.5; s.e[1].position.set(-1.9, 0, -1.4); s.e[1].rotation.y = 0.6; s.e.forEach(e => s.stage.add(e)); return s; },
  draw(s, t) { s.set.update(t); s.e.forEach((e, i) => e.update(t, { peck: 1, ph: i * 1.3, lid: 0.4 }));
    const k = ease.inOut(prog(t, 0.6, 1.0)); s.fa.pose(addPose(mixPose(POSE.handsHips, POSE.facepalm, k), idle(t, 6))); s.fa.face(mixExpr(EXPR.angry, { ...EXPR.sad, lid: 0.7 }, k), t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.25, 5.6], look: [0, 1.85, 0.4], fov: 34 }], [2.1, { pos: [0.1, 2.2, 5.0], look: [0, 1.85, 0.4], fov: 33 }]]); },
});
// s13 "Out of twenty thousand." — a field of emus all turn their heads to camera at once
registerShot('s13', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, -4], shadowSize: 14 }); s.f = flock(s.stage, 18, [-6, 6, -10, 1], 51); s.f.forEach(e => (e.rot0 = e.rotation.y)); return s; },
  draw(s, t) { s.set.update(t); const k = ease.outBack(prog(t, 0.3, 0.55));
    s.f.forEach((e, i) => { const toCam = Math.atan2(0 - e.position.x, 9 - e.position.z); e.rotation.y = lerp(e.rot0, toCam, clamp(k)); e.update(t, { peck: 1 - clamp(k * 1.5), ph: i * 0.4, lid: lerp(0.35, 0.55, clamp(k)), lidAngle: 0.15 * clamp(k), blink: false }); });
    s.stage.cam([0, 4.6, 12.5], [0, 1.2, -4], 42); },
});
// s15 "The emus stayed." — the emus strut and do a little victory bob in the wheat
registerShot('s15', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, -3] }); s.f = flock(s.stage, 9, [-4, 4, -6, 1], 61); s.gen = emu({ general: true }); s.gen.position.set(0, 0, 2.2); s.stage.add(s.gen); return s; },
  draw(s, t) { s.set.update(t); s.f.forEach((e, i) => { e.update(t, { peck: i % 2, run: 0.25, ph: i * 0.6, lid: 0.45 }); e.position.y = Math.abs(Math.sin(t * 5 + i)) * 0.12; });
    s.gen.update(t, { run: 0.3, lid: 0.55, lidAngle: 0.2 }); s.gen.rotation.y = Math.sin(t * 2) * 0.4; s.gen.position.y = Math.abs(Math.sin(t * 5)) * 0.15;
    camMove(s.stage, t, [[0, { pos: [-1.5, 2.0, 7.5], look: [0, 1.7, 0], fov: 40 }], [1.4, { pos: [1.0, 2.1, 7.2], look: [0, 1.7, 0], fov: 40 }]]); },
});
// s16 "Final score: Emus, one. Army, zero." — chalk scoreboard on the fence; the general poses; BISCUIT judges from a post
registerShot('s16', { kind: '3d',
  init(T) { const s = farm(T, { target: [0, 0, 6], shadowSize: 8, farm: { field: [26, 18, -6] } }); const fz = -6 + 9 + 0.6;
    s.sb = PR.scoreboard({ lines: ['EMUS  1', 'ARMY  0'], w: 1.7, h: 1.15 }).at(-0.35, 0, fz + 0.45, 0.1); s.stage.add(s.sb);
    s.gen = emu({ general: true }); s.gen.position.set(0.85, 0, fz + 1.9); s.gen.rotation.y = -0.3; s.stage.add(s.gen);
    s.cat = cat({ scale: 0.55 }); s.cat.position.set(-0.35, 2.32, fz + 0.45); s.cat.rotation.y = 0.1; s.stage.add(s.cat);
    s.c = commander(); s.c.position.set(-1.45, 0, fz + 2.6); s.c.rotation.y = 0.45; s.stage.add(s.c); s.fz = fz; return s; },
  draw(s, t, info) { s.set.update(t); const z = at(info, 'zero', 2.25), one = at(info, 'one', 1.2);
    s.gen.update(t, { lid: lerp(0.4, 0.6, prog(t, one, one + 0.3)), lidAngle: 0.2, look: [-0.2, 0], headTurn: t > one ? 0.25 : -0.4 });
    s.cat.update(t, { lid: 0.62, look: [-0.5, 0], tail: 0.6, headTurn: t > z ? -0.5 : -0.2 });
    const sag = ease.inOut(prog(t, z - 0.1, z + 0.4)); s.c.pose(addPose(mixPose(POSE.attention, { ...POSE.stand, headNod: 0.3, shrugY: -0.04 }, sag), idle(t, 2))); s.c.face(mixExpr(EXPR.worried, { ...EXPR.sad, lid: 0.7 }, sag), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, s.fz + 9.4], look: [0, 1.45, s.fz + 0.8], fov: 40 }], [info.dur, { pos: [0, 2.0, s.fz + 8.6], look: [0, 1.45, s.fz + 0.8], fov: 40 }]]); },
});
