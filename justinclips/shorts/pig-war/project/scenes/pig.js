// The Pig War (1859): 14 shots, Toon 3D. EMOTION: LOL. Deadpan narrator. The pig is never shown being shot (s06 cuts away).
// Timing: every shot's start comes from lines.json + the voice's word timings (build_short.py); inside a shot, beats sync to words with at().
import { registerShot } from '/engine/core.js';
import {
  at, E, THREE, toonStage, camMove, quad, bird, island, cabin, potatoPatch, potato, farmer, rifle, redcoat, bluecoat, official, cannon, flag, warship, tree,
  POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, run, point, shrug, nod, reactions, shakeCam, sunnyLook,
  topCaption, stamp, yearStamp, burst, label, counter, flashFill, insT, CARD_INK, voidBg, PR, FX, rng, clamp, lerp, ease, prog, cyl, rbox, ball, toon, flat, outline, handPos, canvasTex,
} from './_lib.js';

const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const TOP = ['San Juan Island, 1859:', 'a 12-year standoff'];
const TOP_UNTIL = 3.4;

function line(st, mk, n, x0, z0, dx, rotY, seed) { return [...Array(n)].map((_, i) => { const b = mk({ seed: seed + i, skin: ['fair', 'light', 'olive', 'tan'][i % 4], moustache: i % 3 === 1 ? '#3a2416' : false }); b.position.set(x0 + i * dx, 0, z0 + (i % 2) * 0.5); b.rotation.y = rotY; st.add(b); return b; }); }
const stand = (L, t, ex = EXPR.angry) => L.forEach((b, i) => { b.pose(addPose(POSE.attention, idle(t, i))); b.face(ex, t); });

// ---- s01 (frame 1): standoff. Redcoats (left) and bluecoats (right) glare across a meadow; a warship rocks in the bay;
//      the pig trots right through the middle, munching a potato.
function standoffInit(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 16, target: [0, 1, 0] }); const env = island(st, { seed: 5, seaZ: -12 });
  const ship = warship({ seed: 1 }); ship.position.set(-3, 0, -22); ship.rotation.y = 0.3; st.add(ship);
  const reds = line(st, redcoat, 3, -3.6, -1.5, 0.0, 0.5, 20); reds.forEach((b, i) => b.position.set(-3.0 - i * 0.6, 0, -1.6 + i * 1.6));
  const blues = line(st, bluecoat, 3, 3.0, -1.5, 0.0, -0.5, 30); blues.forEach((b, i) => b.position.set(3.0 + i * 0.6, 0, -1.6 + i * 1.6));
  const pig = quad({ kind: 'pig', seed: 3 }); st.add(pig); const pt = potato(1.1); st.add(pt);
  const fu = flag('uk', { h: 3.6 }); fu.position.set(-4.6, 0, -4); st.add(fu); const fs = flag('us', { h: 3.6 }); fs.position.set(4.2, 0, -4); st.add(fs);
  return { stage: st, env, ship, reds, blues, pig, pt, fu, fs };
}
function pigTrot(s, t, x0 = -1.2, sp = 0.7) { s.pig.position.set(x0 + sp * t, 0, 1.4); s.pig.rotation.y = Math.PI / 2 - 0.35; s.pig.update(t, { walk: 1, speed: 3, lid: 0.35, headNod: Math.sin(t * 12) * 0.08 }); const h = new THREE.Vector3(); s.pig.head.getWorldPosition(h); s.pt.position.set(h.x + 0.35, h.y - 0.2, h.z + 0.25); }
registerShot('s01', { kind: '3d',
  init: standoffInit,
  draw(s, t, info) {
    const T0 = t + 0.3; s.env.update(T0); s.ship.update(T0); s.fu.update(T0); s.fs.update(T0); stand(s.reds, T0); stand(s.blues, T0); pigTrot(s, T0);
    s.reds.forEach((b, i) => b.pose(addPose(point(POSE.attention, 'R', 1, { up: -0.2 }), idle(T0, i))));
    s.blues.forEach((b, i) => b.pose(addPose(point(POSE.attention, 'L', 1, { up: -0.2 }), idle(T0, i + 3))));
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 11], look: [0, 1.3, -1], fov: 48 }], [info.dur, { pos: [0, 2.2, 9.2], look: [0, 1.1, -0.5], fov: 46 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s02: "...over a pig." close on the pig, chewing, looking up at both armies. Question marks.
registerShot('s02', { kind: '3d',
  init: standoffInit,
  draw(s, t, info) {
    s.env.update(t); s.ship.update(t); stand(s.reds, t); stand(s.blues, t);
    s.pig.position.set(0, 0, 1.4); s.pig.rotation.y = 0.15; s.pig.update(t, { lid: 0.2, look: [Math.sin(t * 3) * 0.8, 0.3], headNod: -0.15 + Math.sin(t * 14) * 0.04 });
    const h = new THREE.Vector3(); s.pig.head.getWorldPosition(h); s.pt.position.set(h.x + 0.05, h.y - 0.25, h.z + 0.5);
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 5.2], look: [0, 0.9, 1.4], fov: 40 }], [info.dur, { pos: [0, 1.1, 4.6], look: [0, 0.9, 1.4], fov: 38 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'pig', at: 0.25, scale: 0.8 }]); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s03: "In 1859, on an island both sides claimed," the island from above the water, a flag of each side planted at either end.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 24, target: [0, 0, 0] });
    const sky = C_sky(st);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon('#3a8fc4', { emissive: new THREE.Color('#2a6fa4'), emissiveIntensity: 0.25 })); sea.rotation.x = -Math.PI / 2; sea.userData.noOutline = true; st.add(sea);
    const isl = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), toon('#7ab055')); isl.scale.set(7, 1.0, 4); isl.position.y = -0.4; isl.castShadow = isl.receiveShadow = true; outline(isl, { px: 2.4 }); st.add(isl);
    const beach = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), toon('#e8d4a0')); beach.scale.set(7.5, 0.5, 4.4); beach.position.y = -0.3; st.add(beach);
    const r = rng(4); for (let i = 0; i < 14; i++) { const tr = tree(r, { pine: true, s: 0.7 }); const a = r() * Math.PI * 2, d = r() * 0.7; tr.position.set(Math.cos(a) * 6 * d, 0.3, Math.sin(a) * 3.2 * d); st.add(tr); }
    const fu = flag('uk', { h: 3 }); fu.position.set(-4.5, 0.3, 0.5); st.add(fu); const fs = flag('us', { h: 3 }); fs.position.set(3.8, 0.3, 0.5); st.add(fs);
    return { stage: st, sky, fu, fs };
  },
  draw(s, t, info) { s.sky.update(t); s.fu.update(t); s.fs.update(t);
    camMove(s.stage, t, [[0, { pos: [0, 9, 17], look: [0, 0.8, 0], fov: 44 }], [info.dur, { pos: [0, 8, 15], look: [0, 1.0, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); yearStamp(g, t, 1859, { at: at(info, '1859', 0.1), x: 820, y: 430 }); label(g, t, at(info, 'claimed', 0.9) - 0.1, 'BOTH CLAIMED IT', E.W / 2, 1220, 66, { box: '#2f4f8a' }); },
});
import { sunnySky } from './_lib.js';
function C_sky(st) { return sunnySky(st, { clouds: 7, seed: 4 }); }
// ---- s04: "...a British company's pig got into an American's garden." the pig roots through the potato patch; the farmer
//      steps out of his cabin, hands on hips.
function gardenInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, 0] }); const env = island(st, { seed: 7, seaZ: -22 });
  const cb = cabin(); cb.position.set(-2.5, 0, -6); cb.rotation.y = 0.3; st.add(cb);
  const patch = potatoPatch(); patch.position.set(0.5, 0, 0); st.add(patch);
  const pig = quad({ kind: 'pig', seed: 4 }); pig.position.set(0.6, 0, 0.8); pig.rotation.y = -0.6; st.add(pig);
  const f = farmer(); f.position.set(-2.4, 0, -2.6); st.add(f);
  const pts = [0, 1, 2].map(i => { const p = potato(); p.position.set(0.2 + i * 0.5, 0.1, 1.6 + (i % 2) * 0.3); st.add(p); return p; });
  return { stage: st, env, pig, f, pts };
}
registerShot('s04', { kind: '3d',
  init: gardenInit,
  draw(s, t, info) {
    s.env.update(t); s.pig.update(t, { lid: 0.15, headNod: 0.3 + Math.sin(t * 13) * 0.15, headTurn: Math.sin(t * 2) * 0.3 }); s.pig.position.x = 0.6 + Math.sin(t * 2) * 0.15;
    s.pts.forEach((p, i) => { p.position.y = 0.1 + Math.max(0, Math.sin(t * 6 + i * 2)) * 0.5; });
    const tg = at(info, 'garden', 1.0); const k = ease.outBack(prog(t, tg - 0.3, tg + 0.1));
    s.f.pose(addPose(mixPose(POSE.stand, POSE.handsHips, k), idle(t, 2))); s.f.face(mixExpr(EXPR.neutral, EXPR.angry, k), t); s.f.rotation.y = 0.4;
    camMove(s.stage, t, [[0, { pos: [1.8, 2.4, 7.5], look: [0, 1.0, -0.5], fov: 42 }], [info.dur, { pos: [1.6, 2.2, 6.6], look: [0, 1.0, -0.5], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, 0.15, "British company's pig", E.W / 2, 560, 58, { box: '#c8322a' }); const tg = at(info, 'garden', 1.0); reactions(g, t, s, [{ fx: 'exclaim', on: 'f', at: tg }]); },
});
// ---- s05: "He shot it." the farmer, close, deadpan-angry, rifle held upright across his chest (pointed at nothing).
registerShot('s05', { kind: '3d',
  init(T) { const s = gardenInit(T); s.rf = rifle(); s.stage.add(s.rf); return s; },
  draw(s, t, info) {
    s.env.update(t); s.f.rotation.y = 0.15; s.f.pose(addPose({ ...POSE.stand, armR: [0.9, 0.3, 0.6], elbowR: 1.4, armL: [0.7, 0.2, 0.6], elbowL: 1.3 }, idle(t, 2))); s.f.face(EXPR.deadpan, t);
    const h = handPos(s.f, 'R'); s.rf.position.set(h.x + 0.1, h.y + 0.2, h.z + 0.15); s.rf.rotation.set(0, 0, -0.5);
    camMove(s.stage, t, [[0, { pos: [-2.0, 2.2, 1.6], look: [-2.4, 2.0, -2.6], fov: 34 }], [info.dur, { pos: [-2.0, 2.2, 1.1], look: [-2.4, 2.0, -2.6], fov: 33 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); },
});
// ---- s06: "...shot it." CUT AWAY: a tree on the island; BANG off screen; a flock of birds bursts out. (The pig is not shown.)
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 2, 0] }); const env = island(st, { seed: 9, seaZ: -30, pines: 0 });
    const tr = tree(rng(3), { s: 1.6 }); st.add(tr);
    const birds = [...Array(7)].map((_, i) => { const b = bird({ body: '#3a3a44', head: '#3a3a44', ruff: '#3a3a44', scale: 0.35, seed: i }); st.add(b); return b; });
    return { stage: st, env, tr, birds };
  },
  draw(s, t, info) {
    s.env.update(t); const tb = at(info, 'shot', 0.1);
    s.birds.forEach((b, i) => { const k = Math.max(0, t - tb); const a = (i / 7) * Math.PI - Math.PI * 0.1; b.position.set(Math.cos(a) * (0.6 + k * 3.5), 4.2 + (i % 3) * 0.3 + k * (2.5 + i * 0.3), Math.sin(a) * 0.6 + 0.4); b.rotation.y = Math.cos(a) > 0 ? Math.PI / 2 : -Math.PI / 2; b.update(t, { flap: k > 0 ? 1 : 0, rate: 22 }); });
    s.tr.rotation.z = t > tb ? Math.sin((t - tb) * 30) * 0.03 * Math.max(0, 1 - (t - tb) * 2) : 0;
    camMove(s.stage, t, [[0, { pos: [0, 3.6, 10], look: [0, 4.2, 0], fov: 46 }], [info.dur, { pos: [0, 3.8, 10.5], look: [0, 4.6, 0], fov: 48 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tb, amp: 0.06, dur: 0.35 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const tb = at(info, 'shot', 0.1); burst(g, t - tb, { text: 'BANG!', y: 1300, r: 220, until: 0.9, size: 120 }); },
});
// ---- s07: "He offered 10 dollars." the farmer holds out a single coin; the company man in a top hat looks at it.
function dealInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 10, target: [0, 1, 0] }); const env = island(st, { seed: 11, seaZ: -20 });
  const cb = cabin(); cb.position.set(1, 0, -6); st.add(cb);
  const f = farmer(); f.position.set(-1.0, 0, 0.5); f.rotation.y = 0.8; st.add(f);
  const o = official(); o.position.set(1.0, 0, 0.5); o.rotation.y = -0.8; st.add(o);
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 20), toon('#e8c24a', { emissive: new THREE.Color('#a87a1a'), emissiveIntensity: 0.3 })); coin.rotation.x = Math.PI / 2; st.add(coin);
  return { stage: st, env, f, o, coin };
}
registerShot('s07', { kind: '3d',
  init: dealInit,
  draw(s, t, info) {
    s.env.update(t); const k = ease.outBack(prog(t, 0.1, 0.4));
    s.f.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.3, 0.1, 0], elbowR: 0.3 }, k), idle(t, 1))); s.f.face(EXPR.smug, t);
    s.o.pose(addPose(POSE.handsHips, idle(t, 2))); s.o.face(EXPR.suspicious, t);
    const h = handPos(s.f, 'R'); s.coin.position.set(h.x, h.y + 0.14, h.z); s.coin.rotation.z = t * 6;
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 7.4], look: [0, 1.6, 0.5], fov: 36 }], [info.dur, { pos: [0, 2.0, 6.6], look: [0, 1.6, 0.5], fov: 35 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const tc = at(info, '10', 0.6); stamp(g, t - tc, '$10', { y: 520, color: '#2f8a3a', size: 140, w: 400 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'coin', at: tc, scale: 0.5 }]); },
});
// ---- s08: "The British wanted 100." the company man flips a sign: $100. Farmer's jaw drops.
registerShot('s08', { kind: '3d',
  init: dealInit,
  draw(s, t, info) {
    s.env.update(t); const tc = at(info, '100', 0.6); const k = ease.outBack(prog(t, tc - 0.15, tc + 0.15));
    s.o.pose(addPose(mixPose(POSE.handsHips, { ...POSE.stand, armL: [2.6, 0.1, 0], elbowL: 0.2, armR: [0.3, 0.2, 0] }, k), idle(t, 2))); s.o.face(EXPR.smug, t);
    s.f.pose(addPose(POSE.stand, idle(t, 1))); s.f.face(mixExpr(EXPR.neutral, EXPR.shocked, k), t); s.coin.visible = false;
    camMove(s.stage, t, [[0, { pos: [1.4, 2.1, 6.0], look: [0.6, 1.8, 0.5], fov: 36 }], [info.dur, { pos: [1.4, 2.1, 5.4], look: [0.6, 1.9, 0.5], fov: 35 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const tc = at(info, '100', 0.6); stamp(g, t - tc, '$100', { y: 500, size: 140, w: 460 }); reactions(g, t, s, [{ fx: 'exclaim', on: 'f', at: tc + 0.1 }]); },
});
// ---- s09: "Britain threatened to arrest him..." the company man points; ARREST stamp; the farmer sweats.
registerShot('s09', { kind: '3d',
  init(T) { const s = dealInit(T); s.rc = line(s.stage, redcoat, 2, 2.0, -0.8, 0.9, -0.6, 70); return s; },
  draw(s, t, info) {
    s.env.update(t); s.coin.visible = false; const ta = at(info, 'arrest', 0.8); const k = ease.out(prog(t, ta - 0.3, ta));
    s.o.pose(point(addPose(POSE.stand, idle(t, 2)), 'R', k, { up: 0.0 })); s.o.face(EXPR.angry, t); s.f.pose(addPose(mixPose(POSE.stand, POSE.panic, k * 0.6), idle(t, 1))); s.f.face(mixExpr(EXPR.neutral, EXPR.worried, k), t);
    stand(s.rc, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 8.2], look: [0.4, 1.6, 0.0], fov: 38 }], [info.dur, { pos: [0.6, 2.2, 7.4], look: [0.4, 1.6, 0.0], fov: 37 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t - at(info, 'arrest', 0.8), 'ARREST HIM', { y: 480, size: 110, w: 680 }); reactions(g, t, s, [{ fx: 'sweat', on: 'f', at: at(info, 'arrest', 0.8) }]); },
});
// ---- s10: "...so America sent soldiers." a column of bluecoats marches up the beach from a rowboat.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [0, 1, -3] }); const env = island(st, { seed: 13, seaZ: -9 });
    const L = [...Array(8)].map((_, i) => { const b = bluecoat({ seed: 90 + i, skin: ['light', 'fair', 'olive', 'tan'][i % 4] }); b.home = [((i % 2) - 0.5) * 1.1, -9 - Math.floor(i / 2) * 1.3]; b.ph = i * 0.21; st.add(b); return b; });
    const fs = flag('us', { h: 3.2 }); st.add(fs);
    return { stage: st, env, L, fs };
  },
  draw(s, t, info) {
    s.env.update(t); s.L.forEach((b, i) => { b.position.set(b.home[0], 0, b.home[1] + 2.2 * t + 5); b.pose(walk(t + b.ph, { speed: 2 })); b.face(EXPR.deadpan, t); });
    const h = handPos(s.L[0], 'R'); s.fs.position.set(h.x, h.y - 1.5, h.z); s.fs.update(t);
    camMove(s.stage, t, [[0, { pos: [2.4, 1.6, 6], look: [0, 1.8, -3], fov: 44 }], [info.dur, { pos: [2.0, 1.6, 6.5], look: [0, 1.8, -2], fov: 44 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, at(info, 'soldiers', 0.6), 'U.S. ARMY LANDS', E.W / 2, 520, 64, { box: '#2f4f8a' }); },
});
// ---- s11: "Soon, 461 American troops..." the hilltop camp: rows of bluecoats + cannons. Counter.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 14, target: [0, 1, 0] }); const env = island(st, { seed: 15, seaZ: -26 });
    const L = []; for (let i = 0; i < 9; i++) { const b = bluecoat({ seed: 120 + i, skin: ['light', 'fair', 'olive', 'tan'][i % 4] }); b.position.set(((i % 3) - 1) * 1.2, 0, -Math.floor(i / 3) * 1.4); st.add(b); L.push(b); }
    const cs = [-3.4, 3.4, -2.4, 2.4].map((x, i) => { const c = cannon(); c.position.set(x, 0, i < 2 ? 1.0 : -2.6); c.rotation.y = Math.PI; st.add(c); return c; });
    const fs = flag('us', { h: 4.2 }); fs.position.set(0.2, 0, -4.6); st.add(fs);
    return { stage: st, env, L, cs, fs };
  },
  draw(s, t, info) { s.env.update(t); s.fs.update(t); stand(s.L, t, EXPR.deadpan); s.L.forEach(b => { b.rotation.y = 0; });
    camMove(s.stage, t, [[0, { pos: [0, 3.4, 9.5], look: [0, 1.4, -1], fov: 46 }], [info.dur, { pos: [0, 3.0, 8.4], look: [0, 1.4, -1], fov: 45 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const c0 = at(info, '461', 0.4) - 0.05; counter(g, t, c0, c0 + 0.55, 0, 461, E.W / 2, 470, { suffix: ' TROOPS', size: 96 }); label(g, t, c0 + 0.6, '+ 14 cannons', E.W / 2, 610, 58, {}); },
});
// ---- s12: "...faced five British warships." five ships slide into the bay, flags flying.
registerShot('s12', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 30, target: [0, 1, -14] }); const env = island(st, { seed: 17, seaZ: -4, pines: 2 });
    const ships = [...Array(5)].map((_, i) => { const w = warship({ seed: i }); w.home = [-8 + i * 4.2, -12 - (i % 2) * 5]; w.rotation.y = 0.15; st.add(w); return w; });
    return { stage: st, env, ships };
  },
  draw(s, t, info) { s.env.update(t); s.ships.forEach((w, i) => { w.position.set(w.home[0] + 1.6 * t, 0, w.home[1]); w.update(t); });
    camMove(s.stage, t, [[0, { pos: [2, 4.4, 14], look: [0, 2.2, -14], fov: 50 }], [info.dur, { pos: [2, 4.0, 12.5], look: [0, 2.4, -14], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t - at(info, 'five', 0.1), '× 5 WARSHIPS', { y: 470, size: 100, w: 720, color: '#c8322a' }); label(g, t, at(info, 'warships', 0.6) + 0.15, '2,000+ men aboard', E.W / 2, 640, 58, {}); },
});
// ---- s13: "Nobody fired a shot." both sides, a line each, just staring. A tumbleweed of seaweed rolls past. Wind.
registerShot('s13', { kind: '3d',
  init(T) { const s = standoffInit(T); s.pig.visible = false; s.pt.visible = false; s.tw = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), toon('#8a7a4a', { wireframe: false })); outline(s.tw, { px: 2 }); s.stage.add(s.tw); return s; },
  draw(s, t, info) { s.env.update(t); s.ship.update(t); s.fu.update(t); s.fs.update(t); stand(s.reds, t, EXPR.deadpan); stand(s.blues, t, EXPR.deadpan);
    s.tw.position.set(-3 + t * 2.4, 0.35 + Math.abs(Math.sin(t * 6)) * 0.3, 1.8); s.tw.rotation.z = -t * 6;
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 10], look: [0, 1.6, -1], fov: 46 }], [info.dur, { pos: [0, 2.0, 9.4], look: [0, 1.6, -1], fov: 45 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); label(g, t, at(info, 'shot', 0.6), 'SHOTS FIRED: 0', E.W / 2, 500, 80, { box: 'rgba(255,248,236,.94)', color: '#2a1c15' }); },
});
// ---- s14: PAYOFF "The only casualty... was the pig." the pig as a cheerful cartoon angel floats up over the island, halo
//      and little wings; sparkles. Hard cut back to s01 (loop).
registerShot('s14', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 2, 0] }); const env = island(st, { seed: 19, seaZ: -16 });
    const pig = quad({ kind: 'pig', seed: 6 }); st.add(pig);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 28), toon('#ffe25a', { emissive: new THREE.Color('#ffcc22'), emissiveIntensity: 0.6 })); halo.rotation.x = Math.PI / 2; st.add(halo);
    const wings = [-1, 1].map(sd => { const w = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), toon('#ffffff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3 })); w.scale.set(0.5, 0.08, 0.3); outline(w, { px: 2 }); st.add(w); return { w, sd }; });
    return { stage: st, env, pig, halo, wings };
  },
  draw(s, t, info) {
    s.env.update(t); const y = 1.2 + t * 0.55; s.pig.position.set(0, y, 0); s.pig.rotation.y = 0.35; s.pig.update(t, { lid: 0.55, look: [0, 0.5], wiggle: 0.6 });
    const h = new THREE.Vector3(); s.pig.head.getWorldPosition(h); s.halo.position.set(h.x, h.y + 0.62, h.z);
    s.wings.forEach(({ w, sd }) => { w.position.set(sd * 0.75, y + 1.25, -0.2); w.rotation.z = sd * (0.3 + Math.sin(t * 10) * 0.4); });
    camMove(s.stage, t, [[0, { pos: [0, 2.0 + t * 0.5, 7], look: [0, 1.6 + t * 0.55, 0], fov: 40 }], [info.dur, { pos: [0, 2.0 + t * 0.5, 6.5], look: [0, 1.6 + t * 0.55, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [540, -200], strength: 1.0 }, tint: '#ffe0b0' }); reactions(g, t, s, [{ fx: 'sparkle', on: 'pig', at: 0, scale: 1 }]); label(g, t, at(info, 'pig', 1.2) - 0.05, 'CASUALTIES: 1 PIG', E.W / 2, 470, 78, { box: 'rgba(255,248,236,.94)', color: '#c8322a' }); },
});
