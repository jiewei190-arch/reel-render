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
  return { eg, pg, lp, roll, p };
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
  root.head = head; root.eyes = eyes; root.headR = 0.24;   // used by react.js (FX anchored over the head / eyes)
  root.update(0); return root;
}
function shadeC(hex, k) { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); }
