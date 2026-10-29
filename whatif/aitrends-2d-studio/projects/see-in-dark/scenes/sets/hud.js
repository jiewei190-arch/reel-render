// sets/hud.js — fact chips and the five RULE title cards.
//   chip(g, t, { str, at: seconds into shot, x, y, dur, tone: 'gold'|'blue'|'coral' })   <= 6 words, pops in with outBack. Position default: lower-left third.
//   ruleCard(g, t, info, { n: 1..5, title: 'YOUR EYES QUIT FIRST', bg: (g, t) => {...}, accent })   full title-card shot (draws bg, big numeral, title)
//   darkness(g, k, { x, y, r })   vignette-to-black helper: k 0..1 (1 = pitch black) with an optional clear spot at (x,y,r)
import { E, V, S, clamp, lerp, prog, ease, rr, alpha, mix, glow, text, measure, FONTS, backdrop, layer } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function chip(g, t, o = {}) {
  const { str = '', at = 0.3, x = E.W * V(0.5, 0.5), y = E.H * V(0.82, 0.78), dur = 99, tone = 'gold' } = o, ui = S().ui;
  const p = ease.outBack(prog(t, at, at + 0.4)) * clamp((dur - t) / 0.3); if (p <= 0.01) return;
  const col = tone === 'blue' ? ui.blueprint : tone === 'coral' ? ui.accent : ui.gold, size = V(36, 40), w = measure(g, str, size, FONTS.ui, 900) + 64, h = size + 34;
  g.save(); g.translate(x, y); g.scale(p, p); rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = alpha(ui.card.startsWith('rgba') ? '#0b1324' : ui.card, 0.92); g.fill(); g.strokeStyle = alpha(col, 0.85); g.lineWidth = 3; g.stroke();
  glow(g, 0, 0, w * 0.6, col, 0.12); text(g, str, 0, 2, { size, color: col, font: FONTS.ui, weight: 900, spacing: 1, glow: 10, glowColor: alpha(col, 0.5) }); g.restore();
}
const WORDS = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
export function ruleCard(g, t, info, o = {}) {
  const { n = 1, title = '', bg = null, accent = S().ui.gold } = o, dur = info?.dur ?? 3, ui = S().ui, cx = E.W / 2;
  if (bg) bg(g, t); else { backdrop(g, ['#05060f', '#0b1228']); FX.stars(g, t, { count: 90, area: [0, 0, E.W, E.H] }); }
  g.save(); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore();
  const aIn = ease.out(prog(t, 0.0, 0.5)), aOut = clamp((dur - t) / 0.4), a = aIn * aOut;
  const nk = ease.outBack(prog(t, 0.05, 0.6)), sx = 1 + 0.03 * t;
  g.save(); g.globalAlpha *= a; g.translate(cx, E.H * V(0.4, 0.38)); g.scale(sx, sx);
  glow(g, 0, 0, 520, accent, 0.18);
  text(g, 'RULE', 0, -V(150, 190), { size: V(64, 70), color: ui.cream, glow: 22, glowColor: 'rgba(255,170,90,.7)', spacing: 18 });
  g.save(); g.scale(nk, nk); text(g, String(n), 0, 8, { size: V(380, 360), color: accent, glow: 60, glowColor: alpha(accent, 0.85), font: FONTS.title, weight: 700 }); g.restore();
  g.restore();
  const tk = ease.out(prog(t, 0.45, 1.0)); g.save(); g.globalAlpha *= tk * aOut;
  const sz = Math.min(V(88, 76), (E.W * 0.86) / Math.max(1, measure(g, title, 88) / 88)); g.fillStyle = alpha(ui.cream, 0.5); g.fillRect(cx - 360 * tk, E.H * V(0.4, 0.38) + V(220, 250), 720 * tk, 3);
  text(g, title, cx, E.H * V(0.4, 0.38) + V(300, 330) + (1 - tk) * 20, { size: sz, color: ui.cream, glow: 30, glowColor: 'rgba(255,120,40,.85)', spacing: 5 }); g.restore();
}
export function darkness(g, k, o = {}) {
  if (k <= 0) return; const { x = E.W / 2, y = E.H / 2, r = 0 } = o; g.save();
  if (r > 0) { const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, `rgba(0,0,0,0)`); gr.addColorStop(1, `rgba(0,0,0,${k})`); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
  else { g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
  g.restore();
}
