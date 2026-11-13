// molasses-flood — "Molasses Flood 1919: The Boston Tsunami That Killed 21 People" (Toon 3D + BEANMEN FX, 9:16).
// TONE GUARD: 21 people really died. Nobody is shown hurt or trapped; the wave only ever hits empty streets, buildings and the
// elevated railway. The aftermath is a quiet beat (no gag). Comedy: the phrase, the tank, the speed, the company's excuse.
import { registerShot, ease, prog, clamp, lerp, noise, E } from '/engine/core.js';
import { THREE, camMove, drift, rbox, cyl, ball, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, run, walk, point, tremble, WALK_STRIDE } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot, dimScene, drawInsert, T, INK } from '/kits/toon3d/insert.js';
import { sunnyLook, softTint } from '/kits/toon3d/sky.js';
import { at, boston, molassesWave, floodSheet, horse, wagon, parlour, knitting, grandma, track, sprinter, courtroom, judge, lawyer, anarchist, bomb, gavel, modernBoston, bostonian, coffee, heatHaze, MOL } from './_lib.js';
import { hookText, bubble, stamp, gauge, redX, freezeLook, scratchMark, vignette } from './_ui.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' };
const v3 = new THREE.Vector3();

// ============ s01 FRAME 1 + s18 CLOSER: the wave towers over a 1919 street, horse + wagon in front (before the hit) ============
// One continuous move: s18 plays loop-time u = -0.87..0, s01 plays u = 0..2.3, so the closer cuts straight into frame 1.
const hero = {
  init(T3) { const s = boston(T3, { tank: false, el: false, target: [0, 0, 2], shadowSize: 16, seed: 4 });
    s.wave = molassesWave({ w: 30, h: 6, back: 18, seed: 2 }); s.stage.add(s.wave);
    s.horse = horse(); s.horse.position.set(1.9, 0, 6.6); s.horse.scale.setScalar(0.8); s.horse.rotation.y = Math.PI / 2 - 0.35; s.stage.add(s.horse);
    s.wagon = wagon(); s.wagon.position.set(-0.6, 0, 6.0); s.wagon.scale.setScalar(0.85); s.wagon.rotation.y = Math.PI / 2 - 0.35; s.stage.add(s.wagon);
    const shaft = PR.propGroup(rbox(2.0, 0.08, 0.08, '#6a4228', 0, 0, 0.35, 0.02), rbox(2.0, 0.08, 0.08, '#6a4228', 0, 0, -0.35, 0.02)); outline(shaft, { px: 2 }); shaft.position.set(0.7, 0.95, 6.3); shaft.scale.setScalar(0.8); shaft.rotation.y = -0.35; s.stage.add(shaft);
    return s; },
  draw(s, u) { s.update(u); const k = clamp((u + 0.87) / 3.17);
    s.wave.position.set(0, 0, lerp(-16, -7.5, ease.out(k))); s.wave.scale.setScalar(lerp(1.45, 1.75, ease.inOut(k))); s.wave.update(u + 3, { h: lerp(0.8, 1.0, ease.out(k)) });
    s.horse.update(u, { lookUp: clamp((u + 0.2) / 0.6), look: [0.3, 0.3] });
    s.stage.cam([lerp(3.0, 2.4, k), lerp(1.5, 1.3, k), lerp(17.5, 15.8, ease.inOut(k))], [-0.5, lerp(5.2, 5.8, k), -6], 60); },
};
registerShot('s01', { kind: '3d', init: hero.init, draw(s, t) { hero.draw(s, t); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.6 }, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'exclaim', on: 'horse', at: 0.35, until: 2.1, scale: 0.9 }, { fx: 'sweat', on: 'horse', at: 0.8 }]); hookText(g, t); },
});
registerShot('s18', { kind: '3d', init: hero.init, draw(s, t, info) { hero.draw(s, t - info.dur); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.6 }, tint: '#ffcf8a' }); },
});

// ============ s02 grandma: "slow as molasses, sweetie." -> record scratch + freeze on "killed" ============
registerShot('s02', { kind: '3d',
  init(T3) { const s = parlour(T3); s.gm = grandma(); s.gm.position.set(-0.6, 0.18, 0.15); s.stage.add(s.gm); s.kn = knitting(); s.stage.add(s.kn); return s; },
  draw(s, t, info) { const fz = at(info, 'killed', 1.78) - 0.06; const tt = Math.min(t, fz);
    const knit = Math.sin(tt * 9) * 0.12;
    s.gm.pose(addPose(POSE.sit, { armL: [0.75 + knit, 0.12, 0.2], armR: [0.75 - knit, 0.12, -0.2], elbowL: 1.35, elbowR: 1.35, headNod: 0.08, ...idle(tt, 4, 0.6) }));
    const talking = tt < 1.4 ? 0.7 : 0; s.gm.face({ ...EXPR.happy, talk: talking, pupil: [0.1, -0.15] }, tt);
    s.gm.hand.L.getWorldPosition(v3); const a = v3.clone(); s.gm.hand.R.getWorldPosition(v3); s.kn.position.copy(a.add(v3).multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.05, 0.12)); s.kn.rotation.z = knit * 0.6;
    camMove(s.stage, tt, [[0, { pos: [0.4, 2.0, 7.0], look: [-0.45, 1.55, 0], fov: 46 }], [3.7, { pos: [0.1, 1.9, 5.6], look: [-0.5, 1.6, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { const fz = at(info, 'killed', 1.78) - 0.06; const an = anchor(s.stage, s.gm);
    bubble(g, an.x, an.y, 'Slow as molasses, sweetie.', t - 0.1, { up: 170, size: 52 });
    if (t >= fz) { freezeLook(g, 1, clamp(1 - (t - fz) / 0.18) * 0.7); scratchMark(g, t - fz, E.W / 2, E.H * 0.24); reactions(g, t, s, [{ fx: 'exclaim', on: 'gm', at: fz + 0.12, scale: 1.0 }]); }
    else softTint(g, '#ffcf8a', 0.18); },
});

// ============ s03 Boston, 1919: Commercial Street, the giant tank at the end ============
const street = (o = {}) => (T3) => { const s = boston(T3, { tankAt: [-1.5, 0, -24], target: [0, 0, -14], shadowSize: 18, seed: 6, ...o }); return s; };
registerShot('s03', { kind: '3d', init: street(),
  draw(s, t, info) { s.update(t); s.tank.groan(t, 0.15);
    camMove(s.stage, t, [[0, { pos: [2.6, 2.0, 16], look: [-1.0, 7.5, -24], fov: 54 }], [info.dur, { pos: [1.8, 2.2, 9.5], look: [-1.2, 7.8, -24], fov: 52 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: [-1.5, 15.5, -24], at: 0.5, scale: 1.1 }]);
    const a = clamp(t / 0.3) * clamp((info.dur - t) / 0.3); g.save(); g.globalAlpha = a; T(g, 'BOSTON  ·  JAN 15, 1919', E.W / 2, E.H * 0.1, 58, { color: '#ffffff', stroke: INK, maxW: 900 }); g.restore(); },
});

// ============ s04 the tank groans, rivets pop like popcorn ============
const tankClose = {
  init: street({ target: [-1.5, 0, -18], shadowSize: 12 }),
  draw(s, t, info) { s.update(t); const k = clamp(0.4 + t * 0.35); s.tank.groan(t, k); s.tank.pop(t, 0.35, 2.2);
    camMove(s.stage, t, [[0, { pos: [3.2, 0.9, -7.5], look: [-1.5, 9, -18], fov: 58 }], [3, { pos: [2.6, 0.9, -9.2], look: [-1.5, 9.5, -18], fov: 56 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.6, amp: 0.05, dur: 0.4 }, { fx: 'shake', at: 1.2, amp: 0.05, dur: 0.4 }]); },
};
const S04 = [{ fx: 'sweat', on: [-1.5, 11.5, -17.5], at: 0.25, scale: 1.4 }, { fx: 'exclaim', on: [-1.5, 13.5, -17.5], at: 0.9, scale: 1.3 }];
registerShot('s04', { kind: '3d', init: tankClose.init, draw: tankClose.draw, overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, S04); } });

// ============ s05 INSERT: 2.3 MILLION GALLONS (stamped) over the groaning tank ============
registerShot('s05', { kind: '3d', init: tankClose.init, draw: (s, t, info) => tankClose.draw(s, t + 1.5, info),
  overlay(g, t, info, s) { dimScene(g, 8, 0.5); drawInsert(g, { type: 'counter', title: '50-FOOT STEEL TANK', value: 2.3, decimals: 1, suffix: ' MILLION', lines: [], color: '#e8a040' }, t);
    stamp(g, 'GALLONS', t - 1.25, { y: E.H * 0.53, size: 104, rot: -0.1, sub: 'OF MOLASSES' }); },
});

// ============ s06 RIPS OPEN: panels peel, a brown wave erupts ============
registerShot('s06', { kind: '3d',
  init(T3) { const s = street({ target: [-1.5, 0, -16], shadowSize: 16 })(T3); s.wave = molassesWave({ w: 16, h: 6, back: 10, seed: 5 }); s.wave.position.set(-1.5, 0, -22); s.stage.add(s.wave);
    s.dome = ball(1, MOL, -1.5, 0, -24, 28); s.dome.userData.noOutline = true; s.stage.add(s.dome); return s; },
  draw(s, t, info) { s.update(t); const b0 = at(info, 'rips', 0.12); const k = clamp((t - b0) / 0.45);
    s.tank.groan(t, 1 - k); s.tank.pop(t + 3, 0.35, 2.2); s.tank.burst(k);
    const e = ease.out(clamp((t - b0) / 0.9)); s.dome.scale.set(5.5 * e + 0.01, 9 * e * (1 - 0.3 * e) + 0.01, 5.5 * e + 0.01); s.dome.visible = e > 0.01;
    s.wave.visible = t > b0 + 0.05; s.wave.position.z = -22 + ease.out(clamp((t - b0) / 1.0)) * 9; s.wave.scale.setScalar(0.4 + e * 0.9); s.wave.update(t, {});
    camMove(s.stage, t, [[0, { pos: [2.2, 2.4, 6], look: [-1.5, 7.5, -24], fov: 54 }], [info.dur, { pos: [2.6, 2.2, 8.5], look: [-1.5, 6.5, -24], fov: 56 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: b0, amp: 0.22, dur: 0.7 }]); },
  overlay(g, t, info, s) { const b0 = at(info, 'rips', 0.12); sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'flash', at: b0, dur: 0.22 }, { fx: 'speedlines', at: b0 + 0.05, until: info.dur }]); },
});

// ============ s07 the wave barrels down the empty street (15-foot wave) / s08 INSERT speedometer 35 MPH ============
const barrel = {
  init(T3) { const s = boston(T3, { tank: false, target: [0, 0, 0], shadowSize: 16, seed: 9 }); s.wave = molassesWave({ w: 30, h: 6, back: 18, seed: 7 }); s.stage.add(s.wave);
    s.junk = [PR.barrel().at(-1.2, 0, 0), PR.crate().at(1.8, 0, 0), PR.barrel({ color: '#6a4228' }).at(0.4, 0, 0)]; s.junk.forEach(j => s.stage.add(j)); return s; },
  draw(s, t) { s.update(t); const z = -34 + t * 9.5; s.wave.position.set(0, 0, z); s.wave.scale.setScalar(1.55); s.wave.update(t, {});
    s.junk.forEach((j, i) => { const jz = z + 3.2 + i * 0.7; j.position.set([-2.2, 2.4, 0.4][i], 0.6 + Math.abs(Math.sin(t * 5 + i)) * 1.6 + i * 0.4, jz); j.rotation.set(t * (3 + i), t * 2, t * (1.5 + i)); });
    s.stage.cam([0.8 + Math.sin(t * 7) * 0.05, 1.3, 12 + t * 1.2], [0, 5.8, z], 58); },
};
registerShot('s07', { kind: '3d', init: barrel.init, draw: barrel.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'speedlines', at: 0, until: info.dur }]); },
});
registerShot('s08', { kind: '3d', init: barrel.init, draw: (s, t) => barrel.draw(s, t + 2.4),
  overlay(g, t, info, s) { dimScene(g, 9, 0.55); gauge(g, t, 35, { title: 'WAVE SPEED', sub: '15-FOOT WAVE' }); },
});

// ============ s09 "That's faster than Usain Bolt": a lane-sized molasses wave overtakes a (generic) sprinter -> double take ============
registerShot('s09', { kind: '3d',
  init(T3) { const s = track(T3); s.sp = sprinter(); s.sp.rotation.y = Math.PI / 2; s.sp.position.z = -1.2; s.stage.add(s.sp);
    s.wave = molassesWave({ w: 5, h: 6, back: 10, seed: 9 }); s.wave.rotation.y = Math.PI / 2; s.wave.scale.setScalar(0.26); s.wave.position.z = 1.1; s.stage.add(s.wave); return s; },
  draw(s, t, info) { s.sky.update(t); const slow = ease.inOut(prog(t, 1.15, 1.6)); const vx = 6.2 * (1 - 0.45 * slow);
    const x = t * 6.2 - slow * 0.6; s.sp.position.x = x;
    const look = t < 0.85 ? 0 : t < 1.05 ? -ease.inOut(prog(t, 0.85, 1.0)) * 0.9 : t < 1.2 ? -0.9 + ease.inOut(prog(t, 1.05, 1.15)) * 0.9 : -ease.inOut(prog(t, 1.2, 1.35)) * 1.0;
    s.sp.pose(addPose(run(t, { speed: 2.6 - slow * 0.8 }), { headTurn: look, bob: 0 })); s.sp.face(t < 1.15 ? EXPR.grin : mixExpr(EXPR.worried, EXPR.shocked, prog(t, 1.15, 1.35)), t);
    const wx = x - 3.2 + t * t * 3.4; s.wave.position.x = wx; s.wave.update(t * 1.3, {});
    s.stage.cam([x + 1.6, 4.2, 11.5], [x + 2.0, 1.2, -0.4], 42); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'speedlines', at: 0, until: 0.9 }, { fx: 'question', on: 'sp', at: 0.9, until: 1.25 }, { fx: 'exclaim', on: 'sp', at: 1.3 }, { fx: 'sweat', on: 'sp', at: 1.4 }]); },
});

// ============ s10 "It flattens buildings" (+ the firehouse slides off its foundation) — empty buildings, no people ============
registerShot('s10', { kind: '3d',
  init(T3) { const s = boston(T3, { tank: false, firehouse: true, firehouseAt: [-7.5, 0.22, 2.5], target: [-3, 0, 0], shadowSize: 16, seed: 10 });
    s.wave = molassesWave({ w: 34, h: 6, back: 18, seed: 11 }); s.stage.add(s.wave);
    s.found = rbox(5.4, 0.35, 6.4, '#9a948a', -10, 0.18, 2.5, 0.04); s.stage.add(outline(PR.propGroup(s.found), { px: 2 })); return s; },
  draw(s, t, info) { s.update(t); const zf = -26 + t * 18; s.wave.position.set(-2, 0, zf); s.wave.scale.setScalar(1.25); s.wave.update(t, {});
    s.left.forEach(b => { const hit = clamp((zf + 2 - b.position.z) / 3); if (b === s.left[0] || b === s.left[1]) return; b.scale.y = lerp(1, 0.28, ease.outBack(hit)); b.rotation.x = Math.sin(hit * Math.PI) * 0.08; });
    const fh = clamp((zf + 2 - 2.5) / 2.5); s.firehouse.position.z = 2.5 - ease.out(fh) * 2.6; s.firehouse.position.x = -7.5 + ease.out(fh) * 0.6; s.firehouse.rotation.z = ease.out(fh) * 0.06;
    camMove(s.stage, t, [[0, { pos: [3.2, 2.4, 15], look: [-6.5, 4.5, -2], fov: 56 }], [info.dur, { pos: [2.6, 2.6, 16.5], look: [-6.5, 4.0, 0], fov: 56 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.55, amp: 0.12, dur: 0.6 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'stars', on: [-8, 7.5, 1.2], at: 0.8, scale: 1.3 }]); },
});

// ============ s11 the elevated railway twists like spaghetti ============
registerShot('s11', { kind: '3d',
  init(T3) { const s = boston(T3, { tank: false, wet: true, target: [3, 0, -4], shadowSize: 16, seed: 12 }); return s; },
  draw(s, t, info) { s.update(t); const sp = at(info, 'spaghetti', 2.14); const k = ease.inOut(prog(t, 0.3, sp + 0.2));
    s.el.segs.forEach((g, i) => { const ph = g.position.z * 0.42; g.rotation.z = k * Math.sin(ph + t * 2.4) * 0.42; g.rotation.x = k * Math.cos(ph * 0.8 + t * 1.9) * 0.14; g.position.y = k * (Math.sin(ph * 1.3 + t * 2) * 0.9 - 0.7); g.position.x = k * Math.sin(ph * 0.9 + t * 1.6) * 0.9; });
    camMove(s.stage, t, [[0, { pos: [-1.8, 1.5, 10], look: [5.0, 6.0, -8], fov: 56 }], [info.dur, { pos: [-1.2, 1.6, 7], look: [5.4, 6.4, -10], fov: 54 }]]); },
  overlay(g, t, info, s) { const sp = at(info, 'spaghetti', 2.14); sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'question', on: [5.6, 8.2, -6], at: 0.9, until: sp - 0.05, scale: 1.2 }, { fx: 'stars', on: [5.6, 8.2, -6], at: sp, scale: 1.3 }]); },
});

// ============ s12 aftermath: quiet sticky street, wreckage, "21 dead / 150 injured" (respectful beat, no gag) ============
registerShot('s12', { kind: '3d',
  init(T3) { const s = boston(T3, { tank: false, wet: true, light: 'day', target: [0, 0, -4], shadowSize: 16, seed: 13, skyOpts: { top: '#6f8098', mid: '#a8b2c0', horizon: '#d6cfc4', clouds: 10, cloudColor: '#e4e4e8' } });
    const junk = [PR.barrel().at(-1.5, 0.05, 2), PR.crate().at(1.6, 0.05, -1, 0.6), PR.barrel({ color: '#6a4228' }).at(2.4, 0.05, -6), PR.crate({ s: 0.6 }).at(-2.6, 0.05, -4, 1.2), PR.cart({ color: '#7a4a2a' }).at(-0.6, 0.05, -11, 1.9)];
    junk[0].rotation.z = Math.PI / 2; junk[2].rotation.x = Math.PI / 2; junk.forEach(j => s.stage.add(j));
    for (let i = 0; i < 9; i++) { const p = rbox(2.4, 0.12, 0.3, '#7a5032', ((i * 37) % 9) - 4.5, 0.12, -((i * 53) % 18) + 2, 0.03); p.rotation.y = i * 1.3; p.rotation.z = (i % 3) * 0.08; s.stage.add(outline(PR.propGroup(p), { px: 2 })); }
    s.el.segs.forEach((g, i) => { if (i > 3 && i < 7) { g.rotation.z = (i - 5) * 0.12; g.position.y = -0.8; } });
    s.left.forEach((b, i) => { if (i > 2 && i < 6) b.scale.y = 0.35; }); return s; },
  draw(s, t, info) { s.update(t * 0.4); camMove(s.stage, t, [[0, { pos: [0.4, 3.2, 15], look: [0, 1.6, -10], fov: 50 }], [info.dur, { pos: [0.2, 3.6, 17.5], look: [0, 1.8, -10], fov: 50 }]]); },
  overlay(g, t, info, s) { const d = at(info, 'dead.', 1.04), i0 = at(info, 'injured.', 2.12); dimScene(g, 3, 0.42, '#141018'); vignette(g, 0.5);
    const a1 = ease.out(clamp((t - 0.05) / 0.4)), a2 = ease.out(clamp((t - (i0 - 0.5)) / 0.4));
    g.save(); g.globalAlpha = a1; T(g, '21 DEAD', E.W / 2, E.H * 0.4, 150, { color: '#f4efe6', stroke: INK, maxW: 960 }); g.restore();
    g.save(); g.globalAlpha = a2; T(g, '150 INJURED', E.W / 2, E.H * 0.4 + 150, 92, { color: '#d8d2c8', stroke: INK, maxW: 960 }); g.restore(); },
});

// ============ s13 court: the company's lawyer blames "anarchist bombers" (a cartoon guy with a round bomb: "???") ============
const court = {
  init(T3) { const s = courtroom(T3); s.j = judge(); s.j.position.set(0, 0.95, -3.7); s.stage.add(s.j); s.gv = gavel(); s.stage.add(s.gv);
    s.law = lawyer(); s.law.position.set(-1.45, 0, 2.2); s.law.rotation.y = 0.45; s.stage.add(s.law);
    s.an = anarchist(); s.an.position.set(1.55, 0, 2.2); s.an.rotation.y = -0.4; s.stage.add(s.an); s.bm = bomb(); s.stage.add(s.bm); return s; },
  pose(s, t, o) { const { pt = 0, slam = -9, sweat = false } = o;
    s.law.pose(addPose(point(POSE.stand, 'L', ease.inOut(clamp(pt)), { up: 0.05, across: 0.15 }), idle(t, 3)));
    s.law.face(sweat ? mixExpr(EXPR.smug, EXPR.worried, clamp((t - slam - 0.2) / 0.3)) : EXPR.smug, t);
    s.an.pose(addPose(mixPose(POSE.holdFront, POSE.stand, 0.2), { ...idle(t, 5), headTilt: 0.15 })); s.an.face(t > 0.7 ? EXPR.worried : EXPR.neutral, t);
    s.an.hand.R.getWorldPosition(v3); s.bm.position.copy(v3).add(new THREE.Vector3(-0.15, 0.1, 0.25));
    const sl = slam > -5 ? t - slam : -1; const lift = sl < -0.35 ? 0 : sl < 0 ? ease.out(prog(sl, -0.35, -0.05)) : Math.max(0, 1 - sl * 6);
    s.j.pose(addPose(POSE.stand, { armR: [1.2 + lift * 1.0, 0.25, 0], elbowR: 1.4 - lift * 0.4, headNod: 0.05, ...idle(t, 6) }));
    s.j.face(sl > -0.4 ? mixExpr(EXPR.deadpan, EXPR.angry, clamp((sl + 0.4) / 0.3)) : EXPR.deadpan, t);
    s.j.hand.R.getWorldPosition(v3); s.gv.position.copy(v3).add(new THREE.Vector3(0, 0.25, 0.05)); s.gv.rotation.x = -0.3 + lift * 0.6; },
};
registerShot('s13', { kind: '3d', init: court.init,
  draw(s, t, info) { const an = at(info, 'anarchist', 0.86); court.pose(s, t, { pt: (t - an + 0.3) / 0.35 });
    camMove(s.stage, t, [[0, { pos: [0, 2.5, 10.2], look: [0, 2.0, 0], fov: 50 }], [info.dur, { pos: [0.2, 2.4, 9.2], look: [0.3, 1.9, 0.5], fov: 50 }]]); },
  overlay(g, t, info, s) { const an = at(info, 'anarchist', 0.86); softTint(g, '#ffcf8a', 0.16);
    reactions(g, t, s, [{ fx: 'question', on: 'an', at: an + 0.25 }, { fx: 'sweat', on: 'an', at: an + 0.6 }]); },
});
registerShot('s14', { kind: '3d', init: court.init,
  draw(s, t, info) { s.an.visible = s.bm.visible = false; const no = at(info, 'no.', 0.52), gb = at(info, 'garbage', 2.04); court.pose(s, t + 2.4, { pt: 1, slam: no + 2.4, sweat: true });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.9, 7.4], look: [-0.45, 2.3, -2.5], fov: 48 }], [info.dur, { pos: [0.15, 2.85, 6.8], look: [-0.45, 2.3, -2.5], fov: 47 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: no, amp: 0.14, dur: 0.45 }, { fx: 'shake', at: gb + 0.18, amp: 0.1, dur: 0.4 }]); },
  overlay(g, t, info, s) { const no = at(info, 'no.', 0.52), gb = at(info, 'garbage', 2.04); softTint(g, '#ffcf8a', 0.16);
    reactions(g, t, s, [{ fx: 'flash', at: no, dur: 0.18 }, { fx: 'exclaim', on: 'law', at: no + 0.1, until: gb - 0.1 }, { fx: 'sweat', on: 'law', at: no + 0.35 }]);
    stamp(g, 'GARBAGE TANK', t - gb + 0.05, { y: E.H * 0.4, size: 118, rot: -0.12 }); },
});

// ============ s15 + s16 modern Boston, hot day: a local stops, sniffs, whispers "...molasses." ============
const modern = {
  init(T3) { const s = modernBoston(T3); s.p = bostonian(); s.stage.add(s.p); s.cup = coffee(); s.stage.add(s.cup); return s; },
  place(s, t, stopAt, sniffAt) { const walking = 1 - ease.inOut(prog(t, stopAt - 0.25, stopAt + 0.1)); const x = -3 + Math.min(t, stopAt) * 1.5 * WALK_STRIDE * 0.85;
    s.p.position.set(x, 0, 1.2); s.p.rotation.y = lerp(Math.PI / 2 - 0.25, 0.15, 1 - walking);
    const sn = ease.inOut(prog(t, sniffAt, sniffAt + 0.35)); const base = walking > 0.01 ? walk(t, { speed: 1.5 }) : POSE.stand;
    s.p.pose(addPose(mixPose(POSE.stand, base, walking), { armR: [0.9, 0.15, 0], elbowR: 1.5, headNod: -sn * 0.32, headTilt: sn * 0.08, ...idle(t, 7, 0.6) }));
    s.p.hand.R.getWorldPosition(v3); s.cup.position.copy(v3).add(new THREE.Vector3(0, 0.12, 0.05));
    return { walking, sn, x }; },
};
registerShot('s15', { kind: '3d', init: modern.init,
  draw(s, t, info) { s.sky.update(t); const { x } = modern.place(s, t, 9, 9); s.p.face({ ...EXPR.bored, lid: 0.55, mouth: 'wavy' }, t);
    camMove(s.stage, t, [[0, { pos: [x - 0.2, 2.2, 8.5], look: [x + 0.3, 1.8, 0], fov: 44 }], [info.dur, { pos: [x - 0.1, 2.1, 7.8], look: [x + 0.3, 1.8, 0], fov: 44 }]], ease.linear || ((k) => k)); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 1.1 }, tint: '#ffb070', tintAmount: 0.3 }); heatHaze(g, t);
    reactions(g, t, s, [{ fx: 'sweat', on: 'p', at: 0.3 }, { fx: 'sweat', on: 'p', at: 1.4, dx: -30, seed: 4 }]);
    const a = clamp(t / 0.3); g.save(); g.globalAlpha = a; T(g, 'BOSTON, TODAY  ·  97°F', E.W / 2, E.H * 0.1, 56, { color: '#ffffff', stroke: INK, maxW: 900 }); g.restore(); },
});
registerShot('s16', { kind: '3d', init: modern.init,
  draw(s, t, info) { s.sky.update(t); const { sn } = modern.place(s, t + 2.9, 2.9 + 0.0, 2.9 + 0.05); const open = ease.inOut(prog(t, 0.45, 0.7));
    s.p.face(mixExpr({ ...EXPR.neutral, lid: 1, lower: 0.2, brow: 0.3, mouth: 'line', mouthW: 0.5 }, { ...EXPR.suspicious, pupil: [0, 0], mouth: 'o', mouthW: 0.5 }, open), t);
    const x = s.p.position.x; camMove(s.stage, t, [[0, { pos: [x + 0.35, 2.3, 4.6], look: [x + 0.05, 2.1, 1.2], fov: 38 }], [info.dur, { pos: [x + 0.3, 2.3, 4.0], look: [x + 0.05, 2.15, 1.2], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffb070', tintAmount: 0.26 }); heatHaze(g, t, 0.7); const an = anchor(s.stage, s.p);
    bubble(g, an.x, an.y, '...molasses.', t - 0.5, { up: 210, size: 60, dx: 60 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: 0.55, scale: 0.8, dx: -90 }]); },
});

// ============ s17 "Slow as molasses?" -> big red X -> "Biggest lie in history." (over grandma, frozen) ============
registerShot('s17', { kind: '3d',
  init(T3) { const s = parlour(T3); s.gm = grandma(); s.gm.position.set(-0.6, 0.18, 0.15); s.stage.add(s.gm); s.kn = knitting(); s.stage.add(s.kn); return s; },
  draw(s, t) { s.gm.pose(addPose(POSE.sit, { armL: [0.75, 0.12, 0.2], armR: [0.75, 0.12, -0.2], elbowL: 1.35, elbowR: 1.35, headNod: 0.08 })); s.gm.face({ ...EXPR.happy }, 0);
    s.gm.hand.L.getWorldPosition(v3); const a = v3.clone(); s.gm.hand.R.getWorldPosition(v3); s.kn.position.copy(a.add(v3).multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.05, 0.12));
    camMove(s.stage, t, [[0, { pos: [0.1, 1.9, 5.4], look: [-0.5, 1.6, 0], fov: 44 }], [3.3, { pos: [0.0, 1.9, 4.6], look: [-0.5, 1.7, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { const bg = at(info, 'Biggest', 1.65); freezeLook(g, 1); dimScene(g, 7, 0.5);
    const p = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, E.H * 0.36); g.scale(p, p); T(g, 'SLOW AS', 0, -70, 120, { color: '#ffffff', stroke: INK, maxW: 980 }); T(g, 'MOLASSES?', 0, 60, 150, { color: '#e8a040', stroke: INK, maxW: 1000 }); g.restore();
    redX(g, E.W / 2, E.H * 0.36, 360, t - bg + 0.08);
    const q = ease.outBack(clamp((t - bg - 0.2) / 0.3)); if (q > 0) { g.save(); g.translate(E.W / 2, E.H * 0.56); g.scale(q, q); T(g, 'BIGGEST LIE', 0, 0, 104, { color: '#ffd25a', stroke: INK, maxW: 980 }); T(g, 'IN HISTORY', 0, 110, 80, { color: '#ffffff', stroke: INK, maxW: 980 }); g.restore(); } },
});
