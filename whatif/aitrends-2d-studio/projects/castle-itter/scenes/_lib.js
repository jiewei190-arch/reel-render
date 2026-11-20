// The Battle for Castle Itter — shared assets: WWII beans (US GI with an M1-style helmet, German army soldier in field grey
// with a plain field cap, dark generic "SS" silhouettes, French VIP prisoners in suits), a rifle, a Sherman-style tank,
// the castle (window wall for the hook, the castle on its hill with the Alps, the stone hall, the battlement),
// plus 2D overlay helpers (hook text, rubber stamps, name/memorial card, muzzle flashes). Underscore = not auto-loaded.
// TONE GUARD (MAIN): no Nazi symbols anywhere (SS = dark generic silhouettes, no insignia on any uniform); nobody is shown hit;
// Gangl's death is said plainly over a quiet memorial card; no gore, no jokes about it.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { fire, smoke, embers, glow } from '/kits/toon3d/fx.js';
import { project } from '/kits/toon3d/react.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

// time of a spoken word relative to the shot start (fallback fb if not found)
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);

// ---------------------------------------------------------------- PEOPLE
// M1-style steel helmet: a smooth dome + a slight brim, olive drab, no insignia
function m1Helmet(b, c = '#56633e') {
  const R = 0.48, head = b.parts.head, m = toon(c);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.13, 30, 14, 0, Math.PI * 2, 0, Math.PI / 2 + 0.12), m); dome.position.set(0, R * 0.12, -R * 0.03); dome.rotation.x = -0.18; dome.castShadow = true; head.add(dome);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.17, R * 1.2, R * 0.06, 30), toon(shadeHex(c, -0.12))); brim.position.set(0, R * 0.08, -R * 0.0); brim.rotation.x = -0.18; head.add(brim);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, R * 0.03, 6, 24, Math.PI), toon('#4a4030')); strap.rotation.set(0, Math.PI / 2, Math.PI); strap.position.set(0, R * 0.1, R * 0.05); strap.userData.noOutline = true; head.add(strap);
}
// a plain soft field cap (no badge, no insignia)
function fieldCap(b, c = '#626a5e', visor = false) {
  const R = 0.48, head = b.parts.head, m = toon(c);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(R * (visor ? 1.08 : 0.95), R * 0.92, R * (visor ? 0.42 : 0.5), 28), m); top.position.set(0, R * 0.8, -R * 0.06); top.rotation.x = -0.14; top.castShadow = true; head.add(top);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.94, R * 0.93, R * 0.16, 28), toon(shadeHex(c, -0.22))); band.position.set(0, R * 0.6, -R * 0.03); band.rotation.x = -0.14; head.add(band);
  const vis = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.62, R * 0.62, R * 0.05, 24, 1, false, -1.1, 2.2), toon(visor ? '#1e1a18' : shadeHex(c, -0.1))); vis.position.set(0, R * 0.55, R * 0.42); vis.rotation.x = 0.18; head.add(vis);
}
export function gi(o = {}) { const b = bean({ name: 'GI', outfit: 'uniform', head: 'none', skin: o.skin || 'light', hair: 'bowl', hairColor: o.hairColor || '#5a3a22', colors: { main: '#6a7448', legs: '#5a6240' }, seed: o.seed || 9, ...(o.over || {}) }); m1Helmet(b); return b; }
export function german(o = {}) { const b = bean({ name: 'Heer', outfit: 'uniform', head: 'none', skin: o.skin || 'fair', hair: o.hair || 'swoop', hairColor: o.hairColor || '#7a5a3a', colors: { main: '#6c7468', legs: '#575e55', belt: '#2a2422' }, seed: o.seed || 11, ...(o.over || {}) }); fieldCap(b, '#646c60', !!o.officer); return b; }
// Major Gangl: German army officer, visor cap, field grey (no insignia, no medals)
export function gangl(o = {}) { return german({ seed: 31, hair: 'swoop', hairColor: '#4a3020', officer: true, ...o }); }
// "the SS": dark, faceless generic silhouettes with a dome helmet (no symbols, no faces of violence)
export function shadowTrooper(o = {}) { const b = bean({ name: 'SS', outfit: 'uniform', head: 'none', silhouette: true, silhouetteColor: '#1d1a22', seed: o.seed || 21 }); m1Helmet(b, '#1d1a22'); return b; }
// French VIP prisoners: older statesmen in dark suits (generic, no likeness)
export function statesman(o = {}) { return bean({ name: 'PM', outfit: 'uniform', head: 'none', skin: o.skin || 'fair', hair: o.hair || 'horseshoe', hairColor: o.hairColor || '#b8b4ae', moustache: o.moustache, colors: { main: o.suit || '#2e3446', legs: shadeHex(o.suit || '#2e3446', -0.1), belt: o.suit || '#2e3446' }, seed: o.seed || 41, ...(o.over || {}) }); }

// rifle: wood stock + steel barrel; origin = grip, barrel along +Z
export function rifle() {
  const g = new THREE.Group();
  const stock = rbox(0.09, 0.15, 0.95, '#7a4e2a', 0, -0.03, 0.05, 0.03); g.add(stock);
  const butt = rbox(0.1, 0.22, 0.3, '#6a4224', 0, -0.07, -0.42, 0.04); g.add(butt);
  const rec = rbox(0.08, 0.08, 0.32, '#3a3a3a', 0, 0.06, 0.1, 0.02); g.add(rec);
  const bar = cyl(0.026, 0.026, 0.75, '#2e2e2e', 0, 0.05, 0.82, 8); bar.rotation.x = Math.PI / 2; g.add(bar);
  outline(g, { px: 2.2 }); g.muzzle = new THREE.Object3D(); g.muzzle.position.set(0, 0.05, 1.2); g.add(g.muzzle); return g;
}
// aim pose: arms forward at shoulder height, rifle at the shoulder (place the rifle each frame with holdRifle)
export const AIM = { armL: [1.45, -0.05, 0.3], armR: [1.2, 0.35, 0.3], elbowL: 0.35, elbowR: 1.25, headNod: 0.05 };
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3();
// holdRifle(bean, rifle, k) — k 0 = carried low across the body, 1 = aimed forward at the shoulder; recoil 0..1
export function holdRifle(b, r, k = 1, recoil = 0) {
  b.updateWorldMatrix(true, true); b.getWorldQuaternion(_q);
  const up = b.parts.upper || b; up.getWorldPosition(_v);
  const loc = new THREE.Vector3(lerp(0.0, -0.17, k), lerp(1.25, 1.75, k), lerp(0.4, 0.42, k) - recoil * 0.08);
  const sc = b.children[0]?.scale?.x || 1; loc.multiplyScalar(sc);
  loc.applyQuaternion(_q); b.getWorldPosition(_v); r.position.copy(_v).add(loc);
  _e.set(lerp(-0.25, 0.0, k) - recoil * 0.12, lerp(0.9, 0.0, k), lerp(-0.9, 0, k)); r.quaternion.copy(_q).multiply(new THREE.Quaternion().setFromEuler(_e));
}
// Sherman-style medium tank (olive, a white star is the only marking; it is US, not a forbidden symbol)
export function tank(o = {}) {
  const c = o.color || '#5c6a3e', d = shadeHex(c, -0.25), g = new THREE.Group();
  for (const s of [-1, 1]) { g.add(rbox(0.55, 0.85, 4.6, '#3a3a34', s * 1.25, 0.45, 0, 0.2)); for (let i = 0; i < 5; i++) { const w = cyl(0.3, 0.3, 0.12, '#55554c', s * 1.55, 0.38, -1.7 + i * 0.85, 14); w.rotation.z = Math.PI / 2; g.add(w); } }
  g.add(rbox(2.4, 0.9, 4.2, c, 0, 1.2, 0, 0.15));
  const glacis = rbox(2.3, 0.9, 1.0, c, 0, 1.15, 2.0, 0.15); glacis.rotation.x = 0.7; g.add(glacis);
  const tur = new THREE.Group(); tur.position.set(0, 1.85, -0.2); g.add(tur);
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.1, 0.7, 24), toon(c)); dome.castShadow = true; tur.add(dome);
  const hatch = cyl(0.35, 0.35, 0.1, d, 0.2, 0.4, -0.2, 16); tur.add(hatch);
  const gun = cyl(0.09, 0.11, 2.4, '#3a3f2c', 0, 0.05, 1.9, 12); gun.rotation.x = Math.PI / 2; tur.add(gun);
  const mant = rbox(0.8, 0.5, 0.4, d, 0, 0.0, 0.95, 0.08); tur.add(mant);
  const starT = canvasTex(256, 256, (x, W, H) => { x.fillStyle = c; x.fillRect(0, 0, W, H); x.fillStyle = '#f4f0e0'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 40 : 100; x.lineTo(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r); } x.closePath(); x.fill(); });
  for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), toon('#ffffff', { map: starT })); st.position.set(s * 1.215, 1.25, -0.3); st.rotation.y = s * Math.PI / 2; st.userData.noOutline = true; g.add(st); }
  g.add(blob(2.6, 0.3)); outline(g, { px: 2.4 }); g.turret = tur; return g;
}

// ---------------------------------------------------------------- SETS
const stoneMat = (c = '#d8d0bf', rep = [3, 2]) => new THREE.MeshToonMaterial({ color: '#ffffff', map: PR.TEX.stone(c, rep), gradientMap: toon('#fff').gradientMap });
// a wall with an arched opening (the hook window). Returns { group, sill } ; opening centre x=0, from y0 to y0+h, width w
export function archWall(o = {}) {
  const { W = 12, H = 8, w = 3.6, y0 = 1.3, h = 3.3, depth = 0.9, c = '#d6cdb9' } = o; const g = new THREE.Group();
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(-W / 2, H); sh.closePath();
  const hole = new THREE.Path(); hole.moveTo(-w / 2, y0); hole.lineTo(-w / 2, y0 + h - w / 2); hole.absarc(0, y0 + h - w / 2, w / 2, Math.PI, 0, true); hole.lineTo(w / 2, y0); hole.closePath(); sh.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 24 }); const uv = geo.attributes.uv, pos = geo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 4, pos.getY(i) / 3);
  const wall = new THREE.Mesh(geo, stoneMat(c, [1, 1])); wall.position.z = -depth; wall.castShadow = wall.receiveShadow = true; g.add(wall);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(w / 2 + 0.16, 0.18, 8, 28, Math.PI), toon(shadeHex(c, -0.15))); ring.position.set(0, y0 + h - w / 2, 0.05); g.add(ring);
  const sill = rbox(w + 0.6, 0.22, depth + 0.3, shadeHex(c, -0.1), 0, y0 - 0.06, -depth / 2 + 0.1, 0.05); g.add(sill);
  outline(g, { px: 2.2 }); return g;
}
// pine tree (cone stack)
export function pine(s = 1, c = '#3f6a46') { const g = new THREE.Group(); g.add(cyl(0.12 * s, 0.16 * s, 1.0 * s, '#5a4030', 0, 0.5 * s, 0, 8)); for (let i = 0; i < 3; i++) { const cn = new THREE.Mesh(new THREE.ConeGeometry((1.1 - i * 0.28) * s, 1.5 * s, 12), toon(shadeHex(c, i * 0.05))); cn.position.y = (1.3 + i * 0.75) * s; cn.castShadow = true; g.add(cn); } outline(g, { px: 2 }); return g; }
// the Alps: big blue-grey peaks with snow caps (far background, no outline)
export function alps(st, o = {}) { const g = new THREE.Group(); const r = rng(o.seed || 2);
  for (let i = 0; i < 9; i++) { const x = -150 + i * 38 + r() * 14, hgt = 45 + r() * 40, rad = 30 + r() * 18, z = -170 - r() * 40;
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad, hgt, 7), toon(i % 2 ? '#7f93ad' : '#8aa0b8')); m.position.set(x, hgt / 2 - 6, z); m.rotation.y = r() * 3; g.add(m);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.36, hgt * 0.36, 7), toon('#f4f6fa', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.2 })); cap.position.set(x, hgt - 6 - hgt * 0.18 + 0.3, z); cap.rotation.y = m.rotation.y; g.add(cap); }
  st.add(g); return g; }
// the castle (stylised): pale walls, a tall keep with a red hip roof, two round towers, crenellated curtain wall, on a green hill
export function castle(o = {}) {
  const g = new THREE.Group(), c = o.c || '#e4dccb', roof = o.roof || '#a8452e';
  const keep = new THREE.Mesh(new THREE.BoxGeometry(5, 9, 5), stoneMat(c, [2, 3])); keep.position.set(0.6, 4.5 + 2.2, -1.2); keep.castShadow = keep.receiveShadow = true; g.add(keep);
  const kr = new THREE.Mesh(new THREE.ConeGeometry(4.0, 3.2, 4), toon(roof)); kr.position.set(0.6, 9 + 2.2 + 1.6, -1.2); kr.rotation.y = Math.PI / 4; kr.castShadow = true; g.add(kr);
  for (const [x, y] of [[-0.4, 8.5], [1.6, 8.5], [-0.4, 5.6], [1.6, 5.6]]) g.add(box(0.55, 0.9, 0.1, '#2a2226', x, y, 1.34));
  const wallM = stoneMat(c, [4, 1]);
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(11, 4.2, 0.9), wallM); w1.position.set(0, 2.1, 1.8); w1.castShadow = w1.receiveShadow = true; g.add(w1);
  for (let x = -5.2; x <= 5.3; x += 1.05) g.add(rbox(0.55, 0.6, 0.9, c, x, 4.5, 1.8, 0.05));
  const gate = rbox(1.8, 2.4, 0.2, '#5a3a24', 0.4, 1.2, 2.3, 0.05); g.add(gate);
  for (const s of [-1, 1]) { const tw = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 6.5, 24), stoneMat(c, [3, 2])); tw.position.set(s * 5.8, 3.25, 1.6); tw.castShadow = true; g.add(tw);
    const cn = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.6, 24), toon(roof)); cn.position.set(s * 5.8, 6.5 + 1.3, 1.6); cn.castShadow = true; g.add(cn);
    g.add(box(0.4, 0.7, 0.1, '#2a2226', s * 5.8, 4.4, 3.15)); }
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.2, 6), wallM); side.position.set(-5.4, 2.1, -1.2); side.castShadow = true; g.add(side);
  outline(g, { px: 2.0 }); return g;
}
export function hill(o = {}) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.c || '#6f9a52')); m.scale.set(o.sx || 22, o.sy || 6, o.sz || 16); m.receiveShadow = true; m.userData.noOutline = true; return m; }
// castle on its hill with the Alps behind, pines around. st = stage (sunny or dusk). returns { group, castle, sky, update }
export function castleView(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(400, 400, o.grass || '#7fa85a', 0, -60));
  const h = hill({ c: o.hillC || '#6f9a52' }); h.position.set(0, -0.5, -4); g.add(h);
  const cs = castle(); cs.position.set(0, 5.4, -4); g.add(cs);
  const r = rng(o.seed || 5);
  for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = 14 + r() * 26; const x = Math.cos(a) * d, z = -4 + Math.sin(a) * d * 0.8; if (z > (o.maxZ ?? 18)) continue; const p = pine(1.2 + r() * 1.2, r() < 0.5 ? '#3f6a46' : '#35603e'); p.position.set(x, 0, z); g.add(p); }
  alps(st, { seed: 3 });
  const sky = o.noSky ? null : sunnySky(st, { clouds: 6, seed: 4, ...(o.sky || {}) });
  return { group: g, castle: cs, sky, update(t) { sky?.update(t); } };
}
// stone hall interior: stone back wall with a tall window (light), wooden floor, a long table, a tapestry-free plain wall
export function hall(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshToonMaterial({ map: PR.TEX.planks('#8a6440', [6, 4], 8), gradientMap: toon('#fff').gradientMap })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), stoneMat('#cfc5b0', [6, 2])); wall.position.set(0, 5, -4); wall.receiveShadow = true; g.add(wall);
  for (const x of [-4.2, 4.2]) { g.add(box(1.4, 2.6, 0.1, '#bfe0f6', x, 4.2, -3.95)); const fr = rbox(1.7, 0.2, 0.3, '#9a8a70', x, 2.85, -3.85, 0.04); g.add(fr); }
  const sh = []; for (const x of [-4.2, 4.2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 7), new THREE.MeshBasicMaterial({ color: '#fff3d0', transparent: true, opacity: 0.12, depthWrite: false })); m.position.set(x + 0.8, 2.8, -2.5); m.rotation.set(-0.5, 0, -0.4); m.userData.noOutline = true; g.add(m); sh.push(m); }
  if (o.table !== false) { const tb = PR.table({ w: 4.4, d: 1.3, h: 1.0, color: '#6a4a30' }); tb.position.set(0, 0, -1.2); g.add(tb); }
  return { group: g, update() {} };
}
// battlement walkway: a crenellated parapet facing the camera-left valley; defenders stand behind it (z < 0), camera outside/below
export function battlement(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const c = o.c || '#d6cdb9';
  const walk = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 3), stoneMat(c, [8, 1])); walk.position.set(0, -0.2, -1.2); walk.receiveShadow = true; g.add(walk);
  const para = new THREE.Mesh(new THREE.BoxGeometry(30, 1.25, 0.6), stoneMat(c, [8, 1])); para.position.set(0, 0.625, 0.4); para.castShadow = para.receiveShadow = true; g.add(para);
  const fr = new THREE.Mesh(new THREE.BoxGeometry(30, 12, 0.6), stoneMat(c, [8, 4])); fr.position.set(0, -6.2, 0.4); fr.receiveShadow = true; g.add(fr);
  for (let x = -14.5; x <= 14.6; x += 1.6) { const m = rbox(0.85, 0.85, 0.6, c, x, 1.25 + 0.42, 0.4, 0.05); g.add(m); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 1), stoneMat(shadeHex(c, -0.06), [8, 3])); back.position.set(0, 3.6, -3.4); back.receiveShadow = true; g.add(back);
  outline(g, { px: 2 }); return { group: g, update() {} };
}

// ---------------------------------------------------------------- 2D OVERLAYS
// top hook caption (2 lines centre-top; per-word colours). lines: [[ [word, colour], ... ], ...]
export function hookCaption(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until != null ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  const size = o.size || 92;
  lines.forEach((ws, i) => {
    const k = ease.outBack(clamp((t + (o.pre ?? 0.3) - i * 0.15) / 0.3)); if (k <= 0) return;
    g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * size * 1.18); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.012);
    g.font = `900 ${size}px "Fredoka", sans-serif`; const sp = size * 0.28; const wds = ws.map(([w]) => g.measureText(w).width); const tot = wds.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = -tot / 2; ws.forEach(([w, col], j) => { insT(g, w, x + wds[j] / 2, 0, size, { color: col || '#ffffff', stroke: CARD_INK }); x += wds[j] + sp; });
    g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.96) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, g.measureText(text).width * 1.06 + s * 0.9);
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: w - s * 0.5 });
  g.restore();
}
// name tag over a character (small pill with a pointer)
export function tag(g, t, st, obj, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const p = new THREE.Vector3(); obj.getWorldPosition(p); p.y += o.h ?? 3.0;
  const q = project(st, p); const s = o.size || 40; g.save(); g.translate(q.x + (o.dx || 0), q.y + (o.dy || 0)); g.scale(k, k);
  g.font = `900 ${s}px "Nunito", sans-serif`; const w = g.measureText(text).width + s * 1.0;
  g.fillStyle = o.fill || '#2f5aa8'; g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2, -s * 0.75, w, s * 1.5, s * 0.5); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-12, s * 0.75); g.lineTo(0, s * 0.75 + 18); g.lineTo(12, s * 0.75); g.closePath(); g.fill(); g.stroke();
  insT(g, text, 0, s * 0.05, s, { color: '#ffffff', stroke: null }); g.restore();
}
// muzzle flash (2D, over a 3D point): a short yellow star burst, deterministic per time
export function flash(g, st, obj, t, period = 0.42, phase = 0, o = {}) {
  const ph = ((t + phase) % period) / period; if (ph > 0.22) return; const a = 1 - ph / 0.22;
  const p = new THREE.Vector3(); obj.getWorldPosition(p); const q = project(st, p); const r = (o.r || 70) * (q.s / 300) * (0.7 + a * 0.5);
  g.save(); g.translate(q.x, q.y); g.rotate(phase * 7); g.globalAlpha = a; g.fillStyle = '#ffd25a'; g.strokeStyle = '#fff6c8'; g.lineWidth = 4; g.beginPath();
  for (let i = 0; i < 14; i++) { const an = (i / 14) * Math.PI * 2, rr = i % 2 ? r * 0.38 : r; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, r * 0.25, 0, 7); g.fill(); g.restore();
}
// plain memorial card (s11b): no gag, quiet
export function memorial(g, t, o = {}) {
  const k = ease.out(clamp(t / 0.5)); g.save(); g.globalAlpha = k; g.translate(E.W / 2, o.y ?? E.H * 0.47);
  const W = 800, H = 560; g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 12, -H / 2 + 16, W, H, 24); g.fill();
  g.fillStyle = '#efe8d6'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 24); g.fill(); g.stroke();
  g.strokeStyle = '#9a8a6a'; g.lineWidth = 3; g.beginPath(); g.roundRect(-W / 2 + 24, -H / 2 + 24, W - 48, H - 48, 14); g.stroke();
  (o.lines || []).forEach(([txt, size, col], i) => insT(g, txt, 0, -H / 2 + 120 + i * (o.lh || 110), size, { color: col || CARD_INK, stroke: null, maxW: W - 100 }));
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, fire, smoke, embers, glow, canvasTex, project, sunnySky };
