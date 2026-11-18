// The Pig War (1859), BLOCKY look: same script, voice, shot plan and beats as justinclips/shorts/pig-war; only the visual
// style changes. 16 shots. Moods: sunny island (s01-s08) -> tense standoff (s09-s13b) -> golden ending (s14).
// Tone guard: the pig is never shown being shot. "He shot it." (s06) cuts away to birds bursting out of a tree with an
// off-screen BANG; the payoff shows the pig as a cheerful angel. No gun is ever pointed at anyone or anything.
// Timing: shot starts come from lines.json + the voice's word timings (build_short.py); beats inside a shot use at().
import { registerShot, getShot, E } from '/engine/core.js';
import * as B from './_blocky.js';
import { at, antic, popK, tag, stamp, counter, burst, topCaption, grade, SAFE } from './_ui.js';
const { THREE, clamp, lerp, ease, prog, rng, POSE, EXPR, mixPose, mixExpr, addIdle, pointPose, gesture, walkPose, camKeys } = B;

const TOP = ['San Juan Island, 1859:', 'a 12-year standoff'];
const TOP_UNTIL = 3.4;
const CXs = (SAFE.x0 + SAFE.x1) / 2;
const v3 = new THREE.Vector3();
// world point -> logical screen [x, y]
const scr = (st, p) => { v3.copy(p); v3.project(st.camera); return [(v3.x + 1) / 2 * E.W, (1 - v3.y) / 2 * E.H]; };
const headTop = (ch, dy = 0.9) => { const v = new THREE.Vector3(); ch.P.head.getWorldPosition(v); v.y += dy * (ch.scale.y || 1); return v; };
const getInit = (id) => getShot(id).init;

// spinning gold sparkle cubes around a point (3D)
function sparkles(st, n = 8, col = '#ffe07a') { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const b = B.blk(0.08, 0.08, 0.08, B.mat(col, { emissive: col, ei: 1.6, rim: 0 }), 0, 0, 0, 0.01); b.castShadow = false; g.add(b); } st.add(g);
  g.update = (t, c, r = 0.5, k = 1) => { g.position.copy(c); g.children.forEach((b, i) => { const a = t * 2.2 + i * (Math.PI * 2 / n); const ph = (t * 1.3 + i * 0.37) % 1; b.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * r * 0.6 + ph * 0.3, Math.sin(a) * r * 0.6); b.rotation.set(t * 4 + i, t * 3, 0); b.scale.setScalar(k * Math.max(0.01, Math.sin(ph * Math.PI)) * 1.2); }); };
  return g; }
// sweat drops (light-blue blocks) that fall from a head
function sweat(st) { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const d = B.blk(0.07, 0.11, 0.07, B.mat('#9fd8ff', { rough: 0.15, emissive: '#5ab0ff', ei: 0.25 }), 0, 0, 0, 0.02); g.add(d); } st.add(g);
  g.update = (t, head, k) => { g.visible = k > 0; g.children.forEach((d, i) => { const ph = ((t * 1.4 + i * 0.33) % 1); d.position.set(head.x + (i - 1) * 0.28, head.y + 0.55 - ph * 0.7, head.z + 0.2); d.scale.setScalar(k * (1 - ph * 0.5)); }); };
  return g; }
const SKN = B.SKIN;
const army = (st, mk, list, seed, faceY) => list.map(([x, z, s], i) => { const b = mk({ seed: seed + i, skin: SKN[(seed + i * 2) % SKN.length], hair: ['#3a2416', '#6a4426', '#1e1612', '#8a5a2a'][(seed + i) % 4], moustache: (seed + i) % 3 === 1 ? '#3a2416' : null, scale: s || 1 }); b.position.set(x, 0, z); b.rotation.y = faceY; st.add(b); return b; });
const villager = (o = {}) => B.person({ main: o.main || '#8a6a4a', pants: '#4a3a2e', boots: '#2a2020', belt: '#3a2a20', trim: '#e8dcc0', acc: null, ...o });

// =========================================================== standoff set (s01, s02, s13, s13b)
function standoffInit(T, o = {}) {
  const st = B.bstage(T, { mood: o.mood || 'sunny', fov: 50, shadowSize: 12, target: [0, 1, -3], dof: o.dof });
  const env = B.island(st, { seed: 5, seaZ: -13, pines: 10, back: 22, keepClear: [[0, -3, 5.5], [0, 3, 4]], tuftFront: 14, tuftW: 18 });
  const ship = B.warship({ seed: 1 }); ship.position.set(-3, 0, -24); ship.rotation.y = 0.3; st.add(ship);
  const ship2 = B.warship({ seed: 2 }); ship2.position.set(6.5, 0, -36); ship2.rotation.y = -0.25; ship2.scale.setScalar(0.85); st.add(ship2);
  const zs = [1.6, -0.6, -2.8, -5.0, -7.2];
  const reds = army(st, B.redcoat, zs.map((z, i) => [-1.55 - (i % 2) * 0.15, z]), 20, Math.PI / 2 - 0.25);
  const blues = army(st, B.bluecoat, zs.map((z, i) => [1.55 + (i % 2) * 0.15, z]), 30, -Math.PI / 2 + 0.25);
  const pg = B.pig({ potato: true, seed: 3 }); st.add(pg);
  const fu = B.flag('uk', { h: 4.2 }); fu.position.set(-2.6, 0, -9.2); st.add(fu);
  const fs = B.flag('us', { h: 4.2 }); fs.position.set(1.6, 0, -9.2); st.add(fs);
  // foreground layer: rocks + tall tufts at the bottom corners
  const fg = new THREE.Group(); st.add(fg); const r = rng(77);
  const rk = B.rock(r, 1.1); rk.position.set(-1.25, 0, 4.3); fg.add(rk); const rk2 = B.rock(r, 0.8); rk2.position.set(1.35, 0, 4.0); fg.add(rk2);
  for (let i = 0; i < 18; i++) { const x = (i % 2 ? 1 : -1) * (0.7 + r() * 1.0), z = 3.4 + r() * 1.6; fg.add(B.blk(0.1, 0.3 + r() * 0.35, 0.1, i % 3 ? '#4f8f37' : '#7db64e', x, 0.2, z, 0.02)); }
  return { stage: st, env, ships: [ship, ship2], reds, blues, pig: pg, fu, fs, fg };
}
const setUpdate = (s, t) => { s.env.update(t); s.ships.forEach(w => w.update(t)); s.fu.update(t); s.fs.update(t); };
function armies(s, t, eR = EXPR.glare, eB = EXPR.angry, o = {}) {
  const P = (i, side, ph) => i === 0 && o.point ? pointPose(POSE.attn, side, 1, -0.25 + Math.sin(t * 7 + ph) * 0.06) : (i === 1 && o.fist ? gesture(POSE.attn, t + ph, side === 'R' ? 'L' : 'R', 1, 0.42) : POSE.attn);
  s.reds.forEach((b, i) => b.update(t + i * 0.7, { ...P(i, 'R', 0), headX: 0.12 + (o.headX || 0) }, { ...eR, look: o.look ? [0.4, -0.4] : eR.look }));
  s.blues.forEach((b, i) => b.update(t + i * 0.9 + 0.3, { ...P(i, 'L', 1), headX: 0.12 + (o.headX || 0) }, { ...eB, look: o.look ? [-0.4, -0.4] : eB.look }));
}

// ---- s01 (FRAME 1, the hook): the pig trots between the two glaring armies, munching a potato; warships rock in the bay.
registerShot('s01', { kind: '3d',
  init: (T) => standoffInit(T),
  draw(s, t, info) {
    const T0 = t + 0.4; setUpdate(s, T0); armies(s, T0, EXPR.glare, EXPR.angry, { point: true, fist: true, look: true });
    s.pig.position.set(0.05 + Math.sin(T0 * 1.5) * 0.12, 0, 0.7 + 0.6 * T0); s.pig.rotation.y = 0.32 + Math.cos(T0 * 1.5) * 0.12; s.pig.update(T0, { walk: 1, speed: 3.2, chew: 1, headNod: Math.sin(T0 * 12) * 0.06, expr: { smile: 0.7, lid: 0.3, look: [0.3, 0.2] } });
    camKeys(s.stage, t, [[0, { pos: [0, 1.4, 6.9], look: [0, 1.35, -3], fov: 52 }], [info.dur, { pos: [0.1, 1.3, 6.3], look: [0.05, 1.3, -3], fov: 51 }]], { drift: 0.02 });
  },
  overlay(g, t, info, s) { grade(g, 'sunny', t); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s02: "...over a pig." close on the pig, chewing, looking up at one army, then the other. A "?" pops over it.
registerShot('s02', { kind: '3d',
  init: (T) => standoffInit(T, { dof: { focus: 3.2, aperture: 0.004, maxblur: 0.009 } }),
  draw(s, t, info) {
    setUpdate(s, t); armies(s, t, EXPR.glare, EXPR.glare, { look: true, headX: 0.1 });
    s.pig.position.set(0, 0, 1.2); s.pig.rotation.y = 0.18;
    const lk = t < 0.55 ? -0.9 : t < 0.75 ? lerp(-0.9, 0.9, ease.inOut((t - 0.55) / 0.2)) : 0.9;
    s.pig.update(t, { chew: 1, headTurn: -lk * 0.22, headNod: -0.12, expr: { smile: 0.5, lid: 0.15, look: [lk, 0.6], browY: 0.6, brow: -0.3 } });
    camKeys(s.stage, t, [[0, { pos: [0.1, 1.25, 5.6], look: [0, 0.95, -0.5], fov: 44 }], [info.dur, { pos: [0.05, 1.2, 5.1], look: [0, 0.95, -0.5], fov: 43 }]], { drift: 0.015 });
    s.stage.focusOn(new THREE.Vector3(0, 0.9, 1.9));
  },
  overlay(g, t, info, s) { grade(g, 'sunny', t); const [x, y] = scr(s.stage, new THREE.Vector3(0.3, 1.75, 1.7)); tag(g, t, 0.25, '?', Math.min(x + 170, 840), Math.max(y + 40, 600), 86, { box: '#f08a3a', rot: 0.1 }); topCaption(g, t, info, TOP, TOP_UNTIL); },
});

// =========================================================== aerial island (s03, s03b)
function islandAerial(T) {
  const st = B.bstage(T, { mood: 'sunny', fov: 50, shadowSize: 12, target: [0, 0, 0], fogNear: 40, fogFar: 140 });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), B.mat('#2f86c4', { rough: 0.22, rim: 0.2 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.5; sea.receiveShadow = true; st.add(sea);
  const isl = new THREE.Group(); st.add(isl);
  isl.add(B.blk(12.6, 0.7, 13.2, '#e8d39c', 0, -0.25, 0, 0.25)); isl.add(B.blk(11.4, 0.6, 12.0, '#57953d', 0, 0.2, 0, 0.18)); isl.add(B.blk(6.2, 0.7, 5.0, '#62a046', -1.4, 0.75, -2.4, 0.15)); isl.add(B.blk(3.2, 0.7, 2.6, '#6aaa4c', -1.8, 1.3, -2.8, 0.12));
  isl.add(B.blk(3.6, 0.5, 2.2, '#e8d39c', 6.4, -0.3, 2.4, 0.15)); isl.add(B.blk(2.4, 0.4, 3.0, '#e8d39c', -6.6, -0.3, -2.6, 0.12));
  const r = rng(4); const spots = [[-3.6, -4.6], [-0.8, -4.9], [1.6, -4.2], [-4.5, -1.6], [-2.6, -3.4], [-0.6, -2.6], [2.6, -0.6], [-4.4, 1.4], [0.6, 0.6], [4.4, -4.6], [-1.8, 4.6], [4.6, 1.6]];
  spots.forEach(([x, z]) => { const onHill = x > -4.5 && x < 1.7 && z < 0.1 && z > -4.9; const top = x > -3.4 && x < -0.2 && z < -1.5 && z > -4.1; const p = B.pine(r, { s: 0.42 + r() * 0.18 }); p.position.set(x, top ? 1.65 : onHill ? 1.1 : 0.5, z); isl.add(p); });
  const cb = B.cabin(); cb.scale.setScalar(0.34); cb.position.set(1.6, 0.5, 2.6); cb.rotation.y = -0.3; isl.add(cb);
  const pp = B.potatoPatch({ rows: 2, cols: 4 }); pp.scale.setScalar(0.34); pp.position.set(3.2, 0.5, 3.6); isl.add(pp);
  const fu = B.flag('uk', { h: 3.4 }); fu.position.set(-4.0, 0.5, 4.1); isl.add(fu);
  const fs = B.flag('us', { h: 3.4 }); fs.position.set(3.6, 0.5, -3.0); isl.add(fs);
  const rc = B.redcoat({ seed: 51, scale: 0.45 }); rc.position.set(-3.3, 0.5, 4.5); rc.rotation.y = 0.5; isl.add(rc);
  const bc = B.bluecoat({ seed: 52, scale: 0.45 }); bc.position.set(4.3, 0.5, -2.6); bc.rotation.y = -0.3; isl.add(bc);
  const ships = [B.warship({ seed: 3 }), B.warship({ seed: 4 })]; ships[0].position.set(-9.5, -0.5, 4); ships[0].scale.setScalar(0.45); ships[0].rotation.y = 0.4; ships[1].position.set(5, -0.5, -12); ships[1].scale.setScalar(0.45); ships[1].rotation.y = Math.PI - 0.3; ships.forEach(w => st.add(w));
  const caps = []; for (let i = 0; i < 46; i++) { const c = B.blk(0.8 + r() * 1.2, 0.06, 0.22, '#eaf6fb', (r() - 0.5) * 50, -0.47, (r() - 0.5) * 50, 0.02); c.castShadow = false; if (Math.abs(c.position.x) < 7.5 && Math.abs(c.position.z) < 7.5) c.position.x += c.position.x < 0 ? -9 : 9; st.add(c); caps.push([c, c.position.x]); }
  const clouds = [0, 1, 2].map(i => { const c = B.cloud(r, 0.7); c.position.set(-12 + i * 12, 9 + i, -16 - i * 6); c.traverse(m => { m.castShadow = false; }); st.add(c); return [c, c.position.x]; });
  return { stage: st, fu, fs, rc, bc, ships, caps, clouds };
}
const aerialUpdate = (s, t) => { s.fu.update(t); s.fs.update(t); s.ships.forEach(w => w.update(t)); s.caps.forEach(([c, x], i) => { c.position.x = x + Math.sin(t * 0.7 + i) * 0.4; }); s.clouds.forEach(([c, x]) => { c.position.x = x + t * 0.6; }); s.rc.update(t, POSE.attn, EXPR.glare); s.bc.update(t + 1, POSE.attn, EXPR.glare); };
registerShot('s03', { kind: '3d',
  init: islandAerial,
  draw(s, t, info) { aerialUpdate(s, t); camKeys(s.stage, t, [[0, { pos: [0, 19, 17.5], look: [0, 0, -0.6], fov: 50 }], [info.dur, { pos: [0.4, 16.5, 15], look: [0, 0.2, -0.6], fov: 49 }]]); },
  overlay(g, t, info, s) { grade(g, 'sunny', t); stamp(g, t - at(info, '1859', 0.1), '1859', { y: 400, size: 110, color: '#c8322a', rot: -0.08 }); tag(g, t, 0.35, 'SAN JUAN ISLAND', CXs, 1470, 60, { box: '#2f7a44' }); },
});
registerShot('s03b', { kind: '3d',
  init: (T) => getInit('s03')(T),
  draw(s, t, info) { aerialUpdate(s, t + 2); camKeys(s.stage, t, [[0, { pos: [-3.2, 3.6, 10.6], look: [-4.0, 2.2, 4.1], fov: 46 }], [info.dur, { pos: [4.6, 4.8, 3.2], look: [3.6, 2.4, -3.0], fov: 46 }]], { fn: ease.sine }); },
  overlay(g, t, info, s) { grade(g, 'sunny', t); tag(g, t, at(info, 'claimed', 0.6) - 0.1, 'BOTH CLAIMED IT', CXs, 600, 66, { box: '#2d58a6' }); },
});

// =========================================================== the garden (s04, s05)
function gardenInit(T, o = {}) {
  const st = B.bstage(T, { mood: 'sunny', fov: 42, shadowSize: 11, target: [0, 1, -2], dof: o.dof });
  const env = B.island(st, { seed: 7, seaZ: -17, pines: 9, back: 16, keepClear: [[0, -2, 7]] });
  const cb = B.cabin(); cb.position.set(-2.8, 0, -7.0); cb.rotation.y = 0.35; st.add(cb);
  const patch = B.potatoPatch({ rows: 4, cols: 6 }); patch.position.set(0.8, 0, -0.4); st.add(patch);
  const pg = B.pig({ seed: 4 }); pg.position.set(1.0, 0, 0.6); pg.rotation.y = -0.7; st.add(pg);
  const f = B.farmer(); f.position.set(-2.3, 0, -3.6); st.add(f);
  const pts = [0, 1, 2].map(i => { const p = B.potato(); st.add(p); return p; });
  // foreground fence
  const fence = new THREE.Group(); st.add(fence); for (let i = 0; i < 7; i++) fence.add(B.blk(0.18, 1.0, 0.18, '#8a6a46', -3 + i * 1.2, 0.5, 4.0, 0.03)); for (const y of [0.4, 0.8]) fence.add(B.blk(7.6, 0.12, 0.08, '#9a7a52', 0.6, y, 4.0, 0.02));
  // background villagers chatting by the shore
  const vs = [villager({ seed: 61, main: '#8a6a4a', skin: SKN[2] }), villager({ seed: 62, main: '#6a7a8a', skin: SKN[3], hair: '#2a1a12' })]; vs[0].position.set(5.2, 0, -11); vs[0].rotation.y = 0.9; vs[1].position.set(6.6, 0, -11.2); vs[1].rotation.y = -0.9; vs.forEach(v => st.add(v));
  return { stage: st, env, pig: pg, f, pts, vs, fence };
}
const gardenBg = (s, t) => { s.env.update(t); s.vs[0].update(t, gesture(POSE.stand, t, 'L', 1, 0.5), EXPR.happy); s.vs[1].update(t + 1, POSE.hips, EXPR.happy); };
registerShot('s04', { kind: '3d',
  init: (T) => gardenInit(T),
  draw(s, t, info) {
    gardenBg(s, t);
    s.pig.position.x = 1.0 + Math.sin(t * 2.2) * 0.18; s.pig.update(t, { headNod: 0.35 + Math.sin(t * 13) * 0.14, headTurn: Math.sin(t * 2.2) * 0.35, tailSpeed: 14, expr: { smile: 1, lid: 0.25, open: 0.3 } });
    s.pts.forEach((p, i) => { const ph = ((t * 1.3 + i * 0.33) % 1); p.position.set(1.0 + Math.cos(i * 2.1) * (0.4 + ph * 1.2), 0.3 + Math.sin(ph * Math.PI) * 1.4, 1.3 + Math.sin(i * 2.1) * ph * 0.8); p.rotation.set(t * 8 + i, t * 6, 0); });
    const tg = at(info, 'garden', 1.6); const k = antic(t, tg - 0.25, 0.14, 0.3);
    s.f.position.z = -3.6 + clamp(k, 0, 1.1) * 0.9; const pz = mixPose(walkPose(t * (k > 0 && k < 1 ? 1 : 0), { amp: 0.3 }), POSE.hips, clamp(k));
    s.f.update(t, k > 0.6 ? pointPose(POSE.hips, 'R', clamp((t - tg) / 0.2), -0.2) : pz, mixExpr(EXPR.neutral, EXPR.angry, clamp(k))); s.f.rotation.y = 0.55;
    camKeys(s.stage, t, [[0, { pos: [2.3, 2.5, 8.4], look: [-0.3, 1.0, -1.5], fov: 42 }], [info.dur, { pos: [1.9, 2.3, 7.4], look: [-0.4, 1.1, -1.5], fov: 41 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'sunny', t); tag(g, t, 0.15, "British company's pig", CXs, 520, 58, { box: '#c4322b' }); const tg = at(info, 'garden', 1.6); const [x, y] = scr(s.stage, headTop(s.f, 1.1)); tag(g, t, tg, '!', x, y - 30, 90, { box: '#f08a3a' }); },
});
// ---- s05: "He shot it." the farmer, close, deadpan, rifle held upright (pointed at the sky, at nothing).
registerShot('s05', { kind: '3d',
  init(T) { const s = gardenInit(T, { dof: { focus: 5.5, aperture: 0.003, maxblur: 0.008 } }); s.rf = B.rifle(); s.stage.add(s.rf); s.f.position.set(-2.3, 0, -2.7); s.pig.visible = false; s.pts.forEach(p => { p.visible = false; }); return s; },
  draw(s, t, info) {
    gardenBg(s, t); s.f.rotation.y = 0.3;
    const p = { ...POSE.stand, armR: [0.75, 0.05], elbowR: 1.55, armL: [0.55, -0.05], elbowL: 1.45, headX: -0.03 };
    s.f.update(t, p, { ...EXPR.deadpan, look: [0.15, 0] }, { idle: 0.6 });
    const h = B.handPos(s.f, 'R'); s.rf.position.set(h.x + 0.05, h.y + 0.35, h.z + 0.1); s.rf.rotation.set(0, 0, 0.12);
    camKeys(s.stage, t, [[0, { pos: [-0.65, 2.15, 2.6], look: [-2.3, 1.95, -2.7], fov: 40 }], [info.dur, { pos: [-0.75, 2.15, 2.15], look: [-2.3, 1.95, -2.7], fov: 39 }]], { drift: 0.01 });
    s.stage.focusOn(B.headPos(s.f));
  },
  overlay(g, t, info, s) { grade(g, 'sunny', t); },
});

// =========================================================== s06: cut-away (the pig is NOT shown)
registerShot('s06', { kind: '3d',
  init(T) {
    const st = B.bstage(T, { mood: 'sunny', fov: 44, shadowSize: 10, target: [0, 2, 0] }); const env = B.island(st, { seed: 9, seaZ: -26, pines: 6, keepClear: [[0, 0, 6]], back: 14 });
    const tr = B.oak(rng(3), { s: 1.35 }); st.add(tr); const tr2 = B.oak(rng(8), { s: 0.9 }); tr2.position.set(-4.5, 0, -6); st.add(tr2); const tr3 = B.pine(rng(9), { s: 1.3 }); tr3.position.set(4.2, 0, -5); st.add(tr3);
    const birds = [...Array(9)].map((_, i) => { const b = B.bird({ seed: i }); b.scale.setScalar(0.95); st.add(b); return b; });
    const leaves = [...Array(10)].map((_, i) => { const l = B.blk(0.12, 0.04, 0.12, i % 2 ? '#5aa84c' : '#4f9a44', 0, 0, 0, 0.01); st.add(l); return l; });
    const fg = new THREE.Group(); st.add(fg); const r = rng(5); for (let i = 0; i < 16; i++) fg.add(B.blk(0.14, 0.5 + r() * 0.5, 0.14, i % 3 ? '#4f8f37' : '#7db64e', (i % 2 ? 1 : -1) * (1 + r() * 2.2), 0.3, 5.5 + r() * 1.5, 0.02));
    return { stage: st, env, tr, birds, leaves };
  },
  draw(s, t, info) {
    s.env.update(t); const tb = at(info, 'shot', 0.06);
    s.birds.forEach((b, i) => { const k = Math.max(0, t - tb); const a = (i / 9) * Math.PI - Math.PI * 0.05; b.position.set(Math.cos(a) * (0.8 + k * 4.2), 4.3 + (i % 3) * 0.4 + k * (2.6 + i * 0.35), Math.sin(a) * 0.8 + 0.6 + k * 0.6); b.rotation.y = Math.cos(a) > 0 ? Math.PI / 2 : -Math.PI / 2; b.rotation.z = (Math.cos(a) > 0 ? -1 : 1) * 0.3 * clamp(k * 3); b.update(t, { flap: k > 0 ? 1 : 0.1, rate: 24 }); });
    s.leaves.forEach((l, i) => { const k = Math.max(0, t - tb); l.visible = k > 0; l.position.set(Math.cos(i * 1.7) * (1 + k * 1.2), 4.6 + Math.sin(i) * 0.6 - k * 1.6 + Math.sin(k * 6 + i) * 0.1, Math.sin(i * 1.7) + 0.8); l.rotation.set(k * 5 + i, k * 3, k * 4); });
    s.tr.rotation.z = t > tb ? Math.sin((t - tb) * 32) * 0.035 * Math.max(0, 1 - (t - tb) * 2) : 0;
    const sh = t > tb ? Math.max(0, 1 - (t - tb) / 0.35) * 0.08 : 0;
    camKeys(s.stage, t, [[0, { pos: [0 + Math.sin(t * 70) * sh, 2.2 + Math.cos(t * 60) * sh, 10.5], look: [0, 4.6, 0], fov: 50 }], [info.dur, { pos: [0, 2.3, 11.0], look: [0, 5.0, 0], fov: 52 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'sunny', t); const tb = at(info, 'shot', 0.06); burst(g, t - tb, { text: 'BANG!', y: 640, r: 230, until: 0.85, size: 120 }); },
});

// =========================================================== the deal (s07, s08, s09)
function dealInit(T, o = {}) {
  const st = B.bstage(T, { mood: o.mood || 'sunny', fov: 38, shadowSize: 9, target: [0, 1, -1], dof: o.dof });
  const env = B.island(st, { seed: 11, seaZ: -19, pines: 9, back: 14, keepClear: [[0, -2, 6.5]] });
  const cb = B.cabin(); cb.position.set(1.8, 0, -7.2); cb.rotation.y = -0.25; st.add(cb);
  const patch = B.potatoPatch({ rows: 2, cols: 4 }); patch.position.set(-3.4, 0, -4.2); st.add(patch);
  const f = B.farmer(); f.position.set(-0.68, 0, 0.5); f.rotation.y = 0.8; st.add(f);
  const off = B.official(); off.position.set(0.68, 0, 0.5); off.rotation.y = -0.8; st.add(off);
  const cn = B.coin(); st.add(cn); const spk = sparkles(st, 8);
  // background: two redcoat sentries by the shore + a company clerk
  const sent = army(st, B.redcoat, [[4.6, -6.5], [5.6, -7.6]], 80, -0.4);
  const clerk = villager({ seed: 85, main: '#5a5468', skin: SKN[4], hair: '#a89880' }); clerk.position.set(-4.6, 0, -8.5); clerk.rotation.y = 0.5; st.add(clerk);
  const fg = new THREE.Group(); st.add(fg); const r = rng(12); for (let i = 0; i < 10; i++) { const pl = B.blk(0.22, 0.12, 0.3, i % 2 ? '#4f9a44' : '#5eae4e', (i % 2 ? 1 : -1) * (1.4 + r() * 1.2), 0.25 + r() * 0.2, 3.4 + r() * 1.2, 0.03); pl.rotation.set(0.4, r() * 3, 0.3); fg.add(pl); }
  return { stage: st, env, f, off, cn, spk, sent, clerk, fg };
}
const dealBg = (s, t, eS = EXPR.neutral) => { s.env.update(t); s.sent.forEach((b, i) => b.update(t + i, POSE.attn, eS)); s.clerk.update(t, gesture(POSE.stand, t, 'L', 0.6, 0.7), EXPR.neutral); };
// ---- s07: "He offered 10 dollars." the farmer holds out one coin; the company man eyes it.
registerShot('s07', { kind: '3d',
  init: (T) => dealInit(T),
  draw(s, t, info) {
    dealBg(s, t); const k = antic(t, 0.25, 0.14, 0.32);
    const offer = mixPose(POSE.stand, { ...POSE.stand, armR: [1.25, 0.05], elbowR: 0.35, lean: 0.06 }, k);
    s.f.update(t, gesture(offer, t, 'L', clamp((t - 0.6) / 0.3), 0.45), mixExpr(EXPR.neutral, EXPR.smug, clamp(k)));
    s.off.update(t, POSE.hips, { ...EXPR.suspicious, look: [-0.3, -0.5] });
    const h = B.handPos(s.f, 'R'); s.cn.position.set(h.x, h.y + 0.16, h.z); s.cn.rotation.y = t * 5; const tc = at(info, '10', 0.6); s.spk.update(t, s.cn.position, 0.35, clamp((t - tc) / 0.2));
    camKeys(s.stage, t, [[0, { pos: [0, 2.1, 7.9], look: [0, 1.75, 0.4], fov: 38 }], [info.dur, { pos: [0.15, 2.05, 7.1], look: [0, 1.75, 0.4], fov: 37 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'sunny', t); const tc = at(info, '10', 0.6); stamp(g, t - tc, '$10', { y: 520, color: '#2f8a3a', size: 140 }); },
});
// ---- s08: "The British wanted 100." the company man flings up a hand (anticipation + overshoot); the farmer's jaw drops.
registerShot('s08', { kind: '3d',
  init: (T) => dealInit(T, { dof: { focus: 4.5, aperture: 0.002, maxblur: 0.006 } }),
  draw(s, t, info) {
    dealBg(s, t); s.cn.visible = false; s.spk.visible = false; const tc = at(info, '100', 0.6); const k = antic(t, tc - 0.12, 0.16, 0.3, 0.3);
    s.off.update(t, mixPose(POSE.hips, { ...POSE.stand, armL: [2.75, 0.15], elbowL: 0.15, armR: [0.2, 0.4], elbowR: 1.2, lean: -0.06, headX: -0.08 }, k), mixExpr(EXPR.suspicious, EXPR.smug, clamp(k)));
    const kf = clamp(antic(t, tc + 0.05, 0.1, 0.25));
    s.f.update(t, mixPose(POSE.stand, { ...POSE.shrug, lean: -0.1, headX: -0.06 }, kf), mixExpr(EXPR.neutral, EXPR.shocked, kf));
    camKeys(s.stage, t, [[0, { pos: [-0.35, 2.3, 7.0], look: [-0.05, 2.1, 0.4], fov: 38 }], [info.dur, { pos: [-0.3, 2.3, 6.4], look: [-0.05, 2.15, 0.4], fov: 37 }]]);
    s.stage.focusOn(B.headPos(s.off));
  },
  overlay(g, t, info, s) { grade(g, 'sunny', t); const tc = at(info, '100', 0.6); stamp(g, t - tc, '$100', { y: 430, size: 130 }); const [x, y] = scr(s.stage, headTop(s.f, 1.05)); tag(g, t, tc + 0.1, '!', clamp(x, 140, 900), y, 90, { box: '#f08a3a' }); },
});
// ---- s09: "Britain threatened to arrest him..." TENSE. Opens close on a redcoat, pulls back as the company man points;
//      ARREST HIM; the farmer sweats.
registerShot('s09', { kind: '3d',
  init(T) {
    const s = dealInit(T, { mood: 'tense' });
    s.rc = army(s.stage, B.redcoat, [[1.75, 1.7], [2.4, -0.7]], 70, -1.15); s.sw = sweat(s.stage);
    s.cn.visible = false; s.spk.visible = false; return s;
  },
  draw(s, t, info) {
    dealBg(s, t, EXPR.glare); const ta = at(info, 'arrest', 0.8); const k = antic(t, ta - 0.25, 0.14, 0.32);
    s.off.update(t, pointPose(POSE.stand, 'R', clamp(k, 0, 1.1), 0.05), EXPR.angry);
    s.f.update(t, mixPose(POSE.stand, POSE.panic, clamp(k) * 0.7), mixExpr(EXPR.neutral, EXPR.worried, clamp(k)));
    s.rc[0].rotation.y = lerp(-0.45, -1.15, ease.inOut(clamp((t - 0.35) / 0.6)));
    s.rc.forEach((b, i) => b.update(t + i, i === 0 ? { ...POSE.attn, lean: 0.06 * clamp(k), headY: -0.15 } : POSE.attn, { ...EXPR.glare, look: [-0.5, 0] }));
    s.sw.update(t, B.headPos(s.f), clamp((t - ta) / 0.3));
    camKeys(s.stage, t, [[0, { pos: [0.95, 2.5, 6.4], look: [1.7, 2.05, 1.7], fov: 38 }], [0.35, { pos: [0.9, 2.5, 6.2], look: [1.65, 2.05, 1.6], fov: 38 }], [Math.max(0.9, ta - 0.1), { pos: [0.3, 2.45, 9.2], look: [0.4, 1.8, 0.2], fov: 40 }], [info.dur, { pos: [0.3, 2.45, 8.8], look: [0.4, 1.8, 0.2], fov: 40 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'tense', t); stamp(g, t - at(info, 'arrest', 0.8), 'ARREST HIM', { y: 470, size: 112 }); },
});

// =========================================================== s10: the landing (TENSE)
registerShot('s10', { kind: '3d',
  init(T) {
    const st = B.bstage(T, { mood: 'tense', fov: 44, shadowSize: 12, target: [0, 1, -3] }); const env = B.island(st, { seed: 13, seaZ: -3, pines: 6, back: 14, keepClear: [[0, 0, 7]] });
    const L = [...Array(8)].map((_, i) => { const b = B.bluecoat({ seed: 90 + i, skin: SKN[(i * 2 + 1) % SKN.length] }); b.home = [((i % 2) - 0.5) * 1.15 - 0.4, -6.2 - Math.floor(i / 2) * 1.35]; b.ph = i * 0.21; st.add(b); return b; });
    const hero = B.bluecoat({ seed: 99, skin: SKN[2], moustache: '#2a1a12' }); st.add(hero);
    const fs = B.flag('us', { h: 3.0 }); st.add(fs);
    const boats = [[-2.6, -8.5, 0.3], [1.8, -9.5, -0.2], [-0.4, -13, 0.1]].map(([x, z, ry]) => { const b = B.rowboat(); b.position.set(x, -0.35, z); b.rotation.y = ry; st.add(b); return b; });
    const ship = B.warship({ seed: 5 }); ship.position.set(8, 0, -30); ship.rotation.y = Math.PI - 0.2; st.add(ship);
    return { stage: st, env, L, hero, fs, boats, ship };
  },
  draw(s, t, info) {
    s.env.update(t); s.ship.update(t);
    s.L.forEach((b, i) => { const z = b.home[1] + 2.0 * t + 4.2; b.position.set(b.home[0], z < -3.3 ? -0.28 : z < -2.6 ? lerp(-0.28, 0, (z + 3.3) / 0.7) : 0, z); b.update(t + b.ph, walkPose(t + b.ph, { speed: 2, amp: 0.5 }), EXPR.deadpan, { idle: 0.3 }); });
    s.boats.forEach((b, i) => { b.position.y = -0.35 + Math.sin(t * 1.6 + i) * 0.05; b.rotation.z = Math.sin(t * 1.3 + i) * 0.04; });
    // hero flag bearer passes close to camera, right side; at "soldiers" he plants the flag (anticipation + overshoot)
    const ts = at(info, 'soldiers', 1.0); const k = antic(t, ts - 0.1, 0.16, 0.3);
    const hz = Math.min(-2.2 + 1.6 * t, -2.2 + 1.6 * (ts - 0.1));
    s.hero.position.set(1.05, 0, hz); s.hero.rotation.y = -0.15;
    s.hero.update(t, k > 0 ? { ...POSE.attn, armR: [lerp(1.1, 2.5, clamp(k, 0, 1.1)), 0.1], elbowR: 0.4, lean: -0.04 } : { ...walkPose(t, { speed: 1.6, amp: 0.45 }), armR: [1.1, 0.1], elbowR: 0.4 }, k > 0.3 ? EXPR.glare : EXPR.deadpan);
    const h = B.handPos(s.hero, 'R'); s.fs.position.set(h.x, h.y - 1.6, h.z); s.fs.rotation.y = 0.75; s.fs.update(t);
    camKeys(s.stage, t, [[0, { pos: [2.3, 1.6, 5.6], look: [0.2, 2.0, -3], fov: 46 }], [info.dur, { pos: [2.0, 1.65, 6.1], look: [0.2, 2.1, -2], fov: 46 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'tense', t); tag(g, t, at(info, 'soldiers', 1.0), 'U.S. ARMY LANDS', CXs, 470, 64, { box: '#2d58a6' }); },
});

// =========================================================== s11: the hilltop camp (opens close on a bluecoat, pulls back)
registerShot('s11', { kind: '3d',
  init(T) {
    const st = B.bstage(T, { mood: 'tense', fov: 46, shadowSize: 13, target: [0, 1, -2] }); const env = B.island(st, { seed: 15, seaZ: -26, pines: 10, back: 14, keepClear: [[0, -2, 8]] });
    const L = []; for (let i = 0; i < 12; i++) { const b = B.bluecoat({ seed: 120 + i, skin: SKN[(i * 3) % SKN.length], moustache: i % 4 === 1 ? '#2a1a12' : null }); b.position.set(((i % 4) - 1.5) * 1.25, 0, 1.2 - Math.floor(i / 4) * 1.5); st.add(b); L.push(b); }
    const hero = L[1]; hero.position.x = -0.1;
    const cs = [[-3.6, 1.6], [3.6, 1.6], [-3.2, -2.6], [3.2, -2.6]].map(([x, z]) => { const c = B.cannon(); c.position.set(x, 0, z); c.rotation.y = 0.0; st.add(c); return c; });
    const tents = [[-2.5, -6], [0.5, -6.8], [3.4, -6.2]].map(([x, z]) => { const g = new THREE.Group(); for (const sd of [-1, 1]) { const p = B.blk(2.0, 0.08, 1.7, '#e8e0cc', sd * 0.55, 0.75, 0, 0.02); p.rotation.z = sd * -0.95; g.add(p); } g.add(B.blk(0.1, 1.6, 0.1, '#6a4a32', 0, 0.8, 0.8, 0.02)); g.position.set(x, 0, z); st.add(g); return g; });
    const fs = B.flag('us', { h: 4.4 }); fs.position.set(-0.6, 0, -4.8); st.add(fs);
    return { stage: st, env, L, hero, cs, fs };
  },
  draw(s, t, info) {
    s.env.update(t); s.fs.update(t); const c0 = at(info, '461', 0.4);
    s.L.forEach((b, i) => { const sal = i === 1 ? clamp(antic(t, c0 - 0.05, 0.12, 0.28)) : 0; b.update(t + i * 0.6, sal > 0 ? { ...POSE.attn, armR: [lerp(0, 2.5, sal), lerp(0.03, -0.55, sal)], elbowR: lerp(0.02, 2.1, sal) } : POSE.attn, i === 1 ? mixExpr(EXPR.deadpan, EXPR.glare, sal) : EXPR.deadpan, { idle: 0.8 }); b.rotation.y = 0; });
    camKeys(s.stage, t, [[0, { pos: [-0.05, 2.45, 5.3], look: [-0.1, 1.95, 1.2], fov: 36 }], [Math.max(0.5, c0 - 0.1), { pos: [-0.05, 2.5, 5.7], look: [-0.1, 1.95, 1.2], fov: 37 }], [Math.min(info.dur, c0 + 1.1), { pos: [0, 4.6, 11.8], look: [0, 1.4, -1.5], fov: 46 }], [info.dur + 0.5, { pos: [0, 4.8, 12.4], look: [0, 1.4, -1.5], fov: 46 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'tense', t); const c0 = at(info, '461', 0.4) - 0.05; counter(g, t, c0, c0 + 0.6, 0, 461, CXs, 450, { suffix: ' TROOPS', size: 104 }); tag(g, t, c0 + 0.7, '+ 14 cannons', CXs, 600, 56, { box: '#3a4458' }); },
});

// =========================================================== s12: five warships (over the bluecoats' shoulders)
registerShot('s12', { kind: '3d',
  init(T) {
    const st = B.bstage(T, { mood: 'tense', fov: 46, shadowSize: 30, target: [0, 1, -10] }); const env = B.island(st, { seed: 17, seaZ: -5, pines: 2, back: 12, keepClear: [[0, 0, 4]] });
    const ships = [...Array(5)].map((_, i) => { const w = B.warship({ seed: i }); w.home = [-4.5 + (i % 2) * 3.5 - i * 0.4, -13 - i * 6.5]; w.rotation.y = 0.18; st.add(w); return w; });
    const fgB = army(st, B.bluecoat, [[-0.95, 3.3], [1.05, 3.6]], 140, Math.PI); fgB[0].rotation.y = Math.PI - 0.5; fgB[1].rotation.y = Math.PI + 0.55;
    const mid = army(st, B.bluecoat, [[-3.6, -1.6], [3.8, -2.2], [-2.6, -2.6]], 150, Math.PI);
    const cn = B.cannon(); cn.position.set(2.6, 0, 0.4); cn.rotation.y = Math.PI; st.add(cn);
    return { stage: st, env, ships, fgB, mid };
  },
  draw(s, t, info) {
    s.env.update(t); s.ships.forEach((w, i) => { w.position.set(w.home[0] + 1.3 * t, 0, w.home[1]); w.update(t + i); });
    const tw = at(info, 'warships', 0.6);
    s.fgB.forEach((b, i) => b.update(t + i, { ...POSE.attn, headY: (i ? -1 : 1) * 0.35 * clamp((t - tw) / 0.3), headX: -0.05 }, EXPR.worried));
    s.mid.forEach((b, i) => b.update(t + i * 0.4, POSE.attn, EXPR.worried));
    camKeys(s.stage, t, [[0, { pos: [0.1, 3.0, 7.2], look: [0, 1.6, -22], fov: 46 }], [info.dur, { pos: [0.1, 2.9, 6.6], look: [0, 1.8, -22], fov: 45 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'tense', t); stamp(g, t - at(info, 'five', 0.1), '× 5 WARSHIPS', { y: 450, size: 100, color: '#c4322b' }); tag(g, t, at(info, 'warships', 0.6) + 0.15, '2,000+ men aboard', CXs, 640, 56, { box: '#3a4458' }); },
});

// =========================================================== s13, s13b: the standoff (TENSE)
registerShot('s13', { kind: '3d',
  init(T) { const s = standoffInit(T, { mood: 'tense' }); s.pig.visible = false; s.tw = B.tumble(); s.stage.add(s.tw); return s; },
  draw(s, t, info) { setUpdate(s, t); armies(s, t, EXPR.deadpan, EXPR.deadpan);
    s.tw.position.set(-1.4 + t * 1.7, 0.2 + Math.abs(Math.sin(t * 6)) * 0.3, 0.6); s.tw.rotation.z = -t * 7;
    camKeys(s.stage, t, [[0, { pos: [0, 3.3, 9.6], look: [0, 1.2, -3.0], fov: 50 }], [info.dur, { pos: [0, 3.15, 9.0], look: [0, 1.2, -3.0], fov: 49 }]]); },
  overlay(g, t, info, s) { grade(g, 'tense', t); tag(g, t, at(info, 'shot', 0.6), 'SHOTS FIRED: 0', CXs, 500, 74, { box: '#3a4458' }); },
});
registerShot('s13b', { kind: '3d',
  init(T) { const s = standoffInit(T, { mood: 'tense', dof: { focus: 6, aperture: 0.002, maxblur: 0.006 } }); s.pig.visible = false; s.reds[0].position.x = -1.2; s.blues[0].position.x = 1.2; return s; },
  draw(s, t, info) { setUpdate(s, t);
    const lean = 0.04 + 0.05 * ease.inOut(clamp(t / 0.8));
    s.reds.forEach((b, i) => b.update(t + i, { ...POSE.attn, lean, headY: -0.2 }, { ...EXPR.suspicious, look: [0.8, 0] })); s.blues.forEach((b, i) => b.update(t + i + 0.4, { ...POSE.attn, lean, headY: 0.2 }, { ...EXPR.suspicious, look: [-0.8, 0] }));
    camKeys(s.stage, t, [[0, { pos: [0, 2.4, 7.4], look: [0, 2.15, 1.0], fov: 40 }], [info.dur, { pos: [0, 2.35, 6.9], look: [0, 2.15, 1.0], fov: 39 }]]); s.stage.focusOn(new THREE.Vector3(0, 2.2, 1.6)); },
  overlay(g, t, info, s) { grade(g, 'tense', t); tag(g, t, 0.05, 'CASUALTIES: ?', CXs, 500, 78, { box: '#3a4458' }); },
});

// =========================================================== s14: PAYOFF (GOLDEN) the pig as a cheerful angel -> hard cut to s01 (loop)
registerShot('s14', { kind: '3d',
  init(T) {
    const st = B.bstage(T, { mood: 'golden', fov: 44, shadowSize: 10, target: [0, 2, 0], bloom: 0.3 }); const env = B.island(st, { seed: 19, seaZ: -16, pines: 8, keepClear: [[0, 0, 5]] });
    const pg = B.pig({ seed: 6 }); st.add(pg);
    const halo = new THREE.Group(); const hm = B.mat('#ffe27a', { emissive: '#ffcc33', ei: 1.4, rim: 0 }); for (let i = 0; i < 4; i++) { const b = B.blk(0.6, 0.07, 0.08, hm, 0, 0, 0, 0.02); b.position.set(Math.cos(i * Math.PI / 2) * 0.27, 0, Math.sin(i * Math.PI / 2) * 0.27); b.rotation.y = -i * Math.PI / 2 + Math.PI / 2; b.castShadow = false; halo.add(b); } st.add(halo);
    const wings = [-1, 1].map(sd => { const w = new THREE.Group(); for (let k = 0; k < 4; k++) w.add(B.blk(0.16, 0.5 - k * 0.08, 0.24, B.mat('#ffffff', { emissive: '#fff4e0', ei: 0.3 }), sd * (0.12 + k * 0.15), 0.12 + k * 0.07, 0, 0.04)); st.add(w); return { w, sd }; });
    const spk = sparkles(st, 12, '#fff0a0');
    const fans = [B.redcoat({ seed: 160, skin: SKN[1] }), B.bluecoat({ seed: 161, skin: SKN[3] })]; fans[0].position.set(-1.9, 0, -2.6); fans[0].rotation.y = 0.35; fans[1].position.set(1.9, 0, -2.6); fans[1].rotation.y = -0.35; fans.forEach(f => st.add(f));
    return { stage: st, env, pig: pg, halo, wings, spk, fans };
  },
  draw(s, t, info) {
    s.env.update(t); const y = 1.0 + t * 0.6; s.pig.position.set(0, y, 0.6); s.pig.rotation.y = 0.35 + Math.sin(t * 1.5) * 0.1; s.pig.rotation.z = Math.sin(t * 2) * 0.05;
    s.pig.update(t, { walk: 0.3, speed: 2, tailSpeed: 12, expr: { ...EXPR.happy, lid: 0.5, look: [0, 0.6] } });
    const h = new THREE.Vector3(); s.pig.head.getWorldPosition(h); s.halo.position.set(h.x, h.y + 0.55 + Math.sin(t * 3) * 0.03, h.z); s.halo.rotation.y = t * 1.2;
    s.wings.forEach(({ w, sd }) => { v3.set(sd * 0.4, 0.98, -0.1).applyMatrix4(s.pig.matrixWorld); w.position.copy(v3); w.rotation.set(0, s.pig.rotation.y, sd * (0.15 + Math.sin(t * 9) * 0.35)); });
    s.spk.update(t, new THREE.Vector3(0, y + 0.7, 0.6), 1.0, 1);
    s.fans.forEach((f, i) => f.update(t + i, { ...POSE.stand, headX: -0.35 }, { ...EXPR.shocked, look: [0, 1] }));
    camKeys(s.stage, t, [[0, { pos: [0, 1.9, 8.2], look: [0, 1.9, 0], fov: 44 }], [info.dur, { pos: [0, 1.9 + info.dur * 0.5, 7.4], look: [0, 1.8 + info.dur * 0.6, 0], fov: 44 }]]);
  },
  overlay(g, t, info, s) { grade(g, 'golden', t); tag(g, t, at(info, 'pig', 1.2) - 0.05, 'CASUALTIES: 1 PIG', CXs, 470, 76, { box: '#c4322b' }); },
});
