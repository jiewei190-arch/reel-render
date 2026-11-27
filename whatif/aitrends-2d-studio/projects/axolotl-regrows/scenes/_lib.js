// Axolotl Regrows Short: shared 3D assets (underscore = not auto-loaded). Toon 3D bean style, all original designs.
// Freshwater set, lidded eyes and 2D helpers adapted from mantis-shrimp-punch / immortal-jellyfish; axolotl(), xray icons, canal set are new.
// Tone guard: no injury is shown. A lost leg just goes 'poof' (dotted outline), then regrows.
import { wordTime, rng, clamp, lerp, ease, prog, E, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, torus, plane, floor, lathe, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as TXT } from '/kits/toon3d/insert.js';
import { reactions as _reactions } from '/kits/toon3d/react.js';

// time of a spoken word, shot-local (fallback fb)
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);
const shadeC = (hex, k) => { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); };
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };

// ---------- eyes with a real lid ----------
function lidEye(parent, pos, n, size, o = {}) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.12, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.44, 0.5, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const hl = new THREE.Mesh(sph, flat('#ffffff')); hl.scale.set(0.14, 0.14, 0.05); hl.position.set(-0.14, 0.18, 1.0); hl.userData.noOutline = true; pg.add(hl);
  const lp = new THREE.Group(); eg.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#e9a8c0', { fresh: true })); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp };
}

// ---------- the sea ----------
// seaStage(T, { dark, fov, floor, seed, rays }) — sunlit shallow water (or dark water for the hook), sandy floor, seaweed, rocks, drifting specks
export function seaStage(T, o = {}) {
  const dark = !!o.dark;
  const st = toonStage(T, { light: 'day', fov: o.fov || 36, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0],
    bg: o.bg || (dark ? ['#0d3f78', '#072650', '#030c24'] : ['#7fd8f0', '#2a9ccc', '#0d5a92']),
    fog: o.fog || (dark ? [8, 34, '#062048'] : [10, 46, '#2f8fc0']),
    sky: dark ? '#7aa8ff' : '#d8f4ff', ground: dark ? '#1a2a5a' : '#3a7a9a', ambient: dark ? 0.9 : 1.25,
    key: dark ? ['#bfe0ff', 1.6, [-4, 10, 6]] : ['#fff6dc', 2.6, [-5, 12, 5]], fill: dark ? ['#ff8ad0', 0.5, [6, 2, 6]] : ['#9ad8ff', 0.6, [8, 4, 6]], ...o.stage });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 5);
  const parts = { group: g };
  if (o.floor !== false) {
    const fl = floor(200, 200, o.floorColor || (dark ? '#2a3f6a' : '#e6d29a'), 0, 0); fl.receiveShadow = true; g.add(fl);
    const rockM = [toon(dark ? '#3a4a7a' : '#8a8f9a'), toon(dark ? '#2e3c66' : '#a0a4ae')];
    for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 30, z = -r() * 28 + 4; if (Math.abs(x) < (o.clear || 2.4) && z > -3) continue; const s = 0.3 + r() * 0.9; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockM[i % 2]); m.position.set(x, s * 0.3, z); m.scale.set(s, s * 0.6, s * 0.8); m.rotation.y = r() * 3; m.castShadow = true; g.add(m); }
    const weedC = dark ? ['#2a7a6a', '#3a8a5a'] : ['#3fae5a', '#5ac46a', '#2f9a4a'];
    const weeds = [];
    for (let i = 0; i < (o.weeds ?? 22); i++) { const x = (r() - 0.5) * 26, z = -r() * 22 + 3; if (Math.abs(x) < (o.clear || 2.4) && z > -3) continue; const w = new THREE.Group(); w.position.set(x, 0, z); const n = 4 + Math.floor(r() * 4); const mat = toon(weedC[i % weedC.length]); let p = w;
      for (let k = 0; k < n; k++) { const sg = new THREE.Group(); if (k) sg.position.y = 0.42; p.add(sg); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.36, 4, 8).translate(0, 0.21, 0), mat); m.castShadow = true; sg.add(m); p = sg; }
      w.ph = r() * 6; g.add(w); weeds.push(w); }
    // coral fans
    const coralC = ['#ff7a6a', '#ffb04a', '#c86ae0'];
    for (let i = 0; i < (o.coral ?? 9); i++) { const x = (r() - 0.5) * 22, z = -r() * 16 - 1; if (Math.abs(x) < (o.clear || 2.4) + 0.6) continue; const c = new THREE.Group(); c.position.set(x, 0, z); const col = coralC[i % 3];
      for (let k = 0; k < 5; k++) { const b = cyl(0.06, 0.09, 0.8 + r() * 0.6, col, (r() - 0.5) * 0.5, 0.45, (r() - 0.5) * 0.3, 8); b.rotation.z = (r() - 0.5) * 0.9; c.add(b); c.add(ball(0.13, col, b.position.x + Math.sin(-b.rotation.z) * 0.45, 0.9 + r() * 0.3, b.position.z, 10)); }
      outline(c, { px: 2 }); g.add(c); }
    outline(g, { px: 2.2 });
    parts.weeds = weeds;
  }
  // drifting specks (marine snow / bubbles)
  const pos = []; for (let i = 0; i < 260; i++) pos.push((r() - 0.5) * 24, r() * 12, -r() * 22 + 6);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const specks = new THREE.Points(geo, new THREE.PointsMaterial({ size: 4 * E.PX, sizeAttenuation: false, color: dark ? '#9ac8ff' : '#e8fbff', transparent: true, opacity: 0.6, fog: true })); specks.userData.noOutline = true; st.add(specks);
  const bubbles = []; const bm = toon('#e8fbff', { transparent: true, opacity: 0.5, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4, fresh: true });
  for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(sph, bm); const s = 0.04 + r() * 0.07; b.scale.setScalar(s); b.userData = { x: (r() - 0.5) * 10, z: -r() * 8 + 1, ph: r() * 10, sp: 0.6 + r() * 0.8, noOutline: true }; st.add(b); bubbles.push(b); }
  parts.update = (t) => { specks.position.y = -((t * 0.15) % 1) * 0.3; specks.position.x = Math.sin(t * 0.3) * 0.2;
    (parts.weeds || []).forEach(w => { let p = w.children[0], k = 0; while (p) { p.rotation.z = Math.sin(t * 1.3 + w.ph + k * 0.6) * 0.14; p.rotation.x = Math.sin(t * 0.9 + w.ph + k) * 0.08; p = p.children.find(c => c.isGroup); k++; } });
    bubbles.forEach(b => { const u = b.userData; const y = ((t * u.sp + u.ph) % 8); b.position.set(u.x + Math.sin(t * 2 + u.ph) * 0.12, y - 1, u.z); }); };
  return { stage: st, sea: parts };
}
// water ripple light on top of the frame (caustic shimmer) + god rays from the surface
export function waterLook(g, t, o = {}) {
  g.save(); g.globalCompositeOperation = 'screen';
  const n = 6; for (let i = 0; i < n; i++) { const x = E.W * (0.1 + i / n) + Math.sin(t * 0.5 + i) * 40, w = 90 + (i % 3) * 50; const gr = g.createLinearGradient(0, 0, 0, E.H * 0.9);
    gr.addColorStop(0, alpha(o.ray || '#d8fbff', (o.k ?? 0.16) * (0.6 + 0.4 * Math.sin(t * 0.8 + i * 1.7)))); gr.addColorStop(1, alpha(o.ray || '#d8fbff', 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * 0.3, 0); g.lineTo(x + w * 0.3, 0); g.lineTo(x + w * 1.6 + 120, E.H * 0.9); g.lineTo(x + w * 0.4 + 120, E.H * 0.9); g.closePath(); g.fill(); }
  g.restore();
  // surface shimmer band
  const gr = g.createLinearGradient(0, 0, 0, E.H * 0.12); gr.addColorStop(0, alpha('#ffffff', o.surf ?? 0.18)); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H * 0.12);
}

// the pinky: a giant toon finger lying on the sand, nail up front
export function pinky() { const g = new THREE.Group(); const skin = toon('#f2c09a');
  const f = M(new THREE.CapsuleGeometry(0.7, 5, 8, 20), skin); f.rotation.z = Math.PI / 2; f.position.y = 0.7; g.add(f);
  for (const x of [-0.6, -2.2]) { const cr = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.03, 6, 30, Math.PI), toon('#d8946a')); cr.rotation.y = Math.PI / 2; cr.position.set(x, 0.7, 0); cr.userData.noOutline = true; g.add(cr); }
  const nail = rbox(1.0, 0.12, 1.0, '#ffd8d0', 2.55, 1.36, 0, 0.06); nail.rotation.z = -0.12; nail.material = toon('#ffd8d0', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15, fresh: true }); g.add(nail);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16, 0, Math.PI), flat('#fff4ee')); moon.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); moon.position.set(2.12, 1.43, 0); moon.userData.noOutline = true; g.add(moon);
  outline(g, { px: 3 }); g.nail = nail; return g; }

// ---------- 2D overlays ----------
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || '#2a1c15', italic: o.italic }); g.restore(); }
export function hook(g, lines, y, age, o = {}) { lines.forEach((l, i) => { const k = ease.outBack(clamp((age + 0.3 - i * 0.12) / 0.3)); if (k <= 0) return; g.save(); g.translate(E.W / 2, y + i * (o.lh || 150)); g.scale(k, k); g.rotate((i % 2 ? 1.5 : -1.5) * Math.PI / 180);
  TXT(g, l, 0, 0, o.size || 132, { color: (o.accentIdx ?? lines.length - 1) === i ? (o.accent || '#ffd23a') : '#ffffff', stroke: '#2a1c15', maxW: E.W * 0.92 }); g.restore(); }); }
export function stamp(g, str, x, y, age, o = {}) { if (age < 0) return; const k = clamp(age / 0.18); const s = lerp(2.4, 1, ease.out(k)); g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  const size = o.size || 84; g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.86) + size * 0.7, h = size * 1.35; g.lineWidth = 12; g.strokeStyle = o.color || '#e8402a'; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); TXT(g, str, 0, 4, size, { color: o.color || '#e8402a', maxW: E.W * 0.84 }); g.restore(); }
// curved arrow on a circle (cx,cy,R) from angle a0 to a1
export function arcArrow(g, cx, cy, R, a0, a1, o = {}) { g.save(); g.lineCap = 'round'; g.strokeStyle = '#2a1c15'; g.lineWidth = (o.w || 22) + 12; g.beginPath(); g.arc(cx, cy, R, a0, a1); g.stroke(); g.strokeStyle = o.color || '#ffd23a'; g.lineWidth = o.w || 22; g.beginPath(); g.arc(cx, cy, R, a0, a1); g.stroke();
  const hx = cx + Math.cos(a1) * R, hy = cy + Math.sin(a1) * R, ang = a1 + Math.PI / 2; g.translate(hx, hy); g.rotate(ang); g.beginPath(); g.moveTo(26, 0); g.lineTo(-22, -34); g.lineTo(-22, 34); g.closePath(); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke(); g.restore(); }
// sparkles that fade after 1 s unless `until` is given
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));

// ---------- extra 2D helpers ----------
export const at2 = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
// two-tone line: [[text, colour], ...] centred at y (Nunito 900, ink outline)
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: INK }); x += ws[i] + sp; }); g.restore();
}
// the 2-line top caption of frame 1 (0 - 3.5 s): PUNCH gold, BOIL red
export function topCaption(g, t, o = {}) {
  const fade = o.until != null ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return; g.save(); g.globalAlpha = fade;
  const k = o.noPop ? 1 : ease.outBack(clamp((t + 0.25) / 0.3)), k2 = o.noPop ? 1 : ease.outBack(clamp((t + 0.07) / 0.3));
  g.save(); g.translate(540, 300); g.scale(k, k); g.translate(-540, -300); richLine(g, [['it regrows its', '#ffffff'], ['HEART', '#ffd23a']], 300, 78); g.restore();
  g.save(); g.translate(540, 410); g.scale(k2, k2); g.translate(-540, -410); richLine(g, [['and parts of its', '#ffffff'], ['BRAIN', '#ff4a5a']], 410, 78); g.restore();
  g.restore();
}
// ---------- freshwater canal stage (greenish water, muddy floor, reeds instead of coral) ----------
export function lakeStage(T, o = {}) { return seaStage(T, { fov: o.fov || 34, seed: o.seed || 5, clear: o.clear || 3, coral: 0, dark: !!o.dark, floor: o.floor,
  bg: o.dark ? ['#2a4a3a', '#16302a', '#08140f'] : ['#bfe8c8', '#5aaa8a', '#2a6a5a'], fog: o.dark ? [6, 30, '#10241c'] : [9, 40, '#4f9a80'], floorColor: o.dark ? '#3a3a2a' : '#b8a878' }); }

// ---------- the hero: a pink axolotl (faces +Z, ~1.6 long along -Z, ~0.7 tall) ----------
// .update(t, { lid, look:[x,y], mouth:'smile'|'o'|'frown', swim 0..1, legs:[FL,FR,BL,BR] 0..1 grow, tail 0..1 grow, pacifier, sway })
export const AXO = '#ffb3c6';
export function axolotl(o = {}) {
  const { seed = 1, scale = 1, color = AXO } = o; const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const skin = toon(color), belly = toon(shadeC(color, 0.35)), gillC = toon('#ff4f86', { emissive: new THREE.Color('#ff3a7a'), emissiveIntensity: 0.15, fresh: true });
  const body = new THREE.Group(); g.add(body);
  // head: wide, flat, round
  const head = new THREE.Group(); head.position.set(0, 0.42, 0.25); body.add(head);
  const hd = M(sph, skin); hd.scale.set(0.5, 0.34, 0.42); head.add(hd);
  const chin = M(sph, belly, 0, -0.1, 0.05); chin.scale.set(0.44, 0.2, 0.36); chin.userData.noOutline = true; head.add(chin);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.3, 0.12, 0.27), new THREE.Vector3(s * 0.55, 0.25, 0.8).normalize(), 0.085, { lid: shadeC(color, -0.08) }));
  const mouths = {}; { const mm = flat('#7a2a40'); const sm = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 6, 24, Math.PI), mm); sm.rotation.z = Math.PI; sm.position.set(0, 0.02, 0.41); sm.scale.y = 0.45; mouths.smile = sm;
    const om = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), mm); om.position.set(0, -0.02, 0.415); mouths.o = om; const fr = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 6, 20, Math.PI), mm); fr.position.set(0, -0.06, 0.4); fr.scale.y = 0.4; mouths.frown = fr;
    for (const k in mouths) { mouths[k].userData.noOutline = true; head.add(mouths[k]); } }
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#ff7aa0', { transparent: true, opacity: 0.55 })); ch.scale.set(0.07, 0.04, 0.02); ch.position.set(s * 0.34, 0.0, 0.33); ch.rotation.y = s * 0.6; ch.userData.noOutline = true; head.add(ch); }
  // the famous frilly external gills: 3 stalks per side, feathered
  const gills = []; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const gg = new THREE.Group(); gg.position.set(s * 0.38, 0.1 + (1 - i) * 0.1, -0.12); head.add(gg);
    gg.rotation.set(0, 0, s * (-0.5 + i * 0.5) - s * 0.9); const st = M(new THREE.CapsuleGeometry(0.035, 0.36, 4, 8).translate(0, 0.2, 0), gillC); gg.add(st);
    for (let k = 0; k < 5; k++) { const f = M(sph, gillC, 0, 0.08 + k * 0.07, 0); f.scale.set(0.075 - k * 0.008, 0.03, 0.03); f.userData.noOutline = true; gg.add(f); } gills.push({ gg, s, i, base: gg.rotation.z }); }
  // body + tail
  const tr = M(sph, skin, 0, 0.32, -0.45); tr.scale.set(0.34, 0.27, 0.62); body.add(tr);
  const bl = M(sph, belly, 0, 0.22, -0.45); bl.scale.set(0.3, 0.15, 0.56); bl.userData.noOutline = true; body.add(bl);
  const tail = new THREE.Group(); tail.position.set(0, 0.32, -0.95); body.add(tail); const tsegs = []; let par = tail;
  for (let i = 0; i < 4; i++) { const sg = new THREE.Group(); if (i) sg.position.z = -0.24; par.add(sg); const m = M(sph, skin, 0, 0, -0.12); m.scale.set(0.2 - i * 0.04, 0.2 - i * 0.03, 0.18); sg.add(m);
    const fin = M(sph, toon(shadeC(color, 0.2), { transparent: true, opacity: 0.85, fresh: true }), 0, 0, -0.12); fin.scale.set(0.02, 0.36 - i * 0.06, 0.2); fin.userData.noOutline = true; sg.add(fin); tsegs.push(sg); par = sg; }
  // dorsal fin ridge
  const ridge = M(sph, toon(shadeC(color, 0.2), { transparent: true, opacity: 0.85, fresh: true }), 0, 0.55, -0.6); ridge.scale.set(0.02, 0.1, 0.5); ridge.userData.noOutline = true; body.add(ridge);
  // legs with 4 little fingers each; .grow scales a leg (0 = gone, 1 = full)
  const legs = []; [[0.3, 0.22, -0.12], [-0.3, 0.22, -0.12], [0.28, 0.22, -0.8], [-0.28, 0.22, -0.8]].forEach(([x, y, z], i) => { const lg = new THREE.Group(); lg.position.set(x, y, z); body.add(lg); const inner = new THREE.Group(); lg.add(inner);
    const s = Math.sign(x); const up = M(new THREE.CapsuleGeometry(0.06, 0.18, 4, 8).translate(0, -0.12, 0), skin); up.rotation.z = s * 0.9; inner.add(up);
    const hand = new THREE.Group(); hand.position.set(s * 0.19, -0.16, 0.02); inner.add(hand); for (let k = 0; k < 4; k++) { const f = M(new THREE.CapsuleGeometry(0.022, 0.06, 3, 6).translate(0, -0.04, 0), skin); f.position.set((k - 1.5) * 0.035, 0, 0.02); f.rotation.set(0.6, 0, (k - 1.5) * 0.35); hand.add(f); }
    legs.push({ lg, inner, s, i }); });
  // pacifier (it never grows up)
  const pac = new THREE.Group(); pac.position.set(0, 0.0, 0.44); head.add(pac); pac.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 18).rotateX(Math.PI / 2), toon('#7ad0f0'))); { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16), toon('#ffd23a')); rg.position.set(0, -0.03, 0.04); pac.add(rg); } pac.visible = false;
  root.add(blob(0.8, 0.3)); root.children[root.children.length - 1].position.z = -0.4;
  outline(g, { px: 2.8 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.2; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => { const { lid = 0.2, look = [0, 0], mouth = 'smile', swim = 0.3, legs: lgs = [1, 1, 1, 1], tail: tg = 1, pacifier = false, sway = 1, blink = true } = u;
    body.position.y = Math.sin(t * 1.8 + seed) * 0.03 * sway; body.rotation.y = Math.sin(t * 1.1 + seed) * 0.05 * sway;
    tsegs.forEach((sg, i) => { sg.rotation.y = Math.sin(t * (3 + swim * 4) - i * 0.9) * (0.12 + swim * 0.25) * sway; }); tail.scale.setScalar(Math.max(0.001, tg));
    gills.forEach((G, i) => { G.gg.rotation.z = G.base + Math.sin(t * 2.6 + i * 0.8) * 0.12 * sway; G.gg.rotation.x = Math.sin(t * 2 + i) * 0.1 * sway; });
    legs.forEach((L, i) => { const k = clamp(lgs[i] ?? 1); L.inner.scale.setScalar(Math.max(0.001, ease.outBack(k))); L.inner.rotation.x = Math.sin(t * (2 + swim * 5) + i * 1.6) * (0.15 + swim * 0.35) * sway; });
    const b = blink ? blinkAt(t) : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    for (const k in mouths) mouths[k].visible = k === mouth; pac.visible = pacifier; };
  root.head = head; root.eyes = eyes; root.headR = 0.4; root.legs = legs; root.tailG = tail; root.chest = tr; root.update(0); return root;
}
// world point helper: an object's world position as [x,y,z] (+ offset)
const _v = new THREE.Vector3();
export const wp = (obj, dx = 0, dy = 0, dz = 0) => { obj.updateWorldMatrix(true, false); obj.getWorldPosition(_v); return [_v.x + dx, _v.y + dy, _v.z + dz]; };

// ---------- 2D "x-ray" icons (an organ glowing through the skin, filling up as it regrows) ----------
const HEARTP = new Path2D('M 0 34 C -60 -8 -46 -60 -18 -60 C -6 -60 0 -48 0 -40 C 0 -48 6 -60 18 -60 C 46 -60 60 -8 0 34 Z');
function fillUp(g, path, x, y, s, k, color, beat = 0) { g.save(); g.translate(x, y); g.scale(s * (1 + beat), s * (1 + beat));
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill(path); g.save(); g.clip(path); g.fillStyle = color; g.fillRect(-80, 40 - 110 * k, 160, 110 * k + 2); g.restore();
  g.setLineDash(k < 1 ? [8, 7] : []); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(path); g.restore(); }
export function xrayHeart(g, x, y, k, t, s = 1) { const beat = k >= 1 ? Math.max(0, Math.sin(t * 9)) * 0.08 : 0; fillUp(g, HEARTP, x, y, s, k, '#ff3a5a', beat); }
const BRAINP = (() => { const p = new Path2D(); p.moveTo(-60, 20); p.bezierCurveTo(-80, -10, -60, -50, -30, -48); p.bezierCurveTo(-20, -68, 20, -68, 30, -48); p.bezierCurveTo(60, -50, 80, -10, 60, 20); p.bezierCurveTo(50, 40, -50, 40, -60, 20); p.closePath(); return p; })();
export function xrayBrain(g, x, y, k, t, s = 1) { fillUp(g, BRAINP, x, y, s, k, '#ff8ab0'); if (k > 0.3) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = 'rgba(42,28,21,.55)'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -60); g.bezierCurveTo(-10, -30, 10, 0, 0, 30); g.moveTo(-40, -30); g.quadraticCurveTo(-25, -15, -42, 0); g.moveTo(40, -30); g.quadraticCurveTo(25, -15, 42, 0); g.stroke(); g.restore(); } }
// spinal cord: a dotted line that fills from head to tail across screen points a -> b
export function xraySpine(g, a, b, k) { g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 22; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  g.strokeStyle = '#ffe14a'; g.lineWidth = 14; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(lerp(a.x, b.x, k), lerp(a.y, b.y, k)); g.stroke();
  const n = 9; g.fillStyle = INK; for (let i = 0; i <= n; i++) { const u = i / n; if (u > k) break; g.beginPath(); g.arc(lerp(a.x, b.x, u), lerp(a.y, b.y, u), 7, 0, 7); g.fill(); } g.restore(); }
// dotted outline where a leg used to be (no injury shown: it just goes 'poof')
export function ghostLimb(g, x, y, r, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.setLineDash([10, 9]); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y, r * 0.6, r, 0.5, 0, 7); g.stroke(); g.restore(); }
// a calendar that flips months
export function calendar(g, x, y, n, age) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); g.save(); g.translate(x, y); g.scale(k, k); g.rotate(-0.05);
  g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-120, -110, 240, 230, 22); g.fill(); g.stroke();
  g.fillStyle = '#ff4a5a'; g.beginPath(); g.roundRect(-120, -110, 240, 70, [22, 22, 0, 0]); g.fill(); g.stroke(); const M_ = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
  TXT(g, M_[Math.min(5, n)], 0, -74, 46, { color: '#ffffff' }); TXT(g, 'MONTH', 0, 20, 34, { color: INK }); TXT(g, String(Math.min(6, n + 1)), 0, 74, 64, { color: INK }); g.restore(); }

// ---------- canal set (Xochimilco-ish: water channel between green banks with reeds), seen from above the water ----------
export function canal(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 36, shadowSize: 8, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3 });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 7);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(o.w ?? 3.2, 80), toon(o.dry ? '#8a7a5a' : '#3f8a7a', { transparent: true, opacity: 0.95, fresh: true })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.02, -30); water.userData.noOutline = true; g.add(water);
  for (const s of [-1, 1]) { const bank = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 80), toon('#6aaa4a')); bank.position.set(s * (15 + (o.w ?? 3.2) / 2), 0.2, -30); bank.receiveShadow = true; g.add(bank);
    for (let i = 0; i < 40; i++) { const z = -r() * 40 + 3, x = s * ((o.w ?? 3.2) / 2 + 0.2 + r() * 0.5); const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.8 + r() * 0.8, 5), toon('#4a8a3a')); reed.position.set(x, 0.6, z); reed.rotation.z = (r() - 0.5) * 0.3; g.add(reed); }
    for (let i = 0; i < 10; i++) { const z = -i * 4 - r() * 2, x = s * ((o.w ?? 3.2) / 2 + 2 + r() * 3); const tr = new THREE.Group(); tr.position.set(x, 0.45, z); tr.add(cyl(0.08, 0.12, 2.6, '#7a5a3a', 0, 1.3, 0, 8)); tr.add(ball(0.7, '#4f9a4a', 0, 2.9, 0, 14)); tr.add(ball(0.5, '#5aaa52', 0.3, 3.4, 0.1, 12)); g.add(tr); } }
  outline(g, { px: 2.2 }); return { stage: st, sky, water }; }
