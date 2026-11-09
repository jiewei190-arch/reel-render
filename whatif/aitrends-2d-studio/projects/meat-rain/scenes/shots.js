// meat-rain: "The Day It Rained Meat" (Justin clips Short #12). 16 shots, Toon 3D + BEANMEN FX.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { THREE, camMove, toonStage, rbox, box, plane, floor, cyl, ball } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, point, shrug } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, kyFarm, woman, farmer, scientist, meatRain, chunk, vulture, flock } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffcf8a' };
const SOFT = { rays: false, tint: '#ffcf8a' };
const EAT = { ...POSE.facepalm, headNod: -0.04, headTilt: 0.05 };
const LOOKUP = { headNod: -0.45 };

// ---------- s01 / s16: the yard, meat already falling (frame 1 and the loop end) ----------
const yard = {
  init(T) { const s = kyFarm(T, { target: [0, 0, 0.5], shadowSize: 9 });
    s.w = woman(); s.w.position.set(-0.1, 0, 1.2); s.w.rotation.y = 0.15; s.stage.add(s.w);
    s.rain = meatRain(s.stage, { n: 120, area: [-4.2, 4.2, -2.5, 4.2], t0: -1.4, t1: 4.4, seed: 5, y0: 8.5, skip: [[-0.1, 1.2, 0.6], [1.0, 0.6, 0.55]] }); return s; },
  draw(s, t, info) { s.update(t); s.rain.update(t);
    s.w.pose(addPose(POSE.panic, { ...tremble(t, 1.5), ...LOOKUP })); s.w.face({ ...EXPR.shocked, pupil: [0, 0.8] }, t);
    s.hens.forEach((h, i) => { h.update(t, { panic: 1, flap: 1, look: Math.sin(t * 5 + i) * 0.6 }); h.position.x = (i ? -2.8 : 2.6) + Math.sin(t * 4 + i) * 0.4; });
    camMove(s.stage, t, [[-1.5, { pos: [0.3, 1.7, 8.2], look: [0.2, 3.1, 0], fov: 52 }], [3.85, { pos: [0.3, 1.8, 6.9], look: [0.2, 3.0, 0.3], fov: 52 }]], ease.inOut); },
};
const S1FX = (info) => [{ fx: 'exclaim', on: 'w', at: at(info, 'meat', 1.9) }, { fx: 'shake', at: at(info, 'meat', 1.9), amp: 0.06, dur: 0.4 }, { fx: 'sweat', on: 'w', at: at(info, 'kentucky', 2.5) }];
registerShot('s01', { kind: '3d', init: yard.init,
  draw(s, t, info) { yard.draw(s, t, info); shakeCam(s.stage, t, S1FX(info)); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, S1FX(info)); } });
// s16 "Subscribe for more." plays the yard right up to frame 1's moment (t runs -dur..0) so the loop is seamless
registerShot('s16', { kind: '3d', init: yard.init,
  draw(s, t, info) { yard.draw(s, t - info.dur, info); },
  overlay(g, t, info, s) { sunnyLook(g, t - info.dur, RAYS); } });

// ---------- s02 "Out of a clear blue sky." low angle up past her bonnet: an empty sky, one chunk tumbling down ----------
registerShot('s02', { kind: '3d',
  init(T) { const s = kyFarm(T, { target: [0, 0, 0], clouds: 6, seed: 7 }); s.w = woman(); s.w.position.set(0.5, 0, 1.6); s.w.rotation.y = 2.6; s.stage.add(s.w);
    s.c = chunk(3, 1.6); s.stage.add(s.c); return s; },
  draw(s, t) { s.update(t); s.w.pose(addPose(POSE.stand, { headNod: -0.6 })); s.w.face({ ...EXPR.suspicious, pupil: [0, 1] }, t);
    const y = 13 - 4.5 * t * t; s.c.position.set(-0.6 + t * 0.2, Math.max(y, 3.2), -1.5); s.c.rotation.set(t * 4, t * 2, t * 3); s.c.visible = y > 3.2;
    camMove(s.stage, t, [[0, { pos: [1.1, 1.3, 4.0], look: [-0.3, 8.5, -2.5], fov: 50 }], [1.6, { pos: [1.1, 1.35, 3.8], look: [-0.3, 8.3, -2.5], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 1.1 }, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'question', on: 'w', at: 0.35 }]); },
});

// ---------- s03 "A woman was outside, making soap," (iris open: rewind to a calm morning) ----------
registerShot('s03', { kind: '3d',
  init(T) { const s = kyFarm(T, { target: [0.5, 0, 0.8], shadowSize: 6 }); s.w = woman(); s.w.position.set(0.1, 0, 1.15); s.w.rotation.y = 0.55; s.stage.add(s.w); return s; },
  draw(s, t) { s.update(t); s.w.pose(addPose(POSE.holdFront, { ...idle(t), twist: Math.sin(t * 1.6) * 0.15 })); s.w.face({ ...EXPR.happy, pupil: [0.4, -0.3] }, t);
    s.hens.forEach((h, i) => h.update(t, { peck: 1 }));
    camMove(s.stage, t, [[0, { pos: [0.9, 2.1, 6.4], look: [0.6, 1.6, 0.8], fov: 40 }], [2.4, { pos: [0.8, 2.05, 5.6], look: [0.6, 1.6, 0.8], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'w', at: 0.6, scale: 0.7 }]); },
});

// ---------- s04 "when chunks of meat started falling all around her." ----------
const s04 = {
  init(T) { const s = kyFarm(T, { target: [0.5, 0, 0.8], shadowSize: 7 }); s.w = woman(); s.w.position.set(0.1, 0, 1.15); s.w.rotation.y = 0.35; s.stage.add(s.w);
    s.rain = meatRain(s.stage, { n: 34, area: [-3.2, 3.8, -1.5, 3.5], t0: 0.3, t1: 3.2, seed: 9, skip: [[0.1, 1.15, 0.55], [1.0, 0.6, 0.55]] }); return s; },
  draw(s, t, info) { s.update(t); s.rain.update(t); const k = at(info, 'chunks', 0.1);
    const fr = ease.inOut(prog(t, k, k + 0.25));
    s.w.pose(addPose(mixPose(POSE.holdFront, POSE.panic, fr), { ...tremble(t, fr * 1.5), headNod: -0.3 * fr })); s.w.face(mixExpr(EXPR.happy, { ...EXPR.shocked, pupil: [0, 0.6] }, fr), t);
    s.hens.forEach((h, i) => { h.update(t, { panic: fr, flap: fr, look: Math.sin(t * 5 + i) * 0.6 * fr }); });
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 8.4], look: [0.5, 2.0, 0.8], fov: 44 }], [3.0, { pos: [0.6, 2.6, 9.4], look: [0.5, 2.2, 0.8], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: k, amp: 0.07, dur: 0.45 }]); },
};
registerShot('s04', { kind: '3d', init: s04.init, draw: s04.draw,
  overlay(g, t, info, s) { const k = at(info, 'chunks', 0.1); sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'w', at: k, until: k + 1.2 }, { fx: 'sweat', on: 'w', at: k + 0.3 }, { fx: 'flash', at: k, dur: 0.2 }]); } });

// ---------- s05 INSERT: 4 INCHES (over the falling meat) ----------
insertShot('s05', { scene: { init: s04.init, draw: (s, t, info) => s04.draw(s, t + 2.9, { ...info, shot: { start: 7.85 } }) },
  insert: { type: 'bigtext', kicker: 'SOME PIECES WERE', title: '4 INCHES', lines: ['(10 cm) wide'] } });

// ---------- s06 "So two men did the obvious thing." two farmers lean over a chunk on the ground ----------
const pair = {
  init(T) { const s = kyFarm(T, { target: [0, 0, 1], shadowSize: 6, seed: 4 });
    s.a = farmer(0); s.a.position.set(-0.75, 0, 1.4); s.a.rotation.y = 0.6; s.stage.add(s.a);
    s.b = farmer(1); s.b.position.set(0.85, 0, 1.3); s.b.rotation.y = -0.6; s.stage.add(s.b);
    s.c = chunk(2, 1.3); s.c.position.set(0.05, 0.08, 1.9); s.stage.add(s.c);
    s.rest = meatRain(s.stage, { n: 14, area: [-4, 4, -2, 4], t0: -9, t1: -8, seed: 12, skip: [[-0.75, 1.4, 0.6], [0.85, 1.3, 0.6], [0, 1.9, 0.5]] }); return s; },
};
registerShot('s06', { kind: '3d', init: pair.init,
  draw(s, t) { s.update(t); s.rest.update(t);
    const look = ease.inOut(prog(t, 1.2, 1.6));
    s.a.pose(addPose(POSE.lean, { lean: 0.35, headNod: lerp(0.2, -0.05, look), headTurn: lerp(0, -0.5, look) })); s.a.face({ ...EXPR.deadpan, pupil: [lerp(0, -0.6, look), lerp(-0.7, 0, look)] }, t);
    s.b.pose(addPose(POSE.thinking, { lean: 0.25, headNod: lerp(0.2, -0.05, look), headTurn: lerp(0, 0.5, look) })); s.b.face({ ...EXPR.suspicious, pupil: [lerp(0, 0.6, look), lerp(-0.7, 0, look)] }, t);
    camMove(s.stage, t, [[0, { pos: [0.1, 1.7, 7.6], look: [0.05, 1.45, 1.4], fov: 42 }], [2.45, { pos: [0.1, 1.7, 6.9], look: [0.05, 1.5, 1.4], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'a', at: 0.3, until: 1.4, scale: 0.8 }]); } });

// ---------- s07 "They tasted it." close: the bearded farmer takes a bite, his friend recoils ----------
const taste = {
  init(T) { const s = pair.init(T); s.b.position.set(0.55, 0, 1.6); s.b.rotation.y = -0.2; s.a.position.set(-0.9, 0, 1.4); s.a.rotation.y = 0.5;
    s.c.visible = false; s.held = chunk(2, 1.2); s.b.hold('R', s.held); s.held.position.set(0, 0.05, 0.12); return s; },
  draw(s, t, info, chew = 1) { s.update(t); s.rest.update(t);
    s.b.pose(addPose(EAT, { bob: Math.abs(Math.sin(t * 9)) * 0.02 * chew })); s.b.face({ ...EXPR.happy, lid: 0.55, talk: chew * (0.5 + 0.5 * Math.sin(t * 14)) }, t);
    s.a.pose(addPose(mixPose(POSE.stand, POSE.panic, ease.out(prog(t, 0.3, 0.55))), { lean: -0.15 })); s.a.face(mixExpr(EXPR.deadpan, EXPR.shocked, prog(t, 0.3, 0.45)), t); },
};
registerShot('s07', { kind: '3d', init: taste.init,
  draw(s, t, info) { taste.draw(s, t, info); camMove(s.stage, t, [[0, { pos: [-0.1, 2.15, 5.6], look: [-0.15, 1.9, 1.5], fov: 40 }], [1.2, { pos: [-0.1, 2.15, 5.2], look: [-0.15, 1.9, 1.5], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.32, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'exclaim', on: 'a', at: 0.32 }, { fx: 'sweat', on: 'a', at: 0.5 }, { fx: 'hearts', on: 'b', at: 0.55, scale: 0.7 }]); } });

// ---------- s08 INSERT: THE VERDICT  MUTTON vs VENISON (over the chewing farmer) ----------
insertShot('s08', { scene: { init: taste.init, draw: (s, t, info) => { taste.draw(s, t + 1.2, info); s.stage.cam([-0.1, 2.15, 5.2], [-0.15, 1.9, 1.5], 40); } },
  insert: { type: 'versus', title: 'THE VERDICT', lines: ['MUTTON', 'VENISON'], colorL: '#c8524a', color: '#6a8a3a' } });

// ---------- s09 INSERT: the newspaper (document card over the yard) ----------
insertShot('s09', { scene: { init: yard.init, draw: (s, t, info) => yard.draw(s, t + 4, info) },
  insert: { type: 'document', title: 'NEWSPAPER, MARCH 1876', lines: ['FLESH DESCENDING', 'IN A SHOWER', 'Bath County, Ky.', '"The sky was perfectly clear"'], highlight: 0 } });

// ---------- s10 "Scientists found lung, muscle and cartilage." a lab, a chunk on a plate, a magnifier ----------
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, target: [0, 0, 0.5], shadowSize: 5 }); const s = { stage: st };
    const wall = plane(14, 7, '#d8c9a8', 0, 3.5, -2.2); st.add(wall); const fl = floor(14, 10, '#8a6a4a', 0, 2); st.add(fl);
    st.add(PR.shelf({ w: 2.2, h: 2.6, color: '#6a4228', seed: 4 }).at(-2.2, 0, -1.7), PR.shelf({ w: 1.6, h: 2.2, color: '#6a4228', seed: 7 }).at(2.4, 0, -1.7));
    const tb = PR.table({ w: 2.2, d: 1.0, h: 1.0, color: '#7a5032' }).at(0.2, 0, 0.6); st.add(tb);
    const plate = cyl(0.36, 0.3, 0.04, '#f6f2ea', 0.35, 1.08, 0.7, 24); st.add(plate); s.c = chunk(4, 1.3); s.c.position.set(0.35, 1.15, 0.7); st.add(s.c);
    st.add(PR.vase({ color: '#4a7a9a' }).at(-0.6, 1.06, 0.4).s(0.6), PR.lamp().at(1.0, 1.06, 0.4));
    s.sc = scientist(); s.sc.position.set(-0.4, 0, 1.25); s.sc.rotation.y = 0.35; st.add(s.sc);
    const mg = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 24), new THREE.MeshToonMaterial({ color: '#c9a14a' })); mg.add(ring);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.35 })); mg.add(lens);
    const hd = cyl(0.025, 0.03, 0.3, '#5a3a22', 0, -0.3, 0, 8); mg.add(hd); s.mag = mg; s.sc.hold('R', mg); mg.position.set(0, 0.25, 0.1); return s; },
  draw(s, t, info) { const L = at(info, 'lung', 0.4), M = at(info, 'muscle', 0.85), C = at(info, 'cartilage', 1.4);
    const k = t < M ? 0 : t < C ? 1 : 2;
    s.sc.pose(addPose(POSE.holdFront, { lean: 0.3, armL: [-0.5, 0, -1], headNod: 0.35, headTurn: [0.15, -0.05, 0.25][k] })); s.sc.face({ ...EXPR.suspicious, pupil: [0.2, -0.6], browL: t > C ? 0.6 : 0 }, t);
    camMove(s.stage, t, [[0, { pos: [0.9, 2.5, 7.2], look: [0.2, 1.6, 0.8], fov: 38 }], [2.75, { pos: [0.8, 2.4, 6.3], look: [0.2, 1.6, 0.8], fov: 38 }]]); },
  overlay(g, t, info, s) { const L = at(info, 'lung', 0.4), C = at(info, 'cartilage', 1.4);
    reactions(g, t, s, [{ fx: 'question', on: 'sc', at: 0.05, until: L }, { fx: 'sparkle', on: [0.35, 1.25, 0.7], at: L, scale: 0.6 }, { fx: 'exclaim', on: 'sc', at: C }, { fx: 'stars', on: 'sc', at: C + 0.15, scale: 0.8 }]); },
});

// ---------- s11 "Wait, how does meat fall out of a clear sky?" everyone stares up: ??? x3 ----------
registerShot('s11', { kind: '3d',
  init(T) { const s = kyFarm(T, { target: [0, 0, 1], shadowSize: 7, seed: 5 });
    s.w = woman(); s.w.position.set(0, 0, 1.5); s.stage.add(s.w); s.a = farmer(0); s.a.position.set(-1.4, 0, 1.0); s.a.rotation.y = 0.3; s.stage.add(s.a); s.b = farmer(1); s.b.position.set(1.45, 0, 1.0); s.b.rotation.y = -0.3; s.stage.add(s.b);
    s.rest = meatRain(s.stage, { n: 20, area: [-4, 4, -2, 4], t0: -9, t1: -8, seed: 12, skip: [[0, 1.5, 0.55], [-1.4, 1, 0.55], [1.45, 1, 0.55], [1.0, 0.6, 0.55]] }); return s; },
  draw(s, t) { s.update(t); s.rest.update(t); [s.w, s.a, s.b].forEach((c, i) => { c.pose(addPose(i === 1 ? POSE.handsHips : i === 2 ? POSE.thinking : POSE.stand, { ...idle(t, i), headNod: -0.5, headTurn: Math.sin(t * 1.5 + i * 2) * 0.25 })); c.face({ ...EXPR.suspicious, pupil: [0, 1] }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 1.1, 8.4], look: [0, 2.7, 1], fov: 48 }], [2.4, { pos: [0, 1.15, 7.4], look: [0, 2.7, 1], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'a', at: 0.15 }, { fx: 'question', on: 'w', at: 0.45 }, { fx: 'question', on: 'b', at: 0.75 }]); },
});

// ---------- s12 "You see, the best guess is vultures." iris open on the sky: a circling flock ----------
const sky = {
  init(T) { const s = kyFarm(T, { target: [0, 0, 0], clouds: 10, seed: 9, fov: 44 }); s.fl = flock(s.stage, { n: 7, c: [0, 10, -4], R: 4.2, seed: 3, speed: 0.4 }); return s; },
};
registerShot('s12', { kind: '3d', init: sky.init,
  draw(s, t) { s.update(t); s.fl.update(t, { all: { lid: 0.5 } }); camMove(s.stage, t, [[0, { pos: [0, 3.0, 9], look: [0, 9.5, -4], fov: 52 }], [2.1, { pos: [0, 4.0, 7.5], look: [0, 9.8, -4], fov: 50 }]]); },
  overlay(g, t, info, s) { const v = at(info, 'vultures', 1.0); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: s.fl.birds[1], at: v, scale: 0.8 }, { fx: 'glow', on: s.fl.birds[1], at: v, until: v + 0.8 }]); },
});

// ---------- s13 "Scared vultures throw up, to fly away lighter." close on one bird: startle, green, a chunk drops ----------
registerShot('s13', { kind: '3d',
  init(T) { const s = kyFarm(T, { target: [0, 0, 0], clouds: 8, seed: 11 }); s.v = vulture({ seed: 4 }); s.v.position.set(0, 8, 0); s.v.rotation.y = 0.7; s.stage.add(s.v);
    s.c = chunk(1, 1.1); s.stage.add(s.c); s.hp = new THREE.Vector3(); return s; },
  draw(s, t, info) { s.update(t); const sc = at(info, 'scared', 0.1), th = at(info, 'throw', 0.6), li = at(info, 'lighter', 2.0);
    const sick = ease.inOut(prog(t, th - 0.3, th + 0.1)), open = t > th && t < th + 0.5 ? 1 : 0;
    s.v.update(t, { flap: 1, glide: t < sc + 0.1 ? 0.6 : 0, scared: t > sc && t < th ? 1 : 0, sick: t < li + 0.3 ? sick : lerp(sick, 0, prog(t, li + 0.3, li + 0.8)), open, lid: t > li ? 0.55 : 0.2, look: [0, 0] });
    const climb = ease.inOut(prog(t, li - 0.2, info.dur)); s.v.position.set(0, 8 + climb * 1.2 + Math.sin(t * 2) * 0.05, 0);
    s.v.head.getWorldPosition(s.hp); const d = t - (th + 0.15);
    if (d < 0) { s.c.visible = false; s.c.userData.p0 = null; } else { if (!s.c.userData.p0) s.c.userData.p0 = [0, 8.3, 0.5]; s.c.visible = true; s.c.position.set(0.25 + d * 0.3, 8.25 - 4.9 * d * d, 0.65); s.c.rotation.set(d * 5, d * 2, d * 3); }
    camMove(s.stage, t, [[0, { pos: [0.5, 7.2, 6.0], look: [0, 8.5, 0], fov: 44 }], [info.dur, { pos: [0.4, 7.4, 6.4], look: [0, 8.9, 0], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: sc, amp: 0.05, dur: 0.35 }]); },
  overlay(g, t, info, s) { const sc = at(info, 'scared', 0.1), th = at(info, 'throw', 0.6), li = at(info, 'lighter', 2.0); sunnyLook(g, t, SOFT);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'v', at: sc, until: th }, { fx: 'sweat', on: 'v', at: sc + 0.15, until: th + 0.4 }, { fx: 'sparkle', on: 'v', at: li, scale: 0.7 }]); },
});

// ---------- s14 "And when one does it... the whole flock joins in." chain reaction across the flock ----------
registerShot('s14', { kind: '3d',
  init(T) { const s = sky.init(T); s.drops = s.fl.birds.map((b, i) => { const c = chunk(i + 3, 1.2); s.stage.add(c); return c; }); s.v = new THREE.Vector3(); return s; },
  draw(s, t, info) { s.update(t); const one = at(info, 'one', 0.15), j = at(info, 'joins', 1.5); const T0 = (i) => (i === 0 ? one + 0.15 : j - 0.5 + i * 0.13);
    s.fl.update(t + 2.1, { per: (i) => { const k = t - T0(i); return { sick: clamp((k + 0.3) / 0.3) * (k < 1.2 ? 1 : clamp(1 - (k - 1.2) / 0.5)), open: k > 0 && k < 0.4 ? 1 : 0, scared: k > -0.3 && k < 0 ? 1 : 0, lid: 0.35 }; } });
    s.fl.birds.forEach((b, i) => { const c = s.drops[i], k = t - T0(i); if (k < 0) { c.visible = false; c.userData.p = null; return; } if (!c.userData.p) { b.head.getWorldPosition(s.v); c.userData.p = [s.v.x, s.v.y, s.v.z]; } const p = c.userData.p; c.visible = p[1] - 4.9 * k * k > -1; c.position.set(p[0], p[1] - 0.3 - 4.9 * k * k, p[2]); c.rotation.set(k * 5, k * 3, k * 2); });
    camMove(s.stage, t, [[0, { pos: [0, 4.0, 7.5], look: [0, 9.8, -4], fov: 50 }], [info.dur, { pos: [0, 4.8, 8.6], look: [0, 9.2, -4], fov: 56 }]]); },
  overlay(g, t, info, s) { const one = at(info, 'one', 0.15), j = at(info, 'joins', 1.5); sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'exclaim', on: s.fl.birds[0], at: one, until: one + 0.9 }, ...s.fl.birds.slice(1).map((b, i) => ({ fx: 'exclaim', on: b, at: j - 0.5 + (i + 1) * 0.13, until: j + 1.2, scale: 0.8 })), { fx: 'shake', at: j, amp: 0.05, dur: 0.4 }]); },
});

// ---------- s15 "So that clear blue sky... wasn't empty." from the yard: the flock overhead, she stares, deadpan ----------
registerShot('s15', { kind: '3d',
  init(T) { const s = kyFarm(T, { target: [0, 0, 1], shadowSize: 7, seed: 3 }); s.w = woman(); s.w.position.set(0.4, 0, 2.0); s.w.rotation.y = 0.3; s.stage.add(s.w);
    s.fl = flock(s.stage, { n: 7, c: [-0.5, 11, -4], R: 4.2, seed: 3, speed: 0.4 }); s.rest = meatRain(s.stage, { n: 18, area: [-4, 4, -2, 4], t0: -9, t1: -8, seed: 12, skip: [[0.4, 2, 0.55], [1.0, 0.6, 0.55]] }); return s; },
  draw(s, t, info) { s.update(t); s.rest.update(t); s.fl.update(t + 5, { all: { lid: 0.45 } }); const e = at(info, 'empty', 1.8);
    const turn = ease.inOut(prog(t, e - 0.2, e + 0.2));
    s.w.pose(addPose(POSE.stand, { ...idle(t), headNod: lerp(-0.55, 0, turn), headTurn: lerp(0.1, -0.25, turn) })); s.w.face({ ...EXPR.deadpan, lid: 0.55, pupil: [lerp(0, 0, turn), lerp(1, 0, turn)] }, t);
    camMove(s.stage, t, [[0, { pos: [1.3, 1.2, 6.4], look: [0, 4.6, -1], fov: 52 }], [info.dur, { pos: [1.1, 1.3, 5.6], look: [0.2, 4.0, 0], fov: 50 }]]); },
  overlay(g, t, info, s) { const e = at(info, 'empty', 1.8); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sweat', on: 'w', at: e + 0.1 }]); },
});
