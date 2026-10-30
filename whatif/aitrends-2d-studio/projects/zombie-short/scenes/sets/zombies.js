// sets/zombies.js — What If SHORT "Zombie Apocalypse With Zero Experience": goofy cartoon zombies + the delivery props (9:16).
// Kid-friendly comedy: no gore, no bites, no weapons. Zombies are slow, green-grey, arms out, droopy eyes, tongue out.
//   zombie(g, x, y, s, { t, variant: 0..5, walk: world x for the shuffle phase (null = standing sway), facing, look: [x, y],
//                        sniff: 0..1, happy: 0..1 (holding fries), tip: 0..1 (holding out a shoe), turn: 0..1 (eyes snap to camera),
//                        rim, seed, groan: 0..1 (mouth open) })   -> { head: [x, y, r], hand: [x, y] }
//       variants: 0 office shirt + tie, 1 tracksuit, 2 chef (toque + apron), 3 granny (cardigan + grey bun + pearls),
//                 4 kid in a cap, 5 delivery uniform (cap + vest)
//   ZOMBIE_VARIANTS[i].name
//   horde(g, t, { x, y, w, rows, n, s, turn: 0..1, sniff: 0..1, happy: 0..1, walk: speed (world units/s, 0 = standing), seed, facing })
//       a crowd of n zombies in depth rows (back rows smaller + hazier); with turn 0 -> 1 all the heads snap to the camera at once
//       (tiny stagger, eyes go wide); returns the list of { x, y, s } for extra gags
//   shoeTip(g, x, y, s, { rot, tag: bool })   a single worn sneaker with a "TIP" tag on the laces (the zombies tip in shoes)
//   scooter(g, x, y, s, { t, facing, speed, rider: 'DEV'|null, box: 'SNACKRUN' })   a delivery scooter with a food box, wheels spin with x
//   takeoutBag(g, x, y, s, { rot, receipt })   fries(g, x, y, s, { rot, aroma: 0..1 })   (aroma = the smell wisps the zombies follow)
//   deliveryPhone(g, x, y, s, { t, state: 'arriving'|'rated'|'order', stars: 0..5, eta, buzz })   a phone running a generic delivery app
//   beanbag(g, x, y, s, { t, tip: 0..1 (pushed over, gently), dir: 1 = pushed from the left, squash: 0..1 })   the beanbag barricade
import { E, S, clamp, lerp, ease, prog, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, text, FONTS, linGrad, radGrad } from '/engine/core.js';
import { POSES, walkPose, blendPose } from '/engine/rig2d.js';
import { actor } from './actors.js';

const SKIN = ['#9ab48a', '#8aa890', '#a8b88a', '#94a89c', '#9cbc8c', '#8eaa86'];
export const ZOMBIE_VARIANTS = [
  { name: 'office', fit: { top: 'tshirt', color: '#d8dce6', legs: '#3a3f50', head: 'none' }, tie: '#a83a3a' },
  { name: 'tracksuit', fit: { top: 'tracksuit', color: '#6a3a8a', color2: '#f2c21a', legs: '#6a3a8a', head: 'none' } },
  { name: 'chef', fit: { top: 'labcoat', legs: '#2c2c34', head: 'none' }, hat: 'toque' },
  { name: 'granny', fit: { top: 'dress', color: '#c88aa8', legs: '#6a5a6a', head: 'none' }, hat: 'bun', pearls: true },
  { name: 'kid', fit: { top: 'tshirt', color: '#3aa05a', legs: '#2a3a5a', head: 'none', kid: true }, hat: 'cap', capColor: '#d4262e' },
  { name: 'delivery', fit: { top: 'tshirt', color: '#e8602a', legs: '#2a2a38', head: 'none' }, hat: 'cap', capColor: '#e8602a', vest: true },
];
const HR = 26;

// shuffle pose: short stiff steps, arms straight out, slight forward hunch, head loll
function zPose(t, o) {
  const s = o.s, f = o.facing ?? 1, kid = !!ZOMBIE_VARIANTS[o.variant % 6].fit.kid, eff = s * (kid ? 0.72 : 1), seed = o.seed ?? 0;
  let p = o.walk != null ? walkPose((o.walk * f) / (60 * eff) * Math.PI * 2) : POSES.stand;
  p = { ...p }; const sway = Math.sin(t * 1.3 + seed) * 4, loll = Math.sin(t * 0.9 + seed * 1.7) * 6;
  p.kF = [p.kF[0] * 0.5, p.kF[1]]; p.kB = [p.kB[0] * 0.5, p.kB[1]]; p.fF = [p.fF[0] * 0.55, p.fF[1]]; p.fB = [p.fB[0] * 0.55, p.fB[1]];   // small stiff steps
  p.sh = [p.sh[0] + 8 + sway * 0.3, p.sh[1] + 4]; p.head = [p.head[0] + 14 + loll * 0.5, p.head[1] + 10 + Math.abs(loll) * 0.4];
  const bob = Math.sin(t * 2.1 + seed) * 4;
  p.eF = [p.sh[0] + 34, p.sh[1] + 6 + bob]; p.hF = [p.sh[0] + 70, p.sh[1] + 4 + bob]; p.eB = [p.sh[0] + 30, p.sh[1] + 10 - bob]; p.hB = [p.sh[0] + 64, p.sh[1] + 10 - bob];   // arms out
  const sn = clamp(o.sniff ?? 0); if (sn > 0) { p.head = [lerp(p.head[0], p.sh[0] + 4, sn), lerp(p.head[1], p.sh[1] - 40, sn)]; p.hF = [lerp(p.hF[0], p.sh[0] + 52, sn), lerp(p.hF[1], p.sh[1] + 30, sn)]; p.hB = [lerp(p.hB[0], p.sh[0] + 46, sn), lerp(p.hB[1], p.sh[1] + 34, sn)]; }
  const hp = clamp(Math.max(o.happy ?? 0, o.tip ?? 0)); if (hp > 0) { p.eF = [lerp(p.eF[0], p.sh[0] + 22, hp), lerp(p.eF[1], p.sh[1] + 34, hp)]; p.hF = [lerp(p.hF[0], p.sh[0] + 44, hp), lerp(p.hF[1], p.sh[1] + 18, hp)]; p.eB = [lerp(p.eB[0], p.sh[0] + 14, hp), lerp(p.eB[1], p.sh[1] + 40, hp)]; p.hB = [lerp(p.hB[0], p.sh[0] + 36, hp), lerp(p.hB[1], p.sh[1] + 26, hp)]; }
  return { pose: p, eff, kid };
}
function zHead(g, hx, hy, r, o, t) {
  const V = ZOMBIE_VARIANTS[o.variant % 6], skin = SKIN[o.variant % 6], f = o.facing ?? 1, sn = clamp(o.sniff ?? 0), hp = clamp(o.happy ?? 0), turn = clamp(o.turn ?? 0), groan = clamp(o.groan ?? (0.4 + 0.3 * Math.sin(t * 1.7 + (o.seed ?? 0))));
  g.save(); g.translate(hx, hy); g.rotate(f * (0.12 + 0.05 * Math.sin(t * 0.9 + (o.seed ?? 0))) - sn * f * 0.3);
  if (V.hat === 'bun') circle(g, -f * r * 0.5, -r * 0.92, r * 0.48, '#c8c8cc');
  circle(g, 0, 0, r * 1.05, skin); circle(g, f * r * 0.35, r * 0.2, r * 0.7, alpha(shade(skin, -0.1), 0.6));
  g.fillStyle = alpha(shade(skin, -0.25), 0.5); g.beginPath(); g.ellipse(-f * r * 0.4, -r * 0.4, r * 0.18, r * 0.1, 0.4, 0, 7); g.fill();       // a mottled spot
  seg(g, [[-f * r * 0.1, -r * 1.0], [f * r * 0.15, -r * 1.25], [f * r * 0.05, -r * 1.4]], r * 0.06, shade(skin, -0.45));                         // a single hair
  // eyes: droopy half-lids, pupils looking; sniff = closed blissful arcs; turn = wide white eyes snapped to the camera
  const lx = (o.look ? o.look[0] : f) * (1 - turn), ly = o.look ? o.look[1] : 0.2, ew = r * (0.26 + 0.12 * turn), eyY = -r * 0.1;
  for (const ex of [r * 0.05, r * 0.55]) { const cx = f * ex;
    if (sn > 0.5 || hp > 0.5) { g.strokeStyle = '#1a1a14'; g.lineWidth = r * 0.09; g.lineCap = 'round'; g.beginPath(); g.arc(cx, eyY + r * 0.06, ew * 0.8, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); continue; }
    circle(g, cx, eyY, ew, '#f2f0d8'); circle(g, cx + lx * ew * 0.4, eyY + ly * ew * 0.3, ew * 0.42, '#1a1a14');
    if (turn < 0.8) { g.fillStyle = shade(skin, -0.2); g.beginPath(); g.arc(cx, eyY, ew + 1, Math.PI, Math.PI * 2); g.fill(); }                   // heavy droopy lid
  }
  // mouth: open groan + tongue out, or a happy grin
  const mx = f * r * 0.3, my = r * 0.5;
  if (hp > 0.5) { g.strokeStyle = '#2a1a14'; g.lineWidth = r * 0.1; g.beginPath(); g.arc(mx, my - r * 0.12, r * 0.3, 0.2, Math.PI - 0.2); g.stroke(); }
  else { g.fillStyle = '#2a1414'; g.beginPath(); g.ellipse(mx, my, r * 0.26, r * (0.08 + 0.16 * groan), 0, 0, 7); g.fill(); g.fillStyle = '#e07a8a'; g.beginPath(); g.ellipse(mx + f * r * 0.08, my + r * (0.12 + 0.14 * groan), r * 0.12, r * 0.16, 0.3 * f, 0, 7); g.fill(); seg(g, [[mx - r * 0.12, my - r * 0.05], [mx - r * 0.12, my + r * 0.04]], r * 0.06, '#f2f0d8'); }
  if (sn > 0.05) for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; g.strokeStyle = alpha('#fff4d0', sn * (1 - u)); g.lineWidth = r * 0.07; g.beginPath(); for (let k = 0; k <= 8; k++) { const px = f * (r * 1.4 + k * r * 0.12) , py = -r * 0.1 - u * r * 1.2 + Math.sin(k * 1.2 + t * 4 + i) * r * 0.1 - i * r * 0.25; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }   // smell wisps
  if (turn > 0.6) { text(g, '!', f * r * 0.9, -r * 1.6, { size: r * 1.1, color: '#fff1dc', font: FONTS.title, weight: 700, alpha: (turn - 0.6) * 2.5, stroke: r * 0.12, strokeColor: '#1a1020' }); }
  // hats
  if (V.hat === 'toque') { rr(g, -r * 0.75, -r * 1.75, r * 1.5, r * 0.9, r * 0.2); g.fillStyle = '#f4f2ec'; g.fill(); for (const dx of [-0.5, 0, 0.5]) circle(g, dx * r, -r * 1.8, r * 0.42, '#f4f2ec'); }
  if (V.hat === 'cap') { g.fillStyle = V.capColor; g.beginPath(); g.ellipse(0, -r * 0.35, r * 1.05, r * 0.8, 0, Math.PI, Math.PI * 2); g.fill(); seg(g, [[f * r * 0.2, -r * 0.38], [f * r * 1.5, -r * 0.3]], r * 0.24, shade(V.capColor, -0.3)); }
  g.restore();
}
export function zombie(g, x, y, s = 1.9, o = {}) {
  const t = o.t ?? 0, v = (o.variant ?? 0) % 6, V = ZOMBIE_VARIANTS[v], f = o.facing ?? 1, Z = zPose(t, { ...o, s, variant: v }), p = Z.pose, eff = Z.eff;
  g.save(); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 2, 44 * eff, 8 * eff, 0, 0, 7); g.fill(); g.restore();
  actor(g, V.fit, { x, y, s, facing: f, pose: p, expr: 'neutral', rim: o.rim, t, shadow: false });
  const W = (q) => [x + q[0] * f * eff, y + q[1] * eff];
  // outfit details on top of the rig
  const [shx, shy] = W(p.sh), [hpx, hpy] = W(p.hip);
  if (V.tie) seg(g, [[shx + f * 3 * eff, shy + 4 * eff], [lerp(shx, hpx, 0.6) + f * 5 * eff, lerp(shy, hpy, 0.6)]], 7 * eff, V.tie);
  if (v === 2) { g.fillStyle = '#e8e6de'; g.beginPath(); g.moveTo(lerp(shx, hpx, 0.4) - 12 * eff, lerp(shy, hpy, 0.4)); g.lineTo(lerp(shx, hpx, 0.4) + 12 * eff, lerp(shy, hpy, 0.4)); g.lineTo(hpx + 16 * eff, hpy + 30 * eff); g.lineTo(hpx - 16 * eff, hpy + 30 * eff); g.closePath(); g.fill(); }   // apron
  if (V.pearls) for (let i = 0; i < 6; i++) circle(g, shx - 8 * eff + i * 4 * eff * f, shy + 2 * eff + Math.sin(i / 5 * Math.PI) * 6 * eff, 2.4 * eff, '#f4f0e6');
  if (V.vest) { g.strokeStyle = '#f2e24a'; g.lineWidth = 3 * eff; g.beginPath(); g.moveTo(shx - 10 * eff, lerp(shy, hpy, 0.5)); g.lineTo(shx + 10 * eff, lerp(shy, hpy, 0.5)); g.stroke(); }
  for (let i = 0; i < 2; i++) { const [ax, ay] = W([lerp(p.sh[0], p.hip[0], 0.3 + i * 0.4) + (i ? 8 : -6), lerp(p.sh[1], p.hip[1], 0.3 + i * 0.4)]); poly(g, [[ax, ay], [ax + 7 * eff, ay + 3 * eff], [ax + 2 * eff, ay + 8 * eff]], alpha('#1a1418', 0.5)); }   // torn patches
  const [hx, hy] = W(p.head), r = HR * eff;
  zHead(g, hx, hy, r, { ...o, variant: v }, t);
  const hand = W(p.hF);
  if ((o.happy ?? 0) > 0.3) fries(g, hand[0] - f * 6 * eff, hand[1] - 8 * eff, 0.5 * eff, { rot: f * 0.1, aroma: 0.6 });
  if ((o.tip ?? 0) > 0.3) shoeTip(g, hand[0] + f * 10 * eff, hand[1] - 4 * eff, 0.55 * eff, { rot: -0.2 * f });
  return { head: [hx, hy, r], hand };
}
export function horde(g, t, o = {}) {
  const n = o.n ?? 40, rows = o.rows ?? 4, x0 = o.x ?? -E.W * 0.1, w = o.w ?? E.W * 1.2, y0 = o.y ?? E.H * 0.62, s0 = o.s ?? 1.6, r = rng(o.seed ?? 21), out = [];
  const per = Math.ceil(n / rows), list = [];
  for (let row = rows - 1; row >= 0; row--) {                                                     // back rows first
    const sc = s0 * (0.55 + 0.45 * (row / Math.max(1, rows - 1))), yy = y0 - (rows - 1 - row) * 70 * s0 / 1.6;
    for (let i = 0; i < per && list.length < n; i++) { const xx = x0 + (i + (row % 2) * 0.5 + (r() - 0.5) * 0.5) / per * w, v = Math.floor(r() * 6), seed = r() * 10, f = o.facing ?? (r() < 0.5 ? 1 : -1), stg = r() * 0.12; list.push({ row, x: xx, y: yy + (r() - 0.5) * 20, s: sc * (0.9 + r() * 0.2), v, seed, f, stg }); }
  }
  for (const z of list) {
    const turn = clamp(((o.turn ?? 0) - z.stg) / 0.5), haze = 1 - z.row / Math.max(1, rows - 1);
    const walkX = o.walk ? z.x + t * o.walk * z.f + z.seed * 50 : null, xx = o.walk ? z.x + t * o.walk * z.f * 0.6 : z.x;
    g.save(); if (haze > 0) g.globalAlpha *= 1 - 0.35 * haze;
    zombie(g, xx, z.y, z.s, { t: t + z.seed, variant: z.v, walk: walkX, facing: z.f, seed: z.seed, sniff: o.sniff, happy: o.happy, turn, look: turn > 0.5 ? [0, 0] : null });
    g.restore(); out.push({ x: xx, y: z.y, s: z.s });
  }
  if (o.haze !== false) { g.fillStyle = linGrad(g, 0, y0 - rows * 80, 0, y0, ['rgba(255,190,140,.18)', 'rgba(255,190,140,0)']); g.fillRect(-E.W, y0 - rows * 90, E.W * 3, rows * 90); }
  return out;
}

// ---------- props ----------
export function shoeTip(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  g.fillStyle = '#e8e4dc'; g.beginPath(); g.moveTo(-70, 10); g.quadraticCurveTo(-74, -40, -30, -44); g.lineTo(10, -40); g.quadraticCurveTo(60, -20, 80, 4); g.lineTo(80, 18); g.lineTo(-70, 18); g.closePath(); g.fill();
  g.fillStyle = '#c8442a'; g.fillRect(-72, 12, 154, 12); g.fillStyle = '#3a6ad8'; g.beginPath(); g.moveTo(-40, -10); g.quadraticCurveTo(0, -30, 40, -2); g.lineTo(30, 6); g.quadraticCurveTo(0, -14, -40, 2); g.fill();   // sole + swoosh-free stripe
  for (let i = 0; i < 4; i++) seg(g, [[-30 + i * 12, -40], [-22 + i * 12, -30]], 3, '#5a5a62');
  if (o.tag !== false) { seg(g, [[-6, -38], [-20, -80]], 2, '#8a7a5a'); rr(g, -60, -116, 80, 40, 6); g.fillStyle = '#f2d84a'; g.fill(); text(g, 'TIP', -20, -95, { size: 28, color: '#2a1a14', font: FONTS.title, weight: 700 }); }
  g.restore();
}
export function fries(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  if ((o.aroma ?? 0) > 0) glow(g, 0, -60, 140, '#ffe08a', 0.25 * o.aroma);
  const cols = ['#f2c84a', '#e8b83a', '#f8d860'];
  for (let i = 0; i < 9; i++) { const fx = -36 + i * 9, h = 60 + ((i * 37) % 5) * 9; g.save(); g.translate(fx, -40); g.rotate((i - 4) * 0.06); rr(g, -5, -h, 10, h, 3); g.fillStyle = cols[i % 3]; g.fill(); g.restore(); }
  g.fillStyle = '#d4262e'; g.beginPath(); g.moveTo(-48, -50); g.lineTo(48, -50); g.lineTo(36, 40); g.lineTo(-36, 40); g.closePath(); g.fill();
  g.fillStyle = '#f2c21a'; g.beginPath(); g.arc(0, -8, 18, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(-44, -48, 10, 84);
  if ((o.aroma ?? 0) > 0) for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; g.strokeStyle = alpha('#fff4d0', o.aroma * (1 - u) * 0.8); g.lineWidth = 4; g.beginPath(); for (let k = 0; k <= 10; k++) { const py = -110 - k * 12 - u * 60, px = -20 + i * 20 + Math.sin(k * 0.8 + t * 3 + i) * 10; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  g.restore();
}
export function takeoutBag(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  g.fillStyle = '#c8a070'; g.beginPath(); g.moveTo(-70, 0); g.lineTo(70, 0); g.lineTo(60, -150); g.lineTo(-60, -150); g.closePath(); g.fill();
  g.fillStyle = shade('#c8a070', -0.15); g.fillRect(-60, -170, 120, 24); for (let i = 0; i < 6; i++) seg(g, [[-60 + i * 24, -170], [-48 + i * 24, -146]], 2, alpha('#6a4a20', 0.4));   // folded top
  circle(g, 0, -80, 34, '#d4262e'); text(g, 'S', 0, -78, { size: 40, color: '#fff', font: FONTS.title, weight: 700 });
  if (o.receipt !== false) { g.save(); g.translate(40, -160); g.rotate(0.3); rr(g, 0, -60, 46, 70, 2); g.fillStyle = '#f8f6f0'; g.fill(); for (let i = 0; i < 5; i++) seg(g, [[6, -50 + i * 12], [38 - (i % 2) * 10, -50 + i * 12]], 2, '#8a8a92'); g.restore(); }
  g.restore();
}
export function scooter(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, f = o.facing ?? 1, R = 34, spin = (x * f) / (R * s), red = '#d4262e';
  g.save(); g.translate(x, y); g.scale(s * f, s);
  for (const wx of [-80, 80]) { circle(g, wx, -R, R, '#1a1a20'); circle(g, wx, -R, R * 0.55, '#8a8a92'); for (let k = 0; k < 4; k++) { const a = spin + k * Math.PI / 2; seg(g, [[wx, -R], [wx + Math.cos(a) * R * 0.5, -R + Math.sin(a) * R * 0.5]], 3, '#5a5a62'); } }
  g.fillStyle = red; g.beginPath(); g.moveTo(-110, -50); g.quadraticCurveTo(-110, -110, -50, -110); g.lineTo(30, -110); g.lineTo(60, -60); g.lineTo(110, -60); g.lineTo(110, -40); g.lineTo(-110, -40); g.closePath(); g.fill();
  seg(g, [[60, -60], [90, -200]], 10, '#2a2a32'); seg(g, [[70, -200], [110, -200]], 10, '#2a2a32'); circle(g, 100, -160, 12, '#fff4c0'); glow(g, 116, -160, 80, '#fff4c0', 0.4);   // handlebar + headlight
  rr(g, -80, -140, 110, 34, 12); g.fillStyle = '#1a1a20'; g.fill();                                                                  // seat
  rr(g, -150, -290, 150, 150, 14); g.fillStyle = '#f2c21a'; g.fill(); g.strokeStyle = shade('#f2c21a', -0.3); g.lineWidth = 4; g.stroke();   // food box
  g.save(); g.scale(f, 1); text(g, o.box || 'SNACKRUN', -75 * f, -225, { size: 24, color: '#2a1a14', font: FONTS.ui, weight: 900 }); g.restore();
  if ((o.speed ?? 0) > 0) for (let i = 0; i < 4; i++) seg(g, [[-160 - i * 30, -60 - i * 18], [-230 - i * 30, -60 - i * 18]], 4, alpha('#ffffff', 0.4));
  g.restore();
  if (o.rider) actor(g, o.rider, { x: x - 20 * s * f, y: y - 60 * s, s: s * 1.0, facing: f, pose: { ...POSES.sit, eF: [40, -150], hF: [70, -160], eB: [36, -146], hB: [66, -156] }, expr: o.expr || 'smile', t });
}
export function deliveryPhone(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, state = o.state || 'arriving', buzz = clamp(o.buzz ?? 0), W = 400, H = 820, jx = buzz * Math.sin(t * 80) * 5;
  g.save(); g.translate(x + jx, y); g.scale(s, s);
  if (buzz > 0.3) for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) seg(g, [[sd * (W / 2 + 22 + i * 14), -50], [sd * (W / 2 + 22 + i * 14), 50]], 5, alpha('#ffffff', 0.6 - i * 0.15));
  rr(g, -W / 2, -H / 2, W, H, 54); g.fillStyle = '#16161c'; g.fill(); rr(g, -W / 2 + 14, -H / 2 + 14, W - 28, H - 28, 42); g.fillStyle = '#f6f4ee'; g.fill();
  const sx = -W / 2 + 14, sy = -H / 2 + 14, sw = W - 28;
  g.save(); rr(g, sx, sy, sw, H - 28, 42); g.clip();
  g.fillStyle = '#e8602a'; g.fillRect(sx, sy, sw, 150); text(g, 'SNACKRUN', 0, sy + 90, { size: 44, color: '#fff', font: FONTS.title, weight: 700, spacing: 2 });
  if (state === 'arriving' || state === 'order') {
    g.fillStyle = '#d8e4d0'; g.fillRect(sx, sy + 150, sw, 330); for (let i = 0; i < 6; i++) seg(g, [[sx, sy + 190 + i * 55], [sx + sw, sy + 170 + i * 60]], 10, '#f4f4ee');   // map
    const k = (t * 0.2) % 1, px = lerp(sx + 40, sx + sw - 60, k); circle(g, px, sy + 330 - Math.sin(k * 3) * 40, 16, '#e8602a'); circle(g, sx + sw - 50, sy + 230, 14, '#2a2a32');
    text(g, state === 'order' ? 'ORDER PLACED' : 'ORDER ARRIVING', 0, sy + 540, { size: 34, color: '#2a2a32', font: FONTS.ui, weight: 900 });
    text(g, o.eta || 'Ordered: Tuesday', 0, sy + 590, { size: 24, color: '#7a7a82', font: FONTS.ui, weight: 800 });
  } else {
    text(g, 'RATE YOUR DRIVER', 0, sy + 240, { size: 30, color: '#2a2a32', font: FONTS.ui, weight: 900 });
    circle(g, 0, sy + 360, 70, '#9ab48a'); circle(g, -20, sy + 350, 10, '#f2f0d8'); circle(g, 22, sy + 350, 10, '#f2f0d8'); g.strokeStyle = '#2a1a14'; g.lineWidth = 5; g.beginPath(); g.arc(0, sy + 375, 22, 0.3, Math.PI - 0.3); g.stroke();   // the driver
  }
  const n = o.stars ?? 0; for (let i = 0; i < 5; i++) { const cx = -120 + i * 60, cy = sy + (state === 'rated' ? 500 : 660), on = n > i; poly(g, Array.from({ length: 10 }, (_, j) => { const r2 = j % 2 ? 11 : 26, a = j / 10 * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * r2, cy + Math.sin(a) * r2]; }), on ? '#f2c21a' : '#d0d0d4'); }
  g.restore(); rr(g, -56, -H / 2 + 24, 112, 24, 12); g.fillStyle = '#000'; g.fill();
  g.restore();
}
export function beanbag(g, x, y, s = 1, o = {}) {
  const tip = ease.inOut(clamp(o.tip ?? 0)), sq = clamp(o.squash ?? 0), t = o.t ?? 0, wob = Math.sin(t * 3) * 0.02;
  const dir = o.dir ?? 1; g.save(); g.translate(x + dir * 160 * s, y); g.rotate(dir * tip * 1.45 + wob); g.translate(-dir * 160 * s, 0); g.scale(s * (1 + 0.15 * sq), s * (1 - 0.2 * sq));   // tips over its far bottom edge
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 170, 22, 0, 0, 7); g.fill();
  g.fillStyle = '#7a4aa8'; g.beginPath(); g.moveTo(-160, 0); g.quadraticCurveTo(-190, -160, -60, -260); g.quadraticCurveTo(10, -300, 70, -250); g.quadraticCurveTo(190, -150, 160, 0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.ellipse(-60, -180, 50, 80, -0.3, 0, 7); g.fill();
  g.strokeStyle = shade('#7a4aa8', -0.3); g.lineWidth = 4; g.beginPath(); g.moveTo(-20, -280); g.quadraticCurveTo(-30, -140, 0, 0); g.stroke();
  g.restore();
}
