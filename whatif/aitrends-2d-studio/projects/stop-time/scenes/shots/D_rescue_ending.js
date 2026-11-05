// D_rescue_ending.js — I.Awaken stop-time, batch D (s102-s133, 305.62-405.964 s), CLASSIC style.
// THE RESCUE (Wednesday breakfast, Biscuit hits the milk jug, it tips toward Mina's volcano, SNAP 5 'LIGHT: MOVING' / 'AIR: MOVING',
// RULE 3 chip, it would still be falling, slide the project away, the big mixing bowl under the frozen milk, time restarts + SPLASH,
// every drop in the bowl, Mina's dry project, giant face MINA, MINA lip-sync "Zero point zero seconds."); THE TWIST (something moved,
// Biscuit blinked + stretched + walked through the frozen kitchen, cats in impossible places, the snap fizzles, giant face HERO, tail
// flick, already eating your toast); ENDING (nobody can stop time, dark + no-air recap, Lene Hau's stopped light, recap chips, the
// QUESTION lock-up, end screen).
// Sets: morning.js (H4) kitchen, stopprops.js (H2) milk jug / bowl / volcano / butter / toast / stopwatch / kitchen clock, timebp.js (H3)
// hauLight + gpsClocks, bp board, hud chip, faces. freeze.js (H1) had not landed when this was written, so the FREEZE FX are LOCAL
// here (snap pose + ring ripple, freezeGrade, frozen sparkle, unfreeze streaks, the black view, the wall of air); swap for H1's at
// integration if wanted (same call sites: snapRing / freezeGrade / unfreeze).
// Local props: heroTrim (cowlick, tortoiseshell glasses, cream stripes + long sleeves, star pyjamas, green/yellow socks, chunky watch),
// the step bench by the fridge, the HUD read-out dial (gold digits), cupboard door + high shelf for the cat montage, the pause-clock.
// LEGAL: original story and designs; nothing from any film, show, anime, game or comic. Real people as plain text only.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, alpha, shade, mix, glow, linGrad, radGrad, text, FONTS, veil } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { cat } from '../sets/creatures.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove } from '../sets/acting.js';
import { giantFace, faceAt, FACE } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { board, label } from '../sets/bp.js';
import { morning, morningFg } from '../sets/morning.js';
import { stopwatch, wallClock, stickSec, milkJug, milkPour, mixingBowl, schoolProject, butterDish, toast } from '../sets/stopprops.js';
import { hauLight, gpsClocks } from '../sets/timebp.js';

const ui = () => S().ui, GOLD = '#FFC93C', INK = '#1a1622', CREAM = '#efe3c8';
const GY = E.H * 0.8, CX = E.W / 2;
const pop = (t, at, d = 0.35) => ease.outBack(prog(t, at, at + d));
const goldT = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 44, color: GOLD, font: o.font ?? FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1, glow: 12, glowColor: alpha(GOLD, 0.5), stroke: o.stroke, strokeColor: 'rgba(8,6,16,.9)' });
const creamT = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 30, color: CREAM, font: o.font ?? FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1, stroke: o.stroke, strokeColor: 'rgba(8,6,16,.9)' });
const W2 = (o, p) => { const s = (o.s ?? 1.9) * (o.kid ? 0.72 : 1); return [o.x + p[0] * s * (o.facing ?? 1), o.y + p[1] * s]; };
const toScreen = (cam, x, y) => { const z = cam.z ?? 1; return [CX + (x - CX - (cam.x || 0)) * z, E.H / 2 + (y - E.H / 2 - (cam.y || 0)) * z]; };
const P = (base, d) => ({ ...POSES[base], ...d });

// ------------------------------------------------------------------ the kitchen layout (world coords at cam z 1)
const TX = CX + 40, TT = GY - 240;                 // morning.js table centre + top
const BENCH = { x0: 1420, x1: 1790, top: GY - 150 };
const JUG0 = [1330, TT], BUT = [1150, TT], PROJ0 = [1555, BENCH.top - 6], PROJ1 = [1715, BENCH.top - 6];
const BOWL0 = [880, GY - 320 - 60], BOWL1 = [1545, BENCH.top - 62];   // counter -> bench (rim y)
const SILL = [800, GY - 320];                       // Biscuit's spot on the counter under the window
const JUGF = { x: 1408, y: TT + 30, rot: 1.35 };    // the jug frozen mid-tip
const kitchen = (g, t, cam, o = {}) => morning(g, t, cam, { view: 'kitchen', mood: o.mood ?? 'morning', jug: false, butter: false, juice: false, breakfast: true, ...o });
function bench(g) {
  const { x0, x1, top } = BENCH; g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse((x0 + x1) / 2, GY + 6, (x1 - x0) / 2 + 20, 14, 0, 0, 7); g.fill();
  for (const lx of [x0 + 30, x1 - 50]) { rr(g, lx, top + 20, 22, GY - top - 20, 4); g.fillStyle = '#8a5a34'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); }
  rr(g, x0, top, x1 - x0, 26, 6); g.fillStyle = linGrad(g, 0, top, 0, top + 26, ['#c8925a', '#9a6a3a']); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
}
function frozenMilk(g, T0 = 0.5, k = 0.62) {        // jug frozen at the table edge + the milk ribbon hanging in the air
  const sp = milkJug(g, JUGF.x, JUGF.y, 0.45, { rot: JUGF.rot, level: 0.6 });
  milkPour(g, T0, { from: sp, to: [1520, BENCH.top - 70], k, w: 18 });
  return sp;
}

// ------------------------------------------------------------------ HERO look (LOCAL trim over cast.js)
function heroTrim(g, o) {
  const p = o.pose || POSES.stand, s = o.s ?? 1.9, f = o.facing ?? 1, pt = (q) => q;
  g.save(); g.translate(o.x, o.y); g.scale(f * s, s); if (o.alpha != null) g.globalAlpha *= o.alpha; g.lineCap = 'round';
  const L = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  // long teal sleeves with cream stripes (both arms), cuffs at ~85 % of the forearm
  for (const [e, h, far] of [[p.eB, p.hB, 1], [p.eF, p.hF, 0]]) {
    const c = far ? shade('#2f8f8a', -0.25) : '#2f8f8a', end = L(e, h, 0.82);
    seg(g, [p.sh, e, end], 16, c);
    for (const [a0, a1, us] of [[p.sh, e, [0.35, 0.75]], [e, end, [0.3, 0.65, 0.95]]]) { const dx = a1[0] - a0[0], dy = a1[1] - a0[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d * 7, ny = dx / d * 7;
      for (const u of us) { const a = L(a0, a1, u); seg(g, [[a[0] - nx, a[1] - ny], [a[0] + nx, a[1] + ny]], 3.2, alpha(CREAM, far ? 0.55 : 0.9)); } }
  }
  // cream stripes across the tee
  for (const u of [0.22, 0.45, 0.68]) { const a = L(p.sh, p.hip, u); seg(g, [[a[0] - 9, a[1]], [a[0] + 9, a[1]]], 4.5, CREAM); }
  // chunky black digital watch (left wrist = near arm)
  { const w = L(p.eF, p.hF, 0.84); rr(g, w[0] - 6, w[1] - 7, 12, 14, 3); g.fillStyle = '#111116'; g.fill(); rr(g, w[0] - 3.5, w[1] - 4, 7, 8, 1.5); g.fillStyle = '#9aa88a'; g.fill(); }
  // tiny cream stars on the navy pyjama legs
  for (const [a, b] of [[p.hip, p.kF], [p.kF, p.fF], [p.hip, p.kB], [p.kB, p.fB]]) for (const u of [0.3, 0.75]) { const q = L(a, b, u); star(g, q[0] + 2, q[1], 2.6, CREAM); }
  // mismatched socks
  for (const [ft, kn, c] of [[p.fB, p.kB, '#ffd23c'], [p.fF, p.kF, '#3aa05a']]) { const a = L(ft, kn, 0.18); seg(g, [a, [ft[0] + 2, ft[1] - 2]], 13, c); }
  // cowlick + round tortoiseshell glasses
  const [hx, hy] = p.head; seg(g, [[hx - 4, hy - 22], [hx - 6, hy - 38], [hx - 1, hy - 46]], 5, '#16141c');
  g.strokeStyle = '#8a5a2b'; g.lineWidth = 2.6; for (const dx of [-6.5, 10]) { g.beginPath(); g.arc(hx + 9 + dx, hy - 4, 7.2, 0, 7); g.stroke(); }
  seg(g, [[hx + 9.7, hy - 4], [hx + 12.3, hy - 4]], 2.2, '#8a5a2b');
  g.restore();
}
function star(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); }
function hero(g, t, o) { const a = { s: 1.9, facing: 1, pose: POSES.stand, expr: 'happy', blink: blinkFlag(t, 3.1, 2), look: lookToward(o.facing ?? 1, 0), t, ...o }; actor(g, 'HERO', a); heroTrim(g, a); return a; }
function mina(g, t, o) { const a = { s: 2.0, facing: -1, pose: POSES.stand, expr: 'happy', blink: blinkFlag(t, 3, 1), look: lookToward(o.facing ?? -1, 0), t, ...o }; actor(g, 'MINA', a); return a; }
function dev(g, t, o) { const a = { s: 1.9, facing: 1, pose: POSES.phone, expr: 'smile', blink: blinkFlag(t, 3.3, 3), look: lookToward(o.facing ?? 1, 0), t, ...o }; actor(g, 'DEV', a);
  const h = W2(a, a.pose.hF); g.save(); g.translate(h[0], h[1] - 14); rr(g, -14, -24, 28, 46, 6); g.fillStyle = '#16161c'; g.fill(); circle(g, 0, -14, 3.5, '#d4262e'); g.restore(); return a; }
const minaStopwatch = (g, a) => { const sh = W2({ ...a, kid: true }, a.pose.sh); circle(g, sh[0] + 4 * (a.facing ?? 1), sh[1] + 34, 9, '#c8ced6'); };
const FROZEN = { blink: false };                  // frozen figures: never blink / idle

// ------------------------------------------------------------------ FREEZE FX (LOCAL stand-ins for freeze.js)
function freezeGrade(g, k, t = 0) {
  if (k <= 0.005) return; g.save();
  g.globalCompositeOperation = 'saturation'; g.fillStyle = alpha('#808080', 0.85 * k); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = alpha('#9ab4dc', 0.55 * k); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.globalCompositeOperation = 'source-over'; g.fillStyle = alpha('#16203a', 0.12 * k); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const R = rng(77); for (let i = 0; i < 46; i++) { const x = R() * E.W, y = R() * E.H, r = 1.5 + R() * 3; circle(g, x, y, r, alpha('#e8f0ff', (0.25 + R() * 0.35) * k)); }   // dust hanging still
  g.restore();
}
function vignette(g, a = 0.5) { g.save(); g.fillStyle = radGrad(g, CX, E.H / 2, E.H * 0.35, E.W * 0.75, ['rgba(0,0,0,0)', alpha('#05060f', a)]); g.fillRect(0, 0, E.W, E.H); g.restore(); }
function snapRing(g, t, at, x, y, o = {}) {        // the ring ripple from the fingertips; o.fizzle = the failed snap (soap bubble)
  const u = t - at; if (u < 0) return;
  if (o.fizzle) { const k = clamp(u / 0.45); if (k < 1) { ring(g, x, y, 14 + 80 * ease.out(k), 5, alpha(CREAM, 0.9 * (1 - k * 0.4))); glow(g, x - 10, y - 10, 30, '#ffffff', 0.25 * (1 - k)); }
    else { const q = clamp((u - 0.45) / 0.35); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; circle(g, x + Math.cos(a) * (70 + q * 40), y + Math.sin(a) * (70 + q * 40) + q * q * 40, 8 * (1 - q) + 2, alpha(CREAM, 1 - q)); } } return; }
  for (let i = 0; i < 3; i++) { const k = clamp((u - i * 0.08) / 0.6); if (k <= 0 || k >= 1) continue; const r = 20 + ease.out(k) * 2300; ring(g, x, y, r, 10 * (1 - k) + 2, alpha(i ? '#bcd8ff' : CREAM, 0.8 * (1 - k))); }
  const sp = clamp(u / 0.25); if (sp < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; seg(g, [[x + Math.cos(a) * (14 + sp * 30), y + Math.sin(a) * (14 + sp * 30)], [x + Math.cos(a) * (30 + sp * 60), y + Math.sin(a) * (30 + sp * 60)]], 5 * (1 - sp), GOLD); }
}
function stillSpark(g, t, x, y, s = 1) { const k = 0.6 + 0.4 * Math.sin(t * 5 + x * 0.01); star(g, x, y, 9 * s * k, alpha(CREAM, 0.85)); }
function unfreeze(g, t, at) { const k = clamp((t - at) / 0.45); if (k <= 0 || k >= 1) return; g.save(); g.globalCompositeOperation = 'lighter'; const R = rng(9);
  for (let i = 0; i < 22; i++) { const y = R() * E.H, x = -300 + (R() * 0.6 + k * 1.6) * E.W, l = 200 + R() * 400; seg(g, [[x, y], [x + l, y]], 3 + R() * 4, alpha('#ffe8c8', 0.35 * Math.sin(k * Math.PI))); } g.restore(); }
// the HUD read-out: H2's stopwatch as a small dial top-right, gold digits over its window
function readout(g, t, sec, o = {}) {
  const x = o.x ?? E.W - 150, y = o.y ?? 190, s = o.s ?? 0.55, a = o.alpha ?? 1; if (a <= 0.01) return;
  g.save(); g.globalAlpha *= a; stopwatch(g, t, { x, y, s, sec, running: 0 });
  g.translate(x, y); g.scale(s, s); rr(g, -84, 20, 168, 68, 12); g.fillStyle = '#120e1a'; g.fill(); g.strokeStyle = GOLD; g.lineWidth = 4; g.stroke();
  const str = (o.blank ? '' : sec.toFixed(1).padStart(4, '0')); text(g, str, 0, 56, { size: 52, color: GOLD, font: FONTS.ui, weight: 900, glow: 12, glowColor: alpha(GOLD, 0.6) });
  if (sec >= 9.95 && !o.noDing) glow(g, 0, 54, 160, GOLD, 0.25 * clamp(1 - (t - (o.dingAt ?? 0)) / 0.6));
  g.restore();
}
const runOut = (t, dur, a, b) => lerp(a, b, clamp(t / dur));
function tickChip(g, t, at, str, x, y) {            // a cream chip with a gold tick
  const p = pop(t, at); if (p <= 0.01) return; g.save(); g.translate(x, y); g.scale(p, p);
  g.font = `900 38px "${FONTS.ui}"`; const w = g.measureText(str).width + 110; rr(g, -w / 2, -34, w, 68, 34); g.fillStyle = 'rgba(14,10,20,.88)'; g.fill(); g.strokeStyle = CREAM; g.lineWidth = 3; g.stroke();
  text(g, str, 22, 2, { size: 38, color: CREAM, font: FONTS.ui, weight: 900, spacing: 1 }); seg(g, [[-w / 2 + 26, 2], [-w / 2 + 38, 14], [-w / 2 + 60, -14]], 7, GOLD); g.restore();
}
function cross(g, t, at, x, y, r = 120) { const k = ease.out(prog(t, at, at + 0.25)); if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(-0.05); g.lineCap = 'round';
  for (const s of [1, -1]) { g.beginPath(); g.moveTo(-r * s, -r); g.lineTo(lerp(-r * s, r * s, k), lerp(-r, r, k)); g.strokeStyle = 'rgba(8,6,16,.6)'; g.lineWidth = 34; g.stroke(); g.strokeStyle = ui().accent || '#ff6a5a'; g.lineWidth = 24; g.stroke(); } g.restore(); }

// snap pose (hand up by the face, fingers about to click) — the fingertip point for the ring
const SNAP = P('stand', { eF: [26, -150], hF: [30, -198], head: [3, -208] });
const snapTip = (o) => W2(o, [o.pose.hF[0] + 6, o.pose.hF[1] - 8]);

// ================================================================== THE RESCUE
// s102 WEDNESDAY. BREAKFAST. (2.61)
registerShot('s102', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.96, 1.03], y: [-10, -10], drift: 0.5 }), M = kitchen(g, t, cam);
  layer(g, cam, 1, (g) => {
    bench(g); schoolProject(g, t, PROJ0[0], PROJ0[1], 0.32); butterDish(g, BUT[0], BUT[1], 0.4); milkJug(g, JUG0[0], JUG0[1], 0.45, { level: 0.7 }); mixingBowl(g, BOWL0[0], BOWL0[1], 0.35);
    toast(g, TX - 230, TT - 18, 0.3, { butter: 1, rot: 0.1 });
    cat(g, { x: SILL[0], y: SILL[1], s: 1.2, facing: 1, pose: 'loaf', eyes: t > 1.44 ? 'glint' : 'open', tilt: t > 1.44 ? 0.12 : 0, t, rim: M.rim });
    dev(g, t, { x: 470, y: GY, facing: 1, pose: idle(POSES.phone, t, 3), look: lookToward(1, 0.1), rim: M.rim });
    const h = hero(g, t, { x: 690, y: GY + 10, facing: 1, pose: idle(P('holdFront', {}), t, 2), expr: 'happy', rim: M.rim });
    const hd = W2(h, h.pose.hF); toast(g, hd[0] + 6, hd[1] - 10, 0.22, { butter: 1, bite: 0.34, rot: -0.2 });
    const m = mina(g, t, { x: 1835, y: GY, facing: -1, pose: idle(P('reach', { hF: [52, -118], eF: [30, -140] }), t, 1), expr: 'happy', look: lookToward(-1, 0.5), rim: M.rim }); minaStopwatch(g, m);
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
  FX.dust(g, t, { count: 18, color: '#ffe0b0', a: 0.18, seed: 12 });
  chip(g, t, { str: 'WEDNESDAY', at: 0.15, x: 260, y: 110 });
} });

// s103 BISCUIT LEAPS AGAIN, HITS THE MILK JUG (3.59) — whip pan with her
registerShot('s103', { draw(g, t, info) {
  const wp = ease.inOut(prog(t, 0.35, 1.4)), cam = { ...camMove(t, info.dur, { z: [1.45, 1.5], drift: 0.6 }), x: lerp(-180, 330, wp), y: 30 }, M = kitchen(g, t, cam);
  const L = clamp((t - 0.51) / 1.7), lx = lerp(SILL[0], 1520, L), ly = lerp(SILL[1], GY, L * L * 0.9 + L * 0.1) - Math.sin(L * Math.PI) * 170;
  const rock = t > 1.97 ? Math.sin((t - 1.97) * 14) * 0.22 * Math.exp(-(t - 1.97) * 2.2) : 0;
  layer(g, cam, 1, (g) => {
    bench(g); schoolProject(g, t, PROJ0[0], PROJ0[1], 0.32); butterDish(g, BUT[0], BUT[1], 0.4); mixingBowl(g, BOWL0[0], BOWL0[1], 0.35);
    milkJug(g, JUG0[0], JUG0[1], 0.45, { level: 0.7, rot: rock });
    if (t < 0.51) cat(g, { x: SILL[0], y: SILL[1], s: 1.2, facing: 1, pose: 'arch', eyes: 'glint', t, rim: M.rim });
    else if (L < 1) { g.save(); g.translate(lx, ly); g.rotate(lerp(-0.35, 0.3, L)); cat(g, { x: 0, y: 0, s: 1.2, facing: 1, pose: 'stand', eyes: 'wide', t, walk: t * 8, rim: M.rim }); g.restore(); }
    else cat(g, { x: 1520, y: GY, s: 1.2, facing: 1, pose: 'stand', eyes: 'offended', t, rim: M.rim });
    if (t > 1.97 && t < 2.4) FX.burst?.(g, t - 1.97, { x: JUG0[0] + 20, y: JUG0[1] - 70, color: CREAM, n: 8 });
  });
  if (t > 0.5 && t < 1.4) { g.save(); g.globalAlpha = 0.25 * Math.sin(prog(t, 0.5, 1.4) * Math.PI); for (let i = 0; i < 14; i++) seg(g, [[0, 80 + i * 70], [E.W, 80 + i * 70 + 10]], 2, '#ffffff'); g.restore(); }
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });

// jug path for s104 (tipping off the edge, slow) — ends at the frozen pose JUGF
const jugTip = (p) => ({ x: lerp(JUG0[0], JUGF.x, ease.inOut(p)), y: lerp(JUG0[1], JUGF.y, ease.in(p)), rot: lerp(0, JUGF.rot, ease.inOut(p)) });
// s104 IT TIPS TOWARD MINA'S PROJECT (4.18) — close, slow-motion
registerShot('s104', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [2.0, 2.12], drift: 0.3 }), x: 470, y: 120 }, M = kitchen(g, t, cam);
  const p = prog(t, 0.24, 4.0), J = jugTip(p);
  layer(g, cam, 1, (g) => {
    mina(g, t, { x: 1860, y: GY, facing: -1, alpha: 0.85, pose: poseAt(t, [[0, 'stand'], [2.2, 'handsOnHead']]), expr: exprAt(t, [[0, 'surprised'], [2.2, 'shocked']]), look: lookToward(-1, 0.6), rim: M.rim });
    bench(g); schoolProject(g, t, PROJ0[0], PROJ0[1], 0.32);
    const sp = milkJug(g, J.x, J.y, 0.45, { rot: J.rot, level: 0.7 - p * 0.1 });
    const k = prog(t, 1.4, 4.0) * 0.62; if (k > 0) milkPour(g, t * 0.4, { from: sp, to: [1520, BENCH.top - 70], k, w: 18 });
  });
  if (t > 2.2 && t < 3.6) { const [sx, sy] = toScreen(cam, PROJ0[0], PROJ0[1] - 60); g.save(); g.setLineDash([16, 12]); g.strokeStyle = alpha(GOLD, 0.7 * Math.sin(prog(t, 2.2, 3.6) * Math.PI)); g.lineWidth = 6; g.beginPath(); g.arc(sx, sy, 150, 0, 7); g.stroke(); g.restore(); }
  vignette(g, 0.35);
} });

// frozen rescue frame (s105-s110): world + frozen family, then grade, then the warm HERO + HUD
function frozenKitchen(g, t, cam, o = {}) {
  const M = kitchen(g, 0.2, cam);                     // the set's own motion stops: draw it at a fixed time
  layer(g, cam, 1, (g) => {
    bench(g);
    if (!o.noProject) schoolProject(g, 0, lerp(PROJ0[0], PROJ1[0], o.slide ?? 0), PROJ0[1], 0.32);
    butterDish(g, BUT[0], BUT[1], 0.4); toast(g, TX - 230, TT - 18, 0.3, { butter: 1, rot: 0.1 });
    if (!o.bowlHeld) { const b = o.bowlAt ?? BOWL0; mixingBowl(g, b[0], b[1], 0.35); }
    frozenMilk(g);
    if (!o.noCat) cat(g, { x: o.catX ?? 1520, y: GY, s: 1.2, facing: 1, pose: 'stand', eyes: 'offended', t: 0.7, rim: M.rim });
    dev(g, 0.4, { x: 470, y: GY, facing: 1, pose: POSES.phone, ...FROZEN, rim: M.rim });
    const m = mina(g, 0.3, { x: 1860, y: GY, facing: -1, pose: POSES.handsOnHead, expr: 'shocked', ...FROZEN, look: lookToward(-1, 0.6), rim: M.rim }); minaStopwatch(g, m);
    if (!o.noSpark) { stillSpark(g, t, 470 + 60, GY - 420); stillSpark(g, t, 1860 - 40, GY - 330); stillSpark(g, t, JUGF.x + 60, JUGF.y - 60, 0.8); }
  });
  return M;
}
// s105 SNAP. LIGHT: MOVING. (2.69)
registerShot('s105', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.5, 1.56], drift: t < 0.14 ? 0.6 : 0 }), x: 260, y: 40 };
  const T = t < 0.14 ? t : 0.14, M = kitchen(g, T + 0.5, cam), k = ease.inOut(prog(t, 0.14, 0.54)), J = jugTip(1);
  layer(g, cam, 1, (g) => { bench(g); schoolProject(g, 0, PROJ0[0], PROJ0[1], 0.32); mixingBowl(g, BOWL0[0], BOWL0[1], 0.35); butterDish(g, BUT[0], BUT[1], 0.4); frozenMilk(g, T + 0.5); });
  if (k > 0.5) { const [sx, sy] = toScreen(cam, JUGF.x + 60, JUGF.y - 60); stillSpark(g, t, sx, sy); }
  freezeGrade(g, k, t);
  // window light keeps shimmering: a warm shaft drawn after the grade
  { const [wx, wy] = toScreen(cam, SILL[0] - 120, GY - 560); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#ffd9a0', 0.08 + 0.04 * Math.sin(t * 9)); g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + 300, wy); g.lineTo(wx + 900, E.H); g.lineTo(wx + 300, E.H); g.closePath(); g.fill(); g.restore(); }
  const h = hero(g, t, { x: 330, y: E.H + 330, s: 3.6, facing: 1, pose: poseAt(t, [[0, 'stand'], [0.02, SNAP]], 0.1), expr: t < 0.3 ? 'determined' : 'smirk', look: lookToward(1, 0.2) });
  const tip = snapTip(h); snapRing(g, t, 0.14, tip[0], tip[1]);
  tickChip(g, t, 1.4, 'LIGHT: MOVING', 330, E.H - 110);
  readout(g, t, runOut(t - 0.14, info.dur - 0.14, 0, 1.5), {});
} });
// s106 AIR: MOVING. YOU TAKE A BREATH. (2.98)
registerShot('s106', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.3, 1.34], drift: 0 }), x: 160, y: 30 };
  frozenKitchen(g, t, cam, {}); freezeGrade(g, 1, t);
  const br = Math.sin(clamp((t - 1.85) / 0.9) * Math.PI);
  layer(g, cam, 1, (g) => { const pose = P('stand', { sh: [0, -174 - br * 6], head: [4, -208 - br * 7], eF: [12, -137 - br * 4], hF: [16, -101 - br * 3] });
    hero(g, t, { x: 1180, y: GY, facing: 1, pose, expr: exprAt(t, [[0, 'thinking'], [1.9, 'determined']]), look: lookToward(1, 0.15) });
    if (t > 2.3) { const u = clamp((t - 2.3) / 0.6); for (let i = 0; i < 3; i++) circle(g, 1180 + 50 + u * 60 + i * 14, GY - 395 + i * 6, 6 + u * 8, alpha('#ffffff', 0.4 * (1 - u))); } });
  tickChip(g, 0.9, 0, 'LIGHT: MOVING', 330, E.H - 200); tickChip(g, t, 0.33, 'AIR: MOVING', 300, E.H - 110);
  readout(g, t, runOut(t, info.dur, 1.5, 3.0));
} });
// s107 RULE THREE: CAN'T PUT THE JUG BACK (3.54)
registerShot('s107', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.75, 1.82], drift: 0 }), x: 340, y: -10 };
  frozenKitchen(g, t, cam, {}); freezeGrade(g, 1, t);
  const r = ease.out(prog(t, 1.2, 2.37)), stop = t > 2.37 ? Math.sin((t - 2.37) * 18) * 2 * Math.exp(-(t - 2.37) * 5) : 0;
  layer(g, cam, 1, (g) => hero(g, t, { x: 1250, y: GY, facing: 1, pose: P('reach', { eF: [lerp(12, 46, r), lerp(-137, -160, r)], hF: [lerp(16, 86 + stop, r), lerp(-101, -150, r)] }), expr: exprAt(t, [[0, 'neutral'], [2.37, 'thinking']]), look: lookToward(1, 0.35) }));
  const a = pop(t, 2.37); if (a > 0.01) { const [x, y] = toScreen(cam, JUGF.x + 30, JUGF.y - 40); g.save(); g.translate(x + 120, y - 20); g.scale(a, a); seg(g, [[0, -70], [0, 70]], 16, 'rgba(8,6,16,.6)'); seg(g, [[0, -70], [0, 60]], 11, GOLD); poly(g, [[-30, 50], [30, 50], [0, 100]], GOLD); goldT(g, 'v', 34, -40, { size: 40, font: FONTS.title }); g.restore(); }
  chip(g, t, { str: "RULE 3: MOTION DOESN'T PAUSE.", at: 0.19, x: E.W / 2, y: 110 });
  readout(g, t, runOut(t, info.dur, 3.0, 5.0));
} });
// s108 IT WOULD STILL BE FALLING (1.78) — blueprint inset over the frozen kitchen
registerShot('s108', { draw(g, t, info) {
  const cam = { z: 1.3, x: 160, y: 30 }; frozenKitchen(g, t, cam, { noSpark: true }); freezeGrade(g, 1, t); veil(g, '#05060f', 0.35);
  const a = ease.out(prog(t, 0, 0.25)), x0 = E.W / 2 - 520, y0 = E.H / 2 - 330, w = 1040, h = 660;
  g.save(); g.globalAlpha *= a; rr(g, x0, y0, w, h, 24); g.fillStyle = '#16264a'; g.fill(); g.strokeStyle = CREAM; g.lineWidth = 5; g.stroke();
  g.save(); g.beginPath(); rr(g, x0, y0, w, h, 24); g.clip(); g.strokeStyle = alpha('#9fc4ff', 0.14); g.lineWidth = 2; for (let x = x0; x < x0 + w; x += 52) seg(g, [[x, y0], [x, y0 + h]], 2, alpha('#9fc4ff', 0.14)); for (let y = y0; y < y0 + h; y += 52) seg(g, [[x0, y], [x0 + w, y]], 2, alpha('#9fc4ff', 0.14));
  const tx = x0 + 260, ty = y0 + 420; seg(g, [[x0 + 60, ty], [x0 + 620, ty]], 6, CREAM); seg(g, [[x0 + 120, ty], [x0 + 120, y0 + h]], 5, CREAM); seg(g, [[x0 + 560, ty], [x0 + 560, y0 + h]], 5, CREAM);
  creamT(g, 'PUT IT BACK...', tx + 40, y0 + 90, { size: 34 });
  const f = ease.in(prog(t, 0.71, 1.5)), jx = lerp(x0 + 480, x0 + 760, f), jy = lerp(ty, y0 + h + 120, f * f), jr = f * 2.2;
  g.save(); g.setLineDash([12, 10]); g.globalAlpha *= 0.95; milkJug(g, jx, jy, 0.8, { rot: jr, level: 0.6 }); g.restore();
  g.save(); g.translate(jx + 90, jy - 120); seg(g, [[0, -60], [0, 60]], 10, GOLD); poly(g, [[-24, 50], [24, 50], [0, 92]], GOLD); g.restore();
  if (t > 0.71) goldT(g, 'STILL FALLING', x0 + 780, y0 + 160, { size: 40, alpha: prog(t, 0.71, 0.95) });
  g.restore(); g.restore();
  readout(g, t, runOut(t, info.dur, 5.0, 6.0));
} });
// s109 SLIDE MINA'S PROJECT AWAY (2.42)
registerShot('s109', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.7, 1.75], drift: 0 }), x: 560, y: 70 }, sl = ease.inOut(prog(t, 0.47, 1.83));
  frozenKitchen(g, t, cam, { noProject: true });
  layer(g, cam, 1, (g) => schoolProject(g, t, lerp(PROJ0[0], PROJ1[0], sl), PROJ0[1], 0.32));
  freezeGrade(g, 1, t);
  layer(g, cam, 1, (g) => { const px = lerp(PROJ0[0], PROJ1[0], sl); hero(g, t, { x: px - 30, y: GY + 60, facing: 1, pose: P('holdFront', { eF: [30, -128], hF: [62, -120], eB: [26, -126], hB: [56, -130], head: [12, -200] }), expr: 'determined', look: lookToward(1, 0.6) }); });
  if (t > 0.47 && t < 2) { const [x, y] = toScreen(cam, lerp(PROJ0[0], PROJ1[0], sl) - 140, PROJ0[1] - 40); for (let i = 0; i < 3; i++) seg(g, [[x - 40 - i * 30, y + i * 20], [x - 140 - i * 30, y + i * 20]], 4, alpha(CREAM, 0.5)); }
  readout(g, t, runOut(t, info.dur, 6.0, 8.0));
} });
// s110 THE BIG MIXING BOWL UNDERNEATH (3.22)
registerShot('s110', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.32, 1.36], drift: 0 }), x: 260, y: 60 };
  const lift = ease.inOut(prog(t, 0.59, 1.0)), carry = ease.inOut(prog(t, 1.0, 2.29)), down = t > 2.29;
  frozenKitchen(g, t, cam, { slide: 1, bowlHeld: !down && t > 0.59, bowlAt: down ? BOWL1 : BOWL0 });
  freezeGrade(g, 1, t);
  layer(g, cam, 1, (g) => {
    const hx = lerp(1060, 1380, carry) - (down ? ease.out(prog(t, 2.35, 2.8)) * 120 : 0), face = t < 1.0 ? -1 : 1;
    const pose = down ? POSES.cheer : t < 0.59 ? P('reach', {}) : P('holdFront', { eF: [30, -128], hF: [64, -124], eB: [26, -126], hB: [58, -132] });
    const h = hero(g, t, { x: hx, y: GY, facing: face, pose, expr: exprAt(t, [[0, 'determined'], [2.3, 'smirk']]), look: lookToward(face, 0.4) });
    if (t > 0.59 && !down) { const hd = W2(h, pose.hF), bx = lerp(BOWL0[0], hd[0], lift), by = lerp(BOWL0[1], hd[1] - 10, lift); const bx2 = lerp(bx, BOWL1[0], ease.inOut(prog(t, 1.57, 2.29))), by2 = lerp(by, BOWL1[1], ease.inOut(prog(t, 1.57, 2.29))); mixingBowl(g, bx2, by2, 0.35); }
    if (down) frozenMilk(g);                                    // the frozen ribbon stays in front, now aimed into the bowl
  });
  readout(g, t, runOut(t, info.dur - 0.25, 8.0, 10.0), { dingAt: info.dur - 0.25 });
} });

// s111 TIME RESTARTS. SPLASH. (2.83)
registerShot('s111', { draw(g, t, info) {
  const sh = t > 1.71 ? Math.sin((t - 1.71) * 40) * 10 * Math.exp(-(t - 1.71) * 5) : 0;
  const cam = { ...camMove(t, info.dur, { z: [1.85, 1.9], drift: 0.4 }), x: 480 + sh, y: 40 + sh * 0.6 }, M = kitchen(g, t, cam);
  const f = ease.in(prog(t, 0.11, 1.71)), jx = lerp(JUGF.x, BOWL1[0] - 20, f), jy = lerp(JUGF.y, BOWL1[1] + 10, f), jr = lerp(JUGF.rot, 2.4, f);
  layer(g, cam, 1, (g) => {
    bench(g); schoolProject(g, t, PROJ1[0], PROJ1[1], 0.32);
    g.save(); g.beginPath(); g.rect(0, 0, E.W * 2, BOWL1[1] + 40); g.clip(); const sp = milkJug(g, jx, jy, 0.45, { rot: jr, level: 0.6 * (1 - f) }); g.restore();
    mixingBowl(g, BOWL1[0], BOWL1[1], 0.35, { fill: 0.3 + 0.6 * prog(t, 0.3, 1.9), splash: prog(t, 1.71, 2.4) });
    if (t < 1.71) milkPour(g, t, { from: sp, to: [BOWL1[0], BOWL1[1] - 4], k: 1, w: 18 });
    if (t > 1.71) { const u = prog(t, 1.71, 2.5), R = rng(31); for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.1 + R() * 0.8), v = 120 + R() * 220; circle(g, BOWL1[0] + Math.cos(a) * v * u * 0.8, BOWL1[1] - 10 + Math.sin(a) * v * u + 260 * u * u, 7 * (1 - u) + 2, alpha('#fbfbf6', 1 - u * 0.6)); }
      const c = ease.out(clamp((t - 1.71) / 0.3)) * (1 - prog(t, 2.0, 2.6)); for (let i = 0; i < 9; i++) { const x = BOWL1[0] - 60 + i * 15; poly(g, [[x - 6, BOWL1[1]], [x, BOWL1[1] - 50 * c - (i % 2) * 18 * c], [x + 6, BOWL1[1]]], alpha('#fbfbf6', c)); } }
    mina(g, t, { x: 1860, y: GY, facing: -1, pose: poseAt(t, [[0, 'handsOnHead'], [1.9, 'stand']]), expr: exprAt(t, [[0, 'shocked'], [1.9, 'surprised']]), look: lookToward(-1, 0.6), rim: M.rim });
  });
  freezeGrade(g, 1 - ease.out(prog(t, 0.11, 0.45)), t); unfreeze(g, t, 0.11);
  if (t > 1.71 && t < 2.2) glow(g, ...toScreen(cam, BOWL1[0], BOWL1[1]), 320, '#ffffff', 0.35 * (1 - prog(t, 1.71, 2.2)));
} });
// s112 EVERY DROP LANDS IN THE BOWL (2.14) — macro
registerShot('s112', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [3.0, 3.1], drift: 0.2 }), x: BOWL1[0] - CX, y: BOWL1[1] - E.H / 2 + 10 }; kitchen(g, t, cam);
  layer(g, cam, 1, (g) => { bench(g); mixingBowl(g, BOWL1[0], BOWL1[1], 0.35, { fill: 0.92 });
    for (const [at, dx] of [[0.4, -30], [0.68, 24], [1.0, -6], [1.16, 40]]) { const u = (t - at + 0.3) / 0.3; if (u > 0 && u < 1) circle(g, BOWL1[0] + dx, lerp(BOWL1[1] - 160, BOWL1[1] + 2, u), 4, '#ffffff'); const r = (t - at) / 0.6; if (r > 0 && r < 1) { g.save(); g.strokeStyle = alpha('#c8d4e8', 1 - r); g.lineWidth = 2; g.beginPath(); g.ellipse(BOWL1[0] + dx, BOWL1[1] + 4, 6 + r * 30, 2 + r * 8, 0, 0, 7); g.stroke(); g.restore(); } } });
  tickChip(g, t, 1.24, 'EVERY DROP', E.W / 2, E.H - 120);
  vignette(g, 0.3);
} });
// s113 MINA LOOKS AT HER DRY PROJECT (2.36)
registerShot('s113', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.85, 1.92], drift: 0.4 }), x: 760, y: 60 }, M = kitchen(g, t, cam);
  layer(g, cam, 1, (g) => { bench(g); mixingBowl(g, BOWL1[0], BOWL1[1], 0.35, { fill: 0.92 }); schoolProject(g, t, PROJ1[0], PROJ1[1], 0.32);
    const touch = ease.inOut(prog(t, 0.6, 1.1)) * (1 - ease.inOut(prog(t, 1.7, 2.2)));
    mina(g, t, { x: 1880, y: GY, facing: -1, pose: idle(P('reach', { eF: [26, -140], hF: [lerp(20, 58, touch), lerp(-112, -128, touch)], head: [10, -200] }), t, 1), expr: exprAt(t, [[0, 'shocked'], [1.12, 'thinking']]), look: lookToward(-1, 0.8), blink: blinkFlag(t, 2.6, 1), rim: M.rim }); });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });
// s114 GIANT FACE MINA (3.22)
registerShot('s114', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], drift: 0.2 }); kitchen(g, t, { z: 1.9, x: 700, y: -60 }); veil(g, '#1a0e0a', 0.25);
  g.save(); g.translate(CX, E.H / 2); g.scale(cam.z, cam.z); g.translate(-CX, -E.H / 2);
  const f = faceAt(t, [[0, 'neutral'], [0.52, 'suspicious'], [1.92, 'squint']]);
  f.look = t < 0.52 ? [-0.5, 0] : t < 1.92 ? [0, 0] : [0, 0.8];
  giantFace(g, CX, E.H * 0.5, 330, { who: 'MINA', f, rimColor: '#ffc68a', rimSide: -1, blink: blinkFlag(t, 2.7, 1) ? 1 : 0, breath: Math.sin(t * 2) });
  g.restore();
  const k = ease.out(prog(t, 1.7, 2.3)); if (k > 0) { stopwatch(g, t, { x: CX + 120, y: E.H + 120 - k * 260, s: 0.9, sec: 0, label: "MINA'S" }); }
} });
// s115 "ZERO POINT ZERO SECONDS." (3.09) — two-shot, MINA lip-sync
registerShot('s115', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.6, 1.68], drift: 0.3 }), x: 520, y: 40 }, M = kitchen(g, t, cam);
  const talk = t > 0.15 && t < 1.16 ? Math.abs(Math.sin((t - 0.15) * 15)) * 0.9 : 0;
  layer(g, cam, 1, (g) => {
    bench(g); mixingBowl(g, BOWL1[0], BOWL1[1], 0.35, { fill: 0.92 }); schoolProject(g, t, PROJ1[0], PROJ1[1], 0.32);
    hero(g, t, { x: 1250, y: GY, facing: 1, pose: idle(P('shrug', {}), t, 2), expr: exprAt(t, [[0, 'smirk'], [1.2, 'nervous']]), look: lookToward(1, 0.2) });
    mina(g, t, { x: 1640, y: GY, facing: -1, pose: idle(P('point', { eF: [30, -150], hF: [56, -170] }), t, 1), expr: 'determined', talk, look: lookToward(-1, -0.1), blink: blinkFlag(t, 2.9, 1), rim: M.rim });
  });
  const [sx, sy] = toScreen(cam, 1640 - 125, GY - 262), k = pop(t, 0.15);
  if (k > 0.01) { g.save(); g.translate(sx, sy); g.scale(k, k); stopwatch(g, t, { x: 0, y: 0, s: 0.42, sec: 0 }); g.scale(0.42, 0.42); rr(g, -84, 20, 168, 68, 12); g.fillStyle = '#120e1a'; g.fill(); g.strokeStyle = GOLD; g.lineWidth = 4; g.stroke(); text(g, '0.0', 0, 56, { size: 56, color: GOLD, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(GOLD, 0.7) }); g.restore(); }
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });

// ================================================================== THE TWIST
// s116 SOMETHING MOVED THAT SHOULDN'T HAVE (3.97) — flashback, slow push toward the window
registerShot('s116', { draw(g, t, info) {
  const u = ease.inOut(clamp(t / info.dur)), cam = { z: lerp(1.2, 1.55, u), x: lerp(200, -140, u), y: lerp(20, -60, u) };
  frozenKitchen(g, t, cam, { slide: 1, bowlAt: BOWL1, noCat: true, noSpark: true });
  const sx = clamp((t - 2.07) / 0.6);
  layer(g, cam, 1, (g) => cat(g, { x: SILL[0] - 80, y: SILL[1], s: 1.2, facing: 1, pose: 'sit', eyes: 'open', t: 1.3 + sx * 0.8, tilt: sx * 0.1 }));
  freezeGrade(g, 1, t);
  if (t > 2.07) { const [x, y] = toScreen(cam, SILL[0] - 80, SILL[1]); g.save(); g.globalAlpha = 0.6 * (1 - sx); ring(g, x - 70, y - 60, 60 + sx * 40, 3, CREAM); g.restore(); }
  layer(g, cam, 1.25, (g) => hero(g, t, { x: 1460, y: GY + 120, s: 2.3, facing: 1, pose: P('holdFront', { eF: [30, -128], hF: [64, -124] }), expr: 'smirk', look: lookToward(1, 0.3), blink: false }));
  vignette(g, 0.6);
  readout(g, t, 10.0, { alpha: 0.75, noDing: true });
  const tk = pop(t, 0.79); if (tk > 0.01) { g.save(); g.translate(E.W - 330, 190); g.scale(tk, tk); goldT(g, '10', 0, 0, { size: 70, font: FONTS.title, alpha: 0.85 }); g.restore(); }
} });
// s117 BISCUIT. SHE BLINKED AT YOU, STRETCHED, (2.80) — frozen kitchen, Biscuit keeps her colour
registerShot('s117', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [2.4, 2.48], drift: 0.2 }), x: SILL[0] - 80 - CX, y: SILL[1] - 110 - E.H / 2 };
  kitchen(g, 0.2, cam); freezeGrade(g, 1, t);
  layer(g, cam, 1, (g) => cat(g, { x: SILL[0] - 80, y: SILL[1], s: 1.2, facing: 1, pose: t > 2.18 ? 'arch' : 'sit', eyes: t > 1.54 && t < 1.74 ? 'blink' : 'open', t, tilt: 0.06, rim: { color: '#ffc68a' } }));
  vignette(g, 0.45);
} });
// s118 SHE WALKED ACROSS THE FROZEN KITCHEN (2.55) — truck with her
registerShot('s118', { draw(g, t, info) {
  const wk = clamp((t - 0.28) / 2.2), cx = lerp(560, 1500, wk), cam = { z: 1.15, x: lerp(-240, 360, ease.inOut(clamp(t / info.dur))), y: 40 };
  frozenKitchen(g, t, cam, { slide: 1, bowlAt: BOWL1, noCat: true });
  freezeGrade(g, 1, t);
  layer(g, cam, 1, (g) => hero(g, 0.5, { x: 1250, y: GY, facing: 1, pose: P('holdFront', { eF: [30, -128], hF: [64, -124] }), expr: 'smirk', look: lookToward(1, 0.4), blink: false }));
  layer(g, cam, 1.08, (g) => cat(g, { x: cx, y: GY + 60, s: 1.4, facing: 1, pose: 'stand', eyes: 'open', walk: t * 9, t, rim: { color: '#ffc68a' } }));
} });
// s119 WHY CATS APPEAR WHERE THEY COULDN'T HAVE (4.35) — normal time, three impossible spots
registerShot('s119', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [0.86, 0.9], drift: 0.3 }), x: 120, y: -60 }, M = kitchen(g, t, cam, { mood: 'day' });
  const spots = [[0.99, [1720, GY - 700, 1.2, 'loaf']], [1.77, [1025, GY - 820, 1.0, 'sit']], [2.97, [1430, GY - 905, 1.0, 'sit']]];
  layer(g, cam, 1, (g) => {
    const o = ease.out(prog(t, 1.6, 1.85)); if (o > 0) { g.fillStyle = '#16141c'; g.fillRect(940, GY - 1046, 170, 262); g.save(); g.translate(940, GY - 1060); g.scale(1 - o * 1.4, 1); rr(g, 0, 0, 190, 290, 8); g.fillStyle = '#9ab89a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.restore(); }
    rr(g, 1330, GY - 905, 220, 18, 4); g.fillStyle = '#9a6a3a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); seg(g, [[1350, GY - 887], [1370, GY - 860]], 6, '#7a5030'); seg(g, [[1530, GY - 887], [1510, GY - 860]], 6, '#7a5030');
    for (const b of [[1370, '#3a8acc'], [1395, '#d4262e'], [1520, '#3aa05a']]) { rr(g, b[0], GY - 965, 20, 60, 3); g.fillStyle = b[1]; g.fill(); }
    wallClock(g, t, { x: 1220, y: GY - 780, r: 90, h: 7.7, sec: 12 + t });
    let cur = -1; spots.forEach(([at], i) => { if (t >= at) cur = i; });
    if (cur >= 0) { const [at, [x, y, s, pose]] = spots[cur], k = pop(t, at, 0.3); g.save(); g.translate(x, y); g.scale(k, k); cat(g, { x: 0, y: 0, s, facing: -1, pose, eyes: 'open', t, rim: M.rim }); g.restore();
      const sp = clamp((t - at) / 0.5); if (sp < 1) for (let i = 0; i < 4; i++) star(g, x - 60 + i * 40, y - 80 - (i % 2) * 30 - sp * 20, 12 * (1 - sp), CREAM); }
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'day' });
} });
// s120 NEXT MORNING: THE SNAP DOES NOTHING (3.39)
registerShot('s120', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.5, 1.55], drift: 0.5 }), x: -180, y: 20 }, M = kitchen(g, t, cam);
  let h;
  layer(g, cam, 1, (g) => {
    const m = mina(g, t, { x: TX - 120, y: GY, facing: -1, pose: idle(P('holdFront', { hF: [30, -150 + Math.abs(Math.sin(t * 3)) * 20], eF: [24, -132] }), t, 1), expr: 'happy', look: lookToward(-1, 0.3), rim: M.rim, alpha: 0.9 }); minaStopwatch(g, m);
    h = hero(g, t, { x: 640, y: GY, facing: 1, pose: poseAt(t, [[0, 'stand'], [0.5, SNAP], [2.4, 'shrug']], 0.2), expr: exprAt(t, [[0, 'determined'], [1.3, 'confused'], [2.0, 'worried']]), look: lookToward(1, -0.2), rim: M.rim });
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
  const tip = toScreen(cam, ...W2(h, [SNAP.hF[0] + 6, SNAP.hF[1] - 8])); snapRing(g, t, 0.82, tip[0], tip[1], { fizzle: true });
  chip(g, t, { str: 'NEXT MORNING', at: 0.12, x: 280, y: 110 });
  if (t > 1.0) readout(g, t, 0, { alpha: t > 2.0 ? (Math.floor((t - 2.0) * 4) % 2 ? 0.3 : 1) : ease.out(prog(t, 1.0, 1.3)) });
} });
// s121 GIANT FACE HERO, 'your snap is gone' (1.65)
function heroFaceTrim(g, cx, cy, r) {
  g.save(); g.translate(cx, cy);
  g.save(); g.beginPath(); g.moveTo(-r * 1.9, r * 2.3); g.quadraticCurveTo(-r * 1.7, r * 1.15, -r * 0.62, r * 0.98); g.lineTo(r * 0.62, r * 0.98); g.quadraticCurveTo(r * 1.7, r * 1.15, r * 1.9, r * 2.3); g.closePath(); g.clip();
  for (const y of [1.3, 1.62, 1.94, 2.26]) { g.fillStyle = alpha(CREAM, 0.92); g.fillRect(-r * 2, r * y, r * 4, r * 0.12); } g.restore();
  g.strokeStyle = '#16141c'; g.lineCap = 'round'; g.lineWidth = r * 0.14; g.beginPath(); g.moveTo(-r * 0.12, -r * 0.92); g.quadraticCurveTo(-r * 0.2, -r * 1.25, -r * 0.02, -r * 1.42); g.stroke();
  g.strokeStyle = '#8a5a2b'; g.lineWidth = r * 0.065; for (const dx of [-0.34, 0.34]) { g.beginPath(); g.arc(dx * r, -r * 0.04, r * 0.27, 0, 7); g.stroke(); }
  g.strokeStyle = shade('#8a5a2b', 0.3); g.lineWidth = r * 0.02; for (const dx of [-0.34, 0.34]) { g.beginPath(); g.arc(dx * r, -r * 0.04, r * 0.23, Math.PI * 1.1, Math.PI * 1.5); g.stroke(); }
  seg(g, [[-r * 0.08, -r * 0.06], [r * 0.08, -r * 0.06]], r * 0.05, '#8a5a2b');
  g.restore();
}
registerShot('s121', { draw(g, t, info) {
  const z = 1 + 0.04 * clamp(t / info.dur); kitchen(g, t, { z: 1.9, x: -260, y: -80 }); veil(g, '#1a0e0a', 0.25);
  g.save(); g.translate(CX, E.H / 2); g.scale(z, z); g.translate(-CX, -E.H / 2);
  const sad = { ...FACE.worried, eye: 0.8, brow: 0.6, tilt: -1, smile: -0.8, sweat: 0.2, look: [0, 0.3] };
  const f = faceAt(t, [[0, 'worried'], [0.73, sad]]);
  giantFace(g, CX, E.H * 0.48, 330, { who: 'HERO', f, rimColor: '#ffd9a0', rimSide: -1 });
  heroFaceTrim(g, CX, E.H * 0.48, 330);
  g.restore();
  // the hand at frame bottom: snaps, nothing
  const hx = CX + 380, hy = E.H - 40 + Math.sin(prog(t, 0.1, 0.5) * Math.PI) * -30;
  const sn = t > 0.27 ? 1 : 0; g.save(); g.translate(hx, hy); g.rotate(-0.15); g.lineCap = 'round';
  seg(g, [[30, 260], [0, 60]], 120, '#2f8f8a'); for (const y of [130, 200]) seg(g, [[-50, y], [70, y - 10]], 16, CREAM);
  circle(g, 0, 0, 70, '#16141c'); seg(g, [[-30, -40], [-36, -120]], 30, '#16141c'); seg(g, [[sn ? 10 : 30, -50], [sn ? -18 : 40, sn ? -96 : -110]], 28, '#16141c'); seg(g, [[40, -10], [80, -50]], 26, '#16141c');
  g.restore();
  if (t > 0.27 && t < 0.7) { const u = prog(t, 0.27, 0.7); ring(g, hx - 30, hy - 130, 18 + u * 30, 3, alpha(CREAM, 0.6 * (1 - u))); }
} });
// s122 BISCUIT FLICKS HER TAIL (1.92)
registerShot('s122', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [2.3, 2.36], drift: 0.3 }), x: 1180 - CX, y: GY - 120 - E.H / 2 }, M = kitchen(g, t, cam);
  layer(g, cam, 1, (g) => cat(g, { x: 1200, y: GY + 10, s: 1.3, facing: -1, pose: 'sit', eyes: t > 0.96 ? 'glint' : 'open', t: t + 0.08, tilt: t > 0.96 ? -0.18 * ease.out(prog(t, 0.96, 1.3)) : 0, rim: M.rim }));
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });
// s123 ALREADY ON THE TABLE, EATING YOUR TOAST (4.39)
registerShot('s123', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.25, 1.31], drift: 0.4 }), x: 0, y: 20 }, M = kitchen(g, t, cam);
  const laugh = t > 2.9;
  layer(g, cam, 1, (g) => {
    toast(g, TX - 60, TT - 26, 0.34, { butter: 1, bite: prog(t, 1.88, 3.2), rot: 0.15 });
    cat(g, { x: TX - 170, y: TT, s: 1.15, facing: 1, pose: 'loaf', eyes: t > 1.88 ? 'blink' : 'open', t, tilt: t > 1.88 ? 0.25 + Math.sin(t * 10) * 0.05 : 0, rim: M.rim });
    dev(g, t, { x: 1420, y: GY, facing: -1, pose: laugh ? POSES.phone : idle(POSES.phone, t, 3), expr: laugh ? 'joy' : 'smile', look: lookToward(-1, 0.3), rim: M.rim });
    mina(g, t, { x: 1640, y: GY, facing: -1, pose: idle(laugh ? P('cheer', {}) : POSES.stand, t, 1), expr: laugh ? 'joy' : 'happy', look: lookToward(-1, 0.3), rim: M.rim });
    const turn = t > 0.26 ? 1 : -1;
    hero(g, t, { x: 560, y: GY, facing: turn, pose: idle(t < 2.2 ? POSES.stand : laugh ? P('cheer', {}) : P('handsOnHead', {}), t, 2), expr: exprAt(t, [[0, 'smile'], [0.4, 'surprised'], [1.9, 'shocked'], [2.9, 'joy']]), look: lookToward(turn, 0.1), rim: M.rim });
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });

// ================================================================== ENDING
// s124 IN REAL LIFE, NOBODY CAN STOP TIME (2.74)
registerShot('s124', { draw(g, t, info) {
  kitchen(g, t, { z: 1.05, x: 0, y: -20 }); veil(g, '#0a0612', 0.55);
  const cx = CX, cy = E.H * 0.47, k = pop(t, 0.05, 0.45), z = 1 + 0.03 * t;
  g.save(); g.translate(cx, cy); g.scale(k * z, k * z);
  circle(g, 0, 0, 230, alpha('#000', 0.3)); ring(g, 0, 0, 220, 14, CREAM); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; seg(g, [[Math.cos(a) * 180, Math.sin(a) * 180], [Math.cos(a) * 204, Math.sin(a) * 204]], i % 3 ? 5 : 10, CREAM); }
  rr(g, -70, -90, 50, 180, 12); g.fillStyle = CREAM; g.fill(); rr(g, 20, -90, 50, 180, 12); g.fill();
  g.restore();
  cross(g, t, 1.45, cx, cy, 190);
  chip(g, t, { str: 'REAL LIFE', at: 0.15, x: CX, y: 110 });
} });
// s125 STUCK IN THE DARK, UNABLE TO BREATHE OR MOVE (4.93) — two recap panels
function blackPanel(g, t, x, y, w, h) { rr(g, x, y, w, h, 20); g.fillStyle = '#020204'; g.fill(); g.save(); g.beginPath(); rr(g, x, y, w, h, 20); g.clip();
  g.strokeStyle = alpha(CREAM, 0.14); g.lineWidth = 3; const cx = x + w / 2, cy = y + h * 0.58; g.beginPath(); g.arc(cx, cy, 70, Math.PI * 0.9, Math.PI * 2.1); g.stroke(); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(cx - 54 + i * 36, cy - 40); g.lineTo(cx - 60 + i * 38, cy - 140 + Math.abs(i - 1.5) * 20); g.stroke(); }
  g.restore(); creamT(g, "CAN'T SEE", x + w / 2, y + h - 50, { size: 34, alpha: 0.75 }); }
function airPanel(g, t, x, y, w, h) { rr(g, x, y, w, h, 20); g.fillStyle = '#1a2440'; g.fill(); g.save(); g.beginPath(); rr(g, x, y, w, h, 20); g.clip();
  const R = rng(53); for (let i = 0; i < 260; i++) circle(g, x + R() * w, y + R() * h, 2 + R() * 3, alpha('#bcd4ff', 0.5 + R() * 0.3));
  const wx = x + w * 0.6; g.fillStyle = alpha('#bcd4ff', 0.12); g.fillRect(wx, y, w, h); seg(g, [[wx, y], [wx, y + h]], 4, alpha('#ffffff', 0.4));
  const o = { x: wx - 40, y: y + h + 20, s: 2.0, facing: 1, pose: P('reach', { eF: [30, -160], hF: [44, -186], head: [16, -204] }), expr: 'worried', blink: false, look: [1, 0], t };
  actor(g, 'HERO', o); heroTrim(g, o); const hd = W2(o, o.pose.head); circle(g, hd[0] + 26, hd[1] + 14, 14, alpha('#c86a5a', 0.85));
  g.restore(); creamT(g, "CAN'T BREATHE", x + w / 2, y + h - 50, { size: 34 }); }
registerShot('s125', { draw(g, t, info) {
  kitchen(g, 0.2, { z: 1.0, x: 0, y: -20 }); freezeGrade(g, 1, t); veil(g, '#05060f', 0.45);
  const w = 820, h = 640, y = E.H / 2 - h / 2 - 10;
  const a = ease.out(prog(t, 1.95, 2.35)), b = ease.out(prog(t, 3.17, 3.57));
  if (a > 0) { g.save(); g.translate((1 - a) * -900, 0); blackPanel(g, t, CX - w - 30, y, w, h); g.restore(); }
  if (b > 0) { g.save(); g.translate((1 - b) * 900, 0); airPanel(g, t, CX + 30, y, w, h); g.restore(); }
  if (t < 2.1) { const k = 1 - prog(t, 1.8, 2.1); goldT(g, 'IF TIME DID STOP...', CX, E.H / 2, { size: 64, font: FONTS.title, alpha: ease.out(prog(t, 0.1, 0.5)) * k, stroke: 10 }); }
  cross(g, t, 3.91, CX, E.H / 2 + 40, 150);
  if (t > 3.91) goldT(g, "CAN'T MOVE", CX, E.H - 70, { size: 46, alpha: prog(t, 3.91, 4.2), stroke: 8 });
} });
// s126-s129 THE REAL LAB (Hau) — one board, continued
const hauBoard = (g, t, dur, fn) => { board(g, t, { title: 'FIG 10 - STOPPED LIGHT', fig: 'A REAL LAB' }); const z = 1 + 0.025 * ease.inOut(clamp(t / dur)); g.save(); g.translate(CX, E.H / 2); g.scale(z, z); g.translate(-CX, -E.H / 2); fn(); g.restore(); FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 41 }); };
const HAU = { x: CX, y: E.H * 0.5, w: 1400 };
registerShot('s126', { draw(g, t, info) {
  hauBoard(g, t, info.dur, () => { const st = 0.99 * ease.out(prog(t, 0.1, 0.86)); const H = hauLight(g, t, { ...HAU, k: Math.min(0.59, ease.out(prog(t, 0, 0.6))), stop: st });
    if (t > 0.86) { const k = pop(t, 0.86); g.save(); g.translate(H.pulse[0], H.pulse[1] - 120); g.scale(k, k); goldT(g, 'STOPPED', 0, 0, { size: 52, font: FONTS.title }); g.restore(); ring(g, H.pulse[0], H.pulse[1] + 30, 34 + 4 * Math.sin(t * 6), 3, alpha(GOLD, 0.8)); } });
} });
registerShot('s127', { draw(g, t, info) {
  hauBoard(g, t, info.dur, () => { hauLight(g, t, { ...HAU, k: 0.59, stop: 0.99 }); ring(g, HAU.x, HAU.y, 34 + 4 * Math.sin(t * 6), 3, alpha(GOLD, 0.8));
    const k = pop(t, 0.28, 0.3); if (k > 0.01) { g.save(); g.translate(CX - 360, E.H * 0.24); g.rotate(-0.06); g.scale(k * (1 + 0.6 * (1 - k)), k * (1 + 0.6 * (1 - k))); goldT(g, '2001', 0, 0, { size: 130, font: FONTS.title, stroke: 10 }); g.restore(); } });
  chip(g, t, { str: 'HARVARD', at: 1.64, x: CX + 360, y: E.H * 0.24, tone: 'blue' });
} });
registerShot('s128', { draw(g, t, info) {
  hauBoard(g, t, info.dur, () => { const st = 0.99 * ease.inOut(prog(t, 0.4, 1.37)); const H = hauLight(g, t, { ...HAU, k: 0.59 + 0.41 * ease.out(prog(t, 0.2, 1.0)), stop: st });
    if (t > 1.37) ring(g, H.pulse[0], H.pulse[1] + 30, 34 + 4 * Math.sin(t * 6), 3, alpha(GOLD, 0.8));
    label(g, t, { at: H.cloud, to: [H.cloud[0] + 220, E.H * 0.2], str: 'super-cold atoms', start: 3.51 }); });
  const k = pop(t, 0.15); if (k > 0.01) { g.save(); g.translate(330, E.H * 0.2); g.scale(k, k); rr(g, -230, -40, 460, 80, 14); g.fillStyle = 'rgba(14,10,20,.85)'; g.fill(); g.strokeStyle = CREAM; g.lineWidth = 3; g.stroke(); creamT(g, "LENE HAU'S TEAM", 0, 2, { size: 38 }); g.restore(); }
} });
registerShot('s129', { draw(g, t, info) {
  hauBoard(g, t, info.dur, () => { const rl = prog(t, 2.49, 3.3); const H = hauLight(g, t, { ...HAU, k: 1, stop: 0.99, release: rl });
    if (rl <= 0) ring(g, H.pulse[0], H.pulse[1] + 30, 34 + 4 * Math.sin(t * 6), 3, alpha(GOLD, 0.8));
    const k = pop(t, 0.79) * (1 - prog(t, 2.4, 2.7)); if (k > 0.01) { g.save(); g.translate(HAU.x, HAU.y - 200); g.scale(k, k); goldT(g, '~1/1,000 s', 0, 0, { size: 72, font: FONTS.title, stroke: 8 }); g.restore(); }
    if (rl > 0 && rl < 1) for (let i = 0; i < 6; i++) seg(g, [[H.pulse[0] - 60 - i * 40, HAU.y - 20 + (i % 3) * 20], [H.pulse[0] - 20 - i * 40, HAU.y - 20 + (i % 3) * 20]], 4, alpha(GOLD, 0.6)); });
} });
// s130 YOUR BRAIN STRETCHES MOMENTS EVERY DAY (2.68)
registerShot('s130', { draw(g, t, info) {
  kitchen(g, t, { z: 1.6, x: 260, y: -330 }); veil(g, '#0a0612', 0.5);
  const sec = stickSec(t, { at: 0.52, sec0: 20, hold: 1.4 }); wallClock(g, t, { x: CX, y: E.H * 0.4, r: 250, h: 7.7, sec, stick: t > 0.52 && t < 1.92 ? 1 : 0 });
  const x0 = CX - 520, y = E.H * 0.82, st = ease.inOut(prog(t, 0.52, 1.6)), w1 = lerp(130, 300, st);
  let x = x0; for (let i = 0; i < 5; i++) { const w = i === 0 ? w1 : 130; rr(g, x, y - 26, w - 12, 52, 10); g.fillStyle = i === 0 ? alpha(GOLD, 0.85) : alpha(CREAM, 0.5); g.fill(); x += w; }
  if (st > 0.3) creamT(g, 'FIRST TICK', x0 + w1 / 2 - 6, y + 64, { size: 30, alpha: st, stroke: 8 });
  chip(g, t, { str: 'RULE 4', at: 0.28, x: CX, y: 100 });
} });
// s131 SATELLITE CLOCKS RUN AT A DIFFERENT SPEED (3.58)
registerShot('s131', { draw(g, t, info) {
  board(g, t, { title: 'FIG 9 - SATELLITE CLOCKS', fig: 'RECAP' });
  const z = 1 + 0.03 * ease.inOut(clamp(t / info.dur)); g.save(); g.translate(CX, E.H / 2); g.scale(z, z); g.translate(-CX, -E.H / 2);
  gpsClocks(g, t + 2, { x: CX + 280, y: E.H * 0.5, w: 1400, k: ease.out(prog(t, 0, 0.6)), show: 0 });
  const k = pop(t, 0.7); if (k > 0.01) { g.save(); g.translate(CX + 430, E.H * 0.3); g.scale(k, k); goldT(g, '+38 µs / day', 0, 0, { size: 96, font: FONTS.title, stroke: 8 }); g.restore(); }
  g.restore();
  chip(g, t, { str: 'RULE 5', at: 2.32, x: CX + 430, y: E.H * 0.72 });
  FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 41 });
} });
// s132 QUESTION lock-up (4.08) — the breakfast kitchen frozen at 0.7, hero warm with his hand up
registerShot('s132', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.0, 1.06], drift: 0.2 }), y: -20 }; const M = kitchen(g, 0.3, cam);
  layer(g, cam, 1, (g) => {
    butterDish(g, BUT[0], BUT[1], 0.4); milkJug(g, JUG0[0], JUG0[1], 0.45, { level: 0.7 }); toast(g, TX - 230, TT - 18, 0.3, { butter: 1, rot: 0.1 });
    for (let i = 0; i < 9; i++) circle(g, TX - 60 + i * 26, TT - 160 + Math.sin(i * 1.3) * 26 - i * 6, 7 - (i % 3), '#ffa526');      // juice beads hanging
    g.save(); g.translate(TX - 120, TT - 60); g.rotate(0.9); rr(g, -22, -50, 44, 70, 6); g.fillStyle = alpha('#dfeefa', 0.7); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.restore();
    g.save(); g.translate(1150, TT - 230); g.rotate(-0.25); cat(g, { x: 0, y: 0, s: 1.2, facing: -1, pose: 'stand', eyes: 'wide', t: 0.5 }); g.restore();
    dev(g, 0.4, { x: 470, y: GY, facing: 1, pose: POSES.phone, ...FROZEN, rim: M.rim });
    mina(g, 0.3, { x: 1720, y: GY, facing: -1, pose: POSES.surprised ?? POSES.handsOnHead, expr: 'surprised', ...FROZEN, rim: M.rim });
    stillSpark(g, t, 1150, TT - 330); stillSpark(g, t, 530, GY - 430); stillSpark(g, t, 1700, GY - 320);
  });
  freezeGrade(g, 0.7, t);
  layer(g, cam, 1, (g) => hero(g, t, { x: 760, y: GY, facing: 1, pose: SNAP, expr: 'smirk', look: lookToward(1, -0.1), rim: { color: '#ffc68a' } }));
  vignette(g, 0.45);
  readout(g, t, 10.0, { alpha: pop(t, 0.88), noDing: true });
  const tk = pop(t, 0.88); if (tk > 0.01 && t < 2.6) { g.save(); g.translate(CX, E.H * 0.3); g.scale(tk, tk); goldT(g, '10', 0, 0, { size: 220, font: FONTS.title, stroke: 14, alpha: 1 - prog(t, 2.3, 2.6) }); g.restore(); }
  const q = ease.outBack(prog(t, 2.46, 2.86)); if (q > 0.01) { g.save(); g.translate(CX, E.H * 0.3); g.scale(q, q);
    text(g, 'IF YOU HAD', 0, -110, { size: 78, color: CREAM, font: FONTS.title, weight: 700, stroke: 12, strokeColor: 'rgba(8,6,16,.92)', glow: 22, glowColor: 'rgba(255,190,110,.6)' });
    text(g, '10 FROZEN SECONDS,', 0, 0, { size: 108, color: GOLD, font: FONTS.title, weight: 700, stroke: 14, strokeColor: 'rgba(8,6,16,.92)', glow: 26, glowColor: alpha(GOLD, 0.7) });
    text(g, 'WHAT WOULD YOU DO?', 0, 120, { size: 86, color: CREAM, font: FONTS.title, weight: 700, stroke: 12, strokeColor: 'rgba(8,6,16,.92)', glow: 22, glowColor: 'rgba(255,190,110,.6)' }); g.restore(); }
} });
// s133 END SCREEN (4.0)
registerShot('s133', { draw(g, t, info) {
  const M = kitchen(g, t, { z: 1.0, x: 0, y: 0 }, { mood: 'morning' });
  layer(g, { z: 1 }, 1, (g) => {
    toast(g, TX + 80, TT - 26, 0.34, { butter: 1, bite: 0.7 + 0.3 * prog(t, 0, 3), rot: 0.15 }); cat(g, { x: TX - 30, y: TT, s: 1.15, facing: 1, pose: 'loaf', eyes: 'auto', t, tilt: 0.2, rim: M.rim });
  });
  UI.endScreen(g, t - 1.4, { question: 'WHAT WOULD YOU DO?', cast: [], moodColors: ['rgba(11,10,28,.72)', 'rgba(29,21,48,.5)', 'rgba(58,32,48,.35)'], rim: '#ffb070' });
  const k = ease.out(prog(t, 0.3, 0.9));
  g.save(); g.globalAlpha *= k;
  dev(g, t, { x: 560, y: E.H - 40, s: 1.5, facing: 1, pose: idle(POSES.phone, t, 3), expr: 'smile', rim: { color: '#ffb070' } });
  hero(g, t, { x: 820, y: E.H - 40, s: 1.5, facing: 1, pose: idle(POSES.wave, t, 2), expr: 'happy', rim: { color: '#ffb070' } });
  const m = mina(g, t, { x: 1080, y: E.H - 40, s: 1.6, facing: -1, pose: idle(POSES.relaxed, t, 1), expr: 'happy', rim: { color: '#ffb070' } }); minaStopwatch(g, m);
  g.restore();
} });
