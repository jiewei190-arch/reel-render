// kits/toon3d/cast.js — the I.Awaken main cast as Toon 3D beans (IAWAKEN_PLAYBOOK.md, "CAST REDESIGN").
// Each keeps its signature item and has its own head shape, skin tone and hair so they read apart in silhouette.
//
//   import { castMember, CAST3D, cat } from '/kits/toon3d/cast.js';
//   const hero = castMember('hero');               // or castMember('hero', { hood: 'up' })
//   const dev = castMember('dev');  dev.prop      // DEV's phone (already in his right hand)
//   const biscuit = cat();  biscuit.update(t, { lid: 0.6, look: [0.3, 0], tail: 1 })
import { THREE, toon, flat, outline, rbox, cyl, ball, blob, INK } from './toon.js';
import { bean, shadeHex, EXPR } from './rig.js';

export const MUSTARD = '#d9a21b';
// presets: plain bean() options. hood: 'up' | 'down' is handled by castMember for the HERO.
export const CAST3D = {
  // HERO ("you"): mustard hoodie (hood often up), round head, messy brown hair, olive skin. Curious, big reactions.
  hero: { name: 'Hero', outfit: 'hoodie', colors: { main: MUSTARD, legsTop: '#2e3a52' }, skin: 'olive', hair: 'messy', hairColor: '#5a3a22', headScale: [1, 1, 1], seed: 101 },
  // DEV (best friend): orange beanie, always filming on his phone. Wide head, dark skin, teal tee.
  dev: { name: 'Dev', outfit: 'tee', colors: { main: '#2f8a7a', legsTop: '#c2a878', print: '#f2ead6' }, skin: 'dark', hair: 'bald', head: 'beanie', headColor: '#e8712a', headScale: [1.1, 0.93, 1.02], seed: 102 },
  // MINA (little sister): smaller, bigger head ratio, red scarf, stopwatch. Pigtails, light-blue jumper. Smart, deadpan.
  mina: { name: 'Mina', outfit: 'tee', colors: { main: '#7fb2e0', legsTop: '#3a3550' }, skin: 'olive', hair: 'pigtails', hairColor: '#4a2c1a', tieColor: '#d63a3a', scarf: '#d63a3a', scale: 0.78, headScale: [1.14, 1.14, 1.14], seed: 103 },
  // DR LIN (scientist): lab coat, green lanyard, glasses, black bob, tall egg head. Explains, slightly tired.
  lin: { name: 'Dr Lin', outfit: 'labcoat', colors: { main: '#f4f2ec', lanyard: '#3aa05a', shirt: '#7aa0c8', legsTop: '#3a3f4a' }, skin: 'light', hair: 'bob', hairColor: '#1e1a20', glasses: true, headScale: [0.93, 1.1, 0.97], seed: 104 },
  // TOMAS: blue cap, the normal guy, skeptical. Squarish wide head, tan skin, grey tee.
  tomas: { name: 'Tomas', outfit: 'tee', colors: { main: '#8a8f98', legsTop: '#33405a' }, skin: 'tan', hair: 'bowl', hairColor: '#2a1c14', head: 'ballcap', headColor: '#2f6fc0', headScale: [1.08, 0.97, 1.0], seed: 105 },
  // ROMAN HERO for history episodes: mustard tunic (civilian) ...
  heroRoman: { name: 'Hero (Roman)', outfit: 'tunic', colors: { main: MUSTARD, belt: '#5a3a22', trim: '#c9a14a' }, skin: 'olive', hair: 'messy', hairColor: '#5a3a22', seed: 101 },
  // ... and as a legionary on guard duty: armour over a mustard tunic, mustard crest.
  heroLegionary: { name: 'Hero (legionary)', outfit: 'armour', colors: { main: MUSTARD }, crestColor: MUSTARD, head: 'helmet', skin: 'olive', hair: 'bald', seed: 101 },
};
export const CAST_IDS = Object.keys(CAST3D);

// small held props
export function phone() { const g = new THREE.Group(); const b = rbox(0.16, 0.3, 0.035, '#22242c', 0, 0, 0, 0.02); g.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.25), flat('#7fd0ff')); sc.position.z = -0.019; sc.rotation.y = Math.PI; sc.userData.noOutline = true; g.add(sc); const lens = ball(0.018, '#0e0e12', 0.04, 0.1, 0.02, 8); g.add(lens); outline(g, { px: 2.2 }); return g; }
export function stopwatch() { const g = new THREE.Group(); const body = cyl(0.13, 0.13, 0.05, '#c9c4bc', 0, 0, 0, 24); body.rotation.x = Math.PI / 2; g.add(body); const face = new THREE.Mesh(new THREE.CircleGeometry(0.105, 24), flat('#fbf8f2')); face.position.z = 0.027; face.userData.noOutline = true; g.add(face); const hand = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.09), flat('#d63a3a')); hand.position.set(0, 0.04, 0.03); hand.userData.noOutline = true; g.add(hand); g.add(cyl(0.025, 0.025, 0.06, '#a8a29a', 0, 0.16, 0, 10)); g.add(ball(0.03, '#a8a29a', 0, 0.2, 0, 8)); outline(g, { px: 2.2 }); g.tick = (t) => { hand.rotation.z = -t * Math.PI * 2; hand.position.set(Math.sin(t * Math.PI * 2) * 0.04, Math.cos(t * Math.PI * 2) * 0.04, 0.03); }; return g; }

// castMember(id, { hood: 'up'|'down', prop: true, ...bean overrides }) -> bean with its signature prop in hand (.prop)
export function castMember(id, o = {}) {
  const base = CAST3D[id]; if (!base) throw new Error(`unknown cast id ${id}`);
  const opts = { ...base, ...o, colors: { ...(base.colors || {}), ...(o.colors || {}) } };
  if (id === 'hero') { const up = (o.hood || 'up') === 'up'; if (up) { opts.head = 'hood'; opts.headColor = MUSTARD; } else opts.hoodDown = true; }
  const b = bean(opts);
  if (o.prop !== false) {
    if (id === 'dev') { const p = phone(); p.position.set(0, -0.12, 0.06); p.rotation.x = -1.2; b.hold('R', p); b.prop = p; }
    if (id === 'mina') { const p = stopwatch(); p.position.set(0, -0.1, 0.06); p.rotation.x = -1.3; b.hold('R', p); b.prop = p; }
  }
  b.castId = id; return b;
}

// BISCUIT, the cat: same toon style. Sitting egg body, triangle ears, purple collar with a gold tag, green eyes with slit pupils
// and heavy lids (judgemental by default). .update(t, { lid, look:[x,y], tail, earsBack, blink })
export function cat(o = {}) {
  const { fur = '#e0954a', belly = '#f6e2c4', collar = '#7a3aa8', eye = '#7ad04a', scale = 1, seed = 7 } = o;
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const F = toon(fur), B = toon(belly);
  const body = ball(0.42, F, 0, 0.42, 0, 28); body.scale.set(0.95, 1.05, 0.9); g.add(body);
  const bel = ball(0.3, B, 0, 0.38, 0.17, 20); bel.scale.set(0.8, 1.0, 0.6); g.add(bel);
  for (const s of [-1, 1]) { const paw = ball(0.11, B, s * 0.17, 0.07, 0.3, 14); paw.scale.set(1, 0.7, 1.3); g.add(paw); const hip = ball(0.2, F, s * 0.3, 0.2, -0.05, 16); hip.scale.set(0.7, 0.8, 1.2); g.add(hip); }
  // tail: a chain of balls along a curve, animated
  const tail = []; for (let i = 0; i < 9; i++) { const tb = ball(0.075 - i * 0.003, i > 6 ? shadeHex(fur, -0.25) : fur, 0, 0, 0, 10); g.add(tb); tail.push(tb); }
  const head = new THREE.Group(); head.position.set(0, 0.98, 0.05); g.add(head);
  const sk = ball(0.36, F, 0, 0, 0, 28); sk.scale.set(1.12, 0.92, 0.95); head.add(sk);
  const muz = ball(0.15, B, 0, -0.12, 0.27, 16); muz.scale.set(1.3, 0.8, 0.8); head.add(muz);
  const nose = ball(0.04, '#d86a7a', 0, -0.06, 0.38, 10); nose.scale.set(1.3, 0.8, 0.8); head.add(nose);
  const ears = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 4), F); e.position.set(s * 0.25, 0.3, -0.02); e.rotation.set(0, Math.PI / 4, s * -0.35); e.castShadow = true; head.add(e); const inn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), toon('#f2b0a8')); inn.position.set(0, -0.03, 0.06); inn.userData.noOutline = true; e.add(inn); return e; });
  const eyeM = toon('#e8f6c8', { emissive: new THREE.Color(eye), emissiveIntensity: 0.25 }); const irisM = flat(eye); const slitM = flat('#141014'); const lidM = toon(shadeHex(fur, -0.05));
  const lidGeo = new THREE.SphereGeometry(1.1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const eyes = [-1, 1].map(s => { const eg = new THREE.Group(); const n = new THREE.Vector3(s * 0.42, 0.12, 0.9).normalize(); eg.position.copy(n).multiplyScalar(0.3); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(0.1, 0.11, 0.06); head.add(eg);
    const w = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), eyeM); eg.add(w);
    const pg = new THREE.Group(); eg.add(pg); const ir = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), irisM); ir.scale.set(0.7, 0.75, 0.2); ir.position.z = 0.88; ir.userData.noOutline = true; pg.add(ir);
    const sl = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), slitM); sl.scale.set(0.12, 0.6, 0.2); sl.position.z = 0.93; sl.userData.noOutline = true; pg.add(sl);
    const lr = new THREE.Group(); lr.rotation.z = s * 0.18; eg.add(lr); const lp = new THREE.Group(); lr.add(lp); const lid = new THREE.Mesh(lidGeo, lidM); lid.userData.noOutline = true; lp.add(lid);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
    return { pg, lp, sl }; });
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.32, 4), flat('#3a2a26')); wh.rotation.z = Math.PI / 2 + s * (0.08 - k * 0.16); wh.position.set(s * 0.28, -0.12 - k * 0.04, 0.3); wh.userData.noOutline = true; head.add(wh); }
  const col = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.05, 8, 28), toon(collar)); col.rotation.x = Math.PI / 2; col.position.set(0, 0.76, 0.03); g.add(col);
  const tagM = ball(0.05, '#e0b84a', 0, 0.7, 0.3, 12); tagM.scale.z = 0.4; g.add(tagM);
  g.add(blob(0.5, 0.3)); outline(g, { px: 2.8 });
  root.update = (t, u = {}) => {
    const { lid = 0.55, look = [0, 0], tail: wag = 0.6, earsBack = 0, blink = true, headTilt = 0, headTurn = 0 } = u;
    for (let i = 0; i < tail.length; i++) { const k = i / (tail.length - 1); const sw = Math.sin(t * 2.2 - k * 2.2) * 0.35 * wag * k; tail[i].position.set(0.3 + k * 0.25 + Math.sin(sw) * 0.2, 0.12 + Math.sin(k * Math.PI * 0.9) * 0.55 * k + k * 0.15, -0.38 - k * 0.12 + sw * 0.4); }
    const bl = blink ? (((t + seed) % 4.1) < 0.14 ? Math.sin((((t + seed) % 4.1) / 0.14) * Math.PI) : 0) : 0;
    eyes.forEach(e => { e.lp.rotation.x = -1.05 + (1.5708 + 1.05) * Math.max(lid, bl); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    ears.forEach((e, i) => { e.rotation.x = -earsBack * 0.6; });
    head.rotation.set(0, headTurn, -headTilt);
  };
  root.update(0); return root;
}
