// Rocky Mountain locust — shared assets: a toon locust (big lidded eyes, jumping legs, wings), an instanced swarm cloud,
// an 1870s prairie farm (wheat that bends in the wind, sod-roof farmhouse, red barn, windmill, fence), a Rockies river valley,
// a glacier (Montana) with locusts frozen in the ice, a toon cow, a farmer bean, a specimen box, plus 2D overlays
// (two-colour hook text, rubber stamps, swarm specks, California-vs-swarm card, soil cross-section).
// Tone: WTF / wow. Nobody is hurt. The farming cause is said as a THEORY ("probably").
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 20, 14);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- LOCUST
function lidEye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.15, size * 0.7); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8e8', { emissive: new THREE.Color('#fbf8e8'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#141008')); p.scale.set(0.46, 0.52, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.14, 0.14, 0.05); gl.position.set(0.15, 0.2, 0.99); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}
// locust({ seed, scale, color, medal }) — faces +Z, ~1.3 units long. .update(t, { flap 0..1, spread 0..1, lid, look:[x,y], headTurn, headTilt, chew 0..1, kick 0..1, puff, blink, frozen })
export function locust(o = {}) {
  const { seed = 1, scale = 1 } = o;
  const C = o.color || '#9a8a3a', C2 = shadeHex(C, 0.18), C3 = shadeHex(C, -0.18), WC = o.wing || '#c9b98a';
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const bodyG = new THREE.Group(); bodyG.position.y = 0.32; g.add(bodyG);
  const m1 = toon(C), m2 = toon(C2), m3 = toon(C3);
  // abdomen (segmented, tapering back), thorax (saddle), head (big, round, cute)
  for (let i = 0; i < 5; i++) { const s = mesh(sph, i % 2 ? m1 : m2, 0.15 - i * 0.012, 0.14 - i * 0.012, 0.11); s.position.set(0, 0.02 + i * 0.012, -0.14 - i * 0.12); bodyG.add(s); }
  const thorax = mesh(sph, m1, 0.18, 0.17, 0.2); thorax.position.set(0, 0.06, 0.08); bodyG.add(thorax);
  const saddle = mesh(sph, m3, 0.19, 0.12, 0.17); saddle.position.set(0, 0.13, 0.06); bodyG.add(saddle);
  const head = new THREE.Group(); head.position.set(0, 0.16, 0.3); bodyG.add(head);
  const hs = mesh(sph, m1, 0.2, 0.22, 0.2); head.add(hs);
  const face = mesh(sph, m2, 0.15, 0.16, 0.1); face.position.set(0, -0.06, 0.13); head.add(face);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.17, 0.12); head.add(jaw);
  for (const s of [-1, 1]) { const mj = mesh(sph, toon('#5a4a22'), 0.045, 0.04, 0.04); mj.position.set(s * 0.04, 0, 0.02); mj.userData.noOutline = true; jaw.add(mj); }
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.12, 0.06, 0.12), new THREE.Vector3(s * 0.55, 0.12, 0.83).normalize(), 0.1, C3));
  // antennae: two thin arcs
  const ants = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.06, 0.18, 0.12); head.add(p);
    const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * 0.08, 0.3, 0.1), new THREE.Vector3(s * 0.22, 0.42, -0.08)), 10, 0.012, 5), m3); p.add(c); return { p, s }; });
  // wings: long folded wings along the back (spread when flying)
  const wgeo = new THREE.SphereGeometry(1, 16, 8); const wmat = toon(WC); const hw = toon(o.hind || '#d8b85a');
  const wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.06, 0.18, 0.05); bodyG.add(p);
    const fw = mesh(wgeo, wmat, 0.07, 0.02, 0.36); fw.position.set(0, 0, -0.3); p.add(fw);
    const hwm = mesh(wgeo, hw, 0.16, 0.015, 0.3); hwm.position.set(s * 0.12, -0.01, -0.28); hwm.visible = false; p.add(hwm);
    return { p, s, hwm }; });
  // legs: 4 small front legs + 2 big jumping hind legs (thigh up, shin down to the ground)
  const legM = toon(C3);
  const small = [];
  for (const [z, s] of [[0.16, -1], [0.16, 1], [0.02, -1], [0.02, 1]]) { const p = new THREE.Group(); p.position.set(s * 0.12, -0.04, z); bodyG.add(p);
    const l = mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.3, 6).translate(0, -0.15, 0), legM); l.rotation.z = s * 0.5; p.add(l); small.push({ p, s }); }
  const hind = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * 0.15, 0.0, -0.02); bodyG.add(hip);
    const th = mesh(sph, m2, 0.06, 0.07, 0.26); th.position.set(s * 0.03, 0.12, -0.2); th.rotation.x = -0.55; hip.add(th);
    const knee = new THREE.Group(); knee.position.set(s * 0.05, 0.26, -0.42); hip.add(knee);
    const sh = mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.5, 6).translate(0, -0.25, 0), legM); sh.rotation.x = 0.55; knee.add(sh);
    return { hip, knee, s }; });
  // medal (record card)
  let medalG = null;
  if (o.medal) { medalG = new THREE.Group(); medalG.position.set(0, -0.02, 0.27); medalG.scale.setScalar(1.6); bodyG.add(medalG);
    const rib = rbox(0.07, 0.09, 0.012, '#c0392b', 0, 0.05, 0, 0.01);
    const disc = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 20).rotateX(Math.PI / 2), toon('#f2c230', { emissive: new THREE.Color('#f2c230'), emissiveIntensity: 0.25 })); disc.position.y = -0.03;
    medalG.add(rib, disc); }
  const bl = blob(0.45, 0.25); root.add(bl);
  outline(g, { px: o.outlinePx || 2.6 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.3; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { flap = 0, spread = 0, lid = 0.3, lidAngle = 0, look = [0, 0], headTurn = 0, headTilt = 0, chew = 0, kick = 0, puff = 0, blink = true, ph = seed * 0.7, legs = 1 } = u;
    const w = (t * 14 + ph) * Math.PI * 2, open = clamp(spread + flap);
    wings.forEach(W => { W.hwm.visible = open > 0.2; W.p.rotation.set(0, W.s * open * 0.9, W.s * open * (0.25 + clamp(flap) * Math.sin(w) * 0.5)); });
    ants.forEach(A => { A.p.rotation.set(Math.sin(t * 3 + seed + A.s) * 0.12, 0, A.s * Math.sin(t * 2.2 + seed) * 0.08); });
    jaw.rotation.x = chew * (0.5 + 0.5 * Math.sin(t * 22 + seed)) * 0.6; jaw.scale.x = 1 + chew * 0.2 * Math.sin(t * 22 + seed);
    bodyG.position.y = 0.32 + clamp(flap) * Math.sin(w * 0.25) * 0.04 + noise(t * 0.9, seed) * 0.01; bodyG.scale.set(1 + puff * 0.08, 1 + puff * 0.06, 1); bodyG.rotation.x = -puff * 0.1 - clamp(flap) * 0.15;
    head.rotation.set(-puff * 0.15 + Math.sin(t * 1.7 + seed) * 0.03 + chew * 0.15, headTurn + noise(t * 0.8, seed + 3) * 0.05, -headTilt);
    hind.forEach(H => { H.hip.rotation.x = kick * 0.9; H.knee.rotation.x = -kick * 1.2; H.hip.visible = legs > 0; });
    small.forEach((S, i) => { S.p.rotation.x = Math.sin(t * 8 + i) * 0.08 * clamp(flap); });
    bl.visible = flap < 0.5 && !u.noShadow;
    const b = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.45, look[0] * 0.55, 0); });
  };
  root.head = head; root.headR = 0.2 * scale; root.medal = medalG; root.height = 0.7 * scale;
  root.update(0); return root;
}

// ---------------------------------------------------------------- SWARM (instanced, cheap)
// swarm(st, { count, center:[x,y,z], size:[sx,sy,sz], seed, color, s }) .update(t, { density 0..1, drift:[dx,dy,dz] per s })
export function swarm(st, o = {}) {
  const { count = 1400, center = [0, 8, -20], size = [40, 10, 20], seed = 5, color = '#3a3220', s = 0.18 } = o; const r = rng(seed);
  const geo = new THREE.SphereGeometry(1, 6, 4); geo.scale(0.5, 0.35, 1.0);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), fog: true });
  const im = new THREE.InstancedMesh(geo, mat, count); im.frustumCulled = false; im.userData.noOutline = true;
  const P = []; for (let i = 0; i < count; i++) P.push({ x: (r() - 0.5), y: (r() - 0.5), z: (r() - 0.5), ph: r() * 10, sp: 0.6 + r() * 0.8, k: r() });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  st.scene.add(im);
  const api = { mesh: im, update(t, u = {}) { const { density = 1, drift = [0, 0, 0] } = u;
    for (let i = 0; i < count; i++) { const p = P[i]; const on = p.k < density ? 1 : 0;
      const wob = Math.sin(t * p.sp * 2 + p.ph);
      v.set(center[0] + p.x * size[0] + drift[0] * t + Math.sin(t * 0.7 + p.ph) * 0.8, center[1] + p.y * size[1] * (1 - Math.abs(p.x) * 0.8) + wob * 0.4 + drift[1] * t, center[2] + p.z * size[2] + drift[2] * t + Math.cos(t * 0.6 + p.ph) * 0.8);
      e.set(0, Math.atan2(1, 0.3) + p.ph, Math.sin(t * 9 + p.ph) * 0.4); q.setFromEuler(e); sc.setScalar(s * on * (0.7 + p.k * 0.6)); m4.compose(v, q, sc); im.setMatrixAt(i, m4); }
    im.instanceMatrix.needsUpdate = true; } };
  return api;
}

// ---------------------------------------------------------------- PEOPLE + ANIMALS
export function farmer(o = {}) { return bean({ name: 'Farmer', outfit: 'tee', head: 'slouch', headColor: '#b8955a', skin: o.skin || 'fair', hair: 'messy', hairColor: '#6a4a2a', beard: true, beardColor: '#7a5a3a', colors: { main: o.shirt || '#5a7fb5', legs: '#5a4a3a', feet: '#3a2a22' }, seed: o.seed || 7, ...(o.over || {}) }); }
export function cow(o = {}) {
  const g = new THREE.Group(); const W = '#f2ece0', B = '#2e2a28';
  const body = rbox(1.6, 0.8, 0.8, W, 0, 1.0, 0, 0.3); g.add(body);
  for (const [x, z, s] of [[0.3, 0.41, 0.25], [-0.4, -0.41, 0.3], [-0.2, 0.41, 0.18]]) { const sp = ball(s, B, x, 1.1, z, 12); sp.scale.z = 0.12; g.add(sp); }
  const head = new THREE.Group(); head.position.set(0.95, 1.25, 0); g.add(head);
  head.add(rbox(0.5, 0.45, 0.42, W, 0, 0, 0, 0.15), rbox(0.24, 0.3, 0.44, '#e8b0a8', 0.24, -0.08, 0, 0.1));
  for (const s of [-1, 1]) { head.add(ball(0.06, '#141008', 0.12, 0.1, s * 0.2, 10)); const h = cyl(0.03, 0.05, 0.22, '#e8dcc0', -0.05, 0.28, s * 0.14, 8); h.rotation.x = s * 0.5; head.add(h); const ear = ball(0.1, W, -0.1, 0.12, s * 0.27, 10); ear.scale.set(0.5, 0.4, 1); head.add(ear); }
  for (const [x, z] of [[0.55, 0.28], [0.55, -0.28], [-0.55, 0.28], [-0.55, -0.28]]) g.add(cyl(0.09, 0.08, 0.7, W, x, 0.35, z, 8), cyl(0.09, 0.09, 0.08, B, x, 0.04, z, 8));
  const tail = cyl(0.025, 0.025, 0.6, W, -0.82, 0.95, 0, 6); tail.rotation.z = -0.3; g.add(tail);
  g.add(blob(1.0, 0.25)); outline(g, { px: 2.4 });
  g.head = head; g.update = (t, seed = 1) => { head.rotation.z = -0.35 + Math.sin(t * 1.3 + seed) * 0.12; tail.rotation.x = Math.sin(t * 2.5 + seed) * 0.3; };
  return g;
}

// ---------------------------------------------------------------- SETS
// wheat field (instanced stalks) that bends with wind(t)
export function wheatField(st, o = {}) {
  const { w = 30, d = 16, z = -4, seed = 4, x = 0, color = '#e0b452', density = 9 } = o; const r = rng(seed);
  const n = Math.round(w * d * density); const geo = new THREE.ConeGeometry(0.06, 1.0, 4); geo.translate(0, 0.5, 0);
  const im = new THREE.InstancedMesh(geo, toon(color), n); im.receiveShadow = true; im.userData.noOutline = true;
  const cs = ['#e0b452', '#d4a242', '#ebc468', '#c99a3a']; const col = new THREE.Color();
  const P = []; for (let i = 0; i < n; i++) { P.push({ x: x + (r() - 0.5) * w, z: z + (r() - 0.5) * d, ry: r() * 3, h: 0.55 + r() * 0.35, ph: r() * 6 }); im.setColorAt(i, col.set(cs[i % 4])); }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const base = floor(w, d, '#c8a050', x, z); base.position.y = 0.008; st.add(base); st.add(im);
  const api = { mesh: im, update(t, wind = 0.1, eaten = 0) { for (let i = 0; i < n; i++) { const p = P[i]; const b = wind * (0.8 + 0.4 * Math.sin(t * 3 + p.x * 0.4 + p.ph)) + 0.05 * Math.sin(t * 1.5 + p.ph);
      const hh = eaten > 0 && ((i * 7919) % 100) / 100 < eaten ? 0.12 : p.h; e.set(b * 0.9, p.ry, b * 0.4); q.setFromEuler(e); v.set(p.x, 0, p.z); sc.set(1, hh, 1); m4.compose(v, q, sc); im.setMatrixAt(i, m4); }
    im.instanceMatrix.needsUpdate = true; } };
  api.update(0); return api;
}
export function barn(o = {}) { const g = new THREE.Group(); const c = o.color || '#b23a2e';
  g.add(rbox(4, 3, 5, c, 0, 1.5, 0, 0.05));
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 5.3, 3, 1), toon('#5a4a44')); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.scale.set(1, 1, 0.55); roof.position.y = 3.75; roof.castShadow = true; g.add(roof);
  g.add(rbox(1.8, 2.0, 0.1, '#f2ece0', 0, 1.0, 2.52, 0.03), rbox(1.5, 1.7, 0.12, shadeHex(c, -0.15), 0, 0.95, 2.55, 0.03));
  const x1 = cyl(0.05, 0.05, 2.1, '#f2ece0', 0, 0.95, 2.62, 6); x1.rotation.z = 0.72; const x2 = cyl(0.05, 0.05, 2.1, '#f2ece0', 0, 0.95, 2.62, 6); x2.rotation.z = -0.72; g.add(x1, x2);
  outline(g, { px: 2.2 }); return g; }
export function cabin(o = {}) { const f = PR.facade({ w: 5, h: 2.8, d: 3.6, color: o.color || '#a8845a', trim: '#6a5a3a', windows: 2 }); return f; }
// prairie(st, o): big flat land, distant low hills, farm buildings, sunny sky (top colour animatable via darken())
export function prairie(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 3);
  g.add(floor(260, 260, o.ground || '#b8a060', 0, -60));
  const hill = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#a89058')); hill.scale.set(2.2, 0.08, 0.4); hill.position.set(0, 0, -120); hill.userData.noOutline = true; g.add(hill);
  const wheat = o.wheat === false ? null : wheatField(st, { w: o.fieldW || 34, d: o.fieldD || 16, z: o.fieldZ ?? -5, x: o.fieldX || 0, seed: o.seed || 4 });
  if (o.buildings !== false) {
    const b = barn(); b.position.set(-9, 0, -22); b.rotation.y = 0.4; g.add(b);
    const c = cabin(); c.at(7, 0, -20, -0.3); g.add(c);
    const wm = PR.windmill({ h: 6.5 }).at(13, 0, -26, -0.4); g.add(wm); g.windmill = wm;
    const fc = PR.fence({ len: 30 }).at(0, 0, (o.fieldZ ?? -5) + (o.fieldD || 16) / 2 + 0.6); g.add(fc);
  }
  const sky = sunnySky(st, { clouds: 6, seed: o.seed || 3, top: '#3f86c8', mid: '#9fcbec', horizon: '#f2e3bd' });
  const A = sky.dome.material.uniforms; const top0 = A.a.value.clone(), mid0 = A.b.value.clone(), hor0 = A.c.value.clone();
  const dk = [new THREE.Color('#1c1812'), new THREE.Color('#3a3222'), new THREE.Color('#8a7a52')];
  return { group: g, sky, wheat, darken(k) { A.a.value.copy(top0).lerp(dk[0], k); A.b.value.copy(mid0).lerp(dk[1], k * 0.9); A.c.value.copy(hor0).lerp(dk[2], k * 0.6); A.glowK.value = 0.55 * (1 - k); sky.clouds.forEach(c => c.visible = k < 0.6); },
    update(t, wind = 0.1, eaten = 0) { sky.update(t); if (g.windmill) g.windmill.fan.rotation.z = t * (1.5 + wind * 6); if (wheat) wheat.update(t, wind, eaten); } };
}
// Rockies river valley: snowy peaks, a winding river with sandy banks (the breeding grounds)
export function valley(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 9);
  g.add(floor(200, 200, '#8aa060', 0, -50));
  const river = new THREE.Shape(); river.moveTo(-3, 30); river.bezierCurveTo(4, 10, -6, -10, 2, -40); river.lineTo(8, -40); river.bezierCurveTo(1, -10, 9, 10, 3, 30); river.closePath();
  const sand = new THREE.Shape(); sand.moveTo(-8, 30); sand.bezierCurveTo(-1, 10, -11, -10, -3, -40); sand.lineTo(13, -40); sand.bezierCurveTo(6, -10, 14, 10, 8, 30); sand.closePath();
  const sm = new THREE.Mesh(new THREE.ShapeGeometry(sand), toon('#e2c48e')); sm.rotation.x = -Math.PI / 2; sm.position.y = 0.01; sm.receiveShadow = true; g.add(sm);
  const rm = new THREE.Mesh(new THREE.ShapeGeometry(river), toon('#5aa8d8', { emissive: new THREE.Color('#5aa8d8'), emissiveIntensity: 0.2 })); rm.rotation.x = -Math.PI / 2; rm.position.y = 0.02; g.add(rm);
  for (const [x, z, rad, h] of [[-40, -70, 16, 22], [-12, -90, 20, 30], [22, -80, 18, 26], [50, -66, 14, 18], [-60, -50, 12, 14], [70, -100, 22, 28]]) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 7), toon('#7a7a8a')); m.position.set(x, h / 2, z); m.castShadow = true; g.add(m);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.38, h * 0.38, 7), toon('#f4f6fa')); cap.position.set(x, h * 0.81 + 0.05, z); g.add(cap); }
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 70, z = -10 - r() * 40; if (Math.abs(x - 2) < 12) continue; const t = new THREE.Group(); t.add(cyl(0.12, 0.15, 0.8, '#5a4030', 0, 0.4, 0, 6)); const c = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 8), toon('#3e6a44')); c.position.y = 2.0; c.castShadow = true; t.add(c); t.position.set(x, 0, z); g.add(t); }
  outline(g, { px: 2 });
  const sky = sunnySky(st, { clouds: 6, seed: o.seed || 9, top: '#3a7fc8', mid: '#9fcbec' });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// glacier: big icy slabs + peaks; .ice is a translucent block to put frozen locusts in
export function glacier(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(200, 200, '#dfe9f2', 0, -50));
  for (const [x, z, rad, h] of [[-30, -60, 18, 26], [0, -80, 24, 36], [32, -64, 18, 24]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 7), toon('#8a90a0')); m.position.set(x, h / 2, z); g.add(m); const cap = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.55, h * 0.55, 7), toon('#f4f8fc')); cap.position.set(x, h * 0.725 + 0.05, z); g.add(cap); }
  const iceM = toon('#a8d4ec', { emissive: new THREE.Color('#a8d4ec'), emissiveIntensity: 0.1 });
  for (const [x, z, w, h, d, ry] of [[-6, -14, 10, 4, 6, 0.2], [6, -16, 12, 5, 7, -0.15], [0, -26, 22, 7, 8, 0], [-14, -22, 8, 3, 6, 0.4]]) { const b = rbox(w, h, d, '#cfeaf8', x, h / 2, z, 0.6); b.material = iceM; b.rotation.y = ry; g.add(b); }
  outline(g, { px: 2 });
  const sky = sunnySky(st, { clouds: 5, seed: 12, top: '#3a7fc8', mid: '#a8d4f0', horizon: '#eef4f8' });
  return { group: g, sky, update(t) { sky.update(t); } };
}
export function iceBlock(w = 3, h = 2.4, d = 1.4) {
  const m = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#6fb8e6'), transparent: true, opacity: 0.5, roughness: 0.15, metalness: 0, depthWrite: false });
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.y = h / 2; b.renderOrder = 2; b.userData.noOutline = true;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: '#2a6a9a' })); b.add(edges);
  return b;
}
// specimen box: wooden frame, cream backing, a pinned locust, a paper label (canvas texture)
export function specimenBox(o = {}) {
  const g = new THREE.Group();
  g.add(rbox(2.6, 2.0, 0.25, '#6a4a2a', 0, 0, -0.1, 0.05));
  const back = plane(2.3, 1.7, '#f4ecd8', 0, 0, 0.04); g.add(back);
  const lab = canvasTex(512, 160, (x, W, H) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, W, H); x.strokeStyle = '#3a2a1a'; x.lineWidth = 4; x.strokeRect(4, 4, W - 8, H - 8); x.fillStyle = '#2a1c15'; x.font = 'italic 700 40px "Playfair Display", serif'; x.textAlign = 'center'; x.fillText('M. spretus', W / 2, 62); x.font = '800 44px "Nunito", sans-serif'; x.fillText(o.label || '1904 · COLORADO', W / 2, 124); });
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.31), toon('#ffffff', { map: lab })); lm.position.set(0, 0.6, 0.06); lm.rotation.z = -0.03; lm.userData.noOutline = true; g.add(lm);
  const pin = cyl(0.01, 0.01, 0.35, '#c8c8d0', 0, -0.12, 0.25, 6); pin.rotation.x = Math.PI / 2; g.add(pin, ball(0.035, '#d8342c', 0, -0.12, 0.42, 10));
  const L = locust({ seed: 31, scale: 0.6, color: '#8a7a42' }); L.rotation.x = Math.PI / 2; L.update(0, { lid: 1, blink: false, spread: 0.55, noShadow: true }); const LG = new THREE.Group(); LG.add(L); LG.rotation.z = Math.PI; LG.position.set(0, -0.25, 0.07); g.add(LG);
  outline(g, { px: 2.2 }); g.bug = L;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.7), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.08, roughness: 0.05 })); glass.position.z = 0.12; glass.userData.noOutline = true; g.add(glass);
  return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// two-line top caption with per-word colours: lines = [[['bigger','#ffd25a'],['than','#fff']], [['CALIFORNIA','#ff4a3a']]]
export function topCaption(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return; const size = o.size || 92;
  lines.forEach((words, i) => { const k = ease.outBack(clamp((t + (o.lead ?? 0.3) - i * 0.15) / 0.28)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * size * 1.12); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.018);
    g.font = `900 ${size}px "Nunito", sans-serif`; const sp = size * 0.28; const ws = words.map(([w]) => g.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let x = -tot / 2; words.forEach(([w, c], j) => { insT(g, w, x + ws[j] / 2, 0, size, { color: c, stroke: CARD_INK }); x += ws[j] + sp; }); g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: o.text || col, stroke: o.stroke ?? null, maxW: w - s * 0.5 });
  g.restore();
}
// swarm specks over the sky (2D): density 0..1 fills the top of the frame with tiny dark locusts, drifting
export function specks(g, t, density, o = {}) {
  if (density <= 0) return; const r = rng(o.seed || 77); const n = Math.round((o.n || 2600) * density); const y1 = o.y1 ?? E.H * 0.55;
  g.save(); g.fillStyle = o.color || 'rgba(28,22,12,0.9)';
  for (let i = 0; i < n; i++) { const bx = r() * E.W * 1.3 - E.W * 0.15, by = Math.pow(r(), 1.4) * y1, sp = 30 + r() * 90, ph = r() * 6.28, sz = 2.5 + r() * 5 * (o.big || 1);
    const x = ((bx + t * sp * (o.dir ?? 1) + Math.sin(t * 2 + ph) * 12) % (E.W * 1.3) + E.W * 1.3) % (E.W * 1.3) - E.W * 0.15, y = by + Math.sin(t * 3 + ph) * 8;
    if (o.hole) { const [hx, hy, rx, ry] = o.hole; if (((x - hx) / rx) ** 2 + ((y - hy) / ry) ** 2 < 1) continue; }
    g.beginPath(); g.ellipse(x, y, sz, sz * 0.45, Math.sin(t * 8 + ph) * 0.4, 0, 6.283); g.fill(); }
  g.restore();
}
// California silhouette (rough, recognisable) centred at 0,0, height ~1 unit
const CA = [[-0.25, -0.5], [0.08, -0.5], [0.08, -0.12], [0.42, 0.25], [0.45, 0.33], [0.38, 0.42], [0.36, 0.5], [0.12, 0.48], [0.1, 0.42], [-0.02, 0.35], [-0.08, 0.22], [-0.16, 0.12], [-0.2, -0.02], [-0.24, -0.14], [-0.3, -0.3], [-0.28, -0.42]];
export function drawCalifornia(g, x, y, h, o = {}) { g.save(); g.translate(x, y); g.beginPath(); CA.forEach(([px, py], i) => i ? g.lineTo(px * h, py * h) : g.moveTo(px * h, py * h)); g.closePath();
  g.fillStyle = o.fill || '#f2c230'; g.fill(); g.lineWidth = o.lw || 8; g.strokeStyle = CARD_INK; g.lineJoin = 'round'; g.stroke(); g.restore(); }
// swarm blob shape (lumpy cloud) area-scaled
export function drawSwarmBlob(g, x, y, R, t, o = {}) { g.save(); g.translate(x, y); g.beginPath(); const n = 28;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; const rr = R * (1 + 0.09 * Math.sin(a * 5 + t * 1.5) + 0.06 * Math.sin(a * 3 - t)); const px = Math.cos(a) * rr * 1.15, py = Math.sin(a) * rr * 0.92; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.fillStyle = o.fill || 'rgba(40,32,18,0.82)'; g.fill(); g.lineWidth = 8; g.strokeStyle = CARD_INK; g.stroke();
  const r = rng(5); g.fillStyle = 'rgba(200,180,110,0.55)'; for (let i = 0; i < 160; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * R * 0.9; g.beginPath(); g.ellipse(Math.cos(a) * d * 1.1 + Math.sin(t * 3 + i) * 4, Math.sin(a) * d * 0.85, 5, 2.4, a, 0, 6.28); g.fill(); }
  g.restore(); }
// soil cross-section with egg pods; plow passes at px (0..1) and pods it passes pop
export function soilSection(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); const W = 940, H = 760; g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 18, W, H, 26); g.fill();
  g.save(); g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.clip();
  g.fillStyle = '#9fcbec'; g.fillRect(-W / 2, -H / 2, W, 240);
  const gy = -H / 2 + 240; const gr = g.createLinearGradient(0, gy, 0, H / 2); gr.addColorStop(0, '#d8b47a'); gr.addColorStop(1, '#8a6a42'); g.fillStyle = gr; g.fillRect(-W / 2, gy, W, H);
  // grass tufts
  g.fillStyle = '#6a9a4a'; for (let i = 0; i < 24; i++) { const x = -W / 2 + 20 + i * 40; g.beginPath(); g.moveTo(x - 10, gy); g.lineTo(x, gy - 22 - (i % 3) * 6); g.lineTo(x + 10, gy); g.fill(); }
  const px = o.plow ?? 0; const plowX = -W / 2 - 120 + (W + 240) * px;
  // furrow behind the plow
  g.fillStyle = '#7a5a36'; g.beginPath(); g.moveTo(-W / 2, gy); g.lineTo(Math.min(plowX, W / 2), gy); g.lineTo(Math.min(plowX, W / 2), gy + 150); g.lineTo(-W / 2, gy + 150); g.fill();
  // egg pods (little sausage clusters), pop into dust when the plow passes
  const pods = [-340, -170, 0, 170, 340];
  pods.forEach((x, i) => { const y = gy + 95 + (i % 2) * 20; const hit = clamp((plowX - x) / 80);
    if (hit < 1) { g.save(); g.translate(x, y); g.rotate(-0.4 + (i % 3) * 0.3); g.globalAlpha = 1 - hit; g.fillStyle = '#c87a3a'; g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.roundRect(-22, -48, 44, 96, 22); g.fill(); g.stroke();
      g.fillStyle = '#f2d89a'; for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(-8 + (j % 2) * 16, -30 + j * 18, 7, 9, 0, 0, 6.28); g.fill(); } g.restore(); }
    if (hit > 0 && hit < 1.6) { const pr = clamp(hit / 1.0); g.save(); g.globalAlpha = 1 - pr; g.fillStyle = '#e8d0a0'; for (let j = 0; j < 8; j++) { const a = j / 8 * 6.28; g.beginPath(); g.arc(x + Math.cos(a) * 60 * pr, y + Math.sin(a) * 40 * pr, 10 * (1 - pr * 0.5), 0, 6.28); g.fill(); } g.restore(); } });
  // the plow (a simple share + handle)
  g.save(); g.translate(plowX, gy); g.fillStyle = '#5a5a62'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-30, -30); g.lineTo(40, 150); g.lineTo(-10, 150); g.lineTo(-60, -30); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#7a5a32'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-45, -30); g.lineTo(-170, -190); g.stroke(); g.restore();
  g.restore();
  g.lineWidth = 10; g.strokeStyle = '#f2f0e6'; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.stroke();
  insT(g, o.title || 'LOCUST EGG PODS', 0, gy + H / 2 - 40 + 180 - 240 + 300, 50, { color: '#ffffff', stroke: CARD_INK });
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex };
