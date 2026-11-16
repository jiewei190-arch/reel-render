// War of the Bucket (1325): shared assets. EMOTION: LOL. Deadpan narrator.
// Tone guard: the armies are slapstick toons; nobody is ever shown hurt (the losers run off, unhurt, in a dust cloud).
// Every character and set is an original toon; Modena = blue/yellow, Bologna = red/white (toon colours, not real heraldry).
import * as C from './_common.js';
const { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, lathe, PR, bean, sph, mesh, rng, clamp, lerp, ease, E, insT, CARD_INK, meadow } = C;
export * from './_common.js';

export const MOD = { main: '#2f63b8', trim: '#f2c94a' };   // Modena (blue)
export const BOL = { main: '#c23b2e', trim: '#f4ece0' };   // Bologna (red)

export function soldier(side = MOD, o = {}) {
  const b = bean({ name: 'Soldier', outfit: 'armour', colors: { main: side.main, trim: side.trim, metal: '#b9bcc2' }, skin: o.skin || 'fair', hair: o.hair || 'bowl', hairColor: o.hairColor || '#4a2e18',
    head: 'helmet', headColor: '#b9bcc2', crestColor: side.main, helmetTrim: side.trim, moustache: o.moustache ?? false, beard: o.beard ?? false, seed: o.seed || 3, scale: o.scale || 1 });
  if (o.spear !== false) { const sp = PR.spear({ len: 2.6 }); b.hand.R.add(sp); sp.position.set(0, -0.2, 0.05); b.spear = sp; }
  return b;
}
export function general(side = MOD, o = {}) {
  return bean({ name: 'General', outfit: 'armour', colors: { main: side.main, trim: side.trim, metal: '#d8b04a' }, skin: o.skin || 'light', hair: 'horseshoe', hairColor: '#6a6a6a',
    head: 'helmet', headColor: '#d8b04a', crestColor: side.main, helmetTrim: side.trim, moustache: o.moustache ?? '#5a5a5a', seed: o.seed || 9 });
}
// the bucket: a wooden pail with iron hoops and an iron handle (like the real "secchia", toon version)
export function bucket(s = 1) {
  const g = new THREE.Group();
  const body = lathe([[0.001, 0], [0.34, 0.0], [0.36, 0.05], [0.44, 0.62], [0.42, 0.66], [0.001, 0.66]], '#a8743e', 28); body.scale.setScalar(s); g.add(body);
  const stT = canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#a8743e'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(60,30,10,.55)'; x.lineWidth = 4; for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16, h); x.stroke(); } });
  body.material = toon('#ffffff', { map: stT });
  for (const [y, r] of [[0.1, 0.37], [0.55, 0.435]]) { const hp = new THREE.Mesh(new THREE.TorusGeometry(r * s, 0.025 * s, 6, 32), toon('#4a4448')); hp.rotation.x = Math.PI / 2; hp.position.y = y * s; g.add(hp); }
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.42 * s, 0.022 * s, 6, 24, Math.PI), toon('#4a4448')); hd.position.y = 0.66 * s; hd.rotation.y = 0; g.add(hd); g.handle = hd;
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.4 * s, 24), toon('#5aa8d8')); water.rotation.x = -Math.PI / 2; water.position.y = 0.6 * s; water.userData.noOutline = true; g.add(water);
  outline(g, { px: 2.8 }); return g;
}
export function well(o = {}) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.15, 1.0, 24, 1, true), toon('#ffffff', { map: PR.TEX.stone('#c8b89a', [4, 1]), side: THREE.DoubleSide })); ring.position.y = 0.5; ring.castShadow = ring.receiveShadow = true; g.add(ring);
  g.add(cyl(1.18, 1.18, 0.12, '#b8a888', 0, 1.02, 0, 24));
  const dark = new THREE.Mesh(new THREE.CircleGeometry(1.05, 24), flat('#1a1a22')); dark.rotation.x = -Math.PI / 2; dark.position.y = 0.9; dark.userData.noOutline = true; g.add(dark);
  for (const s of [-1, 1]) g.add(cyl(0.08, 0.09, 2.2, '#6a4228', s * 1.0, 2.0, 0, 8));
  const beam = cyl(0.1, 0.1, 2.3, '#6a4228', 0, 2.9, 0, 10); beam.rotation.z = Math.PI / 2; g.add(beam);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.9, 4), toon('#9a4a32')); roof.position.y = 3.5; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
  outline(g, { px: 2.4 }); return g;
}
// a small Italian walled town on a hill: houses + one tall bell tower. o.big = Bologna (lots of towers)
export function town(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 4); const n = o.houses || 7;
  for (let i = 0; i < n; i++) { const f = PR.facade({ w: 3 + r() * 1.5, h: 3 + r() * 2, d: 3, color: ['#e8cfa4', '#e2b48a', '#f0dcb8', '#d89a74'][i % 4], trim: '#b5543a', windows: 2, door: i % 2 === 0, seed: i }); f.position.set(-9 + i * 3.1, 0, -r() * 2); g.add(f); }
  const towers = o.towers || [[0, 14]];
  for (const [x, h] of towers) { const t = new THREE.Group(); const sh = new THREE.Mesh(new THREE.BoxGeometry(1.8, h, 1.8), toon('#ffffff', { map: PR.TEX.stone('#d8c4a0', [1, h / 3]) })); sh.position.y = h / 2; sh.castShadow = true; t.add(sh);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(1.3, 3.2, 8), toon('#c9b48a')); sp.position.y = h + 1.6; sp.castShadow = true; t.add(sp);
    for (const s of [-1, 1]) t.add(box(0.5, 1.0, 0.1, '#2a1e1a', s * 0.4, h - 1.6, 0.91)); t.position.set(x, 0, -4); outline(t, { px: 2.2 }); g.add(t); }
  return g;
}
// glass museum case with a velvet rope, for the payoff
export function museumCase() {
  const g = new THREE.Group();
  g.add(rbox(1.6, 1.1, 1.6, '#5a3a22', 0, 0.55, 0, 0.05));
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.5), new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.18, depthWrite: false })); glass.position.y = 1.9; glass.userData.noOutline = true; g.add(glass);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 1.6, 1.5)), new THREE.LineBasicMaterial({ color: '#e8f4ff' })); edges.position.y = 1.9; g.add(edges);
  for (const x of [-1.6, 1.6]) { g.add(cyl(0.05, 0.08, 1.0, '#d8b04a', x, 0.5, 1.4, 10)); g.add(ball(0.08, '#d8b04a', x, 1.02, 1.4, 10)); }
  const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.6, 0.95, 1.4), new THREE.Vector3(0, 0.6, 1.4), new THREE.Vector3(1.6, 0.95, 1.4)), 16, 0.04, 6), toon('#a8202e')); g.add(rope);
  outline(g.children[0], { px: 2.4 }); return g;
}
export function hall(st) {   // town-hall room: warm walls, wooden floor, framed paintings
  const g = new THREE.Group(); st.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon('#ffffff', { map: PR.TEX.planks('#8a5a32', [6, 6], 8) })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.userData.noOutline = true; g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), toon('#ffffff', { map: PR.TEX.fresco('#8a2a2a', 4) })); wall.position.set(0, 6, -5); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  return g;
}
// a dust cloud (slapstick fight / running away)
export function dust(o = {}) { return C.FX.smoke({ count: 14, size: o.size || 1.3, rise: 0.4, spread: o.spread || 3, color: '#efe2c8', life: 2.4, seed: o.seed || 4, drift: [0.3, 0] }); }
