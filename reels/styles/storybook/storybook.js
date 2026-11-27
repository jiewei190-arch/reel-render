// storybook.js: template #21 "Storybook paint" (demo t21, x.com/songkeys), vertical 1080x1920, Canvas2D.
// Grammar copied from the demo frames: a sketchbook on a wooden desk with a yellow pencil; scenes are soft coloured-pencil
// paintings (flat muted fill + diagonal pencil hatching + thin wobbly ink outline) on cream paper grain; banded skies,
// rolling outlined hills with grass tufts and dot flowers; round-headed kids with dot eyes and rosy cheeks; night skies with
// stars and a pale moon; warm glow halos with soft rays; white "constellation" line diagrams (thin lines + star dots).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const INK = '#3b3340';
export const PAL = { paper: '#f1e8d6', paper2: '#e6dcc5', desk: '#6b4a32', desk2: '#4e3422', night0: '#1c2147', night1: '#2c3366', hill0: '#3d5a63', hill1: '#2e4a52',
  dayHill0: '#a9c79a', dayHill1: '#8fb487', sky0: '#bcd3da', pink: '#e9a7a0', peach: '#f1c48f', cream: '#f6efe0', skin: '#e9b48f', skin2: '#b57b58', red: '#d9655a', blue: '#7fa6d6', gold: '#f2c35b' };

// ---- textures ----
let GR = null;
export function grainTex() {
  if (GR) return GR; const s = 512, c = mk(s, s), g = c.getContext('2d'), d = g.createImageData(s, s);
  for (let i = 0; i < s * s; i++) { const x = i % s, y = (i / s) | 0; const v = 128 + (hash(i * .71) - .5) * 46 + 18 * Math.sin(x * .05 + Math.sin(y * .031) * 3) * Math.cos(y * .043);
    d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  g.putImageData(d, 0, 0); GR = c; return c;
}
// paper grain + soft vignette over the whole frame (call last)
export function finish(g, { grain = .22, vig = .35, t = 0 } = {}) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = grain; const p = g.createPattern(grainTex(), 'repeat');
  g.translate((t * 37 % 2) | 0, 0); g.fillStyle = p; g.fillRect(-4, 0, W + 8, H); g.restore();
  g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .25; g.fillStyle = '#f3d9b0'; g.fillRect(0, 0, W, H); g.restore();
  const v = g.createRadialGradient(W / 2, H * .48, H * .3, W / 2, H * .5, H * .75); v.addColorStop(0, 'rgba(30,20,30,0)'); v.addColorStop(1, `rgba(30,20,30,${vig})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---- wobbly hand-drawn paths ----
// closed smooth wobbly curve through points [[x,y],...] (jitter in px)
export function blob(p, pts, j = 2, seed = 0) {
  const q = pts.map(([x, y], i) => [x + (hash(seed + i * 1.7) - .5) * j, y + (hash(seed + i * 3.1) - .5) * j]);
  const n = q.length, m = i => [(q[i % n][0] + q[(i + 1) % n][0]) / 2, (q[i % n][1] + q[(i + 1) % n][1]) / 2];
  const s = m(n - 1); p.moveTo(s[0], s[1]); for (let i = 0; i < n; i++) { const e = m(i); p.quadraticCurveTo(q[i][0], q[i][1], e[0], e[1]); } p.closePath(); return p;
}
export function circPts(x, y, rx, ry = rx, n = 18) { return Array.from({ length: n }, (_, i) => [x + Math.cos(i / n * TAU) * rx, y + Math.sin(i / n * TAU) * ry]); }
// paint a shape: flat fill + coloured-pencil hatching + wobbly ink outline
export function paint(g, path, col, { hatch = .18, ink = INK, lw = 2.6, hcol = null, ang = -.9, gap = 7, a = 1, outline = true, seed = 0 } = {}) {
  g.save(); g.globalAlpha *= a; g.fillStyle = col; g.fill(path);
  if (hatch > 0) { g.save(); g.clip(path); g.globalAlpha *= hatch; g.strokeStyle = hcol || 'rgba(255,255,255,.9)'; g.lineWidth = 2;
    const b = 2600; g.translate(W / 2, H / 2); g.rotate(ang); g.beginPath();
    for (let y = -b; y < b; y += gap) { const o = (hash(y * .13 + seed) - .5) * 4; g.moveTo(-b, y + o); g.lineTo(b, y - o); } g.stroke();
    g.globalAlpha = hatch * .8; g.strokeStyle = 'rgba(40,30,50,.6)'; g.beginPath(); for (let y = -b + 3; y < b; y += gap * 2.3) { g.moveTo(-b, y); g.lineTo(b, y + 3); } g.stroke(); g.restore(); }
  if (outline) { g.strokeStyle = ink; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(path); }
  g.restore();
}
export const P2 = fn => { const p = new Path2D(); fn(p); return p; };

// ---- scenery ----
export function skyBands(g, cols, y0 = 0, y1 = 1100, wob = 14, seed = 1) {
  const n = cols.length; for (let i = 0; i < n; i++) {
    const ya = lerp(y0, y1, i / n) - 6, yb = lerp(y0, y1, (i + 1) / n) + 6;
    const p = P2(p => { p.moveTo(-20, ya); for (let x = 0; x <= W + 40; x += 60) p.lineTo(x, ya + wob * Math.sin(x * .006 + i * 1.3 + seed)); p.lineTo(W + 40, yb + 20); p.lineTo(-20, yb + 20); p.closePath(); });
    paint(g, p, cols[i], { hatch: .12, outline: false, seed: i });
  }
}
export function hill(g, y, amp, col, { freq = 1, ph = 0, seed = 0, tufts = 10, hatch = .15, tuftCol = '#4b6b4a' } = {}) {
  const p = P2(p => { p.moveTo(-30, H + 40); p.lineTo(-30, y); for (let x = -30; x <= W + 40; x += 30) p.lineTo(x, y - amp * Math.sin((x / W) * Math.PI * freq + ph) + 3 * Math.sin(x * .05 + seed)); p.lineTo(W + 40, H + 40); p.closePath(); });
  paint(g, p, col, { hatch, seed, lw: 2.2 });
  g.save(); g.strokeStyle = tuftCol; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0; i < tufts; i++) { const x = hash(seed + i * 2.3) * W, yy = y - amp * Math.sin((x / W) * Math.PI * freq + ph) + 30 + hash(seed + i) * 260;
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x + k * 5, yy); g.quadraticCurveTo(x + k * 9, yy - 14, x + k * 14, yy - 22 - 6 * hash(i + k)); g.stroke(); } }
  g.restore();
}
export function stars(g, n, t, { y1 = 900, seed = 3, a = 1 } = {}) {
  g.save(); for (let i = 0; i < n; i++) { const x = hash(seed + i) * W, y = hash(seed + i * 7.3) * y1, tw = .5 + .5 * Math.sin(t * 1.7 + i * 2.1), s = 1.5 + 2.5 * hash(i * 3.7);
    g.globalAlpha = a * (.35 + .65 * tw); g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
    if (s > 3.4) { g.strokeStyle = '#fff6dc'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.moveTo(x, y - 9); g.lineTo(x, y + 9); g.stroke(); } }
  g.restore();
}
export function glow(g, x, y, r, col = '255,230,170', a = 1) {
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${.75 * a})`); gr.addColorStop(.3, `rgba(${col},${.3 * a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
// the demo's soft light rays (fan of faint wedges) around a glowing thing
export function rays(g, x, y, r, t, col = '255,236,190', a = .5, n = 14) {
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const an = i / n * TAU + t * .05, w = .06 + .03 * hash(i);
    const gr = g.createRadialGradient(x, y, r * .1, x, y, r); gr.addColorStop(0, `rgba(${col},${a * .5})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr;
    g.beginPath(); g.moveTo(x, y); g.arc(x, y, r * (.7 + .3 * hash(i * 5)), an - w, an + w); g.closePath(); g.fill(); } g.restore();
}
export function moonP(g, x, y, r, a = 1) { g.save(); g.globalAlpha *= a; glow(g, x, y, r * 2.4, '255,245,210', .35); paint(g, P2(p => blob(p, circPts(x, y, r), 1.5, 4)), '#efe6c4', { hatch: .2, lw: 2, hcol: 'rgba(200,180,140,.6)' });
  g.fillStyle = 'rgba(190,170,130,.35)'; [[.3, -.2, .2], [-.3, .25, .15], [.1, .4, .1]].forEach(([a1, b, c]) => { g.beginPath(); g.arc(x + a1 * r, y + b * r, c * r, 0, TAU); g.fill(); }); g.restore(); }
// white constellation line: points joined by thin lines with star dots, drawn on progressively (k 0..1)
export function constLine(g, pts, k, { col = 'rgba(255,250,235,.92)', lw = 3.6, dot = 6, dash = null } = {}) {
  if (k <= 0) return; g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw; g.lineCap = 'round'; if (dash) g.setLineDash(dash);
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let rem = tot * clamp(k); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && rem > 0; i++) { const u = Math.min(1, rem / L[i - 1]); g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); rem -= L[i - 1]; }
  g.stroke(); g.setLineDash([]); rem = tot * clamp(k);
  for (let i = 0; i < pts.length; i++) { if (i > 0) rem -= L[i - 1]; if (rem < -1) break; g.globalAlpha = .9; g.beginPath(); g.arc(pts[i][0], pts[i][1], dot, 0, TAU); g.fill(); glow(g, pts[i][0], pts[i][1], dot * 5, '255,250,230', .4); }
  g.restore();
}
// handwritten pencil text revealed letter by letter (k 0..1)
export function hand(g, text, x, y, k, { size = 64, col = INK, align = 'center', font = 'Caveat', w = 700, a = 1 } = {}) {
  if (k <= 0 || a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `${w} ${size}px ${font}`; g.fillStyle = col; g.textBaseline = 'middle';
  const n = Math.ceil(text.length * clamp(k)), s = text.slice(0, n), full = g.measureText(text).width;
  const x0 = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x; g.textAlign = 'left'; g.fillText(s, x0, y); g.restore();
  return [x0 + g.measureText(s).width, y];
}
// a pencil-drawn arrow
export function arrowP(g, x0, y0, x1, y1, k = 1, col = INK, lw = 3.5) {
  if (k <= 0) return; const x = lerp(x0, x1, k), y = lerp(y0, y1, k), mx = (x0 + x) / 2 + (y - y0) * .12, my = (y0 + y) / 2 - (x - x0) * .12;
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x, y); g.stroke();
  if (k > .9) { const a = Math.atan2(y - my, x - mx); g.beginPath(); g.moveTo(x - Math.cos(a - .5) * 22, y - Math.sin(a - .5) * 22); g.lineTo(x, y); g.lineTo(x - Math.cos(a + .5) * 22, y - Math.sin(a + .5) * 22); g.stroke(); }
  g.restore();
}

// ---- characters ----
// round-headed kid (demo style): dot eyes, rosy cheeks, simple dress/tunic, stick legs; arm angle in radians
export function kid(g, x, y, s, { body = '#e6a1a6', hair = '#4a3328', skin = PAL.skin, arm = .3, arm2 = -.3, look = 0, blink = 0, mouth = 'smile', scarf = null, red = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = INK; g.lineWidth = 2.4; g.lineCap = 'round';
  for (const lx of [-12, 12]) { g.beginPath(); g.moveTo(lx, -40); g.lineTo(lx, 0); g.stroke(); g.fillStyle = INK; g.beginPath(); g.ellipse(lx + 2, 2, 8, 4, 0, 0, TAU); g.fill(); }
  const armL = (ax, an) => { g.save(); g.translate(ax, -110); g.rotate(an); g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 52); g.stroke(); g.strokeStyle = skin; g.lineWidth = 5.5; g.stroke(); g.restore(); };
  armL(-26, arm); armL(26, arm2);
  paint(g, P2(p => blob(p, [[-24, -120], [24, -120], [36, -40], [-36, -40]], 2, 7)), body, { hatch: .2, lw: 2.2 });
  if (scarf) paint(g, P2(p => p.roundRect(-26, -128, 52, 16, 8)), scarf, { hatch: .1, lw: 2 });
  paint(g, P2(p => blob(p, circPts(0, -160, 38, 40, 16), 1.5, 9)), skin, { hatch: .12, lw: 2.2 });
  paint(g, P2(p => { p.moveTo(-40, -158); p.bezierCurveTo(-44, -214, 44, -214, 40, -158); p.bezierCurveTo(24, -184, -20, -184, -40, -158); }), hair, { hatch: .15, lw: 2.2 });
  g.fillStyle = INK; const ey = -156; if (red > 0) { for (const ex of [-12, 12]) { glow(g, ex + look, ey, 26, '255,60,40', red); g.fillStyle = '#e0362a'; g.beginPath(); g.arc(ex + look, ey, 6, 0, TAU); g.fill(); } g.fillStyle = INK; } else if (blink > .5) { g.fillRect(-16 + look, ey, 9, 2.5); g.fillRect(8 + look, ey, 9, 2.5); } else { g.beginPath(); g.arc(-12 + look, ey, 4, 0, TAU); g.arc(12 + look, ey, 4, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(230,110,110,.45)'; g.beginPath(); g.arc(-22, -143, 7, 0, TAU); g.arc(22, -143, 7, 0, TAU); g.fill();
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); if (mouth === 'o') g.arc(look, -136, 5, 0, TAU); else g.arc(look, -142, 8, .3, Math.PI - .3); g.stroke();
  g.restore();
}
// sitting cat: body, head with ears, tail; eye glow e (0..1) with colour; look offset
export function cat(g, x, y, s, t, { col = '#5b5f73', e = 0, eyeCol = '170,255,150', tail = 0, blink = 0, kitten = false } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const tw = Math.sin(t * 1.6 + tail) * .25;
  g.save(); g.translate(40, -20); g.rotate(tw); paint(g, P2(p => { p.moveTo(0, 0); p.bezierCurveTo(70, 10, 90, -60, 60, -110); p.lineTo(74, -116); p.bezierCurveTo(110, -60, 84, 26, 0, 18); p.closePath(); }), col, { hatch: .18, lw: 2.4 }); g.restore();
  paint(g, P2(p => blob(p, [[-50, 0], [-58, -60], [-34, -120], [0, -132], [34, -120], [58, -60], [50, 0]], 2, 3)), col, { hatch: .2, lw: 2.4 });
  const hy = kitten ? -150 : -160, hr = kitten ? 50 : 46;
  paint(g, P2(p => { p.moveTo(-hr * .9, hy - hr * .3); p.lineTo(-hr * .75, hy - hr * 1.35); p.lineTo(-hr * .2, hy - hr * .85); p.lineTo(hr * .2, hy - hr * .85); p.lineTo(hr * .75, hy - hr * 1.35); p.lineTo(hr * .9, hy - hr * .3);
    p.bezierCurveTo(hr * 1.05, hy + hr * .8, -hr * 1.05, hy + hr * .8, -hr * .9, hy - hr * .3); p.closePath(); }), col, { hatch: .2, lw: 2.4 });
  g.strokeStyle = INK; g.lineWidth = 1.8; for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(sd * 16, hy + 14 + k * 6); g.lineTo(sd * 52, hy + 8 + k * 12); g.stroke(); }
  g.fillStyle = '#d98a8a'; g.beginPath(); g.moveTo(-6, hy + 8); g.lineTo(6, hy + 8); g.lineTo(0, hy + 14); g.fill();
  const ex = hr * .42, ey = hy - 6, er = kitten ? 13 : 11;
  for (const sd of [-1, 1]) {
    if (e > .02) { glow(g, sd * ex, ey, 70 * e + 20, eyeCol, .9 * e); g.fillStyle = `rgba(${eyeCol},1)`; } else g.fillStyle = '#d9c86a';
    if (blink > .5) { g.fillStyle = INK; g.fillRect(sd * ex - er, ey, er * 2, 3); continue; }
    g.beginPath(); g.ellipse(sd * ex, ey, er, er * .9, 0, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    g.fillStyle = e > .02 ? `rgba(255,255,240,${.6 + .4 * e})` : INK; g.beginPath(); g.ellipse(sd * ex, ey, er * .28, er * .8, 0, 0, TAU); g.fill();
  }
  g.restore();
}
// the sketchbook on the desk (portrait): page rect, with soft page curl shading, spine on the left, pencil
export const PAGE = { x: 90, y: 150, w: 900, h: 1500 };
export function book(g, { pencil = null } = {}) {
  const d = g.createLinearGradient(0, 0, W, H); d.addColorStop(0, PAL.desk); d.addColorStop(1, PAL.desk2); g.fillStyle = d; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .12; g.strokeStyle = '#2a1a10'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const y = hash(i) * H; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + 20, W * .6, y - 20, W, y + 8); g.stroke(); } g.restore();
  const { x, y, w, h } = PAGE;
  g.save(); g.shadowColor = 'rgba(20,10,5,.5)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = PAL.paper2; g.fillRect(x - 20, y + 6, w + 30, h + 10); g.restore();
  g.fillStyle = PAL.paper; g.fillRect(x, y, w, h);
  const sp = g.createLinearGradient(x, 0, x + 120, 0); sp.addColorStop(0, 'rgba(90,60,40,.35)'); sp.addColorStop(1, 'rgba(90,60,40,0)'); g.fillStyle = sp; g.fillRect(x, y, 120, h);
}
export function pencil(g, x, y, ang = -.75, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.shadowColor = 'rgba(20,10,5,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 10;
  g.fillStyle = '#e9b93c'; g.fillRect(40, -12, 330, 24); g.shadowColor = 'transparent';
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(40, -12, 330, 6); g.fillStyle = '#c9c4b8'; g.fillRect(370, -13, 26, 26); g.fillStyle = '#e8a0a8'; g.fillRect(396, -12, 28, 24);
  g.fillStyle = '#f0d6ae'; g.beginPath(); g.moveTo(40, -12); g.lineTo(0, 0); g.lineTo(40, 12); g.fill(); g.fillStyle = INK; g.beginPath(); g.moveTo(12, -4); g.lineTo(0, 0); g.lineTo(12, 4); g.fill();
  g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = 1.5; g.strokeRect(40, -12, 330, 24); g.restore();
}
// subtitle: handwriting on a torn paper slip under the action
export function parse(s) { const o = []; s.split('**').forEach((t, i) => t && o.push({ t, b: i % 2 === 1 })); return o; }
export function subtitle(g, cap, a = 1, y0 = 1700) {
  if (a <= 0) return; const size = 62, maxW = 920; g.save(); g.font = `700 ${size}px Caveat`;
  const words = []; parse(cap).forEach(p => p.t.split(/(\s+)/).forEach(w => w && words.push({ w, b: p.b })));
  const lines = [[]]; let cw = 0;
  for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > maxW && !/^\s+$/.test(w.w) && lines[lines.length - 1].length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines[lines.length - 1].push(w); cw += m; } }
  const lh = 66, top = y0 - (lines.length - 1) * lh / 2, widest = Math.max(...lines.map(l => l.reduce((s, w) => s + g.measureText(w.w).width, 0)));
  g.globalAlpha = a; g.shadowColor = 'rgba(20,10,10,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 6; g.fillStyle = '#f6efe0';
  const bx = W / 2 - widest / 2 - 34, by = top - lh / 2 - 14, bw = widest + 68, bh = lines.length * lh + 28;
  g.beginPath(); g.moveTo(bx, by); for (let i = 0; i <= 12; i++) g.lineTo(bx + bw * i / 12, by + (hash(i * 3.3) - .5) * 6); g.lineTo(bx + bw, by + bh); for (let i = 12; i >= 0; i--) g.lineTo(bx + bw * i / 12, by + bh + (hash(i * 5.1) - .5) * 6); g.closePath(); g.fill();
  g.shadowColor = 'transparent'; g.textBaseline = 'middle';
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + g.measureText(w.w).width, 0); let x = W / 2 - tw / 2;
    for (const w of ln) { g.fillStyle = w.b ? '#c4543f' : INK; g.fillText(w.w, x, top + i * lh); x += g.measureText(w.w).width; } });
  g.restore();
}
export function createSB(canvas) { canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px'; return canvas.getContext('2d'); }
