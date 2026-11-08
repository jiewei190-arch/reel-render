// s10, s11, s13, s14, s15: the US Army lands, the warships, the admiral says no, the shared island, twelve years.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, toonStage, toon, rbox, cyl } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, point, shake, walk, nod } from '/kits/toon3d/rig.js';
import { cat } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, stageOf, usSoldier, ukSoldier, usOfficer, admiral, musket, holdMusket, PARADE, warship, rowboat, flag, tent, cannon } from './_lib.js';

// s10 "The US Army lands." — a rowboat on the beach; soldiers march up the sand; the officer plants the flag
registerShot('s10', { kind: '3d',
  init(T) { const s = stageOf(T, { target: [0, 0, -2], shadowSize: 9, meadow: { seaZ: -3.2, trees: false } });
    s.boat = rowboat().at(1.4, -0.12, -7.2, 0.5); s.stage.add(s.boat);
    s.ship = warship({ seed: 4 }).at(-7, 0, -30, Math.PI / 2 - 0.3); s.ship.flag.visible = false; s.stage.add(s.ship);
    s.men = [0, 1, 2, 3].map(i => { const b = usSoldier(i); b.m = musket(); s.stage.add(b, b.m); return b; });
    s.off = usOfficer(); s.off.position.set(-0.75, 0, -0.4); s.stage.add(s.off); s.fl = flag('us', { h: 2.8, w: 1.2 }); s.stage.add(s.fl); return s; },
  draw(s, t, info) { s.ship.update(t);
    s.men.forEach((b, i) => { const z = -4.2 + t * 1.5 - i * 1.0; const x = 0.9 + (i % 2) * 0.7; b.position.set(x, 0, z); b.rotation.y = 0; b.pose(addPose(walk(t + i * 0.3, { speed: 1.8 }), { armR: [0.3, 0.2, 0.2], elbowR: 1.1 })); b.face(EXPR.happy, t + i); holdMusket(b, b.m); b.visible = z > -6; });
    const l = at(info, 'lands', 0.8), k = ease.outBack(prog(t, l - 0.15, l + 0.2));
    s.off.pose(addPose(mixPose({ ...POSE.holdFront, armL: [2.6, 0.2, 0], elbowL: 0.3 }, { ...POSE.stand, armL: [1.1, 0.25, 0], elbowL: 0.6, armR: [2.8, 0.4, 0], elbowR: 0.2 }, k), idle(t, 1))); s.off.face(t > l ? EXPR.grin : EXPR.smug, t);
    s.fl.position.set(-1.3, lerp(-2.9, 0, clamp(k)), -0.35); s.fl.update(t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 1.3, 7.6], look: [0, 1.3, -1.0], fov: 40 }], [info.dur, { pos: [-0.1, 1.3, 6.9], look: [0, 1.35, -1.0], fov: 39 }]]); },
});
// s11 "Britain sends warships." — sea level: three frigates glide in from screen right
function seaStage(T) { const st = toonStage(T, { light: 'day', fov: 44, shadowSize: 14, target: [0, 0, -4], bg: ['#9cc4ea', '#e6eef2'] });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), toon('#5f9ac0')); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.1; sea.userData.noOutline = true; st.add(sea);
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(30, 22 + i * 3, 7), toon('#8aa0b8')); c.position.set(-80 + i * 55, 8, -140); c.userData.noOutline = true; st.add(c); const cap = new THREE.Mesh(new THREE.ConeGeometry(9, 8, 7), toon('#f2f2f0')); cap.position.set(-80 + i * 55, 8 + (22 + i * 3) / 2 - 3.6, -140); cap.userData.noOutline = true; st.add(cap); }
  return st; }
registerShot('s11', { kind: '3d',
  init(T) { const st = seaStage(T); const ships = [[0, -2], [5, -10], [11, -18]].map(([dx, z], i) => { const w = warship({ seed: i + 1 }); w.userData.dx = dx; w.position.z = z; w.rotation.y = -Math.PI / 2; st.add(w); return w; }); return { stage: st, ships }; },
  draw(s, t) { s.ships.forEach((w, i) => { w.position.x = 6 + w.userData.dx - ease.out(clamp(t / 1.9)) * (6.5 + i * 1.2); w.update(t + i); });
    s.stage.cam([0, 1.5 + t * 0.15, 11.5], [0, 2.4, -6], 44); },
});
// deck of a frigate (s13): planks, rail, mast, a cannon; the sea beyond
function deckInit(T) { const st = toonStage(T, { light: 'day', fov: 34, shadowSize: 6, target: [0, 0, 0], bg: ['#9cc4ea', '#e6eef2'] });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), toon('#5f9ac0')); sea.rotation.x = -Math.PI / 2; sea.position.y = -3; sea.userData.noOutline = true; st.add(sea);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), PR.texMat(PR.TEX.planks('#b08a5a', [3, 1], 10))); deck.rotation.x = -Math.PI / 2; deck.position.z = -1; deck.receiveShadow = true; deck.userData.noOutline = true; st.add(deck);
  const rail = PR.propGroup(rbox(10, 0.12, 0.16, '#7a5032', 0, 1.1, -3.2, 0.03)); for (let x = -4.5; x <= 4.5; x += 0.9) rail.add(cyl(0.05, 0.05, 1.1, '#7a5032', x, 0.55, -3.2, 6)); st.add(rail); PR.propGroup;
  st.add(PR.propGroup(cyl(0.16, 0.2, 9, '#7a5a3a', -2.4, 4.5, -2.2, 10))); const c = cannon().at(2.3, 0, -1.6, 0.4); st.add(c);
  const far = warship({ seed: 6 }).at(9, -3, -26, -Math.PI / 2); st.add(far); return { stage: st, far }; }
// s13 "But a British admiral refuses to fight over a pig." — eager officer salutes; the admiral raises a hand and shakes his head
registerShot('s13', { kind: '3d',
  init(T) { const s = deckInit(T); s.a = admiral(); s.a.position.set(-0.55, 0, 0.3); s.a.rotation.y = 0.25; s.o = ukSoldier(1); s.o.position.set(1.0, 0, -0.2); s.o.rotation.y = -0.5; s.stage.add(s.a, s.o); return s; },
  draw(s, t, info) { s.far.update(t); const r = at(info, 'refuses', 1.05), k = ease.out(prog(t, r - 0.15, r + 0.25)), f = at(info, 'fight', 1.85);
    s.a.pose(addPose(mixPose(POSE.handsHips, { ...POSE.stand, armR: [1.5, 0.35, -1.2], elbowR: 1.5, armL: [-0.1, 0.6, -1.4], elbowL: 1.8 }, k), { ...idle(t, 1), ...(t > r ? shake(t - r, 0.28, 2.2) : {}) }));
    s.a.face(t > r ? { ...EXPR.deadpan, lid: 0.55, mouth: 'line', browAngle: 0.15 } : EXPR.neutral, t);
    const sag = ease.inOut(prog(t, f, f + 0.4));
    s.o.pose(addPose(mixPose({ ...POSE.attention, armR: [2.9, 0.1, 0], elbowR: 1.4 }, { ...POSE.stand, headNod: 0.25, shrugY: -0.04 }, sag), idle(t, 2))); s.o.face(mixExpr(EXPR.grin, { ...EXPR.sad, lid: 0.6 }, sag), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.0, 7.2], look: [0.2, 1.45, 0], fov: 36 }], [info.dur, { pos: [-0.1, 2.0, 6.2], look: [-0.15, 1.55, 0], fov: 35 }]]); },
});
// the shared camp (s14, s15): a US tent + flag on the left, a British tent + flag on the right, a little table between
function campInit(T, o = {}) { const s = stageOf(T, { target: [0, 0, -1], shadowSize: 8, meadow: { seaZ: -22, treeSpots: [[-5, -7], [5, -8], [-8, -4], [8.5, -4.5], [-2, -10], [2.5, -11]] } });
  const st = s.stage; st.add(tent('#efe8d8').at(-2.3, 0, -2.2, 0.3), tent('#efe8d8').at(2.3, 0, -2.2, -0.3));
  s.fl = [flag('us', { h: 3.2 }).at(-3.6, 0, -2.6, 0.2), flag('uk', { h: 3.2 }).at(3.6, 0, -2.6, Math.PI - 0.2)]; s.fl.forEach(f => st.add(f));
  st.add(PR.table({ w: 1.2, d: 0.8, h: 0.75 }).at(0, 0, 0.2)); s.st = [PR.stool({ h: 0.5 }).at(-0.95, 0, 0.3), PR.stool({ h: 0.5 }).at(0.95, 0, 0.3)]; s.st.forEach(x => st.add(x));
  for (const x of [-0.3, 0.3]) { const cup = PR.propGroup(cyl(0.07, 0.06, 0.12, '#f2ead6', 0, 0.06, 0, 12)); cup.position.set(x, 0.81, 0.25); st.add(cup); }
  st.add(PR.propGroup(cyl(0.11, 0.13, 0.22, '#c0392b', 0, 0.11, 0, 12)).at(0, 0.81, 0.05));
  const a = usSoldier(1, o.old ? { beard: true, beardColor: '#d8d4cc', hairColor: '#d8d4cc', hair: 'long' } : {}); const b = ukSoldier(1, o.old ? { beard: true, beardColor: '#d8d4cc', hairColor: '#d8d4cc', hair: 'long' } : {});
  a.position.set(-0.95, -0.3, 0.3); a.rotation.y = 1.2; b.position.set(0.95, -0.3, 0.3); b.rotation.y = -1.2; st.add(a, b); s.a = a; s.b = b; return s; }
const SIT = { ...POSE.sit, armL: [0.9, 0.2, 0.5], armR: [0.9, 0.2, 0.5], elbowL: 1.0, elbowR: 1.0 };
// s14 "So both armies share the island." — tea time: a US and a British soldier clink cups and wave
registerShot('s14', { kind: '3d',
  init(T) { return campInit(T); },
  draw(s, t, info) { s.fl.forEach((f, i) => f.update(t + i)); const sh = at(info, 'share', 1.2), k = ease.inOut(prog(t, sh - 0.2, sh + 0.2));
    for (const [b, i] of [[s.a, 0], [s.b, 1]]) { b.pose(addPose(mixPose(SIT, { ...SIT, armR: [2.6, 0.5, 0], elbowR: 0.4 + Math.sin(t * 12 + i) * 0.3 }, k), idle(t, i + 1, 0.5))); b.face(EXPR.happy, t + i * 3); }
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 7.6], look: [0, 1.15, -0.6], fov: 38 }], [info.dur, { pos: [0, 2.1, 6.8], look: [0, 1.15, -0.6], fov: 37 }]]); },
});
// s15 "For twelve years." — same camp, same two soldiers, long white beards, bored stiff; BISCUIT asleep on the table
registerShot('s15', { kind: '3d',
  init(T) { const s = campInit(T, { old: true }); s.cat = cat({ scale: 0.5 }); s.cat.position.set(0.0, 0.81, -0.05); s.stage.add(s.cat); return s; },
  draw(s, t) { s.fl.forEach((f, i) => f.update(t * 0.3 + i, 0.4));
    s.a.pose(addPose({ ...POSE.sit, armL: [0.5, 0.15, 0.5], armR: [0.5, 0.15, 0.5], headNod: 0.25, headTilt: 0.15 }, idle(t, 1, 0.4))); s.a.face({ ...EXPR.bored, lid: 0.7 }, t);
    s.b.pose(addPose({ ...POSE.sit, armL: [1.25, 0.2, 0.3], armR: [0.5, 0.15, 0.5], elbowL: 2.3, headTilt: -0.15 }, idle(t, 2, 0.4))); s.b.face({ ...EXPR.deadpan, lid: 0.66, pupil: [0, 0] }, t);
    s.cat.update(t, { lid: 0.98, tail: 0.15 });
    s.stage.cam([0, 1.9, 6.0], [0, 1.15, -0.2], 37); },
  overlay(g, t) { tag(g, '12 YEARS', ease.out(prog(t, 0.1, 0.35))); },
});
