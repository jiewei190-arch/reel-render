// The Con Man Who Sold the Eiffel Tower — shared assets. EMOTION: LOL (the audacity is the joke).
// Cast: "Count" Lustig (dark suit, top hat, thin moustache), Andre Poisson (round, bowler-ish cap, nervous), scrap dealers.
// Sets: a sunny Paris park with a toon Eiffel Tower, a plush hotel room with a podium + easel, a police-station front,
// a train carriage, a prison cell. Props: SOLD sign, briefcase of cash, bribe envelope, fake banknotes.
// Tone guard: comedy only, nobody hurt. Characters are original toons, not likenesses.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

// time (s, shot-relative) of the nth occurrence of `word` at/after this shot's start
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } const r = g - info.shot.start; return r > info.dur + 0.5 ? fb : r; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };
const R = 0.48;   // bean head radius (rig DIM.headR)

// ---------------------------------------------------------------- CHARACTERS
export function topHat(b, o = {}) {
  const g = new THREE.Group(); const c = toon(o.color || '#1e1c26'), band = toon(o.band || '#b8322a');
  const crown = mesh(new THREE.CylinderGeometry(R * 0.66, R * 0.62, R * 1.15, 28), c); crown.position.y = R * 1.25; g.add(crown);
  const bd = mesh(new THREE.CylinderGeometry(R * 0.635, R * 0.635, R * 0.2, 28), band); bd.position.y = R * 0.82; bd.userData.noOutline = true; g.add(bd);
  const brim = mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, R * 0.07, 32), c); brim.position.y = R * 0.7; g.add(brim);
  g.position.set(0, -R * 0.02, -R * 0.04); g.rotation.x = -0.1; g.rotation.z = o.tilt ?? 0.08;
  outline(g, { px: 3 }); b.parts.head.add(g); b.hat = g; return g;
}
export function lustig(o = {}) {
  const b = bean({ name: 'Lustig', outfit: o.striped ? 'striped' : 'uniform',
    colors: o.striped ? { main: '#f2efe8', stripe: '#23222a' } : { main: '#2a2c3a', trim: '#f2efe6', belt: '#2a2c3a', legsTop: '#24252f' },
    skin: 'fair', hair: 'swoop', hairColor: '#1e1612', moustache: '#1e1612', seed: o.seed || 7, scale: o.scale || 1 });
  topHat(b, { tilt: o.tilt ?? 0.1 });
  // white shirt front + red bow tie
  if (!o.striped) { const sh = mesh(sph, toon('#f4f1ea'), 0.11, 0.16, 0.05); sh.position.set(0, 0.5, 0.31); b.parts.upper.add(sh);
    for (const s of [-1, 1]) { const bw = mesh(sph, toon('#c2302a'), 0.07, 0.045, 0.04); bw.position.set(s * 0.06, 0.62, 0.33); b.parts.upper.add(bw); } outline(sh, { px: 2 }); }
  return b;
}
export function poisson(o = {}) {
  const b = bean({ name: 'Poisson', outfit: 'tunic', colors: { main: '#8a6a4a', trim: '#e2c27a', belt: '#4a3420' }, skin: 'light', hair: 'horseshoe', hairColor: '#6a4a30',
    head: 'ballcap', headColor: '#5a4632', moustache: '#6a4a30', seed: o.seed || 12, scale: 1.04 });
  return b;
}
const DEALER = [['#5a6a3a', 'cap', '#3a4a2a'], ['#7a3a2a', 'beanie', '#4a2a22'], ['#3a5a7a', 'none', null], ['#6a5a8a', 'ballcap', '#3a3060'], ['#8a6a2a', 'cap', '#5a4420'], ['#4a7a6a', 'beanie', '#2a4a40']];
export function dealer(i, o = {}) {
  const [col, head, hc] = DEALER[i % DEALER.length]; const hairs = ['bald', 'messy', 'curly', 'bowl', 'horseshoe', 'spiky'];
  return bean({ name: 'Dealer' + i, outfit: 'tunic', colors: { main: o.shift ? shadeHex(col, 0.12) : col, trim: '#c9a14a', belt: '#3a2a1a' }, skin: ['fair', 'tan', 'light', 'fair', 'tan', 'light'][i % 6],
    hair: hairs[(i + (o.shift ? 2 : 0)) % 6], hairColor: ['#3a2416', '#7a5a3a', '#1e1612', '#a07a50', '#2a1a10', '#5a3a22'][i % 6], head, headColor: hc, moustache: i % 2 === 0, seed: 40 + i + (o.shift ? 10 : 0) });
}

// ---------------------------------------------------------------- PROPS
// SOLD sign on a stick (stick along -Y from the board, held at the bottom): board w x h
export function soldSign(o = {}) {
  const w = o.w || 1.6, h = o.h || 0.85, g = new THREE.Group();
  const tex = canvasTex(512, 272, (x, W, H) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, W, H); x.strokeStyle = '#c8261e'; x.lineWidth = 22; x.strokeRect(14, 14, W - 28, H - 28);
    x.fillStyle = '#c8261e'; x.font = '900 178px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.text || 'SOLD', W / 2, H / 2 + 10); });
  const board = rbox(w, h, 0.07, '#fbf6ea', 0, 0, 0, 0.03); g.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, h * 0.96), toon('#ffffff', { map: tex })); face.position.z = 0.04; face.userData.noOutline = true; g.add(face);
  const back = face.clone(); back.rotation.y = Math.PI; back.position.z = -0.04; g.add(back);
  const stick = cyl(0.04, 0.04, o.stick ?? 1.3, '#8a5a32', 0, -h / 2 - (o.stick ?? 1.3) / 2 + 0.05, -0.05, 8); g.add(stick);
  outline(board, { px: 2.6 }); outline(stick, { px: 2.4 }); g.stickLen = o.stick ?? 1.3; return g;
}
export function briefcase(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#6a3a1e';
  g.add(rbox(0.9, 0.62, 0.22, c, 0, 0, 0, 0.05)); g.add(rbox(0.3, 0.06, 0.06, '#3a2010', 0, 0.36, 0, 0.02));
  for (const s of [-1, 1]) g.add(rbox(0.07, 0.09, 0.05, '#e2b84a', s * 0.3, 0.27, 0.12, 0.01));
  outline(g, { px: 2.6 }); return g;
}
// open briefcase stuffed with banknotes (for the payment beat)
export function cashCase() {
  const g = new THREE.Group(); g.add(rbox(1.0, 0.18, 0.7, '#6a3a1e', 0, 0, 0, 0.04));
  const lid = rbox(1.0, 0.7, 0.08, '#6a3a1e', 0, 0.35, -0.36, 0.03); g.add(lid);
  const nt = noteTex(); for (let i = 0; i < 6; i++) { const n = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.2), [toon('#7aa86a'), toon('#7aa86a'), toon('#ffffff', { map: nt }), toon('#7aa86a'), toon('#7aa86a'), toon('#7aa86a')]); n.position.set(-0.24 + (i % 2) * 0.48, 0.1 + Math.floor(i / 2) * 0.0, -0.22 + Math.floor(i / 2) * 0.22); n.castShadow = true; g.add(n); }
  outline(g, { px: 2.4 }); return g;
}
let _nt = null;
export function noteTex() { return (_nt ||= canvasTex(256, 120, (x, W, H) => { x.fillStyle = '#9cc890'; x.fillRect(0, 0, W, H); x.strokeStyle = '#3a6a3a'; x.lineWidth = 8; x.strokeRect(8, 8, W - 16, H - 16);
  x.fillStyle = '#3a6a3a'; x.beginPath(); x.ellipse(W / 2, H / 2, 30, 38, 0, 0, 7); x.fill(); x.font = '900 40px "Nunito", sans-serif'; x.textBaseline = 'middle'; x.fillText('$', 26, H / 2); x.fillText('$', W - 50, H / 2); })); }
// a flat banknote (counterfeit bills in the cell)
export function note(o = {}) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.29), toon('#ffffff', { map: noteTex(), side: THREE.DoubleSide })); m.userData.noOutline = true; m.castShadow = true; return m; }
export function envelope() { const g = new THREE.Group(); g.add(rbox(0.5, 0.32, 0.04, '#f2ead6', 0, 0, 0, 0.01));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), toon('#e2d6bc')); fl.rotation.z = Math.PI / 4; fl.scale.y = 0.55; fl.position.set(0, 0.06, 0.025); fl.userData.noOutline = true; g.add(fl);
  const seal = ball(0.045, '#c2302a', 0, -0.02, 0.03, 12); g.add(seal); outline(g, { px: 2.2 }); return g; }

// ---------------------------------------------------------------- THE EIFFEL TOWER (toon, ~24 units tall; a bean is 2.55)
// frustum: a BoxGeometry whose bottom square (centre c0, half-size s0) and top square (c1, s1) are moved, so the lattice texture still maps per face
function frustum(c0, s0, c1, s1, mat) {
  const geo = new THREE.BoxGeometry(1, 1, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const top = p.getY(i) > 0, c = top ? c1 : c0, s = top ? s1 : s0; p.setXYZ(i, c[0] + Math.sign(p.getX(i)) * s, c[1], c[2] + Math.sign(p.getZ(i)) * s); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
function latticeMat(rep = [2, 6], col = '#9a6a44') {
  const t = canvasTex(128, 128, (x, W, H) => { x.fillStyle = col; x.fillRect(0, 0, W, H); x.strokeStyle = shadeHex(col, -0.38); x.lineWidth = 9;
    x.strokeRect(4, 4, W - 8, H - 8); x.lineWidth = 6; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, H); x.moveTo(W, 0); x.lineTo(0, H); x.stroke();
    x.fillStyle = shadeHex(col, 0.12); x.fillRect(10, 10, W - 20, 6); }, { repeat: rep });
  return toon('#ffffff', { map: t });
}
export function eiffel(o = {}) {
  const g = new THREE.Group(); const col = o.color || '#9a6a44';
  const legM = latticeMat([1, 5], col), midM = latticeMat([2, 5], col), topM = latticeMat([1, 9], col);
  const B = 4.6, K = 2.3, H1 = 6.2;   // base half-spread, leg-top half-spread, first platform height
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(frustum([sx * B, 0, sz * B], 0.9, [sx * K, H1, sz * K], 0.55, legM));
  // arches between the legs on all four sides
  for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.22, 10, 30, Math.PI), toon(shadeHex(col, -0.05))); a.castShadow = true;
    const ang = i * Math.PI / 2; a.position.set(Math.sin(ang) * 3.7, 2.35, Math.cos(ang) * 3.7); a.rotation.y = ang; a.scale.set(1, 1.05, 1); g.add(a); }
  const p1 = rbox(6.6, 0.75, 6.6, shadeHex(col, -0.08), 0, H1 + 0.3, 0, 0.06); g.add(p1);
  const rail1 = rbox(6.9, 0.28, 6.9, shadeHex(col, 0.1), 0, H1 + 0.82, 0, 0.04); g.add(rail1);
  g.add(frustum([0, H1 + 0.9, 0], 2.55, [0, 13.2, 0], 1.25, midM));
  g.add(rbox(3.2, 0.5, 3.2, shadeHex(col, -0.08), 0, 13.4, 0, 0.05));
  g.add(frustum([0, 13.6, 0], 1.1, [0, 22.0, 0], 0.32, topM));
  g.add(rbox(0.95, 0.75, 0.95, shadeHex(col, -0.05), 0, 22.3, 0, 0.05));
  g.add(cyl(0.12, 0.16, 1.6, shadeHex(col, -0.15), 0, 23.4, 0, 10));
  g.add(cyl(0.04, 0.06, 1.2, '#5a3a26', 0, 24.6, 0, 6));
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.42), toon('#ffffff', { map: canvasTex(48, 30, (x, W, H) => { [['#2a4aa0', 0], ['#f4f1ea', 1], ['#c8261e', 2]].forEach(([c, i]) => { x.fillStyle = c; x.fillRect(i * W / 3, 0, W / 3 + 1, H); }); }), side: THREE.DoubleSide }));
  flag.position.set(0.37, 24.95, 0); flag.userData.noOutline = true; g.add(flag); g.flag = flag;
  outline(g, { px: 2.4 });
  g.update = (t) => { flag.rotation.y = Math.sin(t * 6) * 0.25; };
  return g;
}

// ---------------------------------------------------------------- SETS
function tree(seed = 1, s = 1) { const r = rng(seed), g = new THREE.Group(); g.add(cyl(0.16 * s, 0.22 * s, 1.8 * s, '#6a4a30', 0, 0.9 * s, 0, 8));
  for (let i = 0; i < 5; i++) g.add(ball((0.75 + r() * 0.4) * s, ['#5f9a3a', '#6aa844', '#548a34'][i % 3], (r() - 0.5) * 1.1 * s, (2.2 + r() * 1.0) * s, (r() - 0.5) * 0.9 * s, 14));
  outline(g, { px: 2.2 }); return g; }
function lampPost() { const g = new THREE.Group(); g.add(cyl(0.06, 0.09, 3.2, '#2a3a32', 0, 1.6, 0, 8), cyl(0.2, 0.26, 0.2, '#2a3a32', 0, 0.1, 0, 10), ball(0.22, '#f6e8b0', 0, 3.4, 0, 12), cyl(0.26, 0.12, 0.16, '#2a3a32', 0, 3.62, 0, 10)); outline(g, { px: 2.2 }); return g; }
// parisPark(st) — Champ-de-Mars style lawn + gravel path, trees, lamp posts, cream Haussmann blocks far back, sunny sky; tower at the origin
export function parisPark(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), toon('#86bd5e')); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; gr.userData.noOutline = true; g.add(gr);
  const path = floor(9, 120, '#e2cfa4', 0, 40); path.position.y = 0.01; path.receiveShadow = true; g.add(path);
  const plaza = floor(16, 16, '#e2cfa4', 0, 0); plaza.position.y = 0.012; g.add(plaza);
  const r = rng(o.seed || 3);
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) { const t = tree(i * 3 + (sx > 0 ? 1 : 0), 1.1 + r() * 0.3); t.position.set(sx * (8.5 + r() * 1.5), 0, 14 - i * 7); g.add(t); }
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const l = lampPost(); l.position.set(sx * 7.6, 0, 18 - i * 7); g.add(l); }
  for (let i = 0; i < 9; i++) { const f = PR.facade({ w: 9, h: 9 + (i % 3) * 1.5, d: 5, color: ['#efe4cc', '#e8dcc0', '#f2e9d4'][i % 3], trim: '#6a7a8a', windows: 3, seed: i, roof: true });
    f.position.set(-40 + i * 10, 0, -38 - (i % 2) * 3); g.add(f); }
  const sky = o.sky === false ? null : sunnySky(st, { clouds: 9, seed: o.seed || 3 });
  let tower = null; if (o.tower !== false) { tower = eiffel(); if (o.towerAt) tower.position.set(...o.towerAt); if (o.towerScale) tower.scale.setScalar(o.towerScale); g.add(tower); }
  return { group: g, sky, tower, update(t) { sky && sky.update(t); tower && tower.update(t); } };
}
// hotelRoom(st) — a plush suite: red damask walls, gold trim, tall windows w/ curtains, chandelier, rug; podium + easel at x=-2.2
export function hotelRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(30, 20, '#7a4a32', 0, -2));
  g.add(Object.assign(PR.rug({ w: 7, d: 5, color: '#8a2a2e', trim: '#e0b84a' }), {}));
  const wallT = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#a8343a'; x.fillRect(0, 0, w, h); x.fillStyle = '#962c32'; for (let i = 0; i < 12; i++) for (let j = 0; j < 6; j++) { x.beginPath(); x.ellipse(i * 44 + (j % 2) * 22, j * 44 + 10, 9, 14, 0, 0, 7); x.fill(); }
    x.fillStyle = '#f0e2c2'; x.fillRect(0, h * 0.8, w, h * 0.2); x.fillStyle = '#d8b04a'; x.fillRect(0, h * 0.79, w, 6); });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), toon('#ffffff', { map: wallT })); wall.position.set(0, 5, -4.5); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  for (const x of [-6.5, 5.5]) { g.add(plane(2.2, 4.2, '#bfe0f2', x, 3.4, -4.45)); g.add(rbox(2.5, 0.2, 0.2, '#d8b04a', x, 5.6, -4.35, 0.03));
    for (const s of [-1, 1]) { const c = PR.curtain({ w: 0.9, h: 4.6, color: '#e2b84a' }); c.position.set(x + s * 1.25, 0.6, -4.3); g.add(c); } }
  // chandelier
  const ch = new THREE.Group(); ch.add(cyl(0.03, 0.03, 1.6, '#c9a14a', 0, 0.8, 0, 6), ball(0.35, '#e7c35a', 0, 0, 0, 14)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ch.add(ball(0.12, '#fff2c0', Math.cos(a) * 0.7, -0.15, Math.sin(a) * 0.7, 10)); }
  ch.position.set(0.5, 6.3, -1); outline(ch, { px: 2 }); g.add(ch);
  // podium (Lustig) + easel with the tower drawing
  const pod = new THREE.Group(); pod.add(rbox(1.1, 1.25, 0.7, '#5a3420', 0, 0.62, 0, 0.05), rbox(1.3, 0.12, 0.85, '#7a4a2a', 0, 1.28, 0.05, 0.03)); pod.add(rbox(0.5, 0.36, 0.05, '#d8b04a', 0, 0.75, 0.36, 0.02)); outline(pod, { px: 2.4 });
  pod.position.set(o.podX ?? -0.6, 0, -2.4); g.add(pod);
  const easel = easelBoard(); easel.position.set(o.easelX ?? 1.9, 0, -2.9); easel.rotation.y = -0.18; g.add(easel);
  return { group: g, podium: pod, easel };
}
// the easel: a drawing of the tower; .stamp(k) shows the DEMOLITION stamp (k 0..1 slam)
export function easelBoard() {
  const g = new THREE.Group(); const wood = '#8a5a32';
  for (const s of [-1, 1]) { const l = cyl(0.05, 0.05, 3.4, wood, s * 0.75, 1.65, 0, 6); l.rotation.z = s * 0.12; g.add(l); }
  const b = cyl(0.05, 0.05, 3.0, wood, 0, 1.5, -0.6, 6); b.rotation.x = -0.25; g.add(b);
  g.add(rbox(1.9, 0.08, 0.2, wood, 0, 1.05, 0.08, 0.02));
  const tex = canvasTex(360, 460, (x, W, H) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, W, H); x.strokeStyle = '#3a2a22'; x.lineWidth = 7; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(W * 0.2, H * 0.95); x.quadraticCurveTo(W * 0.42, H * 0.6, W * 0.47, H * 0.12); x.lineTo(W * 0.53, H * 0.12); x.quadraticCurveTo(W * 0.58, H * 0.6, W * 0.8, H * 0.95); x.stroke();
    x.beginPath(); x.moveTo(W * 0.3, H * 0.95); x.quadraticCurveTo(W * 0.5, H * 0.72, W * 0.7, H * 0.95); x.stroke();
    for (const [y, w] of [[0.7, 0.24], [0.48, 0.13]]) { x.beginPath(); x.moveTo(W * (0.5 - w), H * y); x.lineTo(W * (0.5 + w), H * y); x.stroke(); }
    x.beginPath(); x.moveTo(W * 0.5, H * 0.12); x.lineTo(W * 0.5, H * 0.04); x.stroke();
    x.lineWidth = 2.5; for (let i = 0; i < 9; i++) { const y = H * (0.18 + i * 0.085); x.beginPath(); x.moveTo(W * 0.5 - (i + 1) * 9, y); x.lineTo(W * 0.5 + (i + 1) * 9, y + 30); x.stroke(); } });
  const board = rbox(2.0, 2.5, 0.08, '#fbf6ea', 0, 2.35, 0.1, 0.03); g.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 2.42), toon('#ffffff', { map: tex })); face.position.set(0, 2.35, 0.15); face.userData.noOutline = true; g.add(face);
  outline(g, { px: 2.4 }); g.boardY = 2.35; return g;
}
// policeFront(st) — a Paris police-station facade with a blue POLICE sign + lamp, cobbled pavement
export function policeFront(st) {
  const g = new THREE.Group(); st.add(g);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), PR.texMat(PR.TEX.cobble('#b9a88e', [10, 8]))); cob.rotation.x = -Math.PI / 2; cob.position.z = 2; cob.receiveShadow = true; cob.userData.noOutline = true; g.add(cob);
  const wallT = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#ebe0c8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d6c8a8'; x.lineWidth = 3; for (let j = 0; j < 8; j++) { x.beginPath(); x.moveTo(0, j * 32); x.lineTo(w, j * 32); x.stroke(); } }, { repeat: [4, 2] });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(18, 9, 1), toon('#ffffff', { map: wallT })); wall.position.set(0, 4.5, -1.5); wall.receiveShadow = true; wall.castShadow = true; g.add(wall);
  const door = rbox(1.8, 3.0, 0.2, '#2a4a7a', 0, 1.5, -0.95, 0.04); g.add(door); g.add(ball(0.08, '#e2b84a', 0.6, 1.5, -0.8, 10));
  g.add(rbox(2.4, 0.3, 0.3, '#d6c8a8', 0, 3.15, -0.9, 0.03));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), toon('#ffffff', { map: canvasTex(400, 108, (x, W, H) => { x.fillStyle = '#1e3c86'; x.fillRect(0, 0, W, H); x.strokeStyle = '#f4f1ea'; x.lineWidth = 8; x.strokeRect(8, 8, W - 16, H - 16); x.fillStyle = '#f4f1ea'; x.font = '900 72px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('POLICE', W / 2, H / 2 + 4); }) }));
  sign.position.set(0, 3.75, -0.98); sign.userData.noOutline = true; g.add(sign);
  for (const x of [-4.5, 4.5]) { g.add(plane(1.6, 2.2, '#9fc0d8', x, 4.4, -0.99)); g.add(rbox(1.9, 0.18, 0.25, '#d6c8a8', x, 3.25, -0.9, 0.03)); }
  const lamp = new THREE.Group(); lamp.add(cyl(0.05, 0.05, 0.5, '#2a2a2a', 0, 0, 0.25, 6), ball(0.2, '#3a7ad0', 0, -0.05, 0.5, 12)); lamp.children[0].rotation.x = Math.PI / 2; lamp.position.set(1.6, 3.4, -0.95); g.add(lamp);
  outline(door, { px: 2.4 }); outline(lamp, { px: 2 });
  return { group: g };
}
// prisonCell(st) — grey block walls, a bunk, a small barred window; bars added separately (front)
export function prisonCell(st) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(14, 10, '#8a8a86', 0, 0));
  const wT = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#a8a8a2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8a8a84'; x.lineWidth = 5; for (let j = 0; j < 8; j++) { x.beginPath(); x.moveTo(0, j * 32); x.lineTo(w, j * 32); x.stroke(); for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(i * 64 + (j % 2) * 32, j * 32); x.lineTo(i * 64 + (j % 2) * 32, j * 32 + 32); x.stroke(); } } }, { repeat: [3, 2] });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), toon('#ffffff', { map: wT })); back.position.set(0, 4, -2.6); back.receiveShadow = true; back.userData.noOutline = true; g.add(back);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), toon('#ffffff', { map: wT })); sw.position.set(s * 3.4, 4, 1.2); sw.rotation.y = -s * Math.PI / 2; sw.receiveShadow = true; sw.userData.noOutline = true; g.add(sw); }
  const win = plane(1.0, 0.8, '#bfe0f2', 1.2, 4.6, -2.58); g.add(win); for (let i = 0; i < 4; i++) g.add(cyl(0.03, 0.03, 0.8, '#3a3a3a', 0.85 + i * 0.23, 4.6, -2.55, 6));
  const bunk = new THREE.Group(); bunk.add(rbox(2.6, 0.18, 1.1, '#6a6a6a', 0, 0.75, 0, 0.03), rbox(2.5, 0.18, 1.0, '#e8e2d2', 0, 0.92, 0, 0.06), rbox(0.6, 0.16, 0.8, '#f4f1ea', -0.9, 1.08, 0, 0.06));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bunk.add(cyl(0.05, 0.05, 0.75, '#4a4a4a', sx * 1.2, 0.37, sz * 0.48, 6));
  bunk.position.set(-0.8, 0, -1.9); outline(bunk, { px: 2.4 }); g.add(bunk);
  // ALCATRAZ plate over the window
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), toon('#ffffff', { map: canvasTex(360, 82, (x, W, H) => { x.fillStyle = '#2a2a2e'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2d36a'; x.font = '900 56px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ALCATRAZ', W / 2, H / 2 + 3); }) }));
  plate.position.set(1.2, 3.75, -2.58); plate.userData.noOutline = true; g.add(plate);
  return { group: g, bunk };
}
export function bars(n = 9, w = 6, h = 5) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(cyl(0.05, 0.05, h, '#3a3c40', -w / 2 + i * w / (n - 1), h / 2, 0, 8)); g.add(rbox(w + 0.2, 0.12, 0.12, '#3a3c40', 0, h * 0.82, 0, 0.02), rbox(w + 0.2, 0.12, 0.12, '#3a3c40', 0, h * 0.18, 0, 0.02)); outline(g, { px: 2.4 }); return g; }
// train carriage (green, 3 windows) for the getaway
export function carriage() {
  const g = new THREE.Group(); const gc = '#2f6a4a';
  g.add(rbox(7, 2.6, 0.2, gc, 0, 2.0, -1.2, 0.05), rbox(0.2, 2.6, 2.6, gc, -3.4, 2.0, 0, 0.05), rbox(0.2, 2.6, 2.6, gc, 3.4, 2.0, 0, 0.05));
  g.add(rbox(7, 1.15, 0.2, gc, 0, 1.27, 1.2, 0.05), rbox(7, 0.45, 0.2, gc, 0, 3.08, 1.2, 0.05));
  for (const x of [-3.25, -1.2, 1.2, 3.25]) g.add(rbox(x === -1.2 || x === 1.2 ? 0.9 : 0.5, 1.1, 0.2, gc, x, 2.4, 1.2, 0.03));
  g.add(plane(6.8, 2.4, '#4a3a2e', 0, 2.0, -1.08));
  g.add(rbox(7.2, 0.25, 2.8, '#1e3a2a', 0, 3.4, 0, 0.06), rbox(7, 0.3, 2.4, '#1e2a22', 0, 0.6, 0, 0.04), rbox(7, 0.1, 2.4, '#5a4a3a', 0, 0.68, 0, 0.02));
  g.add(rbox(7.05, 0.12, 0.25, '#e2b84a', 0, 1.82, 1.25, 0.02));
  const wheels = []; for (const x of [-2.6, -1.4, 1.4, 2.6]) { const wh = cyl(0.42, 0.42, 0.2, '#2a2a2a', x, 0.42, 1.25, 16); wh.rotation.x = Math.PI / 2; g.add(wh); wheels.push(wh); }
  outline(g, { px: 2.4 }); g.wheels = wheels; return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// THE top caption (jail-break rule 1c): adds story, visible from frame 1 for >= 3 s, top ~8-15 % of the frame.
export const TOP_CAPTION = ['the buyer was too embarrassed', 'to call the cops'];
export const TOP_UNTIL = 3.4;
export function topCaption(g, t, info) {
  const T = info.shot.start + t; if (T > TOP_UNTIL) return; const fade = clamp((TOP_UNTIL - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  TOP_CAPTION.forEach((l, i) => { g.save(); g.translate(E.W / 2, 170 + i * 92); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 84 : 66, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420;
  g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(k, k); g.globalAlpha = o.a ?? 0.95; g.lineJoin = 'round';
  g.fillStyle = 'rgba(255,248,236,.88)'; g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-140, -60, 280, 120, 18); g.fill(); g.stroke();
  insT(g, String(year), 0, 4, 92, { color: o.color || '#e23b2e', stroke: null });
  g.restore();
}
// red rubber stamp slammed onto the frame (t = time since the slam)
export function stamp(g, t, text, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = lerp(2.4, 1, ease.out(k)) * (o.scale || 1); const x = o.x ?? E.W / 2, y = o.y ?? 760;
  const w = o.w || 600, h = o.h || 180;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.14); g.scale(s, s); g.globalAlpha = clamp(k * 1.4) * 0.95; g.lineJoin = 'round';
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 22); g.fill(); }
  g.strokeStyle = o.color || '#d8281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 22); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 16); g.stroke();
  insT(g, text, 0, 6, o.size || 120, { color: o.color || '#d8281e', stroke: null, maxW: w - 60 });
  g.restore();
}
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, canvasTex, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, sunnySky, shadeHex };
