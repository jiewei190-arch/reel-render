// sets/cinema.js — the cinema. Key light = the projection screen (flicker-blue) + a bright doorway for "walk in from sunshine".
//   const C = cinema(g, t, cam, { view: 'hall' | 'lobby', screen: 0..1 (brightness), door: 0..1 (open doorway of daylight, hall left), content })
//   hall:  rows of seats climbing away, aisle with step lights, projector beam, EXIT sign, row letters on the seat ends (row F at C.pos.rowFX)
//   lobby: concession counter with a (blank) menu board - for the "can't read a menu" gag
//   cinemaFg(g, t, cam): blurred heads/seat backs in front. Returns { GY, CX, M, rim, pos: { rowFX, aisleX, screenX, screenY, screenW, screenH, menuX, menuY } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, blurLayer, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const cinemaGround = () => E.H * V(0.8, 0.68);

export function cinema(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = cinemaGround(), CX = E.W / 2, view = o.view || 'hall';
  const scr = clamp(o.screen ?? 0.5), door = clamp(o.door ?? 0), fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.1);
  const key = mix('#7fa8ff', '#ffd9a0', 0.15);
  const pos = { rowFX: CX + 260, aisleX: CX - 80, screenX: CX - 560, screenY: GY - 760, screenW: 1120, screenH: 500, menuX: CX + 140, menuY: GY - 640 };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 1000, 0, GY, [shade(M.wall, -0.8), shade(M.wall, -0.55)]); g.fillRect(-E.W, GY - 1000, E.W * 3.4, 1006);
    if (view === 'hall') {
      const { screenX: x, screenY: y, screenW: w, screenH: h } = pos;
      rr(g, x - 30, y - 24, w + 60, h + 48, 8); g.fillStyle = '#05050a'; g.fill();
      g.fillStyle = linGrad(g, x, y, x + w, y + h, [alpha(key, 0.55 * scr * fl), alpha(mix(key, '#ffffff', 0.4), 0.8 * scr * fl), alpha(key, 0.45 * scr * fl)]); g.fillRect(x, y, w, h);
      if (o.content) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); o.content(g, x, y, w, h); g.restore(); }
      glow(g, x + w / 2, y + h / 2, 900, key, 0.28 * scr * fl);
      for (const s of [-1, 1]) { const cx = s < 0 ? x - 150 : x + w + 20; g.fillStyle = shade(M.wall, -0.75); g.fillRect(cx, y - 60, 130, h + 120); for (let i = 0; i < 7; i++) seg(g, [[cx + 18 + i * 16, y - 56], [cx + 18 + i * 16, y + h + 56]], 3, alpha('#000', 0.35)); }
      rr(g, CX + 780, GY - 560, 150, 44, 6); g.fillStyle = '#05140a'; g.fill(); text(g, 'EXIT', CX + 855, GY - 538, { size: 28, color: '#3dff7a', font: FONTS.ui, weight: 900, spacing: 3, glow: 18, glowColor: 'rgba(60,255,120,.8)' });
      FX.godRays(g, CX + 40, GY - 1010, { count: 5, angle: Math.PI / 2 - 0.08, spread: 0.22, len: 1500, color: key, a: 0.05 * scr, t });
    } else {
      const bx = pos.menuX, by = pos.menuY;
      rr(g, bx - 330, by - 40, 660, 300, 10); g.fillStyle = '#07070d'; g.fill(); g.fillStyle = alpha(M.practical, 0.07); g.fillRect(bx - 320, by - 30, 640, 280);
      for (let i = 0; i < 4; i++) seg(g, [[bx - 280, by + 20 + i * 54], [bx - 40 - (i % 2) * 60, by + 20 + i * 54]], 6, alpha(M.practical, o.menuText ? 0.7 : 0.05));
      for (const lx of [-1, 0, 1]) { glow(g, bx + lx * 340, by - 90, 130, M.practical, 0.32); rr(g, bx + lx * 340 - 24, by - 110, 48, 18, 5); g.fillStyle = M.practical; g.fill(); }
      FX.counter(g, { x: CX - 900, y: GY, w: 1700, h: 200, color: shade('#3a2a4a', -0.6), top: shade('#5a4a6a', -0.45) });
      rr(g, bx - 180, GY - 330, 100, 130, 8); g.fillStyle = shade('#d4262e', -0.5); g.fill(); rr(g, bx - 60, GY - 316, 90, 116, 8); g.fillStyle = shade('#f2c21a', -0.55); g.fill();
    }
  });
  // door of daylight (hall): a hard white-blue slab on the far left + spill on the floor
  if (door > 0.01) layer(g, cam, 0.8, (g) => { const dx = CX - 960, dh = 520; g.fillStyle = `rgba(255,248,230,${door})`; g.fillRect(dx, GY - dh, 150, dh); glow(g, dx + 75, GY - dh / 2, 700, '#fff3d2', 0.7 * door); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, dx, 0, dx + 800, 0, [alpha('#fff3d2', 0.3 * door), alpha('#fff3d2', 0)]); g.beginPath(); g.moveTo(dx + 140, GY); g.lineTo(dx + 140, GY - dh * 0.6); g.lineTo(dx + 800, GY + 160); g.lineTo(dx + 200, GY + 160); g.closePath(); g.fill(); g.restore(); });
  // floor + seat rows
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 380, [shade(M.floor, -0.25), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3.4, E.H * 2);
    for (let x = -E.W; x < E.W * 2.4; x += 120) { g.fillStyle = alpha(M.key, 0.03); g.fillRect(x, GY, 40, 400); }
    if (view === 'hall') for (let r = 3; r >= 0; r--) {
      const y = GY - 8 - r * 38, sc = 1 - r * 0.07, col = shade('#7a2a3a', -0.55 - r * 0.07);
      for (let i = -9; i <= 11; i++) { const sx = CX + 200 + i * 112 * sc - (i < 0 ? 0 : 0); if (Math.abs(sx - pos.aisleX) < 90) continue; rr(g, sx - 38 * sc, y - 124 * sc, 76 * sc, 118 * sc, 14 * sc); g.fillStyle = col; g.fill(); g.fillStyle = alpha(key, 0.08 * scr); g.fillRect(sx - 38 * sc, y - 124 * sc, 76 * sc, 10); }
    }
    if (view === 'hall') {                                           // audience silhouettes: dark heads + coloured hoodie shoulders, rim-lit by the screen
      const ra = rng(33), cols = ['#d4262e', '#2f6fd0', '#f08a24', '#6aba4a', '#9a5ad6', '#e0e0d0', '#3aa0a8'];
      for (let r2 = 3; r2 >= 0; r2--) { const y = GY - 8 - r2 * 38, sc = 1 - r2 * 0.07; for (let i = -9; i <= 11; i++) { const sx = CX + 200 + i * 112 * sc; if (Math.abs(sx - pos.aisleX) < 90 || ra() > 0.42) continue;
        const hy = y - 150 * sc, c = cols[Math.floor(ra() * cols.length)]; g.fillStyle = shade(c, -0.62); g.beginPath(); g.ellipse(sx, y - 98 * sc, 34 * sc, 30 * sc, 0, Math.PI, 0); g.fill(); circle(g, sx, hy, 20 * sc, '#07060c'); g.strokeStyle = alpha(key, 0.45 * scr); g.lineWidth = 2.5; g.beginPath(); g.arc(sx, hy, 20 * sc, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); if (ra() < 0.3) circle(g, sx + 4, hy - 4, 3, alpha('#fff', 0.5)); } } }
    if (view === 'hall') { for (let k = 0; k < 6; k++) { const sx = pos.aisleX + 34 + k * 0; g.fillStyle = alpha('#ffb860', 0.7); g.fillRect(sx - 60, GY + 18 + k * 56, 8, 5); g.fillRect(sx + 120, GY + 18 + k * 56, 8, 5); } }
  });
  // row letters on the seat ends + row F sign
  layer(g, cam, 1, (g) => {
    if (view !== 'hall') return;
    rr(g, pos.rowFX - 40, GY - 205, 80, 64, 8); g.fillStyle = '#0a0a12'; g.fill(); text(g, 'F', pos.rowFX, GY - 172, { size: 46, color: alpha('#ffd9a0', 0.9), font: FONTS.ui, weight: 900, glow: 14, glowColor: 'rgba(255,200,120,.7)' });
    const r = rng(9); for (let i = 0; i < 30; i++) { const px = CX - 500 + r() * 1400, py = GY + 10 + r() * 70; circle(g, px, py, 3, alpha('#fff3d0', 0.5)); }   // spilled popcorn
  });
  // projector beam through dust
  if (view === 'hall') { FX.lightCone(g, CX + 40, GY - 1000, { angle: Math.PI / 2 - 0.05, spread: 0.3, len: 1400, color: key, a: 0.08 * scr }); }
  const rim = { color: view === 'hall' ? key : M.rim, dir: [0.2, -1] };
  return { GY, CX, M, rim, pos };
}
export function cinemaFg(g, t, cam) {
  const GY = cinemaGround(), CX = E.W / 2;
  blurLayer(g, 12, (g) => { for (let i = 0; i < 5; i++) { const x = CX - 900 + i * 520, y = GY + 260; g.fillStyle = shade('#5a1a2a', -0.75); rr(g, x, y - 300, 240, 480, 60); g.fill(); } }, cam, 1.7);
}
