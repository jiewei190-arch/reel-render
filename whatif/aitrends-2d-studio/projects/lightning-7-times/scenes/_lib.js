// Struck by Lightning 7 Times (Roy Sullivan) — shared assets: the ranger (uniform + campaign hat), a stormy meadow,
// the park sign, a mountain road with a cliff edge + the kit truck, a fishing pond, a front yard with a power pole,
// a record certificate on a wall. 2D: cartoon lightning bolts, a storm cloud with eyes, top hook caption, stamps.
// Tone guard: WTF/comedy. Every zap is a cartoon zap: he is always fine (glow, frizzed hair, a smoke puff, a deadpan face).
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { project } from '/kits/toon3d/react.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// ---------------------------------------------------------------- RANGER
// campaign hat ("Smokey" style): flat wide brim, tall crown with four pinches, dark band
function campaignHat(color = '#a8865a') {
  const g = new THREE.Group(); const R = 0.48;
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.7, R * 1.7, R * 0.06, 36), toon(color)); brim.castShadow = true; g.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.32, R * 0.86, R * 0.95, 4, 1), toon(color)); crown.rotation.y = Math.PI / 4; crown.position.y = R * 0.48; crown.castShadow = true; g.add(crown);
  const top = new THREE.Mesh(new THREE.SphereGeometry(R * 0.36, 12, 8), toon(color)); top.scale.set(1, 0.45, 1); top.position.y = R * 0.92; g.add(top);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.83, R * 0.88, R * 0.14, 4, 1), toon('#4a3a26')); band.rotation.y = Math.PI / 4; band.position.y = R * 0.1; g.add(band);
  outline(g, { px: 3 }); return g;
}
export function ranger(o = {}) {
  const b = bean({ name: 'Roy', outfit: 'uniform', colors: { main: '#b9ae8a', trim: '#5a6a3a', belt: '#3a2a1a', legsTop: '#4f5e3a' }, skin: 'fair', hair: 'swoop', hairColor: '#5a4a3a', browColor: '#3a2a20', seed: o.seed || 7 });
  const hat = campaignHat(); hat.position.set(0, 0.48 * 0.62, 0); hat.rotation.x = -0.06; b.parts.head.add(hat); b.hat = hat;
  // frizz: spiky hair puffs that grow after a zap (.frizz(k))
  const fz = new THREE.Group(); const r = rng(5);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 6), toon('#4a3a2e')); sp.position.set(Math.cos(a) * 0.4, 0.3 + r() * 0.08, Math.sin(a) * 0.4); sp.lookAt(Math.cos(a) * 2, 1.6, Math.sin(a) * 2); sp.rotateX(Math.PI / 2); fz.add(sp); }
  outline(fz, { px: 2.4 }); fz.visible = false; b.parts.head.add(fz);
  b.frizz = (k) => { fz.visible = k > 0.02; fz.scale.setScalar(Math.max(0.01, k)); };
  return b;
}
export function tourist(i) {
  const cols = ['#e2603a', '#3f8fc8', '#e8c040', '#7ab85a'];
  return bean({ name: 'T' + i, outfit: 'tee', colors: { main: cols[i % 4], print: '#ffffff' }, skin: ['light', 'tan', 'brown', 'olive'][i % 4], hair: ['bob', 'messy', 'curly', 'spiky'][i % 4], hairColor: ['#3a2a1a', '#8a5a2a', '#1a1a1a', '#c8a060'][i % 4], head: i === 1 ? 'ballcap' : 'none', headColor: '#2a4a8a', scale: i >= 2 ? 0.72 : 1, seed: 30 + i });
}

// ---------------------------------------------------------------- SETS
export const STORM_BG = ['#2e3452', '#59607e', '#9a9a9a'];
export function stormStage(T, o = {}) {
  return toonStage(T, { light: 'day', bg: o.bg || STORM_BG, ambient: 1.05, exposure: 1.05, fov: 40, shadowSize: 10, target: [0, 1, 0], key: ['#e8eeff', 2.0, [-5, 12, 7]], ...o });
}
function trees(g, list) { list.forEach(([x, z, s], i) => { const t = PR.gumTree({ s: s || 1, seed: 3 + i }); t.position.set(x, 0, z); g.add(t); }); }
function mountains(g, z = -40, col = '#5a6a8a') { const r = rng(11); for (let i = 0; i < 9; i++) { const h = 8 + r() * 10; const m = new THREE.Mesh(new THREE.ConeGeometry(7 + r() * 5, h, 7), toon(i % 2 ? col : shadeHex(col, 0.12))); m.position.set(-36 + i * 9, h / 2 - 1, z - r() * 8); m.userData.noOutline = true; g.add(m); } }
export function meadow(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(120, 120, o.grass || '#6f9a4a', 0, -30));
  mountains(g, -45, '#4d5878');
  trees(g, o.trees || [[-6, -6, 1.1], [6.5, -8, 1.2], [-10, -14, 1.3], [11, -16, 1.1], [2, -18, 1.0]]);
  return { group: g };
}
export function parkSign() {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) g.add(cyl(0.12, 0.13, 2.2, '#5a3a22', sx * 1.4, 1.1, 0, 8));
  const t = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#5a3a22'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8dcb0'; x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28); x.fillStyle = '#efe4c0'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 74px "Nunito", sans-serif'; x.fillText('SHENANDOAH', w / 2, h * 0.4); x.font = '800 40px "Nunito", sans-serif'; x.fillText('NATIONAL PARK', w / 2, h * 0.7); });
  g.add(rbox(3.3, 1.65, 0.16, '#5a3a22', 0, 2.0, 0, 0.04));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 1.55), toon('#ffffff', { map: t })); face.position.set(0, 2.0, 0.09); face.userData.noOutline = true; g.add(face);
  g.add(blob(1.6, 0.25)); outline(g, { px: 2.4 }); return g;
}
// mountain road: the road runs along X; the ground ends at a cliff edge at z = -edgeZ (a drop with a valley far below)
export function cliffRoad(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const edgeZ = o.edgeZ ?? 5;
  const top = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 40), toon('#6f9a4a')); top.position.set(0, -1, edgeZ - 20); top.receiveShadow = true; top.userData.noOutline = true; g.add(top);
  const face = new THREE.Mesh(new THREE.BoxGeometry(120, 30, 1), toon('#8a7a66')); face.position.set(0, -16, edgeZ + 0.5); face.userData.noOutline = true; g.add(face);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(120, 3.2), toon('#5a5a5e')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, o.roadZ ?? 0); road.receiveShadow = true; road.userData.noOutline = true; g.add(road);
  for (let x = -60; x < 60; x += 3) { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.14), flat('#f2e2a0')); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.02, o.roadZ ?? 0); d.userData.noOutline = true; g.add(d); }
  const valley = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), toon('#4f7a46')); valley.rotation.x = -Math.PI / 2; valley.position.set(0, -30, edgeZ + 150); valley.userData.noOutline = true; g.add(valley);
  mountains(g, -40, '#4d5878');
  trees(g, o.trees || [[-8, -5, 1.1], [-3, -7, 1.0], [5, -6, 1.2], [10, -9, 1.1]]);
  return { group: g, edgeZ };
}
export function pond(st) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(80, 80, '#6f9a4a', 0, -20));
  const w = new THREE.Mesh(new THREE.CircleGeometry(4.5, 40), toon('#3f7fb0')); w.rotation.x = -Math.PI / 2; w.position.set(0, 0.02, -4); w.scale.set(1.6, 1, 1); w.userData.noOutline = true; g.add(w);
  const r = rng(4); for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2; const rk = ball(0.25 + r() * 0.25, '#8a8a84', Math.cos(a) * 7.2, 0.1, -4 + Math.sin(a) * 4.6, 8); rk.scale.y = 0.6; g.add(rk); }
  mountains(g, -45, '#4d5878'); trees(g, [[-9, -10, 1.2], [8, -12, 1.1], [-3, -15, 1.0], [12, -6, 1.2]]);
  outline(g, { px: 2 }); return { group: g, water: w };
}
export function rod() {
  const g = new THREE.Group(); const p = cyl(0.025, 0.04, 2.6, '#6a4a2a', 0, 1.3, 0, 6); g.add(p);
  const reel = cyl(0.09, 0.09, 0.08, '#888', 0.06, 0.4, 0, 10); reel.rotation.z = Math.PI / 2; g.add(reel);
  outline(g, { px: 2 }); g.tipY = 2.6; return g;
}
export function yard(st) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(80, 80, '#6f9a4a', 0, -20));
  const h = PR.facade({ w: 6, h: 3.6, d: 4, color: '#e8dcc0', trim: '#7a3a2a', shop: false, windows: 2 }); h.position.set(-1.5, 0, -4); g.add(h);
  const fn = PR.fence({ len: 14 }); fn.position.set(0, 0, 2.5); g.add(fn);
  // power pole + transformer can
  const pole = new THREE.Group(); pole.add(cyl(0.14, 0.17, 7, '#6a4a32', 0, 3.5, 0, 8)); const arm = rbox(2.4, 0.16, 0.16, '#6a4a32', 0, 6.4, 0, 0.03); pole.add(arm);
  const can = cyl(0.36, 0.36, 0.9, '#8a8f96', 0.45, 5.3, 0.2, 14); pole.add(can); pole.can = can; outline(pole, { px: 2.4 });
  pole.position.set(3.8, 0, -1.6); g.add(pole);
  trees(g, [[-8, -8, 1.2], [8, -10, 1.1]]);
  return { group: g, pole };
}
export function certificateWall(st) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(30, 20, '#8a6a4a', 0, -2));
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), PR.texMat(PR.TEX.plaster('#d8ccb0', [3, 1]))); wall.position.set(0, 6, -3); wall.userData.noOutline = true; g.add(wall);
  const t = canvasTex(640, 480, (x, w, h) => {
    x.fillStyle = '#fbf3dc'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c9a24a'; x.lineWidth = 14; x.strokeRect(18, 18, w - 36, h - 36); x.lineWidth = 3; x.strokeRect(36, 36, w - 72, h - 72);
    x.fillStyle = '#2a1c15'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 70px "Nunito", sans-serif'; x.fillText('WORLD RECORD', w / 2, 110);
    x.font = '800 38px "Nunito", sans-serif'; x.fillText('MOST LIGHTNING STRIKES', w / 2, 190); x.fillText('SURVIVED', w / 2, 235);
    x.fillStyle = '#c8382c'; x.font = '900 120px "Nunito", sans-serif'; x.fillText('7', w / 2, 340);
    x.fillStyle = '#c9a24a'; x.beginPath(); x.arc(w - 110, h - 100, 44, 0, 7); x.fill();
  });
  const frame = rbox(2.9, 2.25, 0.12, '#6a4628', 0, 3.1, -2.9, 0.04); g.add(frame);
  const cert = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.95), toon('#ffffff', { map: t })); cert.position.set(0, 3.1, -2.83); cert.userData.noOutline = true; g.add(cert);
  const hook = cyl(0.04, 0.04, 0.3, '#3a2a1a', -2.4, 3.5, -2.85, 6); hook.rotation.x = Math.PI / 2; g.add(hook);
  outline(frame, { px: 2.2 });
  return { group: g };
}

// ---------------------------------------------------------------- 2D: LIGHTNING + CLOUD
// jagged cartoon bolt from (x0,y0) to (x1,y1); flickers (new shape every 1/12 s); k = 0..1 grows the bolt from the top
export function bolt(g, x0, y0, x1, y1, o = {}) {
  const t = o.t ?? 0, w = o.w ?? 1, k = o.k ?? 1; if (k <= 0) return;
  const r = rng((o.seed ?? 1) * 97 + Math.floor(t * 12)); const n = o.n ?? 9; const pts = [[x0, y0]];
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let i = 1; i < n; i++) { const f = i / n; const off = (r() - 0.5) * len * 0.16 * (1 - Math.abs(f - 0.5)); pts.push([x0 + dx * f + nx * off, y0 + dy * f + ny * off]); }
  pts.push([x1, y1]);
  const m = Math.max(1, Math.ceil(pts.length * k)); const P = pts.slice(0, m + 1);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha(o.glow || '#8fc8ff', 0.35); g.lineWidth = 70 * w; path(g, P); g.stroke();
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = CARD_INK; g.lineWidth = 30 * w; path(g, P); g.stroke();
  g.strokeStyle = o.color || '#ffe45a'; g.lineWidth = 19 * w; path(g, P); g.stroke();
  g.strokeStyle = '#ffffff'; g.lineWidth = 7 * w; path(g, P); g.stroke();
  // a branch
  if (o.branch !== false && P.length > 4) { const b0 = P[3]; const B = [b0, [b0[0] + nx * len * 0.12 + dx * 0.08, b0[1] + ny * len * 0.12 + dy * 0.08], [b0[0] + nx * len * 0.16 + dx * 0.16, b0[1] + ny * len * 0.1 + dy * 0.2]];
    g.strokeStyle = CARD_INK; g.lineWidth = 16 * w; path(g, B); g.stroke(); g.strokeStyle = o.color || '#ffe45a'; g.lineWidth = 9 * w; path(g, B); g.stroke(); }
  g.restore();
  if (k >= 1 && o.impact !== false) impact(g, x1, y1, t, w);
}
function path(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); }
// cartoon impact star at a point
export function impact(g, x, y, t, w = 1) {
  const s = (90 + 20 * Math.sin(t * 40)) * w;
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, s * 2.2); gr.addColorStop(0, 'rgba(255,250,200,.85)'); gr.addColorStop(1, 'rgba(255,240,150,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, s * 2.2, 0, 7); g.fill(); g.restore();
  g.save(); g.translate(x, y); g.rotate(t * 3); g.fillStyle = '#fff6b0'; g.strokeStyle = CARD_INK; g.lineWidth = 6 * w; g.beginPath();
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = i % 2 ? s * 0.45 : s; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore();
}
// crackle sparks around a point (after a zap)
export function sparks(g, x, y, t, r = 120, seed = 3) {
  const R = rng(seed + Math.floor(t * 14)); g.save(); g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const a = R() * Math.PI * 2, d = r * (0.7 + R() * 0.5); const x0 = x + Math.cos(a) * d * 0.6, y0 = y + Math.sin(a) * d * 0.6;
    const P = [[x0, y0], [x0 + Math.cos(a + 0.6) * 28, y0 + Math.sin(a + 0.6) * 28], [x0 + Math.cos(a) * 52, y0 + Math.sin(a) * 52]];
    g.strokeStyle = CARD_INK; g.lineWidth = 11; path(g, P); g.stroke(); g.strokeStyle = '#ffe45a'; g.lineWidth = 6; path(g, P); g.stroke(); }
  g.restore();
}
// smoke puff (soft grey balls rising)
export function puff(g, x, y, t, s = 1) {
  if (t < 0) return; g.save();
  for (let i = 0; i < 5; i++) { const k = clamp(t / 1.4); const px = x + Math.sin(i * 2.1 + t) * 40 * s, py = y - (40 + i * 26) * s - k * 120 * s, r = (34 + i * 8) * s * (0.6 + k * 0.6);
    g.fillStyle = `rgba(90,90,96,${0.75 * (1 - k)})`; g.strokeStyle = `rgba(42,28,21,${0.6 * (1 - k)})`; g.lineWidth = 5; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); g.stroke(); }
  g.restore();
}
// cartoon storm cloud with eyes; o.look = [-1..1, -1..1], o.mood: 'side' | 'angry' | 'smug'
export function cloud(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const B = [[-170, 10, 95], [-80, -50, 120], [40, -70, 130], [150, -10, 100], [90, 50, 95], [-40, 55, 105], [210, 40, 70], [-220, 50, 65]];
  g.fillStyle = CARD_INK; for (const [bx, by, r] of B) { g.beginPath(); g.arc(bx, by + Math.sin(t * 2 + bx) * 4, r + 9, 0, 7); g.fill(); }
  g.fillStyle = o.color || '#5c6378'; for (const [bx, by, r] of B) { g.beginPath(); g.arc(bx, by + Math.sin(t * 2 + bx) * 4, r, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.12)'; for (const [bx, by, r] of B.slice(0, 4)) { g.beginPath(); g.arc(bx - r * 0.2, by - r * 0.3, r * 0.6, 0, 7); g.fill(); }
  if (o.eyes !== false) {
    const lk = o.look || [0.8, 0]; const mood = o.mood || 'side';
    for (const ex of [-60, 50]) {
      g.fillStyle = '#fff'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.ellipse(ex, -10, 34, 26, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = CARD_INK; g.beginPath(); g.arc(ex + lk[0] * 16, -10 + lk[1] * 10, 11, 0, 7); g.fill();
      // heavy lid
      g.fillStyle = o.color || '#5c6378'; g.beginPath(); g.ellipse(ex, -10, 36, 28, 0, Math.PI, 2 * Math.PI); g.lineTo(ex + 36, mood === 'angry' ? (ex < 0 ? -2 : -14) : -12); g.closePath(); g.fill();
      g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath();
      if (mood === 'angry') { g.moveTo(ex - 34, ex < 0 ? -36 : -20); g.lineTo(ex + 34, ex < 0 ? -20 : -36); } else { g.moveTo(ex - 34, -12); g.lineTo(ex + 34, -12); }
      g.stroke();
    }
    if (mood === 'smug') { g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.arc(0, 30, 30, 0.2, Math.PI - 0.2); g.stroke(); }
    if (mood === 'angry') { g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-26, 44); g.lineTo(26, 40); g.stroke(); }
  }
  g.restore();
}
// screen-space point of a world position
export const scr = (st, p) => project(st, p);

// ---------------------------------------------------------------- 2D OVERLAYS
export const TOP_CAPTION = ['and survived', 'all seven'];
export const TOP_UNTIL = 3.3;
export function topCaption(g, t, info) {
  const T = info.shot.start + t; if (T > TOP_UNTIL) return; const fade = clamp((TOP_UNTIL - T) / 0.2);
  const pulse = 1 + 0.03 * Math.sin(T * 8) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  TOP_CAPTION.forEach((l, i) => { g.save(); g.translate(E.W / 2, 168 + i * 100); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, 88, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
// a stamped label (pops in with overshoot)
export function stamp(g, t, text, x, y, o = {}) {
  if (t < 0) return; const k = ease.outBack(clamp(t / 0.25)); const a = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(k, k); g.rotate(o.rot ?? -0.05);
  const size = o.size || 96; g.font = `900 ${size}px "Nunito", sans-serif`; const w = g.measureText(text).width + size * 0.7, h = size * 1.3;
  if (o.box !== false) { g.fillStyle = o.bg || '#c8382c'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 22); g.fill(); g.stroke(); }
  insT(g, text, 0, size * 0.04, size, { color: o.color || '#ffffff', stroke: o.box === false ? CARD_INK : null });
  g.restore();
}
// darker stormy grade on top of a 3D frame
export function stormLook(g, a = 0.18) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(150,160,200,${a * 2})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex };
