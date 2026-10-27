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
export const cfg = { hide: false };
export function dye(g, build, cols, o = {}) {
  const p = new Path2D(); build(p); const r = o.r || 200;
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha *= (o.a ?? 1);
  const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1] || cols[0]);
  g.fillStyle = gr; g.fill(p, 'evenodd');
  if (cfg.hide && o.hide !== false && !o.inHide) { g.save(); g.clip(p, 'evenodd'); g.fillStyle = hideTile(g); g.fillRect(-2500, -2500, 7000, 8000); g.restore(); }
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

// ===================== demo-fidelity additions (match lemo shadow-puppet demo grammar) =====================
// hide mottling tile, multiplied into every dyed piece (restores "translucent dyed hide" look)
let _hide = null;
function hideTile(g) {
  if (_hide) return _hide;
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), id = x.createImageData(256, 256);
  for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) {
    const n = (hash(Math.floor(i / 8) * 13 + Math.floor(j / 8) * 71) * .5 + hash(Math.floor(i / 3) * 5 + Math.floor(j / 3) * 17) * .3 + hash(i * 3.3 + j * 7.7) * .2);
    const fib = .5 + .5 * Math.sin((i * .9 + j * .35) * .8 + hash(Math.floor(j / 4)) * 6);
    const v = 232 + 23 * (n * .7 + fib * .3); const k = (j * 256 + i) * 4; id.data[k] = v; id.data[k + 1] = v * .985; id.data[k + 2] = v * .95; id.data[k + 3] = 255;
  }
  x.putImageData(id, 0, 0); _hide = g.createPattern(c, 'repeat'); return _hide;
}
// carved piece with hide texture (same as dye + mottling) — use for puppets
export function hidePiece(g, build, cols, o = {}) {
  dye(g, build, cols, { ...o, inHide: true });
  const p = new Path2D(); build(p); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha *= (o.a ?? 1); g.clip(p, 'evenodd'); g.fillStyle = hideTile(g); g.fillRect(-2000, -2000, 6000, 6000); g.restore();
}
// rivet joint: dark ring + pale knot
export function rivet(g, x, y, r = 7) { dye(g, p => { circ(p, x, y, r); circ(p, x, y, r * .45); }, ['#2a140c'], { edge: false, a: .95 }); }
// 2-bone IK -> elbow position
export function ik(sx, sy, hx, hy, l1, l2, side = 1) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy); const mx = l1 + l2 - .01; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), base = Math.atan2(dy, dx), ea = base + side * a;
  return { ex: sx + Math.cos(ea) * l1, ey: sy + Math.sin(ea) * l1, hx: sx + dx, hy: sy + dy };
}
// jointed puppet (profile watcher, ~11 pieces, rivets, open-cut face). hand targets in local px (origin = feet centre).
export function puppet(g, x, y, s, t, o = {}) {
  const j = trem(x * .02 + 5, t, 2.2), tilt = (o.tilt || 0) + .02 * Math.sin(t * 1.7 + x);
  at(g, x + j[0], y + j[1], tilt, s, () => {
    const H1 = o.head ?? 0, SH = [4, -128], hand = o.hand || [60, -250], hand2 = o.hand2 || [-24, -62];
    const sleeve = o.sleeve || DYE.red, robe = o.robe || DYE.plum, skin = o.skin || ['#f1c58a', '#d9994f'];
    // legs (two pieces, lattice cut)
    const lat = (p, x0, y0, w, h) => { for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) poly(p, [[x0 + w * (a + .5) / 3, y0 + h * b / 4 + 3], [x0 + w * (a + .85) / 3, y0 + h * (b + .5) / 4], [x0 + w * (a + .5) / 3, y0 + h * (b + 1) / 4 - 3], [x0 + w * (a + .15) / 3, y0 + h * (b + .5) / 4]]); };
    hidePiece(g, p => { poly(p, [[-18, -50], [-2, -50], [-4, 0], [-22, 0]]); lat(p, -17, -46, 13, 40); }, DYE.green, { r: 40, lw: 2, edge: '#10321e' });
    hidePiece(g, p => { poly(p, [[2, -50], [18, -50], [22, 0], [4, 0]]); lat(p, 4, -46, 13, 40); }, DYE.green, { r: 40, lw: 2, edge: '#10321e' });
    hidePiece(g, p => { poly(p, [[-26, 0], [-4, 0], [-6, 10], [-34, 10]]); poly(p, [[4, 0], [28, 0], [34, 10], [2, 10]]); }, ['#1c0f08'], { r: 40, edge: false });
    // skirt + torso (crescent scale cuts on torso)
    hidePiece(g, p => { poly(p, [[-24, -52], [24, -52], [32, -18], [-32, -18]]); for (let i = 0; i < 5; i++) circ(p, -18 + i * 9, -34, 2.6); }, robe, { r: 50, lw: 2, edge: '#40122e' });
    hidePiece(g, p => { poly(p, [[-17, -130], [17, -130], [24, -50], [-24, -50]]); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const cx = -12 + c * 8 + (r % 2) * 4, cy = -118 + r * 16; p.moveTo(cx - 3, cy + 2); p.quadraticCurveTo(cx, cy - 5, cx + 3, cy + 2); p.quadraticCurveTo(cx, cy - 1, cx - 3, cy + 2); } circ(p, 0, -52, 5); }, robe, { r: 60, lw: 2, edge: '#40122e' });
    // arms: back (hand2) then front (hand)
    const arm = (h, up) => {
      const A = ik(SH[0], SH[1], h[0], h[1], 52, 56, up ? -1 : 1);
      hidePiece(g, p => { const a = Math.atan2(A.ey - SH[1], A.ex - SH[0]), L = Math.hypot(A.ex - SH[0], A.ey - SH[1]); p.moveTo(SH[0] + Math.sin(a) * 9, SH[1] - Math.cos(a) * 9); p.lineTo(A.ex + Math.sin(a) * 7, A.ey - Math.cos(a) * 7); p.lineTo(A.ex - Math.sin(a) * 7, A.ey + Math.cos(a) * 7); p.lineTo(SH[0] - Math.sin(a) * 9, SH[1] + Math.cos(a) * 9); p.closePath(); }, sleeve, { r: 40, lw: 2, edge: '#5a1010' });
      hidePiece(g, p => { const a = Math.atan2(A.hy - A.ey, A.hx - A.ex); p.moveTo(A.ex + Math.sin(a) * 7, A.ey - Math.cos(a) * 7); p.lineTo(A.hx + Math.sin(a) * 5, A.hy - Math.cos(a) * 5); p.lineTo(A.hx - Math.sin(a) * 5, A.hy + Math.cos(a) * 5); p.lineTo(A.ex - Math.sin(a) * 7, A.ey + Math.cos(a) * 7); p.closePath(); }, skin, { r: 40, lw: 2, edge: '#6a3a14' });
      circ(new Path2D(), 0, 0, 1); hidePiece(g, p => circ(p, A.hx, A.hy, 8), skin, { r: 20, lw: 2, edge: '#6a3a14' });
      rivet(g, SH[0], SH[1], 7); rivet(g, A.ex, A.ey, 6);
    };
    arm(hand2, false); arm(hand, true);
    // head (profile, ~1.2x) with open-cut face strips and big headwear; slight turn via head angle
    at(g, 6, -146, H1, 1, () => {
      hidePiece(g, p => { ell(p, 4, -4, 22, 25, 0); ell(p, 12, -6, 6.5, 2.4, 0); ell(p, 17, 3, 3.2, 1.5, 0); p.moveTo(10, 14); p.quadraticCurveTo(16, 17, 20, 13); p.quadraticCurveTo(16, 21, 10, 14); }, skin, { r: 30, lw: 2, edge: '#6a3a14' });
      hidePiece(g, p => { ell(p, -2, -28, 34, 17, 0); for (let i = 0; i < 6; i++) circ(p, -28 + i * 11, -30, 3); poly(p, [[-30, -34], [-52, -52], [-44, -26]]); }, DYE.card, { r: 40, lw: 2, edge: '#7a3a14' });
      hidePiece(g, p => { p.moveTo(-18, -16); p.quadraticCurveTo(-30, 8, -16, 26); p.lineTo(-6, 22); p.quadraticCurveTo(-18, 4, -8, -14); }, ['#1c0f08'], { r: 20, edge: false });
      rivet(g, -4, 20, 5);
    });
  });
}
// cut-letter plaque: dark hide board, letters cut out so they glow; carried on two rods; enters large+blurred and snaps sharp
export function cutPlaque(g, x, y, w, h, lines, size, k = 1, o = {}) {
  if (k <= 0) return; const e = 1 - Math.pow(1 - clamp(k), 3), sc = lerp(2.6, 1, e), bl = lerp(34, 0, e);
  g.save(); g.globalAlpha *= clamp(k * 3); g.translate(x, y); g.scale(sc, sc); if (bl > .3) g.filter = `blur(${bl}px)`;
  // rods
  [-w * .32, w * .32].forEach(rx => dye(g, p => poly(p, [[rx - 3, -h / 2], [rx + 3, -h / 2], [rx + 4, -2000], [rx - 4, -2000]]), ['#4a2c1a'], { edge: false, a: .85 }));
  hidePiece(g, p => { p.roundRect(-w / 2, -h / 2, w, h, 20); }, ['#4a1d10', '#2a0e08'], { r: w / 2, lw: 4, edge: '#c98a26' });
  hidePiece(g, p => { p.roundRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 12); }, ['#6a2a14', '#3a140a'], { r: w / 2, lw: 2, edge: '#c98a26', a: .9 });
  g.save(); g.fillStyle = '#fff'; g.globalCompositeOperation = 'source-over'; g.font = `italic 700 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = (o.ls ?? 5) + 'px';
  const n = lines.length; lines.forEach((s, i) => g.fillText(s, 0, (i - (n - 1) / 2) * size * 1.15)); g.restore();
  // corner rivets
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => rivet(g, a * (w / 2 - 24), b * (h / 2 - 24), 8));
  g.restore();
}
// stage: lacquered lintel, pillars, sill and blurred audience heads. k=1 full, k=0 gone (camera pushed through the frame).
export function stage(m, k, t) {
  if (k <= 0) return; m.save(); m.setTransform(1, 0, 0, 1, 0, 0);
  const e = k * k * (3 - 2 * k), s = 1 + (1 - e) * .5; m.translate(540, 960); m.scale(s, s); m.translate(-540, -960); m.globalAlpha = Math.min(1, k * 1.6);
  const lacq = (x, y, w, h, vertical) => { const gr = vertical ? m.createLinearGradient(x, 0, x + w, 0) : m.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#4a0e08'); gr.addColorStop(.5, '#7a1c10'); gr.addColorStop(1, '#2a0804'); m.fillStyle = gr; m.fillRect(x, y, w, h); m.strokeStyle = '#c98a26'; m.lineWidth = 3; m.strokeRect(x + 8, y + 8, w - 16, h - 16); };
  lacq(0, 0, 1080, 150, false); lacq(0, 0, 88, 1920, true); lacq(992, 0, 88, 1920, true);
  m.fillStyle = '#c98a26'; m.font = `italic 700 54px ${FONT}`; m.textAlign = 'center'; m.textBaseline = 'middle'; if ('letterSpacing' in m) m.letterSpacing = '8px'; m.fillText('SHADOW  THEATRE', 540, 78);
  m.strokeStyle = '#c98a26'; m.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const cx = 150 + i * 156 + (i > 2 ? 90 : 0); if (Math.abs(cx - 540) < 230) continue; m.beginPath(); m.arc(cx, 118, 14, 0, TAU * .85); m.stroke(); }
  // warm spill on inner edges
  const sp = m.createLinearGradient(88, 0, 150, 0); sp.addColorStop(0, 'rgba(255,150,70,.35)'); sp.addColorStop(1, 'rgba(255,150,70,0)'); m.fillStyle = sp; m.fillRect(88, 150, 62, 1770);
  const sp2 = m.createLinearGradient(992, 0, 930, 0); sp2.addColorStop(0, 'rgba(255,150,70,.35)'); sp2.addColorStop(1, 'rgba(255,150,70,0)'); m.fillStyle = sp2; m.fillRect(930, 150, 62, 1770);
  // sill + audience heads (blurred dark silhouettes)
  m.fillStyle = '#3a0a06'; m.fillRect(0, 1790, 1080, 130); m.strokeStyle = '#c98a26'; m.lineWidth = 3; m.beginPath(); m.moveTo(0, 1792); m.lineTo(1080, 1792); m.stroke();
  m.filter = 'blur(6px)'; m.fillStyle = '#0c0402';
  [[130, 1880, 92, 100], [330, 1900, 108, 120], [540, 1870, 86, 96], [740, 1905, 112, 124], [930, 1878, 92, 100]].forEach(([cx, cy, rx, ry], i) => { const bob = Math.sin(t * .8 + i * 2) * 3; m.beginPath(); m.ellipse(cx, cy + bob, rx * .62, ry * .68, 0, 0, TAU); m.fill(); m.beginPath(); m.ellipse(cx, cy + 70 + bob, rx, ry * .6, 0, 0, TAU); m.fill(); });
  m.filter = 'none'; m.restore();
}
