// shared helpers for "This Teaspoon Weighs a Billion Tons" (neutron-teaspoon). Underscore = not auto-loaded.
import { wordTime, rng } from '/engine/core.js';
import { THREE, toonStage, toon, flat, rbox, cyl, ball, floor, plane, blob, outline, canvasTex } from '/kits/toon3d/toon.js';
import { castMember } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { glow } from '/kits/toon3d/fx.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };

// the teaspoon: steel handle + bowl holding a glowing blue-white blob of neutron star
export function spoon(o = {}) {
  const g = new THREE.Group(); const steel = '#c9ced6';
  const h = rbox(0.62, 0.035, 0.09, steel, -0.36, 0.05, 0, 0.017); h.rotation.z = 0.12; g.add(h);
  const bowl = ball(0.17, steel, 0.08, 0.06, 0, 24); bowl.scale.set(1.25, 0.42, 0.9); g.add(bowl);
  const core = ball(0.11, toon('#dff4ff', { emissive: '#9fdcff', emissiveIntensity: 1.4 }), 0.08, 0.12, 0, 20); core.scale.set(1.2, 0.55, 0.85); core.userData.noOutline = true; g.add(core);
  outline(g, { px: 2.6 });
  const gl = glow(o.glow ?? 0.9, '#8fd8ff', 0.85); gl.position.set(0.08, 0.14, 0); g.add(gl); g.glow = gl; g.core = core;
  g.pulse = (t) => { const k = 1 + Math.sin(t * 5) * 0.08; gl.scale.setScalar((o.glow ?? 0.9) * k); };
  return g;
}

// whiteboard texture: "SUN" -> tiny dot "20 km"
function boardTex() { return canvasTex(512, 300, (g, W, H) => { g.fillStyle = '#fbfbf6'; g.fillRect(0, 0, W, H); g.lineWidth = 7; g.strokeStyle = '#2a2a3a'; g.lineCap = 'round';
  g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(130, 150, 90, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#2a2a3a'; g.font = '700 40px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('SUN', 130, 164);
  g.beginPath(); g.moveTo(250, 150); g.lineTo(350, 150); g.moveTo(330, 132); g.lineTo(352, 150); g.lineTo(330, 168); g.stroke();
  g.fillStyle = '#9fdcff'; g.beginPath(); g.arc(410, 150, 12, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#2a2a3a'; g.font = '700 34px Fredoka, sans-serif'; g.fillText('20 km', 410, 215); }); }

// Dr Lin's lab: warm light, back wall with a sunny window (god rays come through it), shelves, whiteboard, steel pedestal + spoon
export function lab(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 7, target: [0, 0, 0], bg: ['#e9dcc8', '#f3ebde'] });
  st.add(floor(26, 22, '#c9b49a', 0, -2));
  const wall = plane(26, 9, '#e6d8c2', 0, 4.5, -4.2); st.add(wall);
  const base = plane(26, 0.5, '#b89c7c', 0, 0.25, -4.18); st.add(base);
  // window (sky + clouds painted) on the left of the back wall
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshBasicMaterial({ map: canvasTex(256, 220, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b7fd0'); gr.addColorStop(1, '#bfe2f7'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; for (const [x, y, r] of [[60, 120, 26], [90, 110, 34], [125, 122, 24], [190, 70, 20], [212, 64, 26]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }) }));
  win.position.set(-3.6, 3.0, -4.15); win.userData.noOutline = true; st.add(win);
  const fr = new THREE.Group(); fr.add(rbox(2.85, 0.14, 0.14, '#f6f1e6', 0, 1.15, 0), rbox(2.85, 0.14, 0.14, '#f6f1e6', 0, -1.15, 0), rbox(0.14, 2.4, 0.14, '#f6f1e6', -1.36, 0, 0), rbox(0.14, 2.4, 0.14, '#f6f1e6', 1.36, 0, 0), rbox(0.1, 2.3, 0.1, '#f6f1e6', 0, 0, 0)); fr.position.set(-3.6, 3.0, -4.05); outline(fr, { px: 2.2 }); st.add(fr);
  // whiteboard on the right
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.75), new THREE.MeshBasicMaterial({ map: boardTex() })); bd.position.set(3.0, 3.0, -4.1); bd.userData.noOutline = true; st.add(bd);
  const bf = rbox(3.2, 1.95, 0.08, '#8a8f98', 3.0, 3.0, -4.16, 0.04); outline(bf, { px: 2.2 }); st.add(bf);
  // shelves with flasks + a plant
  const sh = PR.shelf({ w: 1.8, h: 2.4, color: '#7a8a9a', seed: 4 }).at(-6.2, 0, -3.7); st.add(sh);
  const flask = (x, y, z, c) => { const f = new THREE.Group(); const b = ball(0.22, toon(c, { emissive: c, emissiveIntensity: 0.25 }), 0, 0.22, 0, 16); const n = cyl(0.06, 0.07, 0.3, '#dfe9ee', 0, 0.5, 0, 10); f.add(b, n); outline(f, { px: 2.2 }); f.position.set(x, y, z); return f; };
  st.add(flask(5.3, 1.05, -3.2, '#6ad07a'), flask(5.8, 1.05, -3.3, '#e86ab0'));
  const bench = PR.table({ w: 2.6, d: 1.0, h: 1.0, color: '#8a8f98' }).at(5.6, 0, -3.3); st.add(bench);
  st.add(PR.plant({}).at(-4.9, 0, -3.6));
  // steel pedestal + the spoon on top
  const ped = new THREE.Group(); ped.add(rbox(1.0, 1.0, 0.8, '#7a828e', 0, 0.5, 0, 0.06), rbox(1.15, 0.1, 0.95, '#5d6470', 0, 1.02, 0, 0.03)); outline(ped, { px: 2.4 }); st.add(ped);
  const b0 = blob(0.9, 0.3); st.add(b0);
  const sp = spoon({ glow: 1.1 }); sp.scale.setScalar(1.5); sp.position.set(0.1, 1.08, 0.1); sp.rotation.y = -0.5; st.add(sp);
  const s = { stage: st, ped, sp };
  if (o.dev !== false) { s.dev = castMember('dev', { prop: false }); s.dev.position.set(-0.75, 0, -0.55); s.dev.rotation.y = 0.75; st.add(s.dev); }
  if (o.hero) { s.hero = castMember('hero'); s.hero.position.set(1.5, 0, 0.7); s.hero.rotation.y = -0.35; st.add(s.hero); }
  if (o.lin) { s.lin = castMember('lin'); s.lin.position.set(2.0, 0, -2.4); s.lin.rotation.y = -0.2; st.add(s.lin); }
  if (o.mina) { s.mina = castMember('mina'); s.mina.position.set(1.4, 0, 0.9); s.mina.rotation.y = -0.5; st.add(s.mina); }
  return s;
}

// deep space: dark gradient + star points
export function space(T, o = {}) {
  const st = toonStage(T, { light: 'night', fov: o.fov || 40, shadow: false, bg: ['#04050d', '#0b0e2a', '#1b1440'], ambient: 1.2 });
  const r = rng(o.seed || 7), n = 900, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); pos.set([Math.cos(a) * s * 120, u * 120, Math.sin(a) * s * 120], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false })); pts.userData.noOutline = true; st.add(pts);
  return { stage: st, stars: pts };
}
// the neutron star: small bright blue-white ball, halo, two lighthouse beams
export function neutronStar(o = {}) {
  const g = new THREE.Group(); const r = o.r || 1;
  const core = ball(r, toon('#e8f8ff', { emissive: '#9fdcff', emissiveIntensity: 1.2 }), 0, 0, 0, 32); core.userData.noOutline = true; g.add(core);
  const h1 = glow(r * 5, '#7fc8ff', 0.8), h2 = glow(r * 12, '#4a7aff', 0.35); g.add(h1, h2);
  const beams = new THREE.Group(); for (const s of [1, -1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.9, r * 14, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#9fdcff', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); c.position.y = s * r * 7.2; c.rotation.x = s > 0 ? Math.PI : 0; c.userData.noOutline = true; beams.add(c); }
  beams.rotation.z = 0.35; g.add(beams);
  g.update = (t) => { beams.rotation.y = t * 5; beams.rotation.x = Math.sin(t * 5) * 0.25; const k = 1 + Math.sin(t * 9) * 0.06; h1.scale.setScalar(r * 5 * k); };
  g.core = core; g.beams = beams; return g;
}
// a big orange star (before it explodes)
export function bigStar(o = {}) {
  const g = new THREE.Group(); const r = o.r || 3;
  const core = ball(r, toon('#ffb24a', { emissive: '#ff7a2a', emissiveIntensity: 0.9 }), 0, 0, 0, 40); core.userData.noOutline = true; g.add(core);
  const h = glow(r * 3.6, '#ff8a3a', 0.7); g.add(h); g.core = core; g.halo = h; return g;
}
// sunny outdoor stage for the balance scale
export { toonStage };
