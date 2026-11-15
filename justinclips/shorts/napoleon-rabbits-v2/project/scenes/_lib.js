// shared helpers for "Napoleon Was Attacked by Rabbits" (napoleon-rabbits-v2). Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, lerp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, cyl, ball } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };

// sunny meadow with a treeline
export function meadow(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, target: o.target || [0, 0, 0], shadowSize: o.shadowSize || 12 });
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 2 });
  const gt = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#7cb84a'; g.fillRect(0, 0, W, H); for (let i = 0; i < 400; i++) { g.fillStyle = i % 2 ? 'rgba(60,120,40,.35)' : 'rgba(170,220,110,.35)'; const x = (i * 73) % W, y = (i * 151) % H; g.fillRect(x, y, 3, 8); } }, { repeat: [24, 24] });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshToonMaterial({ color: '#ffffff', map: gt })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; gr.userData.noOutline = true; st.add(gr);
  const trees = new THREE.Group(); for (let i = 0; i < 14; i++) { const tr = new THREE.Group(); tr.add(cyl(0.25, 0.3, 2.4, '#7a5432', 0, 1.2, 0, 10)); const c = ball(1.6 + (i % 3) * 0.3, ['#4a8a3a', '#5a9a3a', '#3f7a32'][i % 3], 0, 3.4, 0, 16); c.scale.y = 1.15; tr.add(c); outline(tr, { px: 2 }); tr.position.set(-36 + i * 5.5, 0, -22 - (i % 3) * 3); trees.add(tr); } st.add(trees);
  return { stage: st, sky, update(t) { sky.update?.(t); } };
}

// toon rabbit: white/grey/brown, long ears, hop cycle. .hop(t, { speed, ph, look })
export function rabbit(o = {}) {
  const cols = ['#f4f0ea', '#b8b0a8', '#a87a52', '#e8dccb', '#6a5a50']; const col = o.color || cols[(o.seed || 0) % cols.length];
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const b = ball(0.42, col, 0, 0.42, -0.05, 18); b.scale.set(0.9, 0.85, 1.15); body.add(b);
  const head = new THREE.Group(); head.position.set(0, 0.78, 0.38); body.add(head);
  const h = ball(0.3, col, 0, 0, 0, 18); h.scale.set(1, 0.95, 1); head.add(h);
  const ears = []; [-0.11, 0.11].forEach((x, i) => { const e = new THREE.Group(); e.position.set(x, 0.2, -0.03); const m = ball(0.09, col, 0, 0.3, 0, 12); m.scale.set(1, 3.6, 0.6); e.add(m); const inn = ball(0.05, '#f2a8b0', 0, 0.3, 0.04, 10); inn.scale.set(1, 3.4, 0.4); e.add(inn); e.rotation.z = (i ? -1 : 1) * 0.15; head.add(e); ears.push(e); });
  const eyeM = []; [-0.12, 0.12].forEach(x => { const ey = ball(0.055, '#1a1414', x, 0.05, 0.26, 10); head.add(ey); eyeM.push(ey); const hl = ball(0.018, '#ffffff', x + 0.02, 0.08, 0.31, 6); head.add(hl); });
  head.add(ball(0.04, '#f2889a', 0, -0.03, 0.3, 8));
  body.add(ball(0.12, '#ffffff', 0, 0.5, -0.55, 10));
  [-0.18, 0.18].forEach(x => { const f = ball(0.11, col, x, 0.08, 0.25, 10); f.scale.set(0.8, 0.6, 1.4); body.add(f); const bf = ball(0.14, col, x, 0.1, -0.25, 10); bf.scale.set(0.9, 0.6, 1.6); body.add(bf); });
  outline(root, { px: 2.2 });
  root.head = head; root.eyes = eyeM; root.headR = 0.3;
  root.hop = (t, o2 = {}) => { const sp = o2.speed ?? 3, ph = o2.ph || 0; const c = ((t * sp + ph) % 1 + 1) % 1; const up = Math.sin(c * Math.PI);
    body.position.y = up * (o2.height ?? 0.35); body.rotation.x = Math.cos(c * Math.PI * 2) * 0.25 * (o2.height ?? 0.35) / 0.35; ears.forEach((e, i) => (e.rotation.x = -0.4 * up)); head.rotation.y = o2.look || 0; };
  return root;
}
// a swarm of n rabbits in [x0,x1,z0,z1]
export function swarm(st, n, area, seed = 1) { const out = []; let s = seed * 9301 + 49297; const R = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) { const r = rabbit({ seed: Math.floor(R() * 5) }); r.scale.setScalar(0.85 + R() * 0.3); r.position.set(area[0] + R() * (area[1] - area[0]), 0, area[2] + R() * (area[3] - area[2])); r.ph = R(); r.x0 = r.position.x; r.z0 = r.position.z; st.add(r); out.push(r); } return out; }

// toon Napoleon (a caricature in the bean style): blue coat, white front, bicorne hat, small
export function napoleon() {
  const b = bean({ name: 'Napoleon', outfit: 'uniform', colors: { main: '#2a3a7a', legsTop: '#f2eee4', trim: '#e0b84a' }, skin: 'light', hair: 'swoop', hairColor: '#3a2618', scale: 0.86, seed: 401 });
  const hat = new THREE.Group(); const sh = new THREE.Shape(); sh.moveTo(-0.85, 0); sh.quadraticCurveTo(-0.7, 0.55, 0, 0.62); sh.quadraticCurveTo(0.7, 0.55, 0.85, 0); sh.quadraticCurveTo(0, 0.12, -0.85, 0);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2, curveSegments: 16 }); hg.translate(0, 0, -0.17);
  const hm = new THREE.Mesh(hg, toon('#1a1a22')); hm.position.y = 0; hat.add(hm);
  const ck = ball(0.1, '#c8202a', -0.25, 0.4, 0.22, 10); ck.scale.z = 0.4; hat.add(ck); const ck2 = ball(0.05, '#f4f0e6', -0.25, 0.4, 0.26, 8); hat.add(ck2); outline(hat, { px: 3 }); hat.position.set(0, 0.34, 0); hat.scale.set(0.66, 0.6, 0.6); b.parts.head.add(hat); b.hat = hat; return b;
}
export function officer(i = 0) { return bean({ name: 'Officer', outfit: 'uniform', colors: { main: ['#2a3a7a', '#3a4a8a'][i % 2], legsTop: '#f2eee4', trim: '#e0b84a' }, skin: ['fair', 'light'][i % 2], hair: ['bald', 'bowl'][i % 2], moustache: i ? false : '#5a3a22', seed: 410 + i }); }
// cage (crate with bars) and carriage
export function cage() { const g = new THREE.Group(); g.add(rbox(1.2, 0.12, 0.9, '#8a6a42', 0, 0.06, 0, 0.03)); g.add(rbox(1.2, 0.1, 0.9, '#8a6a42', 0, 0.86, 0, 0.03));
  for (let i = 0; i < 6; i++) g.add(cyl(0.025, 0.025, 0.8, '#5a4a3a', -0.55 + i * 0.22, 0.46, 0.44, 6));
  const door = new THREE.Group(); for (let i = 0; i < 6; i++) door.add(cyl(0.025, 0.025, 0.8, '#5a4a3a', 0.11 + i * 0.22, 0.4, 0, 6)); door.position.set(-0.66, 0.06, 0.45); g.add(door); outline(g, { px: 2 }); g.door = door; return g; }
export function carriage() { const g = new THREE.Group(); g.add(rbox(3.2, 1.8, 1.9, '#2a3a6a', 0, 1.9, 0, 0.25)); g.add(rbox(3.3, 0.18, 2.0, '#e0b84a', 0, 2.85, 0, 0.05));
  g.add(rbox(1.2, 1.05, 0.1, '#2a2438', -0.2, 2.1, 0.96, 0.05)); const dr = rbox(0.8, 1.4, 0.08, '#24305a', 0.9, 1.75, 0.97, 0.05); g.add(dr);
  [[-1.1, 1.0], [1.1, 1.0], [-1.1, -1.0], [1.1, -1.0]].forEach(([x, z]) => { const w = cyl(0.62, 0.62, 0.1, '#e0b84a', x, 0.62, z, 20); w.rotation.x = Math.PI / 2; g.add(w); });
  outline(g, { px: 2.4 }); g.door = dr; return g; }

export function topCaption(g, t, str, t0 = 0, t1 = 3.6) {
  if (t < t0 || t > t1 + 0.25) return; const k = t > t1 ? clamp(1 - (t - t1) / 0.25) : 1;
  g.save(); g.globalAlpha = k; const size = 76; g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + 90, h = size * 1.12 + 50, y = E.H * 0.1;
  g.fillStyle = 'rgba(16,10,14,.86)'; g.beginPath(); g.roundRect(E.W / 2 - w / 2, y - h / 2, w, h, 34); g.fill(); g.strokeStyle = '#ffd25a'; g.lineWidth = 6; g.stroke();
  text(g, str, E.W / 2, y + 4, { size, color: '#ffd25a', weight: 700, stroke: size * 0.12, strokeColor: '#141014' }); g.restore(); }
