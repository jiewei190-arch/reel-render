// "This Town's Mayor Was a Cat" (cat-mayor): 17 shots, Toon 3D + BEANMEN FX (sunny sky, reactions, 3 insert cards, whip/iris/flash)
import { registerShot, ease, prog, lerp, clamp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, nod, point, shrug } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, tag, town, storeInside, stubbs, local, granny, candidate, tomas, podium, ballotBox, ballot, margarita, banner, confetti, THREE } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' };
const SOFT = { rays: false, tint: '#ffcf8a' };
const CRATE_TOP = 1.0;

// ---------- the porch: Stubbs on a crate in front of the general store, locals cheering (frame 1 + the loop ending) ----------
const porch = {
  init(T) { const s = town(T, { target: [0, 0, 1], shadowSize: 8 }); s.cat = stubbs(); s.cat.position.set(0.9, CRATE_TOP, 0.2); s.cat.rotation.y = -0.15; s.stage.add(s.cat);
    s.fans = [0, 1, 2].map(i => { const b = local(i); b.position.set([-0.75, 2.35, -2.5][i], 0, [1.5, 1.6, 2.5][i]); b.rotation.y = [0.35, -0.4, 0.4][i]; s.stage.add(b); return b; });
    s.conf = confetti(s.stage, 70, 5, [-1.8, 3.4, -0.2, 0.9]); return s; },
  draw(s, t, info, o = {}) { s.sky.update(t); const T0 = o.t0 ?? 0; const tt = t + T0;
    s.cat.update(tt, { lid: 0.5, look: [0, 0], tail: 0.8, headTilt: Math.sin(tt * 1.3) * 0.08 });
    s.fans.forEach((b, i) => { const k = Math.abs(Math.sin(tt * 4 + i)); b.pose(addPose(mixPose(POSE.armsUp, POSE.stand, 0.15 * k), { bob: k * 0.12 })); b.position.y = k * 0.12; b.face(EXPR.happy, tt); });
    s.conf.update(tt, -0.4);
    camMove(s.stage, t, o.keys || [[0, { pos: [0.6, 1.9, 7.4], look: [0.6, 1.5, 0.2], fov: 42 }], [info.dur, { pos: [0.75, 1.6, 5.6], look: [0.8, 1.35, 0.2], fov: 40 }]], ease.inOut); },
};
const S01 = [{ fx: 'sparkle', on: 'cat', at: 1.15, scale: 0.9 }, { fx: 'stars', on: 'cat', at: 1.3 }];
registerShot('s01', { kind: '3d', init: porch.init, draw: (s, t, i) => porch.draw(s, t, i),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, S01); tag(g, 'MAYOR', ease.out(prog(t, 0.2, 0.5)), 0.16); } });
registerShot('s17', { kind: '3d', init: porch.init,
  draw: (s, t, i) => porch.draw(s, t, i, { t0: 0, keys: [[0, { pos: [0.75, 1.7, 6.2], look: [0.75, 1.4, 0.2], fov: 41 }], [i.dur, { pos: [0.6, 1.9, 7.4], look: [0.6, 1.5, 0.2], fov: 42 }]] }),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'cat', at: 0.3, scale: 0.8 }]); } });

// s02 "For almost 20 years." close on the mayor: slow smug blink, sparkle
registerShot('s02', { kind: '3d', init: porch.init,
  draw(s, t, info) { porch.draw(s, t, info, { keys: [[0, { pos: [0.95, 1.95, 4.8], look: [0.9, 1.75, 0.2], fov: 34 }], [info.dur, { pos: [0.95, 1.9, 4.2], look: [0.9, 1.75, 0.2], fov: 34 }]] });
    s.cat.update(t + 2, { lid: lerp(0.45, 0.75, ease.inOut(prog(t, 0.5, 0.9))), look: [0, 0], tail: 0.5, headTilt: 0.12 }); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const y = at(info, '20', 0.5); reactions(g, t, s, [{ fx: 'sparkle', on: 'cat', at: y, scale: 0.9 }]); tag(g, '1998 – 2017', ease.out(prog(t, y, y + 0.3)), 0.16); } });

// s03 "And according to legend, he beat the humans." three podiums: two human candidates + the kitten. Humans: ??? then sweat
registerShot('s03', { kind: '3d',
  init(T) { const s = town(T, { target: [0, 0, 3], shadowSize: 7, seed: 6 });
    s.h1 = candidate(0); s.h1.position.set(-1.35, 0, 3.0); s.h1.rotation.y = 0.25; s.stage.add(s.h1, podium('VOTE ME', { w: 1.0 }).at(-1.35, 0, 3.75, 0.25));
    s.h2 = candidate(1); s.h2.position.set(1.35, 0, 3.0); s.h2.rotation.y = -0.25; s.stage.add(s.h2, podium('VOTE ME', { w: 1.0 }).at(1.35, 0, 3.75, -0.25));
    s.stage.add(podium('STUBBS', { color: '#ffd25a', w: 1.0, h: 1.1 }).at(0, 0, 3.5)); s.cat = stubbs({ hat: false, scale: 0.7 }); s.cat.position.set(0, 1.13, 3.4); s.stage.add(s.cat); return s; },
  draw(s, t, info) { s.sky.update(t); const b = at(info, 'beat', 1.5);
    s.cat.update(t, { lid: t > b ? 0.6 : 0.3, look: [0, 0], tail: 0.9, headTilt: t > b ? 0.15 : 0 });
    [s.h1, s.h2].forEach((h, i) => { const k = ease.inOut(prog(t, b, b + 0.3)); h.pose(addPose(mixPose(POSE.holdFront, POSE.panic, k), idle(t, i + 3))); h.face(mixExpr(EXPR.smug, EXPR.shocked, k), t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 12.6], look: [0, 1.6, 3.2], fov: 40 }], [info.dur, { pos: [0, 2.1, 11.4], look: [0, 1.6, 3.2], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: b, amp: 0.06, dur: 0.4 }]); },
  overlay(g, t, info, s) { const b = at(info, 'beat', 1.5); sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'question', on: 'h1', at: 0.3, until: b - 0.1 }, { fx: 'sweat', on: 'h1', at: b + 0.1 }, { fx: 'exclaim', on: 'h2', at: b }, { fx: 'sweat', on: 'h2', at: b + 0.25 }, { fx: 'sparkle', on: 'cat', at: b + 0.1, scale: 0.7 }]);
    tag(g, 'ACCORDING TO LEGEND', ease.out(prog(t, 0.2, 0.5)), 0.16); } });

// s04 "Talkeetna, Alaska." wide street, mountain, god rays
const wide = { init(T) { const s = town(T, { target: [0, 0, 0], shadowSize: 14, seed: 8 }); s.cat = stubbs(); s.cat.position.set(0.9, CRATE_TOP, 0.2); s.stage.add(s.cat);
    s.walkers = [3, 4].map(i => { const b = local(i); s.stage.add(b); return b; }); return s; },
  draw(s, t, info) { s.sky.update(t); s.cat.update(t, { lid: 0.5, tail: 0.6 }); s.walkers.forEach((b, i) => { const x = i ? 4 - t * 0.9 : -5 + t * 0.9; b.position.set(x, 0, 2.6 + i * 0.8); b.rotation.y = i ? -Math.PI / 2 : Math.PI / 2; b.pose(addPose(POSE.stand, { legL: [Math.sin(t * 9) * 0.5, 0], legR: [-Math.sin(t * 9) * 0.5, 0], armL: [-Math.sin(t * 9) * 0.4, 0.1, 0], armR: [Math.sin(t * 9) * 0.4, -0.1, 0] })); b.face(EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [0, 4.8, 16], look: [0, 4.5, -10], fov: 46 }], [info.dur, { pos: [0, 3.2, 12.5], look: [0, 3.2, -10], fov: 46 }]], ease.inOut); } };
registerShot('s04', { kind: '3d', init: wide.init, draw: wide.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 1 }, tint: '#ffcf8a' }); tag(g, 'TALKEETNA, ALASKA', ease.out(prog(t, 0.15, 0.45)), 0.16); } });
// s05 insert: population card over the street
insertShot('s05', { scene: { init: wide.init, draw: (s, t, i) => wide.draw(s, t + 1.7, i) },
  insert: { type: 'bigtext', kicker: 'TALKEETNA, ALASKA', title: 'POP. ~900', lines: ['human mayor: none'] } });

// s06 "Wait, how?" TOMAS (blue cap) as a confused tourist: ??? + head tilt
registerShot('s06', { kind: '3d',
  init(T) { const s = town(T, { target: [0, 0, 3], shadowSize: 6, seed: 9 }); s.tom = tomas(); s.tom.position.set(-0.3, 0, 3.4); s.tom.rotation.y = 0.2; s.stage.add(s.tom); return s; },
  draw(s, t, info) { s.sky.update(t); s.tom.pose(addPose(shrug(POSE.stand, ease.outBack(prog(t, 0.15, 0.45))), { headTilt: 0.2 * ease.inOut(prog(t, 0.1, 0.4)) })); s.tom.face(mixExpr(EXPR.neutral, EXPR.suspicious, prog(t, 0.1, 0.3)), t);
    camMove(s.stage, t, [[0, { pos: [-0.1, 2.1, 9.0], look: [-0.25, 1.6, 3.4], fov: 34 }], [info.dur, { pos: [-0.15, 2.1, 8.4], look: [-0.25, 1.65, 3.4], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'tom', at: 0.1 }]); } });

// s07 insert: "You see, it's a historic district, not a real city." the official-status document over the street
insertShot('s07', { scene: { init: wide.init, draw: (s, t, i) => wide.draw(s, t + 3, i) },
  insert: { type: 'document', title: 'TALKEETNA, ALASKA', lines: ['Historic district: YES', 'Real city: NO', 'Mayor: none'], highlight: 2 } });

// s08 "So in 1998, the story goes," a local writes a ballot and drops it in the box
const vote = {
  init(T) { const s = town(T, { target: [0, 0, 3], shadowSize: 6, seed: 10 }); s.box = ballotBox().at(0.4, 0.9, 3.0); s.stage.add(s.box, PR_table(0.4, 3.0));
    s.v = local(5); s.v.position.set(-0.55, 0, 3.6); s.v.rotation.y = 0.7; s.stage.add(s.v); s.paper = ballot(); s.stage.add(s.paper);
    s.kit = stubbs({ hat: false, sash: false, scale: 0.55 }); s.stage.add(s.kit); return s; },
};
function PR_table(x, z) { const g = new THREE.Group(); const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.0), new THREE.MeshToonMaterial({ color: '#7a5032' })); top.position.y = 0.85; top.castShadow = top.receiveShadow = true; g.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8), new THREE.MeshToonMaterial({ color: '#5a3a22' })); l.position.set(sx * 0.8, 0.42, sz * 0.4); l.castShadow = true; g.add(l); } g.position.set(x, 0, z); return g; }
registerShot('s08', { kind: '3d', init: vote.init,
  draw(s, t, info) { s.sky.update(t); const drop = ease.inOut(prog(t, 1.3, 2.2));
    s.v.pose(addPose(mixPose(POSE.holdFront, point(POSE.stand, 'R', 1, { up: 0.1 }), drop), idle(t, 5))); s.v.face(mixExpr(EXPR.suspicious, EXPR.smug, drop), t);
    s.paper.position.set(lerp(-0.4, 0.4, drop), lerp(1.5, 1.75, Math.sin(drop * Math.PI)) - (t > 2.2 ? (t - 2.2) * 1.2 : 0), lerp(3.4, 3.0, drop)); s.paper.rotation.set(lerp(0.3, 1.4, drop), 0, 0); s.paper.visible = t < 2.45;
    s.kit.visible = false;
    camMove(s.stage, t, [[0, { pos: [-0.1, 2.4, 10.4], look: [0, 1.5, 3.1], fov: 36 }], [info.dur, { pos: [0, 2.3, 9.4], look: [0.1, 1.5, 3.0], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); tag(g, '1998', ease.out(prog(t, 0.4, 0.7)), 0.16); reactions(g, t, s, [{ fx: 'sparkle', on: 'v', at: 0.9, scale: 0.6 }]); } });
// s09 "voters wrote in a kitten named Stubbs." the kitten pops out of the ballot box: hearts + sparkle
registerShot('s09', { kind: '3d', init: vote.init,
  draw(s, t, info) { s.sky.update(t); s.paper.visible = false; const st = at(info, 'stubbs', 1.6); const pop = ease.outBack(prog(t, st - 0.35, st));
    s.kit.visible = true; s.kit.position.set(0.4, 0.9 + 0.8 * pop - 0.55 * (1 - pop), 3.0); s.kit.update(t, { lid: lerp(0.0, 0.25, prog(t, st, st + 0.5)), look: [0, 0.1], tail: 1.2, headTilt: 0.15 });
    s.v.pose(addPose(mixPose(POSE.stand, POSE.armsUp, ease.inOut(prog(t, st, st + 0.3))), idle(t, 5))); s.v.face(t > st ? EXPR.happy : EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.3, 8.6], look: [0.1, 1.6, 3.0], fov: 34 }], [info.dur, { pos: [0.2, 2.25, 7.8], look: [0.2, 1.65, 3.0], fov: 34 }]]); },
  overlay(g, t, info, s) { const st = at(info, 'stubbs', 1.6); sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'v', at: 0.2, until: st - 0.2 }, { fx: 'hearts', on: 'kit', at: st + 0.05 }, { fx: 'sparkle', on: 'kit', at: st, scale: 0.7 }]); tag(g, 'STUBBS', ease.out(prog(t, st, st + 0.3)), 0.16); } });
// s10 "He won." flash cut: the top hat drops onto the kitten, confetti, "!" + shake
registerShot('s10', { kind: '3d',
  init(T) { const s = vote.init(T); s.kit2 = stubbs({ sash: false, scale: 0.55 }); s.kit2.position.set(0.4, 1.7, 3.0); s.stage.add(s.kit2); s.conf = confetti(s.stage, 60, 9, [-1.6, 2.2, 2.0, 3.2]); return s; },
  draw(s, t, info) { s.sky.update(t); s.paper.visible = false; s.kit.visible = false; const w = at(info, 'won', 0.25);
    s.kit2.update(t, { lid: 0.55, look: [0, 0], tail: 1 }); s.kit2.hat.position.y = 0.3 + Math.max(0, 1.4 * (1 - ease.out(prog(t, w - 0.15, w + 0.15))));
    s.v.pose(addPose(POSE.armsUp, { bob: Math.abs(Math.sin(t * 8)) * 0.12 })); s.v.face(EXPR.grin, t); s.conf.update(t, w);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.3, 8.2], look: [0.1, 1.75, 3.0], fov: 34 }], [info.dur, { pos: [0.15, 2.3, 7.6], look: [0.15, 1.8, 3.0], fov: 34 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: w + 0.1, amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { const w = at(info, 'won', 0.25); sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'exclaim', on: 'v', at: w }, { fx: 'stars', on: 'kit2', at: w + 0.15 }]); } });

// s11 "His office? The general store." inside: the mayor on the counter under the MAYOR'S OFFICE sign, the shopkeeper
const shop = {
  init(T) { const s = storeInside(T); s.cat = stubbs(); s.cat.position.set(-0.4, s.top, 0.3); s.stage.add(s.cat);
    s.keep = local(2, { colors: { main: '#e8e0d0', legsTop: '#3a3a4a' } }); s.keep.position.set(1.0, 0, -0.9); s.stage.add(s.keep); s.glass = margarita(); s.glass.position.set(0.25, s.top, 0.55); s.stage.add(s.glass); return s; },
};
registerShot('s11', { kind: '3d', init: shop.init,
  draw(s, t, info) { const st = at(info, 'store', 1.6); s.glass.visible = false; s.cat.update(t, { lid: 0.55, look: [0, 0], tail: 0.5 }); s.keep.pose(addPose(POSE.handsHips, idle(t, 2))); s.keep.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.6, 7.0], look: [-0.1, 2.0, -0.5], fov: 44 }], [info.dur, { pos: [-0.2, 2.4, 6.0], look: [-0.1, 1.9, -0.5], fov: 44 }]]); },
  overlay(g, t, info, s) { const st = at(info, 'store', 1.6); reactions(g, t, s, [{ fx: 'question', on: 'keep', at: 0.15, until: st - 0.1 }, { fx: 'sparkle', on: 'cat', at: st, scale: 0.8 }]); } });
// s12 "His drink? Catnip water, from a margarita glass." close-up: laps from the glass, hearts on "margarita"
registerShot('s12', { kind: '3d', init: shop.init,
  draw(s, t, info) { const m = at(info, 'margarita', 2.3); s.cat.rotation.y = 0.5; const lap = t > 0.8 && t < m - 0.2 ? Math.abs(Math.sin(t * 7)) : 0;
    s.cat.update(t, { lid: t > m ? 0.65 : 0.4, look: [0.4, -0.3], tail: 1, headTurn: 0.35, headTilt: 0.1 }); s.cat.head.rotation.x = lap * 0.35 + 0.15;
    s.keep.pose(addPose(POSE.handsHips, idle(t, 2))); s.keep.face(EXPR.bored, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.2, 4.0], look: [-0.05, 1.9, 0.4], fov: 36 }], [info.dur, { pos: [0.25, 2.15, 3.6], look: [-0.05, 1.9, 0.4], fov: 36 }]]); },
  overlay(g, t, info, s) { const m = at(info, 'margarita', 2.3); reactions(g, t, s, [{ fx: 'hearts', on: 'cat', at: m }, { fx: 'sparkle', on: [0.25, s.top + 0.75, 0.55], at: m + 0.1, scale: 0.8 }]); tag(g, 'CATNIP WATER', ease.out(prog(t, 1.1, 1.4)), 0.16); } });

// s13 "In 2014, he even ran for the Senate." campaign stage: STUBBS FOR SENATE banner, the mayor at a podium, a local gasps
registerShot('s13', { kind: '3d',
  init(T) { const s = town(T, { target: [0, 0, 3], shadowSize: 7, seed: 12 }); const bn = banner('STUBBS FOR SENATE', { w: 2.9, h: 0.6, bg: '#c0392b' }); bn.position.set(0, 3.0, 2.6); s.stage.add(bn);
    for (const sx of [-1, 1]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 8), new THREE.MeshToonMaterial({ color: '#5a3a22' })); pole.position.set(sx * 1.5, 1.7, 2.6); pole.castShadow = true; s.stage.add(pole); }
    s.stage.add(podium('2014', { color: '#e8e0d0' }).at(0, 0, 3.1)); s.cat = stubbs({ scale: 0.75 }); s.cat.position.set(0, 1.33, 3.0); s.stage.add(s.cat);
    s.fan = local(1); s.fan.position.set(-1.1, 0, 4.6); s.fan.rotation.y = 0.6; s.stage.add(s.fan); return s; },
  draw(s, t, info) { s.sky.update(t); const se = at(info, 'senate', 2.8); s.cat.update(t, { lid: 0.35, look: [0, 0.1], tail: 1.1, headTilt: Math.sin(t * 2) * 0.1 });
    const k = ease.inOut(prog(t, se, se + 0.3)); s.fan.pose(addPose(mixPose(POSE.stand, POSE.panic, k), idle(t, 1))); s.fan.face(mixExpr(EXPR.neutral, EXPR.shocked, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 12.5], look: [0, 1.9, 3.0], fov: 40 }], [info.dur, { pos: [0, 2.3, 11.0], look: [0, 1.9, 3.0], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: se, amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { const se = at(info, 'senate', 2.8); sunnyLook(g, t, RAYS); tag(g, '2014: U.S. SENATE (WRITE-IN)', ease.out(prog(t, 0.3, 0.6)), 0.16);
    reactions(g, t, s, [{ fx: 'speedlines', at: se, until: se + 0.6 }, { fx: 'exclaim', on: 'fan', at: se + 0.05 }, { fx: 'sparkle', on: 'cat', at: se + 0.1, scale: 0.7 }]); } });
// s14 "He lost." flash cut to a close deadpan: sweat drop, tiny shake
registerShot('s14', { kind: '3d', init: (T) => { const s = registeredInit('s13')(T); return s; },
  draw(s, t, info) { s.sky.update(t); s.cat.update(t, { lid: 0.72, look: [0, 0], tail: 0.1, earsBack: 0.8 }); s.fan.visible = false;
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 6.8], look: [0, 2.0, 3.0], fov: 30 }], [info.dur, { pos: [0, 2.2, 6.5], look: [0, 2.0, 3.0], fov: 30 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sweat', on: 'cat', at: 0.35 }]); } });
import { getShot } from '/engine/core.js';
function registeredInit(id) { return (T) => getShot(id).init(T); }

// s15 insert: timeline over the store interior — "But he stayed honorary mayor until 2017."
insertShot('s15', { scene: { init: shop.init, draw: (s, t) => { s.cat.update(t, { lid: 0.5 }); s.glass.visible = false; s.keep.pose(POSE.handsHips); s.keep.face(EXPR.neutral, t); s.stage.cam([-0.2, 2.4, 6.0], [-0.1, 1.9, -0.5], 44); } },
  insert: { type: 'timeline', title: 'STUBBS, HONORARY MAYOR', lines: ['1998 · write-in win', '2014 · Senate run: lost', '2017 · still the mayor'] } });

// s16 "As one local put it: he never voted for anything I wouldn't have." a granny on the porch nods; the mayor, smug
registerShot('s16', { kind: '3d', init(T) { const s = porch.init(T); s.gran = granny(); s.gran.position.set(-0.4, 0.25, 0.35); s.gran.rotation.y = 0.35; s.stage.add(s.gran); s.fans.forEach(f => { f.visible = false; }); return s; },
  draw(s, t, info) { s.sky.update(t); const n = at(info, 'never', 1.7); s.cat.update(t, { lid: t > n + 1.2 ? 0.7 : 0.5, look: [-0.3, 0], tail: 0.7, headTurn: -0.25 });
    s.gran.pose(addPose(POSE.relaxed, { ...idle(t, 4), ...(t > n ? nod(t) : {}) })); s.gran.face(mixExpr(EXPR.neutral, EXPR.happy, prog(t, n, n + 0.4)), t);
    camMove(s.stage, t, [[0, { pos: [0.25, 2.0, 7.6], look: [0.25, 1.6, 0.2], fov: 38 }], [info.dur, { pos: [0.25, 1.95, 6.9], look: [0.25, 1.6, 0.2], fov: 38 }]]); },
  overlay(g, t, info, s) { const n = at(info, 'never', 1.7), h = at(info, 'have', 3.6); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'hearts', on: 'gran', at: n + 0.3 }, { fx: 'sparkle', on: 'cat', at: h, scale: 0.8 }, { fx: 'stars', on: 'cat', at: h + 0.1 }]); } });
