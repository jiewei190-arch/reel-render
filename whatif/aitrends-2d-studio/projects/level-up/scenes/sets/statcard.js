// sets/statcard.js — ep 5 "What If You Could Level Up Your Strength Every Day?": our ORIGINAL HUD (STYLE.md sections 4, 5, 7).
// LEGAL (STYLE.md DO/DON'T): our own design. Rounded chunky glass card, gold badge, dumbbell, chevron bar. No title-bar box, no corner
// brackets, no square brackets, no terminal lettering. Words on the card: the level, STR, kg, the script's coral one-liners, "LEVEL UP!".
// Never "System", "Player", "Quest", "Notification", "Penalty", "Reward", ranks or letter grades. Nothing but the card ever comes out of the Zip.
//
// PALETTE  PAL.ink #0B0F1A  cyan #3FE0FF  cyan2 #1A9FD6  glass #123A5E (~55%)  gold #FFC93C  goldHi #FFF3C4  coral #FF6B5B
//
// THE ZIP (a small zipper-edged tear in the air, about a cereal bowl wide)
//   zip(g, t, x, y, { w = 280, open: 0..1, s = 1, sparks = 1, seed })   the slider runs left -> right and the tear opens behind it:
//       gold zipper teeth on both lips, soft cyan light inside with drifting gold specks (no depth, nothing behind it), sparks off the slider.
//       open 0 = only a faint stitched seam in the air. Returns { mouth: [x, y] } (where the card comes out).
//   zipOpen(t, at, { dur = 0.35, close = Infinity, closeDur = 0.3 }) -> 0..1   the open amount for a zip that opens at `at`, shuts at `close`
//
// THE STAT CARD
//   statCard(g, t, { x, y, s = 1, lv = 7, str = 101, unit = 'kg', xp = 0..1, warn: 'Bones: not included.', warnAt,
//                    unfold = 1 (0..1 out of the Zip), from: [x, y] (the Zip mouth), tilt = -0.06, bob = 1,
//                    spin: 0..1 (badge flip, see levelSpin), lvPrev, xpSnap: 0..1 (white flash on a full bar), reflect = 1 })
//       -> { badge: [x, y], str: [x, y], bar: [x0, y, x1], w, h }
//     lv and str may be floats while rolling: they are drawn as an odometer (the next value slides up from below).
//   roll(t, from, to, at, dur = 0.8) -> number   ease-out roll-up (pass the result as lv or str)
//   levelSpin(t, at, dur = 0.5) -> 0..1          the badge's coin-flip (the number swaps at the half)
//   xpFill(t, { from = 0.2, to = 1, at0, at1, snap })  -> { xp, xpSnap }   fills, then at `snap` flashes full and resets to 0
//
// THE LEVEL-UP POP
//   levelUp(g, t, at, { x = E.W/2, y = E.H*0.3, s = 1, str = 'LEVEL UP!', hold = 1.6 })   gold chunky slanted text, 1.15x overshoot
//       snap, a rotating starburst behind, sparks drifting off; fades after `hold` seconds
//   levelFlash(g, t, at, { a = 0.7, dur = 0.28 })   the white-gold flash frame (#FFF3C4) over the whole frame (draw LAST)
//   levelShake(t, at, amp = 3) -> [dx, dy]          2-3 px camera shake for ~0.3 s after `at` (add to cam.x / cam.y)
//   freeze(t, at, frames = 5) -> t'                 a 4-6 frame freeze on the pop (feed t' to everything that should hold)
//   sparks(g, t, at, x, y, { n = 26, s = 1, seed, spread, up })   a gold spark burst at `at` (gravity, twinkle)
//
// ALL OF THE RECIPE (STYLE.md section 5) IN ONE CALL
//   morningPop(g, t, { at, zipX, zipY, cardX, cardY, s, lv: [6, 7], str: [95, 101], warn, warnAt, close, pop = true })
//       -> { shake: [dx, dy], card }   zip opens at `at`, card unfolds +0.3, bar snaps full +0.85, badge flips + STR rolls +0.95,
//       flash + LEVEL UP! +1.15, card folds back + zip shuts at `close`. Call levelFlash yourself last (or pass flash: true).
//
// BISCUIT'S TINY VERSION
//   miniCard(g, t, { x, y, s = 0.5, lv = 1, str = 0.4, unit = 'kg', unfold = 1, from, warn })   a small pill: badge + STR, no bar
//   (pair with zip(g, t, x, y, { w: 90, s: 1 }) for the final tiny Zip over Biscuit's head)
//
// dumbbell(g, x, y, s, col)   the cyan dumbbell icon (centred, ~74 px wide at s 1)
import { E, clamp, lerp, ease, prog, rng, noise, rr, seg, poly, circle, alpha, mix, glow, linGrad, radGrad, text, measure, FONTS } from '/engine/core.js';

export const PAL = { ink: '#0B0F1A', navy: '#141B2D', cyan: '#3FE0FF', cyan2: '#1A9FD6', glass: '#123A5E', gold: '#FFC93C', goldHi: '#FFF3C4', goldDk: '#C98A12', coral: '#FF6B5B', violet: '#7B5CFF' };
const F = FONTS.title;   // Fredoka: the chunky rounded sans already in the kit

// ---------------------------------------------------------------- timing helpers
export const roll = (t, from, to, at, dur = 0.8) => lerp(from, to, ease.out(prog(t, at, at + dur)));
export const levelSpin = (t, at, dur = 0.5) => prog(t, at, at + dur);
export const zipOpen = (t, at, o = {}) => { const d = o.dur ?? 0.35, c = o.close ?? Infinity, cd = o.closeDur ?? 0.3; return ease.inOut(prog(t, at, at + d)) * (isFinite(c) ? 1 - ease.inOut(prog(t, c, c + cd)) : 1); };
export const freeze = (t, at, frames = 5) => { const d = frames / (E.fps || 24); return t < at ? t : t < at + d ? at : t - d; };
export const levelShake = (t, at, amp = 3) => { const u = t - at; if (u < 0 || u > 0.32) return [0, 0]; const k = amp * (1 - u / 0.32); return [noise(t * 60, 5) * k, noise(t * 60, 11) * k]; };
export function xpFill(t, o = {}) {
  const from = o.from ?? 0.2, to = o.to ?? 1, a0 = o.at0 ?? 0, a1 = o.at1 ?? 1, sn = o.snap ?? Infinity;
  if (t < sn) return { xp: lerp(from, to, ease.inOut(prog(t, a0, a1))), xpSnap: 0 };
  const u = t - sn; return { xp: u < 0.22 ? 1 : 0.02 * ease.out(prog(u, 0.22, 0.9)), xpSnap: clamp(1 - u / 0.35) };
}

// ---------------------------------------------------------------- small pieces
export function dumbbell(g, x, y, s = 1, col = PAL.cyan) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col;
  rr(g, -22, -4.5, 44, 9, 4.5); g.fill();                                                   // bar
  for (const sd of [-1, 1]) { rr(g, sd * 22 - (sd > 0 ? 0 : 12), -20, 12, 40, 5); g.fill(); rr(g, sd * 34 - (sd > 0 ? 0 : 8), -13, 8, 26, 4); g.fill(); }   // plates
  g.restore();
}
function sparkShape(g, x, y, r, col, rot = 0) {   // a four-point twinkle
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr2 = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
  g.closePath(); g.fill(); g.restore();
}
export function sparks(g, t, at, x, y, o = {}) {
  const u = t - at; if (u < 0 || u > 1.6) return; const r = rng(o.seed ?? 7), n = o.n ?? 26, s = o.s ?? 1, spread = o.spread ?? Math.PI * 2, up = o.up ?? -Math.PI / 2;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = up + (r() - 0.5) * spread, v = (180 + r() * 420) * s, life = 0.6 + r() * 0.9, k = u / life; if (k >= 1) { r(); continue; }
    const px = x + Math.cos(a) * v * u * (1 - u * 0.35), py = y + Math.sin(a) * v * u * (1 - u * 0.35) + 260 * s * u * u, tw = 0.6 + 0.4 * Math.sin(t * 30 + i * 3);
    const col = r() > 0.35 ? PAL.gold : PAL.goldHi, rad = (4 + r() * 7) * s * (1 - k) * tw;
    seg(g, [[px, py], [px - Math.cos(a) * 14 * s * (1 - k), py - Math.sin(a) * 14 * s * (1 - k)]], 2 * s, alpha(col, 0.7 * (1 - k)));
    sparkShape(g, px, py, rad, alpha(col, 1 - k), t * 3 + i);
  }
  g.restore();
}

// ---------------------------------------------------------------- THE ZIP
export function zip(g, t, x, y, o = {}) {
  const w = o.w ?? 280, s = o.s ?? 1, op = clamp(o.open ?? 1), r = rng(o.seed ?? 3), hw = w / 2, H = w * 0.16 * Math.min(1, op * 1.4);
  const sx = lerp(-hw, hw, ease.inOut(clamp(op * 1.15)));                                   // slider position
  const lip = (px) => { if (px > sx) return 0; const u = (px + hw) / Math.max(1, sx + hw); return H * Math.pow(Math.sin(Math.PI * u), 0.8) * (sx >= hw - 1 ? 1 : 0.6 + 0.4 * u); };
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot ?? -0.04);
  // the seam: a faint stitched line in the air (always there while the zip is "on")
  const seamA = o.seam ?? 1;
  if (seamA > 0) { g.setLineDash([6, 7]); seg(g, [[Math.max(sx, -hw), 0], [hw, 0]], 2, alpha(PAL.gold, 0.35 * seamA)); g.setLineDash([]); }
  if (op > 0.01) {
    glow(g, (sx - hw) / 2, 0, w * 0.75, PAL.cyan, 0.22 * op);
    // the mouth: the inside is soft cyan light, flat, with drifting gold specks
    const pts = []; for (let i = 0; i <= 40; i++) { const px = lerp(-hw, sx, i / 40); pts.push([px, -lip(px)]); } for (let i = 40; i >= 0; i--) { const px = lerp(-hw, sx, i / 40); pts.push([px, lip(px)]); }
    g.save(); g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath();
    g.fillStyle = radGrad(g, (sx - hw) / 2, 0, 0, w * 0.55, [PAL.goldHi, mix(PAL.cyan, '#ffffff', 0.35), PAL.cyan2]); g.fill(); g.clip();
    for (let i = 0; i < 18; i++) { const px = lerp(-hw, hw, r()) + Math.sin(t * 1.3 + i) * 10, py = (r() - 0.5) * H * 1.6 - ((t * 20 + i * 13) % 40) + 20; sparkShape(g, px, py, 3 + r() * 4, alpha(PAL.gold, 0.8), t + i); }
    g.restore();
    // zipper teeth along both lips (gold, alternating, tilted with the lip)
    for (const sd of [-1, 1]) for (let px = -hw + 6, i = 0; px < sx - 4; px += 11, i++) {
      const py = sd * lip(px), d = (lip(px + 1) - lip(px - 1)) / 2, a = Math.atan2(sd * d, 1);
      g.save(); g.translate(px + (i % 2) * 2, py); g.rotate(a); g.fillStyle = i % 2 ? PAL.gold : mix(PAL.gold, PAL.goldDk, 0.5); rr(g, -3.5, sd > 0 ? 0 : -9, 7, 9, 2); g.fill(); g.restore();
    }
    seg(g, [[-hw, 0], [-hw - 6, 0]], 4, PAL.gold);                                               // the stop at the start
  }
  // the closed part: interlocked teeth on the seam to the right of the slider
  for (let px = Math.max(sx, -hw) + 8, i = 0; px < hw; px += 11, i++) { g.fillStyle = alpha(i % 2 ? PAL.gold : PAL.goldDk, 0.55 * seamA); rr(g, px - 3.5, i % 2 ? -7 : -2, 7, 9, 2); g.fill(); }
  // the slider + its pull tab (swings as it runs)
  if (op > 0.001 && op < 0.999 || o.slider) {
    const sw = Math.sin(t * 9) * 0.25 + (op < 1 ? 0.35 : 0);
    g.save(); g.translate(sx, 0); g.fillStyle = PAL.gold; rr(g, -9, -11, 18, 22, 6); g.fill(); g.fillStyle = PAL.goldHi; rr(g, -6, -9, 6, 8, 3); g.fill();
    g.rotate(sw); g.fillStyle = PAL.gold; rr(g, -5, 6, 10, 26, 5); g.fill(); g.fillStyle = PAL.ink; rr(g, -2, 16, 4, 10, 2); g.fill(); g.restore();
    glow(g, sx, 0, 70, PAL.gold, 0.6);
  }
  // sparks: gold, off the slider while it runs, and crackling off the lips while open
  if ((o.sparks ?? 1) > 0 && op > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const run = op < 0.999 ? 1 : 0.35, rr3 = rng(Math.floor(t * 24) + 17);
    for (let i = 0; i < 14 * run; i++) {
      const px = op < 0.999 ? sx + (rr3() - 0.3) * 30 : lerp(-hw, hw, rr3()), py = op < 0.999 ? (rr3() - 0.5) * 20 : (rr3() > 0.5 ? 1 : -1) * lip(px);
      const a = rr3() * Math.PI * 2, L = 10 + rr3() * 26; seg(g, [[px, py], [px + Math.cos(a) * L, py + Math.sin(a) * L]], 2, alpha(rr3() > 0.4 ? PAL.gold : PAL.goldHi, 0.9));
      if (rr3() > 0.6) sparkShape(g, px + Math.cos(a) * L, py + Math.sin(a) * L, 5, PAL.goldHi, a);
    }
    g.restore();
  }
  g.restore();
  return { mouth: [x + ((sx - hw) / 2) * s, y], open: op };
}

// ---------------------------------------------------------------- THE STAT CARD
const CW = 620, CH = 236, CR = CH * 0.18, TAB = { x: 22, w: 168, d: 24 };
function cardPath(g, w = CW, h = CH, r = CR) {
  const L = -w / 2, R = w / 2, T = -h / 2, B = h / 2, tx0 = L + r + TAB.x, tx1 = tx0 + TAB.w, d = TAB.d;
  g.beginPath(); g.moveTo(L + r, T); g.arcTo(R, T, R, B, r); g.arcTo(R, B, L, B, r);
  g.lineTo(tx1 + 16, B); g.quadraticCurveTo(tx1, B, tx1 - 6, B + d * 0.6); g.quadraticCurveTo(tx1 - 12, B + d, tx1 - 30, B + d);    // the thicker lower-left tab
  g.lineTo(L + 10, B + d); g.quadraticCurveTo(L, B + d, L, B + d - 12); g.arcTo(L, T, R, T, r); g.closePath();
}
function frost(g, amount) {          // blur what is already on the canvas inside the current clip (real frosted glass)
  if (!g.canvas || !('filter' in g)) return; const m = g.getTransform(), k = Math.hypot(m.a, m.b);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${(amount * k).toFixed(1)}px)`; g.drawImage(g.canvas, 0, 0); g.filter = 'none'; g.restore();
}
// a number drawn as an odometer: the integer part slides up as the value rolls past it
function odo(g, v, x, y, o) {
  const n = Math.floor(v + 1e-6), f = v - n, sz = o.size, fmt = o.fmt ?? (q => String(q)), lh = sz * 1.05;
  if (f < 0.02 || o.still) { const q = o.still ? v : Math.round(v); text(g, fmt(q), x, y, o); return measure(g, fmt(q), sz, o.font, o.weight); }
  const e = ease.inOut(clamp((f - 0.5) * 3 + 0.5));   // mostly sits, then clicks over
  const wA = measure(g, fmt(n), sz, o.font, o.weight), wB = measure(g, fmt(n + 1), sz, o.font, o.weight);
  g.save(); g.beginPath(); const bx = o.align === 'center' ? x - Math.max(wA, wB) / 2 - 10 : x - 10; g.rect(bx, y - lh * 0.55, Math.max(wA, wB) + 20, lh * 1.1); g.clip();
  text(g, fmt(n), x, y - e * lh, { ...o, alpha: (o.alpha ?? 1) * (1 - e) }); text(g, fmt(n + 1), x, y + (1 - e) * lh, o); g.restore();
  return lerp(wA, wB, e);
}
export function statCard(g, t, o = {}) {
  const s = o.s ?? 1, uf = clamp(o.unfold ?? 1), bobA = o.bob ?? 1;
  if (uf <= 0.001) return null;
  const bob = Math.sin(t * 1.7) * 7 * bobA, rot = (o.tilt ?? -0.06) + Math.sin(t * 1.1) * 0.012 * bobA;
  // unfold: a glowing strip shoots out of the zip mouth and opens up (width first, then height with an overshoot)
  const kw = ease.out(prog(uf, 0, 0.45)), kh = ease.outBack(prog(uf, 0.35, 1)), kc = ease.out(prog(uf, 0.6, 1));
  const fx = o.from ? lerp(o.from[0], o.x, ease.inOut(prog(uf, 0, 0.7))) : o.x, fy = o.from ? lerp(o.from[1], o.y, ease.inOut(prog(uf, 0, 0.7))) : o.y;
  const X = fx, Y = fy + bob * kc;
  g.save(); g.translate(X, Y); g.rotate(rot * kc); g.scale(s, s);
  const sxw = lerp(0.12, 1, kw), syh = Math.max(0.03, kh);
  // soft bloom behind
  glow(g, 0, 0, CW * 0.75 * sxw, PAL.cyan, 0.16 * kw);
  g.save(); g.scale(sxw, syh);
  cardPath(g); g.save(); g.clip(); frost(g, 9); g.restore();
  cardPath(g); g.fillStyle = alpha(PAL.glass, 0.55); g.fill();
  g.save(); cardPath(g); g.clip();
  g.fillStyle = linGrad(g, 0, -CH / 2, 0, CH / 2 + TAB.d, [alpha('#5fd8ff', 0.22), alpha(PAL.glass, 0), alpha(PAL.cyan2, 0.18)]); g.fillRect(-CW, -CH, CW * 2, CH * 2);
  // the sheen: a diagonal light sweep on arrival, then slowly every few seconds
  const sw = o.sheen ?? ((uf < 1 ? uf : ((t * 0.22) % 1.6)) * 1.6 - 0.4);
  g.save(); g.rotate(-0.5); g.fillStyle = linGrad(g, -CW * 0.6 + sw * CW * 1.2 - 60, 0, -CW * 0.6 + sw * CW * 1.2 + 60, 0, [alpha('#ffffff', 0), alpha('#ffffff', 0.16), alpha('#ffffff', 0)]); g.fillRect(-CW, -CH * 2, CW * 2, CH * 4); g.restore();
  // a faint scan texture (horizontal hairlines, very soft)
  for (let yy = -CH / 2 + 6; yy < CH / 2 + TAB.d; yy += 6) { g.fillStyle = alpha('#9eeaff', 0.035); g.fillRect(-CW / 2, yy, CW, 1.5); }
  g.restore();
  // the thin cyan frame, with halation (no title bar, no corner brackets)
  g.save(); g.shadowColor = PAL.cyan; g.shadowBlur = 22; cardPath(g); g.strokeStyle = alpha(PAL.cyan, 0.95); g.lineWidth = 3; g.stroke(); g.restore();
  cardPath(g); g.strokeStyle = alpha('#e8fbff', 0.5); g.lineWidth = 1; g.stroke();
  g.restore();
  const out = { w: CW * s, h: CH * s };
  if (kc > 0.01) {
    g.save(); g.globalAlpha *= kc;
    // XP bar of chevrons along the bottom
    const bx0 = -CW / 2 + 128, bx1 = CW / 2 - 36, by = CH / 2 - 40, n = 15, cw = (bx1 - bx0) / n, xp = clamp(o.xp ?? 0.6), sn = clamp(o.xpSnap ?? 0);
    for (let i = 0; i < n; i++) {
      const cx = bx0 + i * cw + cw / 2, on = clamp(xp * n - i), hot = on > 0;
      const pts = [[cx - cw * 0.42, by - 13], [cx - cw * 0.08, by - 13], [cx + cw * 0.36, by], [cx - cw * 0.08, by + 13], [cx - cw * 0.42, by + 13], [cx - cw * 0.02, by]];
      poly(g, pts, alpha('#7fdcff', 0.12));
      if (hot) { g.save(); g.shadowColor = PAL.cyan; g.shadowBlur = 12; poly(g, pts, alpha(mix(PAL.cyan, '#ffffff', sn * 0.9), 0.35 + 0.65 * on)); g.restore(); }
    }
    if (sn > 0) glow(g, (bx0 + bx1) / 2, by, (bx1 - bx0) * 0.6, PAL.goldHi, 0.5 * sn);
    out.bar = [X + bx0 * s, Y + by * s, X + bx1 * s];
    // STR line: dumbbell, STR, the big number, kg
    const ry = -CH / 2 + 80, x0 = -CW / 2 + 142;
    dumbbell(g, x0, ry + 4, 1.0, PAL.cyan);
    text(g, 'STR', x0 + 50, ry + 6, { size: 34, color: PAL.cyan, font: F, weight: 700, align: 'left', spacing: 2 });
    const nx = x0 + 130, nw = odo(g, o.str ?? 101, nx, ry, { size: 96, color: '#f2fdff', font: F, weight: 700, align: 'left', glow: 18, glowColor: alpha(PAL.cyan, 0.9), fmt: o.fmt });
    text(g, o.unit ?? 'kg', nx + nw + 12, ry + 20, { size: 40, color: PAL.cyan, font: F, weight: 600, align: 'left' });
    out.str = [X + nx * s, Y + ry * s];
    // the coral warning one-liner (typed on)
    if (o.warn) {
      const wk = prog(t, o.warnAt ?? -1, (o.warnAt ?? -1) + 0.45), nch = Math.ceil(o.warn.length * wk);
      if (nch > 0) {
        const wy = ry + 74, shk = t - (o.warnAt ?? -1) < 0.6 ? noise(t * 40, 2) * 2 : 0;
        g.save(); g.translate(shk, 0); poly(g, [[x0 - 16, wy + 13], [x0 + 6, wy - 15], [x0 + 28, wy + 13]], PAL.coral); text(g, '!', x0 + 6, wy + 4, { size: 20, color: PAL.ink, font: F, weight: 700 });
        text(g, o.warn.slice(0, nch), x0 + 44, wy, { size: 32, color: PAL.coral, font: F, weight: 600, align: 'left', glow: 10, glowColor: alpha(PAL.coral, 0.6) }); g.restore();
      }
    }
    g.restore();
  }
  // the gold level badge, overlapping the left edge (coin-flips on a level change)
  const bk = ease.outBack(prog(uf, 0.55, 1)); if (bk > 0.01) {
    const bx = -CW / 2 + 8, by = -8, R = 88 * bk, sp = clamp(o.spin ?? 0), fl = Math.cos(sp * Math.PI), lvShown = sp > 0 && sp < 0.5 && o.lvPrev != null ? o.lvPrev : o.lv ?? 7;
    g.save(); g.translate(bx, by); g.scale(Math.max(0.04, Math.abs(fl)), 1);
    g.save(); g.shadowColor = PAL.gold; g.shadowBlur = 26 + (sp > 0 && sp < 1 ? 30 : 0); circle(g, 0, 0, R, PAL.goldDk); g.restore();
    g.fillStyle = radGrad(g, -R * 0.3, -R * 0.35, R * 0.1, R * 1.05, [PAL.goldHi, PAL.gold, mix(PAL.gold, PAL.goldDk, 0.6)]); g.beginPath(); g.arc(0, 0, R * 0.9, 0, 7); g.fill();
    g.strokeStyle = alpha(PAL.ink, 0.25); g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R * 0.74, 0, 7); g.stroke();
    text(g, 'LV', 0, -R * 0.42, { size: 26 * bk, color: alpha(PAL.ink, 0.8), font: F, weight: 700, spacing: 2 });
    odo(g, lvShown, 0, R * 0.14, { size: 84 * bk, color: PAL.ink, font: F, weight: 700, align: 'center', still: sp > 0 && sp < 1 });
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, -R, -R, R, R, [alpha('#ffffff', 0.35), alpha('#ffffff', 0), alpha('#ffffff', 0)]); g.beginPath(); g.arc(0, 0, R * 0.9, 0, 7); g.fill(); g.restore();
    g.restore();
    if (sp > 0 && sp < 1) sparks(g, t, t - sp * 0.5, bx, by, { n: 10, s: 0.6, seed: 9 });
    out.badge = [X + bx * s, Y + by * s];
  }
  g.restore();
  // the HUD's light spill (so the card lights its surroundings a touch)
  if (o.reflect !== 0) glow(g, X, Y + CH * 0.6 * s, CW * 0.7 * s, PAL.cyan2, 0.06 * kc);
  return out;
}

// ---------------------------------------------------------------- THE LEVEL-UP POP
export function levelFlash(g, t, at, o = {}) {
  const u = t - at, d = o.dur ?? 0.28; if (u < 0 || u > d) return; const a = (o.a ?? 0.7) * Math.pow(1 - u / d, 1.6);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = alpha(PAL.goldHi, a); g.fillRect(0, 0, g.canvas?.width ?? E.W * 2, g.canvas?.height ?? E.H * 2); g.restore();
}
export function levelUp(g, t, at, o = {}) {
  const u = t - at, hold = o.hold ?? 1.6; if (u < 0 || u > hold + 0.35) return; const s = o.s ?? 1, x = o.x ?? E.W / 2, y = o.y ?? E.H * 0.3, str = o.str ?? 'LEVEL UP!';
  // 0 -> 1.15 in 0.12 s (snap), settle to 1 by 0.3 s; out: quick squash up and fade
  const pop = u < 0.12 ? 1.15 * ease.out(u / 0.12) : u < 0.3 ? lerp(1.15, 1, ease.inOut((u - 0.12) / 0.18)) : 1, out = prog(u, hold, hold + 0.35), sc = pop * (1 + out * 0.15), a = 1 - out;
  g.save(); g.translate(x, y - out * 40 * s); g.scale(s * sc, s * sc * (1 - out * 0.3)); g.globalAlpha *= a;
  // starburst (alternating gold / pale rays, slowly rotating)
  g.save(); g.rotate(u * 0.6); g.globalCompositeOperation = 'lighter'; const n = 18, R = 420 * clamp(u / 0.18);
  for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = a0 + Math.PI / n * 0.55; g.fillStyle = radGrad(g, 0, 0, 40, R, [alpha(i % 2 ? PAL.goldHi : PAL.gold, 0.55), alpha(PAL.gold, 0)]); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * (i % 2 ? 0.75 : 1), a0, a1); g.closePath(); g.fill(); }
  g.restore();
  glow(g, 0, 0, 380, PAL.gold, 0.35);
  // speed streaks (cyan + gold, behind the word)
  for (let i = 0; i < 10; i++) { const yy = -70 + i * 15, L = 120 + (i * 37 % 90); seg(g, [[-480 - L * (1 - clamp(u * 4)), yy], [-380, yy]], 4, alpha(i % 2 ? PAL.cyan : PAL.gold, 0.5 * clamp(1 - u))); seg(g, [[380, yy], [480 + L * (1 - clamp(u * 4)), yy]], 4, alpha(i % 2 ? PAL.gold : PAL.cyan, 0.5 * clamp(1 - u))); }
  // the word: chunky rounded, slanted, gold gradient, ink outline + a cyan offset shadow
  g.save(); g.transform(1, 0, -0.18, 1, 0, 0); const sz = 150;
  text(g, str, 10, 12, { size: sz, color: PAL.cyan2, font: F, weight: 700, stroke: 26, strokeColor: PAL.ink, spacing: 4 });
  text(g, str, 0, 0, { size: sz, color: PAL.ink, font: F, weight: 700, stroke: 22, strokeColor: PAL.ink, spacing: 4 });
  text(g, str, 0, 0, { size: sz, color: linGrad(g, 0, -sz * 0.5, 0, sz * 0.45, [PAL.goldHi, PAL.gold, [0.75, PAL.gold], [1, PAL.goldDk]]), font: F, weight: 700, glow: 30, glowColor: alpha(PAL.gold, 0.8), spacing: 4 });
  g.restore();
  g.restore();
  sparks(g, t, at, x, y, { n: 34, s: s * 1.2, seed: 21 });
  sparks(g, t, at + 0.25, x + 260 * s, y - 40 * s, { n: 10, s: s * 0.7, seed: 22 });
  sparks(g, t, at + 0.4, x - 280 * s, y + 20 * s, { n: 10, s: s * 0.7, seed: 23 });
  // little twinkles that hang in the air after the pop
  const r = rng(31); for (let i = 0; i < 12; i++) { const px = x + (r() - 0.5) * 900 * s, py = y + (r() - 0.5) * 300 * s - u * 30 * s, tw = Math.max(0, Math.sin(u * 6 + i * 1.7)); if (u > 0.2) sparkShape(g, px, py, 10 * s * tw * a, alpha(PAL.goldHi, 0.9 * a), i); }
}

// ---------------------------------------------------------------- THE WHOLE MORNING RECIPE
export function morningPop(g, t, o = {}) {
  const at = o.at ?? 0, s = o.s ?? 1, close = o.close ?? Infinity, lv = o.lv ?? [6, 7], st = o.str ?? [95, 101];
  const tCard = at + 0.3, tSnap = at + 0.85, tSpin = at + 0.95, tPop = at + 1.15;
  const zx = o.zipX ?? E.W / 2, zy = o.zipY ?? E.H * 0.55, cx = o.cardX ?? zx, cy = o.cardY ?? zy - 230 * s;
  const zo = zipOpen(t, at, { close: close + 0.25, dur: 0.32 });
  const Z = zip(g, t, zx, zy, { w: (o.zipW ?? 280) * s, open: zo, seam: clamp(zo * 4) });
  const uf = ease.out(prog(t, tCard, tCard + 0.55)) * (isFinite(close) ? 1 - ease.in(prog(t, close, close + 0.35)) : 1);
  const X = xpFill(t, { from: o.xp0 ?? 0.55, to: 1, at0: tCard + 0.3, at1: tSnap, snap: tSnap + 0.05 });
  const sp = levelSpin(t, tSpin, 0.45);
  const card = statCard(g, t, { x: cx, y: cy, s: 0.9 * s, from: Z.mouth, unfold: uf, lv: sp >= 0.5 ? lv[1] : lv[0], lvPrev: lv[0], spin: sp > 0 && sp < 1 ? sp : 0,
    str: roll(t, st[0], st[1], tSpin, 0.9), xp: X.xp, xpSnap: X.xpSnap, warn: o.warn, warnAt: o.warnAt ?? tPop + 0.9, tilt: o.tilt });
  if (o.pop !== false) levelUp(g, t, tPop, { x: o.popX ?? cx, y: o.popY ?? cy - 250 * s, s: (o.popS ?? 0.8) * s });
  if (o.flash) levelFlash(g, t, tPop);
  return { shake: levelShake(t, tPop, 3), card, tPop, zip: Z };
}

// ---------------------------------------------------------------- BISCUIT'S TINY CARD
export function miniCard(g, t, o = {}) {
  const s = o.s ?? 0.5, uf = clamp(o.unfold ?? 1); if (uf <= 0.001) return;
  const kw = ease.out(prog(uf, 0, 0.5)), kh = ease.outBack(prog(uf, 0.3, 1)), kc = prog(uf, 0.6, 1);
  const x = o.from ? lerp(o.from[0], o.x, ease.inOut(prog(uf, 0, 0.7))) : o.x, y = (o.from ? lerp(o.from[1], o.y, ease.inOut(prog(uf, 0, 0.7))) : o.y) + Math.sin(t * 2.2) * 5 * kc;
  const w = 330, h = 108;
  g.save(); g.translate(x, y); g.rotate(0.05 * kc + Math.sin(t * 1.4) * 0.02); g.scale(s, s);
  glow(g, 0, 0, w * 0.7, PAL.cyan, 0.15 * kw);
  g.save(); g.scale(lerp(0.15, 1, kw), Math.max(0.04, kh));
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.save(); g.clip(); frost(g, 6); g.restore();
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = alpha(PAL.glass, 0.6); g.fill();
  g.save(); g.shadowColor = PAL.cyan; g.shadowBlur = 16; g.strokeStyle = PAL.cyan; g.lineWidth = 3; g.stroke(); g.restore();
  g.restore();
  if (kc > 0) {
    g.save(); g.globalAlpha *= kc;
    dumbbell(g, -w / 2 + 112, 0, 0.7, PAL.cyan);
    const nw = odo(g, o.str ?? 0.4, -w / 2 + 150, 2, { size: 60, color: '#f2fdff', font: F, weight: 700, align: 'left', glow: 12, glowColor: alpha(PAL.cyan, 0.9), fmt: o.fmt ?? (q => String(q)), still: true });
    text(g, o.unit ?? 'kg', -w / 2 + 160 + nw, 10, { size: 30, color: PAL.cyan, font: F, weight: 600, align: 'left' });
    g.restore();
  }
  const bk = ease.outBack(prog(uf, 0.5, 1)); if (bk > 0.01) {
    const R = 50 * bk; g.save(); g.translate(-w / 2 + 14, -6); g.save(); g.shadowColor = PAL.gold; g.shadowBlur = 18; circle(g, 0, 0, R, PAL.goldDk); g.restore();
    g.fillStyle = radGrad(g, -R * 0.3, -R * 0.35, R * 0.1, R, [PAL.goldHi, PAL.gold, mix(PAL.gold, PAL.goldDk, 0.6)]); g.beginPath(); g.arc(0, 0, R * 0.9, 0, 7); g.fill();
    text(g, 'LV', 0, -R * 0.45, { size: 16, color: alpha(PAL.ink, 0.8), font: F, weight: 700 }); text(g, String(o.lv ?? 1), 0, R * 0.14, { size: 50, color: PAL.ink, font: F, weight: 700 }); g.restore();
  }
  g.restore();
  if (o.warn && kc > 0.5) text(g, o.warn, x, y + h * 0.8 * s, { size: 44 * s, color: PAL.coral, font: F, weight: 600, glow: 8, glowColor: alpha(PAL.coral, 0.6), alpha: kc });
}
