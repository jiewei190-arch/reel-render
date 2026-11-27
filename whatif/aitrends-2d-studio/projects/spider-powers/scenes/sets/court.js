// sets/court.js — outdoor basketball court at golden hour (ep 2). Key light = the low sun behind the city (warm), plus two court floodlights.
//   const C = court(g, t, cam, { mood: 'dusk'|'day'|'night', hoopFt: 10..12, swish: 0..1, wobble: 0..1, crowd: 0..1, lights: 0..1, crank: 0..1 });   // draw BEFORE characters
//   hoopFt: rim height in feet (10 = regulation, 12 = Dev cranked it). The pole telescopes to match, the crank box on the pole turns with `crank`.
//   swish: net bulge 0..1 (set to a 0->1->0 pulse when the ball goes through); wobble: rim/backboard shake amplitude (decays in your shot).
//   crowd: phone-holding onlookers behind the fence (0 = empty court). lights: floodlights on (auto on at night).
//   courtFg(g, t, cam)  blurred fence post + a ball in the near corner (after characters)
// Scale: figures at s 1.9 stand 456 units = 1.75 m, so 1 m = 260 units (export M2U). Heights here are real: 10 ft rim = 3.05 m = 793 units above GY.
// Returns { GY, CX, M, rim, pos: { hoopX, rimX, rimY, boardY, poleX, crankX, crankY, benchX, benchTop, ballX, fenceTop, lampXs[] } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, blurLayer, text } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor } from './actors.js';

export const M2U = 260;
export const courtGround = () => E.H * V(0.8, 0.68);
const FT = 0.3048;

// a little onlooker behind the fence holding up a glowing phone (signature colours, no cast colours)
function onlooker(g, t, x, y, s, col, head, seed, M) {
  const ph = Math.sin(t * 1.3 + seed) * 4, pose = { head: [4, -208 + ph * 0.3], sh: [1, -174], hip: [0, -100], eF: [22, -150], hF: [30, -196 + ph], eB: [-8, -136], hB: [-10, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] };
  actor(g, { top: 'hoodie', color: col, legs: shade(col, -0.6), head, headColor: shade(col, 0.3) }, { x, y, s, facing: seed % 2 ? 1 : -1, pose, expr: 'surprised', rim: { color: M.rim, dir: [-0.8, -0.5] }, t, blink: ((t + seed) % 3.3) > 3.15 });
  const hx = x + (seed % 2 ? 1 : -1) * 30 * s, hy = y - 200 * s; rr(g, hx - 6 * s, hy - 10 * s, 12 * s, 20 * s, 2 * s); g.fillStyle = '#0c0c12'; g.fill(); glow(g, hx, hy, 40 * s, '#cfe8ff', 0.45);
}

export function court(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = courtGround(), CX = E.W / 2, U = M2U, night = (o.mood === 'night'), L = clamp(o.lights ?? (night ? 1 : 0.35));
  const hoopFt = clamp(o.hoopFt ?? 10, 8, 14), rimH = hoopFt * FT * U, wob = (o.wobble ?? 0) * Math.sin(t * 38), sw = clamp(o.swish ?? 0);
  const pos = { poleX: CX + 760, hoopX: CX + 560, rimX: CX + 470, rimY: GY - rimH, boardY: GY - rimH - 90, crankX: CX + 760, crankY: GY - 360, benchX: CX - 620, benchTop: GY - 110, ballX: CX - 300, fenceTop: GY - 620, lampXs: [CX - 1150, CX + 1350] };
  const sunX = CX - 320, sunY = GY - 420;
  // sky, sun, clouds (0.12)
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky, [-E.W, -E.H * 2, E.W * 3, E.H * 4]);
    if (!night) { FX.sun(g, sunX, sunY, 70, '#fff3dc', M.key, 5); FX.godRays(g, sunX, sunY, { count: 9, angle: Math.PI / 2 + 0.2, spread: 2.4, len: 1600, color: M.key, a: 0.05, t }); }
    else { FX.stars(g, t * 0.3, { area: [-E.W, -E.H, E.W * 3, E.H * 1.4], count: 160 }); FX.moon(g, CX + 600, GY - 700, 46); }
    FX.clouds(g, { y: GY - 900, h: 300, count: 7, color: night ? '#8a96c8' : '#ffe2c8', a: 0.18, seed: 4 });
  });
  // far city + trees (0.3) with warm windows
  layer(g, cam, 0.3, (g) => {
    FX.skyline(g, { x: -E.W, y: GY - 150, w: E.W * 3, minH: 120, maxH: 420, color: mix(M.sky[1], '#120c18', 0.72), windowColor: alpha(M.practical, 0.6), lit: night ? 0.3 : 0.1, seed: 31 });
    for (let i = 0; i < 26; i++) FX.tree(g, -E.W + i * 230, GY - 130, 1.3 + (i % 3) * 0.2, mix(M.grass, '#0c0a12', 0.6));
    FX.fog(g, GY - 260, 240, M.fog, 0.22);
  });
  // chain-link fence with a graffiti wall section, light poles, onlookers behind the mesh (0.6)
  layer(g, cam, 0.6, (g) => {
    const top = pos.fenceTop, bot = GY - 40, r = rng(9);
    rr(g, CX - 1500, top + 150, 900, bot - top - 150, 6); g.fillStyle = shade(M.wall, -0.25); g.fill();                                    // painted wall
    ['#d4262e', '#2f6fd0', '#f2c21a', '#3aa05a'].forEach((c, i) => { g.fillStyle = alpha(shade(c, -0.25), 0.75); g.beginPath(); g.ellipse(CX - 1350 + i * 200, top + 360 + (i % 2) * 40, 120, 70, 0.2 * i, 0, Math.PI * 2); g.fill(); });
    text(g, 'HOOPS', CX - 1050, top + 330, { size: 110, color: alpha('#fff3dc', 0.75), weight: 700, stroke: 10, strokeColor: alpha('#1a1420', 0.8) });
    if ((o.crowd ?? 1) > 0) { const cols = ['#d4262e', '#2f6fd0', '#9a5ad6', '#3aa05a', '#e08aa8', '#e0e0d0'], heads = ['none', 'cap', 'bun', 'beanie', 'ponytail', 'none'];
      for (let i = 0; i < Math.round(9 * (o.crowd ?? 1)); i++) onlooker(g, t, CX - 520 + i * 210 + (i % 2) * 40, bot - 30 - (i % 2) * 14, 0.72, cols[i % 6], heads[i % 6], i + 1, M); }
    g.strokeStyle = alpha('#c8c8d8', 0.22); g.lineWidth = 2;                                                                                  // diamond mesh
    for (let x = -E.W; x < E.W * 2.4; x += 34) { g.beginPath(); g.moveTo(x, top); g.lineTo(x + (bot - top), bot); g.moveTo(x, top); g.lineTo(x - (bot - top), bot); g.stroke(); }
    for (let x = -E.W; x < E.W * 2.4; x += 420) { seg(g, [[x, top - 20], [x, bot + 40]], 10, shade(M.dark, -0.2)); circle(g, x, top - 22, 8, shade(M.dark, 0.2)); }
    seg(g, [[-E.W, top], [E.W * 2.4, top]], 6, shade(M.dark, -0.1));
    pos.lampXs.forEach((lx) => { seg(g, [[lx, bot + 40], [lx, top - 520]], 14, shade(M.dark, -0.3)); rr(g, lx - 90, top - 560, 180, 60, 10); g.fillStyle = mix('#2a2632', '#fff6dc', L); g.fill(); if (L > 0.05) { glow(g, lx, top - 530, 420, '#fff2d6', 0.4 * L); FX.lightCone(g, lx, top - 520, { angle: Math.PI / 2 + (lx < CX ? -0.25 : 0.25), spread: 0.55, len: 1300, color: '#fff2d6', a: 0.08 * L }); } });
  });
  // court floor: asphalt with painted lines, the key in green, a centre circle edge, sun-warmed sheen (0.9 -> 1)
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 400, [shade(M.floor, 0.05), shade(M.floor, -0.35)]); g.fillRect(-E.W, GY - 40, E.W * 3.4, E.H);
    g.fillStyle = alpha(shade('#3a8a5a', -0.3), 0.65); g.fillRect(CX + 80, GY - 40, 900, 40); g.fillStyle = alpha('#fff3dc', 0.55); g.fillRect(-E.W, GY - 42, E.W * 3.4, 4); g.fillRect(CX + 80, GY - 40, 6, 40);
    g.strokeStyle = alpha('#fff3dc', 0.4); g.lineWidth = 4; g.beginPath(); g.ellipse(CX - 760, GY - 20, 260, 18, 0, 0, Math.PI * 2); g.stroke();
    if (!night) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, sunX - 600, 0, sunX + 600, 0, [alpha(M.key, 0), alpha(M.key, 0.12), alpha(M.key, 0)]); g.fillRect(sunX - 600, GY - 40, 1200, 300); g.restore(); }
  });
  // props on the character plane: bench + gym bag + water bottle + towel, ball rack, cones, bin, scoreboard sign, the hoop
  layer(g, cam, 1, (g) => {
    const bx = pos.benchX; rr(g, bx - 210, GY - 110, 420, 22, 6); g.fillStyle = '#7a5032'; g.fill(); rr(g, bx - 210, GY - 170, 420, 18, 6); g.fill(); for (const lx of [-180, 180]) seg(g, [[bx + lx, GY - 90], [bx + lx, GY]], 10, '#2a2230');
    rr(g, bx + 40, GY - 160, 130, 54, 18); g.fillStyle = '#2f6fd0'; g.fill(); seg(g, [[bx + 60, GY - 160], [bx + 105, GY - 190], [bx + 150, GY - 160]], 6, '#1a2a50');   // gym bag
    rr(g, bx - 150, GY - 168, 26, 58, 8); g.fillStyle = alpha('#9fd8ff', 0.75); g.fill(); rr(g, bx - 146, GY - 180, 18, 14, 3); g.fillStyle = '#2a2230'; g.fill();          // water bottle
    g.fillStyle = '#e8e2d0'; g.beginPath(); g.moveTo(bx - 90, GY - 112); g.lineTo(bx - 20, GY - 112); g.lineTo(bx - 30, GY - 60); g.lineTo(bx - 80, GY - 70); g.closePath(); g.fill();   // towel over the bench
    const rx = CX - 1050; seg(g, [[rx - 100, GY], [rx - 100, GY - 160]], 8, '#3a3440'); seg(g, [[rx + 100, GY], [rx + 100, GY - 160]], 8, '#3a3440'); seg(g, [[rx - 110, GY - 80], [rx + 110, GY - 80]], 6, '#3a3440'); seg(g, [[rx - 110, GY - 160], [rx + 110, GY - 160]], 6, '#3a3440');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) basketball(g, rx - 64 + i * 64, GY - 112 - j * 80, 30, 0.3 * i);
    for (const [cx2, c] of [[CX - 140, '#f08a24'], [CX + 40, '#f08a24']]) poly(g, [[cx2 - 24, GY], [cx2 + 24, GY], [cx2 + 6, GY - 62], [cx2 - 6, GY - 62]], c);
    rr(g, CX + 1180, GY - 120, 70, 120, 10); g.fillStyle = shade('#3a7a5a', -0.4); g.fill();                                                    // bin
    basketball(g, pos.ballX, GY - 30, 30, t * 0.2);
    // the hoop: telescoping pole, crank box, arm, backboard with a square, orange rim, net (bulges with swish)
    const px = pos.poleX, py = pos.boardY + 40, w2 = wob * 8;
    seg(g, [[px, GY], [px, GY - 520]], 26, shade('#3a3a48', 0.1)); seg(g, [[px, GY - 520], [px, py + 60]], 18, shade('#5a5a6a', 0.1)); rr(g, px - 60, GY - 24, 120, 24, 6); g.fillStyle = '#20202a'; g.fill();
    rr(g, px - 30, pos.crankY - 40, 60, 80, 8); g.fillStyle = '#2a2a38'; g.fill(); const ca = (o.crank ?? 0) * Math.PI * 8; seg(g, [[px + 30, pos.crankY], [px + 30 + Math.cos(ca) * 36, pos.crankY + Math.sin(ca) * 36]], 7, '#c8c8d0'); circle(g, px + 30 + Math.cos(ca) * 36, pos.crankY + Math.sin(ca) * 36, 9, '#d4262e');
    seg(g, [[px, py + 60], [pos.hoopX + 60, py + 60]], 14, '#4a4a58');
    g.save(); g.translate(pos.hoopX + 40, py); g.rotate(w2 * 0.004);
    rr(g, -14, -130, 28, 240, 6); g.fillStyle = alpha('#e8eef8', 0.85); g.fill(); g.strokeStyle = '#d4262e'; g.lineWidth = 6; g.strokeRect(-14, 10, 28, 60); g.restore();   // backboard, side-on
    const rx2 = pos.rimX, ry2 = pos.rimY + w2; g.strokeStyle = '#ff6a1a'; g.lineWidth = 9; g.beginPath(); g.ellipse(rx2, ry2, 76, 14, 0, 0, Math.PI * 2); g.stroke(); seg(g, [[rx2 + 76, ry2], [pos.hoopX + 26, ry2]], 8, '#ff6a1a');
    const bulge = Math.sin(sw * Math.PI) * 24, nb = 100 + sw * 30; g.strokeStyle = alpha('#f4f2ec', 0.85); g.lineWidth = 3;
    for (let i = 0; i <= 8; i++) { const u = i / 8, xa = rx2 - 76 + u * 152, xb = rx2 - 44 + u * 88 + Math.sin(t * 3 + i) * 2; g.beginPath(); g.moveTo(xa, ry2 + 4); g.quadraticCurveTo((xa + xb) / 2 + (u - 0.5) * bulge, ry2 + nb * 0.6, xb, ry2 + nb); g.stroke(); }
    for (let j = 1; j <= 3; j++) { const v = j / 3.5; g.beginPath(); g.ellipse(rx2, ry2 + nb * v, 76 - 32 * v + bulge * 0.3, 10, 0, 0, Math.PI * 2); g.stroke(); }
    glow(g, rx2, ry2, 120, '#ffb070', 0.15);
    // a sign with the hoop height (gold) on the pole
    rr(g, px + 20, GY - 300, 130, 56, 10); g.fillStyle = alpha('#0b1324', 0.9); g.fill(); g.strokeStyle = alpha('#ffd47e', 0.8); g.lineWidth = 3; g.stroke(); text(g, `${Math.round(hoopFt)} FT`, px + 85, GY - 272, { size: 30, color: '#ffd47e', font: 'Nunito', weight: 900 });
  });
  FX.dust(g, t, { count: 22, color: M.key, a: 0.18, seed: 13 });
  return { GY, CX, M, rim: { color: M.rim, dir: [-0.9, -0.4] }, pos };
}
export function basketball(g, x, y, r, rot = 0) {
  circle(g, x, y, r, '#e0702a'); g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = '#3a1a0a'; g.lineWidth = r * 0.08;
  g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.moveTo(0, -r); g.lineTo(0, r); g.stroke(); g.beginPath(); g.arc(-r * 1.25, 0, r * 0.95, -0.9, 0.9); g.stroke(); g.beginPath(); g.arc(r * 1.25, 0, r * 0.95, Math.PI - 0.9, Math.PI + 0.9); g.stroke(); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; circle(g, x - r * 0.35, y - r * 0.35, r * 0.35, alpha('#ffd0a0', 0.25)); g.restore();
}
export function courtFg(g, t, cam) {
  blurLayer(g, 12, (g) => { const GY = courtGround(); seg(g, [[E.W * 0.05, -40], [E.W * 0.05, E.H + 40]], 46, '#1a1622'); g.strokeStyle = alpha('#c8c8d8', 0.35); g.lineWidth = 4; for (let y = -40; y < E.H; y += 70) { g.beginPath(); g.moveTo(E.W * 0.05, y); g.lineTo(E.W * 0.05 + 140, y + 140); g.stroke(); } basketball(g, E.W * 0.9, GY + 210, 120, 0.4); }, cam, 1.7);
}
