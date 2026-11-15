// shared helpers for no-mosquitoes (underscore = not auto-loaded)
import { wordTime, rng, clamp, prog, ease, alpha } from '/engine/core.js';
import { THREE, toonStage, floor, ball, cyl, lathe, outline, blob, rbox } from '/kits/toon3d/toon.js';
import { castMember } from '/kits/toon3d/cast.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { fire } from '/kits/toon3d/fx.js';
import { anchor } from '/kits/toon3d/react.js';
export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };
export const camper = () => castMember('tomas', { seed: 305 });
// golden-hour campsite: grass, pines, a tent, a campfire
export function camp(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 38, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0] });
  const sky = sunnySky(st, { clouds: 7, seed: 21, horizon: '#f6c98a', mid: '#8cc0ea', sunGlow: '#ffd9a0' });
  const g = new THREE.Group(); st.add(g); g.add(floor(400, 400, '#8fb456', 0, 0));
  const r = rng(o.seed || 21);
  for (let i = 0; i < 18; i++) { const p = new THREE.Group(); p.add(cyl(0.18, 0.25, 1.2, '#6a4428', 0, 0.6, 0, 8)); for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.5 - k * 0.38, 1.7, 10), new THREE.MeshToonMaterial({ color: ['#2f6a3a', '#3a7a42', '#2a5f36'][i % 3] })); c.position.y = 1.6 + k * 0.9; c.castShadow = true; p.add(c); }
    p.position.set((r() - 0.5) * 50, 0, -9 - r() * 30); p.scale.setScalar(1.3 + r() * 1.2); outline(p, { px: 2 }); g.add(p); }
  // tent
  const tent = new THREE.Group(); const tm = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.2, 4), new THREE.MeshToonMaterial({ color: '#e0682e' })); tm.rotation.y = Math.PI / 4; tm.position.y = 1.1; tm.castShadow = true; tent.add(tm);
  const door = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 3), new THREE.MeshToonMaterial({ color: '#5a2a18' })); door.position.set(0, 0.7, 0.95); door.scale.z = 0.2; door.userData.noOutline = true; tent.add(door);
  outline(tent, { px: 2.6 }); tent.position.set(-2.6, 0, -1.6); tent.rotation.y = 0.3; g.add(tent);
  // fire ring + campfire
  const ringG = new THREE.Group(); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const s = ball(0.17, '#8a8580', Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55, 8); s.scale.y = 0.7; ringG.add(s); }
  for (const a of [0.4, 1.9, 3.1]) { const l = cyl(0.07, 0.07, 0.8, '#6a4428', 0, 0.12, 0, 8); l.rotation.z = Math.PI / 2; l.rotation.y = a; ringG.add(l); }
  outline(ringG, { px: 2 }); ringG.position.set(1.6, 0, 0.4); g.add(ringG);
  const f = fire({ size: 0.55, seed: 3, light: 2, lightRange: 6 }); f.position.set(1.6, 0.1, 0.4); g.add(f);
  // log seat
  const log = cyl(0.3, 0.3, 1.6, '#7a5032', 0, 0.3, -0.9, 12); log.rotation.z = Math.PI / 2; const lg = new THREE.Group(); lg.add(log); outline(lg, { px: 2.4 }); g.add(lg);
  return { stage: st, sky, ground: g, fire: f, update(t) { sky.update(t); f.update(t); } };
}
// toon shorebird (sandpiper-ish): .update(t, { peck, hop, look })
export function bird(o = {}) { const { color = '#b48a5a', belly = '#f2e6d0', seed = 1, scale = 1 } = o; const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const body = ball(0.32, color, 0, 0.55, 0, 18); body.scale.set(0.9, 0.8, 1.25); g.add(body); const bel = ball(0.26, belly, 0, 0.5, 0.08, 14); bel.scale.set(0.85, 0.7, 1.1); g.add(bel);
  const head = new THREE.Group(); head.position.set(0, 0.88, 0.3); g.add(head); head.add(ball(0.19, color, 0, 0, 0, 16));
  const beak = cyl(0.012, 0.035, 0.36, '#2a2220', 0, 0, 0.3, 8); beak.rotation.x = Math.PI / 2; head.add(beak);
  const eyes = []; for (const s of [-1, 1]) { const e = ball(0.055, '#ffffff', s * 0.12, 0.05, 0.12, 10); const p = ball(0.032, '#1a1214', s * 0.135, 0.05, 0.16, 8); p.userData.noOutline = true; head.add(e, p); eyes.push(p); }
  for (const s of [-1, 1]) { const w = ball(0.22, '#8a6a42', s * 0.27, 0.6, -0.05, 12); w.scale.set(0.25, 0.6, 1.1); g.add(w); }
  const tail = ball(0.12, '#8a6a42', 0, 0.62, -0.42, 10); tail.scale.set(0.8, 0.3, 1.2); g.add(tail);
  for (const s of [-1, 1]) { const l = cyl(0.018, 0.018, 0.34, '#d08a3a', s * 0.1, 0.17, 0, 6); g.add(l); }
  outline(g, { px: 2.2 }); root.add(blob(0.35, 0.3)); root.head = head; root.eyes = eyes; root.height = 1.1; root.headR = 0.19;
  root.update = (t, u = {}) => { const ph = u.ph || 0; head.rotation.x = (u.peck || 0) * Math.max(0, Math.sin((t + ph) * 5)) * 0.9; head.rotation.y = (u.look || 0); g.position.y = (u.hop || 0) * Math.abs(Math.sin((t + ph) * 6)) * 0.15; };
  return root; }
// tundra: flat grey-green plain, low hills, ponds
export function tundra(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 38, shadowSize: 8, target: o.target || [0, 0, 0] }); const sky = sunnySky(st, { clouds: 10, seed: 31, horizon: '#e6eef2', top: '#5a8fc8' });
  const g = new THREE.Group(); st.add(g); g.add(floor(400, 400, '#9aa86a', 0, 0)); const r = rng(5);
  for (let i = 0; i < 8; i++) { const p = floor(2 + r() * 5, 1.5 + r() * 3, '#6fa0c0', (r() - 0.5) * 40, -6 - r() * 30); p.position.y = 0.02; g.add(p); }
  for (let i = 0; i < 40; i++) { const t = ball(0.25 + r() * 0.25, ['#7a8a4a', '#a07a4a', '#6a7a3a'][i % 3], (r() - 0.5) * 30, 0.1, 3 - r() * 30, 8); t.scale.y = 0.5; g.add(t); }
  for (let i = 0; i < 6; i++) { const h = ball(10 + r() * 8, '#7f9070', (r() - 0.5) * 120, -6, -70 - r() * 30, 16); g.add(h); }
  return { stage: st, sky, update(t) { sky.update(t); } }; }
// cacao tree with pods
export function cacaoTree() { const g = new THREE.Group(); g.add(cyl(0.18, 0.26, 2.4, '#6a4a30', 0, 1.2, 0, 10)); const r = rng(9);
  for (let i = 0; i < 6; i++) g.add(ball(0.9 + r() * 0.4, ['#3f7a34', '#4a8a3a'][i % 2], (r() - 0.5) * 1.8, 2.7 + r() * 0.9, (r() - 0.5) * 1.2, 14));
  const pods = []; for (const [y, a, c] of [[1.3, 0.3, '#d8862a'], [1.75, 2.2, '#c25a24'], [1.0, 4.0, '#e0a83a'], [1.55, 5.2, '#c27a2a']]) { const p = ball(0.2, c, Math.cos(a) * 0.27, y, Math.sin(a) * 0.27, 14); p.scale.set(0.8, 1.55, 0.8); g.add(p); pods.push(p); }
  outline(g, { px: 2.4 }); g.add(blob(1.2, 0.3)); g.pods = pods; return g; }
// 2D mosquito swarm drawn over the 3D frame, centred on an anchor. vanish(i) -> time (s) that mosquito i pops out (null = never)
export function swarm(g, t, c, o = {}) { const { n = 70, rx = 300, ry = 240, seed = 4, vanish = null, size = 1 } = o; const r = rng(seed); const pops = [];
  for (let i = 0; i < n; i++) { const a0 = r() * 6.283, sp = 1.5 + r() * 2.5, rr0 = 0.25 + r() * 0.75, ph = r() * 9, vt = vanish ? vanish(i, r()) : null;
    const x = c.x + Math.cos(a0 + t * sp) * rx * rr0 + Math.sin(t * 7 + ph) * 18, y = c.y + Math.sin(a0 * 1.3 + t * sp * 0.8) * ry * rr0 + Math.cos(t * 9 + ph) * 14;
    if (vt != null && t >= vt) { const k = (t - vt) / 0.3; if (k < 1) pops.push([x, y, k]); continue; }
    mosquito(g, x, y, 22 * size * (0.8 + rr0 * 0.4), Math.sin(t * 60 + ph), Math.cos(a0 + t * sp) > 0 ? 1 : -1); }
  for (const [x, y, k] of pops) { g.save(); g.globalAlpha = 1 - k; g.strokeStyle = '#ffffff'; g.lineWidth = 4; for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283; g.beginPath(); g.moveTo(x + Math.cos(a) * 10 * (1 + k * 2), y + Math.sin(a) * 10 * (1 + k * 2)); g.lineTo(x + Math.cos(a) * 22 * (1 + k * 2), y + Math.sin(a) * 22 * (1 + k * 2)); g.stroke(); } g.restore(); } }
export function mosquito(g, x, y, s, flap = 0, dir = 1) { g.save(); g.translate(x, y); g.scale(dir, 1);
  g.fillStyle = 'rgba(220,235,255,.75)'; g.strokeStyle = '#20161a'; g.lineWidth = s * 0.06; for (const sgn of [-1, 1]) { g.save(); g.rotate(sgn * (0.5 + flap * 0.35)); g.beginPath(); g.ellipse(0, -s * 0.45, s * 0.18, s * 0.42, 0, 0, 6.283); g.fill(); g.stroke(); g.restore(); }
  g.strokeStyle = '#20161a'; g.lineCap = 'round'; g.lineWidth = s * 0.07; for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(k * s * 0.15, s * 0.05); g.lineTo(k * s * 0.5, s * 0.55); g.stroke(); }
  g.fillStyle = '#3a2a24'; g.beginPath(); g.ellipse(-s * 0.15, 0, s * 0.45, s * 0.14, -0.2, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.arc(s * 0.35, -s * 0.06, s * 0.13, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(s * 0.45, -s * 0.03); g.lineTo(s * 0.85, s * 0.12); g.stroke(); g.restore(); }
export { anchor };
