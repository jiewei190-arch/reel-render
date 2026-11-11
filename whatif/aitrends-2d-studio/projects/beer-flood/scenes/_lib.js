// shared helpers for "The London Beer Flood (1814)". TONE GUARD: eight people died. Nobody is ever shown hurt or in the
// water; the wave runs through empty streets. Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, FONTS, rng } from '/engine/core.js';
import { THREE, toonStage, toon, canvasTex, outline, rbox, box, cyl, ball, torus, floor, blob, lathe } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.13, size = 54) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -size * 0.78, w, size * 1.56, size * 0.78); g.fill(); text(g, str, 0, 2, { size, color: '#ffd25a', weight: 700 }); g.restore(); }
export const BEER = '#5a3216', FOAM = '#efdcb4';

// late-afternoon London (17 Oct, ~5:30 pm): warm low sun, hazy sky
export function outside(T, o = {}) { const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: o.shadowSize || 12, target: o.target || [0, 0, 0], key: ['#ffc88a', 2.5, [-8, 7, 6]], ambient: 1.1 });
  const sky = sunnySky(st, { top: '#5a6aa0', mid: '#e3b39a', horizon: '#ffd9a0', sunGlow: '#ffd9a0', glow: 0.7, clouds: 8, cloudColor: '#f2d2c0', seed: o.seed || 5 }); return { stage: st, sky }; }
export function inside(T, o = {}) { const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 0], bg: '#3a2a22', ...(o.stage || {}) }); return { stage: st, sky: { update() {} } }; }

const brick = (base = '#9a4e3a', rep = [6, 3]) => { const t = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#d8c8b0'; g.fillRect(0, 0, W, H); const r = rng(9); for (let y = 0; y < 16; y++) for (let x = -1; x < 9; x++) { const s = (r() - 0.5) * 0.18; g.fillStyle = shadeC(base, s); g.fillRect(x * 32 + (y % 2) * 16 + 1.5, y * 16 + 1.5, 29, 13); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; };
function shadeC(hex, k) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); }
export const brickMat = (base, rep) => toon('#ffffff', { map: brick(base, rep) });
export function wall(w, h, d, base, rep, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brickMat(base, rep)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; m.userData.noOutline = true; return m; }

// the giant vat: staves + iron hoops. .hoops[i] (y0 stored), .burst(k) throws the staves outward, .slip(k) drops the marked hoop
export function bigVat(o = {}) {
  const R = o.r || 2.6, H = o.h || 8.8, n = 26; const g = new THREE.Group(); const staves = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const s = rbox(2 * Math.PI * R / n * 1.02, H, 0.22, i % 2 ? '#8a5a32' : '#7e522c', 0, 0, 0, 0.04); const p = new THREE.Group(); p.position.set(Math.sin(a) * R, H / 2, Math.cos(a) * R); p.rotation.y = a; p.add(s); p.a = a; g.add(p); staves.push(p); }
  const top = cyl(R - 0.05, R - 0.05, 0.2, '#6a4428', 0, H + 0.05, 0, 40); g.add(top);
  const hoops = []; for (let i = 0; i < 7; i++) { const y = 0.6 + i * (H - 1.0) / 6; const hp = torus(R + 0.14, 0.09, '#3a3a3e', 0, y, 0); hp.rotation.x = Math.PI / 2; hp.y0 = y; g.add(hp); hoops.push(hp); }
  // ladder + catwalk rail
  for (const sx of [-0.35, 0.35]) g.add(cyl(0.05, 0.05, H + 0.6, '#6a4428', sx, (H + 0.6) / 2, R + 0.55, 6)); for (let y = 0.4; y < H; y += 0.55) { const r_ = cyl(0.035, 0.035, 0.7, '#6a4228', 0, y, R + 0.55, 6); r_.rotation.z = Math.PI / 2; g.add(r_); }
  outline(g, { px: 2.4 }); g.add(blob(R * 1.4, 0.35));
  g.staves = staves; g.hoops = hoops; g.R = R; g.H = H;
  g.slip = (k, i = 3) => { const hp = hoops[i]; hp.position.y = hp.y0 - k * (hp.y0 - 0.15); hp.rotation.z = k * 0.18; };
  g.burst = (k) => { staves.forEach((p, i) => { const r = 1 + k * (3 + (i % 5) * 1.3); p.position.set(Math.sin(p.a) * R * r, H / 2 + k * (2 - (i % 4)) - k * k * 4, Math.cos(p.a) * R * r); p.rotation.x = k * (i % 3 - 1) * 1.2; p.rotation.z = k * ((i % 4) - 1.5) * 0.8; }); hoops.forEach((h, i) => { h.scale.setScalar(1 + k * 1.8); h.position.y = h.y0 - k * h.y0 * 0.6; h.visible = k < 0.6; }); top.position.y = H + 0.05 + k * 4 - k * k * 6; top.rotation.x = k * 1.4; };
  return g;
}
export function smallVat(o = {}) { const R = o.r || 1.2, H = o.h || 3.6; const g = new THREE.Group(); g.add(lathe([[0.001, 0], [R, 0.001], [R * 1.04, H * 0.5], [R, H], [0.001, H]], '#7e522c', 28)); for (const y of [0.3, H * 0.5, H - 0.3]) { const h = torus(R * 1.04 + 0.06, 0.06, '#3a3a3e', 0, y, 0); h.rotation.x = Math.PI / 2; g.add(h); } outline(g, { px: 2.4 }); g.add(blob(R * 1.4, 0.3)); return g; }

// beer wave: a sheet that floods along +Z. front(t) = z of the wave front; behind it the surface sits at `depth` with rolling waves,
// a tall foamy crest at the front. Vertex colours: porter brown with cream foam on the crest.
export function wave(o = {}) {
  const W = o.w || 10, L = o.l || 40, nx = 40, nz = 120; const geo = new THREE.PlaneGeometry(W, L, nx, nz); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -L / 2);
  const col = new Float32Array(geo.attributes.position.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(geo, toon('#ffffff', { vertexColors: true, fresh: true, side: THREE.DoubleSide })); m.castShadow = false; m.receiveShadow = true; m.userData.noOutline = true;
  const p0 = geo.attributes.position.array.slice(); const cB = new THREE.Color(BEER), cF = new THREE.Color(FOAM), tmp = new THREE.Color();
  const g = new THREE.Group(); g.add(m);
  const foam = []; for (let i = 0; i < 26; i++) { const b = ball(0.35 + (i % 4) * 0.08, FOAM, 0, 0, 0, 12); b.castShadow = false; b.userData.noOutline = true; g.add(b); foam.push(b); }
  g.set = (front, t, depth = o.depth ?? 0.9, crest = o.crest ?? 1.4) => {
    const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = p0[i * 3], z0 = p0[i * 3 + 2]; const z = z0 + front; const d = front - z;   // distance behind the front (>= 0 inside the flood)
      let y; if (d < 0) y = -0.2; else { const c = Math.exp(-d * 0.9) * crest, roll = Math.sin(z * 1.3 - t * 6 + x * 0.6) * 0.12 + Math.sin(x * 2.1 + t * 4) * 0.06; y = depth * clamp(d * 2) + c + roll * clamp(d); }
      a.setXYZ(i, x, Math.max(-0.2, y), z); const f = d >= 0 ? clamp(Math.exp(-d * 1.2) * 1.3 + (Math.sin(x * 3 + z * 2 + t * 3) > 0.92 ? 0.5 : 0)) : 0; tmp.copy(cB).lerp(cF, f); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b; }
    a.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.computeVertexNormals();
    foam.forEach((b, i) => { const x = -W / 2 + 0.3 + ((i * 0.618) % 1) * (W - 0.6); b.position.set(x, depth + crest * 0.75 + Math.sin(t * 7 + i) * 0.15, front - 0.25 - (i % 3) * 0.2); b.visible = front > -L + 1; });
  };
  return g;
}
// flying bricks for a wall that bursts toward +Z at time k (0..1+)
export function brickBurst(n = 60, area = [8, 6], seed = 3) { const r = rng(seed); const g = new THREE.Group(); const list = [];
  for (let i = 0; i < n; i++) { const b = box(0.5, 0.25, 0.3, i % 3 ? '#9a4e3a' : '#8a4232', 0, 0, 0); b.p0 = [(r() - 0.5) * area[0], 0.3 + r() * area[1], 0]; b.v = [(r() - 0.5) * 6, 2 + r() * 5, 4 + r() * 7]; b.spin = [r() * 8, r() * 8, r() * 8]; g.add(b); list.push(b); }
  outline(g, { px: 2 }); g.set = (t) => { list.forEach(b => { const tt = Math.max(0, t); b.position.set(b.p0[0] + b.v[0] * tt, Math.max(0.12, b.p0[1] + b.v[1] * tt - 4.9 * tt * tt), b.p0[2] + b.v[2] * tt); b.rotation.set(b.spin[0] * tt, b.spin[1] * tt, b.spin[2] * tt); b.visible = t >= 0; }); }; return g; }

// 1814 people (Regency-ish: coats as the 'uniform' outfit, caps)
export const worker = (i = 0, o = {}) => bean({ outfit: 'uniform', colors: { main: ['#6a5a48', '#5a6a5a', '#7a5a3a'][i % 3], legsTop: '#4a3a2a', trim: '#c9a050' }, head: 'cap', headColor: ['#4a3a2a', '#3a3a3a', '#5a4a3a'][i % 3], hair: 'bowl', hairColor: ['#5a3a22', '#2a1a14', '#8a5a2a'][i % 3], skin: ['fair', 'light', 'tan'][i % 3], seed: 120 + i, ...o });
export const owner = () => bean({ outfit: 'uniform', colors: { main: '#1e1e26', legsTop: '#d8cfb8', trim: '#d8b04a' }, hair: 'swoop', hairColor: '#c8c8c8', moustache: '#c8c8c8', skin: 'light', seed: 140 });

// the St Giles street: narrow cobbled lane between poor brick houses with basement windows behind railings, running along -Z
export function stGiles(st, o = {}) { const g = new THREE.Group(); st.add(g);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(9, 80), PR.texMat(PR.TEX.cobble('#8a8070', [3, 26]))); cob.rotation.x = -Math.PI / 2; cob.position.z = -30; cob.receiveShadow = true; cob.userData.noOutline = true; g.add(cob);
  const cols = ['#8a4a38', '#7a5a48', '#9a5e44', '#6e4a3e'];
  for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) { const h = 6 + ((i * 5 + (sx > 0 ? 2 : 0)) % 3) * 1.2; const x = sx * 6.5, z = 6 - i * 5.2;
    g.add(wall(4, h, 5.2, cols[(i + (sx > 0 ? 1 : 0)) % 4], [2, 3], x, h / 2, z));
    const fx = sx * 4.47; for (const zz of [z - 1.2, z + 1.2]) { const win = box(0.06, 1.2, 0.9, '#2a2024', fx, 3.6, zz); g.add(win); const win2 = box(0.06, 1.2, 0.9, '#2a2024', fx, h - 1.2, zz); g.add(win2); }
    const base = box(0.06, 0.55, 1.1, '#141014', fx, 0.27, z); g.add(base);           // basement window at street level
    for (let k = 0; k < 6; k++) g.add(cyl(0.025, 0.025, 0.9, '#2a2a2e', fx + sx * -0.35, 0.45, z - 0.75 + k * 0.3, 6));   // railings
    g.add(box(0.12, 2.3, 1.2, '#4a3226', fx, 1.15, z + 2.0)); }
  return { group: g, update() {} };
}
export function candle(h = 0.5) { const g = new THREE.Group(); g.add(cyl(0.09, 0.1, h, '#f2ead6', 0, h / 2, 0, 12)); outline(g, { px: 2.2 }); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); fl.scale.y = 1.8; fl.position.y = h + 0.1; g.add(fl); const gl = FX.glow(0.9, '#ffb04a', 0.55); gl.position.y = h + 0.1; g.add(gl); g.flame = fl; return g; }
