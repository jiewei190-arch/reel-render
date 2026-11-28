// Toledo War Short: shared 3D assets + 2D overlays (underscore = not auto-loaded).
// Two generic toon governors (no likenesses), the border strip with its TOLEDO sign, a river with two militias,
// a snowy pine wilderness, copper/iron rocks. 2D chips/stamps/top caption copied from the octopus Short.
import { wordTime, rng, clamp, lerp, ease, prog, E, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, plane, floor, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { bean, POSE, EXPR } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as TXT } from '/kits/toon3d/insert.js';
import { reactions as _reactions, anchor } from '/kits/toon3d/react.js';

export { THREE, toon, flat, outline, rbox, box, cyl, ball, plane, floor, blob, canvasTex, toonStage, INK, anchor, rng };

// time of a spoken word (nth occurrence), shot-local
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));

// ---------------------------------------------------------------- 2D
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || '#2a1c15' }); g.restore(); }
export function stamp(g, str, x, y, age, o = {}) { if (age < 0) return; if (o.until != null && age > o.until) return; const k = clamp(age / 0.18); const s = lerp(2.4, 1, ease.out(k)); g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  const size = o.size || 84; g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.86) + size * 0.7, h = size * 1.35; g.lineWidth = 12; g.strokeStyle = o.color || '#e8402a'; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); TXT(g, str, 0, 4, size, { color: o.color || '#e8402a', maxW: E.W * 0.84 }); g.restore(); }
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: '#2a1c15' }); x += ws[i] + sp; }); g.restore(); }
// frame-1 top caption: 2 lines centre-top, WAR red, TOLEDO gold; visible 0..3.5 s (gt = global time)
export function topCaption(g, gt, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  const k1 = ease.outBack(clamp((gt + 0.25) / 0.3)), k2 = ease.outBack(clamp((gt + 0.08) / 0.3));
  g.save(); g.globalAlpha = fade;
  g.save(); g.translate(540, 300); g.scale(k1, k1); g.translate(-540, -300); richLine(g, [['Ohio', '#ffffff'], ['vs', '#ffffff'], ['Michigan', '#ffffff']], 300, 80); g.restore();
  g.save(); g.translate(540, 410); g.scale(k2, k2); g.translate(-540, -410); richLine(g, [['nearly', '#ffffff'], ['WAR', '#ff4a3a'], ['over', '#ffffff'], ['TOLEDO', '#ffd23a']], 410, 80); g.restore();
  g.restore();
}
// speech bubble with a taunt (2D), pointing down to (x, y)
export function bubble(g, str, x, y, age, o = {}) { if (age < 0) return; if (o.until != null && age > o.until) return; const k = ease.outBack(clamp(age / 0.25)); const size = o.size || 54;
  g.save(); g.translate(x, y - (o.lift || 120)); g.scale(k, k); g.rotate((o.rot || 0) * Math.PI / 180); g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size, h = size * 1.6;
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 24); g.moveTo(-14 * (o.dir || 1), h / 2 - 2); g.lineTo(-4 * (o.dir || 1) - 30 * (o.dir || 1), h / 2 + 34); g.lineTo(18 * (o.dir || 1), h / 2 - 2);
  g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#2a1c15'; g.stroke(); TXT(g, str, 0, 2, size, { color: o.color || '#2a1c15' }); g.restore(); }
// staring-contest lightning between two eye points
export function zap(g, a, b, t, o = {}) { const n = 9; g.save(); g.lineJoin = 'round'; for (const [lw, col] of [[16, '#2a1c15'], [8, o.color || '#ffe14a']]) { g.lineWidth = lw; g.strokeStyle = col; g.beginPath();
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u) + (i % n ? Math.sin(i * 2.1 + Math.floor(t * 14) * 1.7) * 26 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } g.restore(); }
// a little penknife icon (closed blade) — the only "weapon" ever shown, and only as an icon
export function penknife(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineWidth = 8; g.strokeStyle = '#2a1c15';
  g.beginPath(); g.roundRect(-90, -22, 180, 44, 22); g.fillStyle = '#c8402a'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-60, -22); g.lineTo(70, -22); g.lineTo(40, -48); g.lineTo(-60, -40); g.closePath(); g.fillStyle = '#d8dde4'; g.fill(); g.stroke();
  g.fillStyle = '#ffffff'; g.fillRect(-14, -6, 28, 12); g.fillRect(-6, -14, 12, 28); g.restore(); }
// rosette ribbon "consolation prize"
export function rosette(g, x, y, s, age, txt = 'UP') { if (age < 0) return; const k = ease.outBack(clamp(age / 0.35)); g.save(); g.translate(x, y); g.scale(s * k, s * k); g.rotate(Math.sin(age * 3) * 0.06);
  g.lineWidth = 7; g.strokeStyle = '#2a1c15'; for (const d of [-1, 1]) { g.beginPath(); g.moveTo(0, 20); g.lineTo(d * 60, 200); g.lineTo(d * 30, 180); g.lineTo(d * 8, 210); g.lineTo(d * 10, 40); g.closePath(); g.fillStyle = '#4a7ad8'; g.fill(); g.stroke(); }
  g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 92 : 110; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = '#6a9af0'; g.fill(); g.stroke();
  g.beginPath(); g.arc(0, 0, 64, 0, 7); g.fillStyle = '#f2f6ff'; g.fill(); g.stroke(); TXT(g, txt, 0, 4, 56, { color: '#2a4a9a' }); g.restore(); }

// the "bad map" card (2D): an old map, lakes, the two survey lines and the strip between them
export function mapCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.4)); g.save(); g.translate(540, 900); g.scale(k, k); g.rotate(-0.03);
  g.fillStyle = '#efe0b8'; g.strokeStyle = '#2a1c15'; g.lineWidth = 10; g.beginPath(); g.roundRect(-460, -520, 920, 1040, 30); g.fill(); g.stroke();
  g.fillStyle = 'rgba(160,120,60,0.18)'; for (let i = 0; i < 40; i++) { const r = rng(i + 3); g.beginPath(); g.arc((r() - 0.5) * 860, (r() - 0.5) * 980, 6 + r() * 30, 0, 7); g.fill(); }
  // Lake Michigan (tall blob, left) and Lake Erie (diagonal, right)
  const lake = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = '#7ab8e8'; g.fill(); g.lineWidth = 6; g.stroke(); };
  const lmY = lerp(0, -170, ease.inOut(prog(t, o.wrongAt ?? 99, (o.wrongAt ?? 99) + 0.5)));   // the wrong map: the lake slides north
  lake([[-360, -430 + lmY], [-250, -440 + lmY], [-220, -200 + lmY], [-240, 60 + lmY], [-290, 140 + lmY], [-340, 60 + lmY], [-380, -200 + lmY]]);
  lake([[60, 160], [200, 90], [380, 10], [430, 40], [300, 150], [120, 250], [40, 230]]);
  TXT(g, 'LAKE', -300, -120 + lmY, 34, { color: '#1e4a7a' }); TXT(g, 'ERIE', 260, 90, 34, { color: '#1e4a7a' });
  // two survey lines: the strip between them
  const s1 = prog(t, o.linesAt ?? 0.5, (o.linesAt ?? 0.5) + 0.5), s2 = prog(t, (o.linesAt ?? 0.5) + 0.3, (o.linesAt ?? 0.5) + 0.8);
  const yA = 140, yB = 60;
  if (s2 > 0) { g.save(); g.globalAlpha = s2; g.fillStyle = 'rgba(255,200,40,0.55)'; g.beginPath(); g.moveTo(-240, yA); g.lineTo(-240 + 520 * s2, yA - 20 * s2); g.lineTo(-240 + 520 * s2, yB - 80 * s2); g.lineTo(-240, yB); g.closePath(); g.fill(); g.restore(); }
  g.setLineDash([26, 18]); g.lineWidth = 9; g.strokeStyle = '#c8302a'; g.beginPath(); g.moveTo(-240, yA); g.lineTo(-240 + 520 * s1, yA - 20 * s1); g.stroke();
  g.strokeStyle = '#2a5ac8'; g.beginPath(); g.moveTo(-240, yB); g.lineTo(-240 + 520 * s2, yB - 80 * s2); g.stroke(); g.setLineDash([]);
  if (s2 >= 1) { TXT(g, 'OHIO', -40, 330, 64, { color: '#c8302a' }); TXT(g, 'MICHIGAN', -60, -160, 64, { color: '#2a5ac8' }); }
  g.beginPath(); g.arc(270, 60, 16, 0, 7); g.fillStyle = '#2a1c15'; g.fill(); TXT(g, 'Toledo', 330, 110, 36, { color: '#2a1c15' });
  g.restore();
}
// scoreboard card (2D): rows [label, value]
export function scoreCard(g, t, rows, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(540, o.y ?? 860); g.scale(k, k); g.rotate((o.rot ?? -2) * Math.PI / 180);
  const H = 130 + rows.length * 130; g.fillStyle = '#23402e'; g.strokeStyle = '#2a1c15'; g.lineWidth = 12; g.beginPath(); g.roundRect(-430, -H / 2, 860, H, 28); g.fill(); g.stroke();
  g.strokeStyle = '#c89a4a'; g.lineWidth = 8; g.beginPath(); g.roundRect(-405, -H / 2 + 25, 810, H - 50, 18); g.stroke();
  TXT(g, o.title || 'THE TOLEDO WAR', 0, -H / 2 + 85, 56, { color: '#ffd23a' });
  rows.forEach(([l, v], i) => { const a = clamp((t - 0.35 - i * 0.35) / 0.2); if (a <= 0) return; g.save(); g.globalAlpha = a; const y = -H / 2 + 200 + i * 130;
    g.font = '900 64px Nunito'; g.textAlign = 'left'; g.fillStyle = '#f2ead6'; g.fillText(l, -360, y + 22); g.textAlign = 'right'; g.fillStyle = o.valColor?.[i] || '#ffffff'; g.fillText(v, 360, y + 22); g.restore(); });
  g.restore(); }

// ---------------------------------------------------------------- 3D: people
// a stovepipe hat on a bean's head
export function topHat(b, color = '#2a2430', band = '#8a2a2a') { const h = b.parts.head; const g = new THREE.Group();
  g.add(cyl(0.6, 0.6, 0.05, color, 0, 0, 0, 28), cyl(0.36, 0.38, 0.62, color, 0, 0.32, 0, 24), cyl(0.385, 0.385, 0.1, band, 0, 0.08, 0, 24)); g.position.set(0, 0.36, -0.02); g.rotation.x = -0.12; h.add(g); outline(g, { px: 2.8 }); return g; }
// OHIO governor: older, grey sideburns, red-brown coat. MICHIGAN governor: the young one, swoop hair, navy coat. Both generic.
export function govOH(o = {}) { const b = bean({ name: 'OH', outfit: 'uniform', skin: 'fair', hair: 'horseshoe', hairColor: '#b8b0a8', browColor: '#8a827a', moustache: '#b8b0a8', colors: { main: '#a8402e', legs: '#3a2c28', belt: '#2a2024' }, seed: 11, ...o }); topHat(b, '#2a2430', '#a8402e'); return b; }
export function govMI(o = {}) { const b = bean({ name: 'MI', outfit: 'uniform', skin: 'light', hair: 'swoop', hairColor: '#5a3a22', colors: { main: '#2e4e8e', legs: '#2a2e3a', belt: '#1e2030' }, scale: 0.94, headScale: [1.06, 1.06, 1.06], seed: 23, ...o }); topHat(b, '#22283a', '#2e4e8e'); return b; }
export const militia = (side, i, o = {}) => bean({ name: `${side}${i}`, outfit: 'uniform', skin: ['fair', 'tan', 'light', 'olive', 'brown'][i % 5], hair: ['bowl', 'curly', 'spiky', 'messy', 'swoop'][i % 5], head: i % 2 ? 'cap' : 'none', headColor: side === 'OH' ? '#7a2a22' : '#22305a',
  colors: { main: side === 'OH' ? ['#b04a34', '#9a3a2a'][i % 2] : ['#3a5a9a', '#2e4a82'][i % 2], legs: '#3a3430' }, seed: 60 + i + (side === 'OH' ? 0 : 20), ...o });
export const civilian = (o = {}) => bean({ outfit: 'tunic', skin: 'fair', hair: 'curly', colors: { main: '#7a8a4a', legs: '#4a3a2a' }, seed: 5, ...o });
// a musket: long stick + barrel (a prop, aimed only at the sky)
export function musket() { const g = new THREE.Group(); g.add(cyl(0.035, 0.035, 1.6, '#6a4228', 0, 0, 0, 8), cyl(0.02, 0.02, 0.9, '#3a3a40', 0, 1.1, 0, 8)); outline(g, { px: 2.2 }); return g; }
// a plain pennant on a pole (no real flags): solid colour
export function pennant(color) { const g = new THREE.Group(); g.add(cyl(0.035, 0.035, 3.2, '#6a4a2a', 0, 1.6, 0, 8)); const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(1.1, -0.3); s.lineTo(0, -0.6); s.closePath();
  const f = new THREE.Mesh(new THREE.ShapeGeometry(s), toon(color, { side: THREE.DoubleSide })); f.position.set(0.03, 3.15, 0); g.add(f); g.flag = f; outline(g, { px: 2 }); return g; }

// ---------------------------------------------------------------- 3D: sets
const signTex = (txt, bg = '#f2e3bd', ink = '#2a1c15') => canvasTex(512, 200, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(120,80,40,0.25)'; for (let i = 0; i < 6; i++) c.fillRect(0, 20 + i * 32, W, 3);
  c.strokeStyle = ink; c.lineWidth = 12; c.strokeRect(8, 8, W - 16, H - 16); c.font = '900 120px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = ink; c.fillText(txt, W / 2, H / 2 + 6); });
export function signPost(txt = 'TOLEDO', o = {}) { const g = new THREE.Group(); const W = o.w || 1.5;
  g.add(cyl(0.06, 0.07, 1.9, '#7a5a3a', 0, 0.95, 0, 8)); const Y = o.h || 1.75; g.children[0].scale.y = Y / 1.75; g.children[0].position.y = Y * 0.54; const b = rbox(W, W * 0.4, 0.1, '#c9a46a', 0, Y, 0, 0.03); g.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.94, W * 0.36), toon('#ffffff', { map: signTex(txt), fresh: true })); f.position.set(0, Y, 0.056); f.userData.noOutline = true; g.add(f);
  const bk = f.clone(); bk.rotation.y = Math.PI; bk.position.z = -0.056; g.add(bk); outline(g, { px: 2.4 }); return g; }
const tree = (x, z, s = 1, c = '#4a8a3a') => { const g = new THREE.Group(); g.add(cyl(0.12 * s, 0.16 * s, 1.2 * s, '#7a5634', 0, 0.6 * s, 0, 8)); const b = ball(0.9 * s, c, 0, 1.7 * s, 0, 16); b.scale.y = 1.1; g.add(b); g.position.set(x, 0, z); return g; };
// border set: sunny field, a dirt strip running away from camera (the Toledo Strip) with its sign; Ohio left (-X), Michigan right (+X)
export function borderSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 38, shadowSize: 8, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 8, seed: o.seed || 4 });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 7);
  g.add(floor(80, 80, '#8acb5a', -20, 0), floor(80, 80, '#7cbf52', 20, 0));
  const strip = floor(1.5, 80, '#c8a46a', 0, -30); strip.position.y = 0.012; strip.receiveShadow = true; g.add(strip);
  for (const sx of [-1, 1]) for (let z = 3; z > -40; z -= 2.2) { const p = cyl(0.05, 0.05, 0.6, '#f2ead6', sx * 0.8, 0.3, z, 6); g.add(p); }
  const gm = [toon('#6ab04a'), toon('#5a9e3e')]; for (let i = 0; i < 120; i++) { const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 5), gm[i % 2]); const x = (r() - 0.5) * 26; if (Math.abs(x) < 1.1) continue; tuft.position.set(x, 0.18, 4 - r() * 30); tuft.userData.noOutline = true; g.add(tuft); }
  for (let i = 0; i < 10; i++) { const x = (i % 2 ? 1 : -1) * (5 + r() * 9); g.add(tree(x, -10 - r() * 22, 0.9 + r() * 0.6, i % 3 ? '#4a8a3a' : '#5a9a44')); }
  const sign = signPost('TOLEDO', { w: 1.1, h: 1.15 }); sign.position.set(0, 0, -0.5); g.add(sign); outline(g, { px: 2 });
  return { stage: st, sky, sign, group: g };
}
// the Maumee River: a wide blue band across the frame (along X); Michigan bank far (-Z), Ohio bank near (+Z)
export function riverSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: 12, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 7, seed: 9 });
  const g = new THREE.Group(); st.add(g); g.add(floor(120, 40, '#86c656', 0, 22), floor(120, 40, '#7aba50', 0, -26));
  const wt = canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#4a9ad8'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 5; for (let i = 0; i < 10; i++) { c.beginPath(); const y = (i * 53) % H, x = (i * 97) % W; c.moveTo(x, y); c.quadraticCurveTo(x + 20, y - 8, x + 40, y); c.stroke(); } });
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(20, 2); const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 12), toon('#ffffff', { map: wt })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.02, -4); water.userData.noOutline = true; g.add(water);
  for (const z of [2.05, -10.05]) { const bank = floor(120, 0.5, '#c8a46a', 0, z); bank.position.y = 0.03; g.add(bank); }
  const r = rng(3); for (let i = 0; i < 12; i++) g.add(tree((r() - 0.5) * 50, -15 - r() * 14, 0.9 + r() * 0.5));
  outline(g, { px: 2 }); return { stage: st, sky, water, wt, group: g, update(t) { wt.offset.x = t * 0.06; } };
}
// the Upper Peninsula: snowy ground, dark pines, a grey sky; snow falls in 2D
export function pine(s = 1) { const g = new THREE.Group(); g.add(cyl(0.1 * s, 0.14 * s, 0.8 * s, '#5a3a22', 0, 0.4 * s, 0, 8));
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.0 - i * 0.25) * s, 1.3 * s, 10), toon(i === 2 ? '#3a6a52' : '#2e5a44')); c.position.y = (0.9 + i * 0.75) * s; c.castShadow = true; g.add(c);
    const cap = new THREE.Mesh(new THREE.ConeGeometry((0.55 - i * 0.12) * s, 0.45 * s, 10), toon('#f4f8ff')); cap.position.y = (1.35 + i * 0.75) * s; g.add(cap); } return g; }
export function snowSet(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: o.fov || 38, shadowSize: 10, target: [0, 0, 0], bg: ['#8a9ab8', '#c8d4e4', '#eef2f8'], fog: [14, 60, '#d8e0ec'], ambient: 1.3 });
  const g = new THREE.Group(); st.add(g); g.add(floor(160, 160, '#f2f6fc', 0, 0)); const r = rng(o.seed || 5);
  for (let i = 0; i < 46; i++) { const x = (r() - 0.5) * 40, z = 2 - r() * 34; if (Math.abs(x) < 2.6 && z > -4) continue; const p = pine(0.9 + r() * 0.9); p.position.set(x, 0, z); g.add(p); }
  for (let i = 0; i < 14; i++) { const m = ball(0.4 + r() * 0.6, '#e6ecf6', (r() - 0.5) * 20, 0, -r() * 20); m.scale.y = 0.4; g.add(m); }
  outline(g, { px: 2 }); return { stage: st, group: g };
}
// 2D falling snow
export function snow(g, t, o = {}) { const n = o.n || 70; g.save(); g.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < n; i++) { const r = rng(i + 11); const sp = 90 + r() * 120; const x = (r() * E.W + Math.sin(t * 1.3 + i) * 30 + t * (o.wind || 40)) % E.W, y = (r() * E.H + t * sp) % E.H;
  g.beginPath(); g.arc(x, y, 3 + r() * 6, 0, 7); g.fill(); } g.restore(); }
// a rock with copper (orange) and iron (grey-red) veins; .crack(k) splits it open, nuggets glow
export function oreRock(o = {}) { const g = new THREE.Group(); const parts = [];
  for (const sx of [-1, 1]) { const h = new THREE.Group(); const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), toon('#7a7682')); m.scale.set(0.75, 1, 1); m.position.x = sx * 0.5; m.castShadow = true; h.add(m); g.add(h); parts.push(h); }
  const nug = []; const r = rng(4); for (let i = 0; i < 14; i++) { const cu = i % 3 !== 2; const n = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 + r() * 0.12, 0), toon(cu ? '#e07a32' : '#9a4a3e', { fresh: true, emissive: new THREE.Color(cu ? '#ff8a3a' : '#7a3a30'), emissiveIntensity: 0 }));
    n.position.set((r() - 0.5) * 0.5, 0.3 + r() * 1.6, (r() - 0.5) * 0.9); g.add(n); nug.push(n); }
  outline(g, { px: 2.4 }); g.position.y = 0.9;
  g.crack = (k) => { parts[0].position.x = -k * 0.55; parts[1].position.x = k * 0.55; parts[0].rotation.z = k * 0.15; parts[1].rotation.z = -k * 0.15; nug.forEach(n => { n.material.emissiveIntensity = k * 0.6; }); };
  return g; }
// a pile of copper nuggets (the jackpot)
export function copperPile(o = {}) { const g = new THREE.Group(); const r = rng(o.seed || 8); const mats = [toon('#e07a32', { emissive: new THREE.Color('#ff8a3a'), emissiveIntensity: 0.25 }), toon('#c8642a', { emissive: new THREE.Color('#ff7a2a'), emissiveIntensity: 0.15 }), toon('#9a4a3e')];
  for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 1.7; const y = Math.max(0, (1.7 - d) * 0.9) * r() + 0.1; const n = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + r() * 0.18, 0), mats[i % 3]);
    n.position.set(Math.cos(a) * d, y, Math.sin(a) * d * 0.8); n.rotation.set(r() * 3, r() * 3, 0); n.castShadow = true; g.add(n); }
  const top = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.5, 12), toon('#c8642a')); top.position.y = 0.6; top.scale.z = 0.8; g.add(top); outline(g, { px: 2 }); g.topY = 1.35; return g; }
export function pickaxe() { const g = new THREE.Group(); g.add(cyl(0.04, 0.045, 1.4, '#7a5634', 0, 0.7, 0, 8)); const head = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 6, 16, Math.PI * 0.8), toon('#8a8e96')); head.rotation.z = Math.PI * 0.1; head.position.y = 1.0; g.add(head); outline(g, { px: 2.2 }); return g; }
// a generic domed congress building (no real building, no emblem)
export function domeHall() { const g = new THREE.Group(); g.add(rbox(7, 2.2, 3, '#f2ede2', 0, 1.1, 0, 0.05), rbox(7.6, 0.3, 3.4, '#e2dccc', 0, 2.35, 0, 0.04));
  for (let i = 0; i < 8; i++) g.add(cyl(0.16, 0.18, 2.0, '#fbf8f0', -3.0 + i * 0.857, 1.1, 1.55, 12));
  g.add(cyl(1.3, 1.5, 0.9, '#f2ede2', 0, 2.9, 0, 24)); const d = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f8f4ea')); d.position.y = 3.35; g.add(d); g.add(cyl(0.12, 0.16, 0.6, '#f2ede2', 0, 4.9, 0, 10));
  outline(g, { px: 2.2 }); return g; }
export { POSE, EXPR, clamp, lerp, ease, prog, E, alpha };
