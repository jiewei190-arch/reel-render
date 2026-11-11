// shared helpers for "Dagen H" (Sweden switches road sides, 3 Sept 1967). Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, canvasTex, outline, rbox, box, cyl, ball, torus, floor, blob } from '/kits/toon3d/toon.js';
import { bean, POSE } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };
export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };
// gold pill tag at the top of the frame
export function tag(g, str, k = 1, y = 0.13, size = 54) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -size * 0.78, w, size * 1.56, size * 0.78); g.fill(); text(g, str, 0, 2, { size, color: '#ffd25a', weight: 700 }); g.restore(); }

// stage: 'dawn' (5 AM, pink-gold sky) or 'day' (kit sunny look)
export function stage(T, mode = 'day', o = {}) {
  const st = toonStage(T, { light: mode === 'dawn' ? 'dusk' : 'sunny', fov: 40, shadowSize: o.shadowSize || 12, target: o.target || [0, 0, 0], ...(mode === 'dawn' ? { key: ['#ffc890', 2.4, [-9, 6, -6]], ambient: 1.15 } : {}) });
  const sky = mode === 'dawn' ? sunnySky(st, { top: '#33407e', mid: '#d99aa8', horizon: '#ffcf8f', sunGlow: '#ffd59a', glow: 0.8, clouds: 7, cloudColor: '#ffd8c8', seed: o.seed || 4 })
                              : sunnySky(st, { clouds: 9, seed: o.seed || 3 });
  return { stage: st, sky };
}

// ---------- props ----------
// 1960s rounded car (left-hand drive: the driver sits on the car's left = +X). Faces +Z. .drive(dist) spins the wheels.
export function car(o = {}) {
  const { color = '#c0392b', roof = null, driver = true, seed = 1, skin = 'fair', hair = 'swoop', hairColor = '#5a3a22', shirt = '#3f6fa8' } = o;
  const g = new THREE.Group(); const dark = '#2a2a2e', chrome = '#d6d8dc';
  g.add(rbox(1.8, 0.62, 4.1, color, 0, 0.72, 0, 0.28));                                    // body
  g.add(rbox(1.66, 0.3, 1.25, color, 0, 1.12, 1.25, 0.14), rbox(1.66, 0.28, 1.1, color, 0, 1.1, -1.45, 0.14));   // bonnet + boot
  g.add(rbox(1.62, 0.12, 1.85, roof || color, 0, 2.3, -0.3, 0.06));                        // roof
  for (const sx of [-0.74, 0.74]) for (const z of [0.55, -1.15]) g.add(cyl(0.05, 0.05, 1.1, color, sx, 1.71, z, 8));   // pillars
  g.add(rbox(1.5, 0.5, 0.05, '#cfe6f2', 0, 1.55, 0.6, 0.02));                              // windscreen
  g.children[g.children.length - 1].material = toon('#cfe6f2', { transparent: true, opacity: 0.3, fresh: true }); g.children[g.children.length - 1].userData.noOutline = true;
  g.add(rbox(1.5, 0.32, 0.55, '#6a4a32', 0, 1.12, -0.55, 0.08), rbox(1.5, 0.55, 0.14, '#6a4a32', 0, 1.42, -0.85, 0.06));  // bench seat
  const sw = torus(0.17, 0.03, dark, 0.38, 1.38, 0.32); sw.rotation.x = -0.5; g.add(sw);
  for (const sx of [-0.56, 0.56]) { g.add(ball(0.14, '#fff3c0', sx, 0.86, 2.02, 14)); g.add(box(0.26, 0.12, 0.06, '#d8342c', sx, 0.86, -2.06)); }
  for (const z of [2.08, -2.08]) g.add(rbox(1.86, 0.13, 0.14, chrome, 0, 0.46, z, 0.05));
  g.add(rbox(0.6, 0.18, 0.04, '#f2f2f2', 0, 0.62, 2.12, 0.02));                             // plate
  const wheels = []; for (const z of [1.35, -1.35]) for (const sx of [-0.86, 0.86]) { const wg = new THREE.Group(); wg.position.set(sx, 0.42, z); const ty = torus(0.29, 0.13, '#1e1e20'); ty.rotation.y = Math.PI / 2; wg.add(ty); const hub = cyl(0.18, 0.18, 0.1, chrome, 0, 0, 0, 14); hub.rotation.z = Math.PI / 2; wg.add(hub); g.add(wg); wheels.push(wg); }
  g.add(blob(2.6, 0.32)); outline(g, { px: 2.6 });
  let d = null;
  if (driver) { d = bean({ name: 'driver', outfit: 'tee', colors: { main: shirt }, skin, hair, hairColor, seed, scale: 0.56, shadowBlob: false }); d.position.set(0.38, 0.5, -0.5); g.add(d); d.pose(POSE.sit); }
  g.driver = d; g.wheels = wheels; g.drive = (dist) => wheels.forEach(w => (w.rotation.x = dist / 0.42));
  return g;
}
const PAL = ['#c0392b', '#2f6db0', '#e0b12f', '#3f8a5a', '#e8e2d2', '#7a4a8a', '#e07a2f', '#5aa0b8'];
const SHIRT = ['#3f6fa8', '#c0392b', '#3f8a7a', '#d9a21b', '#7a4a8a', '#e8e2d2'];
const SKINS = ['fair', 'light', 'fair', 'tan', 'light'];
const HAIR = [['swoop', '#5a3a22'], ['bob', '#e0c070'], ['messy', '#8a5a2a'], ['bowl', '#d8b060'], ['curly', '#3a2618'], ['bun', '#c9a050']];
export const carN = (i, o = {}) => car({ color: PAL[i % PAL.length], roof: i % 3 === 0 ? '#f2eee4' : null, shirt: SHIRT[i % SHIRT.length], skin: SKINS[i % SKINS.length], hair: HAIR[i % HAIR.length][0], hairColor: HAIR[i % HAIR.length][1], seed: 40 + i, ...o });

// street clock on a pole; .set(h, m) moves the hands (face points +Z)
export function streetClock(o = {}) {
  const g = new THREE.Group(); const h = o.h || 4.4, R = o.r || 0.75;
  g.add(cyl(0.09, 0.12, h, '#2a3a34', 0, h / 2, 0, 10), cyl(0.2, 0.25, 0.3, '#2a3a34', 0, 0.15, 0, 12));
  const rim = cyl(R + 0.08, R + 0.08, 0.22, '#2a3a34', 0, h + R, 0, 32); rim.rotation.x = Math.PI / 2; g.add(rim);
  const face = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#fbf6e8'; x.beginPath(); x.arc(W / 2, H / 2, W / 2, 0, 7); x.fill(); x.fillStyle = '#20161a'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.save(); x.translate(W / 2, H / 2); x.rotate(a); x.fillRect(-5, -W / 2 + 12, 10, i % 3 ? 22 : 36); x.restore(); } });
  const fm = new THREE.Mesh(new THREE.CircleGeometry(R, 40), toon('#ffffff', { map: face, fresh: true })); fm.position.set(0, h + R, 0.115); fm.userData.noOutline = true; g.add(fm);
  outline(g, { px: 2.6 });
  const mkHand = (len, w) => { const p = new THREE.Group(); p.position.set(0, h + R, 0.14); const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.03), toon('#20161a')); m.position.y = len / 2 - 0.06; m.userData.noOutline = true; p.add(m); g.add(p); return p; };
  const hh = mkHand(R * 0.55, 0.09), mh = mkHand(R * 0.85, 0.06); g.add(ball(0.06, '#c0392b', 0, h + R, 0.17, 10));
  g.set = (hr, mn) => { mh.rotation.z = -(mn / 60) * Math.PI * 2; hh.rotation.z = -((hr % 12) + mn / 60) / 12 * Math.PI * 2; };
  g.faceY = h + R; return g;
}
// Swedish flag on a pole
export function flag(o = {}) {
  const g = new THREE.Group(); const h = o.h || 5; g.add(cyl(0.05, 0.06, h, '#e8e8e8', 0, h / 2, 0, 8), ball(0.09, '#e0b12f', 0, h + 0.05, 0, 10));
  const tx = canvasTex(160, 100, (x, W, H) => { x.fillStyle = '#1f5fa8'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2c230'; x.fillRect(50, 0, 20, H); x.fillRect(0, 40, W, 20); });
  const geo = new THREE.PlaneGeometry(1.6, 1.0, 12, 1); const m = new THREE.Mesh(geo, toon('#ffffff', { map: tx, side: THREE.DoubleSide, fresh: true })); m.position.set(0.82, h - 0.55, 0); m.userData.noOutline = true; g.add(m);
  const p0 = geo.attributes.position.array.slice();
  g.update = (t) => { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = p0[i * 3] + 0.8; a.setZ(i, Math.sin(x * 3 - t * 5) * 0.12 * x); } a.needsUpdate = true; };
  outline(g, { px: 2.2 }); return g;
}
// round blue "keep left/right" sign (white arrow down-left or down-right). Two faces: front = side A, back = side B
export function keepSign(o = {}) {
  const g = new THREE.Group(); g.add(cyl(0.05, 0.05, 2.2, '#9aa0a6', 0, 1.1, 0, 8));
  const face = (dir) => canvasTex(200, 200, (x, W, H) => { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(100, 100, 100, 0, 7); x.fill(); x.fillStyle = '#1f5fa8'; x.beginPath(); x.arc(100, 100, 90, 0, 7); x.fill(); x.save(); x.translate(100, 100); x.rotate(dir * Math.PI / 4); x.fillStyle = '#fff'; x.fillRect(-14, -60, 28, 80); x.beginPath(); x.moveTo(-42, 18); x.lineTo(42, 18); x.lineTo(0, 66); x.fill(); x.restore(); });
  const plate = new THREE.Group(); plate.position.y = 2.45; g.add(plate);
  const A = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), toon('#ffffff', { map: face(o.a ?? 1), fresh: true })); A.position.z = 0.03; plate.add(A);
  const B = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), toon('#ffffff', { map: face(o.b ?? -1), fresh: true })); B.position.z = -0.03; B.rotation.y = Math.PI; plate.add(B);
  const rim = cyl(0.44, 0.44, 0.05, '#c8ccd0', 0, 0, 0, 32); rim.rotation.x = Math.PI / 2; plate.add(rim); A.userData.noOutline = B.userData.noOutline = true;
  outline(g, { px: 2.4 }); g.plate = plate; return g;
}
// the yellow "H" sign of the changeover campaign (stylised)
export function hSign() {
  const g = new THREE.Group(); g.add(cyl(0.05, 0.05, 2.4, '#9aa0a6', 0, 1.2, 0, 8));
  const tx = canvasTex(220, 220, (x, W, H) => { x.fillStyle = '#f2c230'; x.fillRect(0, 0, W, H); x.lineWidth = 12; x.strokeStyle = '#20161a'; x.strokeRect(8, 8, W - 16, H - 16); x.fillStyle = '#1f5fa8'; x.font = '900 150px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('H', W / 2, H / 2 + 8); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), toon('#ffffff', { map: tx, fresh: true })); m.position.set(0, 2.75, 0.04); m.userData.noOutline = true; g.add(m, rbox(1.0, 1.0, 0.06, '#20161a', 0, 2.75, 0, 0.02)); outline(g, { px: 2.4 }); return g;
}
const tree = (s = 1, c = '#4f8a3a') => { const g = new THREE.Group(); g.add(cyl(0.14 * s, 0.18 * s, 2.0 * s, '#6a4a32', 0, 1.0 * s, 0, 8)); const a = ball(1.1 * s, c, 0, 2.6 * s, 0, 16); a.scale.y = 1.15; g.add(a, ball(0.8 * s, '#5f9a44', 0.5 * s, 2.2 * s, 0.3 * s, 14)); g.add(blob(1.3 * s, 0.25)); outline(g, { px: 2.4 }); return g; };

// the street: road along Z (cars drive along Z), lane centres x = -LANE / +LANE, sidewalks, pastel houses, trees, clock, flags
export const LANE = 1.6;
export function street(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const bare = !!o.bare;
  const grass = floor(200, 200, '#86ad55', 0, -60); g.add(grass); grass.receiveShadow = true;
  const road = floor(6.6, 160, '#5a5d63', 0, -50); road.position.y = 0.01; road.receiveShadow = true; g.add(road);
  for (let z = 14; z > -120; z -= 3.6) g.add(box(0.16, 0.012, 1.7, '#f2efe6', 0, 0.02, z));
  for (const sx of [-1, 1]) { g.add(box(0.12, 0.012, 160, '#f2efe6', sx * 3.05, 0.02, -50)); const sw = box(2.6, 0.16, 160, '#cfc6b4', sx * 4.6, 0.08, -50); sw.receiveShadow = true; g.add(sw); }
  const cols = ['#e7c66a', '#c9574a', '#efe6d2', '#9cc3a0', '#e8a76a', '#a8c4de'];
  if (!bare) for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) { const w = 5.5, h = 4.6 + ((i * 7 + (sx > 0 ? 3 : 0)) % 4) * 0.7; const f = PR.facade({ w, h, d: 4, color: cols[(i * 2 + (sx > 0 ? 1 : 0)) % cols.length], trim: i % 2 ? '#7a3a2a' : '#4a5a6a', windows: 2, door: true, seed: i }); f.position.set(sx * 8.6, 0, 4 - i * 6.2); f.rotation.y = -sx * Math.PI / 2; g.add(f); }
  if (!bare) for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { const tr = tree(0.9 + ((i + (sx > 0 ? 1 : 0)) % 3) * 0.12); tr.position.set(sx * 5.4, 0, 1 - i * 7.6 - (sx > 0 ? 3.5 : 0)); g.add(tr); }
  const clock = streetClock(); clock.position.set(4.3, 0, o.clockZ ?? -3); const flags = [flag({ h: 5.6 }), flag({ h: 5.6 })]; flags[0].position.set(-5.0, 0, -9); flags[1].position.set(5.0, 0, -17);
  const hs = hSign(); hs.position.set(-4.2, 0, 2.5); hs.rotation.y = 0.35; if (!bare) g.add(clock, ...flags, hs);
  return { group: g, clock, flags, hsign: hs, update(t) { flags.forEach(f => f.update(t)); } };
}

// lane x for a car heading `dir` (-1 = away from camera, +1 = toward it) at changeover progress u (0 = left-hand traffic, 1 = right-hand)
export const laneX = (dir, u) => (dir < 0 ? -LANE : LANE) * (1 - 2 * u);
// cars: [{ i, dir, z }] ; drive(cars, fn) where fn(c, t) -> [x, z]; heading from the motion (finite difference)
export function addCars(st, specs) { return specs.map((sp, k) => { const c = carN(sp.i ?? k); Object.assign(c, sp); st.add(c); return c; }); }
export function moveCar(c, t, fn) { const [x, z] = fn(c, t), [x2, z2] = fn(c, t + 0.04); c.position.set(x, 0, z); const dx = x2 - x, dz = z2 - z; c.rotation.y = Math.hypot(dx, dz) > 1e-4 ? Math.atan2(dx, dz) : (c.dir < 0 ? Math.PI : 0); c.drive(z * c.dir); }
// camera in front of a car, looking at its driver through the windscreen
const _h = new THREE.Vector3();
export function driverCam(st, c, fov = 26, side = 0.35, back = 3.0, up = 0.45) { c.updateMatrixWorld(true); c.driver.parts.head.getWorldPosition(_h); const fx = Math.sin(c.rotation.y), fz = Math.cos(c.rotation.y);
  st.cam([_h.x + fx * back - fz * side, _h.y + up * 0.2, _h.z + fz * back + fx * side], [_h.x, _h.y - 0.05, _h.z], fov); }
