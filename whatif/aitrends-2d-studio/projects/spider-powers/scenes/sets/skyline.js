// sets/skyline.js — a sunset megacity with a Burj-style SUPERTALL (828 m) on a lake. Built TALL so the camera can rise past the tower.
//   const K = skyline(g, t, cam, { mood: 'golden', sun: 1, label: 1, splash: 0..1, splashX })   // draw BEFORE characters
//   characters stand on the lakeside promenade at K.GY; the lake is below it. The tower stands behind (parallax 0.55).
//   For the "camera rises past the tower" shot move cam.y NEGATIVE (up): the tower top sits at K.pos.towerTop (world y, depth 0.55),
//   about E.H * 1.9 above the promenade. Use K.pos.screenTop(cam) to know where its tip is on screen.
//   label: 0..1 draws the gold "828 m" height marker (tick + dashed leader to the tip). splash: 0..1 plays a splash ring on the lake at splashX.
//   skylineFg(g, t, cam)  blurred foreground: promenade railing + palm fronds (after characters)
// Returns { GY, CX, M, rim, pos: { towerX, towerTop, towerBase, lakeY, promX, rail, screenTop(cam) } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, clamp, lerp, blurLayer, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const skylineGround = () => E.H * V(0.78, 0.66);
const TOWER_H = () => E.H * 1.95;                      // world units from the tower base to the spire tip (at depth 0.55)

export function skyline(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = skylineGround(), CX = E.W / 2, sun = o.sun ?? 1, lit = o.lit ?? 0.7;
  const towerX = CX + 260, towerBase = GY - 40, towerTop = towerBase - TOWER_H(), lakeY = GY + 70;
  const pos = { towerX, towerTop, towerBase, lakeY, promX: CX - 200, rail: GY - 6,
    screenTop: (c) => { const d = 0.55, z = 1 + ((c.z ?? 1) - 1) * d; return [(towerX - E.W / 2 - (c.x || 0) * d) * z + E.W / 2, (towerTop - E.H / 2 - (c.y || 0) * d) * z + E.H / 2]; } };
  // ---- sky (0.08): tall gradient so a rising camera moves from sunset glow up into deep blue ----
  layer(g, cam, 0.08, (g) => {
    g.fillStyle = linGrad(g, 0, GY - E.H * 3.2, 0, GY + 40, [[0, '#0d1638'], [0.45, '#2b3470'], [0.72, M.sky[0]], [0.86, M.sky[1]], [1, M.sky[2]]]); g.fillRect(-E.W * 2, GY - E.H * 3.4, E.W * 5, E.H * 3.6);
    FX.stars(g, t * 0.3, { area: [-E.W, GY - E.H * 3.2, E.W * 3, E.H * 1.6], count: 160, seed: 41 });
    const sx = CX - 520, sy = GY - 110; glow(g, sx, sy, 760, '#ffb070', 0.42 * sun); glow(g, sx, sy, 260, '#ffe2b0', 0.6 * sun); circle(g, sx, sy, 64, alpha('#fff2d6', sun));
    FX.clouds(g, { seed: 12, count: 7, y: GY - 520, h: 260, color: '#ffc8a0', a: 0.16 }); FX.clouds(g, { seed: 19, count: 5, y: GY - E.H * 1.4, h: 300, color: '#c8b8ff', a: 0.08 });
  });
  // ---- far city (0.3): hazy towers, windows starting to light ----
  layer(g, cam, 0.3, (g) => {
    FX.skyline(g, { x: -E.W, y: GY - 60, w: E.W * 3, minH: 160, maxH: 420, color: mix(M.sky[0], '#1a1430', 0.55), windowColor: alpha(M.practical, 0.45), lit: 0.12 * lit, seed: 31 });
    FX.fog(g, GY - 240, 240, mix(M.sky[2], M.fog || '#c08a7a', 0.5), 0.35);
  });
  // ---- the SUPERTALL (0.55): stepped setbacks, glass ribs, spire, aircraft light; a ring of mid-rise towers around it ----
  layer(g, cam, 0.55, (g) => {
    const r = rng(52);
    for (let i = -6; i <= 6; i++) { if (Math.abs(i) < 1) continue; const x = towerX + i * 170 + (r() - 0.5) * 50, h = 260 + r() * 420, w = 90 + r() * 70, col = mix(M.wall, '#1c1426', 0.4 + r() * 0.3);
      g.fillStyle = linGrad(g, x, 0, x + w, 0, [shade(col, 0.15), col, shade(col, -0.35)]); g.fillRect(x - w / 2, towerBase - h, w, h + 40);
      for (let j = 0; j < h / 34; j++) for (let k = 0; k < 3; k++) if (r() < 0.32 * lit + 0.08) { g.fillStyle = alpha(mix(M.practical, '#ffffff', 0.2 * r()), 0.75); g.fillRect(x - w / 2 + 12 + k * (w - 24) / 3, towerBase - h + 16 + j * 34, (w - 24) / 3 - 8, 14); }
      g.fillStyle = alpha(M.key, 0.18); g.fillRect(x - w / 2, towerBase - h, w * 0.18, h); }                                                     // sunset edge on each tower
    const H = TOWER_H();
    // tower body: a tapering silhouette built from stepped tiers (wide at the base, needle at the top)
    const steps = [[0, 150], [0.18, 126], [0.34, 104], [0.5, 82], [0.64, 62], [0.76, 44], [0.86, 28], [0.92, 14]];
    const bodyC = mix(M.wall, '#2a2034', 0.35), litC = mix(M.key, '#ffe8c8', 0.3);
    for (let i = 0; i < steps.length; i++) { const [f0, hw] = steps[i], f1 = steps[i + 1]?.[0] ?? 0.94, y0 = towerBase - H * f0, y1 = towerBase - H * f1;
      g.fillStyle = linGrad(g, towerX - hw, 0, towerX + hw, 0, [shade(bodyC, 0.35), bodyC, shade(bodyC, -0.45)]); g.fillRect(towerX - hw, y1, hw * 2, y0 - y1 + 2);
      g.fillStyle = alpha(litC, 0.35); g.fillRect(towerX - hw, y1, hw * 0.35, y0 - y1);                                                              // the sunset-lit face
      for (let k = 1; k < 4; k++) seg(g, [[towerX - hw + k * hw * 0.5, y0], [towerX - hw + k * hw * 0.5, y1]], 2, alpha('#000', 0.25));               // glass ribs
      for (let y = y0 - 30; y > y1 + 10; y -= 46) if (rng(Math.floor(y))() < 0.4 * lit + 0.1) { g.fillStyle = alpha(M.practical, 0.6); g.fillRect(towerX - hw * 0.7, y, hw * 1.4, 6); }
      g.fillStyle = shade(bodyC, -0.3); g.fillRect(towerX - hw - 4, y1 - 6, hw * 2 + 8, 8); }                                                        // setback ledge
    seg(g, [[towerX, towerBase - H * 0.94], [towerX, towerTop]], 7, shade(bodyC, 0.2)); seg(g, [[towerX - 2, towerBase - H * 0.94], [towerX - 2, towerTop + 20]], 2, alpha(litC, 0.6));   // spire
    const blink = (Math.floor(t * 1.2) % 2) === 0; circle(g, towerX, towerTop, 7, blink ? '#ff4a3a' : '#7a2a26'); if (blink) glow(g, towerX, towerTop, 60, '#ff4a3a', 0.6);
    glow(g, towerX - 60, towerBase - H * 0.4, 420, '#ffb070', 0.08 * sun);
    // the gold "828 m" marker: a tick at the tip and a dashed leader down to a plate
    const lk = clamp(o.label ?? 1); if (lk > 0) { const lx = towerX + 240, ly = towerTop + 40; g.save(); g.globalAlpha *= lk; g.setLineDash([14, 10]); g.strokeStyle = alpha('#ffd47e', 0.85); g.lineWidth = 3; g.beginPath(); g.moveTo(towerX + 14, towerTop); g.lineTo(lx, towerTop); g.lineTo(lx, ly); g.stroke(); g.setLineDash([]);
      rr(g, lx - 10, ly, 180, 70, 14); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = 3; g.stroke(); text(g, '828 m', lx + 80, ly + 36, { size: 40, color: '#ffd47e', font: FONTS.ui, weight: 900, glow: 12, glowColor: 'rgba(255,212,126,.5)' }); g.restore(); }
  });
  // ---- lake + promenade (0.9 / 1.0) ----
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, lakeY, 0, E.H * 1.6, [mix(M.sky[2], '#2a3a6a', 0.45), mix(M.sky[0], '#0a1024', 0.75)]); g.fillRect(-E.W * 1.5, lakeY, E.W * 4, E.H * 1.4);
    // reflections: the sun streak + tower lights rippling
    for (let i = 0; i < 26; i++) { const y = lakeY + 14 + i * 16, w = 220 - i * 6 + Math.sin(t * 2 + i) * 30; g.fillStyle = alpha('#ffd8a8', 0.35 * sun * (1 - i / 26)); g.fillRect(CX - 520 - w / 2 + Math.sin(t * 1.3 + i * 0.7) * 10, y, w, 4); }
    for (let i = 0; i < 18; i++) { const y = lakeY + 20 + i * 22; g.fillStyle = alpha(M.practical, 0.18 * (1 - i / 18)); g.fillRect(towerX * 0.98 - 24 + Math.sin(t * 1.7 + i) * 8, y, 48 - i, 3); }
    // dancing-fountain jets on the lake (the famous show)
    for (let i = 0; i < 9; i++) { const fx = CX - 160 + i * 70, fh = (110 + 70 * Math.sin(t * 2.2 + i * 0.8)) * (0.6 + 0.4 * Math.sin(t * 0.9 + i)); g.fillStyle = linGrad(g, 0, lakeY + 40 - fh, 0, lakeY + 40, [alpha('#ffffff', 0.05), alpha('#dfe9ff', 0.45)]); g.fillRect(fx - 4, lakeY + 40 - fh, 8, fh); glow(g, fx, lakeY + 40 - fh, 30, '#ffffff', 0.25); }
    if (o.splash > 0) { const sx = o.splashX ?? CX + 120, k = clamp(o.splash); for (let i = 0; i < 3; i++) { const rk = clamp(k * 1.2 - i * 0.15); g.strokeStyle = alpha('#ffffff', 0.6 * (1 - rk)); g.lineWidth = 3; g.beginPath(); g.ellipse(sx, lakeY + 90, 40 + 260 * rk, 10 + 50 * rk, 0, 0, 7); g.stroke(); }
      for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.1 + 0.8 * (i / 13)), v = 260 * Math.sin(k * Math.PI); circle(g, sx + Math.cos(a) * v, lakeY + 80 + Math.sin(a) * v, 7, alpha('#e8f2ff', 0.8 * (1 - k))); } }
  });
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 70, [shade(M.floor, 0.1), shade(M.floor, -0.3)]); g.fillRect(-E.W, GY, E.W * 3.4, 70);                // promenade deck
    for (let x = -E.W; x < E.W * 2.4; x += 120) seg(g, [[x, GY + 4], [x + 30, GY + 66]], 2, alpha('#000', 0.18));
    // props on the character plane: benches, lamp posts with warm globes, planters with palms, a bin, an ice-cream cart, a tourist binocular stand
    for (const lx of [CX - 820, CX - 80, CX + 640, CX + 1360]) { seg(g, [[lx, GY], [lx, GY - 300]], 7, shade(M.dark, 0.1)); circle(g, lx, GY - 306, 18, '#ffe2a8'); glow(g, lx, GY - 306, 160, M.practical, 0.35); FX.pool(g, lx, GY + 20, 160, 26, M.practical, 0.2); }
    for (const bx of [CX - 560, CX + 420]) { rr(g, bx - 90, GY - 56, 180, 16, 6); g.fillStyle = shade('#8a5a3a', -0.35); g.fill(); rr(g, bx - 90, GY - 100, 180, 14, 6); g.fill(); for (const d of [-70, 70]) seg(g, [[bx + d, GY - 40], [bx + d, GY]], 6, shade(M.dark, 0.2)); }
    for (const px of [CX - 1120, CX + 980]) { rr(g, px - 50, GY - 80, 100, 80, 8); g.fillStyle = shade('#6a5a4a', -0.4); g.fill(); seg(g, [[px, GY - 80], [px + 10, GY - 320]], 12, shade('#7a5a3a', -0.4)); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45; seg(g, [[px + 10, GY - 320], [px + 10 + Math.cos(a) * 140, GY - 320 + Math.sin(a) * 60 + 50]], 14, shade('#3d6a44', -0.3)); } }
    rr(g, CX + 160, GY - 120, 130, 90, 12); g.fillStyle = shade('#e08aa8', -0.35); g.fill(); rr(g, CX + 150, GY - 150, 150, 30, 14); g.fillStyle = shade('#f0e8d8', -0.3); g.fill(); for (const wx of [CX + 180, CX + 270]) circle(g, wx, GY - 22, 20, '#14121a');   // ice-cream cart
    seg(g, [[CX - 320, GY], [CX - 320, GY - 120]], 8, shade(M.dark, 0.25)); rr(g, CX - 352, GY - 150, 64, 36, 10); g.fillStyle = shade('#5a6a7a', -0.3); g.fill();                         // coin binoculars
    rr(g, CX + 820, GY - 80, 56, 80, 8); g.fillStyle = shade('#3a5a6a', -0.5); g.fill();                                                                                               // bin
    // railing along the lake edge
    seg(g, [[-E.W, GY - 64], [E.W * 2.4, GY - 64]], 5, shade(M.dark, 0.35)); for (let x = -E.W; x < E.W * 2.4; x += 90) seg(g, [[x, GY - 64], [x, GY]], 3, shade(M.dark, 0.3));
  });
  const rim = { color: M.rim, dir: [-0.9, -0.3] };   // the sun is low on the left
  return { GY, CX, M, rim, pos };
}

// blurred foreground: a palm frond corner + the railing top, both very close to the lens
export function skylineFg(g, t, cam) {
  const M = mood('golden'), GY = skylineGround();
  blurLayer(g, 12, (g) => {
    seg(g, [[-E.W, GY + 160], [E.W * 3, GY + 160]], 22, shade(M.dark, 0.1));
    for (let i = 0; i < 7; i++) { const a = -0.4 + i * 0.22 + Math.sin(t * 0.8 + i) * 0.03; seg(g, [[-60, -40], [-60 + Math.cos(a) * 520, -40 + Math.sin(a) * 520]], 40, alpha('#1e3a24', 0.85)); }
  }, cam, 1.7);
}
