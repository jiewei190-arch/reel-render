// shared helpers for "A Pope Put a Dead Pope on Trial" (dead-pope-trial). Underscore = not auto-loaded.
// Characters are original bean designs (not portraits). The dead pope is a comic prop: a robed bean slumped on the
// throne with closed eyes. No decay, no bones, nothing graphic.
import { E, wordTime, text, ease, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, outline, rbox, cyl, box, canvasTex, blob } from '/kits/toon3d/toon.js';
import { bean, POSE } from '/kits/toon3d/rig.js';
import { SETS } from '/kits/toon3d/sets.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.14) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
const R = 0.48;
// papal mitre (white + gold) on a bean's head
export function mitre(b, o = {}) { const { color = '#f4efe4', trim = '#d4a73a' } = o; const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.5, R * 0.84, R * 1.15, 24), toon(color)); body.position.y = R * 1.2; body.castShadow = true; g.add(body);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(R * 0.5, R * 0.55, 24), toon(color)); tip.position.y = R * 2.05; g.add(tip);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.85, R * 0.86, R * 0.18, 24), toon(trim)); band.position.y = R * 0.7; g.add(band);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(R * 0.16, R * 1.4, R * 0.05), toon(trim)); strip.position.set(0, R * 1.35, R * 0.7); strip.rotation.x = -0.24; g.add(strip);
  const cross = new THREE.Mesh(new THREE.BoxGeometry(R * 0.42, R * 0.12, R * 0.05), toon(trim)); cross.position.set(0, R * 1.5, R * 0.66); cross.rotation.x = -0.24; g.add(cross);
  g.scale.set(1, 1, 0.72); g.rotation.x = -0.12; outline(g, { px: 2.6 }); b.parts.head.add(g); b.mitre = g; return g; }
// zucchetto (small skullcap) for cardinals
export function skullcap(b, color = '#b8262a') { const m = new THREE.Mesh(new THREE.SphereGeometry(R * 1.02, 24, 8, 0, Math.PI * 2, 0, 0.62), toon(color)); m.rotation.x = -0.35; m.position.z = -R * 0.05; b.parts.head.add(m); return m; }
// original characters
export const stephen = () => { const b = bean({ name: 'Stephen', outfit: 'robe', colors: { main: '#b8322c', trim: '#e8c25a', legs: '#b8322c' }, skin: 'light', hair: 'horseshoe', hairColor: '#3a2a20', browColor: '#2a1c15', seed: 61 }); mitre(b, { color: '#f6f0e2' }); return b; };
export const formosus = () => { const b = bean({ name: 'Formosus', outfit: 'robe', colors: { main: '#f2ece0', trim: '#d4a73a', legs: '#f2ece0' }, skin: 'fair', hair: 'horseshoe', hairColor: '#d8d4cc', beard: true, beardColor: '#e4e0d8', seed: 62 }); mitre(b, { color: '#efe6cf' }); return b; };
export const deacon = () => bean({ name: 'Deacon', outfit: 'robe', colors: { main: '#3a3040', trim: '#8a7a9a', legs: '#3a3040' }, skin: 'tan', hair: 'bowl', hairColor: '#2a1c15', seed: 63 });
export const newPope = () => { const b = bean({ name: 'NewPope', outfit: 'robe', colors: { main: '#f4f0e6', trim: '#e0b84a', legs: '#f4f0e6' }, skin: 'olive', hair: 'horseshoe', hairColor: '#8a8580', beard: true, beardColor: '#9a958e', seed: 64 }); mitre(b); return b; };
const SKS = ['fair', 'tan', 'light', 'olive', 'brown'];
export const cardinal = (i) => { const b = bean({ name: 'Cardinal', outfit: 'robe', colors: { main: '#a8262a', trim: '#f0e6d0', legs: '#a8262a' }, skin: SKS[i % 5], hair: ['bowl', 'horseshoe', 'curly'][i % 3], hairColor: ['#3a2618', '#8a8580', '#1e1612'][i % 3], seed: 70 + i }); skullcap(b); return b; };
export const worker = (i) => bean({ name: 'Worker', outfit: 'tunic', colors: { main: ['#8a6a44', '#5a7a8a'][i % 2], belt: '#4a3020' }, skin: SKS[(i + 2) % 5], hair: ['curly', 'spiky'][i % 2], hairColor: '#3a2618', seed: 80 + i });
// a banner with the crossed keys drawn (no SPQR in a church)
export function keysBanner(color = '#7a1e24') { const t = canvasTex(256, 420, (g, W, H) => { g.fillStyle = color; g.fillRect(0, 0, W, H); g.strokeStyle = '#e0b84a'; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, H - 70);
    g.fillStyle = '#e0b84a'; for (const s of [-1, 1]) { g.save(); g.translate(W / 2, H * 0.42); g.rotate(s * 0.7); g.fillRect(-9, -95, 18, 170); g.beginPath(); g.arc(0, 95, 26, 0, Math.PI * 2); g.fill(); g.fillRect(-9, -95, 40, 18); g.fillRect(-9, -65, 32, 16); g.restore(); }
    g.beginPath(); g.moveTo(0, H - 56); g.lineTo(W / 2, H); g.lineTo(W, H - 56); g.fill(); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.6), toon('#ffffff', { map: t, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 })); p.position.y = -0.8; p.userData.noOutline = true; const g = new THREE.Group(); g.add(p, cyl(0.035, 0.035, 1.3, '#d4a73a', 0, 0.02, 0.02).rotateZ(Math.PI / 2)); return g; }
// a wooden sign with text (canvas)
export function sign(lines, o = {}) { const { w = 2.2, h = 1.2, bg = '#f3e6c4', ink = '#7a1e24' } = o; const t = canvasTex(512, Math.round(512 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = '#6a4228'; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14);
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; const fs = Math.min(64, H / (lines.length + 0.6)); g.font = `900 ${fs}px Nunito, Fredoka, sans-serif`; lines.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.1)); });
  const grp = new THREE.Group(); const board = rbox(w + 0.1, h + 0.1, 0.08, '#6a4228', 0, 1.6 + h / 2, -0.05); const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: t })); face.position.set(0, 1.6 + h / 2, 0.0); face.userData.noOutline = true;
  grp.add(board, face, cyl(0.06, 0.06, 1.7, '#6a4228', 0, 0.85, -0.1)); outline(board, { px: 2.6 }); return grp; }
export const SEAT_Y = 0.22;
export const SIT = { ...POSE.sit, armL: [0.5, 0.15, 0], armR: [0.5, 0.15, 0], elbowL: 0.6, elbowR: 0.6 };
export const SLUMP = { ...SIT, side: 0.22, lean: 0.12, headTilt: 0.42, headNod: 0.32, armL: [0.15, 0.2, 0], armR: [0.25, 0.1, 0], elbowL: 0.1, elbowR: 0.2 };
// THE HALL: the palace room of the kit, re-dressed as a 9th-century church hall: keys banners, candles, benches with cardinals
export function hall(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'warm', fov: 40, shadowSize: 8, target: [0, 0, -1] }); const set = SETS.romanHouse(st, { palace: true, window: '#ffe6b0' });
  set.group.children.slice().forEach(c => { if (Math.abs(c.position.y - 3.9) < 0.05 && Math.abs(Math.abs(c.position.x) - 4.0) < 0.05) set.group.remove(c); });
  for (const x of [-4.0, 4.0]) { const b = keysBanner(); b.position.set(x, 3.9, -3.4); st.add(b); }
  for (const x of [-2.2, 2.2]) { const c = PR.lampStand(); c.position.set(x, 0, -2.9); st.add(c); }
  const throneSet = PR.throne({ color: '#d4a73a', cloth: '#7a1e24' }).at(0, 0, -2.6); st.add(throneSet);
  set.group.children.forEach(c => { if (c.position && Math.abs(c.position.z + 2.6) < 0.01 && Math.abs(c.position.x) < 0.01 && c !== throneSet) c.visible = false; });   // hide the kit's purple throne
  const s = { stage: st, set };
  if (o.formosus !== false) { s.f = formosus(); s.f.position.set(0, SEAT_Y, -2.35); st.add(s.f); }
  if (o.stephen !== false) { s.st = stephen(); s.st.position.set(1.55, 0, -1.2); s.st.rotation.y = -1.05; st.add(s.st); }
  if (o.deacon !== false) { s.d = deacon(); s.d.position.set(-1.05, 0, -2.0); s.d.rotation.y = 0.35; st.add(s.d); }
  if (o.cardinals !== false) { s.c = []; for (const [i, x, z, ry] of [[0, -2.7, 0.2, 1.1], [1, -2.9, 1.3, 1.25], [2, 2.9, 0.5, -1.2], [3, 3.0, 1.6, -1.3]]) {
      const bench = rbox(0.6, 0.12, 1.0, '#6a4228', x, 0.6, z); outline(bench, { px: 2.4 }); st.add(bench); const c = cardinal(i); c.position.set(x, -0.13, z); c.rotation.y = ry; st.add(c); s.c.push(c); } }
  return s;
}
// churchyard outside (sunny): the basilica front, a stone tomb, two workers
export function yard(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 9, target: [0, 0, -1] }); const sky = sunnySky(st, { clouds: 8, seed: 4 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), toon('#8fb35a')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.userData.noOutline = true; st.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3, 30), PR.texMat(PR.TEX.cobble('#c9bfa8', [2, 12]))); path.rotation.x = -Math.PI / 2; path.position.set(-3, 0.01, -8); path.userData.noOutline = true; st.add(path);
  const temple = PR.templeFront().at(0, 0, -14); st.add(temple);
  for (const [x, z] of [[-6, -6], [6.5, -7], [-8, -2]]) { const tr = new THREE.Group(); tr.add(cyl(0.18, 0.24, 2.2, '#7a5032', 0, 1.1, 0), new THREE.Mesh(new THREE.SphereGeometry(1.3, 20, 14), toon('#4f8a3a'))); tr.children[1].position.y = 3.0; tr.children[1].scale.y = 1.6; tr.children[1].castShadow = true; outline(tr, { px: 2.4 }); tr.position.set(x, 0, z); st.add(tr); }
  const tomb = new THREE.Group(); tomb.add(rbox(2.4, 0.9, 1.1, '#bdb5a5', 0, 0.45, 0, 0.05)); const lid = rbox(2.55, 0.18, 1.22, '#cfc8b8', 0, 0.99, 0, 0.04); tomb.add(lid); tomb.add(blob(1.6, 0.3)); outline(tomb, { px: 2.6 }); tomb.position.set(0, 0, -1.5); st.add(tomb);
  const w = [worker(0), worker(1)]; w[0].position.set(-1.7, 0, -1.2); w[0].rotation.y = 1.2; w[1].position.set(1.7, 0, -1.2); w[1].rotation.y = -1.2; st.add(...w);
  return { stage: st, sky, tomb, lid, w, update: (t) => sky.update(t) };
}
