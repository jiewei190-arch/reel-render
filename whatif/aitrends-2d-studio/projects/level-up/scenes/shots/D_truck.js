// D_truck.js — ep 5 batch D (s082-s111, 258.79-343.95 s), CLASSIC style: the fridge emptied at night, Biscuit guards her bowl,
// LEVEL 23 THE TRUCK (morning pop 22->23, 6,451->8,127 kg), nearly Halloween, the pumpkin truck stuck in the mud, "Easy. You push.",
// the trainers spin, the puddle slide; RULE 5 + FIG 6 (friction, MAX GRIP = WEIGHT x μ, μ ≈ 1 on dry concrete, mud much lower,
// 50 kg, ~490 N), LV 23 card + giant face 'GRIP: LV 1'; THE RESCUE (lift, not push; Mina's planks + RULE 3; the slow low-angle lift;
// Dev's gravel; Mina's sand 'GRIP'; the truck crawls out, not one pumpkin falls; the biggest pumpkin; carried home on one finger).
// Local props: heroTrim (cyan zip pull + cuff stripes), truck (cream cab, wooden flatbed, pumpkins, '7.5 t' sticker, sodium
// indicator), mud + puddle, open fridge, cereal bowl, Biscuit's bowl + witch hat, pumpkin lantern, planks, gravel, sand bucket,
// trainers, bathroom scale, driver (VOLUNTEER outfit + cap + hi-vis). LEGAL: no window frames, no words beyond the card's.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, linGrad, radGrad, text, FONTS, wordTime, veil } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { HERO, VOLUNTEER } from '../cast.js';
import { blinkFlag, exprAt, poseAt, idle, walkAlong, lookToward, pointAndLook, camMove } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { home3, home3Fg } from '../sets/home3.js';
import { park, parkFg } from '../sets/park.js';
import { street, streetFg } from '../sets/street.js';
import { cat } from '../sets/creatures.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, label } from '../sets/bp.js';
import { splash } from '../sets/spiderprops.js';
import { PAL, statCard, levelUp, levelFlash, levelShake, freeze, morningPop, sparks } from '../sets/statcard.js';
import { P5, bloom, speedLines5, lowAngle, lowAngleWrap, rimLight } from '../sets/fx5.js';

const HS = 1.9, ui = () => S().ui;
const shotWord = (w, st, fb) => { const g = wordTime(w, st - 0.1); return (g == null || g > st + 10 ? st + fb : g) - st; };
const goldT = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 44, color: ui().gold, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1, glow: 12, glowColor: alpha(ui().gold, 0.5) });
const cream = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 30, color: ui().cream, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1 });
const pop = (t, at, d = 0.35) => ease.outBack(prog(t, at, at + d));
const W2 = (o, p) => [o.x + p[0] * o.s * (o.facing ?? 1), o.y + p[1] * o.s];

// ---------- the hero with his cyan trim ----------
function hero(g, o) {
  const pose = o.pose || POSES.stand; actor(g, 'HERO', { s: HS, ...o, pose });
  const oo = { s: HS, facing: 1, ...o }, [zx, zy] = W2(oo, [pose.sh[0] + 4, pose.sh[1] + 22]);
  rr(g, zx - 3, zy, 6, 14, 3); g.fillStyle = PAL.cyan; g.fill();                                                   // zip pull
  for (const [e, h] of [[pose.eF, pose.hF], [pose.eB, pose.hB]]) { const a = W2(oo, e), b = W2(oo, h), cx = lerp(a[0], b[0], 0.78), cy = lerp(a[1], b[1], 0.78), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; seg(g, [[cx - Math.cos(ang) * 9, cy - Math.sin(ang) * 9], [cx + Math.cos(ang) * 9, cy + Math.sin(ang) * 9]], 3, PAL.cyan); }   // cuff stripes
  return pose;
}
// ---------- the pumpkin truck ----------
function pumpkin(g, x, y, s, seed = 1, o = {}) { const R = rng(seed * 13 + 3), w = 1 + R() * 0.25, c = mix('#f08a24', '#e06a14', R());
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s * w, s); for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 13, -30, 22 - Math.abs(i) * 3, 30, 0, 0, 7); g.fillStyle = shade(c, -Math.abs(i) * 0.06 - (i > 0 ? 0.08 : 0)); g.fill(); }
  g.strokeStyle = alpha('#8a3a08', 0.55); g.lineWidth = 2; for (const i of [-1, 0, 1]) { g.beginPath(); g.moveTo(i * 13, -58); g.quadraticCurveTo(i * 18, -30, i * 13, -2); g.stroke(); } g.fillStyle = alpha('#fff0c0', 0.35); g.beginPath(); g.ellipse(-15, -44, 5, 11, -0.3, 0, 7); g.fill(); seg(g, [[0, -58], [4, -74], [10, -78]], 6, '#3f7a2a');
  if (o.face) { g.fillStyle = o.lit ? '#ffcf5a' : '#3a1a08'; for (const sx of [-1, 1]) poly(g, [[sx * 18, -42], [sx * 8, -42], [sx * 13, -52]], g.fillStyle); g.beginPath(); g.moveTo(-22, -22); for (let k = 0; k <= 6; k++) g.lineTo(-22 + k * 7.3, -22 + (k % 2 ? 7 : 0)); g.lineTo(22, -14); g.quadraticCurveTo(0, -4, -22, -14); g.closePath(); g.fill(); if (o.lit) glow(g, 0, -30, 80, '#ffb050', 0.4 * o.lit); }
  g.restore(); }
const TL = 1240, TH = 460, WR = 80;
function truck(g, x, y, s, o = {}) {   // x = truck centre, y = ground under the front wheel
  const t = o.t ?? 0, sink = clamp(o.sink ?? 1), lift = o.lift ?? 0, spin = (o.spin ?? 0) * Math.PI * 2, tilt = -0.06 * sink * (1 - clamp(lift / 90)) + 0.04 * clamp(lift / 90) * sink;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 6, TL * 0.52, 22, 0, 0, 7); g.fill();
  g.translate(TL * 0.3, -WR); g.rotate(tilt); g.translate(-TL * 0.3, WR);
  rr(g, -TL / 2, -WR - 44, TL, 44, 6); g.fillStyle = '#2a2e36'; g.fill();                                                          // chassis
  const bx0 = -TL / 2, bx1 = TL * 0.12; rr(g, bx0, -WR - 210, bx1 - bx0, 166, 4); g.fillStyle = linGrad(g, 0, -WR - 210, 0, -WR - 44, ['#b0784a', '#7a4f2e']); g.fill(); g.strokeStyle = '#3a2412'; g.lineWidth = 4; g.stroke();
  for (let i = 1; i < 4; i++) seg(g, [[bx0 + 6, -WR - 210 + i * 41], [bx1 - 6, -WR - 210 + i * 41]], 3, alpha('#3a2412', 0.5)); for (let px = bx0 + 110; px < bx1; px += 150) seg(g, [[px, -WR - 210], [px, -WR - 44]], 7, '#5a3a20');
  const R = rng(5); for (let row = 0; row < 3; row++) for (let i = 0; i < 8 - row * 2; i++) { const n = 8 - row * 2, px = bx0 + 80 + row * 70 + i * ((bx1 - bx0 - 160 - row * 140) / Math.max(1, n - 1)), py = -WR - 200 - row * 48 + R() * 6 + Math.sin(t * 9 + i + row) * (o.wobble ?? 0) * 3;
    if (o.teeter && row === 2 && i === n - 1) { pumpkin(g, px + 24 * o.teeter, py, 1.0, row * 10 + i, { rot: 0.5 * o.teeter }); continue; } pumpkin(g, px, py, 1.05 - row * 0.05, row * 10 + i); }
  const cx0 = TL * 0.14, cx1 = TL / 2; g.beginPath(); g.moveTo(cx0, -WR - 44); g.lineTo(cx0, -TH); g.lineTo(cx1 - 150, -TH); g.quadraticCurveTo(cx1 - 70, -TH + 10, cx1 - 40, -TH * 0.62); g.lineTo(cx1, -TH * 0.56); g.lineTo(cx1, -WR - 44); g.closePath();
  g.fillStyle = linGrad(g, 0, -TH, 0, -WR - 44, ['#f6ecd8', '#e9dcc4', '#c8b898']); g.fill(); g.strokeStyle = '#3a3428'; g.lineWidth = 4; g.stroke();
  g.fillStyle = linGrad(g, 0, -TH, 0, -TH * 0.6, ['#a8c8e0', '#3a4a68']); g.beginPath(); g.moveTo(cx0 + 36, -TH + 28); g.lineTo(cx1 - 160, -TH + 28); g.quadraticCurveTo(cx1 - 86, -TH + 38, cx1 - 62, -TH * 0.66); g.lineTo(cx0 + 36, -TH * 0.66); g.closePath(); g.fill();
  seg(g, [[cx0 + 240, -TH + 20], [cx0 + 240, -WR - 44]], 4, '#8a7a60'); rr(g, cx0 + 110, -TH * 0.5, 50, 10, 4); g.fillStyle = '#6a604c'; g.fill();
  const sx = cx0 + 130, sy = -TH * 0.36; circle(g, sx, sy, 34, '#fffbe8'); ring(g, sx, sy, 34, 4, '#3a3428'); text(g, '7.5 t', sx, sy + 2, { size: 26, color: ui().gold, font: FONTS.ui, weight: 900, stroke: 4, strokeColor: '#3a3428' });   // the sticker
  rr(g, cx1 - 34, -TH * 0.5, 28, 40, 8); g.fillStyle = '#fff6d8'; g.fill();
  const blink = Math.floor(t * 1.6) % 2 === 0; for (const ix of [cx1 - 20, bx0 + 14]) { rr(g, ix - 12, -WR - 96, 24, 18, 5); g.fillStyle = blink ? P5.sodium : '#6a3a10'; g.fill(); if (blink) glow(g, ix, -WR - 87, 90, P5.sodium, 0.5); }
  for (const [wx, back] of [[-TL * 0.32, true], [TL * 0.32, false]]) { const wy = -WR + (back ? sink * 64 - lift : 0); circle(g, wx, wy, WR + 10, '#1a1c22'); circle(g, wx, wy, WR, '#24262e'); circle(g, wx, wy, WR * 0.5, '#9a9ea6'); for (let k = 0; k < 6; k++) { const a = k * 1.047 + (back ? spin : 0); seg(g, [[wx + Math.cos(a) * WR * 0.6, wy + Math.sin(a) * WR * 0.6], [wx + Math.cos(a) * WR * 0.95, wy + Math.sin(a) * WR * 0.95]], 8, '#121418'); } circle(g, wx, wy, 13, '#3a3e48'); }
  g.restore();
  return { backWheel: [x - TL * 0.32 * s, y - (WR - sink * 64 + lift) * s], tail: [x - TL / 2 * s, y - (WR + 120) * s], door: [x + (TL * 0.14 + 130) * s, y - TH * 0.36 * s], corner: [x - TL * 0.46 * s, y - (WR + 40) * s] };
}
function mud(g, x, y, w, o = {}) { const t = o.t ?? 0, R = rng(o.seed ?? 3);
  g.fillStyle = linGrad(g, 0, y - 30, 0, y + 50, ['#5a3a20', '#3a2412']); g.beginPath(); g.ellipse(x, y + 10, w / 2, 46, 0, 0, 7); g.fill();
  for (let i = 0; i < 14; i++) { g.fillStyle = alpha(i % 2 ? '#6a4a2a' : '#2a1a0c', 0.7); g.beginPath(); g.ellipse(x + (R() - 0.5) * w * 0.9, y + (R() - 0.5) * 50, 20 + R() * 40, 6 + R() * 6, 0, 0, 7); g.fill(); }
  if (o.puddle !== false) { const px = x + w * 0.22; g.fillStyle = linGrad(g, 0, y, 0, y + 40, ['#8a7aa0', '#4a4060']); g.beginPath(); g.ellipse(px, y + 18, w * 0.22, 18, 0, 0, 7); g.fill(); g.fillStyle = alpha('#ffd0a0', 0.4); g.beginPath(); g.ellipse(px - 20, y + 14, w * 0.08, 4, 0, 0, 7); g.fill(); }
  g.fillStyle = alpha('#ffffff', 0.18); for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(x - w * 0.3 + i * w * 0.14, y - 4 + (i % 2) * 14, 16, 3, 0, 0, 7); g.fill(); }   // glossy highlights
}
function plank(g, x, y, len, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); rr(g, -len / 2, -20, len, 20, 3); g.fillStyle = linGrad(g, 0, -20, 0, 0, ['#e0b880', '#b8925e']); g.fill(); g.strokeStyle = '#6a4a28'; g.lineWidth = 3; g.stroke(); for (let i = 0; i < 3; i++) seg(g, [[-len / 2 + 30 + i * len * 0.3, -12], [-len / 2 + 30 + i * len * 0.3 + len * 0.2, -10]], 1.5, alpha('#6a4a28', 0.5)); g.restore(); }
function gravel(g, x, y, k, s = 1) { const R = rng(17); for (let i = 0; i < Math.round(60 * k); i++) { const a = R() * Math.PI, r = R() ** 0.7 * 80; circle(g, x + Math.cos(a) * r * 1.3 * s, y - Math.sin(a) * r * 0.42 * s, (5 + R() * 6) * s, mix('#8a8e96', '#c8ccd4', R())); } }
function bucket(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); g.moveTo(-50, -90); g.lineTo(50, -90); g.lineTo(40, 0); g.lineTo(-40, 0); g.closePath(); g.fillStyle = linGrad(g, -50, 0, 50, 0, ['#4ab0e8', '#2a7ab8']); g.fill(); g.strokeStyle = '#1a3a5a'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#e8c890'; g.beginPath(); g.ellipse(0, -90, 50, 12, 0, 0, 7); g.fill(); g.strokeStyle = '#1a3a5a'; g.lineWidth = 4; g.beginPath(); g.arc(0, -90, 54, Math.PI, 0); g.stroke(); g.restore(); }
function cerealBowl(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 120, 14, 0, 0, 7); g.fill(); g.fillStyle = '#f2efe6'; g.beginPath(); g.moveTo(-120, -70); g.quadraticCurveTo(-110, 0, 0, 0); g.quadraticCurveTo(110, 0, 120, -70); g.closePath(); g.fill(); g.fillStyle = '#fbf6ea'; g.beginPath(); g.ellipse(0, -70, 120, 22, 0, 0, 7); g.fill(); for (let i = 0; i < 16; i++) circle(g, -90 + (i * 47) % 180, -72 + (i % 3) * 5, 9, i % 2 ? '#e2a64a' : '#c98a32'); g.fillStyle = '#4a86c8'; rr(g, -100, -46, 200, 10, 5); g.fill(); seg(g, [[60, -76], [130, -170]], 10, '#c8ccd4'); g.restore(); }
function catBowl(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-80, -40); g.lineTo(80, -40); g.lineTo(60, 0); g.lineTo(-60, 0); g.closePath(); g.fillStyle = linGrad(g, 0, -40, 0, 0, ['#b07ae0', '#7a4ab0']); g.fill(); g.fillStyle = '#5a3a1a'; g.beginPath(); g.ellipse(0, -40, 80, 12, 0, 0, 7); g.fill(); for (let i = 0; i < 9; i++) circle(g, -56 + i * 14, -44 + (i % 2) * 4, 6, '#8a5a2a'); text(g, 'BISCUIT', 0, -18, { size: 20, color: '#fff3c4', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); }
function witchHat(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = '#2a2236'; g.beginPath(); g.ellipse(0, 0, 60, 12, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-34, -4); g.quadraticCurveTo(-10, -60, 26, -110); g.quadraticCurveTo(4, -50, 34, -4); g.closePath(); g.fill(); g.fillStyle = '#9a5ad6'; g.fillRect(-34, -16, 68, 10); g.restore(); }
function openFridge(g, P, GY, t, bare) { const fx = P.fridgeX, ft = P.fridgeTop, fl = bare ? (Math.sin(t * 40) > 0.3 ? 0.4 : 1) : 1;
  rr(g, fx - 150, ft + 10, 300, GY - ft - 10, 12); g.fillStyle = mix('#3a3a40', '#fff8e0', 0.9 * fl); g.fill(); glow(g, fx, ft + 200, 600, '#fff2d0', 0.35 * fl);
  for (let i = 0; i < 4; i++) { seg(g, [[fx - 140, ft + 120 + i * 120], [fx + 140, ft + 120 + i * 120]], 5, '#c8ccd4'); if (!bare) for (let k = 0; k < 3; k++) { rr(g, fx - 120 + k * 80, ft + 70 + i * 120, 60, 48, 6); g.fillStyle = ['#e85a4a', '#f2c230', '#5aa04a', '#e8e0d0'][(i + k) % 4]; g.fill(); } }
  g.beginPath(); g.moveTo(fx - 150, ft); g.lineTo(fx - 330, ft + 50); g.lineTo(fx - 330, GY - 30); g.lineTo(fx - 150, GY); g.closePath(); g.fillStyle = linGrad(g, fx - 330, 0, fx - 150, 0, ['#c8ccd4', '#e8ecf0']); g.fill(); g.strokeStyle = '#8a8e96'; g.lineWidth = 3; g.stroke(); }
function scale(g, x, y, s, kg) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -110, -34, 220, 34, 12); g.strokeStyle = ui().cream; g.lineWidth = 4; g.stroke(); rr(g, -50, -30, 100, 22, 6); g.stroke(); if (kg) goldT(g, kg, 0, -18, { size: 22 }); g.restore(); }
function bpFigure(g, x, y, s, o = {}) {   // a cream outline figure for the blueprints (o.push: lean + arms forward, o.lift: arms up, o.slide: legs back)
  const U = ui(); g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = U.cream; g.lineWidth = 6; g.lineCap = 'round';
  const lean = o.push ? 0.35 : 0, hip = [-lean * 60, -110], sh = [hip[0] + Math.sin(lean) * 120, hip[1] - Math.cos(lean) * 120]; ring(g, sh[0] + 16, sh[1] - 40, 28, 5, U.cream);
  g.beginPath(); g.moveTo(...sh); g.lineTo(...hip); const fb = o.slide ? -70 : -40; g.lineTo(hip[0] + fb, 0); g.moveTo(...hip); g.lineTo(hip[0] + 30, 0);
  if (o.lift) { g.moveTo(...sh); g.lineTo(sh[0] + 30, sh[1] - 60); g.lineTo(sh[0] + 40, sh[1] - 120); } else { g.moveTo(...sh); g.lineTo(sh[0] + 70, sh[1] + 10); g.lineTo(sh[0] + 130, sh[1] + 6); } g.stroke(); g.restore(); }
const arrowG = (g, x0, y0, x1, y1, w, col) => { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); if (L < 4) return; seg(g, [[x0, y0], [x1 - Math.cos(a) * 24, y1 - Math.sin(a) * 24]], w, col); poly(g, [[x1, y1], [x1 - Math.cos(a - 0.5) * 40, y1 - Math.sin(a - 0.5) * 40], [x1 - Math.cos(a + 0.5) * 40, y1 - Math.sin(a + 0.5) * 40]], col); };
const driver = (g, o) => { const p = o.pose || POSES.stand; actor(g, { ...VOLUNTEER, head: 'cap', headColor: '#5a5e68' }, { s: HS, ...o, pose: p }); const oo = { s: HS, facing: 1, ...o }, [sx, sy] = W2(oo, p.sh); rr(g, sx - 26 * HS * 0.5, sy + 4, 46 * HS * 0.5, 60 * HS * 0.5, 4); g.fillStyle = alpha('#d8f040', 0.85); g.fill(); seg(g, [[sx - 12, sy + 20], [sx + 12, sy + 20]], 3, '#e8e8e8'); };
// park verge setup: the truck slid off the path (right), mud under the back wheel
const VERGE = { tx: E.W / 2 + 330, ty: E.H * 0.8 + 120, ts: 0.82 };
function verge(g, t, cam, o = {}) {
  const P = park(g, t, cam, { season: 'autumn', mood: 'dusk', puddles: true, bench: false, fountain: false }), GY = P.GY;
  let T; layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY + 30, 0, GY + 300, ['#5a6a3a', '#3a4a2a']); g.beginPath(); g.moveTo(-E.W, GY + 40); g.quadraticCurveTo(E.W / 2, GY + 20, E.W * 2, GY + 60); g.lineTo(E.W * 2, E.H * 2); g.lineTo(-E.W, E.H * 2); g.fill();   // the grass verge below the path
    const bw = [VERGE.tx - TL * 0.32 * VERGE.ts, VERGE.ty]; mud(g, bw[0] + 40, VERGE.ty + 10, 520, { t, puddle: o.puddle !== false });
    if (o.planks) { g.save(); g.globalAlpha *= o.planks; plank(g, bw[0] + 40, VERGE.ty + 30, 380, 0.02); plank(g, bw[0] + 70, VERGE.ty + 52, 380, -0.03); g.restore(); }
    if (o.before) o.before(g, GY);
    T = truck(g, VERGE.tx + (o.dx ?? 0), VERGE.ty - (o.up ?? 0), VERGE.ts, { t, sink: o.sink ?? 1, lift: o.lift ?? 0, spin: o.spin ?? 0, wobble: o.wobble ?? 0, teeter: o.teeter ?? 0 });
    if (o.gravel) gravel(g, bw[0] + 30, VERGE.ty + 20, o.gravel, 0.9);
    if (o.sand) { g.fillStyle = '#e8d0a0'; g.beginPath(); g.ellipse(bw[0] + 160, VERGE.ty + 24, 40 + 110 * o.sand, 10 + 12 * o.sand, 0, 0, 7); g.fill(); }
    if (o.after) o.after(g, GY, T);
  });
  if (o.fg !== false) parkFg(g, t, cam, { season: 'autumn' });
  return { P, GY, T };
}

function bigPuddle(g, x, y) { g.fillStyle = '#4a3220'; g.beginPath(); g.ellipse(x, y, 230, 40, 0, 0, 7); g.fill(); g.fillStyle = linGrad(g, 0, y - 24, 0, y + 24, ['#9a8ab0', '#4a4060']); g.beginPath(); g.ellipse(x, y, 190, 28, 0, 0, 7); g.fill(); g.fillStyle = alpha('#ffd0a0', 0.4); g.beginPath(); g.ellipse(x - 40, y - 6, 70, 5, 0, 0, 7); g.fill(); }
// ============================== s082 YOU EMPTY THE FRIDGE ==============================
registerShot('s082', { draw(g, t, info) {
  const st = info.shot.start, tf = shotWord('fridge', st, 1.03), cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [260, 280], drift: 0.3 });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'night', cereal: 0, plate: 0 }), P = H.pos, GY = H.GY;
  layer(g, cam, 1, (g) => {
    openFridge(g, P, GY, t, t > tf);
    const pose = idle({ ...POSES.reach, hF: [70, -150], eF: [40, -160] }, t, 2), x = P.fridgeX - 380;
    hero(g, { x, y: GY, facing: 1, pose, expr: exprAt(t, [[0, 'happy'], [tf, 'surprised']]), blink: blinkFlag(t, 3, 2), look: lookToward(1, -0.1), rim: { color: '#fff2d0', dir: [1, -0.3] }, t });
    for (let i = 0; i < 3; i++) { const t0 = 0.25 + i * 0.38, u = clamp((t - t0) / 0.7); if (u <= 0 || u >= 1) continue; const px = lerp(x + 40, x - 420 - i * 60, u), py = GY - 330 - Math.sin(u * Math.PI) * 240 + u * 260;
      g.save(); g.translate(px, py); g.rotate(u * 8); if (i === 0) { rr(g, -18, -50, 36, 90, 12); g.fillStyle = alpha('#e8f4ff', 0.9); g.fill(); g.strokeStyle = '#8aa'; g.stroke(); } else if (i === 1) { poly(g, [[-36, 10], [36, 10], [0, -30]], '#f2c230'); } else { rr(g, -40, -30, 80, 60, 10); g.fillStyle = '#e8c890'; g.fill(); } g.restore(); }
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// ============================== s083 BISCUIT GUARDS HER BOWL ==============================
registerShot('s083', { draw(g, t, info) {
  const st = info.shot.start, tg = shotWord('guards', st, 0.52), tb = shotWord('bowl', st, 0.94), cam = camMove(t, info.dur, { z: [1.1, 1.14], x: [-200, -190], y: [200, 200], drift: 0.2 });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'night', cereal: 0, plate: 0 }), GY = H.GY;
  layer(g, cam, 1, (g) => {
    glow(g, E.W, GY - 300, 900, '#fff2d0', 0.25);                                                                         // the open fridge's light, off right
    const sh = ease.inOut(prog(t, 0.2, tb)) * (1 - ease.inOut(prog(t, tb, tb + 0.6))); g.fillStyle = alpha('#05040a', 0.45 * sh); g.beginPath(); g.ellipse(700 + 200 * (1 - sh), GY + 10, 520, 60, 0, 0, 7); g.fill();   // his shadow looms
    catBowl(g, 760, GY + 20, 1.3); cat(g, { x: 560, y: GY + 20, s: 2.2, facing: 1, pose: 'sit', eyes: t > tg ? 'offended' : 'auto', t, tilt: t > tg ? -0.06 : 0 });
    if (t > tg) { const k = ease.out(prog(t, tg, tg + 0.2)); circle(g, 560 + 100 * k + 60, GY - 40 - 20 * k, 20, '#2a2230'); }   // a paw over the rim
  });
} });

// ============================== s084 LEVEL 23 THE TRUCK (morning pop) ==============================
registerShot('s084', { draw(g, t, info) {
  const st = info.shot.start, tt = shotWord('tonnes', st, 2.24), at = 0.05, tf = freeze(t, 1.2, 5), sh = levelShake(t, 1.2, 3);
  const cam = { ...camMove(tf, info.dur, { z: [1.0, 1.08] }), y: 0 }; cam.x = (cam.x || 0) + sh[0]; cam.y += sh[1];
  const H = home3(g, tf, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 }), P = H.pos;
  layer(g, cam, 0.55, (g) => pumpkin(g, P.windowX ?? E.W / 2 - 700, P.counterTop ? P.counterTop - 330 : 300, 1.1, 4, { face: 1, lit: 0.6 }));
  layer(g, cam, 1, (g) => {
    cerealBowl(g, P.tableX, P.tableTop - 6, 1);
    if (t > 1.2 && t < 2.6) speedLines5(g, t, { mode: 'focus', cx: P.tableX + 330, cy: P.tableTop - 310, inner: 420, color: P5.gold, a: 0.5 * (1 - prog(t, 2.0, 2.6)) });
    morningPop(g, tf, { at, zipX: P.tableX, zipY: P.tableTop - 140, cardX: P.tableX + 330, cardY: P.tableTop - 310, s: 1, lv: [22, 23], str: [6451, 8127], popX: P.tableX - 400, popY: P.tableTop - 380, popS: 0.75 });
  });
  chip(g, t, { str: 'LEVEL 23: THE TRUCK', at: 0.18, x: E.W * 0.5, y: E.H * 0.08 });
  chip(g, t, { str: 'OVER 8 t', at: tt, x: E.W * 0.78, y: E.H * 0.86 });
  levelFlash(g, t, 1.2);
} });

// ============================== s085 NEARLY HALLOWEEN ==============================
registerShot('s085', { draw(g, t, info) {
  const st = info.shot.start, th = shotWord('halloween', st, 0.66), cam = camMove(t, info.dur, { z: [1.6, 1.64], x: [-560, -555], y: [-60, -60], drift: 0.15 });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'dusk', cereal: 0, plate: 0 }), P = H.pos, sill = (P.counterTop ?? H.GY - 300) - 18;
  layer(g, cam, 1, (g) => {
    const lit = 0.6 + 0.4 * Math.abs(Math.sin(t * 9)) * (t > th ? 1 : 0.5); pumpkin(g, P.counterL + 260, sill, 1.4, 4, { face: 1, lit });
    cat(g, { x: P.counterL + 470, y: sill + 4, s: 1.2, facing: -1, pose: 'sit', eyes: 'auto', t });
    const k = ease.outBack(prog(t, 0.2, 0.6)); witchHat(g, P.counterL + 474, sill - 150 + (1 - k) * 30, 0.9, -0.15);
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// ============================== s086 THE PUMPKIN TRUCK ==============================
registerShot('s086', { draw(g, t, info) {
  const st = info.shot.start, tw = shotWord('truck', st, 0.93), th = shotWord('has', st, 2.47), cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.3 }); cam.x += lerp(-260, 60, ease.inOut(prog(t, 0, tw + 0.6)));
  verge(g, t, cam, { wobble: 1, after: (g, GY) => {
    const k = ease.out(prog(t, th, info.dur)); if (k <= 0) return; const x0 = lerp(-300, 260, k);
    actor(g, 'MINA', { x: x0 - 160, y: GY, s: HS, facing: 1, pose: walkAlong(x0, HS, { kid: true }).pose, expr: 'surprised', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0), t });
    hero(g, { x: x0, y: GY, facing: 1, pose: walkAlong(x0, HS).pose, expr: 'smirk', blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0), t });
    actor(g, 'DEV', { x: x0 - 330, y: GY, s: HS, facing: 1, pose: { ...walkAlong(x0 - 330, HS).pose, ...{ hF: POSES.phone.hF, eF: POSES.phone.eF } }, expr: 'happy', blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), t });
  } });
} });

// ============================== s087 ONE BACK WHEEL SUNK IN MUD ==============================
registerShot('s087', { draw(g, t, info) {
  const st = info.shot.start, ts = shotWord('sunk', st, 1.17), z = lerp(1.3, 1.36, ease.inOut(clamp(t / info.dur))), bw = VERGE.tx - TL * 0.32 * VERGE.ts;
  const cam = { z, x: bw - E.W / 2 + 60, y: 170, r: 0 };
  verge(g, t, cam, { spin: t > ts ? (t - ts) * 2.5 : 0, after: (g) => { if (t > ts) { const R = rng(Math.floor(t * 24)); for (let i = 0; i < 10; i++) circle(g, bw - 60 - R() * 140, VERGE.ty - 40 - R() * 120, 5 + R() * 6, '#4a3220'); } } });
} });

// ============================== s088 THE STICKER ==============================
registerShot('s088', { draw(g, t, info) {
  const st = info.shot.start, ts = shotWord('seven', st, 0.75), dx = VERGE.tx + (TL * 0.14 + 130) * VERGE.ts, dy = VERGE.ty - 460 * 0.36 * VERGE.ts;
  const cam = { z: lerp(2.4, 2.5, ease.inOut(clamp(t / info.dur))), x: dx - E.W / 2, y: dy - E.H / 2, r: 0 };
  verge(g, t, cam, { fg: false, after: (g) => { const k = pop(t, ts); if (k > 0) { ring(g, dx, dy, 34 * VERGE.ts + 8 * k, 4, alpha(ui().gold, k)); glow(g, dx, dy, 80, ui().gold, 0.3 * k); }
    const tap = ease.inOut(prog(t, 1.4, 1.7)) * (1 - ease.inOut(prog(t, 1.9, 2.3))); if (tap > 0) { g.save(); g.translate(dx + 60 - 30 * tap, dy + 40 - 20 * tap); g.rotate(-0.6); rr(g, -12, 0, 24, 160, 10); g.fillStyle = HERO.color; g.fill(); seg(g, [[-12, 120], [12, 120]], 3, PAL.cyan); circle(g, 0, -4, 16, S().ink); g.restore(); } } });
} });

// ============================== s089 EASY. YOU PUSH. ==============================
registerShot('s089', { draw(g, t, info) {
  const st = info.shot.start, tp = shotWord('push', st, 1.49), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-120, -100], drift: 0.25 });
  verge(g, t, cam, { after: (g, GY, T) => {
    const pushing = t > tp - 0.2, x = T.tail[0] - (pushing ? 120 : 260), pose = pushing ? { ...POSES.ready, hF: [96, -160], eF: [56, -160], hB: [90, -150], eB: [50, -150], head: [24, -184] } : idle(t < 0.9 ? { ...POSES.stand, hF: [20, -170], hB: [24, -168], eF: [30, -140], eB: [26, -140] } : POSES.stand, t, 2);
    hero(g, { x, y: GY + 10, facing: 1, pose, expr: exprAt(t, [[0, 'smirk'], [tp, 'determined']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0), rim: { color: '#ffc080', dir: [0.8, -0.4] }, t });
    statCard(g, t, { x: x - 330, y: GY - 560, s: 0.6, lv: 23, str: 8127, xp: 0.1, unfold: ease.out(prog(t, 0.3, 0.8)) });
    actor(g, 'MINA', { x: 260, y: GY, s: HS, facing: 1, pose: idle(POSES.crossArms, t, 1), expr: 'neutral', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0), t });
  } });
} });

// ============================== s090 YOUR TRAINERS SPIN ==============================
function trainer(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -90, -40, 190, 50, 22); g.fillStyle = '#f6f6f2'; g.fill(); g.strokeStyle = '#1a1c22'; g.lineWidth = 4; g.stroke(); rr(g, -96, 0, 202, 18, 9); g.fillStyle = '#9aa0a8'; g.fill(); for (let i = 0; i < 3; i++) seg(g, [[-30 + i * 22, -36], [-20 + i * 22, -20]], 3, '#3a3e48'); seg(g, [[-40, -40], [-60, -90]], 34, HERO.legs); g.restore(); }
registerShot('s090', { draw(g, t, info) {
  const st = info.shot.start, tp = shotWord('spin', st, 0.55), t1 = shotWord('squeak', st, 1.79), t2 = t1 + 0.3, z = 1.0 + 0.03 * ease.inOut(clamp(t / info.dur));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#c88a5a', '#7a5a4a']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = linGrad(g, 0, 600, 0, E.H, ['#5a3a20', '#2a1a0c']); g.fillRect(0, 640, E.W, E.H); mud(g, E.W / 2, 760, 1600, { t, puddle: false });
  const spin = t > tp ? (t - tp) * 18 : 0;
  for (const [x, ph] of [[760, 0], [1160, Math.PI]]) { const a = spin + ph; trainer(g, x + Math.cos(a) * 30, 700 + Math.sin(a) * 12, 1.6, Math.sin(a) * 0.15);
    if (t > tp) { g.strokeStyle = alpha('#f6f2e8', 0.7); g.lineWidth = 5; g.beginPath(); g.ellipse(x, 700, 170, 46, 0, a, a + 2.2); g.stroke(); const R = rng(Math.floor(t * 24) + x); for (let i = 0; i < 6; i++) circle(g, x - 200 - R() * 300, 640 - R() * 200, 6 + R() * 8, '#4a3220'); } }
  for (const [tq, x] of [[t1, 820], [t2, 1220]]) { const k = clamp((t - tq) / 0.35); if (k <= 0 || k >= 1) continue; for (let i = 0; i < 3; i++) { const a = -2.2 + i * 0.5; seg(g, [[x + Math.cos(a) * 140, 600 + Math.sin(a) * 140], [x + Math.cos(a) * (170 + 40 * k), 600 + Math.sin(a) * (170 + 40 * k)]], 6, alpha('#fff3c4', 1 - k)); } }
  g.restore();
} });

// ============================== s091 THE TRUCK DOESN'T MOVE ==============================
registerShot('s091', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.02], x: [-60, -60], drift: 0.1 });
  verge(g, t, cam, { after: (g, GY, T) => {
    const x = T.tail[0] - 120, R = rng(Math.floor(t * 24)); for (let i = 0; i < 3; i++) { const pose = { ...POSES.ready, hF: [96, -160], eF: [56, -160], hB: [90, -150], eB: [50, -150], ...walkAlong(t * 900 + i * 30, HS, { run: true }).pose, hF: [96, -160], hB: [90, -150], eF: [56, -160], eB: [50, -150] }; g.save(); g.globalAlpha *= i ? 0.25 : 1; hero(g, { x: x - i * 8, y: GY + 10, facing: 1, pose, expr: 'determined', blink: false, look: lookToward(1, 0), t }); g.restore(); }
    for (let i = 0; i < 8; i++) circle(g, x - 120 - R() * 200, GY - R() * 60, 5 + R() * 6, '#4a3220');
    actor(g, 'MINA', { x: 260, y: GY, s: HS, facing: 1, pose: idle(POSES.crossArms, t, 1), expr: 'confused', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0), t, rot: t > 0.6 ? 0.08 : 0 });
  } });
} });

// ============================== s092 YOU SLIDE INTO A PUDDLE ==============================
registerShot('s092', { draw(g, t, info) {
  const st = info.shot.start, ts = shotWord('slide', st, 0.26), tp = shotWord('puddle', st, 0.88), cam = camMove(t, info.dur, { z: [1.0, 1.03], x: [-60, -50], drift: 0.2 });
  const bw = VERGE.tx - TL * 0.32 * VERGE.ts, px = bw - 420;
  verge(g, t, cam, { before: (g, GY) => bigPuddle(g, px, GY + 110), after: (g, GY) => {
    const k = ease.in(prog(t, ts, tp)), sat = t > tp + 0.35; let x = lerp(px + 200, px - 40, k), pose;
    if (!sat) pose = k > 0 ? { ...POSES.dive } : { ...POSES.ready, hF: [96, -160], hB: [90, -150], eF: [56, -160], eB: [50, -150] };
    if (sat) hero(g, { x: px - 80, y: GY + 90, facing: 1, pose: idle(POSES.sit, t, 2), expr: 'sheepish', blink: blinkFlag(t, 3, 2), look: lookToward(-1, 0), t });
    else hero(g, { x, y: GY + 10 + k * 60, facing: 1, pose, expr: k > 0 ? 'shocked' : 'determined', blink: false, look: lookToward(1, 0.3), t, rot: k > 0 ? -1.2 * k : 0 });
    splash(g, t, px, GY + 100, { at: tp, s: 1.3, color: '#7a5a3a', dir: 0.2 });
    if (sat) for (let i = 0; i < 3; i++) { const u = (t * 1.5 + i / 3) % 1; circle(g, px - 120 + i * 30, GY - 300 + u * 120, 6, alpha('#7a5a3a', 1 - u)); }
    actor(g, 'DEV', { x: 80, y: GY, s: HS, facing: 1, pose: idle(POSES.phone, t, 3), expr: 'joy', blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), t });
    actor(g, 'MINA', { x: 230, y: GY, s: HS, facing: 1, pose: idle(t > tp ? { ...POSES.stand, hF: [20, -170], eF: [30, -140] } : POSES.stand, t, 1), expr: t > tp ? 'joy' : 'surprised', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0.2), t });
  } });
} });

// ============================== s093 RULE 5 CARD ==============================
registerShot('s093', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 5, title: 'NO GRIP, NO PUSH.', bg: (g, t) => { verge(g, t, { z: 1.04, x: 80, y: 20, r: 0 }, { fg: false }); veil(g, '#0a0a18', 0.25); } });
} });

// ============================== s094-s100 FIG 6 GRIP ==============================
const FX0 = { x: E.W * 0.36, y: E.H * 0.7 };
function gripBoard(g, t, title) { board(g, t, { title: title || 'FIG 6 - GRIP', fig: 'FRICTION' }); }
function gripScene(g, t, o) {   // figure pushing a box on a surface; o: { surf: 'concrete'|'mud', grip: 0..1 bar, push: px arrow, frArrow: 0..1, slide, truck }
  const U = ui(), gy = FX0.y; seg(g, [[160, gy], [E.W - 160, gy]], 5, U.cream);
  if (o.surf === 'mud') { g.fillStyle = alpha('#c8a070', 0.35); for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(260 + i * 150, gy + 20, 60, 10, 0, 0, 7); g.fill(); } cream(g, 'WET MUD', 300, gy + 60, { align: 'left', size: 26 }); }
  else { g.strokeStyle = alpha(U.cream, 0.4); g.lineWidth = 2; for (let x = 200; x < E.W - 160; x += 120) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x - 30, gy + 50); g.stroke(); } cream(g, 'DRY CONCRETE', 300, gy + 60, { align: 'left', size: 26 }); }
  const bx = FX0.x + 340; if (o.truck) { g.strokeStyle = U.cream; g.lineWidth = 5; rr(g, bx, gy - 260, 420, 220, 12); g.stroke(); rr(g, bx + 420, gy - 300, 160, 260, 12); g.stroke(); ring(g, bx + 90, gy - 30, 34, 5, U.cream); ring(g, bx + 470, gy - 30, 34, 5, U.cream); goldT(g, '7.5 t', bx + 210, gy - 140, { size: 56 }); }
  else { rr(g, bx, gy - 200, 240, 200, 10); g.strokeStyle = U.cream; g.lineWidth = 5; g.stroke(); }
  bpFigure(g, FX0.x + (o.slide ? -20 * o.slide : 0), gy, 1.6, { push: 1, slide: o.slide > 0.3 });
  if ((o.push ?? 0) > 4) arrowG(g, FX0.x + 140, gy - 230, FX0.x + 140 + o.push, gy - 230, 12, U.gold);
  if ((o.frArrow ?? 0) > 0.02) arrowG(g, FX0.x - 20, gy + 26, FX0.x - 20 - 200 * o.frArrow, gy + 26, 10, U.gold);
  if (o.grip != null) { rr(g, 200, 140, 600, 40, 20); g.strokeStyle = alpha(U.cream, 0.6); g.lineWidth = 3; g.stroke(); if (o.grip > 0.01) { rr(g, 204, 144, 592 * o.grip, 32, 16); g.fillStyle = U.gold; g.fill(); } cream(g, 'GRIP', 200, 116, { align: 'left', size: 26 }); }
}
registerShot('s094', { draw(g, t, info) {
  const st = info.shot.start, tf = shotWord('friction', st, 0.35), ts = shotWord('sliding', st, 1.29), slide = ease.out(prog(t, ts, ts + 0.5));
  gripBoard(g, t); gripScene(g, t, { surf: 'concrete', push: 220, frArrow: (1 - slide * 0.8) * ease.out(prog(t, tf, tf + 0.3)), slide });
  label(g, t, { at: [FX0.x - 120, FX0.y + 26], to: [FX0.x - 260, FX0.y + 170], str: 'friction', start: tf });
  if (slide > 0) for (let i = 0; i < 3; i++) seg(g, [[FX0.x - 60 - i * 30, FX0.y - 20 - i * 18], [FX0.x - 150 - i * 30, FX0.y - 20 - i * 18]], 4, alpha(ui().cream, slide));
} });
registerShot('s095', { draw(g, t, info) {
  const st = info.shot.start, tg = shotWord('grip', st, 0.50), tw = shotWord('weight', st, 2.38), U = ui();
  gripBoard(g, t); gripScene(g, t, { surf: 'concrete', push: 220, frArrow: 1 });
  const k = pop(t, tg); if (k > 0) { g.save(); g.translate(FX0.x, FX0.y + 40); g.scale(k, k); g.strokeStyle = U.gold; g.lineWidth = 6; g.beginPath(); g.moveTo(-90, 0); g.lineTo(-90, 20); g.lineTo(90, 20); g.lineTo(90, 0); g.stroke(); goldT(g, 'MAX GRIP', 0, 70, { size: 46 }); g.restore(); }
  const w = ease.out(prog(t, tw, tw + 0.4)); if (w > 0) { arrowG(g, FX0.x + 40, FX0.y - 420, FX0.x + 40, FX0.y - 420 + 200 * w, 14, U.gold); goldT(g, 'WEIGHT', FX0.x + 140, FX0.y - 380, { align: 'left', size: 40, alpha: w }); }
} });
registerShot('s096', { draw(g, t, info) {
  const st = info.shot.start, tt = shotWord('times', st, 0.15), tn = shotWord('number', st, 0.87), tc = shotWord('coefficient', st, 1.67), U = ui();
  gripBoard(g, t); g.save(); g.globalAlpha *= 0.35; gripScene(g, t, { surf: 'concrete', push: 220, frArrow: 1 }); g.restore();
  const s1 = 'MAX GRIP = WEIGHT ×', k = ease.out(prog(t, tt, tt + 0.6)); if (k > 0) text(g, s1.slice(0, Math.ceil(s1.length * k)), E.W * 0.47, E.H * 0.36, { size: 86, color: U.cream, font: FONTS.title, weight: 700, align: 'right' });
  const m = pop(t, tn); if (m > 0) { g.save(); g.translate(E.W * 0.47 + 90, E.H * 0.36); g.scale(m, m); goldT(g, 'μ', 0, 0, { size: 150 }); g.restore(); }
  label(g, t, { at: [E.W * 0.47 + 90, E.H * 0.36 + 60], to: [E.W * 0.47 + 300, E.H * 0.36 + 200], str: 'coefficient of friction', start: tc });
} });
function sole(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); const U = ui(); g.strokeStyle = U.cream; g.lineWidth = 6; rr(g, -200, -90, 400, 90, 40); g.stroke(); for (let i = 0; i < 8; i++) seg(g, [[-160 + i * 44, -6], [-150 + i * 44, -30]], 4, U.cream); g.restore(); }
registerShot('s097', { draw(g, t, info) {
  const st = info.shot.start, to = shotWord('one', st, 2.09), U = ui();
  gripBoard(g, t, 'FIG 6 - RUBBER ON DRY CONCRETE'); seg(g, [[300, 640], [1600, 640]], 6, U.cream); for (let x = 340; x < 1600; x += 100) seg(g, [[x, 640], [x - 30, 700]], 3, alpha(U.cream, 0.5)); sole(g, 900, 636, 1.2);
  rr(g, 600, 820, 700, 44, 22); g.strokeStyle = alpha(U.cream, 0.6); g.lineWidth = 3; g.stroke(); const gb = ease.out(prog(t, 0.3, 1.6)); rr(g, 604, 824, 692 * gb, 36, 18); g.fillStyle = U.gold; g.fill(); cream(g, 'GRIP', 600, 800, { align: 'left', size: 26 });
  const k = pop(t, to); if (k > 0) { g.save(); g.translate(E.W * 0.5, 300); g.scale(k, k); goldT(g, 'μ ≈ 1', 0, 0, { size: 130 }); g.restore(); }
} });
registerShot('s098', { draw(g, t, info) {
  const st = info.shot.start, tm = shotWord('much', st, 0.63), tf = shotWord('fifty', st, 2.47), U = ui();
  gripBoard(g, t, 'FIG 6 - WET MUD'); g.fillStyle = alpha('#c8a070', 0.35); for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(360 + i * 150, 650, 70, 12, 0, 0, 7); g.fill(); } seg(g, [[300, 640], [1600, 640]], 6, U.cream);
  const sc = ease.out(prog(t, tf - 0.8, tf - 0.2)); if (sc > 0) { scale(g, lerp(-300, 640, sc), 640, 1.4, t > tf ? '50 kg' : ''); bpFigure(g, lerp(-300, 640, sc), 594, 1.4, {}); } else sole(g, 900, 636, 1.2);
  const gb = 1 - 0.85 * ease.inOut(prog(t, tm, tm + 0.6)); rr(g, 600, 820, 700, 44, 22); g.strokeStyle = alpha(U.cream, 0.6); g.lineWidth = 3; g.stroke(); rr(g, 604, 824, 692 * gb, 36, 18); g.fillStyle = U.gold; g.fill(); cream(g, 'GRIP', 600, 800, { align: 'left', size: 26 });
  if (t > tm + 0.3) goldT(g, 'much lower', 1340, 842, { align: 'left', size: 40, alpha: prog(t, tm + 0.3, tm + 0.6) });
  if (t > tf) { const k = pop(t, tf); g.save(); g.translate(E.W * 0.5, 300); g.scale(k, k); goldT(g, '50 kg', 0, 0, { size: 120 }); g.restore(); }
} });
registerShot('s099', { draw(g, t, info) {
  const st = info.shot.start, th = shotWord('hard', st, 1.99), U = ui(), push = 60 + 220 * ease.inOut(prog(t, 0.3, th));
  gripBoard(g, t); gripScene(g, t, { surf: 'concrete', push, frArrow: 1, grip: 1, truck: true });
  if (t > th) { const k = pop(t, th); g.save(); g.translate(E.W * 0.5, 300); g.scale(k, k); goldT(g, '~490 N = about your own weight', 0, 0, { size: 64 }); g.restore(); }
  label(g, t, { at: [FX0.x + 140 + push, FX0.y - 230], to: [FX0.x + 300, FX0.y - 430], str: 'as hard as you can push', start: th });
} });
registerShot('s100', { draw(g, t, info) {
  const st = info.shot.start, tm = shotWord('mud', st, 0.26), tl = shotWord('less', st, 0.72), ts = shotWord('strong', st, 1.20), U = ui();
  const grip = 1 - 0.8 * ease.inOut(prog(t, tl, tl + 0.4)), boing = t > ts ? Math.max(0, Math.sin((t - ts) * 10)) * 120 * Math.exp(-(t - ts) * 2.5) : 0, push = 280 * grip + boing;
  gripBoard(g, t, 'FIG 6 - ON MUD'); gripScene(g, t, { surf: t > tm ? 'mud' : 'concrete', push, frArrow: grip, grip, truck: true });
  if (t > ts) { const k = pop(t, ts); g.save(); g.translate(FX0.x - 160, FX0.y - 520); g.scale(0.45 * k, 0.45 * k); statCard(g, t, { x: 0, y: 0, s: 1, lv: 23, str: 8127, xp: 0.2, bob: 0 }); g.restore(); cream(g, 'however strong', FX0.x - 160, FX0.y - 380, { size: 30, alpha: prog(t, ts + 0.2, ts + 0.5) }); }
} });

// ============================== s101 YOUR MUSCLES ARE LEVEL 23 ==============================
registerShot('s101', { draw(g, t, info) {
  const st = info.shot.start, tw = shotWord('twenty', st, 1.20), cam = camMove(t, info.dur, { z: [1.15, 1.2], x: [-160, -150], y: [40, 40], drift: 0.2 });
  const bw = VERGE.tx - TL * 0.32 * VERGE.ts, px = bw - 420;
  verge(g, t, cam, { before: (g, GY) => bigPuddle(g, px, GY + 110), after: (g, GY) => {
    hero(g, { x: px - 80, y: GY + 90, facing: 1, pose: idle(POSES.sit, t, 2), expr: 'sheepish', blink: blinkFlag(t, 3, 2), look: lookToward(0.3, -0.6), rim: { color: PAL.cyan, dir: [0, -1] }, t });
    glow(g, px, GY + 100, 260, PAL.cyan, 0.18);
    const uf = ease.out(prog(t, 0.1, 0.6)); statCard(g, t, { x: px - 40, y: GY - 520, s: 1.1, lv: 23, str: 8127, xp: 0.3, unfold: uf, from: [px - 80, GY - 200] });
    sparks(g, t, tw, px - 40 - 360, GY - 520, { n: 20, s: 0.9 });
  } });
} });

// ============================== s102 GIANT FACE: GRIP LV 1 ==============================
registerShot('s102', { draw(g, t, info) {
  const st = info.shot.start, to = shotWord('one', st, 0.97), z = lerp(1, 1.05, ease.inOut(clamp(t / info.dur))), cx = E.W * 0.38, cy = E.H * 0.48, r = 330;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#4a4a7a', '#c88a6a', '#5a6a3a']); g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.8, E.H * 0.3, 700, '#ffc080', 0.3);
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  giantFace(g, cx, cy, r, { who: 'HERO', f: faceAt(t, [[0, 'neutral'], [0.31, 'sheepish'], [to, 'smirk']]), rimSide: 1, rimColor: '#ffc080', blink: blinkFlag(t, 3.2, 1) ? 1 : 0 });
  g.fillStyle = alpha('#5a3a20', 0.85); g.beginPath(); g.ellipse(cx - r * 0.5, cy + r * 0.35, 46, 26, 0.3, 0, 7); g.fill(); circle(g, cx - r * 0.6, cy + r * 0.5, 10, alpha('#5a3a20', 0.8));   // mud splat
  rr(g, cx - 6, cy + r * 1.06, 12, 26, 5); g.fillStyle = PAL.cyan; g.fill();                                                                       // zip pull at the collar
  rr(g, cx - r * 0.42, cy + r * 0.12, 18, 7, 3); g.fillStyle = alpha(PAL.cyan, 0.7); g.fill(); rr(g, cx + r * 0.3, cy + r * 0.12, 18, 7, 3); g.fill();   // HUD reflections on the cheeks
  statCard(g, t, { x: cx + 760, y: cy - 80, s: 0.8, lv: 23, str: 8127, xp: 0.3, warn: 'GRIP: LV 1', warnAt: to });
  g.restore();
} });

// ============================== s103 STOP PUSHING, LIFT INSTEAD ==============================
registerShot('s103', { draw(g, t, info) {
  const st = info.shot.start, tl = shotWord('lift', st, 1.24), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-100, -90], drift: 0.2 });
  verge(g, t, cam, { after: (g, GY, T) => {
    const x = T.tail[0] - 300, P = t < 0.6 ? idle({ ...POSES.stand, hF: [30, -200], eF: [36, -160] }, t, 2) : t < tl ? idle(POSES.think, t, 2) : pointAndLook(t, tl, [1, 0.3]).pose;
    hero(g, { x, y: GY + 10, facing: 1, pose: P, expr: exprAt(t, [[0, 'neutral'], [0.7, 'thinking'], [tl, 'happy']]), blink: blinkFlag(t, 3, 2), look: t < tl ? lookToward(1, t < 0.9 ? 0 : 0.6) : lookToward(1, 0.3), t });
    const k = ease.inOut(prog(t, tl, tl + 0.3)), ax = x + 40, ay = GY - 620; g.save(); g.translate(ax, ay); g.rotate(-Math.PI / 2 * k); poly(g, [[60, 0], [10, -30], [10, -12], [-50, -12], [-50, 12], [10, 12], [10, 30]], ui().gold); g.restore();
  } });
} });

// ============================== s104 LIFTING PUSHES YOU DOWN ==============================
registerShot('s104', { draw(g, t, info) {
  const st = info.shot.start, td = shotWord('down', st, 0.92), ts = shotWord('sideways', st, 1.44), U = ui();
  verge(g, t, { z: 1.0, x: -120, y: 0, r: 0 }, { fg: false }); veil(g, '#0a0a18', 0.4);
  g.save(); g.beginPath(); g.rect(E.W * 0.5, 0, E.W * 0.5, E.H); g.clip(); board(g, t, { title: 'FIG 6b - LIFT', fig: 'NOT SIDEWAYS' }); g.restore(); seg(g, [[E.W * 0.5, 0], [E.W * 0.5, E.H]], 6, U.cream);
  const fx = E.W * 0.68, gy = E.H * 0.74; seg(g, [[E.W * 0.52, gy], [E.W * 0.98, gy]], 5, U.cream); g.strokeStyle = U.cream; g.lineWidth = 5; rr(g, fx + 60, gy - 380, 300, 140, 10); g.stroke(); bpFigure(g, fx, gy, 1.4, { lift: 1 });
  const d = ease.out(prog(t, td, td + 0.3)); if (d > 0) arrowG(g, fx + 10, gy - 160, fx + 10, gy - 160 + 220 * d, 14, U.gold);
  const s2 = ease.out(prog(t, ts - 0.4, ts)); if (s2 > 0) { arrowG(g, fx - 40, gy - 100, fx - 40 - 200 * s2, gy - 100, 10, alpha(U.cream, 0.7)); const x = prog(t, ts, ts + 0.3); if (x > 0) { seg(g, [[fx - 220, gy - 140], [fx - 220 + 160 * x, gy - 60]], 12, PAL.coral); seg(g, [[fx - 60, gy - 140], [fx - 60 - 160 * x, gy - 60]], 12, PAL.coral); } }
  if (d > 0) goldT(g, 'DOWN', fx + 60, gy - 20, { size: 46, align: 'left', alpha: d });
} });

// ============================== s105 MINA'S PLANKS, RULE THREE ==============================
registerShot('s105', { draw(g, t, info) {
  const st = info.shot.start, to = shotWord('on', st, 0.53), tp = shotWord('planks', st, 1.15), tr = shotWord('rule', st, 1.85), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-140, -120], drift: 0.2 });
  const bw = VERGE.tx - TL * 0.32 * VERGE.ts, pk = ease.out(prog(t, 0.1, to));
  verge(g, t, cam, { planks: 0, before: (g, GY) => { g.save(); g.translate(lerp(-500, 0, pk), 0); plank(g, bw + 40, VERGE.ty + 30, 380, 0.02); plank(g, bw + 70, VERGE.ty + 52, 380, -0.03); g.restore(); }, after: (g, GY) => {
    actor(g, 'MINA', { x: lerp(bw - 700, bw - 340, pk), y: GY + 40, s: HS, facing: 1, pose: t < to ? { ...POSES.reach, hF: [70, -90], hB: [60, -80] } : idle(POSES.cheer, t, 1), expr: 'determined', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0.4), t });
    const k = ease.inOut(prog(t, tp - 0.3, tp + 0.2)), x = lerp(bw - 520, bw - 40, k); hero(g, { x, y: lerp(GY + 30, VERGE.ty + 10, k), facing: 1, pose: k > 0 && k < 1 ? walkAlong(x, HS).pose : idle(POSES.stand, t, 2), expr: 'determined', blink: blinkFlag(t, 3, 2), look: lookToward(1, 0), t });
  } });
  chip(g, t, { str: 'RULE 3: PUSH DOWN, THE GROUND PUSHES BACK', at: tr, x: E.W * 0.32, y: E.H * 0.88 });
} });

// ============================== s106 SLOWLY RAISE THE BACK CORNER ==============================
registerShot('s106', { draw(g, t, info) {
  const st = info.shot.start, ts = shotWord('slowly', st, 0.41), tc = shotWord('corner', st, 1.97), cam = lowAngle(t, info.dur, { z: [1.12, 1.2], lift: -90, x: -230 });
  const k = ease.inOut(prog(t, ts, tc)), bw = VERGE.tx - TL * 0.32 * VERGE.ts;
  verge(g, t, cam, { planks: 1, lift: 110 * k, after: (g, GY, T) => {
    if (k > 0.05) { for (let i = 0; i < 4; i++) { g.strokeStyle = '#4a3220'; g.lineWidth = 5 - i; g.beginPath(); g.moveTo(bw - 60 + i * 40, VERGE.ty - 10); g.quadraticCurveTo(bw - 50 + i * 40 + Math.sin(t * 3 + i) * 8, VERGE.ty - 60 * k, bw - 60 + i * 40, T.backWheel[1] + 70); g.stroke(); } }
    const pose = blendPose('crouch', { ...EXTRA_REACH, head: [6, -214] }, k), x = bw - 260;
    rimLight(g, (g2) => hero(g2, { x, y: VERGE.ty + 6, facing: 1, pose, expr: 'determined', blink: blinkFlag(t, 3.4, 2), look: lookToward(1, -0.3), t }), { dir: [1, -0.3], color: PAL.cyan, width: 5, a: 0.8, back: { color: PAL.violet, width: 4, a: 0.3 } });
    if (k > 0.1 && k < 0.98) speedLines5(g, t, { mode: 'focus', cx: x + 60, cy: VERGE.ty - 260, inner: 460, color: P5.cyan, a: 0.25 });
  } });
} });
const EXTRA_REACH = { head: [6, -210], sh: [2, -174], hip: [0, -100], eF: [24, -206], hF: [40, -250], eB: [14, -204], hB: [30, -248], kF: [6, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] };

// ============================== s107 DEV WEDGES GRAVEL ==============================
registerShot('s107', { draw(g, t, info) {
  const st = info.shot.start, tw = shotWord('wedges', st, 0.31), tl = shotWord('wheel', st, 1.45), bw = VERGE.tx - TL * 0.32 * VERGE.ts;
  const cam = { z: 1.7, x: bw - E.W / 2 - 60, y: 120 + Math.sin(t * 0.6) * 4, r: 0 }, gk = clamp((t - tw) / (tl - tw + 0.6));
  verge(g, t, cam, { planks: 1, lift: 110, gravel: gk, fg: false, after: (g, GY) => {
    const sc = Math.sin(t * 7) > 0, pose = sc ? { ...POSES.crouch, hF: [60, -40], eF: [40, -70] } : { ...POSES.crouch, hF: [40, -110], eF: [30, -90] };
    actor(g, 'DEV', { x: bw - 300, y: VERGE.ty + 20, s: HS, facing: 1, pose, expr: 'determined', blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0.6), t });
    const [hx, hy] = [bw - 300 + pose.hF[0] * HS, VERGE.ty + 20 + pose.hF[1] * HS]; for (let i = 0; i < 6; i++) circle(g, hx + (i % 3) * 10, hy - 6 - Math.floor(i / 3) * 8, 6, '#a8acb4');
    rr(g, bw - 300 + 10, VERGE.ty + 20 - 238 * HS, 30, 50, 6); g.fillStyle = '#1b1b1b'; g.fill(); circle(g, bw - 300 + 25, VERGE.ty + 20 - 226 * HS, 5, '#ff3b30');   // the phone tucked in his beanie, still filming
  } });
} });

// ============================== s108 MINA POURS SAND ==============================
registerShot('s108', { draw(g, t, info) {
  const st = info.shot.start, tp = shotWord('pours', st, 0.43), ti = shotWord('it', st + 1.6, 0.6) + 1.6, tg = shotWord('grip', st, 2.61), bw = VERGE.tx - TL * 0.32 * VERGE.ts;
  const cam = { z: 1.5, x: bw - E.W / 2 + 40, y: 90, r: 0 }, k = clamp((t - tp) / (ti - tp));
  verge(g, t, cam, { planks: 1, lift: 110, gravel: 1, sand: k, fg: false, after: (g, GY) => {
    const tip = ease.inOut(prog(t, tp - 0.2, tp + 0.3)), mx = bw + 330; actor(g, 'MINA', { x: mx, y: VERGE.ty + 20, s: HS, facing: -1, pose: { ...POSES.holdFront, hF: [50, -150], eF: [30, -140] }, expr: 'happy', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0.5), t });
    const bx = mx - 50 * HS * 0.72, by = VERGE.ty + 20 - 150 * HS * 0.72; bucket(g, bx, by + 40, 0.8, -1.6 * tip);
    if (k > 0 && k < 1) { const R = rng(Math.floor(t * 24)); for (let i = 0; i < 40; i++) circle(g, bx - 60 - R() * 30, by + R() * (VERGE.ty - by), 3, '#e8d0a0'); }
  } });
  chip(g, t, { str: 'GRIP', at: tg, x: E.W * 0.5, y: E.H * 0.18 });
} });

// ============================== s109 THE TRUCK CRAWLS OUT / NOT ONE PUMPKIN FALLS ==============================
registerShot('s109', { draw(g, t, info) {
  const st = info.shot.start, tc = shotWord('crawls', st, 0.44), tm = shotWord('mud', st + 0.6, 0.54) + 0.6, tn = shotWord('not', st + 1.6, 0.53) + 1.6, tf = shotWord('falls', st + 2.2, 0.52) + 2.2;
  const cam = camMove(t, info.dur, { z: [0.96, 1.02], x: [-40, 20], drift: 0.2 }), out = ease.inOut(prog(t, tc, tm + 0.4)), teeter = t < tn ? 0 : t < tf ? Math.sin((t - tn) * 14) * 0.5 + 0.5 : Math.max(0, 1 - (t - tf) * 4) * 0.2;
  const shake = out > 0 && out < 1 ? Math.sin(t * 40) * 3 : 0;
  verge(g, t, cam, { planks: 1, gravel: 1, sand: 1, sink: 1 - out, dx: 260 * out + shake, up: 70 * out, wobble: out > 0 && out < 1 ? 1 : 0.3, teeter, after: (g, GY) => {
    const cheer = t > tf;
    hero(g, { x: 620, y: GY + 10, facing: 1, pose: idle(cheer ? POSES.cheer : POSES.relaxed, t, 2), expr: cheer ? 'joy' : 'surprised', blink: blinkFlag(t, 3, 2), look: lookToward(1, -0.2), t });
    actor(g, 'MINA', { x: 380, y: GY, s: HS, facing: 1, pose: idle(cheer ? POSES.cheer : POSES.stand, t, 1), expr: cheer ? 'joy' : 'nervous', blink: blinkFlag(t, 3, 1), look: lookToward(1, -0.2), t });
    actor(g, 'DEV', { x: 170, y: GY, s: HS, facing: 1, pose: idle(POSES.phone, t, 3), expr: cheer ? 'joy' : 'surprised', blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), t });
  } });
} });

// ============================== s110 THE BIGGEST ONE ==============================
registerShot('s110', { draw(g, t, info) {
  const st = info.shot.start, tg = shotWord('gives', st, 0.52), to = shotWord('one', st, 1.42), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-80, -60], drift: 0.2 });
  const P = park(g, t, cam, { season: 'autumn', mood: 'dusk', bench: false, fountain: false }), GY = P.GY;
  layer(g, cam, 1, (g) => {
    truck(g, E.W + 300, GY + 40, 0.8, { t, sink: 0 });
    const dx = 1180, hx = 640, k = ease.inOut(prog(t, tg, to)), onFinger = t > to;
    driver(g, { x: dx, y: GY, facing: -1, pose: k < 1 ? { ...POSES.holdFront, hF: [60, -190], eF: [40, -160] } : idle(POSES.wave, t, 1), expr: 'happy', blink: blinkFlag(t, 3.2, 1), look: lookToward(-1, 0), t });
    const hp = onFinger ? { ...POSES.stand, hF: [36, -250], eF: [30, -200] } : idle({ ...POSES.reach, hF: [70, -170] }, t, 2);
    hero(g, { x: hx, y: GY, facing: 1, pose: hp, expr: onFinger ? 'joy' : 'surprised', blink: blinkFlag(t, 3, 2), look: lookToward(1, -0.4), t });
    const px = onFinger ? hx + 36 * HS : lerp(dx - 60 * HS, hx + 70 * HS, k), py = onFinger ? GY - 250 * HS - 4 : lerp(GY - 190 * HS, GY - 170 * HS, k);
    g.save(); g.translate(px, py); if (onFinger) g.rotate(t * 3); pumpkin(g, 0, 70 * 1.8, 1.8 * (1.6), 7); g.restore();
    actor(g, 'MINA', { x: 360, y: GY, s: HS, facing: 1, pose: idle(POSES.cheer, t, 1), expr: 'delighted', blink: blinkFlag(t, 3, 1), look: lookToward(1, -0.3), t });
  });
  parkFg(g, t, cam, { season: 'autumn' });
} });

// ============================== s111 CARRYING IT HOME ON ONE FINGER ==============================
registerShot('s111', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.02], drift: 0.2 }); cam.x += t * 120;
  const S0 = street(g, t, cam, { power: 1, mood: 'dusk' }), GY = S0.GY;
  layer(g, cam, 1, (g) => {
    const x = 760 + t * 120, hp = { ...walkAlong(x, HS).pose, hF: [36, -250], eF: [30, -200] };
    hero(g, { x, y: GY, facing: 1, pose: hp, expr: 'joy', blink: blinkFlag(t, 3, 2), look: lookToward(1, -0.2), t });
    g.save(); g.translate(x + 36 * HS, GY - 250 * HS - 4); g.rotate(t * 4); pumpkin(g, 0, 70 * 2.9, 2.9, 7); g.restore();
    actor(g, 'MINA', { x: x + 330, y: GY - Math.abs(Math.sin(t * 6)) * 24, s: HS, facing: 1, pose: walkAlong(x + 330, HS, { kid: true }).pose, expr: 'joy', blink: blinkFlag(t, 3, 1), look: lookToward(-1, -0.2), t });
    actor(g, 'DEV', { x: x - 360, y: GY, s: HS, facing: 1, pose: { ...walkAlong(x - 360, HS).pose, hF: POSES.phone.hF, eF: POSES.phone.eF }, expr: 'happy', blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0), t });
  });
  streetFg(g, t, cam);
} });
