// War of the Stray Dog — shared assets: a toon dog (floppy ears, lidded eyes, trot/run/sit), 1925 soldiers (Greek khaki,
// Bulgarian grey-green, rifle slung on the back), the Belasitsa border pass (painted stones + striped posts + two signs),
// a ministry war room, the League of Nations hall, the town of Petrich, plus 2D overlay helpers (hook text, stamps).
// Tone: nobody is shown hurt; no flags; the shooting is only a flash + birds off the ridge. Underscore = not auto-loaded.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- DOG
function lidEye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.1, size * 0.62); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a120e')); p.scale.set(0.5, 0.55, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.15, 0.15, 0.05); gl.position.set(0.15, 0.2, 0.99); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}
// dog({ seed, scale, fur, patch, collar }) — faces +Z, head ~1.05 units up (scale 1). Medium scruffy village dog, tan with a white chest.
// .update(t, { trot 0..1, run 0..1, sit 0..1, wag 0..1, earsUp 0..1, lid, lidAngle, look, headTurn, headTilt, headNod, tongue 0..1, crouch 0..1 })
export function dog(o = {}) {
  const { seed = 1, scale = 1 } = o;
  const C = o.fur || '#c8894a', C2 = o.patch || '#f4e6cc', C3 = shadeHex(C, -0.28), lidC = shadeHex(C, -0.06);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const F = toon(C), W = toon(C2), D = toon(C3);
  const bodyG = new THREE.Group(); bodyG.position.y = 0.62; g.add(bodyG);
  const body = mesh(sph, F, 0.3, 0.27, 0.52); bodyG.add(body);
  const chest = mesh(sph, W, 0.22, 0.22, 0.2); chest.position.set(0, -0.04, 0.36); bodyG.add(chest);
  const back = mesh(sph, D, 0.2, 0.08, 0.3); back.position.set(0.02, 0.22, -0.08); bodyG.add(back);
  // head
  const neck = new THREE.Group(); neck.position.set(0, 0.16, 0.42); bodyG.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.24, 0.08); neck.add(head);
  const sk = mesh(sph, F, 0.25, 0.23, 0.24); head.add(sk);
  const muz = mesh(sph, W, 0.13, 0.1, 0.17); muz.position.set(0, -0.08, 0.2); head.add(muz);
  const nose = mesh(sph, flat('#1e1416'), 0.055, 0.04, 0.04); nose.position.set(0, -0.03, 0.365); nose.userData.noOutline = true; head.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 6, 14, Math.PI), flat('#2a1216')); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.12, 0.33); mouth.userData.noOutline = true; head.add(mouth);
  const tongue = mesh(sph, toon('#e2707a'), 0.045, 0.06, 0.02); tongue.position.set(0, -0.17, 0.33); tongue.userData.noOutline = true; head.add(tongue);
  const brows = [-1, 1].map(s => { const b = rbox(0.09, 0.022, 0.02, C3, s * 0.09, 0.12, 0.2, 0.01); b.userData.noOutline = true; head.add(b); return b; });
  const ears = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.19, 0.13, -0.02); head.add(p);
    const e = mesh(sph, D, 0.07, 0.17, 0.05); e.position.set(s * 0.03, -0.12, 0); p.add(e); return { p, s }; });
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.1, 0.05, 0.18), new THREE.Vector3(s * 0.42, 0.12, 0.9).normalize(), 0.07, lidC));
  // collar + tag
  const col = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 24), toon('#c0392b')); col.rotation.x = Math.PI / 2 - 0.5; col.position.set(0, 0.06, 0.02); neck.add(col);
  const tag = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14).rotateX(Math.PI / 2), toon('#e8c040')); tag.position.set(0, -0.04, 0.15); neck.add(tag);
  // legs: hip pivots, a thigh/shin cylinder + a paw
  const legGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.46, 10).translate(0, -0.23, 0);
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const hip = new THREE.Group(); hip.position.set(sx * 0.15, 0.05, sz * 0.3); bodyG.add(hip);
    const l = new THREE.Mesh(legGeo, sz > 0 ? W : F); l.castShadow = true; hip.add(l); const paw = mesh(sph, W, 0.065, 0.045, 0.085); paw.position.set(0, -0.47, 0.03); hip.add(paw);
    return { hip, sx, sz }; });
  // tail: ball chain from the rump
  const tail = []; for (let i = 0; i < 7; i++) { const tb = mesh(sph, i > 4 ? W : F, 0.05 - i * 0.003, 0.05 - i * 0.003, 0.05 - i * 0.003); bodyG.add(tb); tail.push(tb); }
  const bl = blob(0.55, 0.28); root.add(bl);
  outline(g, { px: 2.8 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.3; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { trot = 0, run = 0, sit = 0, wag = 0.5, earsUp = 0.3, lid = 0.25, lidAngle = 0, look = [0, 0], headTurn = 0, headTilt = 0, headNod = 0, tongue: tg = 0, crouch = 0, blink = true, browUp = 0 } = u;
    const sp = run > 0.01 ? 3.4 : 2.2, ph = (t * sp + seed * 0.3) * Math.PI * 2, mv = clamp(trot + run), amp = lerp(0.45, 0.85, clamp(run));
    legs.forEach((L, i) => { const diag = (L.sx * L.sz > 0) ? 0 : Math.PI; const gal = run > 0.5 ? (L.sz > 0 ? 0 : Math.PI * 0.8) + (L.sx > 0 ? 0.3 : 0) : diag;
      let a = Math.sin(ph + gal) * amp * mv;
      if (L.sz < 0) a = lerp(a, -1.25, sit); else a = lerp(a, 0.15, sit);
      L.hip.rotation.x = a + crouch * (L.sz > 0 ? -0.4 : 0.6); });
    const bob = mv * Math.abs(Math.sin(ph)) * (run > 0.5 ? 0.08 : 0.04);
    bodyG.position.y = 0.62 + bob - sit * 0.14 - crouch * 0.12; bodyG.position.z = -sit * 0.1;
    bodyG.rotation.x = -sit * 0.62 + run * 0.06 * Math.sin(ph) + crouch * 0.05;
    neck.rotation.x = sit * 0.55 - run * 0.15 + headNod + crouch * 0.35;
    head.rotation.set(Math.sin(t * 1.7 + seed) * 0.03 * (1 - mv), headTurn + noise(t * 0.7, seed + 3) * 0.05, -headTilt);
    ears.forEach(E2 => { E2.p.rotation.set(lerp(0.15, -0.45, earsUp) + mv * Math.sin(ph * 2 + E2.s) * 0.15, 0, E2.s * lerp(0.15, 1.25, earsUp) * -1 + E2.s * 0.2); });
    brows.forEach((b, i) => { b.position.y = 0.12 + browUp * 0.04; b.rotation.z = (i ? -1 : 1) * (lidAngle * 0.8 - browUp * 0.3); });
    for (let i = 0; i < tail.length; i++) { const k = i / (tail.length - 1); const sw = Math.sin(t * lerp(3, 14, wag) - k * 1.6) * 0.32 * wag * k;
      tail[i].position.set(sw, 0.12 + k * lerp(0.42, 0.12, crouch) - sit * k * 0.1, -0.5 - k * 0.24 + sit * k * 0.1); }
    tongue.visible = tg > 0.05; tongue.scale.y = 0.06 * clamp(tg); mouth.scale.x = 1 + tg * 0.3;
    const b2 = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b2)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.45, look[0] * 0.55, 0); });
    bl.scale.setScalar(1 - bob * 2);
  };
  root.head = head; root.headR = 0.24 * scale; root.eyes = eyes; root.update(0); return root;
}

// ---------------------------------------------------------------- PEOPLE (1925)
export function rifle() { const g = new THREE.Group();
  g.add(rbox(0.06, 0.09, 0.5, '#6a4228', 0, 0, -0.32, 0.02), cyl(0.018, 0.018, 0.75, '#2a2a2e', 0, 0.02, 0.25, 6).rotateX(Math.PI / 2), rbox(0.035, 0.05, 0.08, '#2a2a2e', 0, 0.05, 0.0, 0.01));
  g.children[1].rotation.x = Math.PI / 2; outline(g, { px: 2.2 }); return g; }
const sling = (b) => { const r = rifle(); r.rotation.set(0.25, 0, -0.9); r.position.set(0, 1.55, -0.32); (b.parts.upper || b).add(r); return b; };
// Greek soldier: khaki, Adrian-style helmet tint. Bulgarian soldier: grey-green, peaked cap.
export function greek(o = {}) { return sling(bean({ name: 'Greek', outfit: 'uniform', head: 'cap', headColor: '#7d7448', skin: o.skin || 'olive', hair: 'bowl', hairColor: '#2a1a12', colors: { main: '#9a8a56', legs: '#7d7048' }, seed: o.seed || 9, ...(o.over || {}) })); }
export function bulgar(o = {}) { return sling(bean({ name: 'Bulgarian', outfit: 'uniform', head: 'cap', headColor: '#4c5648', skin: o.skin || 'fair', hair: 'swoop', hairColor: '#3a2618', colors: { main: '#66705c', legs: '#4c5648' }, seed: o.seed || 21, ...(o.over || {}) })); }
export function general(o = {}) { return bean({ name: 'General', outfit: 'uniform', head: 'cap', headColor: '#6a6038', skin: 'olive', hair: 'horseshoe', hairColor: '#3a3430', browColor: '#2a2420', colors: { main: '#8a7a48', legs: '#6a5e38' }, seed: o.seed || 5, ...(o.over || {}) }); }
export function diplomat(o = {}) { return bean({ name: 'Diplomat', outfit: 'uniform', head: 'none', skin: o.skin || 'light', hair: o.hair || 'horseshoe', hairColor: o.hairColor || '#8a8580', colors: { main: o.color || '#2e3442', legs: '#262a34' }, seed: o.seed || 31 }); }

// ---------------------------------------------------------------- SETS
function signTex(text, bg, fg) { return canvasTex(512, 160, (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.strokeStyle = fg; x.lineWidth = 10; x.strokeRect(10, 10, W - 20, H - 20); x.fillStyle = fg; let fs = 86; x.font = `900 ${fs}px "Fredoka", sans-serif`; const mw = x.measureText(text).width; if (mw > W - 60) { fs = fs * (W - 60) / mw; x.font = `900 ${fs}px "Fredoka", sans-serif`; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 4); }); }
export function signpost(text, o = {}) { const g = new THREE.Group(); const h = o.h || 2.2, w = o.w || 1.9;
  g.add(cyl(0.07, 0.08, h, '#6a4a2e', 0, h / 2, 0, 8));
  const board = rbox(w, w * 0.32, 0.08, o.bg || '#e8dcc0', o.arrow ? w * 0.35 : 0, h - 0.2, 0.06, 0.03); g.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, w * 0.28), toon('#ffffff', { map: signTex(text, o.bg || '#e8dcc0', o.fg || '#2a1c15') })); face.position.set(o.arrow ? w * 0.35 : 0, h - 0.2, 0.105); face.userData.noOutline = true; g.add(face);
  if (o.arrow) { const tip = new THREE.Mesh(new THREE.ConeGeometry(w * 0.2, w * 0.3, 3).rotateZ(-Math.PI / 2), toon(o.bg || '#e8dcc0')); tip.position.set(w * 0.35 + w * 0.6, h - 0.2, 0.06); g.add(tip); }
  outline(g, { px: 2.4 }); return g; }
export function borderPost(o = {}) { const g = new THREE.Group(); const cols = o.cols || ['#f4f0e6', '#2a2a2e']; for (let i = 0; i < 6; i++) g.add(cyl(0.11, 0.11, 0.25, cols[i % 2], 0, 0.125 + i * 0.25, 0, 10)); g.add(ball(0.13, '#f4f0e6', 0, 1.55, 0, 10)); outline(g, { px: 2.4 }); return g; }
export function pine(o = {}) { const g = new THREE.Group(); const s = o.s || 1; g.add(cyl(0.12 * s, 0.16 * s, 1.2 * s, '#6a4a2e', 0, 0.6 * s, 0, 8));
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.1 - i * 0.28) * s, 1.4 * s, 10), toon(i % 2 ? '#3f6a3a' : '#4a7a42')); c.position.y = (1.4 + i * 0.75) * s; c.castShadow = true; g.add(c); }
  outline(g, { px: 2 }); return g; }
export function watchBox() { const g = new THREE.Group(); g.add(rbox(1.3, 2.2, 1.3, '#7a6448', 0, 1.1, 0, 0.04), box(0.9, 1.0, 0.05, '#2a2420', 0, 1.6, 0.66));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.7, 4), toon('#5a4430')); roof.rotation.y = Math.PI / 4; roof.position.y = 2.55; roof.castShadow = true; g.add(roof); outline(g, { px: 2.2 }); return g; }
// the border pass on Belasitsa: grass, a stone-dotted border line along Z at x = 0, posts, two signs, mountains + pines behind.
export function borderPass(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4);
  g.add(floor(220, 220, o.grass || '#8fae5a', 0, -60));
  const strip = floor(0.5, 60, '#b89a68', 0, -20); strip.position.y = 0.01; g.add(strip);
  for (let z = 6; z > -40; z -= 0.9) { const s = ball(0.11 + r() * 0.05, '#f2efe6', (r() - 0.5) * 0.18, 0.04, z, 8); s.scale.y = 0.5; s.userData.noOutline = true; g.add(s); }
  for (const z of [-7, -15, -23]) { const p = borderPost(); p.position.set(0, 0, z); g.add(p); }
  const gr = signpost('GREECE', { bg: '#e8eef6', fg: '#1f4f86' }); gr.position.set(-1.5, 0, -4.2); gr.rotation.y = 0.15; g.add(gr);
  const bg2 = signpost('BULGARIA', { bg: '#eef4ea', fg: '#2f6a3a' }); bg2.position.set(1.6, 0, -4.6); bg2.rotation.y = -0.15; g.add(bg2);
  // Belasitsa: rounded green-grey ridges + rocky peaks far back
  for (const [x, z, rr2, h, c] of [[-40, -90, 30, 22, '#6f8a62'], [10, -110, 40, 30, '#7a9070'], [55, -95, 28, 20, '#6a845e'], [-10, -70, 22, 10, '#86a06a'], [30, -65, 18, 8, '#8aa46c']]) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(rr2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(c)); m.scale.y = h / rr2; m.position.set(x, 0, z); m.userData.noOutline = true; g.add(m); }
  for (let i = 0; i < 16; i++) { const x = (r() < 0.5 ? -1 : 1) * (6 + r() * 16), z = -6 - r() * 30; const p = pine({ s: 0.8 + r() * 0.7 }); p.position.set(x, 0, z); g.add(p); }
  for (let i = 0; i < 10; i++) { const b = ball(0.25 + r() * 0.35, r() < 0.5 ? '#9a968c' : '#8a867c', (r() - 0.5) * 24, 0.1, 3 - r() * 20, 10); b.scale.y = 0.6; g.add(b); }
  outline(g, { px: 2 });
  const sky = o.noSky ? null : sunnySky(st, { clouds: 7, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, update(t) { sky && sky.update(t); } };
}
// a line of soldiers facing `face` (radians), spaced along X or Z
export function squad(st, make, n, o = {}) { const out = []; for (let i = 0; i < n; i++) { const b = make({ seed: (o.seed || 40) + i, skin: ['olive', 'fair', 'tan', 'light'][i % 4] }); b.position.set(...o.pos(i)); b.rotation.y = o.face ?? 0; st.add(b); out.push(b); } return out; }

// ministry war room: dark green walls, a parchment map with the border, a desk, a lamp
export function warRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#6a5440', 0, 0));
  const wall = plane(30, 9, o.wall || '#4c5a48', 0, 4.5, -4); wall.receiveShadow = true; g.add(wall);
  g.add(plane(30, 1.6, shadeHex(o.wall || '#4c5a48', -0.2), 0, 0.8, -3.98));
  const board = canvasTex(1024, 640, (x, W, H) => { x.fillStyle = '#efe4c6'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#9fc4dc'; x.beginPath(); x.moveTo(0, H * 0.75); x.quadraticCurveTo(W * 0.4, H * 0.62, W * 0.6, H); x.lineTo(0, H); x.fill();
    x.strokeStyle = '#c0392b'; x.lineWidth = 8; x.setLineDash([26, 18]); x.beginPath(); x.moveTo(W * 0.05, H * 0.45); x.quadraticCurveTo(W * 0.5, H * 0.35, W * 0.95, H * 0.5); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#3a3a2a'; x.font = '900 64px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText('BULGARIA', W * 0.5, H * 0.24); x.fillText('GREECE', W * 0.5, H * 0.66);
    x.fillStyle = '#c0392b'; x.beginPath(); x.arc(W * 0.42, H * 0.37, 16, 0, 7); x.fill(); x.font = '800 40px "Fredoka", sans-serif'; x.fillText('PETRICH', W * 0.42, H * 0.31); });
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), toon('#ffffff', { map: board })); bm.position.set(0, 4.2, -3.95); bm.userData.noOutline = true; g.add(bm);
  g.add(rbox(6.7, 0.18, 0.2, '#5a4030', 0, 2.15, -3.9, 0.03), rbox(6.7, 0.18, 0.2, '#5a4030', 0, 6.25, -3.9, 0.03));
  const tb = PR.table({ w: 4.2, d: 1.6, h: 1.0, color: '#6a4a30' }); tb.position.set(0, 0, 0.4); g.add(tb); outline(tb, { px: 2.4 });
  const lamp = new THREE.Group(); lamp.add(cyl(0.02, 0.02, 2.2, '#222', 0, 7.0, 0, 5), cyl(0.15, 0.9, 0.55, '#3a5a3a', 0, 5.75, 0, 18), ball(0.22, '#fff2c4', 0, 5.5, 0, 12)); lamp.position.set(0, 0, 0.4); outline(lamp, { px: 2.2 }); g.add(lamp);
  return { group: g, tableY: 1.06, tableZ: 0.4, update() {} };
}
// League of Nations council hall (Geneva, generic): pale walls, columns, a long horseshoe-ish table, name sign
export function leagueHall(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(40, 30, '#8a6a4a', 0, 0));
  const wall = plane(40, 12, '#e6dcc6', 0, 6, -5); wall.receiveShadow = true; g.add(wall);
  for (const x of [-6, -3, 3, 6]) { const c = PR.column(6.5); c.position.set(x, 0, -4.4); g.add(c); }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.0), toon('#ffffff', { map: signTex('LEAGUE OF NATIONS', '#2e4a6a', '#f2e6c0') })); sign.position.set(0, 5.2, -4.9); sign.userData.noOutline = true; g.add(sign);
  const tb = PR.table({ w: 6.0, d: 1.4, h: 1.0, color: '#5a3a26' }); tb.position.set(0, 0, 0); g.add(tb);
  const cloth = rbox(6.1, 0.04, 1.5, '#2f5a3a', 0, 1.08, 0, 0.02); g.add(cloth);
  for (let i = 0; i < 5; i++) g.add(rbox(0.32, 0.02, 0.42, '#f4f0e2', -2.4 + i * 1.2, 1.11, 0.25, 0.01));
  outline(tb, { px: 2.4 });
  return { group: g, tableY: 1.1, update() {} };
}
// the town of Petrich in the valley: a cluster of plaster houses with red roofs
export function town(st, o = {}) { const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 9);
  for (let i = 0; i < 9; i++) { const f = PR.facade({ w: 3 + r() * 1.5, h: 3 + r() * 1.5, d: 3, color: ['#efe2c6', '#e8d4b0', '#f2e8d8'][i % 3], trim: '#b5543a', windows: 2, seed: i }); f.position.set(-9 + i * 2.6 + r(), 0, -r() * 4); f.rotation.y = (r() - 0.5) * 0.4; g.add(f); }
  const tw = PR.tower ? null : null; return { group: g }; }
export function gavel() { const g = new THREE.Group(); const head = cyl(0.09, 0.09, 0.32, '#6a4228', 0, 0, 0, 12); head.rotation.z = Math.PI / 2; g.add(head, cyl(0.025, 0.025, 0.5, '#8a5a32', 0, -0.25, 0, 8)); outline(g, { px: 2.4 }); return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text: centred lines near the top (below the Shorts top bar); colors per line
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * ((o.size || 66) * 1.45)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    if (Array.isArray(l)) { // [[text, colour], ...] runs on one line
      const sz = (o.sizes && o.sizes[i]) || o.size || 66; g.font = `900 ${sz}px "Nunito", sans-serif`; const ws = l.map(([s]) => g.measureText(s).width); const tot = ws.reduce((a, b) => a + b, 0); let x = -tot / 2;
      l.forEach(([s, c], j) => { insT(g, s, x + ws[j] / 2, 0, sz, { color: c, stroke: CARD_INK }); x += ws[j]; });
    } else insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 66, { color: (o.colors && o.colors[i]) || '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 });
    g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, text.length * s * 0.62 + s * 0.6, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: w - s * 0.5 });
  g.restore();
}
// plain sober text (no pop, no joke): fades in
export function plainText(g, t, text, o = {}) { const a = clamp((t - (o.at || 0)) / 0.35); if (a <= 0) return; insT(g, text, E.W / 2, o.y ?? 760, o.size || 70, { color: o.color || '#ffffff', stroke: CARD_INK, a, maxW: E.W * 0.88 }); }
// flash + "BANG" off the ridge (no person in frame)
export function bang(g, t, t0, o = {}) { const k = t - t0; if (k < 0 || k > 1.2) return; const a = clamp(1 - k / 0.25);
  if (a > 0) { g.save(); g.fillStyle = alpha('#fff6d8', a * 0.75); g.fillRect(0, 0, E.W, E.H); g.restore(); }
  const s = ease.outBack(clamp(k / 0.2)); const f = clamp((1.2 - k) / 0.3); g.save(); g.translate(o.x ?? 760, o.y ?? 520); g.rotate(-0.12); g.scale(s, s); g.globalAlpha = f;
  g.fillStyle = '#ffd25a'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); for (let i = 0; i < 18; i++) { const an = i / 18 * Math.PI * 2, rr = i % 2 ? 80 : 150; g.lineTo(Math.cos(an) * rr * 1.3, Math.sin(an) * rr); } g.closePath(); g.fill(); g.stroke();
  insT(g, 'BANG', 0, 4, 80, { color: '#d8342c', stroke: null }); g.restore(); }
// a few cartoon birds flapping away (V shapes)
export function birds(g, t, t0, o = {}) { const k = t - t0; if (k < 0) return; for (let i = 0; i < 7; i++) { const x = (o.x ?? 700) + (i - 3) * 50 + k * (220 + i * 30) * (i % 2 ? 1 : 0.8), y = (o.y ?? 600) - k * (260 + i * 25) - (i % 3) * 30; const fl = Math.sin(t * 22 + i) * 14;
  g.save(); g.strokeStyle = CARD_INK; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 24, y - fl); g.quadraticCurveTo(x - 10, y - 6, x, y + 4); g.quadraticCurveTo(x + 10, y - 6, x + 24, y - fl); g.stroke(); g.restore(); } }

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex };
