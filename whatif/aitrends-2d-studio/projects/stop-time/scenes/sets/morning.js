// sets/morning.js — I.Awaken "What If You Could Freeze Time for 10 Seconds?": the family HOME sets (classic What If style, 16:9).
// A fresh kitchen layout for the breakfast snaps (Tuesday + Wednesday), the evening watch beat (oven clock), Mina's end of the table
// with her school project, the hallway / living room in the evening, and a door for the "you couldn't open a door" gag.
//
//   const M = morning(g, t, cam, { view, mood: 'morning'|'day'|'evening', ...view opts })   BEFORE characters
//   morningFg(g, t, cam, { view, mood })   blurred foreground (chair back / plant / banister) + light motes, AFTER characters
//   Returns { GY, CX, M, rim, light, pos, view }.  Scale: figures s 1.9 = 1.75 m (1 m = 260 units), GY = E.H * 0.8.
//
//   view 'kitchen'  wide: a big window over the sink (low sun + light shafts in the morning, dusk + street lamp in the evening), sage
//                   cabinets, a tiled splash, kettle + toaster, the FRIDGE (magnets, Mina's drawing), the OVEN with its digital clock,
//                   an empty wall-clock hook (H2's kitchen clock goes there), a pendant lamp, the breakfast TABLE + 3 chairs.
//                   opts { breakfast: true (cereal box, two bowls, toast rack), juice: true (Mina's glass), jug: true (milk jug),
//                   butter: true, ovenTime: '07:42' | null (blank), steam: 0..1 }
//                   pos { tableX, tableTop, tableL, tableR, minaSeatX, heroSeatX, juiceX, juiceY, jugX, jugY, butterX, butterY, bowlX,
//                   bowlY, fridgeX, fridgeTop, ovenX, ovenClockX, ovenClockY, clockX, clockY (wall clock centre), windowX, windowY,
//                   sinkX, counterTop, floorY }
//   view 'table'    close on Mina's end of the table (low camera): the tabletop edge, her chair, a placemat, crayons and a pencil pot,
//                   the PROJECT SPOT (pos.projectX/projectY: H2 draws the project there; opts.project: true draws a simple stand-in
//                   board), the milk jug's spot, the mixing bowl on the counter behind. opts { jug, bowl: 'counter'|'table'|false, project }
//                   pos { tableTop, edgeX, projectX, projectY, jugX, jugY, bowlX, bowlY, chairX }
//   view 'hall'     the hallway / living room in the evening: front door with frosted glass, coat hooks with the family's coats, a shoe rack
//                   (mismatched socks drying on the radiator), a mirror, family photos, a floor lamp, a sofa corner and rug, the stairs, the
//                   lit kitchen doorway (warm). opts { door: 0..1 open, lamp: 0..1 }
//                   pos { doorX, doorTop, mirrorX, mirrorY, lampX, sofaX, stairsX, kitchenDoorX, radiatorX }
//   view 'door'     close on an interior door (the doorway gag): the handle, the frame, light under it; opts { open: 0..1, push: 0..1 (the
//                   door bows a hair as if leaned on, nothing moves) }   pos { doorX, handleX, handleY, gapY }
// Props usable alone: juiceGlass(g, x, y, s, { level, tilt }), milkJug(g, x, y, s, { tilt }), butterDish(g, x, y, s), cerealBowl(g, x, y, s),
//   cerealBox(g, x, y, s), toastRack(g, x, y, s), ovenClock(g, x, y, s, str, { on }), wallClockHook(g, x, y), mixingBowl(g, x, y, s)
// Deterministic (t, rng). Nothing here is a time-power prop: the power is only ever the hero's finger snap (H1's freeze.js).
import { E, V, mood, layer, veil, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const morningGround = () => E.H * V(0.8, 0.68);
const MOODS = {
  morning: { m: 'golden', L: 0.95, sun: '#ffd28a', sky: ['#9ec4ea', '#f6dcb8', '#ffd0a0'], rim: { color: '#ffd8a0', dir: [-0.8, -0.4] } },
  day:     { m: 'day',    L: 1,    sun: '#fff4dc', sky: ['#6fb0ec', '#bfe0f8', '#e8f4fb'], rim: { color: '#fff1d6', dir: [-0.8, -0.5] } },
  evening: { m: 'dusk',   L: 0.62, sun: '#ff9a6a', sky: ['#2a2a5a', '#7a5a8a', '#f09a6a'], rim: { color: '#ffc98a', dir: [0.7, -0.5] } },
};
const WALL = '#f0dcc0', SAGE = '#7fa088', WOOD = '#b07a4a', WOODD = '#7a5030', TILE = '#f6f0e4', INK = '#1a1622';
const box = (g, x, y, w, h, col, r = 6, o = {}) => { rr(g, x, y, w, h, r); g.fillStyle = linGrad(g, 0, y, 0, y + h, [shade(col, o.top ?? 0.08), col, shade(col, o.bot ?? -0.2)]); g.fill(); if (o.line !== false) { g.strokeStyle = alpha(shade(col, -0.55), 0.55); g.lineWidth = 2.5; g.stroke(); } };

// =====================================================================================================
export function morning(g, t, cam, o = {}) {
  const view = o.view || 'kitchen', md = MOODS[o.mood] ? o.mood : 'morning', Md = MOODS[md], M = { ...mood(Md.m) }, GY = morningGround(), CX = E.W / 2;
  const B = { GY, CX, md, Md, M, evening: md === 'evening' }, after = [];
  const pos = ({ kitchen, table, hall, door }[view] || kitchen)(g, t, cam, o, B, after);
  if (Md.L < 1) veil(g, B.evening ? '#120a24' : '#2a1a10', (1 - Md.L) * 0.55);
  layer(g, cam, 1, (g) => after.forEach(fn => fn(g)));                                  // practicals glow AFTER the mood veil
  return { GY, CX, M, rim: Md.rim, light: Md.sun, pos, view };
}

// ---------- shared pieces ----------
function wallAndFloor(g, cam, B, o) {
  const { GY } = B;
  layer(g, cam, 0.55, (g) => { const top = GY - 1100; g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(o.wall, 0.05), o.wall, shade(o.wall, -0.22)]); g.fillRect(-E.W, top - 400, E.W * 3.2, GY - top + 406); o.wallFn?.(g); g.fillStyle = shade(o.wall, -0.5); g.fillRect(-E.W, GY - 14, E.W * 3.2, 16); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(o.floor, -0.02), shade(o.floor, -0.45)]); g.fillRect(-E.W, GY, E.W * 3.2, E.H * 2); o.floorFn?.(g); });
}
function windowView(g, t, x, y, w, h, B) {   // sky + rooftops + a tree, per mood, inside a window rect
  const { Md, evening } = B; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = linGrad(g, 0, y, 0, y + h, Md.sky); g.fillRect(x, y, w, h);
  if (B.md === 'morning') { glow(g, x + w * 0.25, y + h * 0.82, w * 0.8, '#ffc070', 0.6); circle(g, x + w * 0.25, y + h * 0.84, 30, '#fff4d8'); }
  else if (B.md === 'day') { FX.clouds(g, { y: y + h * 0.2, count: 3, h: 40, a: 0.5, seed: 4 }); }
  else { FX.stars(g, t * 0.2, { area: [x, y, w, h * 0.4], count: 14, seed: 6 }); glow(g, x + w * 0.7, y + h * 0.95, w * 0.7, '#ff9a6a', 0.45); }
  const R = rng(5); g.fillStyle = mix(Md.sky[1], '#2a2030', evening ? 0.75 : 0.45); for (let i = 0; i < 6; i++) { const rx = x - 20 + i * (w / 5), rh = 40 + R() * 50; g.beginPath(); g.moveTo(rx, y + h); g.lineTo(rx, y + h - rh); g.lineTo(rx + w / 10, y + h - rh - 30); g.lineTo(rx + w / 5, y + h - rh); g.lineTo(rx + w / 5, y + h); g.fill(); if (evening && R() < 0.6) { g.fillStyle = '#ffd98a'; g.fillRect(rx + 16, y + h - rh + 10, 10, 10); g.fillStyle = mix(Md.sky[1], '#2a2030', 0.75); } }
  g.fillStyle = mix('#4f8a55', '#1a2a20', evening ? 0.6 : 0.1); for (const [cx, cy, r] of [[x + w * 0.85, y + h * 0.55, 60], [x + w * 0.95, y + h * 0.4, 50], [x + w * 0.75, y + h * 0.42, 40]]) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); }
  g.restore();
  g.strokeStyle = '#f8f4ec'; g.lineWidth = 18; g.strokeRect(x, y, w, h); seg(g, [[x + w / 2, y], [x + w / 2, y + h]], 10, '#f8f4ec'); seg(g, [[x, y + h * 0.45], [x + w, y + h * 0.45]], 8, '#f8f4ec');
}
// ---------- props ----------
export function juiceGlass(g, x, y, s = 1, o = {}) { const lv = clamp(o.level ?? 0.8); g.save(); g.translate(x, y); g.rotate(o.tilt ?? 0); g.scale(s, s);
  g.beginPath(); g.moveTo(-26, -86); g.lineTo(26, -86); g.lineTo(21, 0); g.lineTo(-21, 0); g.closePath(); g.fillStyle = alpha('#e8f4ff', 0.35); g.fill();
  g.save(); g.clip(); g.fillStyle = linGrad(g, 0, -86 * lv, 0, 0, ['#ffb43a', '#f08a1a']); g.fillRect(-30, -86 * lv, 60, 90); g.restore();
  g.strokeStyle = alpha('#ffffff', 0.85); g.lineWidth = 3; g.beginPath(); g.moveTo(-26, -86); g.lineTo(26, -86); g.lineTo(21, 0); g.lineTo(-21, 0); g.closePath(); g.stroke(); g.fillStyle = alpha('#fff', 0.5); g.fillRect(-18, -78, 5, 64); g.restore(); }
export function milkJug(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.rotate(o.tilt ?? 0); g.scale(s, s);
  g.beginPath(); g.moveTo(-40, 0); g.quadraticCurveTo(-50, -60, -34, -110); g.lineTo(30, -110); g.lineTo(46, -124); g.lineTo(40, -100); g.quadraticCurveTo(50, -60, 40, 0); g.closePath(); g.fillStyle = linGrad(g, -40, 0, 40, 0, ['#ffffff', '#dfe6ee']); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#2f6fd0'; g.fillRect(-42, -58, 86, 14); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(-48, -64, 22, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.restore(); }
export function butterDish(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#f4f2ee'; g.beginPath(); g.ellipse(0, 0, 70, 14, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke(); box(g, -40, -34, 80, 32, '#f6e27a', 4); g.fillStyle = alpha('#fff', 0.5); g.fillRect(-34, -30, 40, 6); g.restore(); }
export function cerealBowl(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 3, 76, 10, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-72, -44); g.quadraticCurveTo(-66, 0, 0, 0); g.quadraticCurveTo(66, 0, 72, -44); g.closePath(); g.fillStyle = linGrad(g, -72, 0, 72, 0, ['#e85a4a', '#c8402e']); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke(); g.fillStyle = '#fbf6ea'; g.beginPath(); g.ellipse(0, -44, 72, 13, 0, 0, 7); g.fill(); for (let i = 0; i < 10; i++) circle(g, -54 + (i * 37) % 108, -45 + (i % 3) * 3, 6, i % 2 ? '#e2a64a' : '#c98a32'); g.restore(); }
export function cerealBox(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.04); box(g, -50, -170, 100, 170, '#3a8acc', 5); g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(-4, -84, 32, 0, 7); g.fill(); for (let i = 0; i < 6; i++) circle(g, -4 + Math.cos(i) * 18, -84 + Math.sin(i * 1.7) * 14, 7, '#e2a64a'); text(g, 'CRUNCH', -4, -140, { size: 22, color: '#fff', font: FONTS.title, weight: 700 }); g.fillStyle = shade('#3a8acc', -0.3); g.fillRect(34, -170, 16, 170); g.restore(); }
export function toastRack(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 3; i++) { g.save(); g.translate(-30 + i * 30, -6); g.rotate(-0.06 + i * 0.05); rr(g, -12, -62, 24, 62, 8); g.fillStyle = '#e8b870'; g.fill(); g.strokeStyle = '#a87a3a'; g.lineWidth = 2; g.stroke(); g.restore(); } seg(g, [[-50, 0], [50, 0]], 4, '#9aa0aa'); for (let i = 0; i < 4; i++) seg(g, [[-45 + i * 30, 0], [-45 + i * 30, -50]], 2.5, '#9aa0aa'); g.restore(); }
export function mixingBowl(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-110, -70); g.quadraticCurveTo(-100, 0, 0, 0); g.quadraticCurveTo(100, 0, 110, -70); g.closePath(); g.fillStyle = linGrad(g, -110, 0, 110, 0, ['#e8ecf0', '#9aa4b0']); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.fillStyle = '#5a6470'; g.beginPath(); g.ellipse(0, -70, 110, 18, 0, 0, 7); g.fill(); g.fillStyle = alpha('#fff', 0.6); g.beginPath(); g.ellipse(-60, -40, 8, 22, -0.4, 0, 7); g.fill(); g.restore(); }
export function ovenClock(g, x, y, s = 1, str = '07:42', o = {}) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -70, -26, 140, 52, 8); g.fillStyle = '#0c0e12'; g.fill(); if ((o.on ?? 1) > 0 && str) { text(g, str, 0, 2, { size: 38, color: '#5fe08a', font: FONTS.ui, weight: 900, spacing: 3, glow: 10, glowColor: alpha('#5fe08a', 0.6) }); } g.restore(); }
export function wallClockHook(g, x, y) { circle(g, x, y - 130, 5, '#5a5050'); g.fillStyle = alpha('#000', 0.08); g.beginPath(); g.arc(x, y, 112, 0, 7); g.fill(); }   // a faint mark where H2's kitchen clock hangs

// =====================================================================================================
// KITCHEN
// =====================================================================================================
function kitchen(g, t, cam, o, B, after) {
  const { GY, CX, Md, evening } = B;
  const pos = { windowX: CX - 330, windowY: GY - 760, sinkX: CX - 330, counterTop: GY - 320, fridgeX: CX + 760, fridgeTop: GY - 700, ovenX: CX - 720, clockX: CX + 260, clockY: GY - 780, tableX: CX + 40, tableTop: GY - 240, floorY: GY };
  pos.tableL = pos.tableX - 380; pos.tableR = pos.tableX + 380; pos.minaSeatX = pos.tableX - 300; pos.heroSeatX = pos.tableX + 300;
  pos.juiceX = pos.tableX - 210; pos.juiceY = pos.tableTop - 14; pos.jugX = pos.tableX + 60; pos.jugY = pos.tableTop - 14; pos.butterX = pos.tableX + 210; pos.butterY = pos.tableTop - 12; pos.bowlX = pos.tableX - 60; pos.bowlY = pos.tableTop - 12;
  pos.ovenClockX = pos.ovenX; pos.ovenClockY = pos.counterTop + 60;
  wallAndFloor(g, cam, B, { wall: WALL, floor: '#a0704c',
    wallFn: (g) => {
      const wx = pos.windowX - 260, wy = pos.windowY, ww = 520, wh = 380; windowView(g, t, wx, wy, ww, wh, B);
      box(g, wx - 30, wy + wh, ww + 60, 22, '#f8f4ec', 3); for (let i = 0; i < 3; i++) { rr(g, wx + 30 + i * 60, wy + wh - 50, 40, 50, 8); g.fillStyle = ['#c8704a', '#e8c46a', '#7aa0c8'][i]; g.fill(); circle(g, wx + 50 + i * 60, wy + wh - 70, 22, '#5a9a4a'); }   // herbs on the sill
      // tiled splash + upper cabinets either side of the window
      g.fillStyle = TILE; g.fillRect(pos.ovenX - 260, pos.counterTop - 230, pos.sinkX + 560 - (pos.ovenX - 260), 230);
      g.strokeStyle = alpha('#c8b898', 0.6); g.lineWidth = 1.5; for (let x = pos.ovenX - 260; x < pos.sinkX + 300; x += 46) for (let y = pos.counterTop - 230; y < pos.counterTop; y += 46) { g.strokeRect(x, y, 46, 46); }
      for (const cx of [pos.ovenX - 230, pos.ovenX - 30, pos.sinkX + 300]) { box(g, cx, GY - 1060, 190, 290, SAGE, 8); rr(g, cx + 16, GY - 1046, 158, 262, 6); g.strokeStyle = alpha(shade(SAGE, -0.35), 0.6); g.lineWidth = 3; g.stroke(); rr(g, cx + 150, GY - 840, 10, 46, 5); g.fillStyle = '#e8e0cc'; g.fill(); }
      wallClockHook(g, pos.clockX, pos.clockY);
      // a calendar + Mina's drawing on the wall
      box(g, CX + 440, GY - 820, 150, 190, '#fffbea', 3); g.fillStyle = '#d4262e'; g.fillRect(CX + 440, GY - 820, 150, 34); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { g.strokeStyle = alpha(INK, 0.3); g.lineWidth = 1; g.strokeRect(CX + 450 + c * 26, GY - 776 + r * 30, 26, 30); }
      // pendant lamp over the table
      seg(g, [[pos.tableX, GY - 1200], [pos.tableX, GY - 760]], 4, '#2a2230'); g.fillStyle = linGrad(g, pos.tableX - 110, 0, pos.tableX + 110, 0, ['#2a5a5a', '#4a8a84', '#2a5a5a']); g.beginPath(); g.moveTo(pos.tableX - 110, GY - 680); g.quadraticCurveTo(pos.tableX, GY - 800, pos.tableX + 110, GY - 680); g.closePath(); g.fill(); g.fillStyle = evening ? '#fff2c8' : '#e8e0c8'; g.beginPath(); g.ellipse(pos.tableX, GY - 680, 100, 12, 0, 0, 7); g.fill();
    },
    floorFn: (g) => { g.strokeStyle = alpha('#000', 0.18); g.lineWidth = 2; for (let x = -E.W; x < E.W * 2.2; x += 120) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x - (x - CX) * 0.45, GY + 420); g.stroke(); } for (let y = GY + 40, k = 1; y < GY + 500; y += 36 * k, k *= 1.35) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2.2, y); g.stroke(); }
      if (!evening) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(Md.sun, 0.16); g.beginPath(); g.moveTo(pos.windowX - 200, GY); g.lineTo(pos.windowX + 200, GY); g.lineTo(pos.windowX + 560, GY + 380); g.lineTo(pos.windowX + 40, GY + 380); g.closePath(); g.fill(); g.restore(); } } });
  layer(g, cam, 1, (g) => {
    // counter run (left): oven with its clock, sink under the window, kettle, toaster
    const cl = pos.ovenX - 260, cr = pos.sinkX + 300, ct = pos.counterTop;
    box(g, cl, ct, cr - cl, GY - ct, shade(SAGE, -0.06), 4); box(g, cl - 10, ct - 18, cr - cl + 20, 22, '#e8e2d6', 3, { top: 0.2 });
    for (let x = cl + 10; x < cr - 80; x += 190) { rr(g, x, ct + 26, 176, GY - ct - 46, 6); g.strokeStyle = alpha('#000', 0.22); g.lineWidth = 3; g.stroke(); rr(g, x + 140, ct + 50, 10, 46, 5); g.fillStyle = '#e8e0cc'; g.fill(); }
    const ox = pos.ovenX; box(g, ox - 140, ct + 10, 280, GY - ct - 20, '#2a2e36', 8); rr(g, ox - 110, ct + 120, 220, 160, 10); g.fillStyle = '#121418'; g.fill(); g.fillStyle = alpha('#ffffff', 0.08); g.fillRect(ox - 100, ct + 130, 60, 140); seg(g, [[ox - 90, ct + 104], [ox + 90, ct + 104]], 10, '#9aa0aa');
    for (let i = 0; i < 4; i++) circle(g, ox - 90 + i * 60, ct + 30, 10, '#5a5e68');
    ovenClock(g, pos.ovenClockX, pos.ovenClockY, 1, o.ovenTime === undefined ? (evening ? '18:07' : B.md === 'day' ? '12:30' : '07:42') : o.ovenTime);
    rr(g, pos.sinkX - 120, ct - 10, 240, 14, 6); g.fillStyle = '#9aa4b0'; g.fill(); seg(g, [[pos.sinkX, ct - 10], [pos.sinkX, ct - 90], [pos.sinkX + 50, ct - 90], [pos.sinkX + 50, ct - 70]], 8, '#c8ccd4');
    const kx = cl + 120; rr(g, kx - 46, ct - 110, 92, 92, 26); g.fillStyle = linGrad(g, kx - 46, 0, kx + 46, 0, ['#e85a4a', '#a8302a']); g.fill(); rr(g, kx - 28, ct - 128, 56, 20, 8); g.fillStyle = '#2a2230'; g.fill();
    const st = clamp(o.steam ?? (B.md === 'morning' ? 0.6 : 0)); if (st > 0) for (let i = 0; i < 4; i++) { const u = (t * 0.5 + i / 4) % 1; circle(g, kx + 50 + u * 20, ct - 120 - u * 100, 10 + u * 18, alpha('#ffffff', 0.28 * (1 - u) * st)); }
    box(g, pos.sinkX + 150, ct - 76, 130, 58, '#c8ccd4', 14);
    // fridge
    const fx = pos.fridgeX, ft = pos.fridgeTop; box(g, fx - 160, ft, 320, GY - ft, '#e8ecf0', 18, { top: 0.04, bot: -0.12 }); seg(g, [[fx - 160, ft + 240], [fx + 160, ft + 240]], 4, '#a8aeb8'); rr(g, fx - 136, ft + 120, 12, 100, 6); g.fillStyle = '#a8aeb8'; g.fill(); rr(g, fx - 136, ft + 300, 12, 160, 6); g.fill();
    g.save(); g.translate(fx + 20, ft + 380); g.rotate(-0.05); g.fillStyle = '#fff'; g.fillRect(-70, -60, 140, 120); circle(g, -26, -16, 22, '#f2c230'); seg(g, [[-50, 40], [50, 40]], 6, '#3a9a4a'); poly(g, [[10, 20], [40, -30], [60, 20]], '#7a5ad6'); g.restore(); circle(g, fx + 20, ft + 316, 9, '#d4262e');
    for (const [mx, my, c] of [[fx - 60, ft + 80, '#2f6fd0'], [fx + 70, ft + 140, '#3aa655'], [fx - 40, ft + 520, '#f2c230']]) circle(g, mx, my, 12, c);
    // table + chairs + breakfast
    const tx = pos.tableX, tt = pos.tableTop; g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(tx, GY + 8, 420, 24, 0, 0, 7); g.fill();
    FX.chair(g, pos.tableL - 60, GY, 1.6, '#6a4630'); FX.chair(g, pos.tableR + 70, GY, 1.6, '#6a4630');
    for (const lx of [tx - 340, tx + 340]) { rr(g, lx - 14, tt, 28, GY - tt, 6); g.fillStyle = linGrad(g, lx - 14, 0, lx + 14, 0, [WOODD, shade(WOODD, -0.3)]); g.fill(); }
    box(g, tx - 400, tt - 24, 800, 30, WOOD, 8, { top: 0.2 }); g.fillStyle = shade(WOODD, -0.15); g.fillRect(tx - 392, tt + 6, 784, 14);
    g.fillStyle = '#f4ecdc'; g.beginPath(); g.ellipse(tx - 220, tt - 20, 130, 10, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(tx + 220, tt - 20, 130, 10, 0, 0, 7); g.fill();   // placemats
    if (o.breakfast !== false) { cerealBox(g, tx - 20, tt - 18, 0.9); cerealBowl(g, pos.tableX - 250, tt - 14, 0.9); cerealBowl(g, pos.tableX + 260, tt - 14, 0.9); toastRack(g, tx + 120, tt - 14, 0.9); }
    if (o.juice !== false) juiceGlass(g, pos.juiceX, pos.juiceY, 1);
    if (o.jug !== false) milkJug(g, pos.jugX + 30, pos.jugY, 0.9);
    if (o.butter !== false) butterDish(g, pos.butterX + 40, pos.butterY, 0.9);
  });
  after.push((g) => {
    if (evening) { glow(g, pos.tableX, GY - 640, 620, '#ffd9a0', 0.42); FX.pool(g, pos.tableX, pos.tableTop, 460, 60, '#ffd9a0', 0.3); glow(g, pos.ovenClockX, pos.ovenClockY, 120, '#5fe08a', 0.2); }
    else { FX.godRays(g, pos.windowX, pos.windowY + 160, { count: 5, spread: 0.45, len: 1300, color: Md.sun, a: B.md === 'morning' ? 0.07 : 0.04, angle: 1.0, t }); glow(g, pos.windowX, pos.windowY + 200, 700, Md.sun, B.md === 'morning' ? 0.14 : 0.08); }
  });
  return pos;
}

// =====================================================================================================
// TABLE (Mina's end, low camera)
// =====================================================================================================
function table(g, t, cam, o, B, after) {
  const { GY, CX, Md, evening } = B, tt = GY - 300;
  const pos = { tableTop: tt, edgeX: CX + 640, projectX: CX - 80, projectY: tt - 16, jugX: CX + 420, jugY: tt - 14, bowlX: CX - 640, bowlY: GY - 520, chairX: CX - 560 };
  wallAndFloor(g, cam, B, { wall: WALL, floor: '#a0704c',
    wallFn: (g) => {
      windowView(g, t, CX + 160, GY - 900, 560, 380, B); box(g, CX + 130, GY - 520, 620, 22, '#f8f4ec', 3);
      g.fillStyle = TILE; g.fillRect(-E.W, GY - 640, CX + E.W - 60, 200); g.strokeStyle = alpha('#c8b898', 0.6); g.lineWidth = 1.5; for (let x = -E.W; x < CX - 60; x += 46) for (let y = GY - 640; y < GY - 440; y += 46) g.strokeRect(x, y, 46, 46);
      box(g, -E.W, GY - 440, CX + E.W - 60, 26, '#e8e2d6', 3, { top: 0.2 });                                                         // the counter behind
      for (let i = 0; i < 3; i++) { rr(g, 120 + i * 90, GY - 530, 60, 90, 10); g.fillStyle = ['#e8c46a', '#c8704a', '#f4f0e8'][i]; g.fill(); }   // jars
    } });
  layer(g, cam, 0.92, (g) => { if (o.bowl !== false && o.bowl !== 'table') mixingBowl(g, pos.bowlX, GY - 440, 1.1); });
  layer(g, cam, 1, (g) => {
    for (const lx of [pos.edgeX - 60, pos.edgeX - 900]) { rr(g, lx - 20, tt, 40, GY - tt + 40, 6); g.fillStyle = linGrad(g, lx - 20, 0, lx + 20, 0, [WOODD, shade(WOODD, -0.3)]); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(pos.edgeX - 480, GY + 44, 560, 26, 0, 0, 7); g.fill();
    FX.chair(g, pos.chairX, GY + 60, 2.2, '#6a4630');
    box(g, -E.W, tt - 30, pos.edgeX + E.W, 40, WOOD, 10, { top: 0.25 }); g.fillStyle = linGrad(g, 0, tt + 10, 0, tt + 60, [shade(WOODD, -0.1), alpha(WOODD, 0)]); g.fillRect(-E.W, tt + 10, pos.edgeX + E.W, 50);
    for (let i = 0; i < 6; i++) seg(g, [[-200 + i * 220, tt - 22], [-60 + i * 220, tt - 22]], 1.5, alpha('#5a3a20', 0.35));
    g.fillStyle = '#d8e8f4'; g.beginPath(); g.ellipse(CX - 80, tt - 26, 360, 22, 0, 0, 7); g.fill();                                     // a placemat under the project
    rr(g, CX + 230, tt - 110, 70, 90, 10); g.fillStyle = '#e85a4a'; g.fill(); for (let i = 0; i < 5; i++) seg(g, [[CX + 245 + i * 10, tt - 110], [CX + 240 + i * 12, tt - 160 - (i % 2) * 14]], 8, ['#f2c230', '#2f6fd0', '#3aa655', '#7a5ad6', '#e8e8e8'][i]);   // pencil pot
    for (let i = 0; i < 4; i++) { g.save(); g.translate(CX + 340 + i * 26, tt - 34); g.rotate(-0.3 + i * 0.2); rr(g, -40, -6, 80, 12, 6); g.fillStyle = ['#d4262e', '#2f6fd0', '#f2c230', '#3aa655'][i]; g.fill(); g.restore(); }
    if (o.project) { const px = pos.projectX, py = pos.projectY; box(g, px - 220, py - 300, 440, 300, '#2a3a6a', 6); circle(g, px - 120, py - 160, 46, '#f2c230'); for (let i = 0; i < 4; i++) { ring(g, px - 120, py - 160, 80 + i * 40, 2, alpha('#ffffff', 0.4)); circle(g, px - 120 + 80 + i * 40, py - 160 - i * 6, 12 + (i % 2) * 6, ['#c8a070', '#3a8acc', '#e85a4a', '#e8b870'][i]); } }
    if (o.jug !== false) milkJug(g, pos.jugX, pos.jugY, 1.2);
    if (o.bowl === 'table') mixingBowl(g, pos.jugX - 30, pos.jugY + 8, 1);
  });
  after.push((g) => { if (evening) glow(g, CX, GY - 700, 700, '#ffd9a0', 0.35); else { FX.godRays(g, CX + 440, GY - 700, { count: 4, spread: 0.4, len: 1100, color: Md.sun, a: 0.06, angle: 2.1, t }); glow(g, CX + 440, GY - 700, 600, Md.sun, 0.12); } });
  return pos;
}

// =====================================================================================================
// HALL / LIVING ROOM (evening)
// =====================================================================================================
function hall(g, t, cam, o, B, after) {
  const { GY, CX, evening } = B, lamp = clamp(o.lamp ?? 1);
  const pos = { doorX: CX - 720, doorTop: GY - 760, mirrorX: CX - 280, mirrorY: GY - 640, lampX: CX + 820, sofaX: CX + 560, stairsX: CX + 120, kitchenDoorX: CX - 20, radiatorX: CX - 300 };
  wallAndFloor(g, cam, B, { wall: '#d8c8b0', floor: '#8a6a52',
    wallFn: (g) => {
      // dado rail + panelling
      g.fillStyle = shade('#d8c8b0', -0.1); g.fillRect(-E.W, GY - 360, E.W * 3.2, 346); seg(g, [[-E.W, GY - 360], [E.W * 2.2, GY - 360]], 10, '#efe2cc');
      // front door with frosted glass + coat hooks
      const dx = pos.doorX, open = clamp(o.door ?? 0); box(g, dx - 170, pos.doorTop, 340, GY - pos.doorTop, '#2f5a8a', 6); rr(g, dx - 110, pos.doorTop + 60, 220, 220, 6); g.fillStyle = mix('#e8f0f8', '#3a3a6a', evening ? 0.6 : 0.1); g.fill(); circle(g, dx + 130, GY - 380, 12, '#d8c060');
      if (open > 0) { g.fillStyle = mix('#1a1a3a', '#e8f0f8', evening ? 0 : 0.6); g.fillRect(dx - 170, pos.doorTop, 340 * open, GY - pos.doorTop); }
      seg(g, [[dx + 230, GY - 680], [dx + 470, GY - 680]], 8, '#6a4a30'); for (let i = 0; i < 4; i++) { const hx = dx + 260 + i * 60; circle(g, hx, GY - 670, 7, '#c8a040'); g.fillStyle = ['#3a5a8a', '#d4262e', '#5a6a3a', '#e8c46a'][i]; g.beginPath(); g.moveTo(hx - 34, GY - 660); g.lineTo(hx + 34, GY - 660); g.lineTo(hx + 40, GY - 440); g.lineTo(hx - 40, GY - 440); g.closePath(); g.fill(); }   // coats
      // mirror + family photos
      rr(g, pos.mirrorX - 90, pos.mirrorY - 130, 180, 260, 90); g.fillStyle = '#c8a040'; g.fill(); rr(g, pos.mirrorX - 76, pos.mirrorY - 116, 152, 232, 76); g.fillStyle = linGrad(g, 0, pos.mirrorY - 116, 0, pos.mirrorY + 116, ['#cfe0ec', '#8aa0b4']); g.fill();
      for (const [fx, fy, c] of [[CX - 60, GY - 760, '#7aa0c8'], [CX + 70, GY - 720, '#e8b870'], [CX - 20, GY - 620, '#8ac07a']]) { box(g, fx - 50, fy - 40, 100, 80, '#3a2e28', 3); g.fillStyle = c; g.fillRect(fx - 40, fy - 30, 80, 60); circle(g, fx - 10, fy - 4, 12, '#f6e8d0'); circle(g, fx + 16, fy - 2, 10, '#f6e8d0'); }
      // the lit kitchen doorway (warm)
      const kd = pos.kitchenDoorX + 260; rr(g, kd - 120, GY - 700, 240, 700, 4); g.fillStyle = mix('#ffe2a8', '#ffcf7a', 0.5); g.fill(); g.strokeStyle = '#efe2cc'; g.lineWidth = 16; g.stroke(); g.fillStyle = alpha('#c8a070', 0.5); g.fillRect(kd - 100, GY - 300, 200, 280);   // a peek of the kitchen table
      // stairs going up on the right
      for (let i = 0; i < 9; i++) box(g, pos.stairsX + 380 + i * 50, GY - 60 - i * 70, 300, 24, '#8a5a3a', 3);
      seg(g, [[pos.stairsX + 380, GY - 260], [pos.stairsX + 830, GY - 860]], 10, '#6a4630');
    },
    floorFn: (g) => { g.save(); g.beginPath(); g.moveTo(CX - 600, GY + 40); g.lineTo(CX + 700, GY + 40); g.lineTo(CX + 1000, GY + 280); g.lineTo(CX - 900, GY + 280); g.closePath(); g.fillStyle = linGrad(g, 0, GY + 40, 0, GY + 280, ['#3a6a7a', '#2a4a5a']); g.fill(); g.clip(); for (let i = -8; i < 16; i++) { g.strokeStyle = alpha('#e8c890', 0.3); g.lineWidth = 5; g.beginPath(); g.moveTo(CX - 600 + i * 120, GY + 40); g.lineTo(CX - 600 + i * 140 - 80, GY + 280); g.stroke(); } g.restore(); } });
  layer(g, cam, 1, (g) => {
    // radiator with mismatched socks drying
    const rx = pos.radiatorX; box(g, rx - 150, GY - 300, 300, 200, '#efeee8', 8); for (let i = 0; i < 9; i++) seg(g, [[rx - 130 + i * 32, GY - 290], [rx - 130 + i * 32, GY - 110]], 6, '#d8d6ce');
    for (const [sx, c] of [[rx - 60, '#3aa655'], [rx + 60, '#f2c230']]) { g.fillStyle = c; rr(g, sx - 20, GY - 320, 40, 110, 14); g.fill(); rr(g, sx - 20, GY - 230, 64, 34, 14); g.fill(); }
    // shoe rack by the door
    box(g, pos.doorX + 220, GY - 120, 280, 120, '#6a4630', 4); for (let i = 0; i < 4; i++) { rr(g, pos.doorX + 236 + i * 64, GY - 150, 56, 28, 10); g.fillStyle = ['#2a2a38', '#d4262e', '#f6f6f2', '#2f6fd0'][i]; g.fill(); }
    // sofa corner + floor lamp
    const sx = pos.sofaX; box(g, sx - 200, GY - 260, 420, 240, '#5a6a8a', 26); box(g, sx - 220, GY - 170, 100, 150, shade('#5a6a8a', 0.06), 24); box(g, sx - 140, GY - 140, 340, 70, shade('#5a6a8a', 0.1), 16); rr(g, sx - 60, GY - 230, 90, 80, 18); g.fillStyle = '#e8c46a'; g.fill();
    const lx = pos.lampX; seg(g, [[lx, GY], [lx, GY - 620]], 8, '#2a2a30'); circle(g, lx, GY - 4, 30, '#2a2a30'); g.fillStyle = linGrad(g, 0, GY - 760, 0, GY - 620, ['#f6e2b8', '#e8c890']); g.beginPath(); g.moveTo(lx - 70, GY - 760); g.lineTo(lx + 70, GY - 760); g.lineTo(lx + 110, GY - 620); g.lineTo(lx - 110, GY - 620); g.closePath(); g.fill();
  });
  after.push((g) => { if (lamp > 0) { glow(g, pos.lampX, GY - 690, 520, '#ffcf8a', 0.5 * lamp); FX.pool(g, pos.lampX, GY + 10, 320, 50, '#ffcf8a', 0.25 * lamp); } glow(g, pos.kitchenDoorX + 260, GY - 360, 520, '#ffd9a0', evening ? 0.4 : 0.2); FX.pool(g, pos.kitchenDoorX + 260, GY + 40, 300, 60, '#ffd9a0', 0.3); });
  return pos;
}

// =====================================================================================================
// DOOR (the "you couldn't open a door" gag)
// =====================================================================================================
function door(g, t, cam, o, B, after) {
  const { GY, CX, evening } = B, open = clamp(o.open ?? 0), push = clamp(o.push ?? 0);
  const pos = { doorX: CX + 40, handleX: CX + 230, handleY: GY - 460, gapY: GY };
  wallAndFloor(g, cam, B, { wall: WALL, floor: '#a0704c',
    wallFn: (g) => {
      const x0 = pos.doorX - 280, w = 560, top = GY - 1000; rr(g, x0 - 40, top - 40, w + 80, GY - top + 40, 6); g.fillStyle = '#f8f4ec'; g.fill(); g.strokeStyle = alpha('#000', 0.15); g.lineWidth = 3; g.stroke();
      g.fillStyle = mix('#ffe2a8', '#f6c27a', 0.4); g.fillRect(x0, top, w, GY - top);                                                        // the lit room beyond (only shows when open)
      const dw = w * (1 - open * 0.85), bow = push * 6;
      g.beginPath(); g.moveTo(x0, top); g.lineTo(x0 + dw, top); g.quadraticCurveTo(x0 + dw + bow, (top + GY) / 2, x0 + dw, GY); g.lineTo(x0, GY); g.closePath(); g.fillStyle = linGrad(g, x0, 0, x0 + dw, 0, ['#e8dcc8', '#d4c4a8']); g.fill(); g.strokeStyle = alpha('#000', 0.2); g.lineWidth = 3; g.stroke();
      rr(g, x0 + w + 140, GY - 520, 40, 70, 6); g.fillStyle = '#f4f2ee'; g.fill(); g.strokeStyle = alpha(INK, 0.4); g.lineWidth = 2; g.stroke(); rr(g, x0 + w + 152, GY - 500, 16, 30, 4); g.fillStyle = '#d8d6ce'; g.fill();
      for (const [fx, fy, c] of [[x0 - 260, GY - 700, '#7aa0c8'], [x0 - 180, GY - 520, '#e8b870']]) { box(g, fx - 70, fy - 55, 140, 110, '#3a2e28', 3); g.fillStyle = c; g.fillRect(fx - 58, fy - 43, 116, 86); circle(g, fx - 16, fy, 16, '#f6e8d0'); circle(g, fx + 20, fy + 4, 13, '#f6e8d0'); }
      box(g, x0 + w + 80, GY - 260, 240, 24, '#6a4630', 3); seg(g, [[x0 + w + 100, GY - 236], [x0 + w + 100, GY]], 8, '#6a4630'); seg(g, [[x0 + w + 300, GY - 236], [x0 + w + 300, GY]], 8, '#6a4630'); rr(g, x0 + w + 160, GY - 340, 80, 80, 12); g.fillStyle = '#c8704a'; g.fill(); for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#4f8a55' : '#6aa860'; g.beginPath(); g.ellipse(x0 + w + 200 + (i - 2) * 16, GY - 380 - (i % 2) * 20, 14, 40, (i - 2) * 0.3, 0, 7); g.fill(); }
      for (const [py, ph] of [[top + 60, 380], [top + 500, 380]]) { rr(g, x0 + 50, py, dw - 100, ph, 6); g.strokeStyle = alpha('#000', 0.15); g.lineWidth = 4; g.stroke(); }
      pos.handleX = x0 + dw - 60; circle(g, pos.handleX, pos.handleY + 16, 22, '#b8963e'); rr(g, pos.handleX - 70, pos.handleY, 80, 18, 9); g.fillStyle = '#d8b860'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    } });
  after.push((g) => { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, GY, 0, GY + 180, [alpha('#ffd9a0', evening ? 0.4 : 0.22), alpha('#ffd9a0', 0)]); g.fillRect(pos.doorX - 280, GY - 6, 560, 180); g.restore(); });
  return pos;
}

// =====================================================================================================
export function morningFg(g, t, cam, o = {}) {
  const view = o.view || 'kitchen', GY = morningGround(), evening = o.mood === 'evening';
  layer(g, cam, 1.4, (g) => {
    g.save(); g.filter = 'blur(9px)';
    if (view === 'kitchen') { rr(g, -140, GY - 300, 300, 640, 22); g.fillStyle = '#5a3a24'; g.fill(); for (let i = 0; i < 3; i++) { rr(g, -120, GY - 260 + i * 70, 260, 18, 9); g.fill(); } }
    else if (view === 'table') { g.fillStyle = '#4a7a3a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(E.W - 80 + i * 14, GY - 80 - i * 60, 46, 110, 0.4 - i * 0.12, 0, 7); g.fill(); } rr(g, E.W - 180, GY - 20, 240, 300, 30); g.fillStyle = '#c8704a'; g.fill(); }
    else if (view === 'hall') { for (let i = 0; i < 6; i++) { rr(g, E.W - 160 + i * 30, GY - 600 + i * 90, 14, 900, 6); g.fillStyle = '#5a3a24'; g.fill(); } rr(g, E.W - 200, GY - 640, 260, 28, 12); g.fill(); }
    g.restore();
  });
  FX.dust(g, t * 0.4, { count: evening ? 12 : 26, color: evening ? '#ffd9a0' : '#fff2d0', a: evening ? 0.18 : 0.28, seed: 5 });
}
