// E_finish.js — batch E part 1 (s108-s113): DAY 1,095, the last run at spring dawn, the toilet-paper finish line, the three totals.
//   s108 the timeSkip card flips to DAY 1,095; HERO jogs the dawn path (follow cam, god rays, blossom)
//   s109 tracking two-shot: MINA on her bike beside him, bell on 'rides', km 9 slides by
//   s110 finish wide at km 10: DEV holds the toilet-paper ribbon, the roll unspools at his feet; HERO + MINA approach
//   s111 total 1: slow-mo ribbon break behind a veil, counter rolls to 109,500 PUSH-UPS on 'thousand'
//   s112 total 2: top-down route map, a gold line loops round and round, 10,950 km on 'thousand'
//   s113 total 3: blueprint Earth, gold arc from HOME stops past 1/4 on 'quarter', tiny runner on the tip, sparkle on 'Earth'
import { E, S, registerShot, layer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, rr, seg, circle, poly, ring, text, FONTS, rng, linGrad, radGrad, shade } from '/engine/core.js';
import { POSES, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { park, parkFg, bike, finishLine, kmMarker, routeSign } from '../sets/park.js';
import { runCycle, pushUp, trainee, pillow, repCounter } from '../sets/train.js';
import { timeSkip } from '../sets/home3.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';

const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };
const GOLD = '#ffd47e', CREAM = '#fff1dc', DAWN = { season: 'spring', mood: 'dawn' };
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// HERO on the path: foot phase locked to world x (no sliding)
function runner(g, t, x, gy, s, o = {}) {
  const R = runCycle(t, 0, { mode: o.mode || 'jog', x, s, facing: o.facing ?? 1, fatigue: o.fatigue ?? 0 });
  return trainee(g, 'HERO', { pose: o.pose || R.pose, shadow: [0, 38] }, { x, y: gy, s, facing: o.facing ?? 1, t, rim: o.rim, blink: blinkFlag(t, 3.3, o.seed ?? 3), look: o.look || lookToward(1, 0.05), expr: o.expr || 'determined', sweat: o.sweat ?? 0, breath: o.breath ?? 0 });
}
// a gold number that pops on landing (text + extrusion + glow)
function goldPop(g, str, x, y, size, land, o = {}) {
  const u = Math.max(0, land), p = 1 + 0.18 * Math.exp(-u * 8) * Math.cos(u * 22) * (land >= 0 ? 1 : 0);
  g.save(); g.translate(x, y); g.scale(p, p);
  for (let i = 6; i >= 1; i--) text(g, str, i * 1.4, i * 1.8, { size, color: shade(GOLD, -0.55), font: FONTS.title, weight: 700 });
  text(g, str, 0, 0, { size, color: GOLD, font: FONTS.title, weight: 700, stroke: 14, strokeColor: '#140f1c', glow: 20, glowColor: alpha(GOLD, 0.7) });
  if (o.label) text(g, o.label, 0, size * 0.78, { size: size * 0.3, color: CREAM, font: FONTS.ui, weight: 900, spacing: 3, stroke: 7, strokeColor: '#140f1c' });
  g.restore();
  if (land >= 0 && land < 0.5) { glow(g, x, y, size * 3, GOLD, 0.3 * (1 - land / 0.5)); FX.sparkle(g, x - size * 1.6, y - size * 0.4, 40 * (1 - land * 2), '#fff', 0.9); FX.sparkle(g, x + size * 1.7, y + size * 0.2, 32 * (1 - land * 2), '#fff', 0.9); }
}

// ---------------------------------------------------------------------------------------------------
// s108 — "Day one thousand and ninety-five."
// ---------------------------------------------------------------------------------------------------
registerShot('s108', { draw(g, t, info) {
  const st = info.shot.start, tDay = shotWord('Day', st, 0.15), tN = shotWord('ninety-five', st, 1.11), s = 1.9, v = 300;
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], y: [-80, -96] }); cam.x += t * v - 40;
  const P = park(g, t, cam, { ...DAWN, km: 8 }), hx = P.CX - 120 + t * v;
  layer(g, cam, 1, (g) => runner(g, t, hx, P.GY + 20, s, { rim: P.rim, expr: exprAt(t, [[0, 'determined'], [tN, 'smile']]), breath: 0.6, look: lookToward(1, -0.05) }));
  FX.godRays(g, E.W * 0.92, -40, { angle: 2.2, spread: 0.8, len: 1700, color: '#ffe2a8', a: 0.11, t });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#ffe0ea' });
  // the card flips on 'Day' and lands; the gold 1,095 pops on 'ninety-five'
  timeSkip(g, t, { x: 230, y: 96, s: 0.5, keys: [[0, 'DAY 1,094', 'TRAINING'], [tDay, 'DAY 1,095', 'THREE YEARS']] });
  const land = t - tN; if (land > -0.05) { const k = ease.outBack(prog(t, tN - 0.05, tN + 0.3)); g.save(); g.translate(640, 250); g.scale(k, k); goldPop(g, '1,095', 0, 0, 88, land, { label: 'DAYS IN A ROW' }); g.restore(); }
} });

// ---------------------------------------------------------------------------------------------------
// s109 — "Mina rides beside you."
// ---------------------------------------------------------------------------------------------------
registerShot('s109', { draw(g, t, info) {
  const st = info.shot.start, tR = shotWord('rides', st, 0.25), tB = shotWord('beside', st, 0.55), v = 460, s = 1.9;
  const cam = { z: 1.12, x: -700 + t * v + Math.sin(t * 0.7) * 6, y: -40 + Math.cos(t * 0.6) * 4 };
  const P = park(g, t, cam, { ...DAWN, km: 9 }), hx = P.CX - 700 + t * v + 150;
  layer(g, cam, 1, (g) => {
    bike(g, t, { x: hx - 330, gy: P.GY + 60, s: 2.0, facing: 1, expr: exprAt(t, [[0, 'smile'], [tR, 'joy']]), blink: blinkFlag(t, 2.9, 1), look: t > tR ? lookToward(1, -0.35) : lookToward(1, 0), rim: P.rim, bell: prog(t, tR, tR + 0.6) });
    runner(g, t, hx, P.GY + 20, s, { rim: P.rim, expr: exprAt(t, [[0, 'determined'], [tB + 0.1, 'smile']]), look: t > tB ? lookToward(-1, 0.2) : lookToward(1, 0), breath: 0.5 });
  });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#ffe0ea' });
  FX.speedLines(g, t, { cx: E.W * 1.4, cy: E.H * 0.55, count: 14, a: 0.05, inner: 900 });
} });

// ---------------------------------------------------------------------------------------------------
// s110 — "Dev holds a finish line made of toilet paper."
// ---------------------------------------------------------------------------------------------------
// a toilet roll lying on the grass with its tail unspooling toward Dev
function rollOnGround(g, t, x, y, k) {
  const len = 40 + 260 * k;
  g.fillStyle = '#fbfaf6'; g.beginPath(); g.moveTo(x, y - 18); for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(x - u * len, y + 2 + Math.sin(u * 9 + t * 3) * 3 * u); } for (let i = 12; i >= 0; i--) { const u = i / 12; g.lineTo(x - u * len, y + 22 + Math.sin(u * 9 + t * 3) * 3 * u); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.stroke();
  g.save(); g.translate(x, y); g.rotate(-k * 6); g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(0, 0, 26, 30, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.15)'; g.stroke(); g.fillStyle = '#c8b090'; g.beginPath(); g.ellipse(0, 0, 9, 11, 0, 0, 7); g.fill(); seg(g, [[0, -28], [0, -12]], 2, 'rgba(0,0,0,.2)'); g.restore();
}
registerShot('s110', { draw(g, t, info) {
  const st = info.shot.start, tF = shotWord('finish', st, 0.6), tT = shotWord('toilet', st, 1.6), tP = shotWord('paper', st, 1.95);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [60, 120], y: [-60, -70] });
  const P = park(g, t, cam, { ...DAWN, fountain: false, bench: false }), GY = P.GY, fx = P.pos.finishX;
  const lift = ease.outBack(prog(t, tF - 0.15, tF + 0.35)), unroll = ease.out(prog(t, tT - 0.1, tP + 0.6));
  layer(g, cam, 1, (g) => {
    kmMarker(g, fx + 420, GY - 30, 10); routeSign(g, fx + 720, GY - 36);
    seg(g, [[fx + 230, GY + 30], [fx + 230, GY - 230]], 12, '#c8a070'); circle(g, fx + 230, GY - 234, 9, '#d8b080');
    const sD = 1.9, dx = fx - 300, armUp = lerp(-150, -196, lift), hand = [dx + 48 * sD, GY + 30 + (armUp - 12) * sD];
    actor(g, 'DEV', { x: dx, y: GY + 30, s: sD, facing: 1, pose: idle({ ...POSES.stand, eF: [26, lerp(-150, -176, lift)], hF: [48, armUp] }, t, 2), expr: exprAt(t, [[0, 'smile'], [tF, 'joy'], [tP + 0.2, 'smirk']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(-1, 0), rim: P.rim, t });
    finishLine(g, t, { a: hand, b: [fx + 230, GY - 200], tape: 0, sag: lerp(90, 36, lift), roll: null });
    rollOnGround(g, t, dx - 30 - unroll * 120, GY + 40, unroll);
    // HERO (s 1.7) + MINA approaching from the left
    const hx = P.CX - 1250 + t * 260;
    bike(g, t, { x: hx - 300, gy: GY + 70, s: 1.8, facing: 1, expr: 'joy', blink: blinkFlag(t, 2.9, 1), rim: P.rim, look: lookToward(1, 0) });
    runner(g, t, hx, GY + 40, 1.7, { rim: P.rim, expr: exprAt(t, [[0, 'determined'], [tP, 'joy']]), breath: 0.6 });
  });
  const fk = ease.outBack(prog(t, tF, tF + 0.4)); if (fk > 0) { const [sx, sy] = [E.W / 2 + (fx - E.W / 2 - cam.x) * cam.z + 40, E.H * 0.2]; g.save(); g.translate(sx, sy); g.scale(fk, fk); g.rotate(-0.04); text(g, 'FINISH', 0, 0, { size: 70, color: GOLD, font: FONTS.title, weight: 700, stroke: 12, strokeColor: '#1a1020', glow: 16, glowColor: alpha(GOLD, 0.6), spacing: 6 }); g.restore(); }
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#ffe0ea' });
  FX.godRays(g, E.W * 0.85, -40, { angle: 2.1, spread: 0.8, len: 1600, color: '#ffe2a8', a: 0.09, t });
} });

// ---------------------------------------------------------------------------------------------------
// s111 — "Over a hundred and nine thousand push-ups."
// ---------------------------------------------------------------------------------------------------
registerShot('s111', { draw(g, t, info) {
  const st = info.shot.start, tTh = shotWord('thousand', st, 1.23), tPU = shotWord('push-ups', st, 1.63), slow = 0.18;
  const ts = t * slow, cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-40, 20], y: [-70, -80] });
  const P = park(g, ts, cam, { ...DAWN, fountain: false, bench: false }), GY = P.GY, fx = P.pos.finishX, tape = ease.out(prog(t, 0.2, 1.6));
  layer(g, cam, 1, (g) => {
    seg(g, [[fx + 230, GY + 30], [fx + 230, GY - 230]], 12, '#c8a070');
    actor(g, 'DEV', { x: fx - 300, y: GY + 30, s: 1.9, facing: 1, pose: idle({ ...POSES.stand, eF: [26, -176], hF: [48, -196] }, ts, 2), expr: 'joy', blink: false, look: lookToward(1, 0), rim: P.rim, t: ts });
    const hx = fx - 140 + t * 70, R = runCycle(t, 0, { mode: 'run', x: hx * 0.6, s: 1.9 });
    trainee(g, 'HERO', { pose: { ...R.pose, eF: [20, -232], hF: [34, -292], eB: [-14, -232], hB: [-24, -292] }, shadow: [0, 38] }, { x: hx, y: GY + 36, s: 1.9, facing: 1, t: ts, rim: P.rim, blink: false, look: lookToward(1, -0.3), expr: 'joy', breath: 0.4 });
    finishLine(g, ts, { a: [fx - 300 + 48 * 1.9, GY + 30 - 208 * 1.9], b: [fx + 230, GY - 200], tape, sag: 40 });
    for (let i = 0; i < 18; i++) { const r = rng(70 + i), px = hx + (r() - 0.3) * 600 + t * 40 * r(), py = GY - 500 + r() * 420 + t * 30; g.fillStyle = alpha('#ffd0e0', 0.8); g.beginPath(); g.ellipse(px, py, 9, 5, t * 0.4 + i, 0, 7); g.fill(); }
  });
  parkFg(g, ts, cam, { season: 'spring' });
  veil(g, '#120a1c', 0.5);
  // counter rolls fast then lands on 'thousand'
  const n = 109500 * ease.out(clamp(prog(t, 0.45, tTh))), land = t - tTh;
  const z = 1 + 0.12 * Math.exp(-Math.max(0, land) * 8) * (land >= 0 ? 1 : 0);
  g.save(); g.translate(E.W / 2, E.H * 0.47); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.47);
  repCounter(g, fmt(n), { x: E.W / 2, y: E.H * 0.46, size: 210, since: 1, label: 'PUSH-UPS' });
  g.restore();
  if (land >= 0 && land < 0.5) { glow(g, E.W / 2, E.H * 0.46, 700, GOLD, 0.3 * (1 - land / 0.5)); FX.sparkle(g, E.W / 2 - 420, E.H * 0.38, 46 * (1 - land * 2), '#fff', 0.9); FX.sparkle(g, E.W / 2 + 430, E.H * 0.52, 38 * (1 - land * 2), '#fff', 0.9); }
  // little push-up icon (repping) under the number
  const R = pushUp(t, 1.4, {}), ik = ease.outBack(prog(t, tPU - 0.1, tPU + 0.3));
  if (ik > 0) { g.save(); g.translate(E.W / 2, E.H * 0.78); g.scale(ik, ik); rr(g, -170, -90, 340, 140, 30); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = alpha(GOLD, 0.8); g.lineWidth = 3; g.stroke(); UI.lineFigure(g, { x: -70, y: 30, s: 0.5, pose: R.pose, color: GOLD }); text(g, '×1,095', 80, -16, { size: 44, color: CREAM, font: FONTS.ui, weight: 900 }); text(g, 'DAYS', 80, 26, { size: 26, color: GOLD, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); }
  atmos(g, t, cam, { color: '#ffe0ea', far: 18, near: 6 });
} });

// ---------------------------------------------------------------------------------------------------
// s112 — "Nearly eleven thousand kilometres."  top-down route map, the gold line loops round and round
// ---------------------------------------------------------------------------------------------------
const ROUTE = (u, lap) => { const a = u * Math.PI * 2, w = 640 + lap * 9, h = 300 + lap * 6; return [E.W * 0.5 + Math.cos(a) * w + Math.sin(a * 2) * 60, E.H * 0.52 + Math.sin(a) * h + Math.cos(a * 3) * 22]; };
registerShot('s112', { draw(g, t, info) {
  const st = info.shot.start, tTh = shotWord('thousand', st, 0.56), tKm = shotWord('kilometres', st, 1.0);
  const rise = ease.inOut(prog(t, 0, info.dur)), z = lerp(1.35, 1.0, rise), cy = lerp(-90, 0, rise);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#5a8a52', '#6f9a5a', '#7aa060']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H / 2 + cy); g.rotate(-0.04 + rise * 0.03); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // river through the middle + the bridge
  g.strokeStyle = '#3f7fb8'; g.lineWidth = 120; g.lineCap = 'round'; g.beginPath(); g.moveTo(-200, E.H * 0.72); g.bezierCurveTo(E.W * 0.3, E.H * 0.42, E.W * 0.65, E.H * 0.78, E.W + 200, E.H * 0.38); g.stroke();
  g.strokeStyle = alpha('#bfe4ff', 0.35); g.lineWidth = 6; for (let i = 0; i < 9; i++) { const u = ((i / 9 + t * 0.03) % 1); seg(g, [[u * E.W, E.H * 0.6 - u * 120 + Math.sin(u * 7) * 40], [u * E.W + 60, E.H * 0.6 - u * 120 + Math.sin(u * 7) * 40 - 8]], 5, alpha('#d8f0ff', 0.5)); }
  rr(g, E.W * 0.47, E.H * 0.38, 80, 230, 10); g.fillStyle = '#c8a070'; g.fill();
  // trees (round canopies with dawn shadow), blossom pink
  for (let i = 0; i < 46; i++) { const r = rng(300 + i), x = r() * E.W, y = r() * E.H; const [rx, ry] = ROUTE(Math.atan2(y - E.H * 0.52, x - E.W * 0.5) / (Math.PI * 2), 0); if (Math.hypot(x - rx, y - ry) < 90) continue; const R = 30 + r() * 30; circle(g, x + 14, y + 12, R, alpha('#1a2a18', 0.35)); circle(g, x, y, R, i % 4 ? '#3f7a3a' : '#e8a4c0'); circle(g, x - R * 0.3, y - R * 0.3, R * 0.45, alpha('#fff', 0.14)); }
  // the cream dashed path loop
  g.save(); g.setLineDash([22, 16]); g.strokeStyle = '#efe2c4'; g.lineWidth = 16; g.beginPath(); for (let i = 0; i <= 120; i++) { const [x, y] = ROUTE(i / 120, 0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
  // gold line: draws round and round (laps stack outward a little)
  const laps = 6 * ease.inOut(prog(t, 0.15, tTh)), full = Math.floor(laps);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let L = 0; L <= full; L++) { const until = L < full ? 1 : laps - full; if (until <= 0) continue; g.strokeStyle = alpha(GOLD, 0.45 + 0.55 * (L === full ? 1 : 0.6)); g.lineWidth = 7; g.beginPath(); for (let i = 0; i <= 120 * until; i++) { const [x, y] = ROUTE(i / 120, L); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  const [hx, hy] = ROUTE(laps - full, full); glow(g, hx, hy, 90, GOLD, 0.6); circle(g, hx, hy, 14, '#fff6dc');
  // HOME pin + km plaques
  const [px, py] = ROUTE(0, 0); poly(g, [[px, py], [px - 22, py - 44], [px + 22, py - 44]], '#d4262e'); circle(g, px, py - 52, 24, '#d4262e'); circle(g, px, py - 52, 9, '#fff');
  g.restore();
  veil(g, '#0b1020', 0.18);
  const n = 10950 * ease.out(clamp(prog(t, 0.35, tTh))), land = t - tTh, pk = 1 + 0.12 * Math.exp(-Math.max(0, land) * 8) * (land >= 0 ? 1 : 0);
  g.save(); g.translate(E.W / 2, E.H * 0.47); g.scale(pk, pk); g.translate(-E.W / 2, -E.H * 0.47); repCounter(g, fmt(n) + ' km', { x: E.W / 2, y: E.H * 0.47, size: 170, since: 1, label: 'RUN IN 3 YEARS' }); g.restore();
  if (land >= 0 && land < 0.5) { glow(g, E.W / 2, E.H * 0.47, 700, GOLD, 0.3 * (1 - land / 0.5)); FX.sparkle(g, E.W / 2 + 480, E.H * 0.4, 40 * (1 - land * 2), '#fff', 0.9); }
  const ck = ease.outBack(prog(t, tKm, tKm + 0.35)); if (ck > 0) { g.save(); g.translate(E.W / 2, E.H * 0.7); g.scale(ck, ck); rr(g, -240, -36, 480, 72, 36); g.fillStyle = alpha('#0b1324', 0.9); g.fill(); g.strokeStyle = alpha(GOLD, 0.85); g.lineWidth = 3; g.stroke(); text(g, 'NEARLY 11,000 km', 0, 2, { size: 40, color: GOLD, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); }
  atmos(g, t, { x: 0, y: 0, z: 1 }, { color: '#ffe0ea', far: 16, near: 6 });
} });

// ---------------------------------------------------------------------------------------------------
// s113 — "More than a quarter of the way around the Earth."  blueprint globe
// ---------------------------------------------------------------------------------------------------
// simplified continents as [lon, lat] outlines (degrees)
const LAND = [
  [[-160, 60], [-130, 70], [-80, 72], [-60, 55], [-80, 30], [-100, 20], [-118, 32], [-125, 48], [-160, 60]],
  [[-80, 10], [-60, 5], [-35, -8], [-40, -22], [-58, -38], [-70, -52], [-75, -20], [-80, 10]],
  [[-10, 36], [10, 37], [32, 31], [44, 12], [51, 11], [40, -15], [30, -34], [18, -35], [10, -5], [-17, 15], [-10, 36]],
  [[-10, 43], [0, 50], [10, 58], [30, 70], [60, 72], [100, 75], [140, 70], [160, 60], [140, 40], [122, 30], [108, 20], [100, 5], [80, 8], [72, 20], [56, 25], [40, 40], [28, 41], [10, 44], [-10, 43]],
  [[114, -22], [130, -12], [146, -18], [153, -28], [146, -38], [130, -32], [115, -34], [114, -22]],
];
function proj(lon, lat, rot, R, cx, cy) { const l = (lon + rot) * Math.PI / 180, p = lat * Math.PI / 180, x = Math.cos(p) * Math.sin(l), y = -Math.sin(p) * 0.98, z = Math.cos(p) * Math.cos(l); return [cx + x * R, cy + y * R, z]; }
registerShot('s113', { draw(g, t, info) {
  const st = info.shot.start, ui = S().ui, tQ = shotWord('quarter', st, 0.59), tE = shotWord('Earth', st, 1.81), tM = shotWord('More', st, 0.15);
  BP.board(g, t, { title: 'AROUND THE EARTH', fig: 'FIG 16 - 10,950 km' });
  const cx = E.W * 0.5, cy = E.H * 0.53, R = 300, draw = ease.out(prog(t, 0, 1.5)), rot = -20 + t * 9, z = 1 + 0.04 * t / info.dur;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  glow(g, cx, cy, R * 1.5, ui.blueprint, 0.1);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = alpha('#0b1a3a', 0.85); g.fill(); g.clip();
  // graticule
  g.strokeStyle = alpha(ui.blueprint, 0.25); g.lineWidth = 2;
  for (let lon = -180; lon < 180; lon += 30) { g.beginPath(); let on = false; for (let lat = -90; lat <= 90; lat += 6) { const [x, y, zz] = proj(lon, lat, rot, R, cx, cy); if (zz < 0) { on = false; continue; } on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } g.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { g.beginPath(); let on = false; for (let lon = -180; lon <= 180; lon += 6) { const [x, y, zz] = proj(lon, lat, rot, R, cx, cy); if (zz < 0) { on = false; continue; } on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } g.stroke(); }
  // continents: cream line art (front side only)
  for (const shape of LAND) { const pts = []; for (let i = 0; i < shape.length - 1; i++) for (let k = 0; k < 4; k++) { const u = k / 4, [x, y, zz] = proj(lerp(shape[i][0], shape[i + 1][0], u), lerp(shape[i][1], shape[i + 1][1], u), rot, R, cx, cy); pts.push([x, y, zz]); }
    if (pts.every(p => p[2] < 0)) continue; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = alpha(CREAM, 0.08); g.fill();
    BP.draw(g, pts.filter(p => p[2] > -0.05).map(p => [p[0], p[1]]), draw, { w: 3.5, color: alpha(CREAM, 0.9) }); }
  g.restore();
  BP.draw(g, Array.from({ length: 73 }, (_, i) => [cx + Math.cos(i / 72 * Math.PI * 2) * R, cy + Math.sin(i / 72 * Math.PI * 2) * R]), draw, { w: 5, color: CREAM });
  // the distance ring: quarter ticks, gold arc from HOME (top) clockwise
  const RR = R + 70, a0 = -Math.PI / 2, frac = 0.274 * ease.inOut(prog(t, tM, tQ + 0.05));
  ring(g, cx, cy, RR, 2, alpha(ui.blueprint, 0.4 * draw));
  ['HOME', '1/4', '1/2', '3/4'].forEach((s, i) => { const a = a0 + i * Math.PI / 2, x = cx + Math.cos(a) * RR, y = cy + Math.sin(a) * RR; seg(g, [[cx + Math.cos(a) * (RR - 16), cy + Math.sin(a) * (RR - 16)], [cx + Math.cos(a) * (RR + 16), cy + Math.sin(a) * (RR + 16)]], 4, alpha(CREAM, draw)); if (i) text(g, s, cx + Math.cos(a) * (RR + 64), cy + Math.sin(a) * (RR + 56), { size: 34, color: alpha(CREAM, 0.8 * draw), font: FONTS.ui, weight: 900 }); });
  if (frac > 0.001) { g.save(); g.strokeStyle = GOLD; g.lineWidth = 12; g.lineCap = 'round'; g.shadowColor = alpha(GOLD, 0.8); g.shadowBlur = 20; g.beginPath(); g.arc(cx, cy, RR, a0, a0 + frac * Math.PI * 2); g.stroke(); g.restore(); }
  // HOME pin at the start of the arc
  const pinY = cy - RR; poly(g, [[cx, pinY - 6], [cx - 16, pinY - 40], [cx + 16, pinY - 40]], '#d4262e'); circle(g, cx, pinY - 48, 18, '#d4262e'); circle(g, cx, pinY - 48, 7, '#fff');
  text(g, 'HOME', cx - 70, pinY - 50, { size: 30, color: CREAM, font: FONTS.ui, weight: 900, align: 'right', spacing: 2 });
  // the tiny runner rides the arc tip (line art, legs cycling)
  const aT = a0 + frac * Math.PI * 2, tx = cx + Math.cos(aT) * RR, ty = cy + Math.sin(aT) * RR;
  g.save(); g.translate(tx, ty); g.rotate(aT + Math.PI / 2); UI.lineFigure(g, { x: 0, y: -8, s: 0.36, pose: walkPose(t * 9, {}), color: GOLD }); g.restore();
  // '> 1/4' lands on 'quarter'
  const ql = t - tQ; if (ql > -0.02) { const k = ease.outBack(prog(t, tQ, tQ + 0.35)); g.save(); g.translate(cx + RR + 250, cy - 120); g.scale(k, k); goldPop(g, '> 1/4', 0, 0, 96, ql, { label: 'OF THE WAY ROUND' }); g.restore(); }
  g.restore();
  const se = t - tE; if (se > 0 && se < 0.9) { const k = 1 - se / 0.9; FX.sparkle(g, cx - 180, cy - 210, 50 * k, '#fff', 0.95); FX.sparkle(g, cx + 220, cy + 160, 40 * k, GOLD, 0.95); FX.sparkle(g, cx - 40, cy + 260, 30 * k, '#fff', 0.9); glow(g, cx, cy, R * 1.6, GOLD, 0.15 * k); }
} });
