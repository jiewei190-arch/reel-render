// Defenestration of Prague (23 May 1618): shared assets. EMOTION: LOL. Deadpan narrator.
// Tone guard: nobody is shown hurt. The fall is cartoon flailing in mid-air (cut away before any landing), the "landing"
// shots are soft (angels catching them / a squashy manure pile), and survivors sit up dazed but fine. Original toons only.
import { E, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, toonStage, blob } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { sph, mesh } from './_common.js';
export * from './_common.js';
export { PR, FX, sunnySky, bean, blob };

// ---------------------------------------------------------------- PEOPLE (1618, original toons)
export function featherHat(b, color = '#2a2a30', feather = '#e8e0d0') {
  const g = new THREE.Group(); g.add(cyl(0.3, 0.36, 0.34, color, 0, 0.5, 0, 22)); const brim = cyl(0.78, 0.78, 0.04, color, 0, 0.34, 0, 28); brim.rotation.z = 0.12; g.add(brim);
  const f = mesh(sph, toon(feather), 0.09, 0.42, 0.06); f.position.set(-0.3, 0.75, -0.1); f.rotation.z = 0.7; g.add(f); outline(g, { px: 3 }); g.rotation.x = -0.1; b.parts.head.add(g); b.hat = g; return g;
}
export function collar(b, color = '#f4f0e4') { const c = cyl(0.42, 0.3, 0.08, color, 0, -0.47, 0.04, 24); outline(c, { px: 2.4 }); b.parts.head.add(c); return c; }
// angry Protestant noble: doublet, cape colour, feathered hat
export function noble(o = {}) {
  const b = bean({ name: 'Noble', outfit: 'uniform', colors: { main: o.main || '#3a4a6a', trim: '#d8c08a', belt: '#2a2018' }, skin: o.skin || 'light', hair: 'long', hairColor: o.hairColor || '#4a2e18',
    moustache: o.hairColor || '#4a2e18', beard: o.beard ?? true, beardColor: o.hairColor || '#4a2e18', seed: o.seed || 3 });
  collar(b); featherHat(b, o.hat || '#2a2a30', o.feather || '#d8382a'); return b;
}
// royal governor (lord regent): rich robe, gold chain
export function governor(o = {}) {
  const b = bean({ name: 'Gov', outfit: 'robe', colors: { main: o.main || '#6a1e2a', trim: '#e8c25a' }, skin: o.skin || 'fair', hair: o.hair || 'horseshoe', hairColor: o.hairColor || '#8a8a8a',
    moustache: o.hairColor || '#8a8a8a', beard: true, beardColor: o.hairColor || '#8a8a8a', seed: o.seed || 11 });
  collar(b); const ch = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 24, Math.PI), toon('#f2c23a')); ch.rotation.set(0, 0, Math.PI); ch.position.set(0, -0.62, 0.22); b.parts.head.add(ch); return b;
}
// the secretary: smaller, glasses, a stack of papers
export function secretary(o = {}) { const b = bean({ name: 'Sec', outfit: 'uniform', colors: { main: '#2a2a30', trim: '#e8e2d2', belt: '#18171c' }, skin: 'light', hair: 'bowl', hairColor: '#3a2416', glasses: true, seed: o.seed || 21, scale: 0.88 }); collar(b); return b; }
export function angel(o = {}) {
  const b = bean({ name: 'Angel', outfit: 'robe', colors: { main: '#f6f2ea', trim: '#f2c23a' }, skin: o.skin || 'fair', hair: 'curly', hairColor: o.hairColor || '#e8c25a', seed: o.seed || 51, scale: o.scale || 0.9 });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 32), toon('#ffd84a', { emissive: new THREE.Color('#ffd84a'), emissiveIntensity: 0.6 })); halo.rotation.x = Math.PI / 2; halo.position.y = 0.78; b.parts.head.add(halo);
  const wings = []; for (const s of [-1, 1]) { const w = new THREE.Group(); for (let i = 0; i < 4; i++) { const f = mesh(sph, toon('#ffffff'), 0.14, 0.55 - i * 0.08, 0.05); f.position.set(s * (0.18 + i * 0.16), 0.2 - i * 0.06, 0); f.rotation.z = s * (0.5 + i * 0.25); w.add(f); } outline(w, { px: 2.4 }); w.position.set(s * 0.2, 1.35, -0.3); b.add(w); wings.push({ w, s }); }
  b.flap = (t) => wings.forEach(({ w, s }) => { w.rotation.y = s * (0.3 + 0.35 * Math.sin(t * 9)); });
  return b;
}
export function historian(o = {}) { return bean({ name: 'Historian', outfit: 'tee', colors: { main: '#5a8a6a', trim: '#ffffff', print: '#f2d04a' }, skin: o.skin || 'brown', hair: 'curly', hairColor: '#1a1210', glasses: true, seed: o.seed || 61 }); }

// ---------------------------------------------------------------- CASTLE
const stoneT = {};
export function stoneTex(c = '#c8bca8', rep = [4, 4]) { const k = c + rep; if (stoneT[k]) return stoneT[k]; const t = canvasTex(256, 256, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(80,70,60,.35)'; x.lineWidth = 4; for (let y = 0; y < h; y += 42) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); for (let k = 0; k < 4; k++) { const xx = ((y / 42) % 2 ? 32 : 0) + k * 64; x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y + 42); x.stroke(); } } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return (stoneT[k] = t); }
// tall castle wall with one open window (the window opening is at y = winY, x = 0, on the +Z face)
export function castleWall(o = {}) {
  const g = new THREE.Group(); const H = o.H || 24, W = o.W || 16, winY = o.winY ?? 18, ww = 1.8, wh = 2.6;
  const mat = toon('#ffffff', { map: stoneTex('#d8ccb4', [W / 4, H / 4]) });
  const part = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), mat); m.position.set(x, y, -1); m.castShadow = m.receiveShadow = true; m.userData.noOutline = true; g.add(m); };
  const lo = winY - wh / 2, hi = winY + wh / 2;
  part(W, lo, 0, lo / 2); part(W, H - hi, 0, hi + (H - hi) / 2); part((W - ww) / 2, wh, -(ww / 2 + (W - ww) / 4), winY); part((W - ww) / 2, wh, ww / 2 + (W - ww) / 4, winY);
  const room = plane(8, 6, '#3a2a20', 0, winY, -4.5); g.add(room); const rf = floor(8, 3, '#5a3a22', 0, -3); rf.position.y = winY - wh / 2 - 0.9; g.add(rf);
  const fr = new THREE.Group(); fr.add(box(ww + 0.4, 0.25, 0.4, '#8a7a62', 0, lo - 0.1, 0.1), box(ww + 0.4, 0.25, 0.4, '#8a7a62', 0, hi + 0.1, 0.1), box(0.2, wh + 0.4, 0.4, '#8a7a62', -ww / 2 - 0.1, winY, 0.1), box(0.2, wh + 0.4, 0.4, '#8a7a62', ww / 2 + 0.1, winY, 0.1)); fr.children.forEach(c => c.userData.noOutline = true); g.add(fr);
  for (const s of [-1, 1]) { const sh = rbox(0.85, wh, 0.08, '#4a6a3a', s * (ww / 2 + 0.5), winY, 0.35, 0.03); sh.rotation.y = s * 0.5; outline(sh, { px: 2.2 }); g.add(sh); }
  for (const x of [-5, 5]) g.add(plane(1.0, 1.6, '#2a2620', x, winY - 7, 0.02));
  g.winY = winY; g.floorY = winY - wh / 2 - 0.9; return g;
}
// stylised hilltop castle skyline (not a replica): long palace block + a tall cathedral-ish spire + towers
export function castleHill(st) {
  const g = new THREE.Group(); st.add(g);
  const hill = mesh(sph, toon('#6a9a4a'), 30, 6, 14); hill.position.set(0, -2, -30); g.add(hill);
  const pal = new THREE.Mesh(new THREE.BoxGeometry(24, 5, 4), toon('#ffffff', { map: stoneTex('#ece2cc', [6, 1]) })); pal.position.set(-2, 5.5, -26); pal.castShadow = true; pal.userData.noOutline = true; g.add(pal);
  const roof = box(24.4, 1.2, 4.4, '#b8503a', -2, 8.6, -26); roof.userData.noOutline = true; g.add(roof);
  for (let i = 0; i < 12; i++) { const w = plane(0.6, 1.2, '#3a4a5a', -12.5 + i * 2, 5.6, -23.98); g.add(w); }
  const spire = (x, z, h, w) => { const b = box(w, h, w, '#c8bca8', x, 3 + h / 2, z); b.userData.noOutline = true; g.add(b); const c = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, w * 2.4, 8), toon('#4a7a6a')); c.position.set(x, 3 + h + w * 1.2, z); g.add(c); };
  spire(6, -30, 12, 2.2); spire(9, -30, 9, 1.6); spire(-14, -27, 5, 2.4);
  const sky = sunnySky(st, { clouds: 6, seed: 3 }); return { group: g, sky, update(t) { sky.update(t); } };
}
// a soft cartoon manure heap (brown lumpy dome) with buzzing flies + stink; .update(t)
export function manure() {
  const g = new THREE.Group(); const r = rng(9); const m1 = toon('#6a4a26'), m2 = toon('#7a5a30'), m3 = toon('#5a3a1e');
  const base = mesh(sph, m1, 2.4, 0.9, 1.9); base.position.y = 0.1; g.add(base);
  for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, d = r() * 1.6; const b = mesh(sph, [m1, m2, m3][i % 3], 0.5 + r() * 0.4, 0.35 + r() * 0.2, 0.5 + r() * 0.3); b.position.set(Math.cos(a) * d, 0.6 + (1.6 - d) * 0.3, Math.sin(a) * d * 0.8); g.add(b); }
  for (let i = 0; i < 8; i++) { const s = cyl(0.02, 0.02, 0.8, '#e8c86a', (r() - 0.5) * 3, 0.9, (r() - 0.5) * 2, 5); s.rotation.set(r() * 1.2, r() * 3, r() * 1.2); g.add(s); }   // straw
  outline(g, { px: 2.6 });
  const flies = []; for (let i = 0; i < 6; i++) { const f = ball(0.06, '#1a1a1a', 0, 0, 0, 8); g.add(f); flies.push(f); }
  g.update = (t) => flies.forEach((f, i) => { const a = t * (3 + i * 0.4) + i; f.position.set(Math.cos(a) * (0.8 + i * 0.2), 1.8 + Math.sin(t * 7 + i) * 0.3 + i * 0.1, Math.sin(a) * (0.6 + i * 0.1)); });
  return g;
}
export function floatPapers(n = 10, seed = 3) { const g = new THREE.Group(); const ps = []; const r = rng(seed); for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.006, 0.4), toon('#f4ecd8')); p.castShadow = true; g.add(p); ps.push({ p, a: r() * 6, s: 0.5 + r(), x: (r() - 0.5) * 4, z: (r() - 0.5) * 2 }); }
  g.update = (t) => ps.forEach(({ p, a, s, x, z }, i) => { p.position.set(x + Math.sin(t * s + a) * 0.6, 1 + ((i * 0.7 + t * 0.6) % 5), z); p.rotation.set(Math.sin(t * 3 + a), t * s, Math.cos(t * 2 + a)); }); return g; }
