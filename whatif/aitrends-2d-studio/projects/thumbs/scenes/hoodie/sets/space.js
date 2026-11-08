// sets/space.js — deep-space set for "What If You Fell Into a Black Hole?" (classic bright I.Awaken look, NOT horror).
//   spaceBg(g, t, cam, { warm })         violet->indigo gradient, nebula clouds (depth .08), far stars (.15), near stars (.4)
//   blackHole(g, x, y, R, t, { tilt, spin, heat, glowA })   accretion disk (back half), lensed halo, photon ring, shadow, disk (front half)
//   infall(g, t, x, y, R, { n, seed, color })               glowing motes spiralling into the hole (atmosphere)
//   debrisFg(g, t, cam, { seed, n })                        blurred foreground rocks/ice (depth 1.7) for the 2nd/3rd parallax layer
//   heroFloat(g, o)                                         actor('HERO') with no ground shadow + disk rim light, rot about the hip
//   chip(g, t, str, at, x, y, o)                            gold pill chip with outBack pop (<= 6 words)
//   goldNum(g, t, str, at, x, y, o)                         big gold number with outline + glow, pops on its word
//   DISKRIM                                                 warm rim colour from the disk
// Deterministic: rng(seed) and t only.
import { E, clamp, lerp, ease, prog, rng, circle, ring, seg, poly, rr, alpha, shade, mix, glow, linGrad, radGrad, layer, blurLayer, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor } from './actors.js';

export const GOLD = '#ffd36a', CREAM = '#fff1d6', DISKRIM = '#ffb45a', TEAL = '#7fe0e6';

export function spaceBg(g, t, cam, o = {}) {
  const w = o.warm ?? 0;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [mix('#151036', '#2a1030', w), mix('#2b1d5c', '#4a1e4e', w), mix('#4a2b74', '#7a3050', w), mix('#1b1440', '#2a1028', w)]);
  g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  layer(g, cam, 0.08, (g) => {
    const r = rng(o.seed ?? 21), cols = ['#8a5ad0', '#e0708a', '#4a7ae0', '#c06ad0', '#ff9a6a'];
    for (let i = 0; i < 7; i++) {
      const x = r() * E.W * 1.4 - E.W * 0.2 + Math.sin(t * 0.15 + i) * 20, y = r() * E.H * 1.2 - E.H * 0.1, rad = 380 + r() * 520;
      glow(g, x, y, rad, cols[i % cols.length], 0.16 + r() * 0.12);
    }
  });
  layer(g, cam, 0.15, (g) => FX.stars(g, t, { seed: 5, count: 260, area: [-300, -300, E.W + 600, E.H + 600], color: '#ffffff' }));
  layer(g, cam, 0.4, (g) => {
    FX.stars(g, t, { seed: 13, count: 60, area: [-300, -300, E.W + 600, E.H + 600], color: '#ffe9c8' });
    const r = rng(77); for (let i = 0; i < 6; i++) FX.sparkle(g, r() * E.W, r() * E.H, 10 + r() * 12, '#fff6e0', 0.35 + 0.35 * Math.sin(t * 2.2 + i * 1.7));
  });
}

function diskHalf(g, x, y, R, t, o, front) {
  const k = o.tilt ?? 0.26, rin = R * 1.3, rout = R * (o.outer ?? 2.9), spin = (o.spin ?? 1) * t, heat = o.heat ?? 1;
  g.save(); g.translate(x, y); g.scale(1, k);
  g.beginPath(); if (front) g.rect(-rout * 1.2, 0, rout * 2.4, rout * 1.2); else g.rect(-rout * 1.2, -rout * 1.2, rout * 2.4, rout * 1.2); g.clip();
  const N = 22;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1), r = lerp(rin, rout, f), c = mix(mix('#fff6dc', '#ffc860', clamp(f * 2)), mix('#ff7a3a', '#9a2a6a', clamp(f * 1.6 - 0.6)), clamp(f * 1.3));
    const gr = g.createLinearGradient(-r, 0, r, 0);                          // doppler: the approaching (left) side is brighter
    gr.addColorStop(0, alpha(c, (0.95 - f * 0.55) * heat)); gr.addColorStop(0.5, alpha(c, (0.6 - f * 0.4) * heat)); gr.addColorStop(1, alpha(c, (0.35 - f * 0.25) * heat));
    g.strokeStyle = gr; g.lineWidth = (rout - rin) / N * 1.5; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
  }
  const rr2 = rng(o.seed ?? 3); g.globalCompositeOperation = 'lighter';    // swirling streaks (inner ones orbit faster)
  for (let i = 0; i < 46; i++) {
    const r = lerp(rin, rout, Math.pow(rr2(), 1.4)), a0 = rr2() * 6.283 + spin * 1.6 * Math.pow(rin / r, 1.5), len = 0.3 + rr2() * 0.7;
    g.strokeStyle = alpha('#fff2cc', (0.18 + rr2() * 0.3) * heat); g.lineWidth = 2 + rr2() * 4; g.beginPath(); g.arc(0, 0, r, a0, a0 + len); g.stroke();
  }
  g.restore();
}
export function blackHole(g, x, y, R, t, o = {}) {
  const heat = o.heat ?? 1;
  glow(g, x, y, R * 5.5, '#ff8a3c', (o.glowA ?? 0.3) * heat);
  glow(g, x, y, R * 3, '#ffcf7a', 0.25 * heat);
  diskHalf(g, x, y, R, t, o, false);
  // lensed light from the far side of the disk, bent up over the top of the shadow
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const r = R * (1.12 + i * 0.07), a = (0.5 - i * 0.07) * heat;
    g.strokeStyle = alpha(i < 2 ? '#fff4d8' : '#ffb055', a); g.lineWidth = R * 0.09; g.beginPath(); g.arc(x, y, r, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
    g.strokeStyle = alpha('#ff9a50', a * 0.45); g.lineWidth = R * 0.05; g.beginPath(); g.arc(x, y, r * 0.98, 0.1, Math.PI - 0.1); g.stroke();
  }
  g.restore();
  ring(g, x, y, R * 1.05, R * 0.05, alpha('#fff8e8', 0.95 * heat));                         // photon ring
  glow(g, x, y - R * 0.2, R * 1.4, '#ffe0a0', 0.15 * heat);
  circle(g, x, y, R, '#040208');                                                               // the shadow
  g.save(); g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.clip(); glow(g, x - R * 0.3, y - R * 0.4, R * 0.9, '#2a1a3a', 0.25); g.restore();
  diskHalf(g, x, y, R, t, o, true);
}
export function infall(g, t, x, y, R, o = {}) {
  const r = rng(o.seed ?? 9), n = o.n ?? 40, col = o.color ?? '#ffe2b0';
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const per = 3 + r() * 4, ph = (t / per + r()) % 1, d = R * lerp(6, 1.2, ease.in(ph)), a0 = r() * 6.28 + ph * 5;
    const px = x + Math.cos(a0) * d, py = y + Math.sin(a0) * d * 0.45, s = 2 + r() * 3;
    glow(g, px, py, s * 4, col, 0.5 * Math.sin(ph * Math.PI)); circle(g, px, py, s * 0.6, alpha('#ffffff', 0.7 * Math.sin(ph * Math.PI)));
  }
  g.restore();
}
function rock(g, x, y, s, rot, seed, col) {
  const r = rng(seed); g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, d = s * (0.7 + r() * 0.4); i ? g.lineTo(Math.cos(a) * d, Math.sin(a) * d) : g.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
  g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = alpha(DISKRIM, 0.7); g.lineWidth = s * 0.12; g.beginPath(); g.arc(0, 0, s * 0.8, -2.4, -0.6); g.stroke(); g.restore();
}
export function debrisFg(g, t, cam, o = {}) {
  blurLayer(g, 7, (g) => {
    const r = rng(o.seed ?? 31), n = o.n ?? 4;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1, x = side > 0 ? E.W - 60 - r() * 160 : 40 + r() * 160, y = 200 + r() * (E.H - 700) + Math.sin(t * 0.6 + i) * 30;
      rock(g, x, y, 50 + r() * 70, t * (0.2 + r() * 0.3) * side, 40 + i, mix('#2a1e3a', '#4a3050', r()));
    }
  }, cam, 1.7);
}
export function heroFloat(g, o) {
  actor(g, 'HERO', { shadow: false, rim: { color: o.rimColor || DISKRIM, dir: o.rimDir || [0, 1], w: 4.5 }, ...o });
}
export function chip(g, t, str, at, x, y, o = {}) {
  const k = ease.outBack(prog(t, at, at + 0.35)); if (k <= 0.01) return; const size = o.size ?? 46, col = o.color ?? GOLD;
  g.save(); g.translate(x, y); g.scale(k, k); g.font = `900 ${size}px "${FONTS.ui}"`; const w = g.measureText(str).width + 64, h = size + 34;
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = 'rgba(14,10,36,.9)'; g.fill(); g.strokeStyle = alpha(col, 0.95); g.lineWidth = 5; g.stroke();
  text(g, str, 0, 2, { size, color: col, font: FONTS.ui, weight: 900, glow: 12, glowColor: alpha(col, 0.55) }); g.restore();
}
export function goldNum(g, t, str, at, x, y, o = {}) {
  const k = ease.outBack(prog(t, at, at + 0.4)); if (k <= 0.01) return; const size = o.size ?? 120;
  g.save(); g.translate(x, y); g.scale(k, k);
  text(g, str, 0, 0, { size, color: o.color ?? GOLD, font: FONTS.title, weight: 700, stroke: size * 0.14, strokeColor: '#1a0c24', glow: 24, glowColor: 'rgba(255,190,80,.8)' });
  if (o.sub) text(g, o.sub, 0, size * 0.72, { size: size * 0.36, color: CREAM, font: FONTS.ui, weight: 900, stroke: 10, strokeColor: '#1a0c24', spacing: 4 });
  g.restore();
}
