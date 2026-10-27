// kit_heatwave.js — the "Japan 2026 Heat Wave Visualization" look (awesome-opus-5-5-video-styles, handdrawn.md,
// still 2103678647777230877), packaged for 1080x1920 reels.
// No source code was published for that piece, so this kit rebuilds it from the reference still and its brief:
//   "hand-drawn pencil style with a little bit of tasteful chromatic aberration ... a bit of a pastiche look".
// Rules every reel in this style follows:
//   - cream archival paper with grain, mottling and vignette; crop marks and registration targets at the edges
//   - an issue header in small mono caps ("NO. 04 — JULY 21–25") with a Japanese tag, a thin rule, a mono footer
//   - the headline written in an italic hand, wiped on left to right
//   - every drawing is graphite pencil: textured strokes that draw on, overshoot their ends, and re-jitter at 8 fps
//   - accents only in red pencil / red rubber stamp; tear-off calendar cards with red header strips
//   - all ink sits on one layer that gets a red/cyan chromatic aberration split (spikes on page changes)
//   - a slow hand-held drift, film grain that changes every frame
export const W = 1080, H = 1920;
export const PAL = {
  paper: '#ebe2cd', card: '#f4eedf', ink: '#2a2623', red: '#c23b2b',
  soft: 'rgba(42,38,35,0.38)', faint: 'rgba(42,38,35,0.16)',
};
export const BOIL = 8;                       // pencil re-jitter rate (drawings per second)
export const F = { hand: 'HWHand', mono: 'HWMono', type: 'HWType', jp: '"Noto Serif CJK JP", "Noto Sans CJK JP", serif' };

// ------------------------------------------------------------ math
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const sstep = (a, b, x) => { const t = inv(a, b, x); return t * t * (3 - 2 * t); };
export const E = {
  out3: (t) => 1 - Math.pow(1 - clamp(t), 3),
  io3: (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  outBack: (t, s = 1.7) => { t = clamp(t); return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
};
export function hs(...a) {
  let h = 2166136261 >>> 0;
  for (const v of a) { h = Math.imul(h ^ ((Math.round(v * 997) | 0) >>> 0), 16777619) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15; }
  return (h >>> 0) / 4294967296;
}
const hn = (...a) => hs(...a) * 2 - 1;

// ------------------------------------------------------------ frame state
let BF = 0, T = 0;                          // boil frame, time
export const boilFrame = () => BF;

// ------------------------------------------------------------ canvases
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const INKC = mk(W, H); const INK = INKC.getContext('2d');
const TINTC = mk(W, H); const TINT = TINTC.getContext('2d');
let PAPER = null, GRAIN = [], GRAPH = null, REDP = null;

function noiseTile(n, r, g, b, a0, a1, seed) {
  const c = mk(n, n), x = c.getContext('2d'), im = x.createImageData(n, n);
  for (let i = 0; i < n * n; i++) {
    const v = hs(seed, i);
    im.data[i * 4] = r; im.data[i * 4 + 1] = g; im.data[i * 4 + 2] = b; im.data[i * 4 + 3] = Math.round(255 * (a0 + (a1 - a0) * v * v));
  }
  x.putImageData(im, 0, 0); return c;
}
export function init() {
  // graphite and red-pencil textures: strokes are filled with grainy pigment, not flat colour
  GRAPH = INK.createPattern(noiseTile(192, 42, 38, 35, 0.35, 1, 11), 'repeat');
  REDP = INK.createPattern(noiseTile(192, 194, 59, 43, 0.4, 1, 12), 'repeat');
  // paper: base, low-frequency mottling, fibres, fine tooth, vignette
  PAPER = mk(Math.round(W * 1.04), Math.round(H * 1.04));
  const p = PAPER.getContext('2d'), PW = PAPER.width, PH = PAPER.height;
  p.fillStyle = PAL.paper; p.fillRect(0, 0, PW, PH);
  for (let k = 0; k < 140; k++) {
    const x = hs(k, 1) * PW, y = hs(k, 2) * PH, r = 60 + hs(k, 3) * 260;
    const g = p.createRadialGradient(x, y, 0, x, y, r);
    const dark = hs(k, 4) > 0.5;
    g.addColorStop(0, dark ? 'rgba(150,120,80,0.05)' : 'rgba(255,250,235,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    p.fillStyle = g; p.fillRect(x - r, y - r, r * 2, r * 2);
  }
  p.strokeStyle = 'rgba(120,100,70,0.07)'; p.lineWidth = 1;
  for (let k = 0; k < 900; k++) {
    const x = hs(k, 7) * PW, y = hs(k, 8) * PH, a = hs(k, 9) * 6.3, l = 4 + hs(k, 10) * 14;
    p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 2, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke();
  }
  p.globalCompositeOperation = 'multiply';
  p.fillStyle = p.createPattern(noiseTile(256, 120, 100, 70, 0, 0.16, 13), 'repeat'); p.fillRect(0, 0, PW, PH);
  const vg = p.createRadialGradient(PW / 2, PH / 2, PW * 0.35, PW / 2, PH / 2, PH * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(110,80,40,0.28)');
  p.fillStyle = vg; p.fillRect(0, 0, PW, PH);
  p.globalCompositeOperation = 'source-over';
  for (let k = 0; k < 4; k++) GRAIN.push(noiseTile(256, 30, 25, 20, 0, 0.11, 40 + k));
}

// ------------------------------------------------------------ frame: begin / camera / end
// cam: { x, y, s, r } hand-held drift; ca: chromatic aberration in px
export function begin(t) {
  T = t; BF = Math.floor(t * BOIL);
  INK.setTransform(1, 0, 0, 1, 0, 0); INK.clearRect(0, 0, W, H);
}
export function drift(t, amt = 1) {
  return { x: Math.sin(t * 0.31) * 5 * amt + Math.sin(t * 0.83) * 2 * amt, y: Math.cos(t * 0.23) * 6 * amt, s: 1 + 0.006 * Math.sin(t * 0.17), r: 0.0018 * Math.sin(t * 0.13) * amt };
}
export function applyCam(c, cam) {
  c.translate(W / 2 + cam.x, H / 2 + cam.y); c.rotate(cam.r); c.scale(cam.s, cam.s); c.translate(-W / 2, -H / 2);
}
export function ink() { return INK; }
export function end(main, cam, ca = 2.5) {
  main.setTransform(1, 0, 0, 1, 0, 0);
  main.drawImage(PAPER, (W - PAPER.width) / 2 + cam.x * 0.6, (H - PAPER.height) / 2 + cam.y * 0.6);
  // chromatic aberration: red and cyan copies of the ink layer, offset in opposite directions, multiplied in
  const split = (col, dx, dy, a) => {
    TINT.setTransform(1, 0, 0, 1, 0, 0); TINT.globalCompositeOperation = 'source-over'; TINT.clearRect(0, 0, W, H);
    TINT.drawImage(INKC, 0, 0); TINT.globalCompositeOperation = 'source-in'; TINT.fillStyle = col; TINT.fillRect(0, 0, W, H);
    main.globalAlpha = a; main.globalCompositeOperation = 'multiply'; main.drawImage(TINTC, dx, dy);
  };
  split('#ff3b30', ca, ca * 0.25, 0.55);
  split('#00b7c8', -ca, -ca * 0.25, 0.5);
  main.globalAlpha = 1; main.globalCompositeOperation = 'source-over';
  main.drawImage(INKC, 0, 0);
  // film grain, a new tile placement every frame
  const g = GRAIN[Math.floor(T * 30) % 4];
  main.globalCompositeOperation = 'multiply'; main.globalAlpha = 0.9;
  main.fillStyle = main.createPattern(g, 'repeat');
  main.save(); main.translate(-hs(Math.floor(T * 30), 1) * 256, -hs(Math.floor(T * 30), 2) * 256); main.fillRect(0, 0, W + 256, H + 256); main.restore();
  main.globalAlpha = 1; main.globalCompositeOperation = 'source-over';
}

// ------------------------------------------------------------ geometry
export function resample(P, step = 5, closed = false) {
  const src = closed ? [...P, P[0]] : P, out = [src[0]];
  for (let i = 1; i < src.length; i++) {
    const a = src[i - 1], b = src[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / step));
    for (let k = 1; k <= n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  }
  return out;
}
export function spline(P, closed = false, step = 6) { // centripetal-ish Catmull-Rom through P
  const n = P.length, out = [];
  const seg = closed ? n : n - 1;
  for (let i = 0; i < seg; i++) {
    const p0 = P[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[closed ? (i + 2) % n : Math.min(n - 1, i + 2)];
    const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), m = Math.max(2, Math.ceil(L / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  if (!closed) out.push(P[n - 1]);
  return out;
}
export const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export function ellP(cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 0) {
  n = n || Math.max(16, Math.round((rx + ry) * Math.abs(a1 - a0) / 8));
  const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return P;
}

// ------------------------------------------------------------ pencil
// P: points. o: p (draw-on 0..1), w (width), red, seed, jit (px), closed, over (end overshoot px), alpha, passes, dash
export function pencil(P, o = {}) {
  const { p = 1, w = 3, red = false, seed = 1, jit = 1.3, closed = false, over = 6, alpha = 1, passes = 2, dash = null } = o;
  if (p <= 0 || P.length < 2) return;
  let D = resample(P, 5, closed);
  if (!closed && over) { // a hand overshoots: extend both ends a little
    const ext = (a, b, l) => { const L = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; return [a[0] + (a[0] - b[0]) / L * l, a[1] + (a[1] - b[1]) / L * l]; };
    D = [ext(D[0], D[1], over * hs(seed, 3)), ...D, ext(D[D.length - 1], D[D.length - 2], over * hs(seed, 4))];
  }
  const n = D.length, upto = Math.max(2, Math.ceil(n * clamp(p)));
  const c = INK;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = red ? REDP : GRAPH;
  if (dash) c.setLineDash(dash);
  for (let ps = 0; ps < passes; ps++) {
    const sd = seed * 31 + ps * 7, A = jit * (ps ? 1.4 : 1);
    c.globalAlpha = alpha * (ps ? 0.45 : 0.95);
    c.lineWidth = w * (ps ? 0.65 : 1);
    c.beginPath();
    for (let i = 0; i < upto; i++) {
      // smooth jitter: hashed knots every 6 points, re-rolled on each boil frame
      const k = i / 6, k0 = Math.floor(k), f = k - k0, s = f * f * (3 - 2 * f);
      const jx = lerp(hn(sd, BF, k0, 1), hn(sd, BF, k0 + 1, 1), s) * A, jy = lerp(hn(sd, BF, k0, 2), hn(sd, BF, k0 + 1, 2), s) * A;
      const x = D[i][0] + jx, y = D[i][1] + jy;
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.stroke();
  }
  c.restore();
}
export const line = (x1, y1, x2, y2, o = {}) => pencil([[x1, y1], [x2, y2]], o);
// sketchy rectangle: four separate strokes that cross at the corners, drawn in order
export function box(x, y, w, h, o = {}) {
  const p = o.p ?? 1, sd = o.seed ?? 1;
  const E4 = [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]];
  E4.forEach((e, i) => line(...e, { ...o, p: clamp(p * 4 - i), seed: sd + i * 3, over: o.over ?? 10 }));
}
// pencil hatching clipped to a polygon; p reveals the lines in order
export function hatch(poly, o = {}) {
  const { gap = 10, ang = -0.85, w = 1.6, red = false, p = 1, seed = 5, alpha = 0.8 } = o;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 8, c = Math.cos(ang), s = Math.sin(ang);
  INK.save(); INK.beginPath(); poly.forEach(([x, y], i) => (i ? INK.lineTo(x, y) : INK.moveTo(x, y))); INK.closePath(); INK.clip();
  const N = Math.floor((2 * R) / gap), show = Math.ceil(N * clamp(p));
  for (let k = 0; k < show; k++) {
    const d = -R + k * gap + hn(seed, k) * gap * 0.25, px = cx - s * d, py = cy + c * d;
    pencil([[px - c * R, py - s * R], [px + c * R, py + s * R]], { w, red, seed: seed * 13 + k, jit: 0.8, passes: 1, alpha, over: 0 });
  }
  INK.restore();
}
// a little arrow head at the end of a stroke
export function arrow(P, o = {}) {
  pencil(P, o);
  if ((o.p ?? 1) < 0.98) return;
  const b = P[P.length - 1], a = P[P.length - 2], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = o.head ?? 22;
  line(b[0], b[1], b[0] - Math.cos(ang - 0.45) * L, b[1] - Math.sin(ang - 0.45) * L, { ...o, p: 1, seed: (o.seed ?? 1) + 50, over: 0 });
  line(b[0], b[1], b[0] - Math.cos(ang + 0.45) * L, b[1] - Math.sin(ang + 0.45) * L, { ...o, p: 1, seed: (o.seed ?? 1) + 51, over: 0 });
}

// ------------------------------------------------------------ type
// pencil-pressed type wobbles a hair on every boil frame
const wob = (sd) => [hn(sd, BF, 1) * 0.7, hn(sd, BF, 2) * 0.7];
function setFont(c, fam, size, weight) { c.font = `${weight} ${size}px ${fam}`; }
// typewriter mono, p = fraction of characters typed (block cursor while typing)
export function mono(str, x, y, size, o = {}) {
  const { p = 1, color = PAL.ink, align = 'left', weight = 400, track = 0.08, seed = 3, alpha = 1, cursor = true } = o;
  const c = INK, n = Math.floor(str.length * clamp(p)), s = str.slice(0, n);
  setFont(c, F.mono, size, weight);
  const full = c.measureText(str).width + track * size * str.length;
  let cx = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x;
  const [dx, dy] = wob(seed);
  c.save(); c.fillStyle = color; c.globalAlpha = alpha; c.textBaseline = 'middle';
  for (const ch of s) { c.fillText(ch, cx + dx, y + dy); cx += c.measureText(ch).width + track * size; }
  if (cursor && p > 0 && p < 1) { c.fillRect(cx + 2, y - size * 0.45, size * 0.55, size * 0.9); }
  c.restore();
  return full;
}
// italic hand headline wiped on left to right (like a pen writing); wraps to maxW; returns block height
export function hand(str, x, y, size, o = {}) {
  const { p = 1, color = PAL.ink, align = 'left', weight = 400, maxW = 960, lh = 1.12, skew = -0.17, seed = 7, red = null } = o;
  const c = INK; setFont(c, F.hand, size, weight);
  const words = str.split(' '), lines = []; let cur = '';
  for (const wd of words) { const tr = cur ? cur + ' ' + wd : wd; if (c.measureText(tr).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = tr; }
  if (cur) lines.push(cur);
  const total = lines.reduce((s, l) => s + c.measureText(l).width, 0);
  let done = total * clamp(p);
  const [dx, dy] = wob(seed);
  lines.forEach((ln, i) => {
    const lw = c.measureText(ln).width, ly = y + i * size * lh;
    const lx = align === 'center' ? x - lw / 2 : align === 'right' ? x - lw : x;
    const show = clamp(done / lw); done -= lw;
    if (show <= 0) return;
    c.save();
    c.beginPath(); c.rect(lx - 20, ly - size, lw * show + 20 + (show >= 1 ? 40 : 0), size * 2); c.clip();
    c.translate(lx + dx, ly + dy); c.transform(1, 0, skew, 1, 0, 0);
    c.fillStyle = color; c.textBaseline = 'middle';
    if (red) { // words wrapped in ** ** are red
      let xx = 0;
      for (const part of ln.split(/(\*\*[^*]+\*\*)/)) { if (!part) continue; const isR = part.startsWith('**'); const tx = isR ? part.slice(2, -2) : part; c.fillStyle = isR ? PAL.red : color; c.fillText(tx, xx, 0); xx += c.measureText(tx).width; }
    } else c.fillText(ln, 0, 0);
    c.restore();
  });
  return lines.length * size * lh;
}
export function jp(str, x, y, size, o = {}) {
  const { color = PAL.ink, align = 'left', weight = 600, alpha = 1, seed = 9 } = o;
  const c = INK; c.save(); setFont(c, F.jp, size, weight); c.fillStyle = color; c.globalAlpha = alpha; c.textAlign = align; c.textBaseline = 'middle';
  const [dx, dy] = wob(seed); c.fillText(str, x + dx, y + dy); c.restore();
}
export function typeText(str, x, y, size, o = {}) { // typewriter face (calendar numerals)
  const { color = PAL.ink, align = 'center', alpha = 1, seed = 4, maxW = 0 } = o;
  const c = INK; c.save(); setFont(c, F.type, size, 400);
  if (maxW) { const w = c.measureText(str).width; if (w > maxW) setFont(c, F.type, size * maxW / w, 400); }
  c.fillStyle = color; c.globalAlpha = alpha; c.textAlign = align; c.textBaseline = 'middle';
  const [dx, dy] = wob(seed); c.fillText(str, x + dx, y + dy); c.restore();
}

// ------------------------------------------------------------ pieces of the pastiche
// crop marks, registration targets, issue header (NO. xx — LABEL · 日本語), rule, footer
export function furniture(o = {}) {
  const { no = '01', label = '', jpTag = '', p = 1, fig = '' } = o;
  const m = 46, L = 34, sd = 900;
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy], i) => {
    line(x, y, x + sx * L, y, { w: 1.6, seed: sd + i, jit: 0.4, over: 0, alpha: 0.7 });
    line(x, y, x, y + sy * L, { w: 1.6, seed: sd + i + 9, jit: 0.4, over: 0, alpha: 0.7 });
  });
  for (const [x, y] of [[m + 6, H * 0.5], [W - m - 6, H * 0.5]]) {
    pencil(ellP(x, y, 10, 10), { w: 1.4, seed: sd + 20 + x, jit: 0.3, closed: true, alpha: 0.6, passes: 1 });
    line(x - 16, y, x + 16, y, { w: 1.2, seed: sd + 30 + x, jit: 0.2, over: 0, alpha: 0.6 });
    line(x, y - 16, x, y + 16, { w: 1.2, seed: sd + 31 + x, jit: 0.2, over: 0, alpha: 0.6 });
  }
  const hp = clamp(p * 1.6);
  const w1 = mono(`NO. ${no} — ${label}`, 96, 150, 27, { p: hp, color: 'rgba(42,38,35,0.78)', seed: sd + 40 });
  if (jpTag && hp >= 1) jp(jpTag, 96 + w1 + 34, 150, 27, { color: 'rgba(42,38,35,0.78)', weight: 500 });
  line(96, 186, lerp(96, W - 96, E.out3(clamp(p * 1.3 - 0.2))), 188, { w: 1.3, seed: sd + 41, jit: 0.4, over: 0, alpha: 0.55 });
  mono('HOW IT REALLY WORKS', 96, H - 92, 19, { color: 'rgba(42,38,35,0.55)', seed: sd + 42 });
  if (fig) mono(fig, W - 96, H - 92, 19, { color: 'rgba(42,38,35,0.55)', align: 'right', seed: sd + 43 });
  for (let k = 0; k < 3; k++) box(W - 300 + k * 44, H - 132, 34, 16, { w: 1.1, seed: sd + 50 + k, jit: 0.3, alpha: 0.45, over: 2 });
}
// tear-off calendar card: red header strip text, big typewriter numeral/word, small sub label; drops in with overshoot
export function card(x, y, w, h, o = {}) {
  const { p = 1, head = '', big = '', sub = '', seed = 1, bigSize = 0, jpSub = false, out = 0 } = o;
  if (p <= 0) return;
  const k = E.outBack(clamp(p / 0.6)), dy = (1 - k) * -70 + out * 140, rot = (hn(seed, 1) * 0.025) + out * 0.25;
  const c = INK;
  c.save(); c.globalAlpha = clamp(p / 0.25) * (1 - out);
  c.translate(x + w / 2, y + h / 2 + dy); c.rotate(rot); c.translate(-w / 2, -h / 2);
  c.fillStyle = 'rgba(60,45,30,0.13)'; c.fillRect(6, 8, w, h);               // drop shadow
  c.fillStyle = PAL.card; c.fillRect(0, 0, w, h);
  box(0, 0, w, h, { w: 2.2, seed: seed + 3, jit: 0.6, over: 5 });
  box(6, 6, w - 12, h - 12, { w: 1.1, seed: seed + 7, jit: 0.4, over: 2, alpha: 0.55 });
  // header strip with red text and red rule, perforation ticks
  const hh = Math.max(34, h * 0.2);
  if (head) {
    if (/[぀-ヿ一-龯]/.test(head)) jp(head, w / 2, hh * 0.55 + 4, hh * 0.52, { color: PAL.red, align: 'center' });
    else mono(head, w / 2, hh * 0.55 + 4, hh * 0.46, { color: PAL.red, align: 'center', weight: 600, seed: seed + 9, track: 0.05 });
  }
  line(10, hh + 6, w - 10, hh + 6, { w: 1.6, red: true, seed: seed + 11, jit: 0.4, over: 0 });
  for (let i = 0; i < Math.floor(w / 18); i++) line(12 + i * 18, 3, 12 + i * 18, 9, { w: 1, seed: seed + 20 + i, jit: 0.1, over: 0, alpha: 0.5 });
  typeText(big, w / 2, hh + (h - hh) * 0.46 + 6, bigSize || (h - hh) * 0.56, { maxW: w - 30, seed: seed + 13 });
  if (sub) {
    if (jpSub) jp(sub, w / 2, h - (h - hh) * 0.13 - 6, Math.min(30, h * 0.11), { align: 'center', color: 'rgba(42,38,35,0.75)', weight: 500 });
    else mono(sub, w / 2, h - (h - hh) * 0.13 - 6, Math.min(24, h * 0.09), { align: 'center', color: 'rgba(42,38,35,0.75)', seed: seed + 15, track: 0.04 });
  }
  c.restore();
}
// red rubber stamp: double ring, text around the ring, centre text; slams in (scale 1.7 -> 1) and settles
export function stamp(x, y, r, o = {}) {
  const { p = 1, ring = 'HOW IT REALLY WORKS', center = '', rot = -0.14, seed = 70, centerSize = 0 } = o;
  if (p <= 0) return;
  const k = clamp(p / 0.35), s = lerp(1.7, 1, E.out3(k)), c = INK;
  c.save(); c.globalAlpha = clamp(p / 0.12) * 0.88;
  c.translate(x, y); c.rotate(rot); c.scale(s, s);
  pencil(ellP(0, 0, r, r), { w: 4.2, red: true, seed, jit: 0.8, closed: true, passes: 2 });
  pencil(ellP(0, 0, r * 0.8, r * 0.8), { w: 2.2, red: true, seed: seed + 1, jit: 0.6, closed: true, passes: 1 });
  c.font = `600 ${r * 0.15}px ${F.mono}`; c.fillStyle = REDP; c.textAlign = 'center'; c.textBaseline = 'middle';
  const chars = [...ring], span = Math.PI * 1.6;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 - span / 2 + (i + 0.5) * span / chars.length;
    c.save(); c.translate(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); c.rotate(a + Math.PI / 2); c.fillText(ch, 0, 0); c.restore();
  });
  if (center) { c.font = `400 ${centerSize || r * 0.42}px ${F.type}`; c.fillText(center, 0, r * 0.04); }
  // worn ink: knock out specks
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 70; i++) { const a = hs(seed, i) * 6.3, d = Math.sqrt(hs(seed, i, 2)) * r; c.fillRect(Math.cos(a) * d, Math.sin(a) * d, 2 + hs(seed, i, 3) * 4, 1.5 + hs(seed, i, 4) * 3); }
  c.restore();
}
// red pencil flame that flickers on every boil frame; h = height, p draws it on
export function flame(cx, by, h, o = {}) {
  const { p = 1, seed = 300, alive = 1 } = o;
  if (alive <= 0.02) return;
  const hh = h * alive, f = (k, a) => hn(seed, BF, k) * a;
  const P = [[cx - hh * 0.32, by], [cx - hh * 0.4 + f(1, 6), by - hh * 0.35], [cx - hh * 0.12 + f(2, 10), by - hh * 0.62], [cx - hh * 0.06 + f(3, 8), by - hh * 0.5],
    [cx + f(4, 14), by - hh], [cx + hh * 0.2 + f(5, 8), by - hh * 0.6], [cx + hh * 0.26 + f(6, 8), by - hh * 0.72], [cx + hh * 0.38 + f(7, 6), by - hh * 0.3], [cx + hh * 0.3, by]];
  const S = spline(P, false, 6);
  pencil(S, { p, red: true, w: 3.6, seed, jit: 1 });
  const I = spline([[cx - hh * 0.14, by], [cx - hh * 0.16 + f(8, 5), by - hh * 0.3], [cx + f(9, 8), by - hh * 0.58], [cx + hh * 0.14 + f(10, 5), by - hh * 0.28], [cx + hh * 0.12, by]], false, 6);
  pencil(I, { p, red: true, w: 2.4, seed: seed + 1, jit: 0.8 });
  if (p >= 0.9) hatch([...S, [cx + hh * 0.3, by]], { red: true, gap: 11, ang: -1.0, w: 1.6, seed: seed + 2, alpha: 0.55 });
}
