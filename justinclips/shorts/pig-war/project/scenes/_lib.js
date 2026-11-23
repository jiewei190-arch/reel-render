// The Pig War (San Juan Island, 1859): shared assets. EMOTION: LOL. Deadpan narrator.
// Tone guard: the pig is never shown being shot. "He shot it." cuts away to birds bursting out of a tree with an off-screen
// BANG; the payoff shows the pig as a cheerful cartoon angel. Nobody else is hurt; no gun is ever pointed at anyone on screen.
// All characters are original toons (no likenesses of Cutlar, Griffin, Pickett or Baynes).
import * as C from './_common.js';
const { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, PR, bean, sph, mesh, rng, clamp, lerp, ease, E, meadow, tree } = C;
export * from './_common.js';

export function farmer(o = {}) {
  const b = bean({ name: 'Farmer', outfit: 'uniform', colors: { main: '#6a8ab0', trim: '#e8dcc0', belt: '#5a3a22' }, skin: 'light', hair: 'messy', hairColor: '#8a5a2a', beard: true, beardColor: '#8a5a2a', head: 'slouch', headColor: '#7a5a3a', seed: o.seed || 13 });
  return b;
}
export function rifle() { const g = new THREE.Group(); g.add(cyl(0.035, 0.035, 1.4, '#3a3434', 0, 0.3, 0, 8)); g.add(rbox(0.12, 0.5, 0.08, '#7a5032', 0, -0.55, 0, 0.03)); outline(g, { px: 2.4 }); return g; }
export function redcoat(o = {}) {
  const b = bean({ name: 'Redcoat', outfit: 'uniform', colors: { main: '#c8322a', trim: '#f4ece0', belt: '#f4ece0' }, skin: o.skin || 'fair', hair: 'bowl', hairColor: o.hairColor || '#5a3418', head: 'cap', headColor: '#1e1e28', moustache: o.moustache ?? false, seed: o.seed || 21, scale: o.scale || 1 });
  return b;
}
export function bluecoat(o = {}) {
  return bean({ name: 'Bluecoat', outfit: 'uniform', colors: { main: '#2f4f8a', trim: '#d8b04a', belt: '#2a2a30' }, skin: o.skin || 'light', hair: 'bowl', hairColor: o.hairColor || '#3a2416', head: 'cap', headColor: '#24345a', moustache: o.moustache ?? false, seed: o.seed || 31, scale: o.scale || 1 });
}
export function official(o = {}) {   // British company man in a top hat
  const b = bean({ name: 'Official', outfit: 'uniform', colors: { main: '#2a2a34', trim: '#e8e2d4', belt: '#2a2a34' }, skin: 'fair', hair: 'swoop', hairColor: '#c9b8a0', moustache: '#c9b8a0', seed: o.seed || 41 });
  const hat = new THREE.Group(); hat.add(cyl(0.3, 0.3, 0.55, '#1a1a20', 0, 0.3, 0, 20)); hat.add(cyl(0.48, 0.48, 0.04, '#1a1a20', 0, 0.04, 0, 24)); hat.add(cyl(0.305, 0.305, 0.08, '#8a2a2a', 0, 0.1, 0, 20));
  outline(hat, { px: 2.8 }); hat.position.y = 0.36; b.parts.head.add(hat); return b;
}
export function cannon() {
  const g = new THREE.Group(); const br = cyl(0.16, 0.22, 1.6, '#2e3034', 0, 0.75, 0.1, 16); br.rotation.x = Math.PI / 2 - 0.15; g.add(br);
  g.add(rbox(0.5, 0.35, 1.0, '#7a5032', 0, 0.45, -0.1, 0.05));
  for (const s of [-1, 1]) { const w = cyl(0.42, 0.42, 0.1, '#6a4228', s * 0.36, 0.42, 0, 18); w.rotation.z = Math.PI / 2; g.add(w); }
  outline(g, { px: 2.4 }); return g;
}
const flagTex = (kind) => canvasTex(300, 180, (x, w, h) => {
  if (kind === 'us') { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#c8282e'; x.fillRect(0, i * h / 13, w, h / 13 + 1); } x.fillStyle = '#2a3a7a'; x.fillRect(0, 0, w * 0.42, h * 7 / 13); x.fillStyle = '#fff'; for (let i = 0; i < 20; i++) { x.beginPath(); x.arc(12 + (i % 5) * 24, 12 + Math.floor(i / 5) * 22, 4, 0, 7); x.fill(); } }
  else { x.fillStyle = '#2a3a7a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 36; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke(); x.strokeStyle = '#c8282e'; x.lineWidth = 12; x.stroke();
    x.fillStyle = '#fff'; x.fillRect(w / 2 - 30, 0, 60, h); x.fillRect(0, h / 2 - 30, w, 60); x.fillStyle = '#c8282e'; x.fillRect(w / 2 - 18, 0, 36, h); x.fillRect(0, h / 2 - 18, w, 36); }
});
const _ft = {};
export function flag(kind = 'us', o = {}) {
  const g = new THREE.Group(); const h = o.h || 4; g.add(cyl(0.05, 0.06, h, '#d8d0c0', 0, h / 2, 0, 8)); g.add(ball(0.1, '#d8b04a', 0, h + 0.05, 0, 10));
  const geo = new THREE.PlaneGeometry(1.6, 1.0, 12, 1); const cloth = new THREE.Mesh(geo, toon('#ffffff', { map: (_ft[kind] ||= flagTex(kind)), side: THREE.DoubleSide })); cloth.position.set(0.82, h - 0.55, 0); cloth.userData.noOutline = true; g.add(cloth);
  const base = geo.attributes.position.array.slice(); outline(g.children[0], { px: 2 });
  g.update = (t) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, Math.sin(x * 3 - t * 6) * 0.12 * (x + 0.8)); } p.needsUpdate = true; };
  return g;
}
// a sailing warship (toon): hull with a gun-port stripe, three masts, sails, a Union flag at the stern. Faces +X.
const _hullT = () => canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#2a2224'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8d8a8'; x.fillRect(0, h * 0.35, w, h * 0.25); x.fillStyle = '#1a1416'; for (let i = 0; i < 14; i++) x.fillRect(24 + i * 34, h * 0.39, 16, h * 0.17); });
let _ht = null;
export function warship(o = {}) {
  const g = new THREE.Group(); _ht ||= _hullT();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(7, 1.6, 2.0), [toon('#2a2224'), toon('#2a2224'), toon('#5a3a22'), toon('#2a2224'), toon('#ffffff', { map: _ht }), toon('#ffffff', { map: _ht })]); hull.position.y = 0.6; hull.castShadow = true; g.add(hull);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.0, 4), toon('#2a2224')); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 4; bow.scale.set(0.8, 1, 1.4); bow.position.set(4.4, 0.6, 0); g.add(bow);
  g.add(rbox(1.6, 0.9, 2.0, '#3a2a24', -2.9, 1.8, 0, 0.05));
  const sailM = toon('#f4ecd8', { side: THREE.DoubleSide });
  for (const [x, h] of [[-1.6, 6], [0.6, 7], [2.6, 5.5]]) { g.add(cyl(0.08, 0.1, h, '#6a4228', x, 1.4 + h / 2, 0, 8)); for (let k = 0; k < 2; k++) { const sg = new THREE.PlaneGeometry(2.2 - k * 0.5, 1.6 - k * 0.2, 4, 2); const sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) sp.setZ(i, 0.25 * Math.cos(sp.getX(i))); const s = new THREE.Mesh(sg, sailM); s.rotation.y = Math.PI / 2; s.position.set(x + 0.15, 2.6 + k * 1.9 + h * 0.08, 0); s.castShadow = true; g.add(s); } }
  const f = flag('uk', { h: 2.2 }); f.position.set(-3.6, 2.1, 0); g.add(f); g.flag = f;
  outline(hull, { px: 2.4 }); outline(bow, { px: 2.4 });
  g.update = (t) => { g.position.y = Math.sin(t * 1.3 + (o.seed || 0)) * 0.08; g.rotation.z = Math.sin(t * 1.1 + (o.seed || 0)) * 0.02; f.update(t); };
  return g;
}
// island set: meadow + sea + pine trees + a log cabin. o.cabin, o.sea (z of shoreline)
export function island(st, o = {}) {
  const env = meadow(st, { seed: o.seed || 5, trees: 0, ground: '#8ab865', hills: false });
  const seaZ = o.seaZ ?? -14;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), toon('#3a8fc4', { emissive: new THREE.Color('#2a6fa4'), emissiveIntensity: 0.25 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, seaZ - 100); sea.userData.noOutline = true; st.add(sea);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(400, 3), toon('#e8d4a0')); sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.03, seaZ + 1); sand.userData.noOutline = true; st.add(sand);
  const far = mesh(sph, toon('#5a8a6a'), 60, 6, 10); far.position.set(20, -2, seaZ - 90); far.userData.noOutline = true; st.add(far);
  const r = rng(o.seed || 5); for (let i = 0; i < (o.pines ?? 8); i++) { const tr = tree(r, { pine: true, s: 1.1 + r() * 0.6 }); tr.position.set((r() - 0.5) * 50, 0, seaZ + 4 + r() * 6 + (i % 2) * 10 - 30 * (o.pinesBehind ? 0 : 0)); if (Math.abs(tr.position.x) < 6 && tr.position.z > seaZ + 2) tr.position.x += 12; st.add(tr); }
  return { ...env, update(t) { env.update(t); } };
}
export function cabin() {
  const g = new THREE.Group(); const logT = PR.TEX.planks('#8a5a32', [1, 1], 8); logT.rotation = Math.PI / 2;
  const w = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 3), toon('#ffffff', { map: PR.TEX.planks('#8a5a32', [1, 1], 8) })); w.position.y = 1.2; w.castShadow = w.receiveShadow = true; g.add(w);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.15, 2.0), toon('#5a3a2a')); r.position.set(0, 2.9, s * 0.75); r.rotation.x = s * 0.6; r.castShadow = true; g.add(r); }
  g.add(rbox(0.8, 1.5, 0.08, '#5a3a22', 0.6, 0.75, 1.52, 0.03)); g.add(box(0.7, 0.6, 0.05, '#bfe0ff', -1.0, 1.4, 1.52));
  g.add(cyl(0.25, 0.3, 1.4, '#9a9088', 1.5, 3.2, -0.6, 10));
  outline(g, { px: 2.2 }); return g;
}
export function potatoPatch(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 2);
  const soil = new THREE.Mesh(new THREE.PlaneGeometry(o.w || 6, o.d || 4), toon('#7a5a3a')); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.02; soil.userData.noOutline = true; soil.receiveShadow = true; g.add(soil);
  for (let i = 0; i < 18; i++) { const pl = new THREE.Group(); for (let k = 0; k < 4; k++) { const lf = mesh(sph, toon(k % 2 ? '#4f8f44' : '#5ea24e'), 0.18, 0.08, 0.28); lf.position.set(0, 0.25, 0); lf.rotation.set(0.5, k * 1.6, 0); pl.add(lf); } pl.position.set(((i % 6) - 2.5) * 0.95, 0, (Math.floor(i / 6) - 1) * 1.2 + (r() - 0.5) * 0.2); outline(pl, { px: 1.8 }); g.add(pl); }
  return g;
}
export function potato(s = 1) { const p = mesh(sph, toon('#c8a060'), 0.16 * s, 0.12 * s, 0.11 * s); outline(p, { px: 2 }); return p; }
