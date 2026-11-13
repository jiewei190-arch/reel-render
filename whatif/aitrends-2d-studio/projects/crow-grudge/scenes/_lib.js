// The Crow Grudge — shared 3D assets: toon crows (adult + baby), the rubber caveman mask, the "Dick Cheney" rubber mask,
// the campus quad, tree branches, the lab, a telephone wire, the net, the crayon WANTED poster, a tiny gravestone,
// plus 2D overlay helpers (mask icon, year stamp, hook text). Underscore = not auto-loaded by the player.
// Tone guard: comedy only. Crows scold and swoop; nobody is ever hurt. The "dive-bomb" is a bonk-free swoop past the head.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

// word time inside the current shot (seconds from shot start), with a fallback
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- CROW
// crow({ seed, scale, baby, color }) — faces +Z, feet on y = 0, ~1.05 units tall (baby ~0.6). Big lidded cartoon eyes.
// .update(t, { lid, lidAngle, look:[x,y], headTurn, headTilt, headNod, beak 0..1 (scream), flap 0..1, wingL, wingR (0..1 raise/point), hop, peck, blink, shrug })
function lidEye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.12, size * 0.62); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#120c10')); p.scale.set(0.42, 0.46, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.11, 0.11, 0.05); gl.position.set(0.13, 0.17, 0.99); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}
export function crow(o = {}) {
  const { seed = 1, scale = 1, baby = false } = o; const r = rng(seed);
  const C = o.color || (baby ? '#3d4456' : '#262b38'), C2 = shadeHex(C, 0.12), C3 = shadeHex(C, -0.18), lidC = shadeHex(C, 0.22);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale * (baby ? 0.56 : 1)); root.add(g);
  const bm = toon(C), bm2 = toon(C2), bm3 = toon(C3);
  const bodyG = new THREE.Group(); bodyG.position.y = 0.5; g.add(bodyG);
  const body = mesh(sph, bm, 0.31, 0.34, 0.42); body.rotation.x = -0.35; bodyG.add(body);
  const belly = mesh(sph, bm2, 0.24, 0.26, 0.2); belly.position.set(0, -0.04, 0.22); bodyG.add(belly);
  // tail fan
  const tail = new THREE.Group(); tail.position.set(0, -0.08, -0.36); bodyG.add(tail);
  for (const a of [-0.32, 0, 0.32]) { const f = mesh(sph, bm3, 0.09, 0.03, 0.3); f.position.set(Math.sin(a) * 0.12, 0, -0.18); f.rotation.y = a; tail.add(f); }
  tail.rotation.x = 0.45;
  // wings: pivot at the shoulder, the wing hangs back along the body
  const wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.27, 0.1, 0.1); bodyG.add(p);
    const w = mesh(sph, bm3, 0.06, 0.2, 0.34); w.position.set(s * 0.02, -0.06, -0.16); w.rotation.x = -0.25; p.add(w);
    for (let i = 0; i < 3; i++) { const f = mesh(sph, bm, 0.045, 0.06, 0.16); f.position.set(s * 0.02, -0.18 + i * 0.05, -0.42 - i * 0.03); p.add(f); }
    return { p, s }; });
  // head
  const head = new THREE.Group(); head.position.set(0, 0.36, 0.2); bodyG.add(head);
  const HS = baby ? 1.45 : 1; head.scale.setScalar(HS);
  const hs = mesh(sph, bm, 0.24, 0.23, 0.24); head.add(hs);
  if (baby) for (let i = 0; i < 3; i++) { const tuft = mesh(new THREE.ConeGeometry(0.035, 0.12, 6), bm2); tuft.position.set((i - 1) * 0.05, 0.25, -0.02); tuft.rotation.z = (i - 1) * -0.4; head.add(tuft); }
  // beak: upper + lower halves (lower opens for the scream)
  const bkC = toon(baby ? '#e0b24a' : '#4a4652');
  const up = mesh(new THREE.ConeGeometry(0.075, baby ? 0.16 : 0.3, 12).rotateX(Math.PI / 2), bkC, 1, 0.75, 1); up.position.set(0, -0.01, 0.3 - (baby ? 0.07 : 0)); head.add(up);
  const loP = new THREE.Group(); loP.position.set(0, -0.045, 0.18); head.add(loP);
  const lo = mesh(new THREE.ConeGeometry(0.06, baby ? 0.12 : 0.24, 12).rotateX(Math.PI / 2), toon(shadeHex(baby ? '#e0b24a' : '#4a4652', -0.15)), 1, 0.55, 1); lo.position.set(0, 0, 0.1 - (baby ? 0.05 : 0)); loP.add(lo);
  const mouthIn = mesh(sph, flat('#7a2030'), 0.05, 0.02, 0.1); mouthIn.position.set(0, -0.03, 0.2); mouthIn.userData.noOutline = true; head.add(mouthIn); mouthIn.visible = false;
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.105, 0.06, 0.17), new THREE.Vector3(s * 0.55, 0.1, 0.83).normalize(), 0.105, lidC));
  // legs + toes
  const lm = toon('#3a3640'); const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(s * 0.1, 0.22, 0.04); g.add(L);
    const sh = mesh(new THREE.CylinderGeometry(0.022, 0.02, 0.22, 8).translate(0, -0.11, 0), lm); L.add(sh);
    const ft = new THREE.Group(); ft.position.y = -0.22; L.add(ft); for (const a of [-0.5, 0, 0.5]) { const toe = mesh(sph, lm, 0.018, 0.016, 0.07); toe.position.set(Math.sin(a) * 0.05, 0, Math.cos(a) * 0.05); toe.rotation.y = a; ft.add(toe); }
    const back = mesh(sph, lm, 0.016, 0.014, 0.05); back.position.set(0, 0, -0.05); ft.add(back); return L; });
  const bl = blob(0.35, 0.28); root.add(bl);
  outline(g, { px: 2.6 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.3; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { lid = 0.3, lidAngle = 0, look = [0, 0], headTurn = 0, headTilt = 0, headNod = 0, beak = 0, flap = 0, wingL = 0, wingR = 0, hop = 0, peck = 0, blink = true, shrug = 0, perch = false, ph = seed * 0.7 } = u;
    const fl = clamp(flap), w = (t * 4.5 + ph) * Math.PI * 2;
    wings.forEach((W, i) => { const raise = i ? wingL : wingR; const fa = fl * (0.6 + Math.sin(w) * 0.9);
      W.p.rotation.set(-raise * 0.9 - shrug * 0.4, 0, W.s * (fa + raise * 1.2 + shrug * 0.5)); });
    const pk = peck * Math.max(0, Math.sin(t * 5 + seed)) ** 3; const hp = hop ? Math.abs(Math.sin(t * 7 + ph)) * 0.12 * hop : 0;
    bodyG.position.y = 0.5 + hp + fl * Math.sin(w + 1) * 0.04 + noise(t * 0.8, seed) * 0.01; bodyG.rotation.x = pk * 0.6 + fl * 0.35;
    head.rotation.set(headNod + pk * 0.5 + Math.sin(t * 1.9 + seed) * 0.03, headTurn + noise(t * 0.9, seed + 3) * 0.06, -headTilt);
    loP.rotation.x = clamp(beak) * 0.75 + (beak > 0.2 ? Math.sin(t * 30) * 0.08 * beak : 0); mouthIn.visible = beak > 0.15;
    legs.forEach((L, i) => { L.rotation.x = fl * 0.9; L.position.y = 0.22 + (perch ? 0 : 0); });
    bl.visible = !perch && fl < 0.5;
    const b = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.45, look[0] * 0.55, 0); });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.24 * HS * scale * (baby ? 0.56 : 1);
  root.update(0); return root;
}
// a crow in flight swooping along a path: place each frame with flyAt(c, t, from, to, arc)
export function flyAt(c, k, from, to, arc = 1) { const p = new THREE.Vector3().lerpVectors(new THREE.Vector3(...from), new THREE.Vector3(...to), k); p.y += Math.sin(k * Math.PI) * arc; c.position.copy(p); const d = new THREE.Vector3(...to).sub(new THREE.Vector3(...from)); c.rotation.y = Math.atan2(d.x, d.z); }

// ---------------------------------------------------------------- MASKS
// cavemanMask(bean) — the rubber caveman face mask strapped over a bean's face (the bean's own face hides)
export function cavemanMask(b, o = {}) {
  const R = 0.48, head = b.parts.head; const m = new THREE.Group(); head.add(m);
  const skin = toon(o.skin || '#c48a58'), dark = toon('#7a4a2a'), hair = toon(o.hair || '#4a2a16'), hole = flat('#120a08');
  const plate = mesh(sph, skin, R * 0.9, R * 0.98, R * 0.5); plate.position.set(0, -R * 0.02, R * 0.62); m.add(plate);
  const brow = mesh(new THREE.CapsuleGeometry(R * 0.13, R * 0.75, 4, 10).rotateZ(Math.PI / 2), dark, 1, 1, 0.8); brow.position.set(0, R * 0.32, R * 1.02); m.add(brow);
  const uni = mesh(new THREE.CapsuleGeometry(R * 0.07, R * 0.7, 4, 10).rotateZ(Math.PI / 2), hair, 1, 0.9, 0.7); uni.position.set(0, R * 0.45, R * 1.04); uni.rotation.z = 0.04; m.add(uni);
  for (const s of [-1, 1]) { const e = mesh(sph, hole, R * 0.15, R * 0.11, R * 0.05); e.position.set(s * R * 0.3, R * 0.12, R * 1.08); e.userData.noOutline = true; m.add(e);
    const gl = mesh(sph, flat('#ffffff'), R * 0.035, R * 0.035, R * 0.02); gl.position.set(s * R * 0.3 + R * 0.04, R * 0.15, R * 1.12); gl.userData.noOutline = true; m.add(gl); }
  const nose = mesh(sph, toon('#b07546'), R * 0.3, R * 0.2, R * 0.22); nose.position.set(0, -R * 0.1, R * 1.12); m.add(nose);
  for (const s of [-1, 1]) { const n = mesh(sph, hole, R * 0.06, R * 0.04, R * 0.03); n.position.set(s * R * 0.11, -R * 0.2, R * 1.27); n.userData.noOutline = true; m.add(n); }
  const mouth = mesh(sph, flat('#2a0e0c'), R * 0.42, R * 0.15, R * 0.06); mouth.position.set(0, -R * 0.45, R * 1.0); mouth.userData.noOutline = true; m.add(mouth);
  for (let i = 0; i < 5; i++) { const tooth = rbox(R * 0.12, R * 0.12, R * 0.05, i === 1 ? '#e8d8a0' : '#f6efd8', (i - 2) * R * 0.15, -R * 0.37, R * 1.04, 0.01); tooth.userData.noOutline = true; m.add(tooth); }
  // shaggy hair fringe around the top edge of the mask + sideburns
  const rr = rng(4); for (let i = 0; i < 11; i++) { const a = Math.PI * (0.08 + 0.84 * i / 10); const tf = mesh(sph, hair, R * (0.17 + rr() * 0.05), R * (0.15 + rr() * 0.05), R * 0.17);
    tf.position.set(Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86 + R * 0.08, R * 0.82 - Math.abs(Math.cos(a)) * R * 0.15); m.add(tf); }
  for (const s of [-1, 1]) { const sb = mesh(sph, hair, R * 0.12, R * 0.3, R * 0.15); sb.position.set(s * R * 0.84, -R * 0.2, R * 0.7); m.add(sb); }
  const strap = mesh(new THREE.TorusGeometry(R * 1.0, R * 0.035, 6, 30), flat('#2a2020')); strap.rotation.x = Math.PI / 2; strap.position.y = R * 0.15; strap.userData.noOutline = true; m.add(strap);
  outline(m, { px: 2.6 });
  const P = b.parts; ['L', 'R'].forEach(k => { P.eyes[k].eg.visible = false; P.brows[k].bg.visible = false; }); if (P.mouth) P.mouth.visible = false;
  return m;
}
// cheneyMask() — a respectful rubber caricature on its own (a prop): older man, bald top, white side hair, rimless glasses, calm half smile.
export function cheneyMask(o = {}) {
  const R = 0.48, m = new THREE.Group(); const skin = toon('#ecc2a2'), skin2 = toon('#ddb090'), hair = toon('#e4e2dc'), ink = flat('#3a2a26');
  const dome = mesh(sph, skin, R * 0.98, R * 1.0, R * 0.92); m.add(dome);
  for (const s of [-1, 1]) { const j = mesh(sph, skin2, R * 0.3, R * 0.3, R * 0.3); j.position.set(s * R * 0.48, -R * 0.52, R * 0.5); m.add(j); }
  const rr = rng(9); for (let i = 0; i < 12; i++) { const a = Math.PI * (0.7 + i / 11 * 1.6); const v = new THREE.Vector3(Math.cos(a) * 0.95, 0.05 + rr() * 0.12, Math.sin(a) * -0.95); if (v.z > 0.4) continue; const b = mesh(sph, hair, R * 0.2, R * 0.2, R * 0.2); b.position.copy(v.multiplyScalar(R)); m.add(b); }
  for (const s of [-1, 1]) { const br = mesh(new THREE.CapsuleGeometry(R * 0.045, R * 0.2, 4, 8).rotateZ(Math.PI / 2), hair); br.position.set(s * R * 0.3, R * 0.3, R * 0.9); br.rotation.z = s * -0.12; m.add(br);
    const e = mesh(sph, ink, R * 0.07, R * 0.08, R * 0.03); e.position.set(s * R * 0.3, R * 0.12, R * 0.95); e.userData.noOutline = true; m.add(e);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.2, R * 0.022, 6, 24), toon('#c9c3b8')); ring.position.set(s * R * 0.3, R * 0.1, R * 0.99); ring.scale.y = 0.75; ring.userData.noOutline = true; m.add(ring); }
  const bridge = cyl(R * 0.015, R * 0.015, R * 0.2, '#c9c3b8', 0, R * 0.12, R * 1.02, 6); bridge.rotation.z = Math.PI / 2; bridge.userData.noOutline = true; m.add(bridge);
  const nose = mesh(sph, skin2, R * 0.13, R * 0.16, R * 0.14); nose.position.set(0, -R * 0.08, R * 1.0); m.add(nose);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(R * 0.2, R * 0.025, 6, 20, Math.PI * 0.7), ink); smile.rotation.z = Math.PI * 1.15; smile.position.set(0, -R * 0.32, R * 0.92); smile.userData.noOutline = true; m.add(smile);
  const neck = cyl(R * 0.5, R * 0.6, R * 0.35, '#ddb090', 0, -R * 1.0, 0); m.add(neck);
  outline(m, { px: 2.4 }); m.headR = R; return m;
}
// a caveman mask on its own (for the lab table + the WANTED poster reference)
export function cavemanProp() { const dummy = { parts: { head: new THREE.Group(), eyes: { L: { eg: {} }, R: { eg: {} } }, brows: { L: { bg: {} }, R: { bg: {} } } } }; const m = cavemanMask(dummy); const g = new THREE.Group(); g.add(dummy.parts.head); const cap = mesh(sph, toon('#3a2a24'), 0.44, 0.46, 0.44); g.add(cap); outline(g, { px: 2.4 }); return g; }
export function blankMask(color = '#f2efe8') { const g = new THREE.Group(); const R = 0.48; const d = mesh(sph, toon(color), R * 0.96, R * 1.02, R * 0.9); g.add(d); for (const s of [-1, 1]) { const e = mesh(sph, flat('#1a1414'), R * 0.12, R * 0.08, R * 0.03); e.position.set(s * R * 0.3, R * 0.1, R * 0.86); e.userData.noOutline = true; g.add(e); } outline(g, { px: 2.4 }); return g; }
export function maskStand(maskObj, h = 0.55) { const g = new THREE.Group(); g.add(cyl(0.05, 0.06, h, '#7a7a80', 0, h / 2, 0, 10), cyl(0.22, 0.25, 0.05, '#5a5a62', 0, 0.025, 0)); maskObj.position.y = h + 0.42; maskObj.scale.setScalar(0.85); g.add(maskObj); outline(g, { px: 2.2 }); g.mask = maskObj; return g; }

// the scientist (lab coat, green lanyard). opts.masked: 'caveman' | false. opts.gray: 0..1 hair greying (per-instance materials)
export function scientist(o = {}) {
  const b = bean({ name: 'Scientist', outfit: 'labcoat', colors: { lanyard: '#3a8a4a' }, skin: 'fair', hair: 'swoop', hairColor: '#5a3a22', browColor: '#3a2416', seed: o.seed || 11, glasses: !o.masked });
  if (o.masked === 'caveman') b.mask = cavemanMask(b);
  const hairMats = []; b.parts.hairG.traverse(x => { if (x.isMesh && !x.userData.isHull) { x.material = x.material.clone(); hairMats.push(x.material); } });
  b.setGray = (k) => hairMats.forEach(m => m.color.set('#5a3a22').lerp(new THREE.Color('#d8d6d0'), clamp(k)));
  if (o.gray) b.setGray(o.gray); return b;
}

// ---------------------------------------------------------------- SETS
// round toon tree
export function tree(o = {}) { const { h = 3.2, r = 1.5, seed = 1, leaf = '#5a9a42' } = o; const rr = rng(seed); const g = new THREE.Group();
  g.add(cyl(0.18, 0.26, h, '#7a5234', 0, h / 2, 0, 12)); for (let i = 0; i < 5; i++) { const b = ball(r * (0.55 + rr() * 0.25), i % 2 ? leaf : shadeHex(leaf, -0.1), (rr() - 0.5) * r, h + (rr() - 0.2) * r * 0.6, (rr() - 0.5) * r * 0.8, 18); g.add(b); }
  g.add(blob(r * 0.9, 0.25)); outline(g, { px: 2.2 }); return g; }
export function bench(o = {}) { const g = new THREE.Group(); const c = o.color || '#8a5a32';
  for (let i = 0; i < 3; i++) g.add(rbox(2.0, 0.07, 0.16, c, 0, 0.62, -0.18 + i * 0.18, 0.02)); for (let i = 0; i < 2; i++) g.add(rbox(2.0, 0.16, 0.06, c, 0, 0.95 + i * 0.22, -0.32, 0.02));
  for (const s of [-1, 1]) { g.add(rbox(0.08, 0.62, 0.5, '#3a3a40', s * 0.85, 0.31, -0.05, 0.02)); g.add(rbox(0.08, 0.6, 0.08, '#3a3a40', s * 0.85, 0.95, -0.34, 0.02)); }
  g.add(blob(1.2, 0.25)); outline(g, { px: 2.4 }); g.seatY = 0.66; return g; }
export function lampPost() { const g = new THREE.Group(); g.add(cyl(0.06, 0.08, 3.4, '#2e3440', 0, 1.7, 0, 10), ball(0.22, '#fff2c4', 0, 3.5, 0), cyl(0.26, 0.12, 0.12, '#2e3440', 0, 3.72, 0)); outline(g, { px: 2.2 }); return g; }
function brickTex(base = '#b25a3e') { return canvasTex(512, 512, (g, w, h) => { g.fillStyle = shadeHex(base, -0.3); g.fillRect(0, 0, w, h); const r = rng(3); for (let j = 0; j < 24; j++) for (let i = -1; i < 9; i++) { g.fillStyle = shadeHex(base, (r() - 0.5) * 0.14); g.fillRect((i + (j % 2) * 0.5) * 64 + 3, j * (h / 24) + 2, 58, h / 24 - 4); } }, { repeat: [3, 1] }); }
// campus(st, { seed, building, trees, people }) — a university quad: lawn, crossing stone paths, a brick hall with white windows, trees, benches, lamps
export function campus(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(140, 140, o.grass || '#7fb85a', 0, -20));
  const pathM = toon(o.path || '#ddd2b8'); for (const [w, d, x, z, ry] of [[3.2, 60, 0, -10, 0], [60, 2.6, 0, -2.5, 0]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), pathM); p.rotation.x = -Math.PI / 2; p.rotation.z = ry; p.position.set(x, 0.01, z); p.receiveShadow = true; p.userData.noOutline = true; g.add(p); }
  if (o.building !== false) { const bw = 26, bh = 8, bz = -20; const wall = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 3), toon('#ffffff', { map: brickTex() })); wall.position.set(0, bh / 2, bz); wall.castShadow = wall.receiveShadow = true; g.add(wall);
    g.add(box(bw + 0.4, 0.5, 3.3, '#e8dcc4', 0, bh, bz)); const roof = box(bw + 0.2, 1.6, 2.6, '#5a4a52', 0, bh + 0.9, bz - 0.2); g.add(roof);
    for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 8; i++) { const x = -bw / 2 + 1.8 + i * 3.2; g.add(box(1.3, 1.8, 0.1, '#cfe6f6', x, 2.4 + r2 * 3.2, bz + 1.52), box(1.6, 0.18, 0.2, '#f2ead8', x, 1.4 + r2 * 3.2, bz + 1.58)); }
    g.add(box(2.6, 3.4, 0.12, '#5a3a2a', 0, 1.7, bz + 1.53), box(3.4, 0.4, 0.4, '#f2ead8', 0, 3.6, bz + 1.6)); }
  const rr = rng(o.seed || 2); const trees = [];
  for (const [x, z, h] of o.trees || [[-8, -9, 3.4], [8.5, -11, 3.8], [-13, -4, 3.0], [13, -3, 3.2], [-5, -15, 3.6], [6, -16, 3.0]]) { const t = tree({ h, r: 1.4 + rr() * 0.5, seed: Math.floor(rr() * 99) }); t.position.set(x, 0, z); g.add(t); trees.push(t); }
  for (const [x, z, ry] of o.benches || [[-4.2, -4.4, 0], [4.6, -4.6, 0]]) { const b = bench(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b); }
  for (const [x, z] of o.lamps || [[-2.4, -6], [2.4, -6], [-2.4, 3], [2.4, 3]]) { const l = lampPost(); l.position.set(x, 0, z); g.add(l); }
  const sky = sunnySky(st, { clouds: 9, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, trees, update(t) { sky.update(t); } };
}
// branch(st, { len, y, z, x, leaves, seed }) — a thick horizontal branch (perch top at y), leaf clusters, for close shots against the sky
export function branch(o = {}) {
  const { len = 8, y = 0, seed = 5, leaves = 7, thick = 0.22 } = o; const g = new THREE.Group(); const rr = rng(seed);
  const b = cyl(thick * 0.8, thick, len, '#6e4a30', 0, y - thick, 0, 14); b.rotation.z = Math.PI / 2 + 0.03; g.add(b);
  for (let i = 0; i < 3; i++) { const tw = cyl(0.04, 0.07, 1.2, '#6e4a30', -len / 2 + 1.5 + i * 2.4, y + 0.3, -0.3, 8); tw.rotation.z = (rr() - 0.5) * 1.2; tw.rotation.x = -0.4; g.add(tw); }
  for (let i = 0; i < leaves; i++) { const l = ball(0.5 + rr() * 0.35, rr() < 0.5 ? '#5a9a42' : '#4c8a38', -len / 2 + rr() * len, y + 0.6 + rr() * 1.2, -0.8 - rr() * 1.2, 16); g.add(l); }
  outline(g, { px: 2.4 }); g.perchY = y; return g;
}
// nest on a branch
export function nest() { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.2, 10, 28), toon('#8a6038')); t.rotation.x = Math.PI / 2; t.scale.z = 0.9; t.castShadow = true; g.add(t);
  const bowl = ball(0.6, '#6e4a2a', 0, -0.05, 0); bowl.scale.y = 0.35; g.add(bowl); const rr = rng(3); for (let i = 0; i < 14; i++) { const a = rr() * 6.28; const tw = cyl(0.02, 0.02, 0.5, '#9a7046', Math.cos(a) * 0.6, 0.05 + rr() * 0.1, Math.sin(a) * 0.6, 5); tw.rotation.set(rr() * 1.5, a, Math.PI / 2 + (rr() - 0.5)); g.add(tw); }
  outline(g, { px: 2.2 }); return g; }

// a hanging fishing-net dome (the trap): .drop(k) 0 = up high, 1 = landed. Grid drawn on a texture so it reads at any size.
export function net(o = {}) {
  const tex = canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#efe6cf'; g.lineWidth = 7; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * w / 16, 0); g.lineTo(i * w / 16, h); g.stroke(); } for (let j = 0; j <= 8; j++) { g.beginPath(); g.moveTo(0, j * h / 8); g.lineTo(w, j * h / 8); g.stroke(); } });
  const mat = new THREE.MeshToonMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, gradientMap: null, color: '#ffffff' });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(o.r || 0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat); dome.castShadow = true; dome.userData.noOutline = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(o.r || 0.85, 0.045, 8, 36), toon('#7a6a5a')); rim.rotation.x = Math.PI / 2; rim.castShadow = true;
  const g = new THREE.Group(); g.add(dome, rim); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; g.add(ball(0.06, '#5a5a62', Math.cos(a) * (o.r || 0.85), 0, Math.sin(a) * (o.r || 0.85), 10)); }
  outline(rim, { px: 2.4 }); return g;
}
// crayon WANTED poster (plane with a canvas texture): a child's drawing of the caveman mask
export function wantedPoster(o = {}) {
  const tex = canvasTex(512, 640, (g, w, h) => {
    g.fillStyle = '#f3ead2'; g.fillRect(0, 0, w, h); const rr = rng(2); g.lineCap = 'round'; g.lineJoin = 'round';
    const crayon = (col, wd, pts) => { for (let k = 0; k < 3; k++) { g.strokeStyle = col; g.globalAlpha = 0.55; g.lineWidth = wd + rr() * 3; g.beginPath(); pts.forEach(([x, y], i) => { const j = (rr() - 0.5) * 5; i ? g.lineTo(x + j, y + j) : g.moveTo(x + j, y + j); }); g.stroke(); } g.globalAlpha = 1; };
    g.font = '900 96px "Fredoka", sans-serif'; g.textAlign = 'center'; g.fillStyle = '#c0392b'; g.fillText('WANTED', w / 2, 112);
    const cx = w / 2, cy = 360; const circ = (rx, ry, n = 40) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * 6.28) * rx, cy + Math.sin(i / n * 6.28) * ry]);
    crayon('#b0743c', 10, circ(150, 175)); for (let i = 0; i < 12; i++) { const a = Math.PI * (1.05 + i / 11 * 0.9); crayon('#3a2410', 12, [[cx + Math.cos(a) * 150, cy + Math.sin(a) * 175], [cx + Math.cos(a) * 200, cy + Math.sin(a) * 215]]); }
    crayon('#3a2410', 16, [[cx - 110, cy - 70], [cx + 110, cy - 72]]); for (const s of [-1, 1]) { g.fillStyle = '#1a1210'; g.beginPath(); g.ellipse(cx + s * 55, cy - 30, 18, 13, 0, 0, 7); g.fill(); }
    crayon('#8a5228', 10, circ(36, 26).map(([x, y]) => [x, y + 20])); crayon('#2a1010', 10, [[cx - 70, cy + 85], [cx - 30, cy + 100], [cx + 30, cy + 100], [cx + 70, cy + 85]]);
    for (let i = 0; i < 4; i++) crayon('#ffffff', 8, [[cx - 45 + i * 30, cy + 88], [cx - 45 + i * 30, cy + 104]]);
    crayon('#c0392b', 12, [[cx - 210, cy - 210], [cx + 210, cy + 220]]); crayon('#c0392b', 12, [[cx + 210, cy - 210], [cx - 210, cy + 220]]);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(o.w || 1.3, (o.w || 1.3) * 1.25), toon('#ffffff', { map: tex })); p.userData.noOutline = true; p.castShadow = true;
  const g = new THREE.Group(); g.add(p); const pin = ball(0.05, '#c0392b', 0, (o.w || 1.3) * 0.56, 0.03, 10); g.add(pin); return g;
}
// tiny cute gravestone with "2006" + a little flower
export function gravestone() {
  const tex = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#b8bcc4'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5e68'; g.font = '900 78px "Fredoka", sans-serif'; g.textAlign = 'center'; g.fillText('2006', w / 2, 190); g.font = '700 40px "Fredoka", sans-serif'; g.fillText('R.I.P.', w / 2, 100); });
  const g = new THREE.Group(); const st = rbox(0.42, 0.5, 0.12, '#b8bcc4', 0, 0.25, 0, 0.06); g.add(st); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.12, 24, 1, false, -Math.PI / 2, Math.PI), toon('#b8bcc4')); top.rotation.x = Math.PI / 2; top.rotation.y = Math.PI / 2; top.rotation.z = Math.PI / 2; top.position.y = 0.5; top.castShadow = true; g.add(top);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.45), toon('#ffffff', { map: tex })); face.position.set(0, 0.32, 0.062); face.userData.noOutline = true; g.add(face);
  const stem = cyl(0.008, 0.008, 0.22, '#4a8a3a', 0.28, 0.11, 0.05, 5); g.add(stem); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; g.add(ball(0.03, '#ffb0c8', 0.28 + Math.cos(a) * 0.035, 0.23 + Math.sin(a) * 0.035, 0.05, 8)); } g.add(ball(0.025, '#ffd84a', 0.28, 0.23, 0.07, 8));
  outline(g, { px: 2.2 }); return g;
}
// telephone pole + wire, wire along X at height y
export function wire(o = {}) { const { y = 0, len = 30 } = o; const g = new THREE.Group(); const w = cyl(0.025, 0.025, len, '#2a2a30', 0, y, 0, 6); w.rotation.z = Math.PI / 2; g.add(w); const w2 = cyl(0.02, 0.02, len, '#2a2a30', 0, y + 0.7, -0.4, 6); w2.rotation.z = Math.PI / 2; g.add(w2);
  const pole = cyl(0.16, 0.2, 14, '#6a4a30', o.poleX ?? 4.5, y - 6, -0.2, 10); g.add(pole); const arm = rbox(2.2, 0.16, 0.16, '#6a4a30', o.poleX ?? 4.5, y + 0.2, -0.2, 0.02); g.add(arm); outline(g, { px: 2.2 }); return g; }
// the lab: back wall with a window (crow outside), shelves, a long table
export function lab(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#c9b89a', 0, 0));
  const wallT = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#e8e4da'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8d4cc'; x.fillRect(0, h * 0.7, w, h * 0.3); x.fillStyle = '#a8b4ac'; x.fillRect(0, h * 0.69, w, 6); });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), toon('#ffffff', { map: wallT })); wall.position.set(0, 4.5, -4); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  const win = new THREE.Group(); const sky = plane(2.6, 1.8, '#9fd0f2', 0, 0, 0); win.add(sky); for (const [w, h, x, y] of [[2.9, 0.14, 0, 0.95], [2.9, 0.14, 0, -0.95], [0.14, 2.0, -1.38, 0], [0.14, 2.0, 1.38, 0], [0.1, 1.8, 0, 0]]) win.add(rbox(w, h, 0.16, '#f4f0e6', x, y, 0.05, 0.02)); win.position.set(o.winX ?? -2.6, 3.1, -3.95); g.add(win);
  const board = rbox(3.4, 1.9, 0.08, '#fbfbf6', 2.8, 3.2, -3.94, 0.03); g.add(board); const frame = rbox(3.6, 0.1, 0.14, '#9aa0a8', 2.8, 2.2, -3.9, 0.02); g.add(frame);
  const bt = canvasTex(512, 280, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#2a5ac0'; x.lineWidth = 6; x.lineCap = 'round'; x.font = '700 46px "Fredoka", sans-serif'; x.fillStyle = '#2a5ac0'; x.fillText('MASK  TEST', 30, 70); x.fillStyle = '#c0392b'; x.fillText('A: danger', 30, 150); x.fillStyle = '#2a8a4a'; x.fillText('B: neutral', 30, 225); });
  const bp = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.75), toon('#ffffff', { map: bt, transparent: true })); bp.position.set(2.8, 3.2, -3.89); bp.userData.noOutline = true; g.add(bp);
  const sh = PR.shelf({ w: 2.2, h: 2.4 }); sh.position.set(-6, 0, -3.6); g.add(sh);
  const tb = PR.table({ w: 6.4, d: 1.3, h: 1.0, color: '#e2e4e8' }); tb.position.set(0, 0, 0); g.add(tb);
  return { group: g, win, tableY: 1.06 };
}

// ---------------------------------------------------------------- 2D OVERLAYS
// drawMaskIcon(g, x, y, r) — flat caveman-mask face (speech bubble, eye reflection)
export function drawMaskIcon(g, x, y, r, o = {}) {
  g.save(); g.translate(x, y); g.lineJoin = 'round'; const ink = o.ink || '#2a1c15', lw = Math.max(1.5, r * 0.07);
  for (let i = 0; i < 11; i++) { const a = Math.PI * (1.05 + i / 10 * 0.9); g.fillStyle = '#4a2a16'; g.beginPath(); g.arc(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.95, r * 0.24, 0, 7); g.fill(); }
  g.fillStyle = '#c48a58'; g.strokeStyle = ink; g.lineWidth = lw; g.beginPath(); g.ellipse(0, 0, r * 0.82, r * 0.95, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#7a4a2a'; g.beginPath(); g.roundRect(-r * 0.62, -r * 0.5, r * 1.24, r * 0.24, r * 0.12); g.fill();
  g.fillStyle = '#4a2a16'; g.beginPath(); g.roundRect(-r * 0.6, -r * 0.6, r * 1.2, r * 0.14, r * 0.07); g.fill();
  g.fillStyle = '#120a08'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.3, -r * 0.15, r * 0.15, r * 0.1, 0, 0, 7); g.fill(); }
  g.fillStyle = '#b07546'; g.beginPath(); g.ellipse(0, r * 0.1, r * 0.26, r * 0.18, 0, 0, 7); g.fill();
  g.fillStyle = '#2a0e0c'; g.beginPath(); g.ellipse(0, r * 0.47, r * 0.4, r * 0.15, 0, 0, 7); g.fill(); g.fillStyle = '#f6efd8'; for (let i = 0; i < 4; i++) g.fillRect(-r * 0.3 + i * r * 0.16, r * 0.36, r * 0.12, r * 0.1);
  g.restore();
}
// speech bubble with the mask icon (+ a red "NO" slash)
export function bubble(g, x, y, s, k, o = {}) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(s * k, s * k); g.lineJoin = 'round';
  g.fillStyle = '#ffffff'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.ellipse(0, 0, 170, 130, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(o.tail ?? -90, 95); g.lineTo((o.tail ?? -90) - 50, 200); g.lineTo((o.tail ?? -90) + 40, 115); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ffffff'; g.fillRect((o.tail ?? -90) - 10, 88, 60, 30);
  drawMaskIcon(g, 0, 4, 82); if (o.slash !== false) { g.strokeStyle = '#e23b2e'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.arc(0, 4, 104, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-74, -70); g.lineTo(74, 78); g.stroke(); }
  g.restore();
}
// year stamp in a corner (rubber-stamp look), pops in
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const x = o.x ?? 150, y = o.y ?? 250;
  g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(k, k); g.globalAlpha = o.a ?? 0.95; g.lineJoin = 'round';
  g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 9; g.beginPath(); g.roundRect(-120, -52, 240, 104, 16); g.stroke();
  insT(g, String(year), 0, 4, 82, { color: o.color || '#e23b2e', stroke: null });
  g.restore();
}
// frame-1 hook: two kinetic lines near the top (below the Shorts top bar), readable in 1 s
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * 112); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    insT(g, l, 0, 0, o.size || 70, { color: i === (o.gold ?? 1) ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.88 }); g.restore(); });
}
// black-and-white "camera shutter" frame: grayscale + bright over whatever is drawn
let _bw = null;
export function bwFlash(g, k) { if (k <= 0) return; const cv = g.canvas; if (!_bw) _bw = document.createElement('canvas'); if (_bw.width !== cv.width) { _bw.width = cv.width; _bw.height = cv.height; } const x = _bw.getContext('2d'); x.drawImage(cv, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.filter = 'grayscale(1) contrast(1.6) brightness(1.25)'; g.drawImage(_bw, 0, 0); g.filter = 'none'; g.restore(); }

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK };
