// The Great Stink (London, summer 1858): shared assets. EMOTION: LOL. Deadpan narrator.
// Tone guard: comedic only (stink lines, clothespins on noses, green fog). No illness, no bodies, nobody hurt.
// Sewage is shown as a cartoon brown outflow + murky water, never anything graphic. All characters are original toons.
import { E, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, toonStage, blob } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { sph, mesh } from './_common.js';
export * from './_common.js';
export { PR, FX, sunnySky, bean, blob };

// ---------------------------------------------------------------- PEOPLE
export function topHat(b, color = '#1e1c22') {
  const g = new THREE.Group(); g.add(cyl(0.3, 0.32, 0.7, color, 0, 0.72, 0, 24)); g.add(cyl(0.56, 0.56, 0.04, color, 0, 0.38, 0, 28)); g.add(cyl(0.325, 0.325, 0.09, '#5a2a2a', 0, 0.44, 0, 24));
  outline(g, { px: 3 }); g.rotation.x = -0.08; b.parts.head.add(g); b.hat = g; return g;
}
// a wooden clothespin clamped on the nose (comedy): two little slats + a spring
export function clothespin(b) {
  const g = new THREE.Group(); g.add(rbox(0.07, 0.04, 0.26, '#d8b47a', 0, 0.035, 0.1, 0.015)); g.add(rbox(0.07, 0.04, 0.26, '#d8b47a', 0, -0.035, 0.1, 0.015)); g.add(cyl(0.035, 0.035, 0.08, '#9aa0a8', 0, 0, 0.06, 10).rotateZ(Math.PI / 2));
  outline(g, { px: 2.2 }); g.position.set(0, -0.05, 0.47); b.parts.head.add(g); b.pin = g; return g;
}
// Victorian MP (original toon): frock coat, sideburns/moustache, optional top hat + clothespin
export function mp(o = {}) {
  const b = bean({ name: 'MP', outfit: 'uniform', colors: { main: o.main || '#24232a', trim: '#e8e2d2', belt: '#18171c' }, skin: o.skin || 'light', hair: o.hair || 'swoop', hairColor: o.hairColor || '#5a3a22',
    moustache: o.moustache ?? (o.hairColor || '#5a3a22'), beard: !!o.beard, beardColor: o.hairColor || '#5a3a22', seed: o.seed || 3, scale: o.scale || 1 });
  if (o.hat) topHat(b); if (o.pin) clothespin(b); return b;
}
export function engineer(o = {}) { const b = mp({ main: '#3a3a4a', hairColor: '#2a1a12', beard: false, seed: o.seed || 77, hat: true }); return b; }
export function worker(o = {}) {
  const b = bean({ name: 'Worker', outfit: 'uniform', colors: { main: '#f08a24', trim: '#f6e04a', belt: '#4a3a2a' }, skin: o.skin || 'brown', hair: 'bowl', hairColor: '#1a1210', seed: o.seed || 88 });
  const h = new THREE.Group(); const R = 0.48; const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 28, 12, 0, Math.PI * 2, 0, 1.35), toon('#f2f2f0')); dome.position.y = 0.06; h.add(dome);
  h.add(cyl(R * 1.38, R * 1.42, 0.05, '#f2f2f0', 0, 0.06 + R * 1.12 * Math.cos(1.35), 0.04, 32)); const lamp = ball(0.09, '#fff6b0', 0, 0.42, 0.5, 12); h.add(lamp); outline(h, { px: 3 }); h.rotation.x = -0.12; b.parts.head.add(h);
  return b;
}

// ---------------------------------------------------------------- PARLIAMENT
// chamber: green benches in tiers on both sides, dark wood panelling, tall gothic windows letting in green stink fog.
export function chamber(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const carpet = floor(40, 40, '#3a5a3a'); g.add(carpet);
  const wood = canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#5a3a22'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3e2614'; x.lineWidth = 6; for (let i = 0; i < 4; i++) { x.strokeRect(10 + i * 62, 20, 50, 220); x.strokeRect(10 + i * 62, 270, 50, 220); } });
  wood.wrapS = THREE.RepeatWrapping; wood.repeat.set(8, 1);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), toon('#ffffff', { map: wood })); back.position.set(0, 4, -6); back.receiveShadow = true; back.userData.noOutline = true; g.add(back);
  for (let i = -3; i <= 3; i++) { const wn = canvasTex(128, 256, (x, w, h) => { x.fillStyle = '#d8e8c8'; x.beginPath(); x.moveTo(0, h); x.lineTo(0, 60); x.quadraticCurveTo(w / 2, -20, w, 60); x.lineTo(w, h); x.fill(); x.strokeStyle = '#3e2614'; x.lineWidth = 8; x.beginPath(); x.moveTo(w / 2, 20); x.lineTo(w / 2, h); x.moveTo(0, 150); x.lineTo(w, 150); x.stroke(); });
    const pw = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8), flat('#ffffff', { map: wn, transparent: true })); pw.position.set(i * 3.2, 9.2, -5.98); pw.userData.noOutline = true; g.add(pw); }
  const upper = plane(40, 6, '#e8dcc0', 0, 11, -6.02); g.add(upper);
  const benches = []; for (const sd of [-1, 1]) for (let r = 0; r < 3; r++) { const z = -4.2 + r * 0; const x = sd * (2.6 + r * 1.3); const y = r * 0.45;
    const seat = rbox(1.0, 0.35, 12, '#3f7a4a', x, 0.55 + y, -0.5, 0.08); const backr = rbox(0.18, 0.7, 12, '#3f7a4a', x + sd * 0.5, 1.0 + y, -0.5, 0.06); const step = box(1.3, 0.55 + y, 12, '#4a2e1a', x + sd * 0.1, (0.55 + y) / 2 - 0.05, -0.5); step.userData.noOutline = true; g.add(seat, backr, step); benches.push(seat); }
  benches.forEach(b => outline(b, { px: 2.4 }));
  const table = rbox(1.6, 1.0, 3.2, '#5a3a22', 0, 0.5, -1.0, 0.06); outline(table, { px: 2.4 }); g.add(table);
  const fog = FX.smoke({ count: 26, size: 0.45, rise: 0.3, spread: 11, color: '#a8d468', life: 5, seed: 6, drift: [0.6, 0] }); fog.position.set(0, 3.4, -3.5); g.add(fog);
  return { group: g, fog, update(t) { fog.update(t + 3); } };
}
// gothic river front of a Victorian parliament (stylised, not a replica): long facade, vertical tracery, towers, a clock tower.
const facadeT = {};
function gothicTex(c) { return facadeT[c] ||= canvasTex(512, 256, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(80,60,30,.35)'; for (let i = 0; i < 32; i++) x.fillRect(i * 16 + 3, 18, 6, h - 30); x.fillStyle = '#4a5a6a'; for (let i = 0; i < 16; i++) { x.fillRect(i * 32 + 10, 40, 12, 46); x.fillRect(i * 32 + 10, 120, 12, 46); x.fillRect(i * 32 + 10, 196, 12, 40); } }); }
export function parliamentFront(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#d8c08a';
  const body = new THREE.Mesh(new THREE.BoxGeometry(30, 5, 4), toon('#ffffff', { map: gothicTex(c) })); body.position.y = 2.5; body.castShadow = body.receiveShadow = true; body.userData.noOutline = true; g.add(body);
  for (let i = -6; i <= 6; i++) { const p = cyl(0.12, 0.2, 1.4, c, i * 2.4, 5.6, 2.0, 6); g.add(p); }
  const tower = (x, h, w) => { const t = new THREE.Group(); const b = box(w, h, w, c, 0, h / 2, 0); b.userData.noOutline = true; t.add(b); const cone = new THREE.Mesh(new THREE.ConeGeometry(w * 0.75, w * 1.6, 4), toon('#5a6a7a')); cone.position.y = h + w * 0.8; cone.rotation.y = Math.PI / 4; t.add(cone); t.position.x = x; g.add(t); return t; };
  tower(-14, 8, 2.4); tower(-6, 7, 1.6); tower(4, 7, 1.6);
  const ct = tower(13, 13, 2.2); const face = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#f4ecd0'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#2a2420'; x.lineWidth = 6; x.stroke(); x.lineWidth = 7; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 22); x.moveTo(64, 64); x.lineTo(94, 64); x.stroke(); });
  const cf = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), flat('#ffffff', { map: face })); cf.position.set(0, 10.6, 1.12); cf.userData.noOutline = true; ct.add(cf);
  return g;
}
// the Thames: murky water + an embankment wall + a sewer outflow pipe; o.murk 0..1
export function river(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const wt = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#6a7a3a'; x.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 200; i++) { x.fillStyle = r() > 0.5 ? 'rgba(90,70,30,.5)' : 'rgba(130,150,70,.4)'; x.beginPath(); x.ellipse(r() * w, r() * h, 6 + r() * 14, 2 + r() * 4, 0, 0, 7); x.fill(); } });
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(8, 8);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(200, 120), toon('#ffffff', { map: wt, emissive: new THREE.Color('#3a4a1a'), emissiveIntensity: 0.15 })); water.rotation.x = -Math.PI / 2; water.position.set(0, -0.6, -40); water.receiveShadow = true; water.userData.noOutline = true; g.add(water);
  const bank = box(200, 1.6, 6, '#8a7a62', 0, -0.2, 8); bank.userData.noOutline = true; bank.receiveShadow = true; g.add(bank);
  const sky = sunnySky(st, { clouds: 5, seed: o.seed || 4, top: '#4a8ac8', horizon: '#e8d8a0' });
  return { group: g, water, sky, wt, update(t) { sky.update(t); wt.offset.set(t * 0.01, t * 0.004); } };
}
export function pipe(o = {}) { const g = new THREE.Group(); const p = cyl(0.7, 0.7, 3, '#6a6460', 0, 0, 0, 24); p.rotation.x = Math.PI / 2; g.add(p); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.12, 10, 28), toon('#5a5450')); rim.position.z = 1.5; g.add(rim); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), flat('#1a1612')); hole.position.z = 1.51; hole.userData.noOutline = true; g.add(hole); outline(g, { px: 2.6 }); return g; }
// brown cartoon sludge stream: a column of blobs falling out of a pipe mouth, t-animated
export function sludge(o = {}) {
  const g = new THREE.Group(); const m = toon('#7a6a34'); const bl = []; const r = rng(5);
  for (let i = 0; i < 26; i++) { const b = mesh(sph, m, 0.3, 0.26, 0.3); g.add(b); bl.push({ b, ph: i / 26, x: (r() - 0.5) * 0.4 }); }
  outline(g, { px: 2.2 });
  g.update = (t) => bl.forEach(({ b, ph, x }) => { const k = (t * 0.9 + ph) % 1; b.position.set(x, -k * k * 4.5, 0.3 + k * 1.6); b.scale.setScalar(0.25 + k * 0.2); });
  return g;
}
// brick tunnel (Bazalgette-style egg sewer, stylised): inside of a half-cylinder with brick texture + a water channel
export function tunnel(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const R = o.R || 3.2, L = o.L || 60;
  const br = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#9a5a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8b8a0'; for (let y = 0; y < h; y += 32) { x.fillRect(0, y, w, 4); for (let k = 0; k < 4; k++) x.fillRect(((y / 32) % 2 ? 32 : 0) + k * 64, y, 4, 32); } const r = rng(2); for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(60,30,20,.25)'; x.fillRect(r() * w, r() * h, 60, 28); } });
  br.wrapS = br.wrapT = THREE.RepeatWrapping; br.repeat.set(10, 18);
  const tg = new THREE.CylinderGeometry(R, R, L, 40, 1, true, 0, Math.PI * 2); const tm = new THREE.Mesh(tg, toon('#ffffff', { map: br, side: THREE.BackSide })); tm.rotation.x = Math.PI / 2; tm.position.set(0, R - 0.9, -L / 2 + 6); tm.receiveShadow = true; tm.userData.noOutline = true; g.add(tm);
  const walk = box(R * 1.6, 0.2, L, '#7a6a5a', 0, -0.1, -L / 2 + 6); walk.userData.noOutline = true; walk.receiveShadow = true; g.add(walk);
  const ch = new THREE.Mesh(new THREE.PlaneGeometry(1.2, L), toon('#4a5a3a', { emissive: new THREE.Color('#2a3a1a'), emissiveIntensity: 0.2 })); ch.rotation.x = -Math.PI / 2; ch.position.set(0, 0.01, -L / 2 + 6); ch.userData.noOutline = true; g.add(ch);
  const lamps = []; for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(new THREE.Color('#ffd090'), 1.4, 14); l.position.set(0, R + 0.6, 2 - i * 12); st.add(l); lamps.push(l); }
  return { group: g };
}
// a hanging curtain that can be lowered into a bucket: .k(0..1) dunk progress
export function curtainDunk(o = {}) {
  const g = new THREE.Group(); const c = PR.curtain({ w: 1.4, h: 2.6, color: o.color || '#3f7a4a' }); g.add(c); g.curtain = c;
  const bucket = new THREE.Group(); bucket.add(lathe([[0.001, 0], [0.5, 0.01], [0.62, 0.9], [0.66, 0.92], [0.001, 0.92]], '#8a8a92', 24)); const liq = cyl(0.6, 0.6, 0.02, '#e8f2d8', 0, 0.86, 0, 24); bucket.add(liq);
  const lt = canvasTex(256, 96, (x, w, h) => { x.fillStyle = '#f4ecd0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a1c15'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.fillStyle = '#2a1c15'; x.font = '900 30px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CHLORIDE', w / 2, 30); x.fillText('OF LIME', w / 2, 66); });
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), toon('#ffffff', { map: lt })); lab.position.set(0, 0.45, 0.58); lab.rotation.x = -0.12; lab.userData.noOutline = true; bucket.add(lab);
  outline(bucket, { px: 2.6 }); g.add(bucket); g.bucket = bucket; return g;
}
