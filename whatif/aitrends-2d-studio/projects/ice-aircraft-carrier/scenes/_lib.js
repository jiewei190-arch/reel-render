// The Ice Aircraft Carrier (Project Habakkuk) — shared assets: a giant glowing-ice carrier, a cartoon ocean, toon WWII
// planes, a U-boat, a convoy freighter, sailors/officers/Pyke beans, pykrete blocks, a Canadian mountain lake + the small
// prototype, plus 2D overlay helpers (hook text, rubber stamps, folder, price tag, map). Underscore = not auto-loaded.
// Tone guard: nobody hurt; the ricochet is a cartoon zig-zag with "PING!"; no real logos / national insignia.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };

// ---------------------------------------------------------------- ICE
export const ICE = '#cdeefc', ICE2 = '#9fd8f2', ICE3 = '#e9f8ff', PYK = '#d9e6e2';
const iceMat = (c = ICE, k = 0.32) => toon(c, { emissive: new THREE.Color(c), emissiveIntensity: k });
// frosty crack texture for big ice faces
let _crack = null;
const crackTex = () => (_crack ||= canvasTex(512, 256, (x, W, H) => {
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); const r = rng(11);
  for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(150,205,235,${0.15 + r() * 0.2})`; x.beginPath(); x.ellipse(r() * W, r() * H, 20 + r() * 60, 8 + r() * 20, r() * 3, 0, 7); x.fill(); }
  x.strokeStyle = 'rgba(120,180,215,0.8)'; x.lineWidth = 3;
  for (let i = 0; i < 14; i++) { let px = r() * W, py = r() * H; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 90; py += (r() - 0.3) * 50; x.lineTo(px, py); } x.stroke(); }
  x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 5; for (let i = 0; i < 10; i++) { const px = r() * W, py = r() * H; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 30 + r() * 40, py - 6); x.stroke(); }
}, { repeat: [3, 1] }));
// iceCarrier({ L }) — the glowing ice "bergship": a long, thick slab hull, a flat deck with runway lines, an ice island.
// Origin at the waterline centre; bow toward -Z. Deck top at y = deckY.
export function iceCarrier(o = {}) {
  const L = o.L || 40, W = o.W || 9, H = o.H || 4.2, g = new THREE.Group();
  const hullM = toon('#ffffff', { map: crackTex(), emissive: new THREE.Color(ICE2), emissiveIntensity: 0.28 }); hullM.color = new THREE.Color(ICE);
  const hull = mesh(new THREE.BoxGeometry(W, H, L), hullM); hull.position.y = H / 2 - 1.2; g.add(hull);
  // rounded bow + stern blocks
  for (const s of [-1, 1]) { const cap = mesh(new THREE.CylinderGeometry(W / 2, W / 2, H, 24, 1, false, s < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI), hullM); cap.position.set(0, H / 2 - 1.2, s * L / 2); g.add(cap); }
  const deckY = H - 1.2 + 0.02;
  const deckT = canvasTex(256, 1024, (x, Wd, Hd) => { x.fillStyle = '#e4f5fc'; x.fillRect(0, 0, Wd, Hd); x.fillStyle = 'rgba(160,210,235,0.5)'; const r = rng(4); for (let i = 0; i < 40; i++) { x.beginPath(); x.ellipse(r() * Wd, r() * Hd, 8 + r() * 30, 4 + r() * 10, 0, 0, 7); x.fill(); }
    x.fillStyle = '#5a8fb0'; for (let i = 0; i < 18; i++) x.fillRect(Wd / 2 - 5, 30 + i * 56, 10, 30); x.fillStyle = '#ffffff'; x.fillRect(16, 0, 8, Hd); x.fillRect(Wd - 24, 0, 8, Hd); });
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.98, L), toon('#ffffff', { map: deckT, emissive: new THREE.Color('#dff4ff'), emissiveIntensity: 0.18 })); deck.rotation.x = -Math.PI / 2; deck.position.y = deckY + 0.01; deck.receiveShadow = true; deck.userData.noOutline = true; g.add(deck);
  // island (bridge tower), all ice
  const isl = new THREE.Group(); isl.position.set(W / 2 - 1.3, deckY, o.islandZ ?? 3); g.add(isl);
  isl.add(rbox(1.6, 2.6, 4.2, ICE, 0, 1.3, 0, 0.25), rbox(1.3, 1.1, 2.6, ICE3, 0, 3.15, 0.3, 0.2), rbox(1.45, 0.42, 2.8, '#7fc4e4', 0, 3.25, 0.3, 0.06), cyl(0.12, 0.16, 1.4, ICE2, 0, 4.3, 0.6, 10));
  isl.children.forEach(m => { m.material = iceMat(m.material.color.getStyle ? '#' + m.material.color.getHexString() : ICE, 0.3); });
  // icicles along the deck edge
  const ic = iceMat(ICE3, 0.4); const r = rng(9);
  for (let i = 0; i < 26; i++) { for (const s of [-1, 1]) { if (r() < 0.35) continue; const c = mesh(new THREE.ConeGeometry(0.12 + r() * 0.1, 0.5 + r() * 0.6, 6).rotateX(Math.PI), ic); c.position.set(s * (W / 2 + 0.02), deckY - 0.35, -L / 2 + 1 + i * (L - 2) / 25); g.add(c); } }
  outline(g, { px: 2.6 });
  const halo = glow(L * 0.9, '#bfeaff', 0.32); halo.position.set(0, deckY + 1, 0); g.add(halo);
  g.deckY = deckY; g.L = L; g.W = W; g.island = isl; return g;
}
// pykrete / ice block on a table: ice = clear blue; pykrete = speckled grey-beige
export function block(kind = 'pykrete', s = 0.55) {
  const tex = canvasTex(128, 128, (x, W, H) => { const r = rng(kind === 'ice' ? 3 : 8); x.fillStyle = kind === 'ice' ? '#c6ecfa' : '#d6dcd2'; x.fillRect(0, 0, W, H);
    if (kind === 'ice') { x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 4; for (let i = 0; i < 5; i++) { const px = r() * W, py = r() * H; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 25, py - 8); x.stroke(); } }
    else { for (let i = 0; i < 220; i++) { x.fillStyle = r() < 0.5 ? 'rgba(150,120,80,0.55)' : 'rgba(110,90,60,0.45)'; x.fillRect(r() * W, r() * H, 2 + r() * 5, 1 + r() * 2); } } });
  const m = mesh(new THREE.BoxGeometry(s, s * 0.8, s), toon('#ffffff', { map: tex, emissive: new THREE.Color(kind === 'ice' ? '#bfe8fa' : '#cfd5c8'), emissiveIntensity: kind === 'ice' ? 0.3 : 0.12 }));
  const g = new THREE.Group(); m.position.y = s * 0.4; g.add(m); outline(g, { px: 2.6 }); g.mesh = m; return g;
}

// ---------------------------------------------------------------- SEA
// cartoon ocean: a big plane with a scrolling wave-stripe texture + a darker horizon band
export function ocean(st, o = {}) {
  const tex = canvasTex(512, 512, (x, W, H) => { x.fillStyle = o.color || '#2f7fb8'; x.fillRect(0, 0, W, H); const r = rng(5);
    for (let i = 0; i < 70; i++) { const px = r() * W, py = r() * H, w = 18 + r() * 40; x.strokeStyle = r() < 0.6 ? 'rgba(255,255,255,0.55)' : 'rgba(20,70,120,0.45)'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + w / 2, py - 8, px + w, py); x.stroke(); } }, { repeat: [o.rep || 30, o.rep || 30] });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), toon('#ffffff', { map: tex })); m.rotation.x = -Math.PI / 2; m.position.y = o.y ?? 0; m.receiveShadow = true; m.userData.noOutline = true; st.add(m);
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3, top: '#3f7fc4', mid: '#9fcbea', horizon: '#e9f2f4', ...(o.sky || {}) });
  return { sea: m, sky, update(t) { tex.offset.set(t * 0.012, t * 0.02); sky.update(t); } };
}
// foam ring around a hull at the waterline (white flattened torus segments)
export function foam(w, l) { const g = new THREE.Group(); const m = toon('#ffffff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 6, 40), m); ring.rotation.x = Math.PI / 2; ring.scale.set(w * 0.6, l * 0.56, 1); ring.userData.noOutline = true; g.add(ring); return g; }

// toon WWII plane (generic, no insignia). Faces -Z (nose forward). ~3 units long. .update(t) spins the prop.
export function warPlane(o = {}) {
  const c = o.color || '#6f7d5a', c2 = o.belly || '#c9d2c2', g = new THREE.Group();
  const fus = mesh(new THREE.CapsuleGeometry(0.28, 2.0, 8, 16).rotateX(Math.PI / 2), toon(c)); g.add(fus);
  const belly = mesh(new THREE.CapsuleGeometry(0.22, 1.6, 6, 12).rotateX(Math.PI / 2), toon(c2)); belly.position.y = -0.1; belly.userData.noOutline = true; g.add(belly);
  const wing = rbox(3.4, 0.08, 0.7, c, 0, -0.08, -0.2, 0.04); g.add(wing);
  const tail = rbox(1.2, 0.06, 0.4, c, 0, 0.05, 1.15, 0.03); const fin = rbox(0.06, 0.55, 0.45, c, 0, 0.35, 1.2, 0.03); g.add(tail, fin);
  const can = mesh(new THREE.SphereGeometry(0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#9fd8f2', { emissive: new THREE.Color('#9fd8f2'), emissiveIntensity: 0.3 })); can.scale.set(1, 0.9, 1.7); can.position.set(0, 0.2, -0.2); g.add(can);
  const nose = cyl(0.26, 0.29, 0.25, o.nose || '#c0392b', 0, 0, -1.3, 16); nose.rotation.x = Math.PI / 2; g.add(nose);
  const hub = ball(0.1, '#2a2a2a', 0, 0, -1.45, 10); g.add(hub);
  const prop = new THREE.Group(); prop.position.set(0, 0, -1.47); g.add(prop);
  prop.add(rbox(0.08, 1.1, 0.03, '#2a2a2a', 0, 0, 0, 0.02));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.18 })); disc.userData.noOutline = true; prop.add(disc);
  if (o.tanks) for (const s of [-1, 1]) { const tk = mesh(new THREE.CapsuleGeometry(0.11, 0.6, 6, 10).rotateX(Math.PI / 2), toon('#d8d4c6')); tk.position.set(s * 0.9, -0.28, -0.2); g.add(tk); }
  for (const s of [-1, 1]) { const w2 = ball(0.1, '#2a2a2a', s * 0.6, -0.5, -0.4, 10); const st2 = cyl(0.03, 0.03, 0.4, '#555', s * 0.6, -0.3, -0.4, 6); g.add(w2, st2); g.wheels = (g.wheels || []).concat([w2, st2]); }
  outline(g, { px: 2.4 });
  g.update = (t) => { prop.rotation.z = t * 40; }; g.prop = prop; return g;
}
// U-boat: dark cigar hull (mostly underwater), conning tower, periscope
export function uBoat(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#4a5560';
  const hull = mesh(new THREE.CapsuleGeometry(0.7, 6, 8, 16).rotateZ(Math.PI / 2), toon(c)); hull.scale.y = 0.7; g.add(hull);
  g.add(rbox(1.4, 1.1, 0.9, shadeHex(c, -0.1), 0.4, 0.8, 0, 0.18), cyl(0.05, 0.05, 1.2, '#3a4048', 0.5, 1.8, 0, 8), rbox(0.25, 0.12, 0.12, '#3a4048', 0.62, 2.35, 0, 0.03));
  for (let i = 0; i < 6; i++) { const r = rbox(0.06, 0.06, 0.06, '#e8e2cc', -1.5 + i * 0.6, 0.45, 0.48, 0.02); r.userData.noOutline = true; g.add(r); }
  outline(g, { px: 2.4 }); return g;
}
// convoy freighter: hull, deck house, funnel, masts
export function freighter(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#5a4a44';
  const hull = rbox(2.2, 1.6, 9, c, 0, 0.4, 0, 0.3); g.add(hull);
  g.add(rbox(2.25, 0.25, 9.05, '#b8322a', 0, -0.25, 0, 0.05), rbox(1.6, 1.2, 2.2, '#efe6d0', 0, 1.7, 1.6, 0.1), cyl(0.35, 0.4, 1.4, '#2a2a2a', 0, 2.8, 1.8, 14), cyl(0.36, 0.36, 0.3, '#e0b040', 0, 3.1, 1.8, 14));
  for (const z of [-3, 3.6]) g.add(cyl(0.06, 0.06, 3.4, '#6a5a4a', 0, 2.6, z, 6));
  g.add(rbox(1.4, 0.6, 1.4, '#7a6a3a', 0, 1.5, -2.2, 0.06), rbox(1.4, 0.6, 1.4, '#6a7a8a', 0, 1.5, -0.6, 0.06));
  outline(g, { px: 2.4 }); return g;
}

// ---------------------------------------------------------------- PEOPLE
export const sailor = (o = {}) => bean({ name: 'Sailor', outfit: 'uniform', head: 'cap', headColor: '#f4f2ec', skin: o.skin || 'fair', hair: 'bowl', hairColor: o.hairColor || '#3a2618', colors: { main: '#25385a', legs: '#1e2a44' }, seed: o.seed || 3, ...(o.over || {}) });
export const navyOfficer = (o = {}) => bean({ name: 'Officer', outfit: 'uniform', head: 'cap', headColor: '#1b2438', skin: o.skin || 'fair', hair: 'swoop', hairColor: o.hairColor || '#2a1a12', colors: { main: '#1e2a44', legs: '#1a2236' }, seed: o.seed || 5, ...(o.over || {}) });
export const general = (o = {}) => bean({ name: 'General', outfit: 'uniform', head: 'cap', headColor: '#6a5a3a', skin: o.skin || 'fair', hair: 'horseshoe', hairColor: '#8a8580', colors: { main: '#7a6a48' }, seed: o.seed || 7, ...(o.over || {}) });
export const inventor = (o = {}) => bean({ name: 'Pyke', outfit: 'labcoat', head: 'none', skin: 'fair', hair: 'messy', hairColor: '#5a3a26', beard: true, glasses: true, seed: o.seed || 13, ...(o.over || {}) });
export const clerk = (o = {}) => bean({ name: 'Clerk', outfit: 'uniform', head: 'none', skin: 'fair', hair: 'swoop', hairColor: '#3a2618', glasses: true, colors: { main: '#5a6a7a' }, seed: o.seed || 17 });

// toy pistol (dark, chunky, cartoon) — held by the officer
export function pistol() { const g = new THREE.Group(); g.add(rbox(0.07, 0.07, 0.32, '#2a2a30', 0, 0, -0.1, 0.02), rbox(0.07, 0.18, 0.08, '#3a2a22', 0, -0.1, 0.03, 0.02)); outline(g, { px: 2 }); return g; }

// ---------------------------------------------------------------- SETS
// conference room: blue-grey walls, tall windows, long table with a cloth
export function confRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#7a5a40', 0, 0));
  const wall = plane(30, 9, o.wall || '#5a6a7a', 0, 4.5, -4); wall.receiveShadow = true; g.add(wall);
  g.add(plane(30, 1.4, '#3e4a56', 0, 0.7, -3.98));
  for (const x of [-4.5, 4.5]) { g.add(plane(2.2, 3.6, '#cfe6f4', x, 4.3, -3.97)); g.add(rbox(2.5, 0.16, 0.16, '#efe8d8', x, 2.45, -3.9, 0.03), rbox(2.5, 0.16, 0.16, '#efe8d8', x, 6.15, -3.9, 0.03), rbox(0.12, 3.8, 0.12, '#efe8d8', x, 4.3, -3.9, 0.02)); }
  const tb = PR.table({ w: 5.2, d: 1.6, h: 1.0, color: '#6a4a30' }); tb.position.set(0, 0, 0.2); g.add(tb);
  const cloth = rbox(5.3, 0.04, 1.7, '#2f5a3a', 0, 1.07, 0.2, 0.01); g.add(cloth);
  outline(tb, { px: 2.4 }); outline(g, { px: 2.2 });
  return { group: g, tableY: 1.1, update() {} };
}
// lab: white tiles, a bench, a fridge, buckets of pulp
export function lab(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#b8c4c8', 0, 0));
  const tiles = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#eef3f2'; x.fillRect(0, 0, W, H); x.strokeStyle = '#c4d2d4'; x.lineWidth = 4; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, H); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(W, i * 64); x.stroke(); } }, { repeat: [10, 3] });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), toon('#ffffff', { map: tiles })); wall.position.set(0, 4.5, -4); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  const tb = PR.table({ w: 4.6, d: 1.4, h: 1.0, color: '#8a8f96' }); tb.position.set(0, 0, 0.2); g.add(tb);
  const fr = new THREE.Group(); fr.add(rbox(1.6, 3.2, 1.2, '#e8ecee', 0, 1.6, 0, 0.12), rbox(0.1, 0.8, 0.1, '#9aa0a6', 0.6, 2.2, 0.62, 0.03)); fr.position.set(-4.2, 0, -3); g.add(fr);
  outline(g, { px: 2.2 });
  return { group: g, tableY: 1.06, update() {} };
}
// office: warm wall, desk, a lamp, a chalkboard
export function office(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#6a5440', 0, 0));
  const wall = plane(30, 9, '#8a6a4a', 0, 4.5, -4); g.add(wall); g.add(plane(30, 1.4, '#5a4430', 0, 0.7, -3.98));
  const board = plane(6, 3.4, '#2f4a3a', 0, 4.4, -3.96); g.add(board); g.add(rbox(6.3, 0.16, 0.16, '#6a4a30', 0, 2.62, -3.9, 0.03));
  const desk = PR.fieldDesk(); desk.position.set(0.9, 0, 0.6); g.add(desk);
  outline(g, { px: 2.2 });
  return { group: g, board, update() {} };
}
// mountain lake (Patricia Lake, Alberta — stylised): water, pine-dotted shore, snowy peaks
export function mountainLake(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const lake = ocean(st, { color: '#3a8a9a', rep: 40, seed: 6, sky: { top: '#3a78c0', mid: '#a8d0ea', horizon: '#eef4f0', clouds: 5 } });
  const shoreM = toon('#5f8a4a'); const r = rng(o.seed || 2);
  for (const [x, z, rr, h, snow] of [[-60, -110, 34, 46, 1], [10, -140, 44, 62, 1], [75, -105, 30, 40, 1], [-110, -80, 30, 30, 0], [120, -70, 30, 28, 0]]) {
    const m = mesh(new THREE.ConeGeometry(rr, h, 7), toon(snow ? '#7a8a9a' : '#6a7a6a')); m.position.set(x, h / 2 - 2, z); g.add(m);
    if (snow) { const cap = mesh(new THREE.ConeGeometry(rr * 0.42, h * 0.42, 7), toon('#f6f8fa', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.2 })); cap.position.set(x, h - h * 0.21 - 2, z); g.add(cap); }
  }
  const shore = mesh(new THREE.CylinderGeometry(70, 70, 0.6, 40, 1, false, Math.PI * 0.7, Math.PI * 0.6), shoreM); shore.position.set(0, 0.05, -10); g.add(shore);
  for (let i = 0; i < 40; i++) { const a = Math.PI * 0.72 + r() * Math.PI * 0.56, d = 55 + r() * 12; const p = mesh(new THREE.ConeGeometry(1.2 + r(), 4 + r() * 3, 7), toon(r() < 0.5 ? '#2f5a3a' : '#3a6a42')); p.position.set(Math.sin(a) * d, 2.4, -10 - Math.cos(a) * d * -1); if (p.position.z > -20) continue; g.add(p); }
  outline(g, { px: 2 });
  return { group: g, lake, update(t) { lake.update(t); } };
}
// the small prototype: a wooden boathouse box on an ice block, with a tiny refrigeration motor + fan on the roof
export function prototype(o = {}) {
  const g = new THREE.Group(); const iceM = iceMat(ICE, 0.3);
  const base = mesh(new THREE.BoxGeometry(6, 1.6, 3), iceM); base.position.y = 0.2; g.add(base);
  const house = rbox(5.4, 1.8, 2.6, '#9a6a3a', 0, 1.9, 0, 0.08); g.add(house);
  const roof = mesh(new THREE.CylinderGeometry(1.6, 1.6, 5.6, 3, 1).rotateZ(Math.PI / 2), toon('#6a3a2a')); roof.scale.set(1, 0.55, 0.95); roof.position.y = 3.0; roof.rotation.x = Math.PI / 6 * 0; g.add(roof);
  const motor = new THREE.Group(); motor.position.set(1.6, 3.55, 0.2); g.add(motor);
  motor.add(rbox(0.7, 0.5, 0.5, '#c0392b', 0, 0, 0, 0.06), cyl(0.06, 0.06, 0.4, '#555', 0, 0.35, 0, 6));
  const fan = new THREE.Group(); fan.position.set(0, 0.55, 0); motor.add(fan); for (let i = 0; i < 3; i++) { const b = rbox(0.5, 0.03, 0.12, '#d0d4d8', 0.25, 0, 0, 0.02); const p = new THREE.Group(); p.rotation.y = i * 2.09; p.add(b); fan.add(p); }
  for (let i = 0; i < 3; i++) { const win = rbox(0.6, 0.5, 0.05, '#bfe4f4', -1.8 + i * 1.2, 2.0, 1.32, 0.03); g.add(win); }
  outline(g, { px: 2.4 });
  g.update = (t) => { fan.rotation.y = t * 12; }; g.motor = motor; g.base = base; g.house = house; return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * 112); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 72, { color: (o.colors && o.colors[i]) || '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 }); g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; if (o.until != null && t > o.until) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = o.a ?? 0.95;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, text.length * s * 0.62 + s * 0.6, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.9 });
  g.restore();
}
export function folder(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; const W = 760, H = 900;
  g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.45); g.scale(k, k); g.rotate(o.rot ?? -0.03);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.roundRect(-W / 2 + 16, -H / 2 + 22, W, H, 22); g.fill();
  g.fillStyle = '#d9b874'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2, -H / 2 - 70, 300, 110, 18); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 22); g.fill(); g.stroke();
  insT(g, o.tab || 'TOP SECRET', -W / 2 + 150, -H / 2 - 22, 40, { color: '#5a3a1a', stroke: null, maxW: 280 });
  g.fillStyle = '#f6f0dc'; g.beginPath(); g.roundRect(-W / 2 + 60, -H / 2 + 60, W - 120, H - 120, 10); g.fill();
  insT(g, o.title || 'PROJECT HABAKKUK', 0, -H / 2 + 150, 66, { color: CARD_INK, stroke: null, maxW: W - 160 });
  if (o.icon) o.icon(g, 0, -30);
  (o.lines || []).forEach((l, i) => insT(g, l, 0, 250 + i * 70, 44, { color: '#5a4a3a', stroke: null, maxW: W - 160 }));
  g.restore();
}
// flat side-view ice carrier icon (folder photo, map)
export function drawCarrierIcon(g, x, y, w, o = {}) {
  g.save(); g.translate(x, y); g.lineJoin = 'round'; g.strokeStyle = o.ink || CARD_INK; g.lineWidth = Math.max(3, w * 0.012);
  g.fillStyle = '#cdeefc'; g.beginPath(); g.moveTo(-w / 2, -w * 0.06); g.lineTo(w / 2, -w * 0.06); g.quadraticCurveTo(w / 2 + w * 0.06, w * 0.04, w / 2 - w * 0.04, w * 0.12); g.lineTo(-w / 2 + w * 0.04, w * 0.12); g.quadraticCurveTo(-w / 2 - w * 0.06, w * 0.04, -w / 2, -w * 0.06); g.fill(); g.stroke();
  g.fillStyle = '#e9f8ff'; g.beginPath(); g.roundRect(w * 0.18, -w * 0.2, w * 0.1, w * 0.14, 6); g.fill(); g.stroke();
  if (o.water !== false) { g.strokeStyle = '#3a8ac0'; g.lineWidth = Math.max(3, w * 0.01); g.beginPath(); for (let i = 0; i < 7; i++) { const px = -w * 0.6 + i * w * 0.2; g.moveTo(px, w * 0.14); g.quadraticCurveTo(px + w * 0.05, w * 0.1, px + w * 0.1, w * 0.14); } g.stroke(); }
  g.restore();
}
// mid-Atlantic "gap" map (2D): two coasts, convoy dots, plane-range arcs, a red hatched gap in the middle
export function gapMap(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); if (k <= 0) return; g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.45); g.scale(k, k);
  const W = 940, H = 760; g.fillStyle = '#9fcbe6'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.clip();
  g.fillStyle = '#e8d9a8'; g.beginPath(); g.moveTo(-W / 2, -H / 2); g.lineTo(-W / 2 + 170, -H / 2); g.quadraticCurveTo(-W / 2 + 230, -50, -W / 2 + 140, H / 2); g.lineTo(-W / 2, H / 2); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(W / 2, -H / 2); g.lineTo(W / 2 - 150, -H / 2); g.quadraticCurveTo(W / 2 - 230, 0, W / 2 - 130, H / 2); g.lineTo(W / 2, H / 2); g.fill(); g.stroke();
  const rg = clamp((t - 0.35) / 0.6);
  g.fillStyle = 'rgba(80,170,90,0.35)'; g.strokeStyle = '#2f8a3a'; g.lineWidth = 6; g.setLineDash([18, 12]);
  for (const [cx, s] of [[-W / 2 + 120, 1], [W / 2 - 120, -1]]) { g.beginPath(); g.arc(cx, 0, 280 * ease.out(rg), -Math.PI / 2, Math.PI / 2, s < 0); g.fill(); g.stroke(); }
  g.setLineDash([]);
  const gp = clamp((t - (o.gapAt ?? 1.0)) / 0.3);
  if (gp > 0) { g.save(); g.globalAlpha = gp; g.fillStyle = 'rgba(226,59,46,0.35)'; g.fillRect(-170, -H / 2, 340, H); g.strokeStyle = '#e23b2e'; g.lineWidth = 5; for (let i = -12; i < 12; i++) { g.beginPath(); g.moveTo(-170 + i * 40, -H / 2); g.lineTo(-170 + i * 40 + 300, H / 2); g.stroke(); } g.restore(); }
  for (let i = 0; i < 5; i++) { const px = -260 + i * 130 + ((t * 30) % 130); g.fillStyle = '#5a4a44'; g.beginPath(); g.ellipse(px, 120 + (i % 2) * 40, 24, 10, 0, 0, 7); g.fill(); }
  g.restore();
  insT(g, o.title || 'NO AIR COVER', 0, -H / 2 + 70, 58, { color: '#ffffff', stroke: CARD_INK, maxW: W - 80, a: gp });
  if (gp > 0) { g.save(); g.translate(0, -40); const s = ease.outBack(gp); g.scale(s, s); insT(g, 'THE GAP', 0, 0, 96, { color: '#ffd25a', stroke: CARD_INK }); g.restore(); }
  g.restore();
}
// rising price tag (2D): a tag that inflates with £ signs
export function priceTag(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const grow = 1 + ease.inOut(clamp((t - 0.2) / (o.dur || 1.4))) * 0.6 + Math.sin(t * 18) * 0.012 * clamp(t - 0.2);
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? E.H * 0.42); g.rotate(-0.08); g.scale(k * grow, k * grow);
  g.fillStyle = '#f6e8b8'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.moveTo(-260, -150); g.lineTo(200, -150); g.lineTo(300, 0); g.lineTo(200, 150); g.lineTo(-260, 150); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.arc(200, 0, 26, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.stroke();
  const n = 1 + Math.floor(clamp((t - 0.25) / (o.dur || 1.4)) * 3.99); insT(g, '£'.repeat(n), -40, 8, 150, { color: '#2f8a3a', stroke: CARD_INK, maxW: 420 });
  g.restore();
  insT(g, o.label || 'COST', o.x ?? E.W / 2, (o.y ?? E.H * 0.42) - 260 * k, 72, { color: '#ffffff', stroke: CARD_INK });
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, mesh, iceMat };
