// The Bat Bomb — shared assets: a proud toon bat (Mexican free-tailed: big ears, lidded eyes, membrane wings),
// the tiny strapped-on bomb, a medal, the 1943 desert airfield (hangar, control tower, crates), a war room,
// plus 2D overlay helpers (hook text, rubber stamps, folder, blueprint plan). Underscore = not auto-loaded.
// Tone guard (MAIN): no mushroom cloud, no atomic jokes, nobody shown hurt; fire only on empty buildings.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { fire, smoke, embers } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- BAT
function lidEye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.12, size * 0.62); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#120c10')); p.scale.set(0.46, 0.5, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.13, 0.13, 0.05); gl.position.set(0.14, 0.18, 0.99); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}
// membrane wing shape (in the XY plane, pointing +X), scalloped trailing edge
function wingGeo(span = 1.0) {
  const s = new THREE.Shape(); s.moveTo(0, 0.08); s.quadraticCurveTo(span * 0.45, 0.32, span, 0.12);
  const n = 4; for (let i = 0; i < n; i++) { const x0 = span * (1 - i / n), x1 = span * (1 - (i + 1) / n); s.quadraticCurveTo((x0 + x1) / 2, -0.12 - 0.05 * Math.sin(i), x1, i === n - 1 ? -0.1 : -0.02); }
  s.lineTo(0, -0.12); s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: false }).translate(0, 0, -0.0125);
}
// bat({ seed, scale, bomb, medal }) — faces +Z, ~1 unit wide (wings folded ~0.6). .update(t, { flap 0..1, spread 0..1 (wings open), lid, lidAngle, look, headTurn, headTilt, puff (proud chest), grin, hang (upside-down roost), blink })
export function bat(o = {}) {
  const { seed = 1, scale = 1 } = o; const r = rng(seed);
  const C = o.color || '#7a5a48', C2 = shadeHex(C, 0.16), C3 = o.wing || '#4a3a40', lidC = shadeHex(C, 0.2);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const bodyG = new THREE.Group(); bodyG.position.y = 0.42; g.add(bodyG);
  const fur = toon(C), fur2 = toon(C2), skin = toon(C3), ear = toon(shadeHex(C3, 0.25));
  const body = mesh(sph, fur, 0.2, 0.25, 0.19); bodyG.add(body);
  const belly = mesh(sph, fur2, 0.15, 0.18, 0.1); belly.position.set(0, -0.02, 0.12); bodyG.add(belly);
  const head = new THREE.Group(); head.position.set(0, 0.27, 0.03); bodyG.add(head);
  const hs = mesh(sph, fur, 0.21, 0.19, 0.19); head.add(hs);
  const snout = mesh(sph, fur2, 0.09, 0.07, 0.08); snout.position.set(0, -0.05, 0.16); head.add(snout);
  const nose = mesh(sph, flat('#2a1a1e'), 0.035, 0.022, 0.02); nose.position.set(0, -0.02, 0.235); nose.userData.noOutline = true; head.add(nose);
  // grin: a dark arc + 2 tiny fangs (cute, not scary)
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.011, 6, 16, Math.PI), flat('#2a1216')); smile.rotation.z = Math.PI; smile.position.set(0, -0.085, 0.215); smile.userData.noOutline = true; head.add(smile);
  for (const s of [-1, 1]) { const f = mesh(new THREE.ConeGeometry(0.012, 0.03, 6).rotateX(Math.PI), flat('#ffffff'), 1, 1, 1); f.position.set(s * 0.028, -0.135, 0.215); f.userData.noOutline = true; head.add(f); }
  const ears = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.11, 0.13, -0.01); head.add(p);
    const e = mesh(new THREE.ConeGeometry(0.1, 0.32, 14), ear, 1, 1, 0.45); e.position.y = 0.14; p.add(e);
    const ei = mesh(new THREE.ConeGeometry(0.06, 0.22, 12), toon('#d89a9a'), 1, 1, 0.3); ei.position.set(0, 0.12, 0.025); ei.userData.noOutline = true; p.add(ei);
    p.rotation.z = -s * 0.35; return { p, s }; });
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.085, 0.03, 0.15), new THREE.Vector3(s * 0.45, 0.08, 0.89).normalize(), 0.075, lidC));
  // wings: shoulder pivot -> membrane (folded = hangs down along the body, spread = straight out)
  const wg = wingGeo(0.62);
  const wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.15, 0.08, -0.02); bodyG.add(p);
    const m = new THREE.Mesh(wg, skin); m.castShadow = true; m.scale.x = s; p.add(m);
    const bone = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.62, 6).rotateZ(Math.PI / 2).translate(0.31, 0.1, 0), toon(shadeHex(C3, -0.2)), s, 1, 1); p.add(bone);
    return { p, s }; });
  // feet
  for (const s of [-1, 1]) { const f = mesh(sph, skin, 0.04, 0.03, 0.05); f.position.set(s * 0.08, -0.25, 0.02); bodyG.add(f); }
  const bl = blob(0.3, 0.25); root.add(bl);
  // tiny bomb on its back (strapped): olive canister, fins, a little timer face
  let bombG = null;
  if (o.bomb !== false) { bombG = new THREE.Group(); bombG.position.set(0, 0.2, -0.19); bodyG.add(bombG); bombG.scale.setScalar(1.35);
    const can = mesh(new THREE.CapsuleGeometry(0.075, 0.2, 6, 14).rotateX(Math.PI / 2), toon('#5c6a3a')); bombG.add(can);
    const band = mesh(new THREE.CylinderGeometry(0.079, 0.079, 0.03, 16).rotateX(Math.PI / 2), toon('#e0c040')); band.position.z = 0.05; bombG.add(band);
    for (let i = 0; i < 4; i++) { const fg = new THREE.Group(); fg.rotation.z = i * Math.PI / 2; const fin = rbox(0.014, 0.08, 0.08, '#4a5630', 0, 0.07, -0.14, 0.004); fg.add(fin); bombG.add(fg); }
    const dial = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.014, 16), toon('#f4efe0')); dial.position.set(0, 0.075, 0.02); bombG.add(dial);
    const hand = rbox(0.006, 0.004, 0.03, '#c0392b', 0, 0.084, 0.03, 0.002); hand.userData.noOutline = true; bombG.add(hand); bombG.hand = hand;
    for (const sx of [-1, 1]) { const st = rbox(0.03, 0.2, 0.03, '#8a6a3a', sx * 0.08, -0.06, 0.02, 0.01); st.rotation.z = sx * 0.4; bombG.add(st); }
    bombG.rotation.x = -0.15; }
  // medal (payoff)
  let medalG = null;
  if (o.medal) { medalG = new THREE.Group(); medalG.position.set(0, 0.0, 0.2); medalG.scale.setScalar(1.8); bodyG.add(medalG);
    const rib = rbox(0.07, 0.09, 0.012, '#c0392b', 0, 0.05, 0, 0.01); const rib2 = rbox(0.022, 0.09, 0.014, '#f4f0e6', 0, 0.05, 0.002, 0.005); rib2.userData.noOutline = true;
    const disc = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 20).rotateX(Math.PI / 2), toon('#f2c230', { emissive: new THREE.Color('#f2c230'), emissiveIntensity: 0.25 })); disc.position.y = -0.03;
    const star = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.024, 5).rotateX(Math.PI / 2), toon('#fff1a0')); star.position.set(0, -0.03, 0.004); star.userData.noOutline = true;
    medalG.add(rib, rib2, disc, star); }
  outline(g, { px: 2.8 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.1; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { flap = 0, spread = 0, lid = 0.3, lidAngle = 0, look = [0, 0], headTurn = 0, headTilt = 0, puff = 0, blink = true, hang = 0, ph = seed * 0.7, fold = 0 } = u;
    const w = (t * 6 + ph) * Math.PI * 2, fl = clamp(flap);
    wings.forEach(W => { const open = clamp(spread + fl); const base = lerp(-1.35, 0.05, open); const fa = fl * Math.sin(w) * 0.75;
      W.p.rotation.set(0, W.s * lerp(0.9, 0.1, open) * (1 - fold), W.s * (base + fa) * -1); });
    ears.forEach(E2 => { E2.p.rotation.x = Math.sin(t * 2.3 + seed + E2.s) * 0.06; });
    bodyG.position.y = 0.42 + fl * Math.sin(w + 1) * 0.05 + noise(t * 0.9, seed) * 0.012;
    bodyG.scale.set(1 + puff * 0.08, 1 + puff * 0.04, 1 + puff * 0.1); bodyG.rotation.x = -puff * 0.12;
    head.rotation.set(-puff * 0.18 + Math.sin(t * 1.7 + seed) * 0.03, headTurn + noise(t * 0.8, seed + 3) * 0.05, -headTilt);
    g.rotation.z = hang ? Math.PI : 0; g.position.y = hang ? 0.95 * scale : 0; bl.visible = !hang && fl < 0.5;
    const b = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.45, look[0] * 0.55, 0); });
  };
  root.head = head; root.headR = 0.2 * scale; root.bomb = bombG; root.medal = medalG;
  root.update(0); return root;
}

// ---------------------------------------------------------------- PEOPLE
export function officer(o = {}) { return bean({ name: 'General', outfit: 'uniform', head: 'cap', headColor: '#4f5e3a', skin: o.skin || 'fair', hair: 'horseshoe', hairColor: '#8a8580', colors: { main: '#4f5e3a' }, seed: o.seed || 5, ...(o.over || {}) }); }
export function soldier(o = {}) { return bean({ name: 'GI', outfit: 'uniform', head: 'helmet', headColor: '#56633e', skin: o.skin || 'light', hair: 'bowl', colors: { main: '#6a7448' }, seed: o.seed || 9, ...(o.over || {}) }); }
export function clerk(o = {}) { return bean({ name: 'Clerk', outfit: 'uniform', head: 'none', skin: 'fair', hair: 'swoop', hairColor: '#3a2618', glasses: true, colors: { main: '#7a8458' }, seed: o.seed || 13 }); }

// ---------------------------------------------------------------- SETS
// desert airfield, 1943 (generic, stylised): sand, runway, a quonset hangar, control tower, mesas, big sky
export function hangar(o = {}) { const g = new THREE.Group(); const w = o.w || 9, L = o.L || 10, c = o.color || '#9aa29a';
  const half = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, L, 28, 1, true, -Math.PI / 2, Math.PI), toon(c, { side: THREE.DoubleSide })); half.rotation.x = -Math.PI / 2; half.castShadow = half.receiveShadow = true; g.add(half);
  for (let i = 0; i < 6; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(w / 2 + 0.03, 0.05, 6, 28, Math.PI), toon(shadeHex(c, -0.15))); rib.position.z = -L / 2 + i * L / 5; g.add(rib); }
  const front = new THREE.Mesh(new THREE.CircleGeometry(w / 2, 28, 0, Math.PI), toon('#7a7f78')); front.position.z = L / 2 - 0.01; g.add(front);
  const door = rbox(w * 0.5, w * 0.36, 0.1, '#2e2a2c', 0, w * 0.18, L / 2 + 0.02, 0.02); g.add(door);
  const sign = canvasTex(512, 96, (x, W, H) => { x.fillStyle = '#e8e2cc'; x.fillRect(0, 0, W, H); x.fillStyle = '#3a3a2a'; x.font = '900 64px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText(o.label || 'HANGAR 3', W / 2, 72); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.45, w * 0.085), toon('#ffffff', { map: sign })); sg.position.set(0, w * 0.43, L / 2 + 0.03); sg.userData.noOutline = true; g.add(sg);
  outline(g, { px: 2.2 }); g.door = door; g.doorZ = L / 2; g.W = w; return g; }
export function tower() { const g = new THREE.Group(); const legC = '#8a8a7a';
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) g.add(cyl(0.07, 0.09, 6, legC, x, 3, z, 6));
  g.add(rbox(2.3, 1.4, 2.3, '#e6e0cc', 0, 6.7, 0, 0.05), rbox(2.0, 0.6, 2.4, '#9fd0f2', 0, 6.9, 0.01, 0.02), rbox(2.7, 0.2, 2.7, '#5a5a52', 0, 7.5, 0, 0.04));
  outline(g, { px: 2.2 }); return g; }
export function mesa(o = {}) { const g = new THREE.Group(); const c = o.color || '#c98a5a'; const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r || 6, (o.r || 6) * 1.35, o.h || 4, 9), toon(c)); m.position.y = (o.h || 4) / 2; m.scale.z = 0.5; g.add(m); outline(g, { px: 2 }); return g; }
export function airfield(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(200, 200, o.sand || '#e2c48e', 0, -40));
  const rw = floor(8, 120, '#8c8a86', o.runwayX ?? 9, -20); rw.position.y = 0.01; g.add(rw);
  for (let i = 0; i < 12; i++) { const s = floor(0.4, 3, '#f4f0e0', o.runwayX ?? 9, -70 + i * 9); s.position.y = 0.02; g.add(s); }
  const rr = rng(o.seed || 4);
  for (const [x, z, r, h] of [[-40, -90, 14, 9], [25, -110, 18, 7], [70, -80, 10, 6]]) { const m = mesa({ r, h, color: rr() < 0.5 ? '#c98a5a' : '#b97a50' }); m.position.set(x, 0, z); g.add(m); }
  for (let i = 0; i < 10; i++) { const b = ball(0.3 + rr() * 0.3, '#8a9a52', -18 + rr() * 40, 0.2, -4 - rr() * 30, 10); b.scale.y = 0.6; g.add(b); }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// war room: dark green walls, a big map board, a long table, a hanging lamp
export function warRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#6a5440', 0, 0));
  const wall = plane(30, 9, '#4c5a48', 0, 4.5, -4); wall.receiveShadow = true; g.add(wall);
  const wainscot = plane(30, 1.6, '#3a4436', 0, 0.8, -3.98); g.add(wainscot);
  const board = canvasTex(1024, 640, (x, W, H) => { x.fillStyle = '#efe4c6'; x.fillRect(0, 0, W, H); x.strokeStyle = '#c9b88a'; x.lineWidth = 3; for (let i = 1; i < 10; i++) { x.beginPath(); x.moveTo(i * W / 10, 0); x.lineTo(i * W / 10, H); x.stroke(); x.beginPath(); x.moveTo(0, i * H / 10); x.lineTo(W, i * H / 10); x.stroke(); }
    x.fillStyle = '#9fc4dc'; x.fillRect(0, 0, W * 0.55, H); x.fillStyle = '#b6d4e6'; x.fillRect(0, 0, W * 0.55, H * 0.08);
    x.fillStyle = '#d8c48a'; x.beginPath(); x.moveTo(W * 0.62, H * 0.1); x.quadraticCurveTo(W * 0.8, H * 0.3, W * 0.72, H * 0.55); x.quadraticCurveTo(W * 0.68, H * 0.8, W * 0.86, H * 0.92); x.lineTo(W, H); x.lineTo(W, 0); x.closePath(); x.fill();
    x.fillStyle = '#3a3a2a'; x.font = '900 52px "Fredoka", sans-serif'; x.fillText('PACIFIC', W * 0.12, H * 0.5); });
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), toon('#ffffff', { map: board })); bm.position.set(0, 4.2, -3.95); bm.userData.noOutline = true; g.add(bm);
  g.add(rbox(6.7, 0.18, 0.2, '#5a4030', 0, 2.15, -3.9, 0.03), rbox(6.7, 0.18, 0.2, '#5a4030', 0, 6.25, -3.9, 0.03));
  const tb = PR.table({ w: 5.2, d: 1.6, h: 1.0, color: '#6a4a30' }); tb.position.set(0, 0, 0.2); g.add(tb);
  const lamp = new THREE.Group(); lamp.add(cyl(0.02, 0.02, 2.2, '#222', 0, 7.0, 0, 5), cyl(0.15, 0.9, 0.55, '#3a5a3a', 0, 5.75, 0, 18), ball(0.22, '#fff2c4', 0, 5.5, 0, 12)); lamp.position.set(0, 0, 0.2); outline(lamp, { px: 2.2 }); g.add(lamp);
  outline(tb, { px: 2.4 });
  return { group: g, tableY: 1.06, board: bm, update() {} };
}
// cave roost: dark rock walls + rows of sleeping bats hanging from the ceiling bar
export function caveRoost(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(40, 40, '#5a4a44', 0, -5));
  const back = plane(40, 14, '#3e3236', 0, 7, -5); g.add(back);
  const rr = rng(7); for (let i = 0; i < 18; i++) { const b = ball(0.8 + rr() * 1.4, rr() < 0.5 ? '#4a3c40' : '#54444a', -14 + rr() * 28, 1 + rr() * 9, -4.6, 12); b.scale.z = 0.4; g.add(b); }
  outline(g, { px: 2 });
  return { group: g, update() {} };
}

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text: lines near the top (below the Shorts top bar)
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * 108); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 66, { color: (o.colors && o.colors[i]) || (i === (o.gold ?? 1) ? '#ffd25a' : '#ffffff'), stroke: CARD_INK, maxW: E.W * 0.9 }); g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = o.a ?? 0.95;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, text.length * s * 0.62 + s * 0.6, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.9 });
  g.restore();
}
// manila folder card (2D), title on a tab, optional stamp
export function folder(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.35)); if (k <= 0) return; const W = 720, H = 900;
  g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.45); g.scale(k, k); g.rotate(o.rot ?? -0.03);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.roundRect(-W / 2 + 16, -H / 2 + 22, W, H, 22); g.fill();
  g.fillStyle = '#d9b874'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-W / 2, -H / 2 - 70, 300, 110, 18); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 22); g.fill(); g.stroke();
  insT(g, o.tab || 'TOP SECRET', -W / 2 + 150, -H / 2 - 22, 40, { color: '#5a3a1a', stroke: null, maxW: 280 });
  g.fillStyle = '#f6f0dc'; g.beginPath(); g.roundRect(-W / 2 + 60, -H / 2 + 60, W - 120, H - 120, 10); g.fill();
  insT(g, o.title || 'PROJECT X-RAY', 0, -H / 2 + 150, 74, { color: CARD_INK, stroke: null, maxW: W - 160 });
  if (o.icon) o.icon(g, 0, -40);
  (o.lines || []).forEach((l, i) => insT(g, l, 0, 220 + i * 70, 44, { color: '#5a4a3a', stroke: null, maxW: W - 160 }));
  g.restore();
}
// flat bat icon (folder photo, blueprint, medal card)
export function drawBatIcon(g, x, y, r, o = {}) {
  g.save(); g.translate(x, y); const ink = o.ink || CARD_INK; g.lineJoin = 'round'; g.lineWidth = Math.max(2, r * 0.06); g.strokeStyle = ink;
  g.fillStyle = o.wing || '#4a3a40'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.25, -r * 0.1); g.quadraticCurveTo(s * r * 0.9, -r * 0.55, s * r * 1.45, -r * 0.2);
    for (let i = 0; i < 3; i++) { const x0 = s * r * (1.45 - i * 0.4), x1 = s * r * (1.45 - (i + 1) * 0.4); g.quadraticCurveTo((x0 + x1) / 2, r * 0.05, x1, -r * 0.05 + (i === 2 ? r * 0.15 : 0)); } g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = o.body || '#7a5a48'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.12, -r * 0.4); g.lineTo(s * r * 0.34, -r * 0.95); g.lineTo(s * r * 0.36, -r * 0.3); g.closePath(); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(0, 0, r * 0.38, r * 0.45, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#fff'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.14, -r * 0.12, r * 0.1, r * 0.12, 0, 0, 7); g.fill(); }
  g.fillStyle = '#120c10'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.14, -r * 0.1, r * 0.05, r * 0.06, 0, 0, 7); g.fill(); }
  if (o.bomb !== false) { g.fillStyle = '#5c6a3a'; g.beginPath(); g.roundRect(-r * 0.18, r * 0.22, r * 0.36, r * 0.5, r * 0.15); g.fill(); g.stroke(); }
  g.restore();
}
// chalk-blueprint "the plan": bat -> roof -> attic -> spark (diagram only, no city, no people)
export function planBoard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k);
  const W = 920, H = 1000; g.fillStyle = '#1f4f86'; g.strokeStyle = '#f2f0e6'; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(-W / 2 + i * W / 12, -H / 2); g.lineTo(-W / 2 + i * W / 12, H / 2); g.stroke(); g.beginPath(); g.moveTo(-W / 2, -H / 2 + i * H / 12); g.lineTo(W / 2, -H / 2 + i * H / 12); g.stroke(); }
  insT(g, o.title || 'THE PLAN', 0, -H / 2 + 80, 66, { color: '#ffffff', stroke: null });
  const chalk = (pts, a = 1) => { g.save(); g.globalAlpha = a; g.strokeStyle = '#f2f0e6'; g.lineWidth = 9; g.lineCap = g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); };
  // step 1: a bat glides down (dashed path)
  const p1 = clamp((t - 0.2) / 0.8), p2 = clamp((t - (o.attic ?? 1.0)) / 0.5), p3 = clamp((t - (o.ignite ?? 1.8)) / 0.3);
  g.save(); g.setLineDash([24, 20]); g.strokeStyle = '#ffd25a'; g.lineWidth = 8; g.beginPath(); g.moveTo(-330, -300); g.quadraticCurveTo(-150, -320, -40 * p1 - 60 * (1 - p1) + 0, -300 + 330 * p1); g.stroke(); g.restore();
  const bx = lerp(-330, -40, ease.inOut(p1)), by = lerp(-300, 20, ease.inOut(p1)); drawBatIcon(g, bx, by, 62, { ink: '#f2f0e6' });
  // the house outline (no people): roof + attic window
  chalk([[-260, 360], [-260, 160], [0, -20], [260, 160], [260, 360], [-260, 360]]); chalk([[-60, 140], [60, 140], [60, 220], [-60, 220], [-60, 140]]);
  insT(g, 'ATTIC', 170, 70, 44, { color: '#ffd25a', stroke: null, a: p2 });
  // step 3: a spark at the timer (a cartoon spark, not an explosion)
  if (p3 > 0) { g.save(); g.translate(0, 180); const s = ease.outBack(p3) * (1 + 0.1 * Math.sin(t * 20)); g.scale(s, s); g.fillStyle = '#ffb030'; g.strokeStyle = '#fff3c0'; g.lineWidth = 6; g.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr2 = i % 2 ? 40 : 95; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
  insT(g, o.foot || 'TIMER: DAWN', 0, H / 2 - 70, 50, { color: '#ffffff', stroke: null, a: p3 });
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, fire, smoke, embers, canvasTex };
