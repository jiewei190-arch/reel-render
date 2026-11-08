// shared helpers for "What If You Went to Space Without a Suit?" (space-nosuit). Underscore = not auto-loaded.
// Sets: space() = station front wall (airlock hatch + porthole room) above the Earth; lab() = a 1966-style vacuum test chamber.
// No gore: no swelling, no injury. Danger = comic gasp, fizzing cartoon bubbles, eyes closing, a rescue.
import { E, wordTime, text, ease, prog, clamp, lerp, FONTS, rng } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, cyl, ball, torus, plane, floor, blob, INK } from '/kits/toon3d/toon.js';
import { bean, POSE, mixPose } from '/kits/toon3d/rig.js';
import { castMember, stopwatch } from '/kits/toon3d/cast.js';
import { glow } from '/kits/toon3d/fx.js';
export { THREE };

// shot-local time of a word (first match after the shot start), fallback fb
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };

// ---------- 2D overlays (logical units) ----------
export function tag(g, str, k = 1, y = 0.14, o = {}) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); const sz = o.size || 54; g.font = `700 ${sz}px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = o.bg || 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -sz * 0.78, w, sz * 1.56, sz * 0.78); g.fill(); text(g, str, 0, 2, { size: sz, color: o.color || '#ffd25a', weight: 700 }); if (o.strike) { g.strokeStyle = '#ff4a3a'; g.lineWidth = 9; g.lineCap = 'round'; const p = clamp(o.strike); g.beginPath(); g.moveTo(-w / 2 + 20, 8); g.lineTo(-w / 2 + 20 + (w - 40) * p, -8); g.stroke(); } g.restore(); }
// big countdown dial (MINA's stopwatch in 2D): n = seconds left (float), k = appear
export function countdown(g, n, k = 1, y = 0.215, o = {}) {
  if (k <= 0) return; const r = (o.r || 118); const cx = E.W / 2, cy = E.H * y; const s = 0.7 + 0.3 * ease.outBack(clamp(k));
  g.save(); g.translate(cx, cy); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.fillStyle = '#d6d0c6'; g.beginPath(); g.roundRect(-26, -r - 46, 52, 40, 10); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  g.beginPath(); g.arc(0, 0, r + 14, 0, Math.PI * 2); g.fillStyle = '#c9c4bc'; g.fill(); g.stroke();
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = '#fbf8f2'; g.fill();
  const left = clamp(n / 10); const red = n <= 3.5;
  g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r - 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); g.closePath(); g.fillStyle = red ? 'rgba(230,60,50,.28)' : 'rgba(255,190,60,.30)'; g.fill();
  const shown = Math.max(0, Math.ceil(n - 0.001));
  const pulse = 1 + 0.08 * Math.max(0, Math.sin((n % 1) * Math.PI)) * (red ? 1.6 : 0.6);
  g.save(); g.scale(pulse, pulse); text(g, String(shown), 0, 6, { size: 118, color: red ? '#e8392e' : '#20161a', weight: 700 }); g.restore();
  g.restore();
}
// O2 meter (2D): level 0..1
export function o2meter(g, level, k = 1, y = 0.215) {
  if (k <= 0) return; const w = 520, h = 74; const cx = E.W / 2, cy = E.H * y; const s = 0.8 + 0.2 * ease.outBack(clamp(k));
  g.save(); g.translate(cx, cy); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.fillStyle = 'rgba(20,14,18,.85)'; g.beginPath(); g.roundRect(-w / 2 - 130, -h / 2 - 14, w + 160, h + 28, 30); g.fill();
  text(g, 'O₂', -w / 2 - 62, 4, { size: 58, color: '#ffffff', weight: 700 });
  g.fillStyle = '#3a3036'; g.beginPath(); g.roundRect(-w / 2 + 10, -h / 2 + 6, w - 20, h - 12, 18); g.fill();
  const L = clamp(level); g.fillStyle = L < 0.3 ? '#e8392e' : L < 0.6 ? '#f0a83a' : '#5ec46a'; g.beginPath(); g.roundRect(-w / 2 + 16, -h / 2 + 12, Math.max(1, (w - 32) * L), h - 24, 12); g.fill();
  g.restore();
}
// red subscribe pill
export function subPill(g, k, y = 0.135) { if (k <= 0) return; g.save(); const s = 0.75 + 0.25 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.6); g.font = `700 58px "${FONTS.title}"`; const w = g.measureText('SUBSCRIBE FOR MORE').width + 90; g.fillStyle = '#e8261f'; g.beginPath(); g.roundRect(-w / 2, -48, w, 96, 48); g.fill(); text(g, 'SUBSCRIBE FOR MORE', 0, 3, { size: 58, color: '#ffffff', weight: 700 }); g.restore(); }
// darken towards black from the edges (iris), a = 0..1
export function iris(g, a, cx = 0.5, cy = 0.42) { if (a <= 0) return; g.save(); const r = Math.max(E.W, E.H) * lerp(1.0, 0.0, a); const gr = g.createRadialGradient(E.W * cx, E.H * cy, Math.max(0, r * 0.35), E.W * cx, E.H * cy, Math.max(1, r)); gr.addColorStop(0, 'rgba(6,6,14,0)'); gr.addColorStop(1, `rgba(6,6,14,${clamp(a * 1.3)})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.fillStyle = `rgba(6,6,14,${clamp((a - 0.6) * 2.5)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
// air-rush lines (2D), k = 0..1 intensity, t time
export function airLines(g, t, k) { if (k <= 0) return; g.save(); g.strokeStyle = `rgba(255,255,255,${0.55 * k})`; g.lineCap = 'round'; const r = rng(5); for (let i = 0; i < 18; i++) { const y = E.H * (0.2 + r() * 0.5), sp = 900 + r() * 900, len = 120 + r() * 220; const x = ((r() * E.W + t * sp) % (E.W + len * 2)) - len; g.lineWidth = 5 + r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke(); } g.restore(); }

// ---------- cast ----------
export const hero = () => castMember('hero', { hood: 'up' });
export const dev = () => castMember('dev');
export const mina = () => castMember('mina');
export const lin = () => castMember('lin');
// the 1966 test volunteer (never named): white pressure suit, hood, glass bubble helmet
export function volunteer() {
  const b = bean({ name: 'Volunteer', outfit: 'uniform', colors: { main: '#e9e5dc', legsTop: '#d9d4ca', trim: '#c0c6cc', belt: '#8a9098' }, head: 'hood', headColor: '#e9e5dc', skin: 'fair', hair: 'bowl', hairColor: '#3a2a1e', seed: 230 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.78, 28, 20), new THREE.MeshToonMaterial({ color: new THREE.Color('#cfe8ff'), transparent: true, opacity: 0.22, depthWrite: false }));
  dome.userData.noOutline = true; dome.position.copy(b.parts.head.position); dome.position.y += 0.02; b.parts.head.parent.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.07, 10, 28), toon('#9aa2aa')); ring.rotation.x = Math.PI / 2; ring.position.copy(b.parts.head.position); ring.position.y -= 0.5; b.parts.head.parent.add(ring);
  // the hose (a coiled tube from the chest), .hose for the pop-off moment
  const hose = new THREE.Group(); const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.25, -0.2, 0.25), new THREE.Vector3(0.55, -0.5, 0.2), new THREE.Vector3(0.9, -0.7, -0.1)]), 20, 0.05, 8), toon('#5a646e')); hose.add(tube); hose.position.set(0.12, 1.55, 0.25); b.add(hose); outline(hose, { px: 2.4 });
  b.hose = hose; b.dome = dome; return b;
}
// float pose: arms out, legs bent, slow swim; k = flail amount
export function floatPose(t, k = 0.3, ph = 0) { const s = Math.sin(t * 2.2 + ph), c = Math.cos(t * 1.7 + ph); return { ...POSE.stand, armL: [0.35 + 0.25 * s * k, 1.1 + 0.4 * c * k, 0], armR: [0.35 - 0.25 * s * k, 1.1 - 0.4 * c * k, 0], elbowL: 0.6 + 0.3 * k * s, elbowR: 0.6 - 0.3 * k * s, legL: [0.45 + 0.35 * s * k, 0.14], legR: [-0.15 - 0.35 * s * k, 0.14], kneeL: 0.7, kneeR: 0.35, headNod: -0.05 }; }
// wrap a bean in a pivot at its belly so it can tumble
export function pivot(b, y = 1.3) { const p = new THREE.Group(); b.position.y = -y; p.add(b); p.bean = b; return p; }

// ---------- props ----------
let _earthTex = null;
function earthTex() { return (_earthTex ||= canvasTex(1024, 512, (g, W, H) => { g.fillStyle = '#2f74c8'; g.fillRect(0, 0, W, H); const r = rng(42);
  const blobs = (n, col, rx, ry, a = 1) => { g.fillStyle = col; g.globalAlpha = a; for (let i = 0; i < n; i++) { const x = r() * W, y = H * (0.18 + r() * 0.64); const k = 0.4 + r(); for (let j = 0; j < 7; j++) { g.beginPath(); g.ellipse(x + (r() - 0.5) * rx * 1.6, y + (r() - 0.5) * ry * 1.2, rx * k * (0.4 + r() * 0.6), ry * k * (0.4 + r() * 0.6), r() * 3, 0, Math.PI * 2); g.fill(); } } g.globalAlpha = 1; };
  blobs(9, '#5fae5a', 80, 55); blobs(6, '#c9b06a', 50, 30); blobs(5, '#4f9a4e', 40, 30);
  g.fillStyle = '#f4f7fb'; g.fillRect(0, 0, W, H * 0.07); g.fillRect(0, H * 0.93, W, H * 0.07);
  blobs(26, '#ffffff', 70, 16, 0.75);
}, { wrap: true })); }
export function earth(R = 60) { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40), toon('#ffffff', { map: earthTex() })); m.userData.noOutline = true; g.add(m);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 64, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color('#8fd0ff'), transparent: true, opacity: 0.35, side: THREE.BackSide, depthWrite: false })); atm.userData.noOutline = true; g.add(atm); g.globe = m; return g; }
export function stars(n = 900, R = 190, seed = 9) { const r = rng(seed); const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); p.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.4 * E.PX, sizeAttenuation: false, transparent: true, opacity: 0.9 })); pts.userData.noOutline = true; return pts; }
// a flat wall with round holes: holes [[x, y, r], ...]
export function holedWall(w, h, holes, color, x = 0, y = 0) { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2); for (const [hx, hy, hr] of holes) { const p = new THREE.Path(); p.absarc(hx - x, hy - y, hr, 0, Math.PI * 2, true); s.holes.push(p); } const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 40), toon(color, { side: THREE.DoubleSide })); m.position.set(x, y, 0); m.receiveShadow = true; m.castShadow = true; m.userData.noOutline = true; return m; }
function signTex(str, bg = '#e8b62a', fg = '#20161a', w = 512, h = 128) { return canvasTex(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; for (let i = -2; i < 12; i++) { } g.font = `700 ${H * 0.55}px "${FONTS.title}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, W / 2, H * 0.54); }); }
export function sign(str, w = 2.2, h = 0.55, o = {}) { const g = new THREE.Group(); g.add(rbox(w + 0.12, h + 0.12, 0.08, o.frame || '#4a4f58', 0, 0, -0.05, 0.03)); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat('#ffffff', { map: signTex(str, o.bg, o.fg) })); p.position.z = 0.0; p.userData.noOutline = true; g.add(p); outline(g, { px: 2.4 }); return g; }
export function thermos() { const g = new THREE.Group(); const pts = [[0.001, 0], [0.5, 0.0], [0.56, 0.08], [0.56, 2.0], [0.48, 2.2], [0.3, 2.3], [0.3, 2.4]]; const body = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 28), toon('#d8392e')); g.add(body);
  g.add(cyl(0.58, 0.58, 0.22, '#d9dde2', 0, 0.35, 0, 28), cyl(0.58, 0.58, 0.16, '#d9dde2', 0, 1.75, 0, 28), cyl(0.36, 0.36, 0.42, '#3a3f48', 0, 2.55, 0, 24)); const h = torus(0.42, 0.07, '#3a3f48', 0.62, 1.15, 0); h.rotation.y = Math.PI / 2; h.scale.set(1, 1.3, 1); g.add(h);
  outline(g, { px: 2.8 }); return g; }
// cartoon spit bubbles: .update(t, k, origin Vector3) — small white balls rising from the mouth and popping
export function bubbles(st, n = 14, seed = 3) { const r = rng(seed); const mat = toon('#ffffff'); const B = []; for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat); outline(b, { px: 2.2, color: '#5a7a9a' }); st.add(b); B.push({ b, ph: r(), dx: (r() - 0.5) * 0.5, dz: r() * 0.4, sz: 0.035 + r() * 0.045, sp: 0.8 + r() * 0.8 }); }
  return { list: B, update(t, k, o, dir = 1) { for (const q of B) { const age = (t * q.sp + q.ph) % 1; const s = q.sz * Math.sin(Math.PI * Math.min(1, age * 1.15)) * clamp(k); q.b.visible = s > 0.004; q.b.scale.setScalar(Math.max(0.001, s)); q.b.position.set(o.x + q.dx * age, o.y - 0.02 + age * 0.22, o.z + dir * (0.12 + (0.25 + q.dz) * age)); } } }; }
// round gauge with a needle: .set(k) 0 (vacuum) .. 1 (normal air)
export function gauge(R = 0.55) { const g = new THREE.Group(); g.add(cyl(R + 0.08, R + 0.08, 0.12, '#3a3f48', 0, 0, 0, 32).rotateX(Math.PI / 2));
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 40), flat('#ffffff', { map: canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, W, H); c.lineWidth = 22; c.beginPath(); c.strokeStyle = '#e8392e'; c.arc(W / 2, H / 2, W * 0.36, Math.PI * 0.75, Math.PI * 1.15); c.stroke(); c.beginPath(); c.strokeStyle = '#5ec46a'; c.arc(W / 2, H / 2, W * 0.36, Math.PI * 1.85, Math.PI * 2.25); c.stroke(); c.fillStyle = '#20161a'; c.font = `700 34px "${FONTS.title}"`; c.textAlign = 'center'; c.fillText('AIR', W / 2, H * 0.78); }) }));
  face.position.z = 0.065; face.userData.noOutline = true; g.add(face);
  const needle = new THREE.Group(); const nm = new THREE.Mesh(new THREE.PlaneGeometry(0.05, R * 0.82), flat('#20161a')); nm.position.y = R * 0.38; nm.userData.noOutline = true; needle.add(nm); needle.position.z = 0.075; g.add(needle); g.add(ball(0.06, '#20161a', 0, 0, 0.08, 10));
  outline(g, { px: 2.4 }); g.set = (k) => { needle.rotation.z = lerp(Math.PI * 0.62, -Math.PI * 0.62, clamp(k)); }; g.set(1); return g; }

// ---------- SET: space ----------
// Station front wall in the plane z = 0 (facing +Z): airlock hatch at (0, 2.2) r 1.0, porthole room at (-3.4, 2.5) r 0.95.
// Behind each hole a small lit room. Earth far below, stars all around. The HERO floats at z > 0.
export const HATCH = [0, 2.2, 1.0], PORT = [-3.4, 2.5, 0.95];
export function space(T, o = {}) {
  const st = toonStage(T, { light: 'day', bg: ['#04050c', '#0a0f26', '#141c40'], ambient: 0.75, sky: '#9fb4e0', ground: '#2a3050', key: o.outward ? ['#fff6e8', 2.9, [5, 9, -10]] : ['#fff6e8', 2.9, [9, 8, 10]], fill: o.outward ? ['#8ab8ff', 0.7, [-6, -2, 10]] : ['#7aa8ff', 0.55, [-8, -4, 6]], fov: 40, shadowSize: o.shadowSize || 8, target: o.target || [0, 2, 1], exposure: 1.02 });
  const set = { group: new THREE.Group() }; st.add(set.group); const G = set.group;
  G.add(stars());
  const e = earth(70); e.position.set(o.earthX ?? 0, o.earthY ?? -70, o.earthZ ?? 120); e.rotation.set(0.35, 0.6, 0.15); G.add(e); set.earth = e;
  // the module: front wall + frame + panels
  const W = 13, H = 6.2, cy = 2.4;
  G.add(holedWall(W, H, [HATCH, PORT], '#e6e2d9', 0, cy));
  for (const [x, y, w, h] of [[0, cy + H / 2, W + 0.3, 0.3], [0, cy - H / 2, W + 0.3, 0.3], [-W / 2, cy, 0.3, H + 0.3], [W / 2, cy, 0.3, H + 0.3]]) G.add(rbox(w, h, 0.5, '#c9c5bb', x, y, -0.1, 0.08));
  G.add(rbox(W, H, 3.0, '#d9d5cc', 0, cy, -3.6, 0.2)); // the module body behind the wall (the rooms sit inside its front)
  // panels + seams
  for (const [x, y, w, h] of [[3.6, 3.9, 2.4, 1.6], [3.6, 1.7, 2.4, 1.6], [-3.4, 4.8, 2.6, 0.9], [-3.4, 0.4, 2.6, 0.7], [6.0, 2.8, 0.5, 4.0]]) G.add(rbox(w, h, 0.08, '#d2cec4', x, y, 0.04, 0.03));
  // hatch: collar + open door + warm airlock behind
  const [hx, hy, hr] = HATCH;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(hr + 0.06, 0.13, 12, 40), toon('#9aa0a8')); collar.position.set(hx, hy, 0.06); G.add(collar);
  const hinge = new THREE.Group(); hinge.position.set(hx - hr - 0.08, hy, 0.12); G.add(hinge);
  const door = cyl(hr, hr, 0.16, '#cfcbc2', hr + 0.02, 0, 0.05, 36); door.rotation.x = Math.PI / 2; hinge.add(door); const wheel = torus(0.35, 0.05, '#8a9098', hr + 0.02, 0, 0.16); hinge.add(wheel); hinge.rotation.y = -1.95; set.door = hinge;
  // stripes around hatch
  const sg = sign('AIRLOCK', 1.7, 0.42); sg.position.set(hx, hy + hr + 0.55, 0.12); G.add(sg);
  // handrails
  for (const [x, y, rot] of [[hx + 1.45, hy, 0], [hx - 1.45, hy - 0.2, 0], [PORT[0], PORT[1] - 1.35, Math.PI / 2]]) { const r = new THREE.Group(); r.add(cyl(0.05, 0.05, 1.3, '#e8b62a', 0, 0, 0.28, 10), cyl(0.05, 0.05, 0.3, '#e8b62a', 0, 0.62, 0.13, 8).rotateX(Math.PI / 2), cyl(0.05, 0.05, 0.3, '#e8b62a', 0, -0.62, 0.13, 8).rotateX(Math.PI / 2)); r.position.set(x, y, 0); r.rotation.z = rot; G.add(r); }
  // porthole ring + glass
  const pr = new THREE.Mesh(new THREE.TorusGeometry(PORT[2] + 0.05, 0.14, 12, 40), toon('#9aa0a8')); pr.position.set(PORT[0], PORT[1], 0.06); G.add(pr);
  // rooms behind the holes (lit, warm)
  const room = (x, y, w, h, d, col) => { const g = new THREE.Group(); g.position.set(x, y, 0); const back = plane(w, h, col, 0, 0, -d); const top = plane(w, d, col, 0, h / 2, -d / 2); top.rotation.x = Math.PI / 2; const bot = plane(w, d, '#9a948a', 0, -h / 2, -d / 2); bot.rotation.x = -Math.PI / 2; const l = plane(d, h, col, -w / 2, 0, -d / 2); l.rotation.y = Math.PI / 2; const r = plane(d, h, col, w / 2, 0, -d / 2); r.rotation.y = -Math.PI / 2; [back, top, bot, l, r].forEach(m => { m.material = m.material.clone(); m.material.side = THREE.DoubleSide; }); g.add(back, top, bot, l, r); return g; };
  G.add(room(hx, hy, 2.4, 2.4, 1.6, '#f0d9a8')); G.add(room(PORT[0], 1.6, 2.6, 4.2, 1.9, '#e8e2d2'));
  const lamp = new THREE.PointLight(new THREE.Color('#ffe2b0'), 6, 5, 1.5); lamp.position.set(PORT[0], 3.4, -0.9); G.add(lamp);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(PORT[2], 40), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bfe0ff'), transparent: true, opacity: 0.12, depthWrite: false })); glass.position.set(PORT[0], PORT[1], 0.04); glass.userData.noOutline = true; G.add(glass);
  // solar panel wing off to the right
  const solar = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#1f3f8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7fa8e8'; g.lineWidth = 3; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(9, 0.08, 3.2), toon('#ffffff', { map: solar })); p.position.set(s * 13, 4.6, -3.5); p.rotation.x = 0.5; G.add(p); G.add(cyl(0.1, 0.1, 3.0, '#9aa0a8', s * 8, 4.6, -3.5).rotateZ(Math.PI / 2)); }
  outline(G, { px: 2.4 });
  if (o.outward) G.traverse(m => { m.castShadow = false; });
  set.update = (t) => { e.globe.rotation.y = 0.6 + t * 0.02; };
  return { stage: st, set };
}
// put a cast member inside the porthole room (standing, head in the window)
export function inPort(b, dx = 0) { b.position.set(PORT[0] + dx, PORT[1] - 2.15 - 0.0, -0.75); return b; }

// ---------- SET: 1966 test lab ----------
// Room (floor + back + left wall), vacuum chamber = a steel room with a round porthole in its front (plane z = 0),
// console with a big red button at the right. Chamber spans x -2.6..2.6; porthole at (0, 2.3) r 0.9.
export const CH_PORT = [0, 2.3, 0.9];
export function lab(T, o = {}) {
  const st = toonStage(T, { light: 'warm', bg: '#cfd6d4', fov: 38, target: o.target || [0.5, 0, 1.5], shadowSize: 7, key: ['#fff1de', 2.3, [-5, 10, 9]] });
  const set = { group: new THREE.Group() }; st.add(set.group); const G = set.group;
  const tiles = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#e8e2d2' : '#b8c4c0'; g.fillRect(x * 64, y * 64, 64, 64); } }, { wrap: true });
  tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(6, 6);
  const fl = floor(24, 24, toon('#ffffff', { map: tiles }), 0, 0); G.add(fl);
  const wallC = '#a9c2b8'; G.add(plane(24, 9, wallC, 0, 4.5, -3.2)); const lw = plane(24, 9, wallC, -6.5, 4.5, 0); lw.rotation.y = Math.PI / 2; G.add(lw);
  G.add(rbox(24, 0.3, 0.1, '#7a9a8e', 0, 0.15, -3.15, 0.02));
  // chamber
  const CW = 5.2, CHh = 4.6, CD = 3.0, steel = '#7f97a6';
  G.add(holedWall(CW, CHh, [CH_PORT], steel, 0, CHh / 2));
  const inner = '#5d6f7a'; const back = plane(CW, CHh, inner, 0, CHh / 2, -CD); const top = plane(CW, CD, inner, 0, CHh, -CD / 2); top.rotation.x = Math.PI / 2; const l = plane(CD, CHh, steel, -CW / 2, CHh / 2, -CD / 2); l.rotation.y = Math.PI / 2; const r = plane(CD, CHh, steel, CW / 2, CHh / 2, -CD / 2); r.rotation.y = -Math.PI / 2; [back, top, l, r].forEach(m => { m.material = m.material.clone(); m.material.side = THREE.DoubleSide; G.add(m); });
  for (const [x, y, w, h] of [[0, CHh, CW + 0.3, 0.3], [-CW / 2, CHh / 2, 0.3, CHh], [CW / 2, CHh / 2, 0.3, CHh]]) G.add(rbox(w, h, 0.4, '#5d7380', x, y, 0, 0.06));
  for (const y of [0.8, 3.8]) for (const x of [-2.2, -1.5, 1.5, 2.2]) G.add(ball(0.07, '#5d7380', x, y, 0.05, 8));
  const pr = new THREE.Mesh(new THREE.TorusGeometry(CH_PORT[2] + 0.06, 0.16, 12, 40), toon('#4f6370')); pr.position.set(CH_PORT[0], CH_PORT[1], 0.08); G.add(pr);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(CH_PORT[2], 40), new THREE.MeshBasicMaterial({ color: new THREE.Color('#cfeaff'), transparent: true, opacity: 0.14, depthWrite: false })); glass.position.set(CH_PORT[0], CH_PORT[1], 0.05); glass.userData.noOutline = true; G.add(glass);
  const lamp = new THREE.PointLight(new THREE.Color('#fff0d0'), 7, 5, 1.4); lamp.position.set(0, 3.8, -1.2); G.add(lamp); set.lamp = lamp;
  const sg = sign('VACUUM CHAMBER', 2.6, 0.5, { bg: '#f2ead6' }); sg.position.set(0, 3.9, 0.22); G.add(sg);
  const gg = gauge(0.5); gg.position.set(1.75, 2.6, 0.22); G.add(gg); set.gauge = gg;
  // inside: a stool
  G.add(cyl(0.3, 0.3, 0.1, '#6a5040', 0, 0.75, -1.2), cyl(0.05, 0.05, 0.75, '#3a3f48', 0, 0.37, -1.2));
  // console
  const con = new THREE.Group(); con.position.set(3.2, 0, 1.6); con.rotation.y = -0.5; G.add(con);
  con.add(rbox(1.9, 1.15, 1.0, '#c9b89a', 0, 0.58, 0, 0.06));
  for (let i = 0; i < 4; i++) con.add(ball(0.06, ['#e8b62a', '#5ec46a', '#7aa0c8', '#e8b62a'][i], 0.0 + i * 0.25, 1.2, 0.2, 10));
  const btnBase = cyl(0.2, 0.22, 0.08, '#3a3f48', -0.45, 1.2, 0.05); con.add(btnBase); const btn = cyl(0.15, 0.15, 0.1, '#e8261f', -0.45, 1.28, 0.05); con.add(btn); set.button = btn;
  set.console = con;
  // wall clock + chart
  const clk = new THREE.Group(); clk.add(cyl(0.45, 0.45, 0.08, '#3a3f48').rotateX(Math.PI / 2)); const cf = new THREE.Mesh(new THREE.CircleGeometry(0.4, 30), flat('#fbf8f2')); cf.position.z = 0.05; cf.userData.noOutline = true; clk.add(cf); clk.position.set(4.6, 4.3, -3.1); G.add(clk);
  outline(G, { px: 2.4 });
  set.update = () => {};
  return { stage: st, set };
}
// seat the volunteer inside the chamber on the stool
export function seatVolunteer(v) { v.position.set(0, 0.0, -1.0); return v; }
