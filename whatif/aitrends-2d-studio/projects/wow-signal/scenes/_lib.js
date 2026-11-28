// The Wow! signal — shared assets. Toon 3D. Generic toon people only (the astronomer is a generic bean, not a likeness).
// 3D: the fanfold printout (dynamic canvas: columns of intensity characters, the 6EQUJ5 column, a red circle + "Wow!"
// that draw on), a 1970s line printer, the Big Ear field (flat reflector, curved reflector, metal ground plane, feed hut),
// a literal cartoon ear, a night starfield, a lab room, toon comets with faces, a hydrogen cloud with a face, a big
// generic radio dish in a valley. 2D: top caption, chips, stamps, the 6EQUJ5 bar card, cobwebs, calendar pages, bubbles.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { T as TXT, INK as CARD_INK } from '/kits/toon3d/insert.js';
import { reactions as _reactions } from '/kits/toon3d/react.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));
const sph = new THREE.SphereGeometry(1, 24, 16);
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };
export const RED = '#e23b2e', GOLD = '#ffd23a';

// ---------------------------------------------------------------- PRINTOUT (dynamic canvas)
// Columns of intensity characters (blank / 1-9 / A-Z), like the real computer printout format; one column carries 6 E Q U J 5.
const PW = 768, PH = 1536, ROWS = 34, COLS = 11, ROW0 = 15, COL = 3;
function noiseGrid(seed) { const r = rng(seed); const G = []; for (let j = 0; j < ROWS; j++) { const row = []; for (let i = 0; i < COLS; i++) { const v = r(); row.push(v < 0.42 ? ' ' : v < 0.86 ? '1' : v < 0.97 ? '2' : '3'); } G.push(row); } return G; }
const WOW = ['6', 'E', 'Q', 'U', 'J', '5'];
export function drawPrintout(g, W, H, o = {}) {
  const G = o.grid; const quiet = o.quiet;
  g.fillStyle = '#f6f1e0'; g.fillRect(0, 0, W, H);
  // green bars (classic fanfold paper)
  g.fillStyle = 'rgba(120,190,140,0.28)'; for (let y = 0; y < H; y += 96) g.fillRect(0, y + (o.scroll || 0) % 96, W, 48);
  // tractor holes
  g.fillStyle = '#d8d0bc'; for (let y = 20; y < H; y += 48) { g.beginPath(); g.arc(22, y, 9, 0, 7); g.fill(); g.beginPath(); g.arc(W - 22, y, 9, 0, 7); g.fill(); }
  g.font = '700 34px "Courier New", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const cw = (W - 120) / COLS, rh = (H - 40) / ROWS;
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    let ch = G[j][i]; const isW = !quiet && i === COL && j >= ROW0 && j < ROW0 + 6; if (isW) ch = WOW[j - ROW0];
    if (ch === ' ') continue; g.fillStyle = isW ? '#1a1418' : '#3a3438'; g.font = isW ? '900 40px "Courier New", monospace' : '700 34px "Courier New", monospace';
    g.fillText(ch, 60 + cw * (i + 0.5), 20 + rh * (j + 0.5));
  }
  const cx = 60 + cw * (COL + 0.5), cy = 20 + rh * (ROW0 + 3), rx = cw * 0.62, ry = rh * 3.7;
  if (o.circle > 0) { g.save(); g.strokeStyle = '#d42a22'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath();
    const a0 = -Math.PI * 0.6, n = 60, k = clamp(o.circle); for (let s = 0; s <= n * k; s++) { const a = a0 + (s / n) * Math.PI * 2.15; const wob = 1 + Math.sin(s * 0.7) * 0.03; const x = cx + Math.cos(a) * rx * wob, y = cy + Math.sin(a) * ry * wob; s ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); g.restore(); }
  if (o.wow > 0) { g.save(); g.fillStyle = '#d42a22'; g.translate(cx - cw * 1.75, cy - rh * 0.4); g.rotate(-0.16); const s = ease.outBack(clamp(o.wow)); g.scale(s, s);
    g.font = 'italic 700 88px "Fredoka", sans-serif'; g.textAlign = 'center'; g.fillText('Wow!', 0, 0); g.restore(); }
  return { cx: cx / W, cy: cy / H };
}
// printout({ w, h, seed, curl }) -> Group with .sheet; .update({ circle, wow, scroll, quiet }) redraws only on change
export function printout(o = {}) {
  const w = o.w || 1.6, h = o.h || 3.2, grid = noiseGrid(o.seed || 7);
  const c = document.createElement('canvas'); c.width = PW; c.height = PH; const g2 = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const geo = new THREE.PlaneGeometry(w, h, 1, 30); const pos = geo.attributes.position;
  const curl = o.curl ?? 0.35; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); const v = (y + h / 2) / h; pos.setZ(i, Math.sin(v * Math.PI * 1.2) * curl * (1 - v) + (v > 0.85 ? (v - 0.85) * 2.2 : 0)); }
  geo.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, color: new THREE.Color('#fbf8ee') });
  const sheet = new THREE.Mesh(geo, mat); sheet.userData.noOutline = true; sheet.castShadow = true;
  const grp = new THREE.Group(); grp.add(sheet); grp.sheet = sheet; let last = '';
  grp.update = (u = {}) => { const key = [u.circle || 0, u.wow || 0, Math.round(u.scroll || 0), u.quiet ? 1 : 0].map(v => (+v).toFixed(2)).join('|'); if (key === last) return; last = key;
    grp.uv = drawPrintout(g2, PW, PH, { grid, ...u }); tex.needsUpdate = true; };
  grp.update({}); grp.W = w; grp.H = h;
  // paper-space (u,v in 0..1, v down) -> world, following the curl
  grp.uvWorld = (u, v) => { const vy = 1 - v; const z = Math.sin(vy * Math.PI * 1.2) * curl * (1 - vy) + (vy > 0.85 ? (vy - 0.85) * 2.2 : 0); return sheet.localToWorld(new THREE.Vector3((u - 0.5) * w, (vy - 0.5) * h, z + 0.02)); };
  // the pen tip on the circle at progress k
  grp.penUV = (k) => { const cw = (PW - 120) / COLS, rh = (PH - 40) / ROWS; const cx = 60 + cw * (COL + 0.5), cy = 20 + rh * (ROW0 + 3); const a = -Math.PI * 0.6 + clamp(k) * Math.PI * 2.15; return [(cx + Math.cos(a) * cw * 0.62) / PW, (cy + Math.sin(a) * rh * 3.7) / PH]; };
  grp.wowUV = () => { const cw = (PW - 120) / COLS, rh = (PH - 40) / ROWS; return [(60 + cw * (COL + 0.5) - cw * 1.75) / PW, (20 + rh * (ROW0 + 3) - rh * 0.4) / PH]; };
  // world point of the 6EQUJ5 circle (for FX)
  grp.circleWorld = () => { const v = new THREE.Vector3((grp.uv.cx - 0.5) * w, (0.5 - grp.uv.cy) * h, 0.05); return sheet.localToWorld(v); };
  return grp;
}
// 1970s line printer: beige cabinet, dark top slot, a row of lamps; paper feeds up out of the top
export function printer(o = {}) {
  const g = new THREE.Group();
  g.add(rbox(2.4, 1.25, 1.2, '#d8cdb0', 0, 0.75, 0, 0.08), rbox(2.5, 0.12, 1.3, '#8a7a5a', 0, 0.08, 0, 0.04));
  g.add(rbox(1.9, 0.12, 0.3, '#2a2628', 0, 1.39, 0.1, 0.04));
  g.add(rbox(2.2, 0.32, 0.06, '#5a6a7a', 0, 1.05, 0.62, 0.03));
  const lamps = [0, 1, 2, 3].map(i => { const l = ball(0.05, '#ff4a3a', -0.8 + i * 0.22, 1.05, 0.66, 10); l.material = flat(i % 2 ? '#ffd23a' : '#5aff7a'); l.userData.noOutline = true; g.add(l); return l; });
  g.add(rbox(0.5, 0.2, 0.06, '#c9ccd2', 0.7, 1.05, 0.64, 0.03));
  for (const x of [-1.0, 1.0]) g.add(cyl(0.05, 0.05, 0.12, '#2a2220', x, 0.0, 0.45, 8));
  outline(g, { px: 2.4 });
  g.update = (t, k = 1) => { lamps.forEach((l, i) => { l.visible = k < 0.5 || Math.sin(t * 9 + i * 2.1) > -0.3; }); };
  g.topY = 1.45; return g;
}
// red marker pen (cap + body); held via world position each frame
export function marker() { const g = new THREE.Group(); g.add(cyl(0.035, 0.035, 0.32, '#d42a22', 0, 0.0, 0, 10), cyl(0.038, 0.038, 0.1, '#f2efe8', 0, 0.2, 0, 10), cyl(0.012, 0.03, 0.06, '#5a1a14', 0, -0.19, 0, 8)); outline(g, { px: 2 }); return g; }

// ---------------------------------------------------------------- PEOPLE (generic)
export function astronomer(o = {}) {
  return bean({ name: 'Astronomer', outfit: 'tee', skin: o.skin || 'light', hair: 'swoop', hairColor: '#3a2a20', glasses: true, beard: !!o.beard, beardColor: '#5a4a40',
    colors: { main: o.color || '#8a5a32', legs: '#3a3f4a', feet: '#2a2220' }, seed: o.seed || 21 });
}
export function colleague(o = {}) {
  return bean({ name: 'Colleague', outfit: 'labcoat', skin: o.skin || 'tan', hair: o.hair || 'horseshoe', hairColor: '#8a8580', glasses: !!o.glasses,
    colors: { main: '#f4f2ec', legs: '#3a3f4a' }, seed: o.seed || 33 });
}
export function headphones(b) { const h = b.parts.head, R = 0.48; const band = new THREE.Mesh(new THREE.TorusGeometry(R * 1.08, 0.04, 6, 24, Math.PI), toon('#2a2a30')); h.add(band);
  for (const s of [-1, 1]) { const cup = cyl(0.17, 0.17, 0.12, '#2a2a30', s * R * 1.05, -0.02, 0, 16); cup.rotation.z = Math.PI / 2; h.add(cup); }
  outline(band, { px: 2.6 }); return b; }
export const handWorld = (b, side = 'R') => { const v = new THREE.Vector3(); b.hand[side].getWorldPosition(v); return v; };

// ---------------------------------------------------------------- SKY
export function stars(st, o = {}) {
  const n = o.n || 900, r = rng(o.seed || 5), R = o.R || 120; const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); p.set([Math.cos(a) * s * R, Math.abs(u) * R * 0.9 + 4, Math.sin(a) * s * R], i * 3); const w = 0.75 + r() * 0.25; c.set([w, w, 0.85 + r() * 0.15], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: o.size || 0.9, vertexColors: true, sizeAttenuation: true, fog: false })); pts.userData.noOutline = true; st.add(pts);
  return pts;
}
export const NIGHT = { light: 'night', bg: ['#070b24', '#141c48', '#2c2a5e'], ambient: 1.05, exposure: 1.1 };

// ---------------------------------------------------------------- BIG EAR FIELD
function gridTex() { return canvasTex(512, 512, (g, W, H) => { g.fillStyle = '#9aa4b0'; g.fillRect(0, 0, W, H); g.strokeStyle = '#7a8490'; g.lineWidth = 6; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(W, i * 64); g.stroke(); } }, { repeat: [10, 6] }); }
function latTex() { return canvasTex(512, 256, (g, W, H) => { g.clearRect(0, 0, W, H); g.strokeStyle = '#c8ced6'; g.lineWidth = 7; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, H); g.stroke(); } for (let j = 0; j <= 8; j++) { g.beginPath(); g.moveTo(0, j * 32); g.lineTo(W, j * 32); g.stroke(); } }, {}); }
// bigEar(st, { seed }) : field ~60 wide along X. Flat tilted reflector at x=-26, curved reflector at x=+26, ground plane between.
export function bigEarSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const grass = floor(400, 400, '#1e3a2a', 0, 0); grass.receiveShadow = true; g.add(grass);
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(56, 18), toon('#ffffff', { map: gridTex(), emissive: new THREE.Color('#3a4a6a'), emissiveIntensity: 0.25 })); gp.rotation.x = -Math.PI / 2; gp.position.y = 0.02; gp.receiveShadow = true; gp.userData.noOutline = true; g.add(gp);
  // flat reflector: lattice panel tilted back, on legs
  const lt = latTex(); lt.wrapS = lt.wrapT = THREE.RepeatWrapping; lt.repeat.set(4, 2);
  const flatR = new THREE.Group(); const pan = new THREE.Mesh(new THREE.PlaneGeometry(18, 7.5), new THREE.MeshBasicMaterial({ map: lt, transparent: true, side: THREE.DoubleSide, color: '#e8eef6' })); pan.userData.noOutline = true; flatR.add(pan);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(18, 7.5), toon('#5a6a82', { side: THREE.DoubleSide })); back.position.z = -0.08; back.userData.noOutline = true; flatR.add(back);
  flatR.position.set(-28, 4.4, 0); flatR.rotation.y = Math.PI / 2; flatR.rotation.x = -0.45; g.add(flatR);
  for (const z of [-8, -3, 3, 8]) { const leg = cyl(0.25, 0.3, 6, '#6a7280', -26.5, 3, z, 8); leg.rotation.z = 0.35; g.add(leg); }
  // curved (paraboloid-ish) reflector: an open cylinder section facing -X
  const cur = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 8, 40, 1, true, -0.55, 1.1), toon('#c0c8d4', { side: THREE.DoubleSide, emissive: new THREE.Color('#5a6a8a'), emissiveIntensity: 0.2 }));
  cur.rotation.z = Math.PI / 2; cur.rotation.y = 0; cur.position.set(16, 4, 0); cur.scale.set(1, 1, 1); cur.userData.outlinePx = 2; g.add(cur);
  const curR = new THREE.Group(); curR.add(cur); g.add(curR); cur.position.set(0, 0, 0); cur.rotation.set(0, 0, Math.PI / 2); curR.position.set(16, 4.2, 0); curR.rotation.y = Math.PI / 2;
  // feed hut with horns
  const hut = new THREE.Group(); hut.add(rbox(2.2, 1.4, 1.8, '#e8e0c8', 0, 0.7, 0, 0.08), rbox(2.4, 0.15, 2.0, '#8a3a2a', 0, 1.47, 0, 0.04));
  for (const z of [-0.4, 0.4]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 4, 1, true), toon('#c9ccd2', { side: THREE.DoubleSide })); h.rotation.z = Math.PI / 2; h.position.set(-1.4, 1.0, z); hut.add(h); }
  hut.position.set(6, 0, 0); g.add(hut);
  const r = rng(o.seed || 3); for (let i = 0; i < 26; i++) { const tr = PR.plant ? null : null; const a = r() * Math.PI * 2, d = 40 + r() * 40; const tree = new THREE.Group(); tree.add(cyl(0.3, 0.4, 2, '#3a2a1e', 0, 1, 0, 7)); const cone = new THREE.Mesh(new THREE.ConeGeometry(2.0, 5, 8), toon('#16301f')); cone.position.y = 4; tree.add(cone); tree.position.set(Math.cos(a) * d, 0, Math.sin(a) * d * 0.7 - 10); g.add(tree); }
  outline(g, { px: 2.0 });
  const sky = stars(st, { n: 1100, seed: o.seed || 5 });
  return { group: g, sky, hut, flatR, curR, update(t) {} };
}
// a literal cartoon ear (the name, made visible): skin ellipsoid + inner fold + helix rim. ~6 units tall. .pop(k)
export function bigEarEar() {
  const g = new THREE.Group(); const skin = toon('#f2c09a', { fresh: true }), dark = toon('#d48a6a', { fresh: true });
  const outer = M(sph, skin); outer.scale.set(2.2, 3.2, 0.7); g.add(outer);
  const lobe = M(sph, skin, 0.3, -2.6, 0.1); lobe.scale.set(1.1, 1.0, 0.55); g.add(lobe);
  const inner = M(sph, dark, 0.25, 0.1, 0.45); inner.scale.set(1.35, 2.2, 0.4); inner.userData.noOutline = true; g.add(inner);
  const fold = M(new THREE.TorusGeometry(1.0, 0.28, 10, 24, Math.PI * 1.3), skin, 0.2, 0.3, 0.55); fold.rotation.z = Math.PI * 0.55; fold.scale.set(1, 1.5, 1); g.add(fold);
  outline(g, { px: 3 }); return g;
}

// ---------------------------------------------------------------- LAB ROOM
export function labRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), PR.texMat(PR.TEX.planks('#7a5a3e', [6, 4], 6))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const wall = plane(30, 9, '#6a9a8a', 0, 4.5, -3); wall.receiveShadow = true; g.add(wall); g.add(plane(30, 1.2, '#4a7a6a', 0, 0.6, -2.98));
  const win = canvasTex(256, 256, (x, W, H) => { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a1030'); gr.addColorStop(1, '#2a3a7a'); x.fillStyle = gr; x.fillRect(0, 0, W, H); x.fillStyle = '#fff6c8'; const r = rng(8); for (let i = 0; i < 40; i++) x.fillRect(r() * W, r() * H, 3, 3); });
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), toon('#ffffff', { map: win, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35 })); wm.position.set(o.winX ?? -2.4, 3.5, -2.97); wm.userData.noOutline = true; g.add(wm);
  g.add(rbox(2.8, 0.12, 0.15, '#4a3422', wm.position.x, 2.45, -2.9, 0.02), rbox(2.8, 0.12, 0.15, '#4a3422', wm.position.x, 4.55, -2.9, 0.02));
  // calendar on the wall
  const cal = new THREE.Group(); cal.add(rbox(0.9, 1.1, 0.05, '#f4f0e2', 0, 0, 0, 0.02), rbox(0.9, 0.28, 0.06, RED, 0, 0.42, 0.01, 0.02)); cal.position.set(o.calX ?? 2.2, 3.4, -2.92); g.add(cal);
  const desk = PR.table({ w: 3.2, d: 1.2, h: 0.95, color: '#6a4a30' }); desk.position.set(0, 0, 0); g.add(desk);
  const mug = new THREE.Group(); mug.add(cyl(0.12, 0.11, 0.24, '#e8e0d0', 0, 0.12, 0, 14)); mug.position.set(1.1, 0.97, 0.2); g.add(mug);
  const stack = new THREE.Group(); for (let i = 0; i < 6; i++) stack.add(rbox(0.9, 0.06, 0.7, i % 2 ? '#f4f0e2' : '#e4ecdc', (i % 2) * 0.03, 0.03 + i * 0.065, 0, 0.01)); stack.position.set(-0.9, 0.97, 0.0); g.add(stack);
  outline(g, { px: 2.2 });
  return { group: g, tableY: 0.97, cal, stack, update() {} };
}

// ---------------------------------------------------------------- SPACE CHARACTERS
function faceEyes(parent, R, o = {}) { const eyes = []; for (const s of [-1, 1]) { const eg = new THREE.Group(); eg.position.set(s * R * 0.36, R * 0.15, R * 0.88); parent.add(eg);
    const w = M(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.scale.set(R * 0.28, R * 0.34, R * 0.16); w.userData.outlinePx = 2; eg.add(w);
    const pg = new THREE.Group(); eg.add(pg); const p = M(sph, flat('#1a1214'), 0, 0, R * 0.14); p.scale.set(R * 0.13, R * 0.16, R * 0.03); p.userData.noOutline = true; pg.add(p);
    const lp = new THREE.Group(); eg.add(lp); const lid = new THREE.Mesh(new THREE.SphereGeometry(R * 0.31, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#8ab0d8', { fresh: true })); lid.scale.set(1, 1.15, 0.6); lid.userData.noOutline = true; lp.add(lid);
    eyes.push({ eg, pg, lp }); } return eyes; }
function setEyes(eyes, u, t, seed = 1) { const bl = (Math.sin(t * 1.3 + seed) > 0.985) ? 1 : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.1, 1.57, Math.max(u.lid ?? 0.25, bl)); e.pg.position.set((u.look?.[0] || 0) * 0.05, (u.look?.[1] || 0) * 0.05, 0); }); }
function mouthMesh(R) { const m = new THREE.Mesh(new THREE.TorusGeometry(R * 0.16, R * 0.035, 6, 16, Math.PI), flat('#2a1a1e')); m.rotation.z = Math.PI; m.userData.noOutline = true; return m; }
// comet({ color, seed }) : icy head (r 0.8) with a face + a glowing tail along +X (local). .update(t, { lid, look, mouth: 'smile'|'frown'|'o' })
export function comet(o = {}) {
  const R = o.r || 0.8, g = new THREE.Group(); const head = new THREE.Group(); g.add(head);
  const core = M(sph, toon(o.color || '#bfe4ff')); core.scale.setScalar(R); head.add(core);
  const eyes = faceEyes(head, R, { lid: '#9ac8ea' }); const mouth = mouthMesh(R); mouth.position.set(0, -R * 0.35, R * 0.92); head.add(mouth);
  const oM = M(sph, flat('#2a1a1e'), 0, -R * 0.35, R * 0.93); oM.scale.set(R * 0.12, R * 0.14, R * 0.03); oM.userData.noOutline = true; head.add(oM);
  outline(head, { px: 3 });
  const tail = new THREE.Group(); g.add(tail);
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(R * (0.95 - i * 0.2), R * (6 - i * 1.2), 18, 1, true), new THREE.MeshBasicMaterial({ color: ['#9fe8ff', '#d8f6ff', '#ffffff'][i], transparent: true, opacity: 0.35 - i * 0.08, depthWrite: false, side: THREE.DoubleSide })); c.rotation.z = Math.PI / 2; c.position.x = R * (3 - i * 0.6) + R * 0.3; c.userData.noOutline = true; tail.add(c); }
  g.head = core; g.headR = R; g.eyes = eyes;
  g.update = (t, u = {}) => { setEyes(eyes, u, t, o.seed || 1); const md = u.mouth || 'smile'; mouth.visible = md !== 'o'; oM.visible = md === 'o'; mouth.rotation.z = md === 'frown' ? 0 : Math.PI; mouth.position.y = md === 'frown' ? -R * 0.5 : -R * 0.35;
    tail.children.forEach((c, i) => { c.scale.set(1, 1 + Math.sin(t * 6 + i) * 0.05, 1); }); head.rotation.z = Math.sin(t * 2 + (o.seed || 0)) * 0.08; };
  return g;
}
// hydrogen cloud with a face: puffs; .update(t, { glow 0..1, lid, look, mouth, shiver })
export function hcloud(o = {}) {
  const g = new THREE.Group(); const mat = toon('#9ab8e8', { fresh: true, emissive: new THREE.Color('#ff7ad0'), emissiveIntensity: 0 });
  const r = rng(o.seed || 4); const puffs = [];
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2; const rr = i ? 1.5 + r() * 0.5 : 0; const p = M(sph, mat, Math.cos(a) * rr * 1.3, Math.sin(a) * rr * 0.55 + (i ? 0 : 0.1), (r() - 0.5) * 0.6 - (i ? 0.3 : 0)); p.scale.setScalar(i ? 1.0 + r() * 0.5 : 1.9); g.add(p); puffs.push(p); }
  const face = new THREE.Group(); face.position.set(0, 0.1, 1.0); g.add(face);
  const eyes = faceEyes(face, 1.5, { lid: '#88a8d8' }); const mouth = mouthMesh(1.5); mouth.position.set(0, -0.5, 1.35); face.add(mouth);
  const oM = M(sph, flat('#2a1a1e'), 0, -0.55, 1.38); oM.scale.set(0.2, 0.26, 0.04); oM.userData.noOutline = true; face.add(oM);
  outline(g, { px: 3 });
  g.head = puffs[0]; g.headR = 1.9; g.eyes = eyes;
  g.update = (t, u = {}) => { setEyes(eyes, u, t, 3); const gl = u.glow || 0; mat.emissiveIntensity = gl * 1.4; mat.color.set(gl > 0 ? new THREE.Color('#9ab8e8').lerp(new THREE.Color('#ffd8f0'), gl) : '#9ab8e8');
    const md = u.mouth || 'frown'; mouth.visible = md !== 'o'; oM.visible = md === 'o'; mouth.rotation.z = md === 'frown' ? 0 : Math.PI; mouth.position.y = md === 'frown' ? -0.7 : -0.5;
    const sh = u.shiver || 0; g.position.x = (g.userData.x0 ?? 0) + Math.sin(t * 50) * 0.04 * sh; puffs.forEach((p, i) => { const b = 1 + Math.sin(t * 2 + i) * 0.03 + gl * 0.12; p.scale.setScalar((i ? 1.0 + ((i * 37) % 5) * 0.1 : 1.9) * b); }); };
  return g;
}
// star with a glow halo; .update(t, flare)
export function star(o = {}) { const g = new THREE.Group(); const c = M(sph, flat(o.color || '#fff2b0')); c.scale.setScalar(o.r || 0.7); c.userData.noOutline = true; g.add(c);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: o.color || '#ffe080', transparent: true, opacity: 0.25, depthWrite: false })); halo.userData.noOutline = true; g.add(halo);
  g.update = (t, f = 0) => { halo.scale.setScalar((o.r || 0.7) * (1.8 + Math.sin(t * 5) * 0.1 + f * 4)); halo.material.opacity = 0.25 + f * 0.4; }; g.update(0); return g; }

// ---------------------------------------------------------------- BIG DISH (generic radio dish in a valley)
export function dishSet(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(400, 400, '#2a5a32', 0, 0));
  const hills = rng(4); for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, d = 20 + hills() * 6; const h = M(sph, toon(i % 2 ? '#2f6a3a' : '#3a7a42'), Math.cos(a) * d, -1, Math.sin(a) * d); h.scale.set(7 + hills() * 3, 4 + hills() * 3, 7); h.receiveShadow = true; g.add(h); }
  const bowl = lathe([[0.1, 0.3], [4, 0.7], [8, 1.6], [12, 2.8], [12.4, 2.9]], '#c9ced6', 48); bowl.material = toon('#c9ced6', { side: THREE.DoubleSide, emissive: new THREE.Color('#4a5a7a'), emissiveIntensity: 0.2 }); bowl.receiveShadow = true; g.add(bowl);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(12.4, 0.25, 8, 64), toon('#8a929c')); rim.rotation.x = Math.PI / 2; rim.position.y = 2.9; g.add(rim);
  const towers = []; for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5; const tw = cyl(0.45, 0.7, 14, '#a8adb4', Math.cos(a) * 14.5, 7, Math.sin(a) * 14.5, 8); g.add(tw); towers.push([Math.cos(a) * 14.5, 14, Math.sin(a) * 14.5]); }
  const plat = new THREE.Group(); plat.add(rbox(5, 0.8, 2, '#8a929c', 0, 0, 0, 0.1), rbox(2.0, 1.4, 1.4, '#e8e0c8', 0, -1.1, 0, 0.1)); plat.position.set(0, 9.5, 0); g.add(plat);
  const cm = new THREE.LineBasicMaterial({ color: '#3a3e44' }); for (const p of towers) { const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p), new THREE.Vector3(0, 9.5, 0)]); g.add(new THREE.Line(geo, cm)); }
  outline(g, { px: 2.0 });
  return { group: g, plat, update() {} };
}

// ---------------------------------------------------------------- 2D OVERLAYS
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: CARD_INK }); x += ws[i] + sp; }); g.restore();
}
// frame-1 top caption: 2 lines, centre-top, 0..until (global time)
export function topCaption(g, gt, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  const k1 = ease.outBack(clamp((gt + 0.25) / 0.3)), k2 = ease.outBack(clamp((gt + 0.08) / 0.3));
  g.save(); g.globalAlpha = fade;
  g.save(); g.translate(540, 290); g.scale(k1, k1); g.translate(-540, -290); richLine(g, [['1977: a', '#ffffff'], ['SIGNAL', GOLD], ['so weird', '#ffffff']], 290, 76); g.restore();
  g.save(); g.translate(540, 395); g.scale(k2, k2); g.translate(-540, -395); richLine(g, [['someone wrote', '#ffffff'], ['"WOW!"', '#ff5a4a']], 395, 84); g.restore();
  g.restore();
}
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const fade = o.until != null ? clamp((o.until - age) / 0.2) : 1; if (fade <= 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.84) + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || GOLD; g.fill(); g.lineWidth = 8; g.strokeStyle = CARD_INK; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || CARD_INK, maxW: E.W * 0.84 }); g.restore(); }
export function stamp(g, str, x, y, age, o = {}) { if (age < 0) return; const fade = o.until != null ? clamp((o.until - age) / 0.2) : 1; if (fade <= 0) return; const k = clamp(age / 0.18); const s = lerp(2.4, 1, ease.out(k)); g.save(); g.globalAlpha = k * fade; g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  const size = o.size || 84; g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.84) + size * 0.7, h = size * 1.35; g.lineWidth = 12; g.strokeStyle = o.color || RED; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); TXT(g, str, 0, 4, size, { color: o.color || RED, maxW: E.W * 0.82 }); g.restore(); }
// printer chatter bursts ("CHK")
export function chatter(g, t, o = {}) { const on = o.on ?? 1; if (on <= 0) return; const r = rng(o.seed || 3); const slots = []; for (let i = 0; i < 10; i++) slots.push([r() * Math.PI * 2, 0.7 + r() * 0.5, (r() - 0.5) * 0.5]);
  const rate = o.rate || 7; const n = Math.floor(t * rate); for (let j = 0; j < 3; j++) { const idx = n - j; if (idx < 0) continue; const age = t - idx / rate; const [a, rr, rot] = slots[idx % 10]; const k = ease.outBack(clamp(age / 0.08)), f = clamp(1 - (age - 0.12) / 0.3); if (f <= 0) continue;
    g.save(); g.globalAlpha = f * on; g.translate((o.x ?? 540) + Math.cos(a) * (o.r ?? 280) * rr, (o.y ?? 1500) + Math.sin(a) * (o.r ?? 280) * rr * 0.5); g.rotate(rot); g.scale(k, k); TXT(g, o.word || 'CHK', 0, 0, o.size || 56, { color: o.color || '#ffffff', stroke: CARD_INK }); g.restore(); } }
// 6EQUJ5 as a bar chart: bars pop in at times ts[i]; the U bar can bust out of the card top (bust 0..1)
const VALS = [6, 14, 26, 30, 19, 5];
export function barCard(g, t, ts, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const W = 900, H = 820, y0 = o.y ?? 860;
  g.save(); g.translate(E.W / 2, y0); g.scale(k, k); g.rotate(-0.015);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 30); g.fill();
  g.fillStyle = '#f6f1e0'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 30); g.fill(); g.stroke();
  TXT(g, o.title || 'SIGNAL STRENGTH', 0, -H / 2 + 64, 52, { color: CARD_INK });
  const base = H / 2 - 110, top = -H / 2 + 130, bw = 110; const bust = o.bust || 0;
  // the noise band
  g.fillStyle = 'rgba(120,120,140,0.35)'; g.fillRect(-W / 2 + 40, base - 40, W - 80, 40);
  if (o.noiseLabel) TXT(g, 'noise', W / 2 - 110, base - 66, 34, { color: '#6a6a7a' });
  VALS.forEach((v, i) => { const tk = ts[i] ?? 99; const kk = ease.outBack(clamp((t - tk) / 0.25)); if (kk <= 0) return; const x = -W / 2 + 95 + i * (bw + 28);
    let h = (v / 30) * (base - top) * kk; if (i === 3 && bust > 0) h += ease.outBack(clamp(bust)) * 330;
    g.fillStyle = i === 3 ? RED : '#4a8ad8'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.roundRect(x, base - h, bw, h, 12); g.fill(); g.stroke();
    g.save(); g.font = '900 64px "Courier New", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = CARD_INK; g.fillText(WOW[i], x + bw / 2, base + 52); g.restore(); });
  if (bust > 0) { // cracks at the top edge where the U bar broke through
    const x = -W / 2 + 95 + 3 * (bw + 28) + bw / 2, a = clamp(bust * 3); g.save(); g.globalAlpha = a; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); for (const d of [-1, 1]) { g.moveTo(x + d * 60, -H / 2); g.lineTo(x + d * 95, -H / 2 + 40); g.lineTo(x + d * 80, -H / 2 + 70); } g.stroke(); g.restore(); }
  g.restore();
}
// cobwebs in the screen corners (k 0..1 grows them)
export function cobwebs(g, k) { if (k <= 0) return; g.save(); g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 3;
  for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [E.W, 0, -1, 1]]) { const R = 320 * ease.out(clamp(k)); for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sx * Math.cos(a) * R, cy + sy * Math.sin(a) * R); g.stroke(); }
    for (let j = 1; j <= 4; j++) { g.beginPath(); for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2, rr = R * j / 4.2; const x = cx + sx * Math.cos(a) * rr, y = cy + sy * Math.sin(a) * rr; i ? g.quadraticCurveTo(cx + sx * Math.cos(a - 0.13) * rr * 0.9, cy + sy * Math.sin(a - 0.13) * rr * 0.9, x, y) : g.moveTo(x, y); } g.stroke(); } }
  g.restore(); }
// flipping decade cards
export function decades(g, t, list, o = {}) { const step = o.step || 0.42; const i = Math.min(list.length - 1, Math.floor(Math.max(0, t) / step)); const age = t - i * step;
  const k = ease.outBack(clamp(age / 0.18)); g.save(); g.translate(o.x ?? 540, o.y ?? 470); g.rotate(-0.04); g.scale(k, k);
  g.fillStyle = '#f4f0e2'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-230, -150, 460, 300, 22); g.fill(); g.stroke();
  g.fillStyle = RED; g.beginPath(); g.roundRect(-230, -150, 460, 80, [22, 22, 0, 0]); g.fill(); g.stroke(); TXT(g, 'STILL LISTENING', 0, -110, 40, { color: '#ffffff' });
  TXT(g, list[i], 0, 40, 120, { color: CARD_INK }); g.restore(); }
// speech bubbles rising from a screen point (the 2012 reply); words are generic
const BUB = ['hi!', 'hello?', 'wow', 'hey', 'lol', ':)', 'hi', 'yo', 'call us', 'wow!', 'hello'];
export function bubbles(g, t, x0, y0, o = {}) { const r = rng(o.seed || 9), n = o.n || 40; for (let i = 0; i < n; i++) { const dl = r() * (o.spread || 2.4), sp = 380 + r() * 300, dx = (r() - 0.5) * (o.w || 300); const tt = t - dl; if (tt < 0) continue;
  const y = y0 - tt * sp, x = x0 + dx * (0.4 + tt) + Math.sin(tt * 3 + i) * 20; if (y < -80) continue; const k = ease.outBack(clamp(tt / 0.2)), s = (0.6 + r() * 0.5) * k; const txt = BUB[i % BUB.length];
  g.save(); g.translate(x, y); g.scale(s, s); g.font = '900 44px Nunito'; const w = g.measureText(txt).width + 50; g.fillStyle = ['#ffffff', '#9fe8ff', '#ffd23a'][i % 3]; g.strokeStyle = CARD_INK; g.lineWidth = 6;
  g.beginPath(); g.roundRect(-w / 2, -36, w, 72, 30); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-10, 34); g.lineTo(-24, 58); g.lineTo(8, 34); g.fill(); g.stroke(); TXT(g, txt, 0, 2, 40, { color: CARD_INK }); g.restore(); } }
// a radial flash/glow at a screen point
export function glowAt(g, x, y, R, col, a) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, alpha(col, a)); gr.addColorStop(1, alpha(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }
// night vignette + slight blue wash
export function nightLook(g, a = 0.18) { g.save(); const gr = g.createRadialGradient(E.W / 2, E.H * 0.45, E.H * 0.25, E.W / 2, E.H * 0.45, E.H * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(4,6,24,${a * 2})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, TXT, CARD_INK, canvasTex, sph, M };
