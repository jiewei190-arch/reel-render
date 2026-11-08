// sets/earth.js — "What If You Jumped Into a Hole Through the Earth?" (I.Awaken short, classic bright look).
//   surface(g, t, cam, { side:'north'|'south', gy, hole:{x,y,rx,ry} })  polar surface with THE HOLE (north: golden-hour ice, south: night + aurora + penguins)
//   holeFront(g, H)                    front ice lip of the hole (draw AFTER characters)
//   inHole(g, H, fn)                   clip fn() to "above ground OR inside the opening" (hero sinking into the hole)
//   shaft(g, t, cam, { scroll, heat 0..1, core 0..1, speed 0..1 })   inside the tunnel: strata streaming up, glowing cracks, embers, speed streaks
//   shaftFg(g, t, cam, { scroll, heat })  blurred foreground rock chunks rushing up (depth 1.6)
//   globeCut(g, t, cx, cy, r, { pos:-1..1 (top..bottom pole), trail, labels:0..1, heat })   cutaway Earth + tunnel + tiny hero marker
//   gauge(g, x, y, r, v, { label, color, str })   dial with gold needle (v 0..1)
//   chip(g, t, str, x, y, t0, { size, color, dur })  gold label that pops on its word (outBack), <= 6 words
//   heatHaze(g, t, k)  /  coreGlow(g, t, k)   full-frame atmosphere passes
import { E, clamp, lerp, ease, prog, rng, seg, circle, ring, rr, poly, alpha, shade, glow, text, FONTS, layer, blurLayer, linGrad, radGrad, mix, noise } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GOLD = '#FFC93C', CREAM = '#f3ead2', CORAL = '#FF6B5B', LAVA = '#ff6a1a', WHITEHOT = '#fff4c8';
const W = () => E.W, H = () => E.H;

// ---------------------------------------------------------------- polar surface
function penguin(g, x, y, s, t, seed = 0) {
  const b = Math.sin(t * 3 + seed) * 2 * s, lean = Math.sin(t * 1.3 + seed) * 0.06;
  g.save(); g.translate(x, y); g.rotate(lean); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 2, 26, 6, 0, 0, 7); g.fill();
  g.fillStyle = '#16141e'; g.beginPath(); g.ellipse(0, -46 + b * 0.2, 24, 46, 0, 0, 7); g.fill();
  g.fillStyle = '#f2f0ea'; g.beginPath(); g.ellipse(5, -40, 15, 36, 0, 0, 7); g.fill();
  circle(g, 2, -92, 17, '#16141e'); circle(g, 8, -96, 4.2, '#fff'); circle(g, 9, -96, 2.2, '#0a0a10');
  poly(g, [[16, -92], [32, -88], [16, -84]], '#f0a020');
  g.fillStyle = '#f0a020'; g.beginPath(); g.ellipse(-8, 0, 9, 4, 0, 0, 7); g.ellipse(10, 0, 9, 4, 0, 0, 7); g.fill();
  seg(g, [[-20, -66], [-30 - Math.sin(t * 4 + seed) * 6, -30]], 8, '#16141e');
  g.restore();
}
function polePost(g, x, y, south) {
  seg(g, [[x, y], [x, y - 360]], 22, '#f4efe6');
  for (let i = 0; i < 7; i++) seg(g, [[x, y - 30 - i * 50], [x, y - 52 - i * 50]], 22, '#d4262e', 'butt');
  if (south) { circle(g, x, y - 384, 34, '#c8d2e8'); glow(g, x - 10, y - 394, 40, '#ffffff', 0.5); circle(g, x - 10, y - 394, 9, '#ffffff'); }
  else { circle(g, x, y - 372, 18, GOLD); }
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 3, 40, 8, 0, 0, 7); g.fill();
}
function sign(g, x, y, str, rot = -0.05) {
  seg(g, [[x, y], [x, y - 200]], 12, '#6a4428');
  g.save(); g.translate(x, y - 210); g.rotate(rot); rr(g, -150, -46, 300, 92, 12); g.fillStyle = '#8a5a32'; g.fill(); g.strokeStyle = '#4a2c18'; g.lineWidth = 6; g.stroke();
  text(g, str, 0, 2, { size: 40, color: CREAM, font: FONTS.title, weight: 700 }); g.restore();
}
export function surface(g, t, cam, o = {}) {
  const south = o.side === 'south', GY = o.gy ?? 1060, Hh = { x: 540, y: GY + 70, rx: 250, ry: 66, ...(o.hole || {}) };
  // sky (depth 0.1)
  layer(g, cam, 0.1, (g) => {
    g.fillStyle = linGrad(g, 0, -400, 0, GY + 100, south ? ['#050a22', '#0e1a44', '#22306a', '#3a4a86'] : ['#3d5fae', '#7fa6e0', '#f2c79a', '#ffa86e']); g.fillRect(-1200, -1600, 3400, GY + 1800);
    if (south) {
      FX.stars(g, t, { count: 160, area: [-300, -300, 1700, GY], seed: 5 });
      for (let k = 0; k < 3; k++) {     // aurora ribbons
        g.save(); g.globalCompositeOperation = 'lighter'; g.beginPath();
        const y0 = 300 + k * 110, c = k === 1 ? '#7a6aff' : '#3affb0';
        for (let x = -300; x <= 1400; x += 40) g.lineTo(x, y0 + Math.sin(x * 0.006 + t * 0.6 + k) * 80 + noise(x * 0.01 + t * 0.3, k) * 30);
        g.strokeStyle = alpha(c, 0.22); g.lineWidth = 120; g.stroke(); g.strokeStyle = alpha(c, 0.35); g.lineWidth = 30; g.stroke(); g.restore();
      }
      FX.moon(g, 820, 330, 46);
    } else {
      FX.sun(g, 760, GY - 220, 70, '#fff6e0', '#ffcf8a', 5);
      FX.clouds(g, { y: 380, count: 6, h: 110, color: '#ffffff', a: 0.28, seed: 4 });
    }
  });
  // far ice ridges (0.3) and mid ridges (0.55)
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = south ? '#2a3a70' : '#b8c8ea'; g.beginPath(); g.moveTo(-600, GY); for (let x = -600; x <= 1700; x += 60) g.lineTo(x, GY - 150 - Math.abs(Math.sin(x * 0.008 + 1)) * 160 - noise(x * 0.02, 3) * 40); g.lineTo(1700, GY + 400); g.lineTo(-600, GY + 400); g.fill();
    g.fillStyle = alpha(south ? '#8aa0e0' : '#ffffff', 0.35); g.beginPath(); g.moveTo(-600, GY); for (let x = -600; x <= 1700; x += 60) g.lineTo(x, GY - 150 - Math.abs(Math.sin(x * 0.008 + 1)) * 160 - noise(x * 0.02, 3) * 40 + 30); g.lineTo(1700, GY); g.fill();
  });
  layer(g, cam, 0.55, (g) => {
    g.fillStyle = south ? '#34488a' : '#d6e2f6'; g.beginPath(); g.moveTo(-600, GY + 20); for (let x = -600; x <= 1700; x += 50) g.lineTo(x, GY - 40 - Math.abs(Math.sin(x * 0.013 + 4)) * 70); g.lineTo(1700, GY + 300); g.lineTo(-600, GY + 300); g.fill();
    if (!south) { for (const [x, c] of [[90, '#d4262e'], [980, '#2f6fd0']]) { seg(g, [[x, GY], [x, GY - 120]], 5, '#2a2230'); poly(g, [[x, GY - 120], [x + 56 + Math.sin(t * 5 + x) * 6, GY - 104], [x, GY - 88]], c); } }
  });
  // ground (character plane)
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 900, south ? ['#5a6aa8', '#3a4880', '#26305a'] : ['#f6f2ff', '#dfe6f8', '#b8c4e4']); g.fillRect(-900, GY, 2900, 1600);
    // snow drifts + sparkle
    const r = rng(7); for (let i = 0; i < 26; i++) { const x = -300 + r() * 1700, y = GY + 40 + r() ** 1.6 * 700; g.fillStyle = alpha(south ? '#7a8ac8' : '#ffffff', 0.5); g.beginPath(); g.ellipse(x, y, 60 + r() * 120, 8 + r() * 10, 0, 0, 7); g.fill(); }
    if (!south) for (let i = 0; i < 14; i++) { const x = -100 + r() * 1300, y = GY + 30 + r() * 600; FX.sparkle(g, x, y, 10 + 6 * Math.sin(t * 3 + i), '#ffffff', 0.5 + 0.4 * Math.sin(t * 2 + i)); }
    // the hole: dark throat with warm glow far below
    g.save(); g.beginPath(); g.ellipse(Hh.x, Hh.y, Hh.rx, Hh.ry, 0, 0, 7); g.clip();
    g.fillStyle = radGrad(g, Hh.x, Hh.y + Hh.ry * 0.6, 0, Hh.rx * 1.1, ['#ff8a3a', '#7a2a1a', '#1a0e14', '#08060a']); g.fillRect(Hh.x - Hh.rx, Hh.y - Hh.ry, Hh.rx * 2, Hh.ry * 2);
    g.strokeStyle = alpha('#000', 0.5); g.lineWidth = 14; for (let k = 1; k < 4; k++) { g.beginPath(); g.ellipse(Hh.x, Hh.y + k * 9, Hh.rx * (1 - k * 0.18), Hh.ry * (1 - k * 0.2), 0, 0, 7); g.stroke(); }
    g.restore();
    glow(g, Hh.x, Hh.y, Hh.rx * 1.3, '#ff9a4a', 0.25 + 0.05 * Math.sin(t * 3));
    g.strokeStyle = south ? '#8a9ad8' : '#ffffff'; g.lineWidth = 12; g.beginPath(); g.ellipse(Hh.x, Hh.y, Hh.rx, Hh.ry, 0, Math.PI, Math.PI * 2); g.stroke();
    // props
    if (south) { polePost(g, 900, GY + 30, true); penguin(g, 120, GY + 160, 1.5, t, 1); penguin(g, 230, GY + 120, 1.15, t, 2.4); penguin(g, 960, GY + 230, 1.3, t, 4); }
    else { polePost(g, 130, GY + 40, false); sign(g, 930, GY + 60, 'SOUTH POLE ↓', 0.05);
      rr(g, 760, GY + 230, 170, 34, 10); g.fillStyle = '#c23a2a'; g.fill(); seg(g, [[760, GY + 270], [940, GY + 270]], 6, '#3a2a2a'); }
  });
  return { GY, hole: Hh, rim: south ? '#9fc0ff' : '#ffd6a0', south };
}
export function holeFront(g, Hh, cam, south) {
  layer(g, cam, 1, (g) => {
    g.strokeStyle = south ? '#a8b8f0' : '#ffffff'; g.lineWidth = 20; g.beginPath(); g.ellipse(Hh.x, Hh.y, Hh.rx + 4, Hh.ry + 4, 0, 0.05, Math.PI - 0.05); g.stroke();
    g.strokeStyle = alpha(south ? '#6a7ab8' : '#c8d4ee', 1); g.lineWidth = 8; g.beginPath(); g.ellipse(Hh.x, Hh.y + 10, Hh.rx + 6, Hh.ry + 6, 0, 0.2, Math.PI - 0.2); g.stroke();
  });
}
export function inHole(g, Hh, cam, fn) {
  layer(g, cam, 1, (g) => {
    g.save(); g.beginPath(); g.rect(-2000, -3000, 5000, 3000 + Hh.y); g.moveTo(Hh.x + Hh.rx, Hh.y); g.ellipse(Hh.x, Hh.y, Hh.rx, Hh.ry, 0, 0, Math.PI); g.clip(); fn(g); g.restore();
  });
}

// ---------------------------------------------------------------- the shaft
function rockCol(heat, k) {   // k 0..1 band variation
  const cool = mix('#5a4a52', '#7a6066', k), warm = mix('#8a3a22', '#b0502a', k), hot = mix('#e0602a', '#ffb050', k);
  return heat < 0.5 ? mix(cool, warm, heat * 2) : mix(warm, hot, (heat - 0.5) * 2);
}
export function shaft(g, t, cam, o = {}) {
  const sc = o.scroll ?? t * 400, heat = o.heat ?? 0, core = o.core ?? 0, sp = o.speed ?? 0.5;
  // back wall: strata bands (depth 0.6)
  layer(g, cam, 0.6, (g) => {
    const band = 140, off = sc * 0.6 % (band * 8);
    for (let i = -10; i < 30; i++) {
      const y = -800 + i * band - off, idx = ((Math.floor((sc * 0.6) / (band * 8)) * 8 + i) % 97 + 97) % 97, k = (Math.sin(idx * 12.9898) * 43758.5453) % 1;
      g.fillStyle = rockCol(heat, Math.abs(k)); g.fillRect(-600, y, 2300, band + 2);
      g.fillStyle = alpha('#000', 0.18); g.fillRect(-600, y + band - 14, 2300, 14);
      if (heat > 0.25) { // glowing cracks
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha(heat > 0.7 ? WHITEHOT : LAVA, 0.25 + 0.5 * (heat - 0.25)); g.lineWidth = 5 + heat * 6; g.beginPath();
        let x = -200 + Math.abs(k) * 300; g.moveTo(x, y + band * 0.5); while (x < 1400) { x += 60 + Math.abs(Math.sin(x + idx)) * 80; g.lineTo(x, y + band * 0.5 + Math.sin(x * 0.05 + idx) * 40); } g.stroke(); g.restore();
      }
    }
  });
  // side walls (depth 0.85): darker rock jaws framing the tunnel
  layer(g, cam, 0.85, (g) => {
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -400 : 940; g.fillStyle = linGrad(g, s < 0 ? 140 : 940, 0, s < 0 ? -100 : 1180, 0, [shade(rockCol(heat, 0.3), -0.25), shade(rockCol(heat, 0.1), -0.6)]);
      g.beginPath(); g.moveTo(x0, -1200); for (let y = -1200; y < 3200; y += 70) { const yy = y - (sc * 0.85 % 140); g.lineTo((s < 0 ? 140 : 940) + s * (noise((yy + sc * 0.85) * 0.01, s + 5) * 40), yy); } g.lineTo(x0, 3200); g.lineTo(s < 0 ? x0 : 2000, 3200); g.lineTo(s < 0 ? x0 : 2000, -1200); g.closePath(); g.fill();
      if (heat > 0.3) glow(g, s < 0 ? 140 : 940, 960, 600, LAVA, 0.18 * heat);
    }
  });
  // atmosphere
  const r = rng(21); g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) { const x = r() * E.W, base = r() * E.H * 1.4, L = 40 + sp * 260 * r(); const y = ((base - sc * (1.2 + r())) % (E.H * 1.4) + E.H * 1.4) % (E.H * 1.4) - 100;
    g.strokeStyle = alpha(heat > 0.4 ? '#ffd090' : '#e8ecff', (0.12 + 0.3 * sp) * (0.4 + r() * 0.6)); g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + L); g.stroke(); }
  g.restore();
  if (heat > 0.2) FX.dust(g, t * 1.3, { count: 40, color: '#ffa040', a: 0.5 * heat, size: 3, seed: 8 });
  if (heat > 0) veil(g, heat > 0.6 ? '#ff7a2a' : '#ff5020', 0.12 * heat, 'lighter');
  if (core > 0) { glow(g, 540, 960, 1200, WHITEHOT, 0.55 * core); veil(g, '#fff0c0', 0.25 * core, 'lighter'); }
}
function veil(g, c, a, op) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = op || 'source-over'; g.fillStyle = alpha(c, a); g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); }
export function shaftFg(g, t, cam, o = {}) {
  const sc = o.scroll ?? t * 400, heat = o.heat ?? 0;
  blurLayer(g, 6, (g) => {
    const r = rng(33);
    for (let i = 0; i < 6; i++) { const left = i % 2 === 0, x = left ? -60 + r() * 120 : 960 + r() * 120, span = E.H * 1.8, y = ((r() * span - sc * 1.7) % span + span) % span - 300, s = 90 + r() * 120;
      g.fillStyle = shade(rockCol(heat, r()), -0.45); g.beginPath(); g.moveTo(x - s, y); g.lineTo(x, y - s * 0.8); g.lineTo(x + s, y - s * 0.1); g.lineTo(x + s * 0.6, y + s); g.lineTo(x - s * 0.8, y + s * 0.7); g.closePath(); g.fill(); }
  });
}
export function heatHaze(g, t, k) { if (k <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const y = ((i * 340 - t * 260) % 2100 + 2100) % 2100 - 100; g.fillStyle = linGrad(g, 0, y, 0, y + 160, [alpha(LAVA, 0), alpha(LAVA, 0.07 * k), alpha(LAVA, 0)]); g.fillRect(0, y, E.W, 160); } g.restore(); }
export function coreGlow(g, t, k) { if (k <= 0) return; glow(g, 540, 900, 1100 + Math.sin(t * 2) * 40, WHITEHOT, 0.35 * k); FX.dust(g, t * 0.8, { count: 50, color: '#fff2c0', a: 0.6 * k, size: 3, seed: 12 }); }

// ---------------------------------------------------------------- cutaway Earth
export function globeCut(g, t, cx, cy, r, o = {}) {
  const pos = o.pos ?? -1, lab = o.labels ?? 0;
  glow(g, cx, cy, r * 1.5, '#7ab8ff', 0.25);
  circle(g, cx, cy, r * 1.03, '#9fd0ff');                         // atmosphere ring
  circle(g, cx, cy, r, '#2f6fd0');                                // ocean
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
  const rr2 = rng(3); g.fillStyle = '#3aa05a'; for (let i = 0; i < 7; i++) { const a = rr2() * 7, d = r * (0.3 + rr2() * 0.7); g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * (0.18 + rr2() * 0.2), r * (0.1 + rr2() * 0.14), a, 0, 7); g.fill(); }
  circle(g, cx, cy - r * 0.97, r * 0.32, '#f4f6ff'); circle(g, cx, cy + r * 0.97, r * 0.36, '#f4f6ff');   // ice caps
  g.restore();
  // cut wedge: the left half shows the inside
  g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r * 0.985, Math.PI * 0.5, Math.PI * 1.5); g.closePath(); g.clip();
  circle(g, cx, cy, r * 0.985, '#8a5a3a');                        // crust
  g.fillStyle = radGrad(g, cx, cy, r * 0.55, r * 0.97, ['#ff8a3a', '#d0502a', '#a8402a']); g.beginPath(); g.arc(cx, cy, r * 0.96, 0, 7); g.fill();     // mantle
  g.fillStyle = radGrad(g, cx, cy, r * 0.19, r * 0.55, ['#ffd060', '#ffa030']); g.beginPath(); g.arc(cx, cy, r * 0.55, 0, 7); g.fill();               // outer core
  circle(g, cx, cy, r * 0.19, WHITEHOT); glow(g, cx, cy, r * 0.4, '#fff0b0', 0.6 + 0.1 * Math.sin(t * 4));                                          // inner core
  g.restore();
  seg(g, [[cx, cy - r], [cx, cy + r]], 5, alpha('#1a1020', 0.8)); seg(g, [[cx, cy - r * 0.99], [cx, cy + r * 0.99]], 3, alpha(CREAM, 0.9));          // the tunnel
  if (lab > 0) {
    const L = [['CRUST', -0.97, 0], ['MANTLE', -0.75, 0.25], ['CORE', -0.3, 0.5]];
    for (const [s, yy, d] of L) { const k = ease.outBack(clamp((lab - d) * 3)); if (k <= 0) continue; const y = cy + yy * r * 0.62; g.save(); g.globalAlpha *= clamp(k);
      seg(g, [[cx - r * 0.25, y], [cx - r * 0.25 - 60 * k, y]], 3, GOLD); text(g, s, cx - r * 0.25 - 70, y, { size: 38, color: GOLD, align: 'right', font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#140c10' }); g.restore(); }
  }
  // tiny hero marker + trail
  if (o.trail) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 1; i <= 12; i++) { const p = o.trail(i); circle(g, cx, cy + p * r * 0.97, 16 - i, alpha(GOLD, 0.35 * (1 - i / 13))); } g.restore(); }
  const y = cy + pos * r * 0.97; glow(g, cx, y, 60, GOLD, 0.8); circle(g, cx, y, 20, '#E1AD01'); circle(g, cx, y - 20, 12, '#0e0b12');
  return { tunnelTop: cy - r, tunnelBot: cy + r };
}

// ---------------------------------------------------------------- HUD bits
export function gauge(g, x, y, r, v, o = {}) {
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, col = o.color || GOLD;
  circle(g, x, y, r * 1.08, alpha('#120c18', 0.85)); ring(g, x, y, r * 1.08, 6, alpha(CREAM, 0.6));
  g.lineCap = 'round'; g.strokeStyle = alpha(CREAM, 0.2); g.lineWidth = r * 0.14; g.beginPath(); g.arc(x, y, r * 0.82, a0, a1); g.stroke();
  g.strokeStyle = col; g.beginPath(); g.arc(x, y, r * 0.82, a0, lerp(a0, a1, clamp(v))); g.stroke();
  for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); seg(g, [[x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62], [x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7]], 4, alpha(CREAM, 0.7)); }
  const a = lerp(a0, a1, clamp(v)); seg(g, [[x, y], [x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72]], 8, CORAL); circle(g, x, y, r * 0.1, CREAM);
  if (o.str) text(g, o.str, x, y + r * 0.45, { size: r * 0.34, color: col, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(col, 0.6) });
  if (o.label) text(g, o.label, x, y + r * 1.32, { size: Math.max(34, r * 0.22), color: CREAM, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#140c10' });
}
export function chip(g, t, str, x, y, t0, o = {}) {
  const u = t - t0; if (u < 0) return; const dur = o.dur ?? 99; if (u > dur + 0.25) return;
  const k = ease.outBack(clamp(u / 0.3)), fade = 1 - clamp((u - dur) / 0.25), size = o.size ?? 72, col = o.color || GOLD;
  g.save(); g.translate(x, y); g.scale(k, k); g.globalAlpha *= fade;
  g.font = `900 ${size}px "${FONTS.ui}"`; const w = g.measureText(str).width + size * 0.9;
  rr(g, -w / 2, -size * 0.75, w, size * 1.5, size * 0.4); g.fillStyle = alpha('#140c18', 0.82); g.fill(); g.strokeStyle = alpha(col, 0.8); g.lineWidth = 5; g.stroke();
  text(g, str, 0, 4, { size, color: col, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(col, 0.55) });
  g.restore();
}
