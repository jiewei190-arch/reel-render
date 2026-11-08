// shared helpers for "The Year a Whole City Couldn't Stop Dancing" (dancing-plague). Underscore = not auto-loaded.
// A small 1518 Strasbourg street (half-timbered houses, cobbles, red-sandstone cathedral spire), bean townsfolk,
// a jig() dance pose, a wooden stage, musicians, signs and 2D tags.
import { E, wordTime, text, ease, prog, clamp, lerp, rng, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, canvasTex, outline, rbox, box, cyl, ball, blob, INK } from '/kits/toon3d/toon.js';
import { bean, POSE, addPose, mixPose, idle } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
export { THREE };

export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
// dark pill tag with gold text (top of frame, clear of the caption zone)
export function tag(g, str, k = 1, y = 0.14, o = {}) { if (k <= 0) return; const sz = o.size || 54; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W * (o.x ?? 0.5), E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 ${sz}px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -sz * 0.78, w, sz * 1.56, sz * 0.78); g.fill(); text(g, str, 0, 2, { size: sz, color: o.color || '#ffd25a', weight: 700 }); g.restore(); }

// ---------------------------------------------------------------------------------------------
// half-timbered house: plaster front with dark beams + windows (canvas texture), gable facing the street (+Z)
const _tx = new Map();
function frontTex(color, beam, seed, floors) {
  const k = `${color}${beam}${seed}${floors}`; if (_tx.has(k)) return _tx.get(k);
  const t = canvasTex(256, 64 * floors * 2, (g, W, H) => {
    const r = rng(seed); g.fillStyle = color; g.fillRect(0, 0, W, H);
    g.fillStyle = beam; const fh = H / floors, b = 9;
    for (let f = 0; f < floors; f++) { const y0 = f * fh;
      g.fillRect(0, y0, W, b); g.fillRect(0, y0 + fh - b, W, b);
      for (const x of [0, W / 3, (2 * W) / 3, W - b]) g.fillRect(x, y0, b, fh);
      g.lineWidth = b; g.strokeStyle = beam;
      for (let i = 0; i < 3; i++) { const x0 = (i * W) / 3; if ((i + f + seed) % 2) { g.beginPath(); g.moveTo(x0, y0 + fh); g.lineTo(x0 + W / 3, y0); g.stroke(); } else if (f < floors - 1 || i !== 1) { g.beginPath(); g.moveTo(x0, y0 + fh * 0.55); g.lineTo(x0 + W / 6, y0 + fh); g.moveTo(x0 + W / 3, y0 + fh * 0.55); g.lineTo(x0 + W / 6, y0 + fh); g.stroke(); } }
      // windows: dark glass with a warm glint, shutters
      if (f < floors - 1 || floors === 1) for (let i = 0; i < 3; i++) { if (r() < 0.25) continue; const cx = (i + 0.5) * W / 3, cy = y0 + fh * 0.38; g.fillStyle = '#2a2430'; g.fillRect(cx - 17, cy - 20, 34, 38); g.fillStyle = 'rgba(255,220,150,.35)'; g.fillRect(cx - 13, cy - 16, 10, 12); g.fillStyle = shadeC(beam, 0.25); g.fillRect(cx - 30, cy - 20, 11, 38); g.fillRect(cx + 19, cy - 20, 11, 38); g.fillStyle = beam; }
    }
  }); _tx.set(k, t); return t;
}
const shadeC = (hex, k) => { const c = new THREE.Color(hex); c.lerp(new THREE.Color(k < 0 ? 0 : 0xffffff), Math.abs(k)); return '#' + c.getHexString(); };
export function house(o = {}) {
  const { w = 4, h = 6, d = 4, color = '#efe2c6', beam = '#5a3424', roof = '#a8432e', seed = 1, door = true, doorColor = '#6a3a22' } = o;
  const g = new THREE.Group(); const floors = Math.max(2, Math.round(h / 2.4));
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [toon(shadeC(color, -0.1)), toon(shadeC(color, -0.1)), toon(color), toon(color), PR.texMat(frontTex(color, beam, seed, floors)), toon(color)]);
  wall.position.set(0, h / 2, -d / 2); wall.castShadow = wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  // stone ground floor band
  const base = box(w + 0.06, 0.6, d + 0.06, '#9a8a78', 0, 0.3, -d / 2); base.userData.noOutline = true; g.add(base);
  // gable: triangular prism of plaster + steep roof planes
  const gh = w * 0.75; const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, gh); sh.closePath();
  const gab = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }), toon(color)); gab.position.set(0, h, -d); gab.castShadow = true; gab.userData.noOutline = true; g.add(gab);
  const gbeam = box(0.12, gh * 0.8, 0.05, beam, 0, h + gh * 0.4, 0.01); gbeam.userData.noOutline = true; g.add(gbeam);
  const gw = box(0.5, 0.55, 0.05, '#2a2430', 0, h + gh * 0.33, 0.02); gw.userData.noOutline = true; g.add(gw);
  const sl = Math.hypot(w / 2, gh) + 0.3, ang = Math.atan2(gh, w / 2);
  for (const s of [-1, 1]) { const rp = new THREE.Mesh(new THREE.BoxGeometry(sl, 0.16, d + 0.5), PR.texMat(PR.TEX.roof(roof, [1, 3]))); rp.position.set(s * w / 4, h + gh / 2 + 0.08, -d / 2 + 0.1); rp.rotation.z = -s * ang; rp.castShadow = true; g.add(rp); }
  if (door) { g.add(rbox(1.0, 1.9, 0.12, doorColor, -w * 0.22, 0.95, 0.03, 0.04)); g.add(ball(0.05, '#c9a14a', -w * 0.22 + 0.3, 0.95, 0.11, 8)); }
  outline(g, { px: 2.2 });
  g.at = (x = 0, y = 0, z = 0, ry = 0) => { g.position.set(x, y, z); g.rotation.y = ry; return g; }; return g;
}
// Strasbourg cathedral (simplified, red sandstone): a tall west tower with a single spire
export function cathedral() {
  const g = new THREE.Group(); const c = '#c48a78', dk = '#a8705f';
  g.add(rbox(9, 12, 5, c, 0, 6, 0, 0.1), rbox(3.4, 22, 3.4, c, 1.6, 11, 0.4, 0.1));
  const rose = cyl(1.4, 1.4, 0.2, dk, -1.6, 8.5, 2.55, 24); rose.rotation.x = Math.PI / 2; g.add(rose);
  const sp = new THREE.Mesh(new THREE.ConeGeometry(1.5, 9, 8), toon(dk)); sp.position.set(1.6, 26.5, 0.4); sp.castShadow = true; g.add(sp);
  for (const x of [-3, -1, 1, 3]) g.add(rbox(0.7, 4, 0.2, '#5a3a3a', x * 0.9 - 1, 3.5, 2.55, 0.1));
  outline(g, { px: 2.2 }); g.at = (x, y, z) => { g.position.set(x, y, z); return g; }; return g;
}
// bunting string between two points
export function bunting(a, b, n = 12, seed = 3) {
  const g = new THREE.Group(); const cols = ['#d8423a', '#f0c04a', '#3f7ab8', '#f4efe2', '#5a9a4a']; const r = rng(seed);
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  for (let i = 0; i <= n; i++) { const k = i / n; const p = A.clone().lerp(B, k); p.y -= Math.sin(k * Math.PI) * 0.8;
    if (i < n) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 3), toon(cols[Math.floor(r() * cols.length)])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -0.22, 0)); g.add(f); } }
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, A.distanceTo(B), 4), toon('#4a3a2a')); line.position.copy(A.clone().lerp(B, 0.5)); line.position.y -= 0.4; line.lookAt(B.x, B.y - 0.4, B.z); line.rotateX(Math.PI / 2); g.add(line);
  outline(g, { px: 1.6 }); return g;
}

// THE STREET. A cobbled lane along Z (camera at +Z looking -Z), houses both sides, the cathedral at the end.
// o: { light, bunting, stall, seed, dusk, bg, fog }  spots: centre at [0, 0]
export function street(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'day', fov: 40, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0], ...(o.stage || {}) });
  const g = new THREE.Group(); st.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 80), PR.texMat(PR.TEX.cobble('#b0a088', [4, 34]))); fl.rotation.x = -Math.PI / 2; fl.position.z = -20; fl.receiveShadow = true; fl.userData.noOutline = true; g.add(fl);
  const cols = ['#efe2c6', '#f2d7b0', '#e8c9a8', '#f4ead6', '#e6d0b8', '#ecdcc0'], roofs = ['#a8432e', '#8a3a2a', '#b5543a', '#7a3a32'], beams = ['#5a3424', '#4a2c20', '#6a3a26'];
  let i = 0;
  for (const s of [-1, 1]) for (let z = 3; z > -34; z -= 4.2) { const hh = 5.2 + ((i * 7) % 3) * 1.1; g.add(house({ w: 4.2, h: hh, d: 4, color: cols[i % cols.length], roof: roofs[i % roofs.length], beam: beams[i % beams.length], seed: i + (o.seed || 0), door: (i % 2) === 0 }).at(s * 6.6, 0, z, -s * Math.PI / 2)); i++; }
  g.add(cathedral().at(-1.5, 0, -46));
  if (o.bunting !== false) for (const z of [-2, -9, -16]) g.add(bunting([-4.5, 5.2, z], [4.5, 5.0, z - 0.5], 12, Math.abs(z)));
  if (o.props !== false) { g.add(PR.barrel().at(-3.8, 0, 1.0), PR.barrel({ color: '#7a4a2a' }).at(-3.3, 0, 1.6), PR.crate().at(3.9, 0, -3.5, 0.3), PR.cart().at(3.4, 0, -12, 0.3)); }
  if (o.stall) g.add(PR.stall({ seed: 4 }).at(3.4, 0, 0.2, -Math.PI / 2));
  return { stage: st, group: g, update() {} };
}
export const LIGHTS = {
  morning: { light: 'day', bg: ['#9cc4ea', '#f2e6d0'] },
  noon: { light: 'warm', bg: ['#a9cdef', '#f0e8d8'] },
  dusk: { light: 'dusk' },
  eerie: { light: 'dusk', bg: ['#2e2a4a', '#6a4a6a', '#b07a6a'], ambient: 0.85, exposure: 0.95 },
};

// ---------------------------------------------------------------------------------------------
// 1518 townsfolk (original characters). i picks the look.
const SK = ['fair', 'light', 'tan', 'olive', 'fair', 'brown'];
const MAIN = ['#6a8aa8', '#a85a3a', '#7a8a4a', '#8a6a9a', '#b8893a', '#4a6a5a', '#9a4a4a', '#5a5a7a'];
export function townsfolk(i = 0, o = {}) {
  const r = rng(i * 13 + 5); const woman = i % 2 === 1; const c = MAIN[i % MAIN.length];
  if (woman) return bean({ name: 'Townswoman', outfit: 'tunic', colors: { main: c, legs: shadeC(c, -0.25), belt: '#4a3020', feet: '#4a3020' }, skin: SK[i % SK.length], hair: 'bun', hairColor: ['#6a4428', '#3a2618', '#a8743a'][i % 3], head: r() < 0.6 ? 'hood' : 'none', headColor: '#f2ede0', seed: 300 + i, ...o });
  return bean({ name: 'Townsman', outfit: 'tunic', colors: { main: c, legs: ['#4a3a2a', '#5a4a3a', '#3a3a4a'][i % 3], belt: '#3a2618', feet: '#3a2618' }, skin: SK[(i + 2) % SK.length], hair: ['bowl', 'curly', 'horseshoe', 'messy'][i % 4], hairColor: ['#3a2618', '#6a4428', '#1e1612', '#8a5a2a'][(i >> 1) % 4], beard: r() < 0.3, head: r() < 0.35 ? 'cap' : 'none', headColor: ['#7a2a2a', '#3a4a6a', '#5a4a2a'][i % 3], seed: 300 + i, ...o });
}
// Frau Troffea: an original character (no portrait exists): red-brown dress, white coif, apron
export const troffea = () => bean({ name: 'Frau Troffea', outfit: 'tunic', colors: { main: '#b8473a', legs: '#9a3a30', belt: '#f2ede0', feet: '#4a3020' }, skin: 'fair', hair: 'bun', hairColor: '#7a4a2a', head: 'hood', headColor: '#f6f2e8', seed: 77 });
// the physician: long black robe, red cap
export const physician = () => bean({ name: 'Physician', outfit: 'robe', colors: { main: '#2a2a36', trim: '#c9a14a', legs: '#2a2a36', feet: '#1e1a18' }, skin: 'light', hair: 'horseshoe', hairColor: '#cfcac0', beard: true, beardColor: '#cfcac0', head: 'cap', headColor: '#9a2a2a', seed: 88 });
// a council official: red robe with gold band, black cap
export const official = () => bean({ name: 'Councillor', outfit: 'robe', colors: { main: '#9a2a2a', trim: '#e8c25a', legs: '#9a2a2a', feet: '#2a1a14' }, skin: 'fair', hair: 'bald', head: 'cap', headColor: '#1e1a22', moustache: '#6a4a2a', seed: 99 });
export const musician = (i = 0) => bean({ name: 'Musician', outfit: 'striped', colors: { main: ['#e8c25a', '#d8423a', '#3f7ab8', '#5a9a4a'][i % 4], stripe: ['#a8432e', '#f4efe2', '#f0c04a', '#f4efe2'][i % 4], legs: '#3a2a3a' }, skin: ['tan', 'fair', 'olive', 'light'][i % 4], hair: ['curly', 'bowl', 'messy', 'swoop'][i % 4], hairColor: '#4a2e1e', head: i % 2 ? 'cap' : 'none', headColor: '#2a6a4a', seed: 400 + i });

// ---------------------------------------------------------------------------------------------
// the dance: a bouncy medieval jig. e = energy 0..1 (0 = standing), ph = phase offset, tired = droopier arms
export function jig(t, ph = 0, e = 1, o = {}) {
  const f = o.speed || 2.1; const a = (t + ph) * f * Math.PI * 2; const s = Math.sin(a), c = Math.cos(a), s2 = Math.abs(Math.sin(a));
  const up = o.tired ? 0.55 : 1;
  const p = {
    armL: [0.4 + 0.5 * s * up, 1.2 * up + 0.5 * c * up, 0.3], armR: [0.4 - 0.5 * s * up, 1.2 * up - 0.5 * c * up, 0.3], elbowL: 0.9 + 0.4 * c, elbowR: 0.9 - 0.4 * c,
    legL: [Math.max(0, s) * 0.75, 0.08 + Math.max(0, s) * 0.2], kneeL: Math.max(0, s) * 1.2, legR: [Math.max(0, -s) * 0.75, 0.08 + Math.max(0, -s) * 0.2], kneeR: Math.max(0, -s) * 1.2,
    bob: s2 * 0.14, side: c * 0.12, twist: s * 0.25, headTilt: -c * 0.15, headTurn: s * 0.1, lean: 0.04,
  };
  return mixPose(addPose(POSE.stand, idle(t, ph * 3)), p, e);
}
// dancer: places a bean, rotates it to face a point, applies jig + spin
export function dance(b, t, ph = 0, e = 1, o = {}) { b.pose(jig(t, ph, e, o)); if (o.spin) b.rotation.y = (b.rot0 ?? 0) + Math.sin((t + ph) * 1.3) * o.spin; }
// a crowd of dancers in area [x0, x1, z0, z1] (seeded), facing roughly +Z
export function crowd(st, n, area, seed = 1, o = {}) {
  const r = rng(seed); const out = [];
  for (let i = 0; i < n; i++) { const b = townsfolk(seed * 7 + i, o); b.position.set(lerp(area[0], area[1], r()), 0, lerp(area[2], area[3], r())); b.rot0 = b.rotation.y = (r() - 0.5) * 1.2; b.ph = r() * 3; b.spd = 1.8 + r() * 0.7; st.add(b); out.push(b); }
  return out;
}

// ---------------------------------------------------------------------------------------------
// props: wooden stage, instruments, sign, bread basket
export function stagePlatform(o = {}) {
  const { w = 5, d = 3, h = 1.0 } = o; const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), PR.texMat(PR.TEX.planks('#a8743a', [3, 1], 10))); top.position.y = h; top.castShadow = top.receiveShadow = true; g.add(top);
  g.add(rbox(w, h - 0.05, 0.1, '#7a5030', 0, h / 2, d / 2 - 0.05, 0.02));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(rbox(0.2, h, 0.2, '#6a4228', sx * (w / 2 - 0.15), h / 2, sz * (d / 2 - 0.15), 0.03));
  // little banner flags on poles
  for (const sx of [-1, 1]) { g.add(cyl(0.04, 0.04, 2.6, '#6a4228', sx * (w / 2 - 0.15), h + 1.3, -d / 2 + 0.15, 8)); const fl = rbox(0.7, 0.45, 0.03, sx < 0 ? '#d8423a' : '#f0c04a', sx * (w / 2 - 0.15) + sx * -0.38, h + 2.35, -d / 2 + 0.15, 0.02); g.add(fl); }
  outline(g, { px: 2.4 }); g.add(blob(Math.max(w, d) * 0.55, 0.25)); g.top = h + 0.09; return g;
}
export function drum() { const g = new THREE.Group(); g.add(cyl(0.26, 0.26, 0.36, '#b5543a', 0, 0, 0, 18), cyl(0.27, 0.27, 0.04, '#f2e6cc', 0, 0.19, 0, 18), cyl(0.27, 0.27, 0.04, '#f2e6cc', 0, -0.19, 0, 18)); g.rotation.x = 0.4; outline(g, { px: 2 }); return g; }
export function pipe() { const g = new THREE.Group(); g.add(cyl(0.035, 0.06, 0.7, '#8a5a2a', 0, 0, 0, 10)); outline(g, { px: 2 }); return g; }
export function fiddle() { const g = new THREE.Group(); const b = ball(0.2, '#a8602a', 0, 0, 0, 16); b.scale.set(0.8, 1.2, 0.35); g.add(b, rbox(0.06, 0.45, 0.05, '#4a2a18', 0, 0.38, 0, 0.02)); outline(g, { px: 2 }); return g; }
export function horn() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 16, 1, true), toon('#d8b04a', { side: THREE.DoubleSide })); c.rotation.x = Math.PI / 2; c.position.z = 0.4; g.add(c); outline(g, { px: 2 }); return g; }
export function sign(lines, o = {}) {
  const { w = 1.6, h = 1.0, bg = '#efe3c4', fg = '#7a1a1a', post = 2.4 } = o; const g = new THREE.Group();
  const tx = canvasTex(512, Math.round(512 * h / w), (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = '#6a4228'; c.lineWidth = 16; c.strokeRect(8, 8, W - 16, H - 16); c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; const fs = Math.min(110, H / (lines.length + 0.6)); c.font = `700 ${fs}px Fredoka, sans-serif`; lines.forEach((l, i) => c.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.05)); });
  const board = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), [toon('#6a4228'), toon('#6a4228'), toon('#6a4228'), toon('#6a4228'), PR.texMat(tx), toon('#6a4228')]); board.position.y = post; board.castShadow = true; g.add(board);
  g.add(cyl(0.05, 0.05, post, '#6a4228', 0, post / 2 - h / 2, -0.05, 8)); outline(g, { px: 2.4 }); return g;
}
export function basket(o = {}) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.32, 16, 1, true), toon('#b8894a', { side: THREE.DoubleSide })); b.position.y = 0.16; b.castShadow = true; g.add(b, cyl(0.32, 0.32, 0.02, '#8a6a3a', 0, 0.02, 0, 16)); if (o.crumbs) for (let i = 0; i < 3; i++) g.add(ball(0.04, '#d8a860', -0.1 + i * 0.1, 0.06, 0.05 * i, 6)); outline(g, { px: 2.2 }); return g; }
// little sweat drop / steam puff sprite-ish meshes
export function steam(n = 5) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const p = ball(0.12, '#f4f4f4', 0, 0, 0, 10); p.material = toon('#f4f4f4', { transparent: true, opacity: 0.85 }); p.userData.noOutline = true; g.add(p); } g.update = (t, k = 1) => g.children.forEach((p, i) => { const u = ((t * 0.9 + i / n) % 1); p.position.set(Math.sin(i * 2.3 + u * 3) * 0.25, u * 1.0, 0); p.scale.setScalar((0.5 + u) * k); p.material.opacity = 0.85 * (1 - u) * k; }); return g; }
