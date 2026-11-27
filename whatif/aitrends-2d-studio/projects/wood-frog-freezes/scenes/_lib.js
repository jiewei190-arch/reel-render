// Wood frog Short: shared assets (underscore = not auto-loaded). Base copied from the octopus-nine-brains Short (itself built on the
// immortal-jellyfish lib): eyes, chips/stamp/hook, reactions, heart mesh. The wood frog, the winter/spring forest sets and the 2D cards are new (end of file).
// jelly() = the hero: a tiny glowing bell jellyfish with big lidded eyes, a red-orange gut and wavy tentacles (Turritopsis-ish),
// that can melt into a blob. polyp() = the "baby" stage on a stalk. Plus sea sets, fish, turtle, butterfly, caterpillar, props.
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

// ---------- the hero: jelly ----------
// jelly({ seed, scale, color, halo }) ~1.9 units tall (bell top 1.9, tentacle tips ~0), faces +Z.
// .update(t, { lid, lidL, lidR, look:[x,y], blink, pulse (0..1 swim), melt (0 jelly .. 1 round blob), shrug (tentacles up), smile, mouth:'smile'|'o'|'frown', glow, halo })
export const JC = '#f6a9c8';
const DOME = [[0.001, 1.0], [0.3, 0.97], [0.55, 0.86], [0.74, 0.66], [0.84, 0.42], [0.86, 0.22], [0.8, 0.08], [0.66, 0.02], [0.5, 0.06]];
export function jelly(o = {}) {
  const { seed = 1, scale = 1, color = JC } = o; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const body = new THREE.Group(); body.position.y = 1.0; g.add(body);            // bell centre ~ y 1.0 .. 1.95
  const bellG = new THREE.Group(); body.add(bellG);
  const bellMat = toon(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.28, transparent: true, opacity: 0.8, fresh: true });
  const bell = new THREE.Mesh(new THREE.LatheGeometry(DOME.slice().reverse().map(([a, y]) => new THREE.Vector2(a, y * 0.95)), 40), bellMat); bell.castShadow = true; bellG.add(bell);
  const inner = new THREE.Mesh(new THREE.LatheGeometry(DOME.slice().reverse().map(([a, y]) => new THREE.Vector2(a * 0.86, y * 0.82)), 32), toon(shadeC(color, 0.35), { transparent: true, opacity: 0.45, fresh: true, side: THREE.BackSide })); inner.userData.noOutline = true; bellG.add(inner);
  // rim (velum) and gut (the bright red-orange stomach you can see through the bell)
  const rimM = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 8, 40), toon(shadeC(color, -0.12), { fresh: true })); rimM.rotation.x = Math.PI / 2; rimM.position.y = 0.04; rimM.userData.noOutline = true; bellG.add(rimM);
  const gutM = toon('#ff5a3a', { emissive: new THREE.Color('#ff4a2a'), emissiveIntensity: 0.55, fresh: true });
  const gut = new THREE.Group(); gut.position.y = 0.3; bellG.add(gut);
  { const c = M(sph, gutM, 0, 0.12, 0); c.scale.set(0.26, 0.24, 0.26); c.userData.noOutline = true; gut.add(c);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const lobe = M(sph, gutM, Math.cos(a) * 0.22, 0.05, Math.sin(a) * 0.22); lobe.scale.set(0.12, 0.09, 0.12); lobe.userData.noOutline = true; gut.add(lobe); }
    const man = M(new THREE.CylinderGeometry(0.1, 0.06, 0.4, 12), gutM, 0, -0.18, 0); man.userData.noOutline = true; gut.add(man); }
  // face on the front of the bell
  const face = new THREE.Group(); face.position.set(0, 0.5, 0); bellG.add(face);
  const eyes = [-1, 1].map(s => lidEye(face, new THREE.Vector3(s * 0.25, 0.08, 0.66), new THREE.Vector3(s * 0.38, 0.12, 0.92).normalize(), 0.16, { lid: shadeC(color, -0.06) }));
  const mouths = {};
  { const mm = flat('#5a1a30');
    const sm = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 8, 20, Math.PI), mm); sm.rotation.z = Math.PI; sm.position.set(0, -0.14, 0.78); mouths.smile = sm;
    const om = new THREE.Mesh(new THREE.CircleGeometry(0.06, 18), mm); om.position.set(0, -0.16, 0.79); om.scale.y = 1.3; mouths.o = om;
    const fr = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.022, 8, 20, Math.PI), mm); fr.position.set(0, -0.2, 0.77); mouths.frown = fr;
    for (const k in mouths) { mouths[k].userData.noOutline = true; mouths[k].rotation.x = -0.25; face.add(mouths[k]); } }
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#ff6f9a', { transparent: true, opacity: 0.6 })); ch.scale.set(0.09, 0.05, 0.02); ch.position.set(s * 0.43, -0.1, 0.66); ch.rotation.y = s * 0.55; ch.userData.noOutline = true; face.add(ch); }
  // tentacles: chains of segments hanging from the rim
  const tM = toon(shadeC(color, -0.05), { emissive: new THREE.Color(color), emissiveIntensity: 0.2, fresh: true });
  const tents = []; const NT = o.tentacles || 14, NS = 6, SL = 0.17;
  const segGeo = new THREE.CapsuleGeometry(0.03, SL, 4, 8).translate(0, -SL / 2, 0);
  for (let i = 0; i < NT; i++) {
    const a = (i / NT) * Math.PI * 2 + r() * 0.1; const base = new THREE.Group(); base.position.set(Math.cos(a) * 0.64, 0.05, Math.sin(a) * 0.64); bellG.add(base);
    const segs = []; let parent = base; for (let k = 0; k < NS; k++) { const sg = new THREE.Group(); if (k) sg.position.y = -SL - 0.02; parent.add(sg); const m = new THREE.Mesh(segGeo, tM); m.userData.noOutline = true; m.scale.setScalar(1 - k * 0.09); sg.add(m); segs.push(sg); parent = sg; }
    tents.push({ base, segs, a, ph: r() * 6 });
  }
  // oral arms (the frilly middle bit) — 4 short wavy ribbons
  const arms = []; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const base = new THREE.Group(); base.position.set(Math.cos(a) * 0.12, 0.1, Math.sin(a) * 0.12); bellG.add(base); const segs = []; let p = base;
    for (let k = 0; k < 4; k++) { const sg = new THREE.Group(); if (k) sg.position.y = -0.17; p.add(sg); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.06 - k * 0.01, 0.12, 4, 8).translate(0, -0.08, 0), gutM); m.userData.noOutline = true; sg.add(m); segs.push(sg); p = sg; } arms.push({ base, segs, a }); }
  // halo
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.055, 10, 40), toon('#ffd84a', { emissive: new THREE.Color('#ffcc33'), emissiveIntensity: 0.9, fresh: true }));
  halo.rotation.x = Math.PI / 2 - 0.15; halo.position.y = 1.22; halo.visible = !!o.halo; body.add(halo);
  // soft glow sprite behind
  const glowTex = canvasTex(128, 128, (c, W, H) => { const gr = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(o.glowColor || '#ff9ed0'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  glow.scale.set(4.2, 4.2, 1); glow.position.y = 0.45; glow.renderOrder = -1; body.add(glow);
  outline(bellG, { px: 3 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.4; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { lid = 0.2, lidL, lidR, look = [0, 0], blink = true, pulse = 1, melt = 0, shrug = 0, mouth = 'smile', glow: gl = 0, halo: hv, sway = 1, ph = seed, bob = 0 } = u;
    // swim pulse: bell contracts (narrow + taller) then relaxes; body rises on each contraction
    const cyc = (t * 1.25 + ph * 0.13) % 1; const c = pulse * (cyc < 0.3 ? Math.sin((cyc / 0.3) * Math.PI / 2) : Math.cos(((cyc - 0.3) / 0.7) * Math.PI / 2));
    const m = ease.inOut(clamp(melt));
    const sx = lerp(1 - c * 0.12, 0.62, m), sy = lerp(1 + c * 0.1, 0.62, m);
    bellG.scale.set(sx, sy, sx); bellG.position.y = lerp(0, 0.25, m);
    body.position.y = 1.0 + bob + pulse * Math.sin((t * 1.25 + ph * 0.13) * Math.PI * 2 - 1) * 0.06 * sway;
    body.rotation.z = Math.sin(t * 0.9 + ph) * 0.05 * sway; body.rotation.x = Math.sin(t * 0.7 + ph) * 0.03 * sway;
    tents.forEach((T, i) => { const out = lerp(0.12 + c * 0.25, -1.2, shrug); const k = 1 - m;
      T.base.rotation.set(Math.sin(T.a) * out, 0, -Math.cos(T.a) * out); T.base.scale.setScalar(Math.max(0.001, k));
      T.segs.forEach((sg, j) => { if (!j) return; const w = Math.sin(t * 2.4 - j * 0.9 + T.ph) * 0.22 * sway; sg.rotation.set(w * Math.sin(T.a + 1), 0, w * Math.cos(T.a + 1) + shrug * 0.15); }); });
    arms.forEach((A, i) => { A.base.scale.setScalar(Math.max(0.001, 1 - m)); A.segs.forEach((sg, j) => { sg.rotation.z = Math.sin(t * 2 + j + i) * 0.25 * sway; }); });
    const bl = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { const l = i === 0 ? (lidR ?? lid) : (lidL ?? lid); e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(l, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    for (const k in mouths) mouths[k].visible = k === mouth;
    glow.material.opacity = gl; if (hv != null) halo.visible = hv > 0, halo.scale.setScalar(Math.max(0.001, hv));
    halo.position.y = 1.22 + Math.sin(t * 2.2) * 0.04; halo.rotation.z = t * 0.6;
  };
  root.head = face; root.eyes = eyes; root.headR = 0.75; root.halo = halo; root.bellG = bellG; root.body = body;
  root.update(0); return root;
}

// ---------- the "baby": polyp on a stalk with a ring of tiny tentacles ----------
// polyp({ seed, scale }) .update(t, { grow 0..1, lid, look, bud (0..1 bulge on the side) })
export function polyp(o = {}) {
  const { seed = 2, scale = 1, color = '#f2b6c6' } = o; const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const mat = toon(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.15, fresh: true });
  const foot = M(sph, toon('#d88aa0'), 0, 0.04, 0); foot.scale.set(0.38, 0.08, 0.38); g.add(foot);
  const stalk = new THREE.Group(); g.add(stalk);
  const st = M(new THREE.CylinderGeometry(0.09, 0.13, 1.0, 14).translate(0, 0.5, 0), mat); stalk.add(st);
  const head = new THREE.Group(); head.position.y = 1.0; stalk.add(head);
  const hy = M(sph, mat, 0, 0.32, 0); hy.scale.set(0.34, 0.42, 0.34); head.add(hy);
  const crown = new THREE.Group(); crown.position.y = 0.66; head.add(crown); const tM = toon(shadeC(color, 0.1), { fresh: true }); const crownT = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const tg = new THREE.Group(); tg.position.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2); tg.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.3, 4, 8).translate(0, 0.17, 0), tM); tg.add(m); crown.add(tg); crownT.push({ tg, a }); }
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.13, 0.38, 0.28), new THREE.Vector3(s * 0.4, 0.1, 0.9).normalize(), 0.11, { lid: shadeC(color, -0.06) }));
  const mo = new THREE.Mesh(new THREE.CircleGeometry(0.035, 14), flat('#5a1a30')); mo.position.set(0, 0.2, 0.335); mo.userData.noOutline = true; head.add(mo);
  // pacifier (it IS the baby)
  const pac = new THREE.Group(); pac.position.set(0, 0.19, 0.35); head.add(pac); pac.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 18).rotateX(Math.PI / 2), toon('#7ad0f0')));
  { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16), toon('#ffd23a')); rg.position.set(0, -0.02, 0.05); pac.add(rg); }
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#ff6f9a', { transparent: true, opacity: 0.6 })); ch.scale.set(0.06, 0.035, 0.02); ch.position.set(s * 0.22, 0.27, 0.27); ch.rotation.y = s * 0.6; ch.userData.noOutline = true; head.add(ch); }
  const budG = new THREE.Group(); budG.position.set(0.12, 0.6, 0.02); stalk.add(budG); const bud = M(sph, mat); budG.add(bud);
  root.add(blob(0.5, 0.25));
  outline(g, { px: 2.6 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.1; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => { const { grow = 1, lid = 0.15, look = [0, 0], bud: b = 0, pacifier = true } = u; const k = Math.max(0.001, grow);
    stalk.scale.set(lerp(1.6, 1, k), k, lerp(1.6, 1, k)); head.scale.setScalar(lerp(0.6, 1, k) / Math.max(0.3, k) * Math.max(0.3, k)); stalk.rotation.z = Math.sin(t * 1.3 + seed) * 0.06;
    crownT.forEach((c, i) => { c.tg.scale.setScalar(Math.max(0.001, prog(k, 0.4, 1))); c.tg.rotation.set(Math.sin(c.a) * (0.9 + Math.sin(t * 3 + i) * 0.15), 0, -Math.cos(c.a) * (0.9 + Math.sin(t * 3 + i) * 0.15)); });
    bud.scale.setScalar(Math.max(0.001, b * 0.16)); budG.position.x = 0.1 + b * 0.08;
    pac.visible = pacifier; const bl = blinkAt(t); eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); }); };
  root.head = head; root.eyes = eyes; root.headR = 0.45; root.update(0); return root;
}

// ---------- the sea ----------
// seaStage(T, { dark, fov, floor, seed, rays }) — sunlit shallow water (or dark water for the hook), sandy floor, seaweed, rocks, drifting specks
export function seaStage(T, o = {}) {
  const dark = !!o.dark;
  const st = toonStage(T, { light: 'day', fov: o.fov || 36, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0],
    bg: dark ? ['#0d3f78', '#072650', '#030c24'] : ['#7fd8f0', '#2a9ccc', '#0d5a92'],
    fog: dark ? [8, 34, '#062048'] : [10, 46, '#2f8fc0'],
    sky: dark ? '#7aa8ff' : '#d8f4ff', ground: dark ? '#1a2a5a' : '#3a7a9a', ambient: dark ? 0.9 : 1.25,
    key: dark ? ['#bfe0ff', 1.6, [-4, 10, 6]] : ['#fff6dc', 2.6, [-5, 12, 5]], fill: dark ? ['#ff8ad0', 0.5, [6, 2, 6]] : ['#9ad8ff', 0.6, [8, 4, 6]], ...o.stage });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 5);
  const parts = { group: g };
  if (o.floor !== false) {
    const fl = floor(200, 200, dark ? '#2a3f6a' : '#e6d29a', 0, 0); fl.receiveShadow = true; g.add(fl);
    const rockM = [toon(dark ? '#3a4a7a' : '#8a8f9a'), toon(dark ? '#2e3c66' : '#a0a4ae')];
    for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 30, z = -r() * 28 + 4; if (Math.abs(x) < (o.clear || 2.4) && z > -3) continue; const s = 0.3 + r() * 0.9; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockM[i % 2]); m.position.set(x, s * 0.3, z); m.scale.set(s, s * 0.6, s * 0.8); m.rotation.y = r() * 3; m.castShadow = true; g.add(m); }
    const weedC = dark ? ['#2a7a6a', '#3a8a5a'] : ['#3fae5a', '#5ac46a', '#2f9a4a'];
    const weeds = [];
    for (let i = 0; i < (o.weeds ?? 22); i++) { const x = (r() - 0.5) * 26, z = -r() * 22 + 3; if (Math.abs(x) < (o.clear || 2.4) && z > -3) continue; const w = new THREE.Group(); w.position.set(x, 0, z); const n = 4 + Math.floor(r() * 4); const mat = toon(weedC[i % weedC.length]); let p = w;
      for (let k = 0; k < n; k++) { const sg = new THREE.Group(); if (k) sg.position.y = 0.42; p.add(sg); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.36, 4, 8).translate(0, 0.21, 0), mat); m.castShadow = true; sg.add(m); p = sg; }
      w.ph = r() * 6; g.add(w); weeds.push(w); }
    // coral fans
    const coralC = ['#ff7a6a', '#ffb04a', '#c86ae0'];
    for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * 22, z = -r() * 16 - 1; if (Math.abs(x) < (o.clear || 2.4) + 0.6) continue; const c = new THREE.Group(); c.position.set(x, 0, z); const col = coralC[i % 3];
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
// sunny meadow (butterfly shot) — the kit's sunny preset
export function meadow(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 36, shadowSize: 6, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 9, seed: o.seed || 3 });
  const g = new THREE.Group(); st.add(g); const fl = floor(300, 300, '#8acb5a', 0, 0); fl.receiveShadow = true; g.add(fl); const r = rng(9);
  const gm = [toon('#6ab04a'), toon('#7cc05a'), toon('#5a9e3e')]; for (let i = 0; i < 140; i++) { const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 5), gm[i % 3]); tuft.position.set((r() - 0.5) * 30, 0.2, -r() * 30 + 5); if (Math.abs(tuft.position.x) < 1.5 && tuft.position.z > -1.5) continue; tuft.scale.y = 0.6 + r(); tuft.userData.noOutline = true; g.add(tuft); }
  const fc = ['#ff6a8a', '#ffd23a', '#ffffff', '#b07aff']; for (let i = 0; i < 26; i++) { const f = new THREE.Group(); const x = (r() - 0.5) * 18, z = -r() * 14 + 1; if (Math.abs(x) < 1.6 && z > -1.5) continue; f.position.set(x, 0, z); f.add(cyl(0.025, 0.025, 0.6, '#4a8a3a', 0, 0.3, 0, 6)); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; f.add(ball(0.09, fc[i % 4], Math.cos(a) * 0.1, 0.62, Math.sin(a) * 0.1, 8)); } f.add(ball(0.07, '#ffb020', 0, 0.64, 0.02, 8)); g.add(f); }
  outline(g, { px: 2 }); return { stage: st, sky }; }

// ---------- other critters ----------
const partyTex = () => canvasTex(128, 128, (c, W, H) => { const cs = ['#ff5a7a', '#ffd23a', '#4ac0ff']; for (let i = 0; i < 8; i++) { c.fillStyle = cs[i % 3]; c.fillRect(0, (i * H) / 8, W, H / 8 + 1); } c.fillStyle = '#ffffff'; for (let i = 0; i < 18; i++) { c.beginPath(); c.arc((i * 37) % W, (i * 53) % H, 5, 0, 7); c.fill(); } });
let _pt = null;
export function partyHat(s = 1) { _pt ||= partyTex(); const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.2 * s, 0.5 * s, 20), toon('#ffffff', { map: _pt, fresh: true })); c.position.y = 0.25 * s; g.add(c); g.add(ball(0.07 * s, '#ffd23a', 0, 0.52 * s, 0, 10)); outline(g, { px: 2.2 }); return g; }
export function butterfly(o = {}) { const g = new THREE.Group(); const bodyM = toon('#3a2a3a');
  g.add(M(new THREE.CapsuleGeometry(0.07, 0.6, 6, 10), bodyM)); const head = new THREE.Group(); head.position.y = 0.42; g.add(head); head.add(M(sph, bodyM)); head.children[0].scale.setScalar(0.15);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.07, 0.03, 0.11), new THREE.Vector3(s * 0.4, 0.1, 0.9).normalize(), 0.065, { lid: '#3a2a3a' }));
  for (const s of [-1, 1]) { const an = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 5), bodyM); an.position.set(s * 0.06, 0.18, 0); an.rotation.z = -s * 0.4; head.add(an); head.add(ball(0.03, '#3a2a3a', s * 0.12, 0.32, 0, 8)); }
  const wingTex = canvasTex(128, 128, (c, W, H) => { c.fillStyle = o.color || '#ff9a2a'; c.beginPath(); c.ellipse(W / 2, H / 2, W / 2 - 4, H / 2 - 4, 0, 0, 7); c.fill(); c.strokeStyle = '#2a1c15'; c.lineWidth = 9; c.stroke(); c.fillStyle = '#2a1c15'; c.beginPath(); c.arc(W * 0.62, H * 0.42, 14, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(W * 0.66, H * 0.38, 5, 0, 7); c.fill(); c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(W * 0.35, H * 0.65, 11, 0, 7); c.fill(); });
  const wings = []; for (const s of [-1, 1]) { const w = new THREE.Group(); g.add(w); w.s = s; const up = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshToonMaterial({ map: wingTex, transparent: true, side: THREE.DoubleSide, alphaTest: 0.3 })); up.position.set(s * 0.38, 0.18, 0); up.scale.x = s; up.userData.noOutline = true; w.add(up);
    const lo = up.clone(); lo.scale.set(s * 0.7, 0.7, 1); lo.position.set(s * 0.28, -0.25, 0); w.add(lo); wings.push(w); }
  outline(g, { px: 2.2 }); const hat = partyHat(0.7); hat.position.y = 0.12; head.add(hat);
  g.update = (t, u = {}) => { const f = Math.sin(t * (u.flap ?? 9)) * 0.7 + 0.3; wings.forEach(w => { w.rotation.y = -w.s * f; }); eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, u.lid ?? 0.2); }); };
  g.head = head; g.eyes = eyes; g.headR = 0.2; return g; }
export function caterpillar(o = {}) { const g = new THREE.Group(); const segs = []; const cs = ['#7ad04a', '#5ab83a'];
  for (let i = 0; i < 6; i++) { const b = ball(0.26 - i * 0.012, cs[i % 2], 0, 0.26, -i * 0.36, 18); g.add(b); segs.push(b); }
  const head = new THREE.Group(); head.position.set(0, 0.48, 0.18); g.add(head); const hm = ball(0.32, '#8ae05a', 0, 0, 0, 22); head.add(hm);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.12, 0.08, 0.27), new THREE.Vector3(s * 0.35, 0.1, 0.93).normalize(), 0.1, { lid: '#6ac04a' }));
  const mo = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 18, Math.PI), flat('#2a3a1a')); mo.rotation.z = Math.PI; mo.position.set(0, -0.08, 0.31); mo.userData.noOutline = true; head.add(mo);
  outline(g, { px: 2.4 }); const hat = partyHat(1); hat.position.y = 0.26; head.add(hat);
  g.update = (t, u = {}) => { segs.forEach((b, i) => { b.position.y = 0.26 + Math.max(0, Math.sin(t * 5 - i * 0.8)) * 0.12; }); head.position.y = 0.48 + Math.sin(t * 5 + 0.8) * 0.04; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, u.lid ?? 0.2); }); };
  g.head = head; g.eyes = eyes; g.headR = 0.32; return g; }
export function fish(o = {}) { const { color = '#ffa23a', seed = 1 } = o; const g = new THREE.Group(); const b = M(sph, toon(color, { fresh: true })); b.scale.set(0.42, 0.36, 0.7); g.add(b);
  const belly = M(sph, toon(shadeC(color, 0.4), { fresh: true }), 0, -0.1, 0.05); belly.scale.set(0.34, 0.24, 0.6); belly.userData.noOutline = true; g.add(belly);
  const tail = new THREE.Group(); tail.position.z = -0.65; g.add(tail); const tm = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 4), toon(shadeC(color, -0.15), { fresh: true })); tm.rotation.x = -Math.PI / 2; tm.scale.x = 0.25; tm.position.z = -0.15; tail.add(tm);
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), toon(shadeC(color, -0.15), { fresh: true })); fin.position.set(0, 0.38, -0.05); fin.scale.z = 0.3; g.add(fin);
  const head = new THREE.Group(); head.position.set(0, 0.04, 0.4); g.add(head);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.25, 0.06, 0.02), new THREE.Vector3(s, 0.1, 0.5).normalize(), 0.12, { lid: shadeC(color, -0.1) }));
  const bib = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18, 0, Math.PI), toon('#ffffff', { side: THREE.DoubleSide })); bib.position.set(0, -0.12, 0.42); bib.rotation.set(0.5, 0, Math.PI); bib.visible = !!o.bib; g.add(bib);
  outline(g, { px: 2.4 }); g.update = (t, u = {}) => { tail.rotation.y = Math.sin(t * 7 + seed) * 0.35; g.children[0].rotation.y = Math.sin(t * 7 + seed) * 0.05; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, u.lid ?? 0.25); e.pg.rotation.set(-(u.look?.[1] ?? 0) * 0.4, (u.look?.[0] ?? 0) * 0.5, 0); }); };
  g.head = head; g.eyes = eyes; g.headR = 0.4; g.update(0); return g; }
export function turtle(o = {}) { const g = new THREE.Group(); const shell = M(new THREE.SphereGeometry(0.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#5a8a3a')); shell.scale.set(1, 0.6, 1.15); g.add(shell);
  const tex = canvasTex(128, 128, (c, W, H) => { c.fillStyle = '#6a9a44'; c.fillRect(0, 0, W, H); c.strokeStyle = '#3a5a22'; c.lineWidth = 5; for (let i = 0; i < 6; i++) { c.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 6 * Math.PI * 2; c.lineTo(W / 2 + Math.cos(a) * (14 + i * 18), H / 2 + Math.sin(a) * (14 + i * 18)); } c.stroke(); } });
  shell.material = toon('#ffffff', { map: tex, fresh: true });
  const plate = M(new THREE.CylinderGeometry(0.82, 0.82, 0.12, 24), toon('#e8d48a')); plate.scale.z = 1.15; g.add(plate);
  const head = new THREE.Group(); head.position.set(0, 0.15, 1.05); g.add(head); head.add(M(sph, toon('#9ac86a'))); head.children[0].scale.set(0.3, 0.27, 0.32);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.13, 0.08, 0.22), new THREE.Vector3(s * 0.4, 0.1, 0.9).normalize(), 0.1, { lid: '#7ab04a' }));
  const fl = []; for (const [x, z] of [[-0.8, 0.5], [0.8, 0.5], [-0.6, -0.6], [0.6, -0.6]]) { const f = M(sph, toon('#9ac86a'), x, 0, z); f.scale.set(0.45, 0.08, 0.2); f.rotation.y = x < 0 ? 0.4 : -0.4; g.add(f); fl.push(f); }
  const bib = new THREE.Mesh(new THREE.CircleGeometry(0.22, 18, 0, Math.PI), toon('#ffffff', { side: THREE.DoubleSide })); bib.position.set(0, -0.05, 0.3); bib.rotation.set(0.4, 0, Math.PI); bib.visible = !!o.bib; head.add(bib);
  outline(g, { px: 2.4 }); g.update = (t, u = {}) => { fl.forEach((f, i) => { f.rotation.z = Math.sin(t * 3 + i) * 0.3; }); eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, u.lid ?? 0.3); e.pg.rotation.set(-(u.look?.[1] ?? 0) * 0.4, (u.look?.[0] ?? 0) * 0.5, 0); }); };
  g.head = head; g.eyes = eyes; g.headR = 0.32; g.update(0); return g; }

// ---------- props ----------
const labelTex = (lines, o = {}) => canvasTex(o.w || 512, o.h || 200, (c, W, H) => { c.fillStyle = o.bg || '#2a1c15'; c.fillRect(0, 0, W, H); if (o.border !== false) { c.strokeStyle = o.border || '#e8c050'; c.lineWidth = 10; c.strokeRect(10, 10, W - 20, H - 20); }
  c.fillStyle = o.ink || '#ffd860'; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((l, i) => { c.font = `900 ${(o.sizes || [])[i] || o.size || 80}px Nunito`; c.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * (o.lh || 86)); }); });
export function resetButton() { const g = new THREE.Group(); g.add(rbox(1.5, 0.34, 1.5, '#5a6470', 0, 0.17, 0, 0.1)); g.add(cyl(0.62, 0.66, 0.12, '#3a424c', 0, 0.38, 0, 32));
  const cap = new THREE.Group(); cap.position.y = 0.44; g.add(cap); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ff3a2a', { emissive: new THREE.Color('#ff2a1a'), emissiveIntensity: 0.3, fresh: true })); dome.scale.y = 0.55; cap.add(dome);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: labelTex(['RESET'], { w: 400, h: 100, size: 72, border: false, bg: '#f2f0e8', ink: '#c0261a' }) })); pl.position.set(0, 0.18, 0.755); pl.userData.noOutline = true; g.add(pl);
  outline(g, { px: 2.6 }); g.press = (k) => { cap.scale.y = 1 - k * 0.6; dome.material.emissiveIntensity = 0.3 + k * 1.2; }; return g; }
export function lunchSign() { const g = new THREE.Group(); g.add(cyl(0.07, 0.07, 2.4, '#8a6a4a', 0, 1.2, 0, 8));
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 0.08), [toon('#8a6a4a'), toon('#8a6a4a'), toon('#8a6a4a'), toon('#8a6a4a'), new THREE.MeshBasicMaterial({ map: labelTex(['LUNCH', 'this way →'], { w: 512, h: 220, sizes: [110, 46], lh: 92, bg: '#fbf2dc', border: '#c0261a', ink: '#c0261a' }) }), toon('#8a6a4a')]);
  b.position.y = 2.2; b.castShadow = true; g.add(b); outline(g, { px: 2.4 }); return g; }
export function scanner(o = {}) { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.32, 16, 48), toon('#f0f2f4')); ring.position.y = 1.6; g.add(ring);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 8, 48), toon('#5ad0ff', { emissive: new THREE.Color('#3ac0ff'), emissiveIntensity: 0.8 })); inner.position.y = 1.6; inner.position.z = 0.15; inner.userData.noOutline = true; g.add(inner);
  g.add(rbox(1.8, 0.3, 1.2, '#d8dce2', 0, 0.15, 0, 0.08));
  const mon = new THREE.Group(); mon.position.set(2.4, 2.1, 0.3); mon.rotation.y = -0.35; g.add(mon); mon.add(rbox(1.7, 1.15, 0.14, '#3a424c', 0, 0, 0, 0.06)); mon.add(cyl(0.05, 0.05, 2.0, '#5a6470', 0, -1.05, -0.05, 8));
  const scr = canvasTex(400, 260, (c, W, H) => { c.fillStyle = '#0a1a24'; c.fillRect(0, 0, W, H); c.strokeStyle = '#3ad0ff'; c.lineWidth = 4; c.beginPath(); c.ellipse(W / 2, H * 0.36, 70, 52, 0, 0, 7); c.stroke(); c.font = '900 64px Nunito'; c.fillStyle = '#3ad0ff'; c.textAlign = 'center'; c.fillText('?', W / 2, H * 0.36 + 22);
    c.fillStyle = '#ff4a3a'; c.font = '900 50px Nunito'; c.fillText('NO BRAIN', W / 2, H * 0.74); c.fillText('FOUND', W / 2, H * 0.93); });
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.97), new THREE.MeshBasicMaterial({ map: scr })); sc.position.z = 0.075; sc.userData.noOutline = true; mon.add(sc);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.05), new THREE.MeshBasicMaterial({ color: '#5ae0ff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); scan.position.set(0, 1.6, 0.4); scan.userData.noOutline = true; g.add(scan);
  outline(g, { px: 2.4 }); g.screen = sc; g.scan = scan; g.monitor = mon; return g; }
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

// =====================================================================================================================
// OCTOPUS SHORT ADDITIONS
// =====================================================================================================================
// two-tone line: [[text, colour], ...] centred at y (top caption on frame 1)
export function richLine(g, parts, y, size, o = {}) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: '#2a1c15' }); x += ws[i] + sp; }); g.restore();
}
// the frame-1 top caption (2 lines, centre-top, below the Shorts top bar). gt = global time; visible 0..until (3.5 s)
// lines = [[[text, colour], ...], [[text, colour], ...]]
export function topCaption(g, gt, lines, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  g.save(); g.globalAlpha = fade;
  lines.forEach((parts, i) => { const y = 300 + i * 110, k = ease.outBack(clamp((gt + 0.25 - i * 0.17) / 0.3)); g.save(); g.translate(540, y); g.scale(k, k); g.translate(-540, -y); richLine(g, parts, y, o.size || 82); g.restore(); });
  g.restore();
}

export const OC = '#ff7f50';
const HEART_SHAPE = (() => { const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(-0.95, 0.05, -0.55, 0.8, 0, 0.38); s.bezierCurveTo(0.55, 0.8, 0.95, 0.05, 0, -0.5); return s; })();
export function heartMesh(color = '#ff3a4a', size = 1) {
  const geo = new THREE.ExtrudeGeometry(HEART_SHAPE, { depth: 0.22, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 3, curveSegments: 12 }); geo.center();
  const mat = toon(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.45, fresh: true });
  const m = new THREE.Mesh(geo, mat); m.scale.setScalar(size); m.userData.noOutline = true; return m;
}
const glowM = (c, k = 1) => toon(c, { emissive: new THREE.Color(c), emissiveIntensity: k, fresh: true });

// octopus({ seed, scale, color }) — the hero. ~2.2 units tall standing on its arms, faces +Z. Big mantle behind/above the eyes.
// .update(t, { lid, lidL, lidR, look, blink, mouth:'smile'|'o'|'frown'|'none', spread (arm angle from straight down, rad),
//   curl, wave, swim (0..1 jet pose: arms trail together), arms:[{spread,curl,wave,lift}] per-arm overrides,
//   xray 0..1 (skin goes see-through: brain, neurons, hearts), brain, neurons (head dots), armNeurons, ganglia (0..8 mini brains lit),
//   hearts (0..1 show), beat (bpm-ish speed), bodyHeart (0..1 beating; 0 = quiet/grey), gillHearts, squash [x,y,z], crown, breathe })
export function octopus(o = {}) {
  const { seed = 1, scale = 1, color = OC } = o; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const skin = toon(color, { fresh: true, transparent: true, opacity: 1 });
  const skinD = toon(shadeC(color, -0.14), { fresh: true, transparent: true, opacity: 1 });
  const suckM = toon('#ffe2cc', { fresh: true, transparent: true, opacity: 1 }), suckIn = toon('#f2b49a', { fresh: true, transparent: true, opacity: 1 });
  const body = new THREE.Group(); body.position.y = 1.15; g.add(body);
  const squashG = new THREE.Group(); body.add(squashG);
  const headM = M(sph, skin); headM.scale.set(0.62, 0.56, 0.58); squashG.add(headM);
  const mantleG = new THREE.Group(); mantleG.position.set(0, 0.42, -0.2); mantleG.rotation.x = -0.38; squashG.add(mantleG);
  const mantle = M(sph, skin); mantle.scale.set(0.74, 0.98, 0.8); mantle.position.y = 0.4; mantleG.add(mantle);
  for (let i = 0; i < 11; i++) { const a = r() * Math.PI * 2, th = 0.35 + r() * 1.5; const d = new THREE.Vector3(Math.cos(a) * Math.sin(th), Math.cos(th), Math.sin(a) * Math.sin(th));
    if (d.z > 0.55 && d.y < 0.5) continue; const sp = M(sph, skinD, d.x * 0.725, 0.4 + d.y * 0.965, d.z * 0.785); const k = 0.05 + r() * 0.05; sp.scale.set(k, k, k * 0.25); sp.lookAt(sp.position.clone().add(new THREE.Vector3(d.x / 0.74, d.y / 0.98, d.z / 0.8))); sp.userData.noOutline = true; mantleG.add(sp); }
  // face
  const face = new THREE.Group(); face.position.set(0, 0.04, 0); squashG.add(face);
  const eyes = [-1, 1].map(s => lidEye(face, new THREE.Vector3(s * 0.26, 0.13, 0.47), new THREE.Vector3(s * 0.45, 0.18, 0.88).normalize(), 0.18, { lid: shadeC(color, -0.05) }));
  const brows = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.14, 4, 8), flat('#5a1a20')); b.rotation.z = Math.PI / 2; b.position.set(s * 0.27, 0.38, 0.5); b.userData.noOutline = true; face.add(b); return b; });
  const mouths = {}; { const mm = flat('#6a1a28');
    const sm = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 8, 20, Math.PI), mm); sm.rotation.z = Math.PI; sm.position.set(0, -0.16, 0.555); mouths.smile = sm;
    const om = new THREE.Mesh(new THREE.CircleGeometry(0.05, 18), mm); om.position.set(0, -0.17, 0.56); om.scale.y = 1.3; mouths.o = om;
    const fr = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.02, 8, 20, Math.PI), mm); fr.position.set(0, -0.21, 0.55); mouths.frown = fr;
    for (const k in mouths) { mouths[k].userData.noOutline = true; mouths[k].rotation.x = -0.3; face.add(mouths[k]); } }
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#ff5a7a', { transparent: true, opacity: 0.55 })); ch.scale.set(0.08, 0.045, 0.02); ch.position.set(s * 0.42, -0.08, 0.42); ch.rotation.y = s * 0.7; ch.userData.noOutline = true; face.add(ch); }
  // ---- insides (x-ray) ----
  const inside = new THREE.Group(); squashG.add(inside);
  const brainM = glowM('#ff8ac8', 0.6); const brain = M(new THREE.TorusGeometry(0.17, 0.085, 12, 28), brainM, 0, 0.12, -0.02); brain.rotation.x = Math.PI / 2 - 0.3; brain.userData.noOutline = true; inside.add(brain);
  const dotM = glowM('#ffe066', 1.2), dotDim = glowM('#9a8a6a', 0.2); const dotGeo = new THREE.SphereGeometry(0.03, 8, 6);
  const headDots = []; for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, rr = 0.12 + r() * 0.28, y = -0.15 + r() * 0.5; const d = new THREE.Mesh(dotGeo, dotM); d.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr * 0.9); d.userData.noOutline = true; inside.add(d); headDots.push(d); }
  const hearts = new THREE.Group(); mantleG.add(hearts);
  const sysH = heartMesh('#ff3a4a', 0.34); sysH.position.set(0, 0.42, 0.05); hearts.add(sysH);
  const gillH = [-1, 1].map(s => { const h = heartMesh('#ff5a6a', 0.22); h.position.set(s * 0.36, 0.22, 0.12); h.rotation.z = -s * 0.25; hearts.add(h); return h; });
  const greyHeart = new THREE.Color('#8a8a96'), redHeart = new THREE.Color('#ff3a4a');
  // ---- arms ----
  const NA = 8, NS = 10, SL = 0.2, R0 = 0.13, R1 = 0.035;
  const arms = [];
  for (let i = 0; i < NA; i++) {
    const a = ((i + 0.5) / NA) * Math.PI * 2 + Math.PI / 2;   // arms 3/4 face the camera
    const base = new THREE.Group(); base.position.set(Math.cos(a) * 0.36, -0.3, Math.sin(a) * 0.34); squashG.add(base);
    const gang = M(new THREE.SphereGeometry(0.075, 12, 8), glowM('#ffd23a', 1.4)); gang.userData.noOutline = true; gang.position.y = -0.06; base.add(gang);
    const segs = [], dots = []; let parent = base;
    for (let k = 0; k < NS; k++) {
      const sg = new THREE.Group(); if (k) sg.position.y = -SL; parent.add(sg);
      const rad = lerp(R0, R1, k / (NS - 1)), rad2 = lerp(R0, R1, (k + 1) / (NS - 1));
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad2, SL + 0.02, 12).translate(0, -SL / 2, 0), skin); m.castShadow = true; sg.add(m);
      if (k === NS - 1) { const tip = M(sph, skin, 0, -SL, 0); tip.scale.setScalar(rad2); sg.add(tip); }
      else { const j = M(sph, skin, 0, -SL, 0); j.scale.setScalar(rad2 * 1.01); j.userData.noOutline = true; sg.add(j); }
      const dt = new THREE.Mesh(dotGeo, dotM); dt.position.y = -SL / 2; dt.scale.setScalar(lerp(1.2, 0.6, k / NS)); dt.userData.noOutline = true; sg.add(dt); dots.push(dt);
      sg.userData.rad = rad; segs.push(sg); parent = sg;
    }
    arms.push({ base, segs, a, gang, dots, ph: r() * 6, suck: [] });
  }
  // orient bases + add suckers on the convex side (computed once from a reference spread so they sit on the arm surface)
  const Y_ = new THREE.Vector3(0, -1, 0), q = new THREE.Quaternion(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  arms.forEach(A => { A.tan = new THREE.Vector3(-Math.sin(A.a), 0, Math.cos(A.a)); A.rad = new THREE.Vector3(Math.cos(A.a), 0, Math.sin(A.a)); A.kLocal = A.tan.clone(); A.rLocal = A.rad.clone();
    const side = Y_.clone().applyAxisAngle(A.kLocal, -Math.PI / 2);   // in base-local frame before base rotation; base rotation keeps kLocal fixed since it rotates about kLocal
    A.segs.forEach((sg, k) => { if (k < 1) return; const rad = sg.userData.rad; for (const f of [0.3, 0.75]) { const s1 = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.55, rad * 0.6, 0.03, 12), suckM); s1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), side);
      s1.position.copy(side).multiplyScalar(rad * 0.92); s1.position.y -= SL * f; s1.userData.noOutline = true; sg.add(s1);
      const s2 = new THREE.Mesh(new THREE.CircleGeometry(rad * 0.28, 10), suckIn); s2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), side); s2.position.copy(side).multiplyScalar(rad * 0.92 + 0.017); s2.position.y -= SL * f; s2.userData.noOutline = true; sg.add(s2); } }); });
  // crown (the main brain "takes control")
  const crown = new THREE.Group(); crown.position.set(0, 1.42, -0.05); mantleG.add(crown);
  { const gold = toon('#ffcc33', { emissive: new THREE.Color('#ffb000'), emissiveIntensity: 0.35 }); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.14, 20, 1, true), gold); band.material.side = THREE.DoubleSide; crown.add(band);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), gold); sp.position.set(Math.cos(a) * 0.25, 0.15, Math.sin(a) * 0.25); crown.add(sp); crown.add(ball(0.035, i % 2 ? '#ff3a6a' : '#3ac0ff', Math.cos(a) * 0.25, 0.25, Math.sin(a) * 0.25, 8)); } }
  crown.visible = false;
  outline(g, { px: 3 });
  const skinHulls = []; g.traverse(m => { if (m.userData.isHull && m.parent && [skin, skinD].includes(m.parent.material)) skinHulls.push(m); });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.3; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  const pulse = (t, rate, ph = 0) => { const c = (t * rate + ph) % 1; return c < 0.18 ? Math.sin(c / 0.18 * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { lid = 0.2, lidL, lidR, look = [0, 0], blink = true, mouth = 'smile', spread = 1.15, curl = 0.9, wave = 1, swim = 0, xray = 0, brain: bv = 0, neurons = 0, armNeurons = 0,
      ganglia = 0, hearts: hv = 0, beat = 1.4, bodyHeart = 1, gillHearts = 1, squash = [1, 1, 1], crown: cv = 0, breathe = 1, brow = 0, armsO = u.arms || [], sync = 0 } = u;
    // body breathing + jet squeeze
    const br = Math.sin(t * 2.0 + seed) * 0.03 * breathe;
    mantle.scale.set(0.74 * (1 - br - swim * 0.12), 0.98 * (1 + br + swim * 0.12), 0.8 * (1 - br - swim * 0.1));
    squashG.scale.set(...squash); body.position.y = 1.15 + Math.sin(t * 1.6 + seed) * 0.04;
    // x-ray: see-through skin, glowing insides
    const op = 1 - 0.68 * xray; [skin, skinD, suckM, suckIn].forEach(m => { m.opacity = op; m.depthWrite = xray < 0.02; }); skinHulls.forEach(h => { h.visible = xray < 0.05; });
    inside.visible = xray > 0.02; hearts.visible = xray > 0.02 && hv > 0;
    brainM.emissiveIntensity = 0.3 + bv * 1.2; brain.scale.setScalar(1 + bv * 0.15 + Math.sin(t * 6) * 0.02 * bv);
    headDots.forEach((d, i) => { d.material = neurons > 0.5 ? dotM : dotDim; d.visible = xray > 0.02 && neurons > 0.02; });
    arms.forEach((A, i) => { A.gang.visible = (xray > 0.02 || ganglia > 0) && i < Math.round(ganglia); A.gang.scale.setScalar(1 + Math.sin(t * 5 + i) * 0.12);
      A.dots.forEach(d => { d.visible = xray > 0.02 && armNeurons > 0.02; d.material = armNeurons > 0.5 ? dotM : dotDim; }); });
    // hearts
    const bh = pulse(t, beat, 0) * bodyHeart; sysH.scale.setScalar(0.34 * (1 + 0.25 * bh)); sysH.material.color.copy(redHeart).lerp(greyHeart, 1 - clamp(bodyHeart * 1.5)); sysH.material.emissiveIntensity = 0.15 + 0.5 * clamp(bodyHeart);
    gillH.forEach((h, k) => { h.scale.setScalar(0.22 * (1 + 0.28 * pulse(t, beat, 0.5 + k * 0.05) * gillHearts)); h.material.emissiveIntensity = 0.3 + 0.6 * gillHearts; });
    hearts.scale.setScalar(Math.max(0.001, hv));
    // arms
    arms.forEach((A, i) => { const ov = armsO[i] || {}; const sp = lerp(ov.spread ?? spread, 0.12, swim), cu = lerp(ov.curl ?? curl, -0.05, swim), wv = (ov.wave ?? wave) * (1 - swim * 0.6);
      const ph = lerp(A.ph, 0, sync);
      const d = new THREE.Vector3(A.rad.x * Math.sin(sp), -Math.cos(sp), A.rad.z * Math.sin(sp)).normalize();
      A.base.quaternion.setFromUnitVectors(Y_, d);
      const kL = A.tan.clone().applyQuaternion(A.base.quaternion.clone().invert());   // tangent in base-local frame
      A.segs.forEach((sg, k) => { if (!k) { sg.quaternion.identity(); return; }
        const ang = cu * 0.32 * (k / NS) * 1.6 + wv * Math.sin(t * 2.3 - k * 0.65 + ph) * 0.16 + (ov.lift || 0) * (k < 4 ? 0.35 : 0.05);
        qa.setFromAxisAngle(kL, ang); qb.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0); sg.quaternion.copy(qa); }); });
    // face
    const bl = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { const l = i === 0 ? (lidR ?? lid) : (lidL ?? lid); e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(l, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    brows.forEach((b, i) => { b.rotation.z = Math.PI / 2 + (i ? -1 : 1) * brow * 0.4; b.position.y = 0.38 + Math.abs(brow) * 0.02; });
    for (const k in mouths) mouths[k].visible = k === mouth;
    crown.visible = cv > 0.01; crown.scale.setScalar(Math.max(0.001, ease.outBack(clamp(cv))));
  };
  // world position of an arm tip
  const tv = new THREE.Vector3();
  root.armTip = (i) => { const sg = arms[i].segs[NS - 1]; root.updateWorldMatrix(true, true); return sg.localToWorld(tv.set(0, -SL, 0)).clone(); };
  root.armBase = (i) => { root.updateWorldMatrix(true, true); return arms[i].base.localToWorld(tv.set(0, 0, 0)).clone(); };
  root.heartPos = (k) => { root.updateWorldMatrix(true, true); const h = k === 0 ? sysH : gillH[k - 1]; return h.getWorldPosition(new THREE.Vector3()); };
  root.brainPos = () => { root.updateWorldMatrix(true, true); return brain.getWorldPosition(new THREE.Vector3()); };
  root.head = face; root.eyes = eyes; root.headR = 0.9; root.arms = arms;
  root.update(0); return root;
}

// a dog in a diving bubble-helmet (s05 "about as many as a dog")
export function scubaDog(o = {}) {
  const g = new THREE.Group(); const fur = toon(o.color || '#d9a066'), dark = toon('#8a5a32');
  const bodyM = M(sph, fur, 0, 0.75, 0); bodyM.scale.set(0.5, 0.42, 0.75); g.add(bodyM);
  for (const [x, z] of [[-0.28, 0.42], [0.28, 0.42], [-0.28, -0.42], [0.28, -0.42]]) g.add(cyl(0.09, 0.08, 0.5, '#d9a066', x, 0.3, z, 10));
  const tail = cyl(0.05, 0.03, 0.45, '#d9a066', 0, 0.95, -0.78, 8); tail.rotation.x = -0.9; g.add(tail);
  const head = new THREE.Group(); head.position.set(0, 1.35, 0.55); g.add(head);
  const hm = M(sph, fur); hm.scale.set(0.38, 0.36, 0.36); head.add(hm);
  const sn = M(sph, toon('#f0d0a0'), 0, -0.08, 0.3); sn.scale.set(0.2, 0.15, 0.18); head.add(sn);
  const nose = M(sph, toon('#2a1c15'), 0, -0.02, 0.46); nose.scale.set(0.07, 0.05, 0.05); head.add(nose);
  const ears = [-1, 1].map(s => { const e = M(sph, dark, s * 0.36, 0.0, -0.02); e.scale.set(0.1, 0.26, 0.16); e.rotation.z = s * 0.2; head.add(e); return e; });
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.14, 0.1, 0.3), new THREE.Vector3(s * 0.35, 0.15, 0.92).normalize(), 0.09, { lid: '#c88a52' }));
  const tongue = M(sph, toon('#ff6a8a'), 0, -0.2, 0.36); tongue.scale.set(0.07, 0.03, 0.08); head.add(tongue);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.6, 28, 20), toon('#dff6ff', { transparent: true, opacity: 0.25, fresh: true, depthWrite: false })); helmet.userData.noOutline = true; head.add(helmet);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 10, 28), toon('#d8a040')); ring.position.set(0, -0.42, -0.1); ring.rotation.x = Math.PI / 2 - 0.5; head.add(ring);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), flat('#ffffff', { transparent: true, opacity: 0.5 })); hl.scale.set(0.1, 0.16, 0.02); hl.position.set(-0.3, 0.3, 0.45); hl.userData.noOutline = true; head.add(hl);
  outline(g, { px: 2.6 }); helmet.visible = true;
  g.update = (t, u = {}) => { tail.rotation.z = Math.sin(t * 9) * 0.5; ears.forEach((e, i) => { e.rotation.z = (i ? 1 : -1) * (0.2 + Math.sin(t * 3 + i) * 0.1); }); g.position.y = (u.y ?? 0) + Math.sin(t * 1.8) * 0.06;
    eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, u.lid ?? 0.2); e.pg.rotation.set(-(u.look?.[1] ?? 0) * 0.4, (u.look?.[0] ?? 0) * 0.5, 0); }); };
  g.head = head; g.eyes = eyes; g.headR = 0.5; g.update(0); return g;
}
// a clam (s09 "taste") — two ribbed shells on a hinge; .open(k)
export function clam(o = {}) {
  const g = new THREE.Group(); const tex = canvasTex(128, 64, (c, W, H) => { c.fillStyle = o.color || '#f2c8a0'; c.fillRect(0, 0, W, H); c.strokeStyle = '#c8906a'; c.lineWidth = 5; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(i * W / 8, 0); c.lineTo(i * W / 8, H); c.stroke(); } });
  const mat = toon('#ffffff', { map: tex, fresh: true, side: THREE.DoubleSide });
  const shellGeo = new THREE.SphereGeometry(0.5, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const bot = new THREE.Mesh(shellGeo, mat); bot.scale.set(1, 0.35, 0.8); bot.rotation.x = Math.PI; bot.position.y = 0.18; g.add(bot);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.18, -0.38); g.add(hinge);
  const top = new THREE.Mesh(shellGeo, mat); top.scale.set(1, 0.35, 0.8); top.position.set(0, 0, 0.38); hinge.add(top);
  const pearl = ball(0.1, '#ffffff', 0, 0.22, 0.05, 14); pearl.material = toon('#fff8f0', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3, fresh: true }); g.add(pearl);
  outline(g, { px: 2.4 }); g.open = (k) => { hinge.rotation.x = -k * 0.9; }; g.open(0.3); return g;
}
// a test tube of blue blood (s16)
export function testTube(o = {}) {
  const g = new THREE.Group(); const H = o.h || 1.1, R = o.r || 0.17;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 20, 1, true), toon('#e8f6ff', { transparent: true, opacity: 0.3, fresh: true, side: THREE.DoubleSide, depthWrite: false })); glass.position.y = H / 2; glass.userData.noOutline = true; g.add(glass);
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(R, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glass.material); bottom.userData.noOutline = true; g.add(bottom);
  const liqM = toon('#2a7cff', { emissive: new THREE.Color('#1a5aff'), emissiveIntensity: 0.55, fresh: true });
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, H * 0.6, 20), liqM); liq.position.y = H * 0.3; liq.userData.noOutline = true; g.add(liq);
  const lb = new THREE.Mesh(new THREE.SphereGeometry(R * 0.9, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), liqM); lb.userData.noOutline = true; g.add(lb);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R * 1.05, 0.03, 8, 24), toon('#cfe8f6')); rim.rotation.x = Math.PI / 2; rim.position.y = H; g.add(rim);
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.08, R * 1.08, H + 0.02, 20, 1, true), flat('#2a1c15', { side: THREE.BackSide })); ink.position.y = H / 2; ink.scale.set(1.04, 1, 1.04); ink.userData.noOutline = true; g.add(ink);
  g.liquid = liqM; return g;
}
// a rock slab with a small round hole (the payoff: zero bones, it squeezes through)
export function holeRock(o = {}) {
  const W = o.w || 3.4, H = o.h || 3.0, hr = o.hole || 0.3;
  const s = new THREE.Shape(); s.moveTo(-W / 2, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2 * 0.9, H); s.lineTo(-W / 2 * 0.85, H * 0.95); s.closePath();
  const hole = new THREE.Path(); hole.absarc(0, o.holeY || 1.4, hr, 0, Math.PI * 2, true); s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 3, curveSegments: 24 }); geo.translate(0, 0, -0.25);
  const m = new THREE.Mesh(geo, toon(o.color || '#8a93a6')); m.castShadow = true; m.receiveShadow = true; const g = new THREE.Group(); g.add(m);
  outline(g, { px: 2.6 }); g.holeY = o.holeY || 1.4; g.hole = hr; return g;
}
// a little "brain" icon (2D) for chips: pink doughnut brain
export function brainIcon(g, x, y, s, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#ff9ad0'; g.strokeStyle = '#2a1c15'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 34, 26, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.moveTo(0, -24); g.quadraticCurveTo(-6, 0, 0, 24); g.moveTo(-22, -10); g.quadraticCurveTo(-12, -2, -22, 8); g.moveTo(20, -12); g.quadraticCurveTo(10, 0, 20, 10); g.stroke(); g.restore();
}

// =====================================================================================================================
// WOOD FROG SHORT ADDITIONS
// =====================================================================================================================
export const FROG = '#c48a4e';
const ICE = new THREE.Color('#cfeeff');
// woodFrog({ seed, scale }) — the hero: a tan-brown toon frog with the wood frog's dark "robber's mask" behind the eyes.
// Sits ~1.25 units tall, faces +Z. .update(t, { lid, lidL, lidR, look, blink, mouth:'smile'|'o'|'flat'|'grin', frozen 0..1 (ice shell + frost tint),
//   xray 0..1, heart (0..1 beat strength), beat, ice (0..1 crystals inside), sugar (0..1 sugar cubes), liver (glow 0..1), legs (0 sit .. 1 stretched hop),
//   shiver, breathe, brow })
export function woodFrog(o = {}) {
  const { seed = 1, scale = 1 } = o; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const base = new THREE.Color(o.color || FROG), baseBelly = new THREE.Color('#f2e2bc'), baseMask = new THREE.Color('#4a2e1e');
  const skin = toon(o.color || FROG, { fresh: true, transparent: true, opacity: 1 }), belly = toon('#f2e2bc', { fresh: true, transparent: true, opacity: 1 });
  const mask = toon('#4a2e1e', { fresh: true, transparent: true, opacity: 1 }), spotM = toon(shadeC(o.color || FROG, -0.25), { fresh: true, transparent: true, opacity: 1 });
  const bodyG = new THREE.Group(); g.add(bodyG);
  const body = M(sph, skin, 0, 0.5, -0.1); body.scale.set(0.62, 0.44, 0.78); body.rotation.x = -0.38; bodyG.add(body);
  const bel = M(sph, belly, 0, 0.42, 0.05); bel.scale.set(0.52, 0.34, 0.66); bel.rotation.x = -0.38; bel.userData.noOutline = true; bodyG.add(bel);
  for (let i = 0; i < 6; i++) { const sp = M(sph, spotM, (r() - 0.5) * 0.6, 0.78 + r() * 0.08, -0.45 + r() * 0.5); sp.scale.set(0.08, 0.03, 0.08); sp.userData.noOutline = true; bodyG.add(sp); }
  const head = new THREE.Group(); head.position.set(0, 0.82, 0.42); bodyG.add(head);
  const hm = M(sph, skin); hm.scale.set(0.56, 0.36, 0.5); head.add(hm);
  const jaw = M(sph, belly, 0, -0.12, 0.04); jaw.scale.set(0.5, 0.2, 0.42); jaw.userData.noOutline = true; head.add(jaw);
  for (const s of [-1, 1]) { const bump = M(sph, skin, s * 0.27, 0.2, 0.04); bump.scale.setScalar(0.2); head.add(bump);
    const mk = M(sph, mask, s * 0.43, 0.04, -0.06); mk.scale.set(0.09, 0.13, 0.3); mk.rotation.y = s * 0.3; mk.userData.noOutline = true; head.add(mk); }
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.29, 0.27, 0.13), new THREE.Vector3(s * 0.5, 0.55, 0.65).normalize(), 0.16, { lid: shadeC(o.color || FROG, -0.08) }));
  const brows = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.1, 4, 8), flat('#3a2014')); b.rotation.z = Math.PI / 2; b.position.set(s * 0.3, 0.47, 0.2); b.userData.noOutline = true; head.add(b); return b; });
  const mouths = {}; { const mm = flat('#4a1a14');
    // wrap-around frog mouth: a torus arc lying flat, scaled to the head's outline, spanning the front of the head
    const wrap = (tube, y, w) => { const grp = new THREE.Group(); grp.rotation.x = -Math.PI / 2 + 0.24; grp.position.y = y + 0.03; grp.scale.set(0.575, 0.545, 1);
      const m = new THREE.Mesh(new THREE.TorusGeometry(1, tube, 6, 40, Math.PI * w), mm); m.rotation.z = -Math.PI / 2 - Math.PI * w / 2; m.userData.noOutline = true; grp.add(m); return grp; };
    mouths.smile = wrap(0.016, -0.02, 0.6); mouths.grin = wrap(0.026, -0.03, 0.7); mouths.flat = wrap(0.014, -0.02, 0.45);
    const om = new THREE.Mesh(new THREE.CircleGeometry(0.07, 18), mm); om.position.set(0, -0.06, 0.5); om.scale.set(1.3, 1, 1); om.userData.noOutline = true; mouths.o = om;
    for (const k in mouths) head.add(mouths[k]); }
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#ff7a6a', { transparent: true, opacity: 0.45 })); ch.scale.set(0.07, 0.04, 0.02); ch.position.set(s * 0.35, -0.02, 0.36); ch.rotation.y = s * 0.7; ch.userData.noOutline = true; head.add(ch); }
  // legs
  const legs = { front: [], back: [] };
  for (const s of [-1, 1]) {
    const fg = new THREE.Group(); fg.position.set(s * 0.3, 0.5, 0.42); bodyG.add(fg);
    const arm = cyl(0.07, 0.06, 0.5, o.color || FROG, 0, -0.22, 0.04, 10); arm.material = skin; arm.rotation.x = 0.15; fg.add(arm);
    const hand = M(sph, skin, s * 0.02, -0.47, 0.12); hand.scale.set(0.11, 0.035, 0.1); fg.add(hand);
    for (let k = -1; k <= 1; k++) { const toe = M(sph, belly, s * 0.02 + k * 0.07, -0.47, 0.22); toe.scale.setScalar(0.035); fg.add(toe); }
    legs.front.push(fg);
    const bg = new THREE.Group(); bg.position.set(s * 0.42, 0.38, -0.35); bodyG.add(bg);
    const thigh = M(sph, skin, s * 0.05, 0, 0.12); thigh.scale.set(0.2, 0.17, 0.4); thigh.rotation.y = s * 0.3; bg.add(thigh);
    const shinG = new THREE.Group(); shinG.position.set(s * 0.12, -0.08, 0.42); bg.add(shinG);
    const shin = M(sph, skin, 0, -0.1, -0.2); shin.scale.set(0.11, 0.1, 0.32); shinG.add(shin);
    const foot = M(sph, skin, s * 0.05, -0.32, 0.05); foot.scale.set(0.13, 0.035, 0.32); shinG.add(foot);
    for (let k = -1; k <= 1; k++) { const toe = M(sph, belly, s * 0.05 + k * 0.08, -0.32, 0.36); toe.scale.setScalar(0.04); shinG.add(toe); }
    bg.shin = shinG; legs.back.push(bg);
  }
  // ---- insides (x-ray) ----
  const inside = new THREE.Group(); bodyG.add(inside);
  const heart = heartMesh('#ff3a4a', 0.16); heart.position.set(0, 0.6, 0.28); inside.add(heart);
  const liverM = toon('#8a3a2a', { emissive: new THREE.Color('#c05030'), emissiveIntensity: 0.2, fresh: true });
  const liver = M(sph, liverM, 0.08, 0.42, 0.05); liver.scale.set(0.24, 0.1, 0.18); liver.userData.noOutline = true; inside.add(liver);
  const iceM = toon('#e8f8ff', { emissive: new THREE.Color('#bfe8ff'), emissiveIntensity: 0.7, fresh: true }); const iceGeo = new THREE.OctahedronGeometry(0.05, 0);
  const crystals = []; for (let i = 0; i < 44; i++) { const c = new THREE.Mesh(iceGeo, iceM); const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.45; c.position.set(Math.cos(a) * rr, 0.25 + r() * 0.55, -0.4 + r() * 0.75); c.rotation.set(r() * 3, r() * 3, 0); c.scale.setScalar(0.7 + r() * 0.8); c.userData.noOutline = true; inside.add(c); crystals.push(c); }
  crystals.sort((a, b) => a.position.y - b.position.y);
  const sugM = toon('#ffffff', { emissive: new THREE.Color('#fff2c0'), emissiveIntensity: 0.8, fresh: true }); const sugGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
  const sugar = []; for (let i = 0; i < 36; i++) { const c = new THREE.Mesh(sugGeo, sugM); c.userData = { a: r() * Math.PI * 2, rr: 0.1 + r() * 0.38, y: 0.3 + r() * 0.5, z: -0.4 + r() * 0.75, ph: r() * 6, noOutline: true }; inside.add(c); sugar.push(c); }
  // ice shell + frost
  const shellM = toon('#dff4ff', { emissive: new THREE.Color('#bfe8ff'), emissiveIntensity: 0.35, transparent: true, opacity: 0, fresh: true, flatShading: true, depthWrite: false });
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), shellM); shell.position.set(0, 0.58, 0.05); shell.scale.set(0.82, 0.68, 1.0); shell.userData.noOutline = true; g.add(shell);
  const shellEdge = new THREE.LineSegments(new THREE.EdgesGeometry(shell.geometry), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })); shell.add(shellEdge);
  root.add(blob(0.75, 0.3));
  outline(g, { px: 3 });
  const skinHulls = []; g.traverse(m => { if (m.userData.isHull && m.parent && [skin, belly, mask, spotM].includes(m.parent.material)) skinHulls.push(m); });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.6; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  const pulse = (t, rate) => { const c = (t * rate) % 1; return c < 0.18 ? Math.sin(c / 0.18 * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { lid = 0.2, lidL, lidR, look = [0, 0], blink = true, mouth = 'smile', frozen = 0, xray = 0, heart: hb = 1, beat = 1.3, ice = 0, sugar: sg = 0, liver: lv = 0,
      legs: lg = 0, shiver = 0, breathe = 1, brow = 0 } = u;
    const fz = clamp(frozen);
    skin.color.copy(base).lerp(ICE, fz * 0.55); belly.color.copy(baseBelly).lerp(ICE, fz * 0.5); mask.color.copy(baseMask).lerp(ICE, fz * 0.35);
    const op = 1 - 0.68 * xray; [skin, belly, mask, spotM].forEach(m => { m.opacity = op; m.depthWrite = xray < 0.02; }); skinHulls.forEach(h => { h.visible = xray < 0.05; });
    inside.visible = xray > 0.02;
    heart.scale.setScalar(0.16 * (1 + 0.3 * pulse(t, beat) * hb)); heart.material.color.set('#ff3a4a').lerp(new THREE.Color('#9aa6b8'), 1 - clamp(hb * 1.5)); heart.material.emissiveIntensity = 0.1 + 0.5 * clamp(hb);
    liverM.emissiveIntensity = 0.15 + lv * 1.2; liver.scale.set(0.24 * (1 + lv * 0.1 * Math.sin(t * 8)), 0.1, 0.18);
    const nI = Math.round(clamp(ice) * crystals.length); crystals.forEach((c, i) => { c.visible = i < nI; c.rotation.y = t * 0.5 + i; });
    const nS = Math.round(clamp(sg) * sugar.length); sugar.forEach((c, i) => { const d = c.userData; c.visible = i < nS; const a = d.a + t * 0.8;
      c.position.set(Math.cos(a) * d.rr * 0.9, d.y + Math.sin(t * 3 + d.ph) * 0.03, d.z + Math.sin(a) * 0.05); c.rotation.set(t + d.ph, t * 1.3, 0); });
    shellM.opacity = 0.5 * fz; shellEdge.material.opacity = 0.7 * fz; shell.visible = fz > 0.01; shell.scale.set(0.82, 0.68 * (0.6 + 0.4 * fz), 1.0);
    // posture: breathe (throat), shiver, legs stretch for hops
    const br = (1 - fz) * breathe * Math.sin(t * 5) * 0.025; jaw.scale.set(0.5, 0.2 + br * 2, 0.42 + br);
    bodyG.position.x = shiver * Math.sin(t * 60) * 0.015 * (1 - fz);
    legs.back.forEach((b, i) => { b.rotation.x = lerp(0, 1.0, lg); b.shin.rotation.x = lerp(0, 1.4, lg); });
    legs.front.forEach((f) => { f.rotation.x = lerp(0, -0.6, lg); });
    bodyG.rotation.x = lerp(0, -0.25, lg);
    const bl = blink && fz < 0.5 ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { const l = i === 0 ? (lidR ?? lid) : (lidL ?? lid); e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(l, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    brows.forEach((b, i) => { b.rotation.z = Math.PI / 2 + (i ? -1 : 1) * brow * 0.4; });
    for (const k in mouths) mouths[k].visible = k === mouth;
  };
  root.heartPos = () => { root.updateWorldMatrix(true, true); return heart.getWorldPosition(new THREE.Vector3()); };
  root.liverPos = () => { root.updateWorldMatrix(true, true); return liver.getWorldPosition(new THREE.Vector3()); };
  root.head = head; root.eyes = eyes; root.headR = 0.42;
  root.update(0); return root;
}
// hop(p): 0..1 progress of one hop -> { y, legs } (height arc + leg stretch)
export const hopArc = (p, h = 0.8) => { p = clamp(p); return { y: Math.sin(p * Math.PI) * h, legs: p <= 0 || p >= 1 ? 0 : Math.sin(Math.min(1, p * 1.6) * Math.PI) * 0.9 + 0.1 }; };

// ---------- sets ----------
const leafCols = ['#c8732a', '#a85a22', '#d89a3a', '#8a4a22', '#b8862e'];
function spruce(s = 1, snow = 0) { const g = new THREE.Group(); g.add(cyl(0.12 * s, 0.16 * s, 0.9 * s, '#5a3a22', 0, 0.45 * s, 0, 8));
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.3 - i * 0.27) * s, 1.3 * s, 10), toon(i % 2 ? '#2f6a4a' : '#356f4e')); c.position.y = (1.1 + i * 0.75) * s; c.castShadow = true; g.add(c);
    if (snow) { const sc = new THREE.Mesh(new THREE.ConeGeometry((1.0 - i * 0.22) * s, 0.55 * s, 10), toon('#f4f8fc')); sc.position.y = (1.5 + i * 0.75) * s; g.add(sc); } }
  outline(g, { px: 2.0 }); return g; }
function birch(s = 1) { const g = new THREE.Group(); const tr = cyl(0.14 * s, 0.18 * s, 6 * s, '#efece4', 0, 3 * s, 0, 10); g.add(tr);
  for (let i = 0; i < 6; i++) { const b = cyl(0.15 * s, 0.15 * s, 0.06 * s, '#3a3430', 0, (0.6 + i * 0.9) * s, 0, 10); b.scale.x = 1.05; g.add(b); } outline(g, { px: 2.0 }); return g; }
// forestFloor(st, { snow 0..1, spring, seed, pond: [x,z] }) — leaf litter forest floor (winter: snow on everything; spring: grass, flowers, pond)
export function forestFloor(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4); const snow = o.snow ?? 0, spring = !!o.spring;
  const ground = new THREE.Color(spring ? '#7fbf5a' : '#8a6a42').lerp(new THREE.Color('#f2f6fa'), snow);
  const fl = floor(240, 240, '#' + ground.getHexString(), 0, -60); fl.receiveShadow = true; g.add(fl);
  // leaf litter (instanced flat leaves); dusted white under snow
  const n = spring ? 160 : 700; const geo = new THREE.CircleGeometry(0.16, 6); geo.rotateX(-Math.PI / 2); geo.scale(1, 1, 0.55);
  const lm = new THREE.InstancedMesh(geo, toon('#ffffff'), n); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
  for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 22, z = 4 - r() * 20; if (o.pond && Math.hypot(x - o.pond[0], z - o.pond[1]) < 2.3) { m4.makeScale(0, 0, 0); lm.setMatrixAt(i, m4); continue; }
    e.set((r() - 0.5) * 0.3, r() * 6, (r() - 0.5) * 0.3); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, 0.01 + r() * 0.03, z), q, new THREE.Vector3(1 + r() * 0.6, 1, 1 + r() * 0.6)); lm.setMatrixAt(i, m4);
    lm.setColorAt(i, col.set(spring ? (i % 2 ? '#6aae4a' : '#8ac860') : leafCols[i % 5]).lerp(new THREE.Color('#f4f8fc'), snow * (0.75 + r() * 0.25))); }
  lm.receiveShadow = true; lm.userData.noOutline = true; g.add(lm);
  // trees
  const trees = [[-5, -9, 1.2, 's'], [5.5, -11, 1.4, 's'], [-9, -16, 1.6, 'b'], [9, -17, 1.2, 'b'], [-2.5, -20, 1.8, 's'], [3, -24, 1.6, 's'], [-12, -24, 1.4, 's'], [13, -26, 1.8, 's'], [0.5, -14, 1.1, 'b'], [-6.5, -13, 1.0, 'b']];
  trees.forEach(([x, z, s, k]) => { const t = k === 's' ? spruce(s, snow > 0.5) : birch(s); t.position.set(x, 0, z); t.rotation.y = r() * 3; g.add(t); });
  // fallen log + rocks
  const lg = cyl(0.35, 0.38, 3.4, '#6a4a2e', -2.6, 0.33, -2.8, 14); lg.rotation.z = Math.PI / 2; lg.rotation.y = 0.4; g.add(lg); outline(lg, { px: 2.4 });
  if (snow > 0.5) { const sl = cyl(0.3, 0.3, 3.3, '#f4f8fc', -2.6, 0.55, -2.8, 12); sl.rotation.z = Math.PI / 2; sl.rotation.y = 0.4; sl.scale.z = 0.5; g.add(sl); }
  for (let i = 0; i < 7; i++) { const x = (r() - 0.5) * 14, z = -2 - r() * 10; if (Math.abs(x) < 2) continue; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + r() * 0.4, 0), toon(snow > 0.5 ? '#e8eef4' : '#8a8a86')); m.position.set(x, 0.15, z); m.scale.y = 0.6; m.castShadow = true; g.add(m); outline(m, { px: 2 }); }
  if (snow > 0.3) for (let i = 0; i < 16; i++) { const x = (r() - 0.5) * 18, z = 2 - r() * 16; if (Math.abs(x) < 1.6 && z > -2) continue; const d = ball(0.5 + r() * 0.7, '#f4f8fc', x, 0, z, 14); d.scale.y = 0.35; d.userData.noOutline = true; g.add(d); }
  let pond = null; if (o.pond) { pond = new THREE.Group(); pond.position.set(o.pond[0], 0.02, o.pond[1]); g.add(pond);
    const w = new THREE.Mesh(new THREE.CircleGeometry(2.0, 40), toon('#4aa8d8', { emissive: new THREE.Color('#3a90c0'), emissiveIntensity: 0.15 })); w.rotation.x = -Math.PI / 2; w.userData.noOutline = true; pond.add(w);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.12, 6, 40), toon('#6a8a4a')); rim.rotation.x = -Math.PI / 2; pond.add(rim);
    for (let i = 0; i < 4; i++) { const a = i * 1.7 + 0.4; const p = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16, 0.3, Math.PI * 1.8), toon('#5aa84a')); p.rotation.x = -Math.PI / 2; p.position.set(Math.cos(a) * 1.2, 0.02, Math.sin(a) * 1.2); pond.add(p); }
    outline(pond, { px: 2 }); }
  if (spring) { const fc = ['#ff6a8a', '#ffd23a', '#ffffff', '#b07aff']; for (let i = 0; i < 30; i++) { const f = new THREE.Group(); const x = (r() - 0.5) * 16, z = 2 - r() * 14; if (Math.abs(x) < 1.6 && z > -2) continue; if (o.pond && Math.hypot(x - o.pond[0], z - o.pond[1]) < 2.4) continue;
    f.position.set(x, 0, z); f.add(cyl(0.025, 0.025, 0.5, '#4a8a3a', 0, 0.25, 0, 6)); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; f.add(ball(0.08, fc[i % 4], Math.cos(a) * 0.09, 0.52, Math.sin(a) * 0.09, 8)); } f.add(ball(0.06, '#ffb020', 0, 0.54, 0.02, 8)); g.add(f); } }
  const sky = sunnySky(st, spring ? { clouds: 8, seed: o.seed || 3 } : { top: '#7f9cc0', mid: '#b8cce0', horizon: '#eef2f6', glow: 0.15, clouds: 6, cloudColor: '#e8eef4', seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, pond, update(t) { sky.update(t); } };
}
export function winterStage(T, o = {}) { return toonStage(T, { light: 'day', fov: o.fov || 36, shadowSize: 8, target: [0, 0, 0], bg: ['#7f9cc0', '#eef2f6'], fog: [14, 60, '#dfe8f2'],
  key: ['#f2f6ff', 2.3, [-6, 11, 7]], fill: ['#bcd4ff', 0.6, [8, 4, 6]], ambient: 1.2, sky: '#e4eeff', ground: '#c8d4e2', ...o.stage }); }
export function springStage(T, o = {}) { return toonStage(T, { light: 'sunny', fov: o.fov || 36, shadowSize: 8, target: [0, 0, 0], ...o.stage }); }
// the Arctic Circle signpost with a dashed line across the snow
export function arcticSign() { const g = new THREE.Group(); g.add(cyl(0.08, 0.09, 2.6, '#7a5a3a', 0, 1.3, 0, 8));
  const tex = canvasTex(512, 220, (c, W, H) => { c.fillStyle = '#1f5fa8'; c.fillRect(0, 0, W, H); c.strokeStyle = '#ffffff'; c.lineWidth = 10; c.strokeRect(12, 12, W - 24, H - 24); c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '900 88px Nunito'; c.fillText('ARCTIC', W / 2, H * 0.33); c.fillText('CIRCLE', W / 2, H * 0.7); });
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.82, 0.08), [toon('#1f5fa8'), toon('#1f5fa8'), toon('#1f5fa8'), toon('#1f5fa8'), new THREE.MeshBasicMaterial({ map: tex }), toon('#1f5fa8')]); b.position.y = 2.3; b.castShadow = true; g.add(b);
  for (let i = -14; i <= 14; i++) { if (i % 2) continue; g.add(rbox(0.5, 0.03, 0.12, '#2a7ad0', i * 0.5, 0.02, 0.6, 0.01)); }
  outline(g, { px: 2.4 }); return g; }

// ---------- 2D overlays ----------
export function snowfall(g, t, k = 1, o = {}) { if (k <= 0) return; g.save(); g.fillStyle = `rgba(255,255,255,${0.85 * k})`; const n = o.n || 70;
  for (let i = 0; i < n; i++) { const sp = 40 + (i % 5) * 22; const x = ((i * 157.3 + Math.sin(t * 0.8 + i) * 40) % E.W + E.W) % E.W, y = ((i * 271.7 + t * sp * (o.speed || 1)) % (E.H + 40)) - 20; g.beginPath(); g.arc(x, y, 3 + (i % 4) * 1.6, 0, 7); g.fill(); } g.restore(); }
// frost vignette on the frame edges (frozen moments)
export function frostEdge(g, k) { if (k <= 0) return; g.save(); const gr = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.25, E.W / 2, E.H / 2, E.H * 0.62); gr.addColorStop(0, 'rgba(220,245,255,0)'); gr.addColorStop(1, `rgba(220,245,255,${0.55 * k})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }
function snowflake(g, x, y, s, rot = 0, col = '#ffffff') { g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = col; g.lineWidth = Math.max(3, s * 0.12); g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s); g.moveTo(0, -s * 0.55); g.lineTo(s * 0.25, -s * 0.8); g.moveTo(0, -s * 0.55); g.lineTo(-s * 0.25, -s * 0.8); g.stroke(); } g.restore(); }
export { snowflake };
// vitals monitor card: flat-lining EKG + NO HEARTBEAT / NO BREATHING / NO BLOOD FLOW (each item lands on its word time)
export function vitalsCard(g, t, times) {
  const p = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(p, p);
  const W = 860, H = 980; g.fillStyle = '#10161e'; g.strokeStyle = '#2a1c15'; g.lineWidth = 12; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 40); g.fill(); g.stroke();
  g.fillStyle = '#1a2a22'; g.beginPath(); g.roundRect(-W / 2 + 40, -H / 2 + 40, W - 80, 300, 20); g.fill();
  // EKG: two beats then flat
  g.save(); g.beginPath(); g.rect(-W / 2 + 40, -H / 2 + 40, W - 80, 300); g.clip(); g.strokeStyle = '#4aff8a'; g.lineWidth = 8; g.lineJoin = 'round'; g.shadowColor = '#4aff8a'; g.shadowBlur = 12;
  const x0 = -W / 2 + 40, y0 = -H / 2 + 190, flatAt = times[0]; const span = W - 80; const head = Math.min(1, t / 0.9) * span;
  g.beginPath(); g.moveTo(x0, y0); for (let x = 0; x <= head; x += 6) { const tt = x / span * 0.9; let y = 0; if (tt < flatAt) { const ph = (tt * 3) % 1; y = ph > 0.4 && ph < 0.46 ? -110 : ph > 0.46 && ph < 0.52 ? 60 : 0; } g.lineTo(x0 + x, y0 + y); } g.stroke(); g.restore();
  const labs = ['HEARTBEAT', 'BREATHING', 'BLOOD FLOW'];
  labs.forEach((l, i) => { const a = clamp((t - times[i]) / 0.2); const y = -H / 2 + 440 + i * 165; g.globalAlpha = 0.35 + 0.65 * a;
    TXT(g, (a > 0 ? 'NO ' : '') + l, -W / 2 + 90, y, 76, { color: '#ffffff', align: 'left', maxW: 600 });
    if (a > 0) { const k = ease.outBack(a); g.save(); g.translate(W / 2 - 110, y); g.scale(k, k); g.strokeStyle = '#ff3b30'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, -40); g.lineTo(40, 40); g.moveTo(40, -40); g.lineTo(-40, 40); g.stroke(); g.restore(); } });
  g.globalAlpha = 1; g.restore();
}
// cell card: cells packed with sugar; ice only forms in the gaps between them
export function cellCard(g, t, o = {}) {
  const p = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, E.H * 0.38); g.scale(p, p);
  const W = 860, H = 800; g.fillStyle = '#163a5c'; g.strokeStyle = '#2a1c15'; g.lineWidth = 12; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 40); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.roundRect(-W / 2 + 6, -H / 2 + 6, W - 12, H - 12, 36); g.clip();
  // ice in the gaps
  const ic = clamp((t - (o.iceAt ?? 0.3)) / 0.6); const r = rng(7);
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * W, y = (r() - 0.5) * H; snowflake(g, x, y, 26 * ic, t * 0.3 + i, '#dff6ff'); }
  const cells = [[-200, -180], [190, -190], [-5, 15], [-220, 210], [205, 200]];
  cells.forEach(([cx, cy], i) => { const R = 150; g.fillStyle = '#ff9ab0'; g.strokeStyle = '#2a1c15'; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#c85a7a'; g.beginPath(); g.arc(cx + 30, cy - 30, 34, 0, Math.PI * 2); g.fill();
    const sc = clamp((t - (o.sugarAt ?? 0)) / 0.5); const rr = rng(20 + i); for (let k = 0; k < 9; k++) { if (k / 9 > sc) break; const a = rr() * 6.28, d = rr() * 100; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d + Math.sin(t * 4 + k) * 4;
      g.fillStyle = '#ffffff'; g.strokeStyle = '#2a1c15'; g.lineWidth = 4; g.save(); g.translate(x, y); g.rotate(t + k); g.fillRect(-13, -13, 26, 26); g.strokeRect(-13, -13, 26, 26); g.restore(); } });
  g.restore(); g.restore();
  TXT(g, 'SUGAR INSIDE THE CELLS', E.W / 2, E.H * 0.38 - 400 - 70, 64, { color: '#ffffff', stroke: '#2a1c15', maxW: E.W * 0.9 });
  if (t > (o.iceAt ?? 0.3)) TXT(g, 'ICE ONLY BETWEEN THEM', E.W / 2, E.H * 0.38 + 400 + 70, 64, { color: '#bfe8ff', stroke: '#2a1c15', maxW: E.W * 0.9, a: clamp((t - (o.iceAt ?? 0.3)) / 0.3) });
}
// night tint + moon / day sun for the freeze-thaw cycle
export function dayNight(g, night) { if (night > 0) { g.save(); g.fillStyle = `rgba(10,20,60,${0.5 * night})`; g.fillRect(0, 0, E.W, E.H); g.restore(); } }
