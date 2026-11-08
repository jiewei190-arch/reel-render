// kits/toon3d/animals.js — toon animals that share the bean style (outline, toon ramp, big lidded eyes).
//   import { emu } from '/kits/toon3d/animals.js';
//   const e = emu({ general: true }); stage.add(e);   every frame: e.update(t, { run: 1, lid: 0.5, look: [0, 0] })
// Facing +Z like the beans. Animals are comic: they run, peck, strut and look smug. They are never shown hurt.
import { THREE, toon, flat, outline, ball, cyl, blob, INK } from './toon.js';
import { rng, noise, clamp, lerp } from '/engine/core.js';

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

// emu({ seed, scale, general: bool (tiny peaked cap + medal), body, neck }) — ~2.4 units tall (head), same scale as a bean
export function emu(o = {}) {
  const { seed = 1, scale = 1, general = false, body: bodyC = '#5b4535', neck: neckC = '#7d8ea6', legC = '#5f6670' } = o; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const bodyG = new THREE.Group(); bodyG.position.y = 1.32; g.add(bodyG);
  const bm = toon(bodyC), bm2 = toon(shadeC(bodyC, 0.1)), bm3 = toon(shadeC(bodyC, -0.12));
  const b = new THREE.Mesh(sph, bm); b.scale.set(0.5, 0.46, 0.66); b.castShadow = true; bodyG.add(b);
  // shaggy feather tufts around the back/bottom
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const t = new THREE.Mesh(sph, i % 2 ? bm2 : bm3); t.scale.set(0.22, 0.2, 0.26); t.position.set(Math.cos(a) * 0.36, -0.16 - Math.abs(Math.sin(a)) * 0.08 + r() * 0.05, Math.sin(a) * 0.5 - 0.06); t.castShadow = true; bodyG.add(t); }
  const tail = new THREE.Mesh(sph, bm3); tail.scale.set(0.3, 0.26, 0.24); tail.position.set(0, 0.0, -0.66); tail.castShadow = true; bodyG.add(tail);
  // neck: a chain of balls from the chest up to the head
  const nm = toon(neckC); const neck = [];
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(sph, i < 2 ? bm : nm); s.scale.setScalar(0.12 - i * 0.006); s.castShadow = true; bodyG.add(s); neck.push(s); }
  const head = new THREE.Group(); bodyG.add(head);
  const hs = new THREE.Mesh(sph, nm); hs.scale.set(0.21, 0.2, 0.25); hs.castShadow = true; head.add(hs);
  const crown = new THREE.Mesh(sph, bm3); crown.scale.set(0.12, 0.08, 0.14); crown.position.set(0, 0.14, -0.05); head.add(crown);
  const beak = new THREE.Mesh(sph, toon('#3a3434')); beak.scale.set(0.08, 0.045, 0.16); beak.position.set(0, -0.04, 0.25); beak.castShadow = true; head.add(beak);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.12, 0.05, 0.15), new THREE.Vector3(s * 0.6, 0.15, 0.78).normalize(), 0.11, { lid: shadeC(neckC, -0.05) }));
  if (general) {
    const capM = toon('#4f5e3a'); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.08, 20), capM); top.position.set(0, 0.21, -0.01); top.rotation.x = -0.15; head.add(top);
    const vis = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 16, 1, false, -1.1, 2.2), toon('#1e1a18')); vis.position.set(0, 0.175, 0.1); head.add(vis);
    const badge = new THREE.Mesh(sph, toon('#d8b04a')); badge.scale.setScalar(0.025); badge.position.set(0, 0.22, 0.15); head.add(badge);
    const medal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), toon('#d8b04a')); medal.rotation.x = Math.PI / 2; medal.position.set(0.12, 0.12, 0.6); bodyG.add(medal);
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), toon('#c0392b')); rib.position.set(0.12, 0.21, 0.6); bodyG.add(rib);
  }
  // legs: hip (in the feathers) -> knee-ankle (bends backward) -> three-toed foot
  const lm = toon(legC); const legs = [-1, 1].map(s => {
    const hip = new THREE.Group(); hip.position.set(s * 0.17, 1.12, 0.02); g.add(hip);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.6, 10).translate(0, -0.3, 0), lm); up.castShadow = true; hip.add(up);
    const ank = new THREE.Group(); ank.position.y = -0.6; hip.add(ank); const aj = new THREE.Mesh(sph, lm); aj.scale.setScalar(0.06); aj.userData.noOutline = true; ank.add(aj);
    const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.5, 10).translate(0, -0.25, 0), lm); lo.castShadow = true; ank.add(lo);
    const foot = new THREE.Group(); foot.position.y = -0.5; ank.add(foot);
    for (const a of [-0.45, 0, 0.45]) { const toe = new THREE.Mesh(sph, lm); toe.scale.set(0.03, 0.025, 0.11); toe.position.set(Math.sin(a) * 0.08, -0.01, Math.cos(a) * 0.08); toe.rotation.y = a; toe.castShadow = true; foot.add(toe); }
    return { hip, ank, foot, s };
  });
  root.add(blob(0.6, 0.28));
  outline(g, { px: 2.8 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.7; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { run = 0, peck = 0, lid = 0.35, look = [0, 0], blink = true, lidAngle = 0, headTurn = 0, neckLean = 0, ph = seed * 0.7 } = u;
    const sp = 2.6, w = (t * sp + ph) * Math.PI * 2, rr = clamp(run);
    // legs: idle stance blends into a running cycle
    legs.forEach(L => { const s = Math.sin(w + (L.s > 0 ? 0 : Math.PI)); const c = Math.cos(w + (L.s > 0 ? 0 : Math.PI));
      L.hip.rotation.x = lerp(-0.35, -0.35 - s * 0.75, rr); L.ank.rotation.x = lerp(0.75, 0.75 + Math.max(0, c) * 0.9, rr); L.foot.rotation.x = -(L.hip.rotation.x + L.ank.rotation.x); });
    const bob = rr * Math.abs(Math.sin(w)) * 0.09; bodyG.position.y = 1.32 + bob - rr * 0.05; bodyG.rotation.x = rr * 0.18 + noise(t * 0.7, seed) * 0.03;
    // neck curve: S-shape up; leans forward when running, dips when pecking
    const pk = peck * Math.max(0, Math.sin(t * 3.2 + seed)) ** 2;
    const lean = 0.3 + rr * 0.45 + neckLean + pk * 1.4;
    for (let i = 0; i < neck.length; i++) { const k = i / (neck.length - 1); const ang = lerp(0.25, -0.1, k) + lean * k; neck[i].position.set(0, 0.22 + k * 0.78 * Math.cos(lean * 0.9 * k) - pk * k * 0.9, 0.42 + k * 0.18 + Math.sin(ang) * 0.5 * k + pk * k * 0.25); }
    const top = neck[neck.length - 1].position; head.position.set(0, top.y + 0.1, top.z + 0.04); head.rotation.set(pk * 1.2 + rr * 0.2 - 0.05, headTurn + Math.sin(t * 2.3 + seed) * 0.05 * (1 - rr), 0);
    const bl = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
  };
  root.update(0); return root;
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
  root.paw = paw; root.parts = { head, upper, body, arm, leg };
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
