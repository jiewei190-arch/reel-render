// The Great Sheep Panic of 1888 — shared assets: a toon Oxford-Down-style sheep (white wool, dark face + legs, lidded eyes,
// optional night eyeshine), an English field at night (hedges, rail fences that can break, farmhouse, moon, stars),
// a Victorian farmer, plus 2D overlay helpers (two-colour hook caption, stamps, county map, newspaper, journal card).
// Underscore = not auto-loaded. TONE GUARD: the cause is UNCONFIRMED. No creature, no ghost, no UFO, nothing in the dark
// but the dark itself. Lightning only in the "explanation" shots. Sheep are scared but never hurt.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

// time of a spoken word inside the current shot (seconds from shot start), fallback fb
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } const r = g - info.shot.start; return r > info.dur + 0.5 ? fb : r; };
const sph = new THREE.SphereGeometry(1, 16, 12);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- SHEEP
const MAT = {};
const mat = (c, o) => (MAT[c + (o ? 'e' : '')] ||= toon(c, o));
function lidEye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.1, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, mat('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.35 })); w.userData.outlinePx = 1.8; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#120c10')); p.scale.set(0.42, 0.34, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(lidC)); lid.userData.noOutline = true; lp.add(lid);
  return { eg, pg, lp, roll, w };
}
// sheep({ seed, scale, face, wool, shine }) — faces +Z, ~1.5 units long, back ~1.1 high.
// .update(t, { run 0..1, speed, lid, look:[x,y], headTurn, headUp (raise -1..1), pant 0..1, tremble 0..1, shine 0..1, squash, ph })
export function sheep(o = {}) {
  const { seed = 1, scale = 1 } = o; const r = rng(seed);
  const W = o.wool || ['#f2ece0', '#ebe3d4', '#f6f1e8'][seed % 3], F = o.face || ['#3a2c28', '#2e2422', '#46342c'][seed % 3];
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale * (0.92 + r() * 0.16)); root.add(g);
  const bodyG = new THREE.Group(); bodyG.position.y = 0.78; g.add(bodyG);
  const wm = mat(W), wm2 = mat(shadeHex(W, -0.06)), fm = mat(F), lidC = shadeHex(F, 0.1);
  const core = mesh(sph, wm, 0.48, 0.4, 0.66); bodyG.add(core);
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2; const b = mesh(sph, i % 2 ? wm : wm2, 0.24, 0.22, 0.24);
    b.position.set(Math.cos(a) * 0.36, 0.16 + Math.sin(a * 2 + seed) * 0.05 + (Math.abs(Math.sin(a)) < 0.4 ? 0.06 : 0), Math.sin(a) * 0.52); bodyG.add(b); }
  for (let i = 0; i < 4; i++) { const b = mesh(sph, wm, 0.26, 0.2, 0.26); b.position.set((i % 2 ? 0.14 : -0.14), 0.32, -0.25 + Math.floor(i / 2) * 0.42); bodyG.add(b); }
  const tail = mesh(sph, wm2, 0.12, 0.12, 0.1); tail.position.set(0, 0.12, -0.68); bodyG.add(tail);
  // neck + head (dark face, wool cap)
  const neck = new THREE.Group(); neck.position.set(0, 0.18, 0.5); bodyG.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.14, 0.2); neck.add(head);
  const hs = mesh(sph, fm, 0.17, 0.19, 0.25); hs.position.z = 0.05; hs.rotation.x = 0.35; head.add(hs);
  const muz = mesh(sph, fm, 0.12, 0.11, 0.12); muz.position.set(0, -0.1, 0.22); head.add(muz);
  const cap = mesh(sph, wm, 0.19, 0.12, 0.16); cap.position.set(0, 0.17, -0.04); head.add(cap);
  for (const s of [-1, 1]) { const n = mesh(sph, flat('#120c0c'), 0.022, 0.014, 0.01); n.position.set(s * 0.04, -0.07, 0.335); n.userData.noOutline = true; head.add(n); }
  const mouth = new THREE.Mesh(sph, flat('#1a0c0e')); mouth.scale.set(0.05, 0.004, 0.02); mouth.position.set(0, -0.16, 0.3); mouth.userData.noOutline = true; head.add(mouth);
  const tongue = new THREE.Mesh(sph, flat('#d86a7a')); tongue.scale.set(0.032, 0.012, 0.04); tongue.position.set(0, -0.19, 0.31); tongue.userData.noOutline = true; tongue.visible = false; head.add(tongue);
  const ears = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.15, 0.08, -0.02); head.add(p); const e = mesh(sph, fm, 0.13, 0.04, 0.06); e.position.x = s * 0.1; p.add(e); return { p, s }; });
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.11, 0.04, 0.17), new THREE.Vector3(s * 0.62, 0.12, 0.77).normalize(), 0.075, lidC));
  const shines = [-1, 1].map(s => { const gs = glow(0.42, '#d8ff7a', 0); gs.position.set(s * 0.12, 0.05, 0.25); head.add(gs); return gs; });
  // legs (hip pivot)
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => { const hip = new THREE.Group(); hip.position.set(sx * 0.22, 0.62, sz * 0.36); g.add(hip);
    const l = mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.6, 7).translate(0, -0.3, 0), fm); hip.add(l);
    const hoof = mesh(sph, mat('#1a1414'), 0.055, 0.04, 0.065); hoof.position.y = -0.6; hip.add(hoof); return { hip, sx, sz, i }; });
  const bl = blob(0.75, 0.3); root.add(bl);
  outline(g, { px: 2.4 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.4; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { run = 0, speed = 3.2, lid = 0.35, look = [0, 0], headTurn = 0, headUp = 0, pant = 0, tremble = 0, shine = 0, blink = true, ph = seed * 0.37, squash = 0, lidAngle = 0 } = u;
    const rr = clamp(run), w = (t * speed + ph) * Math.PI * 2;
    legs.forEach(L => { const off = (L.sz > 0 ? 0 : Math.PI) + (L.sx > 0 ? 0.35 : 0); L.hip.rotation.x = rr * Math.sin(w + off) * 0.85 + (1 - rr) * noise(t * 0.5, seed + L.i) * 0.03; });
    const tr = tremble * Math.sin(t * 61 + seed) * 0.018;
    bodyG.position.y = 0.78 + rr * Math.abs(Math.sin(w)) * 0.16 + Math.sin(t * 9 * (1 + pant)) * 0.012 * pant - squash * 0.12;
    bodyG.position.x = tr; bodyG.rotation.x = rr * (Math.sin(w) * 0.1 - 0.08) + pant * Math.sin(t * 14) * 0.015;
    bodyG.scale.set(1 + squash * 0.08 + pant * 0.03 * Math.sin(t * 14), 1 - squash * 0.1, 1);
    neck.rotation.x = -headUp * 0.5 + rr * 0.25 + Math.sin(w * 2) * 0.05 * rr; neck.rotation.y = headTurn; head.rotation.z = tr * 6;
    ears.forEach(e => { e.p.rotation.z = e.s * (rr * 0.4 + (pant ? 0.25 : 0) + Math.sin(t * 2 + seed) * 0.05); e.p.rotation.y = -e.s * rr * 0.3; });
    const op = clamp(pant * (0.5 + 0.5 * Math.sin(t * 14))); mouth.scale.set(0.05, 0.004 + op * 0.035, 0.02); tongue.visible = pant > 0.2; tongue.position.y = -0.19 - op * 0.02;
    const b = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    shines.forEach(s => { s.material.opacity = shine * (1 - Math.max(lid, b) * 0.9) * 0.9; });
    bl.visible = true;
  };
  root.head = head; root.eyes = eyes; root.headR = 0.24 * scale;
  root.update(0); return root;
}

// a flock laid out on a jittered grid, centred at (cx, cz); returns [{ s, x, z, ph }]
export function flock(st, o = {}) {
  const { n = 20, cx = 0, cz = 0, w = 8, d = 6, seed = 1, scale = 1, rot = 0 } = o; const r = rng(seed); const out = [];
  const cols = Math.ceil(Math.sqrt(n * w / d)), rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) { const c = i % cols, rw = Math.floor(i / cols);
    const x = cx - w / 2 + (c + 0.5) * w / cols + (r() - 0.5) * w / cols * 0.7, z = cz - d / 2 + (rw + 0.5) * d / rows + (r() - 0.5) * d / rows * 0.6;
    const s = sheep({ seed: seed * 31 + i, scale }); s.position.set(x, 0, z); s.rotation.y = rot + (r() - 0.5) * 0.5; st.add(s); out.push({ s, x, z, ph: r(), k: r() }); }
  return out;
}

// ---------------------------------------------------------------- PEOPLE
export function farmer(o = {}) { return bean({ name: 'Farmer', outfit: 'uniform', skin: o.skin || 'fair', hair: 'swoop', hairColor: '#6a4a30',
  beard: o.beard ?? true, beardColor: '#7a5a3a', colors: { main: o.coat || '#6a5a3e', legsTop: '#4a4036' }, seed: o.seed || 5 }); }

// ---------------------------------------------------------------- SETS
// wooden rail fence; .segs = [{ g, x }] so a segment can be knocked over
export function railFence(o = {}) {
  const { len = 14, gap = 2.0, color = '#6a5440' } = o; const g = new THREE.Group(); const segs = [];
  for (let x = -len / 2; x < len / 2 - 0.01; x += gap) { const sg = new THREE.Group(); sg.position.x = x; g.add(sg);
    sg.add(cyl(0.08, 0.09, 1.25, color, 0, 0.62, 0, 7));
    for (const y of [0.55, 1.0]) { const rl = rbox(gap, 0.1, 0.06, shadeHex(color, 0.08), gap / 2, y, 0.06, 0.02); sg.add(rl); }
    segs.push({ g: sg, x }); }
  const end = cyl(0.08, 0.09, 1.25, color, len / 2, 0.62, 0, 7); g.add(end);
  outline(g, { px: 2.2 }); g.segs = segs; return g;
}
// hedge: a row of dark leafy balls
export function hedge(o = {}) {
  const { len = 14, h = 1.6, seed = 2, color = '#2e4a32' } = o; const r = rng(seed); const g = new THREE.Group();
  for (let x = -len / 2; x <= len / 2; x += 0.7) for (let k = 0; k < 2; k++) { const b = ball(0.55 + r() * 0.3, k ? color : shadeHex(color, 0.08), x + (r() - 0.5) * 0.4, 0.45 + k * (h - 0.9) + r() * 0.2, (r() - 0.5) * 0.5, 10); b.scale.y = 0.85; g.add(b); }
  outline(g, { px: 1.8 }); return g;
}
export function oak(o = {}) { const { s = 1, seed = 4 } = o; const r = rng(seed); const g = new THREE.Group();
  g.add(cyl(0.22 * s, 0.32 * s, 3 * s, '#3a2c26', 0, 1.5 * s, 0, 9));
  for (let i = 0; i < 7; i++) { const a = r() * Math.PI * 2, d = r() * 1.1; g.add(ball((1.0 + r() * 0.5) * s, i % 2 ? '#24382a' : '#2c4430', Math.cos(a) * d * s, (3.4 + r() * 1.2) * s, Math.sin(a) * d * s, 12)); }
  outline(g, { px: 2 }); return g; }
export function farmhouse(o = {}) { const g = new THREE.Group();
  g.add(rbox(4, 2.6, 3, '#8a7a68', 0, 1.3, 0, 0.05));
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 2.6, 1.8, 4, 1).rotateY(Math.PI / 4), toon('#3a3036')); roof.scale.set(1.1, 1, 0.82); roof.position.y = 3.5; roof.castShadow = true; g.add(roof);
  g.add(rbox(0.5, 1.0, 0.5, '#6a5a4a', 1.2, 4.0, 0, 0.03));
  const win = [[-0.9, 1.5], [0.9, 1.5]].map(([x, y]) => { const w = rbox(0.6, 0.7, 0.05, '#ffcf6a', x, y, 1.52, 0.02); w.material = toon('#ffcf6a', { emissive: new THREE.Color('#ffb84a'), emissiveIntensity: 0.9 }); w.userData.noOutline = true; g.add(w); return w; });
  const gw = glow(2.2, '#ffb050', 0.35); gw.position.set(0, 1.5, 1.7); g.add(gw);
  outline(g, { px: 2 }); g.win = win; return g; }

// night sky: stars (points) + a moon disc with glow, placed far behind
export function nightSky(st, o = {}) {
  const r = rng(o.seed || 9); const pos = []; for (let i = 0; i < 260; i++) { const a = -1.3 + r() * 2.6, e = 0.05 + r() * 0.9; pos.push(Math.sin(a) * 120, 8 + e * 90, -Math.cos(a) * 120); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#dfe6ff', size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false })); stars.userData.noOutline = true; st.add(stars);
  let moon = null; if (o.moon !== false) { moon = new THREE.Group(); const d = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: '#f4efd8', fog: false })); d.userData.noOutline = true; moon.add(d);
    const gl = glow(22, '#9fb4ff', 0.35); gl.material.fog = false; moon.add(gl); moon.position.set(...(o.moonAt || [-30, 48, -110])); st.add(moon); }
  return { stars, moon };
}
// an English field at night. o: { seed, hedgeZ, fenceZ, house: [x,z], trees: [[x,z,s]], dawn }
export function nightField(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(260, 260, o.grass || '#2d4636', 0, -60));
  const r = rng(o.seed || 3);
  for (let i = 0; i < 26; i++) { const p = floor(2 + r() * 5, 1 + r() * 3, r() < 0.5 ? '#29402f' : '#33503b', -30 + r() * 60, -r() * 50); p.position.y = 0.005; p.rotation.z = r(); g.add(p); }
  // rolling hills on the horizon
  for (const [x, z, rad, c] of [[-50, -95, 40, '#1f3326'], [30, -110, 55, '#1b2e22'], [90, -90, 35, '#22382a']]) { const h = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(c)); h.scale.y = 0.22; h.position.set(x, 0, z); g.add(h); }
  let fence = null, hd = null, house = null;
  if (o.hedgeZ != null) { hd = hedge({ len: o.hedgeLen || 40, seed: 5 }); hd.position.set(o.hedgeX || 0, 0, o.hedgeZ); g.add(hd); }
  if (o.fenceZ != null) { fence = railFence({ len: o.fenceLen || 16 }); fence.position.set(o.fenceX || 0, 0, o.fenceZ); fence.rotation.y = o.fenceRot || 0; g.add(fence); }
  if (o.house) { house = farmhouse(); house.position.set(o.house[0], 0, o.house[1]); house.rotation.y = o.house[2] || 0.3; g.add(house); }
  for (const [x, z, s] of (o.trees || [[-14, -22, 1.2], [16, -28, 1.4]])) { const t = oak({ s, seed: Math.round(x * 3 + z) }); t.position.set(x, 0, z); g.add(t); }
  const sky = nightSky(st, { seed: o.seed || 9, moon: o.moon, moonAt: o.moonAt });
  return { group: g, fence, hedge: hd, house, sky, update(t) { if (sky.stars) sky.stars.material.opacity = 0.75 + 0.1 * Math.sin(t * 3); } };
}
// stage preset for the night shots: moonlit blue, readable
export function nightStage(T, o = {}) {
  return toonStage(T, { light: 'night', fov: o.fov || 40, shadowSize: o.shadowSize || 12, target: o.target || [0, 0.5, 0], exposure: o.exposure || 1.35,
    ambient: o.ambient || 1.15, key: ['#b8c6ff', o.keyI || 1.5, [-8, 14, 6]], fill: ['#7a8ad0', 0.35, [8, 4, 8]],
    bg: o.bg || ['#060a1c', '#101a3e', '#26305e'], fog: o.fog === false ? undefined : (o.fog || [18, 120, '#141c3c']) });
}

// ---------------------------------------------------------------- 2D OVERLAYS
// two-colour hook caption: rows = [[[text, colour], ...], ...]; drawn centre-top below the Shorts bar
export function hookRows(g, t, rows, o = {}) {
  const y0 = o.y ?? 300, size = o.size || 92, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  rows.forEach((row, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.15) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * size * 1.12); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.012);
    g.font = `900 ${size}px "Nunito"`; const ws = row.map(([s]) => g.measureText(s).width); const tot = ws.reduce((a, b) => a + b, 0); let x = -tot / 2;
    row.forEach(([s, c], j) => { insT(g, s, x + ws[j] / 2, 0, size, { color: c, stroke: CARD_INK }); x += ws[j]; }); g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Nunito"`; const w = Math.min(E.W * 0.94, g.measureText(text).width * 1.0 + s * 0.9);
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: w - s * 0.5 });
  g.restore();
}
// calendar page (tear-off), pops in: month / big day / year
export function calendar(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const W = 480, H = 540;
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? 760); g.rotate(o.rot ?? 0.05); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 18, W, H, 26); g.fill();
  g.fillStyle = '#fbf6ea'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.fillStyle = '#c0392b'; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, 140, [26, 26, 0, 0]); g.fill(); g.stroke();
  insT(g, o.month || 'NOVEMBER', 0, -H / 2 + 72, 64, { color: '#ffffff', maxW: W - 60 });
  insT(g, o.day || '3', 0, 40, 250, { color: CARD_INK });
  insT(g, o.year || '1888', 0, H / 2 - 70, 64, { color: '#7a5a3a' });
  g.restore();
}
// clock face showing a time (h, m), hands sweep in
export function clockFace(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const R = o.r || 190;
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? 760); g.scale(k, k);
  g.fillStyle = '#fbf6ea'; g.strokeStyle = CARD_INK; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineWidth = i % 3 ? 5 : 10; g.beginPath(); g.moveTo(Math.sin(a) * R * 0.78, -Math.cos(a) * R * 0.78); g.lineTo(Math.sin(a) * R * 0.9, -Math.cos(a) * R * 0.9); g.stroke(); }
  const sw = ease.out(clamp((t - (o.at || 0)) / 0.7)); const hA = ((o.h ?? 8) % 12 + (o.m ?? 0) / 60) / 12 * Math.PI * 2 * sw + (1 - sw) * -2, mA = (o.m ?? 0) / 60 * Math.PI * 2 + (1 - sw) * -6;
  g.lineCap = 'round'; g.lineWidth = 16; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(hA) * R * 0.5, -Math.cos(hA) * R * 0.5); g.stroke();
  g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(mA) * R * 0.75, -Math.cos(mA) * R * 0.75); g.stroke();
  g.fillStyle = '#c0392b'; g.beginPath(); g.arc(0, 0, 18, 0, 7); g.fill();
  if (o.label) insT(g, o.label, 0, R + 80, 72, { color: '#ffffff', stroke: CARD_INK });
  g.restore();
}
// stylised county map (not to scale): England outline, Oxfordshire highlighted, a ring of "about 200 sq mi" spreading out
export function countyMap(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, o.y ?? 860); g.scale(k, k);
  const W = 880, H = 1020; g.fillStyle = '#1b2a4a'; g.strokeStyle = '#e8e2cc'; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 28); g.fill(); g.stroke();
  insT(g, o.title || 'SOUTHERN ENGLAND', 0, -H / 2 + 75, 54, { color: '#ffffff' });
  // a soft blob for "England" (stylised)
  g.fillStyle = '#4f7a4a'; g.strokeStyle = '#e8e2cc'; g.lineWidth = 6; g.beginPath();
  const pts = [[-120, -380], [40, -360], [120, -250], [160, -120], [260, -40], [330, 120], [250, 260], [60, 300], [-140, 330], [-330, 380], [-260, 250], [-170, 150], [-210, 40], [-150, -60], [-200, -200], [-140, -300]];
  pts.forEach(([x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; if (!i) g.moveTo((x + pts[pts.length - 1][0]) / 2, (y + pts[pts.length - 1][1]) / 2); g.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2); }); g.closePath(); g.fill(); g.stroke();
  // Oxfordshire marker + spreading ring
  const cx = o.cx ?? 20, cy = o.cy ?? 120, p = clamp((t - (o.ring ?? 0.4)) / 0.9);
  g.fillStyle = '#f2c230'; g.beginPath(); g.ellipse(cx, cy, 70, 95, 0.3, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = CARD_INK; g.stroke();
  if (p > 0) { for (let i = 0; i < 3; i++) { const q = clamp(p * 1.4 - i * 0.2); if (q <= 0) continue; g.save(); g.globalAlpha = 0.85 * (1 - q * 0.6); g.strokeStyle = '#ff4a3a'; g.lineWidth = 10 - i * 2; g.setLineDash([22, 14]); g.beginPath(); g.arc(cx, cy, 40 + q * 150, 0, 7); g.stroke(); g.restore(); } }
  insT(g, o.label || 'OXFORDSHIRE', cx, cy - 165, 50, { color: '#f2c230', stroke: CARD_INK });
  insT(g, o.foot || '~200 SQUARE MILES', 0, H / 2 - 80, 66, { color: '#ff6a4a', stroke: CARD_INK, a: clamp((t - (o.footAt ?? 0.6)) / 0.25) });
  g.restore();
}
// newspaper card with a highlighted quote
export function newspaper(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; const W = 860, H = 1080;
  g.save(); g.translate(E.W / 2, o.y ?? 900); g.rotate((o.rot ?? -0.03) + (1 - k) * 0.3); g.scale(k * (o.zoom || 1), k * (o.zoom || 1));
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-W / 2 + 18, -H / 2 + 22, W, H);
  g.fillStyle = '#efe6cf'; g.fillRect(-W / 2, -H / 2, W, H); g.strokeStyle = CARD_INK; g.lineWidth = 6; g.strokeRect(-W / 2, -H / 2, W, H);
  g.save(); g.font = '700 96px "Fredoka", serif'; g.fillStyle = '#1a1414'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('THE TIMES', 0, -H / 2 + 95); g.restore();
  g.fillStyle = '#1a1414'; g.fillRect(-W / 2 + 40, -H / 2 + 160, W - 80, 5); g.fillRect(-W / 2 + 40, -H / 2 + 210, W - 80, 3);
  insT(g, o.date || 'LONDON, 20 NOVEMBER 1888', 0, -H / 2 + 186, 30, { color: '#3a2e2a', weight: 800 });
  insT(g, o.head || 'A SHEEP PANIC', 0, -H / 2 + 285, 70, { color: '#1a1414', maxW: W - 100 });
  // filler columns
  g.fillStyle = 'rgba(40,30,26,0.28)'; for (let c = 0; c < 2; c++) for (let i = 0; i < 6; i++) { const x0 = -W / 2 + 50 + c * (W / 2 - 20), y = -H / 2 + 360 + i * 30; g.fillRect(x0, y, (W / 2 - 80) * (0.7 + ((i * 7 + c * 3) % 5) * 0.06), 12); }
  const qy = 180, hl = clamp((t - (o.hl ?? 0.8)) / 0.5);
  if (hl > 0) { g.fillStyle = 'rgba(255,214,74,0.85)'; g.fillRect(-W / 2 + 40, qy - 150, (W - 80) * ease.out(hl), 300); }
  (o.lines || []).forEach((l, i) => insT(g, l, 0, qy - 105 + i * 72, 54, { color: '#1a1414', maxW: W - 110 }));
  g.fillStyle = 'rgba(40,30,26,0.28)'; for (let i = 0; i < 5; i++) g.fillRect(-W / 2 + 50, H / 2 - 220 + i * 32, (W - 100) * (0.6 + (i % 3) * 0.15), 12);
  g.restore();
}
// scientific journal card ("NATURE, 1921")
export function journal(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; const W = 640, H = 860;
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? 880); g.rotate(o.rot ?? 0.04); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-W / 2 + 18, -H / 2 + 22, W, H);
  g.fillStyle = '#e8e0c8'; g.fillRect(-W / 2, -H / 2, W, H); g.strokeStyle = CARD_INK; g.lineWidth = 7; g.strokeRect(-W / 2, -H / 2, W, H);
  g.fillStyle = '#2a4a6a'; g.fillRect(-W / 2, -H / 2, W, 210);
  g.save(); g.font = 'italic 700 120px "Fredoka", serif'; g.fillStyle = '#f4efe0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NATURE', 0, -H / 2 + 110); g.restore();
  insT(g, o.date || '27 JANUARY 1921', 0, -H / 2 + 265, 40, { color: '#3a2e2a', weight: 800 });
  insT(g, o.head || 'SHEEP PANICS', 0, -H / 2 + 360, 74, { color: '#1a1414', maxW: W - 80 });
  g.fillStyle = 'rgba(40,30,26,0.28)'; for (let i = 0; i < 9; i++) g.fillRect(-W / 2 + 50, -H / 2 + 450 + i * 34, (W - 100) * (0.62 + (i % 4) * 0.1), 13);
  g.restore();
}
// cartoon lightning bolt (2D), drawn in the sky area
export function bolt(g, x, y, len, seed = 1, a = 1) {
  const r = rng(seed); let px = x, py = y; const pts = [[px, py]]; const n = 7; for (let i = 0; i < n; i++) { px += (r() - 0.5) * 90; py += len / n; pts.push([px, py]); }
  g.save(); g.globalAlpha = a; g.lineJoin = 'round'; g.lineCap = 'round';
  for (const [w, c] of [[34, 'rgba(160,190,255,0.35)'], [16, '#e8f0ff'], [6, '#ffffff']]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); pts.forEach(([x2, y2], i) => i ? g.lineTo(x2, y2) : g.moveTo(x2, y2)); g.stroke(); }
  g.restore();
}
// full-frame flash (lightning): returns flash strength 0..1 for times in list
export function flashK(t, list, dur = 0.22) { let k = 0; for (const a of list) { const d = t - a; if (d >= 0 && d < dur) k = Math.max(k, d < 0.05 ? 1 : (1 - (d - 0.05) / (dur - 0.05)) * (Math.sin(d * 90) * 0.3 + 0.7)); } return clamp(k); }
// moonlight grade: cool vignette + slight blue wash
export function nightLook(g, t, o = {}) {
  g.save(); const gr = g.createRadialGradient(E.W / 2, E.H * 0.5, E.H * 0.25, E.W / 2, E.H * 0.5, E.H * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(4,6,20,${o.vig ?? 0.55})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
  if (o.tint !== false) { g.globalCompositeOperation = 'soft-light'; g.fillStyle = alpha(o.tint || '#5a78ff', o.tintA ?? 0.18); g.fillRect(0, 0, E.W, E.H); }
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, glow, canvasTex };
