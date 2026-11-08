// shared helpers for "Two Empires Almost Went to War Over a Pig" (pig-war). Underscore = not auto-loaded.
// Project-local assets (kept out of the shared kit): pig (+ bronze statue), potato, musket, flags, warship, rowboat,
// cannon, firs, tents, the San Juan Island sets. The pig is comic and is never shown hurt.
import { E, wordTime, text, ease, prog, clamp, lerp, rng, noise, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, outline, rbox, box, cyl, ball, blob, canvasTex, INK } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
export { THREE };

export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.14, col = '#ffd25a') { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 58px "${FONTS.title}"`; const w = g.measureText(str).width + 76; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -45, w, 90, 45); g.fill(); text(g, str, 0, 2, { size: 58, color: col, weight: 700 }); g.restore(); }
// comic "BANG!" starburst (2D overlay). k = 0..1 pop
export function bang(g, k, x = E.W * 0.5, y = E.H * 0.3, str = 'BANG!') { if (k <= 0) return; g.save(); g.translate(x, y); const s = ease.outBack(clamp(k * 1.4)) * (1 + 0.04 * Math.sin(k * 40)); g.scale(s, s); g.rotate(-0.12);
  const pts = 14; g.beginPath(); for (let i = 0; i <= pts * 2; i++) { const a = (i / (pts * 2)) * Math.PI * 2, r = i % 2 ? 210 : 330; g.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 0.8); } g.closePath();
  g.fillStyle = '#ffd25a'; g.fill(); g.lineWidth = 16; g.strokeStyle = '#20161a'; g.stroke();
  text(g, str, 0, 8, { size: 150, color: '#d6402e', weight: 700 }); g.restore(); }

// ---------- eyes with heavy lids (same build as the kit's animals) ----------
const sph = new THREE.SphereGeometry(1, 20, 14);
function lidEye(parent, pos, n, size, o = {}) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.1, size * 0.6); parent.add(eg);
  const wc = o.white || '#fbf8f2'; const w = new THREE.Mesh(sph, o.bronze ? toon(wc) : toon(wc, { emissive: new THREE.Color(wc), emissiveIntensity: 0.25 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, o.bronze ? toon(o.pupil) : flat(o.pupil || '#1a1214')); p.scale.set(0.38, 0.42, 0.12); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#3a3238')); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(o.bronze ? shadeHex(o.lid, -0.3) : INK)); rim.userData.noOutline = true; lp.add(rim);
  return { pg, lp, roll };
}
// ---------- potato ----------
export function potato(s = 1, color = '#c49a5a') { const g = new THREE.Group(); const b = ball(0.16 * s, color, 0, 0, 0, 16); b.scale.set(1.25, 0.85, 0.9); g.add(b);
  const r = rng(5); for (let i = 0; i < 4; i++) { const d = ball(0.022 * s, shadeHex(color, -0.35), 0, 0, 0, 6); const a = r() * 6.28, e = (r() - 0.5) * 1.6; d.position.set(Math.cos(a) * Math.cos(e) * 0.19 * s, Math.sin(e) * 0.13 * s, Math.sin(a) * Math.cos(e) * 0.14 * s); d.userData.noOutline = true; g.add(d); }
  return g; }

// ---------- the pig: a Berkshire (black with white points), ~1.25 units tall. bronze: true = the statue ----------
// pig({ seed, scale, bronze, potato: bool }) .update(t, { walk, chew, lid, lidAngle, look, headTurn, headNod, earFlop, tail, trot })
export function pig(o = {}) {
  const { seed = 1, scale = 1, bronze = false, potato: hasPotato = true } = o;
  const BR = '#a8743a';
  const C = bronze ? { body: BR, dark: '#7a5226', point: '#c08a48', snout: '#b88040', ear: '#9a6a34', white: '#c8945a', pupil: '#5a3a1a', lid: '#94642e', hoof: '#7a5226', nost: '#5a3a1a', pot: '#d8a058' }
                   : { body: '#5a5266', dark: '#463e52', point: '#f2ead6', snout: '#f4b6b0', ear: '#e89a98', white: '#fbf8f2', pupil: '#1a1214', lid: '#5a5266', hoof: '#5a4a48', nost: '#a8606a', pot: '#c49a5a' };
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const bodyG = new THREE.Group(); bodyG.position.y = 0.66; g.add(bodyG);
  const b = new THREE.Mesh(sph, toon(C.body)); b.scale.set(0.5, 0.46, 0.78); b.castShadow = true; bodyG.add(b);
  const belly = new THREE.Mesh(sph, toon(C.dark)); belly.scale.set(0.42, 0.3, 0.6); belly.position.y = -0.18; bodyG.add(belly);
  // curly tail with a white tip
  const tailG = new THREE.Group(); tailG.position.set(0, 0.12, -0.74); bodyG.add(tailG);
  const tl = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 14, Math.PI * 1.6), toon(C.body)); tl.rotation.y = Math.PI / 2; tl.position.z = -0.06; tailG.add(tl);
  const tip = new THREE.Mesh(sph, toon(C.point)); tip.scale.setScalar(0.035); tip.position.set(0, 0.07, -0.1); tailG.add(tip);
  // head
  const head = new THREE.Group(); head.position.set(0, 0.2, 0.7); bodyG.add(head);
  const hs = new THREE.Mesh(sph, toon(C.body)); hs.scale.set(0.37, 0.34, 0.34); hs.castShadow = true; head.add(hs);
  const jowl = new THREE.Mesh(sph, toon(C.body)); jowl.scale.set(0.3, 0.2, 0.26); jowl.position.set(0, -0.14, 0.1); head.add(jowl);
  const snoutG = new THREE.Group(); snoutG.position.set(0, -0.06, 0.3); head.add(snoutG);
  const sn = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.16, 22), toon(C.snout)); sn.rotation.x = Math.PI / 2; sn.castShadow = true; snoutG.add(sn);
  for (const sx of [-1, 1]) { const n = new THREE.Mesh(sph, toon(C.nost)); n.scale.set(0.03, 0.045, 0.02); n.position.set(sx * 0.055, 0, 0.082); n.userData.noOutline = true; snoutG.add(n); }
  const blaze = new THREE.Mesh(sph, toon(C.point)); blaze.scale.set(0.08, 0.05, 0.16); blaze.position.set(0, 0.13, 0.2); blaze.userData.noOutline = true; head.add(blaze);
  // mouth + potato (in the mouth, like the statue)
  const mouthG = new THREE.Group(); mouthG.position.set(0, -0.24, 0.36); head.add(mouthG);
  let pot = null; if (hasPotato) { pot = potato(0.9, C.pot); pot.rotation.z = 0.25; mouthG.add(pot); }
  const ears = [-1, 1].map(s => { const eg = new THREE.Group(); eg.position.set(s * 0.22, 0.26, 0.02); head.add(eg); const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 3), toon(C.body)); ear.scale.z = 0.4; ear.position.y = 0.11; ear.castShadow = true; eg.add(ear); const inner = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.17, 3), toon(C.ear)); inner.scale.z = 0.2; inner.position.set(0, 0.1, 0.03); inner.userData.noOutline = true; eg.add(inner); eg.rotation.set(0.9, 0, -s * 0.5); return { eg, s }; });
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.15, 0.08, 0.27), new THREE.Vector3(s * 0.35, 0.12, 0.93).normalize(), 0.085, { lid: C.lid, white: C.white, pupil: C.pupil, bronze }));
  // legs with white socks + hooves
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const hip = new THREE.Group(); hip.position.set(sx * 0.24, 0.42, sz * 0.42); g.add(hip);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.32, 10).translate(0, -0.16, 0), toon(C.body)); l.castShadow = true; hip.add(l);
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.07, 0.12, 10).translate(0, -0.3, 0), toon(C.point)); sock.userData.noOutline = true; hip.add(sock);
    const hoof = new THREE.Mesh(sph, toon(C.hoof)); hoof.scale.set(0.075, 0.045, 0.09); hoof.position.set(0, -0.38, 0.02); hip.add(hoof); return { hip, ph: (sx * sz > 0 ? 0 : Math.PI) }; });
  if (!bronze) root.add(blob(0.75, 0.3));
  outline(g, { px: bronze ? 2.6 : 2.9 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.3; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.pot = pot; root.head = head;
  root.update = (t, u = {}) => {
    const { walk = 0, chew = 0, lid = 0.42, lidAngle = 0, look = [0, 0], headTurn = 0, headNod = 0, earFlop = 0, tail = 1, blink = !bronze, trot = 2.4 } = u;
    const w = (t * trot + seed * 0.3) * Math.PI * 2, wk = clamp(walk);
    legs.forEach(L => (L.hip.rotation.x = Math.sin(w + L.ph) * 0.55 * wk));
    bodyG.position.y = 0.66 + Math.abs(Math.sin(w)) * 0.05 * wk; bodyG.rotation.z = Math.sin(w) * 0.04 * wk;
    const ch = chew * Math.max(0, Math.sin(t * 9 + seed)); // chewing: head bobs, snout wiggles, potato jiggles
    head.rotation.set(headNod + ch * 0.07 + (bronze ? 0 : noise(t * 0.8, seed) * 0.03), headTurn + (bronze ? 0 : Math.sin(t * 1.7 + seed) * 0.04), 0);
    snoutG.rotation.x = ch * 0.1; if (pot) { pot.position.y = -ch * 0.02; pot.rotation.x = ch * 0.15; }
    ears.forEach(E2 => { E2.eg.rotation.x = 0.9 + earFlop * 0.5 + (bronze ? 0 : Math.sin(t * 2.3 + E2.s) * 0.05) + ch * 0.05; });
    tailG.rotation.z = bronze ? 0 : Math.sin(t * 6) * 0.5 * tail;
    const bl = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
  };
  root.update(0); return root;
}
// the statue: a life-size bronze Berkshire boar with a potato in its mouth on a stone plinth (+ plaque)
export function statue() { const g = PR.propGroup(); const pl = rbox(1.9, 1.0, 1.3, '#9a968e', 0, 0.5, 0, 0.06); g.add(pl); g.add(rbox(2.1, 0.12, 1.5, '#86827a', 0, 1.02, 0, 0.04));
  const plq = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.34), toon('#ffffff', { map: canvasTex(512, 160, (x, W, H) => { x.fillStyle = '#5a4a2a'; x.fillRect(0, 0, W, H); x.strokeStyle = '#c9a14a'; x.lineWidth = 10; x.strokeRect(8, 8, W - 16, H - 16); x.fillStyle = '#e8c25a'; x.font = '700 64px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KAISER WIL-HAM', W / 2, H / 2 + 4); }) }));
  plq.position.set(0, 0.55, 0.656); plq.userData.noOutline = true; g.add(plq); outline(g, { px: 2.4 });
  const p = pig({ bronze: true, seed: 9 }); p.position.y = 1.08; g.add(p); g.pig = p; p.update(0, { lid: 0.4 }); g.add(blob(1.4, 0.3)); return g; }

// ---------- soldiers (1859). US: dark-blue coat, sky-blue trousers, kepi. British: red coat, dark trousers, black cap. ----------
const SK = ['fair', 'tan', 'light', 'olive', 'brown'];
export const usSoldier = (i = 0, o = {}) => bean({ name: 'US soldier', outfit: 'uniform', colors: { main: '#2f3f6a', legsTop: '#7f98bf', trim: '#d8b04a', belt: '#2a2220' }, head: 'cap', headColor: '#26335a', skin: SK[i % 5], hair: 'bowl', hairColor: ['#3a2618', '#6a4428', '#1e1612'][i % 3], seed: 300 + i, ...o });
export const ukSoldier = (i = 0, o = {}) => bean({ name: 'British soldier', outfit: 'uniform', colors: { main: '#c0392b', legsTop: '#2a2a36', trim: '#f2ead6', belt: '#f2ead6' }, head: 'cap', headColor: '#1e1e26', skin: SK[(i + 2) % 5], hair: 'bowl', hairColor: ['#6a4428', '#c98a3a', '#3a2618'][i % 3], seed: 330 + i, ...o });
export const usOfficer = () => usSoldier(5, { moustache: '#5a3a22', hair: 'swoop', colors: { main: '#26335a', legsTop: '#26335a', trim: '#e8c25a' }, seed: 360 });
export const ukOfficial = () => bean({ name: 'British official', outfit: 'uniform', colors: { main: '#2a2a3a', legsTop: '#3a3a46', trim: '#d8b04a' }, head: 'none', skin: 'light', hair: 'horseshoe', hairColor: '#8a8580', moustache: '#8a8580', seed: 370 });
export const admiral = () => bean({ name: 'Admiral', outfit: 'uniform', colors: { main: '#1e2a4a', legsTop: '#f2ead6', trim: '#e8c25a' }, head: 'cap', headColor: '#1a2240', skin: 'fair', hair: 'bald', moustache: '#e8e4dc', seed: 380 });
export const farmer = () => bean({ name: 'Farmer', outfit: 'tee', colors: { main: '#d8c8a0', legsTop: '#5a4a3a' }, skin: 'tan', hair: 'messy', hairColor: '#7a4a28', beard: true, beardColor: '#7a4a28', head: 'slouch', headColor: '#6a5038', bandColor: '#3a2a20', seed: 390 });
// the German emperor (an original toon, not a portrait): spiked helmet, big white whiskers
export function kaiser() { const k = bean({ name: 'Emperor', outfit: 'uniform', colors: { main: '#26304a', legsTop: '#26304a', trim: '#e8c25a' }, head: 'cap', headColor: '#1a1a1e', skin: 'light', hair: 'bald', moustache: '#f2f0ea', beard: true, beardColor: '#f2f0ea', seed: 395 });
  const sp = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 12), toon('#d8b04a')); sp.position.set(0, 0.74, -0.03); sp.castShadow = true; k.parts.head.add(sp); return k; }
// musket held upright in a hand, kept in world space each frame (never aimed at anyone)
export function musket() { const g = PR.propGroup(cyl(0.035, 0.04, 1.3, '#6a4228', 0, 0, 0, 8), cyl(0.02, 0.02, 0.6, '#3a3a3e', 0, 0.9, 0, 6)); g.children[0].position.y = 0.05; outline(g, { px: 2.2 }); return g; }
const _v = new THREE.Vector3();
export function holdMusket(b, m) { b.hand.R.getWorldPosition(_v); m.position.set(_v.x, _v.y - 0.15, _v.z + 0.03); m.rotation.set(0.0, 0, 0.06); }
export const PARADE = { armR: [0.3, 0.2, 0.2], elbowR: 1.1, armL: [0.05, 0.08, 0], elbowL: 0.1 };

// ---------- flags (waving) ----------
function flagTex(kind) { return canvasTex(300, 180, (x, W, H) => {
  if (kind === 'us') { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#f6f1e6' : '#c8332e'; x.fillRect(0, (i * H) / 13, W, H / 13 + 1); } x.fillStyle = '#2a3a78'; x.fillRect(0, 0, W * 0.42, H * 7 / 13); x.fillStyle = '#f6f1e6'; for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(14 + i * 20 + (j % 2) * 8, 13 + j * 22, 4.2, 0, 7); x.fill(); } }
  else { x.fillStyle = '#2a3a78'; x.fillRect(0, 0, W, H); const d = (w, c) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, H); x.moveTo(W, 0); x.lineTo(0, H); x.stroke(); }; d(34, '#f6f1e6'); d(12, '#c8332e'); x.fillStyle = '#f6f1e6'; x.fillRect(W / 2 - 30, 0, 60, H); x.fillRect(0, H / 2 - 30, W, 60); x.fillStyle = '#c8332e'; x.fillRect(W / 2 - 18, 0, 36, H); x.fillRect(0, H / 2 - 18, W, 36); }
}); }
export function flag(kind = 'us', o = {}) { const { h = 3.4, w = 1.5 } = o; const g = PR.propGroup(cyl(0.04, 0.05, h, '#e8e0d0', 0, h / 2, 0, 8), ball(0.08, '#d8b04a', 0, h + 0.05, 0, 10)); outline(g, { px: 2.2 });
  const geo = new THREE.PlaneGeometry(w, w * 0.6, 12, 4); geo.translate(w / 2, 0, 0); const cl = new THREE.Mesh(geo, toon('#ffffff', { map: flagTex(kind), side: THREE.DoubleSide })); cl.position.y = h - w * 0.3 - 0.05; cl.userData.noOutline = true; cl.castShadow = true; g.add(cl);
  const base = geo.attributes.position.array.slice(); g.cloth = cl;
  g.update = (t, amp = 1) => { const p = geo.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = base[i]; p[i + 2] = Math.sin(x * 3.2 - t * 6) * 0.12 * (x / w) * amp; p[i + 1] = base[i + 1] - (x / w) * 0.05 * (1 - amp); } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); };
  g.update(0); return g; }

// ---------- warship: steam frigate with sails + funnel. Faces +Z (bow). .update(t) rocks ----------
export function warship(o = {}) { const { color = '#2a2a30', seed = 1 } = o; const g = PR.propGroup(); const hull = new THREE.Group(); g.add(hull);
  const bandTex = canvasTex(512, 64, (x, W, H) => { x.fillStyle = '#20202a'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2ead6'; x.fillRect(0, 16, W, 32); x.fillStyle = '#20202a'; for (let i = 0; i < 14; i++) x.fillRect(18 + i * 35, 22, 16, 20); });
  hull.add(rbox(1.7, 1.0, 6.0, color, 0, 0.45, 0, 0.25)); const band = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.32, 5.4), [toon('#ffffff', { map: bandTex }), toon('#ffffff', { map: bandTex }), toon('#20202a'), toon('#20202a'), toon('#20202a'), toon('#20202a')]); band.position.y = 0.7; band.userData.noOutline = true; hull.add(band);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.6, 4, 1), toon(color)); bow.rotation.set(Math.PI / 2, Math.PI / 4, 0); bow.scale.set(1, 1, 0.62); bow.position.set(0, 0.45, 3.6); hull.add(bow);
  hull.add(rbox(1.5, 0.08, 5.8, '#a8865a', 0, 0.97, 0, 0.03), rbox(0.08, 0.3, 4.5, '#f2ead6', 0, 0.45, 0)); // deck
  const sails = [];
  [[1.7, 3.6], [0, 4.2], [-1.8, 3.4]].forEach(([z, h], i) => { hull.add(cyl(0.06, 0.08, h, '#7a5a3a', 0, 1 + h / 2, z, 8)); for (const [y, sw] of [[1 + h * 0.45, 1.9], [1 + h * 0.82, 1.4]]) { hull.add(cyl(0.035, 0.035, sw + 0.2, '#7a5a3a', 0, y + 0.55, z, 6).rotateZ(Math.PI / 2));
      const sg = new THREE.CylinderGeometry(2.4, 2.4, 1.05, 12, 1, true, -sw / 4.8, sw / 2.4); sg.translate(0, 0, -2.4); const s = new THREE.Mesh(sg, toon('#f4eee0', { side: THREE.DoubleSide })); s.rotation.y = 0.75 + i * 0.05; s.position.set(0, y, z); s.castShadow = true; hull.add(s); sails.push(s); } });
  hull.add(cyl(0.22, 0.24, 1.3, '#1e1e22', 0, 1.6, 0.85, 14)); // funnel (a steam frigate)
  const fl = flag('uk', { h: 1.6, w: 0.8 }); fl.position.set(0, 0.95, -2.7); fl.rotation.y = Math.PI / 2; hull.add(fl); g.flag = fl;
  outline(hull, { px: 2.4 }); g.update = (t) => { hull.rotation.z = Math.sin(t * 1.1 + seed) * 0.03; hull.rotation.x = Math.sin(t * 0.8 + seed * 2) * 0.015; hull.position.y = Math.sin(t * 1.3 + seed) * 0.05; fl.update(t); };
  g.update(0); return g; }
export function rowboat() { const g = PR.propGroup(); const h = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon('#8a5a32', { side: THREE.DoubleSide })); h.scale.set(0.75, 0.42, 1.9); h.position.y = 0.42; h.castShadow = true; g.add(h);
  g.add(rbox(1.4, 0.06, 0.25, '#6a4228', 0, 0.38, 0.5, 0.02), rbox(1.4, 0.06, 0.25, '#6a4228', 0, 0.38, -0.6, 0.02)); return (outline(g, { px: 2.4 }), g); }
export function cannon(o = {}) { const g = PR.propGroup(); const br = cyl(0.13, 0.19, 1.4, '#2e2e34', 0, 0, 0, 14); br.rotation.x = Math.PI / 2 - 0.12; br.position.set(0, 0.62, 0.15); g.add(br);
  for (const sx of [-1, 1]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 8, 20), toon('#6a4228')); wh.rotation.y = Math.PI / 2; wh.position.set(sx * 0.3, 0.4, 0); g.add(wh); g.add(cyl(0.08, 0.08, 0.08, '#4a3020', sx * 0.3, 0.4, 0, 8).rotateZ(Math.PI / 2)); }
  g.add(rbox(0.42, 0.18, 1.1, '#7a5032', 0, 0.38, -0.3, 0.03)); g.add(blob(0.8, 0.28)); return (outline(g, { px: 2.4 }), g); }
export function fir(s = 1, seed = 1) { const r = rng(seed); const g = PR.propGroup(cyl(0.12, 0.16, 1.2, '#6a4a32', 0, 0.6, 0, 7)); const cs = ['#2f5a3a', '#376642', '#2a5034'];
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.25 - i * 0.24, 1.5, 9), toon(cs[(i + seed) % 3])); c.position.y = 1.4 + i * 0.85; c.rotation.y = r() * 3; c.castShadow = true; g.add(c); }
  g.scale.setScalar(s); outline(g, { px: 2.2 }); return g; }
export function tent(color = '#efe8d8', stripe = null) { const g = PR.propGroup(); const geo = new THREE.CylinderGeometry(0.02, 1.25, 1.9, 4, 1, false, Math.PI / 4); const t = new THREE.Mesh(geo, toon(color)); t.scale.z = 1.2; t.position.y = 0.95; t.castShadow = true; g.add(t);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.9), flat('#3a3028')); door.position.set(0, 0.45, 1.07); door.rotation.x = -0.45; door.userData.noOutline = true; g.add(door); if (stripe) g.add(cyl(0.03, 0.03, 0.5, stripe, 0, 2.05, 0, 6)); g.add(blob(1.4, 0.25)); return (outline(g, { px: 2.4 }), g); }
export function potatoPatch(st, x, z, rows = 4, cols = 7, seed = 3) { const r = rng(seed); const g = new THREE.Group(); st.add(g);
  const soil = new THREE.Mesh(new THREE.PlaneGeometry(cols * 0.7 + 0.6, rows * 0.9 + 0.4), toon('#7a5434')); soil.rotation.x = -Math.PI / 2; soil.position.set(x, 0.012, z); soil.receiveShadow = true; soil.userData.noOutline = true; g.add(soil);
  for (let j = 0; j < rows; j++) { const ridge = rbox(cols * 0.7, 0.12, 0.38, '#8a6040', x, 0.05, z - (rows - 1) * 0.45 + j * 0.9, 0.05); ridge.userData.noOutline = true; g.add(ridge);
    for (let i = 0; i < cols; i++) { const p = PR.propGroup(); for (let k = 0; k < 4; k++) { const l = ball(0.17 + r() * 0.06, ['#4f8a3a', '#5f9a42', '#457a34'][k % 3], (r() - 0.5) * 0.3, 0.22 + r() * 0.12, (r() - 0.5) * 0.3, 10); p.add(l); } p.position.set(x - (cols - 1) * 0.35 + i * 0.7, 0, z - (rows - 1) * 0.45 + j * 0.9); outline(p, { px: 2 }); g.add(p); } }
  return g; }
// a few birds that burst out of a tree (s07). .update(t, t0)
export function birds(n = 6, seed = 4) { const r = rng(seed); const g = new THREE.Group(); const L = [];
  for (let i = 0; i < n; i++) { const b = PR.propGroup(ball(0.14, '#3a3238', 0, 0, 0, 10)); const wings = [-1, 1].map(s => { const w = ball(0.12, '#4a4248', s * 0.14, 0.02, 0, 8); w.scale.set(1.4, 0.25, 0.7); b.add(w); return w; }); outline(b, { px: 2 }); g.add(b); L.push({ b, wings, dx: (r() - 0.5) * 6, dy: 2 + r() * 2, ph: r() * 6, d: r() * 0.15 }); }
  g.update = (t, t0) => L.forEach(({ b, wings, dx, dy, ph, d }) => { const u = Math.max(0, t - t0 - d); b.position.set(dx * u * 0.8 + (u > 0 ? 0 : dx * 0.05), 0.2 + dy * u - u * u * 0.3, -u * 0.6); b.visible = true; wings.forEach((w, k) => (w.rotation.z = (k ? -1 : 1) * Math.sin(t * 28 + ph) * (u > 0 ? 0.9 : 0.1))); });
  return g; }

// ---------- sets ----------
const grassTex = () => PR.TEX.plaster('#7fae5a', [10, 10]);
export function meadow(st, o = {}) { const { sea = true, seaZ = -30, mountains = true, trees = true, seed = 3 } = o; const g = new THREE.Group(); st.add(g); const r = rng(seed);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), PR.texMat(grassTex())); gr.rotation.x = -Math.PI / 2; gr.position.z = seaZ - 100 + (sea ? 0 : -100); gr.receiveShadow = true; gr.userData.noOutline = true;
  // ground ends at seaZ (sea beyond)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 140), PR.texMat(grassTex())); ground.rotation.x = -Math.PI / 2; ground.position.z = seaZ + 70; ground.receiveShadow = true; ground.userData.noOutline = true; g.add(ground);
  if (sea) { const w = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), toon('#5f9ac0')); w.rotation.x = -Math.PI / 2; w.position.set(0, -0.15, seaZ - 150); w.userData.noOutline = true; g.add(w);
    const beach = new THREE.Mesh(new THREE.PlaneGeometry(200, 3), toon('#d8c49a')); beach.rotation.x = -Math.PI / 2; beach.position.set(0, 0.005, seaZ + 1.3); beach.userData.noOutline = true; g.add(beach); }
  else g.add(gr);
  if (mountains) for (let i = 0; i < 5; i++) { const m = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(14 + r() * 8, 12 + r() * 8, 7), toon('#8aa0b8')); c.position.y = 6; m.add(c); const cap = new THREE.Mesh(new THREE.ConeGeometry(4.5, 4, 7), toon('#f2f2f0')); cap.position.y = c.geometry.parameters.height - 2 + 0.2; cap.scale.setScalar(1); m.add(cap); cap.position.y = 6 + c.geometry.parameters.height / 2 - 2; c.userData.noOutline = cap.userData.noOutline = true; m.position.set(-60 + i * 30 + r() * 8, -0.5, seaZ - 110 - r() * 20); g.add(m); }
  if (trees) { const spots = o.treeSpots || [[-9, -12], [-12, -6], [10, -11], [13, -5], [-15, -16], [16, -15], [-6, -18], [6, -19], [0, -22]]; spots.forEach(([x, z], i) => { if (z > seaZ + 2) g.add(fir(1 + r() * 0.5, seed + i).at(x, 0, z)); }); }
  return { group: g, update: () => {} }; }
export function stageOf(T, o = {}) { const st = toonStage(T, { light: o.light || 'day', fov: o.fov || 38, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0], ...(o.stage || {}) }); const set = meadow(st, o.meadow || {}); return { stage: st, set }; }
// whole island seen from above, in the sea, with the strait + mountains (s04, s05, s16)
export function islandScene(T, o = {}) { const st = toonStage(T, { light: 'day', fov: 40, shadowSize: 22, target: [0, 0, 0], bg: ['#9cc4ea', '#e6eef2'] });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), toon('#5f9ac0')); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.2; sea.userData.noOutline = true; st.add(sea);
  const isl = new THREE.Group(); st.add(isl); const r = rng(11);
  const shape = new THREE.Shape(); const N = 24; for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI * 2, rr = 13 * (1 + 0.18 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 5)); const x = Math.cos(a) * rr * 0.75, y = Math.sin(a) * rr; i ? shape.lineTo(x, y) : shape.moveTo(x, y); }
  const land = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.4, bevelSegments: 3 }), [toon('#7fae5a'), toon('#d8c49a')]); land.rotation.x = -Math.PI / 2; land.position.y = -0.6; land.receiveShadow = true; land.castShadow = true; isl.add(land);
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 9; const x = Math.cos(a) * d * 0.75, z = Math.sin(a) * d; if (Math.abs(x) < 2.5 && Math.abs(z) < 2.5) continue; isl.add(fir(0.7 + r() * 0.4, i).at(x, 0.4, z)); }
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(30, 22 + i * 3, 7), toon('#8aa0b8')); c.position.set(-80 + i * 55, 8, -120); c.userData.noOutline = true; st.add(c); const cap = new THREE.Mesh(new THREE.ConeGeometry(9, 8, 7), toon('#f2f2f0')); cap.position.set(-80 + i * 55, 8 + (22 + i * 3) / 2 - 3.6, -120); cap.userData.noOutline = true; st.add(cap); }
  outline(isl, { px: 2.2 }); return { stage: st, island: isl }; }
