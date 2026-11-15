// Mike the Headless Chicken (1945-47) — shared assets. EMOTION: WTF -> LOL. Deadpan narrator.
// Tone guard: NO blood, NO gore, no wound. Mike's neck is a clean, round, feathered stump with a tiny cream bandage collar and a
// red bow tie (showbiz). The axe is never shown hitting anything. The death is said once in the VO and never shown.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };

// ---------------------------------------------------------------- MIKE
// mike(o): a plump white Wyandotte-ish toon rooster with NO head: the neck ends in a smooth rounded stump, a cream bandage collar
// and a little red bow tie. .update(t, { strut, walk, bow, wiggle, proud }) animates; faces +Z like the beans; ~1.6 units tall.
export function mike(o = {}) {
  const g = new THREE.Group(); const white = toon(o.color || '#f7f3ea'), cream = toon('#efe2c6'), leg = toon('#f2b632'), shade = toon('#e4dccd');
  const body = new THREE.Group(); body.position.y = 0.78; g.add(body);
  const torso = mesh(sph, white, 0.5, 0.48, 0.62); body.add(torso);
  const breast = mesh(sph, white, 0.42, 0.42, 0.36); breast.position.set(0, 0.06, 0.32); body.add(breast);
  const tail = new THREE.Group(); tail.position.set(0, 0.28, -0.5); body.add(tail);
  [[0, 0.32, -0.5, '#3a3a44'], [-0.12, 0.26, -0.42, '#2f4a3a'], [0.12, 0.26, -0.42, '#3a3a44'], [0, 0.18, -0.25, '#f7f3ea']].forEach(([x, y, r, c]) => { const f = mesh(sph, toon(c), 0.1, 0.36, 0.16); f.position.set(x, y, 0); f.rotation.x = r; tail.add(f); });
  const wings = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(s * 0.42, 0.08, 0.02); const w = mesh(sph, shade, 0.12, 0.3, 0.42); w.position.y = -0.08; pv.add(w); body.add(pv); return { pv, s }; });
  // neck + stump (no head): smooth, round, feathered; bandage collar + bow tie
  const neck = new THREE.Group(); neck.position.set(0, 0.32, 0.36); body.add(neck);
  const nk = mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.42, 20), white); nk.position.y = 0.2; nk.rotation.x = 0.25; neck.add(nk);
  const cap = mesh(sph, white, 0.15, 0.1, 0.15); cap.position.set(0, 0.41, 0.05); neck.add(cap);
  const band = mesh(new THREE.TorusGeometry(0.155, 0.04, 10, 24), cream); band.position.set(0, 0.34, 0.04); band.rotation.x = Math.PI / 2 + 0.25; neck.add(band);
  const bow = new THREE.Group(); bow.position.set(0, 0.06, 0.2); neck.add(bow);
  for (const s of [-1, 1]) { const b = mesh(new THREE.ConeGeometry(0.08, 0.16, 12), toon(o.bow || '#d8382a')); b.rotation.z = s * Math.PI / 2; b.position.x = s * 0.08; bow.add(b); }
  bow.add(mesh(sph, toon(o.bow || '#d8382a'), 0.045, 0.045, 0.045));
  if (o.bow === false) bow.visible = false;
  // legs
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(s * 0.17, 0.5, 0); g.add(L); const sh = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), leg); sh.position.y = -0.25; L.add(sh);
    const foot = new THREE.Group(); foot.position.y = -0.5; L.add(foot); for (const a of [-0.45, 0, 0.45]) { const toe = mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.2, 6), leg); toe.rotation.x = Math.PI / 2; toe.rotation.y = a; toe.position.set(Math.sin(a) * 0.09, 0, Math.cos(a) * 0.09); foot.add(toe); } return L; });
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.01; sh.userData.noOutline = true; g.add(sh);
  outline(g, { px: 3 });
  g.parts = { body, neck, wings, legs, tail, bow };
  g.update = (t, p = {}) => {
    const { strut = 0, walk = 0, bow: bw = 0, wiggle = 0, proud = 0, flap = 0 } = p;
    const sp = 2.4, ph = t * sp * Math.PI * 2, mv = Math.max(strut, walk);
    legs.forEach((L, i) => { L.rotation.x = mv * 0.55 * Math.sin(ph + i * Math.PI); });
    body.position.y = 0.78 + mv * 0.05 * Math.abs(Math.sin(ph)) - bw * 0.12;
    body.rotation.x = -0.08 * proud + bw * 0.55 + 0.04 * Math.sin(ph) * strut;
    body.rotation.z = strut * 0.08 * Math.sin(ph) + wiggle * 0.14 * Math.sin(t * 22);
    neck.position.z = 0.36 + strut * 0.08 * Math.sin(ph * 2) + walk * 0.05 * Math.sin(ph * 2);
    tail.rotation.x = wiggle * 0.3 * Math.sin(t * 18) + strut * 0.1 * Math.sin(ph);
    wings.forEach(({ pv, s }) => { pv.rotation.z = s * (flap * (0.5 + 0.6 * Math.sin(t * 30)) + proud * 0.25); });
  };
  g.update(0); return g;
}
export function farmer(o = {}) {
  const b = bean({ name: 'Farmer', outfit: 'uniform', colors: { main: o.main || '#3f6fa8', trim: '#d8c070', belt: '#5a3a1e' }, skin: o.skin || 'fair', hair: 'bowl', hairColor: '#6a4a2a', seed: o.seed || 13 });
  const hat = new THREE.Group(); const straw = toon('#e9c97a'); hat.add(mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.34, 20), straw)); const brim = mesh(new THREE.CylinderGeometry(0.82, 0.86, 0.04, 28), straw); brim.position.y = -0.14; hat.add(brim);
  const rib = mesh(new THREE.CylinderGeometry(0.425, 0.425, 0.08, 20), toon('#b8432f')); rib.position.y = -0.08; hat.add(rib);
  hat.position.y = 0.5; hat.rotation.x = -0.1; outline(hat, { px: 3 }); b.parts.head.add(hat); b.hat = hat; return b;
}
export function townie(o = {}) {
  return bean({ name: 'Townie', outfit: o.outfit || 'tee', colors: { main: o.main || '#e86a6a', trim: '#ffffff', print: o.print || '#f6d04a' }, skin: o.skin || 'light', hair: o.hair || 'curly', hairColor: o.hairColor || '#5a3418',
    head: o.head || 'none', headColor: o.headColor, seed: o.seed || 31, scale: o.scale || 1 });
}
// a plain hen (with head) for the farmyard line-up
export const hen = (o = {}) => PR.chicken({ color: o.color || '#f2ddb8', comb: '#d63a2e' });
export function eyedropper() {
  const g = new THREE.Group(); const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 14), toon('#cfeaff', { transparent: true, opacity: 0.7 })); glass.castShadow = true; g.add(glass);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 14), toon('#cfeaff', { transparent: true, opacity: 0.7 })); tip.rotation.x = Math.PI; tip.position.y = -0.34; g.add(tip);
  const milk = cyl(0.045, 0.045, 0.3, '#fbf8ee', 0, -0.08, 0, 12); g.add(milk);
  const bulb = ball(0.11, '#d8382a', 0, 0.32, 0, 16); bulb.scale.y = 1.4; g.add(bulb);
  outline(g, { px: 2.4 }); return g;
}

// ---------------------------------------------------------------- SETS
// stage(st): a small theatre stage, red curtains, footlights, dark house; spotlight cone from above on the stage centre
export function theatre(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const boards = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#9a6a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a4e28'; for (let i = 0; i < 8; i++) x.fillRect(0, i * 32, w, 3); });
  boards.wrapS = boards.wrapT = THREE.RepeatWrapping; boards.repeat.set(4, 2);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(12, 1.0, 6), [toon('#6a3a1e'), toon('#6a3a1e'), toon('#ffffff', { map: boards }), toon('#6a3a1e'), toon('#5a2e16'), toon('#5a2e16')]); fl.position.set(0, -0.5, -1); fl.receiveShadow = true; g.add(fl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), toon('#7a1e2a')); back.position.set(0, 3.5, -4); g.add(back);
  for (let i = 0; i < 14; i++) { const f = cyl(0.22, 0.22, 9, i % 2 ? '#a3262e' : '#8a1e28', -6.5 + i, 3.5, -3.8, 10); g.add(f); }
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const c = cyl(0.3, 0.38, 8.5, '#b8303a', s * (4.4 + i * 0.5), 3.8, -0.5 + i * 0.2, 12); g.add(c); }
  const valance = rbox(13, 1.1, 0.4, '#b8303a', 0, 7.4, 0.2, 0.15); g.add(valance);
  for (let i = 0; i < 9; i++) g.add(ball(0.1, '#ffe9a0', -4 + i, 0.02, 1.9, 10));
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), new THREE.MeshBasicMaterial({ color: '#fff3c0', transparent: true, opacity: 0.35, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.012, 0); pool.userData.noOutline = true; g.add(pool);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 9, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#fff6d0', transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); cone.position.set(0, 4.5, 0); cone.userData.noOutline = true; g.add(cone);
  if (o.banner !== false) { const tx = canvasTex(1024, 220, (x, w, h) => { x.fillStyle = '#f2d36a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a1e2a'; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#7a1e2a'; x.font = '900 120px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MIRACLE MIKE', w / 2, h / 2 + 6, w - 60); });
    const bn = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.3), toon('#ffffff', { map: tx })); bn.position.set(0, 6.0, -3.1); bn.userData.noOutline = true; g.add(bn); }
  outline(g, { px: 2.2 });
  return { group: g, pool, cone };
}
// farm(st): 1945 farmyard: dirt yard, red barn, wooden fence, sunny sky with Colorado-ish mesas
export function farm(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(80, 60, '#b89a6a', 0, -10)); const grass = floor(80, 30, '#8ab85a', 0, -30); grass.position.y = 0.01; g.add(grass);
  const barn = new THREE.Group(); barn.add(rbox(6, 4, 5, '#b8382e', 0, 2, 0, 0.08)); const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 3.9, 2.2, 4, 1), toon('#5a3a2a')); roof.rotation.y = Math.PI / 4; roof.scale.set(1.1, 1, 0.92); roof.position.y = 5.1; roof.castShadow = true; barn.add(roof);
  barn.add(rbox(2.2, 2.8, 0.1, '#f2ece0', 0, 1.4, 2.52, 0.04)); barn.add(rbox(2.0, 0.12, 0.12, '#b8382e', 0, 1.4, 2.6, 0.03).rotateZ(0.9)); barn.add(rbox(2.0, 0.12, 0.12, '#b8382e', 0, 1.4, 2.6, 0.03).rotateZ(-0.9));
  barn.position.set(o.barnX ?? -5, 0, -9); barn.rotation.y = 0.3; g.add(barn);
  for (let i = 0; i < 9; i++) { g.add(cyl(0.1, 0.1, 1.3, '#8a5a32', -8 + i * 2, 0.65, -4, 8)); } g.add(rbox(16, 0.14, 0.08, '#8a5a32', 0, 1.0, -4, 0.03)); g.add(rbox(16, 0.14, 0.08, '#8a5a32', 0, 0.55, -4, 0.03));
  for (let i = 0; i < 4; i++) { const m = rbox(10 + i * 3, 5 + i, 4, ['#c98a5a', '#b87a4a', '#d89a6a', '#c08060'][i], -20 + i * 14, 2.5 + i * 0.5, -60 - i * 4, 0.6); g.add(m); }
  outline(g, { px: 2.2 });
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3 });
  return { group: g, sky, update(t) { sky.update(t); } };
}

// ---------------------------------------------------------------- 2D OVERLAYS
export const TOP_CAPTION = ['and went', 'on tour'];
export const TOP_UNTIL = 3.6;
export function topCaption(g, t, info) {
  const T = info.shot.start + t; if (T > TOP_UNTIL) return; const fade = clamp((TOP_UNTIL - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  TOP_CAPTION.forEach((l, i) => { g.save(); g.translate(E.W / 2, 172 + i * 100); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 96 : 80, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
export function stamp(g, t, text, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = lerp(2.4, 1, ease.out(k)); const x = o.x ?? E.W / 2, y = o.y ?? 760; const w = o.w || 600;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(s, s); g.globalAlpha = clamp(k * 1.4) * 0.95; g.lineJoin = 'round';
  g.fillStyle = o.fill || 'rgba(255,248,236,.85)'; g.strokeStyle = o.color || '#d8281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-w / 2, -90, w, 180, 22); g.fill(); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2 + 18, -72, w - 36, 144, 16); g.stroke();
  insT(g, text, 0, 6, o.size || 110, { color: o.color || '#d8281e', stroke: null, maxW: w - 50 }); g.restore();
}
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420;
  g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(k, k); g.globalAlpha = 0.95; g.lineJoin = 'round';
  g.fillStyle = 'rgba(255,248,236,.88)'; g.strokeStyle = '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-140, -60, 280, 120, 18); g.fill(); g.stroke();
  insT(g, String(year), 0, 4, 92, { color: '#e23b2e', stroke: null }); g.restore();
}
// cartoon x-ray of the neck: a dotted "axe line" that clearly MISSES the jugular and the brain stem. Diagram only, no injury drawn.
export function xray(g, t, info, cues) {
  const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#0e2a3a'); gr.addColorStop(1, '#06141e'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.strokeStyle = 'rgba(120,220,255,.08)'; g.lineWidth = 2; for (let x = 0; x < E.W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); } for (let y = 0; y < E.H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); } g.restore();
  const k = ease.outBack(clamp(t / 0.3)); g.save(); g.translate(E.W / 2, 900); g.scale(k, k); g.lineJoin = 'round'; g.lineCap = 'round';
  const glowS = (w, c) => { g.strokeStyle = c; g.lineWidth = w; g.stroke(); };
  // chicken outline (body + neck + head), drawn as a glowing x-ray silhouette
  g.beginPath(); g.ellipse(0, 260, 300, 230, 0, 0, 7); glowS(10, '#8fe0ff');
  g.beginPath(); g.moveTo(-60, 70); g.quadraticCurveTo(-90, -160, -40, -330); g.moveTo(70, 80); g.quadraticCurveTo(90, -160, 60, -330); glowS(10, '#8fe0ff');
    // brain stem (kept) + jugular (kept): bright, labelled
  g.beginPath(); g.moveTo(10, -330); g.lineTo(10, -120); glowS(26, '#ffd25a');
  g.beginPath(); g.moveTo(45, -310); g.quadraticCurveTo(70, -100, 40, 120); glowS(16, '#7aff9a');
  // the axe line: dashed, above both
  const kc = clamp((t - (cues.miss ?? 0.4)) / 0.3); g.save(); g.setLineDash([28, 20]); g.beginPath(); g.moveTo(-260, -330); g.lineTo(lerp(-260, 260, kc), lerp(-330, -360, kc)); glowS(12, '#ff8a6a'); g.restore();
  g.restore();
  const lab = (txt, x, y, col, tt) => { if (t < tt) return; const kk = ease.outBack(clamp((t - tt) / 0.2)); g.save(); g.translate(x, y); g.scale(kk, kk); insT(g, txt, 0, 0, 56, { color: col, stroke: CARD_INK, maxW: 560 }); g.restore(); };
  lab('AXE LINE', E.W / 2 + 300, 520, '#ff8a6a', cues.miss ?? 0.4);
  lab('JUGULAR: MISSED ✓', E.W / 2, 1600, '#7aff9a', cues.jug ?? 0.6);
  lab('BRAIN STEM: MOSTLY THERE ✓', E.W / 2, 1700, '#ffd25a', cues.stem ?? 1.2);
}
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, canvasTex, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, sunnySky, mesh };
