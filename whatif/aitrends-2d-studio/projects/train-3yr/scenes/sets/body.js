// sets/body.js — SCIENCE BLUEPRINTS for ep 3 "What If You Trained Every Day for 3 Years?", in the bp.js style
// (navy grid board, light-blue line art, cream detail, GOLD for every label and number). Draw on a bp.board(); every piece takes
// k = draw-on 0..1 and returns absolute anchor points so a shot can attach bp.label() leaders. Facts follow whatif/what-if-train/sources.md.
//
//   muscle(g, t, { x, y, w, h, k, tears 0..1, repair 0..1 }) -> { fibre, tear, repair, box }        fibre bundle, micro-tears (coral), gold repair patches (thicker fibre)
//   soreCurve(g, t, { x, y, w, h, k, second 0..1 }) -> { peak, band, second }                       DOMS curve: day 0-4, peak inside a "1-3 DAYS" band; 2nd bout much lower (repeated bout effect)
//   abs(g, t, { x, y, w, h, k, strength 0..1, fat 0..1 }) -> { muscle, fat, skin }                   abdominal cross-section: skin, fat layer (dots), six-pack blocks that grow UNDER it
//   said(g, t, { x, y, w, h, k, light 0..1, heavy 0..1, overload 0..1 }) -> { light, heavy, stairs, top }   specificity panel: light/many reps vs heavy/few reps, "ADD DIFFICULTY" staircase
//   shin(g, t, { x, y, h, k, splint 0..1, fracture 0..1 }) -> { tibia, fibula, splint, crack, knee, ankle }  lower leg: tibia + fibula, shin-splint glow along the bone, hairline stress crack
//   follicle(g, t, { x, y, s, k, phase 0..3 }) -> { bulb, shaft, skin, club }                       hair follicle: phase 0 growing (shaft grows) -> 1 resting (bulb shrinks) -> 2 shedding (hair drops) -> 3 regrowing
//   hairCycle(g, t, { x, y, r, k, phase 0..3 }) -> { growing, resting, shedding }                    the cycle wheel: GROWING / RESTING / SHEDDING arcs + a marker at `phase`
//   hairCounter(g, t, { x, y, value, k })                                                           "HAIRS SHED TODAY" counter + a 50-100 NORMAL band
//   dht(g, t, { x, y, r, k, glow 0..1 }) -> { mol }                                                  DHT molecule: steroid skeleton (3 hexagons + pentagon) with =O and OH, label "DHT"
//   twins(g, t, { x, y, s, k, pct 0..1 }) -> { left, right, dna }                                    identical twin silhouettes, DNA helix between them, "~80% GENES" bar (twin-study estimate)
//   heart(g, t, { x, y, r, k, bpm, stroke 0..1 }) -> { heart, aorta, out }                         heart outline with chambers, beats at `bpm`; stroke 0 untrained -> 1 trained = bigger blood pulse per beat
//   bpmMonitor(g, t, { x, y, w, h, k, bpm, band, athlete }) -> { readout, normal, athleteMark }      ECG trace scrolling at bpm, big readout, scale 30-120 with the 60-100 NORMAL band + "~40 ATHLETE" mark
// All deterministic (t, rng). Colours from S().ui.
import { E, V, S, clamp, lerp, prog, ease, rng, seg, circle, ring, rr, poly, alpha, mix, shade, glow, text, FONTS } from '/engine/core.js';
import { draw } from './bp.js';

const ui = () => S().ui;
const lbl = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? V(30, 34), color: o.color ?? ui().gold, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1, glow: 10, glowColor: alpha(o.color ?? ui().gold, 0.45) });
const arcPts = (cx, cy, rx, ry, a0, a1, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

// =====================================================================================================
// MUSCLE: fibre bundle, micro-tears, repair
// =====================================================================================================
export function muscle(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 900, h = 360, k = 1 } = o, tears = clamp(o.tears ?? 0), rep = clamp(o.repair ?? 0), n = 7, fh = h / n, r = rng(o.seed ?? 3);
  const x0 = x - w / 2, y0 = y - h / 2, A = { box: [x0, y0, w, h], fibre: [x0 + w * 0.15, y0 + fh * 0.5], tear: [x0 + w * 0.5, y0 + fh * 2.5], repair: [x0 + w * 0.5, y0 + fh * 2.5] };
  // the bundle sheath (epimysium) as a long capsule, tendons at both ends
  draw(g, [[x0 - 120, y], [x0, y0 + 20], [x0 + w, y0 + 20], [x + w / 2 + 120, y], [x0 + w, y0 + h - 20], [x0, y0 + h - 20], [x0 - 120, y]], k, { w: 5, color: U.blueprint });
  draw(g, [[x0 - 220, y], [x0 - 120, y]], k, { w: 10, color: U.cream }); draw(g, [[x0 + w + 120, y], [x0 + w + 220, y]], k, { w: 10, color: U.cream });
  const fk = clamp(k * 1.4 - 0.3); if (fk <= 0) return A;
  const tearAt = [[2, 0.5], [4, 0.32], [5, 0.7], [1, 0.74], [3, 0.2]];
  for (let i = 0; i < n; i++) { const fy = y0 + 28 + i * (h - 56) / (n - 1), th = (h - 56) / (n - 1) * 0.78 * (1 + 0.22 * rep);
    // a tear in this fibre? (gap with frayed ends, coral; repair closes it with a thicker gold patch)
    const tr = tearAt.find(([fi]) => fi === i), tx = tr ? x0 + w * tr[1] : null, gap = tr ? 26 * tears * (1 - rep) : 0;
    const segs = tr && gap > 1 ? [[x0 + 30, tx - gap], [tx + gap, x0 + w - 30]] : [[x0 + 30, x0 + w - 30]];
    for (const [a, b] of segs) { const L = lerp(a, a + (b - a), fk); rr(g, a, fy - th / 2, Math.max(0, L - a), th, th / 2); g.fillStyle = alpha(U.blueprint, 0.12); g.fill(); g.strokeStyle = alpha(U.blueprint, 0.9); g.lineWidth = 3; g.stroke();
      g.strokeStyle = alpha(U.cream, 0.28); g.lineWidth = 1.5; for (let sx = a + 14; sx < L - 8; sx += 18) { g.beginPath(); g.moveTo(sx, fy - th * 0.38); g.lineTo(sx, fy + th * 0.38); g.stroke(); } }   // striations (sarcomeres)
    if (tr && tears > 0.02) {
      if (gap > 1) { g.strokeStyle = alpha(U.accent, 0.95); g.lineWidth = 3; for (const s of [-1, 1]) { const ex = tx + s * gap; g.beginPath(); for (let j = 0; j <= 4; j++) { const yy = fy - th / 2 + j * th / 4; j ? g.lineTo(ex + s * (j % 2 ? 8 : -2), yy) : g.moveTo(ex, yy); } g.stroke(); }
        glow(g, tx, fy, 70, U.accent, 0.35 * tears * (1 - rep) * (0.8 + 0.2 * Math.sin(t * 5 + i))); }
      if (rep > 0.02) { rr(g, tx - 40, fy - th * 0.62, 80, th * 1.24, th * 0.6); g.fillStyle = alpha(U.gold, 0.25 * rep); g.fill(); g.strokeStyle = alpha(U.gold, rep); g.lineWidth = 3.5; g.stroke(); }
      if (i === 2) A.tear = [tx, fy - th / 2], A.repair = [tx, fy - th * 0.62];
    }
  }
  // satellite cells (repair crew): small gold dots that drift to the tears while repairing
  if (rep > 0.02 && rep < 0.98) tearAt.forEach(([fi, u], j) => { const fy = y0 + 28 + fi * (h - 56) / (n - 1), tx = x0 + w * u; for (let q = 0; q < 3; q++) { const a = j * 2 + q * 2.1 + t * 0.8, d = 70 * (1 - rep); circle(g, tx + Math.cos(a) * d, fy + Math.sin(a) * d * 0.5, 5, U.gold); } });
  A.fibre = [x0 + w * 0.12, y0 + 28];
  return A;
}

// DOMS curve: soreness vs days. The first bout peaks inside the 1-3 day band; the repeated bout is much milder.
export function soreCurve(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 760, h = 380, k = 1 } = o, second = clamp(o.second ?? 0), x0 = x - w / 2, y1 = y + h / 2, y0 = y - h / 2, X = (d) => x0 + (d / 4) * w;
  // axes + day ticks
  draw(g, [[x0, y0 - 20], [x0, y1], [x0 + w + 20, y1]], ease.out(clamp(k * 2)), { w: 4, color: U.cream });
  for (let d = 0; d <= 4; d++) { seg(g, [[X(d), y1], [X(d), y1 + 14]], 3, alpha(U.cream, 0.7 * clamp(k * 2))); text(g, `DAY ${d}`, X(d), y1 + 42, { size: 28, color: U.cream, font: FONTS.ui, weight: 900, alpha: clamp(k * 2) }); }
  text(g, 'SORENESS', x0 + 10, y0 - 44, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: clamp(k * 2) });
  // the 1-3 day band
  const bk = clamp(k * 2 - 0.6); if (bk > 0) { g.fillStyle = alpha(U.gold, 0.12 * bk); g.fillRect(X(1), y0, X(3) - X(1), h); g.save(); g.setLineDash([10, 8]); g.globalAlpha *= bk; seg(g, [[X(1), y0], [X(1), y1]], 2.5, U.gold); seg(g, [[X(3), y0], [X(3), y1]], 2.5, U.gold); g.restore(); lbl(g, '1-3 DAYS', (X(1) + X(3)) / 2, y0 - 6, { alpha: bk }); }
  // bout 1: rises after the workout, peaks around day 1.8, eases by day 4
  const curve = (amp) => Array.from({ length: 61 }, (_, i) => { const d = i / 15; return [X(d), y1 - h * 0.86 * amp * (d / 1.8) ** 2 * Math.exp(2 * (1 - d / 1.8))]; });
  const c1 = curve(1); draw(g, c1, clamp(k * 1.6 - 0.4), { w: 6, color: U.accent });
  if (second > 0) { draw(g, curve(0.32), second, { w: 6, color: '#9fd8ff' }); }
  return { peak: [X(1.8), y1 - h * 0.86], band: [(X(1) + X(3)) / 2, y0], second: [X(1.8), y1 - h * 0.86 * 0.32] };
}

// =====================================================================================================
// ABS under a fat layer
// =====================================================================================================
export function abs(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 620, h = 520, k = 1 } = o, st = clamp(o.strength ?? 0), fat = clamp(o.fat ?? 1), r = rng(o.seed ?? 7);
  const x0 = x - w / 2, y0 = y - h / 2, bw = w * 0.36 * (1 + 0.12 * st), bh = h * 0.24, gap = 16 + 4 * st, cx = x, ft = 30 + 90 * fat;
  // torso outline (front view): ribs flare at the top, hips at the bottom
  const torso = [[x0 + 40, y0 - 40], [x0, y0 + h * 0.3], [x0 + 20, y0 + h * 0.75], [x0 + 70, y0 + h + 20], [x0 + w - 70, y0 + h + 20], [x0 + w - 20, y0 + h * 0.75], [x0 + w, y0 + h * 0.3], [x0 + w - 40, y0 - 40]];
  draw(g, torso, k, { w: 5, color: U.blueprint });
  const mk = clamp(k * 1.6 - 0.4); if (mk <= 0) return { muscle: [cx, y], fat: [x0, y], skin: [x0, y0] };
  // the six blocks of rectus abdominis + the linea alba (they thicken with strength)
  g.save(); g.globalAlpha *= mk;
  for (let row = 0; row < 3; row++) for (const s of [-1, 1]) { const bx = cx + (s < 0 ? -gap / 2 - bw : gap / 2), by = y0 + 40 + row * (bh + gap);
    rr(g, bx, by, bw, bh, 26); g.fillStyle = alpha(U.accent, 0.14 + 0.2 * st); g.fill(); g.strokeStyle = mix(U.accent, '#ffb8a0', 0.3); g.lineWidth = 3 + 2 * st; g.stroke();
    for (let j = 1; j < 5; j++) seg(g, [[bx + 14, by + j * bh / 5], [bx + bw - 14, by + j * bh / 5 + 4]], 1.5, alpha('#ffd8cc', 0.35)); }       // fibre lines
  seg(g, [[cx, y0 + 30], [cx, y0 + 40 + 3 * (bh + gap)]], 3, alpha(U.cream, 0.6));
  g.restore();
  // the fat layer on top (subcutaneous): a band of dotted fill with a soft edge, thickness = fat; it does NOT shrink with strength
  const fk = clamp(k * 1.6 - 0.7); if (fk > 0) { g.save(); g.globalAlpha *= fk;
    const band = (inset) => { g.beginPath(); g.moveTo(x0 + 40 - inset, y0 - 40); g.lineTo(x0 - inset, y0 + h * 0.3); g.lineTo(x0 + 20 - inset, y0 + h * 0.75); g.lineTo(x0 + 70 - inset, y0 + h + 20); g.lineTo(x0 + w - 70 + inset, y0 + h + 20); g.lineTo(x0 + w - 20 + inset, y0 + h * 0.75); g.lineTo(x0 + w + inset, y0 + h * 0.3); g.lineTo(x0 + w - 40 + inset, y0 - 40); };
    const fatPath = torso.map(([px, py]) => [px + (px < x ? -ft * 0.4 : ft * 0.4), py]); g.beginPath(); fatPath.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.clip();
    g.fillStyle = alpha('#ffe9b8', 0.18 + 0.22 * fat); g.fillRect(x0 - ft, y0 - 40, w + 2 * ft, h + 80);
    for (let i = 0; i < 140 * fat; i++) { const px = x0 - ft * 0.4 + r() * (w + ft * 0.8), py = y0 - 20 + r() * (h + 40); circle(g, px, py, 5 + r() * 9, alpha('#fff1c8', 0.25 + 0.2 * r())); ring(g, px, py, 5 + r() * 9, 1.2, alpha(U.cream, 0.35)); }
    g.restore(); draw(g, torso.map(([px, py]) => [px + (px < x ? -ft * 0.4 : ft * 0.4), py]), fk, { w: 4, color: U.cream }); }       // skin line pushed out by the fat
  return { muscle: [cx + gap / 2 + bw * 0.7, y0 + 40 + bh * 1.5 + gap], fat: [x0 + 30, y0 + h * 0.55], skin: [x0 - ft * 0.4, y0 + h * 0.3] };
}

// =====================================================================================================
// SAID / specificity panel
// =====================================================================================================
function dumbbell(g, x, y, s, col) { seg(g, [[x - 50 * s, y], [x + 50 * s, y]], 8 * s, col); for (const d of [-1, 1]) { rr(g, x + d * 50 * s - 12 * s, y - 26 * s, 24 * s, 52 * s, 6 * s); g.fillStyle = alpha(col, 0.2); g.fill(); g.strokeStyle = col; g.lineWidth = 3.5; g.stroke(); } }
function barbell(g, x, y, s, col) { seg(g, [[x - 150 * s, y], [x + 150 * s, y]], 9 * s, col); for (const d of [-1, 1]) for (let j = 0; j < 3; j++) { const px = x + d * (96 + j * 22) * s, hh = (96 - j * 18) * s; rr(g, px - 9 * s, y - hh / 2, 18 * s, hh, 5 * s); g.fillStyle = alpha(col, 0.22); g.fill(); g.strokeStyle = col; g.lineWidth = 3.5; g.stroke(); } }
export function said(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 1400, h = 640, k = 1 } = o, lk = ease.out(clamp(o.light ?? 1)), hk = ease.out(clamp(o.heavy ?? 1)), ov = clamp(o.overload ?? 0);
  const x0 = x - w / 2, y0 = y - h / 2, cw = w * 0.3, c1 = x0 + cw / 2, c2 = x0 + cw * 1.5 + 40;
  // two cards: LIGHT LOAD, MANY REPS -> ENDURANCE   |   HEAVY LOAD, FEW REPS -> MAX STRENGTH
  const card = (cx, kk, title, sub, out, icon) => { if (kk <= 0.01) return; g.save(); g.globalAlpha *= kk; g.translate(cx, y0 + h * 0.5); g.scale(0.9 + 0.1 * kk, 0.9 + 0.1 * kk);
    rr(g, -cw / 2, -h / 2, cw, h, 24); g.fillStyle = alpha(U.blueprint, 0.07); g.fill(); g.strokeStyle = alpha(U.blueprint, 0.8); g.lineWidth = 3; g.stroke();
    lbl(g, title, 0, -h / 2 + 50, { size: 34 }); text(g, sub, 0, -h / 2 + 96, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, spacing: 2 });
    icon(); seg(g, [[0, h * 0.08], [0, h * 0.2]], 5, U.cream); poly(g, [[-18, h * 0.19], [18, h * 0.19], [0, h * 0.24]], U.cream);
    rr(g, -cw * 0.42, h * 0.27, cw * 0.84, 80, 40); g.fillStyle = alpha(U.gold, 0.14); g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); lbl(g, out, 0, h * 0.27 + 41, { size: 34 });
    g.restore(); };
  card(c1, lk * clamp(k * 2), 'LIGHT LOAD', 'MANY REPS', 'ENDURANCE', () => { dumbbell(g, 0, -h * 0.1, 1.1, U.blueprint); for (let i = 0; i < 10; i++) seg(g, [[-cw * 0.36 + i * cw * 0.08, -h * 0.24], [-cw * 0.36 + i * cw * 0.08, -h * 0.2]], 4, alpha(U.cream, 0.4 + 0.6 * clamp((t * 3 - i * 0.3) % 4))); });
  card(c2, hk * clamp(k * 2 - 0.3), 'HEAVY LOAD', 'FEW REPS', 'MAX STRENGTH', () => { barbell(g, 0, -h * 0.1, 0.9, U.blueprint); for (let i = 0; i < 3; i++) seg(g, [[-36 + i * 36, -h * 0.24], [-36 + i * 36, -h * 0.2]], 4, U.cream); });
  // ADD DIFFICULTY: a staircase that climbs to the right (progressive overload); a gold dot hops step to step
  const sx0 = x0 + cw * 2 + 120, sw = w - (cw * 2 + 120), steps = 5, stw = sw / steps, sth = h * 0.13, base = y0 + h * 0.86, stairs = [[sx0, base]];
  for (let i = 0; i < steps; i++) { stairs.push([sx0 + i * stw, base - (i + 1) * sth]); stairs.push([sx0 + (i + 1) * stw, base - (i + 1) * sth]); }
  const sk = clamp(k * 2 - 0.6); draw(g, stairs, sk, { w: 6, color: U.cream });
  if (sk > 0.5) { const hop = ov * (steps - 1), i = Math.floor(hop), u = hop - i, px = sx0 + (i + 0.5 + u) * stw, py = base - (i + 1) * sth - 30 - Math.sin(u * Math.PI) * 60 - u * sth; circle(g, px, py, 16, U.gold); glow(g, px, py, 60, U.gold, 0.4);
    const ak = ease.out(clamp((sk - 0.5) * 2)); g.save(); g.globalAlpha *= ak; seg(g, [[sx0 + 20, base - 40], [sx0 + sw - 30, base - steps * sth - 60]], 5, U.gold); const ang = Math.atan2(-(steps * sth + 20), sw - 50); g.translate(sx0 + sw - 30, base - steps * sth - 60); g.rotate(ang); poly(g, [[0, -16], [30, 0], [0, 16]], U.gold); g.restore();
    lbl(g, 'ADD DIFFICULTY', sx0 + sw / 2, base + 50, { alpha: ak }); }
  return { light: [c1, y0 + 20], heavy: [c2, y0 + 20], stairs: [sx0 + sw / 2, base - steps * sth / 2], top: [sx0 + sw - 30, base - steps * sth - 60] };
}

// =====================================================================================================
// SHIN: tibia + fibula, shin splints, stress fracture
// =====================================================================================================
export function shin(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, h = 780, k = 1 } = o, sp = clamp(o.splint ?? 0), fr = clamp(o.fracture ?? 0), y0 = y - h / 2, y1 = y + h / 2, s = h / 780;
  // leg outline (calf behind, shin in front: the leg faces right)
  const leg = [[x - 150 * s, y0 - 30 * s], [x - 170 * s, y0 + 200 * s], [x - 120 * s, y0 + 460 * s], [x - 70 * s, y1 - 40 * s], [x - 90 * s, y1 + 30 * s], [x + 170 * s, y1 + 40 * s], [x + 160 * s, y1 - 10 * s], [x + 60 * s, y1 - 50 * s], [x + 70 * s, y0 + 300 * s], [x + 110 * s, y0 + 20 * s], [x + 100 * s, y0 - 30 * s]];
  draw(g, leg, k, { w: 5, color: alpha(U.blueprint, 0.9) }); if (k > 0.4) { ring(g, x + 96 * s, y0 + 10 * s, 34 * s, 4, alpha(U.blueprint, 0.8 * clamp((k - 0.4) * 3))); }
  const bk = clamp(k * 1.5 - 0.3); if (bk <= 0) return {};
  // tibia (big front bone): knee plateau, long shaft, ankle; fibula (thin, behind)
  const tib = [[x - 60 * s, y0 + 10 * s], [x + 80 * s, y0 + 10 * s], [x + 50 * s, y0 + 90 * s], [x + 40 * s, y1 - 110 * s], [x + 70 * s, y1 - 40 * s], [x - 30 * s, y1 - 40 * s], [x - 10 * s, y1 - 110 * s], [x - 20 * s, y0 + 90 * s]];
  g.save(); g.beginPath(); tib.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fillStyle = alpha(U.cream, 0.1 * bk); g.fill(); g.restore();
  draw(g, tib, bk, { w: 5, color: U.cream, close: true });
  draw(g, [[x - 90 * s, y0 + 70 * s], [x - 70 * s, y0 + 110 * s], [x - 60 * s, y1 - 90 * s], [x - 80 * s, y1 - 50 * s]], bk, { w: 12 * s, color: alpha(U.blueprint, 0.85) });
  draw(g, [[x + 10 * s, y0 + 120 * s], [x + 10 * s, y1 - 140 * s]], bk, { w: 2, color: alpha(U.cream, 0.35) });                                       // marrow line
  // shin splints: a coral glow running along the inner edge of the tibia shaft, pulsing
  const sy0 = y0 + 300 * s, sy1 = y1 - 170 * s, ex = (yy) => lerp(x + 46 * s, x + 40 * s, (yy - sy0) / (sy1 - sy0));
  if (sp > 0.01) { const pulse = 0.75 + 0.25 * Math.sin(t * 6); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i <= 10; i++) { const yy = lerp(sy0, sy1, i / 10); glow(g, ex(yy) + 6, yy, 70 * s, U.accent, 0.22 * sp * pulse); } g.restore(); draw(g, [[ex(sy0) + 8, sy0], [ex(sy1) + 8, sy1]], sp, { w: 6, color: alpha(U.accent, 0.9) }); }
  // stress fracture: a tiny hairline crack that draws in across the shaft
  const cy = y0 + 500 * s, crack = [[x + 44 * s, cy], [x + 28 * s, cy + 8 * s], [x + 18 * s, cy - 4 * s], [x + 4 * s, cy + 10 * s], [x - 6 * s, cy + 2 * s]];
  if (fr > 0.01) { draw(g, crack, fr, { w: 3.5, color: '#ffffff' }); glow(g, x + 20 * s, cy, 60 * s, '#ffffff', 0.25 * fr); }
  return { tibia: [x + 46 * s, y0 + 200 * s], fibula: [x - 66 * s, y0 + 260 * s], splint: [ex((sy0 + sy1) / 2) + 10, (sy0 + sy1) / 2], crack: [x + 20 * s, cy], knee: [x, y0], ankle: [x, y1 - 40 * s] };
}

// =====================================================================================================
// HAIR: follicle, cycle wheel, shed counter, DHT, twins
// =====================================================================================================
export function follicle(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, ph = ((o.phase ?? 0) % 3 + 3) % 3;
  // phase 0..1 growing (anagen, long), 1..2 resting (telogen: bulb shrinks to a club, hair stops), 2..3 shedding (the old hair slides out, a new one starts below)
  const grow = ph < 1 ? ph : 1, rest = clamp(ph - 1), shed = clamp(ph - 2), sky = y - 220 * s;
  // skin layers
  draw(g, [[x - 300 * s, sky], [x + 300 * s, sky]], k, { w: 5, color: U.cream }); draw(g, [[x - 300 * s, sky + 50 * s], [x + 300 * s, sky + 50 * s]], k, { w: 2.5, color: alpha(U.cream, 0.5) });
  text(g, 'SKIN', x - 290 * s, sky - 30 * s, { size: 28, color: U.cream, font: FONTS.ui, weight: 900, align: 'left', alpha: clamp(k * 2) });
  const fk = clamp(k * 1.6 - 0.4); if (fk <= 0) return {};
  // follicle sheath (rises as it rests: the follicle shortens)
  const depth = lerp(380, 220, rest) * s, bulbY = sky + depth, br = lerp(52, 26, rest) * s;
  draw(g, [[x - 40 * s, sky], [x - 44 * s, bulbY - br]], fk, { w: 4, color: U.blueprint }); draw(g, [[x + 40 * s, sky], [x + 44 * s, bulbY - br]], fk, { w: 4, color: U.blueprint });
  g.save(); g.globalAlpha *= fk; ring(g, x, bulbY, br, 4, U.blueprint); circle(g, x, bulbY, br * 0.9, alpha(rest < 0.5 ? U.accent : U.blueprint, 0.25)); circle(g, x, bulbY + br * 0.3, br * 0.35, alpha(U.accent, 0.6 * (1 - rest))); g.restore();   // papilla (blood supply) dims when resting
  // the hair shaft: grows out of the bulb through the skin; when shedding it slides up and out
  const out = shed * 260 * s, len = lerp(200, 330, grow) * s, top = sky - len + 200 * s - out, base = bulbY - br * 0.6 - out;
  g.save(); g.beginPath(); g.rect(x - 400 * s, Math.max(E.H * 0.12, sky - 700 * s), 800 * s, 1400 * s); g.clip();
  draw(g, [[x, base], [x + 6 * s, sky + 20 * s - out], [x + 22 * s, top]], fk, { w: 12 * s, color: '#2a1e18' }); draw(g, [[x - 2 * s, base], [x + 4 * s, sky + 20 * s - out], [x + 20 * s, top]], fk, { w: 4 * s, color: alpha(U.cream, 0.6) });
  g.restore();
  if (rest > 0.3 && shed < 0.1) { g.save(); g.globalAlpha *= clamp((rest - 0.3) * 3); ring(g, x, base, 12 * s, 3, U.gold); g.restore(); }        // club end
  // a new hair starting in the bulb once the old one sheds
  if (shed > 0.2) draw(g, [[x, bulbY - br * 0.6], [x + 2 * s, bulbY - br * 0.6 - 120 * s * shed]], 1, { w: 8 * s, color: alpha('#2a1e18', 0.9) });
  return { bulb: [x + br, bulbY], shaft: [x + 14 * s, sky - 80 * s - out], skin: [x + 200 * s, sky], club: [x + 12, base] };
}
export function hairCycle(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, r = 200, k = 1 } = o, ph = ((o.phase ?? 0) % 3 + 3) % 3;
  // GROWING takes most of the wheel (years), RESTING and SHEDDING the rest (months)
  const parts = [['GROWING', 0.72, U.blueprint], ['RESTING', 0.16, U.cream], ['SHEDDING', 0.12, U.accent]], A = {};
  let a = -Math.PI / 2; parts.forEach(([name, f, col], i) => { const a1 = a + f * Math.PI * 2, kk = clamp(k * 3 - i * 0.6);
    if (kk > 0) { draw(g, arcPts(x, y, r, r, a + 0.04, lerp(a + 0.04, a1 - 0.04, kk), 60), 1, { w: 22, color: alpha(col, 0.85) });
      const am = (a + a1) / 2, lx = x + Math.cos(am) * (r + 70), ly = y + Math.sin(am) * (r + 56); lbl(g, name, lx, ly, { alpha: clamp(kk * 2 - 1), size: 30, align: Math.cos(am) > 0.3 ? 'left' : Math.cos(am) < -0.3 ? 'right' : 'center' }); A[name.toLowerCase()] = [x + Math.cos(am) * r, y + Math.sin(am) * r]; }
    a = a1; });
  // marker: phase 0..1 maps into GROWING, 1..2 RESTING, 2..3 SHEDDING
  const fr = ph < 1 ? ph * 0.72 : ph < 2 ? 0.72 + (ph - 1) * 0.16 : 0.88 + (ph - 2) * 0.12, am = -Math.PI / 2 + fr * Math.PI * 2;
  if (k > 0.6) { const mx = x + Math.cos(am) * r, my = y + Math.sin(am) * r; circle(g, mx, my, 20, U.gold); ring(g, mx, my, 30, 3, alpha(U.gold, 0.6)); glow(g, mx, my, 70, U.gold, 0.35); }
  return A;
}
export function hairCounter(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, k = 1 } = o, v = Math.round(clamp(o.value ?? 0, 0, 140)), w = 560, h = 230;
  if (k <= 0.01) return; g.save(); g.globalAlpha *= clamp(k); g.translate(x, y);
  rr(g, -w / 2, -h / 2, w, h, 26); g.fillStyle = alpha('#0a1020', 0.92); g.fill(); g.strokeStyle = U.gold; g.lineWidth = 4; g.stroke();
  text(g, 'HAIRS SHED TODAY', 0, -h / 2 + 40, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, spacing: 3 });
  text(g, String(v), 0, -6, { size: 96, color: U.gold, font: FONTS.title, weight: 700, glow: 18, glowColor: alpha(U.gold, 0.6) });
  // a 0-140 scale with the 50-100 NORMAL band and a needle
  const sx0 = -w / 2 + 40, sw = w - 80, sy = h / 2 - 52, X = (n) => sx0 + (n / 140) * sw;
  seg(g, [[sx0, sy], [sx0 + sw, sy]], 6, alpha(U.cream, 0.4)); rr(g, X(50), sy - 12, X(100) - X(50), 24, 12); g.fillStyle = alpha(U.good || '#5fd39a', 0.5); g.fill();
  text(g, '50-100 NORMAL', (X(50) + X(100)) / 2, sy + 34, { size: 26, color: U.good || '#5fd39a', font: FONTS.ui, weight: 900, spacing: 2 });
  poly(g, [[X(v), sy - 16], [X(v) - 12, sy - 36], [X(v) + 12, sy - 36]], U.gold);
  g.restore();
}
export function dht(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, r = 60, k = 1 } = o, gl = clamp(o.glow ?? 0), hx = (cx, cy, rot = 0) => Array.from({ length: 7 }, (_, i) => { const a = rot + Math.PI / 6 + i * Math.PI / 3; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const d = r * Math.sqrt(3), wob = Math.sin(t * 1.4) * 0.03;
  g.save(); g.translate(x, y); g.rotate(wob); g.translate(-x, -y);
  if (gl > 0) glow(g, x, y, r * 5, U.gold, 0.25 * gl);
  // three fused hexagons (A-B-C) + a pentagon (D), steroid skeleton
  const A = [x - d * 1.5, y + r * 0.5], B = [x - d * 0.5, y], C = [x + d * 0.5, y + r * 0.5];
  [hx(...A), hx(...B), hx(...C)].forEach((p, i) => draw(g, p, clamp(k * 3 - i * 0.5), { w: 5, color: U.blueprint }));
  const pc = [x + d * 1.4, y - r * 0.05], pent = Array.from({ length: 6 }, (_, i) => { const a = Math.PI + i * Math.PI * 2 / 5 + 0.3; return [pc[0] + Math.cos(a) * r * 0.86, pc[1] + Math.sin(a) * r * 0.86]; });
  draw(g, pent, clamp(k * 3 - 1.5), { w: 5, color: U.blueprint });
  const ek = clamp(k * 2 - 1); if (ek > 0) { g.save(); g.globalAlpha *= ek;
    const o1 = [A[0] - d * 0.9, A[1] + r * 0.6]; seg(g, [[A[0] - d * 0.5, A[1] + r * 0.5], o1], 4, U.cream); seg(g, [[A[0] - d * 0.5 - 4, A[1] + r * 0.5 + 8], [o1[0] - 4, o1[1] + 8]], 4, U.cream); text(g, 'O', o1[0] - 24, o1[1] + 10, { size: 40, color: U.cream, font: FONTS.ui, weight: 900 });
    const oh = [pc[0] + r * 1.4, pc[1] - r * 0.6]; seg(g, [[pc[0] + r * 0.7, pc[1] - r * 0.3], oh], 4, U.cream); text(g, 'OH', oh[0] + 36, oh[1] - 4, { size: 40, color: U.cream, font: FONTS.ui, weight: 900 });
    for (const [mx, my] of [[B[0] + d * 0.5, B[1] - r], [C[0] + d * 0.5, C[1] - r]]) seg(g, [[mx, my], [mx, my - r * 0.7]], 4, U.cream);       // methyl groups
    lbl(g, 'DHT', x, y + r * 2.4, { size: 52 }); g.restore(); }
  g.restore();
  return { mol: [x, y - r * 1.2] };
}
// head-and-shoulders silhouette in line art (for twins)
function bust(g, x, y, s, k, col, hair) { draw(g, arcPts(x, y, 70 * s, 82 * s, -Math.PI * 1.5, Math.PI * 0.5, 50), k, { w: 5, color: col });
  draw(g, [[x - 170 * s, y + 270 * s], [x - 150 * s, y + 150 * s], [x - 50 * s, y + 104 * s], [x + 50 * s, y + 104 * s], [x + 150 * s, y + 150 * s], [x + 170 * s, y + 270 * s]], k, { w: 5, color: col });
  if (hair) { const hk = clamp(k * 2 - 1); g.save(); g.globalAlpha *= hk; for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.9 / 8; ring(g, x + Math.cos(a) * 66 * s, y + Math.sin(a) * 76 * s - 6 * s, 20 * s, 4, col); } g.restore(); } }
export function twins(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, s = 1, k = 1 } = o, pct = clamp(o.pct ?? 0), lx = x - 300 * s, rx = x + 300 * s;
  bust(g, lx, y - 80 * s, s, k, U.blueprint, true); bust(g, rx, y - 80 * s, s, clamp(k * 1.2 - 0.1), U.blueprint, true);
  // DNA helix between them: two sine strands with rungs, scrolling slowly
  const hk = clamp(k * 1.5 - 0.4); if (hk > 0) { const top = y - 220 * s, bot = y + 160 * s, n = 40; for (const ph of [0, Math.PI]) { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x + Math.sin(u * Math.PI * 4 + t * 1.5 + ph) * 46 * s, lerp(top, bot, u)]); } draw(g, pts, hk, { w: 4, color: ph ? U.cream : U.gold }); }
    for (let i = 1; i < 16; i++) { const u = i / 16, yy = lerp(top, bot, u); if (u > hk) break; const a = Math.sin(u * Math.PI * 4 + t * 1.5) * 46 * s; seg(g, [[x - a, yy], [x + a, yy]], 2.5, alpha(U.cream, 0.5)); } }
  // the "~80% GENES" bar under them (twin-study estimate)
  if (o.bar !== false && k > 0.5) { const bw = 640 * s, bx = x - bw / 2, by = y + 250 * s, bk = clamp((k - 0.5) * 2);
    rr(g, bx, by, bw, 46 * s, 23 * s); g.fillStyle = alpha(U.cream, 0.12 * bk); g.fill(); g.strokeStyle = alpha(U.cream, 0.6 * bk); g.lineWidth = 3; g.stroke();
    if (pct > 0) { rr(g, bx, by, bw * 0.8 * ease.out(pct), 46 * s, 23 * s); g.fillStyle = alpha(U.gold, 0.8); g.fill(); }
    lbl(g, `~${Math.round(80 * ease.out(pct))}% GENES`, x, by + 100 * s, { alpha: bk * clamp(pct * 5), size: 40 }); }
  return { left: [lx, y - 170 * s], right: [rx, y - 170 * s], dna: [x, y - 40 * s] };
}

// =====================================================================================================
// HEART + BPM monitor
// =====================================================================================================
// beat envelope: 0 at rest, a quick contraction peak once per beat
export const beatAt = (t, bpm) => { const ph = (t * bpm / 60) % 1; return Math.exp(-ph * 9) * (ph < 0.6 ? 1 : 0) + 0.35 * Math.exp(-Math.abs(ph - 0.28) * 30); };
export function heart(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, r = 220, k = 1, bpm = 72 } = o, st = clamp(o.stroke ?? 0), b = beatAt(t, bpm), sc = 1 - 0.07 * b;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  // heart outline (tilted), aorta arch on top, pulmonary trunk
  const H = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, px = 16 * Math.sin(a) ** 3, py = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); H.push([px * r / 17, py * r / 17 + r * 0.1]); }
  g.save(); g.rotate(-0.22); g.beginPath(); H.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fillStyle = alpha(U.accent, 0.08 + 0.12 * b); g.fill(); g.restore();
  g.save(); g.rotate(-0.22); draw(g, H, k, { w: 6, color: U.accent });
  const ck = clamp(k * 1.6 - 0.5); draw(g, [[-r * 0.05, -r * 0.45], [r * 0.05, r * 0.55]], ck, { w: 3, color: alpha(U.cream, 0.6) }); draw(g, [[-r * 0.75, -r * 0.05], [r * 0.78, -r * 0.1]], ck, { w: 3, color: alpha(U.cream, 0.45) });   // septum + valve plane (4 chambers)
  g.restore();
  draw(g, [[-r * 0.1, -r * 0.58], [-r * 0.12, -r * 1.0], [r * 0.25, -r * 1.25], [r * 0.6, -r * 1.05], [r * 0.62, -r * 0.7]], clamp(k * 1.5 - 0.3), { w: 22, color: alpha(U.accent, 0.75) });   // aorta arch
  draw(g, [[r * 0.2, -r * 0.55], [r * 0.32, -r * 0.92], [r * 0.08, -r * 1.12]], clamp(k * 1.5 - 0.4), { w: 18, color: alpha('#9fd8ff', 0.7) });                            // pulmonary trunk
  g.restore();
  // blood pushed out of the aorta on every beat: a trained heart (stroke 1) sends a much bigger pulse
  const ph = (t * bpm / 60) % 1, vol = lerp(0.55, 1.15, st);
  if (k > 0.8) for (let j = 0; j < 2; j++) { const u = clamp((ph - j * 0.12) / 0.7); if (u <= 0 || u >= 1) continue; const px = x + r * 0.62 + u * r * 0.9, py = y - r * 0.6 + Math.sin(u * Math.PI) * -20; g.fillStyle = alpha(U.accent, 0.8 * (1 - u)); g.beginPath(); g.ellipse(px, py, 44 * vol * (1 - u * 0.4), 26 * vol * (1 - u * 0.4), 0, 0, 7); g.fill(); }
  return { heart: [x - r * 0.4, y + r * 0.2], aorta: [x + r * 0.25, y - r * 1.25], out: [x + r * 1.2, y - r * 0.6] };
}
export function bpmMonitor(g, t, o = {}) {
  const U = ui(), { x = E.W / 2, y = E.H / 2, w = 760, h = 420, k = 1, bpm = 72 } = o, x0 = x - w / 2, y0 = y - h / 2, green = U.good || '#5fd39a';
  if (k <= 0.01) return {}; g.save(); g.globalAlpha *= clamp(k * 1.5);
  rr(g, x0, y0, w, h, 26); g.fillStyle = '#060b14'; g.fill(); g.strokeStyle = alpha(U.blueprint, 0.8); g.lineWidth = 4; g.stroke();
  // ECG trace across the top 55%: scrolls left; one PQRST complex per beat
  const tx0 = x0 + 30, tw = w - 60, ty = y0 + h * 0.3, amp = h * 0.18, sec = 3.2, ecg = (u) => { const ph = ((u * bpm / 60) % 1 + 1) % 1; return ph < 0.06 ? Math.sin(ph / 0.06 * Math.PI) * 0.12 : ph < 0.1 ? 0 : ph < 0.12 ? -0.15 : ph < 0.15 ? 1 : ph < 0.18 ? -0.3 : ph < 0.3 ? 0 : ph < 0.42 ? Math.sin((ph - 0.3) / 0.12 * Math.PI) * 0.25 : 0; };
  g.save(); g.beginPath(); g.rect(tx0, y0 + 10, tw, h * 0.55); g.clip(); g.strokeStyle = alpha(green, 0.18); g.lineWidth = 1; for (let gx = tx0; gx < tx0 + tw; gx += 40) { g.beginPath(); g.moveTo(gx, y0); g.lineTo(gx, y0 + h * 0.6); g.stroke(); }
  g.strokeStyle = green; g.lineWidth = 4; g.shadowColor = green; g.shadowBlur = 12; g.beginPath(); for (let i = 0; i <= 300; i++) { const u = i / 300, tt = t - sec + u * sec, px = tx0 + u * tw, py = ty - ecg(tt) * amp; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore();
  circle(g, tx0 + tw, ty - ecg(t) * amp, 7, '#e8fff0');
  // readout (right) + heart icon that pulses
  const b = beatAt(t, bpm); text(g, String(Math.round(bpm)), x0 + w - 150, y0 + h * 0.74, { size: 96, color: U.gold, font: FONTS.title, weight: 700, glow: 16, glowColor: alpha(U.gold, 0.6) });
  text(g, 'BPM', x0 + w - 150, y0 + h * 0.74 + 62, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, spacing: 3 });
  g.save(); g.translate(x0 + w - 280, y0 + h * 0.72); g.scale(1 + 0.15 * b, 1 + 0.15 * b); g.fillStyle = U.accent; g.beginPath(); g.moveTo(0, 16); g.bezierCurveTo(-34, -6, -18, -34, 0, -16); g.bezierCurveTo(18, -34, 34, -6, 0, 16); g.fill(); g.restore();
  // scale 30-120 with the 60-100 NORMAL band and the ~40 ATHLETE mark
  const sx0 = x0 + 40, sw = w - 420, sy = y0 + h * 0.82, X = (v) => sx0 + ((v - 30) / 90) * sw, A = { readout: [x0 + w - 150, y0 + h * 0.6], normal: [(X(60) + X(100)) / 2, sy], athleteMark: [X(40), sy] };
  seg(g, [[sx0, sy], [sx0 + sw, sy]], 6, alpha(U.cream, 0.4));
  for (const v of [30, 60, 90, 120]) { seg(g, [[X(v), sy + 10], [X(v), sy + 22]], 2.5, alpha(U.cream, 0.6)); text(g, String(v), X(v), sy + 44, { size: 24, color: alpha(U.cream, 0.8), font: FONTS.ui, weight: 900 }); }
  if (o.band !== false) { rr(g, X(60), sy - 14, X(100) - X(60), 28, 14); g.fillStyle = alpha(green, 0.45); g.fill(); text(g, '60-100 NORMAL', (X(60) + X(100)) / 2, sy - 38, { size: 26, color: green, font: FONTS.ui, weight: 900, spacing: 2 }); }
  if (o.athlete) { const ak = clamp(o.athlete); g.save(); g.globalAlpha *= ak; seg(g, [[X(40), sy - 30], [X(40), sy + 24]], 5, U.gold); text(g, '~40 ATHLETE', X(40) - 8, sy - 78, { size: 26, color: U.gold, font: FONTS.ui, weight: 900, spacing: 2, align: 'left' }); g.restore(); }
  poly(g, [[X(clamp(bpm, 30, 120)), sy - 16], [X(clamp(bpm, 30, 120)) - 12, sy - 34], [X(clamp(bpm, 30, 120)) + 12, sy - 34]], U.gold);
  g.restore();
  return A;
}
