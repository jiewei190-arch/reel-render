// sets/apartment.js — HERO's flat at night. One key light: moonlight through the big window (cool blue), plus a warm lamp that obeys `power`.
//   const A = apartment(g, t, cam, { power: 0..1, mood: 'night' });   // draw BEFORE characters
//   characters: layer(g, cam, 1, g => actor(g, 'HERO', { x: A.sofaX, y: A.GY, ... , rim: A.rim }))
//   apartmentFg(g, t, cam)  // blurred foreground (plant leaves + table edge) - call AFTER the characters
// power: 1 = lights on (warm), 0 = blackout (moonlight only). Animate it: power: key(t, [[0.4, 1], [0.6, 0]]).
// Returns { GY, CX, M, rim, pos: { doorX, sofaX, tableX, tableTop, fridgeX, fridgeTop, binX, counterX, counterTop, plateX, windowX, lampX, shoeX, sideTableX, chargerX } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, blurLayer, rng, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const apartmentGround = () => E.H * V(0.8, 0.68);

export function apartment(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = apartmentGround(), CX = E.W / 2, P = clamp(o.power ?? 0);
  const moon = o.moon ?? 1;
  const wall = mix(shade(M.wall, -0.35), shade(M.wall, 0.0), P * 0.6), wallDark = shade(M.wall, -0.65);
  const warm = M.practical;
  const pos = { doorX: CX - 820, shelfX: CX - 560, sofaX: CX - 150, tableX: CX - 120, tableTop: GY - 62 + 38, windowX: CX - 60, fridgeX: CX + 640, fridgeTop: GY - 440,
    binX: CX + 960, counterX: CX + 1180, counterTop: GY - 190, plateX: CX + 1150, lampX: CX + 330, sideTableX: CX + 330, chargerX: CX + 360, shoeX: CX - 420 };
  // ---- wall + window (parallax 0.55) ----
  layer(g, cam, 0.55, (g) => {
    const top = GY - 900;
    g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(wall, 0.05), wall, wallDark]); g.fillRect(-E.W, top, E.W * 3.2, GY - top + 6);
    g.fillStyle = alpha('#000', 0.18); g.fillRect(-E.W, GY - 150, E.W * 3.2, 6);                       // dado rail
    g.fillStyle = alpha('#000', 0.24); g.fillRect(-E.W, GY - 144, E.W * 3.2, 150);                     // wainscot
    g.fillStyle = shade(wall, -0.45); g.fillRect(-E.W, GY - 14, E.W * 3.2, 16);                        // skirting
    const wx = pos.windowX - 300, wy = GY - 640, ww = 600, wh = 400;
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 3, rows: 2, frame: shade(M.wall, -0.7), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
      FX.stars(g, t * 0.3, { area: [x, y, w, h * 0.5], count: 40, seed: 5 });
      FX.moon(g, x + w * 0.78, y + h * 0.2, 30 * moon + 4, '#e8ecff');
      const off = (cam.x || 0) * -0.05;
      FX.skyline(g, { x: x - 20 + off, y: y + h + 4, w: w + 40, minH: 60, maxH: 220, color: mix(M.sky[1], '#05060f', 0.8), windowColor: alpha(warm, 0.8), lit: o.cityLit ?? 0.35, seed: 31 });
      FX.skyline(g, { x: x - 20 + off * 2, y: y + h + 4, w: w + 40, minH: 30, maxH: 120, minW: 40, maxW: 90, color: mix(M.sky[0], '#020309', 0.85), windowColor: alpha(warm, 0.9), lit: o.cityLit ?? 0.3, seed: 12 });
      glow(g, x + w * 0.78, y + h * 0.2, 260, '#b8c8ff', 0.22 * moon);
    });
    // curtains
    for (const s of [-1, 1]) { const cx = s < 0 ? wx - 70 : wx + ww + 8; g.fillStyle = linGrad(g, cx, 0, cx + 62, 0, s < 0 ? [shade(M.wall, -0.2), shade(M.wall, -0.5)] : [shade(M.wall, -0.5), shade(M.wall, -0.2)]); g.fillRect(cx, wy - 30, 62, wh + 130);
      for (let i = 1; i < 4; i++) seg(g, [[cx + i * 15, wy - 28], [cx + i * 15, wy + wh + 98]], 2, alpha('#000', 0.3)); }
    seg(g, [[wx - 100, wy - 32], [wx + ww + 100, wy - 32]], 6, shade(M.wall, -0.6));
    // sill + pictures + clock + shelf (the details that make a wall read as a home)
    g.fillStyle = shade(M.wall, -0.4); g.fillRect(wx - 14, wy + wh, ww + 28, 14);
    for (const [px, py, pw, ph, c] of [[pos.doorX + 300, GY - 560, 130, 170, '#3a4a78'], [pos.doorX + 470, GY - 520, 100, 130, '#5a3a58'], [CX + 560, GY - 700, 170, 120, '#2e5a6a']]) { rr(g, px, py, pw, ph, 4); g.fillStyle = shade(M.wall, -0.55); g.fill(); g.fillStyle = shade(c, -0.35); g.fillRect(px + 8, py + 8, pw - 16, ph - 16); g.fillStyle = alpha(c, 0.7); g.beginPath(); g.moveTo(px + 8, py + ph - 8); g.lineTo(px + pw * 0.4, py + ph * 0.5); g.lineTo(px + pw * 0.65, py + ph * 0.8); g.lineTo(px + pw - 8, py + ph * 0.4); g.lineTo(px + pw - 8, py + ph - 8); g.fill(); }
    FX.clock(g, CX + 380, GY - 760, 38, 4000, { face: shade('#f2efe8', -0.55), ink: '#0a0a14', red: '#7a2a2a' });
    g.fillStyle = shade(M.wall, -0.5); g.fillRect(pos.shelfX - 130, GY - 470, 260, 12); const r = rng(4);
    for (let i = 0; i < 9; i++) { const bh = 40 + r() * 36, bw = 14 + r() * 10; g.fillStyle = shade(['#4a3a68', '#6a3a3a', '#2e5a5a', '#6a5a2e'][i % 4], -0.45); g.fillRect(pos.shelfX - 120 + i * 26, GY - 470 - bh, bw, bh); }
    circle(g, pos.shelfX + 100, GY - 494, 18, shade('#3a7a5a', -0.5)); rr(g, pos.shelfX + 88, GY - 484, 24, 18, 3); g.fillStyle = shade('#aa5a3a', -0.5); g.fill();
  });
  // ---- moonbeam on the floor + window light pool ----
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.15), shade(M.dark, -0.1)]); g.fillRect(-E.W, GY, E.W * 3.2, E.H * 2);
    FX.floorLines(g, GY, GY + 520, 'rgba(0,0,0,.28)', 0.07);
    g.save(); g.globalCompositeOperation = 'lighter';                                                // moon window cast on the boards
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 360, [alpha(M.key, 0.2 * moon), alpha(M.key, 0.04 * moon)]);
    g.beginPath(); g.moveTo(pos.windowX - 250, GY + 6); g.lineTo(pos.windowX + 250, GY + 6); g.lineTo(pos.windowX + 420, GY + 300); g.lineTo(pos.windowX - 90, GY + 300); g.closePath(); g.fill(); g.restore();
    g.save(); g.fillStyle = alpha('#000', 0.28); for (const mx of [-1, 1]) g.fillRect(pos.windowX - 90 + mx * 140 + 80, GY + 6, 10, 300); g.restore();   // mullion shadows
    // rug
    g.save(); g.translate(pos.tableX - 20, GY + 120); g.scale(1, 0.14); circle(g, 0, 0, 420, shade('#5a3a68', -0.5)); circle(g, 0, 0, 340, shade('#7a4a58', -0.55)); g.restore();
  });
  // ---- furniture on the character plane ----
  layer(g, cam, 1, (g) => {
    // door (the one that eats your knee): ajar, swinging into the room
    const dx = pos.doorX, dh = 560; g.fillStyle = shade(wallDark, -0.2); g.fillRect(dx - 12, GY - dh - 10, 190, dh + 10);
    g.fillStyle = linGrad(g, dx, 0, dx + 150, 0, [shade(M.wall, -0.45), shade(M.wall, -0.65)]); poly(g, [[dx, GY], [dx + 22, GY - dh], [dx + 120, GY - dh + 24], [dx + 140, GY + 16]], g.fillStyle);
    seg(g, [[dx + 128, GY - 250], [dx + 134, GY - 250]], 8, '#c8a070'); glow(g, dx + 160, GY - dh * 0.5, 160, '#7088b0', 0.04 * (1 - P));
    // sofa
    const sx = pos.sofaX, sc = shade('#5a4a78', -0.5);
    rr(g, sx - 230, GY - 190, 460, 170, 22); g.fillStyle = sc; g.fill(); rr(g, sx - 260, GY - 120, 60, 110, 18); g.fill(); rr(g, sx + 200, GY - 120, 60, 110, 18); g.fill();
    for (const cx of [-110, 110]) { rr(g, sx + cx - 98, GY - 118, 196, 82, 16); g.fillStyle = shade(sc, 0.08); g.fill(); }
    rr(g, sx - 170, GY - 175, 70, 60, 14); g.fillStyle = shade('#c8803a', -0.5); g.fill();
    g.fillStyle = linGrad(g, 0, GY - 190, 0, GY - 150, [alpha(M.key, 0.35 * moon), alpha(M.key, 0)]); g.fillRect(sx - 230, GY - 190, 460, 40);     // moon on the back cushions
    seg(g, [[sx - 215, GY - 22], [sx - 215, GY]], 8, '#0a0810'); seg(g, [[sx + 215, GY - 22], [sx + 215, GY]], 8, '#0a0810');
    // side table + lamp (the warm practical)
    const lx = pos.lampX; rr(g, lx - 52, GY - 120, 104, 14, 5); g.fillStyle = shade('#6a4a38', -0.45); g.fill(); seg(g, [[lx - 40, GY - 106], [lx - 44, GY]], 7, shade('#6a4a38', -0.6)); seg(g, [[lx + 40, GY - 106], [lx + 44, GY]], 7, shade('#6a4a38', -0.6));
    seg(g, [[lx, GY - 122], [lx, GY - 230]], 6, '#14111a'); poly(g, [[lx - 44, GY - 226], [lx + 44, GY - 226], [lx + 28, GY - 300], [lx - 28, GY - 300]], P > 0.5 ? mix(shade(warm, -0.2), warm, P) : shade('#8a6a48', -0.55));
    // charger on the side table (a cold black brick + a cable)
    rr(g, lx + 18, GY - 134, 26, 14, 3); g.fillStyle = '#0c0b12'; g.fill(); seg(g, [[lx + 44, GY - 128], [lx + 70, GY - 118], [lx + 96, GY - 104]], 3, '#0c0b12');
    // coffee table
    const tx = pos.tableX, ty = GY + 38; rr(g, tx - 150, ty - 66, 300, 16, 6); g.fillStyle = shade('#6a4a38', -0.5); g.fill(); g.fillStyle = alpha(M.key, 0.25 * moon); g.fillRect(tx - 146, ty - 66, 292, 3);
    seg(g, [[tx - 128, ty - 50], [tx - 132, ty]], 8, shade('#6a4a38', -0.65)); seg(g, [[tx + 128, ty - 50], [tx + 132, ty]], 8, shade('#6a4a38', -0.65));
    rr(g, tx - 20, ty - 90, 26, 24, 5); g.fillStyle = '#d8d4cc'; g.fill(); rr(g, tx + 60, ty - 78, 52, 12, 4); g.fillStyle = '#14111a'; g.fill();        // mug + remote
    // single shoe on the floor (and its twin nowhere to be seen)
    const sh = pos.shoeX; g.fillStyle = '#0c0b12'; g.beginPath(); g.ellipse(sh, GY + 26, 38, 13, 0, 0, 7); g.fill(); rr(g, sh - 6, GY + 4, 40, 18, 8); g.fill(); seg(g, [[sh + 6, GY + 12], [sh + 26, GY + 18]], 2, '#c4c0d0');
    // kitchen: fridge (cat's perch), counter + toast plate, bin
    const fx = pos.fridgeX, fh = 440, fw = 200; rr(g, fx - fw / 2, GY - fh, fw, fh, 10); g.fillStyle = linGrad(g, fx - fw / 2, 0, fx + fw / 2, 0, [shade('#c4ccd8', -0.55), shade('#c4ccd8', -0.7)]); g.fill();
    g.fillStyle = alpha('#000', 0.35); g.fillRect(fx - fw / 2 + 6, GY - fh * 0.62, fw - 12, 5); seg(g, [[fx + 70, GY - fh * 0.6], [fx + 70, GY - fh * 0.38]], 6, '#9aa0b0'); seg(g, [[fx + 70, GY - fh + 40], [fx + 70, GY - fh + 90]], 6, '#9aa0b0');
    for (const [mx, my, c] of [[-50, -330, '#d4262e'], [-20, -290, '#3a6ea5'], [10, -350, '#f2c21a']]) circle(g, fx + mx, GY + my, 8, shade(c, -0.5));
    rr(g, fx - 60, GY - 264, 52, 66, 3); g.fillStyle = shade('#f4efe6', -0.6); g.fill();
    g.fillStyle = alpha(M.key, 0.1 * moon); g.fillRect(fx - fw / 2, GY - fh, 20, fh);
    const cxk = pos.counterX; g.fillStyle = shade('#3a3248', -0.4); g.fillRect(cxk - 260, GY - 190, 520, 190); g.fillStyle = shade('#5a5a68', -0.45); g.fillRect(cxk - 270, GY - 204, 540, 16);
    for (let i = 1; i < 4; i++) seg(g, [[cxk - 260 + i * 130, GY - 180], [cxk - 260 + i * 130, GY - 8]], 2, alpha('#000', 0.4));
    rr(g, pos.plateX - 40, GY - 214, 80, 10, 4); g.fillStyle = '#d8d4cc'; g.fill(); rr(g, pos.plateX - 26, GY - 232, 52, 20, 5); g.fillStyle = shade('#c8883a', -0.5); g.fill();       // toast on a plate
    rr(g, cxk - 180, GY - 258, 44, 54, 8); g.fillStyle = '#14111a'; g.fill();                                                                                                          // kettle
    rr(g, pos.binX - 36, GY - 100, 72, 100, 8); g.fillStyle = shade('#6a7a8a', -0.6); g.fill(); g.fillStyle = shade('#6a7a8a', -0.7); g.fillRect(pos.binX - 42, GY - 108, 84, 12);
  });
  // ---- lamp light when power is on (the one warm key) ----
  if (P > 0.01) {
    layer(g, cam, 1, (g) => { glow(g, pos.lampX, GY - 250, 520, warm, 0.5 * P); FX.pool(g, pos.lampX, GY + 20, 420, 60, warm, 0.35 * P); FX.lightCone(g, pos.lampX, GY - 226, { angle: Math.PI / 2, spread: 1.3, len: 520, color: warm, a: 0.2 * P }); });
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(warm, 0.05 * P); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore();
  }
  const rim = { color: P > 0.4 ? M.practical : M.rim, dir: [-0.2, -1] };       // rim comes from the window (above) in blackout, lamp when on
  return { GY, CX, M, rim, pos, P };
}
// blurred foreground: plant leaves on the left + a table corner. Call after the characters.
export function apartmentFg(g, t, cam) {
  const M = mood('night'), GY = apartmentGround(), CX = E.W / 2;
  blurLayer(g, 12, (g) => {
    const c = shade('#1f4a3c', -0.6), x = CX - 940;
    for (let i = 0; i < 7; i++) { const a = -2.5 + i * 0.32 + Math.sin(t * 0.6 + i) * 0.03; g.save(); g.translate(x, GY + 120); g.rotate(a); g.fillStyle = c; g.beginPath(); g.ellipse(0, -130, 34, 140, 0, 0, 7); g.fill(); g.restore(); }
    g.fillStyle = shade('#6a4a38', -0.8); g.fillRect(CX + 760, GY + 120, 600, 400);
  }, cam, 1.6);
}
