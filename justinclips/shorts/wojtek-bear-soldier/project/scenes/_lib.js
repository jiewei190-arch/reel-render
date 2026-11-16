// Wojtek the Soldier Bear: shared assets. EMOTION: AW. Warm, deadpan-gentle narrator.
// Tone guard: wholesome. No combat is shown: Monte Cassino is a mountain with a monastery and a supply truck; the bear carries
// crates; nobody is hurt; no weapons are aimed. Wrestling is play (both grinning). Every character is an original toon.
import * as C from './_common.js';
const { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, PR, bean, sph, mesh, rng, clamp, lerp, ease, E, meadow, tree, quad } = C;
export * from './_common.js';

export function soldier(o = {}) {
  return bean({ name: 'Soldier', outfit: 'uniform', colors: { main: o.main || '#8a7e54', trim: '#c9b878', belt: '#5a5034' }, skin: o.skin || 'light', hair: o.hair || 'bowl', hairColor: o.hairColor || '#5a3418',
    head: o.head || 'cap', headColor: o.cap || '#6a6440', moustache: o.moustache ?? false, seed: o.seed || 5, scale: o.scale || 1 });
}
export function bear(o = {}) { return quad({ kind: 'bear', seed: o.seed || 2, scale: o.scale || 0.85, color: o.color || '#7a4f2e' }); }
// wooden ammunition crate with a stencilled shell
let _ct = null;
const crateTex = () => canvasTex(256, 192, (x, w, h) => { x.fillStyle = '#7a8048'; x.fillRect(0, 0, w, h); x.strokeStyle = '#4a5028'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
  x.fillStyle = '#f4ecd0'; x.beginPath(); x.roundRect(w / 2 - 20, 40, 40, 100, [20, 20, 4, 4]); x.fill(); x.fillRect(w / 2 - 24, 130, 48, 14); x.font = '900 30px "Nunito", sans-serif'; x.textAlign = 'center'; x.fillText('AMMO', w / 2, 178); });
export function crate(s = 1) { _ct ||= crateTex(); const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(0.9 * s, 0.6 * s, 0.6 * s), toon('#ffffff', { map: _ct })); m.position.y = 0.3 * s; m.castShadow = m.receiveShadow = true; g.add(m);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: '#2a2418' })); e.position.copy(m.position); g.add(e); return g; }
export function shell(s = 1) { const g = new THREE.Group(); g.add(cyl(0.12 * s, 0.12 * s, 0.5 * s, '#c9a24a', 0, 0.25 * s, 0, 16)); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12 * s, 0.3 * s, 16), toon('#8a8e7a')); tip.position.y = 0.65 * s; tip.castShadow = true; g.add(tip); outline(g, { px: 2.6 }); return g; }
export function bottle() { const g = new THREE.Group(); g.add(cyl(0.07, 0.07, 0.3, '#6a3a12', 0, 0.15, 0, 12)); g.add(cyl(0.03, 0.06, 0.12, '#6a3a12', 0, 0.36, 0, 10)); g.add(rbox(0.1, 0.1, 0.01, '#f4ecd0', 0, 0.15, 0.07, 0.01)); outline(g, { px: 2.2 }); return g; }
// desert camp in Persia: sand ground, tents, distant mountains
export function camp(st, o = {}) {
  const env = meadow(st, { seed: o.seed || 4, trees: 0, ground: '#e2c690', hills: false });
  const r = rng(o.seed || 4);
  for (let i = 0; i < 6; i++) { const m = mesh(sph, toon(i % 2 ? '#c89a6a' : '#b88a5a'), 20 + r() * 10, 8 + r() * 6, 8); m.position.set(-60 + i * 25, -2, -70 - r() * 20); m.userData.noOutline = true; st.add(m); }
  for (const [x, z] of o.tents || [[-4, -5], [3.5, -6], [8, -3]]) { const t = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.2, 4), toon('#9a9060')); t.position.set(x, 1.1, z); t.rotation.y = Math.PI / 4 + r(); t.castShadow = true; outline(t, { px: 2.2 }); st.add(t); }
  return env;
}
// WWII transport ship (toon, grey): faces +X
export function ship() {
  const g = new THREE.Group();
  g.add(rbox(10, 2.2, 2.6, '#6a7480', 0, 1.0, 0, 0.3)); g.add(rbox(10.1, 0.25, 2.65, '#3a3e44', 0, 0.2, 0, 0.1));
  g.add(rbox(3, 1.4, 2.0, '#d8d8d0', -1, 2.8, 0, 0.1)); g.add(cyl(0.45, 0.5, 1.6, '#3a3e44', -1, 4.2, 0, 16));
  for (const x of [-4, 3.5]) g.add(cyl(0.08, 0.08, 4, '#5a5a5a', x, 4, 0, 8));
  for (let i = 0; i < 7; i++) g.add(ball(0.18, '#2a2e34', -3.5 + i * 1.1, 1.4, 1.31, 10));
  outline(g, { px: 2.2 }); return g;
}
// Monte Cassino: a big green-brown mountain with a white monastery on top
export function monteCassino() {
  const g = new THREE.Group(); const m = mesh(sph, toon('#8a9a5a'), 16, 9, 10); m.position.y = -1; g.add(m);
  const rock = mesh(sph, toon('#a89a7a'), 10, 7.5, 7); rock.position.set(2, 0, 2); g.add(rock);
  const mon = new THREE.Group(); mon.add(rbox(7, 1.8, 3.2, '#f4f0e4', 0, 0.9, 0, 0.1)); mon.add(rbox(2, 1.2, 2, '#f4f0e4', -1, 2.2, 0, 0.1)); const dome = ball(0.8, '#e8dcc4', -1, 3.0, 0, 20); mon.add(dome);
  for (let i = 0; i < 8; i++) mon.add(box(0.3, 0.5, 0.05, '#4a4440', -3 + i * 0.85, 1.0, 1.62));
  mon.position.set(0, 7.6, 1); g.add(mon); outline(mon, { px: 2.2 }); return g;
}
