// shared helpers for "What If You Dove to the Bottom of the Ocean" (ocean-bottom). Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, lerp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, ball, cyl, rbox, lathe } from '/kits/toon3d/toon.js';
import { POSE, addPose } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { glow } from '/kits/toon3d/fx.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
const wrapMod = (x, m) => ((x % m) + m) % m;

// depth: 0 = sunlit blue, 1 = twilight navy, 2 = black abyss
export const ZONE = [
  { bg: ['#0a3a6a', '#1a6aa8', '#4aa8d8'], fog: '#1a5a90', amb: 1.2 },
  { bg: ['#020814', '#06183a', '#0c2a5a'], fog: '#06183a', amb: 0.7 },
  { bg: ['#000000', '#01040c', '#030a1a'], fog: '#01040c', amb: 0.45 },
];
export function seaStage(T, o = {}) {
  const z = o.zone ?? 2, Z = ZONE[z];
  const st = toonStage(T, { light: 'night', fov: o.fov || 40, bg: o.bg || Z.bg, fog: [o.fogNear ?? 8, o.fogFar ?? 40, Z.fog], shadow: false,
    key: ['#bfe0ff', z === 0 ? 2.2 : 1.1, [-4, 10, 6]], fill: ['#4a8aff', 0.5, [6, 2, 6]], ambient: Z.amb, sky: '#6aa8e0', ground: '#0a1020' });
  // marine snow: specks that drift UP past the camera (= we sink)
  const N = o.snow ?? 160, pos = new Float32Array(N * 3); let s = (o.seed || 1) * 7919; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const base = []; for (let i = 0; i < N; i++) base.push([(R() - 0.5) * 24, R() * 30, -R() * 22 + 4]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = canvasTex(32, 32, (g, W, H) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: dot, size: o.snowSize ?? 0.16, color: z === 0 ? '#e8f6ff' : '#b8d8ff', transparent: true, opacity: 0.85, depthWrite: false, fog: true })); pts.userData.noOutline = true; st.add(pts);
  return { stage: st,
    sink(t, speed = 4) { const p = geo.attributes.position.array; base.forEach((b, i) => { p[i * 3] = b[0]; p[i * 3 + 1] = wrapMod(b[1] + t * speed, 30) - 15; p[i * 3 + 2] = b[2]; }); geo.attributes.position.needsUpdate = true; },
  };
}

// the toon sub: chunky yellow-orange body, bubble cockpit with the hero inside, twin headlights with beams, spinning prop
export function sub(o = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 22), toon('#ffb62a', { emissive: '#6a4200', emissiveIntensity: 0.6 })); body.scale.set(1.25, 1.1, 2.1); g.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.09, 10, 36), toon('#3a3f4a')); band.scale.set(1.06, 0.95, 1); band.position.z = -0.3; g.add(band);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const r = ball(0.06, '#7a6a5a', Math.cos(a) * 1.2, Math.sin(a) * 1.04, -0.3); g.add(r); }
  const tower = rbox(0.8, 0.6, 1.0, '#e0901a', 0, 1.1, -0.7, 0.2); g.add(tower);
  const fin = rbox(0.12, 0.9, 0.7, '#d07818', 0, 0.4, -2.1, 0.05); g.add(fin); const fin2 = rbox(1.6, 0.12, 0.6, '#d07818', 0, 0, -2.0, 0.05); g.add(fin2);
  const prop = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = rbox(0.14, 0.7, 0.04, '#5a606a', 0, 0.35, 0, 0.03); const pv = new THREE.Group(); pv.add(b); pv.rotation.z = (i / 3) * Math.PI * 2; prop.add(pv); } prop.position.z = -2.45; g.add(prop);
  const hub = cyl(0.12, 0.18, 0.3, '#3a3f4a', 0, 0, -2.3, 12); hub.rotation.x = Math.PI / 2; g.add(hub);
  // headlights
  const lights = []; [-0.7, 0.7].forEach(x => { const c = cyl(0.2, 0.24, 0.25, '#3a3f4a', x, -0.55, 1.6, 16); c.rotation.x = Math.PI / 2; g.add(c);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.17, 18), new THREE.MeshBasicMaterial({ color: '#fff6c8' })); lens.position.set(x, -0.55, 1.735); lens.userData.noOutline = true; g.add(lens);
    const gl = glow(1.4, '#fff2b0', 0.9); gl.position.set(x, -0.55, 1.8); gl.userData.noOutline = true; g.add(gl); lights.push(gl); });
  // hero in the cockpit (only head + shoulders show through the dome)
  const h = castMember('hero', { hood: 'down' }); h.scale.setScalar(0.55); h.position.set(0, -0.22, 1.5); g.add(h);
  outline(g, { px: 2.8 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 28, 20), new THREE.MeshPhongMaterial({ color: '#dff4ff', transparent: true, opacity: 0.13, shininess: 140, specular: '#ffffff', depthWrite: false })); dome.position.set(0, 0.9, 1.5); dome.userData.noOutline = true; g.add(dome);
  const dhl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), flat('#ffffff', { transparent: true, opacity: 0.7 })); dhl.scale.set(1, 1.7, 0.4); dhl.position.set(-0.4, 1.35, 2.05); dhl.userData.noOutline = true; g.add(dhl);
  // light beams (additive cones, no outline)
  const btx = canvasTex(8, 128, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,246,200,0)'); gr.addColorStop(1, 'rgba(255,246,200,0.55)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); });
  const beams = []; [-0.7, 0.7].forEach(x => { const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 2.4, 12, 24, 1, true), new THREE.MeshBasicMaterial({ map: btx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    cone.rotation.x = -Math.PI / 2; cone.position.set(x, -0.55, 1.75 + 6); cone.userData.noOutline = true; g.add(cone); beams.push(cone); });
  const cl = new THREE.PointLight('#fff2dc', 2.2, 3.0, 1.5); cl.position.set(0, 1.4, 2.6); g.add(cl);
  g.hero = h; g.prop = prop; g.beams = beams; g.lights = lights;
  g.setLights = (k) => { beams.forEach(b => (b.material.opacity = k)); lights.forEach(l => (l.material.opacity = 0.9 * k)); };
  g.tick = (t) => { prop.rotation.z = t * 14; };
  return g;
}

// bubbles rising off the hull (2D overlay, screen space)
export function bubbles(g, t, k = 1, seed = 1, cx = E.W / 2, spread = 420) {
  if (k <= 0) return; g.save();
  for (let i = 0; i < 22; i++) { const r1 = ((i * 7919 + seed * 104729) % 1000) / 1000, r2 = ((i * 3571 + seed * 13) % 1000) / 1000;
    const life = (t * (0.6 + r2 * 0.7) + r1) % 1; const x = cx + (r1 - 0.5) * spread + Math.sin(t * 4 + i) * 14, y = E.H * (1.05 - life * 1.15); const r = 8 + r2 * 22;
    g.strokeStyle = `rgba(220,245,255,${0.7 * k * Math.sin(life * Math.PI)})`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = `rgba(255,255,255,${0.6 * k * Math.sin(life * Math.PI)})`; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.22, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// depth counter (spinning digits): metres
export function depthCounter(g, m, o = {}) {
  const x = o.x ?? E.W * 0.5, y = o.y ?? E.H * 0.235, s = o.scale ?? 1;
  g.save(); g.translate(x, y); g.scale(s, s);
  const str = Math.round(m).toLocaleString('en-US') + ' m'; g.font = `900 70px "${FONTS.ui}"`; const w = Math.max(360, g.measureText(str).width + 80);
  g.fillStyle = 'rgba(4,14,26,.85)'; g.beginPath(); g.roundRect(-w / 2, -70, w, 140, 26); g.fill(); g.strokeStyle = '#4ae0ff'; g.lineWidth = 5; g.stroke();
  text(g, 'DEPTH', 0, -38, { size: 30, color: '#8adfff', weight: 900, font: FONTS.ui });
  text(g, str, 0, 18, { size: 70, color: '#ffffff', weight: 900, font: FONTS.ui, glow: 14, glowColor: 'rgba(80,220,255,.8)' });
  g.restore();
}
export function topCaption(g, t, str, t0 = 0, t1 = 3.6) {
  if (t < t0 || t > t1 + 0.25) return;
  const k = t > t1 ? clamp(1 - (t - t1) / 0.25) : 1;
  g.save(); g.globalAlpha = k;
  const size = 74; g.font = `700 ${size}px "${FONTS.title}"`;
  const lines = str.split('\n'); const w = Math.max(...lines.map(l => g.measureText(l).width)) + 90, h = lines.length * size * 1.12 + 50;
  const y = E.H * 0.1;
  g.fillStyle = 'rgba(6,12,24,.88)'; g.beginPath(); g.roundRect(E.W / 2 - w / 2, y - h / 2, w, h, 34); g.fill();
  g.strokeStyle = '#ffd25a'; g.lineWidth = 6; g.stroke();
  lines.forEach((l, i) => text(g, l, E.W / 2, y - ((lines.length - 1) * size * 1.12) / 2 + i * size * 1.12 + 4, { size, color: i === lines.length - 1 ? '#ffd25a' : '#ffffff', weight: 700, stroke: size * 0.12, strokeColor: '#141014' }));
  g.restore();
}
