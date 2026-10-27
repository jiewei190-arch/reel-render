// Shadow-puppet kit (vertical 1080x1920). Original code; technique ported from the grammar in
// repos/lemo-opuscar/styles/shadow-puppet/STYLE.md (hide transmission x lamp x cloth, evenodd lace carving).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, a, b) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
export const win = (t, a, b, f = .4) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const FONT = '"Cormorant Garamond", Georgia, serif';
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
export const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
export const shade = (c, k) => toHex(hex(c).map(v => v * k));
// dyes (all colour is transmitted light: they multiply on white)
export const DYE = { sun: ['#f8c553', '#e9772a'], moon: ['#a9bbe4', '#5f78b8'], ink: ['#241338', '#120a20'], earth: ['#58bfa8', '#2a66ae'],
  plum: ['#9c3d6c', '#6a2050'], red: ['#e8563a', '#b52c2c'], card: ['#f4c76a', '#e2933a'], hide: ['#f6e2b8', '#ecc98a'], green: ['#7cc06a', '#3f9162'] };
export const trem = (seed, t, a = 1.6) => [Math.sin(t * 9.1 + seed * 3.1) * a * .6 + Math.sin(t * 23 + seed) * a * .4, Math.cos(t * 8.3 + seed * 1.7) * a * .6 + Math.sin(t * 19 + seed * 2) * a * .4];

// ---- path builders (local coords; holes are sub-paths inside an outline, evenodd) ----
export const circ = (p, x, y, r) => { p.moveTo(x + r, y); p.arc(x, y, r, 0, TAU); };
export const ring = (p, r1, r2, x = 0, y = 0) => { circ(p, x, y, r2); circ(p, x, y, r1); };
export const ell = (p, x, y, rx, ry, rot = 0) => { p.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); p.ellipse(x, y, rx, ry, rot, 0, TAU); };
export const poly = (p, pts) => { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); };
export const star = (p, r0, r1, n, rot = 0, x = 0, y = 0, jit = 0) => {
  const pts = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r0 : r1 * (1 + jit * (hash(i * 3.3) - .5)); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } poly(p, pts);
};

// ---- dyed, carved piece. Everything drawn with multiply; holes (evenodd) stay bright ----
export function dye(g, build, cols, o = {}) {
  const p = new Path2D(); build(p); const r = o.r || 200;
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha *= (o.a ?? 1);
  const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1] || cols[0]);
  g.fillStyle = gr; g.fill(p, 'evenodd');
  if (o.edge !== false) { g.lineWidth = o.lw || 3; g.lineJoin = 'round'; g.strokeStyle = o.edge || shade(cols[1] || cols[0], .62); g.stroke(p); }
  g.restore();
}
export function at(g, x, y, rot, sc, fn) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); fn(); g.restore(); }
export function rod(g, x, y0, a = .85) { dye(g, p => poly(p, [[x - 3, y0], [x + 3, y0], [x + 4.5, 2100], [x - 4.5, 2100]]), ['#4a2c1a'], { edge: false, a }); }
export function inkText(g, s, x, y, size, col = '#2a120a', o = {}) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.globalAlpha *= (o.a ?? 1); g.font = `italic ${o.w || 700} ${size}px ${FONT}`;
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = (o.ls ?? 3) + 'px'; g.fillText(s, x, y); g.restore();
}
export function plaque(g, x, y, w, h, lines, size = 60, o = {}) {
  dye(g, p => { p.roundRect(x - w / 2, y - h / 2, w, h, 24); p.roundRect(x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 15); p.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 10); },
    o.cols || DYE.card, { r: w / 2, edge: o.edge || '#7a3a14' });
  const n = lines.length; lines.forEach((s, i) => inkText(g, s, x, y + (i - (n - 1) / 2) * size * 1.1, size, o.ink || '#2a120a', { ls: o.ls }));
}
export function tag(g, s, x, y, size = 40, o = {}) {
  g.save(); g.font = `italic 700 ${size}px ${FONT}`; if ('letterSpacing' in g) g.letterSpacing = '3px'; const w = g.measureText(s).width + 70; g.restore();
  plaque(g, x, y, Math.max(w, 150), size + 44, [s], size, o);
}

// ---- puppets ----
export function sun(g, x, y, R, t, o = {}) {
  const j = trem(x * .01, t, 1.4);
  at(g, x + j[0], y + j[1], (o.rot || 0) + .035 * Math.sin(t * .8 + x), 1, () => {
    dye(g, p => {
      star(p, R * 1.02, R * 1.3, 28, 0, 0, 0, .12);
      ring(p, R * .8, R * .8 + 5);
      for (let i = 0; i < 20; i++) { const a = i * TAU / 20; circ(p, Math.cos(a) * R * .91, Math.sin(a) * R * .91, R * .04); }
      ring(p, R * .55, R * .55 + 5);
      for (let i = 0; i < 14; i++) { const a = i * TAU / 14 + .1; ell(p, Math.cos(a) * R * .67, Math.sin(a) * R * .67, R * .07, R * .035, a); }
      for (let i = 0; i < 10; i++) { const a = i * TAU / 10; ell(p, Math.cos(a) * R * .32, Math.sin(a) * R * .32, R * .08, R * .04, a); }
      circ(p, 0, 0, R * .1);
    }, o.cols || DYE.sun, { r: R * 1.3, edge: '#8a3a12' });
  });
}
export function moon(g, x, y, r, t, o = {}) {
  const j = trem(x * .013 + 2, t, 1.4), dk = o.dark ?? 0;
  at(g, x + j[0], y + j[1], 0, 1, () => {
    const crat = [[-.35, -.3, .17], [.3, -.4, .11], [.38, .12, .16], [-.1, .38, .13], [-.5, .15, .08], [.05, -.05, .07], [.15, .55, .06]];
    dye(g, p => {
      circ(p, 0, 0, r);
      if (dk < .5) { ring(p, r * .86, r * .86 + 4); crat.forEach(c => circ(p, c[0] * r, c[1] * r, c[2] * r)); }
    }, [mixc(DYE.moon[0], '#1c1030', dk), mixc(DYE.moon[1], '#0e0820', dk)], { r, edge: dk > .5 ? '#0a0614' : '#2d3f78' });
  });
}
export function earth(g, x, y, r, t, o = {}) {
  at(g, x, y, (o.rot || 0) + .02 * Math.sin(t * .7), 1, () => {
    dye(g, p => {
      circ(p, 0, 0, r); ring(p, r * .9, r * .9 + 4);
      ell(p, -r * .3, -r * .28, r * .26, r * .17, .5); ell(p, -r * .12, -r * .1, r * .1, r * .16, -.3); ell(p, r * .3, r * .1, r * .22, r * .15, .2);
      ell(p, r * .12, r * .42, r * .13, r * .09, 0); ell(p, -r * .45, r * .25, r * .09, r * .13, .6);
      ring(p, r * .62, r * .62 + 3); ring(p, r * .34, r * .34 + 3);
    }, DYE.earth, { r, edge: '#16405e' });
  });
}
export function person(g, x, y, s, t, o = {}) {
  const arms = o.arms ?? 1;
  at(g, x, y, 0, s, () => {
    dye(g, p => {
      circ(p, 0, -112, 15);
      poly(p, [[-13, -92], [13, -92], [19, -38], [-19, -38]]);
      poly(p, [[-17, -38], [-4, -38], [-5, 0], [-18, 0]]); poly(p, [[4, -38], [17, -38], [18, 0], [5, 0]]);
      const up = arms * 44; poly(p, [[-11, -88], [-44, -88 - up], [-37, -94 - up], [-6, -80]]); poly(p, [[11, -88], [44, -88 - up], [37, -94 - up], [6, -80]]);
    }, DYE.plum, { r: 70, edge: '#40122e', lw: 2 });
  });
}
export function hill(g, y, w = 1700) {
  dye(g, p => { p.moveTo(-300, 2000); p.lineTo(-300, y + 70); p.quadraticCurveTo(300, y - 90, 540, y); p.quadraticCurveTo(800, y + 80, 1400, y - 50); p.lineTo(1400, 2000); p.closePath();
    for (let i = 0; i < 26; i++) { const xx = -40 + i * 46; circ(p, xx, y + 120 + (i % 3) * 36, 7); } }, DYE.ink, { r: 600, edge: '#07030c' });
}

// ---- stage: hide layer -> lamp -> cloth -> bloom -> vignette ----
export function createSP(canvas) {
  canvas.width = W; canvas.height = H; const main = canvas.getContext('2d');
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const hide = mk(W, H), g = hide.getContext('2d'), s1 = mk(135, 240), s1g = s1.getContext('2d'), s2 = mk(34, 60), s2g = s2.getContext('2d');
  const tile = mk(256, 256), tg = tile.getContext('2d'), id = tg.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const cx = x >> 2, cy = y >> 2, odd = (cx + cy) & 1, th = odd ? Math.sin(x * Math.PI / 4) ** 2 : Math.sin(y * Math.PI / 4) ** 2;
    const v = (.8 + .2 * (.55 * th + .45 * (.5 + .5 * hash(cx * 7 + cy * 131)))) * 255, k = (y * 256 + x) * 4; id.data[k] = v; id.data[k + 1] = v * .99; id.data[k + 2] = v * .96; id.data[k + 3] = 255;
  }
  tg.putImageData(id, 0, 0); const pat = main.createPattern(tile, 'repeat');
  const R = { g, main, dim: 0, hot: [540, 860], T: 0, glows: [],
    begin(t) { this.T = t; this.dim = 0; this.glows.length = 0; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); },
    cam(s, cx, cy, ty = 800) { g.setTransform(s, 0, 0, s, 540 - s * cx, ty - s * cy); },
    glow(x, y, r, col, a) { const m = g.getTransform(); this.glows.push([m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f, r * m.a, col, a * g.globalAlpha]); },
    finish() {
      const m = main, t = this.T; m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1;
      const fl = 1 + .025 * Math.sin(t * 43.98 + 1.3) + .015 * Math.sin(t * 17.1) + .01 * Math.sin(t * 71.3), d = this.dim;
      const stops = [[0, [255, 247, 218]], [.3, [255, 222, 152]], [.7, [200, 120, 58]], [1, [76, 36, 20]]];
      const lg = m.createRadialGradient(this.hot[0], this.hot[1], 0, this.hot[0], this.hot[1], 1350);
      stops.forEach(([s, c]) => lg.addColorStop(s, `rgb(${[c[0] * lerp(1, .09, d), c[1] * lerp(1, .1, d), c[2] * lerp(1, .2, d)].map(v => Math.round(clamp(v * fl, 0, 255))).join(',')})`));
      m.fillStyle = lg; m.fillRect(0, 0, W, H);
      m.globalCompositeOperation = 'multiply'; m.drawImage(hide, 0, 0); m.fillStyle = pat; m.fillRect(0, 0, W, H);
      m.globalCompositeOperation = 'lighter';
      for (const [x, y, r, col, a] of this.glows) { const gg = m.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)'); m.globalAlpha = a * fl; m.fillStyle = gg; m.fillRect(x - r, y - r, 2 * r, 2 * r); }
      m.globalAlpha = 1;
      s1g.drawImage(canvas, 0, 0, 135, 240); s2g.drawImage(s1, 0, 0, 34, 60);
      m.imageSmoothingEnabled = true; m.globalAlpha = .2; m.drawImage(s1, 0, 0, W, H); m.globalCompositeOperation = 'screen'; m.globalAlpha = .28; m.drawImage(s2, 0, 0, W, H);
      m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1;
      const vg = m.createRadialGradient(540, 900, 520, 540, 960, 1250); vg.addColorStop(0, 'rgba(24,8,2,0)'); vg.addColorStop(1, 'rgba(24,8,2,.62)'); m.fillStyle = vg; m.fillRect(0, 0, W, H);
    } };
  return R;
}

// ---- storyteller's placard: dark lacquer, gold rule, Cormorant italic ----
export function placard(m, cap, a = 1, size = 54) {
  if (!cap || a <= 0) return;
  const segs = cap.split('**').map((s, i) => [s, i % 2 === 1]); const words = [];
  segs.forEach(([s, b]) => s.split(/(\s+)/).forEach(w => { if (w) words.push([w, b]); }));
  m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = a; m.font = `italic 700 ${size}px ${FONT}`; m.textBaseline = 'middle'; if ('letterSpacing' in m) m.letterSpacing = '0px';
  const maxW = 860, lines = [[]]; let lw = 0;
  words.forEach(([w, b]) => { const ww = m.measureText(w).width; if (lw + ww > maxW && !/^\s+$/.test(w) && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (!(lines[lines.length - 1].length === 0 && /^\s+$/.test(w))) { lines[lines.length - 1].push([w, b, ww]); lw += ww; } });
  const lh = size * 1.18, ph = lines.length * lh + 56, cy = 1690, y0 = cy - ph / 2;
  m.fillStyle = 'rgba(20,10,6,.93)'; m.beginPath(); m.roundRect(70, y0, 940, ph, 22); m.fill();
  m.strokeStyle = '#d9a441'; m.lineWidth = 3; m.beginPath(); m.roundRect(70, y0, 940, ph, 22); m.stroke();
  m.strokeStyle = 'rgba(217,164,65,.55)'; m.lineWidth = 1.5; m.beginPath(); m.roundRect(82, y0 + 12, 916, ph - 24, 14); m.stroke();
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + w[2], 0); let x = 540 - tw / 2; const y = y0 + 28 + lh * (i + .5);
    ln.forEach(([w, b, ww]) => { m.fillStyle = b ? '#ffc65a' : '#f6e6c6'; m.fillText(w, x, y); x += ww; }); });
  m.restore();
}
