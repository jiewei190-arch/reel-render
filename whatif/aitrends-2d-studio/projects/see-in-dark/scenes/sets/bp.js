// sets/bp.js — BLUEPRINT helpers for the science explainers (navy grid, light-blue line art, GOLD labels). Built on UI.blueprint.
//   board(g, t, { title, fig })            navy grid + drawing-sheet frame + corner title block ("FIG 1 - THE HUMAN EYE")
//   draw(g, pts, k, { w, color, close })   stroke a polyline progressively: k 0..1 draws it on
//   label(g, t, { at, to, str, start })    gold label with a leader line that grows (use wordTime() for start)
//   eye(g, t, { x, y, r, k, rays, glowK, inset }) -> anchors {cornea,lens,iris,retina,fovea,nerve,vitreous}; cornea+lens+iris+retina+fovea+nerve, k = draw-on 0..1, glowK = the eyes own heat
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

// ---- clean eye cross-section: sclera, cornea bulge, iris + pupil, biconvex lens, ciliary body, retina (gold) with fovea, optic nerve ----
// Light enters from the LEFT. Returns anchor points (absolute coords) so shots can attach labels: { cornea, lens, iris, retina, fovea, nerve, vitreous, inset }
export function eye(g, t, o = {}) {
  const { x = E.W / 2, y = E.H / 2, r = 230, k = 1, rays = true, glowK = 0, inset = false } = o, ui = S().ui, c = ui.blueprint, a = clamp(k * 1.5), P = (u) => clamp(k * 2.2 - u);
  const A = { cornea: [x - 1.2 * r, y], lens: [x - 0.36 * r, y - 0.36 * r], iris: [x - 0.5 * r, y - 0.5 * r], retina: [x + 0.93 * r * Math.cos(-0.7), y + 0.93 * r * Math.sin(-0.7)], fovea: [x + 0.93 * r, y], nerve: [x + 1.45 * r, y + 0.22 * r], vitreous: [x + 0.25 * r, y], inset: [x + 0.93 * r, y] };
  g.save(); g.translate(x, y); g.globalAlpha *= a;
  const arc = (cx, cy, rad, a0, a1, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const th = lerp(a0, a1, i / n); return [cx + Math.cos(th) * rad, cy + Math.sin(th) * rad]; });
  // soft fill so the eye reads as a solid object
  g.save(); g.beginPath(); g.arc(0, 0, r, -(Math.PI - 0.62), Math.PI - 0.62); g.arc(-0.57 * r, 0, 0.63 * r, -1.97, 1.97, true); g.closePath(); g.fillStyle = alpha(c, 0.07); g.fill(); g.restore();
  draw(g, arc(0, 0, r, -(Math.PI - 0.62), Math.PI - 0.62, 70), P(0), { w: 5, color: c });                                                          // sclera (back wall)
  draw(g, arc(0, 0, r * 0.955, -(Math.PI - 0.7), Math.PI - 0.7, 70), P(0.2), { w: 2, color: alpha(c, 0.45) });                                       // choroid (thin inner line)
  draw(g, arc(-0.57 * r, 0, 0.63 * r, 1.97, 2 * Math.PI - 1.97, 40).reverse(), P(0.2), { w: 5, color: c });                                            // cornea bulge
  draw(g, arc(-0.57 * r, 0, 0.57 * r, 2.05, 2 * Math.PI - 2.05, 40).reverse(), P(0.35), { w: 2.2, color: alpha(c, 0.55) });                          // cornea thickness
  // iris leaflets (thick) with the pupil gap between them
  const ix = -0.5 * r;
  draw(g, [[ix + 0.02 * r, -0.86 * r], [ix, -0.46 * r], [ix - 0.02 * r, -0.2 * r]], P(0.5), { w: 9, color: alpha(ui.cream, 0.85) });
  draw(g, [[ix + 0.02 * r, 0.86 * r], [ix, 0.46 * r], [ix - 0.02 * r, 0.2 * r]], P(0.5), { w: 9, color: alpha(ui.cream, 0.85) });
  // biconvex lens (two arcs) + ciliary muscles + suspensory ligaments
  const lx = -0.36 * r, lw = 0.13 * r, lh = 0.36 * r;
  g.save(); g.beginPath(); g.moveTo(lx, -lh); g.quadraticCurveTo(lx - lw * 1.9, 0, lx, lh); g.quadraticCurveTo(lx + lw * 1.9, 0, lx, -lh); g.closePath(); g.fillStyle = alpha(ui.cream, 0.08 * P(0.6)); g.fill(); g.restore();
  draw(g, [[lx, -lh], ...Array.from({ length: 16 }, (_, i) => { const u = (i + 1) / 16; return [lx - Math.sin(u * Math.PI) * lw * 0.95, -lh + u * lh * 2]; })], P(0.6), { w: 4.5, color: ui.cream });
  draw(g, [[lx, -lh], ...Array.from({ length: 16 }, (_, i) => { const u = (i + 1) / 16; return [lx + Math.sin(u * Math.PI) * lw * 0.95, -lh + u * lh * 2]; })], P(0.6), { w: 4.5, color: ui.cream });
  for (const sg of [-1, 1]) {
    draw(g, [[lx, sg * lh], [lx - 0.05 * r, sg * 0.62 * r], [lx - 0.06 * r, sg * 0.74 * r]], P(0.7), { w: 1.8, color: alpha(c, 0.6) });
    g.save(); g.translate(lx - 0.08 * r, sg * 0.78 * r); g.rotate(-0.4 * sg); g.strokeStyle = c; g.lineWidth = 3.5; g.globalAlpha *= P(0.75); g.beginPath(); g.ellipse(0, 0, 0.12 * r, 0.05 * r, 0, 0, 7); g.stroke(); g.restore();
  }
  // retina: thick gold arc with a dip (fovea) + the gap where the nerve leaves
  draw(g, arc(0, 0, r * 0.93, -1.05, -0.12, 30), P(0.85), { w: 9, color: ui.gold }); draw(g, arc(0, 0, r * 0.93, 0.12, 1.05, 30), P(0.85), { w: 9, color: ui.gold });
  draw(g, [[r * 0.93 * Math.cos(-0.12), r * 0.93 * Math.sin(-0.12)], [r * 0.86, -0.04 * r], [r * 0.86, 0.04 * r], [r * 0.93 * Math.cos(0.12), r * 0.93 * Math.sin(0.12)]], P(0.9), { w: 9, color: ui.gold });
  const nerve = [[r * 0.93, 0.08 * r], [r * 1.18, 0.14 * r], [r * 1.42, 0.2 * r], [r * 1.72, 0.3 * r]];
  draw(g, nerve, P(0.9), { w: 17, color: alpha(c, 0.5) }); draw(g, nerve, P(0.9), { w: 3, color: alpha(c, 0.95) });
  if (inset && k > 0.8) { const ph = (t * 1.3) % 1; g.save(); g.setLineDash([8, 9]); g.lineDashOffset = -ph * 34; g.strokeStyle = ui.gold; g.lineWidth = 3; g.beginPath(); g.arc(r * 0.93, 0, r * 0.2, 0, 7); g.stroke(); g.restore(); }
  if (glowK > 0) {
    const pulse = 0.7 + 0.3 * Math.sin(t * 3); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, r * 0.3, 0, r * 1.1, '#ff7a30', 0.5 * glowK * pulse); g.restore();
    for (let i = 0; i < 6; i++) { const th = -0.9 + i * 0.36, ph = (t * 0.9 + i / 6) % 1; seg(g, [[Math.cos(th) * r * (0.5 + ph * 0.4), Math.sin(th) * r * (0.5 + ph * 0.4)], [Math.cos(th) * r * (0.6 + ph * 0.4), Math.sin(th) * r * (0.6 + ph * 0.4)]], 3, alpha('#ff8a40', 0.8 * (1 - ph) * glowK)); }
  }
  // light rays enter from the left, bend at the cornea + lens, converge on the fovea
  if (rays && k >= 0.9) for (let i = -2; i <= 2; i++) {
    const yy = i * 0.2 * r, ph = (t * 0.55 + i * 0.07) % 1, pts = [[-2.1 * r, yy], [-1.2 * r, yy * 0.96], [lx - lw, yy * 0.5], [r * 0.93, 0]];
    const D = []; let L = 0; for (let j = 1; j < 4; j++) { const d = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); D.push(d); L += d; }
    const at = (u) => { let d = u * L; for (let j = 0; j < 3; j++) { if (d <= D[j]) { const f = d / D[j]; return [lerp(pts[j][0], pts[j + 1][0], f), lerp(pts[j][1], pts[j + 1][1], f)]; } d -= D[j]; } return pts[3]; };
    draw(g, pts, 1, { w: 1.6, color: alpha(ui.cream, 0.28) });
    const q0 = at(clamp(ph)), q1 = at(clamp(ph + 0.07)); seg(g, [q0, q1], 4.5, alpha('#fff6d8', 0.95)); glow(g, q1[0], q1[1], 16, '#fff6d8', 0.5);
  }
  g.restore();
  return A;
}
// ---- retina inset: light enters from the TOP, passes nerve/ganglion/bipolar cells, hits the receptors (rods = long capsules with disc stripes, cones = tapered), pigment layer at the base ----
export function retina(g, t, o = {}) {
  const { x = E.W / 2, y = E.H / 2, w = 900, h = 420, rods = true, cones = false, flood = 0, dim = 0 } = o, ui = S().ui, x0 = x - w / 2, y0 = y - h / 2;
  g.save(); rr(g, x0, y0, w, h, 20); g.clip(); g.fillStyle = alpha(ui.bpBg, 0.97); g.fillRect(x0, y0, w, h);
  const base = y0 + h - 44, top = y0 + 128, n = Math.max(8, Math.round(w / 52)), gap = w / (n + 1);
  g.fillStyle = alpha(ui.blueprint, 0.1); g.fillRect(x0, y0, w, 112);
  for (let i = 0; i < n + 1; i++) { const cx = x0 + gap * (i + 0.5), cy = y0 + 28 + (i % 2) * 24; circle(g, cx, cy, 9, alpha(ui.blueprint, 0.45)); seg(g, [[cx, cy + 9], [cx + (i % 3 - 1) * 8, y0 + 112]], 1.6, alpha(ui.blueprint, 0.4)); }
  text(g, 'NERVE CELLS', x0 + 18, y0 + 98, { size: 16, color: alpha(ui.blueprint, 0.75), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  g.fillStyle = alpha('#3a1a3a', 0.9); g.fillRect(x0, base, w, 44); g.fillStyle = alpha('#ff9a6a', 0.14); g.fillRect(x0, base, w, 6); seg(g, [[x0, base], [x0 + w, base]], 3, alpha(ui.blueprint, 0.8));
  for (let i = 0; i < n; i++) {
    const px = x0 + gap * (i + 1), isCone = cones && (!rods || i % 3 === 1), isRod = rods && !isCone, hue = ['#ff6a5a', '#7adf8a', '#6a9aff'][i % 3];
    const on = 0.5 + 0.5 * Math.sin(t * 2.3 + i * 1.7), lit = flood > 0 ? 1 : isCone ? 0.3 + 0.7 * (1 - dim) : 0.45 + 0.55 * on;
    if (isRod) {
      const ln = base - top - ((i * 37) % 22);
      g.save(); rr(g, px - 7, base - ln, 14, ln, 7); g.fillStyle = alpha('#b8c8ff', 0.2 + 0.55 * lit); g.fill(); g.clip(); for (let yy = base - ln + 8; yy < base - 40; yy += 9) seg(g, [[px - 8, yy], [px + 8, yy]], 1.4, alpha('#1a2a5a', 0.55)); g.restore();
      rr(g, px - 7, base - ln, 14, ln, 7); g.strokeStyle = alpha('#d8e4ff', 0.6); g.lineWidth = 1.6; g.stroke(); rr(g, px - 4, base - 38, 8, 38, 4); g.fillStyle = alpha('#b8c8ff', 0.5); g.fill();
      if (flood > 0 || lit > 0.8) glow(g, px, base - ln + 12, 36 + 76 * flood, '#ffffff', 0.35 + 0.5 * flood);
    } else if (isCone) {
      const ln = base - top - 70; poly(g, [[px - 17, base], [px + 17, base], [px + 4, base - ln], [px - 4, base - ln]], alpha(hue, 0.22 + 0.65 * lit * (1 - dim)));
      g.strokeStyle = alpha('#fff', 0.55); g.lineWidth = 1.6; g.beginPath(); g.moveTo(px - 17, base); g.lineTo(px - 4, base - ln); g.lineTo(px + 4, base - ln); g.lineTo(px + 17, base); g.stroke();
      rr(g, px - 10, base - 44, 20, 44, 6); g.fillStyle = alpha(hue, 0.3 + 0.4 * lit * (1 - dim)); g.fill(); if (lit * (1 - dim) > 0.7) glow(g, px, base - ln + 8, 34, hue, 0.5);
    }
  }
  const ph = (t * 0.7) % 1; for (let i = 0; i < 4; i++) { const f = (ph + i * 0.25) % 1, px = x0 + w * (0.18 + i * 0.22), yy = y0 + f * (h - 70); seg(g, [[px, yy], [px, yy + 24]], 3, alpha('#fff6d8', 0.7 * (1 - Math.abs(0.5 - f) * 1.4))); }
  g.restore(); rr(g, x0, y0, w, h, 20); g.strokeStyle = alpha(ui.blueprint, 0.7); g.lineWidth = 3; g.stroke();
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
