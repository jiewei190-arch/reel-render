// kits/toon3d/insert.js — full-screen INSERT cards (ported from the BEANMEN look): big bold stat cards over a blurred, darkened scene.
//
// 1) As a whole shot (the usual way): the 3D scene keeps playing behind, blurred + dimmed, with the card on top.
//   import { insertShot } from '/kits/toon3d/insert.js';
//   insertShot('s07', { scene: { init, draw },                      // any kind:'3d' shot definition (or omit for a plain dark backdrop)
//     insert: { type: 'bigtext', title: '50 KM/H', lines: ['flat out'], kicker: 'EMU TOP SPEED' } });
// 2) Inside any shot overlay:  drawInsert(g, insert, t - t0)   (and dimScene(g, 9, 0.55) first if you want the blur/darken)
//
// Types (fields): bigtext  { title, lines[], kicker }        e.g. "10 BULLETS" / "= 1 EMU"
//                 counter  { value, from, prefix, suffix, title, lines[0], decimals }   counts up over ~1.5 s
//                 versus   { lines: [left, right], title, color (right side), colorL }
//                 list     { title, lines[], highlight }     ticks appear one by one (highlight = index ticked red)
//                 timeline { title, lines[], highlight }
//                 map      { title, lines[] (stops) }        dashed route drawn stop to stop on a parchment map
//                 chart    { title, data[], lines[] (labels), highlight }
//                 document { title, lines[], highlight }     phone { title, lines[] }  (chat bubbles)
// Common: color (accent, default gold #f2c230), dim (0..1 veil, default per type), blur (px, default 9), at (s: start delay)
// Recommended sfx: bigtext/counter -> toon3d:impact + toon3d:whoosh, counter -> toon3d:tick, versus -> toon3d:swoosh, list -> toon3d:pop per line, map -> toon3d:paper.
import { E, clamp, ease, alpha, FONTS, registerShot } from '/engine/core.js';

export const INK = '#2a1c15';
const F = FONTS.ui;   // Nunito 900
const out = (x) => ease.out(x), back = (x) => ease.outBack(x);
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// T: bold text, shrunk to fit maxW, optional ink stroke (paint order: stroke under fill)
export function T(g, str, x, y, size, o = {}) {
  str = String(str ?? ''); if (!str) return; const { color = INK, stroke = null, align = 'center', weight = 900, maxW = 0, a = 1 } = o;
  g.save(); g.globalAlpha *= a; g.font = `${weight} ${size}px "${F}"`; let fs = size;
  if (maxW) { const w = g.measureText(str).width; if (w > maxW) { fs = size * maxW / w; g.font = `${weight} ${fs}px "${F}"`; } }
  g.textAlign = align; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = `${-fs * 0.01}px`;
  if (stroke) { g.lineJoin = 'round'; g.lineWidth = fs * 0.16; g.strokeStyle = stroke; g.strokeText(str, x, y); }
  g.fillStyle = color; g.fillText(str, x, y); g.restore();
}
const rr = (g, x, y, w, h, r, fill, lw = 8, stroke = INK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.lineJoin = 'round'; g.stroke(); } };

// dimScene(g, blurPx, dim) — blur + darken whatever is already drawn in this shot's buffer (call at the start of an overlay)
let _c = null;
export function dimScene(g, blur = 9, dim = 0.55, tint = '#0a0c18') {
  const cv = g.canvas; if (!_c) _c = document.createElement('canvas'); if (_c.width !== cv.width || _c.height !== cv.height) { _c.width = cv.width; _c.height = cv.height; }
  const x = _c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; x.drawImage(cv, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0) { g.filter = `blur(${(blur * E.PX).toFixed(2)}px) brightness(0.8) saturate(1.1)`; g.drawImage(_c, 0, 0); g.filter = 'none'; }
  if (dim > 0) { g.fillStyle = alpha(tint, dim); g.fillRect(0, 0, cv.width, cv.height); } g.restore();
}
// a plain backdrop for insert-only shots ("bg": "void" in BEANMEN): warm dark gradient
export function voidBg(g, top = '#3a2a22', bottom = '#140e10') { const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }

// drawInsert(g, ins, age) — the card itself, `age` = seconds since it appeared. Logical units, centred for 9:16 (scaled down for 16:9).
export function drawInsert(g, ins, age) {
  const W = E.W, H = E.H, u = E.vertical ? 1 : 0.62; const t = Math.max(0, age - (ins.at || 0));
  const p = back(clamp(t / 0.4)), accent = ins.color || '#f2c230', lines = ins.lines || [];
  const reveal = (i, step = 0.3, start = 0.27) => clamp((t - start - i * step) / 0.27);
  const card = (fn) => { g.save(); g.translate(W / 2, H * 0.44); g.scale(u * p, u * p); g.rotate((1 - clamp(t / 0.4)) * -4 * Math.PI / 180); fn(); g.restore(); };
  switch (ins.type) {
    case 'bigtext': {   // kicker (small, white) / TITLE (huge, accent) / lines (white)
      g.save(); g.translate(W / 2, H * 0.42); g.scale(u, u); let y = 0;
      if (ins.kicker) { const r = back(clamp(t / 0.3)); g.save(); g.translate(0, -150); g.scale(r, r); T(g, ins.kicker, 0, 0, 58, { color: '#ffffff', stroke: INK, maxW: 960 }); g.restore(); }
      [ins.title, ...lines].filter(Boolean).forEach((l, i) => { const r = back(clamp((t - 0.08 - i * 0.27) / 0.33)); g.save(); g.translate(0, y); g.scale(r, r); T(g, l, 0, 0, i === 0 ? (ins.size || 170) : 70, { color: i === 0 ? accent : '#ffffff', stroke: INK, maxW: 980 }); g.restore(); y += i === 0 ? 150 : 95; });
      g.restore(); return; }
    case 'counter': {
      const from = ins.from ?? 0, to = ins.value ?? 100; const v = from + (to - from) * out(clamp((t - 0.13) / 1.2));
      const big = `${ins.prefix ?? ''}${fmt(v, ins.decimals || 0)}${ins.suffix ?? ''}`;
      g.save(); g.translate(W / 2, H * 0.42); g.scale(u * p, u * p);
      T(g, ins.title, 0, -170, 60, { color: '#ffffff', stroke: INK, maxW: 900 }); T(g, big, 0, 0, 210, { color: accent, stroke: INK, maxW: 980 }); if (lines[0]) T(g, lines[0], 0, 170, 54, { color: '#ffffff', stroke: INK, maxW: 900 });
      g.restore(); return; }
    case 'versus': {
      const sl = out(clamp(t / 0.4)), c2 = ins.color || '#2a6fd6', c1 = ins.colorL || '#d8342c'; g.save();
      g.globalAlpha = 0.92; g.fillStyle = c1; g.beginPath(); g.moveTo(-W * (1 - sl), 0); g.lineTo(W * 0.62 - W * (1 - sl), 0); g.lineTo(W * 0.38 - W * (1 - sl), H); g.lineTo(-W * (1 - sl), H); g.fill();
      g.fillStyle = c2; g.beginPath(); g.moveTo(W * 0.62 + W * (1 - sl), 0); g.lineTo(W * 2, 0); g.lineTo(W * 2, H); g.lineTo(W * 0.38 + W * (1 - sl), H); g.fill(); g.globalAlpha = 1;
      const vs = (s) => (s.length > 9 ? 66 : s.length > 7 ? 76 : 90) * u;
      T(g, lines[0], W * 0.27, H * 0.36, vs(lines[0] || ''), { color: '#fff', stroke: INK, maxW: W * 0.46, a: sl }); T(g, lines[1], W * 0.73, H * 0.56, vs(lines[1] || ''), { color: '#fff', stroke: INK, maxW: W * 0.46, a: sl });
      const b = back(clamp((t - 0.27) / 0.33)); g.translate(W / 2, H * 0.46); g.scale(b * u, b * u); g.beginPath(); g.arc(0, 0, 110, 0, Math.PI * 2); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke(); T(g, 'VS', 0, 4, 110);
      g.restore(); if (ins.title) T(g, ins.title, W / 2, H * 0.16, 70 * u, { color: '#fff', stroke: INK, maxW: W * 0.9 }); return; }
    case 'list': return card(() => {
      rr(g, -440, -520, 880, 1040, 24, '#fbfaf4'); T(g, ins.title, 0, -440, 60, { maxW: 780 });
      lines.forEach((l, i) => { const y = -310 + i * 130, r = reveal(i, 0.33), chk = clamp((t - 0.47 - i * 0.33) / 0.2); if (r <= 0) return; g.save(); g.globalAlpha = r;
        rr(g, -370, y - 36, 72, 72, 12, '#fff', 6); if (chk > 0) { g.save(); g.lineWidth = 12; g.lineCap = g.lineJoin = 'round'; g.strokeStyle = ins.highlight === i ? '#d8342c' : '#2fa84f'; g.setLineDash([80 * chk, 200]); g.beginPath(); g.moveTo(-356, y); g.lineTo(-338, y + 20); g.lineTo(-306, y - 22); g.stroke(); g.restore(); }
        T(g, l, -270, y, 50, { align: 'left', weight: 800, maxW: 680 }); g.restore(); }); });
    case 'timeline': return card(() => {
      rr(g, -440, -520, 880, 1040, 24, '#ffffff'); T(g, ins.title, 0, -440, 58, { maxW: 780 });
      g.save(); g.lineWidth = 10; g.lineCap = 'round'; g.strokeStyle = INK; g.beginPath(); g.moveTo(-300, -340); g.lineTo(-300, -340 + 760 * out(clamp(t / 1))); g.stroke(); g.restore();
      lines.forEach((l, i) => { const y = -320 + (i * 760) / Math.max(1, lines.length), r = reveal(i, 0.33); if (r <= 0) return; g.save(); g.globalAlpha = r;
        g.beginPath(); g.arc(-300, y, 28 * back(r), 0, Math.PI * 2); g.fillStyle = ins.highlight === i ? accent : '#9fb6d6'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
        T(g, l, -240, y, 46, { align: 'left', weight: 800, maxW: 620 }); g.restore(); }); });
    case 'map': return card(() => {
      const draw = out(clamp((t - 0.2) / 1)); g.save(); g.beginPath(); [[-440, -440], [-150, -470], [150, -440], [440, -470], [440, 440], [150, 470], [-150, 440], [-440, 470]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = '#f4e3b8'; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.clip();
      g.strokeStyle = '#d9c08a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-150, -470); g.lineTo(-150, 440); g.moveTo(150, -440); g.lineTo(150, 470); g.stroke();
      g.strokeStyle = 'rgba(127,192,232,.7)'; g.lineWidth = 40; g.lineCap = 'round'; g.beginPath(); g.moveTo(-440, 120); g.quadraticCurveTo(-200, 60, -60, 200); g.quadraticCurveTo(100, 330, 440, 260); g.stroke(); g.restore();
      T(g, ins.title, 0, -380, 56, { maxW: 760 });
      const pts = lines.map((_, i) => [-280 + (i / Math.max(1, lines.length - 1)) * 560, (i % 2 ? -1 : 1) * 160 - 60 + i * 20]);
      if (pts.length > 1) { const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])); const tot = segs.reduce((a, b) => a + b, 0);
        g.save(); g.strokeStyle = ins.color || '#d8342c'; g.lineWidth = 12; g.lineCap = 'round'; g.setLineDash([30, 20]); g.beginPath(); g.moveTo(...pts[0]); let left = draw * tot;
        for (let i = 1; i < pts.length && left > 0; i++) { const k = Math.min(1, left / segs[i - 1]); g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k); left -= segs[i - 1]; }
        g.stroke(); g.restore(); }
      pts.forEach((q, i) => { const a = clamp(draw * pts.length - i + 0.5); if (a <= 0) return; g.save(); g.globalAlpha = a; g.beginPath(); g.arc(q[0], q[1], 22, 0, Math.PI * 2); g.fillStyle = '#d8342c'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
        T(g, lines[i], q[0], q[1] + 60, 36, { stroke: '#f4e3b8', maxW: 300 }); g.restore(); }); });
    case 'chart': return card(() => {
      const data = ins.data?.length ? ins.data : [3, 5, 4, 8, 10], max = Math.max(...data, 1), bw = 640 / data.length;
      rr(g, -420, -480, 840, 960, 24, '#ffffff'); T(g, ins.title, 0, -400, 58, { maxW: 740 });
      g.save(); g.lineWidth = 8; g.lineCap = 'round'; g.strokeStyle = INK; g.beginPath(); g.moveTo(-340, 330); g.lineTo(340, 330); g.stroke(); g.restore();
      data.forEach((v, i) => { const k = out(clamp((t - 0.27 - i * 0.17) / 0.47)), h = (v / max) * 560 * k, x = -320 + i * bw;
        if (h > 1) rr(g, x + bw * 0.15, 330 - h, bw * 0.7, h, 8, ins.highlight === i ? accent : '#9fb6d6', 5);
        if (k > 0.9) T(g, fmt(v), x + bw / 2, 330 - h - 40, 38, { maxW: bw }); T(g, lines[i], x + bw / 2, 385, 32, { weight: 700, maxW: bw }); }); });
    case 'document': return card(() => {
      rr(g, -380, -520, 760, 1040, 18, '#fbfaf4'); rr(g, -380, -520, 760, 150, 18, accent); T(g, ins.title, 0, -445, 64, { maxW: 680 });
      if (!lines.length) for (let i = 0; i < 6; i++) rr(g, -320, -300 + i * 100, i === 5 ? 300 : 640, 26, 13, '#d6d2c4', 0);
      lines.forEach((l, i) => { const r = reveal(i), y = -300 + i * 110; if (r <= 0) return; g.save(); g.globalAlpha = r;
        if (ins.highlight === i) { g.fillStyle = 'rgba(255,226,74,.85)'; g.fillRect(-330, y - 40, 660 * out(clamp((t - 1) / 0.47)), 80); }
        T(g, l, -320, y, 50, { align: 'left', weight: 800, maxW: 640 }); g.restore(); }); });
    case 'phone': return card(() => {
      rr(g, -300, -600, 600, 1200, 70, '#1d1f26'); rr(g, -270, -570, 540, 1140, 50, '#f2f4f8', 0); rr(g, -80, -560, 160, 36, 18, '#1d1f26', 0); g.fillStyle = '#fff'; g.fillRect(-270, -510, 540, 110);
      g.beginPath(); g.arc(-200, -455, 34, 0, Math.PI * 2); g.fillStyle = accent; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); T(g, ins.title ?? 'Messages', -150, -455, 40, { align: 'left', maxW: 380 });
      lines.forEach((l, i) => { const r = reveal(i, 0.47), mine = i % 2 === 1, y = -330 + i * 150, w = Math.min(440, 60 + l.length * 19); if (r <= 0) return; g.save(); g.globalAlpha = r; g.translate(0, (1 - r) * 30);
        rr(g, mine ? 240 - w : -240, y - 52, w, 104, 40, mine ? '#2f8af5' : '#ffffff', mine ? 0 : 3, '#d6d8de'); T(g, l, mine ? 240 - w / 2 : -240 + w / 2, y, 36, { color: mine ? '#fff' : INK, weight: 700, maxW: w - 40 }); g.restore(); }); });
  }
}
const DIM = { versus: 0.15, bigtext: 0.5, counter: 0.6 };
// insertShot(id, { scene, insert, blur, dim, bg }) — registers a shot that plays `scene` (a kind:'3d' def) blurred + dimmed under the card.
export function insertShot(id, o) {
  const ins = o.insert, blur = o.blur ?? ins.blur ?? 9, dim = o.dim ?? ins.dim ?? DIM[ins.type] ?? 0.55;
  if (o.scene) registerShot(id, { kind: '3d', init: o.scene.init, draw: o.scene.draw,
    overlay(g, t, info, s) { o.scene.overlay?.(g, t, info, s); dimScene(g, blur, dim); drawInsert(g, ins, t); o.after?.(g, t, info, s); } });
  else registerShot(id, { draw(g, t, info) { voidBg(g, ...(o.bg || [])); drawInsert(g, ins, t); o.after?.(g, t, info); } });
}
