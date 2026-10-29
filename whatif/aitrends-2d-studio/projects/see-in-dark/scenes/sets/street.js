// sets/street.js — the city street at night. Key light = sodium street lamps + lit windows, both governed by `power` (1 lights on, 0 blackout).
//   const S = street(g, t, cam, { power: 1, rain: false, mood: 'night' });   // draw BEFORE characters
//   Each lit window / lamp has its own random threshold, so animating power 1 -> 0 kills the lights HOUSE BY HOUSE:
//   power: key(t, [[0.8, 1], [2.6, 0]])
//   characters stand on the pavement at S.GY; the road is below it (S.roadY ~ S.GY + 120), cyclists / cars use S.roadY.
//   streetFg(g, t, cam)  blurred foreground railing + lamp-post (after characters)
// Returns { GY, CX, M, rim, roadY, pos: { carX, carTop, shopX, shopW, shopTop, kerbY, binX, lampXs[] } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, blurLayer, text } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const streetGround = () => E.H * V(0.72, 0.62);

export function street(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = streetGround(), CX = E.W / 2, P = clamp(o.power ?? 1), lampC = M.practical;
  const pos = { carX: CX + 380, carTop: GY + 36, shopX: CX - 760, shopW: 540, shopTop: GY - 330, kerbY: GY + 70, binX: CX + 120, lampXs: [CX - 980, CX - 150, CX + 760, CX + 1500] };
  const roadY = GY + 140;
  // sky + far skyline (0.12/0.3)
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.stars(g, t * 0.4, { area: [-E.W * 0.5, 0, E.W * 2, E.H * 0.55], count: 120, seed: 7 }); FX.moon(g, CX + 520, GY - 520, 40, '#dfe6ff'); glow(g, CX + 520, GY - 520, 340, '#aab8ff', 0.18); });
  layer(g, cam, 0.3, (g) => {
    FX.skyline(g, { x: -E.W, y: GY - 120, w: E.W * 3, minH: 140, maxH: 460, color: mix(M.sky[1], '#06070f', 0.8), windowColor: alpha(lampC, 0.55 * (0.2 + 0.8 * P)), lit: 0.18 * (0.3 + 0.7 * P), seed: 8 });
    FX.fog(g, GY - 260, 260, M.fog, 0.28);
  });
  // mid-distance terrace facades with windows that die one by one (0.6)
  layer(g, cam, 0.6, (g) => {
    const r = rng(21), top = GY - 700; let x = -E.W * 0.9;
    while (x < E.W * 2.3) {
      const w = 340 + r() * 160, h = 520 + r() * 180, col = shade(M.wall, -0.45 - r() * 0.2);
      g.fillStyle = linGrad(g, 0, GY - h, 0, GY, [col, shade(col, -0.35)]); g.fillRect(x, GY - h, w, h + 4);
      g.fillStyle = shade(col, -0.35); g.fillRect(x - 4, GY - h - 14, w + 8, 18);
      const cols = 3, rows = 4;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const wx = x + 30 + i * (w - 60) / cols, wy = GY - h + 50 + j * 110, ww = (w - 60) / cols - 22, wh = 66, thr = r();
        const lit = P > thr * 0.92 + 0.05;
        g.fillStyle = lit ? mix(lampC, '#ffffff', 0.15 * r()) : shade(col, -0.5); g.fillRect(wx, wy, ww, wh);
        if (lit) glow(g, wx + ww / 2, wy + wh / 2, 100, lampC, 0.2); else { g.fillStyle = alpha(M.key, 0.07); g.fillRect(wx, wy, ww * 0.5, wh); }
        // window dressing: mullions, curtains, a silhouette in some lit windows, plants on the sill, a few AC units
        seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 3, shade(col, -0.6)); seg(g, [[wx, wy + wh * 0.45], [wx + ww, wy + wh * 0.45]], 3, shade(col, -0.6));
        if (lit) { const cc = ['#c8503a', '#d8a830', '#6a8ad8', '#e0e0d0'][Math.floor(thr * 40) % 4]; g.fillStyle = alpha(shade(cc, -0.3), 0.55); g.fillRect(wx, wy, ww * 0.2, wh); g.fillRect(wx + ww * 0.8, wy, ww * 0.2, wh);
          if (thr < 0.28) { const sx2 = wx + ww * (0.35 + thr), sy2 = wy + wh; circle(g, sx2, sy2 - 26, 8, '#0a0910'); g.fillStyle = '#0a0910'; g.beginPath(); g.ellipse(sx2, sy2, 15, 20, 0, Math.PI, 0); g.fill(); } }
        if (r() < 0.22) { circle(g, wx + ww * 0.3, wy + wh + 2, 9, shade('#3a8a5a', -0.55)); circle(g, wx + ww * 0.45, wy + wh - 2, 7, shade('#3a8a5a', -0.5)); }
        if (j === 3 && r() < 0.18) { rr(g, wx + 6, wy + wh + 10, ww - 12, 22, 3); g.fillStyle = shade('#8a8a98', -0.7); g.fill(); }
        g.fillStyle = shade(col, -0.55); g.fillRect(wx - 4, wy + wh, ww + 8, 6);
      }
      x += w + 8 + r() * 14;
    }
  });
  // pavement + shopfront + road (1.0)
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 90, [shade(M.floor, -0.05), shade(M.floor, -0.3)]); g.fillRect(-E.W, GY, E.W * 3.4, 80);                // pavement
    g.fillStyle = shade(M.floor, 0.1); g.fillRect(-E.W, GY + 66, E.W * 3.4, 8);                                                                     // kerb edge
    g.fillStyle = linGrad(g, 0, GY + 74, 0, E.H * 1.4, [shade(M.road, -0.2), shade(M.road, -0.55)]); g.fillRect(-E.W, GY + 74, E.W * 3.4, E.H);   // road
    for (let x = -E.W; x < E.W * 2.4; x += 360) { g.fillStyle = alpha('#d8d0b0', 0.35); g.fillRect(x, roadY + 120, 190, 8); }                        // dashes
    FX.fog(g, roadY - 20, 160, M.fog, 0.12);
    // shop: dark window = a flat cold glass slab
    const sx = pos.shopX, sw = pos.shopW, st = pos.shopTop;
    g.fillStyle = shade(M.wall, -0.7); g.fillRect(sx - 40, st - 90, sw + 80, GY - st + 90);
    rr(g, sx + sw * 0.2, st - 70, sw * 0.6, 54, 8); g.fillStyle = shade(M.dark, -0.2); g.fill(); g.fillStyle = alpha(lampC, 0.5 * P + 0.1); g.font = '700 30px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CORNER SHOP', sx + sw / 2, st - 42);
    g.fillStyle = linGrad(g, sx, st, sx + sw, GY, [shade(M.sky[2], -0.3), shade(M.sky[1], -0.55)]); g.fillRect(sx, st, sw, GY - st - 30);
    g.fillStyle = alpha(lampC, 0.2 * P); g.fillRect(sx, st, sw, GY - st - 30);
    for (let i = 0; i < 6; i++) { g.fillStyle = shade('#c8883a', -0.7); g.fillRect(sx + 24 + i * 82, GY - 130 - (i % 3) * 18, 56, 100 + (i % 3) * 18); }
    g.strokeStyle = alpha(M.key, 0.5); g.lineWidth = 3; g.beginPath(); g.moveTo(sx + 30, st + 20); g.lineTo(sx + 130, st + 20); g.moveTo(sx + 30, st + 44); g.lineTo(sx + 80, st + 44); g.stroke();     // glass glints
    g.strokeStyle = shade(M.wall, -0.8); g.lineWidth = 12; g.strokeRect(sx, st, sw, GY - st - 30);
    g.fillStyle = shade(M.wall, -0.75); g.fillRect(sx - 40, GY - 32, sw + 80, 34);
    // bin
    rr(g, pos.binX - 28, GY - 88, 56, 88, 8); g.fillStyle = shade('#6a7a8a', -0.65); g.fill(); g.fillRect(pos.binX - 34, GY - 98, 68, 12);
    // parked car (kitten hides underneath): dark body, window glints
    const cx = pos.carX, cy = roadY - 14;
    g.fillStyle = shade('#3a4a7a', -0.55); rr(g, cx - 230, cy - 74, 460, 74, 22); g.fill();
    g.beginPath(); g.moveTo(cx - 140, cy - 74); g.quadraticCurveTo(cx - 100, cy - 150, cx - 20, cy - 150); g.lineTo(cx + 80, cy - 150); g.quadraticCurveTo(cx + 150, cy - 140, cx + 180, cy - 74); g.closePath(); g.fill();
    g.fillStyle = shade(M.sky[2], -0.45); g.beginPath(); g.moveTo(cx - 112, cy - 78); g.quadraticCurveTo(cx - 84, cy - 136, cx - 24, cy - 138); g.lineTo(cx + 70, cy - 138); g.quadraticCurveTo(cx + 124, cy - 130, cx + 150, cy - 78); g.closePath(); g.fill();
    g.fillStyle = alpha(M.key, 0.3); g.beginPath(); g.moveTo(cx - 60, cy - 134); g.lineTo(cx - 24, cy - 138); g.lineTo(cx - 70, cy - 80); g.lineTo(cx - 100, cy - 80); g.closePath(); g.fill();
    for (const wx of [-140, 140]) { circle(g, cx + wx, cy, 36, '#07070c'); circle(g, cx + wx, cy, 18, '#2a2a38'); }
    g.fillStyle = '#05050a'; g.fillRect(cx - 100, cy - 4, 200, 4);                                                                                    // shadow gap under the car
    g.fillStyle = alpha('#ffb860', 0.9 * P); g.fillRect(cx + 218, cy - 52, 16, 12); g.fillStyle = alpha('#ff3b30', 0.6); g.fillRect(cx - 236, cy - 52, 10, 12);
  });
  // street furniture + shopfront dressing (character plane): neon sign, striped awning, stoop + red door, hydrant, bike, bollards, posters, tree
  layer(g, cam, 1, (g) => {
    const sx = pos.shopX, sw = pos.shopW, st = pos.shopTop, dk = (c, k = -0.45) => shade(c, k);
    g.fillStyle = dk('#c8503a', -0.5); g.beginPath(); g.moveTo(sx - 20, st - 6); g.lineTo(sx + sw + 20, st - 6); g.lineTo(sx + sw + 50, st + 60); g.lineTo(sx - 50, st + 60); g.closePath(); g.fill();         // awning
    for (let i = 0; i < 10; i++) if (i % 2) { g.fillStyle = dk('#f0e8d8', -0.55); g.beginPath(); g.moveTo(sx - 20 + i * (sw + 40) / 10, st - 6); g.lineTo(sx - 20 + (i + 1) * (sw + 40) / 10, st - 6); g.lineTo(sx - 50 + (i + 1) * (sw + 100) / 10, st + 60); g.lineTo(sx - 50 + i * (sw + 100) / 10, st + 60); g.closePath(); g.fill(); }
    const nz = 0.75 + 0.25 * Math.sin(t * 9) * Math.sin(t * 2.3); rr(g, sx + sw - 150, st + 90, 130, 58, 29); g.strokeStyle = alpha('#ff5a8a', 0.4 + 0.55 * P * nz); g.lineWidth = 5; g.stroke(); text(g, 'OPEN', sx + sw - 85, st + 120, { size: 30, color: alpha('#ff7aa0', 0.35 + 0.6 * P * nz), font: 'Nunito', weight: 900, glow: 14 * P, glowColor: 'rgba(255,90,140,.8)', spacing: 3 }); if (P > 0.05) glow(g, sx + sw - 85, st + 120, 150, '#ff4a8a', 0.2 * P * nz);
    for (let i = 0; i < 4; i++) { rr(g, sx + 40 + i * 120, GY - 74, 100, 44, 4); g.fillStyle = dk(['#d8a830', '#c8503a', '#4a9a6a', '#3a7aa0'][i], -0.55); g.fill(); }              // crates of produce on the pavement
    const hx = pos.binX - 230; rr(g, hx - 13, GY - 70, 26, 70, 8); g.fillStyle = dk('#d4262e', -0.45); g.fill(); rr(g, hx - 20, GY - 78, 40, 14, 6); g.fill(); circle(g, hx + 18, GY - 40, 6, dk('#d4262e', -0.5)); circle(g, hx - 18, GY - 40, 6, dk('#d4262e', -0.5));   // hydrant
    const bk = pos.binX + 40; for (const wxx of [-46, 46]) { g.strokeStyle = '#0a0910'; g.lineWidth = 5; g.beginPath(); g.arc(bk + wxx, GY - 34, 32, 0, 7); g.stroke(); } seg(g, [[bk - 46, GY - 34], [bk - 10, GY - 80], [bk + 46, GY - 34]], 4, '#0a0910'); seg(g, [[bk - 10, GY - 80], [bk - 20, GY - 96], [bk - 4, GY - 98]], 4, '#0a0910'); seg(g, [[bk + 46, GY - 34], [bk + 30, GY - 90], [bk + 40, GY - 98]], 4, '#0a0910');   // bike
    const dx = CX + 1010; g.fillStyle = dk(M.wall, -0.72); g.fillRect(dx - 150, GY - 520, 420, 520); g.fillStyle = dk('#8a1a22', -0.35); g.fillRect(dx, GY - 330, 100, 330); g.fillStyle = alpha('#000', 0.3); g.fillRect(dx + 14, GY - 316, 72, 120); g.fillRect(dx + 14, GY - 176, 72, 130); circle(g, dx + 86, GY - 160, 5, '#c8a050');
    g.fillStyle = dk('#d8d0b0', -0.6); g.fillRect(dx - 20, GY - 370, 140, 26); for (let i = 0; i < 4; i++) { rr(g, dx - 60 - i * 26, GY - 70 + i * 17, 200 + i * 52, 18, 3); g.fillStyle = dk(M.floor, 0.05 - i * 0.06); g.fill(); }
    for (const wxx of [dx - 130, dx + 140]) { rr(g, wxx, GY - 400, 90, 130, 4); g.fillStyle = P > 0.35 ? mix(M.practical, '#fff', 0.1) : dk(M.wall, -0.85); g.fill(); seg(g, [[wxx + 45, GY - 400], [wxx + 45, GY - 270]], 3, dk(M.wall, -0.8)); }
    circle(g, dx + 50, GY - 354, 13, dk('#e8e0c8', -0.3)); text(g, '24', dx + 50, GY - 354, { size: 15, color: '#2a2a30', weight: 900, font: 'Nunito' });
    circle(g, dx - 100, GY - 36, 28, dk('#3a8a5a', -0.6)); rr(g, dx - 122, GY - 22, 44, 22, 5); g.fillStyle = dk('#aa5a3a', -0.6); g.fill();                                                                                          // planter by the steps
    for (let i = 0; i < 2; i++) { const px = CX - 70 + i * 28, py = GY - 330; rr(g, px, py, 22 + i * 10, 40, 1); g.fillStyle = alpha(['#f0e8d8', '#e0a830'][i], 0.4); g.fill(); }            // flyers on the wall
  });
  // lamp posts + light cones (power-gated, flicker off in sequence)
  layer(g, cam, 1, (g) => {
    pos.lampXs.forEach((lx, i) => {
      const on = P > 0.12 + i * 0.2; FX.lampPost(g, lx, GY + 4, 340, { color: '#0a0910', light: lampC, on, a: 0.24 });
      if (on) FX.pool(g, lx + 60, GY + 40, 240, 34, lampC, 0.32); });
  });
  layer(g, cam, 1, (g) => { for (const [px, pw] of [[CX - 520, 200], [CX + 260, 260], [CX + 1260, 180]]) { g.save(); g.translate(px, GY + 100); g.scale(1, 0.12); circle(g, 0, 0, pw, alpha(mix(M.sky[1], '#fff', 0.15), 0.18)); g.restore(); } });
  if (o.rain) { FX.rain(g, t, { count: 300, color: '#b8c8ff', a: 0.28 }); }
  const rim = { color: P > 0.2 ? lampC : M.rim, dir: [P > 0.2 ? -0.7 : -0.3, -0.8] };
  return { GY, CX, M, rim, roadY, pos, P };
}
export function streetFg(g, t, cam) {
  const GY = streetGround(), CX = E.W / 2;
  blurLayer(g, 12, (g) => { seg(g, [[CX - 1100, GY + 330], [CX + 1500, GY + 330]], 22, '#07060b'); for (let x = CX - 1100; x < CX + 1500; x += 220) seg(g, [[x, GY + 330], [x, GY + 640]], 18, '#07060b'); }, cam, 1.7);
}
