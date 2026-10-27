// silkscreen.js: vertical (1080x1920) silkscreen-poster kit. Canvas2D only, CPU-cheap, deterministic (everything is a function of t).
// Technique ported from the Lemo silkscreen-poster grammar: opaque flat inks, one pull per colour, stepped bands (no gradients),
// registration slips, overprint ghosts, ink rims, paper fibres/pinholes. No Lemo code or assets are used.
export const W = 1080, H = 1920;
export const PAL = {
  paper: '#f2e8d2', paperDk: '#e3d6b7',
  sky1: '#cfe3df', sky2: '#8fc1be', teal: '#2f7f86', coral: '#e8553d', navy: '#1d2b45', sun: '#f4b52c',
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ease = u => u * u * (3 - 2 * u);
export const eio = ease;
export const backOut = u => { u = clamp(u); const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
export function shade(hex, k) { // k<0 darker, k>0 lighter (toward white)
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

// ---- path helpers: every shape is a Path2D, so any shape can be printed in any ink --------------------------------
export function rrect(x, y, w, h, r) { const p = new Path2D(); r = Math.min(r, w / 2, h / 2); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; }
export function circle(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; }
export function poly(pts) { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; }
export function rect(x, y, w, h) { const p = new Path2D(); p.rect(x, y, w, h); return p; }
export function ring(x, y, r0, r1) { const p = new Path2D(); p.arc(x, y, r1, 0, Math.PI * 2); p.arc(x, y, r0, 0, Math.PI * 2, true); return p; }
export function tube(pts, w) { // a thick polyline with mitred round joins as one path (for wires)
  const p = new Path2D(); const h = w / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * h, ny = dx / l * h;
    p.moveTo(x0 + nx, y0 + ny); p.lineTo(x1 + nx, y1 + ny); p.lineTo(x1 - nx, y1 - ny); p.lineTo(x0 - nx, y0 - ny); p.closePath();
  }
  for (const [x, y] of pts) { p.moveTo(x + h, y); p.arc(x, y, h, 0, Math.PI * 2); }
  return p;
}
export function bolt(x, y, s) { return poly([[0, -1], [-.62, .12], [-.12, .12], [-.34, 1], [.66, -.18], [.1, -.18], [.4, -1]].map(([a, b]) => [x + a * s, y + b * s])); }
export function star(x, y, r0, r1, n = 8, rot = 0) { const o = []; for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * Math.PI * 2, r = i % 2 ? r0 : r1; o.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return poly(o); }

// ---- renderer ------------------------------------------------------------------------------------------------------
export function createSS(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const g = canvas.getContext('2d'); const R = { g, W, H, regN: 0 };

  // paper: cream with fibres and mottle (built once)
  const paper = mk(W, H), pg = paper.getContext('2d'); pg.fillStyle = PAL.paper; pg.fillRect(0, 0, W, H);
  for (let i = 0; i < 520; i++) { const x = hash(i * 1.37) * W, y = hash(i * 2.11 + 4) * H, r = 60 + hash(i * 3.3) * 160; pg.fillStyle = hash(i * 5.1) > .5 ? 'rgba(206,186,140,.045)' : 'rgba(255,250,232,.06)'; pg.beginPath(); pg.arc(x, y, r, 0, 6.3); pg.fill(); }
  pg.lineCap = 'round';
  for (let i = 0; i < 2600; i++) { const x = hash(i * 7.7) * W, y = hash(i * 9.1 + 1) * H, a = hash(i * 4.4) * 6.3, l = 8 + hash(i * 6.6) * 22; pg.strokeStyle = hash(i * 8.8) > .5 ? 'rgba(176,150,100,.10)' : 'rgba(255,255,245,.30)'; pg.lineWidth = 1.2; pg.beginPath(); pg.moveTo(x, y); pg.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); pg.stroke(); }
  // grain tile (multiply on ink) and pinhole tile (paper-coloured specks, only visible on ink)
  const gt = mk(256, 256), gg = gt.getContext('2d'), gi = gg.createImageData(256, 256);
  for (let i = 0; i < gi.data.length; i += 4) { const n = hash(i * .37) * .6 + hash(i * 1.91 + 7) * .4; const v = 232 + n * 23; gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 255; }
  gg.putImageData(gi, 0, 0);
  const grainPat = g.createPattern(gt, 'repeat');
  const ph = mk(384, 384), phg = ph.getContext('2d'); phg.fillStyle = PAL.paper;
  for (let i = 0; i < 70; i++) { phg.globalAlpha = .55 + hash(i * 3.1) * .4; phg.beginPath(); phg.arc(hash(i * 1.7) * 384, hash(i * 2.9 + 3) * 384, .7 + hash(i * 5.3) * 1.5, 0, 6.3); phg.fill(); }
  const pinPat = g.createPattern(ph, 'repeat');

  R.begin = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(paper, 0, 0); };
  R.finish = () => { // paper texture over the inks: mottle multiply, then pinholes
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .62; g.globalCompositeOperation = 'multiply'; g.fillStyle = grainPat; g.fillRect(0, 0, W, H);
    g.globalAlpha = .8; g.globalCompositeOperation = 'source-over'; g.fillStyle = pinPat; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  };

  // one flat ink: registration slip per ink layer, overprint ghost, thin light/dark rims (fill only, never lines)
  R.ink = (path, col, o = {}) => {
    const k = o.reg ?? 0, dx = (hash(k * 3.7) - .5) * 5, dy = (hash(k * 5.9 + 2) - .5) * 5;
    g.save(); g.translate(dx, dy);
    if (!o.noGhost) { g.save(); g.translate(2.2, 2.2); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .38; g.fillStyle = shade(col, -.45); g.fill(path); g.restore(); }
    g.fillStyle = col; g.fill(path);
    if (!o.noRim) {
      g.save(); g.clip(path); g.lineWidth = 7; g.lineJoin = 'round';
      g.save(); g.translate(2.6, 2.6); g.strokeStyle = 'rgba(255,255,255,.22)'; g.stroke(path); g.restore();
      g.save(); g.translate(-2.6, -2.6); g.strokeStyle = 'rgba(0,0,0,.20)'; g.stroke(path); g.restore();
      g.restore();
    }
    g.restore();
  };

  // squeegee pull: reveal fn() behind a ragged front moving along dir through box [x0,y0,x1,y1]; blade + bead ride on the front
  R.pull = (p, box, dir, fn, o = {}) => {
    if (p <= 0) return false;
    const [x0, y0, x1, y1] = box;
    if (p >= 1) { fn(); return true; }
    const horiz = dir === 'r' || dir === 'l', fwd = dir === 'r' || dir === 'd';
    const len = horiz ? x1 - x0 : y1 - y0, cross = horiz ? y1 - y0 : x1 - x0;
    const pos = (fwd ? p : 1 - p) * len; // front coordinate from box start
    g.save(); g.beginPath();
    const steps = Math.max(8, Math.ceil(cross / 28));
    const pts = [];
    for (let i = 0; i <= steps; i++) { const u = i / steps, jag = (hash(i * 1.9 + (o.seed || 0)) - .5) * 26; pts.push([pos + jag, u * cross]); }
    const toXY = ([a, b]) => horiz ? [x0 + a, y0 + b] : [x0 + b, y0 + a];
    if (fwd) { const s0 = horiz ? [x0 - 4000, y0 - 4000] : [x0 - 4000, y0 - 4000]; }
    // build polygon "behind" the front: extend far back so large layers cover everything left of/above the front
    const far = fwd ? -4000 : len + 4000;
    const poly2 = [toXY([far, -4000]), ...pts.map(toXY), toXY([far, cross + 4000])];
    poly2.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
    fn(); g.restore();
    if (o.blade !== false) { // blade, bead and a sliver of handle
      g.save();
      const fx = horiz ? x0 + pos : x0, fy = horiz ? y0 : y0 + pos;
      g.translate(fx, fy); if (!horiz) g.rotate(-Math.PI / 2); g.rotate(.045);
      const L = cross + 80, d = fwd ? 1 : -1;
      g.fillStyle = PAL.navy; g.fillRect(-d * 4 - (fwd ? 0 : 22), -20, 22, L);
      g.fillStyle = shade(PAL.navy, .18); g.fillRect(-d * 4 - (fwd ? 0 : 22), -20, 6, L);
      g.fillStyle = o.col || PAL.coral;
      g.save(); g.beginPath(); g.rect(fwd ? -34 : 12, -14, 22, L - 12); g.clip();
      for (let i = 0; i < L / 14; i++) { g.beginPath(); g.arc(fwd ? -23 : 23, -4 + i * 14, 11 + hash(i * 2 + (o.seed || 0)) * 3, 0, 6.3); g.fill(); }
      g.restore();
      g.fillStyle = shade(PAL.navy, .1); g.fillRect(fwd ? 18 : -88, L / 2 - 36, 70, 26); // handle sliver
      g.restore();
    }
    return true;
  };

  // type: condensed display (Big Shoulders Display) and geometric labels (Outfit). Auto-fit to maxW.
  R.font = (kind, size, weight) => kind === 'disp' ? `${weight || 800} ${size}px "Big Shoulders Display"` : `${weight || 600} ${size}px Outfit`;
  R.fit = (txt, kind, size, maxW, weight, spacing = 0) => { g.font = R.font(kind, size, weight); g.letterSpacing = spacing + 'px'; const w = g.measureText(txt).width; return w > maxW ? size * maxW / w : size; };
  R.text = (txt, x, y, o = {}) => {
    const kind = o.kind || 'disp'; let size = o.size || 80; if (o.maxW) size = R.fit(txt, kind, size, o.maxW, o.weight, o.spacing || 0);
    g.save(); g.font = R.font(kind, size, o.weight); g.letterSpacing = (o.spacing || 0) + 'px'; g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'alphabetic';
    const w = g.measureText(txt).width;
    if (o.reveal !== undefined && o.reveal < 1) { if (o.reveal <= 0) { g.restore(); return w; } const lx = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2; g.beginPath(); g.rect(lx - 6, y - size * 1.2, w * o.reveal + 6, size * 1.6); g.clip(); }
    if (o.shadow) { g.fillStyle = o.shadow; g.fillText(txt, x + 4, y + 4); }
    g.fillStyle = o.col || PAL.navy; g.fillText(txt, x, y); g.restore(); return w;
  };
  R.measure = (txt, kind, size, weight, spacing = 0) => { g.save(); g.font = R.font(kind, size, weight); g.letterSpacing = spacing + 'px'; const w = g.measureText(txt).width; g.restore(); return w; };
  return R;
}
