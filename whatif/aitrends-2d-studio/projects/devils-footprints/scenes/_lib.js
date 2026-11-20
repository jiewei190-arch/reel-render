// The Devil's Footprints (Devon, Feb 1855) — shared assets: snowy Devon village (cottages with snow-capped thatch, stone
// walls, haystacks, a frozen river, a drainpipe), night/dawn skies, falling snow, the trail of single-file hoof-like prints
// that runs straight over whatever is in its way, Victorian villagers, the "suspects" (badger, wood mouse, kangaroo,
// balloon), plus 2D overlays (hook text, stamps, Devon map, ruler). Underscore = not auto-loaded.
// Tone: mystery + deadpan; no scary devil imagery, nobody hurt.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage, camMove } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };
const SNOW = '#f4f7fc', SNOW2 = '#dfe7f3';

// ---------------------------------------------------------------- SKIES
// night: deep blue gradient + big soft moon + stars; dawn: pale cold blue -> peach
export const NIGHT = ['#0b1230', '#1b2a5c', '#3d4f86', '#6d7fae'];
export const DAWN = ['#7fa2d6', '#b4c8e6', '#f2d6c4', '#f7e6d6'];
export function sky(st, mode = 'night', o = {}) {
  const stops = mode === 'night' ? NIGHT : DAWN;
  st.scene.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  let moon = null;
  if (mode === 'night' && o.moon !== false) {
    moon = new THREE.Group(); const m = new THREE.Mesh(sph, flat('#fbf3d6', { fog: false })); m.scale.setScalar(o.moonR || 3.2); moon.add(m);
    const gl = glow(o.moonR ? o.moonR * 5 : 16, '#c8d4ff', 0.45); moon.add(gl);
    moon.position.set(...(o.moonPos || [-14, 22, -60])); st.add(moon);
  }
  return { moon };
}
// light presets for snow: night (cold, moonlit) / dawn (cold key, warm horizon)
export function snowStage(T, mode = 'night', o = {}) {
  const night = mode === 'night';
  const st = toonStage(T, { light: night ? 'night' : 'day', fov: o.fov || 40, shadowSize: o.shadowSize || 12, target: o.target || [0, 1, 0],
    ...(night ? { sky: '#9aa6d8', ground: '#5a6488', ambient: 1.25, key: ['#cfd8ff', 1.7, [-8, 14, 6]], fill: ['#ffc890', 0.25, [6, 3, 8]], exposure: 1.08 }
              : { sky: '#cfe0ff', ground: '#c8b8b0', ambient: 1.2, key: ['#ffe6cc', 2.4, [-9, 8, 6]], fill: ['#a8c4ff', 0.55, [8, 5, 6]], exposure: 1.0 }),
    fog: o.fog || (night ? [30, 120, '#33426e'] : [35, 140, '#d8e0ee']) });
  const sk = sky(st, mode, o);
  return { st, ...sk };
}

// ---------------------------------------------------------------- BUILDINGS + TERRAIN
// cottage: whitewashed cob walls, snow-capped thatched roof (ridge along Z), chimney, door, warm windows.
// Returns the group + roofY(localX) for the trail (height of the snow surface over the roof).
export function cottage(o = {}) {
  const g = new THREE.Group(); const W = o.w || 4, D = o.d || 5, H = o.h || 2.6, pitch = o.pitch || 0.75, oh = 0.35;
  const wallC = o.wall || '#efe6d2', thatch = o.thatch || '#a87c4a';
  const walls = rbox(W, H, D, wallC, 0, H / 2, 0, 0.06); walls.receiveShadow = true; g.add(walls);
  const rise = (W / 2 + oh) * Math.tan(pitch);
  // roof = triangular prism (extruded along Z), then a thicker white snow cap on top
  const tri = (hw, hh, depth, col, y0, th) => { const s = new THREE.Shape(); s.moveTo(-hw, 0); s.lineTo(0, hh); s.lineTo(hw, 0); s.lineTo(hw - th, 0); s.lineTo(0, hh - th * 1.2); s.lineTo(-hw + th, 0); s.closePath();
    const m = mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }).translate(0, 0, -depth / 2), toon(col)); m.position.y = y0; return m; };
  g.add(tri(W / 2 + oh, rise, D + oh * 2, thatch, H, 0.5));
  const cap = tri(W / 2 + oh + 0.05, rise + 0.18, D + oh * 2 + 0.1, SNOW, H + 0.12, 0.22); g.add(cap);
  // gable ends: triangle wall
  const gs = new THREE.Shape(); gs.moveTo(-W / 2, 0); gs.lineTo(0, (W / 2) * Math.tan(pitch)); gs.lineTo(W / 2, 0); gs.closePath();
  for (const z of [-D / 2, D / 2]) { const gm = mesh(new THREE.ShapeGeometry(gs), toon(wallC, { side: THREE.DoubleSide })); gm.position.set(0, H, z); g.add(gm); }
  const ch = rbox(0.6, 1.6, 0.6, '#8a6a5a', W * 0.22, H + rise * 0.7, -D * 0.3, 0.05); g.add(ch); g.add(rbox(0.7, 0.18, 0.7, SNOW, W * 0.22, H + rise * 0.7 + 0.82, -D * 0.3, 0.06));
  // door + windows on the +Z face (front) and the +X/-X long walls
  const door = rbox(0.9, 1.7, 0.08, o.doorC || '#3d5a7a', 0, 0.85, D / 2 + 0.03, 0.03); g.add(door);
  const winM = toon('#ffd27a', { emissive: new THREE.Color('#ffb84a'), emissiveIntensity: o.lit === false ? 0.05 : 0.9 });
  for (const x of [-W * 0.3, W * 0.3]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), winM); w.position.set(x, 1.7, D / 2 + 0.035); w.userData.noOutline = true; g.add(w); g.add(rbox(0.86, 0.1, 0.12, '#5a4030', x, 1.32, D / 2 + 0.06, 0.02)); }
  for (const s of [-1, 1]) for (const z of [-D * 0.22, D * 0.22]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), winM); w.position.set(s * (W / 2 + 0.035), 1.6, z); w.rotation.y = s * Math.PI / 2; w.userData.noOutline = true; g.add(w); }
  // snow drift along the foot of the walls
  const drift = mesh(sph, toon(SNOW), W * 0.62, 0.22, D * 0.6); drift.position.y = 0; g.add(drift);
  outline(g, { px: 2.4 });
  g.roofY = (lx) => { const a = Math.abs(lx); if (a > W / 2 + oh + 0.05) return null; return H + 0.12 + (rise + 0.18) * (1 - a / (W / 2 + oh + 0.05)); };
  g.hw = W / 2 + oh; g.hd = D / 2 + oh + 0.05; g.door = door;
  return g;
}
// dry-stone wall with snow on top, running along Z (or X with rotation)
export function stoneWall(o = {}) {
  const g = new THREE.Group(); const L = o.len || 8, H = o.h || 1.1, T = 0.55; const r = rng(o.seed || 2);
  g.add(rbox(T, H, L, '#8e8a86', 0, H / 2, 0, 0.08));
  for (let i = 0; i < L * 2.2; i++) { const s = rbox(0.2 + r() * 0.12, 0.16 + r() * 0.1, 0.3 + r() * 0.3, r() < 0.5 ? '#7a7672' : '#a29e98', T / 2 + 0.01, 0.15 + r() * (H - 0.3), -L / 2 + 0.2 + r() * (L - 0.4), 0.04); s.userData.noOutline = true; g.add(s); }
  g.add(rbox(T + 0.14, 0.22, L + 0.1, SNOW, 0, H + 0.08, 0, 0.1));
  outline(g, { px: 2.2 }); g.topY = H + 0.19; g.hw = T / 2 + 0.07; g.hl = L / 2; return g;
}
// haystack: round rick with a snow cap
export function haystack(o = {}) {
  const g = new THREE.Group(); const R = o.r || 1.3, H = o.h || 1.6;
  const base = mesh(new THREE.CylinderGeometry(R, R * 1.05, H, 22), toon('#d8a548')); base.position.y = H / 2; g.add(base);
  const top = mesh(new THREE.ConeGeometry(R * 1.12, R * 1.15, 22), toon('#c99640')); top.position.y = H + R * 0.55; g.add(top);
  const cap = mesh(new THREE.ConeGeometry(R * 0.95, R * 0.95, 22), toon(SNOW)); cap.position.y = H + R * 0.73; g.add(cap);
  for (let i = 0; i < 10; i++) { const st = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), toon('#e8c070')); const a = i / 10 * Math.PI * 2; st.position.set(Math.cos(a) * R * 1.02, 0.3 + (i % 3) * 0.4, Math.sin(a) * R * 1.02); st.rotation.z = 0.5; st.userData.noOutline = true; g.add(st); }
  outline(g, { px: 2.4 });
  g.topY = (lx, lz = 0) => { const d = Math.hypot(lx, lz); if (d > R * 1.12) return null; if (d > R * 0.95) return H + (R * 1.12 - d) / (R * 0.17) * 0.15; return H + R * 0.73 + R * 0.475 * (1 - d / (R * 0.95)) + 0.02; };
  g.R = R; return g;
}
// frozen river strip along Z, banks with snow
export function river(o = {}) {
  const g = new THREE.Group(); const W = o.w || 4, L = o.len || 60;
  const water = floor(W, L, '#5d7fa8', 0, 0); water.position.y = 0.02; g.add(water);
  const ice = canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#7ea8d6'; x.fillRect(0, 0, w, h); const r = rng(4); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; for (let i = 0; i < 26; i++) { x.beginPath(); let px = r() * w, py = r() * h; x.moveTo(px, py); for (let k = 0; k < 3; k++) { px += (r() - 0.5) * 90; py += (r() - 0.5) * 90; x.lineTo(px, py); } x.stroke(); }
    x.fillStyle = 'rgba(93,127,168,.55)'; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(r() * w, r() * h, 20 + r() * 30, 8 + r() * 10, r(), 0, 7); x.fill(); } });
  ice.wrapS = ice.wrapT = THREE.RepeatWrapping; ice.repeat.set(1, L / 8);
  const im = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, L), toon('#ffffff', { map: ice })); im.rotation.x = -Math.PI / 2; im.position.y = 0.04; im.receiveShadow = true; im.userData.noOutline = true; g.add(im);
  for (const s of [-1, 1]) { const bank = mesh(new THREE.CylinderGeometry(0.5, 0.5, L, 10).rotateX(Math.PI / 2), toon(SNOW2)); bank.position.set(s * (W / 2 + 0.1), -0.2, 0); bank.scale.x = 0.9; g.add(bank); }
  g.surfY = -0.04; g.hw = W / 2; return g;
}
// a drain pipe lying in the snow (along X): the trail goes in one end and out the other
export function drainpipe(o = {}) {
  const g = new THREE.Group(); const L = o.len || 3, R = o.r || 0.32;
  const p = mesh(new THREE.CylinderGeometry(R, R, L, 22, 1, true).rotateZ(Math.PI / 2), toon('#7a6e66', { side: THREE.DoubleSide })); p.position.y = R; g.add(p);
  for (const s of [-1, 1]) { const rim = mesh(new THREE.TorusGeometry(R, 0.05, 8, 22).rotateY(Math.PI / 2), toon('#5a524c')); rim.position.set(s * L / 2, R, 0); g.add(rim);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(R * 0.96, 22).rotateY(s * Math.PI / 2), flat('#1a1416')); hole.position.set(s * (L / 2 - 0.25), R, 0); hole.userData.noOutline = true; g.add(hole); }
  const cap = mesh(sph, toon(SNOW), L * 0.45, 0.1, R * 0.8); cap.position.y = R * 2 - 0.02; g.add(cap);
  outline(g, { px: 2.4 }); g.L = L; g.R = R; return g;
}
export function snowGround(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const tex = canvasTex(512, 512, (x, w, h) => { x.fillStyle = SNOW; x.fillRect(0, 0, w, h); const r = rng(o.seed || 9); for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(170,190,225,${0.05 + r() * 0.08})`; x.beginPath(); x.ellipse(r() * w, r() * h, 6 + r() * 26, 3 + r() * 9, r() * 3, 0, 7); x.fill(); } });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(18, 18);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), toon('#ffffff', { map: tex })); f.rotation.x = -Math.PI / 2; f.position.z = -60; f.receiveShadow = true; f.userData.noOutline = true; g.add(f);
  // rolling snowy hills + dark hedgerows / trees on the horizon
  const r = rng(o.seed || 5);
  for (let i = 0; i < 9; i++) { const h = mesh(sph, toon(i % 2 ? SNOW : SNOW2), 14 + r() * 14, 3 + r() * 4, 8); h.position.set(-70 + i * 18 + r() * 6, -1, -55 - r() * 25); g.add(h); }
  for (let i = 0; i < (o.trees ?? 14); i++) { const tr = pine(0.8 + r() * 0.8); tr.position.set(-40 + r() * 80, 0, -24 - r() * 26); g.add(tr); }
  return g;
}
export function pine(s = 1) { const g = new THREE.Group(); g.add(cyl(0.12 * s, 0.16 * s, 0.8 * s, '#5a4232', 0, 0.4 * s, 0, 8));
  for (let i = 0; i < 3; i++) { const c = mesh(new THREE.ConeGeometry((1.1 - i * 0.28) * s, 1.3 * s, 10), toon('#2f5a4a')); c.position.y = (1.1 + i * 0.75) * s; g.add(c);
    const sc = mesh(new THREE.ConeGeometry((0.75 - i * 0.2) * s, 0.55 * s, 10), toon(SNOW)); sc.position.y = (1.45 + i * 0.75) * s; g.add(sc); }
  outline(g, { px: 2 }); return g; }

// ---------------------------------------------------------------- THE TRAIL
// one hoof-like print (cloven, ~U shape) as a transparent decal texture
let _hoofTex = null;
function hoofTex() {
  return _hoofTex ||= canvasTex(128, 160, (x, w, h) => {
    x.fillStyle = 'rgba(48,60,100,0.95)'; x.beginPath(); x.ellipse(w / 2, h * 0.5, 50, 68, 0, 0, Math.PI * 2); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.moveTo(w / 2 - 4, h * 0.1); x.lineTo(w / 2 + 4, h * 0.1); x.lineTo(w / 2 + 9, h * 0.6); x.lineTo(w / 2 - 9, h * 0.6); x.closePath(); x.fill();
    x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(130,150,200,0.55)'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(w / 2 + s * 26, h * 0.38, 13, 26, 0, 0, Math.PI * 2); x.fill(); }
  });
}
// trail(st, { from:[x,z], to:[x,z], step, size, surfaces: [fn(x,z)->y|null], skip: [fn(x,z)->bool] })
// Prints sit on the highest surface at each point (ground 0, roofs, wall tops, haystacks...), oriented to the slope.
// .reveal(k 0..1) shows the first k of them; .cover(k) fades them (fresh snow).
export function trail(st, o = {}) {
  const [x0, z0] = o.from || [-10, 0], [x1, z1] = o.to || [10, 0]; const len = Math.hypot(x1 - x0, z1 - z0); const step = o.step || 0.75, sz = o.size || 0.62;
  const dx = (x1 - x0) / len, dz = (z1 - z0) / len; const surf = o.surfaces || []; const skip = o.skip || [];
  const H = (x, z) => { let y = o.ground ?? 0; for (const f of surf) { const v = f(x, z); if (v != null && v > y) y = v; } return y; };
  const mat = new THREE.MeshBasicMaterial({ map: hoofTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, opacity: 1, side: THREE.DoubleSide });
  const geo = new THREE.PlaneGeometry(sz * 0.8, sz);
  const prints = []; const g = new THREE.Group(); st.add(g); const ang = Math.atan2(dx, dz);
  for (let s = 0, i = 0; s <= len; s += step, i++) {
    const side = (i % 2 ? 1 : -1) * 0.06; const x = x0 + dx * s - dz * side, z = z0 + dz * s + dx * side;
    if (skip.some(f => f(x, z))) continue;
    const y = H(x, z), e = 0.05; const ya = H(x + dx * e, z + dz * e), yb = H(x - dx * e, z - dz * e); const slope = Math.atan2(ya - yb, 2 * e);
    const m = new THREE.Mesh(geo, mat); m.userData.noOutline = true; m.renderOrder = 2;
    m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2 - slope, ang, 0);
    m.position.set(x, y + (y > 0.05 ? 0.1 : 0.04), z); m.visible = false; g.add(m); prints.push({ m, s, y });
  }
  g.prints = prints; g.len = len; g.mat = mat;
  g.reveal = (k) => { const lim = k * len; prints.forEach(p => { p.m.visible = p.s <= lim; }); };
  g.cover = (k) => { mat.opacity = 1 - clamp(k); };
  g.head = (k) => { const s = k * len; const x = x0 + dx * s, z = z0 + dz * s; return new THREE.Vector3(x, H(x, z), z); };
  g.H = H; g.dir = [dx, dz];
  return g;
}
// surface helpers in world space for objects placed at (px, pz) with rotation.y = 0
const toLocal = (o, x, z) => { const r = o.rotation.y, dx = x - o.position.x, dz = z - o.position.z, c = Math.cos(r), s = Math.sin(r); return [dx * c - dz * s, dx * s + dz * c]; };
export const roofSurf = (house) => (x, z) => { const [lx, lz] = toLocal(house, x, z); if (Math.abs(lz) > house.hd) return null; const y = house.roofY(lx); return y == null ? null : y + house.position.y; };
export const wallSurf = (w) => (x, z) => { const [lx, lz] = toLocal(w, x, z); return (Math.abs(lx) < w.hw && Math.abs(lz) < w.hl) ? w.topY : null; };
export const stackSurf = (h) => (x, z) => h.topY(x - h.position.x, z - h.position.z);
export const pipeSkip = (p, pad = 0) => (x, z) => { const [lx, lz] = toLocal(p, x, z); return Math.abs(lx) < p.L / 2 + pad && Math.abs(lz) < p.R + 0.3; };

// ---------------------------------------------------------------- PEOPLE (1855 Devon villagers)
export function villager(o = {}) { return bean({ name: 'Villager', outfit: 'tunic', head: o.head || 'cap', headColor: o.headColor || '#4a3a2e', skin: o.skin || 'fair', hair: o.hair || 'swoop', hairColor: o.hairColor || '#5a3a22', colors: { main: o.coat || '#6a4a3a', belt: '#3a2a20', legsTop: '#4a4a52', sleeveColor: o.coat || '#6a4a3a' }, scarf: o.scarf || '#b8322a', seed: o.seed || 5, ...(o.over || {}) }); }
export function vicar(o = {}) { return bean({ name: 'Vicar', outfit: 'tunic', head: 'none', skin: 'fair', hair: 'horseshoe', hairColor: '#d8d4cc', colors: { main: '#24242c', belt: '#24242c', legsTop: '#24242c', sleeveColor: '#24242c' }, scarf: '#f4f0e6', glasses: true, seed: o.seed || 21 }); }
export function scholar(o = {}) { return bean({ name: 'Scholar', outfit: 'labcoat', head: 'none', skin: o.skin || 'light', hair: 'swoop', hairColor: '#8a8a8a', glasses: true, beard: true, beardColor: '#9a9a9a', colors: { main: '#efe8d8', lanyard: '#2f6a3a' }, seed: o.seed || 31 }); }
export function lantern() { const g = new THREE.Group(); g.add(rbox(0.22, 0.3, 0.22, '#2a2a2a', 0, 0, 0, 0.03)); const l = ball(0.09, '#ffd27a', 0, 0, 0, 12); l.material = toon('#ffd27a', { emissive: new THREE.Color('#ffb84a'), emissiveIntensity: 1.2 }); g.add(l); g.add(cyl(0.02, 0.02, 0.18, '#2a2a2a', 0, 0.24, 0, 6)); const gl = glow(1.6, '#ffc060', 0.5); g.add(gl); outline(g, { px: 2 }); return g; }

// ---------------------------------------------------------------- SUSPECTS
export function badger(o = {}) {
  const g = new THREE.Group(); const body = mesh(sph, toon('#8a8a8e'), 0.55, 0.36, 0.8); body.position.y = 0.42; g.add(body);
  const head = new THREE.Group(); head.position.set(0, 0.5, 0.72); g.add(head);
  const hs = mesh(new THREE.ConeGeometry(0.3, 0.6, 18).rotateX(Math.PI / 2), toon('#f4f4f0')); head.add(hs);
  for (const s of [-1, 1]) { const st = mesh(new THREE.ConeGeometry(0.11, 0.62, 10).rotateX(Math.PI / 2), toon('#1e1e22')); st.position.set(s * 0.15, 0.06, 0.0); st.rotation.y = -s * 0.25; head.add(st);
    const ey = ball(0.04, '#ffffff', s * 0.13, 0.1, 0.12, 10); head.add(ey); const pu = ball(0.022, '#111', s * 0.13, 0.1, 0.155, 8); pu.userData.noOutline = true; head.add(pu);
    const ear = ball(0.07, '#f4f4f0', s * 0.2, 0.2, -0.18, 10); head.add(ear); }
  const nose = ball(0.06, '#1e1e22', 0, 0, 0.32, 10); head.add(nose);
  for (const [x, z] of [[-0.3, 0.4], [0.3, 0.4], [-0.3, -0.4], [0.3, -0.4]]) g.add(cyl(0.09, 0.1, 0.25, '#2a2a2e', x, 0.12, z, 10));
  g.add(blob(0.8, 0.3)); outline(g, { px: 3 }); g.head = head; g.headR = 0.5; return g;
}
export function mouse(o = {}) {
  const g = new THREE.Group(); const body = mesh(sph, toon('#a8784a'), 0.34, 0.3, 0.46); body.position.y = 0.32; g.add(body);
  const belly = mesh(sph, toon('#f0dcc0'), 0.24, 0.2, 0.2); belly.position.set(0, 0.26, 0.3); g.add(belly);
  const head = new THREE.Group(); head.position.set(0, 0.55, 0.32); g.add(head); head.add(mesh(sph, toon('#a8784a'), 0.24, 0.22, 0.26));
  for (const s of [-1, 1]) { const ear = mesh(sph, toon('#c89070'), 0.17, 0.17, 0.05); ear.position.set(s * 0.2, 0.22, -0.05); head.add(ear);
    const ey = ball(0.055, '#111', s * 0.1, 0.06, 0.2, 10); head.add(ey); const gl = ball(0.018, '#fff', s * 0.1 + 0.015, 0.08, 0.25, 6); gl.userData.noOutline = true; head.add(gl); }
  head.add(ball(0.045, '#e07a8a', 0, -0.02, 0.27, 10));
  const tail = mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 16, Math.PI * 1.2), toon('#c89070')); tail.position.set(0, 0.25, -0.5); tail.rotation.y = Math.PI / 2; g.add(tail);
  g.add(blob(0.45, 0.3)); outline(g, { px: 3 }); g.head = head; g.headR = 0.3; return g;
}
export function kangaroo(o = {}) {
  const g = new THREE.Group(); const C = '#c8865a', C2 = '#ecc8a0';
  const body = mesh(sph, toon(C), 0.5, 0.75, 0.45); body.position.set(0, 1.15, 0); body.rotation.x = 0.15; g.add(body);
  const bel = mesh(sph, toon(C2), 0.34, 0.55, 0.2); bel.position.set(0, 1.1, 0.3); g.add(bel);
  const head = new THREE.Group(); head.position.set(0, 2.05, 0.15); g.add(head);
  head.add(mesh(sph, toon(C), 0.26, 0.24, 0.3)); const sn = mesh(sph, toon(C2), 0.15, 0.13, 0.2); sn.position.set(0, -0.06, 0.26); head.add(sn);
  head.add(ball(0.045, '#2a1a1a', 0, -0.02, 0.45, 8));
  for (const s of [-1, 1]) { const ear = mesh(new THREE.ConeGeometry(0.09, 0.4, 12), toon(C), 1, 1, 0.5); ear.position.set(s * 0.13, 0.32, -0.05); ear.rotation.z = -s * 0.25; head.add(ear);
    const ey = ball(0.05, '#ffffff', s * 0.11, 0.07, 0.24, 10); head.add(ey); const pu = ball(0.028, '#111', s * 0.11, 0.07, 0.285, 8); pu.userData.noOutline = true; head.add(pu);
    const arm = cyl(0.05, 0.05, 0.4, C, s * 0.3, 1.45, 0.35, 8); arm.rotation.x = 0.9; g.add(arm);
    const leg = mesh(sph, toon(C), 0.18, 0.4, 0.3); leg.position.set(s * 0.3, 0.5, 0); g.add(leg); const ft = mesh(sph, toon(shadeHex(C, -0.2)), 0.1, 0.07, 0.4); ft.position.set(s * 0.3, 0.07, 0.25); g.add(ft); }
  const tail = mesh(new THREE.ConeGeometry(0.16, 1.4, 12).rotateX(-Math.PI / 2 - 0.35), toon(C)); tail.position.set(0, 0.45, -0.75); g.add(tail);
  g.add(blob(0.8, 0.3)); outline(g, { px: 3 }); g.head = head; g.headR = 0.4; return g;
}
export function balloon(o = {}) {
  const g = new THREE.Group(); const env = mesh(sph, toon(o.color || '#c0392b'), 1.1, 1.3, 1.1); env.position.y = 2.9; g.add(env);
  for (let i = 0; i < 6; i++) { const st = mesh(sph, toon('#f2c230'), 1.112, 1.31, 0.13); st.position.y = 2.9; st.rotation.y = i * Math.PI / 6; st.userData.noOutline = true; g.add(st); }
  for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) { const r = cyl(0.012, 0.012, 1.2, '#5a4a3a', x * 1.6, 1.25, z * 1.6, 4); r.rotation.set(z * 0.5, 0, -x * 0.5); g.add(r); }
  g.add(rbox(0.7, 0.5, 0.7, '#8a6a3a', 0, 0.4, 0, 0.06));
  // two trailing ropes with shackles (the "experimental balloon" story)
  for (const s of [-1, 1]) { const rp = cyl(0.015, 0.015, 1.2, '#5a4a3a', s * 0.25, -0.35, 0, 4); g.add(rp); g.add(rbox(0.14, 0.14, 0.06, '#5a5a62', s * 0.25, -0.98, 0, 0.03)); }
  outline(g, { px: 2.6 }); g.headR = 1.3; return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// falling snow (deterministic): density 0..1, wind
export function snowfall(g, t, o = {}) {
  const n = Math.round((o.n ?? 120) * (o.k ?? 1)); const r = rng(o.seed || 11); g.save(); g.fillStyle = o.color || 'rgba(255,255,255,0.85)';
  for (let i = 0; i < n; i++) { const sp = 60 + r() * 140, sz = 2 + r() * 6, x0 = r() * E.W, y0 = r() * E.H, ph = r() * 6;
    const y = (y0 + t * sp) % (E.H + 40) - 20, x = (x0 + Math.sin(t * 0.8 + ph) * 30 + t * (o.wind ?? 25)) % E.W;
    g.globalAlpha = 0.4 + (sz / 8) * 0.6; g.beginPath(); g.arc(x < 0 ? x + E.W : x, y, sz, 0, 7); g.fill(); }
  g.restore();
}
export function stars(g, t, o = {}) { const r = rng(o.seed || 3); g.save(); g.fillStyle = '#ffffff'; for (let i = 0; i < (o.n || 70); i++) { const x = r() * E.W, y = r() * E.H * (o.h || 0.4), s = 1 + r() * 2.4; g.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + i); g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } g.restore(); }
export function vignette(g, a = 0.45, col = '8,12,30') { const gr = g.createRadialGradient(E.W / 2, E.H * 0.5, E.H * 0.25, E.W / 2, E.H * 0.5, E.H * 0.75); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }
// hook text: lines of words; per-word colours via { words: { roof: '#ff5a4a' } }
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + (o.lead ?? 0.25) - i * 0.15) / 0.3)); const size = (o.sizes && o.sizes[i]) || o.size || 66; g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + (o.ys ? o.ys[i] : i * 110)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    const ws = l.split(' '); g.font = `900 ${size}px "Fredoka", sans-serif`; const sp = size * 0.32; const widths = ws.map(w => g.measureText(w).width); let tot = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    const sc = Math.min(1, E.W * 0.9 / tot); g.scale(sc, sc); let x = -tot / 2;
    ws.forEach((w, j) => { const key = w.toLowerCase().replace(/[^\w]/g, ''); const col = (o.words && o.words[key]) || (o.colors && o.colors[i]) || '#ffffff'; insT(g, w, x + widths[j] / 2, 0, size, { color: col, stroke: CARD_INK }); x += widths[j] + sp; });
    g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.96) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: o.textColor || col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// ruler card next to a print: "4 IN"
export function ruler(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; g.save(); g.translate(o.x ?? 300, o.y ?? 1000); g.rotate(o.rot ?? -0.1); g.scale(k, k);
  const L = o.len || 420; g.fillStyle = '#f2d27a'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-30, -L / 2, 60, L, 8); g.fill(); g.stroke();
  g.lineWidth = 4; for (let i = 0; i <= 8; i++) { const y = -L / 2 + 20 + i * (L - 40) / 8; g.beginPath(); g.moveTo(-30, y); g.lineTo(i % 2 ? -14 : 2, y); g.stroke(); }
  g.restore();
}
// stylised Devon coast map (not to scale): Exe estuary, places, dots popping in, optional trail line
export function devonMap(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.42); g.scale(k * (o.zoom || 0.86), k * (o.zoom || 0.86));
  const W = 900, H = 1060; g.fillStyle = '#9fc4dc'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 28); g.fill();
  g.save(); g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 28); g.clip();
  // land (north/west) with a coastline running down to the south-east, the Exe estuary cutting in
  g.fillStyle = '#eef1f6'; g.beginPath(); g.moveTo(-W / 2, -H / 2); g.lineTo(W / 2, -H / 2); g.lineTo(W / 2, -60); g.quadraticCurveTo(300, -10, 230, 60); g.lineTo(150, 20); g.quadraticCurveTo(110, -120, 60, -220); g.quadraticCurveTo(40, -110, 70, 40); g.quadraticCurveTo(40, 160, -40, 260); g.quadraticCurveTo(-120, 400, -260, H / 2); g.lineTo(-W / 2, H / 2); g.closePath(); g.fill();
  g.strokeStyle = '#7a9ab8'; g.lineWidth = 6; g.stroke();
  g.strokeStyle = 'rgba(120,140,170,.25)'; g.lineWidth = 3; for (let i = 1; i < 9; i++) { g.beginPath(); g.moveTo(-W / 2 + i * W / 9, -H / 2); g.lineTo(-W / 2 + i * W / 9, H / 2); g.stroke(); }
  g.restore(); g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 28); g.stroke();
  insT(g, o.title || 'DEVON, 1855', 0, -H / 2 + 75, 62, { color: CARD_INK, stroke: null });
  const places = [['TOPSHAM', 30, -260], ['EXMOUTH', 210, 120], ['DAWLISH', -10, 180], ['TEIGNMOUTH', -110, 330]];
  places.forEach(([n, x, y], i) => { const a = clamp((t - 0.2 - i * 0.12) / 0.25); if (a <= 0) return; g.fillStyle = '#d8342c'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); insT(g, n, x + (x > 100 ? -10 : 18), y - 34, 34, { color: CARD_INK, stroke: '#ffffff', a, align: x > 100 ? 'right' : 'left' }); });
  // more reported spots popping in (stylised: "30+")
  const r = rng(7); const nd = Math.round(clamp((t - (o.dotsAt ?? 0.4)) / (o.dotsDur ?? 1.2)) * 30);
  for (let i = 0; i < 30; i++) { const x = -360 + r() * 640, y = -380 + r() * 760; if (i >= nd) continue; if (x > 60 && y < 40 && x < 160) continue; g.fillStyle = '#4a5a8a'; g.beginPath(); g.arc(x * 0.9 - 40, y, 10, 0, 7); g.fill(); }
  if (o.trail) { const p = clamp((t - (o.trailAt ?? 0)) / (o.trailDur ?? 1.6)); g.save(); g.setLineDash([22, 16]); g.strokeStyle = '#2a3a6a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); const pts = [[-380, -420], [-200, -300], [-60, -340], [40, -180], [-80, -40], [120, 40], [-40, 160], [-220, 260], [-120, 380], [-300, 460]];
    const n = pts.length - 1, upto = p * n; g.moveTo(...pts[0]); for (let i = 1; i <= Math.ceil(upto); i++) { const f = Math.min(1, upto - (i - 1)); g.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); } g.stroke(); g.restore(); }
  if (o.count) { const a = clamp((t - (o.countAt ?? 0.6)) / 0.3); if (a > 0) { g.save(); g.translate(200, 430); g.scale(ease.outBack(a), ease.outBack(a)); g.rotate(-0.06); g.fillStyle = '#d8342c'; g.beginPath(); g.roundRect(-150, -60, 300, 120, 20); g.fill(); insT(g, o.count, 0, 4, 72, { color: '#ffffff', stroke: null }); g.restore(); } }
  g.restore();
}
// old newspaper page (generic, no real masthead): headline + "?" marks circled
export function newspaper(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.42); g.rotate(o.rot ?? 0.04); g.scale(k * 0.86, k * 0.86);
  const W = 820, H = 1000; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-W / 2 + 18, -H / 2 + 24, W, H); g.fillStyle = '#efe6cc'; g.fillRect(-W / 2, -H / 2, W, H); g.strokeStyle = CARD_INK; g.lineWidth = 6; g.strokeRect(-W / 2, -H / 2, W, H);
  insT(g, 'THE WEEKLY GAZETTE', 0, -H / 2 + 70, 54, { color: CARD_INK, stroke: null }); g.fillStyle = CARD_INK; g.fillRect(-W / 2 + 40, -H / 2 + 115, W - 80, 6);
  insT(g, o.head || 'MYSTERIOUS FOOT-MARKS', 0, -H / 2 + 185, 60, { color: CARD_INK, stroke: null, maxW: W - 80 });
  insT(g, 'IN THE SNOW', 0, -H / 2 + 255, 48, { color: '#5a4a3a', stroke: null });
  g.fillStyle = 'rgba(60,50,40,.35)'; const r = rng(3); for (let c = 0; c < 2; c++) for (let i = 0; i < 14; i++) { const w = 320 - r() * 90; g.fillRect(-W / 2 + 50 + c * 380, -H / 2 + 320 + i * 44, w, 16); }
  const qs = o.qs || []; qs.forEach(([x, y, at2], i) => { const a = clamp((t - at2) / 0.25); if (a <= 0) return; g.save(); g.translate(x, y); g.strokeStyle = '#d8342c'; g.lineWidth = 9; g.beginPath(); g.ellipse(0, 0, 160 * a, 46, -0.05, 0, Math.PI * 2 * a); g.stroke(); insT(g, '?', 190, -10, 110 * ease.outBack(a), { color: '#d8342c', stroke: '#fff' }); g.restore(); });
  g.restore();
}
export { THREE, toonStage, camMove, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, glow };
