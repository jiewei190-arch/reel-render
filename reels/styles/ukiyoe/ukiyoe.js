// ukiyoe.js: vertical (1080x1920) woodblock-print module. Original 2D-canvas implementation of the Lemo-Opuscar (MIT) "ukiyoe" grammar:
// each colour group is its own printed block (blue / colour / key line), slightly out of register, with woodgrain, baren streaks and goma-zuri specks, on washi.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const eio = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const seg = (t, a, b) => clamp((t - a) / Math.max(1e-6, b - a));
export const ih = n => { n = Math.imul(n | 0 ^ 61, 0x45d9f3b); n ^= n >>> 15; n = Math.imul(n, 0x2c1b3c6d); n ^= n >>> 12; return ((n >>> 0) % 100000) / 100000; };
export const hash = x => ih(Math.floor(x * 977) + 31);
export function vn(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(ih(i * 7 + seed * 131), ih((i + 1) * 7 + seed * 131), u) * 2 - 1; }

export const PAL = {
  paper: '#ecdfbf', paper2: '#d8c59b', mount: '#a58a62', sumi: '#1c1b22', prussian: '#1d4a86', blue2: '#5f93c4', pale: '#b9d3e6',
  beni: '#c8402d', ochre: '#d9a23c', green: '#5b8a4a', green2: '#9ab876', peach: '#f1c19b', brown: '#8a5a38', grey: '#8d939b', rose: '#e8a79a', cream: '#f3e8cb'
};
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; };

function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

export function createUkiyoe(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const g = canvas.getContext('2d', { willReadFrequently: false });
  const R = { g, W, H };
  // ---- layers (one per printed block) ----
  const mkL = (dx, dy) => { const c = mk(); return { c, g: c.getContext('2d'), dx, dy }; };
  const LB = mkL(1.9, -1.3), LC = mkL(-2.1, 1.6), LK = mkL(0, 0);
  R.b = LB.g; R.c = LC.g; R.k = LK.g; R.layers = [LB, LC, LK];

  // ---- cached textures ----
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const paperC = mk(); { const p = paperC.getContext('2d');
    p.fillStyle = PAL.paper; p.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { const x = rnd() * W, y = rnd() * H, r = 120 + rnd() * 320; const gr = p.createRadialGradient(x, y, 0, x, y, r); const dark = rnd() > .5; gr.addColorStop(0, dark ? 'rgba(150,115,60,.05)' : 'rgba(255,248,225,.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); p.fillStyle = gr; p.fillRect(x - r, y - r, r * 2, r * 2); }
    const v = p.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(120,80,30,0)'); v.addColorStop(1, 'rgba(120,80,30,.20)'); p.fillStyle = v; p.fillRect(0, 0, W, H);
  }
  const fibreC = mk(); { const p = fibreC.getContext('2d'); p.lineCap = 'round';
    for (let i = 0; i < 1500; i++) { const x = rnd() * W, y = rnd() * H, l = 14 + rnd() * 46, a = rnd() * 6.28; p.strokeStyle = rnd() > .5 ? 'rgba(255,255,255,.55)' : 'rgba(150,120,80,.45)'; p.lineWidth = .6 + rnd() * .9; p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a) * l * .5 + 6 * (rnd() - .5), y + Math.sin(a) * l * .5 + 6 * (rnd() - .5), x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke(); }
    // white box so multiply keeps the paper (multiply with white = unchanged)
    const o = mk(), q = o.getContext('2d'); q.fillStyle = '#fff'; q.fillRect(0, 0, W, H); q.globalAlpha = .5; q.drawImage(fibreC, 0, 0); fibreC.getContext('2d').clearRect(0, 0, W, H); fibreC.getContext('2d').drawImage(o, 0, 0); }
  const specksC = mk(); { const p = specksC.getContext('2d'); p.fillStyle = '#fff';
    for (let i = 0; i < 9000; i++) { const r = rnd() < .94 ? .7 + rnd() * 1.3 : 2 + rnd() * 2.5; p.globalAlpha = .35 + rnd() * .6; p.beginPath(); p.arc(rnd() * W, rnd() * H, r, 0, 6.28); p.fill(); } }
  const barenC = mk(); { const p = barenC.getContext('2d'); p.lineCap = 'round'; p.strokeStyle = '#fff';
    for (let i = 0; i < 160; i++) { const x = rnd() * W, y = rnd() * H, r = 40 + rnd() * 220, a0 = rnd() * 6.28; p.globalAlpha = .05 + rnd() * .12; p.lineWidth = 2 + rnd() * 9; p.beginPath(); p.arc(x, y, r, a0, a0 + 1 + rnd() * 1.6); p.stroke(); } }
  const grainC = mk(); { const p = grainC.getContext('2d'); p.lineCap = 'round';
    for (let i = 0; i < 230; i++) { const y0 = rnd() * H, amp = 8 + rnd() * 26, f = .003 + rnd() * .006, ph = rnd() * 9; p.strokeStyle = rnd() > .5 ? '#0e1830' : '#3a2a18'; p.globalAlpha = .08 + rnd() * .16; p.lineWidth = 1.2 + rnd() * 4.5; p.beginPath();
      for (let x = -10; x <= W + 10; x += 24) { const y = y0 + Math.sin(x * f + ph) * amp + vn(x * .004 + i, 3) * 12; x < 0 ? p.moveTo(x, y) : p.lineTo(x, y); } p.stroke(); } }

  // ---- frame control ----
  R.begin = (t) => { R.t = t; for (const L of R.layers) { const q = L.g; q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1; q.clearRect(0, 0, W, H); } };
  R.cam = (s, cx, cy) => { for (const L of R.layers) L.g.setTransform(s, 0, 0, s, W / 2 - s * cx, H / 2 - s * cy); };
  R.camReset = () => { for (const L of R.layers) L.g.setTransform(1, 0, 0, 1, 0, 0); };
  R.save = () => R.layers.forEach(L => L.g.save()); R.restore = () => R.layers.forEach(L => L.g.restore());
  R.translate = (x, y) => R.layers.forEach(L => L.g.translate(x, y));
  R.end = () => {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(paperC, 0, 0);
    for (const L of R.layers) {
      const q = L.g; q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'destination-out';
      q.globalAlpha = L === LK ? .35 : .55; q.drawImage(specksC, 0, 0);
      if (L !== LK) { q.globalAlpha = .5; q.drawImage(barenC, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = .55; q.drawImage(grainC, 0, 0); }
      q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1;
      g.globalCompositeOperation = 'multiply'; g.drawImage(L.c, L.dx, L.dy);
    }
    g.globalCompositeOperation = 'multiply'; g.drawImage(fibreC, 0, 0); g.globalCompositeOperation = 'source-over';
  };

  // ---- drawing helpers (all take a layer ctx q) ----
  const poly = (q, pts, close = true) => { q.beginPath(); pts.forEach(([x, y], i) => i ? q.lineTo(x, y) : q.moveTo(x, y)); if (close) q.closePath(); };
  R.poly = poly;
  R.fill = (q, pts, col, a = 1) => { q.save(); q.globalAlpha *= a; q.fillStyle = col; poly(q, pts); q.fill(); q.restore(); };
  R.erase = (pts) => { for (const q of [R.b, R.c]) { q.save(); q.globalCompositeOperation = 'destination-out'; q.fillStyle = '#000'; poly(q, pts); q.fill(); q.restore(); } };
  R.eraseRect = (x, y, w, h, r = 0) => { for (const q of [R.b, R.c]) { q.save(); q.globalCompositeOperation = 'destination-out'; q.fillStyle = '#000'; q.beginPath(); q.roundRect(x, y, w, h, r); q.fill(); q.restore(); } };
  // variable-width ink line, tapered at both ends, with low-frequency width jitter
  R.ink = (pts, w = 5, o = {}) => {
    const q = o.q || R.k, n = pts.length; if (n < 2) return;
    const L = [], Rr = []; let seed = o.seed || 1;
    for (let i = 0; i < n; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)]; let dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const u = i / (n - 1), tp = o.taper === false ? 1 : Math.pow(Math.sin(Math.PI * clamp(u * (o.tl || 1))), .45), j = 1 + .28 * vn(u * 5 + seed, seed), hw = Math.max(.35, w * .5 * tp * j * (o.prof ? o.prof(u) : 1));
      L.push([pts[i][0] - dy * hw, pts[i][1] + dx * hw]); Rr.push([pts[i][0] + dy * hw, pts[i][1] - dx * hw]);
    }
    q.save(); q.fillStyle = o.col || PAL.sumi; q.globalAlpha *= o.a ?? 1; poly(q, L.concat(Rr.reverse())); q.fill(); q.restore();
  };
  R.line = (pts, w = 3, col = PAL.sumi, q = R.k) => { q.save(); q.strokeStyle = col; q.lineWidth = w; q.lineCap = 'round'; q.lineJoin = 'round'; poly(q, pts, false); q.stroke(); q.restore(); };
  // bokashi: a gradient whose edge wanders (never a clean strip)
  R.bokashi = (q, x, y, w, h, col, o = {}) => {
    const { a = .9, dir = 'down', seed = 1, amp = 22, a0 = 0 } = o; // dir: colour is strongest at 'down' = bottom, 'up' = top
    const top = []; const N = 40; for (let i = 0; i <= N; i++) top.push([x + w * i / N, y + amp * vn(i * .35 + seed, seed)]);
    const gr = q.createLinearGradient(0, y, 0, y + h); const c0 = rgba(col, dir === 'down' ? a0 : a), c1 = rgba(col, dir === 'down' ? a : a0);
    gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    q.save(); q.fillStyle = gr; q.beginPath(); top.forEach(([px, py], i) => i ? q.lineTo(px, py) : q.moveTo(px, py)); q.lineTo(x + w, y + h); q.lineTo(x, y + h); q.closePath(); q.fill(); q.restore();
  };
  // mist: long rounded flat bands that erase the ink beneath (paper shows)
  R.mist = (x, y, w, h, seed = 1, a = 1) => { for (const q of [R.b, R.c]) { q.save(); q.globalCompositeOperation = 'destination-out'; const gr = q.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.2, `rgba(0,0,0,${a})`); gr.addColorStop(.8, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.beginPath(); q.roundRect(x, y, w, h, h / 2); q.fill(); q.restore(); } };
  // diagonal "baren sweep" clip for printing a block in; p 0..1
  R.sweep = (q, p, seed = 1, ang = -.5) => { if (p >= 1) return false; const c = Math.cos(ang), s = Math.sin(ang), span = W + H, off = -span * .3 + p * span * 1.6; q.beginPath();
    const pts = []; for (let i = 0; i <= 24; i++) { const v = -H + i * (H * 2 / 24), jn = 40 * vn(i * .5 + seed, seed); pts.push([off + jn + v * s * 0, v]); }
    q.moveTo(-400, -H); for (const [px, py] of pts) q.lineTo(px + py * .35 - 400 * 0 , py); q.lineTo(-400, H * 2); q.closePath(); q.clip(); return true; };
  // text (keyline layer by default); reveal 0..1 left to right
  R.text = (s, x, y, o = {}) => {
    const q = o.q || R.k; q.save(); q.font = o.font || `500 ${o.size || 44}px "Shippori Mincho"`; q.textAlign = o.align || 'left'; q.textBaseline = 'alphabetic'; q.fillStyle = o.col || PAL.sumi; q.globalAlpha *= o.a ?? 1;
    if (o.reveal !== undefined && o.reveal < 1) { const w = q.measureText(s).width, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x; q.beginPath(); q.rect(x0 - 8, y - (o.size || 44) * 1.3, (w + 16) * o.reveal, (o.size || 44) * 1.9); q.clip(); }
    if (o.vertical) { let yy = y; for (const ch of s) { q.fillText(ch, x, yy); yy += (o.size || 44) * 1.12; } } else q.fillText(s, x, y);
    q.restore();
  };
  R.measure = (s, font) => { const q = R.k; q.save(); q.font = font; const w = q.measureText(s).width; q.restore(); return w; };
  // red seal with cut-out characters
  R.seal = (cx, cy, size, chars = '津波', k = 1, rot = 0) => {
    if (k <= 0) return; const q = R.c, qk = R.k; q.save(); q.translate(cx, cy); q.rotate(rot); q.scale(k, k);
    q.fillStyle = PAL.beni; q.beginPath(); q.roundRect(-size / 2, -size / 2, size, size, size * .08); q.fill();
    q.globalCompositeOperation = 'destination-out'; q.fillStyle = '#000'; q.font = `800 ${size * .42}px "Shippori Mincho"`; q.textAlign = 'center'; q.textBaseline = 'middle';
    const cs = [...chars]; if (cs.length === 1) q.fillText(cs[0], 0, size * .03); else if (cs.length === 2) { q.fillText(cs[0], 0, -size * .22); q.fillText(cs[1], 0, size * .22); } else { q.fillText(cs[0], size * .2, -size * .22); q.fillText(cs[1], size * .2, size * .22); q.fillText(cs[2], -size * .2, -size * .22); q.fillText(cs[3] || '', -size * .2, size * .22); }
    q.restore();
  };
  // double ink border of a sheet (thick + thin) inset by m px
  R.border = (m = 36) => { const q = R.k; q.save(); q.strokeStyle = PAL.sumi; q.lineWidth = 9; q.strokeRect(m, m, W - 2 * m, H - 2 * m); q.lineWidth = 3; q.strokeRect(m + 14, m + 14, W - 2 * m - 28, H - 2 * m - 28); q.restore(); };
  // cream cartouche slip with thick+thin border (clears the ink beneath)
  R.slip = (x, y, w, h, o = {}) => { R.eraseRect(x, y, w, h, o.r ?? 10); const q = R.k; q.save(); q.strokeStyle = PAL.sumi; q.lineWidth = 6; q.beginPath(); q.roundRect(x, y, w, h, o.r ?? 10); q.stroke(); q.lineWidth = 2.2; q.beginPath(); q.roundRect(x + 9, y + 9, w - 18, h - 18, Math.max(2, (o.r ?? 10) - 4)); q.stroke(); q.restore(); };
  // subtitle cartouche: bold segments (**x**) in beni, wrapped to 2 lines
  R.subtitle = (cap, reveal = 1, alpha = 1) => {
    if (alpha <= 0) return; const font = '500 43px "Shippori Mincho"', fontB = '800 43px "Shippori Mincho"'; const toks = []; cap.split('**').forEach((s, i) => s.split(/(\s+)/).forEach(w => w && toks.push({ w, b: i % 2 === 1 })));
    const mw = (t) => R.measure(t.w, t.b ? fontB : font); const maxW = 800, lines = [[]]; let cur = 0;
    for (const t of toks) { const w = mw(t); if (cur + w > maxW && lines[lines.length - 1].length && t.w.trim()) { lines.push([]); cur = 0; } if (!(cur === 0 && !t.w.trim())) { lines[lines.length - 1].push(t); cur += w; } }
    const lw = lines.map(l => l.reduce((a, t) => a + mw(t), 0)); const boxW = Math.max(...lw) + 190, boxH = 64 + lines.length * 58, x = (W - boxW) / 2 + 20, y = 1736 - boxH / 2;
    const q = R.k; R.save(); R.layers.forEach(L => { L.g.globalAlpha = alpha; });
    R.slip(x, y, boxW, boxH);
    R.seal(x + 66, y + boxH / 2, 62, '波', 1);
    lines.forEach((l, li) => { let xx = x + 120 + (boxW - 150 - lw[li]) / 2; const yy = y + 52 + li * 58 + 16; for (const t of l) { const w = mw(t); R.text(t.w, xx, yy, { font: t.b ? fontB : font, col: t.b ? PAL.beni : PAL.sumi, reveal: seg(reveal, 0, 1) >= 1 ? undefined : clamp((reveal * (cur + 1) - (xx - x - 120)) / Math.max(1, w)) }); xx += w; } });
    R.restore();
  };
  return R;
}
