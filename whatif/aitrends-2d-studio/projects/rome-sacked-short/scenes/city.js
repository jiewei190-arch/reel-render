// s07-s09: the city during the sack (street on fire, silhouettes only) and Senator Pomponius' pepper problem.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { toonStage, camMove, drift } from '/kits/toon3d/toon.js';
import { bean, CAST, POSE, EXPR, idle, addPose, mixPose, mixExpr, walk, run, shrug, point, tremble, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { SETS } from '/kits/toon3d/sets.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { THREE, at, tag } from './_lib.js';

// s07 "For three days, the Eternal City gets looted." — night street, fires, smoke; the senator sprints across with his amphora
registerShot('s07', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'fire', fov: 42, shadowSize: 12, target: [0, 0, -2] }); const set = SETS.romanStreet(st, { fire: true, smoke: true });
    const sen = bean(CAST.senator); st.add(sen); const amp = PR.amphora({ color: '#b5653a', h: 0.75 }); st.add(amp);
    const goths = [[-1.4, -9, 0.2, '#2a1e1e'], [1.2, -11, 0.6], [0.2, -13.5, 0.1]].map(([x, z, ph], i) => { const b = bean({ ...CAST.goth, silhouette: true, seed: 80 + i, shadowBlob: false }); b.position.set(x, 0, z); b.rotation.y = Math.PI; b.userData.ph = ph; st.add(b); const sk = PR.sack({ color: '#1b1216' }); sk.scale.setScalar(0.7); b.hold('R', sk).position.set(0, -0.2, 0); return b; });
    return { stage: st, set, sen, amp, goths }; },
  draw(s, t, info) { s.set.update(t);
    const x = lerp(-3.2, 3.4, ease.linear(prog(t, 0.15, info.dur - 0.2))); s.sen.position.set(x * 0.8, 0, -0.6); s.sen.rotation.y = Math.PI / 2 - 0.85;
    const p = run(t); p.armL = [0.95, 0.3, 0.6]; p.armR = [0.95, 0.3, 0.6]; p.elbowL = 1.1; p.elbowR = 1.1; s.sen.pose(p); s.sen.face(EXPR.panic, t);
    s.sen.updateMatrixWorld(true); const hp = new THREE.Vector3(); s.sen.hand.L.getWorldPosition(hp); const hp2 = new THREE.Vector3(); s.sen.hand.R.getWorldPosition(hp2); s.amp.position.copy(hp).add(hp2).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.45, 0)); s.amp.rotation.z = Math.sin(t * 20) * 0.08;
    s.goths.forEach(b => { const tt = t + b.userData.ph; b.pose(walk(tt, { speed: 1.3 })); b.position.z -= 0; b.position.z = b.userData.z0 ??= b.position.z; b.position.z = b.userData.z0 - tt * 1.3 * WALK_STRIDE; });
    const d = drift(t, 0.04, 5); camMove(s.stage, t, [[0, { pos: [0.3 + d[0], 2.0 + d[1], 7.8], look: [0, 1.9, -3], fov: 44 }], [info.dur, { pos: [0.1, 1.9, 6.8], look: [0, 1.9, -3], fov: 42 }]]); },
});
// s08 "Two years earlier, Rome paid them off with three thousand pounds of pepper." — warm flashback: the senator hands over sacks of PIPER
registerShot('s08', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 0, -1] }); const set = SETS.romanHouse(st, {});
    const sen = bean(CAST.senator); sen.position.set(-1.0, 0, 0.6); sen.rotation.y = 0.55; st.add(sen);
    const goth = bean({ ...CAST.goth, seed: 90 }); goth.position.set(1.2, 0, 0.5); goth.rotation.y = -0.6; st.add(goth);
    const r = [[0.2, -1.2], [0.75, -1.3], [1.3, -1.1], [0.45, -1.75], [1.05, -1.8], [0.75, -0.75]]; const sacks = r.map(([x, z], i) => { const sk = PR.sack({ label: 'PIPER', color: i % 2 ? '#c9b083' : '#bfa274' }).at(x, 0, z, -0.3 + i * 0.15); st.add(sk); return sk; });
    const top = PR.sack({ label: 'PIPER' }).at(0.75, 0.7, -1.45, 0.2); top.scale.setScalar(0.8); st.add(top);
    const carry = PR.sack({ label: 'PIPER' }); carry.scale.setScalar(0.65); st.add(carry);
    return { stage: st, set, sen, goth, carry }; },
  draw(s, t, info) { s.set.update(t); const pep = at(info, 'pepper', 3.7), th = at(info, 'three', 2.3);
    s.sen.pose(addPose(point(POSE.stand, 'L', ease.out(prog(t, 0.3, 0.8)), { up: -0.4 }), idle(t, 5))); s.sen.face(mixExpr(EXPR.smug, EXPR.happy, prog(t, th, th + 0.4)), t);
    s.goth.pose(addPose(POSE.holdFront, idle(t, 9))); s.goth.face(mixExpr(EXPR.suspicious, EXPR.grin, ease.out(prog(t, pep - 0.2, pep + 0.2))), t);
    s.goth.updateMatrixWorld(true); const a = new THREE.Vector3(), b = new THREE.Vector3(); s.goth.hand.L.getWorldPosition(a); s.goth.hand.R.getWorldPosition(b); s.carry.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.25, 0.05)); s.carry.rotation.y = -0.6;
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 8.4], look: [0.2, 1.6, -0.4], fov: 38 }], [info.dur, { pos: [0.3, 2.1, 6.6], look: [0.2, 1.65, -0.2], fov: 36 }]]); },
  overlay(g, t) { tag(g, '408 AD: THE RANSOM', ease.out(prog(t, 0.1, 0.4)) * (1 - prog(t, 3.9, 4.2))); },
});
// s09 "This time, pepper won't fix it." — night, the room ransacked, fire glow in the window; he offers one sack... shrug
registerShot('s09', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'fire', fov: 30, shadowSize: 7, target: [0, 0, 0], key: ['#ff9a4a', 2.2, [5, 6, 2]] }); const set = SETS.romanHouse(st, { mess: true, window: '#ff8a3a' });
    const sen = bean(CAST.senator); sen.position.set(0, 0, 0.6); st.add(sen); const sk = PR.sack({ label: 'PIPER' }); sk.scale.setScalar(0.55); st.add(sk);
    const fl = FX.glow(5, '#ff7a2a', 0.35); fl.position.set(2.6, 2.6, -3.2); st.add(fl);
    const pl = new THREE.PointLight(new THREE.Color('#ff7a2a'), 6, 12, 1.5); pl.position.set(2.4, 2.4, -2.6); st.add(pl);
    return { stage: st, set, sen, sk, pl }; },
  draw(s, t, info) { s.set.update(t); s.pl.intensity = 6 + Math.sin(t * 13) * 0.8 + Math.sin(t * 7.3) * 0.6; const f = at(info, 'fix', 1.3);
    const k = ease.inOut(prog(t, f - 0.3, f + 0.25)); const offer = POSE.holdFront;
    s.sen.pose(addPose(mixPose(offer, shrug(POSE.stand, 1), k), { ...idle(t, 4), ...tremble(t, 0.4) }));
    s.sen.face(mixExpr({ ...EXPR.worried, mouth: 'wavy' }, EXPR.sad, k), t);
    s.sen.updateMatrixWorld(true); const a = new THREE.Vector3(), b = new THREE.Vector3(); s.sen.hand.L.getWorldPosition(a); s.sen.hand.R.getWorldPosition(b);
    if (k < 0.5) { s.sk.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.2, 0.05)); s.sk.rotation.set(0, 0, 0); } else { const dropT = clamp((t - f) * 3); s.sk.position.set(0.15, lerp(1.0, 0, ease.in(dropT)), 1.15); s.sk.rotation.set(0, 0, dropT * 0.4); }
    camMove(s.stage, t, [[0, { pos: [0.3, 2.2, 6.2], look: [0, 1.75, 0.6], fov: 30 }], [info.dur, { pos: [0.2, 2.2, 5.3], look: [0, 1.85, 0.6], fov: 29 }]]); },
});
