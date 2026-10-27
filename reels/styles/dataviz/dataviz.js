// dataviz.js: clean explainer / data-viz look. Off-white ground, ink text, one hot highlight (+ cold counterpart).
export const W = 1080, H = 1920;
export const C = { bg: '#F6F3EC', ink: '#1D2430', mute: '#8A909A', grid: '#DDD8CC', hot: '#E4572E', hot2: '#F2A05A', cold: '#2E86DE', cold2: '#9CCBF5', card: '#FFFFFF', hotT: '#FBE9E1', coldT: '#E6F0FA' };
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ramp = (t, a, b) => clamp((t - a) / (b - a));
export const ease = k => 1 - Math.pow(1 - clamp(k), 3);
export const easeIO = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const FONT = 'Inter, "DejaVu Sans", sans-serif';
export function createDV(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  return { g, begin() { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.lineJoin = 'round'; g.lineCap = 'round'; } };
}
export function text(g, s, x, y, o = {}) {
  const { size = 40, weight = 600, color = C.ink, align = 'center', alpha = 1, spacing = 0 } = o;
  if (alpha <= 0.01) return; g.save(); g.globalAlpha *= alpha; g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = spacing + 'px'; g.fillText(s, x, y); g.restore();
}
// caption with **bold** words in highlight colour, centred, wrapped
export function rich(g, cap, cx, y0, o = {}) {
  const { size = 58, maxW = 900, lh = 80, alpha = 1 } = o;
  const words = []; let b = false;
  cap.split('**').forEach((seg, i) => { if (i) b = !b; const parts = seg.split(/(\s+)/); let glue = i > 0 && seg.length && !/^\s/.test(seg) && words.length ? false : false;
    parts.forEach((w, j) => { if (!w.trim()) return; const gl = j === 0 && i > 0 && /^[.,!?;:)]/.test(w); words.push({ w, b, gl }); }); });
  const meas = x => { g.font = `${x.b ? 800 : 600} ${size}px ${FONT}`; return g.measureText(x.w).width + (x.gl ? 0 : 0) + g.measureText(' ').width; };
  const lines = []; let cur = [], cw = 0;
  for (const x of words) { const w = meas(x); if (cw + w > maxW && cur.length) { lines.push([cur, cw]); cur = []; cw = 0; } cur.push(x); cw += w; }
  if (cur.length) lines.push([cur, cw]);
  g.save(); g.globalAlpha *= alpha; g.textAlign = 'left'; g.textBaseline = 'middle';
  lines.forEach(([ws, w], li) => { let x = cx - w / 2; for (const t of ws) { g.font = `${t.b ? 800 : 600} ${size}px ${FONT}`; g.fillStyle = t.b ? C.hot : C.ink; if (t.gl) x -= g.measureText(' ').width; g.fillText(t.w, x, y0 + li * lh); x += g.measureText(t.w + ' ').width; } });
  g.restore();
}
export function polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
// draw first `frac` of polyline
export function drawOn(g, p, frac, o = {}) {
  const { color = C.ink, w = 6, dash = null, alpha = 1 } = o; if (frac <= 0) return;
  const tot = polyLen(p) * clamp(frac); let acc = 0; g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = w; if (dash) g.setLineDash(dash);
  g.beginPath(); g.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + d >= tot) { const k = (tot - acc) / d; g.lineTo(lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k)); break; } g.lineTo(p[i][0], p[i][1]); acc += d; }
  g.stroke(); g.restore();
}
export function arrow(g, x0, y0, x1, y1, frac, o = {}) {
  const { color = C.hot, w = 10, head = 30, alpha = 1 } = o; frac = clamp(frac); if (frac <= 0) return;
  const x = lerp(x0, x1, frac), y = lerp(y0, y1, frac), a = Math.atan2(y1 - y0, x1 - x0);
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.fillStyle = color; g.lineWidth = w;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x - Math.cos(a) * head * .5, y - Math.sin(a) * head * .5); g.stroke();
  if (frac > .15) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(a - .45) * head, y - Math.sin(a - .45) * head); g.lineTo(x - Math.cos(a + .45) * head, y - Math.sin(a + .45) * head); g.closePath(); g.fill(); }
  g.restore();
}
export function rrect(g, x, y, w, h, r, fill, stroke, lw = 4) {
  g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
export function count(a, b, k, dec = 0) { return lerp(a, b, ease(k)).toFixed(dec); }
