// meat-rain: shared helpers (underscore = not auto-loaded). Kentucky farm 1876 in the sunny look, cartoon meat chunks,
// a toon turkey vulture, period beans. Everything comic: the meat is pink cartoon steak, nobody is ever hurt.
import { wordTime, rng, clamp, lerp, ease, noise } from '/engine/core.js';
import { THREE, toonStage, toon, flat, outline, ball, cyl, rbox, box, lathe, blob, INK } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { sunnySky } from '/kits/toon3d/sky.js';

// seconds into the shot of a spoken word (first match at/after the shot start)
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };

const texFloor = (w, d, tex) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), PR.texMat(tex)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; return m; };

// ---------- props ----------
export function tree(o = {}) {
  const { s = 1, seed = 2 } = o; const r = rng(seed); const g = new THREE.Group();
  const tr = cyl(0.16 * s, 0.26 * s, 2.6 * s, '#7a5634', 0, 1.3 * s, 0, 10); g.add(tr);
  const L = ['#5f9a45', '#6fae50', '#4f8a3c'];
  for (let i = 0; i < 6; i++) { const a = r() * Math.PI * 2, d = i ? 0.5 + r() * 0.6 : 0; g.add(ball((0.85 + r() * 0.35) * s, L[i % 3], Math.cos(a) * d * s, (3.0 + r() * 0.9) * s, Math.sin(a) * d * s, 14)); }
  g.add(blob(1.6 * s, 0.25)); outline(g, { px: 2.4 }); return g;
}
// iron soap kettle on three legs over a small fire (lye soap was boiled outdoors)
export function kettle() {
  const g = new THREE.Group();
  const pot = lathe([[0.001, 0], [0.32, 0.03], [0.46, 0.25], [0.46, 0.5], [0.42, 0.62], [0.47, 0.66]], '#2c2a2e', 24); pot.position.y = 0.32; pot.castShadow = true; g.add(pot);
  const soap = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), toon('#efe2bc')); soap.rotation.x = -Math.PI / 2; soap.position.y = 0.92; soap.userData.noOutline = true; g.add(soap);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.4; const l = cyl(0.03, 0.03, 0.45, '#2c2a2e', Math.cos(a) * 0.3, 0.2, Math.sin(a) * 0.3, 6); g.add(l); }
  const paddle = new THREE.Group(); paddle.position.set(0, 0.9, 0); g.add(paddle); const stick = cyl(0.03, 0.03, 1.3, '#9a7048', 0, 0.45, 0, 8); stick.rotation.z = 0.35; paddle.add(stick);
  g.paddle = paddle; outline(g, { px: 2.6 });
  const f = FX.fire({ size: 0.32, tongues: 4, seed: 7, spread: 0.4, light: 0 }); f.position.set(0, 0.02, 0); g.add(f);

  g.update = (t) => { f.update(t); paddle.rotation.y = t * 1.6; };
  return g;
}
// cartoon steak chunk: pink rounded slab with a cream fat edge (comic, clean, never bloody)
const chunkGeo = new THREE.SphereGeometry(1, 16, 10);
export function chunk(seed = 1, s = 1) {
  const r = rng(seed * 7 + 3); const g = new THREE.Group();
  const m = new THREE.Mesh(chunkGeo, toon(['#e8747a', '#f08a8a', '#de6670'][seed % 3])); m.scale.set(0.2 * s, 0.085 * s, 0.15 * s); m.castShadow = true; g.add(m);
  const fat = new THREE.Mesh(chunkGeo, toon('#fbe6d0')); fat.scale.set(0.07 * s, 0.07 * s, 0.13 * s); fat.position.set(0.15 * s, 0.01, 0); g.add(fat);
  const st = new THREE.Mesh(chunkGeo, toon('#f6b0a8')); st.scale.set(0.11 * s, 0.03 * s, 0.05 * s); st.position.set(-0.03 * s, 0.065 * s, 0.02 * s); st.userData.noOutline = true; g.add(st);
  g.rotation.y = r() * 6.28; outline(g, { px: 2.2 }); return g;
}
// meat rain: n chunks spawned between t0 and t1, falling from y0 onto area [x0, x1, z0, z1]; .update(t)
export function meatRain(st, o = {}) {
  const { n = 30, area = [-4, 4, -2, 3], t0 = 0, t1 = 3, y0 = 11, seed = 5, s = 1, grav = 9, skip = [] } = o; const r = rng(seed); const list = [];
  for (let i = 0; i < n; i++) {
    let x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]);
    for (const [sx, sz, rad] of skip) { const dx = x - sx, dz = z - sz, d = Math.hypot(dx, dz); if (d < rad) { x = sx + (dx / (d || 1)) * rad; z = sz + (dz / (d || 1)) * rad; } }
    const c = chunk(i + seed, s * (0.8 + r() * 0.5)); c.userData = { ts: t0 + r() * (t1 - t0), x, z, spin: (r() - 0.5) * 10, tilt: r() * 6 }; st.add(c); list.push(c);
  }
  const fallT = Math.sqrt((2 * y0) / grav);
  return { list, update(t) { for (const c of list) { const u = c.userData, a = t - u.ts; if (a < 0) { c.visible = false; continue; } c.visible = true;
    if (a < fallT) { c.position.set(u.x, y0 - 0.5 * grav * a * a, u.z); c.rotation.set(u.tilt + a * u.spin, a * u.spin * 0.5, a * u.spin * 0.3); }
    else { const b = a - fallT; const hop = b < 0.35 ? Math.sin((b / 0.35) * Math.PI) * 0.22 : 0; c.position.set(u.x, 0.06 + hop, u.z); c.rotation.set(0, u.tilt, 0); } } } };
}

// ---------- the Kentucky farm, 1876 (sunny) ----------
export function kyFarm(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0] });
  const sky = sunnySky(st, { clouds: o.clouds ?? 8, seed: o.seed || 3 });
  const g = new THREE.Group(); st.add(g);
  const grass = texFloor(200, 200, PR.TEX.plaster('#86b85a', [20, 20])); grass.position.z = -40; g.add(grass);
  const yard = texFloor(14, 9, PR.TEX.plaster('#c49a66', [3, 3])); yard.position.set(0, 0.005, -1); g.add(yard);
  const house = PR.facade({ w: 7, h: 3.4, d: 4.5, color: '#e9dcc4', trim: '#6a5444', windows: 2 }).at(-1.5, 0, -6.5, 0.0); g.add(house);
  const porch = rbox(7.4, 0.25, 1.4, '#9a7450', -1.5, 0.12, -5.9, 0.03); g.add(porch);
  const fc = PR.fence({ len: 26, gap: 2.2 }).at(0, 0, -9.5); g.add(fc);
  const fc2 = PR.fence({ len: 14, gap: 2.2 }).at(6.5, 0, -2, Math.PI / 2); g.add(fc2);
  g.add(tree({ s: 1.2, seed: 2 }).translateX(-8).translateZ(-8), tree({ s: 1.0, seed: 5 }).translateX(5.5).translateZ(-7.5), tree({ s: 1.5, seed: 8 }).translateX(-14).translateZ(-22), tree({ s: 1.2, seed: 9 }).translateX(12).translateZ(-20), tree({ s: 1.3, seed: 11 }).translateX(2).translateZ(-30));
  const hill = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#6f9e4a')); hill.scale.set(1.8, 0.14, 0.4); hill.position.set(0, 0, -80); hill.userData.noOutline = true; g.add(hill);
  const ket = kettle(); ket.position.set(1.0, 0, 0.6); g.add(ket);
  const hens = [PR.chicken().at(2.6, 0, 1.6, -0.6), PR.chicken({ color: '#c9874a' }).at(-2.8, 0, 2.0, 0.7)]; hens.forEach(h => g.add(h));
  g.add(PR.barrel().at(-4.2, 0, -4.6), PR.crate().at(3.6, 0, -4.8, 0.3));
  return { stage: st, sky, group: g, kettle: ket, hens, house, update(t) { sky.update(t); ket.update(t); } };
}

// ---------- characters ----------
export const woman = () => bean({ name: 'Farm wife', outfit: 'robe', colors: { main: '#5b86b8', trim: '#f2ead6' }, skin: 'fair', hair: 'bun', hairColor: '#6a4428', seed: 31 });
// farmer: a plain wide-brim farm hat (built here; the kit's slouch hat is the pinned-up Australian one)
export function farmer(i = 0) {
  const b = bean({ name: 'Farmer', outfit: 'uniform', colors: { main: ['#8a5a3a', '#6a7a4a'][i % 2], legsTop: '#3f5a7a', trim: '#c9a14a', belt: '#3a2a1a' }, head: 'none', skin: ['tan', 'light'][i % 2], hair: 'bowl', hairColor: '#3a2618', beard: i === 1, beardColor: '#5a3a22', seed: 40 + i });
  const R = 0.48, hc = ['#6a4e30', '#4a3a2a'][i % 2], hat = new THREE.Group();
  const crown = cyl(R * 0.7, R * 0.86, R * 0.6, hc, 0, R * 0.92, -R * 0.04, 28); crown.rotation.x = -0.08; hat.add(crown);
  hat.add(cyl(R * 0.88, R * 0.9, R * 0.14, '#2a2220', 0, R * 0.7, -R * 0.03, 28));
  const brim = cyl(R * 1.5, R * 1.5, R * 0.05, hc, 0, R * 0.62, 0, 32); brim.rotation.x = -0.08; hat.add(brim);
  outline(hat, { px: 3 }); b.parts.head.add(hat); return b;
}
export const scientist = () => bean({ name: 'Scientist', outfit: 'labcoat', colors: { main: '#f4f2ec', shirt: '#c9b083', legsTop: '#3a3f4a' }, glasses: true, hair: 'horseshoe', hairColor: '#9a9a96', beard: true, beardColor: '#b0aca4', skin: 'light', seed: 52 });

// ---------- turkey vulture (toon): dark body, big wings, bald red head, ivory beak, lidded eyes ----------
const sph = new THREE.SphereGeometry(1, 20, 14);
export function vulture(o = {}) {
  const { seed = 1, scale = 1 } = o; const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const dark = toon('#2f2828'), dark2 = toon('#463c38'), feath = toon('#6a5e56');
  const body = new THREE.Mesh(sph, dark); body.scale.set(0.42, 0.36, 0.62); body.castShadow = true; g.add(body);
  const tail = new THREE.Mesh(sph, dark2); tail.scale.set(0.3, 0.06, 0.4); tail.position.set(0, -0.02, -0.66); g.add(tail);
  const wings = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 0.32, 0.12, 0); g.add(piv);
    const w1 = new THREE.Mesh(sph, dark); w1.scale.set(0.75, 0.06, 0.38); w1.position.set(s * 0.7, 0, 0); w1.castShadow = true; piv.add(w1);
    const w2 = new THREE.Mesh(sph, feath); w2.scale.set(0.62, 0.05, 0.22); w2.position.set(s * 0.95, -0.02, -0.2); piv.add(w2);
    for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(sph, dark2); f.scale.set(0.22, 0.03, 0.07); f.position.set(s * (1.45 + k * 0.02), 0, 0.1 - k * 0.14); f.rotation.y = s * (0.2 - k * 0.18); piv.add(f); }
    return piv; });
  const ruff = new THREE.Mesh(sph, dark2); ruff.scale.set(0.26, 0.2, 0.2); ruff.position.set(0, 0.2, 0.5); g.add(ruff);
  const head = new THREE.Group(); head.position.set(0, 0.34, 0.68); g.add(head);
  const skinM = toon('#cf5a4e'); const hs = new THREE.Mesh(sph, skinM); hs.scale.set(0.2, 0.19, 0.24); hs.castShadow = true; head.add(hs);
  const beakU = new THREE.Mesh(sph, toon('#efe3c4')); beakU.scale.set(0.06, 0.06, 0.13); beakU.position.set(0, -0.02, 0.24); head.add(beakU);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.06, 0.16); head.add(jaw); const beakL = new THREE.Mesh(sph, toon('#e2d4b0')); beakL.scale.set(0.05, 0.03, 0.1); beakL.position.set(0, 0, 0.06); jaw.add(beakL);
  const tip = new THREE.Mesh(sph, toon('#efe3c4')); tip.scale.set(0.035, 0.05, 0.04); tip.position.set(0, -0.05, 0.34); head.add(tip);
  const eyes = [-1, 1].map(s => { const eg = new THREE.Group(); eg.position.set(s * 0.11, 0.07, 0.15); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(s * 0.55, 0.15, 0.8).normalize()); eg.scale.set(0.085, 0.095, 0.05); head.add(eg);
    const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 })); w.userData.outlinePx = 2; eg.add(w);
    const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.38, 0.42, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
    const lp = new THREE.Group(); eg.add(lp); const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), skinM); lid.userData.noOutline = true; lp.add(lid);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
    return { eg, pg, lp }; });
  outline(g, { px: 2.6 });
  const red = new THREE.Color('#cf5a4e'), green = new THREE.Color('#9cc25a');
  root.update = (t, u = {}) => {
    const { flap = 1, glide = 0, lid = 0.4, look = [0, 0], sick = 0, open = 0, ph = seed * 0.9, bank = 0, scared = 0 } = u;
    const w = Math.sin(t * (7 + scared * 6) + ph); const amp = lerp(0.55, 0.08, glide) * flap;
    wings.forEach((p, i) => { p.rotation.z = (i ? -1 : 1) * (w * amp + 0.08 + scared * 0.35); });
    g.position.y = -w * amp * 0.08; g.rotation.z = bank; head.rotation.x = -0.1 + sick * 0.25 + noise(t, seed) * 0.05; jaw.rotation.x = open * 0.7;
    skinM.color.copy(red).lerp(green, clamp(sick));
    const bl = ((t + seed * 1.3) % 3.3) < 0.13 ? 1 : 0;
    eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); e.pg.scale.setScalar(1 - scared * 0.4); });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.24 * scale; root.update(0); return root;
}
// a flock circling high overhead: centre [x, y, z], radius, n birds; .update(t, u) sets positions; birds face along the circle
export function flock(st, o = {}) {
  const { n = 6, c = [0, 9, -2], R = 4, seed = 3, speed = 0.35, scale = 1 } = o; const r = rng(seed); const birds = [];
  for (let i = 0; i < n; i++) { const v = vulture({ seed: seed * 10 + i, scale: scale * (0.9 + r() * 0.2) }); v.ph0 = (i / n) * Math.PI * 2 + r() * 0.3; v.dy = (r() - 0.5) * 1.6; v.dr = (r() - 0.5) * 1.2; st.add(v); birds.push(v); }
  return { birds, update(t, u = {}) { birds.forEach((v, i) => { const a = v.ph0 + t * speed; const rr = R + v.dr; v.position.set(c[0] + Math.cos(a) * rr, c[1] + v.dy + Math.sin(t * 0.8 + i) * 0.2, c[2] + Math.sin(a) * rr); v.rotation.set(0, -a, 0); v.update(t, { glide: 0.7, ph: i, bank: 0.25, ...(u.per ? u.per(i, v) : {}), ...u.all }); }); } };
}
