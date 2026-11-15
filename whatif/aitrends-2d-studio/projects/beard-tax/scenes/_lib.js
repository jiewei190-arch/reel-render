// Peter the Great's Beard Tax — shared assets: bearded Russians with BIG beards, Peter (clean-shaven, moustache),
// a barber with giant scissors, a patrol, an old-Moscow street with an onion-dome church, the copper beard token
// (3D coin + 2D drawing), a museum hall with a glass case, plus 2D overlays (top hook caption, year stamp).
// Tone guard: LOL only. The scissors snap at air; nobody is ever hurt or shaved on screen.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- CHARACTERS
// bigBeard(b, color) — a huge cartoon beard hung under the bean's chin (mouth stays visible above it)
export function bigBeard(b, color = '#6a3e1e', size = 1) {
  const g = new THREE.Group(); const m = toon(color), m2 = toon(shadeHex(color, -0.12));
  const main = mesh(sph, m, 0.4 * size, 0.5 * size, 0.28 * size); main.position.set(0, -0.6 - 0.12 * (size - 1), 0.2); g.add(main);
  for (const s of [-1, 1]) { const side = mesh(sph, m2, 0.24 * size, 0.34 * size, 0.22 * size); side.position.set(s * 0.26 * size, -0.42, 0.2); g.add(side); }
  const tip = mesh(sph, m2, 0.2 * size, 0.28 * size, 0.18 * size); tip.position.set(0, -0.98 - 0.25 * (size - 1), 0.24); g.add(tip);
  for (const s of [-1, 1]) { const ms = mesh(sph, m2, 0.17, 0.07, 0.08); ms.position.set(s * 0.1, -0.13, 0.46); ms.rotation.z = s * -0.3; g.add(ms); }
  outline(g, { px: 3 }); b.parts.head.add(g); b.beard = g; return g;
}
// a bearded Russian man (kaftan = robe-ish tunic, fur hat = brown beanie)
export function bearded(o = {}) {
  const b = bean({ name: 'Ivan', outfit: 'tunic', colors: { main: o.coat || '#b8432f', trim: '#e2b04a', belt: '#4a2a18' }, skin: o.skin || 'fair',
    hair: 'messy', hairColor: o.hair || '#5a3418', head: 'beanie', headColor: o.hat || '#6a4a30', seed: o.seed || 5 });
  bigBeard(b, o.beard || o.hair || '#6a3e1e', o.size || 1); return b;
}
export function peter(o = {}) {
  return bean({ name: 'Peter', outfit: 'uniform', colors: { main: '#2f6a46', trim: '#e7c35a', belt: '#e7c35a' }, skin: 'fair', hair: 'long', hairColor: '#3a2416',
    moustache: '#2a1a10', seed: o.seed || 3, scale: o.scale || 1.12 });
}
export function barber(o = {}) {
  return bean({ name: 'Barber', outfit: 'tunic', colors: { main: '#f2efe6', trim: '#3a6ab0', belt: '#3a6ab0' }, skin: 'tan', hair: 'bald', moustache: '#2a1a10', seed: o.seed || 9 });
}
export function patrol(o = {}) {
  return bean({ name: 'Patrol', outfit: 'uniform', colors: { main: '#3a4a8a', trim: '#d8c070', belt: '#2a1a12' }, skin: 'light', hair: 'bowl', hairColor: '#2a1a12',
    head: 'cap', headColor: '#2a3366', moustache: true, seed: o.seed || 13 });
}
// giant barber scissors: .snap(k) 0 = open, 1 = closed. Pivot at origin, blades point +X.
export function scissors(o = {}) {
  const g = new THREE.Group(), steel = toon('#cfd6de'), dark = toon('#3a4048'), red = toon(o.handle || '#d23a2e');
  const half = (s) => { const h = new THREE.Group(); const blade = mesh(sph, steel, 1.25, 0.11, 0.05); blade.position.set(1.15, s * 0.04, s * 0.03); h.add(blade);
    const edge = mesh(sph, toon('#f4f8fb'), 1.1, 0.03, 0.055); edge.position.set(1.2, s * -0.05, s * 0.03); edge.userData.noOutline = true; h.add(edge);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 12, 28), red); ring.position.set(-0.85, s * 0.28, s * 0.03); ring.castShadow = true; h.add(ring);
    const arm = mesh(sph, red, 0.4, 0.09, 0.07); arm.position.set(-0.35, s * 0.14, s * 0.03); arm.rotation.z = s * -0.35; h.add(arm); return h; };
  const a = half(1), b = half(-1); g.add(a, b); const pin = mesh(sph, dark, 0.1, 0.1, 0.12); g.add(pin);
  outline(g, { px: 3 });
  g.snap = (k) => { const ang = lerp(0.45, 0.02, clamp(k)); a.rotation.z = ang; b.rotation.z = -ang; };
  g.snap(0); return g;
}

// ---------------------------------------------------------------- TOKEN
// drawToken(g, x, y, r, o) — the copper beard token, flat: beard + moustache on the face, rim of dots; o.side 'back' = text side
export function drawToken(g, x, y, r, o = {}) {
  g.save(); g.translate(x, y); if (o.squash != null) g.scale(o.squash, 1); g.lineJoin = 'round'; const ink = '#3a1e0e';
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); gr.addColorStop(0, '#f0b27a'); gr.addColorStop(0.6, '#c9763e'); gr.addColorStop(1, '#94502a');
  g.fillStyle = gr; g.strokeStyle = ink; g.lineWidth = r * 0.06; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = alpha('#5a2e14', 0.7); g.lineWidth = r * 0.025; g.beginPath(); g.arc(0, 0, r * 0.86, 0, 7); g.stroke();
  g.fillStyle = alpha('#5a2e14', 0.75); for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93, r * 0.025, 0, 7); g.fill(); }
  if (o.side === 'back') {
    g.fillStyle = '#5a2e14'; g.font = `900 ${r * 0.2}px "Nunito", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['ДЕНГИ', 'ВЗЯТЫ'].forEach((l, i) => g.fillText(l, 0, (i - 0.5) * r * 0.3));
  } else {
    // moustache + beard, embossed
    g.fillStyle = '#7a3e1c'; g.strokeStyle = ink; g.lineWidth = r * 0.03;
    g.beginPath(); g.moveTo(-r * 0.5, -r * 0.18); g.quadraticCurveTo(0, -r * 0.42, r * 0.5, -r * 0.18); g.quadraticCurveTo(r * 0.3, r * 0.75, 0, r * 0.68); g.quadraticCurveTo(-r * 0.3, r * 0.75, -r * 0.5, -r * 0.18); g.fill(); g.stroke();
    g.strokeStyle = alpha('#f0b27a', 0.55); g.lineWidth = r * 0.025; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * r * 0.12, -r * 0.05); g.quadraticCurveTo(i * r * 0.15, r * 0.3, i * r * 0.06, r * 0.55); g.stroke(); }
    g.fillStyle = '#6a3416'; g.strokeStyle = ink; g.lineWidth = r * 0.03;
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.22, -r * 0.3, r * 0.26, r * 0.08, s * -0.25, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = '#c9763e'; g.beginPath(); g.ellipse(0, -r * 0.42, r * 0.08, r * 0.1, 0, 0, 7); g.fill();
  }
  // sheen
  g.globalCompositeOperation = 'screen'; const sh = g.createLinearGradient(-r, -r, r, r); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,240,220,.35)'); sh.addColorStop(0.65, 'rgba(255,255,255,0)');
  g.fillStyle = sh; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.restore();
}
// drawDiamondToken — the later rhomboid token (1724/25 per Wikipedia) whose reverse calls the beard a superfluous burden
export function drawDiamondToken(g, x, y, r) {
  g.save(); g.translate(x, y); g.lineJoin = 'round'; const ink = '#3a1e0e';
  const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, '#f0b27a'); gr.addColorStop(0.55, '#c9763e'); gr.addColorStop(1, '#94502a');
  const dia = (k) => { g.beginPath(); g.moveTo(0, -r * k); g.lineTo(r * 0.78 * k, 0); g.lineTo(0, r * k); g.lineTo(-r * 0.78 * k, 0); g.closePath(); };
  g.fillStyle = gr; g.strokeStyle = ink; g.lineWidth = r * 0.05; dia(1); g.fill(); g.stroke();
  g.strokeStyle = alpha('#5a2e14', 0.7); g.lineWidth = r * 0.02; dia(0.86); g.stroke();
  g.fillStyle = '#5a2e14'; g.font = `900 ${r * 0.14}px "Nunito", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  ['БОРОДА', 'ЛИШНЯЯ', 'ТЯГОТА'].forEach((l, i) => g.fillText(l, 0, (i - 1) * r * 0.2));
  g.globalCompositeOperation = 'screen'; const sh = g.createLinearGradient(-r, -r, r, r); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,240,220,.35)'); sh.addColorStop(0.65, 'rgba(255,255,255,0)');
  g.fillStyle = sh; dia(1); g.fill(); g.restore();
}
// 3D token: a thick coin with the beard face on +Z (front) and the text on -Z
export function token3D(o = {}) {
  const g = new THREE.Group(); const r = o.r || 0.5, th = r * 0.14;
  const face = canvasTex(256, 256, (x, w) => { x.clearRect(0, 0, w, w); drawToken(x, w / 2, w / 2, w / 2 - 2); });
  const back = canvasTex(256, 256, (x, w) => { x.clearRect(0, 0, w, w); drawToken(x, w / 2, w / 2, w / 2 - 2, { side: 'back' }); });
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r, r, th, 40), toon('#a85e30')); rim.rotation.x = Math.PI / 2; rim.castShadow = true; g.add(rim);
  const f = new THREE.Mesh(new THREE.CircleGeometry(r * 0.995, 40), toon('#ffffff', { map: face })); f.position.z = th / 2 + 0.002; f.userData.noOutline = true; g.add(f);
  const bk = new THREE.Mesh(new THREE.CircleGeometry(r * 0.995, 40), toon('#ffffff', { map: back })); bk.position.z = -th / 2 - 0.002; bk.rotation.y = Math.PI; bk.userData.noOutline = true; g.add(bk);
  outline(rim, { px: 2.6 }); return g;
}

// ---------------------------------------------------------------- SETS
function onionChurch(o = {}) {
  const g = new THREE.Group(); const wall = o.wall || '#f2ece0';
  g.add(rbox(5.2, 6, 4.2, wall, 0, 3, 0, 0.08));
  g.add(cyl(1.1, 1.1, 3.0, wall, 0, 7.4, 0, 20));
  const dome = (r, col) => lathe([[0, 0], [r * 0.95, r * 0.15], [r * 1.12, r * 0.7], [r * 0.85, r * 1.25], [r * 0.35, r * 1.75], [0.05, r * 2.25], [0, r * 2.3]], col, 24);
  const d1 = dome(1.25, o.dome || '#2f7fbf'); d1.position.y = 8.9; g.add(d1);
  g.add(cyl(0.05, 0.05, 1.2, '#e7c35a', 0, 11.9, 0, 6), box(0.6, 0.06, 0.06, '#e7c35a', 0, 12.2, 0));
  for (const s of [-1, 1]) { g.add(cyl(0.5, 0.5, 2.2, wall, s * 2.0, 7.1, 0.9, 14)); const d = dome(0.55, o.dome2 || '#e7c35a'); d.position.set(s * 2.0, 8.2, 0.9); g.add(d); }
  for (let i = 0; i < 3; i++) g.add(rbox(0.6, 1.2, 0.1, '#3a3a5a', -1.4 + i * 1.4, 4.2, 2.12, 0.05));
  g.add(rbox(1.4, 2.4, 0.12, '#6a3a22', 0, 1.2, 2.12, 0.05));
  outline(g, { px: 2.2 }); return g;
}
// oldMoscow(st, opts) — a cobbled street, colourful wooden/plaster houses both sides, onion-dome church at the end, sunny sky
export function oldMoscow(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), PR.texMat(PR.TEX.cobble('#b9a88e', [14, 14]))); cob.rotation.x = -Math.PI / 2; cob.position.z = -20; cob.receiveShadow = true; cob.userData.noOutline = true; g.add(cob);
  const cols = ['#e9c46a', '#d97a5a', '#8fb8d8', '#a8c890', '#f0d8b0', '#c98a6a'], rr = rng(o.seed || 4);
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) { const f = PR.facade({ w: 4.4, h: 4.2 + rr() * 1.6, d: 3, color: cols[(i * 2 + (side > 0 ? 1 : 0)) % cols.length], trim: i % 2 ? '#7a3a2a' : '#2f5a7a', shop: i % 2 === 0, windows: 2, seed: i });
    f.position.set(side * 6.4, 0, 2 - i * 4.6); f.rotation.y = -side * Math.PI / 2; g.add(f); }
  const ch = onionChurch(); ch.position.set(0, 0, -26); g.add(ch);
  if (o.props !== false) { const c = PR.cart(); c.position.set(-3.6, 0, -6); c.rotation.y = 0.4; g.add(c); const br = PR.barrel(); br.position.set(4.2, 0, -2); g.add(br); const cr = PR.crate(); cr.position.set(4.0, 0, -3.2); g.add(cr); }
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// barber chair + striped pole for the frame-1 chase
export function barberPole() { const g = new THREE.Group(); const t = canvasTex(64, 256, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#d23a2e'; for (let i = -4; i < 12; i++) { x.save(); x.translate(0, i * 32); x.transform(1, 0.5, 0, 1, 0, 0); x.fillRect(0, 0, w, 14); x.restore(); } x.fillStyle = '#2f5aa8'; for (let i = -4; i < 12; i++) { x.save(); x.translate(0, i * 32 + 16); x.transform(1, 0.5, 0, 1, 0, 0); x.fillRect(0, 0, w, 8); x.restore(); } });
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.2, 20), toon('#ffffff', { map: t })); p.position.y = 2.2; p.castShadow = true; g.add(p); g.pole = p;
  g.add(ball(0.26, '#e7c35a', 0, 3.4, 0), ball(0.26, '#e7c35a', 0, 1.0, 0), cyl(0.06, 0.06, 1.0, '#555', 0, 0.5, 0)); outline(g, { px: 2.4 }); return g; }
// museum(st) — a grand hall: cream walls, columns, a lit glass case on a plinth (token inside), velvet rope
export function museum(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(40, 30, '#b89a78', 0, -5));
  const wallT = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#c94a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#b13e30'; for (let i = 0; i < 16; i++) x.fillRect(i * 32, 0, 4, h); x.fillStyle = '#e9d9b8'; x.fillRect(0, h * 0.82, w, h * 0.18); });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), toon('#ffffff', { map: wallT })); wall.position.set(0, 6, -6); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  for (const x of [-7, 7]) g.add(PR.column(7.5, { color: '#efe6d2', r: 0.45 }).at(x, 0, -5.2));
  // frames on the wall
  for (const [x, c] of [[-3.8, '#6a8aa8'], [3.8, '#8a7a5a']]) { g.add(rbox(2.0, 2.6, 0.12, '#c9a24a', x, 4.4, -5.92, 0.05)); g.add(plane(1.6, 2.2, c, x, 4.4, -5.84)); }
  const plinth = rbox(1.6, 2.2, 1.2, '#efe8da', 0, 1.1, 0, 0.05); g.add(plinth);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.0), new THREE.MeshToonMaterial({ color: '#cfeaff', transparent: true, opacity: 0.18 })); glass.position.set(0, 2.82, 0); glass.userData.noOutline = true; g.add(glass);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: '#9fb4c4' })); edges.position.copy(glass.position); g.add(edges);
  const stand = rbox(0.5, 0.06, 0.4, '#3a2a24', 0, 2.25, 0.05, 0.02); g.add(stand);
  const tk = token3D({ r: 0.34 }); tk.position.set(0, 2.82, 0.05); g.add(tk);
  const label = canvasTex(256, 96, (x, w, h) => { x.fillStyle = '#f6f1e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a1c15'; x.font = '800 30px "Nunito", sans-serif'; x.textAlign = 'center'; x.fillText('BEARD TOKEN', w / 2, 42); x.font = '700 22px "Nunito", sans-serif'; x.fillText('Russia, 1705', w / 2, 76); });
  const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), toon('#ffffff', { map: label })); lb.position.set(0, 1.7, 0.61); lb.userData.noOutline = true; g.add(lb);
  for (const x of [-2.2, 2.2]) g.add(cyl(0.06, 0.08, 1.1, '#c9a24a', x, 0.55, 1.6, 10), ball(0.1, '#c9a24a', x, 1.15, 1.6));
  const rope = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.05, 8, 30, Math.PI), toon('#a01e2a')); rope.rotation.z = Math.PI; rope.scale.y = 0.18; rope.position.set(0, 1.12, 1.6); g.add(rope);
  outline(g, { px: 2.2 }); return { group: g, token: tk, caseY: 2.82 };
}

// ---------------------------------------------------------------- 2D OVERLAYS
// THE top caption (jail-break rule 1c): big bold, top ~8-12 % of the frame, visible from frame 1, held >= 3 s across shots.
export const TOP_CAPTION = ['and carry a beard token', 'as proof'];
export const TOP_UNTIL = 3.6;   // absolute seconds
export function topCaption(g, t, info) {
  const T = info.shot.start + t; if (T > TOP_UNTIL) return; const fade = clamp((TOP_UNTIL - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  TOP_CAPTION.forEach((l, i) => { g.save(); g.translate(E.W / 2, 172 + i * 96); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 84 : 76, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420;
  g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(k, k); g.globalAlpha = o.a ?? 0.95; g.lineJoin = 'round';
  g.fillStyle = 'rgba(255,248,236,.85)'; g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-140, -60, 280, 120, 18); g.fill(); g.stroke();
  insT(g, String(year), 0, 4, 92, { color: o.color || '#e23b2e', stroke: null });
  g.restore();
}
// red rubber "TAXED" stamp slammed onto the frame
export function stamp(g, t, text, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = lerp(2.4, 1, ease.out(k)); const x = o.x ?? E.W / 2, y = o.y ?? 760;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.14); g.scale(s, s); g.globalAlpha = clamp(k * 1.4) * 0.95; g.lineJoin = 'round';
  g.strokeStyle = '#d8281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-300, -90, 600, 180, 22); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-282, -72, 564, 144, 16); g.stroke();
  insT(g, text, 0, 6, o.size || 120, { color: '#d8281e', stroke: null });
  g.restore();
}
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK };
