// Kentucky Meat Shower (1876): shared assets. EMOTION: LOL. Deadpan narrator.
// Tone guard: the "meat" is cartoon steak chunks (pink with a cream fat stripe, toon shaded), no blood, no gore, no realistic
// photos. The vultures throwing up is a comic "BLEH!" with the same cartoon chunks. Nobody is hurt. All characters are original toons.
import * as C from './_common.js';
const { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, PR, bean, sph, mesh, rng, clamp, lerp, ease, E, meadow, tree, FX } = C;
export * from './_common.js';

export function chunk(seed = 1, s = 1) {
  const r = rng(seed); const g = new THREE.Group(); const w = (0.22 + r() * 0.1) * s;
  g.add(rbox(w * 1.3, w * 0.55, w, '#d9776a', 0, 0, 0, w * 0.22));
  g.add(rbox(w * 1.32, w * 0.14, w * 1.02, '#f4e2c4', 0, w * 0.12, 0, w * 0.06));
  outline(g, { px: 2.4 }); return g;
}
// a shower of chunks over an area; .update(t) (deterministic). o.area [w, d], o.n, o.h (start height), o.rate
export function shower(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 3); const [W, D] = o.area || [16, 10]; const n = o.n || 40; const H = o.h || 14; const L = [];
  for (let i = 0; i < n; i++) { const c = chunk(i + (o.seed || 3) * 7, o.s || 1); g.add(c); L.push({ c, x: (r() - 0.5) * W, z: (r() - 0.5) * D, t0: r() * (o.period || 2.2), spin: [r() * 6, r() * 6, r() * 6] }); }
  const per = o.period || 2.2, fall = Math.sqrt(2 * H / 9.8);
  g.update = (t) => { for (const p of L) { const k = ((t + p.t0) % per) / per * (per + 1.4); let y; if (k < fall) { y = H - 0.5 * 9.8 * k * k; p.c.rotation.set(p.spin[0] * k, p.spin[1] * k, p.spin[2] * k); } else { const b = k - fall; y = 0.1 + Math.max(0, Math.sin(Math.min(b, 0.3) / 0.3 * Math.PI)) * 0.3; }
    p.c.position.set(p.x, Math.max(0.1, y), p.z); p.c.visible = true; } };
  g.update(0); return g;
}
export function woman(o = {}) {
  const b = bean({ name: 'Woman', outfit: 'tunic', colors: { main: '#6a7ab8', trim: '#f4ecd8', belt: '#f4ecd8' }, skin: o.skin || 'light', hair: 'bun', hairColor: '#5a3418', seed: o.seed || 17 });
  const ap = rbox(0.5, 0.55, 0.05, '#f4ecd8', 0, -0.25, 0.36, 0.04); b.parts.upper.add(ap); return b;
}
export function man(o = {}) {
  return bean({ name: 'Man', outfit: 'uniform', colors: { main: o.main || '#8a6a4a', trim: '#e8dcc0', belt: '#4a3420' }, skin: o.skin || 'light', hair: 'messy', hairColor: o.hair || '#4a2e18', beard: o.beard ?? true, beardColor: o.hair || '#4a2e18', head: 'slouch', headColor: o.hat || '#5a4a3a', seed: o.seed || 23 });
}
export function kettle() {
  const g = new THREE.Group(); const pot = C.lathe([[0.001, 0], [0.4, 0.05], [0.6, 0.35], [0.62, 0.7], [0.55, 0.8], [0.001, 0.8]], '#2a2a30', 24); pot.position.y = 0.35; g.add(pot);
  const soap = new THREE.Mesh(new THREE.CircleGeometry(0.54, 24), toon('#efe6c8')); soap.rotation.x = -Math.PI / 2; soap.position.y = 1.12; soap.userData.noOutline = true; g.add(soap);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const l = cyl(0.04, 0.04, 1.3, '#5a3a22', Math.cos(a) * 0.55, 0.6, Math.sin(a) * 0.55, 6); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); g.add(l); }
  outline(g, { px: 2.4 }); const f = FX.fire({ size: 0.45, tongues: 5, seed: 2 }); f.position.y = 0.0; g.add(f); g.fire = f; return g;
}
export function barn() {
  const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), toon('#ffffff', { map: PR.TEX.planks('#b8402e', [1, 1], 10) })); w.position.y = 2; w.castShadow = w.receiveShadow = true; g.add(w);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.2, 3.4), toon('#4a3a3a')); r.position.set(0, 5, s * 1.35); r.rotation.x = s * 0.62; r.castShadow = true; g.add(r); }
  const gab = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 3.0, 2.0, 3, 1), toon('#b8402e')); gab.rotation.set(0, Math.PI / 2, 0); gab.scale.set(1, 1, 1.4); gab.position.set(0, 5.0, 0); g.add(gab);
  g.add(rbox(2.2, 2.8, 0.1, '#f4ecd8', 0, 1.4, 2.52, 0.03)); g.add(rbox(1.9, 2.5, 0.12, '#8a2a20', 0, 1.35, 2.55, 0.03));
  outline(g, { px: 2.2 }); return g;
}
export function farm(st, o = {}) {
  const env = meadow(st, { seed: o.seed || 3, trees: 5, ground: '#93c06a' });
  const b = barn(); b.position.set(o.barnX ?? -5, 0, o.barnZ ?? -9); b.rotation.y = 0.35; st.add(b);
  const fc = PR.fence({ len: 24 }); fc.position.set(0, 0, o.fenceZ ?? -4); st.add(fc);
  return { ...env, barn: b };
}
// microscope (toon)
export function microscope() {
  const g = new THREE.Group(); g.add(rbox(1.0, 0.15, 0.8, '#2a2a34', 0, 0.08, 0, 0.04)); const arm = rbox(0.18, 1.3, 0.2, '#3a3a48', 0, 0.75, -0.25, 0.06); arm.rotation.x = 0.15; g.add(arm);
  g.add(rbox(0.7, 0.06, 0.6, '#d8d8e0', 0, 0.55, 0.05, 0.02)); const tube = cyl(0.11, 0.11, 0.8, '#d8d8e0', 0, 1.25, 0.05, 16); tube.rotation.x = -0.35; g.add(tube);
  g.add(cyl(0.08, 0.06, 0.25, '#2a2a34', 0, 0.75, 0.15, 12)); outline(g, { px: 2.4 }); return g;
}
