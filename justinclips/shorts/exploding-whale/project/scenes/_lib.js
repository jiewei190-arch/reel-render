// Oregon's Exploding Whale (1970) — shared assets. EMOTION: LOL. Deadpan narrator.
// Tone guard: the whale is already dead (closed, peaceful cartoon eyes); nobody is ever hurt on screen; the car is empty.
// Blubber chunks are pale cream/grey toon blobs (no red, no gore). Every character and set is an original toon.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };

// ---------------------------------------------------------------- CHARACTERS
export function hardHat(b, color = '#f6c83a') {
  const R = 0.48, g = new THREE.Group(), m = toon(color);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 28, 12, 0, Math.PI * 2, 0, 1.35), m); dome.position.y = 0.06; dome.castShadow = true; g.add(dome);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.38, R * 1.42, 0.05, 32), m); brim.position.set(0, 0.06 + R * 1.12 * Math.cos(1.35), 0.04); brim.castShadow = true; g.add(brim);
  const ridge = mesh(sph, toon(shadeHex(color, -0.08)), 0.07, 0.06, R * 1.05); ridge.position.y = 0.06 + R * 1.08; g.add(ridge);
  outline(g, { px: 3 }); g.rotation.x = -0.12; b.parts.head.add(g); b.hat = g; return g;
}
export function worker(o = {}) {
  const b = bean({ name: 'Crew', outfit: 'uniform', colors: { main: o.main || '#f08a24', trim: '#f6e04a', belt: '#4a3a2a' }, skin: o.skin || 'tan',
    hair: 'bowl', hairColor: o.hair || '#3a2416', moustache: o.moustache ?? false, seed: o.seed || 7, scale: o.scale || 1 });
  hardHat(b, o.hat || '#f6c83a'); return b;
}
export function veteran(o = {}) {
  return bean({ name: 'Vet', outfit: 'uniform', colors: { main: '#6a7a44', trim: '#c9b36a', belt: '#3a3020' }, skin: o.skin || 'light', hair: 'horseshoe', hairColor: '#8a8a8a',
    moustache: '#7a7a7a', head: 'cap', headColor: '#56663a', seed: o.seed || 19 });
}
export function reporter(o = {}) {
  const b = bean({ name: 'Reporter', outfit: 'uniform', colors: { main: '#7a5a3a', trim: '#e2c48a', belt: '#3a2a1a' }, skin: o.skin || 'fair', hair: 'swoop', hairColor: '#4a2e18', seed: o.seed || 23 });
  const mic = new THREE.Group(); mic.add(cyl(0.035, 0.03, 0.34, '#2a2a30', 0, 0.0, 0, 10)); mic.add(ball(0.075, '#4a4a52', 0, 0.2, 0, 14)); outline(mic, { px: 2.6 });
  b.hand.R.add(mic); mic.position.set(0, 0.12, 0.06); mic.rotation.x = -0.4; b.mic = mic; return b;
}
export function local(o = {}) {
  return bean({ name: 'Local', outfit: o.outfit || 'tee', colors: { main: o.main || '#3f8fc0', trim: '#ffffff', print: o.print || '#f6d04a' }, skin: o.skin || 'light',
    hair: o.hair || 'curly', hairColor: o.hairColor || '#5a3418', head: o.head || 'none', headColor: o.headColor, seed: o.seed || 31, scale: o.scale || 1 });
}

// ---------------------------------------------------------------- THE WHALE (toon sperm whale, already dead: eyes closed)
export function whale(o = {}) {
  const g = new THREE.Group(); const skin = toon(o.color || '#5d6d86'), dark = toon('#46546a'), belly = toon('#a9b4c4');
  const body = mesh(sph, skin, 3.4, 1.15, 1.3); body.position.set(-0.6, 1.05, 0); g.add(body);
  const head = rbox(3.4, 2.1, 2.3, o.color || '#5d6d86', 2.8, 1.15, 0, 0.75); g.add(head);
  const jaw = rbox(2.7, 0.36, 1.2, '#a9b4c4', 2.9, 0.22, 0.15, 0.16); g.add(jaw);
  const bel = mesh(sph, belly, 3.0, 0.5, 1.05); bel.position.set(-0.3, 0.45, 0.12); g.add(bel);
  const stock = mesh(sph, skin, 1.9, 0.62, 0.68); stock.position.set(-4.1, 0.75, 0); stock.rotation.z = 0.08; g.add(stock);
  const fl = new THREE.Group(); fl.position.set(-5.8, 0.55, 0); g.add(fl);
  for (const s of [-1, 1]) { const f = mesh(sph, dark, 0.75, 0.11, 1.15); f.position.set(-0.2, 0, s * 0.95); f.rotation.y = s * 0.45; fl.add(f); }
  for (const s of [-1, 1]) { const fin = mesh(sph, dark, 0.65, 0.12, 0.36); fin.position.set(1.4, 0.45, s * 1.15); fin.rotation.set(s * 0.6, s * 0.4, -0.3); g.add(fin); }
  // wrinkles on the back
  for (let i = 0; i < 5; i++) { const w = mesh(sph, dark, 0.12, 0.05, 0.9); w.position.set(-2.6 + i * 0.7, 2.05 - Math.abs(i - 2) * 0.08, 0); g.add(w); }
  // closed, peaceful eyes (an arc of lid) on both sides
  for (const s of [-1, 1]) { const lid = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 16, Math.PI), flat('#1a1820')); lid.position.set(2.2, 1.05, s * 1.16); lid.rotation.set(0, s < 0 ? Math.PI : 0, Math.PI); lid.userData.noOutline = true; g.add(lid); }
  const blow = mesh(sph, dark, 0.12, 0.05, 0.08); blow.position.set(4.3, 2.18, 0); g.add(blow);
  outline(g, { px: 2.8 });
  g.body = body; g.head = head;
  return g;
}
// what's left after the blast: the whale, mostly intact, with a scorched dent on top + scattered chunks
export function scorch(o = {}) {
  const g = new THREE.Group();
  const s = mesh(sph, toon('#2a2428'), 1.3, 0.25, 0.9); s.position.set(0, 2.1, 0); g.add(s);
  const r = rng(o.seed || 3);
  for (let i = 0; i < (o.n || 16); i++) { const c = chunkMesh(r); c.position.set((r() - 0.5) * 14, 0.1, (r() - 0.2) * 7); c.rotation.set(r() * 3, r() * 3, r() * 3); g.add(c); }
  return g;
}
const CHUNK_COLS = ['#efe2cc', '#e2d0b6', '#8a96a8', '#d8c4ac', '#f4ead8'];
function chunkMesh(r) { const c = rbox(0.3 + r() * 0.35, 0.2 + r() * 0.25, 0.28 + r() * 0.3, CHUNK_COLS[Math.floor(r() * CHUNK_COLS.length)], 0, 0, 0, 0.08); outline(c, { px: 2.2 }); return c; }

// explosion(o): fireball + smoke + blubber chunks + sand spray, deterministic; .update(t) with t = seconds since detonation (negative = not yet)
export function explosion(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 11); const size = o.size || 3;
  const fire = FX.fire({ size, tongues: 9, spread: 0.9, seed: 4 }); g.add(fire);
  const core = FX.glow(size * 7, '#fff2b0', 0.9); core.position.y = size; g.add(core);
  const sm = FX.smoke({ count: 16, size: size * 0.55, rise: 1.8, spread: size * 1.2, color: '#f0e6dc', life: 3.2, seed: 6, drift: [0.4, 0] }); g.add(sm);
  const chunks = []; for (let i = 0; i < (o.chunks || 46); i++) { const m = chunkMesh(r); g.add(m); const a = r() * Math.PI * 2, el = 0.35 + r() * 1.0, sp = 6 + r() * 10;
    chunks.push({ m, v: [Math.cos(a) * Math.cos(el) * sp * (o.spreadX || 1), Math.sin(el) * sp * 1.25, Math.sin(a) * Math.cos(el) * sp * 0.6], w: [r() * 12, r() * 12, r() * 12], p0: [(r() - 0.5) * 2, 1 + r(), (r() - 0.5) * 1.5] }); }
  const sand = []; const sm2 = toon('#e7cf9a'); for (let i = 0; i < 30; i++) { const m = mesh(sph, sm2, 0.12, 0.12, 0.12); g.add(m); const a = r() * Math.PI * 2, sp = 3 + r() * 6; sand.push({ m, v: [Math.cos(a) * sp, 4 + r() * 6, Math.sin(a) * sp * 0.6] }); }
  outline(sand.map(s => s.m)[0], { px: 1 });
  const G = 9.8;
  g.update = (t) => {
    const on = t >= 0; fire.visible = core.visible = on && t < 1.6; sm.visible = on;
    if (on) { const k = ease.outBack(clamp(t / 0.25)); fire.scale.setScalar(Math.max(0.01, k * (1 + t * 0.5)) * (1 - clamp((t - 1.0) / 0.6))); fire.update(t); core.material.opacity = 0.95 * (1 - clamp(t / 0.6)); core.scale.setScalar(size * 7 * (0.5 + k)); sm.update(t + 0.5); sm.scale.setScalar(clamp(t / 0.3) * (1 + t * 0.25)); }
    for (const c of chunks) { c.m.visible = on; if (!on) continue; let y = c.p0[1] + c.v[1] * t - 0.5 * G * t * t; const land = y < 0.1; if (land) y = 0.1;
      const tt = land ? (c.v[1] + Math.sqrt(c.v[1] * c.v[1] + 2 * G * c.p0[1])) / G : t;
      c.m.position.set(c.p0[0] + c.v[0] * tt, y, c.p0[2] + c.v[2] * tt); if (!land) c.m.rotation.set(c.w[0] * t, c.w[1] * t, c.w[2] * t); }
    for (const s of sand) { s.m.visible = on && t < 2; if (!on) continue; s.m.position.set(s.v[0] * t, Math.max(0.05, s.v[1] * t - 0.5 * G * t * t), s.v[2] * t); }
  };
  g.update(-1); return g;
}

// ---------------------------------------------------------------- PROPS
export function stickBundle(n = 6) {
  const g = new THREE.Group(); const red = toon('#d8382a');
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 12), red); c.position.set(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08); c.castShadow = true; g.add(c); }
  g.add(cyl(0.12, 0.12, 0.08, '#e9dcc0', 0, 0, 0, 14)); const fuse = cyl(0.01, 0.01, 0.25, '#3a2a1a', 0, 0.38, 0, 6); g.add(fuse);
  outline(g, { px: 2.4 }); return g;
}
const crateTex = () => canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#c9965a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8a5a2a'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
  x.fillStyle = '#9a6a3a'; for (let i = 1; i < 4; i++) x.fillRect(0, i * h / 4 - 2, w, 4); x.fillStyle = '#c8281e'; x.font = '900 46px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DYNAMITE', w / 2, h / 2 - 8); x.font = '900 26px "Nunito", sans-serif'; x.fillText('DANGER', w / 2, h / 2 + 34); });
let _ct = null;
export function crate(s = 0.8) { _ct ||= crateTex(); const m = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.7, s * 0.7), toon('#ffffff', { map: _ct })); m.castShadow = true; m.receiveShadow = true; const g = new THREE.Group(); m.position.y = s * 0.35; g.add(m); return g; }
export function tvCamera() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const l = cyl(0.03, 0.03, 1.6, '#3a3a40', Math.cos(a) * 0.3, 0.75, Math.sin(a) * 0.3, 6); l.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2); g.add(l); }
  g.add(rbox(0.5, 0.45, 0.8, '#2a2c34', 0, 1.75, 0, 0.06)); g.add(cyl(0.14, 0.17, 0.4, '#1a1a20', 0, 1.75, 0.55, 16).rotateX(Math.PI / 2));
  g.add(cyl(0.18, 0.18, 0.06, '#3a3a40', -0.12, 2.08, -0.1, 16).rotateZ(Math.PI / 2), cyl(0.18, 0.18, 0.06, '#3a3a40', 0.12, 2.08, -0.1, 16).rotateZ(Math.PI / 2));
  const rec = ball(0.04, '#ff3030', 0.18, 1.95, 0.3, 8); g.add(rec); g.rec = rec;
  outline(g, { px: 2.4 }); return g;
}
// a shiny new late-60s sedan. car.crush(k) 0..1 caves the roof in (nobody inside).
export function car(o = {}) {
  const g = new THREE.Group(); const col = o.color || '#7cc6ae';
  const lower = rbox(4.2, 0.75, 1.8, col, 0, 0.75, 0, 0.18); g.add(lower);
  const chrome = rbox(4.3, 0.12, 1.84, '#dfe6ea', 0, 0.48, 0, 0.05); g.add(chrome);
  const cab = new THREE.Group(); cab.position.set(-0.25, 1.12, 0); g.add(cab);
  cab.add(rbox(2.2, 0.72, 1.62, col, 0, 0.36, 0, 0.16));
  const glassM = toon('#8fc4e8'); for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.48), glassM); w.position.set(0, 0.4, s * 0.815); if (s < 0) w.rotation.y = Math.PI; w.userData.noOutline = true; cab.add(w); }
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), glassM); ws.position.set(1.105, 0.4, 0); ws.rotation.y = Math.PI / 2; ws.userData.noOutline = true; cab.add(ws);
  const wheels = []; for (const x of [-1.35, 1.35]) for (const z of [-0.88, 0.88]) { const w = cyl(0.36, 0.36, 0.3, '#1e1e24', x, 0.36, z, 20); w.rotation.x = Math.PI / 2; g.add(w); w.add(cyl(0.18, 0.18, 0.32, '#c9ced4', 0, 0, 0, 14)); wheels.push(w); }
  for (const z of [-0.6, 0.6]) g.add(ball(0.13, '#fff6c8', 2.1, 0.85, z, 12));
  const tagT = canvasTex(256, 160, (x, w, h) => { x.fillStyle = '#fff36a'; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 18); x.fill(); x.strokeStyle = '#2a1c15'; x.lineWidth = 8; x.stroke(); x.fillStyle = '#d8281e'; x.font = '900 78px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NEW!', w / 2, h / 2 + 4); });
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.47), toon('#ffffff', { map: tagT })); tag.position.set(0.1, 0.42, 0.825); tag.rotation.z = -0.08; tag.userData.noOutline = true; cab.add(tag);
  outline(g, { px: 2.6 });
  g.crush = (k) => { k = clamp(k); cab.scale.set(1 + 0.08 * k, 1 - 0.78 * k, 1 + 0.06 * k); cab.position.y = 1.12 - 0.05 * k; lower.scale.y = 1 - 0.15 * k; wheels.forEach((w, i) => { w.rotation.z = (i % 2 ? 1 : -1) * 0.25 * k; }); };
  return g;
}
export function chunk(seed = 2, s = 1) { const r = rng(seed); const g = new THREE.Group(); const c = rbox(1.2 * s, 0.55 * s, 0.9 * s, '#e9dcc4', 0, 0, 0, 0.22 * s); g.add(c); const skin = rbox(1.22 * s, 0.16 * s, 0.92 * s, '#5d6d86', 0, 0.24 * s, 0, 0.07 * s); g.add(skin); outline(g, { px: 3 }); return g; }
export function gull() {
  const g = new THREE.Group(); const w = toon('#f6f6f2'), gr = toon('#b8c0c8');
  const b = mesh(sph, w, 0.32, 0.22, 0.22); g.add(b); const h = mesh(sph, w, 0.15, 0.15, 0.15); h.position.set(0.3, 0.12, 0); g.add(h);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 8), toon('#f2b632')); bk.rotation.z = -Math.PI / 2; bk.position.set(0.48, 0.1, 0); g.add(bk);
  const wings = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(0, 0.08, s * 0.12); const m = mesh(sph, gr, 0.24, 0.03, 0.42); m.position.z = s * 0.4; pv.add(m); g.add(pv); return { pv, s }; });
  outline(g, { px: 2 }); g.flap = (t) => { wings.forEach(({ pv, s }) => { pv.rotation.x = s * 0.6 * Math.sin(t * 14); }); }; return g;
}

// ---------------------------------------------------------------- SETS
// beach(st, o): sand, foam line, ocean, grassy dunes behind, sunny sky. The camera usually sits at +Z looking -Z toward the sea.
export function beach(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const sandT = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#ecd6a4'; x.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 900; i++) { x.fillStyle = r() > 0.5 ? 'rgba(200,170,120,.35)' : 'rgba(255,245,215,.4)'; x.fillRect(r() * w, r() * h, 2, 2); } });
  sandT.wrapS = sandT.wrapT = THREE.RepeatWrapping; sandT.repeat.set(10, 10);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), toon('#ffffff', { map: sandT })); sand.rotation.x = -Math.PI / 2; sand.position.z = 10; sand.receiveShadow = true; sand.userData.noOutline = true; g.add(sand);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 160), toon('#3a8fc4', { emissive: new THREE.Color('#2a6fa4'), emissiveIntensity: 0.25 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.03, (o.seaZ ?? -14) - 80); sea.userData.noOutline = true; g.add(sea);
  const foam = []; for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(400, 0.5 + i * 0.2), flat('#f4fbff', { transparent: true, opacity: 0.85 - i * 0.2 })); f.rotation.x = -Math.PI / 2; f.position.set(0, 0.05, (o.seaZ ?? -14) - i * 2.4); f.userData.noOutline = true; g.add(f); foam.push(f); }
  if (o.dunes !== false) { const r = rng(o.seed || 2); for (let i = 0; i < 9; i++) { const d = mesh(sph, toon('#e2c78e'), 6 + r() * 4, 1.6 + r() * 1.2, 4); d.position.set(-40 + i * 10 + r() * 3, 0, (o.duneZ ?? 22) + r() * 4); g.add(d); for (let k = 0; k < 5; k++) { const gr = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.2, 5), toon('#7a9a4a')); gr.position.set(d.position.x + (r() - 0.5) * 8, 1.4 + r(), d.position.z - 2 + r()); gr.rotation.z = (r() - 0.5) * 0.5; g.add(gr); } } }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3 });
  return { group: g, sky, update(t) { sky.update(t); foam.forEach((f, i) => { f.position.z = (o.seaZ ?? -14) - i * 2.4 + Math.sin(t * 1.3 + i) * 0.5; }); } };
}

// ---------------------------------------------------------------- 2D OVERLAYS
export const TOP_CAPTION = ['with half a ton', 'of dynamite'];
export const TOP_UNTIL = 3.7;
export function topCaption(g, t, info) {
  const T = info.shot.start + t; if (T > TOP_UNTIL) return; const fade = clamp((TOP_UNTIL - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  TOP_CAPTION.forEach((l, i) => { g.save(); g.translate(E.W / 2, 172 + i * 96); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 88 : 76, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
export function stamp(g, t, text, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = lerp(2.4, 1, ease.out(k)); const x = o.x ?? E.W / 2, y = o.y ?? 760; const w = o.w || 600;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(s, s); g.globalAlpha = clamp(k * 1.4) * 0.95; g.lineJoin = 'round';
  g.fillStyle = o.fill || 'rgba(255,248,236,.0)'; g.strokeStyle = o.color || '#d8281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-w / 2, -90, w, 180, 22); g.fill(); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2 + 18, -72, w - 36, 144, 16); g.stroke();
  insT(g, text, 0, 6, o.size || 120, { color: o.color || '#d8281e', stroke: o.stroke ?? null, maxW: w - 50 });
  g.restore();
}
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420;
  g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(k, k); g.globalAlpha = 0.95; g.lineJoin = 'round';
  g.fillStyle = 'rgba(255,248,236,.88)'; g.strokeStyle = '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-140, -60, 280, 120, 18); g.fill(); g.stroke();
  insT(g, String(year), 0, 4, 92, { color: '#e23b2e', stroke: null }); g.restore();
}
// comic KA-BOOM starburst
export function kaboom(g, t, o = {}) {
  if (t < 0 || t > (o.until ?? 1.6)) return; const k = ease.outBack(clamp(t / 0.18)); const fade = 1 - clamp((t - (o.until ?? 1.6) + 0.25) / 0.25);
  const x = o.x ?? E.W / 2, y = o.y ?? 760, R = (o.r ?? 330) * k * (1 + t * 0.06);
  g.save(); g.translate(x, y); g.rotate(-0.08 + Math.sin(t * 20) * 0.01); g.globalAlpha = fade; g.lineJoin = 'round';
  const star = (rr, col) => { g.beginPath(); const n = 18; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2; const q = i % 2 ? rr * 0.68 : rr * (0.95 + 0.08 * Math.sin(i * 7.3)); g.lineTo(Math.cos(a) * q, Math.sin(a) * q * 0.72); } g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = CARD_INK; g.lineWidth = 10; g.stroke(); };
  star(R, '#ffb21e'); star(R * 0.72, '#fff06a');
  insT(g, o.text || 'KA-BOOM!', 0, 10, 150 * k, { color: '#e2321e', stroke: CARD_INK, maxW: R * 1.5 });
  g.restore();
}
export function rewindBadge(g, t, o = {}) {
  if (t > (o.until ?? 0.8)) return; const a = 1 - clamp((t - (o.until ?? 0.8) + 0.15) / 0.15);
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(10,12,24,.35)'; g.fillRect(0, 0, E.W, E.H);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, ((t * 1400 + i * 340) % E.H), E.W, 18); }
  insT(g, '◀◀ REWIND', E.W / 2, 560, 96, { color: '#ffffff', stroke: CARD_INK }); g.restore();
}
export function newsBar(g, t, o = {}) {
  const k = ease.out(clamp(t / 0.3)); const y = o.y ?? 1180;
  g.save(); g.translate(lerp(-E.W, 0, k), 0);
  g.fillStyle = '#c8281e'; g.fillRect(40, y, 300, 86); g.fillStyle = '#f6f1e6'; g.fillRect(340, y, E.W - 380, 86); g.strokeStyle = CARD_INK; g.lineWidth = 6; g.strokeRect(40, y, E.W - 80, 86);
  insT(g, 'NEWS', 190, y + 46, 58, { color: '#ffffff', stroke: null }); insT(g, o.text || 'FLORENCE, OREGON · 1970', 340 + (E.W - 380) / 2, y + 46, 44, { color: CARD_INK, stroke: null, maxW: E.W - 420 });
  g.restore();
}
export function stink(g, x, y, t, o = {}) {
  g.save(); g.strokeStyle = o.color || 'rgba(120,170,60,.85)'; g.lineWidth = o.w || 9; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.9; g.beginPath(); for (let k = 0; k <= 20; k++) { const yy = y - k * 9 - ph * 120; const xx = x + (i - 1) * 70 + Math.sin(k * 0.6 + t * 4 + i) * 16; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  g.restore();
}
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, canvasTex, PR, FX, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, sunnySky };
