// What if you fell into a black hole? — shared assets (a THOUGHT EXPERIMENT, cartoon physics, nobody gets hurt):
// the astronaut (a bean in a white suit + bubble helmet, stretches like a noodle on demand), small + supermassive black holes
// (black core, photon ring, glowing accretion disk), a starfield space stage, the friend's little rocket, a "point of no return"
// road sign, plus 2D overlay helpers (hook lines, stamps, chips, arrows, a clock). Underscore = not auto-loaded.
import { E, wordTime, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { glow } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// ---------------------------------------------------------------- SPACE STAGE
// dark-violet gradient + a starfield (screen-size points, deterministic), soft blue key so the white suit reads
export function spaceStage(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: o.fov || 38, shadow: false, bg: o.bg || ['#04030c', '#0b0a24', '#1b1240'],
    key: ['#fff4ea', 2.4, [-6, 10, 9]], fill: ['#9fb4ff', 0.7, [8, 4, 6]], sky: '#cfd8ff', ground: '#6a5a8a', ambient: 1.15 });
  const r = rng(o.seed || 7), n = o.stars || 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const cs = ['#ffffff', '#cfe0ff', '#ffe8c0', '#ffd0e8'].map(c => new THREE.Color(c));
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, R = 150; const s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3); const c = cs[i % 4]; col.set([c.r, c.g, c.b], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false }));
  stars.userData.noOutline = true; st.add(stars);
  const big = new THREE.Group(); for (let i = 0; i < 24; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); const gl = glow(2.2 + r() * 1.6, i % 3 ? '#ffffff' : '#bcd0ff', 0.85); gl.position.set(Math.cos(a) * s * 120, u * 120, Math.sin(a) * s * 120); big.add(gl); }
  st.add(big);
  return { stage: st, stars, update(t) { stars.rotation.y = t * 0.004; big.rotation.y = t * 0.004; big.children.forEach((g, i) => { g.material.opacity = 0.55 + 0.35 * Math.sin(t * 2.2 + i * 1.7); }); } };
}

// ---------------------------------------------------------------- THE ASTRONAUT
// white suit, orange trim, bubble helmet, backpack. .stretch(k): 1 = normal, 3 = a long noodle (volume kept, cartoon only).
export function astronaut(o = {}) {
  const b = bean({ name: 'Astro', outfit: 'uniform', colors: { main: '#f4f4f6', legsTop: '#e6e8ee', legs: '#e6e8ee', feet: '#8a90a0', gloves: '#e6e8ee', trim: '#ff8a2a', belt: '#ff8a2a' }, skin: o.skin || 'olive',
    hair: 'messy', hairColor: '#3a2418', seed: o.seed || 41, scale: o.scale || 1, shadowBlob: false, headScale: [1.04, 1.02, 1.02] });
  const P = b.parts, R = 0.48;
  // helmet: clear bubble (no hull, so the stars show through) + an orange collar ring + a glint
  const glass = new THREE.Mesh(new THREE.SphereGeometry(R * 1.32, 32, 22), new THREE.MeshBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.16, depthWrite: false }));
  glass.userData.noOutline = true; P.head.add(glass);
  const glint = new THREE.Mesh(new THREE.SphereGeometry(R * 0.16, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 }));
  glint.scale.set(1, 1.7, 0.4); glint.position.set(-R * 0.62, R * 0.62, R * 0.95); glint.rotation.z = 0.6; glint.userData.noOutline = true; P.head.add(glint);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(R * 0.78, R * 0.16, 10, 28), toon('#ff8a2a')); collar.rotation.x = Math.PI / 2; collar.position.y = 1.2 - R * 0.92; P.upper.add(collar);
  const pack = rbox(0.62, 0.78, 0.3, '#dfe2ea', 0, 0.5, -0.42, 0.1); P.upper.add(pack);
  const pack2 = rbox(0.4, 0.12, 0.06, '#ff8a2a', 0, 0.72, -0.58, 0.03); P.upper.add(pack2);
  const badge = rbox(0.2, 0.14, 0.04, '#3a6ad8', -0.17, 0.56, 0.34, 0.03); P.upper.add(badge);
  outline(collar, { px: 3 }); outline(pack, { px: 3 }); outline(pack2, { px: 2.4 }); outline(badge, { px: 2 });
  const base = o.scale || 1;
  b.stretch = (k = 1, sq = null) => { const s = sq ?? 1 / Math.sqrt(k); P.rig.scale.set(base * s, base * k, base * s); };
  return b;
}
// the friend far away (a scientist-type in a cockpit): purple jumpsuit, binoculars in both hands
export function friend(o = {}) {
  const b = bean({ name: 'Friend', outfit: 'uniform', colors: { main: '#6a4ad0', legsTop: '#5a3ab8', trim: '#ffd25a', belt: '#ffd25a' }, skin: 'brown', hair: 'curly', hairColor: '#1e1410', seed: 52, shadowBlob: false });
  const bin = new THREE.Group(); for (const x of [-0.09, 0.09]) { const c = cyl(0.065, 0.075, 0.24, '#2a2a34', x, 0, 0, 14); c.rotation.x = Math.PI / 2; bin.add(c); const l = cyl(0.05, 0.05, 0.02, '#7fd0ff', x, 0, 0.125, 14); l.rotation.x = Math.PI / 2; l.userData.noOutline = true; bin.add(l); }
  bin.add(rbox(0.12, 0.06, 0.1, '#2a2a34', 0, 0, 0, 0.02)); outline(bin, { px: 2.6 }); b.bin = bin;
  return b;
}
export const scientist = (o = {}) => castMember('lin', o);

// ---------------------------------------------------------------- BLACK HOLES
function diskTex(hot = '#ffd27a', warm = '#ff7a2a', cool = '#c03a6a') {
  return canvasTex(512, 512, (g, W, H) => { const c = W / 2; const gr = g.createRadialGradient(c, c, W * 0.18, c, c, W * 0.5);
    gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.12, hot); gr.addColorStop(0.45, warm); gr.addColorStop(0.8, cool); gr.addColorStop(1, 'rgba(60,10,60,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = rng(5); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 90; i++) { const rad = W * (0.2 + r() * 0.28), a0 = r() * 6.28, len = 0.3 + r() * 1.2; g.strokeStyle = `rgba(255,${200 + r() * 55 | 0},${120 + r() * 100 | 0},${0.08 + r() * 0.14})`; g.lineWidth = 2 + r() * 6; g.beginPath(); g.arc(c, c, rad, a0, a0 + len); g.stroke(); }
  });
}
// blackHole({ r, disk, tilt, hot, warm, cool }): black core, bright photon ring (always faces camera: call .face(cam)), accretion disk
export function blackHole(o = {}) {
  const g = new THREE.Group(); const r = o.r || 1;
  const halo = glow(r * 7, o.haloColor || '#ff9a4a', o.halo ?? 0.38); g.add(halo);
  const core = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), flat('#000000')); core.userData.noOutline = true; core.renderOrder = 2; g.add(core);
  const ringG = new THREE.Group(); g.add(ringG);
  const ring = new THREE.Mesh(new THREE.RingGeometry(r * 1.0, r * 1.22, 96), new THREE.MeshBasicMaterial({ color: '#fff1c8', transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false }));
  ring.userData.noOutline = true; ringG.add(ring);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(r * 1.22, r * 1.7, 96), new THREE.MeshBasicMaterial({ color: '#ffb060', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  ring2.userData.noOutline = true; ringG.add(ring2);
  const dG = new THREE.Group(); dG.rotation.x = o.tilt ?? -1.36; g.add(dG);
  const disk = new THREE.Mesh(new THREE.RingGeometry(r * 1.35, r * (o.disk || 4.2), 128, 1), new THREE.MeshBasicMaterial({ map: diskTex(o.hot, o.warm, o.cool), transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  // remap UVs so the radial canvas gradient maps by radius
  const uv = disk.geometry.attributes.uv, p = disk.geometry.attributes.position; for (let i = 0; i < uv.count; i++) { const x = p.getX(i), y = p.getY(i), rr = Math.hypot(x, y) / (r * (o.disk || 4.2)) * 0.5, a = Math.atan2(y, x); uv.setXY(i, 0.5 + Math.cos(a) * rr, 0.5 + Math.sin(a) * rr); }
  disk.userData.noOutline = true; dG.add(disk);
  g.core = core; g.disk = disk; g.ringG = ringG; g.halo = halo; g.r = r;
  g.update = (t, cam) => { disk.rotation.z = -t * (o.spin ?? 0.6); if (cam) ringG.quaternion.copy(cam.quaternion); ring2.material.opacity = 0.3 + 0.08 * Math.sin(t * 3); };
  return g;
}

// ---------------------------------------------------------------- PROPS
// the friend's little rocket, seen side-on, with a round window the friend looks out of
export function rocket(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#e8ecf4', red = '#e8413a';
  const body = cyl(1.1, 1.1, 4.2, c, 0, 0, 0, 32); g.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.8, 32), toon(red)); nose.position.y = 3; g.add(nose);
  for (let i = 0; i < 3; i++) { const f = rbox(0.18, 1.4, 1.1, red, 0, -1.9, 0, 0.06); f.rotation.y = i * 2.094; f.translateZ(1.2); g.add(f); }
  const win = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.12, 10, 32), toon('#9aa0b0')); win.position.set(0, 0.6, 1.08); g.add(win);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), new THREE.MeshBasicMaterial({ color: '#9ad8ff', transparent: true, opacity: 0.22 })); glass.position.set(0, 0.6, 1.1); glass.userData.noOutline = true; g.add(glass);
  outline(g, { px: 2.6 }); g.windowAt = [0, 0.6, 1.1]; return g;
}
// floating road sign: "POINT OF NO RETURN"
export function noReturnSign(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex(512, 256, (c, W, H) => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, W, H); c.strokeStyle = '#20161a'; c.lineWidth = 18; c.strokeRect(9, 9, W - 18, H - 18);
    c.fillStyle = '#20161a'; c.font = '900 64px "Nunito", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('POINT OF', W / 2, H * 0.32); c.fillText('NO RETURN', W / 2, H * 0.68); });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.08), [toon('#c9a020'), toon('#c9a020'), toon('#c9a020'), toon('#c9a020'), new THREE.MeshToonMaterial({ map: tex }), toon('#c9a020')]);
  g.add(panel); const post = cyl(0.06, 0.06, 2.2, '#9aa0aa', 0, -1.6, -0.06, 10); g.add(post);
  outline(g, { px: 2.6 }); return g;
}
// a plate of spaghetti (payoff)
export function spaghettiPlate(o = {}) {
  const g = new THREE.Group(); const plate = cyl(1.1, 0.8, 0.12, '#f4f0e8', 0, 0, 0, 40); g.add(plate);
  const r = rng(o.seed || 3), mat = toon('#f2c75a');
  for (let i = 0; i < 26; i++) { const pts = []; const a0 = r() * 6.28, rad = 0.2 + r() * 0.55; for (let k = 0; k < 7; k++) { const a = a0 + k * 0.9; pts.push(new THREE.Vector3(Math.cos(a) * rad * (0.8 + r() * 0.4), 0.12 + k * 0.03 + r() * 0.05, Math.sin(a) * rad * (0.8 + r() * 0.4))); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 6, false), mat); g.add(tube); }
  const sauce = ball(0.42, '#d8402e', 0, 0.42, 0, 18); sauce.scale.y = 0.45; g.add(sauce);
  for (let i = 0; i < 3; i++) { const m = ball(0.15, '#8a4a2a', Math.cos(i * 2.1) * 0.3, 0.55, Math.sin(i * 2.1) * 0.3, 12); g.add(m); }
  outline(g, { px: 2.4 }); return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// two-tone line: [[text, colour], ...] centred at y
export function richLine(g, parts, y, size, o = {}) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = (o.x ?? E.W / 2) - tot / 2; parts.forEach(([s, c], i) => { insT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: CARD_INK }); x += ws[i] + sp; }); g.restore();
}
// the 0-3.5 s top caption: 2 lines, centre-top (below the Shorts top bar), pops in already on frame 1
export function topCaption(g, t, l1, l2, o = {}) {
  const u = (o.until ?? 99) - t; if (u <= 0) return; const a = clamp(u / 0.25);
  const k = o.still ? 1 : ease.outBack(clamp((t + 0.25) / 0.3)), k2 = o.still ? 1 : ease.outBack(clamp((t + 0.08) / 0.3));
  g.save(); g.globalAlpha = a;
  g.save(); g.translate(540, 300); g.scale(k, k); g.translate(-540, -300); richLine(g, l1, 300, o.size || 76); g.restore();
  g.save(); g.translate(540, 410); g.scale(k2, k2); g.translate(-540, -410); richLine(g, l2, 410, o.size || 76); g.restore();
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
// rounded label chip with an optional small sub-line
export function chip(g, t, title, sub, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const W = o.w || 700, H = sub ? 150 + (o.subSize || 44) * 1.2 : 130; g.save(); g.globalAlpha = fade; g.translate(o.x ?? E.W / 2, o.y ?? 520); g.rotate(o.rot ?? -0.03); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 10, -H / 2 + 14, W, H, 28); g.fill();
  g.fillStyle = o.fill || '#fff6e0'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 28); g.fill(); g.stroke();
  insT(g, title, 0, sub ? -36 : 4, o.size || 70, { color: o.color || '#b8322a', stroke: null, maxW: W - 60 });
  if (sub) insT(g, sub, 0, 40 + (o.subSize || 44) * 0.4, o.subSize || 44, { color: o.subColor || '#4a3a3a', stroke: null, maxW: W - 60 });
  g.restore();
}
// fat cartoon arrow from (x0,y0) to (x1,y1)
export function arrow(g, x0, y0, x1, y1, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= 0) return; const w = o.w || 34, col = o.color || '#ff5a4a';
  const xe = lerp(x0, x1, k), ye = lerp(y0, y1, k), a = Math.atan2(ye - y0, xe - x0), L = Math.hypot(xe - x0, ye - y0); if (L < 4) return;
  g.save(); g.translate(x0, y0); g.rotate(a); g.lineJoin = 'round';
  const hl = Math.min(L * 0.5, w * 2.2); g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L - hl, -w / 2); g.lineTo(L - hl, -w * 1.25); g.lineTo(L, 0); g.lineTo(L - hl, w * 1.25); g.lineTo(L - hl, w / 2); g.lineTo(0, w / 2); g.closePath();
  g.fillStyle = col; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.stroke(); g.fill(); g.restore();
}
// cartoon clock face; hand angle in turns
export function clock(g, x, y, r, turns, o = {}) {
  g.save(); g.translate(x, y); g.fillStyle = o.fill || '#fffaf0'; g.strokeStyle = CARD_INK; g.lineWidth = r * 0.12;
  g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill(); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.beginPath(); g.moveTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78); g.lineTo(Math.sin(a) * r * 0.9, -Math.cos(a) * r * 0.9); g.lineWidth = r * 0.06; g.stroke(); }
  const a = turns * 6.283; g.lineCap = 'round'; g.strokeStyle = o.hand || '#e23b2e'; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * r * 0.72, -Math.cos(a) * r * 0.72); g.stroke();
  g.strokeStyle = CARD_INK; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a / 12) * r * 0.45, -Math.cos(a / 12) * r * 0.45); g.stroke();
  g.fillStyle = CARD_INK; g.beginPath(); g.arc(0, 0, r * 0.1, 0, 6.283); g.fill(); g.restore();
}
// binocular vignette (two overlapping circles, black outside)
let _bc = null;
export function binocs(g, k = 1) {
  if (k <= 0) return; if (!_bc) _bc = new OffscreenCanvas(E.W, E.H); const c = _bc.getContext('2d'); c.clearRect(0, 0, E.W, E.H);
  c.globalCompositeOperation = 'source-over'; c.fillStyle = '#05040a'; c.fillRect(0, 0, E.W, E.H); c.globalCompositeOperation = 'destination-out';
  const r = lerp(1100, 330, k); for (const s of [-1, 1]) { c.beginPath(); c.arc(E.W / 2 + s * r * 0.6, E.H * 0.47, r, 0, 6.283); c.fill(); }
  c.globalCompositeOperation = 'source-over'; g.save(); g.globalAlpha = clamp(k * 1.5); g.drawImage(_bc, 0, 0); g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, toon, flat, outline, rng, clamp, lerp, ease, prog, insT, CARD_INK, glow, canvasTex, shadeHex };
