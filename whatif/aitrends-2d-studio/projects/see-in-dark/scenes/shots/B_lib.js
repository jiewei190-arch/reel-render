// B_lib.js — helpers shared by the batch-B shot files (s040-s081). No shots registered here.
//   W(word, info, fallback)  shot-local seconds when `word` is spoken (falls back to `fallback`)
//   push(t, info, a, b)      camera keyed from a -> b over the whole shot with ease.inOut (a, b = {x, y, z, r})
//   scr(cam, X, Y)           world point (depth 1) -> screen point, for HUD tracks and screen-space labels
//   hand(o, 'F'|'B')         world position of an actor's hand (o = the same opts passed to actor())
//   small local props: remote, kitten, card, warmer, goggles, gecko, bike, stopwatch, journal, thermometer, clockTower, lightSwitch
import { E, V, S, clamp, lerp, prog, ease, wordTime, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';

export const W = (word, info, fb = 0.4) => { const st = info.shot.start, w = wordTime(word, st); return w == null || w > info.shot.end + 0.2 ? fb : w - st; };
export const push = (t, info, a, b, fn = ease.inOut) => { const k = fn(t / info.dur), o = {}; for (const kk of new Set([...Object.keys(a), ...Object.keys(b)])) o[kk] = lerp(a[kk] ?? (kk === 'z' ? 1 : 0), b[kk] ?? (kk === 'z' ? 1 : 0), k); return o; };
export const scr = (cam, X, Y) => [(X - E.W / 2 - (cam.x || 0)) * (cam.z ?? 1) + E.W / 2, (Y - E.H / 2 - (cam.y || 0)) * (cam.z ?? 1) + E.H / 2];
export function hand(o, which = 'F') { const p = o.pose || POSES.stand, s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1, h = which === 'B' ? p.hB : p.hF; return [o.x + h[0] * f * s, o.y + h[1] * s]; }
export const blinkAt = (t, seed = 0, every = 3.1) => ((t + seed) % every) > every - 0.12;   // short blink every ~3 s

// ---- props (drawn in world space at x, y = the point that sits in the hand / on the surface) ----
export function remote(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.5); g.scale(s, s); rr(g, -8, -44, 16, 52, 6); g.fillStyle = o.fill || '#1b1a22'; g.fill(); if (!o.flat) { for (let i = 0; i < 4; i++) circle(g, 0, -34 + i * 10, 2.6, i ? '#55546a' : '#e0453a'); } g.restore(); }
export function card(g, x, y, w = 150, h = 100, o = {}) {   // birthday card lying flat or held; o.ink: 0..1 visible letters; o.flat for thermal
  const { rot = 0, fill = '#f4ead6', ink = 1, str = 'GET WELL SOON', rainbow = true } = o; g.save(); g.translate(x, y); g.rotate(rot);
  rr(g, -w / 2, -h / 2, w, h, 6); g.fillStyle = fill; g.fill(); if (o.flat) { g.restore(); return; }
  g.strokeStyle = alpha('#000', 0.18); g.lineWidth = 2; g.stroke(); seg(g, [[0, -h / 2 + 4], [0, h / 2 - 4]], 1.2, alpha('#000', 0.12));
  if (ink > 0) { const cols = ['#e0453a', '#f08a24', '#e9c12e', '#3fae5a', '#3f7fd6', '#8a5ad6'], parts = str.split(' '), fs = Math.min(h * 0.26, w * 0.16);
    g.save(); g.globalAlpha *= ink; parts.forEach((p, i) => { let cx = -measureW(g, p, fs) / 2; [...p].forEach((ch, j) => { text(g, ch, cx, -h * 0.22 + i * fs * 1.1, { size: fs, color: rainbow ? cols[(i * 3 + j) % cols.length] : '#2a2230', font: FONTS.title, weight: 700, align: 'left' }); cx += measureW(g, ch, fs); }); }); g.restore(); }
  g.restore();
}
function measureW(g, s, size) { g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(s).width; g.restore(); return w; }
export function warmer(g, x, y, s = 1, o = {}) {   // little hand-warmer pouch (red/white) with a soft glow when o.lit
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); rr(g, -20, -14, 40, 28, 9); g.fillStyle = o.fill || '#d94a3a'; g.fill();
  if (!o.flat) { rr(g, -14, -8, 28, 16, 5); g.fillStyle = '#f4ead6'; g.fill(); text(g, 'HOT', 0, 1, { size: 10, color: '#d94a3a', font: FONTS.ui, weight: 900 }); }
  g.restore(); if (o.lit) glow(g, x, y, 60 * s, '#ffb070', 0.35 * o.lit);
}
export function goggles(g, x, y, s = 1, t = 0, o = {}) {   // night-vision goggles on a bench: twin tubes, strap, faint green lenses
  g.save(); g.translate(x, y); g.scale(s, s); seg(g, [[-120, -10], [-60, -44], [60, -44], [120, -10]], 10, '#24242c');
  for (const dx of [-46, 46]) { rr(g, dx - 34, -96, 68, 90, 14); g.fillStyle = '#2e3038'; g.fill(); g.strokeStyle = '#4a4c58'; g.lineWidth = 3; g.stroke(); rr(g, dx - 26, -108, 52, 18, 6); g.fillStyle = '#1a1b22'; g.fill(); }
  rr(g, -16, -80, 32, 50, 8); g.fillStyle = '#26272f'; g.fill();
  const lk = (o.lens ?? 1) * (0.75 + 0.25 * Math.sin(t * 3.3)); for (const dx of [-46, 46]) { circle(g, dx, -50, 24, '#0c1a10'); circle(g, dx, -50, 18, alpha('#5cff7a', 0.35 * lk)); glow(g, dx, -50, 70, '#5cff7a', 0.35 * lk); circle(g, dx - 7, -57, 4, alpha('#e8ffe8', 0.6)); }
  g.restore();
}
export function gecko(g, x, y, s = 1, t = 0, o = {}) {   // helmet gecko: big eye, banded tail, splayed toes
  const fill = o.fill || '#8a7c62', band = o.flat ? fill : shade(fill, -0.3); g.save(); g.translate(x, y); g.scale((o.facing ?? 1) * s, s);
  const tw = Math.sin(t * 1.7) * 6; seg(g, [[-30, -10], [-70, -6 + tw * 0.4], [-104, 4 + tw]], 14, fill); if (!o.flat) for (let i = 0; i < 4; i++) seg(g, [[-42 - i * 16, -10 + i * 3], [-42 - i * 16, 0 + i * 3]], 4, band);
  g.fillStyle = fill; g.beginPath(); g.ellipse(0, -14, 40, 16, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(48, -22, 22, 16, -0.15, 0, 7); g.fill();
  for (const [lx, d] of [[-24, -1], [22, 1]]) { seg(g, [[lx, -8], [lx + 8 * d, 6], [lx + 16 * d, 8]], 6, fill); for (const tx of [-5, 0, 5]) circle(g, lx + 16 * d + tx, 9, 3, fill); }
  if (!o.flat) { circle(g, 54, -28, 8, '#d8c890'); g.fillStyle = '#1a1420'; g.beginPath(); g.ellipse(55, -28, 2, 6.5, 0, 0, 7); g.fill(); circle(g, 51, -31, 1.8, '#fff'); for (let i = 0; i < 5; i++) circle(g, -24 + i * 12, -22, 2.5, band); }
  g.restore();
}
export function bike(g, x, y, s = 1, t = 0, o = {}) {   // bicycle (x,y = ground under the bottom bracket); wheels spin with o.spin
  const { frame = '#2a2632', tyre = '#121018', spin = t * 8, flat = false } = o; g.save(); g.translate(x, y); g.scale((o.facing ?? 1) * s, s);
  for (const wx of [-62, 62]) { ring(g, wx, -40, 38, 6, tyre); if (!flat) for (let i = 0; i < 6; i++) { const a = spin + i * Math.PI / 3; seg(g, [[wx, -40], [wx + Math.cos(a) * 34, -40 + Math.sin(a) * 34]], 1.2, alpha('#9a96a8', 0.5)); } }
  seg(g, [[-62, -40], [-14, -40], [30, -92], [-24, -92], [-62, -40]], 5, frame); seg(g, [[-14, -40], [-24, -100]], 5, frame); seg(g, [[30, -92], [62, -40]], 5, frame); seg(g, [[30, -92], [36, -112], [52, -114]], 5, frame); seg(g, [[-34, -104], [-14, -104]], 7, frame);
  if (o.lamp) { circle(g, 40, -104, 7, o.lamp > 0.5 ? '#fff8e0' : '#55505e'); }
  g.restore(); return [x + (o.facing ?? 1) * 40 * s, y - 104 * s];
}
export function stopwatch(g, x, y, r, k, t = 0, o = {}) {   // 60-second ring: k 0..1 elapsed, ticking hand, gold arc
  const ui = S().ui; g.save(); circle(g, x, y, r + 14, alpha('#0b1324', 0.85)); ring(g, x, y, r, 6, alpha(ui.blueprint, 0.35));
  g.strokeStyle = ui.gold; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(k)); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; seg(g, [[x + Math.cos(a) * (r - 18), y + Math.sin(a) * (r - 18)], [x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8)]], 3, alpha(ui.cream, 0.6)); }
  const a = -Math.PI / 2 + Math.PI * 2 * clamp(k); seg(g, [[x, y], [x + Math.cos(a) * (r - 22), y + Math.sin(a) * (r - 22)]], 4, ui.cream); circle(g, x, y, 7, ui.gold);
  rr(g, x - 14, y - r - 34, 28, 18, 4); g.fillStyle = ui.gold; g.fill(); if (o.label) text(g, o.label, x, y + r * 0.45, { size: r * 0.28, color: ui.cream, font: FONTS.ui, weight: 900 });
  g.restore();
}
export function journal(g, x, y, w, h, o = {}) {   // a journal page: masthead, title bars, two text columns, a figure box
  const { title = 'Nature', sub = 'Molecular basis of infrared detection by snakes', k = 1 } = o; g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.03);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2 + 12, -h / 2 + 14, w, h); g.fillStyle = '#f3efe4'; g.fillRect(-w / 2, -h / 2, w, h);
  text(g, title, -w / 2 + 34, -h / 2 + 52, { size: 46, color: '#c8322a', font: FONTS.serif, weight: 700, align: 'left', italic: true }); seg(g, [[-w / 2 + 30, -h / 2 + 84], [w / 2 - 30, -h / 2 + 84]], 2, '#c8322a');
  text(g, sub, -w / 2 + 34, -h / 2 + 120, { size: 20, color: '#2a2630', font: FONTS.serif, weight: 700, align: 'left' });
  const r = (n, y0, x0, x1) => { for (let i = 0; i < n; i++) { const ww = (x1 - x0) * (0.75 + 0.25 * Math.abs(Math.sin(i * 3.7))); g.fillStyle = alpha('#4a4652', 0.35); g.fillRect(x0, y0 + i * 16, ww * clamp(k * 1.4 - i * 0.04), 6); } };
  r(Math.floor((h - 190) / 16), -h / 2 + 160, -w / 2 + 34, -6); r(9, -h / 2 + 160, 18, w / 2 - 34);
  g.strokeStyle = alpha('#4a4652', 0.5); g.lineWidth = 2; g.strokeRect(18, -h / 2 + 320, w / 2 - 52, h / 2 - 70);
  g.restore();
}
export function thermometer(g, x, y, h, v, o = {}) {   // blueprint thermometer: tube + bulb, gold column at v (0..1)
  const ui = S().ui, c = o.color || ui.blueprint; g.save(); rr(g, x - 16, y - h, 32, h, 16); g.strokeStyle = c; g.lineWidth = 4; g.stroke(); ring(g, x, y + 22, 30, 4, c);
  circle(g, x, y + 22, 22, ui.gold); rr(g, x - 7, y - h * clamp(v), 14, h * clamp(v) + 10, 7); g.fillStyle = ui.gold; g.fill(); glow(g, x, y - h * clamp(v), 40, ui.gold, 0.5);
  for (let i = 1; i < 8; i++) seg(g, [[x + 18, y - (h * i) / 8], [x + 32, y - (h * i) / 8]], 2, alpha(c, 0.7)); g.restore();
}
export function clockTower(g, x, y, s = 1, t = 0, o = {}) {   // silhouette tower with a lit face reading 12:00
  const { color = '#120f1a', face = '#f1e2b8', lit = 1 } = o; g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = color; g.fillRect(-70, -520, 140, 520); poly(g, [[-90, -520], [90, -520], [0, -660]], color); g.fillRect(-84, -540, 168, 24);
  glow(g, 0, -430, 150, '#ffd59a', 0.25 * lit); circle(g, 0, -430, 52, mix('#3a3448', face, lit)); ring(g, 0, -430, 52, 5, color);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; seg(g, [[Math.cos(a) * 42, -430 + Math.sin(a) * 42], [Math.cos(a) * 48, -430 + Math.sin(a) * 48]], 3, color); }
  seg(g, [[0, -430], [0, -470]], 5, color); seg(g, [[0, -430], [0, -462]], 7, color); g.restore();
}
export function lightSwitch(g, x, y, on = 0, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -22, -34, 44, 68, 6); g.fillStyle = '#d8d2c4'; g.fill(); g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 2; g.stroke(); rr(g, -8, -18 + (1 - on) * 14, 16, 22, 4); g.fillStyle = '#f4efe4'; g.fill(); g.restore(); }
export function pinholeMask(g, x, y, r, a = 1) {   // everything outside a soft circle goes black (snake's pit = a pinhole)
  g.save(); const gr = g.createRadialGradient(x, y, r * 0.82, x, y, r * 1.08); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.strokeStyle = alpha('#ffd47e', 0.45 * a); g.lineWidth = 3; g.beginPath(); g.arc(x, y, r * 0.95, 0, 7); g.stroke(); g.restore();
}
