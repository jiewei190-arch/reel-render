// shared assets for "Sharks Are Older Than Trees. Seriously." (underscore = not auto-loaded; imported by the shot files)
// Original toon characters in the Toon 3D bean style: BRUCE-free, generic cartoon shark ("the shark"), a sapling with a face,
// a friendly dinosaur, a cartoon asteroid. Nobody is ever shown hurt.
import { E, wordTime, text, ease, prog, clamp, lerp, noise, rng, FONTS } from '/engine/core.js';
import { THREE, toon, flat, outline, ball, cyl, rbox, torus, lathe, floor, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };

// local time (s into the shot) when `word` is spoken
export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };

const sph = new THREE.SphereGeometry(1, 22, 16);
const M = (c, o) => toon(c, o);
const mesh = (geo, c, o = {}) => { const m = new THREE.Mesh(geo, typeof c === 'string' ? M(c) : c); m.castShadow = o.shadow !== false; if (o.noOutline) m.userData.noOutline = true; return m; };
const S = (c, sx, sy, sz, x = 0, y = 0, z = 0) => { const m = mesh(sph, c); m.scale.set(sx, sy, sz); m.position.set(x, y, z); return m; };

// big cartoon eye with a lid (0 open .. 1 shut), like the beans / emu
function eye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.1, size * 0.6); parent.add(eg);
  const w = mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = mesh(sph, flat('#1a1214'), { noOutline: true }); p.scale.set(0.42, 0.46, 0.1); p.position.z = 0.95; pg.add(p);
  const hl = mesh(sph, flat('#ffffff'), { noOutline: true }); hl.scale.set(0.12, 0.12, 0.05); hl.position.set(0.14, 0.16, 1.0); pg.add(hl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), lidC, { noOutline: true }); lp.add(lid);
  const rim = mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK), { noOutline: true }); lp.add(rim);
  return { eg, pg, lp, roll };
}
const setEye = (e, lid, lidAngle, look, side) => { e.lp.rotation.x = lerp(-1.05, 1.5708, clamp(lid)); e.roll.rotation.z = side * lidAngle; e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); };
const blinkK = (t, seed) => { const tt = (t + seed * 1.37) % 3.9; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };

// ---------- the shark: ~3.2 units long, faces +Z, body centre at y = 0 of its root (place it at the water line) ----------
export function shark(o = {}) {
  const { seed = 1, scale = 1, top = '#6f8fae', belly = '#f3efe4' } = o;
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const body = new THREE.Group(); g.add(body);
  const topD = shadeC(top, -0.12);
  body.add(S(top, 0.62, 0.56, 1.45, 0, 0.02, 0));
  body.add(S(belly, 0.54, 0.4, 1.3, 0, -0.17, 0.08));
  body.add(S(top, 0.5, 0.44, 0.6, 0, 0.0, 1.08));                               // snout
  body.add(S(belly, 0.42, 0.26, 0.5, 0, -0.16, 1.1));
  // dorsal fin (flattened cone, raked back)
  const fin = mesh(new THREE.ConeGeometry(0.42, 1.0, 20), top); fin.scale.set(0.3, 1, 1); fin.position.set(0, 0.78, -0.15); fin.rotation.x = -0.5; body.add(fin);
  // pectoral fins
  const pecs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.48, -0.28, 0.35); body.add(p); const f = mesh(new THREE.ConeGeometry(0.22, 0.75, 16), topD); f.scale.set(1, 1, 0.28); f.position.set(s * 0.3, -0.12, 0); f.rotation.set(0, 0, s * 1.15); p.add(f); return p; });
  // gills
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const gl = mesh(new THREE.TorusGeometry(0.16, 0.018, 4, 10, Math.PI * 0.8), flat(shadeC(top, -0.35)), { noOutline: true, shadow: false }); gl.position.set(s * 0.56, -0.02, 0.62 - i * 0.13); gl.rotation.set(0, s * Math.PI / 2, Math.PI * 0.6); body.add(gl); }
  // tail
  const tail = new THREE.Group(); tail.position.set(0, 0.02, -1.25); body.add(tail);
  tail.add(S(top, 0.3, 0.3, 0.55, 0, 0, -0.25));
  const up = mesh(new THREE.ConeGeometry(0.26, 1.0, 16), top); up.scale.set(1, 1, 0.25); up.rotation.set(0, Math.PI / 2, 0); const upG = new THREE.Group(); upG.add(up); up.position.y = 0.45; upG.rotation.x = -0.75; upG.position.z = -0.6; tail.add(upG);
  const lo = mesh(new THREE.ConeGeometry(0.2, 0.65, 16), top); lo.scale.set(1, 1, 0.25); lo.rotation.set(0, Math.PI / 2, 0); const loG = new THREE.Group(); loG.add(lo); lo.position.y = -0.3; loG.rotation.x = 0.7; loG.position.z = -0.6; tail.add(loG);
  // head group (for FX anchors + props like glasses)
  const head = new THREE.Group(); head.position.set(0, 0.18, 1.3); body.add(head);
  const eyes = [-1, 1].map(s => eye(head, new THREE.Vector3(s * 0.23, 0.1, 0.22), new THREE.Vector3(s * 0.45, 0.25, 0.85).normalize(), 0.19, topD));
  // brows (thick, for attitude)
  const brows = [-1, 1].map(s => { const b = mesh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), flat(shadeC(top, -0.5)), { noOutline: true }); b.rotation.z = Math.PI / 2; const bg = new THREE.Group(); bg.position.set(s * 0.24, 0.29, 0.24); bg.rotation.y = s * 0.4; bg.add(b); head.add(bg); return bg; });
  // mouth: a wide toothy grin (cartoon, small square teeth, nothing sharp-looking)
  const mouth = new THREE.Group(); mouth.position.set(0, -0.27, 0.36); head.add(mouth);
  const lip = mesh(new THREE.TorusGeometry(0.26, 0.04, 6, 24, Math.PI * 0.9), flat('#3a1a22'), { noOutline: true }); lip.rotation.set(Math.PI * 0.62, 0, Math.PI * 1.05); mouth.add(lip);
  for (let i = 0; i < 6; i++) { const a = -0.95 + i * 0.38; const tth = mesh(new THREE.BoxGeometry(0.06, 0.07, 0.03), toon('#ffffff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3 }), { noOutline: true, shadow: false }); tth.position.set(Math.sin(a) * 0.24, 0.02 - Math.cos(a) * 0.05, Math.cos(a) * 0.07 + 0.02); tth.rotation.y = a; mouth.add(tth); }
  outline(g, { px: 3 });
  root.add(blob(1.1, 0.0));
  root.update = (t, u = {}) => {
    const { swim = 1, lid = 0.25, lidAngle = 0, look = [0, 0], blink = true, brow = 0, pec = 0, roll = 0, ph = seed } = u;
    const w = t * 4.2 + ph; tail.rotation.y = Math.sin(w) * 0.42 * swim; body.rotation.y = -Math.sin(w) * 0.06 * swim; body.rotation.z = roll + Math.sin(w * 0.5) * 0.03;
    body.position.y = Math.sin(t * 1.7 + ph) * 0.05;
    pecs.forEach((p, i) => { p.rotation.z = (i ? -1 : 1) * (Math.sin(w * 0.6) * 0.12 * swim + pec); });
    const bl = blink ? blinkK(t, seed) : 0;
    eyes.forEach((e, i) => setEye(e, Math.max(lid, bl), lidAngle, look, i ? 1 : -1));
    brows.forEach((b, i) => { b.position.y = 0.29 + brow * 0.06 - Math.max(0, lidAngle) * 0.04; b.rotation.z = (i ? -1 : 1) * lidAngle * 0.8; });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.42; root.body = body; root.pecs = pecs; root.mouth = mouth;
  root.update(0); return root;
}

// ---------- sapling with a face: ~1.3 units tall, faces +Z ----------
export function sapling(o = {}) {
  const { seed = 3, scale = 1, leaf = '#6fb04a' } = o; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const sway = new THREE.Group(); g.add(sway);
  const trunk = mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.0, 10).translate(0, 0.5, 0), '#8a5a36'); sway.add(trunk);
  const crown = new THREE.Group(); crown.position.y = 1.0; sway.add(crown);
  const lc = [leaf, shadeC(leaf, 0.12), shadeC(leaf, -0.12)];
  crown.add(S(lc[0], 0.26, 0.22, 0.24, 0, 0.12, 0)); for (let i = 0; i < 4; i++) { const a = i * 1.6 + r(); crown.add(S(lc[(i + 1) % 3], 0.16, 0.13, 0.15, Math.cos(a) * 0.2, 0.08 + r() * 0.12, Math.sin(a) * 0.15)); }
  // face on the trunk
  const head = new THREE.Group(); head.position.set(0, 0.68, 0.07); sway.add(head);
  const eyes = [-1, 1].map(s => eye(head, new THREE.Vector3(s * 0.07, 0.03, 0.02), new THREE.Vector3(s * 0.4, 0.1, 0.9).normalize(), 0.07, '#7a4e2e'));
  const mouth = mesh(new THREE.TorusGeometry(0.035, 0.012, 5, 12, Math.PI), flat('#3a1a12'), { noOutline: true }); mouth.position.set(0, -0.08, 0.07); mouth.rotation.z = Math.PI; head.add(mouth);
  // branch arm (salutes)
  const arm = new THREE.Group(); arm.position.set(0.06, 0.52, 0); sway.add(arm);
  const br = mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.36, 8).translate(0, 0.18, 0), '#8a5a36'); arm.add(br); const lf = S(lc[1], 0.08, 0.05, 0.08, 0, 0.38, 0); arm.add(lf);
  // little pot of soil
  g.add(mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 16).translate(0, 0.04, 0), '#6a4a30'));
  outline(g, { px: 2.6 }); root.add(blob(0.35, 0.3));
  root.update = (t, u = {}) => {
    const { salute = 0, tremble = 0, lid = 0.2, look = [0, 0], blink = true, smile = 1, bounce = 0 } = u;
    sway.rotation.z = Math.sin(t * 1.3 + seed) * 0.04 + noise(t * 18, seed) * 0.06 * tremble; sway.position.y = Math.abs(Math.sin(t * 7)) * 0.06 * bounce;
    arm.rotation.set(lerp(0, -0.2, salute), 0, lerp(-0.9, -2.55, salute)); arm.position.y = lerp(0.52, 0.6, salute);
    const bl = blink ? blinkK(t, seed) : 0; eyes.forEach((e, i) => setEye(e, Math.max(lid, bl), 0, look, i ? 1 : -1));
    mouth.rotation.z = smile > 0 ? Math.PI : 0; mouth.position.y = smile > 0 ? -0.08 : -0.1;
  };
  root.head = head; root.eyes = eyes; root.headR = 0.14; root.update(0); return root;
}

// ---------- friendly dinosaur (green, round, bean-like) ~3.6 units tall, faces +Z ----------
export function dino(o = {}) {
  const { seed = 5, color = '#6aae4a', belly = '#e8d890' } = o;
  const root = new THREE.Group(); const g = new THREE.Group(); root.add(g);
  const hip = new THREE.Group(); hip.position.y = 1.45; g.add(hip);
  hip.add(S(color, 0.85, 0.9, 1.05, 0, 0.2, 0)); hip.add(S(belly, 0.66, 0.72, 0.6, 0, 0.1, 0.48));
  const tail = mesh(new THREE.ConeGeometry(0.55, 2.2, 16), color); tail.rotation.x = -Math.PI / 2 - 0.25; tail.position.set(0, -0.15, -1.7); hip.add(tail);
  const neck = S(color, 0.42, 0.6, 0.45, 0, 1.05, 0.35); hip.add(neck);
  const head = new THREE.Group(); head.position.set(0, 1.65, 0.6); hip.add(head);
  head.add(S(color, 0.55, 0.48, 0.72, 0, 0, 0.1)); head.add(S(shadeC(color, 0.1), 0.42, 0.22, 0.4, 0, -0.18, 0.5));
  const eyes = [-1, 1].map(s => eye(head, new THREE.Vector3(s * 0.3, 0.2, 0.35), new THREE.Vector3(s * 0.6, 0.3, 0.75).normalize(), 0.14, shadeC(color, -0.15)));
  for (let i = 0; i < 4; i++) { const sp = mesh(new THREE.ConeGeometry(0.12, 0.3, 8), '#e88a3a'); sp.position.set(0, 0.95 - i * 0.05, -0.2 - i * 0.45); sp.rotation.x = -0.3; hip.add(sp); }
  const arms = [-1, 1].map(s => { const a = mesh(new THREE.CapsuleGeometry(0.09, 0.3, 4, 8), color); a.position.set(s * 0.6, 0.45, 0.65); a.rotation.set(-0.9, 0, s * 0.3); hip.add(a); return a; });
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(s * 0.5, 1.2, 0); g.add(L); const th = mesh(new THREE.CapsuleGeometry(0.26, 0.7, 4, 10).translate(0, -0.55, 0), color); L.add(th); const ft = S(shadeC(color, -0.1), 0.3, 0.16, 0.45, 0, -1.12, 0.15); L.add(ft); return L; });
  outline(g, { px: 3 }); root.add(blob(1.3, 0.3));
  root.update = (t, u = {}) => {
    const { walk = 1, lid = 0.2, look = [0, 0], blink = true } = u; const w = t * 4.2;
    legs.forEach((L, i) => { L.rotation.x = Math.sin(w + i * Math.PI) * 0.45 * walk; });
    hip.position.y = 1.45 + Math.abs(Math.sin(w)) * 0.12 * walk; hip.rotation.z = Math.sin(w) * 0.05 * walk;
    head.rotation.x = Math.sin(w * 2) * 0.05 * walk; const bl = blink ? blinkK(t, seed) : 0; eyes.forEach((e, i) => setEye(e, Math.max(lid, bl), 0, look, i ? 1 : -1));
  };
  root.head = head; root.eyes = eyes; root.headR = 0.55; root.update(0); return root;
}

// ---------- cartoon asteroid with a flame trail (points its trail along +Y local) ----------
export function asteroid(o = {}) {
  const { size = 1, seed = 2 } = o; const g = new THREE.Group();
  const rock = mesh(new THREE.DodecahedronGeometry(size, 1), '#8a7a70'); g.add(rock);
  const r = rng(seed); for (let i = 0; i < 5; i++) { const c = S('#6a5a52', size * 0.22, size * 0.1, size * 0.22); const a = r() * 6.28, b = r() * 3.14; c.position.set(Math.sin(b) * Math.cos(a) * size * 0.92, Math.cos(b) * size * 0.92, Math.sin(b) * Math.sin(a) * size * 0.92); c.lookAt(0, 0, 0); g.add(c); }
  outline(g, { px: 2.6 });
  const trail = new THREE.Group(); g.add(trail);
  [['#ff6a1a', 1.0, 1], ['#ffa22a', 0.7, 0.85], ['#ffe46a', 0.42, 0.7]].forEach(([c, k, h]) => { const m = mesh(new THREE.ConeGeometry(size * 1.05 * k, size * 4.5 * h, 18, 1, true), flat(c, { transparent: true, opacity: 0.85, side: THREE.DoubleSide }), { noOutline: true, shadow: false }); m.position.y = size * 2.25 * h; trail.add(m); });
  g.update = (t) => { rock.rotation.set(t * 0.9, t * 0.6, 0); trail.scale.set(1 + noise(t * 9, seed) * 0.08, 1 + noise(t * 7, seed + 3) * 0.15, 1); };
  return g;
}

// ---------- props ----------
export function glasses() { const g = new THREE.Group(); const m = flat('#20161a');
  for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.13, 0.022, 6, 20), m, { noOutline: true }); r.position.set(s * 0.3, 0, 0); r.rotation.y = s * 0.55; g.add(r); const l = mesh(new THREE.CircleGeometry(0.12, 18), flat('#cfe6ff', { transparent: true, opacity: 0.35 }), { noOutline: true }); l.position.copy(r.position); l.rotation.y = r.rotation.y; g.add(l); }
  const br = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6), m, { noOutline: true }); br.rotation.z = Math.PI / 2; br.position.set(0, 0.03, 0.1); g.add(br); return g; }
const paperTex = () => canvasTex(512, 640, (g, W, H) => { g.fillStyle = '#f4efe2'; g.fillRect(0, 0, W, H); g.fillStyle = '#20161a'; g.font = '900 64px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('OCEAN TIMES', W / 2, 80); g.fillRect(24, 100, W - 48, 6);
  g.font = '900 46px Nunito, sans-serif'; g.fillText('TREES STILL', W / 2, 170); g.fillText('NEW HERE', W / 2, 222); g.fillStyle = '#9a9488'; for (let i = 0; i < 9; i++) { g.fillRect(30, 270 + i * 38, 210, 16); g.fillRect(272, 270 + i * 38, 210, 16); } });
export function newspaper() { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.12), toon('#ffffff', { map: paperTex(), side: THREE.DoubleSide })); m.userData.noOutline = true; m.castShadow = true; const g = new THREE.Group(); g.add(m); return g; }
export function briefcase() { const g = new THREE.Group(); g.add(rbox(0.7, 0.5, 0.18, '#7a4a2a', 0, 0, 0, 0.05)); const h = torus(0.1, 0.025, '#3a2418', 0, 0.3, 0); g.add(h); g.add(rbox(0.1, 0.06, 0.2, '#d8b04a', 0, 0.16, 0, 0.02)); outline(g, { px: 2.4 }); return g; }
const stripeTex = () => canvasTex(128, 64, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#d8342c'; g.fillRect(i * W / 8, 0, W / 8, H); } });
export function popcorn() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.6, 16, 1, true), toon('#ffffff', { map: stripeTex(), side: THREE.DoubleSide })); b.position.y = 0.3; b.castShadow = true; g.add(b);
  const r = rng(4); for (let i = 0; i < 14; i++) g.add(ball(0.07 + r() * 0.03, i % 4 ? '#fff4d0' : '#f2d27a', (r() - 0.5) * 0.4, 0.62 + r() * 0.12, (r() - 0.5) * 0.4, 10)); outline(g, { px: 2 }); return g; }
// birthday cake: tiers, frosting colour, n candles (flames are tiny toon cones), a number plaque
export function cake(o = {}) { const { tiers = 1, color = '#f6d6e6', frost = '#ffffff', candles = 3, label = '', r0 = 0.6, seed = 2 } = o; const g = new THREE.Group(); let y = 0, r = r0;
  for (let i = 0; i < tiers; i++) { g.add(cyl(r, r, 0.42, color, 0, y + 0.21, 0, 28)); g.add(torus(r, 0.06, frost, 0, y + 0.42, 0)); g.children[g.children.length - 1].rotation.x = Math.PI / 2; y += 0.42; r *= 0.72; }
  const top = y, rr = r / 0.72, fl = []; const R = rng(seed);
  for (let i = 0; i < candles; i++) { const ring = candles > 8 ? (i % 3) : 0; const k = candles > 8 ? 0.25 + ring * 0.3 : 0.5; const a = i * 2.39996 + R() * 0.2; const x = Math.cos(a) * rr * k * (candles > 8 ? 1 : 0.7), z = Math.sin(a) * rr * k * (candles > 8 ? 1 : 0.7);
    g.add(cyl(0.025, 0.025, 0.28, ['#5ab4e8', '#f2c230', '#e85a8a'][i % 3], x, top + 0.14, z, 6)); const f = mesh(new THREE.ConeGeometry(0.035, 0.1, 8), flat('#ffb42a'), { noOutline: true, shadow: false }); f.position.set(x, top + 0.33, z); g.add(f); fl.push(f); }
  if (label) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.26), toon('#ffffff', { map: canvasTex(256, 128, (c, W, H) => { c.fillStyle = '#fff6e0'; c.fillRect(0, 0, W, H); c.fillStyle = '#20161a'; c.font = '900 88px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, W / 2, H / 2 + 6); }) })); p.position.set(0, 0.22, r0 + 0.01); p.userData.noOutline = true; g.add(p); }
  g.add(blob(r0 * 1.3, 0.25)); outline(g, { px: 2.4 }); g.top = top; g.update = (t) => fl.forEach((f, i) => { f.scale.set(1, 1 + noise(t * 12 + i, 3) * 0.4, 1); }); return g; }
export function party(o = {}) { // picnic table + bunting
  const g = new THREE.Group(); g.add(rbox(4.2, 0.12, 1.6, '#c9874a', 0, 1.0, 0, 0.04)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.06, 0.06, 1.0, '#9a6236', sx * 1.9, 0.5, sz * 0.6, 8));
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.02, 1.7), toon('#ffffff', { map: canvasTex(128, 128, (c, W, H) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#ffffff' : '#e85a5a'; c.fillRect(i * 16, j * 16, 16, 16); } }) })); cloth.position.y = 1.07; cloth.receiveShadow = true; cloth.userData.noOutline = true; g.add(cloth);
  outline(g, { px: 2.4 }); g.add(blob(2.4, 0.25)); return g; }
export function bunting(w = 8, y = 4.2, z = -2) { const g = new THREE.Group(); const cols = ['#e85a5a', '#f2c230', '#5ab4e8', '#6fb04a', '#b56ad8']; const n = 14;
  for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n; const sag = Math.sin(Math.PI * (i + 0.5) / n) * 0.5; const f = mesh(new THREE.ConeGeometry(0.2, 0.4, 3), cols[i % 5], { shadow: false }); f.rotation.set(0, 0, Math.PI); f.position.set(x, y - sag - 0.2, z); f.scale.z = 0.2; g.add(f); }
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, w, 4), flat('#5a4a3a')); line.rotation.z = Math.PI / 2; line.position.set(0, y - 0.25, z); line.userData.noOutline = true; g.add(line); outline(g, { px: 2 }); return g; }
export function rock(s = 1, c = '#8a8078', seed = 1) { const m = mesh(new THREE.DodecahedronGeometry(s, 0), c); const r = rng(seed); m.rotation.set(r() * 3, r() * 3, r() * 3); m.scale.y = 0.6; const g = new THREE.Group(); g.add(m); outline(g, { px: 2.4 }); return g; }
export function moss(n, area, seed = 1) { const g = new THREE.Group(); const r = rng(seed); for (let i = 0; i < n; i++) { const b = S(['#6a9a4a', '#7aaa52', '#5a8a42'][i % 3], 0.18 + r() * 0.12, 0.08, 0.18 + r() * 0.12, area[0] + r() * (area[1] - area[0]), 0.03, area[2] + r() * (area[3] - area[2])); g.add(b); } return g; }

// ---------- worlds ----------
// sea({ size, color }) — a flat toon ocean (slightly see-through) with a darker band towards the horizon
export function sea(o = {}) { const { size = 400, color = '#2f8fd0' } = o; const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(color, { transparent: true, opacity: o.opacity ?? 0.86, emissive: new THREE.Color(color), emissiveIntensity: 0.15 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; m.renderOrder = 2; return m; }
// beach: the hook location. Sea everywhere, a sand bank on the right. Sunny sky + clouds.
export function world(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'sunny', fov: o.fov || 38, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0] });
  const sky = sunnySky(st, { clouds: 9, seed: o.seed || 3, ...(o.sky || {}) });
  const water = sea(o.sea); st.add(water);
  const s = { stage: st, sky, water, upd: [] };
  if (o.sand) { const [x, z, w, d] = o.sand; const sand = mesh(new THREE.CylinderGeometry(1, 1.12, 0.6, 40), '#f0d9a0', { shadow: false }); sand.scale.set(w, 1, d); sand.position.set(x, 0.0, z); sand.receiveShadow = true; sand.userData.noOutline = true; st.add(sand); s.sand = sand; }
  return s;
}
export const tick = (s, t) => { s.sky.update(t); s.upd.forEach(u => u(t)); };

// gold pill tag at the top of the frame
export function tag(g, str, k = 1, y = 0.17, size = 58) { if (k <= 0) return; g.save(); const sc = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(sc, sc); g.globalAlpha = clamp(k * 1.5);
  g.font = `900 ${size}px "${FONTS.ui}"`; const mw = E.W * 0.86; const tw = g.measureText(str).width; if (tw > mw) { size = size * mw / tw; g.font = `900 ${size}px "${FONTS.ui}"`; } const w = Math.min(g.measureText(str).width + 80, E.W * 0.94); g.fillStyle = 'rgba(20,14,18,.84)'; g.beginPath(); g.roundRect(-w / 2, -size * 0.8, w, size * 1.6, size * 0.8); g.fill();
  text(g, str, 0, 2, { size, color: '#ffd25a', weight: 900, font: FONTS.ui, maxW: E.W * 0.9 }); g.restore(); }
function shadeC(hex, k) { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); }
export { shadeC, mesh, S, prog, ease, clamp, lerp };
