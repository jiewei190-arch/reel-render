// sets/bp.js — BLUEPRINT helpers for the science explainers (navy grid, light-blue line art, GOLD labels). Built on UI.blueprint.
//   board(g, t, { title, fig })            navy grid + drawing-sheet frame + corner title block ("FIG 1 - THE HUMAN EYE")
//   draw(g, pts, k, { w, color, close })   stroke a polyline progressively: k 0..1 draws it on
//   label(g, t, { at, to, str, start })    gold label with a leader line that grows (use wordTime() for start)
//   eye(g, t, { x, y, r, k, rays, glowK }) eye cross-section; k = draw-on progress; glowK = the eye's own heat washing the retina (line 19)
//   retina(g, t, { x, y, w, h, rods, cones, flood, dim })  inset of photoreceptors: rods = tall thin sticks, cones = triangles. flood 0..1 = bright-light flood
//   wavelength(g, t, { x, y, w, h, k, peak })  blackbody-style curve with the 8-14 micrometre band and a peak marker (skin ~9.5)
//   photon(g, t, { from, to, k })          a single glowing photon travelling along a line
// All colours come from S().ui.
import { E, V, S, clamp, lerp, prog, ease, seg, circle, ring, rr, poly, alpha, mix, glow, text, FONTS } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';

export function board(g, t, o = {}) {
  UI.blueprint(g); const ui = S().ui, m = V(46, 36);
  g.strokeStyle = alpha(ui.blueprint, 0.5); g.lineWidth = 2; g.strokeRect(m, m, E.W - 2 * m, E.H - 2 * m); g.strokeStyle = alpha(ui.blueprint, 0.22); g.strokeRect(m + 10, m + 10, E.W - 2 * m - 20, E.H - 2 * m - 20);
  if (o.fig) { const w = 520, h = 62, x = E.W - m - 10 - w, y = E.H - m - 10 - h; g.fillStyle = alpha(ui.bpBg, 0.9); g.fillRect(x, y, w, h); g.strokeStyle = alpha(ui.blueprint, 0.5); g.strokeRect(x, y, w, h); text(g, o.fig, x + 20, y + h / 2, { size: 24, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 }); }
  if (o.title) text(g, o.title, m + 30, m + 40, { size: V(34, 38), color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
  const gl = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.2, E.W / 2, E.H / 2, E.H * 0.9); gl.addColorStop(0, 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = gl; g.fillRect(0, 0, E.W, E.H);
}
export function draw(g, pts, k = 1, o = {}) {
  const { w = 4, color = S().ui.blueprint, close = false } = o; const P = close ? [...pts, pts[0]] : pts; let total = 0; const L = []; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); total += d; }
  let rem = clamp(k) * total; g.save(); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...P[0]);
  for (let i = 1; i < P.length && rem > 0; i++) { const f = Math.min(1, rem / L[i - 1]); g.lineTo(lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)); rem -= L[i - 1]; } g.stroke(); g.restore();
}
export function label(g, t, o = {}) { const { at, to, str, start = 0, color = S().ui.gold, size = V(30, 34) } = o; const p = ease.out(prog(t, start, start + 0.5)); if (p <= 0) return; const ex = lerp(at[0], to[0], p), ey = lerp(at[1], to[1], p); circle(g, at[0], at[1], 6, color); ring(g, at[0], at[1], 12 * p, 2, alpha(color, 0.6)); seg(g, [at, [ex, ey]], 2.5, alpha(color, 0.9)); text(g, str, to[0] + (to[0] >= at[0] ? 14 : -14), to[1], { size, color, font: FONTS.ui, weight: 900, align: to[0] >= at[0] ? 'left' : 'right', alpha: clamp((p - 0.6) / 0.4), spacing: 2, glow: 10, glowColor: alpha(color, 0.5) }); }

export function eye(g, t, o = {}) {
  const { x = E.W / 2, y = E.H / 2, r = 230, k = 1, rays = true, glowK = 0 } = o, ui = S().ui, c = ui.blueprint, a = clamp(k * 1.5);
  g.save(); g.translate(x, y); g.globalAlpha *= a;
  const ang0 = 0.62, ang1 = Math.PI * 2 - 0.62;                                    // eyeball: a circle open at the front (left)
  draw(g, Array.from({ length: 50 }, (_, i) => { const th = lerp(ang0, ang1, i / 49); return [Math.cos(th) * r * -1 * -1, Math.sin(th) * r]; }).map(([px, py]) => [-px, py]), clamp(k * 1.6), { w: 5, color: c });
  draw(g, [[-r * 0.8, -r * 0.55], [-r * 1.12, -r * 0.3], [-r * 1.18, 0], [-r * 1.12, r * 0.3], [-r * 0.8, r * 0.55]], clamp(k * 2 - 0.2), { w: 5, color: c });      // cornea
  const lens = Array.from({ length: 28 }, (_, i) => { const th = i / 27 * Math.PI * 2; return [-r * 0.55 + Math.cos(th) * r * 0.1, Math.sin(th) * r * 0.3]; });
  draw(g, lens, clamp(k * 2 - 0.4), { w: 4.5, color: c, close: true });                                                                                                  // lens
  draw(g, [[-r * 0.72, -r * 0.5], [-r * 0.55, -r * 0.32]], clamp(k * 2 - 0.5), { w: 4.5, color: c }); draw(g, [[-r * 0.72, r * 0.5], [-r * 0.55, r * 0.32]], clamp(k * 2 - 0.5), { w: 4.5, color: c });   // iris
  // retina: gold arc inside the back of the eye
  draw(g, Array.from({ length: 30 }, (_, i) => { const th = lerp(-1.0, 1.0, i / 29); return [Math.cos(th) * r * 0.93, Math.sin(th) * r * 0.93]; }), clamp(k * 2 - 0.6), { w: 9, color: ui.gold });
  draw(g, [[r * 0.93, 0], [r * 1.35, 12], [r * 1.7, 30]], clamp(k * 2 - 0.8), { w: 14, color: alpha(c, 0.7) });                                                   // optic nerve
  if (glowK > 0) { const pulse = 0.7 + 0.3 * Math.sin(t * 3); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, r * 0.35, 0, r * 1.1, '#ff7a30', 0.5 * glowK * pulse); g.restore(); for (let i = 0; i < 6; i++) { const th = -0.9 + i * 0.36, ph = (t * 0.9 + i / 6) % 1; seg(g, [[Math.cos(th) * r * (0.5 + ph * 0.4), Math.sin(th) * r * (0.5 + ph * 0.4)], [Math.cos(th) * r * (0.6 + ph * 0.4), Math.sin(th) * r * (0.6 + ph * 0.4)]], 3, alpha('#ff8a40', 0.8 * (1 - ph) * glowK)); } }
  if (rays && k >= 0.9) for (let i = -2; i <= 2; i++) { const ph = (t * 0.6 + i * 0.13) % 1, yy = i * r * 0.18; seg(g, [[-r * 2.1 + ph * r * 1.2, yy * (1 - ph * 0.8)], [-r * 1.9 + ph * r * 1.2, yy * (1 - ph * 0.8) + 0]], 3, alpha(ui.cream, 0.7)); }
  g.restore();
}
export function retina(g, t, o = {}) {
  const { x = E.W / 2, y = E.H / 2, w = 900, h = 420, rods = true, cones = false, flood = 0, dim = 0 } = o, ui = S().ui;
  g.save(); rr(g, x - w / 2, y - h / 2, w, h, 20); g.clip(); g.fillStyle = alpha(ui.bpBg, 0.95); g.fillRect(x - w / 2, y - h / 2, w, h);
  const base = y + h / 2 - 60, n = 18; const gap = w / (n + 1);
  g.fillStyle = alpha(ui.blueprint, 0.2); g.fillRect(x - w / 2, base, w, 60); seg(g, [[x - w / 2, base], [x + w / 2, base]], 3, alpha(ui.blueprint, 0.7));
  for (let i = 0; i < n; i++) {
    const px = x - w / 2 + gap * (i + 1), isCone = cones && (!rods || i % 3 === 1), isRod = rods && !isCone, col = isRod ? '#b8c8ff' : ['#ff6a5a', '#7adf8a', '#6a9aff'][i % 3];
    const on = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 2.3 + i)), lit = flood > 0 ? 1 : isCone ? 0.3 + 0.7 * (1 - dim) : 0.5 + 0.5 * on;
    if (isRod) { rr(g, px - 7, base - 250, 14, 250, 7); g.fillStyle = alpha(col, 0.35 + 0.5 * lit); g.fill(); if (flood > 0 || lit > 0.8) glow(g, px, base - 240, 40 + 70 * flood, '#ffffff', 0.4 + 0.5 * flood); }
    else if (isCone) { poly(g, [[px - 17, base], [px + 17, base], [px + 4, base - 170], [px - 4, base - 170]], alpha(col, 0.25 + 0.65 * lit * (1 - dim))); }
  }
  g.restore(); rr(g, x - w / 2, y - h / 2, w, h, 20); g.strokeStyle = alpha(ui.blueprint, 0.55); g.lineWidth = 3; g.stroke();
}
export function wavelength(g, t, o = {}) {
  const { x = 300, y = 200, w = 1320, h = 620, k = 1, peak = 9.5, maxL = 20 } = o, ui = S().ui, X = (l) => x + (l / maxL) * w;
  g.save(); seg(g, [[x, y + h], [x + w, y + h]], 3, alpha(ui.blueprint, 0.8)); seg(g, [[x, y], [x, y + h]], 3, alpha(ui.blueprint, 0.8));
  for (let l = 0; l <= maxL; l += 4) { seg(g, [[X(l), y + h], [X(l), y + h + 14]], 2, ui.blueprint); text(g, String(l), X(l), y + h + 40, { size: 24, color: alpha(ui.blueprint, 0.8), font: FONTS.ui, weight: 800 }); }
  text(g, 'WAVELENGTH (micrometres)', x + w / 2, y + h + 84, { size: 24, color: ui.blueprint, font: FONTS.ui, weight: 900, spacing: 2 });
  const f = (l) => { const s = (l - peak) / (l < peak ? 3.2 : 6.5); return Math.exp(-s * s); };
  const b0 = X(8), b1 = X(14); g.fillStyle = alpha(ui.gold, 0.13 * clamp(k * 2 - 1)); g.fillRect(b0, y, b1 - b0, h);
  g.strokeStyle = ui.gold; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); const N = Math.floor(120 * clamp(k * 1.6)); for (let i = 0; i <= N; i++) { const l = (i / 120) * maxL; const px = X(l), py = y + h - f(l) * (h - 40); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
  if (k > 0.7) { const px = X(peak), py = y + h - (h - 40); seg(g, [[px, py], [px, y + h]], 2, alpha(ui.cream, 0.6)); circle(g, px, py, 10, ui.cream); glow(g, px, py, 70, ui.gold, 0.8); text(g, `${peak} um`, px, py - 40, { size: 34, color: ui.cream, font: FONTS.ui, weight: 900 }); }
  g.restore();
}
export function photon(g, t, o = {}) { const { from, to, k = 0 } = o; const x = lerp(from[0], to[0], k), y = lerp(from[1], to[1], k); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 5; i >= 1; i--) glow(g, lerp(from[0], to[0], Math.max(0, k - i * 0.015)), lerp(from[1], to[1], Math.max(0, k - i * 0.015)), 14 + i * 3, '#fff6d8', 0.15); glow(g, x, y, 56, '#fff6d8', 0.9); circle(g, x, y, 7, '#ffffff'); g.restore(); }
