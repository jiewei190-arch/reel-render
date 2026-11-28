// Spaghetti-tree hoax Short: shared 3D assets + 2D overlays (underscore = not auto-loaded). Overlay helpers + person() from the exploding-whale draft;
// new: orchardStage (Ticino: lake + mountains), spagTree() (noodles dangling, pluckable), weevil(), livingRoom() with a 1950s TV, presenter desk, phone, tomato tin.
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
// SPAGHETTI ADDITIONS
// =====================================================================================================================
// ---------- Ticino orchard: grass, a blue lake, green mountains with snowy tips, sunny sky ----------
export function orchardStage(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 38, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 0] });
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3 });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 3);
  const grass = floor(400, 400, '#8acb5a', 0, 0); grass.receiveShadow = true; g.add(grass);
  const lake = floor(200, 40, '#4aa0d8', 0, -46); lake.position.y = 0.02; g.add(lake);
  for (let i = 0; i < 9; i++) { const x = (i - 4) * 22 + (r() - 0.5) * 8, z = -80 - r() * 20; const h = 24 + r() * 22; const m = M(new THREE.ConeGeometry(16 + r() * 8, h, 7), toon(i % 2 ? '#5a9a6a' : '#4a8a5a'), x, h / 2 - 2, z); g.add(m);
    const cap = M(new THREE.ConeGeometry(5.5, h * 0.3, 7), toon('#f6f8fa'), x, h - 2 - h * 0.15 + 0.4, z); g.add(cap); }
  // a stone wall + a little Swiss chalet far off
  const chalet = new THREE.Group(); chalet.add(rbox(4, 2.6, 3, '#f2e6cc', 0, 1.3, 0, 0.05)); const roof = M(new THREE.ConeGeometry(3.4, 1.8, 4), toon('#8a3a2a'), 0, 3.4, 0); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.8; chalet.add(roof); chalet.position.set(-12, 0, -24); g.add(chalet);
  outline(g, { px: 2 });
  return { stage: st, orch: { group: g, update: (t) => sky.update?.(t) } };
}
// ---------- the spaghetti tree: brown trunk, round green canopy, golden noodle strands dangling and swaying ----------
// .update(t, { sway, pluck: [index, 0..1 stretch], grow 0..1 })  strands[i].tip world pos via .tipPos(i)
export function spagTree(o = {}) { const r = rng(o.seed || 2); const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const trunk = M(new THREE.CylinderGeometry(0.22, 0.32, 2.4, 12), toon('#8a5a32'), 0, 1.2, 0); g.add(trunk);
  for (const [a, l] of [[0.6, 0.9], [-0.7, 0.8], [0.1, 1.0]]) { const b = M(new THREE.CylinderGeometry(0.08, 0.13, l, 8).translate(0, l / 2, 0), toon('#8a5a32'), 0, 2.2, 0); b.rotation.z = a; g.add(b); }
  const can = new THREE.Group(); can.position.y = 3.0; g.add(can); const leaf = [toon('#5aa848'), toon('#6ab852'), toon('#4e9a3e')];
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const c = M(sph, leaf[i % 3], Math.cos(a) * 0.85, (r() - 0.3) * 0.5, Math.sin(a) * 0.75); c.scale.setScalar(0.75 + r() * 0.3); can.add(c); } { const top = M(sph, leaf[1], 0, 0.55, 0); top.scale.setScalar(1.05); can.add(top); }
  outline(g, { px: 2.6 });
  // noodles: chains of short thin capsules hanging from the canopy underside
  const noodleM = toon('#f2d48a'); const strands = []; const SEG = 0.16, NS = 9;
  const segGeo = new THREE.CapsuleGeometry(0.022, SEG, 3, 6).translate(0, -SEG / 2, 0);
  for (let i = 0; i < (o.n || 26); i++) { const a = r() * Math.PI * 2, rr = 0.4 + r() * 0.85; const base = new THREE.Group(); base.position.set(Math.cos(a) * rr, 2.6 + r() * 0.25, Math.sin(a) * rr * 0.9); g.add(base);
    const segs = []; let p = base; const n = NS - Math.floor(r() * 3); for (let k = 0; k < n; k++) { const sg = new THREE.Group(); if (k) sg.position.y = -SEG - 0.01; p.add(sg); const m = new THREE.Mesh(segGeo, noodleM); m.castShadow = true; sg.add(m); segs.push(sg); p = sg; }
    strands.push({ base, segs, ph: r() * 6, a }); }
  root.add(blob(1.4, 0.3));
  const v = new THREE.Vector3();
  root.tipPos = (i) => { const s = strands[i % strands.length]; s.segs[s.segs.length - 1].getWorldPosition(v); return v.clone(); };
  root.update = (t, u = {}) => { const { sway = 1, pluck = null, grow = 1 } = u; g.scale.setScalar((o.scale || 1) * Math.max(0.001, grow));
    strands.forEach((s, i) => { const pl = pluck && pluck[0] === i ? pluck[1] : 0; s.segs.forEach((sg, k) => { sg.rotation.z = Math.sin(t * 1.6 + s.ph + k * 0.5) * 0.06 * sway; sg.rotation.x = Math.sin(t * 1.2 + s.ph) * 0.04 * sway; sg.scale.y = 1 + pl * 0.6; }); }); };
  root.strands = strands; root.update(0); return root; }
// a basket of harvested spaghetti
export function basket() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.4, 16, 1, true), toon('#b8863a', { side: THREE.DoubleSide })); b.position.y = 0.2; g.add(b); g.add(cyl(0.32, 0.32, 0.03, '#a0702a', 0, 0.02, 0, 16));
  const nm = toon('#f2d48a'); for (let i = 0; i < 9; i++) { const n = new THREE.Mesh(new THREE.TorusGeometry(0.12 + (i % 3) * 0.06, 0.02, 4, 18), nm); n.position.set((i % 3 - 1) * 0.12, 0.38 + Math.floor(i / 3) * 0.03, ((i * 7) % 3 - 1) * 0.1); n.rotation.x = Math.PI / 2 + (i % 2) * 0.3; g.add(n); }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 6, 20, Math.PI), toon('#8a5a2a')); handle.position.y = 0.4; g.add(handle); outline(g, { px: 2.2 }); return g; }
export function ladder(h = 2.6) { const g = new THREE.Group(); for (const s of [-1, 1]) { const rl = cyl(0.04, 0.04, h, '#a0703a', s * 0.3, h / 2, 0, 6); g.add(rl); } for (let k = 1; k < 7; k++) g.add(cyl(0.03, 0.03, 0.6, '#a0703a', 0, k * h / 7, 0, 6).rotateZ(Math.PI / 2)); g.rotation.x = -0.2; outline(g, { px: 2 }); return g; }
// the spaghetti weevil (as the report "said"): a tiny green bug with a suitcase and a hat
export function weevil(o = {}) { const g = new THREE.Group(); const body = M(sph, toon('#6a8a3a'), 0, 0.3, 0); body.scale.set(0.3, 0.25, 0.4); g.add(body); const hd = M(sph, toon('#5a7a2a'), 0, 0.38, 0.35); hd.scale.setScalar(0.17); g.add(hd);
  const snout = M(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 8), toon('#5a7a2a'), 0, 0.33, 0.55); snout.rotation.x = 1.9; g.add(snout);
  for (const s of [-1, 1]) { const e = M(sph, toon('#ffffff'), s * 0.08, 0.44, 0.45); e.scale.setScalar(0.06); e.userData.noOutline = true; g.add(e); const p = M(sph, flat('#1a1214'), s * 0.08, 0.44, 0.5); p.scale.setScalar(0.03); p.userData.noOutline = true; g.add(p);
    for (let k = -1; k <= 1; k++) g.add(cyl(0.015, 0.015, 0.25, '#3a4a1a', s * 0.25, 0.12, k * 0.18, 4)); const ant = cyl(0.01, 0.01, 0.22, '#3a4a1a', s * 0.07, 0.6, 0.42, 4); ant.rotation.z = -s * 0.4; g.add(ant); }
  const hat = new THREE.Group(); hat.add(cyl(0.12, 0.12, 0.12, '#4a3a2a', 0, 0.08, 0, 14)); hat.add(cyl(0.2, 0.2, 0.02, '#4a3a2a', 0, 0.02, 0, 14)); hat.position.set(0, 0.52, 0.33); g.add(hat);
  const suit = rbox(0.3, 0.22, 0.1, '#8a3a2a', 0.3, 0.16, 0.1, 0.03); g.add(suit); outline(g, { px: 2.4 }); g.add(blob(0.35, 0.25)); g.scale.setScalar(o.scale || 1); return g; }
// 1950s living room with a wooden TV set whose screen shows a little spaghetti tree (canvas)
let _tvTex = null;
const tvTex = () => (_tvTex ||= canvasTex(320, 240, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#d8dcd8'); gr.addColorStop(1, '#8a908a'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  c.fillStyle = '#5a5e5a'; c.fillRect(W * 0.47, H * 0.45, W * 0.06, H * 0.45); c.fillStyle = '#6a706a'; c.beginPath(); c.arc(W / 2, H * 0.38, 70, 0, 7); c.fill(); c.strokeStyle = '#f4f2e8'; c.lineWidth = 3;
  for (let i = 0; i < 14; i++) { const x = W / 2 - 60 + i * 9; c.beginPath(); c.moveTo(x, H * 0.45); c.quadraticCurveTo(x + 4, H * 0.6, x - 2, H * 0.72); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1); }));
export function tvSet() { const g = new THREE.Group(); g.add(rbox(1.6, 1.3, 1.0, '#6a4228', 0, 1.35, 0, 0.1)); for (const s of [-1, 1]) g.add(cyl(0.04, 0.03, 0.7, '#4a2a16', s * 0.6, 0.35, 0.3, 6), cyl(0.04, 0.03, 0.7, '#4a2a16', s * 0.6, 0.35, -0.3, 6));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.78), toon('#ffffff', { map: tvTex(), emissive: new THREE.Color('#ffffff'), emissiveMap: tvTex(), emissiveIntensity: 0.6, fresh: true })); scr.position.set(-0.12, 1.38, 0.505); scr.userData.noOutline = true; g.add(scr);
  for (let i = 0; i < 2; i++) g.add(cyl(0.07, 0.07, 0.06, '#c9a14a', 0.6, 1.6 - i * 0.3, 0.5, 12).rotateX(Math.PI / 2)); const ant = cyl(0.015, 0.015, 0.8, '#3a3a3a', -0.2, 2.3, 0, 6); ant.rotation.z = 0.5; g.add(ant); const ant2 = cyl(0.015, 0.015, 0.8, '#3a3a3a', 0.2, 2.3, 0, 6); ant2.rotation.z = -0.5; g.add(ant2);
  outline(g, { px: 2.4 }); g.add(blob(1.0, 0.3)); return g; }
export function livingRoom(T, o = {}) { const st = toonStage(T, { light: 'warm', fov: o.fov || 38, shadowSize: 7, target: [0, 0, 0] }); const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 30, '#8a5a3a', 0, 0); fl.receiveShadow = true; g.add(fl); const wp = canvasTex(128, 128, (c, W, H) => { c.fillStyle = '#d8c8a0'; c.fillRect(0, 0, W, H); c.fillStyle = '#c4a878'; for (let x = 0; x < W; x += 32) for (let y = 0; y < H; y += 32) { c.beginPath(); c.arc(x + 16, y + 16, 5, 0, 7); c.fill(); } }); wp.wrapS = wp.wrapT = THREE.RepeatWrapping; wp.repeat.set(10, 4);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), toon('#ffffff', { map: wp })); wall.position.set(0, 4.5, -3.5); g.add(wall);
  const rugM = new THREE.Mesh(new THREE.CircleGeometry(2.6, 30), toon('#a83a2a')); rugM.rotation.x = -Math.PI / 2; rugM.position.set(0, 0.01, 0.5); g.add(rugM);
  const sofa = new THREE.Group(); sofa.add(rbox(3.0, 0.5, 1.1, '#3a6a5a', 0, 0.45, 0, 0.12), rbox(3.0, 1.0, 0.3, '#3a6a5a', 0, 1.0, -0.45, 0.12)); for (const s of [-1, 1]) sofa.add(rbox(0.3, 0.75, 1.1, '#2e5a4a', s * 1.5, 0.6, 0, 0.12)); sofa.position.set(0, 0, 2.6); sofa.rotation.y = Math.PI; g.add(sofa);
  const lampG = new THREE.Group(); lampG.add(cyl(0.03, 0.03, 1.8, '#3a3a3a', 0, 0.9, 0, 6), cyl(0.2, 0.25, 0.05, '#3a3a3a', 0, 0.02, 0, 12)); const shade = M(new THREE.CylinderGeometry(0.22, 0.38, 0.45, 16, 1, true), toon('#f2d8a0', { side: THREE.DoubleSide, emissive: new THREE.Color('#ffcc77'), emissiveIntensity: 0.4 }), 0, 1.9, 0); lampG.add(shade); lampG.position.set(2.6, 0, -2.6); g.add(lampG);
  const frame = rbox(1.2, 0.9, 0.06, '#8a5a2a', -2.4, 3.2, -3.45, 0.02); g.add(frame); const pic = plane(1.0, 0.7, '#7ab0d8', -2.4, 3.2, -3.41); g.add(pic);
  outline(g, { px: 2.2 }); return { stage: st, room: { group: g, sofa, update() {} } }; }
export function rotaryPhone(o = {}) { const g = new THREE.Group(); g.add(rbox(0.5, 0.25, 0.45, o.color || '#20202a', 0, 0.12, 0, 0.08)); const dial = cyl(0.16, 0.16, 0.03, '#f4f4ee', 0, 0.27, 0.06, 18); dial.rotation.x = -0.35; g.add(dial);
  const hs = new THREE.Group(); hs.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.42, 4, 8).rotateZ(Math.PI / 2), toon(o.color || '#20202a'))); for (const s of [-1, 1]) hs.add(ball(0.08, o.color || '#20202a', s * 0.24, -0.04, 0, 10)); hs.position.set(0, 0.36, -0.05); g.add(hs); outline(g, { px: 2.2 }); g.handset = hs; return g; }
export function tomatoTin(o = {}) { const g = new THREE.Group(); const tex = canvasTex(256, 128, (c, W, H) => { c.fillStyle = '#d6402a'; c.fillRect(0, 0, W, H); c.fillStyle = '#f4ecd8'; c.fillRect(0, H * 0.3, W, H * 0.4); c.fillStyle = '#d6402a'; c.font = '900 34px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TOMATO SAUCE', W / 2, H / 2 + 2); c.fillStyle = '#3a8a3a'; c.beginPath(); c.arc(30, H / 2, 10, 0, 7); c.fill(); });
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 24, 1, true), toon('#ffffff', { map: tex, fresh: true })); can.position.y = 0.3; g.add(can); g.add(cyl(0.35, 0.35, 0.02, '#c8ccd2', 0, 0.01, 0, 24)); const sauce = cyl(0.33, 0.33, 0.02, '#b8301e', 0, 0.55, 0, 24); g.add(sauce);
  for (const y of [0.04, 0.58]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 6, 24), toon('#c8ccd2')); rim.rotation.x = Math.PI / 2; rim.position.y = y; g.add(rim); }
  outline(g, { px: 2.2 }); g.add(blob(0.5, 0.3));
  // the sprig: 3 noodle strands sticking up from the sauce (bend in the breeze)
  const sprig = new THREE.Group(); sprig.position.y = 0.56; g.add(sprig); const nm = toon('#f2d48a'); const ns = [];
  for (let i = 0; i < 3; i++) { const sg = new THREE.Group(); sg.position.set((i - 1) * 0.05, 0, 0); sprig.add(sg); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.5, 3, 6).translate(0, 0.27, 0), nm); sg.add(m); ns.push(sg); }
  g.sprig = sprig; g.update = (t) => ns.forEach((n, i) => { n.rotation.z = Math.sin(t * 2 + i) * 0.15 + (i - 1) * 0.2; }); return g; }
export function wateringCan() { const g = new THREE.Group(); g.add(cyl(0.25, 0.28, 0.45, '#4a8ac0', 0, 0.22, 0, 16)); const sp = cyl(0.04, 0.06, 0.6, '#4a8ac0', 0.35, 0.35, 0, 8); sp.rotation.z = -1.0; g.add(sp); { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 12, Math.PI), toon("#4a8ac0")); hd.position.set(0, 0.5, 0); g.add(hd); } outline(g, { px: 2.2 }); return g; }
export function plateSpag() { const g = new THREE.Group(); g.add(cyl(0.45, 0.35, 0.05, '#f4f4ee', 0, 0.03, 0, 24)); const nm = toon('#f2d48a'); for (let i = 0; i < 10; i++) { const n = new THREE.Mesh(new THREE.TorusGeometry(0.12 + (i % 4) * 0.05, 0.02, 4, 20), nm); n.rotation.x = Math.PI / 2 + (i % 3 - 1) * 0.3; n.position.set((i % 3 - 1) * 0.05, 0.08 + i * 0.012, 0); g.add(n); } g.add(ball(0.12, '#c0392b', 0, 0.2, 0, 12)); outline(g, { px: 2.2 }); return g; }
export function orchardLook(g, t, o = {}) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = alpha('#ffcf8a', o.k ?? 0.16); g.fillRect(0, 0, E.W, E.H); g.restore(); }
