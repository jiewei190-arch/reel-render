// sets/store.js — the DARK SUPERMARKET ("What If You Were in a Zombie Apocalypse With Zero Experience?"), VERTICAL 9:16 (1080x1920).
// HORROR BAR: cold dark palette, ONE practical per view (moonlight through the front glass / the flashlight / the caged freezer bulb),
// grain + vignette from horror.js, fear from what you don't see. No gore, no zombies here (H2's zombies.js draws them on the glass).
//
//   const S = store(g, t, cam, { view, moon: 0..1, flicker: 0..1, shadow: 0..1, under: 0..1, frost: 0..1, strips: 0..1 (sway) })   // BEFORE characters
//   storeFg(g, t, cam, { view, flashlight: { x, y, ang, on: 0..1, len, spread } })   AFTER characters: blurred foreground, the flashlight
//       darkness mask (horror.js flashlight: everything outside the beam goes near-black; eyes/edges in the beam read), cold dust, vignette.
//       flashlight x,y,ang are SCREEN coords (put it at the hero's hand on screen); on 0 = no mask.
//   Returns { GY, CX, M, rim, pos, view }   rim = cold moon rim (front/aisle) or the icy bulb (freezer/door)
//
//   view 'front'    the front glass wall at night: tall panes, moonlight + the dead parking lot beyond (a car, unlit lamp posts), the shut
//                   sliding doors, checkout counter, a TOPPLED CART, cans on the floor, moonlight panes falling across the floor.
//                   pos: { glassX, glassTop, glassW, glassH (for glassHorde), doorX, counterX, cartX, floorY }
//   view 'aisle'    an aisle into the dark: EMPTY shelves (a few dented cans), a hanging 'AISLE 7' sign, boxes on the floor, a faint red EXIT.
//                   pos: { vpX, vpY, signX, signY, exitX, exitY }
//   view 'back'     the back corridor: 'EMPLOYEES ONLY' swing doors with round windows, pallets, a mop bucket, a green emergency light, the
//                   FREEZER door at the end.   pos: { freezerX, freezerY, swingX, lightX, lightY }
//   view 'freezer'  inside the freezer room: frosted walls + icicles, hanging plastic strips (sway), a dim caged bulb (flicker), racks of
//                   boxes, the steel door seen from inside (NO handle) with light under it and `shadow` breaking it.
//                   pos: { doorX, doorTop, doorW, gapY, bulbX, bulbY, rackX }
//   view 'door'     close on the inside of the steel door: the bare plate where a handle should be (4 empty screw holes, scratch marks,
//                   frost), light under the door, `shadow` 0..1 (feet on the other side).   pos: { doorX, plateX, plateY, gapY }
//   breathFog(g, t, x, y, { rate, s, facing })   cold breath puffs from a mouth (freezer)
//   deadPhone(g, t, x, y, s, { pct: 10..0, at, dim })   a phone dying: battery icon + % in red, 'LOW BATTERY', the screen dims, at 0 it's a black
//                   mirror with one reflection streak
// Deterministic (t, rng, noise). Characters: s 2.2-2.6 for vertical mediums.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, ring, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { flashlight as torchMask, vignette } from './horror.js';

export const storeGround = () => E.H * V(0.8, 0.74);
const MOON = '#9fb8ff', ICE = '#bfe4ff', BULB = '#d8ecff', DOORLIGHT = '#ffe6b8', INK = '#04050a';

const bulbFlick = (t, amt, seed = 4) => { if (amt <= 0) return 1; const a = noise(t * 5.7, seed), b = noise(t * 37, seed + 3); return a < -0.3 - (1 - amt) * 0.6 ? 0.08 : clamp(0.85 + 0.15 * b); };
function floorTiles(g, GY, col = '#14161e', tint = 0) {
  g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, [shade(col, 0.06), shade(col, -0.55)]); g.fillRect(-E.W, GY, E.W * 3, 900);
  g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2;
  for (let i = 0; i < 10; i++) { const y = GY + 8 + i * i * 9; g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  for (let x = -E.W; x < E.W * 2; x += 130) { g.beginPath(); g.moveTo(E.W / 2 + (x - E.W / 2) * 0.4, GY); g.lineTo(E.W / 2 + (x - E.W / 2) * 1.7, GY + 900); g.stroke(); }
}
function can(g, x, y, s, c, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); rr(g, -14 * s, -36 * s, 28 * s, 36 * s, 4 * s); g.fillStyle = c; g.fill(); g.fillStyle = alpha('#fff', 0.3); g.fillRect(-14 * s, -26 * s, 28 * s, 10 * s); g.fillStyle = alpha('#000', 0.3); g.fillRect(4 * s, -36 * s, 10 * s, 36 * s); g.restore(); }
function cart(g, x, y, s, toppled = true) {
  g.save(); g.translate(x, y); g.rotate(toppled ? -1.45 : 0); g.scale(s, s); g.strokeStyle = '#5a6068'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(-120, -180); g.lineTo(110, -180); g.lineTo(80, -40); g.lineTo(-100, -40); g.closePath(); g.stroke();
  for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(-120 + i * 29, -180); g.lineTo(-100 + i * 23, -40); g.stroke(); } for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-118 + i * 4, -180 + i * 35); g.lineTo(110 - i * 8, -180 + i * 35); g.stroke(); }
  seg(g, [[-120, -180], [-160, -230]], 8, '#3a3e44'); seg(g, [[-100, -40], [-90, 0]], 6, '#5a6068'); seg(g, [[70, -40], [60, 0]], 6, '#5a6068');
  circle(g, -90, 6, 14, '#1a1c20'); circle(g, 60, 6, 14, '#1a1c20');
  g.restore();
}

// =====================================================================================================
export function store(g, t, cam, o = {}) {
  const view = o.view || 'front', M = mood('night'), GY = storeGround(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => backdrop(g, ['#020308', '#05070e'], [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]));
  const f = { front, aisle, back, freezer, door: steelDoorView }[view] || front;
  const pos = f(g, t, cam, o, GY, CX);
  const cold = view === 'freezer' || view === 'door';
  return { GY, CX, M: { ...M, key: cold ? BULB : MOON, practical: DOORLIGHT }, rim: { color: cold ? ICE : MOON, dir: cold ? [0.2, -1] : [-0.8, -0.5] }, pos, view };
}

// ---------- FRONT GLASS ----------
function front(g, t, cam, o, GY, CX) {
  const mn = clamp(o.moon ?? 1), pos = { glassX: CX - 520, glassTop: GY - 1420, glassW: 1040, glassH: 1300, doorX: CX + 230, counterX: CX - 300, cartX: CX + 120, floorY: GY };
  layer(g, cam, 0.35, (g) => {
    // OUTSIDE: night sky, moon, the empty lot, a car, unlit lamp posts, the treeline
    g.save(); g.beginPath(); g.rect(pos.glassX, pos.glassTop, pos.glassW, pos.glassH); g.clip();
    g.fillStyle = linGrad(g, 0, pos.glassTop, 0, GY, ['#05081a', '#0e1634', '#1a2448']); g.fillRect(pos.glassX - 300, pos.glassTop - 300, pos.glassW + 600, pos.glassH + 600);
    FX.stars(g, t * 0.1, { area: [pos.glassX, pos.glassTop, pos.glassW, 500], count: 60, seed: 3 });
    glow(g, CX + 300, pos.glassTop + 260, 340, MOON, 0.35 * mn); circle(g, CX + 300, pos.glassTop + 260, 60, '#e8eeff');
    g.fillStyle = '#04060c'; g.beginPath(); g.moveTo(pos.glassX - 300, GY - 420); for (let x = pos.glassX - 300; x < pos.glassX + pos.glassW + 300; x += 50) g.lineTo(x, GY - 460 - Math.abs(noise(x * 0.01, 5)) * 120); g.lineTo(pos.glassX + pos.glassW + 300, GY); g.lineTo(pos.glassX - 300, GY); g.fill();
    g.fillStyle = '#0a0e1a'; g.fillRect(pos.glassX - 300, GY - 380, pos.glassW + 600, 400);
    for (let i = 0; i < 6; i++) { g.fillStyle = alpha('#c8ccd8', 0.12); g.fillRect(pos.glassX + 40 + i * 180, GY - 220, 100, 6); }
    rr(g, CX - 380, GY - 330, 300, 90, 30); g.fillStyle = '#05070c'; g.fill(); rr(g, CX - 330, GY - 380, 190, 70, 20); g.fill(); g.fillStyle = alpha(MOON, 0.18); g.fillRect(CX - 320, GY - 370, 170, 30);
    for (const lx of [CX - 120, CX + 380]) FX.lampPost(g, lx, GY - 240, 640, { on: false, color: '#04060a' });
    g.restore();
  });
  layer(g, cam, 0.6, (g) => {
    // the glass wall frame: mullions, a sign strip above, the shut sliding doors, posters taped on the inside (backwards)
    g.fillStyle = '#0a0c12'; g.beginPath(); g.rect(-E.W, GY - 1800, E.W * 3, 1800); g.rect(pos.glassX, pos.glassTop, pos.glassW, pos.glassH); g.fill('evenodd');
    for (let i = 0; i <= 4; i++) seg(g, [[pos.glassX + i * pos.glassW / 4, pos.glassTop], [pos.glassX + i * pos.glassW / 4, pos.glassTop + pos.glassH]], 18, '#1a1e26');
    seg(g, [[pos.glassX, pos.glassTop + 420], [pos.glassX + pos.glassW, pos.glassTop + 420]], 14, '#1a1e26');
    g.fillStyle = alpha(MOON, 0.05); g.fillRect(pos.glassX, pos.glassTop, pos.glassW, pos.glassH);
    g.save(); g.beginPath(); g.rect(pos.glassX, pos.glassTop, pos.glassW, pos.glassH); g.clip(); g.fillStyle = alpha('#ffffff', 0.05 * mn); for (const x0 of [pos.glassX + 120, pos.glassX + 640]) { g.beginPath(); g.moveTo(x0, pos.glassTop); g.lineTo(x0 + 90, pos.glassTop); g.lineTo(x0 - 220, pos.glassTop + pos.glassH); g.lineTo(x0 - 310, pos.glassTop + pos.glassH); g.closePath(); g.fill(); } g.restore();
    rr(g, pos.glassX + 60, pos.glassTop + 460, 200, 260, 4); g.fillStyle = alpha('#d8c070', 0.55); g.fill(); g.save(); g.translate(pos.glassX + 160, pos.glassTop + 560); g.scale(-1, 1); text(g, 'SALE', 0, 0, { size: 64, color: alpha('#a82020', 0.8), font: FONTS.title }); g.restore();
    seg(g, [[pos.doorX, pos.glassTop + 420], [pos.doorX, GY]], 10, '#2a2e36'); seg(g, [[pos.doorX - 200, GY - 560], [pos.doorX + 200, GY - 560]], 4, alpha('#c8ccd8', 0.25));
  });
  layer(g, cam, 0.9, (g) => {
    floorTiles(g, GY);
    // moonlight panes falling across the floor (skewed quads)
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const x0 = pos.glassX + i * pos.glassW / 4 + 20; g.fillStyle = alpha(MOON, 0.08 * mn); g.beginPath(); g.moveTo(x0, GY); g.lineTo(x0 + pos.glassW / 4 - 40, GY); g.lineTo(x0 + pos.glassW / 4 - 220, GY + 520); g.lineTo(x0 - 180, GY + 520); g.closePath(); g.fill(); } g.restore();
  });
  layer(g, cam, 1, (g) => {
    // checkout counter + belt, a dead register, the toppled cart, spilled cans
    const cx = pos.counterX; rr(g, cx - 220, GY - 300, 440, 300, 10); g.fillStyle = '#16181e'; g.fill(); g.fillStyle = '#0c0d10'; g.fillRect(cx - 220, GY - 312, 440, 22);
    rr(g, cx + 80, GY - 440, 120, 130, 8); g.fillStyle = '#1e2028'; g.fill(); rr(g, cx + 95, GY - 425, 90, 50, 4); g.fillStyle = '#05060a'; g.fill();
    seg(g, [[cx - 200, GY - 300], [cx - 200, GY - 520]], 8, '#2a2e36'); circle(g, cx - 200, GY - 540, 24, '#3a1414'); text(g, '4', cx - 200, GY - 540, { size: 28, color: '#c8c4b8', font: FONTS.ui, weight: 900 });
    cart(g, pos.cartX, GY + 40, 1.3, true);
    const R = rng(23); for (let i = 0; i < 9; i++) can(g, pos.cartX - 260 + R() * 520, GY + 30 + R() * 120, 1.4, ['#8a2a2a', '#2a5a8a', '#c8a03a', '#4a7a3a'][i % 4], R() * 3);
  });
  return pos;
}

// ---------- AISLE ----------
function aisle(g, t, cam, o, GY, CX) {
  const vpX = CX, vpY = GY - 700, pos = { vpX, vpY, signX: CX, signY: GY - 1380, exitX: CX, exitY: vpY - 260 };
  layer(g, cam, 0.7, (g) => {
    const W = E.W * 1.8, top = GY - 1900, bot = GY + 700, fw = 360, fh = 460, ex0 = vpX - fw / 2, ey0 = vpY - fh * 0.55;
    g.fillStyle = '#020308'; g.fillRect(ex0, ey0, fw, fh);                                                           // the end: pure dark
    text(g, 'EXIT', pos.exitX, pos.exitY, { size: 40, color: '#ff3a3a', font: FONTS.ui, weight: 900, glow: 18, glowColor: 'rgba(255,40,40,.7)', alpha: 0.75 + 0.25 * Math.sin(t * 1.3) }); glow(g, pos.exitX, pos.exitY, 160, '#ff3a3a', 0.12);
    poly(g, [[CX - W / 2, top], [CX + W / 2, top], [ex0 + fw, ey0], [ex0, ey0]], '#05060c');
    poly(g, [[CX - W / 2, bot], [CX + W / 2, bot], [ex0 + fw, ey0 + fh], [ex0, ey0 + fh]], '#0c0e14');
    // shelving both sides: mostly EMPTY, a few dented cans, a price strip
    const R = rng(41);
    for (const side of [-1, 1]) {
      const xN = CX + side * 560, xF = side < 0 ? ex0 + 10 : ex0 + fw - 10, yT = GY - 1250, yB = GY + 160;
      poly(g, [[xN, yT], [xF, ey0 + 20], [xF, ey0 + fh - 10], [xN, yB]], '#11141c');
      for (let r = 0; r < 6; r++) {
        const u = (r + 1) / 7, yN = lerp(yT, yB, u), yF = lerp(ey0 + 20, ey0 + fh - 10, u);
        seg(g, [[xN, yN], [xF, yF]], lerp(14, 4, 0.2), '#2a2e38'); seg(g, [[xN, yN + 10], [xF, yF + 3]], 6, alpha('#c8c070', 0.15));
        for (let k = 0; k < 3; k++) { if (R() < 0.6) continue; const kk = 0.1 + R() * 0.7, x = lerp(xN, xF, kk), y = lerp(yN, yF, kk), sc = lerp(1.6, 0.4, kk); can(g, x, y, sc, ['#6a2a2a', '#2a4a6a', '#8a7a3a'][Math.floor(R() * 3)], (R() - 0.5) * 0.3); }
      }
    }
    // boxes + cans on the floor, a ripped bag
    for (let i = 0; i < 6; i++) { const u = R(), x = lerp(CX - 300, vpX, u * 0.6) + (R() - 0.5) * 200, y = lerp(bot - 300, ey0 + fh, u * 0.6), s = lerp(1.6, 0.5, u * 0.6); rr(g, x - 50 * s, y - 40 * s, 100 * s, 60 * s, 4); g.fillStyle = '#3a2c1e'; g.fill(); }
    // the hanging aisle sign, swaying a little
    const sw = Math.sin(t * 0.8) * 0.03; g.save(); g.translate(pos.signX, pos.signY); g.rotate(sw); seg(g, [[-120, -120], [-120, 0]], 3, '#3a3e44'); seg(g, [[120, -120], [120, 0]], 3, '#3a3e44');
    rr(g, -200, 0, 400, 120, 8); g.fillStyle = '#1a2a4a'; g.fill(); text(g, 'AISLE 7', 0, 40, { size: 44, color: '#d8dce8', font: FONTS.ui, weight: 900, spacing: 3 }); text(g, 'CANNED GOODS', 0, 88, { size: 28, color: '#a8b0c8', font: FONTS.ui, weight: 800, spacing: 2 }); g.restore();
  });
  return pos;
}

// ---------- BACK CORRIDOR ----------
function back(g, t, cam, o, GY, CX) {
  const pos = { freezerX: CX + 200, freezerY: GY - 880, swingX: CX - 330, lightX: CX + 200, lightY: GY - 1080 };
  const el = 0.6 + 0.4 * Math.sin(t * 0.9) ** 2;
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 1800, 0, GY, ['#06080c', '#0e1216', '#0a0c10']); g.fillRect(-E.W, GY - 1800, E.W * 3, 1804);
    g.strokeStyle = alpha('#000', 0.35); g.lineWidth = 3; for (let y = GY - 1700; y < GY; y += 110) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }      // block wall
    // the green emergency light (the practical) over the freezer door
    rr(g, pos.lightX - 60, pos.lightY - 20, 120, 40, 8); g.fillStyle = mix('#1a2a1a', '#7aff9a', 0.6 * el); g.fill(); glow(g, pos.lightX, pos.lightY, 520, '#7aff9a', 0.16 * el);
    // the FREEZER door at the end of the corridor (steel, a strip curtain behind its window), sign
    const fx = pos.freezerX; rr(g, fx - 200, pos.freezerY, 400, GY - pos.freezerY, 6); g.fillStyle = '#3a4048'; g.fill(); g.strokeStyle = '#1a1c20'; g.lineWidth = 8; g.stroke();
    rr(g, fx - 160, pos.freezerY - 80, 320, 60, 6); g.fillStyle = '#1a3a6a'; g.fill(); text(g, 'FREEZER', fx, pos.freezerY - 50, { size: 36, color: '#e8eef8', font: FONTS.ui, weight: 900, spacing: 4 });
    rr(g, fx + 120, pos.freezerY + 380, 60, 140, 8); g.fillStyle = '#6a7078'; g.fill(); seg(g, [[fx + 150, pos.freezerY + 400], [fx + 150, pos.freezerY + 500]], 10, '#2a2e34');   // the OUTSIDE handle (this side has one)
    g.fillStyle = alpha(ICE, 0.08); g.fillRect(fx - 200, pos.freezerY, 400, 40);
  });
  layer(g, cam, 0.9, (g) => floorTiles(g, GY, '#121418'));
  layer(g, cam, 1, (g) => {
    // EMPLOYEES ONLY swing doors (left), pallets, a mop bucket
    const sx = pos.swingX; for (const d of [-1, 1]) { rr(g, sx + d * 100 - 95, GY - 760, 190, 760, 6); g.fillStyle = '#2a2e34'; g.fill(); circle(g, sx + d * 100, GY - 520, 50, '#05060a'); ring(g, sx + d * 100, GY - 520, 50, 6, '#4a4e56'); }
    rr(g, sx - 160, GY - 860, 320, 60, 6); g.fillStyle = '#5a1a1a'; g.fill(); text(g, 'EMPLOYEES ONLY', sx, GY - 830, { size: 28, color: '#e8d8d8', font: FONTS.ui, weight: 900, spacing: 2 });
    for (let i = 0; i < 3; i++) { g.fillStyle = '#4a3a24'; g.fillRect(CX + 260, GY - 40 - i * 46, 300, 18); for (let k = 0; k < 4; k++) g.fillRect(CX + 260 + k * 92, GY - 40 - i * 46, 24, 46); }
    rr(g, CX - 520, GY - 150, 150, 150, 14); g.fillStyle = '#c8a020'; g.fill(); seg(g, [[CX - 470, GY - 150], [CX - 400, GY - 520]], 8, '#6a5a3a');
  });
  return pos;
}

// ---------- the steel door (seen from INSIDE the freezer: no handle) + the light under it ----------
function steelDoor(g, t, x, top, w, h, o) {
  rr(g, x - 40, top - 40, w + 80, h + 40, 6); g.fillStyle = '#1a1e24'; g.fill();
  g.fillStyle = linGrad(g, x, 0, x + w, 0, ['#4a525c', '#6a7480', '#3a424c']); g.fillRect(x, top, w, h - 8);
  for (let i = 0; i < 5; i++) seg(g, [[x + 20, top + 80 + i * (h - 160) / 4], [x + w - 20, top + 80 + i * (h - 160) / 4]], 3, alpha('#000', 0.25));
  // where the handle should be: a bare plate, four empty screw holes, scratch marks around it
  const px = x + w * 0.82, py = top + h * 0.52; rr(g, px - 36, py - 90, 72, 180, 8); g.fillStyle = '#5a626c'; g.fill(); g.strokeStyle = alpha('#000', 0.4); g.lineWidth = 2; g.stroke();
  for (const [dx, dy] of [[-18, -64], [18, -64], [-18, 64], [18, 64]]) circle(g, px + dx, py + dy, 6, '#0a0c10');
  const R = rng(13); g.strokeStyle = alpha('#c8d0d8', 0.45); g.lineWidth = 2; for (let i = 0; i < 9; i++) { const sx = px - 60 + R() * 120, sy = py - 120 + R() * 240; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (R() - 0.5) * 30, sy + 40 + R() * 40); g.stroke(); }
  // frost creeping in from the edges
  const fr = clamp(o.frost ?? 0.7); g.fillStyle = alpha('#e8f4ff', 0.18 * fr); for (let i = 0; i < 60; i++) circle(g, x + (R() < 0.5 ? R() * 60 : w - R() * 60), top + R() * h, 2 + R() * 5, alpha('#e8f4ff', 0.25 * fr));
  // the light under the door, broken by a shadow (two feet) when `shadow` > 0
  const un = clamp(o.under ?? 1), sh = clamp(o.shadow ?? 0), gy = top + h;
  g.fillStyle = INK; g.fillRect(x, gy - 8, w, 8);
  if (un > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(DOORLIGHT, 0.9 * un); g.fillRect(x + 6, gy - 7, w - 12, 6);
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 380, [alpha(DOORLIGHT, 0.28 * un), alpha(DOORLIGHT, 0)]); g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.lineTo(x + w + 160, gy + 380); g.lineTo(x - 160, gy + 380); g.closePath(); g.fill(); g.restore();
    if (sh > 0.01) { const cx = x + w / 2 + noise(t * 0.6, 7) * 12; g.save(); g.globalAlpha *= sh; g.fillStyle = INK; for (const off of [-70, 40]) { g.beginPath(); g.moveTo(cx + off, gy - 7); g.lineTo(cx + off + 44, gy - 7); g.lineTo(cx + off * 1.6 + 80, gy + 380); g.lineTo(cx + off * 1.6 - 20, gy + 380); g.closePath(); g.fill(); } g.restore(); }
  }
  return { plateX: px, plateY: py, gapY: gy };
}

// ---------- FREEZER ROOM ----------
function freezer(g, t, cam, o, GY, CX) {
  const fl = bulbFlick(t, o.flicker ?? 0.3), pos = { doorX: CX + 180, doorTop: GY - 1080, doorW: 440, gapY: GY, bulbX: CX - 140, bulbY: GY - 1500, rackX: CX - 380 };
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 1800, 0, GY, [mix('#0a1018', '#2a3a48', 0.5 * fl), mix('#0e141c', '#3a4a58', 0.5 * fl)]); g.fillRect(-E.W, GY - 1800, E.W * 3, 1804);
    for (let x = -E.W; x < E.W * 2; x += 150) seg(g, [[x, GY - 1800], [x, GY]], 4, alpha('#000', 0.25));          // insulated panels
    const R = rng(7), fr = clamp(o.frost ?? 0.8); for (let i = 0; i < 220; i++) circle(g, -200 + R() * (E.W + 400), GY - 1800 + R() * 1800, 1 + R() * 3, alpha('#e8f4ff', (0.06 + R() * 0.12) * fr));   // frost speckle
    for (let i = 0; i < 18; i++) { const x = -100 + i * 75 + R() * 30, l = 40 + R() * 110; poly(g, [[x - 8, GY - 1640], [x + 8, GY - 1640], [x, GY - 1640 + l]], alpha('#dff0ff', 0.55 * fr)); }   // icicles off the top rail
    seg(g, [[-E.W, GY - 1650], [E.W * 2, GY - 1650]], 18, '#2a323c');
  });
  layer(g, cam, 0.9, (g) => { floorTiles(g, GY, '#161c24'); g.fillStyle = alpha('#e8f4ff', 0.06); g.fillRect(-E.W, GY, E.W * 3, 900); });
  layer(g, cam, 1, (g) => {
    // racks of frozen boxes (left), frosted
    const rx = pos.rackX; for (let r = 0; r < 5; r++) { seg(g, [[rx - 260, GY - 200 - r * 220], [rx + 200, GY - 200 - r * 220]], 10, '#3a4450'); for (let k = 0; k < 4; k++) { rr(g, rx - 240 + k * 110, GY - 290 - r * 220, 96, 86, 4); g.fillStyle = mix('#5a4a3a', '#c8d8e4', 0.3); g.fill(); g.fillStyle = alpha('#e8f4ff', 0.3); g.fillRect(rx - 240 + k * 110, GY - 290 - r * 220, 96, 10); } }
    seg(g, [[rx - 260, GY], [rx - 260, GY - 1200]], 10, '#3a4450'); seg(g, [[rx + 200, GY], [rx + 200, GY - 1200]], 10, '#3a4450');
    // the steel door from inside: NO handle; light under it
    const D = steelDoor(g, t, pos.doorX - pos.doorW / 2, pos.doorTop, pos.doorW, GY - pos.doorTop, o); Object.assign(pos, D);
    // hanging plastic strips in front of the door (sway)
    const st = o.strips ?? 0.3; for (let i = 0; i < 8; i++) { const x = pos.doorX - pos.doorW / 2 - 30 + i * (pos.doorW + 60) / 8, sw = Math.sin(t * 1.3 + i * 0.7) * 12 * st; g.save(); g.globalAlpha *= 0.28; g.fillStyle = '#d8ecf8'; g.beginPath(); g.moveTo(x, pos.doorTop - 60); g.lineTo(x + 52, pos.doorTop - 60); g.lineTo(x + 52 + sw, GY - 140); g.lineTo(x + sw, GY - 140); g.closePath(); g.fill(); g.restore(); seg(g, [[x + 4, pos.doorTop - 60], [x + 4 + sw, GY - 140]], 2, alpha('#ffffff', 0.25)); }
    seg(g, [[pos.doorX - pos.doorW / 2 - 50, pos.doorTop - 64], [pos.doorX + pos.doorW / 2 + 50, pos.doorTop - 64]], 10, '#2a323c');
    // the caged bulb (the practical): dim, cold, flickering
    const bx = pos.bulbX, by = pos.bulbY; seg(g, [[bx, by - 200], [bx, by - 40]], 4, '#1a1e24'); circle(g, bx, by, 34, mix('#2a3038', '#f0f8ff', fl));
    g.strokeStyle = '#2a2e34'; g.lineWidth = 4; g.beginPath(); g.arc(bx, by, 46, 0, 7); g.stroke(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; seg(g, [[bx + Math.cos(a) * 46, by + Math.sin(a) * 46], [bx - Math.cos(a) * 46, by - Math.sin(a) * 46]], 3, '#2a2e34'); }
    if (fl > 0.1) { glow(g, bx, by, 520, BULB, 0.3 * fl); FX.lightCone(g, bx, by, { angle: Math.PI / 2, spread: 1.1, len: 1500, color: BULB, a: 0.07 * fl }); }
  });
  return pos;
}

// ---------- DOOR (close on the missing handle) ----------
function steelDoorView(g, t, cam, o, GY, CX) {
  const pos = { doorX: CX };
  layer(g, cam, 0.6, (g) => { g.fillStyle = '#0c1218'; g.fillRect(-E.W, GY - 1800, E.W * 3, 1804); });
  layer(g, cam, 0.9, (g) => floorTiles(g, GY, '#161c24'));
  layer(g, cam, 1, (g) => { const D = steelDoor(g, t, CX - 340, GY - 1500, 680, 1500, o); Object.assign(pos, D); glow(g, CX - 200, GY - 1400, 600, BULB, 0.12); });
  return pos;
}

// =====================================================================================================
export function breathFog(g, t, x, y, o = {}) {
  const rate = o.rate ?? 0.8, f = o.facing ?? 1, s = o.s ?? 1, life = 1.8, per = 1 / rate, n = Math.ceil(life / per) + 1, base = Math.floor(t / per);
  for (let i = 0; i < n; i++) { const k = base - i, age = t - k * per; if (age < 0 || age > life) continue; const u = age / life, R = rng(500 + k);
    const px = x + f * (10 + 120 * ease.out(u)) * s, py = y - 30 * u * s + (R() - 0.5) * 8, r = (10 + 40 * ease.out(u)) * s, a = 0.4 * (1 - u) * Math.min(1, age / 0.1);
    g.save(); g.globalAlpha *= a; g.fillStyle = '#eaf4ff'; for (const [dx, dy, rr2] of [[0, 0, 1], [0.6, -0.3, 0.75], [0.5, 0.35, 0.6], [-0.3, 0.1, 0.55]]) { g.beginPath(); g.arc(px + f * dx * r, py + dy * r, r * rr2, 0, 7); g.fill(); } g.restore(); }
}
export function deadPhone(g, t, x, y, s = 1, o = {}) {
  const pct = Math.max(0, Math.round(o.pct ?? 10)), dim = clamp(o.dim ?? (pct <= 0 ? 1 : 0.2 + 0.08 * (10 - pct)));
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -110, -220, 220, 440, 34); g.fillStyle = '#0c0d10'; g.fill(); g.strokeStyle = '#2a2c32'; g.lineWidth = 4; g.stroke();
  rr(g, -98, -206, 196, 412, 26); g.fillStyle = pct > 0 ? mix('#1a2a44', '#03040a', dim) : '#02030a'; g.fill();
  if (pct > 0) {
    if (dim < 0.95) glow(g, 0, 0, 260, '#8fc4ff', 0.12 * (1 - dim));
    rr(g, -44, -60, 80, 40, 6); g.strokeStyle = '#e04a3a'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#e04a3a'; g.fillRect(36, -48, 8, 16); g.fillRect(-38, -54, 70 * pct / 100 + 2, 28);
    text(g, `${pct}%`, 0, 20, { size: 52, color: '#ff6a5a', font: FONTS.ui, weight: 900, alpha: 1 - dim * 0.5 });
    text(g, 'LOW BATTERY', 0, 80, { size: 22, color: alpha('#e8e8ee', 0.8 - dim * 0.4), font: FONTS.ui, weight: 900, spacing: 2 });
    if (Math.floor(t * 2) % 2 === 0) circle(g, 0, -120, 6, alpha('#ff4a3a', 0.8));
  } else { g.fillStyle = alpha('#ffffff', 0.06); g.beginPath(); g.moveTo(-60, -206); g.lineTo(-20, -206); g.lineTo(-98, 60); g.lineTo(-98, -40); g.closePath(); g.fill(); }
  g.restore();
}

// =====================================================================================================
export function storeFg(g, t, cam, o = {}) {
  const view = o.view || 'front', GY = storeGround(), L = o.flashlight;
  layer(g, cam, 1.6, (g) => {
    g.save(); g.filter = 'blur(10px)';
    if (view === 'aisle') { rr(g, -200, GY - 1400, 300, 2400, 10); g.fillStyle = '#020308'; g.fill(); }                                  // a shelf end, near
    else if (view === 'front') { cart(g, E.W + 60, GY + 700, 2.6, false); }
    else if (view === 'freezer') { for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha *= 0.35; g.fillStyle = '#d8ecf8'; g.fillRect(-60 + i * 80, -E.H, 64, E.H * 3); g.restore(); } }   // strips, close
    else { g.fillStyle = '#020308'; g.fillRect(E.W - 120, -E.H, 260, E.H * 3); }
    g.restore();
  });
  const cold = view === 'freezer' || view === 'door';
  FX.dust(g, t * 0.4, { count: 22, color: cold ? '#eaf4ff' : MOON, a: 0.14, seed: 71 }); FX.dust(g, t * 1.1 + 2, { count: 8, color: cold ? '#eaf4ff' : MOON, a: 0.2, seed: 73 });
  if (L && (L.on ?? 1) > 0) torchMask(g, L.x, L.y, L.ang, { len: L.len ?? E.H * 0.85, spread: L.spread ?? 0.3, dark: 0.86 * (L.on ?? 1) });
  vignette(g, 0.7);
}
