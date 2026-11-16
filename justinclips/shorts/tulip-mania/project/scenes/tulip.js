// Tulip mania (1630s): 15 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator.
// Loop: the last shot (historian shrugs) hard-cuts back into s01 (the tulip slamming the scale down, the house flying up).
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene, drawInsert, voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, studio, tulip, pottedTulip, bulb, pot, dutchman, canalHouse, miniHouse, balanceScale, coin, mug, canalStreet, tavern, soilBlock, PR,
  topCaption, stamp, yearStamp, popText, counter, insT, CARD_INK, ball, cyl, rbox, box, plane, floor, toon, flat, outline, canvasTex, rng, mesh, sph, scr, blob,
} from './_lib.js';

const TOP = ['it was still a bulb', 'in the dirt'];
const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const v3 = new THREE.Vector3();

// ---- s01 (frame 1): a giant balance scale. One tulip SLAMS its pan down; the pan with a whole canal house shoots up. Coins burst.
function scaleScene(T, o = {}) {
  const st = studio(T, { fov: o.fov || 40, bg: ['#ffe2a8', '#f6b25e', '#d0703c'], floor: '#d88a52', target: [0, 1.5, 0], shadowSize: 6 });
  const sc = balanceScale({ H: 3.0, L: 1.7, chain: 1.1 }); st.add(sc);
  const tl = tulip({ kind: 'flame', scale: 1.5 }); sc.pan.L.add(tl); tl.position.y = 0.05;
  const hs = miniHouse({ scale: 0.36 }); hs.position.y = 0.05; sc.pan.R.add(hs);
  const coins = []; for (let i = 0; i < 14; i++) { const c = coin(); st.add(c); coins.push(c); }
  return { stage: st, sc, tl, hs, coins };
}
const slam = (t) => 0.42 * (1 - Math.exp(-t * 9) * Math.cos(t * 16));   // overshoot then settle
registerShot('s01', { kind: '3d',
  init: (T) => scaleScene(T),
  draw(s, t, info) {
    const T = t + 0.06; s.sc.set(slam(T));
    s.tl.rotation.y = Math.sin(t * 2) * 0.2; s.hs.rotation.z = Math.sin(T * 14) * 0.06 * Math.exp(-T * 2);
    const r = rng(4); s.coins.forEach((c, i) => { const a = r() * Math.PI * 2, sp = 2 + r() * 3, vy = 4 + r() * 4; const tt = T * 1.0; const y = 1.4 + vy * tt - 4.9 * tt * tt; c.visible = y > 0.02; c.position.set(-1.7 + Math.cos(a) * sp * tt, Math.max(0.02, y), Math.sin(a) * sp * tt * 0.6 + 0.4); c.rotation.set(t * 9 + i, t * 5, i); });
    camMove(s.stage, t, [[0, { pos: [0.3, 2.9, 12.8], look: [0, 2.5, 0], fov: 42 }], [info.dur, { pos: [0.3, 2.85, 11.8], look: [0, 2.5, 0], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.07, dur: 0.6 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    reactions(g, t, s, [{ fx: 'sparkle', on: [-1.7, 2.6, 0], at: 0.05, scale: 1.1 }]);
    const [fx, fy] = scr(s.stage, [-1.7, 4.0, 0]), [hx, hy] = scr(s.stage, [1.7, 1.9, 0]);
    popText(g, t, at(info, 'flower', 0.6), '1 FLOWER', Math.max(230, fx), fy, 66, { color: '#ffd25a', rot: 0.06 });
    popText(g, t, at(info, 'cost', 0.9), '1 HOUSE', Math.min(E.W - 230, hx), hy, 66, { rot: -0.06 });
    topCaption(g, t, info, TOP, 's03');
  },
});

// ---- s02: low angle: a merchant looks from the dangling house up to the tulip and back. "???"
registerShot('s02', { kind: '3d',
  init(T) { const s = scaleScene(T, { fov: 36 }); const m = dutchman({ look: 'merchant', seed: 5 }); m.position.set(0.2, 0, 2.2); m.rotation.y = 0.1; s.stage.add(m); return { ...s, m }; },
  draw(s, t, info) {
    s.sc.set(0.42); s.tl.rotation.y = t * 0.6;
    const k = ease.inOut(prog(t, 0.2, 0.7)); s.m.pose(addPose(POSE.stand, { ...idle(t, 3), headTurn: lerp(-0.6, 0.6, k), headNod: -0.2 }));
    s.m.face(mixExpr(EXPR.neutral, { ...EXPR.shocked, pupil: [lerp(-0.7, 0.7, k), 0.5] }, clamp(k * 2)), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 0.9, 7.2], look: [0.1, 2.2, 0.6], fov: 40 }], [info.dur, { pos: [0.4, 1.0, 6.4], look: [0.1, 2.3, 0.6], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'm', at: 0.5 }]); topCaption(g, t, info, TOP, 's03'); },
});

// ---- s03: "Holland, the 1630s." canal street, windmill turning, beans strolling with potted tulips.
function streetScene(T) {
  const st = toonStage(T, { light: 'sunny', fov: 44, target: [0, 1, 0], shadowSize: 12 }); const env = canalStreet(st, { canalX: 0, houseX: 6.4 });
  const ppl = [];
  [[-3.4, 1.0, 'merchant', 1], [3.6, -1.5, 'trader', 2], [-3.0, -4.5, 'merchant', 3], [3.2, -6.5, 'trader', 4]].forEach(([x, z, look, sd]) => { const b = dutchman({ look, seed: 20 + sd, main: sd % 2 ? '#26242c' : '#6a3a2a' }); b.position.set(x, 0, z); st.add(b); const pt = pottedTulip({ kind: sd % 2 ? 'flame' : '#e83a5a' }); pt.scale.setScalar(0.55); st.add(pt); ppl.push({ b, pt, sd, x, z }); });
  return { stage: st, env, ppl };
}
registerShot('s03', { kind: '3d',
  init: streetScene,
  draw(s, t, info) {
    s.env.update(t);
    s.ppl.forEach(({ b, pt, sd, x, z }) => { const dir = sd % 2 ? 1 : -1; b.pose(addPose(walk(t + sd * 0.3, { speed: 1.5 }), { armR: [1.2, 0, 0], elbowR: 1.4 })); b.position.z = z + dir * t * 1.1; b.rotation.y = dir > 0 ? 0 : Math.PI; b.face(EXPR.happy, t);
      v3.set(0, 0, 0); b.hand.R.getWorldPosition(v3); pt.position.set(v3.x, v3.y - 0.1, v3.z); });
    camMove(s.stage, t, [[0, { pos: [0, 4.2, 11], look: [0, 2.2, -6], fov: 48 }], [info.dur, { pos: [0, 3.8, 9.6], look: [0, 2.2, -6], fov: 46 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); yearStamp(g, t, '1630s', { at: at(info, '1630s', 0.6) - 0.05, x: 780, y: 520, w: 330 }); popText(g, t, 0.15, 'HOLLAND', 290, 470, 74, { color: '#ff9a3a' }); },
});

// ---- s04: "Everyone wanted tulips." a crowd at a tulip stall, heart eyes.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, target: [0, 1, 0], shadowSize: 8 }); const env = canalStreet(st, { canalX: -14, houseX: 6.4 });
    const stl = PR.stall({ awning: ['#d8382a', '#f6efe0'] }); stl.position.set(0, 0, -1.2); st.add(stl);
    const pots = []; for (let i = 0; i < 5; i++) { const p = pottedTulip({ kind: i % 2 ? 'flame' : ['#e83a5a', '#f2c23a', '#9a4ad8'][i % 3] }); p.scale.setScalar(0.5); p.position.set(-0.9 + i * 0.45, 1.0, -1.1); st.add(p); pots.push(p); }
    const crowd = [[-1.6, 1.4, 'merchant', 1], [-0.4, 1.8, 'trader', 2], [0.8, 1.6, 'merchant', 3], [1.9, 1.2, 'trader', 4]].map(([x, z, look, sd]) => { const b = dutchman({ look, seed: 30 + sd, main: sd % 2 ? '#26242c' : '#7a4a2a', hat: sd !== 3 }); b.position.set(x, 0, z); b.rotation.y = Math.PI + (x * -0.12); st.add(b); return b; });
    const seller = dutchman({ look: 'trader', seed: 9, main: '#3a6a3a' }); seller.position.set(0.3, 0, -2.0); st.add(seller);
    return { stage: st, env, pots, crowd, seller };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.crowd.forEach((b, i) => { b.pose(addPose(POSE.armsUp, { ...idle(t, i), bob: Math.abs(Math.sin(t * 9 + i)) * 0.12 })); b.face(EXPR.happy, t); });
    s.seller.pose(addPose(POSE.handsHips, idle(t, 5))); s.seller.face(EXPR.smug, t);
    s.pots.forEach((p, i) => { p.tulip.rotation.z = Math.sin(t * 3 + i) * 0.06; });
    camMove(s.stage, t, [[0, { pos: [0.3, 6.6, 7.2], look: [0.2, 1.3, -1.8], fov: 40 }], [info.dur, { pos: [0.3, 6.2, 6.4], look: [0.2, 1.3, -1.8], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'hearts', on: 'seller', at: 0.15, dy: -60 }]); s.crowd.forEach(() => {}); popText(g, t, at(info, 'tulips', 0.6), 'TULIPS!!', E.W / 2, 330, 110, { color: '#ff5a7a' }); },
});

// ---- s05: "The rarest ones had wild flame stripes..." a striped tulip spinning on a velvet pedestal in a spotlight.
function pedestal(T) {
  const st = studio(T, { fov: 30, bg: ['#3a1e3a', '#5a2a4a', '#2a1428'], floor: '#4a2238', target: [0, 1.2, 0], shadowSize: 4 });
  const ped = new THREE.Group(); ped.add(cyl(0.6, 0.7, 1.2, '#6a1e3a', 0, 0.6, 0, 28)); ped.add(cyl(0.72, 0.72, 0.1, '#d8a83a', 0, 1.22, 0, 28)); outline(ped, { px: 2.6 }); st.add(ped);
  const tl = tulip({ kind: 'flame', scale: 1.3 }); tl.position.y = 1.27; st.add(tl);
  const spot = new THREE.SpotLight(new THREE.Color('#fff2d0'), 30, 14, 0.4, 0.5); spot.position.set(0, 7, 2); spot.target.position.set(0, 1.3, 0); st.add(spot, spot.target);
  return { stage: st, tl, ped };
}
registerShot('s05', { kind: '3d',
  init: pedestal,
  draw(s, t, info) { s.tl.rotation.y = t * 1.4; s.tl.cup.scale.setScalar(1 + 0.03 * Math.sin(t * 4)); camMove(s.stage, t, [[0, { pos: [0, 2.6, 6.4], look: [0, 2.3, 0], fov: 32 }], [info.dur, { pos: [0, 2.7, 4.9], look: [0, 2.6, 0], fov: 32 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: [0, 3.0, 0], at: 0.1, scale: 1.2 }, { fx: 'godrays', on: [0, 3.0, 0], at: 0 }]); popText(g, t, at(info, 'rarest', 0.3), 'RAREST', E.W / 2, 430, 100, { color: '#ffd25a' }); },
});

// ---- q05: "...wild flame stripes..." extreme close-up of the striped petals turning (sparkles).
registerShot('q05', { kind: '3d',
  init: pedestal,
  draw(s, t, info) { s.tl.rotation.y = 0.8 + t * 0.9; camMove(s.stage, t, [[0, { pos: [0.2, 2.95, 2.3], look: [0, 2.85, 0], fov: 30 }], [info.dur, { pos: [0.15, 2.95, 1.9], look: [0, 2.85, 0], fov: 30 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: [0.3, 3.1, 0.2], at: 0.15, scale: 1.4 }]); popText(g, t, 0.1, 'FLAME STRIPES', E.W / 2, 430, 96, { color: '#ffd25a' }); },
});

// ---- s06: "...caused by a virus." a cute cartoon virus paints the flame stripes on a giant petal. VIRUS stamp.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = studio(T, { fov: 34, bg: ['#d8f0d0', '#a8d8b0', '#6aa880'], floor: '#88b890', target: [0, 1.4, 0], shadowSize: 5 });
    const tl = tulip({ kind: 'flame', scale: 2.2 }); tl.position.set(0.8, 0, -0.5); st.add(tl);
    const vir = new THREE.Group(); vir.add(ball(0.45, '#7ac84a', 0, 0, 0, 24)); const r = rng(3);
    for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2, e = (r() - 0.5) * 2.4; const d = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)); const sp = cyl(0.03, 0.03, 0.22, '#5aa83a', d.x * 0.52, d.y * 0.52, d.z * 0.52, 6); sp.lookAt(d.x * 2, d.y * 2, d.z * 2); sp.rotateX(Math.PI / 2); vir.add(sp); vir.add(ball(0.06, '#f2d04a', d.x * 0.64, d.y * 0.64, d.z * 0.64, 8)); }
    for (const sx of [-1, 1]) { vir.add(ball(0.13, '#ffffff', sx * 0.15, 0.1, 0.38, 14)); vir.add(ball(0.06, '#1a1820', sx * 0.15, 0.08, 0.5, 10)); }
    const brush = new THREE.Group(); brush.add(cyl(0.025, 0.025, 0.8, '#c9965a', 0, 0, 0, 8)); brush.add(cyl(0.05, 0.03, 0.18, '#d8202a', 0, -0.48, 0, 8)); vir.add(brush); brush.position.set(0.55, 0, 0.1); brush.rotation.z = -0.8;
    outline(vir, { px: 3 }); vir.position.set(-0.9, 2.2, 0.6); st.add(vir);
    return { stage: st, tl, vir, brush };
  },
  draw(s, t, info) {
    s.vir.position.y = 2.2 + Math.sin(t * 5) * 0.12; s.vir.rotation.y = 0.4 + Math.sin(t * 3) * 0.15; s.brush.rotation.z = -0.8 + Math.sin(t * 14) * 0.35;
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 7.2], look: [0, 2.1, 0], fov: 36 }], [info.dur, { pos: [0, 2.4, 6.4], look: [0, 2.2, 0], fov: 36 }]]);
  },
  overlay(g, t, info, s) { const tv = at(info, 'virus', 0.6); stamp(g, t - tv, 'A VIRUS', { y: 470, size: 120, color: '#2f8a3a', rot: -0.08 }); popText(g, t, tv + 0.35, '(harmless to people)', E.W / 2, 640, 52); },
});

// ---- s07: "People traded bulbs still in the ground..." soil cross-section: the bulb underground, a SOLD sign above, two traders shake hands.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, target: [0, 0.5, -1], shadowSize: 8 });
    const soil = soilBlock(st); const b = bulb({ scale: 1.6 }); b.position.set(0, -1.6, 0.05); st.add(b);
    const sign = new THREE.Group(); sign.add(cyl(0.04, 0.04, 1.4, '#7a5032', 0, 0.7, 0, 8)); const tx = canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#fff36a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a1c15'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#d8281e'; x.font = '900 70px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SOLD!', w / 2, h / 2 + 4); });
    sign.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.05), toon('#ffffff', { map: tx }))); sign.children[1].position.y = 1.45; outline(sign, { px: 2.6 }); sign.position.set(0, 0, -1); st.add(sign);
    const a = dutchman({ look: 'merchant', seed: 51 }); a.position.set(-1.4, 0, -1.6); a.rotation.y = 0.6; st.add(a);
    const c = dutchman({ look: 'trader', seed: 52 }); c.position.set(1.4, 0, -1.6); c.rotation.y = -0.6; st.add(c);
    return { stage: st, b, sign, a, c };
  },
  draw(s, t, info) {
    const sh = Math.sin(t * 12) * 0.2;
    s.a.pose(addPose(POSE.stand, { armR: [1.3 + sh, -0.5, 0], elbowR: 0.3 })); s.c.pose(addPose(POSE.stand, { armL: [1.3 + sh, 0.5, 0], elbowL: 0.3 })); s.a.face(EXPR.grin, t); s.c.face(EXPR.grin, t);
    s.b.rotation.y = t * 0.5;
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 8.6], look: [0, -0.2, -0.6], fov: 42 }], [info.dur, { pos: [0, 0.6, 7.2], look: [0, -0.6, -0.4], fov: 42 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const [x, y] = scr(s.stage, [0, -1.0, 0.1]); popText(g, t, at(info, 'ground', 0.9), 'still underground', x, y + 260, 60, { color: '#ffd25a' }); },
});

// ---- s08: "...on paper..." insert: a bulb contract.
const paperBg = (T) => { const st = studio(T, { fov: 34 }); const b = bulb({ scale: 1.4 }); b.position.set(0, 0.6, 0); st.add(b); return { stage: st, b }; };
registerShot('s08', { kind: '3d',
  init: paperBg,
  draw(s, t) { s.b.rotation.y = t; camMove(s.stage, t, [[0, { pos: [0, 2, 6], look: [0, 1, 0], fov: 34 }], [2, { pos: [0, 2, 5.4], look: [0, 1, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.5); drawInsert(g, { type: 'document', title: 'CONTRACT', lines: ['1 tulip bulb', '(still in the ground)', 'pay on delivery'], highlight: 1, color: '#d8382a' }, t); },
});

// ---- s09: "...in taverns." a rowdy tavern table: mugs raised, papers waved.
function tavernScene(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 38, target: [0, 1, 0], shadowSize: 7, bg: ['#3a2418', '#2a1810'] }); const env = tavern(st);
  const ppl = [[-1.4, -0.9, 'merchant', 1, 0.15], [0, -1.0, 'trader', 2, 0], [1.4, -0.9, 'merchant', 3, -0.15], [-1.9, 1.1, 'trader', 4, Math.PI - 0.5], [1.9, 1.1, 'merchant', 5, Math.PI + 0.5]].map(([x, z, look, sd, ry]) => { const b = dutchman({ look, seed: 60 + sd, main: sd % 2 ? '#26242c' : '#7a4a2a' }); b.position.set(x, 0, z); b.rotation.y = ry; st.add(b); return b; });
  const flying = []; for (let i = 0; i < 10; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.008, 0.42), toon('#f2ead6')); p.castShadow = true; st.add(p); p.visible = false; flying.push(p); }
  return { stage: st, env, ppl, flying };
}
registerShot('s09', { kind: '3d',
  init: (T) => tavernScene(T),
  draw(s, t, info) {
    s.ppl.forEach((b, i) => { b.pose(addPose(i % 2 ? POSE.armsUp : { ...POSE.stand, armR: [2.6, -0.2, 0], elbowR: 0.4 }, { ...idle(t, i), bob: Math.abs(Math.sin(t * 7 + i)) * 0.08 })); b.face(i % 2 ? EXPR.grin : { ...EXPR.happy, mouth: 'open', talk: 0.6 }, t); });
    camMove(s.stage, t, [[0, { pos: [0.3, 2.8, 6.8], look: [0, 1.7, -0.4], fov: 40 }], [info.dur, { pos: [0.2, 2.6, 6.0], look: [0, 1.8, -0.4], fov: 40 }]]);
  },
  overlay(g, t, info, s) { popText(g, t, at(info, 'taverns', 0.3), 'IN TAVERNS', E.W / 2, 450, 96, { color: '#ffd25a' }); reactions(g, t, s, [{ fx: 'exclaim', on: s.ppl[1], at: 0.3 }]); },
});

// ---- s10: "One bulb reportedly sold for 10,000 guilders." an auctioneer holds up a single bulb; the number rolls up.
registerShot('s10', { kind: '3d',
  init(T) {
    const s = tavernScene(T, { fov: 34 }); s.ppl.forEach(b => b.visible = false);
    const auc = dutchman({ look: 'merchant', seed: 71, main: '#5a1e2a' }); auc.position.set(0, 0, -1.6); st_add(s, auc);
    const bb = bulb({ scale: 0.9 }); s.stage.add(bb);
    return { ...s, auc, bb };
  },
  draw(s, t, info) {
    s.auc.pose(addPose(POSE.stand, { ...idle(t, 2), armR: [2.9, -0.15, 0], elbowR: 0.2 })); s.auc.face({ ...EXPR.smug, talk: 0.3 }, t);
    v3.set(0, 0, 0); s.auc.hand.R.getWorldPosition(v3); s.bb.position.set(v3.x, v3.y + 0.08, v3.z + 0.05); s.bb.rotation.y = t * 1.5;
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 5.6], look: [0, 2.4, -1.6], fov: 40 }], [info.dur, { pos: [0, 1.3, 4.6], look: [0, 2.6, -1.6], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    popText(g, t, at(info, 'reportedly', 0.5), 'REPORTEDLY', E.W / 2, 450, 84, { color: '#ffffff' });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'bb', at: 0.2, scale: 0.6 }]);
  },
});
function st_add(s, o) { s.stage.add(o); }

// ---- q10: "...10,000 guilders." the number rolls up over a shower of coins around the single bulb.
registerShot('q10', { kind: '3d',
  init(T) { const st = studio(T, { fov: 34, bg: ['#ffe9a8', '#f6c25e', '#d8903c'], floor: '#e0a050' }); const b = bulb({ scale: 1.5 }); b.position.set(0, 0.2, 0); st.add(b); const coins = []; for (let i = 0; i < 40; i++) { const c = coin(); st.add(c); coins.push(c); } return { stage: st, b, coins }; },
  draw(s, t, info) { s.b.rotation.y = t * 1.2; const r = rng(12); s.coins.forEach((c, i) => { const x = (r() - 0.5) * 5, z = (r() - 0.5) * 3 - 0.5, d = r() * 1.2; const y = 6 - 9 * Math.max(0, t - d); c.position.set(x, Math.max(0.02 + (i % 5) * 0.035, y), z); c.rotation.set(y > 0.1 ? t * 7 + i : 0, i, y > 0.1 ? t * 5 : 0); });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.4], look: [0, 1.2, 0], fov: 36 }], [info.dur, { pos: [0, 1.9, 5.6], look: [0, 1.2, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { counter(g, t, 0.05, 0.7, 0, 10000, '', 'GUILDERS', { y: 470, size: 170 }); popText(g, t, 0.9, 'for ONE bulb', E.W / 2, 1180, 60, { color: '#ffffff' }); },
});

// ---- s11: "A craftsman made about 300 a year." a carpenter at his bench with a small coin pile. Then "= 33 YEARS".
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, target: [0, 1, 0], shadowSize: 6, bg: ['#5a3a24', '#3a2416'] }); const env = tavern(st, { tableW: 2.4, tableZ: 0.4 });
    env.group.children.filter(c => c.isMesh === false).length;
    const cr = dutchman({ look: 'craftsman', seed: 81 }); cr.position.set(0, 0, -0.7); st.add(cr);
    const coins = []; for (let i = 0; i < 6; i++) { const c = coin(); c.position.set(0.5 + (i % 3) * 0.05, 1.13 + Math.floor(i / 3) * 0.04 + i * 0.035, 0.6); st.add(c); coins.push(c); }
    const plank = rbox(1.4, 0.08, 0.3, '#c99a62', -0.4, 1.15, 0.6, 0.02); outline(plank, { px: 2.4 }); st.add(plank);
    return { stage: st, env, cr, coins };
  },
  draw(s, t, info) {
    const k = prog(t, at(info, 'year', 1.2) + 0.2, at(info, 'year', 1.2) + 0.5);
    s.cr.pose(addPose(mixPose({ ...POSE.stand, armR: [1.0, -0.2, 0], elbowR: 1.2, armL: [1.0, 0.2, 0], elbowL: 1.2 }, POSE.facepalm, k), idle(t, 4)));
    s.cr.face(mixExpr({ ...EXPR.neutral, mouth: 'smile' }, EXPR.deadpan, k), t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 5.2], look: [0, 1.7, -0.4], fov: 38 }], [info.dur, { pos: [0.2, 2.2, 4.4], look: [0, 1.7, -0.4], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    const t3 = at(info, '300', 0.9) - 0.1; popText(g, t, t3, '300 / YEAR', E.W / 2, 450, 110, { color: '#ffd25a' });
    const ty = at(info, 'year', 1.4) + 0.25; stamp(g, t - ty, '33 YEARS OF PAY', { y: 640, size: 82, w: 760, rot: -0.07 });
  },
});

// ---- s12: "Then, in February 1637..." a calendar page flips to FEBRUARY 1637 over the quiet tavern (suspense).
registerShot('s12', { kind: '3d',
  init: (T) => tavernScene(T),
  draw(s, t, info) { s.ppl.forEach((b, i) => { b.pose(addPose(POSE.stand, idle(t, i))); b.face({ ...EXPR.neutral, pupil: [0, -0.4] }, t); }); camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 6.4], look: [0, 1.7, -0.4], fov: 40 }], [info.dur, { pos: [0.2, 2.6, 6.1], look: [0, 1.7, -0.4], fov: 40 }]]); },
  overlay(g, t, info, s) {
    dimScene(g, 7, 0.45);
    const k = ease.outBack(clamp(t / 0.3)); const flip = clamp((t - 0.25) / 0.25);
    g.save(); g.translate(E.W / 2, 760); g.scale(k, k); g.rotate(-0.04); g.lineJoin = 'round';
    g.fillStyle = '#fbf6ea'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-300, -300, 600, 560, 30); g.fill(); g.stroke();
    g.fillStyle = '#d8382a'; g.beginPath(); g.roundRect(-300, -300, 600, 150, [30, 30, 0, 0]); g.fill(); g.stroke();
    insT(g, flip < 1 ? 'JANUARY' : 'FEBRUARY', 0, -225, 80, { color: '#ffffff', stroke: null, maxW: 540 });
    insT(g, '1637', 0, 40, 200, { color: CARD_INK, stroke: null });
    if (flip > 0 && flip < 1) { g.fillStyle = '#d8382a'; g.save(); g.scale(1, 1 - flip); g.fillRect(-300, -300, 600, 150); g.restore(); }
    g.restore();
  },
});

// ---- s13: "...the market crashed." the price chart nosedives over the tavern; papers fly, everyone shocked.
registerShot('s13', { kind: '3d',
  init: (T) => tavernScene(T, { fov: 40 }),
  draw(s, t, info) {
    const k = prog(t, 0.0, 0.25);
    s.ppl.forEach((b, i) => { b.pose(addPose(mixPose(POSE.stand, POSE.panic, k), { ...idle(t, i), bob: -0.1 * k })); b.face(EXPR.shocked, t); });
    const r = rng(6); s.flying.forEach((p, i) => { p.visible = true; const a = r() * Math.PI * 2, sp = 1 + r() * 2; p.position.set(Math.cos(a) * sp * t * 1.2, 1.2 + 3 * t - 2 * t * t + r(), Math.sin(a) * sp * t * 0.6); p.rotation.set(t * 4 + i, t * 3, i); });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 6.4], look: [0, 1.8, -0.4], fov: 42 }], [info.dur, { pos: [0.2, 2.6, 5.6], look: [0, 1.8, -0.4], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.05, amp: 0.06, dur: 0.5 }]);
  },
  overlay(g, t, info, s) {
    // chart: rising line, then a cliff
    const k = clamp(t / 0.9); g.save(); g.translate(150, 300); g.lineJoin = 'round'; g.lineCap = 'round';
    g.fillStyle = 'rgba(251,246,234,.92)'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-30, -40, 840, 420, 26); g.fill(); g.stroke();
    insT(g, 'TULIP PRICES', 390, 10, 52, { color: CARD_INK, stroke: null });
    const pts = [[20, 330], [160, 300], [300, 240], [420, 150], [520, 70], [560, 60], [600, 340]]; const n = (pts.length - 1) * k;
    g.strokeStyle = '#d8382a'; g.lineWidth = 16; g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i <= Math.ceil(n) && i < pts.length; i++) { const f = Math.min(1, n - (i - 1)); g.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); } g.stroke();
    g.restore();
    stamp(g, t - at(info, 'crashed', 0.5), 'CRASH!', { y: 1000, size: 130, fill: 'rgba(255,248,236,.9)' });
  },
});

// ---- s14: "But a historian who checked the records..." a modern historian at a desk buried in old records, magnifying glass.
function study(T) {
  const st = toonStage(T, { light: 'warm', fov: 36, target: [0, 1, 0], shadowSize: 6, bg: ['#efe3d2', '#e2d2bc'] });
  st.add(floor(30, 30, '#b88a5a')); const wall = plane(30, 12, '#d8c8a8', 0, 6, -3); wall.receiveShadow = true; st.add(wall);
  const sh = PR.shelf({ w: 2.4, h: 3.2, seed: 4 }); sh.position.set(-2.4, 0, -2.6); st.add(sh); const sh2 = PR.shelf({ w: 2.4, h: 3.2, seed: 7 }); sh2.position.set(2.4, 0, -2.6); st.add(sh2);
  const tb = PR.table({ w: 2.6, d: 1.2, h: 1.05, color: '#6a4228' }); tb.position.set(0, 0, 0.4); st.add(tb);
  const stack = new THREE.Group(); const r = rng(3); for (let i = 0; i < 9; i++) { const b = rbox(0.6 + r() * 0.2, 0.12, 0.45 + r() * 0.1, ['#8a5a3a', '#6a3a2a', '#a8844a', '#5a4a3a'][i % 4], (r() - 0.5) * 0.08, 0.06 + i * 0.125, 0, 0.02); b.rotation.y = (r() - 0.5) * 0.3; stack.add(b); } outline(stack, { px: 2.4 }); stack.position.set(-0.75, 1.11, 0.4); st.add(stack);
  const pp = PR.papers({ n: 5, seed: 9, spread: 0.8 }); pp.position.set(0.5, 1.12, 0.5); st.add(pp);
  const h = dutchman({ look: 'historian', seed: 91 }); h.position.set(0.3, 0, -0.5); st.add(h);
  const mg = new THREE.Group(); mg.add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 24), toon('#2a2a30'))); const lens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), toon('#cfe8ff', { transparent: true, opacity: 0.5 })); lens.userData.noOutline = true; mg.add(lens); const hd = cyl(0.025, 0.025, 0.3, '#5a3a22', 0, -0.3, 0, 8); mg.add(hd); outline(mg, { px: 2.4 }); st.add(mg);
  return { stage: st, h, mg };
}
registerShot('s14', { kind: '3d',
  init: study,
  draw(s, t, info) {
    s.h.pose(addPose(POSE.stand, { ...idle(t, 2), armR: [1.5, -0.3, 0], elbowR: 0.9, lean: 0.25, headNod: 0.3 })); s.h.face({ ...EXPR.suspicious, pupil: [0.2, -0.6] }, t);
    v3.set(0, 0, 0); s.h.hand.R.getWorldPosition(v3); s.mg.position.set(v3.x, v3.y + 0.25 + Math.sin(t * 3) * 0.05, v3.z + 0.1); s.mg.rotation.x = -0.6;
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 5.4], look: [0.1, 1.7, 0], fov: 38 }], [info.dur, { pos: [0.5, 2.3, 4.6], look: [0.1, 1.7, 0], fov: 38 }]]);
  },
  overlay(g, t, info, s) { popText(g, t, at(info, 'records', 1.0), 'THE RECORDS', E.W / 2, 450, 92, { color: '#ffd25a' }); },
});

// ---- s15: "...couldn't find anyone who..." she looks up from the records at the camera.
registerShot('s15', { kind: '3d',
  init: study,
  draw(s, t, info) {
    const k = ease.out(prog(t, 0.1, 0.4));
    s.h.pose(addPose(POSE.stand, { ...idle(t, 2), headNod: lerp(0.3, 0, k) })); s.h.face(mixExpr({ ...EXPR.suspicious, pupil: [0.2, -0.6] }, { ...EXPR.deadpan, pupil: [0, 0] }, k), t);
    s.mg.visible = false;
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 4.2], look: [0.3, 2.0, -0.5], fov: 34 }], [info.dur, { pos: [0.3, 2.2, 3.6], look: [0.3, 2.0, -0.5], fov: 34 }]]);
  },
  overlay(g, t, info, s) {
    popText(g, t, 0.1, 'historian Anne Goldgar', E.W / 2, 1580, 46, { color: '#ffffff' });
  },
});

// ---- s16 (PAYOFF): "...went bankrupt." close-up: deadpan stare into the lens, shrug, "0 BANKRUPT" stamp. Hard cut back to s01 (loop).
registerShot('s16', { kind: '3d',
  init: study,
  draw(s, t, info) {
    const ks = ease.out(prog(t, 0.05, 0.35)); s.mg.visible = false;
    s.h.pose(addPose(shrug({ ...POSE.stand }, ks), idle(t, 2))); s.h.face({ ...EXPR.deadpan, pupil: [0, 0], browL: 0.6, mouth: 'smirk' }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.25, 2.9], look: [0.3, 2.1, -0.5], fov: 34 }], [info.dur, { pos: [0.3, 2.25, 2.6], look: [0.3, 2.1, -0.5], fov: 34 }]]);
  },
  overlay(g, t, info, s) { const tb = at(info, 'bankrupt', 0.25); stamp(g, t - tb, '0 BANKRUPT', { y: 470, size: 120, color: '#2f8a3a' }); },
});
