// lib2d.js: reusable 2D drawing primitives + timing helpers shared by every 2D style (neon, handdrawn, cartoon, ...).
// Claude should CALL these instead of rewriting them in each t_<name>.js. All take the canvas context S first.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));          // 0..1 progress of t between a and b
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }; // smoothstep
export const eo = u => { u = clamp(u); return 1 - Math.pow(1 - u, 3); }; // ease-out
export const bounce = u => { u = clamp(u); return 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export function prims(S, font = 'Poppins') {
  const text = (s, x, y, size = 48, col = '#fff', al = 'center', a = 1, ls = 0, weight = 700) => { if (a <= 0) return; S.save(); S.font = `${weight} ${size}px ${font}`; S.textAlign = al; S.fillStyle = col; S.globalAlpha *= a; if (ls) S.letterSpacing = ls + 'px'; S.fillText(s, x, y); S.restore(); };
  const shape = (fn, stroke, w = 6, a = 1, fill = null) => { S.save(); S.globalAlpha *= a; S.beginPath(); fn(); if (fill) { S.fillStyle = fill; S.fill(); } if (stroke) { S.strokeStyle = stroke; S.lineWidth = w; S.lineCap = 'round'; S.lineJoin = 'round'; S.stroke(); } S.restore(); };
  const line = (x1, y1, x2, y2, col, w = 6, a = 1, dash = null, p = 1) => { S.save(); S.globalAlpha *= a; if (dash) S.setLineDash(dash); S.strokeStyle = col; S.lineWidth = w; S.lineCap = 'round'; S.beginPath(); S.moveTo(x1, y1); S.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); S.stroke(); S.restore(); };
  const circ = (x, y, r, stroke, w = 6, a = 1, fill = null) => shape(() => S.arc(x, y, Math.max(.1, r), 0, 7), stroke, w, a, fill);
  const rrect = (x, y, w, h, r, stroke, lw = 5, a = 1, fill = null) => shape(() => S.roundRect(x, y, w, h, r), stroke, lw, a, fill);
  // arrow from (x1,y1) to (x2,y2); p = draw-on progress 0..1
  const arrow = (x1, y1, x2, y2, col, w = 8, p = 1, a = 1, head = 28) => { if (p <= 0) return; const x = lerp(x1, x2, p), y = lerp(y1, y2, p), ang = Math.atan2(y2 - y1, x2 - x1); line(x1, y1, x, y, col, w, a); if (p > .85) shape(() => { S.moveTo(x, y); S.lineTo(x - head * Math.cos(ang - .45), y - head * Math.sin(ang - .45)); S.lineTo(x - head * Math.cos(ang + .45), y - head * Math.sin(ang + .45)); S.closePath(); }, null, 0, a, col); };
  // labelled box node (for flowcharts): returns its centre so arrows can attach
  const node = (cx, cy, w, h, label, col, a = 1, size = 40) => { rrect(cx - w / 2, cy - h / 2, w, h, 22, col, 6, a, 'rgba(0,0,0,.35)'); text(label, cx, cy + size * .35, size, col, 'center', a); return [cx, cy]; };
  // horizontal bar: v in 0..1, shown with progress p
  const bar = (x, y, w, h, v, p, col, a = 1, label = '') => { rrect(x, y, w, h, h / 2, col, 4, a * .5); shape(() => S.roundRect(x, y, Math.max(h, w * v * p), h, h / 2), null, 0, a, col); if (label) text(label, x, y - 14, 34, col, 'left', a); };
  // number that counts up: counter(x,y, from,to, progress, 'unit')
  const counter = (x, y, from, to, p, unit = '', size = 120, col = '#fff', a = 1) => text(Math.round(lerp(from, to, eo(p))).toLocaleString('en-US') + unit, x, y, size, col, 'center', a);
  // timeline dots with labels along a horizontal line
  const timeline = (x1, x2, y, labels, p, col, a = 1) => { line(x1, y, x2, y, col, 6, a, null, p); labels.forEach((l, i) => { const k = (i + .5) / labels.length, x = lerp(x1, x2, k), on = seg(p, k - .1, k); circ(x, y, 14 * ss(on), col, 5, a, col); text(l, x, y + (i % 2 ? 70 : -40), 32, col, 'center', a * ss(on)); }); };
  // expanding rings (pulse/sound/wifi/heat)
  const rings = (x, y, t, col, n = 4, maxR = 400, speed = .5, w = 5, a = 1) => { for (let k = 0; k < n; k++) { const q = (t * speed + k / n) % 1; circ(x, y, 40 + q * maxR, col, w, (1 - q) * a); } };
  return { text, shape, line, circ, rrect, arrow, node, bar, counter, timeline, rings };
}

// phrase helpers: build once from window.TL.p
export function phases(TL) {
  const PH = TL.p;
  const at = t => { let i = 0; for (let k = 0; k < PH.length; k++) if (t >= PH[k].start - .02) i = k; return i; };
  const info = t => { const i = at(t), p = PH[i]; return { i, p, lt: t - p.start, u: seg(t, p.start, p.end),
    fi: ss(seg(t - p.start, 0, .14)), fo: i < PH.length - 1 ? 1 - ss(seg(t, PH[i + 1].start - .09, PH[i + 1].start)) : 1 }; };
  return { PH, at, info };
}
