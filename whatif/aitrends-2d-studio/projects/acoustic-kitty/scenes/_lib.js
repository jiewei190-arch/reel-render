// shared helpers for acoustic-kitty (underscore = not auto-loaded)
import { wordTime, rng } from '/engine/core.js';
import { THREE, toonStage, toon, floor, ball, cyl, box, rbox, plane, outline, blob, canvasTex, torus } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { cat } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };
// the spy cat: Biscuit-style toon cat in grey-tabby with a tiny black earpiece + coiled wire
export function spyCat(o = {}) { const c = cat({ fur: '#9a9aa6', belly: '#ecebf2', collar: '#20202a', eye: '#f2c230', seed: 11, ...o });
  const head = c.children[0].children.find(x => x.isGroup && x.position.y > 0.9) || null;
  const ep = new THREE.Group(); const bud = ball(0.1, '#15151c', 0, 0, 0, 10); ep.add(ball(0.035, '#ff3a3a', 0.06, 0.05, 0.06, 8)); ep.add(bud); const wire = cyl(0.012, 0.012, 0.28, '#15151c', 0, -0.15, -0.02, 6); wire.rotation.z = 0.25; ep.add(wire);
  ep.position.set(0.27, 0.08, 0.08); outline(ep, { px: 2 }); if (head) head.add(ep); c.earpiece = ep; c.headG = head; c.head = head; c.headR = 0.36;
  const paw = ball(0.11, o.fur || '#9a9aa6', 0.2, 0.1, 0.3, 12); paw.scale.set(1, 0.7, 1.3); c.children[0].add(paw); outline(paw, { px: 2.4 }); c.paw = paw; c.height = 1.4; return c; }
export const guest = (i = 0, o = {}) => bean({ name: 'Guest', outfit: 'labcoat', colors: { main: ['#1f1f28', '#2a2030', '#1a2430'][i % 3], shirt: '#f4f2ec', lanyard: '#c9a14a', legsTop: '#1a1a22' },
  skin: ['fair', 'tan', 'light', 'brown', 'olive'][i % 5], hair: ['swoop', 'bob', 'horseshoe', 'curly', 'bun'][i % 5], hairColor: ['#2a1a12', '#6a4428', '#8a8580', '#1e1612', '#c9a060'][i % 5], seed: 400 + i, ...o });
export const agent = (o = {}) => bean({ name: 'Agent', outfit: 'labcoat', colors: { main: '#2b2f38', shirt: '#f4f2ec', lanyard: '#2b2f38', legsTop: '#22252c' }, skin: 'fair', hair: 'bowl', hairColor: '#2a1c14', glasses: true, seed: 450, ...o });
// a fancy 1960s embassy ballroom: checker marble, red curtains, gold columns, chandelier, drinks table
export function embassy(T, o = {}) { const st = toonStage(T, { light: 'warm', fov: o.fov || 38, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0], bg: ['#2a1a20', '#3a2228'] });
  const g = new THREE.Group(); st.add(g);
  const tex = canvasTex(256, 256, (c, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#e9e2d4' : '#3a2f34'; c.fillRect(x * 32, y * 32, 32, 32); } }); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10, 10); tex.magFilter = THREE.NearestFilter;
  const fl = floor(40, 40, '#ffffff', 0, -6); fl.material = toon('#ffffff', { map: tex }); g.add(fl);
  const wall = plane(40, 12, '#7a2a34', 0, 6, -10); g.add(wall);
  for (let i = -3; i <= 3; i++) { const cu = PR.curtain({ color: '#a8242e', w: 1.6, h: 5.2 }); cu.position.set(i * 4.2, 0, -9.6); g.add(cu); const col = PR.column(6, { color: '#d8b04a' }); col.position.set(i * 4.2 + 2.1, 0, -9.2); g.add(col); }
  const ch = new THREE.Group(); ch.add(torus(1.0, 0.06, '#e0b84a', 0, 0, 0)); ch.children[0].rotation.x = Math.PI / 2; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; const b = ball(0.12, '#fff6d0', Math.cos(a), -0.15, Math.sin(a), 8); b.material = toon('#fff6d0', { emissive: new THREE.Color('#ffd98a'), emissiveIntensity: 0.9, fresh: true }); ch.add(b); }
  ch.add(cyl(0.02, 0.02, 3, '#e0b84a', 0, 1.5, 0, 6)); ch.position.set(0, 6.2, -3); g.add(ch);
  const tab = PR.table({ w: 2.2, d: 0.9, h: 1.0, color: '#f4f0e6' }); tab.position.set(3.2, 0, -2.5); g.add(tab);
  const r = rng(3); for (let i = 0; i < 7; i++) g.add(glass(2.4 + i * 0.26, 1.06, -2.5 + (r() - 0.5) * 0.4));
  return { stage: st, room: g }; }
export function glass(x = 0, y = 0, z = 0) { const g = new THREE.Group(); const bowl = cyl(0.09, 0.05, 0.16, '#cfe8f4', 0, 0.22, 0, 12); bowl.material = toon('#cfe8f4', { transparent: true, opacity: 0.7, fresh: true }); g.add(bowl);
  const wine = cyl(0.075, 0.055, 0.08, '#c8202e', 0, 0.19, 0, 12); g.add(wine); g.add(cyl(0.012, 0.012, 0.12, '#cfe8f4', 0, 0.08, 0, 6), cyl(0.06, 0.06, 0.012, '#cfe8f4', 0, 0.01, 0, 12)); outline(g, { px: 2 }); g.position.set(x, y, z); return g; }
// sunny park: grass, trees, a bench
import { sunnySky } from '/kits/toon3d/sky.js';
export function park(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 38, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0] }); const sky = sunnySky(st, { clouds: 8, seed: 7 });
  const g = new THREE.Group(); st.add(g); g.add(floor(400, 400, '#8cc45a', 0, 0)); const path = floor(3, 60, '#d8c49a', 0, -10); path.position.y = 0.01; g.add(path); const r = rng(8);
  for (let i = 0; i < 10; i++) { const t = new THREE.Group(); t.add(cyl(0.25, 0.35, 3, '#7a5032', 0, 1.5, 0, 10)); for (let k = 0; k < 4; k++) t.add(ball(1.3 + r() * 0.5, '#4f9a3a', (r() - 0.5) * 1.6, 3.4 + r() * 1.2, (r() - 0.5) * 1.2, 14));
    t.position.set((i % 2 ? 1 : -1) * (4.5 + r() * 12), 0, -5 - r() * 25); t.scale.setScalar(1 + r() * 0.5); outline(t, { px: 2.2 }); g.add(t); }
  return { stage: st, sky, update(t) { sky.update(t); } }; }
export function bench() { const g = new THREE.Group(); g.add(rbox(2.4, 0.1, 0.6, '#9a6a3a', 0, 0.85, 0, 0.03), rbox(2.4, 0.5, 0.08, '#9a6a3a', 0, 1.3, -0.28, 0.03)); for (const x of [-1, 1]) g.add(rbox(0.08, 0.85, 0.5, '#3a3a40', x * 1.0, 0.42, 0, 0.02)); outline(g, { px: 2.4 }); g.add(blob(1.4, 0.3)); return g; }
// 2D butterfly
export function butterfly(g, x, y, s = 40, t = 0) { const f = Math.abs(Math.sin(t * 18)); g.save(); g.translate(x, y); g.lineWidth = s * 0.07; g.strokeStyle = '#20161a';
  for (const sd of [-1, 1]) { g.save(); g.scale(sd * (0.25 + 0.75 * f), 1); g.fillStyle = '#ff9a2a'; g.beginPath(); g.ellipse(s * 0.45, -s * 0.25, s * 0.45, s * 0.35, -0.4, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(s * 0.35, s * 0.25, s * 0.3, s * 0.22, 0.4, 0, 6.283); g.fill(); g.stroke(); g.restore(); }
  g.fillStyle = '#20161a'; g.beginPath(); g.ellipse(0, 0, s * 0.08, s * 0.4, 0, 0, 6.283); g.fill(); g.restore(); }
