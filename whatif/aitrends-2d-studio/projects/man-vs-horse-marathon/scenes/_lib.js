// Man v Horse Short: shared 3D assets + 2D overlays (underscore = not auto-loaded). Overlay helpers, person() and signPost() come from the exploding-whale draft;
// new: hillStage (Welsh hills, course flags, finish arch), horse() (toon, smug lids, optional sunglasses), rider(), runner() (bean with a race bib), pubSet().
//
//
import { wordTime, rng, clamp, lerp, ease, prog, E, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, torus, plane, floor, lathe, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { bean } from '/kits/toon3d/rig.js';
import { T as TXT } from '/kits/toon3d/insert.js';
import { reactions as _reactions } from '/kits/toon3d/react.js';
export { TXT };

// time of a spoken word, shot-local (fallback fb)
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 28, 18);
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };
const CROWD = [
  { outfit: 'tee', colors: { main: '#d65a3a', legs: '#3a4a6a' }, skin: 'fair', hair: 'swoop', hairColor: '#6a4a2a' },
  { outfit: 'hoodie', colors: { main: '#3f7fb8', legs: '#5a4a3a' }, skin: 'tan', hair: 'curly', hairColor: '#2a1c15' },
  { outfit: 'tee', colors: { main: '#e0b84a', legs: '#4a5a3a' }, skin: 'brown', hair: 'bowl', hairColor: '#1a1210' },
  { outfit: 'hoodie', colors: { main: '#7a9a4a', legs: '#3a3a4a' }, skin: 'light', hair: 'long', hairColor: '#c89a4a' },
  { outfit: 'tee', colors: { main: '#a05aa8', legs: '#3a4a6a' }, skin: 'olive', head: 'beanie', headColor: '#e8402a' },
  { outfit: 'tee', colors: { main: '#4aa89a', legs: '#6a5a4a' }, skin: 'dark', hair: 'bald', head: 'ballcap', headColor: '#2a5aa8' },
];
export function person(i, o = {}) { const c = CROWD[i % CROWD.length]; return bean({ ...c, seed: 10 + i * 7, scale: o.scale || 1, ...o }); }
// the highway worker: orange tee + yellow hard hat (generic, no insignia)
const label = (txt, bg, fg, w = 256, h = 96) => canvasTex(w, h, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.fillStyle = fg; c.font = `900 ${Math.round(H * 0.5)}px Nunito`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, W / 2, H / 2 + 3); });
export function signPost(txt, o = {}) { const tex = label(txt, o.bg || '#f2b632', o.fg || '#20161a', 512, 192); const g = new THREE.Group(); g.add(cyl(0.06, 0.06, 2.2, '#8a8a90', 0, 1.1, 0, 8));
  const b = rbox(o.w || 1.8, (o.w || 1.8) * 0.375, 0.08, o.bg || '#f2b632', 0, 2.2, 0, 0.03); g.add(b); const p = new THREE.Mesh(new THREE.PlaneGeometry((o.w || 1.8) * 0.94, (o.w || 1.8) * 0.35), toon('#ffffff', { map: tex, fresh: true })); p.position.set(0, 2.2, 0.045); p.userData.noOutline = true; g.add(p); outline(g, { px: 2.4 }); return g; }
// park sign: wooden board on two posts, carved letters + a little whale mark (generic, not the real sign)
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || '#2a1c15', italic: o.italic }); g.restore(); }
export function stamp(g, str, x, y, age, o = {}) { if (age < 0) return; const k = clamp(age / 0.18); const s = lerp(2.4, 1, ease.out(k)); g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  const size = o.size || 84; g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.86) + size * 0.7, h = size * 1.35; g.lineWidth = 12; g.strokeStyle = o.color || '#e8402a'; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); TXT(g, str, 0, 4, size, { color: o.color || '#e8402a', maxW: E.W * 0.84 }); g.restore(); }
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: '#2a1c15' }); x += ws[i] + sp; }); g.restore();
}
// frame-1 top caption: 2 lines, centre-top (below the Shorts top bar), 0..until; lines = [[[txt, col], ...], [...]]
export function topCaption(g, gt, lines, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  g.save(); g.globalAlpha = fade;
  lines.forEach((parts, i) => { const y = 300 + i * 110; const k = ease.outBack(clamp((gt + 0.25 - i * 0.17) / 0.3)); g.save(); g.translate(540, y); g.scale(k, k); g.translate(-540, -y); richLine(g, parts, y, o.size || 84); g.restore(); });
  g.restore();
}
// big cartoon "BOOM!" burst (2D), centred at x,y; age seconds
export function boomText(g, x, y, age, o = {}) { if (age < 0 || age > (o.dur ?? 1.2)) return; const k = ease.outBack(clamp(age / 0.22)); const fade = clamp(((o.dur ?? 1.2) - age) / 0.25);
  g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate(-0.08); g.scale(k * (o.s || 1), k * (o.s || 1));
  const N = 14; g.beginPath(); for (let i = 0; i <= N * 2; i++) { const a = (i / (N * 2)) * Math.PI * 2; const rr = i % 2 ? 210 : 330; g.lineTo(Math.cos(a) * rr * 1.15, Math.sin(a) * rr * 0.8); } g.closePath();
  g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, o.txt || 'BOOM!', 0, 10, o.size || 170, { color: '#e8402a', stroke: '#2a1c15' }); g.restore(); }
// sun-bleached warm look over the beach

// =====================================================================================================================
// MAN V HORSE ADDITIONS
// =====================================================================================================================
// ---------- Welsh hills: green rolling hills, dry-stone wall, sheep dots, a dirt course running into -Z with flags ----------
export function hillStage(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 38, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0] });
  const sky = sunnySky(st, { clouds: 9, seed: o.seed || 5 });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 5);
  const grass = floor(400, 400, '#7cbf58', 0, 0); grass.receiveShadow = true; g.add(grass);
  const path = floor(o.pathW || 4.2, 200, '#c9a878', 0, -80); path.position.y = 0.01; path.receiveShadow = true; g.add(path);
  const hillC = ['#5fa848', '#6fb552', '#4e9a40', '#83c060'];
  for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1; const h = M(sph, toon(hillC[i % 4]), side * (14 + r() * 26), -6, -30 - r() * 60); const s = 14 + r() * 16; h.scale.set(s, 8 + r() * 10, s * 0.8); h.receiveShadow = true; g.add(h); }
  // dry-stone walls
  const stoneM = toon('#9a9a8e');
  for (const side of [-1, 1]) for (let k = 0; k < 14; k++) { const b = rbox(2.0, 0.6, 0.45, '#9a9a8e', side * (o.wallX || 7), 0.3, 6 - k * 2.1, 0.08); b.rotation.y = Math.PI / 2 + (r() - 0.5) * 0.05; g.add(b); }
  // course flags along the path
  for (let k = 0; k < 10; k++) for (const side of [-1, 1]) { const f = new THREE.Group(); f.add(cyl(0.035, 0.035, 1.3, '#f4f4ee', 0, 0.65, 0, 6)); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.3), toon(k % 2 ? '#e8402a' : '#ffd23a', { side: THREE.DoubleSide })); fl.position.set(0.23, 1.15, 0); f.add(fl); f.position.set(side * 2.6, 0, 3 - k * 6); g.add(f); }
  // sheep (white blobs with dark heads) dotted on the grass
  const sheep = []; for (let i = 0; i < 14; i++) { const x = (i % 2 ? 1 : -1) * (9 + r() * 14), z = 4 - r() * 50; const sh = new THREE.Group(); const b = M(sph, toon('#f6f3ea'), 0, 0.5, 0); b.scale.set(0.55, 0.4, 0.75); sh.add(b); const hd = M(sph, toon('#2a2426'), 0, 0.6, 0.7); hd.scale.set(0.2, 0.22, 0.28); sh.add(hd); for (const [lx, lz] of [[-.25, .4], [.25, .4], [-.25, -.4], [.25, -.4]]) sh.add(cyl(0.05, 0.05, 0.35, '#2a2426', lx, 0.17, lz, 6)); sh.position.set(x, 0, z); sh.rotation.y = r() * 6; g.add(sh); sheep.push(sh); }
  outline(g, { px: 2 });
  const update = (t) => { sky.update?.(t); sheep.forEach((s, i) => { s.children[1].position.y = 0.6 + Math.sin(t * 2 + i) * 0.04; }); };
  return { stage: st, hills: { group: g, update } };
}
// finish arch with a banner
export function finishArch(txt = 'FINISH') { const g = new THREE.Group(); for (const s of [-1, 1]) g.add(cyl(0.15, 0.15, 3.6, '#f4f4ee', s * 2.4, 1.8, 0, 10));
  const tex = label(txt, '#e8402a', '#ffffff', 512, 128); g.add(rbox(5.2, 0.9, 0.15, '#e8402a', 0, 3.6, 0, 0.05)); const p = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 0.8), toon('#ffffff', { map: tex, fresh: true })); p.position.set(0, 3.6, 0.08); p.userData.noOutline = true; g.add(p);
  outline(g, { px: 2.4 }); return g; }

// ---------- the horse: chestnut toon horse ~2.6 units to the withers... head up to ~3.4; faces +Z ----------
// .update(t, { gallop 0..1, speed, lid, lidAngle (+smug), look:[x,y], jaw 0..1 (drop), ears, glasses bool, headUp })
export function horse(o = {}) {
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const coat = toon(o.color || '#a8612e'), dark = toon('#5a2e18'), hoof = toon('#2a2024'), muzz = toon('#d8b090');
  const body = new THREE.Group(); body.position.y = 1.55; g.add(body);
  const torso = M(sph, coat); torso.scale.set(0.55, 0.55, 1.05); body.add(torso);
  const rump = M(sph, coat, 0, 0.05, -0.6); rump.scale.set(0.58, 0.58, 0.6); body.add(rump);
  // neck + head
  const neck = new THREE.Group(); neck.position.set(0, 0.25, 0.75); body.add(neck);
  const nk = M(new THREE.CapsuleGeometry(0.3, 0.6, 6, 12), coat, 0, 0.4, 0.1); nk.rotation.x = 0.55; neck.add(nk);
  const head = new THREE.Group(); head.position.set(0, 0.85, 0.38); neck.add(head);
  const skull = M(sph, coat, 0, 0.05, 0); skull.scale.set(0.3, 0.3, 0.36); head.add(skull);
  const snout = M(new THREE.CapsuleGeometry(0.2, 0.42, 6, 12).rotateX(Math.PI / 2), coat, 0, -0.12, 0.38); snout.rotation.x = 0.35; head.add(snout);
  const jawG = new THREE.Group(); jawG.position.set(0, -0.26, 0.42); head.add(jawG);
  const jaw = M(sph, muzz, 0, -0.02, 0.18); jaw.scale.set(0.16, 0.07, 0.22); jawG.add(jaw);
  const nose = M(sph, muzz, 0, -0.2, 0.62); nose.scale.set(0.21, 0.15, 0.16); head.add(nose);
  for (const s of [-1, 1]) { const n = M(sph, flat('#3a2018'), s * 0.08, -0.2, 0.76); n.scale.setScalar(0.035); n.userData.noOutline = true; head.add(n); }
  const blaze = M(sph, toon('#f4efe6'), 0, 0.02, 0.33); blaze.scale.set(0.07, 0.24, 0.05); blaze.rotation.x = 0.35; blaze.userData.noOutline = true; head.add(blaze);
  const ears = []; for (const s of [-1, 1]) { const e = M(new THREE.ConeGeometry(0.08, 0.28, 10), coat, s * 0.15, 0.33, -0.05); e.rotation.z = -s * 0.2; head.add(e); ears.push({ e, s }); }
  // eyes with smug lids
  const eyes = []; for (const s of [-1, 1]) { const eg = new THREE.Group(); eg.position.set(s * 0.22, 0.1, 0.17); eg.rotation.y = s * 0.7; head.add(eg);
    const w = M(sph, toon('#fbf8f2')); w.scale.set(0.085, 0.1, 0.06); w.userData.noOutline = true; eg.add(w); const p = M(sph, flat('#1a1214'), 0, 0, 0.05); p.scale.set(0.045, 0.055, 0.02); p.userData.noOutline = true; eg.add(p);
    const lid = M(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), coat); lid.scale.set(0.095, 0.11, 0.07); lid.userData.noOutline = true; eg.add(lid); eyes.push({ eg, p, lid, s }); }
  const glasses = new THREE.Group(); { const gm = toon('#15151a'); for (const s of [-1, 1]) { const l = M(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 18).rotateX(Math.PI / 2), gm, s * 0.17, 0.12, 0.27); l.rotation.y = s * 0.45; glasses.add(l); } const br = M(new THREE.BoxGeometry(0.16, 0.025, 0.02), gm, 0, 0.14, 0.31); glasses.add(br); } head.add(glasses); glasses.visible = !!o.glasses;
  // mane + tail
  const maneM = dark; for (let i = 0; i < 6; i++) { const m = M(sph, maneM, 0, 0.2 + i * 0.13, -0.08 - i * 0.03); m.scale.set(0.07, 0.12, 0.12); neck.add(m); m.position.set(0, 0.25 + i * 0.14, 0.05 - i * 0.1 + 0.12); }
  const forelock = M(sph, maneM, 0, 0.3, 0.12); forelock.scale.set(0.12, 0.08, 0.1); head.add(forelock);
  const tailG = new THREE.Group(); tailG.position.set(0, 0.2, -1.12); body.add(tailG); const tl = M(new THREE.CapsuleGeometry(0.09, 0.7, 6, 10).translate(0, -0.35, 0), dark); tl.rotation.x = 0.35; tailG.add(tl);
  // legs: upper + lower + hoof, pivot at shoulder/hip
  const legs = []; for (const [x, z, fr] of [[0.28, 0.6, 1], [-0.28, 0.6, 1], [0.28, -0.65, 0], [-0.28, -0.65, 0]]) { const hip = new THREE.Group(); hip.position.set(x, -0.25, z); body.add(hip);
    const up = M(new THREE.CapsuleGeometry(0.12, 0.55, 6, 10).translate(0, -0.35, 0), coat); hip.add(up); const knee = new THREE.Group(); knee.position.y = -0.7; hip.add(knee);
    const lo = M(new THREE.CapsuleGeometry(0.075, 0.42, 6, 10).translate(0, -0.25, 0), coat); knee.add(lo); const hf = M(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12), hoof, 0, -0.55, 0.02); knee.add(hf);
    legs.push({ hip, knee, fr, x }); }
  // saddle cloth (number) for the race
  const sadTex = label(o.num || '7', '#2a5aa8', '#ffffff', 128, 96); for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), toon('#ffffff', { map: sadTex, side: THREE.DoubleSide, fresh: true })); c.position.set(s * 0.56, 0.12, 0.05); c.rotation.y = s * Math.PI / 2; c.userData.noOutline = true; body.add(c); }
  const saddle = M(sph, toon('#5a3a22'), 0, 0.5, 0.05); saddle.scale.set(0.42, 0.12, 0.45); body.add(saddle);
  outline(g, { px: 2.8 });
  root.add(blob(1.2, 0.3));
  root.seat = new THREE.Vector3(0, 2.15, 0.05);
  root.update = (t, u = {}) => { const { gallop = 0, speed = 2.2, lid = 0.2, lidAngle = 0, look = [0, 0], jaw: jw = 0, glasses: gv, headUp = 0, ears: ea = 0 } = u;
    const ph = t * speed * Math.PI * 2;
    legs.forEach((L, i) => { const off = [0, 0.5, 0.25, 0.75][i] * Math.PI * 2; const a = Math.sin(ph + off) * 0.7 * gallop; L.hip.rotation.x = a; L.knee.rotation.x = (L.fr ? 1 : -1) * Math.max(0, Math.sin(ph + off + 1.2)) * 0.9 * gallop; });
    body.position.y = 1.55 + Math.abs(Math.sin(ph)) * 0.15 * gallop; body.rotation.x = Math.sin(ph) * 0.06 * gallop;
    neck.rotation.x = 0.35 - headUp * 0.2 + Math.sin(ph + 0.6) * 0.12 * gallop; head.rotation.set(-0.45 - look[1] * 0.4 - headUp * 0.15, look[0] * 0.5, 0);
    tailG.rotation.x = 0.5 + Math.sin(ph) * 0.3 * gallop + Math.sin(t * 2) * 0.1; jawG.rotation.x = jw * 0.5;
    ears.forEach(({ e, s }) => { e.rotation.x = -ea * 0.8; e.rotation.z = -s * (0.2 + ea * 0.5); });
    eyes.forEach(({ eg, p, lid: L, s }) => { L.rotation.x = lerp(-1.6, 0, clamp(lid)); L.rotation.z = s * lidAngle * 0.8; p.position.x = look[0] * 0.02 * s; });
    if (gv != null) glasses.visible = gv; };
  root.head = head; root.headR = 0.36; root.eyes = []; root.update(0); return root;
}
// a rider sitting on the horse (bean in a helmet + jacket); call rider.ride(t, horse) after horse.update
export function rider(o = {}) { const b = bean({ outfit: 'uniform', colors: { main: o.color || '#2a5aa8', legs: '#f4f0e6', feet: '#2a2024' }, skin: o.skin || 'fair', hair: 'bob', hairColor: '#6a4a2a', seed: o.seed || 31, scale: 0.8 });
  const hat = new THREE.Group(); hat.add(M(new THREE.SphereGeometry(0.5, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#20202a'))); const peak = M(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 18, 1, false, -Math.PI / 2, Math.PI), toon('#20202a'), 0, 0, 0.32); hat.add(peak); hat.position.y = 0.2; outline(hat, { px: 2.4 }); b.parts.head.add(hat);
  b.ride = (t, h, gal = 1) => { b.position.set(h.position.x, h.position.y + 1.32 + Math.abs(Math.sin(t * 2.2 * Math.PI * 2)) * 0.12 * gal, h.position.z - 0.05); b.rotation.y = h.rotation.y;
    b.pose({ legL: [1.3, 0.55], legR: [1.3, 0.55], kneeL: 1.2, kneeR: 1.2, armL: [0.9, 0.15, 0.2], armR: [0.9, 0.15, 0.2], elbowL: 0.8, elbowR: 0.8, lean: 0.35 * gal }); };
  return b; }
// the runner: bean in a running vest with a race number on the chest
export function runner(o = {}) { const b = bean({ outfit: 'tee', colors: { main: o.color || '#e8402a', legs: '#20202a', feet: '#f4f4ee' }, skin: o.skin || 'fair', hair: o.hair || 'spiky', hairColor: o.hairColor || '#4a2e1e', seed: o.seed || 41, ...o.bean });
  const tex = label(o.num || '1', '#ffffff', '#20161a', 128, 96); const bib = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), toon('#ffffff', { map: tex, fresh: true })); bib.position.set(0, 0.55, 0.44); bib.userData.noOutline = true; b.parts.upper.add(bib);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.045, 6, 30), toon(o.band || '#ffd23a')); band.rotation.x = Math.PI / 2 - 0.12; band.position.set(0, 0.1, 0.02); b.parts.head.add(band);
  return b; }
// pub interior: back wall with shelves of bottles, a bar counter, a dartboard, warm light
export function pubSet(T, o = {}) { const st = toonStage(T, { light: 'warm', fov: o.fov || 38, shadowSize: 7, target: [0, 0, 0] }); const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 30, '#6a4228', 0, 0); fl.receiveShadow = true; g.add(fl); const wall = plane(30, 9, '#b8863a', 0, 4.5, -3.5); g.add(wall); const dado = plane(30, 1.4, '#6a3a1e', 0, 0.7, -3.49); g.add(dado);
  for (const x of [-6, -2, 2, 6]) { const beam = box(0.35, 9, 0.3, '#4a2a16', x, 4.5, -3.4); g.add(beam); }
  const shelf = box(4.2, 0.12, 0.4, '#4a2a16', 0.6, 3.0, -3.25); g.add(shelf); const bc = ['#3a7a3a', '#8a3a2a', '#d8b04a', '#3a4a8a']; for (let i = 0; i < 12; i++) g.add(cyl(0.08, 0.1, 0.45, bc[i % 4], -1.2 + i * 0.32, 3.3, -3.25, 10));
  const bar = rbox(5.5, 1.3, 0.9, '#5a3018', 1.8, 0.65, -1.6, 0.06); g.add(bar); g.add(rbox(5.8, 0.12, 1.1, '#3a1e0e', 1.8, 1.36, -1.6, 0.04));
  const dart = new THREE.Group(); dart.add(cyl(0.6, 0.6, 0.08, '#20202a', 0, 0, 0, 28)); dart.add(cyl(0.42, 0.42, 0.09, '#e8402a', 0, 0, 0, 28)); dart.add(cyl(0.12, 0.12, 0.1, '#3a8a3a', 0, 0, 0, 20)); dart.rotation.x = Math.PI / 2; dart.position.set(-4.2, 2.8, -3.4); g.add(dart);
  const table = rbox(1.4, 0.1, 1.0, '#5a3018', -1.6, 1.05, 0.6, 0.03); g.add(table); g.add(cyl(0.08, 0.1, 1.0, '#4a2a16', -1.6, 0.5, 0.6, 8));
  outline(g, { px: 2.2 }); return { stage: st, pub: { group: g, update() {} } }; }
export function pint(o = {}) { const g = new THREE.Group(); const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.36, 16), toon('#5a2a10', { transparent: true, opacity: 0.95 })); gl.position.y = 0.18; g.add(gl); const head = cyl(0.122, 0.122, 0.07, '#f4ecd8', 0, 0.38, 0, 16); g.add(head); outline(g, { px: 2 }); return g; }
// trophy + money bag props
export function trophy(o = {}) { const g = new THREE.Group(); const gold = toon('#ffd23a', { emissive: new THREE.Color('#ffaa22'), emissiveIntensity: 0.2 }); const cup = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0], [0.2, 0.02], [0.08, 0.15], [0.06, 0.35], [0.3, 0.55], [0.38, 0.95], [0.001, 0.95]].map(([a, b]) => new THREE.Vector2(a, b)), 24), gold); g.add(cup); for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 16, Math.PI), gold); h.position.set(s * 0.38, 0.72, 0); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(h); } g.add(rbox(0.45, 0.15, 0.45, '#3a2a22', 0, -0.07, 0, 0.03)); outline(g, { px: 2.4 }); return g; }
export function moneyBag() { const g = new THREE.Group(); const b = M(sph, toon('#c9a86a')); b.scale.set(0.55, 0.5, 0.5); b.position.y = 0.5; g.add(b); const n = M(new THREE.CylinderGeometry(0.12, 0.2, 0.2, 12), toon('#c9a86a'), 0, 1.0, 0); g.add(n); { const tie = M(new THREE.TorusGeometry(0.14, 0.035, 6, 16), toon('#8a5a2a'), 0, 0.95, 0); tie.rotation.x = Math.PI / 2; g.add(tie); }
  const tex = label('£', '#c9a86a', '#2f7a3a', 96, 96); const p = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), toon('#ffffff', { map: tex, fresh: true })); p.position.set(0, 0.5, 0.5); p.userData.noOutline = true; g.add(p); outline(g, { px: 2.4 }); g.add(blob(0.6, 0.3)); return g; }
export function hillLook(g, t, o = {}) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = alpha('#ffcf8a', o.k ?? 0.16); g.fillRect(0, 0, E.W, E.H); g.restore(); }
