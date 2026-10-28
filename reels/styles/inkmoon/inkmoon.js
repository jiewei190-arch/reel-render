// inkmoon.js: template #25 "Ink moon" (demo t25, x.com/AmberPromptai), vertical 1080x1920, Canvas2D.
// Grammar copied from the demo frames: cream rice paper; a single brush line that becomes a mountain ridge; peaks filled with
// stippled dry-brush ink (dark at the ridge, fading down into mist); pale blue-grey distant peaks; drifting mist bands; a pale
// full moon with a soft warm halo and blue haze; a plum branch from the top corner with red blossoms; tiny flying birds;
// a small ink house with a lit window and a figure in a hat; water ripples; rough ensō brush circles framing insets;
// vertical title columns with a small vermilion seal; quiet centred serif subtitles.
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const PAPER = '#efe8d8', INKC = '30,28,30', VERM = '#b8382a';
const ink = a => `rgba(${INKC},${clamp(a).toFixed(3)})`;
export const lc = (a, b, u) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',')})`; };

// ---- rice paper (baked) ----
let PAP = null;
export function paper() {
  if (PAP) return PAP; const c = mk(W, H), p = c.getContext('2d'); p.fillStyle = PAPER; p.fillRect(0, 0, W, H);
  const lo = mk(64, 112), lg = lo.getContext('2d'), d = lg.createImageData(64, 112);
  for (let i = 0; i < 64 * 112; i++) { const v = 236 + (hash(i * 3.1) - .5) * 16; d.data[i * 4] = v; d.data[i * 4 + 1] = v - 5; d.data[i * 4 + 2] = v - 16; d.data[i * 4 + 3] = 255; }
  lg.putImageData(d, 0, 0); p.globalAlpha = .25; p.globalCompositeOperation = 'multiply'; p.drawImage(lo, 0, 0, W, H); p.globalAlpha = 1;
  for (let i = 0; i < 1300; i++) { const x = hash(i * 5 + 1) * W, y = hash(i * 5 + 2) * H, a = hash(i * 5 + 3) * TAU, l = 20 + hash(i * 5 + 4) * 70;
    p.strokeStyle = `rgba(150,130,100,${.03 + hash(i * 11) * .05})`; p.lineWidth = .8 + hash(i * 13); p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + .5) * l * .5, y + Math.sin(a + .5) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke(); }
  for (let i = 0; i < 1800; i++) { p.fillStyle = `rgba(110,95,80,${.04 + hash(i * 17) * .07})`; p.fillRect(hash(i * 3 + 5) * W, hash(i * 3 + 6) * H, 1.5, 1.5); }
  p.globalCompositeOperation = 'source-over'; const v = p.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(120,90,50,0)'); v.addColorStop(1, 'rgba(120,90,50,.18)'); p.fillStyle = v; p.fillRect(0, 0, W, H);
  PAP = c; return c;
}

// ---- mountains ----
// ridge(x): height above base of a range of rounded-pointed peaks [[cx, h, w], ...]
export const ridgeF = peaks => x => { let m = 0; for (const [cx, h, w] of peaks) { const u = Math.abs(x - cx) / w; if (u < 1) m = Math.max(m, h * Math.pow(1 - u, 1.6) * (1 + .08 * Math.sin(x * .05 + cx))); } return m; };
// a baked range: dark stipple (near) or pale wash (far); returns { c, y0 } canvas covering y0..y0+ch
export function range(peaks, base, { tone = .9, far = false, dots = 26000, seed = 1, fade = 260, outline = true, col = '#8fa0ad' } = {}) {
  const f = ridgeF(peaks), top = base - Math.max(...peaks.map(p => p[1])) - 20, ch = base - top + fade + 40, c = mk(W, ch), g = c.getContext('2d'), Y = y => y - top;
  if (far) { // pale blue-grey wash peaks with a soft lower fade + light stipple on the ridge
    const gr = g.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, col); gr.addColorStop(.6, col + '99'); gr.addColorStop(1, col + '00');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-10, Y(base + fade)); for (let x = -10; x <= W + 10; x += 6) g.lineTo(x, Y(base - f(x))); g.lineTo(W + 10, Y(base + fade)); g.closePath(); g.fill();
    g.filter = 'blur(2px)'; g.drawImage(c, 0, 0); g.filter = 'none';
  }
  for (let i = 0; i < dots; i++) { const x = hash(seed + i * 1.37) * W, h = f(x); if (h < 4) continue; const dd = hash(seed + i * 2.71);
    const y = base - h + dd * (h + fade) * .9, depth = (y - (base - h)) / (h * .55 + fade * .4), side = (x - peaks.reduce((a, p) => Math.abs(p[0] - x) < Math.abs(a - x) ? p[0] : a, 0)) < 0 ? 1 : .55;
    const pr = Math.exp(-depth * (far ? 2.6 : 1.9)) * side; if (hash(seed + i * 4.1) > pr) continue;
    g.fillStyle = ink(tone * (far ? .35 : .8) * (.45 + .55 * hash(i * 7.7))); const s = 1.2 + 1.8 * hash(i * 9.1); g.fillRect(x, Y(y), s, s); }
  if (outline) { g.strokeStyle = ink(tone * (far ? .35 : .85)); g.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) { g.lineWidth = pass ? 1.4 : 3.2; g.beginPath(); for (let x = -10; x <= W + 10; x += 5) { const y = Y(base - f(x)) + (hash(x * .3 + pass + seed) - .5) * 2.2; x === -10 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } }
  return { c, y0: top };
}
export function putRange(g, R, { dx = 0, dy = 0, a = 1, reveal = 1 } = {}) { if (a <= 0) return; g.save(); g.globalAlpha *= a; if (reveal < 1) { g.beginPath(); g.rect(0, 0, W * reveal, H); g.clip(); } g.drawImage(R.c, dx, R.y0 + dy); g.restore(); }
// a single brush line drawing a ridge (the demo's opening), k 0..1
export function ridgeLine(g, peaks, base, k, lw = 5) { if (k <= 0) return; const f = ridgeF(peaks); g.save(); g.strokeStyle = ink(.9); g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
  for (let x = -10; x <= -10 + (W + 20) * k; x += 5) { const y = base - f(x) + (hash(x * .21) - .5) * 2.5; x === -10 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.restore(); }

// ---- atmosphere ----
export function mist(g, y, h, t, { a = .45, seed = 1, col = '255,253,246', drift = 12 } = {}) {
  g.save(); g.globalAlpha *= a; for (let i = 0; i < 7; i++) { const cx = ((hash(seed + i) * 1.4 - .2) * W + t * drift * (.6 + .4 * hash(i + seed)) ) % (W * 1.5) - W * .2, rx = 260 + 200 * hash(seed + i * 3), ry = h * (.5 + .5 * hash(seed + i * 5));
    const gr = g.createRadialGradient(cx, y, 0, cx, y, rx); gr.addColorStop(0, `rgba(${col},.85)`); gr.addColorStop(.5, `rgba(${col},.4)`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.save(); g.translate(cx, y); g.scale(1, ry / rx); g.translate(-cx, -y); g.beginPath(); g.arc(cx, y, rx, 0, TAU); g.fill(); g.restore(); }
  g.restore();
}
export function haze(g, x, y, r, col = '150,175,200', a = .5) { const gr = g.createRadialGradient(x, y, r * .2, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
// the moon: o = 0 pale, 1 orange; halo warm; slight squash near the horizon (sq)
export function moon(g, x, y, r, o = 0, { a = 1, sq = 0 } = {}) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  haze(g, x, y, r * 3.2, o > .5 ? '230,170,120' : '160,180,205', .35); const hc = o > .3 ? '255,190,120' : '255,246,220';
  const gl = g.createRadialGradient(x, y, r * .9, x, y, r * 1.9); gl.addColorStop(0, `rgba(${hc},.55)`); gl.addColorStop(1, `rgba(${hc},0)`); g.fillStyle = gl; g.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
  g.translate(x, y); g.scale(1, 1 - sq * .06);
  const gr = g.createRadialGradient(-r * .25, -r * .25, r * .1, 0, 0, r); gr.addColorStop(0, lc('#fbf8ee', '#f8c98a', o)); gr.addColorStop(1, lc('#ece4cf', '#e88a4a', o));
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  g.fillStyle = o > .5 ? 'rgba(170,80,30,.14)' : 'rgba(150,140,120,.12)'; [[.3, -.2, .22], [-.32, .2, .18], [.05, .42, .12], [-.1, -.4, .1]].forEach(([a1, b, c]) => { g.beginPath(); g.arc(a1 * r, b * r, c * r, 0, TAU); g.fill(); });
  g.restore();
}
export function birds(g, t, { x0 = 200, y0 = 420, n = 5, sp = 40, s = 1, seed = 2 } = {}) {
  g.save(); g.strokeStyle = ink(.75); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = (x0 + i * 46 + t * sp) % (W + 200) - 100, y = y0 + i * 14 * (i % 2 ? 1 : -.6) + 6 * Math.sin(t * 1.5 + i), f = Math.sin(t * 9 + i * 1.7) * 6 * s;
    g.lineWidth = 2.6 * s; g.beginPath(); g.moveTo(x - 12 * s, y - f * .5); g.quadraticCurveTo(x - 5 * s, y - 4 * s - f, x, y); g.quadraticCurveTo(x + 5 * s, y - 4 * s - f, x + 12 * s, y - f * .5); g.stroke(); }
  g.restore();
}
// plum branch from the top-right corner; blossoms pop in with k
export function plum(g, k, t, { x = W + 20, y = 160, s = 1, flip = false } = {}) {
  g.save(); g.translate(x, y); g.scale(flip ? -s : s, s);
  const br = [[[0, 0], [-160, 40], [-300, 70], [-430, 140]], [[-160, 40], [-200, 120], [-250, 170]], [[-300, 70], [-330, 10], [-380, -20]], [[-430, 140], [-470, 200]]];
  br.forEach((pts, bi) => { g.strokeStyle = ink(.9); g.lineCap = 'round'; for (let i = 1; i < pts.length; i++) { g.lineWidth = (bi ? 7 : 14) * (1 - i / (pts.length + 1)); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0] + (hash(i + bi) - .5) * 6, pts[i][1]); g.stroke(); }
    pts.forEach(([px, py], i) => { if (i && hash(bi * 9 + i) > .3) { g.fillStyle = ink(.95); g.beginPath(); g.arc(px, py, 4, 0, TAU); g.fill(); } }); });
  const bl = [[-90, 22], [-210, 55], [-250, 165], [-320, 40], [-372, -14], [-410, 125], [-465, 196], [-140, 30], [-290, 82], [-190, 110], [-350, 105]];
  bl.forEach(([bx, by], i) => { const kk = clamp(k * 1.6 - i * .06); if (kk <= 0) return; const r = (11 + 5 * hash(i)) * backOut(kk), sw = .05 * Math.sin(t * 1.3 + i);
    g.save(); g.translate(bx, by); g.rotate(sw + i); g.fillStyle = i % 3 ? '#c8462e' : '#d96a4c';
    for (let p = 0; p < 5; p++) { g.beginPath(); g.ellipse(Math.cos(p * TAU / 5) * r * .6, Math.sin(p * TAU / 5) * r * .6, r * .55, r * .42, p * TAU / 5, 0, TAU); g.fill(); }
    g.fillStyle = '#f2c25a'; g.beginPath(); g.arc(0, 0, r * .22, 0, TAU); g.fill(); g.restore(); });
  g.restore();
}
// rough ensō brush circle (drawn on with k), used as inset frames
export function enso(g, x, y, r, k, { lw = 12, a = 1, seed = 3 } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= a; g.lineCap = 'round'; const a0 = -1.9 + seed * .3, n = 90, end = Math.floor(n * clamp(k) * .96);
  for (let pass = 0; pass < 3; pass++) { g.strokeStyle = ink(pass ? .35 : .85); g.beginPath();
    for (let i = 0; i <= end; i++) { const an = a0 + i / n * TAU, rr = r * (1 + (hash(seed + i * .7 + pass) - .5) * .03) + pass * 3; const px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.lineWidth = pass ? lw * .35 : lw * (1 - .4 * (end / n)); g.stroke(); }
  g.restore();
}
// ink figure in a conical hat (demo's small traveller); optional lantern
export function figure(g, x, y, s, { lantern = 0, t = 0, walk = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = ink(.9);
  g.beginPath(); g.moveTo(-14, 0); g.lineTo(-10, -48); g.lineTo(10, -48); g.lineTo(14, 0); g.fill();
  const st = Math.sin(walk * 6) * 4; g.fillRect(-8 + st, -4, 5, 8); g.fillRect(3 - st, -4, 5, 8);
  g.beginPath(); g.arc(0, -56, 9, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-22, -58); g.lineTo(0, -76); g.lineTo(22, -58); g.closePath(); g.fill();
  if (lantern > 0) { g.strokeStyle = ink(.9); g.lineWidth = 2; g.beginPath(); g.moveTo(10, -30); g.lineTo(26, -36); g.lineTo(26, -22); g.stroke();
    const f = .85 + .15 * Math.sin(t * 7) * Math.sin(t * 3.1); g.fillStyle = `rgba(230,120,60,${f})`; g.beginPath(); g.ellipse(26, -14, 7, 9, 0, 0, TAU); g.fill();
    const gr = g.createRadialGradient(26, -14, 2, 26, -14, 50); gr.addColorStop(0, `rgba(255,190,120,${.5 * f * lantern})`); gr.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = gr; g.fillRect(-30, -70, 110, 110); }
  g.restore();
}
export function house(g, x, y, s, lit = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#e9e2d2'; g.fillRect(-90, -60, 180, 60); g.strokeStyle = ink(.8); g.lineWidth = 3; g.strokeRect(-90, -60, 180, 60);
  g.fillStyle = ink(.92); g.beginPath(); g.moveTo(-120, -56); g.quadraticCurveTo(-60, -70, -40, -112); g.lineTo(40, -112); g.quadraticCurveTo(60, -70, 120, -56); g.closePath(); g.fill();
  g.fillStyle = lit ? '#f2b064' : '#cfc6b4'; g.fillRect(-56, -46, 40, 32); g.strokeStyle = ink(.7); g.lineWidth = 2; g.strokeRect(-56, -46, 40, 32); g.beginPath(); g.moveTo(-36, -46); g.lineTo(-36, -14); g.moveTo(-56, -30); g.lineTo(-16, -30); g.stroke();
  if (lit) { const gr = g.createRadialGradient(-36, -30, 4, -36, -30, 90); gr.addColorStop(0, 'rgba(255,190,110,.35)'); gr.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gr; g.fillRect(-130, -120, 190, 180); }
  g.fillStyle = ink(.8); g.fillRect(20, -50, 26, 50); g.restore();
}
export function ripples(g, y, t, { a = .5, x0 = 0, x1 = W } = {}) {
  g.save(); g.strokeStyle = ink(.35 * a); g.lineCap = 'round';
  for (let r = 0; r < 7; r++) { const yy = y + r * 26 + r * r * 2; g.lineWidth = 1.6 + r * .3; g.beginPath(); for (let x = x0; x <= x1; x += 40) { const px = x + (hash(r * 7 + Math.floor(x / 40)) - .5) * 20; const on = Math.sin(px * .02 + r * 2 + t * .8) > -.2; if (on) { g.moveTo(px, yy + Math.sin(px * .03 + t) * 2); g.lineTo(px + 24 + 20 * hash(r + x), yy + Math.sin(px * .03 + t) * 2); } } g.stroke(); }
  g.restore();
}
// text: centred serif (Cormorant italic is our only serif), vertical word column, seal
export function serif(g, text, x, y, { size = 60, a = 1, tone = .9, align = 'center', reveal = 1, w = 600, ls = 0 } = {}) {
  if (a <= 0 || reveal <= 0) return; g.save(); g.globalAlpha *= a; g.font = `italic ${w} ${size}px "Cormorant Garamond"`; g.textAlign = align; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = `${ls}px`; const tw = g.measureText(text).width, x0 = align === 'center' ? x - tw / 2 : x;
  if (reveal < 1) { g.beginPath(); g.rect(x0 - 20, y - size, (tw + 40) * reveal, size * 2); g.clip(); }
  g.fillStyle = ink(tone); g.fillText(text, x, y); g.restore();
}
export function column(g, words, x, y, k, { size = 92, gap = 1.05, seal = '' } = {}) {
  words.forEach((wd, i) => serif(g, wd, x, y + i * size * gap, { size, w: 700, a: clamp(k * words.length - i), tone: .92 }));
  if (seal) sealMark(g, x, y + words.length * size * gap + 10, 54, seal, clamp(k * words.length - words.length + .5));
}
export function sealMark(g, x, y, s, txt = '', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(-.04); g.fillStyle = VERM; g.beginPath();
  for (let i = 0; i < 28; i++) { const q = i / 28 * 4, e = Math.floor(q), u = q - e, c = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]], p = c[e], n = c[(e + 1) % 4], j = (hash(i + 3) - .5) * .05; i ? g.lineTo((lerp(p[0], n[0], u) + j) * s, (lerp(p[1], n[1], u) + j) * s) : g.moveTo((p[0] + j) * s, (p[1] + j) * s); }
  g.closePath(); g.fill(); g.strokeStyle = 'rgba(245,230,215,.8)'; g.lineWidth = 2; g.strokeRect(-s * .38, -s * .38, s * .76, s * .76);
  if (txt) { g.fillStyle = '#f6e9dc'; g.font = `italic 700 ${s * .3}px "Cormorant Garamond"`; g.textAlign = 'center'; g.textBaseline = 'middle'; txt.split(' ').forEach((l, i, A) => g.fillText(l, 0, (i - (A.length - 1) / 2) * s * .3)); }
  g.restore();
}
export function parse(s) { const o = []; s.split('**').forEach((t, i) => t && o.push({ t, b: i % 2 === 1 })); return o; }
// quiet centred subtitle: italic serif, ink on paper (bold words in full ink), tiny vermilion square
export function subtitle(g, cap, a = 1, y0 = 1640) {
  if (a <= 0) return; const SZ = 60, maxW = 920; g.save(); g.globalAlpha = a; g.textBaseline = 'middle';
  const toks = []; parse(cap).forEach(p => p.t.split(/\s+/).filter(Boolean).forEach(w => toks.push({ w, b: p.b })));
  const m = tk => { g.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; return g.measureText(tk.w + ' ').width; };
  const lines = [[]]; let cw = 0; for (const tk of toks) { const w = m(tk); if (cw + w > maxW && lines[lines.length - 1].length) { lines.push([]); cw = 0; } lines[lines.length - 1].push(tk); cw += w; }
  const lh = 64, top = y0 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => { const tw = ln.reduce((s, tk) => s + m(tk), 0); let x = W / 2 - tw / 2; if (i === 0) { g.fillStyle = VERM; g.fillRect(x - 30, top - 7, 13, 13); }
    for (const tk of ln) { g.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; g.lineJoin = 'round'; g.strokeStyle = 'rgba(239,232,216,.92)'; g.lineWidth = 10; g.strokeText(tk.w, x, top + i * lh); g.fillStyle = tk.b ? (tk.w.match(/orange|red/i) ? '#b8462a' : ink(.98)) : ink(.84); g.fillText(tk.w, x, top + i * lh); x += m(tk); } });
  g.restore();
}
export function createInkMoon(canvas) { canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px'; return canvas.getContext('2d'); }
