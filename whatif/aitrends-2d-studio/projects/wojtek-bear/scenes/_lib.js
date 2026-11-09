// shared helpers for "Wojtek, the Bear Who Joined the Army" (wojtek-bear). Underscore = not auto-loaded.
// The toon bear (ported from the byron-bear Short's kit addition into this project, + an optional army cap), 1940s soldiers,
// a desert army camp, a troop ship + gangplank, the hills of Monte Cassino (dusk), Edinburgh Zoo, the unit badge (2D).
import { E, wordTime, text, ease, clamp, lerp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, box, cyl, ball, plane, floor, blob, INK } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.16) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
const G = PR.propGroup;
const sph = new THREE.SphereGeometry(1, 20, 14);
function lidEye(parent, pos, n, size, o = {}) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.1, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat(o.pupil || '#1a1214')); p.scale.set(0.36, 0.4, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#6a7890')); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { pg, lp, roll, p };
}

function shadeC(hex, k) { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); }
// bear({ seed, scale, fur, muzzle, bow: '#hex' | false (ribbon bow at the neck), lead: bool (ribbon lead from the bow), mortarboard: bool })
// A friendly upright toon bear (~2.5 units to the ear tips, bean scale): pear body, cream belly + muzzle, round ears, lidded eyes.
// .update(t, { walk 0..1, wave 0..1 (right paw), waveL, armsUp 0..1, lid, lidAngle, look:[x,y], headTurn, headTilt, smile 0..1, open 0..1, sit 0..1, bob, ph })
// .paw.L / .paw.R are groups at the paws (attach props). Never hurt, never scary: it waves, smiles, poses, sits exams.
export function bear(o = {}) {
  const { seed = 3, scale = 1, fur = '#8a5a36', muzzle: muzC = '#e8cfa6', bow = '#c0392b', mortarboard = false } = o;
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const F = toon(fur), F2 = toon(shadeC(fur, -0.15)), MZ = toon(muzC), INKM = toon('#2a1a16');
  const hipsY = 0.72; const upper = new THREE.Group(); upper.position.y = hipsY; g.add(upper);
  const body = new THREE.Mesh(sph, F); body.scale.set(0.62, 0.72, 0.52); body.position.y = 0.42; body.castShadow = true; upper.add(body);
  const belly = new THREE.Mesh(sph, MZ); belly.scale.set(0.42, 0.5, 0.3); belly.position.set(0, 0.36, 0.28); upper.add(belly);
  // head
  const head = new THREE.Group(); head.position.set(0, 1.34, 0.04); upper.add(head);
  const hs = new THREE.Mesh(sph, F); hs.scale.set(0.5, 0.45, 0.44); hs.castShadow = true; head.add(hs);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(sph, F); ear.scale.set(0.16, 0.16, 0.09); ear.position.set(s * 0.34, 0.34, -0.04); ear.castShadow = true; head.add(ear); const ei = new THREE.Mesh(sph, MZ); ei.scale.set(0.09, 0.09, 0.04); ei.position.set(s * 0.34, 0.33, 0.03); ei.userData.noOutline = true; head.add(ei); }
  const muz = new THREE.Mesh(sph, MZ); muz.scale.set(0.24, 0.17, 0.18); muz.position.set(0, -0.12, 0.34); head.add(muz);
  const nose = new THREE.Mesh(sph, INKM); nose.scale.set(0.085, 0.06, 0.06); nose.position.set(0, -0.04, 0.5); head.add(nose);
  const smileM = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 6, 16, Math.PI), flat('#2a1a16')); smileM.rotation.z = Math.PI; smileM.position.set(0, -0.16, 0.505); smileM.userData.noOutline = true; head.add(smileM);
  const mouthO = new THREE.Mesh(sph, flat('#5a1e22')); mouthO.scale.set(0.07, 0.05, 0.02); mouthO.position.set(0, -0.19, 0.51); mouthO.userData.noOutline = true; head.add(mouthO);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.17, 0.08, 0.37), new THREE.Vector3(s * 0.35, 0.1, 0.93).normalize(), 0.085, { lid: shadeC(fur, -0.05) }));
  const brows = [-1, 1].map(s => { const b = new THREE.Mesh(sph, F2); b.scale.set(0.08, 0.025, 0.03); b.position.set(s * 0.17, 0.2, 0.4); b.userData.noOutline = true; head.add(b); return b; });
  if (mortarboard) { const mm = toon('#1e1c24'); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 10, 0, Math.PI * 2, 0, 1.0), mm); cap.position.y = 0.1; cap.scale.set(1.15, 1, 1.0); head.add(cap);
    const brd = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.035, 0.85), mm); brd.position.set(0, 0.5, -0.02); brd.rotation.set(-0.1, Math.PI / 4, 0.08); brd.castShadow = true; head.add(brd);
    const tas = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.025, 0.24, 6), toon('#e0b84a')); tas.position.set(0.4, 0.38, 0.06); tas.userData.noOutline = true; head.add(tas); }
  if (o.cap) { const cm = toon(o.cap === true ? '#6a6440' : o.cap); const top = cyl(0.3, 0.27, 0.16, cm, 0, 0.42, -0.02, 22); top.rotation.x = -0.12; head.add(top); const vis = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 20, 1, false, -1.1, 2.2), toon('#2a2018')); vis.position.set(0, 0.36, 0.18); vis.rotation.x = 0.15; head.add(vis); const eagle = ball(0.045, '#e8e0c8', 0, 0.44, 0.27, 10); eagle.scale.z = 0.4; head.add(eagle); }
  if (bow) { const bm = toon(bow); for (const s of [-1, 1]) { const w = new THREE.Mesh(sph, bm); w.scale.set(0.11, 0.07, 0.05); w.position.set(s * 0.1, 0.98, 0.36); w.rotation.z = s * 0.3; head.parent.add(w); } const k = new THREE.Mesh(sph, bm); k.scale.setScalar(0.045); k.position.set(0, 0.98, 0.39); upper.add(k);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 6, 24), bm); ring.rotation.x = Math.PI / 2 + 0.25; ring.position.set(0, 1.0, 0.0); ring.userData.noOutline = true; upper.add(ring); }
  // arms: shoulder pivot -> thick limb -> paw
  const arm = {}; const paw = {};
  for (const [side, s] of [['L', 1], ['R', -1]]) { const sh = new THREE.Group(); sh.position.set(s * 0.52, 0.82, 0.02); sh.rotation.order = 'ZXY'; upper.add(sh);
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.62, 12).translate(0, -0.31, 0), F); a.castShadow = true; sh.add(a);
    const p = new THREE.Group(); p.position.y = -0.64; sh.add(p); const pb = new THREE.Mesh(sph, F); pb.scale.set(0.15, 0.15, 0.14); pb.castShadow = true; p.add(pb); const pad = new THREE.Mesh(sph, MZ); pad.scale.set(0.08, 0.08, 0.03); pad.position.set(0, -0.02, 0.12); pad.userData.noOutline = true; p.add(pad);
    arm[side] = sh; paw[side] = p; }
  // legs: short and stubby
  const leg = {};
  for (const [side, s] of [['L', 1], ['R', -1]]) { const hp = new THREE.Group(); hp.position.set(s * 0.26, hipsY + 0.1, 0); g.add(hp);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.6, 12).translate(0, -0.3, 0), F); l.castShadow = true; hp.add(l);
    const ft = new THREE.Mesh(sph, F); ft.scale.set(0.19, 0.12, 0.26); ft.position.set(0, -0.74, 0.08); ft.castShadow = true; hp.add(ft);
    const sole = new THREE.Mesh(sph, MZ); sole.scale.set(0.12, 0.08, 0.04); sole.position.set(0, -0.72, 0.33); sole.userData.noOutline = true; hp.add(sole); leg[side] = hp; }
  const tail = new THREE.Mesh(sph, F); tail.scale.setScalar(0.12); tail.position.set(0, 0.12, -0.5); upper.add(tail);
  root.add(blob(0.7, 0.3)); outline(g, { px: 3.0 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.9; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.paw = paw; root.parts = { head, upper, body, arm, leg }; root.head = head; root.headR = 0.48 * scale; root.eyes = eyes;
  root.update = (t, u = {}) => {
    const { walk = 0, wave = 0, waveL = 0, armsUp = 0, lid = 0.3, lidAngle = 0, look = [0, 0], headTurn = 0, headTilt = 0, smile = 1, open = 0, sit = 0, blink = true, ph = seed, brow = 0, pose = null } = u;
    const w = (t * 1.6 + ph * 0.1) * Math.PI * 2, wk = clamp(walk);
    const sL = Math.sin(w), sR = Math.sin(w + Math.PI);
    leg.L.rotation.x = -sL * 0.5 * wk - sit * 1.45; leg.R.rotation.x = -sR * 0.5 * wk - sit * 1.45;
    upper.position.y = hipsY + Math.abs(Math.sin(w)) * 0.06 * wk + Math.sin(t * 2.1 + ph) * 0.012; upper.rotation.z = Math.sin(w) * 0.07 * wk; upper.rotation.y = Math.sin(w) * 0.08 * wk;
    // arms: swing when walking, wave, arms up
    const wv = clamp(wave), wvL = clamp(waveL), up = clamp(armsUp);
    arm.L.rotation.set(lerp(sR * 0.5 * wk - 0.05, -2.6, Math.max(up, wvL)), 0, lerp(0.25, 0.5, Math.max(up, wvL)) + wvL * Math.sin(t * 9) * 0.35);
    arm.R.rotation.set(lerp(sL * 0.5 * wk - 0.05, -2.6, Math.max(up, wv)), 0, -lerp(0.25, 0.5, Math.max(up, wv)) - wv * Math.sin(t * 9) * 0.35);
    if (pose) { if (pose.armL) arm.L.rotation.set(...pose.armL); if (pose.armR) arm.R.rotation.set(...pose.armR); }
    head.rotation.set(Math.sin(t * 1.7 + ph) * 0.03, headTurn + Math.sin(w) * 0.05 * wk, -headTilt);
    const bl = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    brows.forEach(b => { b.position.y = 0.2 + brow * 0.05; });
    smileM.visible = open < 0.5; smileM.scale.set(1, lerp(0.4, 1, smile), 1); mouthO.visible = open >= 0.5; mouthO.scale.set(0.07, 0.04 + open * 0.05, 0.02);
  };
  root.update(0); return root;
}

// ---------- people (original characters, not portraits) ----------
const SK = ['fair', 'light', 'tan', 'olive', 'fair'];
export const soldier = (i = 0, o = {}) => bean({ name: 'Soldier', outfit: 'uniform', colors: { main: '#8a7d55', legsTop: '#7a6d48', trim: '#c9b06a' }, head: 'cap', headColor: '#6a6440', skin: SK[i % SK.length], hair: ['bowl', 'swoop', 'curly', 'spiky'][i % 4], hairColor: ['#3a2618', '#6a4428', '#1e1612', '#8a6a3a'][i % 4], moustache: i === 2 ? '#3a2618' : false, seed: 400 + i, ...o });
export const officer = () => bean({ name: 'Officer', outfit: 'uniform', colors: { main: '#2c3a5a', legsTop: '#232e48', trim: '#e0c060' }, head: 'cap', headColor: '#1e2840', skin: 'light', hair: 'bald', moustache: '#c8b8a0', seed: 420 });
export const keeper = () => bean({ name: 'Keeper', outfit: 'tee', colors: { main: '#3a7a4a', legsTop: '#4a4a3a' }, head: 'ballcap', headColor: '#2f6a3a', skin: 'fair', hair: 'messy', hairColor: '#8a5a2a', seed: 430 });
const signTex = (txt, bg, fg, w = 512, h = 128, size = 64) => canvasTex(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, W - 16, H - 16); g.fillStyle = fg; g.font = `900 ${size}px Fredoka, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + 4); });
export function sign(txt, o = {}) { const { w = 2.4, h = 0.7, bg = '#f2e4c2', fg = '#5a2a1a', size = 64, post = 0 } = o; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: signTex(txt, bg, fg, 512, Math.round(512 * h / w), size) })); m.userData.noOutline = true; m.position.z = 0.03; const g = G(rbox(w + 0.12, h + 0.12, 0.06, '#5a3a22', 0, 0, 0, 0.03), m); if (post) { g.add(cyl(0.06, 0.06, post, '#5a3a22', 0, -post / 2, -0.05, 8)); g.position.y = post; } outline(g, { px: 2 }); return g; }
export const shellCrate = () => { const g = G(rbox(0.9, 0.45, 0.55, '#6a5a32', 0, 0.225, 0, 0.03), box(0.92, 0.06, 0.57, '#4a3e22', 0, 0.42, 0)); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), toon('#ffffff', { map: signTex('SHELLS', '#6a5a32', '#f2e4c2', 256, 86, 56) })); m.position.set(0, 0.23, 0.28); m.userData.noOutline = true; g.add(m); outline(g, { px: 2.4 }); return g; };
export function tent(o = {}) { const { color = '#a8986a' } = o; const g = G(); const t = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.2, 4), toon(color)); t.position.y = 1.1; t.rotation.y = Math.PI / 4; t.scale.z = 1.4; t.castShadow = true; g.add(t); g.add(box(0.7, 1.1, 0.05, '#4a3e2a', 0, 0.55, 1.36)); g.add(blob(1.8, 0.25)); outline(g, { px: 2.2 }); return g; }
export function palm(o = {}) { const { h = 4.5 } = o; const g = G(cyl(0.12, 0.18, h, '#8a6a3a', 0, h / 2, 0, 8)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const l = ball(0.9, '#4a8a3a', Math.sin(a) * 0.8, h - 0.1, Math.cos(a) * 0.8, 10); l.scale.set(1, 0.18, 0.4); l.rotation.y = -a + Math.PI / 2; l.rotation.z = 0.35; g.add(l); } outline(g, { px: 2 }); return g; }
// sunny desert camp (Iran 1942): tents, crates, a truck, palms, far mountains
export function camp(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 1] });
  const sky = sunnySky(st, { clouds: 6, seed: o.seed || 3 }); st.add(floor(120, 120, '#d8b880', 0, -30));
  [[-3.4, -3, 0.3], [3.2, -3.6, -0.4], [0, -6.5, 0.1], [-7, -7, 0.5], [7, -8, -0.2]].forEach(([x, z, r]) => st.add(tent().at(x, 0, z, r)));
  [[-5.5, -1.5], [6, -2], [9, -10], [-10, -11]].forEach(([x, z]) => st.add(palm({ h: 4.2 + (x % 2) }).at(x, 0, z)));
  const tr = PR.truck({ color: '#6a6a42' }).at(5.0, 0, -0.5, -0.5); st.add(tr);
  st.add(shellCrate().at(-1.9, 0, 0.6, 0.2), PR.crate({ s: 0.7, color: '#7a6a42' }).at(-2.4, 0, -0.2, 0.4), PR.barrel({ color: '#5a6a3a' }).at(2.3, 0, 0.2));
  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(28 + i * 5, 14 + i * 3, 6), toon(['#c8a070', '#b89068', '#d0a878', '#a88860'][i])); m.position.set(-60 + i * 40, 6, -110 - (i % 2) * 15); m.userData.noOutline = true; st.add(m); }
  return { stage: st, sky, truck: tr };
}
// the troop ship at the dock: a grey hull wall with portholes, a gangplank, a NO PETS sign
export function dock(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 9, target: [0, 0, 1] }); const sky = sunnySky(st, { clouds: 7, seed: 5 });
  st.add(floor(120, 60, '#3a7ab8', 0, -30)); const quay = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 12), PR.texMat(PR.TEX.stone('#c8bca0', [6, 3]))); quay.position.set(0, -0.3, 4); quay.receiveShadow = true; st.add(quay);
  const hull = G(rbox(26, 7, 4, '#3e4c5e', 0, 2.0, 0, 0.3), box(26.2, 0.5, 4.1, '#a83a2a', 0, -1.2, 0), box(26.2, 0.25, 4.1, '#e8e0d0', 0, 5.4, 0)); for (let i = 0; i < 10; i++) hull.add(cyl(0.3, 0.3, 0.1, '#e8e0d0', -11 + i * 2.4, 3.6, 2.02, 16).rotateX(Math.PI / 2)); hull.add(rbox(5, 3, 3, '#e8e0d0', -4, 7.0, -0.2, 0.1), cyl(0.7, 0.8, 3, '#d0b040', -3, 9.5, -0.3, 16)); outline(hull, { px: 2.2 }); hull.position.set(0, 0, -3.2); st.add(hull);
  const plank = G(rbox(1.2, 0.12, 4.8, '#8a6440', 0, 0, 0, 0.03)); plank.position.set(1.6, 1.6, -0.2); plank.rotation.x = 0.55; outline(plank, { px: 2 }); st.add(plank);
  const ns = sign('NO PETS ALLOWED', { w: 2.2, h: 0.62, bg: '#ffffff', fg: '#c0392b', size: 54, post: 1.4 }); ns.position.set(-0.15, 1.4, 0.3); st.add(ns);
  return { stage: st, sky, sign: ns };
}
// Monte Cassino (1944), told without combat: dusk light, the hill with the monastery far away, trucks and crates, dust only
export function cassino(T, o = {}) {
  const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: 9, target: [0, 0, 1], bg: ['#4a4878', '#c88a72', '#f0b888'] });
  st.add(floor(140, 140, '#9a8462', 0, -40));
  const hill = new THREE.Mesh(new THREE.ConeGeometry(55, 34, 9), toon('#6a7458')); hill.position.set(-8, 15, -120); hill.userData.noOutline = true; st.add(hill);
  const mon = G(box(22, 6, 8, '#e8dcc4', 0, 3, 0), box(23, 0.8, 8.5, '#c8b898', 0, 6.2, 0)); for (let i = 0; i < 9; i++) mon.add(box(1, 1.6, 0.2, '#3a3040', -9 + i * 2.25, 3.4, 4.05)); mon.traverse(x => { x.userData.noOutline = true; }); mon.position.set(-8, 32, -120); st.add(mon);
  [[-30, -90, 40, 16, '#7a8060'], [35, -95, 45, 18, '#727a5a'], [60, -130, 50, 26, '#6a7050']].forEach(([x, z, r, h, c]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), toon(c)); m.position.set(x, h / 2 - 1, z); m.userData.noOutline = true; st.add(m); });
  const tr = PR.truck({ color: '#5a6040' }).at(3.6, 0, -1.6, -0.9); st.add(tr);
  const stack = []; [[-2.4, 0, 0.2, 0], [-2.4, 0.45, 0.2, 0.08], [-1.4, 0, -0.3, -0.2], [2.0, 0, 0.6, 0.3], [2.1, 0.45, 0.6, 0.2]].forEach(([x, y, z, r]) => { const c = shellCrate().at(x, y, z, r); st.add(c); stack.push(c); });
  return { stage: st, truck: tr };
}
// Edinburgh Zoo: green lawn, low stone wall, a pool, trees, the EDINBURGH ZOO sign
export function zoo(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 9, target: [0, 0, 1] }); const sky = sunnySky(st, { clouds: 9, seed: 8 });
  st.add(floor(120, 120, '#6aa84a', 0, -30));
  const wall = G(); for (let i = -6; i <= 6; i++) wall.add(rbox(1.0, 0.7, 0.6, i % 2 ? '#b8b0a0' : '#a8a090', i * 1.0, 0.35, 0, 0.08)); outline(wall, { px: 2 }); wall.position.set(0, 0, 3.4); st.add(wall);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.6, 28), toon('#5ab0e0')); pool.rotation.x = -Math.PI / 2; pool.position.set(2.6, 0.02, -1.2); pool.scale.y = 0.6; pool.userData.noOutline = true; st.add(pool);
  const rock = ball(1.2, '#9a948a', -2.8, 0.3, -1.8, 12); rock.scale.set(1.3, 0.7, 1); outline(rock, { px: 2 }); st.add(rock);
  [[-5, -5], [5.5, -6], [0, -9], [-8, -10], [8, -11]].forEach(([x, z], i) => { const tr = G(cyl(0.18, 0.25, 2.4, '#6a4a2a', 0, 1.2, 0, 8), ball(1.5, '#3f7a3a', 0, 3.2, 0, 14), ball(1.1, '#4a8a3f', 0.8, 2.8, 0.3, 12)); outline(tr, { px: 2 }); tr.position.set(x, 0, z); st.add(tr); });
  const zs = sign('EDINBURGH ZOO', { w: 2.6, h: 0.65, bg: '#2f5a3a', fg: '#ffe9a8', size: 56, post: 1.6 }); zs.position.set(-1.9, 1.6, 3.7); st.add(zs);
  return { stage: st, sky };
}
// the unit badge (2D): a round emblem, a bear standing upright carrying a big artillery shell
export function badge(g, cx, cy, r, k = 1, o = {}) { if (k <= 0) return; g.save(); g.translate(cx, cy); const s = ease.outBack(clamp(k)); g.scale(s, s); g.lineJoin = 'round'; const ink = '#2a1c15';
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = o.bg || '#f2e4c2'; g.fill(); g.lineWidth = r * 0.07; g.strokeStyle = ink; g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.86, 0, 7); g.lineWidth = r * 0.025; g.stroke();
  const B = o.fur || '#8a5a36', u = r / 100; const el = (x, y, rx, ry, rot = 0, f = B) => { g.beginPath(); g.ellipse(x * u, y * u, rx * u, ry * u, rot, 0, 7); g.fillStyle = f; g.fill(); g.lineWidth = 4 * u; g.strokeStyle = ink; g.stroke(); };
  el(-14, 52, 11, 22, 0.1); el(14, 52, 11, 22, -0.1); el(0, 16, 30, 40); el(-16, -40, 9, 9); el(16, -40, 9, 9); el(0, -26, 24, 21); el(8, -22, 10, 7, 0, '#e8cfa6');
  g.save(); g.translate(26 * u, -6 * u); g.rotate(0.25); g.beginPath(); g.roundRect(-9 * u, -34 * u, 18 * u, 60 * u, 3 * u); g.fillStyle = '#c9a14a'; g.fill(); g.lineWidth = 4 * u; g.strokeStyle = ink; g.stroke(); g.beginPath(); g.moveTo(-9 * u, -34 * u); g.quadraticCurveTo(0, -56 * u, 9 * u, -34 * u); g.closePath(); g.fillStyle = '#b86a3a'; g.fill(); g.stroke(); g.restore();
  el(18, -8, 8, 16, -0.6); el(-14, 4, 8, 16, 0.5); g.beginPath(); g.arc(4 * u, -30 * u, 2.5 * u, 0, 7); g.fillStyle = ink; g.fill();
  g.restore(); }
