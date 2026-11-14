// lake-peigneur: shared sets + props (the lake + Jefferson Island shore, the drilling rig, barges, tugboat, the whirlpool,
// the cross-section down to the salt mine, the drained lake bed + the reversed-canal waterfall). Underscore = not auto-loaded.
// TONE GUARD: every person got out alive (3 dogs were reported killed: never shown, never joked about). Nobody is ever shown
// hurt or trapped; workers and miners only run, wave and escape. No blame beyond "the drill punched into the mine".
import { THREE, toon, flat, canvasTex, outline, rbox, box, cyl, ball, lathe, blob, toonStage } from '/kits/toon3d/toon.js';
import * as PR from '/kits/toon3d/props.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { wordTime, rng, noise, clamp, lerp, ease } from '/engine/core.js';

export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start + after - 0.1); return g == null ? fb : g - info.shot.start; };

const _tx = new Map(); const cached = (k, f) => (_tx.has(k) ? _tx.get(k) : (_tx.set(k, f()), _tx.get(k)));
export const WATER = '#3f9bd6', WATER_D = '#2a6fae', SALT = '#2f9a9a', GRASS = '#7cb84e', MUD = '#8a6a48';

// ---------- water ----------
// toon water texture: flat blue with light wavy strokes; the material is unlit-ish (toon + emissive lift) so it stays bright
const waterTex = (base = WATER) => cached('w' + base, () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const q = rng(3);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const x = q() * w, y = q() * h, l = 18 + q() * 30; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); } }, { repeat: [1, 1] }));
export function waterMat(base = WATER, rep = [8, 8]) { const t = waterTex(base).clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep);
  const m = toon('#ffffff', { map: t, emissive: new THREE.Color(base), emissiveIntensity: 0.25 }); m.userData.tex = t; return m; }
export function waterDisc(R = 30, base = WATER) { const m = new THREE.Mesh(new THREE.CircleGeometry(R, 64), waterMat(base, [R / 4, R / 4])); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true;
  m.flow = (t, sp = 0.02) => { m.material.userData.tex.offset.set(t * sp, t * sp * 0.6); };
  // setHole(r): cut a round hole (for the whirlpool) by rebuilding the disc as a ring; r <= 0 = full disc
  let hr = 0; m.setHole = (r) => { r = Math.round(r * 20) / 20; if (r === hr) return; hr = r; m.geometry.dispose(); m.geometry = r > 0 ? new THREE.RingGeometry(r, R, 64, 1) : new THREE.CircleGeometry(R, 64);
    const uv = m.geometry.attributes.uv, ps = m.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, ps.getX(i) / (2 * R) + 0.5, ps.getY(i) / (2 * R) + 0.5); };
  return m; }

// ---------- vegetation + land ----------
// Louisiana live oak: short fat trunk, wide flat canopy of 5 puffs, a little grey moss
export function oak(o = {}) { const { s = 1, seed = 1 } = o; const q = rng(seed); const g = PR.propGroup();
  g.add(cyl(0.28, 0.42, 1.8, '#6a4a30', 0, 0.9, 0, 10));
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + q(); const r = i ? 1.1 : 0; const b = ball(1.0 + q() * 0.35, shadeHex('#4f8f3a', (q() - 0.5) * 0.15), Math.cos(a) * r, 2.3 + q() * 0.35, Math.sin(a) * r, 14); b.scale.y = 0.72; g.add(b); }
  for (let i = 0; i < 4; i++) { const a = q() * 6.28; const m = ball(0.18, '#a8a898', Math.cos(a) * 1.4, 1.75, Math.sin(a) * 1.4, 8); m.scale.y = 2.4; g.add(m); }
  outline(g, { px: 2.4 }); g.scale.setScalar(s); return g; }
// grass ground with a round hole for the lake (inner radius R) + a muddy bank wall
export function shore(R = 30, o = {}) { const g = new THREE.Group(); const { out = 160, h = 0.6, color = GRASS } = o;
  const ring = new THREE.Mesh(new THREE.RingGeometry(R, out, 72, 1), toon(color)); ring.rotation.x = -Math.PI / 2; ring.position.y = h; ring.receiveShadow = true; ring.userData.noOutline = true; g.add(ring);
  const bank = new THREE.Mesh(new THREE.CylinderGeometry(R, R, h + 0.6, 72, 1, true), toon(MUD, { side: THREE.DoubleSide })); bank.position.y = h / 2 - 0.3; bank.userData.noOutline = true; g.add(bank);
  return g; }
// white plantation-style house with columns (the gardens on Jefferson Island)
export function house() { const g = PR.propGroup(rbox(5, 2.6, 3, '#f4efe4', 0, 1.3, 0, 0.05), new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.6, 4).rotateY(Math.PI / 4), toon('#5a5a62')).translateY(3.4));
  g.children[1].scale.set(1, 1, 0.7); for (let i = 0; i < 5; i++) g.add(cyl(0.12, 0.12, 2.6, '#ffffff', -2 + i, 1.3, 1.7, 10)); g.add(rbox(5.4, 0.2, 0.8, '#ffffff', 0, 2.65, 1.6, 0.03));
  for (const x of [-1.5, 0, 1.5]) g.add(box(0.6, 0.8, 0.05, '#3a5068', x, 1.4, 1.52)); outline(g, { px: 2.2 }); return g; }

// ---------- vessels ----------
// the drilling platform: a floating barge with a lattice derrick, doghouse, pipe rack; .derrick for the drill pipe top
export function rig() { const root = new THREE.Group(); const g = new THREE.Group(); root.add(g);
  g.add(rbox(6, 0.9, 4.2, '#c9562c', 0, 0.25, 0, 0.12), rbox(6.1, 0.18, 4.3, '#3a3a40', 0, 0.75, 0, 0.04));
  const H = 9, B = 1.3, T = 0.35; const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const mat = '#e8c23a';
  for (const [sx, sz] of legs) { const len = Math.hypot(H, (B - T)); const l = cyl(0.09, 0.11, len, mat, 0, 0, 0, 6); const p = new THREE.Group(); p.position.set(sx * (B + T) / 2, 0.84 + H / 2, sz * (B + T) / 2); p.rotation.set(sz * -Math.atan((B - T) / H), 0, sx * Math.atan((B - T) / H)); p.add(l); g.add(p); }
  for (let k = 1; k <= 5; k++) { const y = 0.84 + (k / 6) * H, w = lerp(B, T, k / 6) * 2; for (const r of [0, Math.PI / 2]) for (const s of [-1, 1]) { const b = cyl(0.05, 0.05, w, mat, 0, 0, 0, 5); b.rotation.z = Math.PI / 2; const q = new THREE.Group(); q.rotation.y = r; q.position.y = y; b.position.z = s * w / 2; q.add(b); g.add(q); } }
  g.add(rbox(0.9, 0.5, 0.9, '#d8342c', 0, 0.84 + H + 0.2, 0, 0.05));
  g.add(rbox(1.8, 1.5, 1.6, '#f2ead6', -2, 1.6, 1.0, 0.08), box(0.6, 0.5, 0.05, '#3a5068', -2, 1.8, 1.82), rbox(1.9, 0.15, 1.7, '#3a3a40', -2, 2.42, 1.0, 0.03));
  for (let i = 0; i < 4; i++) g.add(cyl(0.12, 0.12, 3.2, '#8a8a92', 1.6 + (i % 2) * 0.28, 1.05 + Math.floor(i / 2) * 0.25, -1.2, 8).rotateZ(Math.PI / 2));
  const flag = rbox(0.7, 0.45, 0.04, '#d8342c', 0.4, 0.84 + H + 0.9, 0, 0.02); g.add(flag, cyl(0.03, 0.03, 1.2, '#4a4a52', 0, 0.84 + H + 0.6, 0, 5));
  outline(g, { px: 2.6 }); root.body = g; root.topY = 0.84 + H; root.height = 10.5; return root; }
// a flat river barge (rusty hull, a cargo hopper) and a tugboat; each has .bob(t) for idle floating
export function barge(o = {}) { const { color = '#8a4a2a', cargo = '#6a6a72', seed = 1 } = o; const g = PR.propGroup(rbox(2.6, 0.8, 6.5, color, 0, 0.2, 0, 0.12), rbox(2.7, 0.14, 6.6, shadeHex(color, -0.25), 0, 0.62, 0, 0.03), rbox(2.0, 0.7, 5.2, cargo, 0, 0.95, 0, 0.08));
  outline(g, { px: 2.4 }); g.height = 1.6; const q = rng(seed); g.ph = q() * 6; return g; }
export function tug() { const g = PR.propGroup(rbox(2.6, 1.0, 4.6, '#2f5f9a', 0, 0.3, 0, 0.3), rbox(2.7, 0.2, 4.7, '#f2ead6', 0, 0.85, 0, 0.05), rbox(1.7, 1.4, 1.8, '#f2ead6', 0, 1.6, -0.4, 0.1), rbox(1.9, 0.18, 2.0, '#d8342c', 0, 2.35, -0.4, 0.04),
  box(1.2, 0.45, 0.05, '#3a5068', 0, 1.8, 0.52), cyl(0.28, 0.32, 1.2, '#d8342c', 0, 2.9, -0.8, 12), cyl(0.3, 0.3, 0.2, '#26262c', 0, 3.5, -0.8, 12));
  for (const z of [-1.6, 0, 1.6]) for (const s of [-1, 1]) g.add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 6, 12), toon('#26262c')).translateX(s * 1.33).translateY(0.45).translateZ(z).rotateY(Math.PI / 2));
  outline(g, { px: 2.4 }); g.height = 3.6; return g; }
// little fishing skiff (the fisherman)
export function skiff() { const g = PR.propGroup(rbox(1.3, 0.5, 3, '#e8e0cc', 0, 0.1, 0, 0.2), rbox(0.2, 0.3, 0.3, '#3a3a40', 0, 0.45, -1.4, 0.05)); outline(g, { px: 2.2 }); return g; }
// rubber duck (the "bath toys" gag)
export function duck() { const g = PR.propGroup(); const b = ball(1, '#ffd23a', 0, 0.8, 0, 20); b.scale.set(1.1, 0.8, 1.35); const h = ball(0.62, '#ffd23a', 0, 1.75, 0.6, 18); const bk = ball(0.3, '#f28a2a', 0, 1.65, 1.15, 12); bk.scale.set(1.2, 0.5, 1);
  const t = ball(0.35, '#ffd23a', 0, 1.2, -1.2, 10); t.scale.y = 1.4; g.add(b, h, bk, t); for (const s of [-1, 1]) { const e = ball(0.11, '#1a1214', s * 0.3, 1.92, 1.0, 8); e.userData.noOutline = true; g.add(e); } outline(g, { px: 2.6 }); g.height = 2.4; return g; }

// ---------- the whirlpool ----------
// a funnel (lathe, opening upward) with a spiral streak texture that turns; .set(R, depth); .update(t, speed)
const spiralTex = () => cached('spiral', () => canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#163e74'); gr.addColorStop(0.5, '#2a6fae'); gr.addColorStop(1, WATER); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.lineCap = 'round'; for (let i = 0; i < 14; i++) { g.strokeStyle = i % 2 ? 'rgba(255,255,255,.55)' : 'rgba(200,235,255,.35)'; g.lineWidth = 5 + (i % 3) * 3; for (const off of [-2 * w, -w, 0, w]) { g.beginPath(); for (let y = 0; y <= h; y += 8) { const x = (i / 14) * w + (h - y) * (w / h) + off; y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } } }));
export function whirlpool() { const g = new THREE.Group(); const prof = []; for (let i = 0; i <= 24; i++) { const k = i / 24; prof.push(new THREE.Vector2(0.04 + Math.pow(k, 2.2) * 1.0, k)); }
  const geo = new THREE.LatheGeometry(prof, 64); const tex = spiralTex().clone(); tex.needsUpdate = true; tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(2, 1);
  const mat = toon('#ffffff', { map: tex, side: THREE.DoubleSide, emissive: new THREE.Color('#1a4a80'), emissiveIntensity: 0.35 }); const m = new THREE.Mesh(geo, mat); m.userData.noOutline = true; m.position.y = -1; g.add(m);
  // white foam ring on the rim
  const foam = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 64), toon('#ffffff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4 })); foam.rotation.x = Math.PI / 2; foam.userData.noOutline = true; g.add(foam);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1, 24), flat('#06142a')); hole.rotation.x = -Math.PI / 2; hole.userData.noOutline = true; g.add(hole);
  g.set = (R, D) => { m.scale.set(R, D, R); m.position.y = 0.03 - D; foam.scale.set(R, R, 1); foam.position.y = 0.06; hole.scale.setScalar(Math.max(0.05, R * 0.06)); hole.position.y = 0.04 - D + 0.02; g.R = R; g.D = D; };
  g.update = (t, sp = 1) => { tex.offset.x = -t * 0.35 * sp; foam.rotation.z = t * sp; };
  g.set(6, 4); return g; }
// where something orbiting the drain sits: angle a, radius r -> position on the funnel surface (local to the whirlpool)
export function onFunnel(wp, r, a) { const R = wp.R, D = wp.D; const k = clamp(r / R); const kk = Math.pow(k, 1 / 2.2); const y = 0.03 - D + kk * D; return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); }

// ---------- people (generic, original) ----------
export const roughneck = (seed = 1, c = '#2f6fb0') => bean({ name: 'Crew', outfit: 'uniform', colors: { main: c, legsTop: '#2a3a52', legs: '#2a3a52', trim: '#e8c23a' }, skin: ['tan', 'light', 'brown', 'olive'][seed % 4], hair: 'messy', head: 'ballcap', headColor: '#f2ead6', seed });
export const miner = (seed = 1) => { const b = bean({ name: 'Miner', outfit: 'uniform', colors: { main: '#e07a2a', legsTop: '#3a3a44', legs: '#3a3a44', trim: '#f2ead6' }, skin: ['light', 'dark', 'tan', 'fair'][seed % 4], hair: 'bowl', head: 'ballcap', headColor: '#ffd23a', seed });
  const lamp = ball(0.13, '#fff4b0', 0, 0.25, 0.55, 10); lamp.material = toon('#fff4b0', { emissive: new THREE.Color('#fff2a0'), emissiveIntensity: 1 }); lamp.userData.noOutline = true; b.parts.head.add(lamp); return b; };
export const fisherman = () => bean({ name: 'Fisher', outfit: 'tee', colors: { main: '#5a8a4a', legs: '#c2a878', feet: '#3a2a22' }, skin: 'tan', hair: 'swoop', hairColor: '#5a4030', head: 'ballcap', headColor: '#d8342c', beard: true, beardColor: '#5a4030', seed: 81 });

// ---------- the lake set ----------
// Lake (radius R) with the rig near the middle, Jefferson Island on the far shore (hill, oaks, the white house), the canal
// leaving on the right (+X). Options: { sky, seed, light, target, shadowSize, rig: true }
export function lake(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 22, target: o.target || [0, 0, 0], ...(o.stage || {}) });
  const sky = o.sky === false ? null : sunnySky(st, { clouds: 8, seed: o.seed || 3 });
  const R = o.R || 34; const g = new THREE.Group(); st.add(g);
  const water = waterDisc(R + 1, o.waterColor || WATER); g.add(water);
  const sh = shore(R); g.add(sh);
  // Jefferson Island: a low hill on the far shore with oaks + the house
  const hill = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#86c056')); hill.scale.set(1.3, 0.22, 0.7); hill.position.set(-8, 0.3, -R - 14); hill.receiveShadow = true; hill.userData.noOutline = true; g.add(hill);
  const q = rng(o.seed || 5); const trees = [];
  for (let i = 0; i < 46; i++) { const a = q() * Math.PI * 2, r = R + 3 + q() * 22; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > 6 && Math.abs(z) < 5) continue; if (o.clearFront && z > R - 2 && Math.abs(x) < 16) continue; const t = oak({ s: 1.1 + q() * 0.7, seed: i + 3 }); t.position.set(x, 0.6 + (z < -R ? 3 : 0), z); g.add(t); trees.push(t); }
  const hs = house(); hs.position.set(-10, 6.2, -R - 9); hs.rotation.y = 0.15; g.add(hs);
  // canal toward the Gulf (+X)
  const canal = new THREE.Mesh(new THREE.PlaneGeometry(90, 6), waterMat(WATER, [18, 1.2])); canal.rotation.x = -Math.PI / 2; canal.position.set(R + 44, 0.62, 0); canal.userData.noOutline = true; g.add(canal);
  let rg = null; if (o.rig !== false) { rg = rig(); rg.position.set(...(o.rigAt || [0, 0, 0])); g.add(rg); }
  return { stage: st, sky, group: g, water, rig: rg, canal, trees, house: hs, R, update(t) { sky?.update(t); water.flow(t); canal.material.userData.tex.offset.x = t * 0.15; } };
}

// ---------- cross-section (the drill down to the mine) ----------
// A cut-away slab facing the camera (+Z): sky + water on top, mud, rock strata, then the white salt dome with the mine's
// room-and-pillar tunnels (lamps). Depth is NOT to scale (the lake was ~10 ft, the mine level ~1,300 ft).
const strataTex = () => cached('strata', () => canvasTex(256, 512, (g, w, h) => { const cs = ['#b98a5a', '#a87a4e', '#c79a68', '#9a6e46', '#b48456']; let y = 0; const q = rng(2); while (y < h) { const t = 18 + q() * 40; g.fillStyle = cs[Math.floor(q() * cs.length)]; g.fillRect(0, y, w, t); y += t; }
  g.fillStyle = 'rgba(60,40,20,.25)'; for (let i = 0; i < 90; i++) { g.beginPath(); g.arc(q() * w, q() * h, 2 + q() * 4, 0, 7); g.fill(); } }, { repeat: [1, 1] }));
const saltTex = () => cached('salt', () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#eee6ea'; g.fillRect(0, 0, w, h); const q = rng(6); for (let i = 0; i < 70; i++) { g.fillStyle = q() < 0.5 ? 'rgba(255,255,255,.8)' : 'rgba(220,180,200,.45)'; const x = q() * w, y = q() * h, s = 4 + q() * 10; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.fill(); } }, { repeat: [3, 3] }));
export function section(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: 14, target: [0, -6, 0], shadow: true });
  const sky = sunnySky(st, { clouds: 5, seed: 9 });
  const g = new THREE.Group(); st.add(g); const W = 26, Dp = 6, F = Dp / 2;
  const WD = 1.4; // water depth (cartoon)
  const water = new THREE.Mesh(new THREE.BoxGeometry(W, WD, Dp), toon(WATER, { transparent: true, opacity: 0.85, emissive: new THREE.Color(WATER), emissiveIntensity: 0.2 })); water.position.y = WD / 2; water.userData.noOutline = true; g.add(water);
  const top = waterDisc(1, WATER); top.geometry = new THREE.PlaneGeometry(W, Dp); top.position.y = WD + 0.01; g.add(top);
  const mud = box(W, 0.6, Dp, '#6a4a30', 0, -0.3, 0); mud.userData.noOutline = true; g.add(mud);
  const rockH = 13; const rock = new THREE.Mesh(new THREE.BoxGeometry(W, rockH, Dp), [0, 0, 0, 0, PR.texMat(strataTex()), 0].map(m => m || toon('#9a6e46'))); rock.position.y = -0.6 - rockH / 2; rock.userData.noOutline = true; g.add(rock);
  // salt dome front: an ellipse cut into the strata face (a flat shape just in front of it) + the mine level inside it
  const dome = new THREE.Shape(); dome.absellipse(0, 0, 9, 9.5, 0, Math.PI * 2); const dm = new THREE.Mesh(new THREE.ShapeGeometry(dome, 48), PR.texMat(saltTex())); dm.position.set(0, -14, F + 0.02); dm.userData.noOutline = true; g.add(dm);
  const domeRim = new THREE.Mesh(new THREE.RingGeometry(1, 1.035, 64), flat('#2a1c15')); domeRim.scale.set(9, 9.5, 1); domeRim.position.set(0, -14, F + 0.03); g.add(domeRim);
  // mine level: dark rooms separated by pillars, warm lamps
  const mineY = -9.0; const rooms = [];
  for (let i = -3; i <= 3; i++) { const r = box(1.6, 1.3, 0.05, '#2a2430', i * 2.1, mineY, F + 0.04); r.userData.noOutline = true; g.add(r); rooms.push(r);
    const l = ball(0.12, '#fff2a0', i * 2.1, mineY + 0.5, F + 0.1, 8); l.material = toon('#fff2a0', { emissive: new THREE.Color('#ffe080'), emissiveIntensity: 1 }); l.userData.noOutline = true; g.add(l); }
  const tun = box(14.2, 0.5, 0.05, '#2a2430', 0, mineY - 0.4, F + 0.035); tun.userData.noOutline = true; g.add(tun);
  const shaft = box(1.0, 9, 0.05, '#2a2430', 7.6, mineY + 4.0, F + 0.04); shaft.userData.noOutline = true; g.add(shaft);
  // flood fill inside the mine (grows on cue)
  const flood = box(14.2, 1.7, 0.05, WATER, 0, mineY - 0.65, F + 0.06); flood.material = toon(WATER, { emissive: new THREE.Color(WATER), emissiveIntensity: 0.3 }); flood.userData.noOutline = true; flood.scale.set(0.001, 1, 1); g.add(flood);
  // drill string from the rig to the bit (length grows) + a stream of water down the hole (on cue)
  const pipe = cyl(0.2, 0.2, 1, '#5a5a62', 0, 0, F - 0.4, 8); pipe.userData.noOutline = true; g.add(pipe);
  const bit = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.6, 10), toon('#c9a14a')); bit.rotation.x = Math.PI; bit.position.z = F - 0.4; g.add(bit);
  const stream = cyl(0.3, 0.3, 1, WATER, 0, 0, F - 0.3, 10); stream.material = toon(WATER, { emissive: new THREE.Color(WATER), emissiveIntensity: 0.4 }); stream.userData.noOutline = true; stream.visible = false; g.add(stream);
  const rg = rig(); rg.scale.setScalar(0.55); rg.position.set(0, WD - 0.2, F - 0.9); g.add(rg);
  // shore edges left/right (grass on top)
  for (const s of [-1, 1]) { const b = box(40, 1.6, Dp, GRASS, s * (W / 2 + 20), 0.8, 0); b.userData.noOutline = true; g.add(b); const r2 = new THREE.Mesh(new THREE.BoxGeometry(40, rockH + 1.6, Dp), toon('#9a6e46')); r2.position.set(s * (W / 2 + 20), -rockH / 2 - 0.0, -0.01); r2.userData.noOutline = true; g.add(r2); }
  const setDrill = (yBit) => { const top = WD + 0.3, len = top - yBit; pipe.scale.y = len; pipe.position.y = top - len / 2; bit.position.y = yBit; };
  setDrill(-2);
  return { stage: st, sky, group: g, water, top, rig: rg, pipe, bit, stream, flood, rooms, mineY, WD, F, setDrill,
    // drain k 0..1: water level drops, stream through the hole, mine floods
    drain(k) { const lv = Math.max(0.05, WD * (1 - k)); water.scale.y = lv / WD; water.position.y = lv / 2; top.position.y = lv + 0.01; rg.position.y = lv - 0.2 - k * 0.6; rg.rotation.z = k * 0.35;
      stream.visible = k > 0.01; const sTop = lv, sBot = mineY - 1.4; stream.scale.set(0.6 + k * 1.2, sTop - sBot, 0.6 + k * 1.2); stream.position.y = (sTop + sBot) / 2; flood.scale.x = Math.max(0.001, ease.out(clamp(k * 1.6))); },
    update(t) { sky.update(t); top.flow(t); } };
}

// ---------- the drained lake bed + the waterfall from the reversed canal ----------
const fallTex = () => cached('fall', () => canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#5ab0e0'; g.fillRect(0, 0, w, h); const q = rng(4); for (let i = 0; i < 40; i++) { g.fillStyle = q() < 0.5 ? 'rgba(255,255,255,.6)' : 'rgba(40,110,170,.4)'; g.fillRect(q() * w, q() * h, 3 + q() * 6, 30 + q() * 70); } }));
export function crater(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 46, shadowSize: 30, target: [0, -10, 0] });
  const sky = sunnySky(st, { clouds: 7, seed: 11 });
  const g = new THREE.Group(); st.add(g);
  // bowl: concave lathe of wet mud, rim at y=0 radius 30, floor at y=-22
  const prof = []; for (let i = 0; i <= 20; i++) { const k = i / 20; prof.push(new THREE.Vector2(2 + k * 28, -22 * (1 - Math.pow(k, 6)))); }
  const mudTex = canvasTex(256, 256, (gg, w, h) => { gg.fillStyle = '#8a6a48'; gg.fillRect(0, 0, w, h); const q = rng(8); for (let i = 0; i < 120; i++) { gg.fillStyle = q() < 0.5 ? 'rgba(60,40,24,.35)' : 'rgba(200,170,130,.25)'; gg.beginPath(); gg.ellipse(q() * w, q() * h, 6 + q() * 16, 3 + q() * 6, 0, 0, 7); gg.fill(); } }, { repeat: [6, 2] });
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), toon('#ffffff', { map: mudTex, side: THREE.DoubleSide })); bowl.receiveShadow = true; bowl.userData.noOutline = true; g.add(bowl);
  const pool = waterDisc(18, SALT); pool.position.y = -21.3; g.add(pool);
  const sh = shore(30, { h: 0.2 }); g.add(sh);
  const q = rng(3); for (let i = 0; i < 30; i++) { const a = q() * 6.28, r = 33 + q() * 18; if (Math.cos(a) > 0.85) continue; const t = oak({ s: 1.2 + q() * 0.6, seed: i + 20 }); t.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r); g.add(t); }
  // the canal comes in from +X and pours over the rim at x = 30
  const canal = new THREE.Mesh(new THREE.PlaneGeometry(60, 7), waterMat(SALT, [12, 1.4])); canal.rotation.x = -Math.PI / 2; canal.position.set(60, 0.25, 0); canal.userData.noOutline = true; g.add(canal);
  const ft = fallTex().clone(); ft.needsUpdate = true; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(3, 2);
  const fallGeo = new THREE.PlaneGeometry(7, 1, 1, 20); const fp = fallGeo.attributes.position;
  for (let i = 0; i < fp.count; i++) { const v = fp.getY(i) + 0.5; /* 1 top .. 0 bottom */ const d = 1 - v; fp.setXYZ(i, fp.getX(i), -d * 21, -Math.pow(d, 0.5) * 6 - d * 2); }
  fallGeo.computeVertexNormals(); const fall = new THREE.Mesh(fallGeo, toon('#ffffff', { map: ft, side: THREE.DoubleSide, emissive: new THREE.Color('#3a90c8'), emissiveIntensity: 0.35 })); fall.rotation.y = Math.PI / 2; fall.position.set(30.2, 0.25, 0); fall.userData.noOutline = true; g.add(fall);
  // spray puffs at the foot of the fall
  const spray = []; for (let i = 0; i < 14; i++) { const b = ball(1 + q() * 1.2, '#ffffff', 0, 0, 0, 10); b.material = toon('#ffffff', { transparent: true, opacity: 0.85, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3 }); b.userData.noOutline = true; b.ph = q(); b.dz = (q() - 0.5) * 8; g.add(b); spray.push(b); }
  // geysers from the mine shafts on land (white columns that rise on cue)
  const geys = []; for (const [x, z] of [[46, -16], [54, 12]]) { const c = cyl(1.0, 1.6, 1, '#f4fbff', x, 0, z, 12); c.material = toon('#f4fbff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.25 }); c.userData.noOutline = true; c.scale.y = 0.01; g.add(c);
    const top = ball(2.2, '#f4fbff', x, 0, z, 12); top.material = c.material; top.userData.noOutline = true; g.add(top); geys.push({ c, top }); }
  return { stage: st, sky, group: g, fall, pool, canal, spray, geys,
    update(t, o2 = {}) { sky.update(t); ft.offset.y = t * 1.4; canal.material.userData.tex.offset.x = -t * 0.4; pool.flow(t, 0.05);
      spray.forEach((b, i) => { const k = (t * 0.7 + b.ph) % 1; b.position.set(22 - k * 6, -21 + k * 4, b.dz); b.scale.setScalar(0.6 + k * 1.2); b.material.opacity = 0.85 * (1 - k); });
      const gk = o2.geyser ?? 0; geys.forEach(({ c, top }, i) => { const h = gk * (26 + i * 6) * (1 + Math.sin(t * 9 + i) * 0.04); c.scale.y = Math.max(0.01, h); c.position.y = h / 2; top.position.y = h; top.scale.setScalar(gk > 0.02 ? 1 + Math.sin(t * 7 + i) * 0.1 : 0.001); }); } };
}
