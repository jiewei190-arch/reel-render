// popup.js: vertical (1080x1920) cut-paper pop-up book kit. Canvas2D only, CPU-cheap.
// Technique ported from the Lemo paper-popup grammar (white-bordered paper actors, cardboard edge, grain,
// cut-out shadows, cards that spring up around their bottom edge). No Lemo code or assets are used.
export const W = 1080, H = 1920;
export const PAL = {
  ink: '#4a2f2a', border: '#fff8ea', edge: '#c9bfae', desk: '#a9764a', deskDark: '#7e522f', cover: '#2f6f73', coverDark: '#215356',
  page: '#f6ecd6', pageLine: '#e4d6b8', sky: '#9fd8e8', sky2: '#d7f1ee', hill1: '#8fcf86', hill2: '#5fb36f', hill3: '#3f9a63',
  sun: '#ffd24d', wombat: '#ab8868', wombatShade: '#8a6a50', nose: '#5b3b32', cheek: '#f4a58f', belly: '#e4c9a6',
  pink: '#f48fa3', pink2: '#e9708a', stiff: '#c9556f', soft: '#ffb7c4', poop: '#7a5334', poop2: '#5f3e27', coral: '#ff7a59', cream: '#fff7e6',
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ease = u => u * u * (3 - 2 * u);
export const back = u => { u = clamp(u); const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

// ---- art helpers -------------------------------------------------------------------------------------------------
export function wobble(cx, cy, rx, ry, seed = 1, amp = .04, n = 48) {
  const pts = []; const p1 = hash(seed) * 6.28, p2 = hash(seed + 3) * 6.28;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const k = 1 + amp * (Math.sin(a * 2 + p1) * .6 + Math.sin(a * 3 + p2) * .4); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return pts;
}
export function pathOf(g, pts, closed = true) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (closed) g.closePath(); }
export function ink(g, pts, { fill, stroke = PAL.ink, w = 6, closed = true } = {}) {
  pathOf(g, pts, closed); g.lineJoin = 'round'; g.lineCap = 'round';
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (w) { g.strokeStyle = stroke; g.lineWidth = w; g.stroke(); }
}
// A hard crescent of shade inside a shape: fill base, then shade, then refill shifted with base.
export function crescent(g, pts, base, shade, dx = 16, dy = -12, w = 6) {
  g.save(); pathOf(g, pts); g.clip(); g.fillStyle = shade; g.fillRect(-9999, -9999, 20000, 20000);
  g.translate(dx, dy); pathOf(g, pts); g.fillStyle = base; g.fill(); g.restore(); ink(g, pts, { w });
}
export function bez(a, b, c, d, n = 24) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); } return o; }

// ---- the cut-paper finish: ink art -> border + cardboard edge + grain, plus its cut-out shadow -------------------------------
let GRAIN = null;
function grain() { if (GRAIN) return GRAIN; const c = mk(256, 256), g = c.getContext('2d'), id = g.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (hash(i * .37) - .5) * 90; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); return GRAIN = c; }
const CACHE = new Map();
// card(key, w, h, draw(g, w, h), {border}) returns {c, shadow, w, h, pad}; the art canvas is w x h, the result is padded.
export function card(key, w, h, draw, { border = 14, pad = 30, edge = true, grainA = .10 } = {}) {
  if (CACHE.has(key)) return CACHE.get(key);
  const art = mk(w, h), ag = art.getContext('2d'); draw(ag, w, h);
  const cw = w + pad * 2, ch = h + pad * 2, c = mk(cw, ch), g = c.getContext('2d');
  const sil = (col, dx, dy, r) => { const t = mk(cw, ch), tg = t.getContext('2d'); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; tg.drawImage(art, pad + dx + Math.cos(a) * r, pad + dy + Math.sin(a) * r); } tg.drawImage(art, pad + dx, pad + dy); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = col; tg.fillRect(0, 0, cw, ch); return t; };
  if (edge) g.drawImage(sil(PAL.edge, 0, 5, border), 0, 0);
  g.drawImage(sil(PAL.border, 0, 0, border), 0, 0);
  g.drawImage(art, pad, pad);
  const outline = sil('#000', 0, 0, border); // alpha of the whole cut shape
  const gr = mk(cw, ch), gg = gr.getContext('2d'); gg.fillStyle = gg.createPattern(grain(), 'repeat'); gg.fillRect(0, 0, cw, ch); gg.globalCompositeOperation = 'destination-in'; gg.drawImage(outline, 0, 0);
  g.globalAlpha = grainA; g.globalCompositeOperation = 'overlay'; g.drawImage(gr, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const sh = mk(cw + 80, ch + 80), sg = sh.getContext('2d'); sg.filter = 'blur(7px)'; sg.drawImage(sil('#2a1608', 0, 0, border), 40, 40);
  const res = { c, shadow: sh, w: cw, h: ch, pad }; CACHE.set(key, res); return res;
}
// Draw a card standing on the page: k=0 lying flat, 1 upright (back overshoot allowed). bx,by = bottom-centre of the card.
export function pop(g, cd, bx, by, k = 1, { flip = 1, sway = 0, scale = 1, shadowA = .28, lean = 0 } = {}) {
  if (k <= .001) return;
  const kk = Math.max(.04, k), sw = sway * Math.sin(0) ; void sw;
  // ground shadow: the cut-out silhouette laid down toward the lower right
  g.save(); g.translate(bx, by); g.globalAlpha = shadowA * Math.min(1, k * 1.5);
  g.transform(1, 0, -.32, -.16 * kk * scale, 0, 0); g.scale(flip * scale, 1);
  g.drawImage(cd.shadow, -cd.w / 2 - 40, -cd.h + cd.pad - 40 + 0); g.restore();
  // the card itself: rotates about its bottom edge (foreshortened), with a hint of lean
  g.save(); g.translate(bx, by); g.transform(1, 0, lean * kk + sway, kk * scale, 0, 0); g.scale(flip * scale, 1);
  g.drawImage(cd.c, -cd.w / 2, -cd.h + cd.pad - 5); g.restore();
}
// A hinge/fold strip the card stands on (tiny V-fold tab) so the pop-up reads as attached to the page.
export function foldTab(g, bx, by, w, k = 1) {
  if (k <= .01) return; g.save(); g.globalAlpha = clamp(k * 2);
  g.fillStyle = PAL.border; g.strokeStyle = PAL.edge; g.lineWidth = 3;
  g.beginPath(); g.moveTo(bx - w / 2, by + 2); g.lineTo(bx + w / 2, by + 2); g.lineTo(bx + w / 2 - 14, by + 22); g.lineTo(bx - w / 2 + 14, by + 22); g.closePath(); g.fill(); g.stroke(); g.restore();
}

// ---- the real world: desk, lamp light, book -------------------------------------------------------------------------------
let DESK = null;
function deskTex() {
  if (DESK) return DESK; const c = mk(W, H), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#b98355'); gr.addColorStop(1, '#8e5e37'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const y = hash(i) * H, a = .05 + hash(i + 9) * .08; g.strokeStyle = `rgba(70,40,18,${a})`; g.lineWidth = 1 + hash(i + 5) * 4; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 60) g.lineTo(x, y + Math.sin(x * .004 + i) * 9 + (hash(i * 3) - .5) * 4); g.stroke(); }
  for (let i = 0; i < 6; i++) { const x = (i + .5) * W / 6 + (hash(i) - .5) * 40; g.strokeStyle = 'rgba(50,28,12,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  return DESK = c;
}
export function desk(g) {
  g.drawImage(deskTex(), 0, 0);
  const l = g.createRadialGradient(W * .38, H * .3, 100, W * .5, H * .5, H * .78); l.addColorStop(0, 'rgba(255,236,190,.34)'); l.addColorStop(.6, 'rgba(255,220,160,0)'); l.addColorStop(1, 'rgba(30,14,4,.45)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// Open book, 3/4 top view. Layout constants are exported so scenes can position things on the board and the ground.
export const BOOK = { x: 44, y: 120, w: 992, h: 1600, fold: 980, boardTop: 190, boardL: 100, boardR: 980, groundBottom: 1640 };
export function book(g, { pageTint = PAL.page } = {}) {
  const B = BOOK;
  g.save(); g.filter = 'blur(18px)'; g.fillStyle = 'rgba(25,10,0,.55)'; rr(g, B.x + 14, B.y + 34, B.w, B.h, 26); g.fill(); g.restore();
  g.fillStyle = PAL.coverDark; rr(g, B.x, B.y + 10, B.w, B.h, 26); g.fill();
  g.fillStyle = PAL.cover; rr(g, B.x, B.y, B.w, B.h, 26); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 4; rr(g, B.x + 14, B.y + 14, B.w - 28, B.h - 28, 18); g.stroke();
  // page block with stacked edges
  g.fillStyle = '#e8dcc0'; rr(g, B.x + 38, B.y + 44, B.w - 76, B.h - 80, 12); g.fill();
  for (let i = 0; i < 7; i++) { g.strokeStyle = 'rgba(160,140,100,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(B.x + 44, B.y + B.h - 44 + i * 4 - 10); g.lineTo(B.x + B.w - 44, B.y + B.h - 44 + i * 4 - 10); g.stroke(); }
  g.fillStyle = pageTint; rr(g, B.x + 50, B.y + 56, B.w - 100, B.h - 120, 10); g.fill();
  // page paper texture
  g.save(); rr(g, B.x + 50, B.y + 56, B.w - 100, B.h - 120, 10); g.clip(); g.globalAlpha = .05; g.globalCompositeOperation = 'multiply'; g.fillStyle = g.createPattern(grain(), 'repeat'); g.fillRect(0, 0, W, H); g.restore();
  // soft light from the lamp on the ground page
  const l = g.createRadialGradient(W * .4, 1250, 40, W * .5, 1300, 700); l.addColorStop(0, 'rgba(255,248,224,.5)'); l.addColorStop(1, 'rgba(255,248,224,0)'); g.fillStyle = l; g.fillRect(B.x + 50, B.fold, B.w - 100, B.h);
}
// The standing back board: art(g,w,h) is drawn into a card the size of the board; k raises it from the fold line.
export function board(g, key, drawArt, k = 1) {
  const B = BOOK, bw = B.boardR - B.boardL, bh = B.fold - B.boardTop;
  const cd = card('board:' + key, bw, bh, drawArt, { border: 12, pad: 28, edge: true });
  pop(g, cd, (B.boardL + B.boardR) / 2, B.fold, k, { shadowA: .30 });
}
// A cardboard sign hanging on two strings from y0, swinging by angle a (radians).
export function sign(g, key, text, x, y0, y1, w, h, a = 0, { font = '600 74px Fredoka', fill = '#f3c87a', col = PAL.ink } = {}) {
  const cd = card('sign:' + key, w, h, (c, ww, hh) => {
    ink(c, [[8, 8], [ww - 8, 8], [ww - 8, hh - 8], [8, hh - 8]], { fill, w: 6 });
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(20, 18, ww - 40, 8);
    c.fillStyle = col; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle';
    const lines = text.split('\n'); lines.forEach((ln, i) => c.fillText(ln, ww / 2, hh / 2 + (i - (lines.length - 1) / 2) * 84));
  }, { border: 12 });
  g.save(); g.translate(x, y1); g.rotate(a);
  g.strokeStyle = '#8a6a48'; g.lineWidth = 4; g.beginPath(); g.moveTo(-w / 2 + 40, 0); g.lineTo(-w / 2 + 30 - Math.sin(a) * 0, -(y1 - y0)); g.moveTo(w / 2 - 40, 0); g.lineTo(w / 2 - 30, -(y1 - y0)); g.stroke();
  g.globalAlpha = .16; g.filter = 'blur(6px)'; g.drawImage(cd.shadow, -cd.w / 2 + 10, 4 + 12); g.filter = 'none'; g.globalAlpha = 1;
  g.drawImage(cd.c, -cd.w / 2, 0); g.restore();
}
// Subtitle card at the bottom: a paper strip with ink text. bold markers **x** are drawn in accent.
export function subtitle(g, text, { y = 1740, accent = PAL.coral, a = 1 } = {}) {
  if (!text || a <= 0) return; g.save(); g.globalAlpha = a; g.font = '600 46px Fredoka'; g.textBaseline = 'middle'; g.textAlign = 'left';
  const parts = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s => s.startsWith('**') ? [s.slice(2, -2), true] : [s, false]);
  const tw = parts.reduce((s, [t]) => s + g.measureText(t).width, 0), w = Math.min(980, tw + 90), x0 = (W - w) / 2;
  g.fillStyle = 'rgba(40,20,8,.35)'; g.filter = 'blur(8px)'; rr(g, x0 + 4, y + 12, w, 112, 28); g.fill(); g.filter = 'none';
  g.fillStyle = PAL.cream; g.strokeStyle = PAL.ink; g.lineWidth = 5; rr(g, x0, y, w, 112, 28); g.fill(); g.stroke();
  let x = (W - tw) / 2; parts.forEach(([t, b]) => { g.fillStyle = b ? accent : PAL.ink; g.fillText(t, x, y + 58); x += g.measureText(t).width; }); g.restore();
}
export function label(g, text, x, y, { w = 0, col = PAL.cream, a = 1, sub = '' } = {}) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = '600 40px Fredoka'; g.textBaseline = 'middle'; g.textAlign = 'center';
  const tw = Math.max(w, g.measureText(text).width + 56), hh = sub ? 108 : 78;
  g.fillStyle = 'rgba(40,20,8,.3)'; g.filter = 'blur(6px)'; rr(g, x - tw / 2 + 3, y - hh / 2 + 9, tw, hh, 18); g.fill(); g.filter = 'none';
  g.fillStyle = col; g.strokeStyle = PAL.ink; g.lineWidth = 4.5; rr(g, x - tw / 2, y - hh / 2, tw, hh, 18); g.fill(); g.stroke();
  g.fillStyle = PAL.ink; g.fillText(text, x, y - (sub ? 18 : 0) + 2);
  if (sub) { g.font = '500 28px Fredoka'; g.fillStyle = '#7a5a46'; g.fillText(sub, x, y + 24); } g.restore();
}
export function ctx2d(canvas) { canvas.width = W; canvas.height = H; return canvas.getContext('2d'); }
