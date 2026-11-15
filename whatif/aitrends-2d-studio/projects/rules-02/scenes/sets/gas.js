// sets/gas.js — the QUIK STOP gas station at night (THE RULES #2 "The Night Shift"), built for VERTICAL 9:16 (1080x1920).
// Cold key light everywhere (sodium-free: the canopy and the ceiling tubes are a sick blue-green white); ONE warm practical per view
// (the store glow seen from outside, the coffee machine / register lamp inside). Outside the glass is always pitch black.
//
//   const G = gas(g, t, cam, { view, lights: { tubes: 0..1, canopy: 0..1, sign: 0..1 }, flicker: 0..1 (the bad tube), clock: '2:00'|'2:40'|'3:00', ...view opts })
//   gasFg(g, t, cam, { view })   blurred foreground piece + cold dust + vignette; draw AFTER characters
//   Returns { GY, CX, M, rim, pos, light, view }   rim = cold tube rim for actors; light = the tubes' level after flicker
//
//   view 'exterior'  the canopy with buzzing light panels, 2 pumps, the store front (warm windows, OPEN 24 HRS), the tall QUIK STOP price sign,
//                    the empty highway running into pitch black, moths circling the lights.          pos: { canopyY, pumpXs[], doorX, storeTop, signX, roadY }
//   view 'counter'   from the customer side: the counter + register (the sticky note goes at pos.noteX/Y), cigarette rack, lottery screen, the wall
//                    clock, the wall phone mount (H2's wallPhone at pos.phoneX/Y; o.phone:false hides the stand-in), the CCTV monitor spot (pos.cctvX/Y),
//                    the coffee machine.   { phone: true }   The counter FRONT is G.pos.front(g): call it after drawing the clerk.
//                    pos: { clerkX, counterTop, counterL, counterR, registerX, noteX, noteY, clockX, clockY, phoneX, phoneY, cctvX, cctvY, coffeeX }
//   view 'window'    the NIGHT PAY WINDOW from inside: thick glass in the wall, the lot outside (a far pump under the canopy, then black), the pass-through
//                    drawer (o.drawer 0..1 out), the speaker grille, a 'PAY HERE' sticker.   pos: { glassX, glassY, glassW, glassH, drawerX, drawerY, speakerX, speakerY, outsideX, outsideGY }
//   view 'door'      the front glass door: push bar, the DEADBOLT (o.locked 0..1 turns the thumb-turn), "OPEN 24 HRS" neon on the glass (lights.sign),
//                    a bell over the door, pitch black outside.   pos: { doorX, doorTop, doorW, deadboltX, deadboltY, signX, signY }
//   view 'aisle'     snack aisles running back to the glowing coolers, fluorescent tubes (one flickering), a convex security mirror up in the corner.
//                    pos: { vpX, vpY, mirrorX, mirrorY, coolerY }
//   view 'behind'    CAMERA FOUR's angle: high in the corner BEHIND the counter. The clerk's spot is foreground (pos.clerkX), the counter top and
//                    register seen from the back, the store floor, the front windows + door: black outside. pos.behindX = the spot right behind
//                    the clerk (where the thing stands).   pos: { clerkX, behindX, counterTop, registerX, doorX, floorY }
// Deterministic (t, rng, noise). Characters: s 2.2-2.6 for vertical mediums.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, ring, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const gasGround = () => E.H * V(0.8, 0.74);
const TUBE = '#d8f2ec', COLD = '#9fc8c0', WARM = '#ffc477', INK = '#05070a', NEON = '#ff3a4a';

// a tube that mostly works and sometimes dies for a few frames (amt 0..1)
export function tubeFlick(t, amt = 0, seed = 2) {
  if (amt <= 0) return 1;
  const a = noise(t * 6.1, seed), b = noise(t * 31, seed + 4), c = noise(t * 2.3, seed + 9);
  const dead = a < -0.25 - (1 - amt) * 0.7 || (c > 0.55 && b > 0.2 && amt > 0.5);
  return dead ? 0.06 : clamp(0.9 + 0.1 * b);
}
function tubeFixture(g, x, y, w, L, o = {}) {
  rr(g, x - w / 2 - 10, y - 16, w + 20, 32, 6); g.fillStyle = '#1c2024'; g.fill();
  rr(g, x - w / 2, y - 7, w, 14, 7); g.fillStyle = mix('#3a4446', TUBE, L); g.fill();
  if (L > 0.05) { glow(g, x, y, w * 0.9, TUBE, 0.35 * L); if (o.cone !== false) FX.lightCone(g, x, y, { angle: Math.PI / 2, spread: 1.2, len: o.len ?? 1300, color: TUBE, a: 0.07 * L }); }
}
function wallClock(g, x, y, r, str = '2:00', t = 0) {
  const [hh, mm] = str.split(':').map(Number), sec = Math.floor(t) * 6;
  circle(g, x, y, r + 8, '#1a1c20'); circle(g, x, y, r, '#cfd6d0'); ring(g, x, y, r - 4, 2, '#8a908a');
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; seg(g, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]], 4, '#111'); }
  const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, ma = mm / 60 * Math.PI * 2 - Math.PI / 2, sa = (sec % 360) / 360 * Math.PI * 2 - Math.PI / 2;
  seg(g, [[x, y], [x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5]], 7, '#0a0a0a'); seg(g, [[x, y], [x + Math.cos(ma) * r * 0.76, y + Math.sin(ma) * r * 0.76]], 5, '#0a0a0a');
  seg(g, [[x, y], [x + Math.cos(sa) * r * 0.82, y + Math.sin(sa) * r * 0.82]], 2, '#b02020'); circle(g, x, y, 6, '#111');
}
function neon(g, str, x, y, size, on, t) {
  const k = on * (0.85 + 0.15 * Math.sin(t * 40) * Math.sin(t * 3.1));
  if (k > 0.05) glow(g, x, y, size * str.length * 0.4, NEON, 0.35 * k);
  text(g, str, x, y, { size, color: on > 0.05 ? mix('#5a1a20', '#ffd0d4', k) : '#3a1418', font: FONTS.ui, weight: 900, spacing: 3, glow: on > 0.05 ? 22 * k : 0, glowColor: NEON });
}
function blackGlass(g, x, y, w, h, o = {}) {                  // a window/door pane onto the night: black, a faint reflection streak, condensation at the base
  g.fillStyle = '#020305'; g.fillRect(x, y, w, h);
  g.fillStyle = linGrad(g, x, y + h * 0.6, x, y + h, ['rgba(160,200,200,0)', 'rgba(160,200,200,.07)']); g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = alpha(TUBE, o.refl ?? 0.06);
  g.beginPath(); g.moveTo(x + w * 0.15, y); g.lineTo(x + w * 0.3, y); g.lineTo(x + w * 0.05, y + h); g.lineTo(x - w * 0.1, y + h); g.closePath(); g.fill(); g.restore();
}
function shelfStock(g, x, y, w, h, rows, seed, L) {           // snack bags / boxes on shelf rows, desaturated under the tubes
  const R = rng(seed), cols = ['#a8323a', '#2f6fa0', '#d0a030', '#3a8a5a', '#8a4aa0', '#d06a30', '#c8c8c0'];
  for (let r = 0; r < rows; r++) {
    const yy = y + r * (h / rows); g.fillStyle = '#2a2e32'; g.fillRect(x, yy + h / rows - 10, w, 10);
    for (let xx = x + 4; xx < x + w - 20;) { const bw = 22 + R() * 30, bh = h / rows * (0.45 + R() * 0.4); rr(g, xx, yy + h / rows - 10 - bh, bw, bh, 4); g.fillStyle = mix(cols[Math.floor(R() * cols.length)], '#1a1e22', 0.55 - 0.25 * L); g.fill(); xx += bw + 4; }
  }
}

// =====================================================================================================
export function gas(g, t, cam, o = {}) {
  const view = o.view || 'counter', M = mood('night'), GY = gasGround(), CX = E.W / 2, Lt = o.lights || {};
  const L = clamp(Lt.tubes ?? 1), Lbad = L * tubeFlick(t, o.flicker ?? 0.4, 5), C = clamp(Lt.canopy ?? 1), Sg = clamp(Lt.sign ?? 1);
  const rim = { color: COLD, dir: [0.2, -1] };
  layer(g, cam, 0.1, (g) => backdrop(g, ['#020306', '#05080c'], [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]));
  const args = [g, t, cam, o, GY, CX, L, Lbad, C, Sg];
  const pos = view === 'exterior' ? exterior(...args) : view === 'window' ? payWindow(...args) : view === 'door' ? door(...args) : view === 'aisle' ? aisle(...args) : view === 'behind' ? behind(...args) : counter(...args);
  return { GY, CX, M: { ...M, key: TUBE, practical: WARM }, rim, pos, light: Lbad, view };
}

// shared interior shell: back wall (cold tile + paint), floor tiles, ceiling tubes
function interiorShell(g, cam, GY, CX, L, Lbad, t, o = {}) {
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 1700, 0, GY, [mix('#0e1214', '#3a4644', 0.4 * L), mix('#141a1c', '#4a5654', 0.5 * L)]); g.fillRect(-E.W, GY - 1700, E.W * 3, 1704);
    g.fillStyle = mix('#0a0e10', '#2a3634', 0.5 * L); g.fillRect(-E.W, GY - 300, E.W * 3, 300);                                 // lower wall band
    g.fillStyle = alpha('#000', 0.25); g.fillRect(-E.W, GY - 304, E.W * 3, 6);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = mix('#0c0f10', '#3a403c', 0.5 * L); g.fillRect(-E.W, GY, E.W * 3, 900);
    g.strokeStyle = alpha('#000', 0.4); g.lineWidth = 2;
    for (let i = 0; i < 10; i++) { const y = GY + 8 + i * i * 9; g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    for (let x = -E.W; x < E.W * 2; x += 120) { g.beginPath(); g.moveTo(CX + (x - CX) * 0.4, GY); g.lineTo(CX + (x - CX) * 1.6, GY + 900); g.stroke(); }
    FX.pool(g, CX, GY + 120, 700, 120, TUBE, 0.12 * L);
  });
  layer(g, cam, 0.95, (g) => { const y = GY - 1460; tubeFixture(g, CX - 260, y, 360, L, { len: 1600 }); tubeFixture(g, CX + 280, y + 30, 360, Lbad, { len: 1600 }); });
}

// ---------- COUNTER (customer side) ----------
function counter(g, t, cam, o, GY, CX, L, Lbad) {
  const pos = { clerkX: CX - 40, counterTop: GY - 330, counterL: CX - 520, counterR: CX + 460, registerX: CX - 200, noteX: CX - 200, noteY: GY - 470,
    clockX: CX + 300, clockY: GY - 1180, phoneX: CX + 330, phoneY: GY - 860, cctvX: CX + 300, cctvY: GY - 420, coffeeX: CX - 470 };
  interiorShell(g, cam, GY, CX, L, Lbad, t);
  layer(g, cam, 0.62, (g) => {
    // cigarette rack + lottery screen behind the clerk
    const rx = CX - 420, ry = GY - 1180; rr(g, rx, ry, 560, 560, 8); g.fillStyle = '#1a1c1e'; g.fill();
    const R = rng(8); for (let r = 0; r < 7; r++) for (let c = 0; c < 10; c++) { rr(g, rx + 16 + c * 54, ry + 18 + r * 76, 46, 62, 4); g.fillStyle = mix(['#c8c4b8', '#a83a3a', '#2a4a8a', '#c8a03a', '#3a3a3a'][Math.floor(R() * 5)], '#101214', 0.5 - 0.25 * L); g.fill(); }
    rr(g, rx + 120, ry - 170, 320, 130, 10); g.fillStyle = '#08100c'; g.fill(); text(g, 'LOTTO', rx + 280, ry - 128, { size: 36, color: mix('#1a4a2a', '#7aff9a', 0.6 + 0.2 * Math.sin(t * 2)), font: FONTS.ui, weight: 900, spacing: 4 }); text(g, '$ 4,000,000', rx + 280, ry - 82, { size: 30, color: '#e8d070', font: FONTS.ui, weight: 900 });
    wallClock(g, pos.clockX, pos.clockY, 74, o.clock || '2:00', t);
    if (o.phone !== false) { rr(g, pos.phoneX - 48, pos.phoneY - 110, 96, 220, 12); g.fillStyle = '#c8c4b4'; g.fill(); rr(g, pos.phoneX - 20, pos.phoneY - 140, 40, 300, 18); g.fillStyle = '#d8d4c4'; g.fill(); for (let i = 0; i < 6; i++) seg(g, [[pos.phoneX + 20, pos.phoneY + 150 + i * 14], [pos.phoneX + 34, pos.phoneY + 160 + i * 14]], 4, '#9a968a'); }
    text(g, 'NO REFUNDS', CX + 300, GY - 1000, { size: 26, color: alpha('#e8e4d8', 0.35 + 0.4 * L), font: FONTS.ui, weight: 900, spacing: 3 });
  });
  layer(g, cam, 1, (g) => {
    // the counter (front panel faces us), register, the CCTV monitor spot, gum + lighters rack, the coffee machine (the warm practical)
    const cl = pos.counterL, cr = pos.counterR, ct = pos.counterTop;
    const rx = pos.registerX; rr(g, rx - 110, ct - 150, 220, 128, 10); g.fillStyle = '#26292c'; g.fill(); rr(g, rx - 80, ct - 210, 160, 70, 6); g.fillStyle = '#0e1612'; g.fill();
    text(g, '0.00', rx, ct - 175, { size: 34, color: '#6aff8a', font: FONTS.ui, weight: 900, glow: 8, glowColor: 'rgba(90,255,140,.6)' });
    for (let i = 0; i < 12; i++) { rr(g, rx - 90 + (i % 4) * 46, ct - 130 + Math.floor(i / 4) * 34, 40, 28, 4); g.fillStyle = '#3a3e42'; g.fill(); }
    rr(g, pos.cctvX - 120, ct - 230, 240, 190, 10); g.fillStyle = '#16181a'; g.fill(); rr(g, pos.cctvX - 104, ct - 214, 208, 150, 4); g.fillStyle = '#0a120e'; g.fill(); seg(g, [[pos.cctvX, ct - 40], [pos.cctvX, ct - 22]], 16, '#16181a');
    for (let i = 0; i < 5; i++) { rr(g, CX + 20 + i * 36, ct - 70, 30, 48, 4); g.fillStyle = ['#d04040', '#40a0d0', '#d0c040', '#40c060', '#c060c0'][i]; g.fill(); }
    // coffee machine: the warm one (pilot light + carafe on the hot plate)
    const cx = pos.coffeeX; rr(g, cx - 90, ct - 300, 180, 280, 12); g.fillStyle = '#1a1614'; g.fill(); rr(g, cx - 60, ct - 120, 120, 100, 20); g.fillStyle = alpha('#3a2010', 0.9); g.fill();
    glow(g, cx, ct - 60, 220, WARM, 0.3); circle(g, cx + 60, ct - 260, 7, '#ff6a2a'); glow(g, cx + 60, ct - 260, 30, '#ff6a2a', 0.6);
    const st = (t * 0.5) % 1; circle(g, cx - 10 + Math.sin(t * 2) * 6, ct - 130 - st * 60, 10 + st * 12, alpha('#e8e4dc', 0.12 * (1 - st)));
  });
  // the counter's front panel + top: drawn by the shot AFTER the clerk (G.front(g)) so he stands behind it
  pos.front = (g) => layer(g, cam, 1, (g) => {
    const cl = pos.counterL, cr = pos.counterR, ct = pos.counterTop;
    g.fillStyle = mix('#14181a', '#3a4240', 0.45 * L); g.fillRect(cl, ct, cr - cl, GY - ct + 40); g.fillStyle = mix('#22282a', '#6a7470', 0.5 * L); g.fillRect(cl - 14, ct - 22, cr - cl + 28, 26);
    for (let x = cl + 30; x < cr; x += 160) { g.fillStyle = alpha('#000', 0.25); g.fillRect(x, ct + 30, 4, GY - ct); }
    text(g, 'QUIK STOP', (cl + cr) / 2, ct + 120, { size: 54, color: mix('#3a1a1c', '#d83a40', 0.4 + 0.4 * L), font: FONTS.title, spacing: 6 });
  });
  return pos;
}

// ---------- THE NIGHT PAY WINDOW (from inside) ----------
function payWindow(g, t, cam, o, GY, CX, L, Lbad, C) {
  const gw = 640, gh = 820, pos = { glassX: CX - gw / 2, glassY: GY - 1180, glassW: gw, glassH: gh, drawerX: CX, drawerY: GY - 330, speakerX: CX + 230, speakerY: GY - 620, outsideX: CX, outsideGY: GY - 380 };
  interiorShell(g, cam, GY, CX, L, Lbad, t);
  layer(g, cam, 0.4, (g) => {
    // OUTSIDE: the lot, one far pump under the canopy light, then black
    g.save(); g.beginPath(); g.rect(pos.glassX, pos.glassY, gw, gh); g.clip();
    g.fillStyle = '#010203'; g.fillRect(pos.glassX - 400, pos.glassY - 400, gw + 800, gh + 800);
    const ox = CX + 180, oy = pos.outsideGY; glow(g, ox, oy - 360, 360, COLD, 0.22 * C); rr(g, ox - 200, oy - 420, 400, 24, 4); g.fillStyle = mix('#0a0e10', TUBE, 0.6 * C); g.fill();
    rr(g, ox - 30, oy - 200, 60, 200, 6); g.fillStyle = '#1a2024'; g.fill(); rr(g, ox - 20, oy - 180, 40, 30, 3); g.fillStyle = alpha('#6aff8a', 0.4 * C); g.fill();
    g.fillStyle = alpha(COLD, 0.08 * C); g.fillRect(ox - 260, oy, 520, 40);
    g.restore();
  });
  layer(g, cam, 1, (g) => {
    // the wall around the window, the thick glass (reflection + condensation + scratches), the steel frame
    const x = pos.glassX, y = pos.glassY;
    g.fillStyle = mix('#101416', '#3e4846', 0.45 * L); g.beginPath(); g.rect(-E.W, GY - 1700, E.W * 3, 1700); g.rect(x, y, gw, gh); g.fill('evenodd');
    g.fillStyle = alpha('#b8e0dc', 0.05); g.fillRect(x, y, gw, gh);
    g.save(); g.beginPath(); g.rect(x, y, gw, gh); g.clip(); g.fillStyle = alpha(TUBE, 0.07 * L); g.beginPath(); g.moveTo(x + 60, y); g.lineTo(x + 180, y); g.lineTo(x - 40, y + gh); g.lineTo(x - 160, y + gh); g.closePath(); g.fill();
    const R = rng(3); for (let i = 0; i < 60; i++) circle(g, x + R() * gw, y + gh - R() * 140, 1 + R() * 3, alpha('#cfe8e4', 0.08 + R() * 0.1)); g.restore();
    g.strokeStyle = '#4a5254'; g.lineWidth = 24; g.strokeRect(x, y, gw, gh);
    // sticker + speaker grille
    rr(g, x + 30, y + 30, 170, 64, 8); g.fillStyle = alpha('#e8d040', 0.8); g.fill(); text(g, 'PAY HERE', x + 115, y + 63, { size: 28, color: '#1a1a1a', font: FONTS.ui, weight: 900 });
    circle(g, pos.speakerX, pos.speakerY, 70, '#3a4244'); circle(g, pos.speakerX, pos.speakerY, 58, '#24292b'); for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if (i * i + j * j <= 10) circle(g, pos.speakerX + i * 14, pos.speakerY + j * 14, 4, '#0a0c0d');
    // ledge + the pass-through drawer (slides out toward us)
    const dk = clamp(o.drawer ?? 0); g.fillStyle = mix('#22282a', '#6a7470', 0.5 * L); g.fillRect(CX - 520, GY - 380, 1040, 40);
    g.fillStyle = '#16191b'; g.fillRect(CX - 520, GY - 340, 1040, 400);
    rr(g, CX - 200, GY - 360 + dk * 60, 400, 80 + dk * 50, 8); g.fillStyle = '#5a6264'; g.fill(); rr(g, CX - 180, GY - 350 + dk * 60, 360, 40 + dk * 40, 6); g.fillStyle = '#2a3032'; g.fill();
    seg(g, [[CX - 60, GY - 300 + dk * 110], [CX + 60, GY - 300 + dk * 110]], 10, '#8a9294');
  });
  return pos;
}

// ---------- THE FRONT DOOR + DEADBOLT ----------
function door(g, t, cam, o, GY, CX, L, Lbad, C, Sg) {
  const dw = 520, pos = { doorX: CX, doorTop: GY - 1260, doorW: dw, deadboltX: CX + 190, deadboltY: GY - 660, signX: CX - 40, signY: GY - 1020 };
  interiorShell(g, cam, GY, CX, L, Lbad, t);
  layer(g, cam, 1, (g) => {
    const x = CX - dw / 2, top = pos.doorTop, h = GY - top;
    g.fillStyle = mix('#101416', '#3e4846', 0.45 * L); g.beginPath(); g.rect(-E.W, GY - 1700, E.W * 3, 1700); g.rect(x - 30, top - 30, dw + 60, h + 30); g.fill('evenodd');
    // side window panes either side of the door: black, ads stuck on
    blackGlass(g, x - 420, top + 80, 360, h - 360); blackGlass(g, x + dw + 60, top + 80, 360, h - 360);
    rr(g, x + dw + 100, top + 160, 220, 300, 6); g.fillStyle = alpha('#e8d8b0', 0.55); g.fill(); text(g, 'ICE', x + dw + 210, top + 240, { size: 70, color: '#2f6fa0', font: FONTS.title });
    // the door: aluminium frame, black glass, push bar
    g.fillStyle = '#5a6264'; g.fillRect(x - 30, top - 30, dw + 60, 30); g.fillRect(x - 30, top, 30, h); g.fillRect(x + dw, top, 30, h);
    blackGlass(g, x, top, dw, h - 80, { refl: 0.08 }); g.fillStyle = '#5a6264'; g.fillRect(x, GY - 80, dw, 80);
    rr(g, x + 40, GY - 640, dw - 80, 36, 18); g.fillStyle = '#8a9294'; g.fill();
    neon(g, 'OPEN 24 HRS', pos.signX, pos.signY, 54, Sg, t);
    // bell over the door
    seg(g, [[CX, top - 30], [CX, top + 10]], 3, '#8a8060'); g.fillStyle = '#c8a040'; g.beginPath(); g.moveTo(CX - 22, top + 50); g.quadraticCurveTo(CX, top - 6, CX + 22, top + 50); g.closePath(); g.fill();
    // the DEADBOLT: brass plate + thumb-turn (vertical = unlocked, horizontal = locked)
    const lk = ease.inOut(clamp(o.locked ?? 0)), bx = pos.deadboltX, by = pos.deadboltY;
    rr(g, bx - 44, by - 70, 88, 140, 14); g.fillStyle = '#b8963a'; g.fill(); g.strokeStyle = '#6a5420'; g.lineWidth = 3; g.stroke();
    g.save(); g.translate(bx, by); g.rotate(lk * Math.PI / 2); rr(g, -12, -40, 24, 80, 10); g.fillStyle = '#d8b850'; g.fill(); g.fillStyle = alpha('#fff', 0.35); g.fillRect(-8, -36, 6, 72); g.restore();
    circle(g, bx, by, 8, '#6a5420');
    if (lk > 0.95) { g.fillStyle = alpha('#d8b850', 0.8); g.fillRect(bx + 30, by - 8, 34, 16); }                               // the bolt thrown into the frame
  });
  return pos;
}

// ---------- AISLES (one-point perspective to the coolers) ----------
function aisle(g, t, cam, o, GY, CX, L, Lbad) {
  const vpX = CX, vpY = GY - 720, pos = { vpX, vpY, mirrorX: E.W - 200, mirrorY: GY - 1480, coolerY: vpY - 120 };
  layer(g, cam, 0.7, (g) => {
    const W = E.W * 1.7, top = GY - 1800, bot = GY + 700, fw = 420, fh = 520, ex0 = vpX - fw / 2, ey0 = vpY - fh * 0.55;
    // back wall: the coolers glowing (cold) behind glass doors
    g.fillStyle = '#0a0e10'; g.fillRect(ex0, ey0, fw, fh);
    for (let i = 0; i < 4; i++) { const cx0 = ex0 + 10 + i * (fw - 20) / 4; rr(g, cx0, ey0 + 40, (fw - 20) / 4 - 8, fh - 70, 4); g.fillStyle = mix('#0e1a1e', '#bfe8f0', 0.35 * L); g.fill(); for (let k = 0; k < 4; k++) { g.fillStyle = alpha('#1a2a30', 0.8); g.fillRect(cx0 + 4, ey0 + 90 + k * 100, (fw - 20) / 4 - 16, 6); } }
    glow(g, vpX, vpY, 500, '#bfe8f0', 0.18 * L);
    poly(g, [[CX - W / 2, top], [ex0, ey0], [ex0, ey0 + fh], [CX - W / 2, bot]], mix('#0c1012', '#2a3232', 0.5 * L));
    poly(g, [[CX + W / 2, top], [ex0 + fw, ey0], [ex0 + fw, ey0 + fh], [CX + W / 2, bot]], mix('#0a0e10', '#262e2e', 0.5 * L));
    poly(g, [[CX - W / 2, top], [CX + W / 2, top], [ex0 + fw, ey0], [ex0, ey0]], mix('#06080a', '#1a2020', 0.4 * L));
    poly(g, [[CX - W / 2, bot], [CX + W / 2, bot], [ex0 + fw, ey0 + fh], [ex0, ey0 + fh]], mix('#0c0f10', '#3a403c', 0.5 * L));
    // shelving units on both sides (front faces stocked)
    for (const side of [-1, 1]) {
      const xN = CX + side * 520, xF = side < 0 ? ex0 + 20 : ex0 + fw - 20, yT = GY - 980, yB = GY + 120;
      g.save(); g.beginPath(); g.moveTo(xN, yT); g.lineTo(xF, ey0 + 40); g.lineTo(xF, ey0 + fh - 20); g.lineTo(xN, yB); g.closePath(); g.clip();
      g.fillStyle = '#1a1e22'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
      for (let k = 0; k < 9; k++) { const u = k / 9, x0 = lerp(xN, xF, u), x1 = lerp(xN, xF, u + 1 / 9), yt = lerp(yT, ey0 + 40, u), yb = lerp(yB, ey0 + fh - 20, u); shelfStock(g, Math.min(x0, x1), yt, Math.abs(x1 - x0), yb - yt, 5, 100 + k * 7 + side * 50, L); }
      g.restore();
    }
    // the tubes running down the ceiling, the second one is the bad one
    for (let k = 0; k < 4; k++) { const u = k / 4, y = lerp(top + 200, ey0 - 10, u), w = lerp(380, 90, u); tubeFixture(g, vpX, y, w, k === 1 ? Lbad : L, { cone: k < 2, len: 1200 }); }
  });
  layer(g, cam, 1, (g) => {
    // convex security mirror up in the corner: a fisheye of the aisle, and nobody in it (yet)
    const mx = pos.mirrorX, my = pos.mirrorY; seg(g, [[mx + 60, my - 140], [mx + 20, my - 60]], 8, '#2a2e30');
    circle(g, mx, my, 110, '#3a4042'); circle(g, mx, my, 98, mix('#0a0e10', '#4a5854', 0.5 * L));
    g.save(); g.beginPath(); g.arc(mx, my, 98, 0, 7); g.clip(); for (let i = 0; i < 4; i++) { g.strokeStyle = alpha('#9ab0a8', 0.25); g.lineWidth = 3; g.beginPath(); g.ellipse(mx, my + 30, 90 - i * 20, 40 - i * 8, 0, Math.PI, 0); g.stroke(); }
    glow(g, mx - 30, my - 40, 40, '#ffffff', 0.25); g.restore();
  });
  return pos;
}

// ---------- BEHIND: camera four (high in the corner behind the counter) ----------
function behind(g, t, cam, o, GY, CX, L, Lbad) {
  const pos = { clerkX: CX - 60, behindX: CX - 300, counterTop: GY - 330, registerX: CX + 120, doorX: CX + 40, floorY: GY };
  layer(g, cam, 0.55, (g) => {
    // the front of the store seen across the counter: windows + the door, all black outside, the OPEN neon backwards
    g.fillStyle = mix('#0c1012', '#323c3a', 0.45 * L); g.fillRect(-E.W, GY - 1700, E.W * 3, 1700);
    blackGlass(g, CX - 560, GY - 1250, 440, 860); blackGlass(g, CX + 200, GY - 1250, 440, 860); blackGlass(g, CX - 80, GY - 1250, 240, 950);
    g.strokeStyle = '#4a5254'; g.lineWidth = 16; g.strokeRect(CX - 80, GY - 1250, 240, 950);
    g.save(); g.translate(CX + 420, GY - 1050); g.scale(-1, 1); neon(g, 'OPEN 24 HRS', 0, 0, 40, 1, t); g.restore();
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = mix('#0c0f10', '#3a403c', 0.5 * L); g.fillRect(-E.W, GY - 300, E.W * 3, 1300);
    g.strokeStyle = alpha('#000', 0.35); g.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = GY - 290 + i * i * 12; g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    // a display stand + ice chest out on the shop floor
    rr(g, CX + 300, GY - 560, 240, 260, 8); g.fillStyle = '#1a1e22'; g.fill(); shelfStock(g, CX + 310, GY - 550, 220, 240, 3, 77, L);
    rr(g, CX - 560, GY - 470, 300, 170, 10); g.fillStyle = mix('#1a2a3a', '#9ab8d0', 0.3 * L); g.fill(); text(g, 'ICE', CX - 410, GY - 390, { size: 54, color: alpha('#e8f4ff', 0.6), font: FONTS.title });
  });
  layer(g, cam, 0.95, (g) => tubeFixture(g, CX - 100, GY - 1500, 420, Lbad, { len: 1700 }));
  layer(g, cam, 1, (g) => {
    // the counter seen from behind: the top, the register's back, the cash drawer side, a stool, cables
    const ct = pos.counterTop; g.fillStyle = mix('#22282a', '#6a7470', 0.5 * L); g.fillRect(CX - 700, ct - 20, 1400, 30);
    g.fillStyle = mix('#0e1214', '#2a3232', 0.45 * L); g.fillRect(CX - 700, ct + 10, 1400, GY - ct + 300);
    for (let i = 0; i < 4; i++) { rr(g, CX - 640 + i * 340, ct + 60, 300, 200, 6); g.strokeStyle = alpha('#000', 0.4); g.lineWidth = 3; g.stroke(); }
    const rx = pos.registerX; rr(g, rx - 120, ct - 150, 240, 130, 10); g.fillStyle = '#1e2124'; g.fill(); rr(g, rx - 70, ct - 210, 140, 70, 6); g.fillStyle = '#16191b'; g.fill();
    seg(g, [[rx + 100, ct - 40], [rx + 160, ct + 60], [rx + 140, ct + 200]], 4, '#0a0a0a');
    // the yellow sticky note on the register, seen from the back (just a square of yellow)
    rr(g, rx - 50, ct - 200, 70, 60, 3); g.fillStyle = alpha('#e8d040', 0.7); g.fill();
    // the clerk's stool (empty or not) at the clerk spot
    seg(g, [[pos.clerkX - 40, GY + 80], [pos.clerkX - 30, GY - 140]], 8, '#2a2e30'); seg(g, [[pos.clerkX + 40, GY + 80], [pos.clerkX + 30, GY - 140]], 8, '#2a2e30'); rr(g, pos.clerkX - 70, GY - 160, 140, 28, 12); g.fillStyle = '#3a1a1c'; g.fill();
  });
  return pos;
}

// ---------- EXTERIOR ----------
function exterior(g, t, cam, o, GY, CX, L, Lbad, C, Sg) {
  const pos = { canopyY: GY - 1080, pumpXs: [CX - 260, CX + 260], doorX: CX + 40, storeTop: GY - 900, signX: CX + 330, roadY: GY + 220 };
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#010204', '#04070c', '#080c14'], [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]); FX.stars(g, t * 0.2, { area: [-E.W, 0, E.W * 3, E.H * 0.4], count: 70, seed: 9 }); });
  layer(g, cam, 0.3, (g) => { g.fillStyle = '#020304'; g.beginPath(); g.moveTo(-E.W, GY - 260); for (let x = -E.W; x < E.W * 2; x += 60) g.lineTo(x, GY - 300 - Math.abs(noise(x * 0.01, 3)) * 120); g.lineTo(E.W * 2, GY); g.lineTo(-E.W, GY); g.fill(); });   // treeline
  layer(g, cam, 0.6, (g) => {
    // the store: low box, warm windows (the one warm thing out here), OPEN 24 HRS neon
    const st = pos.storeTop; g.fillStyle = '#14181c'; g.fillRect(CX - 520, st, 1040, GY - st);
    g.fillStyle = '#0e1012'; g.fillRect(CX - 540, st - 30, 1080, 40);
    for (const [x, w] of [[CX - 460, 360], [CX + 160, 320]]) { g.fillStyle = linGrad(g, 0, st + 160, 0, GY - 40, ['#ffd690', '#c8803a']); g.fillRect(x, st + 160, w, GY - st - 200); glow(g, x + w / 2, st + 380, 380, WARM, 0.22); shelfStock(g, x + 10, st + 320, w - 20, 300, 2, Math.round(x), 1); }
    g.fillStyle = '#0a0806'; g.fillRect(pos.doorX - 80, st + 160, 160, GY - st - 160); g.fillStyle = alpha('#ffd690', 0.5); g.fillRect(pos.doorX - 70, st + 170, 140, GY - st - 220);
    neon(g, 'OPEN 24 HRS', CX + 320, st + 90, 40, Sg, t);
    text(g, 'QUIK STOP', CX - 200, st + 80, { size: 64, color: '#d83a40', font: FONTS.title, spacing: 6, glow: 18, glowColor: 'rgba(216,58,64,.7)' });
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = '#0c0e10'; g.fillRect(-E.W, GY, E.W * 3, 900); FX.pool(g, CX, GY + 60, 760, 140, COLD, 0.2 * C); });
  layer(g, cam, 1, (g) => {
    // the tall price sign on its pole (right)
    const sx = pos.signX; seg(g, [[sx, GY + 40], [sx, GY - 1100]], 26, '#1a1c1e');
    rr(g, sx - 170, GY - 1540, 340, 460, 12); g.fillStyle = '#e8e4dc'; g.fill(); rr(g, sx - 170, GY - 1540, 340, 130, 12); g.fillStyle = '#c8282e'; g.fill();
    text(g, 'QUIK', sx, GY - 1495, { size: 52, color: '#fff', font: FONTS.title, spacing: 4 }); text(g, 'STOP', sx, GY - 1440, { size: 44, color: '#fff', font: FONTS.title, spacing: 6 });
    for (const [lab, p, i] of [['REG', '3.49', 0], ['PLUS', '3.79', 1], ['DSL', '4.19', 2]]) { const y = GY - 1350 + i * 96; rr(g, sx - 150, y - 38, 300, 80, 6); g.fillStyle = '#0a0c0e'; g.fill(); text(g, lab, sx - 100, y, { size: 26, color: '#e8e4dc', font: FONTS.ui, weight: 900 }); text(g, p, sx + 60, y, { size: 50, color: '#ff4a3a', font: FONTS.ui, weight: 900, glow: 12, glowColor: 'rgba(255,74,58,.7)' }); }
    // the canopy + its light panels (cold, buzzing)
    const cy = pos.canopyY; poly(g, [[CX - 560, cy - 70], [CX + 260, cy - 70], [CX + 260, cy + 20], [CX - 560, cy + 20]], '#1a1c20');
    g.fillStyle = '#c8282e'; g.fillRect(CX - 560, cy - 70, 820, 26);
    for (const x of [CX - 420, CX - 150, CX + 110]) { const k = x === CX - 150 ? Lbad * C : C; rr(g, x - 90, cy + 20, 180, 18, 4); g.fillStyle = mix('#2a2e30', TUBE, k); g.fill(); if (k > 0.05) { glow(g, x, cy + 30, 300, TUBE, 0.35 * k); FX.lightCone(g, x, cy + 30, { angle: Math.PI / 2, spread: 0.9, len: 1200, color: TUBE, a: 0.07 * k }); } }
    for (const x of [CX - 420, CX + 110]) seg(g, [[x, cy + 20], [x, GY]], 30, '#22262a');
    // the pump island + 2 pumps
    rr(g, CX - 520, GY - 30, 780, 40, 8); g.fillStyle = '#2a2e30'; g.fill();
    for (const px of pos.pumpXs) { const x = px - 100; rr(g, x - 70, GY - 420, 140, 400, 12); g.fillStyle = '#d8d4cc'; g.fill(); rr(g, x - 70, GY - 420, 140, 70, 12); g.fillStyle = '#c8282e'; g.fill(); rr(g, x - 50, GY - 320, 100, 70, 6); g.fillStyle = '#0a120e'; g.fill(); text(g, '0.000', x, GY - 285, { size: 26, color: '#6aff8a', font: FONTS.ui, weight: 900 }); seg(g, [[x + 70, GY - 260], [x + 110, GY - 200], [x + 100, GY - 80]], 8, '#1a1a1a'); rr(g, x + 70, GY - 300, 30, 60, 6); g.fillStyle = '#2a2a2a'; g.fill(); }
    // moths around the panels
    for (let i = 0; i < 14; i++) { const x0 = [CX - 420, CX - 150, CX + 110][i % 3], a = t * (2 + (i % 5) * 0.6) + i, r = 40 + (i % 4) * 22; circle(g, x0 + Math.cos(a) * r, pos.canopyY + 70 + Math.sin(a * 1.3) * r * 0.6, 3, alpha('#e8e4d0', 0.75)); }
    // the highway: road surface, dashes running off into pitch black on the left
    const ry = pos.roadY; g.fillStyle = '#060708'; g.fillRect(-E.W, ry, E.W * 3, 900);
    for (let i = 0; i < 9; i++) { const u = i / 9, x = lerp(E.W + 200, -300, u), w = lerp(160, 40, u), a = (1 - u) * 0.6 * C; g.fillStyle = alpha('#e8d890', a); g.fillRect(x - w / 2, ry + 160 - u * 40, w, lerp(12, 4, u)); }
    g.fillStyle = linGrad(g, -300, 0, CX, 0, ['#000', 'rgba(0,0,0,0)']); g.fillRect(-E.W, ry - 400, E.W + CX, 1300);
  });
  return pos;
}

// =====================================================================================================
export function gasFg(g, t, cam, o = {}) {
  const view = o.view || 'counter', GY = gasGround();
  layer(g, cam, 1.6, (g) => {
    g.save(); g.filter = 'blur(10px)';
    if (view === 'counter') { rr(g, -100, GY + 380, 600, 900, 20); g.fillStyle = '#040506'; g.fill(); }                                        // a snack rack edge, near
    else if (view === 'exterior') { seg(g, [[E.W + 30, GY + 900], [E.W - 10, -200]], 70, '#020304'); }                                     // a canopy post, close
    else if (view === 'behind') { rr(g, -60, -200, 260, E.H + 400, 10); g.fillStyle = '#030405'; g.fill(); }                                   // the camera's own housing edge
    else { g.fillStyle = '#040506'; g.fillRect(E.W - 120, -E.H, 260, E.H * 3); }
    g.restore();
  });
  FX.dust(g, t * 0.4, { count: 20, color: TUBE, a: 0.14, seed: 51 }); FX.dust(g, t * 1.1 + 2, { count: 7, color: TUBE, a: 0.2, seed: 53 });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const W = g.canvas.width, H = g.canvas.height;
  g.fillStyle = radGrad(g, W / 2, H * 0.45, Math.min(W, H) * 0.35, Math.max(W, H) * 0.75, ['rgba(0,0,0,0)', 'rgba(0,2,4,.72)']); g.fillRect(0, 0, W, H); g.restore();
}
