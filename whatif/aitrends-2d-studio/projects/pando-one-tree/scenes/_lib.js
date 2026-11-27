// Pando: the forest that is ONE tree — shared assets: quaking aspens (white bark with dark "eyes", golden autumn canopy),
// an instanced hillside forest, an x-ray ground cutaway showing the one shared root system, a cartoon mule deer + elk,
// a tall wildlife fence, a globe, plus 2D overlay helpers (top caption, stamps, chips, newspaper). Underscore = not auto-loaded.
// Tone: gentle nature fact. Trees "die" by quietly tipping over and fading; deer are cute, never hurt.
import { E, wordTime, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { shadeHex } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// ---------------------------------------------------------------- ASPENS
const barkTex = () => canvasTex(128, 512, (g, W, H) => { g.fillStyle = '#f1eee4'; g.fillRect(0, 0, W, H); const r = rng(9);
  for (let i = 0; i < 26; i++) { const y = r() * H, x = r() * W, w = 10 + r() * 26; g.fillStyle = '#2e2a26'; g.beginPath(); g.ellipse(x, y, w, 4 + r() * 4, 0, 0, 6.283); g.fill(); }
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(60,55,50,0.25)'; g.fillRect(r() * W, r() * H, 6 + r() * 10, 2); } });
let _bark = null; const bark = () => (_bark ||= new THREE.MeshToonMaterial({ map: barkTex(), color: '#ffffff' }));
export const GOLDS = ['#f2c230', '#f5d24a', '#e8a92a', '#f0b83a', '#c9d64a'];
// one aspen: slim white trunk + 3-4 round golden leaf clumps
export function aspen(o = {}) {
  const g = new THREE.Group(); const h = o.h || 6, r = rng(o.seed || 1), s = o.s || 1;
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.2 * s, h, 12), bark()); tr.position.y = h / 2; tr.castShadow = true; g.add(tr);
  const can = new THREE.Group(); can.position.y = h; g.add(can);
  const n = 3 + (r() > 0.5 ? 1 : 0); for (let i = 0; i < n; i++) { const c = o.color || GOLDS[(o.seed + i) % GOLDS.length]; const b = ball((0.9 + r() * 0.5) * s, c, (r() - 0.5) * 1.1 * s, (i ? r() * 1.2 : 0.4) * s, (r() - 0.5) * 0.9 * s, 14); b.scale.y = 1.15; can.add(b); }
  outline(g, { px: 2.4 }); g.trunk = tr; g.canopy = can; g.h = h;
  g.quake = (t, k = 1) => { can.rotation.z = Math.sin(t * 7 + (o.seed || 0)) * 0.03 * k; can.rotation.x = Math.sin(t * 5.3 + (o.seed || 0) * 2) * 0.025 * k; };
  return g;
}
// a young shoot (sucker): tiny stem + 2 leaves
export function sprout(o = {}) { const g = new THREE.Group(); g.add(cyl(0.025, 0.035, 0.5, '#8fae5a', 0, 0.25, 0, 6)); for (const s of [-1, 1]) { const l = ball(0.11, o.color || '#7fc24a', s * 0.1, 0.45, 0, 8); l.scale.set(1, 0.5, 0.7); l.rotation.z = s * 0.5; g.add(l); } outline(g, { px: 2 }); return g; }
// instanced hillside forest (cheap): trunks + 2 canopy balls each; returns { group, n, pos[] }
export function forest(st, o = {}) {
  const r = rng(o.seed || 4), n = o.n || 500, W = o.w || 60, D = o.d || 60, cx = o.x || 0, cz = o.z || -20, hole = o.hole;
  const tg = new THREE.CylinderGeometry(0.13, 0.2, 1, 8); tg.translate(0, 0.5, 0);
  const trunks = new THREE.InstancedMesh(tg, bark(), n); const cg = new THREE.SphereGeometry(1, 12, 9);
  const cans = new THREE.InstancedMesh(cg, toon('#ffffff'), n * 2); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color(); const pos = [];
  let k = 0; for (let i = 0; i < n; i++) { let x, z; do { x = cx + (r() - 0.5) * W; z = cz + (r() - 0.5) * D; } while (hole && Math.hypot(x - hole[0], z - hole[1]) < hole[2]);
    const y = o.slope ? Math.max(0, -(z - cz) * o.slope) : 0; const h = 4.5 + r() * 3; pos.push([x, y, z, h]);
    m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, h, 1)); trunks.setMatrixAt(i, m4);
    for (let j = 0; j < 2; j++) { const s = 1.0 + r() * 0.6; m4.compose(new THREE.Vector3(x + (r() - 0.5) * 0.8, y + h + j * 0.9, z + (r() - 0.5) * 0.8), q, new THREE.Vector3(s, s * 1.15, s)); cans.setMatrixAt(k, m4); cans.setColorAt(k, col.set(o.colors ? o.colors[(i + j) % o.colors.length] : GOLDS[(i + j) % GOLDS.length])); k++; } }
  trunks.castShadow = true; cans.castShadow = true; const g = new THREE.Group(); g.add(trunks, cans); st.add(g); return { group: g, pos, trunks, cans };
}
// sunny Fishlake meadow stage: grass, sky dome, distant blue hills
export function meadow(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 12, target: o.target || [0, 0, -2] });
  const g = new THREE.Group(); st.add(g); g.add(floor(400, 400, o.grass || '#8fb85a', 0, -100));
  const r = rng(o.seed || 3);
  for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(i % 2 ? '#6f8fb0' : '#7f9fc0')); h.scale.set(40 + r() * 30, 10 + r() * 10, 20); h.position.set(-120 + i * 50, 0, -150 - r() * 30); h.userData.noOutline = true; g.add(h); }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3 });
  return { stage: st, ground: g, sky, update(t) { sky.update(t); } };
}
export const hero = (o = {}) => castMember('hero', { hood: 'down', ...o });
export const scientist = (o = {}) => castMember('lin', o);

// ---------------------------------------------------------------- ANIMALS (cartoon mule deer / elk; big ears = mule deer)
export function deer(o = {}) {
  const root = new THREE.Group(); const c = o.color || '#a8784a', belly = '#e8d4b0', dark = '#4a3020'; const s = o.s || 1;
  const body = ball(0.55, c, 0, 1.25, 0, 18); body.scale.set(0.8, 0.75, 1.45); root.add(body);
  const bl = ball(0.42, belly, 0, 1.12, 0.05, 14); bl.scale.set(0.7, 0.55, 1.2); root.add(bl);
  const legs = []; for (const [x, z] of [[-0.22, 0.5], [0.22, 0.5], [-0.22, -0.5], [0.22, -0.5]]) { const lg = new THREE.Group(); lg.position.set(x, 1.05, z); const l = cyl(0.06, 0.05, 1.0, c, 0, -0.5, 0, 8); lg.add(l); lg.add(ball(0.07, dark, 0, -1.0, 0.02, 8)); root.add(lg); legs.push(lg); }
  const neck = new THREE.Group(); neck.position.set(0, 1.5, 0.65); root.add(neck); const nk = cyl(0.14, 0.2, 0.75, c, 0, 0.3, 0.08, 10); nk.rotation.x = 0.35; neck.add(nk);
  const head = new THREE.Group(); head.position.set(0, 0.72, 0.22); neck.add(head);
  const hd = ball(0.27, c, 0, 0, 0, 16); hd.scale.set(0.9, 0.95, 1.15); head.add(hd);
  const sn = ball(0.15, shadeHex(c, 0.15), 0, -0.08, 0.28, 12); sn.scale.set(1, 0.8, 1.1); head.add(sn); head.add(ball(0.06, '#20161a', 0, -0.02, 0.43, 8));
  for (const sx of [-1, 1]) { const ear = ball(0.13, c, sx * 0.3, 0.2, -0.05, 10); ear.scale.set(o.elk ? 0.7 : 1.4, 0.55, 0.35); ear.rotation.z = sx * 0.5; head.add(ear);
    const eye = ball(0.07, '#ffffff', sx * 0.15, 0.08, 0.2, 10); head.add(eye); const pu = ball(0.04, '#20161a', sx * 0.16, 0.08, 0.26, 8); pu.userData.noOutline = true; head.add(pu);
    if (o.antlers) { const a = new THREE.Group(); a.position.set(sx * 0.12, 0.25, 0); for (let k = 0; k < 3; k++) { const b = cyl(0.025, 0.035, 0.45 - k * 0.08, '#d8c8a0', sx * k * 0.08, 0.2 + k * 0.12, -k * 0.05, 6); b.rotation.z = -sx * (0.3 + k * 0.25); a.add(b); } head.add(a); } }
  const tail = ball(0.1, o.elk ? '#e8d4b0' : '#f4f0e8', 0, 1.4, -0.78, 8); root.add(tail);
  if (o.elk) { body.scale.multiplyScalar(1.15); }
  outline(root, { px: 2.8 }); root.scale.setScalar(s); root.legs = legs; root.neck = neck; root.head = head; root.headR = 0.3;
  // update(t, { walk, graze 0..1, jump 0..1 (tucks legs), look })
  root.update = (t, u = {}) => { const w = u.walk || 0; legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 8 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.5 * w + (u.jump ? (i < 2 ? -1.0 : 0.9) * u.jump : 0); });
    neck.rotation.x = (u.graze || 0) * 1.3 + Math.sin(t * 2) * 0.03; head.rotation.y = (u.look || 0); head.rotation.x = (u.chew ? Math.sin(t * 14) * 0.06 : 0); };
  return root;
}
// tall wildlife fence along X from x0 to x1 at z
export function fence(o = {}) {
  const g = new THREE.Group(); const x0 = o.x0 ?? -8, x1 = o.x1 ?? 8, h = o.h || 3.2, z = o.z || 0;
  for (let x = x0; x <= x1 + 0.01; x += 2) g.add(cyl(0.08, 0.1, h, '#7a5a3a', x, h / 2, z, 8));
  const tex = canvasTex(256, 256, (c, W, H) => { c.clearRect(0, 0, W, H); c.strokeStyle = '#d8dde4'; c.lineWidth = 3; for (let i = 0; i <= W; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, H); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(W, i); c.stroke(); } });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set((x1 - x0) / 1.2, h / 1.2);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, h * 0.95), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  mesh.position.set((x0 + x1) / 2, h * 0.5, z); mesh.userData.noOutline = true; g.add(mesh);
  for (const y of [0.1, h * 0.97]) { const wire = cyl(0.025, 0.025, x1 - x0, '#9aa0aa', (x0 + x1) / 2, y, z, 6); wire.rotation.z = Math.PI / 2; g.add(wire); }
  outline(g, { px: 2.2 }); return g;
}
// x-ray ground cutaway: a soil slab seen from the front with glowing roots linking the trunks' bases
export function rootSlab(xs, o = {}) {
  const g = new THREE.Group(); const w = o.w || 14, d = o.d || 3;
  const slab = box(w, 2.6, 0.2, '#6a4a32', 0, -1.3, 0.05); slab.material = flat('#5a3e2a'); g.add(slab);
  const glowM = new THREE.MeshBasicMaterial({ color: o.color || '#ffb84a' });
  const pts = xs.map(x => new THREE.Vector3(x, -0.15, 0.2)); const r = rng(5);
  const main = []; const xsS = [...xs].sort((a, b) => a - b); for (let i = 0; i <= 24; i++) { const x = lerp(xsS[0] - 1, xsS[xsS.length - 1] + 1, i / 24); main.push(new THREE.Vector3(x, -1.1 + Math.sin(i * 0.9) * 0.25, 0.22)); }
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(main), 120, 0.09, 8), glowM); tube.userData.noOutline = true; g.add(tube);
  const ups = []; xs.forEach((x, i) => { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(x, -0.02, 0.22), new THREE.Vector3(x + (r() - 0.5) * 0.6, -0.55, 0.22), new THREE.Vector3(x + (r() - 0.5) * 0.4, -1.05 + Math.sin(i) * 0.2, 0.22)]); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.06, 6), glowM); m.userData.noOutline = true; g.add(m); ups.push(m); });
  for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * w * 0.9, y = -0.6 - r() * 1.6; const c = new THREE.CatmullRomCurve3([new THREE.Vector3(x, y, 0.22), new THREE.Vector3(x + (r() - 0.5) * 1.5, y - 0.3, 0.22), new THREE.Vector3(x + (r() - 0.5) * 2.5, y - 0.2 + r() * 0.3, 0.22)]); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 16, 0.035, 5), glowM); m.userData.noOutline = true; g.add(m); }
  for (let i = 0; i < 40; i++) { const p = ball(0.06 + r() * 0.08, '#8a6a4a', (r() - 0.5) * w, -0.2 - r() * 2.3, 0.18, 6); p.userData.noOutline = true; g.add(p); }
  g.glowM = glowM; return g;
}
export function globe(o = {}) {
  const g = new THREE.Group(); const R = o.r || 2; const tex = canvasTex(512, 256, (c, W, H) => { c.fillStyle = '#3a8ad8'; c.fillRect(0, 0, W, H); c.fillStyle = '#6ab04a';
    const blobs = [[95, 70, 60, 38], [120, 150, 28, 52], [250, 70, 50, 30], [265, 140, 30, 48], [370, 80, 80, 40], [420, 175, 30, 18], [60, 230, 200, 18]]; blobs.forEach(([x, y, a, b]) => { c.beginPath(); c.ellipse(x, y, a, b, 0.2, 0, 6.283); c.fill(); }); });
  const m = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), new THREE.MeshToonMaterial({ map: tex })); g.add(m); outline(g, { px: 3 }); g.ball = m; return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
export function richLine(g, parts, y, size, o = {}) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = (o.x ?? E.W / 2) - tot / 2; parts.forEach(([s, c], i) => { insT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: CARD_INK }); x += ws[i] + sp; }); g.restore();
}
export function topCaption(g, t, l1, l2, o = {}) {
  const u = (o.until ?? 99) - t; if (u <= 0) return; const a = clamp(u / 0.25);
  const k = o.still ? 1 : ease.outBack(clamp((t + 0.25) / 0.3)), k2 = o.still ? 1 : ease.outBack(clamp((t + 0.08) / 0.3));
  g.save(); g.globalAlpha = a;
  g.save(); g.translate(540, 300); g.scale(k, k); g.translate(-540, -300); richLine(g, l1, 300, o.size || 80); g.restore();
  g.save(); g.translate(540, 415); g.scale(k2, k2); g.translate(-540, -415); richLine(g, l2, 415, o.size || 80); g.restore();
  g.restore();
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Nunito", sans-serif`; const w = Math.min(E.W * 0.94, g.measureText(text).width + s * 1.0);
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.9 });
  g.restore();
}
export function chip(g, t, title, sub, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const W = o.w || 700, H = sub ? 150 + (o.subSize || 44) * 1.2 : 130; g.save(); g.globalAlpha = fade; g.translate(o.x ?? E.W / 2, o.y ?? 520); g.rotate(o.rot ?? -0.03); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 10, -H / 2 + 14, W, H, 28); g.fill();
  g.fillStyle = o.fill || '#fff6e0'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 28); g.fill(); g.stroke();
  insT(g, title, 0, sub ? -36 : 4, o.size || 70, { color: o.color || '#b8322a', stroke: null, maxW: W - 60 });
  if (sub) insT(g, sub, 0, 40 + (o.subSize || 44) * 0.4, o.subSize || 44, { color: o.subColor || '#4a3a3a', stroke: null, maxW: W - 60 });
  g.restore();
}
export function arrow(g, x0, y0, x1, y1, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= 0) return; const w = o.w || 34, col = o.color || '#ff5a4a';
  const xe = lerp(x0, x1, k), ye = lerp(y0, y1, k), a = Math.atan2(ye - y0, xe - x0), L = Math.hypot(xe - x0, ye - y0); if (L < 4) return;
  g.save(); g.translate(x0, y0); g.rotate(a); g.lineJoin = 'round';
  const hl = Math.min(L * 0.5, w * 2.2); g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L - hl, -w / 2); g.lineTo(L - hl, -w * 1.25); g.lineTo(L, 0); g.lineTo(L - hl, w * 1.25); g.lineTo(L - hl, w / 2); g.lineTo(0, w / 2); g.closePath();
  g.fillStyle = col; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.stroke(); g.fill(); g.restore();
}
// newspaper page with a headline (made-up paper, no real masthead)
export function newspaper(g, t, head, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; g.save(); g.translate(o.x ?? 540, o.y ?? 760); g.rotate((o.rot ?? -0.08) + (1 - k) * 0.8); g.scale(k, k);
  const W = o.w || 640, H = o.h || 520; g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-W / 2 + 12, -H / 2 + 16, W, H); g.fillStyle = '#f4efe2'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.fillRect(-W / 2, -H / 2, W, H); g.strokeRect(-W / 2, -H / 2, W, H);
  insT(g, o.mast || 'THE DAILY NEWS', 0, -H / 2 + 50, 40, { color: '#3a3030', stroke: null }); g.fillStyle = '#3a3030'; g.fillRect(-W / 2 + 30, -H / 2 + 82, W - 60, 5);
  insT(g, head, 0, -H / 2 + 165, o.size || 76, { color: '#1a1414', stroke: null, maxW: W - 60 });
  g.fillStyle = '#b8b0a0'; for (let i = 0; i < 6; i++) g.fillRect(-W / 2 + 30, -H / 2 + 250 + i * 38, (i % 3 === 2 ? 0.6 : 1) * (W - 60), 14);
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, rng, clamp, lerp, ease, prog, insT, CARD_INK, glow, canvasTex, shadeHex, sunnySky };
