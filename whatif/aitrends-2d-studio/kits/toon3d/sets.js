// kits/toon3d/sets.js — reusable furnished locations for the Toon 3D style (Ancient Rome pack).
// Each set builder adds itself to a stage and returns:
//   { group, spots: { name: [x, z] }, cams: { name: { pos, look, fov } }, update(t), ...extras }
// The camera looks from +Z toward -Z by default. Use set.cams.* as starting points; every shot can move them.
//
//   const st = toonStage(T, { light: 'warm', target: [0, 1, 0] });
//   const set = SETS.romanHouse(st, { papers: true });     set.update(t) in draw()
import { THREE, toon, floor, plane, rbox, box, cyl, blob, canvasTex, LIGHT } from './toon.js';
import * as PR from './props.js';
import * as FX from './fx.js';
import { rng } from '/engine/core.js';
import { shadeHex } from './rig.js';

const texFloor = (w, d, tex) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), PR.texMat(tex)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; return m; };
function wallBox(w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.receiveShadow = true; m.castShadow = true; m.userData.noOutline = true; return m; }
const fxList = () => { const L = []; L.run = (t) => L.forEach(f => f.update(t)); return L; };

// ---------------------------------------------------------------------------------------------
// ROMAN STREET: cobbled street running away from camera, portico of columns on the left,
// shop fronts on the right, a temple at the far end. Options: { time: 'day'|'dusk'|'night', fire: bool, smoke: bool, seed }
export function romanStreet(st, o = {}) {
  const { fire = false, smoke = fire, seed = 1 } = o; const r = rng(seed); const g = new THREE.Group(); st.add(g); const fx = fxList();
  g.add(texFloor(7, 60, PR.TEX.cobble('#b3a48c', [4, 30])));
  g.position.z = 0;
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 60), PR.texMat(PR.TEX.stone('#cdbb9a', [2, 30]))); c.position.set(s * 4.7, 0.1, 0); c.receiveShadow = true; g.add(c); }
  // left: portico columns + beam + back wall with doors
  for (let z = 3; z > -26; z -= 3.2) g.add(PR.column(5.0, { r: 0.3 }).at(-3.9, 0.2, z));
  g.add(rbox(0.9, 0.6, 60, '#e6dcc6', -3.9, 6.3, -10, 0.05));
  const lw = wallBox(0.5, 7.5, 60, PR.texMat(PR.TEX.plaster('#e2c9a0', [8, 1])), -6.2, 3.7, -10); g.add(lw);
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 60), PR.texMat(PR.TEX.roof('#b5543a', [2, 24]))); roofL.position.set(-5, 6.9, -10); roofL.rotation.z = 0.25; roofL.castShadow = true; g.add(roofL);
  for (let z = 1.5; z > -26; z -= 6.4) g.add(PR.propGroup(rbox(0.1, 2.4, 1.2, '#5a3a22', -5.92, 1.4, z, 0.03)));
  // right: shop fronts with stalls and goods
  const cols = ['#e2c9a0', '#d8b48a', '#eadbb8', '#d4a888', '#e6cfa6'];
  for (let i = 0; i < 6; i++) { const z = 2 - i * 5; g.add(PR.facade({ w: 5, h: 4.4 + (i % 2) * 1.2, d: 3, color: cols[i % cols.length], trim: i % 2 ? '#8a3a2a' : '#b5543a', shop: true, windows: 2, seed: i }).at(6.2, 0.2, z, -Math.PI / 2)); }
  g.add(PR.stall({ seed: 3 }).at(3.6, 0.2, -1.5, -Math.PI / 2));
  g.add(PR.amphora({ color: '#b5653a' }).at(3.8, 0.2, 1.4), PR.amphora({ color: '#9a5030', h: 0.9 }).at(4.2, 0.2, 1.0));
  g.add(PR.crate().at(3.9, 0.2, -5.2, 0.3), PR.crate({ s: 0.6 }).at(3.95, 1.0, -5.2, 0.7), PR.barrel().at(3.7, 0.2, -6.4));
  g.add(PR.cart().at(2.2, 0, -9.5, 0.4), PR.plant().at(-3.2, 0.2, 1.4), PR.plant({ color: '#4f7a3a' }).at(-3.2, 0.2, -8.2));
  g.add(PR.banner({ txt: 'SPQR' }).at(-3.9, 5.9, -4.6));
  // far end: temple + a hint of hills
  g.add(PR.templeFront({ w: 8, h: 5 }).at(0, 0, -32));
  const hill = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#8aa06a')); hill.scale.set(1.4, 0.25, 0.5); hill.position.set(-10, 0, -70); hill.userData.noOutline = true; g.add(hill);
  if (fire) {
    const f1 = FX.fire({ size: 1.3, seed: 3, light: 6, lightRange: 10 }); f1.position.set(4.0, 0.2, -11); g.add(f1); fx.push(f1);
    const f2 = FX.fire({ size: 0.9, seed: 7 }); f2.position.set(-3.4, 0.2, -14); g.add(f2); fx.push(f2);
    g.add(FX.skyGlow({ w: 30, h: 22, opacity: 0.65 }).translateZ(-36));
  }
  if (smoke) { for (const [x, z, s] of [[4.6, -11, 1.2], [-4.5, -17, 1.0], [2, -26, 1.6]]) { const sm = FX.smoke({ size: s, seed: Math.round(x * 10 + z), rise: 1.1, life: 5 }); sm.position.set(x, 1.5, z); g.add(sm); fx.push(sm); } g.add(FX.embers({ area: [8, 6, 10] }).translateZ(-8)); fx.push(g.children[g.children.length - 1]); }
  return {
    group: g, fx, update: fx.run,
    spots: { center: [0, 0], left: [-1.6, 0], right: [1.6, 0], stall: [2.6, -1.5], far: [0, -8], portico: [-3.1, -2] },
    cams: { wide: { pos: [0, 2.6, 9], look: [0, 1.8, -6], fov: 40 }, medium: { pos: [0, 1.9, 5.2], look: [0, 1.6, 0], fov: 32 }, low: { pos: [0.6, 0.6, 5], look: [0, 2.6, -2], fov: 42 } },
  };
}

// ---------------------------------------------------------------------------------------------
// ROMAN HOUSE INTERIOR (domus room): fresco walls, mosaic floor, couch, table with fruit, scroll shelf, amphorae, lamp,
// a doorway (left) and a window (right). Options: { palace: bool (throne, purple curtains, gold), papers: bool, mess: bool, seed }
export function romanHouse(st, o = {}) {
  const { palace = false, papers = false, mess = false, seed = 2, window: winColor = '#bfe0ff' } = o; const g = new THREE.Group(); st.add(g); const fx = fxList();
  const W = 10, Dp = 7, H = 4.4;
  g.add(texFloor(W, Dp + 4, PR.TEX.mosaic(palace ? '#efe6d4' : '#e9dcc0', palace ? '#5a2a6a' : '#8a3a2a', [4, 4])));
  const fres = PR.texMat(PR.TEX.fresco(palace ? '#5a2a6a' : '#a8352a', 4));
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), fres); back.position.set(0, H / 2, -Dp / 2); back.receiveShadow = true; back.userData.noOutline = true; g.add(back);
  // left wall with a doorway, right wall with a window
  const side = PR.texMat(PR.TEX.fresco(palace ? '#2f4a3a' : '#2f4a3a', 3));
  const lw1 = new THREE.Mesh(new THREE.PlaneGeometry(Dp + 2, H), side); lw1.rotation.y = Math.PI / 2; lw1.position.set(-W / 2, H / 2, -0.5 + 1); lw1.receiveShadow = true; g.add(lw1);
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(Dp + 2, H), side); rw.rotation.y = -Math.PI / 2; rw.position.set(W / 2, H / 2, 0.5); rw.receiveShadow = true; g.add(rw);
  // doorway in the back wall (dark corridor) and a window with daylight
  g.add(box(1.5, 2.7, 0.05, '#3a2620', -3.2, 1.35, -Dp / 2 + 0.02), PR.column(2.6, { r: 0.1, color: '#e6dcc6' }).at(-4.05, 0, -Dp / 2 + 0.15), PR.column(2.6, { r: 0.1, color: '#e6dcc6' }).at(-2.35, 0, -Dp / 2 + 0.15));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(winColor) })); win.position.set(2.6, 2.6, -Dp / 2 + 0.02); win.userData.noOutline = true; g.add(win);
  for (let i = 0; i < 4; i++) g.add(box(0.06, 1.3, 0.06, '#3a2a24', 2.6 - 0.6 + i * 0.4, 2.6, -Dp / 2 + 0.05));
  g.add(PR.propGroup(box(1.9, 0.12, 0.25, '#e6dcc6', 2.6, 1.9, -Dp / 2 + 0.12)));
  // a soft shaft of window light on the floor (additive)
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.2), new THREE.MeshBasicMaterial({ map: canvasTex(64, 128, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,210,.0)'); gr.addColorStop(0.4, 'rgba(255,240,210,.5)'); gr.addColorStop(1, 'rgba(255,240,210,.0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.rotation.z = 0.3; sh.position.set(2.2, 0.02, -1.4); sh.userData.noOutline = true; g.add(sh);
  g.add(PR.rug({ w: 3.6, d: 2.4, color: palace ? '#5a2a6a' : '#a8352a' }).at(0, 0, -0.4));
  if (palace) {
    g.add(PR.throne().at(0, 0, -2.6));
    for (const x of [-1.4, 1.4]) g.add(PR.curtain({ color: '#5a2a6a' }).at(x, 0, -Dp / 2 + 0.3));
    g.add(PR.banner({ color: '#5a2a6a', txt: 'SPQR', w: 1.0, h: 1.6 }).at(-4.0, 3.9, -Dp / 2 + 0.1), PR.banner({ color: '#5a2a6a', txt: 'SPQR', w: 1.0, h: 1.6 }).at(4.0, 3.9, -Dp / 2 + 0.1));
    g.add(PR.bust().at(-3.6, 0, -1.6, 0.4), PR.lampStand().at(3.3, 0, -2.2), PR.plant().at(-4.2, 0, 0.6), PR.amphora({ color: '#d4a73a', h: 0.9 }).at(4.2, 0, 0.4));
  } else {
    g.add(PR.couch().at(-2.6, 0, -2.4, 0.15), PR.table({ w: 1.6, d: 0.9, h: 0.9 }).at(0.6, 0, -2.2));
    g.add(PR.bowlFruit().at(0.4, 0.96, -2.2), PR.lamp().at(1.1, 0.96, -2.1), PR.scroll().at(0.9, 0.96, -2.45, 0.4));
    g.add(PR.shelf({ seed }).at(4.6, 0, -1.2, -Math.PI / 2), PR.lampStand().at(-4.2, 0, -1.0), PR.bust().at(3.9, 0, -2.9, -0.4));
    g.add(PR.amphora({ color: '#b5653a' }).at(-4.3, 0, 0.8), PR.amphora({ color: '#9a5030', h: 0.9 }).at(-3.8, 0, 1.3), PR.vase().at(2.3, 0, -3.0));
  }
  if (papers || mess) g.add(PR.papers({ n: 9, spread: 3, seed }).at(0, 0, 0.4));
  if (mess) { g.add(PR.scroll().at(-1.2, 0, 1.2, 1.1), PR.scroll().at(1.4, 0, 0.9, 0.3)); const fallen = PR.amphora({ color: '#b5653a', h: 0.8 }).at(1.6, 0.25, 1.6); fallen.rotation.z = Math.PI / 2; g.add(fallen); }
  return {
    group: g, fx, update: fx.run,
    spots: { center: [0, 0.3], left: [-1.4, 0.3], right: [1.4, 0.3], couch: [-2.6, -2.2], throne: [0, -2.5], door: [-3.2, -3.0], table: [0.6, -1.4] },
    cams: { wide: { pos: [0, 2.6, 8.5], look: [0, 1.6, -1.5], fov: 42 }, medium: { pos: [0, 1.9, 5], look: [0, 1.6, 0], fov: 32 }, close: { pos: [0, 2.05, 3.0], look: [0, 2.0, 0], fov: 30 } },
  };
}

// ---------------------------------------------------------------------------------------------
// CITY WALL + GATE, seen from INSIDE the city: crenellated wall, arched gate with two big doors (openable),
// flanking towers, wall torches. Beyond the gate: open country / night / fire glow.
// Options: { night: bool, fireBeyond: bool, torches: bool }. Extras: setDoors(k 0..1), doors, beyond (group behind the wall)
export function cityGate(st, o = {}) {
  const { night = true, fireBeyond = false, torches = true } = o; const g = new THREE.Group(); st.add(g); const fx = fxList();
  { const fl = texFloor(40, 30, PR.TEX.cobble(night ? '#8a8070' : '#b3a48c', [16, 12])); fl.position.z = 5; g.add(fl); }
  const road = texFloor(3.6, 30, PR.TEX.stone('#c2b294', [1, 8])); road.position.set(0, 0.01, 5); g.add(road);
  const gt = PR.gate({ w: 3.4, h: 4.6, wallW: 22, wallH: 7.5, depth: 1.8 }); g.add(gt);
  for (const s of [-1, 1]) g.add(PR.tower({ r: 1.9, h: 10 }).at(s * 4.2, 0, -0.6));
  // walkway + stairs hint
  g.add(rbox(22, 0.3, 1.0, '#b8a688', 0, 5.4, 0.45, 0.05));
  // beyond the wall
  const beyond = new THREE.Group(); g.add(beyond);
  { const fl = texFloor(40, 40, PR.TEX.cobble(night ? '#5a5048' : '#8a9a6a', [10, 10])); fl.position.z = -22; beyond.add(fl); }
  const hill = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(night ? '#2a2a40' : '#7a9a5a')); hill.scale.set(1.2, 0.22, 0.4); hill.position.set(0, 0, -40); hill.userData.noOutline = true; beyond.add(hill);
  if (fireBeyond) { beyond.add(FX.skyGlow({ w: 40, h: 24, opacity: 0.8 }).translateZ(-30)); for (const [x, z, s, sd] of [[-2.5, -9, 1.4, 4], [2.8, -12, 1.8, 9], [0.4, -16, 1.2, 12]]) { const f = FX.fire({ size: s, seed: sd, tongues: 6, spread: 0.8 }); f.position.set(x, 0, z); beyond.add(f); fx.push(f); } const sm = FX.smoke({ size: 1.6, rise: 1.3, seed: 31, life: 6, spread: 3 }); sm.position.set(0, 1.5, -12); beyond.add(sm); fx.push(sm); }
  if (torches) for (const s of [-1, 1]) { const tc = PR.torch().at(s * 2.4, 3.4, 0.05); g.add(tc); const f = FX.fire({ size: 0.22, seed: s > 0 ? 2 : 5, tongues: 3, spread: 0.3, light: s > 0 ? 3.5 : 0, lightRange: 30 }); f.position.copy(tc.flameAt).add(tc.position); g.add(f); fx.push(f); }
  // props by the gate
  g.add(PR.barrel().at(-3.0, 0, 1.6), PR.crate().at(3.0, 0, 1.4, 0.2), PR.crate({ s: 0.6 }).at(3.0, 0.8, 1.4, 0.6), PR.stool().at(-2.0, 0, 1.9));
  g.add(PR.shield().at(-3.1, 0.75, 1.0, 0.5));
  const setDoors = (k) => { gt.doors[0].rotation.y = -k * 1.75; gt.doors[1].rotation.y = k * 1.75; };
  setDoors(o.open || 0);
  return {
    group: g, fx, update: fx.run, setDoors, doors: gt.doors, beyond, gate: gt,
    spots: { guard: [-2.4, 1.6], gate: [0, 0.6], left: [-1.4, 2.5], right: [1.4, 2.5], beyond: [0, -6] },
    cams: { wide: { pos: [0, 3.0, 14], look: [0, 3.0, 0], fov: 42 }, medium: { pos: [-1.5, 1.9, 6.5], look: [-1.6, 1.7, 0.5], fov: 32 }, low: { pos: [0.5, 0.5, 6.5], look: [0, 3.2, 0], fov: 46 } },
  };
}

// set stage lighting for a set mood: applyLight(st, 'night') — swaps key/fill/hemi/background in place
export function applyLight(st, name, extra = {}) {
  const L = { ...LIGHT[name], ...extra };
  st.hemi.color.set(L.sky); st.hemi.groundColor.set(L.ground); st.hemi.intensity = L.ambient;
  st.key.color.set(L.key[0]); st.key.intensity = L.key[1]; st.fill.color.set(L.fill[0]); st.fill.intensity = L.fill[1];
  if (L.bg) st.scene.background = Array.isArray(L.bg) ? canvasTex(4, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); L.bg.forEach((c, i) => gr.addColorStop(i / (L.bg.length - 1), c)); x.fillStyle = gr; x.fillRect(0, 0, w, h); }) : new THREE.Color(L.bg);
  st.exposure = L.exposure ?? 1;
}

// ---------------------------------------------------------------------------------------------
// OUTBACK WHEAT FARM (Western Australia, 1930s): ochre ground, a golden wheat field (instanced stalks), wire fence,
// windmill pump, gum trees, a tin-roof farmhouse, low hills. Options: { wheat: true, field: [w, d, z0], seed }
// Extras: windmill (.fan), wheatMesh. Spots: field, road, fence, house.
export function outbackFarm(st, o = {}) {
  const { wheat = true, seed = 4, field = [26, 22, -4] } = o; const g = new THREE.Group(); st.add(g); const fx = fxList(); const r = rng(seed);
  const dirt = PR.TEX.plaster('#c9965a', [8, 8]); const gr = texFloor(160, 160, dirt); gr.position.z = -40; g.add(gr);
  const road = texFloor(3.2, 120, PR.TEX.plaster('#b98a58', [1, 30])); road.position.set(-7, 0.01, -20); g.add(road);
  let wheatMesh = null;
  if (wheat) { const [fw, fd, fz] = field; const n = Math.round(fw * fd * 9); const geo = new THREE.ConeGeometry(0.06, 1.0, 4); geo.translate(0, 0.5, 0);
    wheatMesh = new THREE.InstancedMesh(geo, toon('#e0b452'), n); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color(); const cs = ['#e0b452', '#d4a242', '#ebc468', '#c99a3a'];
    for (let i = 0; i < n; i++) { const x = (r() - 0.5) * fw, z = fz + (r() - 0.5) * fd; e.set((r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.3); q.setFromEuler(e); const h = 0.5 + r() * 0.3; m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, h, 1)); wheatMesh.setMatrixAt(i, m4); wheatMesh.setColorAt(i, col.set(cs[i % 4])); }
    wheatMesh.receiveShadow = true; wheatMesh.castShadow = false; g.add(wheatMesh);
    const fb = texFloor(fw, fd, PR.TEX.plaster('#c8a050', [4, 4])); fb.position.set(0, 0.008, fz); g.add(fb); }
  const fc = PR.fence({ len: 30 }).at(0, 0, field[2] + field[1] / 2 + 0.6); g.add(fc);
  const wm = PR.windmill({ h: 7 }).at(9, 0, -18, -0.4); g.add(wm); fx.push({ update: (t) => (wm.fan.rotation.z = t * 2.2) });
  g.add(PR.gumTree({ s: 1.3, seed: 2 }).at(-11, 0, -14), PR.gumTree({ s: 1.0, seed: 5 }).at(13, 0, -6), PR.gumTree({ s: 1.5, seed: 8 }).at(-16, 0, -32), PR.gumTree({ s: 1.1, seed: 9 }).at(18, 0, -30));
  // farmhouse with a corrugated tin roof
  const house = PR.facade({ w: 6, h: 3.2, d: 4, color: '#e8dcc0', trim: '#8a8a86', windows: 2 }).at(-14, 0, -24, 0.35); g.add(house);
  const hill = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#b88a5a')); hill.scale.set(1.6, 0.12, 0.4); hill.position.set(0, 0, -95); hill.userData.noOutline = true; g.add(hill);
  return {
    group: g, fx, update: fx.run, windmill: wm, wheatMesh,
    spots: { field: [0, -4], road: [-7, 2], fence: [0, field[2] + field[1] / 2 + 0.6], house: [-14, -21] },
    cams: { wide: { pos: [0, 3.2, 14], look: [0, 1.5, -4], fov: 44 }, low: { pos: [0.5, 0.6, 8], look: [0, 2.2, -2], fov: 46 } },
  };
}
export const SETS = { romanStreet, romanHouse, cityGate, outbackFarm };
