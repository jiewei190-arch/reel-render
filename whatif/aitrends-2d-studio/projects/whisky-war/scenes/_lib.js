// shared helpers for "Canada and Denmark Fought a War With Whisky" (whisky-war). Underscore = not auto-loaded.
// Arctic pack: Hans Island (a rocky dome in the Nares Strait), sea + ice floes, distant snowy cliffs, waving flags, bottles.
import { wordTime, rng } from '/engine/core.js';
import { THREE, toonStage, toon, outline, rbox, box, cyl, ball, lathe, blob, canvasTex } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { propGroup as G } from '/kits/toon3d/props.js';
export { THREE };
export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };

// ---------- flags (cloth plane that waves; .update(t)) ----------
const CA_RED = '#d52b1e', DK_RED = '#c8102e';
const LEAF = [[0, -1], [0.12, -0.72], [0.3, -0.8], [0.25, -0.38], [0.52, -0.55], [0.6, -0.42], [0.82, -0.48], [0.74, -0.2], [0.88, -0.1], [0.5, 0.2], [0.56, 0.36], [0.06, 0.3], [0.06, 0.62], [-0.06, 0.62], [-0.06, 0.3], [-0.56, 0.36], [-0.5, 0.2], [-0.88, -0.1], [-0.74, -0.2], [-0.82, -0.48], [-0.6, -0.42], [-0.52, -0.55], [-0.25, -0.38], [-0.3, -0.8], [-0.12, -0.72]];
const flagTex = {};
export function flagTexture(kind) {
  return flagTex[kind] ||= canvasTex(512, 256, (g, W, H) => {
    if (kind === 'ca') { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = CA_RED; g.fillRect(0, 0, W / 4, H); g.fillRect(W * 3 / 4, 0, W / 4, H);
      g.save(); g.translate(W / 2, H / 2 + 6); g.scale(92, 92); g.beginPath(); LEAF.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore(); }
    else { g.fillStyle = DK_RED; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.fillRect(W * 0.32, 0, W * 0.11, H); g.fillRect(0, H * 0.43, W, H * 0.14); }
  });
}
// flag({ kind: 'ca'|'dk', pole: 2.6, w: 1.5 }) -> group; .update(t), .setKind(k), .raise(k 0..1)
export function flag(o = {}) {
  const { pole = 2.6, w = 1.5, h = w * 0.5, seed = 1 } = o; const g = G();
  const p = cyl(0.035, 0.04, pole, '#d8d4cc', 0, pole / 2, 0, 10); g.add(p, ball(0.06, '#e0b84a', 0, pole + 0.03, 0, 12));
  const geo = new THREE.PlaneGeometry(w, h, 16, 6); geo.translate(w / 2, 0, 0); const base = geo.attributes.position.array.slice();
  const mat = toon('#ffffff', { map: flagTexture(o.kind || 'ca'), side: THREE.DoubleSide, fresh: true });
  const cloth = new THREE.Mesh(geo, mat); cloth.position.set(0.03, pole - h / 2 - 0.05, 0); cloth.castShadow = true; cloth.userData.noOutline = true; g.add(cloth);
  outline(g, { px: 2.4 }); g.add(blob(0.35, 0.3));
  g.cloth = cloth; g.raiseK = 1;
  g.setKind = (k) => { mat.map = flagTexture(k); mat.needsUpdate = true; };
  g.update = (t, wind = 1) => { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; const k = x / w;
      a.setZ(i, Math.sin(x * 3.2 - t * 9 * wind + seed) * 0.13 * k * wind + Math.sin(y * 4 + t * 5) * 0.03 * k); a.setY(i, y - k * k * 0.06); } a.needsUpdate = true; geo.computeVertexNormals();
    cloth.position.y = (pole - h / 2 - 0.05) * (0.35 + 0.65 * g.raiseK) ; cloth.scale.y = 0.3 + 0.7 * Math.min(1, g.raiseK * 1.5); };
  g.update(0); return g;
}

// ---------- bottles ----------
// bottle('whisky'|'schnapps') -> group, ~0.62 tall, base on y=0
export function bottle(kind = 'whisky', o = {}) {
  const wh = kind === 'whisky'; const glass = wh ? '#c8782a' : '#a9d4b2';
  const body = lathe([[0.001, 0], [0.13, 0], [0.14, 0.03], [0.14, 0.36], [0.12, 0.42], [0.05, 0.5], [0.045, 0.6], [0.05, 0.62], [0.001, 0.62]], glass, 20);
  body.material = toon(glass, { emissive: new THREE.Color(glass), emissiveIntensity: 0.25, fresh: true });
  const lab = canvasTex(256, 128, (g, W, H) => { g.fillStyle = wh ? '#f2e2b8' : '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = wh ? CA_RED : DK_RED;
    if (wh) { g.fillRect(0, 0, W, 18); g.fillRect(0, H - 18, W, 18); g.save(); g.translate(W * 0.25, H / 2); g.scale(26, 26); g.beginPath(); LEAF.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.fill(); g.restore(); g.translate(W * 0.25, 0); }
    else { g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(W * 0.08, 0, 14, H); g.fillRect(0, H * 0.43, W * 0.35, 14); g.translate(W * 0.2, 0); }
    g.fillStyle = wh ? '#3a2412' : '#ffffff'; g.font = '900 34px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(wh ? 'WHISKY' : 'SNAPS', W * 0.5, H / 2 + 2); });
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.143, 0.143, 0.18, 20, 1, true, -Math.PI / 2 - 0.9, 1.8), toon('#ffffff', { map: lab, fresh: true })); label.position.y = 0.2; label.userData.noOutline = true;
  const cap = cyl(0.055, 0.055, 0.07, wh ? '#2a1a12' : '#c8102e', 0, 0.64, 0, 12);
  const g = G(body, label, cap); g.traverse(m => { if (m.isMesh) m.castShadow = true; }); outline(g, { px: 2.6 }); if (!o.noBlob) g.add(blob(0.2, 0.3)); g.scale.setScalar(o.scale || 1); return g;
}

// ---------- the Arctic set ----------
// arctic(T, { target, shadowSize, island: true, cliffs: true, seed, light }) -> { stage, sky, set:{update}, island, ridge }
export function arctic(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 0], key: ['#fff4e0', 2.7, [-7, 10, 6]], fill: ['#b8d4ff', 0.6, [8, 5, 6]] });
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 4, top: '#2a78cc', mid: '#8cc8f0', horizon: '#e8f4fb' });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4);
  // sea: a big plane with a soft wave texture
  const waveT = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#2f7fb0'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 3; const q = rng(9); for (let i = 0; i < 28; i++) { const px = q() * W, py = q() * H; x.beginPath(); x.arc(px, py, 14 + q() * 10, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); } }, { repeat: [40, 40] });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon('#ffffff', { map: waveT, fresh: true })); sea.rotation.x = -Math.PI / 2; sea.position.y = -1.1; sea.receiveShadow = true; sea.userData.noOutline = true; g.add(sea);
  // ice floes
  for (let i = 0; i < 26; i++) { const a = (r() - 0.5) * 2.6, d = 14 + r() * 40; const s = 0.6 + r() * 2.4; const f = rbox(s * (1 + r()), 0.25, s, '#f4f9ff', Math.sin(a) * d, -1.0, -Math.cos(a) * d - 3, 0.1); f.rotation.y = r() * 3; f.receiveShadow = true; f.userData.noOutline = d > 25; g.add(f); }
  // distant snowy cliffs: Ellesmere (left) and Greenland (right)
  if (o.cliffs !== false) for (const [side, n] of [[-1, 6], [1, 7]]) for (let i = 0; i < n; i++) {
    const x = side * (28 + i * 9 + r() * 4), z = -70 - r() * 30 + i * 6; const h = 10 + r() * 9, w = 12 + r() * 8;
    const m = new THREE.Mesh(new THREE.ConeGeometry(w, h, 6), toon('#8f97a6')); m.position.set(x, -1.1 + h / 2, z); m.rotation.y = r() * 3; m.scale.z = 0.6; m.userData.noOutline = true; g.add(m);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.42, h * 0.42, 6), toon('#ffffff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15 })); cap.position.set(x, -1.1 + h - h * 0.21 + 0.05, z); cap.rotation.y = m.rotation.y; cap.scale.z = 0.6; cap.userData.noOutline = true; g.add(cap);
  }
  let island = null;
  if (o.island !== false) {
    island = new THREE.Group(); g.add(island);
    // the rock: a low dome (top ~y 0 in the middle), flattened sphere + lumpy boulders around the shore
    const dome = ball(1, '#8a7d70', 0, -1.2, -1, 32); dome.scale.set(9, 1.25, 7); dome.receiveShadow = true; dome.userData.noOutline = true; island.add(dome);
    const top = new THREE.Mesh(new THREE.CircleGeometry(1, 40), toon('#9a8c7c')); top.rotation.x = -Math.PI / 2; top.scale.set(7.2, 5.4, 1); top.position.set(0, 0.0, -1); top.receiveShadow = true; top.userData.noOutline = true; island.add(top);
    for (let i = 0; i < 34; i++) { const a = r() * Math.PI * 2, rad = 0.88 + r() * 0.16; const s = 0.35 + r() * 0.75; const b = ball(s, ['#7d7064', '#8a7d70', '#6f645a', '#9a8c7c'][i % 4], Math.sin(a) * 8.6 * rad, -0.55 + r() * 0.3, -1 - Math.cos(a) * 6.6 * rad, 10); b.scale.y = 0.6; b.castShadow = true; b.receiveShadow = true; island.add(b); }
    for (let i = 0; i < 9; i++) { const sx = (r() - 0.5) * 11, sz = -1 + (r() - 0.5) * 8; if (Math.abs(sx) < 2.6 && sz > -3) continue; const sn = ball(0.6 + r() * 0.9, '#f6faff', sx, -0.05, sz, 14); sn.scale.y = 0.08; sn.userData.noOutline = true; sn.receiveShadow = true; island.add(sn); }
    for (let i = 0; i < 10; i++) { const p = ball(0.12 + r() * 0.16, '#6f645a', (r() - 0.5) * 9, 0.02, -1 + (r() - 0.5) * 6, 8); p.scale.y = 0.6; p.castShadow = true; island.add(p); }
  }
  return { stage: st, sky, island, set: { update: (t) => { sea.position.x = Math.sin(t * 0.3) * 0.4; } } };
}

// ---------- characters (original designs) ----------
// Canadian soldier: olive uniform + red toque. Danish minister: navy suit, grey horseshoe hair, glasses.
export const caSoldier = (i = 0, o = {}) => bean({ name: 'Canadian soldier', outfit: 'uniform', colors: { main: '#5d6b45', legsTop: '#4a5638' }, head: 'beanie', headColor: CA_RED, skin: ['fair', 'tan', 'brown'][i % 3], hair: 'bowl', hairColor: '#3a2618', seed: 300 + i, ...o });
export const dkMinister = (o = {}) => bean({ name: 'Danish minister', outfit: 'uniform', colors: { main: '#27324a', legsTop: '#20283a', trim: '#e0e0e0' }, skin: 'light', hair: 'horseshoe', hairColor: '#b8b0a8', glasses: true, scarf: DK_RED, seed: 320, ...o });
export const caDiplomat = (o = {}) => bean({ name: 'Canadian diplomat', outfit: 'uniform', colors: { main: '#6a5a4a', legsTop: '#3a3430' }, skin: 'fair', hair: 'swoop', hairColor: '#6a4a2a', moustache: '#6a4a2a', seed: 330, ...o });
export const dkDiplomat = (o = {}) => bean({ name: 'Danish diplomat', outfit: 'uniform', colors: { main: '#3a4a6a', legsTop: '#2a3448' }, skin: 'fair', hair: 'curly', hairColor: '#d8b878', seed: 340, ...o });
export const caMinister = (o = {}) => bean({ name: 'Canadian minister', outfit: 'uniform', colors: { main: '#b0302a', legsTop: '#2a2a32' }, skin: 'light', hair: 'bob', hairColor: '#3a2418', seed: 350, ...o });
export const dkMinister2 = (o = {}) => bean({ name: 'Danish minister 2022', outfit: 'uniform', colors: { main: '#2a3a5a', legsTop: '#202838' }, skin: 'fair', hair: 'swoop', hairColor: '#e0c890', glasses: true, seed: 360, ...o });

// a wooden sign on a post: sign('HANS ISLAND')
export function sign(txt, o = {}) {
  const tex = canvasTex(512, 160, (g, W, H) => { g.fillStyle = '#c89a62'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(60,30,10,.35)'; g.lineWidth = 4; for (let y = 40; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.fillStyle = '#3a2412'; g.font = '900 60px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + 4); });
  const board = rbox(1.7, 0.55, 0.08, '#b08050', 0, 1.5, 0, 0.03); const face = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), toon('#ffffff', { map: tex, fresh: true })); face.position.set(0, 1.5, 0.045); face.userData.noOutline = true;
  const g = G(cyl(0.05, 0.06, 1.5, '#7a5032', 0, 0.75, -0.02, 8), board, face); outline(g, { px: 2.4 }); g.add(blob(0.3, 0.3)); return g;
}
