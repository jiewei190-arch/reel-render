// shared helpers for "Banned From Having a Dog, He Got a Bear" (byron-bear). Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, cyl } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { bear } from '/kits/toon3d/animals.js';
import { SETS } from '/kits/toon3d/sets.js';
import { MUSTARD } from '/kits/toon3d/cast.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.14, col = '#ffd25a') { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: col, weight: 700 }); g.restore(); }
// round icon badge with a dog / bear head, banned (red slash) or approved (green tick)
export function iconBadge(g, kind, ok, k, x = E.W / 2, y = E.H * 0.3, r = 120) { if (k <= 0) return; g.save(); g.translate(x, y); const s = ease.outBack(clamp(k)); g.scale(s, s);
  g.fillStyle = 'rgba(255,250,240,.95)'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.lineWidth = 16; g.strokeStyle = ok ? '#3aa05a' : '#d63a3a'; g.stroke();
  const fur = kind === 'dog' ? '#c08850' : '#8a5a36'; g.fillStyle = fur; g.strokeStyle = '#20161a'; g.lineWidth = 6;
  if (kind === 'dog') { for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 46, 4, 20, 44, sx * 0.25, 0, 7); g.fillStyle = '#7a4a2a'; g.fill(); g.stroke(); } g.fillStyle = fur; g.beginPath(); g.arc(0, -4, 50, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#f2dcb4'; g.beginPath(); g.ellipse(0, 22, 26, 18, 0, 0, 7); g.fill(); }
  else { for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 40, -40, 18, 0, 7); g.fill(); g.stroke(); } g.fillStyle = fur; g.beginPath(); g.arc(0, 0, 54, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#e8cfa6'; g.beginPath(); g.ellipse(0, 20, 26, 18, 0, 0, 7); g.fill(); }
  g.fillStyle = '#20161a'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 18, -10, 6, 0, 7); g.fill(); } g.beginPath(); g.ellipse(0, 12, 9, 6, 0, 0, 7); g.fill();
  if (!ok) { g.strokeStyle = '#d63a3a'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * 0.7, -r * 0.7); g.lineTo(r * 0.7, r * 0.7); g.stroke(); }
  else { g.translate(r * 0.62, r * 0.62); g.fillStyle = '#3aa05a'; g.beginPath(); g.arc(0, 0, 44, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-18, 2); g.lineTo(-4, 16); g.lineTo(20, -14); g.stroke(); }
  g.restore(); }
export function court(T, o = {}) { const st = toonStage(T, { light: 'day', fov: 40, shadowSize: o.shadowSize || 9, target: o.target || [0, 0, 2], ...(o.stage || {}) }); const set = SETS.collegeCourt(st, o.court || {}); set.gate.doors.forEach(d => (d.visible = false)); return { stage: st, set }; }
export function room(T, o = {}) { const st = toonStage(T, { light: o.evening === false ? 'warm' : 'dusk', fov: 36, shadowSize: 6, target: [0, 0, -0.5], ...(o.stage || {}) }); const set = SETS.collegeRoom(st, { evening: o.evening !== false, deskOn: o.deskOn !== false }); return { stage: st, set }; }
// Lord Byron, played by the I.Awaken HERO: black student gown over a mustard waistcoat, HERO's messy brown hair, olive skin
export const byron = (o = {}) => bean({ name: 'Byron', outfit: 'gown', colors: { main: '#25222c', vest: MUSTARD, legsTop: '#4a4252' }, skin: 'olive', hair: 'messy', hairColor: '#5a3a22', seed: 101, ...o });
// the college porter (original character): frock coat, top hat, grey moustache
export const porter = (o = {}) => bean({ name: 'Porter', outfit: 'coat', colors: { main: '#2f3a4a', vest: '#8a2a2a', legsTop: '#3a3440' }, head: 'tophat', skin: 'fair', hair: 'horseshoe', hairColor: '#9a958c', moustache: '#9a958c', seed: 301, ...o });
// two old dons (original characters): black gowns + mortarboards
export const don = (i = 0, o = {}) => bean({ name: 'Don', outfit: 'gown', colors: { main: '#1e1c24', vest: i ? '#3a2a4a' : '#2a3a3a', legsTop: '#1e1c24' }, head: 'mortarboard', skin: i ? 'light' : 'fair', hair: 'horseshoe', hairColor: '#d8d4cc', beard: i === 1, beardColor: '#d8d4cc', glasses: i === 0, seed: 310 + i, ...o });
export const theBear = (o = {}) => bear({ seed: 5, ...o });
// a ribbon lead between two world points with a little sag (two thin cylinders)
export function lead(st, color = '#c0392b') { const m = new THREE.MeshBasicMaterial({ color }); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 6), m), b = a.clone(); st.add(a); st.add(b); const up = new THREE.Vector3(0, 1, 0);
  const seg = (mesh, p, q) => { const d = q.clone().sub(p); mesh.position.copy(p).add(q).multiplyScalar(0.5); mesh.scale.set(1, d.length(), 1); mesh.quaternion.setFromUnitVectors(up, d.normalize()); };
  return { update(p, q) { const mid = p.clone().add(q).multiplyScalar(0.5); mid.y -= 0.18 + p.distanceTo(q) * 0.08; seg(a, p, mid); seg(b, mid, q); } }; }
export const wp = (obj) => obj.getWorldPosition(new THREE.Vector3());
