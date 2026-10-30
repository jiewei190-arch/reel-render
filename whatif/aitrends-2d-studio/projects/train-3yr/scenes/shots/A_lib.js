// A_lib.js — shared helpers for batch A (s001-s026). Registers no shots.
//   sw(word, st, fb)            seconds into the shot when `word` is spoken (fallback fb)
//   heroFace(g, cx, cy, r, o)   giantFace for the ep 3 HERO: GREEN hoodie + hood, BIG DARK CURLS, white sweatband with a green stripe
//                               (faces.js still draws the ep 2 mustard hoodie / bald head for 'HERO', so batch A wraps it). o = giantFace opts.
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
// the hood + green hoodie shoulders (behind the head), then the face, then curls + sweatband on top
export function heroFace(g, cx, cy, r, o = {}) {
  const c = HERO.color, d = shade(c, -0.32), side = o.rimSide ?? -1, rc = o.rimColor || '#ffc68a', br = o.breath ?? 0;
  g.save(); g.translate(cx, cy + br * r * 0.012); if (o.tilt) g.rotate(o.tilt);
  g.fillStyle = shade(c, -0.22); g.beginPath(); g.ellipse(0, r * 0.1, r * 1.22, r * 1.16, 0, 0, Math.PI * 2); g.fill();                     // hood bunched behind
  g.fillStyle = alpha('#000', 0.32); g.beginPath(); g.ellipse(0, r * 0.12, r * 1.06, r * 1.02, 0, 0, Math.PI * 2); g.fill();
  const gr = g.createLinearGradient(0, r, 0, r * 2.3); gr.addColorStop(0, shade(c, 0.06)); gr.addColorStop(1, shade(c, -0.38));
  g.fillStyle = gr; g.beginPath(); g.moveTo(-r * 1.95, r * 2.4); g.quadraticCurveTo(-r * 1.75, r * 1.15, -r * 0.62, r * 0.98); g.lineTo(r * 0.62, r * 0.98); g.quadraticCurveTo(r * 1.75, r * 1.15, r * 1.95, r * 2.4); g.closePath(); g.fill();
  g.strokeStyle = d; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.62, r * 0.98); g.quadraticCurveTo(0, r * 1.32, r * 0.62, r * 0.98); g.stroke();
  for (const s of [-1, 1]) { seg(g, [[s * r * 0.2, r * 1.12], [s * r * 0.26, r * 1.5], [s * r * 0.22, r * 1.8]], r * 0.05, '#f4f1e8'); circle(g, s * r * 0.22, r * 1.84, r * 0.045, '#d8d4c8'); }
  g.strokeStyle = alpha(d, 0.7); g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 1.1, r * 1.6); g.quadraticCurveTo(-r * 0.9, r * 1.9, -r * 1.0, r * 2.2); g.stroke();
  // curls behind the head silhouette (rim pass + dark pass) so the head reads as a big curly mop
  const curls = (rad, fill, dx = 0, dy = 0) => {
    for (let i = 0; i < 13; i++) { const a = Math.PI * (1.0 + i / 12), rr2 = r * (i % 2 ? 0.98 : 0.9); circle(g, dx + Math.cos(a) * rr2, dy + Math.sin(a) * rr2 * 0.96 - r * 0.02, r * rad * (i % 3 === 1 ? 1.08 : 1), fill); }
    for (let i = 0; i < 6; i++) { const a = Math.PI * (1.12 + i / 6.6); circle(g, dx + Math.cos(a) * r * 0.72, dy + Math.sin(a) * r * 0.78 - r * 0.12, r * rad * 0.95, fill); }
  };
  g.save(); g.translate(-side * r * 0.05, -r * 0.03); curls(0.33, rc); g.restore();
  curls(0.31, CURL);
  g.restore();
  giantFace(g, cx, cy, r, { ...o, who: 'HERO3' });                                         // unknown `who` -> faces.js draws no outfit, just the head + face
  g.save(); g.translate(cx, cy + br * r * 0.012); if (o.tilt) g.rotate(o.tilt);
  // curls on top of the skull (cover the hairline), with highlight arcs so they read as hair, not a bigger head
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (1.08 + i / 9.6), x = Math.cos(a) * r * 0.8, y = Math.sin(a) * r * 0.86 - r * 0.06, rad = r * (0.27 + (i % 2) * 0.04);
    circle(g, x, y, rad, CURL);
    g.strokeStyle = alpha(CURL_HI, 0.9); g.lineWidth = r * 0.03; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, rad * 0.62, Math.PI * 1.1 + i * 0.3, Math.PI * 1.75 + i * 0.3); g.stroke();
  }
  // sweatband across the forehead (white, green stripe), following the head curve
  const bandY = -r * 0.62, bw = r * 0.86;
  g.strokeStyle = '#f4f1e8'; g.lineWidth = r * 0.17; g.lineCap = 'round'; g.beginPath(); g.moveTo(-bw, bandY + r * 0.1); g.quadraticCurveTo(0, bandY - r * 0.1, bw, bandY + r * 0.1); g.stroke();
  g.strokeStyle = c; g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(-bw * 0.98, bandY + r * 0.1); g.quadraticCurveTo(0, bandY - r * 0.1, bw * 0.98, bandY + r * 0.1); g.stroke();
  g.strokeStyle = alpha(rc, 0.6); g.lineWidth = r * 0.025; g.beginPath(); g.moveTo(-side * bw * 0.2, bandY - r * 0.07); g.quadraticCurveTo(-side * bw * 0.6, bandY - r * 0.06, -side * bw, bandY + r * 0.04); g.stroke();
  // a couple of curls springing over the band
  for (const [x, y, rad] of [[-0.42, -0.74, 0.16], [0.08, -0.8, 0.17], [0.5, -0.72, 0.15]]) circle(g, x * r, y * r, rad * r, CURL);
  g.restore();
}

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
