// Lord Byron's college bear: shared assets. EMOTION: LOL. Deadpan narrator, light and silly.
// Tone guard: the bear is tame, happy and never hurt or chained cruelly (a loose ribbon lead). Every character and set is an
// original toon; Byron is a generic curly-haired poet bean, not a likeness of any portrait.
import { E, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage, blob } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export * from './_jc.js';
export { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, toonStage, PR, rng, clamp, lerp, ease, prog, sunnySky };

const sph = new THREE.SphereGeometry(1, 24, 16);
const mesh = (mat, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(sph, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };

// ---------------------------------------------------------------- the eye (white ball + pupil + heavy lid), like the beans
function lidEye(parent, pos, size, lidColor) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.scale.set(size, size * 1.12, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.36, 0.4, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidColor)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}

// ---------------------------------------------------------------- THE BEAR (tame toon brown bear, walks upright like a person)
// bear({ gown, cap, bow }) ~3.0 units tall standing. update(t, { walk, sit, wave, lid, smile, look, headTurn, bounce })
export function bear(o = {}) {
  const fur = toon(o.fur || '#8a5a34'), furD = toon(o.furDark || '#6e4526'), muzzle = toon('#d9b27e'), nose = toon('#2a1a14');
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips);
  const body = mesh(fur, 0.78, 0.92, 0.66, 0, 0.62, 0); hips.add(body);
  const belly = mesh(muzzle, 0.52, 0.62, 0.3, 0, 0.5, 0.42); hips.add(belly);
  const head = new THREE.Group(); head.position.set(0, 1.72, 0.06); hips.add(head);
  head.add(mesh(fur, 0.6, 0.54, 0.54));
  for (const s of [-1, 1]) { const ear = mesh(fur, 0.2, 0.2, 0.12, s * 0.42, 0.42, -0.05); head.add(ear); const inn = mesh(muzzle, 0.11, 0.11, 0.06, s * 0.42, 0.42, 0.04); inn.castShadow = false; head.add(inn); }
  const snout = mesh(muzzle, 0.3, 0.22, 0.24, 0, -0.14, 0.44); head.add(snout);
  head.add(mesh(nose, 0.11, 0.08, 0.08, 0, -0.06, 0.66));
  const mouthM = flat('#3a1e16'); const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 6, 16, Math.PI), mouthM); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.22, 0.66); mouth.userData.noOutline = true; head.add(mouth);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.21, 0.12, 0.43), 0.13, '#7a4c2c'));
  const brows = [-1, 1].map(s => { const b = mesh(furD, 0.12, 0.035, 0.04, s * 0.21, 0.3, 0.47); b.castShadow = false; head.add(b); return b; });
  // limbs: pivots so arms can wave and legs can step
  const limb = (r, len, mat) => { const gg = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12).translate(0, -len / 2, 0), mat); m.castShadow = true; gg.add(m); const paw = mesh(furD, r * 1.15, r * 0.9, r * 1.15, 0, -len - r * 0.4, 0.03); gg.add(paw); return gg; };
  const arms = [-1, 1].map(s => { const a = limb(0.17, 0.62, fur); a.position.set(s * 0.66, 1.18, 0.05); hips.add(a); return a; });
  const legs = [-1, 1].map(s => { const l = limb(0.21, 0.5, fur); l.position.set(s * 0.34, 0.05, 0.02); hips.add(l); return l; });
  // academic gown (black cape over the shoulders) + mortarboard + a little bow tie
  let gown = null, cap = null, tassel = null;
  if (o.gown) {
    gown = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.98, 1.35, 28, 1, true, Math.PI * 0.32, Math.PI * 1.36), toon('#1e1b24')); gown.material.side = THREE.DoubleSide; gown.position.set(0, 0.62, -0.06); gown.castShadow = true; hips.add(gown);
    for (const s of [-1, 1]) { const lap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 0.05), toon('#1e1b24')); lap.position.set(s * 0.4, 0.66, 0.5); lap.rotation.z = s * -0.18; lap.castShadow = true; hips.add(lap); }
    const sleeve = (a) => { const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.5, 14, 1, true), toon('#1e1b24')); sl.material.side = THREE.DoubleSide; sl.position.y = -0.22; a.add(sl); }; arms.forEach(sleeve);
  }
  if (o.cap) {
    cap = new THREE.Group(); const sk = cyl(0.36, 0.38, 0.2, '#1e1b24', 0, 0, 0, 24); cap.add(sk); const board = box(0.95, 0.05, 0.95, '#22202a', 0, 0.12, 0); board.rotation.y = Math.PI / 4; cap.add(board);
    cap.add(ball(0.05, '#d4a73a', 0, 0.16, 0, 10)); tassel = new THREE.Group(); tassel.position.set(0, 0.15, 0); const st = cyl(0.015, 0.015, 0.5, '#d4a73a', 0.33, -0.22, 0.33, 6); tassel.add(st); tassel.add(cyl(0.05, 0.03, 0.14, '#d4a73a', 0.33, -0.5, 0.33, 8)); cap.add(tassel);
    cap.position.set(0, 0.5, -0.02); cap.rotation.set(-0.08, 0, 0.1); head.add(cap); outline(cap, { px: 2.6 });
  }
  if (o.bow !== false) { const bw = new THREE.Group(); bw.add(mesh(toon(o.bowColor || '#c23a3a'), 0.13, 0.08, 0.05, -0.1, 0, 0)); bw.add(mesh(toon(o.bowColor || '#c23a3a'), 0.13, 0.08, 0.05, 0.1, 0, 0)); bw.add(mesh(toon(shadeHex(o.bowColor || '#c23a3a', -0.2)), 0.05, 0.05, 0.05)); bw.position.set(0, 1.4, 0.48); hips.add(bw); }
  root.add(blob(0.85, 0.3));
  outline(g, { px: 3 });
  const blinkAt = (t) => { const tt = (t + 0.9) % 3.3; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { walk = 0, sit = 0, wave = 0, lid = 0.3, smile = 1, look = [0, 0], headTurn = 0, headTilt = 0, bounce = 0, armsUp = 0, brow = 0 } = u;
    const w = t * 2.2 * Math.PI * 2;
    legs.forEach((l, i) => { const s = i ? 1 : -1; l.rotation.x = walk * Math.sin(w + (i ? Math.PI : 0)) * 0.55 - sit * 1.45; l.rotation.z = s * 0.06 * (1 - sit); });
    hips.position.y = 0.95 + walk * Math.abs(Math.sin(w)) * 0.08 - sit * 0.55 + bounce * Math.abs(Math.sin(t * 9)) * 0.12;
    hips.rotation.z = walk * Math.sin(w) * 0.07; hips.rotation.x = sit * -0.12;
    arms.forEach((a, i) => { const s = i ? 1 : -1; a.rotation.x = -walk * Math.sin(w + (i ? 0 : Math.PI)) * 0.5 - armsUp * 2.6; a.rotation.z = s * (0.18 + armsUp * 0.4);
      if (i === 1 && wave > 0) { a.rotation.z = lerp(a.rotation.z, 2.5, wave); a.rotation.x = lerp(a.rotation.x, -0.2, wave) + Math.sin(t * 14) * 0.25 * wave; } });
    head.rotation.set(Math.sin(t * 1.7) * 0.03, headTurn + Math.sin(t * 1.1) * 0.05, headTilt + walk * Math.sin(w) * 0.05);
    const bl = blinkAt(t); eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    brows.forEach((b, i) => { b.position.y = 0.3 + brow * 0.08; b.rotation.z = (i ? -1 : 1) * brow * 0.25; });
    mouth.scale.set(1, lerp(-0.6, 1, smile), 1);
    if (tassel) tassel.rotation.z = Math.sin(t * 5) * 0.15 + walk * Math.sin(w) * 0.2;
  };
  root.head = head; root.headR = 0.6; root.arms = arms; root.update(0); return root;
}

// ---------------------------------------------------------------- PEOPLE
export function byron(o = {}) {   // the young poet: dark curls, white shirt + dark coat, loose cravat. Smug.
  const b = bean({ name: 'Byron', outfit: 'uniform', colors: { main: '#2a2e4a', trim: '#e8e2d2', belt: '#2a2e4a' }, skin: 'fair', hair: 'curly', hairColor: '#2a1a14', seed: o.seed || 41, scale: o.scale || 1 });
  const cr = new THREE.Group(); cr.add(ball(0.11, '#f4efe4', -0.07, 0, 0, 12)); cr.add(ball(0.11, '#f4efe4', 0.07, 0, 0, 12)); cr.add(ball(0.06, '#e8e0cc', 0, -0.03, 0.04, 10));
  const tail = cyl(0.05, 0.08, 0.32, '#f4efe4', 0, -0.2, 0.02, 10); cr.add(tail); outline(cr, { px: 2.4 }); cr.position.set(0, 0.0, 0.32); b.parts.head.parent.add(cr); cr.position.y = b.parts.head.position.y - 0.55;
  return b;
}
export function don(o = {}) {     // a college fellow in a black gown with a white bands collar
  return bean({ name: 'Don', outfit: 'robe', colors: { main: '#25222c', trim: '#f2ede2' }, skin: o.skin || 'light', hair: o.hair || 'horseshoe', hairColor: o.hairColor || '#9a9590',
    moustache: o.moustache ?? false, glasses: o.glasses ?? false, seed: o.seed || 51, scale: o.scale || 1 });
}
export function porter(o = {}) {  // the college porter: bowler-ish cap, dark waistcoat
  return bean({ name: 'Porter', outfit: 'uniform', colors: { main: '#3a3a44', trim: '#c9a14a', belt: '#2a2a30' }, skin: o.skin || 'tan', hair: 'bowl', hairColor: '#3a2416', head: 'cap', headColor: '#2a2a32', moustache: '#3a2416', seed: o.seed || 61 });
}
export function mortarboard(head, o = {}) {   // a mortarboard for a bean head
  const cap = new THREE.Group(); cap.add(cyl(0.44, 0.47, 0.2, '#1e1b24', 0, 0, 0, 24)); const bd = box(1.1, 0.05, 1.1, '#22202a', 0, 0.12, 0); bd.rotation.y = Math.PI / 4; cap.add(bd); cap.add(ball(0.05, '#d4a73a', 0, 0.16, 0, 10));
  outline(cap, { px: 2.6 }); cap.position.set(0, 0.42, -0.02); cap.rotation.x = -0.1; head.add(cap); return cap;
}

// ---------------------------------------------------------------- PROPS
let _brickTex = null, _winTex = null;
const stoneTex = () => (_brickTex ||= canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#d8c7a0'; g.fillRect(0, 0, W, H); const r = rng(5); for (let y = 0; y < H; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < W; x += 64) { g.fillStyle = `hsl(42, ${22 + r() * 10}%, ${70 + r() * 8}%)`; g.fillRect(x + 2, y + 2, 60, 28); } }, { repeat: [4, 2] }));
export function leash(color = '#c23a3a') { return color; }
export function sign(text, o = {}) {   // wooden post sign with painted text (canvas texture)
  const w = o.w || 2.2, h = o.h || 1.1, g = new THREE.Group();
  const t = canvasTex(512, Math.round(512 * h / w), (c, W, H) => { c.fillStyle = o.bg || '#f4ecd6'; c.fillRect(0, 0, W, H); c.strokeStyle = '#2a1c15'; c.lineWidth = 14; c.strokeRect(7, 7, W - 14, H - 14);
    c.fillStyle = o.color || '#c8281e'; c.textAlign = 'center'; c.textBaseline = 'middle'; const lines = text.split('\n'); let fs = Math.min(H / (lines.length + 0.6), 130); c.font = `900 ${fs}px Nunito, sans-serif`; const mw = Math.max(...lines.map(l => c.measureText(l).width)); if (mw > W * 0.84) { fs *= W * 0.84 / mw; c.font = `900 ${fs}px Nunito, sans-serif`; }
    lines.forEach((l, i) => c.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.05)); });
  const board = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), [toon('#7a5032'), toon('#7a5032'), toon('#7a5032'), toon('#7a5032'), toon('#ffffff', { map: t }), toon('#7a5032')]); board.position.y = o.y ?? 1.9; board.castShadow = true; g.add(board);
  if (o.post !== false) g.add(cyl(0.07, 0.07, (o.y ?? 1.9), '#6a4228', 0, (o.y ?? 1.9) / 2, -0.06, 8));
  outline(g, { px: 2.4 }); return g;
}
export function book(o = {}) { const g = new THREE.Group(); g.add(rbox(0.7, 0.12, 0.5, o.color || '#7a2a1e', 0, 0.06, 0, 0.02)); g.add(box(0.66, 0.1, 0.46, '#f4ecd6', 0.02, 0.06, 0)); outline(g, { px: 2.2 }); return g; }
export function letterPaper() { const g = new THREE.Group(); const p = box(0.5, 0.01, 0.65, '#f6ecd2', 0, 0, 0); g.add(p); return g; }
export function quill() { const g = new THREE.Group(); const f = new THREE.Mesh(sph, toon('#f4f0e8')); f.scale.set(0.05, 0.3, 0.015); f.position.y = 0.2; g.add(f); g.add(cyl(0.008, 0.008, 0.5, '#d8d0c0', 0, 0.1, 0, 6)); outline(g, { px: 1.8 }); return g; }
export function desk(o = {}) { const g = new THREE.Group(); g.add(rbox(o.w || 2.2, 0.12, o.d || 1.0, '#6a4228', 0, 1.0, 0, 0.03)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.1, 1.0, 0.1, '#5a3820', sx * ((o.w || 2.2) / 2 - 0.12), 0.5, sz * ((o.d || 1.0) / 2 - 0.1))); outline(g, { px: 2.4 }); return g; }
export function candle() { const g = new THREE.Group(); g.add(cyl(0.12, 0.14, 0.05, '#c9a14a', 0, 0.025, 0, 14)); g.add(cyl(0.05, 0.05, 0.3, '#f4ecd6', 0, 0.2, 0, 10)); const fl = new THREE.Mesh(sph, flat('#ffcf5a')); fl.scale.set(0.04, 0.08, 0.04); fl.position.y = 0.42; fl.userData.noOutline = true; g.add(fl); outline(g, { px: 2 }); g.flame = fl; return g; }

// ---------------------------------------------------------------- SETS
// college quad: lawn, stone ranges with arched windows on three sides, a gate tower at the back, gravel path, sunny sky.
export function quad(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const lawn = floor(60, 60, '#7fb04e'); lawn.receiveShadow = true; g.add(lawn);
  const path = floor(3.2, 60, '#d9c9a2'); path.position.y = 0.01; g.add(path);
  const path2 = floor(60, 3.0, '#d9c9a2'); path2.position.set(0, 0.012, -6); g.add(path2);
  const stone = toon('#ffffff', { map: stoneTex() });
  const range = (w, h, x, z, ry) => { const r = new THREE.Group(); const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), stone); wall.position.y = h / 2; wall.castShadow = true; wall.receiveShadow = true; r.add(wall);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.5, 1.6), toon('#8a8f98')); roof.position.y = h + 0.2; r.add(roof);
    for (let i = 0; i < Math.floor(w / 2.6); i++) for (const yy of [1.6, 4.6]) { const wx = -w / 2 + 1.4 + i * 2.6; const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.7, 0.1), toon('#3a4a66')); win.position.set(wx, yy + 0.7, 0.6); r.add(win); const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16, 1, false, -Math.PI / 2, Math.PI), toon('#3a4a66')); arch.rotation.x = Math.PI / 2; arch.rotation.z = 0; arch.position.set(wx, yy + 1.55, 0.6); r.add(arch); const sill = box(1.2, 0.14, 0.3, '#c9b68e', wx, yy - 0.15, 0.65); r.add(sill); }
    for (let i = 0; i < Math.floor(w / 1.2); i++) r.add(box(0.6, 0.5, 1.3, '#cdbb92', -w / 2 + 0.6 + i * 1.2, h + 0.55, 0));
    r.position.set(x, 0, z); r.rotation.y = ry; g.add(r); return r; };
  range(34, 7.5, 0, -16, 0); range(30, 7.5, -13, 0, Math.PI / 2); range(30, 7.5, 13, 0, -Math.PI / 2);
  // gate tower at the back
  const tw = new THREE.Group(); const tb = new THREE.Mesh(new THREE.BoxGeometry(5, 12, 2.2), stone); tb.position.y = 6; tb.castShadow = true; tw.add(tb);
  for (const sx of [-1, 1]) { const tur = cyl(0.9, 0.9, 13.5, '#d8c7a0', sx * 2.6, 6.75, 0.4, 12); tw.add(tur); tw.add(new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.6, 12), toon('#8a8f98')).translateX(sx * 2.6).translateY(14.3).translateZ(0.4)); }
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.4, 0.2), toon('#5a3a22')); door.position.set(0, 1.7, 1.15); tw.add(door);
  const clock = cyl(0.9, 0.9, 0.12, '#f4ecd6', 0, 9, 1.15, 24); clock.rotation.x = Math.PI / 2; tw.add(clock);
  tw.position.set(0, 0, -15.5); g.add(tw);
  // fountain in the middle of the lawn
  if (o.fountain !== false) { const f = new THREE.Group(); f.add(cyl(1.6, 1.8, 0.6, '#cdbb92', 0, 0.3, 0, 24)); f.add(cyl(1.4, 1.4, 0.05, '#7ab8d8', 0, 0.58, 0, 24)); f.add(cyl(0.3, 0.4, 1.6, '#cdbb92', 0, 1.2, 0, 12)); f.add(cyl(0.8, 0.5, 0.25, '#cdbb92', 0, 2.0, 0, 16)); f.position.set(o.fx ?? 6.5, 0, o.fz ?? -7); outline(f, { px: 2 }); g.add(f); }
  outline(tw, { px: 2.2 });
  const sky = sunnySky(st, { clouds: 6, seed: o.seed || 4 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// wood-panelled college room: dark panels, bookshelves, a tall window with sunlight, a rug.
export function study(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 30, '#7a5436'); fl.receiveShadow = true; g.add(fl);
  const wallM = toon('#8a5a36');
  const back = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 0.3), wallM); back.position.set(0, 5, -4); back.receiveShadow = true; g.add(back);
  for (let i = -6; i <= 6; i++) { const pnl = rbox(1.6, 2.4, 0.08, '#7a4c2c', i * 2.0, 1.4, -3.8, 0.03); g.add(pnl); }
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 30), wallM); side.position.set(-9, 5, 6); side.receiveShadow = true; g.add(side);
  for (const x of [-5.5, 5.2]) { const sh = PR.shelf({ w: 2.6, h: 4.2, seed: 3 + x }); sh.position.set(x, 0, -3.6); g.add(sh); }
  const win = new THREE.Group(); win.add(box(2.6, 4.2, 0.1, '#bfe0f6', 0, 0, 0)); win.add(box(0.12, 4.2, 0.14, '#5a3a22', 0, 0, 0.05)); win.add(box(2.6, 0.12, 0.14, '#5a3a22', 0, 0.4, 0.05)); win.position.set(1.0, 4.4, -3.82); g.add(win);
  const rug = PR.rug({ w: 6, d: 4, color: '#8a2a2a' }); rug.position.set(0, 0.01, 1.2); g.add(rug);
  return { group: g, update() {} };
}
