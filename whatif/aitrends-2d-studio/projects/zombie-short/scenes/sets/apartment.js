// sets/apartment.js — HERO's flat at night. One key light: moonlight through the big window (cool blue), plus a warm lamp that obeys `power`.
//   const A = apartment(g, t, cam, { power: 0..1, mood: 'night' });   // draw BEFORE characters
//   characters: layer(g, cam, 1, g => actor(g, 'HERO', { x: A.sofaX, y: A.GY, ... , rim: A.rim }))
//   apartmentFg(g, t, cam)  // blurred foreground (plant leaves + table edge) - call AFTER the characters
// power: 1 = lights on (warm), 0 = blackout (moonlight only). Animate it: power: key(t, [[0.4, 1], [0.6, 0]]).
// Returns { GY, CX, M, rim, pos: { doorX, sofaX, tableX, tableTop, fridgeX, fridgeTop, binX, counterX, counterTop, plateX, windowX, lampX, shoeX, sideTableX, chargerX } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, blurLayer, rng, clamp, lerp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const apartmentGround = () => E.H * V(0.8, 0.68);

export function apartment(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = apartmentGround(), CX = E.W / 2, P = clamp(o.power ?? 0);
  const moon = o.moon ?? 1;
  const wall = mix(shade(M.wall, -0.2), shade(M.wall, 0.0), P * 0.6), wallDark = shade(M.wall, -0.65);
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
    // blinds raised at the top of the window, a pendant lamp, fairy lights (die with power), upper kitchen cabinets + utensil rail
    g.fillStyle = shade(M.wall, -0.55); g.fillRect(wx, wy, ww, 34); for (let i = 0; i < 4; i++) seg(g, [[wx, wy + 8 + i * 8], [wx + ww, wy + 8 + i * 8]], 2.5, alpha(M.key, 0.14 * moon));
    seg(g, [[CX + 160, GY - 1000], [CX + 160, GY - 800]], 4, '#0a0910'); g.fillStyle = shade(M.wall, -0.7); g.beginPath(); g.moveTo(CX + 90, GY - 740); g.quadraticCurveTo(CX + 160, GY - 830, CX + 230, GY - 740); g.closePath(); g.fill(); if (P > 0.3) glow(g, CX + 160, GY - 730, 200, warm, 0.35 * P);
    { const n = 22, x0f = pos.doorX + 40, x1f = pos.sofaX + 330; g.strokeStyle = alpha('#0a0910', 0.9); g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0f, x1f, u), y = GY - 700 + Math.sin(u * Math.PI) * 70; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      for (let i = 0; i <= n; i += 1) { const u = i / n, x = lerp(x0f, x1f, u), y = GY - 700 + Math.sin(u * Math.PI) * 70; circle(g, x, y + 6, 4, P > 0.3 ? mix('#ffd9a0', '#ffffff', 0.4) : shade('#c8a070', -0.65)); if (P > 0.3) glow(g, x, y + 6, 26, '#ffcf8a', 0.3 * P); } }
    for (let i = 0; i < 4; i++) { const cx0 = CX + 760 + i * 150; rr(g, cx0, GY - 770, 140, 200, 6); g.fillStyle = shade('#5a4a68', -0.55); g.fill(); rr(g, cx0 + 8, GY - 762, 124, 184, 4); g.strokeStyle = alpha('#000', 0.35); g.lineWidth = 2; g.stroke(); seg(g, [[cx0 + 118, GY - 640], [cx0 + 118, GY - 610]], 5, '#a8a0b0'); g.fillStyle = alpha(M.key, 0.05 * moon); g.fillRect(cx0, GY - 770, 140, 20); }
    seg(g, [[CX + 1030, GY - 520], [CX + 1360, GY - 520]], 4, '#a8a0b0'); for (let i = 0; i < 5; i++) { const ux = CX + 1060 + i * 62; seg(g, [[ux, GY - 520], [ux, GY - 470 - (i % 3) * 14]], 3, '#a8a0b0'); rr(g, ux - 12, GY - 470 - (i % 3) * 14, 24, 30 + (i % 2) * 14, 6); g.fillStyle = shade(['#c8503a', '#3a7aa0', '#d8a830', '#6a6a78', '#4a9a6a'][i], -0.55); g.fill(); }
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
  // ---- lived-in details on the character plane: bookcase, plant, door coats + shoe rack, throw blanket, cat bowls, fridge art, counter clutter, radiator ----
  layer(g, cam, 1, (g) => {
    const dk = (c, k = -0.5) => shade(c, k), edge = (x, y, w, h) => { g.fillStyle = alpha(M.key, 0.12 * moon); g.fillRect(x, y, w, 3); g.fillRect(x, y, 3, h); };
    // tall bookcase (between door and sofa)
    { const bx = CX - 650, by = GY - 400, bw = 210, bh = 400; g.fillStyle = dk('#6a4a38', -0.6); g.fillRect(bx, by, bw, bh); edge(bx, by, bw, bh); const r = rng(14);
      for (let row = 0; row < 4; row++) { const ry = by + 14 + row * 96; g.fillStyle = dk('#6a4a38', -0.75); g.fillRect(bx + 8, ry + 86, bw - 16, 8); let x = bx + 14;
        while (x < bx + bw - 24) { const w = 12 + r() * 14, h = 44 + r() * 38, c = ['#c8503a', '#3a7aa0', '#d8a830', '#6a5ab0', '#4a9a6a', '#d8d0c0'][Math.floor(r() * 6)]; g.fillStyle = dk(c, -0.52 - r() * 0.1); g.fillRect(x, ry + 86 - h, w, h); g.fillStyle = alpha('#fff', 0.07); g.fillRect(x, ry + 86 - h, 2, h); x += w + 1; if (r() < 0.12) x += 26; } }
      circle(g, bx + 160, by + 10 - 10, 0, '#000'); }
    // big plant by the lamp
    { const px = CX + 480; rr(g, px - 38, GY - 90, 76, 90, 10); g.fillStyle = dk('#aa5a3a', -0.6); g.fill(); for (let i = 0; i < 9; i++) { const a = -1.9 + i * 0.3 + Math.sin(t * 0.5 + i) * 0.025, L = 120 + (i % 3) * 38; g.save(); g.translate(px, GY - 86); g.rotate(a); g.fillStyle = dk(i % 2 ? '#2f7a4a' : '#3a8a5a', -0.62); g.beginPath(); g.ellipse(0, -L * 0.6, 24, L * 0.62, 0, 0, 7); g.fill(); seg(g, [[0, -4], [0, -L * 1.1]], 2, alpha('#000', 0.35)); g.fillStyle = alpha(M.key, 0.1 * moon); g.beginPath(); g.ellipse(-8, -L * 0.7, 6, L * 0.4, 0, 0, 7); g.fill(); g.restore(); } }
    // door: coat hooks with a coat + a bag, shoe rack with the OTHER shoes, umbrella
    { const dx = pos.doorX; seg(g, [[dx + 190, GY - 520], [dx + 330, GY - 520]], 6, '#0a0910'); for (const hx of [200, 250, 300]) circle(g, dx + hx, GY - 514, 5, '#8a7a68');
      g.fillStyle = dk('#4a5a7a', -0.55); g.beginPath(); g.moveTo(dx + 214, GY - 516); g.lineTo(dx + 282, GY - 516); g.lineTo(dx + 296, GY - 190); g.lineTo(dx + 202, GY - 190); g.closePath(); g.fill(); g.fillStyle = alpha(M.key, 0.1 * moon); g.fillRect(dx + 214, GY - 516, 6, 320);
      rr(g, dx + 286, GY - 480, 54, 70, 10); g.fillStyle = dk('#d8a830', -0.6); g.fill(); seg(g, [[dx + 300, GY - 480], [dx + 310, GY - 520]], 3, '#0a0910');
      rr(g, dx + 200, GY - 70, 150, 64, 6); g.fillStyle = dk('#6a4a38', -0.7); g.fill(); for (let i = 0; i < 3; i++) { g.fillStyle = dk(['#c8503a', '#3a7aa0', '#d8a830'][i], -0.6); g.beginPath(); g.ellipse(dx + 230 + i * 46, GY - 40, 20, 9, 0, 0, 7); g.fill(); } seg(g, [[dx + 360, GY - 8], [dx + 366, GY - 260]], 6, '#0a0910'); seg(g, [[dx + 366, GY - 260], [dx + 380, GY - 280], [dx + 396, GY - 262]], 5, '#0a0910'); }
    // throw blanket + second cushion on the sofa, magazine + succulent + game pad on the coffee table, cat bowls
    { const sx = pos.sofaX; g.fillStyle = dk('#c8503a', -0.55); g.beginPath(); g.moveTo(sx + 60, GY - 190); g.quadraticCurveTo(sx + 150, GY - 180, sx + 200, GY - 100); g.lineTo(sx + 80, GY - 100); g.closePath(); g.fill(); for (let i = 0; i < 4; i++) seg(g, [[sx + 84 + i * 28, GY - 188 + i * 14], [sx + 94 + i * 24, GY - 106]], 2, alpha('#000', 0.25));
      rr(g, sx + 118, GY - 176, 66, 56, 14); g.fillStyle = dk('#3a7aa0', -0.5); g.fill();
      const tx = pos.tableX, ty = GY + 38; rr(g, tx - 130, ty - 74, 90, 8, 2); g.fillStyle = dk('#d8d0c0', -0.55); g.fill(); rr(g, tx - 120, ty - 82, 64, 8, 2); g.fillStyle = dk('#c8503a', -0.5); g.fill(); rr(g, tx + 112, ty - 88, 30, 22, 4); g.fillStyle = dk('#aa5a3a', -0.6); g.fill(); circle(g, tx + 127, ty - 96, 12, dk('#4a9a6a', -0.55)); circle(g, tx + 120, ty - 100, 8, dk('#6aba8a', -0.55));
      for (const bx of [CX + 556, CX + 566]) { g.fillStyle = dk('#9a5ad6', -0.55); g.beginPath(); g.ellipse(bx + (bx > CX + 560 ? 34 : -30), GY + 10, 26, 8, 0, 0, Math.PI); g.fill(); } }
    // fridge art: a kid's drawing, a photo, a calendar, post-its
    { const fx = pos.fridgeX; rr(g, fx - 80, GY - 210, 54, 66, 2); g.fillStyle = dk('#f4efe6', -0.5); g.fill(); g.strokeStyle = dk('#d4262e', -0.35); g.lineWidth = 3; g.beginPath(); g.arc(fx - 53, GY - 184, 12, 0, 7); g.stroke(); seg(g, [[fx - 53, GY - 172], [fx - 53, GY - 154]], 3, dk('#3a6ea5', -0.35));
      rr(g, fx - 12, GY - 232, 44, 36, 2); g.fillStyle = dk('#3a6ea5', -0.55); g.fill(); rr(g, fx + 40, GY - 214, 30, 30, 2); g.fillStyle = dk('#f2c21a', -0.5); g.fill(); rr(g, fx - 12, GY - 184, 36, 36, 2); g.fillStyle = dk('#d8d0c0', -0.55); g.fill(); }
    // counter clutter: toaster, fruit bowl, mug tree
    { const cxk = pos.counterX; rr(g, cxk - 100, GY - 246, 70, 42, 8); g.fillStyle = dk('#a8a8b8', -0.6); g.fill(); seg(g, [[cxk - 80, GY - 246], [cxk - 80, GY - 252]], 2, '#0a0910'); seg(g, [[cxk - 50, GY - 246], [cxk - 50, GY - 252]], 2, '#0a0910');
      g.fillStyle = dk('#8a6a48', -0.6); g.beginPath(); g.ellipse(cxk + 70, GY - 210, 56, 10, 0, 0, Math.PI); g.fill(); circle(g, cxk + 48, GY - 224, 14, dk('#d4262e', -0.5)); circle(g, cxk + 76, GY - 228, 14, dk('#f2c21a', -0.55)); circle(g, cxk + 98, GY - 222, 13, dk('#6aba4a', -0.55));
      seg(g, [[cxk + 200, GY - 204], [cxk + 200, GY - 290]], 4, '#0a0910'); for (const dy of [-280, -250]) { seg(g, [[cxk + 200, GY + dy + 0], [cxk + 226, GY + dy + 8]], 3, '#0a0910'); rr(g, cxk + 218, GY + dy + 4, 20, 24, 5); g.fillStyle = dk('#d8d0c0', -0.55); g.fill(); } }
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
