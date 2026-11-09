// shared helpers for "This Town's Mayor Was a Cat" (cat-mayor). Underscore = not auto-loaded.
// Talkeetna-style frontier street (wooden false-front stores, spruces, a snowy mountain), the general-store interior,
// STUBBS (a yellow toon cat with a tiny top hat + mayor sash), podiums, a ballot box, a margarita glass.
import { E, wordTime, text, ease, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, box, cyl, ball, torus, lathe, plane, floor, blob } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { castMember, cat } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };

export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.13) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }

const G = PR.propGroup;
const signTex = (txt, bg, fg, w = 512, h = 128, size = 64) => canvasTex(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, W - 16, H - 16); g.fillStyle = fg; g.font = `900 ${size}px Fredoka, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + 4); });
export function sign(txt, o = {}) { const { w = 3.2, h = 0.8, bg = '#f2e4c2', fg = '#5a2a1a', size = 64 } = o; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: signTex(txt, bg, fg, 512, Math.round(512 * h / w), size) })); m.userData.noOutline = true; const g = G(rbox(w + 0.12, h + 0.12, 0.08, '#5a3a22', 0, 0, -0.05, 0.03), m); m.position.z = 0.0; outline(g, { px: 2 }); return g; }

// a wooden false-front store: plank walls, tall square front, porch roof on posts, windows, a sign
export function store(o = {}) {
  const { w = 5, h = 3.6, front = 5.0, d = 4, color = '#a8483a', trim = '#f2e4c2', label = 'GENERAL STORE', porch = true, door = true } = o; const g = G();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), PR.texMat(PR.TEX.planks(color, [2, 2], 10))); wall.position.set(0, h / 2, -d / 2); wall.castShadow = wall.receiveShadow = true; g.add(wall);
  const ff = new THREE.Mesh(new THREE.BoxGeometry(w, front - h + 0.3, 0.2), PR.texMat(PR.TEX.planks(color, [2, 1], 10))); ff.position.set(0, h + (front - h) / 2 - 0.15, 0.05); ff.castShadow = true; g.add(ff);
  g.add(box(w + 0.2, 0.18, 0.3, trim, 0, front, 0.06));
  if (label) { const s = sign(label, { w: w * 0.8, h: 0.75, bg: trim, fg: '#5a2a1a' }); s.position.set(0, h + 0.55, 0.22); g.add(s); }
  if (door) g.add(rbox(1.0, 2.2, 0.1, '#5a3a22', 0, 1.1 + 0.25, 0.02, 0.03));
  for (const sx of [-1, 1]) { g.add(box(1.1, 1.2, 0.06, '#9fd0f0', sx * w * 0.3, 1.75, 0.02)); g.add(box(1.25, 0.1, 0.12, trim, sx * w * 0.3, 1.12, 0.06), box(1.25, 0.1, 0.12, trim, sx * w * 0.3, 2.38, 0.06), box(0.08, 1.3, 0.1, trim, sx * w * 0.3, 1.75, 0.06)); }
  if (porch) { const deck = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.25, 1.8), PR.texMat(PR.TEX.planks('#8a6440', [3, 1], 8))); deck.position.set(0, 0.125, 0.9); deck.receiveShadow = deck.castShadow = true; g.add(deck);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.12, 2.0), PR.texMat(PR.TEX.planks('#6a4a30', [3, 1], 8))); roof.position.set(0, h - 0.2, 1.0); roof.rotation.x = 0.12; roof.castShadow = true; g.add(roof);
    for (const sx of [-1, 1]) g.add(cyl(0.08, 0.08, h - 0.4, '#6a4a30', sx * (w / 2), (h - 0.4) / 2 + 0.2, 1.7, 8)); }
  outline(g, { px: 2.2 }); return g;
}
export function spruce(o = {}) { const { h = 5, color = '#2f5a3a', seed = 1 } = o; const g = G(cyl(0.12, 0.16, h * 0.3, '#5a3a22', 0, h * 0.15, 0, 8)); for (let i = 0; i < 4; i++) { const r = (1 - i / 4) * h * 0.24 + 0.2; const c = new THREE.Mesh(new THREE.ConeGeometry(r, h * 0.36, 9), toon(i % 2 ? color : '#36643f')); c.position.y = h * 0.28 + i * h * 0.19; c.castShadow = true; g.add(c); } g.add(blob(h * 0.18, 0.25)); outline(g, { px: 2 }); return g; }
export function mountain(o = {}) { const { r = 40, h = 46, color = '#7f93ad' } = o; const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), toon(color)); m.position.y = h / 2; g.add(m);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.42, h * 0.42, 7), toon('#f6f8fc', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15 })); cap.position.y = h - h * 0.21 + 0.05; cap.scale.setScalar(1.02); g.add(cap); g.traverse(x => { x.userData.noOutline = true; }); return g; }

// the town street (sunny): general store centre, two neighbours, boardwalk, gravel road, spruces, Denali-like peaks
export function town(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 1] });
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 4 });
  st.add(floor(80, 80, '#b8a27a', 0, -20)); st.add(floor(80, 4, '#a08c68', 0, 4.2));
  const gs = store({ label: 'GENERAL STORE' }); gs.position.set(0, 0, -1); st.add(gs);
  const cafe = store({ w: 4.2, h: 3.2, front: 4.2, color: '#4f7a9a', label: 'CAFE' }); cafe.position.set(-5.2, 0, -1.6); st.add(cafe);
  const lodge = store({ w: 4.2, h: 3.4, front: 4.4, color: '#7a8a4a', label: 'LODGE' }); lodge.position.set(5.2, 0, -1.6); st.add(lodge);
  [[-9, -4, 6, 1], [9.5, -5, 6.5, 2], [-12, -9, 7, 3], [12, -10, 7.5, 4], [-3, -9, 5.5, 5], [3.5, -10, 6, 6], [-7.5, -12, 6, 7], [7, -13, 6.5, 8]].forEach(([x, z, h, s]) => st.add(spruce({ h, seed: s }).at(x, 0, z)));
  const mt = mountain({ r: 60, h: 62 }); mt.position.set(18, 0, -150); st.add(mt); const mt2 = mountain({ r: 45, h: 40, color: '#8aa0b8' }); mt2.position.set(-40, 0, -140); st.add(mt2);
  const props = { barrel: PR.barrel().at(-2.0, 0.25, 0.25), crate: PR.crate({ s: 0.75 }).at(0.9, 0.25, 0.2, 0.15) };
  Object.values(props).forEach(p => st.add(p));
  return { stage: st, sky, store: gs, props };
}

// general-store interior: plank walls, shelves of tins and jars, long counter, cash register, MAYOR'S OFFICE sign
export function storeInside(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 38, shadowSize: 7, target: [0, 0, 0] });
  st.add(floor(14, 12, '#8a6440', 0, 0)); const back = plane(14, 6, '#ffffff', 0, 3, -3.2); back.material = PR.texMat(PR.TEX.planks('#b07a4a', [3, 1], 14)); st.add(back);
  for (const sx of [-1, 1]) { const side = plane(12, 6, '#ffffff', sx * 6, 3, 2); side.material = PR.texMat(PR.TEX.planks('#a06e42', [3, 1], 14)); side.rotation.y = -sx * Math.PI / 2; st.add(side); }
  const R = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(7); const cols = ['#c0392b', '#2f6fc0', '#e0b84a', '#3a8a4a', '#e8712a', '#f2ead6'];
  for (const sx of [-3.3, 3.3]) { const sh = G(); for (let j = 0; j < 4; j++) { const y = 0.6 + j * 0.85; sh.add(box(2.8, 0.08, 0.5, '#6a4228', 0, y, 0)); for (let i = 0; i < 7; i++) { const c = cols[Math.floor(R() * cols.length)]; sh.add(R() < 0.5 ? cyl(0.13, 0.13, 0.32, c, -1.2 + i * 0.4, y + 0.2, 0, 12) : rbox(0.28, 0.42, 0.24, c, -1.2 + i * 0.4, y + 0.25, 0, 0.03)); } } sh.add(box(2.9, 3.6, 0.1, '#5a3a22', 0, 1.8, -0.28)); outline(sh, { px: 2 }); sh.position.set(sx, 0, -2.9); st.add(sh); }
  const counter = G(rbox(4.2, 1.15, 1.0, '#7a4a2a', 0, 0.575, 0, 0.04), rbox(4.4, 0.1, 1.15, '#5a3420', 0, 1.2, 0, 0.03)); outline(counter, { px: 2.4 }); counter.position.set(0, 0, 0.2); st.add(counter);
  const reg = G(rbox(0.7, 0.45, 0.5, '#c9a14a', 0, 0.22, 0, 0.05), rbox(0.6, 0.25, 0.08, '#e8d39a', 0, 0.55, -0.15, 0.03)); outline(reg, { px: 2.2 }); reg.position.set(1.4, 1.25, 0.1); st.add(reg);
  const s = sign("MAYOR'S OFFICE", { w: 2.6, h: 0.6, bg: '#1f3a6a', fg: '#ffd25a', size: 56 }); s.position.set(0, 3.55, -3.1); st.add(s);
  const lampL = new THREE.PointLight(new THREE.Color('#ffd8a0'), 6, 10, 1.6); lampL.position.set(0, 3.6, 1.5); st.add(lampL);
  return { stage: st, counter, top: 1.25 };
}

// STUBBS: the kit cat recoloured (yellow, amber eyes), with a tiny top hat and a blue mayor sash. o.kitten = small, no hat.
export function stubbs(o = {}) {
  const c = cat({ fur: '#e8b85a', belly: '#fbecc8', collar: '#c0392b', eye: '#e0a020', scale: o.scale || 1, seed: 11 });
  const g = c.children[0]; const head = g.children.find(x => x.isGroup && Math.abs(x.position.y - 0.98) < 0.01);
  c.head = head; c.headR = 0.36; c.height = 1.4;
  if (o.hat !== false) { const hat = new THREE.Group(); hat.add(cyl(0.2, 0.2, 0.34, '#1e1a22', 0, 0.17, 0, 20), cyl(0.33, 0.33, 0.04, '#1e1a22', 0, 0.02, 0, 24), cyl(0.205, 0.205, 0.07, '#c0392b', 0, 0.08, 0, 20)); hat.position.set(0.05, 0.3, 0.02); hat.rotation.z = -0.18; outline(hat, { px: 2.6 }); head.add(hat); c.hat = hat; }
  if (o.sash !== false) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.05, 8, 32), toon('#2f5fc0')); ring.rotation.x = Math.PI / 2; const sash = new THREE.Group(); sash.add(ring); sash.position.set(0, 0.46, 0.0); sash.rotation.z = 0.5; g.add(sash); const med = ball(0.07, '#ffd25a', -0.12, 0.42, 0.39, 12); med.scale.z = 0.4; g.add(med); outline(sash, { px: 2.8 }); outline(med, { px: 2 }); }
  return c;
}
// townsfolk (original characters) + the cast cameo (TOMAS in his blue cap as a tourist)
const SK = ['fair', 'tan', 'light', 'olive', 'brown', 'dark'];
export const local = (i = 0, o = {}) => bean({ name: 'Local', outfit: i % 2 ? 'hoodie' : 'tee', colors: { main: ['#3a6aa8', '#c0603a', '#5a8a4a', '#8a4a8a', '#d0a040', '#4a8a8a'][i % 6], legsTop: '#3a3a4a' }, head: i % 3 === 0 ? 'beanie' : 'none', headColor: ['#c0392b', '#2f6fc0', '#3a8a4a'][i % 3], skin: SK[i % SK.length], hair: ['messy', 'bowl', 'curly', 'bob', 'spiky'][i % 5], hairColor: ['#3a2618', '#6a4428', '#1e1612', '#8a6a3a'][i % 4], seed: 300 + i, ...o });
export const granny = () => bean({ name: 'Local', outfit: 'tee', colors: { main: '#b85a7a', legsTop: '#5a4a6a' }, skin: 'light', hair: 'bun', hairColor: '#d8d4d0', glasses: true, scarf: '#e8c860', seed: 330 });
export const candidate = (i = 0) => bean({ name: 'Candidate', outfit: 'uniform', colors: { main: ['#2a3550', '#4a3a3a'][i % 2], legsTop: '#22283a', trim: '#e8e0d0' }, skin: ['fair', 'tan'][i % 2], hair: ['swoop', 'horseshoe'][i % 2], hairColor: ['#2a1a12', '#8a8580'][i % 2], seed: 340 + i });
export const tomas = () => castMember('tomas');

export function podium(label = '', o = {}) { const { color = '#e8e0d0', w = 1.2, h = 1.3 } = o; const g = G(rbox(w, h, 0.8, color, 0, h / 2, 0, 0.05), rbox(w + 0.2, 0.1, 0.95, '#5a3a22', 0, h + 0.03, 0, 0.03)); if (label) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, 0.42), toon('#ffffff', { map: signTex(label, '#2f5fc0', '#ffffff', 512, 180, 84) })); m.position.set(0, h * 0.62, 0.41); m.userData.noOutline = true; g.add(m); } g.add(blob(0.8, 0.25)); outline(g, { px: 2.4 }); return g; }
export function ballotBox() { const g = G(rbox(1.0, 0.8, 0.8, '#2f5fc0', 0, 0.4, 0, 0.04), box(0.5, 0.03, 0.08, '#141018', 0, 0.81, 0)); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), toon('#ffffff', { map: signTex('VOTE', '#ffffff', '#c0392b', 256, 96, 64) })); m.position.set(0, 0.42, 0.41); m.userData.noOutline = true; g.add(m); outline(g, { px: 2.4 }); return g; }
export function ballot() { const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.01, 0.46), toon('#ffffff', { map: signTex('STUBBS', '#ffffff', '#2a1c15', 256, 340, 54) })); m.castShadow = true; return m; }
export function margarita() { const glass = toon('#bfeee0', { transparent: true, opacity: 0.75 }); const g = new THREE.Group();
  const bowl = lathe([[0.02, 0], [0.06, 0.02], [0.2, 0.1], [0.26, 0.18], [0.27, 0.2]], '#bfeee0'); bowl.material = glass; bowl.position.y = 0.42; g.add(bowl);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.24, 24), toon('#8fe0c0')); water.rotation.x = -Math.PI / 2; water.position.y = 0.6; water.userData.noOutline = true; g.add(water);
  g.add(cyl(0.025, 0.025, 0.4, '#bfeee0', 0, 0.22, 0, 8), cyl(0.15, 0.16, 0.03, '#bfeee0', 0, 0.015, 0, 18)); const lime = cyl(0.08, 0.08, 0.025, '#7ac04a', 0.24, 0.63, 0, 14); lime.rotation.z = 1.2; g.add(lime);
  [0, 0.12, -0.1].forEach((x, i) => { const leaf = ball(0.04, '#4a9a3a', x, 0.61, 0.05 * i, 8); leaf.scale.y = 0.3; g.add(leaf); });
  outline(g, { px: 2 }); return g; }
export function banner(txt, o = {}) { const { w = 4, h = 0.9, bg = '#c0392b', fg = '#ffffff' } = o; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: signTex(txt, bg, fg, 1024, Math.round(1024 * h / w), Math.round(1024 * h / w * 0.4)), side: THREE.DoubleSide })); m.userData.noOutline = true; return G(m); }
export function confetti(st, n = 60, seed = 3, area = [-3, 3, -1, 2]) { const R = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(seed); const cols = ['#ffd25a', '#e8484a', '#2f8af5', '#4ac06a', '#ffffff'];
  const bits = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.16), flat(cols[i % cols.length], { side: THREE.DoubleSide })); m.userData.noOutline = true; m.p = [area[0] + R() * (area[1] - area[0]), 3 + R() * 3, area[2] + R() * (area[3] - area[2]), R() * 6, 0.6 + R() * 0.6]; st.add(m); bits.push(m); }
  return { update(t, t0 = 0) { bits.forEach(b => { const [x, y, z, ph, sp] = b.p; const a = Math.max(0, t - t0); b.visible = t >= t0; b.position.set(x + Math.sin(a * 2 + ph) * 0.3, y - a * sp * 1.6, z); b.rotation.set(a * 5 + ph, a * 3, ph); }); } }; }
