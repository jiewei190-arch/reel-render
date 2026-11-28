// Boring & Dull Short — shared assets. Toon welcome signs with sleepy faces (they yawn), roadside / village / outback sets,
// a cyclist, a planning-group meeting, a bagpiper. Generic toon people only; no real logos or real people's likeness.
import { E, wordTime, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, toonStage } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as TXT } from '/kits/toon3d/insert.js';
export { at, fxr, chip, stamp, callout, richLine } from './_hj.js';
import { richLine } from './_hj.js';
export { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, toonStage, PR, TXT, rng, sunnySky };
const INKC = '#2a1c15';

// ---------------------------------------------------------------- SLEEPY WELCOME SIGNS
// yawn envelope: 0 -> 1 (mouth wide) -> 0, starting at t0, lasting dur
export const yawnK = (t, t0, dur = 1.6) => { const u = (t - t0) / dur; if (u <= 0 || u >= 1) return 0; return u < 0.35 ? ease.inOut(u / 0.35) : u < 0.65 ? 1 : 1 - ease.inOut((u - 0.65) / 0.35); };
function drawSign(c, W, H, o, st) {
  c.clearRect(0, 0, W, H); const r = 34;
  c.fillStyle = o.border || '#ffffff'; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, r); c.fill();
  c.fillStyle = o.color; c.beginPath(); c.roundRect(16, 16, W - 32, H - 32, r - 10); c.fill();
  c.fillStyle = o.ink || '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (o.sub) { c.font = `800 ${H * 0.085 | 0}px Nunito`; c.fillText(o.sub, W / 2, H * 0.13); }
  c.font = `900 ${H * 0.2 | 0}px Nunito`; let fs = H * 0.2; while (c.measureText(o.name).width > W * 0.84) { fs *= 0.94; c.font = `900 ${fs | 0}px Nunito`; } c.fillText(o.name, W / 2, H * 0.29);
  if (o.under) { c.font = `800 ${H * 0.065 | 0}px Nunito`; c.fillText(o.under, W / 2, H * 0.43); }
  // face
  const ey = H * 0.6, ex = W * 0.17, er = H * 0.11, lid = clamp(st.lid ?? 0.55), yw = st.yawn || 0, lk = st.look || [0, 0];
  for (const s of [-1, 1]) { const x = W / 2 + s * ex;
    c.fillStyle = '#fbfaf4'; c.beginPath(); c.ellipse(x, ey, er, er * 1.1, 0, 0, 7); c.fill();
    c.fillStyle = '#1a1214'; c.beginPath(); c.arc(x + lk[0] * er * 0.4, ey + er * 0.25 + lk[1] * er * 0.3, er * 0.42, 0, 7); c.fill();
    const L = Math.max(lid, yw * 0.85); c.fillStyle = o.lidColor || o.color; c.fillRect(x - er - 2, ey - er * 1.1 - 2, er * 2 + 4, (er * 2.2 + 4) * L);
    c.strokeStyle = '#1a1214'; c.lineWidth = 7; c.beginPath(); c.ellipse(x, ey, er, er * 1.1, 0, 0, 7); c.stroke();
    if (L > 0.02) { c.beginPath(); c.moveTo(x - er, ey - er * 1.1 + er * 2.2 * L); c.lineTo(x + er, ey - er * 1.1 + er * 2.2 * L); c.stroke(); }
    c.lineWidth = 9; c.beginPath(); c.moveTo(x - er * 0.9, ey - er * 1.45 - yw * er * 0.3 + (st.brow || 0) * -er * 0.4); c.lineTo(x + er * 0.9, ey - er * 1.45 - yw * er * 0.3 + (st.brow || 0) * -er * 0.4 + s * (st.browTilt || 0) * er * 0.3); c.stroke(); }
  const my = H * 0.83; c.fillStyle = '#5a1a22'; c.strokeStyle = '#1a1214'; c.lineWidth = 7;
  if (yw > 0.04) { c.beginPath(); c.ellipse(W / 2, my, W * 0.07 + yw * W * 0.04, H * 0.025 + yw * H * 0.1, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#e8707a'; c.beginPath(); c.ellipse(W / 2, my + yw * H * 0.06, W * 0.05 * yw + 2, H * 0.03 * yw + 1, 0, 0, 7); c.fill(); }
  else if (st.mouth === 'o') { c.beginPath(); c.ellipse(W / 2, my, W * 0.035, H * 0.04, 0, 0, 7); c.fill(); c.stroke(); }
  else if (st.mouth === 'smile') { c.beginPath(); c.arc(W / 2, my - H * 0.05, W * 0.08, 0.3, Math.PI - 0.3); c.stroke(); }
  else { c.beginPath(); c.moveTo(W / 2 - W * 0.07, my); c.lineTo(W / 2 + W * 0.07, my); c.stroke(); }
}
// sign({ name, sub, under, color, ink, w, h, post }) — faces +Z. .set(t, { lid, yawn, look, brow, mouth }) redraws the face.
export function sign(o = {}) {
  const root = new THREE.Group(); const w = o.w || 2.0, h = o.h || 1.5, py = o.post ?? 1.1;
  const pc = o.postColor || '#7a5a3a'; for (const s of [-1, 1]) root.add(cyl(0.07, 0.08, py + h * 0.5, pc, s * w * 0.32, (py + h * 0.5) / 2, -0.06, 10));
  root.add(rbox(w + 0.08, h + 0.08, 0.1, '#e8e4d8', 0, py + h / 2, -0.03, 0.06));
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * h / w); const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: tex, transparent: true, fresh: true })); face.position.set(0, py + h / 2, 0.025); face.userData.noOutline = true; root.add(face);
  outline(root, { px: 2.6 }); root.add(blob(w * 0.5, 0.25));
  const head = new THREE.Object3D(); head.position.set(0, py + h * 0.62, 0.1); root.add(head); root.head = head; root.headR = h * 0.4;
  root.set = (t, st = {}) => { drawSign(ctx, cv.width, cv.height, o, st); tex.needsUpdate = true; };
  root.board = face; root.topY = py + h; root.set(0, {}); return root;
}
export const SIGN = {
  boring: { name: 'BORING', sub: 'WELCOME TO', under: 'OREGON', color: '#2f7a4a' },
  dull: { name: 'DULL', sub: 'WELCOME TO', under: 'SCOTLAND', color: '#2a4f8a' },
  bland: { name: 'BLAND', sub: 'WELCOME TO', under: 'AUSTRALIA', color: '#c8862a', ink: '#ffffff' },
};
// a flapping superhero cape behind a sign (update(t))
export function cape(o = {}) { const w = o.w || 2.4, h = o.h || 2.2; const geo = new THREE.PlaneGeometry(w, h, 12, 10); const base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, toon(o.color || '#d8342c', { side: THREE.DoubleSide, fresh: true })); m.castShadow = true; m.userData.noOutline = true; const g = new THREE.Group(); g.add(m);
  g.update = (t, k = 1) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; const d = (h / 2 - y) / h; p.setZ(i, -d * (0.6 + 0.35 * Math.sin(t * 6 + x * 2 + y * 1.5)) * k); p.setX(i, x * (1 + d * 0.25)); } p.needsUpdate = true; geo.computeVertexNormals(); };
  g.update(0); return g; }

// ---------------------------------------------------------------- SETS
const tree = (h = 3, c = '#2f6a3a') => { const g = new THREE.Group(); g.add(cyl(0.12, 0.16, h * 0.3, '#6a4a2e', 0, h * 0.15, 0, 8)); for (let i = 0; i < 3; i++) { const cn = new THREE.Mesh(new THREE.ConeGeometry(h * (0.32 - i * 0.07), h * 0.42, 10), toon(c)); cn.position.y = h * (0.42 + i * 0.2); cn.castShadow = true; g.add(cn); } return g; };
// Oregon roadside: grass, a road, firs, a snowy mountain far back
export function roadside(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3 });
  g.add(floor(120, 120, o.grass || '#6aa84a', 0, 0)); const road = floor(120, 3.2, '#5a5a62', 0, 3.4); road.position.y = 0.01; g.add(road);
  const dash = floor(120, 0.12, '#f2d25a', 0, 3.4); dash.position.y = 0.02; g.add(dash);
  const r = rng(o.seed || 5); for (let i = 0; i < 22; i++) { const t = tree(2.5 + r() * 2.5); t.position.set(-24 + r() * 48, 0, -4 - r() * 20); g.add(t); }
  if (o.mountain !== false) { const mt = new THREE.Mesh(new THREE.ConeGeometry(16, 14, 6), toon('#7a8aa8')); mt.position.set(6, 6, -60); g.add(mt); const cap = new THREE.Mesh(new THREE.ConeGeometry(5.4, 4.8, 6), toon('#f4f8ff')); cap.position.set(6, 10.6, -60); g.add(cap); }
  outline(g, { px: 1.8 }); return { group: g, sky, update(t) { sky.update?.(t); } };
}
// Scottish village: rolling green hills, stone cottages, a few sheep
export function village(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const sky = sunnySky(st, { clouds: 11, seed: 7, top: '#5a8ac0', mid: '#a8c8e0', horizon: '#e8e8e0' });
  g.add(floor(140, 140, '#5a9a4a', 0, 0)); const r = rng(8);
  for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(14, 24, 12), toon(['#4a8a3e', '#5f9a4a', '#3f7a38'][i % 3])); h.scale.set(1.4, 0.45, 1); h.position.set(-40 + i * 16, -2, -40 - r() * 14); g.add(h); }
  for (let i = 0; i < 4; i++) { const c = new THREE.Group(); c.add(rbox(2.4, 1.4, 1.6, '#a8a49a', 0, 0.7, 0, 0.05)); const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1.45, 2.6, 3), toon('#4a4a52')); roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.rotation.x = Math.PI / 6 * 0; roof.position.y = 1.85; roof.scale.set(1, 1, 0.6); c.add(roof);
    c.add(rbox(0.5, 0.8, 0.05, '#6a3a2a', 0.4, 0.4, 0.81, 0.02), rbox(0.45, 0.4, 0.05, '#bfe0ff', -0.6, 0.85, 0.81, 0.02), rbox(0.3, 0.6, 0.3, '#8a867c', 0.8, 2.2, 0, 0.03)); c.position.set(-7 + i * 4.2 + r(), 0, -7 - r() * 4); c.rotation.y = (r() - 0.5) * 0.4; g.add(c); }
  const sheep = []; for (let i = 0; i < 5; i++) { const s = new THREE.Group(); s.add(ball(0.42, '#f4f2ea', 0, 0.5, 0, 12)); s.children[0].scale.set(1.3, 0.9, 0.9); s.add(ball(0.18, '#2a2426', 0.55, 0.62, 0, 10)); for (const [x, z] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) s.add(cyl(0.05, 0.05, 0.3, '#2a2426', x, 0.15, z, 6)); s.position.set(-5 + r() * 10, 0, -2 - r() * 4); s.rotation.y = r() * 6; g.add(s); sheep.push(s); }
  outline(g, { px: 1.8 }); return { group: g, sky, sheep, update(t) { sheep.forEach((s, i) => { s.children[1].position.y = 0.62 - Math.max(0, Math.sin(t * 1.2 + i * 2)) * 0.15; }); } };
}
// Australian outback: red dirt, gum trees
export function outback(st) { const g = new THREE.Group(); st.add(g); const sky = sunnySky(st, { clouds: 4, seed: 12 }); g.add(floor(140, 140, '#c8743a', 0, 0)); const r = rng(13);
  for (let i = 0; i < 7; i++) { const tr = PR.gumTree ? PR.gumTree() : tree(3, '#6a8a4a'); tr.position.set(-20 + r() * 40, 0, -6 - r() * 16); g.add(tr); } return { group: g, sky, update() {} }; }
// the meeting hall: rows of chairs with seated planning-group members, a podium + a ballot box
export function hall(st) { const g = new THREE.Group(); st.add(g); g.add(floor(40, 30, '#8a6a4a', 0, 0)); g.add(plane(40, 10, '#d8c8a0', 0, 5, -6));
  const ban = canvasTex(512, 96, (c, W, H) => { c.fillStyle = '#2f7a4a'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.font = '900 44px Nunito'; c.textAlign = 'center'; c.fillText('PLANNING GROUP MEETING', W / 2, 64); });
  const b = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.1), toon('#ffffff', { map: ban })); b.position.set(0, 4.3, -5.9); g.add(b);
  const clock = new THREE.Group(); clock.add(cyl(0.45, 0.45, 0.08, '#fbfaf4', 0, 0, 0, 24)); clock.children[0].rotation.x = Math.PI / 2; clock.position.set(4.2, 4.3, -5.9); outline(clock, { px: 2 }); g.add(clock);
  return { group: g }; }
// bicycle: wheels + frame; .spin(a)
export function bicycle() { const g = new THREE.Group(); const wm = toon('#2a2a30'); const wheels = [];
  for (const x of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 8, 24), wm); w.position.set(x, 0.38, 0); g.add(w); const sp = new THREE.Group(); for (let i = 0; i < 4; i++) { const s = cyl(0.008, 0.008, 0.7, '#c9ccd2', 0, 0, 0, 4); s.rotation.z = i * Math.PI / 4; sp.add(s); } sp.position.copy(w.position); g.add(sp); wheels.push(sp); }
  const fr = (x1, y1, x2, y2) => { const l = Math.hypot(x2 - x1, y2 - y1); const m = cyl(0.03, 0.03, l, '#d8342c', (x1 + x2) / 2, (y1 + y2) / 2, 0, 8); m.rotation.z = Math.atan2(x1 - x2, y2 - y1); g.add(m); };
  fr(-0.55, 0.38, 0, 0.38); fr(0, 0.38, 0.45, 0.85); fr(-0.55, 0.38, -0.15, 0.85); fr(-0.15, 0.85, 0.45, 0.85); fr(0, 0.38, -0.15, 0.85); fr(0.55, 0.38, 0.45, 0.85);
  g.add(rbox(0.3, 0.06, 0.12, '#2a2a30', -0.18, 0.92, 0, 0.03), cyl(0.02, 0.02, 0.45, '#2a2a30', 0.48, 1.0, 0, 6).rotateX(Math.PI / 2));
  outline(g, { px: 2 }); g.spin = (a) => wheels.forEach(w => { w.rotation.z = -a; }); return g; }
export function bagpipe() { const g = new THREE.Group(); const bag = ball(0.28, '#b8342c', 0, 0, 0, 16); bag.scale.set(1, 0.8, 0.7); g.add(bag);
  for (let i = 0; i < 3; i++) { const d = cyl(0.025, 0.03, 0.7 + i * 0.15, '#2a1a14', -0.1 + i * 0.12, 0.45 + i * 0.07, -0.05, 8); d.rotation.z = 0.35; g.add(d); g.add(ball(0.045, '#e8d8a0', -0.1 + i * 0.12 - Math.sin(0.35) * (0.35 + i * 0.075), 0.45 + i * 0.07 + Math.cos(0.35) * (0.35 + i * 0.075), -0.05, 8)); }
  const ch = cyl(0.025, 0.035, 0.5, '#2a1a14', 0.15, -0.25, 0.15, 8); ch.rotation.x = 0.4; g.add(ch); outline(g, { px: 2.2 }); return g; }
export const person = (o = {}) => bean({ outfit: 'tee', skin: 'fair', hair: 'bowl', colors: { main: '#6a8ac8', legs: '#3a3f4a' }, seed: 5, ...o });

// ---------------------------------------------------------------- 2D
// frame-1 top caption: 2 lines, centre-top; gt = global time, visible 0..3.5 s
export function topCaption(g, gt, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  const k1 = ease.outBack(clamp((gt + 0.25) / 0.3)), k2 = ease.outBack(clamp((gt + 0.08) / 0.3));
  g.save(); g.globalAlpha = fade;
  g.save(); g.translate(540, 300); g.scale(k1, k1); g.translate(-540, -300); richLine(g, [['a town called', '#ffffff'], ['BORING', '#ffd23a']], 300, 80); g.restore();
  g.save(); g.translate(540, 410); g.scale(k2, k2); g.translate(-540, -410); richLine(g, [['teamed up with', '#ffffff'], ['DULL', '#ff5a4a']], 410, 80); g.restore();
  g.restore();
}
// 2D lightbulb (the idea), pops at age 0
export function bulb(g, x, y, age, s = 1) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)) * s; g.save(); g.translate(x, y); g.scale(k, k);
  g.strokeStyle = '#ffe680'; g.lineWidth = 10; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + age; g.globalAlpha = 0.6 + 0.4 * Math.sin(age * 8 + i); g.beginPath(); g.moveTo(Math.cos(a) * 90, Math.sin(a) * 90 - 10); g.lineTo(Math.cos(a) * 120, Math.sin(a) * 120 - 10); g.stroke(); } g.globalAlpha = 1;
  g.fillStyle = '#ffe14a'; g.strokeStyle = INKC; g.lineWidth = 8; g.beginPath(); g.arc(0, -10, 60, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#b8b4ac'; g.fillRect(-28, 42, 56, 34); g.strokeRect(-28, 42, 56, 34); g.restore(); }
// a wall-calendar page (AUG / 9)
export function calendar(g, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.35)); g.save(); g.translate(x, y); g.scale(k, k); g.rotate(-0.05);
  g.fillStyle = '#fbfaf4'; g.strokeStyle = INKC; g.lineWidth = 12; g.beginPath(); g.roundRect(-230, -260, 460, 520, 30); g.fill(); g.stroke(); g.fillStyle = '#d8342c'; g.beginPath(); g.roundRect(-230, -260, 460, 150, [30, 30, 0, 0]); g.fill(); g.stroke();
  TXT(g, o.month || 'AUGUST', 0, -185, 74, { color: '#ffffff', stroke: INKC }); TXT(g, o.day || '9', 0, 80, 300, { color: INKC }); g.fillStyle = INKC; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * 120 - 14, -300, 28, 80, 10); g.fill(); } g.restore(); }
// single sad confetti pieces falling (the deadpan "celebration")
export function sadConfetti(g, t, n = 3, o = {}) { const r = rng(o.seed || 2); for (let i = 0; i < n; i++) { const x0 = (o.x ?? 540) + (r() - 0.5) * (o.spread ?? 160), t0 = r() * 0.4; const tt = t - t0; if (tt < 0) continue;
  const y = (o.y ?? 300) + tt * 140, x = x0 + Math.sin(tt * 3 + i) * 40; g.save(); g.translate(x, y); g.rotate(tt * 3 + i); g.fillStyle = ['#ffd23a', '#ff5a7a', '#4ac0ff'][i % 3]; g.fillRect(-14, -8, 28, 16); g.restore(); } }
// heroic god rays from the top
export function heroRays(g, t, a = 1) { g.save(); g.globalCompositeOperation = 'screen'; g.translate(540, -100); for (let i = 0; i < 9; i++) { const ang = -0.9 + i * 0.22 + Math.sin(t * 0.6 + i) * 0.03; g.rotate(0); g.fillStyle = `rgba(255,220,120,${0.13 * a})`; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ang - 0.05) * 2400, Math.cos(ang - 0.05) * 2400); g.lineTo(Math.sin(ang + 0.05) * 2400, Math.cos(ang + 0.05) * 2400); g.fill(); } g.restore(); }
