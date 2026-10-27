// Urban-sketch "pen & wash" vertical module (1080x1920), our own 2D-canvas port of the grammar of Lemo-Opuscar's
// urban-sketch style (MIT; technique only, no code or assets copied).
// Ink: thin sepia fineliner that wobbles, overshoots and breaks. Wash: transparent colour, misregistered from the line,
// pooled edges, arriving as a bloom with a wet front. Paper: cream cold-press, never painted edge to edge.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const backOut = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const ih = n => { n = Math.imul(n ^ (n >>> 15), 2246822507); n = Math.imul(n ^ (n >>> 13), 3266489909); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
const n1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (lerp(hash(i), hash(i + 1), u) - .5) * 2; }; // -1..1 value noise
export const PAPER = '#f6ecd8', INK = '#4a3626', INK2 = '#7a6450';
export const PAL = { brick: '#c9573f', ochre: '#e0a94a', slate: '#7fa6b8', sage: '#9bb07a', violet: '#8d86a6', rope: '#c8a86b', sky: '#bcd0dc', rose: '#e08a7a', steel: '#9aa3ad', accent: '#c4501a', gold: '#d9a21e' };
const _c = {}; const rgb = h => _c[h] || (_c[h] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
export const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join(''); };
export const rgba = (h, a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`; };

function makePaper() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const lo = document.createElement('canvas'); lo.width = 36; lo.height = 64; const lg = lo.getContext('2d'); const id = lg.createImageData(36, 64);
  for (let i = 0; i < 36 * 64; i++) { const v = 128 + (hash(i * 3.7) - .5) * 80; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
  lg.putImageData(id, 0, 0); g.globalAlpha = .045; g.globalCompositeOperation = 'multiply'; g.imageSmoothingEnabled = true; g.drawImage(lo, 0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  for (let i = 0; i < 2200; i++) { // fibres
    const x = hash(i * 1.3) * W, y = hash(i * 2.9 + 5) * H, a = hash(i * 4.1) * 6.28, l = 6 + hash(i * 5.3) * 20;
    g.strokeStyle = hash(i * 7.7) > .5 ? 'rgba(150,120,90,.07)' : 'rgba(255,255,255,.2)'; g.lineWidth = .8 + hash(i * 8.3) * .8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const id2 = g.getImageData(0, 0, W, H), d = id2.data; // cold-press tooth
  for (let i = 0; i < W * H; i++) { const x = i % W, y = (i / W) | 0; const n = (ih(i) - .5) * 7 + (ih(((x >> 2) + (y >> 2) * 311) + 9) - .5) * 7; d[i * 4] += n; d[i * 4 + 1] += n; d[i * 4 + 2] += n; }
  g.putImageData(id2, 0, 0);
  const v = g.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(120,80,40,0)'); v.addColorStop(1, 'rgba(150,100,50,.10)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}
function makeGrain() { // multiplied over everything: pigment granulates in the tooth
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const id = g.createImageData(W, H), d = id.data;
  for (let i = 0; i < W * H; i++) { const x = i % W, y = (i / W) | 0; const n = ih(i + 77) * .6 + ih(((x >> 1) + (y >> 1) * 541) + 5) * .4; const v = 224 + n * 31; d[i * 4] = v; d[i * 4 + 1] = v - 1; d[i * 4 + 2] = v - 3; d[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
}

export function createUS(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const g = canvas.getContext('2d'), paper = makePaper(), grain = makeGrain();
  const R = { g, W, H, t: 0, paperImg: paper, boil: 0 };
  R.begin = t => { R.t = t; R.boil = Math.floor(t * 12 + 1e-6); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(paper, 0, 0); };
  R.finish = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.drawImage(grain, 0, 0); g.restore(); };

  // ---- INK ----
  const dens = (pts, step) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(l / step)); for (let k = 1; k <= n; k++) o.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } return o; };
  // one fineliner stroke: wobble, overshoot, a small gap on long strokes, draw-on by prog
  R.pen = (pts, o = {}) => {
    const w = o.w ?? 3.6, col = o.col ?? INK, a = o.a ?? .92, prog = o.prog ?? 1; if (prog <= 0 || pts.length < 2) return;
    const seed = (o.seed ?? 1) + (o.boil ? R.boil * 1.37 : 0), wob = o.wob ?? 1.7, over = o.over ?? 9;
    let P = dens(pts, 9);
    if (over > 0 && !o.closed) { const a0 = P[0], a1 = P[1], b0 = P[P.length - 1], b1 = P[P.length - 2]; let d0 = Math.hypot(a0[0] - a1[0], a0[1] - a1[1]) || 1, d1 = Math.hypot(b0[0] - b1[0], b0[1] - b1[1]) || 1;
      P = [[a0[0] + (a0[0] - a1[0]) / d0 * over, a0[1] + (a0[1] - a1[1]) / d0 * over], ...P, [b0[0] + (b0[0] - b1[0]) / d1 * over, b0[1] + (b0[1] - b1[1]) / d1 * over]]; }
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); const L = cum[cum.length - 1];
    const Q = P.map((p, i) => { const s = cum[i], q = P[Math.min(i + 1, P.length - 1)], r = P[Math.max(i - 1, 0)]; let dx = q[0] - r[0], dy = q[1] - r[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const off = (n1(s / 85 + seed * 7.3) * wob + n1(s / 21 + seed * 3.1) * wob * .45); return [p[0] - dy * off, p[1] + dx * off, s]; });
    const gapAt = (o.gaps !== false && L > 380) ? (.3 + hash(seed * 9.1) * .4) * L : -1, upto = L * prog;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      g.strokeStyle = rgba(col, pass ? a * .35 : a); g.lineWidth = pass ? w * .55 : w; const ox = pass ? .7 : 0, oy = pass ? -.5 : 0;
      g.beginPath(); let pen = false;
      for (const [x, y, s] of Q) { if (s > upto) break; const inGap = gapAt >= 0 && Math.abs(s - gapAt) < 4.5; if (inGap) { pen = false; continue; } if (!pen) { g.moveTo(x + ox, y + oy); pen = true; } else g.lineTo(x + ox, y + oy); }
      g.stroke();
    }
    g.restore();
  };
  R.line = (x0, y0, x1, y1, o = {}) => R.pen([[x0, y0], [x1, y1]], o);
  // rectangle drawn as four overshooting strokes (drawn on sequentially by prog)
  R.rect = (x, y, w, h, o = {}) => { const p = o.prog ?? 1, s = o.seed ?? 1; const S = [[[x, y], [x + w, y]], [[x + w, y], [x + w, y + h]], [[x + w, y + h], [x, y + h]], [[x, y + h], [x, y]]];
    S.forEach((sg, i) => R.pen(sg, { ...o, prog: clamp(p * 4 - i), seed: s + i * 3.7, gaps: false, over: o.over ?? 7 })); };
  R.circle = (cx, cy, r, o = {}) => { const n = Math.max(18, Math.floor(r / 3)), pts = [], s = o.seed ?? 1, a0 = hash(s) * 6.28; for (let i = 0; i <= n; i++) { const a = a0 + i / n * (6.28 + .22), k = 1 + n1(a * 1.7 + s) * .012 + (i / n) * .01; pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]); } R.pen(pts, { ...o, over: 0, gaps: false }); };
  R.bez = (x0, y0, cx, cy, x1, y1, n = 18) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]); } return o; };
  R.dash = (pts, o = {}) => { const P = dens(pts, 6), on = o.on ?? 4, off = o.off ?? 3; for (let i = 0; i + on < P.length; i += on + off) { const sub = P.slice(i, i + on + 1); R.pen(sub, { ...o, over: 0, gaps: false, wob: .6, prog: o.prog ?? 1 }); } };

  // ---- WASH ----
  const smoothP = pts => { const n = pts.length; g.beginPath(); g.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); };
  const polyP = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  const noisyCircle = (x, y, r, seed) => { g.beginPath(); for (let i = 0; i <= 44; i++) { const a = i / 44 * 6.2832, k = 1 + n1(a * 2.2 + seed) * .16 + n1(a * 5.1 + seed * 2) * .07; const px = x + Math.cos(a) * r * k, py = y + Math.sin(a) * r * k; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };
  // transparent wash, misregistered from its line; o.bloom {x,y,r} reveals it from a point with a wet front; o.shade 0..1 mixes a cool violet shadow
  R.wash = (pts, col, o = {}) => {
    const a = o.a ?? .55, seed = o.seed ?? 1, jit = o.jit ?? 3.2, alpha = clamp(o.alpha ?? 1); if (alpha <= 0) return;
    const dx = o.dx ?? 5, dy = o.dy ?? 4, sm = o.smooth ?? false; let P = o.dens === false ? pts : dens(pts.concat([pts[0]]), o.step ?? 46).slice(0, -1);
    const J = k => P.map((p, i) => [p[0] + dx + n1(i * .9 + seed * 5 + k * 13) * jit, p[1] + dy + n1(i * 1.1 + seed * 3 + k * 7) * jit]);
    const path = q => sm ? smoothP(q) : polyP(q);
    g.save(); g.globalAlpha = alpha;
    if (o.bloom) { if (o.bloom.r <= 0) { g.restore(); return; } noisyCircle(o.bloom.x, o.bloom.y, o.bloom.r, seed); g.clip(); }
    const q0 = J(0), q1 = J(1);
    g.fillStyle = rgba(col, a * .55); path(q0); g.fill();
    g.fillStyle = rgba(col, a * .32); path(q1); g.fill();
    g.save(); path(q0); g.clip();
    if (o.shade) { const xs = q0.map(p => p[0]), ys = q0.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const gr = g.createLinearGradient(lerp(x0, x1, .35), lerp(y0, y1, .2), x1, y1); gr.addColorStop(0, 'rgba(141,134,166,0)'); gr.addColorStop(1, rgba(PAL.violet, .5 * o.shade)); g.fillStyle = gr; g.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8); }
    for (let b = 0; b < (o.blooms ?? 3); b++) { const xs = q0.map(p => p[0]), ys = q0.map(p => p[1]), bx = lerp(Math.min(...xs), Math.max(...xs), hash(seed * 7 + b * 2.3)), by = lerp(Math.min(...ys), Math.max(...ys), hash(seed * 13 + b * 4.1)), r = (o.br ?? 90) * (.6 + hash(b * 9.1 + seed));
      const gr = g.createRadialGradient(bx, by, 0, bx, by, r); gr.addColorStop(0, hash(b + seed) > .5 ? rgba(mix(col, INK, .3), a * .22) : 'rgba(255,250,240,.28)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(bx - r, by - r, r * 2, r * 2); }
    g.strokeStyle = rgba(mix(col, INK, .3), a * .2); g.lineWidth = 22; g.lineJoin = 'round'; path(q0); g.stroke(); // inner dark rim
    g.restore();
    g.strokeStyle = rgba(mix(col, INK, .35), a * .55); g.lineWidth = o.edge ?? 2.4; g.lineJoin = 'round'; path(q0); g.stroke(); // dried, pooled edge
    if (o.bloom && o.bloom.front !== false) { g.save(); path(q0); g.clip(); noisyCircle(o.bloom.x, o.bloom.y, o.bloom.r, seed); g.strokeStyle = rgba(mix(col, INK, .25), a * .35); g.lineWidth = 16; g.stroke(); g.restore(); }
    g.restore();
  };
  // helpers that return point lists
  R.rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  R.circPts = (cx, cy, r, n = 26) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  R.fillCirc = (cx, cy, r, col, o = {}) => R.wash(R.circPts(cx, cy, r), col, { smooth: true, step: 1e4, ...o });

  // ---- TEXT (handwriting on the page) ----
  R.measure = (s, size, weight = 600) => { g.save(); g.font = `${weight} ${size}px "Caveat"`; const w = g.measureText(s).width; g.restore(); return w; };
  R.text = (s, x, y, o = {}) => {
    const size = o.size ?? 56, reveal = o.reveal ?? 1, col = o.col ?? INK; if (reveal <= 0) return;
    g.save(); g.font = `${o.weight ?? 600} ${size}px "Caveat"`; g.textAlign = o.align ?? 'center'; g.textBaseline = 'alphabetic'; if (o.rot) { g.translate(x, y); g.rotate(o.rot); x = 0; y = 0; }
    const lines = String(s).split('\n'), lh = size * 1.02, wmax = Math.max(...lines.map(l => g.measureText(l).width)), al = o.align ?? 'center';
    const left = al === 'center' ? x - wmax / 2 : al === 'right' ? x - wmax : x;
    g.beginPath(); g.rect(left - 24, y - size * 1.1, (wmax + 80) * clamp(reveal), lines.length * lh + size * 1.2); g.clip();
    lines.forEach((l, i) => { const yy = y + i * lh; if (o.halo !== false) { g.lineJoin = 'round'; g.strokeStyle = rgba(PAPER, .9); g.lineWidth = size * .2; g.strokeText(l, x, yy); } g.fillStyle = rgba(col, o.a ?? .9); g.fillText(l, x, yy); });
    g.restore();
  };
  return R;
}
