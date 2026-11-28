// The Bloop — shared assets (new for this Short). Toon 3D. Generic toon people only.
// 3D: a toon sea monster (big eyes, tentacles; it is really the iceberg in disguise), an iceberg with two glowing crack "eyes",
// a hydrophone on a cable, a tiny undersea volcano, a blue whale with a face, a reel-to-reel tape machine, a glacier front,
// penguins, a lab. 2D: top caption, an oscilloscope card, sound rings, the Pacific map card.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { T as TXT, INK as CARD_INK } from '/kits/toon3d/insert.js';
export { seaStage, waterLook, fish, chip, stamp, fxr, richLine } from './_sea.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 16);
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };
export const RED = '#ff5a4a', GOLD = '#ffd23a', ICE = '#bfeaff';

// big round cartoon eyes with lids, facing +Z. returns { group, set(u, t) }
function bigEyes(parent, R, sep, y, z, o = {}) { const eyes = [];
  for (const s of [-1, 1]) { const eg = new THREE.Group(); eg.position.set(s * sep, y, z); parent.add(eg);
    const w = M(sph, toon(o.white || '#fbf8f2', { emissive: new THREE.Color(o.glow || '#fbf8f2'), emissiveIntensity: o.glow ? 0.9 : 0.3, fresh: true })); w.scale.set(R, R * 1.15, R * 0.55); w.userData.outlinePx = 3; eg.add(w);
    const pg = new THREE.Group(); eg.add(pg); const p = M(sph, flat(o.pupil || '#120c14'), 0, 0, R * 0.5); p.scale.set(R * 0.42, R * 0.5, R * 0.1); p.userData.noOutline = true; pg.add(p);
    const hl = M(sph, flat('#ffffff'), -R * 0.15, R * 0.2, R * 0.56); hl.scale.set(R * 0.13, R * 0.13, R * 0.04); hl.userData.noOutline = true; pg.add(hl);
    const lp = new THREE.Group(); eg.add(lp); const lid = new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#3a6a5a', { fresh: true })); lid.scale.set(1, 1.15, 0.6); lid.userData.noOutline = true; lp.add(lid);
    eyes.push({ eg, pg, lp, w }); }
  return { eyes, set(u = {}, t = 0) { const bl = Math.sin(t * 1.1 + (o.seed || 0)) > 0.992 ? 1 : 0; eyes.forEach(e => { e.lp.rotation.x = lerp(-1.1, 1.57, Math.max(u.lid ?? 0.2, bl)); e.pg.position.set((u.look?.[0] || 0) * R * 0.25, (u.look?.[1] || 0) * R * 0.25, 0); }); } };
}

// ---------------------------------------------------------------- SEA MONSTER (the guess)
// seaMonster({ scale }) ~8 units tall: a lumpy dome head with two glowing eyes, a grin, 6 curling tentacles. .update(t, { lid, look, mouth, wave, costume })
export function seaMonster(o = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = toon(o.color || '#2f6a5e', { fresh: true }), dark = toon('#1f4a42', { fresh: true });
  const head = M(sph, skin, 0, 4.6, 0); head.scale.set(2.6, 3.0, 2.2); body.add(head);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; const k = M(sph, dark, Math.cos(a) * 1.9, 6.6 + Math.sin(a * 2) * 0.3, Math.sin(a) * 1.4); k.scale.setScalar(0.45); body.add(k); }
  const ey = bigEyes(body, 0.75, 1.05, 5.3, 1.75, { glow: '#fff6a0', white: '#fff6c0', lid: '#2f6a5e' });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 8, 20, Math.PI), flat('#120c14')); mouth.position.set(0, 3.7, 2.05); mouth.rotation.z = Math.PI; mouth.userData.noOutline = true; body.add(mouth);
  const teeth = []; for (let i = -2; i <= 2; i++) { const tth = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), flat('#fffbe8')); tth.position.set(i * 0.33, 3.55 - Math.abs(i) * 0.05, 2.1); tth.rotation.x = Math.PI; tth.userData.noOutline = true; body.add(tth); teeth.push(tth); }
  const tents = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; const root = new THREE.Group(); root.position.set(Math.cos(a) * 1.6, 2.4, Math.sin(a) * 1.2); body.add(root); let p = root; const segs = [];
    for (let k = 0; k < 7; k++) { const sg = new THREE.Group(); if (k) sg.position.y = -0.55; p.add(sg); const m = M(new THREE.CapsuleGeometry(0.32 - k * 0.035, 0.4, 4, 10).translate(0, -0.25, 0), skin); sg.add(m); segs.push(sg); p = sg; }
    root.rotation.z = Math.cos(a) * 0.6; root.rotation.x = -Math.sin(a) * 0.6; root.ph = i * 1.1; tents.push({ root, segs }); }
  outline(body, { px: 3.2 });
  g.head = head; g.headR = 2.6; g.eyes = ey.eyes; g.tents = tents; g.body = body;
  g.update = (t, u = {}) => { ey.set(u, t); const w = u.wave ?? 1; tents.forEach((tn, i) => tn.segs.forEach((s, k) => { s.rotation.z = Math.sin(t * 1.6 + tn.root.ph + k * 0.7) * 0.22 * w; s.rotation.x = Math.cos(t * 1.2 + tn.root.ph + k) * 0.12 * w; }));
    body.position.y = Math.sin(t * 0.9) * 0.15; const md = u.mouth || 'grin'; mouth.rotation.z = md === 'frown' ? 0 : Math.PI; teeth.forEach(x => (x.visible = md === 'grin'));
    // costume: 0 = monster, 1 = tentacles drop away (the reveal)
    const c = u.costume || 0; tents.forEach((tn, i) => { tn.root.position.y = 2.4 - c * (3 + i * 0.4); tn.root.visible = c < 0.98; }); };
  g.update(0); return g;
}

// ---------------------------------------------------------------- ICEBERG (the answer)
// iceberg({ scale }) : a faceted ice block, with an underwater part, two crack "eyes" that can glow and a crack line. .update(t, { crack 0..1, eyes 0..1, shake })
export function iceberg(o = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const iceM = toon(o.color || '#cfefff', { emissive: new THREE.Color('#6ab8e8'), emissiveIntensity: 0.18, fresh: true }), deep = toon('#8fd0f0', { fresh: true });
  const r = rng(o.seed || 4);
  const main = new THREE.Mesh(new THREE.DodecahedronGeometry(3, 1), iceM); main.scale.set(1.05, 1.5, 0.9); main.position.y = 4.4; main.castShadow = true; body.add(main);
  const pos = main.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { const k = 1 + (r() - 0.5) * 0.18; pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k); } main.geometry.computeVertexNormals();
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.DodecahedronGeometry(1 + r() * 0.8, 0), i % 2 ? iceM : deep); c.position.set((r() - 0.5) * 4.2, 1.8 + r() * 5.5, (r() - 0.5) * 2); c.rotation.set(r() * 3, r() * 3, r() * 3); body.add(c); }
  const peak = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 6), iceM); peak.position.set(0.6, 8.6, 0); peak.rotation.z = -0.15; body.add(peak);
  // crack eyes: dark wedges that glow
  const eyeMats = [0, 1].map(() => new THREE.MeshBasicMaterial({ color: '#0a2a4a' }));
  const eyes = [-1, 1].map((s, i) => { const e = new THREE.Mesh(new THREE.CircleGeometry(0.6, 3), eyeMats[i]); e.position.set(s * 1.05, 5.3, 2.66); e.rotation.z = s > 0 ? Math.PI / 6 : -Math.PI / 6 + Math.PI; e.scale.set(1.2, 0.8, 1); e.userData.noOutline = true; body.add(e); return e; });
  // crack line (zigzag) that grows
  const pts = [[0, 9.5], [0.4, 8.4], [-0.3, 7.3], [0.5, 6.2], [-0.2, 5.0], [0.3, 3.8], [-0.4, 2.6], [0.2, 1.2]].map(([x, y]) => new THREE.Vector3(x, y, 2.72));
  const crackGeo = new THREE.BufferGeometry().setFromPoints(pts); const crack = new THREE.Line(crackGeo, new THREE.LineBasicMaterial({ color: '#0a2a4a' })); crack.userData.noOutline = true; body.add(crack);
  outline(body, { px: 2.8 });
  g.body = body; g.head = main; g.headR = 3;
  g.update = (t, u = {}) => { const cr = clamp(u.crack || 0); crackGeo.setDrawRange(0, Math.max(0, Math.round(cr * pts.length))); crack.visible = cr > 0.02;
    const ey = clamp(u.eyes ?? 0); eyeMats.forEach(m => m.color.set(new THREE.Color('#0a2a4a').lerp(new THREE.Color('#fff6a0'), ey)));
    const sh = u.shake || 0; body.position.x = Math.sin(t * 47) * 0.06 * sh; body.rotation.z = Math.sin(t * 31) * 0.01 * sh; };
  g.update(0); return g;
}

// ---------------------------------------------------------------- HYDROPHONE + VOLCANO
export function hydrophone() { const g = new THREE.Group();
  g.add(rbox(1.0, 0.35, 1.0, '#5a5e66', 0, 0.17, 0, 0.08));                                                            // anchor block
  const cable = cyl(0.04, 0.04, 6, '#2a2a30', 0, 3.2, 0, 6); g.add(cable);
  const pod = new THREE.Group(); pod.add(cyl(0.32, 0.32, 1.0, '#e8b23a', 0, 0, 0, 16), ball(0.32, '#e8b23a', 0, 0.5, 0, 16), ball(0.32, '#e8b23a', 0, -0.5, 0, 16));
  for (let i = 0; i < 3; i++) pod.add(cyl(0.34, 0.34, 0.06, '#2a2a30', 0, -0.3 + i * 0.3, 0, 16));
  const grille = ball(0.2, '#2a2a30', 0, 0, 0.3, 12); pod.add(grille); pod.position.y = 2.2; g.add(pod);
  const float = ball(0.45, '#ff7a3a', 0, 6.3, 0, 16); g.add(float);
  outline(g, { px: 2.4 }); g.pod = pod; g.head = pod; g.headR = 0.5;
  g.update = (t, u = {}) => { const sh = u.shake || 0; pod.position.x = Math.sin(t * 2) * 0.06 + Math.sin(t * 43) * 0.08 * sh; pod.rotation.z = Math.sin(t * 1.5) * 0.05 + Math.sin(t * 37) * 0.1 * sh; float.position.x = Math.sin(t * 1.3) * 0.1; };
  return g; }
export function volcano() { const g = new THREE.Group(); const c = lathe([[2.2, 0], [1.6, 0.8], [0.9, 1.6], [0.6, 1.8], [0.45, 1.7]], '#8a5a4a', 20); g.add(c);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16), flat('#ff7a3a')); glow.rotation.x = -Math.PI / 2; glow.position.y = 1.72; glow.userData.noOutline = true; g.add(glow);
  outline(g, { px: 2.4 }); g.top = new THREE.Vector3(0, 1.8, 0); g.head = c; g.headR = 1; return g; }

// ---------------------------------------------------------------- BLUE WHALE (with a face)
export function blueWhale(o = {}) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const skin = toon('#4a7ab8', { fresh: true }), belly = toon('#c8d8e8', { fresh: true });
  const body = M(sph, skin); body.scale.set(5.2, 1.6, 1.7); b.add(body);
  const bl = M(sph, belly, 0.4, -0.75, 0.2); bl.scale.set(4.4, 0.85, 1.45); b.add(bl);
  const tail = new THREE.Group(); tail.position.set(-5, 0.2, 0); b.add(tail); const fl = M(new THREE.ConeGeometry(0.6, 2.2, 10), skin, -0.8, 0, 0); fl.rotation.z = Math.PI / 2; tail.add(fl);
  for (const s of [-1, 1]) { const f = M(sph, skin, -1.8, 0, s * 0.9); f.scale.set(0.5, 0.15, 1.3); tail.add(f); }
  const fin = M(sph, skin, 1.6, -0.9, 1.5); fin.scale.set(1.2, 0.2, 0.5); fin.rotation.z = -0.5; b.add(fin);
  const ey = bigEyes(b, 0.32, 0, 0.35, 0, { lid: '#4a7ab8', seed: 2 }); ey.eyes.forEach((e, i) => { e.eg.position.set(3.2, 0.35, i ? 1.35 : -1.35); e.eg.rotation.y = i ? 0.2 : Math.PI - 0.2; });
  // mouth line + an "O" mouth
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 6, 20, Math.PI * 0.8), flat('#1a2a4a')); mouth.position.set(4.0, -0.35, 0.95); mouth.rotation.set(0, 0.5, Math.PI * 1.1); mouth.userData.noOutline = true; b.add(mouth);
  const oM = M(sph, flat('#1a1a2a'), 4.6, -0.3, 0.9); oM.scale.set(0.15, 0.3, 0.3); oM.userData.noOutline = true; b.add(oM);
  outline(b, { px: 3 });
  g.head = body; g.headR = 1.6; g.eyes = ey.eyes;
  g.update = (t, u = {}) => { ey.set(u, t); tail.rotation.z = Math.sin(t * 1.6) * 0.25; b.rotation.z = Math.sin(t * 0.8) * 0.04; oM.visible = u.mouth === 'o'; mouth.visible = u.mouth !== 'o'; };
  g.update(0); return g;
}

// ---------------------------------------------------------------- LAB: scientist + tape machine
export function scientist(o = {}) { return bean({ name: 'Scientist', outfit: 'labcoat', skin: o.skin || 'brown', hair: o.hair || 'curly', hairColor: '#2a1a12', glasses: o.glasses ?? true,
  colors: { main: '#f4f2ec', legs: '#3a4a5a' }, seed: o.seed || 41 }); }
export function headphones(b) { const h = b.parts.head, R = 0.48; const band = new THREE.Mesh(new THREE.TorusGeometry(R * 1.08, 0.04, 6, 24, Math.PI), toon('#2a2a30')); h.add(band);
  for (const s of [-1, 1]) { const cup = cyl(0.17, 0.17, 0.12, '#2a2a30', s * R * 1.05, -0.02, 0, 16); cup.rotation.z = Math.PI / 2; h.add(cup); }
  outline(band, { px: 2.6 }); return b; }
export function tapeMachine() { const g = new THREE.Group(); g.add(rbox(2.0, 1.4, 0.6, '#7a6a5a', 0, 0.7, 0, 0.06), rbox(1.9, 0.3, 0.05, '#2a2a30', 0, 0.25, 0.31, 0.02));
  const reels = [-0.5, 0.5].map(x => { const r = new THREE.Group(); r.add(cyl(0.42, 0.42, 0.05, '#c9ccd2', 0, 0, 0, 24), cyl(0.12, 0.12, 0.07, '#2a2a30', 0, 0, 0, 12)); for (let i = 0; i < 3; i++) { const h = cyl(0.09, 0.09, 0.08, '#5a5e66', Math.cos(i * 2.09) * 0.24, 0, Math.sin(i * 2.09) * 0.24, 10); r.add(h); } r.rotation.x = Math.PI / 2; r.position.set(x, 0.95, 0.33); g.add(r); return r; });
  const btns = [0, 1, 2, 3].map(i => { const b = rbox(0.28, 0.14, 0.1, i === 3 ? '#e8402a' : '#e8e0d0', -0.6 + i * 0.4, 0.25, 0.36, 0.02); g.add(b); return b; });
  outline(g, { px: 2.4 }); g.reels = reels; g.btns = btns; g.head = reels[1]; g.headR = 0.5;
  g.update = (t, sp = 1) => { reels.forEach(r => { r.rotation.y = t * 3 * sp; }); }; return g; }
export function labSet(st) { const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#5a5a62', 0, 0));
  const wall = plane(30, 9, '#4a7a8a', 0, 4.5, -2.5); wall.receiveShadow = true; g.add(wall);
  const desk = PR.table({ w: 3.4, d: 1.2, h: 0.95, color: '#6a5040' }); desk.position.set(0, 0, -1.2); g.add(desk);
  // a wall chart of the Pacific
  const chart = canvasTex(512, 320, (x, W, H) => { x.fillStyle = '#2a6aa8'; x.fillRect(0, 0, W, H); x.fillStyle = '#e6d29a'; x.beginPath(); x.moveTo(W * 0.88, 0); x.lineTo(W, 0); x.lineTo(W, H); x.lineTo(W * 0.93, H); x.quadraticCurveTo(W * 0.84, H * 0.5, W * 0.88, 0); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.3)'; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, i * H / 6); x.lineTo(W, i * H / 6); x.stroke(); } });
  const cm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), toon('#ffffff', { map: chart })); cm.position.set(-1.6, 3.3, -2.48); cm.userData.noOutline = true; g.add(cm);
  outline(desk, { px: 2.2 }); return { group: g, tableY: 0.97 }; }

// ---------------------------------------------------------------- ANTARCTICA: glacier front, penguins
export function glacierSet(st, o = {}) { const g = new THREE.Group(); st.add(g);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon('#2a6aa8', { emissive: new THREE.Color('#1a4a7a'), emissiveIntensity: 0.25 })); sea.rotation.x = -Math.PI / 2; sea.userData.noOutline = true; g.add(sea);
  const iceM = toon('#e8f6ff', { emissive: new THREE.Color('#8ac8e8'), emissiveIntensity: 0.15 }), faceM = toon('#a8dcf4');
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(60, 9, 30), iceM); shelf.position.set(0, 4.5, -22); shelf.castShadow = shelf.receiveShadow = true; g.add(shelf);
  const r = rng(6); for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(2 + r() * 2, 9 + r() * 2.5, 1.2), i % 3 ? faceM : iceM); c.position.set(-28 + i * 2.2, 4.5 + r() * 0.8, -6.8 + r() * 0.4); c.castShadow = true; g.add(c); }
  const chunk = new THREE.Group(); const ch = new THREE.Mesh(new THREE.BoxGeometry(7, 10, 5), faceM); ch.position.y = 5; chunk.add(ch); const cap = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.6, 5.2), iceM); cap.position.y = 10.2; chunk.add(cap); chunk.position.set(2, 0, -4.2); g.add(chunk);
  const floe = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.8, 9), iceM); floe.position.set(-4, 0.2, 6); g.add(floe);
  outline(g, { px: 2.2 }); const sky = null;
  return { group: g, chunk, floe, update() {} }; }
export function penguin(o = {}) { const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const blk = toon('#1e2230'), wht = toon('#f6f4ee'), org = toon('#ffa83a');
  const body = M(sph, blk, 0, 0.7, 0); body.scale.set(0.45, 0.7, 0.42); b.add(body); const bel = M(sph, wht, 0, 0.65, 0.12); bel.scale.set(0.36, 0.58, 0.34); b.add(bel);
  const head = M(sph, blk, 0, 1.45, 0); head.scale.setScalar(0.33); b.add(head);
  const beak = M(new THREE.ConeGeometry(0.08, 0.22, 8), org, 0, 1.4, 0.36); beak.rotation.x = Math.PI / 2; b.add(beak);
  for (const s of [-1, 1]) { const f = M(sph, org, s * 0.15, 0.04, 0.12); f.scale.set(0.13, 0.05, 0.2); b.add(f); const w = M(sph, blk, s * 0.45, 0.75, 0); w.scale.set(0.08, 0.45, 0.2); w.rotation.z = s * 0.2; b.add(w); }
  const ey = bigEyes(b, 0.1, 0.12, 1.5, 0.27, { lid: '#1e2230', seed: o.seed || 1 });
  outline(b, { px: 2.6 }); g.head = head; g.headR = 0.33; g.eyes = ey.eyes;
  g.update = (t, u = {}) => { ey.set(u, t); b.rotation.z = Math.sin(t * 6 + (o.seed || 0)) * 0.05 * (u.waddle ?? 1); b.position.y = u.jump ? Math.max(0, Math.sin(clamp(u.jump) * Math.PI)) * 0.6 : 0; head.rotation.y = u.turn || 0; };
  g.update(0); return g; }

// ---------------------------------------------------------------- 2D
// frame-1 top caption: 2 lines, centre-top, 0..until (global time)
export function topCaption(g, gt, richLine, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  const k1 = ease.outBack(clamp((gt + 0.25) / 0.3)), k2 = ease.outBack(clamp((gt + 0.08) / 0.3));
  g.save(); g.globalAlpha = fade;
  g.save(); g.translate(540, 290); g.scale(k1, k1); g.translate(-540, -290); richLine(g, [['1997: the', '#ffffff'], ['OCEAN', GOLD], ['made a', '#ffffff']], 290, 78); g.restore();
  g.save(); g.translate(540, 395); g.scale(k2, k2); g.translate(-540, -395); richLine(g, [['noise', '#ffffff'], ['NOBODY', RED], ['could explain', '#ffffff']], 395, 74); g.restore();
  g.restore();
}
// concentric sound rings from a screen point
export function rings(g, t, x, y, o = {}) { const n = o.n || 5, p = o.period || 0.9, col = o.color || '#9fe8ff'; g.save();
  for (let i = 0; i < n; i++) { const k = ((t / p + i / n) % 1); g.globalAlpha = (1 - k) * (o.a ?? 0.85); g.strokeStyle = col; g.lineWidth = (o.w || 14) * (1 - k * 0.5); g.beginPath(); g.arc(x, y, (o.r0 || 60) + k * (o.r1 || 700), 0, Math.PI * 2); g.stroke(); }
  g.restore(); }
// oscilloscope card: a slow, tall, low wave; amp 0..1 grows; label chips are drawn by the shot
export function scopeCard(g, t, o = {}) { const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const W = 920, H = 620;
  g.save(); g.translate(E.W / 2, o.y ?? 880); g.scale(k, k); g.rotate(-0.015);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 30); g.fill();
  g.fillStyle = '#5a5e66'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 30); g.fill(); g.stroke();
  const sx = -W / 2 + 40, sy = -H / 2 + 40, sw = W - 80, sh = H - 80; g.fillStyle = '#0a2a1a'; g.beginPath(); g.roundRect(sx, sy, sw, sh, 18); g.fill();
  g.strokeStyle = 'rgba(90,255,140,0.15)'; g.lineWidth = 2; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(sx + i * sw / 8, sy); g.lineTo(sx + i * sw / 8, sy + sh); g.stroke(); } for (let j = 1; j < 6; j++) { g.beginPath(); g.moveTo(sx, sy + j * sh / 6); g.lineTo(sx + sw, sy + j * sh / 6); g.stroke(); }
  const amp = (o.amp ?? 1) * sh * 0.45, fr = o.freq || 1.2; g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
  g.strokeStyle = '#5aff8c'; g.lineWidth = 9; g.shadowColor = '#5aff8c'; g.shadowBlur = 18; g.beginPath();
  for (let i = 0; i <= 200; i++) { const x = sx + (i / 200) * sw; const ph = (i / 200) * Math.PI * 2 * fr * (1 + (o.rise || 0) * i / 200) - t * 3; const y = sy + sh / 2 + Math.sin(ph) * amp * (0.8 + 0.2 * Math.sin(i * 0.3 + t * 7)); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); g.restore(); g.restore(); }
// Pacific map card: blue ocean, South America on the right, two sensor dots ~3,000 miles apart, the X in the remote South Pacific
export function pacificCard(g, t, o = {}) { const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const W = 920, H = 1000;
  g.save(); g.translate(E.W / 2, o.y ?? 860); g.scale(k * (o.zoom || 1), k * (o.zoom || 1)); if (o.pan) g.translate(-o.pan[0], -o.pan[1]); g.rotate(-0.012);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 30); g.fill();
  g.fillStyle = '#2f7ac0'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 30); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 30); g.clip();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 3; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(-W / 2, -H / 2 + i * H / 8); g.lineTo(W / 2, -H / 2 + i * H / 8); g.stroke(); }
  // South America (right edge) + Antarctica (bottom)
  g.fillStyle = '#e6d29a'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, -H / 2); g.lineTo(W * 0.22, -H / 2); g.quadraticCurveTo(W * 0.1, -H * 0.3, W * 0.26, -H * 0.12); g.quadraticCurveTo(W * 0.32, H * 0.05, W * 0.3, H * 0.2); g.quadraticCurveTo(W * 0.28, H * 0.3, W * 0.34, H * 0.32); g.lineTo(W / 2, H * 0.2); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#f4fbff'; g.beginPath(); g.moveTo(-W / 2, H / 2); g.lineTo(-W / 2, H * 0.4); g.quadraticCurveTo(0, H * 0.34, W / 2, H * 0.42); g.lineTo(W / 2, H / 2); g.closePath(); g.fill(); g.stroke();
  TXT(g, 'SOUTH AMERICA', W * 0.36, -H * 0.36, 30, { color: CARD_INK }); TXT(g, 'ANTARCTICA', 0, H * 0.46, 34, { color: '#5a7a9a' }); TXT(g, 'PACIFIC OCEAN', -W * 0.18, -H * 0.4, 40, { color: '#ffffff', stroke: CARD_INK });
  const X = [W * 0.02, H * 0.2]; // the source, remote South Pacific
  const s1 = [-W * 0.32, -H * 0.18], s2 = [W * 0.14, -H * 0.3]; // two sensors
  const rk = clamp((t - (o.ringAt ?? 0.3)) / 1.2); if (rk > 0) { g.save(); g.strokeStyle = '#9fe8ff'; for (let i = 0; i < 3; i++) { const kk = (rk * 1.4 + i * 0.33) % 1; g.globalAlpha = 1 - kk; g.lineWidth = 8; g.beginPath(); g.arc(X[0], X[1], 40 + kk * 640 * rk, 0, Math.PI * 2); g.stroke(); } g.restore(); }
  for (const [sx, sy] of [s1, s2]) { g.fillStyle = GOLD; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.arc(sx, sy, 22, 0, 7); g.fill(); g.stroke(); }
  const dk = clamp((t - (o.distAt ?? 0.5)) / 0.4); if (dk > 0) { g.save(); g.setLineDash([22, 16]); g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.beginPath(); g.moveTo(s1[0], s1[1]); g.lineTo(lerp(s1[0], s2[0], dk), lerp(s1[1], s2[1], dk)); g.stroke(); g.restore();
    if (dk >= 1) { g.save(); g.translate((s1[0] + s2[0]) / 2, (s1[1] + s2[1]) / 2 - 60); g.rotate(-0.25); TXT(g, '~3,000 MILES', 0, 0, 56, { color: GOLD, stroke: CARD_INK }); g.restore(); } }
  const xk = ease.outBack(clamp((t - (o.xAt ?? 99)) / 0.25)); if (xk > 0) { g.save(); g.translate(X[0], X[1]); g.scale(xk, xk); g.strokeStyle = RED; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, -40); g.lineTo(40, 40); g.moveTo(40, -40); g.lineTo(-40, 40); g.stroke(); TXT(g, 'BLOOP', 0, 80, 48, { color: '#ffffff', stroke: CARD_INK }); g.restore(); }
  g.restore(); g.restore(); }
// a radial glow at a screen point
export function glowAt(g, x, y, R, col, a) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, alpha(col, a)); gr.addColorStop(1, alpha(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }
export function vignette(g, a = 0.3) { g.save(); const gr = g.createRadialGradient(E.W / 2, E.H * 0.45, E.H * 0.25, E.W / 2, E.H * 0.45, E.H * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(2,8,24,${a})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, TXT, CARD_INK, canvasTex, sph, M };
