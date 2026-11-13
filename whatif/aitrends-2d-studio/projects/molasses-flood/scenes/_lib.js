// molasses-flood: shared sets + props (Boston 1919 street, the steel tank, the molasses wave, horse + cart, rooms).
// Underscore = not auto-loaded. TONE GUARD: 21 people really died. Nobody is ever shown hurt or trapped; the wave only hits
// empty streets, buildings and the elevated railway. Comedy stays on the phrase, the tank, the speed and the company's excuse.
import { THREE, toon, flat, canvasTex, outline, rbox, box, cyl, ball, lathe, plane, blob, INK, toonStage } from '/kits/toon3d/toon.js';
import * as PR from '/kits/toon3d/props.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { E, wordTime, rng, noise, clamp, lerp, ease } from '/engine/core.js';

export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start + after - 0.1); return g == null ? fb : g - info.shot.start; };

// ---------- textures ----------
const _tx = new Map(); const cached = (k, f) => (_tx.has(k) ? _tx.get(k) : (_tx.set(k, f()), _tx.get(k)));
const rep = (t, r) => { const c = t.clone(); c.needsUpdate = true; c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(...r); return c; };
export const brickTex = (base = '#a8523a', r = [2, 2]) => rep(cached('brick' + base, () => canvasTex(256, 256, (g, w, h) => { const q = rng(9); g.fillStyle = '#d8c8b0'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < 16; j++) for (let i = -1; i < 5; i++) { const x = (i + (j % 2) * 0.5) * 64, y = j * 16; g.fillStyle = shadeHex(base, (q() - 0.5) * 0.18); g.fillRect(x + 2, y + 2, 60, 12); } })), r);
const steelTex = () => cached('steel', () => canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#8f8a80'; g.fillRect(0, 0, w, h); const q = rng(4);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${q() < 0.6 ? '120,70,40' : '255,255,255'},.06)`; g.beginPath(); g.ellipse(q() * w, q() * h, 10 + q() * 30, 20 + q() * 60, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(40,30,25,.55)'; g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h);
  for (let k = 0; k <= 5; k++) { const y = (k / 5) * h; g.fillStyle = 'rgba(40,30,25,.45)'; g.fillRect(0, y - 3, w, 6); g.fillStyle = '#5a5248'; for (let x = 12; x < w; x += 22) { g.beginPath(); g.arc(x, y + (k ? -12 : 12), 5, 0, 7); g.fill(); } }
  for (let x = 12; x < h; x += 26) { g.fillStyle = '#5a5248'; g.beginPath(); g.arc(14, x, 4, 0, 7); g.arc(w - 14, x, 4, 0, 7); g.fill(); } }));
const texFloor = (w, d, tex, color) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), tex ? PR.texMat(tex) : toon(color)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; return m; };

// MOLASSES: dark glossy brown with a warm amber lift
export const MOL = '#5a2a12', MOL_HI = '#9a5422';
const molMat = () => toon(MOL, { emissive: new THREE.Color('#3a1606'), emissiveIntensity: 0.35 });

// ---------- buildings ----------
// brick rowhouse block facing +Z (door + sash windows + cornice); feet at y = 0
export function brickBlock(o = {}) {
  const { w = 5, h = 7, d = 4, color = '#a8523a', trim = '#efe6d2', floors = 3, door = true, sign = null } = o; const g = PR.propGroup();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), PR.texMat(brickTex(color, [w / 2.4, h / 2.4]))); wall.position.set(0, h / 2, -d / 2); wall.castShadow = wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  g.add(rbox(w + 0.3, 0.35, 0.5, trim, 0, h + 0.1, 0.05, 0.05));
  const cols = Math.max(1, Math.round(w / 1.7));
  for (let f = 0; f < floors; f++) for (let i = 0; i < cols; i++) { const x = -w / 2 + (i + 0.5) * (w / cols), y = 1.6 + f * ((h - 1.4) / floors) + (f ? 0.4 : 0);
    if (f === 0 && door && i === 0) { g.add(rbox(0.95, 2.1, 0.12, '#3a2a22', x, 1.05, 0.03, 0.03), rbox(1.15, 0.16, 0.2, trim, x, 2.2, 0.06, 0.03)); continue; }
    g.add(box(0.75, 1.1, 0.06, '#2c3640', x, y, 0.01), box(0.75, 0.06, 0.07, trim, x, y, 0.03), rbox(0.95, 0.12, 0.2, trim, x, y - 0.62, 0.06, 0.03), rbox(0.95, 0.14, 0.14, trim, x, y + 0.62, 0.05, 0.03)); }
  if (sign) { const t = PR.TEX.label(sign, '#2a3a2a', '#f0e2b0'); const s = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w - 0.4, 3.6), 0.6, 0.08), [0, 0, 0, 0, PR.texMat(t), 0].map(m => m || toon('#2a3a2a'))); s.position.set(0, 2.75, 0.12); s.castShadow = true; g.add(s); }
  outline(g, { px: 2.2 }); return g;
}
// the 1919 firehouse (red brick, big arched bay doors, a little bell tower)
export function firehouse() {
  const g = brickBlock({ w: 6, h: 6.5, d: 5, color: '#b0442e', floors: 2, door: false, sign: 'ENGINE 31' });
  for (const x of [-1.5, 1.5]) g.add(outline(PR.propGroup(rbox(2.2, 2.9, 0.14, '#7a2a1e', x, 1.45, 0.06, 0.05), cyl(1.1, 1.1, 0.14, '#7a2a1e', x, 2.9, 0.06).rotateX(Math.PI / 2)), { px: 2.2 }));
  const tw = outline(PR.propGroup(rbox(1.6, 2.2, 1.6, '#b0442e', 1.8, 7.6, -1.5, 0.05), new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.2, 4).rotateY(Math.PI / 4), toon('#4a4a4e')).translateX(1.8).translateY(9.3).translateZ(-1.5)), { px: 2.2 }); g.add(tw); return g;
}
// elevated railway: steel girder deck on posts along Z at height h
export function elevated(o = {}) {
  const { len = 60, h = 6.2, z0 = 6, color = '#3d4a40' } = o; const g = new THREE.Group(); const segs = [];
  for (let z = z0; z > z0 - len; z -= 4) { const s = new THREE.Group(); s.position.z = z;
    s.add(rbox(0.35, h, 0.35, color, -1.3, h / 2, 0, 0.04), rbox(0.35, h, 0.35, color, 1.3, h / 2, 0, 0.04), rbox(3.2, 0.3, 0.4, color, 0, h - 0.4, 0, 0.04));
    s.add(rbox(3.4, 0.55, 4.02, shadeHex(color, 0.08), 0, h, -2, 0.05));
    for (const x of [-0.6, 0.6]) s.add(rbox(0.12, 0.12, 4.02, '#8a8a8e', x, h + 0.34, -2, 0.02));
    for (let k = 0; k < 4; k++) s.add(rbox(1.8, 0.08, 0.25, '#5a3e2a', 0, h + 0.3, -0.5 - k, 0.02));
    // lattice X brace on the outer face
    for (const sgn of [-1, 1]) { const b = rbox(0.12, 4.4, 0.08, color, 0, h - 0.3, -2, 0.02); b.rotation.x = Math.PI / 2; b.rotation.z = sgn * 0.12; b.position.x = 1.72; s.add(b); }
    g.add(s); segs.push(s); }
  outline(g, { px: 2.2 }); g.segs = segs; g.h = h; return g;
}

// ---------- the tank ----------
// ~50 ft steel tank (H 13, R 6.2): 12 riveted panels that can peel outward (burst k 0..1), a cone roof, popping rivets.
export function tank(o = {}) {
  const { R = 6.2, H = 13, N = 12 } = o; const g = new THREE.Group(); const panels = []; const dT = (Math.PI * 2) / N; const tex = steelTex();
  const mat = toon('#ffffff', { map: tex });
  for (let i = 0; i < N; i++) { const th = i * dT; const geo = new THREE.CylinderGeometry(R, R, H, 3, 6, true, -dT / 2, dT); geo.translate(0, H / 2, -R);
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; m.material.side = THREE.DoubleSide;
    const p = new THREE.Group(); p.rotation.order = 'YXZ'; p.position.set(Math.sin(th) * R, 0, Math.cos(th) * R); p.rotation.y = th; p.add(m); g.add(p); panels.push({ p, th }); }
  const roof = lathe([[R + 0.25, 0], [R * 0.65, 1.3], [0.6, 2.4], [0.001, 2.5]], '#6e6a62', 36); roof.position.y = H; roof.castShadow = true; g.add(roof);
  const rim = cyl(R + 0.3, R + 0.3, 0.35, '#5e5a52', 0, H, 0, 48); g.add(rim);
  const ladder = PR.propGroup(); for (let y = 0.4; y < H; y += 0.55) ladder.add(rbox(0.9, 0.06, 0.06, '#4a4640', 0, y, 0, 0.02)); ladder.add(rbox(0.07, H, 0.07, '#4a4640', -0.45, H / 2, 0, 0.02), rbox(0.07, H, 0.07, '#4a4640', 0.45, H / 2, 0, 0.02));
  ladder.position.set(Math.sin(-0.9) * (R + 0.15), 0, Math.cos(-0.9) * (R + 0.15)); ladder.rotation.y = -0.9; g.add(ladder);
  const base = cyl(R + 0.6, R + 0.8, 0.4, '#9a9488', 0, 0.2, 0, 48); g.add(base);
  outline(g, { px: 2.4 });
  // popping rivets: small dark balls that fly out on cue
  const rv = []; const q = rng(21); for (let i = 0; i < 26; i++) { const th = (q() - 0.5) * 1.6, y = (Math.floor(q() * 5) + 1) * (H / 5) * 0.98; const b = ball(0.16, '#4a443c', 0, 0, 0, 10); b.userData.noOutline = false; outline(b, { px: 2 });
    b.base = new THREE.Vector3(Math.sin(th) * (R + 0.05), y, Math.cos(th) * (R + 0.05)); b.dir = new THREE.Vector3(Math.sin(th) * (2 + q() * 3), 2 + q() * 4, Math.cos(th) * (4 + q() * 4)); b.t0 = q(); b.position.copy(b.base); g.add(b); rv.push(b); }
  g.R = R; g.H = H; g.panels = panels; g.rivets = rv; g.roof = roof; g.rim = rim;
  // groan(t, k): wobble + bulge; pop(t, k): rivets fly (k 0..1 spreads their start times); burst(k): front panels peel open
  g.groan = (t, k) => { const w = Math.sin(t * 9) * 0.012 * k; panels.forEach(({ p }, i) => { p.scale.set(1 + k * 0.04 + Math.sin(t * 7 + i) * 0.01 * k, 1, 1); }); g.rotation.z = w; };
  g.pop = (t, start = 0, span = 1.6) => rv.forEach(b => { const a = t - start - b.t0 * span; if (a < 0) { b.position.copy(b.base); b.visible = true; return; } b.position.set(b.base.x + b.dir.x * a, b.base.y + b.dir.y * a - 9.8 * a * a, b.base.z + b.dir.z * a); b.visible = b.position.y > -1; });
  g.burst = (k) => { panels.forEach(({ p, th }) => { const front = Math.cos(th - (o.face ?? 0)); if (front < 0.2) return; const kk = clamp(k * (0.6 + front * 0.6)); p.rotation.x = ease.out(kk) * (1.2 + front * 0.35); });
    roof.position.y = H - ease.in(clamp(k * 1.2)) * 3.5; roof.rotation.z = k * 0.25; rim.position.y = H - ease.in(clamp(k * 1.2)) * 3.5; };
  return g;
}

// ---------- the wave ----------
// A breaking toon wave of molasses, extruded along X (width w), moving toward +Z. Its front lip sits at local z ~ +2.
// .update(t, { h: height scale, curl }) wobbles the surface (drippy, thick) and the blobs along the lip.
export function molassesWave(o = {}) {
  const { w = 22, h = 6, back = 16, seed = 3 } = o; const g = new THREE.Group();
  const sh = new THREE.Shape(); sh.moveTo(-back, 0);
  sh.lineTo(-back, h * 0.4); sh.splineThru([new THREE.Vector2(-back * 0.5, h * 0.48), new THREE.Vector2(-3.2, h * 0.74), new THREE.Vector2(-1.0, h * 0.97), new THREE.Vector2(1.5, h * 1.04), new THREE.Vector2(3.4, h * 0.92), new THREE.Vector2(4.4, h * 0.7), new THREE.Vector2(4.2, h * 0.56)]);
  sh.splineThru([new THREE.Vector2(3.6, h * 0.6), new THREE.Vector2(3.1, h * 0.7), new THREE.Vector2(2.2, h * 0.64), new THREE.Vector2(1.4, h * 0.44), new THREE.Vector2(1.4, h * 0.2), new THREE.Vector2(2.3, h * 0.04), new THREE.Vector2(3.4, 0)]);
  sh.lineTo(-back, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, steps: 28, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, -w / 2); geo.rotateY(-Math.PI / 2);
  const mat = molMat(); const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh);
  const pos = geo.attributes.position; const base = Float32Array.from(pos.array);
  // amber highlight streaks on the face (flat ribbons just in front of the surface)
  const hi = new THREE.Group(); g.add(hi);
  const q = rng(seed); const blobs = [];
  for (let i = 0; i < 16; i++) { const x = -w / 2 + (i + q() * 0.6) * (w / 16); const b = ball(0.35 + q() * 0.35, i % 3 ? MOL : '#6a3416', x, h * (0.6 + q() * 0.06), 4.1 + q() * 0.25, 14); b.base = b.position.clone(); b.ph = q() * 6; b.drop = q(); g.add(b); blobs.push(b); }
  // foam-free crest gloss: a lighter rounded tube along the crest
  const gloss = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, w * 0.98, 12).rotateZ(Math.PI / 2), toon(MOL_HI, { emissive: new THREE.Color('#5a2a0a'), emissiveIntensity: 0.4 })); gloss.position.set(0, h * 1.02, 1.6); gloss.userData.noOutline = true; g.add(gloss);
  outline(g, { px: 3 });
  g.update = (t, u = {}) => { const hs = u.h ?? 1; const a = pos.array;
    for (let i = 0; i < a.length; i += 3) { const x = base[i], y = base[i + 1], z = base[i + 2]; const k = y / h;
      const ripple = Math.sin(x * 0.55 + t * 2.4 + seed) * 0.32 + noise(x * 0.35 + t * 1.3, seed) * 0.5;
      a[i] = x; a[i + 1] = y * hs * (1 + ripple * 0.09 * k); a[i + 2] = z + ripple * 0.35 * k * k + Math.sin(t * 3 + x * 0.3) * 0.12 * k; }
    pos.needsUpdate = true; geo.computeVertexNormals();
    gloss.position.y = h * 1.02 * hs; gloss.scale.y = 1;
    blobs.forEach(b => { const dr = ((t * 0.7 + b.drop * 3) % 1.6); b.position.set(b.base.x + Math.sin(t * 2 + b.ph) * 0.15, b.base.y * hs - (dr < 1 ? dr * dr * 0.9 : 9), b.base.z + Math.sin(t * 2.6 + b.ph) * 0.12); b.scale.setScalar(1 - clamp(dr - 0.6) * 0.6); });
  };
  g.h = h; g.w = w; return g;
}
// a flat sticky flood sheet (aftermath, or the spreading front); glossy brown with a few raised puddle blobs
export function floodSheet(w = 14, d = 40, o = {}) { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), molMat()); m.rotation.x = -Math.PI / 2; m.position.y = o.y ?? 0.06; m.receiveShadow = true; m.userData.noOutline = true; g.add(m);
  const q = rng(o.seed || 5); for (let i = 0; i < (o.blobs ?? 18); i++) { const b = ball(0.5 + q() * 0.9, i % 2 ? MOL : '#673318', (q() - 0.5) * w * 0.9, 0, (q() - 0.5) * d * 0.9, 14); b.scale.y = 0.18; b.userData.noOutline = true; b.receiveShadow = true; g.add(b); }
  return g; }

// ---------- horse + cart (frame 1 / closer: they are calm, nobody is hurt) ----------
export function horse(o = {}) {
  const { color = '#8a5a34', mane = '#3a2418' } = o; const root = new THREE.Group(); const g = new THREE.Group(); root.add(g); const C = toon(color), Md = toon(mane), Hf = toon('#2a2220');
  const body = ball(1, C, 0, 1.9, 0, 22); body.scale.set(0.62, 0.62, 1.15); g.add(body);
  const neck = new THREE.Group(); neck.position.set(0, 2.2, 0.85); g.add(neck);
  const n = cyl(0.3, 0.42, 1.3, C, 0, 0.55, 0, 16); n.rotation.x = 0.5; neck.add(n);
  const head = new THREE.Group(); head.position.set(0, 1.15, 0.35); neck.add(head);
  const hs = ball(0.36, C, 0, 0, 0, 18); hs.scale.set(1, 1, 1.15); head.add(hs); const snout = ball(0.27, toon(shadeHex(color, 0.12)), 0, -0.22, 0.48, 16); snout.scale.set(1, 0.85, 1.2); head.add(snout);
  for (const s of [-1, 1]) { const nos = ball(0.05, '#2a1a14', s * 0.11, -0.2, 0.78, 8); nos.userData.noOutline = true; head.add(nos);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 8), C); ear.position.set(s * 0.18, 0.38, -0.05); ear.rotation.z = -s * 0.25; head.add(ear); }
  const eyes = [-1, 1].map(s => { const eg = new THREE.Group(); eg.position.set(s * 0.26, 0.08, 0.2); head.add(eg); const w = ball(0.13, '#fbf8f2', 0, 0, 0, 14); w.userData.outlinePx = 2; eg.add(w); const p = ball(0.065, '#1a1214', s * 0.02, 0, 0.09, 10); p.userData.noOutline = true; eg.add(p); return { eg, p }; });
  for (let i = 0; i < 6; i++) { const m = ball(0.17, Md, 0, 0.6 + i * 0.14, 0.15 - i * 0.18, 10); m.scale.set(0.6, 1, 1); neck.add(m); }
  const forelock = ball(0.14, Md, 0, 0.36, 0.12, 10); head.add(forelock);
  const legs = []; for (const [x, z] of [[-0.32, 0.75], [0.32, 0.75], [-0.32, -0.75], [0.32, -0.75]]) { const hip = new THREE.Group(); hip.position.set(x, 1.6, z); g.add(hip); const l = cyl(0.13, 0.11, 1.5, C, 0, -0.75, 0, 10); hip.add(l); const hoof = cyl(0.14, 0.15, 0.16, Hf, 0, -1.52, 0, 10); hip.add(hoof); legs.push(hip); }
  const tail = new THREE.Group(); tail.position.set(0, 2.2, -1.1); g.add(tail); const tl = ball(0.2, Md, 0, -0.45, -0.15, 10); tl.scale.set(0.7, 2.2, 0.7); tail.add(tl);
  // harness collar
  const col = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.1, 8, 20), toon('#5a3a1e')); col.position.set(0, 2.45, 1.0); col.rotation.x = -1.0; g.add(col);
  root.add(blob(1.2, 0.3)); outline(g, { px: 2.8 }); root.head = head; root.headR = 0.4; root.eyes = [];
  root.update = (t, u = {}) => { const { look = [0, 0], lookUp = 0, ears = 0, step = 0 } = u;
    neck.rotation.x = -lookUp * 0.5 + Math.sin(t * 1.3) * 0.03; head.rotation.x = -lookUp * 0.5; head.rotation.y = look[0] * 0.5;
    eyes.forEach(e => { e.p.position.x = look[0] * 0.05; e.p.position.y = look[1] * 0.05 + lookUp * 0.05; });
    tail.rotation.z = Math.sin(t * 2.1) * 0.25; tail.rotation.x = 0.4 + Math.sin(t * 1.7) * 0.1;
    legs.forEach((l, i) => { l.rotation.x = step * Math.sin(t * 5 + i * Math.PI * 0.5) * 0.3; }); };
  return root;
}
export function wagon() { const g = PR.cart({ color: '#7a4a2a' }); g.add(outline(PR.propGroup(PR.barrel({ color: '#8a5a32' }).at(-0.35, 1.05, 0), PR.barrel({ color: '#7a4a2a' }).at(0.4, 1.05, 0.1), PR.sack({ color: '#c9b083' }).at(0, 1.05, -0.35)), { px: 2.4 })); return g; }

// ---------- people (generic, original) ----------
export const grandma = () => bean({ name: 'Grandma', outfit: 'robe', colors: { main: '#9a7ab8', trim: '#f0e6d8', legsTop: '#9a7ab8' }, skin: 'fair', hair: 'bun', hairColor: '#d8d4cc', browColor: '#bdb8b0', glasses: true, seed: 41 });
export const sprinter = () => bean({ name: 'Sprinter', outfit: 'tee', colors: { main: '#d8402c', legs: '#24345a', feet: '#f2ead6' }, skin: 'brown', hair: 'bald', seed: 52 });
export const judge = () => bean({ name: 'Judge', outfit: 'robe', colors: { main: '#222228', trim: '#efe6d2', legs: '#222228', feet: '#1a1414' }, skin: 'light', hair: 'horseshoe', hairColor: '#e8e4dc', seed: 61 });
export const lawyer = () => bean({ name: 'Lawyer', outfit: 'uniform', colors: { main: '#3a3a4a', legsTop: '#30303e', legs: '#30303e', trim: '#c9a14a' }, skin: 'fair', hair: 'swoop', hairColor: '#2a1a12', moustache: '#2a1a12', seed: 63 });
export const anarchist = () => bean({ name: 'Bomber', outfit: 'tee', colors: { main: '#26262c', legs: '#2e2e36', feet: '#1a1414' }, skin: 'tan', hair: 'messy', hairColor: '#1e1612', head: 'beanie', headColor: '#1e1e24', seed: 64 });
export const bostonian = () => bean({ name: 'Local', outfit: 'tee', colors: { main: '#2f6fb0', legs: '#c2a878', feet: '#f2ead6', print: '#f2ead6' }, skin: 'olive', hair: 'messy', hairColor: '#4a2e1e', head: 'ballcap', headColor: '#c0392b', seed: 71 });
// cartoon round black bomb with a short fuse (a prop; it never goes off)
export function bomb() { const g = PR.propGroup(ball(0.28, '#26262c', 0, 0, 0, 18), cyl(0.07, 0.08, 0.1, '#4a4a52', 0, 0.29, 0)); const f = cyl(0.015, 0.015, 0.2, '#c9a14a', 0.04, 0.42, 0); f.rotation.z = -0.4; g.add(f); const hl = ball(0.07, '#ffffff', -0.1, 0.12, 0.2, 8); hl.userData.noOutline = true; g.add(hl); outline(g, { px: 2.4 }); return g; }

// ---------- sets ----------
// BOSTON 1919: cobbled street running into -Z, brick blocks on the left, the elevated railway over the right sidewalk with
// brick blocks behind it, the tank at the far end on the left. Options: { tank, el, firehouse, light, wet (molasses floor), seed }
export function boston(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 16, target: o.target || [0, 0, -6], fog: o.fog, ...(o.stage || {}) });
  const sky = o.sky === false ? null : sunnySky(st, { clouds: 8, seed: o.seed || 3, ...(o.skyOpts || {}) });
  const g = new THREE.Group(); st.add(g);
  g.add(texFloor(9, 120, PR.TEX.cobble('#9a8e7e', [5, 60])));
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(3, 0.22, 120), PR.texMat(PR.TEX.stone('#bdb3a2', [2, 50]))); c.position.set(s * 6, 0.11, 0); c.receiveShadow = true; c.userData.noOutline = true; g.add(c); }
  const cols = ['#a8523a', '#94442e', '#b0603e', '#8e4a36', '#a65a44'];
  const left = [], right = [];
  for (let i = 0; i < 9; i++) { const z = 10 - i * 6; const b = brickBlock({ w: 6, h: 6.5 + (i % 3) * 1.4, d: 5, color: cols[i % 5], floors: 2 + (i % 2), sign: i === 2 ? 'GROCER' : i === 5 ? 'BAKERY' : null }); b.position.set(-7.5, 0.22, z); b.rotation.y = Math.PI / 2; g.add(b); left.push(b); }
  for (let i = 0; i < 9; i++) { const z = 10 - i * 6; const b = brickBlock({ w: 6, h: 8 + (i % 2) * 1.6, d: 5, color: cols[(i + 2) % 5], floors: 3 }); b.position.set(10.5, 0.22, z); b.rotation.y = -Math.PI / 2; g.add(b); right.push(b); }
  let el = null; if (o.el !== false) { el = elevated({ len: 70, z0: 12 }); el.position.x = 5.6; g.add(el); }
  let tk = null; if (o.tank !== false) { tk = tank({ face: o.tankFace ?? 0 }); tk.position.set(...(o.tankAt || [-2.5, 0, -40])); g.add(tk); }
  let fh = null; if (o.firehouse) { fh = firehouse(); fh.position.set(...(o.firehouseAt || [-7.5, 0.22, -2])); fh.rotation.y = Math.PI / 2; g.add(fh); }
  // harbour haze at the far end
  const hz = new THREE.Mesh(new THREE.PlaneGeometry(200, 30), flat('#e8dcc4', { transparent: true, opacity: 0.0 })); hz.position.set(0, 10, -90); g.add(hz);
  const wet = o.wet ? floodSheet(15, 110, { seed: 7 }) : null; if (wet) { wet.position.z = -30; g.add(wet); }
  return { stage: st, sky, group: g, el, tank: tk, firehouse: fh, left, right, wet, update(t) { sky?.update(t); } };
}

// cosy parlour: striped wallpaper, window with lace, armchair, side table + lamp, rug, yarn basket
export function parlour(T) {
  const st = toonStage(T, { light: 'warm', fov: 34, shadowSize: 6, target: [0, 0, 0] });
  const wp = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e9d6c0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#dcc3a8' : '#e9d6c0'; g.fillRect(i * 32, 0, 32, h); } g.fillStyle = 'rgba(160,80,90,.35)'; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(i * 64 + 16 + (j % 2) * 32, j * 64 + 32, 6, 0, 7); g.fill(); } }, { repeat: [5, 2] });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), PR.texMat(wp)); back.position.set(0, 3.5, -3); back.receiveShadow = true; st.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), PR.texMat(wp)); side.position.set(-5, 3.5, 1); side.rotation.y = Math.PI / 2; side.receiveShadow = true; st.add(side);
  st.add(texFloor(16, 10, PR.TEX.planks('#8a5a38', [6, 4], 8)));
  st.add(box(16, 0.5, 0.1, '#7a4a30', 0, 0.25, -2.94));
  const win = PR.propGroup(box(2.2, 2.6, 0.05, '#bfe0ff', 0, 0, 0), rbox(2.5, 0.18, 0.2, '#f2ead6', 0, 1.35, 0.05, 0.03), rbox(2.5, 0.18, 0.25, '#f2ead6', 0, -1.35, 0.08, 0.03), rbox(0.12, 2.6, 0.12, '#f2ead6', 0, 0, 0.04, 0.02), rbox(2.2, 0.1, 0.1, '#f2ead6', 0, 0, 0.04, 0.02));
  win.position.set(2.6, 3.4, -2.95); outline(win, { px: 2.2 }); st.add(win);
  for (const s of [-1, 1]) { const c = PR.curtain({ w: 0.9, h: 3.2, color: '#b8433a' }); c.position.set(2.6 + s * 1.5, 1.9, -2.8); st.add(c); }
  const chair = outline(PR.propGroup(rbox(1.7, 0.5, 1.4, '#7a3a4a', 0, 0.55, 0, 0.12), rbox(1.7, 1.6, 0.4, '#7a3a4a', 0, 1.3, -0.6, 0.15), rbox(0.35, 0.8, 1.4, '#6a2e3e', -0.85, 0.95, 0, 0.12), rbox(0.35, 0.8, 1.4, '#6a2e3e', 0.85, 0.95, 0, 0.12), rbox(1.3, 0.2, 1.1, '#e0b84a', 0, 0.86, 0.05, 0.08)), { px: 2.4 });
  chair.position.set(-0.6, 0, 0); st.add(chair);
  const tb = PR.table({ w: 0.9, d: 0.9, h: 1.1, color: '#6a4228' }); tb.position.set(1.4, 0, -0.2); st.add(tb);
  const lmp = outline(PR.propGroup(cyl(0.12, 0.2, 0.5, '#c9a14a', 0, 1.35, 0), new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.5, 18, 1, true), toon('#f2d9a0', { emissive: new THREE.Color('#ffcf7a'), emissiveIntensity: 0.5 })).translateY(1.85)), { px: 2.2 }); lmp.position.set(1.4, 0, -0.3); st.add(lmp);
  const cup = outline(PR.propGroup(cyl(0.12, 0.1, 0.18, '#f2ead6', 0, 1.22, 0), cyl(0.2, 0.2, 0.03, '#f2ead6', 0, 1.13, 0)), { px: 2 }); cup.position.set(1.2, 0, 0.1); st.add(cup);
  const rug = PR.rug({ w: 4.5, d: 3, color: '#5a3a6a' }); rug.position.set(0, 0.01, 0.8); st.add(rug);
  const basket = outline(PR.propGroup(cyl(0.38, 0.3, 0.4, '#b08a52', 0, 0.2, 0), ball(0.2, '#d8402c', -0.1, 0.45, 0, 14), ball(0.18, '#3f8a7a', 0.14, 0.42, 0.06, 14)), { px: 2.2 }); basket.position.set(-1.9, 0, 0.9); st.add(basket);
  const frame = outline(PR.propGroup(rbox(1.2, 0.9, 0.08, '#c9a14a', 0, 0, 0, 0.03), box(0.95, 0.65, 0.02, '#8fb0c8', 0, 0, 0.05)), { px: 2 }); frame.position.set(-1.6, 3.6, -2.9); st.add(frame);
  return { stage: st, chair };
}
// knitting: two needles + a growing scarf, held at the hands
export function knitting() { const g = PR.propGroup(); const n1 = cyl(0.02, 0.02, 0.7, '#c9a14a', 0, 0, 0, 6); n1.rotation.z = 0.9; const n2 = cyl(0.02, 0.02, 0.7, '#c9a14a', 0, 0, 0, 6); n2.rotation.z = -0.9;
  const scarf = rbox(0.42, 0.5, 0.06, '#d8402c', 0, -0.3, 0.02, 0.03); const yarn = ball(0.14, '#d8402c', 0.5, -0.5, 0.2, 12); g.add(n1, n2, scarf, yarn); outline(g, { px: 2 }); g.n1 = n1; g.n2 = n2; return g; }

// running track (sunny): red lanes with white lines, green infield, low wall + empty stands
export function track(T) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 12, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 7, seed: 8 });
  const lanes = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#c4553e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f6efe2'; for (let i = 0; i <= 4; i++) g.fillRect(0, i * (h / 4) - 1, w, 3); }, { repeat: [40, 1] });
  const tr = new THREE.Mesh(new THREE.PlaneGeometry(400, 8), PR.texMat(lanes)); tr.rotation.x = -Math.PI / 2; tr.receiveShadow = true; tr.userData.noOutline = true; st.add(tr);
  const inf = texFloor(400, 40, null, '#6aa84a'); inf.position.z = 24; st.add(inf); const bk = texFloor(400, 30, null, '#6aa84a'); bk.position.z = -19; st.add(bk);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(400, 1.2, 0.4), toon('#2f5a8a')); wall.position.set(0, 0.6, -7); wall.receiveShadow = true; st.add(wall);
  const stands = new THREE.Mesh(new THREE.BoxGeometry(400, 6, 8), toon('#c8c2b8')); stands.position.set(0, 2.6, -12); stands.rotation.x = 0.5; stands.receiveShadow = true; st.add(stands);
  for (let x = -120; x < 200; x += 20) { const p = cyl(0.15, 0.15, 7, '#9a9a9e', x, 3.5, -8.5, 8); st.add(p); }
  return { stage: st, sky };
}

// courtroom: wood panelling, judge's bench, two tables, a flag-free plain wall with a clock
export function courtroom(T) {
  const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 0, -1] });
  const pan = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7a4a2c'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,20,10,.5)'; g.lineWidth = 6; for (let i = 0; i < 4; i++) g.strokeRect(i * 64 + 8, 120, 48, 120); g.fillStyle = '#e8dcc4'; g.fillRect(0, 0, w, 100); g.fillStyle = '#5a321c'; g.fillRect(0, 100, w, 14); }, { repeat: [6, 1] });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), PR.texMat(pan)); back.position.set(0, 4, -5); back.receiveShadow = true; st.add(back);
  st.add(texFloor(24, 14, PR.TEX.planks('#9a6a40', [8, 4], 8)));
  const bench = outline(PR.propGroup(rbox(4.6, 2.2, 1.4, '#5a321c', 0, 1.1, 0, 0.06), rbox(4.9, 0.18, 1.6, '#3e2212', 0, 2.25, 0, 0.04), rbox(4.4, 0.9, 1.0, '#5a321c', 0, 0.45, -1.3, 0.04)), { px: 2.4 }); bench.position.set(0, 0, -3); st.add(bench);
  const seal = outline(PR.propGroup(cyl(0.55, 0.55, 0.08, '#c9a14a', 0, 0, 0, 28).rotateX(Math.PI / 2)), { px: 2 }); seal.position.set(0, 1.2, -2.25); st.add(seal);
  const clock = outline(PR.propGroup(cyl(0.45, 0.45, 0.1, '#f2ead6', 0, 0, 0, 24).rotateX(Math.PI / 2), box(0.04, 0.32, 0.04, INK, 0, 0.12, 0.06), box(0.24, 0.04, 0.04, INK, 0.1, 0, 0.06)), { px: 2 }); clock.position.set(3.4, 5.4, -4.9); st.add(clock);
  for (const x of [-3.1, 3.1]) { const tb = PR.table({ w: 2.2, d: 1.0, h: 1.05, color: '#6a4228' }); tb.position.set(x, 0, 1.2); st.add(tb); }
  const rail = outline(PR.propGroup(rbox(12, 0.14, 0.14, '#5a321c', 0, 1.2, 0), ...[-5, -3, -1, 1, 3, 5].map(x => rbox(0.1, 1.2, 0.1, '#5a321c', x, 0.6, 0))), { px: 2 }); rail.position.set(0, 0, 3.4); st.add(rail);
  const easel = outline(PR.propGroup(rbox(1.4, 1.1, 0.06, '#f2ead6', 0, 2.1, 0, 0.02), rbox(0.08, 2.4, 0.08, '#6a4228', -0.5, 1.2, -0.1, 0.02), rbox(0.08, 2.4, 0.08, '#6a4228', 0.5, 1.2, -0.1, 0.02)), { px: 2.2 });
  // the exhibit: a little drawing of the leaking tank on the easel
  const ex = canvasTex(256, 200, (g, w, h) => { g.fillStyle = '#f6efe0'; g.fillRect(0, 0, w, h); g.fillStyle = '#8f8a80'; g.fillRect(70, 40, 116, 130); g.strokeStyle = '#2a1c15'; g.lineWidth = 6; g.strokeRect(70, 40, 116, 130); g.beginPath(); g.moveTo(70, 40); g.lineTo(128, 12); g.lineTo(186, 40); g.stroke();
    g.fillStyle = '#5a2a12'; for (const [x, y] of [[100, 90], [150, 120], [120, 150]]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4, y + 30, x, y + 40); g.quadraticCurveTo(x - 4, y + 30, x, y); g.fill(); } g.fillStyle = '#5a2a12'; g.fillRect(40, 170, 180, 14); });
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.95), PR.texMat(ex)); pic.position.set(0, 2.1, 0.04); pic.userData.noOutline = true; easel.add(pic); easel.position.set(-5.2, 0, -1.2); easel.rotation.y = 0.5; st.add(easel);
  return { stage: st };
}
export function gavel() { const g = PR.propGroup(); const head = cyl(0.13, 0.13, 0.42, '#6a3a1c', 0, 0, 0, 14); head.rotation.z = Math.PI / 2; const h = cyl(0.04, 0.04, 0.6, '#7a4a2a', 0, -0.3, 0, 8); g.add(head, h); outline(g, { px: 2.2 }); return g; }

// modern Boston (hot summer day): brick rowhouses, a tree, parked car-free kerb, a hydrant, a coffee cup in hand
export function modernBoston(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 36, shadowSize: 10, target: [0, 0, -2] }); const sky = sunnySky(st, { clouds: 4, seed: 12, top: '#2a78d0' });
  st.add(texFloor(30, 60, PR.TEX.stone('#c9bfae', [8, 16])));
  const road = texFloor(30, 6, null, '#585c62'); road.position.set(0, 0.005, 6.5); st.add(road);
  const cols = ['#a8523a', '#94442e', '#b0603e', '#8e4a36'];
  for (let i = 0; i < 6; i++) { const b = brickBlock({ w: 5, h: 8 + (i % 2) * 1.5, d: 4, color: cols[i % 4], floors: 3, sign: i === 2 ? 'COFFEE' : null }); b.position.set(-12.5 + i * 5, 0, -4); st.add(b); }
  const tree = PR.gumTree({ s: 0.9, seed: 4 }); tree.position.set(3.6, 0, -2.2); st.add(tree);
  const hyd = outline(PR.propGroup(cyl(0.18, 0.22, 0.7, '#c0392b', 0, 0.35, 0, 14), ball(0.2, '#c0392b', 0, 0.75, 0, 12), cyl(0.08, 0.08, 0.5, '#c0392b', 0, 0.45, 0, 8).rotateZ(Math.PI / 2)), { px: 2.2 }); hyd.position.set(-2.4, 0, 0.8); st.add(hyd);
  return { stage: st, sky };
}
export function coffee() { const g = PR.propGroup(cyl(0.11, 0.08, 0.3, '#f2ead6', 0, 0, 0, 14), cyl(0.115, 0.115, 0.05, '#3a2a22', 0, 0.17, 0, 14), cyl(0.112, 0.09, 0.1, '#8a5a34', 0, -0.02, 0, 14)); outline(g, { px: 2 }); return g; }

// heat shimmer + sun glare for the hot-day shots (overlay, logical units)
export function heatHaze(g, t, a = 1) { g.save(); g.globalAlpha = 0.18 * a; g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(E.W * 0.85, E.H * 0.08, 10, E.W * 0.85, E.H * 0.08, E.W * 0.9); gr.addColorStop(0, '#fff2c0'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }
