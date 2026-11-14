// molasses-flood: 2D overlay pieces (logical units, 1080x1920): frame-1 hook text, speech bubble, rubber stamp, speedometer,
// red X, record-scratch freeze, soft vignette. Underscore = not auto-loaded.
import { E, ease, clamp, lerp } from '/engine/core.js';
import { T, INK } from '/kits/toon3d/insert.js';

const back = (x) => ease.outBack(clamp(x));

// frame-1 hook: two big lines, readable in under a second (already on screen at t = 0)
export function hookText(g, t, lines = ['A MOLASSES TSUNAMI', 'KILLED 21 PEOPLE'], o = {}) {
  const y0 = o.y ?? E.H * 0.155, a = o.a ?? 1; if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  // soft dark band so the text reads over the bright sky
  const gr = g.createLinearGradient(0, y0 - 170, 0, y0 + 260); gr.addColorStop(0, 'rgba(20,12,8,0)'); gr.addColorStop(0.3, 'rgba(20,12,8,.38)'); gr.addColorStop(0.75, 'rgba(20,12,8,.38)'); gr.addColorStop(1, 'rgba(20,12,8,0)');
  g.fillStyle = gr; g.fillRect(0, y0 - 170, E.W, 430);
  const wob = 1 + Math.sin(t * 5) * 0.012;
  g.translate(E.W / 2, y0); g.scale(wob, wob);
  T(g, lines[0], 0, 0, 104, { color: '#ffd25a', stroke: INK, maxW: 990 });
  T(g, lines[1], 0, 130, 118, { color: '#ffffff', stroke: INK, maxW: 990 });
  g.restore();
}

// speech bubble pointing at (x, y) (e.g. the top of a head from react.js anchor()); pops in at age 0
export function bubble(g, x, y, text, age, o = {}) {
  if (age < 0) return; const s = back(age / 0.3) * (o.scale ?? 1); const a = o.a ?? 1; if (a <= 0 || s <= 0.01) return;
  const size = o.size ?? 54; g.save(); g.globalAlpha = a; g.font = `900 ${size}px "Nunito"`; const tw = Math.min(g.measureText(text).width, 820);
  const w = tw + 70, h = size + 56, bx = clamp(x + (o.dx ?? 0), w / 2 + 30, E.W - w / 2 - 30), by = y - (o.up ?? 150);
  g.translate(bx, by); g.scale(s, s); g.translate(-bx, -by);
  g.beginPath(); g.roundRect(bx - w / 2, by - h / 2, w, h, h / 2); g.moveTo(x - 22, by + h / 2 - 4); g.lineTo(x + (o.tail ?? 0), y - 18); g.lineTo(x + 26, by + h / 2 - 4);
  g.fillStyle = o.fill || '#ffffff'; g.fill(); g.lineWidth = 7; g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.roundRect(bx - w / 2 + 4, by - h / 2 + 4, w - 8, h - 8, h / 2); g.fillStyle = o.fill || '#ffffff'; g.fill();
  T(g, text, bx, by + 2, size, { color: o.color || INK, maxW: 820, weight: o.weight ?? 900 });
  g.restore();
}

// rubber stamp slamming onto the screen: big -> 1 with a bounce, slight rotation, red ink with a rough double border
export function stamp(g, text, age, o = {}) {
  if (age < 0) return; const { x = E.W / 2, y = E.H * 0.42, rot = -0.14, color = '#d8342c', size = 130, sub = null } = o;
  const k = clamp(age / 0.22); const s = k < 1 ? lerp(2.6, 1, ease.in(k)) : 1 + Math.sin(clamp((age - 0.22) / 0.25) * Math.PI) * 0.06;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = clamp(age / 0.1);
  g.font = `900 ${size}px "Nunito"`; const tw = Math.min(g.measureText(text).width, 900); const w = tw + 90, h = size + (sub ? 120 : 70);
  g.fillStyle = 'rgba(255,248,236,.92)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 26); g.fill();
  g.lineWidth = 14; g.strokeStyle = color; g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 16); g.stroke();
  T(g, text, 0, sub ? -26 : 4, size, { color, maxW: 900 }); if (sub) T(g, sub, 0, size * 0.55, size * 0.36, { color, maxW: 820 });
  g.restore();
}

// speedometer dial (0..max mph) with the needle easing up to `value`
export function gauge(g, age, value = 35, o = {}) {
  const { max = 40, x = E.W / 2, y = E.H * 0.44, r = 330, label = 'MPH', title = 'WAVE SPEED', sub = null } = o;
  const p = back(age / 0.35); const v = value * ease.out(clamp((age - 0.25) / 1.3)) + (age > 1.55 ? Math.sin(age * 30) * 0.25 : 0);
  g.save(); g.translate(x, y); g.scale(p, p);
  T(g, title, 0, -r - 90, 66, { color: '#ffffff', stroke: INK, maxW: 900 });
  g.beginPath(); g.arc(0, 0, r, Math.PI, 0); g.lineTo(r, 60); g.lineTo(-r, 60); g.closePath(); g.fillStyle = '#fbf6ea'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  const A = (val) => Math.PI + (val / max) * Math.PI;
  g.lineWidth = 40; g.strokeStyle = '#f2c230'; g.beginPath(); g.arc(0, 0, r - 46, A(0), A(Math.min(v, max * 0.6))); g.stroke();
  if (v > max * 0.6) { g.strokeStyle = '#d8342c'; g.beginPath(); g.arc(0, 0, r - 46, A(max * 0.6), A(Math.min(v, max))); g.stroke(); }
  for (let i = 0; i <= max; i += 5) { const a = A(i); g.lineWidth = i % 10 ? 5 : 9; g.strokeStyle = INK; g.beginPath(); g.moveTo(Math.cos(a) * (r - 10), Math.sin(a) * (r - 10)); g.lineTo(Math.cos(a) * (r - (i % 10 ? 34 : 56)), Math.sin(a) * (r - (i % 10 ? 34 : 56))); g.stroke();
    if (i % 10 === 0) T(g, String(i), Math.cos(a) * (r - 100), Math.sin(a) * (r - 100), 40, { color: INK }); }
  const a = A(v); g.lineWidth = 16; g.lineCap = 'round'; g.strokeStyle = '#d8342c'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * (r - 70), Math.sin(a) * (r - 70)); g.stroke();
  g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
  T(g, `${Math.round(v)} ${label}`, 0, 170, 150, { color: '#ffd25a', stroke: INK, maxW: 900 });
  if (sub) T(g, sub, 0, 290, 58, { color: '#ffffff', stroke: INK, maxW: 900 });
  g.restore();
}

// big red X drawn in two strokes (age 0 = first stroke starts)
export function redX(g, x, y, size, age) {
  if (age < 0) return; const k1 = clamp(age / 0.14), k2 = clamp((age - 0.12) / 0.14); g.save(); g.lineCap = 'round';
  const seg = (x0, y0, x1, y1, k) => { if (k <= 0) return; for (const [w, c] of [[64, '#2a1c15'], [44, '#e0322a']]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); g.stroke(); } };
  seg(x - size, y - size * 0.8, x + size, y + size * 0.8, k1); seg(x + size, y - size * 0.8, x - size, y + size * 0.8, k2); g.restore();
}

// freeze-frame look: desaturate + warm sepia + a white flash at the moment of the scratch (k = 0..1 strength)
let _c = null;
export function freezeLook(g, k, flash = 0) {
  if (k <= 0 && flash <= 0) return; const cv = g.canvas; if (!_c) _c = document.createElement('canvas'); if (_c.width !== cv.width || _c.height !== cv.height) { _c.width = cv.width; _c.height = cv.height; }
  const x = _c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; x.drawImage(cv, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.filter = 'grayscale(0.85) sepia(0.35) contrast(1.12)'; g.drawImage(_c, 0, 0); g.filter = 'none'; g.restore();
  if (flash > 0) { g.save(); g.fillStyle = `rgba(255,255,255,${flash})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
}
// record-scratch squiggle (the sound is the sfx; this is the little visual)
export function scratchMark(g, age, x = E.W * 0.5, y = E.H * 0.2) { if (age < 0 || age > 0.6) return; const a = 1 - clamp((age - 0.35) / 0.25); g.save(); g.globalAlpha = a; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#2a1c15';
  g.beginPath(); for (let i = 0; i <= 14; i++) { const px = x - 220 + i * 32, py = y + (i % 2 ? -26 : 26) * (1 - age); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke(); g.restore(); }
export function vignette(g, a = 0.45, color = '20,12,10') { const gr = g.createRadialGradient(E.W / 2, E.H * 0.45, E.H * 0.25, E.W / 2, E.H * 0.45, E.H * 0.75); gr.addColorStop(0, `rgba(${color},0)`); gr.addColorStop(1, `rgba(${color},${a})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }
