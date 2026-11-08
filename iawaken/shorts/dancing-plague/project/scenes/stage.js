// s11, s12, s14: the city builds a stage, hires a band... then bans music.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug } from '/kits/toon3d/rig.js';
import { THREE, at, tag, street, LIGHTS, dance, crowd, official, musician, stagePlatform, drum, pipe, fiddle, horn, sign } from './_lib.js';

const SZ = -1.2;   // stage z
function band(s) {
  const ins = [drum(), pipe(), fiddle(), horn()];
  s.m = [-1.65, -0.55, 0.55, 1.65].map((x, i) => { const b = musician(i); b.position.set(x, s.pl.top, SZ - 0.3); s.stage.add(b); const p = ins[i]; s.stage.add(p); b.inst = p; return b; });
}
const v = new THREE.Vector3();
function play(s, t, k = 1, freeze = -1) {
  s.m.forEach((b, i) => { const tt = freeze >= 0 ? Math.min(t, freeze) : t; const a = tt * 2.1 * Math.PI * 2 + i;
    const base = [
      { ...POSE.stand, armL: [0.9, 0.3, 0.4], armR: [0.9 + Math.max(0, Math.sin(a)) * 0.5 * k, 0.3, 0.4], elbowL: 1.0, elbowR: 1.0 },              // drummer
      { ...POSE.stand, armL: [1.35, 0.0, 0.0], armR: [1.3, -0.05, 0], elbowL: 1.2, elbowR: 1.3, headNod: -0.1 },                                   // piper
      { ...POSE.stand, armL: [1.2, 0.5, 0.3], elbowL: 1.6, armR: [0.8, 0.2 + Math.sin(a) * 0.3 * k, 0.4], elbowR: 1.2, headTilt: 0.3 },             // fiddler
      { ...POSE.stand, armL: [1.3, 0.1, 0], armR: [1.3, -0.1, 0], elbowL: 1.3, elbowR: 1.3, headNod: -0.15 },                                      // horn
    ][i];
    b.pose(addPose(base, { bob: Math.abs(Math.sin(a)) * 0.05 * k, side: Math.sin(a * 0.5) * 0.05 * k }));
    // place the instrument at the hands (world space)
    b.hand.R.getWorldPosition(v); const L = new THREE.Vector3(); b.hand.L.getWorldPosition(L);
    if (i === 0) b.inst.position.set(b.position.x, s.pl.top + 1.05, b.position.z + 0.45);
    else if (i === 2) { b.inst.position.copy(L).add(new THREE.Vector3(0.1, 0.05, 0)); b.inst.rotation.z = -0.9; }
    else { b.inst.position.copy(v.clone().lerp(L, 0.5)).add(new THREE.Vector3(0, 0, 0.25)); b.inst.rotation.x = i === 1 ? 1.2 : 0; }
  });
}
// s11 "So the city builds a stage..." (+ beat) — planks slam down one by one in the square; the councillor presents it proudly
registerShot('s11', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, -1], shadowSize: 9 }); s.pl = stagePlatform({ w: 5, d: 2.4 }); s.pl.position.z = SZ; s.stage.add(s.pl);
    s.o = official(); s.o.position.set(0.9, 0, 3.0); s.o.rotation.y = -0.35; s.stage.add(s.o); s.c = crowd(s.stage, 6, [-3.5, 3.5, -7, -3.5], 23); return s; },
  draw(s, t, info) { const g = clamp((t - 0.35) / 0.9); s.pl.scale.set(1, Math.max(0.01, ease.outBack(clamp(g * 1.3))), 1); s.pl.position.y = 0;
    s.c.forEach((b) => dance(b, t * b.spd / 2, b.ph, 1, { spin: 0.5 }));
    const pr = ease.inOut(prog(t, 1.3, 1.7)); s.o.pose(addPose(point(POSE.stand, 'R', pr, { up: -0.3, across: 0.4 }), idle(t, 2))); s.o.face(mixExpr(EXPR.neutral, EXPR.smug, pr), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.6, 10.5], look: [0.2, 1.5, 0.0], fov: 42 }], [info.dur, { pos: [0.3, 2.5, 9.7], look: [0.2, 1.6, 0.0], fov: 40 }]]); },
});
// s12 "and hires a band." — drum, pipe, fiddle and horn strike up on the stage; the crowd goes wild
registerShot('s12', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, -1], shadowSize: 9 }); s.pl = stagePlatform({ w: 5, d: 2.4 }); s.pl.position.z = SZ; s.stage.add(s.pl); band(s);
    s.c = crowd(s.stage, 8, [-3.0, 3.0, 1.6, 3.0], 29); s.c.forEach(b => (b.rot0 = b.rotation.y = Math.PI + (b.rot0 || 0) * 0.5)); return s; },
  draw(s, t, info) { play(s, t); s.m.forEach((b, i) => b.face({ ...EXPR.grin, lid: 0.35 }, t + i));
    s.c.forEach((b) => dance(b, t * b.spd / 2, b.ph, 1, { spin: 0.4 }));
    camMove(s.stage, t, [[0, { pos: [0, 4.2, 11.5], look: [0, 1.9, -1.2], fov: 38 }], [info.dur, { pos: [0, 4.0, 10.5], look: [0, 2.0, -1.2], fov: 36 }]]); },
});
// s14 "So they banned music." — the councillor slams a NO MUSIC sign down; the band freezes mid-note, sad faces
registerShot('s14', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, -1], shadowSize: 9 }); s.pl = stagePlatform({ w: 5, d: 2.4 }); s.pl.position.z = SZ; s.stage.add(s.pl); band(s);
    s.sg = sign(['NO', 'MUSIC'], { w: 1.3, h: 1.0, post: 1.9 }); s.sg.position.set(0.35, 0, 1.6); s.stage.add(s.sg);
    s.o = official(); s.o.position.set(-0.65, 0, 2.2); s.o.rotation.y = 0.35; s.stage.add(s.o); return s; },
  draw(s, t, info) { const b = at(info, 'banned', 0.34); const slam = ease.outBack(prog(t, b - 0.12, b + 0.08));
    s.sg.position.y = (1 - clamp(slam)) * 3.0; play(s, t, 1, b + 0.06);
    s.m.forEach((m, i) => m.face(t > b + 0.06 ? (t > b + 0.45 ? { ...EXPR.sad, pupil: [0, 0] } : EXPR.shocked) : { ...EXPR.grin, lid: 0.35 }, t + i));
    s.o.pose(addPose({ ...POSE.handsHips }, idle(t, 2))); s.o.face({ ...EXPR.angry, lid: 0.45 }, t);
    const sh = t > b && t < b + 0.25 ? Math.sin(t * 90) * 0.04 * (1 - (t - b) / 0.25) : 0;
    s.stage.cam([0.1 + sh, 2.6 + sh, 9.4], [0.0, 2.0, 0.2], 40); },
});
