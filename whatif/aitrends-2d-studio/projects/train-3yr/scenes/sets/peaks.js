// sets/peaks.js — above the clouds: a sea of cloud tops, the Himalaya, and EVEREST with its summit flags (8,849 m).
//   const P = peaks(g, t, cam, { mood: 'golden', label: 0..1, wind: 1, sea: true })   // draw BEFORE characters
//   The hero floats in front (depth 1); Everest stands at depth 0.6. P.pos.summitScreen(cam) gives the summit's screen point so a shot can
//   place the hero "beside the summit flag" or stall him just below it (a meter at 8,192 vs the label at 8,849).
//   cloudLayer(g, t, cam, { y, burst: 0..1, burstX, crystals: 0..1 })   a dense cloud deck the hero bursts THROUGH (call after the hero for the
//   "punching up through" frame, or before for "coming down onto it"); crystals sparkle as ice. Works on any set (sky.js too).
//   peaksFg(g, t, cam)   blurred cloud wisps racing past the lens (after characters)
// Returns { GY, CX, M, rim, pos: { summitX, summitY, flagX, flagY, seaY, summitScreen(cam) } }
import { E, V, mood, layer, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, lerp, blurLayer, text, FONTS, noise } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const peaksGround = () => E.H * V(0.86, 0.74);           // the cloud-sea surface the hero can "land" on visually

// one jagged ridge silhouette with snow caps and a lit face
function ridge(g, y, amp, seed, col, snow, lit, x0 = -E.W * 1.5, x1 = E.W * 3) {
  const pts = []; for (let x = x0; x <= x1; x += 26) pts.push([x, y - (Math.abs(noise(x * 0.0021, seed)) * 0.7 + noise(x * 0.009, seed + 3) * 0.18 + 0.3) * amp]);
  g.fillStyle = col; g.beginPath(); g.moveTo(x0, y + 400); pts.forEach(([x, py]) => g.lineTo(x, py)); g.lineTo(x1, y + 400); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(x0, y + 400); pts.forEach(([x, py]) => g.lineTo(x, py)); g.lineTo(x1, y + 400); g.closePath(); g.clip();
  for (let i = 1; i < pts.length; i++) { const [xa, ya] = pts[i - 1], [xb, yb] = pts[i]; if (Math.min(ya, yb) < y - amp * 0.62) { g.fillStyle = alpha(snow, 0.85); g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.lineTo(xb, yb + amp * 0.12); g.lineTo(xa, ya + amp * 0.16); g.closePath(); g.fill(); }
    if (yb < ya) { g.fillStyle = alpha(lit, 0.16); g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.lineTo(xb, y + 400); g.lineTo(xa, y + 400); g.closePath(); g.fill(); } }
  g.restore();
}
// rolling cloud tops: overlapping puffs, bright tops, violet bellies
function cloudSea(g, t, y, seed, top, belly, a = 1, speed = 8) {
  const r = rng(seed); g.save(); g.globalAlpha *= a;
  g.fillStyle = linGrad(g, 0, y - 20, 0, y + 400, [belly, shade(belly, -0.3)]); g.fillRect(-E.W * 2, y + 30, E.W * 5, E.H * 1.5);
  for (let i = 0; i < 46; i++) { const x = -E.W * 1.2 + i * 130 + ((t * speed) % 130) + r() * 50, rr2 = 90 + r() * 90, yy = y + r() * 50;
    g.fillStyle = belly; g.beginPath(); g.arc(x, yy + 20, rr2, Math.PI, 0); g.fill(); g.fillStyle = alpha(top, 0.9); g.beginPath(); g.arc(x - rr2 * 0.12, yy + 4, rr2 * 0.82, Math.PI * 1.05, Math.PI * 1.75); g.lineTo(x, yy + 10); g.fill(); }
  g.restore();
}

export function peaks(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = peaksGround(), CX = E.W / 2, wind = o.wind ?? 1;
  const summitX = CX + 180, summitY = GY - 640, flagX = summitX + 10, flagY = summitY - 6, seaY = GY - 30;
  const pos = { summitX, summitY, flagX, flagY, seaY, summitScreen: (c) => { const d = 0.6, z = 1 + ((c.z ?? 1) - 1) * d; return [(summitX - E.W / 2 - (c.x || 0) * d) * z + E.W / 2, (summitY - E.H / 2 - (c.y || 0) * d) * z + E.H / 2]; } };
  // sky (0.06): high-altitude: deep cobalt overhead, warm band at the horizon, a few stars even in daylight
  layer(g, cam, 0.06, (g) => {
    g.fillStyle = linGrad(g, 0, GY - E.H * 2.4, 0, GY, [[0, '#0b1440'], [0.5, '#2a4a9a'], [0.82, mix(M.sky[1], '#8ab0e8', 0.5)], [1, M.sky[2]]]); g.fillRect(-E.W * 2, GY - E.H * 2.6, E.W * 5, E.H * 3);
    FX.stars(g, t * 0.2, { area: [-E.W, GY - E.H * 2.4, E.W * 3, E.H * 1.2], count: 60, seed: 61, color: '#dfe8ff' });
    glow(g, CX - 640, GY - 260, 700, '#ffc890', 0.4); circle(g, CX - 640, GY - 260, 44, '#fff4dc');
  });
  // far ranges (0.2 / 0.35): bluish, hazy
  layer(g, cam, 0.2, (g) => ridge(g, GY - 140, 300, 7, mix('#4a5a9a', M.sky[2], 0.35), '#e8eeff', M.key));
  layer(g, cam, 0.35, (g) => { ridge(g, GY - 90, 420, 13, mix('#3a4682', '#1a1e3c', 0.3), '#f4f6ff', M.key); FX.fog(g, GY - 260, 260, mix(M.sky[2], '#c8d4f0', 0.5), 0.25); });
  // EVEREST (0.6): the big pyramid, snow faces, rock bands, the yellow band, summit flags + a snow plume blowing off the top
  layer(g, cam, 0.6, (g) => {
    const L = [[summitX - 900, GY + 60], [summitX - 520, GY - 300], [summitX - 300, GY - 420], [summitX - 120, GY - 560], [summitX, summitY], [summitX + 160, GY - 530], [summitX + 360, GY - 460], [summitX + 620, GY - 320], [summitX + 1000, GY + 60]];
    const rock = mix('#3a3448', '#1a1626', 0.3); poly(g, L, rock);
    poly(g, [[summitX, summitY], [summitX - 120, GY - 560], [summitX - 300, GY - 400], [summitX - 200, GY - 370], [summitX - 60, GY - 500]], alpha('#e8eefc', 0.85));            // west snow face, sunlit
    poly(g, [[summitX, summitY], [summitX + 160, GY - 530], [summitX + 100, GY - 470], [summitX + 20, GY - 540]], alpha('#b8c4e8', 0.85));                                          // east face, shade
    poly(g, [[summitX - 520, GY - 300], [summitX - 300, GY - 420], [summitX - 260, GY - 330], [summitX - 420, GY - 250]], alpha('#e8eeff', 0.8));
    for (let i = 0; i < 5; i++) seg(g, [[summitX - 60 - i * 70, GY - 560 + i * 60], [summitX - 200 - i * 70, GY - 420 + i * 60]], 3, alpha('#2a2436', 0.5));                       // couloirs
    glow(g, summitX - 160, GY - 480, 420, M.key, 0.14);
    // snow plume streaming downwind (to the right) off the summit
    for (let i = 0; i < 14; i++) { const ph = (t * 0.25 * wind + i / 14) % 1, x = summitX + 30 + ph * 700, y = summitY + 20 + ph * 90 + Math.sin(i * 2.3 + t) * 12; g.fillStyle = alpha('#f4f6ff', 0.22 * (1 - ph)); g.beginPath(); g.ellipse(x, y, 40 + ph * 140, 14 + ph * 40, 0.1, 0, 7); g.fill(); }
    // summit marker: a pole with prayer flags strung down the ridge + a small flag on top
    seg(g, [[flagX, summitY + 4], [flagX, summitY - 70]], 4, '#2a2436'); const wv = Math.sin(t * 7) * 6 * wind;
    poly(g, [[flagX, summitY - 70], [flagX + 56, summitY - 62 + wv * 0.3], [flagX + 54, summitY - 42 + wv], [flagX, summitY - 46]], '#e0453a');
    const fc = ['#3f7fd6', '#f4f6ff', '#e0453a', '#3fae5a', '#e9c12e'];
    for (const [dx, dy, n] of [[-180, 150, 9], [150, 130, 8]]) for (let i = 0; i < n; i++) { const u = i / (n - 1), x = flagX + dx * u, y = summitY - 40 + dy * u + Math.sin(u * Math.PI) * 30; poly(g, [[x - 7, y], [x + 7, y], [x + 7 + wv * 0.4, y + 18], [x - 7 + wv * 0.4, y + 18]], fc[i % 5]); }
    seg(g, [[flagX, summitY - 40], [flagX - 180, summitY + 110]], 1.5, alpha('#2a2436', 0.7)); seg(g, [[flagX, summitY - 40], [flagX + 150, summitY + 90]], 1.5, alpha('#2a2436', 0.7));
    // the gold 8,849 m label
    const lk = clamp(o.label ?? 1); if (lk > 0) { const lx = summitX + 180, ly = summitY - 40; g.save(); g.globalAlpha *= lk; g.setLineDash([14, 10]); g.strokeStyle = alpha('#ffd47e', 0.85); g.lineWidth = 3; g.beginPath(); g.moveTo(summitX + 20, summitY); g.lineTo(lx, summitY); g.stroke(); g.setLineDash([]);
      rr(g, lx, summitY - 36, 210, 70, 14); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = 3; g.stroke(); text(g, '8,849 m', lx + 105, summitY, { size: 40, color: '#ffd47e', font: FONTS.ui, weight: 900, glow: 12, glowColor: 'rgba(255,212,126,.5)' }); g.restore(); }
  });
  // the cloud sea (0.85 + 1.0): two decks drifting at different speeds
  if (o.sea !== false) { layer(g, cam, 0.85, (g) => cloudSea(g, t, seaY - 50, 71, '#fff6ea', mix('#a8a0d8', M.sky[2], 0.25), 0.95, 6)); layer(g, cam, 1, (g) => cloudSea(g, t, seaY + 40, 83, '#ffffff', mix('#9890c8', '#c8b8e8', 0.3), 1, 14)); }
  // ice crystals glinting in the thin air
  layer(g, cam, 0.9, (g) => { const r = rng(91); for (let i = 0; i < 40; i++) { const x = r() * E.W * 1.6 - E.W * 0.3 + Math.sin(t * 0.5 + i) * 20, y = GY - 900 + r() * 800 + t * 10 * r(); const tw = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.7); if (tw > 0.7) FX.sparkle(g, x, y, 6 + 6 * tw, '#ffffff', 0.7 * tw); } });
  const rim = { color: M.rim, dir: [-0.9, -0.2] };
  return { GY, CX, M, rim, pos };
}

// a dense cloud deck to burst through (any set). burst 0..1 tears a hole around burstX; crystals adds ice sparkle.
export function cloudLayer(g, t, cam, o = {}) {
  const y = o.y ?? E.H * 0.6, bx = o.burstX ?? E.W / 2, b = clamp(o.burst ?? 0), cr = clamp(o.crystals ?? 0);
  layer(g, cam, 1, (g) => {
    g.save(); if (b > 0) { g.beginPath(); g.rect(-E.W * 2, -E.H * 2, E.W * 5, E.H * 5); g.ellipse(bx, y, 140 + 260 * b, 90 + 180 * b, 0, 0, Math.PI * 2, true); g.clip('evenodd'); }   // the torn hole is simply not drawn
    g.fillStyle = linGrad(g, 0, y - 160, 0, y + 260, [alpha('#ffffff', 0), alpha('#f2eefc', 0.92), alpha('#c8c0e8', 0.96)]); g.fillRect(-E.W * 2, y - 160, E.W * 5, 420);
    const r = rng(101); for (let i = 0; i < 40; i++) { const x = -E.W + i * 110 + (t * 12 % 110), rr2 = 80 + r() * 70; g.fillStyle = alpha('#ffffff', 0.85); g.beginPath(); g.arc(x, y - 120 + r() * 40, rr2, Math.PI, 0); g.fill(); }
    g.restore(); g.save(); if (b > 0) {
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, d = (160 + 300 * b), px = bx + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.6; g.fillStyle = alpha('#ffffff', 0.8 * (1 - b)); g.beginPath(); g.arc(px, py, 40 + 30 * (1 - b), 0, 7); g.fill(); } }
    g.restore();
    if (cr > 0) { const r2 = rng(107); for (let i = 0; i < 60; i++) { const x = bx + (r2() - 0.5) * 900, yy = y - 300 + r2() * 500 - t * 40 * r2(); const tw = 0.5 + 0.5 * Math.sin(t * 6 + i); FX.sparkle(g, x, yy, (5 + 8 * tw) * cr, '#e8f6ff', 0.8 * cr * tw); } }
  });
}

export function peaksFg(g, t, cam) {
  blurLayer(g, 14, (g) => { const r = rng(5); for (let i = 0; i < 6; i++) { const x = ((r() * E.W * 2.2 + t * (200 + r() * 200)) % (E.W * 2.4)) - E.W * 0.6, y = r() * E.H; g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.ellipse(x, y, 360, 90, 0.05, 0, 7); g.fill(); } }, cam, 1.7);
}
