// shared helpers for "The Olympic Winner Rode in a Car" (olympic-car, 1904 St. Louis marathon). Underscore = not auto-loaded.
// Everything period-specific (the 1904 car, the dirt road, the stadium finish, the orchard) lives here, not in the kit.
import { E, wordTime, text, ease, prog, clamp, FONTS, rng } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, box, cyl, ball, torus, floor, blob } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import { castMember, cat } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
export { THREE, castMember, cat, PR, FX };

// local time (s into the shot) when `word` is spoken
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
// dark pill with gold text at the top of the frame ("ST. LOUIS, 1904")
export function tag(g, str, k = 1, y = 0.14, o = {}) { if (k <= 0) return; const size = o.size || 54; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2 + (o.x || 0), E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + size * 1.3; g.fillStyle = o.bg || 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -size * 0.78, w, size * 1.56, size * 0.78); g.fill(); text(g, str, 0, 2, { size, color: o.color || '#ffd25a', weight: 700 }); g.restore(); }
// big gold slam ("4th", "+29 MIN")
export function slam(g, str, k, x = E.W / 2, y = E.H * 0.36, size = 220) { if (k <= 0) return; g.save(); const s = 1.6 - 0.6 * ease.outBack(clamp(k)); g.translate(x, y); g.scale(s, s); g.rotate(-0.06); g.globalAlpha = clamp(k * 2); text(g, str, 0, 0, { size, color: '#ffd25a', weight: 700, stroke: size * 0.09, strokeColor: '#20161a' }); g.restore(); }
// floating "z"
export function zzz(g, x, y, t, k = 1) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const a = ((t * 0.6 + i / 3) % 1); text(g, 'z', x + a * 70 + Math.sin(a * 6) * 12, y - a * 170, { size: 46 + a * 40, color: '#ffffff', stroke: 10, strokeColor: '#20161a', alpha: k * Math.sin(Math.PI * a) }); } }
// world -> logical screen position
export function screen(st, v) { const p = v.clone().project(st.camera); return [(p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H]; }
// mustard closer pill
export function closer(g, str, k) { if (k <= 0) return; g.save(); const s = 0.7 + 0.3 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * 0.2); g.scale(s, s); g.globalAlpha = clamp(k * 2); g.font = `700 76px "${FONTS.title}"`; const w = g.measureText(str).width + 110; g.fillStyle = '#d9a21b'; g.beginPath(); g.roundRect(-w / 2, -66, w, 132, 66); g.fill(); g.lineWidth = 8; g.strokeStyle = '#20161a'; g.stroke(); text(g, str, 0, 4, { size: 76, color: '#20161a', weight: 700 }); g.restore(); }

// ---------- 1904 people ----------
// runners: light vest + dark shorts, bare legs. i varies skin/hair.
const SK = ['fair', 'tan', 'light', 'olive', 'brown'];
export const runner = (i = 0, o = {}) => bean({ name: 'Runner', outfit: 'tee', colors: { main: ['#f2efe8', '#e8d8b0', '#cfe0f0'][i % 3], legsTop: ['#26324a', '#3a2a22', '#4a3a5a'][i % 3], legs: 'skin', feet: '#3a2a22' }, skin: SK[i % SK.length], hair: ['bowl', 'swoop', 'curly'][i % 3], hairColor: ['#3a2618', '#6a4428', '#1e1612'][i % 3], seed: 300 + i, ...o });
// LORZ (original toon, not a portrait): red vest, swoop hair, clean-shaven, very pleased with himself
export const lorz = (o = {}) => bean({ name: 'Lorz', outfit: 'tee', colors: { main: '#c8372d', legsTop: '#f2efe8', legs: 'skin', feet: '#3a2a22' }, skin: 'fair', hair: 'swoop', hairColor: '#4a2e1e', seed: 311, ...o });
// HICKS: white vest, navy shorts, moustache, tired
export const hicks = (o = {}) => bean({ name: 'Hicks', outfit: 'tee', colors: { main: '#f2efe8', legsTop: '#2a3a6a', legs: 'skin', feet: '#3a2a22' }, skin: 'light', hair: 'bowl', hairColor: '#6a4428', moustache: '#6a4428', seed: 312, ...o });
// handlers: suits + flat caps (1904 trainers)
export const handler = (i = 0, o = {}) => bean({ name: 'Handler', outfit: 'uniform', colors: { main: ['#5a4a3a', '#3a4a5a'][i % 2], legsTop: ['#4a3a2a', '#2a3a4a'][i % 2], trim: '#c9b48a' }, head: 'cap', headColor: ['#6a5a48', '#4a4a50'][i % 2], skin: ['tan', 'fair'][i % 2], hair: 'bowl', moustache: i % 2 ? '#3a2618' : false, seed: 320 + i, ...o });
// the Cuban runner (legend beat): white long shirt, dark long trousers cut at the knee, beret-ish cap
export const cuban = (o = {}) => bean({ name: 'Cuban runner', outfit: 'tee', colors: { main: '#f4f1ea', legsTop: '#2e2e3a', legs: '#2e2e3a', feet: '#2a2220' }, skin: 'tan', hair: 'curly', hairColor: '#1e1612', moustache: '#1e1612', seed: 330, ...o });
// the car's driver: duster coat, goggles feel (cap)
export const driver = (o = {}) => bean({ name: 'Driver', outfit: 'labcoat', colors: { main: '#c9b48a', legsTop: '#4a3a2a', shirt: '#7a6a5a' }, head: 'cap', headColor: '#5a4a3a', skin: 'fair', hair: 'bald', moustache: '#8a6a4a', seed: 340, ...o });

// ---------- the 1904 car: open "horseless carriage", two high bench seats, big spoked wheels, brass lamps ----------
// faces +Z. .drive(dist) spins the wheels. .seatF / .seatB = seat-top y for front / back bench (z +0.35 / -0.75).
export function oldCar(o = {}) {
  const { color = '#8a2a2a' } = o; const dark = shadeHex(color, -0.35), brass = '#d8b04a';
  const g = PR.propGroup();
  g.add(rbox(1.5, 0.18, 3.4, '#2a2420', 0, 0.78, 0, 0.04));                                    // frame
  g.add(rbox(1.45, 0.55, 1.1, color, 0, 1.12, 1.15, 0.12));                                    // engine bonnet (front)
  g.add(rbox(1.5, 0.6, 2.2, color, 0, 1.15, -0.55, 0.12));                                     // tub body
  g.add(rbox(1.3, 0.12, 0.8, '#1e1a18', 0, 1.47, 0.3, 0.05), rbox(1.3, 0.12, 0.8, '#1e1a18', 0, 1.47, -0.85, 0.05));   // seat cushions
  g.add(rbox(1.3, 0.55, 0.14, '#1e1a18', 0, 1.78, -0.05, 0.06), rbox(1.3, 0.6, 0.14, '#1e1a18', 0, 1.8, -1.22, 0.06));   // seat backs
  const col = cyl(0.035, 0.035, 0.95, '#2a2420', 0.32, 1.7, 0.85, 8); col.rotation.x = -0.55; g.add(col);   // steering column (driver sits on the car's left = +X)
  const wheel = torus(0.2, 0.03, '#2a2420', 0.32, 2.08, 0.62); wheel.rotation.x = 1.0; g.add(wheel);
  for (const sx of [-1, 1]) { const lamp = cyl(0.11, 0.09, 0.2, brass, sx * 0.6, 1.5, 1.72, 14); lamp.rotation.x = Math.PI / 2; g.add(lamp); g.add(ball(0.08, '#fff2c0', sx * 0.6, 1.5, 1.83, 10)); }
  const horn = cyl(0.02, 0.09, 0.35, brass, -0.8, 1.6, 0.9, 10); horn.rotation.x = Math.PI / 2; g.add(horn); g.add(ball(0.09, '#1e1a18', -0.8, 1.6, 0.68, 10));
  const wheels = [];
  for (const [z, r] of [[1.25, 0.52], [-1.15, 0.6]]) for (const sx of [-1, 1]) {
    const wg = new THREE.Group(); wg.position.set(sx * 0.86, r, z);
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(r - 0.06, 0.07, 8, 28), toon('#1e1a18')); tyre.rotation.y = Math.PI / 2; tyre.castShadow = true; wg.add(tyre);
    const hub = cyl(0.08, 0.08, 0.16, brass, 0, 0, 0, 10); hub.rotation.z = Math.PI / 2; wg.add(hub);
    for (let k = 0; k < 6; k++) { const sp = box(0.04, (r - 0.08) * 2, 0.035, '#e8d8a0', 0, 0, 0); sp.rotation.x = (k * Math.PI) / 6; wg.add(sp); }
    g.add(wg); wheels.push(wg);
    const fender = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.08, r + 0.08, 0.3, 16, 1, true, -Math.PI / 2, Math.PI), toon(dark, { side: THREE.DoubleSide })); fender.rotation.z = Math.PI / 2; fender.position.set(sx * 0.86, r + 0.04, z); g.add(fender);
  }
  g.add(blob(2.4, 0.3)); outline(g, { px: 2.6 });
  g.wheels = wheels; g.seatF = 1.53; g.seatB = 1.53; g.zF = 0.3; g.zB = -0.85;
  g.drive = (dist) => wheels.forEach((w, i) => (w.rotation.x = dist / (i < 2 ? 0.52 : 0.6)));
  return g;
}
// sit a bean on a car bench (local to the car); x: +0.32 driver side
export function seat(car, b, x, back = false) { b.position.set(x, (back ? car.seatB : car.seatF) - 0.8, back ? car.zB : car.zF); car.add(b); }

// ---------- scenery ----------
function texFloor(w, d, tex) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), PR.texMat(tex)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; return m; }
// round leafy tree (Missouri, not a gum tree). apples: true adds red fruit
export function tree(o = {}) {
  const { s = 1, seed = 3, apples = false } = o; const r = rng(seed); const g = PR.propGroup(); const leaf = ['#6f9a4a', '#5f8a3e', '#82aa58'];
  g.add(cyl(0.16 * s, 0.24 * s, 2.2 * s, '#7a5a3e', 0, 1.1 * s, 0, 10));
  for (let i = 0; i < 6; i++) { const a = r() * Math.PI * 2, d = 0.3 + r() * 0.7; g.add(ball((0.7 + r() * 0.35) * s, leaf[i % 3], Math.cos(a) * d * s, (2.6 + r() * 0.8) * s, Math.sin(a) * d * s, 14)); }
  if (apples) for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = 0.9 + r() * 0.4; g.add(ball(0.11 * s, i % 4 ? '#c8372d' : '#9a8a3a', Math.cos(a) * d * s, (2.2 + r() * 1.2) * s, Math.sin(a) * d * s, 10)); }
  g.add(blob(1.5 * s, 0.22)); outline(g, { px: 2.2 }); return g;
}
// wooden mile post with a painted board
export function milePost(txt) {
  const g = PR.propGroup(); g.add(cyl(0.07, 0.08, 2.2, '#6a4a2e', 0, 1.1, 0, 8));
  const t = canvasTex(256, 128, (x, W, H) => { x.fillStyle = '#efe3c4'; x.fillRect(0, 0, W, H); x.strokeStyle = '#5a3a1a'; x.lineWidth = 10; x.strokeRect(5, 5, W - 10, H - 10); x.fillStyle = '#3a2410'; x.font = '900 70px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, W / 2, H / 2 + 4); });
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.65, 0.06), [toon('#d8c49a'), toon('#d8c49a'), toon('#d8c49a'), toon('#d8c49a'), PR.texMat(t), toon('#d8c49a')]); b.position.y = 2.05; b.castShadow = true; g.add(b);
  outline(g, { px: 2.4 }); return g;
}
// country dirt road along X (cars and runners move along +X), fields, trees, a rail fence, low hills.
export function roadScene(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: o.fov || 40, shadowSize: o.shadowSize || 14, target: o.target || [0, 0, 0], fog: [30, 90, '#e4e6dc'], bg: ['#9cc4ea', '#e6ecea'], ...(o.stage || {}) });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 5);
  const grass = texFloor(260, 160, PR.TEX.plaster('#9ab45a', [10, 10])); grass.position.z = -40; g.add(grass);
  const road = texFloor(260, 4.2, PR.TEX.plaster('#c9a473', [40, 1])); road.position.set(0, 0.01, 0); g.add(road);
  for (let x = -120; x <= 120; x += 3) { const p = cyl(0.06, 0.07, 1.1, '#8a6a4a', x, 0.55, -3.2, 6); g.add(p); }
  for (const y of [0.55, 0.95]) { const rail = box(240, 0.07, 0.05, '#9a7a5a', 0, y, -3.2); g.add(rail); }
  for (let i = 0; i < 26; i++) { const x = -110 + i * 9 + r() * 4, z = -6 - r() * 10; g.add(tree({ s: 0.9 + r() * 0.5, seed: 40 + i }).at(x, 0, z)); }
  for (let i = 0; i < 10; i++) { const x = -100 + i * 22 + r() * 6; g.add(tree({ s: 1 + r() * 0.3, seed: 90 + i }).at(x, 0, 6 + r() * 4)); }
  const hill = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#86a65a')); hill.scale.set(2.2, 0.14, 0.4); hill.position.set(0, 0, -70); g.add(hill);
  const dust = FX.smoke({ count: 10, size: 0.9, rise: 0.25, life: 1.6, spread: 0.5, drift: [-1.2, 0], color: '#d8c49a', seed: 7 }); st.add(dust);
  return { stage: st, group: g, dust };
}
// stadium finish (Francis Field feel): cinder track along X, finish posts + banner + tape, a grandstand with a crowd, bunting.
export function stadium(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: o.fov || 40, shadowSize: o.shadowSize || 12, target: o.target || [0, 0, -2], bg: ['#a4c8ec', '#eef0ea'], ...(o.stage || {}) });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 9);
  const grass = texFloor(200, 120, PR.TEX.plaster('#8fb052', [10, 10])); grass.position.z = -20; g.add(grass);
  const track = texFloor(200, 5, PR.TEX.plaster('#b8704a', [30, 1])); track.position.set(0, 0.01, 0); g.add(track);
  for (const z of [-2.5, 2.5]) g.add(box(200, 0.01, 0.08, '#f4f0e6', 0, 0.02, z));
  // finish line + posts + banner
  g.add(box(0.25, 0.012, 5, '#f4f0e6', 0, 0.025, 0));
  for (const z of [-2.8, 2.8]) g.add(cyl(0.08, 0.08, 4.2, '#efe3c4', 0, 2.1, z, 10));
  const bt = canvasTex(512, 96, (x, W, H) => { x.fillStyle = '#f4f0e6'; x.fillRect(0, 0, W, H); x.fillStyle = '#c8372d'; x.fillRect(0, 0, W, 10); x.fillRect(0, H - 10, W, 10); x.fillStyle = '#20161a'; x.font = '900 64px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FINISH', W / 2, H / 2 + 3); });
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 5.6), [PR.texMat(bt), PR.texMat(bt), toon('#f4f0e6'), toon('#f4f0e6'), toon('#f4f0e6'), toon('#f4f0e6')]); banner.position.set(0, 3.8, 0); g.add(banner);
  // stands behind the track (-Z): stepped tiers, crowd of simple beans (heads + bodies, no faces = cheap)
  for (let i = 0; i < 4; i++) g.add(rbox(60, 0.6, 1.4, i % 2 ? '#a88a62' : '#b89a72', 0, 0.3 + i * 0.6, -5 - i * 1.4, 0.04));
  g.add(rbox(60, 0.25, 7, '#7a5a3e', 0, 4.6, -7.4, 0.05));                                          // roof
  for (let x = -28; x <= 28; x += 4) g.add(cyl(0.08, 0.08, 4.4, '#efe3c4', x, 2.3, -3.9, 8));
  const crowd = []; const tops = ['#3a4a6a', '#6a3a3a', '#e8e0d0', '#4a5a3a', '#2a2a32', '#8a6a3a', '#c9b48a'], skins = ['#f1c9a5', '#d9a477', '#b07a50', '#7a4a2e', '#e8b48a'];
  for (let i = 0; i < 3; i++) for (let x = -26; x <= 26; x += 1.1) { if (r() < 0.12) continue; if (o.clear && i === 0 && x > o.clear[0] && x < o.clear[1]) continue; const c = new THREE.Group(); const b = rbox(0.6, 0.75, 0.5, tops[Math.floor(r() * 7)], 0, 0.4, 0, 0.2); const h = ball(0.3, skins[Math.floor(r() * 5)], 0, 1.05, 0, 12); c.add(b, h); if (r() < 0.6) { const hat = cyl(0.36, 0.36, 0.05, r() < 0.5 ? '#2a2420' : '#e0cf9a', 0, 1.27, 0, 12); const crown = cyl(0.24, 0.26, 0.2, hat.material.color.getStyle(), 0, 1.38, 0, 12); c.add(hat, crown); } c.position.set(x + r() * 0.3, 0.6 + i * 0.6, -5 - i * 1.4); c.ph = r() * 6; g.add(c); crowd.push(c); }
  outline(g, { px: 2.0 });
  // bunting between the stand posts
  for (let x = -28; x < 28; x += 4) for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 3), toon(['#c8372d', '#f4f0e6', '#2f5aa8'][k % 3])); f.rotation.x = Math.PI; f.position.set(x + 0.35 + k * 0.6, 4.1 - Math.sin((k + 0.5) / 6 * Math.PI) * 0.4, -3.9); f.userData.noOutline = true; g.add(f); }
  const update = (t, cheer = 0.5) => crowd.forEach((c, i) => { c.position.y = c.userData.y0 ?? (c.userData.y0 = c.position.y); c.position.y = c.userData.y0 + Math.max(0, Math.sin(t * 9 + c.ph)) * 0.18 * cheer; });
  return { stage: st, group: g, crowd, update };
}
// orchard: grass, rows of apple trees, the road at the back
export function orchard(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: o.fov || 40, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0], fog: [25, 80, '#e4e6dc'], bg: ['#9cc4ea', '#e6ecea'], ...(o.stage || {}) });
  const g = new THREE.Group(); st.add(g);
  const grass = texFloor(200, 160, PR.TEX.plaster('#94b456', [10, 10])); grass.position.z = -30; g.add(grass);
  const road = texFloor(200, 3.6, PR.TEX.plaster('#c9a473', [30, 1])); road.position.set(0, 0.01, -14); g.add(road);
  let k = 0; for (let x = -18; x <= 18; x += 4.5) for (let z = -10; z <= 4; z += 4.5) { if (Math.abs(x) < 3 && z > -3) continue; g.add(tree({ s: 0.95, seed: 60 + k++, apples: true }).at(x + (z % 2), 0, z)); }
  const big = tree({ s: 1.25, seed: 77, apples: true }).at(0.4, 0, -1.8); g.add(big);
  for (let i = 0; i < 9; i++) { const a = ball(0.12, i % 3 ? '#8a6a2a' : '#a8402a', -1.4 + i * 0.37, 0.1, 0.4 + (i % 3) * 0.3, 10); g.add(a); }   // fallen (rotten) apples
  return { stage: st, group: g, tree: big };
}
// held apple
export const apple = (rotten = false) => { const g = PR.propGroup(ball(0.13, rotten ? '#8a6a2a' : '#c8372d', 0, 0, 0, 14), cyl(0.012, 0.012, 0.08, '#4a3a22', 0, 0.14, 0, 5)); if (rotten) for (let i = 0; i < 3; i++) g.add(ball(0.04, '#4a5a2a', Math.cos(i * 2) * 0.1, Math.sin(i * 3) * 0.06, 0.09, 8)); outline(g, { px: 2.2 }); return g; };
// cup, egg, small brandy bottle, small medicine bottle (labels kept generic)
export const cup = () => { const g = PR.propGroup(cyl(0.09, 0.07, 0.18, '#e8e4dc', 0, 0, 0, 14)); outline(g, { px: 2.2 }); return g; };
export const egg = () => { const e = ball(0.09, '#f4ecdc', 0, 0, 0, 14); e.scale.set(0.85, 1.1, 0.85); const g = PR.propGroup(e); outline(g, { px: 2.2 }); return g; };
export const bottle = (c = '#7a4a1e', h = 0.42) => { const g = PR.propGroup(cyl(0.09, 0.09, h * 0.65, c, 0, h * 0.32, 0, 12), cyl(0.035, 0.05, h * 0.3, c, 0, h * 0.8, 0, 10), cyl(0.04, 0.04, 0.06, '#c9a46a', 0, h * 0.98, 0, 8)); outline(g, { px: 2.2 }); return g; };
// big 2D stopwatch / clock face overlay (used for the payoff)
export function clockFace(g, x, y, r, t, k = 1, fast = 1) { if (k <= 0) return; g.save(); g.globalAlpha = clamp(k * 2); g.translate(x, y); const s = 0.6 + 0.4 * ease.outBack(clamp(k)); g.scale(s, s);
  g.fillStyle = '#c9c4bc'; g.beginPath(); g.arc(0, -r - 18, 26, 0, 7); g.fill(); g.fillStyle = '#fbf8f2'; g.strokeStyle = '#20161a'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
  g.lineWidth = 6; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(Math.sin(a) * r * 0.82, -Math.cos(a) * r * 0.82); g.lineTo(Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92); g.stroke(); }
  const a1 = t * fast * 6, a2 = t * fast * 0.5; g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a2) * r * 0.5, -Math.cos(a2) * r * 0.5); g.stroke(); g.strokeStyle = '#c8372d'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a1) * r * 0.8, -Math.cos(a1) * r * 0.8); g.stroke(); g.fillStyle = '#20161a'; g.beginPath(); g.arc(0, 0, 12, 0, 7); g.fill(); g.restore(); }
