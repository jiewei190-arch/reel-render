// The rats who got a lawyer (Autun, France, early 1500s): shared assets. EMOTION: LOL. Deadpan narrator.
// Tone guard: the rats are cute toon rats; no animal is ever hurt. The cats only lounge and stare (no chasing, no catching).
// The old accounts are hedged in the VO ("reportedly"). Every character is an original toon (Chasseneuz is a generic bean lawyer).
import { E, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage, blob } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import { cat } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export * from './_jc.js';
export { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, toonStage, PR, rng, clamp, lerp, ease, prog, sunnySky, blob, cat };

const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (mat, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(sph, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
function lidEye(parent, pos, size, lidColor) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.scale.set(size, size * 1.12, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 })); w.userData.outlinePx = 1.8; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.42, 0.46, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const lp = new THREE.Group(); eg.add(lp); const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidColor)); lid.userData.noOutline = true; lp.add(lid);
  return { eg, pg, lp };
}

// ---------------------------------------------------------------- THE RAT (cute, upright-sitting toon rat, ~0.9 units tall)
// rat({ fur, seed, hat }) .update(t, { lid, look, chew, wave, hop, headTurn })
export function rat(o = {}) {
  const r = rng(o.seed || 1); const furC = o.fur || ['#8a8a92', '#7a6a5e', '#9a9088', '#6e6a70'][Math.floor(r() * 4)];
  const fur = toon(furC), pink = toon('#f0a8a8'), belly = toon(shadeHex(furC, 0.35));
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const body = mesh(fur, 0.3, 0.36, 0.28, 0, 0.36, 0); g.add(body); const bl = mesh(belly, 0.2, 0.26, 0.12, 0, 0.34, 0.2); g.add(bl);
  const head = new THREE.Group(); head.position.set(0, 0.78, 0.05); g.add(head);
  head.add(mesh(fur, 0.25, 0.22, 0.24)); const snout = mesh(fur, 0.13, 0.11, 0.17, 0, -0.04, 0.2); head.add(snout); head.add(mesh(pink, 0.04, 0.035, 0.035, 0, -0.02, 0.36));
  for (const s of [-1, 1]) { head.add(mesh(fur, 0.12, 0.13, 0.04, s * 0.2, 0.2, -0.04)); const ie = mesh(pink, 0.08, 0.09, 0.02, s * 0.2, 0.2, -0.01); ie.castShadow = false; head.add(ie); }
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.24, 4), flat('#3a2a26')); wh.rotation.z = Math.PI / 2 + s * (0.1 - k * 0.2); wh.position.set(s * 0.14, -0.04 - k * 0.02, 0.24); wh.userData.noOutline = true; head.add(wh); }
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.1, 0.06, 0.18), 0.065, shadeHex(furC, -0.1)));
  const teeth = box(0.05, 0.04, 0.01, '#fbf8f2', 0, -0.11, 0.3); head.add(teeth);
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.17, 0.5, 0.15); g.add(a); const m = mesh(pink, 0.045, 0.1, 0.045, 0, -0.08, 0.02); a.add(m); return a; });
  for (const s of [-1, 1]) g.add(mesh(pink, 0.07, 0.04, 0.12, s * 0.13, 0.03, 0.12));
  const tail = []; for (let i = 0; i < 10; i++) { const tb = mesh(pink, 0.03 - i * 0.002, 0.03 - i * 0.002, 0.03 - i * 0.002); g.add(tb); tail.push(tb); }
  if (o.hat) { const h = new THREE.Group(); h.add(cyl(0.1, 0.12, 0.09, o.hat, 0, 0.04, 0, 14)); h.add(cyl(0.17, 0.17, 0.02, o.hat, 0, 0.0, 0, 16)); h.position.set(0, 0.2, 0); head.add(h); }
  root.add(blob(0.3, 0.3)); outline(g, { px: 2.2 });
  root.update = (t, u = {}) => {
    const { lid = 0.3, look = [0, 0], chew = 0, wave = 0, hop = 0, headTurn = 0, headTilt = 0, ph = (o.seed || 1) * 0.9 } = u;
    const hp = hop * Math.abs(Math.sin(t * 7 + ph)) * 0.15; g.position.y = hp;
    head.rotation.set(chew * Math.sin(t * 22) * 0.05, headTurn + Math.sin(t * 1.3 + ph) * 0.06, headTilt);
    snout.scale.y = 0.11 * (1 + chew * 0.25 * Math.sin(t * 22));
    const bl = ((t + ph) % 3.1) < 0.12 ? 1 : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    arms.forEach((a, i) => { a.rotation.x = -0.9 - chew * 0.4; a.rotation.z = (i ? 1 : -1) * 0.2; if (i === 1 && wave) { a.rotation.x = lerp(a.rotation.x, -2.6, wave); a.rotation.z = 0.4 + Math.sin(t * 14) * 0.3 * wave; } });
    for (let i = 0; i < tail.length; i++) { const k = i / (tail.length - 1); tail[i].position.set(Math.sin(t * 2 + k * 3 + ph) * 0.12 * k, 0.05 + Math.sin(k * Math.PI) * 0.06, -0.24 - k * 0.42); }
  };
  root.head = head; root.headR = 0.25; root.update(0); return root;
}
export function barleyStalk(seed = 1, h = 1.3) { const g = new THREE.Group(); const r = rng(seed); g.add(cyl(0.012, 0.016, h, '#b8a04a', 0, h / 2, 0, 5)); const ear = mesh(toon('#e0c45a'), 0.05, 0.16, 0.05, 0, h + 0.1, 0); g.add(ear); for (let i = 0; i < 4; i++) { const aw = cyl(0.003, 0.003, 0.22, '#e8d070', 0, h + 0.18 + i * 0.03, 0, 3); aw.rotation.z = (i - 1.5) * 0.25; g.add(aw); } return g; }

// ---------------------------------------------------------------- PEOPLE
export function lawyer(o = {}) {  // Chasseneuz: black Renaissance gown with a white ruff collar, red cap, earnest
  const b = bean({ name: 'Lawyer', outfit: 'robe', colors: { main: '#1e1b24', trim: '#f4f0e8' }, skin: 'light', hair: 'swoop', hairColor: '#3a2416', seed: o.seed || 101, scale: o.scale || 1 });
  const ruff = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 8, 28), toon('#f4f0e8')); ruff.rotation.x = Math.PI / 2; ruff.position.y = b.parts.head.position.y - 0.42; b.parts.upper.add(ruff);
  const cap = new THREE.Group(); const c = new THREE.Mesh(sph, toon('#a3352b')); c.scale.set(0.5, 0.22, 0.5); cap.add(c); cap.position.set(0, 0.38, -0.04); cap.rotation.x = -0.15; b.parts.head.add(cap); outline(cap, { px: 2.6 }); outline(ruff, { px: 2 });
  return b;
}
export function official(o = {}) { // the presiding church official: purple robe, skullcap, spectacles
  const b = bean({ name: 'Official', outfit: 'robe', colors: { main: '#5a2a6a', trim: '#e8c25a' }, skin: o.skin || 'fair', hair: 'horseshoe', hairColor: '#cfcac2', glasses: true, seed: o.seed || 103 });
  const sc = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 8, 0, Math.PI * 2, 0, 0.8), toon('#7a2a8a')); sc.position.y = 0.04; b.parts.head.add(sc); return b;
}
export function townsperson(o = {}) {
  const r = rng(o.seed || 111); return bean({ name: 'Town', outfit: o.outfit || (r() > 0.5 ? 'tunic' : 'robe'), colors: { main: o.main || ['#3f6fa8', '#8a5a3a', '#4a7a4a', '#a35a3a', '#6a4a7a'][Math.floor(r() * 5)], trim: '#e8dcc0' },
    skin: o.skin || ['fair', 'light', 'tan'][Math.floor(r() * 3)], hair: o.hair || ['bowl', 'curly', 'bun', 'messy'][Math.floor(r() * 4)], hairColor: ['#3a2416', '#6a4a2a', '#9a6a3a', '#2a1a14'][Math.floor(r() * 4)], seed: o.seed || 111, scale: o.scale || 1 });
}
export function crier(o = {}) {   // town crier with a bell
  const b = bean({ name: 'Crier', outfit: 'tunic', colors: { main: '#a3352b', trim: '#e8c25a' }, skin: 'tan', hair: 'curly', hairColor: '#3a2416', head: 'cap', headColor: '#2a4a7a', moustache: '#3a2416', seed: o.seed || 107 }); return b;
}
// ---------------------------------------------------------------- PROPS
export function scrollProp(o = {}) { const g = new THREE.Group(); const p = box(0.5, 0.7, 0.01, '#f2e6c4', 0, 0, 0); g.add(p); for (const y of [-0.36, 0.36]) { const r = cyl(0.04, 0.04, 0.6, '#c9a14a', 0, y, 0, 10); r.rotation.z = Math.PI / 2; g.add(r); } outline(g, { px: 1.8 }); return g; }
export function gavel() { const g = new THREE.Group(); const h = cyl(0.13, 0.13, 0.42, '#5a3820', 0, 0, 0, 14); h.rotation.z = Math.PI / 2; g.add(h); g.add(cyl(0.03, 0.03, 0.6, '#7a4c2c', 0, -0.3, 0, 8)); outline(g, { px: 2 }); return g; }
export function ratBench(n = 5) { const g = new THREE.Group(); g.add(rbox(3.2, 0.12, 0.7, '#7a4c2c', 0, 1.0, 0, 0.03)); for (const s of [-1, 1]) g.add(rbox(0.12, 1.0, 0.6, '#6a4228', s * 1.5, 0.5, 0, 0.02)); g.add(rbox(3.2, 0.6, 0.08, '#6a4228', 0, 1.35, -0.32, 0.02)); outline(g, { px: 2.2 }); return g; }
export function lectern() { const g = new THREE.Group(); g.add(rbox(0.9, 1.3, 0.6, '#6a4228', 0, 0.65, 0, 0.04)); const top = rbox(1.0, 0.08, 0.7, '#5a3820', 0, 1.36, 0.05, 0.02); top.rotation.x = 0.25; g.add(top); outline(g, { px: 2.2 }); return g; }

// ---------------------------------------------------------------- SETS
let _stone = null; const stoneTex = () => (_stone ||= canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#c9b896'; g.fillRect(0, 0, W, H); const r = rng(3); for (let y = 0; y < H; y += 40) for (let x = (y / 40) % 2 ? -40 : 0; x < W; x += 80) { g.fillStyle = `hsl(40, ${18 + r() * 8}%, ${62 + r() * 10}%)`; g.fillRect(x + 3, y + 3, 74, 34); } }, { repeat: [5, 3] }));
export function courtHall(st, o = {}) { // stone church-court hall: arches, tall windows, a raised bench, the defendants' (rats') bench
  const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 30, '#8a7a62'); fl.receiveShadow = true; g.add(fl); const tiles = PR.rug({ w: 3, d: 12, color: '#7a2a2a' }); tiles.position.set(0, 0.01, 2); g.add(tiles);
  const sm = toon('#ffffff', { map: stoneTex() });
  const back = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 0.4), sm); back.position.set(0, 7, -5); back.receiveShadow = true; g.add(back);
  for (const x of [-4.2, 4.2]) { const w = new THREE.Group(); w.add(box(1.4, 3.6, 0.1, '#7ab0d8', 0, 0, 0)); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16, 1, false, -Math.PI / 2, Math.PI), toon('#7ab0d8')); a.rotation.x = Math.PI / 2; a.position.y = 1.8; w.add(a); w.add(box(0.08, 4.2, 0.12, '#5a4a3a', 0, 0.3, 0.03)); w.position.set(x, 5.5, -4.75); g.add(w); }
  for (const x of [-7, 7]) g.add(cyl(0.45, 0.5, 12, '#bfae8c', x, 6, -4.2, 14));
  const bench = new THREE.Group(); bench.add(rbox(5, 2.0, 1.3, '#6a4228', 0, 1.0, 0, 0.06)); bench.add(rbox(5.3, 0.14, 1.5, '#5a3820', 0, 2.05, 0, 0.03)); bench.position.set(0, 0, -3.1); outline(bench, { px: 2.4 }); g.add(bench);
  g.add(rbox(5.6, 0.6, 2.4, '#5a3820', 0, 0.3, -3.8, 0.04));
  const cross = new THREE.Group(); cross.add(box(0.18, 1.4, 0.08, '#d4a73a', 0, 0, 0)); cross.add(box(0.8, 0.18, 0.08, '#d4a73a', 0, 0.25, 0)); cross.position.set(0, 7.6, -4.75); g.add(cross);
  return { group: g, update() {} };
}
export function barleyField(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const ground = floor(80, 80, '#9a7a4a'); ground.receiveShadow = true; g.add(ground);
  const r = rng(o.seed || 5); const stalks = [];
  for (let i = 0; i < (o.n || 260); i++) { const s = barleyStalk(i, 1.1 + r() * 0.5); s.position.set((r() - 0.5) * 16, 0, -r() * 14 + 3); s.userData.ph = r() * 6; g.add(s); stalks.push(s); }
  const hills = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), toon('#8aa858')); hills.scale.set(40, 5, 8); hills.position.set(0, -1, -30); g.add(hills);
  const sky = sunnySky(st, { clouds: 6, seed: 9 });
  return { group: g, sky, stalks, update(t) { sky.update(t); stalks.forEach(s => { s.rotation.z = Math.sin(t * 1.5 + s.userData.ph) * 0.06; }); } };
}
export function village(st, o = {}) { // half-timbered French village street
  const g = new THREE.Group(); st.add(g); const road = floor(60, 60, '#a8987a'); road.receiveShadow = true; g.add(road);
  const r = rng(o.seed || 6);
  const house = (x, z, ry) => { const h = new THREE.Group(); const w = 3.2 + r(), ht = 4 + r() * 1.5; const body = new THREE.Mesh(new THREE.BoxGeometry(w, ht, 3), toon(['#efe2c4', '#e8d4b0', '#f2e8d2'][Math.floor(r() * 3)])); body.position.y = ht / 2; body.castShadow = true; body.receiveShadow = true; h.add(body);
    for (const bx of [-w / 2 + 0.1, 0, w / 2 - 0.1]) h.add(box(0.16, ht, 0.06, '#5a3a22', bx, ht / 2, 1.52)); h.add(box(w, 0.16, 0.06, '#5a3a22', 0, ht * 0.5, 1.52)); h.add(box(w, 0.16, 0.06, '#5a3a22', 0, ht - 0.1, 1.52));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 2.2, 4), toon('#a8503a')); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.75; roof.position.y = ht + 1.0; roof.castShadow = true; h.add(roof);
    h.add(box(0.9, 1.6, 0.08, '#6a4228', 0.4, 0.8, 1.53)); h.add(box(0.7, 0.7, 0.08, '#7ab0d8', -0.8, 2.9, 1.53)); h.position.set(x, 0, z); h.rotation.y = ry; outline(h, { px: 2 }); g.add(h); return h; };
  for (let i = -4; i <= 4; i++) house(i * 4.2, -6, 0);
  const sky = sunnySky(st, { clouds: 6, seed: 7 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
