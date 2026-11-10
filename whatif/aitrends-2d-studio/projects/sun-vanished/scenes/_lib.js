// sun-vanished: shared helpers (underscore = not auto-loaded). A sunny picnic with the I.Awaken cast, a toon Sun,
// a toon Earth with eyes in space, the same park in the dark and frozen, Dr Lin's chalkboard.
import { wordTime, rng, clamp, lerp, ease, E } from '/engine/core.js';
import { THREE, toonStage, toon, flat, outline, ball, cyl, rbox, blob, canvasTex, INK } from '/kits/toon3d/toon.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { castMember, cat } from '/kits/toon3d/cast.js';
import { project } from '/kits/toon3d/react.js';

export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
const texFloor = (w, d, tex) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), PR.texMat(tex)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.userData.noOutline = true; return m; };

export function tree(o = {}) {
  const { s = 1, seed = 2, leaf = ['#5f9a45', '#6fae50', '#4f8a3c'] } = o; const r = rng(seed); const g = new THREE.Group();
  g.add(cyl(0.16 * s, 0.26 * s, 2.6 * s, '#7a5634', 0, 1.3 * s, 0, 10));
  for (let i = 0; i < 6; i++) { const a = r() * Math.PI * 2, d = i ? 0.5 + r() * 0.6 : 0; g.add(ball((0.85 + r() * 0.35) * s, leaf[i % 3], Math.cos(a) * d * s, (3.0 + r() * 0.9) * s, Math.sin(a) * d * s, 14)); }
  g.add(blob(1.6 * s, 0.25)); outline(g, { px: 2.4 }); return g;
}
// starfield: points on a big sphere (deterministic), optional twinkle via size
export function stars(n = 900, R = 180, seed = 4) {
  const r = rng(seed); const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); p[i * 3] = Math.cos(a) * s * R; p[i * 3 + 1] = Math.abs(u) * R * 0.95 + 2; p[i * 3 + 2] = Math.sin(a) * s * R; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.95, fog: false })); m.userData.noOutline = true; m.frustumCulled = false; return m;
}
// full-sphere stars for space shots
export function spaceStars(n = 1400, R = 200, seed = 9) {
  const r = rng(seed); const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); p[i * 3] = Math.cos(a) * s * R; p[i * 3 + 1] = u * R; p[i * 3 + 2] = Math.sin(a) * s * R; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.7, sizeAttenuation: false })); m.userData.noOutline = true; m.frustumCulled = false; return m;
}

// toon Sun: emissive ball + soft glow sprite + a ring of flame bumps; .pulse(t), .vanish(k 0..1)
export function sun(o = {}) {
  const { r = 6 } = o; const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), flat('#ffd84a')); core.userData.noOutline = true; g.add(core);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(r * 0.985, 40, 28), flat('#ffb52a')); inner.userData.noOutline = true; inner.position.z = -0.01;
  const bumps = new THREE.Group(); g.add(bumps); for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(r * 0.22, 16, 12), flat(i % 2 ? '#ffc23a' : '#ffe06a')); b.position.set(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95, 0); b.userData.noOutline = true; bumps.add(b); }
  const gl = FX.glow(r * 5.5, '#ffd26a', 0.75); g.add(gl); const gl2 = FX.glow(r * 2.8, '#fff2b0', 0.9); g.add(gl2);
  g.pulse = (t) => { bumps.rotation.z = t * 0.25; bumps.children.forEach((b, i) => b.scale.setScalar(1 + 0.18 * Math.sin(t * 3 + i * 1.3))); gl.material.opacity = 0.7 + 0.08 * Math.sin(t * 2); };
  g.vanish = (k) => { if (k <= 0) { g.scale.setScalar(1); g.visible = true; return; } if (k >= 1) { g.visible = false; return; } const q = k < 0.3 ? 1 + 0.2 * Math.sin((k / 0.3) * Math.PI / 2) : 1.2 * (1 - Math.pow((k - 0.3) / 0.7, 2)); g.scale.setScalar(Math.max(0.001, q)); g.visible = true; };
  return g;
}
// toon Earth with big eyes (faces +Z). .update(t, { lid, look:[x,y], spin })
export function earth(o = {}) {
  const { r = 1 } = o; const root = new THREE.Group();
  const tex = canvasTex(512, 256, (g, W, H) => { g.fillStyle = '#3a8ad8'; g.fillRect(0, 0, W, H); const rr = rng(5); g.fillStyle = '#5fb04a';
    for (const [x, y, w, h] of [[60, 70, 90, 70], [120, 140, 50, 80], [250, 60, 70, 60], [270, 120, 60, 90], [360, 70, 110, 60], [420, 160, 50, 40], [20, 200, 30, 20]]) { g.beginPath(); g.ellipse(x, y, w / 2, h / 2, rr() * 3, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + w * 0.3, y + h * 0.2, w / 3, h / 3, rr() * 3, 0, 7); g.fill(); }
    g.fillStyle = '#f4f8fb'; g.fillRect(0, 0, W, 16); g.fillRect(0, H - 14, W, 14); }, { wrap: true });
  const planet = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), toon('#ffffff', { map: tex })); planet.castShadow = false; root.add(planet);
  const clouds = new THREE.Group(); root.add(clouds); for (let i = 0; i < 6; i++) { const a = i * 1.1; const c = new THREE.Mesh(new THREE.SphereGeometry(r * 0.16, 12, 8), toon('#ffffff')); c.scale.set(1.6, 0.4, 1); c.position.set(Math.cos(a) * r * 1.0, (i % 3 - 1) * r * 0.45, Math.sin(a) * r * 1.0); c.lookAt(0, c.position.y, 0); c.userData.noOutline = true; clouds.add(c); }
  const head = new THREE.Group(); root.add(head);
  const sph = new THREE.SphereGeometry(1, 20, 14); const lidM = toon('#3378c4');
  const eyes = [-1, 1].map(s => { const eg = new THREE.Group(); const n = new THREE.Vector3(s * 0.32, 0.2, 0.93).normalize(); eg.position.copy(n).multiplyScalar(r * 0.98); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(r * 0.22, r * 0.27, r * 0.12); head.add(eg);
    const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.4; eg.add(w);
    const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.4, 0.44, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
    const lp = new THREE.Group(); eg.add(lp); const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), lidM); lid.userData.noOutline = true; lp.add(lid);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim); return { eg, pg, lp }; });
  outline(root, { px: 3 });
  root.update = (t, u = {}) => { const { lid = 0.3, look = [0, 0], spin = 0.3, pupil = 1 } = u; planet.rotation.y = t * spin; clouds.rotation.y = t * spin * 1.3;
    const bl = ((t + 0.7) % 3.6) < 0.13 ? 1 : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); e.pg.scale.setScalar(pupil); }); };
  root.head = head; root.eyes = eyes; root.headR = r * 0.9; root.update(0); return root;
}
// space: dark stage + stars; returns { stage, sunObj, earthObj, orbit, ghost, rings }
export function space(T, o = {}) {
  const st = toonStage(T, { light: 'warm', bg: ['#04050d', '#0b1030', '#141a44'], fov: o.fov || 40, shadow: false, ambient: 1.3, key: ['#fff2d8', 2.2, [-10, 4, 6]] });
  st.add(spaceStars()); const s = { stage: st };
  s.sun = sun({ r: o.sunR || 3 }); s.sun.position.set(...(o.sunAt || [0, 0, 0])); st.add(s.sun);
  s.earth = earth({ r: o.earthR || 0.75 }); st.add(s.earth);
  const R = o.orbitR || 9; s.R = R;
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(R, 0.03, 6, 160), new THREE.MeshBasicMaterial({ color: '#9fb6ff', transparent: true, opacity: 0.45 })); orbit.rotation.x = Math.PI / 2; orbit.userData.noOutline = true; st.add(orbit); s.orbit = orbit;
  const ghost = new THREE.Mesh(new THREE.TorusGeometry(o.sunR || 3, 0.06, 6, 64), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0 })); ghost.userData.noOutline = true; st.add(ghost); s.ghost = ghost;
  s.rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 120), new THREE.MeshBasicMaterial({ color: '#c8e0ff', transparent: true, opacity: 0 })); m.rotation.x = Math.PI / 2; m.userData.noOutline = true; st.add(m); return m; });
  // place Earth on the orbit at angle a (radians); faces the camera side (+Z) with a slight turn
  s.placeEarth = (a, y = 0) => { s.earth.position.set(Math.cos(a) * R, y, Math.sin(a) * R); };
  // expanding ring(s) from the sun spot: k 0..1 reaches the orbit
  s.ripple = (t, t0, dur = 2.2) => { s.rings.forEach((m, i) => { const k = (t - t0 - i * 0.25) / dur; m.visible = k > 0 && k < 1.05; const rr = Math.max(0.01, k) * R; m.scale.set(rr, rr, 1); m.material.opacity = 0.75 * (1 - Math.max(0, k - 0.75) * 4); }); };
  return s;
}

// the park picnic (sunny) with the cast; the sun sits in the sky in the key light's direction
export function park(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0.5] });
  const s = { stage: st };
  if (!o.dark) { s.sky = sunnySky(st, { clouds: 8, seed: o.seed || 3 }); s.skySun = sun({ r: 9 }); s.skySun.position.set(...(o.sunPos || [-22, 40, -120])); st.add(s.skySun); }
  const grass = texFloor(200, 200, PR.TEX.plaster(o.ground || '#86b85a', [20, 20])); grass.position.z = -40; st.add(grass); s.grass = grass;
  const cloth = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#f6efe2'; g.fillRect(0, 0, W, H); g.fillStyle = '#d6453a'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) g.fillRect(i * 32, j * 32, 32, 32); });
  const bl = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6), toon('#ffffff', { map: cloth })); bl.rotation.x = -Math.PI / 2; bl.position.set(0, 0.01, 1.2); bl.receiveShadow = true; bl.userData.noOutline = true; st.add(bl);
  const basket = new THREE.Group(); basket.add(rbox(0.7, 0.45, 0.5, '#b07a3a', 0, 0.22, 0, 0.06)); const h = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 20, Math.PI), toon('#8a5a2a')); h.position.y = 0.45; basket.add(h); outline(basket, { px: 2.4 }); basket.position.set(1.2, 0, 0.5); st.add(basket);
  const plate = cyl(0.3, 0.26, 0.04, '#f6f2ea', -0.3, 0.03, 1.7, 22); st.add(plate);
  const sand = new THREE.Group(); sand.add(rbox(0.36, 0.05, 0.3, '#f2d79a', 0, 0, 0, 0.02), rbox(0.38, 0.03, 0.32, '#6ab04a', 0, 0.035, 0, 0.01), rbox(0.36, 0.05, 0.3, '#f2d79a', 0, 0.07, 0, 0.02)); outline(sand, { px: 2 }); sand.position.set(-0.3, 0.08, 1.7); st.add(sand);
  st.add(tree({ s: 1.3, seed: 2, leaf: o.leaf }).translateX(-5).translateZ(-4), tree({ s: 1.1, seed: 5, leaf: o.leaf }).translateX(5.5).translateZ(-6), tree({ s: 1.5, seed: 8, leaf: o.leaf }).translateX(-12).translateZ(-20), tree({ s: 1.2, seed: 9, leaf: o.leaf }).translateX(11).translateZ(-18), tree({ s: 1.4, seed: 11, leaf: o.leaf }).translateX(1).translateZ(-26));
  const hill = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.hill || '#6f9e4a')); hill.scale.set(1.8, 0.14, 0.4); hill.position.set(0, 0, -80); hill.userData.noOutline = true; st.add(hill);
  // cast: HERO sits on the blanket, DEV films, MINA with the stopwatch, BISCUIT sunbathes
  if (o.cast !== false) {
    s.hero = castMember('hero', { hood: 'down' }); s.hero.position.set(-0.2, 0, 1.1); st.add(s.hero);
    s.dev = castMember('dev'); s.dev.position.set(1.6, 0, 1.3); s.dev.rotation.y = -0.4; st.add(s.dev);
    s.mina = castMember('mina'); s.mina.position.set(-1.7, 0, 1.4); s.mina.rotation.y = 0.35; st.add(s.mina);
    s.cat = cat(); s.cat.position.set(0.9, 0, 2.2); s.cat.rotation.y = -0.3; st.add(s.cat);
  }
  s.sand = sand; s.update = (t) => { s.sky?.update(t); s.skySun?.pulse(t); };
  return s;
}
// chalkboard on legs with Dr Lin's diagram
export function chalkboard() {
  const t = canvasTex(768, 512, (g, W, H) => { g.fillStyle = '#26332c'; g.fillRect(0, 0, W, H); g.strokeStyle = '#f2ead6'; g.fillStyle = '#f2ead6'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.arc(130, 210, 70, 0, 7); g.setLineDash([16, 14]); g.stroke(); g.setLineDash([]); g.font = '700 40px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('SUN', 130, 325);
    g.beginPath(); g.arc(640, 210, 34, 0, 7); g.stroke(); g.fillText('EARTH', 640, 300);
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(130, 210, 110 + i * 110, -0.35, 0.35); g.stroke(); }
    g.font = '700 46px Fredoka, sans-serif'; g.fillStyle = '#ffd25a'; g.fillText('GRAVITY = SPEED OF LIGHT', W / 2, 420); g.fillStyle = '#f2ead6'; g.font = '700 34px Fredoka, sans-serif'; g.fillText('8 min 20 s', 390, 120); });
  const g = new THREE.Group(); g.add(rbox(3.2, 2.2, 0.12, '#7a5032', 0, 2.0, 0, 0.04)); const b = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), toon('#ffffff', { map: t, emissive: new THREE.Color('#202820'), emissiveIntensity: 0.3 })); b.position.set(0, 2.0, 0.07); b.userData.noOutline = true; g.add(b);
  for (const sx of [-1, 1]) g.add(cyl(0.05, 0.05, 1.2, '#6a4228', sx * 1.4, 0.6, -0.05, 8)); outline(g, { px: 2.6 }); return g;
}
// 2D stopwatch readout pill near a 3D point (logical units): mm:ss
export function readout(g, st, obj, secs, o = {}) {
  const v = new THREE.Vector3(); obj.getWorldPosition(v); const p = project(st, v); const x = o.pos ? o.pos[0] : p.x + (o.dx ?? 0), y = o.pos ? o.pos[1] : p.y + (o.dy ?? -120); const s = o.scale ?? 1;
  const m = Math.floor(secs / 60), ss = Math.floor(secs % 60); const txt = `${m}:${String(ss).padStart(2, '0')}`;
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#fbf8f2'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-120, -56, 240, 112, 30); g.fill(); g.stroke();
  g.font = '900 84px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = o.color || INK; g.fillText(txt, 0, 4); g.restore();
}
