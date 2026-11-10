// yamaguchi: "He survived Hiroshima. Then he went home to Nagasaki." TONE GUARD: calm, sincere. No comedy reactions; the bombs
// are only a distant white light; nobody is shown hurt. FX used: god rays, glow, soft white light, tags, 3 insert cards.
import { E, registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, point } from '/kits/toon3d/rig.js';
import { reactions } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook, godRays } from '/kits/toon3d/sky.js';
import { THREE, at, tag, whiteLight, young, boss, elder, briefcase, street, train, room, blueprintTex, PR, sunnySky, glow, rbox, cyl, floor, outline, toonStage } from './_lib.js';

const CALM = { ...EXPR.neutral, lid: 0.38, mouth: 'line', mouthW: 0.8 };
const SIT = addPose(POSE.sit, { armL: [0.6, 0.1, 0], armR: [0.6, 0.1, 0], elbowL: 0.9, elbowR: 0.9 });
const TRAIN_A = [[0, { pos: [0.6, 2.35, 5.4], look: [-0.7, 2.0, -1.2], fov: 38 }], [4.0, { pos: [0.45, 2.3, 4.7], look: [-0.75, 2.05, -1.2], fov: 37 }]];
function sitTrain(s, t, look = 0.9) { s.update(t); s.sky?.update(t); s.yam.pose(addPose(SIT, { ...idle(t, 2, 0.6), headTurn: look, bob: Math.sin(t * 9) * 0.008 })); s.yam.face({ ...CALM, pupil: [0.6, 0] }, t); }
const trainShot = { init(T) { return train(T, {}); } };

// y01 "He survived Hiroshima. Then he went home to Nagasaki." — frame 1: the young engineer on the train, countryside rolling past
registerShot('y01', { kind: '3d', init: trainShot.init,
  draw(s, t) { sitTrain(s, t, lerp(0.45, -0.25, ease.inOut(prog(t, 1.5, 3)))); camMove(s.stage, t, TRAIN_A); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-80, -40], strength: 0.6 }, tint: '#ffd9a0', tintAmount: 0.16 }); } });

// y02 "Three days later, it happened again." — closer, he looks out; far away on the horizon, a soft white light
registerShot('y02', { kind: '3d',
  init(T) { const s = train(T, {}); s.far = glow(1, '#fffaf0', 0.9); s.far.position.set(-12, 3, -70); s.stage.add(s.far); return s; },
  draw(s, t, info) { sitTrain(s, t + 4, 0.55); const k = ease.inOut(prog(t, 0.6, 2.2)); s.far.scale.setScalar(2 + k * 34); s.far.material.opacity = 0.9 * k;
    camMove(s.stage, t, [[0, { pos: [0.9, 2.5, 2.6], look: [-1.4, 2.3, -2.5], fov: 34 }], [info.dur, { pos: [0.75, 2.45, 2.2], look: [-1.5, 2.35, -2.5], fov: 33 }]]); },
  overlay(g, t) { const k = ease.inOut(prog(t, 0.6, 2.2)); sunnyLook(g, t, { rays: false, tint: '#ffe6c0', tintAmount: 0.18 }); godRays(g, t, { from: [E.W * 0.78, E.H * 0.3], color: '#fffaf0', strength: 0.9 * k }); whiteLight(g, 0.12 * k); } });

// y03 "His name was Tsutomu Yamaguchi," — portrait, name tag
const office = { init(T) { const s = room(T, {}); s.yam = young(); s.yam.position.set(0.4, 0, -1.2); s.stage.add(s.yam);
  const dt = new THREE.Group(); const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.4), [0, 0, new THREE.MeshBasicMaterial({ map: blueprintTex() }), 0, 0, 0].map(m => m || new THREE.MeshToonMaterial({ color: '#8a6a4a' }))); top.position.y = 1.15; top.rotation.x = 0.35; dt.add(top);
  for (const x of [-0.95, 0.95]) dt.add(rbox(0.1, 1.1, 0.1, '#6a4a30', x, 0.55, 0, 0.03)); outline(dt, { px: 2.2 }); dt.position.set(-1.0, 0, -0.6); dt.rotation.y = 0.5; s.stage.add(dt); s.dt = dt;
  s.stage.add(PR.shelf({ w: 1.8, h: 2.4, color: '#6a4a30', seed: 3 }).at(3.2, 0, -3.7)); s.stage.add(PR.plant({}).at(1.9, 0, -3.6)); return s; } };
registerShot('y03', { kind: '3d', init: office.init,
  draw(s, t) { s.yam.pose(addPose(POSE.relaxed, idle(t, 1))); s.yam.face({ ...CALM, lid: 0.3, mouth: 'smile', mouthW: 0.6 }, t); camMove(s.stage, t, [[0, { pos: [0.6, 2.3, 3.4], look: [0.4, 2.05, -1.2], fov: 32 }], [2.5, { pos: [0.6, 2.3, 2.9], look: [0.4, 2.1, -1.2], fov: 31 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-120, -60], strength: 0.5 }, tint: '#ffd9a0', tintAmount: 0.14 }); tag(g, 'TSUTOMU YAMAGUCHI', prog(t, 0.6, 0.9)); } });

// y04 "a ship designer from Nagasaki." — at the drafting table, a ship on the blueprint
registerShot('y04', { kind: '3d', init(T) { const s = office.init(T); s.yam.position.set(-1.0, 0, -1.55); s.yam.rotation.y = 0.5; return s; },
  draw(s, t) { s.yam.pose(addPose({ ...POSE.holdFront, lean: 0.25, headNod: 0.35, armR: [1.0, 0.1, 0.3], elbowR: 0.6 }, { armR: [Math.sin(t * 2) * 0.08, 0, 0] })); s.yam.face({ ...CALM, pupil: [0, -0.7] }, t);
    camMove(s.stage, t, [[0, { pos: [0.8, 3.4, 3.4], look: [-0.9, 1.7, -0.8], fov: 38 }], [2.3, { pos: [0.6, 3.3, 2.9], look: [-0.95, 1.75, -0.8], fov: 37 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-120, -60], strength: 0.5 }, tint: '#ffd9a0', tintAmount: 0.14 }); } });

// y05 "In August 1945," — Hiroshima: a sunny morning street
const city = { init(T) { const s = street(T, {}); s.yam = young(); s.stage.add(s.yam); s.bc = briefcase(); s.yam.hold('R', s.bc); return s; } };
function walking(s, t, z0) { s.yam.pose(walk(t, { speed: 1.5 })); s.yam.face({ ...CALM, pupil: [0, 0] }, t); s.yam.position.set(0.7, 0, z0 + t * 1.1); s.sky.update(t); }
registerShot('y05', { kind: '3d', init: city.init,
  draw(s, t, info) { walking(s, t, -6); camMove(s.stage, t, [[0, { pos: [0, 3.2, 9.5], look: [0, 2.2, -12], fov: 42 }], [info.dur, { pos: [0, 3.0, 8.5], look: [0, 2.1, -12], fov: 42 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' }); tag(g, 'HIROSHIMA · AUGUST 1945', prog(t, 0.2, 0.5)); } });
// y06 "he was in Hiroshima on a business trip." — closer, walking with his briefcase
registerShot('y06', { kind: '3d', init: city.init,
  draw(s, t, info) { walking(s, t + 2.3, -6); const z = s.yam.position.z; camMove(s.stage, t, [[0, { pos: [2.2, 2.2, z + 4.2], look: [0.7, 1.8, z], fov: 36 }], [info.dur, { pos: [2.0, 2.2, z + 3.9], look: [0.7, 1.8, z], fov: 36 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.6 }, tint: '#ffcf8a' }); } });

// y07 "On August 6, the first atomic bomb" — a calm morning; he stops on the street
registerShot('y07', { kind: '3d', init: city.init,
  draw(s, t, info) { const k = ease.out(prog(t, 0, 1.2)); s.yam.pose(mixPose(walk(t, { speed: 1.5 }), addPose(POSE.stand, idle(t)), k)); s.yam.face({ ...CALM, pupil: [0, 0.4] }, t); s.yam.position.set(0.7, 0, -1 + k * 0.8); s.yam.rotation.y = Math.PI * 0.9 * ease.inOut(prog(t, 0.9, 2.0)); s.sky.update(t);
    camMove(s.stage, t, [[0, { pos: [0.4, 1.6, 3.4], look: [0.7, 2.4, -6], fov: 40 }], [info.dur, { pos: [0.4, 1.6, 3.0], look: [0.7, 2.5, -6], fov: 40 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' }); tag(g, 'AUGUST 6, 1945', prog(t, 0.2, 0.5)); } });

// y08 "exploded about 3 km away." — the rooftops from above; far beyond the hills, a white light rises and fills the sky (no people shown)
registerShot('y08', { kind: '3d',
  init(T) { const s = street(T, { seed: 5 }); s.far = glow(1, '#fffaf0', 1); s.far.position.set(10, 4, -88); s.stage.add(s.far); return s; },
  draw(s, t, info) { const x = at(info, 'exploded', 0.04), k = ease.out(prog(t, x, x + 1.2)); s.far.scale.setScalar(4 + k * 120); s.far.material.opacity = Math.min(1, k * 1.4); s.sky.update(t);
    camMove(s.stage, t, [[0, { pos: [-2, 8, 14], look: [2, 3, -60], fov: 40 }], [info.dur, { pos: [-2, 8, 13.4], look: [2, 3.2, -60], fov: 40 }]]); },
  overlay(g, t, info) { const x = at(info, 'exploded', 0.04); sunnyLook(g, t, { rays: false, tint: '#ffcf8a', tintAmount: 0.15 });
    godRays(g, t, { from: [E.W * 0.62, E.H * 0.45], color: '#fffaf0', strength: 1.2 * prog(t, x, x + 0.8) }); whiteLight(g, 0.55 * prog(t, x, x + 0.6) * (1 - 0.6 * prog(t, x + 1.0, info.dur))); } });

// y09 "He was badly burned. But he survived." — quiet dusk: he sits alone on a bench (nothing graphic shown)
registerShot('y09', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'dusk', fov: 38, shadowSize: 8, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 5, seed: 8, top: '#3a3a72', mid: '#c98a8a', horizon: '#f5c08a', sunGlow: '#ffd0a0' });
    st.add(floor(120, 120, '#6a7a5a', 0, -20)); const b = new THREE.Group(); b.add(rbox(2.2, 0.14, 0.7, '#7a5236', 0, 0.9, 0, 0.04), rbox(2.2, 0.5, 0.1, '#7a5236', 0, 1.3, -0.32, 0.04)); for (const x of [-0.9, 0.9]) b.add(rbox(0.12, 0.9, 0.6, '#5a3a22', x, 0.45, 0, 0.03)); outline(b, { px: 2.4 }); st.add(b);
    const y = young(); y.position.set(0.2, 0.13, 0.05); st.add(y); return { stage: st, sky, yam: y }; },
  draw(s, t, info) { s.sky.update(t); const sv = at(info, 'survived.', 1.9); s.yam.pose(addPose(SIT, { ...idle(t, 3, 0.5), headNod: lerp(0.3, 0.05, ease.inOut(prog(t, sv - 0.3, sv + 0.5))) })); s.yam.face({ ...CALM, lid: lerp(0.6, 0.35, prog(t, sv - 0.3, sv + 0.4)), pupil: [0, -0.3] }, t);
    camMove(s.stage, t, [[0, { pos: [-3.2, 1.8, 6.5], look: [0, 1.6, 0], fov: 36 }], [info.dur, { pos: [-2.9, 1.8, 5.8], look: [0, 1.65, 0], fov: 35 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.5, color: '#ffd0a0' }, tint: '#ffb07a', tintAmount: 0.2 }); } });

// y10 "The next day, he went home to Nagasaki." — map card
insertShot('y10', { bg: ['#2a3a4a', '#121820'], insert: { type: 'map', title: 'HOME TO NAGASAKI', lines: ['Nagasaki', 'Hiroshima'], color: '#2a6fd6' } });

// y11 "On August 9, he was at work, telling his boss what he had seen." — the office in Nagasaki
const workRoom = { init(T) { const s = room(T, { winX: -1.2 }); s.yam = young(); s.yam.position.set(0.9, 0, -1.0); s.yam.rotation.y = -0.55; s.bs = boss(); s.bs.position.set(-0.9, 0, -1.4); s.bs.rotation.y = 0.6; s.stage.add(s.yam, s.bs);
  s.stage.add(PR.table({ w: 1.8, d: 0.9, h: 1.0, color: '#7a5236' }).at(-1.9, 0, -2.6), PR.papers({ n: 4, seed: 2, spread: 0.6 }).at(-1.9, 1.07, -2.6), PR.shelf({ w: 1.8, h: 2.4, color: '#6a4a30', seed: 5 }).at(3.4, 0, -3.7)); return s; } };
registerShot('y11', { kind: '3d', init: workRoom.init,
  draw(s, t, info) { s.yam.pose(addPose(point(POSE.relaxed, 'R', 0.4 + 0.2 * Math.sin(t * 2), { up: -0.4 }), idle(t, 1))); s.yam.face({ ...CALM, lid: 0.25, talk: prog(t, 1.2, 1.4) * 0.8, browAngle: -0.25, brow: 0.2 }, t);
    s.bs.pose(addPose(POSE.attention, idle(t, 2))); s.bs.face({ ...EXPR.suspicious, mouth: 'line', pupil: [0.4, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.0], look: [0, 1.9, -1.2], fov: 38 }], [info.dur, { pos: [0, 2.4, 5.4], look: [0, 1.95, -1.2], fov: 36 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-160, -40], strength: 0.5 }, tint: '#ffd9a0', tintAmount: 0.14 }); tag(g, 'NAGASAKI · AUGUST 9', prog(t, 0.3, 0.6)); } });

// y12 "Then the second bomb fell on Nagasaki." — the window fills with white light; both turn toward it; fade to white
registerShot('y12', { kind: '3d', init: workRoom.init,
  draw(s, t, info) { const f = at(info, 'fell', 1.1), k = ease.inOut(prog(t, f - 0.3, f + 0.5));
    s.yam.pose(addPose(POSE.relaxed, { ...idle(t, 1), headTurn: 0.9 * k })); s.yam.face({ ...CALM, lid: lerp(0.25, 0.1, k) }, t); s.bs.pose(addPose(POSE.attention, { ...idle(t, 2), headTurn: 0.5 * k })); s.bs.face({ ...CALM, lid: lerp(0.3, 0.1, k) }, t);
    s.flood.scale.setScalar(2 + k * 30); s.flood.material.opacity = k;
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 5.2], look: [-0.3, 2.0, -1.5], fov: 36 }], [info.dur, { pos: [0.4, 2.4, 4.8], look: [-0.4, 2.1, -1.5], fov: 36 }]]); },
  overlay(g, t, info) { const f = at(info, 'fell', 1.1); godRays(g, t, { from: [E.W * 0.3, E.H * 0.32], color: '#fffaf0', strength: 1.3 * prog(t, f - 0.3, f + 0.3) }); whiteLight(g, ease.in(prog(t, f, info.dur))); } });

// y13 "He survived again." — morning light on a hillside; he stands and looks toward the sun
registerShot('y13', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 8, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 5, seed: 12, horizon: '#ffd8a0', sunGlow: '#fff0d0' }); st.add(floor(160, 160, '#8cb86a', 0, -40));
    const y = young(); y.position.set(0.3, 0, 0); y.rotation.y = 2.6; st.add(y); for (let i = 0; i < 5; i++) { const tr = new THREE.Group(); tr.add(cyl(0.14, 0.18, 1.8, '#6a4a30', 0, 0.9, 0, 6)); const c = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 9), new THREE.MeshToonMaterial({ color: '#4f8a46' })); c.position.y = 2.4; tr.add(c); outline(tr, { px: 2 }); tr.position.set(-9 + i * 4.5, 0, -14 - (i % 2) * 6); st.add(tr); } return { stage: st, sky, yam: y }; },
  draw(s, t, info) { s.sky.update(t); s.yam.pose(addPose(POSE.attention, idle(t, 5))); s.yam.face({ ...CALM, lid: 0.3 }, t); camMove(s.stage, t, [[0, { pos: [1.2, 1.5, 5.2], look: [-0.6, 2.4, -8], fov: 40 }], [info.dur, { pos: [1.0, 1.55, 4.8], look: [-0.6, 2.5, -8], fov: 40 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 1 }, tint: '#ffcf8a' }); } });

// y14 "For decades, his papers only listed Nagasaki." — document card
insertShot('y14', { bg: ['#3a3026', '#16120e'], insert: { type: 'document', title: 'SURVIVOR RECORD', lines: ['T. Yamaguchi', 'Nagasaki: listed', 'Hiroshima: not listed'], highlight: 2, color: '#c9a14a' } });

// y15 "In his later years, he spoke out against nuclear weapons." — Yamaguchi, older, speaking at a lectern
const later = { init(T) { const s = room(T, { winX: 2.6, wall: '#e6dccb' }); s.el = elder(); s.el.position.set(0, 0, -1.4); s.stage.add(s.el);
  const lec = new THREE.Group(); lec.add(rbox(1.2, 1.25, 0.6, '#7a5236', 0, 0.62, 0, 0.05), rbox(1.35, 0.1, 0.75, '#5a3a22', 0, 1.3, 0.04, 0.03)); const mic = cyl(0.03, 0.03, 0.5, '#2a2a30', 0.2, 1.55, 0.1, 6); mic.rotation.x = -0.6; lec.add(mic, cyl(0.06, 0.05, 0.12, '#2a2a30', 0.2, 1.78, -0.05, 10)); outline(lec, { px: 2.4 }); lec.position.set(0, 0, -0.55); s.stage.add(lec); s.lec = lec; return s; } };
registerShot('y15', { kind: '3d', init: later.init,
  draw(s, t, info) { s.el.pose(addPose(point(POSE.relaxed, 'R', 0.35 + 0.15 * Math.sin(t * 1.6), { up: -0.2 }), idle(t, 7))); s.el.face({ ...CALM, lid: 0.3, talk: 0.7, browAngle: -0.15 }, t);
    camMove(s.stage, t, [[0, { pos: [-0.8, 2.3, 4.8], look: [0, 2.0, -1.2], fov: 34 }], [info.dur, { pos: [-0.7, 2.3, 4.2], look: [0, 2.05, -1.2], fov: 33 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [160, -60], strength: 0.5 }, tint: '#ffd9a0', tintAmount: 0.14 }); } });

// y16 "In 2009, at 93," — timeline card
insertShot('y16', { bg: ['#2a3a4a', '#121820'], insert: { type: 'timeline', title: 'OFFICIALLY RECOGNIZED', lines: ['Aug 6, 1945: Hiroshima', 'Aug 9, 1945: Nagasaki', '2009: survivor of both'], highlight: 2, color: '#ffd23a' } });

// y17 "Japan officially recognized him as a survivor of both." — he holds the certificate; a warm glow
const home = { init(T) { const s = room(T, { winX: -2.2, wall: '#e8dcc6' }); s.el = elder(); s.el.position.set(0.2, 0, -1.0); s.stage.add(s.el);
  const cert = new THREE.Group(); cert.add(rbox(0.7, 0.5, 0.03, '#fbf6e8', 0, 0, 0, 0.01)); const seal = cyl(0.07, 0.07, 0.02, '#c0392b', 0.2, -0.12, 0.02, 16); seal.rotation.x = Math.PI / 2; cert.add(seal); outline(cert, { px: 2 }); s.stage.add(cert); s.cert = cert;
  s.stage.add(PR.plant({}).at(1.9, 0, -3.4), PR.shelf({ w: 1.8, h: 2.4, color: '#6a4a30', seed: 7 }).at(3.4, 0, -3.7)); return s; } };
const hv = new THREE.Vector3();
registerShot('y17', { kind: '3d', init: home.init,
  draw(s, t, info) { s.el.pose(addPose({ ...POSE.holdFront, armL: [0.6, 0.12, 0.4], armR: [0.6, 0.12, 0.4], elbowL: 1.0, elbowR: 1.0, headNod: 0.12 }, idle(t, 7))); s.el.face({ ...EXPR.happy, lid: 0.35, lower: 0.35, mouth: 'smile', mouthW: 0.7 }, t);
    s.el.updateMatrixWorld(true); s.el.hand.R.getWorldPosition(hv); const l = new THREE.Vector3(); s.el.hand.L.getWorldPosition(l); s.cert.position.set((hv.x + l.x) / 2, (hv.y + l.y) / 2 + 0.02, (hv.z + l.z) / 2 + 0.08);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 4.4], look: [0.2, 1.75, -1.0], fov: 34 }], [info.dur, { pos: [0.55, 2.2, 3.8], look: [0.2, 1.8, -1.0], fov: 33 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-140, -60], strength: 0.6 }, tint: '#ffd9a0', tintAmount: 0.16 }); reactions(g, t, s, [{ fx: 'glow', on: s.cert.position.toArray(), at: at(info, 'both.', 2.9), scale: 0.8, color: '#ffe6a0' }]); } });

// y18 "The first, and so far only, person to get that recognition." — at the window in the evening light
registerShot('y18', { kind: '3d', init(T) { const s = home.init(T); s.cert.visible = false; s.el.position.set(-1.4, 0, -2.6); s.el.rotation.y = 2.8; return s; },
  draw(s, t, info) { s.el.pose(addPose(POSE.relaxed, { ...idle(t, 8), headTurn: 0.25 })); s.el.face({ ...CALM, lid: 0.35 }, t);
    camMove(s.stage, t, [[0, { pos: [1.4, 2.3, 4.2], look: [-1.6, 2.4, -3.6], fov: 36 }], [info.dur, { pos: [1.1, 2.3, 3.4], look: [-1.7, 2.45, -3.6], fov: 35 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-140, -60], strength: 0.9, color: '#ffd0a0' }, tint: '#ffb87a', tintAmount: 0.2 }); } });

// y19 "Subscribe for more." — back on the train (the frame-1 framing: seamless loop)
registerShot('y19', { kind: '3d', init: trainShot.init,
  draw(s, t, info) { sitTrain(s, t + 50, lerp(-0.1, 0.45, prog(t, 0.3, 1.5))); camMove(s.stage, t, [[0, { pos: [1.0, 2.5, 6.4], look: [-0.7, 2.0, -1.2], fov: 38 }], [info.dur, TRAIN_A[0][1]]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-80, -40], strength: 0.6 }, tint: '#ffd9a0', tintAmount: 0.16 }); } });
