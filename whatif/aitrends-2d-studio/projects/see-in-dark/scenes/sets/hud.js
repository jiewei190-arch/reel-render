// sets/hud.js — fact chips and the five RULE title cards.
//   chip(g, t, { str, at: seconds into shot, x, y, dur, tone: 'gold'|'blue'|'coral' })   <= 6 words, pops in with outBack. Position default: lower-left third.
//   ruleCard(g, t, info, { n: 1..5, title: 'YOUR EYES QUIT FIRST', bg: (g, t) => {...}, accent })   full title-card shot (draws bg, big numeral, title)
//   darkness(g, k, { x, y, r })   vignette-to-black helper: k 0..1 (1 = pitch black) with an optional clear spot at (x,y,r)
import { E, V, S, clamp, lerp, prog, ease, rr, alpha, mix, shade, glow, text, measure, FONTS, backdrop, layer } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function chip(g, t, o = {}) {
  const { str = '', at = 0.3, x = E.W * V(0.5, 0.5), y = E.H * V(0.82, 0.78), dur = 99, tone = 'gold' } = o, ui = S().ui;
  const p = ease.outBack(prog(t, at, at + 0.4)) * clamp((dur - t) / 0.3); if (p <= 0.01) return;
  const col = tone === 'blue' ? ui.blueprint : tone === 'coral' ? ui.accent : ui.gold, size = V(36, 40), w = measure(g, str, size, FONTS.ui, 900) + 64, h = size + 34;
  g.save(); g.translate(x, y); g.scale(p, p); rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = alpha(ui.card.startsWith('rgba') ? '#0b1324' : ui.card, 0.92); g.fill(); g.strokeStyle = alpha(col, 0.85); g.lineWidth = 3; g.stroke();
  glow(g, 0, 0, w * 0.6, col, 0.12); text(g, str, 0, 2, { size, color: col, font: FONTS.ui, weight: 900, spacing: 1, glow: 10, glowColor: alpha(col, 0.5) }); g.restore();
}
const WORDS = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
// BIG BOLD title lock-up: extruded numeral on a glowing plate, outlined cream title on a dark banner, light sweep, sparkles.
export function ruleCard(g, t, info, o = {}) {
  const { n = 1, title = '', bg = null, accent = S().ui.gold } = o, dur = info?.dur ?? 3, ui = S().ui, cx = E.W / 2;
  if (bg) bg(g, t); else { backdrop(g, ['#05060f', '#0b1228']); FX.stars(g, t, { count: 90, area: [0, 0, E.W, E.H] }); }
  g.save(); g.fillStyle = 'rgba(0,0,0,.36)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore();
  const aIn = ease.out(prog(t, 0.0, 0.4)), aOut = clamp((dur - t) / 0.4), a = aIn * aOut;
  const nk = ease.outBack(prog(t, 0.05, 0.6)), sx = 1 + 0.025 * t, ny = E.H * V(0.445, 0.36);
  g.save(); g.globalAlpha *= a; g.translate(cx, ny); g.scale(sx, sx);
  glow(g, 0, 0, 640, accent, 0.26); glow(g, 0, 0, 300, '#ffffff', 0.1);
  for (let i = 0; i < 14; i++) { const ang = i / 14 * Math.PI * 2 + t * 0.12; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(accent, 0.07); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 760, ang, ang + 0.1); g.closePath(); g.fill(); g.restore(); }     // slow rotating sun-rays
  text(g, 'RULE', 0, -V(248, 300), { size: V(70, 80), color: ui.cream, glow: 26, glowColor: 'rgba(255,170,90,.8)', spacing: 26, stroke: 10, strokeColor: 'rgba(8,6,16,.9)' });
  g.save(); g.scale(nk, nk); const sz = V(450, 420), num = String(n);
  for (let i = 14; i >= 1; i--) text(g, num, i * 1.6, i * 2.6, { size: sz, color: shade(accent, -0.62), font: FONTS.title, weight: 700, stroke: 24, strokeColor: shade(accent, -0.7) });    // extrusion
  text(g, num, 0, 0, { size: sz, color: accent, glow: 70, glowColor: alpha(accent, 0.9), font: FONTS.title, weight: 700, stroke: 12, strokeColor: '#1a1006' });
  text(g, num, 0, 0, { size: sz, color: accent, font: FONTS.title, weight: 700 });
  g.save(); g.beginPath(); g.rect(-400, -300, 800, 600); g.clip(); g.globalCompositeOperation = 'lighter'; const sw = (t * 0.7 - 0.3) % 1.6 * 900 - 450; g.fillStyle = alpha('#ffffff', 0.18); g.beginPath(); g.moveTo(sw, -300); g.lineTo(sw + 70, -300); g.lineTo(sw - 70, 300); g.lineTo(sw - 140, 300); g.closePath(); g.fill(); g.restore();      // glint sweep
  g.restore();
  g.restore();
  const tk = ease.out(prog(t, 0.4, 0.95)); g.save(); g.globalAlpha *= tk * aOut;
  const ty = ny + V(300, 360), sz2 = Math.min(V(104, 80), (E.W * 0.84) / Math.max(1, measure(g, title, 100) / 100)), bw = measure(g, title, sz2) + 150, bh = sz2 + 56;
  g.translate(0, (1 - tk) * 26); rr(g, cx - bw / 2 * tk, ty - bh / 2, bw * tk, bh, 18); g.fillStyle = 'rgba(6,5,14,.78)'; g.fill(); g.strokeStyle = alpha(accent, 0.85); g.lineWidth = 4; g.stroke();
  glow(g, cx, ty, bw * 0.5, accent, 0.12);
  for (let i = 5; i >= 1; i--) text(g, title, cx + i * 0.8, ty + i * 1.6 + 2, { size: sz2, color: 'rgba(0,0,0,.55)', spacing: 6 });
  text(g, title, cx, ty + 2, { size: sz2, color: ui.cream, glow: 30, glowColor: 'rgba(255,120,40,.9)', spacing: 6, stroke: 12, strokeColor: 'rgba(8,6,16,.95)' });
  text(g, title, cx, ty + 2, { size: sz2, color: ui.cream, spacing: 6 });
  g.restore();
  for (let i = 0; i < 6; i++) { const ph = (t * 0.8 + i * 0.37) % 1, px = cx + Math.sin(i * 2.4) * 520, py = ny + Math.cos(i * 1.7) * 200; FX.sparkle(g, px, py, 14 * Math.sin(ph * Math.PI), accent, 0.9 * a); }
}
export function darkness(g, k, o = {}) {
  if (k <= 0) return; const { x = E.W / 2, y = E.H / 2, r = 0 } = o; g.save();
  if (r > 0) { const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, `rgba(0,0,0,0)`); gr.addColorStop(1, `rgba(0,0,0,${k})`); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
  else { g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
  g.restore();
}
