// sets/forest.js — rainy night forest. Key light = pale moon through cloud + (optional) a lantern/torch. Rain is built in.
//   const F = forest(g, t, cam, { view: 'camp' | 'cave', rain: true, torch: 0..1, wet: 1 })   // draw BEFORE characters
//   camp: clearing with two small tents (one empty tent), dead campfire ring, pines on both sides
//   cave: rock wall with a cave mouth (F.pos.caveX, caveW, caveH) and a rock ledge (F.pos.ledgeX, ledgeY) to curl up under
//   forestFg(g, t, cam): blurred pine branches + rain streaks in front (after characters)
//   Returns { GY, CX, M, rim, pos: { tentX, tent2X, fireX, caveX, caveW, caveH, ledgeX, ledgeY, treeXs[] } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, blurLayer, noise } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const forestGround = () => E.H * V(0.8, 0.68);

export function forest(g, t, cam, o = {}) {
  const M = mood(o.mood || 'storm'), GY = forestGround(), CX = E.W / 2, view = o.view || 'camp', torch = clamp(o.torch ?? 0);
  const pos = { tentX: CX - 380, tent2X: CX + 420, fireX: CX + 40, caveX: CX + 200, caveW: 360, caveH: 330, ledgeX: CX + 120, ledgeY: GY - 150, treeXs: [] };
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.moon(g, CX - 380, GY - 740, 44, '#cfd8f4'); glow(g, CX - 380, GY - 740, 420, '#9fb0e0', 0.2); FX.clouds(g, { y: GY - 900, h: 340, color: '#0b0f22', a: 0.55, seed: 4, count: 9 }); });
  layer(g, cam, 0.25, (g) => { FX.hills(g, { y: GY - 190, amp: 220, color: mix(M.sky[1], '#04050c', 0.78), seed: 3 }); r_pines(g, GY - 60, 0.55, mix(M.sky[1], '#04050c', 0.84), 15, 80); FX.fog(g, GY - 320, 320, M.fog, 0.3); });
  layer(g, cam, 0.5, (g) => { r_pines(g, GY - 10, 0.85, mix(M.sky[1], '#04050c', 0.9), 33, 150); FX.fog(g, GY - 200, 240, M.fog, 0.24); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.grass, -0.65), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY, E.W * 3.4, E.H * 2);
    const r = rng(2); for (let i = 0; i < 90; i++) { const x = -E.W + r() * E.W * 3.4, y = GY + 10 + r() * 360; seg(g, [[x, y], [x + (r() - 0.5) * 8, y - 12 - r() * 16]], 2, shade(M.grass, -0.55)); }
    FX.pool(g, CX, GY + 60, 900, 70, M.key, 0.07);
    if (o.wet !== 0) for (let i = 0; i < 6; i++) FX.pool(g, CX - 700 + i * 300, GY + 80 + (i % 2) * 70, 120, 14, '#aac0f0', 0.1);                       // puddles
  });
  layer(g, cam, 1, (g) => {
    if (view === 'camp') {
      for (const [tx, s, c, open] of [[pos.tentX, 1, '#2f5a8a', 0], [pos.tent2X, 0.85, '#8a3a4a', 1]]) {
        const w = 380 * s, h = 250 * s, col = shade(c, -0.6); poly(g, [[tx - w / 2, GY], [tx, GY - h], [tx + w / 2, GY]], col);
        poly(g, [[tx - 40 * s, GY], [tx, GY - h * 0.72], [tx + 40 * s, GY]], shade(col, open ? -0.7 : -0.9)); if (!open) seg(g, [[tx, GY - h * 0.72], [tx, GY]], 3, shade(col, 0.15));
        seg(g, [[tx - w / 2, GY], [tx - w / 2 - 36, GY + 10]], 3, '#05060a'); seg(g, [[tx + w / 2, GY], [tx + w / 2 + 36, GY + 10]], 3, '#05060a'); seg(g, [[tx, GY - h], [tx + 4, GY - h - 30]], 3, '#05060a');
        g.fillStyle = alpha(M.key, 0.1); poly(g, [[tx, GY - h], [tx - w / 2, GY], [tx - w / 2 + 40, GY]], g.fillStyle);
      }
      const fx = pos.fireX; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; circle(g, fx + Math.cos(a) * 44, GY + 22 + Math.sin(a) * 9, 11, '#14121c'); } seg(g, [[fx - 24, GY + 20], [fx + 22, GY + 14]], 7, '#0a0810'); seg(g, [[fx - 20, GY + 14], [fx + 24, GY + 22]], 7, '#0a0810');
    } else {
      const cx = pos.caveX, cw = pos.caveW, ch = pos.caveH, rc = shade('#50586a', -0.55);
      g.fillStyle = linGrad(g, 0, GY - 760, 0, GY, [shade(rc, -0.15), rc]); g.beginPath(); g.moveTo(cx - 900, GY); g.lineTo(cx - 800, GY - 520); g.lineTo(cx - 420, GY - 700); g.lineTo(cx - 100, GY - 620); g.lineTo(cx + 260, GY - 760); g.lineTo(cx + 700, GY - 600); g.lineTo(cx + 880, GY - 300); g.lineTo(cx + 940, GY); g.closePath(); g.fill();
      for (let i = 0; i < 18; i++) { const rx = cx - 800 + noise(i, 3) * 400 + i * 100, ry = GY - 120 - ((i * 53) % 480); seg(g, [[rx, ry], [rx + 90, ry + 24 + (i % 3) * 14]], 2.5, shade(rc, -0.4)); }
      g.fillStyle = '#020309'; g.beginPath(); g.moveTo(cx - cw / 2, GY); g.quadraticCurveTo(cx - cw / 2 - 20, GY - ch, cx, GY - ch - 30); g.quadraticCurveTo(cx + cw / 2 + 20, GY - ch, cx + cw / 2, GY); g.closePath(); g.fill();
      const ly = pos.ledgeY; g.fillStyle = shade(rc, -0.2); g.beginPath(); g.moveTo(pos.ledgeX - 160, ly); g.lineTo(pos.ledgeX + 330, ly - 18); g.lineTo(pos.ledgeX + 360, ly + 30); g.lineTo(pos.ledgeX - 140, ly + 40); g.closePath(); g.fill();
      g.fillStyle = alpha(M.key, 0.12); g.fillRect(pos.ledgeX - 160, ly - 4, 500, 4);
    }
    // wet tree trunks at the edges of the frame
    for (const [x, w] of [[CX - 1000, 70], [CX + 1100, 84]]) { g.fillStyle = shade(M.dark, -0.5); g.fillRect(x, GY - 1000, w, 1010); g.fillStyle = alpha(M.key, 0.14); g.fillRect(x, GY - 1000, 8, 1010); }
  });
  if (torch > 0.01) layer(g, cam, 1, (g) => { const tx = o.torchX ?? CX - 560, ty = GY - 300; glow(g, tx, ty, 360, '#fff2d0', 0.8 * torch); FX.lightCone(g, tx, ty, { angle: o.torchAngle ?? 0.1, spread: 0.55, len: 1300, color: '#fff2d0', a: 0.5 * torch }); });
  if (o.rain !== false) FX.rain(g, t, { count: 340, angle: 0.18, color: '#b8c8ff', a: 0.3 });
  const rim = { color: torch > 0.3 ? '#fff2d0' : M.rim, dir: [torch > 0.3 ? -1 : -0.3, -0.8] };
  return { GY, CX, M, rim, pos, view };
}
function r_pines(g, y, sc, col, seed, step) { const r = rng(seed); for (let x = -E.W; x < E.W * 2.4; x += step * (0.7 + r() * 0.7)) { const h = (260 + r() * 260) * sc; for (let k = 0; k < 4; k++) poly(g, [[x, y - h + k * h * 0.22], [x + (50 + k * 18) * sc, y - h * 0.1 - (3 - k) * 4 + k * h * 0.2], [x - (50 + k * 18) * sc, y - h * 0.1 - (3 - k) * 4 + k * h * 0.2]], col); seg(g, [[x, y - 20], [x, y]], 8 * sc, col); } }
export function forestFg(g, t, cam) {
  const GY = forestGround(), CX = E.W / 2;
  blurLayer(g, 14, (g) => { const c = '#04050a'; for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { g.save(); g.translate(CX + sx * 1050, GY - 520 + i * 60); g.rotate(sx * (0.9 + Math.sin(t * 0.7 + i) * 0.03)); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, 14, 260, 0, 0, 7); g.fill(); g.restore(); } }, cam, 1.7);
  FX.rain(g, t * 1.1, { count: 70, len: 90, w: 2.2, a: 0.2, seed: 9, angle: 0.18 });
}
