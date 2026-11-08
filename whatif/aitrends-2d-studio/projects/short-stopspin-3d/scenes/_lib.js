// _lib.js — sets, props and helpers for "What If the Earth Stopped Spinning for One Second?" (Toon 3D remake).
// Not auto-loaded (underscore). EAST = +X = screen right in every shot. Hero stands at the origin facing +Z (camera).
import { E, wordTime, text, ease, prog, clamp, lerp, rng, noise, FONTS } from '/engine/core.js';
import { THREE, toon, flat, canvasTex, outline, rbox, box, cyl, ball, plane, floor, blob, toonStage, INK } from '/kits/toon3d/toon.js';
import { POSE, addPose, mixPose } from '/kits/toon3d/rig.js';
import { castMember, MUSTARD } from '/kits/toon3d/cast.js';
export { THREE };

// ---------- timing / screen helpers ----------
// local time (seconds into the shot) when `word` is spoken
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function screen(st, v) { const p = v.clone().project(st.camera); return [(p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H]; }
// gold pill chip near the top of the frame
export function tag(g, str, k = 1, y = 0.13, o = {}) {
  if (k <= 0) return; const sz = o.size || 54; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `700 ${sz}px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = o.bg || 'rgba(20,14,18,.84)'; g.beginPath(); g.roundRect(-w / 2, -sz * 0.78, w, sz * 1.56, sz * 0.78); g.fill();
  text(g, str, 0, 2, { size: sz, color: o.color || '#ffd25a', weight: 700 }); g.restore();
}
// big gold number slam with outline + soft shadow
export function slam(g, str, x, y, k, o = {}) {
  if (k <= 0) return; const sz = o.size || 190; const s = (o.from ?? 2.2) + (1 - (o.from ?? 2.2)) * ease.outBack(clamp(k)); g.save(); g.translate(x, y); g.rotate(o.rot || -0.05); g.scale(s, s); g.globalAlpha = clamp(k * 3);
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = sz * 0.2; g.shadowOffsetY = sz * 0.08; text(g, str, 0, 0, { size: sz, color: '#000', stroke: sz * 0.2, strokeColor: '#141014', weight: 700 }); g.restore();
  text(g, str, 0, 0, { size: sz, color: o.color || '#ffd25a', stroke: sz * 0.2, strokeColor: '#141014', weight: 700 }); g.restore();
}
// cartoon speed lines across the frame (2D overlay). dir = -1 lines travel left (camera moving right)
export function speedLines(g, t, k = 1, o = {}) {
  if (k <= 0) return; const { n = 22, dir = -1, seed = 3, color = 'rgba(255,255,255,.85)', y0 = 0, y1 = E.H } = o; const r = rng(seed); g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const y = lerp(y0, y1, r()), sp = 2.4 + r() * 2.2, len = 140 + r() * 320, ph = r(); const u = ((t * sp + ph) % 1); const x = dir < 0 ? E.W * 1.3 - u * E.W * 1.8 : -E.W * 0.3 + u * E.W * 1.8;
    g.strokeStyle = color; g.globalAlpha = k * (0.35 + r() * 0.5); g.lineWidth = 5 + r() * 7; g.beginPath(); g.moveTo(x, y); g.lineTo(x - dir * len, y); g.stroke(); }
  g.restore();
}
// white flash + ring burst (the "stop" hit)
export function burst(g, x, y, k) { if (k <= 0 || k >= 1) return; g.save(); g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = '#fff'; g.lineWidth = 26 * (1 - k) + 4; g.beginPath(); g.arc(x, y, 80 + k * 620, 0, Math.PI * 2); g.stroke(); g.restore(); }
// a toon speedometer (2D overlay, outlined like the 3D props)
export function gauge(g, x, y, r, val, max, k = 1) {
  if (k <= 0) return; g.save(); g.translate(x, y); const s = 0.7 + 0.3 * ease.outBack(k); g.scale(s, s); g.globalAlpha = clamp(k * 2);
  g.fillStyle = '#20161a'; g.beginPath(); g.arc(0, 0, r + 14, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fbf8f2'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2; g.lineWidth = r * 0.12; g.lineCap = 'butt';
  [['#7ac05a', 0, 0.5], ['#ffd25a', 0.5, 0.78], ['#e2533a', 0.78, 1]].forEach(([c, a, b]) => { g.strokeStyle = c; g.beginPath(); g.arc(0, 0, r * 0.8, lerp(a0, a1, a), lerp(a0, a1, b)); g.stroke(); });
  g.strokeStyle = '#20161a'; g.lineWidth = 6; for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); g.beginPath(); g.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62); g.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); g.stroke(); }
  const a = lerp(a0, a1, clamp(val / max)); g.strokeStyle = '#d63a3a'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78); g.stroke();
  g.fillStyle = '#20161a'; g.beginPath(); g.arc(0, 0, r * 0.1, 0, Math.PI * 2); g.fill();
  text(g, `${Math.round(val).toLocaleString('en-US')}`, 0, r * 0.42, { size: r * 0.3, color: '#20161a', weight: 700 }); text(g, 'km/h', 0, r * 0.68, { size: r * 0.16, color: '#5a4a4a', weight: 700 });
  g.restore();
}

// ---------- props ----------
const done = (g, px = 2.6) => { outline(g, { px }); return g; };
const grp = (...k) => { const g = new THREE.Group(); k.forEach(x => x && g.add(x)); return g; };
// takeaway coffee: white cup, kraft sleeve, white lid. Origin at the cup's centre.
export function coffee() { const g = grp(cyl(0.11, 0.085, 0.3, '#fbf8f2', 0, 0, 0), cyl(0.113, 0.1, 0.12, '#b8875a', 0, -0.01, 0), cyl(0.12, 0.12, 0.05, '#f2efe8', 0, 0.17, 0), cyl(0.07, 0.09, 0.04, '#f2efe8', 0, 0.21, 0)); return done(g, 2.2); }
// the hero with coffee in the right hand
export function heroWithCoffee(o = {}) { const h = castMember('hero', o); const c = coffee(); c.position.set(0, -0.06, 0.05); h.hold('R', c); h.cup = c; return h; }
// hero poses
export const SIP = (k = 1, base = POSE.relaxed) => mixPose(base, { ...base, armR: [1.05, 0.05, 0.55], elbowR: 2.05, headNod: -0.08 }, k);
export const HOLDCUP = addPose(POSE.relaxed, { armR: [0.5, 0.08, 0.2], elbowR: 1.15 });
export function flyPose(t, amp = 1) { const s = Math.sin(t * 9), c = Math.cos(t * 7.3);
  return addPose(POSE.panic, { armL: [s * 0.4 * amp, 0.2 * c * amp, 0], armR: [-s * 0.4 * amp, -0.2 * c * amp, 0], legL: [0.35 * s * amp, 0.15], legR: [-0.35 * s * amp, 0.15], kneeL: 0.3 + 0.3 * Math.max(0, s), kneeR: 0.3 + 0.3 * Math.max(0, -s), headTurn: 0.15 * c }); }
// the hood flaps when flying: wobble the head group a bit (cheap) — done by callers through pose headTilt
export function tree(o = {}) { const { h = 3.2, c = '#5f9a3e', seed = 1 } = o; const r = rng(seed); const g = grp(cyl(0.13, 0.18, h, '#7a5236', 0, h / 2, 0, 10));
  const can = new THREE.Group(); can.position.y = h; g.add(can); [[0, 0.3, 0, 1.1], [0.7, 0, 0.1, 0.8], [-0.65, 0.05, -0.1, 0.85], [0.1, 0.9, 0, 0.75], [0, 0.1, 0.6, 0.7]].forEach(([x, y, z, s]) => can.add(ball(s, c, x, y, z, 18)));
  can.children.forEach((m, i) => { m.material = toon(i % 2 ? c : new THREE.Color(c).offsetHSL(0, 0, 0.06).getStyle()); });
  g.canopy = can; g.add(blob(0.9, 0.3)); return done(g); }
export function lamp() { const g = grp(cyl(0.07, 0.09, 4.2, '#2f3a40', 0, 2.1, 0, 10), cyl(0.16, 0.2, 0.25, '#2f3a40', 0, 0.12, 0, 10), rbox(0.9, 0.08, 0.12, '#2f3a40', 0.35, 4.15, 0), cyl(0.18, 0.26, 0.22, '#2f3a40', 0.75, 4.0, 0, 12)); const bulb = ball(0.13, '#fff3c8', 0.75, 3.88, 0); bulb.material = toon('#fff3c8', { emissive: new THREE.Color('#ffe9a0'), emissiveIntensity: 0.6 }); g.add(bulb, blob(0.3, 0.3)); return done(g); }
export function bench() { const g = grp(); for (const z of [0, 0.22]) g.add(rbox(1.8, 0.08, 0.18, '#b0703a', 0, 0.5, z - 0.1)); g.add(rbox(1.8, 0.35, 0.07, '#b0703a', 0, 0.85, -0.26)); for (const x of [-0.75, 0.75]) g.add(rbox(0.08, 0.5, 0.5, '#33393f', x, 0.25, 0)); g.add(blob(1.0, 0.25)); return done(g); }
export function bin() { const g = grp(cyl(0.3, 0.26, 0.9, '#3d7a4a', 0, 0.45, 0), cyl(0.33, 0.33, 0.08, '#2e5e38', 0, 0.92, 0)); g.lid = g.children[1]; g.add(blob(0.4, 0.3)); return done(g); }
export function hydrant() { const g = grp(cyl(0.16, 0.18, 0.6, '#d63a3a', 0, 0.3, 0), ball(0.17, '#d63a3a', 0, 0.62, 0), cyl(0.06, 0.06, 0.45, '#b02a2a', 0, 0.42, 0), cyl(0.22, 0.22, 0.06, '#b02a2a', 0, 0.06, 0)); g.children[2].rotation.z = Math.PI / 2; g.add(blob(0.3, 0.3)); return done(g); }
export function car(o = {}) { const { c = '#3a7ad0', seed = 1 } = o; const g = grp(rbox(3.2, 0.7, 1.5, c, 0, 0.65, 0, 0.25), rbox(1.8, 0.6, 1.36, c, -0.15, 1.25, 0, 0.22));
  const gl = toon('#bfe3f5', { emissive: new THREE.Color('#9fd0ee'), emissiveIntensity: 0.25 }); const w1 = rbox(1.6, 0.42, 1.38, gl, -0.15, 1.27, 0, 0.12); w1.userData.noOutline = true; g.add(w1);
  for (const [x, z] of [[-1.0, 0.72], [1.0, 0.72], [-1.0, -0.72], [1.0, -0.72]]) { const w = cyl(0.34, 0.34, 0.24, '#26262c', x, 0.34, z, 16); w.rotation.x = Math.PI / 2; g.add(w); const hub = cyl(0.15, 0.15, 0.26, '#c8c8cc', x, 0.34, z, 12); hub.rotation.x = Math.PI / 2; g.add(hub); }
  g.add(ball(0.1, '#fff6c8', 1.58, 0.75, 0.5), ball(0.1, '#fff6c8', 1.58, 0.75, -0.5), ball(0.08, '#e04a3a', -1.6, 0.75, 0.55), ball(0.08, '#e04a3a', -1.6, 0.75, -0.55), blob(1.7, 0.3)); return done(g); }
export function cafeTable() { const g = grp(cyl(0.45, 0.45, 0.06, '#f2efe8', 0, 0.95, 0), cyl(0.04, 0.04, 0.9, '#33393f', 0, 0.48, 0, 8), cyl(0.25, 0.25, 0.04, '#33393f', 0, 0.02, 0), cyl(0.03, 0.03, 2.3, '#e8e2d6', 0, 1.6, 0, 8));
  const um = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.6, 8, 1, true), toon('#d84a3a', { side: THREE.DoubleSide })); um.position.y = 2.6; um.castShadow = true; g.add(um); g.add(coffee().translateY(1.13).translateX(0.15)); g.add(blob(0.7, 0.3)); return done(g); }
export function cloud(o = {}) { const { s = 1, seed = 1 } = o; const r = rng(seed); const g = new THREE.Group(); const m = toon('#ffffff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35 });
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), m); const x = (i - 2.5) * 0.75; b.position.set(x, (1 - Math.abs(x) / 2.5) * 0.45 + r() * 0.2, r() * 0.3); b.scale.setScalar(0.6 + (1 - Math.abs(x) / 2.5) * 0.55 + r() * 0.2); g.add(b); }
  g.scale.setScalar(s); g.children.forEach(c => (c.castShadow = false)); outline(g, { px: 2.2, color: '#8a9ab8' }); return g; }
export function bird(o = {}) { const g = grp(ball(0.16, o.c || '#8a8f9a', 0, 0, 0), ball(0.1, o.c || '#8a8f9a', 0.15, 0.1, 0)); const beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 6), toon('#e8a23a')); beak.rotation.z = -Math.PI / 2; beak.position.set(0.26, 0.1, 0); g.add(beak);
  const wing = rbox(0.22, 0.04, 0.12, o.w || '#6a707a', -0.02, 0.06, 0.06, 0.02); g.add(wing); g.wing = wing; g.add(ball(0.025, '#141014', 0.2, 0.14, 0.07, 6)); return done(g, 2.0); }

// ---------- building facade with windows (modern sunny street) ----------
const _tx = new Map(); const cached = (k, f) => (_tx.has(k) ? _tx.get(k) : (_tx.set(k, f()), _tx.get(k)));
function facadeTex(col, cols = 3, rows = 4, shop = '') {
  return cached(`fac${col}${cols}${rows}${shop}`, () => canvasTex(512, 640, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < h; y += 18) g.fillRect(0, y, w, 2);
    const top = shop ? h * 0.72 : h; const cw = w / cols, rh = top / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = i * cw + cw * 0.22, y = j * rh + rh * 0.2, ww = cw * 0.56, hh = rh * 0.6;
      g.fillStyle = '#f4efe6'; g.fillRect(x - 6, y - 6, ww + 12, hh + 12); g.fillStyle = '#7fb8d8'; g.fillRect(x, y, ww, hh); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(x, y + hh * 0.7); g.lineTo(x + ww * 0.6, y); g.lineTo(x + ww * 0.85, y); g.lineTo(x, y + hh); g.fill();
      g.fillStyle = '#20161a'; g.fillRect(x + ww / 2 - 2, y, 4, hh); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 8, y + hh + 6, ww + 16, 8); }
    if (shop) { g.fillStyle = '#3a2a26'; g.fillRect(0, top, w, h - top); g.fillStyle = '#9fd0e8'; g.fillRect(w * 0.06, top + 40, w * 0.5, h - top - 50); g.fillStyle = '#6a4428'; g.fillRect(w * 0.64, top + 40, w * 0.28, h - top - 40); g.fillStyle = '#e8c25a'; g.fillRect(w * 0.88, top + 110, 10, 10); }
  }));
}
export function building(o = {}) {
  const { w = 5, h = 8, d = 3, col = '#e8b48a', shop = '', awning = null, sign = null } = o; const g = new THREE.Group();
  const front = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [toon(col), toon(col), toon(new THREE.Color(col).offsetHSL(0, 0, -0.05).getStyle()), toon(col), new THREE.MeshToonMaterial({ map: facadeTex(col, Math.max(2, Math.round(w / 1.7)), Math.max(2, Math.round((shop ? h * 0.72 : h) / 2.1)), shop), gradientMap: toon(col).gradientMap }), toon(col)]);
  front.position.set(0, h / 2, -d / 2); front.castShadow = front.receiveShadow = true; front.userData.noOutline = true; g.add(front);
  g.add(rbox(w + 0.3, 0.3, d + 0.3, new THREE.Color(col).offsetHSL(0, 0, -0.15).getStyle(), 0, h + 0.15, -d / 2, 0.06));
  if (awning) { const t = cached(`aw${awning}`, () => canvasTex(256, 64, (gg, W, H) => { for (let i = 0; i < 8; i++) { gg.fillStyle = i % 2 ? '#fbf8f2' : awning; gg.fillRect(i * 32, 0, 32, H); } })); const a = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.08, 1.4), new THREE.MeshToonMaterial({ map: t, gradientMap: toon('#fff').gradientMap })); a.position.set(0, h * 0.28 + 1.0, 0.6); a.rotation.x = 0.35; a.castShadow = true; g.add(a); }
  if (sign) { const t = cached(`sg${sign}`, () => canvasTex(512, 128, (gg, W, H) => { gg.fillStyle = '#20161a'; gg.fillRect(0, 0, W, H); gg.fillStyle = '#ffd25a'; gg.font = '700 84px Fredoka, sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(sign, W / 2, H / 2 + 4); })); const s = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, w * 0.15, 0.12), [toon('#20161a'), toon('#20161a'), toon('#20161a'), toon('#20161a'), new THREE.MeshBasicMaterial({ map: t }), toon('#20161a')]); s.position.set(0, h * 0.28 + 1.75, 0.08); g.add(s); }
  outline(g, { px: 2.2 }); return g;
}

// ---------- SUNNY STREET: buildings along X (z = -4), sidewalk, curb at z = 2.6, road toward the camera ----------
export function sunnyStreet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4);
  const walk = floor(80, 7, '#d8cfc0', 0, -0.6); g.add(walk);
  const tiles = canvasTex(256, 256, (gg, W, H) => { gg.fillStyle = '#d8cfc0'; gg.fillRect(0, 0, W, H); gg.strokeStyle = 'rgba(90,70,60,.25)'; gg.lineWidth = 4; for (let i = 0; i <= 4; i++) { gg.beginPath(); gg.moveTo(i * 64, 0); gg.lineTo(i * 64, H); gg.stroke(); gg.beginPath(); gg.moveTo(0, i * 64); gg.lineTo(W, i * 64); gg.stroke(); } }, { repeat: [40, 3.5] }); walk.material = new THREE.MeshToonMaterial({ map: tiles, gradientMap: toon('#fff').gradientMap });
  const curb = box(80, 0.18, 0.35, '#bfb6a8', 0, 0.09, 2.85); curb.receiveShadow = true; g.add(curb);
  const road = floor(80, 14, '#55585e', 0, 10); g.add(road); for (let x = -40; x < 40; x += 4) g.add(floor(2, 0.18, '#f2efe8', x, 7.2).translateY(0.01));
  const B = []; const cols = ['#e8b48a', '#9fc4d8', '#f0d38a', '#d88a7a', '#b8d49a', '#e6c8e0', '#f2d2b0'];
  let x = -34; let i = 0; while (x < 34) { const w = 4.5 + r() * 2; const isCafe = Math.abs(x + w / 2) < 3.5 && !B.cafe; const b = building({ w, h: 6.5 + r() * 5, col: cols[i % cols.length], shop: isCafe || r() < 0.5 ? 'y' : '', awning: isCafe ? '#d84a3a' : (r() < 0.4 ? ['#3a8a5a', '#3a6ad0', '#e08a2a'][i % 3] : null), sign: isCafe ? 'CAFE' : null }); b.position.set(x + w / 2, 0, -4); g.add(b); B.push(b); if (isCafe) B.cafe = b; x += w + 0.05; i++; }
  const props = { trees: [], lamps: [], loose: [] };
  for (const tx of [-14, -5.5, 6.5, 15, 24]) { const t = tree({ seed: tx + 50, h: 3.0 + r() * 0.6 }); t.position.set(tx, 0, 2.0); g.add(t); props.trees.push(t); }
  for (const lx of [-9, 3.2, 12]) { const l = lamp(); l.position.set(lx, 0, 2.3); g.add(l); props.lamps.push(l); }
  const tb = cafeTable(); tb.position.set(-2.6, 0, -2.2); g.add(tb); props.table = tb;
  const be = bench(); be.position.set(9, 0, -2.6); g.add(be); props.bench = be;
  const bi = bin(); bi.position.set(4.6, 0, 1.8); g.add(bi); props.bin = bi;
  const hy = hydrant(); hy.position.set(-7.2, 0, 2.2); g.add(hy);
  const cr = car({ c: '#3a7ad0' }); cr.position.set(-11, 0.0, 4.0); g.add(cr); props.car = cr;
  const cr2 = car({ c: '#e0a02a' }); cr2.position.set(15, 0.0, 4.0); g.add(cr2); props.car2 = cr2;
  // sky: sun + clouds
  const sun = ball(3, '#fff2b0', 30, 34, -70); sun.material = flat('#fff4c0'); sun.userData.noOutline = true; g.add(sun);
  const clouds = [[-18, 17, -40, 2.4], [6, 20, -50, 3], [22, 15, -38, 2], [-4, 24, -60, 3.5]].map(([x, y, z, s], i) => { const c = cloud({ s, seed: i + 3 }); c.position.set(x, y, z); g.add(c); return c; });
  return { group: g, props, buildings: B, clouds, update: (t, k = 1) => { clouds.forEach((c, i) => { c.position.x += 0; }); } };
}
export function streetStage(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: 34, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 0], key: ['#fff1dc', 2.7, [-6, 12, 9]], bg: ['#6fb0ea', '#a9d2f2', '#e6f2f8'], ...(o.stage || {}) });
  const set = sunnyStreet(st, o); return { stage: st, set };
}

// ---------- GLOBE (toon Earth: blue ocean, green/sand continents, white caps, gold equator) ----------
function earthTex() { return cached('earth', () => canvasTex(1024, 512, (g, w, h) => {
  g.fillStyle = '#3f8fd8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.07)'; for (let y = 0; y < h; y += 24) g.fillRect(0, y, w, 6);
  const land = (pts, c = '#6fbf4a') => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => { const X = (x / 360 + 0.5) * w, Y = (0.5 - y / 180) * h; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill(); g.strokeStyle = '#2a5a3a'; g.lineWidth = 5; g.stroke(); };
  land([[-165, 68], [-140, 70], [-95, 72], [-75, 62], [-55, 52], [-66, 45], [-76, 35], [-81, 26], [-97, 26], [-105, 20], [-88, 15], [-80, 8], [-95, 16], [-110, 23], [-118, 34], [-125, 44], [-135, 58], [-160, 58]]);
  land([[-80, 10], [-62, 10], [-50, 0], [-35, -7], [-40, -22], [-58, -38], [-68, -54], [-74, -45], [-72, -20], [-80, -5]]);
  land([[-17, 15], [-15, 28], [-5, 36], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [33, -27], [20, -35], [12, -18], [9, 4], [-8, 5]], '#d9b86a');
  land([[-10, 36], [-8, 44], [-2, 49], [5, 52], [8, 58], [20, 60], [30, 70], [60, 70], [100, 76], [140, 72], [175, 66], [160, 58], [140, 50], [122, 40], [121, 30], [108, 20], [105, 10], [100, 2], [95, 15], [80, 8], [73, 20], [57, 25], [50, 30], [35, 37], [27, 40], [12, 45], [3, 43]]);
  land([[114, -22], [122, -18], [135, -12], [145, -15], [153, -27], [146, -39], [135, -34], [116, -34]], '#d9b86a');
  land([[-50, 60], [-40, 65], [-22, 70], [-30, 82], [-60, 80], [-70, 76]], '#f2f6fa');
  g.fillStyle = '#f2f6fa'; g.fillRect(0, 0, w, 22); g.fillRect(0, h - 40, w, 40);
})); }
export function globe(o = {}) {
  const { r = 3 } = o; const root = new THREE.Group(); const tilt = new THREE.Group(); tilt.rotation.z = -0.32; root.add(tilt); const spin = new THREE.Group(); tilt.add(spin);
  const m = new THREE.MeshToonMaterial({ map: earthTex(), gradientMap: toon('#fff').gradientMap }); const s = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 40), m); s.castShadow = s.receiveShadow = true; spin.add(s);
  outline(s, { px: 4 });
  const eq = new THREE.Mesh(new THREE.TorusGeometry(r * 1.012, r * 0.022, 8, 96), flat('#ffd25a')); eq.rotation.x = Math.PI / 2; eq.userData.noOutline = true; tilt.add(eq); eq.visible = false;
  const axis = cyl(0.06, 0.06, r * 2.6, '#c9c4bc', 0, 0, 0, 8); tilt.add(axis); outline(axis, { px: 2 });
  root.spin = spin; root.eq = eq; root.sphere = s; return root;
}

// ---------- TINY PLANET for the hook: a small Earth with a street on top ----------
export function tinyPlanet(o = {}) {
  const { r = 4 } = o; const root = new THREE.Group(); const spin = new THREE.Group(); root.add(spin);
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 40), new THREE.MeshToonMaterial({ map: earthTex(), gradientMap: toon('#fff').gradientMap })); s.rotation.x = Math.PI / 2; s.castShadow = s.receiveShadow = true; spin.add(s); outline(s, { px: 4 });
  // a ring of houses, trees and lamps standing on the surface (around the Z axis so they roll past the hero)
  const cols = ['#e8b48a', '#9fc4d8', '#f0d38a', '#d88a7a', '#b8d49a'];
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 + 0.1; let p;
    if (i % 3 === 0) p = tree({ h: 1.6, seed: i }); else if (i % 3 === 1) { p = building({ w: 1.6, h: 2 + (i % 4) * 0.4, d: 1.2, col: cols[i % 5] }); p.position.z = -0.6; } else p = lamp().translateZ(0);
    const piv = new THREE.Group(); piv.rotation.z = a; const holder = new THREE.Group(); holder.position.y = r - 0.05; holder.add(p); p.position.z = (i % 2 ? -1.6 : -2.6) + (p.position.z || 0); if (i % 3 === 2) p.scale.setScalar(0.55); piv.add(holder); spin.add(piv); }
  // a road band around the planet
  const road = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.01, r + 0.01, 1.4, 64, 1, true), toon('#55585e')); road.rotation.x = Math.PI / 2; road.userData.noOutline = true; spin.add(road);
  root.spin = spin; root.r = r; return root;
}

// ---------- COAST: sea, sea wall, lighthouse (bolted to bedrock), the surge ----------
export function coast(st) {
  const g = new THREE.Group(); st.add(g);
  const seaGeo = new THREE.PlaneGeometry(90, 50, 90, 40); seaGeo.rotateX(-Math.PI / 2); const sea = new THREE.Mesh(seaGeo, toon('#3f8fd8', { emissive: new THREE.Color('#2a6ab0'), emissiveIntensity: 0.15 })); sea.position.set(0, 0.4, -20); sea.receiveShadow = true; sea.userData.noOutline = true; g.add(sea);
  const base = seaGeo.attributes.position.array.slice();
  const prom = floor(90, 8, '#d8cfc0', 0, 3); prom.position.y = 1.2; g.add(prom);
  const wall = rbox(90, 1.6, 0.8, '#bfb6a8', 0, 0.8, -0.8, 0.08); g.add(wall); const rail = new THREE.Group(); for (let x = -40; x < 40; x += 1.6) rail.add(cyl(0.05, 0.05, 1.0, '#2f3a40', x, 1.7, -0.6, 6)); rail.add(rbox(90, 0.08, 0.08, '#2f3a40', 0, 2.2, -0.6)); g.add(rail); outline(rail, { px: 2 });
  // lighthouse on a rock out at sea (stays: bolted to bedrock)
  const lh = new THREE.Group(); const rock = ball(2.4, '#7a7470', 0, 0, 0, 14); rock.scale.set(1.3, 0.6, 1); lh.add(rock);
  const stripes = canvasTex(64, 256, (gg, W, H) => { for (let i = 0; i < 6; i++) { gg.fillStyle = i % 2 ? '#fbf8f2' : '#d63a3a'; gg.fillRect(0, (i * H) / 6, W, H / 6); } });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 7, 24), new THREE.MeshToonMaterial({ map: stripes, gradientMap: toon('#fff').gradientMap })); tower.position.y = 4.5; tower.castShadow = true; lh.add(tower);
  lh.add(cyl(1.15, 1.15, 0.2, '#2f3a40', 0, 8.1, 0), cyl(0.7, 0.7, 1.0, '#fff1a0', 0, 8.7, 0), new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.9, 20), toon('#d63a3a')).translateY(9.65));
  lh.children[lh.children.length - 2].material = toon('#fff1a0', { emissive: new THREE.Color('#ffe070'), emissiveIntensity: 0.7 });
  outline(lh, { px: 2.6 }); lh.position.set(-7, 0, -16); g.add(lh);
  // the surge: a curling toon wave front (half tube + foam) that sweeps east
  const wave = new THREE.Group(); const curl = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 20, 24, 1, true, 0, Math.PI * 1.25), toon('#3a86d0', { side: THREE.DoubleSide, emissive: new THREE.Color('#2a6ab0'), emissiveIntensity: 0.15 })); curl.rotation.x = Math.PI / 2; curl.rotation.y = 0; curl.userData.noOutline = true; wave.add(curl);
  const body = new THREE.Mesh(new THREE.BoxGeometry(40, 3.2, 20), toon('#3f8fd8', { emissive: new THREE.Color('#2a6ab0'), emissiveIntensity: 0.15 })); body.position.set(-21, -0.6, 0); body.userData.noOutline = true; wave.add(body);
  const foamM = toon('#ffffff', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3 }); const foam = []; const r = rng(9);
  for (let i = 0; i < 46; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), foamM); f.position.set(1.4 + r() * 1.2, 1.4 + r() * 1.4, (r() - 0.5) * 20); f.scale.setScalar(0.35 + r() * 0.45); f.userData.noOutline = true; wave.add(f); foam.push({ f, ph: r() * 6, y: f.position.y, x: f.position.x }); }
  outline(curl, { px: 3, color: '#14304a' });
  wave.position.set(-30, 0, -12); g.add(wave);
  return { group: g, lighthouse: lh, wave, sea, update(t, k = 0) {
    const p = seaGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.array[i * 3 + 1] = Math.sin(x * 0.5 + t * 2 + z * 0.3) * 0.15 + Math.sin(z * 0.7 - t * 1.4) * 0.1 + k * 1.6 * clamp((x + 40 - k * 80) * -0.05 + 1); } p.needsUpdate = true; seaGeo.computeVertexNormals();
    foam.forEach(q => { q.f.position.y = q.y + Math.sin(t * 6 + q.ph) * 0.15; q.f.position.x = q.x + Math.sin(t * 5 + q.ph) * 0.15; }); } };
}

// ---------- JET (toon airliner) ----------
export function jet() {
  const g = new THREE.Group(); const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 7, 8, 20), toon('#f6f4ef')); fus.rotation.z = Math.PI / 2; fus.castShadow = true; g.add(fus);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.765, 0.765, 6.6, 20, 1, true), toon('#3a6ad0')); stripe.rotation.z = Math.PI / 2; stripe.scale.set(1, 1, 1); stripe.position.y = -0.0; stripe.userData.noOutline = true; stripe.scale.y = 1; g.add(stripe); stripe.scale.set(1, 1, 1);
  const wingM = toon('#d8dce4'); const wing = rbox(2.2, 0.14, 8, wingM, -0.3, -0.3, 0, 0.06); wing.rotation.y = 0.35; g.add(wing);
  const tail = rbox(1.2, 1.8, 0.12, '#3a6ad0', -4.1, 1.1, 0, 0.05); tail.rotation.z = 0.4; g.add(tail); const ht = rbox(0.9, 0.1, 3, wingM, -4.1, 0.3, 0, 0.04); g.add(ht);
  for (const z of [-2, 2]) { const en = cyl(0.32, 0.28, 1.2, '#b8bcc4', 0.3, -0.75, z, 14); en.rotation.z = Math.PI / 2; g.add(en); }
  for (let i = 0; i < 9; i++) { const w = ball(0.11, '#2a3a5a', 2.6 - i * 0.6, 0.25, 0.72, 8); w.scale.z = 0.3; w.userData.noOutline = true; g.add(w); }
  const cock = ball(0.3, '#2a3a5a', 3.7, 0.3, 0.45, 10); cock.scale.set(1.2, 0.6, 0.4); cock.userData.noOutline = true; g.add(cock);
  outline(g, { px: 2.6 }); return g;
}

// ---------- CUTAWAY: a block of ground (grass / soil / bedrock) seen in section ----------
export function cutaway(st) {
  const g = new THREE.Group(); st.add(g);
  const rockTex = canvasTex(512, 256, (gg, W, H) => { gg.fillStyle = '#7d7a86'; gg.fillRect(0, 0, W, H); const r = rng(3); gg.strokeStyle = 'rgba(30,20,30,.45)'; gg.lineWidth = 4; for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H; gg.beginPath(); gg.moveTo(x, y); gg.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 40); gg.lineTo(x + (r() - 0.5) * 90, y + (r() - 0.5) * 60); gg.stroke(); } for (let i = 0; i < 70; i++) { gg.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},.12)`; gg.beginPath(); gg.arc(r() * W, r() * H, 6 + r() * 16, 0, 7); gg.fill(); } });
  const soilTex = canvasTex(512, 128, (gg, W, H) => { gg.fillStyle = '#9a6a42'; gg.fillRect(0, 0, W, H); const r = rng(5); for (let i = 0; i < 120; i++) { gg.fillStyle = `rgba(${r() < 0.5 ? '60,35,20' : '200,160,110'},.4)`; gg.beginPath(); gg.arc(r() * W, r() * H, 3 + r() * 6, 0, 7); gg.fill(); } });
  const mk = (h, y, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(16, h, 7), mat); m.position.y = y; m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  const tm = (t) => new THREE.MeshToonMaterial({ map: t, gradientMap: toon('#fff').gradientMap });
  const rock = mk(4.2, -4.2, tm(rockTex)), soil = mk(1.6, -1.3, tm(soilTex)), grass = mk(0.5, -0.25, toon('#6fbf4a'));
  outline(grass, { px: 2.4 }); outline(soil, { px: 2.4 }); outline(rock, { px: 3 });
  const lab = canvasTex(512, 128, (gg, W, H) => { gg.font = '700 86px Fredoka, sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.lineWidth = 16; gg.strokeStyle = '#20161a'; gg.strokeText('BEDROCK', W / 2, H / 2 + 4); gg.fillStyle = '#ffd25a'; gg.fillText('BEDROCK', W / 2, H / 2 + 4); });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: lab, transparent: true })); label.position.set(0, -4.4, 3.52); g.add(label);
  // bolts holding the label rock — tiny comedy detail
  return { group: g, rock, soil, grass, label };
}
export function house(o = {}) { const { c = '#e8b48a' } = o; const g = new THREE.Group(); const b = building({ w: 3, h: 2.6, d: 2.6, col: c }); b.position.z = 1.3; g.add(b); const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 2.3, 1.6, 4), toon('#c0503a')); roof.rotation.y = Math.PI / 4; roof.position.y = 3.6; roof.scale.set(1.0, 1, 0.85); roof.castShadow = true; const rg = new THREE.Group(); rg.add(roof); outline(rg, { px: 2.4 }); g.add(rg); return g; }
export { lerp, clamp, ease, prog, rng, noise, MUSTARD };
