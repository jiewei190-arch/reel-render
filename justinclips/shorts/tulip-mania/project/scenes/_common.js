// Shared 2D overlay helpers for Justin clips batch 4 (adapted from exploding-whale/_lib.js).
// Timing never uses absolute seconds: word times come from timeline/words.json (at / wt) and shot times from E.shots,
// so a new voice re-times everything (see justinclips/tools/revoice/).
import { E, wordTime, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, toonStage } from '/kits/toon3d/toon.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

// seconds from the shot start to the nth spoken `word` at/after the shot start (fb if not found)
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
// global start time of a shot by id
export const shotStart = (id) => (E.shots.find(s => s.id === id) || { start: 0 }).start;
export const sph = new THREE.SphereGeometry(1, 24, 16);
export const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };
const v3 = new THREE.Vector3();
export const scr = (st, p) => { v3.set(...p).project(st.camera); return [(v3.x + 1) / 2 * E.W, (1 - v3.y) / 2 * E.H]; };

// top caption: adds story (not the title, not a subtitle); visible from frame 1 until the start of shot `untilId`
export function topCaption(g, t, info, lines, untilId) {
  const T = info.shot.start + t, until = shotStart(untilId); if (T > until) return; const fade = clamp((until - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  lines.forEach((l, i) => { g.save(); g.translate(E.W / 2, 172 + i * 96); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 88 : 76, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
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
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420; const w = o.w || 280;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k, k); g.globalAlpha = 0.95; g.lineJoin = 'round';
  g.fillStyle = 'rgba(255,248,236,.9)'; g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -60, w, 120, 18); g.fill(); g.stroke();
  insT(g, String(year), 0, 4, o.size || 92, { color: o.color || '#e23b2e', stroke: null, maxW: w - 30 }); g.restore();
}
// pop-in label (white text with ink outline), k from `t0`
export function popText(g, t, t0, str, x, y, size = 64, o = {}) {
  if (t < t0) return; const k = ease.outBack(clamp((t - t0) / 0.22)); const fade = o.until != null ? 1 - clamp((t - o.until) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate(o.rot ?? -0.04); g.scale(k, k); insT(g, str, 0, 0, size, { color: o.color || '#ffffff', stroke: CARD_INK, maxW: o.maxW || E.W * 0.9 }); g.restore();
}
// big rolling number, e.g. counter(g, t, t0, 1.0, 0, 10000, '', ' GUILDERS')
export function counter(g, t, t0, dur, from, to, pre = '', suf = '', o = {}) {
  if (t < t0) return; const k = ease.out(clamp((t - t0) / dur)); const v = Math.round(lerp(from, to, k)); const s = pre + v.toLocaleString('en-US');
  const pop = ease.outBack(clamp((t - t0) / 0.2)); const bump = 1 + 0.06 * clamp(1 - Math.abs(t - t0 - dur) / 0.15);
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? 520); g.scale(pop * bump, pop * bump); g.rotate(o.rot ?? -0.05);
  insT(g, s, 0, 0, o.size || 150, { color: o.color || '#ffd25a', stroke: CARD_INK, maxW: E.W * 0.9 });
  if (suf) insT(g, suf, 0, (o.size || 150) * 0.72, (o.size || 150) * 0.42, { color: '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 });
  g.restore();
}
// cartoon stink lines (green wavy rising strokes) around screen point x,y
export function stink(g, x, y, t, o = {}) {
  g.save(); g.strokeStyle = o.color || 'rgba(120,170,60,.85)'; g.lineWidth = o.w || 9; g.lineCap = 'round'; const n = o.n || 3, sp = o.spread || 70, hgt = o.h || 120;
  for (let i = 0; i < n; i++) { const ph = (t * 0.8 + i / n) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.9; g.beginPath(); for (let k = 0; k <= 20; k++) { const yy = y - k * hgt / 13 - ph * hgt; const xx = x + (i - (n - 1) / 2) * sp + Math.sin(k * 0.6 + t * 4 + i) * 16; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  g.restore();
}
// a simple warm gradient + soft floor stage for "object on a pedestal" shots
export function studio(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'warm', fov: o.fov || 34, bg: o.bg || ['#ffd9a0', '#f2a65a', '#b8603a'], target: o.target || [0, 1, 0], shadowSize: o.shadowSize || 8 });
  const f = floor(40, 40, o.floor || '#c97a48'); st.add(f); return st;
}
export { toonStage, insT, CARD_INK, THREE, toon, flat, outline, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, rng, clamp, lerp, ease, prog };
