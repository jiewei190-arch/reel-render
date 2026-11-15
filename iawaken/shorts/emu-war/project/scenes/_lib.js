// shared helpers for "Australia Lost a War to Birds" (emu-war). Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { emu } from '/kits/toon3d/animals.js';
import { SETS } from '/kits/toon3d/sets.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.14) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
export function farm(T, o = {}) { const st = toonStage(T, { light: 'day', fov: 38, shadowSize: o.shadowSize || 12, target: o.target || [0, 0, 0], ...(o.stage || {}) }); const set = SETS.outbackFarm(st, o.farm || {}); return { stage: st, set }; }
// 1932 soldiers: khaki uniform + slouch hat. i picks skin/hair variety.
const SK = ['fair', 'tan', 'light', 'olive', 'brown'];
export const soldier = (i = 0, o = {}) => bean({ name: 'Soldier', outfit: 'uniform', colors: { main: '#8a7a52', legsTop: '#7a6a46' }, head: 'slouch', headColor: '#8a6e48', skin: SK[i % SK.length], hair: 'bowl', hairColor: ['#3a2618', '#6a4428', '#1e1612'][i % 3], seed: 200 + i, ...o });
// the commander (an original character, not a portrait): officer cap, big moustache
export const commander = () => bean({ name: 'Commander', outfit: 'uniform', colors: { main: '#7a6c48', legsTop: '#6a5c3c', trim: '#d8b04a' }, head: 'cap', headColor: '#6a5a3a', skin: 'fair', hair: 'bald', moustache: '#6a4a2a', seed: 210 });
export const farmer = () => bean({ name: 'Farmer', outfit: 'tee', colors: { main: '#b8c8d8', legsTop: '#4a5a7a' }, skin: 'tan', hair: 'curly', hairColor: '#8a8580', moustache: '#8a8580', seed: 220 });
// a flock of emus scattered in an area [x0, x1, z0, z1]; returns array with .ph phase offsets
export function flock(st, n, area, seed = 1, o = {}) { const out = []; let s = seed * 9301 + 49297; const R = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) { const e = emu({ seed: seed * 10 + i, scale: 0.92 + R() * 0.16, ...o }); e.position.set(area[0] + R() * (area[1] - area[0]), 0, area[2] + R() * (area[3] - area[2])); e.rotation.y = (R() - 0.5) * 2.4; e.ph = R() * 3; st.add(e); out.push(e); } return out; }
