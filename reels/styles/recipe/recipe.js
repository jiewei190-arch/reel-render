// recipe.js: template #23 "Recipe card" (demo t23, x.com/Sarut0biSasuke "White Russian Cocktail Recipe Animation"), vertical 1080x1920.
// Grammar copied from the demo frames: warm cream paper with a tan recipe card; spaced monospace caps for meta lines ("STEP 2 / 5",
// "CLASSIC · ROCKS GLASS · SERVES 1", footer); a brush-handwriting face for titles, steps and amounts (Caveat here); a big handwritten
// counter that ticks up with a small unit and a mono sub-measure; a checklist of circles that get a rust tick, with a rust arrow pointing
// at the current item and the coming items greyed; a segmented progress bar with labels at the top; thin wobbly pencil drawings with soft
// pale fills and a measuring scale next to the vessel (ticks + a rust pointer at the fill level); the "Good drink." handwritten sign-off with
// ink splats. Original code; fonts Caveat + JetBrains Mono (OFL).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const bo = u => { u = clamp(u); const c = 1.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const P = { paper: '#f7f0e6', card: '#ecdcc3', card2: '#e3cfb2', ink: '#3b2a1f', soft: '#8b7562', faint: '#c2b19d', rust: '#a8603a', rustL: '#d9a07a', glass: '#e9eef0', blue: '#cfe0ea', heat: '#e8854a' };
export const HAND = 'Caveat', MONO = 'Mono';

let PAPER = null;
export function paper() {   // cream paper with a faint fibre and a soft warm vignette (the demo's flat warm ground)
  if (PAPER) return PAPER; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = P.paper; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 1400; i++) { g.strokeStyle = `rgba(140,110,80,${.025 + hash(i * 7) * .03})`; g.lineWidth = 1; const x = hash(i * 3.1) * W, y = hash(i * 5.7) * H, a = hash(i) * TAU, l = 10 + 30 * hash(i * 9); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const v = g.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .5, H * .8); v.addColorStop(0, 'rgba(120,90,60,0)'); v.addColorStop(1, 'rgba(120,90,60,.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  PAPER = c; return c;
}
export function create(canvas) { canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px'; return canvas.getContext('2d'); }

// ---- type ----
export function hand(g, s, x, y, { size = 60, col = P.ink, align = 'left', a = 1, w = 700, write = 1 } = {}) { if (a <= 0 || write <= 0) return 0; g.save(); g.globalAlpha *= a; g.font = `${w} ${size}px ${HAND}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic';
  const n = Math.ceil(s.length * clamp(write)); g.fillText(s.slice(0, n), x, y); const tw = g.measureText(s).width; g.restore(); return tw; }
export function mono(g, s, x, y, { size = 22, col = P.soft, align = 'left', a = 1, track = 4, w = 500 } = {}) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `${w} ${size}px ${MONO}`; g.fillStyle = col; g.textAlign = align; if ('letterSpacing' in g) g.letterSpacing = track + 'px'; g.fillText(s, x, y); g.restore(); }
// ---- pencil line (slight wobble), draws on with k ----
export function line(g, pts, { w = 3, col = P.ink, k = 1, seed = 1, wob = 1.2, close = false, a = 1 } = {}) { if (k <= 0 || pts.length < 2) return; const p = pts.map(([x, y], i) => [x + (hash(seed * 31 + i * 1.7) - .5) * wob * 2, y + (hash(seed * 17 + i * 2.3) - .5) * wob * 2]); if (close) p.push(p[0]);
  let tot = 0; const L = []; for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); L.push(d); tot += d; } let lim = tot * clamp(k);
  g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length && lim > 0; i++) { const u = Math.min(1, lim / L[i - 1]); g.lineTo(lerp(p[i - 1][0], p[i][0], u), lerp(p[i - 1][1], p[i][1], u)); lim -= L[i - 1]; } g.stroke(); g.restore(); }
export const rectPts = (x, y, w, h, n = 6) => { const o = []; [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]].forEach(([a, b, c, d]) => { for (let i = 0; i < n; i++) o.push([lerp(a, c, i / n), lerp(b, d, i / n)]); }); return o; };
export const circPts = (x, y, r, n = 28, sq = 1) => Array.from({ length: n }, (_, i) => [x + Math.cos(i / n * TAU - Math.PI / 2) * r, y + Math.sin(i / n * TAU - Math.PI / 2) * r * sq]);
export function fill(g, pts, col, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); }
// soft pencil shading inside a shape (the demo's light hatch on the glass)
export function shade(g, pts, col = 'rgba(59,42,31,.12)', sp = 9, a = 1) { g.save(); g.globalAlpha *= a; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip(); g.strokeStyle = col; g.lineWidth = 1.6;
  for (let x = -H; x < W + H; x += sp) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H * .35, H); g.stroke(); } g.restore(); }

// ---- demo blocks ----
// segmented progress bar with labels; cur = index of the active segment, u = progress inside it
export function progress(g, labels, cur, u, { y = 290, x0 = 60, x1 = 1020 } = {}) { const n = labels.length, gap = 22, sw = (x1 - x0 - gap * (n - 1)) / n;
  labels.forEach((l, i) => { const x = x0 + i * (sw + gap), f = i < cur ? 1 : i === cur ? clamp(u) : 0; g.fillStyle = 'rgba(59,42,31,.12)'; g.fillRect(x, y, sw, 5); if (f > 0) { g.fillStyle = P.rust; g.fillRect(x, y, sw * f, 5); }
    mono(g, l, x, y + 38, { size: 20, col: i < cur ? P.ink : i === cur ? P.rust : P.faint, track: 3 }); }); }
// step header block (left): STEP n / N, handwritten step title, big counter with unit, mono sub-measure, handwritten note
export function header(g, { step, of, title, num, unit = '', sub = '', note = '', x = 60, y = 380, a = 1, k = 1, numSize = 170 }) { if (a <= 0) return; g.save(); g.globalAlpha *= a;
  if (step != null) mono(g, `STEP ${step} / ${of}`, x, y, { size: 22, col: P.rust, track: 5 });
  hand(g, title, x, y + 74, { size: 66, write: k });
  if (num != null) { const tw = hand(g, num, x + 6, y + 74 + numSize * .98, { size: numSize }); if (unit) hand(g, unit, x + 16 + tw, y + 74 + numSize * .98, { size: numSize * .36, col: P.soft }); }
  if (sub) mono(g, sub, x, y + 74 + numSize * 1.25, { size: 22, col: P.soft, track: 4 });
  if (note) hand(g, note, x, y + 74 + numSize * 1.25 + 52, { size: 42, col: P.soft, w: 500, write: k });
  g.restore(); }
// recipe card (tan panel): meta line, big title with underline, checklist rows [{amt, item}], done = number ticked, cur = arrow row
export function card(g, { x = 560, y = 360, w = 460, h = 470, meta = '', title = [], rows = [], done = 0, cur = -1, footer = '', a = 1, t = 0, tickK = 1 }) { if (a <= 0) return; g.save(); g.globalAlpha *= a;
  g.fillStyle = P.card; g.shadowColor = 'rgba(80,50,20,.14)'; g.shadowBlur = 24; g.shadowOffsetY = 8; g.fillRect(x, y, w, h); g.shadowColor = 'transparent';
  if (meta) mono(g, meta, x + 30, y + 46, { size: 16, col: P.soft, track: 3 });
  title.forEach((l, i) => hand(g, l, x + 30 + i * 18, y + 104 + i * 60, { size: 68 })); const uy = y + 104 + (title.length - 1) * 60 + 18; line(g, [[x + 26, uy + 6], [x + w * .5, uy], [x + w - 24, uy - 4]], { w: 3, seed: 5 });
  rows.forEach((r, i) => { const ry = uy + 58 + i * 46, st = i < done ? 2 : i === cur ? 1 : 0, col = st === 0 ? P.faint : P.ink;
    line(g, circPts(x + 46, ry - 12, 14, 20), { w: 2.4, col: st ? P.ink : P.faint, close: true, seed: 20 + i, wob: .6 });
    if (st === 2) { const tk = i === done - 1 ? clamp(tickK) : 1; line(g, [[x + 36, ry - 14], [x + 45, ry - 4], [x + 62, ry - 30]], { w: 3.6, col: P.rust, k: tk, seed: 40 + i, wob: .4 }); }
    if (st === 1) { const ax = x - 46 + 6 * Math.sin(t * 5); line(g, [[ax, ry - 12], [ax + 34, ry - 12]], { w: 3.4, col: P.rust, seed: 60 + i, wob: .3 }); line(g, [[ax + 22, ry - 22], [ax + 34, ry - 12], [ax + 22, ry - 2]], { w: 3.4, col: P.rust, seed: 61 + i, wob: .3 }); }
    hand(g, r.amt, x + 76, ry, { size: 38, col }); hand(g, r.item, x + 210, ry, { size: 38, col, w: 500 }); });
  if (footer) mono(g, footer, x + 30, y + h - 26, { size: 15, col: P.soft, track: 3 });
  g.restore(); }
// measuring scale (ticks + labels, rust pointer at the current level), vertical from y0 (bottom) to y1 (top)
export function scale(g, x, y0, y1, marks, level, { a = 1 } = {}) { if (a <= 0) return; g.save(); g.globalAlpha *= a; marks.forEach(([v, lab]) => { const y = lerp(y0, y1, v); line(g, [[x - 14, y], [x + 4, y]], { w: 2, col: P.soft, wob: 0 }); mono(g, lab, x - 22, y + 7, { size: 18, col: P.soft, align: 'right', track: 1 }); });
  if (level != null) { const y = lerp(y0, y1, level); g.fillStyle = P.rust; g.beginPath(); g.moveTo(x - 2, y - 11); g.lineTo(x + 14, y); g.lineTo(x - 2, y + 11); g.closePath(); g.fill(); } g.restore(); }
// ink splats (the demo's sign-off)
export function splats(g, x, y, k, seed = 1) { if (k <= 0) return; g.save(); g.fillStyle = P.ink; for (let i = 0; i < 9; i++) { const a = hash(seed + i) * TAU, d = 20 + 70 * hash(seed + i * 3), r = (3 + 9 * hash(seed + i * 5)) * clamp(k * 2 - i * .1); if (r <= 0) continue; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, TAU); g.fill(); } g.restore(); }
// captions: handwritten, ink on a light paper strip, bold words in rust; centred at y0 (Batch N: y about 1150-1420)
export function parse(s) { const o = []; s.split('**').forEach((t, i) => t && o.push({ t, b: i % 2 === 1 })); return o; }
export function caption(g, cap, a = 1, y0 = 1290) { if (a <= 0) return; const size = 60, maxW = 900; g.save(); g.font = `700 ${size}px ${HAND}`;
  const words = []; parse(cap).forEach(p => p.t.split(/(\s+)/).forEach(w => w && words.push({ w, b: p.b })));
  const lines = [[]]; let cw = 0; for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > maxW && !/^\s+$/.test(w.w) && lines[lines.length - 1].length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines[lines.length - 1].push(w); cw += m; } }
  const lh = 66, top = y0 - (lines.length - 1) * lh / 2; g.globalAlpha = a; g.textBaseline = 'middle';
  const widest = Math.max(...lines.map(l => l.reduce((s, w) => s + g.measureText(w.w).width, 0))); g.fillStyle = 'rgba(247,240,230,.88)'; g.beginPath(); g.roundRect(W / 2 - widest / 2 - 30, top - lh / 2 - 8, widest + 60, lines.length * lh + 16, 14); g.fill();
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + g.measureText(w.w).width, 0); let x = W / 2 - tw / 2; for (const w of ln) { g.fillStyle = w.b ? P.rust : P.ink; g.fillText(w.w, x, top + i * lh); x += g.measureText(w.w).width; } });
  g.restore(); }
