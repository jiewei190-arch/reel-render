// The Green Children of Woolpit — shared assets (a medieval LEGEND, told as one): the two green children, hooded villagers,
// the Woolpit harvest field with its wolf pit, a cottage interior (table, hearth), the girl's twilight green land,
// plus 2D overlay helpers (hook text, stamps, speech bubble with unknown glyphs). Underscore = not auto-loaded.
// Tone guard: the boy's death is said gently and never shown; nobody mocked; no gore.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { fire, smoke, glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// ---------------------------------------------------------------- THE CHILDREN
export const GREEN = '#7fbf5a', GREEN_LID = shadeHex(GREEN, -0.06);
const PINK = new THREE.Color('#ecc9aa'), PINK_LID = new THREE.Color(shadeHex('#ecc9aa', -0.06));
// setGreen(k): 1 = fully green skin, 0 = faded to ordinary skin. The kids share one cached material, so every shot sets it.
export function setGreen(k = 1) {
  toon(GREEN).color.set(GREEN).lerp(PINK, 1 - clamp(k));
  toon(GREEN_LID).color.set(GREEN_LID).lerp(PINK_LID, 1 - clamp(k));
}
export function girl(o = {}) { return bean({ name: 'Girl', outfit: 'tunic', colors: { main: '#2f8a86', belt: '#c9a14a', stripe: '#e8c25a' }, skin: GREEN, hair: 'long', hairColor: '#3a2416', seed: o.seed || 21, scale: o.scale || 0.86, headScale: [1.06, 1.04, 1.04] }); }
export function boy(o = {}) { return bean({ name: 'Boy', outfit: 'tunic', colors: { main: '#6a4a8a', belt: '#c9a14a', stripe: '#e8c25a' }, skin: GREEN, hair: 'bowl', hairColor: '#4a2e1a', seed: o.seed || 23, scale: o.scale || 0.74, headScale: [1.1, 1.06, 1.06] }); }
// villagers: hooded harvest folk in earthy tunics
const VIL = [
  { outfit: 'tunic', colors: { main: '#8a5a32' }, skin: 'fair', hair: 'bowl', hairColor: '#6a4a2a', head: 'hood', headColor: '#6a7a3a', beard: true, beardColor: '#6a4a2a' },
  { outfit: 'tunic', colors: { main: '#a0603a' }, skin: 'light', hair: 'bun', hairColor: '#8a5a2a', head: 'none' },
  { outfit: 'rags', colors: { main: '#7a6a52' }, skin: 'tan', hair: 'horseshoe', hairColor: '#9a9590', head: 'none' },
  { outfit: 'tunic', colors: { main: '#5a6a8a' }, skin: 'fair', hair: 'curly', hairColor: '#c08a3a', head: 'hood', headColor: '#8a3a2a' },
];
export function villager(i = 0, o = {}) { return bean({ name: 'Villager', ...VIL[i % VIL.length], seed: 30 + i, ...o }); }

// a broad-bean pod (fat green pod with bumps) and a single bean
export function beanPod(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#6fae3a';
  const pod = ball(0.12, c, 0, 0, 0, 16); pod.scale.set(1, 0.42, 2.4); g.add(pod);
  for (let i = -1; i <= 1; i++) { const b = ball(0.07, shadeHex(c, 0.12), 0, 0.035, i * 0.13, 12); b.scale.set(1, 0.7, 1.1); b.userData.noOutline = true; g.add(b); }
  outline(g, { px: 2.4 }); return g;
}
export function bowl(o = {}) {
  const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0], [0.18, 0.01], [0.3, 0.1], [0.34, 0.16]].map(([r, y]) => new THREE.Vector2(r, y)), 20), toon(o.color || '#a0703a', { side: THREE.DoubleSide })); b.castShadow = true; g.add(b);
  if (o.fill) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), toon(o.fill)); f.rotation.x = -Math.PI / 2; f.position.y = 0.12; f.userData.noOutline = true; g.add(f); }
  outline(g, { px: 2.4 }); return g;
}
export function bread() { const g = new THREE.Group(); const b = ball(0.22, '#c98a3a', 0, 0.1, 0, 16); b.scale.set(1.4, 0.7, 1); g.add(b); outline(g, { px: 2.4 }); return g; }

// ---------------------------------------------------------------- SETS
const sph = new THREE.SphereGeometry(1, 16, 12);
export function roundTree(o = {}) {
  const g = new THREE.Group(); const s = o.s || 1, c = o.color || '#4f8a3a'; const r = rng(o.seed || 3);
  g.add(cyl(0.18 * s, 0.25 * s, 2.2 * s, o.trunk || '#6a4a2e', 0, 1.1 * s, 0, 8));
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(sph, toon(i % 2 ? c : shadeHex(c, 0.1))); const k = (i ? 0.9 + r() * 0.4 : 1.5) * s; b.scale.set(k, k * 0.9, k); b.position.set(i ? (r() - 0.5) * 1.8 * s : 0, (2.8 + (i ? r() * 0.9 : 0.4)) * s, i ? (r() - 0.5) * 1.2 * s : 0); b.castShadow = true; g.add(b); }
  outline(g, { px: 2.2 }); return g;
}
// triangular prism roof along X, apex up, base at y0
export function prismRoof(len, r, color, y0 = 0, sy = 0.7) {
  const geo = new THREE.CylinderGeometry(r, r, len, 3).rotateY(Math.PI / 2).rotateZ(Math.PI / 2); geo.scale(1, sy, 1);
  const m = new THREE.Mesh(geo, toon(color)); m.position.y = y0 + r * 0.5 * sy; m.castShadow = true; m.receiveShadow = true; return m;
}
// thatched cottage: plaster walls with timber posts, a fat straw roof, a dark door
export function cottage(o = {}) {
  const g = new THREE.Group(); const w = o.w || 4, d = o.d || 3, h = o.h || 2.2;
  g.add(rbox(w, h, d, o.wall || '#ece0c4', 0, h / 2, 0, 0.06));
  for (const x of [-w / 2, -w / 6, w / 6, w / 2]) g.add(rbox(0.16, h, 0.06, '#5a3a22', x * 0.98, h / 2, d / 2 + 0.01, 0.02));
  g.add(rbox(w * 0.98, 0.14, 0.06, '#5a3a22', 0, h * 0.55, d / 2 + 0.02, 0.02));
  g.add(prismRoof(w * 1.12, d * 0.78, o.thatch || '#d9b25a', h));
  g.add(rbox(0.7, 1.3, 0.08, '#3a2618', w * 0.18, 0.65, d / 2 + 0.03, 0.03));
  g.add(rbox(0.5, 0.45, 0.08, '#2a3a4a', -w * 0.28, h * 0.62, d / 2 + 0.03, 0.03));
  outline(g, { px: 2.2 }); return g;
}
// a square stone church tower (Woolpit's church, stylised), far in the background
export function churchTower(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#c9bfa8';
  g.add(rbox(2.4, 7, 2.4, c, 0, 3.5, 0, 0.05));
  for (const x of [-0.9, 0, 0.9]) for (const z of [-0.9, 0.9]) g.add(rbox(0.5, 0.5, 0.5, c, x, 7.25, z, 0.04));
  g.add(rbox(0.5, 1.0, 0.1, '#3a3036', 0, 5.6, 1.22, 0.05));
  const nave = rbox(3.2, 3.2, 6, shadeHex(c, -0.05), 0, 1.6, -4, 0.05); g.add(nave);
  const nr = prismRoof(6.2, 2.2, '#8a6a5a', 3.2); nr.rotation.y = Math.PI / 2; nr.position.z = -4; g.add(nr);
  outline(g, { px: 2.0 }); return g;
}
// the wolf pit: a dark round hole in the ground, a rim of dug earth, a few fallen cover branches
export function wolfPit(o = {}) {
  const g = new THREE.Group(); const R = o.r || 1.3;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.28, 8, 28), toon('#7a5a3a')); rim.rotation.x = -Math.PI / 2; rim.scale.z = 0.5; rim.position.y = 0.04; rim.receiveShadow = true; g.add(rim);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(R, 32), flat(o.inside || '#1a1410')); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.03; hole.userData.noOutline = true; g.add(hole);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.8, 1.2, 28, 1, true), toon('#4a3626', { side: THREE.BackSide })); inner.position.y = -0.58; inner.userData.noOutline = true; g.add(inner);
  const r = rng(o.seed || 5);
  for (let i = 0; i < 5; i++) { const a = r() * Math.PI * 2; const st = cyl(0.04, 0.05, 1.4 + r() * 0.6, '#6a4a2a', Math.cos(a) * (R + 0.35), 0.08, Math.sin(a) * (R + 0.35), 6); st.rotation.set(Math.PI / 2, 0, a + 0.4 + r()); g.add(st); }
  for (let i = 0; i < 6; i++) { const a = r() * Math.PI * 2; const tf = ball(0.18 + r() * 0.1, '#5f8a3a', Math.cos(a) * (R + 0.5), 0.08, Math.sin(a) * (R + 0.5), 8); tf.scale.y = 0.6; g.add(tf); }
  outline(g, { px: 2.4 }); g.R = R; g.hole = hole; return g;
}
// Woolpit at harvest: grass, a golden wheat field behind, hedges, round trees, thatched cottages, the church tower, sunny sky
export function woolpitField(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4);
  g.add(floor(220, 220, o.grass || '#8fbf5a', 0, -60));
  const [fw, fd, fz] = o.field || [30, 12, -11];
  if (fw) { const n = Math.round(fw * fd * 8); const geo = new THREE.ConeGeometry(0.06, 1.0, 4); geo.translate(0, 0.5, 0);
    const wm = new THREE.InstancedMesh(geo, toon('#e0b452'), n); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color(); const cs = ['#e0b452', '#d4a242', '#ebc468', '#c99a3a'];
    for (let i = 0; i < n; i++) { const x = (r() - 0.5) * fw + (o.fieldX || 0), z = fz + (r() - 0.5) * fd; e.set((r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.3); q.setFromEuler(e); const h = 0.7 + r() * 0.35; m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, h, 1)); wm.setMatrixAt(i, m4); wm.setColorAt(i, col.set(cs[i % 4])); }
    wm.receiveShadow = true; g.add(wm); const fb = floor(fw, fd, '#c8a050', o.fieldX || 0, fz); fb.position.y = 0.01; g.add(fb);
    // a few sheaves already cut
    for (let i = 0; i < 4; i++) { const sx = (o.fieldX || 0) - fw / 2 + 3 + i * 2.2, sz = fz + fd / 2 + 1.2; const sh = cyl(0.2, 0.32, 0.9, '#e6bd5a', sx, 0.45, sz, 10); g.add(sh); g.add(cyl(0.22, 0.22, 0.08, '#9a7a3a', sx, 0.5, sz, 10)); } }
  const trees = [[-14, -24, 1.4, '#4f8a3a'], [16, -22, 1.2, '#5a9a42'], [-22, -40, 1.8, '#4a7f36'], [24, -42, 1.6, '#4f8a3a'], [8, -46, 1.5, '#5a9a42'], [-6, -50, 1.7, '#4a7f36']];
  trees.forEach(([x, z, s, c], i) => { const t = roundTree({ s, color: c, seed: i + 2 }); t.position.set(x, 0, z); g.add(t); });
  for (let i = 0; i < 9; i++) { const h = ball(1.2 + r() * 0.5, '#4f7f36', -24 + i * 6, 0.7, -19 - r() * 2, 12); h.scale.set(2.2, 0.9, 1); g.add(h); }
  const cots = [[-9, -30, 0.3], [-3, -34, -0.1], [11, -31, -0.35]];
  cots.forEach(([x, z, ry], i) => { const c = cottage({ wall: i % 2 ? '#e8d8b8' : '#efe4cc', thatch: i % 2 ? '#d0a54e' : '#dcb760' }); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); });
  if (o.church !== false) { const ch = churchTower(); ch.position.set(o.churchX ?? 4, 0, -40); ch.rotation.y = -0.4; g.add(ch); }
  let pit = null; if (o.pit !== false) { pit = wolfPit(); pit.position.set(...(o.pitAt || [0, 0, 0])); g.add(pit); }
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 24, z = 2 - r() * 14; if (Math.hypot(x - (o.pitAt?.[0] || 0), z - (o.pitAt?.[2] || 0)) < 2.4) continue; const tf = ball(0.15 + r() * 0.12, r() < 0.5 ? '#6f9f45' : '#7fae4f', x, 0.05, z, 8); tf.scale.y = 0.55; tf.userData.noOutline = true; g.add(tf); }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, pit, update(t) { sky.update(t); } };
}
// cottage interior (the manor where the children were taken): plaster walls, timber beams, a hearth with a fire, a table
export function cottageRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), PR.texMat(PR.TEX.planks('#7a5534', [6, 4], 8))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.userData.noOutline = true; g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), PR.texMat(PR.TEX.plaster('#e6d6b6', [4, 2]))); wall.position.set(0, 5, -4); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  for (const x of [-6, -2.5, 2.5, 6]) g.add(box(0.3, 10, 0.2, '#5a3a22', x, 5, -3.9));
  g.add(box(30, 0.3, 0.3, '#5a3a22', 0, 5.6, -3.85));
  // window with daylight
  const win = plane(1.4, 1.6, '#bfe0ff', -4.25, 3.6, -3.88); g.add(win); g.add(rbox(1.6, 0.12, 0.2, '#5a3a22', -4.25, 2.75, -3.8, 0.03));
  // hearth
  if (o.hearth !== false) { const hx = o.hearthX ?? 4.3; g.add(rbox(2.4, 2.2, 0.8, '#a89a88', hx, 1.1, -3.6, 0.08)); g.add(box(1.4, 1.1, 0.3, '#2a1c16', hx, 0.6, -3.15));
    const f = fire({ size: 0.6, tongues: 5, seed: 2, light: o.fireLight ?? 1.2, lightRange: 8 }); f.position.set(hx, 0.2, -3.0); g.add(f); g.fire = f;
    for (let i = 0; i < 3; i++) g.add(cyl(0.07, 0.07, 0.9, '#5a3a22', hx - 0.3 + i * 0.3, 0.12, -3.0, 6).rotateZ(Math.PI / 2)); }
  const tb = PR.table({ w: 3.2, d: 1.3, h: 1.0, color: '#6a4a30' }); tb.position.set(0, 0, 0.4); g.add(tb);
  g.add(PR.shelf ? (() => { const sh = PR.shelf({ w: 1.6, h: 2.0, color: '#6a4228', seed: 4 }); sh.position.set(-1.6, 0, -3.5); return sh; })() : new THREE.Group());
  outline(tb, { px: 2.4 });
  return { group: g, tableY: 1.06, fire: g.fire, update(t) { g.fire && g.fire.update(t); } };
}
// the girl's story: a land where the sun never shone, light like twilight, everything green (a storybook memory)
export function greenLand(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 9);
  g.add(floor(240, 240, '#4f9a5a', 0, -60));
  for (let i = 0; i < 7; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(i % 2 ? '#3f8a5a' : '#4aa066')); h.scale.set(14 + r() * 10, 3 + r() * 4, 8); h.position.set(-50 + i * 17, 0, -30 - r() * 25); h.userData.noOutline = true; g.add(h); }
  for (let i = 0; i < 9; i++) { const t = roundTree({ s: 0.9 + r() * 0.8, color: i % 2 ? '#2f8a5a' : '#3fa070', trunk: '#3a6a3a', seed: i + 11 }); t.position.set(-16 + i * 4 + r() * 2, 0, -10 - r() * 14); g.add(t); }
  // green cottages (everything green)
  for (let i = 0; i < 2; i++) { const c = cottage({ wall: '#a8d8a0', thatch: '#5aa04a' }); c.position.set(i ? 7 : -8, 0, -16 - i * 3); c.rotation.y = i ? -0.4 : 0.3; g.add(c); }
  // green cattle grazing (the children said they had been herding their father's cattle)
  for (let i = 0; i < 3; i++) { const cw = cow({ color: i % 2 ? '#5aa060' : '#6ab070' }); cw.position.set(-5 + i * 4.2, 0, -6 - (i % 2) * 2.5); cw.rotation.y = 0.6 - i * 0.5; g.add(cw); }
  // dim twilight sky: no sun, a teal-violet gradient, a pale band at the horizon
  const sky = sunnySky(st, { top: '#2a3a5a', mid: '#3f6a6a', horizon: '#8fc49a', glow: 0, clouds: 5, cloudColor: '#6f8f8a', seed: 5 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
export function cow(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#6ab070';
  const b = ball(0.6, c, 0, 1.0, 0, 16); b.scale.set(0.8, 0.7, 1.35); g.add(b);
  const h = ball(0.32, c, 0, 1.25, 0.95, 14); h.scale.set(0.9, 0.9, 1.1); g.add(h);
  const sn = ball(0.2, shadeHex(c, 0.3), 0, 1.15, 1.22, 12); sn.scale.set(1.1, 0.8, 0.7); g.add(sn);
  for (const s of [-1, 1]) { g.add(cyl(0.08, 0.07, 0.75, shadeHex(c, -0.15), s * 0.28, 0.38, 0.5, 8), cyl(0.08, 0.07, 0.75, shadeHex(c, -0.15), s * 0.28, 0.38, -0.55, 8));
    const horn = cyl(0.03, 0.05, 0.22, '#e8e0c8', s * 0.2, 1.52, 0.9, 6); horn.rotation.z = -s * 0.6; g.add(horn); }
  outline(g, { px: 2.2 }); return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text: lines near the top (below the Shorts top bar); colors per line, words in `red` drawn red
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = o.noPop ? 1 : ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * ((o.size || 66) * 1.5)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 66, { color: (o.colors && o.colors[i]) || '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 }); g.restore(); });
}
// two-tone line: [[text, colour], ...] centred at y
export function richLine(g, parts, y, size, o = {}) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { insT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: CARD_INK }); x += ws[i] + sp; }); g.restore();
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, text.length * s * 0.62 + s * 0.6, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.9 });
  g.restore();
}
// speech bubble full of unknown glyphs (the language nobody knew) — invented squiggles, not a real script
export function glyphBubble(g, t, x, y, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const W = o.w || 520, H = o.h || 200; g.save(); g.globalAlpha = fade; g.translate(x, y); g.scale(k, k);
  g.fillStyle = '#fffaf0'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.lineJoin = 'round';
  g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 60); g.moveTo(o.tail?.[0] ?? -60, H / 2 - 4); g.lineTo(o.tail?.[1] ?? -120, H / 2 + 70); g.lineTo(o.tail?.[2] ?? 10, H / 2 - 4); g.fill(); g.stroke();
  g.fillStyle = '#fffaf0'; g.fillRect(-80, H / 2 - 14, 110, 14);
  const r = rng(o.seed || 7), n = o.n || 5, shown = Math.ceil(clamp((t - (o.at || 0)) / 0.6) * n);
  g.strokeStyle = '#2f6a5a'; g.lineWidth = 10; g.lineCap = 'round';
  for (let i = 0; i < shown; i++) { const cx = -W / 2 + 70 + i * ((W - 140) / (n - 1)), cy = Math.sin(t * 6 + i) * 4; g.beginPath();
    const kind = i % 4;
    if (kind === 0) { g.arc(cx, cy - 8, 20, Math.PI * 0.2, Math.PI * 1.7); g.moveTo(cx - 6, cy + 14); g.lineTo(cx + 22, cy + 36); g.moveTo(cx + 18, cy - 40); g.lineTo(cx + 26, cy - 30); }
    else if (kind === 1) { g.moveTo(cx - 24, cy + 30); g.quadraticCurveTo(cx - 30, cy - 40, cx, cy - 34); g.quadraticCurveTo(cx + 30, cy - 28, cx + 6, cy + 4); g.moveTo(cx - 10, cy + 12); g.lineTo(cx + 24, cy + 30); }
    else if (kind === 2) { g.moveTo(cx, cy - 38); g.lineTo(cx, cy + 36); g.moveTo(cx - 22, cy - 16); g.quadraticCurveTo(cx, cy + 6, cx + 22, cy - 16); g.moveTo(cx - 18, cy + 26); g.arc(cx - 18, cy + 26, 6, 0, 6.3); }
    else { g.ellipse(cx, cy - 6, 12, 26, 0.5, 0, 6.3); g.moveTo(cx + 14, cy + 34); g.quadraticCurveTo(cx + 28, cy + 6, cx + 6, cy - 34); }
    g.stroke(); }
  g.restore();
}
// parchment label card (e.g. "WOLF PIT: a trap for wolves")
export function labelCard(g, t, title, sub, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const W = o.w || 640, H = sub ? 160 + (o.subSize || 46) * 1.3 : 140; g.save(); g.globalAlpha = fade; g.translate(o.x ?? E.W / 2, o.y ?? 520); g.rotate(o.rot ?? -0.03); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.roundRect(-W / 2 + 10, -H / 2 + 14, W, H, 24); g.fill();
  g.fillStyle = '#f3e6c4'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 24); g.fill(); g.stroke();
  insT(g, title, 0, sub ? -40 : 4, o.size || 78, { color: o.color || '#b8322a', stroke: null, maxW: W - 60 });
  if (sub) insT(g, sub, 0, 40 + (o.subSize || 46) * 0.45, o.subSize || 46, { color: '#5a4a3a', stroke: null, maxW: W - 60 });
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, fire, smoke, glow, canvasTex };
