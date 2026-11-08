// shared helpers for "He Sold the Eiffel Tower… Twice" (eiffel-sold). Underscore = not auto-loaded.
// Everything 1920s-Paris lives here (not in the kit) so it never collides with other workers' kit edits:
// suit outfit, top hat / bowler, the Eiffel Tower, the SOLD tag, a Paris street and a hotel salon.
import { E, wordTime, text, ease, prog, clamp, lerp, FONTS, rng } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, box, cyl, ball, torus, blob } from '/kits/toon3d/toon.js';
import { bean, DIM, shadeHex, mixPose } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
export { THREE };

export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null || g - info.shot.start > info.dur ? fb : g - info.shot.start; };
// top label (dark pill, gold text) — kept at y 0.14 (below the Shorts top bar)
export function tag(g, str, k = 1, y = 0.14, color = '#ffd25a') { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color, weight: 700 }); g.restore(); }

// ---------------------------------------------------------------- characters
const R = DIM.headR;
// 1920s suit wrapped round the pill body (front = canvas centre). sash: comic tricolour "official" sash.
const _suit = new Map();
function suitTex(c) {
  const k = JSON.stringify(c); if (_suit.has(k)) return _suit.get(k);
  const t = canvasTex(512, 512, (g, W, H) => {
    const Y = (y) => H * (1 - y), cx = W / 2;
    g.fillStyle = c.main; g.fillRect(0, 0, W, H);
    if (c.pin) { g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 3; for (let x = 6; x < W; x += 22) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } }
    g.fillStyle = c.legsTop || shadeHex(c.main, -0.1); g.fillRect(0, Y(0.4), W, H * 0.4);
    // shirt V + tie
    g.fillStyle = c.shirt || '#f4efe4'; g.beginPath(); g.moveTo(cx - 50, Y(1)); g.lineTo(cx, Y(0.6)); g.lineTo(cx + 50, Y(1)); g.fill();
    if (c.tie) { g.fillStyle = c.tie; g.beginPath(); g.moveTo(cx - 9, Y(0.99)); g.lineTo(cx + 9, Y(0.99)); g.lineTo(cx + 13, Y(0.7)); g.lineTo(cx, Y(0.64)); g.lineTo(cx - 13, Y(0.7)); g.closePath(); g.fill(); }
    if (c.bow) { g.fillStyle = c.bow; g.beginPath(); g.moveTo(cx, Y(0.95)); g.lineTo(cx - 26, Y(0.99)); g.lineTo(cx - 26, Y(0.91)); g.closePath(); g.moveTo(cx, Y(0.95)); g.lineTo(cx + 26, Y(0.99)); g.lineTo(cx + 26, Y(0.91)); g.closePath(); g.fill(); }
    // lapels
    g.fillStyle = shadeHex(c.main, -0.22); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 50, Y(1)); g.lineTo(cx + s * 8, Y(0.6)); g.lineTo(cx + s * 70, Y(0.82)); g.closePath(); g.fill(); }
    // buttons + pocket square
    g.fillStyle = shadeHex(c.main, -0.4); for (const y of [0.55, 0.47]) { g.beginPath(); g.arc(cx + 6, Y(y), 7, 0, 7); g.fill(); }
    if (c.pocket) { g.fillStyle = c.pocket; g.beginPath(); g.moveTo(cx - 108, Y(0.78)); g.lineTo(cx - 76, Y(0.78)); g.lineTo(cx - 86, Y(0.84)); g.lineTo(cx - 98, Y(0.82)); g.closePath(); g.fill(); }
    g.fillStyle = shadeHex(c.legsTop || c.main, -0.3); g.fillRect(0, Y(0.42), W, H * 0.025);
    if (c.sash) { g.save(); g.translate(cx, Y(0.66)); g.rotate(-0.6); const cols = ['#2a4aa8', '#f4f1ea', '#c8323a']; cols.forEach((col, i) => { g.fillStyle = col; g.fillRect(-W, -36 + i * 24, W * 2, 24); }); g.restore(); }
  }, { wrap: true, offset: [0.5, 0] });
  _suit.set(k, t); return t;
}
function addHat(b, kind, color) {
  const h = new THREE.Group(); const m = toon(color);
  if (kind === 'top') {
    const cr = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.66, R * 0.6, R * 1.15, 28), m); cr.position.y = R * 1.3; h.add(cr);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.615, R * 0.61, R * 0.2, 28), toon(shadeHex(color, 0.25))); band.position.y = R * 0.86; band.userData.noOutline = true; h.add(band);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, R * 0.07, 32), m); brim.position.y = R * 0.74; brim.scale.z = 0.92; h.add(brim);
  } else if (kind === 'bowler') {
    const d = new THREE.Mesh(new THREE.SphereGeometry(R * 0.78, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), m); d.position.y = R * 0.7; d.scale.y = 0.95; h.add(d);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.785, R * 0.79, R * 0.14, 28), toon(shadeHex(color, -0.35))); band.position.y = R * 0.76; band.userData.noOutline = true; h.add(band);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(R * 0.86, R * 0.09, 8, 32), m); brim.rotation.x = Math.PI / 2; brim.position.y = R * 0.7; brim.scale.set(1, 1.08, 0.55); h.add(brim);
  }
  h.rotation.x = -0.1; h.position.z = -R * 0.04; h.traverse(x => { if (x.isMesh) x.castShadow = true; });
  b.parts.head.add(h); outline(h, { px: 3.2 }); b.hat = h; return h;
}
// blush (embarrassment): two pink cheeks, hidden unless .blush(k)
function addBlush(b) { const mats = []; for (const s of [1, -1]) { const mt = new THREE.MeshBasicMaterial({ color: '#ff6a7a', transparent: true, opacity: 0, depthWrite: false }); const c = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), mt); c.scale.set(R * 0.2, R * 0.12, R * 0.05); const n = new THREE.Vector3(s * 0.55, -0.12, 0.83).normalize(); c.position.copy(n).multiplyScalar(R * 1.0); c.lookAt(n.clone().multiplyScalar(R * 3)); c.userData.noOutline = true; b.parts.head.add(c); mats.push(mt); } b.blush = (k) => mats.forEach(m => (m.opacity = 0.75 * clamp(k))); }
export function suitBean(o = {}) {
  const c = { main: '#2e3038', legsTop: '#26282e', shirt: '#f4efe4', ...(o.suit || {}) };
  const b = bean({ outfit: 'tunic', skin: 'light', hair: 'swoop', hairColor: '#1e1612', seed: 300, ...o, colors: { legs: c.legsTop, feet: '#16110f', sleeve: false, longSleeve: true, sleeveColor: c.main, main: c.main, gloves: o.gloves } });
  b.parts.body.material = toon('#ffffff', { map: suitTex(c) });
  if (o.hat) addHat(b, o.hat, o.hatColor || '#1a1618');
  addBlush(b);
  return b;
}
// Victor Lustig, the con man (an original cartoon, not a portrait): top hat, thin moustache, charcoal pinstripe, red tie.
export const lustig = (o = {}) => suitBean({ name: 'Lustig', hat: 'top', hatColor: '#1b181c', skin: 'light', hair: 'swoop', hairColor: '#1a1210', moustache: '#1a1210', suit: { main: '#34343e', legsTop: '#2a2a32', tie: '#c0303a', pocket: '#f4efe4', pin: true, sash: !!o.sash }, seed: 301, ...o });
const DEAL = [
  { main: '#7a5a3a', legsTop: '#5e4630', tie: '#3a5a8a', hatColor: '#3a2a1e', skin: 'fair', hair: 'bowl', hairColor: '#5a3a22', ms: '#5a3a22' },
  { main: '#5a6a5a', legsTop: '#46524a', bow: '#a83a3a', hatColor: '#2a2a2a', skin: 'tan', hair: 'curly', hairColor: '#2a1a12', ms: false },
  { main: '#6a6a78', legsTop: '#52525e', tie: '#d8a83a', hatColor: '#4a3a2a', skin: 'olive', hair: 'horseshoe', hairColor: '#8a8580', ms: '#8a8580' },
  { main: '#8a6a4a', legsTop: '#6a5038', tie: '#2a6a5a', hatColor: '#2a221c', skin: 'brown', hair: 'bowl', hairColor: '#1a1210', ms: false },
  { main: '#4a5a72', legsTop: '#3a4658', bow: '#d8b04a', hatColor: '#3a3a3a', skin: 'fair', hair: 'swoop', hairColor: '#b07a3a', ms: '#b07a3a' },
];
// bowler-hat scrap dealers; i picks the look
export const dealer = (i = 0, o = {}) => { const d = DEAL[i % DEAL.length]; return suitBean({ name: 'Dealer', hat: 'bowler', hatColor: d.hatColor, skin: d.skin, hair: d.hair, hairColor: d.hairColor, moustache: d.ms || undefined, suit: { main: d.main, legsTop: d.legsTop, tie: d.tie, bow: d.bow }, seed: 310 + i, ...o }); };
// André Poisson (original cartoon): round head, bowler, olive suit, big moustache
export const poisson = (o = {}) => suitBean({ name: 'Poisson', hat: 'bowler', hatColor: '#2a2420', skin: 'fair', hair: 'bowl', hairColor: '#6a4a2e', moustache: '#6a4a2e', headScale: [1.12, 1.0, 1.06], suit: { main: '#6a6a42', legsTop: '#565634', tie: '#a8323a', pocket: '#e8d8a8' }, seed: 320, ...o });
// a Paris policeman: navy uniform + kepi-style cap
export const cop = (o = {}) => { const b = bean({ name: 'Agent', outfit: 'uniform', colors: { main: '#25304e', legsTop: '#1e2640', trim: '#d8b04a', belt: '#1a1612' }, head: 'cap', headColor: '#1e2846', skin: 'fair', hair: 'bald', moustache: '#3a2618', seed: 330, ...o }); addBlush(b); return b; };

// ---------------------------------------------------------------- the Eiffel Tower (simplified toon model, ~30 units tall)
let _lat = null;
const latticeTex = () => _lat ||= canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#9a6446'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,22,14,.55)'; g.lineWidth = 6; g.strokeRect(3, 0, w - 6, h); g.lineWidth = 4; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 64); g.moveTo(w, y); g.lineTo(0, y + 64); g.stroke(); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, { repeat: [1, 3] });
// strut: a box swept from p0 to p1 (centres), width w0 -> w1, bowed by `bow` (pushes the middle outward along dir)
function strut(p0, p1, w0, w1, bow = [0, 0, 0], segs = 6) {
  const geo = new THREE.BoxGeometry(1, 1, 1, 1, segs, 1); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); const t = y + 0.5; const w = lerp(w0, w1, t); const b = Math.sin(Math.PI * t);
    pos.setXYZ(i, lerp(p0[0], p1[0], t) + x * w + bow[0] * b, lerp(p0[1], p1[1], t) + bow[1] * b, lerp(p0[2], p1[2], t) + z * w + bow[2] * b); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, toon('#ffffff', { map: latticeTex() })); m.castShadow = true; m.receiveShadow = true; return m;
}
export function eiffel(o = {}) {
  const g = new THREE.Group(); const brown = '#8e5c40', dark = '#6a4230';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(strut([sx * 5.2, 0, sz * 5.2], [sx * 2.5, 7, sz * 2.5], 1.7, 1.05, [sx * 0.5, 0, sz * 0.5]));
    g.add(strut([sx * 2.55, 7.4, sz * 2.55], [sx * 1.25, 15.2, sz * 1.25], 1.0, 0.7, [sx * 0.15, 0, sz * 0.15]));
  }
  // arches between the legs (one per face)
  for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.22, 8, 28, Math.PI), toon(brown)); a.position.y = 3.5; const ang = (i * Math.PI) / 2; a.position.x = Math.sin(ang) * 4.05; a.position.z = Math.cos(ang) * 4.05; a.rotation.y = ang; a.scale.y = 0.95; g.add(a); }
  g.add(rbox(7.4, 0.75, 7.4, dark, 0, 7.2, 0, 0.08), rbox(7.8, 0.25, 7.8, brown, 0, 7.75, 0, 0.05));
  g.add(rbox(3.6, 0.5, 3.6, dark, 0, 15.4, 0, 0.06), rbox(3.9, 0.18, 3.9, brown, 0, 15.75, 0, 0.04));
  const up = strut([0, 15.8, 0], [0, 27.2, 0], 2.5, 0.55, [0, 0, 0], 8); g.add(up);
  g.add(rbox(1.2, 0.8, 1.2, dark, 0, 27.4, 0, 0.06), cyl(0.12, 0.2, 2.6, dark, 0, 29.0, 0, 8), ball(0.22, '#d8b04a', 0, 30.3, 0, 10));
  g.traverse(x => { if (x.isMesh) x.castShadow = true; });
  outline(g, { px: o.px ?? 2.2 }); g.scale.setScalar(o.scale ?? 1); return g;
}
// big hanging price tag: .swing(t, amp) ; text on both sides
export function soldTag(o = {}) {
  const { txt = 'SOLD', w = 5.6, h = 2.6, color = '#c8323a' } = o; const g = new THREE.Group();
  const tex = canvasTex(512, 256, (x, W, H) => { x.fillStyle = '#f6ecd2'; x.beginPath(); x.roundRect(8, 8, W - 16, H - 16, 28); x.fill(); x.strokeStyle = color; x.lineWidth = 14; x.beginPath(); x.roundRect(26, 26, W - 52, H - 52, 20); x.stroke(); x.fillStyle = color; x.font = `700 ${o.size || 128}px Fredoka, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, W / 2 + 24, H / 2 + 8, W - 150); x.fillStyle = '#5a3a2a'; x.beginPath(); x.arc(48, H / 2, 14, 0, 7); x.fill(); });
  const card = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), [toon('#f6ecd2'), toon('#f6ecd2'), toon('#f6ecd2'), toon('#f6ecd2'), toon('#ffffff', { map: tex }), toon('#ffffff', { map: tex })]);
  card.position.set(w * 0.45, -h * 0.5 - 1.2, 0); card.rotation.z = 0.0; card.castShadow = true;
  const string = cyl(0.04, 0.04, 1.6, '#3a2a1e', 0.3, -0.6, 0, 6); string.rotation.z = -0.5;
  const piv = new THREE.Group(); piv.add(card, string); g.add(piv); outline(piv, { px: 2.6 });
  g.swing = (t, amp = 0.12) => { piv.rotation.z = Math.sin(t * 2.1) * amp; piv.rotation.y = Math.sin(t * 1.3) * amp * 0.8; };
  g.card = card; return g;
}

// ---------------------------------------------------------------- small props
export function cashStack(n = 4) { const g = PR.propGroup(); for (let i = 0; i < n; i++) { g.add(rbox(0.52, 0.07, 0.26, '#cfd8b0', (i % 2) * 0.02, 0.04 + i * 0.075, 0, 0.015)); g.add(box(0.1, 0.075, 0.27, '#b8423a', (i % 2) * 0.02, 0.04 + i * 0.075, 0)); } outline(g, { px: 2.2 }); return g; }
export function contract() { const t = canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#f8f1de'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a3a2a'; g.font = '700 22px Fredoka'; g.textAlign = 'center'; g.fillText('CONTRAT', w / 2, 30); g.fillStyle = 'rgba(80,60,40,.5)'; for (let y = 48; y < 128; y += 12) g.fillRect(16, y, w - 32 - (y % 24), 4); g.strokeStyle = '#2a3a8a'; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 145); g.bezierCurveTo(75, 130, 85, 155, 110, 138); g.stroke(); }); const m = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.46, 0.01), [toon('#f8f1de'), toon('#f8f1de'), toon('#f8f1de'), toon('#f8f1de'), toon('#ffffff', { map: t }), toon('#ffffff', { map: t })]); m.castShadow = true; const g = PR.propGroup(m); outline(g, { px: 2 }); return g; }
export function suitcase(color = '#8a5a32') { const g = PR.propGroup(rbox(0.75, 0.52, 0.22, color, 0, 0, 0, 0.05), box(0.77, 0.05, 0.24, shadeHex(color, -0.35), 0, 0.12, 0), box(0.77, 0.05, 0.24, shadeHex(color, -0.35), 0, -0.12, 0), torus(0.09, 0.025, '#2a1a12', 0, 0.3, 0)); outline(g, { px: 2.4 }); return g; }
export function cup() { const g = PR.propGroup(cyl(0.09, 0.07, 0.15, '#f4efe4', 0, 0.075, 0, 14), cyl(0.15, 0.15, 0.02, '#f4efe4', 0, 0.005, 0, 18), ball(0.07, '#5a3420', 0, 0.13, 0, 10)); outline(g, { px: 2 }); return g; }
// poof: burst of puffs at origin, k 0..1
export function poof(n = 12, color = '#efe6dc', seed = 4) { const g = new THREE.Group(); const r = rng(seed); const mt = toon(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.4 }); const P = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mt); const d = new THREE.Vector3(r() - 0.5, r() * 0.9 + 0.1, r() - 0.5).normalize(); P.push({ m, d, s: 0.5 + r() * 0.5 }); g.add(m); } outline(g, { px: 2.4 });
  g.update = (k) => { for (const p of P) { const a = clamp(k); const rad = 0.2 + ease.out(a) * 1.3; p.m.position.copy(p.d).multiplyScalar(rad).add(new THREE.Vector3(0, 1.2, 0)); p.m.scale.setScalar(Math.max(0.001, p.s * 0.55 * Math.sin(Math.PI * Math.min(1, a * 1.1)))); } g.visible = k > 0 && k < 1; }; g.update(0); return g; }
export function chair(color = '#6a3a22', cloth = '#8a2a3a') { const g = PR.propGroup(rbox(0.62, 0.1, 0.6, color, 0, 0.62, 0, 0.03), rbox(0.56, 0.08, 0.54, cloth, 0, 0.7, 0, 0.03), rbox(0.62, 0.8, 0.08, color, 0, 1.05, -0.28, 0.03)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.035, 0.03, 0.62, color, sx * 0.25, 0.31, sz * 0.24, 8)); outline(g, { px: 2.4 }); return g; }
function lampPost() { const c = '#2a3a32'; const g = PR.propGroup(cyl(0.07, 0.11, 4.2, c, 0, 2.1, 0, 10), cyl(0.2, 0.25, 0.3, c, 0, 0.15, 0, 10), rbox(0.36, 0.5, 0.36, '#f4e2a8', 0, 4.45, 0, 0.05), cyl(0.05, 0.28, 0.2, c, 0, 4.78, 0, 8)); outline(g, { px: 2.4 }); return g; }
// easel with a swappable drawing: .show(name) : 'tower' | 'x' | 'tons'
function easel() { const g = PR.propGroup(); const wood = '#8a5a32';
  g.add(cyl(0.04, 0.04, 2.6, wood, -0.42, 1.2, 0.1, 8).rotateZ(0.16), cyl(0.04, 0.04, 2.6, wood, 0.42, 1.2, 0.1, 8).rotateZ(-0.16), cyl(0.04, 0.04, 2.4, wood, 0, 1.1, -0.35, 8).rotateX(-0.25), rbox(1.3, 0.08, 0.16, wood, 0, 0.98, 0.14, 0.02));
  const draw = (kind) => canvasTex(256, 320, (x, W, H) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, W, H); x.strokeStyle = '#5a3a2a'; x.lineWidth = 7; x.lineJoin = 'round'; x.beginPath(); x.moveTo(W * 0.2, H * 0.9); x.quadraticCurveTo(W * 0.42, H * 0.55, W * 0.49, H * 0.1); x.quadraticCurveTo(W * 0.51, H * 0.05, W * 0.51, H * 0.1); x.quadraticCurveTo(W * 0.58, H * 0.55, W * 0.8, H * 0.9); x.moveTo(W * 0.3, H * 0.65); x.lineTo(W * 0.7, H * 0.65); x.moveTo(W * 0.38, H * 0.42); x.lineTo(W * 0.62, H * 0.42); x.stroke(); x.beginPath(); x.arc(W * 0.5, H * 0.9, W * 0.17, Math.PI, 0); x.stroke();
    if (kind === 'x') { x.strokeStyle = '#d0303a'; x.lineWidth = 22; x.lineCap = 'round'; x.beginPath(); x.moveTo(W * 0.15, H * 0.15); x.lineTo(W * 0.85, H * 0.85); x.moveTo(W * 0.85, H * 0.15); x.lineTo(W * 0.15, H * 0.85); x.stroke(); }
    if (kind === 'tons') { x.fillStyle = 'rgba(251,246,234,.82)'; x.fillRect(0, H * 0.3, W, H * 0.4); x.fillStyle = '#c8323a'; x.font = '700 64px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('7,000', W / 2, H * 0.43); x.font = '700 50px Fredoka, sans-serif'; x.fillText('TONS', W / 2, H * 0.6); } });
  const tex = { tower: draw('tower'), x: draw('x'), tons: draw('tons') };
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.55, 0.05), [toon('#7a4a2a'), toon('#7a4a2a'), toon('#7a4a2a'), toon('#7a4a2a'), toon('#ffffff', { map: tex.tower }), toon('#7a4a2a')]);
  board.position.set(0, 1.82, 0.12); board.rotation.x = -0.12; board.castShadow = true; g.add(board); outline(g, { px: 2.4 });
  g.show = (k) => { const m = board.material[4]; if (m.map !== tex[k]) { m.map = tex[k]; m.needsUpdate = true; } }; return g; }

// ---------------------------------------------------------------- sets
const texFloor = (w, d, tex) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), PR.texMat(tex)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; return m; };
// PARIS STREET: cobbled street running into -Z between cream Haussmann facades, lamp posts, the tower at the end.
// opts { towerZ: -46, cafe: bool, tag: bool|'two', light } -> { stage, group, tower, tag, tag2, cafe, update(t) }
export function paris(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: 40, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0], bg: ['#8fbde6', '#cfe3f2', '#f2e6d6'], fog: [30, 95, '#dfe8f0'], ...(o.stage || {}) });
  const g = new THREE.Group(); st.add(g);
  g.add(texFloor(14, 120, PR.TEX.cobble('#a8a090', [5, 40])));
  for (const sx of [-1, 1]) { const sw = texFloor(3.5, 120, PR.TEX.stone('#d8d0c0', [1, 30])); sw.position.set(sx * 8.7, 0.12, 0); g.add(sw); g.add(box(0.3, 0.24, 120, '#b8b0a0', sx * 6.95, 0.12, 0)); }
  const r = rng(o.seed || 3); const creams = ['#ecdfc6', '#e6d6b8', '#f0e4cc', '#e2d0b2'];
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) { const z = 8 - i * 6.2; const f = PR.facade({ w: 6.0, h: 7 + r() * 1.5, d: 4, color: creams[(i + (sx > 0 ? 1 : 0)) % 4], trim: '#6a7a8c', windows: 3, shop: i % 3 === 1, seed: i }); f.at(sx * 10.6, 0, z, -sx * Math.PI / 2); g.add(f); }
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) g.add(lampPost().at(sx * 7.6, 0, 4 - i * 9));
  const tower = eiffel(); tower.position.set(o.towerX ?? 0, 0, o.towerZ ?? -46); g.add(tower);
  // green park strip in front of the tower
  const park = texFloor(40, 16, PR.TEX.plaster('#8ab86a', [4, 2])); park.position.set(0, 0.02, (o.towerZ ?? -46) + 4); g.add(park);
  const out = { stage: st, group: g, tower, update: (t) => { out.tag?.swing(t); out.tag2?.swing(t + 1.3, 0.16); } };
  if (o.tag) { out.tag = soldTag(); out.tag.position.set(tower.position.x - 1.5, 7.0, tower.position.z + 4.2); out.tag.rotation.y = 0; g.add(out.tag); }
  if (o.tag === 'two') { out.tag2 = soldTag({ txt: 'SOLD', color: '#c8323a' }); out.tag2.position.set(tower.position.x - 2.2, 15.2, tower.position.z + 2.2); g.add(out.tag2); }
  if (o.cafe) { const c = PR.propGroup(cyl(0.55, 0.55, 0.05, '#f4efe4', 0, 1.05, 0, 24), cyl(0.05, 0.05, 1.0, '#2a2a2a', 0, 0.52, 0, 8), cyl(0.3, 0.3, 0.04, '#2a2a2a', 0, 0.02, 0, 16)); outline(c, { px: 2.4 }); c.position.set(...(o.cafe.pos || [4.2, 0.24, 2])); g.add(c); out.cafe = c;
    const aw = canvasTex(256, 64, (x, W, H) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f4efe4' : '#c8323a'; x.fillRect(i * W / 8, 0, W / 8, H); } }); const awn = new THREE.Mesh(new THREE.BoxGeometry(5, 0.08, 2.2), toon('#ffffff', { map: aw })); awn.position.set(7.6, 3.3, c.position.z); awn.rotation.z = 0.32; awn.castShadow = true; g.add(awn); }
  return out;
}
// HOTEL SALON: panelled cream walls with gold trim, parquet, a window onto Paris (tower in it), a door (left),
// a table with green cloth + chairs (right), an easel (centre-left). -> { stage, easel, door(k), spots, update }
export function salon(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: o.shadowSize || 7, target: o.target || [0, 0, 0], ...(o.stage || {}) });
  const g = new THREE.Group(); st.add(g); const W = 11, Dp = 8, H = 4.6;
  g.add(texFloor(W, Dp + 6, PR.TEX.planks('#9a6438', [6, 6], 10)));
  const rugT = PR.rug({ w: 5.2, d: 3.4, color: '#7a2a3a', trim: '#d8b04a' }); rugT.position.set(0.6, 0.01, 0.4); g.add(rugT);
  const panel = canvasTex(1024, 512, (x, w, h) => { x.fillStyle = '#efe2c6'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8c6a0'; x.fillRect(0, h * 0.72, w, h * 0.28); x.fillStyle = '#c9a14a'; x.fillRect(0, h * 0.7, w, 10); x.fillRect(0, h * 0.08, w, 8); x.strokeStyle = '#c9a14a'; x.lineWidth = 6; for (let i = 0; i < 5; i++) { const px = i * w / 5 + 22; x.strokeRect(px, h * 0.14, w / 5 - 44, h * 0.5); x.strokeRect(px, h * 0.76, w / 5 - 44, h * 0.18); } });
  const pm = PR.texMat(panel);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), pm); back.position.set(0, H / 2, -Dp / 2); back.receiveShadow = true; back.userData.noOutline = true; g.add(back);
  for (const sx of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(Dp + 4, H), pm); sw.rotation.y = -sx * Math.PI / 2; sw.position.set(sx * W / 2, H / 2, 0); sw.receiveShadow = true; sw.userData.noOutline = true; g.add(sw); }
  // window (right of the back wall) with a painted view of Paris and the tower
  const view = canvasTex(256, 320, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fbde6'); gr.addColorStop(1, '#e8eef2'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#8e5c40'; x.beginPath(); x.moveTo(w * 0.32, h * 0.86); x.quadraticCurveTo(w * 0.47, h * 0.5, w * 0.495, h * 0.12); x.lineTo(w * 0.505, h * 0.12); x.quadraticCurveTo(w * 0.53, h * 0.5, w * 0.68, h * 0.86); x.closePath(); x.fill(); x.fillStyle = '#cfdbe6'; x.beginPath(); x.arc(w * 0.5, h * 0.86, w * 0.09, Math.PI, 0); x.fill(); x.fillStyle = '#6a4230'; x.fillRect(w * 0.38, h * 0.66, w * 0.24, 6); x.fillRect(w * 0.43, h * 0.45, w * 0.14, 5); x.fillStyle = '#c8bca8'; for (let i = 0; i < 6; i++) x.fillRect(i * w / 6, h * (0.8 + (i % 3) * 0.04), w / 6 - 4, h); });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.2), new THREE.MeshBasicMaterial({ map: view })); win.position.set(3.2, 2.5, -Dp / 2 + 0.03); win.userData.noOutline = true; g.add(win);
  g.add(PR.propGroup(box(1.95, 0.12, 0.2, '#f4efe4', 3.2, 1.36, -Dp / 2 + 0.1), box(1.95, 0.12, 0.12, '#f4efe4', 3.2, 3.64, -Dp / 2 + 0.06), box(0.08, 2.2, 0.08, '#f4efe4', 3.2, 2.5, -Dp / 2 + 0.06), box(1.7, 0.06, 0.06, '#f4efe4', 3.2, 2.7, -Dp / 2 + 0.06)));
  g.add(PR.curtain({ w: 0.8, h: 3.2, color: '#8a2a3a' }).at(2.05, 0.2, -Dp / 2 + 0.25), PR.curtain({ w: 0.8, h: 3.2, color: '#8a2a3a' }).at(4.35, 0.2, -Dp / 2 + 0.25));
  // door (left of the back wall), hinged on its left edge; door(k) 0 shut .. 1 open
  g.add(box(1.5, 2.9, 0.05, '#2a1a14', -3.2, 1.45, -Dp / 2 + 0.02));
  const dp = new THREE.Group(); dp.position.set(-3.95, 0, -Dp / 2 + 0.06); g.add(dp);
  const leaf = PR.propGroup(rbox(1.5, 2.9, 0.1, '#6a3a22', 0.75, 1.45, 0, 0.03), rbox(1.1, 1.0, 0.12, '#7a4a2a', 0.75, 2.1, 0.02, 0.03), rbox(1.1, 1.0, 0.12, '#7a4a2a', 0.75, 0.85, 0.02, 0.03), ball(0.07, '#d8b04a', 1.3, 1.4, 0.1, 10)); outline(leaf, { px: 2.4 }); dp.add(leaf);
  g.add(PR.propGroup(rbox(1.8, 0.18, 0.2, '#c9a14a', -3.2, 3.0, -Dp / 2 + 0.1, 0.03)));
  // chandelier
  const ch = PR.propGroup(cyl(0.02, 0.02, 0.9, '#c9a14a', 0, 4.15, 0, 6), torus(0.5, 0.04, '#c9a14a', 0, 3.7, 0)); ch.children[1].rotation.x = Math.PI / 2; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ch.add(ball(0.08, '#fff2c8', Math.cos(a) * 0.5, 3.82, Math.sin(a) * 0.5, 8)); } ch.position.set(0.6, 0, 0); outline(ch, { px: 2 }); g.add(ch);
  // table + chairs (dealers sit at x 1.3..3.5 facing -X / camera)
  const table = PR.propGroup(rbox(2.6, 0.1, 1.3, '#2f5a3a', 0, 1.0, 0, 0.03), rbox(2.66, 0.18, 1.36, '#28503a', 0, 0.92, 0, 0.03)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) table.add(cyl(0.05, 0.04, 0.9, '#5a3420', sx * 1.15, 0.45, sz * 0.52, 8)); outline(table, { px: 2.4 }); table.position.set(1.4, 0, -0.75); g.add(table);
  { const ct = contract().at(0.8, 1.07, -0.45, 0.2); ct.children[0].rotation.x = -Math.PI / 2; g.add(ct); } const pap = PR.papers({ n: 3, seed: 5, spread: 0.6 }); pap.position.set(1.9, 1.06, -0.75); g.add(pap);
  g.add(PR.plant({}).at(-4.6, 0, -3.2), PR.lampStand().at(4.7, 0, -3.0));
  const es = easel(); es.position.set(-0.95, 0, -0.85); es.rotation.y = 0.45; g.add(es);
  const out = { stage: st, group: g, easel: es, table, chairs: [], update: () => {}, door: (k) => { dp.rotation.y = ease.inOut(clamp(k)) * 1.6; } };
  if (o.chairs !== false) [[0.55, -1.6], [1.4, -1.65], [2.25, -1.6]].forEach(([x, z]) => { const c = chair(); c.position.set(x, 0, z); c.rotation.y = 0; g.add(c); out.chairs.push(c); });
  return out;
}

// tip the hat: k 0..1..0 envelope expected; returns a pose layer for the right arm
export function tipHat(b, k, base) { k = clamp(k); if (b.hat) { b.hat.position.y = 0.16 * k; b.hat.rotation.z = -0.35 * k; b.hat.rotation.x = -0.1 - 0.15 * k; } return mixPose(base, { ...base, armR: [2.35, 0.45, 0.2], elbowR: 1.45 }, k); }
// seat a bean on a chair (seat top ~0.74)
export const seat = (b, x, z) => { b.position.set(x, -0.06, z); return b; };
