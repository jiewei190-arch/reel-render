// A_lib.js — shared helpers for batch A (s001-s026). Registers no shots.
//   sw(word, st, fb)            seconds into the shot when `word` is spoken (fallback fb)
//   heroFace(g, cx, cy, r, o)   giantFace(..., { who: 'HERO' }) (faces.js draws the ep 3 hero look)
//   stamp(g, t, at, str, x, y, o)   rubber stamp that slams in (outBack + overshoot), red or gold, rotated
//   hairbrush(g, x, y, rot, s, o)   the hairbrush prop (o.hairs: count of hairs caught in it)
//   stepStool(g, x, gy, s)          Mina's bathroom step stool
//   tuft(g, x, y, s, rot)           a single cartoon curl (the "hair falls out" joke sprite)
//   bgBlur(g, t, cam, fn, amt, veilA)   blurred, darkened background for cards/graphics
//   handAt(o, pose, which)          world position of a hand ('F' near | 'B' far) for actor opts o
import { E, S, clamp, lerp, ease, prog, rng, seg, circle, poly, rr, alpha, shade, glow, text, FONTS, blurLayer, veil } from '/engine/core.js';
import { giantFace } from '../sets/faces.js';
import { HERO } from '../cast.js';

export const sw = (w, st, fb) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m)); return (hit ? hit.start : st + fb) - st; };
export const handAt = (o, p, which = 'F') => { const s = (o.s ?? 1), f = o.facing ?? 1, h = p['h' + which]; return [o.x + h[0] * f * s, o.y + h[1] * s]; };

const CURL = '#17111a', CURL_HI = '#3d3043';
// the ep 3 HERO giant face: faces.js now draws the green hoodie, curls and sweatband itself (lead fix, 461662a), so this is a pass-through.
export const heroFace = (g, cx, cy, r, o = {}) => giantFace(g, cx, cy, r, { ...o, who: 'HERO' });

export function stamp(g, t, at, str, x, y, o = {}) {
  const k = prog(t, at, at + 0.22); if (k <= 0) return;
  const col = o.color || '#d4262e', size = o.size ?? 64, rot = o.rot ?? -0.12, sc = lerp(2.2, 1, ease.out(k)) + (k >= 1 ? Math.exp(-(t - at - 0.22) * 9) * Math.sin((t - at) * 30) * 0.05 : 0);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= clamp(k * 2) * (o.alpha ?? 1);
  g.font = `900 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + size * 0.8, h = size * 1.35;
  rr(g, -w / 2, -h / 2, w, h, size * 0.16); g.strokeStyle = col; g.lineWidth = size * 0.11; g.stroke();
  rr(g, -w / 2 + size * 0.14, -h / 2 + size * 0.14, w - size * 0.28, h - size * 0.28, size * 0.1); g.lineWidth = size * 0.04; g.stroke();
  text(g, str, 0, size * 0.04, { size, color: col, font: FONTS.title, weight: 700, spacing: 3 });
  const R = rng(5); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 26; i++) circle(g, (R() - 0.5) * w, (R() - 0.5) * h, 1.5 + R() * 3, 'rgba(0,0,0,.55)');   // ink speckle
  g.restore();
}

export function hairbrush(g, x, y, rot = 0, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -7, -6, 14, 60, 6); g.fillStyle = '#b0663a'; g.fill(); g.fillStyle = alpha('#fff', 0.25); g.fillRect(-4, -2, 3, 52);
  g.fillStyle = '#2a2230'; g.beginPath(); g.ellipse(0, -34, 20, 32, 0, 0, 7); g.fill();
  g.fillStyle = '#d8d0e8'; for (let i = 0; i < 15; i++) { const cx = -12 + (i % 5) * 6, cy = -56 + Math.floor(i / 5) * 14; circle(g, cx, cy, 2.4, '#efe8f8'); }
  if (o.hairs) { g.strokeStyle = '#17111a'; g.lineWidth = 1.8; for (let i = 0; i < o.hairs; i++) { g.beginPath(); g.arc(-4 + i * 3, -38 + i * 4, 9, 0.2 + i, 2.6 + i); g.stroke(); } }
  g.restore();
}
export function stepStool(g, x, gy, s = 1) {
  rr(g, x - 70 * s, gy - 70 * s, 140 * s, 22 * s, 6 * s); g.fillStyle = '#e8a84a'; g.fill();
  g.fillStyle = shade('#e8a84a', -0.3); g.fillRect(x - 60 * s, gy - 50 * s, 14 * s, 50 * s); g.fillRect(x + 46 * s, gy - 50 * s, 14 * s, 50 * s);
  seg(g, [[x - 50 * s, gy - 22 * s], [x + 50 * s, gy - 22 * s]], 6 * s, shade('#e8a84a', -0.3));
}
export function tuft(g, x, y, s = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.strokeStyle = CURL; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(14, -10, 24, 6, 12, 14); g.bezierCurveTo(2, 20, -6, 8, 6, 2); g.stroke();
  g.strokeStyle = alpha(CURL_HI, 0.9); g.lineWidth = 2; g.beginPath(); g.moveTo(3, -2); g.bezierCurveTo(13, -8, 20, 2, 14, 8); g.stroke();
  g.restore();
}
export function bgBlur(g, t, cam, fn, amt = 12, veilA = 0.4, veilC = '#0a0812') {
  blurLayer(g, amt, (g) => fn(g), null, 1); veil(g, veilC, veilA);
}
