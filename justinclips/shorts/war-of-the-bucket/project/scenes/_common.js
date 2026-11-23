// Justin clips batch 4: shared Toon 3D helpers (copied into each Short as project/scenes/_common.js; files starting
// with "_" are not auto-loaded). Every character, animal, prop and set here is an original toon. No gore: nobody is
// ever shown hurt; animals are comic and fine on screen.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage, camMove } from '/kits/toon3d/toon.js';
import { bean, shadeHex, POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, run, point, shrug, nod } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
import { sunnySky, sunnyLook } from '/kits/toon3d/sky.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { T as insT, INK as CARD_INK, voidBg } from '/kits/toon3d/insert.js';

// seconds into this shot when `word` (nth occurrence from the shot start) is spoken; fb if not found
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
export const sph = new THREE.SphereGeometry(1, 24, 16);
export const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };
const v3 = new THREE.Vector3();
export const scr = (st, p) => { v3.set(...p).project(st.camera); return [(v3.x + 1) / 2 * E.W, (1 - v3.y) / 2 * E.H]; };
export const handPos = (b, side = 'R') => { const v = new THREE.Vector3(); b.hand[side].getWorldPosition(v); return v; };

// ---------------------------------------------------------------- simple eyes for animals: .set(lid 0..1, look [x,y])
function animalEye(parent, pos, size, lidColor) {
  const eg = new THREE.Group(); eg.position.set(...pos); eg.scale.set(size, size * 1.12, size * 0.7); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 })); w.userData.outlinePx = 2; eg.add(w);
  const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.38, 0.42, 0.12); p.position.z = 0.93; p.userData.noOutline = true; eg.add(p);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidColor)); lid.userData.noOutline = true; eg.add(lid);
  return { set(l = 0.3, look = [0, 0]) { lid.rotation.x = -0.35 + clamp(l) * (Math.PI / 2 + 0.35); p.position.set(look[0] * 0.35, look[1] * 0.3, 0.93); } };
}

// ---------------------------------------------------------------- QUADRUPED (pig / bear): faces +Z
// quad({ kind: 'pig'|'bear', scale, color, seed })  .update(t, { walk, rear 0..1 (stand on hind legs), lid, look, headTurn, headNod, wiggle, armsFwd })
export function quad(o = {}) {
  const pig = o.kind === 'pig'; const col = o.color || (pig ? '#f2a7b0' : '#7a4f2e'), dk = shadeHex(col, -0.18), lt = shadeHex(col, 0.18);
  const L = pig ? 1.5 : 1.7, R = pig ? 0.62 : 0.7, legH = pig ? 0.42 : 0.62, legR = pig ? 0.12 : 0.17;
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const M = toon(col), MD = toon(dk), ML = toon(lt);
  const hips = new THREE.Group(); hips.position.set(0, legH + R * 0.75, -L * 0.42); g.add(hips);
  const body = mesh(sph, M, R, R * 0.92, L * 0.62); body.position.set(0, 0, L * 0.42); hips.add(body);
  if (!pig) { const belly = mesh(sph, ML, R * 0.7, R * 0.6, L * 0.45); belly.position.set(0, -R * 0.35, L * 0.5); hips.add(belly); }
  const head = new THREE.Group(); head.position.set(0, R * 0.35, L * 0.95); hips.add(head);
  const HR = pig ? 0.48 : 0.5; const sk = mesh(sph, M, HR, HR * 0.95, HR * 0.95); head.add(sk);
  if (pig) {
    const sn = cyl(0.2, 0.22, 0.2, lt, 0, -0.06, HR * 0.95, 20); sn.rotation.x = Math.PI / 2; head.add(sn);
    for (const s of [-1, 1]) { const n = new THREE.Mesh(sph, flat('#8a3a4a')); n.scale.set(0.04, 0.06, 0.02); n.position.set(s * 0.07, -0.06, HR * 0.95 + 0.105); n.userData.noOutline = true; head.add(n); }
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), M); e.position.set(s * 0.3, 0.38, 0.05); e.rotation.set(0.5, 0, -s * 0.5); e.castShadow = true; head.add(e); }
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 6, 14, Math.PI * 1.6), M); tail.position.set(0, R * 0.3, -0.1); tail.rotation.y = Math.PI / 2; hips.add(tail); root.tail = tail;
  } else {
    const mz = mesh(sph, ML, 0.26, 0.2, 0.3); mz.position.set(0, -0.12, HR * 0.8); head.add(mz);
    const nose = mesh(sph, toon('#2a1c18'), 0.1, 0.07, 0.07); nose.position.set(0, -0.02, HR * 0.8 + 0.28); head.add(nose);
    for (const s of [-1, 1]) { const e = mesh(sph, M, 0.16, 0.16, 0.08); e.position.set(s * 0.36, 0.36, -0.05); head.add(e); const ei = new THREE.Mesh(sph, toon(lt)); ei.scale.set(0.09, 0.09, 0.04); ei.position.set(s * 0.36, 0.36, 0.02); ei.userData.noOutline = true; head.add(ei); }
    const tail = mesh(sph, M, 0.12, 0.12, 0.12); tail.position.set(0, R * 0.2, -0.05); hips.add(tail);
  }
  const eyes = [-1, 1].map(s => animalEye(head, [s * (pig ? 0.2 : 0.21), 0.14, HR * 0.82], pig ? 0.1 : 0.095, dk));
  // legs: front legs live in the body frame (become arms when reared), hind legs on the hips
  const mkLeg = (parent, x, y, z, h) => { const piv = new THREE.Group(); piv.position.set(x, y, z); parent.add(piv); const l = mesh(new THREE.CylinderGeometry(legR, legR * 0.95, h, 12).translate(0, -h / 2, 0), M); piv.add(l); const paw = mesh(sph, pig ? toon('#7a4a4a') : MD, legR * 1.15, legR * 0.8, legR * 1.3); paw.position.set(0, -h, legR * 0.25); piv.add(paw); return piv; };
  const fl = [-1, 1].map(s => mkLeg(hips, s * R * 0.55, -R * 0.45, L * 0.78, legH + R * 0.3));
  const hl = [-1, 1].map(s => mkLeg(hips, s * R * 0.55, -R * 0.45, L * 0.08, legH + R * 0.3));
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.22, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; shadow.scale.set(R * 1.2, L * 0.7, 1); shadow.userData.noOutline = true; g.add(shadow);
  outline(g, { px: 2.8 });
  root.head = head; root.hips = hips; root.frontLegs = fl; root.parts = { body, head, fl, hl };
  root.update = (t, u = {}) => {
    const w = u.walk || 0, rear = clamp(u.rear || 0), ph = t * (u.speed || 2.4) * Math.PI * 2;
    hips.rotation.x = -rear * 1.25; hips.position.y = legH + R * 0.75 + rear * 0.15 + Math.abs(Math.sin(ph)) * 0.04 * w;
    hl.forEach((l, i) => { l.rotation.x = Math.sin(ph + i * Math.PI) * 0.6 * w + rear * 1.25; });
    fl.forEach((l, i) => { l.rotation.x = Math.sin(ph + i * Math.PI + Math.PI) * 0.6 * w * (1 - rear) + rear * (u.armsFwd ?? -0.2) + (u.wiggle ? Math.sin(t * 9 + i * 2) * 0.4 * u.wiggle : 0); });
    head.rotation.set((u.headNod || 0) + rear * 1.1, u.headTurn || 0, u.headTilt || 0);
    const bl = ((t + (o.seed || 1) * 1.3) % 3.3) < 0.13 ? 1 : 0;
    eyes.forEach(e => e.set(Math.max(u.lid ?? 0.3, bl), u.look || [0, 0]));
    if (root.tail) root.tail.rotation.z = Math.sin(t * 8) * 0.4;
    return root;
  };
  root.update(0);
  return root;
}

// ---------------------------------------------------------------- BIRD (vulture by default): faces +Z, .update(t, { flap, lid, beakOpen })
export function bird(o = {}) {
  const g = new THREE.Group(); const s = o.scale || 1; const inner = new THREE.Group(); inner.scale.setScalar(s); g.add(inner);
  const bodyC = o.body || '#2e2a2e', headC = o.head || '#d2706a';
  const body = mesh(sph, toon(bodyC), 0.42, 0.36, 0.62); inner.add(body);
  const ruff = mesh(sph, toon(o.ruff || '#4a4248'), 0.3, 0.28, 0.2); ruff.position.set(0, 0.18, 0.42); inner.add(ruff);
  const head = new THREE.Group(); head.position.set(0, 0.42, 0.62); inner.add(head);
  head.add(mesh(sph, toon(headC), 0.2, 0.19, 0.23));
  const beakU = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 10), toon('#efe2c8')); beakU.rotation.x = Math.PI / 2; beakU.position.set(0, 0.0, 0.28); beakU.castShadow = true; head.add(beakU);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.05, 0.16); head.add(jaw); const beakL = mesh(sph, toon('#d8c8a8'), 0.05, 0.03, 0.1); beakL.position.z = 0.06; jaw.add(beakL);
  const eyes = [-1, 1].map(sd => animalEye(head, [sd * 0.11, 0.07, 0.15], 0.065, headC));
  const wings = [-1, 1].map(sd => { const pv = new THREE.Group(); pv.position.set(sd * 0.32, 0.12, 0.05); inner.add(pv); const wm = mesh(sph, toon(shadeHex(bodyC, 0.06)), 0.85, 0.06, 0.42); wm.position.x = sd * 0.8; pv.add(wm);
    for (let i = 0; i < 4; i++) { const f = mesh(sph, toon(shadeHex(bodyC, -0.1)), 0.18, 0.04, 0.12); f.position.set(sd * (1.45 + i * 0.05), 0, -0.2 + i * 0.13); pv.add(f); } return { pv, sd }; });
  const tail = mesh(sph, toon(shadeHex(bodyC, -0.1)), 0.22, 0.05, 0.3); tail.position.set(0, 0.02, -0.7); inner.add(tail);
  outline(inner, { px: 2.4 });
  g.head = head; g.jaw = jaw;
  g.update = (t, u = {}) => { const f = u.flap ?? 1; wings.forEach(({ pv, sd }) => { pv.rotation.z = sd * (0.25 + Math.sin(t * (u.rate || 6) + (o.seed || 0)) * 0.55 * f); }); jaw.rotation.x = u.beakOpen || 0; eyes.forEach(e => e.set(u.lid ?? 0.4, u.look || [0, 0])); head.rotation.x = u.headNod || 0; return g; };
  g.update(0); return g;
}

// ---------------------------------------------------------------- SETS
// meadow(st, o): grass ground, rolling hills, sunny sky. o.ground colour, o.trees count, o.seed, o.hills
export function meadow(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 3);
  const gT = canvasTex(256, 256, (x, w, h) => { x.fillStyle = o.ground || '#8cc063'; x.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { x.fillStyle = r() > 0.5 ? 'rgba(60,120,40,.25)' : 'rgba(220,240,160,.25)'; x.fillRect(r() * w, r() * h, 3, 3); } });
  gT.wrapS = gT.wrapT = THREE.RepeatWrapping; gT.repeat.set(16, 16);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), toon('#ffffff', { map: gT })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; gr.userData.noOutline = true; g.add(gr);
  if (o.hills !== false) for (let i = 0; i < 7; i++) { const h = mesh(sph, toon(i % 2 ? '#7ab055' : '#6aa04a'), 18 + r() * 14, 4 + r() * 4, 10); h.position.set(-70 + i * 24 + r() * 8, -1, -70 - r() * 20); h.userData.noOutline = true; h.castShadow = false; g.add(h); }
  for (let i = 0; i < (o.trees ?? 6); i++) { const tr = tree(r); tr.position.set((r() - 0.5) * 60, 0, -18 - r() * 30); g.add(tr); }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 3 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
export function tree(r = rng(1), o = {}) {
  const tr = new THREE.Group(); const s = o.s || (0.9 + r() * 0.5);
  tr.add(cyl(0.18 * s, 0.24 * s, 1.6 * s, '#7a5032', 0, 0.8 * s, 0, 10));
  if (o.pine) { for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.4 - i * 0.35) * s, 1.8 * s, 12), toon(i % 2 ? '#2f6a3a' : '#3a7a44')); c.position.y = (1.8 + i * 1.0) * s; c.castShadow = true; tr.add(c); } }
  else { for (let i = 0; i < 3; i++) { const c = mesh(sph, toon(i % 2 ? '#4f8f44' : '#5ea24e'), (1.1 - i * 0.15) * s, (0.95 - i * 0.1) * s, (1.1 - i * 0.15) * s); c.position.set((r() - 0.5) * 0.6 * s, (2.2 + i * 0.5) * s, (r() - 0.5) * 0.4 * s); tr.add(c); } }
  outline(tr, { px: 2.2 }); return tr;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// topCaption: the hook caption that ADDS story, top of frame, from frame 1 until `until` (global seconds)
export function topCaption(g, t, info, lines, until, o = {}) {
  const T = info.shot.start + t; if (T > until) return; const fade = clamp((until - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  lines.forEach((l, i) => { g.save(); g.translate(E.W / 2, (o.y ?? 172) + i * 96); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 84 : 74, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
export function stamp(g, t, text, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = lerp(2.4, 1, ease.out(k)); const x = o.x ?? E.W / 2, y = o.y ?? 760; const w = o.w || 600;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(s, s); g.globalAlpha = clamp(k * 1.4) * 0.95; g.lineJoin = 'round';
  g.fillStyle = o.fill || 'rgba(255,248,236,.0)'; g.strokeStyle = o.color || '#d8281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-w / 2, -90, w, 180, 22); g.fill(); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2 + 18, -72, w - 36, 144, 16); g.stroke();
  insT(g, text, 0, 6, o.size || 120, { color: o.color || '#d8281e', stroke: o.stroke ?? null, maxW: w - 50 });
  g.restore();
}
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420;
  g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(k, k); g.globalAlpha = 0.95; g.lineJoin = 'round';
  g.fillStyle = 'rgba(255,248,236,.88)'; g.strokeStyle = '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-140, -60, 280, 120, 18); g.fill(); g.stroke();
  insT(g, String(year), 0, 4, 92, { color: '#e23b2e', stroke: null }); g.restore();
}
export function burst(g, t, o = {}) {
  if (t < 0 || t > (o.until ?? 1.6)) return; const k = ease.outBack(clamp(t / 0.18)); const fade = 1 - clamp((t - (o.until ?? 1.6) + 0.25) / 0.25);
  const x = o.x ?? E.W / 2, y = o.y ?? 760, R = (o.r ?? 330) * k * (1 + t * 0.06);
  g.save(); g.translate(x, y); g.rotate(-0.08 + Math.sin(t * 20) * 0.01); g.globalAlpha = fade; g.lineJoin = 'round';
  const star = (rr, col) => { g.beginPath(); const n = 18; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2; const q = i % 2 ? rr * 0.68 : rr * (0.95 + 0.08 * Math.sin(i * 7.3)); g.lineTo(Math.cos(a) * q, Math.sin(a) * q * 0.72); } g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = CARD_INK; g.lineWidth = 10; g.stroke(); };
  star(R, o.c1 || '#ffb21e'); star(R * 0.72, o.c2 || '#fff06a');
  insT(g, o.text || 'BANG!', 0, 10, (o.size || 150) * k, { color: o.color || '#e2321e', stroke: CARD_INK, maxW: R * 1.5 });
  g.restore();
}
// pop-in label: appears at t0 (shot seconds) with a bounce
export function label(g, t, t0, str, x, y, size = 64, o = {}) {
  if (t < t0 || (o.until != null && t > o.until)) return; const k = ease.outBack(clamp((t - t0) / 0.22));
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.04); g.scale(k, k);
  if (o.box) { g.font = `900 ${size}px "Nunito"`; const w = Math.min(E.W * 0.9, g.measureText(str).width + 70); g.fillStyle = o.box; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, 24); g.fill(); g.stroke(); }
  insT(g, str, 0, 2, size, { color: o.color || '#ffffff', stroke: o.box ? null : CARD_INK, maxW: E.W * 0.86 }); g.restore();
}
export function counter(g, t, t0, t1, from, to, x, y, o = {}) {
  if (t < t0) return; const k = ease.out(clamp((t - t0) / Math.max(0.1, t1 - t0))); const n = Math.round(lerp(from, to, k));
  label(g, t, t0, `${o.prefix || ''}${n.toLocaleString('en-US')}${o.suffix || ''}`, x, y, o.size || 110, { box: o.box ?? 'rgba(255,248,236,.94)', color: o.color || '#c8281e', rot: o.rot ?? -0.05 });
}
export function stink(g, x, y, t, o = {}) {
  g.save(); g.strokeStyle = o.color || 'rgba(120,170,60,.85)'; g.lineWidth = o.w || 9; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.9; g.beginPath(); for (let k = 0; k <= 20; k++) { const yy = y - k * 9 - ph * 120; const xx = x + (i - 1) * 70 + Math.sin(k * 0.6 + t * 4 + i) * 16; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  g.restore();
}
export function flashFill(g, t, t0, dur = 0.15, a = 0.6, col = '#fff6d0') { if (t < t0 || t > t0 + dur) return; g.save(); g.globalAlpha = a * (1 - (t - t0) / dur); g.fillStyle = col; g.fillRect(0, 0, E.W, E.H); g.restore(); }

export { E, THREE, toonStage, camMove, ball, cyl, rbox, box, plane, floor, lathe, toon, flat, outline, canvasTex, PR, FX, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, voidBg, sunnySky, sunnyLook,
  bean, shadeHex, POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, run, point, shrug, nod, reactions, shakeCam, INK };
