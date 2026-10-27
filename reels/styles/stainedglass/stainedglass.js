// Vertical stained-glass module: our own 2D-canvas port of the "stained-glass" grammar (Lemo-Opuscar, MIT; technique only).
// Light is the story: dark stone hall, panes that are dark until light passes through, additive glow, lead came lines.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const backOut = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const ih = n => { n = Math.imul(n ^ (n >>> 15), 2246822507); n = Math.imul(n ^ (n >>> 13), 3266489909); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
const _c = {}; const rgb = h => _c[h] || (_c[h] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
export const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join(''); };
export const rgba = (h, a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`; };
export const COL = { blue: '#1d4fd8', red: '#cf1535', purple: '#7a2fb8', green: '#2f9f52', amber: '#f4b53c', night: '#0b0a14', lead: '#4a4d58', gold: '#f3c64a', parch: '#eadbb2', ink: '#2b1d17', crim: '#9a2417' };

function makeStone() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#15121d'; g.fillRect(0, 0, W, H);
  const bh = 120, bw = 260;
  for (let r = 0; r * bh < H + bh; r++) for (let k = -1; k * bw < W + bw; k++) {
    const x = k * bw + (r % 2 ? bw / 2 : 0), y = r * bh, s = ih(r * 97 + k * 13 + 3);
    g.fillStyle = `rgba(${40 + s * 22 | 0},${34 + s * 18 | 0},${52 + s * 24 | 0},.55)`; g.fillRect(x + 4, y + 4, bw - 8, bh - 8);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y + bh - 5, bw, 5); g.fillRect(x + bw - 5, y, 5, bh);
    g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x + 4, y + 4, bw - 8, 3);
  }
  const id = g.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < W * H; i++) { const n = (ih(i + 9) - .5) * 14; d[i * 4] += n; d[i * 4 + 1] += n; d[i * 4 + 2] += n; }
  g.putImageData(id, 0, 0); return c;
}
export function createSG(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const g = canvas.getContext('2d'), stone = makeStone();
  const R = { g, W, H, t: 0, stone };
  R.begin = (t, dim = 1) => { R.t = t; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(stone, 0, 0); if (dim < 1) { g.fillStyle = rgba('#000000', 1 - dim); g.fillRect(0, 0, W, H); } };
  R.finish = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; const v = g.createRadialGradient(W / 2, H * .46, H * .3, W / 2, H * .5, H * .72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H); g.restore(); };
  R.measure = (s, size, fam, wt = 400) => { g.save(); g.font = `${wt} ${size}px ${fam}`; const w = g.measureText(s).width; g.restore(); return w; };
  // additive glow
  R.glow = (x, y, r, col, a) => { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.4, rgba(col, a * .4)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); };
  // one pane of glass. pathFn() adds a path; lit 0..1 = how much light passes through
  R.pane = (pathFn, col, lit, seed, bb) => {
    g.save(); pathFn(); g.clip();
    const dark = mix(col, '#07060d', .86), base = mix(dark, col, ss(lit));
    g.fillStyle = base; g.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]);
    const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, rr = Math.max(bb[2] - bb[0], bb[3] - bb[1]) * .75;
    if (lit > 0) {
      g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(cx + (hash(seed) - .5) * 20, cy - (bb[3] - bb[1]) * .12, 0, cx, cy, rr); gr.addColorStop(0, rgba(mix(col, '#ffffff', .55), .55 * lit)); gr.addColorStop(.6, rgba(col, .22 * lit)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]);
      g.globalCompositeOperation = 'source-over'; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const a = hash(seed * 3 + i) * 6.28, l = (bb[2] - bb[0]) * (.2 + hash(seed + i * 5) * .35), x0 = cx + (hash(seed * 5 + i) - .5) * (bb[2] - bb[0]) * .7, y0 = cy + (hash(seed * 7 + i) - .5) * (bb[3] - bb[1]) * .7; g.strokeStyle = rgba('#ffffff', .1 * lit); g.lineWidth = 2 + hash(seed + i) * 3; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + Math.cos(a) * l * .6, y0 + Math.sin(a) * l * .6 + 8, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); g.stroke(); }
      for (let i = 0; i < 2; i++) { g.fillStyle = rgba('#ffffff', .22 * lit); g.beginPath(); g.arc(cx + (hash(seed * 11 + i) - .5) * (bb[2] - bb[0]) * .6, cy + (hash(seed * 13 + i) - .5) * (bb[3] - bb[1]) * .6, 1.5 + hash(seed + i * 9) * 2.5, 0, 6.3); g.fill(); }
    }
    // inner shade near the lead
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 16; pathFn(); g.stroke();
    g.restore();
  };
  R.lead = (pathFn, w = 12, a = 1) => { g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; pathFn(); g.strokeStyle = rgba('#202228', a); g.lineWidth = w + 3; g.stroke(); pathFn(); g.strokeStyle = rgba(COL.lead, a); g.lineWidth = w; g.stroke(); pathFn(); g.strokeStyle = rgba('#9aa0ae', a * .55); g.lineWidth = Math.max(1.5, w * .22); g.translate(-w * .15, -w * .18); g.stroke(); g.restore(); };
  return R;
}
