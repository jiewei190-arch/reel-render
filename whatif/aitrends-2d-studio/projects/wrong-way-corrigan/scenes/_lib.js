// Wrong Way Corrigan: shared assets (underscore = not auto-loaded). The plane is a generic 1930s high-wing monoplane (no
// markings, no logos); the pilot, officials, the Irish officer and the crowd are generic toons (no likeness of real people).
// Nobody is hurt; the plane never crashes. Plus 2D overlays: hook text, stamps, chips, map card, compass card, speech bubble.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';
import { sunnySky } from '/kits/toon3d/sky.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- eyes with a real lid
function lidEye(parent, pos, n, size, lidC, ring) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.08, size * 0.62); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg);
  if (ring) { const ir = new THREE.Mesh(sph, flat(ring)); ir.scale.set(0.62, 0.66, 0.1); ir.position.z = 0.93; ir.userData.noOutline = true; pg.add(ir); }
  const p = new THREE.Mesh(sph, flat('#120c10')); p.scale.set(0.4, 0.44, 0.1); p.position.z = 0.97; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.13, 0.13, 0.05); gl.position.set(0.14, 0.18, 1.0); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}

// ---------------------------------------------------------------- PEOPLE (generic toons)
export const officialA = () => bean({ name: 'OfficialA', outfit: 'uniform', head: 'cap', headColor: '#5a5e48', skin: 'fair', hair: 'bowl', moustache: true, colors: { main: '#6a7058', legs: '#4a4e3c' }, seed: 41 });
export const officialB = () => bean({ name: 'OfficialB', outfit: 'uniform', skin: 'tan', hair: 'horseshoe', hairColor: '#7a7570', glasses: true, colors: { main: '#6a6e74', legs: '#4a4e54' }, seed: 43 });

// ---------------------------------------------------------------- SETS
// grey-green office: desk, lamp, filing cabinet, papers. No flags/emblems.
export function office(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#5a4a3e', 0, 0));
  const wall = plane(30, 9, '#7a8070', 0, 4.5, -3); wall.receiveShadow = true; g.add(wall);
  g.add(plane(30, 1.4, '#5e6456', 0, 0.7, -2.98));
  const desk = PR.table({ w: 3.0, d: 1.2, h: 1.0, color: '#5a3a24' }); desk.position.set(0, 0, 0.4); g.add(desk);
  const cab = rbox(1.0, 2.2, 0.8, '#7a7e78', 2.8, 1.1, -2.4, 0.04); g.add(cab); for (let i = 0; i < 3; i++) g.add(rbox(0.3, 0.06, 0.06, '#c9ccd2', 2.8, 0.5 + i * 0.7, -1.98, 0.02));
  const lamp = new THREE.Group(); lamp.add(cyl(0.12, 0.14, 0.04, '#2a3a2a', 0, 0.02, 0, 12), cyl(0.015, 0.015, 0.5, '#2a3a2a', 0, 0.27, 0, 6), cyl(0.06, 0.2, 0.18, '#2a5a3a', 0.1, 0.52, 0, 14)); lamp.position.set(-1.1, 1.06, 0.2); g.add(lamp);
  const phone = rbox(0.35, 0.12, 0.25, '#2a2422', 1.1, 1.12, 0.2, 0.03); g.add(phone);
  outline(g, { px: 2.2 });
  // the proposal folder on the desk (a pigeon sketch on it)
  const ft = canvasTex(256, 192, (x, W, H) => { x.fillStyle = '#e8d8a8'; x.fillRect(0, 0, W, H); x.strokeStyle = '#5a4a30'; x.lineWidth = 5; x.beginPath(); x.ellipse(110, 110, 50, 32, 0, 0, 7); x.stroke(); x.beginPath(); x.arc(160, 70, 20, 0, 7); x.stroke(); x.beginPath(); x.moveTo(178, 68); x.lineTo(198, 74); x.lineTo(178, 80); x.stroke();
    x.fillStyle = '#5a4a30'; x.font = '900 22px Nunito, sans-serif'; x.fillText('PROPOSAL', 70, 180); });
  const folder = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.68), toon('#ffffff', { map: ft })); folder.rotation.x = -Math.PI / 2; folder.position.set(0, 1.065, 0.55); folder.userData.noOutline = true; g.add(folder);
  return { group: g, tableY: 1.06, folder, update() {} };
}
// ---------------------------------------------------------------- THE PLANE (generic 1930s high-wing monoplane, no markings)
// airplane({ color }) ~4.6 long along +Z (nose at +Z), wing span ~6.4, wheels on the ground at y 0.
// .update(t, { prop 0..1 (spin), wave 0..1 (pilot's arm out of the left window, waving), look:[x,y], mouth, tank (show the cut-away
// fuel tank glowing in the nose), lean }). .pilot = the little pilot head in the left window.
export function airplane(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#d8d2c0', tr = o.trim || '#c0392b';
  const fus = new THREE.Group(); fus.position.y = 1.05; g.add(fus);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.22, 3.6, 18), toon(c)); body.rotation.x = Math.PI / 2; body.castShadow = true; fus.add(body);
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.44, 0.7, 18), toon('#9aa0a8')); cowl.rotation.x = Math.PI / 2; cowl.position.z = 2.0; cowl.castShadow = true; fus.add(cowl);
  const spin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 12), toon(tr)); spin.rotation.x = Math.PI / 2; spin.position.z = 2.5; fus.add(spin);
  const prop = new THREE.Group(); prop.position.z = 2.42; fus.add(prop); for (const s of [-1, 1]) { const b = rbox(0.1, 0.95, 0.04, '#5a3a22', 0, s * 0.48, 0, 0.02); prop.add(b); }
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); disc.position.z = 2.43; disc.userData.noOutline = true; fus.add(disc);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.425, 0.39, 0.25, 18), toon(tr)); stripe.rotation.x = Math.PI / 2; stripe.position.z = 1.2; fus.add(stripe);
  const cab = rbox(0.86, 0.62, 1.1, c, 0, 0.42, 0.7, 0.12); cab.material = cab.material.clone(); fus.add(cab);
  const winM = toon('#bfe6ff', { emissive: new THREE.Color('#bfe6ff'), emissiveIntensity: 0.25 });
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.36), winM); w.position.set(s * 0.435, 0.5, 0.7); w.rotation.y = s * Math.PI / 2; w.userData.noOutline = true; fus.add(w); }
  const wind = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), toon('#5a6068')); wind.position.set(0, 0.55, 1.26); wind.userData.noOutline = true; fus.add(wind);   // front window: blocked by the tank (grey)
  const wing = rbox(6.4, 0.1, 1.0, c, 0, 0.82, 0.65, 0.05); fus.add(wing);
  for (const s of [-1, 1]) { const st = cyl(0.03, 0.03, 1.3, '#6a6a72', s * 1.3, 0.15, 0.1, 6); st.rotation.z = s * 0.95; fus.add(st); const tip = rbox(0.5, 0.11, 1.02, tr, s * 2.95, 0.82, 0.65, 0.05); fus.add(tip); }
  const tailV = rbox(0.06, 0.7, 0.6, c, 0, 0.35, -1.75, 0.03); fus.add(tailV); const tailT = rbox(0.06, 0.25, 0.4, tr, 0, 0.62, -1.82, 0.03); fus.add(tailT);
  const tailH = rbox(1.6, 0.06, 0.5, c, 0, 0.05, -1.75, 0.03); fus.add(tailH);
  const gear = new THREE.Group(); g.add(gear); const wheels = [];
  for (const s of [-1, 1]) { const leg = cyl(0.03, 0.03, 0.8, '#5a5a62', s * 0.45, 0.62, 1.1, 6); leg.rotation.z = s * 0.35; gear.add(leg); const w = cyl(0.26, 0.26, 0.12, '#2a2a30', s * 0.62, 0.26, 1.1, 18); w.rotation.z = Math.PI / 2; gear.add(w); wheels.push(w); }
  gear.add(ball(0.08, '#2a2a30', 0, 0.55, -1.9, 10));
  // the cut-away fuel tank in the nose (shown only when u.tank > 0): a big orange drum right where the windshield should be
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 18), toon('#ff8a2a', { emissive: new THREE.Color('#ff7a1a'), emissiveIntensity: 0.45 })); tank.position.set(0, 0.45, 1.0); tank.renderOrder = 2; tank.rotation.x = Math.PI / 2; tank.visible = false; fus.add(tank);
  // pilot head in the left window
  const pilot = new THREE.Group(); pilot.position.set(-0.5, 0.55, 0.62); fus.add(pilot);   // leaning out of the left window
  const ph = ball(0.22, '#f0c8a0', 0, 0, 0, 20); pilot.add(ph);
  const capM = toon('#6a3e22'); const capS = new THREE.Mesh(new THREE.SphereGeometry(0.235, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.4), capM); capS.position.y = 0.03; pilot.add(capS);
  for (const s of [-1, 1]) { const gg = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 6, 14), toon('#3a3a40')); gg.position.set(s * 0.07, 0.19, 0.14); gg.rotation.x = -0.9; pilot.add(gg); }
  const eyes = [-1, 1].map(s => lidEye(pilot, new THREE.Vector3(s * 0.08, 0.03, 0.18), new THREE.Vector3(s * 0.35, 0.05, 0.94).normalize(), 0.055, '#f0c8a0'));
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16, Math.PI), flat('#5a2020')); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.08, 0.205); mouth.userData.noOutline = true; pilot.add(mouth);
  const arm = new THREE.Group(); arm.position.set(-0.47, 0.45, 0.98); fus.add(arm); const up = cyl(0.07, 0.07, 0.55, '#6a3e22', 0, 0.27, 0, 10); arm.add(up); const hand = ball(0.09, '#f0c8a0', 0, 0.58, 0, 12); arm.add(hand); arm.visible = false;
  outline(g, { px: 2.6 }); pilot.rotation.y = -1.2;
  g.update = (t, u = {}) => { const p = u.prop ?? 1; prop.rotation.z = t * 40 * p; disc.material.opacity = 0.18 * p; prop.visible = p < 0.95 || Math.floor(t * 24) % 2 === 0;
    wheels.forEach(w => { w.rotation.x = (u.roll || 0); });
    tank.visible = !!u.tank; cab.material.transparent = !!u.tank; cab.material.opacity = u.tank ? 0.3 : 1; cab.material.depthWrite = !u.tank; arm.visible = (u.wave || 0) > 0.01; arm.rotation.z = 0.35 + Math.sin(t * 11) * 0.4 * (u.wave || 0); arm.rotation.x = 0.55;
    pilot.rotation.y = u.headTurn ?? -1.45; const bl = ((t + 0.4) % 3) < 0.12 ? 1 : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(u.lid ?? 0.2, bl)); e.pg.rotation.set(-(u.look?.[1] || 0) * 0.45, (u.look?.[0] || 0) * 0.55, 0); });
    mouth.scale.set(1, u.mouth === 'o' ? -1 : 1, 1); fus.rotation.z = u.bank || 0; };
  g.pilot = pilot; g.fus = fus; g.head = pilot; g.headR = 0.24; g.update(0); return g;
}
// the pilot (generic toon in a leather flying jacket + cap)
export const pilotBean = () => bean({ name: 'Pilot', outfit: 'uniform', head: 'cap', headColor: '#6a3e22', skin: 'fair', hair: 'swoop', hairColor: '#6a4a2a', colors: { main: '#7a5232', legs: '#4a3a2a' }, seed: 71 });
export const irishOfficer = () => bean({ name: 'Officer', outfit: 'uniform', head: 'cap', headColor: '#3a4a3a', skin: 'light', hair: 'bowl', hairColor: '#a85a2a', moustache: '#a85a2a', colors: { main: '#4a5a4a', legs: '#3a443a' }, seed: 81 });
export const crowdBean = (i) => bean({ name: 'Crowd' + i, outfit: ['tee', 'uniform', 'tunic', 'labcoat'][i % 4], head: ['none', 'cap', 'beanie', 'none'][i % 4], skin: ['fair', 'tan', 'brown', 'olive', 'light', 'dark'][i % 6], hair: ['bowl', 'curly', 'swoop', 'bun', 'spiky'][i % 5], colors: { main: ['#c84a3a', '#3a7ac8', '#e0b03a', '#5aa85a', '#9a5ac8'][i % 5], legs: '#3a3a4a' }, seed: 90 + i });

// sheep({ seed }) ~1.1 long, faces +Z. .update(t, { headTurn, chew, lid, look })
export function sheep(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 1); const wool = toon('#f4f0e6');
  for (let i = 0; i < 9; i++) { const b = mesh(sph, wool, 0.28 + r() * 0.06, 0.26 + r() * 0.05, 0.3); b.position.set((r() - 0.5) * 0.35, 0.62 + (r() - 0.5) * 0.12, (i / 8 - 0.5) * 0.7); g.add(b); }
  for (const [x, z] of [[-0.18, 0.3], [0.18, 0.3], [-0.18, -0.3], [0.18, -0.3]]) g.add(cyl(0.05, 0.05, 0.45, '#2a2428', x, 0.22, z, 8));
  const head = new THREE.Group(); head.position.set(0, 0.78, 0.5); g.add(head);
  const hm = mesh(sph, toon('#2a2428'), 0.16, 0.18, 0.22); hm.position.z = 0.08; head.add(hm); const top = mesh(sph, wool, 0.15, 0.08, 0.12); top.position.set(0, 0.15, 0.02); head.add(top);
  for (const s of [-1, 1]) { const e = mesh(sph, toon('#2a2428'), 0.1, 0.04, 0.06); e.position.set(s * 0.17, 0.05, 0); e.rotation.z = s * 0.4; head.add(e); }
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.08, 0.06, 0.24), new THREE.Vector3(s * 0.4, 0.1, 0.9).normalize(), 0.055, '#2a2428'));
  const jaw = mesh(sph, toon('#3a3238'), 0.08, 0.04, 0.08); jaw.position.set(0, -0.12, 0.2); head.add(jaw);
  outline(g, { px: 2.4 }); g.add(blob(0.55, 0.22));
  g.update = (t, u = {}) => { head.rotation.set(u.nod || 0, u.headTurn || 0, u.tilt || 0); jaw.position.y = -0.12 - Math.abs(Math.sin(t * 7 + (o.seed || 1))) * 0.02 * (u.chew ?? 1);
    const bl = ((t + (o.seed || 1) * 0.7) % 3.3) < 0.12 ? 1 : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(u.lid ?? 0.3, bl)); e.pg.rotation.set(-(u.look?.[1] || 0) * 0.45, (u.look?.[0] || 0) * 0.55, 0); }); };
  g.head = head; g.eyes = eyes; g.headR = 0.2; g.update(0); return g;
}

// Irish field: green fields in patches, dry-stone walls, rolling hills, sunny sky (+ a few sheep)
export function irishField(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 7);
  const gT = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#6ab84a'; x.fillRect(0, 0, W, H); for (let i = 0; i < 600; i++) { x.fillStyle = r() > 0.5 ? 'rgba(40,110,30,.25)' : 'rgba(200,240,140,.2)'; x.fillRect(r() * W, r() * H, 3, 6); } });
  gT.wrapS = gT.wrapT = THREE.RepeatWrapping; gT.repeat.set(30, 30);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), toon('#ffffff', { map: gT })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; gr.userData.noOutline = true; g.add(gr);
  for (let i = 0; i < 9; i++) { const h = mesh(sph, toon(['#4f9a3a', '#5aa846', '#3f8a32'][i % 3]), 20 + r() * 14, 5 + r() * 5, 12); h.position.set(-90 + i * 24, -1.5, -60 - r() * 30); h.receiveShadow = true; g.add(h); }
  const wallM = toon('#a8a49a'); const walls = o.walls ?? [[-6, -8, 14, 0], [7, -12, 16, 0.4], [-14, 2, 10, 1.4], [12, 6, 12, 1.57]];
  for (const [x, z, len, ry] of walls) { const w = new THREE.Group(); for (let k = 0; k < len / 0.5; k++) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), wallM); b.position.set(-len / 2 + k * 0.5, 0.25 + (k % 2) * 0.12, (r() - 0.5) * 0.1); b.castShadow = true; w.add(b); } w.position.set(x, 0, z); w.rotation.y = ry; outline(w, { px: 2 }); g.add(w); }
  const sky = sunnySky(st, { clouds: 9, seed: o.seed || 7 });
  const flock = (o.sheep || []).map(([x, z, ry], i) => { const s = sheep({ seed: i + 2 }); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s); return s; });
  return { group: g, sky, flock, update(t) { sky.update(t); } };
}
// New York airfield at dawn: runway, a hangar, flat grass
export function airfield(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(300, 300, '#7aa85a', 0, 0));
  const rw = floor(8, 260, '#7a7a80', 0, -60); rw.position.y = 0.01; g.add(rw);
  for (let i = 0; i < 20; i++) { const d = floor(0.3, 4, '#f0f0e8', 0, 40 - i * 12); d.position.y = 0.02; g.add(d); }
  const hg = new THREE.Group(); hg.add(box(10, 4, 8, '#9a9a8a', 0, 2, 0)); const roof = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 8, 20, 1, false, 0, Math.PI), toon('#7a7e70')); roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.position.y = 4; hg.add(roof);
  hg.add(box(7, 3.4, 0.1, '#3a3a38', 0, 1.7, 4.02)); hg.position.set(o.hangarX ?? -9, 0, o.hangarZ ?? -6); outline(hg, { px: 2.4 }); g.add(hg);
  const sock = new THREE.Group(); sock.add(cyl(0.05, 0.05, 4, '#c9ccd2', 0, 2, 0, 6)); const sk = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.4, 12, 1, true), toon('#ff7a2a', { side: THREE.DoubleSide })); sk.rotation.z = Math.PI / 2; sk.position.set(0.7, 3.8, 0); sock.add(sk); sock.position.set(6, 0, -4); outline(sock, { px: 2 }); g.add(sock);
  return { group: g, update() {} };
}
// generic ocean liner (no real line colours or names): black hull, white decks, two yellow funnels, portholes
export function liner(o = {}) {
  const g = new THREE.Group();
  const hull = rbox(2.2, 1.6, 12, '#2a2a30', 0, 0.4, 0, 0.3); g.add(hull); g.add(rbox(2.25, 0.25, 12.05, '#c0392b', 0, -0.25, 0, 0.1));
  g.add(rbox(1.9, 0.9, 8, '#f4f1ea', 0, 1.65, -0.5, 0.1), rbox(1.6, 0.7, 5, '#f4f1ea', 0, 2.45, -0.8, 0.1));
  for (const z of [0.6, -2.4]) { g.add(cyl(0.42, 0.48, 1.8, '#e8b030', 0, 3.6, z, 16)); g.add(cyl(0.43, 0.43, 0.35, '#2a2a30', 0, 4.4, z, 16)); }
  for (let i = 0; i < 12; i++) for (const s of [-1, 1]) { const p = ball(0.09, '#bfe6ff', s * 1.11, 0.75, -5 + i * 0.9, 8); p.scale.x = 0.3; g.add(p); }
  outline(g, { px: 2.4 }); return g;
}
export function ocean(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const wT = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#2a7ab8'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(220,245,255,.35)'; x.lineWidth = 3; const r = rng(5); for (let i = 0; i < 40; i++) { const xx = r() * W, yy = r() * H; x.beginPath(); x.moveTo(xx, yy); x.quadraticCurveTo(xx + 10, yy - 5, xx + 20, yy); x.stroke(); } });
  wT.wrapS = wT.wrapT = THREE.RepeatWrapping; wT.repeat.set(40, 40);
  const w = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon('#ffffff', { map: wT })); w.rotation.x = -Math.PI / 2; w.userData.noOutline = true; g.add(w);
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 9 });
  return { group: g, sky, update(t) { sky.update(t); wT.offset.set(t * 0.01, t * 0.02); } };
}
// parade street: two rows of tall facades receding, crowds on both pavements, an open car in the middle
export function street(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(60, 200, '#6a6a70', 0, -40));
  for (const s of [-1, 1]) { g.add(floor(3, 200, '#a8a49a', s * 5.5, -40)); }
  const r = rng(3); const cols = ['#c8a888', '#a87a5a', '#d8c8a8', '#9a8a7a', '#b89878'];
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) { const h = 10 + r() * 14; const f = new THREE.Group(); const b = box(6, h, 6, cols[(i + (s > 0 ? 2 : 0)) % 5], 0, h / 2, 0); f.add(b);
    for (let y = 2; y < h - 1; y += 2.2) for (let x = -2; x <= 2; x += 2) { const w = plane(1, 1.3, '#4a5a7a', x, y, 3.02); f.add(w); }
    f.position.set(s * 10, 0, 6 - i * 7); outline(b, { px: 2 }); g.add(f); }
  const crowd = []; for (const s of [-1, 1]) for (let i = 0; i < (o.crowd ?? 6); i++) { const b = crowdBean(i + (s > 0 ? 7 : 0)); b.position.set(s * (5.2 + (i % 2) * 0.7), 0, 2 - i * 1.6); b.rotation.y = -s * 1.2; b.scale.setScalar(0.9); g.add(b); crowd.push(b); }
  const car = new THREE.Group(); car.add(rbox(1.8, 0.6, 3.6, '#2a2a3a', 0, 0.6, 0, 0.15), rbox(1.7, 0.35, 1.2, '#2a2a3a', 0, 1.05, -1.0, 0.1));
  for (const [x, z] of [[-0.85, 1.2], [0.85, 1.2], [-0.85, -1.2], [0.85, -1.2]]) { const w = cyl(0.35, 0.35, 0.2, '#1a1a1e', x, 0.35, z, 16); w.rotation.z = Math.PI / 2; car.add(w); }
  outline(car, { px: 2.4 }); g.add(car);
  return { group: g, crowd, car, update() {} };
}

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text with per-word colours: lines = [[['PIGEON', '#ffd25a'], ['pilots', '#fff']], ...]
export function hookWords(g, t, lines, o = {}) {
  const y0 = o.y ?? 290, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); const sz = (o.sizes && o.sizes[i]) || o.size || 70;
    g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (sz * 1.3)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    g.font = `900 ${sz}px "Nunito"`; const sp = sz * 0.3; const ws = l.map(([w]) => g.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (l.length - 1);
    let x = -tot / 2; l.forEach(([w, c], j) => { insT(g, w, x + ws[j] / 2, 0, sz, { color: c, stroke: CARD_INK }); x += ws[j] + sp; });
    g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: o.textColor || col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// pop-in chip (dark pill with white/gold text)
export function chip(g, t, text, x, y, o = {}) {
  if (t < 0) return; const k = ease.outBack(clamp(t / 0.25)); const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return; const s = o.size || 58;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.04); g.scale(k, k); g.globalAlpha = fade; g.font = `900 ${s}px "Nunito"`;
  const w = g.measureText(text).width + s * 0.9; g.fillStyle = o.bg || 'rgba(32,22,26,0.88)'; g.beginPath(); g.roundRect(-w / 2, -s * 0.75, w, s * 1.4, s * 0.7); g.fill();
  insT(g, text, 0, s * 0.02, s, { color: o.color || '#ffd25a', stroke: null, maxW: E.W * 0.9 }); g.restore();
}
// calendar card: pages flip from `from` to `to` ("+N YEARS")
export function calendarCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 760; const flips = o.flips ?? 6, fl = Math.min(flips, Math.floor(clamp((t - 0.2) / (o.dur || 1.2)) * flips));
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(-0.04);
  g.fillStyle = '#fbf6ea'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -230, 460, 440, 30); g.fill(); g.stroke();
  g.fillStyle = '#e23b2e'; g.beginPath(); g.roundRect(-230, -230, 460, 110, [30, 30, 0, 0]); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = '#c9ccd2'; g.beginPath(); g.arc(s * 120, -230, 18, 0, 7); g.fill(); g.stroke(); }
  insT(g, o.title || 'YEARS LATER', 0, -172, 54, { color: '#ffffff', stroke: null });
  insT(g, `+${fl}`, 0, 40, 190, { color: '#2a1c15', stroke: null });
  const pf = ((t - 0.2) / (o.dur || 1.2)) * flips % 1; if (fl < flips && t > 0.2) { g.save(); g.globalAlpha = 1 - pf; g.translate(0, -120 + pf * 300); g.rotate(pf * 0.8); g.fillStyle = '#fbf6ea'; g.fillRect(-200, 0, 400, 300 * (1 - pf)); g.restore(); }
  g.restore();
}
// floating feather (comic beat of silence): drifts down from y0
export function feather(g, t, x0, y0, o = {}) {
  if (t < 0) return; const y = y0 + t * (o.speed || 170), x = x0 + Math.sin(t * 3.2) * 70; g.save(); g.translate(x, y); g.rotate(Math.sin(t * 3.2 + 1) * 0.6); g.scale(o.s || 1.4, o.s || 1.4);
  g.fillStyle = '#d8dce6'; g.strokeStyle = CARD_INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -46); g.quadraticCurveTo(22, -10, 4, 40); g.lineTo(-4, 40); g.quadraticCurveTo(-22, -10, 0, -46); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(0, -40); g.lineTo(0, 52); g.stroke(); g.restore();
}
// screen-space money bag with a label
export function moneyBag(g, t, x, y, label, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; g.save(); g.translate(x, y + (1 - k) * -200); g.scale(k * (o.s || 1), k * (o.s || 1));
  g.fillStyle = '#c8a060'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-40, -110); g.quadraticCurveTo(0, -80, 40, -110); g.lineTo(30, -70); g.quadraticCurveTo(140, -20, 110, 80); g.quadraticCurveTo(0, 130, -110, 80); g.quadraticCurveTo(-140, -20, -30, -70); g.closePath(); g.fill(); g.stroke();
  insT(g, '$', 0, 30, 120, { color: '#3a7a3a', stroke: null }); if (label) insT(g, label, 0, 175, 74, { color: '#ffd25a', stroke: CARD_INK }); g.restore();
}

// speech bubble (rounded, tail pointing at tx,ty)
export function bubble(g, t, text, x, y, tx, ty, o = {}) {
  const k = ease.outBack(clamp(t / 0.25)); if (k <= 0) return; const s = o.size || 70; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.globalAlpha = fade; g.translate(x, y); g.scale(k, k); g.rotate(o.rot ?? -0.04); g.font = `900 ${s}px "Nunito"`; const w = g.measureText(text).width + s * 1.1, h = s * 1.7;
  g.fillStyle = '#ffffff'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.lineJoin = 'round';
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h * 0.45); g.moveTo(-w * 0.12, h / 2 - 4); g.lineTo((tx - x) / k, (ty - y) / k); g.lineTo(w * 0.08, h / 2 - 4); g.fill(); g.stroke();
  g.fillStyle = '#ffffff'; g.fillRect(-w * 0.12 + 6, h / 2 - 12, w * 0.2 - 12, 12);
  insT(g, text, 0, s * 0.05, s, { color: o.color || '#2a1c15', stroke: null, maxW: E.W * 0.86 }); g.restore();
}
// compass card: dial with N E S W; needle angle `a` (radians, 0 = pointing to N/up); spin = extra wobble
export function compassCard(g, x, y, R, a, o = {}) {
  g.save(); g.translate(x, y); g.fillStyle = '#c8a050'; g.strokeStyle = CARD_INK; g.lineWidth = R * 0.06; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#fbf6ea'; g.beginPath(); g.arc(0, 0, R * 0.84, 0, 7); g.fill(); g.lineWidth = R * 0.03; g.stroke();
  for (let i = 0; i < 16; i++) { const aa = i / 16 * Math.PI * 2; g.beginPath(); g.moveTo(Math.sin(aa) * R * 0.78, -Math.cos(aa) * R * 0.78); g.lineTo(Math.sin(aa) * R * (i % 4 ? 0.7 : 0.62), -Math.cos(aa) * R * (i % 4 ? 0.7 : 0.62)); g.stroke(); }
  [['N', 0], ['E', 1], ['S', 2], ['W', 3]].forEach(([l, i]) => { const aa = i * Math.PI / 2; insT(g, l, Math.sin(aa) * R * 0.48, -Math.cos(aa) * R * 0.48 + R * 0.08, R * 0.24, { color: l === (o.hi || '') ? '#e23b2e' : '#2a1c15', stroke: null }); });
  g.rotate(a); g.fillStyle = '#e23b2e'; g.beginPath(); g.moveTo(0, -R * 0.7); g.lineTo(R * 0.09, 0); g.lineTo(-R * 0.09, 0); g.closePath(); g.fill(); g.lineWidth = R * 0.02; g.stroke();
  g.fillStyle = '#e8e2d2'; g.beginPath(); g.moveTo(0, R * 0.7); g.lineTo(R * 0.09, 0); g.lineTo(-R * 0.09, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#2a1c15'; g.beginPath(); g.arc(0, 0, R * 0.06, 0, 7); g.fill(); g.restore();
}
// schematic map card: North America (left), the Atlantic, Ireland (right). route: 'west' | 'east' | 'both'; k = 0..1 progress of the plane icon
export function mapCard(g, t, o = {}) {
  const pop = ease.outBack(clamp(t / 0.3)); if (pop <= 0) return; const x0 = 60, y0 = o.y ?? 520, W = E.W - 120, H = 760;
  g.save(); g.translate(E.W / 2, y0 + H / 2); g.scale(pop, pop); g.translate(-E.W / 2, -(y0 + H / 2));
  g.fillStyle = '#7ac0e8'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(x0, y0, W, H, 34); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.roundRect(x0, y0, W, H, 34); g.clip();
  g.fillStyle = '#e8d8a0'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(x0 - 20, y0 + 120); g.bezierCurveTo(x0 + 220, y0 + 80, x0 + 380, y0 + 160, x0 + 430, y0 + 300); g.bezierCurveTo(x0 + 400, y0 + 420, x0 + 330, y0 + 520, x0 + 250, y0 + 620); g.lineTo(x0 - 20, y0 + 640); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.ellipse(x0 + W - 120, y0 + 250, 46, 62, 0.3, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(x0 + W - 40, y0 + 300, 60, 120, 0.2, 0, 7); g.fill(); g.stroke();
  g.restore();
  const NY = [x0 + 400, y0 + 330], CA = [x0 + 40, y0 + 380], IE = [x0 + W - 120, y0 + 250];
  const dot = (p, l, c, dy) => { g.fillStyle = c; g.beginPath(); g.arc(p[0], p[1], 14, 0, 7); g.fill(); g.lineWidth = 5; g.stroke(); insT(g, l, p[0], p[1] + dy, 40, { color: '#ffffff', stroke: CARD_INK }); };
  const path = (A, B, k, c, dash) => { g.save(); g.setLineDash(dash ? [22, 16] : []); g.strokeStyle = c; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(A[0], A[1]); const mx = (A[0] + B[0]) / 2, my = Math.min(A[1], B[1]) - 120; for (let i = 1; i <= 30 * k; i++) { const u = i / 30; g.lineTo((1 - u) ** 2 * A[0] + 2 * (1 - u) * u * mx + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * my + u * u * B[1]); } g.stroke(); g.restore();
    const u = k; return [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * mx + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * my + u * u * B[1]]; };
  let ic = null;
  if (o.west != null) ic = path(NY, CA, o.west, '#2a9a3a', true);
  if (o.east != null) ic = path(NY, IE, o.east, '#e23b2e', false);
  if (o.atlantic != null) ic = path(NY, IE, o.atlantic, '#ffd25a', true);
  dot(NY, 'NEW YORK', '#ffd25a', 56); dot(CA, 'CALIFORNIA', '#7aff8a', 56); dot(IE, 'IRELAND', '#7aff8a', -36);
  if (ic) { g.save(); g.translate(ic[0], ic[1]); insT(g, '✈', 0, 18, 70, { color: '#ffffff', stroke: CARD_INK }); g.restore(); }
  if (o.title) insT(g, o.title, E.W / 2, y0 + H - 70, 64, { color: '#ffffff', stroke: CARD_INK });
  g.restore();
}
// pilot's licence card with a SUSPENDED stamp
export function licenseCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; g.save(); g.translate(E.W / 2, o.y ?? 760); g.scale(k, k); g.rotate(-0.05);
  g.fillStyle = '#f4ecd8'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-380, -230, 760, 460, 26); g.fill(); g.stroke();
  insT(g, "PILOT'S LICENSE", 0, -150, 62, { color: '#2a1c15', stroke: null });
  g.fillStyle = '#d8c8a8'; g.fillRect(-330, -90, 220, 260); g.lineWidth = 6; g.strokeRect(-330, -90, 220, 260);
  g.fillStyle = '#6a3e22'; g.beginPath(); g.arc(-220, 0, 60, Math.PI, 0); g.fill(); g.fillStyle = '#f0c8a0'; g.beginPath(); g.arc(-220, 20, 52, 0, 7); g.fill();
  for (let i = 0; i < 4; i++) { g.fillStyle = '#b8a888'; g.fillRect(-60, -70 + i * 60, 360, 18); }
  g.restore();
}
export { sunnySky, THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, shadeHex };
