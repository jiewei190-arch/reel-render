// sets/orbit.js — the EDGE OF SPACE and LOW ORBIT.
//   const Q = spaceEdge(g, t, cam, { line: 0..1, lineY, curve, glowK })     black sky, stars + Milky Way, Earth's curve with a thin blue atmosphere,
//        and the dashed 100 km line (Karman line) with a gold label. `line` = draw-on/fade; lineY = its screen y (it can scroll past: animate lineY).
//   const O = orbit(g, t, cam, { iss: 0..1, wave: 0..1, night: 0..1 })      Earth filling the lower half (clouds, terminator, city lights on the night side)
//        and the ISS drifting across (iss = 0..1 position); astronauts wave through the cupola window when wave > 0.
//   iss(g, x, y, s, t, { wave })   the station on its own (truss, 8 solar wings, modules, radiators, lit cupola with two waving astronauts)
//   orbitFg(g, t, cam)             a soft lens flare from the sun (space has no foreground objects)
// Returns { GY, CX, M, rim, pos: { limbY, lineY, issX, issY, windowX, windowY } }
import { E, V, mood, layer, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, clamp, lerp, blurLayer, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const orbitGround = () => E.H * V(0.74, 0.62);

function starfield(g, t, seed = 3) {
  g.fillStyle = '#020209'; g.fillRect(-E.W * 2, -E.H * 2, E.W * 5, E.H * 5);
  g.save(); g.translate(E.W * 0.5, E.H * 0.3); g.rotate(-0.35); const r = rng(seed);                                       // the Milky Way: a soft band of dust + dense stars
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * E.W * 2.4, y = (r() - 0.5) * 160; glow(g, x, y, 160 + r() * 200, i % 3 ? '#4a4a7a' : '#7a5a8a', 0.12); }
  for (let i = 0; i < 500; i++) { const x = (r() - 0.5) * E.W * 2.4, y = (r() - 0.5) * 220 * (0.4 + r()); circle(g, x, y, 0.5 + r() * 1.2, alpha('#e8e8ff', 0.3 + 0.5 * r())); }
  g.restore(); FX.stars(g, t * 0.1, { area: [-E.W * 0.5, -E.H * 0.5, E.W * 2, E.H * 2], count: 260, seed: seed + 5 });
  const r2 = rng(seed + 9); for (let i = 0; i < 14; i++) { const x = r2() * E.W, y = r2() * E.H * 0.7, tw = 0.6 + 0.4 * Math.sin(t * 2 + i * 1.7); FX.sparkle(g, x, y, 8 * tw, '#ffffff', 0.7 * tw); }
}
// Earth as a huge circle under the frame: ocean, cloud swirls, a terminator, the blue limb
function earth(g, t, cx, cy, R, o = {}) {
  const night = clamp(o.night ?? 0.25);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  g.fillStyle = radGrad(g, cx - R * 0.3, cy - R * 0.9, R * 0.1, R * 1.2, ['#5aa6e8', '#2a6ab0', '#0e2a5a']); g.fillRect(cx - R, cy - R, R * 2, R * 2);
  const r = rng(77); for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 1.3, d = R * (0.86 + r() * 0.12), x = cx + Math.cos(a) * d + ((t * 6) % 200), y = cy + Math.sin(a) * d;   // land masses
    g.fillStyle = alpha(i % 4 ? '#5a8a4a' : '#b89a6a', 0.55); g.beginPath(); g.ellipse(x, y, 80 + r() * 200, 20 + r() * 40, a + Math.PI / 2, 0, 7); g.fill(); }
  for (let i = 0; i < 60; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 1.5, d = R * (0.84 + r() * 0.15), x = cx + Math.cos(a) * d + ((t * 9) % 260), y = cy + Math.sin(a) * d;  // clouds
    g.fillStyle = alpha('#ffffff', 0.45 + 0.35 * r()); g.beginPath(); g.ellipse(x, y, 40 + r() * 140, 8 + r() * 18, a + Math.PI / 2 + (r() - 0.5) * 0.4, 0, 7); g.fill(); }
  if (night > 0) { g.fillStyle = linGrad(g, cx + R * 0.15, 0, cx + R * 0.55, 0, [alpha('#02040c', 0), alpha('#02040c', 0.85 * night)]); g.fillRect(cx - R, cy - R, R * 2, R * 2);
    for (let i = 0; i < 120; i++) { const a = -Math.PI / 2 + r() * 0.7, d = R * (0.9 + r() * 0.09), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; if (x < cx + R * 0.3) continue; circle(g, x, y, 1.6 + r() * 1.8, alpha('#ffcf7a', 0.75 * night)); } }    // city lights
  g.restore();
  for (const [w, a] of [[22, 0.18], [10, 0.45], [4, 0.9]]) { g.strokeStyle = alpha('#8acfff', a); g.lineWidth = w; g.beginPath(); g.arc(cx, cy, R + w * 0.4, Math.PI * 1.02, Math.PI * 1.98); g.stroke(); }   // atmosphere: a razor-thin blue skin
}

export function spaceEdge(g, t, cam, o = {}) {
  const M = mood('night'), GY = orbitGround(), CX = E.W / 2, curve = o.curve ?? 0.32, R = E.W / (curve * 2), cy = GY + R + 40;
  const lineY = o.lineY ?? GY - 160, pos = { limbY: GY + 40, lineY, issX: 0, issY: 0, windowX: 0, windowY: 0 };
  layer(g, cam, 0.04, (g) => starfield(g, t, 3));
  layer(g, cam, 0.15, (g) => { glow(g, CX + 820, -80, 500, '#fff6e0', 0.5); circle(g, CX + 820, -80, 46, '#ffffff'); earth(g, t, CX, cy, R, { night: 0.15 });
    glow(g, CX, GY + 40, E.W * 0.7, '#6ab8ff', 0.18 * (o.glowK ?? 1)); });
  const lk = clamp(o.line ?? 1); if (lk > 0) layer(g, cam, 0.5, (g) => {
    g.save(); g.globalAlpha *= lk; g.setLineDash([26, 18]); g.lineDashOffset = -t * 40; g.strokeStyle = alpha('#ffd47e', 0.9); g.lineWidth = 4; g.beginPath(); g.moveTo(-E.W * 0.5, lineY); g.lineTo(E.W * 1.5, lineY); g.stroke(); g.setLineDash([]);
    rr(g, 120, lineY - 92, 360, 70, 14); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = 3; g.stroke();
    text(g, '100 km', 220, lineY - 57, { size: 40, color: '#ffd47e', font: FONTS.ui, weight: 900, glow: 12, glowColor: 'rgba(255,212,126,.5)' }); text(g, 'SPACE', 398, lineY - 57, { size: 26, color: '#cfe0ff', font: FONTS.ui, weight: 900, spacing: 4 });
    g.restore(); });
  const rim = { color: '#fff6e0', dir: [0.8, -0.6] };
  return { GY, CX, M, rim, pos };
}

// the ISS. local units: truss along x (~ +-520 at s=1); cupola window at (0, 70)
export function iss(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.06); g.scale(s, s);
  const panel = (px, py, w, h) => { rr(g, px - w / 2, py - h / 2, w, h, 3); g.fillStyle = '#3a2a5a'; g.fill(); g.strokeStyle = '#c8a050'; g.lineWidth = 2; g.stroke(); for (let i = 1; i < 6; i++) seg(g, [[px - w / 2 + (i * w) / 6, py - h / 2], [px - w / 2 + (i * w) / 6, py + h / 2]], 1.2, alpha('#c8a050', 0.6)); g.fillStyle = alpha('#8a7aff', 0.18 + 0.1 * Math.sin(t * 2 + px)); g.fillRect(px - w / 2, py - h / 2, w * 0.3, h); };
  for (const sx of [-1, 1]) for (const k of [0, 1]) { const px = sx * (300 + k * 170); panel(px, -150, 140, 230); panel(px, 150, 140, 230); seg(g, [[px, -36], [px, 36]], 6, '#9a9aa8'); }      // 8 solar wings
  rr(g, -560, -14, 1120, 28, 6); g.fillStyle = '#b8b8c4'; g.fill(); for (let i = -540; i < 540; i += 40) seg(g, [[i, -14], [i + 40, 14]], 2, alpha('#6a6a78', 0.8));        // the truss
  for (const [mx, mw, mh] of [[-120, 200, 70], [90, 220, 64], [0, 70, 190]]) { rr(g, mx - mw / 2, -mh / 2 + (mw < 100 ? 40 : 30), mw, mh, mh / 2); g.fillStyle = linGrad(g, 0, -mh / 2, 0, mh / 2, ['#f4f4f8', '#a8a8b8']); g.fill(); }                   // modules
  rr(g, 150, -110, 60, 120, 4); g.fillStyle = '#e8e8f0'; g.fill(); rr(g, -260, 60, 70, 110, 4); g.fill();                                                                     // radiators
  // the cupola: a lit window with two astronauts waving
  const wx = 0, wy = 170, WR = 84; circle(g, wx, wy, WR + 12, '#6a6a78'); circle(g, wx, wy, WR, '#ffe6b0'); glow(g, wx, wy, WR * 2.4, '#ffd59a', 0.5);
  g.save(); g.beginPath(); g.arc(wx, wy, WR - 2, 0, 7); g.clip(); const wv = clamp(o.wave ?? 0);
  for (const [dx, c] of [[-30, '#f0f0f4'], [32, '#e8e4f0']]) { circle(g, wx + dx, wy + 10, 26, c); g.fillStyle = alpha('#3a5a98', 0.85); g.beginPath(); g.ellipse(wx + dx, wy + 8, 18, 12, 0, 0, 7); g.fill(); circle(g, wx + dx - 6, wy + 4, 4, alpha('#fff', 0.7));
    rr(g, wx + dx - 28, wy + 36, 56, 60, 14); g.fillStyle = c; g.fill(); const sd = dx < 0 ? -1 : 1, a = -1.25 + Math.sin(t * 9 + dx) * 0.45 * wv;
    seg(g, [[wx + dx + sd * 22, wy + 46], [wx + dx + sd * 22 + Math.cos(a) * 44 * sd, wy + 46 + Math.sin(a) * 44]], 13, c); circle(g, wx + dx + sd * 22 + Math.cos(a) * 44 * sd, wy + 46 + Math.sin(a) * 44, 9, c); }
  g.restore(); ring2(g, wx, wy, WR);
  if (Math.floor(t * 1.4) % 2) { circle(g, 560, 0, 5, '#ff4a3a'); glow(g, 560, 0, 30, '#ff4a3a', 0.5); }
  g.restore(); return [x + wx * s, y + wy * s];
}
const ring2 = (g, x, y, r) => { g.strokeStyle = '#4a4a58'; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; seg(g, [[x, y], [x + Math.cos(a) * r, y + Math.sin(a) * r]], 3, alpha('#4a4a58', 0.7)); } };

export function orbit(g, t, cam, o = {}) {
  const M = mood('night'), GY = orbitGround(), CX = E.W / 2, R = E.W * 1.3, cy = GY + R - 40;
  const pos = { limbY: GY - 40, lineY: 0, issX: lerp(E.W * 1.3, -E.W * 0.3, clamp(o.iss ?? 0.5)), issY: E.H * 0.34, windowX: 0, windowY: 0 };
  layer(g, cam, 0.04, (g) => starfield(g, t, 11));
  layer(g, cam, 0.12, (g) => { glow(g, -60, E.H * 0.1, 520, '#fff6e0', 0.45); earth(g, t, CX, cy, R, { night: o.night ?? 0.35 }); });
  layer(g, cam, 0.5, (g) => { const [wx, wy] = iss(g, pos.issX, pos.issY + Math.sin(t * 0.5) * 6, 0.74, t, { wave: o.wave ?? 0 }); pos.windowX = wx; pos.windowY = wy; });
  const rim = { color: '#fff6e0', dir: [-0.8, -0.6] };
  return { GY, CX, M, rim, pos };
}

export function orbitFg(g, t, cam) {
  g.save(); g.globalCompositeOperation = 'lighter'; const sx = E.W * 0.12, sy = E.H * 0.1;
  for (const [k, r, c] of [[0.3, 60, '#ffd8a0'], [0.55, 26, '#9fd8ff'], [0.8, 44, '#c8a0ff'], [1.1, 18, '#ffffff']]) { const x = lerp(sx, E.W * 0.6, k), y = lerp(sy, E.H * 0.7, k); glow(g, x + Math.sin(t * 0.3) * 6, y, r * 2, c, 0.18); }
  g.restore();
}
