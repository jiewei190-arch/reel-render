// Naked mole-rat Short: shared assets (underscore = not auto-loaded). All original designs in the Toon 3D bean style.
// moleRat() = the hero: pink, wrinkly, nearly hairless, tiny squinty eyes, four big buck teeth outside sealed lips.
// Plus a house mouse, the burrow (tunnel / round chamber), the colony cross-section ("ant farm"), the lab, and 2D helpers.
// Tone: comic and warm. Nobody is hurt; the "no oxygen" beat is a calm nap, never distress.
import { E, wordTime, rng, clamp, lerp, ease, prog, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, plane, floor, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);
export const shadeC = (hex, k) => { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); };
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };

function lidEye(parent, pos, n, size, o = {}) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.05, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.5, 0.55, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const hl = new THREE.Mesh(sph, flat('#ffffff')); hl.scale.set(0.16, 0.16, 0.05); hl.position.set(-0.15, 0.2, 1.0); hl.userData.noOutline = true; pg.add(hl);
  const lp = new THREE.Group(); eg.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#e08a88', { fresh: true })); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.1, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp };
}

// ---------------------------------------------------------------- THE HERO
// moleRat({ seed, scale, color, crown, hat, pup }) ~1.6 units long, ~0.95 tall, faces +Z.
// .update(t, { walk 0..1, dig 0..1, lid 0..1, look:[x,y], headTurn, headNod, chew, bob, smile, mouthO, wiggle, sleep })
export const PINK = '#f2a7a0';
export function moleRat(o = {}) {
  const { seed = 1, scale = 1, color = PINK } = o; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale * (o.pup ? 0.45 : 1)); root.add(g);
  const skin = toon(color, { fresh: true }), skinD = toon(shadeC(color, -0.1), { fresh: true }), skinL = toon(shadeC(color, 0.18), { fresh: true });
  const bodyG = new THREE.Group(); bodyG.position.y = 0.42; g.add(bodyG);
  const body = M(sph, skin); body.scale.set(0.44, 0.36, 0.72); bodyG.add(body);
  const belly = M(sph, skinL, 0, -0.1, 0.05); belly.scale.set(0.36, 0.24, 0.6); belly.userData.noOutline = true; bodyG.add(belly);
  // wrinkles: thin darker folds around the body (it is all skin)
  for (let i = 0; i < 6; i++) { const z = -0.5 + i * 0.19; const k = Math.sqrt(Math.max(0.05, 1 - (z / 0.72) ** 2));
    const w = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 28, Math.PI * 1.15), skinD); w.scale.set(0.445 * k, 0.365 * k, 1); w.position.z = z; w.rotation.z = -Math.PI * 0.075 + (r() - 0.5) * 0.2; w.userData.noOutline = true; bodyG.add(w); }
  // tail: thin, pink, slightly curled
  const tail = new THREE.Group(); tail.position.set(0, -0.05, -0.66); bodyG.add(tail);
  const tm = M(new THREE.CylinderGeometry(0.025, 0.055, 0.5, 8).translate(0, -0.25, 0), skin); tm.rotation.x = 1.9; tail.add(tm);
  // head
  const head = new THREE.Group(); head.position.set(0, 0.1, 0.62); bodyG.add(head);
  const hs = M(sph, skin); hs.scale.set(0.33, 0.29, 0.34); head.add(hs);
  for (let i = 0; i < 2; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 6, 24, Math.PI), skinD); w.scale.set(0.3 - i * 0.04, 0.26 - i * 0.04, 1); w.position.set(0, 0.02, -0.06 - i * 0.1); w.userData.noOutline = true; head.add(w); }
  const snout = M(sph, skinL, 0, -0.07, 0.26); snout.scale.set(0.2, 0.15, 0.16); head.add(snout);
  const nose = M(sph, toon(shadeC(color, -0.28), { fresh: true }), 0, -0.02, 0.41); nose.scale.set(0.07, 0.045, 0.04); nose.userData.noOutline = true; head.add(nose);
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#ff6f8a', { transparent: true, opacity: 0.55 })); ch.scale.set(0.07, 0.04, 0.02); ch.position.set(s * 0.2, -0.07, 0.25); ch.rotation.y = s * 0.7; ch.userData.noOutline = true; head.add(ch); }
  // teeth: two up, two down, outside the lips (it digs with them; the lips seal behind)
  const toothM = toon('#f4e6b8', { fresh: true }); const teeth = new THREE.Group(); teeth.position.set(0, -0.2, 0.38); head.add(teeth);
  const upper = new THREE.Group(), lower = new THREE.Group(); teeth.add(upper, lower);
  for (const s of [-1, 1]) { upper.add(rbox(0.062, 0.15, 0.05, '#f4e6b8', s * 0.036, -0.02, 0.03, 0.018)); lower.add(rbox(0.056, 0.17, 0.05, '#efdca8', s * 0.033, -0.16, 0.01, 0.018)); }
  upper.children.forEach(m => { m.material = toothM; }); lower.rotation.x = -0.15;
  const lip = M(sph, skin, 0, -0.17, 0.27); lip.scale.set(0.13, 0.06, 0.08); head.add(lip);
  // tiny eyes (poor eyesight) with lids
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.15, 0.07, 0.25), new THREE.Vector3(s * 0.5, 0.15, 0.85).normalize(), o.pup ? 0.075 : 0.062, { lid: shadeC(color, -0.06) }));
  // mouth (a little smile under the snout, beside the teeth)
  const mouthM = flat('#7a2a3a'); const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 16, Math.PI), mouthM); smile.rotation.z = Math.PI; smile.position.set(0, -0.12, 0.395); smile.userData.noOutline = true; head.add(smile);
  const mo = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), mouthM); mo.position.set(0, -0.14, 0.4); mo.userData.noOutline = true; mo.visible = false; head.add(mo);
  // whiskers (the few hairs it has)
  const wm = flat('#4a2a2a'); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const wk = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.32, 4), wm); wk.position.set(s * 0.26, -0.06 + i * 0.03, 0.27); wk.rotation.set(0, 0, s * (1.35 + (i - 1) * 0.15)); wk.userData.noOutline = true; head.add(wk); }
  // legs: short and thin, pale pink feet
  const legs = []; for (const [x, z] of [[-0.25, 0.38], [0.25, 0.38], [-0.27, -0.36], [0.27, -0.36]]) { const L = new THREE.Group(); L.position.set(x, 0.32, z); g.add(L);
    L.add(M(new THREE.CylinderGeometry(0.06, 0.05, 0.3, 8).translate(0, -0.15, 0), skin)); const f = M(sph, skinL, 0, -0.3, 0.05); f.scale.set(0.08, 0.045, 0.11); L.add(f); legs.push(L); }
  // extras: crown (the queen), party hat
  if (o.crown) { const c = new THREE.Group(); c.position.set(0, 0.3, -0.02); head.add(c); const gold = toon('#f2c230', { emissive: new THREE.Color('#f2c230'), emissiveIntensity: 0.25, fresh: true });
    const band = M(new THREE.CylinderGeometry(0.16, 0.17, 0.1, 20, 1, true), gold); c.add(band);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const sp = M(new THREE.ConeGeometry(0.045, 0.14, 6), gold, Math.sin(a) * 0.15, 0.11, Math.cos(a) * 0.15); c.add(sp); const gem = M(sph, toon(i % 2 ? '#e2384a' : '#3a8ae2', { fresh: true }), Math.sin(a) * 0.17, 0.0, Math.cos(a) * 0.17); gem.scale.setScalar(0.025); gem.userData.noOutline = true; c.add(gem); }
    root.crown = c; }
  if (o.hat) { const tex = canvasTex(128, 128, (cx, W, H) => { cx.fillStyle = '#3aa8e8'; cx.fillRect(0, 0, W, H); cx.fillStyle = '#ffd23a'; for (let i = 0; i < 6; i++) cx.fillRect(i * 22, 0, 10, H); });
    const hg = new THREE.Group(); hg.position.set(0.04, 0.26, -0.02); hg.rotation.z = -0.2; head.add(hg); hg.add(M(new THREE.ConeGeometry(0.13, 0.34, 18).translate(0, 0.17, 0), toon('#ffffff', { map: tex, fresh: true }))); hg.add(ball(0.045, '#ff5a6a', 0, 0.35, 0, 10)); root.hat = hg; }
  root.add(blob(0.55 * scale * (o.pup ? 0.45 : 1), 0.3));
  outline(g, { px: o.pup ? 2.2 : 2.8 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.4; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { walk = 0, dig = 0, lid = 0.45, look = [0, 0], headTurn = 0, headNod = 0, chew = 0, bob = 0, smile: sm = 1, mouthO = 0, wiggle = 0, sleep = 0, ph = seed * 0.9 } = u;
    const w = (t * 4.2 + ph) * Math.PI * 2 * 0.5;
    legs.forEach((L, i) => { const s = Math.sin(w + (i === 0 || i === 3 ? 0 : Math.PI)); L.rotation.x = walk * s * 0.6 + dig * (i < 2 ? Math.sin(t * 14 + i * Math.PI) * 0.9 : 0); });
    bodyG.position.y = 0.42 + walk * Math.abs(Math.sin(w)) * 0.04 + bob + Math.sin(t * 2 + ph) * 0.008 * (1 - sleep) - sleep * 0.06;
    bodyG.rotation.z = Math.sin(t * 8 + ph) * 0.05 * wiggle; bodyG.rotation.x = dig * 0.12 + sleep * 0.05;
    body.scale.y = 0.36 * (1 + Math.sin(t * (sleep ? 1.6 : 3) + ph) * 0.02);
    head.rotation.set(headNod + dig * Math.sin(t * 7) * 0.18 + sleep * 0.25, headTurn + Math.sin(t * 1.7 + ph) * 0.04 * (1 - sleep), Math.sin(t * 8 + ph) * 0.06 * wiggle);
    lower.rotation.x = -0.15 - (chew ? (0.5 + 0.5 * Math.sin(t * 16)) * 0.25 * chew : 0) - mouthO * 0.3;
    tail.rotation.y = Math.sin(t * 3 + ph) * 0.3; tail.rotation.x = Math.sin(t * 2.3 + ph) * 0.1;
    smile.visible = mouthO < 0.5 && sm > 0.5; mo.visible = mouthO >= 0.5;
    const bl = blinkAt(t); eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(sleep ? 1 : lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.33 * (o.pup ? 0.45 : 1); root.teeth = teeth;
  root.update(0); return root;
}

// a house mouse, same scale (also comic): grey fur, big round ears, big eyes, long pink tail
export function mouse(o = {}) {
  const { seed = 4, scale = 1, color = '#a7a4b2' } = o; const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const fur = toon(color, { fresh: true }), furL = toon(shadeC(color, 0.3), { fresh: true }), pink = toon('#f2a7b0', { fresh: true });
  const bodyG = new THREE.Group(); bodyG.position.y = 0.4; g.add(bodyG);
  const b = M(sph, fur); b.scale.set(0.38, 0.34, 0.55); bodyG.add(b); const be = M(sph, furL, 0, -0.08, 0.06); be.scale.set(0.3, 0.24, 0.45); be.userData.noOutline = true; bodyG.add(be);
  const head = new THREE.Group(); head.position.set(0, 0.14, 0.5); bodyG.add(head); const hs = M(sph, fur); hs.scale.set(0.28, 0.26, 0.32); head.add(hs);
  const sn = M(sph, furL, 0, -0.06, 0.24); sn.scale.set(0.13, 0.11, 0.14); head.add(sn); const nose = M(sph, pink, 0, -0.02, 0.37); nose.scale.setScalar(0.045); head.add(nose);
  for (const s of [-1, 1]) { const ear = M(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 20), fur, s * 0.2, 0.26, -0.04); ear.rotation.set(Math.PI / 2, 0, s * 0.3); head.add(ear);
    const ei = M(new THREE.CylinderGeometry(0.12, 0.12, 0.045, 18), pink, s * 0.2, 0.26, -0.02); ei.rotation.set(Math.PI / 2, 0, s * 0.3); ei.userData.noOutline = true; head.add(ei); }
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.13, 0.07, 0.22), new THREE.Vector3(s * 0.45, 0.15, 0.88).normalize(), 0.085, { lid: shadeC(color, -0.06) }));
  const tail = M(new THREE.CylinderGeometry(0.015, 0.04, 0.9, 8).translate(0, -0.45, 0), pink, 0, -0.05, -0.5); tail.rotation.x = 2.0; bodyG.add(tail);
  for (const [x, z] of [[-0.2, 0.3], [0.2, 0.3], [-0.22, -0.3], [0.22, -0.3]]) { const f = M(sph, pink, x, 0.05, z + 0.05); f.scale.set(0.07, 0.04, 0.1); g.add(f); }
  root.add(blob(0.5 * scale, 0.3)); outline(g, { px: 2.8 });
  root.update = (t, u = {}) => { const { lid = 0.15, look = [0, 0], headTurn = 0, bob = 0 } = u; bodyG.position.y = 0.4 + bob + Math.sin(t * 3 + seed) * 0.01; head.rotation.y = headTurn; tail.rotation.y = Math.sin(t * 2.5) * 0.4;
    const tt = (t + seed) % 3.1, bl = tt < 0.14 ? Math.sin(tt / 0.14 * Math.PI) : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); }); };
  root.head = head; root.eyes = eyes; root.headR = 0.3; root.update(0); return root;
}

// ---------------------------------------------------------------- TEXTURES
let _soil = null;
export function soilTex() { return _soil ||= canvasTex(512, 512, (c, W, H) => { const r = rng(9); c.fillStyle = '#8a5a3a'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { c.fillStyle = ['#7a4e32', '#9a6a44', '#6e4630', '#a87a52'][i % 4]; c.globalAlpha = 0.5; c.beginPath(); c.arc(r() * W, r() * H, 2 + r() * 9, 0, 7); c.fill(); }
  c.globalAlpha = 1; for (let i = 0; i < 40; i++) { c.fillStyle = ['#c8b4a0', '#a89888', '#d0c0a8'][i % 3]; c.beginPath(); c.ellipse(r() * W, r() * H, 5 + r() * 9, 3 + r() * 6, r() * 3, 0, 7); c.fill(); } }, { repeat: [3, 2] }); }

// ---------------------------------------------------------------- SETS
// the burrow: a tunnel of warm earth running along -Z (radius R, floor at y 0), little roots hanging, pebbles. Camera inside, at +Z.
export function burrowStage(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 40, shadowSize: o.shadowSize || 5, target: o.target || [0, 0, 0],
    bg: ['#2a170e', '#1a0d08'], fog: [o.fogNear ?? 5, o.fogFar ?? 17, '#2a1a10'], sky: '#ffe2c0', ground: '#6a3e26', ambient: 1.35,
    key: ['#ffd8a8', 2.2, [-2, 6, 4]], fill: ['#ff9a70', 0.6, [3, 2, 5]], ...o.stage });
  const R = o.R || 1.6, len = o.len || 30, cy = R * 0.62; const g = new THREE.Group(); st.add(g);
  const tex = soilTex().clone(); tex.needsUpdate = true; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 6);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(R, R, len, 28, 1, true), toon('#ffffff', { map: tex, side: THREE.BackSide, fresh: true }));
  tube.rotation.x = Math.PI / 2; tube.position.set(0, cy, -len / 2 + 4); tube.receiveShadow = true; tube.userData.noOutline = true; g.add(tube);
  const fl = floor(R * 2.2, len, '#9a6a44', 0, -len / 2 + 4); fl.material = toon('#ffffff', { map: tex, fresh: true }); fl.receiveShadow = true; g.add(fl);
  const r = rng(o.seed || 5); const roots = [];
  for (let i = 0; i < 14; i++) { const z = 3 - r() * 24, a = (r() - 0.5) * 1.6; const x = Math.sin(a) * R * 0.9, y = cy + Math.cos(a) * R * 0.9;
    const rt = cyl(0.015, 0.03, 0.4 + r() * 0.5, '#5a3a22', x, y - 0.25, z, 6); rt.castShadow = false; rt.userData.noOutline = true; g.add(rt); roots.push(rt); }
  for (let i = 0; i < 16; i++) { const z = 3 - r() * 24, x = (r() - 0.5) * R * 1.7; const s = 0.05 + r() * 0.12; const p = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), toon(['#c8b4a0', '#a89888'][i % 2])); p.position.set(x, s * 0.4, z); p.scale.set(s, s * 0.6, s); g.add(p); }
  // end chamber light: a warm glow far down the tunnel
  if (o.glow !== false) { const sp = new THREE.Mesh(new THREE.CircleGeometry(R * 0.9, 24), flat('#ffb070', { transparent: true, opacity: 0.35, fog: false })); sp.position.set(0, cy, -len + 4.5); sp.userData.noOutline = true; g.add(sp); }
  const update = (t) => { roots.forEach((rt, i) => { rt.rotation.z = Math.sin(t * 0.8 + i) * 0.06; }); };
  return { stage: st, group: g, R, cy, update };
}
// a round nest chamber (the cake / queen room): an earth dome with a flat floor
export function chamberStage(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 40, shadowSize: o.shadowSize || 5, target: [0, 0, 0],
    bg: ['#2a170e', '#1a0d08'], sky: '#ffe2c0', ground: '#6a3e26', ambient: 1.35, key: ['#ffdcb0', 2.3, [-2, 7, 4]], fill: ['#ff9a70', 0.55, [3, 2, 5]], ...o.stage });
  const R = o.R || 4.2; const tex = soilTex().clone(); tex.needsUpdate = true; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(5, 3);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ffffff', { map: tex, side: THREE.BackSide, fresh: true })); dome.scale.y = 0.7; dome.receiveShadow = true; dome.userData.noOutline = true; st.add(dome);
  const fl = new THREE.Mesh(new THREE.CircleGeometry(R, 32), toon('#ffffff', { map: tex, fresh: true })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.userData.noOutline = true; st.add(fl);
  // tunnel mouths in the wall (dark holes)
  for (const [a, s] of [[-0.9, 0.8], [0.7, 0.9], [2.6, 0.8]]) { const h = new THREE.Mesh(new THREE.CircleGeometry(s, 20), flat('#140a06')); h.position.set(Math.sin(a) * R * 0.97, s * 0.75, -Math.cos(a) * R * 0.97); h.lookAt(0, s * 0.75, 0); h.userData.noOutline = true; st.add(h); }
  // a soft bedding of grass bits (nests are lined with plant material)
  const r = rng(o.seed || 7); for (let i = 0; i < 60; i++) { const a = r() * Math.PI * 2, d = R * (0.55 + r() * 0.35); const s = cyl(0.015, 0.015, 0.3 + r() * 0.2, ['#c8a84a', '#a8903a', '#d8bc60'][i % 3], Math.sin(a) * d, 0.02, -Math.cos(a) * d, 4); s.rotation.set(Math.PI / 2, 0, r() * 3); s.userData.noOutline = true; st.add(s); }
  return { stage: st, R, update: () => {} };
}

// colony cross-section ("ant farm"): a big wall of soil with carved tunnels and chambers, grass + sky strip on top.
// TUN = tunnel centre lines in wall units (x right, y up; wall 16 x 22, ground surface at y 0, tunnels below).
export const TUN = [
  [[-7, -3], [-3, -3.4], [0, -3], [3.5, -3.6], [7, -3.2]],
  [[0, -3], [0.6, -6.5], [-1.2, -9.5], [-4.5, -10.5], [-7, -10]],
  [[3.5, -3.6], [4.5, -7], [6.8, -9]],
  [[-1.2, -9.5], [1.8, -12.5], [5, -13.5], [7, -14.5]],
  [[-4.5, -10.5], [-5.2, -14], [-3, -16.5]],
];
export const CHAMBERS = [[-3, -16.5, 2.0, 1.1], [6.8, -9, 1.4, 0.9], [5, -13.5, 1.5, 0.95], [-7, -10, 1.2, 0.8]];
export function colonyWall(st, o = {}) {
  const W = 16, H = 22, k = 64;
  const tex = canvasTex(W * k, H * k, (c, w, h) => { const soil = soilTex().image; c.fillStyle = c.createPattern(soil, 'repeat'); c.fillRect(0, 0, w, h);
    const X = (x) => (x + W / 2) * k, Y = (y) => (-y) * k + 2.2 * k;   // y 0 = surface, 2.2 units of sky above
    // sky + grass strip
    const sk = c.createLinearGradient(0, 0, 0, 2.2 * k); sk.addColorStop(0, '#6ab8f0'); sk.addColorStop(1, '#bfe4ff'); c.fillStyle = sk; c.fillRect(0, 0, w, 2.2 * k);
    c.fillStyle = '#5aa83a'; c.fillRect(0, 2.2 * k - 6, w, 26); const r = rng(3); for (let i = 0; i < 260; i++) { const x = r() * w; c.fillStyle = ['#4a9a2e', '#6ab84a', '#3e8a2a'][i % 3]; c.beginPath(); c.moveTo(x, 2.2 * k + 10); c.lineTo(x + 6, 2.2 * k - 22 - r() * 26); c.lineTo(x + 12, 2.2 * k + 10); c.fill(); }
    // topsoil band
    c.fillStyle = 'rgba(60,30,15,0.35)'; c.fillRect(0, 2.2 * k + 18, w, 40);
    // tunnels: dark edge then lighter warm floor
    const stroke = (wid, col) => { c.strokeStyle = col; c.lineWidth = wid; c.lineCap = 'round'; c.lineJoin = 'round'; TUN.forEach(p => { c.beginPath(); p.forEach(([x, y], i) => (i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)))); c.stroke(); }); };
    stroke(0.95 * k, '#4a2a18'); stroke(0.78 * k, '#e8b888');
    CHAMBERS.forEach(([x, y, rx, ry]) => { c.fillStyle = '#4a2a18'; c.beginPath(); c.ellipse(X(x), Y(y), rx * k + 9, ry * k + 9, 0, 0, 7); c.fill(); c.fillStyle = '#f0c494'; c.beginPath(); c.ellipse(X(x), Y(y), rx * k, ry * k, 0, 0, 7); c.fill(); });
    // nest bedding in the big chamber
    c.strokeStyle = '#c8a84a'; c.lineWidth = 5; for (let i = 0; i < 40; i++) { const x = X(-3) + (r() - 0.5) * 2.6 * k, y = Y(-16.5) + 0.55 * k + r() * 0.3 * k; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 40, y - 8); c.stroke(); }
    // stones
    for (let i = 0; i < 30; i++) { c.fillStyle = ['#b8a490', '#9a8a7a'][i % 2]; c.beginPath(); c.ellipse(r() * w, 2.6 * k + r() * (h - 3 * k), 8 + r() * 16, 6 + r() * 10, r() * 3, 0, 7); c.fill(); }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H + 2.2), toon('#ffffff', { map: tex, fresh: true })); m.position.set(0, -H / 2 + 1.1, 0); m.receiveShadow = true; m.userData.noOutline = true; st.add(m);
  // point on a tunnel path (u 0..1), in world coords just in front of the wall
  const along = (pi, u) => { const p = TUN[pi]; const seg = []; let tot = 0; for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); seg.push(d); tot += d; }
    let s = ((u % 1) + 1) % 1 * tot; for (let i = 0; i < seg.length; i++) { if (s <= seg[i]) { const k2 = s / seg[i]; const x = lerp(p[i][0], p[i + 1][0], k2), y = lerp(p[i][1], p[i + 1][1], k2); return { x, y: y - 0.32, dir: Math.sign(p[i + 1][0] - p[i][0]) || 1, ang: Math.atan2(p[i + 1][1] - p[i][1], p[i + 1][0] - p[i][0]) }; } s -= seg[i]; }
    const L = p[p.length - 1]; return { x: L[0], y: L[1] - 0.32, dir: 1, ang: 0 }; };
  return { wall: m, along };
}

// lab: warm room, back wall, a bench with a glass colony tank (soil slab with tunnels inside)
export function labStage(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 38, shadowSize: 6, target: [0, 1, 0], bg: '#efe3d2' });
  const wall = plane(30, 12, '#d8e6e2', 0, 6, -3.5); st.add(wall); const fl = floor(30, 20, '#b89a7a', 0, 2); fl.receiveShadow = true; st.add(fl);
  for (let i = 0; i < 3; i++) { const sh = rbox(2.6, 0.08, 0.5, '#8a6a4a', -5 + i * 5, 3.6, -3.25, 0.02); st.add(sh); for (let k = 0; k < 4; k++) { const j = cyl(0.14, 0.14, 0.42, ['#7fc0e8', '#f2c230', '#e86a6a', '#8ad07a'][(i + k) % 4], -5.8 + i * 5 + k * 0.5, 3.85, -3.25, 14); st.add(j); } }
  const bench = rbox(5.2, 0.16, 1.6, '#f0f0f0', 0, 1.6, 0, 0.05); st.add(bench); st.add(rbox(5.0, 1.5, 1.4, '#9ab0c0', 0, 0.78, 0, 0.05));
  // the tank: soil slab with tunnels + glass box
  const tex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = c.createPattern(soilTex().image, 'repeat'); c.fillRect(0, 0, w, h); c.strokeStyle = '#4a2a18'; c.lineWidth = 34; c.lineCap = 'round';
    const P = [[[20, 60], [160, 90], [260, 60], [400, 110], [500, 80]], [[260, 60], [240, 170], [120, 210]], [[400, 110], [380, 200]]]; const dr = (wd, col) => { c.lineWidth = wd; c.strokeStyle = col; P.forEach(p => { c.beginPath(); p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }); }; dr(34, '#4a2a18'); dr(26, '#f0c494'); });
  const slab = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), toon('#ffffff', { map: tex, fresh: true })); slab.position.set(0, 2.5, -0.05); slab.userData.noOutline = true; st.add(slab);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 0.6), toon('#cfefff', { transparent: true, opacity: 0.18, fresh: true })); glass.position.set(0, 2.5, 0); glass.userData.noOutline = true; st.add(glass);
  const fr = new THREE.Group(); for (const [x, y, w, h] of [[0, 3.42, 3.5, 0.08], [0, 1.6, 3.5, 0.08], [-1.72, 2.5, 0.08, 1.9], [1.72, 2.5, 0.08, 1.9]]) fr.add(rbox(w, h, 0.62, '#5a6a7a', x, y, 0, 0.02)); outline(fr, { px: 2.2 }); st.add(fr);
  outline(bench, { px: 2.2 });
  return { stage: st };
}

// ---------------------------------------------------------------- PROPS
export function cake(o = {}) {
  const g = new THREE.Group(); g.add(cyl(0.62, 0.62, 0.36, '#f6d2a8', 0, 0.18, 0, 32)); g.add(cyl(0.64, 0.64, 0.08, '#ff8fb0', 0, 0.38, 0, 32)); g.add(cyl(0.45, 0.45, 0.28, '#f6d2a8', 0, 0.56, 0, 28)); g.add(cyl(0.47, 0.47, 0.07, '#ff8fb0', 0, 0.72, 0, 28));
  g.add(cyl(0.75, 0.8, 0.05, '#e8e8f0', 0, 0.02, 0, 32));
  const flames = []; const n = o.candles || 7; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const x = Math.sin(a) * 0.3, z = Math.cos(a) * 0.3; g.add(cyl(0.025, 0.025, 0.22, ['#6ac0ff', '#ffd23a', '#8ae07a'][i % 3], x, 0.86, z, 8));
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), flat('#ffcf4a')); f.scale.set(0.8, 1.6, 0.8); f.position.set(x, 1.03, z); f.userData.noOutline = true; g.add(f); flames.push(f); }
  // big "30+" topper
  const tex = canvasTex(256, 128, (c, W, H) => { c.font = '900 110px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 16; c.strokeStyle = '#2a1c15'; c.strokeText(o.label || '30+', W / 2, H / 2 + 6); c.fillStyle = '#ffd23a'; c.fillText(o.label || '30+', W / 2, H / 2 + 6); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), toon('#ffffff', { map: tex, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, fresh: true })); sign.position.set(0, 1.25, 0); sign.userData.noOutline = true; g.add(sign); g.add(cyl(0.012, 0.012, 0.4, '#d0d0d0', 0, 0.95, 0, 6));
  outline(g, { px: 2.4 }); g.flames = flames; g.sign = sign;
  g.update = (t, out = 0) => { flames.forEach((f, i) => { const k = 1 - clamp(out); f.visible = k > 0.02; f.scale.set(0.8 * k, (1.5 + Math.sin(t * 17 + i * 2) * 0.25) * k, 0.8 * k); }); };
  return g;
}
export function confetti(st, o = {}) { const r = rng(o.seed || 11); const bits = []; const cols = ['#ff5a6a', '#ffd23a', '#5ac8ff', '#8ae07a', '#c87aff'];
  for (let i = 0; i < (o.n || 70); i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.11), flat(cols[i % 5], { side: THREE.DoubleSide })); m.userData = { x: (r() - 0.5) * (o.w || 4), z: (r() - 0.5) * (o.d || 2) + (o.z || 0), ph: r() * 10, sp: 0.4 + r() * 0.5, h: o.h || 3.4, noOutline: true }; st.add(m); bits.push(m); }
  return { update: (t) => bits.forEach((b, i) => { const u = b.userData; const y = u.h - ((t * u.sp + u.ph) % 1) * u.h; b.position.set(u.x + Math.sin(t * 2 + u.ph) * 0.2, y, u.z); b.rotation.set(t * 3 + i, t * 2 + u.ph, 0); }) }; }
export function magnifier() { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 10, 28), toon('#3a3a44')); g.add(ring); const gl = new THREE.Mesh(new THREE.CircleGeometry(0.21, 24), toon('#cfefff', { transparent: true, opacity: 0.35, fresh: true })); gl.userData.noOutline = true; g.add(gl);
  g.add(cyl(0.035, 0.04, 0.4, '#8a5a32', 0, -0.42, 0, 8)); outline(g, { px: 2.4 }); return g; }
export function clipboard() { const g = new THREE.Group(); g.add(rbox(0.36, 0.48, 0.03, '#9a6a3a', 0, 0, 0, 0.02)); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.38), flat('#fbf8f2')); p.position.z = 0.017; p.userData.noOutline = true; g.add(p);
  for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.02), flat('#7a8aa0')); l.position.set(0, 0.1 - i * 0.07, 0.018); l.userData.noOutline = true; g.add(l); } g.add(rbox(0.12, 0.05, 0.04, '#c0c0c8', 0, 0.24, 0.01, 0.01)); outline(g, { px: 2.2 }); return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
// two-tone line: [[text, colour], ...] centred at y
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { insT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: CARD_INK }); x += ws[i] + sp; }); g.restore();
}
// the 2-line top caption of frame 1 (centre-top, under the Shorts top bar); pops in, fades by `until`
export function topCaption(g, t, L1, L2, o = {}) {
  const fade = o.until != null ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return; const y1 = o.y ?? 290, sz = o.size || 72;
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
// rounded label chip that pops in at age 0
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const fade = o.until != null ? clamp((o.until - age) / 0.2) : 1; if (fade <= 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 60; g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px "Nunito", sans-serif`; const w = g.measureText(str).width + size * 0.9, h = size * 1.4; g.fillStyle = o.bg || '#fbf3e4'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill(); g.stroke();
  insT(g, str, 0, 2, size, { color: o.color || CARD_INK }); g.restore(); }
// oxygen gauge (dial): k = fill 0..1
export function o2Gauge(g, x, y, k, o = {}) { const R = o.r || 150; g.save(); g.translate(x, y); g.lineCap = 'round';
  g.fillStyle = '#fbf3e4'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.stroke();
  g.lineWidth = 26; g.strokeStyle = '#d8d0c4'; g.beginPath(); g.arc(0, 0, R * 0.72, Math.PI * 0.8, Math.PI * 2.2); g.stroke();
  g.strokeStyle = k > 0.3 ? '#3ab0e8' : '#e8443a'; if (k > 0.005) { g.beginPath(); g.arc(0, 0, R * 0.72, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * k)); g.stroke(); }
  insT(g, 'O₂', 0, -R * 0.12, R * 0.42, { color: CARD_INK }); insT(g, `${Math.round(k * 100)}%`, 0, R * 0.42, R * 0.34, { color: k > 0.3 ? '#2a7ab0' : '#d8342a' }); g.restore(); }
// risk-of-dying chart: two curves drawn on (k 0..1): most mammals rise, the naked mole-rat stays flat
export function riskChart(g, k, age, o = {}) { const x0 = 150, x1 = 930, y0 = 1260, y1 = 640; const p = ease.outBack(clamp(age / 0.4));
  g.save(); g.translate(540, 950); g.scale(p, p); g.translate(-540, -950);
  g.fillStyle = 'rgba(251,243,228,0.96)'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(80, 470, 920, 900, 40); g.fill(); g.stroke();
  insT(g, 'RISK OF DYING', 540, 545, 64, { color: CARD_INK });
  g.lineWidth = 8; g.strokeStyle = CARD_INK; g.beginPath(); g.moveTo(x0, y1 - 20); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke(); insT(g, 'AGE →', 840, y0 + 50, 44, { color: '#5a4a3a' });
  const n = 40, m = Math.floor(n * k);
  const curve = (f, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= m; i++) { const u = i / n; const x = lerp(x0 + 10, x1 - 20, u), y = lerp(y0 - 20, y1, f(u)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
  curve(u => Math.pow(u, 3.2), '#e8443a', 16); curve(() => 0.1, '#ff8fb0', 18);
  if (k > 0.85) { const a = clamp((k - 0.85) / 0.15); g.globalAlpha = a; insT(g, 'most mammals', 640, 760, 46, { color: '#d8342a' }); insT(g, 'naked mole-rat', 560, y0 - 110, 50, { color: '#d0507a' }); }
  g.restore(); }

export { THREE, toon, flat, outline, rbox, box, cyl, ball, plane, floor, blob, canvasTex, toonStage, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK };
