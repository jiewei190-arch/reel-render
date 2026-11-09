// shared helpers for "Napoleon Was Defeated by Rabbits" (napoleon-rabbits). Underscore = not auto-loaded.
// Original bean designs (not portraits). Nobody is hurt: no guns are fired, the whips crack in the air, rabbits just swarm.
import { E, wordTime, text, ease, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, outline, rbox, cyl, box, ball, canvasTex, blob } from '/kits/toon3d/toon.js';
import { bean, POSE } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.14) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
const R = 0.48;
const rnd = (seed) => { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
// bicorne hat worn sideways, with a blue-white-red cockade. hat(b) puts it on a bean; .bicorne is a free prop.
export function bicorne(o = {}) { const g = new THREE.Group(); const geo = new THREE.CylinderGeometry(R * 1.3, R * 1.3, R * 0.42, 28, 1, false, -Math.PI / 2, Math.PI); geo.rotateX(-Math.PI / 2);
  const h = new THREE.Mesh(geo, toon(o.color || '#1e1c22')); h.scale.set(1.35, 0.75, 1); h.castShadow = true; g.add(h);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(R * 1.3, R * 0.04, 6, 28, Math.PI), toon('#d4a73a')); trim.scale.set(1.35, 0.75, 1); trim.position.z = R * 0.22; g.add(trim);
  [['#2a4a9a', 0.17], ['#f4f0e6', 0.11], ['#c8302c', 0.06]].forEach(([c, r], i) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(R * r * 1.4, R * r * 1.4, 0.02, 20), toon(c)); d.rotation.x = Math.PI / 2; d.position.set(R * 0.75, R * 0.55, R * 0.22 + 0.01 * (i + 1)); d.userData.noOutline = true; g.add(d); });
  outline(g, { px: 2.6 }); return g; }
export function wearHat(b, hat) { hat.position.set(0, R * 0.55, -R * 0.05); hat.rotation.set(-0.08, 0, 0); b.parts.head.add(hat); b.hat = hat; return hat; }
// characters
export const napoleon = () => { const b = bean({ name: 'Napoleon', outfit: 'uniform', colors: { main: '#2a3f7a', trim: '#e0b84a', belt: '#f2efe6', legsTop: '#f2efe6' }, skin: 'fair', hair: 'swoop', hairColor: '#3a2618', seed: 91 }); wearHat(b, bicorne()); return b; };
export const berthier = () => { const b = bean({ name: 'Berthier', outfit: 'uniform', colors: { main: '#2a3f7a', trim: '#e0b84a', belt: '#c8302c', legsTop: '#f2efe6' }, skin: 'light', hair: 'curly', hairColor: '#6a4428', seed: 92 }); const h = bicorne(); h.scale.setScalar(0.85); wearHat(b, h); return b; };
export const coachman = (i = 0) => bean({ name: 'Coachman', outfit: 'tunic', colors: { main: ['#3f6a3a', '#6a4a2a'][i % 2], belt: '#2a1c15' }, head: 'cap', headColor: '#2a2a2a', skin: ['tan', 'olive'][i % 2], hair: 'bowl', hairColor: '#2a1c15', moustache: i ? false : '#3a2618', seed: 95 + i });
// a long riding crop / whip held in the right hand (stick + a curly lash that cracks in the air)
export function crop(len = 1.1) { const g = new THREE.Group(); const s = cyl(0.025, 0.018, len, '#3a2416', 0, len / 2, 0, 8); g.add(s); outline(g, { px: 2.2 }); return g; }
// RABBIT: toon bunny in the bean style (round body, big head, long ears, big eyes). .update(t, { hop, ph, lid, look, earsBack })
const FUR = [['#f4f0ea', '#f2b8c0'], ['#a8825c', '#e8b0a0'], ['#9a9a9e', '#e8b0b8'], ['#e8d6b8', '#f2b8c0'], ['#5a4a42', '#d89a9a']];
export function rabbit(o = {}) { const seed = o.seed ?? 1, r = rnd(seed); const [fur, pink] = FUR[o.fur ?? Math.floor(r() * FUR.length)];
  const root = new THREE.Group(), rig = new THREE.Group(); root.add(rig); const sc = (o.scale || 1) * 0.55; rig.scale.setScalar(sc);
  const body = ball(0.42, fur, 0, 0.42, -0.08); body.scale.set(1, 0.95, 1.1); rig.add(body);
  const tail = ball(0.14, '#ffffff', 0, 0.45, -0.52); rig.add(tail);
  const head = new THREE.Group(); head.position.set(0, 0.95, 0.18); rig.add(head);
  const sk = ball(0.36, fur); sk.scale.set(1.05, 0.95, 0.95); head.add(sk);
  const ears = []; for (const s of [1, -1]) { const ep = new THREE.Group(); ep.position.set(s * 0.14, 0.28, -0.04); head.add(ep); const e = ball(0.1, fur, 0, 0.32, 0); e.scale.set(1, 3.4, 0.6); ep.add(e); const ei = ball(0.06, pink, 0, 0.3, 0.05); ei.scale.set(1, 3.6, 0.3); ei.userData.noOutline = true; ep.add(ei); ep.rotation.z = -s * 0.18; ears.push(ep); }
  const eyes = []; for (const s of [1, -1]) { const w = ball(0.11, '#fbf8f2', s * 0.15, 0.06, 0.27); w.material = toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 }); w.userData.noOutline = true; head.add(w); const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshBasicMaterial({ color: '#1a1214' })); p.position.set(s * 0.15, 0.06, 0.35); head.add(p); const lid = new THREE.Mesh(new THREE.SphereGeometry(0.118, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(fur)); lid.position.set(s * 0.15, 0.06, 0.27); lid.userData.noOutline = true; head.add(lid); eyes.push({ w, p, lid, s }); }
  const nose = ball(0.045, pink, 0, -0.06, 0.34); nose.userData.noOutline = true; head.add(nose);
  for (const s of [1, -1]) { const ch = ball(0.07, '#ffffff', s * 0.05, -0.12, 0.31); ch.userData.noOutline = true; head.add(ch); }
  const feet = []; for (const s of [1, -1]) { const f = ball(0.11, fur, s * 0.2, 0.08, 0.12); f.scale.set(1, 0.7, 1.7); rig.add(f); feet.push(f); const fp = ball(0.08, fur, s * 0.13, 0.2, 0.3); fp.scale.set(1, 1.2, 1); rig.add(fp); }
  outline(rig, { px: 2.4 }); const b = blob(0.32 * (o.scale || 1), 0.3); root.add(b);
  root.head = head; root.eyes = eyes.map(E => ({ eg: E.w })); root.headR = 0.36 * sc; root.height = 1.4 * sc; root.ph = r() * 3;
  root.update = (t, u = {}) => { const { hop = 0, ph = root.ph, lid = 0.15, look = [0, 0], earsBack = 0, speed = 3.2 } = u; const c = (t * speed + ph) % 1; const up = hop * Math.sin(Math.PI * c);
    rig.position.y = up * 0.45; rig.rotation.x = hop * (c < 0.5 ? -0.25 : 0.2) * Math.sin(Math.PI * c); const sq = 1 - hop * 0.12 * Math.cos(Math.PI * 2 * c); body.scale.set(1 / Math.sqrt(sq), 0.95 * sq, 1.1);
    ears.forEach((e, i) => { e.rotation.x = -0.15 - earsBack * 0.9 - hop * 0.4 * Math.sin(Math.PI * c) + Math.sin(t * 5 + ph + i) * 0.05; });
    const blink = ((t + ph * 1.7) % 3.3) < 0.12 ? 1 : 0; eyes.forEach(E => { E.p.position.set(E.s * 0.15 + look[0] * 0.05, 0.06 + look[1] * 0.05, 0.35); E.lid.visible = lid > 0.4; E.w.scale.y = blink ? 0.15 : 1; E.p.visible = !blink; });
    head.rotation.y = Math.sin(t * 2 + ph) * 0.15 * (1 - hop); };
  root.update(0); return root; }
// a swarm of rabbits in an area [x0, x1, z0, z1]
export function warren(st, n, area, seed = 1, o = {}) { const r = rnd(seed); const out = []; for (let i = 0; i < n; i++) { const b = rabbit({ seed: seed * 50 + i, scale: 0.85 + r() * 0.3, ...o }); b.home = [area[0] + r() * (area[1] - area[0]), area[2] + r() * (area[3] - area[2])]; b.position.set(b.home[0], 0, b.home[1]); b.rotation.y = (r() - 0.5) * 1.2; st.add(b); out.push(b); } return out; }
// rabbits running toward a target point: progress k (0..1) along their own lanes
export function charge(list, t, target, k, o = {}) { list.forEach((b, i) => { const [hx, hz] = b.home; const tx = target[0] + Math.sin(i * 2.3) * (o.spread ?? 1.1), tz = target[1] + Math.cos(i * 1.7) * (o.spread ?? 1.1) * 0.6; const kk = clamp(k * (1.1 + (i % 5) * 0.08));
  b.position.set(hx + (tx - hx) * kk, 0, hz + (tz - hz) * kk); b.rotation.y = Math.atan2(tx - hx, tz - hz); b.update(t, { hop: kk < 1 ? 1 : 0.5, speed: 3.4, lid: 0.05, look: [0, 0.3] }); }); }
// wooden cage with a front door that drops open (k 0..1)
export function cage() { const g = new THREE.Group(); g.add(rbox(1.3, 0.1, 0.9, '#8a5a32', 0, 0.05, 0), rbox(1.3, 0.1, 0.9, '#8a5a32', 0, 0.85, 0)); for (const x of [-0.6, 0.6]) for (const z of [-0.4, 0.4]) g.add(cyl(0.04, 0.04, 0.8, '#6a4228', x, 0.45, z, 8));
  for (let i = 0; i < 6; i++) g.add(cyl(0.015, 0.015, 0.8, '#5a3a22', -0.5 + i * 0.2, 0.45, -0.42, 6)); const door = new THREE.Group(); door.position.set(0, 0.1, 0.44); for (let i = 0; i < 6; i++) door.add(cyl(0.015, 0.015, 0.72, '#5a3a22', -0.5 + i * 0.2, 0.36, 0, 6)); door.add(rbox(1.2, 0.05, 0.05, '#6a4228', 0, 0.72, 0)); g.add(door);
  outline(g, { px: 2.2 }); g.add(blob(0.9, 0.25)); g.door = door; g.open = (k) => { door.rotation.x = k * 1.5; }; return g; }
// the imperial carriage (dark green + gold), parked; .doorOpen(k)
export function carriage() { const g = new THREE.Group(); g.add(rbox(2.2, 1.4, 1.3, '#2f5a3a', 0, 1.55, 0, 0.12), rbox(2.35, 0.14, 1.45, '#d4a73a', 0, 2.3, 0, 0.05), rbox(2.0, 0.12, 1.2, '#2f5a3a', 0, 2.42, 0, 0.05));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.55), toon('#2a2a3a')); win.position.set(0.15, 1.8, 0.66); win.userData.noOutline = true; g.add(win);
  const emb = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), toon('#d4a73a')); emb.position.set(-0.6, 1.5, 0.66); emb.userData.noOutline = true; g.add(emb);
  for (const x of [-0.85, 0.85]) for (const z of [-0.72, 0.72]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 8, 24), toon('#7a1e24')); w.position.set(x, 0.48, z); g.add(w); const hub = cyl(0.08, 0.08, 0.1, '#d4a73a', x, 0.48, z); hub.rotation.x = Math.PI / 2; g.add(hub); for (let i = 0; i < 4; i++) { const sp = cyl(0.02, 0.02, 0.8, '#7a1e24', x, 0.48, z, 6); sp.rotation.z = i * Math.PI / 4; g.add(sp); } }
  g.add(rbox(0.5, 0.12, 0.6, '#5a3a22', 0.6, 0.85, 0.85, 0.03));   // step
  outline(g, { px: 2.6 }); g.add(blob(1.6, 0.3)); g.win = win; return g; }
// field desk + treaty scroll + quill; tricolour flags; a striped tent
export function flag(o = {}) { const t = canvasTex(192, 128, (g, W, H) => { ['#2a4a9a', '#f4f0e6', '#c8302c'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / 3, 0, W / 3 + 1, H); }); });
  const grp = new THREE.Group(); grp.add(cyl(0.035, 0.035, 3.2, '#6a4228', 0, 1.6, 0, 8)); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.72, 10, 1), toon('#ffffff', { map: t, side: THREE.DoubleSide })); f.position.set(0.56, 2.8, 0); f.userData.noOutline = true; grp.add(f); grp.cloth = f; outline(grp.children[0], { px: 2.2 });
  grp.update = (t) => { const p = f.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(t * 4 + x * 4) * 0.08 * (x + 0.55)); } p.needsUpdate = true; }; return grp; }
export function tent() { const g = new THREE.Group(); const t = canvasTex(256, 64, (x, W, H) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#f4f0e6' : '#2a4a9a'; x.fillRect(i * W / 16, 0, W / 16 + 1, H); } });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 1.8, 32, 1, true), toon('#ffffff', { map: t, side: THREE.DoubleSide })); wall.position.y = 0.9; const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.6, 32), toon('#f4f0e6')); roof.position.y = 2.6; g.add(wall, roof); outline(g, { px: 2.4 }); return g; }
// THE MEADOW (sunny): grass, sky dome + clouds, trees, a tent, flags, the carriage on the right
export function meadow(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0] }); const sky = sunnySky(st, { clouds: 9, seed: o.seed || 5 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), toon('#8fbf5a')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.userData.noOutline = true; st.add(ground);
  const r = rnd(o.seed || 5); for (let i = 0; i < 9; i++) { const tr = new THREE.Group(); const k = 0.8 + r() * 0.5; tr.add(cyl(0.18 * k, 0.24 * k, 2.2 * k, '#7a5032', 0, 1.1 * k, 0)); const c = new THREE.Mesh(new THREE.SphereGeometry(1.3 * k, 20, 14), toon(['#4f8a3a', '#5f9a42', '#3f7a34'][i % 3])); c.position.y = 3.0 * k; c.scale.y = 1.25; c.castShadow = true; tr.add(c); outline(tr, { px: 2.2 }); const a = (i / 9) * Math.PI - Math.PI; tr.position.set(Math.cos(a) * (14 + r() * 6), 0, -8 - r() * 10); st.add(tr); }
  const tn = tent(); tn.position.set(-5.5, 0, -7); st.add(tn); const flags = [flag(), flag()]; flags[0].position.set(-3.2, 0, -5.5); flags[1].position.set(-7.8, 0, -5.8); st.add(...flags);
  const s = { stage: st, sky, flags, update: (t) => { sky.update(t); flags.forEach(f => f.update(t)); } };
  if (o.carriage) { s.car = carriage(); s.car.position.set(...o.carriage); s.car.rotation.y = o.carRot ?? -0.3; st.add(s.car); }
  return s; }
