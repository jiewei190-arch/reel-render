// B_lib.js — shared helpers for stop-time batch B (s036-s068). Registers no shots. Classic What If style.
// freeze.js (H1) had not landed when this batch was written, so the freeze pieces are drawn LOCALLY here, per the HANDOFF descriptions:
//   freezeGrade(g, k)                   cool blue-grey desaturation of everything drawn so far + hanging dust motes (draw the HERO after it)
//   airSpeckle(g, t, { k, frozen, bubble: { x, y, r }, seed })   the WALL OF AIR: a cream molecule speckle field; inside `bubble` it jiggles
//   snapRing(g, t, at, x, y, s)        the finger-snap ring ripple from the fingertips
//   unfreeze(g, t, at)                 the unfreeze whoosh: a warm wave sweeping across the frame
//   frozenSparkle(g, t, x, y, s)       the tiny 'still' sparkle on frozen people / the cat
//   readout(g, t, sec)                 the 10-second read-out: stopprops STOPWATCH as a small HUD dial top-right (gold digits)
// HERO (cast.js + LOCAL trims):
//   hero(g, o)          actor('HERO') + cowlick, round tortoiseshell glasses, cream stripes + long sleeves, stars on the pyjamas,
//                       mismatched socks, the chunky black watch on the left wrist (o.pose required)
//   heroFace(g, cx, cy, r, o)   giantFace HERO + cowlick, glasses, a striped crew-neck; o.puff (0..1) puffed cheeks
//   leapCat(g, x, y, s, o)      Biscuit frozen mid-leap (stretched, paws out), o.rot
// LOCAL props: magnifier, plinth, jet, scale (bathroom), gloves, orange, flowMeter, ballAt
import { E, S, clamp, lerp, ease, prog, rng, noise, seg, circle, ring, rr, poly, alpha, shade, glow, text, FONTS } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { cat } from '../sets/creatures.js';
import { giantFace } from '../sets/faces.js';
import { stopwatch } from '../sets/stopprops.js';

export const GOLD = '#FFC93C', CREAM = '#f3ead2', CORAL = '#FF6B5B', INK = '#1a1622';
export const W = (o, p) => { const s = o.s ?? 1.9, f = o.facing ?? 1; return [o.x + p[0] * f * s, o.y + p[1] * s]; };

// ---------------------------------------------------------------- FREEZE (local stand-ins for freeze.js)
export function freezeGrade(g, k) {
  if (k <= 0.001) return; const c = g.canvas;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = clamp(k); g.filter = `saturate(${(1 - 0.75 * k).toFixed(2)}) brightness(${(1 - 0.06 * k).toFixed(2)})`; g.drawImage(c, 0, 0); g.filter = 'none';
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.35 * k; g.fillStyle = '#9ab4d8'; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.12 * k; g.fillStyle = '#c8d8ff'; g.fillRect(0, 0, c.width, c.height); g.restore();
  const r = rng(77); g.save(); for (let i = 0; i < 60; i++) { g.globalAlpha = 0.5 * k * (0.4 + r() * 0.6); circle(g, r() * E.W, r() * E.H, 1.5 + r() * 2.5, '#eef4ff'); } g.restore();
}
export function airSpeckle(g, t, o = {}) {
  const k = clamp(o.k ?? 1), r = rng(o.seed ?? 9), b = o.bubble, n = o.n ?? 900; if (k <= 0) return;
  g.save(); g.globalAlpha *= k;
  for (let i = 0; i < n; i++) { let x = (o.x0 ?? 0) + r() * (o.w ?? E.W), y = (o.y0 ?? 0) + r() * (o.h ?? E.H); const ph = r() * 6.28, sz = 1.4 + r() * 2.4;
    const inB = b && Math.hypot(x - b.x, y - b.y) < b.r; if (inB || o.frozen === false) { x += Math.sin(t * 9 + ph) * 8; y += Math.cos(t * 11 + ph) * 8; }
    circle(g, x, y, sz, inB ? alpha('#ffffff', 0.85) : alpha(CREAM, 0.55)); }
  if (b) { g.strokeStyle = alpha('#ffffff', 0.35); g.lineWidth = 3; g.setLineDash([10, 12]); g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.stroke(); g.setLineDash([]); }
  g.restore();
}
export function snapRing(g, t, at, x, y, s = 1) { const u = t - at; if (u < 0 || u > 0.9) return; const k = u / 0.9; for (let i = 0; i < 3; i++) { const kk = clamp(k * 1.4 - i * 0.18); if (kk <= 0 || kk >= 1) continue; g.save(); g.strokeStyle = alpha('#e8f4ff', 1 - kk); g.lineWidth = 8 * s * (1 - kk); g.beginPath(); g.arc(x, y, (20 + kk * 900) * s, 0, 7); g.stroke(); g.restore(); } glow(g, x, y, 120 * s, '#ffffff', 0.5 * (1 - k)); }
export function unfreeze(g, t, at) { const u = t - at; if (u < 0 || u > 0.7) return; const k = u / 0.7, x = lerp(-300, E.W + 300, ease.inOut(k)); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(x - 300, 0, x + 300, 0); gr.addColorStop(0, 'rgba(255,220,160,0)'); gr.addColorStop(0.5, `rgba(255,220,160,${0.45 * (1 - k)})`); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.fillRect(x - 300, 0, 600, E.H); g.restore(); }
export function frozenSparkle(g, t, x, y, s = 1) { const k = 0.5 + 0.5 * Math.sin(t * 3 + x); g.save(); g.translate(x, y); g.scale(s * k, s * k); poly(g, [[0, -16], [3, -3], [16, 0], [3, 3], [0, 16], [-3, 3], [-16, 0], [-3, -3]], '#eef6ff'); g.restore(); }
export function readout(g, t, sec) { stopwatch(g, t, { x: E.W - 150, y: 160, s: 0.55, sec: clamp(sec, 0, 10), running: sec < 10 }); if (sec >= 10) glow(g, E.W - 150, 190, 90, GOLD, 0.35); }

// ---------------------------------------------------------------- HERO (cast + local trims)
export function heroTrim(g, o, pose) {
  const s = o.s ?? 1.9, f = o.facing ?? 1, [hx, hy] = W(o, pose.head), [sx, sy] = W(o, pose.sh), [px, py] = W(o, pose.hip);
  // cream stripes on the tee + long sleeves
  for (let i = 1; i <= 3; i++) { const u = i / 4; seg(g, [[lerp(sx, px, u) - 12 * s, lerp(sy, py, u)], [lerp(sx, px, u) + 12 * s, lerp(sy, py, u)]], 2.6 * s, '#efe3c8'); }
  for (const [e, h] of [['eF', 'hF'], ['eB', 'hB']]) { const [ex, ey] = W(o, pose[e]), [wx, wy] = W(o, pose[h]); seg(g, [[ex, ey], [lerp(ex, wx, 0.85), lerp(ey, wy, 0.85)]], 7 * s, '#2f8f8a'); seg(g, [[lerp(ex, wx, 0.3), lerp(ey, wy, 0.3)], [lerp(ex, wx, 0.36), lerp(ey, wy, 0.36)]], 7 * s, '#efe3c8'); }
  // the chunky watch (left wrist = far hand when facing right)
  const [wx, wy] = W(o, pose.hB), [ex2, ey2] = W(o, pose.eB); rr(g, lerp(ex2, wx, 0.8) - 6 * s, lerp(ey2, wy, 0.8) - 5 * s, 12 * s, 10 * s, 2 * s); g.fillStyle = '#111'; g.fill(); g.fillStyle = '#9ab89a'; rr(g, lerp(ex2, wx, 0.8) - 3.5 * s, lerp(ey2, wy, 0.8) - 2.5 * s, 7 * s, 5 * s, 1 * s); g.fill();
  // stars on the pyjama legs
  for (const [k, ft] of [['kF', 'fF'], ['kB', 'fB']]) { const [kx, ky] = W(o, pose[k]), [fx, fy] = W(o, pose[ft]); for (const u of [0.3, 0.7]) circle(g, lerp(kx, fx, u) + 2 * s, lerp(ky, fy, u), 1.4 * s, '#efe3c8'); }
  // mismatched socks (green front, yellow back)
  const sock = (ft, col) => { const [fx, fy] = W(o, pose[ft]); rr(g, fx - 6 * s, fy - 9 * s, 14 * s, 9 * s, 3 * s); g.fillStyle = col; g.fill(); };
  sock('fB', '#ffd23c'); sock('fF', '#3aa05a');
  // cowlick + glasses
  seg(g, [[hx - 2 * s * f, hy - 24 * s], [hx - 4 * s * f, hy - 40 * s], [hx + 2 * s * f, hy - 46 * s]], 3.2 * s, '#16141c');
  if (!o.noGlasses) { g.save(); g.strokeStyle = '#8a5a2b'; g.lineWidth = 2.2 * s; for (const d of [5, 17]) { g.beginPath(); g.arc(hx + d * s * f, hy - 3 * s, 6 * s, 0, 7); g.stroke(); } seg(g, [[hx + 11 * s * f - 1, hy - 3 * s], [hx + 11 * s * f + 1, hy - 3 * s]], 2 * s, '#8a5a2b'); g.restore(); }
}
export function hero(g, o) { actor(g, 'HERO', o); if (o.pose) heroTrim(g, o, o.pose); }
export function heroFace(g, cx, cy, r, o = {}) {
  giantFace(g, cx, cy, r, { who: 'HERO', ...o });
  // striped crew-neck over the shoulders
  g.save(); g.beginPath(); g.ellipse(cx, cy + r * 1.55, r * 1.25, r * 0.65, 0, Math.PI, 0); g.closePath(); g.fillStyle = '#2f8f8a'; g.fill(); g.clip();
  for (let i = 0; i < 6; i++) { g.fillStyle = '#efe3c8'; g.fillRect(cx - r * 1.3, cy + r * 0.98 + i * r * 0.14, r * 2.6, r * 0.05); } g.restore();
  g.save(); g.strokeStyle = '#efe3c8'; g.lineWidth = r * 0.04; g.beginPath(); g.arc(cx, cy + r * 0.9, r * 0.3, 0.2, Math.PI - 0.2); g.stroke(); g.restore();
  // cowlick + glasses
  g.save(); g.strokeStyle = '#16141c'; g.lineWidth = r * 0.07; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - r * 0.05, cy - r * 0.95); g.quadraticCurveTo(cx - r * 0.12, cy - r * 1.3, cx + r * 0.05, cy - r * 1.42); g.stroke();
  const ey = cy - r * 0.08 + (o.look ? o.look[1] * r * 0.02 : 0); g.strokeStyle = '#8a5a2b'; g.lineWidth = r * 0.045; for (const sd of [-1, 1]) { g.beginPath(); g.arc(cx + sd * r * 0.33, ey, r * 0.24, 0, 7); g.stroke(); } seg(g, [[cx - r * 0.09, ey], [cx + r * 0.09, ey]], r * 0.04, '#8a5a2b'); g.restore();
  if (o.puff) { for (const sd of [-1, 1]) { circle(g, cx + sd * r * 0.55, cy + r * 0.35, r * 0.24 * o.puff, alpha('#2a2230', 0.95)); circle(g, cx + sd * r * 0.55, cy + r * 0.35, r * 0.16 * o.puff, alpha('#ff8a8a', 0.35)); } }
}
export function leapCat(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(1.25, 0.85); cat(g, { x: 0, y: 0, s, facing: o.facing ?? 1, pose: 'stand', eyes: o.eyes ?? 'wide', t: o.t ?? 0 }); g.restore();
  const f = o.facing ?? 1; for (const d of [1, 0.7]) { seg(g, [[x + f * 70 * s * d, y - 40 * s], [x + f * 140 * s * d, y - 30 * s]], 10 * s, '#2a2230'); circle(g, x + f * 140 * s * d, y - 30 * s, 8 * s, '#2a2230'); } }

// ---------------------------------------------------------------- local props
export function magnifier(g, x, y, r, inner) { g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = alpha('#e8f4ff', 0.25); g.fill(); g.clip(); if (inner) inner(g); g.restore(); ring(g, x, y, r, 12, CREAM); ring(g, x, y, r + 6, 3, INK); seg(g, [[x + r * 0.72, y + r * 0.72], [x + r * 1.2, y + r * 1.2]], 24, CREAM); }
export function plinth(g, x, y, w, h, k = 1) { const hh = h * clamp(k); if (hh <= 1) return; rr(g, x - w / 2, y, w, hh, 6); g.fillStyle = '#e8e0cc'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); rr(g, x - w / 2 - 20, y, w + 40, 24, 6); g.fillStyle = '#f2ead8'; g.fill(); g.stroke(); if (k > 0.8) { rr(g, x - 110, y + 60, 220, 44, 6); g.fillStyle = '#c8a050'; g.fill(); g.stroke(); text(g, 'BOY IN PYJAMAS', x, y + 83, { size: 20, color: INK, font: FONTS.ui, weight: 900 }); } }
export function jet(g, x, y, s = 1, col = CREAM) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.moveTo(-200, 0); g.quadraticCurveTo(-210, -26, -170, -26); g.lineTo(180, -26); g.quadraticCurveTo(230, -20, 230, 0); g.quadraticCurveTo(200, 14, -170, 14); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(-40, -10); g.lineTo(-110, 80); g.lineTo(-60, 80); g.lineTo(40, -10); g.moveTo(-170, -26); g.lineTo(-200, -90); g.lineTo(-150, -90); g.lineTo(-120, -26); g.stroke(); for (let i = 0; i < 8; i++) circle(g, -120 + i * 34, -8, 5, col); g.restore(); }
export function bathScale(g, x, y, s = 1, needle = 0) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -200, -60, 400, 80, 20); g.strokeStyle = CREAM; g.lineWidth = 6; g.stroke(); g.beginPath(); g.arc(0, -20, 50, Math.PI, 0); g.stroke(); seg(g, [[0, -20], [Math.cos(Math.PI + 0.3 + needle * 2.4) * 44, -20 + Math.sin(Math.PI + 0.3 + needle * 2.4) * 44]], 5, GOLD); g.restore(); }
export function glove(g, x, y, s = 1, flip = 1, col = CREAM) { g.save(); g.translate(x, y); g.scale(s * flip, s); g.strokeStyle = col; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-60, 80); g.lineTo(-60, -10); for (let i = 0; i < 4; i++) { g.lineTo(-56 + i * 30, -90 + Math.abs(i - 1.5) * 16); g.lineTo(-34 + i * 30, -90 + Math.abs(i - 1.5) * 16); g.lineTo(-34 + i * 30, -20); } g.lineTo(70, -10); g.lineTo(90, 20); g.lineTo(60, 80); g.closePath(); g.stroke(); rr(g, -70, 70, 140, 40, 10); g.stroke(); g.restore(); }
export function orange(g, x, y, r = 34, rot = 0) { circle(g, x, y, r, '#ff9a2a'); ring(g, x, y, r, 4, INK); circle(g, x - r * 0.3, y - r * 0.3, r * 0.25, alpha('#ffd08a', 0.7)); g.save(); g.translate(x, y); g.rotate(rot); seg(g, [[0, -r], [6, -r - 10]], 4, '#3a6a2a'); g.restore(); }
export function arrowG(g, x1, y1, x2, y2, col = GOLD, w = 10) { seg(g, [[x1, y1], [x2, y2]], w, col); const a = Math.atan2(y2 - y1, x2 - x1); poly(g, [[x2 + Math.cos(a) * 20, y2 + Math.sin(a) * 20], [x2 + Math.cos(a + 2.4) * 26, y2 + Math.sin(a + 2.4) * 26], [x2 + Math.cos(a - 2.4) * 26, y2 + Math.sin(a - 2.4) * 26]], col); }
export function goldTag(g, t, t0, str, x, y, o = {}) {
  const k = ease.outBack(prog(t, t0, t0 + 0.35)); if (k <= 0.01) return; const sz = o.size ?? 44, col = o.color ?? GOLD;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(k, k); g.font = `900 ${sz}px "${FONTS.ui}"`; const w = g.measureText(str).width + 50; rr(g, -w / 2, -sz * 0.7, w, sz * 1.4, sz * 0.7); g.fillStyle = 'rgba(14,10,20,.88)'; g.fill(); g.strokeStyle = alpha(col, 0.9); g.lineWidth = 4; g.stroke();
  text(g, str, 0, 2, { size: sz, color: col, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(col, 0.5) }); g.restore();
}
export const push = (g, t, dur, k, fn) => { const z = 1 + (k ?? 0.04) * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(g); g.restore(); };
