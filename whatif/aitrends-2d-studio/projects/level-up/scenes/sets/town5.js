// sets/town5.js — ep 5 "What If You Could Level Up Your Strength Every Day?": the TOWN SETS in the new, richer style (16:9, 1920x1080).
// ART UPGRADE (HANDOFF Stage 0 + whatif/what-if-levelup/STYLE.md): layered parallax, 2-3 tone shading on every surface, practical lights
// with bloom, atmosphere (haze, motes, mist), rim light. Day = the warm house look; night = ink-navy (#0B0F1A, never pure black) cut by
// sodium streetlights (#FF9F43), a faint violet rim (#7B5CFF, small). No cyan in the sets: cyan belongs to the Stat Card only.
// Nothing from any other show: an ordinary small town (hill road, terraces, a corner shop, a bus shelter, a block of flats), no skyline.
//
//   const T = town5(g, t, cam, { view, mood, ...view opts })      BEFORE characters. Returns { GY, CX, M, rim, light, pos, view }
//       M = 260 px per metre at depth 1 (a 1.75 m figure is ~455 px tall). rim = { color, dir } for the characters; light = key colour.
//   town5Fg(g, t, cam, { view })                                    AFTER characters: blurred foreground + atmosphere (motes / mist / steam)
//
//   view 'kitchen'  breakfast: window with morning sky + sun shafts across the table, sage cabinets, tiled splash, kettle, toaster,
//                   fridge, pendant lamp; the TABLE with the CEREAL BOWL (where the Zip opens), spoon, cereal box, milk, juice.
//                   opts { mood:'morning'|'day', milk:0..1 (bowl level), spill:0..1 }   pos { bowlX, bowlY (milk surface), tableX, tableTop,
//                   windowX, windowY, fridgeX, lampX, lampY, chairX }
//   view 'living'   the living room: curtained window (dusk), floor lamp (practical), framed photos, bookshelf, TV unit, patterned rug,
//                   the SOFA (opts.sofa: true; false = draw it yourself with sofa() to lift it), the TV REMOTE under it.
//                   opts { mood:'day'|'dusk'|'night', sofa, tv:0..1 }  pos { sofaX, sofaY (floor line), seatY, remoteX, remoteY, lampX, tvX }
//   view 'drive'    driveway + front lawn: houses across the road (parallax), our house side + garage, concrete driveway slabs, the
//                   striped LAWN (the car is parked on it), MUM'S PATIO (buff square tiles, pot plant, a garden chair), hedge, fence.
//                   opts { car: true, ball: true, sink: 0..1 (ankle holes in the lawn at pos.sinkX), crack: 0..1 (Mum's tiles), mood }
//                   pos { carX, carY, ballX, lawnX0, lawnX1, patioX0, patioX1, sinkX, crackX, driveX }
//   view 'park'     NIGHT PARK on the hill road: ink-navy sky + stars, the town below (terraces, lit windows, a corner shop, a bus shelter,
//                   a lit block of flats, far hills), the hill road sloping down with sodium streetlights + wet reflections, the park:
//                   grass, a playground (slide, swings), the PARK BENCH (opts.bench: true; false = lift it with parkBench()), railings, mist.
//                   opts { bench, wet: 0..1, cold: 0..1 (more mist/breath air) }  pos { benchX, benchY, slideX, slideTop, lampXs[], roadY(x) }
//   view 'field'    the MUDDY FIELD ROAD by the park at night: the path edge, a streetlight, a field of mud and puddles; the PUMPKIN
//                   TRUCK (opts.truck: true) slid off the path, one back wheel in the mud; planks / gravel / sand props by opts.
//                   opts { truck, sink: 0..1, lift: 0..1, spin: wheel turns, planks: 0..1, gravel: 0..1, sand: 0..1, out: 0..1 (truck back on
//                   the path) }  pos { truckX, truckY, wheelX, wheelY, puddleX, puddleY, plankX, gravelX, sandX, lampX }
// PROPS (each can be drawn alone, at any scale; local origin = bottom centre on the ground):
//   cerealBowl(g, x, y, s, { t, milk, spill, spoon: 0..1 (lifted) })   sofa(g, x, y, s, { lift, tilt, t }) -> { seatY, top }
//   tvRemote(g, x, y, s)   familyCar(g, x, y, s, { lift, tilt, t, lights }) -> { roof, sill }   football(g, x, y, s, { t, roll })
//   patioTiles(g, x, y, w, rows, { crack, cx })   lawnSink(g, x, y, s, { depth })   parkBench(g, x, y, s, { lift, tilt })
//   streetlight(g, x, gy, h, { on, t, wet })   pumpkin(g, x, y, s, { seed, glow })   pumpkinTruck(g, x, y, s, { t, sink, lift, spin, out, lights })
//   plank(g, x, y, len, { s, rot })   gravelPile(g, x, y, s, { k })   sandPour(g, t, x, y, s, { k })
// Deterministic (t, rng, noise). Render cost: no canvas filters; blur only via blurLayer (downscale).
import { E, V, layer, blurLayer, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const M5 = 260;
const P = {
  ink: '#0B0F1A', navy: '#141B2D', deep: '#05070C', sodium: '#FF9F43', violet: '#7B5CFF', gold: '#FFC93C', cream: '#FFF3C4',
  wall: '#efe0c4', sage: '#7f9f84', wood: '#a8754a', woodD: '#7a5032', tile: '#f4efe6', grass: '#5d9a52', grassD: '#3f7a3c',
};
export const TOWN5 = P;
const sh = (c, k) => shade(c, k);
// soft additive bloom: a bright core + a wide halo
function bloom(g, x, y, r, col, a = 1) { glow(g, x, y, r, col, 0.55 * a); glow(g, x, y, r * 0.35, mix(col, '#ffffff', 0.5), 0.6 * a); }
// a lit surface: base fill + vertical form gradient + top highlight line
function slab(g, x, y, w, h, col, o = {}) {
  rr(g, x, y, w, h, o.r ?? 6); g.fillStyle = linGrad(g, 0, y, 0, y + h, [sh(col, o.top ?? 0.1), col, sh(col, o.bot ?? -0.22)]); g.fill();
  if (o.line !== false) { g.strokeStyle = alpha(sh(col, -0.5), 0.55); g.lineWidth = o.lw ?? 2.5; g.stroke(); }
  if (o.hi !== false) { g.fillStyle = alpha('#ffffff', o.hi ?? 0.18); g.fillRect(x + 4, y + 2, w - 8, Math.max(2, h * 0.05)); }
}
const groundOf = { kitchen: 0.84, living: 0.84, drive: 0.8, park: 0.8, field: 0.8 };
export const town5Ground = (view = 'kitchen') => E.H * (groundOf[view] ?? 0.8);

// =====================================================================================================
export function town5(g, t, cam, o = {}) {
  const view = o.view || 'kitchen', GY = town5Ground(view), CX = E.W / 2;
  const f = { kitchen, living, drive, park, field }[view] || kitchen;
  const out = f(g, t, cam, o, GY, CX);
  return { GY, CX, M: M5, view, ...out };
}

// =====================================================================================================
// KITCHEN — breakfast
// =====================================================================================================
function kitchen(g, t, cam, o, GY, CX) {
  const morning = (o.mood || 'morning') === 'morning', sun = morning ? '#ffd9a0' : '#fff2d8';
  const pos = { windowX: CX - 420, windowY: GY - 820, tableX: CX + 80, tableTop: GY - 300, fridgeX: CX + 760, lampX: CX + 80, lampY: GY - 760, chairX: CX - 330 };
  pos.bowlX = pos.tableX - 40; pos.bowlY = pos.tableTop - 22 - 52 * 1.3;
  // sky + rooftops through the window (deep)
  layer(g, cam, 0.2, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 1000, 0, GY - 300, morning ? ['#8fb6e4', '#d7e6f2', '#ffe2b8'] : ['#7fb0e8', '#cfe4f6', '#eef4f8']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2.2);
    FX.sun(g, pos.windowX + 160, GY - 860, 40, '#fff6e0', '#ffd59a', 2.5);
    const R = rng(3); g.fillStyle = '#8a7a8e'; for (let i = 0; i < 9; i++) { const x = pos.windowX - 420 + i * 120, h = 90 + R() * 70; poly(g, [[x, GY - 470], [x, GY - 470 - h], [x + 60, GY - 520 - h], [x + 120, GY - 470 - h], [x + 120, GY - 470]], alpha('#7a6e86', 0.85)); }
    FX.clouds(g, { y: GY - 950, count: 3, color: '#ffffff', a: 0.55, seed: 5 });
  });
  // back wall, window frame, cabinets, splash, counter (0.55)
  layer(g, cam, 0.55, (g) => {
    const wx = pos.windowX, wy = pos.windowY, ww = 560, wh = 440;
    g.fillStyle = linGrad(g, 0, GY - 1400, 0, GY, [sh(P.wall, -0.12), P.wall, sh(P.wall, -0.06)]); g.beginPath(); g.rect(-E.W, -E.H, E.W * 3, GY + E.H); g.rect(wx - ww / 2, wy, ww, wh); g.fill('evenodd');
    for (let x = -E.W; x < E.W * 2; x += 46) { g.fillStyle = alpha('#c8a878', 0.08); g.fillRect(x, -E.H, 18, GY + E.H); }                 // wallpaper stripes
    glow(g, wx, wy + wh / 2, 900, sun, 0.1);                                                                                         // window bounce on the wall
    // window frame + mullion + sill + a plant
    g.strokeStyle = '#f8f4ec'; g.lineWidth = 22; g.strokeRect(wx - ww / 2, wy, ww, wh); seg(g, [[wx, wy], [wx, wy + wh]], 12, '#f8f4ec'); seg(g, [[wx - ww / 2, wy + wh * 0.42], [wx + ww / 2, wy + wh * 0.42]], 10, '#f8f4ec');
    slab(g, wx - ww / 2 - 40, wy + wh, ww + 80, 26, '#f8f4ec', { r: 4 });
    rr(g, wx + 150, wy + wh - 70, 70, 70, 10); g.fillStyle = '#c8704a'; g.fill(); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#4f8a55' : '#6aa860'; g.beginPath(); g.ellipse(wx + 185 + (i - 2.5) * 14, wy + wh - 100 - (i % 3) * 18, 14, 34, (i - 2.5) * 0.3, 0, 7); g.fill(); }
    // upper cabinets (left + right of the window)
    for (const [x0, n] of [[wx - ww / 2 - 700, 3], [wx + ww / 2 + 60, 2]]) for (let i = 0; i < n; i++) { const x = x0 + i * 210; slab(g, x, GY - 1080, 196, 300, P.sage, { r: 8 }); rr(g, x + 14, GY - 1066, 168, 272, 6); g.strokeStyle = alpha(sh(P.sage, -0.35), 0.6); g.lineWidth = 3; g.stroke(); rr(g, x + 150, GY - 860, 10, 50, 5); g.fillStyle = '#e8e0cc'; g.fill(); g.fillStyle = alpha('#000', 0.18); g.fillRect(x, GY - 780, 196, 26); }
    // tiled splash + counter + base units (left)
    const cl = CX - 1150, cr = CX - 340, ct = GY - 330;
    g.fillStyle = P.tile; g.fillRect(cl, ct - 240, cr - cl, 240);
    for (let y = ct - 240; y < ct; y += 40) for (let x = cl; x < cr; x += 40) { g.strokeStyle = alpha('#c8bca8', 0.7); g.lineWidth = 1.5; g.strokeRect(x, y, 40, 40); g.fillStyle = alpha('#ffffff', 0.35); g.fillRect(x + 4, y + 4, 10, 4); }
    slab(g, cl - 10, ct - 18, cr - cl + 20, 24, '#e6e0d4', { r: 3, hi: 0.4 });
    for (let x = cl; x < cr - 10; x += 200) { slab(g, x, ct + 6, 192, GY - ct - 10, sh(P.sage, -0.05), { r: 6 }); rr(g, x + 150, ct + 50, 10, 60, 5); g.fillStyle = '#e8e0cc'; g.fill(); }
    // kettle (steam), toaster, bread bin
    const kx = cl + 120; rr(g, kx - 50, ct - 120, 100, 102, 30); g.fillStyle = linGrad(g, kx - 50, 0, kx + 50, 0, ['#e8eaee', '#9aa0aa']); g.fill(); rr(g, kx - 30, ct - 138, 60, 20, 8); g.fillStyle = '#3a3e48'; g.fill(); seg(g, [[kx + 48, ct - 96], [kx + 76, ct - 116]], 9, '#c8ccd4');
    for (let i = 0; i < 5; i++) { const u = (t * 0.45 + i / 5) % 1; circle(g, kx + 76 + u * 26 + Math.sin(u * 6 + i) * 8, ct - 120 - u * 140, 10 + u * 22, alpha('#ffffff', 0.22 * (1 - u))); }
    slab(g, cl + 260, ct - 86, 150, 70, '#d24a3a', { r: 18 }); g.fillStyle = '#2a2230'; g.fillRect(cl + 292, ct - 86, 34, 6); g.fillRect(cl + 344, ct - 86, 34, 6);
    slab(g, cl + 470, ct - 110, 170, 94, '#e8c890', { r: 24 }); text(g, 'BREAD', cl + 555, ct - 66, { size: 26, color: '#7a5032', font: FONTS.ui, weight: 900, spacing: 3 });
    // fridge (right)
    const fx = pos.fridgeX; slab(g, fx - 170, GY - 820, 340, 820, '#e8ecf0', { r: 22, top: 0.06, bot: -0.12 }); seg(g, [[fx - 170, GY - 540], [fx + 170, GY - 540]], 4, '#a8aeb8'); rr(g, fx + 120, GY - 740, 12, 140, 6); g.fillStyle = '#a8aeb8'; g.fill(); rr(g, fx + 120, GY - 500, 12, 180, 6); g.fill();
    g.save(); g.translate(fx - 50, GY - 420); g.rotate(-0.05); g.fillStyle = '#ffffff'; g.fillRect(-70, -60, 140, 120); circle(g, -20, -10, 24, '#f2c230'); seg(g, [[-50, 40], [50, 40]], 6, '#3a9a4a'); g.restore(); circle(g, fx - 50, GY - 478, 9, '#d4262e');
    g.fillStyle = linGrad(g, fx - 170, 0, fx + 170, 0, [alpha('#ffffff', 0.25), alpha('#ffffff', 0), alpha('#000000', 0.08)]); g.fillRect(fx - 170, GY - 820, 340, 820);
    // pendant lamp (practical, warm)
    seg(g, [[pos.lampX, -E.H], [pos.lampX, pos.lampY - 70]], 4, '#2a2230');
    g.fillStyle = linGrad(g, pos.lampX - 110, 0, pos.lampX + 110, 0, ['#2a3a3a', '#4a6a64', '#2a3a3a']); g.beginPath(); g.moveTo(pos.lampX - 120, pos.lampY); g.quadraticCurveTo(pos.lampX, pos.lampY - 130, pos.lampX + 120, pos.lampY); g.closePath(); g.fill();
    g.fillStyle = '#fff2c8'; g.beginPath(); g.ellipse(pos.lampX, pos.lampY, 110, 14, 0, 0, 7); g.fill();
  });
  // floor (0.9)
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [sh(P.wood, 0.05), sh(P.wood, -0.3)]); g.fillRect(-E.W, GY, E.W * 3, 900);
    for (let i = 0; i < 26; i++) { const x = -E.W + i * 180; g.strokeStyle = alpha('#4a2e1a', 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(CX + (x - CX) * 0.55, GY); g.lineTo(CX + (x - CX) * 1.6, GY + 600); g.stroke(); }
    for (let y = GY + 40, k = 1; y < GY + 600; y += 40 * k, k *= 1.35) { g.strokeStyle = alpha('#4a2e1a', 0.18); g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(sun, morning ? 0.16 : 0.1); for (const dx of [-120, 140]) { g.beginPath(); g.moveTo(pos.windowX + dx - 90, GY); g.lineTo(pos.windowX + dx + 90, GY); g.lineTo(pos.windowX + dx + 330, GY + 420); g.lineTo(pos.windowX + dx + 60, GY + 420); g.closePath(); g.fill(); } g.restore();
  });
  // table + chairs + breakfast (1.0)
  layer(g, cam, 1, (g) => {
    FX.godRays(g, pos.windowX, pos.windowY + 200, { count: 5, spread: 0.5, len: 1300, color: sun, a: morning ? 0.045 : 0.03, angle: 0.75, t });
    chairBack(g, pos.chairX, GY, 1.6);
    const tx = pos.tableX, tt = pos.tableTop;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(tx, GY + 8, 420, 26, 0, 0, 7); g.fill();
    for (const lx of [tx - 330, tx + 330]) { rr(g, lx - 14, tt, 28, GY - tt, 6); g.fillStyle = linGrad(g, lx - 14, 0, lx + 14, 0, [P.woodD, sh(P.woodD, -0.3)]); g.fill(); }
    slab(g, tx - 400, tt - 22, 800, 30, P.wood, { r: 8, hi: 0.3 }); g.fillStyle = sh(P.woodD, -0.2); g.fillRect(tx - 392, tt + 8, 784, 14);
    for (let i = 0; i < 5; i++) seg(g, [[tx - 380 + i * 160, tt - 18], [tx - 300 + i * 160, tt - 18]], 1.5, alpha('#5a3a20', 0.35));
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, tx, tt - 16, 10, 420, [alpha('#ffe6b0', 0.3), alpha('#ffe6b0', 0)]); g.fillRect(tx - 420, tt - 30, 840, 30); g.restore();   // lamp pool on the tabletop
    cerealBox(g, tx + 190, tt - 22, 1); milkCarton(g, tx - 250, tt - 22, 1);
    rr(g, tx + 70, tt - 100, 46, 78, 8); g.fillStyle = alpha('#ffb43a', 0.75); g.fill(); g.strokeStyle = alpha('#ffffff', 0.7); g.lineWidth = 3; g.stroke(); g.fillStyle = alpha('#ffffff', 0.4); g.fillRect(tx + 76, tt - 94, 6, 60);
    cerealBowl(g, pos.bowlX, tt - 22, 1.3, { t, milk: o.milk ?? 1, spill: o.spill ?? 0 });
  });
  return { pos, rim: { color: '#ffe0b0', dir: [-0.8, -0.5] }, light: sun };
}
function chairBack(g, x, gy, s) {
  g.save(); g.translate(x, gy); g.scale(s, s);
  for (const lx of [-60, 60]) { rr(g, lx - 7, -120, 14, 120, 4); g.fillStyle = P.woodD; g.fill(); }
  rr(g, -70, -132, 140, 18, 6); g.fillStyle = P.wood; g.fill(); rr(g, -66, -300, 14, 170, 5); g.fillStyle = P.woodD; g.fill(); rr(g, 52, -300, 14, 170, 5); g.fill();
  for (let i = 0; i < 3; i++) { rr(g, -60, -290 + i * 50, 120, 16, 6); g.fillStyle = sh(P.wood, i * -0.05); g.fill(); }
  g.restore();
}
function cerealBox(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.04);
  rr(g, -60, -200, 120, 200, 6); g.fillStyle = linGrad(g, -60, 0, 60, 0, ['#f2c230', '#e0a020']); g.fill(); g.fillStyle = '#c87a10'; g.fillRect(40, -200, 20, 200);
  circle(g, -6, -96, 40, '#ffffff'); for (let i = 0; i < 7; i++) circle(g, -6 + Math.cos(i) * 22, -96 + Math.sin(i * 1.7) * 18, 9, '#d8903a');
  text(g, 'OATY', -6, -168, { size: 30, color: '#7a2e1a', font: FONTS.title, weight: 700 }); text(g, 'O\'S', -6, -36, { size: 26, color: '#7a2e1a', font: FONTS.title, weight: 700 });
  g.restore();
}
function milkCarton(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -40, -150, 80, 150, 4); g.fillStyle = linGrad(g, -40, 0, 40, 0, ['#ffffff', '#d8e0ea']); g.fill(); poly(g, [[-40, -150], [0, -190], [40, -150]], '#e8eef4'); rr(g, -6, -200, 12, 14, 3); g.fillStyle = '#2f6fd0'; g.fill();
  g.fillStyle = '#2f6fd0'; g.fillRect(-40, -96, 80, 34); text(g, 'MILK', 0, -78, { size: 22, color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
}
export function cerealBowl(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, milk = clamp(o.milk ?? 1), sp = clamp(o.spill ?? 0), lift = clamp(o.spoon ?? 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  if (sp > 0) { g.fillStyle = alpha('#f6f4ee', 0.9); g.beginPath(); g.ellipse(70 * sp, 2, 60 + 120 * sp, 10 + 6 * sp, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) circle(g, 60 + i * 40 * sp, 0, 6, '#d8903a'); }
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 2, 110, 12, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-100, -52); g.bezierCurveTo(-96, 6, 96, 6, 100, -52); g.closePath(); g.fillStyle = linGrad(g, -100, 0, 100, 0, ['#e8f0f4', '#ffffff', '#b8c8d4']); g.fill();
  g.fillStyle = '#3a8acc'; g.beginPath(); g.moveTo(-98, -40); g.bezierCurveTo(-60, -30, 60, -30, 98, -40); g.lineTo(96, -32); g.bezierCurveTo(60, -22, -60, -22, -96, -32); g.closePath(); g.fill();   // a blue band
  g.fillStyle = '#f6f4ee'; g.beginPath(); g.ellipse(0, -52, 100, 20, 0, 0, 7); g.fill();
  g.fillStyle = mix('#c8a070', '#f6f4ee', 1 - milk * 0.4); g.beginPath(); g.ellipse(0, -52 + (1 - milk) * 10, 88, 15, 0, 0, 7); g.fill();
  const R = rng(9); for (let i = 0; i < 16; i++) { const a = R() * 7, r = R() * 70, cx = Math.cos(a) * r, cy = -52 + Math.sin(a) * r * 0.16 + Math.sin(t * 1.5 + i) * 1.2; ring(g, cx, cy, 7, 4, i % 3 ? '#d8903a' : '#e8b060'); }
  g.save(); g.translate(60, -60 - lift * 80); g.rotate(-0.7 + lift * 0.4); rr(g, -6, -150, 12, 140, 6); g.fillStyle = linGrad(g, -6, 0, 6, 0, ['#e8eaee', '#9aa0aa']); g.fill(); g.fillStyle = '#c8ccd4'; g.beginPath(); g.ellipse(0, 0, 18, 26, 0, 0, 7); g.fill(); g.restore();
  g.fillStyle = alpha('#ffffff', 0.6); g.beginPath(); g.ellipse(-70, -30, 8, 16, -0.4, 0, 7); g.fill();
  g.restore();
}

// =====================================================================================================
// LIVING ROOM — the sofa
// =====================================================================================================
function living(g, t, cam, o, GY, CX) {
  const md = o.mood || 'dusk', night = md === 'night', dusk = md === 'dusk', tv = clamp(o.tv ?? 0.6);
  const pos = { sofaX: CX + 40, sofaY: GY + 20, lampX: CX - 620, tvX: CX + 760, remoteX: CX + 120, remoteY: GY + 14 };
  layer(g, cam, 0.2, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, GY, night ? ['#0b0f1a', '#1c2440'] : dusk ? ['#3a3a6a', '#d88a6a', '#f2c08a'] : ['#8fb6e4', '#e6f0f8']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2.2); if (!night) FX.sun(g, CX - 160, GY - 520, 40, '#fff0d8', '#ffb07a', 4); });
  layer(g, cam, 0.55, (g) => {
    const wx = CX - 160, wy = GY - 860, ww = 480, wh = 460, wall = night ? '#3a3448' : '#d8c4b0';
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [sh(wall, -0.2), wall, sh(wall, -0.08)]); g.beginPath(); g.rect(-E.W, -E.H, E.W * 3, GY + E.H); g.rect(wx - ww / 2, wy, ww, wh); g.fill('evenodd');
    // dado rail + lower panelling
    g.fillStyle = sh(wall, -0.1); g.fillRect(-E.W, GY - 360, E.W * 3, 360); seg(g, [[-E.W, GY - 360], [E.W * 2, GY - 360]], 10, sh(wall, 0.12));
    for (let x = -E.W; x < E.W * 2; x += 220) { rr(g, x + 20, GY - 330, 180, 290, 6); g.strokeStyle = alpha(sh(wall, -0.3), 0.4); g.lineWidth = 3; g.stroke(); }
    // window + curtains
    g.strokeStyle = '#f2ece2'; g.lineWidth = 18; g.strokeRect(wx - ww / 2, wy, ww, wh); seg(g, [[wx, wy], [wx, wy + wh]], 10, '#f2ece2');
    seg(g, [[wx - ww / 2 - 120, wy - 40], [wx + ww / 2 + 120, wy - 40]], 8, '#6a5040');
    for (const sd of [-1, 1]) { const cx0 = wx + sd * (ww / 2 + 30); g.fillStyle = linGrad(g, cx0 - 90, 0, cx0 + 90, 0, ['#6a3a5a', '#8a5070', '#5a2e4a']); g.beginPath(); g.moveTo(cx0 - 90, wy - 40); g.lineTo(cx0 + 90, wy - 40); g.quadraticCurveTo(cx0 + 60 * -sd, wy + 300, cx0 + 100 * -sd * 0.4, wy + wh + 120); g.lineTo(cx0 - 100 * sd * 0.2 - 40, wy + wh + 120); g.closePath(); g.fill(); for (let i = 0; i < 4; i++) seg(g, [[cx0 - 70 + i * 40, wy - 30], [cx0 - 66 + i * 40 - sd * 20, wy + wh + 100]], 3, alpha('#000', 0.15)); }
    // framed photos
    for (const [fx, fy, fw, fh, c] of [[CX - 980, GY - 900, 200, 150, '#7aa0c8'], [CX - 740, GY - 960, 140, 190, '#c8a07a'], [CX + 420, GY - 920, 240, 170, '#8ac07a']]) { slab(g, fx - 12, fy - 12, fw + 24, fh + 24, '#3a2e28', { r: 4 }); g.fillStyle = linGrad(g, 0, fy, 0, fy + fh, [sh(c, 0.3), c]); g.fillRect(fx, fy, fw, fh); circle(g, fx + fw * 0.4, fy + fh * 0.45, fh * 0.18, alpha('#f6e8d0', 0.8)); g.fillStyle = alpha('#3a2e28', 0.5); g.fillRect(fx, fy + fh * 0.7, fw, fh * 0.3); }
    // bookshelf (right)
    const bx = CX + 380; slab(g, bx, GY - 700, 300, 700, '#5a4030', { r: 6 }); for (let r = 0; r < 4; r++) { const y = GY - 680 + r * 170; g.fillStyle = '#3a2a20'; g.fillRect(bx + 14, y, 272, 150); const R = rng(r + 3); let x = bx + 20; while (x < bx + 270) { const w = 14 + R() * 20, h = 90 + R() * 50; rr(g, x, y + 150 - h, w, h, 2); g.fillStyle = ['#c84a3a', '#2f6fa0', '#e8c860', '#4a8a5a', '#8a5aa0', '#e8e0d0'][Math.floor(R() * 6)]; g.fill(); x += w + 3; } }
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [night ? '#3a2e2a' : '#8a6a52', night ? '#1a1418' : '#5a4232']); g.fillRect(-E.W, GY, E.W * 3, 900);
    // the rug (pattern, perspective)
    g.save(); g.beginPath(); g.moveTo(CX - 700, GY + 30); g.lineTo(CX + 800, GY + 30); g.lineTo(CX + 1100, GY + 260); g.lineTo(CX - 1000, GY + 260); g.closePath(); g.fillStyle = linGrad(g, 0, GY + 30, 0, GY + 260, ['#8a3a3a', '#6a2a30']); g.fill(); g.clip();
    for (let i = -6; i < 12; i++) { g.strokeStyle = alpha('#e8c890', 0.35); g.lineWidth = 6; g.beginPath(); g.moveTo(CX - 700 + i * 140, GY + 30); g.lineTo(CX - 700 + i * 160 - 80, GY + 260); g.stroke(); } g.restore();
  });
  layer(g, cam, 1, (g) => {
    // floor lamp (practical)
    const lx = pos.lampX; seg(g, [[lx, GY], [lx, GY - 640]], 8, '#2a2a30'); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(lx, GY + 4, 70, 10, 0, 0, 7); g.fill(); circle(g, lx, GY - 4, 30, '#2a2a30');
    g.fillStyle = linGrad(g, 0, GY - 780, 0, GY - 640, ['#f6e2b8', '#e8c890']); g.beginPath(); g.moveTo(lx - 70, GY - 780); g.lineTo(lx + 70, GY - 780); g.lineTo(lx + 110, GY - 640); g.lineTo(lx - 110, GY - 640); g.closePath(); g.fill();
    bloom(g, lx, GY - 700, 520, '#ffcf8a', 0.5); FX.pool(g, lx, GY + 10, 320, 50, '#ffcf8a', 0.25);
    // TV unit + TV (screen glow)
    const tx = pos.tvX; slab(g, tx - 230, GY - 160, 460, 160, '#3a3036', { r: 8 }); for (const dx of [-110, 110]) { rr(g, tx + dx - 90, GY - 140, 180, 120, 6); g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 3; g.stroke(); }
    rr(g, tx - 240, GY - 470, 480, 290, 12); g.fillStyle = '#16141a'; g.fill(); rr(g, tx - 226, GY - 456, 452, 262, 6); g.fillStyle = linGrad(g, 0, GY - 456, 0, GY - 194, [mix('#16141a', '#7aa8d8', tv * 0.7), mix('#16141a', '#d8a87a', tv * 0.5)]); g.fill();
    if (tv > 0) { glow(g, tx, GY - 320, 500, '#a8c8f0', 0.15 * tv); g.fillStyle = alpha('#ffffff', 0.08); g.beginPath(); g.moveTo(tx - 226, GY - 456); g.lineTo(tx - 60, GY - 456); g.lineTo(tx - 226, GY - 300); g.fill(); }
    seg(g, [[tx, GY - 180], [tx, GY - 160]], 18, '#16141a');
    // the TV remote under the sofa (drawn before the sofa so the sofa hides it until it is lifted)
    tvRemote(g, pos.remoteX, pos.remoteY, 1);
    if (o.sofa !== false) { const S = sofa(g, pos.sofaX, pos.sofaY, 1, { t }); pos.seatY = S.seatY; } else pos.seatY = pos.sofaY - 0.45 * M5;
  });
  return { pos, rim: { color: night ? '#9aa8ff' : '#ffd8a8', dir: [-0.8, -0.5] }, light: '#ffcf8a' };
}
export function tvRemote(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(0.12); rr(g, -60, -14, 120, 20, 8); g.fillStyle = '#1e1e26'; g.fill(); for (let i = 0; i < 5; i++) circle(g, -40 + i * 18, -4, 3.5, i === 0 ? '#d4262e' : '#5a5a66'); g.restore(); }
export function sofa(g, x, y, s = 1, o = {}) {
  const lift = o.lift ?? 0, tilt = o.tilt ?? 0, W = 540, H = 0.9 * M5, C = '#4a6a78';
  if (lift > 2) { g.fillStyle = `rgba(0,0,0,${0.22 / (1 + lift / 120)})`; g.beginPath(); g.ellipse(x, y + 4, W * 0.55 * s, 18 * s, 0, 0, 7); g.fill(); }
  g.save(); g.translate(x, y - lift); g.rotate(tilt); g.scale(s, s);
  if (lift <= 2) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, W * 0.55, 18, 0, 0, 7); g.fill(); }
  for (const fx of [-W / 2 + 40, W / 2 - 40]) { rr(g, fx - 10, -20, 20, 24, 4); g.fillStyle = '#3a2618'; g.fill(); }
  slab(g, -W / 2, -H, W, H - 18, sh(C, -0.08), { r: 30, top: 0.06, bot: -0.28 });                                                    // back
  for (const sd of [-1, 1]) slab(g, sd < 0 ? -W / 2 - 20 : W / 2 - 70, -H * 0.62, 90, H * 0.62 - 18, C, { r: 30, hi: 0.22 });      // arms
  slab(g, -W / 2 + 60, -H * 0.42, W - 120, H * 0.24, sh(C, 0.06), { r: 16, hi: 0.25 });                                           // seat
  for (const dx of [-120, 0, 120]) { rr(g, dx - 56, -H * 0.86, 112, H * 0.42, 22); g.fillStyle = linGrad(g, 0, -H * 0.86, 0, -H * 0.44, [sh(C, 0.16), sh(C, -0.02)]); g.fill(); g.strokeStyle = alpha(sh(C, -0.4), 0.5); g.lineWidth = 2; g.stroke(); }   // back cushions
  rr(g, -W / 2 + 70, -H * 0.66, 90, 70, 18); g.fillStyle = '#e8b860'; g.fill(); for (let i = 0; i < 3; i++) seg(g, [[-W / 2 + 82, -H * 0.62 + i * 20], [-W / 2 + 148, -H * 0.62 + i * 20]], 3, alpha('#a87a30', 0.6));   // a throw cushion
  g.fillStyle = alpha('#ffffff', 0.1); g.fillRect(-W / 2 + 30, -H + 8, W - 60, 6);
  g.restore();
  return { seatY: y - lift - H * 0.42 * s, top: y - lift - H * s };
}

// =====================================================================================================
// DRIVE — driveway, lawn, Mum's patio
// =====================================================================================================
function drive(g, t, cam, o, GY, CX) {
  const md = o.mood || 'day', dusk = md === 'dusk';
  const pos = { carX: CX - 40, carY: GY + 60, ballX: CX + 30, lawnX0: CX - 560, lawnX1: CX + 420, patioX0: CX + 470, patioX1: CX + 1150, sinkX: CX - 300, crackX: CX + 760, driveX: CX - 860 };
  pos.ballY = pos.carY - 4;
  layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY - 300, dusk ? ['#4a4a7a', '#e89a7a', '#ffd0a0'] : ['#5f9ae0', '#a8cdf0', '#e8f2f8']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2.4); FX.clouds(g, { y: 120, count: 4, color: '#ffffff', a: 0.6, seed: 8 }); if (dusk) FX.sun(g, CX + 500, GY - 600, 50, '#fff0d8', '#ffb07a', 5); });
  // houses across the road (terraces) + trees
  layer(g, cam, 0.35, (g) => {
    const R = rng(12), cols = ['#b86a50', '#c8a080', '#a85a48', '#d8c0a0', '#9a6a5a'];
    g.save(); g.translate(CX, GY - 280); g.scale(0.62, 0.62); g.translate(-CX, -(GY - 280));
    for (let i = -5; i < 12; i++) { const x = CX - 1300 + i * 330, top = GY - 720, c = cols[(i + 30) % 5]; slab(g, x, top, 330, 440, c, { r: 0, line: false, hi: 0.08 });
      poly(g, [[x - 10, top], [x + 165, top - 150], [x + 340, top]], sh('#5a4a52', R() * 0.1)); rr(g, x + 230, top - 160, 40, 70, 3); g.fillStyle = sh(c, -0.25); g.fill();
      for (const wx of [x + 50, x + 190]) { rr(g, wx, top + 60, 90, 110, 4); g.fillStyle = dusk && R() < 0.5 ? '#ffd98a' : '#8aa8c8'; g.fill(); g.strokeStyle = '#f2ece2'; g.lineWidth = 6; g.stroke(); rr(g, wx, top + 240, 90, 110, 4); g.fillStyle = '#7a98b8'; g.fill(); g.stroke(); }
      rr(g, x + 130, top + 300, 70, 140, 4); g.fillStyle = ['#2f5a8a', '#3a7a5a', '#8a2e3a', '#e8c860', '#4a4a5a'][(i + 30) % 5]; g.fill(); }
    g.restore(); g.fillStyle = alpha(dusk ? '#e8a88a' : '#b8d4f0', 0.28); g.fillRect(-E.W, GY - 600, E.W * 3, 330);
    g.fillStyle = '#6a6e78'; g.fillRect(-E.W, GY - 280, E.W * 3, 60); g.fillStyle = '#8a8e96'; g.fillRect(-E.W, GY - 290, E.W * 3, 12);   // pavement + road beyond
    for (let i = 0; i < 6; i++) FX.tree(g, CX - 1100 + i * 520, GY - 260, 1.2, '#3f6a3c');
  });
  // our house side wall + garage (left), hedge + fence
  layer(g, cam, 0.7, (g) => {
    const hx = CX - 1180; slab(g, hx - 400, GY - 900, 620, 900, '#c88a6a', { r: 0, line: false });
    for (let y = GY - 880; y < GY; y += 30) for (let x = hx - 400 + ((y / 30) % 2) * 30; x < hx + 220; x += 60) { g.strokeStyle = alpha('#8a5a40', 0.3); g.lineWidth = 1.5; g.strokeRect(x, y, 60, 30); }
    slab(g, hx - 300, GY - 520, 420, 520, '#e8e4dc', { r: 4 }); for (let i = 1; i < 8; i++) seg(g, [[hx - 300, GY - 520 + i * 65], [hx + 120, GY - 520 + i * 65]], 3, alpha('#8a8e96', 0.6));   // garage door
    g.fillStyle = '#3a6a3a'; g.beginPath(); g.moveTo(CX - 600, GY - 60); for (let x = CX - 600; x < CX + 1300; x += 40) g.lineTo(x, GY - 210 - Math.abs(noise(x * 0.02, 3)) * 50); g.lineTo(CX + 1300, GY - 60); g.closePath(); g.fill();   // hedge
    g.fillStyle = alpha('#5aa04a', 0.6); const R = rng(4); for (let i = 0; i < 70; i++) circle(g, CX - 600 + R() * 1900, GY - 190 + R() * 110, 8 + R() * 10, alpha(R() < 0.5 ? '#5a9a4a' : '#2f5a30', 0.6));
  });
  layer(g, cam, 0.9, (g) => {
    // driveway concrete (left), lawn (centre, striped), patio (right) on the ground plane
    const y0 = GY - 60, y1 = GY + 500;
    g.fillStyle = linGrad(g, 0, y0, 0, y1, ['#b8b4ac', '#8a8680']); g.fillRect(-E.W, y0, pos.lawnX0 + E.W, y1 - y0); for (let x = -E.W; x < pos.lawnX0; x += 220) seg(g, [[x, y0], [x - 60, y1]], 2, alpha('#6a6660', 0.6)); for (let y = y0 + 90; y < y1; y += 140) seg(g, [[-E.W, y], [pos.lawnX0, y]], 2, alpha('#6a6660', 0.5));
    for (let i = 0; i < 8; i++) { const x = pos.lawnX0 + i * (pos.lawnX1 - pos.lawnX0) / 8; g.fillStyle = i % 2 ? P.grass : sh(P.grass, 0.08); g.fillRect(x, y0, (pos.lawnX1 - pos.lawnX0) / 8 + 1, y1 - y0); }
    g.fillStyle = linGrad(g, 0, y0, 0, y1, [alpha('#ffffff', 0.06), alpha('#000000', 0.2)]); g.fillRect(pos.lawnX0, y0, pos.lawnX1 - pos.lawnX0, y1 - y0);
    const R = rng(7); g.strokeStyle = alpha(P.grassD, 0.7); g.lineWidth = 2; for (let i = 0; i < 160; i++) { const x = pos.lawnX0 + R() * (pos.lawnX1 - pos.lawnX0), y = y0 + 10 + R() * (y1 - y0); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 6, y - 8 - R() * 8); g.stroke(); }
    seg(g, [[pos.lawnX0, y0], [pos.lawnX0, y1]], 6, '#9a968e'); seg(g, [[pos.lawnX1, y0], [pos.lawnX1 + 30, y1]], 6, '#9a968e');
    patioTiles(g, pos.patioX0 + 40, y0, pos.patioX1 - pos.patioX0 + 600, 5, { crack: o.crack ?? 0, cx: pos.crackX });
    // a pot plant + a garden chair on the patio
    rr(g, pos.patioX1 - 180, GY - 130, 110, 110, 14); g.fillStyle = linGrad(g, 0, GY - 130, 0, GY - 20, ['#d8805a', '#a85a3a']); g.fill(); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#4f8a55' : '#6aa860'; g.beginPath(); g.ellipse(pos.patioX1 - 125 + (i - 3.5) * 16, GY - 170 - (i % 3) * 20, 16, 46, (i - 3.5) * 0.25, 0, 7); g.fill(); }
  });
  layer(g, cam, 1, (g) => {
    if ((o.sink ?? 0) > 0) lawnSink(g, pos.sinkX, pos.carY + 20, 1, { depth: o.sink });
    if (o.ball !== false) football(g, pos.ballX, pos.ballY, 1, { t });
    if (o.car !== false) familyCar(g, pos.carX, pos.carY, 1, { t });
  });
  return { pos, rim: { color: dusk ? '#ffc08a' : '#fff4dc', dir: [-0.8, -0.5] }, light: '#fff4dc' };
}
export function patioTiles(g, x, y, w, rows = 5, o = {}) {
  const ck = clamp(o.crack ?? 0), cx = o.cx ?? x + w / 2, R = rng(31);
  for (let r = 0; r < rows; r++) { const y0 = y + r * r * 16 + r * 60, y1 = y + (r + 1) * (r + 1) * 16 + (r + 1) * 60, sk = (y1 - y) * 0.25, tw = 140 + r * 30;
    for (let x0 = x - 200, i = 0; x0 < x + w; x0 += tw, i++) { const c = mix('#d8c8a8', '#c8b490', R() * 0.6); poly(g, [[x0 + 4 - sk * 0.2, y0 + 3], [x0 + tw - 4 - sk * 0.2, y0 + 3], [x0 + tw - 4 + sk * 0.2, y1 - 3], [x0 + 4 + sk * 0.2, y1 - 3]], c); g.fillStyle = alpha('#ffffff', 0.12); g.fillRect(x0 + 6, y0 + 4, tw - 12, 4); } }
  if (ck > 0) { g.strokeStyle = '#4a3a2a'; g.lineCap = 'round'; const cy = y + 80; for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6 + (R() - 0.5) * 0.3, L = (70 + R() * 130) * ck; g.lineWidth = 4 - i % 2; g.beginPath(); g.moveTo(cx, cy); let px = cx, py = cy; for (let k = 1; k <= 4; k++) { px = cx + Math.cos(a + (R() - 0.5) * 0.4) * L * k / 4; py = cy + Math.sin(a + (R() - 0.5) * 0.4) * L * k / 4 * 0.45 + (a < -Math.PI / 2 ? 0 : 0); g.lineTo(px, Math.max(y + 4, py)); } g.stroke(); } for (let i = 0; i < 8 * ck; i++) poly(g, [[cx + (R() - 0.5) * 120, cy + (R() - 0.5) * 40], [cx + (R() - 0.5) * 120 + 8, cy + (R() - 0.5) * 40 - 6], [cx + (R() - 0.5) * 120 + 12, cy + (R() - 0.5) * 40 + 4]], '#b8a888'); }
}
export function lawnSink(g, x, y, s = 1, o = {}) {
  const d = clamp(o.depth ?? 1); g.save(); g.translate(x, y); g.scale(s, s);
  for (const dx of [-50, 50]) { g.fillStyle = '#4a3220'; g.beginPath(); g.ellipse(dx, 0, 46, 14 + 4 * d, 0, 0, 7); g.fill(); g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(dx, 2, 34, 9 * d + 2, 0, 0, 7); g.fill();
    const R = rng(dx + 50); for (let i = 0; i < 9; i++) { const a = R() * Math.PI, r = 46 + R() * 22; circle(g, dx + Math.cos(a) * r, -Math.sin(a) * 10 * d - 2, 4 + R() * 6, i % 2 ? '#5a3a24' : '#3f7a3c'); } }
  g.restore();
}
export function football(g, x, y, s = 1, o = {}) {
  const rot = (o.roll ?? 0); g.save(); g.translate(x, y - 34 * s); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 34, 30, 6, 0, 0, 7); g.fill(); g.rotate(rot);
  circle(g, 0, 0, 34, '#f6f6f2'); for (let i = 0; i < 5; i++) { const a = i * 1.2566; poly(g, [0, 1, 2, 3, 4].map(k => [Math.cos(a) * 22 + Math.cos(k * 1.2566 + a) * 9, Math.sin(a) * 22 + Math.sin(k * 1.2566 + a) * 9]), '#d4262e'); }
  poly(g, [0, 1, 2, 3, 4].map(k => [Math.cos(k * 1.2566 - 1.57) * 11, Math.sin(k * 1.2566 - 1.57) * 11]), '#d4262e');
  g.fillStyle = linGrad(g, -34, -34, 34, 34, [alpha('#ffffff', 0.35), alpha('#000000', 0.25)]); g.beginPath(); g.arc(0, 0, 34, 0, 7); g.fill(); g.restore();
}
export function familyCar(g, x, y, s = 1, o = {}) {
  const lift = o.lift ?? 0, tilt = o.tilt ?? 0, C = '#5a8ab0', L = 4.0 * M5 * 0.92, H = 1.45 * M5 * 0.92;
  g.fillStyle = `rgba(0,0,0,${0.3 / (1 + lift / 80)})`; g.beginPath(); g.ellipse(x, y + 4, L * 0.52 * s, 22 * s, 0, 0, 7); g.fill();
  g.save(); g.translate(x, y - lift); g.rotate(tilt); g.scale(s, s);
  const wr = 64, wy = -wr, wxs = [-L * 0.32, L * 0.32];
  // body: lower shell + cabin (hatchback)
  g.beginPath(); g.moveTo(-L / 2, -wr * 0.9); g.lineTo(-L / 2 + 10, -H * 0.52); g.quadraticCurveTo(-L / 2 + 40, -H * 0.6, -L * 0.3, -H * 0.62); g.lineTo(-L * 0.18, -H); g.lineTo(L * 0.22, -H); g.quadraticCurveTo(L * 0.34, -H * 0.98, L * 0.42, -H * 0.62); g.quadraticCurveTo(L / 2, -H * 0.58, L / 2, -H * 0.4); g.lineTo(L / 2 - 6, -wr * 0.9); g.closePath();
  g.fillStyle = linGrad(g, 0, -H, 0, -wr * 0.9, [sh(C, 0.25), C, sh(C, -0.25)]); g.fill(); g.strokeStyle = sh(C, -0.55); g.lineWidth = 3; g.stroke();
  // windows
  g.fillStyle = linGrad(g, 0, -H, 0, -H * 0.6, ['#c8e0f0', '#5a7a98']); g.beginPath(); g.moveTo(-L * 0.27, -H * 0.64); g.lineTo(-L * 0.16, -H + 16); g.lineTo(-L * 0.01, -H + 16); g.lineTo(-L * 0.01, -H * 0.64); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(L * 0.02, -H * 0.64); g.lineTo(L * 0.02, -H + 16); g.lineTo(L * 0.2, -H + 16); g.lineTo(L * 0.33, -H * 0.64); g.closePath(); g.fill();
  g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.moveTo(-L * 0.2, -H * 0.66); g.lineTo(-L * 0.12, -H + 18); g.lineTo(-L * 0.08, -H + 18); g.lineTo(-L * 0.16, -H * 0.66); g.fill();
  seg(g, [[L * 0.005, -H + 12], [L * 0.005, -wr]], 6, sh(C, -0.4)); seg(g, [[-L * 0.3, -H * 0.6], [L * 0.44, -H * 0.6]], 3, alpha('#ffffff', 0.3));   // door seam + shoulder line
  rr(g, -L * 0.08, -H * 0.5, 50, 10, 4); g.fillStyle = sh(C, -0.35); g.fill(); rr(g, L * 0.14, -H * 0.5, 50, 10, 4); g.fill();
  // lights + bumpers + plate
  rr(g, L / 2 - 30, -H * 0.5, 26, 40, 8); g.fillStyle = '#fff6d8'; g.fill(); rr(g, -L / 2 + 2, -H * 0.5, 22, 46, 6); g.fillStyle = '#d43a2e'; g.fill();
  if (o.lights) { bloom(g, L / 2 - 16, -H * 0.48, 160, '#fff2c8', 0.6); }
  slab(g, -L / 2 - 6, -wr * 1.1, 60, 30, '#3a3e48', { r: 8, hi: 0.1 }); slab(g, L / 2 - 54, -wr * 1.1, 60, 30, '#3a3e48', { r: 8, hi: 0.1 });
  rr(g, -L / 2 + 70, -wr * 1.5, 110, 30, 4); g.fillStyle = '#f2e060'; g.fill(); text(g, 'LV5 CAR', -L / 2 + 125, -wr * 1.5 + 16, { size: 18, color: '#1a1a22', font: FONTS.ui, weight: 900 });
  // wheels
  for (const wx of wxs) { circle(g, wx, wy, wr + 10, sh(C, -0.6)); circle(g, wx, wy, wr, '#1e1e24'); circle(g, wx, wy, wr * 0.55, '#a8aeb8'); for (let k = 0; k < 5; k++) { const a = k * 1.2566 + (o.t ?? 0) * 0; seg(g, [[wx, wy], [wx + Math.cos(a) * wr * 0.5, wy + Math.sin(a) * wr * 0.5]], 5, '#6a707a'); } circle(g, wx, wy, 10, '#3a3e48'); }
  g.fillStyle = alpha('#ffffff', 0.2); g.fillRect(-L * 0.4, -H * 0.58, L * 0.8, 5);
  g.restore();
  return { roof: [x, y - lift - H * s], sill: [x, y - lift - wr * 1.2 * s] };
}

// =====================================================================================================
// PARK — night, the hill road, the town below
// =====================================================================================================
export function streetlight(g, x, gy, h = 640, o = {}) {
  const on = o.on ?? 1, t = o.t ?? 0, fl = on * (0.94 + 0.06 * noise(t * 7, x));
  seg(g, [[x, gy], [x, gy - h]], 12, '#1a2030'); seg(g, [[x - 3, gy], [x - 3, gy - h]], 3, alpha(P.violet, 0.35));
  seg(g, [[x, gy - h], [x + 60, gy - h - 20], [x + 110, gy - h - 10]], 9, '#1a2030');
  g.fillStyle = '#2a3040'; g.beginPath(); g.ellipse(x + 112, gy - h - 6, 36, 12, 0, 0, 7); g.fill(); g.fillStyle = mix('#5a4a3a', '#ffe0b0', fl); g.beginPath(); g.ellipse(x + 112, gy - h + 2, 26, 6, 0, 0, 7); g.fill();
  if (fl > 0.05) { bloom(g, x + 112, gy - h + 4, 260, P.sodium, 0.85 * fl); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, gy - h, 0, gy, [alpha(P.sodium, 0.16 * fl), alpha(P.sodium, 0.03 * fl)]); g.beginPath(); g.moveTo(x + 90, gy - h + 6); g.lineTo(x + 134, gy - h + 6); g.lineTo(x + 360, gy); g.lineTo(x - 140, gy); g.closePath(); g.fill(); g.restore();
    FX.pool(g, x + 112, gy + 10, 300, 46, P.sodium, 0.35 * fl);
     }
}
function park(g, t, cam, o, GY, CX) {
  const wet = clamp(o.wet ?? 0.6), cold = clamp(o.cold ?? 0.5);
  const roadY = (x) => GY - 190 - (x - CX) * 0.05;                                                     // the hill road behind the park, falling to the right
  const pos = { benchX: CX - 120, benchY: GY + 70, slideX: CX + 600, slideTop: GY - 330, lampXs: [CX - 860, CX + 180, CX + 1180], roadY };
  layer(g, cam, 0.06, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY - 260, ['#05070c', P.ink, '#18203a', '#2c2a4c']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2.4);
    FX.stars(g, t * 0.2, { count: 160, area: [-200, -200, E.W + 400, GY - 420], seed: 4 });
    glow(g, CX + 520, 150, 300, '#c8d4ff', 0.18); circle(g, CX + 520, 150, 34, '#e8ecff'); circle(g, CX + 532, 144, 30, mix(P.ink, '#e8ecff', 0.25));
    glow(g, CX - 200, GY - 380, 1100, P.violet, 0.08);
  });
  // the town below the hill: far hills, rooftops with lit windows, a lit block of flats, far streetlights
  layer(g, cam, 0.22, (g) => {
    g.fillStyle = '#10182c'; g.beginPath(); g.moveTo(-E.W, GY - 430); for (let x = -E.W; x < E.W * 2; x += 60) g.lineTo(x, GY - 470 - Math.abs(noise(x * 0.003, 2)) * 150); g.lineTo(E.W * 2, GY); g.lineTo(-E.W, GY); g.fill();
    const R = rng(21);
    for (let i = 0; i < 90; i++) { const x = -E.W * 0.6 + i * 42 + R() * 20, y = GY - 300 + R() * 60, w = 34 + R() * 34, h = 24 + R() * 34; poly(g, [[x, y], [x, y - h], [x + w / 2, y - h - 16], [x + w, y - h], [x + w, y]], mix('#141c34', '#1c2440', R())); if (R() < 0.5) { g.fillStyle = '#ffcf7a'; g.fillRect(x + w * 0.3, y - h * 0.6, 7, 7); glow(g, x + w * 0.3 + 3, y - h * 0.6 + 3, 20, '#ffb860', 0.35); } }
    const fx = CX + 700, fy = GY - 560; slab(g, fx, fy, 170, 300, '#1c2440', { r: 0, line: false, hi: 0.04 }); for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { if (R() < 0.35) continue; g.fillStyle = R() < 0.3 ? '#a8c0ff' : '#ffd28a'; g.fillRect(fx + 14 + c * 40, fy + 16 + r * 34, 22, 16); } glow(g, fx + 85, fy + 150, 280, '#ffc070', 0.12);
    for (let i = 0; i < 30; i++) { const x = -E.W * 0.4 + i * 120 + R() * 60, y = GY - 250 + R() * 40; circle(g, x, y, 2.5, P.sodium); glow(g, x, y, 34, P.sodium, 0.35); }
    g.fillStyle = linGrad(g, 0, GY - 360, 0, GY - 180, [alpha('#2a2a4c', 0), alpha('#2a2a4c', 0.45)]); g.fillRect(-E.W, GY - 360, E.W * 3, 200);   // valley haze
  });
  // the road + the far kerb: railings, the corner shop + bus shelter on the far pavement
  layer(g, cam, 0.6, (g) => {
    const sx = CX + 260, sy = roadY(sx) - 230; slab(g, sx, sy, 270, 200, '#22283c', { r: 0, line: false }); rr(g, sx + 18, sy + 66, 234, 118, 4); g.fillStyle = '#ffe6b0'; g.fill(); glow(g, sx + 135, sy + 125, 280, '#ffd08a', 0.35);
    rr(g, sx + 8, sy + 8, 254, 44, 4); g.fillStyle = '#2f6a4a'; g.fill(); text(g, 'CORNER SHOP', sx + 135, sy + 31, { size: 24, color: '#fff3c4', font: FONTS.ui, weight: 900, spacing: 3 });
    for (let i = 0; i < 5; i++) { rr(g, sx + 28 + i * 46, sy + 84, 30, 38, 3); g.fillStyle = ['#e85a4a', '#f2c230', '#5aa04a', '#3a8acc', '#e8a040'][i]; g.fill(); }
    const bx = CX - 620, by = roadY(bx) - 150; g.fillStyle = alpha('#a8c8e8', 0.16); g.fillRect(bx, by, 200, 120); g.strokeStyle = '#3a4258'; g.lineWidth = 6; g.strokeRect(bx, by, 200, 120); slab(g, bx - 10, by - 16, 220, 18, '#3a4258', { r: 2 }); glow(g, bx + 100, by + 20, 150, '#e8f0ff', 0.22); rr(g, bx + 220, by - 40, 14, 160, 3); g.fillStyle = '#3a4258'; g.fill(); circle(g, bx + 227, by - 50, 20, '#e8e0c8');
    for (let x = -E.W; x < E.W * 2; x += 36) seg(g, [[x, roadY(x) - 70], [x, roadY(x) - 20]], 4, '#2a3044'); g.strokeStyle = '#2a3044'; g.lineWidth = 6; g.beginPath(); for (let x = -E.W; x <= E.W * 2; x += 80) x === -E.W ? g.moveTo(x, roadY(x) - 70) : g.lineTo(x, roadY(x) - 70); g.stroke();
    g.fillStyle = '#3a4054'; g.beginPath(); g.moveTo(-E.W, roadY(-E.W) - 20); g.lineTo(E.W * 2, roadY(E.W * 2) - 20); g.lineTo(E.W * 2, roadY(E.W * 2) - 4); g.lineTo(-E.W, roadY(-E.W) - 4); g.fill();   // far pavement
    g.fillStyle = linGrad(g, 0, roadY(CX) - 4, 0, roadY(CX) + 110, ['#1a2030', '#121722']); g.beginPath(); g.moveTo(-E.W, roadY(-E.W) - 4); g.lineTo(E.W * 2, roadY(E.W * 2) - 4); g.lineTo(E.W * 2, roadY(E.W * 2) + 110); g.lineTo(-E.W, roadY(-E.W) + 110); g.fill();
    g.strokeStyle = alpha('#e8e0c8', 0.5); g.lineWidth = 5; g.setLineDash([50, 40]); g.beginPath(); g.moveTo(-E.W, roadY(-E.W) + 50); g.lineTo(E.W * 2, roadY(E.W * 2) + 50); g.stroke(); g.setLineDash([]);
    if (wet > 0) { g.save(); g.globalCompositeOperation = 'lighter'; for (const lx of pos.lampXs) { const rx = lx + 112, ry = roadY(lx) + 4; g.fillStyle = linGrad(g, 0, ry, 0, ry + 104, [alpha(P.sodium, 0.32 * wet), alpha(P.sodium, 0)]); g.beginPath(); g.ellipse(rx + Math.sin(t * 1.3) * 2, ry + 52, 22, 52, 0, 0, 7); g.fill(); g.fillStyle = alpha('#ffe0b0', 0.25 * wet); g.beginPath(); g.ellipse(rx, ry + 20, 6, 18, 0, 0, 7); g.fill(); } g.restore(); }
    seg(g, [[-E.W, roadY(-E.W) + 112], [E.W * 2, roadY(E.W * 2) + 112]], 8, '#5a6070');                                           // near kerb
  });
  // the park: grass slope, playground, the bench
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 100, 0, GY + 400, ['#1c3022', '#0e1814']); g.beginPath(); g.moveTo(-E.W, roadY(-E.W) + 116); g.lineTo(E.W * 2, roadY(E.W * 2) + 116); g.lineTo(E.W * 2, GY + 900); g.lineTo(-E.W, GY + 900); g.fill();
    const R = rng(5); g.lineWidth = 2; for (let i = 0; i < 220; i++) { const x = -200 + R() * (E.W + 400), y = GY - 70 + R() * 380; g.strokeStyle = alpha(R() < 0.5 ? '#3a5a3a' : '#2a4430', 0.7); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 5, y - 8 - R() * 6); g.stroke(); }
    g.fillStyle = alpha('#3a3024', 0.6); g.beginPath(); g.moveTo(CX - 420, GY + 400); g.quadraticCurveTo(CX - 200, GY + 40, CX + 80, GY - 60); g.lineTo(CX + 200, GY - 60); g.quadraticCurveTo(CX, GY + 60, CX - 160, GY + 400); g.fill();   // a worn path
    const sx = pos.slideX, sg = GY - 10; seg(g, [[sx - 80, sg], [sx - 80, sg - 280]], 8, '#3a4258'); seg(g, [[sx - 20, sg], [sx - 20, sg - 280]], 8, '#3a4258'); for (let i = 1; i < 6; i++) seg(g, [[sx - 80, sg - i * 46], [sx - 20, sg - i * 46]], 5, '#3a4258');
    slab(g, sx - 96, sg - 290, 92, 20, '#c84a3a', { r: 4 }); g.strokeStyle = '#c85040'; g.lineWidth = 22; g.beginPath(); g.moveTo(sx - 10, sg - 282); g.quadraticCurveTo(sx + 130, sg - 210, sx + 240, sg - 10); g.stroke(); g.strokeStyle = alpha(P.sodium, 0.45); g.lineWidth = 4; g.beginPath(); g.moveTo(sx - 4, sg - 290); g.quadraticCurveTo(sx + 136, sg - 218, sx + 246, sg - 18); g.stroke();
    pos.slideTop = sg - 300; pos.slideX = sx - 50;
    const wx = CX - 980, wg = GY - 20; seg(g, [[wx - 160, wg], [wx - 100, wg - 320], [wx + 100, wg - 320], [wx + 160, wg]], 8, '#3a4258'); for (const dx of [-50, 50]) { const sw = Math.sin(t * 1.2 + dx) * 0.08; seg(g, [[wx + dx, wg - 320], [wx + dx + Math.sin(sw) * 220, wg - 90]], 2.5, '#5a6070'); rr(g, wx + dx + Math.sin(sw) * 220 - 30, wg - 94, 60, 10, 3); g.fillStyle = '#2a3044'; g.fill(); }
  });
  layer(g, cam, 1, (g) => {
    for (const lx of pos.lampXs) streetlight(g, lx, roadY(lx) + 110, 640, { t, wet });
    if (o.bench !== false) parkBench(g, pos.benchX, pos.benchY, 1, {});
  });
  return { pos, rim: { color: P.sodium, dir: [0.7, -0.6], far: P.violet }, light: P.sodium, cold };
}
export function parkBench(g, x, y, s = 1, o = {}) {
  const lift = o.lift ?? 0, tilt = o.tilt ?? 0, W = 1.8 * M5;
  g.fillStyle = `rgba(0,0,0,${0.35 / (1 + lift / 80)})`; g.beginPath(); g.ellipse(x, y + 4, W * 0.5 * s, 14 * s, 0, 0, 7); g.fill();
  g.save(); g.translate(x, y - lift); g.rotate(tilt); g.scale(s, s);
  for (const lx of [-W * 0.4, W * 0.4]) { seg(g, [[lx - 20, 0], [lx, -120], [lx + 10, -240]], 12, '#1e2230'); seg(g, [[lx + 20, 0], [lx, -120]], 12, '#1e2230'); }
  for (let i = 0; i < 3; i++) slab(g, -W / 2, -128 + i * 16 - 8, W, 14, mix('#6a4a32', '#3a2a20', i * 0.2), { r: 3, hi: 0.15, lw: 1.5 });
  for (let i = 0; i < 3; i++) slab(g, -W / 2 + 10, -250 + i * 34, W - 20, 22, '#6a4a32', { r: 3, hi: 0.15, lw: 1.5 });
  g.fillStyle = alpha(P.sodium, 0.18); g.fillRect(-W / 2, -250, W, 6);                                                              // sodium catch-light on the top rail
  rr(g, -40, -210, 80, 30, 3); g.fillStyle = '#8a7a50'; g.fill(); text(g, 'IN MEMORY OF BOB', 0, -195, { size: 9, color: '#2a2218', font: FONTS.ui, weight: 900 });
  g.restore();
}

// =====================================================================================================
// FIELD — the muddy road + the pumpkin truck (night)
// =====================================================================================================
export function pumpkin(g, x, y, s = 1, o = {}) {
  const R = rng((o.seed ?? 1) * 13 + 3), w = 1 + R() * 0.3, c = mix('#f08a24', '#e86a10', R());
  g.save(); g.translate(x, y); g.scale(s * w, s);
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 13, -32, 22 - Math.abs(i) * 3, 32, 0, 0, 7); g.fillStyle = sh(c, -Math.abs(i) * 0.06 - (i > 0 ? 0.06 : 0)); g.fill(); }
  g.strokeStyle = alpha('#8a3a08', 0.5); g.lineWidth = 2; for (const i of [-1, 0, 1]) { g.beginPath(); g.moveTo(i * 13, -60); g.quadraticCurveTo(i * 18, -32, i * 13, -4); g.stroke(); }
  g.fillStyle = alpha('#fff0c0', 0.35); g.beginPath(); g.ellipse(-16, -46, 6, 12, -0.3, 0, 7); g.fill();
  seg(g, [[0, -62], [4, -78], [10, -82]], 6, '#4a6a2a');
  if (o.glow) glow(g, 0, -32, 70, '#ffb050', 0.3 * o.glow);
  g.restore();
}
export function plank(g, x, y, len = 400, o = {}) { const s = o.s ?? 1; g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); slab(g, -len / 2, -22, len, 22, '#b8925e', { r: 3, hi: 0.25 }); for (let i = 0; i < 3; i++) seg(g, [[-len / 2 + 30 + i * len * 0.3, -14], [-len / 2 + 30 + i * len * 0.3 + len * 0.2, -12]], 1.5, alpha('#6a4a28', 0.5)); circle(g, -len / 2 + 14, -11, 3, '#4a3a2a'); circle(g, len / 2 - 14, -11, 3, '#4a3a2a'); g.restore(); }
export function gravelPile(g, x, y, s = 1, o = {}) { const k = clamp(o.k ?? 1), R = rng(17); g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < Math.round(60 * k); i++) { const a = R() * Math.PI, r = R() ** 0.7 * 80; circle(g, Math.cos(a) * r * 1.3, -Math.sin(a) * r * 0.45, 5 + R() * 6, mix('#8a8e96', '#c8ccd4', R())); } g.restore(); }
export function sandPour(g, t, x, y, s = 1, o = {}) {
  const k = clamp(o.k ?? 1); g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#e8c890'; g.beginPath(); g.ellipse(0, 0, 40 + 100 * k, 10 + 14 * k, 0, 0, 7); g.fill(); g.fillStyle = alpha('#fff0c8', 0.4); g.beginPath(); g.ellipse(-20, -4, 30 + 40 * k, 5 + 4 * k, 0, 0, 7); g.fill();
  if (k > 0 && k < 1) { const R = rng(Math.floor(t * 24)); for (let i = 0; i < 40; i++) circle(g, (R() - 0.5) * 30, -R() * 220, 2.5, '#e8c890'); }   // the falling stream
  g.restore();
}
export function pumpkinTruck(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, sink = clamp(o.sink ?? 1) * (1 - clamp(o.out ?? 0)), lift = o.lift ?? 0, L = 1500, H = 560, wr = 92, C = '#2f5a8a';
  const tilt = -0.07 * sink + 0.05 * clamp(lift / 120);                                                       // the back sags into the mud
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 6, L * 0.54, 26, 0, 0, 7); g.fill();
  g.translate(L * 0.3, -wr); g.rotate(tilt); g.translate(-L * 0.3, wr);                                           // pivot about the front wheel
  // chassis + flatbed (left) + cab (right)
  slab(g, -L / 2, -wr - 50, L, 50, '#2a2e36', { r: 6, hi: 0.08 });
  const bx0 = -L / 2, bx1 = L * 0.12; slab(g, bx0, -wr - 230, bx1 - bx0, 180, '#8a5a32', { r: 4 });                                // wooden bed sides
  for (let i = 0; i < 4; i++) seg(g, [[bx0 + 6, -wr - 210 + i * 44], [bx1 - 6, -wr - 210 + i * 44]], 3, alpha('#4a2e18', 0.6)); for (let x0 = bx0 + 120; x0 < bx1; x0 += 160) seg(g, [[x0, -wr - 230], [x0, -wr - 50]], 8, '#5a3a20');
  // the pumpkins, piled
  const R = rng(5); for (let row = 0; row < 3; row++) for (let i = 0; i < 9 - row * 2; i++) { const px = bx0 + 90 + row * 80 + i * ((bx1 - bx0 - 180 - row * 160) / Math.max(1, 8 - row * 2)), py = -wr - 220 - row * 52 + R() * 8; pumpkin(g, px, py, 1.15 - row * 0.05, { seed: row * 10 + i, glow: 0 }); }
  rr(g, bx0 + 200, -wr - 330 - 140, 500, 70, 8); g.fillStyle = '#f2e8d0'; g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 3; g.stroke(); text(g, 'PUMPKIN FESTIVAL', bx0 + 450, -wr - 330 - 104, { size: 34, color: '#c85a10', font: FONTS.title, weight: 700, spacing: 2 });
  seg(g, [[bx0 + 260, -wr - 400], [bx0 + 260, -wr - 230]], 5, '#3a2a1a'); seg(g, [[bx0 + 640, -wr - 400], [bx0 + 640, -wr - 230]], 5, '#3a2a1a');
  // cab
  const cx0 = L * 0.14, cx1 = L / 2; g.beginPath(); g.moveTo(cx0, -wr - 50); g.lineTo(cx0, -H); g.lineTo(cx1 - 160, -H); g.quadraticCurveTo(cx1 - 70, -H + 10, cx1 - 40, -H * 0.62); g.lineTo(cx1, -H * 0.56); g.lineTo(cx1, -wr - 50); g.closePath();
  g.fillStyle = linGrad(g, 0, -H, 0, -wr - 50, [sh(C, 0.25), C, sh(C, -0.3)]); g.fill(); g.strokeStyle = sh(C, -0.6); g.lineWidth = 3; g.stroke();
  g.fillStyle = linGrad(g, 0, -H, 0, -H * 0.6, ['#8ab0d0', '#2a3a58']); g.beginPath(); g.moveTo(cx0 + 40, -H + 30); g.lineTo(cx1 - 170, -H + 30); g.quadraticCurveTo(cx1 - 90, -H + 40, cx1 - 66, -H * 0.66); g.lineTo(cx0 + 40, -H * 0.66); g.closePath(); g.fill();
  g.fillStyle = alpha('#ffffff', 0.25); g.beginPath(); g.moveTo(cx0 + 70, -H * 0.68); g.lineTo(cx0 + 130, -H + 34); g.lineTo(cx0 + 160, -H + 34); g.lineTo(cx0 + 100, -H * 0.68); g.fill();
  rr(g, cx0 + 120, -H * 0.52, 60, 12, 5); g.fillStyle = sh(C, -0.4); g.fill(); seg(g, [[cx0 + 260, -H + 20], [cx0 + 260, -wr - 50]], 4, sh(C, -0.45));
  rr(g, cx1 - 36, -H * 0.5, 30, 46, 8); g.fillStyle = '#fff6d8'; g.fill();
  if (o.lights !== false) { bloom(g, cx1 - 20, -H * 0.47, 260, '#fff2c8', 0.6); const blink = Math.floor(t * 1.6) % 2 === 0; for (const ix of [cx1 - 20, bx0 + 14]) { rr(g, ix - 12, -wr - 100, 24, 20, 5); g.fillStyle = blink ? P.sodium : '#6a3a10'; g.fill(); if (blink) bloom(g, ix, -wr - 90, 120, P.sodium, 0.7); } }
  // wheels (back one sunk in the mud)
  const spin = (o.spin ?? 0) * Math.PI * 2;
  for (const [wx, back] of [[-L * 0.32, true], [L * 0.32, false]]) { const wy = -wr + (back ? sink * 70 : 0); circle(g, wx, wy, wr + 12, '#1a1c22'); circle(g, wx, wy, wr, '#24262e'); circle(g, wx, wy, wr * 0.5, '#8a8e96'); for (let k = 0; k < 6; k++) { const a = k * 1.047 + (back ? spin : 0); seg(g, [[wx + Math.cos(a) * wr * 0.6, wy + Math.sin(a) * wr * 0.6], [wx + Math.cos(a) * wr * 0.95, wy + Math.sin(a) * wr * 0.95]], 8, '#121418'); } circle(g, wx, wy, 14, '#3a3e48');
    if (back && sink > 0) { for (let k = 0; k < 8; k++) { const a = Math.PI * (1.1 + k * 0.1); circle(g, wx + Math.cos(a) * (wr + 6), wy + Math.sin(a) * (wr + 6) * -1 + 10, 8, alpha('#4a3220', 0.8)); } } }
  g.restore();
}
function field(g, t, cam, o, GY, CX) {
  const TS = 0.78, pos = { truckX: CX + 80, truckY: GY + 80, truckS: TS, puddleX: CX - 640, puddleY: GY + 200, plankX: CX - 720, gravelX: CX - 100, sandX: CX + 40, lampX: CX + 760 };
  pos.wheelX = pos.truckX - 1500 * 0.32 * TS; pos.wheelY = pos.truckY;
  layer(g, cam, 0.06, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY - 160, ['#05070c', P.ink, '#1a2038', '#2a2848']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2.4); FX.stars(g, t * 0.2, { count: 110, area: [-200, -200, E.W + 400, GY - 300], seed: 9 }); glow(g, CX - 400, GY - 260, 1000, P.violet, 0.07); });
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = '#121a2c'; g.beginPath(); g.moveTo(-E.W, GY - 260); for (let x = -E.W; x < E.W * 2; x += 50) g.lineTo(x, GY - 300 - Math.abs(noise(x * 0.004, 7)) * 120); g.lineTo(E.W * 2, GY); g.lineTo(-E.W, GY); g.fill();
    for (let i = 0; i < 9; i++) FX.tree(g, CX - 1400 + i * 380, GY - 240, 1.4, '#0e1424');
    for (let i = 0; i < 14; i++) { const x = CX - 1200 + i * 220; circle(g, x, GY - 250, 3, P.sodium); glow(g, x, GY - 250, 40, P.sodium, 0.3); }      // the park road lights, far
  });
  layer(g, cam, 0.85, (g) => {
    // the field: mud with ruts and puddles (sodium reflections); the path edge (gravel strip) at the back
    g.fillStyle = linGrad(g, 0, GY - 160, 0, GY + 500, ['#3a2c20', '#20160e']); g.fillRect(-E.W, GY - 160, E.W * 3, 1000);
    g.fillStyle = '#4a4a50'; g.beginPath(); g.moveTo(-E.W, GY - 170); g.lineTo(E.W * 2, GY - 170); g.lineTo(E.W * 2, GY - 110); g.lineTo(-E.W, GY - 100); g.fill(); seg(g, [[-E.W, GY - 170], [E.W * 2, GY - 170]], 6, '#6a6a72');
    const R = rng(3); for (let i = 0; i < 40; i++) { const x = -200 + R() * (E.W + 400), y = GY - 80 + R() * 400; g.fillStyle = alpha(R() < 0.5 ? '#3a2a1e' : '#120c08', 0.6); g.beginPath(); g.ellipse(x, y, 40 + R() * 90, 8 + R() * 10, 0, 0, 7); g.fill(); }
    for (const [px, py, rx] of [[pos.puddleX, pos.puddleY, 220], [CX + 700, GY + 260, 160], [CX - 1000, GY + 60, 140]]) { g.fillStyle = linGrad(g, 0, py - 20, 0, py + 20, ['#1a2238', '#0e1424']); g.beginPath(); g.ellipse(px, py, rx, 26, 0, 0, 7); g.fill(); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(P.sodium, 0.18); g.beginPath(); g.ellipse(px + rx * 0.2, py - 4, rx * 0.35, 6, 0, 0, 7); g.fill(); g.fillStyle = alpha('#c8d4ff', 0.12); g.beginPath(); g.ellipse(px - rx * 0.3, py + 4, rx * 0.2, 4, 0, 0, 7); g.fill(); g.restore(); }
    for (let i = 0; i < 2; i++) { g.strokeStyle = alpha('#120c08', 0.6); g.lineWidth = 18; g.beginPath(); g.moveTo(-E.W, GY + 90 + i * 70); g.quadraticCurveTo(CX, GY + 40 + i * 90, E.W * 2, GY + 140 + i * 50); g.stroke(); }   // tyre ruts
  });
  layer(g, cam, 1, (g) => {
    streetlight(g, pos.lampX, GY - 140, 660, { t, wet: 0.6 });
    if (o.truck !== false) pumpkinTruck(g, pos.truckX, pos.truckY - (o.out ?? 0) * 110, TS, { t, sink: o.sink ?? 1, lift: o.lift ?? 0, spin: o.spin ?? 0, out: o.out ?? 0 });
    if ((o.sink ?? 1) > 0 && !(o.out > 0.5)) { g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(pos.wheelX, pos.truckY + 4, 120, 22, 0, 0, 7); g.fill(); const R = rng(8); for (let i = 0; i < 14; i++) circle(g, pos.wheelX + (R() - 0.5) * 260, pos.truckY - R() * 16, 6 + R() * 10, alpha('#4a3220', 0.9)); }
    const pk = clamp(o.planks ?? 0); if (pk > 0) { g.save(); g.globalAlpha *= pk; plank(g, pos.plankX, GY + 120, 420, { rot: 0.02 }); plank(g, pos.plankX + 30, GY + 150, 420, { rot: -0.03 }); g.restore(); }
    if ((o.gravel ?? 0) > 0) gravelPile(g, pos.wheelX + 60, pos.truckY + 10, 1, { k: o.gravel });
    if ((o.sand ?? 0) > 0) sandPour(g, t, pos.wheelX + 220, pos.truckY + 16, 1, { k: o.sand });
  });
  return { pos, rim: { color: P.sodium, dir: [0.7, -0.6], far: P.violet }, light: P.sodium };
}

// =====================================================================================================
// FOREGROUND + ATMOSPHERE
// =====================================================================================================
export function town5Fg(g, t, cam, o = {}) {
  const view = o.view || 'kitchen', GY = town5Ground(view);
  if (view === 'kitchen') { blurLayer(g, 7, (g) => { rr(g, -120, GY - 260, 340, 640, 20); g.fillStyle = '#5a3a24'; g.fill(); rr(g, E.W - 200, GY - 120, 360, 400, 20); g.fill(); }, cam, 1.4); FX.dust(g, t * 0.5, { count: 30, color: '#fff0d0', a: 0.3, seed: 3 }); }
  else if (view === 'living') { blurLayer(g, 7, (g) => { g.fillStyle = '#2a4a2a'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(E.W - 120 + i * 18, GY + 60 - i * 70, 40, 120, 0.4 - i * 0.12, 0, 7); g.fill(); } rr(g, E.W - 170, GY + 40, 220, 300, 30); g.fillStyle = '#a85a3a'; g.fill(); }, cam, 1.4); FX.dust(g, t * 0.3, { count: 16, color: '#ffe0b0', a: 0.22, seed: 5 }); }
  else if (view === 'drive') { blurLayer(g, 7, (g) => { g.fillStyle = '#3a6a3a'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(-60 + i * 30, GY + 200 - i * 40, 60, 140, 0.3, 0, 7); g.fill(); } }, cam, 1.45); }
  else {                                                                                                  // night: ground mist + breath-cold air motes + a dark fg branch
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const y = GY - 40 + i * 30, x = ((t * (8 + i * 3) + i * 400) % (E.W + 800)) - 400; g.fillStyle = radGrad(g, x, y, 0, 600, [alpha('#8a9ac8', 0.07), alpha('#8a9ac8', 0)]); g.beginPath(); g.ellipse(x, y, 700, 70, 0, 0, 7); g.fill(); } g.restore();
    FX.dust(g, t * 0.35, { count: 40, color: '#ffd8a8', a: 0.22, seed: 11 });
    blurLayer(g, 8, (g) => { g.fillStyle = '#06080e'; g.beginPath(); g.moveTo(E.W + 40, -40); g.quadraticCurveTo(E.W - 300, 80, E.W - 520, 40); g.lineTo(E.W - 520, 70); g.quadraticCurveTo(E.W - 300, 120, E.W + 40, 40); g.fill(); for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(E.W - 80 - i * 50, 60 + Math.sin(i) * 30, 34, 14, i, 0, 7); g.fill(); } }, cam, 1.5);
  }
}
