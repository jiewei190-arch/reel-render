// Emperor Norton Short: shared set + cast (underscore = not auto-loaded). 1860s-70s San Francisco in the Toon 3D sunny look.
import { wordTime } from '/engine/core.js';
import { THREE, toon, toonStage, canvasTex, rbox, box, cyl, ball, outline, floor } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { rng } from '/engine/core.js';

export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };

// painted sign board (text on wood), outlined
const _sg = new Map();
export function sign(txt, o = {}) {
  const { w = 2.6, h = 0.7, bg = '#f1e3c2', fg = '#4a2a18', trim = '#7a4a28' } = o; const k = txt + bg + fg;
  if (!_sg.has(k)) _sg.set(k, canvasTex(512, Math.round(512 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = trim; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14);
    g.fillStyle = fg; let fs = H * 0.62; g.font = `900 ${fs}px Fredoka, sans-serif`; while (g.measureText(txt).width > W * 0.86 && fs > 10) { fs -= 2; g.font = `900 ${fs}px Fredoka, sans-serif`; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + fs * 0.06); }));
  const g = new THREE.Group(); const b = rbox(w + 0.12, h + 0.12, 0.1, trim, 0, 0, -0.03, 0.03); g.add(b);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: _sg.get(k) })); p.position.z = 0.03; p.userData.noOutline = true; g.add(p); outline(b, { px: 2.2 }); return g;
}
// gas street lamp
export function gasLamp() { const g = new THREE.Group(); g.add(cyl(0.07, 0.1, 3.2, '#2a2e36', 0, 1.6, 0, 10), cyl(0.18, 0.22, 0.2, '#2a2e36', 0, 0.1, 0, 12), rbox(0.42, 0.5, 0.42, '#f6e2a0', 0, 3.4, 0, 0.05), cyl(0.05, 0.32, 0.22, '#2a2e36', 0, 3.75, 0, 4));
  outline(g, { px: 2.4 }); g.traverse(m => m.isMesh && (m.castShadow = true)); return g; }
// a two-storey wooden false-front building with a sign, facing +Z
export function shopFront(o = {}) {
  const { w = 4.2, h = 5.4, color = '#c98a5a', trim = '#f1e3c2', txt = 'DRY GOODS', seed = 1 } = o; const g = PR.facade({ w, h, d: 3, color, trim: '#6a3a2a', shop: true, windows: 2, seed, roof: false });
  g.add(rbox(w + 0.3, 0.35, 0.4, trim, 0, h + 0.1, 0.05, 0.04));   // cornice
  const s = sign(txt, { w: w * 0.72, h: 0.62 }); s.position.set(0, h - 2.35, 0.12); g.add(s);
  const aw = rbox(w * 0.9, 0.12, 1.2, shadeHex(color, -0.35), 0, 2.85, 0.55, 0.03); aw.rotation.x = 0.25; aw.castShadow = true; g.add(aw); outline(aw, { px: 2.2 });
  return g;
}
// SF street: dirt road into -Z, plank sidewalks, false-front shops both sides, gas lamps, green hills at the end
export function sfStreet(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 2);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 80), PR.texMat(PR.TEX.cobble('#b89a72', [5, 40]))); road.rotation.x = -Math.PI / 2; road.receiveShadow = true; road.userData.noOutline = true; road.position.z = -20; g.add(road);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 80), PR.texMat(PR.TEX.planks('#9a6a42', [1, 30], 6))); sw.position.set(s * 6, 0.125, -20); sw.receiveShadow = true; g.add(sw); }
  const cols = ['#c98a5a', '#7fa0b8', '#e2c9a0', '#b85a4a', '#9ab07a', '#e0b070', '#a88ab8'];
  const names = o.names || ['DRY GOODS', 'BANK', 'BULLETIN', 'BAKERY', 'HOTEL', 'TAILOR', 'HARDWARE', 'CIGARS', 'GROCER', 'BOOTS'];
  let k = 0;
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const z = 4 - i * 6; const w = 5.6; const sh = shopFront({ w, h: 5 + ((i + (s > 0 ? 1 : 0)) % 3) * 0.9, color: cols[(k * 3 + i) % cols.length], txt: names[k % names.length], seed: k });
    sh.position.set(s * 8.9, 0.25, z); sh.rotation.y = -s * Math.PI / 2; g.add(sh); k++; }
  for (const s of [-1, 1]) for (let z = 2; z > -30; z -= 8) { const l = gasLamp(); l.position.set(s * 4.8, 0.25, z); g.add(l); }
  for (let i = 0; i < 7; i++) { const b = ball(1, '#7fa05a', 0, 0, 0, 20); b.scale.set(14 + r() * 10, 5 + r() * 5, 8); b.position.set(-40 + i * 13, -1, -62 - r() * 6); b.userData.noOutline = true; b.material = toon(i % 2 ? '#86a862' : '#6f9a52'); g.add(b); }
  g.add(PR.barrel().at(4.6, 0.25, 0.5), PR.crate().at(-4.6, 0.25, -3.5, 0.3), PR.barrel({ color: '#7a4a2a' }).at(-4.4, 0.25, -11));
  return { group: g, update() {} };
}
export function sfStage(T, o = {}) { const st = toonStage(T, { light: o.light || 'sunny', fov: o.fov || 38, shadowSize: o.shadowSize || 12, target: o.target || [0, 0, 0] });
  const set = sfStreet(st, o); const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3, ...(o.sky || {}) }); return { stage: st, set, sky }; }

// ---------- cast ----------
// Emperor Norton: navy army coat with gold buttons + epaulettes, tall hat with a plume, big greying beard
export function norton(o = {}) {
  const b = bean({ name: 'Norton', outfit: 'uniform', colors: { main: '#25386a', legs: '#25386a', legsTop: '#25386a', trim: '#e0b84a', belt: '#e0b84a', feet: '#1a1416' }, skin: 'fair', hair: 'bowl', hairColor: '#6a5040', beard: true, beardColor: '#7a6252', browColor: '#5a4030', seed: 21, ...o });
  if (o.plain) return b;
  const { upper, head } = b.parts, R = 0.5;
  const gold = '#e6bd4a';
  for (const s of [1, -1]) { const ep = new THREE.Group(); const p = ball(1, gold, 0, 0, 0, 18); p.scale.set(0.17, 0.06, 0.15); ep.add(p); for (let i = 0; i < 5; i++) { const f = cyl(0.012, 0.012, 0.12, gold, s * 0.08 + (i - 2) * 0.03 * s, -0.07, 0.06 - i * 0.025, 5); ep.add(f); }
    ep.position.set(s * 0.29, 0.67, 0); ep.rotation.z = s * -0.35; upper.add(ep); outline(ep, { px: 2.2 }); }
  // tall hat with a gold cockade and a feather plume
  const hat = new THREE.Group(); const hc = '#262634';
  hat.add(cyl(0.36, 0.33, 0.62, hc, 0, 0.62, 0, 24), cyl(0.5, 0.5, 0.05, hc, 0, 0.32, 0, 28), cyl(0.335, 0.335, 0.1, gold, 0, 0.4, 0, 24));
  const ck = ball(0.09, gold, 0, 0.55, 0.33, 14); hat.add(ck);
  for (let i = 0; i < 3; i++) { const f = ball(1, ['#2f8a6a', '#3a6ac8', '#2f8a6a'][i], 0, 0, 0, 14); f.scale.set(0.07, 0.3, 0.07); f.position.set(0.12 - i * 0.05, 1.0 + i * 0.02, 0.1 - i * 0.08); f.rotation.z = -0.5 + i * 0.25; hat.add(f); }
  hat.position.set(0, 0.06, -0.02); hat.rotation.x = -0.08; hat.traverse(m => m.isMesh && (m.castShadow = true)); head.add(hat); outline(hat, { px: 3 });
  b.hat = hat; return b;
}
const SK = ['fair', 'tan', 'light', 'olive', 'brown', 'dark'];
const COATS = ['#6a4a32', '#3a4a5a', '#5a5a4a', '#7a3a32', '#4a5a3a', '#8a6a4a', '#3a3a4a'];
export function topHat(b, c = '#2a2228') { const h = new THREE.Group(); h.add(cyl(0.3, 0.3, 0.5, c, 0, 0.62, 0, 22), cyl(0.44, 0.44, 0.04, c, 0, 0.38, 0, 26), cyl(0.305, 0.305, 0.07, '#7a2a2a', 0, 0.43, 0, 22)); h.position.y = 0.0; h.traverse(m => m.isMesh && (m.castShadow = true)); b.parts.head.add(h); outline(h, { px: 2.8 }); b.hat = h; return h; }
export function bowler(b, c = '#3a2a22') { const h = new THREE.Group(); const d = ball(0.36, c, 0, 0.5, 0, 20); d.scale.y = 0.75; h.add(d, cyl(0.46, 0.46, 0.04, c, 0, 0.42, 0, 24)); h.position.y = -0.04; b.parts.head.add(h); outline(h, { px: 2.8 }); b.hat = h; return h; }
// a townsperson: i picks colours, hat: 'top'|'bowler'|'none'|'bonnet'
export function citizen(i = 0, o = {}) {
  const r = rng(i * 7 + 3); const lady = o.lady ?? (i % 3 === 2);
  const b = bean({ name: 'Citizen' + i, outfit: lady ? 'robe' : 'uniform', colors: lady ? { main: ['#b85a6a', '#5a7ab8', '#8a5ab0', '#5a9a8a'][i % 4], trim: '#f1e3c2', legs: '#3a2a2a' } : { main: COATS[i % COATS.length], legs: '#3a3438', legsTop: COATS[i % COATS.length], trim: '#c9a14a' },
    skin: SK[i % SK.length], hair: lady ? 'bun' : ['bowl', 'swoop', 'horseshoe', 'messy'][i % 4], hairColor: ['#3a2618', '#6a4428', '#1e1612', '#8a6a4a', '#b0a090'][i % 5], moustache: !lady && i % 4 === 1, beard: !lady && i % 5 === 3, seed: 300 + i, ...o });
  const hat = o.hat ?? (lady ? 'none' : ['top', 'bowler', 'top', 'none', 'bowler'][i % 5]);
  if (hat === 'top') topHat(b, ['#2a2228', '#3a3040', '#4a3a2a'][i % 3]); if (hat === 'bowler') bowler(b, ['#3a2a22', '#2a2228'][i % 2]);
  return b;
}
export function policeman(o = {}) { const b = bean({ name: 'Officer', outfit: 'uniform', colors: { main: '#1e2a4a', legs: '#1e2a4a', legsTop: '#1e2a4a', trim: '#e0b84a' }, head: 'cap', headColor: '#1e2a4a', skin: 'light', hair: 'bowl', hairColor: '#3a2618', moustache: true, seed: 77, ...o }); return b; }
// a crowd on a grid; returns array (each with .ph phase)
export function crowd(st, n, area, seed = 1, o = {}) { const out = []; const r = rng(seed); for (let i = 0; i < n; i++) { const c = citizen(seed * 10 + i, o); c.position.set(area[0] + r() * (area[1] - area[0]), 0.25 * (o.onWalk ? 1 : 0), area[2] + r() * (area[3] - area[2])); c.rotation.y = (o.face ?? 0) + (r() - 0.5) * 0.6; c.ph = r() * 6; st.add(c); out.push(c); } return out; }
// banknote prop: "NORTON I, FIFTY CENTS"
let _note = null;
export function banknote() { _note ||= canvasTex(512, 256, (g, W, H) => { g.fillStyle = '#e8eccf'; g.fillRect(0, 0, W, H); g.strokeStyle = '#3a6a4a'; g.lineWidth = 12; g.strokeRect(10, 10, W - 20, H - 20); g.lineWidth = 3; g.strokeRect(28, 28, W - 56, H - 56);
    g.fillStyle = '#3a6a4a'; g.textAlign = 'center'; g.font = '900 44px Fredoka, sans-serif'; g.fillText('EMPIRE OF NORTON I', W / 2, 80); g.font = '900 64px Fredoka, sans-serif'; g.fillText('50 CENTS', W / 2, 160);
    g.font = '700 26px Fredoka, sans-serif'; g.fillText('Imperial bond', W / 2, 210); for (const x of [70, W - 70]) { g.beginPath(); g.arc(x, 150, 36, 0, 7); g.stroke(); } });
  const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), toon('#ffffff', { map: _note })); p.material.side = THREE.DoubleSide; p.userData.noOutline = true; p.castShadow = true; g.add(p);
  const e = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.49), toon('#2a2018')); e.position.z = -0.005; e.userData.noOutline = true; g.add(e); return g; }
export { PR, THREE, rbox, box, cyl, ball, outline, floor, toon };
