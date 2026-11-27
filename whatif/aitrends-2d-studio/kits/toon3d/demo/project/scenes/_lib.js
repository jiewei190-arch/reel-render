// shared helpers for the FX demo (re-uses the emu-war Short's 3D assets from the kit). Underscore = not auto-loaded.
import { wordTime } from '/engine/core.js';
import { toonStage } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import { emu } from '/kits/toon3d/animals.js';
import { SETS } from '/kits/toon3d/sets.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
// the emu-war farm, but in the new sunny look: warm sun + sky dome with clouds
export function farm(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: o.shadowSize || 12, target: o.target || [0, 0, 0] }); const set = SETS.outbackFarm(st, o.farm || {}); const sky = sunnySky(st, { clouds: 9, seed: o.seed || 3 }); return { stage: st, set, sky }; }
const SK = ['fair', 'tan', 'light', 'olive', 'brown'];
export const soldier = (i = 0, o = {}) => bean({ name: 'Soldier', outfit: 'uniform', colors: { main: '#8a7a52', legsTop: '#7a6a46' }, head: 'slouch', headColor: '#8a6e48', skin: SK[i % SK.length], hair: 'bowl', hairColor: ['#3a2618', '#6a4428', '#1e1612'][i % 3], seed: 200 + i, ...o });
export const commander = () => bean({ name: 'Commander', outfit: 'uniform', colors: { main: '#7a6c48', legsTop: '#6a5c3c', trim: '#d8b04a' }, head: 'cap', headColor: '#6a5a3a', skin: 'fair', hair: 'bald', moustache: '#6a4a2a', seed: 210 });
export function flock(st, n, area, seed = 1, o = {}) { const out = []; let s = seed * 9301 + 49297; const R = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) { const e = emu({ seed: seed * 10 + i, scale: 0.92 + R() * 0.16, ...o }); e.position.set(area[0] + R() * (area[1] - area[0]), 0, area[2] + R() * (area[3] - area[2])); e.rotation.y = (R() - 0.5) * 2.4; e.ph = R() * 3; st.add(e); out.push(e); } return out; }
