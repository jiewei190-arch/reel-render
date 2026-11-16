// Poyais, the country that didn't exist: shared assets. EMOTION: WTF. Deadpan narrator.
// TONE GUARD: the settlers' suffering is never shown or joked about. No one is shown sick, hurt or dead; the "it went very
// badly" beat is an empty, rainy jungle beach with no people, a sombre colour and no comic SFX. Comedy only lands on the con
// and on MacGregor himself. Every character is an original toon (MacGregor is a generic gaudy-uniform bean, not a likeness).
import { E, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage, blob } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export * from './_jc.js';
export { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, toonStage, PR, rng, clamp, lerp, ease, prog, sunnySky, blob };

const sph = new THREE.SphereGeometry(1, 24, 16);
const mesh = (mat, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(sph, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };

// ---------------------------------------------------------------- PEOPLE
// MacGregor: a gaudy self-made "ruler": red coat, gold sash, bicorne hat with a plume, big moustache. Smug.
export function macgregor(o = {}) {
  const b = bean({ name: 'MacGregor', outfit: 'uniform', colors: { main: '#b8282a', trim: '#e8c25a', belt: '#e8c25a' }, skin: 'light', hair: 'swoop', hairColor: '#7a3a1e', moustache: '#7a3a1e', seed: o.seed || 71, scale: o.scale || 1 });
  const h = b.parts.head; const R = 0.48;
  const hat = new THREE.Group(); const sh = new THREE.Shape(); sh.absarc(0, 0, R * 1.35, 0, Math.PI, false); sh.lineTo(R * 1.35, 0);
  const bic = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.22, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 28 }), toon('#1e1b24')); bic.scale.set(1, 0.62, 1); bic.position.set(0, -0.02, -0.11); bic.castShadow = true; hat.add(bic);
  hat.add(cyl(R * 0.9, R * 0.95, 0.16, '#1e1b24', 0, 0.02, 0, 24)); const cockade = cyl(0.1, 0.1, 0.03, '#3a6ac0', 0, 0.3, 0.14, 14); cockade.rotation.x = Math.PI / 2; hat.add(cockade); hat.add(ball(0.05, '#e8c25a', 0, 0.3, 0.16, 10));
  const plume = new THREE.Mesh(sph, toon('#f4f0e8')); plume.scale.set(0.1, 0.26, 0.1); plume.position.set(0.12, 0.66, 0.0); plume.rotation.z = -0.5; hat.add(plume);
  hat.position.set(0, R * 0.78, -0.02); h.add(hat); outline(hat, { px: 2.6 });
  // sash + medals + epaulettes
  const up = b.parts.upper; const sash = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 6, 24), toon('#3a6ac0')); sash.position.set(0, 0.42, 0.02); sash.rotation.set(0.1, 0, 0.7); sash.scale.set(1, 1.2, 0.95); up.add(sash);
  for (let i = 0; i < 3; i++) up.add(cyl(0.05, 0.05, 0.02, '#e8c25a', -0.17 + i * 0.09, 0.62, 0.37, 12).rotateX(Math.PI / 2));
  for (const s of [-1, 1]) { const ep = mesh(toon('#e8c25a'), 0.16, 0.06, 0.15, s * 0.3, 0.83, 0); up.add(ep); }
  b.hat = hat; return b;
}
export function investor(o = {}) { // Regency gentleman / lady investor: top hat or bonnet
  const r = rng(o.seed || 81); const lady = !!o.lady;
  const b = bean({ name: 'Investor', outfit: lady ? 'robe' : 'uniform', colors: { main: o.main || ['#3a4a6a', '#5a3a2a', '#2a4a3a', '#6a3a5a'][Math.floor(r() * 4)], trim: '#f2ede2', belt: '#2a2a30' },
    skin: o.skin || ['fair', 'light', 'tan'][Math.floor(r() * 3)], hair: lady ? 'bun' : 'bowl', hairColor: o.hairColor || ['#3a2416', '#6a4a2a', '#2a1a14', '#9a8a7a'][Math.floor(r() * 4)], moustache: !lady && r() > 0.5 ? '#3a2416' : false, seed: o.seed || 81, scale: o.scale || 1 });
  if (!lady) { const th = new THREE.Group(); th.add(cyl(0.34, 0.36, 0.55, '#1e1b24', 0, 0.3, 0, 22)); th.add(cyl(0.55, 0.55, 0.04, '#1e1b24', 0, 0.03, 0, 26)); th.add(cyl(0.365, 0.365, 0.08, '#6a2a2a', 0, 0.1, 0, 22)); th.position.set(0, 0.38, -0.02); th.rotation.x = -0.08; b.parts.head.add(th); outline(th, { px: 2.6 }); }
  else { const bn = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, 1.3), toon('#c98a5a')); bn.rotation.x = -0.6; bn.position.set(0, 0.08, -0.06); b.parts.head.add(bn); outline(bn, { px: 2.6 }); }
  return b;
}
export function settler(o = {}) { // hopeful emigrant: plain clothes, a bundle; shown only arriving (never suffering)
  const b = bean({ name: 'Settler', outfit: 'tee', colors: { main: o.main || '#8a6a4a', trim: '#e8dcc0' }, skin: o.skin || 'light', hair: o.hair || 'messy', hairColor: o.hairColor || '#6a4a2a', head: o.head || 'none', seed: o.seed || 91, scale: o.scale || 1 });
  return b;
}
export function judge(o = {}) {    // French judge: black robe, red sash, round toque
  const b = bean({ name: 'Judge', outfit: 'robe', colors: { main: '#1e1b24', trim: '#c8281e' }, skin: o.skin || 'light', hair: 'horseshoe', hairColor: '#cfcac2', moustache: '#cfcac2', seed: o.seed || 95 });
  const tq = new THREE.Group(); tq.add(cyl(0.4, 0.42, 0.32, '#1e1b24', 0, 0.16, 0, 22)); tq.add(cyl(0.43, 0.43, 0.05, '#d4a73a', 0, 0.05, 0, 22)); tq.position.set(0, 0.38, -0.02); b.parts.head.add(tq); outline(tq, { px: 2.6 });
  return b;
}
// ---------------------------------------------------------------- PROPS
export function banknote(seed = 1) { // a fake "POYAIS" note (thin box with a canvas texture)
  const t = canvasTex(256, 128, (g, W, H) => { g.fillStyle = '#d8e8c8'; g.fillRect(0, 0, W, H); g.strokeStyle = '#2a5a3a'; g.lineWidth = 8; g.strokeRect(6, 6, W - 12, H - 12); g.fillStyle = '#2a5a3a'; g.font = '900 34px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('POYAIS', W / 2, H / 2 - 16); g.font = '900 26px Nunito, sans-serif'; g.fillText('ONE DOLLAR', W / 2, H / 2 + 24); g.beginPath(); g.arc(36, H / 2, 20, 0, 7); g.stroke(); g.beginPath(); g.arc(W - 36, H / 2, 20, 0, 7); g.stroke(); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.008, 0.3), toon('#ffffff', { map: t })); m.castShadow = true; return m;
}
export function moneyRain(st, n = 40, o = {}) {
  const r = rng(o.seed || 3); const notes = []; for (let i = 0; i < n; i++) { const m = banknote(i); m.userData = { x: (r() - 0.5) * (o.w || 10), z: (r() - 0.5) * (o.d || 6) + (o.z || 0), y0: r() * 8, sp: 0.8 + r() * 0.8, rx: r() * 6, rz: r() * 6 }; st.add(m); notes.push(m); }
  return { notes, update(t) { notes.forEach(m => { const u = m.userData; const y = ((u.y0 - t * u.sp) % 8 + 8) % 8; m.position.set(u.x + Math.sin(t * 2 + u.rx) * 0.4, y + (o.y || 0), u.z); m.rotation.set(Math.sin(t * 3 + u.rx) * 0.8, t + u.rz, Math.cos(t * 2.5 + u.rz) * 0.6); }); } };
}
export function coin() { const c = cyl(0.16, 0.16, 0.04, '#e8c25a', 0, 0, 0, 18); return c; }
export function podium() { const g = new THREE.Group(); g.add(rbox(1.3, 1.25, 0.8, '#7a4c2c', 0, 0.62, 0, 0.05)); g.add(rbox(1.5, 0.12, 0.95, '#5a3820', 0, 1.27, 0, 0.03)); outline(g, { px: 2.4 }); return g; }
export function easelMap(o = {}) { // a framed map of "POYAIS" on an easel (canvas texture)
  const t = canvasTex(512, 384, (g, W, H) => { g.fillStyle = '#8fc4e0'; g.fillRect(0, 0, W, H); g.fillStyle = '#a8d070'; g.strokeStyle = '#2a1c15'; g.lineWidth = 6; g.beginPath();
    const pts = [[80, 120], [190, 70], [330, 90], [420, 160], [400, 270], [300, 320], [160, 300], [70, 230]]; pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#c8281e'; g.beginPath(); g.arc(250, 190, 12, 0, 7); g.fill(); g.fillStyle = '#2a1c15'; g.font = '900 54px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('POYAIS', 250, 255);
    g.font = '700 26px Nunito, sans-serif'; g.fillText('capital: St Joseph', 250, 290); g.strokeStyle = '#d4a73a'; g.lineWidth = 18; g.strokeRect(9, 9, W - 18, H - 18); });
  const g = new THREE.Group(); const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.06), [toon('#d4a73a'), toon('#d4a73a'), toon('#d4a73a'), toon('#d4a73a'), toon('#ffffff', { map: t }), toon('#d4a73a')]); board.position.y = 2.3; board.rotation.x = -0.08; board.castShadow = true; g.add(board);
  for (const s of [-1, 1]) { const leg = cyl(0.05, 0.05, 3.0, '#6a4228', s * 0.8, 1.4, 0.15, 8); leg.rotation.z = s * 0.12; g.add(leg); } const back = cyl(0.05, 0.05, 2.8, '#6a4228', 0, 1.35, -0.5, 8); back.rotation.x = -0.25; g.add(back);
  outline(g, { px: 2.4 }); return g;
}
export function ship(o = {}) {    // a small toon sailing ship (two masts), +Z is starboard; bow points -X
  const g = new THREE.Group(); const hullM = toon('#6a4228'), hullD = toon('#4a2e18');
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.75, 6.4, 20, 1, false, 0, Math.PI), hullM); hull.rotation.set(0, 0, Math.PI / 2); hull.rotation.x = Math.PI; hull.scale.set(1, 1, 0.75); hull.position.y = 0.95; hull.castShadow = true; g.add(hull);
  const deck = box(6.2, 0.12, 1.45, '#b88a5a', 0, 0.95, 0); g.add(deck); const stripe = box(6.3, 0.18, 1.52, '#e8c25a', 0, 0.75, 0); g.add(stripe);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.6, 16, 1, false, 0, Math.PI), hullM); bow.rotation.set(0, 0, Math.PI / 2); bow.position.set(-3.9, 0.62, 0); bow.scale.set(1, 1, 0.98); g.add(bow);
  const masts = []; for (const x of [-1.2, 1.4]) { const m = cyl(0.08, 0.1, 5.2, '#5a3820', x, 3.5, 0, 10); g.add(m);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.4, 6, 4), toon('#f4ecd6', { side: THREE.DoubleSide })); sail.position.set(x, 3.6, 0.1); sail.rotation.y = Math.PI / 2; g.add(sail); masts.push(sail);
    g.add(cyl(0.04, 0.04, 2.4, '#5a3820', x, 4.85, 0, 6).rotateX(Math.PI / 2)); }
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), toon('#3a6ac0', { side: THREE.DoubleSide })); flag.position.set(1.8, 6.0, 0); flag.rotation.y = Math.PI / 2; g.add(flag);
  outline(g, { px: 2.4 }); g.sails = masts; g.flag = flag;
  g.update = (t) => { g.position.y = Math.sin(t * 1.6) * 0.12; g.rotation.x = Math.sin(t * 1.3) * 0.04; g.rotation.z = Math.sin(t * 1.1) * 0.02; masts.forEach((s, i) => { s.scale.z = 1; s.position.z = 0.1 + Math.sin(t * 2 + i) * 0.05; }); flag.rotation.x = Math.sin(t * 6) * 0.2; };
  return g;
}
export function palm(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 1); const h = o.h || 5 + r() * 2; const lean = (r() - 0.5) * 0.4;
  for (let i = 0; i < 8; i++) { const seg = cyl(0.2 - i * 0.01, 0.23 - i * 0.01, h / 8 + 0.05, i % 2 ? '#8a6a3a' : '#7a5a32', Math.sin(lean) * i * h / 8, i * h / 8 + h / 16, 0, 10); g.add(seg); }
  const top = new THREE.Group(); top.position.set(Math.sin(lean) * h, h, 0); g.add(top);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; const leaf = new THREE.Mesh(sph, toon(i % 2 ? '#3a8a3a' : '#2f7a34')); leaf.scale.set(0.35, 0.08, 1.6); leaf.position.set(Math.sin(a) * 1.2, -0.25, Math.cos(a) * 1.2); leaf.rotation.y = a; leaf.rotation.x = 0.35; leaf.castShadow = true; top.add(leaf); }
  outline(g, { px: 2.2 }); return g;
}
export function bush(seed = 1, s = 1) { const r = rng(seed); const g = new THREE.Group(); for (let i = 0; i < 5; i++) { const b = mesh(toon(['#2f7a34', '#3a8a3a', '#28642c'][i % 3]), (0.6 + r() * 0.5) * s, (0.5 + r() * 0.4) * s, (0.6 + r() * 0.5) * s, (r() - 0.5) * 1.4 * s, 0.4 * s + r() * 0.3 * s, (r() - 0.5) * s); g.add(b); } outline(g, { px: 2 }); return g; }

// ---------------------------------------------------------------- SETS
let _brick = null; const brickTex = () => (_brick ||= canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#8a4a36'; g.fillRect(0, 0, W, H); const r = rng(9); for (let y = 0; y < H; y += 24) for (let x = (y / 24) % 2 ? -24 : 0; x < W; x += 48) { g.fillStyle = `hsl(14, ${35 + r() * 10}%, ${32 + r() * 8}%)`; g.fillRect(x + 2, y + 2, 44, 20); } }, { repeat: [3, 3] }));
export function londonStreet(st, o = {}) { // cobbled Regency street: brick + stucco facades, lamp posts, shop signs
  const g = new THREE.Group(); st.add(g);
  const road = floor(60, 60, '#8a8478'); road.receiveShadow = true; g.add(road); const walk = floor(60, 3, '#b8b0a0'); walk.position.set(0, 0.02, -6.5); g.add(walk);
  const r = rng(o.seed || 2); const cols = ['#e8dcc0', '#d8c8a8', '#efe6d2'];
  for (let i = -5; i <= 5; i++) { const brick = r() > 0.5; const w = 3.6, h = 7 + r() * 3; const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1), brick ? toon('#ffffff', { map: brickTex() }) : toon(cols[i & 1 ? 1 : 0]));
    f.position.set(i * w, h / 2, -8.5); f.castShadow = true; f.receiveShadow = true; g.add(f); g.add(box(w + 0.1, 0.3, 1.2, '#d8d0c0', i * w, h, -8.4));
    for (let fl = 0; fl < 2; fl++) for (const dx of [-0.9, 0.9]) { g.add(box(0.8, 1.3, 0.08, '#3a4a66', i * w + dx, 3.4 + fl * 2.4, -7.98)); g.add(box(0.96, 0.12, 0.2, '#f2ede2', i * w + dx, 2.7 + fl * 2.4, -7.95)); }
    g.add(box(1.0, 2.2, 0.1, ['#2a3a5a', '#5a2a2a', '#2a4a3a'][i & 3 % 3] || '#2a3a5a', i * w, 1.1, -7.96)); }
  for (const x of [-6, 4]) { const lp = new THREE.Group(); lp.add(cyl(0.07, 0.1, 4, '#1e1b24', 0, 2, 0, 8)); lp.add(rbox(0.4, 0.55, 0.4, '#f6e6a6', 0, 4.2, 0, 0.05)); lp.add(new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.3, 4), toon('#1e1b24')).translateY(4.6)); lp.position.set(x, 0, -6.2); outline(lp, { px: 2 }); g.add(lp); }
  const sky = sunnySky(st, { clouds: 6, seed: 5, top: '#7a9ac0', mid: '#b8c8d8', horizon: '#e8e0d0' });
  return { group: g, sky, update(t) { sky.update(t); } };
}
export function sea(st, o = {}) { // open sea + sky
  const g = new THREE.Group(); st.add(g); const w = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon('#2f7fb8')); w.rotation.x = -Math.PI / 2; w.receiveShadow = true; g.add(w);
  const foam = []; const r = rng(4); for (let i = 0; i < 30; i++) { const f = new THREE.Mesh(sph, toon('#e8f4f8')); f.scale.set(0.8 + r() * 0.8, 0.05, 0.12); f.position.set((r() - 0.5) * 40, 0.03, (r() - 0.5) * 30); f.userData.noOutline = true; g.add(f); foam.push(f); }
  const sky = sunnySky(st, { clouds: 8, seed: 6 });
  return { group: g, sky, update(t) { sky.update(t); foam.forEach((f, i) => { f.position.x += 0; f.scale.x = 0.8 + 0.4 * Math.sin(t * 2 + i); }); } };
}
export function jungleBeach(st, o = {}) { // empty shore + dense jungle wall (no towns, nothing built)
  const g = new THREE.Group(); st.add(g);
  const sand = floor(80, 40, '#e2c78e'); sand.position.z = 4; sand.receiveShadow = true; g.add(sand);
  const w = new THREE.Mesh(new THREE.PlaneGeometry(200, 80), toon(o.rain ? '#3a5a6a' : '#2f8fb8')); w.rotation.x = -Math.PI / 2; w.position.set(0, -0.02, 42); g.add(w);
  const grass = floor(80, 30, o.rain ? '#2a4a2a' : '#3f7a3a'); grass.position.set(0, 0.01, -22); g.add(grass);
  const r = rng(o.seed || 7);
  for (let i = 0; i < 26; i++) { const p = palm({ seed: i + 3, h: 4.5 + r() * 3 }); p.position.set(-26 + i * 2.1 + r(), 0, -8 - r() * 7); g.add(p); }
  for (let i = 0; i < 30; i++) { const b = bush(i + 11, 1.4 + r()); b.position.set(-28 + i * 1.9 + r(), 0, -6.5 - r() * 3); g.add(b); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(90, 9, 2), toon(o.rain ? '#1f3a24' : '#245a2c')); back.position.set(0, 4.5, -20); g.add(back);
  let sky = null;
  if (!o.rain) sky = sunnySky(st, { clouds: 7, seed: 8 });
  return { group: g, sky, update(t) { sky?.update(t); } };
}
export function courtroom(st, o = {}) { // French courtroom: high judges' bench, tricolour drape, wood panels, the dock
  const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 30, '#8a6a4a'); fl.receiveShadow = true; g.add(fl);
  const back = new THREE.Mesh(new THREE.BoxGeometry(30, 12, 0.3), toon('#d8c8a8')); back.position.set(0, 6, -5); back.receiveShadow = true; g.add(back);
  for (let i = -7; i <= 7; i++) g.add(rbox(1.7, 2.6, 0.1, '#7a4c2c', i * 1.9, 1.3, -4.8, 0.03));
  const bench = new THREE.Group(); bench.add(rbox(6.5, 2.0, 1.4, '#6a4228', 0, 1.0, 0, 0.06)); bench.add(rbox(6.8, 0.14, 1.6, '#5a3820', 0, 2.05, 0, 0.03)); bench.position.set(0, 0, -3.2); outline(bench, { px: 2.4 }); g.add(bench);
  const plat = rbox(7, 0.6, 2.6, '#5a3820', 0, 0.3, -3.9, 0.04); g.add(plat);
  // tricolour drape behind the bench
  [['#2a4a9a', -1.2], ['#f4f0e8', 0], ['#c8281e', 1.2]].forEach(([c, x]) => g.add(box(1.2, 4.2, 0.05, c, x, 5.6, -4.82)));
  const seal = cyl(0.6, 0.6, 0.08, '#d4a73a', 0, 8.3, -4.8, 24); seal.rotation.x = Math.PI / 2; g.add(seal);
  return { group: g, update() {} };
}
export function dock() { const g = new THREE.Group(); g.add(rbox(1.8, 1.1, 0.12, '#6a4228', 0, 0.55, 0.6, 0.03)); for (const s of [-1, 1]) g.add(rbox(0.12, 1.1, 1.3, '#6a4228', s * 0.9, 0.55, 0, 0.03)); g.add(rbox(1.9, 0.1, 0.2, '#5a3820', 0, 1.12, 0.6, 0.02)); outline(g, { px: 2.4 }); return g; }
export function gavel() { const g = new THREE.Group(); const h = cyl(0.13, 0.13, 0.42, '#5a3820', 0, 0, 0, 14); h.rotation.z = Math.PI / 2; g.add(h); g.add(cyl(0.03, 0.03, 0.6, '#7a4c2c', 0, -0.3, 0, 8)); outline(g, { px: 2 }); return g; }
