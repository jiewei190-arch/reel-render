// kits/cozy/food.js — top-down food "money shot" helpers + small kitchen props.
//   tableTop(g)                         warm wood table seen from above (full stage)
//   panTop(g, cx, cy, r)                hot plate + pan from above; draw contents inside panClip()
//   friedRice(g, cx, cy, R, st, t)      layered pan contents; st = {butter, rice, spread, egg, scramble, scallion, ham, soy, cheese, melt, sesame, stir}
//   steam / sizzle / cheesePull / pour / bowl / spoon / spatula / egg / board / knife / scallion / hamSlice
import { PAL, C, shape, oval, dot, rbox, wline, tube, curve, sparkle, heart, at, ovalPts } from './base.js';
import { E, clamp, lerp, prog, ease, rng, noise, alpha, mix, linGrad, radGrad } from '/engine/core.js';

export function tableTop(g, o = {}) {
  const { color = PAL.woodLt, seed = 1 } = o;
  g.fillStyle = color; g.fillRect(-200, -200, E.W + 400, E.H + 400);
  const r = rng(seed);
  for (let x = -60; x < E.W + 120; x += 180) { wline(g, [[x, -100], [x + 10, E.H + 100]], { w: 4, line: 'rgba(120,70,40,.35)', seed: seed + x });
    for (let k = 0; k < 3; k++) { const yy = r() * E.H, xx = x + 40 + r() * 100; wline(g, [[xx, yy], [xx + 6, yy + 90 + r() * 120]], { w: 2.5, line: 'rgba(120,70,40,.18)', seed: seed + x + k }); } }
  for (let k = 0; k < 3; k++) { const xx = 100 + r() * 880, yy = 200 + r() * 1500; oval(g, xx, yy, 16, 9, { fill: null, w: 2.5, line: 'rgba(120,70,40,.28)', seed: 30 + k }); }
}
// pan from above. handle points along ang (default lower-left). Returns {r: inner radius}
export function panTop(g, cx, cy, r = 330, o = {}) {
  const { ang = 2.35, heat = 1, plate = true } = o;
  if (plate) { rbox(g, cx - r * 1.12, cy - r * 1.12, r * 2.24, r * 2.24, 60, { fill: '#f4efe6', seed: 300 }); for (const [dx, dy] of [[1, 1]]) oval(g, cx + dx * r * 0.98, cy + dy * r * 0.98, 26, 26, { fill: PAL.orangeDk, seed: 301 }); dot(g, cx - r * 0.98, cy + r * 0.98, 9, heat > 0.5 ? '#ff6a3a' : '#a89a8a'); }
  oval(g, cx + 10, cy + 16, r * 1.02, r * 1.02, { fill: 'rgba(60,35,20,.22)', line: false });
  const hx = cx + Math.cos(ang) * r * 0.95, hy = cy + Math.sin(ang) * r * 0.95;
  tube(g, [[hx, hy], [cx + Math.cos(ang) * r * 1.75, cy + Math.sin(ang) * r * 1.75]], 56, '#4a3a34', { seed: 302 });
  oval(g, cx, cy, r, r, { fill: '#5a4840', seed: 303 }); oval(g, cx, cy, r * 0.9, r * 0.9, { fill: '#3a2e2a', seed: 304, w: 4 });
  g.save(); g.globalAlpha = 0.18; oval(g, cx - r * 0.3, cy - r * 0.35, r * 0.35, r * 0.16, { fill: '#ffffff', line: false, rot: -0.6 }); g.restore();
  return { r: r * 0.9 };
}
export function panClip(g, cx, cy, r, fn) { g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip(); fn(g); g.restore(); }

// ---------------------------------------------------------------- pan contents
function discPts(n, R, seed, clumps = null, spread = 1) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R; let x = Math.cos(a) * d, y = Math.sin(a) * d;
    if (clumps && spread < 1) { const c = clumps[i % clumps.length], k = 1 - spread; const ca = r() * Math.PI * 2, cd = Math.sqrt(r()) * c[2]; x = lerp(x, c[0] + Math.cos(ca) * cd, k); y = lerp(y, c[1] + Math.sin(ca) * cd, k); }
    out.push([x, y, r() * Math.PI, r(), r()]);
  }
  return out;
}
const stirPts = (n, R, seedBase, stir, clumps, spread) => { const k0 = Math.floor(stir), f = ease.inOut(stir - k0); const A = discPts(n, R, seedBase + k0 * 31, clumps, spread), B = f > 0 ? discPts(n, R, seedBase + (k0 + 1) * 31, clumps, spread) : A; return A.map((p, i) => [lerp(p[0], B[i][0], f), lerp(p[1], B[i][1], f), lerp(p[2], B[i][2], f), p[3], p[4]]); };

export function friedRice(g, cx, cy, R, st = {}, t = 0) {
  const { butter = 0, melt = 0, rice = 0, spread = 1, egg = 0, scramble = 0, scallion = 0, ham = 0, soy = 0, cheese = 0, cheeseMelt = 0, sesame = 0, stir = 0, oil = 0 } = st;
  const RR = R * 0.84;
  g.save(); g.translate(cx, cy);
  // butter puddle + pat
  const puddle = Math.max(oil, melt * butter);
  if (puddle > 0) { g.save(); g.globalAlpha = 0.55 * puddle; oval(g, 0, 0, R * (0.25 + 0.55 * puddle), R * (0.22 + 0.52 * puddle), { fill: '#f6d36a', line: false, seed: 310 }); g.restore(); }
  if (butter > 0 && melt < 1) { const k = 1 - melt * 0.85, s = 70 * k * ease.outBack(clamp(butter)); rbox(g, 40 - s, -30 - s * 0.8, s * 2, s * 1.6, 18 * k + 4, { fill: '#fff0a6', seed: 311 }); g.save(); g.globalAlpha = 0.5; rbox(g, 40 - s * 0.6, -30 - s * 0.55, s * 0.7, s * 0.35, 6, { fill: '#ffffff', line: false }); g.restore(); }
  // raw egg (before scramble)
  const raw = egg * (1 - scramble);
  if (raw > 0) { g.save(); g.globalAlpha = raw; oval(g, -60, 40, 120 * clamp(egg * 1.4), 100 * clamp(egg * 1.4), { fill: '#fffdf6', seed: 312 }); oval(g, -50, 34, 42 * clamp(egg * 2), 40 * clamp(egg * 2), { fill: PAL.yolk, seed: 313 }); dot(g, -62, 22, 10, 'rgba(255,255,255,.8)'); g.restore(); }
  // rice grains
  const clumps = [[-90, -60, 110], [80, 40, 120], [-30, 110, 90]];
  if (rice > 0) {
    const n = Math.round(950 * clamp(rice)), P = stirPts(950, RR, 7, stir, clumps, spread);
    const fill = mix(PAL.rice, PAL.riceGold, clamp(soy * 0.9 + scramble * egg * 0.15)), edge = mix('#d8b896', '#a8763f', soy);
    if (rice > 0.3) { g.save(); g.globalAlpha = clamp((rice - 0.3) * 1.4) * (0.55 + 0.45 * spread); oval(g, 0, 0, RR * 0.98, RR * 0.98, { fill: mix('#efe2c8', '#d9a860', soy), line: false, seed: 314 }); g.restore(); }
    g.lineWidth = 2; g.strokeStyle = edge; g.fillStyle = fill;
    const bj = rng(boilSeed());
    for (let i = 0; i < n; i++) { const [x, y, a] = P[i]; g.beginPath(); g.ellipse(x + (bj() - 0.5) * 1.6, y + (bj() - 0.5) * 1.6, 12, 6.4, a, 0, Math.PI * 2); g.fill(); g.stroke(); }
    // soy-browned specks
    if (soy > 0) { g.save(); g.globalAlpha = 0.5 * soy; const S = stirPts(60, RR * 0.95, 401, stir, null, 1); for (const [x, y] of S) { g.fillStyle = PAL.soy; g.beginPath(); g.ellipse(x, y, 9, 5, x, 0, Math.PI * 2); g.fill(); } g.restore(); }
  }
  // scrambled egg bits
  if (egg > 0 && scramble > 0) {
    const B = stirPts(46, RR * 0.92, 501, stir, null, 1), n = Math.round(46 * clamp(scramble * 1.2));
    for (let i = 0; i < n; i++) { const [x, y, a, q] = B[i]; const s = (14 + q * 14) * clamp(scramble * 1.5); oval(g, x, y, s * 1.3, s, { fill: q > 0.7 ? '#fff6d8' : PAL.yolk, rot: a, w: 3, seed: 520 + i }); }
  }
  // ham cubes
  if (ham > 0) { const H = stirPts(28, RR * 0.9, 601, stir, null, 1), n = Math.round(28 * clamp(ham)); for (let i = 0; i < n; i++) { const [x, y, a] = H[i]; const s = 15 * ease.outBack(clamp(ham * 28 - i)); g.save(); g.translate(x, y); g.rotate(a); rbox(g, -s, -s, s * 2, s * 2, 6, { fill: PAL.ham, w: 3, seed: 620 + i }); g.restore(); } }
  // scallion rings
  if (scallion > 0) { const S = stirPts(40, RR * 0.92, 701, stir, null, 1), n = Math.round(40 * clamp(scallion)); for (let i = 0; i < n; i++) { const [x, y, a, q] = S[i]; const s = 11 * ease.outBack(clamp(scallion * 40 - i)); oval(g, x, y, s, s * 0.9, { fill: q > 0.4 ? PAL.scallion : '#d9f0b8', w: 3, rot: a, seed: 720 + i }); dot(g, x, y, s * 0.4, '#eaf7d0'); } }
  // cheese slice melting on top
  if (cheese > 0) meltSlice(g, 0, -10, R * 0.36, cheeseMelt, ease.outBack(clamp(cheese)));
  // sesame
  if (sesame > 0) { const S = discPts(80, RR * 0.95, 801), n = Math.round(80 * clamp(sesame)); for (let i = 0; i < n; i++) { const [x, y, a] = S[i]; g.save(); g.fillStyle = i % 5 ? PAL.sesame : '#3a2a22'; g.strokeStyle = 'rgba(91,58,41,.6)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, 5.5, 3, a, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); } }
  g.restore();
}
const boilSeed = () => Math.floor(C.now * C.boilFps + 1e-6) % C.boilN + 911;

// a cheese slice (square, side 2*h) that droops into a glossy puddle as melt -> 1. k = scale (drop-in)
export function meltSlice(g, x, y, h, melt = 0, k = 1, o = {}) {
  const { rot = 0.18 } = o; const P = [], n = 40;
  for (let i = 0; i < n; i++) {
    const u = i / n * 4, side = Math.floor(u), f = u - side;
    let px, py; if (side === 0) { px = lerp(-h, h, f); py = -h; } else if (side === 1) { px = h; py = lerp(-h, h, f); } else if (side === 2) { px = lerp(h, -h, f); py = h; } else { px = -h; py = lerp(h, -h, f); }
    const a = Math.atan2(py, px), d = Math.hypot(px, py), circ = h * 1.08;
    const dd = lerp(d, circ, melt * 0.75) + melt * h * 0.22 * (0.5 + 0.5 * Math.sin(a * 5 + 1.3)) + melt * h * 0.12 * Math.max(0, Math.sin(a * 3 + 0.4));
    P.push([Math.cos(a + rot) * dd * k, Math.sin(a + rot) * dd * k]);
  }
  g.save(); g.translate(x, y);
  shape(g, P, { fill: PAL.cheese, step: 1e9, seed: 330 });
  g.save(); g.globalAlpha = 0.35 + melt * 0.25; for (const [dx, dy, l] of [[-0.4, -0.45, 0.45], [0.15, -0.2, 0.3], [-0.2, 0.25, 0.25]]) tube(g, [[dx * h * k, dy * h * k], [(dx + l) * h * k, (dy - l * 0.3) * h * k]], 12 * k, '#fff4c2', { line: false, seed: 331 + dx * 10 }); g.restore();
  if (melt > 0.3) for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.4, d = h * (1.15 + 0.25 * melt) * k; oval(g, Math.cos(a) * d, Math.sin(a) * d, 14 * melt, 12 * melt, { fill: PAL.cheese, w: 3.5, seed: 340 + i }); }
  g.restore();
}
// rising steam wisps. x,y = base
export function steam(g, x, y, t, o = {}) {
  const { n = 3, h = 320, spread = 140, a = 0.5, w = 26, speed = 0.5, seed = 1 } = o;
  for (let i = 0; i < n; i++) {
    const bx = x + (i - (n - 1) / 2) * spread / Math.max(1, n - 1) * 2 * 0.5;
    for (let seg = 0; seg < 2; seg++) {
      const ph = ((t * speed + i * 0.37 + seg * 0.5 + seed * 0.13) % 1), y0 = y - ph * h, len = h * 0.42;
      const P = []; for (let k = 0; k <= 8; k++) { const yy = y0 - k * len / 8; P.push([bx + Math.sin(yy * 0.022 + t * 1.8 + i * 2) * 22, yy]); }
      const fade = Math.sin(ph * Math.PI);
      tube(g, P, w * (1 - ph * 0.5), `rgba(255,255,255,${(a * fade).toFixed(3)})`, { line: false, seed: 350 + i + seg * 7 });
    }
  }
}
// sizzle bubbles + oil sparkles inside a circle (cx,cy,R). k = intensity 0..1
export function sizzle(g, cx, cy, R, t, k = 1, o = {}) {
  if (k <= 0) return; const { n = 40, seed = 3 } = o; const N = Math.round(n * k);
  for (let i = 0; i < N; i++) {
    const life = 0.35 + (i % 5) * 0.08, cyc = Math.floor((t + i * 0.137) / life), ph = ((t + i * 0.137) / life) % 1;
    const r = rng(seed * 101 + i * 7 + cyc * 13), a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.95, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    const s = (3 + r() * 7) * Math.sin(ph * Math.PI);
    g.save(); g.strokeStyle = `rgba(255,250,230,${(0.85 * (1 - ph)).toFixed(3)})`; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.stroke(); g.restore();
    if (i % 6 === 0 && ph > 0.7) sparkle(g, x, y - 6, 9 * (1 - ph) * 3, '#fffbe8', { line: false });
  }
}
// oil-spit droplets jumping out of a pan
export function spits(g, cx, cy, R, t, k = 1) {
  for (let i = 0; i < Math.round(8 * k); i++) { const per = 0.5 + i * 0.05, ph = ((t + i * 0.23) / per) % 1, cyc = Math.floor((t + i * 0.23) / per), r = rng(i * 17 + cyc * 3);
    const a = r() * Math.PI * 2, d = R * (0.7 + ph * 0.5), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d - Math.sin(ph * Math.PI) * 30; dot(g, x, y, 4 * (1 - ph) + 1, `rgba(255,236,170,${(1 - ph).toFixed(3)})`); }
}
// a stretchy ribbon (cheese pull): polygon around a centre line, half-width hw(u)
export function ribbon(g, pts, hw, fill, o = {}) {
  const L = [], Rr = [];
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], pr = pts[Math.max(0, i - 1)]; const dx = q[0] - pr[0], dy = q[1] - pr[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = hw(i / (pts.length - 1)); L.push([p[0] + nx * w, p[1] + ny * w]); Rr.push([p[0] - nx * w, p[1] - ny * w]); }
  shape(g, [...L, ...Rr.reverse()], { fill, step: 1e9, ...o });
}
// cheese pull between (x0,y0) (spoon) and (x1,y1) (bowl). k 0..1 stretch amount (thins + sags)
export function cheesePull(g, x0, y0, x1, y1, k = 1, o = {}) {
  const { strands = 4, width = 46, t = C.now } = o;
  for (let s = 0; s < strands; s++) {
    const off = (s - (strands - 1) / 2) * width * 0.42, sag = 30 + 60 * k + s * 8, mx = (x0 + x1) / 2 + off * 0.6 + Math.sin(t * 3 + s) * 6, my = (y0 + y1) / 2 + sag * 0.3;
    const P = curve([[x0 + off * 0.5, y0], [mx + sag * 0.4, my], [x1 + off, y1]], 14);
    const thin = 1 - 0.8 * k * (s % 2 ? 1 : 0.7);
    ribbon(g, P, (u) => (width * 0.2) * (1 - Math.sin(u * Math.PI) * 0.75 * (0.6 + 0.4 * k)) + 2, s % 2 ? PAL.cheese : '#ffd25a', { w: 4, seed: 360 + s });
  }
}
// liquid stream (soy sauce, milk) from (x0,y0) to (x1,y1)
export function pour(g, x0, y0, x1, y1, w = 14, color = PAL.soy, t = C.now) {
  const P = []; for (let k = 0; k <= 10; k++) { const u = k / 10; P.push([lerp(x0, x1, u) + Math.sin(u * 9 + t * 20) * 3 * u, lerp(y0, y1, u * u * 0.4 + u * 0.6)]); }
  tube(g, P, w, color, { seed: 370 });
}

// ---------------------------------------------------------------- props
// bowl in 3/4 view. contents: 'rice' | 'empty' | fn(g) drawn clipped to the opening (local: centre 0,0, rx 150 ry 46)
export function bowl(g, x, y, s = 1, o = {}) {
  const { contents = 'empty', color = PAL.cream, band = PAL.sage, t = C.now, cheese = 1 } = o;
  at(g, x, y, s, (g) => {
    shape(g, [[-150, 0], [150, 0], [120, 90], [60, 130], [-60, 130], [-120, 90]], { fill: color, step: 28, seed: 380 });
    wline(g, [[-136, 50], [136, 50]], { w: 10, line: band, seed: 381 }); rbox(g, -56, 124, 112, 22, 8, { fill: mix(color, '#7a4a30', 0.1), seed: 382 });
    oval(g, 0, 0, 150, 46, { fill: '#efe2cc', seed: 383 });
    if (contents === 'rice') { g.save(); g.beginPath(); g.ellipse(0, 0, 146, 44, 0, 0, Math.PI * 2); g.rect(-160, -200, 320, 200); g.clip();
      shape(g, [[-140, 6], [-100, -46], [-30, -70], [40, -66], [110, -40], [140, 6]], { fill: PAL.riceGold, step: 20, seed: 384 });
      const r = rng(9); for (let i = 0; i < 46; i++) { const xx = -120 + r() * 240, yy = -50 + r() * 50 + Math.abs(xx) * 0.18; g.fillStyle = r() < 0.15 ? PAL.yolk : r() < 0.25 ? PAL.scallion : r() < 0.33 ? PAL.ham : '#fff3d6'; g.strokeStyle = 'rgba(91,58,41,.5)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(xx, yy, 9, 5, r() * 3, 0, Math.PI * 2); g.fill(); g.stroke(); }
      if (cheese > 0) shape(g, [[-70, -50], [-10, -72], [60, -58], [80, -30], [40, -8], [10, 10], [-30, -8], [-80, -20]], { fill: PAL.cheese, step: 16, seed: 385, a: cheese });
      g.restore(); }
    else if (typeof contents === 'function') { g.save(); g.beginPath(); g.ellipse(0, 0, 146, 44, 0, 0, Math.PI * 2); g.clip(); contents(g); g.restore(); }
    else oval(g, 0, 6, 120, 30, { fill: '#e4d3b8', line: false, seed: 386 });
  });
}
export function spoon(g, x, y, s = 1, rot = 0, o = {}) {
  const { heap = false } = o;
  at(g, x, y, s, (g) => { tube(g, [[0, 30], [0, 190]], 20, '#e9e4dc', { seed: 390 }); oval(g, 0, 0, 44, 56, { fill: '#f2eee8', seed: 391 });
    if (heap) { shape(g, [[-40, -6], [-24, -46], [6, -58], [34, -40], [42, -4], [0, 14]], { fill: PAL.riceGold, step: 14, seed: 392 }); shape(g, [[-26, -30], [10, -52], [34, -24], [8, -10]], { fill: PAL.cheese, step: 12, seed: 393 }); dot(g, -14, -18, 6, PAL.scallion); dot(g, 18, -34, 5, PAL.ham); } }, { rot });
}
export function spatula(g, x, y, s = 1, rot = 0) { at(g, x, y, s, (g) => { tube(g, [[0, 40], [0, 260]], 26, PAL.woodDk, { seed: 395 }); rbox(g, -56, -70, 112, 120, 22, { fill: '#f6c28a', seed: 396 }); for (const dx of [-22, 0, 22]) wline(g, [[dx, -50], [dx, 24]], { w: 5, seed: 397 + dx }); }, { rot }); }
// egg: crack 0..1 shows the zigzag crack; split 0..1 pulls the halves apart (yolk falls from between)
export function egg(g, x, y, s = 1, o = {}) {
  const { crack = 0, split = 0, rot = 0 } = o;
  at(g, x, y, s, (g) => {
    if (split <= 0) { oval(g, 0, 0, 62, 78, { fill: PAL.egg, seed: 400 }); g.save(); g.globalAlpha = 0.5; oval(g, -18, -30, 14, 22, { fill: '#ffffff', line: false, rot: 0.3 }); g.restore();
      if (crack > 0) { const P = []; const n = Math.round(8 * crack); for (let i = 0; i <= n; i++) P.push([-58 + i * 14.5, -6 + (i % 2 ? -12 : 10)]); if (P.length > 1) wline(g, P, { w: 5, seed: 401 }); } return; }
    const d = split * 70;
    g.save(); g.translate(-d, -d * 0.2); g.rotate(-split * 0.7); shape(g, [...ovalPts(0, 0, 62, 78).filter(([px, py]) => py <= 4), [62, 4], [40, -8], [20, 8], [0, -6], [-20, 8], [-40, -6], [-62, 4]], { fill: PAL.egg, step: 1e9, seed: 402 }); g.restore();
    g.save(); g.translate(d, d * 0.2); g.rotate(split * 0.7); shape(g, [[-62, 4], [-40, -8], [-20, 8], [0, -6], [20, 8], [40, -6], [62, 4], ...ovalPts(0, 0, 62, 78).filter(([px, py]) => py > 4)], { fill: PAL.egg, step: 1e9, seed: 403 }); g.restore();
  }, { rot });
}
export function board(g, x, y, w, h) { rbox(g, x, y, w, h, 40, { fill: '#e9c08f', seed: 410 }); rbox(g, x + w - 10, y + h / 2 - 40, 90, 80, 36, { fill: '#e9c08f', seed: 411 }); dot(g, x + w + 46, y + h / 2, 14, '#c99a6a'); for (let i = 1; i < 4; i++) wline(g, [[x + 30, y + i * h / 4], [x + w - 30, y + i * h / 4 + 6]], { w: 3, line: 'rgba(120,70,40,.25)', seed: 412 + i }); }
export function knife(g, x, y, s = 1, rot = 0) { at(g, x, y, s, (g) => { shape(g, [[-20, -240], [24, -250], [26, 0], [-20, 0]], { fill: '#eef1f2', step: 40, seed: 415 }); g.save(); g.globalAlpha = 0.5; wline(g, [[16, -230], [18, -10]], { w: 4, line: '#ffffff', seed: 416 }); g.restore(); rbox(g, -24, 0, 50, 150, 16, { fill: PAL.sageDk, seed: 417 }); dot(g, 1, 40, 6, PAL.cream); dot(g, 1, 100, 6, PAL.cream); }, { rot }); }
// scallion stalk lying horizontally from x to x+len (cut 0..1 = fraction already chopped from the right end)
export function scallionStalk(g, x, y, len = 520, cut = 0) {
  const L = len * (1 - cut); if (L > 20) { tube(g, [[x, y], [x + L, y]], 34, PAL.scallion, { seed: 420 }); tube(g, [[x, y], [x + Math.min(L, 120), y]], 34, '#f4f8e6', { seed: 421 }); for (let i = 1; i < 4; i++) wline(g, [[x + 130 + i * 60, y - 6], [x + 160 + i * 60, y - 6]], { w: 3, line: 'rgba(40,90,40,.45)', seed: 422 + i }); }
  const n = Math.floor(cut * 22); const r = rng(5); for (let i = 0; i < n; i++) { const px = x + L + 30 + (i % 6) * 26 + r() * 10, py = y - 30 + Math.floor(i / 6) * 26 + r() * 10; oval(g, px, py, 12, 11, { fill: PAL.scallion, w: 3, seed: 430 + i }); dot(g, px, py, 5, '#e6f5c6'); }
}
export function hamSlice(g, x, y, r = 120, o = {}) { oval(g, x, y, r, r * 0.94, { fill: PAL.ham, seed: 440, ...o }); oval(g, x, y, r * 0.85, r * 0.8, { fill: null, w: 4, line: '#fbd0d4', seed: 441 }); for (let i = 0; i < 5; i++) dot(g, x + Math.cos(i * 1.3) * r * 0.5, y + Math.sin(i * 2.1) * r * 0.4, 6, '#fbd0d4'); }
export function cheeseSlice(g, x, y, s = 160, rot = 0.1) { g.save(); g.translate(x, y); g.rotate(rot); rbox(g, -s / 2, -s / 2, s, s, 10, { fill: PAL.cheese, seed: 445 }); g.save(); g.globalAlpha = 0.4; tube(g, [[-s * 0.3, -s * 0.3], [s * 0.1, -s * 0.36]], 10, '#fff4c2', { line: false }); g.restore(); g.restore(); }
