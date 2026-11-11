// B_s033_s042_bones.js — ep 5 batch B: RULE 2 'MUSCLES PULL. BONES HAVE TO HOLD.' + FIG 3 (tendon pulls, bone takes the load, 1 cm2 of
// thigh bone ~190 MPa ~1.9 t AROUND 2 TONNES, pull/bend/twist qualitative, the muscle-tendon-bone race, teen athletes Mersmann 2017,
// THE GAP + MAY RAISE INJURY RISK, the record took years, level-11 muscles on level-0 bones comic x-ray).
// LEGAL: blueprints in cream on navy with gold numbers; no injuries shown; only our rounded card style; no series words.
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, seg, circle, ring, rr, poly, alpha, text, FONTS, noise } from '/engine/core.js';
import { home3 } from '../sets/home3.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, label, draw } from '../sets/bp.js';
import { statCard, sparks, dumbbell } from '../sets/statcard.js';
import { CREAM, GOLD, CORAL, CYAN, goldTag, barbell } from './B_lib.js';

const push = (g, t, dur, k = 0.04, fn) => { const z = 1 + k * ease.inOut(t / dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(g); g.restore(); };
const arrow = (g, x1, y1, x2, y2, col = GOLD, w = 8) => { seg(g, [[x1, y1], [x2, y2]], w, col); const a = Math.atan2(y2 - y1, x2 - x1); poly(g, [[x2 + Math.cos(a) * 18, y2 + Math.sin(a) * 18], [x2 + Math.cos(a + 2.4) * 22, y2 + Math.sin(a + 2.4) * 22], [x2 + Math.cos(a - 2.4) * 22, y2 + Math.sin(a - 2.4) * 22]], col); };
const num = (g, str, x, y, size = 96, k = 1, col = GOLD) => { if (k <= 0.01) return; g.save(); g.translate(x, y); g.scale(k, k); text(g, str, 0, 0, { size, color: col, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(col, 0.55) }); g.restore(); };
// a cream long bone (two knobbly ends), along x from x0 to x1 at y, thickness h; k = draw-on
function bone(g, x0, y, x1, h, k = 1, o = {}) {
  const L = x1 - x0, col = o.color ?? CREAM, pts = [[x0 + 40, y - h / 2], [x1 - 40, y - h / 2]], pts2 = [[x0 + 40, y + h / 2], [x1 - 40, y + h / 2]];
  draw(g, pts, k, { w: 5, color: col }); draw(g, pts2, k, { w: 5, color: col });
  const kk = clamp(k * 2 - 1); if (kk > 0) for (const [cx, sd] of [[x0, 1], [x1, -1]]) { g.save(); g.globalAlpha *= kk; g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.arc(cx + sd * 26, y - h * 0.55, h * 0.6, 0, 7); g.stroke(); g.beginPath(); g.arc(cx + sd * 26, y + h * 0.55, h * 0.6, 0, 7); g.stroke(); g.restore(); }
  if (o.fill) { g.save(); g.globalAlpha *= o.fill; g.fillStyle = alpha('#fff8e6', 0.55); g.fillRect(x0 + 40, y - h / 2, L - 80, h); g.restore(); }
}

// s033 — RULE 2 card over the dimmed kitchen, the Stat Card's coral line still glowing
registerShot('s033', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 2, title: 'MUSCLES PULL. BONES HAVE TO HOLD.', bg: (g, t) => {
    blurLayer(g, 9, (g) => home3(g, t, { z: 1.1, x: 120, y: -40 }, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 }), null, 1); veil(g, '#120a1c', 0.35);
    statCard(g, t, { x: E.W * 0.78, y: E.H * 0.2, s: 0.6, lv: 11, str: 508, warn: 'Bones: not included.', warnAt: -5 }); glow(g, E.W * 0.78, E.H * 0.24, 220, CORAL, 0.15); } });
} });

// s034 — FIG 3: muscle -> tendon -> bone (the elbow a hinge). 'and' 0.15 the muscle shortens + tendon pulls (gold); 'take' 0.75 the bone lights + load arrows
registerShot('s034', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - MUSCLE, TENDON, BONE', fig: 'LEVERS' });
  push(g, t, info.dur, 0.04, (g) => {
    const ex = E.W * 0.52, ey = E.H * 0.56, pull = ease.inOut(prog(t, 0.15, 0.6)), ang = -0.05 - 0.45 * pull;   // forearm swings up a little
    const sx = E.W * 0.2, sy = E.H * 0.44;
    // upper arm bone (shoulder -> elbow)
    g.save(); g.translate(sx, sy); g.rotate(Math.atan2(ey - sy, ex - sx)); const ul = Math.hypot(ex - sx, ey - sy); bone(g, 0, 0, ul, 34, 1, { fill: ease.out(prog(t, 0.75, 1.1)) }); g.restore();
    // forearm bone (elbow -> hand)
    const fx = ex + Math.cos(ang) * 520, fy = ey + Math.sin(ang) * 520;
    g.save(); g.translate(ex, ey); g.rotate(ang); bone(g, 0, 0, 520, 28, 1, { fill: ease.out(prog(t, 0.75, 1.1)) }); g.restore();
    circle(g, ex, ey, 22, alpha(CREAM, 0.25)); ring(g, ex, ey, 22, 4, CREAM);                                             // the hinge
    // the biceps: a cream belly that shortens/fattens
    const mx0 = lerp(sx, ex, 0.18), mx1 = lerp(sx, ex, 0.86) - 40 * pull, my = lerp(sy, ey, 0.5) - 70;
    g.save(); g.strokeStyle = CREAM; g.lineWidth = 5; g.fillStyle = alpha('#e8a090', 0.25); g.beginPath(); g.ellipse((mx0 + mx1) / 2, my - 10 * pull, (mx1 - mx0) / 2, 48 + 26 * pull, Math.atan2(ey - sy, ex - sx), 0, 7); g.fill(); g.stroke(); g.restore();
    // the tendon: muscle end -> forearm just past the elbow (gold while pulling)
    const tx = ex + Math.cos(ang) * 70, ty = ey + Math.sin(ang) * 70 - 20;
    seg(g, [[mx1, my + 20], [tx, ty]], 9, pull > 0.01 ? GOLD : CREAM);
    if (pull > 0.05) arrow(g, tx, ty, lerp(tx, mx1, 0.45), lerp(ty, my + 20, 0.45), GOLD, 6);
    // the load: gold arrows running down the forearm bone
    const lk = ease.out(prog(t, 0.75, 1.3)); for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; if (lk > 0) { const px = lerp(fx, ex, u), py = lerp(fy, ey, u) - 40; g.save(); g.globalAlpha *= lk * Math.sin(u * Math.PI); arrow(g, px + Math.cos(ang) * 40, py + Math.sin(ang) * 40, px, py, GOLD, 6); g.restore(); } }
    // a weight in the hand
    g.save(); g.globalAlpha *= 0.9; dumbbell(g, fx + 30, fy, 1.4, CREAM); g.restore();
    label(g, t, { at: [lerp(mx1, tx, 0.5), lerp(my + 20, ty, 0.5)], to: [lerp(mx1, tx, 0.5) - 60, E.H * 0.24], str: 'tendon', start: 0.15 });
    label(g, t, { at: [lerp(ex, fx, 0.6), lerp(ey, fy, 0.6)], to: [lerp(ex, fx, 0.6) + 40, E.H * 0.82], str: 'the bones take the load', start: 1.25 });
    label(g, t, { at: [(mx0 + mx1) / 2, my - 40], to: [(mx0 + mx1) / 2 - 160, E.H * 0.2], str: 'muscle', start: 0.3 });
  });
} });

// s035 — BONE IS AMAZING: a thigh bone draws on; on 'A' (1.72) dive into its solid wall; '1 cm2' gold square cut out on 'fingernail' (4.02) + a fingernail outline
registerShot('s035', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - BONE IS AMAZING', fig: 'THE THIGH BONE' });
  const dive = ease.inOut(prog(t, 1.72, 2.8)), z = lerp(1, 1.12, ease.inOut(t / info.dur));
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // whole bone (fades + shrinks as we dive)
  g.save(); g.globalAlpha *= 1 - dive; g.translate(E.W / 2, E.H / 2); g.rotate(-0.25); bone(g, -560, 0, 560, 110, ease.inOut(prog(t, 0.1, 1.5))); g.restore();
  // the cross-section of the solid wall (cortical bone)
  if (dive > 0) { g.save(); g.globalAlpha *= dive; const cx = E.W * 0.42, cy = E.H * 0.52, R = 300 * lerp(0.6, 1, dive);
    g.fillStyle = alpha('#fff8e6', 0.18); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.arc(cx, cy, R * 0.55, 0, 7, true); g.fill();
    ring(g, cx, cy, R, 6, CREAM); ring(g, cx, cy, R * 0.55, 4, alpha(CREAM, 0.7));
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ring(g, cx + Math.cos(a) * R * 0.78, cy + Math.sin(a) * R * 0.78, 10, 2, alpha(CREAM, 0.5)); }
    text(g, 'solid wall', cx, cy - R - 34, { size: 34, color: CREAM, font: FONTS.ui, weight: 800 }); g.restore();
    // the 1 cm2 square cut out + fingernail
    const ck = ease.outBack(prog(t, 4.02, 4.3)); const qx = E.W * 0.42 + 230 * dive, qy = E.H * 0.52;
    g.save(); g.strokeStyle = GOLD; g.lineWidth = 6; g.setLineDash([12, 8]); g.strokeRect(qx - 36, qy - 36, 72, 72); g.restore();
    if (ck > 0.01) { const mx = lerp(qx, E.W * 0.74, ease.inOut(prog(t, 4.02, 4.4))); g.save(); g.translate(mx, qy); g.scale(ck * 1.8, ck * 1.8); rr(g, -36, -36, 72, 72, 6); g.fillStyle = alpha('#fff3c4', 0.85); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 4; g.stroke(); g.restore();
      num(g, '1 cm²', E.W * 0.74, qy + 120, 64, ck); g.save(); g.strokeStyle = CREAM; g.lineWidth = 4; g.globalAlpha *= ck; g.beginPath(); g.moveTo(E.W * 0.86 - 40, qy + 50); g.lineTo(E.W * 0.86 - 40, qy - 30); g.quadraticCurveTo(E.W * 0.86, qy - 80, E.W * 0.86 + 40, qy - 30); g.lineTo(E.W * 0.86 + 40, qy + 50); g.stroke(); g.restore();
      text(g, 'about a fingernail', E.W * 0.86, qy + 90, { size: 28, color: CREAM, font: FONTS.ui, weight: 800, alpha: ck }); } }
  g.restore();
} });

// s036 — AROUND TWO TONNES: the cube under a press; readout ~190 MPa -> ~1.9 t -> 'AROUND 2 TONNES' on 'tonnes' (1.33); a car + van stack on 'squeezing' (1.87)
function carIcon(g, x, y, w, col = CREAM) { g.save(); g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - w * 0.18); g.lineTo(x - w * 0.28, y - w * 0.2); g.lineTo(x - w * 0.15, y - w * 0.36); g.lineTo(x + w * 0.2, y - w * 0.36); g.lineTo(x + w * 0.34, y - w * 0.2); g.lineTo(x + w / 2, y - w * 0.18); g.lineTo(x + w / 2, y); g.closePath(); g.stroke(); ring(g, x - w * 0.28, y, w * 0.09, 4, col); ring(g, x + w * 0.28, y, w * 0.09, 4, col); g.restore(); }
function vanIcon(g, x, y, w, col = CREAM) { g.save(); g.strokeStyle = col; g.lineWidth = 4; g.strokeRect(x - w / 2, y - w * 0.42, w * 0.72, w * 0.42); g.beginPath(); g.moveTo(x + w * 0.22, y - w * 0.3); g.lineTo(x + w * 0.42, y - w * 0.3); g.lineTo(x + w / 2, y - w * 0.12); g.lineTo(x + w / 2, y); g.lineTo(x + w * 0.22, y); g.stroke(); ring(g, x - w * 0.3, y, w * 0.08, 4, col); ring(g, x + w * 0.32, y, w * 0.08, 4, col); g.restore(); }
registerShot('s036', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - SQUEEZED ALONG ITS LENGTH', fig: 'SOLID BONE' });
  push(g, t, info.dur, 0.04, (g) => {
    const cx = E.W * 0.27, cy = E.H * 0.66, s = 150, sq = Math.sin(t * 9) * 2 * prog(t, 1.87, 2.2);
    rr(g, cx - s / 2, cy - s / 2 + sq, s, s - sq, 8); g.fillStyle = alpha('#fff3c4', 0.8); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 5; g.stroke(); text(g, '1 cm²', cx, cy + s / 2 + 44, { size: 34, color: CREAM, font: FONTS.ui, weight: 900 });
    for (let i = -1; i <= 1; i++) { const u = (t * 1.2 + (i + 1) / 3) % 1; arrow(g, cx + i * 45, cy - s / 2 - 130 + u * 40, cx + i * 45, cy - s / 2 - 30 + u * 40 * 0.3, GOLD, 7); }
    const sk = ease.out(prog(t, 1.87, 2.3)); if (sk > 0) { const yy = lerp(cy - s / 2 - 420, cy - s / 2 - 10, sk); g.save(); g.globalAlpha *= sk; carIcon(g, cx, yy, 300); vanIcon(g, cx, yy - 110, 300); g.restore(); text(g, '~2 t', cx + 220, yy - 120, { size: 40, color: CREAM, font: FONTS.ui, weight: 900, alpha: sk }); }
    // the readout
    const rx = E.W * 0.68, ry = E.H * 0.42;
    if (t < 0.9) num(g, `~${Math.round(lerp(0, 190, ease.out(prog(t, 0.37, 0.85))))} MPa`, rx, ry, 110, ease.outBack(prog(t, 0.37, 0.6)));
    else if (t < 1.33) num(g, '~1.9 t', rx, ry, 120, 1);
    else { num(g, '~1.9 t', rx, ry - 130, 70, 1, alpha(GOLD, 0.6)); num(g, 'AROUND 2 TONNES', rx, ry + 10, 96, ease.outBack(prog(t, 1.33, 1.6))); }
    if (t > 0.9 && t < 1.33) text(g, '~190 MPa', rx, ry - 120, { size: 50, color: alpha(GOLD, 0.6), font: FONTS.ui, weight: 900 });
    text(g, 'solid wall of the bone, loaded along its length', E.W * 0.5, E.H * 0.9, { size: 28, color: alpha(CREAM, 0.8), font: FONTS.ui, weight: 800 });
  });
} });

// s037 — PULL, BEND OR TWIST: three sticks + short strength bars vs the long gold squeeze bar; they crack on 'much' (2.47)
registerShot('s037', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - PULL, BEND, TWIST', fig: 'SOLID BONE' });
  push(g, t, info.dur, 0.03, (g) => {
    const crk = prog(t, 2.47, 2.7), items = [['SQUEEZE', -1, 1.0], ['PULL', 0.27, 0.42], ['BEND', 0.73, 0.3], ['TWIST', 1.25, 0.22]];
    items.forEach(([nm, at, str], i) => { const x = E.W * (0.2 + i * 0.2), y = E.H * 0.42, k = i === 0 ? 1 : ease.out(prog(t, at, at + 0.4)); if (k <= 0.01) return;
      g.save(); g.globalAlpha *= k; g.translate(x, y);
      const bend = i === 2 ? 0.5 * k : 0, tw = i === 3 ? 1 : 0;
      g.strokeStyle = CREAM; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -150); g.quadraticCurveTo(bend * 120, 0, 0, 150); g.stroke(); g.strokeStyle = '#172238'; g.lineWidth = 24; g.stroke();
      if (tw) for (let j = 0; j < 5; j++) seg(g, [[-14, -110 + j * 55], [14, -86 + j * 55]], 3, CREAM);
      if (i === 0) for (const sd of [-1, 1]) arrow(g, 0, sd * 250, 0, sd * 180, GOLD, 6); else if (i === 1) for (const sd of [-1, 1]) arrow(g, 0, sd * 180, 0, sd * 250, CREAM, 6); else if (i === 2) arrow(g, 120, 0, 50, 0, CREAM, 6); else { g.strokeStyle = CREAM; g.lineWidth = 5; g.beginPath(); g.arc(0, -180, 40, 0.3, 5.5); g.stroke(); }
      if (i > 0 && crk > 0) { seg(g, [[-18, -10], [4, 6], [-6, 16], [20, 30]], 4, CORAL); glow(g, 0, 10, 60 * crk, CORAL, 0.4 * (1 - crk * 0.5)); }
      text(g, nm, 0, 230, { size: 40, color: i === 0 ? GOLD : CREAM, font: FONTS.ui, weight: 900 });
      // strength bar
      rr(g, -80, 290, 160, 22, 11); g.fillStyle = alpha(CREAM, 0.15); g.fill(); rr(g, -80, 290, 160 * str * k, 22, 11); g.fillStyle = i === 0 ? GOLD : CREAM; g.fill();
      g.restore(); });
    text(g, 'strength', E.W * 0.08, E.H * 0.42 + 302, { size: 28, color: alpha(CREAM, 0.8), font: FONTS.ui, weight: 800, align: 'left' });
  });
} });

// s038 — THE RACE: MUSCLE, TENDON, BONE bars start on 'Training' (0.15); '+' sparkles on 'stronger' (1.87); MUSCLE shoots ahead on 'more' (3.09)-'muscle.' (4.03)
registerShot('s038', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - TRAINING MAKES THEM ALL STRONGER', fig: 'MUSCLE / TENDON / BONE' });
  push(g, t, info.dur, 0.03, (g) => {
    const base = ease.out(prog(t, 0.15, 3.0)) * 0.3, fast = ease.inOut(prog(t, 3.09, 4.03)), x0 = E.W * 0.26, L = E.W * 0.58;
    [['MUSCLE', base + fast * 0.62, GOLD], ['TENDON', base + fast * 0.1, CREAM], ['BONE', base + fast * 0.07, CREAM]].forEach(([nm, v, col], i) => {
      const y = E.H * (0.36 + i * 0.17); text(g, nm, x0 - 30, y, { size: 44, color: col, font: FONTS.ui, weight: 900, align: 'right' });
      rr(g, x0, y - 22, L, 44, 22); g.fillStyle = alpha(CREAM, 0.12); g.fill(); rr(g, x0, y - 22, Math.max(44, L * v), 44, 22); g.fillStyle = col; g.fill();
      if (t > 1.87 && t < 2.8) sparks(g, t, 1.87, x0 + L * v, y, { n: 6, s: 0.5, seed: i + 4 });
    });
    label(g, t, { at: [x0 + L * 0.42, E.H * 0.53], to: [x0 + L * 0.62, E.H * 0.82], str: 'more slowly', start: 3.29 });
  });
} });

// s039 — TEEN ATHLETES (Mersmann et al. 2017): two gauges, the muscle needle overtakes the tendon needle on 'outpace' (1.81)
function gauge(g, x, y, r, v, label2, col) {
  g.save(); g.strokeStyle = alpha(CREAM, 0.5); g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.stroke();
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; seg(g, [[x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88], [x + Math.cos(a) * r, y + Math.sin(a) * r]], 3, alpha(CREAM, 0.6)); }
  const a = Math.PI + clamp(v) * Math.PI; seg(g, [[x, y], [x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85]], 8, col); circle(g, x, y, 12, col);
  text(g, label2, x, y + 60, { size: 40, color: col, font: FONTS.ui, weight: 900 }); g.restore();
}
function volleyball(g, x, y, r) { ring(g, x, y, r, 5, CREAM); g.save(); g.strokeStyle = CREAM; g.lineWidth = 4; g.beginPath(); g.arc(x - r * 0.4, y - r * 0.9, r, 0.6, 1.9); g.stroke(); g.beginPath(); g.arc(x + r * 0.95, y + r * 0.2, r, 2.4, 3.6); g.stroke(); g.beginPath(); g.arc(x - r * 0.6, y + r * 0.8, r, 4.9, 6.0); g.stroke(); g.restore(); }
function teenGauges(g, t, mus, ten) {
  gauge(g, E.W * 0.36, E.H * 0.66, 220, mus, 'MUSCLE strength', GOLD); gauge(g, E.W * 0.66, E.H * 0.66, 220, ten, 'TENDON stiffness', CREAM);
}
registerShot('s039', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - TEEN ATHLETES', fig: 'MERSMANN ET AL. 2017' });
  push(g, t, info.dur, 0.03, (g) => {
    const k = ease.out(prog(t, 0.13, 0.5)); g.save(); g.globalAlpha *= k; g.translate(lerp(-200, 0, k), 0); volleyball(g, E.W * 0.2, E.H * 0.22, 46); text(g, 'TEEN ATHLETES', E.W * 0.2 + 80, E.H * 0.22, { size: 50, color: CREAM, font: FONTS.ui, weight: 900, align: 'left' }); g.restore();
    const mus = 0.15 + 0.7 * ease.inOut(prog(t, 0.3, 2.3)), ten = 0.15 + 0.3 * ease.inOut(prog(t, 0.3, 2.8));
    teenGauges(g, t, mus, ten); if (t > 1.81 && t < 2.3) glow(g, E.W * 0.36, E.H * 0.6, 240, GOLD, 0.35 * (1 - prog(t, 1.81, 2.3)));
    if (t > 1.81) text(g, 'outpace', E.W * 0.51, E.H * 0.4, { size: 54, color: GOLD, font: FONTS.ui, weight: 900, alpha: ease.out(prog(t, 1.81, 2.1)) });
  });
} });

// s040 — THE GAP: a soft coral band between the two (on 'gap' 0.45) + chip 'MAY RAISE INJURY RISK' (MAY gold) on 'may' (0.67)
registerShot('s040', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - THE GAP', fig: 'MERSMANN ET AL. 2017' });
  push(g, t, info.dur, 0.04, (g) => {
    teenGauges(g, t, 0.85, 0.45);
    const k = ease.out(prog(t, 0.45, 0.9)); if (k > 0) { g.save(); g.globalAlpha *= 0.7 * k; rr(g, E.W * 0.45, E.H * 0.42, E.W * 0.12, 200, 24); g.fillStyle = alpha(CORAL, 0.35); g.fill(); g.strokeStyle = CORAL; g.lineWidth = 3; g.stroke(); g.restore();
      text(g, 'THE GAP', E.W * 0.51, E.H * 0.52, { size: 48, color: CORAL, font: FONTS.ui, weight: 900, alpha: k }); }
    const ck = ease.outBack(prog(t, 0.67, 1.0)); if (ck > 0.01) { g.save(); g.translate(E.W / 2, E.H * 0.24); g.scale(ck, ck); g.font = `900 52px "${FONTS.ui}"`; const w1 = g.measureText('MAY ').width, w2 = g.measureText('RAISE INJURY RISK').width, W2 = w1 + w2 + 70;
      rr(g, -W2 / 2, -46, W2, 92, 46); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = CORAL; g.lineWidth = 4; g.stroke();
      text(g, 'MAY', -W2 / 2 + 35, 2, { size: 52, color: GOLD, font: FONTS.ui, weight: 900, align: 'left' }); text(g, 'RAISE INJURY RISK', -W2 / 2 + 35 + w1, 2, { size: 52, color: CORAL, font: FONTS.ui, weight: 900, align: 'left' }); g.restore(); }
  });
} });

// s041 — THAT RECORD TOOK YEARS: the 501 kg barbell + a calendar flipping fast, lands on gold 'YEARS' (0.82)
registerShot('s041', { draw(g, t, info) {
  board(g, t, { title: 'FIG 2 - THE HEAVIEST DEADLIFT', fig: 'GUINNESS WORLD RECORDS' });
  push(g, t, info.dur, 0.04, (g) => {
    const cx = E.W * 0.5, cy = E.H * 0.36, flip = Math.floor(t * 14);
    for (let i = 0; i < 3; i++) { rr(g, cx - 130 + i * 8, cy - 150 + i * 8, 260, 260, 16); g.fillStyle = alpha(CREAM, 0.2 + i * 0.25); g.fill(); }
    rr(g, cx - 114, cy - 134, 260, 260, 16); g.fillStyle = CREAM; g.fill(); rr(g, cx - 114, cy - 134, 260, 60, 16); g.fillStyle = CORAL; g.fill();
    if (t < 0.82) text(g, String(1 + flip % 12), cx + 16, cy + 30, { size: 110, color: '#2a2418', font: FONTS.ui, weight: 900 }); else text(g, 'YEARS', cx + 16, cy + 30, { size: 64, color: '#2a2418', font: FONTS.ui, weight: 900 });
    for (let i = 0; i < Math.min(12, flip); i++) seg(g, [[E.W * 0.68 + i * 22, E.H * 0.24], [E.W * 0.68 + i * 22, E.H * 0.24 + 60]], 6, alpha(CREAM, 0.8));
    barbell(g, E.W / 2, E.H * 0.72, 0.9, 1);
    if (t > 0.82) { const k = ease.outBack(prog(t, 0.82, 1.1)); g.save(); g.translate(E.W * 0.5, E.H * 0.9); g.scale(k, k); text(g, 'YEARS', 0, 0, { size: 96, color: GOLD, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(GOLD, 0.6) }); g.restore(); }
    text(g, '501 kg', E.W * 0.22, E.H * 0.72, { size: 64, color: GOLD, font: FONTS.ui, weight: 900 });
  });
} });

// s042 — LEVEL-ELEVEN MUSCLES ON LEVEL-ZERO BONES: a comic x-ray panel (no injury, just a wobble); 'LV 0' on 1.54, spaghetti bend on 'snap' (2.96), coral 'SNAP?' on 3.30
function badge(g, x, y, r, str, fill, ink = '#0B0F1A') { circle(g, x, y, r, fill); ring(g, x, y, r, 4, alpha('#000', 0.3)); text(g, 'LV', x, y - r * 0.4, { size: r * 0.4, color: ink, font: FONTS.title, weight: 700 }); text(g, str, x, y + r * 0.18, { size: r * 0.9, color: ink, font: FONTS.title, weight: 700 }); }
registerShot('s042', { draw(g, t, info) {
  g.fillStyle = '#0B0F1A'; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(-0.04); g.scale(1 + 0.04 * ease.inOut(t / info.dur), 1 + 0.04 * ease.inOut(t / info.dur)); g.translate(-E.W / 2, -E.H / 2);
  rr(g, 220, 110, E.W - 440, E.H - 220, 30); g.fillStyle = '#141B2D'; g.fill(); g.strokeStyle = alpha(CREAM, 0.6); g.lineWidth = 5; g.stroke();
  for (let i = 0; i < 12; i++) seg(g, [[240, 140 + i * 70], [E.W - 240, 140 + i * 70]], 1, alpha(CREAM, 0.05));
  const sn = ease.inOut(prog(t, 2.96, 3.4)), wob = Math.sin(t * 12) * 14 * prog(t, 3.3, 3.5) * (1 - prog(t, 3.8, 4.3));
  const sx = E.W * 0.28, sy = E.H * 0.42, ex = E.W * 0.52, ey = E.H * 0.6, hx = E.W * 0.74, hy = E.H * 0.3;
  // the arm silhouette (faint) + glowing cyan muscle outline
  g.save(); g.shadowColor = CYAN; g.shadowBlur = 18; g.strokeStyle = CYAN; g.lineWidth = 6; g.beginPath(); g.ellipse((sx + ex) / 2, (sy + ey) / 2 - 60, 180, 80, Math.atan2(ey - sy, ex - sx), 0, 7); g.stroke(); g.beginPath(); g.ellipse((ex + hx) / 2, (ey + hy) / 2 - 30, 160, 60, Math.atan2(hy - ey, hx - ex), 0, 7); g.stroke(); g.restore();
  // the bones (cream) — bend like soft spaghetti on 'snap'
  const bend = 120 * sn + wob;
  g.strokeStyle = CREAM; g.lineWidth = 22; g.lineCap = 'round';
  g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + ex) / 2, (sy + ey) / 2 + bend, ex, ey); g.stroke();
  g.beginPath(); g.moveTo(ex, ey); g.quadraticCurveTo((ex + hx) / 2 + bend * 0.6, (ey + hy) / 2 + bend, hx, hy + bend * 0.5); g.stroke();
  // the bar he is lifting (bends with it)
  g.strokeStyle = CREAM; g.lineWidth = 10; g.beginPath(); g.moveTo(hx - 260, hy + bend * 0.5 - 10); g.quadraticCurveTo(hx, hy - 10 + bend * 0.9, hx + 260, hy + bend * 0.5 - 10); g.stroke();
  for (const sd of [-1, 1]) { rr(g, hx + sd * 240 - 18, hy + bend * 0.5 - 90 + sd * 0, 36, 160, 8); g.fillStyle = alpha(CREAM, 0.9); g.fill(); }
  // badges: the muscle LV 11 (a mini card), the bones LV 0 (grey)
  const mk = ease.outBack(prog(t, 0.7, 1.0)); if (mk > 0.01) { g.save(); g.translate(E.W * 0.36, E.H * 0.24); g.scale(mk, mk); rr(g, -150, -50, 300, 100, 50); g.fillStyle = alpha('#123A5E', 0.7); g.fill(); g.strokeStyle = CYAN; g.lineWidth = 4; g.stroke(); badge(g, -110, 0, 46, '11', GOLD); text(g, 'MUSCLES', 30, 2, { size: 36, color: CYAN, font: FONTS.title, weight: 700 }); g.restore(); }
  const bk = ease.outBack(prog(t, 1.54, 1.84)); if (bk > 0.01) { g.save(); g.translate(E.W * 0.42, E.H * 0.8); g.scale(bk, bk); rr(g, -150, -50, 300, 100, 50); g.fillStyle = alpha('#3a3e48', 0.85); g.fill(); g.strokeStyle = '#9aa0aa'; g.lineWidth = 4; g.stroke(); badge(g, -110, 0, 46, '0', '#9aa0aa'); text(g, 'BONES', 30, 2, { size: 36, color: '#d0d4dc', font: FONTS.title, weight: 700 }); g.restore(); }
  goldTag(g, t, 3.3, 'SNAP?', E.W * 0.7, E.H * 0.78, { size: 70, color: CORAL, rot: Math.sin(t * 10) * 0.08 * (1 - prog(t, 3.6, 4.2)) });
  g.restore();
} });
