// shared helpers for "Penny Off the Empire State Building" (penny-drop). Underscore = not auto-loaded.
// An original art-deco skyscraper (setbacks + spire), the observation deck (parapet + curved fence), the city far below,
// a street at the foot of the tower, a toon penny, a toon leaf, the cast (HERO, TOMAS, DR LIN) in the sunny look.
import { E, wordTime, text, ease, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, box, cyl, ball, plane, floor, blob } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };

export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.13) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
const R = (s) => () => (s = (s * 9301 + 49297) % 233280) / 233280;
const G = (...k) => { const g = new THREE.Group(); k.forEach(x => x && g.add(x)); return g; };

// window grid textures (stone piers + glass), cached per colour
const _tex = new Map();
export function winTex(stone = '#d8cbb0', glass = '#5f86b0', cols = 6, rows = 10, lit = 0) { const k = [stone, glass, cols, rows, lit].join(); if (_tex.has(k)) return _tex.get(k);
  const r = R(cols * 31 + rows); const t = canvasTex(256, 256, (g, W, H) => { g.fillStyle = stone; g.fillRect(0, 0, W, H); const cw = W / cols, rh = H / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { g.fillStyle = r() < lit ? '#f6dd9a' : glass; g.fillRect(i * cw + cw * 0.22, j * rh + rh * 0.18, cw * 0.56, rh * 0.62); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(i * cw + cw * 0.22, j * rh + rh * 0.18, cw * 0.18, rh * 0.62); }
    g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < cols; i++) g.fillRect(i * cw, 0, cw * 0.1, H); }, { repeat: [1, 1] }); t.wrapS = t.wrapT = THREE.RepeatWrapping; _tex.set(k, t); return t; }
function towerBox(w, h, d, o = {}) { const t = winTex(o.stone, o.glass, o.cols || 6, o.rows || 10).clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / (o.unit || 3))), Math.max(1, Math.round(h / (o.unit || 3) * 0.9)));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon('#ffffff', { map: t })); m.castShadow = m.receiveShadow = true; return m; }

// the art-deco tower (original design): wide base, setbacks, a tall shaft, stepped crown, a mast + needle. Scale s (height ~ 100*s)
export function tower(o = {}) { const s = o.s || 1, st = '#dcd0b4'; const g = new THREE.Group(); let y = 0;
  const tiers = [[34, 10, 30], [26, 6, 24], [20, 52, 18], [16, 6, 15], [13, 6, 12], [10, 4, 9]];
  tiers.forEach(([w, h, d]) => { const m = towerBox(w * s, h * s, d * s, { stone: st }); m.position.y = (y + h / 2) * s; g.add(m); y += h; });
  const crown = [[8, 3], [6.5, 3], [5, 3], [3.6, 4]]; crown.forEach(([w, h]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w * s, h * s, w * s), toon('#e8dcc0')); m.position.y = (y + h / 2) * s; m.castShadow = true; g.add(m); y += h; });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.0 * s, 1.6 * s, 10 * s, 12), toon('#cfd4da')); mast.position.y = (y + 5) * s; g.add(mast); y += 10;
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.35 * s, 12 * s, 8), toon('#b8bec6')); needle.position.y = (y + 6) * s; g.add(needle);
  g.userData.deckY = 72 * s; return g; }

// city blocks around a centre (a grid of boxes with window textures + streets), seen from above or from the street
export function city(o = {}) { const { n = 9, block = 14, street = 5, seed = 4, skip = [0, 0], hMin = 6, hMax = 40 } = o; const r = R(seed); const g = new THREE.Group();
  const stones = ['#cfc3a8', '#b9a58a', '#c98a6a', '#a8b4c0', '#d8d0c0', '#9a8a7a', '#c0b090'], glasses = ['#5f86b0', '#4a6a8a', '#6f9ac0'];
  const pitch = block + street; const gr = new THREE.Mesh(new THREE.PlaneGeometry(pitch * (n * 2 + 2), pitch * (n * 2 + 2)), toon('#6a6e76')); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; g.add(gr);
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) { if (Math.abs(i) <= skip[0] && Math.abs(j) <= skip[1]) continue;
    const side = new THREE.Mesh(new THREE.PlaneGeometry(block + 1.2, block + 1.2), toon('#a8a49c')); side.rotation.x = -Math.PI / 2; side.position.set(i * pitch, 0.05, j * pitch); g.add(side);
    const parts = r() < 0.5 ? 1 : 2; for (let p = 0; p < parts; p++) { const w = parts === 1 ? block * (0.7 + r() * 0.25) : block * 0.45, d = block * (0.6 + r() * 0.35), far = Math.hypot(i, j); const h = hMin + r() * (hMax - hMin) * (far < 3 ? 0.6 : 1);
      const m = towerBox(w, h, d, { stone: stones[Math.floor(r() * stones.length)], glass: glasses[Math.floor(r() * 3)], unit: 3.2 }); m.position.set(i * pitch + (parts === 1 ? 0 : (p ? 1 : -1) * block * 0.26), h / 2, j * pitch); g.add(m);
      if (r() < 0.35) { const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 10), toon('#7a5a3a')); tank.position.set(m.position.x, h + 0.8, m.position.z); g.add(tank); } } }
  return g; }

// the toon penny: copper disc, rim, a raised profile, "1¢". Radius 0.5 at scale 1
let _pt; export function penny(o = {}) { _pt ||= canvasTex(256, 256, (g, W) => { const c = W / 2; const gr = g.createRadialGradient(c * 0.8, c * 0.7, 10, c, c, c); gr.addColorStop(0, '#f0a868'); gr.addColorStop(1, '#b8622e'); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
    g.strokeStyle = '#8a4220'; g.lineWidth = 10; g.beginPath(); g.arc(c, c, c - 14, 0, 7); g.stroke(); g.fillStyle = '#c8723c'; g.beginPath(); g.ellipse(c - 6, c - 4, 56, 74, 0, 0, 7); g.fill(); g.fillStyle = '#9a4c24'; g.beginPath(); g.ellipse(c + 22, c - 30, 18, 14, 0.4, 0, 7); g.fill();
    g.fillStyle = '#8a4220'; g.font = '900 44px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('1¢', c, W - 40); });
  const s = o.scale || 1; const g = new THREE.Group(); const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.07, 36), toon('#b8622e')); g.add(edge);
  for (const sy of [1, -1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.49, 36), toon('#ffffff', { map: _pt, emissive: new THREE.Color('#5a2a10'), emissiveIntensity: 0.25 })); f.rotation.x = -sy * Math.PI / 2; f.position.y = sy * 0.036; f.userData.noOutline = true; g.add(f); }
  outline(edge, { px: 2.6 }); const outer = new THREE.Group(); outer.add(g); outer.coin = g; outer.scale.setScalar(s); outer.height = 0.6 * s;
  // tumble like a leaf: rock side to side + flip; k = how leafy (0 spin only)
  outer.flutter = (t, k = 1, ph = 0) => { g.rotation.set(Math.PI / 2 + Math.sin(t * 3.1 + ph) * 1.1 * k + t * 7 * (1 - k), t * 1.3, Math.sin(t * 2.3 + ph) * 0.6 * k); return Math.sin(t * 3.1 + ph); };
  return outer; }

// a toon autumn leaf (flat, double sided) with a stem
export function leaf(o = {}) { const t = canvasTex(256, 256, (g, W) => { g.translate(W / 2, W / 2); g.fillStyle = o.color || '#e8902a'; g.beginPath(); g.moveTo(0, -110); g.bezierCurveTo(90, -70, 90, 60, 0, 110); g.bezierCurveTo(-90, 60, -90, -70, 0, -110); g.fill();
    g.strokeStyle = '#2a1c15'; g.lineWidth = 9; g.stroke(); g.strokeStyle = '#a8501a'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -95); g.lineTo(0, 120); for (let i = -2; i <= 2; i++) { g.moveTo(0, i * 30); g.lineTo(i % 2 ? 40 : -40, i * 30 - 30); g.moveTo(0, i * 30); g.lineTo(i % 2 ? -40 : 40, i * 30 - 30); } g.stroke(); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), toon('#ffffff', { map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); m.userData.noOutline = true; m.castShadow = true;
  const inner = new THREE.Group(); inner.add(m); m.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(inner); g.scale.setScalar(o.scale || 1); g.height = 0.6;
  g.flutter = (t, ph = 0) => { inner.rotation.set(Math.sin(t * 2.6 + ph) * 0.9, t * 0.7, Math.sin(t * 2.0 + ph) * 0.5); return Math.sin(t * 2.6 + ph); }; return g; }

// THE DECK: stone parapet + the curved-in steel fence, the tower wall behind, the city ~180 units below
export function deck(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 6, target: o.target || [0, 0, 0], fog: [70, 330, '#cfe0ee'] });
  const sky = sunnySky(st, { clouds: 9, seed: o.seed || 3, height: [0.02, 0.2] });
  const floorM = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), toon('#c8bca4')); floorM.rotation.x = -Math.PI / 2; floorM.position.set(0, 0, -0.5); floorM.receiveShadow = true; st.add(floorM);
  const wall = towerBox(20, 9, 1, { stone: '#dcd0b4', unit: 2.5 }); wall.position.set(0, 4.5, -3.2); st.add(wall);
  const par = G(rbox(20, 1.25, 0.7, '#d4c8ac', 0, 0.62, 2.2, 0.06), rbox(20.2, 0.16, 0.86, '#bfb294', 0, 1.3, 2.2, 0.04)); outline(par, { px: 2.2 }); st.add(par);
  const fence = new THREE.Group(); const bar = toon('#3a4048'); for (let x = -10; x <= 10; x += 0.42) { if (Math.abs(x) < (o.gap ?? 4.2)) continue; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 5), bar); b.position.set(x, 2.6, 2.35); fence.add(b);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 5), bar); tip.position.set(x, 4.25, 2.15); tip.rotation.x = -0.6; fence.add(tip); }
  const gp = o.gap ?? 4.2; for (const y of [1.45, 2.4, 3.85]) for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(10 - gp, 0.06, 0.06), bar); r.position.set(sx * (gp + (10 - gp) / 2), y, 2.35); fence.add(r); } st.add(fence);
  const c = city({ n: 8, block: 14, street: 5, seed: 6, skip: [1, 1], hMin: 8, hMax: 46 }); c.position.set(0, -180, 0); st.add(c);
  const face = towerBox(22, 178, 8, { stone: '#dcd0b4', unit: 2.6 }); face.position.set(0, -89, -1.45); st.add(face);
  const base = towerBox(40, 40, 30, { stone: '#d4c8ac', unit: 3 }); base.position.set(0, -160, -2); st.add(base);
  const deckObj = { stage: st, sky, fence, wall, city: c, parTop: 1.38, edgeZ: 2.2 };
  return deckObj;
}

// THE STREET at the foot of the tower: sidewalk, road, a yellow cab, facades, the tower soaring up behind
export function street(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 1] });
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 5 });
  st.add(floor(80, 10, '#b4aea4', 0, -1)); st.add(floor(80, 12, '#4a4c54', 0, 10)); for (let x = -40; x < 40; x += 4) st.add(floor(2, 0.18, '#f2d24a', x, 10));
  const curb = box(80, 0.15, 0.3, '#9a958c', 0, 0.075, 4.0); st.add(curb);
  const tw = tower({ s: 1.1 }); tw.position.set(0, 0, -46); st.add(tw);
  [[-26, -8, 18, 30, 1], [26, -8, 18, 24, 2], [-14, -6, 8, 14, 3], [14, -6, 8, 16, 4]].forEach(([x, z, w, h, sd]) => { const m = towerBox(w, h, 8, { stone: ['#c98a6a', '#b9a58a', '#cfc3a8', '#a8b4c0'][sd % 4], unit: 3 }); m.position.set(x, h / 2, z - 4); st.add(m); });
  const cab = taxi(); cab.position.set(o.cabX ?? 7, 0, 7.5); st.add(cab);
  const lamp = G(cyl(0.08, 0.1, 4.2, '#2e3a36', 0, 2.1, 0, 8), rbox(0.5, 0.2, 0.3, '#2e3a36', 0.25, 4.2, 0, 0.04)); outline(lamp, { px: 2 }); lamp.position.set(-4.5, 0, 3.6); st.add(lamp);
  return { stage: st, sky, tower: tw, cab };
}
export function taxi() { const g = G(rbox(4.2, 1.0, 1.9, '#f2c230', 0, 0.75, 0, 0.12), rbox(2.4, 0.8, 1.7, '#f2c230', -0.2, 1.55, 0, 0.12), box(2.2, 0.6, 1.72, '#7fb4d8', -0.2, 1.55, 0), rbox(0.7, 0.25, 0.4, '#ffffff', -0.2, 2.05, 0, 0.05));
  for (const [x, z] of [[-1.4, 0.9], [1.4, 0.9], [-1.4, -0.9], [1.4, -0.9]]) { const w = cyl(0.42, 0.42, 0.3, '#22242a', x, 0.42, z, 16); w.rotation.x = Math.PI / 2; g.add(w); }
  const chk = box(4.22, 0.14, 1.92, '#22242a', 0, 0.95, 0); g.add(chk); g.add(blob(2.4, 0.3)); outline(g, { px: 2.4 }); return g; }

// cast + passers-by
export const hero = () => castMember('hero');
export const tomas = () => castMember('tomas');
export const lin = () => castMember('lin');
const SK = ['fair', 'tan', 'light', 'olive', 'brown', 'dark'];
export const local = (i = 0, o = {}) => bean({ name: 'Local', outfit: i % 2 ? 'hoodie' : 'tee', colors: { main: ['#3a6aa8', '#c0603a', '#5a8a4a', '#8a4a8a', '#d0a040', '#4a8a8a'][i % 6], legsTop: '#3a3a4a' }, head: i % 3 === 0 ? 'beanie' : 'none', headColor: ['#c0392b', '#2f6fc0', '#3a8a4a'][i % 3], skin: SK[i % SK.length], hair: ['messy', 'bowl', 'curly', 'bob', 'spiky'][i % 5], hairColor: ['#3a2618', '#6a4428', '#1e1612', '#8a6a3a'][i % 4], seed: 300 + i, ...o });
