// sets/roofs.js — the hero's neighbourhood from roof height (ep 2), three views that share the look:
//   const R = roofs(g, t, cam, { view: 'houses'|'falls'|'pond', mood: 'dusk'|'day'|'night', moon: 0..1 (big rising moon, title shot), ladder: 1|0, kite: 1 (stuck in the tree)|0, splash: { x, k } (pond), ducks: 0..1 (0 calm, 1 outraged: flapping up) });
//   houses: a row of 2-storey houses; the hero's house has a flat garage roof (R.pos.roofY, ~3 m) to land on, the neighbour's garage roof for Biscuit (nextRoofX/Y),
//           a ladder leaning on the garage, a big tree with a kite stuck in it (kiteX/Y), lawn, picket fence, mailbox, bins, bike, gnome, porch lights.
//   falls:  a Niagara-style horseshoe falls backdrop with mist and a rainbow, the cliff-top railing and a lookout sign in the foreground (edgeX).
//   pond:   the town pond with ducks (animated, ripples), reeds, a jetty, a bench, a lamp; `splash` draws a crown + rings at x (k 0..1).
//   roofsFg(g, t, cam, { view })  blurred foreground (leaves / railing / reeds) after characters.
// Scale: 1 m = 260 units at the character plane (figures at s 1.9 = 1.75 m). Returns { GY, CX, M, rim, pos: {...} } (see each view).
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, blurLayer, text } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const M2U = 260;
export const roofsGround = () => E.H * V(0.8, 0.68);

function house(g, x, w, h, roofH, wall, roof, P, seed, lit = 0.6) {      // a 2-storey house front: pitched roof, chimney, 4 windows with curtains, door, gutter
  const GY = roofsGround(), r = rng(seed), top = GY - h;
  g.fillStyle = linGrad(g, 0, top, 0, GY, [wall, shade(wall, -0.3)]); g.fillRect(x, top, w, h);
  poly(g, [[x - 30, top], [x + w / 2, top - roofH], [x + w + 30, top]], roof); seg(g, [[x - 30, top], [x + w + 30, top]], 10, shade(roof, -0.3));
  rr(g, x + w * 0.72, top - roofH * 0.75, 50, roofH * 0.5, 4); g.fillStyle = shade(wall, -0.2); g.fill();
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const wx = x + w * (0.14 + i * 0.5), wy = top + 50 + j * h * 0.45, ww = w * 0.24, wh = h * 0.22, on = r() < lit;
    rr(g, wx, wy, ww, wh, 4); g.fillStyle = on ? mix(P, '#fff6dc', 0.2) : shade(wall, -0.55); g.fill(); if (on) glow(g, wx + ww / 2, wy + wh / 2, ww, P, 0.25);
    g.fillStyle = alpha(shade(['#c8503a', '#3a7aa0', '#d8a830'][Math.floor(r() * 3)], -0.2), 0.6); g.fillRect(wx, wy, ww * 0.22, wh); g.fillRect(wx + ww * 0.78, wy, ww * 0.22, wh);
    seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 4, shade(wall, -0.6)); seg(g, [[wx - 6, wy + wh + 4], [wx + ww + 6, wy + wh + 4]], 6, shade(wall, 0.15)); }
  rr(g, x + w * 0.42, GY - h * 0.36, w * 0.16, h * 0.36, 4); g.fillStyle = shade(['#8a1a22', '#2f4f7a', '#3a6a4a'][seed % 3], -0.15); g.fill(); circle(g, x + w * 0.55, GY - h * 0.18, 5, '#d8b860');
  glow(g, x + w * 0.5, GY - h * 0.4, 90, P, 0.35); circle(g, x + w * 0.5, GY - h * 0.4, 7, '#fff2d6');                                               // porch light
}
function duck(g, x, y, s, t, seed, flap) {
  const bob = Math.sin(t * 3 + seed) * 3, f = flap > 0 ? Math.sin(t * 30 + seed) : 0, up = flap * (40 + seed * 6) * s;
  g.save(); g.translate(x, y + bob - up); g.scale(s * (seed % 2 ? 1 : -1), s);
  g.fillStyle = '#e8e2d0'; g.beginPath(); g.ellipse(0, 0, 34, 18, 0, 0, Math.PI * 2); g.fill(); poly(g, [[-30, -6], [-48, -18], [-30, 4]], '#e8e2d0');
  circle(g, 26, -20, 13, '#2f7a4a'); poly(g, [[36, -22], [52, -18], [36, -14]], '#f2a020'); circle(g, 30, -24, 2.6, '#0a0a10');
  if (flap > 0) { poly(g, [[-6, -8], [-30, -8 - 40 * f], [10, -10]], '#d8d2c0'); text(g, '!', 30, -60, { size: 34, color: '#ffffff', font: 'Nunito', weight: 900 }); }
  else { g.fillStyle = '#d0c8b4'; g.beginPath(); g.ellipse(-4, -2, 18, 9, -0.2, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

export function roofs(g, t, cam, o = {}) {
  const view = o.view || 'houses', M = mood(o.mood || 'dusk'), GY = roofsGround(), CX = E.W / 2, U = M2U, P = M.practical, night = o.mood === 'night';
  const pos = { roofX: CX + 360, roofY: GY - 3.0 * U, roofW: 620, nextRoofX: CX + 1240, nextRoofY: GY - 2.8 * U, ladderX: CX + 180, treeX: CX - 820, kiteX: CX - 760, kiteY: GY - 4.2 * U, edgeX: CX + 120, pondX: CX, waterY: GY + 40, ducks: [] };
  // sky + (optional) a huge rising moon for the title shot (0.12)
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky, [-E.W * 2, -E.H * 3, E.W * 5, E.H * 5]);
    if (night || (o.moon ?? 0) > 0) { FX.stars(g, t * 0.3, { area: [-E.W, -E.H * 2, E.W * 3, E.H * 2], count: 160 }); }
    if ((o.moon ?? 0) > 0) { const mr = 260 + 140 * o.moon; glow(g, CX + 120, GY - 420, mr * 2.4, '#ffe8c8', 0.35); circle(g, CX + 120, GY - 420, mr, '#fff1d8'); for (const [dx, dy, rr2] of [[-0.3, -0.2, 0.16], [0.25, 0.1, 0.12], [-0.05, 0.35, 0.09]]) circle(g, CX + 120 + dx * mr, GY - 420 + dy * mr, rr2 * mr, alpha('#e0cfb0', 0.6)); }
    else if (!night) FX.sun(g, CX + 820, GY - 380, 56, '#fff3dc', M.key, 4);
    FX.clouds(g, { y: GY - 1100, h: 500, count: 7, color: night ? '#8a96c8' : '#ffe2c8', a: 0.16, seed: 11 });
  });
  if (view === 'falls') return fallsView(g, t, cam, o, M, GY, CX, pos);
  // far hills, trees and distant roofs (0.3)
  layer(g, cam, 0.3, (g) => {
    FX.hills(g, { y: GY - 160, amp: 160, color: mix(M.grass, '#0c0a14', 0.55), seed: 4 }); FX.hills(g, { y: GY - 60, amp: 110, color: mix(M.grass, '#0c0a14', 0.4), seed: 9 });
    for (let i = 0; i < 18; i++) { const x = -E.W + i * 300, h = 120 + (i % 3) * 30; g.fillStyle = mix(M.wall, '#0c0a14', 0.6); g.fillRect(x, GY - 60 - h, 180, h); poly(g, [[x - 14, GY - 60 - h], [x + 90, GY - 140 - h], [x + 194, GY - 60 - h]], mix('#8a3a2a', '#0c0a14', 0.55)); if (i % 2) { g.fillStyle = alpha(P, 0.55); g.fillRect(x + 40, GY - 20 - h, 30, 26); } }
    FX.fog(g, GY - 240, 260, M.fog, 0.25);
  });
  if (view === 'pond') return pondView(g, t, cam, o, M, GY, CX, pos);
  // HOUSES: neighbours' facades (0.6)
  layer(g, cam, 0.6, (g) => { const walls = ['#c8a888', '#9aa8c0', '#c89a8a', '#a8c0a0', '#d8c0a0']; for (let i = -3; i < 6; i++) if (i !== 1) house(g, CX - 400 + i * 760, 600, 640, 280, shade(walls[(i + 9) % walls.length], -0.35), shade('#7a3a2e', -0.2), P, i + 9, 0.5); });
  layer(g, cam, 1, (g) => {
    // lawn + pavement + picket fence
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 300, [shade(M.grass, -0.05), shade(M.grass, -0.4)]); g.fillRect(-E.W * 1.5, GY - 30, E.W * 4.5, E.H);
    g.fillStyle = shade(M.road, 0.05); g.fillRect(-E.W * 1.5, GY + 150, E.W * 4.5, 40);
    for (let x = -E.W * 1.5; x < E.W * 3; x += 46) { rr(g, x, GY + 60, 26, 110, 4); g.fillStyle = shade('#f0ece0', -0.25); g.fill(); poly(g, [[x, GY + 60], [x + 13, GY + 44], [x + 26, GY + 60]], shade('#f0ece0', -0.25)); }
    seg(g, [[-E.W * 1.5, GY + 90], [E.W * 3, GY + 90]], 8, shade('#f0ece0', -0.35));
    // the hero's house: 2 storeys + a flat-roof garage on the right with a low parapet (roof deck to land on)
    house(g, CX - 380, 680, 760, 320, shade('#d8b890', -0.25), shade('#8a3a2e', -0.15), P, 3, 0.75);
    const gx = pos.roofX, gw = pos.roofW, ry = pos.roofY; g.fillStyle = linGrad(g, 0, ry, 0, GY, [shade('#c8b8a0', -0.3), shade('#c8b8a0', -0.55)]); g.fillRect(gx, ry, gw, GY - ry);
    rr(g, gx + 90, GY - 330, gw - 180, 330, 6); g.fillStyle = shade('#d8d4cc', -0.45); g.fill(); for (let k = 1; k < 6; k++) seg(g, [[gx + 90, GY - 330 + k * 55], [gx + gw - 90, GY - 330 + k * 55]], 3, alpha('#000', 0.25));   // garage door
    rr(g, gx - 16, ry - 30, gw + 32, 34, 4); g.fillStyle = shade('#a89880', -0.3); g.fill(); seg(g, [[gx - 16, ry - 30], [gx + gw + 16, ry - 30]], 4, alpha(M.rim, 0.5));
    for (const px of [gx + 40, gx + gw - 60]) { rr(g, px, ry - 70, 28, 40, 4); g.fillStyle = shade('#3a8a5a', -0.3); g.fill(); circle(g, px + 14, ry - 80, 20, shade('#3a8a5a', -0.2)); }   // roof pot plants
    // the neighbour's garage roof (Biscuit's perch)
    g.fillStyle = shade('#a8b8c8', -0.5); g.fillRect(pos.nextRoofX - 260, pos.nextRoofY, 520, GY - pos.nextRoofY); rr(g, pos.nextRoofX - 276, pos.nextRoofY - 24, 552, 28, 4); g.fillStyle = shade('#8898a8', -0.45); g.fill();
    // ladder leaning against the garage
    if ((o.ladder ?? 1) > 0) { const lx = pos.ladderX, top2 = ry - 60; seg(g, [[lx - 60, GY], [lx + 40, top2]], 12, '#b8b8c0'); seg(g, [[lx + 20, GY], [lx + 120, top2]], 12, '#b8b8c0'); for (let k = 1; k < 10; k++) { const u = k / 10; seg(g, [[lx - 60 + 100 * u, GY - (GY - top2) * u], [lx + 20 + 100 * u, GY - (GY - top2) * u]], 7, '#a0a0a8'); } }
    // the kite tree on the left: trunk, crown, a diamond kite stuck in the branches with a fluttering tail
    const tx = pos.treeX; seg(g, [[tx, GY], [tx, GY - 600], [tx + 120, GY - 900]], 50, '#3a2a22'); seg(g, [[tx, GY - 520], [tx - 160, GY - 760]], 26, '#3a2a22');
    for (const [dx, dy, rr2] of [[0, -980, 230], [-210, -840, 180], [190, -820, 190], [60, -720, 170], [-120, -1080, 150]]) circle(g, tx + dx, GY + dy, rr2, shade(M.grass, -0.15 - (dx + 300) / 3000));
    if ((o.kite ?? 1) > 0) { const kx = pos.kiteX, ky = pos.kiteY; poly(g, [[kx, ky - 90], [kx + 60, ky], [kx, ky + 110], [kx - 60, ky]], '#d4262e'); poly(g, [[kx, ky - 90], [kx + 60, ky], [kx, ky]], '#f2c21a'); poly(g, [[kx, ky + 110], [kx - 60, ky], [kx, ky]], '#f2c21a'); seg(g, [[kx, ky - 90], [kx, ky + 110]], 3, '#3a2a22'); seg(g, [[kx - 60, ky], [kx + 60, ky]], 3, '#3a2a22');
      const tail = []; for (let i = 0; i <= 12; i++) tail.push([kx + i * 14 + Math.sin(t * 4 + i * 0.8) * 10, ky + 110 + i * 22]); seg(g, tail, 3, '#e8e2d0'); for (let i = 2; i < 12; i += 3) { const [bx, by] = tail[i]; poly(g, [[bx - 10, by - 6], [bx + 10, by + 6], [bx - 10, by + 6], [bx + 10, by - 6]], ['#2f6fd0', '#3aa05a', '#d4262e'][i % 3]); } }
    // garden bits: mailbox, bins, bike, gnome, sprinkler
    const mx = CX - 520; seg(g, [[mx, GY + 60], [mx, GY - 120]], 10, '#3a2a22'); rr(g, mx - 46, GY - 170, 92, 56, 20); g.fillStyle = '#2f6fd0'; g.fill(); seg(g, [[mx + 40, GY - 168], [mx + 40, GY - 210]], 4, '#d4262e'); g.fillStyle = '#d4262e'; g.fillRect(mx + 40, GY - 210, 22, 14);
    for (const [bx, c] of [[CX + 1060, '#3a6a4a'], [CX + 1150, '#3a4a7a']]) { rr(g, bx - 34, GY - 120, 68, 120, 8); g.fillStyle = shade(c, -0.2); g.fill(); rr(g, bx - 40, GY - 130, 80, 16, 6); g.fill(); }
    const bk = CX - 250; for (const dx of [-50, 50]) { g.strokeStyle = '#20202a'; g.lineWidth = 6; g.beginPath(); g.arc(bk + dx, GY - 36, 36, 0, Math.PI * 2); g.stroke(); } seg(g, [[bk - 50, GY - 36], [bk - 10, GY - 86], [bk + 50, GY - 36]], 5, '#d4262e'); seg(g, [[bk - 10, GY - 86], [bk - 20, GY - 104]], 5, '#20202a');
    const gnx = CX - 120; poly(g, [[gnx - 18, GY - 56], [gnx + 18, GY - 56], [gnx, GY - 110]], '#d4262e'); circle(g, gnx, GY - 48, 14, '#f2d8b8'); poly(g, [[gnx - 16, GY - 40], [gnx + 16, GY - 40], [gnx + 10, GY - 10], [gnx - 10, GY - 10]], '#3a6ad8'); poly(g, [[gnx - 10, GY - 40], [gnx + 10, GY - 40], [gnx, GY - 18]], '#ffffff');
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.25 + Math.sin(t * 2) * 0.1, u = (t * 0.8 + i * 0.13) % 1; circle(g, CX + 900 + Math.cos(a) * 160 * u, GY - 10 + Math.sin(a) * 120 * u + 120 * u * u, 3, alpha('#cfe8ff', 0.6 * (1 - u))); }   // sprinkler
  });
  FX.dust(g, t, { count: 20, color: M.key, a: 0.16, seed: 17 });
  return { GY, CX, M, rim: { color: M.rim, dir: [0.8, -0.5] }, pos };
}

function fallsView(g, t, cam, o, M, GY, CX, pos) {
  // the horseshoe falls (0.3): a curved curtain of white water dropping into a misty gorge, the river beyond, a rainbow in the spray
  layer(g, cam, 0.3, (g) => {
    const lip = GY - 360, base = GY + 120;
    g.fillStyle = mix(M.grass, '#0c0a14', 0.45); g.fillRect(-E.W * 2, lip - 160, E.W * 5, 170); FX.hills(g, { y: lip - 120, amp: 90, color: mix(M.grass, '#0c0a14', 0.55), seed: 3 });
    g.fillStyle = linGrad(g, 0, lip - 60, 0, lip, [shade('#3a7a8a', -0.3), shade('#5aa0b0', 0)]); g.beginPath(); g.moveTo(-E.W, lip); g.quadraticCurveTo(CX - 200, lip - 120, E.W * 2, lip); g.lineTo(E.W * 2, lip - 60); g.quadraticCurveTo(CX - 200, lip - 170, -E.W, lip - 60); g.closePath(); g.fill();   // river above the drop
    g.fillStyle = linGrad(g, 0, lip, 0, base, [mix('#c8e0e8', M.sky[1], 0.25), mix('#7aa8b8', M.sky[0], 0.3), mix('#a8c8d4', M.sky[1], 0.2)]); g.beginPath(); g.moveTo(-E.W, lip); g.quadraticCurveTo(CX - 200, lip - 120, E.W * 2, lip); g.lineTo(E.W * 2, base); g.lineTo(-E.W, base); g.closePath(); g.fill();
    for (let i = 0; i < 90; i++) { const x = -E.W + i * 48, u = (t * 1.4 + i * 0.37) % 1, y0 = lip - 60 * Math.sin((x + E.W) / (E.W * 3) * Math.PI); seg(g, [[x, y0 + u * 260], [x + 2, y0 + u * 260 + 90]], 5, alpha('#7aaab8', 0.5)); }
    g.fillStyle = linGrad(g, 0, base, 0, base + 600, [shade('#2a4a58', -0.2), shade('#0e1a22', -0.2)]); g.fillRect(-E.W * 2, base, E.W * 5, 900);                           // dark gorge + river below the drop
    for (let i = 0; i < 9; i++) { const ph = (t * 0.25 + i / 9) % 1; glow(g, -400 + i * 400, base - ph * 300, 300, '#e8f4ff', 0.2 * (1 - ph)); }                               // rising mist
    g.save(); g.globalCompositeOperation = 'lighter'; ['#ff5a5a', '#ffb84a', '#fff04a', '#5aef7a', '#5aa0ff', '#9a6aff'].forEach((c, i) => { g.strokeStyle = alpha(c, 0.12); g.lineWidth = 22; g.beginPath(); g.arc(CX + 300, base + 200, 700 - i * 22, Math.PI * 1.1, Math.PI * 1.75); g.stroke(); }); g.restore();
    FX.fog(g, base - 140, 260, '#e8f4ff', 0.22);
  });
  // cliff-top lookout (1): rock edge, railing, a lookout sign, a coin binocular viewer, wet grass
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 30, 0, E.H * 1.4, [shade('#6a6a5a', -0.2), shade('#3a3a32', -0.4)]); g.beginPath(); g.moveTo(-E.W * 1.5, GY - 30); g.lineTo(pos.edgeX, GY - 30); g.lineTo(pos.edgeX + 60, GY + 40); g.lineTo(pos.edgeX + 20, E.H * 1.6); g.lineTo(-E.W * 1.5, E.H * 1.6); g.closePath(); g.fill();
    g.fillStyle = shade(M.grass, -0.1); g.fillRect(-E.W * 1.5, GY - 40, pos.edgeX + E.W * 1.5 - 40, 16);
    for (let x = -E.W * 1.5; x < pos.edgeX - 40; x += 200) seg(g, [[x, GY - 30], [x, GY - 220]], 10, '#2a2a32'); seg(g, [[-E.W * 1.5, GY - 210], [pos.edgeX - 40, GY - 210]], 9, '#3a3a44'); seg(g, [[-E.W * 1.5, GY - 130], [pos.edgeX - 40, GY - 130]], 6, '#3a3a44');
    const sx = CX - 520; seg(g, [[sx, GY - 30], [sx, GY - 330]], 12, '#3a2a22'); rr(g, sx - 150, GY - 400, 300, 90, 10); g.fillStyle = '#2a5a3a'; g.fill(); g.strokeStyle = '#e8e2d0'; g.lineWidth = 4; g.stroke(); text(g, 'FALLS LOOKOUT', sx, GY - 355, { size: 32, color: '#e8e2d0', font: 'Nunito', weight: 900, spacing: 2 });
    const vx = CX - 900; seg(g, [[vx, GY - 30], [vx, GY - 200]], 14, '#3a3a44'); rr(g, vx - 50, GY - 260, 100, 70, 16); g.fillStyle = '#c8b030'; g.fill(); circle(g, vx + 40, GY - 236, 14, '#1a1a22'); circle(g, vx + 40, GY - 212, 14, '#1a1a22');
  });
  FX.drops(g, t, { count: 40, color: '#e8f4ff', rMin: 2, rMax: 6 });
  return { GY, CX, M, rim: { color: '#e8f4ff', dir: [1, -0.4] }, pos };
}

function pondView(g, t, cam, o, M, GY, CX, pos) {
  const wy = pos.waterY, flap = clamp(o.ducks ?? 0);
  layer(g, cam, 0.6, (g) => { for (let i = 0; i < 9; i++) FX.tree(g, -E.W + i * 520, GY - 60, 2.4 + (i % 3) * 0.3, mix(M.grass, '#0c0a14', 0.4)); seg(g, [[CX + 600, GY - 60], [CX + 600, GY - 420]], 10, '#20202a'); rr(g, CX + 570, GY - 470, 60, 60, 10); g.fillStyle = '#fff2d6'; g.fill(); glow(g, CX + 600, GY - 440, 260, M.practical, 0.4); });
  layer(g, cam, 1, (g) => {
    g.fillStyle = shade(M.grass, -0.15); g.fillRect(-E.W * 1.5, GY - 60, E.W * 4.5, 120);                                                                       // far bank
    g.fillStyle = linGrad(g, 0, wy - 30, 0, E.H * 1.5, [shade('#3a6a8a', -0.1), shade('#1a3048', -0.3)]); g.fillRect(-E.W * 1.5, wy - 30, E.W * 4.5, E.H * 1.4);   // water
    for (let i = 0; i < 30; i++) { const y = wy + 10 + i * 18 + i * i * 0.6, x = -E.W + ((i * 211 + t * 40 * (i % 2 ? 1 : -1)) % (E.W * 3)); seg(g, [[x, y], [x + 140 + i * 6, y]], 3, alpha('#cfe8ff', 0.18)); }   // ripples
    g.save(); g.globalAlpha *= 0.35; g.scale(1, -1); g.translate(0, -2 * wy); for (let i = 0; i < 9; i++) FX.tree(g, -E.W + i * 520, GY - 60, 2.4 + (i % 3) * 0.3, mix(M.grass, '#0c0a14', 0.4)); g.restore();                     // reflections
    rr(g, CX - 1000, wy - 50, 520, 26, 4); g.fillStyle = '#6a4a32'; g.fill(); for (let x = CX - 980; x < CX - 480; x += 110) seg(g, [[x, wy - 30], [x, wy + 80]], 12, '#4a3222');        // jetty
    for (let i = 0; i < 26; i++) { const x = CX + 820 + i * 22, h = 140 + (i * 37) % 90; seg(g, [[x, wy + 30], [x + Math.sin(t * 1.4 + i) * 6, wy + 30 - h]], 5, shade(M.grass, -0.1)); if (i % 4 === 0) rr(g, x - 6 + Math.sin(t * 1.4 + i) * 6, wy + 30 - h - 40, 12, 40, 6), g.fillStyle = '#5a3a22', g.fill(); }   // reeds + cattails
    rr(g, CX - 260, GY - 120, 300, 20, 4); g.fillStyle = '#7a5032'; g.fill(); rr(g, CX - 260, GY - 170, 300, 16, 4); g.fill(); for (const lx of [-240, 20]) seg(g, [[CX + lx, GY - 100], [CX + lx, GY - 50]], 8, '#20202a');   // bench on the bank
    const ducks = [[CX - 300, wy + 120], [CX - 120, wy + 170], [CX + 120, wy + 130], [CX + 360, wy + 190]];
    ducks.forEach(([x, y], i) => { const dx = x + Math.sin(t * 0.4 + i) * 40; pos.ducks.push([dx, y]); if (flap < 0.05) for (let k = 1; k <= 2; k++) { const u = ((t * 0.6 + i * 0.3 + k * 0.5) % 1); g.strokeStyle = alpha('#cfe8ff', 0.3 * (1 - u)); g.lineWidth = 2; g.beginPath(); g.ellipse(dx, y + 12, 40 + u * 60, 8 + u * 10, 0, 0, Math.PI * 2); g.stroke(); } duck(g, dx, y, 1.5, t, i + 1, flap * (0.6 + i * 0.15)); });
    if (o.splash) { const { x, k } = o.splash, sk = clamp(k); if (sk > 0 && sk < 1) { for (let i = 0; i < 3; i++) { const u = clamp(sk * 1.3 - i * 0.15); g.strokeStyle = alpha('#e8f4ff', 0.6 * (1 - u)); g.lineWidth = 6; g.beginPath(); g.ellipse(x, wy + 140, 60 + u * 420, 14 + u * 60, 0, 0, Math.PI * 2); g.stroke(); }
      for (let i = 0; i < 18; i++) { const a = Math.PI + (i / 17) * Math.PI, v = 300 + (i % 4) * 90, u = sk; circle(g, x + Math.cos(a) * v * u * 0.8, wy + 120 + Math.sin(a) * v * u * 1.4 + 900 * u * u * 0.6, 12 * (1 - u) + 3, alpha('#e8f4ff', 0.85)); } } }
  });
  FX.dust(g, t, { count: 18, color: M.key, a: 0.14, seed: 23 });
  return { GY, CX, M, rim: { color: M.rim, dir: [0.8, -0.5] }, pos };
}

export function roofsFg(g, t, cam, o = {}) {
  const view = o.view || 'houses';
  blurLayer(g, 12, (g) => {
    if (view === 'falls') { seg(g, [[-40, E.H * 0.7], [E.W * 0.4, E.H * 0.66]], 30, '#2a2a32'); seg(g, [[E.W * 0.12, E.H * 0.66], [E.W * 0.12, E.H + 40]], 34, '#2a2a32'); }
    else if (view === 'pond') { for (let i = 0; i < 14; i++) seg(g, [[E.W * 0.86 + i * 22, E.H + 40], [E.W * 0.86 + i * 22 + Math.sin(t + i) * 10, E.H * 0.55 - (i % 3) * 60]], 16, '#1f3a2a'); }
    else { for (let i = 0; i < 6; i++) { g.save(); g.translate(-40, -40); g.rotate(0.4 + i * 0.22 + Math.sin(t * 0.7 + i) * 0.03); g.fillStyle = i % 2 ? '#1f3a2a' : '#284a34'; g.beginPath(); g.ellipse(0, 260, 70, 280, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
  }, cam, 1.7);
}
