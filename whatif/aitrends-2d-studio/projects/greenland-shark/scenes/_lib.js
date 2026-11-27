// Greenland shark Short: shared assets (underscore = not auto-loaded). All original designs in the Toon 3D bean style.
// shark() = the hero: a big, chunky, slow, grey-brown sleeper shark with a rounded snout, small lidded eyes, two small dorsal
// fins and a calm little smile. Plus the cold dark Arctic sea under the ice, a lab, a ruler, a timeline helper and 2D overlays.
// Tone: gentle and comic. Nothing is hurt or eaten on screen.
import { E, wordTime, rng, clamp, lerp, ease, prog, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, plane, floor, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);
export const shadeC = (hex, k) => { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); };
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };

function lidEye(parent, pos, n, size, o = {}) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.05, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#eef4f6', { emissive: new THREE.Color('#eef4f6'), emissiveIntensity: 0.35 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#141a22')); p.scale.set(0.5, 0.55, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const hl = new THREE.Mesh(sph, flat('#ffffff')); hl.scale.set(0.16, 0.16, 0.05); hl.position.set(-0.15, 0.2, 1.0); hl.userData.noOutline = true; pg.add(hl);
  const lp = new THREE.Group(); eg.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#5f5a56', { fresh: true })); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.1, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp };
}

// ---------------------------------------------------------------- THE HERO
// shark({ seed, scale, color, glasses, hat }) ~4.2 units long (snout at +Z ~ +2.1, tail tip ~ -2.3), body centre y 0.
// .update(t, { swim 0..1, lid, look:[x,y], mouthO, smile, turn, roll })
export const SHARK = '#7a736c';
const PROF = [[0.001, -2.0], [0.12, -1.85], [0.22, -1.5], [0.36, -0.9], [0.5, -0.2], [0.56, 0.4], [0.54, 0.95], [0.46, 1.45], [0.32, 1.85], [0.14, 2.08], [0.001, 2.12]];
export function shark(o = {}) {
  const { seed = 1, scale = 1, color = SHARK } = o;
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const skin = toon(color, { fresh: true }), belly = toon(shadeC(color, 0.32), { fresh: true }), dark = toon(shadeC(color, -0.18), { fresh: true });
  const front = new THREE.Group(); g.add(front);   // head + front body (stays put); the back half swings
  const bodyGeo = new THREE.LatheGeometry(PROF.filter(p => p[1] >= -0.3).map(([r, y]) => new THREE.Vector2(r, y)), 32); bodyGeo.rotateX(Math.PI / 2);
  const body = M(bodyGeo, skin); body.scale.set(1, 0.86, 1); front.add(body);
  const bel = M(sph, belly, 0, -0.2, 0.75); bel.scale.set(0.44, 0.3, 1.25); bel.userData.noOutline = true; front.add(bel);
  // back half: its own lathe, pivoting at z -0.25
  const back = new THREE.Group(); back.position.z = -0.25; g.add(back);
  const bGeo = new THREE.LatheGeometry(PROF.filter(p => p[1] <= -0.2).map(([r, y]) => new THREE.Vector2(r, y + 0.25)), 32); bGeo.rotateX(Math.PI / 2);
  const bb = M(bGeo, skin); bb.scale.set(1, 0.86, 1); back.add(bb);
  const tail = new THREE.Group(); tail.position.z = -1.7; back.add(tail);
  const lobe = (up) => { const m = M(new THREE.ConeGeometry(0.28, 0.95, 4), dark); m.scale.set(0.18, 1, 1); m.rotation.x = up ? -2.3 : -0.85; m.position.set(0, up ? 0.32 : -0.26, -0.28); return m; };
  tail.add(lobe(true), lobe(false));
  // fins: two small dorsals (set far back, like the real one), pectorals, small pelvics
  const d1 = M(new THREE.ConeGeometry(0.16, 0.34, 4), dark, 0, 0.5, -0.05); d1.scale.set(0.2, 1, 1.4); d1.rotation.x = -0.4; front.add(d1);
  const d2 = M(new THREE.ConeGeometry(0.13, 0.28, 4), dark, 0, 0.3, -1.0); d2.scale.set(0.2, 1, 1.4); d2.rotation.x = -0.4; back.add(d2);
  const pecs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.42, -0.22, 0.75); front.add(p); const m = M(sph, dark, s * 0.28, 0, 0); m.scale.set(0.34, 0.05, 0.2); m.rotation.y = -s * 0.5; p.add(m); return p; });
  for (const s of [-1, 1]) { const m = M(sph, dark, s * 0.22, -0.3, -0.75); m.scale.set(0.16, 0.04, 0.1); back.add(m); }
  // head: small lidded eyes, a calm smile, gill slits
  const head = new THREE.Group(); head.position.set(0, 0.1, 1.55); front.add(head);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.31, 0.06, 0.08), new THREE.Vector3(s * 0.85, 0.15, 0.5).normalize(), 0.105, { lid: shadeC(color, -0.05) }));
  const mouthM = flat('#3a2a2a'); const smile = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 20, Math.PI * 0.8), mouthM); smile.rotation.set(Math.PI / 2 + 0.25, 0, Math.PI * 1.1); smile.position.set(0, -0.3, 0.12); smile.userData.noOutline = true; head.add(smile);
  const mo = new THREE.Mesh(new THREE.CircleGeometry(0.12, 18), mouthM); mo.rotation.x = Math.PI / 2 + 0.4; mo.position.set(0, -0.32, 0.18); mo.userData.noOutline = true; mo.visible = false; head.add(mo);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.22), flat(shadeC(color, -0.35), { side: THREE.DoubleSide })); gl.position.set(s * 0.535, -0.02, 0.95 - i * 0.1); gl.rotation.y = Math.PI / 2; gl.userData.noOutline = true; front.add(gl); }
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#e88a9a', { transparent: true, opacity: 0.45 })); ch.scale.set(0.02, 0.05, 0.09); ch.position.set(s * 0.37, -0.12, 0.0); ch.userData.noOutline = true; head.add(ch); }
  // speckles on the back (the real one is mottled)
  const r = rng(seed); for (let i = 0; i < 26; i++) { const z = -1.5 + r() * 3.1, a = (r() - 0.5) * 2.2; const sp = new THREE.Mesh(sph, flat(shadeC(color, -0.12))); sp.scale.setScalar(0.025 + r() * 0.025); const rad = 0.5 * Math.cos(z * 0.6); sp.position.set(Math.sin(a) * rad, Math.cos(a) * rad * 0.86, z); sp.userData.noOutline = true; (z < -0.25 ? back : front).add(sp); if (z < -0.25) sp.position.z += 0.25; }
  if (o.glasses) { const gm = flat('#20161a'); const gg = new THREE.Group(); gg.position.set(0, 0.12, 0.42); head.add(gg); for (const s of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 6, 20), gm); ring.position.set(s * 0.14, 0, 0); ring.userData.noOutline = true; gg.add(ring); } const br = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 4), gm); br.rotation.z = Math.PI / 2; br.userData.noOutline = true; gg.add(br); root.glasses = gg; }
  outline(g, { px: 2.8 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.9; return tt < 0.16 ? Math.sin((tt / 0.16) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { swim = 1, lid = 0.4, look = [0, 0], mouthO = 0, smile: sm = 1, turn = 0, roll = 0, sleepy = 0 } = u;
    const w = t * 2.2 + seed;   // slow tail beat: it is the slowest shark around
    back.rotation.y = Math.sin(w) * 0.16 * swim; tail.rotation.y = Math.sin(w - 0.9) * 0.3 * swim; front.rotation.y = -Math.sin(w) * 0.04 * swim + turn;
    pecs.forEach((p, i) => { p.rotation.z = (i ? -1 : 1) * Math.sin(t * 1.3 + seed) * 0.12; });
    g.position.y = Math.sin(t * 0.9 + seed) * 0.05; g.rotation.z = roll + Math.sin(t * 0.7 + seed) * 0.02;
    smile.visible = mouthO < 0.5 && sm > 0.5; mo.visible = mouthO >= 0.5;
    const bl = blinkAt(t); eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid + sleepy * 0.4, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.5 * scale; root.update(0); return root;
}

// ---------------------------------------------------------------- THE SEA
// seaStage(T, { ice: true, deep: 0..1, floor }) — cold dark Arctic water: ice floes overhead (+ light shafts), specks, a rocky floor far below.
export function seaStage(T, o = {}) {
  const k = o.deep ?? 0.4; const top = ['#2a6a8e', '#123a5e', '#061a34'], bot = ['#0b2a44', '#051528', '#020a16'];
  const st = toonStage(T, { light: 'day', fov: o.fov || 40, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0],
    bg: k > 0.6 ? bot : top, fog: [o.fogNear ?? 7, o.fogFar ?? 30, k > 0.6 ? '#041428' : '#0c3050'],
    sky: '#9ad0f0', ground: '#1a2a4a', ambient: 1.25, key: ['#d8f0ff', 2.0, [-3, 12, 4]], fill: ['#6aa8ff', 0.5, [6, 2, 6]], ...o.stage });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 5); const parts = { group: g };
  if (o.ice !== false) { const iceM = toon('#e8f6ff', { emissive: new THREE.Color('#bfe6ff'), emissiveIntensity: 0.35 }); const y = o.iceY ?? 9;
    for (let i = 0; i < 16; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 0.6, 7), iceM); const s = 2 + r() * 3.5; f.scale.set(s, 1, s * (0.6 + r() * 0.5)); f.position.set((r() - 0.5) * 40, y + r() * 0.4, -r() * 40 + 8); f.rotation.y = r() * 3; f.userData.noOutline = true; g.add(f); } }
  if (o.floor !== false) { const fl = floor(200, 200, '#2a3a5a', 0, 0); fl.position.y = o.floorY ?? -4; fl.receiveShadow = true; g.add(fl);
    const rockM = [toon('#3a4a6a'), toon('#2e3c5a')]; for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockM[i % 2]); const s = 0.4 + r() * 1.2; m.position.set((r() - 0.5) * 34, (o.floorY ?? -4) + s * 0.3, -r() * 30 + 4); m.scale.set(s, s * 0.6, s * 0.8); m.rotation.y = r() * 3; g.add(m); } }
  const pos = []; for (let i = 0; i < 320; i++) pos.push((r() - 0.5) * 26, (r() - 0.5) * 14, -r() * 26 + 6);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const specks = new THREE.Points(geo, new THREE.PointsMaterial({ size: 4 * E.PX, sizeAttenuation: false, color: '#b8dcff', transparent: true, opacity: 0.55, fog: true })); specks.userData.noOutline = true; st.add(specks);
  const bubbles = []; const bm = toon('#e8fbff', { transparent: true, opacity: 0.5, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4, fresh: true });
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(sph, bm); b.scale.setScalar(0.04 + r() * 0.06); b.userData = { x: (r() - 0.5) * 10, z: -r() * 8 + 1, ph: r() * 10, sp: 0.4 + r() * 0.5, noOutline: true }; st.add(b); bubbles.push(b); }
  parts.update = (t) => { specks.position.y = -((t * 0.08) % 1) * 0.3; specks.position.x = Math.sin(t * 0.3) * 0.2;
    bubbles.forEach(b => { const u = b.userData; const y = ((t * u.sp + u.ph) % 8); b.position.set(u.x + Math.sin(t * 2 + u.ph) * 0.12, y - 3, u.z); }); };
  return { stage: st, sea: parts };
}
// cold light shafts from the ice above + a soft top glow
export function iceLook(g, t, o = {}) {
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 6; i++) { const x = E.W * (0.05 + i / 6) + Math.sin(t * 0.4 + i) * 40, w = 80 + (i % 3) * 50; const gr = g.createLinearGradient(0, 0, 0, E.H * 0.85);
    gr.addColorStop(0, alpha('#cfefff', (o.k ?? 0.14) * (0.6 + 0.4 * Math.sin(t * 0.7 + i * 1.7)))); gr.addColorStop(1, alpha('#cfefff', 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * 0.3, 0); g.lineTo(x + w * 0.3, 0); g.lineTo(x + w * 1.4 + 80, E.H * 0.85); g.lineTo(x + w * 0.3 + 80, E.H * 0.85); g.closePath(); g.fill(); }
  g.restore();
  const v = g.createRadialGradient(E.W / 2, E.H * 0.5, E.H * 0.25, E.W / 2, E.H * 0.5, E.H * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,8,20,${o.vig ?? 0.45})`); g.fillStyle = v; g.fillRect(0, 0, E.W, E.H);
}

// lab: cool room, back wall, a bench with a radiocarbon machine (dial + screen)
export function labStage(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 40, shadowSize: 6, target: [0, 1, 0], bg: '#e3ecef' });
  st.add(plane(30, 12, '#d6e4ea', 0, 6, -3.5)); const fl = floor(30, 20, '#9aa8b0', 0, 2); fl.receiveShadow = true; st.add(fl);
  const bench = new THREE.Group(); bench.add(rbox(5.2, 0.16, 1.6, '#f4f4f4', 0, 1.6, 0, 0.05), rbox(5.0, 1.5, 1.4, '#7f98a8', 0, 0.78, 0, 0.05)); outline(bench, { px: 2.2 }); st.add(bench);
  const mach = new THREE.Group(); mach.position.set(1.2, 1.68, -0.1); mach.add(rbox(1.6, 1.3, 0.9, '#cfd8de', 0, 0.65, 0, 0.08));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.6), flat('#0e2a3a')); scr.position.set(0, 0.85, 0.46); scr.userData.noOutline = true; mach.add(scr);
  const tex = canvasTex(256, 128, (c, W, H) => { c.fillStyle = '#0e2a3a'; c.fillRect(0, 0, W, H); c.strokeStyle = '#5affc0'; c.lineWidth = 6; c.beginPath(); for (let x = 0; x < W; x += 4) c.lineTo(x, H / 2 + Math.sin(x * 0.08) * 26 * Math.sin(x * 0.013)); c.stroke(); c.fillStyle = '#5affc0'; c.font = '900 34px Nunito'; c.fillText('¹⁴C', 12, 34); });
  scr.material = flat('#ffffff', { map: tex }); for (let i = 0; i < 3; i++) mach.add(cyl(0.07, 0.07, 0.06, ['#e8443a', '#f2c230', '#3ab0e8'][i], -0.4 + i * 0.4, 0.3, 0.46, 12).rotateX(Math.PI / 2));
  outline(mach, { px: 2.2 }); st.add(mach);
  return { stage: st, mach, screen: scr };
}
// a single glowing eye lens (a clear bead) for the lab shot
export function lensBead() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), toon('#d8f4ff', { transparent: true, opacity: 0.85, emissive: new THREE.Color('#9ae0ff'), emissiveIntensity: 0.6, fresh: true })); b.scale.y = 0.7; g.add(b);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), flat('#ffe08a')); core.userData.noOutline = true; g.add(core); outline(g, { px: 2 }); return g; }
// a long measuring tape on the sea floor (metres), for the 5 m shark
export function tape(len = 6) { const g = new THREE.Group(); const tex = canvasTex(1024, 64, (c, W, H) => { c.fillStyle = '#f2c230'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a1c15'; for (let i = 0; i <= len * 10; i++) { const x = i / (len * 10) * W; c.fillRect(x, 0, i % 10 ? 2 : 5, i % 10 ? 18 : 40); if (i % 10 === 0 && i) { c.font = '900 26px Nunito'; c.fillText(`${i / 10} m`, x - 34, 58); } } });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.3), toon('#ffffff', { map: tex, fresh: true })); m.rotation.x = -Math.PI / 2; m.userData.noOutline = true; g.add(m); return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { insT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: CARD_INK }); x += ws[i] + sp; }); g.restore();
}
export function topCaption(g, t, L1, L2, o = {}) {
  const fade = o.until != null ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return; const y1 = o.y ?? 290, sz = o.size || 74;
  [[L1, y1, 0.0], [L2, y1 + sz * 1.45, 0.1]].forEach(([parts, y, d]) => { const k = o.noPop ? 1 : ease.outBack(clamp((t + 0.3 - d) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y); g.scale(k, k); g.translate(-E.W / 2, -y); richLine(g, parts, y, sz); g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.1); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.96) * fade;
  g.font = `900 ${s}px "Nunito", sans-serif`; const w = Math.min(E.W * 0.94, g.measureText(text).width + s * 0.9);
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: o.ink || col, stroke: o.stroke ?? null, maxW: E.W * 0.9 }); g.restore();
}
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const fade = o.until != null ? clamp((o.until - age) / 0.2) : 1; if (fade <= 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 60; g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px "Nunito", sans-serif`; const w = g.measureText(str).width + size * 0.9, h = size * 1.4; g.fillStyle = o.bg || '#f2f8fb'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill(); g.stroke();
  insT(g, str, 0, 2, size, { color: o.color || CARD_INK }); g.restore(); }
// big cartoon eye with a zoom ring on the lens (s06)
export function eyeZoom(g, t, o = {}) { const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(540, 900); g.scale(k, k);
  g.fillStyle = '#5f5a56'; g.beginPath(); g.ellipse(0, 0, 420, 300, 0, 0, 7); g.fill(); g.lineWidth = 14; g.strokeStyle = CARD_INK; g.stroke();
  g.fillStyle = '#eef4f6'; g.beginPath(); g.ellipse(0, 0, 300, 220, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#18222c'; g.beginPath(); g.arc(0, 0, 150, 0, 7); g.fill();
  const p = clamp((t - 0.6) / 0.5); g.globalAlpha = 0.6 + 0.4 * p; const gr = g.createRadialGradient(0, 0, 10, 0, 0, 110); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(0.5, '#9ae0ff'); gr.addColorStop(1, 'rgba(154,224,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.fill(); g.globalAlpha = 1;
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-60, -60, 30, 0, 7); g.fill();
  if (p > 0) { g.setLineDash([24, 16]); g.lineDashOffset = -t * 60; g.lineWidth = 10; g.strokeStyle = '#ffd25a'; g.beginPath(); g.arc(0, 0, 135 + 20 * (1 - p), 0, 7); g.stroke(); g.setLineDash([]);
    insT(g, 'THE LENS', 0, -330, 70, { color: '#ffd25a', stroke: CARD_INK, a: p }); }
  g.restore(); }

export { THREE, toon, flat, outline, rbox, box, cyl, ball, plane, floor, blob, canvasTex, toonStage, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK };
