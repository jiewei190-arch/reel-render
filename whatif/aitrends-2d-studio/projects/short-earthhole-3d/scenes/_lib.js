// Shared sets + props for "What If You Jumped Into a Hole Through the Earth?" (Toon 3D remake).
// Underscore = not auto-loaded; the shot files import it.
// Thought experiment (shown on screen): a pole-to-pole tunnel, air pumped out, walls that never melt.
import { E, wordTime, text, ease, prog, clamp, lerp, rng, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, cyl, ball, torus, blob, INK } from '/kits/toon3d/toon.js';
import { castMember, MUSTARD } from '/kits/toon3d/cast.js';
import * as FX from '/kits/toon3d/fx.js';
export { THREE, MUSTARD };

// ---------- timing + overlay helpers ----------
// local time (s into the shot) when `word` is spoken (searching from the shot start)
export const at = (info, word, fallback = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fallback : g - info.shot.start; };
export function screen(st, v) { const p = v.clone().project(st.camera); return [(p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H]; }
// pill chip ("38 MIN", "0 g"): dark pill, gold text, pops in with outBack. k = 0..1 progress
export function chip(g, str, k = 1, y = 0.14, o = {}) {
  if (k <= 0) return; const { size = 64, color = '#ffd25a', bg = 'rgba(20,14,18,.84)', x = E.W / 2 } = o;
  g.save(); const s = 0.75 + 0.25 * ease.outBack(clamp(k)); g.translate(x, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.6);
  g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + size * 1.2, h = size * 1.5;
  g.fillStyle = bg; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill();
  text(g, str, 0, size * 0.04, { size, color, weight: 700 }); g.restore();
}
export const popK = (t, t0, d = 0.22) => clamp((t - t0) / d);
// sweat drops near a screen point
export function sweat(g, x, y, t, k = 1) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const a = ((t * 1.3 + i / 3) % 1); const px = x + (i - 1) * 46 + Math.sin(i * 2.1) * 12, py = y + a * 90; g.save(); g.globalAlpha = k * Math.sin(Math.PI * a); g.fillStyle = '#9fe0ff'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(px, py - 22); g.quadraticCurveTo(px + 13, py, px, py + 10); g.quadraticCurveTo(px - 13, py, px, py - 22); g.fill(); g.stroke(); g.restore(); } }

// ---------- the HERO ----------
export function hero(o = {}) { const h = castMember('hero', { hood: o.hood || 'up' }); return h; }
// falling poses (arms flail above, legs kick)
export const FALL = (t, k = 1) => ({ armL: [0.4, 2.3 + Math.sin(t * 13) * 0.25 * k, 0.2], armR: [0.4, 2.3 + Math.sin(t * 13 + 1.7) * 0.25 * k, 0.2], elbowL: 0.6 + Math.sin(t * 11) * 0.2 * k, elbowR: 0.6 + Math.sin(t * 11 + 2) * 0.2 * k,
  legL: [0.25 + Math.sin(t * 9) * 0.35 * k, 0.15], legR: [0.25 + Math.sin(t * 9 + Math.PI) * 0.35 * k, 0.15], kneeL: 0.5 + Math.sin(t * 9) * 0.3 * k, kneeR: 0.5 - Math.sin(t * 9) * 0.3 * k, headNod: -0.1 });
export const FLOAT = (t) => ({ armL: [0.5, 1.2 + Math.sin(t * 1.3) * 0.15, 0.3], armR: [0.5, 1.2 + Math.sin(t * 1.1 + 1) * 0.15, 0.3], elbowL: 0.5, elbowR: 0.5, legL: [0.5 + Math.sin(t * 0.9) * 0.1, 0.25], legR: [0.25, 0.2], kneeL: 0.8, kneeR: 0.6, headTilt: Math.sin(t * 0.8) * 0.1 });
export const TUCK = { armL: [1.2, 0.5, 0.4], armR: [1.2, 0.5, 0.4], elbowL: 1.6, elbowR: 1.6, legL: [1.3, 0.12], legR: [1.3, 0.12], kneeL: 1.9, kneeR: 1.9, headNod: 0.05 };

// ---------- textures ----------
export function signTex(txt, bg = '#f4ead2', fg = '#b0281e') {
  return canvasTex(512, 160, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5032'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    let sz = 92; g.font = `700 ${sz}px Fredoka, sans-serif`; while (g.measureText(txt).width > w - 60) { sz -= 4; g.font = `700 ${sz}px Fredoka, sans-serif`; }
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 6); });
}
// rock strata (repeats vertically), warm browns + greys with pebbles
function strataTex(seed = 4) {
  return canvasTex(256, 512, (g, w, h) => { const r = rng(seed); const cols = ['#8a6a4e', '#6e5a4a', '#a07a56', '#5e4e44', '#94785e', '#7a6656', '#b08a62', '#665446'];
    let y = 0; let i = 0; while (y < h) { const bh = 24 + r() * 60; g.fillStyle = cols[i++ % cols.length]; g.fillRect(0, y, w, bh + 1);
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, y + bh - 4, w, 4); y += bh; }
    for (let k = 0; k < 140; k++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,.18)' : 'rgba(30,20,10,.2)'; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 9, 2 + r() * 6, r() * 3, 0, 7); g.fill(); } }, { repeat: [3, 4] });
}

// ---------- snow ground with a round hole + glowing shaft below ----------
export function holeGround(st, o = {}) {
  const { R = 1.6, snow = '#eef3f8', glowCol = '#ff9a3a' } = o; const g = new THREE.Group();
  const sh = new THREE.Shape(); sh.absarc(0, 0, 60, 0, Math.PI * 2, false); const hp = new THREE.Path(); hp.absarc(0, 0, R, 0, Math.PI * 2, true); sh.holes.push(hp);
  const gm = new THREE.Mesh(new THREE.ShapeGeometry(sh, 64), toon(snow)); gm.rotation.x = -Math.PI / 2; gm.receiveShadow = true; gm.userData.noOutline = true; g.add(gm);
  const tm = toon('#ffffff', { map: strataTex(7), side: THREE.BackSide }); const tube = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 16, 40, 1, true), tm); tube.position.y = -8; tube.userData.noOutline = true; g.add(tube);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(R, 32), flat(glowCol)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = -15.5; g.add(bottom);
  const gl = FX.glow(R * 5, glowCol, 0.7); gl.position.y = -9; g.add(gl);
  const rim = torus(R + 0.05, 0.16, '#d8e4ee', 0, 0.04, 0); rim.rotation.x = Math.PI / 2; rim.scale.z = 0.6; outline(rim, { px: 2.6 }); g.add(rim);
  const light = new THREE.PointLight(new THREE.Color(glowCol), 6, 8, 1.5); light.position.y = -1.2; g.add(light);
  st.add(g); return { group: g, tube, light };
}
// snow mounds, ice blocks, far white mountains
export function snowDressing(st, o = {}) {
  const { seed = 3, ice = '#bfe3f5', far = '#e3ecf6' } = o; const r = rng(seed); const g = new THREE.Group();
  for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, d = 4 + r() * 9; const b = ball(0.8 + r() * 1.4, '#f6f9fc', Math.cos(a) * d, 0, -Math.abs(Math.sin(a) * d) - 1.5, 18); b.scale.y = 0.3 + r() * 0.15; g.add(b); }
  for (let i = 0; i < 5; i++) { const s = 0.5 + r() * 0.6; const b = rbox(s, s * 0.8, s, ice, (r() - 0.5) * 12, s * 0.4, -3 - r() * 6, 0.08); b.rotation.y = r() * 3; g.add(b); }
  outline(g, { px: 2.4 });
  for (let i = 0; i < 6; i++) { const h = 8 + r() * 10; const m = new THREE.Mesh(new THREE.ConeGeometry(h * 0.8, h, 7), toon(far)); m.position.set(-40 + i * 16 + r() * 6, h / 2 - 0.5, -45 - r() * 10); m.userData.noOutline = true; g.add(m); }
  st.add(g); return g;
}
// striped polar marker pole with a sign (NORTH POLE) or chrome ball (SOUTH POLE, like the real ceremonial pole)
export function poleMarker(st, txt, o = {}) {
  const { ballTop = false, h = 2.6 } = o; const g = new THREE.Group(); const n = 8;
  for (let i = 0; i < n; i++) g.add(cyl(0.11, 0.11, h / n, i % 2 ? '#f4f2ec' : '#c8302a', 0, (i + 0.5) * h / n, 0, 14));
  if (ballTop) { g.add(cyl(0.2, 0.2, 0.12, '#9a9ea6', 0, h + 0.06, 0, 16)); const b = ball(0.36, '#dfe6ee', 0, h + 0.45, 0, 28); b.material = toon('#dfe6ee', { emissive: new THREE.Color('#3a4a66'), emissiveIntensity: 0.25, fresh: true }); g.add(b); }
  else g.add(ball(0.17, '#d4a73a', 0, h + 0.1, 0, 14));
  const board = rbox(2.1, 0.66, 0.1, '#7a5032', 0, h * (ballTop ? 0.62 : 0.78), 0.14, 0.03); g.add(board);
  outline(g, { px: 2.6 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.98, 0.56), toon('#ffffff', { map: signTex(txt) })); face.position.set(0, board.position.y, 0.2); face.userData.noOutline = true; g.add(face);
  g.add(blob(0.5, 0.3)); st.add(g); return g;
}
// a toon penguin: .update(t, { waddle, flap, look:[x,y], shock, hop, lean })
export function penguin(o = {}) {
  const { seed = 1, s = 1 } = o; const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const BK = '#262833', WH = '#f6f3ec', OR = '#f0952a';
  const b = ball(0.46, BK, 0, 0.66, 0, 24); b.scale.set(1, 1.3, 0.95); body.add(b);
  const be = ball(0.38, WH, 0, 0.6, 0.16, 22); be.scale.set(0.95, 1.2, 0.75); body.add(be);
  const head = new THREE.Group(); head.position.y = 1.2; body.add(head);
  head.add(ball(0.33, BK, 0, 0, 0, 22)); const fw = ball(0.24, WH, 0, -0.02, 0.15, 18); fw.scale.set(1.05, 0.9, 0.6); head.add(fw);
  const eyes = []; for (const sx of [-1, 1]) { const e = ball(0.085, '#ffffff', sx * 0.11, 0.05, 0.27, 14); const p = ball(0.045, '#141018', 0, 0, 0.06, 10); p.userData.noOutline = true; e.add(p); head.add(e); eyes.push({ e, p }); }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 12), toon(OR)); beak.rotation.x = Math.PI / 2; beak.position.set(0, -0.06, 0.36); head.add(beak);
  const fl = []; for (const sx of [-1, 1]) { const p = new THREE.Group(); p.position.set(sx * 0.42, 0.95, 0); const f = rbox(0.09, 0.52, 0.22, BK, 0, -0.24, 0, 0.04); p.add(f); body.add(p); fl.push(p); }
  const feet = []; for (const sx of [-1, 1]) { const f = ball(0.14, OR, sx * 0.16, 0.04, 0.14, 12); f.scale.set(1, 0.35, 1.4); g.add(f); feet.push(f); }
  outline(g, { px: 2.6 }); g.add(blob(0.55, 0.3)); g.scale.setScalar(s);
  g.update = (t, q = {}) => { const { waddle = 0, flap = 0, look = [0, 0], shock = 0, hop = 0, lean = 0 } = q; const ph = t * 7 + seed;
    body.rotation.z = Math.sin(ph) * 0.12 * waddle + Math.sin(t * 1.3 + seed) * 0.02; body.rotation.x = lean; body.position.y = Math.abs(Math.sin(ph)) * 0.05 * waddle + hop;
    fl.forEach((p, i) => { p.rotation.z = (i ? 1 : -1) * (0.15 + flap * (0.9 + Math.sin(t * 22 + i) * 0.5)); });
    head.rotation.y = look[0] * 0.6; head.rotation.x = -look[1] * 0.4; eyes.forEach(({ e, p }) => { e.scale.setScalar(1 + shock * 0.45); p.scale.setScalar(1 - shock * 0.35); p.position.set(look[0] * 0.03, look[1] * 0.03, 0.06); });
    feet.forEach((f, i) => { f.position.y = 0.04 + Math.max(0, Math.sin(ph + i * Math.PI)) * 0.06 * waddle; }); };
  g.update(0); return g;
}

// ---------- NORTH POLE (bright Arctic day) ----------
export function northPole(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: 40, shadowSize: 9, target: [0, 0, 0], bg: ['#5f9fe0', '#a9d0f2', '#e9f3fb'], fog: [30, 80, '#e3eef8'], ...(o.stage || {}) });
  const hole = holeGround(st); snowDressing(st, { seed: 5 });
  const sign = poleMarker(st, 'NORTH POLE'); sign.position.set(-2.3, 0, -2.4); sign.rotation.y = 0.3;
  const h = hero(); st.add(h);
  const flakes = snowfall(st, { seed: 9 });
  return { stage: st, hole, sign, hero: h, flakes };
}
// ---------- SOUTH POLE (Antarctic twilight, penguins) ----------
export function southPole(T, o = {}) {
  const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: 9, target: [0, 0, 0], bg: ['#2a3266', '#6a5c9a', '#e9a6a0'], fog: [30, 80, '#a89ac0'], key: ['#ffc8a0', 2.2, [-8, 8, 7]], ...(o.stage || {}) });
  const hole = holeGround(st, { snow: '#e6e8f4' }); snowDressing(st, { seed: 11, far: '#c9c4e0' });
  const sign = poleMarker(st, 'SOUTH POLE', { ballTop: true }); sign.position.set(2.3, 0, -2.4); sign.rotation.y = -0.3;
  const pens = [[-2.1, 1.0, 0.5, 1.0], [-2.9, -0.3, 0.6, 0.85], [2.0, 1.2, -0.5, 0.9]].map(([x, z, ry, s], i) => { const p = penguin({ seed: i * 3 + 1, s }); p.position.set(x, 0, z); p.rotation.y = ry; st.add(p); return p; });
  const h = hero(); st.add(h);
  const stars = starfield(st, { seed: 4, count: 70, r: 70, minY: 12 });
  return { stage: st, hole, sign, pens, hero: h, stars };
}
// falling snow (flat white dots)
export function snowfall(st, o = {}) { const { seed = 1, count = 60 } = o; const r = rng(seed); const geo = new THREE.SphereGeometry(0.04, 6, 4), m = flat('#ffffff'); const P = []; const g = new THREE.Group();
  for (let i = 0; i < count; i++) { const me = new THREE.Mesh(geo, m); me.userData.noOutline = true; g.add(me); P.push({ me, x: (r() - 0.5) * 16, z: 3 - r() * 12, ph: r() * 10, sp: 0.3 + r() * 0.4 }); }
  g.update = (t) => { for (const p of P) p.me.position.set(p.x + Math.sin(t + p.ph) * 0.3, 8 - ((t * p.sp + p.ph) % 1) * 8, p.z); }; g.update(0); st.add(g); return g; }
export function starfield(st, o = {}) { const { seed = 1, count = 120, r: R = 80, minY = -80 } = o; const r = rng(seed); const pos = [];
  for (let i = 0; i < count; i++) { const a = r() * Math.PI * 2, y = minY + r() * (R - minY); pos.push(Math.cos(a) * R, y, -Math.abs(Math.sin(a)) * R - 10); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false })); st.add(p); return p; }

// ---------- THE SHAFT (falling through rock; heat 0..1 turns it orange -> red -> white-gold) ----------
const HEAT = ['#ffffff', '#ffb27a', '#ff6a3a', '#ffe6a0'];
export function shaft(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 46, shadow: false, bg: '#140c0c', target: [0, 0, 0], ...(o.stage || {}) });
  st.hemi.intensity = 1.6; st.key.intensity = 1.2; st.key.position.set(2, 6, 6);
  const R = 3.4; const tex = strataTex(o.seed || 4); const mat = toon('#ffffff', { map: tex, side: THREE.BackSide, emissive: new THREE.Color('#ff5a1a'), emissiveIntensity: 0 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 120, 48, 1, true), mat); tube.userData.noOutline = true; st.add(tube);
  // speed lines (thin bright streaks hugging the wall)
  const r = rng(12); const lines = []; const lg = new THREE.BoxGeometry(0.035, 1, 0.035);
  for (let i = 0; i < 34; i++) { const m = new THREE.Mesh(lg, flat('#fff6e0', { transparent: true, opacity: 0.8 })); const a = r() * Math.PI * 2, d = R * (0.55 + r() * 0.4); m.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); m.userData = { ph: r() * 40, len: 1.5 + r() * 3 }; m.userData.noOutline = true; st.add(m); lines.push(m); }
  const em = FX.embers({ count: 50, area: [5.5, 14, 5.5], seed: 21, color: '#ffc06a' }); em.position.y = -7; st.add(em); em.visible = false;
  const haze = FX.glow(14, '#ff7a2a', 0); haze.position.set(0, -8, 0); st.add(haze);
  const h = hero(); st.add(h);
  // d = distance fallen (units; walls move up by d), v = speed (units/s, for streak length), heat 0..1
  const update = (t, d, v, heat) => {
    tex.offset.y = d / 30; const hk = clamp(heat); const seg = Math.min(2, Math.floor(hk * 3)), f = hk * 3 - seg;
    mat.color.set(HEAT[seg]).lerp(new THREE.Color(HEAT[seg + 1]), f); mat.emissive.set(hk > 0.66 ? '#ffb040' : '#ff4a12'); mat.emissiveIntensity = hk * 0.75;
    st.hemi.color.set('#fff3e6').lerp(new THREE.Color('#ff9a50'), hk); st.exposure = 1 + hk * 0.15;
    const vis = clamp((v - 2) / 10); for (const m of lines) { const span = 30; const y = ((((m.userData.ph + d) % span) + span) % span) - span / 2; m.position.y = y; m.scale.y = m.userData.len * (0.3 + vis * 2.5); m.material.opacity = 0.75 * vis; m.visible = vis > 0.02; }
    em.visible = hk > 0.25; em.update(t * (1 + v * 0.1)); haze.material.opacity = hk * 0.5; st.scene.background.set?.(new THREE.Color('#140c0c'));
  };
  return { stage: st, tube, mat, hero: h, update };
}

// ---------- CUTAWAY GLOBE (crust, mantle, outer core, inner core; tunnel pole to pole; a tiny hero dot) ----------
function earthTex(seed = 3) {
  return canvasTex(1024, 512, (g, w, h) => { const r = rng(seed); g.fillStyle = '#3a8fd6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = r() * w, y = h * (0.18 + r() * 0.64), s = 30 + r() * 90; g.fillStyle = r() < 0.7 ? '#5fae4a' : '#c9a35a';
      for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.6, s * (0.3 + r() * 0.5), s * (0.2 + r() * 0.3), r() * 3, 0, 7); g.fill(); } }
    g.fillStyle = '#f4f8fc'; g.fillRect(0, 0, w, h * 0.09); g.fillRect(0, h * 0.91, w, h * 0.09); }, { wrap: true });
}
function layersTex() {
  return canvasTex(512, 512, (g, w, h) => { const c = w / 2; const L = [[1, '#8a5a3a'], [0.955, '#d9622b'], [0.56, '#f2a23a'], [0.32, '#ffe27a']];
    for (const [rr, col] of L) { g.fillStyle = col; g.beginPath(); g.arc(c, c, rr * c, 0, 7); g.fill(); g.strokeStyle = 'rgba(40,20,10,.55)'; g.lineWidth = 5; g.stroke(); }
    const gr = g.createRadialGradient(c, c, 0, c, c, 0.32 * c); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(c, c, 0.32 * c, 0, 7); g.fill(); });
}
export function globe(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: 34, shadow: false, bg: ['#070a1e', '#121a42', '#1e2a5e'], ...(o.stage || {}) });
  st.key.position.set(-6, 5, 9); st.key.intensity = 2.2; st.hemi.intensity = 1.3;
  const R = 3, G = new THREE.Group(); G.rotation.set(0.12, -0.55, 0); st.add(G);
  const a0 = Math.PI / 4, a1 = 3 * Math.PI / 4; // cut wedge (facing the camera, +Z)
  const etex = earthTex(); const surf = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40, a1, 2 * Math.PI - (a1 - a0)), toon('#ffffff', { map: etex })); G.add(surf);
  const ltex = layersTex(); for (const ph of [a0, a1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(R, 64, -Math.PI / 2, Math.PI), toon('#ffffff', { map: ltex, side: THREE.DoubleSide, emissive: new THREE.Color('#ff8a2a'), emissiveIntensity: 0.25 })); f.rotation.y = Math.PI + ph; f.userData.noOutline = true; G.add(f); }
  outline(surf, { px: 3 });
  const tunnel = cyl(0.07, 0.07, 2 * R + 0.3, '#1e1414', 0, 0, 0, 10); tunnel.userData.noOutline = true; G.add(tunnel);
  const coreGlow = FX.glow(2.6, '#ffd27a', 0.55); G.add(coreGlow);
  const dot = ball(0.15, MUSTARD, 0, R, 0, 16); outline(dot, { px: 2.6 }); G.add(dot); const dg = FX.glow(0.9, '#ffe08a', 0.8); dot.add(dg);
  // pole flags
  const nf = cyl(0.025, 0.025, 0.6, '#f4f2ec', 0, R + 0.3, 0, 6); const sf = cyl(0.025, 0.025, 0.6, '#f4f2ec', 0, -R - 0.3, 0, 6); G.add(nf, sf);
  const atm = FX.glow(R * 3.0, '#6ab8ff', 0.35); atm.position.z = -1; st.add(atm);
  const stars = starfield(st, { seed: 7, count: 160, r: 60 });
  const trail = []; for (let i = 0; i < 8; i++) { const b = ball(0.12 - i * 0.012, '#ffd25a', 0, 0, 0, 10); b.material = flat('#ffd25a', { transparent: true, opacity: 0.6 - i * 0.07 }); b.userData.noOutline = true; G.add(b); trail.push(b); }
  // y in -1..1 (1 = north pole); spin = surface rotation; tr = trail length (0 = off)
  const update = (t, y, spin = 0, tr = 0, vy = 0) => { etex.offset.x = spin; dot.position.y = y * R; trail.forEach((b, i) => { b.visible = tr > 0; b.position.y = clamp(y + vy * (i + 1) * 0.05 * tr, -1, 1) * R; }); coreGlow.material.opacity = 0.45 + Math.sin(t * 3) * 0.08; };
  return { stage: st, G, surf, dot, update, R };
}

// ---------- PROPS: pressure gauge, thermometer, sun ----------
function dialTex(label) { return canvasTex(256, 256, (g, w, h) => { const c = w / 2; g.fillStyle = '#f7f1e2'; g.beginPath(); g.arc(c, c, c - 4, 0, 7); g.fill();
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25; g.lineWidth = 16; g.strokeStyle = '#e8463a'; g.beginPath(); g.arc(c, c, c * 0.78, a0 + (a1 - a0) * 0.7, a1); g.stroke();
  g.strokeStyle = '#2a2024'; for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; g.lineWidth = i % 5 ? 4 : 8; g.beginPath(); g.moveTo(c + Math.cos(a) * c * 0.66, c + Math.sin(a) * c * 0.66); g.lineTo(c + Math.cos(a) * c * 0.86, c + Math.sin(a) * c * 0.86); g.stroke(); }
  g.fillStyle = '#2a2024'; g.font = '700 30px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText(label, c, c + c * 0.5); }); }
export function gauge(label = 'PRESSURE') {
  const g = new THREE.Group(); const body = cyl(0.62, 0.62, 0.22, '#c9a14a', 0, 0, 0, 32); body.rotation.x = Math.PI / 2; g.add(body);
  const rim = torus(0.6, 0.06, '#e0b84a', 0, 0, 0.11); g.add(rim); const stem = cyl(0.1, 0.1, 0.4, '#c9a14a', 0, -0.75, 0, 12); g.add(stem);
  outline(g, { px: 2.6 });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.56, 40), toon('#ffffff', { map: dialTex(label) })); face.position.z = 0.115; face.userData.noOutline = true; g.add(face);
  const pivot = new THREE.Group(); pivot.position.z = 0.14; g.add(pivot); const nd = rbox(0.05, 0.46, 0.02, '#c8302a', 0, 0.2, 0, 0.01); nd.userData.noOutline = true; pivot.add(nd); pivot.add(ball(0.06, '#2a2024', 0, 0, 0.01, 10));
  g.set = (k) => { pivot.rotation.z = lerp(2.36, -2.36, clamp(k)); }; g.set(0); return g;
}
export function thermometer() {
  const g = new THREE.Group(); const tube = cyl(0.15, 0.15, 2.4, '#e8f4fa', 0, 1.2, 0, 16); g.add(tube); g.add(ball(0.28, '#e0342a', 0, 0, 0, 18)); g.add(ball(0.15, '#e8f4fa', 0, 2.4, 0, 12));
  outline(g, { px: 2.6 });
  const fill = cyl(0.085, 0.085, 1, '#e0342a', 0, 0, 0.0, 12); fill.userData.noOutline = true; g.add(fill);
  for (let i = 1; i < 8; i++) { const m = rbox(0.12, 0.025, 0.02, '#2a2024', 0.1, 0.25 + i * 0.27, 0.13, 0.005); m.userData.noOutline = true; g.add(m); }
  g.set = (k) => { const h = 0.1 + clamp(k) * 2.1; fill.scale.y = h; fill.position.y = 0.15 + h / 2; }; g.set(0); return g;
}
export function sun(r = 1.6) {
  const g = new THREE.Group(); const m = ball(r, '#ffc23a', 0, 0, 0, 40); m.material = toon('#ffc23a', { emissive: new THREE.Color('#ff9a1a'), emissiveIntensity: 0.6, fresh: true }); g.add(m); outline(g, { px: 3, color: '#a0400a' });
  const gl = FX.glow(r * 5, '#ffb03a', 0.6); g.add(gl); const rays = []; for (let i = 0; i < 12; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.18 * r, 0.55 * r, 8), flat('#ffd25a')); const a = (i / 12) * Math.PI * 2; c.position.set(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, 0); c.rotation.z = a - Math.PI / 2; c.userData.noOutline = true; g.add(c); rays.push(c); }
  g.update = (t) => { g.rotation.z = t * 0.2; gl.material.opacity = 0.5 + Math.sin(t * 4) * 0.08; }; return g;
}
export { ease, prog, clamp, lerp, rng };
