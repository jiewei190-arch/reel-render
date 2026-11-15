// shared helpers for "The Shortest War in History" (shortest-war). Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, lerp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, box, cyl, ball, lathe } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import * as PR from '/kits/toon3d/props.js';
import { smoke, fire, glow } from '/kits/toon3d/fx.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };

// harbour stage: sunny sky, sea, shore with palms; returns { stage, sky, sea, update(t) }
export function harbour(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, target: o.target || [0, 0, 0], shadowSize: o.shadowSize || 16 });
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3 });
  const seaTex = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#2f8fb8'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = (i * 97) % W, y = (i * 61) % H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 5, x + 22, y); g.stroke(); } }, { repeat: [14, 14] });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshToonMaterial({ color: '#ffffff', map: seaTex })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; sea.receiveShadow = true; sea.userData.noOutline = true; st.add(sea);
  const shore = new THREE.Mesh(new THREE.BoxGeometry(160, 1, 40), toon('#e8d29a')); shore.position.set(0, -0.45, -32); shore.receiveShadow = true; shore.userData.noOutline = true; st.add(shore);
  const palms = new THREE.Group(); for (let i = 0; i < 9; i++) { const p = palm(i); p.position.set(-34 + i * 8.5 + (i % 2) * 2, 0, -15 - (i % 3) * 3); palms.add(p); } st.add(palms);
  return { stage: st, sky, sea, seaTex, update(t) { sky.update?.(t); seaTex.offset.set(t * 0.01, t * 0.004); } };
}
export function palm(seed = 0) { const g = new THREE.Group(); const h = 3.4 + (seed % 3) * 0.5;
  for (let i = 0; i < 6; i++) { const s = cyl(0.17 - i * 0.012, 0.19 - i * 0.012, h / 6, '#8a6a42', Math.sin(i * 0.5) * 0.12 * i, h / 12 + (i * h) / 6, 0, 10); g.add(s); }
  for (let i = 0; i < 6; i++) { const lf = rbox(2.2, 0.08, 0.5, '#3f8a3a', 0, 0, 0, 0.04); const pv = new THREE.Group(); lf.position.x = 1.0; lf.rotation.z = -0.35; pv.add(lf); pv.rotation.y = (i / 6) * Math.PI * 2 + seed; pv.position.set(0.6, h, 0); g.add(pv); }
  outline(g, { px: 2 }); return g; }

// the palace (generic toon palace, not a portrait of a real building): white block, arcade, corner tower, flagpole
export function palace(o = {}) {
  const g = new THREE.Group();
  g.add(rbox(14, 6, 6, '#f2ede2', 0, 3, 0, 0.15)); g.add(rbox(14.4, 0.5, 6.4, '#c9b08a', 0, 6.2, 0, 0.1));
  for (let i = 0; i < 6; i++) { const x = -5.6 + i * 2.25; g.add(rbox(1.0, 1.7, 0.2, '#3a4a5a', x, 4.4, 3.05, 0.08)); g.add(rbox(1.0, 1.9, 0.2, '#3a4a5a', x, 1.4, 3.05, 0.08)); g.add(rbox(1.3, 0.2, 0.3, '#c9b08a', x, 5.4, 3.1, 0.05)); }
  g.add(rbox(4, 9.5, 4, '#f2ede2', 6, 4.75, -0.5, 0.15)); g.add(rbox(4.4, 0.5, 4.4, '#c9b08a', 6, 9.6, -0.5, 0.1));
  for (let i = 0; i < 2; i++) g.add(rbox(0.9, 1.6, 0.2, '#3a4a5a', 5.2 + i * 1.6, 7.6, 1.55, 0.08));
  const pole = cyl(0.07, 0.07, 6, '#6a6a70', 6, 12.8, -0.5, 8); g.add(pole);
  outline(g, { px: 2.2 });
  const flagTex = canvasTex(64, 40, (c, W, H) => { c.fillStyle = '#c8202a'; c.fillRect(0, 0, W, H); });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5, 8, 1), new THREE.MeshToonMaterial({ map: flagTex, side: THREE.DoubleSide })); flag.userData.noOutline = true;
  const fg = new THREE.Group(); fg.add(flag); flag.position.x = 1.2; fg.position.set(6.07, 15, -0.5); g.add(fg);
  const base = Float32Array.from(flag.geometry.attributes.position.array);
  g.flag = fg; g.wave = (t) => { const p = flag.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = base[i] + 1.2; p[i + 2] = Math.sin(x * 2.2 - t * 6) * 0.12 * x; } flag.geometry.attributes.position.needsUpdate = true; };
  g.setFlag = (k) => { fg.position.y = lerp(15, 10.6, k); };   // 0 = top of the pole, 1 = down
  return g;
}

// a toon warship (generic 1890s cruiser): grey hull, two funnels, masts, a forward gun
export function warship(o = {}) {
  const g = new THREE.Group(); const L = o.len || 12;
  const hull = rbox(L, 1.8, 2.4, '#7a8088', 0, 0.6, 0, 0.3); g.add(hull); g.add(rbox(L * 0.98, 0.3, 2.45, '#5a3a32', 0, -0.1, 0, 0.1));
  g.add(rbox(L * 0.5, 1.2, 1.9, '#d8d6cc', -0.5, 2.0, 0, 0.12));
  [-1.2, 1.4].forEach(x => { g.add(cyl(0.45, 0.5, 2.6, '#c9a84a', x, 3.6, 0, 16)); g.add(cyl(0.47, 0.47, 0.3, '#2a2a2a', x, 4.85, 0, 16)); });
  [-L * 0.32, L * 0.3].forEach(x => g.add(cyl(0.08, 0.1, 6, '#6a5a4a', x, 4.2, 0, 8)));
  const gun = cyl(0.18, 0.22, 2.4, '#4a4e56', L * 0.42, 1.95, 0, 10); gun.rotation.z = Math.PI / 2 - 0.12; g.add(gun);
  g.add(rbox(1.2, 0.9, 1.2, '#7a8088', L * 0.32, 1.9, 0, 0.15));
  outline(g, { px: 2.4 });
  const flash = glow(8, '#ffe08a', 0); flash.position.set(L * 0.42 + 1.6, 2.1, 0); flash.userData.noOutline = true; g.add(flash);
  const puff = smoke({ count: 10, size: 1.3, rise: 0.6, spread: 0.6, color: '#d8d4cc', life: 2.2, seed: o.seed || 2 }); puff.position.copy(flash.position); g.add(puff);
  g.flash = flash; g.puff = puff;
  g.fire = (t, t0) => { const a = t - t0; flash.material.opacity = a >= 0 && a < 0.25 ? 1 - a / 0.25 : 0; flash.scale.setScalar(8 * (1 + clamp(a * 4))); puff.visible = a >= 0; puff.update(Math.max(0, a)); };
  return g;
}
// the royal yacht: white + gold, one funnel, small and proud
export function yacht() {
  const g = new THREE.Group();
  g.add(rbox(7, 1.3, 1.8, '#f6f2e8', 0, 0.45, 0, 0.3)); g.add(rbox(7.05, 0.18, 1.85, '#d8b04a', 0, 0.95, 0, 0.05));
  g.add(rbox(3, 0.9, 1.4, '#f6f2e8', -0.4, 1.5, 0, 0.12)); g.add(cyl(0.3, 0.34, 1.6, '#c8202a', 0.6, 2.4, 0, 14));
  g.add(cyl(0.05, 0.06, 3.4, '#8a6a42', -2.2, 2.6, 0, 8));
  outline(g, { px: 2.4 });
  const ft = canvasTex(32, 20, (c, W, H) => { c.fillStyle = '#c8202a'; c.fillRect(0, 0, W, H); });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), new THREE.MeshToonMaterial({ map: ft, side: THREE.DoubleSide })); fl.position.set(-1.75, 4.0, 0); fl.userData.noOutline = true; g.add(fl);
  g.flagMesh = fl; return g;
}

// people (original characters, not portraits)
export function sultan() {
  const b = bean({ name: 'Sultan', outfit: 'robe', colors: { main: '#2a6a4a', trim: '#e8c25a' }, skin: 'brown', hair: 'bald', beard: true, beardColor: '#2a1c14', seed: 301 });
  const tur = new THREE.Group(); const t1 = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.17, 10, 24), toon('#f4f0e6')); t1.rotation.x = Math.PI / 2; t1.position.y = 0.38; tur.add(t1);
  const t2 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f4f0e6')); t2.position.y = 0.42; tur.add(t2); outline(tur, { px: 3 });
  b.parts.head.add(tur); return b;
}
export function officer() { return bean({ name: 'Officer', outfit: 'uniform', colors: { main: '#f4f2ec', legsTop: '#1e2a44', trim: '#d8b04a' }, head: 'cap', headColor: '#1e2a44', skin: 'fair', hair: 'bald', moustache: '#8a6a42', seed: 302 }); }

// the stopwatch (2D): minutes:seconds
export function stopwatch(g, x, y, r, secs, o = {}) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#2a1c15'; g.beginPath(); g.roundRect(-r * 0.16, -r * 1.32, r * 0.32, r * 0.3, 8); g.fill();
  g.beginPath(); g.arc(0, 0, r * 1.06, 0, Math.PI * 2); g.fill();
  g.fillStyle = o.face || '#fbf6ea'; g.beginPath(); g.arc(0, 0, r * 0.92, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2a1c15'; for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, l = i % 5 === 0 ? 0.14 : 0.07; g.lineWidth = i % 5 === 0 ? 7 : 3; g.beginPath(); g.moveTo(Math.sin(a) * r * 0.86, -Math.cos(a) * r * 0.86); g.lineTo(Math.sin(a) * r * (0.86 - l), -Math.cos(a) * r * (0.86 - l)); g.stroke(); }
  const a = ((secs % 60) / 60) * Math.PI * 2; g.strokeStyle = '#d8302a'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78); g.stroke();
  g.fillStyle = '#2a1c15'; g.beginPath(); g.arc(0, 0, r * 0.07, 0, Math.PI * 2); g.fill();
  const mm = Math.floor(secs / 60), ss = Math.floor(secs % 60); text(g, `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 0, r * 0.42, { size: r * 0.3, color: '#2a1c15', weight: 900, font: FONTS.ui });
  g.restore();
}
// wall clock (2D) showing h:mm
export function clockCard(g, x, y, str, k = 1, o = {}) { if (k <= 0) return; g.save(); g.translate(x, y); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `900 120px "${FONTS.ui}"`; const w = g.measureText(str).width + 90; g.fillStyle = 'rgba(20,14,18,.88)'; g.beginPath(); g.roundRect(-w / 2, -86, w, 172, 30); g.fill(); g.strokeStyle = o.color || '#ffd25a'; g.lineWidth = 7; g.stroke();
  text(g, str, 0, 6, { size: 120, color: o.color || '#ffd25a', weight: 900, font: FONTS.ui }); if (o.sub) text(g, o.sub, 0, 120, { size: 40, color: '#ffffff', weight: 900, font: FONTS.ui, stroke: 8, strokeColor: '#141014' }); g.restore(); }
export function topCaption(g, t, str, t0 = 0, t1 = 3.6) {
  if (t < t0 || t > t1 + 0.25) return; const k = t > t1 ? clamp(1 - (t - t1) / 0.25) : 1;
  g.save(); g.globalAlpha = k; const size = 80; g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + 90, h = size * 1.12 + 50, y = E.H * 0.1;
  g.fillStyle = 'rgba(16,10,14,.86)'; g.beginPath(); g.roundRect(E.W / 2 - w / 2, y - h / 2, w, h, 34); g.fill(); g.strokeStyle = '#ffd25a'; g.lineWidth = 6; g.stroke();
  text(g, str, E.W / 2, y + 4, { size, color: '#ffd25a', weight: 700, stroke: size * 0.12, strokeColor: '#141014' }); g.restore(); }
