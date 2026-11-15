// Miss Unsinkable — shared 3D assets: the four-funnel liner (Olympic / Titanic), the hospital ship (Britannic), a cruiser
// (HMS Hawke), a stylised sea, a lifeboat, a turning propeller, Violet (stewardess), an officer, a swaddled baby, a teacup,
// the ship's dining saloon, a green hill. Plus 2D overlay helpers (hook caption, year stamp, label tags, check stamp).
// TONE GUARD (MAIN): real deaths. No comedy on the sinkings, no bodies, nobody shown hurt. Ships are stylised; danger reads as
// water, tilt and sound only. The trombone gag lives on the transfer papers only. Underscore = not auto-loaded by the player.
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

// ---------------------------------------------------------------- SEA
// sea(st, { color, deep, night, size, y }) — a big flat ocean with a scrolling wave texture + a few drifting foam caps.
// .update(t) scrolls the waves; .setLevel(y) moves the surface.
export function sea(st, o = {}) {
  const c1 = o.color || (o.night ? '#1d3558' : '#2f86b8'), c2 = o.deep || (o.night ? '#142540' : '#1f6a98');
  const tex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); const r = rng(5);
    for (let j = 0; j < 14; j++) for (let i = 0; i < 6; i++) { const x = (i + (j % 2) * 0.5) * (w / 6) + r() * 20, y = j * (h / 14) + r() * 8;
      g.strokeStyle = j % 3 ? alpha('#ffffff', o.night ? 0.12 : 0.22) : alpha(c2, 0.9); g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 22, y - 9, x + 44, y); g.stroke(); } },
    { repeat: [o.rep || 18, o.rep || 18] });
  const S = o.size || 400; const m = new THREE.Mesh(new THREE.PlaneGeometry(S, S), toon('#ffffff', { map: tex }));
  m.rotation.x = -Math.PI / 2; m.position.y = o.y || 0; m.receiveShadow = true; m.userData.noOutline = true; st.add(m);
  const foam = []; const r = rng(o.seed || 3); const fm = toon('#f4fbff');
  for (let i = 0; i < (o.foam ?? 26); i++) { const f = mesh(sph, fm, 0.5 + r() * 0.6, 0.08, 0.22 + r() * 0.2); f.userData.noOutline = true; f.castShadow = false;
    f.position.set((r() - 0.5) * 60, (o.y || 0) + 0.02, -r() * 50 + 6); f.userData.ph = r() * 6; m.parent.add(f); foam.push(f); }
  return { mesh: m, foam, tex, level: o.y || 0,
    setLevel(y) { this.level = y; m.position.y = y; foam.forEach(f => f.position.y = y + 0.02); },
    update(t) { tex.offset.set(t * 0.02, t * 0.035); foam.forEach(f => { const k = 0.6 + 0.4 * Math.sin(t * 1.4 + f.userData.ph); f.scale.x = (0.5 + k * 0.5) * 0.9; f.position.y = this.level + 0.02 + Math.sin(t * 1.8 + f.userData.ph) * 0.04; }); } };
}

// ---------------------------------------------------------------- SHIPS
// liner({ kind: 'olympic'|'titanic'|'britannic', len }) — stylised White Star four-funnel liner, bow toward +X, waterline at y = 0.
// Britannic = hospital-ship white with a green band and red crosses. Hull is open-water only: no people on deck.
export function liner(o = {}) {
  const kind = o.kind || 'olympic', L = o.len || 24; const g = new THREE.Group(); const hosp = kind === 'britannic';
  const H = L * 0.11, Bm = L * 0.11; // hull height above water, beam
  const hullC = hosp ? '#f4f2ea' : '#1e1c22', topC = '#f6f3ea', bandC = hosp ? '#3f9a52' : '#b8302a';
  // hull: a long rounded box with a pointed bow (cone) and a rounded stern
  const hull = rbox(L * 0.86, H * 1.4, Bm, hullC, -L * 0.02, H * 0.25, 0, Bm * 0.3); g.add(hull);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(Bm * 0.5, L * 0.16, 4, 1).rotateZ(-Math.PI / 2).rotateX(Math.PI / 4), toon(hullC)); bow.scale.set(1, H * 1.4 / (Bm * 0.72), 1); bow.position.set(L * 0.48, H * 0.25, 0); bow.castShadow = true; g.add(bow);
  const under = rbox(L * 0.9, H * 0.55, Bm * 0.98, hosp ? '#3f9a52' : '#8a2a24', 0, -H * 0.3, 0, Bm * 0.2); g.add(under); // boot-topping just under the line
  // white strake + coloured band along the hull
  g.add(box(L * 0.86, H * 0.16, Bm * 1.01, hosp ? bandC : '#d8c890', -L * 0.02, H * 0.62, 0));
  if (!hosp) g.add(box(L * 0.86, H * 0.08, Bm * 1.012, '#f0e8d8', -L * 0.02, H * 0.86, 0));
  // superstructure decks
  g.add(rbox(L * 0.62, H * 0.5, Bm * 0.86, topC, -L * 0.04, H * 1.18, 0, 0.08));
  g.add(rbox(L * 0.48, H * 0.4, Bm * 0.72, topC, -L * 0.04, H * 1.6, 0, 0.08));
  g.add(rbox(L * 0.07, H * 0.3, Bm * 0.8, topC, L * 0.24, H * 1.85, 0, 0.05)); // bridge
  // portholes / windows strip (texture)
  const win = canvasTex(1024, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = hosp ? '#3a4a5a' : '#f6e9b0'; for (let i = 0; i < 70; i++) { x.beginPath(); x.arc(10 + i * 14.5, h / 2, 4.5, 0, 7); x.fill(); } });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.8, H * 0.22), toon('#ffffff', { map: win, transparent: true })); p.position.set(-L * 0.03, H * (hosp ? 0.32 : 0.36), s * Bm * 0.505); if (s < 0) p.rotation.y = Math.PI; p.userData.noOutline = true; g.add(p);
    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.6, H * 0.18), toon('#ffffff', { map: win, transparent: true })); p2.position.set(-L * 0.04, H * 1.2, s * Bm * 0.435); if (s < 0) p2.rotation.y = Math.PI; p2.userData.noOutline = true; g.add(p2); }
  // red crosses on the hospital ship
  if (hosp) { const cx = canvasTex(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#d8342c'; x.fillRect(w * 0.38, h * 0.12, w * 0.24, h * 0.76); x.fillRect(w * 0.12, h * 0.38, w * 0.76, h * 0.24); });
    for (const s of [-1, 1]) for (const fx of [-0.28, 0.1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(H * 0.9, H * 0.9), toon('#ffffff', { map: cx, transparent: true })); p.position.set(L * fx, H * 0.15, s * Bm * 0.51); if (s < 0) p.rotation.y = Math.PI; p.userData.noOutline = true; g.add(p); } }
  // four buff funnels with black tops, raked aft
  const funC = '#d9a24a'; for (let i = 0; i < 4; i++) { const fx = L * (0.17 - i * 0.13); const f = cyl(Bm * 0.2, Bm * 0.22, H * 1.7, funC, fx, H * 2.55, 0, 18); f.scale.z = 0.8; f.rotation.z = 0.08; g.add(f);
    const top = cyl(Bm * 0.205, Bm * 0.205, H * 0.35, '#1a1a1e', fx - H * 0.06, H * 3.3, 0, 18); top.scale.z = 0.8; top.rotation.z = 0.08; g.add(top); }
  // masts
  for (const mx of [L * 0.36, -L * 0.38]) { const m = cyl(0.05, 0.07, H * 4.2, '#c8a878', mx, H * 2.6, 0, 8); m.rotation.z = 0.07; g.add(m); }
  // lifeboats along the top deck
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) g.add(rbox(L * 0.035, H * 0.16, Bm * 0.08, '#f8f6ee', L * (0.12 - i * 0.055), H * 1.86, s * Bm * 0.33, 0.04));
  outline(g, { px: 2.2 });
  // a contact foam ring at the waterline (no outline)
  const foam = mesh(sph, toon('#f4fbff'), L * 0.48, 0.06, Bm * 0.72); foam.userData.noOutline = true; foam.castShadow = false; g.add(foam);
  g.L = L; g.H = H; g.Bm = Bm; return g;
}
// cruiser() — HMS Hawke as a stylised grey warship: low hull, ram bow, two funnels, a mast. Bow toward +X.
export function cruiser(o = {}) {
  const L = o.len || 14, H = L * 0.09, Bm = L * 0.14; const g = new THREE.Group(); const c = '#7c8690';
  g.add(rbox(L * 0.84, H * 1.3, Bm, c, 0, H * 0.2, 0, Bm * 0.3));
  const bow = new THREE.Mesh(new THREE.ConeGeometry(Bm * 0.5, L * 0.16, 4, 1).rotateZ(-Math.PI / 2).rotateX(Math.PI / 4), toon(c)); bow.scale.set(1, 1.3 * H / (Bm * 0.72), 1); bow.position.set(L * 0.47, H * 0.2, 0); bow.castShadow = true; g.add(bow);
  g.add(rbox(L * 0.4, H * 0.7, Bm * 0.6, '#9aa4ae', -L * 0.02, H * 1.1, 0, 0.06));
  for (const fx of [0.05, -0.12]) g.add(cyl(Bm * 0.13, Bm * 0.14, H * 1.6, '#5a626c', L * fx, H * 2.0, 0, 14));
  g.add(cyl(0.04, 0.05, H * 3.6, '#5a5048', L * 0.2, H * 2.2, 0, 8));
  for (const s of [-1, 1]) g.add(cyl(0.05, 0.05, L * 0.12, '#4a525a', L * 0.3, H * 1.1, s * Bm * 0.2, 8).rotateZ(Math.PI / 2));
  outline(g, { px: 2.2 }); g.L = L; g.H = H; return g;
}
// lifeboat({ num }) — open white wooden boat, number on the bow, sits in the water (y = 0 waterline). Faces +X.
export function lifeboat(o = {}) {
  const g = new THREE.Group(); const L = o.len || 3.4;
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon('#f6f2e6', { side: THREE.DoubleSide })); hull.scale.set(L / 2, 0.55, 0.62); hull.position.y = 0.3; hull.castShadow = true; g.add(hull);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 40), toon('#8a5a34')); rim.rotation.x = Math.PI / 2; rim.scale.set(L / 2, 0.62, 1); rim.position.y = 0.3; g.add(rim);
  const inside = new THREE.Mesh(new THREE.CircleGeometry(1, 32), toon('#b98a5a')); inside.rotation.x = -Math.PI / 2; inside.scale.set(L / 2 * 0.94, 0.58, 1); inside.position.y = 0.12; inside.userData.noOutline = true; g.add(inside);
  for (const x of [-0.6, 0.4]) g.add(rbox(0.16, 0.06, 1.1, '#9a6a40', x, 0.24, 0, 0.02));
  if (o.num) { const tx = canvasTex(128, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#20161a'; x.font = '900 52px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(o.num), w / 2, h / 2 + 2); });
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), toon('#ffffff', { map: tx, transparent: true })); p.position.set(L * 0.3, 0.12, s * 0.5); p.rotation.y = s < 0 ? Math.PI + 0.35 : 0.35; p.rotation.x = s * 0.1; p.userData.noOutline = true; g.add(p); } }
  outline(g, { px: 2.4 }); g.seatY = 0.24; return g;
}
// propeller() — a big three-blade bronze screw on a shaft, turning about X. .update(t, speed)
export function propeller(o = {}) {
  const g = new THREE.Group(); const hub = new THREE.Group(); g.add(hub); const R = o.r || 2.2; const bz = toon('#b8863a');
  const cap = mesh(sph, bz, R * 0.22, R * 0.22, R * 0.22); cap.scale.x = R * 0.32; hub.add(cap);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const arm = new THREE.Group(); arm.rotation.x = a; hub.add(arm);
    const b = mesh(sph, bz, R * 0.08, R * 0.5, R * 0.26); b.position.y = R * 0.55; b.rotation.y = 0.55; arm.add(b); }
  const shaft = cyl(R * 0.08, R * 0.08, R * 2.5, '#6a6a72', -R * 1.3, 0, 0, 12); shaft.rotation.z = Math.PI / 2; g.add(shaft);
  outline(g, { px: 2.6 }); g.update = (t, sp = 1) => { hub.rotation.x = t * sp * 4.2; }; return g;
}
// splash({ count, seed }) — churned white water: balls that bubble up and fall around a point. .update(t, k 0..1 intensity)
export function splash(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 4); const m = toon('#f4fbff'); const bits = [];
  for (let i = 0; i < (o.count || 26); i++) { const b = mesh(sph, m, 1, 1, 1); b.userData.noOutline = true; b.castShadow = false; b.userData.p = [r() * 6.28, 0.6 + r() * 0.8, r(), 0.15 + r() * 0.3]; g.add(b); bits.push(b); }
  const sp = o.spread || 1.6;
  g.update = (t, k = 1) => { bits.forEach(b => { const [a, v, ph, s] = b.userData.p; const c = ((t * v + ph) % 1); const rr = sp * (0.3 + c * 0.9);
    b.position.set(Math.cos(a) * rr, Math.sin(c * Math.PI) * (o.h || 1.4) * k - 0.1, Math.sin(a) * rr * 0.7); b.scale.setScalar(s * (1 - c * 0.6) * (0.3 + k)); b.visible = k > 0.02; }); };
  return g;
}
// plume() — one tall column of white water (the mine strike, seen from far away; no fire). .update(k 0..1 rise+fall)
export function plume(o = {}) {
  const g = new THREE.Group(); const m = toon('#f4fbff'); const r = rng(o.seed || 9); const bits = [];
  for (let i = 0; i < 18; i++) { const b = mesh(sph, m, 1, 1, 1); b.userData.noOutline = i % 3 !== 0; b.userData.p = [(r() - 0.5) * 1.2, r(), 0.5 + r() * 0.7]; g.add(b); bits.push(b); }
  outline(g, { px: 2.2 });
  g.update = (k) => { const up = ease.out(clamp(k * 2.2)), fall = clamp((k - 0.55) / 0.45); bits.forEach(b => { const [x, f, s] = b.userData.p; b.position.set(x * (1 + fall), f * (o.h || 7) * up * (1 - fall * 0.5), (r => r)(x) * 0.4); b.scale.setScalar(s * (0.4 + up) * (1 - fall * 0.7)); b.visible = k > 0.01 && k < 0.99; }); };
  return g;
}

// ---------------------------------------------------------------- PEOPLE
// violet({ cap }) — Violet Jessop as a toon bean: navy stewardess dress, white apron + collar, a small white cap, brown bun.
export function violet(o = {}) {
  const b = bean({ name: 'Violet', outfit: 'uniform', colors: { main: '#2c3654', legsTop: '#2c3654', belt: '#f2efe6', trim: '#f2efe6', legs: '#2c3654', feet: '#1a1418' }, skin: 'fair', hair: 'bun', hairColor: '#6a3e24', browColor: '#4a2a18', seed: o.seed || 5 });
  const P = b.parts; const white = toon('#fbf9f2');
  // apron: a soft white panel on the front of the body
  const ap = mesh(sph, white, 0.25, 0.3, 0.06); ap.position.set(0, 0.1, 0.33); P.upper.add(ap);
  const col = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 24), white); col.rotation.x = Math.PI / 2; col.position.set(0, 0.8, 0.02); col.castShadow = true; P.upper.add(col);
  if (o.cap !== false) { const cap = mesh(sph, white, 0.3, 0.1, 0.22); cap.position.set(0, 0.47, 0.02); cap.rotation.x = -0.25; P.head.add(cap); }
  outline(ap, { px: 2.6 }); outline(col, { px: 2.4 }); if (o.cap !== false) outline(P.head.children[P.head.children.length - 1], { px: 2.4 });
  return b;
}
export function officer(o = {}) {
  return bean({ name: 'Officer', outfit: 'uniform', colors: { main: '#1f2a44', trim: '#d8b04a', legsTop: '#1f2a44', belt: '#1a1a20' }, skin: 'light', hair: 'swoop', hairColor: '#3a2416', head: 'cap', headColor: '#1f2a44', moustache: true, seed: o.seed || 21 });
}
// a swaddled baby: blanket bundle with a round face peeking out (calm, eyes closed)
export function baby() {
  const g = new THREE.Group(); const bl = mesh(sph, toon('#f3e6c8'), 0.24, 0.17, 0.17); g.add(bl);
  const hood = mesh(sph, toon('#f3e6c8'), 0.15, 0.15, 0.15); hood.position.set(0.17, 0.04, 0); g.add(hood);
  const face = mesh(sph, toon('#f2c8a8'), 0.1, 0.1, 0.06); face.position.set(0.2, 0.04, 0.11); g.add(face);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 4, 8, Math.PI), flat('#3a2420')); e.position.set(0.2 + s * 0.035, 0.06, 0.168); e.rotation.z = Math.PI; e.userData.noOutline = true; g.add(e); }
  outline(g, { px: 2.4 }); return g;
}
// teacup + saucer (cup ~0.2 units tall)
export function teacup(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#fbf9f2';
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.15, 20, 1, true), toon(c, { side: THREE.DoubleSide })); cup.position.y = 0.09; cup.castShadow = true; g.add(cup);
  g.add(cyl(0.08, 0.08, 0.01, c, 0, 0.017, 0, 16)); const tea = cyl(0.11, 0.11, 0.005, '#9a5a2a', 0, 0.14, 0, 18); tea.userData.noOutline = true; g.add(tea);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 6, 14), toon(c)); h.position.set(0.13, 0.09, 0); g.add(h);
  const band = cyl(0.122, 0.122, 0.02, '#3a8ac0', 0, 0.14, 0, 20); band.userData.noOutline = true; g.add(band);
  if (o.saucer !== false) { const s = cyl(0.2, 0.15, 0.025, c, 0, 0, 0, 24); g.add(s); g.saucer = s; }
  outline(g, { px: 2.2 }); return g;
}

// ---------------------------------------------------------------- SETS
// dining saloon: panelled wall with portholes (sea outside), a long table with a white cloth. Spots near z ~ 0.
export function saloon(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#7a4a32', 0, 0));
  const wt = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#e8d6b0'; x.fillRect(0, 0, w, h); x.fillStyle = '#8a5a34'; x.fillRect(0, h * 0.62, w, h * 0.38); x.strokeStyle = '#6a4228'; x.lineWidth = 5; for (let i = 0; i < 8; i++) x.strokeRect(i * 64 + 8, h * 0.66, 48, h * 0.28); x.fillStyle = '#c9a14a'; x.fillRect(0, h * 0.6, w, 8); }, { repeat: [3, 1] });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), toon('#ffffff', { map: wt })); wall.position.set(0, 4, -3.5); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  for (const x of [-4.5, -1.5, 1.5, 4.5]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 10, 28), toon('#c9a14a')); r.position.set(x, 3.6, -3.45); g.add(r); const gl = plane(1.1, 1.1, '#7fc0e8', x, 3.6, -3.47); gl.scale.set(0.95, 0.95, 1); const cm = new THREE.Mesh(new THREE.CircleGeometry(0.55, 28), toon('#7fc0e8')); cm.position.set(x, 3.6, -3.46); cm.userData.noOutline = true; g.add(cm); }
  const cloth = rbox(7, 0.12, 1.6, '#fbf9f2', 0, 1.0, 0, 0.04); g.add(cloth); g.add(rbox(6.6, 0.9, 1.3, '#f2eee4', 0, 0.5, 0, 0.04));
  const lampG = PR.lamp ? null : null; void lampG;
  outline(g, { px: 2.2 }); return { group: g, tableY: 1.07 };
}
// green hill on dry land: grass, a fence, a cottage, trees, sunny sky. Spot: (0,0,0).
export function hill(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(160, 160, '#86c05e', 0, -30));
  const mound = mesh(sph, toon('#7ab654'), 30, 6, 20); mound.position.set(-8, -4.6, -30); mound.receiveShadow = true; mound.userData.noOutline = true; g.add(mound);
  const r = rng(o.seed || 4);
  for (const [x, z, h] of [[-7, -9, 3.2], [8, -12, 3.8], [12, -5, 3.0], [-12, -16, 3.6]]) { const t = new THREE.Group(); t.add(cyl(0.18, 0.26, h, '#7a5234', 0, h / 2, 0, 12)); for (let i = 0; i < 5; i++) t.add(ball(1.2 * (0.6 + r() * 0.3), i % 2 ? '#5a9a42' : '#4c8a38', (r() - 0.5) * 1.6, h + (r() - 0.2), (r() - 0.5) * 1.2, 16)); t.position.set(x, 0, z); outline(t, { px: 2.2 }); g.add(t); }
  const house = new THREE.Group(); house.add(rbox(4, 2.6, 3, '#f2e6cc', 0, 1.3, 0, 0.05)); const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), toon('#b0503a')); roof.rotation.y = Math.PI / 4; roof.position.y = 3.5; roof.scale.set(1, 1, 0.8); roof.castShadow = true; house.add(roof);
  house.add(rbox(0.8, 1.4, 0.1, '#6a4428', 0, 0.7, 1.52, 0.03)); for (const x of [-1.2, 1.2]) house.add(rbox(0.7, 0.7, 0.1, '#bfe0f6', x, 1.6, 1.52, 0.03)); outline(house, { px: 2.2 }); house.position.set(5.5, 0, -8); house.rotation.y = -0.35; g.add(house);
  const fence = new THREE.Group(); for (let i = 0; i < 9; i++) fence.add(rbox(0.12, 0.9, 0.12, '#f4efe2', -8 + i * 1.2, 0.45, 0, 0.02)); for (const y of [0.35, 0.7]) fence.add(rbox(10, 0.1, 0.06, '#f4efe2', -3.2, y, 0.05, 0.02)); outline(fence, { px: 2.2 }); fence.position.set(0, 0, -4.5); g.add(fence);
  const sky = sunnySky(st, { clouds: 9, seed: o.seed || 3 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
export { sunnySky };

// ---------------------------------------------------------------- 2D OVERLAYS
// hook caption near the top (below the Shorts top bar): stays up >= 3 s, adds story
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.12) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (o.gap || 104)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 66, { color: i === (o.gold ?? 1) ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.88 }); g.restore(); });
}
// year stamp (rubber-stamp look), pops in
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const x = o.x ?? 170, y = o.y ?? 300;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k, k); g.globalAlpha = o.a ?? 0.95; g.lineJoin = 'round';
  g.fillStyle = alpha('#fbf6ea', 0.85); g.beginPath(); g.roundRect(-125, -56, 250, 112, 16); g.fill();
  g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 9; g.beginPath(); g.roundRect(-120, -52, 240, 104, 16); g.stroke();
  insT(g, String(year), 0, 4, o.size || 82, { color: o.color || '#e23b2e', stroke: null, maxW: 220 });
  g.restore();
}
// a name tag over a 3D point (projected x,y): white pill with ink text + a little pointer
export function tag(g, x, y, text, k = 1, o = {}) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.font = `900 ${o.size || 50}px "Nunito"`; const w = Math.max(180, g.measureText(text).width + 60);
  g.fillStyle = o.fill || '#ffffff'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.lineJoin = 'round';
  g.beginPath(); g.roundRect(-w / 2, -44, w, 80, 40); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-16, 36); g.lineTo(0, 62); g.lineTo(16, 36); g.closePath(); g.fill(); g.stroke(); g.fillRect(-14, 30, 28, 9);
  insT(g, text, 0, -2, o.size || 50, { color: o.color || CARD_INK, stroke: null, maxW: w - 30 }); g.restore();
}
// big green check stamp (✓ SURVIVED)
export function checkStamp(g, x, y, k, o = {}) {
  if (k <= 0) return; const p = ease.outBack(clamp(k)); g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.1); g.scale(p * (o.s || 1), p * (o.s || 1));
  g.fillStyle = '#2fa84f'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 78, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = '#ffffff'; g.lineWidth = 20; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(-36, 2); g.lineTo(-10, 30); g.lineTo(40, -30); g.stroke();
  if (o.label !== false) insT(g, o.label || 'SURVIVED', 0, 122, 46, { color: '#ffffff', stroke: CARD_INK, maxW: 260 }); g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex };
