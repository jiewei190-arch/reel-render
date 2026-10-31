// B_lib.js — shared helpers for ep 4 batch B (s027-s052). Registers no shots. LEGAL: original hero only; silk only from the back end.
//   wt(info, word, fb, after, exact)   word start in shot time (inside the shot only; fb = fallback seconds)
//   W(o, p)                            world point of a pose point for actor opts o
//   stamp(g, t, t0, str, x, y, o)      a gold stamp that slams down (outBack + tiny shake)
//   goldTag(g, t, t0, str, x, y, o)    a gold pill tag that pops
//   bricks(g, x, y, w, h, o)           a close brick wall texture (for inserts / face backgrounds)
//   ant(g, x, y, s, t, o)              a tiny ant carrying a crumb
//   daisy(g, x, y, s, t)               a daisy (Pip's perch)
//   giantShoe(g, x, y, len, o)         a flat grey sticky-sole shoe as long as a bench
//   stickyNote(g, x, y, s, rot)        a pale yellow sticky note (dark outline so it reads on mustard)
//   pads(g, o, pose, k)                40% of the hero covered in grey sticky pads (hands, forearms, chest, knees, feet, cheeks)
//   floorBalance(g, t, x, y, tip, o)   a cream line-art balance: WEIGHT x8 vs AREA x4, tipping
import { E, S, clamp, lerp, ease, prog, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, text, FONTS, linGrad } from '/engine/core.js';

const norm = (w) => w.toLowerCase().replace(/[^\w']/g, '');
export const wt = (info, m, fb, after = 0, exact = false) => {
  const st = info.shot.start, k = norm(m);
  const hit = E.words.find(x => x.start >= st + after - 0.05 && x.start < st + info.dur && (exact ? norm(x.word) === k : norm(x.word).startsWith(k)));
  return hit ? hit.start - st : fb;
};
export const W = (o, p) => { const s = o.s ?? 1.9, f = o.facing ?? 1; return [o.x + p[0] * f * s, o.y + p[1] * s]; };
export const toScreen = (x, y, cam) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z ?? 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z ?? 1) + E.H / 2];

export function stamp(g, t, t0, str, x, y, o = {}) {
  const k = ease.outBack(prog(t, t0, t0 + 0.25)); if (k <= 0.01) return; const ui = S().ui, sh = t - t0 < 0.3 ? noise(t * 50, 3) * 3 * (1 - (t - t0) / 0.3) : 0, sz = o.size ?? 64;
  g.save(); g.translate(x + sh, y + sh); g.rotate(o.rot ?? -0.06); const sc = (1 + 0.6 * (1 - k)) * k; g.scale(sc, sc); g.font = `900 ${sz}px "${FONTS.ui}"`; const w = g.measureText(str).width + 70;
  rr(g, -w / 2, -sz * 0.75, w, sz * 1.5, 16); g.fillStyle = 'rgba(14,10,20,.85)'; g.fill(); g.strokeStyle = ui.gold; g.lineWidth = 6; g.stroke();
  text(g, str, 0, 2, { size: sz, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3, glow: 14, glowColor: alpha(ui.gold, 0.5) }); g.restore();
}
export function goldTag(g, t, t0, str, x, y, o = {}) {
  const k = ease.outBack(prog(t, t0, t0 + 0.35)) * (o.until ? clamp((o.until - t) / 0.25) : 1); if (k <= 0.01) return; const ui = S().ui, sz = o.size ?? 44;
  g.save(); g.translate(x, y); g.scale(k, k); g.font = `900 ${sz}px "${FONTS.ui}"`; const w = g.measureText(str).width + 50; rr(g, -w / 2, -sz * 0.7, w, sz * 1.4, sz * 0.7); g.fillStyle = 'rgba(14,10,20,.88)'; g.fill(); g.strokeStyle = alpha(ui.gold, 0.9); g.lineWidth = 4; g.stroke();
  text(g, str, 0, 2, { size: sz, color: o.color ?? ui.gold, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(ui.gold, 0.5) }); g.restore();
}
export function bricks(g, x, y, w, h, o = {}) {
  const col = o.color ?? '#a8604a', r = rng(o.seed ?? 3), bw = o.bw ?? 120, bh = o.bh ?? 54;
  g.fillStyle = shade(col, -0.35); g.fillRect(x, y, w, h);
  for (let j = 0; j * bh < h + bh; j++) for (let i = -1; i * bw < w + bw; i++) { const bx = x + i * bw + (j % 2) * bw / 2, by = y + j * bh; g.fillStyle = shade(col, -0.1 + r() * 0.2); g.fillRect(bx + 4, by + 4, bw - 8, bh - 8); }
}
export function ant(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.facing ?? 1), s);
  for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { const ph = Math.sin(t * 18 + i * 2 + (sd > 0 ? 0 : Math.PI)) * 3; seg(g, [[-6 + i * 6, -6], [-8 + i * 6 + ph, -2], [-10 + i * 7 + ph, 0]], 1.4, '#1a1418'); }
  circle(g, -10, -7, 5, '#2a1a18'); circle(g, -2, -7, 3.5, '#2a1a18'); circle(g, 6, -8, 4, '#2a1a18'); seg(g, [[8, -11], [13, -17]], 1, '#1a1418'); seg(g, [[7, -11], [10, -18]], 1, '#1a1418');
  if (o.crumb !== false) { g.fillStyle = '#e8c890'; g.beginPath(); g.moveTo(2, -12); g.lineTo(26, -30); g.lineTo(18, -48); g.lineTo(-10, -40); g.lineTo(-14, -20); g.closePath(); g.fill(); circle(g, 8, -32, 3, '#c8a060'); }
  g.restore();
}
export function daisy(g, x, y, s, t) { const sw = Math.sin(t * 1.2) * 4; seg(g, [[x, y], [x + sw * s, y - 80 * s]], 4 * s, '#4a8a3a'); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = '#f8f6ee'; g.beginPath(); g.ellipse(x + sw * s + Math.cos(a) * 14 * s, y - 80 * s + Math.sin(a) * 8 * s, 10 * s, 4 * s, a, 0, 7); g.fill(); } circle(g, x + sw * s, y - 80 * s, 7 * s, '#f2c21a'); return [x + sw * s, y - 88 * s]; }
export function giantShoe(g, x, y, len, o = {}) {
  const h = len * 0.16, f = o.facing ?? 1; g.save(); g.translate(x, y); g.scale(f, 1);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, len * 0.52, 12, 0, 0, 7); g.fill();
  g.fillStyle = '#8a8e98'; g.beginPath(); g.moveTo(-len / 2, 0); g.lineTo(-len / 2, -h * 0.9); g.quadraticCurveTo(-len * 0.3, -h * 1.2, -len * 0.05, -h); g.quadraticCurveTo(len * 0.35, -h * 0.9, len / 2, -h * 0.3); g.quadraticCurveTo(len * 0.53, 0, len / 2, 0); g.closePath(); g.fill();
  g.fillStyle = '#5a5e68'; g.fillRect(-len / 2, -16, len, 16); for (let i = 0; i < 14; i++) seg(g, [[-len / 2 + 20 + i * len / 14, -14], [-len / 2 + 30 + i * len / 14, -2]], 3, '#3a3e48');   // sticky sole tread
  for (let i = 0; i < 5; i++) seg(g, [[-len * 0.22 + i * 26, -h * 1.0], [-len * 0.2 + i * 26, -h * 0.75]], 6, '#f4f1e8');                                  // laces
  g.restore();
}
export function stickyNote(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -20, -20, 40, 40, 2); g.fillStyle = '#fbf0a0'; g.fill(); g.strokeStyle = '#3a3420'; g.lineWidth = 2; g.stroke(); seg(g, [[-12, -6], [10, -6]], 2, alpha('#3a3420', 0.5)); seg(g, [[-12, 4], [6, 4]], 2, alpha('#3a3420', 0.5)); g.restore(); }
export function pads(g, o, pose, k) {
  if (k <= 0) return; const s = o.s ?? 1.9, list = [['hF', 16], ['hB', 15], ['eF', 12], ['eB', 11], ['kF', 13], ['kB', 12], ['fF', 15], ['fB', 14], ['sh', 18], ['hip', 16], ['head', 13]];
  list.forEach(([key, r], i) => { const kk = clamp(k * list.length - i); if (kk <= 0) return; let p = pose[key]; if (key === 'sh') p = [pose.sh[0] + 4, pose.sh[1] + 30]; if (key === 'head') p = [pose.head[0] + 12, pose.head[1] + 8]; const [x, y] = W(o, p);
    g.fillStyle = alpha('#8a8e98', 0.92 * kk); g.beginPath(); g.ellipse(x, y, r * s * 0.6 * ease.outBack(kk), r * s * 0.45 * ease.outBack(kk), 0, 0, 7); g.fill(); g.strokeStyle = alpha(S().ui.gold, 0.8 * kk); g.lineWidth = 3; g.stroke(); });
}
export function floorBalance(g, t, x, y, tip, o = {}) {
  const ui = S().ui, c = ui.blueprint || '#9ad0ff', a = tip * 0.32 + Math.sin(t * 6) * 0.01 * tip;
  poly(g, [[x - 40, y + 140], [x + 40, y + 140], [x, y]], alpha(c, 0.9));
  g.save(); g.translate(x, y); g.rotate(a); seg(g, [[-320, 0], [320, 0]], 6, c);
  for (const [sd, str] of [[-1, 'WEIGHT x8'], [1, 'AREA x4']]) { seg(g, [[sd * 300, 0], [sd * 260, 80], [sd * 340, 80], [sd * 300, 0]], 3, c); g.save(); g.translate(sd * 300, 110); g.rotate(-a); text(g, str, 0, 0, { size: 36, color: ui.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
  g.restore();
}
