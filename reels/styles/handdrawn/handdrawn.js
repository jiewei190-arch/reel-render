// handdrawn.js: vertical 1080x1920 hand-drawn ink-on-dark-paper renderer (Canvas2D, deterministic, pure function of t).
// Recipe taken from awesome-opus-5-5-video-styles / styles/handdrawn.md: every shape is wobbly pencil/ink line on paper, redrawn
// every few frames (line boil @12 fps), limited palette = chalk ink + ONE accent (orange), no gradients/3D, hand-lettered labels.
// Original code. Font: Caveat (SIL OFL, see fonts/).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const PAL = { paper: '#15141b', ink: '#f1ede2', dim: 'rgba(241,237,226,.5)', org: '#ff8a24', orgD: '#c9601a' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const FONT = 'Caveat';

export function createHD(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d'); let B = 0, GA = 1;
  const tile = document.createElement('canvas'); tile.width = tile.height = 256; const tg = tile.getContext('2d');
  const im = tg.createImageData(256, 256);
  for (let i = 0; i < 65536; i++) { const v = hash(i * 1.37) * 255; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = hash(i * .77 + 3) * 28; }
  tg.putImageData(im, 0, 0); const pat = g.createPattern(tile, 'repeat');
  const Hd = { g, PAL };
  const J = (i, a) => (hash(i * 12.9898 + B * 1.7 + .5) - .5) * 2 * a;
  Hd.begin = t => { B = Math.floor(t * 12); GA = 1; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.setLineDash([]);
    g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H); g.fillStyle = pat; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(540, 960, 520, 540, 960, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H); };
  Hd.alpha = a => { GA = a; };
  const rs = (pts, step = 34) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)); for (let k = 1; k <= n; k++) o.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); } return o; };
  // wobbly ink polyline, partial draw-on (draw 0..1), two passes (pencil double line)
  Hd.poly = (pts0, o = {}) => { const { col = PAL.ink, w = 6, draw = 1, seed = 0, amp = 2.4, alpha = 1, dash = null } = o; if (draw <= 0 || GA <= 0) return;
    let pts = rs(pts0); const L = [0]; for (let i = 1; i < pts.length; i++) L[i] = L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const tot = L[L.length - 1] * clamp(draw); const P = [pts[0]];
    for (let i = 1; i < pts.length; i++) { if (L[i] <= tot) P.push(pts[i]); else { const u = (tot - L[i - 1]) / (L[i] - L[i - 1] || 1); P.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; if (dash) g.setLineDash(dash); g.strokeStyle = col;
    for (let pass = 0; pass < 2; pass++) { g.globalAlpha = GA * alpha * (pass ? .5 : 1); g.lineWidth = w * (pass ? .55 : 1); g.beginPath();
      P.forEach(([x, y], i) => { const jx = J(seed * 101 + i * 2 + pass * 53, amp), jy = J(seed * 101 + i * 2 + 1 + pass * 53, amp); i ? g.lineTo(x + jx, y + jy) : g.moveTo(x + jx, y + jy); }); g.stroke(); }
    g.restore(); };
  Hd.fill = (pts, col, alpha = .2, off = 5) => { g.save(); g.globalAlpha = GA * alpha; g.fillStyle = col; g.translate(off, off * .6); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); };
  const ellPts = (cx, cy, rx, ry, n = 0, rot = 0, a0 = 0, a1 = 1.04) => { n = n || Math.max(16, Math.round((rx + ry) / 7)); const P = []; for (let i = 0; i <= n; i++) { const a = rot + (a0 + (a1 - a0) * i / n) * TAU; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
  Hd.ellPts = ellPts;
  Hd.ell = (cx, cy, rx, ry, o = {}) => { const { fillc = null, fa = .2 } = o; if (fillc) Hd.fill(ellPts(cx, cy, rx, ry), fillc, fa); Hd.poly(ellPts(cx, cy, rx, ry, 0, o.rot || 0), o); };
  const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y - 3]];
  Hd.rectPts = rectPts;
  Hd.rect = (x, y, w, h, o = {}) => { if (o.fillc) Hd.fill(rectPts(x, y, w, h), o.fillc, o.fa == null ? .2 : o.fa); Hd.poly(rectPts(x, y, w, h), o); };
  // lumpy outlined cloud/fog puff with soft chalk body
  Hd.cloud = (cx, cy, r, o = {}) => { const { seed = 0, fa = .1, col = PAL.ink, w = 5, draw = 1, sq = .8 } = o; const P = []; const n = 40;
    for (let i = 0; i <= n; i++) { const a = i / n * TAU, k = 1 + .22 * Math.sin(a * 5 + seed * 3) + .12 * Math.sin(a * 3 + seed); P.push([cx + Math.cos(a) * r * k * 1.15, cy + Math.sin(a) * r * k * sq]); }
    if (fa) Hd.fill(P, col, fa, 0); Hd.poly(P, { col, w, draw, seed, amp: 2 }); };
  Hd.line = (x0, y0, x1, y1, o = {}) => Hd.poly([[x0, y0], [x1, y1]], o);
  Hd.arrow = (x0, y0, x1, y1, o = {}) => { const { col = PAL.ink, w = 7, draw = 1, seed = 0 } = o; Hd.poly([[x0, y0], [x1, y1]], { col, w, draw, seed });
    if (draw > .85) { const a = Math.atan2(y1 - y0, x1 - x0), L = 34; Hd.poly([[x1 - Math.cos(a - .5) * L, y1 - Math.sin(a - .5) * L], [x1, y1], [x1 - Math.cos(a + .5) * L, y1 - Math.sin(a + .5) * L]], { col, w, seed: seed + 7 }); } };
  Hd.cross = (cx, cy, r, o = {}) => { const { col = PAL.org, w = 10, k = 1 } = o; if (k <= .02) return; Hd.poly([[cx - r, cy - r], [cx + r, cy + r]], { col, w, draw: ramp(k, 0, .5), seed: 3 }); Hd.poly([[cx + r, cy - r], [cx - r, cy + r]], { col, w, draw: ramp(k, .45, .55), seed: 4 }); };
  Hd.check = (cx, cy, r, o = {}) => { const { col = PAL.org, w = 10, k = 1 } = o; if (k <= .02) return; Hd.poly([[cx - r, cy], [cx - r * .25, cy + r * .7], [cx + r, cy - r * .8]], { col, w, draw: k, seed: 5 }); };
  Hd.snow = (cx, cy, r, o = {}) => { const { col = PAL.ink, w = 5, rot = 0 } = o; for (let i = 0; i < 3; i++) { const a = rot + i * Math.PI / 3; Hd.poly([[cx - Math.cos(a) * r, cy - Math.sin(a) * r], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], { col, w, seed: 10 + i, amp: 1.2 }); } };
  Hd.txt = (s, x, y, o = {}) => { const { size = 80, col = PAL.ink, align = 'center', rot = 0, alpha = 1, sw = 0, sk = 'rgba(10,9,14,.92)', weight = 700 } = o; if (alpha <= 0 || GA <= 0) return;
    g.save(); g.globalAlpha = GA * alpha; g.translate(x + J(77, 1.1), y + J(78, 1.1)); if (rot) g.rotate(rot); g.font = `${weight} ${size}px "${FONT}"`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (sw > 0) { g.strokeStyle = sk; g.lineWidth = sw; g.strokeText(s, 0, 0); } g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); };
  Hd.measure = (s, size, weight = 700) => { g.save(); g.font = `${weight} ${size}px "${FONT}"`; const w = g.measureText(s).width; g.restore(); return w; };
  // label tag: hand-boxed text. k = pop scale 0..1
  Hd.tag = (s, x, y, o = {}) => { const { size = 64, col = PAL.ink, k = 1, rot = 0, fillc = null, pad = 34, seed = 1 } = o; if (k <= .02) return; const w = Hd.measure(s, size) + pad * 2, h = size * 1.25;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.translate(-x, -y);
    if (fillc) Hd.fill(rectPts(x - w / 2, y - h / 2, w, h), fillc, .22, 4);
    Hd.poly([[x - w / 2 + 14, y - h / 2], [x + w / 2 - 14, y - h / 2], [x + w / 2, y - h / 2 + 14], [x + w / 2, y + h / 2 - 14], [x + w / 2 - 14, y + h / 2], [x - w / 2 + 14, y + h / 2], [x - w / 2, y + h / 2 - 14], [x - w / 2, y - h / 2 + 14], [x - w / 2 + 14, y - h / 2]], { col, w: 5, seed });
    Hd.txt(s, x, y + 4, { size, col }); g.restore(); };
  Hd.sparkle = (x, y, r, col = PAL.org) => { Hd.poly([[x, y - r], [x, y + r]], { col, w: 5, amp: 1 }); Hd.poly([[x - r, y], [x + r, y]], { col, w: 5, amp: 1, seed: 2 }); };
  return Hd;
}
