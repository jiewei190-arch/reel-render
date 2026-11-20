// The Secret Cinema Under Paris — shared assets: limestone tunnel, ossuary wall (tidy toon bones), the cave cinema
// (screen, red seats, projector, bar, restaurant, string lights), film tins, phone + cable, speaker, the note,
// police beans with torches, and 2D overlays (flashlight darkness mask, hook text, stamps, map card).
// Tone guard: no gore, ossuary drawn as tidy stacked bones; group members only as silhouettes; no real logos/insignia.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage, camMove } from '/kits/toon3d/toon.js';
import { bean, shadeHex, POSE, EXPR, addPose, mixPose, mixExpr, idle, point, tremble } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { glow } from '/kits/toon3d/fx.js';
import { project } from '/kits/toon3d/react.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } const v = g - info.shot.start; return v > info.dur + 0.5 ? fb : v; };

// ---------------------------------------------------------------- textures
const _tc = new Map(); const cached = (k, f) => (_tc.has(k) ? _tc.get(k) : (_tc.set(k, f()), _tc.get(k)));
export const limestoneTex = (rep = [4, 2]) => cached('lime' + rep, () => canvasTex(512, 512, (g, W, H) => {
  g.fillStyle = '#cdbb98'; g.fillRect(0, 0, W, H); const r = rng(11);
  const rows = 8, rh = H / rows; for (let y = 0; y < rows; y++) { let x = -(y % 2) * 40; while (x < W) { const w = 90 + r() * 70; const c = ['#d6c4a0', '#c8b490', '#cfbd98', '#bfa984'][Math.floor(r() * 4)];
    g.fillStyle = c; g.fillRect(x + 3, y * rh + 3, w - 6, rh - 6); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(120,96,60,0.18)'; g.beginPath(); g.arc(x + r() * w, y * rh + r() * rh, 2 + r() * 4, 0, 7); g.fill(); } x += w; } }
  g.strokeStyle = 'rgba(90,70,45,0.55)'; g.lineWidth = 4; for (let y = 0; y <= rows; y++) { g.beginPath(); g.moveTo(0, y * rh); g.lineTo(W, y * rh); g.stroke(); }
}, { repeat: rep }));
export const groundTex = (rep = [6, 6]) => cached('gnd' + rep, () => canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#9a8566'; g.fillRect(0, 0, W, H); const r = rng(5);
  for (let i = 0; i < 160; i++) { g.fillStyle = r() < 0.5 ? 'rgba(70,55,38,0.25)' : 'rgba(200,180,140,0.2)'; g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 5, 0, 7); g.fill(); } }, { repeat: rep }));
// ossuary: tidy rows of bone ends + a band of cartoon skulls (round, friendly, no gore)
export const ossuaryTex = (rep = [3, 1]) => cached('oss' + rep, () => canvasTex(1024, 512, (g, W, H) => {
  g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, W, H);
  const boneRow = (y0, rh) => { for (let y = y0; y < y0 + rh; y += 26) for (let x = (y / 26 % 2) * 14; x < W; x += 28) { g.fillStyle = '#e8dcc0'; g.beginPath(); g.ellipse(x, y, 12, 11, 0, 0, 7); g.fill(); g.strokeStyle = '#8a7a5e'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#d2c4a4'; g.beginPath(); g.arc(x - 3, y - 2, 4, 0, 7); g.fill(); } };
  const skulls = (y) => { for (let x = 40; x < W; x += 80) { g.fillStyle = '#efe5cc'; g.strokeStyle = '#7a6a50'; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, 32, 30, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(x - 18, y + 14, 36, 20, 6); g.fill(); g.stroke(); g.fillStyle = '#4a3a2c'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * 12, y - 2, 9, 10, 0, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(x, y + 8); g.lineTo(x - 4, y + 15); g.lineTo(x + 4, y + 15); g.closePath(); g.fill(); } };
  boneRow(14, 150); skulls(205); boneRow(250, 120); skulls(405); boneRow(450, 70);
}, { repeat: rep }));
// the film-noir frame on the screen: a fedora silhouette in a doorway, venetian-blind light, grainy grey
export const noirTex = () => cached('noir', () => canvasTex(768, 432, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#d8d8d4'); gr.addColorStop(1, '#8a8a88'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(30,30,32,0.55)'; for (let i = 0; i < 9; i++) { g.save(); g.translate(W * 0.15, 0); g.transform(1, 0, -0.5, 1, 0, 0); g.fillRect(i * 52, 0, 26, H); g.restore(); }
  g.fillStyle = '#1a1a1c'; g.fillRect(W * 0.58, H * 0.12, W * 0.26, H * 0.88);
  g.fillStyle = '#e4e4e0'; g.fillRect(W * 0.6, H * 0.15, W * 0.22, H * 0.85);
  g.fillStyle = '#121214'; const cx = W * 0.71; g.beginPath(); g.ellipse(cx, H * 0.36, 34, 40, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(cx, H * 0.3, 70, 14, 0, 0, 7); g.fill(); g.fillRect(cx - 38, H * 0.18, 76, 46);
  g.beginPath(); g.moveTo(cx - 80, H); g.lineTo(cx - 54, H * 0.47); g.lineTo(cx + 54, H * 0.47); g.lineTo(cx + 80, H); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, 10); g.fillRect(0, H - 10, W, 10);
}));
export const noteTex = () => cached('note', () => canvasTex(512, 360, (g, W, H) => {
  g.fillStyle = '#f6f1e2'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,140,180,0.35)'; g.lineWidth = 2; for (let y = 60; y < H; y += 40) { g.beginPath(); g.moveTo(20, y); g.lineTo(W - 20, y); g.stroke(); }
  g.fillStyle = '#1e1a2a'; g.font = '700 70px "Fredoka", sans-serif'; g.textAlign = 'center'; g.save(); g.translate(W / 2, H / 2); g.rotate(-0.05); g.fillText('NE CHERCHEZ', 0, -24); g.fillText('PAS', 0, 58); g.restore();
}));
const labelTex = (txt, bg, fg) => cached('lbl' + txt + bg, () => canvasTex(256, 96, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 46px "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + 2); }));

// ---------------------------------------------------------------- PEOPLE
// French-style police officer (generic navy uniform + cap, no insignia), with a torch in the right hand
export function cop(o = {}) {
  const b = bean({ name: 'Officer', outfit: 'uniform', head: 'cap', headColor: '#1d2742', skin: o.skin || 'fair', hair: o.hair || 'bowl', hairColor: o.hairColor || '#3a2618', moustache: o.moustache, colors: { main: '#2c3d66', belt: '#1a1a22' }, seed: o.seed || 5 });
  const torch = new THREE.Group(); torch.add(cyl(0.07, 0.06, 0.42, '#2a2a30', 0, 0, 0, 12), cyl(0.1, 0.08, 0.12, '#3a3a42', 0, 0.25, 0, 14));
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.085, 18), flat('#fff6c8')); lens.position.y = 0.315; lens.rotation.x = -Math.PI / 2; lens.userData.noOutline = true; torch.add(lens);
  outline(torch, { px: 2.6 }); torch.rotation.x = Math.PI / 2; b.torch = torch; b.lens = lens;
  b.place = (st) => { st.add(torch); };
  b.syncTorch = () => { b.hand.R.getWorldPosition(torch.position); const q = new THREE.Quaternion(); b.getWorldQuaternion(q); torch.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.15, 0, 0))); };
  return b;
}
export const torchPose = (t, seed = 1, up = 0.15) => addPose(point(POSE.stand, 'R', 1, { up }), idle(t, seed, 0.5));

// ---------------------------------------------------------------- SETS
// limestone tunnel running into -Z: vaulted half-cylinder, stone floor, optional ossuary walls
export function tunnel(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const R = o.r || 2.4, L = o.len || 40;
  const wallTex = o.bones ? ossuaryTex([6, 1]) : limestoneTex([10, 2]);
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 30, 1, true, -Math.PI / 2, Math.PI), toon('#ffffff', { map: limestoneTex([10, 2]), side: THREE.BackSide }));
  vault.rotation.x = Math.PI / 2; vault.position.set(0, 1.6, -L / 2 + 6); vault.receiveShadow = true; g.add(vault);
  for (const s of [-1, 1]) { const w = plane(L, 2.2, '#ffffff', s * (R - 0.45), 1.1, -L / 2 + 6); w.material = toon('#ffffff', { map: wallTex, side: THREE.DoubleSide }); w.rotation.y = -s * Math.PI / 2; g.add(w); }
  const f = floor(R * 2, L, '#ffffff', 0, -L / 2 + 6); f.material = toon('#ffffff', { map: groundTex([2, 14]) }); g.add(f);
  // little street-name plaques (the catacombs are signed like streets)
  const r = rng(o.seed || 3); for (let i = 0; i < 4; i++) { const p = rbox(0.7, 0.28, 0.04, '#2a3a6a', -R + 0.05, 2.3, -3 - i * 8, 0.02); p.rotation.y = Math.PI / 2; g.add(p); }
  return { group: g, update() {} };
}
// the cave cinema: vaulted chamber, screen on the back wall (-Z), red seats facing it, projector behind, bar left, restaurant right
export function cinema(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const full = o.empty !== true;
  const f = floor(26, 26, '#ffffff', 0, 0); f.material = toon('#ffffff', { map: groundTex([6, 6]) }); g.add(f);
  const back = plane(26, 9, '#ffffff', 0, 4.5, -8); back.material = toon('#ffffff', { map: limestoneTex([6, 2]) }); g.add(back);
  for (const s of [-1, 1]) { const w = plane(26, 9, '#ffffff', s * 9.5, 4.5, 0); w.material = toon('#ffffff', { map: limestoneTex([6, 2]), side: THREE.DoubleSide }); w.rotation.y = -s * Math.PI / 2; g.add(w); }
  const ceil = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 26, 30, 1, true, -Math.PI / 2, Math.PI), toon('#ffffff', { map: limestoneTex([10, 3]), side: THREE.BackSide })); ceil.rotation.x = Math.PI / 2; ceil.rotation.z = 0; ceil.position.set(0, 3.2, 0); ceil.scale.set(1, 1, 0.45); g.add(ceil);
  const out = { group: g, items: {} };
  // screen frame always (bare frame when empty)
  const frame = rbox(7.4, 4.3, 0.2, '#1c1a1e', 0, 3.6, -7.85, 0.05); g.add(frame);
  if (full) {
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 3.94), new THREE.MeshBasicMaterial({ map: noirTex(), color: new THREE.Color('#ffffff') })); scr.position.set(0, 3.6, -7.7); scr.userData.noOutline = true; g.add(scr); out.items.screen = scr;
    const scrGlow = glow(9, '#cfd8ff', 0.18); scrGlow.position.set(0, 3.6, -7.4); g.add(scrGlow);
    // seats: 3 rows x 6, red velvet with a dark frame
    const seats = new THREE.Group(); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const x = -3.0 + i * 1.2, z = -2.6 + r * 1.5, y = r * 0.18;
      const s = new THREE.Group(); s.add(rbox(0.95, 0.22, 0.85, '#b3262e', 0, 0.55 + y, 0, 0.08), rbox(0.95, 0.95, 0.2, '#c22f37', 0, 1.05 + y, 0.38, 0.08), rbox(0.12, 0.45, 0.8, '#3a2224', -0.53, 0.55 + y, 0.05, 0.04), rbox(0.12, 0.45, 0.8, '#3a2224', 0.53, 0.55 + y, 0.05, 0.04));
      if (y) s.add(rbox(1.2, y, 1.4, '#7a6650', 0, y / 2, 0.1, 0.02)); s.position.set(x, 0, z); seats.add(s); }
    outline(seats, { px: 2.4 }); g.add(seats); out.items.seats = seats;
    // projector on a stand behind the seats, beam to the screen
    if (o.noProj) {} else {
    const proj = new THREE.Group(); proj.add(rbox(0.9, 0.6, 1.1, '#3a3e48', 0, 1.9, 0, 0.06), cyl(0.16, 0.18, 0.35, '#22242a', 0, 1.9, -0.7, 16).rotateX(Math.PI / 2));
    for (const z of [-0.3, 0.35]) { const reel = cyl(0.45, 0.45, 0.08, '#5a5e68', 0, 2.65, z, 24); reel.rotation.z = Math.PI / 2; proj.add(reel); }
    proj.add(cyl(0.05, 0.05, 1.6, '#2a2a30', 0, 0.8, 0, 8), cyl(0.5, 0.5, 0.06, '#2a2a30', 0, 0.03, 0, 18)); proj.position.set(0, 0, 3.6); outline(proj, { px: 2.6 }); g.add(proj); out.items.projector = proj;
    out.reels = proj.children.filter(c => c.geometry?.parameters?.radiusTop === 0.45);
    const beamGeo = new THREE.ConeGeometry(2.6, 11.3, 4, 1, true); beamGeo.rotateY(Math.PI / 4); beamGeo.translate(0, -11.3 / 2, 0); beamGeo.rotateX(Math.PI / 2);
    const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: '#fff4d0', transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    beam.scale.set(1.35, 0.78, 1); beam.position.set(0, 1.9, 2.9); beam.lookAt(0, 3.6, -7.7); beam.rotateY(Math.PI); beam.userData.noOutline = true; g.add(beam); out.items.beam = beam; }
    // bar (left): counter, shelf of bottles, stools
    const bar = new THREE.Group(); bar.add(rbox(1.0, 1.25, 4.2, '#6a3e26', 0, 0.62, 0, 0.06), rbox(1.2, 0.1, 4.4, '#8a5a36', 0, 1.3, 0, 0.03));
    const shelf = rbox(0.4, 0.08, 4.0, '#5a3420', -1.4, 2.2, 0, 0.02); bar.add(shelf, rbox(0.4, 0.08, 4.0, '#5a3420', -1.4, 2.9, 0, 0.02));
    const bc = ['#3a7a3a', '#a33a2a', '#d8a030', '#2a4a8a', '#e0e0e0', '#6a2a5a']; const rr = rng(9);
    for (const y of [2.26, 2.96]) for (let i = 0; i < 9; i++) { const c = bc[Math.floor(rr() * bc.length)], h = 0.35 + rr() * 0.2; const bt = new THREE.Group(); bt.add(cyl(0.08, 0.08, h, c, 0, h / 2, 0, 10), cyl(0.03, 0.05, 0.14, c, 0, h + 0.07, 0, 8)); bt.position.set(-1.4, y, -1.8 + i * 0.45); bar.add(bt); }
    for (let i = 0; i < 4; i++) { const gl = cyl(0.07, 0.05, 0.16, '#cfe8f0', 0.1, 1.43, -1.3 + i * 0.8, 10); bar.add(gl); }
    for (let i = 0; i < 3; i++) { const sl = PR.stool({ color: '#7a4a2a', h: 0.9 }); sl.position.set(0.95, 0, -1.2 + i * 1.2); bar.add(sl); }
    bar.position.set(-7.6, 0, 1.0); outline(bar, { px: 2.4 }); g.add(bar); out.items.bar = bar;
    // restaurant (right): round tables with cloths + candle, chairs
    const rest = new THREE.Group(); const chair = () => { const c = new THREE.Group(); c.add(rbox(0.55, 0.08, 0.55, '#7a4a2a', 0, 0.62, 0, 0.02), rbox(0.55, 0.7, 0.08, '#7a4a2a', 0, 1.0, -0.26, 0.02)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.add(cyl(0.03, 0.03, 0.62, '#5a3420', sx * 0.22, 0.31, sz * 0.22, 6)); return c; };
    for (const [x, z] of [[0, -1.6], [0, 1.4]]) { const tb = new THREE.Group(); tb.add(cyl(0.85, 0.85, 0.06, '#f2ece0', 0, 1.0, 0, 28), cyl(0.9, 0.95, 0.35, '#e8e0d0', 0, 0.82, 0, 28), cyl(0.06, 0.08, 0.95, '#3a2a20', 0, 0.48, 0, 10));
      tb.add(cyl(0.05, 0.05, 0.22, '#f4f0e0', 0, 1.14, 0, 10)); const fl = ball(0.05, '#ffd060', 0, 1.3, 0, 10); fl.material = flat('#ffd870'); fl.userData.noOutline = true; tb.add(fl);
      for (const [a, d] of [[0, 1], [Math.PI, 1], [Math.PI / 2, 1], [-Math.PI / 2, 1]]) { const c = chair(); c.position.set(Math.sin(a) * 1.25, 0, Math.cos(a) * 1.25); c.rotation.y = a + Math.PI; tb.add(c); }
      for (const a of [0.6, 2.5, 4.2]) { tb.add(cyl(0.18, 0.16, 0.03, '#ffffff', Math.sin(a) * 0.5, 1.05, Math.cos(a) * 0.5, 16)); }
      tb.position.set(x, 0, z); rest.add(tb); }
    rest.position.set(6.6, 0, 0.8); outline(rest, { px: 2.4 }); g.add(rest); out.items.rest = rest;
    // string lights across the vault
    const bulbs = new THREE.Group(); for (let k = 0; k < 2; k++) for (let i = 0; i <= 18; i++) { const u = i / 18, x = lerp(-9, 9, u), y = 6.2 - Math.sin(u * Math.PI) * 1.2, z = -4 + k * 5; const b = ball(0.09, '#ffe08a', x, y, z, 8); b.material = flat(['#ffe08a', '#ffb860', '#fff0c0'][i % 3]); b.userData.noOutline = true; bulbs.add(b); }
    g.add(bulbs); out.items.bulbs = bulbs;
  } else {
    // dismantled: bare floor marks where the seats stood, two cut wires dangling from the wall
    for (let r = 0; r < 3; r++) { const m = floor(7.2, 0.9, '#857154', 0, -2.6 + r * 1.5); m.position.y = 0.005; g.add(m); }
    for (const x of [-1.2, 1.4]) { const wire = cyl(0.025, 0.025, 2.6, '#141418', x, 5.4, -7.6, 6); wire.rotation.z = (x > 0 ? 1 : -1) * 0.12; g.add(wire); const tip = ball(0.06, '#c08030', x + (x > 0 ? -0.15 : 0.15), 4.1, -7.6, 8); g.add(tip); }
  }
  return out;
}
// a stack of film tins with labels
export function filmTins(o = {}) {
  const g = new THREE.Group(); const labels = [['THRILLER', '#b8322a'], ['FILM NOIR', '#1e1e24'], ['THRILLER', '#b8322a'], ['FILM NOIR', '#1e1e24'], ['FILM NOIR', '#1e1e24']];
  labels.forEach(([txt, c], i) => { const tin = new THREE.Group(); const can = cyl(0.7, 0.7, 0.16, '#9aa0a8', 0, 0, 0, 30); tin.add(can); const lid = cyl(0.55, 0.55, 0.012, '#b8bec6', 0, 0.086, 0, 30); lid.userData.noOutline = true; tin.add(lid);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), toon('#ffffff', { map: labelTex(txt, c, '#ffffff') })); lb.rotation.x = -Math.PI / 2; lb.position.y = 0.095; lb.userData.noOutline = true; tin.add(lb);
    tin.position.set((i % 2) * 0.06 - 0.03, 0.08 + i * 0.17, (i % 3) * 0.05); tin.rotation.y = i * 0.5; g.add(tin); });
  outline(g, { px: 2.4 }); return g;
}
export function rollingTin() { const g = new THREE.Group(); const can = cyl(0.7, 0.7, 0.16, '#9aa0a8', 0, 0, 0, 30); g.add(can); for (const s of [-1, 1]) { const lb = new THREE.Mesh(new THREE.CircleGeometry(0.45, 24), toon('#ffffff', { map: labelTex('FILM NOIR', '#1e1e24', '#ffffff') })); lb.position.y = s * 0.085; lb.rotation.x = -s * Math.PI / 2; lb.userData.noOutline = true; g.add(lb); } outline(g, { px: 2.4 }); return g; }
// an old desk phone on a crate, cable running off into the dark
export function phoneSet(st) {
  const g = new THREE.Group(); st.add(g); const cr = PR.crate({ s: 0.9, color: '#7a6a3a' }); g.add(cr);
  const ph = new THREE.Group(); ph.add(rbox(0.6, 0.22, 0.5, '#1e1e24', 0, 1.02, 0, 0.06), rbox(0.42, 0.1, 0.4, '#2a2a32', 0, 1.16, 0, 0.04));
  const dial = cyl(0.16, 0.16, 0.03, '#d8d0c0', 0, 1.15, 0.08, 20); dial.rotation.x = 0.35; ph.add(dial);
  const hand = new THREE.Group(); hand.add(rbox(0.7, 0.1, 0.14, '#1e1e24', 0, 0, 0, 0.05), rbox(0.16, 0.12, 0.18, '#1e1e24', -0.32, -0.06, 0, 0.05), rbox(0.16, 0.12, 0.18, '#1e1e24', 0.32, -0.06, 0, 0.05)); hand.position.set(0, 1.32, -0.05); ph.add(hand);
  outline(ph, { px: 2.6 }); g.add(ph);
  const mk = (pts, c, r) => { const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 80, r, 8), toon(c)); tube.castShadow = true; outline(tube, { px: 2.2 }); g.add(tube); return tube; };
  mk([[0.2, 1.0, -0.2], [0.5, 0.6, -0.5], [0.8, 0.04, -1.0], [1.4, 0.04, -3], [0.6, 0.04, -6], [1.2, 0.04, -10], [0.4, 0.04, -16]], '#141418', 0.035);
  mk([[-0.4, 0.04, 1.5], [-0.9, 0.04, -1], [-0.3, 0.04, -4], [-1.0, 0.04, -8], [-0.5, 0.04, -14]], '#2a1a12', 0.05);
  return { group: g, handset: hand };
}
// a little loudspeaker box on a crate
export function speaker() { const g = new THREE.Group(); const cr = PR.crate({ s: 0.9, color: '#6a5a32' }); g.add(cr);
  const bx = rbox(0.8, 1.0, 0.6, '#3a2a22', 0, 1.4, 0, 0.06); g.add(bx); const cone = cyl(0.3, 0.12, 0.08, '#1a1418', 0, 1.3, 0.31, 24); cone.rotation.x = Math.PI / 2; g.add(cone);
  const tw = cyl(0.1, 0.06, 0.06, '#1a1418', 0, 1.72, 0.31, 16); tw.rotation.x = Math.PI / 2; g.add(tw); outline(g, { px: 2.6 }); g.cone = cone; return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
// darkness with flashlight pools. pools: [{ p:[x,y,z] world | {x,y} screen, r (px), from: {x,y} screen (beam origin) }]
let _mc = null;
export function torchDark(g, st, pools, o = {}) {
  const cv = g.canvas; if (!_mc) _mc = document.createElement('canvas'); if (_mc.width !== cv.width || _mc.height !== cv.height) { _mc.width = cv.width; _mc.height = cv.height; }
  const k = cv.width / E.W, x = _mc.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height);
  x.fillStyle = alpha(o.color || '#05060c', o.dark ?? 0.9); x.fillRect(0, 0, cv.width, cv.height); x.setTransform(k, 0, 0, k, 0, 0); x.globalCompositeOperation = 'destination-out';
  const P = pools.map(pl => { const s = pl.p ? project(st, pl.p) : pl; return { x: s.x, y: s.y, r: pl.r || 260, from: pl.from, a: pl.a ?? 1 }; });
  for (const p of P) {
    if (p.from) { // the beam: a soft wedge from the torch to the pool
      const dx = p.x - p.from.x, dy = p.y - p.from.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      const gr = x.createLinearGradient(p.from.x, p.from.y, p.x, p.y); gr.addColorStop(0, `rgba(0,0,0,${0.55 * p.a})`); gr.addColorStop(1, `rgba(0,0,0,${0.3 * p.a})`); x.fillStyle = gr;
      x.beginPath(); x.moveTo(p.from.x + nx * 18, p.from.y + ny * 18); x.lineTo(p.x + nx * p.r * 0.8, p.y + ny * p.r * 0.8); x.lineTo(p.x - nx * p.r * 0.8, p.y - ny * p.r * 0.8); x.lineTo(p.from.x - nx * 18, p.from.y - ny * 18); x.closePath(); x.fill(); }
    const gr = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); gr.addColorStop(0, `rgba(0,0,0,${p.a})`); gr.addColorStop(0.62, `rgba(0,0,0,${0.9 * p.a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
  }
  if (o.extra) for (const p of o.extra) { const gr = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); gr.addColorStop(0, `rgba(0,0,0,${p.a ?? 0.6})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(_mc, 0, 0); g.restore();
  // warm light in the pools + a faint visible beam in the dust
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const p of P) { const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 0.9); gr.addColorStop(0, `rgba(255,236,190,${0.16 * p.a})`); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill();
    if (p.from) { const gr2 = g.createLinearGradient(p.from.x, p.from.y, p.x, p.y); gr2.addColorStop(0, `rgba(255,240,200,${0.22 * p.a})`); gr2.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr2;
      const dx = p.x - p.from.x, dy = p.y - p.from.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d; g.beginPath(); g.moveTo(p.from.x + nx * 14, p.from.y + ny * 14); g.lineTo(p.x + nx * p.r * 0.55, p.y + ny * p.r * 0.55); g.lineTo(p.x - nx * p.r * 0.55, p.y - ny * p.r * 0.55); g.lineTo(p.from.x - nx * 14, p.from.y - ny * 14); g.closePath(); g.fill(); } }
  g.restore();
}
// cinematic dark vignette for the lit cave shots
export function vignette(g, a = 0.55) { const gr = g.createRadialGradient(E.W / 2, E.H * 0.48, E.H * 0.25, E.W / 2, E.H * 0.5, E.H * 0.75); gr.addColorStop(0, 'rgba(6,6,14,0)'); gr.addColorStop(1, `rgba(6,6,14,${a})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }
// top hook caption: 2 lines, each a list of [word, colour]
export function hook2(g, t, lines, o = {}) {
  const y0 = o.y ?? 285, fade = o.until != null ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((ws, i) => { const k = ease.outBack(clamp((t + (o.lead ?? 0.25) - i * 0.15) / 0.3)); const size = (o.sizes && o.sizes[i]) || 70;
    g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (o.gap ?? 112)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    g.font = `900 ${size}px "Nunito", sans-serif`; const sp = size * 0.28; const wd = ws.map(([w]) => g.measureText(w).width); const tot = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let x = -tot / 2;
    ws.forEach(([w, c], j) => { insT(g, w, x + wd[j] / 2, 0, size, { color: c || '#ffffff', stroke: CARD_INK }); x += wd[j] + sp; }); g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.96) * fade;
  g.font = `900 ${s}px "Nunito", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = o.border || col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// cross-section map card: Paris street level, the Trocadéro pin, tunnels below
export function mapCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)) * 0.86; g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.4); g.scale(k, k); g.rotate(-0.02);
  const W = 940, H = 1060; g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 14, -H / 2 + 20, W, H, 30); g.fill();
  g.fillStyle = '#f3e9cf'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 30); g.fill(); g.stroke();
  insT(g, 'PARIS', 0, -H / 2 + 80, 76, { color: CARD_INK });
  // sky + street level
  const gy = -120; g.fillStyle = '#9fd0f2'; g.fillRect(-W / 2 + 30, -H / 2 + 140, W - 60, gy + H / 2 - 140);
  const bl = [[-400, 120], [-330, 170], [-250, 110], [-180, 150], [140, 130], [210, 190], [290, 120], [360, 160]];
  for (const [x, h] of bl) { g.fillStyle = '#c9b8a0'; g.fillRect(x, gy - h, 66, h); g.strokeStyle = CARD_INK; g.lineWidth = 5; g.strokeRect(x, gy - h, 66, h); g.fillStyle = '#5a6a8a'; for (let wy = gy - h + 20; wy < gy - 20; wy += 34) { g.fillRect(x + 12, wy, 14, 18); g.fillRect(x + 40, wy, 14, 18); } }
  // Trocadéro: a low curved colonnade (generic)
  g.fillStyle = '#e8dcc0'; g.beginPath(); g.moveTo(-110, gy); g.lineTo(-110, gy - 70); g.quadraticCurveTo(0, gy - 120, 110, gy - 70); g.lineTo(110, gy); g.closePath(); g.fill(); g.lineWidth = 6; g.stroke();
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 30, gy - 8); g.lineTo(i * 30, gy - 70 - (3 - Math.abs(i)) * 8); g.stroke(); }
  g.fillStyle = '#6a5a44'; g.fillRect(-W / 2 + 30, gy, W - 60, 22);
  // underground: rock with tunnels
  const ug = g.createLinearGradient(0, gy + 22, 0, H / 2 - 30); ug.addColorStop(0, '#b89a70'); ug.addColorStop(1, '#7a6040'); g.fillStyle = ug; g.fillRect(-W / 2 + 30, gy + 22, W - 60, H / 2 - 30 - gy - 22);
  const dig = clamp((t - 0.35) / 0.9);
  g.save(); g.strokeStyle = '#2a1e14'; g.lineWidth = 46; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.85;
  g.beginPath(); g.moveTo(-400, 160); g.lineTo(-150, 160); g.lineTo(-150, 330); g.lineTo(240, 330); g.lineTo(240, 180); g.lineTo(400, 180); g.stroke();
  g.beginPath(); g.moveTo(-40, 330); g.lineTo(-40, 410); g.stroke(); g.restore();
  // the cinema chamber, glowing
  const cx = 60, cy = 240; const pulse = 1 + 0.06 * Math.sin(t * 8);
  g.save(); g.globalAlpha = dig; g.fillStyle = '#ffd25a'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.ellipse(cx, cy, 120 * pulse, 70 * pulse, 0, 0, 7); g.fill(); g.stroke();
  insT(g, 'CINEMA', cx, cy + 4, 44, { color: CARD_INK }); g.restore();
  // dashed drop from the pin to the chamber
  g.save(); g.setLineDash([22, 16]); g.strokeStyle = '#e23b2e'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, gy - 150); g.lineTo(0 + (cx) * dig, gy - 150 + (cy - gy + 150 - 70) * dig); g.stroke(); g.restore();
  // pin
  const pk = ease.outBack(clamp((t - 0.15) / 0.3)); g.save(); g.translate(0, gy - 150); g.scale(pk, pk); g.fillStyle = '#e23b2e'; g.strokeStyle = CARD_INK; g.lineWidth = 6;
  g.beginPath(); g.arc(0, -40, 36, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(0, 10); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -42, 13, 0, 7); g.fill(); g.restore();
  insT(g, 'TROCADÉRO', 0, gy - 250, 56, { color: '#e23b2e', stroke: '#ffffff', a: pk });
  insT(g, 'CATACOMBS', 0, H / 2 - 80, 60, { color: '#ffffff', stroke: CARD_INK, a: dig });
  g.restore();
}
// the note, as a big 2D insert
export function noteCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k); g.rotate(-0.05);
  const W = 820, H = 560; g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(-W / 2 + 16, -H / 2 + 22, W, H);
  g.fillStyle = '#f6f1e2'; g.fillRect(-W / 2, -H / 2, W, H); g.strokeStyle = 'rgba(120,140,180,0.4)'; g.lineWidth = 3; for (let y = -H / 2 + 80; y < H / 2; y += 56) { g.beginPath(); g.moveTo(-W / 2 + 30, y); g.lineTo(W / 2 - 30, y); g.stroke(); }
  g.fillStyle = '#1e1a2a'; g.font = '700 104px "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NE CHERCHEZ', 0, -70); g.fillText('PAS', 0, 60);
  insT(g, '"DO NOT SEARCH"', 0, H / 2 + 80, 64, { color: '#ffd25a', stroke: CARD_INK, a: clamp((t - (o.en ?? 0.4)) / 0.25) });
  g.restore();
}

export { THREE, toonStage, camMove, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, glow, project, bean, POSE, EXPR, addPose, mixPose, mixExpr, idle, point, tremble };
