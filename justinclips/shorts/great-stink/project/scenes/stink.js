// The Great Stink (London, 1858): 15 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator.
// Loop: the last shot (a modern sewer worker in the same brick tunnel) hard-cuts back into s01 (MPs gagging in green fog).
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene, drawInsert } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, studio, mp, engineer, worker, clothespin, chamber, parliamentFront, river, pipe, sludge, tunnel, curtainDunk, PR, FX,
  topCaption, stamp, yearStamp, popText, counter, stink, insT, CARD_INK, ball, cyl, rbox, box, plane, floor, toon, flat, outline, canvasTex, rng, mesh, sph, scr,
} from './_lib.js';

const TOP = ['they literally named it', 'The Great Stink'];
const SOFT = { rays: false, tint: '#ffe0b0' };
const GREEN = { rays: false, tint: '#c8e890' };
const v3 = new THREE.Vector3();
const NOSE = { armR: [2.5, -0.15, 0.2], elbowR: 2.2 };
const FAN = (t, sd) => ({ armL: [1.6 + Math.sin(t * 16 + sd) * 0.35, 0.3, 0], elbowL: 1.2 });

function chamberScene(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 40, target: [0, 1.5, -1], shadowSize: 9, bg: ['#2a3a24', '#1a2416'] }); const env = chamber(st);
  const seats = o.seats || [[-2.6, 0.55, 1.6, 1], [-2.6, 0.55, -1.0, 2], [-3.9, 1.0, 0.4, 3], [2.6, 0.55, 1.2, 4], [2.6, 0.55, -1.4, 5], [3.9, 1.0, 0.0, 6]];
  const mps = seats.map(([x, y, z, sd]) => { const b = mp({ seed: 40 + sd, pin: sd % 2 === 1 || sd === 4, hat: sd === 3 || sd === 6, hairColor: ['#5a3a22', '#8a8a8a', '#2a1a12', '#b07a3a'][sd % 4], main: ['#24232a', '#2a2e3a', '#3a2a2a'][sd % 3] });
    b.position.set(x, y, z); b.rotation.y = o.front ? -x * 0.12 : (x < 0 ? Math.PI / 2 - 0.35 : -Math.PI / 2 + 0.35); st.add(b); return { b, sd }; });
  return { stage: st, env, mps };
}
function gag(s, t) { s.mps.forEach(({ b, sd }) => { const pinned = !!b.pin || sd === 3; b.pose(addPose(pinned ? { ...POSE.stand, ...FAN(t, sd) } : { ...POSE.stand, ...NOSE, ...FAN(t, sd) }, { ...idle(t, sd), lean: 0.1, ...tremble(t, 0.02) })); b.face({ ...EXPR.worried, mouth: 'wavy', lid: 0.6, pupil: [0, 0.2] }, t); }); }

// ---- s01 (frame 1): the Commons, green stink fog rolling over the benches; MPs with clothespins fanning themselves.
registerShot('s01', { kind: '3d',
  init: (T) => chamberScene(T, { front: true, seats: [[-1.5, 0, 1.4, 1], [0, 0, 0.9, 3], [1.5, 0, 1.4, 5], [-3.0, 0.55, -0.6, 2], [3.0, 0.55, -0.6, 4]] }),
  draw(s, t, info) { s.env.update(t + 0.4); gag(s, t + 0.4); camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.6], look: [0, 1.9, 0], fov: 44 }], [info.dur, { pos: [0, 2.5, 7.4], look: [0, 1.9, 0], fov: 44 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.035, dur: info.dur }]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, GREEN); s.mps.forEach(({ b }, i) => { v3.set(0, 0, 0); b.parts.head.getWorldPosition(v3); const [x, y] = scr(s.stage, [v3.x, v3.y + 0.9, v3.z]); stink(g, x, y, t * 1.6 + i * 0.37, { n: 3, spread: 70, h: 130, w: 12 }); });
    reactions(g, t, s, [{ fx: 'sweat', on: s.mps[0].b, at: 0 }, { fx: 'sweat', on: s.mps[2].b, at: 0.1 }]);
    topCaption(g, t, info, TOP, 's03');
  },
});
// ---- s02: close-up: one MP with a clothespin on his nose, eyes watering, deadpan to the lens.
registerShot('s02', { kind: '3d',
  init: (T) => chamberScene(T, { fov: 30, seats: [[-0.2, 0, 1.6, 1]] }),
  draw(s, t, info) { s.env.update(t + 2); const b = s.mps[0].b; b.rotation.y = 0.05; b.pose(addPose({ ...POSE.stand, ...FAN(t, 1) }, idle(t, 1))); b.face({ ...EXPR.deadpan, pupil: [0, 0], mouth: 'wavy' }, t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.3, 5.4], look: [-0.2, 2.1, 1.6], fov: 32 }], [info.dur, { pos: [0.1, 2.25, 4.8], look: [-0.2, 2.1, 1.6], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, GREEN); reactions(g, t, s, [{ fx: 'sweat', on: s.mps[0].b, at: 0.2 }]); const [x, y] = scr(s.stage, [-0.2, 2.9, 1.6]); stink(g, x, y, t, { n: 3, spread: 90 }); topCaption(g, t, info, TOP, 's03'); },
});

// ---- s03: "Summer 1858." the parliament front by the river under a blazing sun; 1858 stamp.
function riverScene(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 44, target: [0, 1, -4], shadowSize: 16 }); const env = river(st);
  const pf = parliamentFront(); pf.position.set(o.pfx ?? 2, 0.6, -14); st.add(pf);
  return { stage: st, env, pf };
}
registerShot('s03', { kind: '3d',
  init: (T) => riverScene(T),
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [-2, 3.2, 14], look: [4, 5, -14], fov: 46 }], [info.dur, { pos: [-1.6, 3.0, 12.6], look: [4, 5.2, -14], fov: 46 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffcf7a' });
    yearStamp(g, t, 'SUMMER 1858', { at: at(info, '1858', 0.4) - 0.1, x: E.W / 2, y: 420, w: 560, size: 84 });
    const [x, y] = scr(s.stage, [2, 6, -14]); stink(g, x, y, t, { n: 4, spread: 140, h: 160 });
  },
});
// ---- s04: "A heatwave hit the Thames." a giant thermometer pops its top; heat shimmer over the river.
registerShot('s04', { kind: '3d',
  init(T) { const s = riverScene(T, { fov: 40 }); const th = new THREE.Group(); th.add(rbox(0.5, 4.2, 0.3, '#f4f0e8', 0, 2.3, 0, 0.2)); th.add(ball(0.42, '#d8282a', 0, 0.3, 0, 20)); const col = cyl(0.11, 0.11, 1, '#d8282a', 0, 0, 0.12, 12); th.add(col); outline(th, { px: 2.8 }); th.position.set(-1.6, 0.6, 3); s.stage.add(th); return { ...s, th, col }; },
  draw(s, t, info) { s.env.update(t); const k = ease.out(clamp(t / 1.0)); const h = 0.6 + k * 3.2; s.col.scale.y = h; s.col.position.y = 0.45 + h / 2; s.th.position.y = 0.6 + (k > 0.98 ? Math.sin(t * 40) * 0.03 : 0);
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.8, 9.2], look: [-1.0, 2.6, 0], fov: 42 }], [info.dur, { pos: [-0.6, 2.8, 8.4], look: [-1.0, 2.6, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffb860' }); popText(g, t, at(info, 'heatwave', 0.3), 'HEATWAVE', E.W / 2, 430, 110, { color: '#ff7a3a' }); reactions(g, t, s, [{ fx: 'exclaim', on: [-1.6, 5.6, 3], at: 0.9 }]); },
});
// ---- s05: "And the Thames..." a boatman rows across the murky river, holding his nose.
registerShot('s05', { kind: '3d',
  init(T) { const s = riverScene(T, { fov: 38, pfx: -6 }); const boat = new THREE.Group(); boat.add(rbox(2.6, 0.5, 1.0, '#8a5a32', 0, 0.1, 0, 0.2)); boat.add(rbox(2.3, 0.1, 0.8, '#6a4228', 0, 0.36, 0, 0.04)); outline(boat, { px: 2.6 }); boat.position.set(0, -0.5, 1); s.stage.add(boat);
    const b = mp({ main: '#4a3a2a', seed: 61, hairColor: '#8a5a32' }); b.position.set(0, -0.25, 1); b.rotation.y = 0.3; s.stage.add(b); return { ...s, boat, b }; },
  draw(s, t, info) { s.env.update(t); s.boat.position.y = -0.5 + Math.sin(t * 2) * 0.05; s.b.position.y = -0.25 + Math.sin(t * 2) * 0.05; s.b.pose(addPose({ ...POSE.stand, ...NOSE, armL: [1.0, 0.4, 0], elbowL: 0.6 }, idle(t, 2))); s.b.face({ ...EXPR.worried, mouth: 'wavy', lid: 0.55 }, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.0, 7.6], look: [0, 1.0, 0], fov: 38 }], [info.dur, { pos: [0.5, 1.9, 6.8], look: [0, 1.1, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); for (const [px, pz] of [[-3, -2], [2.5, -1], [-1, -5]]) { const [x, y] = scr(s.stage, [px, -0.4, pz]); stink(g, x, y, t + px, { n: 2, spread: 60, h: 110 }); } },
});
// ---- s06: "...was full of London's sewage." a sewer pipe in the embankment wall pours brown sludge into the river.
registerShot('s06', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 36, target: [0, 1, 0], shadowSize: 8 }); const env = river(st); const wall = box(30, 6, 1, '#8a7a62', 0, 1.8, -0.6); wall.userData.noOutline = true; wall.receiveShadow = true; st.add(wall);
    const p = pipe(); p.position.set(0, 2.2, 0.4); st.add(p); const sl = sludge(); sl.position.set(0, 2.2, 1.6); st.add(sl); return { stage: st, env, p, sl }; },
  draw(s, t, info) { s.env.update(t); s.sl.update(t); camMove(s.stage, t, [[0, { pos: [2.2, 2.4, 9], look: [0, 1.4, 1], fov: 38 }], [info.dur, { pos: [1.8, 2.3, 8], look: [0, 1.4, 1], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); stamp(g, t - at(info, 'sewage', 0.6), 'SEWAGE', { y: 470, size: 120, color: '#6a4a22' }); const [x, y] = scr(s.stage, [0, 0, 3]); stink(g, x, y, t, { n: 4, spread: 110, h: 180 }); },
});
// ---- s07: "Parliament sits right on the river." wide: the parliament front with a green stink cloud drifting off the water into it.
registerShot('s07', { kind: '3d',
  init(T) { const s = riverScene(T, { fov: 40, pfx: 0 }); const cl = FX.smoke({ count: 22, size: 0.9, rise: 0.6, spread: 12, color: '#a8d468', life: 5, seed: 8, drift: [0, -0.8] }); cl.position.set(0, 0.5, -8); s.stage.add(cl); return { ...s, cl }; },
  draw(s, t, info) { s.env.update(t); s.cl.update(t + 2); camMove(s.stage, t, [[0, { pos: [0, 2.6, 13], look: [0, 4, -14], fov: 42 }], [info.dur, { pos: [0, 2.6, 11.6], look: [0, 4.2, -14], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.6 }, tint: '#ffd49a' }); popText(g, t, at(info, 'river', 0.8), 'RIGHT ON THE RIVER', E.W / 2, 430, 84, { color: '#ffd25a' }); },
});
// ---- s08: "So they soaked the curtains in chemicals." two MPs dunk a green curtain into a CHLORIDE OF LIME bucket.
registerShot('s08', { kind: '3d',
  init(T) { const s = chamberScene(T, { fov: 36, seats: [[-1.3, 0, 1.4, 1], [1.3, 0, 1.4, 4]] }); const cd = curtainDunk(); cd.position.set(0, 0, 1.2); s.stage.add(cd); return { ...s, cd }; },
  draw(s, t, info) { s.env.update(t); const k = 0.5 + 0.5 * Math.sin(t * 5); s.cd.curtain.position.y = 0.2 - k * 1.3; s.cd.bucket.position.y = 0;
    s.mps.forEach(({ b, sd }, i) => { b.rotation.y = i ? -0.6 : 0.6; b.pose(addPose({ ...POSE.stand, armL: [2.2 - k * 0.6, i ? 0.6 : 0.2, 0], armR: [2.2 - k * 0.6, i ? -0.2 : -0.6, 0], elbowL: 0.6, elbowR: 0.6 }, idle(t, sd))); b.face({ ...EXPR.deadpan, mouth: 'line' }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.6], look: [0, 1.6, 1.2], fov: 38 }], [info.dur, { pos: [0, 2.5, 6.8], look: [0, 1.6, 1.2], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, GREEN); popText(g, t, at(info, 'curtains', 0.9), 'CHEMICAL CURTAINS', E.W / 2, 430, 84, { color: '#ffffff' }); },
});
// ---- s09: the soaked curtain hangs at the window... the green fog just floats past it. MP deadpan.
registerShot('s09', { kind: '3d',
  init(T) { const s = chamberScene(T, { fov: 34, front: true, seats: [[0.6, 0, 2.6, 3]] }); const c = PR.curtain({ w: 1.6, h: 3.4, color: '#3f7a4a' }); c.position.set(-1.0, 0, 2.0); s.stage.add(c);
    const fog = FX.smoke({ count: 10, size: 0.35, rise: 0.1, spread: 1.6, color: '#a8d468', life: 3, seed: 3, drift: [1.2, 0] }); fog.position.set(-2.6, 2.2, 2.4); s.stage.add(fog); return { ...s, fog }; },
  draw(s, t, info) { s.env.update(t); s.fog.update(t + 1); const b = s.mps[0].b; b.rotation.y = -0.2; b.pose(addPose({ ...POSE.stand, ...NOSE }, idle(t, 3))); b.face({ ...EXPR.deadpan, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 8.6], look: [0, 1.9, 2.2], fov: 36 }], [info.dur, { pos: [0, 2.3, 8.0], look: [0, 1.9, 2.2], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, GREEN); popText(g, t, 0.3, '(it didn’t help much)', E.W / 2, 450, 60); },
});
// ---- s10: "They even talked about moving Parliament out of London." map insert: LONDON -> OXFORD? / ST ALBANS?
registerShot('s10', { kind: '3d',
  init: (T) => chamberScene(T),
  draw(s, t, info) { s.env.update(t); gag(s, t); camMove(s.stage, t, [[0, { pos: [0, 3.4, 9], look: [0, 1.6, -1], fov: 44 }], [info.dur, { pos: [0, 3.4, 8.4], look: [0, 1.6, -1], fov: 44 }]]); },
  overlay(g, t, info, s) { dimScene(g, 8, 0.5); drawInsert(g, { type: 'map', title: 'MOVE PARLIAMENT?', lines: ['London', 'Oxford?', 'St Albans?'], color: '#d8382a' }, t); },
});
// ---- s11: "Instead, they passed a new sewer law in about seven weeks." a big APPROVED stamp slams on a bill; "~7 WEEKS".
registerShot('s11', { kind: '3d',
  init(T) { const s = chamberScene(T, { fov: 34, seats: [[0, 0, -0.2, 6]] }); const doc = rbox(1.3, 0.02, 1.7, '#fbf6ea', 0, 1.02, 0.4, 0.01); s.stage.add(doc); return { ...s }; },
  draw(s, t, info) { s.env.update(t); const b = s.mps[0].b; b.rotation.y = 0; const k = prog(t, 0.3, 0.45); b.pose(addPose({ ...POSE.stand, armR: [lerp(2.8, 1.4, ease.in(k)), -0.2, 0], elbowR: 0.4 }, idle(t, 6))); b.face(mixExpr(EXPR.neutral, { ...EXPR.smug, pupil: [0, 0] }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 5.6], look: [0, 1.6, 0], fov: 36 }], [info.dur, { pos: [0, 2.7, 5.0], look: [0, 1.6, 0], fov: 36 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.45, amp: 0.04, dur: 0.3 }]); },
  overlay(g, t, info, s) { stamp(g, t - 0.45, 'NEW SEWERS: APPROVED', { y: 300, size: 70, w: 860, color: '#2f8a3a' }); },
});
// ---- q11: "...in about seven weeks." the rolled bill on the table, a big counter: ~7 WEEKS (15 June -> 2 August 1858).
registerShot('q11', { kind: '3d',
  init: (T) => chamberScene(T),
  draw(s, t, info) { s.env.update(t); gag(s, t); camMove(s.stage, t, [[0, { pos: [0, 3.4, 9], look: [0, 1.6, -1], fov: 44 }], [info.dur, { pos: [0, 3.2, 8.2], look: [0, 1.6, -1], fov: 44 }]]); },
  overlay(g, t, info, s) { dimScene(g, 8, 0.5); counter(g, t, 0.05, 0.6, 0, 7, '~', 'WEEKS', { y: 700, size: 260 }); popText(g, t, 0.8, 'June 15 \u2192 Aug 2, 1858', E.W / 2, 1050, 60); },
});
// ---- s12: "Engineer Joseph Bazalgette..." an engineer (original toon) unrolls a giant sewer blueprint.
registerShot('s12', { kind: '3d',
  init(T) { const st = studio(T, { fov: 34, bg: ['#cfe0f0', '#a8c4e0', '#6a8ab0'], floor: '#8aa8c8', target: [0, 1.2, 0] }); const b = engineer(); b.position.set(0, 0, -0.6); st.add(b);
    const bp = canvasTex(512, 384, (x, w, h) => { x.fillStyle = '#1e4a8a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d8e8ff'; x.lineWidth = 4; x.beginPath(); x.moveTo(20, 200); x.bezierCurveTo(150, 120, 300, 260, 490, 180); x.stroke(); for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(40 + i * 52, 60); x.lineTo(60 + i * 50, 190 + Math.sin(i) * 20); x.stroke(); } x.font = '900 34px "Nunito", sans-serif'; x.fillStyle = '#d8e8ff'; x.fillText('SEWERS', 30, 350); });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.25), toon('#ffffff', { map: bp, side: THREE.DoubleSide })); paper.position.set(0, 1.15, 0.5); paper.userData.noOutline = true; st.add(paper); return { stage: st, b, paper }; },
  draw(s, t, info) { const k = ease.outBack(clamp(t / 0.4)); s.paper.scale.set(1, Math.max(0.01, k), 1); s.b.pose(addPose({ ...POSE.stand, armL: [1.3, 0.6, 0], armR: [1.3, -0.6, 0], elbowL: 0.3, elbowR: 0.3 }, idle(t, 7))); s.b.face({ ...EXPR.smug, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 6.0], look: [0, 1.9, 0], fov: 36 }], [info.dur, { pos: [0, 2.3, 5.3], look: [0, 1.9, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { popText(g, t, 0.2, 'JOSEPH BAZALGETTE', E.W / 2, 430, 76, { color: '#ffd25a' }); popText(g, t, 0.45, 'engineer', E.W / 2, 520, 52); },
});
// ---- s13: "...built 82 miles of giant sewers." a huge brick tunnel; Victorian workers tiny inside; counter 0 -> 82 MILES.
registerShot('s13', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 44, target: [0, 1, -4], shadowSize: 10, bg: ['#1a1410', '#0e0a08'], ambient: 0.9 }); tunnel(st, { R: 3.4 });
    const ws = [[-1.4, -2], [1.2, -5], [-0.8, -9]].map(([x, z], i) => { const b = mp({ main: '#5a4a3a', seed: 90 + i, hairColor: '#3a2a1a' }); b.position.set(x, 0, z); st.add(b); return b; }); return { stage: st, ws }; },
  draw(s, t, info) { s.ws.forEach((b, i) => { b.pose(walk(t + i * 0.4, { speed: 1.2 })); b.position.z += 0; b.rotation.y = Math.PI; b.face(EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [0, 1.8, 7], look: [0, 2.2, -12], fov: 50 }], [info.dur, { pos: [0, 1.8, 4.6], look: [0, 2.2, -12], fov: 50 }]]); },
  overlay(g, t, info, s) { counter(g, t, at(info, '82', 0.4) - 0.15, 0.6, 0, 82, '', 'MILES of main sewers', { y: 430, size: 170 }); },
});
// ---- s14 (PAYOFF): "London still uses them today." the same brick tunnel today: a sewer worker in hi-vis gives a thumbs-up. TODAY stamp. Cuts to s01.
registerShot('s14', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 40, target: [0, 1, -2], shadowSize: 8, bg: ['#1a1410', '#0e0a08'], ambient: 0.9 }); tunnel(st, { R: 3.4 }); const w = worker(); w.position.set(0.2, 0, 0.5); st.add(w); return { stage: st, w }; },
  draw(s, t, info) { const k = ease.outBack(prog(t, 0.15, 0.4)); s.w.pose(addPose({ ...POSE.stand, armR: [lerp(0.1, 1.3, k), lerp(0, -0.7, k), 0], elbowR: lerp(0.2, 1.5, k) }, idle(t, 3))); s.w.face({ ...EXPR.happy, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 5.6], look: [0.2, 2.0, 0], fov: 38 }], [info.dur, { pos: [0.2, 2.2, 5.0], look: [0.2, 2.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { stamp(g, t - at(info, 'today', 0.7), 'STILL IN USE', { y: 470, size: 100, w: 720, color: '#2f8a3a' }); reactions(g, t, s, [{ fx: 'sparkle', on: 'w', at: 0.3, scale: 0.8 }]); },
});
