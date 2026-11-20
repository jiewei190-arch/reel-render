// London's corpse train (London Necropolis Railway) — shared assets: a toon Victorian steam engine, open coffin wagons,
// a mourners' carriage, coffins (1st / 3rd class), Victorian mourners (top hats), railway countryside, the London platform,
// a packed churchyard, the cemetery-station bar, the engine cab, the 1941 night terminus + 2D overlay helpers.
// Tone guard: no gore, nobody shown hurt, no bodies visible (closed coffins only); the 1941 raid hits an empty building.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { fire, smoke, embers, glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const G = (...k) => { const g = new THREE.Group(); k.forEach(x => x && g.add(x)); return g; };
const label = (txt, w, h, o = {}) => { const tex = canvasTex(512, Math.round(512 * h / w), (x, W, H) => { x.fillStyle = o.bg || '#e8dcc0'; x.fillRect(0, 0, W, H); if (o.border !== false) { x.strokeStyle = o.ink || '#2a1c15'; x.lineWidth = H * 0.08; x.strokeRect(0, 0, W, H); }
  x.fillStyle = o.ink || '#2a1c15'; x.textAlign = 'center'; x.textBaseline = 'middle'; let fs = H * (o.fs || 0.62); x.font = `900 ${fs}px "Fredoka", sans-serif`; const tw = x.measureText(txt).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; x.font = `900 ${fs}px "Fredoka", sans-serif`; } x.fillText(txt, W / 2, H * 0.54); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: tex })); m.userData.noOutline = true; return m; };

// ---------------------------------------------------------------- COFFIN (closed, lying along X, lid up)
// classic Victorian six-sided coffin; cls 1 = polished with brass, 3 = plain pine
export function coffin(o = {}) {
  const L = o.L || 2.3, W = o.W || 0.8, H = o.H || 0.55, cls = o.cls || 1;
  const s = new THREE.Shape(); const hx = L / 2, sh = -L / 2 + L * 0.3;
  s.moveTo(-hx, -W * 0.32); s.lineTo(sh, -W / 2); s.lineTo(hx, -W * 0.36); s.lineTo(hx, W * 0.36); s.lineTo(sh, W / 2); s.lineTo(-hx, W * 0.32); s.closePath();
  const col = o.color || (cls === 1 ? '#3e1c12' : cls === 2 ? '#6a3a20' : '#b08a52');
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: H * 0.8, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }).rotateX(-Math.PI / 2), toon(col)); body.castShadow = true;
  const lid = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: H * 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 2 }).rotateX(-Math.PI / 2), toon(shadeHex(col, 0.04))); lid.position.y = H * 0.8; lid.scale.set(1.03, 1, 1.05); lid.castShadow = true;
  const g = G(body, lid);
  if (cls === 1) { const brass = '#e0b84a';
    for (const sz of [-1, 1]) for (const x of [-0.6, 0, 0.6]) { const hd = rbox(0.22, 0.06, 0.05, brass, x * L * 0.5, H * 0.42, sz * (W / 2 + 0.03) * (x < -0.3 ? 0.72 : 0.98), 0.02); g.add(hd); }
    const pl = rbox(0.34, 0.03, 0.2, brass, -L * 0.12, H * 1.02, 0, 0.02); g.add(pl); }
  else { const pl = rbox(0.3, 0.03, 0.18, '#7a6a52', -L * 0.12, H * 1.02, 0, 0.02); g.add(pl); }
  if (o.tag) { const tg = label(o.tag, 0.62, 0.32, { bg: '#f4ead2' }); tg.rotation.x = -Math.PI / 2; tg.position.set(L * 0.18, H * 1.025, 0); g.add(tg); }
  outline(g, { px: o.px || 2.4 }); g.L = L; g.H = H; return g;
}

// ---------------------------------------------------------------- PEOPLE
// Victorian mourner: black coat (uniform), top hat; women: bun + black dress (robe) + small veil-hat
export function mourner(o = {}) { const woman = !!o.woman;
  const b = bean({ name: 'Mourner', outfit: woman ? 'robe' : 'uniform', head: woman ? 'none' : 'tophat', skin: o.skin || 'fair', hair: woman ? 'bun' : (o.hair || 'swoop'), hairColor: o.hairColor || '#4a3020',
    colors: { main: o.coat || '#2a2630', trim: '#3a3440', belt: '#1a1820', sash: '#2a2630' }, moustache: o.moustache, seed: o.seed || 5, ...(o.over || {}) });
  return b; }
export function driver(o = {}) { return bean({ name: 'Driver', outfit: 'uniform', head: 'cap', headColor: '#2e3440', skin: o.skin || 'light', hair: 'horseshoe', hairColor: '#7a6a5a', moustache: '#6a5a4a', colors: { main: '#3a4a6a' }, seed: o.seed || 11, ...(o.over || {}) }); }
export function fireman(o = {}) { return bean({ name: 'Fireman', outfit: 'uniform', head: 'cap', headColor: '#3a3a3a', skin: o.skin || 'tan', hair: 'bowl', hairColor: '#2a1a12', colors: { main: '#5a6a7a' }, seed: o.seed || 17, ...(o.over || {}) }); }
export function clerk(o = {}) { return bean({ name: 'Clerk', outfit: 'uniform', head: 'none', skin: 'fair', hair: 'swoop', hairColor: '#3a2618', glasses: true, colors: { main: '#4a3a52' }, seed: o.seed || 13 }); }
export function digger(o = {}) { return bean({ name: 'Digger', outfit: 'rags', head: 'cap', headColor: '#5a4a3a', skin: 'light', hair: 'bowl', colors: { main: '#7a6a52' }, seed: o.seed || 21 }); }
export function topHat(R = 0.5) { const g = new THREE.Group(); g.add(cyl(R * 0.66, R * 0.62, R * 1.05, '#1e1c22', 0, R * 0.52, 0, 24), cyl(R * 1.05, R * 1.05, R * 0.06, '#1e1c22', 0, 0, 0, 28), cyl(R * 0.645, R * 0.64, R * 0.2, '#4a4450', 0, R * 0.12, 0, 24)); outline(g, { px: 2.6 }); return g; }

// ---------------------------------------------------------------- TRAIN (faces +X; rails along X at z = 0)
const wheel = (r, c = '#b23a2a') => { const g = new THREE.Group(); const tire = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 24).rotateX(Math.PI / 2), toon('#2a2428')); tire.castShadow = true; g.add(tire);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.82, 0.18, 24).rotateX(Math.PI / 2), toon(c)); g.add(hub);
  for (let i = 0; i < 4; i++) { const sp = rbox(r * 1.5, 0.07, 0.2, shadeHex(c, -0.25), 0, 0, 0, 0.02); sp.rotation.z = i * Math.PI / 4; g.add(sp); }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.22, 12).rotateX(Math.PI / 2), toon('#e0b84a')); g.add(cap); return g; };
export function locomotive(o = {}) {
  const g = new THREE.Group(); const C = o.color || '#2f5a3a', C2 = shadeHex(C, -0.25), BL = '#262228', RED = '#b23a2a', BR = '#e0b84a';
  g.add(rbox(6.6, 0.4, 1.9, BL, 0, 0.95, 0, 0.06));                                   // frame
  g.add(rbox(6.4, 0.22, 2.0, RED, 0, 0.72, 0, 0.04));                                 // buffer beam strip
  const boiler = cyl(0.95, 0.95, 4.2, C, 0.6, 2.05, 0, 28); boiler.rotation.z = Math.PI / 2; g.add(boiler);
  for (const x of [-1.2, 0.2, 1.6]) { const band = cyl(0.98, 0.98, 0.1, BR, x + 0.5, 2.05, 0, 28); band.rotation.z = Math.PI / 2; g.add(band); }
  const sb = cyl(1.0, 1.0, 0.7, BL, 2.95, 2.05, 0, 28); sb.rotation.z = Math.PI / 2; g.add(sb);                            // smokebox
  const door = cyl(0.78, 0.78, 0.12, '#3a3438', 3.32, 2.05, 0, 24); door.rotation.z = Math.PI / 2; g.add(door);
  g.add(ball(0.12, BR, 3.4, 2.05, 0, 12));
  const chim = cyl(0.32, 0.26, 1.15, BL, 2.9, 3.4, 0, 18); g.add(chim); g.add(cyl(0.42, 0.34, 0.18, BL, 2.9, 4.0, 0, 18));
  g.add(cyl(0.38, 0.45, 0.55, BR, 1.0, 3.1, 0, 18), ball(0.38, BR, 1.0, 3.35, 0, 18));                                     // brass dome
  g.add(cyl(0.12, 0.16, 0.4, BR, -0.2, 3.1, 0, 12));                                                                        // whistle/safety valve
  // cab
  g.add(rbox(1.8, 2.5, 2.1, C, -2.4, 2.35, 0, 0.08), rbox(2.2, 0.16, 2.4, C2, -2.4, 3.68, 0, 0.06));
  for (const z of [-1.06, 1.06]) { const w = rbox(0.7, 0.6, 0.06, '#f6e7b0', -2.3, 2.9, z, 0.04); w.userData.noOutline = true; g.add(w); }
  g.add(rbox(0.06, 0.12, 0.9, BR, -1.48, 1.55, 0, 0.02));
  // name plate
  const np = label(o.name || 'NECROPOLIS', 1.6, 0.34, { bg: BR, ink: '#2a1c15' }); np.position.set(0.6, 1.95, 1.0); g.add(np); const np2 = np.clone(); np2.rotation.y = Math.PI; np2.position.z = -1.0; g.add(np2);
  // lamp + buffers
  g.add(cyl(0.16, 0.16, 0.3, BL, 3.45, 3.0, 0, 10)); const lampG = ball(0.1, '#fff2b0', 3.6, 3.0, 0, 10); g.add(lampG);
  for (const z of [-0.7, 0.7]) { const bf = cyl(0.16, 0.16, 0.4, BL, 3.45, 0.95, z, 12); bf.rotation.z = Math.PI / 2; g.add(bf); const bh = cyl(0.25, 0.25, 0.06, '#888', 3.66, 0.95, z, 14); bh.rotation.z = Math.PI / 2; g.add(bh); }
  // wheels: 2 big drivers + 1 leading per side
  const W = []; for (const z of [-0.98, 0.98]) { for (const [x, r] of [[2.3, 0.5], [0.4, 0.82], [-1.5, 0.82]]) { const w = wheel(r); w.position.set(x, r, z); g.add(w); W.push({ w, r }); } }
  const rods = [-0.98, 0.98].map(z => { const rd = rbox(2.2, 0.1, 0.06, '#9a9aa0', -0.55, 0.82, z * 1.1, 0.03); g.add(rd); return rd; });
  outline(g, { px: o.px || 2.6 });
  g.chimTop = new THREE.Vector3(2.9, 4.2, 0); g.cabX = -2.4;
  g.drive = (d) => { W.forEach(({ w, r }) => { w.rotation.z = -d / r; }); rods.forEach((rd, i) => { const a = -d / 0.82 + (i ? Math.PI / 2 : 0); rd.position.x = -0.55 + Math.cos(a) * 0.4; rd.position.y = 0.82 + Math.sin(a) * 0.4; }); };
  return g; }
export function tender(o = {}) { const g = new THREE.Group(); const C = o.color || '#2f5a3a';
  g.add(rbox(3.0, 0.35, 1.9, '#262228', 0, 0.95, 0, 0.06), rbox(2.9, 1.5, 2.0, C, 0, 1.85, 0, 0.08));
  const coal = rbox(2.6, 0.4, 1.7, '#1c1a1e', 0, 2.65, 0, 0.15); g.add(coal);
  const W = []; for (const z of [-0.98, 0.98]) for (const x of [-0.9, 0.9]) { const w = wheel(0.55); w.position.set(x, 0.55, z); g.add(w); W.push(w); }
  outline(g, { px: o.px || 2.6 }); g.drive = d => W.forEach(w => (w.rotation.z = -d / 0.55)); return g; }
// open hearse wagon: low sides, coffins on board (a cartoon "coffin truck" so it reads at a glance)
export function coffinWagon(o = {}) { const g = new THREE.Group(); const C = o.color || '#4a2e3a';
  g.add(rbox(5.0, 0.35, 2.1, '#262228', 0, 0.95, 0, 0.06), rbox(5.0, 0.18, 2.2, C, 0, 1.2, 0, 0.04));
  for (const z of [-1.08, 1.08]) g.add(rbox(5.0, 0.45, 0.1, C, 0, 1.5, z, 0.04));
  for (const x of [-2.5, 2.5]) g.add(rbox(0.1, 0.45, 2.2, C, x, 1.5, 0, 0.04));
  for (const z of [-1.0, 1.0]) for (const x of [-2.48, 2.48]) { const bf = cyl(0.13, 0.13, 0.3, '#262228', x * 1.04, 0.95, z * 0.7, 10); bf.rotation.z = Math.PI / 2; g.add(bf); }
  const W = []; for (const z of [-0.98, 0.98]) for (const x of [-1.6, 1.6]) { const w = wheel(0.5, o.wheel || '#7a2a2a'); w.position.set(x, 0.5, z); g.add(w); W.push(w); }
  if (o.sign) { const s = label(o.sign, 2.4, 0.42, { bg: '#f0e4c4' }); s.position.set(0, 1.5, 1.14); g.add(s); }
  outline(g, { px: o.px || 2.6 });
  const cf = []; const n = o.n ?? 4; const cls = o.cls || [1, 3, 1, 3];
  for (let i = 0; i < n; i++) { const c = coffin({ cls: cls[i % cls.length], L: 2.2, W: 0.78, H: 0.5, tag: o.tags ? o.tags[i % o.tags.length] : null }); c.position.set(i % 2 ? 1.18 : -1.18, 1.3 + (i >= 2 && o.stack ? 0.6 : 0), i % 4 < 2 ? 0.48 : -0.48); if (o.stack && i >= 2) c.position.z = 0; g.add(c); cf.push(c); }
  g.coffins = cf; g.drive = d => W.forEach(w => (w.rotation.z = -d / 0.5)); return g; }
// mourners' carriage: maroon box, windows, class number on the doors
export function carriage(o = {}) { const g = new THREE.Group(); const C = o.color || '#6a2a32';
  g.add(rbox(5.4, 0.35, 2.1, '#262228', 0, 0.95, 0, 0.06), rbox(5.4, 1.9, 2.2, C, 0, 2.15, 0, 0.1), rbox(5.6, 0.22, 2.4, '#e8dcc0', 0, 3.2, 0, 0.1));
  const cls = o.classes || ['1', '1', '3', '3']; const win = [];
  cls.forEach((c, i) => { const x = -2.0 + i * 1.33; for (const z of [-1.11, 1.11]) { const w = rbox(0.75, 0.62, 0.05, '#f8e9b8', x, 2.5, z, 0.06); w.userData.noOutline = true; g.add(w); win.push(w);
      const n = label(c, 0.34, 0.34, { bg: '#e0b84a', border: false }); n.position.set(x, 1.75, z * 1.012); if (z < 0) n.rotation.y = Math.PI; g.add(n); } });
  const W = []; for (const z of [-0.98, 0.98]) for (const x of [-1.7, 1.7]) { const w = wheel(0.5, '#3a2a2a'); w.position.set(x, 0.5, z); g.add(w); W.push(w); }
  outline(g, { px: o.px || 2.4 }); g.drive = d => W.forEach(w => (w.rotation.z = -d / 0.5)); g.windows = win; return g; }
// full train: loco + tender + wagons (+ carriage). .update(t, dist) spins wheels and puffs smoke
export function corpseTrain(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const lo = locomotive(o); g.add(lo); const te = tender(o); te.position.x = -4.95; g.add(te);
  const cars = []; let x = -4.95 - 1.5;
  for (const spec of (o.cars || [{ type: 'wagon' }, { type: 'wagon' }, { type: 'carriage' }])) {
    const c = spec.type === 'carriage' ? carriage(spec) : coffinWagon(spec); const len = spec.type === 'carriage' ? 5.4 : 5.0;
    x -= len / 2 + 0.35; c.position.x = x; x -= len / 2; g.add(c); cars.push(c); }
  const sm = smoke({ count: o.puffs || 14, size: o.puffSize || 0.9, rise: 0.9, spread: 0.5, color: o.smokeColor || '#e8e6ee', seed: 4, life: 3.2, drift: [-(o.speed ?? 2.0) * 0.55, 0] });
  sm.position.copy(lo.chimTop); g.add(sm);
  const trail = smoke({ count: 10, size: 1.3, rise: 0.35, spread: 1.2, color: '#eceaf2', seed: 9, life: 3.0, drift: [-(o.speed ?? 2.0) * 0.9, 0] }); trail.position.set(-3.5, 4.3, 0); g.add(trail);
  g.loco = lo; g.cars = cars; g.tender = te; g.smoke = sm; g.trail = trail;
  g.update = (t, d = 0) => { lo.drive(d); te.drive(d); cars.forEach(c => c.drive(d)); sm.update(t); trail.update(t); };
  return g; }
// track along X: two rails + sleepers, ballast strip
export function track(len = 120, o = {}) { const g = new THREE.Group(); const bal = floor(len, 3.2, o.ballast || '#8a7e70', 0, 0); bal.position.y = 0.01; g.add(bal);
  for (let i = 0; i < len / 0.9; i++) { const s = box(0.35, 0.08, 2.6, '#5a4232', -len / 2 + i * 0.9, 0.05, 0); s.receiveShadow = true; g.add(s); }
  for (const z of [-0.98, 0.98]) { const r = box(len, 0.12, 0.12, '#8a8a92', 0, 0.14, z); g.add(r); }
  return g; }

// ---------------------------------------------------------------- SETS
// green Surrey countryside with the line running along X; pine trees + rolling hills
export function countryside(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(400, 300, o.grass || '#8cc063', 0, -60));
  g.add(track(o.len || 160));
  const rr = rng(o.seed || 4);
  for (let i = 0; i < 7; i++) { const h = ball(18 + rr() * 14, rr() < 0.5 ? '#7ab055' : '#6aa04a', -110 + i * 38, -8, -70 - rr() * 30, 24); h.scale.y = 0.45; g.add(h); }
  for (let i = 0; i < 26; i++) { const x = -60 + rr() * 120, z = -8 - rr() * 40; if (Math.abs(z) < 3) continue; const tr = G(cyl(0.18, 0.25, 1.4, '#6a4a32', 0, 0.7, 0, 8), cyl(0, 1.3, 2.8, rr() < 0.5 ? '#3f7a45' : '#4a8a4a', 0, 2.6, 0, 10)); tr.position.set(x, 0, z); tr.scale.setScalar(0.9 + rr() * 0.8); outline(tr, { px: 2 }); g.add(tr); }
  for (let i = 0; i < 8; i++) { const b = ball(0.5 + rr() * 0.4, '#6a9a4a', -20 + rr() * 40, 0.2, 3 + rr() * 6, 10); b.scale.y = 0.6; g.add(b); }
  if (o.graves) for (let i = 0; i < 30; i++) { const gs = rbox(0.5, 0.7 + rr() * 0.3, 0.15, '#b8b4ac', -30 + (i % 15) * 3.6 + rr(), 0.4, -14 - Math.floor(i / 15) * 3.2, 0.12); g.add(gs); }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// London terminus platform (1850s/1900s, generic): brick wall + arches, wooden platform, canopy on iron columns, a sign
export function platformSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(80, 40, '#6a6058', 0, 0));
  g.add(track(80)); const pf = rbox(60, 1.0, 5, '#b8a888', 0, 0.5, 4.2, 0.05); pf.receiveShadow = true; g.add(pf);
  const edge = box(60, 0.08, 0.3, '#e8dcc0', 0, 1.02, 1.85); g.add(edge);
  const brick = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#9a5a42'; x.fillRect(0, 0, W, H); x.strokeStyle = '#7a4434'; x.lineWidth = 4; for (let r = 0; r < 8; r++) { x.beginPath(); x.moveTo(0, r * 32); x.lineTo(W, r * 32); x.stroke(); for (let c = 0; c < 5; c++) { const bx = c * 64 + (r % 2) * 32; x.beginPath(); x.moveTo(bx, r * 32); x.lineTo(bx, r * 32 + 32); x.stroke(); } } }, { repeat: [14, 4] });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), toon('#ffffff', { map: brick })); wall.position.set(0, 6, -4); wall.receiveShadow = true; g.add(wall);
  for (let i = -4; i <= 4; i++) { const ar = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20, 0, Math.PI), toon('#3a2a2a')); ar.position.set(i * 5, 3.2, -3.96); g.add(ar); g.add(plane(3.2, 3.2, '#3a2a2a', i * 5, 1.6, -3.96)); }
  for (let i = -4; i <= 4; i++) { const col = cyl(0.12, 0.14, 5.2, '#2f4a3a', i * 4.5 + (o.colX ?? 2.25), 3.6, 6.4, 10); g.add(col); }
  const canopy = rbox(60, 0.25, 6.4, '#4a5a4a', 0, 6.3, 4.4, 0.05); g.add(canopy); const val = rbox(60, 0.5, 0.1, '#e8dcc0', 0, 5.95, 1.25, 0.04); g.add(val);
  const sign = label(o.sign || 'NECROPOLIS', 4.4, 0.8, { bg: '#1f3a6a', ink: '#ffffff', border: false }); sign.position.set(o.signX ?? -2.5, 5.0, 1.32); g.add(sign);
  outline(g, { px: 2 });
  return { group: g, platformY: 1.0, update() {} };
}
// packed churchyard: rows of crowded headstones, a church wall, a dug pit with an old coffin lid peeking
export function churchyard(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(80, 60, '#6f8a4a', 0, -10));
  const rr = rng(o.seed || 9);
  const church = G(rbox(10, 7, 5, '#a8a092', -4, 3.5, -16, 0.1), rbox(3, 13, 3, '#9a9284', 4, 6.5, -15, 0.1), cyl(0, 2.3, 4, '#5a5a62', 4, 15, -15, 4));
  for (let i = 0; i < 3; i++) church.add(rbox(1, 2.2, 0.1, '#3a3a4a', -7 + i * 3, 4.2, -13.45, 0.3));
  outline(church, { px: 2 }); g.add(church);
  const stones = [];
  for (let r = 0; r < 9; r++) for (let i = 0; i < 16; i++) { const x = -9 + i * 1.15 + (r % 2) * 0.5 + (rr() - 0.5) * 0.3, z = 2.5 - r * 1.25 + (rr() - 0.5) * 0.3; if (Math.abs(x - 0.4) < 1.6 && z > -0.5 && z < 2.6) continue; if (x > -1.2 && x < 5 && z > 0.6) continue;
    const h = 0.9 + rr() * 0.7, c = ['#b8b4ac', '#a8a49c', '#c4c0b6', '#9a968e'][Math.floor(rr() * 4)];
    const s = rr() < 0.25 ? G(rbox(0.16, h, 0.16, c, 0, h / 2, 0, 0.04), rbox(0.6, 0.16, 0.16, c, 0, h * 0.72, 0, 0.04)) : G(rbox(0.75, h, 0.18, c, 0, h / 2, 0, 0.3));
    s.position.set(x, 0, z); s.rotation.set((rr() - 0.5) * 0.25, (rr() - 0.5) * 0.4, (rr() - 0.5) * 0.25); outline(s, { px: 2 }); g.add(s); stones.push(s); }
  // the fresh pit (dark), dirt mound, and an OLD closed coffin lid showing at the bottom
  const pit = rbox(1.6, 0.04, 2.6, '#2e2218', 0.4, 0.02, 1.1, 0.02); g.add(pit);
  const mound = ball(1.1, '#6a4a32', 2.2, 0, 1.3, 16); mound.scale.set(1, 0.45, 1.2); g.add(mound);
  const old = coffin({ cls: 3, color: '#8a6a4a', L: 1.6, W: 0.62, H: 0.3 }); old.rotation.y = Math.PI / 2; old.position.set(0.4, -0.22, 1.1); g.add(old);
  const sky = sunnySky(st, { clouds: 5, seed: 7, top: '#6f8fb0', mid: '#b8c8d8', horizon: '#e8e2d4' });
  return { group: g, sky, old, pitX: 0.4, update(t) { sky.update(t); } };
}
// cemetery-station bar: wood panels, counter, shelf of bottles, oil lamps (warm)
export function barSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#7a5234', 0, 0));
  const wall = plane(30, 9, '#a8743e', 0, 4.5, -4); wall.receiveShadow = true; g.add(wall); g.add(plane(30, 1.8, '#6a4224', 0, 0.9, -3.98));
  const counter = G(rbox(7, 1.3, 1.0, '#5a3418', 0, 0.65, -1.5, 0.05), rbox(7.3, 0.14, 1.25, '#8a5228', 0, 1.36, -1.45, 0.05)); outline(counter, { px: 2.4 }); g.add(counter);
  const shelf = G(rbox(6, 0.12, 0.5, '#5a3418', 0, 3.0, -3.7, 0.03), rbox(6, 0.12, 0.5, '#5a3418', 0, 4.1, -3.7, 0.03)); const rr = rng(3);
  for (let i = 0; i < 18; i++) { const c = ['#3a6a3a', '#7a3a2a', '#c0a050', '#2a4a6a'][i % 4]; const b = G(cyl(0.12, 0.13, 0.5, c, 0, 0.25, 0, 10), cyl(0.04, 0.05, 0.22, c, 0, 0.6, 0, 8)); b.position.set(-2.7 + (i % 9) * 0.65 + rr() * 0.1, i < 9 ? 3.06 : 4.16, -3.7); shelf.add(b); }
  outline(shelf, { px: 2.2 }); g.add(shelf);
  const sign = label('REFRESHMENTS', 3.6, 0.6, { bg: '#2a3a2a', ink: '#f0d890', border: false }); sign.position.set(0, 5.4, -3.95); g.add(sign);
  const lampL = glow(3, '#ffc070', 0.35); lampL.position.set(-3.2, 4.8, -3.6); g.add(lampL); const lampR = glow(3, '#ffc070', 0.35); lampR.position.set(3.2, 4.8, -3.6); g.add(lampR);
  return { group: g, counterY: 1.43, update() {} };
}
export function mug(o = {}) { const g = G(cyl(0.16, 0.15, 0.36, '#f0c040', 0, 0.18, 0, 14), cyl(0.165, 0.165, 0.08, '#fff8e0', 0, 0.38, 0, 14)); const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI), toon('#e8e2d0')); h.rotation.z = -Math.PI / 2; h.position.set(0.17, 0.18, 0); g.add(h); outline(g, { px: 2.2 }); return g; }
// engine cab interior (looking forward): boiler backhead with gauges, firebox door glow, regulator lever, side windows
export function cabSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(10, 8, '#3a3236', 0, 0));
  const back = G(rbox(4.2, 3.2, 0.3, '#2a2a30', 0, 1.6, -1.6, 0.05)); const bh = new THREE.Mesh(new THREE.CircleGeometry(1.4, 28), toon('#3a3a40')); bh.position.set(0, 2.1, -1.44); back.add(bh);
  const fb = rbox(0.9, 0.6, 0.1, '#ff8a2a', 0, 0.9, -1.42, 0.08); fb.material = flat('#ffa040'); back.add(fb);
  for (const [x, y] of [[-0.6, 2.7], [0.6, 2.7]]) { back.add(cyl(0.28, 0.28, 0.08, '#e0b84a', x, y, -1.38, 18).rotateX(Math.PI / 2)); const face = new THREE.Mesh(new THREE.CircleGeometry(0.22, 18), flat('#f8f0dc')); face.position.set(x, y, -1.33); back.add(face); }
  const lever = rbox(0.1, 1.0, 0.1, '#c0c0c8', 0.9, 2.0, -1.2, 0.03); lever.geometry.translate(0, 0.45, 0); back.add(lever);
  outline(back, { px: 2.4 }); g.add(back);
  for (const sx of [-1, 1]) { const side = plane(8, 5, '#2f5a3a', sx * 2.3, 2.5, 0); side.rotation.y = -sx * Math.PI / 2; g.add(side); const w = plane(1.2, 1.0, '#a8d8f0', sx * 2.28, 3.0, -0.4); w.rotation.y = -sx * Math.PI / 2; g.add(w); }
  const roof = plane(5, 8, '#24442c', 0, 4.6, 0); roof.rotation.x = Math.PI / 2; g.add(roof);
  const fglow = glow(2.6, '#ff8a2a', 0.55); fglow.position.set(0, 0.9, -1.2); g.add(fglow);
  return { group: g, lever, fglow, update(t) { fglow.material.opacity = 0.45 + noise(t * 7, 3) * 0.15; } };
}
// 1941 night: the London terminus building (empty), fire + smoke; searchlights are drawn in 2D
export function terminusNight(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(120, 80, '#2a2630', 0, -10));
  const C = '#7a6a64', D = '#5a4a48';
  const b = G(rbox(9, 9, 5, C, 0, 4.5, -4, 0.08), rbox(9.4, 0.4, 5.4, D, 0, 9.1, -4, 0.06));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const w = rbox(1.1, 1.4, 0.1, r === 0 && c === 1 ? '#ffb050' : '#2a2a3a', -3.2 + c * 2.1, 2.3 + r * 2.4, -1.45, 0.05); b.add(w); }
  outline(b, { px: 2.2 }); g.add(b);
  const sign = label('LONDON NECROPOLIS', 6.6, 0.8, { bg: '#e8dcc0' }); sign.position.set(0, 8.1, -1.42); g.add(sign);
  // the broken side wing (collapsed rubble, a jagged gap)
  const wing = G(rbox(6, 3.2, 5, C, -7.6, 1.6, -4, 0.06)); const rr = rng(5); for (let i = 0; i < 14; i++) wing.add(rbox(0.6 + rr() * 0.8, 0.4 + rr() * 0.5, 0.6 + rr() * 0.7, rr() < 0.5 ? C : D, -10 + rr() * 6, 0.3 + rr() * 0.5, -1 + rr() * 2.5, 0.08));
  outline(wing, { px: 2 }); g.add(wing);
  const fires = [[-7.5, 3.2, -3.5, 1.5], [-5.6, 3.0, -2.5, 1.0], [3.4, 9.3, -4.5, 1.1]].map(([x, y, z, s], i) => { const f = fire({ size: s, tongues: 6, seed: i + 2, light: i === 0 ? 2 : 0 }); f.position.set(x, y, z); g.add(f); return f; });
  const sm = smoke({ count: 16, size: 2.2, rise: 1.8, spread: 6, seed: 3, life: 5, drift: [0.5, 0], color: '#4a4048' }); sm.position.set(-4, 4, -5); g.add(sm);
  const em = embers({ count: 40, area: [12, 8, 3] }); em.position.set(-4, 2, -2); g.add(em);
  return { group: g, update(t) { fires.forEach(f => f.update(t)); sm.update(t); em.update(t); } };
}
// golf course beside the cemetery: bright green, a flag + hole, sand bunker, headstones far behind a fence
export function golfSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(200, 200, '#7cc05a', 0, -40));
  const green = new THREE.Mesh(new THREE.CircleGeometry(5, 32), toon('#9ad870')); green.rotation.x = -Math.PI / 2; green.position.set(3.5, 0.01, -3); green.scale.y = 0.6; g.add(green);
  const bunker = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), toon('#ecdca0')); bunker.rotation.x = -Math.PI / 2; bunker.position.set(-3.5, 0.015, -2.5); g.add(bunker);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), flat('#1a1a1a')); hole.rotation.x = -Math.PI / 2; hole.position.set(4.2, 0.02, -3); g.add(hole);
  const pole = cyl(0.04, 0.04, 3.2, '#f4f0e6', 4.2, 1.6, -3, 8); g.add(pole); const flag = rbox(0.9, 0.55, 0.03, '#d8342c', 4.65, 2.9, -3, 0.02); g.add(flag);
  const rr = rng(8); for (let i = 0; i < 22; i++) { const s = rbox(0.5, 0.7 + rr() * 0.3, 0.14, '#b8b4ac', -16 + i * 1.6 + rr() * 0.4, 0.4, -16 - (i % 2) * 1.4, 0.12); s.rotation.y = (rr() - 0.5) * 0.3; g.add(s); }
  for (let i = 0; i < 30; i++) g.add(box(0.08, 0.9, 0.08, '#6a5a4a', -24 + i * 1.6, 0.45, -12.5)); g.add(box(48, 0.06, 0.06, '#6a5a4a', 0, 0.75, -12.5));
  for (let i = 0; i < 8; i++) { const tr = G(cyl(0.18, 0.25, 1.4, '#6a4a32', 0, 0.7, 0, 8), cyl(0, 1.3, 2.8, '#3f7a45', 0, 2.6, 0, 10)); tr.position.set(-20 + i * 6 + rr() * 2, 0, -20 - rr() * 6); tr.scale.setScalar(1.2 + rr()); g.add(tr); }
  outline(g, { px: 2 });
  const sky = sunnySky(st, { clouds: 6, seed: 5 });
  return { group: g, sky, flag, update(t) { sky.update(t); flag.rotation.y = Math.sin(t * 3) * 0.15; } };
}
export function golfBag() { const g = G(cyl(0.22, 0.2, 1.1, '#b8322a', 0, 0.55, 0, 14), cyl(0.235, 0.235, 0.12, '#e8dcc0', 0, 1.06, 0, 14), rbox(0.08, 0.7, 0.08, '#e8dcc0', 0, 0.5, -0.22, 0.03));
  for (const [x, z, r] of [[-0.08, 0.05, 0.3], [0.08, -0.04, -0.2], [0.0, 0.1, 0.1]]) { g.add(cyl(0.025, 0.025, 0.7, '#c0c0c8', x, 1.4, z, 6)); const hd = rbox(0.18, 0.12, 0.1, '#5a4030', x + 0.06, 1.76, z, 0.04); hd.rotation.y = r; g.add(hd); }
  outline(g, { px: 2.4 }); return g; }
export function club() { const g = G(cyl(0.025, 0.025, 1.5, '#c0c0c8', 0, -0.75, 0, 6), rbox(0.24, 0.12, 0.1, '#c0c0c8', 0.08, -1.5, 0, 0.04), cyl(0.04, 0.04, 0.3, '#2a2228', 0, -0.1, 0, 8)); outline(g, { px: 2.2 }); return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text: lines near the top; each line = [[word, colour], ...] or a string
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return; const size = o.size || 92;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + (o.pre ?? 0.25) - i * 0.15) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * size * 1.12); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    const words = typeof l === 'string' ? [[l, '#ffffff']] : l; g.font = `900 ${size}px "Nunito", sans-serif`; const sp = size * 0.28;
    const ws = words.map(([w]) => g.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1); let x = -tot / 2;
    words.forEach(([w, c], j) => { insT(g, w, x + ws[j] / 2, 0, size, { color: c, stroke: CARD_INK }); x += ws[j] + sp; }); g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; if (o.until != null && t > o.until + 0.2) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * (o.until != null ? clamp((o.until + 0.2 - t) / 0.2) : 1);
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// railway ticket (2D card): LONDON NECROPOLIS RAILWAY / COFFIN / FIRST CLASS / LONDON -> BROOKWOOD; ONE WAY stamp later
export function ticket(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; const W = 820, H = 470;
  g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.43); g.scale(k, k); g.rotate(o.rot ?? -0.05);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 18, W, H, 26); g.fill();
  g.fillStyle = '#f2e2b0'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.setLineDash([16, 12]); g.lineWidth = 4; g.strokeStyle = '#8a6a3a'; g.beginPath(); g.roundRect(-W / 2 + 26, -H / 2 + 26, W - 52, H - 52, 16); g.stroke(); g.setLineDash([]);
  insT(g, 'LONDON NECROPOLIS RAILWAY', 0, -H / 2 + 78, 40, { color: '#5a3a1a', stroke: null, maxW: W - 100 });
  insT(g, o.title || 'COFFIN', 0, -22, 112, { color: CARD_INK, stroke: null, maxW: W - 120 });
  insT(g, o.sub || 'FIRST CLASS', 0, 72, 50, { color: '#b23a2a', stroke: null });
  insT(g, 'LONDON  ➜  BROOKWOOD', 0, H / 2 - 72, 46, { color: '#3a2a1a', stroke: null, maxW: W - 120 });
  g.restore();
}
// carriage plan (blueprint): 2 sections (ANGLICAN | NONCONFORMIST) x 3 classes; mourners fill, then coffins slide into their own boxes
export function carriagePlan(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k);
  const W = 960, H = 1040; g.fillStyle = '#1f4f86'; g.strokeStyle = '#f2f0e6'; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(-W / 2 + i * W / 12, -H / 2); g.lineTo(-W / 2 + i * W / 12, H / 2); g.stroke(); g.beginPath(); g.moveTo(-W / 2, -H / 2 + i * H / 12); g.lineTo(W / 2, -H / 2 + i * H / 12); g.stroke(); }
  const pr = clamp((t - (o.relT ?? 0.4)) / 0.4), pc = clamp((t - (o.clsT ?? 1.2)) / 0.4), pl = clamp((t - (o.livT ?? 2.0)) / 0.5), pd = clamp((t - (o.deadT ?? 2.8)) / 0.5);
  const cols = [{ x: -W / 4, name: 'ANGLICAN', c: '#ffd25a' }, { x: W / 4, name: 'NONCONFORMIST', c: '#8fe0ff' }];
  cols.forEach(cl => insT(g, cl.name, cl.x, -H / 2 + 70, 52, { color: cl.c, stroke: null, a: pr, maxW: W / 2 - 40 }));
  g.save(); g.globalAlpha = pr; g.strokeStyle = '#f2f0e6'; g.lineWidth = 12; g.beginPath(); g.moveTo(0, -H / 2 + 30); g.lineTo(0, H / 2 - 30); g.stroke(); g.restore();
  const rowH = 270, y0 = -H / 2 + 140;
  ['1st', '2nd', '3rd'].forEach((c, r) => { const y = y0 + r * (rowH + 22);
    cols.forEach((cl, j) => { const bx = cl.x - W / 4 + 30, bw = W / 2 - 60;
      g.save(); g.globalAlpha = pc; g.strokeStyle = '#f2f0e6'; g.lineWidth = 6; g.beginPath(); g.roundRect(bx, y, bw, rowH, 14); g.stroke(); g.restore();
      insT(g, c.toUpperCase(), bx + 70, y + 46, 46, { color: '#ffffff', stroke: null, a: pc });
      // the living (heads in top hats) on the left half of the box, the dead (a coffin) on the right half
      const ka = ease.outBack(clamp((pl - r * 0.15) * 1.6)); if (ka > 0) for (let m = 0; m < 2; m++) { const hx = bx + 70 + m * 80, hy = y + rowH - 80; g.save(); g.translate(hx, hy); g.scale(ka, ka); g.fillStyle = '#f2f0e6'; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill(); g.fillRect(-18, -66, 36, 40); g.fillRect(-30, -30, 60, 8); g.fillRect(-30, 30, 60, 48); g.restore(); }
      const kd = ease.outBack(clamp((pd - r * 0.15 - j * 0.08) * 1.6)); if (kd > 0) { g.save(); g.translate(bx + bw - 120, y + rowH * 0.6); g.scale(kd, kd); g.fillStyle = '#c99a62'; g.strokeStyle = '#f2f0e6'; g.lineWidth = 6; g.beginPath(); g.moveTo(-90, -22); g.lineTo(-40, -36); g.lineTo(90, -26); g.lineTo(90, 26); g.lineTo(-40, 36); g.lineTo(-90, 22); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    }); });
  insT(g, 'LIVING', -W / 4 - 70, H / 2 - 34, 36, { color: '#ffffff', stroke: null, a: pl }); insT(g, 'DEAD', W / 4 + 90, H / 2 - 34, 36, { color: '#ffd25a', stroke: null, a: pd });
  g.restore();
}
// route map: London (left, a smoky blob) -> Brookwood (right, green), dashed line with a chugging train icon
export function routeMap(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); if (k <= 0) return; g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.46); g.scale(k, k);
  const W = 940, H = 720; g.fillStyle = '#efe4c6'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.fillStyle = '#9fc4dc'; g.beginPath(); g.moveTo(-W / 2 + 5, -60); g.bezierCurveTo(-300, -20, -260, 40, -W / 2 + 5, 90); g.fill();   // the Thames, roughly
  const A = [-300, -10], B = [300, 150]; const p = ease.inOut(clamp((t - 0.3) / (o.travel || 1.8)));
  g.save(); g.setLineDash([26, 18]); g.strokeStyle = '#b23a2a'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(0, -40, B[0], B[1]); g.stroke(); g.restore();
  for (const [P, c, n] of [[A, '#5a5a62', 'LONDON'], [B, '#3f8a45', 'BROOKWOOD']]) { g.fillStyle = c; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.arc(P[0], P[1], 46, 0, 7); g.fill(); g.stroke(); insT(g, n, P[0], P[1] + 92, 54, { color: CARD_INK, stroke: null }); }
  const q = (a, b, c, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c; const tx = q(A[0], 0, B[0], p), ty = q(A[1], -40, B[1], p);
  g.save(); g.translate(tx, ty - 46); g.fillStyle = '#2f5a3a'; g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.roundRect(-46, -26, 92, 46, 10); g.fill(); g.stroke(); g.fillStyle = '#262228'; g.fillRect(16, -52, 18, 28);
  for (let i = 0; i < 3; i++) { const a = ((t * 2 + i / 3) % 1); g.globalAlpha = 1 - a; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(25 - a * 60, -60 - a * 50, 10 + a * 16, 0, 7); g.fill(); } g.restore();
  insT(g, o.title || '23 MILES', 0, -H / 2 + 90, 96, { color: '#b23a2a', stroke: null, a: clamp((t - (o.milesT ?? 0.6)) / 0.25) });
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, fire, smoke, embers, glow, canvasTex, label, E };
