// shared helpers for "He Survived Both Atomic Bombs" (yamaguchi). TONE GUARD: calm, respectful; nobody is shown hurt,
// the bombs are only a distant white light. Underscore = not auto-loaded.
import { E, wordTime, rng, text, ease, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, rbox, box, cyl, ball, floor, plane, blob, outline, canvasTex } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { glow } from '/kits/toon3d/fx.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
// gold pill tag at the top ("HIROSHIMA · AUGUST 1945")
export function tag(g, str, k = 1, y = 0.13) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
// soft white light filling the frame (the distant flash, never shown on people)
export function whiteLight(g, k) { if (k <= 0) return; g.save(); g.globalAlpha = clamp(k); g.fillStyle = '#fffaf0'; g.fillRect(0, 0, E.W, E.H); g.restore(); }

// the cast: young Tsutomu Yamaguchi (dark work suit), his boss, and Yamaguchi in his later years
export const young = () => bean({ name: 'Tsutomu', outfit: 'uniform', colors: { main: '#3d4656', legsTop: '#343b48', trim: '#c9c4b8' }, skin: 'light', hair: 'swoop', hairColor: '#17141a', seed: 51 });
export const boss = () => bean({ name: 'Boss', outfit: 'uniform', colors: { main: '#5a5248', legsTop: '#4a443c', trim: '#c9b080' }, skin: 'light', hair: 'horseshoe', hairColor: '#2a2420', moustache: '#2a2420', glasses: true, seed: 52 });
export const elder = () => bean({ name: 'Tsutomu (later)', outfit: 'uniform', colors: { main: '#7a6650', legsTop: '#4a4448', trim: '#d8c8a0' }, skin: 'light', hair: 'horseshoe', hairColor: '#e4e2de', browColor: '#cfcac4', glasses: true, seed: 53 });
export function briefcase() { const g = new THREE.Group(); g.add(rbox(0.5, 0.36, 0.12, '#5a3a22', 0, -0.2, 0, 0.03), rbox(0.16, 0.05, 0.05, '#3a2414', 0, 0.0, 0, 0.02)); outline(g, { px: 2.4 }); return g; }

// a simple 1940s wooden house (body + dark tiled roof)
function house(w, h, d, body, seed) { const g = new THREE.Group(); g.add(rbox(w, h, d, body, 0, h / 2, 0, 0.05));
  for (const s of [-1, 1]) { const r = rbox(w + 0.5, 0.14, d * 0.62, '#4a4c56', 0, h + d * 0.2, s * d * 0.24, 0.04); r.rotation.x = s * 0.62; g.add(r); }
  const win = rbox(w * 0.32, h * 0.3, 0.06, '#f2e6c8', -w * 0.18, h * 0.55, d / 2 + 0.02, 0.02); g.add(win); g.add(rbox(w * 0.28, h * 0.55, 0.06, '#6a4a30', w * 0.22, h * 0.28, d / 2 + 0.02, 0.02));
  outline(g, { px: 2.2 }); return g; }
// street of the city in the morning, houses on both sides running into -Z
export function street(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 0, -4] }); const sky = sunnySky(st, { clouds: 6, seed: o.seed || 2 });
  st.add(floor(120, 160, '#9fb27a', 0, -40)); st.add(floor(4.4, 80, '#c9b896', 0, -30));
  const r = rng(o.seed || 2); const cols = ['#b89870', '#a8825a', '#c4a882', '#9a7650'];
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const h = house(3.2, 2.4 + r() * 0.8, 3.0, cols[(i + (s > 0)) % 4], i); h.position.set(s * 4.4, 0, 4 - i * 4.2); h.rotation.y = s * -Math.PI / 2; st.add(h); }
  for (let i = 0; i < 6; i++) { const p = new THREE.Group(); p.add(cyl(0.07, 0.09, 5, '#6a5038', 0, 2.5, 0, 8), rbox(1.2, 0.1, 0.1, '#6a5038', 0, 4.6, 0, 0.03)); outline(p, { px: 2 }); p.position.set(2.6, 0, 2 - i * 7); st.add(p); }
  // far hills on the horizon (the distant light rises behind them)
  for (let i = 0; i < 7; i++) { const b = ball(10 + r() * 6, '#7f9a74', -40 + i * 14, -6, -95, 20); b.userData.noOutline = true; st.add(b); }
  return { stage: st, sky };
}
// the train carriage: side wall with a window at z = -1.5, benches, the countryside scrolls past outside (+X -> -X)
export function train(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'warm', fov: 38, shadowSize: 6, target: [0, 0, 0], bg: ['#83c2ee', '#f2e3bd'] });
  const sky = o.sky !== false ? sunnySky(st, { clouds: 7, seed: 6, horizon: '#f6e6c4' }) : null;
  const wood = '#7a5236', panel = '#c9b08a';
  st.add(floor(14, 6, '#6a5a4a', 0, 0.5));
  const wall = new THREE.Group(); wall.add(box(14, 1.6, 0.2, panel, 0, 0.8, -1.5), box(14, 1.2, 0.2, panel, 0, 3.8, -1.5), box(5.5, 1.6, 0.2, panel, -4.35, 2.4, -1.5), box(5.5, 1.6, 0.2, panel, 4.35, 2.4, -1.5), box(14, 0.16, 0.3, wood, 0, 1.6, -1.42), box(14, 0.12, 0.3, wood, 0, 3.2, -1.42));
  wall.children.forEach(m => m.userData.noOutline = true); st.add(wall);
  const fr = new THREE.Group(); fr.add(rbox(3.4, 0.12, 0.12, wood, 0, 3.2, 0), rbox(3.4, 0.12, 0.12, wood, 0, 1.6, 0), rbox(0.12, 1.7, 0.12, wood, -1.65, 2.4, 0), rbox(0.12, 1.7, 0.12, wood, 1.65, 2.4, 0)); fr.position.z = -1.32; outline(fr, { px: 2.2 }); st.add(fr);
  // benches (facing each other along X)
  const bench = (x, rot) => { const b = new THREE.Group(); b.add(rbox(1.6, 0.25, 1.0, '#5a6a50', 0, 0.85, 0, 0.06), rbox(1.6, 1.3, 0.2, '#5a6a50', 0, 1.6, -0.45, 0.06), rbox(1.5, 0.75, 0.9, wood, 0, 0.38, 0, 0.04)); outline(b, { px: 2.4 }); b.position.set(x, 0, -0.75); b.rotation.y = rot; return b; };
  st.add(bench(-1.4, Math.PI / 2), bench(1.6, -Math.PI / 2));
  st.add(rbox(10, 0.08, 0.6, '#8a8a90', 0, 4.1, -1.15, 0.03));
  // outside: ground + hills + trees + poles on a loop
  const out = new THREE.Group(); st.add(out); out.add(floor(400, 60, '#8fb06a', 0, -32));
  const r = rng(9), items = [];
  for (let i = 0; i < 26; i++) { const g = new THREE.Group(); const kind = i % 3; const z = kind === 2 ? -7 : -9 - r() * 14;
    if (kind === 2) g.add(cyl(0.06, 0.08, 4.4, '#5a4632', 0, 2.2, 0, 6), rbox(0.9, 0.08, 0.08, '#5a4632', 0, 4.1, 0, 0.02));
    else { g.add(cyl(0.12, 0.16, 1.6, '#6a4a30', 0, 0.8, 0, 6)); const c = ball(0.9 + r() * 0.6, ['#4f8a46', '#6aa04a', '#3f7a40'][i % 3], 0, 2.1, 0, 12); g.add(c); }
    outline(g, { px: 1.8 }); g.position.set(-30 + i * 2.4 + r(), 0, z); g.base = g.position.x; out.add(g); items.push(g); }
  for (let i = 0; i < 6; i++) { const h = ball(14 + r() * 8, '#7f9a74', -60 + i * 26, -8, -80, 18); h.userData.noOutline = true; out.add(h); }
  const yam = young(); yam.position.set(-1.25, 0.15, -0.75); yam.rotation.y = Math.PI / 2; st.add(yam);
  const s = { stage: st, sky, items, yam };
  s.update = (t, speed = 9) => { for (const it of items) { let x = it.base - t * speed; x = ((x + 32) % 64 + 64) % 64 - 32; it.position.x = x; } };
  return s;
}
// an interior room (office / home): back wall with a window, floor, extras
export function room(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'warm', fov: 38, shadowSize: 7, target: [0, 0, 0], bg: ['#e9dcc8', '#f3ebde'] });
  st.add(floor(26, 22, o.floor || '#b49a7a', 0, -2));
  st.add(plane(26, 9, o.wall || '#e2d4bc', 0, 4.5, -4.2), plane(26, 0.5, '#8a6a4a', 0, 0.25, -4.18));
  const winTex = canvasTex(256, 220, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5a9ad8'); gr.addColorStop(0.7, '#cfe4f2'); gr.addColorStop(1, '#a8b890'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = '#6a7a64'; for (let i = 0; i < 8; i++) g.fillRect(i * 34, 170 - (i % 3) * 14, 30, 60); });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), new THREE.MeshBasicMaterial({ map: winTex })); win.position.set(o.winX ?? -2.6, 3.0, -4.15); win.userData.noOutline = true; st.add(win);
  const fr = new THREE.Group(); fr.add(rbox(3.45, 0.14, 0.14, '#6a4a30', 0, 1.15, 0), rbox(3.45, 0.14, 0.14, '#6a4a30', 0, -1.15, 0), rbox(0.14, 2.4, 0.14, '#6a4a30', -1.66, 0, 0), rbox(0.14, 2.4, 0.14, '#6a4a30', 1.66, 0, 0), rbox(0.1, 2.3, 0.1, '#6a4a30', 0, 0, 0), rbox(3.3, 0.08, 0.08, '#6a4a30', 0, 0, 0)); fr.position.set(o.winX ?? -2.6, 3.0, -4.05); outline(fr, { px: 2.2 }); st.add(fr);
  // the light that floods in through the window (used by the office shot; intensity 0 by default)
  const flood = glow(2, '#fffaf0', 0); flood.position.set(o.winX ?? -2.6, 3.0, -3.9); st.add(flood);
  return { stage: st, win, flood };
}
// ship blueprint for the drafting table
export const blueprintTex = () => canvasTex(512, 340, (g, W, H) => { g.fillStyle = '#2a5a9a'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, 190); g.lineTo(470, 190); g.lineTo(430, 260); g.lineTo(90, 260); g.closePath(); g.stroke(); g.strokeRect(300, 130, 90, 60); g.strokeRect(330, 90, 40, 40); g.beginPath(); g.moveTo(140, 190); g.lineTo(140, 120); g.stroke(); });
export { PR, sunnySky, glow, box, rbox, cyl, ball, floor, plane, blob, outline, toonStage, toon };
