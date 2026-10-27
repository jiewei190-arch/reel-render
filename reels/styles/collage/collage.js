// collage.js: vertical (1080x1920) PAPER COLLAGE kit. Torn-edge cut-outs, white tear border, paper grain,
// soft drop shadows, stop-motion on twos (12 fps boil). Canvas2D only. Original code.
export const W = 1080, H = 1920;
export const PAL = {
  paper: '#efe3cc', paper2: '#e6d6b6', kraft: '#c9a373', ink: '#3b2a24', white: '#fffaf0',
  red: '#d9482f', orange: '#ee8a3a', yellow: '#f4c542', green: '#6aa66b', deepGreen: '#3f7a56', teal: '#2f8c93',
  blue: '#4a7fb5', navy: '#2d4a6e', pink: '#ec8fa0', purple: '#8e6bb0', cream: '#fff3d6', grey: '#a89f92',
  germ: '#8cbf3f', germDark: '#5f8a28', cell: '#fbf2e4', cellEdge: '#e9c9c0',
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.8; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

// ---- torn shapes -----------------------------------------------------------------------------------------------
export function torn(cx, cy, rx, ry, seed = 1, jag = .06, n = 28) {
  const o = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, k = 1 + (hash(seed * 7.3 + i * 1.9) - .5) * jag * 2; o.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return o;
}
export function tornRect(x, y, w, h, seed = 1, jag = 7, step = 38) {
  const o = [], j = i => (hash(seed * 5.1 + i * 2.3) - .5) * jag * 2; let k = 0;
  for (let px = x; px < x + w; px += step) o.push([px, y + j(k++)]);
  for (let py = y; py < y + h; py += step) o.push([x + w + j(k++), py]);
  for (let px = x + w; px > x; px -= step) o.push([px, y + h + j(k++)]);
  for (let py = y + h; py > y; py -= step) o.push([x + j(k++), py]);
  return o;
}
export function star(cx, cy, r0, r1, n, rot = 0, seed = 1, jag = .06) {
  const o = []; for (let i = 0; i < n * 2; i++) { const r = (i % 2 ? r0 : r1) * (1 + (hash(seed + i) - .5) * jag * 2), a = rot + i / (n * 2) * 6.2832; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o;
}
export function path(g, pts, closed = true) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (closed) g.closePath(); }
export function fill(g, pts, col) { path(g, pts); g.fillStyle = col; g.fill(); }

// ---- paper texture ---------------------------------------------------------------------------------------------
let GRAIN = null;
function grain() { if (GRAIN) return GRAIN; const c = mk(256, 256), g = c.getContext('2d'), id = g.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (hash(i * .37) - .5) * 100; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); return GRAIN = c; }
const BG = new Map();
export function background(g, tone = PAL.paper, key = 'a') {
  if (!BG.has(key + tone)) {
    const c = mk(W, H), b = c.getContext('2d'); b.fillStyle = tone; b.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { const x = hash(i) * W, y = hash(i + 50) * H, l = 20 + hash(i + 9) * 60, a = hash(i + 3) * 6.28; b.strokeStyle = `rgba(120,90,50,${.04 + hash(i + 7) * .05})`; b.lineWidth = 1 + hash(i + 4) * 2; b.beginPath(); b.moveTo(x, y); b.quadraticCurveTo(x + Math.cos(a) * l * .5, y + Math.sin(a) * l * .5 + 8, x + Math.cos(a) * l, y + Math.sin(a) * l); b.stroke(); }
    b.globalAlpha = .16; b.globalCompositeOperation = 'multiply'; b.fillStyle = b.createPattern(grain(), 'repeat'); b.fillRect(0, 0, W, H); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
    const v = b.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,35,10,.28)'); b.fillStyle = v; b.fillRect(0, 0, W, H);
    BG.set(key + tone, c);
  }
  g.drawImage(BG.get(key + tone), 0, 0);
}

// ---- the cut-out piece: art + torn white border + grain + shadow ------------------------------------------------
const CACHE = new Map();
export function piece(key, w, h, draw, { border = 12, pad = 36, grainA = .12 } = {}) {
  if (CACHE.has(key)) return CACHE.get(key);
  const art = mk(w, h), ag = art.getContext('2d'); draw(ag, w, h);
  const cw = w + pad * 2, ch = h + pad * 2, c = mk(cw, ch), g = c.getContext('2d');
  const sil = (col, dx, dy, r) => { const t = mk(cw, ch), tg = t.getContext('2d'); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832, rr = r * (.8 + .4 * hash(key.length * 3 + i * 1.7)); tg.drawImage(art, pad + dx + Math.cos(a) * rr, pad + dy + Math.sin(a) * rr); } tg.drawImage(art, pad + dx, pad + dy); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = col; tg.fillRect(0, 0, cw, ch); return t; };
  const outline = sil('#000', 0, 0, border);
  g.drawImage(sil(PAL.white, 0, 0, border), 0, 0);
  g.drawImage(art, pad, pad);
  const gr = mk(cw, ch), gg = gr.getContext('2d'); gg.fillStyle = gg.createPattern(grain(), 'repeat'); gg.fillRect(0, 0, cw, ch); gg.globalCompositeOperation = 'destination-in'; gg.drawImage(outline, 0, 0);
  g.globalAlpha = grainA; g.globalCompositeOperation = 'overlay'; g.drawImage(gr, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const sh = mk(cw + 80, ch + 80), sg = sh.getContext('2d'); sg.filter = 'blur(9px)'; sg.drawImage(sil('#2a1608', 0, 0, border), 40, 40);
  const res = { c, shadow: sh, w: cw, h: ch, pad }; CACHE.set(key, res); return res;
}
// Stop-motion boil: pieces jiggle a little every other frame (12 fps). `fr` is the frame index at 12 fps.
let FR = 0; export function setFrame(t) { FR = Math.floor(t * 12 + 1e-6); }
export function put(g, cd, x, y, { rot = 0, sc = 1, a = 1, boil = 1.6, sh = .34, seed = 1, sx = 1 } = {}) {
  if (a <= 0 || sc <= 0.001) return;
  const jx = (hash(FR * 3.7 + seed) - .5) * 2 * boil, jy = (hash(FR * 5.1 + seed * 2) - .5) * 2 * boil, jr = (hash(FR * 2.3 + seed * 3) - .5) * .012 * boil;
  const ga = g.globalAlpha; g.save(); g.translate(x + jx, y + jy); g.rotate(rot + jr); g.scale(sc * sx, sc);
  g.globalAlpha = ga * a * sh; g.drawImage(cd.shadow, -cd.w / 2 - 40 + 12, -cd.h / 2 - 40 + 18); g.globalAlpha = ga * a;
  g.drawImage(cd.c, -cd.w / 2, -cd.h / 2); g.restore();
}
// size helper
export const pieceBox = cd => ({ w: cd.w, h: cd.h });

// ---- text -------------------------------------------------------------------------------------------------------
export function strip(g, text, x, y, { size = 64, col = PAL.cream, ink = PAL.ink, rot = 0, a = 1, seed = 1, sc = 1, font = '600', fam = 'Fredoka' } = {}) {
  if (a <= 0 || sc <= 0) return; g.save(); g.font = `${font} ${size}px ${fam}`; const lines = text.split('\n'), tw = Math.max(...lines.map(l => g.measureText(l).width)) + 70, th = size * 1.35 * lines.length + 34;
  const key = 'strip:' + text + size + col + font; const cd = piece(key, tw, th, (c, w, h) => { fill(c, tornRect(6, 6, w - 12, h - 12, seed + 11, 6, 30), col); c.fillStyle = ink; c.font = `${font} ${size}px ${fam}`; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.3 + 2)); }, { border: 9 });
  g.restore(); put(g, cd, x, y, { rot, a, sc, seed });
}
export function subtitle(g, text, { y = 1700, accent = PAL.red, a = 1 } = {}) {
  if (!text || a <= 0) return; g.save(); g.globalAlpha = a; g.font = '600 45px Fredoka'; g.textBaseline = 'middle'; g.textAlign = 'left';
  const parts = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s => s.startsWith('**') ? [s.slice(2, -2), true] : [s, false]);
  const maxW = 920; const words = []; parts.forEach(([t, b]) => t.split(' ').filter(Boolean).forEach(w => words.push([w, b])));
  const wd = ([w]) => g.measureText(w + ' ').width; let tot = words.reduce((s, w) => s + wd(w), 0), lines = [words];
  if (tot > maxW) { let acc = 0, bi = 1, bd = 1e9; for (let k = 0; k < words.length - 1; k++) { acc += wd(words[k]); const d = Math.abs(acc - (tot - acc)); if (d < bd) { bd = d; bi = k + 1; } } lines = [words.slice(0, bi), words.slice(bi)]; }
  const lw = l => l.reduce((s, w) => s + wd(w), 0), bw = Math.max(...lines.map(lw)) + 80, bh = 36 + lines.length * 68, x0 = (W - bw) / 2, y0 = y + (lines.length < 2 ? 34 : 0);
  g.save(); g.filter = 'blur(8px)'; g.fillStyle = 'rgba(40,20,8,.35)'; path(g, tornRect(x0 + 6, y0 + 14, bw, bh, 77, 4, 40)); g.fill(); g.restore();
  g.fillStyle = PAL.white; path(g, tornRect(x0 - 6, y0 - 6, bw + 12, bh + 12, 78, 4, 40)); g.fill();
  g.fillStyle = PAL.cream; path(g, tornRect(x0, y0, bw, bh, 79, 4, 40)); g.fill();
  lines.forEach((l, li) => { let x = (W - lw(l)) / 2; l.forEach(([w, b]) => { g.fillStyle = b ? accent : PAL.ink; g.fillText(w, x, y0 + 52 + li * 68); x += g.measureText(w + ' ').width; }); });
  g.restore();
}
