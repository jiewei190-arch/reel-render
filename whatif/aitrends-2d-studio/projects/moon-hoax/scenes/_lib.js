// shared helpers for "A Newspaper Said Bat-People Lived on the Moon" (moon-hoax). Underscore = not auto-loaded.
// 1835 pack: the "hoax Moon" (night sky, stars, pale ground with craters, odd trees), bat-people, a bison-ish beast, a blue unicorn,
// upright beavers, top hats, a giant telescope, a New York street of 1835, The Sun's front page, a writer's desk.
import { wordTime, rng } from '/engine/core.js';
import { THREE, toonStage, toon, outline, rbox, box, cyl, ball, blob, canvasTex, floor } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import * as PR from '/kits/toon3d/props.js';
const G = PR.propGroup;
export { THREE };
export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };

// ---------- the hoax Moon ----------
const MOONLIGHT = { sky: '#9aa4e0', ground: '#4a4060', ambient: 1.25, key: ['#e8ecff', 2.2, [-6, 10, 7]], fill: ['#c8a0ff', 0.5, [8, 4, 6]], bg: ['#070a1e', '#141a44', '#2c2a5e'], exposure: 1.05 };
export function moon(T, o = {}) {
  const st = toonStage(T, { ...MOONLIGHT, fov: 38, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 0] });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 7);
  // stars: a big sphere of points
  const n = 900, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, rad = 180; const s = Math.sqrt(1 - u * u); pos.set([Math.cos(a) * s * rad, Math.abs(u) * rad * 0.9 + 4, Math.sin(a) * s * rad], i * 3); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const stars = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#fff6dc', size: 1.3, sizeAttenuation: true, fog: false })); g.add(stars);
  // the Earth hanging in the sky (blue-green ball) gives the "on the Moon" read at a glance
  if (o.earth !== false) { const e = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 20), toon('#3a7ad8', { emissive: new THREE.Color('#2a5ab0'), emissiveIntensity: 0.55, fresh: true })); e.position.set(o.earthAt?.[0] ?? 26, o.earthAt?.[1] ?? 30, o.earthAt?.[2] ?? -90); e.userData.noOutline = true; g.add(e);
    for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(3 + r() * 2, 16, 10), toon('#4fa85a', { emissive: new THREE.Color('#3a8a4a'), emissiveIntensity: 0.5, fresh: true })); c.position.set(e.position.x + (r() - 0.5) * 9, e.position.y + (r() - 0.5) * 9, e.position.z + 6.5); c.scale.z = 0.3; c.userData.noOutline = true; g.add(c); } }
  // pale ground + craters + low hills
  const gnd = floor(300, 300, o.ground || '#c9c3d8'); gnd.position.z = -60; g.add(gnd);
  if (o.craters !== false) for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 50, z = -r() * 60 + 6, s = 0.6 + r() * 2.2; if (Math.abs(x) < 3 && z > -3) continue;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(s, s * 0.22, 8, 24), toon('#b4adc6')); rim.rotation.x = -Math.PI / 2; rim.position.set(x, 0.02, z); rim.scale.z = 0.45; rim.receiveShadow = true; rim.userData.noOutline = true; g.add(rim);
    const pit = new THREE.Mesh(new THREE.CircleGeometry(s, 24), toon('#a39cb8')); pit.rotation.x = -Math.PI / 2; pit.position.set(x, 0.015, z); pit.userData.noOutline = true; g.add(pit); }
  for (let i = 0; i < 9; i++) { const h = ball(1, o.hills || '#aba4c0', (r() - 0.5) * 120, -2, -50 - r() * 40, 20); h.scale.set(14 + r() * 10, 6 + r() * 6, 8); h.userData.noOutline = true; g.add(h); }
  // a few odd "lunar forest" trees (the 1835 articles described woods and valleys)
  if (o.trees !== false) for (let i = 0; i < 8; i++) { const x = (i % 2 ? 1 : -1) * (5 + r() * 9), z = -4 - r() * 16; const t = G(cyl(0.12, 0.16, 1.4, '#6a4a6a', 0, 0.7, 0, 8), ball(0.9, ['#5aa88a', '#4a8ab0', '#8a6ac0'][i % 3], 0, 1.9, 0, 16)); t.children[1].scale.y = 1.3; outline(t, { px: 2.2 }); t.position.set(x, 0, z); t.scale.setScalar(0.8 + r() * 0.8); g.add(t); }
  return { stage: st, group: g, set: { update: (t) => { stars.rotation.y = t * 0.005; } } };
}

// ---------- creatures ----------
// bat wing: a scalloped membrane on a 2-bone frame; side = 1 (its left, +X) / -1
function wing(side, color = '#4a3a5a') {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(1.2, 0.55); s.quadraticCurveTo(1.05, 0.2, 1.1, -0.05); s.quadraticCurveTo(0.85, -0.05, 0.8, -0.3); s.quadraticCurveTo(0.55, -0.2, 0.45, -0.45); s.quadraticCurveTo(0.25, -0.25, 0, -0.35); s.lineTo(0, 0);
  const geo = new THREE.ShapeGeometry(s, 10); const m = new THREE.Mesh(geo, toon(color, { side: THREE.DoubleSide, fresh: true })); m.scale.set(side, 1, 1); m.castShadow = true;
  const bone = cyl(0.025, 0.02, 1.33, '#2a2030', 0.6 * side, 0.28, 0, 6); bone.rotation.z = -side * 1.14; const pv = new THREE.Group(); pv.add(m, bone); return pv;
}
// batPerson({ seed, color }) -> bean with wings; .flap(t, k)
export function batPerson(o = {}) {
  const b = bean({ name: 'Bat-person', outfit: 'tunic', colors: { main: o.color || '#6a4a7a', belt: '#3a2a3a' }, skin: o.skin || 'tan', hair: o.hair || 'swoop', hairColor: o.hairColor || '#2a1e24', seed: o.seed || 400 });
  const up = b.parts.upper; const L = wing(1, o.wing), R = wing(-1, o.wing); L.position.set(0.12, 0.7, -0.28); R.position.set(-0.12, 0.7, -0.28); up.add(L, R);
  outline(L, { px: 2.6 }); outline(R, { px: 2.6 });
  // little pointed ears
  for (const sx of [1, -1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 8), toon('#6a4a7a')); e.position.set(sx * 0.3, 0.42, -0.05); e.rotation.z = -sx * 0.4; b.parts.head.add(e); outline(e, { px: 2.6 }); }
  b.flap = (t, k = 1, speed = 7) => { const a = Math.sin(t * speed) * 0.7 * k; L.rotation.set(0, -0.5 - a * 0.6, 0.15 + a); R.rotation.set(0, 0.5 + a * 0.6, -0.15 - a); };
  b.flap(0); return b;
}
// a stout bison-ish beast (simple balls), .update(t, walk)
export function bison(o = {}) { const c = o.color || '#7a5032'; const g = G(); const body = ball(0.8, c, 0, 1.05, 0, 20); body.scale.set(0.85, 0.8, 1.25); const hump = ball(0.62, '#5a3a22', 0, 1.45, 0.45, 18);
  const head = new THREE.Group(); head.position.set(0, 1.0, 1.15); head.add(ball(0.42, '#5a3a22', 0, 0, 0, 16)); for (const sx of [1, -1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 8), toon('#efe6d0')); h.position.set(sx * 0.38, 0.22, 0); h.rotation.z = -sx * 1.0; head.add(h); const ey = ball(0.07, '#20161a', sx * 0.2, 0.12, 0.35, 8); head.add(ey); }
  g.add(body, hump, head); const legs = []; for (const [x, z] of [[0.35, 0.6], [-0.35, 0.6], [0.35, -0.6], [-0.35, -0.6]]) { const l = new THREE.Group(); l.position.set(x, 0.75, z); l.add(cyl(0.11, 0.1, 0.75, '#4a3020', 0, -0.37, 0, 8)); g.add(l); legs.push(l); }
  outline(g, { px: 2.8 }); g.add(blob(1.0, 0.3)); g.update = (t, w = 1) => { legs.forEach((l, i) => (l.rotation.x = Math.sin(t * 6 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.4 * w)); head.rotation.x = Math.sin(t * 3) * 0.08; }; g.scale.setScalar(o.scale || 1); return g; }
// a blue goat-unicorn (the hoax's "unicorn"): .update(t, hop)
export function unicorn(o = {}) { const c = o.color || '#6a8ad8'; const g = G(); const body = ball(0.55, c, 0, 1.0, 0, 20); body.scale.set(0.8, 0.8, 1.3);
  const neck = cyl(0.17, 0.22, 0.7, c, 0, 1.4, 0.55, 10); neck.rotation.x = 0.5; const head = new THREE.Group(); head.position.set(0, 1.75, 0.8); head.add(ball(0.3, c, 0, 0, 0, 16));
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 8), toon('#ffd25a', { emissive: new THREE.Color('#ffb000'), emissiveIntensity: 0.3 })); horn.position.set(0, 0.38, 0.12); horn.rotation.x = 0.35; head.add(horn);
  for (const sx of [1, -1]) head.add(ball(0.06, '#20161a', sx * 0.15, 0.08, 0.24, 8)); head.add(ball(0.11, '#f2ead6', 0, -0.2, 0.05, 8));
  const tail = ball(0.14, '#f2ead6', 0, 1.15, -0.72, 10); g.add(body, neck, head, tail); const legs = []; for (const [x, z] of [[0.22, 0.35], [-0.22, 0.35], [0.22, -0.35], [-0.22, -0.35]]) { const l = new THREE.Group(); l.position.set(x, 0.7, z); l.add(cyl(0.06, 0.05, 0.7, '#4a5a98', 0, -0.35, 0, 8)); g.add(l); legs.push(l); }
  outline(g, { px: 2.8 }); g.add(blob(0.7, 0.3)); g.head = head; g.update = (t, hop = 1) => { const p = Math.abs(Math.sin(t * 5)); g.children.forEach(ch => {}); body.position.y = 1.0 + p * 0.25 * hop; head.position.y = 1.75 + p * 0.25 * hop; neck.position.y = 1.4 + p * 0.25 * hop; tail.position.y = 1.15 + p * 0.25 * hop; legs.forEach((l, i) => { l.position.y = 0.7 + p * 0.25 * hop; l.rotation.x = (i < 2 ? -1 : 1) * p * 0.5 * hop; }); };
  g.scale.setScalar(o.scale || 1); return g; }
// an upright beaver: a brown bean with buck teeth, round ears and a flat tail; `baby: true` = a smaller one
export function beaver(o = {}) { const sc = o.baby ? 0.5 : 0.9; const b = bean({ name: 'Beaver', outfit: 'rags', colors: { main: '#7a4a28' }, skin: '#9a6238', hair: 'bald', scale: sc, seed: o.seed || 500, noPads: true });
  for (const sx of [1, -1]) { const e = ball(0.11, '#7a4a28', sx * 0.32, 0.38, -0.05, 10); b.parts.head.add(e); outline(e, { px: 2.6 }); }
  const teeth = rbox(0.14, 0.12, 0.04, '#fff6e0', 0, -0.25, 0.46, 0.02); b.parts.head.add(teeth); outline(teeth, { px: 2 });
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 10), toon('#4a3020')); tail.scale.set(0.8, 0.12, 1.3); tail.position.set(0, 0.12, -0.45); tail.rotation.x = -0.3; b.parts.rig.add(tail); outline(tail, { px: 2.4 });
  return b; }
// top hat for a bean's head (1835)
export function topHat(b, color = '#20181c') { const h = G(cyl(0.52, 0.52, 0.04, color, 0, 0.36, 0, 24), cyl(0.33, 0.35, 0.52, color, 0, 0.63, 0, 20), cyl(0.355, 0.355, 0.08, '#8a2a2a', 0, 0.42, 0, 20)); h.rotation.z = 0.06; outline(h, { px: 2.6 }); b.parts.head.add(h); return h; }

// ---------- people of 1835 (original designs) ----------
export const herschel = () => { const b = bean({ name: 'Astronomer', outfit: 'uniform', colors: { main: '#2f4a3a', legsTop: '#2a2a30', trim: '#c9a14a' }, skin: 'fair', hair: 'curly', hairColor: '#8a7a6a', seed: 410 }); topHat(b); return b; };
export const newsboy = () => bean({ name: 'Newsboy', outfit: 'tee', colors: { main: '#c8b896', legsTop: '#4a3a2a' }, head: 'cap', headColor: '#5a4a3a', skin: 'tan', hair: 'bowl', hairColor: '#4a2e1e', scale: 0.85, seed: 420 });
export const writer = () => bean({ name: 'Writer', outfit: 'uniform', colors: { main: '#5a3a2a', legsTop: '#2a2228', trim: '#d8c49a' }, skin: 'light', hair: 'swoop', hairColor: '#3a2418', moustache: '#3a2418', seed: 430 });
const COATS = ['#3a4a6a', '#6a3a3a', '#4a5a3a', '#5a4a6a', '#2a2a30', '#7a5a3a'];
export const citizen = (i = 0) => { const b = bean({ name: 'New Yorker', outfit: 'uniform', colors: { main: COATS[i % COATS.length], legsTop: '#2a2a30' }, skin: ['fair', 'tan', 'light', 'brown', 'olive'][i % 5], hair: ['bowl', 'bun', 'curly', 'swoop'][i % 4], hairColor: ['#3a2618', '#6a4428', '#1e1612', '#8a6a4a'][i % 4], seed: 440 + i }); if (i % 2 === 0) topHat(b, ['#20181c', '#3a2a22'][i % 2]); return b; };

// ---------- the newspaper ----------
let _np = null;
export function sunPage() { return _np ||= canvasTex(600, 800, (g, W, H) => { g.fillStyle = '#f2e8cc'; g.fillRect(0, 0, W, H); g.fillStyle = '#20181c'; g.textAlign = 'center';
  g.font = '900 italic 110px "Playfair Display", serif'; g.fillText('THE SUN', W / 2, 120); g.fillRect(30, 140, W - 60, 6); g.font = '700 22px Nunito, sans-serif'; g.fillText('NEW YORK  ·  AUGUST 25, 1835  ·  ONE CENT', W / 2, 172); g.fillRect(30, 186, W - 60, 3);
  g.font = '900 52px "Playfair Display", serif'; g.fillText('GREAT', W / 2, 250); g.fillText('ASTRONOMICAL', W / 2, 305); g.fillText('DISCOVERIES', W / 2, 360);
  g.font = '700 22px Nunito, sans-serif'; g.fillText('LATELY MADE BY SIR JOHN HERSCHEL', W / 2, 398);
  // a little bat-man woodcut
  g.save(); g.translate(W / 2, 520); g.fillStyle = '#20181c'; g.beginPath(); g.ellipse(0, 0, 26, 40, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, -55, 22, 0, 7); g.fill();
  for (const s of [1, -1]) { g.beginPath(); g.moveTo(s * 18, -20); g.lineTo(s * 140, -70); g.quadraticCurveTo(s * 120, -20, s * 130, 10); g.quadraticCurveTo(s * 95, 0, s * 90, 30); g.quadraticCurveTo(s * 60, 15, s * 20, 25); g.fill(); } g.restore();
  g.fillStyle = 'rgba(32,24,28,.55)'; for (let c = 0; c < 3; c++) for (let l = 0; l < 9; l++) { if (l < 6 && c === 1) continue; g.fillRect(40 + c * 180, 610 + l * 18, 150 - (l % 3) * 12, 8); } }); }
export function newspaper(o = {}) { const w = o.w || 0.6, h = w * 4 / 3; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: sunPage(), side: THREE.DoubleSide, fresh: true })); m.castShadow = true; m.userData.noOutline = true; const g = G(m); return g; }

// ---------- 1835 New York street (sunny) ----------
export function street(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 0] }); const sky = sunnySky(st, { clouds: 8, seed: o.seed || 2 });
  const g = new THREE.Group(); st.add(g); const cob = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), PR.texMat(PR.TEX.cobble('#a89a86', [20, 20]))); cob.rotation.x = -Math.PI / 2; cob.receiveShadow = true; cob.userData.noOutline = true; g.add(cob);
  const walk = box(80, 0.15, 3, '#c8bca8', 0, 0.075, -6.5); walk.receiveShadow = true; walk.userData.noOutline = true; g.add(walk);
  const cols = ['#a8553a', '#b86a48', '#8a4a3a', '#c8a07a', '#9a5a44', '#b07858'];
  for (let i = -5; i <= 5; i++) { const f = PR.facade({ w: 4.2, h: 5.5 + (i % 3) * 0.8, d: 3, color: cols[(i + 5) % cols.length], trim: '#4a3a32', windows: 2, shop: i % 2 === 0, seed: i + 9 }).at(i * 4.3, 0, -8.1); g.add(f); }
  if (o.sign !== false) { const sg = canvasTex(512, 128, (x, W, H) => { x.fillStyle = '#20181c'; x.fillRect(0, 0, W, H); x.fillStyle = '#ffd25a'; x.font = '900 italic 84px "Playfair Display", serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('THE SUN', W / 2, H / 2 + 6); });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), toon('#ffffff', { map: sg, fresh: true })); b.position.set(0, 4.2, -8.0); b.userData.noOutline = true; g.add(b); }
  for (const x of [-6.5, 6.5]) { const lp = G(cyl(0.07, 0.09, 3.2, '#2a2a30', 0, 1.6, 0, 8), rbox(0.35, 0.45, 0.35, '#3a3a40', 0, 3.4, 0, 0.05), ball(0.13, '#ffe8a0', 0, 3.4, 0, 10)); outline(lp, { px: 2.4 }); lp.position.set(x, 0, -4.8); g.add(lp); }
  return { stage: st, sky, set: { update: () => {} } };
}

// ---------- the giant telescope on its wooden frame (points up toward -Z) ----------
export function telescope(o = {}) { const g = G(); const tube = new THREE.Group(); tube.position.set(0, 2.2, 0); g.add(tube);
  const t1 = cyl(0.55, 0.42, 6, '#b88a48', 0, 3, 0, 24); const ring1 = cyl(0.6, 0.6, 0.18, '#6a4a2a', 0, 5.9, 0, 24), ring2 = cyl(0.5, 0.5, 0.18, '#6a4a2a', 0, 1.5, 0, 24); const eye = cyl(0.12, 0.12, 0.5, '#3a3a40', 0, -0.2, 0, 10);
  tube.add(t1, ring1, ring2, eye); tube.rotation.x = -(o.tilt ?? 0.75);
  for (const sx of [-1, 1]) { const leg = cyl(0.12, 0.14, 4.2, '#7a5032', sx * 1.0, 2.0, 0, 8); leg.rotation.z = sx * 0.2; g.add(leg); } const back = cyl(0.12, 0.14, 3.2, '#7a5032', 0, 1.5, 1.1, 8); back.rotation.x = -0.4; g.add(back);
  g.add(rbox(2.4, 0.15, 0.3, '#6a4228', 0, 2.2, 0, 0.04)); outline(g, { px: 2.6 }); g.add(blob(1.6, 0.3)); g.tube = tube; g.eyeWorld = () => { const v = new THREE.Vector3(); eye.getWorldPosition(v); return v; }; return g; }

// ---------- the writer's desk at night (candle) ----------
export function office(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 6, target: [0, 1, 0], key: ['#ffcf90', 2.2, [-4, 7, 6]], exposure: 0.95 });
  st.scene.background = new THREE.Color('#3a2a26');
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), PR.texMat(PR.TEX.plaster('#8a6a52', [3, 2]))); wall.position.set(0, 7, -2.2); wall.receiveShadow = true; st.add(wall);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), PR.texMat(PR.TEX.planks('#6a4a32', [6, 6], 8))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; st.add(fl);
  const desk = PR.table({ w: 2.2, d: 1.0, h: 1.0, color: '#6a4228' }).at(0, 0, 0); st.add(desk); const pp = PR.papers({ n: 7, seed: 5, spread: 1.4 }); pp.position.y = 1.07; st.add(pp);
  const cand = G(cyl(0.12, 0.14, 0.05, '#c9a14a', 0, 0.025, 0, 14), cyl(0.06, 0.06, 0.3, '#f2ead6', 0, 0.2, 0, 10)); outline(cand, { px: 2.2 }); cand.position.set(0.85, 1.06, -0.15); st.add(cand);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); flame.scale.y = 1.8; flame.position.set(0.85, 1.43, -0.15); flame.userData.noOutline = true; st.add(flame);
  const lt = new THREE.PointLight('#ffb060', 6, 6, 1.5); lt.position.set(0.85, 1.6, 0); st.add(lt);
  const shelf = PR.shelf({ w: 2.0, h: 2.6, seed: 3 }).at(-2.6, 0, -1.6); st.add(shelf);
  const win = G(box(1.4, 1.6, 0.08, '#1a2050', 2.4, 2.6, -2.15), rbox(1.6, 0.12, 0.2, '#5a3a22', 2.4, 1.75, -2.1, 0.03)); st.add(win);
  const mo = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), new THREE.MeshBasicMaterial({ color: '#fff2c8' })); mo.position.set(2.7, 3.0, -2.1); st.add(mo);
  return { stage: st, flame, set: { update: (t) => { flame.scale.set(1 + Math.sin(t * 13) * 0.1, 1.8 + Math.sin(t * 9) * 0.25, 1); lt.intensity = 6 + Math.sin(t * 11) * 0.8; } } };
}
