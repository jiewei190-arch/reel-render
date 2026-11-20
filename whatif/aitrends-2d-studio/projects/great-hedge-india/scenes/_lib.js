// The Great Hedge of India — shared assets: the endless thorn hedge on its raised bank (instanced), the dusty plain,
// a horse + a British officer rider (pith helmet), customs men (uniform, mixed Indian/British, dignified), a customs post,
// salt sacks, a library, plus 2D overlay helpers (hook text, stamps, India map with the line, history book, 3 trips).
// Tone guard (MAIN): the salt tax hurt ordinary people. No jokes about guards or villagers; the WTF is the scale and the
// forgetting. Indian workers/villagers shown respectfully, no caricature. Underscore = not auto-loaded.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex, POSE, addPose } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 16, 12);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- HEDGE
// hedge({ z0, z1, h, w, seed, state: 'live'|'brown'|'mound', near }) along the Z axis at x = 0. Raised earth bank + clumps of
// thorny bushes (instanced spheres, no outline: reads as foliage) + thorn spikes on the near part. h = top height (12 ft ~ 4.9).
export function hedge(o = {}) {
  const { z0 = 30, z1 = -420, h = 4.4, w = 3.0, seed = 5, state = 'live', near = 40 } = o; const r = rng(seed);
  const g = new THREE.Group(); const L = z0 - z1;
  const bankC = state === 'mound' ? '#7d9046' : '#a98a5c';
  const bank = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, L, 12, 1, false, -Math.PI / 2, Math.PI), toon(bankC));
  bank.scale.set(w * 0.75 * (state === 'mound' ? 1.1 : 1), 1, state === 'mound' ? 1.0 : 0.5); bank.rotation.set(-Math.PI / 2, 0, 0); bank.position.set(0, 0, (z0 + z1) / 2); bank.receiveShadow = true; bank.castShadow = true;
  // half-cylinder lying along Z: rotate so the round side is up
  g.add(bank); bank.userData.noOutline = true;
  if (state === 'mound') { // a few grass tufts on the embankment
    const tm = toon('#6f8a42'); const cnt = Math.floor(L * 1.2); const im = new THREE.InstancedMesh(sph, tm, cnt); const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
    for (let i = 0; i < cnt; i++) { const z = z0 - r() * L, x = (r() - 0.5) * w * 1.1; const s = 0.15 + r() * 0.25; const rx = w * 0.75 * 1.1; P.set(x, 1.0 * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2)), z); S.set(s, s * 0.6, s); M4.compose(P, q, S); im.setMatrixAt(i, M4); }
    im.castShadow = true; im.userData.noOutline = true; g.add(im);
    return Object.assign(g, { H: 1.0 });
  }
  const cols = state === 'brown' ? ['#7d6a3e', '#6e5a34', '#8a7448', '#5e4e2e'] : ['#3f6b34', '#4c7a3a', '#365e2e', '#5a8642'];
  const step = 0.7, n = Math.floor(L / step); const per = 4; const ims = cols.map(c => { const im = new THREE.InstancedMesh(sph, toon(c), n * per); im.castShadow = true; im.receiveShadow = true; im.userData.noOutline = true; im.count = 0; g.add(im); return im; });
  const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
  for (let i = 0; i < n; i++) { const z = z0 - i * step - r() * 0.3; const far = (z0 - z) > near;
    for (let k = 0; k < per; k++) { const y = 0.5 + (k / per) * (h - 1.2) + r() * 0.6; const rad = (w * 0.5) * (1 - k / per * 0.45) * (0.75 + r() * 0.4);
      const im = ims[Math.floor(r() * cols.length)]; P.set((r() - 0.5) * w * 0.35, y, z); S.set(rad, rad * (0.8 + r() * 0.3), rad * 0.9); q.setFromEuler(new THREE.Euler(0, r() * 6, 0)); M4.compose(P, q, S); im.setMatrixAt(im.count++, M4); } }
  ims.forEach(im => { im.instanceMatrix.needsUpdate = true; });
  // thorns on the near part (both sides): pale little cones poking out
  const tc = Math.floor(Math.min(near, L) / 0.25); const thorn = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.32, 5), toon(state === 'brown' ? '#c9b48a' : '#e6dcb8'), tc * 2); thorn.userData.noOutline = true;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < tc * 2; i++) { const side = i % 2 ? 1 : -1; const z = z0 - r() * Math.min(near, L); const y = 0.6 + r() * (h - 1.0); const rx = w * 0.42 * (1 - (y / h) * 0.4);
    P.set(side * rx, y, z); const d = new THREE.Vector3(side, (r() - 0.3) * 0.8, (r() - 0.5) * 0.8).normalize(); q.setFromUnitVectors(up, d); S.set(1, 0.7 + r() * 0.8, 1); M4.compose(P, q, S); thorn.setMatrixAt(i, M4); }
  g.add(thorn);
  return Object.assign(g, { H: h });
}

// acacia-ish flat-topped tree
export function acacia(o = {}) { const { s = 1, seed = 2 } = o; const r = rng(seed); const g = new THREE.Group();
  const tr = cyl(0.12 * s, 0.2 * s, 2.6 * s, '#6a4e36', 0, 1.3 * s, 0, 8); tr.rotation.z = (r() - 0.5) * 0.25; g.add(tr);
  for (let i = 0; i < 4; i++) { const b = ball((0.9 + r() * 0.5) * s, ['#6f8a48', '#5f7a3c', '#7a9452'][i % 3], (r() - 0.5) * 1.8 * s, (2.7 + r() * 0.3) * s, (r() - 0.5) * 1.2 * s, 12); b.scale.y = 0.38; g.add(b); }
  outline(g, { px: 2.2 }); g.add(blob(1.3 * s, 0.2)); return g; }

// the plain: dusty ochre ground, a dirt road beside the hedge, scattered trees, low far hills, sunny sky, haze fog
export function plains(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4);
  g.add(floor(900, 900, o.ground || '#d8b878', 0, -200));
  if (o.road !== false) { const rd = floor(3.2, 900, '#c9a466', o.roadX ?? 3.6, -200); rd.position.y = 0.012; g.add(rd); }
  for (let i = 0; i < (o.trees ?? 26); i++) { const side = r() < 0.5 ? -1 : 1; const t = acacia({ s: 0.8 + r() * 0.6, seed: i + 3 }); t.position.set(side * (9 + r() * 40), 0, 10 - r() * 260); g.add(t); }
  for (let i = 0; i < 40; i++) { const b = ball(0.25 + r() * 0.35, '#9aa45a', (r() < 0.5 ? -1 : 1) * (5 + r() * 25), 0.15, 8 - r() * 80, 8); b.scale.y = 0.55; b.userData.noOutline = true; g.add(b); }
  for (const [x, z, rr2, hh] of [[-120, -330, 70, 16], [40, -360, 90, 12], [180, -320, 60, 18], [-260, -300, 80, 10]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), toon(o.hill || '#b49a78')); m.scale.set(rr2, hh, 30); m.position.set(x, 0, z); m.userData.noOutline = true; g.add(m); }
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3, horizon: o.horizon || '#f4e2c0', ...(o.sky || {}) });
  if (o.fog !== false) st.scene.fog = new THREE.Fog(new THREE.Color(o.fogC || '#eedcbc'), o.fogNear ?? 60, o.fogFar ?? 330);
  return { group: g, sky, update(t) { sky.update(t); } };
}

// ---------------------------------------------------------------- PEOPLE
// pith helmet added to a bean's head (head: 'none', hair hidden under it)
export function pith(b, c = '#f1ead6') { const R = 0.48; const head = b.parts.head; const hm = toon(c);
  const dome = mesh(new THREE.SphereGeometry(R * 1.12, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), hm); dome.scale.set(1, 1.05, 1.12); dome.position.set(0, R * 0.38, -R * 0.02); head.add(dome);
  const brim = mesh(new THREE.CylinderGeometry(R * 1.45, R * 1.5, R * 0.06, 30), hm); brim.scale.set(1, 1, 1.18); brim.position.set(0, R * 0.38, -R * 0.02); brim.rotation.x = 0.06; head.add(brim);
  const band = mesh(new THREE.CylinderGeometry(R * 1.13, R * 1.14, R * 0.14, 28), toon('#b8a27a')); band.scale.set(1, 1, 1.12); band.position.set(0, R * 0.48, -R * 0.02); head.add(band);
  const knob = mesh(sph, hm, R * 0.12, R * 0.08, R * 0.12); knob.position.set(0, R * 1.58, 0); head.add(knob);
  outline(head, { px: 3 }); return b; }
export function officer(o = {}) { const b = bean({ name: 'Officer', outfit: 'uniform', head: 'none', skin: o.skin || 'fair', hair: 'bald', moustache: '#8a5a32', colors: { main: o.color || '#d9c79a', belt: '#5a3a22' }, seed: o.seed || 5, ...(o.over || {}) }); return pith(b); }
// customs man (most of the line's staff were Indian): khaki uniform, dark puggaree-style cap (a plain round cap, no caricature)
export function customsMan(o = {}) { return bean({ name: 'Customs', outfit: 'uniform', head: 'cap', headColor: o.cap || '#6e5a3a', skin: o.skin || 'brown', hair: 'bowl', hairColor: '#1e1612', moustache: o.moustache ?? true, colors: { main: o.color || '#b59a68', belt: '#4a3220' }, seed: o.seed || 9, ...(o.over || {}) }); }
export function villager(o = {}) { return bean({ name: 'Villager', outfit: 'tunic', head: 'none', skin: o.skin || 'tan', hair: o.hair || 'swoop', hairColor: '#1e1612', colors: { main: o.color || '#e8dcc0', belt: '#a0522d' }, seed: o.seed || 21, ...(o.over || {}) }); }
export function conservator(o = {}) { return bean({ name: 'Conservator', outfit: 'tee', head: 'none', skin: 'fair', hair: 'horseshoe', hairColor: '#d8d2c8', browColor: '#bdb5a8', glasses: true, colors: { main: o.color || '#5a7a9a', print: '#5a7a9a' }, seed: o.seed || 31, ...(o.over || {}) }); }

// ---------------------------------------------------------------- HORSE (+ rider)
// horse({ color }) faces +Z, ~2.9 long, back at y ~1.75. .update(t, { walk 0..1 (gait amount), speed (cycles/s), headUp })
export function horse(o = {}) {
  const C = o.color || '#8a5a36', C2 = shadeHex(C, -0.25), hoofC = '#2e2420', maneC = o.mane || '#3a2618';
  const root = new THREE.Group(); const g = new THREE.Group(); root.add(g); const fur = toon(C), dark = toon(C2), mane = toon(maneC);
  const body = mesh(new THREE.CapsuleGeometry(0.55, 1.5, 8, 18).rotateX(Math.PI / 2), fur); body.position.y = 1.75; g.add(body);
  const neckP = new THREE.Group(); neckP.position.set(0, 2.0, 0.95); g.add(neckP);
  const neck = mesh(new THREE.CapsuleGeometry(0.3, 0.9, 6, 14), fur); neck.position.set(0, 0.45, 0.2); neck.rotation.x = 0.55; neckP.add(neck);
  const headG = new THREE.Group(); headG.position.set(0, 0.95, 0.55); neckP.add(headG);
  const head = mesh(new THREE.CapsuleGeometry(0.22, 0.6, 6, 14), fur); head.rotation.x = 1.25; head.position.set(0, -0.05, 0.25); headG.add(head);
  const muzzle = mesh(sph, dark, 0.2, 0.18, 0.22); muzzle.position.set(0, -0.2, 0.62); headG.add(muzzle);
  for (const s of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(0.07, 0.22, 8), fur); e.position.set(s * 0.13, 0.22, 0.05); e.rotation.z = -s * 0.25; headG.add(e);
    const ey = mesh(sph, flat('#1a1210'), 0.05, 0.06, 0.04); ey.position.set(s * 0.19, 0.05, 0.32); ey.userData.noOutline = true; headG.add(ey);
    const gl = mesh(sph, flat('#ffffff'), 0.016, 0.016, 0.01); gl.position.set(s * 0.21, 0.07, 0.355); gl.userData.noOutline = true; headG.add(gl); }
  for (let i = 0; i < 5; i++) { const m = mesh(sph, mane, 0.1, 0.16, 0.14); m.position.set(0, 0.62 + i * -0.12 + 0.2, 0.0 - i * 0.18 + 0.4); m.position.set(0, 0.95 - i * 0.2, -0.05 - i * 0.12 + 0.3); neckP.add(m); }
  const tailP = new THREE.Group(); tailP.position.set(0, 2.0, -1.25); g.add(tailP); const tail = mesh(new THREE.CapsuleGeometry(0.1, 0.8, 4, 8), mane); tail.position.set(0, -0.45, -0.12); tail.rotation.x = -0.35; tailP.add(tail);
  const saddle = rbox(0.95, 0.12, 0.8, '#5a3420', 0, 2.27, 0.1, 0.05); g.add(saddle); const cloth = rbox(1.15, 0.05, 0.95, '#2f4a6a', 0, 2.2, 0.1, 0.02); g.add(cloth);
  const legs = []; for (const [x, z, ph] of [[-0.3, 0.8, 0], [0.3, 0.8, Math.PI], [-0.3, -0.85, Math.PI], [0.3, -0.85, 0]]) { const p = new THREE.Group(); p.position.set(x, 1.5, z); g.add(p);
    const up = mesh(new THREE.CapsuleGeometry(0.13, 0.55, 4, 10), fur); up.position.y = -0.4; p.add(up); const kn = new THREE.Group(); kn.position.y = -0.75; p.add(kn);
    const lo = mesh(new THREE.CapsuleGeometry(0.09, 0.45, 4, 10), fur); lo.position.y = -0.3; kn.add(lo); const hf = mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.12, 10), toon(hoofC)); hf.position.y = -0.62; kn.add(hf); legs.push({ p, kn, ph }); }
  outline(g, { px: 2.6 }); const bl = blob(1.3, 0.25); bl.scale.set(0.7, 1.4, 1); root.add(bl);
  root.update = (t, u = {}) => { const { walk = 1, speed = 1.3, headUp = 0 } = u; const w = t * speed * Math.PI * 2;
    legs.forEach(L => { const s = Math.sin(w + L.ph); L.p.rotation.x = s * 0.38 * walk; L.kn.rotation.x = Math.max(0, -Math.cos(w + L.ph)) * 0.7 * walk; });
    g.position.y = Math.abs(Math.sin(w)) * 0.06 * walk; neckP.rotation.x = Math.sin(w * 2) * 0.05 * walk - headUp * 0.3; tailP.rotation.y = Math.sin(t * 2.3) * 0.25; tailP.rotation.x = -0.2 + Math.sin(t * 3.1) * 0.06; };
  root.saddleY = 2.3; root.body = g; root.update(0); return root;
}
// rider: an officer sitting astride; call rider.sync(horse) after horse.update
export function mount(h, rd) { h.add(rd); rd.position.set(0, h.saddleY - 0.95, 0.05);
  const P = addPose(POSE.stand, { legL: [1.1, 0.55], legR: [1.1, 0.55], kneeL: 1.2, kneeR: 1.2, armL: [0.75, 0.15, 0], armR: [0.75, 0.15, 0], elbowL: 0.9, elbowR: 0.9 });
  rd.ridePose = (t, extra = {}) => { rd.position.y = h.saddleY - 0.95 + h.body.position.y; rd.pose(addPose(P, extra)); }; return rd; }

// ---------------------------------------------------------------- PROPS
export function saltSack(o = {}) { const g = new THREE.Group(); const c = o.color || '#e8dfc8';
  const s = mesh(new THREE.CapsuleGeometry(0.42, 0.5, 6, 14), toon(c)); s.position.y = 0.72; s.scale.set(1, 1, 0.8); g.add(s);
  const tie = mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.1, 10), toon('#a8885a')); tie.position.y = 1.4; g.add(tie); const top = mesh(sph, toon(c), 0.18, 0.14, 0.18); top.position.y = 1.52; g.add(top);
  if (o.label) { const tx = canvasTex(256, 128, (x, W, H) => { x.fillStyle = '#f4ecd6'; x.fillRect(0, 0, W, H); x.fillStyle = '#3a2a1a'; x.font = '900 72px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText(o.label, W / 2, 92); });
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), toon('#ffffff', { map: tx })); lb.position.set(0, 0.78, 0.35); lb.userData.noOutline = true; g.add(lb); }
  outline(g, { px: 2.6 }); g.add(blob(0.6, 0.3)); return g; }
export function saltPile(o = {}) { const g = new THREE.Group(); const m = mesh(new THREE.ConeGeometry(o.r || 0.9, o.h || 0.8, 18), toon('#f6f3ea', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15 })); m.position.y = (o.h || 0.8) / 2; g.add(m); outline(g, { px: 2.4 }); return g; }
// a customs post ("choki"): a small whitewashed hut with a flat roof, a striped barrier pole across the road
export function customsPost(o = {}) { const g = new THREE.Group();
  g.add(rbox(3.2, 2.6, 2.6, '#efe6d2', 0, 1.3, 0, 0.06), rbox(3.6, 0.22, 3.0, '#b98a5a', 0, 2.7, 0, 0.05), rbox(0.9, 1.7, 0.1, '#5a3a24', 0.6, 0.85, 1.31, 0.02), rbox(0.7, 0.6, 0.1, '#4a6a8a', -0.8, 1.5, 1.31, 0.02));
  const sign = canvasTex(512, 128, (x, W, H) => { x.fillStyle = '#2f4a3a'; x.fillRect(0, 0, W, H); x.fillStyle = '#f4ecd6'; x.font = '900 76px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText(o.label || 'CUSTOMS', W / 2, 92); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), toon('#ffffff', { map: sign })); sg.position.set(0, 2.25, 1.33); sg.userData.noOutline = true; g.add(sg);
  const post = cyl(0.1, 0.12, 1.3, '#5a4030', 2.3, 0.65, 1.6, 8); g.add(post);
  const pole = new THREE.Group(); pole.position.set(2.3, 1.2, 1.6); g.add(pole);
  for (let i = 0; i < 6; i++) { const seg = cyl(0.07, 0.07, 0.6, i % 2 ? '#f4f0e6' : '#c0392b', 0.3 + i * 0.6, 0, 0, 8); seg.rotation.z = Math.PI / 2; pole.add(seg); }
  outline(g, { px: 2.4 }); g.pole = pole; g.add(blob(2.4, 0.25)); return g; }
export function cart(o = {}) { const c = PR.cart ? PR.cart() : new THREE.Group(); return c; }
// a library: tall shelves of books, a reading desk with a lamp, warm light
export function library(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#7a5a40', 0, 0)); const wall = plane(30, 10, '#6a4a3a', 0, 5, -3.2); g.add(wall);
  const r = rng(11); const bookC = ['#8a2a22', '#2a4a6a', '#3a5a2a', '#7a6a2a', '#5a2a4a', '#a8743a', '#2a2a3a'];
  for (const sx of [-3.6, 0, 3.6]) { const sh = new THREE.Group(); sh.position.set(sx, 0, -2.7); g.add(sh); sh.add(rbox(3.2, 6.4, 0.9, '#5a3a24', 0, 3.2, 0, 0.04));
    for (let row = 0; row < 5; row++) { const y = 0.5 + row * 1.22; sh.add(box(3.0, 0.08, 0.85, '#4a2e1c', 0, y - 0.05, 0.05)); let x = -1.4; while (x < 1.35) { const w = 0.12 + r() * 0.12, hh = 0.7 + r() * 0.35; sh.add(box(w, hh, 0.6, bookC[Math.floor(r() * bookC.length)], x + w / 2, y + hh / 2, 0.1)); x += w + 0.01; } } }
  const desk = PR.fieldDesk(); desk.position.set(0, 0, 1.0); g.add(desk);
  outline(g, { px: 2 });
  return { group: g, desk, update() {} };
}

// ---------------------------------------------------------------- 2D OVERLAYS
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.12) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (o.lh || 100)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.012);
    // per-word colours: [[text, colour], ...]
    if (Array.isArray(l)) { const size = (o.sizes && o.sizes[i]) || o.size || 72; g.font = `900 ${size}px "Nunito"`; const parts = l.map(([s]) => s); const ws = parts.map(s => g.measureText(s).width); const sp = size * 0.28; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
      const sc = Math.min(1, (E.W * 0.9) / tot); g.scale(sc, sc); let x = -tot / 2; l.forEach(([s, c], j) => { insT(g, s, x + ws[j] / 2, 0, size, { color: c || '#ffffff', stroke: CARD_INK }); x += ws[j] + sp; }); }
    else insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 72, { color: '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 });
    g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: w - s * 0.5 });
  g.restore();
}
// stylised India outline (not to scale; a recognisable silhouette) in a W x H box centred at 0,0
const INDIA = [[0.30, 0.02], [0.42, 0.06], [0.47, 0.16], [0.56, 0.22], [0.66, 0.30], [0.80, 0.31], [0.92, 0.27], [0.97, 0.34], [0.88, 0.40], [0.80, 0.42], [0.74, 0.44], [0.70, 0.52], [0.62, 0.58], [0.55, 0.68], [0.50, 0.80], [0.45, 0.93], [0.41, 0.98], [0.37, 0.90], [0.33, 0.76], [0.30, 0.62], [0.24, 0.54], [0.14, 0.50], [0.06, 0.44], [0.12, 0.38], [0.20, 0.34], [0.16, 0.24], [0.22, 0.14]];
// the line, roughly: Punjab/Indus in the north-west -> along the rivers -> south of Burhanpur -> east to Orissa (Bay of Bengal)
const LINE = [[0.28, 0.12], [0.30, 0.22], [0.36, 0.30], [0.42, 0.36], [0.44, 0.44], [0.42, 0.52], [0.48, 0.55], [0.56, 0.54], [0.64, 0.52], [0.70, 0.49]];
export function indiaMap(g, t, o = {}) {
  const W = o.W || 820, H = o.H || 900, k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k); g.rotate(-0.02);
  g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.roundRect(-W / 2 - 40 + 14, -H / 2 - 60 + 18, W + 80, H + 150, 26); g.fill();
  g.fillStyle = '#efe0bc'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2 - 40, -H / 2 - 60, W + 80, H + 150, 26); g.fill(); g.stroke();
  const P = ([x, y]) => [-W / 2 + x * W, -H / 2 + y * H];
  g.fillStyle = '#d8bf86'; g.strokeStyle = '#7a5a34'; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); INDIA.forEach((p, i) => { const [x, y] = P(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke();
  // draw-on of the line
  const d = clamp((t - (o.drawAt ?? 0.25)) / (o.drawDur ?? 1.4)); const pts = LINE.map(P); const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])); const tot = segs.reduce((a, b) => a + b, 0);
  let left = d * tot; g.save(); g.strokeStyle = o.lineC || '#c0392b'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(...pts[0]); let tip = pts[0];
  for (let i = 0; i < segs.length && left > 0; i++) { const f = Math.min(1, left / segs[i]); tip = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; g.lineTo(...tip); left -= segs[i]; } g.stroke();
  if (d > 0 && d < 1) { g.fillStyle = '#ffd25a'; g.beginPath(); g.arc(tip[0], tip[1], 16, 0, 7); g.fill(); } g.restore();
  if (o.title) insT(g, o.title, 0, -H / 2 - 4, 56, { color: CARD_INK, stroke: null, maxW: W });
  if (o.labels !== false) { insT(g, 'PUNJAB', P([0.28, 0.12])[0] - 40, P([0.28, 0.12])[1] - 40, 32, { color: '#5a3a1a', stroke: null, a: clamp(t / 0.4) }); insT(g, 'ORISSA', P([0.70, 0.49])[0] + 30, P([0.70, 0.49])[1] + 46, 32, { color: '#5a3a1a', stroke: null, a: d >= 1 ? 1 : 0 }); }
  if (o.foot) { const kk = ease.outBack(clamp((t - (o.footAt ?? 1.5)) / 0.3)); if (kk > 0) { g.save(); g.translate(0, H / 2 + 40); g.scale(kk, kk); insT(g, o.foot, 0, 0, 92, { color: o.footC || '#c0392b', stroke: CARD_INK }); g.restore(); } }
  g.restore();
}
// the history book: open pages, chapter list; the hedge line is missing (a blank gap with a "?")
export function historyBook(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); const W = 900, H = 760; g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k); g.rotate(-0.03);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 20); g.fill();
  g.fillStyle = '#7a2a22'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2 - 16, -H / 2 - 16, W + 32, H + 32, 22); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = '#f7f0dc'; g.beginPath(); g.roundRect(s < 0 ? -W / 2 : 6, -H / 2, W / 2 - 6, H, 10); g.fill(); g.lineWidth = 5; g.stroke(); }
  insT(g, o.title || 'A HISTORY OF', -W / 4, -H / 2 + 80, 40, { color: '#7a2a22', stroke: null }); insT(g, 'BRITISH INDIA', -W / 4, -H / 2 + 132, 52, { color: CARD_INK, stroke: null });
  g.fillStyle = '#c8bca0'; for (let i = 0; i < 9; i++) { const y = -H / 2 + 210 + i * 52; g.fillRect(-W / 2 + 50, y, (W / 2 - 110) * (0.6 + 0.4 * ((i * 37) % 10) / 10), 14); }
  insT(g, 'CHAPTERS', W / 4, -H / 2 + 80, 44, { color: '#7a2a22', stroke: null });
  const ch = o.lines || ['1857  The Rebellion', '1858  Crown Rule', '1876  Famine', '1885  Congress']; const gap = o.gapAt ?? 2;
  ch.forEach((l, i) => { const yy = -H / 2 + 170 + (i + (i >= gap ? 1 : 0)) * 96; insT(g, l, 30 + 20, yy, 40, { color: CARD_INK, stroke: null, align: 'left', maxW: W / 2 - 80 }); });
  const gy = -H / 2 + 170 + gap * 96; const gk = clamp((t - (o.gapShow ?? 0.8)) / 0.3);
  if (gk > 0) { g.save(); g.globalAlpha = gk; g.setLineDash([16, 12]); g.strokeStyle = '#c0392b'; g.lineWidth = 6; g.beginPath(); g.roundRect(40, gy - 38, W / 2 - 80, 76, 12); g.stroke(); g.restore();
    insT(g, 'GREAT HEDGE?', W / 4 + 10, gy, 40, { color: '#c0392b', stroke: null, a: gk }); }
  g.restore();
}
// three trips: plane icons hop London -> India, one per beat
export function tripsCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); g.save(); g.translate(E.W / 2, o.y ?? 470); g.scale(k, k);
  const W = 900, H = 260; g.fillStyle = 'rgba(250,244,226,0.95)'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  insT(g, 'LONDON', -W / 2 + 140, -H / 2 + 60, 44, { color: CARD_INK, stroke: null }); insT(g, 'INDIA', W / 2 - 130, -H / 2 + 60, 44, { color: CARD_INK, stroke: null });
  const n = o.n ?? 3; for (let i = 0; i < n; i++) { const p = ease.inOut(clamp((t - (o.at0 ?? 0.2) - i * (o.gap ?? 0.5)) / 0.45)); if (p <= 0) continue; const y = 20 + (i - 1) * 40;
    g.save(); g.setLineDash([14, 12]); g.strokeStyle = '#c0392b'; g.lineWidth = 5; g.beginPath(); g.moveTo(-W / 2 + 140, y); g.lineTo(lerp(-W / 2 + 140, W / 2 - 140, p), y + Math.sin(p * Math.PI) * -26); g.stroke(); g.restore();
    const x = lerp(-W / 2 + 140, W / 2 - 140, p); g.fillStyle = '#2f6a9a'; g.beginPath(); g.arc(x, y + Math.sin(p * Math.PI) * -26, 15, 0, 7); g.fill();
    if (p >= 1) insT(g, `TRIP ${i + 1}`, W / 2 - 62, y, 30, { color: '#c0392b', stroke: null }); }
  g.restore();
}
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, bean };
