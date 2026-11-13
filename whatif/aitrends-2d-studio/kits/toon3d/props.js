// kits/toon3d/props.js — furnished-room props + Roman pieces for the Toon 3D style.
// Every builder returns a THREE.Group already outlined (dark hull) and shadow-enabled, feet on y = 0, facing +Z.
//   import * as PR from '/kits/toon3d/props.js';   stage.add(PR.amphora({ color: '#b5653a' }).at(1, 0, -2));
import { THREE, toon, flat, canvasTex, outline, rbox, box, cyl, ball, torus, lathe, plane, blob, INK } from './toon.js';
import { rng } from '/engine/core.js';
import { shadeHex } from './rig.js';

// .at(x,y,z,rotY) / .s(scale) chainable helpers on every prop group
function G(...kids) { const g = new THREE.Group(); kids.flat().forEach(k => k && g.add(k)); g.at = (x = 0, y = 0, z = 0, ry = 0) => { g.position.set(x, y, z); g.rotation.y = ry; return g; }; g.s = (k) => { g.scale.setScalar(k); return g; }; return g; }
const done = (g, px = 2.6) => { outline(g, { px }); return g; };
export { G as propGroup };

// ---------- textures ----------
const _tx = new Map();
const cached = (k, f) => (_tx.has(k) ? _tx.get(k) : (_tx.set(k, f()), _tx.get(k)));
export const TEX = {
  stone: (base = '#d8c8a8', rep = [2, 2]) => { const t = cached(`stone${base}`, () => canvasTex(512, 512, (g, w, h) => { const r = rng(4); g.fillStyle = base; g.fillRect(0, 0, w, h); const rows = 8; for (let j = 0; j < rows; j++) { const off = j % 2 ? 0.5 : 0; for (let i = -1; i < 4; i++) { const x = (i + off) * (w / 4), y = j * (h / rows); g.fillStyle = shadeHex(base, (r() - 0.5) * 0.12); g.fillRect(x + 3, y + 3, w / 4 - 6, h / rows - 6); } } g.strokeStyle = 'rgba(80,60,40,.35)'; g.lineWidth = 4; for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, j * h / rows); g.lineTo(w, j * h / rows); g.stroke(); } }, { repeat: [1, 1] })); const c = t.clone(); c.needsUpdate = true; c.repeat.set(...rep); return c; },
  cobble: (base = '#a89a86', rep = [6, 6]) => { const t = cached(`cob${base}`, () => canvasTex(512, 512, (g, w, h) => { const r = rng(7); g.fillStyle = shadeHex(base, -0.25); g.fillRect(0, 0, w, h); for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const x = (i + (j % 2) * 0.5) * (w / 8.5) + (r() - 0.5) * 8, y = j * (h / 8.5) + (r() - 0.5) * 8; g.fillStyle = shadeHex(base, (r() - 0.5) * 0.2); g.beginPath(); g.roundRect(x - 26, y - 22, 52, 44, 14); g.fill(); } }, { repeat: [1, 1] })); const c = t.clone(); c.needsUpdate = true; c.repeat.set(...rep); return c; },
  mosaic: (a = '#e9dcc0', b = '#8a3a2a', rep = [3, 3]) => { const t = cached(`mos${a}${b}`, () => canvasTex(512, 512, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); const r = rng(2); for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { g.fillStyle = shadeHex(a, (r() - 0.5) * 0.08); g.fillRect(i * 16 + 1, j * 16 + 1, 14, 14); } g.strokeStyle = b; g.lineWidth = 16; g.strokeRect(24, 24, w - 48, h - 48); g.strokeStyle = '#2a2a3a'; g.lineWidth = 8; g.strokeRect(56, 56, w - 112, h - 112); g.fillStyle = b; for (let k = 0; k < 4; k++) { g.save(); g.translate(w / 2, h / 2); g.rotate(k * Math.PI / 2); g.beginPath(); g.moveTo(0, -30); g.lineTo(60, -110); g.lineTo(0, -150); g.lineTo(-60, -110); g.closePath(); g.fill(); g.restore(); } }, { repeat: [1, 1] })); const c = t.clone(); c.needsUpdate = true; c.repeat.set(...rep); return c; },
  plaster: (base = '#e9d9bd', rep = [1, 1]) => { const t = cached(`pl${base}`, () => canvasTex(256, 256, (g, w, h) => { const r = rng(5); g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '90,60,40'},.05)`; g.beginPath(); g.arc(r() * w, r() * h, 10 + r() * 30, 0, 7); g.fill(); } }, { repeat: [1, 1] })); const c = t.clone(); c.needsUpdate = true; c.repeat.set(...rep); return c; },
  // Pompeii-style fresco wall: dado band, big coloured panels with thin borders
  fresco: (panel = '#a8352a', w0 = 3) => cached(`fr${panel}${w0}`, () => canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#e6d2a8'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2a26'; g.fillRect(0, h * 0.8, w, h * 0.2); g.fillStyle = '#5a3a30'; g.fillRect(0, h * 0.78, w, h * 0.03); const n = w0; for (let i = 0; i < n; i++) { const x = (i + 0.08) * (w / n), pw = w / n * 0.84; g.fillStyle = i % 2 ? '#2f4a3a' : panel; g.fillRect(x, h * 0.12, pw, h * 0.6); g.strokeStyle = '#e8c25a'; g.lineWidth = 5; g.strokeRect(x + 14, h * 0.12 + 14, pw - 28, h * 0.6 - 28); g.fillStyle = 'rgba(255,230,180,.55)'; g.beginPath(); g.ellipse(x + pw / 2, h * 0.42, 18, 26, 0, 0, 7); g.fill(); } g.fillStyle = '#2a2a3a'; g.fillRect(0, 0, w, h * 0.08); })),
  planks: (base = '#7a5032', rep = [1, 1], n = 8) => { const t = cached(`pk${base}${n}`, () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(30,15,5,.45)'; g.lineWidth = 4; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo((i * w) / n, 0); g.lineTo((i * w) / n, h); g.stroke(); } const r = rng(3); g.strokeStyle = 'rgba(30,15,5,.15)'; g.lineWidth = 2; for (let i = 0; i < 30; i++) { const x = r() * w; g.beginPath(); g.moveTo(x, r() * h); g.lineTo(x + 2, r() * h); g.stroke(); } }, { repeat: [1, 1] })); const c = t.clone(); c.needsUpdate = true; c.repeat.set(...rep); return c; },
  roof: (base = '#b5543a', rep = [4, 2]) => { const t = cached(`rf${base}`, () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = shadeHex(base, -0.2); g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? base : shadeHex(base, 0.08); g.fillRect(i * 32 + 4, 0, 24, h); } for (let j = 0; j < 4; j++) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, j * 64 + 58, w, 6); } }, { repeat: [1, 1] })); const c = t.clone(); c.needsUpdate = true; c.repeat.set(...rep); return c; },
  label: (txt, bg = '#d8c49a', fg = '#5a3a1a') => cached(`lb${txt}${bg}`, () => canvasTex(256, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = '900 64px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); })),
};
export const texMat = (t, o = {}) => toon('#ffffff', { map: t, ...o });

// ---------- architecture ----------
export function column(h = 5.6, o = {}) {
  const { color = '#ece3d0', r = 0.36 } = o; const m = toon(color);
  const flutes = cached(`flute${color}`, () => canvasTex(256, 16, (g, w, hh) => { g.fillStyle = color; g.fillRect(0, 0, w, hh); g.fillStyle = 'rgba(90,70,50,.18)'; for (let i = 0; i < 16; i++) g.fillRect(i * 16 + 2, 0, 5, hh); }));
  const shaft = lathe([[r * 1.0, 0], [r * 0.98, h * 0.5], [r * 0.86, h]], toon('#ffffff', { map: flutes }), 24); shaft.position.y = 0.32;
  return done(G(rbox(r * 3, 0.18, r * 3, m, 0, 0.09, 0, 0.04), cyl(r * 1.2, r * 1.3, 0.16, m, 0, 0.26, 0), shaft,
    cyl(r * 1.15, r * 0.88, 0.18, m, 0, h + 0.41, 0), rbox(r * 2.7, 0.2, r * 2.7, m, 0, h + 0.6, 0, 0.04)));
}
// pediment temple front (columns + triangle roof) — background landmark
export function templeFront(o = {}) {
  const { w = 7, h = 5, color = '#ece3d0', n = 6 } = o; const g = G();
  g.add(rbox(w + 0.6, 0.5, 2.2, color, 0, 0.25, 0, 0.06), rbox(w + 0.2, 0.3, 2, color, 0, 0.62, 0, 0.05));
  for (let i = 0; i < n; i++) g.add(column(h, { color, r: 0.3 }).at(-w / 2 + 0.4 + (i * (w - 0.8)) / (n - 1), 0.75, 0.4));
  const top = h + 0.75 + 0.7; g.add(rbox(w + 0.4, 0.5, 2.0, color, 0, top + 0.25, 0.3, 0.05));
  const tri = new THREE.Shape(); tri.moveTo(-w / 2 - 0.3, 0); tri.lineTo(w / 2 + 0.3, 0); tri.lineTo(0, 1.5); tri.closePath();
  const pg = new THREE.ExtrudeGeometry(tri, { depth: 1.9, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 }); const ped = new THREE.Mesh(pg, toon(color)); ped.position.set(0, top + 0.5, -0.65); ped.castShadow = ped.receiveShadow = true; g.add(ped);
  return done(g, 2.2);
}
// plain building block with door/windows on the +Z face (a Roman insula / shop front)
export function facade(o = {}) {
  const { w = 4, h = 4.5, d = 3, color = '#e2c9a0', trim = '#b5543a', door = true, shop = false, windows = 2, seed = 1, roof = true } = o; const g = G();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), texMat(TEX.plaster(color, [1, 1]))); wall.position.set(0, h / 2, -d / 2); wall.castShadow = wall.receiveShadow = true; g.add(wall);
  g.add(box(w + 0.05, 0.5, d + 0.05, shadeHex(color, -0.2), 0, 0.25, -d / 2));
  if (door) { g.add(rbox(1.2, 2.3, 0.12, '#5a3a22', shop ? -w / 4 : 0, 1.15, 0.02, 0.03)); g.add(rbox(1.45, 0.18, 0.2, trim, shop ? -w / 4 : 0, 2.4, 0.05, 0.03)); }
  if (shop) { const sx = w / 4; g.add(box(1.6, 2.2, 0.05, '#2a1a14', sx, 1.3, 0.01)); g.add(rbox(1.9, 0.9, 0.5, shadeHex(color, -0.12), sx, 0.45, 0.25, 0.04)); }
  for (let i = 0; i < windows; i++) { const x = -w / 2 + ((i + 0.5) * w) / windows; g.add(box(0.7, 0.8, 0.06, '#3a2a24', x, h - 1.2, 0.01), rbox(0.9, 0.12, 0.18, trim, x, h - 1.65, 0.06, 0.03)); }
  if (roof) { const rt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.18, d * 0.6), texMat(TEX.roof(trim, [4, 1]))); rt.position.set(0, h + 0.25, 0.1 - d * 0.25); rt.rotation.x = 0.35; rt.castShadow = true; g.add(rt); g.add(box(w + 0.3, 0.2, 0.3, shadeHex(color, -0.1), 0, h, 0.1)); }
  return done(g, 2.2);
}
// arched gateway in a wall: returns group with .doors = [left, right] pivots (rotation.y opens toward +Z)
export function gate(o = {}) {
  const { w = 3.4, h = 4.6, wallW = 16, wallH = 7, depth = 1.6, stone = '#cbb898' } = o; const g = G();
  const st = texMat(TEX.stone(stone, [3, 2]));
  const sh = new THREE.Shape(); sh.moveTo(-wallW / 2, 0); sh.lineTo(wallW / 2, 0); sh.lineTo(wallW / 2, wallH); sh.lineTo(-wallW / 2, wallH); sh.closePath();
  const hole = new THREE.Path(); hole.moveTo(-w / 2, 0); hole.lineTo(-w / 2, h - w / 2); hole.absarc(0, h - w / 2, w / 2, Math.PI, 0, true); hole.lineTo(w / 2, 0); hole.closePath(); sh.holes.push(hole);
  const wg = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 20 }); const uv = wg.attributes.uv; const pos = wg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 5, pos.getY(i) / 3.5);
  const wall = new THREE.Mesh(wg, st); wall.position.z = -depth; wall.castShadow = wall.receiveShadow = true; g.add(wall);
  // crenellations
  for (let x = -wallW / 2 + 0.4; x < wallW / 2; x += 1.1) g.add(rbox(0.6, 0.7, depth * 0.5, stone, x, wallH + 0.35, -depth * 0.25, 0.05));
  // arch voussoir ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(w / 2 + 0.15, 0.2, 8, 24, Math.PI), toon(shadeHex(stone, -0.12))); ring.position.set(0, h - w / 2, 0.06); g.add(ring);
  // doors (planks + iron studs), hinged at the jambs
  const doorT = TEX.planks('#6a4228', [1, 1], 6), studs = toon('#3a3434');
  const doors = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * w / 2, 0, -depth * 0.35); const leaf = new THREE.Group(); const lw = w / 2 - 0.03;
    const p = new THREE.Mesh(new THREE.BoxGeometry(lw, h - 0.02, 0.18), texMat(doorT)); p.position.set(-s * lw / 2, (h - 0.02) / 2, 0); p.castShadow = p.receiveShadow = true; leaf.add(p);
    for (const y of [0.7, h * 0.5, h - 1.6]) leaf.add(box(lw, 0.16, 0.06, '#3a2a20', -s * lw / 2, y, 0.11));
    for (const y of [0.7, h * 0.5, h - 1.6]) for (let k = 0; k < 4; k++) leaf.add(ball(0.045, studs, -s * (0.2 + k * (lw - 0.4) / 3), y, 0.15, 8));
    leaf.add(torus(0.13, 0.025, '#3a3434', -s * (lw - 0.25), h * 0.42, 0.13));
    piv.add(leaf); g.add(piv); return piv; });
  // the top of the arch above the doors is open: fill with dark so the doors read as a closed gate
  g.doors = doors; g.wallH = wallH; g.gateW = w; g.gateH = h;
  return done(g, 2.4);
}
export function tower(o = {}) {
  const { r = 2, h = 9, stone = '#c6b294' } = o; const g = G();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 28), texMat(TEX.stone(stone, [4, 3]))); t.position.y = h / 2; t.castShadow = t.receiveShadow = true; g.add(t);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.add(rbox(0.6, 0.7, 0.5, stone, Math.sin(a) * (r - 0.2), h + 0.35, Math.cos(a) * (r - 0.2), 0.05)); g.children[g.children.length - 1].rotation.y = a; }
  for (const y of [h * 0.45, h * 0.75]) g.add(box(0.25, 0.9, 0.1, '#2a1e1a', 0, y, r + 0.01));
  return done(g, 2.2);
}

// ---------- furniture ----------
export const table = (o = {}) => { const { w = 1.8, d = 0.9, h = 1.0, color = '#7a5032' } = o; const g = G(rbox(w, 0.12, d, color, 0, h, 0, 0.04)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.05, 0.04, h, shadeHex(color, -0.15), sx * (w / 2 - 0.12), h / 2, sz * (d / 2 - 0.12), 10)); g.add(blob(Math.max(w, d) * 0.6, 0.25)); return done(g); };
export const stool = (o = {}) => { const { color = '#7a5032', h = 0.6 } = o; const g = G(cyl(0.3, 0.3, 0.1, color, 0, h, 0)); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; g.add(cyl(0.035, 0.035, h, shadeHex(color, -0.15), Math.sin(a) * 0.2, h / 2, Math.cos(a) * 0.2, 8)); } return done(g); };
// lectus (Roman couch): frame, mattress, cushions
export const couch = (o = {}) => { const { color = '#6a4228', cloth = '#b8433a', cush = '#e0b84a' } = o; const g = G(rbox(2.4, 0.35, 1.0, color, 0, 0.45, 0, 0.06), rbox(2.3, 0.22, 0.9, cloth, 0, 0.72, 0, 0.1), rbox(0.3, 0.7, 1.0, color, -1.1, 0.8, 0, 0.1), rbox(0.6, 0.3, 0.5, cush, -0.75, 0.95, 0, 0.14)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.06, 0.05, 0.3, color, sx * 1.05, 0.15, sz * 0.4, 8)); g.add(blob(1.4, 0.25)); return done(g); };
export const throne = (o = {}) => { const { color = '#d4a73a', cloth = '#5a2a6a' } = o; const g = G(rbox(1.2, 0.3, 1.0, color, 0, 0.75, 0, 0.06), rbox(1.05, 0.15, 0.9, cloth, 0, 0.95, 0.02, 0.07), rbox(1.2, 1.8, 0.22, color, 0, 1.6, -0.45, 0.08), rbox(0.95, 1.3, 0.08, cloth, 0, 1.65, -0.32, 0.05), ball(0.14, color, -0.5, 2.6, -0.45), ball(0.14, color, 0.5, 2.6, -0.45)); for (const sx of [-1, 1]) g.add(rbox(0.18, 0.75, 1.0, color, sx * 0.6, 0.38, 0, 0.05), rbox(0.16, 0.12, 0.9, color, sx * 0.6, 1.3, 0, 0.05), cyl(0.05, 0.05, 0.35, color, sx * 0.6, 1.1, 0.35)); g.add(blob(1.0, 0.25)); return done(g); };
export const shelf = (o = {}) => { const { w = 1.8, h = 2.2, color = '#6a4228', seed = 2 } = o; const r = rng(seed); const g = G(rbox(w, h, 0.5, shadeHex(color, -0.15), 0, h / 2, -0.25, 0.04)); for (let j = 0; j < 3; j++) { const y = 0.4 + j * 0.65; g.add(box(w - 0.1, 0.06, 0.48, color, 0, y, -0.22)); for (let i = 0; i < 5; i++) { if (r() < 0.25) continue; const sc = cyl(0.08, 0.08, 0.45, '#e8dcc0', -w / 2 + 0.25 + i * 0.32, y + 0.12, -0.15); sc.rotation.x = Math.PI / 2; sc.rotation.z = (r() - 0.5) * 0.3; g.add(sc); } } return done(g); };
export const rug = (o = {}) => { const { w = 3, d = 2, color = '#a8352a', trim = '#e0b84a' } = o; const t = cached(`rug${color}`, () => canvasTex(256, 256, (g, W, H) => { g.fillStyle = color; g.fillRect(0, 0, W, H); g.strokeStyle = trim; g.lineWidth = 14; g.strokeRect(16, 16, W - 32, H - 32); g.fillStyle = trim; g.beginPath(); g.arc(W / 2, H / 2, 40, 0, 7); g.fill(); })); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), texMat(t)); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; m.receiveShadow = true; m.userData.noOutline = true; return G(m); };
export const curtain = (o = {}) => { const { w = 1.4, h = 3.4, color = '#5a2a6a' } = o; const g = G(); for (let i = 0; i < 5; i++) g.add(cyl(w / 10, w / 9, h, color, -w / 2 + (i + 0.5) * w / 5, h / 2, 0, 10)); g.add(cyl(0.05, 0.05, w + 0.4, '#d4a73a', 0, h + 0.05, 0.05).rotateZ(Math.PI / 2)); return done(g); };

// ---------- small props ----------
export const amphora = (o = {}) => { const { color = '#b5653a', h = 1.1 } = o; const k = h / 1.1; const body = lathe([[0.001, 0], [0.06, 0.02], [0.2, 0.25], [0.3, 0.55], [0.26, 0.8], [0.1, 0.92], [0.08, 1.05], [0.11, 1.1]].map(([r, y]) => [r * k, y * k]), color, 20); const g = G(body); for (const s of [-1, 1]) { const hd = torus(0.11 * k, 0.025 * k, color, s * 0.12 * k, 0.95 * k, 0); hd.rotation.y = Math.PI / 2; hd.scale.y = 1.3; g.add(hd); } g.add(blob(0.35 * k, 0.3)); return done(g); };
export const vase = (o = {}) => { const { color = '#3a5a7a' } = o; return done(G(lathe([[0.001, 0], [0.15, 0.02], [0.24, 0.3], [0.12, 0.6], [0.16, 0.75]], color, 18))); };
export const bowlFruit = () => { const g = G(lathe([[0.001, 0], [0.12, 0.01], [0.28, 0.12], [0.3, 0.16]], '#c9a14a', 20)); const c = ['#c0392b', '#e8a03a', '#7aa03a', '#6a2a5a', '#c0392b']; [[0, 0.2, 0], [-0.12, 0.18, 0.06], [0.12, 0.18, -0.04], [0.04, 0.27, -0.06], [-0.06, 0.18, -0.12]].forEach(([x, y, z], i) => g.add(ball(0.09, c[i], x, y, z, 14))); return done(g, 2); };
export const lamp = () => done(G(lathe([[0.001, 0], [0.1, 0.02], [0.14, 0.06], [0.06, 0.1]], '#b5653a', 16), cyl(0.02, 0.03, 0.08, '#8a4a2a', 0.15, 0.08, 0).rotateZ(-0.8)), 2);
export const lampStand = () => { const g = G(cyl(0.03, 0.04, 1.6, '#c9a14a', 0, 0.8, 0, 8), cyl(0.25, 0.3, 0.06, '#c9a14a', 0, 0.03, 0), cyl(0.2, 0.15, 0.06, '#c9a14a', 0, 1.62, 0)); const l = lamp(); l.position.y = 1.65; g.add(l); g.flameAt = new THREE.Vector3(0.18, 1.86, 0); return done(g); };
export const scroll = (o = {}) => { const g = G(cyl(0.06, 0.06, 0.5, '#efe3c4', 0, 0.06, 0).rotateZ(Math.PI / 2)); g.add(cyl(0.03, 0.03, 0.6, '#6a4228', 0, 0.06, 0).rotateZ(Math.PI / 2)); return done(g, 2); };
export const papers = (o = {}) => { const { n = 5, seed = 3, spread = 1.5 } = o; const r = rng(seed); const g = G(); for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.008, 0.42), toon('#f2ead6')); p.position.set((r() - 0.5) * spread, 0.008 + i * 0.001, (r() - 0.5) * spread); p.rotation.y = r() * Math.PI; p.receiveShadow = true; g.add(p); } return done(g, 1.6); };
export const sack = (o = {}) => { const { color = '#c9b083', label = null } = o; const g = G(); const b = ball(0.38, color, 0, 0.36, 0, 18); b.scale.set(1, 1.05, 0.85); g.add(b, cyl(0.1, 0.16, 0.18, color, 0, 0.78, 0, 10), torus(0.1, 0.03, '#7a5a32', 0, 0.72, 0)); g.children[g.children.length - 1].rotation.x = Math.PI / 2; if (label) { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.23), toon('#ffffff', { map: TEX.label(label, color, '#5a3a1a') })); t.position.set(0, 0.36, 0.33); t.userData.noOutline = true; g.add(t); } g.add(blob(0.4, 0.3)); return done(g); };
export const crate = (o = {}) => { const { s = 0.8, color = '#9a6a3a' } = o; const g = G(new THREE.Mesh(new THREE.BoxGeometry(s, s, s), texMat(TEX.planks(color, [1, 1], 4)))); g.children[0].position.y = s / 2; g.children[0].castShadow = g.children[0].receiveShadow = true; g.add(box(s * 1.02, 0.08, s * 1.02, shadeHex(color, -0.25), 0, s - 0.06, 0), box(s * 1.02, 0.08, s * 1.02, shadeHex(color, -0.25), 0, 0.06, 0)); return done(g); };
export const barrel = (o = {}) => { const { color = '#8a5a32' } = o; const g = G(lathe([[0.001, 0], [0.32, 0.001], [0.38, 0.45], [0.32, 0.9], [0.001, 0.9]], color, 18)); for (const y of [0.15, 0.75]) g.add(torus(0.35, 0.025, '#3a3434', 0, y, 0).rotateX(Math.PI / 2)); return done(g); };
export const spear = (o = {}) => { const { len = 3.0 } = o; return done(G(cyl(0.028, 0.028, len, '#6a4228', 0, 0, 0, 8), new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 8), toon('#b9b3a8')).translateY(len / 2 + 0.17)), 2.4); };
// scutum: curved rectangular shield, red with a gold boss and wings
export function shield(o = {}) {
  const { color = '#a3352b', w = 0.9, h = 1.25 } = o;
  const t = cached(`sc${color}`, () => canvasTex(256, 360, (g, W, H) => { g.fillStyle = color; g.fillRect(0, 0, W, H); g.strokeStyle = '#e0b84a'; g.lineWidth = 12; g.strokeRect(12, 12, W - 24, H - 24); g.fillStyle = '#e0b84a'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 + s * 90, H / 2 - 110); g.lineTo(W / 2 + s * 60, H / 2 - 30); g.closePath(); g.fill(); g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 + s * 90, H / 2 + 110); g.lineTo(W / 2 + s * 60, H / 2 + 30); g.closePath(); g.fill(); } }));
  const geo = new THREE.CylinderGeometry(1.1, 1.1, h, 16, 1, true, -w / 2.2, w / 1.1); geo.translate(0, 0, -1.1);
  const m = new THREE.Mesh(geo, toon('#ffffff', { map: t, side: THREE.DoubleSide })); m.castShadow = true;
  const boss = ball(0.13, '#d4a73a', 0, 0, 0.04); boss.scale.z = 0.6;
  return done(G(m, boss), 2.4);
}
// torch on a wall bracket; returns group with .flameAt (local position for fx.fire)
export const torch = () => { const g = G(box(0.1, 0.4, 0.1, '#3a3434', 0, 0, -0.05), cyl(0.04, 0.03, 0.7, '#5a3a22', 0, 0.2, 0.12).rotateX(0.35), cyl(0.08, 0.06, 0.16, '#3a2a20', 0, 0.55, 0.24)); g.flameAt = new THREE.Vector3(0, 0.75, 0.26); return done(g); };
export const banner = (o = {}) => { const { color = '#a3352b', txt = 'SPQR', w = 1.1, h = 1.8 } = o; const t = cached(`bn${color}${txt}`, () => canvasTex(256, 420, (g, W, H) => { g.fillStyle = color; g.fillRect(0, 0, W, H); g.strokeStyle = '#e0b84a'; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, H - 70); g.fillStyle = '#e0b84a'; g.font = '900 60px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText(txt, W / 2, H * 0.45); g.beginPath(); g.moveTo(0, H - 56); g.lineTo(W / 2, H); g.lineTo(W, H - 56); g.fill(); })); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: t, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 })); p.position.y = -h / 2; p.userData.noOutline = true; const g = G(p, cyl(0.035, 0.035, w + 0.3, '#d4a73a', 0, 0.02, 0.02).rotateZ(Math.PI / 2)); return done(g, 2); };
export const plant = (o = {}) => { const { color = '#5f8a3a', pot = '#b5653a' } = o; const g = G(lathe([[0.001, 0], [0.2, 0.01], [0.28, 0.45], [0.3, 0.5]], pot, 16)); const r = rng(3); for (let i = 0; i < 7; i++) { const b = ball(0.18 + r() * 0.08, color, (r() - 0.5) * 0.4, 0.6 + r() * 0.4, (r() - 0.5) * 0.4, 12); g.add(b); } return done(g); };
export const cart = (o = {}) => { const { color = '#8a5a32' } = o; const g = G(rbox(1.6, 0.5, 1.0, color, 0, 0.8, 0, 0.05)); for (const s of [-1, 1]) { const wh = torus(0.38, 0.06, '#5a3a22', 0.2, 0.42, s * 0.58); g.add(wh, cyl(0.08, 0.08, 0.06, '#3a2a20', 0.2, 0.42, s * 0.58).rotateX(Math.PI / 2)); } g.add(cyl(0.03, 0.03, 1.4, color, -1.3, 0.75, 0).rotateZ(Math.PI / 2 - 0.15)); g.add(blob(1.0, 0.25)); return done(g); };
// market stall: counter + striped awning + goods
export function stall(o = {}) {
  const { color = '#9a6a3a', awning = ['#c0392b', '#f2ead6'], seed = 4 } = o; const r = rng(seed); const g = G(rbox(2.4, 1.0, 0.9, color, 0, 0.5, 0, 0.05));
  for (const sx of [-1, 1]) g.add(cyl(0.05, 0.05, 2.6, shadeHex(color, -0.2), sx * 1.15, 1.3, -0.4, 8), cyl(0.05, 0.05, 2.2, shadeHex(color, -0.2), sx * 1.15, 1.1, 0.4, 8));
  const t = cached(`aw${awning}`, () => canvasTex(256, 64, (x, W, H) => { for (let i = 0; i < 8; i++) { x.fillStyle = awning[i % 2]; x.fillRect((i * W) / 8, 0, W / 8, H); } }));
  const aw = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.05, 1.3), texMat(t)); aw.position.set(0, 2.45, 0.05); aw.rotation.x = 0.28; aw.castShadow = true; g.add(aw);
  for (let i = 0; i < 6; i++) g.add(ball(0.12, ['#c0392b', '#e8a03a', '#7aa03a'][i % 3], -0.9 + i * 0.36, 1.1, 0.15 + (r() - 0.5) * 0.2, 12));
  g.add(amphora({ color: '#b5653a', h: 0.8 }).at(1.6, 0, 0.4), amphora({ color: '#9a5030', h: 0.7 }).at(1.95, 0, 0.1));
  return done(g, 2.4);
}
// an original toon chicken (white egg body, red comb, big eyes). .update(t) pecks + bobs. .pose({look, flap})
export function chicken(o = {}) {
  const { color = '#f6f1e6', comb = '#d63a2e', beak = '#f2b632' } = o; const g = G();
  const bodyG = new THREE.Group(); bodyG.position.y = 0.42; g.add(bodyG);
  const b = ball(0.34, color, 0, 0, 0, 24); b.scale.set(0.85, 0.9, 1.05); bodyG.add(b);
  const tail = ball(0.16, color, 0, 0.18, -0.32, 14); tail.scale.set(0.6, 1.2, 0.8); tail.rotation.x = -0.5; bodyG.add(tail);
  const wings = [-1, 1].map(s => { const w = ball(0.18, shadeHex(color, -0.06), s * 0.28, 0.02, -0.02, 14); w.scale.set(0.35, 0.8, 1.1); bodyG.add(w); return w; });
  const head = new THREE.Group(); head.position.set(0, 0.36, 0.2); bodyG.add(head);
  head.add(ball(0.2, color, 0, 0, 0, 20));
  for (let i = 0; i < 3; i++) head.add(ball(0.065, comb, 0, 0.2 + (i === 1 ? 0.03 : 0), -0.06 + i * 0.07, 10));
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), toon(beak)); bk.rotation.x = Math.PI / 2; bk.position.set(0, -0.02, 0.24); bk.castShadow = true; head.add(bk);
  const wat = ball(0.045, comb, 0, -0.12, 0.17, 10); wat.scale.y = 1.5; head.add(wat);
  const eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.1, 0.06, 0.14); const w = ball(0.075, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 }), 0, 0, 0, 14); w.scale.z = 0.6; const p = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), flat('#1a1214')); p.position.z = 0.04; p.userData.noOutline = true; e.add(w, p); head.add(e); return { e, p }; });
  for (const s of [-1, 1]) { g.add(cyl(0.022, 0.022, 0.3, beak, s * 0.1, 0.15, 0, 6)); const f = ball(0.05, beak, s * 0.1, 0.02, 0.05, 8); f.scale.set(1, 0.4, 1.6); g.add(f); }
  g.add(blob(0.35, 0.3)); done(g, 2.4);
  g.update = (t, o2 = {}) => { const { peck = 0, flap = 0, look = 0, panic = 0 } = o2; const pk = peck * Math.max(0, Math.sin(t * 6)) ** 3;
    head.rotation.x = pk * 0.9; head.position.z = 0.2 + pk * 0.12; head.position.y = 0.36 - pk * 0.15; head.rotation.y = look; bodyG.position.y = 0.42 + Math.abs(Math.sin(t * 9)) * 0.06 * panic;
    wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (flap * (0.6 + 0.5 * Math.sin(t * 30))); });
    eyes.forEach(({ p }) => { p.scale.setScalar(1 - panic * 0.35); }); };
  return g;
}
// marble bust of an ancestor/emperor on a plinth (a bean head in marble)
export const bust = (o = {}) => { const { color = '#ece6dc' } = o; const g = G(rbox(0.7, 1.4, 0.7, shadeHex(color, -0.05), 0, 0.7, 0, 0.05), ball(0.3, color, 0, 1.55, 0, 16), ball(0.38, color, 0, 2.05, 0, 20)); g.children[1].scale.set(1.2, 0.6, 0.9); return done(g); };

// ---------- 1930s / outback pack (emu-war Short) ----------
// 1930s army truck: cab, bonnet with grille, round fenders, flatbed. .wheels (spin them), .bedTop (local y of the bed floor)
export function truck(o = {}) {
  const { color = '#5a6a3a' } = o; const dark = shadeHex(color, -0.3); const g = G();
  g.add(rbox(1.7, 0.25, 4.4, dark, 0, 0.75, 0, 0.04));                                          // chassis
  g.add(rbox(1.6, 1.1, 1.3, color, 0, 1.45, 0.75, 0.1), rbox(1.3, 0.75, 1.3, color, 0, 1.25, 1.95, 0.12));   // cab + bonnet
  g.add(box(1.1, 0.55, 0.06, '#2a2a26', 0, 1.25, 2.61), box(1.3, 0.5, 0.06, '#9fc8e0', 0, 1.65, 1.41));      // grille, windscreen
  for (const sx of [-0.45, 0.45]) g.add(ball(0.11, '#f2e6b0', sx, 1.35, 2.62, 12));                 // headlamps
  for (const sx of [-1, 1]) g.add(rbox(0.06, 0.45, 0.8, '#2a2a26', sx * 0.81, 1.6, 0.75, 0.02));      // side windows
  g.add(rbox(1.9, 0.12, 2.3, shadeHex(color, -0.1), 0, 1.0, -1.15, 0.03));                          // bed floor
  for (const sx of [-1, 1]) g.add(rbox(0.08, 0.45, 2.3, color, sx * 0.91, 1.28, -1.15, 0.03)); g.add(rbox(1.9, 0.45, 0.08, color, 0, 1.28, -2.28, 0.03));
  const wheels = []; for (const z of [1.75, -1.4]) for (const sx of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(sx * 0.85, 0.45, z); const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.13, 10, 24), toon('#262422')); tyre.rotation.y = Math.PI / 2; tyre.castShadow = true; wg.add(tyre); const hub = cyl(0.2, 0.2, 0.12, '#8a8a80', 0, 0, 0, 14); hub.rotation.z = Math.PI / 2; wg.add(hub); for (let k = 0; k < 4; k++) { const sp = box(0.06, 0.36, 0.05, '#5a5a52', 0, 0, 0); sp.rotation.x = (k * Math.PI) / 4; wg.add(sp); } g.add(wg); wheels.push(wg);
    const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.32, 16, 1, true, -Math.PI / 2, Math.PI), toon(dark, { side: THREE.DoubleSide })); fender.rotation.z = Math.PI / 2; fender.position.set(sx * 0.85, 0.5, z); g.add(fender); }
  g.add(blob(2.6, 0.3)); done(g, 2.6); g.wheels = wheels; g.bedTop = 1.06;
  g.drive = (dist) => { wheels.forEach(w => (w.rotation.x = dist / 0.45)); };
  return g;
}
// Lewis gun on a tripod (prop only; nothing is ever hit). Barrel points +Z.
export function lewisGun() {
  const g = G(); const m = '#3a3a36'; const top = new THREE.Group(); top.position.y = 0.95; g.add(top);
  const shroud = cyl(0.09, 0.09, 1.0, '#4a4a44', 0, 0, 0.35, 14); shroud.rotation.x = Math.PI / 2; top.add(shroud);
  const muzzle = cyl(0.035, 0.035, 0.25, m, 0, 0, 0.95, 8); muzzle.rotation.x = Math.PI / 2; top.add(muzzle);
  top.add(rbox(0.12, 0.16, 0.5, m, 0, -0.02, -0.3, 0.03), rbox(0.08, 0.18, 0.4, '#6a4a2a', 0, -0.08, -0.7, 0.03));
  const drum = cyl(0.26, 0.26, 0.07, m, 0, 0.13, -0.15, 22); top.add(drum); g.drum = drum;
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = cyl(0.025, 0.025, 1.05, m, Math.sin(a) * 0.3, 0.47, Math.cos(a) * 0.3 - 0.05, 6); leg.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); g.add(leg); }
  g.top = top; return done(g, 2.2);
}
export const ammoBox = (o = {}) => { const g = G(rbox(0.6, 0.35, 0.35, '#5a6a3a', 0, 0.175, 0, 0.03), box(0.62, 0.05, 0.37, '#3a4428', 0, 0.3, 0)); if (o.open) { const lid = rbox(0.6, 0.04, 0.35, '#5a6a3a', 0, 0.4, -0.2, 0.02); lid.rotation.x = -1.2; g.add(lid); } return done(g, 2.2); };
// chalk scoreboard on two legs. lines: ['EMUS 1', 'ARMY 0']
export function scoreboard(o = {}) {
  const { lines = ['EMUS  1', 'ARMY  0'], w = 2.0, h = 1.3, title = 'FINAL SCORE' } = o;
  const t = canvasTex(512, 340, (x, W, H) => { x.fillStyle = '#26332c'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2ead6'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 44px Fredoka, sans-serif'; x.fillText(title, W / 2, 52); x.fillRect(60, 86, W - 120, 4); x.font = '700 92px Fredoka, sans-serif'; lines.forEach((l, i) => { x.fillStyle = i === 0 ? '#ffd25a' : '#f2ead6'; x.fillText(l, W / 2, 150 + i * 105); }); });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: t })); board.position.set(0, 1.55, 0.06); board.userData.noOutline = true;
  const g = G(rbox(w + 0.2, h + 0.2, 0.1, '#7a5032', 0, 1.55, 0, 0.04), board); for (const sx of [-1, 1]) g.add(cyl(0.05, 0.05, 1.3, '#6a4228', sx * (w / 2 - 0.1), 0.65, -0.05, 8)); g.add(blob(1.2, 0.25)); return done(g, 2.4);
}
// outback windmill water pump: lattice tower + tail vane + fan (.fan spins on z)
export function windmill(o = {}) {
  const { h = 7 } = o; const g = G(); const m = '#8a8a86';
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) { const leg = cyl(0.05, 0.05, h, m, x * 0.55, h / 2, z * 0.55, 6); leg.rotation.set(-z * 0.11, 0, x * 0.11); g.add(leg); }
  for (let y = 1.5; y < h; y += 1.6) g.add(box(1.2 * (1 - y / h * 0.6), 0.05, 0.05, m, 0, y, 0.45 * (1 - y / h * 0.6)), box(1.2 * (1 - y / h * 0.6), 0.05, 0.05, m, 0, y, -0.45 * (1 - y / h * 0.6)));
  const head = new THREE.Group(); head.position.y = h; g.add(head); head.add(rbox(0.3, 0.3, 0.6, '#6a6a66', 0, 0, 0, 0.04)); head.add(box(0.05, 0.8, 1.4, '#c9c4bc', 0, 0.2, -1.2));
  const fan = new THREE.Group(); fan.position.z = 0.4; head.add(fan); for (let i = 0; i < 12; i++) { const b = box(0.22, 1.2, 0.02, i % 2 ? '#d8d2c8' : '#b8b2a8', 0, 0.75, 0); const piv = new THREE.Group(); piv.rotation.z = (i / 12) * Math.PI * 2; piv.add(b); b.rotation.y = 0.3; fan.add(piv); } fan.add(ball(0.12, '#6a6a66'));
  g.fan = fan; return done(g, 2.0);
}
// eucalyptus / gum tree: pale trunk, branching, clumps of grey-green leaves
export function gumTree(o = {}) {
  const { s = 1, seed = 3 } = o; const r = rng(seed); const g = G(); const bark = '#d8cfc0', leaf = ['#7f9a6a', '#6a8a5a', '#8faa78'];
  const trunk = cyl(0.14 * s, 0.22 * s, 3.2 * s, bark, 0, 1.6 * s, 0, 10); trunk.rotation.z = (r() - 0.5) * 0.15; g.add(trunk);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + r(); const br = cyl(0.06 * s, 0.1 * s, 1.6 * s, bark, Math.cos(a) * 0.45 * s, 3.4 * s, Math.sin(a) * 0.45 * s, 8); br.rotation.set(Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55); g.add(br); }
  for (let i = 0; i < 7; i++) { const a = r() * Math.PI * 2, d = 0.4 + r() * 0.9; g.add(ball((0.55 + r() * 0.35) * s, leaf[i % 3], Math.cos(a) * d * s, (3.7 + r() * 1.0) * s, Math.sin(a) * d * s, 12)); }
  g.add(blob(1.4 * s, 0.22)); return done(g, 2.2);
}
// post-and-wire farm fence along X (length len)
export function fence(o = {}) { const { len = 12, gap = 2.0 } = o; const g = G(); for (let x = -len / 2; x <= len / 2 + 0.01; x += gap) g.add(cyl(0.07, 0.08, 1.3, '#7a6448', x, 0.65, 0, 7)); for (const y of [0.55, 0.95, 1.2]) { const wire = cyl(0.012, 0.012, len, '#5a5a56', 0, y, 0, 4); wire.rotation.z = Math.PI / 2; g.add(wire); } return done(g, 1.8); }
// field desk with papers and an inkwell (the commander's report)
export const fieldDesk = () => { const g = G(rbox(1.5, 0.08, 0.8, '#7a5a3a', 0, 0.95, 0, 0.02)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.03, 0.03, 0.95, '#5a4028', sx * 0.65, 0.475, sz * 0.32, 6)); const paper = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.01, 0.56), toon('#f2ead6')); paper.position.set(0.1, 1.0, 0.05); paper.rotation.y = 0.15; g.add(paper); g.add(cyl(0.05, 0.06, 0.08, '#2a2a3a', -0.45, 1.03, -0.15, 10)); g.paper = paper; return done(g, 2.2); };
