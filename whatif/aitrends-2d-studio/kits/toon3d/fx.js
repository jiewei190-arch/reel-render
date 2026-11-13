// kits/toon3d/fx.js — toon effects: cartoon flames, puffy smoke, embers, flickering fire light.
// All deterministic: call .update(t) every frame with the shot-local time. No gore, ever: danger reads through fire, smoke and silhouettes.
//   const f = FX.fire({ size: 1.5 }); f.position.set(0, 0, -4); st.add(f);   ... f.update(t)
import { THREE, toon, flat, canvasTex, outline, INK } from './toon.js';
import { rng, noise, clamp, lerp } from '/engine/core.js';

const flameGeo = (() => { let g = null; return () => (g ||= (() => { const pts = []; for (let i = 0; i <= 16; i++) { const k = i / 16; const r = Math.sin(Math.PI * Math.pow(k, 0.7)) * (1 - k * 0.55) * 0.5; pts.push(new THREE.Vector2(Math.max(0.001, r), k * 1.6)); } return new THREE.LatheGeometry(pts, 14); })()); })();
let _glowTex = null;
const glowTex = () => (_glowTex ||= canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
// additive glow billboard
export function glow(size = 2, color = '#ff9a3a', opacity = 0.6) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(color), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(size); s.userData.noOutline = true; return s; }

// fire({ size, tongues, seed, light: intensity|0, color }) — layered toon flame tongues (orange outline -> yellow core) + glow + optional point light
export function fire(o = {}) {
  const { size = 1, tongues = 5, seed = 1, light = 0, lightRange = 12, spread = 0.5 } = o; const r = rng(seed); const g = new THREE.Group();
  const outer = flat('#ff6a1a'), mid = flat('#ffa22a'), core = flat('#ffe46a');
  const T = [];
  for (let i = 0; i < tongues; i++) {
    const a = (i / tongues) * Math.PI * 2 + r(), d = i === 0 ? 0 : spread * (0.4 + r() * 0.6);
    const tg = new THREE.Group(); tg.position.set(Math.cos(a) * d * size, 0, Math.sin(a) * d * size); g.add(tg);
    const k = (i === 0 ? 1 : 0.55 + r() * 0.35) * size;
    const m1 = new THREE.Mesh(flameGeo(), outer), m2 = new THREE.Mesh(flameGeo(), mid), m3 = new THREE.Mesh(flameGeo(), core);
    m2.scale.setScalar(0.7); m2.position.z = 0.04; m3.scale.setScalar(0.42); m3.position.z = 0.08; [m2, m3].forEach(m => (m.userData.noOutline = true));
    tg.add(m1, m2, m3); tg.scale.setScalar(k); T.push({ tg, k, ph: r() * 10, sp: 5 + r() * 4 });
  }
  outline(g, { px: 2.4, color: '#7a1e0a' });
  const gl = glow(size * 4.2, '#ff8a2a', 0.5); gl.position.y = size * 0.8; g.add(gl);
  let pl = null; if (light) { pl = new THREE.PointLight(new THREE.Color('#ff8a3a'), light, lightRange * size, 1.6); pl.position.y = size * 1.2; g.add(pl); }
  g.update = (t) => {
    for (const q of T) { const n1 = noise(t * q.sp + q.ph, 3), n2 = noise(t * q.sp * 1.3 + q.ph, 7); q.tg.scale.set(q.k * (1 + n2 * 0.12), q.k * (1 + n1 * 0.28), q.k * (1 + n2 * 0.12)); q.tg.rotation.z = n2 * 0.18; q.tg.rotation.x = n1 * 0.12; }
    gl.material.opacity = 0.45 + noise(t * 8, 2) * 0.12; if (pl) pl.intensity = light * (0.85 + noise(t * 9, 5) * 0.18);
  };
  g.update(0); return g;
}
// smoke({ count, rate, rise, spread, color, size, seed }) — puffy toon clouds that rise, grow and shrink away
export function smoke(o = {}) {
  const { count = 16, rise = 1.2, spread = 0.8, color = '#3a3438', size = 1, seed = 2, life = 4, drift = [0.3, 0] } = o; const r = rng(seed); const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 16, 12); const mats = [color, shadeC(color, 0.12), shadeC(color, -0.1)].map(c => toon(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.55 }));
  const P = []; for (let i = 0; i < count; i++) { const m = new THREE.Mesh(geo, mats[i % 3]); m.castShadow = false; g.add(m); P.push({ m, t0: (i / count) * life, x: (r() - 0.5) * spread, z: (r() - 0.5) * spread, s: 0.5 + r() * 0.5, w: r() * 6 }); }
  outline(g, { px: 2.2, color: '#1a1216' });
  g.update = (t) => { for (const p of P) { const a = (((t + p.t0) % life) + life) % life / life; const k = Math.sin(Math.PI * Math.min(1, a * 1.15)) ; p.m.position.set(p.x + a * drift[0] * life + Math.sin(a * 6 + p.w) * 0.15, a * rise * life, p.z + a * drift[1] * life); p.m.scale.setScalar(Math.max(0.001, size * p.s * (0.35 + a * 0.9) * k)); } };
  g.update(0); return g;
}
function shadeC(hex, k) { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); }
// embers({ count, area:[w,h,d], seed }) — tiny glowing sparks drifting up
export function embers(o = {}) {
  const { count = 40, area = [6, 5, 3], seed = 5, color = '#ffb84a' } = o; const r = rng(seed); const g = new THREE.Group(); const geo = new THREE.SphereGeometry(0.035, 6, 4); const m = flat(color);
  const P = []; for (let i = 0; i < count; i++) { const me = new THREE.Mesh(geo, m); me.userData.noOutline = true; g.add(me); P.push({ me, x: (r() - 0.5) * area[0], z: (r() - 0.5) * area[2], sp: 0.4 + r() * 0.7, ph: r() * 10 }); }
  g.update = (t) => { for (const p of P) { const y = ((t * p.sp + p.ph) % 1) * area[1]; p.me.position.set(p.x + Math.sin(t * 2 + p.ph) * 0.3, y, p.z); p.me.scale.setScalar(1 - y / area[1]); } };
  g.update(0); return g;
}
// a warm sky glow plane far behind a set (city burning on the horizon)
export function skyGlow(o = {}) { const { w = 60, h = 20, color = '#ff6a2a', opacity = 0.55 } = o; const t = canvasTex(8, 256, (g, W, H) => { const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(color), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); m.position.y = h / 2; m.userData.noOutline = true; return m; }
