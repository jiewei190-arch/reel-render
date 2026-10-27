// cartoon.js: vertical 1080x1920 flat 2D cartoon renderer (Canvas2D, deterministic, pure function of t).
// Grammar: bold rounded shapes, thick dark outline, flat fill + ONE shade tone, squash-and-stretch, big expressive eyes,
// bright saturated palette, simple layered backgrounds. Original code, no characters copied.
export const W = 1080, H = 1920;
export const PAL = {
  ink: '#2b1f3a', cream: '#fff4dc', white: '#ffffff', sky: '#7fd3f7', skyD: '#4fb3e8', sun: '#ffcf3f', sunD: '#f2a91d',
  coral: '#ff6b5e', coralD: '#e04a4a', pink: '#ff9ec0', pinkD: '#ec6f9d', mint: '#5fdba7', mintD: '#2fb67f',
  purple: '#9b6bff', purpleD: '#6f45d6', orange: '#ff9a3c', orangeD: '#e9741a', blue: '#3e7bff', blueD: '#2a55c9',
  skin: '#ffd0a8', skinD: '#f2a97c', hair: '#6b3b2a', lime: '#b8e84a', limeD: '#86c22a',
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 2.2; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
// damped spring-ish wobble 0..1..0 after trigger time t0 (for squash/stretch pops)
export const boing = (t, t0, d = .6) => { const u = (t - t0) / d; return u < 0 || u > 1 ? 0 : Math.sin(u * Math.PI * 3) * Math.pow(1 - u, 2); };
export const FONT = 'Fredoka', FONT2 = 'Lilita One';

export function createCT(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d'); let T = 0;
  const C = { g, W, H, PAL };
  C.begin = (t, bg = PAL.sky) => { T = t; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = bg; g.fillRect(0, 0, W, H); };
  // transform wrapper: translate, rotate, non-uniform scale (squash & stretch)
  C.xf = (x, y, sx, sy, rot, fn) => { g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(sx, sy == null ? sx : sy); fn(); g.restore(); };
  // path builders (call inside a path function)
  C.rr = (x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  C.ell = (cx, cy, rx, ry) => { g.moveTo(cx + rx, cy); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); };
  // wobbly blob (smooth closed curve)
  C.blob = (cx, cy, rx, ry, wob = .08, seed = 1, ph = 0, n = 12) => {
    const P = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + wob * Math.sin(a * 3 + seed * 2 + ph) + wob * .6 * Math.sin(a * 2 + seed * 5 - ph); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    g.moveTo((P[0][0] + P[n - 1][0]) / 2, (P[0][1] + P[n - 1][1]) / 2);
    for (let i = 0; i < n; i++) { const p = P[i], q = P[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); };
  C.poly = (pts, r = 0) => { pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  C.star = (cx, cy, r1, r2, n, rot = 0) => { const P = []; for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? r2 : r1; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } C.poly(P); };
  // flat shape: base fill, one shade tone (crescent on lower-right), thick rounded outline
  C.shape = (path, fill, o = {}) => {
    const { shade = null, lw = 14, off = 16, line = PAL.ink, alpha = 1, noLine = false } = o;
    g.save(); g.globalAlpha *= alpha; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath(); path(); g.fillStyle = fill; g.fill();
    if (shade) { g.save(); g.beginPath(); path(); g.clip(); g.fillStyle = shade; g.fillRect(-4000, -4000, 8000, 8000);
      g.translate(-off, -off * .8); g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.restore(); }
    if (!noLine) { g.beginPath(); path(); g.strokeStyle = line; g.lineWidth = lw; g.stroke(); }
    g.restore(); };
  C.line = (pts, w = 14, col = PAL.ink) => { g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); };
  C.curve = (x0, y0, cx, cy, x1, y1, w = 14, col = PAL.ink) => { g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); g.restore(); };
  // outlined thick stroke (nerve wires, tubes): ink under, colour over
  C.tube = (fn, w, col, colD) => { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); fn(); g.strokeStyle = PAL.ink; g.lineWidth = w + 14; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); g.restore(); };
  // text with ink stroke
  C.txt = (s, x, y, o = {}) => { const { size = 60, col = PAL.white, sw = size * .2, font = FONT, weight = 700, align = 'center', rot = 0, sx = 1, sy = 1, alpha = 1, stroke = PAL.ink } = o;
    g.save(); g.globalAlpha *= alpha; g.translate(x, y); if (rot) g.rotate(rot); g.scale(sx, sy); g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (sw > 0) { g.strokeStyle = stroke; g.lineWidth = sw; g.strokeText(s, 0, 0); } g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); };
  C.measure = (s, size, font = FONT, weight = 700) => { g.save(); g.font = `${weight} ${size}px "${font}"`; const w = g.measureText(s).width; g.restore(); return w; };
  // label pill
  C.pill = (s, x, y, o = {}) => { const { size = 44, col = PAL.white, fill = PAL.purple, shade = PAL.purpleD, rot = 0, k = 1, padX = 34 } = o; if (k <= .01) return;
    const w = C.measure(s, size) + padX * 2, h = size * 1.5;
    C.xf(x, y, k, k, rot, () => { C.shape(() => C.rr(-w / 2, -h / 2, w, h, h / 2), fill, { shade, lw: 10, off: 8 }); C.txt(s, 0, 2, { size, col, sw: 0 }); }); };
  // sound-effect burst
  C.burst = (s, x, y, o = {}) => { const { r = 190, fill = PAL.sun, shade = PAL.sunD, size = 96, rot = 0, k = 1, tcol = PAL.coral } = o; if (k <= .01) return;
    C.xf(x, y, k, k, rot, () => { C.shape(() => C.star(0, 0, r, r * .66, 11, .1), fill, { shade, lw: 14, off: 14 }); C.txt(s, 0, 6, { size, col: tcol, font: FONT2, weight: 400, sw: size * .16 }); }); };
  // eyes: big, expressive. mood: 'happy' | 'shock' | 'squint' | 'sad' | 'smug' | 'dizzy' | 'closed'
  C.eyes = (x, y, s = 1, o = {}) => { const { look = [0, 0], blink = 0, mood = 'happy', gap = 1, t = T } = o;
    const bl = blink != null && blink > 0 ? blink : 0;
    for (const sd of [-1, 1]) {
      const ex = x + sd * 52 * s * gap, ey = y; g.save(); g.translate(ex, ey);
      if (mood === 'closed' || mood === 'squint') { // happy arcs or tight lines
        g.strokeStyle = PAL.ink; g.lineWidth = 14 * s; g.lineCap = 'round'; g.beginPath();
        if (mood === 'closed') { g.moveTo(-28 * s, 0); g.quadraticCurveTo(0, 22 * s, 28 * s, 0); } else { g.moveTo(-26 * s, 8 * s); g.lineTo(26 * s, -4 * s * sd); }
        g.stroke(); g.restore(); continue; }
      const rx = (mood === 'shock' ? 38 : 34) * s, ry = (mood === 'shock' ? 46 : 42) * s * (1 - .92 * bl);
      C.shape(() => C.ell(0, 0, rx, Math.max(2, ry)), PAL.white, { lw: 11 * s });
      if (bl < .6) {
        const px = look[0] * 12 * s, py = look[1] * 14 * s, pr = (mood === 'shock' ? 11 : 19) * s;
        if (mood === 'dizzy') { g.strokeStyle = PAL.ink; g.lineWidth = 6 * s; g.beginPath(); for (let a = 0; a < 14; a += .2) { const rr = a * 2.2 * s; g.lineTo(Math.cos(a + t * 8 * sd) * rr, Math.sin(a + t * 8 * sd) * rr); } g.stroke(); }
        else { g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(px, py, pr, pr * 1.08, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(px - pr * .35, py - pr * .4, pr * .32, 0, 7); g.fill(); }
      }
      g.restore();
    }
    if (mood === 'sad' || mood === 'smug') { for (const sd of [-1, 1]) C.line([[x + sd * 52 * s * gap - 36 * s, y - 62 * s + (mood === 'sad' ? -sd * 12 * s : 0)], [x + sd * 52 * s * gap + 36 * s, y - 62 * s + (mood === 'sad' ? sd * 12 * s : 8 * s)]], 10 * s); }
  };
  C.blinkAt = (t, seed = 0) => { const p = (t + seed * 1.7) % 3.6; return p < .14 ? Math.sin(p / .14 * Math.PI) : 0; };
  // mouth: open 0..1, w width
  C.mouth = (x, y, w, open = 0, kind = 'smile') => {
    g.save(); g.translate(x, y);
    if (open < .08) { g.strokeStyle = PAL.ink; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath();
      if (kind === 'smile') { g.moveTo(-w / 2, 0); g.quadraticCurveTo(0, w * .42, w / 2, 0); } else if (kind === 'frown') { g.moveTo(-w / 2, w * .2); g.quadraticCurveTo(0, -w * .2, w / 2, w * .2); } else { g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); } g.stroke(); }
    else { const h = w * .8 * open; C.shape(() => { g.moveTo(-w / 2, -h * .1); g.quadraticCurveTo(0, -h * .25, w / 2, -h * .1); g.quadraticCurveTo(w * .42, h, 0, h); g.quadraticCurveTo(-w * .42, h, -w / 2, -h * .1); g.closePath(); }, '#7a1f3d', { lw: 11 });
      g.save(); g.beginPath(); g.moveTo(-w / 2, -h * .1); g.quadraticCurveTo(0, -h * .25, w / 2, -h * .1); g.quadraticCurveTo(w * .42, h, 0, h); g.quadraticCurveTo(-w * .42, h, -w / 2, -h * .1); g.clip();
      g.fillStyle = '#ff7c9c'; g.beginPath(); g.ellipse(0, h * .95, w * .26, h * .42, 0, 0, 7); g.fill(); g.restore(); }
    g.restore(); };
  C.cheeks = (x, y, s = 1, gap = 1) => { g.save(); g.globalAlpha = .55; g.fillStyle = PAL.coral; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x + sd * 96 * s * gap, y, 20 * s, 13 * s, 0, 0, 7); g.fill(); } g.restore(); };
  // layered flat background: base colour, big soft circles, halftone dots
  C.bg = (base, c1, c2, t) => { g.fillStyle = base; g.fillRect(0, 0, W, H);
    g.fillStyle = c1; g.beginPath(); g.arc(160 + 30 * Math.sin(t * .5), 360, 330, 0, 7); g.fill(); g.beginPath(); g.arc(980, 1240 + 24 * Math.cos(t * .4), 420, 0, 7); g.fill();
    g.fillStyle = c2; for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) { const x = 60 + c * 190 + (r % 2) * 95, y = 1400 + r * 70; if (y > 1900) continue; g.globalAlpha = .5; g.beginPath(); g.arc(x, y, 7 + (r * .5), 0, 7); g.fill(); } g.globalAlpha = 1; };
  C.ground = (y, col, colD) => { C.shape(() => C.rr(-40, y, W + 80, H - y + 80, 0), col, { shade: null, lw: 14 }); g.fillStyle = colD; g.fillRect(-40, y + 8, W + 80, 26); };
  // iris wipe (next act revealed through a growing ring)
  C.iris = (u, cx, cy, fn) => { if (u <= 0) return; g.save(); const r = u * 1500; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); fn(); g.restore(); g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.strokeStyle = PAL.ink; g.lineWidth = 22; g.stroke(); g.restore(); };
  // bouncing arrow
  C.arrow = (x0, y0, x1, y1, col = PAL.sun, w = 26) => { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); C.xf(x0, y0, 1, 1, a, () => { C.shape(() => { g.moveTo(0, -w / 2); g.lineTo(L - w * 1.6, -w / 2); g.lineTo(L - w * 1.6, -w * 1.2); g.lineTo(L, 0); g.lineTo(L - w * 1.6, w * 1.2); g.lineTo(L - w * 1.6, w / 2); g.lineTo(0, w / 2); g.closePath(); }, col, { lw: 10 }); }); };
  return C;
}
