// Mantis Shrimp Punch Short: shared 3D assets (underscore = not auto-loaded). Toon 3D bean style, all original designs.
// Sea set, lidded eyes, chips/stamps/fx helpers adapted from the immortal-jellyfish project; mantis(), shell(), bubbleBurst(), tank() are new.
// Tone guard: nothing alive is hurt. It only smashes EMPTY shells and a glass pane.
import { wordTime, rng, clamp, lerp, ease, prog, E, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, torus, plane, floor, lathe, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as TXT } from '/kits/toon3d/insert.js';
import { reactions as _reactions } from '/kits/toon3d/react.js';

// time of a spoken word, shot-local (fallback fb)
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);
const shadeC = (hex, k) => { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); };
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };

// ---------- eyes with a real lid ----------
function lidEye(parent, pos, n, size, o = {}) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.12, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.44, 0.5, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const hl = new THREE.Mesh(sph, flat('#ffffff')); hl.scale.set(0.14, 0.14, 0.05); hl.position.set(-0.14, 0.18, 1.0); hl.userData.noOutline = true; pg.add(hl);
  const lp = new THREE.Group(); eg.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#e9a8c0', { fresh: true })); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp };
}

// ---------- the sea ----------
// seaStage(T, { dark, fov, floor, seed, rays }) — sunlit shallow water (or dark water for the hook), sandy floor, seaweed, rocks, drifting specks
export function seaStage(T, o = {}) {
  const dark = !!o.dark;
  const st = toonStage(T, { light: 'day', fov: o.fov || 36, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0],
    bg: dark ? ['#0d3f78', '#072650', '#030c24'] : ['#7fd8f0', '#2a9ccc', '#0d5a92'],
    fog: dark ? [8, 34, '#062048'] : [10, 46, '#2f8fc0'],
    sky: dark ? '#7aa8ff' : '#d8f4ff', ground: dark ? '#1a2a5a' : '#3a7a9a', ambient: dark ? 0.9 : 1.25,
    key: dark ? ['#bfe0ff', 1.6, [-4, 10, 6]] : ['#fff6dc', 2.6, [-5, 12, 5]], fill: dark ? ['#ff8ad0', 0.5, [6, 2, 6]] : ['#9ad8ff', 0.6, [8, 4, 6]], ...o.stage });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 5);
  const parts = { group: g };
  if (o.floor !== false) {
    const fl = floor(200, 200, dark ? '#2a3f6a' : '#e6d29a', 0, 0); fl.receiveShadow = true; g.add(fl);
    const rockM = [toon(dark ? '#3a4a7a' : '#8a8f9a'), toon(dark ? '#2e3c66' : '#a0a4ae')];
    for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 30, z = -r() * 28 + 4; if (Math.abs(x) < (o.clear || 2.4) && z > -3) continue; const s = 0.3 + r() * 0.9; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockM[i % 2]); m.position.set(x, s * 0.3, z); m.scale.set(s, s * 0.6, s * 0.8); m.rotation.y = r() * 3; m.castShadow = true; g.add(m); }
    const weedC = dark ? ['#2a7a6a', '#3a8a5a'] : ['#3fae5a', '#5ac46a', '#2f9a4a'];
    const weeds = [];
    for (let i = 0; i < (o.weeds ?? 22); i++) { const x = (r() - 0.5) * 26, z = -r() * 22 + 3; if (Math.abs(x) < (o.clear || 2.4) && z > -3) continue; const w = new THREE.Group(); w.position.set(x, 0, z); const n = 4 + Math.floor(r() * 4); const mat = toon(weedC[i % weedC.length]); let p = w;
      for (let k = 0; k < n; k++) { const sg = new THREE.Group(); if (k) sg.position.y = 0.42; p.add(sg); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.36, 4, 8).translate(0, 0.21, 0), mat); m.castShadow = true; sg.add(m); p = sg; }
      w.ph = r() * 6; g.add(w); weeds.push(w); }
    // coral fans
    const coralC = ['#ff7a6a', '#ffb04a', '#c86ae0'];
    for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * 22, z = -r() * 16 - 1; if (Math.abs(x) < (o.clear || 2.4) + 0.6) continue; const c = new THREE.Group(); c.position.set(x, 0, z); const col = coralC[i % 3];
      for (let k = 0; k < 5; k++) { const b = cyl(0.06, 0.09, 0.8 + r() * 0.6, col, (r() - 0.5) * 0.5, 0.45, (r() - 0.5) * 0.3, 8); b.rotation.z = (r() - 0.5) * 0.9; c.add(b); c.add(ball(0.13, col, b.position.x + Math.sin(-b.rotation.z) * 0.45, 0.9 + r() * 0.3, b.position.z, 10)); }
      outline(c, { px: 2 }); g.add(c); }
    outline(g, { px: 2.2 });
    parts.weeds = weeds;
  }
  // drifting specks (marine snow / bubbles)
  const pos = []; for (let i = 0; i < 260; i++) pos.push((r() - 0.5) * 24, r() * 12, -r() * 22 + 6);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const specks = new THREE.Points(geo, new THREE.PointsMaterial({ size: 4 * E.PX, sizeAttenuation: false, color: dark ? '#9ac8ff' : '#e8fbff', transparent: true, opacity: 0.6, fog: true })); specks.userData.noOutline = true; st.add(specks);
  const bubbles = []; const bm = toon('#e8fbff', { transparent: true, opacity: 0.5, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4, fresh: true });
  for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(sph, bm); const s = 0.04 + r() * 0.07; b.scale.setScalar(s); b.userData = { x: (r() - 0.5) * 10, z: -r() * 8 + 1, ph: r() * 10, sp: 0.6 + r() * 0.8, noOutline: true }; st.add(b); bubbles.push(b); }
  parts.update = (t) => { specks.position.y = -((t * 0.15) % 1) * 0.3; specks.position.x = Math.sin(t * 0.3) * 0.2;
    (parts.weeds || []).forEach(w => { let p = w.children[0], k = 0; while (p) { p.rotation.z = Math.sin(t * 1.3 + w.ph + k * 0.6) * 0.14; p.rotation.x = Math.sin(t * 0.9 + w.ph + k) * 0.08; p = p.children.find(c => c.isGroup); k++; } });
    bubbles.forEach(b => { const u = b.userData; const y = ((t * u.sp + u.ph) % 8); b.position.set(u.x + Math.sin(t * 2 + u.ph) * 0.12, y - 1, u.z); }); };
  return { stage: st, sea: parts };
}
// water ripple light on top of the frame (caustic shimmer) + god rays from the surface
export function waterLook(g, t, o = {}) {
  g.save(); g.globalCompositeOperation = 'screen';
  const n = 6; for (let i = 0; i < n; i++) { const x = E.W * (0.1 + i / n) + Math.sin(t * 0.5 + i) * 40, w = 90 + (i % 3) * 50; const gr = g.createLinearGradient(0, 0, 0, E.H * 0.9);
    gr.addColorStop(0, alpha(o.ray || '#d8fbff', (o.k ?? 0.16) * (0.6 + 0.4 * Math.sin(t * 0.8 + i * 1.7)))); gr.addColorStop(1, alpha(o.ray || '#d8fbff', 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * 0.3, 0); g.lineTo(x + w * 0.3, 0); g.lineTo(x + w * 1.6 + 120, E.H * 0.9); g.lineTo(x + w * 0.4 + 120, E.H * 0.9); g.closePath(); g.fill(); }
  g.restore();
  // surface shimmer band
  const gr = g.createLinearGradient(0, 0, 0, E.H * 0.12); gr.addColorStop(0, alpha('#ffffff', o.surf ?? 0.18)); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H * 0.12);
}

// the pinky: a giant toon finger lying on the sand, nail up front
export function pinky() { const g = new THREE.Group(); const skin = toon('#f2c09a');
  const f = M(new THREE.CapsuleGeometry(0.7, 5, 8, 20), skin); f.rotation.z = Math.PI / 2; f.position.y = 0.7; g.add(f);
  for (const x of [-0.6, -2.2]) { const cr = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.03, 6, 30, Math.PI), toon('#d8946a')); cr.rotation.y = Math.PI / 2; cr.position.set(x, 0.7, 0); cr.userData.noOutline = true; g.add(cr); }
  const nail = rbox(1.0, 0.12, 1.0, '#ffd8d0', 2.55, 1.36, 0, 0.06); nail.rotation.z = -0.12; nail.material = toon('#ffd8d0', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15, fresh: true }); g.add(nail);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16, 0, Math.PI), flat('#fff4ee')); moon.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); moon.position.set(2.12, 1.43, 0); moon.userData.noOutline = true; g.add(moon);
  outline(g, { px: 3 }); g.nail = nail; return g; }

// ---------- 2D overlays ----------
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || '#2a1c15', italic: o.italic }); g.restore(); }
export function hook(g, lines, y, age, o = {}) { lines.forEach((l, i) => { const k = ease.outBack(clamp((age + 0.3 - i * 0.12) / 0.3)); if (k <= 0) return; g.save(); g.translate(E.W / 2, y + i * (o.lh || 150)); g.scale(k, k); g.rotate((i % 2 ? 1.5 : -1.5) * Math.PI / 180);
  TXT(g, l, 0, 0, o.size || 132, { color: (o.accentIdx ?? lines.length - 1) === i ? (o.accent || '#ffd23a') : '#ffffff', stroke: '#2a1c15', maxW: E.W * 0.92 }); g.restore(); }); }
export function stamp(g, str, x, y, age, o = {}) { if (age < 0) return; const k = clamp(age / 0.18); const s = lerp(2.4, 1, ease.out(k)); g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  const size = o.size || 84; g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.86) + size * 0.7, h = size * 1.35; g.lineWidth = 12; g.strokeStyle = o.color || '#e8402a'; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); TXT(g, str, 0, 4, size, { color: o.color || '#e8402a', maxW: E.W * 0.84 }); g.restore(); }
// curved arrow on a circle (cx,cy,R) from angle a0 to a1
export function arcArrow(g, cx, cy, R, a0, a1, o = {}) { g.save(); g.lineCap = 'round'; g.strokeStyle = '#2a1c15'; g.lineWidth = (o.w || 22) + 12; g.beginPath(); g.arc(cx, cy, R, a0, a1); g.stroke(); g.strokeStyle = o.color || '#ffd23a'; g.lineWidth = o.w || 22; g.beginPath(); g.arc(cx, cy, R, a0, a1); g.stroke();
  const hx = cx + Math.cos(a1) * R, hy = cy + Math.sin(a1) * R, ang = a1 + Math.PI / 2; g.translate(hx, hy); g.rotate(ang); g.beginPath(); g.moveTo(26, 0); g.lineTo(-22, -34); g.lineTo(-22, 34); g.closePath(); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke(); g.restore(); }
// sparkles that fade after 1 s unless `until` is given
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));

// ---------- extra 2D helpers ----------
export const at2 = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
// two-tone line: [[text, colour], ...] centred at y (Nunito 900, ink outline)
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: INK }); x += ws[i] + sp; }); g.restore();
}
// the 2-line top caption of frame 1 (0 - 3.5 s): PUNCH gold, BOIL red
export function topCaption(g, t, o = {}) {
  const fade = o.until != null ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return; g.save(); g.globalAlpha = fade;
  const k = o.noPop ? 1 : ease.outBack(clamp((t + 0.25) / 0.3)), k2 = o.noPop ? 1 : ease.outBack(clamp((t + 0.07) / 0.3));
  g.save(); g.translate(540, 300); g.scale(k, k); g.translate(-540, -300); richLine(g, [["this shrimp's", '#ffffff'], ['PUNCH', '#ffd23a']], 300, 78); g.restore();
  g.save(); g.translate(540, 410); g.scale(k2, k2); g.translate(-540, -410); richLine(g, [['makes water', '#ffffff'], ['BOIL', '#ff4a3a']], 410, 78); g.restore();
  g.restore();
}
// radial glass crack drawn around (x, y); k 0..1 grows it
export function crack(g, x, y, k, o = {}) { if (k <= 0) return; const r = rng(o.seed || 3); const R = (o.R || 330) * k; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) { g.strokeStyle = pass ? 'rgba(255,255,255,.95)' : 'rgba(20,40,60,.55)'; g.lineWidth = pass ? 4 : 9;
    const rr = rng(o.seed || 3); for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2 + rr() * 0.4; let px = x, py = y; g.beginPath(); g.moveTo(px, py); const n = 5; for (let j = 1; j <= n; j++) { const d = R * j / n * (0.7 + rr() * 0.5); const aa = a + (rr() - 0.5) * 0.35; px = x + Math.cos(aa) * d; py = y + Math.sin(aa) * d; g.lineTo(px, py); } g.stroke(); }
    for (let ring = 1; ring <= 2; ring++) { g.beginPath(); for (let i = 0; i <= 11; i++) { const a = i / 11 * Math.PI * 2; const d = R * ring * 0.33 * (0.85 + rr() * 0.3); const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); } }
  g.restore(); r(); }
// pressure gauge (2D): needle from HIGH to LOW as k goes 0..1
export function gauge(g, x, y, k, age) { if (age < 0) return; const s = ease.outBack(clamp(age / 0.3)); g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#fbf6ea'; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 170, 0, Math.PI * 2); g.fill(); g.stroke();
  const a0 = Math.PI * 0.85, a1 = Math.PI * 2.15; g.lineWidth = 26; [['#4ac06a', 0, 0.33], ['#ffd23a', 0.33, 0.66], ['#ff4a3a', 0.66, 1]].forEach(([c, u, v]) => { g.strokeStyle = c; g.beginPath(); g.arc(0, 0, 130, lerp(a1, a0, v), lerp(a1, a0, u)); g.stroke(); });
  TXT(g, 'PRESSURE', 0, 70, 40, { color: INK }); const a = lerp(a1 - 0.25, a0 + 0.15, ease.inOut(k)) + Math.sin(age * 40) * 0.03 * k;
  g.strokeStyle = INK; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 120, Math.sin(a) * 120); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 18, 0, 7); g.fill(); g.restore(); }

// ---------- the hero: a peacock mantis shrimp (side view: body along X, head at +X, faces +X; camera on +Z) ----------
// .update(t, { punch 0..1 (0 = clubs folded, 1 = near club fully out), punch2 (far club), lid, look:[x,y], eyeSpin, sway, mood })
// .fist = Object3D at the near club's striking heel (for FX/bubble anchors). ~0.9 units tall, ~3.4 long.
export function mantis(o = {}) {
  const { seed = 1, scale = 1 } = o; const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const GRN = '#35b56a', TEAL = '#2a9a9a', ORG = '#ff8a2a', RED = '#ff4a5a', BLU = '#3a6ae8', CLUB = '#ff6a8a';
  const body = new THREE.Group(); g.add(body);
  // thorax + carapace
  const th = M(sph, toon(GRN), 0.15, 0.5, 0); th.scale.set(0.6, 0.3, 0.33); body.add(th);
  const cp = M(sph, toon(shadeC(GRN, 0.12)), 0.5, 0.6, 0); cp.scale.set(0.42, 0.27, 0.3); body.add(cp);
  for (let k = 0; k < 3; k++) { const sp = M(sph, toon('#e8f060'), 0.35 + k * 0.16, 0.8, 0.12 - k * 0.02); sp.scale.set(0.05, 0.03, 0.05); sp.userData.noOutline = true; body.add(sp); }
  // abdomen: 6 segments with orange joint rings, ending in a red/blue tail fan
  const abd = new THREE.Group(); abd.position.set(-0.4, 0.5, 0); body.add(abd); const segs = []; let par = abd;
  for (let i = 0; i < 6; i++) { const sg = new THREE.Group(); if (i) sg.position.x = -0.34; par.add(sg); const m = M(sph, toon(i % 2 ? TEAL : GRN), -0.17, 0, 0); m.scale.set(0.22, 0.27 - i * 0.012, 0.3 - i * 0.012); sg.add(m);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27 - i * 0.012, 0.025, 6, 22), toon(ORG)); ring.rotation.y = Math.PI / 2; ring.position.x = -0.34; ring.scale.set(1, 0.95, 1.08); ring.userData.noOutline = true; sg.add(ring); segs.push(sg); par = sg; }
  const fan = new THREE.Group(); fan.position.x = -0.42; par.add(fan); const fans = [];
  [[0, RED], [0.5, BLU], [-0.5, BLU], [0.95, ORG], [-0.95, ORG]].forEach(([a, c]) => { const pv = new THREE.Group(); pv.rotation.z = Math.PI + a * 0.6; fan.add(pv); const f = M(sph, toon(c), 0, 0.3, 0); f.scale.set(0.12, 0.32, 0.06); pv.add(f); pv.rotation.y = a * 0.5; fans.push(pv); });
  // legs (walking legs under the thorax)
  const legs = []; for (let i = 0; i < 3; i++) for (const zs of [-1, 1]) { const lg = new THREE.Group(); lg.position.set(-0.15 - i * 0.22, 0.32, zs * 0.16); body.add(lg); const m = M(new THREE.CapsuleGeometry(0.025, 0.25, 4, 6).translate(0, -0.14, 0), toon(ORG)); lg.add(m); lg.rotation.x = zs * 0.4; legs.push(lg); }
  // head
  const head = new THREE.Group(); head.position.set(0.95, 0.66, 0); body.add(head);
  const hd = M(sph, toon(GRN), 0, 0, 0); hd.scale.set(0.24, 0.2, 0.22); head.add(hd);
  // antennae + orange antennal scales
  const ants = []; for (const zs of [-1, 1]) { const ag = new THREE.Group(); ag.position.set(0.15, 0.08, zs * 0.08); head.add(ag); const a = M(new THREE.CylinderGeometry(0.012, 0.02, 0.85, 6).translate(0, 0.42, 0), toon(ORG)); ag.add(a); ag.rotation.set(zs * 0.35, 0, -0.75); ants.push(ag);
    const sc = M(sph, toon(ORG), 0.32, 0.02, zs * 0.2); sc.scale.set(0.2, 0.05, 0.09); sc.rotation.y = -zs * 0.5; sc.rotation.z = 0.35; head.add(sc); }
  // stalked eyes: big round eyes with the famous mid-band
  const eyes = [], stalks = []; for (const zs of [-1, 1]) { const stg = new THREE.Group(); stg.position.set(0.12, 0.12, zs * 0.08); head.add(stg); stg.add(M(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8).translate(0, 0.15, 0), toon(TEAL)));
    const top = new THREE.Group(); top.position.y = 0.36; stg.add(top); const eb = M(sph, toon('#7ae0a0'), 0, 0, 0); eb.scale.set(0.15, 0.17, 0.15); top.add(eb);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 6, 24), toon('#c04ab0')); band.rotation.x = Math.PI / 2; band.position.y = -0.085; band.scale.setScalar(0.92); band.userData.noOutline = true; top.add(band);
    const e = lidEye(top, new THREE.Vector3(0.05, 0.03, zs * 0.0 + 0.1), new THREE.Vector3(0.35, 0.05, 1).normalize(), 0.105, { lid: '#5ac880' }); eyes.push(e); stalks.push({ stg, top, zs }); }
  // mouth (little smile on the head front, visible from the side)
  const mouths = {}; { const mm = flat('#2a1020'); const sm = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 6, 14, Math.PI), mm); sm.rotation.z = Math.PI; sm.position.set(0.14, -0.08, 0.19); mouths.smile = sm;
    const fr = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 6, 14, Math.PI), mm); fr.position.set(0.14, -0.12, 0.19); mouths.frown = fr; const om = new THREE.Mesh(new THREE.CircleGeometry(0.035, 14), mm); om.position.set(0.15, -0.1, 0.2); mouths.o = om;
    for (const k in mouths) { mouths[k].rotation.y = 0.6; mouths[k].userData.noOutline = true; head.add(mouths[k]); } }
  // raptorial clubs (the "fists"): shoulder -> merus -> elbow -> club with a pink heel
  const arms = []; for (const zs of [1, -1]) { const sh = new THREE.Group(); sh.position.set(0.82, 0.48, zs * 0.17); body.add(sh);
    const mer = M(new THREE.CapsuleGeometry(0.07, 0.36, 4, 10).translate(0, -0.22, 0), toon(GRN)); sh.add(mer); const el = new THREE.Group(); el.position.y = -0.45; sh.add(el);
    const cl = M(new THREE.CapsuleGeometry(0.075, 0.3, 4, 10).translate(0, 0.2, 0), toon(TEAL)); el.add(cl); const heel = M(sph, toon(CLUB, { emissive: new THREE.Color(CLUB), emissiveIntensity: 0.1, fresh: true }), 0, 0.42, 0); heel.scale.setScalar(0.12); el.add(heel);
    const spot = M(sph, toon('#ffffff'), 0.05, 0.44, zs * 0.07); spot.scale.setScalar(0.035); spot.userData.noOutline = true; el.add(spot);
    const fist = new THREE.Object3D(); fist.position.set(0, 0.46, 0); el.add(fist); arms.push({ sh, el, fist, heel }); }
  root.add(blob(1.2, 0.3)); root.children[root.children.length - 1].position.x = -0.6;
  outline(g, { px: 2.8 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.3; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { punch = 0, punch2 = 0, lid = 0.2, look = [0, 0], eyeSpin = 0, sway = 1, mouth = 'smile', blink = true } = u;
    body.position.y = Math.sin(t * 2.1 + seed) * 0.025 * sway; body.rotation.z = Math.sin(t * 1.3 + seed) * 0.02 * sway;
    segs.forEach((sg, i) => { if (i) sg.rotation.z = Math.sin(t * 2.4 - i * 0.7 + seed) * 0.05 * sway - 0.03; sg.rotation.y = Math.sin(t * 1.5 - i * 0.5) * 0.03 * sway; });
    fans.forEach((f, i) => { f.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.05 * sway); });
    legs.forEach((l, i) => { l.rotation.z = Math.sin(t * 6 + i * 1.3) * 0.25 * sway; });
    ants.forEach((a, i) => { a.rotation.z = -0.75 + Math.sin(t * 2.2 + i * 2) * 0.12 * sway; });
    stalks.forEach((s, i) => { s.stg.rotation.z = Math.sin(t * 1.7 + i * 2.3 + seed) * 0.12 * sway + (eyeSpin ? Math.sin(t * 9 + i * 3) * 0.4 * eyeSpin : 0); s.stg.rotation.x = s.zs * (0.18 + Math.sin(t * 1.1 + i) * 0.06 * sway); });
    [punch, punch2].forEach((k, i) => { const A = arms[i]; const p = clamp(k); A.sh.rotation.z = lerp(0.95, 1.78, p); A.el.rotation.z = lerp(-0.45, -3.3, p); });
    const bl = blink ? blinkAt(t) : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    for (const k in mouths) mouths[k].visible = k === mouth;
  };
  root.head = head; root.eyes = eyes; root.headR = 0.42; root.fist = arms[0].fist; root.arms = arms; root.update(0); return root;
}
// punch curve: fast snap out (60 ms), short hold, slower fold back. Returns 0..1 at time t for a strike at time a.
export const strike = (t, a, hold = 0.12, back = 0.35) => t < a - 0.06 ? 0 : t < a ? ease.in(prog(t, a - 0.06, a)) : t < a + hold ? 1 : 1 - ease.inOut(prog(t, a + hold, a + hold + back));

// ---------- an EMPTY spiral sea-snail shell (no snail inside) that can shatter ----------
export function shell(o = {}) { const { seed = 4, scale = 1, color = '#f2c58a' } = o; const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g); const r = rng(seed);
  const parts = []; const cs = [color, shadeC(color, -0.12), '#e89a6a'];
  for (let i = 0; i < 6; i++) { const a = i * 1.15, rr = 0.36 * Math.pow(0.78, i); const m = M(sph, toon(cs[i % 3]), Math.cos(a) * 0.18 * Math.pow(0.8, i) - i * 0.05, 0.32 + i * 0.13, Math.sin(a) * 0.18 * Math.pow(0.8, i)); m.scale.setScalar(rr); g.add(m); parts.push({ m, home: m.position.clone(), v: new THREE.Vector3(0.6 + r() * 1.2, 0.6 + r() * 1.6, (r() - 0.5) * 2.2), sp: (r() - 0.5) * 12 }); }
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), flat('#4a2a1a')); hole.position.set(0.28, 0.3, 0.18); hole.rotation.y = 0.9; hole.userData.noOutline = true; g.add(hole);
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.07 + r() * 0.06), toon(cs[i % 3])); m.visible = false; g.add(m); parts.push({ m, home: new THREE.Vector3(0.1, 0.35, 0), v: new THREE.Vector3(0.4 + r() * 2, 0.4 + r() * 2.4, (r() - 0.5) * 3), sp: (r() - 0.5) * 16, chip: true }); }
  outline(g, { px: 2.4 }); root.add(blob(0.45, 0.3));
  root.update = (t, u = {}) => { const { crack: c = -1 } = u; const age = c < 0 ? -1 : c; hole.visible = age < 0;
    parts.forEach(p => { if (p.chip) p.m.visible = age >= 0; if (age < 0) { p.m.position.copy(p.home); p.m.rotation.set(0, 0, 0); return; } const tt = Math.min(age, 1.2);
      p.m.position.set(p.home.x + p.v.x * tt, Math.max(0.05, p.home.y + p.v.y * tt - 4.5 * tt * tt), p.home.z + p.v.z * tt); p.m.rotation.set(p.sp * tt, p.sp * 0.7 * tt, 0); }); };
  root.head = g; root.headR = 0.3; root.update(0); return root; }

// ---------- cavitation bubbles: a puff of vapour bubbles at a point; grow k 0..1, then collapse ----------
export function bubbleBurst(o = {}) { const r = rng(o.seed || 9); const g = new THREE.Group(); const mat = toon('#e8fbff', { transparent: true, opacity: 0.75, emissive: new THREE.Color('#bff4ff'), emissiveIntensity: 0.5, fresh: true }); const bs = [];
  for (let i = 0; i < (o.n || 22); i++) { const b = new THREE.Mesh(sph, mat); b.userData = { d: new THREE.Vector3(0.4 + r() * 0.8, (r() - 0.5) * 1.4, (r() - 0.5) * 1.2).normalize().multiplyScalar(0.05 + r() * 0.35), s: 0.025 + r() * 0.07, ph: r() * 6, noOutline: true }; g.add(b); bs.push(b); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 30), flat('#ffffff', { transparent: true, opacity: 0.8 })); ring.rotation.y = Math.PI / 2; ring.userData.noOutline = true; g.add(ring);
  g.update = (t, k, col = 0) => { const kk = clamp(k) * (1 - ease.in(clamp(col))); g.visible = kk > 0.001; bs.forEach(b => { const u = b.userData; const w = 1 + Math.sin(t * 30 + u.ph) * 0.12; b.position.copy(u.d).multiplyScalar(0.3 + kk * 0.9); b.scale.setScalar(Math.max(0.001, u.s * kk * w)); });
    ring.scale.setScalar(0.5 + kk * 3); ring.material.opacity = 0.7 * kk * (1 - clamp(k - 0.6)); };
  g.update(0, 0); return g; }

// ---------- aquarium glass pane (front of the tank) ----------
export function tank(o = {}) { const g = new THREE.Group(); const w = o.w || 9, h = o.h || 6;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#bff0ff', transparent: true, opacity: 0.12, depthWrite: false })); glass.position.y = h / 2; glass.userData.noOutline = true; g.add(glass);
  const fr = '#3a424c'; g.add(rbox(w + 0.4, 0.3, 0.3, fr, 0, 0.0, 0, 0.06)); g.add(rbox(w + 0.4, 0.3, 0.3, fr, 0, h, 0, 0.06)); g.add(rbox(0.3, h, 0.3, fr, -w / 2, h / 2, 0, 0.06)); g.add(rbox(0.3, h, 0.3, fr, w / 2, h / 2, 0, 0.06));
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, h * 0.8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.18, depthWrite: false })); sh.position.set(-w * 0.3, h / 2, 0.01); sh.rotation.z = -0.3; sh.userData.noOutline = true; g.add(sh);
  outline(g, { px: 2.6 }); return g; }
// a toy "bullet" (rounded brass cartridge shape, no gun) for the speed comparison
export function toyBullet() { const g = new THREE.Group(); const c = M(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 18), toon('#d8a83a')); c.rotation.z = Math.PI / 2; g.add(c); const tip = M(sph, toon('#c8783a'), 0.25, 0, 0); tip.scale.set(0.3, 0.16, 0.16); g.add(tip); outline(g, { px: 2.4 }); g.head = g; g.headR = 0.2; return g; }
