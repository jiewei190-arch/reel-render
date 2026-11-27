// What if Earth stopped spinning for one second? — 20 shots, Toon 3D + BEANMEN effects. Cartoon chaos, nobody hurt.
// East = screen right (+X). s01 = frame 1 (already sliding); s20 returns to frame 1's camera and starts the slide -> loop.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, nod, tremble, shrug, point } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, globe, spaceStage, starfield, farmSet, looseStuff, slideEast, farmer, scientist, polar, cow, coastSet, bigWave,
  rubberRing, poleSet, mug, hookCaption, richLine, stamp, chip, arrow, stopSign, streaks, PR, rbox, cyl, ball, box,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const soft = { rays: false, tint: '#ffe0b0' };

// ---------------------------------------------------------------- FARM (s01, s06, s09, s10, s11, s20)
const STUFF = [['cow', -1.3, -1.6, 0.5], ['chicken', -2.6, 0.4, 0.8], ['chicken', 0.3, 0.9, -0.4], ['hay', -3.6, -2.8, 0.2], ['barrel', 1.1, -0.9],
  ['crate', -0.4, 1.6, 0.3], ['sack', -2.2, -0.2], ['chicken', -5.2, 1.0, 0.6], ['barrel', -6.5, -1.2], ['hay', -8.5, -2.2, -0.2], ['cart', -10.5, -1.6, 0.1], ['chicken', -9.0, 0.8], ['crate', -12.5, 0.4]];
function farmScene(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 12, target: [0, 1, -1] });
  const env = farmSet(st, { seed: 3, sign: o.sign });
  const stuff = looseStuff(st, o.stuff || STUFF);
  const f = farmer(); f.home = [-0.5, 0, 1.2]; f.position.set(...f.home); f.rotation.y = -0.15; st.add(f);
  return { stage: st, env, stuff, f };
}
const CAM0 = { pos: [-0.3, 2.8, 11.6], look: [-0.2, 1.3, -0.6], fov: 42 }, CAM1 = { pos: [0.2, 2.7, 10.8], look: [0.2, 1.3, -0.6], fov: 41 };
// u = seconds since the stop (<0: calm). Farmer gets pulled east, flailing, cap held on.
function farmPlay(s, t, u, o = {}) {
  s.env.update(t);
  s.stuff.forEach((m, i) => { if (u <= 0) { m.position.set(...m.home); m.rotation.set(0, m.ry0 + (m.kind === 'chicken' ? Math.sin(t * 3 + i) * 0.3 : 0), 0); if (m.kind === 'chicken') m.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.05; } else slideEast(m, u, i, { v: o.v ?? 2.7, hop: o.hop ?? 0.55 }); });
  const f = s.f, k = clamp(u * 2.2);
  if (u <= 0) { f.position.set(...f.home); f.rotation.set(0, -0.15, 0); f.pose(addPose(POSE.relaxed, idle(t, 3, 0.7))); f.face(o.calm || EXPR.happy, t); return; }
  f.position.set(f.home[0] + (o.fv ?? 2.4) * u, 0.15 + 0.75 * k + Math.sin(u * 5) * 0.1, f.home[2]);
  f.rotation.set(0, -0.15 - 0.4 * k, -1.05 * k);
  f.pose(addPose(mixPose(POSE.relaxed, { ...POSE.panic, armR: [1.2, 2.6, 0.2], elbowR: 2.2 }, k), { ...tremble(t, 1), legL: [Math.sin(t * 14) * 0.5, 0.2], legR: [-Math.sin(t * 14) * 0.5, 0.2] }));
  f.face(mixExpr(EXPR.happy, EXPR.shocked, k), t);
}
const proj = (st, obj, y = 1) => { const v = new THREE.Vector3(); obj.getWorldPosition(v); v.y += y; v.project(st.camera); return [(v.x + 1) / 2 * 1080, (1 - v.y) / 2 * 1920, v.z < 1]; };
function farmStreaks(g, s, u) { if (u <= 0.05) return; s.stuff.concat([s.f]).forEach((m, i) => { const [x, y, ok] = proj(s.stage, m, m === s.f ? 1.4 : 0.6); if (ok && x > -100 && x < 1180) streaks(g, x - 30, y, 3, 120, clamp(u * 3) * 0.8, i + 1); }); }

// s01 — HOOK (frame 1). The farm, already sliding east: cow, chickens, hay, barrels, the farmer. Top caption 0-3.5 s.
registerShot('s01', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { farmPlay(s, t, t + 0.3, { v: 2.0, fv: 1.0 }); camMove(s.stage, t, [[0, CAM0], [info.dur, CAM1]], ease.out); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.05, dur: 0.6 }]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS); farmStreaks(g, s, t + 0.3);
    hookCaption(g, t, [['if EARTH', '#ffffff'], ['STOPPED', '#ffd25a']], [['for', '#ffffff'], ['1 SECOND', '#ff5a4a']], { until: 3.5 - 0 });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'f', at: 0.1, color: '#ff3b30' }, { fx: 'sweat', on: 'f', at: 0.5 }]);
  },
});

// s01b — "...everything would fly sideways." Hard cut, low and close: the cow and chickens sail past east; caption holds to 3.5 s.
registerShot('s01b', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { const u = info.shot.start + 0.3 + t; farmPlay(s, t, u, { v: 2.0, fv: 1.0 });
    camMove(s.stage, t, [[0, { pos: [3.2, 1.3, 5.6], look: [4.4, 1.2, -0.8], fov: 40 }], [info.dur, { pos: [4.4, 1.35, 5.4], look: [5.6, 1.2, -0.8], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); farmStreaks(g, s, info.shot.start + 0.3 + t);
    hookCaption(g, t, [['if EARTH', '#ffffff'], ['STOPPED', '#ffd25a']], [['for', '#ffffff'], ['1 SECOND', '#ff5a4a']], { noPop: true, until: 3.5 - info.shot.start });
    reactions(g, t, s, [{ fx: 'speedlines', at: 0 }, { fx: 'exclaim', on: s.stuff[0], at: 0.1, height: 1.9, color: '#ff3b30' }]); },
});

// s02 — "Relax. It's a thought experiment..." Freeze-frame: everything hangs mid-air, a pause icon, THOUGHT EXPERIMENT stamp.
registerShot('s02', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { farmPlay(s, 1.15, 1.15, { v: 2.0, fv: 1.0 }); s.f.face(mixExpr(EXPR.shocked, EXPR.worried, prog(t, 0.4, 0.8)), t); camMove(s.stage, t, [[0, { pos: [2.2, 2.6, 8.4], look: [2.4, 1.5, -0.2], fov: 40 }], [info.dur, { pos: [2.3, 2.55, 7.8], look: [2.4, 1.5, -0.2], fov: 39 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft); g.save(); g.fillStyle = 'rgba(30,40,80,0.18)'; g.fillRect(0, 0, 1080, 1920); g.restore();
    const k = ease.outBack(clamp(t / 0.25)); g.save(); g.translate(540, 520); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.92)'; g.strokeStyle = '#2a1c15'; g.lineWidth = 8;
    for (const x of [-48, 18]) { g.beginPath(); g.roundRect(x, -70, 30, 140, 10); g.fill(); g.stroke(); } g.restore();
    stamp(g, t, 'THOUGHT EXPERIMENT', { at: at(info, 'thought', 0.6) - 0.05, x: 540, y: 380, size: 70, color: '#ffffff', fill: '#2f6fb0', rot: -0.05 });
  },
});

// s03 — "...but scientists have worked out what happens." A scientist bean with a desk globe and a clipboard, nodding.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 6, target: [0, 1, 0], bg: ['#dfe9f4', '#f4efe4'] });
    const fl = PR.texMat ? null : null;
    st.add((() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), PR.texMat(PR.TEX.planks('#9a7048', [6, 4], 8))); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; return m; })());
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), PR.texMat(PR.TEX.plaster('#e6e0d0', [4, 2]))); wall.position.set(0, 7, -3); wall.userData.noOutline = true; st.add(wall);
    const tb = PR.table({ w: 2.6, d: 1.2, h: 1.0, color: '#6a4a30' }); tb.position.set(0.9, 0, 0.2); st.add(tb);
    const gl = globe({ r: 0.5 }); gl.position.set(1.4, 1.62, 0.2); st.add(gl); gl.children[1].visible = false;
    const stand = cyl(0.05, 0.18, 0.12, '#c9a14a', 1.4, 1.1, 0.2, 12); st.add(stand);
    const sh = PR.shelf({ w: 1.8, h: 2.2, color: '#6a4228', seed: 4 }); sh.position.set(-2.2, 0, -2.6); st.add(sh);
    const sc = scientist(); sc.position.set(-0.4, 0, 0.6); sc.rotation.y = 0.35; st.add(sc);
    const clip = rbox(0.45, 0.6, 0.04, '#c99a5a', 0, 0, 0, 0.02); clip.add(rbox(0.38, 0.48, 0.02, '#ffffff', 0, -0.03, 0.025, 0.01)); st.add(clip);
    return { stage: st, gl, sc, clip };
  },
  draw(s, t, info) {
    s.gl.spin.rotation.y = t * 1.2;
    s.sc.pose(addPose({ ...POSE.holdFront, armL: [0.05, 0.16, 0], elbowL: 0.2 }, { ...idle(t, 4, 0.6), ...nod(t, 0.12, 1.2), headTurn: 0.2 }));
    s.sc.face(mixExpr(EXPR.neutral, EXPR.smug, prog(t, 0.3, 0.6)), t);
    s.sc.hand.R.getWorldPosition(s.clip.position); s.clip.rotation.set(-0.5, 0.35, 0);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.3, 7.6], look: [0.5, 1.6, 0.3], fov: 38 }], [info.dur, { pos: [0.5, 2.25, 7.0], look: [0.5, 1.6, 0.3], fov: 37 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'gl', at: 0.2, height: 0.6 }, { fx: 'exclaim', on: 'sc', at: at(info, 'worked', 0.8) }]); },
});

// ---------------------------------------------------------------- GLOBE
function globeScene(T, o = {}) { const st = spaceStage(T, { fov: 34 }); const gl = globe({ r: 3 }); st.add(gl); return { stage: st, gl }; }
const GCAM = { pos: [0, 0.8, 19], look: [0, 0, 0], fov: 34 };

// s04 — "At the equator, the ground spins east..." The toon globe spinning; the equator glows; arrow EAST.
registerShot('s04', { kind: '3d',
  init(T) { return globeScene(T); },
  draw(s, t, info) { s.gl.spin.rotation.y = 0.6 + t * 1.1; camMove(s.stage, t, [[0, { pos: [0, 1.6, 21], look: [0, 0, 0], fov: 34 }], [info.dur, GCAM]]); },
  overlay(g, t, info, s) {
    starfield(g, t, { seed: 4 }); const ke = ease.out(prog(t, at(info, 'east', 1.0) - 0.1, at(info, 'east', 1.0) + 0.3));
    arrow(g, 250, 1290, 580, ke, { color: '#ffd23a' }); chip(g, t, 'EAST', 540, 1420, { at: at(info, 'east', 1.0), fill: '#ffd23a' });
    chip(g, t, 'EQUATOR', 540, 690, { at: at(info, 'equator', 0.3), fill: '#ff5a4a', color: '#ffffff' });
  },
});
// s05 — INSERT: "over 1,600 kilometers an hour" (counter over the spinning globe)
insertShot('s05', { scene: { init: (T) => globeScene(T), draw(s, t) { s.gl.spin.rotation.y = 2.4 + t * 1.1; s.stage.cam(GCAM.pos, GCAM.look, GCAM.fov); } },
  insert: { type: 'counter', title: 'GROUND SPEED AT THE EQUATOR', value: 1600, from: 0, suffix: '+', lines: ['KM/H'], color: '#ffd23a' }, dim: 0.5 });

// s06 — "You, the air, the oceans, and that cow are all moving with it." The calm farm; chips pop per word, all with arrows east.
registerShot('s06', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { farmPlay(s, t, -1); s.f.pose(addPose(POSE.relaxed, { ...idle(t, 3, 0.7), armR: [0.4, 2.4, 0], elbowR: 0.4 + Math.sin(t * 9) * 0.3 })); camMove(s.stage, t, [[0, { pos: [0.2, 2.5, 8.8], look: [-0.2, 1.4, -0.4], fov: 40 }], [info.dur, { pos: [0.2, 2.45, 8.2], look: [-0.2, 1.4, -0.4], fov: 39 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    [['YOU', 'you', 820, '#ffffff'], ['AIR', 'air', 360, '#bfe6ff'], ['OCEANS', 'oceans', 470, '#4f9fe0']].forEach(([txt, w, y, c], i) => {
      const a0 = at(info, w, 0.3 + i * 0.4); chip(g, t, txt, 330, y, { at: a0, fill: c }); arrow(g, 480, y, 260, ease.out(prog(t, a0, a0 + 0.3)), { w: 30 }); });
  },
});
// s07 — "...and that cow" Close-up: the cow chewing, turns to camera, chip "1,600 km/h too".
registerShot('s07', { kind: '3d',
  init(T) { const s = farmScene(T, { stuff: [['cow', 0, 0, 0.6]] }); s.f.visible = false; return s; },
  draw(s, t, info) {
    farmPlay(s, t, -1); const c = s.stuff[0]; c.rotation.y = lerp(0.6, 0.05, ease.inOut(prog(t, 0.1, 0.5))); c.head.position.y = 1.3 + Math.sin(t * 8) * 0.02;
    camMove(s.stage, t, [[0, { pos: [0.4, 1.6, 4.2], look: [0, 1.2, 0.5], fov: 36 }], [info.dur, { pos: [0.35, 1.55, 3.6], look: [0, 1.25, 0.5], fov: 35 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); chip(g, t, '1,600 km/h too', 540, 330, { at: 0.35, fill: '#ffd23a', size: 58 }); arrow(g, 360, 450, 360, ease.out(prog(t, 0.5, 0.8)), { w: 32 });
    reactions(g, t, s, [{ fx: 'question', on: s.stuff[0], at: 0.55, height: 1.9, scale: 0.6, dx: 220, dy: 120 }]); },
});

// s08 — "But hit the brakes for one second..." The globe spinning fast; a STOP sign slams in; the globe halts. Flash + shake.
registerShot('s08', { kind: '3d',
  init(T) { return globeScene(T); },
  draw(s, t, info) {
    const tb = at(info, 'brakes', 0.6), k = ease.out(prog(t, tb, tb + 0.35));
    s.gl.spin.rotation.y = 1.0 + (t < tb ? t * 2.2 : tb * 2.2 + 0.35 * 2.2 * k * 0.5);
    camMove(s.stage, t, [[0, GCAM], [info.dur, { pos: [0, 0.6, 16.5], look: [0, 0, 0], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tb + 0.3, amp: 0.25, dur: 0.6 }]);
  },
  overlay(g, t, info, s) {
    starfield(g, t, { seed: 5 }); const tb = at(info, 'brakes', 0.6);
    if (t < tb + 0.2) { g.save(); g.globalAlpha = 0.7; g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a0 = t * 6 + i * 2.1; g.beginPath(); g.arc(540, 960, 600, a0, a0 + 0.5); g.stroke(); } g.restore(); }
    stopSign(g, 540, 520, 170, ease.outBack(clamp((t - tb) / 0.25)));
    reactions(g, t, s, [{ fx: 'flash', at: tb + 0.3, dur: 0.25 }]);
  },
});
// s09 — "...and only the ground stops." Farm, a frozen beat: the ground has stopped. The farmer: "?" Then everything leans east.
registerShot('s09', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { const t0 = info.dur - 0.35; farmPlay(s, t, t - t0, { v: 2.4 }); if (t < t0) s.f.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 1.1, 7.6], look: [-0.3, 1.2, -0.6], fov: 44 }], [info.dur, { pos: [-0.5, 1.05, 7.0], look: [-0.3, 1.2, -0.6], fov: 43 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); chip(g, t, 'GROUND: 0 km/h', 540, 1180, { at: at(info, 'ground', 0.5), fill: '#ffffff', size: 56 }); reactions(g, t, s, [{ fx: 'question', on: 'f', at: 0.2 }]); },
});

// s10 — "Everything not bolted down keeps going..." Wide farm: everything slides east. The BOLTED sign stays put.
registerShot('s10', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { farmPlay(s, t, t + 0.05, { v: 3.2, hop: 0.7 }); camMove(s.stage, t, [[0, { pos: [1.6, 4.2, 12.5], look: [1.4, 1.2, -1.5], fov: 44 }], [info.dur, { pos: [2.4, 4.0, 11.8], look: [2.2, 1.2, -1.5], fov: 43 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); farmStreaks(g, s, t + 0.05);
    const [x, y] = proj(s.stage, s.env.sign, 3.1); chip(g, t, 'BOLTED: stays', clamp(x, 300, 780), Math.max(300, y - 40), { at: at(info, 'bolted', 0.4), fill: '#ffd23a', size: 46 });
    reactions(g, t, s, [{ fx: 'shake', at: 0 }, { fx: 'exclaim', on: 'f', at: 0.2, color: '#ff3b30' }]); },
});
// s11 — "...sliding east at full speed." Low tracking shot: the farmer and the cow sail past, speedlines.
registerShot('s11', { kind: '3d',
  init(T) { const s = farmScene(T, { stuff: [['cow', -3.5, -0.6, -1.2], ['chicken', -1.8, 1.0, -1.4], ['hay', -6.5, -1.8]] }); s.f.home = [-2.4, 0, 1.2]; return s; },
  draw(s, t, info) {
    farmPlay(s, t, t + 0.25, { v: 3.4, fv: 3.0 }); 
    const x = lerp(-0.6, 3.2, t / info.dur); camMove(s.stage, t, [[0, { pos: [x - 1.5, 1.3, 6.2], look: [x, 1.3, 0], fov: 40 }], [info.dur, { pos: [x - 1.5, 1.3, 6.2], look: [x, 1.3, 0], fov: 40 }]], (k) => k);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); farmStreaks(g, s, t + 0.25); reactions(g, t, s, [{ fx: 'speedlines', at: 0 }, { fx: 'sweat', on: 'f', at: 0.3 }]); stamp(g, t, 'FULL SPEED', { at: at(info, 'full', 0.8) - 0.05, x: 540, y: 380, size: 80, color: '#ffffff', fill: '#d8342c', rot: -0.06 }); },
});

// ---------------------------------------------------------------- OCEANS
function coastScene(T) { const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 18, target: [0, 1, -8] }); const env = coastSet(st); const w = bigWave({ len: 34, h: 4.5 }); w.position.set(-26, 0, -13); st.add(w); return { stage: st, env, w }; }
// s12 — "But it gets worse." The coast town: out at sea, a giant cartoon wave rises.
registerShot('s12', { kind: '3d',
  init(T) { return coastScene(T); },
  draw(s, t, info) { s.env.update(t); s.w.position.x = -26 + t * 2.4; s.w.scale.y = 0.5 + 0.5 * ease.out(prog(t, 0, 1)); camMove(s.stage, t, [[0, { pos: [6, 5, 14], look: [-6, 2, -8], fov: 44 }], [info.dur, { pos: [5, 4.6, 12.5], look: [-8, 2.4, -8], fov: 43 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t, "IT GETS WORSE", { at: 0.15, x: 540, y: 380, size: 76, color: '#ffffff', fill: '#2a1c15', rot: 0.05 }); reactions(g, t, s, [{ fx: 'exclaim', on: [-12, 6, -8], at: 0.5, color: '#ff3b30', scale: 1.4 }]); },
});
// s13 — "The oceans would slosh right over the land." The wave rolls east over the empty town; then the cow bobs by on a rubber ring.
registerShot('s13', { kind: '3d',
  init(T) { const s = coastScene(T); s.w.position.x = -14; const c = cow(); const ring = rubberRing(); ring.position.y = 0.6; c.add(ring); c.position.set(2, 0, -2); s.stage.add(c); s.cow = c;
    const water = box(1, 1.2, 70, '#4f9fe0', 0, 0, -12); water.userData.noOutline = true; s.stage.add(water); s.water = water; return s; },
  draw(s, t, info) {
    s.env.update(t); const k = t / info.dur; s.w.position.x = lerp(-18, 6, k); s.water.scale.x = s.w.position.x + 200; s.water.position.x = (s.w.position.x - 200) / 2; s.water.position.y = 0.1;
    const ck = prog(t, info.dur * 0.45, info.dur); s.cow.visible = ck > 0; s.cow.position.set(lerp(-6, 2, ck), 0.6 + Math.sin(t * 4) * 0.12, 1); s.cow.rotation.set(Math.sin(t * 3) * 0.1, 0.4, Math.sin(t * 2.5) * 0.08);
    camMove(s.stage, t, [[0, { pos: [16, 6.5, 10], look: [-4, 2.2, -10], fov: 46 }], [info.dur, { pos: [15, 6, 9], look: [-3, 2, -10], fov: 45 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); chip(g, t, 'SLOSH!', 540, 420, { at: at(info, 'slosh', 0.6), fill: '#4f9fe0', color: '#ffffff', size: 72 }); reactions(g, t, s, [{ fx: 'hearts', on: 'cow', at: info.dur * 0.6, height: 2 }, { fx: 'ripples', on: 'cow', at: info.dur * 0.55, atFeet: true }]); },
});

// ---------------------------------------------------------------- NORTH POLE
function poleScene(T) { const st = toonStage(T, { light: 'day', fov: 38, shadowSize: 8, target: [0, 1, 0] }); const env = poleSet(st); const p = polar(); p.position.set(-0.4, 0, 0.4); p.rotation.y = 0.2; st.add(p); const m = mug(); st.add(m); return { stage: st, env, p, m }; }
// s14 — "But stand on the North Pole, and you'd barely move..." Calm ice, a striped N pole, a bean with cocoa. Far off, stuff zips past.
registerShot('s14', { kind: '3d',
  init(T) { const s = poleScene(T); s.far = looseStuff(s.stage, [['barrel', -30, -22], ['hay', -40, -26], ['crate', -50, -20]]); return s; },
  draw(s, t, info) { s.env.update(t); s.p.pose(addPose(POSE.holdFront, { ...idle(t, 5, 0.6), armL: [0.05, 0.16, 0], elbowL: 0.2 })); s.p.face(EXPR.happy, t); s.p.hand.R.getWorldPosition(s.m.position); s.m.position.y += 0.05;
    s.far.forEach((m, i) => slideEast(m, t + 2 + i, i, { v: 16, hop: 1 }));
    camMove(s.stage, t, [[0, { pos: [0.4, 2.2, 7.5], look: [0.2, 1.5, -0.5], fov: 40 }], [info.dur, { pos: [0.4, 2.1, 6.6], look: [0.2, 1.5, -0.5], fov: 39 }]]); },
  overlay(g, t, info, s) { chip(g, t, 'NORTH POLE', 540, 360, { at: 0.1, fill: '#2f6fb0', color: '#ffffff', size: 60 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: 0.4 }]); },
});
// s15 — "...barely move at all." Close-up: smug sip; speed chip "≈ 0 km/h".
registerShot('s15', { kind: '3d',
  init(T) { return poleScene(T); },
  draw(s, t, info) { s.env.update(t); const sip = ease.inOut(prog(t, 0.2, 0.6)) * (1 - ease.inOut(prog(t, 1.2, 1.6)));
    s.p.pose(addPose(POSE.stand, { ...idle(t, 5, 0.5), armR: [1.1 + sip * 0.6, 0.25, 0.6], elbowR: 1.6 + sip * 0.6, headNod: -sip * 0.15 })); s.p.face(mixExpr(EXPR.smug, EXPR.happy, sip), t);
    s.p.hand.R.getWorldPosition(s.m.position); s.m.position.y += 0.05;
    camMove(s.stage, t, [[0, { pos: [-0.1, 2.25, 3.6], look: [-0.3, 2.0, 0.4], fov: 34 }], [info.dur, { pos: [-0.1, 2.2, 3.2], look: [-0.3, 2.0, 0.4], fov: 33 }]]); },
  overlay(g, t, info, s) { chip(g, t, 'about 0 km/h', 540, 1180, { at: at(info, 'barely', 0.3), fill: '#ffffff', size: 60 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: 0.6 }, { fx: 'hearts', on: 'p', at: 1.0, scale: 0.7 }]); },
});

// ---------------------------------------------------------------- GOOD NEWS
// s16 — "The good news?" The globe spinning happily again, a sparkle, a spotlight.
registerShot('s16', { kind: '3d',
  init(T) { return globeScene(T); },
  draw(s, t, info) { s.gl.spin.rotation.y = 3.0 + t * 1.1; camMove(s.stage, t, [[0, { pos: [0, 0.6, 17], look: [0, 0, 0], fov: 34 }], [info.dur, { pos: [0, 0.8, 19], look: [0, 0, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 6 }); stamp(g, t, 'GOOD NEWS', { at: 0.1, x: 540, y: 400, size: 86, color: '#2fa84f', fill: 'rgba(250,250,240,0.94)', rot: -0.06 }); reactions(g, t, s, [{ fx: 'sparkle', on: [0, 2.6, 0], at: 0.2, scale: 1.5 }]); },
});
// s17 — INSERT: "NASA says stopping Earth would take a miracle."
insertShot('s17', { scene: { init: (T) => globeScene(T), draw(s, t) { s.gl.spin.rotation.y = 4 + t * 1.1; s.stage.cam(GCAM.pos, GCAM.look, GCAM.fov); } },
  insert: { type: 'bigtext', kicker: 'NASA: STOPPING EARTH', title: 'MIRACLE', lines: ['would take a'], color: '#ffd23a', size: 190 } });
// s18 — "It is slowing down..." The globe, slower, a tiny clock ticking; held beat.
registerShot('s18', { kind: '3d',
  init(T) { return globeScene(T); },
  draw(s, t, info) { s.gl.spin.rotation.y = 5 + t * 0.5; camMove(s.stage, t, [[0, GCAM], [info.dur, { pos: [0, 0.5, 15], look: [0, 0, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 7 }); const k = ease.outBack(clamp((t - 0.15) / 0.3)); g.save(); g.translate(540, 470); g.scale(k, k);
    g.fillStyle = '#fffaf0'; g.strokeStyle = '#2a1c15'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.fill(); g.stroke(); g.lineCap = 'round';
    g.lineWidth = 12; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -70); g.stroke(); g.lineWidth = 8; const a = t * 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * 90, -Math.cos(a) * 90); g.stroke(); g.restore();
    chip(g, t, 'slowing down...', 540, 650, { at: 0.35, fill: '#ffffff', size: 56 }); },
});
// s19 — INSERT (payoff): "...by about 2 milliseconds per century."
insertShot('s19', { scene: { init: (T) => globeScene(T), draw(s, t) { s.gl.spin.rotation.y = 6 + t * 0.5; s.stage.cam(GCAM.pos, GCAM.look, GCAM.fov); } },
  insert: { type: 'counter', title: 'A DAY GETS LONGER BY', value: 2, from: 0, prefix: '~', suffix: ' ms', lines: ['per century'], color: '#ffd23a' }, dim: 0.55,
  after(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', at: 1.2 }]); } });

// s19b — "...per century." Reaction: the farmer, back on the calm farm, wipes his brow and grins; the number stays on a chip.
registerShot('s19b', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { farmPlay(s, t, -1); const w = ease.inOut(prog(t, 0.1, 0.4)) * (1 - ease.inOut(prog(t, 0.8, 1.1)));
    s.f.pose(addPose(POSE.relaxed, { ...idle(t, 3, 0.6), armR: [1.3 + w * 0.6, 0.3, 0.9], elbowR: 1.6 + w * 0.8, headTilt: -0.1 * w })); s.f.face(mixExpr(EXPR.worried, EXPR.grin, prog(t, 0.6, 1.0)), t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 6.2], look: [0.35, 1.8, 1.2], fov: 36 }], [info.dur, { pos: [0.6, 2.35, 5.7], look: [0.35, 1.8, 1.2], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); chip(g, t, '~2 ms per century', 540, 420, { at: 0, fill: '#ffd23a', size: 60 });
    reactions(g, t, s, [{ fx: 'sweat', on: 'f', at: 0.1, until: 0.8 }, { fx: 'sparkle', on: 'f', at: 0.7 }]); },
});

// s20 — "Subscribe for more." Back on the farm, frame 1's camera. Calm... then in the last 0.3 s it starts sliding again -> loops into s01.
registerShot('s20', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) { const u = t - (info.dur - 0.3); farmPlay(s, t, u, { v: 2.0, fv: 1.0 }); if (u <= 0) s.f.face(mixExpr(EXPR.happy, EXPR.smug, prog(t, 0.2, 0.6)), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.8, 11], look: [0.2, 1.3, -0.6], fov: 42 }], [info.dur - 0.3, CAM0], [info.dur, CAM0]], ease.out); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const u = t - (info.dur - 0.3); farmStreaks(g, s, u);
    reactions(g, t, s, [{ fx: 'hearts', on: 'f', at: 0.25, until: info.dur - 0.5, scale: 0.8 }, { fx: 'exclaim', on: 'f', at: info.dur - 0.2, color: '#ff3b30' }]); },
});
