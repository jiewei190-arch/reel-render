// sets/lab.js — Dr Lin's lab, with a BLUEPRINT WALL (navy grid panel, light-blue line art, gold labels) behind the action.
//   const L = lab(g, t, cam, { lights: 1..0, wall: (g, x, y, w, h) => {...optional extra drawing on the wall panel...}, wallT: seconds for the wall's draw-on })
//   lights: 1 = ceiling strips on (cool white), 0 = lights killed (only the monitor + the wall glow + a green exit light)
//   Returns { GY, CX, M, rim, pos: { wallX, wallY, wallW, wallH, benchX, benchTop, tripodX, monitorX, doorX } }
//   labFg(g, t, cam): blurred bench glassware in front.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix, rng, clamp, blurLayer, text, FONTS, ease, prog } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const labGround = () => E.H * V(0.8, 0.68);

export function lab(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = labGround(), CX = E.W / 2, L = clamp(o.lights ?? 1), ui = S().ui;
  const pos = { wallX: CX - 520, wallY: GY - 780, wallW: 1040, wallH: 560, benchX: CX + 860, benchTop: GY - 250, tripodX: CX + 520, monitorX: CX + 960, doorX: CX - 1120 };
  layer(g, cam, 0.55, (g) => {
    const wall = mix(shade(M.wall, -0.6), shade(M.wall, -0.1), L);
    g.fillStyle = linGrad(g, 0, GY - 1000, 0, GY, [shade(wall, 0.05), wall, shade(wall, -0.4)]); g.fillRect(-E.W, GY - 1000, E.W * 3.4, 1006);
    for (let x = -E.W; x < E.W * 2.4; x += 160) seg(g, [[x, GY - 1000], [x, GY]], 2, alpha('#000', 0.18));                             // wall panels
    g.fillStyle = shade(wall, -0.5); g.fillRect(-E.W, GY - 14, E.W * 3.4, 16);
    // ceiling strip lights
    for (let i = -3; i <= 4; i++) { const x = CX + i * 420; rr(g, x - 130, GY - 960, 260, 14, 6); g.fillStyle = mix('#161a2a', '#e6f0ff', L); g.fill(); if (L > 0.05) glow(g, x, GY - 940, 330, '#cfe0ff', 0.2 * L); }
    // blueprint wall panel
    const { wallX: x, wallY: y, wallW: w, wallH: h } = pos, wt = o.wallT ?? 99;
    rr(g, x - 18, y - 18, w + 36, h + 36, 12); g.fillStyle = '#05080f'; g.fill();
    g.fillStyle = ui.bpBg; g.fillRect(x, y, w, h);
    g.strokeStyle = alpha(ui.blueprint, 0.1); g.lineWidth = 1; for (let gx = x; gx <= x + w; gx += 40) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); } for (let gy = y; gy <= y + h; gy += 40) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    // default wall art: body outline with heat bands + an eye + an IR wave, labels in gold
    const a = ease.out(prog(wt, 0, 1.6)), bc = ui.blueprint;
    seg(g, [[x + 190, y + 130], [x + 190, y + 330]], 5, alpha(bc, a)); circle(g, x + 190, y + 96, 34 * a, 'rgba(0,0,0,0)'); ring(g, x + 190, y + 96, 34, 4, alpha(bc, a));
    seg(g, [[x + 190, y + 190], [x + 130, y + 270]], 5, alpha(bc, a)); seg(g, [[x + 190, y + 190], [x + 250, y + 270]], 5, alpha(bc, a)); seg(g, [[x + 190, y + 330], [x + 150, y + 470]], 5, alpha(bc, a)); seg(g, [[x + 190, y + 330], [x + 232, y + 470]], 5, alpha(bc, a));
    g.strokeStyle = alpha(ui.gold, 0.8 * a); g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 80; i++) { const px = x + 380 + i * 7, py = y + 280 - Math.sin(i * 0.5) * 60 * Math.exp(-((i - 40) ** 2) / 900); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    ring(g, x + 800, y + 190, 80, 4, alpha(bc, a)); ring(g, x + 800, y + 190, 36, 3, alpha(bc, a)); seg(g, [[x + 700, y + 190], [x + 900, y + 190]], 2, alpha(bc, 0.5 * a));
    text(g, 'LWIR 8-14 um', x + 380, y + 360, { size: 26, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', alpha: a, spacing: 2 });
    text(g, 'T = 34 C', x + 190, y + 520, { size: 26, color: ui.gold, font: FONTS.ui, weight: 900, alpha: a, spacing: 2 });
    text(g, 'RETINA', x + 800, y + 310, { size: 24, color: ui.gold, font: FONTS.ui, weight: 900, alpha: a, spacing: 2 });
    o.wall?.(g, x, y, w, h, wt); g.restore();
    glow(g, x + w / 2, y + h / 2, 640, ui.blueprint, 0.1 + 0.06 * (1 - L));
    // door + exit light (stays on in a blackout)
    const dx = pos.doorX; rr(g, dx, GY - 460, 170, 460, 6); g.fillStyle = shade(M.wall, -0.7); g.fill(); rr(g, dx + 30, GY - 560, 110, 36, 6); g.fillStyle = '#04140a'; g.fill();
    text(g, 'EXIT', dx + 85, GY - 542, { size: 22, color: '#3dff7a', font: FONTS.ui, weight: 900, glow: 16, glowColor: 'rgba(60,255,120,.8)', spacing: 2 });
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 380, [mix(shade(M.floor, -0.4), shade(M.floor, 0.05), L), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3.4, E.H * 2);
    for (let x = -E.W; x < E.W * 2.4; x += 180) seg(g, [[x, GY], [x - 90, GY + 400]], 1.5, alpha('#000', 0.22));
    FX.pool(g, CX, GY + 30, 700, 70, '#cfe0ff', 0.22 * L);
  });
  layer(g, cam, 1, (g) => {
    // bench with glassware + monitor + thermal camera on a tripod
    const bx = pos.benchX; g.fillStyle = shade('#4a5068', -0.55); g.fillRect(bx - 420, pos.benchTop, 840, 18); g.fillStyle = shade('#2a2e44', -0.35); g.fillRect(bx - 410, pos.benchTop + 18, 820, 232);
    for (let i = 1; i < 4; i++) seg(g, [[bx - 410 + i * 205, pos.benchTop + 28], [bx - 410 + i * 205, GY - 6]], 2, alpha('#000', 0.4));
    const mx = pos.monitorX - 120; rr(g, mx - 150, pos.benchTop - 220, 300, 190, 10); g.fillStyle = '#05060c'; g.fill();
    const mg = g.createLinearGradient(mx, pos.benchTop - 210, mx, pos.benchTop - 40); [[0, '#1a0030'], [0.4, '#b01a50'], [0.7, '#ff8a10'], [1, '#ffe860']].forEach(([p, c]) => mg.addColorStop(p, c)); g.fillStyle = mg; g.fillRect(mx - 140, pos.benchTop - 210, 280, 170);   // monitor shows a thermal gradient
    glow(g, mx, pos.benchTop - 120, 360, '#ff7a30', 0.2); seg(g, [[mx, pos.benchTop - 30], [mx, pos.benchTop]], 10, '#0a0a12');
    for (const [fx, c] of [[-340, '#7fd0d6'], [-290, '#e08a3a'], [-240, '#9a5ad6']]) { rr(g, bx + fx, pos.benchTop - 80, 34, 80, 8); g.fillStyle = alpha(c, 0.55); g.fill(); g.fillStyle = alpha('#fff', 0.2); g.fillRect(bx + fx + 6, pos.benchTop - 76, 5, 60); }
    const tx = pos.tripodX; seg(g, [[tx, GY - 230], [tx - 56, GY]], 6, '#14141c'); seg(g, [[tx, GY - 230], [tx + 56, GY]], 6, '#14141c'); seg(g, [[tx, GY - 230], [tx, GY]], 6, '#14141c');
    rr(g, tx - 54, GY - 300, 108, 70, 10); g.fillStyle = '#1c1e2c'; g.fill(); circle(g, tx - 54, GY - 266, 22, '#0a0a12'); circle(g, tx - 54, GY - 266, 11, '#3a2a6a'); glow(g, tx - 54, GY - 266, 50, '#9a7aff', 0.4);
    if (L < 0.5) { circle(g, tx + 30, GY - 282, 4, '#ff3b30'); }
  });
  const rim = { color: L > 0.3 ? M.rim : mix(M.rim, ui.blueprint, 0.6), dir: [0.2, -1] };
  return { GY, CX, M, rim, pos, L };
}
export function labFg(g, t, cam) {
  const GY = labGround(), CX = E.W / 2;
  blurLayer(g, 12, (g) => { for (const [x, c] of [[-860, '#7fd0d6'], [-720, '#e08a3a']]) { rr(g, CX + x, GY + 120, 100, 340, 28); g.fillStyle = alpha(shade(c, -0.6), 0.9); g.fill(); } }, cam, 1.7);
}
