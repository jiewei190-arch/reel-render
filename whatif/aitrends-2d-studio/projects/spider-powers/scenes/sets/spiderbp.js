// sets/spiderbp.js — SCIENCE BLUEPRINTS for What If ep 4 "What If You Had Spider Powers?", bp.js style (navy board, light-blue line
// art, cream detail, GOLD for every label and number). Draw on a bp.board(); every piece takes k = draw-on 0..1 and returns anchor points
// so a shot can attach bp.label() leaders. Facts and wording follow whatif/what-if-spider/sources.md (legal: no franchise anything).
//
// RULE 1 sticking
//   footHairs(g, t, { x, y, s, k, zoom: 0..2 (0 foot tuft, 1 one hair, 2 its setule tips on the wall), grip: 0..1 }) -> { foot, hair, setule, tip, wall }
//   vdw(g, t, { x, y, w, k, gap: 0..1 }) -> { gap }          molecules nanometres apart, faint attraction arrows ("van der Waals")
//   tipTally(g, t, { x, y, k })                              "HUNDREDS OF THOUSANDS OF TIPS" + ">170x ITS WEIGHT (estimate)" plate
// RULE 2 size
//   squareCube(g, t, { x, y, s, k, grow: 0..1 }) -> { small, big }   a cube doubling in height: area x4, weight x8 (readouts tick up)
//   padShare(g, t, { x, y, w, h, k, human: 0..1 }) -> { mite, gecko, human, shoe }  225 species, mite -> gecko pad share (~200-fold),
//       the gecko SIZE LIMIT, and a human needing ~40% of the body as pads or US size 114 shoes
// RULE 3 silk
//   silkGland(g, t, { x, y, s, k, pull: 0..1 }) -> { gland, duct, spinneret, fibre }   liquid protein in the gland -> solid fibre as it is drawn
//   silkVsSteel(g, t, { x, y, w, k, show: 0..3 }) -> { balance, kevlar, density }   1 weight-for-weight balance (rivals steel), 2 toughness
//       vs Kevlar (2-3x), 3 density bars (steel ~7.8 vs silk ~1.3 g/cm3: thread for thread steel wins)
// RULE 4 sensing
//   trichobothria(g, t, { x, y, s, k, air: 0..1 }) -> { hair, leg }   long fine hairs on a leg segment bending in a puff of air
//   hearing(g, t, { x, y, w, k, d: 0..1, hum: 0..1 }) -> { spider, edge }   sound to 3 m (~600 body lengths) via leg hairs, the 90 Hz hum: most froze
//   eyes8(g, t, { x, y, s, k, fov: 0..1 }) -> { front, side }   top view of the head: 8 eyes, the front pair's narrow telephoto cones + wide motion arcs
// RULE 5 jumping
//   legPump(g, t, { x, y, s, k, press: 0..1 }) -> { joint, flexor, fluid }   flexor muscle only; fluid pressure straightens the joint
//   jumpBars(g, t, { x, y, w, k, debate: 0..1 }) -> { spider, human, stamp }   6 body lengths vs ~1.5, and a 'STILL DEBATED' stamp
// All deterministic (t, rng). Colours from S().ui.
import { E, V, S, clamp, lerp, prog, ease, rng, seg, circle, ring, rr, poly, alpha, mix, shade, glow, text, FONTS } from '/engine/core.js';
import { draw } from './bp.js';

const ui = () => S().ui;
const lbl = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? V(30, 34), color: o.color ?? ui().gold, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1, glow: 10, glowColor: alpha(o.color ?? ui().gold, 0.45) });
const cream = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 28, color: ui().cream, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1 });
const arrow = (g, x0, y0, x1, y1, col, w = 5, k = 1) => { if (k <= 0.01) return; const x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y - y0, x - x0); seg(g, [[x0, y0], [x, y]], w, col); poly(g, [[x + Math.cos(a) * 16, y + Math.sin(a) * 16], [x + Math.cos(a + 2.5) * 16, y + Math.sin(a + 2.5) * 16], [x + Math.cos(a - 2.5) * 16, y + Math.sin(a - 2.5) * 16]], col); };

// =====================================================================================================
// RULE 1: hairy feet + van der Waals
// =====================================================================================================
export function footHairs(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, zoom = clamp(o.zoom ?? 0, 0, 2), grip = clamp(o.grip ?? 1), r = rng(o.seed ?? 3);
  const wallY = y + 220 * s, A = { wall: [x + 300 * s, wallY] };
  draw(g, [[x - 420 * s, wallY], [x + 420 * s, wallY]], k, { w: 5, color: U.cream }); for (let i = 0; i < 14; i++) seg(g, [[x - 400 * s + i * 60 * s, wallY], [x - 420 * s + i * 60 * s, wallY + 24 * s]], 2, alpha(U.cream, 0.4 * k));
  const f0 = clamp(1 - zoom), f1 = clamp(1 - Math.abs(zoom - 1)), f2 = clamp(zoom - 1);
  // zoom 0: the leg tip with its tuft of hairs (scopula) on the wall
  if (f0 > 0.01) { g.save(); g.globalAlpha *= f0; draw(g, [[x - 260 * s, y - 380 * s], [x - 60 * s, y - 80 * s], [x + 10 * s, y + 150 * s]], k, { w: 10 * s, color: U.blueprint });
    for (let i = 0; i < 24; i++) { const a = -1.9 + i * 0.12, L = (60 + r() * 30) * s, ex = x + 10 * s + Math.cos(a) * L * 0.5, ey = Math.min(wallY - 2, y + 150 * s + Math.sin(-a) * L * 0.2 + L * 0.8); if (k > 0.5) seg(g, [[x + 10 * s, y + 150 * s], [ex, ey]], 2.5, alpha(U.cream, clamp((k - 0.5) * 2))); }
    A.foot = [x + 10 * s, y + 170 * s]; g.restore(); }
  // zoom 1: one hair, covered in much finer hairs (setules)
  if (f1 > 0.01) { g.save(); g.globalAlpha *= f1; const hx0 = x - 380 * s, hx1 = x + 300 * s, hy = y - 60 * s, bend = (u) => hy + Math.sin(u * Math.PI * 0.5) * 230 * s;
    const pts = Array.from({ length: 30 }, (_, i) => { const u = i / 29; return [lerp(hx0, hx1, u), bend(u)]; }); draw(g, pts, k, { w: 16 * s, color: U.blueprint });
    for (let i = 2; i < 28; i++) { const u = i / 29, px = lerp(hx0, hx1, u), py = bend(u); for (const sd of [-1, 1]) seg(g, [[px, py + sd * 6 * s], [px + 18 * s, py + sd * 26 * s]], 2, alpha(U.cream, 0.7 * clamp(k * 2 - 1))); }
    A.hair = [lerp(hx0, hx1, 0.4), bend(0.4)]; A.setule = [lerp(hx0, hx1, 0.75), bend(0.75) - 22 * s]; g.restore(); }
  // zoom 2: setule tips flattened on the wall, each a tiny contact
  if (f2 > 0.01) { g.save(); g.globalAlpha *= f2; for (let i = 0; i < 11; i++) { const sx = x - 360 * s + i * 72 * s, top = y - 200 * s, gk = grip;
      draw(g, [[sx, top], [sx + 10 * s, lerp(top + 200 * s, wallY - 30 * s, gk)], [sx + 4 * s, wallY - 10 * s * (1 - gk)]], k, { w: 7 * s, color: U.blueprint });
      g.fillStyle = alpha(U.gold, 0.75 * gk); g.beginPath(); g.ellipse(sx + 12 * s, wallY - 4 * s, 22 * s, 6 * s, 0, 0, 7); g.fill(); }
    A.tip = [x - 360 * s + 5 * 72 * s + 12 * s, wallY - 4 * s]; g.restore(); }
  return A;
}
export function vdw(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 700, k = 1 } = o, gap = 26 + 30 * clamp(o.gap ?? 0.3), r = 22;
  for (const [row, col] of [[-1, U.blueprint], [1, U.cream]]) for (let i = 0; i < 7; i++) { const cx = x - w / 2 + 50 + i * (w - 100) / 6, cy = y + row * (gap / 2 + r); const kk = clamp(k * 2 - i * 0.12); if (kk <= 0) continue; ring(g, cx, cy, r * kk, 4, col); circle(g, cx, cy, 5, col); }
  const ak = clamp(k * 2 - 1); for (let i = 0; i < 7; i++) { const cx = x - w / 2 + 50 + i * (w - 100) / 6, p = 0.6 + 0.4 * Math.sin(t * 4 + i); g.save(); g.setLineDash([6, 6]); seg(g, [[cx, y - gap / 2 + 2], [cx, y + gap / 2 - 2]], 2.5, alpha(U.gold, 0.8 * ak * p)); g.restore(); }
  return { gap: [x + w / 2 - 50, y] };
}
export function tipTally(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, k = 1 } = o; if (k <= 0.01) return; const p = ease.outBack(clamp(k));
  g.save(); g.translate(x, y); g.scale(p, p); rr(g, -330, -90, 660, 180, 22); g.fillStyle = 'rgba(10,16,32,.9)'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke();
  lbl(g, 'HUNDREDS OF THOUSANDS OF TIPS', 0, -36, { size: 30 }); cream(g, 'ESTIMATE: HOLDS > 170x ITS WEIGHT', 0, 34, { size: 28 }); g.restore();
}

// =====================================================================================================
// RULE 2: the square-cube law + the pad-area problem
// =====================================================================================================
export function squareCube(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, gr = ease.inOut(clamp(o.grow ?? 1)), L0 = 120 * s, L = lerp(L0, L0 * 2, gr), base = y + 200 * s;
  const cube = (cx, l, col, kk) => { const d = l * 0.45; const P = [[cx - l / 2, base], [cx + l / 2, base], [cx + l / 2, base - l], [cx - l / 2, base - l]];
    draw(g, [...P, P[0]], kk, { w: 5, color: col }); draw(g, [P[3], [P[3][0] + d, P[3][1] - d], [P[2][0] + d, P[2][1] - d], P[2]], kk, { w: 4, color: col }); draw(g, [[P[2][0] + d, P[2][1] - d], [P[1][0] + d, P[1][1] - d], P[1]], kk, { w: 4, color: col }); };
  const sx = x - 260 * s, bx = x + 160 * s; cube(sx, L0, U.cream, k); cube(bx, L, U.blueprint, k);
  const ak = clamp(k * 2 - 1); if (ak > 0) { const area = Math.round(lerp(1, 4, gr) * 10) / 10, vol = Math.round(lerp(1, 8, gr) * 10) / 10;
    cream(g, 'HEIGHT x2', bx, base + 50 * s, { alpha: ak }); lbl(g, `AREA x${area % 1 ? area.toFixed(1) : area}`, bx + L * 0.8, base - L * 0.35, { align: 'left', alpha: ak }); lbl(g, `WEIGHT x${vol % 1 ? vol.toFixed(1) : vol}`, bx + L * 0.8, base - L * 0.35 - 52, { align: 'left', alpha: ak, color: U.accent }); }
  return { small: [sx, base - L0], big: [bx, base - L] };
}
export function padShare(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1300, h = 520, k = 1 } = o, hk = clamp(o.human ?? 0), x0 = x - w / 2, y1 = y + h / 2;
  // log-ish axis: body weight (mite -> gecko), rising share of body as sticky pad, 225 species as dots
  draw(g, [[x0, y1 - h], [x0, y1], [x0 + w * 0.62, y1]], ease.out(clamp(k * 2)), { w: 4, color: U.cream });
  cream(g, 'BODY WEIGHT', x0 + w * 0.31, y1 + 40, { alpha: clamp(k * 2) }); cream(g, 'PAD AREA', x0 + 10, y1 - h - 30, { align: 'left', alpha: clamp(k * 2) });
  const r = rng(225), dk = clamp(k * 1.6 - 0.3); for (let i = 0; i < 225 * dk; i++) { const u = r(), px = x0 + 20 + u * w * 0.58, py = y1 - 20 - (u ** 1.6) * h * 0.8 + (r() - 0.5) * 50; circle(g, px, py, 4, alpha(U.blueprint, 0.75)); }
  if (k > 0.6) { lbl(g, '225 SPECIES', x0 + w * 0.2, y1 - h * 0.75, { alpha: clamp((k - 0.6) * 3) }); }
  const gx = x0 + w * 0.6, gy = y1 - h * 0.82, A = { mite: [x0 + 30, y1 - 30], gecko: [gx, gy] };
  if (k > 0.7) { const a = clamp((k - 0.7) * 3); g.save(); g.globalAlpha *= a; g.setLineDash([12, 10]); seg(g, [[gx + 20, y1], [gx + 20, y1 - h]], 3, U.gold); g.restore(); lbl(g, 'GECKO: THE SIZE LIMIT', gx + 30, y1 - h - 30, { align: 'left', alpha: a }); }
  // the human: a line figure with 40% of its body shaded as pad, and a giant shoe
  if (hk > 0.01) { const hx = x0 + w * 0.73, hb = y1, H = h * 0.9, p = ease.out(hk); g.save(); g.globalAlpha *= p;
    ring(g, hx, hb - H + 40, 34, 5, U.cream); draw(g, [[hx, hb - H + 74], [hx, hb - H * 0.45]], 1, { w: 6, color: U.cream }); draw(g, [[hx - 80, hb - H * 0.78], [hx, hb - H + 110], [hx + 80, hb - H * 0.78]], 1, { w: 5, color: U.cream });
    draw(g, [[hx - 40, hb - 60], [hx, hb - H * 0.45], [hx + 40, hb - 60]], 1, { w: 5, color: U.cream });
    g.fillStyle = alpha(U.gold, 0.35); rr(g, hx - 50, hb - H * 0.45 - 4, 100, H * 0.45 - 50, 16); g.fill();                                          // ~40% of the body shaded
    rr(g, hx - 80, hb - 64, 260, 64, 30); g.fillStyle = alpha(U.accent, 0.5); g.fill(); g.strokeStyle = U.accent; g.lineWidth = 4; g.stroke();        // the giant shoe
    lbl(g, '~40% OF YOUR BODY', hx + 70, hb - H * 0.3, { align: 'left' }); lbl(g, 'OR US SIZE 114 SHOES', hx + 50, hb + 44, { color: U.accent });
    g.restore(); A.human = [hx, hb - H * 0.3]; A.shoe = [hx + 50, hb - 32]; }
  return A;
}

// =====================================================================================================
// RULE 3: silk
// =====================================================================================================
export function silkGland(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, pull = clamp(o.pull ?? 0);
  // the abdomen (rear body section) in outline, a gland inside, the duct to the spinneret at the back end
  draw(g, Array.from({ length: 49 }, (_, i) => { const a = i / 48 * Math.PI * 2; return [x + Math.cos(a) * 300 * s, y + Math.sin(a) * 200 * s]; }), k, { w: 5, color: U.blueprint });
  const gk = clamp(k * 1.6 - 0.4), gx = x - 80 * s, gy = y; if (gk > 0) { g.save(); g.globalAlpha *= gk; g.fillStyle = alpha('#6fb8ff', 0.35); g.beginPath(); g.ellipse(gx, gy, 120 * s, 80 * s, 0, 0, 7); g.fill(); 
    g.strokeStyle = U.cream; g.lineWidth = 4; g.beginPath(); g.ellipse(gx, gy, 120 * s, 80 * s, 0, 0, 7); g.stroke(); for (let i = 0; i < 5; i++) { const u = (t * 0.4 + i / 5) % 1; circle(g, gx - 80 * s + u * 160 * s, gy + Math.sin(i * 2 + t) * 30 * s, 6 * s, alpha('#bfe0ff', 0.8)); } g.restore(); }
  const duct = [[gx + 120 * s, gy], [x + 180 * s, y + 40 * s], [x + 260 * s, y + 120 * s], [x + 300 * s, y + 160 * s]]; draw(g, duct, gk, { w: 10 * s, color: alpha('#6fb8ff', 0.8) });
  // the spinneret + the fibre drawn out: liquid blue in the duct turns to a hard cream line outside
  const sp = [x + 300 * s, y + 160 * s]; if (gk > 0.5) { poly(g, [[sp[0] - 18 * s, sp[1] - 18 * s], [sp[0] + 30 * s, sp[1] + 10 * s], [sp[0] - 4 * s, sp[1] + 26 * s]], U.blueprint); }
  const fl = 380 * s * ease.out(pull), fx = sp[0] + fl * 0.7, fy = sp[1] + fl * 0.7; if (pull > 0.01) { seg(g, [sp, [lerp(sp[0], fx, 0.15), lerp(sp[1], fy, 0.15)]], 6 * s, alpha('#6fb8ff', 0.85)); seg(g, [[lerp(sp[0], fx, 0.15), lerp(sp[1], fy, 0.15)], [fx, fy]], 3.5 * s, U.cream); circle(g, fx, fy, 4, U.cream); }
  return { gland: [gx, gy - 80 * s], duct: [x + 220 * s, y + 80 * s], spinneret: sp, fibre: [lerp(sp[0], fx, 0.7), lerp(sp[1], fy, 0.7)] };
}
export function silkVsSteel(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1200, k = 1 } = o, show = o.show ?? 1, A = {};
  // 1: weight-for-weight balance: a spool of silk vs a small steel bar of the same weight, the beam level, "rivals steel"
  const b = clamp(show) * k; if (b > 0.01) { g.save(); g.globalAlpha *= b; const bx = x - w * 0.3, by = y - 40, tilt = 0.02 * Math.sin(t * 1.5);
    poly(g, [[bx, by], [bx - 30, by + 160], [bx + 30, by + 160]], alpha(U.blueprint, 0.9)); g.save(); g.translate(bx, by); g.rotate(tilt); seg(g, [[-220, 0], [220, 0]], 6, U.cream);
    for (const [sd, name] of [[-1, 'SILK'], [1, 'STEEL']]) { seg(g, [[sd * 200, 0], [sd * 200, 70]], 3, U.cream); seg(g, [[sd * 200 - 70, 70], [sd * 200 + 70, 70]], 5, U.cream);
      if (sd < 0) { for (let i = 0; i < 6; i++) ring(g, sd * 200, 40 - i * 4, 34 - i * 3, 2, alpha(U.cream, 0.8)); } else { rr(g, sd * 200 - 40, 44, 80, 24, 4); g.fillStyle = alpha(U.blueprint, 0.6); g.fill(); }
      cream(g, name, sd * 200, 110); } g.restore();
    lbl(g, 'WEIGHT FOR WEIGHT: RIVALS STEEL', bx, by + 220); g.restore(); A.balance = [bx, by]; }
  // 2: toughness vs Kevlar: two bars, silk 2-3x
  const kk = clamp(show - 1) * k; if (kk > 0.01) { g.save(); g.globalAlpha *= kk; const x0 = x + w * 0.08, yy = y - 170, W2 = w * 0.38, e = ease.out(kk);
    cream(g, 'TOUGHNESS', x0, yy - 50, { align: 'left' }); for (const [i, name, v, col] of [[0, 'KEVLAR', 1, U.blueprint], [1, 'DRAGLINE SILK', 2.5, U.gold]]) { rr(g, x0, yy + i * 80, W2 * v / 2.5 * e, 50, 10); g.fillStyle = alpha(col, 0.7); g.fill(); cream(g, name, x0 + 10, yy + i * 80 + 26, { align: 'left', size: 26 }); }
    lbl(g, 'TOUGHER THAN KEVLAR (2-3x)', x0, yy + 200, { align: 'left' }); g.restore(); A.kevlar = [x0 + W2, yy + 105]; }
  // 3: density: steel ~7.8 vs silk ~1.3 g/cm3 (~6x lighter): thread for thread, steel still wins
  const dk = clamp(show - 2) * k; if (dk > 0.01) { g.save(); g.globalAlpha *= dk; const x0 = x + w * 0.08, yy = y + 140, W2 = w * 0.38, e = ease.out(dk);
    cream(g, 'DENSITY (g/cm³)', x0, yy - 40, { align: 'left' }); for (const [i, name, v] of [[0, 'STEEL ~7.8', 7.8], [1, 'SILK ~1.3', 1.3]]) { rr(g, x0, yy + i * 70, W2 * v / 7.8 * e, 44, 10); g.fillStyle = alpha(i ? U.gold : U.blueprint, 0.7); g.fill(); cream(g, name, x0 + W2 * v / 7.8 * e + 14, yy + i * 70 + 22, { align: 'left', size: 26 }); }
    lbl(g, 'THREAD FOR THREAD, STEEL WINS', x0, yy + 180, { align: 'left', color: U.cream }); g.restore(); A.density = [x0 + W2 * 0.2, yy + 92]; }
  return A;
}

// =====================================================================================================
// RULE 4: feeling the air, hearing, eight eyes
// =====================================================================================================
export function trichobothria(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, air = clamp(o.air ?? 0);
  draw(g, [[x - 460 * s, y + 60 * s], [x + 460 * s, y - 20 * s]], k, { w: 46 * s, color: alpha(U.blueprint, 0.85) });                 // the leg segment
  const hk = clamp(k * 1.6 - 0.5), A = { leg: [x - 300 * s, y + 50 * s] };
  for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, bx = lerp(x - 400 * s, x + 400 * s, u), by = lerp(y + 40 * s, y - 30 * s, u) - 20 * s, L = (150 + (i % 3) * 30) * s;
    const bend = air * (0.5 + 0.5 * Math.sin(t * 6 - i * 0.6)) * 0.7 + 0.05 * Math.sin(t * 3 + i), tx = bx + Math.sin(bend) * L, ty = by - Math.cos(bend) * L;
    if (hk > 0) { ring(g, bx, by, 8 * s, 3, U.cream); seg(g, [[bx, by], [lerp(bx, tx, 0.5) + bend * 10, lerp(by, ty, 0.5)], [tx, ty]], 2.5, alpha(U.cream, hk)); } if (i === 3) A.hair = [tx, ty]; }
  if (air > 0.02) for (let j = 0; j < 4; j++) { const u = (t * 0.8 + j / 4) % 1, ax = x - 600 * s + u * 500 * s, ay = y - 160 * s + j * 30 * s; g.save(); g.globalAlpha *= air * Math.sin(u * Math.PI); arrow(g, ax, ay, ax + 120 * s, ay, alpha('#bfe0ff', 0.9), 3); g.restore(); }
  return A;
}
export function hearing(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1300, k = 1 } = o, d = clamp(o.d ?? 1), hum = clamp(o.hum ?? 0), x0 = x - w / 2, x1 = x0 + w * 0.9;
  // a tiny spider at the left, sound waves from a speaker at the right, the 3 m scale between
  const sx = x0 + 40; circle(g, sx, y, 14, U.cream); circle(g, sx + 20, y - 4, 9, U.cream); for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) seg(g, [[sx, y], [sx - 14 + i * 10, y + sd * 26]], 2.5, U.cream);
  draw(g, [[sx, y + 70], [lerp(sx, x1, d), y + 70]], k, { w: 4, color: U.gold }); for (let i = 0; i <= 3; i++) { const tx = lerp(sx, x1, i / 3); if (i / 3 <= d) { seg(g, [[tx, y + 58], [tx, y + 82]], 3, U.gold); cream(g, `${i} m`, tx, y + 110, { size: 26 }); } }
  const spk = [x1, y]; if (k > 0.4) { rr(g, spk[0] - 20, spk[1] - 50, 60, 100, 10); g.strokeStyle = U.cream; g.lineWidth = 4; g.stroke(); for (let i = 0; i < 6; i++) { const u = (t * 0.6 + i / 6) % 1, rad = u * (spk[0] - sx) * d; g.strokeStyle = alpha(U.blueprint, 0.7 * (1 - u)); g.lineWidth = 3; g.beginPath(); g.arc(spk[0] - 20, spk[1], rad, Math.PI * 0.8, Math.PI * 1.2); g.stroke(); } }
  if (d >= 0.99) lbl(g, '3 m  ≈ 600 BODY LENGTHS', (sx + x1) / 2, y - 120);
  if (hum > 0.01) { g.save(); g.globalAlpha *= hum; lbl(g, '90 Hz HUM (A WASP\'S WINGBEAT): MOST FROZE', (sx + x1) / 2, y + 190, { color: U.accent }); g.restore(); }
  return { spider: [sx + 20, y - 20], edge: [x1, y] };
}
export function eyes8(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, fv = clamp(o.fov ?? 1);
  // the head from above: front at the top. Two big principal eyes, two smaller beside them, four on the sides/back
  draw(g, Array.from({ length: 41 }, (_, i) => { const a = -Math.PI / 2 + i / 40 * Math.PI * 2; return [x + Math.cos(a) * 170 * s, y + Math.sin(a) * 210 * s]; }), k, { w: 5, color: U.blueprint });
  const ek = clamp(k * 2.2 - 1.2), E8 = [[-46, -170, 38], [46, -170, 38], [-118, -140, 18], [118, -140, 18], [-150, -30, 14], [150, -30, 14], [-140, 70, 16], [140, 70, 16]];
  // fields of view: the front pair's narrow telephoto cones, the others' wide motion arcs almost all the way round
  if (fv > 0.01) { g.save(); g.globalAlpha *= fv * ek;
    for (let i = 2; i < 8; i++) { const [ex, ey] = E8[i], a0 = Math.atan2(ey, ex); g.fillStyle = alpha(U.blueprint, 0.1); g.beginPath(); g.moveTo(x + ex * s, y + ey * s); g.arc(x + ex * s, y + ey * s, 420 * s * fv, a0 - 0.75, a0 + 0.75); g.closePath(); g.fill(); }
    for (let i = 0; i < 2; i++) { const [ex, ey] = E8[i]; g.fillStyle = alpha(U.gold, 0.25); g.beginPath(); g.moveTo(x + ex * s, y + ey * s); g.lineTo(x + ex * s - 34 * s, y + ey * s - 640 * s * fv); g.lineTo(x + ex * s + 34 * s, y + ey * s - 640 * s * fv); g.closePath(); g.fill(); }
    g.restore(); }
  E8.forEach(([ex, ey, r], i) => { if (ek > i * 0.08) { circle(g, x + ex * s, y + ey * s, r * s, i < 2 ? alpha(U.gold, 0.85) : alpha(U.cream, 0.8)); circle(g, x + ex * s - r * 0.3 * s, y + ey * s - r * 0.3 * s, r * 0.25 * s, '#ffffff'); } });
  return { front: [x, y - 220 * s - 300 * s * fv], side: [x + 150 * s + 300 * s * fv, y + 20 * s] };
}

// =====================================================================================================
// RULE 5: hydraulic legs + the jump
// =====================================================================================================
export function legPump(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, pr = ease.inOut(clamp(o.press ?? 0)), ang = lerp(1.1, 0.12, pr);
  // upper segment fixed, the joint, the lower segment swinging straight as the fluid pressure rises
  const j = [x, y], a0 = [x - 380 * s, y - 120 * s], b = [x + Math.cos(ang) * 400 * s, y + Math.sin(ang) * 400 * s];
  draw(g, [a0, j], k, { w: 56 * s, color: alpha(U.blueprint, 0.8) }); draw(g, [j, b], k, { w: 46 * s, color: alpha(U.blueprint, 0.8) }); ring(g, j[0], j[1], 34 * s, 5, U.cream);
  const mk = clamp(k * 1.6 - 0.5); if (mk > 0) { const m0 = [x - 260 * s, y - 70 * s], m1 = [x + Math.cos(ang) * 120 * s - 10 * s, y + Math.sin(ang) * 120 * s + 30 * s]; g.save(); g.globalAlpha *= mk; seg(g, [m0, [lerp(m0[0], m1[0], 0.5), lerp(m0[1], m1[1], 0.5) + 30 * s], m1], 16 * s, alpha(U.accent, 0.7)); g.restore(); }
  // fluid (haemolymph) arrows pushing into the joint
  if (pr > 0.02) for (let i = 0; i < 4; i++) { const u = (t * 1.2 + i / 4) % 1, px = lerp(a0[0] + 40 * s, j[0] - 40 * s, u), py = lerp(a0[1] + 12 * s, j[1] - 12 * s, u); circle(g, px, py, 10 * s * pr, alpha('#6fb8ff', 0.85 * Math.sin(u * Math.PI))); }
  if (pr > 0.02) glow(g, j[0], j[1], 110 * s, '#6fb8ff', 0.35 * pr);
  return { joint: [j[0], j[1] - 40 * s], flexor: [x - 140 * s, y - 40 * s], fluid: [lerp(a0[0], j[0], 0.5), lerp(a0[1], j[1], 0.5) - 30 * s] };
}
export function jumpBars(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1100, k = 1 } = o, x0 = x - w / 2, BL = w / 7, e = ease.out(clamp(k));
  cream(g, 'STANDING JUMP, IN BODY LENGTHS', x0, y - 190, { align: 'left' });
  for (const [i, name, v, col] of [[0, 'JUMPING SPIDER', 6, U.gold], [1, 'BEST HUMANS', 1.5, U.blueprint]]) { const yy = y - 120 + i * 130, L = BL * v * e;
    rr(g, x0, yy, L, 64, 12); g.fillStyle = alpha(col, 0.7); g.fill(); for (let j = 1; j < v * e; j++) seg(g, [[x0 + j * BL, yy + 6], [x0 + j * BL, yy + 58]], 2, alpha('#0b1324', 0.6));
    cream(g, name, x0 + 12, yy - 20, { align: 'left', size: 26 }); if (e > 0.9) lbl(g, i ? '~1.5' : 'UP TO 6', x0 + L + 20, yy + 34, { align: 'left' }); }
  const dk = ease.outBack(clamp(o.debate ?? 0)); if (dk > 0.01) { g.save(); g.translate(x + w * 0.32, y + 200); g.rotate(-0.12); g.scale(dk, dk); rr(g, -220, -46, 440, 92, 12); g.strokeStyle = U.accent; g.lineWidth = 6; g.stroke(); text(g, 'STILL DEBATED', 0, 4, { size: 54, color: U.accent, font: FONTS.title, weight: 700, spacing: 4 }); g.restore(); }
  return { spider: [x0 + BL * 6 * e, y - 88], human: [x0 + BL * 1.5 * e, y + 42], stamp: [x + w * 0.32, y + 200] };
}
