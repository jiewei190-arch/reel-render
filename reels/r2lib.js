// Shared 2D-canvas helpers for batch A reels. Each reel: t_<name>.js imports this, supplies draw(g,t,L) and calls boot().
export const W = 540, H = 960;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ramp = (t, a, b) => clamp((t - a) / (b - a));
export const eo = x => 1 - Math.pow(1 - clamp(x), 3);
export const ei = x => { x = clamp(x); return x * x * x };
export const E = x => { x = clamp(x); return x * x * (3 - 2 * x) };
export const bk = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2) };
export const rnd = (seed = 1) => { let t = seed >>> 0; return () => { t = (t * 1664525 + 1013904223) % 4294967296; return t / 4294967296 } };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s) };
export const TL = window.TL, P = TL.p;
export const S = i => P[i].start, En = i => P[i].end;
// index of the phrase being spoken (or last spoken)
export const cur = t => { let c = 0; for (let k = 0; k < P.length; k++) { if (t >= P[k].start - .02) c = k; else break } return c };

// wrapped caption with **highlight** words. opt: font, size, y, w, color, hl, weight, lh, shadow, bg(fn), align
export function caption(g, t, o = {}) {
  const ci = cur(t), last = ci === P.length - 1; if (ci < 0 || (!last && t > P[ci].end + .5)) return;
  const k = t - P[ci].start, a = clamp((k + .02) / .12) * (last ? 1 : clamp((P[ci].end + .5 - t) / .2));
  const size = o.size ?? 32, lh = (o.lh ?? 1.2) * size, maxW = o.w ?? 460;
  g.save(); g.globalAlpha = a; g.textBaseline = 'middle';
  // tokenise
  const words = []; let hlOn = false;
  P[ci].cap.split(/(\*\*)/).forEach(seg => { if (seg === '**') { hlOn = !hlOn; return } seg.split(/\s+/).filter(Boolean).forEach(w => words.push({ w, hl: hlOn })) });
  const font = (hl) => `${hl ? (o.hlWeight ?? 800) : (o.weight ?? 600)} ${size}px ${o.font ?? 'Inter'}`;
  const lines = []; let line = [], lw = 0;
  words.forEach(wd => { g.font = font(wd.hl); const ww = g.measureText(wd.w + ' ').width; if (lw + ww > maxW && line.length) { lines.push({ line, lw }); line = []; lw = 0 } line.push({ ...wd, ww }); lw += ww });
  lines.push({ line, lw });
  const y0 = (o.y ?? 150) + (1 - eo(k / .22)) * 10; const th = lines.length * lh;
  if (o.bg) o.bg(g, y0 - lh / 2 - 8, th + 16, Math.max(...lines.map(l => l.lw)));
  lines.forEach((L, i) => {
    let x = o.align === 'left' ? (o.x ?? 40) : W / 2 - L.lw / 2;
    L.line.forEach(wd => { g.font = font(wd.hl); g.textAlign = 'left';
      if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = o.shadowBlur ?? 10 }
      g.fillStyle = wd.hl ? (o.hl ?? '#fff') : (o.color ?? '#fff');
      if (o.stroke) { g.lineWidth = o.strokeW ?? 5; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(wd.w, x, y0 + i * lh) }
      g.fillText(wd.w, x, y0 + i * lh); g.shadowBlur = 0; x += wd.ww });
  });
  g.restore();
}

export function boot({ draw, fonts = [], dpr = 2 }) {
  const cv = document.getElementById('c'); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const g = cv.getContext('2d'); window.DUR = TL.total;
  window.seek = t => { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); draw(g, t) };
  Promise.all(fonts.map(f => document.fonts.load(f))).then(() => { window.seek(0); window.ready = true; window.READY = true });
}
