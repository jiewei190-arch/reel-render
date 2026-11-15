// shared helpers for human-photosynthesis (underscore = not auto-loaded)
import { wordTime } from '/engine/core.js';
import { THREE, toonStage, toon, floor, ball, cyl, lathe, plane, outline, blob, rbox, box } from '/kits/toon3d/toon.js';
import { castMember } from '/kits/toon3d/cast.js';
import { shadeHex } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { rng } from '/engine/core.js';
export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };
export const SKIN0 = '#dcb48f', GREEN = '#5fc23e';
// the HERO with his own skin material so it can turn green: hero.green(k) 0 = normal .. 1 = leaf green
export function hero(o = {}) {
  const h = castMember('hero', { skin: SKIN0, ...o });
  const sets = [[SKIN0, GREEN], [shadeHex(SKIN0, -0.06), shadeHex(GREEN, -0.1)]].map(([a, b]) => ({ hex: new THREE.Color(a).getHex(), A: new THREE.Color(a), B: new THREE.Color(b), mats: new Set() }));
  h.traverse(x => { if (x.isMesh && x.material && x.material.color && !x.userData.isHull) sets.forEach(S => { if (x.material.color.getHex() === S.hex) S.mats.add(x.material); }); });
  const tmp = new THREE.Color();
  h.green = (k) => { sets.forEach(S => { tmp.copy(S.A).lerp(S.B, Math.max(0, Math.min(1, k))); S.mats.forEach(m => m.color.copy(tmp)); }); };
  return h;
}
// sunny meadow: grass, bushes, flowers, a few trees, sky dome with clouds
export function meadow(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 38, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0] });
  const sky = sunnySky(st, { clouds: 9, seed: o.seed || 4 });
  const g = new THREE.Group(); st.add(g);
  g.add(floor(400, 400, '#a9c95e', 0, 0));
  const r = rng(o.seed || 4);
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 70, z = -8 - r() * 60; const b = new THREE.Group(); const c = ['#5d9e3c', '#6aad44', '#4f8f36'][i % 3];
    for (let k = 0; k < 3; k++) b.add(ball(0.9 + r() * 0.8, c, (k - 1) * 0.9, 0.6 + r() * 0.3, 0, 14)); b.position.set(x, 0, z); b.scale.setScalar(1 + r()); g.add(b); }
  for (let i = 0; i < 6; i++) { const t = new THREE.Group(); t.add(cyl(0.25, 0.35, 3, '#7a5032', 0, 1.5, 0, 10)); for (let k = 0; k < 4; k++) t.add(ball(1.3 + r() * 0.5, '#4f9a3a', (r() - 0.5) * 1.6, 3.4 + r() * 1.2, (r() - 0.5) * 1.2, 14));
    t.position.set((i % 2 ? 1 : -1) * (9 + r() * 20), 0, -16 - r() * 30); t.scale.setScalar(1.2 + r() * 0.6); outline(t, { px: 2.2 }); g.add(t); }
  for (let i = 0; i < 70; i++) { const f = ball(0.08, ['#fff3a0', '#ffffff', '#ff9ec2', '#ffd23a'][i % 4], (r() - 0.5) * 24, 0.06, 6 - r() * 22, 6); f.userData.noOutline = true; g.add(f); }
  return { stage: st, sky, ground: g };
}
// a giant terracotta flower pot (the payoff)
export function bigPot(s = 1) { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.75, 0.01], [0.95, 1.2], [1.08, 1.25], [1.1, 1.5], [0.001, 1.5]], '#c4673a', 28)); const soil = cyl(0.98, 0.98, 0.06, '#5a3a24', 0, 1.42, 0, 28); soil.userData.noOutline = true; g.add(soil); outline(g, { px: 2.6 }); g.scale.setScalar(s); g.top = 1.45 * s; g.add(blob(1.3, 0.35)); return g; }
// a sunflower in a pot (scale ~ hero height)
export function sunflower(s = 1) { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.32, 0.01], [0.4, 0.55], [0.45, 0.6], [0.001, 0.6]], '#c4673a', 20)); g.add(cyl(0.05, 0.06, 2.0, '#4f9a3a', 0, 1.5, 0, 8));
  for (const [y, sd] of [[1.1, 1], [1.6, -1]]) { const l = ball(0.22, '#5fae3e', sd * 0.25, y, 0, 12); l.scale.set(1.4, 0.35, 0.8); g.add(l); }
  const head = new THREE.Group(); head.position.set(0, 2.55, 0.05); g.add(head); for (let i = 0; i < 14; i++) { const p = ball(0.2, '#ffcc22', 0, 0, 0, 10); const a = i / 14 * Math.PI * 2; p.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0); p.scale.set(1.3, 0.5, 0.25); p.rotation.z = a; head.add(p); }
  const c = cyl(0.3, 0.3, 0.14, '#6a3a1a', 0, 0, 0.04, 20); c.rotation.x = Math.PI / 2; head.add(c); g.head = head; outline(g, { px: 2.4 }); g.scale.setScalar(s); g.add(blob(0.5, 0.3)); return g; }
// a full tennis court (23.77 x 10.97 m ~ 31.7 x 14.6 units) in skin green, with white lines and a net
export function court() { const g = new THREE.Group(); const L = 31.7, W = 14.6;
  const surf = floor(L + 8, W + 6, '#4fa83a', 0, 0); surf.position.y = 0.01; g.add(surf); const inner = floor(L, W, GREEN, 0, 0); inner.position.y = 0.02; g.add(inner);
  const line = (w, d, x, z) => { const m = floor(w, d, '#ffffff', x, z); m.position.y = 0.03; g.add(m); };
  const lw = 0.1; line(L, lw, 0, -W / 2); line(L, lw, 0, W / 2); line(L, lw, 0, -W / 2 + 1.83); line(L, lw, 0, W / 2 - 1.83); line(lw, W, -L / 2, 0); line(lw, W, L / 2, 0);
  line(lw, W - 3.66, -8.5, 0); line(lw, W - 3.66, 8.5, 0); line(17, lw, 0, 0);
  const net = new THREE.Group(); net.add(cyl(0.08, 0.08, 1.4, '#3a3f4a', 0, 0.7, -W / 2 - 1.2, 8), cyl(0.08, 0.08, 1.4, '#3a3f4a', 0, 0.7, W / 2 + 1.2, 8));
  const mesh = plane(W + 2.4, 1.1, '#2a2e36', 0, 0.62, 0); mesh.rotation.y = Math.PI / 2; mesh.material = toon('#2a2e36', { transparent: true, opacity: 0.55, fresh: true }); net.add(mesh);
  const tape = box(0.05, 0.1, W + 2.4, '#ffffff', 0, 1.2, 0); net.add(tape); g.add(net); return g; }
