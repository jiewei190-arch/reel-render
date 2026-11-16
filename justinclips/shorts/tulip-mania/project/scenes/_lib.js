// Tulip mania (1630s): shared assets. EMOTION: LOL. Deadpan narrator. All characters are original toons (no likenesses).
// Tone guard: nobody is hurt or ruined on screen; the crash is shown as a falling chart, flying papers and shocked faces.
import { E, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, toonStage, blob } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { sph, mesh } from './_common.js';
export * from './_common.js';
export { PR, sunnySky, bean, blob };

// ---------------------------------------------------------------- TULIPS
const petalTex = {};
function petalMat(kind) {
  if (petalTex[kind]) return petalTex[kind];
  let m;
  if (kind === 'flame') {
    const tx = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#fff4dc'; x.fillRect(0, 0, w, h); const r = rng(9);
      for (let i = 0; i < 14; i++) { const cx = (i / 14) * w + r() * 8; x.fillStyle = i % 2 ? '#d8202a' : '#b0101e'; x.beginPath(); x.moveTo(cx - 9, h); x.bezierCurveTo(cx - 14, h * 0.6, cx + 12 * (r() - 0.5), h * 0.35, cx + 3, h * (0.08 + r() * 0.15)); x.bezierCurveTo(cx + 10, h * 0.4, cx + 12, h * 0.7, cx + 9, h); x.fill(); } });
    m = toon('#ffffff', { map: tx });
  } else m = toon(kind);
  petalTex[kind] = m; return m;
}
// tulip(o): stem + 2 leaves + a cup of 6 petals. o.kind = 'flame' (striped "broken" tulip) or a colour. Height ~1.55 * scale.
export function tulip(o = {}) {
  const g = new THREE.Group(); const s = o.scale || 1;
  g.add(cyl(0.03, 0.04, 1.1, '#4f8a34', 0, 0.55, 0, 10));
  for (const sd of [-1, 1]) { const lf = mesh(sph, toon('#5f9a3a'), 0.09, 0.42, 0.04); lf.position.set(sd * 0.12, 0.38, 0); lf.rotation.z = sd * -0.35; g.add(lf); }
  const cup = new THREE.Group(); cup.position.y = 1.18; g.add(cup); const mat = petalMat(o.kind || 'flame');
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const r0 = i % 2 ? 0.1 : 0.07; const p = mesh(sph, mat, 0.15, 0.3, 0.08); p.position.set(Math.cos(a) * r0, 0.16, Math.sin(a) * r0); p.rotation.set(0, -a + Math.PI / 2, 0); p.rotateX(-0.18); cup.add(p); }
  outline(g, { px: 2.6 }); g.scale.setScalar(s); g.cup = cup; return g;
}
export function bulb(o = {}) {
  const g = new THREE.Group(); const b = lathe([[0.001, 0], [0.16, 0.03], [0.24, 0.16], [0.2, 0.32], [0.08, 0.46], [0.02, 0.56], [0.001, 0.58]], o.color || '#b07a48', 20); g.add(b);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const r = cyl(0.008, 0.008, 0.16, '#e8d8b0', Math.cos(a) * 0.07, -0.05, Math.sin(a) * 0.07, 5); r.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(r); }
  const tip = cyl(0.012, 0.02, 0.1, '#7aa04a', 0, 0.62, 0, 6); g.add(tip);
  outline(g, { px: 2.6 }); g.scale.setScalar(o.scale || 1); return g;
}
export function pot(o = {}) { const g = new THREE.Group(); g.add(lathe([[0.001, 0], [0.22, 0.01], [0.3, 0.42], [0.34, 0.46], [0.34, 0.52], [0.001, 0.52]], o.color || '#b5653a', 20)); g.add(cyl(0.29, 0.29, 0.02, '#5a3a22', 0, 0.5, 0, 20)); outline(g, { px: 2.6 }); return g; }
export function pottedTulip(o = {}) { const g = new THREE.Group(); const p = pot(o); g.add(p); const t = tulip(o); t.position.y = 0.45; g.add(t); g.tulip = t; return g; }

// ---------------------------------------------------------------- PEOPLE (1630s Dutch, original toons)
export function dutchHat(b, color = '#1e1c22') {
  const g = new THREE.Group(); g.add(cyl(0.34, 0.4, 0.62, color, 0, 0.62, 0, 24)); g.add(cyl(0.8, 0.8, 0.04, color, 0, 0.33, 0, 28)); g.add(cyl(0.405, 0.405, 0.08, '#c9a24a', 0, 0.38, 0, 24));
  outline(g, { px: 3 }); g.rotation.x = -0.1; b.parts.head.add(g); b.hat = g; return g;
}
export function ruff(b) {
  const g = new THREE.Group(); const m = toon('#f8f4ea');
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; const f = mesh(sph, m, 0.12, 0.07, 0.07); f.position.set(Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36); f.rotation.y = -a; g.add(f); }
  outline(g, { px: 2.4 }); g.position.y = -0.46; b.parts.head.add(g); return g;
}
// o.look: 'merchant' (black + ruff + tall hat), 'trader' (brown doublet, no hat), 'craftsman' (apron), 'historian' (modern, glasses)
export function dutchman(o = {}) {
  const look = o.look || 'merchant';
  if (look === 'historian') return bean({ name: 'Historian', outfit: 'tee', colors: { main: o.main || '#5a7ab0', trim: '#ffffff', print: '#f2d04a' }, skin: o.skin || 'fair', hair: 'bob', hairColor: o.hairColor || '#6a3a22', glasses: true, seed: o.seed || 41 });
  if (look === 'craftsman') return bean({ name: 'Craft', outfit: 'tunic', colors: { main: o.main || '#8a6a44', trim: '#e8dcc0', belt: '#4a3420' }, skin: o.skin || 'tan', hair: 'curly', hairColor: '#5a3418', beard: true, beardColor: '#5a3418', seed: o.seed || 13 });
  const b = bean({ name: 'Dutch', outfit: 'uniform', colors: { main: o.main || (look === 'trader' ? '#7a4a2a' : '#26242c'), trim: '#e8dcc0', belt: '#1a181c' }, skin: o.skin || 'light',
    hair: o.hair || 'long', hairColor: o.hairColor || '#6a4a2a', moustache: o.moustache ?? '#6a4a2a', seed: o.seed || 3 });
  ruff(b); if (look === 'merchant' && o.hat !== false) dutchHat(b, o.hatColor); return b;
}

// ---------------------------------------------------------------- BUILDINGS
const houseTex = {};
function facadeTex(color, seed) {
  const k = color + seed; if (houseTex[k]) return houseTex[k];
  houseTex[k] = canvasTex(256, 512, (x, w, h) => { x.fillStyle = color; x.fillRect(0, 0, w, h); const r = rng(seed);
    x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = 2; for (let y = 0; y < h; y += 12) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
    for (let row = 0; row < 3; row++) for (let c = 0; c < 2; c++) { const wx = 40 + c * 110, wy = 50 + row * 120; x.fillStyle = '#f4efe2'; x.fillRect(wx - 6, wy - 6, 78, 96); x.fillStyle = '#7fb0d8'; x.fillRect(wx, wy, 66, 84); x.fillStyle = '#f4efe2'; x.fillRect(wx + 31, wy, 4, 84); x.fillRect(wx, wy + 40, 66, 4); }
    x.fillStyle = '#2f4a2a'; x.fillRect(96, 400, 64, 112); x.fillStyle = '#f4efe2'; x.fillRect(90, 394, 76, 8); x.fillStyle = '#d8b24a'; x.beginPath(); x.arc(148, 456, 4, 0, 7); x.fill(); });
  return houseTex[k];
}
// canalHouse(o): narrow brick house with a stepped gable, front at +Z. ~2.2 wide, ~5.6 tall.
export function canalHouse(o = {}) {
  const g = new THREE.Group(); const col = o.color || '#9a4a32'; const w = o.w || 2.2, h = o.h || 4.2, d = 2.4;
  const bodyM = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(col)); bodyM.position.y = h / 2; bodyM.castShadow = bodyM.receiveShadow = true; bodyM.userData.noOutline = true; g.add(bodyM);
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: facadeTex(col, o.seed || 1) })); fr.position.set(0, h / 2, d / 2 + 0.005); fr.userData.noOutline = true; fr.receiveShadow = true; g.add(fr);
  const steps = 4; for (let i = 0; i < steps; i++) { const sw = w * (1 - i / steps * 0.85); const sb = box(sw, 0.42, d, col, 0, h + 0.21 + i * 0.42, 0); sb.userData.noOutline = true; sb.castShadow = true; g.add(sb); const cap = box(sw + 0.08, 0.06, d + 0.06, '#f0e8d8', 0, h + 0.42 + i * 0.42, 0); cap.userData.noOutline = true; g.add(cap); }
  const cr = box(w + 0.12, 0.1, d + 0.1, '#f0e8d8', 0, h, 0); cr.userData.noOutline = true; g.add(cr);
  g.add(box(0.12, 0.12, 0.6, '#3a2a1a', 0, h + 1.6, d / 2 + 0.2));   // hoist beam
  return g;
}
// a toy-sized canal house (for the scale)
export function miniHouse(o = {}) { const g = canalHouse({ color: o.color || '#b4523a', seed: 5 }); g.scale.setScalar(o.scale || 0.22); return g; }

// balanceScale(): post + pivoting beam + two hanging pans. .set(theta) tilts (theta > 0 = LEFT pan down). .pan.L/.pan.R are groups to put things on.
export function balanceScale(o = {}) {
  const g = new THREE.Group(); const H = o.H || 2.6, Lb = o.L || 1.5, chain = o.chain || 1.1; const gold = o.color || '#d8a83a';
  g.add(cyl(0.6, 0.75, 0.22, '#5a3a22', 0, 0.11, 0, 28)); g.add(cyl(0.07, 0.09, H, gold, 0, H / 2, 0, 16)); g.add(ball(0.13, gold, 0, H + 0.05, 0, 16));
  const beam = new THREE.Group(); beam.position.y = H; g.add(beam); beam.add(rbox(Lb * 2 + 0.2, 0.1, 0.12, gold, 0, 0, 0, 0.04)); for (const s of [-1, 1]) beam.add(ball(0.08, gold, s * Lb, 0, 0, 12));
  const pans = {}; for (const [k, s] of [['L', -1], ['R', 1]]) { const p = new THREE.Group(); p.add(cyl(0.62, 0.42, 0.1, gold, 0, 0, 0, 28)); const cg = new THREE.Group(); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const c = cyl(0.012, 0.012, chain, '#8a6a2a', Math.cos(a) * 0.3, chain / 2, Math.sin(a) * 0.3, 5); c.rotation.set(-Math.sin(a) * 0.26, 0, Math.cos(a) * 0.26); cg.add(c); } p.add(cg); g.add(p); pans[k] = p; p.s = s; }
  outline(g, { px: 2.6 });
  g.pan = pans;
  g.set = (th) => { beam.rotation.z = th; for (const p of Object.values(pans)) { const x = p.s * Lb * Math.cos(th), y = H + p.s * Lb * Math.sin(th); p.position.set(x, y - chain, 0); } };
  g.set(0); return g;
}
export function coin(o = {}) { const c = cyl(0.14, 0.14, 0.035, '#f2c23a', 0, 0, 0, 20); outline(c, { px: 2 }); return c; }
export function mug() { const g = new THREE.Group(); g.add(cyl(0.11, 0.1, 0.26, '#b9b3a8', 0, 0.13, 0, 14)); g.add(cyl(0.1, 0.1, 0.02, '#f6f0e0', 0, 0.26, 0, 14)); outline(g, { px: 2 }); return g; }

// ---------------------------------------------------------------- SETS
// canal street: cobbles, a canal running into -Z with houses on both banks, a windmill far away, sunny sky.
export function canalStreet(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const cob = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#b8a48a'; x.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 160; i++) { x.fillStyle = r() > 0.5 ? '#a8927a' : '#c8b498'; x.beginPath(); x.ellipse(r() * w, r() * h, 10 + r() * 6, 7 + r() * 4, 0, 0, 7); x.fill(); } });
  cob.wrapS = cob.wrapT = THREE.RepeatWrapping; cob.repeat.set(6, 20);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(60, 120), toon('#ffffff', { map: cob })); street.rotation.x = -Math.PI / 2; street.position.z = -30; street.receiveShadow = true; street.userData.noOutline = true; g.add(street);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(5, 120), toon('#3f86b8', { emissive: new THREE.Color('#2a5a88'), emissiveIntensity: 0.25 })); water.rotation.x = -Math.PI / 2; water.position.set(o.canalX ?? 0, -0.25, -30); water.userData.noOutline = true; g.add(water);
  for (const s of [-1, 1]) { const edge = box(0.25, 0.3, 120, '#8a7a6a', (o.canalX ?? 0) + s * 2.6, -0.1, -30); edge.userData.noOutline = true; g.add(edge); }
  const cols = ['#9a4a32', '#6a3a2a', '#b4683a', '#7a5a4a', '#a8442e', '#5a4a3a'];
  const r = rng(o.seed || 7);
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const hz = 4 - i * 2.5; const hh = canalHouse({ color: cols[(i + (s > 0 ? 3 : 0)) % cols.length], h: 3.6 + r() * 1.4, seed: i + (s > 0 ? 10 : 0) }); hh.position.set((o.canalX ?? 0) + s * (o.houseX ?? 6.4), 0, hz); hh.rotation.y = -s * Math.PI / 2; g.add(hh); }
  const mill = PR.windmill ? PR.windmill() : null; if (mill) { mill.position.set(9, 0, -40); mill.scale.setScalar(2.0); g.add(mill); }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3 });
  return { group: g, sky, mill, update(t) { sky.update(t); if (mill && mill.fan) mill.fan.rotation.z = t * 1.2; } };
}
// tavern: plank floor, plaster back wall with a window, a long table, stools, barrels, mugs, papers.
export function tavern(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const plank = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#8a5a34'; x.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#7a4e2c' : '#94603a'; x.fillRect(0, i * 32, w, 30); } });
  plank.wrapS = plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(4, 4);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon('#ffffff', { map: plank })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; f.userData.noOutline = true; g.add(f);
  const wall = plane(30, 12, '#e6d2b0', 0, 6, -3.5); wall.receiveShadow = true; g.add(wall);
  for (let i = -3; i <= 3; i++) { const bm = box(0.25, 12, 0.2, '#5a3a22', i * 2.6, 6, -3.4); bm.userData.noOutline = true; g.add(bm); }
  const win = plane(1.8, 1.4, '#bfe0ff', 1.3, 3.0, -3.38); g.add(win); const wf = box(1.95, 0.1, 0.1, '#5a3a22', 1.3, 3.0, -3.3); wf.userData.noOutline = true; g.add(wf); const wf2 = box(0.1, 1.5, 0.1, '#5a3a22', 1.3, 3.0, -3.3); wf2.userData.noOutline = true; g.add(wf2);
  const tb = PR.table({ w: o.tableW || 3.4, d: 1.3, h: 1.05, color: '#7a4e2c' }); tb.position.set(0, 0, o.tableZ ?? 0); g.add(tb);
  for (const [x, z] of [[-3.6, -2.6], [3.8, -2.4], [-4.4, -1.6]]) { const b = PR.barrel(); b.position.set(x, 0, z); b.scale.setScalar(1.2); g.add(b); }
  const mugs = []; for (const [x, z] of [[-1.1, 0.25], [0.9, -0.3], [1.4, 0.3]]) { const m = mug(); m.position.set(x, 1.11, (o.tableZ ?? 0) + z); g.add(m); mugs.push(m); }
  const pp = PR.papers({ n: 6, seed: 3, spread: 1.2 }); pp.position.set(-0.2, 1.12, o.tableZ ?? 0); g.add(pp);
  // warm lamp glow
  const lamp = new THREE.PointLight(new THREE.Color('#ffb060'), 1.2, 12); lamp.position.set(0, 3.5, 1.5); st.add(lamp);
  return { group: g, tableTop: 1.11, update() {} };
}
// soil block cross-section with grass on top; the bulb is half embedded in the cut face (z = 0)
export function soilBlock(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const dirt = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#6a4428'; x.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 300; i++) { x.fillStyle = r() > 0.5 ? '#5a3820' : '#7c5232'; x.beginPath(); x.arc(r() * w, r() * h, 2 + r() * 5, 0, 7); x.fill(); } });
  const b = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 4), toon('#ffffff', { map: dirt })); b.position.set(0, -1.5, -2); b.receiveShadow = true; b.userData.noOutline = true; g.add(b);
  const grass = box(8.1, 0.18, 4.1, '#6aa83a', 0, 0.05, -2); grass.userData.noOutline = true; grass.receiveShadow = true; g.add(grass);
  return g;
}
