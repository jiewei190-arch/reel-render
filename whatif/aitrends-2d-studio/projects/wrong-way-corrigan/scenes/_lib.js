// Wrong Way Corrigan: shared assets (underscore = not auto-loaded). The plane is a generic 1930s high-wing monoplane (no
// markings, no logos); the pilot, officials, the Irish officer and the crowd are generic toons (no likeness of real people).
// Nobody is hurt; the plane never crashes. Plus 2D overlays: hook text, stamps, chips, map card, compass card, speech bubble.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- eyes with a real lid
function lidEye(parent, pos, n, size, lidC, ring) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.08, size * 0.62); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg);
  if (ring) { const ir = new THREE.Mesh(sph, flat(ring)); ir.scale.set(0.62, 0.66, 0.1); ir.position.z = 0.93; ir.userData.noOutline = true; pg.add(ir); }
  const p = new THREE.Mesh(sph, flat('#120c10')); p.scale.set(0.4, 0.44, 0.1); p.position.z = 0.97; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.13, 0.13, 0.05); gl.position.set(0.14, 0.18, 1.0); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}

// ---------------------------------------------------------------- PEOPLE (generic toons)
export const officialA = () => bean({ name: 'OfficialA', outfit: 'uniform', head: 'cap', headColor: '#5a5e48', skin: 'fair', hair: 'bowl', moustache: true, colors: { main: '#6a7058', legs: '#4a4e3c' }, seed: 41 });
export const officialB = () => bean({ name: 'OfficialB', outfit: 'uniform', skin: 'tan', hair: 'horseshoe', hairColor: '#7a7570', glasses: true, colors: { main: '#6a6e74', legs: '#4a4e54' }, seed: 43 });

// ---------------------------------------------------------------- SETS
// grey-green office: desk, lamp, filing cabinet, papers. No flags/emblems.
export function office(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#5a4a3e', 0, 0));
  const wall = plane(30, 9, '#7a8070', 0, 4.5, -3); wall.receiveShadow = true; g.add(wall);
  g.add(plane(30, 1.4, '#5e6456', 0, 0.7, -2.98));
  const desk = PR.table({ w: 3.0, d: 1.2, h: 1.0, color: '#5a3a24' }); desk.position.set(0, 0, 0.4); g.add(desk);
  const cab = rbox(1.0, 2.2, 0.8, '#7a7e78', 2.8, 1.1, -2.4, 0.04); g.add(cab); for (let i = 0; i < 3; i++) g.add(rbox(0.3, 0.06, 0.06, '#c9ccd2', 2.8, 0.5 + i * 0.7, -1.98, 0.02));
  const lamp = new THREE.Group(); lamp.add(cyl(0.12, 0.14, 0.04, '#2a3a2a', 0, 0.02, 0, 12), cyl(0.015, 0.015, 0.5, '#2a3a2a', 0, 0.27, 0, 6), cyl(0.06, 0.2, 0.18, '#2a5a3a', 0.1, 0.52, 0, 14)); lamp.position.set(-1.1, 1.06, 0.2); g.add(lamp);
  const phone = rbox(0.35, 0.12, 0.25, '#2a2422', 1.1, 1.12, 0.2, 0.03); g.add(phone);
  outline(g, { px: 2.2 });
  // the proposal folder on the desk (a pigeon sketch on it)
  const ft = canvasTex(256, 192, (x, W, H) => { x.fillStyle = '#e8d8a8'; x.fillRect(0, 0, W, H); x.strokeStyle = '#5a4a30'; x.lineWidth = 5; x.beginPath(); x.ellipse(110, 110, 50, 32, 0, 0, 7); x.stroke(); x.beginPath(); x.arc(160, 70, 20, 0, 7); x.stroke(); x.beginPath(); x.moveTo(178, 68); x.lineTo(198, 74); x.lineTo(178, 80); x.stroke();
    x.fillStyle = '#5a4a30'; x.font = '900 22px Nunito, sans-serif'; x.fillText('PROPOSAL', 70, 180); });
  const folder = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.68), toon('#ffffff', { map: ft })); folder.rotation.x = -Math.PI / 2; folder.position.set(0, 1.065, 0.55); folder.userData.noOutline = true; g.add(folder);
  return { group: g, tableY: 1.06, folder, update() {} };
}
// ---------------------------------------------------------------- 2D OVERLAYS
// hook text with per-word colours: lines = [[['PIGEON', '#ffd25a'], ['pilots', '#fff']], ...]
export function hookWords(g, t, lines, o = {}) {
  const y0 = o.y ?? 290, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); const sz = (o.sizes && o.sizes[i]) || o.size || 70;
    g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (sz * 1.3)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    g.font = `900 ${sz}px "Nunito"`; const sp = sz * 0.3; const ws = l.map(([w]) => g.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (l.length - 1);
    let x = -tot / 2; l.forEach(([w, c], j) => { insT(g, w, x + ws[j] / 2, 0, sz, { color: c, stroke: CARD_INK }); x += ws[j] + sp; });
    g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: o.textColor || col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// pop-in chip (dark pill with white/gold text)
export function chip(g, t, text, x, y, o = {}) {
  if (t < 0) return; const k = ease.outBack(clamp(t / 0.25)); const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return; const s = o.size || 58;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.04); g.scale(k, k); g.globalAlpha = fade; g.font = `900 ${s}px "Nunito"`;
  const w = g.measureText(text).width + s * 0.9; g.fillStyle = o.bg || 'rgba(32,22,26,0.88)'; g.beginPath(); g.roundRect(-w / 2, -s * 0.75, w, s * 1.4, s * 0.7); g.fill();
  insT(g, text, 0, s * 0.02, s, { color: o.color || '#ffd25a', stroke: null, maxW: E.W * 0.9 }); g.restore();
}
// calendar card: pages flip from `from` to `to` ("+N YEARS")
export function calendarCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 760; const flips = o.flips ?? 6, fl = Math.min(flips, Math.floor(clamp((t - 0.2) / (o.dur || 1.2)) * flips));
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(-0.04);
  g.fillStyle = '#fbf6ea'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -230, 460, 440, 30); g.fill(); g.stroke();
  g.fillStyle = '#e23b2e'; g.beginPath(); g.roundRect(-230, -230, 460, 110, [30, 30, 0, 0]); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = '#c9ccd2'; g.beginPath(); g.arc(s * 120, -230, 18, 0, 7); g.fill(); g.stroke(); }
  insT(g, o.title || 'YEARS LATER', 0, -172, 54, { color: '#ffffff', stroke: null });
  insT(g, `+${fl}`, 0, 40, 190, { color: '#2a1c15', stroke: null });
  const pf = ((t - 0.2) / (o.dur || 1.2)) * flips % 1; if (fl < flips && t > 0.2) { g.save(); g.globalAlpha = 1 - pf; g.translate(0, -120 + pf * 300); g.rotate(pf * 0.8); g.fillStyle = '#fbf6ea'; g.fillRect(-200, 0, 400, 300 * (1 - pf)); g.restore(); }
  g.restore();
}
// floating feather (comic beat of silence): drifts down from y0
export function feather(g, t, x0, y0, o = {}) {
  if (t < 0) return; const y = y0 + t * (o.speed || 170), x = x0 + Math.sin(t * 3.2) * 70; g.save(); g.translate(x, y); g.rotate(Math.sin(t * 3.2 + 1) * 0.6); g.scale(o.s || 1.4, o.s || 1.4);
  g.fillStyle = '#d8dce6'; g.strokeStyle = CARD_INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -46); g.quadraticCurveTo(22, -10, 4, 40); g.lineTo(-4, 40); g.quadraticCurveTo(-22, -10, 0, -46); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(0, -40); g.lineTo(0, 52); g.stroke(); g.restore();
}
// screen-space money bag with a label
export function moneyBag(g, t, x, y, label, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; g.save(); g.translate(x, y + (1 - k) * -200); g.scale(k * (o.s || 1), k * (o.s || 1));
  g.fillStyle = '#c8a060'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-40, -110); g.quadraticCurveTo(0, -80, 40, -110); g.lineTo(30, -70); g.quadraticCurveTo(140, -20, 110, 80); g.quadraticCurveTo(0, 130, -110, 80); g.quadraticCurveTo(-140, -20, -30, -70); g.closePath(); g.fill(); g.stroke();
  insT(g, '$', 0, 30, 120, { color: '#3a7a3a', stroke: null }); if (label) insT(g, label, 0, 175, 74, { color: '#ffd25a', stroke: CARD_INK }); g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, shadeHex };
