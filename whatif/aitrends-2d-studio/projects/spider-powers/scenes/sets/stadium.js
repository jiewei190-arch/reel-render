// sets/stadium.js — athletics stadium (ep 2): high-jump bar at the 2.45 m world record and the pole-vault area with a 6.31 m marker.
// Key light = the floodlight towers (cool white) over a warm late-afternoon sky; the scoreboard and the gold record signs are the accents.
//   const A = stadium(g, t, cam, { mood: 'dusk'|'day'|'night', hjBar: 2.45, barWobble: 0..1, barDrop: 0..1, pvMark: 6.31, pole: 'ground'|'none', board: 'HIGH JUMP  2.45 m', crowd: 0..1, cheer: 0..1 });
//   hjBar / pvMark in metres (real scale: 1 m = 260 units at the character plane, figures at s 1.9 = 1.75 m). barDrop 0..1 knocks the bar off its pegs.
//   stadiumFg(g, t, cam)  blurred hurdle + lane-number block in the near corner (after characters)
// Returns { GY, CX, M, rim, pos: { hjX, barY, barL, matX, pvX, pvBarY, markX, markY, poleX, trackY, boardX, boardY, signX } }
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, blurLayer, text } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const M2U = 260;
export const stadiumGround = () => E.H * V(0.8, 0.68);
const GOLD = '#ffd47e';
function plate(g, x, y, str, sub, s = 1) {   // gold record sign: navy plate, gold border + number
  g.save(); g.translate(x, y); g.scale(s, s); rr(g, -150, -60, 300, 120, 14); g.fillStyle = alpha('#0b1324', 0.94); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 5; g.stroke();
  glow(g, 0, 0, 220, GOLD, 0.16); text(g, str, 0, sub ? -12 : 2, { size: 58, color: GOLD, font: 'Nunito', weight: 900, glow: 14, glowColor: alpha(GOLD, 0.6) }); if (sub) text(g, sub, 0, 36, { size: 22, color: '#e8eef8', font: 'Nunito', weight: 900, spacing: 3 }); g.restore();
}

export function stadium(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = stadiumGround(), CX = E.W / 2, U = M2U, night = o.mood === 'night';
  const hj = (o.hjBar ?? 2.45) * U, pv = (o.pvMark ?? 6.31) * U, drop = clamp(o.barDrop ?? 0), wob = (o.barWobble ?? 0) * Math.sin(t * 30);
  const pos = { hjX: CX - 260, barY: GY - hj, barL: 400, matX: CX - 260, pvX: CX + 1100, pvBarY: GY - pv, markX: CX + 1420, markY: GY - pv, poleX: CX + 420, trackY: GY + 60, boardX: CX + 200, boardY: GY - 980, signX: CX - 700 };
  // sky (0.12)
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky, [-E.W * 2, -E.H * 3, E.W * 5, E.H * 5]); if (night) FX.stars(g, t * 0.3, { area: [-E.W, -E.H * 2, E.W * 3, E.H * 2], count: 180 }); else FX.sun(g, CX + 700, GY - 520, 60, '#fff3dc', M.key, 4); FX.clouds(g, { y: GY - 1300, h: 500, count: 8, color: night ? '#8a96c8' : '#ffe2c8', a: 0.16, seed: 6 }); });
  // the bowl: tiered stands with a colourful crowd, roof canopy, floodlight towers, the big scoreboard (0.3)
  layer(g, cam, 0.3, (g) => {
    const top = GY - 600, bot = GY - 120;
    g.fillStyle = shade(M.wall, -0.45); g.beginPath(); g.moveTo(-E.W * 1.5, bot); g.lineTo(-E.W * 1.5, top); g.quadraticCurveTo(CX, top - 160, E.W * 2.5, top); g.lineTo(E.W * 2.5, bot); g.closePath(); g.fill();
    for (let k = 0; k < 9; k++) seg(g, [[-E.W * 1.5, top + 60 + k * 50], [E.W * 2.5, top + 60 + k * 50]], 4, alpha('#000', 0.3));
    FX.crowd(g, t, { x: -E.W * 1.5, y: top + 70, w: E.W * 4, rows: 9, rowH: 50, size: 1.25, colors: ['#d4262e', '#2f6fd0', '#f2c21a', '#e0e0d0', '#3aa05a', '#9a5ad6', '#e08aa8', '#f08a24'].map(c => shade(c, -0.45)), flags: 0.03, cheer: o.cheer ?? 0.4, wave: (o.cheer ?? 0) > 0.6 ? 1 : 0, seed: 21 });
    g.fillStyle = shade(M.dark, -0.3); g.beginPath(); g.moveTo(-E.W * 1.5, top - 40); g.quadraticCurveTo(CX, top - 260, E.W * 2.5, top - 40); g.lineTo(E.W * 2.5, top - 90); g.quadraticCurveTo(CX, top - 320, -E.W * 1.5, top - 90); g.closePath(); g.fill();   // roof canopy
    for (const lx of [CX - 1300, CX - 300, CX + 900, CX + 1900]) { seg(g, [[lx, bot], [lx, top - 520]], 22, shade(M.dark, -0.2)); rr(g, lx - 110, top - 620, 220, 110, 10); g.fillStyle = '#e8eef8'; g.fill(); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) circle(g, lx - 75 + i * 50, top - 590 + j * 48, 16, '#ffffff'); glow(g, lx, top - 565, 520, '#eef4ff', 0.35); FX.lightCone(g, lx, top - 540, { angle: Math.PI / 2 + (lx < CX ? 0.35 : -0.35), spread: 0.4, len: 1700, color: '#eef4ff', a: 0.06 }); }
    // scoreboard
    const bx = pos.boardX, by = pos.boardY; rr(g, bx - 380, by - 130, 760, 260, 18); g.fillStyle = '#0a0c14'; g.fill(); g.strokeStyle = '#3a4058'; g.lineWidth = 8; g.stroke();
    text(g, o.board || 'HIGH JUMP  WR 2.45 m', bx, by - 40, { size: 56, color: GOLD, font: 'Nunito', weight: 900, glow: 16, glowColor: alpha(GOLD, 0.7), spacing: 3 }); text(g, 'ATTEMPT 1', bx, by + 50, { size: 36, color: '#9fe8ff', font: 'Nunito', weight: 900, spacing: 6 });
    seg(g, [[bx - 200, by + 130], [bx - 200, bot]], 20, shade(M.dark, -0.3)); seg(g, [[bx + 200, by + 130], [bx + 200, bot]], 20, shade(M.dark, -0.3));
    FX.fog(g, bot - 200, 240, M.fog, 0.2);
  });
  // advertising boards + infield back edge + a TV camera on a dolly (0.6)
  layer(g, cam, 0.6, (g) => {
    const y = GY - 150; g.fillStyle = shade(M.grass, -0.3); g.fillRect(-E.W * 1.5, y + 80, E.W * 4.5, 200);
    const ads = [['#2f6fd0', 'SPRING'], ['#d4262e', 'LEAP'], ['#3aa05a', 'BOUNCE'], ['#f2c21a', 'FLY'], ['#9a5ad6', 'JUMP'], ['#e08aa8', 'SOAR']];
    for (let i = 0; i < 14; i++) { const [c, w] = ads[i % ads.length], x = -E.W * 1.2 + i * 380; rr(g, x, y, 360, 80, 6); g.fillStyle = shade(c, -0.2); g.fill(); text(g, w, x + 180, y + 42, { size: 40, color: alpha('#ffffff', 0.85), font: 'Fredoka', weight: 700, spacing: 4 }); }
    const cx2 = CX - 1200; seg(g, [[cx2, y + 80], [cx2, y - 120]], 10, '#20202a'); rr(g, cx2 - 70, y - 190, 140, 80, 10); g.fillStyle = '#2a2a36'; g.fill(); circle(g, cx2 + 80, y - 150, 24, '#101018'); circle(g, cx2 + 84, y - 154, 8, alpha('#7f6aff', 0.6)); glow(g, cx2 - 40, y - 170, 20, '#ff3b30', 0.8);
  });
  // track + infield on the character plane (1)
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 70, 0, GY, [shade(M.grass, -0.15), shade(M.grass, -0.3)]); g.fillRect(-E.W * 1.5, GY - 70, E.W * 4.5, 70);                            // infield grass
    g.fillStyle = linGrad(g, 0, GY, 0, E.H * 1.6, [shade('#c0503a', -0.12), shade('#8a3428', -0.4)]); g.fillRect(-E.W * 1.5, GY, E.W * 4.5, E.H * 1.4);               // red track
    for (let k = 0; k < 6; k++) { g.fillStyle = alpha('#ffffff', 0.55); g.fillRect(-E.W * 1.5, GY + 30 + k * 70 + k * k * 6, E.W * 4.5, 4); }
    for (let i = 0; i < 6; i++) text(g, String(i + 1), CX - 1500, GY + 64 + i * 70 + i * i * 6, { size: 26 + i * 4, color: alpha('#ffffff', 0.6), font: 'Nunito', weight: 900 });
  });
  layer(g, cam, 1, (g) => {
    // HIGH JUMP: landing mat, uprights with pegs, the bar at 2.45 m (wobbles / drops), the gold record sign
    const hx = pos.hjX, bL = pos.barL, by = pos.barY;
    rr(g, hx - 300, GY - 150, 600, 150, 30); g.fillStyle = '#2f6fd0'; g.fill(); rr(g, hx - 300, GY - 150, 600, 40, 30); g.fillStyle = shade('#2f6fd0', 0.2); g.fill(); text(g, 'HIGH JUMP', hx, GY - 70, { size: 34, color: alpha('#ffffff', 0.85), font: 'Fredoka', weight: 700, spacing: 4 });
    for (const sx of [-1, 1]) { const ux = hx + sx * (bL / 2 + 20); rr(g, ux - 9, GY - hj - 160, 18, hj + 160, 6); g.fillStyle = '#e8eef8'; g.fill(); for (let m = 0.5; m <= 3; m += 0.5) seg(g, [[ux - 9, GY - m * U], [ux + 9, GY - m * U]], 3, '#d4262e'); rr(g, ux - 20, GY - 10, 40, 10, 3); g.fillStyle = '#20202a'; g.fill(); }
    const dy = drop * drop * hj * 0.9, rot = drop * 0.5;
    g.save(); g.translate(hx, by + dy + wob * 6); g.rotate(rot); for (let i = 0; i < 10; i++) { rr(g, -bL / 2 + i * bL / 10, -7, bL / 10, 14, 2); g.fillStyle = i % 2 ? '#f2c21a' : '#ffffff'; g.fill(); } g.restore();
    glow(g, hx, by, 200, GOLD, 0.12 * (1 - drop));
    plate(g, pos.signX, GY - 330, '2.45 m', 'WORLD RECORD', 1); seg(g, [[pos.signX, GY - 270], [pos.signX, GY]], 10, '#3a3a48');
    // a tape measure line from the ground to the bar (thin gold dashes)
    g.save(); g.setLineDash([10, 10]); seg(g, [[hx + bL / 2 + 60, GY], [hx + bL / 2 + 60, by]], 3, alpha(GOLD, 0.6)); g.restore();
    // POLE VAULT: runway box, tall uprights + crossbar at the mark, the 6.31 m marker post with metre ticks, the pole lying on the grass
    const px = pos.pvX; poly(g, [[px - 70, GY], [px + 70, GY], [px + 40, GY + 30], [px - 40, GY + 30]], '#2a2a36');
    rr(g, px + 60, GY - 190, 520, 190, 30); g.fillStyle = '#d4262e'; g.fill(); rr(g, px + 60, GY - 190, 520, 40, 30); g.fillStyle = shade('#d4262e', 0.2); g.fill(); text(g, 'POLE VAULT', px + 320, GY - 90, { size: 34, color: alpha('#ffffff', 0.85), font: 'Fredoka', weight: 700, spacing: 4 });
    for (const ux of [px + 90, px + 550]) { rr(g, ux - 11, GY - pv - 120, 22, pv + 120, 6); g.fillStyle = '#e8eef8'; g.fill(); }
    for (let i = 0; i < 10; i++) { rr(g, px + 90 + i * 46, pos.pvBarY - 7, 46, 14, 2); g.fillStyle = i % 2 ? '#2f6fd0' : '#ffffff'; g.fill(); }
    const mx = pos.markX; rr(g, mx - 14, GY - pv - 260, 28, pv + 260, 6); g.fillStyle = '#20202a'; g.fill();
    for (let m = 1; m <= 7; m++) { seg(g, [[mx - 14, GY - m * U], [mx + 40, GY - m * U]], 4, '#e8eef8'); text(g, `${m} m`, mx + 74, GY - m * U, { size: 30, color: alpha('#e8eef8', 0.85), font: 'Nunito', weight: 900 }); }
    seg(g, [[mx - 30, pos.markY], [mx + 60, pos.markY]], 8, GOLD); plate(g, mx + 220, pos.markY, '6.31 m', 'POLE VAULT WR', 0.9);
    if ((o.pole ?? 'ground') === 'ground') { seg(g, [[pos.poleX - 600, GY - 14], [pos.poleX + 600, GY - 34]], 14, '#3a6ad8'); seg(g, [[pos.poleX - 600, GY - 14], [pos.poleX - 520, GY - 16]], 16, '#20202a'); }
    // kit: hurdles, a water cooler, an officials' table with a little flag, a javelin stuck in the grass
    for (const hx2 of [CX - 1300, CX - 1000]) { seg(g, [[hx2 - 70, GY + 40], [hx2 - 70, GY - 70]], 8, '#20202a'); seg(g, [[hx2 + 70, GY + 40], [hx2 + 70, GY - 70]], 8, '#20202a'); rr(g, hx2 - 90, GY - 92, 180, 26, 4); g.fillStyle = '#ffffff'; g.fill(); g.fillStyle = '#20202a'; g.fillRect(hx2 - 30, GY - 92, 30, 26); }
    rr(g, CX + 260, GY - 140, 80, 140, 12); g.fillStyle = '#f08a24'; g.fill(); rr(g, CX + 270, GY - 160, 60, 24, 8); g.fillStyle = '#e8e2d0'; g.fill();
    rr(g, CX - 1650, GY - 150, 300, 20, 4); g.fillStyle = '#e8e2d0'; g.fill(); for (const lx of [-1630, -1370]) seg(g, [[CX + lx, GY - 130], [CX + lx, GY]], 8, '#3a3a48'); seg(g, [[CX - 1400, GY - 150], [CX - 1400, GY - 230]], 3, '#ddd'); g.fillStyle = '#d4262e'; g.fillRect(CX - 1400, GY - 230, 40, 26);
    seg(g, [[CX + 700, GY - 70], [CX + 820, GY - 330]], 6, '#d8d0c0');
  });
  FX.dust(g, t, { count: 22, color: '#eef4ff', a: 0.16, seed: 15 });
  return { GY, CX, M, rim: { color: night ? '#cfe0ff' : M.rim, dir: [-0.6, -0.8] }, pos };
}
export function stadiumFg(g, t, cam) {
  blurLayer(g, 12, (g) => { const GY = stadiumGround(); for (const x of [E.W * 0.04, E.W * 0.22]) seg(g, [[x, GY + 140], [x, GY + 460]], 22, '#16161e'); rr(g, E.W * 0.02, GY + 120, E.W * 0.22, 40, 8); g.fillStyle = '#f4f4f0'; g.fill(); rr(g, E.W * 0.82, GY + 260, 220, 200, 14); g.fillStyle = '#e8e8e0'; g.fill(); text(g, '3', E.W * 0.82 + 110, GY + 360, { size: 150, color: '#20202a', font: 'Nunito', weight: 900 }); }, cam, 1.7);
}
