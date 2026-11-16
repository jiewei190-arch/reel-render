// Defenestration of Prague (1618): 16 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator.
// Loop: the last shot (the secretary posing as "Baron of High Fall") hard-cuts back into s01 (three men flailing mid-air).
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene, drawInsert } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, studio, noble, governor, secretary, angel, historian, castleWall, castleHill, manure, floatPapers, PR, FX, sunnySky,
  topCaption, stamp, yearStamp, popText, counter, stink, insT, CARD_INK, ball, cyl, rbox, box, plane, floor, toon, flat, outline, canvasTex, rng, mesh, sph, scr,
} from './_lib.js';

const TOP = ['and one of them got', 'a noble title for it'];
const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const FALL = { ...POSE.panic, armL: [2.9, 0.9, 0], armR: [2.9, -0.9, 0], elbowL: 0.4, elbowR: 0.4, legL: [0.6, 0.4], legR: [-0.4, 0.4], kneeL: 0.8, kneeR: 0.3 };
const v3 = new THREE.Vector3();
const trio = () => [governor({ seed: 11 }), governor({ seed: 12, main: '#1e3a6a', hairColor: '#5a3a22', hair: 'swoop' }), secretary()];

function wallScene(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 44, target: [0, 10, 0], shadowSize: 16 });
  const sky = sunnySky(st, { clouds: 7, seed: 5 }); const w = castleWall(); st.add(w); st.add(floor(80, 60, '#7aa04a', 0, 10));
  return { stage: st, sky, w };
}
// ---- s01 (frame 1): three officials tumbling through the air past the castle wall, papers fluttering. No ground in shot.
registerShot('s01', { kind: '3d',
  init(T) { const s = wallScene(T, { fov: 46 }); const tr = trio(); tr.forEach(b => s.stage.add(b)); const pp = floatPapers(12, 4); pp.position.set(0, 8, 2); s.stage.add(pp); return { ...s, tr, pp }; },
  draw(s, t, info) {
    s.sky.update(t); const T = t + 0.3; s.pp.update(T);
    s.tr.forEach((b, i) => { const x = (i - 1) * 1.9, y = 15.5 - i * 0.8 - T * 1.6 - 0.8 * T * T * 0.3, z = 2.2 + i * 0.4; b.position.set(x, y, z); b.rotation.set(Math.sin(T * 2 + i) * 0.5, Math.sin(T + i) * 0.4, (i - 1) * 0.4 + Math.sin(T * 3 + i) * 0.4);
      b.pose(addPose(FALL, { armL: [Math.sin(T * 14 + i) * 0.4, 0, 0], armR: [Math.cos(T * 13 + i) * 0.4, 0, 0], legL: [Math.sin(T * 11 + i) * 0.3, 0], legR: [Math.cos(T * 12 + i) * 0.3, 0] })); b.face({ ...EXPR.shocked, mouth: 'scream' }, t); });
    camMove(s.stage, t, [[0, { pos: [2.5, 14.6, 12.5], look: [0, 14.2, 1], fov: 46 }], [info.dur, { pos: [2.4, 13.2, 11.6], look: [0, 12.9, 1], fov: 46 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'speedlines', on: s.tr[1], at: 0 }]); topCaption(g, t, info, TOP, 's03'); },
});
// ---- s02: "...out of a castle window." outside view of the window: two nobles lean out and look down, hands dusted off.
function windowScene(T) {
  const s = wallScene(T, { fov: 34 }); const n = [noble({ seed: 31 }), noble({ seed: 32, main: '#5a2a2a', hairColor: '#8a5a2a', feather: '#f2c23a' })];
  n.forEach((b, i) => { b.position.set((i - 0.5) * 0.8, s.w.floorY, -0.9); s.stage.add(b); }); return { ...s, n };
}
registerShot('s02', { kind: '3d',
  init: windowScene,
  draw(s, t, info) { s.sky.update(t); s.n.forEach((b, i) => { b.pose(addPose({ ...POSE.stand, lean: 0.55, headNod: 0.45, armL: [0.9, 0.3, 0], armR: [0.9, -0.3, 0], elbowL: 0.4, elbowR: 0.4 }, idle(t, i))); b.face({ ...EXPR.smug, pupil: [0, -0.8] }, t); });
    camMove(s.stage, t, [[0, { pos: [0.8, 14.8, 6.4], look: [0, 17.6, -0.6], fov: 38 }], [info.dur, { pos: [0.7, 15.2, 5.4], look: [0, 17.7, -0.6], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); topCaption(g, t, info, TOP, 's03'); },
});
// ---- s03: "Prague, 1618." the hilltop castle skyline; year stamp.
registerShot('s03', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 44, target: [0, 4, -26], shadowSize: 24 }); const env = castleHill(st); const river = new THREE.Mesh(new THREE.PlaneGeometry(200, 8), toon('#4a8ac0')); river.rotation.x = -Math.PI / 2; river.position.set(0, -0.3, -8); river.userData.noOutline = true; st.add(river, floor(200, 40, '#8ab05a', 0, 12)); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [-4, 3, 16], look: [0, 7, -26], fov: 46 }], [info.dur, { pos: [-3.4, 3, 14.6], look: [0, 7.2, -26], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); popText(g, t, 0.1, 'PRAGUE', E.W / 2, 420, 110, { color: '#ffffff' }); yearStamp(g, t, 1618, { at: at(info, '1618', 0.6) - 0.05, x: E.W / 2, y: 570 }); },
});
// ---- s04: "Angry nobles stormed the castle." nobles march down a stone hall, angry, toward camera.
function hall(T) {
  const st = toonStage(T, { light: 'warm', fov: 40, target: [0, 1, -2], shadowSize: 9, bg: ['#3a2a20', '#2a1e16'] });
  const f = floor(14, 40, '#8a7a62', 0, -6); st.add(f); for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), toon('#ffffff', { map: (() => { const tx = canvasTex(256, 256, (x, w2, h) => { x.fillStyle = '#c8bca8'; x.fillRect(0, 0, w2, h); x.strokeStyle = 'rgba(80,70,60,.35)'; x.lineWidth = 4; for (let y = 0; y < h; y += 42) { x.beginPath(); x.moveTo(0, y); x.lineTo(w2, y); x.stroke(); } }); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(10, 2); return tx; })() })); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * 4, 4, -6); w.receiveShadow = true; w.userData.noOutline = true; st.add(w); }
  for (let i = 0; i < 4; i++) { const b = PR.banner({ txt: '' }); if (b) { b.position.set(i % 2 ? 3.7 : -3.7, 2.6, -2 - i * 4); b.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2; st.add(b); } }
  return st;
}
registerShot('s04', { kind: '3d',
  init(T) { const st = hall(T); const n = [[-1.2, 0, 31, '#3a4a6a'], [0.3, -1.0, 32, '#5a2a2a'], [1.4, 0.4, 33, '#2a4a3a'], [-0.4, -2.4, 34, '#4a3a5a']].map(([x, z, sd, c]) => { const b = noble({ seed: sd, main: c }); b.position.set(x, 0, z); st.add(b); return { b, x, z, sd }; }); return { stage: st, n }; },
  draw(s, t, info) { s.n.forEach(({ b, z, sd }) => { b.pose(addPose(walk(t + sd * 0.2, { speed: 1.9, amp: 1.2 }), { armR: [Math.abs(Math.sin(t * 6 + sd)) * 1.2 + 1.2, -0.3, 0] })); b.position.z = z + t * 1.6; b.face({ ...EXPR.angry, mouth: 'teeth' }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 7.4], look: [0, 2.0, -1], fov: 42 }], [info.dur, { pos: [0, 1.5, 8.2], look: [0, 2.0, 0], fov: 42 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.02, dur: info.dur }]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'exclaim', on: s.n[1].b, at: 0.2 }, { fx: 'exclaim', on: s.n[2].b, at: 0.35 }]); popText(g, t, at(info, 'angry', 0.2), 'ANGRY NOBLES', E.W / 2, 420, 100, { color: '#ff6a4a' }); },
});
// ---- s05: "They grabbed two royal governors..." inside the room: two governors + the little secretary freeze, shocked.
function roomScene(T, o = {}) {
  const st = hall(T); const tr = trio(); tr.forEach((b, i) => { b.position.set((i - 1) * 1.3, 0, 0); st.add(b); });
  const nb = [noble({ seed: 31 }), noble({ seed: 32, main: '#5a2a2a', hairColor: '#8a5a2a', feather: '#f2c23a' })]; nb.forEach((b, i) => { b.position.set(i ? 2.4 : -2.4, 0, 1.4); b.rotation.y = i ? -0.9 : 0.9; st.add(b); });
  return { stage: st, tr, nb };
}
registerShot('s05', { kind: '3d',
  init: roomScene,
  draw(s, t, info) { const k = prog(t, at(info, 'secretary', 1.4) - 0.1, at(info, 'secretary', 1.4) + 0.2);
    s.tr.forEach((b, i) => { b.pose(addPose(POSE.panic, tremble(t + i, 0.03))); b.face(i === 2 ? mixExpr(EXPR.neutral, EXPR.shocked, k) : EXPR.shocked, t); });
    s.nb.forEach((b, i) => { b.pose(addPose({ ...POSE.stand, armL: [1.5, 0.3, 0], armR: [1.5, -0.3, 0] }, idle(t, i))); b.face({ ...EXPR.angry }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 7.6], look: [0, 1.8, 0], fov: 40 }], [info.dur, { pos: [0, 2.3, 6.6], look: [0, 1.8, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { popText(g, t, at(info, 'governors', 0.8), '2 ROYAL GOVERNORS', E.W / 2, 430, 80, { color: '#ffd25a' }); },
});
// ---- q05: "...and their secretary..." close-up: the little secretary clutches his papers, sweating. "+ SECRETARY".
registerShot('q05', { kind: '3d',
  init: roomScene,
  draw(s, t, info) { s.tr.forEach((b, i) => { b.pose(addPose(i === 2 ? { ...POSE.holdFront } : POSE.panic, tremble(t + i, 0.04))); b.face(EXPR.shocked, t); }); s.nb.forEach((b, i) => { b.pose(addPose({ ...POSE.stand, armL: [1.5, 0.3, 0], armR: [1.5, -0.3, 0] }, idle(t, i))); b.face(EXPR.angry, t); });
    camMove(s.stage, t, [[0, { pos: [1.5, 2.0, 3.6], look: [1.3, 1.85, 0], fov: 32 }], [info.dur, { pos: [1.5, 2.0, 3.1], look: [1.3, 1.85, 0], fov: 32 }]]); },
  overlay(g, t, info, s) { popText(g, t, 0.1, '+ THEIR SECRETARY', E.W / 2, 430, 80, { color: '#ffffff' }); reactions(g, t, s, [{ fx: 'sweat', on: s.tr[2], at: 0.1 }]); },
});
// ---- s06: "...and out they went." from the room: the window, a pair of flailing legs disappearing through it. WHOOSH.
registerShot('s06', { kind: '3d',
  init(T) { const s = wallScene(T, { fov: 36 }); const tr = trio(); tr.forEach(b => s.stage.add(b)); return { ...s, tr }; },
  draw(s, t, info) { s.sky.update(t); const wy = s.w.winY;
    s.tr.forEach((b, i) => { const tt = Math.max(0, t - i * 0.18); const x = (i - 1) * 0.7 + tt * (i - 1) * 0.3, y = wy - 0.5 + tt * 2.2 - tt * tt * 5, z = 0.4 + tt * 2.8; b.position.set(x, y, z); b.rotation.set(-0.6 - tt * 2, 0, (i - 1) * 0.3); b.pose(FALL); b.face({ ...EXPR.shocked, mouth: 'scream' }, t); b.visible = t > i * 0.18 - 0.05; });
    camMove(s.stage, t, [[0, { pos: [3.4, wy + 1.2, 8], look: [0, wy, 0], fov: 40 }], [info.dur, { pos: [3.2, wy + 0.6, 7.2], look: [0, wy - 0.8, 0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); popText(g, t, 0.15, 'OUT!', E.W / 2, 430, 150, { color: '#ff5a3a' }); },
});
// ---- s07: "About 70 feet down." the camera tilts down the huge wall; a height ruler reads ~70 FT (~21 m).
registerShot('s07', { kind: '3d',
  init(T) { const s = wallScene(T, { fov: 50 }); return s; },
  draw(s, t, info) { s.sky.update(t); const k = ease.inOut(clamp(t / info.dur)); camMove(s.stage, t, [[0, { pos: [6, 18, 16], look: [0, 17, 0], fov: 50 }], [info.dur, { pos: [6, 6, 16], look: [0, 4, 0], fov: 50 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const [x1, y1] = scr(s.stage, [-2.2, 16.6, 0.5]), [x2, y2] = scr(s.stage, [-2.2, 0, 0.5]);
    g.save(); g.strokeStyle = '#ffd25a'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); for (const [x, y] of [[x1, y1], [x2, y2]]) { g.beginPath(); g.moveTo(x - 50, y); g.lineTo(x + 50, y); g.stroke(); } g.restore();
    popText(g, t, at(info, '70', 0.3) - 0.05, '~70 FT', E.W / 2 + 140, E.H * 0.42, 130, { color: '#ffd25a' }); popText(g, t, at(info, 'feet', 0.6) + 0.2, '(about 21 m)', E.W / 2 + 140, E.H * 0.42 + 120, 56); },
});
// ---- s08: "All three survived." the three sit up on the grass, dazed but fine, blinking. Stamp.
function lawn(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 36, target: [0, 1, 0], shadowSize: 8 }); const sky = sunnySky(st, { clouds: 6, seed: 9 }); st.add(floor(80, 80, '#7aa04a', 0, 0)); const w = castleWall(); w.position.z = -4; st.add(w); return { stage: st, sky }; }
registerShot('s08', { kind: '3d',
  init(T) { const s = lawn(T); const tr = trio(); tr.forEach((b, i) => { b.position.set((i - 1) * 1.6, 0, 0.6); s.stage.add(b); }); return { ...s, tr }; },
  draw(s, t, info) { s.sky.update(t); s.tr.forEach((b, i) => { b.position.y = -0.62; b.rotation.y = (i - 1) * -0.3; b.pose(addPose({ ...POSE.sit, legL: [1.5, 0.3], legR: [1.5, -0.3], kneeL: 0.1, kneeR: 0.1 }, { headTilt: Math.sin(t * 3 + i) * 0.15 })); b.face({ ...EXPR.neutral, lid: 0.35, pupil: [Math.sin(t * 4 + i) * 0.5, 0] }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 7.6], look: [0, 1.0, 0], fov: 38 }], [info.dur, { pos: [0, 2.1, 6.8], look: [0, 1.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'stars', on: s.tr[0], at: 0 }, { fx: 'stars', on: s.tr[2], at: 0.1 }]); stamp(g, t - at(info, 'survived', 0.6), 'ALL 3 SURVIVED', { y: 470, size: 92, w: 760, color: '#2f8a3a' }); },
});
// ---- s09: "Catholics said angels caught them." toon angels gently catch the three mid-air. Gold rays. Label.
registerShot('s09', { kind: '3d',
  init(T) { const s = wallScene(T, { fov: 44 }); const tr = trio(); const an = [0, 1, 2].map(i => angel({ seed: 51 + i })); tr.forEach(b => s.stage.add(b)); an.forEach(a => s.stage.add(a)); return { ...s, tr, an }; },
  draw(s, t, info) { s.sky.update(t); const k = ease.out(clamp(t / 0.6));
    s.tr.forEach((b, i) => { const x = (i - 1) * 2.0, y = 9 - k * 1.5 + Math.sin(t * 2 + i) * 0.1; b.position.set(x, y, 2.4); b.rotation.set(0, 0, 0); b.pose(addPose({ ...POSE.sit }, {})); b.face(mixExpr(EXPR.shocked, { ...EXPR.happy, pupil: [0, 0.6] }, k), t); });
    s.an.forEach((a, i) => { const x = (i - 1) * 2.0; a.position.set(x, 6.8 - k * 1.5 + Math.sin(t * 2 + i) * 0.1, 2.0); a.flap(t + i); a.pose({ ...POSE.stand, armL: [1.5, 0.2, 0], armR: [1.5, -0.2, 0], elbowL: 0.3, elbowR: 0.3, legL: [0.2, 0], legR: [-0.1, 0] }); a.face(EXPR.happy, t); });
    camMove(s.stage, t, [[0, { pos: [0, 8.6, 13.5], look: [0, 8.6, 1.5], fov: 46 }], [info.dur, { pos: [0, 8.4, 12.5], look: [0, 8.4, 1.5], fov: 46 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'godrays', on: s.an[1], at: 0 }, { fx: 'sparkle', on: s.an[0], at: 0.2 }, { fx: 'sparkle', on: s.an[2], at: 0.35 }]); popText(g, t, 0.15, 'CATHOLIC VERSION:', E.W / 2, 400, 72, { color: '#ffd25a' }); popText(g, t, at(info, 'angels', 0.6), 'ANGELS', E.W / 2, 500, 110, { color: '#ffffff' }); },
});
// ---- s10: "Later pamphlets said..." a printed pamphlet card (insert).
registerShot('s10', { kind: '3d',
  init: (T) => lawn(T, { fov: 40 }),
  draw(s, t) { s.sky.update(t); camMove(s.stage, t, [[0, { pos: [0, 3, 9], look: [0, 3, -4], fov: 40 }], [2, { pos: [0, 3, 8.4], look: [0, 3, -4], fov: 40 }]]); },
  overlay(g, t, info, s) { dimScene(g, 8, 0.5); drawInsert(g, { type: 'document', title: 'PAMPHLET', lines: ['THE TRUTH about', 'their soft landing...', '(printed later)'], highlight: 1, color: '#7a5a30' }, t); },
});
// ---- s11: "...they landed in a pile of manure." SPLOMP: the three plop into a squashy manure heap, flies buzz, stink lines. Unhurt.
registerShot('s11', { kind: '3d',
  init(T) { const s = lawn(T, { fov: 38 }); const m = manure(); m.position.set(0, 0, 0.4); s.stage.add(m); const tr = trio(); tr.forEach(b => s.stage.add(b)); return { ...s, m, tr }; },
  draw(s, t, info) { s.sky.update(t); s.m.update(t); const tl = at(info, 'landed', 0.3) - 0.05;
    s.tr.forEach((b, i) => { const d = t - tl - i * 0.08; const x = (i - 1) * 1.1; if (d < 0) { b.position.set(x, 1.6 - d * 9, 0.6); b.rotation.set(0, 0, (i - 1) * 0.3); b.pose(FALL); } else { b.position.set(x, 0.75 - Math.min(0.5, d * 3), 0.6); b.rotation.set(-0.15, (i - 1) * -0.3, 0); b.pose({ ...POSE.armsUp }); } b.face(d < 0 ? { ...EXPR.shocked, mouth: 'scream' } : { ...EXPR.deadpan, mouth: 'wavy' }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 8.4], look: [0, 1.2, 0], fov: 38 }], [info.dur, { pos: [0, 2.2, 7.4], look: [0, 1.1, 0], fov: 38 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'landed', 0.3), amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const [x, y] = scr(s.stage, [0, 2.2, 0.4]); stink(g, x, y, t, { n: 4, spread: 120, h: 150 }); const tm = at(info, 'manure', 1.2); stamp(g, t - tm, 'MANURE', { y: 470, size: 120, color: '#7a5a30' }); popText(g, t, 0.1, 'PAMPHLET VERSION:', E.W / 2, 330, 64, { color: '#ffd25a', until: tm }); },
});
// ---- s12: "Historians think that part was probably made up." a modern historian, eyebrow up, "PROBABLY MADE UP".
registerShot('s12', { kind: '3d',
  init(T) { const st = studio(T, { fov: 34, bg: ['#efe3d2', '#e2d2bc', '#c8b498'], floor: '#b88a5a' }); const sh = PR.shelf({ w: 2.6, h: 3.2, seed: 4 }); sh.position.set(0, 0, -2.4); st.add(sh); const h = historian(); h.position.set(0, 0, 0); st.add(h); return { stage: st, h }; },
  draw(s, t, info) { s.h.pose(addPose({ ...POSE.thinking }, idle(t, 2))); s.h.face({ ...EXPR.suspicious, browL: 0.7, pupil: [0, 0] }, t); camMove(s.stage, t, [[0, { pos: [0.2, 2.3, 5.2], look: [0, 2.0, 0], fov: 36 }], [info.dur, { pos: [0.2, 2.3, 4.4], look: [0, 2.0, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { stamp(g, t - at(info, 'made', 1.2), 'PROBABLY MADE UP', { y: 470, size: 86, w: 820, color: '#d8382a' }); reactions(g, t, s, [{ fx: 'question', on: 'h', at: 0.2 }]); },
});
// ---- s13: "But the secretary got a noble title..." throne room: an enthroned ruler (generic toon) taps the secretary's shoulder with a sword; fanfare.
registerShot('s13', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, target: [0, 1, 0], shadowSize: 8 });
    st.add(floor(20, 20, '#6a2a3a')); const wall = plane(20, 10, '#e8d8b8', 0, 5, -3); wall.receiveShadow = true; st.add(wall); const th = PR.throne(); th.position.set(-1.4, 0, -1.2); st.add(th);
    const k = bean_k(); k.position.set(-1.4, 0, -0.9); st.add(k); const sec = secretary(); sec.position.set(0.5, 0, 0.3); sec.rotation.y = -0.8; st.add(sec);
    const sw = new THREE.Group(); sw.add(rbox(0.06, 1.4, 0.02, '#d8dce0', 0, 0.75, 0, 0.02)); sw.add(rbox(0.36, 0.06, 0.08, '#d8a83a', 0, 0.05, 0, 0.02)); outline(sw, { px: 2.2 }); st.add(sw); return { stage: st, k, sec, sw }; },
  draw(s, t, info) { s.k.position.y = 0; s.k.rotation.y = 0.6; s.k.pose(addPose({ ...POSE.stand, armR: [1.6 + Math.sin(t * 4) * 0.15, -0.6, 0], elbowR: 0.1 }, idle(t, 3))); s.k.face({ ...EXPR.smug }, t);
    v3.set(0, 0, 0); s.k.hand.R.getWorldPosition(v3); s.sw.position.copy(v3); s.sw.rotation.set(0, 0, -1.3 + Math.sin(t * 4) * 0.15);
    s.sec.position.y = -0.35; s.sec.pose({ ...POSE.stand, legL: [1.4, 0], kneeL: 1.6, legR: [-0.2, 0], kneeR: 1.8, headNod: 0.3 }); s.sec.face({ ...EXPR.happy, lid: 0.5 }, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 7.6], look: [-0.4, 1.5, -0.3], fov: 42 }], [info.dur, { pos: [0.2, 2.5, 6.8], look: [-0.4, 1.5, -0.3], fov: 42 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'sec', at: 0.3 }]); popText(g, t, at(info, 'title', 1.0), 'A NOBLE TITLE', E.W / 2, 430, 96, { color: '#ffd25a' }); },
});
import { bean } from '/kits/toon3d/rig.js';
function bean_k() { const b = bean({ name: 'Ruler', outfit: 'robe', colors: { main: '#4a2a6a', trim: '#e8c25a' }, skin: 'fair', hair: 'swoop', hairColor: '#3a2416', moustache: '#3a2416', beard: true, beardColor: '#3a2416', seed: 71 });
  const cr = new THREE.Group(); cr.add(cyl(0.36, 0.34, 0.22, '#f2c23a', 0, 0.48, 0, 16)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; cr.add(ball(0.06, '#d8382a', Math.cos(a) * 0.36, 0.62, Math.sin(a) * 0.36, 8)); } outline(cr, { px: 2.6 }); b.parts.head.add(cr); return b; }
// ---- s14: "...Baron von Hohenfall." a gold nameplate card slams in.
// ---- s15 (PAYOFF): "Baron of High Fall." the secretary poses proudly with a tiny coronet, deadpan to camera. Cut back to s01 (loop).
function portrait(T) { const st = studio(T, { fov: 32, bg: ['#5a2a4a', '#3a1a3a', '#2a1228'], floor: '#4a2238' }); const sec = secretary(); sec.position.set(0, 0, 0); st.add(sec);
  const cor = new THREE.Group(); cor.add(cyl(0.3, 0.28, 0.14, '#f2c23a', 0, 0.5, 0, 16)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; cor.add(ball(0.05, '#ffffff', Math.cos(a) * 0.3, 0.6, Math.sin(a) * 0.3, 8)); } outline(cor, { px: 2.6 }); sec.parts.head.add(cor); return { stage: st, sec }; }
registerShot('s14', { kind: '3d',
  init: portrait,
  draw(s, t, info) { s.sec.pose(addPose(POSE.handsHips, idle(t, 2))); s.sec.face({ ...EXPR.smug, pupil: [0, 0] }, t); camMove(s.stage, t, [[0, { pos: [0, 1.9, 5.6], look: [0, 1.6, 0], fov: 34 }], [info.dur, { pos: [0, 1.9, 5.0], look: [0, 1.6, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { const tb = at(info, 'baron', 0.2) - 0.1; if (t >= tb) { const k = ease.outBack(clamp((t - tb) / 0.25)); g.save(); g.translate(E.W / 2, 470); g.scale(k, k); g.rotate(-0.04); g.fillStyle = '#f2c23a'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-460, -110, 920, 220, 30); g.fill(); g.stroke(); insT(g, 'BARON', 0, -50, 60, { color: CARD_INK, stroke: null }); insT(g, 'von HOHENFALL', 0, 30, 100, { color: '#7a1e2a', stroke: null, maxW: 860 }); g.restore(); } reactions(g, t, s, [{ fx: 'sparkle', on: 'sec', at: tb + 0.1 }]); },
});
registerShot('s15', { kind: '3d',
  init: portrait,
  draw(s, t, info) { s.sec.pose(addPose({ ...POSE.handsHips, headTilt: 0.1 }, idle(t, 2))); s.sec.face({ ...EXPR.deadpan, pupil: [0, 0], mouth: 'smirk' }, t); camMove(s.stage, t, [[0, { pos: [0, 2.1, 3.4], look: [0, 2.0, 0], fov: 32 }], [info.dur, { pos: [0, 2.1, 3.0], look: [0, 2.0, 0], fov: 32 }]]); },
  overlay(g, t, info, s) { popText(g, t, at(info, 'high', 0.6) - 0.05, '"BARON OF HIGH FALL"', E.W / 2, 450, 84, { color: '#ffd25a' }); },
});
