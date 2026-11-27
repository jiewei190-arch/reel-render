// What if the Moon vanished tonight? — shared assets (a THOUGHT EXPERIMENT): the toon Earth globe (from earth-stops-spinning),
// the Moon, the Sun, Mars, a night beach with a tide-gauge post, a cartoon dung beetle + ball, a Milky Way band, plus 2D overlay helpers.
// Underscore = not auto-loaded. Tone guard: nothing scary; animals are cute and fine.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, torus, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// ---------------------------------------------------------------- THE GLOBE
// equirectangular toon texture: blue ocean, chunky green/tan continents (stylised, not a real map), ice caps, a dashed equator
let _earthTex = null;
export function earthTex() {
  return (_earthTex ||= canvasTex(1024, 512, (g, W, H) => {
    g.fillStyle = '#3f8fd6'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#4f9fe0'; for (let i = 0; i < 40; i++) { const r = rng(i + 1); g.beginPath(); g.ellipse(r() * W, r() * H, 30 + r() * 60, 10 + r() * 20, 0, 0, 7); g.fill(); }
    const land = [[0.12, 0.32, 0.1, 0.12], [0.18, 0.62, 0.05, 0.15], [0.48, 0.3, 0.07, 0.1], [0.52, 0.55, 0.07, 0.16], [0.7, 0.3, 0.15, 0.12], [0.82, 0.68, 0.06, 0.06], [0.33, 0.18, 0.04, 0.05]];
    land.forEach(([x, y, w, h], i) => { const r = rng(10 + i); g.fillStyle = '#5fb04a'; g.beginPath();
      for (let k = 0; k <= 24; k++) { const a = (k / 24) * Math.PI * 2, rr = 1 + (r() - 0.5) * 0.5; const px = (x + Math.cos(a) * w * rr) * W, py = (y + Math.sin(a) * h * rr) * H; k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.closePath(); g.fill(); g.lineWidth = 6; g.strokeStyle = '#3f8a3a'; g.stroke();
      g.fillStyle = '#d9c27a'; g.beginPath(); g.ellipse(x * W + w * W * 0.2, y * H + h * H * 0.15, w * W * 0.35, h * H * 0.3, 0.3, 0, 7); g.fill(); });
    g.fillStyle = '#f4f8fc'; g.fillRect(0, 0, W, H * 0.08); g.fillRect(0, H * 0.93, W, H * 0.07);
    g.strokeStyle = '#ff4a3a'; g.lineWidth = 8; g.setLineDash([28, 18]); g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
  }, { wrap: true }));
}
// globe(r): spinning planet group (spin it with g.spin.rotation.y); tilt is kept off so the equator reads flat on screen
export function globe(o = {}) {
  const R = o.r || 3; const g = new THREE.Group(); const spin = new THREE.Group(); g.add(spin);
  const m = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40), toon('#ffffff', { map: earthTex() })); spin.add(m);
  outline(g, { px: 4 });
  const atmo = glow(R * 3.2, '#8fd0ff', 0.45); g.add(atmo);
  g.spin = spin; g.R = R; return g;
}
export function spaceStage(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: o.fov || 34, bg: ['#060a24', '#101a48', '#1c2a66'], shadow: false, target: [0, 0, 0], ...o });
  // stars live in the background texture, so they never draw over the planets
  st.scene.background = canvasTex(540, 960, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#060a24'); gr.addColorStop(0.5, '#101a48'); gr.addColorStop(1, '#1c2a66'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = rng(o.starSeed || 3); for (let i = 0; i < 150; i++) { g.fillStyle = `rgba(255,255,240,${0.35 + 0.6 * r()})`; g.beginPath(); g.arc(r() * W, r() * H, 0.7 + r() * 1.6, 0, 7); g.fill(); } });
  st.key.intensity = 2.8; st.key.position.set(-8, 6, 10);
  return st;
}
// (kept for the shot code's calls; stars are now in the 3D background / star dome, never drawn over the scene)
export function starfield(g, t, o = {}) { return; }
export function starfield2D(g, t, o = {}) {
  const r = rng(o.seed || 3); for (let i = 0; i < 120; i++) { const x = r() * E.W, y = r() * E.H, s = 1.5 + r() * 3.5, tw = 0.55 + 0.45 * Math.sin(t * (1 + r() * 2) + i);
    g.fillStyle = `rgba(255,255,240,${0.35 + 0.55 * tw})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
}

// ---------------------------------------------------------------- THE FARM (equator, sunny)
export function cow(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#f6f1e6', spot = o.spot || '#3a3034';
  const b = ball(0.6, c, 0, 1.0, 0, 18); b.scale.set(0.8, 0.7, 1.35); g.add(b);
  for (const [x, y, z, s] of [[0.42, 1.12, 0.2, 0.22], [-0.4, 0.95, -0.35, 0.26], [0.1, 1.38, -0.5, 0.18]]) { const sp = ball(s, spot, x, y, z, 12); sp.scale.set(0.5, 1, 1); sp.userData.noOutline = true; g.add(sp); }
  const h = ball(0.34, c, 0, 1.3, 0.95, 16); h.scale.set(0.9, 0.9, 1.05); g.add(h); g.head = h;
  const sn = ball(0.22, '#f2b0b0', 0, 1.18, 1.25, 14); sn.scale.set(1.1, 0.8, 0.7); g.add(sn);
  for (const s of [-1, 1]) {
    const e = ball(0.065, '#1a1418', s * 0.15, 1.42, 1.22, 10); e.userData.noOutline = true; g.add(e);
    const hl = ball(0.022, '#ffffff', s * 0.15 + 0.02, 1.45, 1.28, 6); hl.userData.noOutline = true; g.add(hl);
    const horn = cyl(0.03, 0.05, 0.22, '#e8e0c8', s * 0.2, 1.6, 0.9, 6); horn.rotation.z = -s * 0.6; g.add(horn);
    const ear = ball(0.1, c, s * 0.36, 1.45, 0.85, 8); ear.scale.set(1.6, 0.5, 0.8); g.add(ear);
    g.add(cyl(0.08, 0.07, 0.75, shadeHex(c, -0.1), s * 0.28, 0.38, 0.5, 8), cyl(0.08, 0.07, 0.75, shadeHex(c, -0.1), s * 0.28, 0.38, -0.55, 8));
  }
  const bell = ball(0.08, '#e8c25a', 0, 0.98, 1.05, 10); g.add(bell);
  outline(g, { px: 2.6 }); g.headR = 0.4; return g;
}
export function farmer(o = {}) { return bean({ name: 'Farmer', outfit: 'tee', colors: { main: o.main || '#e05a3a' }, skin: o.skin || 'tan', hair: 'curly', hairColor: '#3a2416', head: 'ballcap', headColor: '#2f6fb0', seed: o.seed || 41, scale: o.scale || 1 }); }
export function scientist(o = {}) { return bean({ name: 'Sci', outfit: 'labcoat', skin: 'brown', hair: 'bun', hairColor: '#1e1612', seed: o.seed || 52, scale: o.scale || 1 }); }
export function polar(o = {}) { return bean({ name: 'Polar', outfit: 'hoodie', colors: { main: '#e04a5a' }, skin: 'light', hair: 'messy', hairColor: '#8a5a2a', head: 'beanie', headColor: '#2f6fb0', seed: o.seed || 63 }); }
export function hayBale() { const g = new THREE.Group(); const c = cyl(0.55, 0.55, 1.1, '#e6c25a', 0, 0.55, 0, 18); c.rotation.z = Math.PI / 2; c.position.y = 0.55; g.add(c);
  for (const x of [-0.25, 0.25]) { const b = cyl(0.565, 0.565, 0.05, '#b88a3a', x, 0.55, 0, 18); b.rotation.z = Math.PI / 2; b.position.set(x, 0.55, 0); b.userData.noOutline = true; g.add(b); }
  outline(g, { px: 2.4 }); return g; }
export function prismRoof(len, r, color, y0 = 0, sy = 0.7) {
  const geo = new THREE.CylinderGeometry(r, r, len, 3).rotateY(Math.PI / 2).rotateZ(Math.PI / 2); geo.scale(1, sy, 1);
  const m = new THREE.Mesh(geo, toon(color)); m.position.y = y0 + r * 0.5 * sy; m.castShadow = true; m.receiveShadow = true; return m;
}
export function barn(o = {}) {
  const g = new THREE.Group(); const w = o.w || 5, d = o.d || 4, h = o.h || 3;
  g.add(rbox(w, h, d, o.wall || '#c8433a', 0, h / 2, 0, 0.06));
  const rf = prismRoof(d * 1.1, w * 0.62, '#5a4a4a', h, 0.6); rf.rotation.y = Math.PI / 2; g.add(rf);
  g.add(rbox(1.8, 2.0, 0.08, '#f2ead6', 0, 1.0, d / 2 + 0.02, 0.03), rbox(1.5, 1.7, 0.1, '#8a2a24', 0, 0.95, d / 2 + 0.05, 0.03));
  const x1 = rbox(0.12, 2.2, 0.06, '#f2ead6', 0, 0.95, d / 2 + 0.11, 0.02); x1.rotation.z = 0.68; g.add(x1);
  const x2 = rbox(0.12, 2.2, 0.06, '#f2ead6', 0, 0.95, d / 2 + 0.11, 0.02); x2.rotation.z = -0.68; g.add(x2);
  outline(g, { px: 2.2 }); return g;
}
export function roundTree(o = {}) {
  const g = new THREE.Group(); const s = o.s || 1, c = o.color || '#4f8a3a'; const r = rng(o.seed || 3);
  g.add(cyl(0.18 * s, 0.25 * s, 2.2 * s, '#6a4a2e', 0, 1.1 * s, 0, 8));
  for (let i = 0; i < 4; i++) { const b = ball(1, i % 2 ? c : shadeHex(c, 0.1), 0, 0, 0, 14); const k = (i ? 0.9 + r() * 0.4 : 1.5) * s; b.scale.set(k, k * 0.9, k); b.position.set(i ? (r() - 0.5) * 1.8 * s : 0, (2.8 + (i ? r() * 0.9 : 0.4)) * s, i ? (r() - 0.5) * 1.2 * s : 0); g.add(b); }
  outline(g, { px: 2.2 }); return g;
}
// a signpost bolted to a concrete block (the joke: "bolted down" stays put)
export function boltedSign(o = {}) {
  const g = new THREE.Group(); g.add(rbox(0.8, 0.4, 0.8, '#a8a8b0', 0, 0.2, 0, 0.05), cyl(0.06, 0.06, 2.2, '#8a8a90', 0, 1.3, 0, 8));
  const t = canvasTex(256, 128, (c, W, H) => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a1c15'; c.font = '900 56px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BOLTED', W / 2, H / 2 + 4); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), toon('#ffffff', { map: t })); p.position.set(0, 2.2, 0.08); g.add(p); g.add(rbox(1.36, 0.71, 0.08, '#2a1c15', 0, 2.2, 0.02, 0.02));
  for (const x of [-0.3, 0.3]) for (const z of [-0.3, 0.3]) g.add(cyl(0.05, 0.05, 0.08, '#606068', x, 0.42, z, 6));
  outline(g, { px: 2.4 }); return g;
}
// the farm: grass, a red barn + fence + tree + bolted sign (all stay), loose stuff the shot moves itself
export function farmSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4);
  g.add(floor(260, 260, '#8fc45a', 0, -60));
  const path = floor(3, 60, '#d8b878', 3.5, -20); path.position.y = 0.01; g.add(path);
  const b = barn(); b.position.set(-5.5, 0, -9); b.rotation.y = 0.25; g.add(b);
  const f = PR.fence({ len: 16, gap: 2 }); f.position.set(1, 0, -5.5); g.add(f);
  [[9, -14, 1.3, '#4f8a3a'], [-12, -18, 1.6, '#5a9a42'], [14, -26, 1.8, '#4a7f36'], [-2, -30, 1.5, '#4f8a3a']].forEach(([x, z, s, c], i) => { const t = roundTree({ s, color: c, seed: i + 2 }); t.position.set(x, 0, z); g.add(t); });
  for (let i = 0; i < 8; i++) { const h = ball(1.2 + r() * 0.5, '#5f9a3e', -26 + i * 7, 0.6, -36 - r() * 3, 12); h.scale.set(2.4, 0.9, 1); g.add(h); }
  for (let i = 0; i < 24; i++) { const tf = ball(0.15 + r() * 0.12, r() < 0.5 ? '#6f9f45' : '#7fae4f', (r() - 0.5) * 26, 0.05, 4 - r() * 14, 8); tf.scale.y = 0.55; tf.userData.noOutline = true; g.add(tf); }
  let sign = null; if (o.sign !== false) { sign = boltedSign(); sign.position.set(...(o.signAt || [4.2, 0, -2.6])); sign.rotation.y = -0.2; g.add(sign); }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, sign, update(t) { sky.update(t); } };
}
// loose things (each gets a home position; the shot slides them east = +X)
export function looseStuff(st, list) {
  return list.map(([kind, x, z, ry = 0, s = 1]) => {
    const m = kind === 'cow' ? cow() : kind === 'hay' ? hayBale() : kind === 'barrel' ? PR.barrel() : kind === 'crate' ? PR.crate({ s: 0.8 }) : kind === 'chicken' ? PR.chicken() : kind === 'cart' ? PR.cart() : PR.sack();
    if (kind === 'barrel' || kind === 'sack' || kind === 'crate' || kind === 'cart') outline(m, { px: 2.4 });
    m.scale.setScalar(s); m.position.set(x, 0, z); m.rotation.y = ry; st.add(m); m.home = [x, 0, z]; m.ry0 = ry; m.kind = kind; return m;
  });
}
// slideEast(obj, u, i): u = seconds since the stop. Everything keeps its eastward speed: slides, skips and tumbles comically to +X.
export function slideEast(m, u, i = 0, o = {}) {
  const v = o.v ?? 6.5, hop = o.hop ?? 0.9, r = rng(i + 7); const ph = r() * 3;
  const k = Math.max(0, u); const x = m.home[0] + v * k * (0.85 + r() * 0.3);
  const y = hop * Math.abs(Math.sin(k * (3 + r() * 2) + ph)) * clamp(k * 3) + (o.lift ?? 0) * clamp(k * 2);
  m.position.set(x, m.home[1] + y, m.home[2]);
  const spin = m.kind === 'cow' || m.kind === 'chicken' ? 0.35 : 1.6;
  m.rotation.set(0, m.ry0 + Math.sin(k * 4 + ph) * 0.2, -k * spin * (0.6 + r() * 0.8) * (m.kind === 'cow' ? 0.3 : 1));
}

// ---------------------------------------------------------------- FLOODED TOWN + NORTH POLE
export function house(o = {}) {
  const g = new THREE.Group(); const w = o.w || 3, d = o.d || 2.6, h = o.h || 2.4;
  g.add(rbox(w, h, d, o.wall || '#f2e2c4', 0, h / 2, 0, 0.06));
  g.add(prismRoof(w * 1.12, d * 0.74, o.roof || '#d8584a', h));
  g.add(rbox(0.6, 1.2, 0.08, '#6a4428', w * 0.18, 0.6, d / 2 + 0.03, 0.03), rbox(0.6, 0.6, 0.08, '#9fd0f0', -w * 0.25, h * 0.6, d / 2 + 0.03, 0.03));
  outline(g, { px: 2.2 }); return g;
}
export function coastSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(260, 260, '#8fc45a', 0, -60)); const sand = floor(30, 260, '#ecd8a0', -22, -60); sand.position.y = 0.01; g.add(sand);
  const sea = floor(200, 260, '#3f8fd6', -137, -60); sea.position.y = 0.02; g.add(sea);
  [[-2, -6, '#f2e2c4', '#d8584a'], [3.5, -8, '#e8f0f8', '#3f6fb0'], [8, -5, '#fbe6d2', '#e0a23a'], [0, -14, '#f2e2c4', '#7a5aa8']].forEach(([x, z, w, r], i) => { const hs = house({ wall: w, roof: r }); hs.position.set(x, 0, z); hs.rotation.y = 0.15 - i * 0.1; g.add(hs); });
  [[-8, -12, 1.4], [12, -12, 1.2], [5, -20, 1.6]].forEach(([x, z, s], i) => { const t = roundTree({ s, seed: i + 5 }); t.position.set(x, 0, z); g.add(t); });
  const sky = sunnySky(st, { clouds: 6, seed: 7 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// a big cartoon wave (a curling blue wall with a white foam lip) that travels east (+X)
export function bigWave(o = {}) {
  const g = new THREE.Group(); const L = o.len || 40, H = o.h || 5;
  g.add(rbox(6, H, L, '#3f8fd6', -3, H / 2, 0, 0.4));                                   // the wall of water (front face at x = 0)
  const curl = cyl(H * 0.32, H * 0.32, L, '#5aaae8', 0.4, H * 0.92, 0, 20); curl.rotation.x = Math.PI / 2; g.add(curl);   // the curling lip
  const r = rng(5); for (let i = 0; i < 16; i++) { const f = ball(0.5 + r() * 0.3, '#f4fbff', 0.6 + r() * 0.8, H * 1.2 + r() * 0.3, -L / 2 + (i + 0.5) * (L / 16), 10); f.scale.set(1.2, 0.7, 1.4); g.add(f); }
  for (let i = 0; i < 10; i++) { const f = ball(0.35, '#f4fbff', 0.5, 0.3, -L / 2 + (i + 0.5) * (L / 10), 8); f.scale.set(1, 0.6, 2); g.add(f); }
  outline(g, { px: 3 }); return g;
}
export function rubberRing() { const g = new THREE.Group(); const t = torus(0.75, 0.28, '#ff6a3a', 0, 0, 0); t.rotation.x = Math.PI / 2; g.add(t);
  for (let i = 0; i < 4; i++) { const s = torus(0.75, 0.29, '#ffffff', 0, 0, 0); s.rotation.x = Math.PI / 2; s.scale.set(1, 1, 1); s.userData.noOutline = true; }
  outline(g, { px: 2.4 }); return g; }
export function poleSet(st) {
  const g = new THREE.Group(); st.add(g); const r = rng(11);
  g.add(floor(260, 260, '#eef6fb', 0, -60));
  for (let i = 0; i < 14; i++) { const h = ball(1 + r() * 1.5, i % 2 ? '#dfeef8' : '#f6fbff', -30 + i * 4.5, 0.2, -16 - r() * 18, 10); h.scale.set(2.5, 0.7 + r() * 0.6, 1.4); g.add(h); }
  const pole = new THREE.Group(); for (let i = 0; i < 6; i++) pole.add(cyl(0.12, 0.12, 0.5, i % 2 ? '#d8342c' : '#ffffff', 0, 0.25 + i * 0.5, 0, 12));
  pole.add(ball(0.22, '#ffd23a', 0, 3.1, 0, 12));
  const ft = canvasTex(256, 160, (c, W, H) => { c.fillStyle = '#2f6fb0'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.font = '900 120px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', W / 2, H / 2 + 8); });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), toon('#ffffff', { map: ft, side: THREE.DoubleSide })); flag.position.set(0.58, 2.6, 0); pole.add(flag);
  outline(pole, { px: 2.6 }); pole.position.set(1.4, 0, -1.2); g.add(pole); g.flag = flag;
  const sky = sunnySky(st, { top: '#2a5aa8', mid: '#8ac4ee', horizon: '#eaf4fb', clouds: 4, seed: 9 });
  return { group: g, sky, pole, update(t) { sky.update(t); flag.rotation.y = Math.sin(t * 2) * 0.15; } };
}
export function mug() { const g = new THREE.Group(); g.add(cyl(0.12, 0.1, 0.24, '#ffffff', 0, 0, 0, 14)); const h = torus(0.07, 0.022, '#ffffff', 0.13, 0, 0); g.add(h); const c = cyl(0.105, 0.105, 0.02, '#7a4a2a', 0, 0.11, 0, 14); c.userData.noOutline = true; g.add(c); outline(g, { px: 2 }); return g; }


// ---------------------------------------------------------------- MOON / SUN / MARS / NIGHT
let _moonTex = null;
export function moonTex() {
  return (_moonTex ||= canvasTex(512, 256, (g, W, H) => { g.fillStyle = '#d9d6cc'; g.fillRect(0, 0, W, H); const r = rng(21);
    g.fillStyle = '#b9b5aa'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(r() * W, H * 0.2 + r() * H * 0.6, 30 + r() * 50, 18 + r() * 30, 0, 0, 7); g.fill(); }
    for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H, rr = 4 + r() * 12; g.fillStyle = '#c4c0b5'; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.strokeStyle = '#eeebe2'; g.lineWidth = 2; g.beginPath(); g.arc(x - 1, y - 1, rr, 2.5, 5.5); g.stroke(); } }, { wrap: true }));
}
// moon(r): cratered toon moon, self-lit so it glows in a night sky; .halo = glow sprite
export function moon(o = {}) {
  const R = o.r || 1; const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), toon('#ffffff', { map: moonTex(), emissive: new THREE.Color(o.lit ? '#9a968c' : '#000000'), emissiveIntensity: o.lit ? 0.9 : 0, fresh: true })); g.add(m); g.ball = m;
  outline(g, { px: o.px ?? 3 });
  if (o.halo !== false) { g.halo = glow(R * 4.5, '#fff6d8', o.lit ? 0.55 : 0.25); g.add(g.halo); }
  return g;
}
export function sunBall(o = {}) { const R = o.r || 2; const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 24), flat('#ffd23a')); g.add(m);
  g.add(glow(R * 5, '#ffb03a', 0.7)); outline(g, { px: 4, color: '#c8701a' }); return g; }
let _marsTex = null;
export function marsTex() { return (_marsTex ||= canvasTex(512, 256, (g, W, H) => { g.fillStyle = '#d0603a'; g.fillRect(0, 0, W, H); const r = rng(31);
  g.fillStyle = '#a8462a'; for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(r() * W, H * 0.25 + r() * H * 0.5, 30 + r() * 60, 10 + r() * 24, r(), 0, 7); g.fill(); }
  g.fillStyle = '#f6efe6'; g.fillRect(0, 0, W, H * 0.07); g.fillRect(0, H * 0.94, W, H * 0.06); }, { wrap: true })); }
// planet with a visible spin axis (a striped pole through it); tilt it with p.tilt.rotation.z, spin with p.spin.rotation.y
export function axisPlanet(o = {}) {
  const R = o.r || 3; const g = new THREE.Group(); const tilt = new THREE.Group(); g.add(tilt); const spin = new THREE.Group(); tilt.add(spin);
  spin.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40), toon('#ffffff', { map: o.mars ? marsTex() : earthTex() })));
  const ax = new THREE.Group(); for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; ax.add(cyl(0.09, 0.09, R * 0.55, '#ff4a3a', 0, s * (R + R * 0.27), 0, 10)); ax.add(ball(0.17, '#ffd23a', 0, s * (R + R * 0.56), 0, 10)); } tilt.add(ax);
  outline(g, { px: 4 }); g.add(glow(R * 3.2, o.mars ? '#ffb08a' : '#8fd0ff', 0.4)); g.tilt = tilt; g.spin = spin; g.R = R; return g;
}
// night beach: sand, dark sea plane (raise/lower it with .sea.position.y), a striped tide-gauge post, a palm, a beach hut
export function beachSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 5);
  const sand = floor(260, 106, '#d8c290', 0, 47); sand.receiveShadow = true; g.add(sand);                       // dry sand: z from -6 to +100
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(260, 34.1), toon('#b8a070')); wet.rotation.x = -Math.PI / 2 - Math.atan(2 / 34); wet.position.set(0, -1, -23); wet.receiveShadow = true; wet.userData.noOutline = true; g.add(wet);   // wet slope to y=-2 at z=-40
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 439), toon('#3a7ac8', { emissive: new THREE.Color('#1a3a70'), emissiveIntensity: 0.8, fresh: true })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, -220.5); sea.userData.noOutline = true; g.add(sea);
  const foam = cyl(0.12, 0.12, 400, '#e8f2ff', 0, 0, 0, 6); foam.rotation.z = Math.PI / 2; foam.userData.noOutline = true; g.add(foam);
  const post = new THREE.Group(); for (let i = 0; i < 10; i++) post.add(cyl(0.18, 0.18, 0.4, i % 2 ? '#d8342c' : '#ffffff', 0, -1.2 + 0.2 + i * 0.4, 0, 12));
  const tt = canvasTex(128, 64, (c, W, H) => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a1c15'; c.font = '900 40px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TIDE', W / 2, H / 2 + 3); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), toon('#ffffff', { map: tt })); sign.position.set(0, 3.0, 0.2); post.add(sign);
  outline(post, { px: 2.6 }); post.position.set(o.postX ?? 1.6, 0, -9); g.add(post);
  const palm = new THREE.Group(); for (let i = 0; i < 6; i++) { const seg = cyl(0.2 - i * 0.015, 0.22 - i * 0.015, 0.8, '#8a6a42', Math.sin(i * 0.3) * 0.3 * i * 0.3, 0.4 + i * 0.75, 0, 8); seg.rotation.z = -0.08 * i; palm.add(seg); }
  for (let i = 0; i < 6; i++) { const lf = ball(0.5, '#3f8a4a', 0, 0, 0, 10); lf.scale.set(2.6, 0.25, 0.7); lf.position.set(1.0 + Math.cos(i * 1.05) * 1.2, 4.9 + Math.sin(i * 2.1) * 0.15, Math.sin(i * 1.05) * 1.2); lf.rotation.y = -i * 1.05; lf.rotation.z = -0.3; palm.add(lf); }
  outline(palm, { px: 2.4 }); palm.position.set(-4.5, 0, 1); g.add(palm);
  const hut = new THREE.Group(); hut.add(rbox(2.4, 1.8, 2, '#c98a4a', 0, 0.9, 0, 0.05)); const rf = prismRoof(2.8, 1.7, '#e0c070', 1.8, 0.7); hut.add(rf); hut.add(rbox(0.6, 0.6, 0.05, '#ffe08a', 0.4, 1.0, 1.02, 0.02)); outline(hut, { px: 2.4 }); hut.position.set(-7, 0, -1.5); hut.rotation.y = 0.4; g.add(hut);
  for (let i = 0; i < 6; i++) { const sh = ball(0.12, i % 2 ? '#f4d8e0' : '#ffffff', (r() - 0.5) * 8, 0.0, 2 + r() * 3, 8); sh.scale.y = 0.5; g.add(sh); }
  const sky = sunnySky(st, { top: '#0a1030', mid: '#22327a', horizon: '#7a6aa8', glow: 0, clouds: 3, cloudColor: '#6a7ab0', seed: 4 });
  const api = { group: g, sky, sea, foam, post, setTide(y) { sea.position.y = y; foam.position.set(0, y + 0.04, y >= 0 ? -1.1 : -6 + y * 17); }, update(t) { sky.update(t); } };
  api.setTide(0.05); return api;
}
export function nightStage(T, o = {}) { const st = toonStage(T, { light: 'night', fov: o.fov || 40, shadowSize: o.shadowSize || 10, target: o.target || [0, 1, -2] }); st.key.intensity = 1.6; st.key.position.set(-6, 14, -18); st.hemi.intensity = 1.0; starDome(st); return st; }
// 3D star dome (points on the upper sky, inside the sky dome), so stars sit behind the scene, never on top of it
export function starDome(st, o = {}) {
  const r = rng(o.seed || 8), n = 700, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, e = 0.04 + Math.pow(r(), 0.7) * 1.4; pos[i * 3] = Math.cos(a) * Math.cos(e) * 250; pos[i * 3 + 1] = Math.sin(e) * 250; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 250; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#fffbe8', size: 2.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 })); m.renderOrder = -5; m.frustumCulled = false; m.userData.noOutline = true; st.scene.add(m); return m;
}
// cartoon dung beetle (shiny dark-teal shell, six legs, little horn) + a brown ball it pushes
export function beetle(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#2a4a5a';
  const body = ball(0.55, c, 0, 0.5, 0, 18); body.scale.set(0.9, 0.6, 1.2); g.add(body);
  const seam = cyl(0.015, 0.015, 1.25, '#13242c', 0, 0.83, 0, 4); seam.rotation.x = Math.PI / 2; seam.userData.noOutline = true; g.add(seam);
  const head = ball(0.3, shadeHex(c, -0.2), 0, 0.5, 0.7, 14); head.scale.set(1.2, 0.8, 0.8); g.add(head); g.head = head;
  const horn = cyl(0.03, 0.07, 0.25, '#13242c', 0, 0.75, 0.82, 6); horn.rotation.x = -0.6; g.add(horn);
  g.eyes = []; for (const s of [-1, 1]) { const e = ball(0.11, '#ffffff', s * 0.16, 0.66, 0.9, 10); e.userData.noOutline = true; g.add(e); const p = ball(0.055, '#111', s * 0.16, 0.67, 0.99, 8); p.userData.noOutline = true; g.add(p); g.eyes.push({ eg: e }); }
  g.legs = []; for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, z = -0.35 + Math.floor(i / 2) * 0.35; const L = new THREE.Group(); L.position.set(s * 0.45, 0.45, z); const leg = cyl(0.035, 0.03, 0.55, '#13242c', s * 0.2, -0.2, 0, 6); leg.rotation.z = s * 0.9; L.add(leg); g.add(L); g.legs.push(L); }
  outline(g, { px: 2.6 }); g.headR = 0.3; return g;
}
export function dungBall(o = {}) { const g = new THREE.Group(); const b = ball(o.r || 0.6, '#7a5a3a', 0, o.r || 0.6, 0, 16); g.add(b); for (let i = 0; i < 6; i++) { const r = rng(i + 3); const k = ball(0.12, '#6a4a2e', 0, 0, 0, 6); const a = r() * 6.3, e = r() * 3.1; k.position.set(Math.cos(a) * Math.sin(e) * 0.58, (o.r || 0.6) + Math.cos(e) * 0.58, Math.sin(a) * Math.sin(e) * 0.58); k.userData.noOutline = true; g.add(k); } outline(g, { px: 2.6 }); g.headR = 0.5; return g; }
export function beetleWalk(b, t) { b.legs.forEach((L, i) => { L.rotation.x = Math.sin(t * 14 + i * 1.7) * 0.45; }); b.children[0].position.y = 0.5 + Math.abs(Math.sin(t * 14)) * 0.02; }
// Milky Way band (screen space): a soft diagonal glow with dense little stars
export function milkyWay(g, t, a = 1, o = {}) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(540, o.y ?? 500); g.rotate(o.rot ?? -0.5);
  const gr = g.createLinearGradient(0, -260, 0, 260); gr.addColorStop(0, 'rgba(150,140,255,0)'); gr.addColorStop(0.5, 'rgba(220,210,255,0.55)'); gr.addColorStop(1, 'rgba(150,140,255,0)');
  g.fillStyle = gr; g.fillRect(-1400, -260, 2800, 520); const r = rng(9);
  for (let i = 0; i < 420; i++) { const x = (r() - 0.5) * 2600, y = (r() + r() + r() - 1.5) * 170, s = 1 + r() * 2.6; g.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
  g.restore();
}

// ---------------------------------------------------------------- 2D OVERLAYS
export function richLine(g, parts, y, size, o = {}) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { insT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: CARD_INK }); x += ws[i] + sp; }); g.restore();
}
// the 2-line hook caption (centre-top, under the Shorts top bar), popping in line by line
export function hookCaption(g, t, l1, l2, o = {}) {
  const fade = o.until != null ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  const k = o.noPop ? 1 : ease.outBack(clamp((t + 0.25) / 0.3)), k2 = o.noPop ? 1 : ease.outBack(clamp((t + 0.07) / 0.3)), y1 = o.y ?? 300, y2 = y1 + 105;
  g.save(); g.globalAlpha = fade;
  g.save(); g.translate(540, y1); g.scale(k, k); g.translate(-540, -y1); richLine(g, l1, y1, o.size || 72); g.restore();
  g.save(); g.translate(540, y2); g.scale(k2, k2); g.translate(-540, -y2); richLine(g, l2, y2, o.size || 72); g.restore();
  g.restore();
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.9 });
  g.restore();
}
// chip label (small rounded tag), e.g. "EAST →"
export function chip(g, t, text, x, y, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const s = o.size || 54; g.save(); g.globalAlpha = fade; g.translate(x, y); g.scale(k, k); g.font = `900 ${s}px "Nunito", sans-serif`; const w = g.measureText(text).width + s * 1.1;
  g.fillStyle = o.fill || '#ffffff'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-w / 2, -s * 0.7, w, s * 1.4, s * 0.7); g.fill(); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: o.color || CARD_INK, stroke: null }); g.restore();
}
// fat cartoon arrow (screen space), pointing along +x by default, growing in with k
export function arrow(g, x, y, len, k = 1, o = {}) {
  if (k <= 0) return; const L = len * k, w = o.w || 46; g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L - w * 1.2, -w / 2); g.lineTo(L - w * 1.2, -w * 1.15); g.lineTo(L, 0); g.lineTo(L - w * 1.2, w * 1.15); g.lineTo(L - w * 1.2, w / 2); g.lineTo(0, w / 2); g.closePath();
  g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.lineJoin = 'round'; g.strokeStyle = CARD_INK; g.stroke(); g.restore();
}
// red STOP octagon
export function stopSign(g, x, y, r, k = 1) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(Math.PI / 8); g.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
  g.fillStyle = '#d8342c'; g.fill(); g.lineWidth = r * 0.09; g.strokeStyle = '#ffffff'; g.stroke(); g.lineWidth = 7; g.strokeStyle = CARD_INK; g.stroke(); g.rotate(-Math.PI / 8);
  insT(g, 'STOP', 0, r * 0.05, r * 0.62, { color: '#ffffff', stroke: null }); g.restore();
}
// motion streaks behind a screen point (things flying east)
export function streaks(g, x, y, n = 3, len = 140, a = 1, seed = 1) {
  if (a <= 0) return; const r = rng(seed); g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { g.lineWidth = 6 + r() * 5; const dy = (i - (n - 1) / 2) * 26 + (r() - 0.5) * 10; g.beginPath(); g.moveTo(x - 40, y + dy); g.lineTo(x - 40 - len * (0.6 + r() * 0.6), y + dy); g.stroke(); }
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, torus, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, glow, canvasTex };
