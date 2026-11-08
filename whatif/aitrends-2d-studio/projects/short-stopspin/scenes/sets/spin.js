// sets/spin.js — "What If the Earth Stopped Spinning for One Second?" (I.Awaken short, classic bright look, 9:16).
// EAST IS ALWAYS SCREEN-RIGHT. Everything deterministic (t, rng). Colours from mood() + the cast mustard.
//   globe(g, t, x, y, r, rot, { equator:0..1, arrow:0..1, clouds, glowK, freeze:0..1 })  cartoon Earth (north up), rot in radians
//   tinyPlanet(g, t, cam, { rot, r, cy })   the hook: a huge curved planet top with houses, trees, lamp posts riding on it
//   sunnyStreet(g, t, cam, { scroll, wind:0..1, frozen:0..1 })   bright street, 4 parallax depths; returns { GY, rim }
//   streetFg(g, t, cam, { scroll, wind })   blurred foreground hedge / bollards
//   coast(g, t, cam, { surge:0..1 })   seaside promenade, lighthouse; the ocean leaps east over the sea wall
//   windStreaks(g, t, k, { y0, y1, seed })   horizontal air streaks racing right
//   flyingJunk(g, t, k, { seed, kinds })   leaves, hats, papers, a bin lid, flying right
//   bigNumber(g, t, str, x, y, at, { size, sub })   gold extruded number pop (outBack) with glow
//   punchFlash(g, t, at, a)   white impact flash
import { E, V, mood, layer, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, clamp, lerp, prog, ease, noise, blurLayer, text, measure, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const SKYC = ['#3f8fe8', '#7fbcf4', '#c8e6ff', '#fff1d6'];
const HOODY = '#E1AD01';

// ---------------------------------------------------------------- globe
const LAND = [ // [lon, lat, rx, ry] degrees: rough continents made of blobs
  [-100, 45, 34, 18], [-90, 30, 18, 14], [-110, 58, 26, 10], [-75, 10, 10, 10], [-60, -12, 18, 22], [-65, -35, 9, 16],          // Americas
  [15, 50, 18, 10], [30, 58, 26, 9], [20, 8, 20, 22], [25, -18, 13, 14], [45, 25, 12, 9],                                       // Europe + Africa
  [90, 50, 40, 14], [100, 30, 22, 12], [80, 20, 9, 10], [110, 10, 8, 6], [135, -25, 17, 11], [140, 38, 4, 7],                  // Asia + Australia
  [0, -82, 180, 9], [-40, 74, 14, 8],                                                                                             // Antarctica, Greenland
];
function proj(cx, cy, r, lon, lat, rot) {
  const L = lon * Math.PI / 180 + rot, P = lat * Math.PI / 180;
  return { x: cx + r * Math.cos(P) * Math.sin(L), y: cy - r * Math.sin(P), z: Math.cos(P) * Math.cos(L) };
}
export function globe(g, t, cx, cy, r, rot, o = {}) {
  glow(g, cx, cy, r * 1.45, '#8fd0ff', 0.35 * (o.glowK ?? 1));
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
  g.fillStyle = radGrad(g, cx - r * 0.35, cy - r * 0.4, r * 0.1, r * 1.5, ['#4fb4f0', '#2a78c8', '#163e7e']); g.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (const [lon, lat, rx, ry] of LAND) {
    const p = proj(cx, cy, r, lon, lat, rot); if (p.z < -0.15) continue;
    const L = lon * Math.PI / 180 + rot, sq = Math.max(0.08, Math.cos(L)), k = clamp((p.z + 0.15) / 0.3);
    g.fillStyle = alpha(lat < -70 || lat > 68 ? '#f2f6ff' : (Math.abs(lat) < 25 && lon > -20 && lon < 60 ? '#d8b860' : '#5cb85a'), k);
    g.beginPath(); g.ellipse(p.x, p.y, Math.max(2, r * rx / 62 * sq * Math.cos(lat * Math.PI / 180) + 2), r * ry / 62 * (0.6 + 0.4 * Math.cos(lat * Math.PI / 180)), 0, 0, 7); g.fill();
  }
  if (o.clouds !== false) { const cr = rng(4); for (let i = 0; i < 16; i++) { const lon = cr() * 360 - 180, lat = cr() * 120 - 60, p = proj(cx, cy, r, lon, lat, rot * 1.08 + 0.05 * t); if (p.z < 0.05) continue; const L = lon * Math.PI / 180 + rot * 1.08 + 0.05 * t; g.fillStyle = alpha('#ffffff', 0.55 * clamp(p.z * 2)); g.beginPath(); g.ellipse(p.x, p.y, r * (0.1 + cr() * 0.1) * Math.max(0.1, Math.cos(L)), r * 0.035, 0, 0, 7); g.fill(); } }
  // equator band (gold, dashed) + latitude ghost lines
  const eq = clamp(o.equator ?? 0);
  if (eq > 0) { g.setLineDash([22, 14]); g.lineDashOffset = -t * 60; g.strokeStyle = alpha('#ffd47e', eq); g.lineWidth = r * 0.03; g.beginPath(); g.ellipse(cx, cy, r, r * 0.08, 0, 0, Math.PI); g.stroke(); g.setLineDash([]); glow(g, cx, cy + r * 0.08, r * 0.9, '#ffd47e', 0.2 * eq); }
  // night-side terminator + spec highlight
  g.fillStyle = linGrad(g, cx - r, cy, cx + r, cy, [[0, 'rgba(10,14,40,0)'], [0.62, 'rgba(10,14,40,0)'], [1, 'rgba(10,14,40,.55)']]); g.fillRect(cx - r, cy - r, r * 2, r * 2);
  glow(g, cx - r * 0.38, cy - r * 0.42, r * 0.5, '#ffffff', 0.25);
  g.restore();
  ring(g, cx, cy, r + 3, r * 0.025, alpha('#bfe8ff', 0.8));
  // spin arrow (gold, curving over the north, pointing EAST = right)
  const ar = clamp(o.arrow ?? 0); if (ar > 0) {
    const a0 = Math.PI * 1.18, a1 = lerp(a0, Math.PI * 1.82, ease.out(ar)), R = r * 1.16;
    g.strokeStyle = '#ffd47e'; g.lineWidth = r * 0.06; g.lineCap = 'round'; g.beginPath(); g.ellipse(cx, cy - r * 0.15, R, R * 0.42, 0, a0, a1); g.stroke();
    const hx = cx + R * Math.cos(a1), hy = cy - r * 0.15 + R * 0.42 * Math.sin(a1), d = r * 0.13; g.save(); g.translate(hx, hy); g.rotate(a1 + Math.PI / 2 + 0.35); poly(g, [[d, 0], [-d * 0.7, -d * 0.75], [-d * 0.7, d * 0.75]], '#ffd47e'); g.restore();
    glow(g, hx, hy, r * 0.4, '#ffd47e', 0.25 * ar);
  }
  if (o.freeze > 0) { g.save(); g.globalAlpha = o.freeze; ring(g, cx, cy, r * (1 + 0.4 * (1 - o.freeze)), 10, '#ffffff'); g.restore(); }
}

// ---------------------------------------------------------------- the hook: tiny planet
export function tinyPlanet(g, t, cam, o = {}) {
  const M = mood('day'), r = o.r ?? 1250, cx = E.W / 2, cy = o.cy ?? 1210 + r, rot = o.rot ?? 0;
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, -300, 0, E.H, SKYC); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.sun(g, 180, 330, 70, '#fffaf0', '#ffe2a8', 3.5); });
  layer(g, cam, 0.15, (g) => drawClouds(g, t, { y: 200, n: 7, drift: 26, seed: 3, a: 0.9 }));
  layer(g, cam, 0.35, (g) => { FX.hills(g, { y: 1180, amp: 70, color: '#8ac6a0', seed: 4 }); });
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(cx, cy);
    // planet body: grass ring, road ring, then soil
    circle(g, 0, 0, r + 26, '#5aae55'); circle(g, 0, 0, r, '#6b5a4a');
    g.fillStyle = radGrad(g, 0, 0, r * 0.8, r, ['#3a2e28', '#6b5a4a']); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    ring(g, 0, 0, r + 30, 10, '#7ccc6a');
    g.rotate(rot);
    const pr = rng(12);
    for (let i = 0; i < 46; i++) {   // props riding on the surface
      const a = (i / 46) * Math.PI * 2, kind = i % 6; g.save(); g.rotate(a); g.translate(0, -(r + 26));
      if (kind === 0) house(g, 0, 0, 1.1 + pr() * 0.4, ['#e8836a', '#7fb0e0', '#f2c45a', '#9a7ad6', '#e0e0d0'][i % 5], t);
      else if (kind === 1 || kind === 4) FX.tree(g, 0, 0, 1.2 + pr() * 0.5, '#3f9a4a');
      else if (kind === 2) FX.lampPost(g, 0, 0, 230, { color: '#2a2a3a', on: false });
      else if (kind === 3) { rr(g, -26, -60, 52, 60, 8); g.fillStyle = '#d4262e'; g.fill(); }
      else { rr(g, -60, -120, 120, 120, 6); g.fillStyle = '#f0e6d2'; g.fill(); g.fillStyle = '#2f6fd0'; g.fillRect(-60, -132, 120, 18); g.fillStyle = '#9fd8ff'; g.fillRect(-40, -96, 80, 50); }
      g.restore();
    }
    g.restore();
  });
  return { GY: cy - r - 26, rim: { color: '#fff1d6', dir: [-0.7, -0.7] }, M };
}
function house(g, x, y, s, col, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = col; g.fillRect(-70, -130, 140, 130); poly(g, [[-84, -128], [0, -200], [84, -128]], shade(col, -0.35));
  g.fillStyle = '#fff6dc'; g.fillRect(-50, -104, 36, 34); g.fillRect(14, -104, 36, 34); g.fillStyle = shade(col, -0.5); g.fillRect(-14, -60, 28, 60);
  g.restore();
}
export function drawClouds(g, t, o = {}) {
  const r = rng(o.seed ?? 3), n = o.n ?? 6, frz = o.frozenAt;
  for (let i = 0; i < n; i++) {
    const w = 160 + r() * 200, sp = (o.drift ?? 20) * (0.6 + r() * 0.8), tt = frz != null ? Math.min(t, frz) : t;
    const x = ((r() * E.W * 1.6 + tt * sp) % (E.W * 1.6)) - E.W * 0.3, y = (o.y ?? 200) + r() * (o.h ?? 300);
    g.fillStyle = alpha('#ffffff', o.a ?? 0.9);
    for (const [dx, dy, k] of [[0, 0, 1], [-w * 0.32, 10, 0.7], [w * 0.32, 12, 0.75], [w * 0.1, -w * 0.12, 0.8]]) { g.beginPath(); g.ellipse(x + dx, y + dy, w * 0.36 * k, w * 0.2 * k, 0, 0, 7); g.fill(); }
    g.fillStyle = alpha('#c8dcf2', 0.6 * (o.a ?? 0.9)); g.beginPath(); g.ellipse(x, y + w * 0.1, w * 0.5, w * 0.06, 0, 0, 7); g.fill();
  }
}

// ---------------------------------------------------------------- sunny street (east = right)
export const streetGY = () => 1180;
export function sunnyStreet(g, t, cam, o = {}) {
  const GY = streetGY(), sc = o.scroll ?? 0, wind = clamp(o.wind ?? 0), c = { ...cam, x: (cam.x || 0) - sc };
  layer(g, c, 0.04, (g) => { g.fillStyle = linGrad(g, 0, -400, 0, GY, SKYC); g.fillRect(-E.W * 4, -E.H, E.W * 9, E.H * 3); FX.sun(g, 200 + sc * 0.04, 300, 70, '#fffaf0', '#ffe2a8', 3.5); });
  layer(g, c, 0.12, (g) => { g.save(); g.translate(-E.W, 0); drawClouds(g, t, { y: 140, n: 9, drift: 30 + wind * 900, seed: 5, a: 0.92 }); g.translate(E.W * 1.6, 0); drawClouds(g, t, { y: 160, n: 6, drift: 30 + wind * 900, seed: 6, a: 0.85 }); g.restore(); });
  layer(g, c, 0.3, (g) => FX.skyline(g, { x: -E.W * 4, y: GY - 260, w: E.W * 10, minH: 160, maxH: 520, color: '#9fb8d8', windowColor: alpha('#ffffff', 0.5), lit: 0.25, seed: 11 }));
  layer(g, c, 0.6, (g) => {   // colourful mid-rise facades
    const r = rng(23); let x = -E.W * 3;
    while (x < E.W * 5) {
      const w = 260 + r() * 140, h = 420 + r() * 260, col = ['#e8836a', '#f2c45a', '#7fb0e0', '#9ad0a0', '#e0a8c8', '#f0e6d2'][Math.floor(r() * 6)];
      g.fillStyle = col; g.fillRect(x, GY - 40 - h, w, h + 40); g.fillStyle = shade(col, -0.25); g.fillRect(x - 6, GY - 40 - h - 16, w + 12, 20);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { const wx = x + 26 + i * (w - 52) / 3, wy = GY - h + 10 + j * 100; g.fillStyle = '#cfe8ff'; g.fillRect(wx, wy, (w - 52) / 3 - 18, 60); g.fillStyle = alpha('#ffffff', 0.5); g.fillRect(wx + 4, wy + 4, 10, 40); g.fillStyle = shade(col, -0.4); g.fillRect(wx - 4, wy + 60, (w - 52) / 3 - 10, 6); }
      x += w + 10;
    }
  });
  layer(g, c, 1, (g) => {
    // shopfronts at street level with awnings
    const r = rng(31);
    for (let x = -E.W * 3; x < E.W * 5; x += 520) {
      const col = ['#d4262e', '#2f6fd0', '#3aa05a', '#f08a24'][Math.floor(r() * 4)];
      g.fillStyle = '#f4ead8'; g.fillRect(x, GY - 330, 480, 330); g.fillStyle = '#bfe4ff'; g.fillRect(x + 30, GY - 230, 300, 200); g.fillStyle = alpha('#ffffff', 0.6); g.fillRect(x + 50, GY - 220, 30, 160);
      g.fillStyle = shade(col, -0.3); g.fillRect(x + 360, GY - 230, 90, 230);
      const sw = Math.sin(t * 9 + x) * 6 * wind; for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffffff' : col; poly(g, [[x + i * 60, GY - 300], [x + (i + 1) * 60, GY - 300], [x + (i + 1) * 60 + 16 + sw, GY - 240], [x + i * 60 + 16 + sw, GY - 240]], i % 2 ? '#ffffff' : col); }
      text(g, ['CAFE', 'BOOKS', 'FRUIT', 'BAKERY'][Math.floor(r() * 4)], x + 180, GY - 270, { size: 34, color: '#ffffff', font: FONTS.ui, weight: 900, stroke: 6, strokeColor: shade(col, -0.4) });
    }
    // pavement, kerb, road
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 120, ['#d8cfc2', '#b8ae9f']); g.fillRect(-E.W * 4, GY, E.W * 10, 120);
    for (let x = -E.W * 4; x < E.W * 6; x += 140) seg(g, [[x, GY], [x - 30, GY + 120]], 3, alpha('#8a8070', 0.5));
    g.fillStyle = '#9a9488'; g.fillRect(-E.W * 4, GY + 120, E.W * 10, 16);
    g.fillStyle = linGrad(g, 0, GY + 136, 0, E.H, ['#5a5a66', '#3a3a46']); g.fillRect(-E.W * 4, GY + 136, E.W * 10, E.H);
    for (let x = -E.W * 4; x < E.W * 6; x += 300) { g.fillStyle = '#f2e6b0'; g.fillRect(x, GY + 330, 160, 12); }
    // street furniture: trees (bend in wind), lamps, bench, hydrant, bin, bike
    for (let x = -E.W * 3 + 120; x < E.W * 5; x += 520) {
      const bend = wind * (24 + 10 * Math.sin(t * 13 + x));
      g.save(); g.translate(x + 470, GY + 20); g.transform(1, 0, bend * 0.012, 1, 0, 0); FX.tree(g, 0, 0, 1.7, '#3f9a4a'); g.restore();
      FX.lampPost(g, x + 250, GY + 30, 380, { color: '#2a2a3a', on: false });
      rr(g, x - 70, GY - 64, 30, 64, 8); g.fillStyle = '#d4262e'; g.fill();
      rr(g, x + 20, GY - 40, 150, 14, 4); g.fillStyle = '#7a5a3a'; g.fill(); rr(g, x + 20, GY - 74, 150, 12, 4); g.fill(); seg(g, [[x + 34, GY - 26], [x + 34, GY + 10]], 6, '#2a2a3a'); seg(g, [[x + 156, GY - 26], [x + 156, GY + 10]], 6, '#2a2a3a');
    }
  });
  return { GY, rim: { color: '#fff1d6', dir: [-0.7, -0.7] }, M: mood('day') };
}
export function streetFgBlur(g, t, cam, o = {}) {
  const c = { ...cam, x: (cam.x || 0) - (o.scroll ?? 0) * 1.0 };
  blurLayer(g, 10, (g) => { for (let x = -E.W * 3; x < E.W * 5; x += 640) { circle(g, x, 1700, 200, '#2f7a3a'); circle(g, x + 180, 1740, 170, '#3a8a44'); seg(g, [[x + 380, 1500], [x + 380, 2000]], 40, '#2a2a3a'); } }, c, 1.6);
}

// ---------------------------------------------------------------- coast: the oceans keep going
export function coast(g, t, cam, o = {}) {
  const s = clamp(o.surge ?? 0), GY = 1180, seaY = 1000;
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, -200, 0, seaY, SKYC); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.sun(g, 760, 300, 64, '#fffaf0', '#ffe2a8', 3.5); });
  layer(g, cam, 0.15, (g) => drawClouds(g, t, { y: 150, n: 6, drift: 40 + s * 700, seed: 8 }));
  layer(g, cam, 0.4, (g) => {   // far ocean
    g.fillStyle = linGrad(g, 0, seaY - 40, 0, GY, ['#3a9ae0', '#1f6ab8']); g.fillRect(-E.W, seaY - 40, E.W * 3, GY);
    for (let i = 0; i < 26; i++) { const x = ((i * 157 + t * 40 * (1 + s * 12)) % (E.W * 1.6)) - E.W * 0.3, y = seaY - 20 + (i % 6) * 26; seg(g, [[x, y], [x + 50, y]], 4, alpha('#ffffff', 0.5)); }
  });
  layer(g, cam, 0.7, (g) => {   // lighthouse on a rock (bolted to bedrock: it stays)
    const lx = 860; poly(g, [[lx - 140, GY - 120], [lx - 60, GY - 210], [lx + 90, GY - 200], [lx + 160, GY - 120]], '#6a6058');
    poly(g, [[lx - 40, GY - 205], [lx - 26, GY - 560], [lx + 26, GY - 560], [lx + 40, GY - 205]], '#f4f0e8');
    for (let i = 0; i < 3; i++) poly(g, [[lx - 37 + i * 4.6, GY - 260 - i * 110], [lx - 33 + i * 4.6, GY - 310 - i * 110], [lx + 33 - i * 4.6, GY - 310 - i * 110], [lx + 37 - i * 4.6, GY - 260 - i * 110]], '#d4262e');
    rr(g, lx - 36, GY - 620, 72, 64, 8); g.fillStyle = '#2a2a3a'; g.fill(); circle(g, lx, GY - 590, 20, '#ffe2a8'); glow(g, lx, GY - 590, 120, '#ffe2a8', 0.5);
  });
  // the surge: a huge wave crest that rises and races RIGHT over the sea wall
  layer(g, cam, 0.9, (g) => {
    const crestX = lerp(-500, E.W + 300, ease.inOut(s)), h = lerp(40, 760, ease.out(clamp(s * 1.6)));
    g.fillStyle = linGrad(g, 0, GY - h, 0, GY + 200, ['#5ab8f0', '#1f6ab8', '#16508e']);
    g.beginPath(); g.moveTo(-E.W, GY + 300); g.lineTo(-E.W, GY - h * 0.55);
    for (let x = -E.W; x <= crestX; x += 30) { const k = (x - (-E.W)) / (crestX + E.W + 1); g.lineTo(x, GY - h * (0.55 + 0.45 * k * k) + Math.sin(x * 0.02 + t * 6) * 10); }
    g.quadraticCurveTo(crestX + 200, GY - h * 1.05, crestX + 240, GY - h * 0.7); g.quadraticCurveTo(crestX + 120, GY - h * 0.6, crestX + 260, GY + 300); g.closePath(); g.fill();
    // foam on the lip
    const fr = rng(5); for (let i = 0; i < 40; i++) { const a = fr() * Math.PI, rr2 = 60 + fr() * 120; circle(g, crestX + 160 + Math.cos(a) * rr2 * 0.6, GY - h * 0.9 - Math.sin(a) * rr2 * 0.4 + Math.sin(t * 8 + i) * 6, 10 + fr() * 22, alpha('#ffffff', 0.85)); }
    if (s > 0.02) for (let i = 0; i < 30; i++) { const p = (t * 1.5 + i / 30) % 1; circle(g, crestX + 200 + p * 500, GY - h * 0.9 - Math.sin(p * Math.PI) * 300 + i * 6, 6 + (i % 4) * 3, alpha('#e8f6ff', 0.8 * (1 - p))); }
  });
  layer(g, cam, 1, (g) => {   // promenade + sea wall + railing (front)
    g.fillStyle = '#c8bca8'; g.fillRect(-E.W, GY + 60, E.W * 3, 60); g.fillStyle = '#e8dcc4'; g.fillRect(-E.W, GY + 120, E.W * 3, E.H);
    for (let x = -E.W; x < E.W * 2; x += 90) seg(g, [[x, GY + 60], [x, GY - 30]], 8, '#2a2a3a'); seg(g, [[-E.W, GY - 30], [E.W * 2, GY - 30]], 10, '#2a2a3a'); seg(g, [[-E.W, GY + 15], [E.W * 2, GY + 15]], 6, '#2a2a3a');
  });
  return { GY, rim: { color: '#fff1d6', dir: [-0.7, -0.7] } };
}

// ---------------------------------------------------------------- air + debris
export function windStreaks(g, t, k, o = {}) {
  if (k <= 0) return; const r = rng(o.seed ?? 7), y0 = o.y0 ?? 0, y1 = o.y1 ?? E.H;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const sp = 1400 + r() * 1800, len = 120 + r() * 360, y = y0 + r() * (y1 - y0), x = ((r() * E.W * 2 + t * sp) % (E.W * 2)) - E.W * 0.5;
    g.strokeStyle = alpha('#ffffff', (0.25 + r() * 0.45) * k); g.lineWidth = 2 + r() * 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + Math.sin(i) * 6); g.stroke(); }
  g.restore();
}
export function flyingJunk(g, t, k, o = {}) {
  if (k <= 0) return; const r = rng(o.seed ?? 9), n = o.n ?? 26;
  for (let i = 0; i < n; i++) {
    const kind = i % 5, sp = 900 + r() * 1300, y = (o.y0 ?? 200) + r() * ((o.y1 ?? 1200) - (o.y0 ?? 200)), x = ((r() * E.W * 2 + t * sp) % (E.W * 2.2)) - E.W * 0.6, sp2 = t * (4 + r() * 8);
    g.save(); g.translate(x, y + Math.sin(sp2) * 30); g.rotate(sp2); g.globalAlpha *= k;
    if (kind === 0 || kind === 3) { g.fillStyle = ['#5cb85a', '#e0a830', '#c8503a'][i % 3]; g.beginPath(); g.ellipse(0, 0, 22, 10, 0, 0, 7); g.fill(); seg(g, [[-22, 0], [22, 0]], 2, alpha('#000', 0.3)); }
    else if (kind === 1) { g.fillStyle = '#f4f0e8'; g.fillRect(-26, -34, 52, 68); g.fillStyle = '#9aa4b8'; for (let j = 0; j < 4; j++) g.fillRect(-18, -22 + j * 12, 36, 4); }
    else if (kind === 2) { circle(g, 0, 0, 30, '#2f6fd0'); rr(g, -46, 4, 92, 12, 6); g.fillStyle = '#2f6fd0'; g.fill(); }   // a cap
    else { rr(g, -34, -6, 68, 12, 6); g.fillStyle = '#d4262e'; g.fill(); }
    g.restore();
  }
}

// ---------------------------------------------------------------- text helpers
export function bigNumber(g, t, str, x, y, at, o = {}) {
  const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; const size = o.size ?? 150;
  g.save(); g.translate(x, y); g.scale(p, p);
  glow(g, 0, 0, size * 3, '#ffd47e', 0.3);
  for (let i = 8; i > 0; i--) text(g, str, i * 1.2, i * 1.6, { size, font: FONTS.title, weight: 900, color: shade('#c8901e', -0.2 - i * 0.03) });
  text(g, str, 0, 0, { size, font: FONTS.title, weight: 900, color: '#ffd47e', stroke: 14, strokeColor: '#3a2408' });
  text(g, str, 0, 0, { size, font: FONTS.title, weight: 900, color: '#ffe8a8', glow: 18, glowColor: 'rgba(255,212,126,.8)' });
  if (o.sub) text(g, o.sub, 0, size * 0.78, { size: size * 0.32, font: FONTS.ui, weight: 900, color: '#fff1dc', stroke: 8, strokeColor: '#1a1408', spacing: 2 });
  g.restore();
}
export function punchFlash(g, t, at, a = 0.6) { const u = t - at; if (u < 0 || u > 0.15) return; g.fillStyle = alpha('#ffffff', a * (1 - u / 0.15)); g.fillRect(0, 0, E.W, E.H); }
export const HERO_RIM = { color: '#fff1d6', dir: [-0.7, -0.7] };
