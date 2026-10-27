// lantern.js: paper-cut shadow-box ("paper lantern") look, vertical 1080x1920, Canvas2D only.
// Technique ported from the idea of layered cut card lit from behind; no Lemo code or assets.
export const W = 1080, H = 1920;
export const BOX = { x: 70, y: 100, w: 940, h: 1350 };      // the glowing window of the lamp
export const M = 80;                                         // overscan margin of every sheet (parallax room)
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export const PAL = {
  room: '#140d0a', wood: '#6a4426', wood2: '#43280f', glow: '#ffb862', cream: '#fff0c8', ink: '#2a2140', gold: '#ffcf6b',
  sky0: '#0d1538', sky1: '#2c3b86', hill1: '#5167ad', hill2: '#364686', hill3: '#1d2656', front: '#0b1029',
  space0: '#1b1240', space1: '#2d1f66', earthB: '#4f9be8', earthG: '#7fd08a', moonDark: '#38437f', sun: '#ffc24a', sunRay: '#ff9a3c',
};

// ---- paper grain (tiled) ----
let GRAIN = null;
function grain() {
  if (GRAIN) return GRAIN; const c = mk(256, 256), g = c.getContext('2d'), d = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = 128 + (hash(i * .37) - .5) * 70 + (hash(i * .011) - .5) * 40; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  g.putImageData(d, 0, 0); GRAIN = c; return c;
}

// makeSheet: draw(c) paints the SHAPE in any opaque colour (holes via destination-out); we recolour it, add fibre grain,
// a warm light rim on the top edge and a dark band on the bottom edge (the value ladder that sells depth).
export function makeSheet(w, h, draw, { col = '#334', rim = 'rgba(255,214,150,.75)', dark = 'rgba(0,0,10,.5)', grainA = .10 } = {}) {
  const c = mk(w, h), g = c.getContext('2d'); draw(g);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = grainA; g.fillStyle = g.createPattern(grain(), 'repeat'); g.fillRect(0, 0, w, h); g.globalAlpha = 1;
  const band = (dy, color, from) => {                       // shape minus shape shifted by dy -> thin edge band
    const t = mk(w, h), x = t.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'destination-out'; x.drawImage(c, 0, dy);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-atop'; g.drawImage(t, 0, 0);
  };
  band(5, rim); band(-6, dark);
  g.globalCompositeOperation = 'source-over'; return c;
}
// place a sheet with a soft cast shadow onto what is behind it
export function putSheet(g, s, x, y, { sh = 1, a = 1, sc = 1 } = {}) {
  g.save(); g.globalAlpha = a;
  if (sh > 0) { g.shadowColor = `rgba(0,0,8,${.55 * sh})`; g.shadowBlur = 26; g.shadowOffsetY = 14; }
  g.drawImage(s, x, y, s.width * sc, s.height * sc); g.restore();
}
export function glow(g, x, y, r, col = '255,184,98', a = 1) {
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${.9 * a})`); gr.addColorStop(.35, `rgba(${col},${.35 * a})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
export function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// moon with a phase: theta 0 = new, pi = full, waxing (0..pi) lit on the RIGHT, waning (pi..2pi) lit on the LEFT.
export function moon(g, x, y, r, theta, { glowA = 1, craters = true, dark = PAL.moonDark, a = 1 } = {}) {
  theta = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const wax = theta <= Math.PI, k = Math.cos(theta), lit = (1 - k) / 2;
  g.save(); g.globalAlpha = a; g.translate(x, y);
  if (glowA > 0 && lit > .02) glow(g, 0, 0, r * 2.6, '255,226,160', glowA * (.25 + .75 * lit));
  g.fillStyle = dark; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,240,200,.18)'; g.lineWidth = 2; g.stroke();
  if (lit > .004) {
    if (!wax) g.scale(-1, 1);
    g.save(); g.beginPath(); g.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    const rx = Math.max(.001, Math.abs(k) * r);
    if (k >= 0) g.ellipse(0, 0, rx, r, 0, Math.PI / 2, -Math.PI / 2, true); else g.ellipse(0, 0, rx, r, 0, Math.PI / 2, -Math.PI / 2, false);
    g.closePath(); const gr = g.createRadialGradient(r * .3, -r * .2, r * .1, 0, 0, r * 1.1); gr.addColorStop(0, '#fffbe6'); gr.addColorStop(1, '#ffe4a6');
    g.fillStyle = gr; g.fill(); g.clip();
    if (craters) { g.fillStyle = 'rgba(190,150,90,.28)'; [[.25, -.3, .16], [.45, .25, .11], [-.1, .35, .13], [-.35, -.2, .1], [.05, -.05, .08]].forEach(([cx, cy, cr]) => { g.beginPath(); g.arc(cx * r, cy * r, cr * r, 0, 7); g.fill(); }); }
    g.restore();
  }
  g.restore();
}

// text helpers (**bold** segments are gold)
export function parse(s) { const o = []; s.split('**').forEach((t, i) => t && o.push({ t, b: i % 2 === 1 })); return o; }
export function subtitle(g, cap, a = 1, y0 = 1560) {
  if (a <= 0) return; const font = '600 54px "Cormorant Garamond"', maxW = 900;
  g.save(); g.font = 'italic ' + font; g.textBaseline = 'alphabetic';
  const words = []; parse(cap).forEach(p => p.t.split(/(\s+)/).forEach(w => w && words.push({ w, b: p.b })));
  const lines = [[]]; let cw = 0;
  for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > maxW && !/^\s+$/.test(w.w) && lines[lines.length - 1].length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines[lines.length - 1].push(w); cw += m; } }
  g.globalAlpha = a; const lh = 66, top = y0 + (2 - lines.length) * lh / 2;
  // soft warm paper strip behind the words so they read on the dark room
  const widest = Math.max(...lines.map(l => l.reduce((s, w) => s + g.measureText(w.w).width, 0)));
  g.fillStyle = 'rgba(20,12,8,.55)'; rr(g, W / 2 - widest / 2 - 40, top - 56, widest + 80, lines.length * lh + 34, 30); g.fill();
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + g.measureText(w.w).width, 0); let x = W / 2 - tw / 2;
    for (const w of ln) { g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 8; g.shadowOffsetY = 3; g.fillStyle = w.b ? PAL.gold : '#fff3dc'; g.fillText(w.w, x, top + i * lh); x += g.measureText(w.w).width; } });
  g.restore();
}
// a small cut-paper tag (handwritten label)
export function tag(g, text, x, y, { k = 1, rot = -.03, col = '#fff0c8', ink = '#3a2b4d', size = 44, a = 1 } = {}) {
  if (k <= 0 || a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `700 ${size}px Caveat`;
  const w = g.measureText(text).width + 44, h = size + 26;
  g.shadowColor = 'rgba(0,0,10,.5)'; g.shadowBlur = 14; g.shadowOffsetY = 8; g.fillStyle = col; rr(g, -w / 2, -h / 2, w, h, 16); g.fill();
  g.shadowColor = 'transparent'; g.fillStyle = 'rgba(255,184,98,.25)'; rr(g, -w / 2, -h / 2, w, 8, 8); g.fill();
  g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 2); g.restore();
}
export function createLantern(canvas) { canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px'; return canvas.getContext('2d'); }
