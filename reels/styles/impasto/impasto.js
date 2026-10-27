// IMPASTO vertical module (1080x1920 world, canvas 2D). Technique ported from the idea of palette-knife oil painting:
// flat, sharp-edged knife strokes with drag striations, a lit ridge on the upper-left edge, a shadow ridge on the lower-right
// edge and a small cast shadow so every stroke reads as thick paint. Everything is deterministic (seeded) for window.seek(t).
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const eo = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
export const backOut = x => { x = clamp(x); const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export function rng(seed) { let a = (seed * 2654435761) >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const hash = n => { const r = rng(Math.floor(n * 977) + 13); return r(); };

const cc = new Map();
function parse(c) {
  let v = cc.get(c); if (v) return v;
  if (c[0] === '#') { let h = c.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join(''); v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  else v = [128, 128, 128];
  cc.set(c, v); return v;
}
const hex = v => '#' + v.map(x => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join('');
// shade(col, k): k>0 lighten toward white-warm, k<0 darken toward cool-dark (painters shift hue, not just value)
export function shade(c, k) { const v = parse(c); if (k >= 0) return hex(v.map((x, i) => x + (255 - x) * k * (i === 2 ? .85 : 1))); return hex(v.map((x, i) => x * (1 + k * (i === 0 ? 1.0 : i === 1 ? .92 : .8)))); }
export function mix(a, b, k) { const A = parse(a), B = parse(b); return hex(A.map((x, i) => lerp(x, B[i], k))); }
export function rgba(c, a) { const v = parse(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; }

export const PAL = {
  ink: '#2a2438', cream: '#f4e9d2', paper: '#f1e6cc',
  red: '#e0412f', orange: '#f28a2a', yellow: '#f7d23e', green: '#58b85c', blue: '#3a82d6', indigo: '#4b47b5', violet: '#8c52c4',
  coral: '#e4572e', sun: '#ffc93c', sunHot: '#ffe27a', rain: '#6fa1c9', rainPale: '#bcd6ea', deep: '#1e2a4d', teal: '#2f5d68', plum: '#5a3a4a',
  grass: '#8fb456', grass2: '#6f9a48', hill: '#6f9a78', win: '#ffcf66', white: '#fbf8ef'
};
export const BOW = [PAL.red, PAL.orange, PAL.yellow, PAL.green, PAL.blue, PAL.indigo, PAL.violet]; // outside -> inside

const LX = -0.6, LY = -0.8; // light comes from the upper-left (unit-ish)

// ---- one knife stroke: tilted flat quad, drag striations, lit/shadow ridges, cast shadow ----
export function knife(g, x, y, len, wid, ang, col, seed = 1, o = {}) {
  const r = rng(seed), ca = Math.cos(ang), sa = Math.sin(ang), hl = len / 2, hw = wid / 2, j = () => r() - .5;
  const loc = [[-hl + j() * wid * .45, -hw + j() * wid * .16], [hl + j() * wid * .55, -hw + j() * wid * .22], [hl + j() * wid * .55, hw + j() * wid * .22], [-hl + j() * wid * .45, hw + j() * wid * .16]];
  const P = loc.map(([u, v]) => [x + u * ca - v * sa, y + u * sa + v * ca]);
  const al = o.a == null ? 1 : o.a;
  g.save(); if (al < 1) g.globalAlpha = al;
  if (!o.noShadow) { g.fillStyle = 'rgba(10,8,30,.2)'; g.beginPath(); g.moveTo(P[0][0] + 2.5, P[0][1] + 3.5); for (let i = 1; i < 4; i++) g.lineTo(P[i][0] + 2.5, P[i][1] + 3.5); g.closePath(); g.fill(); }
  g.fillStyle = col; g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < 4; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); g.fill();
  if (!o.flat) {
    // drag striations along the stroke direction
    const n = clamp(Math.round(wid / 6), 2, 8); g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const v = (r() - .5) * wid * .86, u1 = -hl * (.5 + r() * .5), u2 = hl * (.3 + r() * .7), k = (r() - .5) * .3;
      g.strokeStyle = shade(col, k); g.globalAlpha = al * (.35 + r() * .35); g.lineWidth = 1 + r() * 2.4;
      g.beginPath(); g.moveTo(x + u1 * ca - v * sa, y + u1 * sa + v * ca); g.lineTo(x + u2 * ca - v * sa, y + u2 * sa + v * ca); g.stroke();
    }
    g.globalAlpha = al;
    // ridges: lit edges bright, far edges dark
    const cx = (P[0][0] + P[1][0] + P[2][0] + P[3][0]) / 4, cy = (P[0][1] + P[1][1] + P[2][1] + P[3][1]) / 4;
    const lit = shade(col, .38), dk = shade(col, -.34); g.lineWidth = o.ridge || 2.6; g.lineJoin = 'round'; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = P[i], b = P[(i + 1) % 4], ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey) || 1; let nx = ey / L, ny = -ex / L;
      if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
      const d = nx * LX + ny * LY;
      if (d > .3) { g.strokeStyle = lit; g.globalAlpha = al * clamp(.35 + d * .6, 0, .9); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      else if (d < -.3) { g.strokeStyle = dk; g.globalAlpha = al * clamp(.3 - d * .55, 0, .8); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    }
  }
  g.restore();
}

function polyPath(g, poly) { g.beginPath(); g.moveTo(poly[0][0], poly[0][1]); for (let i = 1; i < poly.length; i++) g.lineTo(poly[i][0], poly[i][1]); g.closePath(); }
// ---- a big flat plane of paint built from many overlapping knife strokes, clipped to a polygon, crisp ridged edge ----
export function plane(g, poly, col, o = {}) {
  const { ang = 0, len = 130, wid = 42, seed = 1, vary = .09, density = 1.35, edge = true } = o;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, ar = 0;
  poly.forEach(([x, y], i) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); const q = poly[(i + 1) % poly.length]; ar += x * q[1] - q[0] * y; });
  ar = Math.abs(ar) / 2; const bw = x1 - x0, bh = y1 - y0; if (bw <= 0 || bh <= 0) return;
  g.save(); polyPath(g, poly); g.clip(); g.fillStyle = shade(col, -.06); g.fillRect(x0 - 2, y0 - 2, bw + 4, bh + 4);
  const r = rng(seed), n = Math.ceil((bw * bh) / (len * wid) * density * 1.2) + 2;
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * bw, y = y0 + r() * bh, k = (r() - .5) * 2 * vary;
    knife(g, x, y, len * (.65 + .7 * r()), wid * (.7 + .6 * r()), ang + (r() - .5) * .2, shade(col, k), seed * 7919 + i, o.knife || {});
  }
  g.restore();
  if (edge) { // sharp lit/shadow ridge on the plane's outline
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = o.edgeW || 3.2;
    const cx = x0 + bw / 2, cy = y0 + bh / 2;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey) || 1; let nx = ey / L, ny = -ex / L;
      if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
      const d = nx * LX + ny * LY; if (Math.abs(d) < .25) continue;
      g.strokeStyle = d > 0 ? shade(col, .34) : shade(col, -.36); g.globalAlpha = clamp(.3 + Math.abs(d) * .55, 0, .85); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    g.restore();
  }
}
export const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export function circlePoly(cx, cy, rx, ry = rx, n = 28, rot = 0, wob = 0, seed = 1) { const r = rng(seed), a = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, k = 1 + (r() - .5) * wob; a.push([cx + Math.cos(t + rot) * rx * k, cy + Math.sin(t + rot) * ry * k]); } return a; }
export const disc = (g, cx, cy, r, col, o = {}) => plane(g, circlePoly(cx, cy, r, o.ry || r, o.n || 26, 0, o.wob || .03, (o.seed || 1) + 5), col, { len: Math.max(30, r * .7), wid: Math.max(14, r * .28), ang: o.ang || -.5, density: 1.6, ...o });

// ---- a path made of overlapping dabs: rays, rain, arcs. from/to are arc-length fractions so lines can "draw on" ----
export function pathLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
export function ribbon(g, pts, wid, col, seed = 1, o = {}) {
  const from = o.from || 0, to = o.to == null ? 1 : o.to; if (to <= from) return;
  const L = pathLen(pts), step = (o.step || wid * .5), N = Math.max(1, Math.floor(L / step)), r = rng(seed);
  let seg0 = 0, acc = 0; const cum = [0]; for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(acc); }
  for (let k = 0; k <= N; k++) {
    const u = k / N, jr = r(), jv = r(), ja = r(); if (u < from - 1e-6 || u > to + 1e-6) continue;
    const d = u * L; while (seg0 < pts.length - 2 && cum[seg0 + 1] < d) seg0++;
    const a = pts[seg0], b = pts[seg0 + 1], sl = cum[seg0 + 1] - cum[seg0] || 1, f = clamp((d - cum[seg0]) / sl), x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const off = (jr - .5) * wid * .18;
    knife(g, x - Math.sin(ang) * off, y + Math.cos(ang) * off, (o.len || wid * 1.7) * (.85 + .3 * jv), wid * (o.thin || .9) * (.9 + .2 * jr), ang + (ja - .5) * .1, shade(col, (jv - .5) * (o.vary == null ? .12 : o.vary)), seed * 131 + k, o.knife || { noShadow: o.noShadow });
  }
}
export function arcPts(cx, cy, R, a0, a1, n = 80) { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); } return p; }

export function createIM(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const g = canvas.getContext('2d');
  const layer = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, g: c.getContext('2d') }; };
  const store = new Map();
  const cache = (key, w, h, fn) => { let L = store.get(key); if (!L) { L = layer(w, h); fn(L.g, L); store.set(key, L); } return L; };
  const measure = (s, size, fam, italic, weight) => { g.save(); g.font = `${italic ? 'italic ' : ''}${weight || 600} ${size}px "${fam}"`; const w = g.measureText(s).width; g.restore(); return w; };
  return { g, layer, cache, measure, begin() { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H); }, finish() { } };
}
