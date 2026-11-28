// The Russian Woodpecker — shared assets: the Duga antenna wall (lattice masts in a snowy pine forest), a 1970s shortwave
// radio, a cartoon woodpecker (the nickname made visible), a listener in an armchair, a ham operator, a grey official,
// plus 2D overlays (hook text with coloured words, stamps, TAP bursts, tuning dial, triangulation map, horizon arc, snow).
// Tone guard: Chernobyl only as a place name; no reactor/radiation imagery; no real flags or emblems.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- DUGA ANTENNA WALL
// lattice texture: a grid of steel members + diagonal bracing + rows of antenna elements, transparent between
function latticeTex(o = {}) {
  const col = o.color || '#5a4a44', W = 1024, H = 512;
  return canvasTex(W, H, (g) => {
    g.clearRect(0, 0, W, H); g.strokeStyle = col; g.lineCap = 'square';
    const cx = 16, cy = 8, dx = W / cx, dy = H / cy;
    g.lineWidth = 7; for (let i = 0; i <= cx; i++) { g.beginPath(); g.moveTo(i * dx, 0); g.lineTo(i * dx, H); g.stroke(); }
    g.lineWidth = 6; for (let j = 0; j <= cy; j++) { g.beginPath(); g.moveTo(0, j * dy); g.lineTo(W, j * dy); g.stroke(); }
    g.lineWidth = 3; for (let i = 0; i < cx; i++) for (let j = 0; j < cy; j++) { g.beginPath(); if ((i + j) % 2) { g.moveTo(i * dx, j * dy); g.lineTo((i + 1) * dx, (j + 1) * dy); } else { g.moveTo((i + 1) * dx, j * dy); g.lineTo(i * dx, (j + 1) * dy); } g.stroke(); }
    // antenna elements: little horizontal "cages" in each cell
    g.lineWidth = 4; for (let i = 0; i < cx; i++) for (let j = 0; j < cy; j++) { const x = i * dx + dx / 2, y = j * dy + dy / 2; g.beginPath(); g.moveTo(x - dx * 0.38, y); g.lineTo(x + dx * 0.38, y); g.stroke(); g.beginPath(); g.ellipse(x, y, dx * 0.2, dy * 0.12, 0, 0, 7); g.stroke(); }
  }, { transparent: true });
}
// duga({ w, h, rust }) — a long wall of lattice, ~w wide, h tall, facing +Z. Real masts are 3D cylinders; the infill is
// two layers of lattice texture (front + back face) for depth.
export function duga(o = {}) {
  const w = o.w || 44, h = o.h || 20, d = 4, steel = o.rust ? '#7a5444' : '#6a7078';
  const g = new THREE.Group();
  const tex = latticeTex({ color: o.rust ? '#8a5a44' : '#7a8088' }); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(w / 40, h / 22);
  const lat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, fog: true });
  for (const z of [d / 2, -d / 2]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lat); p.position.set(0, h / 2, z); p.userData.noOutline = true; g.add(p); }
  // masts every ~4 units, front and back, + cross ties on top
  const masts = [];
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 10) for (const z of [d / 2, -d / 2]) { const m = cyl(0.35, 0.5, h + 0.6, steel, x, (h + 0.6) / 2, z, 8); g.add(m); masts.push(m); }
  for (let y = 0.5; y <= h + 0.3; y += h / 4) for (const z of [d / 2, -d / 2]) { const b = cyl(0.25, 0.25, w, steel, 0, y, z, 6); b.rotation.z = Math.PI / 2; g.add(b); }
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 10) { const b = cyl(0.1, 0.1, d, steel, x, h + 0.2, 0, 6); b.rotation.x = Math.PI / 2; g.add(b); }
  // small red aircraft-warning lights on top
  const lamps = []; for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 5) { const l = ball(0.6, '#ff3b30', x, h + 0.6, d / 2, 10); l.material = flat('#ff3b30'); l.userData.noOutline = true; g.add(l); lamps.push(l); }
  outline(g, { px: 2.0 });
  g.H = h; g.W = w; g.lamps = lamps;
  g.update = (t, u = {}) => { const on = u.lamps ?? 1; lamps.forEach((l, i) => { l.visible = on > 0 && Math.sin(t * 3 + i) > -0.2; }); };
  return g;
}
// pine tree: stacked cones, snow caps
export function pine(o = {}) {
  const g = new THREE.Group(), h = o.h || 6, c = o.color || '#2f5a46', snow = o.snow !== false;
  g.add(cyl(0.18, 0.24, h * 0.3, '#5a3e2e', 0, h * 0.15, 0, 7));
  for (let i = 0; i < 3; i++) { const r = (1 - i * 0.25) * h * 0.26, ch = h * 0.42, y = h * 0.22 + i * h * 0.22;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, ch, 9), toon(i % 2 ? shadeHex(c, 0.06) : c)); cone.position.y = y + ch / 2; cone.castShadow = true; g.add(cone);
    if (snow) { const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, ch * 0.42, 9), toon('#f4f8ff')); cap.position.y = y + ch - ch * 0.21 + 0.02; g.add(cap); } }
  outline(g, { px: 1.8 }); return g;
}
// snowy forest set around the wall: snow floor, pines, dusk sky (gradient bg), the wall set back
export function dugaSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(400, 400, o.ground || '#dfe8f2', 0, -60));
  const wall = duga({ w: o.w || 60, h: o.h || 22, rust: o.rust }); wall.position.set(o.wx ?? 0, 0, o.wz ?? -26); g.add(wall);
  const wz = o.wz ?? -26;
  const r = rng(o.seed || 5);
  for (let i = 0; i < (o.trees ?? 110); i++) { const x = (r() - 0.5) * 160, z = -4 - r() * 90; if (Math.abs(z - wz) < 5 && Math.abs(x) < (o.w || 60) / 2 + 2) continue; if (Math.abs(x) < 7 && z > wz + 4) continue; /* clear corridor for the cameras */ const p = pine({ h: 5 + r() * 6, color: r() < 0.5 ? '#2f5a46' : '#264c3c' }); p.position.set(x, 0, z); p.rotation.y = r() * 6; g.add(p); }
  // foreground pines framing the sides
  for (const [x, z, h] of (o.front || [[-7.5, 1, 8], [8, 0, 9], [-10, -4, 10], [10.5, -6, 9]])) { const p = pine({ h }); p.position.set(x, 0, z); g.add(p); }
  // snow mounds
  for (let i = 0; i < 14; i++) { const b = ball(1 + r() * 1.5, '#eef3fa', (r() - 0.5) * 30, -0.5, -2 - r() * 20, 12); b.scale.y = 0.35; g.add(b); }
  return { group: g, wall, update(t, u) { wall.update(t, u); } };
}
// expanding pulse rings (3D, emissive, no outline) from a point; fire every `period` s
export function pulseRings(st, o = {}) {
  const n = o.n || 5, col = o.color || '#9fe8ff', rings = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, o.thick || 0.12, 6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(col), transparent: true, depthWrite: false, fog: false })); m.userData.noOutline = true; st.add(m); rings.push(m); }
  const api = { rings, update(t, u = {}) { const p = u.period ?? 0.5, life = p * n, on = u.on ?? 1, pos = u.pos || o.pos || [0, 10, -26];
    rings.forEach((m, i) => { const age = ((t + i * p) % life + life) % life, k = age / life; m.position.set(...pos); m.rotation.x = o.flat ? -Math.PI / 2 : 0; m.scale.setScalar(lerp(o.r0 || 4, o.r1 || 40, k)); m.material.opacity = on * (1 - k) * (o.alpha ?? 0.85); m.visible = on > 0; }); } };
  return api;
}

// ---------------------------------------------------------------- RADIO (1970s shortwave)
const grilleTex = () => canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#d8cfb8'; g.fillRect(0, 0, W, H); g.fillStyle = '#2a2420'; for (let y = 12; y < H; y += 20) for (let x = 12 + ((y / 20) % 2) * 10; x < W; x += 20) { g.beginPath(); g.arc(x, y, 5.5, 0, 7); g.fill(); } });
const dialTex = (o = {}) => canvasTex(512, 128, (g, W, H) => { g.fillStyle = '#f6e7b8'; g.fillRect(0, 0, W, H); g.strokeStyle = '#3a2a1a'; g.fillStyle = '#3a2a1a'; g.lineWidth = 3;
  for (let i = 0; i <= 40; i++) { const x = 16 + i * (W - 32) / 40; g.beginPath(); g.moveTo(x, 18); g.lineTo(x, i % 5 ? 36 : 50); g.stroke(); }
  g.font = '700 26px "Fredoka", sans-serif'; g.textAlign = 'center'; ['3', '5', '7', '9', '11', '13', '15', '17', '19'].forEach((s, i) => g.fillText(s, 16 + i * (W - 32) / 8, 84));
  g.font = '700 22px "Fredoka", sans-serif'; g.fillText('SHORTWAVE  MHz', W / 2, 116); });
// radio({ scale, color }) — ~1.2 wide, 0.75 tall, 0.4 deep, faces +Z. update(t, { thump 0..1, needle 0..1 })
export function radio(o = {}) {
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(o.scale || 1);
  const c = o.color || '#8a5a36';
  const body = rbox(1.2, 0.72, 0.42, c, 0, 0.36, 0, 0.06); g.add(body);
  const face = rbox(1.12, 0.64, 0.02, '#e8dcc0', 0, 0.36, 0.21, 0.02); g.add(face);
  const gr = new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), toon('#ffffff', { map: grilleTex() })); gr.position.set(-0.3, 0.36, 0.225); gr.userData.noOutline = true; g.add(gr);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.02, 6, 32), toon('#b89a5a')); ring.position.copy(gr.position); g.add(ring);
  const dl = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.16), toon('#ffffff', { map: dialTex(), emissive: new THREE.Color('#ffcf7a'), emissiveIntensity: 0.25 })); dl.position.set(0.22, 0.5, 0.225); dl.userData.noOutline = true; g.add(dl);
  const needle = rbox(0.012, 0.15, 0.01, '#d8342c', 0.22, 0.5, 0.232, 0.004); needle.userData.noOutline = true; g.add(needle);
  const knobs = [0.06, 0.38].map(x => { const k = cyl(0.07, 0.075, 0.06, '#3a2a22', x, 0.24, 0.24, 16); k.rotation.x = Math.PI / 2; g.add(k); return k; });
  const light = ball(0.025, '#ff5040', 0.5, 0.24, 0.23, 8); light.material = flat('#ff5040'); light.userData.noOutline = true; g.add(light);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 20, Math.PI), toon('#2a2220')); handle.position.set(0, 0.72, 0); g.add(handle);
  const ant = cyl(0.012, 0.018, 1.1, '#c9ccd2', 0.45, 1.2, -0.1, 6); ant.rotation.z = -0.35; g.add(ant);
  const antTip = ball(0.03, '#c9ccd2', 0.45 + Math.sin(0.35) * 0.55, 1.2 + Math.cos(0.35) * 0.55, -0.1, 8); g.add(antTip);
  // optional "WOODPECKER BLANKER" button
  let btn = null;
  if (o.blanker) { btn = cyl(0.07, 0.07, 0.06, '#d8342c', 0.22, 0.24, 0.25, 16); btn.rotation.x = Math.PI / 2; g.add(btn); }
  outline(g, { px: 2.4 }); const bl = blob(0.8, 0.3); root.add(bl);
  root.update = (t, u = {}) => { const th = u.thump || 0; const k = th * Math.max(0, Math.sin(t * Math.PI * 20)) ;   // 10 Hz bumps
    g.position.y = k * 0.025; g.scale.setScalar((o.scale || 1) * (1 + k * 0.012)); gr.scale.setScalar(1 + k * 0.08); ring.scale.copy(gr.scale);
    needle.position.x = lerp(0.0, 0.44, u.needle ?? 0.5); light.visible = (u.light ?? 1) > 0; if (btn) btn.position.z = 0.25 - (u.press || 0) * 0.04; };
  root.body = g; root.gr = gr; root.btn = btn; root.update(0); return root;
}

// ---------------------------------------------------------------- WOODPECKER (cartoon; the nickname)
function lidEye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.12, size * 0.62); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#120c10')); p.scale.set(0.46, 0.5, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.13, 0.13, 0.05); gl.position.set(0.14, 0.18, 0.99); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}
// woodpecker({ scale }) — stands ~0.8 tall, faces +Z. update(t, { peck 0..1 (10 Hz head bob), lid, look, headTurn, cork })
export function woodpecker(o = {}) {
  const root = new THREE.Group(), g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const blk = toon('#24232a'), wht = toon('#f4f1ea'), red = toon('#d8342c');
  const bodyG = new THREE.Group(); bodyG.position.y = 0.32; g.add(bodyG);
  const body = mesh(sph, blk, 0.2, 0.26, 0.2); bodyG.add(body);
  const belly = mesh(sph, wht, 0.15, 0.2, 0.1); belly.position.set(0, -0.03, 0.12); bodyG.add(belly);
  for (const s of [-1, 1]) { const wg = mesh(sph, blk, 0.07, 0.2, 0.16); wg.position.set(s * 0.18, 0.0, -0.02); wg.rotation.z = s * 0.15; bodyG.add(wg);
    for (let i = 0; i < 3; i++) { const sp = mesh(sph, wht, 0.02, 0.025, 0.02); sp.position.set(s * 0.24, 0.06 - i * 0.07, 0.02); sp.userData.noOutline = true; bodyG.add(sp); } }
  const tail = mesh(new THREE.ConeGeometry(0.08, 0.3, 6), blk); tail.position.set(0, -0.26, -0.14); tail.rotation.x = -2.6; bodyG.add(tail);
  const neck = new THREE.Group(); neck.position.set(0, 0.22, 0.03); bodyG.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.12, 0); neck.add(head);
  const hs = mesh(sph, wht, 0.17, 0.16, 0.16); head.add(hs);
  const cap = mesh(sph, blk, 0.172, 0.08, 0.165); cap.position.y = 0.07; head.add(cap);
  const crest = mesh(new THREE.ConeGeometry(0.08, 0.2, 8), red); crest.position.set(0, 0.17, -0.06); crest.rotation.x = -0.6; head.add(crest);
  const crest2 = mesh(sph, red, 0.09, 0.06, 0.1); crest2.position.set(0, 0.12, -0.08); head.add(crest2);
  const beak = mesh(new THREE.ConeGeometry(0.045, 0.26, 10).rotateX(Math.PI / 2), toon('#3a3a42')); beak.position.set(0, -0.02, 0.26); head.add(beak);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.08, 0.02, 0.12), new THREE.Vector3(s * 0.5, 0.05, 0.86).normalize(), 0.06, '#3a3a42'));
  for (const s of [-1, 1]) { const f = mesh(sph, toon('#7a6a5a'), 0.05, 0.025, 0.07); f.position.set(s * 0.08, 0.04, 0.03); g.add(f); }
  // cork (blanker gag): a little cork on the beak tip
  const cork = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.09, 12).rotateX(Math.PI / 2), toon('#c89a5a')); cork.position.set(0, -0.02, 0.4); cork.visible = false; head.add(cork);
  outline(g, { px: 2.6 }); const bl = blob(0.25, 0.25); root.add(bl);
  const blinkAt = (t) => { const tt = (t + 0.7) % 2.7; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => { const pk = u.peck || 0, ph = (t * 10) % 1;
    const bob = pk * (ph < 0.35 ? Math.sin(ph / 0.35 * Math.PI) : 0);
    neck.rotation.x = 0.15 + bob * 0.75 + (u.nod || 0); head.rotation.set(-bob * 0.1, u.headTurn || 0, u.headTilt || 0);
    bodyG.rotation.x = bob * 0.12 + (u.lean || 0); cork.visible = !!u.cork;
    const b = blinkAt(t); eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(u.lid ?? 0.25, b)); e.roll.rotation.z = (i ? 1 : -1) * (u.lidAngle || 0); e.pg.rotation.set(-(u.look?.[1] || 0) * 0.45, (u.look?.[0] || 0) * 0.55, 0); });
    crest.rotation.x = -0.6 + bob * 0.3; };
  root.head = head; root.headR = 0.18 * (o.scale || 1); root.update(0); return root;
}

// ---------------------------------------------------------------- PEOPLE
export function listener(o = {}) { return bean({ name: 'Listener', outfit: 'tee', skin: 'fair', hair: 'curly', hairColor: '#6a3a1e', colors: { main: '#c8742a', legs: '#5a4630' }, seed: 21, ...(o.over || {}) }); }
export function ham(o = {}) { const b = bean({ name: 'Ham', outfit: 'labcoat', skin: 'tan', hair: 'horseshoe', hairColor: '#8a8580', glasses: true, colors: { main: '#6a8aa8', legs: '#3a3f4a' }, seed: 31 }); headphones(b); return b; }
export function official(o = {}) { return bean({ name: 'Official', outfit: 'uniform', head: 'none', skin: 'light', hair: 'swoop', hairColor: '#5a5048', colors: { main: '#6a6e74', legs: '#4a4e54' }, seed: 41 }); }
export function guard(o = {}) { return bean({ name: 'Guard', outfit: 'uniform', head: 'beanie', headColor: '#5a5e48', skin: 'fair', hair: 'bowl', colors: { main: '#5a6248', legs: '#3f4434' }, seed: 51 }); }
export function headphones(b) { const h = b.parts.head, R = 0.48; const band = new THREE.Mesh(new THREE.TorusGeometry(R * 1.08, 0.04, 6, 24, Math.PI), toon('#2a2a30')); band.position.y = 0.0; h.add(band);
  for (const s of [-1, 1]) { const cup = cyl(0.17, 0.17, 0.12, '#2a2a30', s * R * 1.05, -0.02, 0, 16); cup.rotation.z = Math.PI / 2; h.add(cup); }
  outline(band, { px: 2.6 }); return b; }
// armchair (70s, mustard), seat height ~0.55
export function armchair(o = {}) { const g = new THREE.Group(), c = o.color || '#c8962a';
  g.add(rbox(1.5, 0.45, 1.2, c, 0, 0.32, 0, 0.12), rbox(1.5, 1.3, 0.3, c, 0, 0.85, -0.5, 0.14), rbox(0.28, 0.75, 1.2, shadeHex(c, -0.08), -0.75, 0.55, 0, 0.12), rbox(0.28, 0.75, 1.2, shadeHex(c, -0.08), 0.75, 0.55, 0, 0.12));
  for (const [x, z] of [[-0.6, 0.45], [0.6, 0.45], [-0.6, -0.5], [0.6, -0.5]]) g.add(cyl(0.05, 0.03, 0.12, '#4a3020', x, 0.06, z, 8));
  outline(g, { px: 2.4 }); return g; }
// 1970s living room: patterned wallpaper, wood floor, window with a night sky, side table, lamp
export function livingRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), PR.texMat(PR.TEX.planks('#8a5a36', [6, 4], 6))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const wp = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#d8a050'; x.fillRect(0, 0, W, H); x.fillStyle = '#c47a2e'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(i * 64 + 32, j * 64 + 32, 22, 0, 7); x.fill(); } x.fillStyle = '#e8c070'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(i * 64 + 32, j * 64 + 32, 10, 0, 7); x.fill(); } });
  wp.wrapS = wp.wrapT = THREE.RepeatWrapping; wp.repeat.set(8, 3);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), toon('#ffffff', { map: wp })); wall.position.set(0, 4.5, -3); wall.receiveShadow = true; g.add(wall);
  const win = canvasTex(256, 256, (x, W, H) => { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#16204a'); gr.addColorStop(1, '#3a4a8a'); x.fillStyle = gr; x.fillRect(0, 0, W, H); x.fillStyle = '#fff6c8'; const r = rng(4); for (let i = 0; i < 30; i++) { x.fillRect(r() * W, r() * H * 0.7, 3, 3); } x.beginPath(); x.arc(W * 0.75, H * 0.25, 22, 0, 7); x.fill(); });
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.0), toon('#ffffff', { map: win, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3 })); wm.position.set(o.winX ?? 2.6, 3.4, -2.97); wm.userData.noOutline = true; g.add(wm);
  g.add(rbox(2.6, 0.12, 0.15, '#5a3a22', wm.position.x, 2.35, -2.9, 0.02), rbox(2.6, 0.12, 0.15, '#5a3a22', wm.position.x, 4.45, -2.9, 0.02), rbox(0.1, 2.2, 0.12, '#5a3a22', wm.position.x, 3.4, -2.9, 0.02));
  const tbl = PR.table({ w: 1.0, d: 0.7, h: 0.8, color: '#6a4228' }); tbl.position.set(o.tblX ?? 1.3, 0, o.tblZ ?? 0.1); g.add(tbl);
  const rug = PR.rug({ w: 4, d: 3, color: '#7a3a2a', trim: '#e0a040' }); rug.position.set(0, 0.01, 0.5); g.add(rug);
  const lamp = new THREE.Group(); lamp.add(cyl(0.03, 0.03, 2.2, '#3a2a22', 0, 1.1, 0, 6), cyl(0.25, 0.45, 0.5, '#f0d090', 0, 2.3, 0, 16), cyl(0.3, 0.3, 0.05, '#3a2a22', 0, 0.03, 0, 12)); lamp.position.set(-2.2, 0, -1.6); outline(lamp, { px: 2 }); g.add(lamp);
  outline(tbl, { px: 2.4 });
  return { group: g, tableY: 0.82, tblPos: tbl.position, update() {} };
}
// ham shack: desk, stacked radio gear, a mic; cool-blue wall with QSL-card squares
export function hamShack(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#5a5a62', 0, 0));
  const wall = plane(30, 9, '#4a6a8a', 0, 4.5, -2.5); wall.receiveShadow = true; g.add(wall);
  const r = rng(9); for (let i = 0; i < 14; i++) { const c = plane(0.55, 0.38, ['#f2ead6', '#ffd25a', '#9fe8ff', '#f2a0a0'][i % 4], -3.5 + (i % 7) * 1.1 + r() * 0.2, 3.6 + Math.floor(i / 7) * 0.6, -2.48); c.rotation.z = (r() - 0.5) * 0.2; g.add(c); }
  const desk = PR.table({ w: 3.4, d: 1.2, h: 0.95, color: '#6a5040' }); desk.position.set(0, 0, -1.2); g.add(desk);
  const gear = [rbox(1.3, 0.5, 0.6, '#3a3e44', -0.8, 1.27, -1.4, 0.04), rbox(1.1, 0.42, 0.6, '#2e3236', 0.7, 1.23, -1.4, 0.04), rbox(1.0, 0.36, 0.55, '#4a4e54', -0.8, 1.7, -1.4, 0.04)];
  gear.forEach(m => g.add(m));
  const faceT = canvasTex(256, 96, (x, W, H) => { x.fillStyle = '#1a1e22'; x.fillRect(0, 0, W, H); x.fillStyle = '#7fff9a'; x.fillRect(20, 20, 130, 40); x.fillStyle = '#c9ccd2'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(180 + i * 26, 60, 9, 0, 7); x.fill(); } });
  const fm = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.42), toon('#ffffff', { map: faceT, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35 })); fm.position.set(-0.8, 1.27, -1.09); fm.userData.noOutline = true; g.add(fm);
  const mic = new THREE.Group(); mic.add(cyl(0.12, 0.14, 0.04, '#2a2a30', 0, 0.02, 0, 12), cyl(0.015, 0.015, 0.35, '#c9ccd2', 0, 0.2, 0, 6), ball(0.07, '#2a2a30', 0, 0.4, 0, 10)); mic.position.set(0.5, 0.98, -0.9); g.add(mic);
  outline(g, { px: 2.2 });
  return { group: g, update() {} };
}
// grey office (the official): desk, lamp, filing cabinet, a closed door. No flags/emblems.
export function office(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#4a4440', 0, 0));
  const wall = plane(30, 9, '#6a6e66', 0, 4.5, -3); wall.receiveShadow = true; g.add(wall);
  g.add(plane(30, 1.4, '#545850', 0, 0.7, -2.98));
  const desk = PR.table({ w: 3.0, d: 1.2, h: 1.0, color: '#4a3424' }); desk.position.set(0, 0, 0.4); g.add(desk);
  const cab = rbox(1.0, 2.2, 0.8, '#7a7e78', 2.8, 1.1, -2.4, 0.04); g.add(cab); for (let i = 0; i < 3; i++) g.add(rbox(0.3, 0.06, 0.06, '#c9ccd2', 2.8, 0.5 + i * 0.7, -1.98, 0.02));
  const lamp = new THREE.Group(); lamp.add(cyl(0.12, 0.14, 0.04, '#2a3a2a', 0, 0.02, 0, 12), cyl(0.015, 0.015, 0.5, '#2a3a2a', 0, 0.27, 0, 6), cyl(0.06, 0.2, 0.18, '#2a5a3a', 0.1, 0.52, 0, 14)); lamp.position.set(-1.0, 1.06, 0.3); g.add(lamp);
  const phone = rbox(0.35, 0.12, 0.25, '#2a2422', 0.9, 1.12, 0.3, 0.03); g.add(phone);
  const papers = PR.papers({ n: 4, seed: 2, spread: 0.6 }); papers.position.set(0.1, 1.06, 0.5); g.add(papers);
  outline(g, { px: 2.2 });
  return { group: g, tableY: 1.06, update() {} };
}

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text with per-word colours: lines = [[['the', '#fff'], ['Woodpecker', '#ffd25a']], ...]
export function hookWords(g, t, lines, o = {}) {
  const y0 = o.y ?? 290, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); const sz = (o.sizes && o.sizes[i]) || o.size || 70;
    g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (sz * 1.35)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
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
// "TAP" bursts on the 10 Hz grid around a screen point
export function tapBursts(g, t, o = {}) {
  const on = o.on ?? 1; if (on <= 0) return; const r = rng(o.seed || 3); const cx = o.x ?? 540, cy = o.y ?? 900, rad = o.r ?? 260;
  const slots = []; for (let i = 0; i < 12; i++) slots.push([r() * Math.PI * 2, 0.75 + r() * 0.5, (r() - 0.5) * 0.5]);
  const n = Math.floor(t * 10); for (let j = 0; j < 4; j++) { const idx = n - j; if (idx < 0) continue; const age = t - idx / 10; const [a, rr, rot] = slots[((idx % 12) + 12) % 12];
    const k = ease.outBack(clamp(age / 0.08)), f = clamp(1 - (age - 0.12) / 0.28); if (f <= 0) continue;
    g.save(); g.globalAlpha = f * on; g.translate(cx + Math.cos(a) * rad * rr, cy + Math.sin(a) * rad * rr * 0.75); g.rotate(rot); g.scale(k, k);
    insT(g, o.word || 'TAP', 0, 0, o.size || 70, { color: o.color || '#ffd25a', stroke: CARD_INK }); g.restore(); }
}
// concentric "signal" arcs radiating from a screen point (2D, used on cards and close-ups)
export function signalArcs(g, t, x, y, o = {}) {
  const n = o.n || 4, p = o.period || 0.1 * 4, col = o.color || '#9fe8ff';
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const k = ((t / p + i / n) % 1); g.globalAlpha = (1 - k) * (o.a ?? 0.9); g.strokeStyle = col; g.lineWidth = (o.w || 12) * (1 - k * 0.5);
    g.beginPath(); g.arc(x, y, (o.r0 || 40) + k * (o.r1 || 300), (o.a0 ?? -0.9), (o.a1 ?? 0.9)); g.stroke();
    if (o.both) { g.beginPath(); g.arc(x, y, (o.r0 || 40) + k * (o.r1 || 300), Math.PI - (o.a1 ?? 0.9), Math.PI - (o.a0 ?? -0.9)); g.stroke(); } }
  g.restore();
}
// tuning-dial card: bands NEWS / HAM / AVIATION; a woodpecker mark hops from band to band at the given times
export function dialCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const W = 960, H = 640;
  g.save(); g.translate(E.W / 2, o.y ?? 860); g.scale(k, k); g.rotate(-0.02);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 30); g.fill();
  g.fillStyle = '#6a4228'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 30); g.fill(); g.stroke();
  g.fillStyle = '#f6e7b8'; g.beginPath(); g.roundRect(-W / 2 + 50, -H / 2 + 120, W - 100, 300, 18); g.fill(); g.lineWidth = 6; g.stroke();
  insT(g, 'SHORTWAVE', 0, -H / 2 + 62, 58, { color: '#f6e7b8', stroke: null });
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 4; for (let i = 0; i <= 50; i++) { const x = -W / 2 + 80 + i * (W - 160) / 50; g.beginPath(); g.moveTo(x, -H / 2 + 140); g.lineTo(x, -H / 2 + (i % 5 ? 170 : 190)); g.stroke(); }
  const bands = o.bands || [['NEWS', -280], ['HAM', 0], ['AVIATION', 280]];
  bands.forEach(([b, x], i) => { const hit = o.times && t >= o.times[i]; g.fillStyle = hit ? '#d8342c' : '#3a5a8a'; g.beginPath(); g.roundRect(x - 140, -H / 2 + 230, 280, 90, 16); g.fill(); insT(g, b, x, -H / 2 + 277, 50, { color: '#ffffff', stroke: null, maxW: 250 }); });
  // the hopping mark: a little woodpecker head + "TAP"
  const ts = o.times || [0.3, 0.9, 1.5]; let i = 0; for (let j = 0; j < ts.length; j++) if (t >= ts[j]) i = j; const prevX = bands[Math.max(0, i - 1)][1], curX = bands[i][1];
  const hop = clamp((t - ts[i]) / 0.25), x = t < ts[0] ? bands[0][1] - 200 : lerp(i ? prevX : bands[0][1] - 200, curX, ease.out(hop)), y = -H / 2 + 200 - Math.sin(hop * Math.PI) * 120;
  drawPeckerIcon(g, x, y - 40 + (Math.floor(t * 10) % 2) * 6, 58);
  // red needle under the mark
  g.strokeStyle = '#d8342c'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, -H / 2 + 125); g.lineTo(x, -H / 2 + 410); g.stroke();
  insT(g, o.foot || 'JAMMED', 0, H / 2 - 90, 60, { color: '#ffd25a', stroke: null, a: clamp((t - (ts[2] || 1.5)) / 0.2) });
  g.restore();
}
// flat woodpecker head icon (cards)
export function drawPeckerIcon(g, x, y, r) {
  g.save(); g.translate(x, y); g.lineJoin = 'round'; g.lineWidth = Math.max(3, r * 0.09); g.strokeStyle = CARD_INK;
  g.fillStyle = '#d8342c'; g.beginPath(); g.moveTo(-r * 0.6, -r * 0.5); g.quadraticCurveTo(-r * 0.2, -r * 1.35, r * 0.4, -r * 0.7); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#24232a'; g.beginPath(); g.ellipse(0, -r * 0.25, r * 0.62, r * 0.42, 0, Math.PI, 0); g.fill(); g.stroke();
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(0, 0, r * 0.6, r * 0.55, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#3a3a42'; g.beginPath(); g.moveTo(r * 0.45, -r * 0.12); g.lineTo(r * 1.45, r * 0.02); g.lineTo(r * 0.45, r * 0.16); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(r * 0.18, -r * 0.08, r * 0.17, r * 0.2, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#120c10'; g.beginPath(); g.ellipse(r * 0.22, -r * 0.06, r * 0.08, r * 0.1, 0, 0, 7); g.fill();
  g.restore();
}
// schematic triangulation map: parchment, coast-ish shapes, three listening posts; bearings draw in and cross near CHERNOBYL
export function mapCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const W = 960, H = 940;
  g.save(); g.translate(E.W / 2, o.y ?? 820); g.scale(k, k); g.rotate(0.015);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 26); g.fill();
  g.fillStyle = '#f0e2bc'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  // schematic land/sea
  g.save(); g.beginPath(); g.roundRect(-W / 2 + 30, -H / 2 + 120, W - 60, H - 170, 16); g.clip();
  g.fillStyle = '#a9cfe0'; g.fillRect(-W / 2, -H / 2, W, H);
  g.fillStyle = '#d8c896'; g.strokeStyle = '#8a7a52'; g.lineWidth = 5; g.beginPath(); g.moveTo(-W / 2, -H / 2 + 260); g.bezierCurveTo(-260, -340, -180, -120, -80, -160); g.bezierCurveTo(60, -240, 160, -420, 260, -380); g.bezierCurveTo(360, -340, 420, -420, W / 2, -420); g.lineTo(W / 2, H / 2); g.lineTo(-W / 2, H / 2); g.closePath(); g.fill(); g.stroke();
  
  g.restore();
  insT(g, o.title || 'TRIANGULATED', 0, -H / 2 + 66, 60, { color: CARD_INK, stroke: null });
  const target = o.target || [150, 120]; const posts = o.posts || [[-360, -280], [-330, 320], [360, 350]];
  posts.forEach(([px, py], i) => { const p0 = clamp((t - 0.3 - i * 0.35) / 0.6); if (p0 <= 0) return;
    g.save(); g.setLineDash([26, 18]); g.strokeStyle = '#d8342c'; g.lineWidth = 9; g.beginPath(); g.moveTo(px, py);
    const ex = px + (target[0] - px) * 1.35 * p0, ey = py + (target[1] - py) * 1.35 * p0; g.lineTo(ex, ey); g.stroke(); g.restore();
    g.fillStyle = '#3a5a8a'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.arc(px, py, 26, 0, 7); g.fill(); g.stroke();
    // little antenna glyph
    g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.moveTo(px, py - 26); g.lineTo(px, py - 70); g.moveTo(px - 18, py - 58); g.lineTo(px, py - 70); g.lineTo(px + 18, py - 58); g.stroke(); });
  const hit = clamp((t - (o.hit ?? 1.6)) / 0.25);
  if (hit > 0) { const s = ease.outBack(hit); g.save(); g.translate(...target); g.scale(s, s); g.strokeStyle = '#d8342c'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-44, -44); g.lineTo(44, 44); g.moveTo(44, -44); g.lineTo(-44, 44); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.0)'; g.restore();
    stamp(g, t, o.label || 'NEAR CHERNOBYL', { at: (o.hit ?? 1.6) + 0.1, x: target[0] - 40, y: target[1] + 140, size: 58, color: '#ffffff', fill: '#d8342c', rot: -0.06 }); }
  g.restore();
}
// horizon-arc card: curved Earth, a radar beam bouncing over the horizon to a far-away missile icon (schematic)
export function horizonCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const W = 960, H = 760;
  g.save(); g.translate(E.W / 2, o.y ?? 860); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 26); g.fill();
  const bg = g.createLinearGradient(0, -H / 2, 0, H / 2); bg.addColorStop(0, '#0e1a3a'); bg.addColorStop(1, '#2a3a6a'); g.fillStyle = bg; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  insT(g, o.title || 'OVER-THE-HORIZON RADAR', 0, -H / 2 + 66, 50, { color: '#ffffff', stroke: null, maxW: W - 80 });
  g.save(); g.beginPath(); g.roundRect(-W / 2 + 10, -H / 2 + 10, W - 20, H - 20, 20); g.clip();
  const R = 1400, cy = H / 2 + R - 200; g.fillStyle = '#3a7a5a'; g.beginPath(); g.arc(0, cy, R, 0, 7); g.fill(); g.strokeStyle = '#9ad0a8'; g.lineWidth = 6; g.stroke();
  // ionosphere band
  g.strokeStyle = 'rgba(159,232,255,0.35)'; g.lineWidth = 30; g.beginPath(); g.arc(0, cy, R + 430, Math.PI * 1.32, Math.PI * 1.68); g.stroke();
  // beam: from the left (radar) up to the band, down beyond the horizon
  const p = clamp((t - 0.3) / 0.9); const A = [-360, cy - Math.sqrt(R * R - 360 * 360) - 30], B = [0, cy - R - 430], C = [380, cy - Math.sqrt(R * R - 380 * 380) - 120];
  g.strokeStyle = '#ffd25a'; g.lineWidth = 10; g.lineCap = 'round'; g.setLineDash([30, 18]); g.lineDashOffset = -t * 120; g.beginPath(); g.moveTo(...A);
  if (p < 0.5) g.lineTo(lerp(A[0], B[0], p * 2), lerp(A[1], B[1], p * 2)); else { g.lineTo(...B); g.lineTo(lerp(B[0], C[0], (p - 0.5) * 2), lerp(B[1], C[1], (p - 0.5) * 2)); } g.stroke(); g.setLineDash([]);
  // radar glyph (a tiny lattice wall) + missile glyph (schematic, far away)
  g.fillStyle = '#c9ccd2'; g.strokeStyle = CARD_INK; g.lineWidth = 4; g.save(); g.translate(A[0], A[1] + 20); g.rotate(-0.25); g.fillRect(-50, -60, 100, 60); g.strokeRect(-50, -60, 100, 60); for (let i = -40; i <= 40; i += 20) { g.beginPath(); g.moveTo(i, -60); g.lineTo(i, 0); g.stroke(); } g.restore();
  if (p >= 1) { g.save(); g.translate(C[0] + 20, C[1] - 30); g.rotate(-0.5); g.fillStyle = '#f2ead6'; g.beginPath(); g.roundRect(-14, -50, 28, 90, 12); g.fill(); g.stroke(); g.fillStyle = '#d8342c'; g.beginPath(); g.moveTo(-14, -40); g.lineTo(0, -75); g.lineTo(14, -40); g.closePath(); g.fill(); g.stroke(); g.restore();
    insT(g, '?', C[0] + 90, C[1] - 90, 80, { color: '#ffd25a', stroke: CARD_INK }); }
  g.restore();
  g.restore();
}
// falling snow (2D, deterministic). density 0..1
export function snow(g, t, o = {}) {
  const r = rng(o.seed || 11), n = o.n || 90; g.save(); g.fillStyle = o.color || 'rgba(255,255,255,0.85)';
  for (let i = 0; i < n; i++) { const x0 = r() * E.W, sp = 60 + r() * 120, sz = 3 + r() * 6, ph = r() * E.H;
    const y = (ph + t * sp) % (E.H + 40) - 20, x = x0 + Math.sin(t * 0.8 + i) * 30; g.globalAlpha = (o.a ?? 0.8) * (0.5 + 0.5 * (sz / 9)); g.beginPath(); g.arc(x, y, sz, 0, 7); g.fill(); }
  g.restore();
}
// envelopes raining (complaints)
export function letters(g, t, o = {}) {
  const r = rng(o.seed || 17), n = o.n || 26; const k = clamp(t / 0.2);
  for (let i = 0; i < n; i++) { const x0 = r() * E.W, dl = r() * 1.6, sp = 700 + r() * 500, rot = (r() - 0.5) * 1.2, sz = 70 + r() * 50;
    const tt = t - dl; if (tt < 0) continue; const y = -100 + tt * sp; if (y > E.H + 100) continue;
    g.save(); g.translate(x0 + Math.sin(tt * 3 + i) * 40, y); g.rotate(rot + Math.sin(tt * 4 + i) * 0.3); g.globalAlpha = k;
    g.fillStyle = '#f6f0dc'; g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.roundRect(-sz / 2, -sz * 0.33, sz, sz * 0.66, 6); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-sz / 2, -sz * 0.33); g.lineTo(0, sz * 0.05); g.lineTo(sz / 2, -sz * 0.33); g.stroke();
    g.fillStyle = '#d8342c'; g.fillRect(sz * 0.22, -sz * 0.28, sz * 0.18, sz * 0.2); g.restore(); }
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex };
