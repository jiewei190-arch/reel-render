// kits/toon3d/sky.js — the BEANMEN-style daylight look for Toon 3D: warm low sun, a real sky (gradient dome + sun glow + soft
// puffy clouds), optional god rays and a soft-light colour tint. Opt-in: existing shots keep their old flat sky.
//
//   import { toonStage } from '/kits/toon3d/toon.js';
//   import { sunnySky, sunnyLook } from '/kits/toon3d/sky.js';
//   init(T)  { const st = toonStage(T, { light: 'sunny', fov: 38 }); const sky = sunnySky(st, { clouds: 7, seed: 3 }); ... return { stage: st, sky }; }
//   draw(s,t){ ...; s.sky.update(t); }                         // clouds drift slowly (optional)
//   overlay(g, t) { sunnyLook(g, t, { rays: true, tint: '#ffcf8a' }); }   // god rays from the sun corner + warm soft-light tint
//
// sunnySky(st, { top, mid, horizon, sunGlow, clouds: n, cloudColor, seed, radius, height: [min, max], drift, sunDir })
//   top/mid/horizon: dome colours (default deep blue -> sky blue -> warm haze, like BEANMEN's wheatbelt).
//   Clouds sit on a ring around the scene (radius ~ 0.6 * dome radius) so they show behind any camera angle.
// LIGHT.sunny (in toon.js): warm key from the upper left, blue sky fill, golden bounce. `applySunny(st)` switches an existing stage.
import { THREE, toon, LIGHT } from './toon.js';
import { E, rng, alpha, clamp } from '/engine/core.js';
import { godRays } from './react.js';
export { godRays };

export const SKY = { top: '#2b7fd0', mid: '#83c2ee', horizon: '#f2e3bd' };

export function sunnySky(st, o = {}) {
  const top = new THREE.Color(o.top || SKY.top), mid = new THREE.Color(o.mid || SKY.mid), hor = new THREE.Color(o.horizon || SKY.horizon);
  const radius = o.radius || 300; const kp = st.key.position.clone().sub(st.key.target.position).normalize();
  const sunDir = o.sunDir ? new THREE.Vector3(...o.sunDir).normalize() : kp;
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { a: { value: top }, b: { value: mid }, c: { value: hor }, sun: { value: sunDir }, glowC: { value: new THREE.Color(o.sunGlow || '#fff4d6') }, glowK: { value: o.glow ?? 0.55 } },
    vertexShader: 'varying vec3 d; void main(){ d = normalize(position); vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; }',
    fragmentShader: `varying vec3 d; uniform vec3 a, b, c, sun, glowC; uniform float glowK;
      void main(){ float h = d.y; vec3 k = mix(c, b, smoothstep(-0.02, 0.16, h)); k = mix(k, a, smoothstep(0.14, 0.62, h));
        float s = max(dot(normalize(d), normalize(sun)), 0.0); k += glowC * (pow(s, 6.0) * 0.35 + pow(s, 60.0) * 0.6) * glowK;
        gl_FragColor = vec4(k, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 20), mat); dome.renderOrder = -10; dome.frustumCulled = false; dome.userData.noOutline = true;
  const g = new THREE.Group(); g.add(dome); st.scene.background = null; st.scene.add(g);
  // soft puffy clouds: clusters of flattened toon balls, no outline (BEANMEN draws clouds without ink), lifted by emissive
  const r = rng(o.seed ?? 3), n = o.clouds ?? 7, cloudC = o.cloudColor || '#ffffff', clouds = [];
  const cm = toon(cloudC, { emissive: new THREE.Color(cloudC), emissiveIntensity: 0.38, fresh: true }); cm.fog = false;
  const sph = new THREE.SphereGeometry(1, 18, 12); const ring = radius * 0.62; const [h0, h1] = o.height || [0.12, 0.32];
  for (let i = 0; i < n; i++) {
    const c = new THREE.Group(); const balls = 4 + Math.floor(r() * 3);
    for (let b = 0; b < balls; b++) { const m = new THREE.Mesh(sph, cm); const s = b === 0 ? 1.7 : 0.9 + r() * 0.6; m.scale.set(s, s * 0.72, s * 0.8); m.position.set(b === 0 ? 0 : (r() - 0.5) * 4.2, b === 0 ? 0 : r() * 0.9 - 0.2, (r() - 0.5) * 1.2); m.userData.noOutline = true; c.add(m); }
    const ang = (o.arc ? o.arc[0] + (o.arc[1] - o.arc[0]) * (i + r() * 0.6) / n : (i / n) * Math.PI * 2 + r() * 0.5); const el = h0 + r() * (h1 - h0);
    c.position.set(Math.sin(ang) * ring, Math.tan(el) * ring, -Math.cos(ang) * ring); c.scale.setScalar(ring * (0.028 + r() * 0.02)); c.lookAt(0, c.position.y, 0); c.ang = ang; c.el = el; clouds.push(c); g.add(c);
  }
  const api = { group: g, dome, clouds, update(t) { const dr = o.drift ?? 0.004; clouds.forEach((c, i) => { const a = c.ang + t * dr * (1 + (i % 3) * 0.3); c.position.x = Math.sin(a) * ring; c.position.z = -Math.cos(a) * ring; c.lookAt(0, c.position.y, 0); }); } };
  return api;
}

// switch an existing stage to the sunny light (key/fill/hemi/exposure) without rebuilding it
export function applySunny(st, o = {}) {
  const L = { ...LIGHT.sunny, ...o }; st.hemi.color.set(L.sky); st.hemi.groundColor.set(L.ground); st.hemi.intensity = L.ambient;
  st.key.color.set(L.key[0]); st.key.intensity = L.key[1]; const tg = st.key.target.position; st.key.position.set(tg.x + L.key[2][0], tg.y + L.key[2][1], tg.z + L.key[2][2]);
  st.fill.color.set(L.fill[0]); st.fill.intensity = L.fill[1]; st.fill.position.set(...L.fill[2]); st.exposure = L.exposure ?? 1; return st;
}

// softTint(g, colour, amount) — BEANMEN's soft-light colour wash over the whole frame (warmth without crushing the toon colours)
export function softTint(g, color = '#ffcf8a', a = 0.22) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = alpha(color, a); g.fillRect(0, 0, E.W, E.H); g.restore(); }
// sunnyLook(g, t, { rays: bool|{from,color,strength,count}, tint: colour|false, tintAmount }) — the overlay half of the look
export function sunnyLook(g, t, o = {}) {
  if (o.rays) godRays(g, t, typeof o.rays === 'object' ? o.rays : {});
  if (o.tint !== false) softTint(g, o.tint || '#ffcf8a', o.tintAmount ?? 0.22);
}
