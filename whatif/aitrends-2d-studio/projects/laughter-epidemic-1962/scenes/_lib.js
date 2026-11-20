// The Laughter Epidemic of 1962 — shared assets: schoolgirls, teacher, villagers, doctor (bean style, respectful, no
// caricature), a 1960s classroom, the boarding-school building, a dormitory, a village of round huts, a red dirt road,
// plus 2D overlays (two-colour hook text, rubber stamps, parchment map of the Lake Victoria shore, calendar, clock).
// TONE GUARD: it was distressing (laughing mixed with crying, fainting, restlessness). Faces laugh WITH worried brows and
// tears; nobody is mocked. Underscore = not auto-loaded.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, EXPR, POSE, addPose, mixExpr, mixPose, idle } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// ---------------------------------------------------------------- PEOPLE
const UNI = '#5b8fc9';   // school uniform (pale blue tunic, white trim)
const HAIR = ['curly', 'curly', 'bun', 'curly', 'bob', 'curly'];
const SKIN = ['dark', 'brown', 'dark', 'brown', '#5a3826', '#6b432c'];
export function student(i = 0, o = {}) {
  const b = bean({ name: 'Student', outfit: 'tunic', head: 'none', skin: SKIN[i % SKIN.length], hair: o.hair || HAIR[i % HAIR.length], hairColor: '#171010',
    colors: { main: o.color || UNI, trim: '#f4f2ec', belt: '#f4f2ec' }, seed: 30 + i * 7, scale: o.scale || 0.88, noPads: true });
  addTears(b); return b;
}
export function teacher(o = {}) { const b = bean({ name: 'Teacher', outfit: 'tunic', head: 'none', skin: 'brown', hair: 'bun', hairColor: '#141010', colors: { main: '#b5543a', trim: '#f0d9a8', belt: '#5a2a1a' }, seed: 61, ...(o.over || {}) }); addTears(b); return b; }
export function villager(i = 0, o = {}) {
  const C = ['#c98a3a', '#3f7f5a', '#a8443a', '#6a5aa0', '#d0a040', '#4f7fa0'];
  const b = bean({ name: 'Villager', outfit: i % 3 === 2 ? 'tee' : 'tunic', head: 'none', skin: SKIN[(i + 1) % SKIN.length], hair: i % 2 ? 'curly' : (i % 4 ? 'bun' : 'bowl'), hairColor: '#141010',
    colors: { main: C[i % C.length], trim: '#f2ead6', belt: '#4a3020'}, seed: 80 + i * 5, scale: o.scale || 0.95, noPads: true });
  addTears(b); return b;
}
export function doctor() { return bean({ name: 'Doctor', outfit: 'labcoat', head: 'none', skin: 'dark', hair: 'curly', hairColor: '#1a1414', glasses: true, colors: { main: '#f4f2ec', lanyard: '#3f7f5a' }, seed: 91 }); }

// two tear drops that can run down the cheeks (tears(k, t))
function addTears(b) {
  const head = b.parts.head, mat = toon('#8fd0ff', { emissive: new THREE.Color('#8fd0ff'), emissiveIntensity: 0.35 });
  const drops = [-1, 1].map(s => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), mat); d.scale.set(0.8, 1.25, 0.6); d.userData.noOutline = true; d.visible = false; head.add(d); return { d, s }; });
  // big open laughing mouth (the kit's mouths are small and dark on dark skin): a larger decal with teeth + tongue
  const R = 0.48 * 1.014, mw = 0.95, mh = 0.46, mEl = -0.38;
  const geo = new THREE.SphereGeometry(R, 16, 10, Math.PI / 2 - mw / 2, mw, Math.PI / 2 - mEl - mh / 2, mh);
  const lm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: laughTex(), transparent: true, alphaTest: 0.35, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
  lm.userData.noOutline = true; lm.renderOrder = 3; lm.visible = false; head.add(lm);
  b.laughMouth = (k, t = 0) => { const on = k > 0.45; lm.visible = on; b.parts.mouth.visible = !on; if (on) lm.scale.set(1, 0.92 + 0.1 * Math.abs(Math.sin(t * 10)), 1); };
  b.tears = (k, t) => drops.forEach(({ d, s }, i) => { d.visible = k > 0.05; if (!d.visible) return; const ph = ((t * 0.9 + i * 0.47) % 1); d.position.set(s * 0.25, 0.02 - ph * 0.28, 0.4 - ph * 0.04); d.scale.setScalar(k * (0.9 + 0.3 * Math.sin(ph * Math.PI))); });
}

let _lt = null;
function laughTex() { return _lt ||= canvasTex(256, 128, (g, w, h) => { const cx = w / 2, cy = 34;
  const path = () => { g.beginPath(); g.moveTo(cx - 92, cy); g.quadraticCurveTo(cx, cy + 10, cx + 92, cy); g.quadraticCurveTo(cx + 70, cy + 92, cx, cy + 90); g.quadraticCurveTo(cx - 70, cy + 92, cx - 92, cy); g.closePath(); };
  g.fillStyle = '#6a1c22'; path(); g.fill(); g.save(); path(); g.clip(); g.fillStyle = '#e0707a'; g.beginPath(); g.ellipse(cx, cy + 86, 52, 30, 0, 0, 7); g.fill();
  g.fillStyle = '#fbf6ee'; g.fillRect(cx - 100, cy - 10, 200, 30); g.restore(); g.lineJoin = 'round'; g.strokeStyle = '#2a1414'; g.lineWidth = 9; path(); g.stroke(); }); }
// laughing that can't stop: shaking shoulders, head thrown back, eyes squeezed, mouth open — with worried brows (distress)
export const LAUGH = { lid: 0.48, lower: 0.7, brow: 0.5, browAngle: -0.45, mouth: 'grin', mouthW: 1.45, pupil: [0, 0.2] };
export const LAUGH_CRY = { lid: 0.5, lidAngle: -0.3, lower: 0.55, brow: 0.65, browAngle: -0.8, mouth: 'grin', mouthW: 1.3 };
export function laughPose(base, t, k, seed = 1) {
  if (k <= 0) return base; const f = 9 + (seed % 3);
  return addPose(base, { bob: k * Math.abs(Math.sin(t * f + seed)) * 0.05, shrugY: k * Math.abs(Math.sin(t * f + seed)) * 0.25, headNod: -k * (0.18 + 0.07 * Math.sin(t * f * 0.5 + seed)), lean: k * (0.08 + 0.06 * Math.sin(t * 2 + seed)), side: k * 0.08 * Math.sin(t * 1.3 + seed), headTilt: k * 0.12 * Math.sin(t * 1.7 + seed) });
}
export const SIT = mixPose(POSE.sit, { ...POSE.sit, armL: [0.9, 0.15, 0.3], armR: [0.9, 0.15, 0.3], elbowL: 0.9, elbowR: 0.9 }, 1);   // hands on the desk
export const HOLD_BELLY = { ...POSE.sit, armL: [0.55, 0.35, 0.9], armR: [0.55, 0.35, 0.9], elbowL: 1.6, elbowR: 1.6 };

// ---------------------------------------------------------------- SETS
const plankTex = (c = '#9a6e48') => canvasTex(512, 512, (x, W, H) => { x.fillStyle = c; x.fillRect(0, 0, W, H); const r = rng(5); for (let i = 0; i < 16; i++) { x.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.06})`; x.fillRect(0, i * 32, W, 2); x.fillStyle = `rgba(255,255,255,${r() * 0.05})`; x.fillRect(r() * W, i * 32 + 6, 120, 18); } });
// chalkboard with a lesson
const boardTex = () => canvasTex(1024, 512, (x, W, H) => { x.fillStyle = '#2e4a3a'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 30; i++) { x.beginPath(); x.moveTo(Math.random() * W, Math.random() * H); x.lineTo(Math.random() * W, Math.random() * H); x.stroke(); }
  x.fillStyle = '#f2f0e6'; x.font = '700 64px "Fredoka", sans-serif'; x.fillText('30 January 1962', 60, 110); x.font = '600 52px "Fredoka", sans-serif'; x.fillText('English  -  Lesson 4', 60, 200); x.fillText('The river flows to the lake.', 60, 290); x.fillText('The lake is very big.', 60, 370); });

// classroom: whitewashed walls with a blue dado, chalkboard on the LEFT wall, two windows on the back wall, desks + benches in rows
export function classroom(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 24, '#b07a52', 0, 0); fl.material = toon('#ffffff', { map: plankTex('#a8744c') }); g.add(fl);
  const back = plane(30, 9, '#efe6d2', 0, 4.5, -5.5); g.add(back); g.add(plane(30, 1.5, '#5d8fb8', 0, 0.75, -5.48));
  const left = plane(24, 9, '#e8dfca', -6.5, 4.5, 0); left.rotation.y = Math.PI / 2; g.add(left);
  const ld = plane(24, 1.5, '#5d8fb8', -6.48, 0.75, 0); ld.rotation.y = Math.PI / 2; g.add(ld);
  // chalkboard on the left wall
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8), toon('#ffffff', { map: boardTex() })); bm.position.set(-6.42, 3.0, -0.6); bm.rotation.y = Math.PI / 2; bm.userData.noOutline = true; g.add(bm);
  const frame = rbox(0.12, 0.14, 5.8, '#6a4a30', -6.4, 1.55, -0.6, 0.03); g.add(frame);
  // windows (bright) on the back wall
  for (const x of [-3.2, 1.4, 6.0]) { const w = plane(2.2, 2.0, '#cfe9ff', x, 3.6, -5.45); w.material = toon('#cfe9ff', { emissive: new THREE.Color('#dff1ff'), emissiveIntensity: 0.55 }); g.add(w);
    g.add(rbox(2.4, 0.1, 0.12, '#f4f2ec', x, 2.55, -5.4, 0.02), rbox(0.08, 2.1, 0.08, '#f4f2ec', x, 3.6, -5.4, 0.02)); }
  // desks: rows facing +Z (the camera side); returns seat positions
  const seats = [], rows = o.rows || 3, cols = o.cols || 3;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = (c - (cols - 1) / 2) * 2.0 + 0.6, z = 1.0 - r * 2.0;
    const desk = new THREE.Group(); desk.add(rbox(1.7, 0.1, 0.7, '#7a5234', 0, 1.18, 0, 0.03), rbox(1.6, 0.9, 0.08, '#6a4a30', 0, 0.72, 0.32, 0.02)); desk.position.set(x, 0, z + 0.62); g.add(desk);
    const bench = rbox(1.6, 0.1, 0.4, '#6a4a30', x, 0.72, z - 0.15, 0.03); g.add(bench);
    seats.push([x - 0.42, z], [x + 0.42, z]);
  }
  outline(g, { px: 2.2 });
  return { group: g, seats, update() {} };
}
// the boarding school: long whitewashed block, tin roof, verandah posts, blue doors; red earth, banana plants, green hills
function banana(seed = 1, s = 1) { const g = new THREE.Group(); const r = rng(seed); g.add(cyl(0.13, 0.18, 2.4 * s, '#7a8a46', 0, 1.2 * s, 0, 8));
  for (let i = 0; i < 6; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6), toon(i % 2 ? '#5f9a3e' : '#6eab48')); lf.scale.set(0.28 * s, 0.05, 1.1 * s); lf.position.set(0, 2.4 * s, 0); const a = i / 6 * Math.PI * 2 + r(); lf.rotation.set(0.7, a, 0); lf.translateZ(0.85 * s); lf.castShadow = true; g.add(lf); }
  return g; }
function hills(g, seed = 2) { const r = rng(seed); for (let i = 0; i < 7; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), toon(i % 2 ? '#7aa65a' : '#6c9a50')); h.scale.set(16 + r() * 14, 5 + r() * 4, 8); h.position.set(-60 + i * 20, -1, -60 - r() * 20); g.add(h); } }
export function schoolBlock(o = {}) {
  const g = new THREE.Group(); const L = o.L || 16;
  g.add(rbox(L, 3.2, 4.5, '#f2ece0', 0, 1.6, 0, 0.05), rbox(L, 0.5, 4.6, '#5d8fb8', 0, 0.25, 0.01, 0.03));
  const roof = rbox(L + 1.2, 0.18, 7.2, '#9aa3a6', 0, 3.6, 0.9, 0.03); roof.rotation.x = 0.1; g.add(roof);
  g.add(rbox(L + 0.6, 0.12, 2.6, '#8a7a6a', 0, 0.06, 3.3, 0.03));
  for (let i = 0; i <= 6; i++) g.add(cyl(0.09, 0.09, 3.1, '#f4f2ec', -L / 2 + 0.3 + i * (L - 0.6) / 6, 1.6, 4.3, 8));
  const doors = []; for (const x of [-4.5, 0, 4.5]) { const d = rbox(1.2, 2.2, 0.1, '#2f5f8f', x, 1.1, 2.27, 0.02); g.add(d); doors.push(d); }
  for (const x of [-6.8, -2.25, 2.25, 6.8]) g.add(rbox(1.4, 1.1, 0.08, '#2a3640', x, 1.9, 2.27, 0.02), rbox(1.5, 0.08, 0.1, '#f4f2ec', x, 1.3, 2.3, 0.02));
  const sign = canvasTex(1024, 160, (x, W, H) => { x.fillStyle = '#f6efd8'; x.fillRect(0, 0, W, H); x.strokeStyle = '#2a1c15'; x.lineWidth = 10; x.strokeRect(5, 5, W - 10, H - 10); x.fillStyle = '#2a1c15'; x.textAlign = 'center'; x.font = '800 62px "Fredoka", sans-serif'; x.fillText('GIRLS’ BOARDING SCHOOL', W / 2, 70); x.font = '700 46px "Fredoka", sans-serif'; x.fillText('KASHASHA', W / 2, 130); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.82), toon('#ffffff', { map: sign })); sg.position.set(0, 2.85, 2.3); sg.userData.noOutline = true; g.add(sg);
  outline(g, { px: 2.2 }); g.doors = doors; return g;
}
export function schoolYard(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(220, 220, '#c4703e', 0, -40));
  const path = floor(3, 60, '#d58a52', o.pathX ?? 0, 20); path.position.y = 0.01; g.add(path);
  const grass = [[-14, 6], [14, 4], [-18, -8], [18, -10]]; grass.forEach(([x, z]) => { const p = floor(12, 10, '#7aa65a', x, z); p.position.y = 0.005; g.add(p); });
  hills(g, o.seed || 2);
  const r = rng(o.seed || 3); for (let i = 0; i < 8; i++) { const b = banana(i + 1, 0.9 + r() * 0.5); const side = i % 2 ? 1 : -1; b.position.set(side * (9 + r() * 8), 0, -6 + r() * 14); g.add(b); }
  outline(g, { px: 2 });
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// dormitory: iron beds with white sheets and coloured blankets, a window with light
export function dorm(st) {
  const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 24, '#a8744c', 0, 0); fl.material = toon('#ffffff', { map: plankTex('#9a6a44') }); g.add(fl);
  g.add(plane(30, 9, '#ede3cf', 0, 4.5, -4.5), plane(30, 1.5, '#5d8fb8', 0, 0.75, -4.48));
  const w = plane(2.2, 2.0, '#cfe9ff', 2.5, 3.6, -4.45); w.material = toon('#cfe9ff', { emissive: new THREE.Color('#dff1ff'), emissiveIntensity: 0.55 }); g.add(w);
  const beds = [];
  for (const [x, c] of [[-3.2, '#c0533a'], [0, '#3f7f5a'], [3.2, '#6a5aa0']]) { const b = new THREE.Group();
    b.add(rbox(1.5, 0.3, 3.0, '#f4f2ec', 0, 0.85, 0, 0.12), rbox(1.55, 0.12, 1.8, c, 0, 1.02, 0.55, 0.05), rbox(1.0, 0.22, 0.6, '#ffffff', 0, 1.1, -1.1, 0.1));
    for (const sx of [-0.72, 0.72]) for (const sz of [-1.45, 1.45]) b.add(cyl(0.04, 0.04, 0.85, '#3a3a40', sx, 0.42, sz, 6));
    b.add(rbox(1.5, 0.9, 0.06, '#3a3a40', 0, 1.2, -1.5, 0.02)); b.position.set(x, 0, -2.0); g.add(b); beds.push(b); }
  outline(g, { px: 2.2 });
  return { group: g, beds, bedTop: 1.0, update() {} };
}
// village of round huts (mud walls, thatched cones), banana plants, red earth
export function hut(seed = 1, s = 1) { const g = new THREE.Group(); const r = rng(seed);
  g.add(cyl(1.6 * s, 1.7 * s, 2.0 * s, r() < 0.5 ? '#b5764a' : '#a8683e', 0, 1.0 * s, 0, 18));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3 * s, 1.9 * s, 18), toon('#c9a25a')); roof.position.y = 2.85 * s; roof.castShadow = true; g.add(roof);
  g.add(rbox(0.8 * s, 1.3 * s, 0.1, '#3a2418', 0, 0.65 * s, 1.62 * s, 0.03)); outline(g, { px: 2.2 }); return g; }
export function village(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(220, 220, '#c4703e', 0, -40));
  hills(g, o.seed || 4);
  for (const [x, z, s, sd] of [[-6, -7, 1.1, 1], [0.5, -10, 1.2, 2], [7, -6.5, 1.0, 3], [-12, -14, 1.2, 4], [13, -14, 1.1, 5]]) { const h = hut(sd, s); h.position.set(x, 0, z); h.rotation.y = -x * 0.04; g.add(h); }
  const r = rng(9); for (let i = 0; i < 8; i++) { const b = banana(i + 11, 0.9 + r() * 0.5); b.position.set((i % 2 ? 1 : -1) * (4 + r() * 12), 0, -12 - r() * 8); g.add(b); }
  outline(g, { px: 2 });
  const sky = sunnySky(st, { clouds: 6, seed: o.seed || 5 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// a suitcase (going home)
export function suitcase(c = '#7a4a2a') { const g = new THREE.Group(); g.add(rbox(0.55, 0.4, 0.18, c, 0, 0, 0, 0.04), rbox(0.2, 0.06, 0.05, '#2a1c15', 0, 0.24, 0, 0.02)); outline(g, { px: 2.4 }); return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
// hook caption: lines of [word, colour] near the top (below the Shorts top bar)
export function hookWords(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, size = o.size || 84, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((ws, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * size * 1.25); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    g.font = `900 ${size}px "Nunito", sans-serif`; const gap = size * 0.28; const widths = ws.map(([w]) => g.measureText(w).width); const tot = widths.reduce((a, b) => a + b, 0) + gap * (ws.length - 1); let x = -tot / 2;
    ws.forEach(([w, c], j) => { insT(g, w, x + widths[j] / 2, 0, size, { color: c || '#ffffff', stroke: CARD_INK }); x += widths[j] + gap; }); g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.15) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, text.length * s * 0.62 + s * 0.6, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// tear-off calendar page
export function calendar(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; const W = 560, H = 640;
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? 760); g.scale(k * (o.scale || 1), k * (o.scale || 1)); g.rotate(o.rot ?? -0.04);
  g.fillStyle = 'rgba(0,0,0,0.28)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 18, W, H, 26); g.fill();
  g.fillStyle = '#fbf8ee'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.fillStyle = '#d8342c'; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, 160, [26, 26, 0, 0]); g.fill(); g.stroke();
  for (const sx of [-140, 140]) { g.fillStyle = '#3a3a40'; g.beginPath(); g.roundRect(sx - 14, -H / 2 - 40, 28, 80, 12); g.fill(); }
  insT(g, o.month || 'JANUARY', 0, -H / 2 + 82, 74, { color: '#ffffff', stroke: null, maxW: W - 60 });
  insT(g, o.day || '30', 0, 40, o.daySize || 300, { color: CARD_INK, stroke: null, maxW: W - 60 });
  insT(g, o.year || '1962', 0, H / 2 - 80, 70, { color: '#8a6a4a', stroke: null });
  g.restore();
}
// spinning wall clock (hours passing)
export function clock(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const R = o.r || 150, sp = o.speed || 6;
  g.save(); g.translate(o.x ?? 780, o.y ?? 560); g.scale(k, k);
  g.fillStyle = '#fbf8ee'; g.strokeStyle = CARD_INK; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineWidth = 7; g.beginPath(); g.moveTo(Math.sin(a) * R * 0.78, -Math.cos(a) * R * 0.78); g.lineTo(Math.sin(a) * R * 0.9, -Math.cos(a) * R * 0.9); g.stroke(); }
  g.lineCap = 'round'; const m = t * sp, h = m / 12;
  g.lineWidth = 12; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(h) * R * 0.5, -Math.cos(h) * R * 0.5); g.stroke();
  g.strokeStyle = '#d8342c'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(m) * R * 0.75, -Math.cos(m) * R * 0.75); g.stroke();
  g.fillStyle = CARD_INK; g.beginPath(); g.arc(0, 0, 14, 0, 7); g.fill(); g.restore();
}
// parchment map: the western shore of Lake Victoria (schematic). pins: [{x,y,label,at}], dots: spread markers
export function lakeMap(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.4)); if (k <= 0) return; const W = 900, H = 1080;
  g.save(); g.translate(E.W / 2, o.y ?? 900); g.scale(k, k); g.rotate((1 - clamp(t / 0.4)) * -0.06);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 16, -H / 2 + 20, W, H, 24); g.fill();
  g.save(); g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 24); g.fillStyle = '#f4e3b8'; g.fill(); g.clip();
  // land texture: faint green blobs
  g.fillStyle = 'rgba(122,166,90,0.25)'; for (const [x, y, r] of [[-300, -300, 160], [-260, 120, 200], [-80, 380, 150], [-340, 420, 120]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  // Lake Victoria on the right
  g.fillStyle = '#8fc4e6'; g.strokeStyle = '#4f88b0'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, -H / 2 - 10);
  g.bezierCurveTo(40, -300, 120, -200, 60, -80); g.bezierCurveTo(10, 40, 90, 140, 40, 260); g.bezierCurveTo(10, 360, 110, 440, 120, H / 2 + 10); g.lineTo(W / 2 + 10, H / 2 + 10); g.lineTo(W / 2 + 10, -H / 2 - 10); g.closePath(); g.fill(); g.stroke();
  insT(g, 'LAKE', 300, -40, 56, { color: '#2f6a96', stroke: null }); insT(g, 'VICTORIA', 300, 20, 56, { color: '#2f6a96', stroke: null, maxW: 300 });
  // dashed border to the north (Uganda)
  g.save(); g.setLineDash([22, 16]); g.strokeStyle = '#8a6a4a'; g.lineWidth = 6; g.beginPath(); g.moveTo(-W / 2, -360); g.lineTo(60, -372); g.stroke(); g.restore();
  if (!o.title) insT(g, 'UGANDA', -200, -420, 40, { color: '#8a6a4a', stroke: null });
  insT(g, o.country || 'TANGANYIKA', -200, -300, 46, { color: '#6a4a2a', stroke: null, maxW: 460 });
  if (o.now) { const a = clamp((t - o.now) / 0.3); insT(g, '(now TANZANIA)', -200, -245, 44, { color: '#d8342c', stroke: null, a, maxW: 460 }); }
  // spread markers (concentric pulse)
  (o.dots || []).forEach(([x, y, t0], i) => { const a = clamp((t - t0) / 0.25); if (a <= 0) return; const pr = ((t - t0) * 0.9) % 1;
    g.save(); g.globalAlpha = (1 - pr) * 0.6 * a; g.strokeStyle = '#d8342c'; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 20 + pr * 50, 0, 7); g.stroke(); g.restore();
    g.save(); g.globalAlpha = a; g.fillStyle = '#d8342c'; g.strokeStyle = CARD_INK; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 18 * ease.outBack(a), 0, 7); g.fill(); g.stroke(); g.restore(); });
  (o.pins || []).forEach(p => { const a = ease.outBack(clamp((t - (p.at || 0)) / 0.3)); if (a <= 0) return; g.save(); g.translate(p.x, p.y); g.scale(a, a);
    g.fillStyle = p.color || '#d8342c'; g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.arc(0, -46, 26, Math.PI * 0.85, Math.PI * 2.15); g.lineTo(0, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -46, 9, 0, 7); g.fill();
    insT(g, p.label, p.lx ?? -10, p.ly ?? 40, p.size || 50, { color: CARD_INK, stroke: '#f4e3b8', maxW: 460 }); g.restore(); });
  g.restore();
  g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 24); g.stroke();
  if (o.title) insT(g, o.title, 0, -H / 2 + 60, 54, { color: CARD_INK, stroke: null, maxW: W - 80 });
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, EXPR, POSE, addPose, mixExpr, mixPose, idle };
