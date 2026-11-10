// B_lib.js — helpers shared by the batch-B shot files (s040-s081). Registers no shots.
//   W(word, info, fb, after)   shot-local seconds of a spoken word (fallback fb; `after` = shot-local time to search from)
//   handWorld(o, pose, hand)   world position of a hand (copied from S_showcase.js)
//   scr(cam, X, Y, depth)      world point -> screen point (HUD tracks, screen-space labels)
//   punch(t, t0, a)            0..1..0 envelope for punch zooms and shakes
//   props drawn locally (sets are read-only): remote, card, warmer, goggles, cyclist, devBeanie, stamp, swatch, glassPane
import { E, S, wordTime, clamp, lerp, ease, prog, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, measure, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';

export const W = (w, info, fb = 0.4, after = 0) => { const st = info.shot.start, g = wordTime(w, st + after); return g == null || g > info.shot.end + 0.3 ? fb : g - st; };
export const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
export const scr = (cam, X, Y, d = 1) => { const z = 1 + ((cam.z ?? 1) - 1) * d; return [(X - E.W / 2 - (cam.x || 0) * d) * z + E.W / 2, (Y - E.H / 2 - (cam.y || 0) * d) * z + E.H / 2]; };
export const punch = (t, t0, rise = 0.1, fall = 0.45) => ease.out(prog(t, t0, t0 + rise)) * (1 - ease.out(prog(t, t0 + rise, t0 + rise + fall)));

// TV remote; x,y = the grip point
export function remote(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.4); g.scale(s, s); rr(g, -9, -50, 18, 60, 7); g.fillStyle = o.fill || '#23222c'; g.fill();
  if (!o.flat) { g.strokeStyle = alpha('#fff', 0.15); g.lineWidth = 1.5; g.stroke(); circle(g, 0, -40, 3.4, '#e0453a'); for (let i = 0; i < 3; i++) for (const dx of [-4, 4]) circle(g, dx, -28 + i * 9, 2.2, '#6a6a80'); } g.restore(); }

// greeting card: o.open 0..1 (0 = closed front), o.text 0..1 legible, o.flat for thermal
export function card(g, x, y, w, h, o = {}) {
  const { rot = 0, text: tk = 1, flat = false, fill = '#f4ead6' } = o; g.save(); g.translate(x, y); g.rotate(rot);
  if (!flat) { g.fillStyle = alpha('#000', 0.3); rr(g, -w / 2 + 8, -h / 2 + 10, w, h, 8); g.fill(); }
  rr(g, -w / 2, -h / 2, w, h, 8); g.fillStyle = fill; g.fill(); if (flat) { g.restore(); return; }
  g.strokeStyle = alpha('#000', 0.18); g.lineWidth = 2; g.stroke();
  const cols = ['#e0453a', '#f08a24', '#e9c12e', '#3fae5a', '#3f7fd6', '#8a5ad6'];
  for (let i = 0; i < 9; i++) { g.fillStyle = alpha(cols[i % 6], 0.85); g.beginPath(); g.arc(-w * 0.42 + (i % 3) * w * 0.06, -h * 0.4 + Math.floor(i / 3) * h * 0.07, w * 0.02, 0, 7); g.fill(); }   // confetti dots
  if (tk > 0) { g.save(); g.globalAlpha *= tk; const lines = o.lines || ['GET WELL', 'SOON']; const fs = Math.min(h * 0.2, w * 0.13);
    lines.forEach((ln, i) => { let cx = -measure(g, ln, fs, FONTS.title, 700) / 2; [...ln].forEach((ch, j) => { text(g, ch, cx, -h * 0.12 + i * fs * 1.12, { size: fs, color: cols[(i * 2 + j) % 6], font: FONTS.title, weight: 700, align: 'left' }); cx += measure(g, ch, fs, FONTS.title, 700); }); });
    if (o.bandage !== false) { g.save(); g.translate(w * 0.3, h * 0.3); g.rotate(-0.5); rr(g, -w * 0.12, -h * 0.05, w * 0.24, h * 0.1, h * 0.05); g.fillStyle = '#f0c8a0'; g.fill(); rr(g, -w * 0.04, -h * 0.05, w * 0.08, h * 0.1, 3); g.fillStyle = '#e0a880'; g.fill(); g.restore(); }
    g.restore(); }
  g.restore();
}

// hand warmer: a small red pouch with a white "HOT" patch; o.lit adds the faint orange glow; consistent with batch C's payoff
export const WARMER = { w: 46, h: 32, color: '#d94a3a' };
export function warmer(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); rr(g, -WARMER.w / 2, -WARMER.h / 2, WARMER.w, WARMER.h, 10); g.fillStyle = o.fill || WARMER.color; g.fill();
  if (!o.flat) { g.strokeStyle = shade(WARMER.color, -0.4); g.lineWidth = 2; g.stroke(); for (const dx of [-14, 14]) seg(g, [[dx, -WARMER.h / 2 + 3], [dx, WARMER.h / 2 - 3]], 1.4, alpha('#fff', 0.25));
    rr(g, -13, -8, 26, 16, 5); g.fillStyle = '#f4ead6'; g.fill(); text(g, 'HOT', 0, 1, { size: 11, color: WARMER.color, font: FONTS.ui, weight: 900 }); }
  g.restore(); if (o.lit) { glow(g, x, y, 70 * s, '#ff9a50', 0.45 * o.lit); glow(g, x, y, 26 * s, '#ffd8a0', 0.4 * o.lit); }
}

// Dev's orange beanie over a giantFace head of radius r centred at (cx, cy) (faces.js has no DEV headwear yet)
export function devBeanie(g, cx, cy, r, o = {}) { const c = '#f08a24', tilt = o.tilt || 0; g.save(); g.translate(cx, cy); g.rotate(tilt);
  g.fillStyle = c; g.beginPath(); g.moveTo(-r * 0.98, -r * 0.5); g.quadraticCurveTo(-r * 1.0, -r * 1.38, 0, -r * 1.4); g.quadraticCurveTo(r * 1.0, -r * 1.38, r * 0.98, -r * 0.5); g.closePath(); g.fill();
  for (let i = -4; i <= 4; i++) seg(g, [[i * r * 0.19, -r * 0.66], [i * r * 0.16, -r * 1.22]], r * 0.025, shade(c, -0.18));
  rr(g, -r * 1.04, -r * 0.7, r * 2.08, r * 0.26, r * 0.13); g.fillStyle = shade(c, -0.12); g.fill(); circle(g, 0, -r * 1.46, r * 0.16, shade(c, 0.1)); g.restore(); }

// big rubber stamp (10/10 etc.): k 0..1 slam progress
export function stamp(g, x, y, str, k, o = {}) { if (k <= 0) return; const col = o.color || S().ui.gold, ss = lerp(2.6, 1, ease.out(clamp(k * 1.4))); g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.16); g.scale(ss, ss); g.globalAlpha *= clamp(k * 3);
  const w = o.w || 460, h = o.h || 230; rr(g, -w / 2, -h / 2, w, h, 28); g.strokeStyle = col; g.lineWidth = 14; g.stroke(); rr(g, -w / 2 + 22, -h / 2 + 22, w - 44, h - 44, 18); g.lineWidth = 4; g.stroke();
  text(g, str, 0, 8, { size: o.size || 150, color: col, font: FONTS.title, weight: 700, glow: 26, glowColor: alpha(col, 0.7), stroke: 10, strokeColor: 'rgba(0,0,0,.55)' }); g.restore(); }

// coloured card swatch for the gecko test
export function swatch(g, x, y, w, h, col, o = {}) { g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, -w / 2 + 6, -h + 6, w, h, 8); g.fill(); rr(g, -w / 2, -h, w, h, 8); g.fillStyle = col; g.fill(); g.strokeStyle = alpha('#fff', 0.35); g.lineWidth = 3; g.stroke(); if (o.ring) { ring(g, 0, -h / 2, Math.max(w, h) * 0.75, 6, alpha('#ffd47e', o.ring)); glow(g, 0, -h / 2, w * 1.2, '#ffd47e', 0.3 * o.ring); } g.restore(); }

// a cyclist (bike + rider in a riding pose) drawn with the rig through `drawActor` (actor or heatActor); returns head-lamp world point
const rideP = (t) => { const a = t * 8; return { head: [30, -214], sh: [18, -180], hip: [-26, -128], eF: [44, -150], hF: [70, -140], eB: [40, -148], hB: [66, -138],
  kF: [10 + Math.cos(a) * 10, -92 + Math.sin(a) * 12], fF: [6 + Math.cos(a) * 26, -46 + Math.sin(a) * 26], kB: [10 + Math.cos(a + 3.14) * 10, -92 + Math.sin(a + 3.14) * 12], fB: [6 + Math.cos(a + 3.14) * 26, -46 + Math.sin(a + 3.14) * 26] }; };
export function cyclist(g, x, y, s, t, o = {}) {
  const f = o.facing ?? 1, frame = o.frame || '#2a2834', tyre = o.tyre || '#0e0c14', spin = t * 9;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  if (!o.noBike) { for (const wx of [-84, 84]) { g.lineWidth = 8; g.strokeStyle = tyre; g.beginPath(); g.arc(wx, -46, 46, 0, 7); g.stroke(); if (o.hubs) { g.fillStyle = o.hubs; g.beginPath(); g.arc(wx, -46, 8, 0, 7); g.fill(); }
      if (!o.flat) for (let i = 0; i < 8; i++) { const a = spin + i * 0.785; seg(g, [[wx, -46], [wx + Math.cos(a) * 42, -46 + Math.sin(a) * 42]], 1.2, alpha('#9a96a8', 0.45)); } }
    seg(g, [[-84, -46], [-20, -46], [40, -118], [-34, -118], [-84, -46]], 6, frame); seg(g, [[-20, -46], [-30, -130]], 6, frame); seg(g, [[40, -118], [84, -46]], 6, frame); seg(g, [[40, -118], [48, -144], [70, -146]], 6, frame); seg(g, [[-44, -134], [-18, -134]], 9, frame); }
  g.restore();
  o.draw?.({ x: x - 8 * s * f, y: y + 0, s: s * 0.95, facing: f, pose: rideP(t) });
  return [x + 72 * s * f, y - 150 * s];
}

// glass pane seen edge-on: a thin cool slab with glints; o.shudder 0..1
export function glassPane(g, x, y0, y1, o = {}) { const sh = (o.shudder || 0) * Math.sin((o.t || 0) * 60) * 4; g.save(); g.fillStyle = alpha('#cfe0ff', 0.08); g.fillRect(x - 6 + sh, y0, 14, y1 - y0); seg(g, [[x + sh, y0], [x + sh, y1]], 3, alpha('#e0ecff', 0.35 + 0.5 * (o.shudder || 0)));
  for (const [a, b] of [[0.12, 0.22], [0.3, 0.36]]) seg(g, [[x + 3 + sh, lerp(y0, y1, a)], [x + 3 + sh, lerp(y0, y1, b)]], 5, alpha('#ffffff', 0.4)); g.restore(); }
