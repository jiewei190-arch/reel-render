// sets/sky.js — the STRATOSPHERE: open sky whose colour follows altitude (blue -> indigo -> black), Earth's haze far below, a jet, the 41 km balloon.
//   const Y = stratosphere(g, t, cam, { alt: 0..1, jet: 0..1, balloon: 0..1, curve })   // draw BEFORE characters
//     alt      0 = airliner height (~11 km, bright blue), 0.55 = ~41 km (indigo, stars appear), 1 = ~60 km (near black)
//     jet      0..1 slides a passenger jet + contrail across the frame BELOW the hero (depth 0.45); omit/null for none
//     balloon  0..1 fades in the record stratospheric balloon with a gold "41 km" marker (depth 0.5)
//   breathFog(g, x, y, t, k)   a puff of breath at a mouth point that fades with k (1 = thick fog, 0 = gone: no air left to fog)
//   vision(g, k)               pass-out vignette: k 0..1 closes a dark tunnel from the frame edge
//   skyFg(g, t, cam, { alt })  blurred high cirrus streaming past the lens (fades out with altitude)
// Returns { GY, CX, M, rim, pos: { horizonY, jetY, balloonX, balloonY, skyTop, skyLow } }
import { E, V, mood, layer, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, lerp, blurLayer, text, FONTS, ease } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const skyGround = () => E.H * V(0.92, 0.8);         // where Earth's haze line sits (nothing to stand on up here)
const SKY = [[0, ['#2f7fe0', '#8cc4ff', '#e8f3ff']], [0.35, ['#1a3f9a', '#3f7ad8', '#b8d8ff']], [0.6, ['#0a1440', '#1e2f80', '#6a8ad8']], [1, ['#010208', '#060a24', '#2a3a7a']]];
const skyAt = (a) => { a = clamp(a); for (let i = 1; i < SKY.length; i++) if (a <= SKY[i][0]) { const [a0, c0] = SKY[i - 1], [a1, c1] = SKY[i], k = (a - a0) / (a1 - a0); return c0.map((c, j) => mix(c, c1[j], k)); } return SKY[SKY.length - 1][1]; };

// passenger jet silhouette (local: nose at +x), with window dots and a blinking beacon
function jet(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); const b = '#e8ecf4', d = '#9aa4b8';
  rr(g, -150, -14, 300, 28, 14); g.fillStyle = b; g.fill(); poly(g, [[150, -14], [190, 0], [150, 14]], b);
  poly(g, [[-20, 4], [-90, 70], [-60, 70], [30, 6]], d); poly(g, [[-20, -4], [-70, -40], [-50, -40], [20, -6]], shade(d, -0.15));   // wings (near/far)
  poly(g, [[-130, -10], [-160, -60], [-140, -60], [-110, -10]], d); poly(g, [[-140, 4], [-175, 20], [-160, 22], [-130, 6]], d);       // tail fin + stabiliser
  for (let i = 0; i < 12; i++) circle(g, -100 + i * 18, -4, 2.6, '#3a4a6a'); rr(g, -50, 30, 46, 16, 8); g.fillStyle = shade(d, -0.2); g.fill();
  if (Math.floor(t * 1.5) % 2) { circle(g, -10, -14, 4, '#ff4a3a'); glow(g, -10, -14, 30, '#ff4a3a', 0.6); } g.restore(); }

export function stratosphere(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = skyGround(), CX = E.W / 2, alt = clamp(o.alt ?? 0.3), [cTop, cMid, cLow] = skyAt(alt);
  const curve = o.curve ?? lerp(0.04, 0.22, alt), horizonY = GY + lerp(-60, -200, alt);
  const pos = { horizonY, jetY: GY - 90, balloonX: CX + 560, balloonY: GY - 520, skyTop: cTop, skyLow: cLow };
  // sky dome (0.05) + stars that come out with altitude
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, -E.H * 0.4, 0, horizonY, [[0, cTop], [0.6, cMid], [1, cLow]]); g.fillRect(-E.W * 2, -E.H * 2, E.W * 5, E.H * 4);
    const sa = clamp((alt - 0.35) * 2.2); if (sa > 0) FX.stars(g, t * 0.15, { area: [-E.W * 0.5, -E.H * 0.4, E.W * 2, horizonY + E.H * 0.2], count: Math.round(220 * sa), seed: 33, color: alpha('#ffffff', sa) });
    glow(g, CX + 700, -60, 600, '#fff6e0', lerp(0.55, 0.25, alt)); circle(g, CX + 700, -60, 50, '#fffaf0'); });                                   // the sun, hard and white up here
  // Earth far below (0.2): the curved limb, a thin bright haze band (the troposphere), cloud tops, a hint of coastline
  layer(g, cam, 0.2, (g) => {
    const R = E.W / (curve * 2 + 0.0001), cy = horizonY + R;
    g.save(); g.beginPath(); g.arc(CX, cy, R, 0, Math.PI * 2); g.clip(); g.fillStyle = linGrad(g, 0, horizonY, 0, horizonY + E.H, ['#4a7ab8', '#2a4a7a', '#1a2a4a']); g.fillRect(-E.W, horizonY - 20, E.W * 3, E.H * 2);
    const r = rng(17); for (let i = 0; i < 34; i++) { const x = -E.W * 0.4 + r() * E.W * 1.8, y = horizonY + 20 + r() * 260; g.fillStyle = alpha('#ffffff', 0.5 + 0.3 * r()); g.beginPath(); g.ellipse(x, y, 60 + r() * 140, 10 + r() * 16, 0, 0, 7); g.fill(); }
    g.fillStyle = alpha('#7a9a5a', 0.35); g.beginPath(); g.ellipse(CX - 300, horizonY + 220, 520, 70, -0.05, 0, 7); g.fill(); g.restore();
    g.strokeStyle = alpha('#bfe2ff', 0.9); g.lineWidth = lerp(18, 6, alt); g.beginPath(); g.arc(CX, cy, R + 2, Math.PI * 1.15, Math.PI * 1.85); g.stroke();               // the haze line on the limb
    glow(g, CX, horizonY, E.W * 0.8, '#8ac8ff', lerp(0.35, 0.15, alt));
  });
  // the balloon (0.5): a huge pale envelope with a tiny gondola, and the gold 41 km marker
  const bk = clamp(o.balloon ?? 0); if (bk > 0) layer(g, cam, 0.5, (g) => {
    const bx = pos.balloonX, by = pos.balloonY + Math.sin(t * 0.6) * 8; g.save(); g.globalAlpha *= bk;
    g.fillStyle = linGrad(g, bx - 150, 0, bx + 150, 0, [alpha('#ffffff', 0.85), alpha('#dfe8f8', 0.6), alpha('#9aa8c8', 0.55)]); g.beginPath(); g.moveTo(bx, by + 260); g.bezierCurveTo(bx - 220, by + 60, bx - 200, by - 220, bx, by - 230); g.bezierCurveTo(bx + 200, by - 220, bx + 220, by + 60, bx, by + 260); g.fill();
    for (let i = -2; i <= 2; i++) seg(g, [[bx + i * 30, by - 222], [bx + i * 8, by + 250]], 1.5, alpha('#8a96b4', 0.5));
    seg(g, [[bx, by + 260], [bx, by + 330]], 2, '#c8d0e0'); rr(g, bx - 18, by + 330, 36, 26, 4); g.fillStyle = '#e8ecf4'; g.fill(); glow(g, bx - 60, by - 100, 160, '#ffffff', 0.2);
    g.setLineDash([14, 10]); g.strokeStyle = alpha('#ffd47e', 0.85); g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 240, by + 340); g.lineTo(bx - 40, by + 340); g.stroke(); g.setLineDash([]);
    rr(g, bx - 440, by + 306, 196, 66, 14); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = 3; g.stroke(); text(g, '41 km', bx - 342, by + 340, { size: 38, color: '#ffd47e', font: FONTS.ui, weight: 900, glow: 12, glowColor: 'rgba(255,212,126,.5)' });
    g.restore(); });
  // the jet (0.45) cruising below, with a long contrail that spreads and fades
  if (o.jet != null) layer(g, cam, 0.45, (g) => {
    const k = clamp(o.jet), jx = lerp(-E.W * 0.4, E.W * 1.4, k), jy = pos.jetY;
    for (let i = 0; i < 40; i++) { const x = jx - 180 - i * 46, spread = 4 + i * 1.4; g.fillStyle = alpha('#ffffff', 0.55 * (1 - i / 40)); g.beginPath(); g.ellipse(x, jy + 4 + Math.sin(i * 0.4) * 2, 64, spread, 0, 0, 7); g.fill(); }
    jet(g, jx, jy, 0.9, t);
  });
  const rim = { color: '#fff6e0', dir: [0.7, -0.7] };   // hard white sunlight from the upper right
  return { GY, CX, M, rim, pos };
}

export function breathFog(g, x, y, t, k) {
  if (k <= 0.02) return; for (let i = 0; i < 5; i++) { const ph = (t * 0.9 + i / 5) % 1; g.fillStyle = alpha('#ffffff', 0.75 * k * (1 - ph)); g.beginPath(); g.ellipse(x + 20 + ph * 110, y - ph * 36, 20 + ph * 60 * k, 14 + ph * 34 * k, 0, 0, 7); g.fill(); g.strokeStyle = alpha('#9ab0d0', 0.4 * k * (1 - ph)); g.lineWidth = 2; g.stroke(); }
}
export function vision(g, k) {
  if (k <= 0) return; g.save(); const gr = g.createRadialGradient(E.W / 2, E.H / 2, E.H * lerp(0.9, 0.12, clamp(k)), E.W / 2, E.H / 2, E.H * lerp(1.3, 0.6, clamp(k))); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(4,2,8,${0.6 + 0.4 * clamp(k)})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore();
}
export function skyFg(g, t, cam, o = {}) {
  const a = clamp(1 - (o.alt ?? 0.3) * 1.6); if (a <= 0) return;
  blurLayer(g, 14, (g) => { const r = rng(9); for (let i = 0; i < 5; i++) { const x = ((r() * E.W * 2 + t * (260 + r() * 160)) % (E.W * 2.4)) - E.W * 0.6, y = r() * E.H; g.fillStyle = alpha('#ffffff', 0.3 * a); g.beginPath(); g.ellipse(x, y, 420, 40, -0.08, 0, 7); g.fill(); } }, cam, 1.7);
}
