// Vertical watercolour journal: our own 2D-canvas port of the "watercolor" grammar (Lemo-Opuscar, MIT; technique only).
// 1080x1920 canvas. Everything is a pure function of t; shapes are built under fixed seeds.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const backOut = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const ih = n => { n = Math.imul(n ^ (n >>> 15), 2246822507); n = Math.imul(n ^ (n >>> 13), 3266489909); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
const vn = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };
export const PAPER = '#f7efdf', INK = '#3a2d27', INK2 = '#6b5648';
const _c = {};
const rgb = h => _c[h] || (_c[h] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
export const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join(''); };
export const rgba = (h, a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`; };
export const PAL = { green: '#6fb23f', deepGreen: '#3f8a35', yellow: '#f6c63c', orange: '#f08320', red: '#d63e2b', brown: '#8a5a3c', pink: '#f08a8a', sky: '#9ec7d6' };

// ---------- paper (made once) ----------
function makePaper() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  // smooth low-frequency mottling: tiny noise scaled up
  const lo = document.createElement('canvas'); lo.width = 54; lo.height = 96; const lg = lo.getContext('2d'); const id = lg.createImageData(54, 96);
  for (let i = 0; i < 54 * 96; i++) { const v = 128 + (hash(i * 3.7) - .5) * 70; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
  lg.putImageData(id, 0, 0); g.globalAlpha = .035; g.globalCompositeOperation = 'multiply'; g.imageSmoothingEnabled = true; g.drawImage(lo, 0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // fibres
  for (let i = 0; i < 2600; i++) {
    const x = hash(i * 1.3) * W, y = hash(i * 2.9 + 5) * H, a = hash(i * 4.1) * 6.28, l = 6 + hash(i * 5.3) * 22;
    g.strokeStyle = hash(i * 7.7) > .5 ? 'rgba(150,120,90,.07)' : 'rgba(255,255,255,.22)'; g.lineWidth = .8 + hash(i * 8.3) * .8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 3, y + Math.sin(a) * l * .5 - 3, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // grain
  const id2 = g.getImageData(0, 0, W, H), d = id2.data;
  for (let i = 0; i < W * H; i++) { const n = (ih(i) - .5) * 8; d[i * 4] += n; d[i * 4 + 1] += n; d[i * 4 + 2] += n; }
  g.putImageData(id2, 0, 0);
  const v = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(120,80,40,0)'); v.addColorStop(1, 'rgba(150,100,50,.09)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}
function makeGrain() { // multiplied over the finished paint so pigment granulates
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const id = g.createImageData(W, H), d = id.data;
  for (let i = 0; i < W * H; i++) { const x = i % W, y = (i / W) | 0; const n = ih(i + 77) * .65 + ih(((x >> 1) + (y >> 1) * 541) + 5) * .35; const v = 226 + n * 29; d[i * 4] = v; d[i * 4 + 1] = v - 1; d[i * 4 + 2] = v - 3; d[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
}

export function createWC(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const g = canvas.getContext('2d'), paper = makePaper(), grain = makeGrain();
  const R = { g, W, H, t: 0, paperImg: paper };
  R.begin = t => { R.t = t; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(paper, 0, 0); };
  R.finish = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.drawImage(grain, 0, 0); g.restore(); };
  const path = (pts, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); };
  const smoothPath = pts => { const n = pts.length; g.beginPath(); g.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); };
  // wet wash: 3 jittered passes, pooled darker edge, soft pigment blooms inside
  R.wash = (pts, col, o = {}) => {
    const a = o.a ?? .8, seed = o.seed ?? 1, jit = o.jit ?? 5, alpha = clamp(o.alpha ?? 1); if (alpha <= 0) return;
    g.save(); g.globalAlpha = alpha;
    for (let p = 0; p < 3; p++) {
      const q = pts.map((pt, i) => [pt[0] + (hash(seed * 31 + i * 3.1 + p * 17) - .5) * 2 * jit, pt[1] + (hash(seed * 17 + i * 5.3 + p * 11) - .5) * 2 * jit]);
      g.fillStyle = rgba(col, a * (p === 0 ? .55 : .3)); smoothPath(q); g.fill();
    }
    smoothPath(pts); g.save(); g.clip();
    for (let b = 0; b < (o.blooms ?? 6); b++) {
      const bx = (o.bx0 ?? 0) + hash(seed * 7 + b * 2.3) * ((o.bx1 ?? W) - (o.bx0 ?? 0)), by = (o.by0 ?? 0) + hash(seed * 13 + b * 4.1) * ((o.by1 ?? H) - (o.by0 ?? 0)), r = (o.br ?? 160) * (.5 + hash(b * 9.1 + seed));
      const dark = hash(b * 3.3 + seed) > .5, gr = g.createRadialGradient(bx, by, 0, bx, by, r);
      gr.addColorStop(0, dark ? rgba(mix(col, '#3a2d27', .35), .3) : 'rgba(255,250,240,.42)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(bx - r, by - r, r * 2, r * 2);
    }
    g.strokeStyle = rgba(mix(col, '#3a2d27', .3), a * .20); g.lineWidth = 46; g.lineJoin = 'round'; smoothPath(pts); g.stroke();
    g.strokeStyle = rgba(mix(col, '#3a2d27', .4), a * .22); g.lineWidth = 14; g.stroke();
    g.restore();
    // pooled edge
    g.lineJoin = 'round'; g.strokeStyle = rgba(mix(col, '#3a2d27', .38), a * .55); g.lineWidth = o.edge ?? 3.2; smoothPath(pts); g.stroke();
    g.strokeStyle = rgba(mix(col, '#3a2d27', .2), a * .22); g.lineWidth = (o.edge ?? 3.2) * 2.6; g.stroke();
    g.restore();
  };
  // one brush stroke: ribbon + bristle tracks (flying white); prog 0..1 paints a moving tip
  R.stroke = (pts, o = {}) => {
    const w = o.w ?? 14, col = o.col ?? INK, a = o.a ?? .85, seed = o.seed ?? 1, prog = o.prog ?? 1; if (prog <= 0) return;
    const n = Math.max(2, Math.floor(pts.length * prog)), P = pts.slice(0, n), prof = o.prof ?? (u => Math.sin(Math.PI * Math.pow(u, .7)) * .85 + .15);
    const L = [], Rr = [];
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[Math.min(i + 1, P.length - 1)], r = P[Math.max(i - 1, 0)]; let dx = q[0] - r[0], dy = q[1] - r[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const u = i / (P.length - 1 || 1), ww = w * prof(u) * (.8 + .4 * vn(u * 6 + seed * 3)) / 2;
      L.push([p[0] - dy * ww, p[1] + dx * ww]); Rr.push([p[0] + dy * ww, p[1] - dx * ww]);
    }
    g.save(); g.fillStyle = rgba(col, a * .6); path([...L, ...Rr.reverse()]); g.fill();
    const tr = o.bristles ?? 5; g.lineCap = 'round';
    for (let k = 0; k < tr; k++) {
      const off = (hash(seed * 5 + k * 1.7) - .5) * .85, endAt = .55 + hash(seed * 3 + k) * .45; g.strokeStyle = rgba(mix(col, '#3a2d27', .2), a * (.45 + hash(k + seed) * .4)); g.lineWidth = 1.4 + hash(k * 2.1 + seed) * 2.2;
      g.setLineDash([10 + hash(k + 3) * 40, 3 + hash(k + 8) * 18]); g.beginPath(); let started = false;
      for (let i = 0; i < P.length; i++) { const u = i / (P.length - 1 || 1); if (u > endAt) break; const p = P[i], q = P[Math.min(i + 1, P.length - 1)], r = P[Math.max(i - 1, 0)]; let dx = q[0] - r[0], dy = q[1] - r[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const ww = w * prof(u) * off; const x = p[0] - dy * ww, y = p[1] + dx * ww; started ? g.lineTo(x, y) : (g.moveTo(x, y), started = true); }
      g.stroke();
    }
    g.setLineDash([]); g.restore();
  };
  R.bezier = (x0, y0, cx, cy, x1, y1, n = 16) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]); } return o; };
  R.text = (s, x, y, o = {}) => {
    const size = o.size ?? 52, font = o.font ?? 'Caveat', reveal = o.reveal ?? 1; if (reveal <= 0) return;
    g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 600} ${size}px "${font}"`; g.textAlign = o.align ?? 'center'; g.textBaseline = 'alphabetic'; if (o.rot) { g.translate(x, y); g.rotate(o.rot); x = 0; y = 0; }
    const lines = String(s).split('\n'), lh = size * 1.05, wmax = Math.max(...lines.map(l => g.measureText(l).width));
    const left = (o.align ?? 'center') === 'center' ? x - wmax / 2 : (o.align === 'right' ? x - wmax : x);
    g.beginPath(); g.rect(left - 30, y - size * 1.2, (wmax + 90) * clamp(reveal), lines.length * lh + size * 1.3); g.clip();
    lines.forEach((l, i) => { const yy = y + i * lh; g.lineJoin = 'round'; g.strokeStyle = rgba(PAPER, .95); g.lineWidth = size * .22; g.strokeText(l, x, yy); g.fillStyle = rgba(o.col ?? INK, o.a ?? .86); g.fillText(l, x, yy); });
    g.restore();
  };
  R.measure = (s, size, font = 'Caveat', italic = false, weight = 600) => { g.save(); g.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${font}"`; const w = g.measureText(s).width; g.restore(); return w; };
  R.leader = (pts, prog, col = INK2) => { if (prog <= 0) return; const n = Math.max(2, Math.floor(pts.length * clamp(prog))); g.save(); g.strokeStyle = rgba(col, .8); g.lineWidth = 3; g.lineCap = 'round'; path(pts.slice(0, n), false); g.stroke(); if (prog >= 1) { const e = pts[pts.length - 1]; g.fillStyle = rgba(col, .85); g.beginPath(); g.arc(e[0], e[1], 7, 0, 6.3); g.fill(); } g.restore(); };
  R.subtitle = (s, y, reveal = 1) => { // serif italic on the paper, 2 balanced lines max, paper halo, never a box
    const words = s.split(' '); let best = [s], bw = R.measure(s, 54, 'Cormorant Garamond', true, 600);
    if (bw > 900) { let bi = 1, bd = 1e9; for (let i = 1; i < words.length; i++) { const a = R.measure(words.slice(0, i).join(' '), 54, 'Cormorant Garamond', true, 600), b = R.measure(words.slice(i).join(' '), 54, 'Cormorant Garamond', true, 600), d = Math.abs(a - b); if (d < bd) { bd = d; bi = i; } } best = [words.slice(0, bi).join(' '), words.slice(bi).join(' ')]; }
    R.text(best.join('\n'), W / 2, y, { font: 'Cormorant Garamond', italic: true, weight: 600, size: 54, reveal, a: .88 });
  };
  return R;
}

// ---------- leaves ----------
export function leafPoly(len, wid, n = 22) { // pointing up; tip (0,-len/2), base (0,len/2)
  const L = [], Rt = [];
  for (let i = 0; i <= n; i++) { const u = i / n, y = len / 2 - u * len, w = wid * Math.pow(Math.sin(Math.PI * Math.pow(u, .85)), .72) * (1 - .22 * u); L.push([-w, y]); Rt.push([w, y]); }
  return [...L, ...Rt.reverse().slice(1, -1)];
}
export function shrinkPoly(pts, g) { return pts.map(([x, y]) => [x * g, y]); }
