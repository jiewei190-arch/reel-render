// fieldbook.js: vertical 1080x1920 "field sketchbook" renderer (Canvas2D, deterministic, pure function of t).
// Grammar copied from the owner's template #18 handdrawn "Japan heat wave" (demo101): warm notebook paper with vignette,
// printer's crop marks + centre targets, typewriter chapter label "NO. 0x — TOPIC" with a hairline rule, italic handwritten
// headline written on left to right, thin graphite drawings that draw on, red/navy pencil hatching as fill, red square/round
// seals, double-ruled measurement boxes, typewriter body text, mono footer "... p.0x" + four hatched swatch chips,
// page changes = ink fades off the sheet, a beat of blank paper, then the next page types in.
// Original code. Fonts: Kalam (headline/notes), Courier Prime (labels), Nunito (body); all SIL OFL.
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const C = { paper: '#f2ebdc', ink: '#2f3038', graph: '#55565e', red: '#c9452f', redL: '#d9705c', navy: '#3b4a7e', ochre: '#c8a65a', dark: '#26251f' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const bo = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

export function createFB(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const S = { A: 1 };
  // ---------- cached paper ----------
  const paper = document.createElement('canvas'); paper.width = W; paper.height = H; const p = paper.getContext('2d');
  p.fillStyle = C.paper; p.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const x = hash(i * 1.3) * W, y = hash(i * 2.1) * H, r = 200 + hash(i * 3.7) * 420; const rg = p.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, hash(i * 5.3) > .5 ? 'rgba(255,252,242,.18)' : 'rgba(190,170,130,.04)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); p.fillStyle = rg; p.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 160; i++) { const x = hash(i * 7.7) * W; p.fillStyle = `rgba(${hash(i) > .5 ? '255,255,250' : '150,130,100'},${.012 + hash(i * 4.4) * .02})`; p.fillRect(x, 0, 1 + hash(i * 1.9) * 3, H); }   // faint laid lines
  for (let i = 0; i < 2600; i++) { const x = hash(i * 1.7) * W, y = hash(i * 2.9) * H, a = hash(i * 4.1) * TAU, l = 3 + hash(i * 6.1) * 10; p.strokeStyle = `rgba(120,100,70,${.03 + hash(i * 8.3) * .05})`; p.lineWidth = .8; p.beginPath(); p.moveTo(x, y); p.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke(); }
  const vg = p.createRadialGradient(W / 2, H * .46, H * .25, W / 2, H / 2, H * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(90,70,40,.20)'); p.fillStyle = vg; p.fillRect(0, 0, W, H);
  // crop marks + centre targets (printed furniture)
  p.strokeStyle = 'rgba(60,60,60,.55)'; p.lineWidth = 1.4;
  [[44, 44], [W - 44, 44], [44, H - 44], [W - 44, H - 44]].forEach(([x, y]) => { p.beginPath(); p.moveTo(x - 22, y); p.lineTo(x + 22, y); p.moveTo(x, y - 22); p.lineTo(x, y + 22); p.stroke(); });
  [[W / 2, 32], [W / 2, H - 32]].forEach(([x, y]) => { p.beginPath(); p.arc(x, y, 8, 0, TAU); p.moveTo(x - 14, y); p.lineTo(x + 14, y); p.moveTo(x, y - 14); p.lineTo(x, y + 14); p.stroke(); });
  // swatch chips (navy, red, navy, ochre), hatched
  [C.navy, C.red, C.navy, C.ochre].forEach((c, k) => { const x = W - 300 + k * 52, y = H - 92; p.save(); p.beginPath(); p.rect(x, y, 44, 22); p.clip(); p.fillStyle = 'rgba(255,255,255,.25)'; p.fillRect(x, y, 44, 22); p.strokeStyle = c; p.lineWidth = 1.2; for (let j = -4; j < 12; j++) { p.globalAlpha = .55 + hash(k * 9 + j) * .4; p.beginPath(); p.moveTo(x + j * 5, y + 24); p.lineTo(x + j * 5 + 22, y - 2); p.stroke(); } p.restore(); p.strokeStyle = 'rgba(70,70,70,.5)'; p.lineWidth = 1; p.strokeRect(x, y, 44, 22); });

  // hatch pattern tiles (pencil hatching for fills, usable as fill/stroke style)
  const tile = (col, sp, seed, cross) => { const c = document.createElement('canvas'); c.width = c.height = 128; const q = c.getContext('2d'); q.strokeStyle = col; q.lineCap = 'round';
    for (let pass = 0; pass < (cross ? 2 : 1); pass++) for (let i = -128; i < 256; i += sp) { q.lineWidth = .9 + hash(seed + i + pass * 7) * 1.1; q.globalAlpha = .45 + hash(seed * 3 + i + pass) * .45; q.beginPath(); const j = (hash(seed + i * 1.7) - .5) * 3; if (pass === 0) { q.moveTo(i + j, 128); q.lineTo(i + 128 + j, 0); } else { q.moveTo(i + j, 0); q.lineTo(i + 128 + j * 2, 128); } q.stroke(); }
    return g.createPattern(c, 'repeat'); };
  const PAT = { red: tile(C.red, 6, 1, true), redL: tile(C.redL, 8, 2, false), navy: tile(C.navy, 6, 3, true), navyL: tile(C.navy, 9, 4, false), graph: tile('#77787e', 9, 5, false), ochre: tile(C.ochre, 7, 6, true) };
  const paperPat = g.createPattern(paper, 'no-repeat');

  const F = { g, S, C, PAT };
  F.begin = () => { S.A = 1; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.setLineDash([]); g.drawImage(paper, 0, 0); };
  F.alpha = a => { S.A = a; };
  const fixPat = pt => { pt.setTransform(g.getTransform().inverse()); return pt; };
  F.pat = k => fixPat(PAT[k]);
  F.paperPat = () => fixPat(paperPat);
  // ---------- graphite line work ----------
  const walk = (pts, draw) => { const L = [0]; for (let i = 1; i < pts.length; i++) L[i] = L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const tot = L[L.length - 1] * clamp(draw), P = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (L[i] <= tot) P.push(pts[i]); else { const u = (tot - L[i - 1]) / (L[i] - L[i - 1] || 1); P.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } } return P; };
  F.walk = walk;
  // resample a polyline every ~step px so the wobble has something to bend
  const dense = (pts, step = 14) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)); for (let k = 1; k <= n; k++) o.push([lerp(x0, x1, k / n), lerp(y0, y1, k / n)]); } return o; };
  F.dense = dense;
  // pencil: two light passes with a slow wobble, like the demo's graphite outlines
  F.pencil = (pts0, o = {}) => { const { w = 2.2, draw = 1, col = C.ink, alpha = 1, seed = 0, close = false, wob = 1.3, dash = null } = o; if (draw <= 0 || S.A <= 0 || alpha <= 0) return;
    const pts = dense(close ? pts0.concat([pts0[0]]) : pts0); g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; if (dash) g.setLineDash(dash);
    for (let pass = 0; pass < 2; pass++) { const P = walk(pts.map(([x, y], i) => [x + Math.sin(i * .7 + seed + pass * 2.1) * wob * (pass ? 1 : .5), y + Math.cos(i * .53 + seed * 1.3 + pass) * wob * (pass ? 1 : .5)]), draw);
      g.globalAlpha = S.A * alpha * (pass ? .45 : .9); g.lineWidth = pass ? w * .7 : w; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
    g.restore(); };
  F.line = (x0, y0, x1, y1, o = {}) => F.pencil([[x0, y0], [x1, y1]], o);
  F.rect = (x, y, w, h, o = {}) => F.pencil([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { ...o, close: true });
  F.circ = (cx, cy, r, o = {}) => { const n = 40, P = []; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * TAU; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } F.pencil(P, o); };
  F.path = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  // hatched fill of a polygon (pattern = 'red' | 'navy' | 'graph' ...), revealed by a wipe (k 0..1 in direction dir)
  F.hatch = (pts, kind, o = {}) => { const { k = 1, alpha = 1, dir = 'up', paperUnder = .0 } = o; if (k <= 0 || S.A <= 0) return; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    g.save(); F.path(pts); g.clip(); if (k < 1) { g.beginPath(); if (dir === 'up') g.rect(x0 - 5, lerp(y1, y0, k) - 2, x1 - x0 + 10, y1 - y0 + 10); else if (dir === 'down') g.rect(x0 - 5, y0 - 5, x1 - x0 + 10, (y1 - y0) * k + 5); else g.rect(x0 - 5, y0 - 5, (x1 - x0) * k + 5, y1 - y0 + 10); g.clip(); }
    if (paperUnder) { g.globalAlpha = S.A * paperUnder; g.fillStyle = F.paperPat(); g.fillRect(x0, y0, x1 - x0, y1 - y0); }
    g.globalAlpha = S.A * alpha; g.fillStyle = F.pat(kind); g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4); g.restore(); };
  // ---------- type ----------
  const font = (f, size, wt) => f === 'hand' ? `${wt || 400} ${size}px "Kalam"` : f === 'mono' ? `${wt || 400} ${size}px "Courier Prime"` : f === 'cjk' ? `${size}px "IPAGothic","WenQuanYi Zen Hei"` : `${wt || 400} ${size}px "Nunito"`;
  F.measure = (str, size, f = 'body', wt) => { g.save(); g.font = font(f, size, wt); const w = g.measureText(str).width; g.restore(); return w; };
  // write: 0..1 left-to-right reveal (handwriting); type: number of chars shown (typewriter)
  F.txt = (str, x, y, o = {}) => { const { size = 40, align = 'left', alpha = 1, write = 1, f = 'body', wt, col = C.ink, rot = 0, ls = 0, type = null } = o; if (write <= 0 || alpha <= 0 || S.A <= 0) return; g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.font = font(f, size, wt); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = col; if (g.letterSpacing !== undefined) g.letterSpacing = ls + 'px';
    const w = g.measureText(str).width, x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0; let s = str;
    if (type !== null) s = str.slice(0, Math.max(0, Math.floor(type)));
    if (write < 1) { g.beginPath(); g.rect(x0 - 6, -size * 1.4, (w + 12) * write, size * 2); g.clip(); }
    g.globalAlpha = S.A * alpha; g.fillText(s, x0, 0);
    if (write < 1) { const fe = (w + 12) * write; g.globalAlpha = S.A * alpha * .5; g.beginPath(); g.rect(x0 - 6 + fe - 14, -size * 1.4, 14, size * 2); g.clip(); g.fillStyle = C.paper; g.fillRect(x0 - 6 + fe - 14, -size * 1.4, 14, size * 2); }
    g.restore(); return w; };
  // chapter label: "NO. 01 — THE TRAPWAY · fig. a" typed in, then a hairline rule draws under it
  F.label = (str, x, y, tS) => { if (tS <= 0) return; const n = tS * 38; F.txt(str, x, y, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', type: n, alpha: .9 }); const w = F.measure(str, 25, 'mono', 700) + str.length * 3; F.line(x, y + 16, x + w + 20, y + 16, { w: 1, alpha: .5, draw: ramp(tS, .2, .6), wob: .3 }); };
  // handwritten italic headline written on
  F.head = (str, x, y, tS, o = {}) => { const { size = 78, dur = Math.max(.5, str.length * .045) } = o; F.txt(str, x, y, { size, f: 'hand', wt: 400, write: ss(ramp(tS, 0, dur)) * 1.0, rot: -.012, ...o }); };
  // typewriter body with **bold** = red; wraps to maxW; returns height
  F.body = (cap, x, y, maxW, tS, o = {}) => { const { size = 50, lh = 1.34, cps = 46, align = 'left', alpha = 1 } = o; if (tS <= 0) return 0; const toks = []; cap.split('**').forEach((sg, k) => sg.split(' ').filter(Boolean).forEach(wd => toks.push({ w: wd, b: k % 2 === 1 })));
    const sp = F.measure(' ', size); const lines = [[]]; let acc = 0; toks.forEach(tk => { const ww = F.measure(tk.w, size, 'body', tk.b ? 700 : 500); if (acc + ww > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0; } lines[lines.length - 1].push({ ...tk, ww }); acc += ww + sp; });
    let shown = tS * cps; lines.forEach((l, li) => { const lw = l.reduce((a, t) => a + t.ww + sp, -sp); let xx = align === 'center' ? x - lw / 2 : x; l.forEach(tk => { const nch = Math.min(tk.w.length, shown); if (nch > 0) F.txt(tk.w, xx, y + li * size * lh, { size, f: 'body', wt: tk.b ? 700 : 500, col: tk.b ? C.red : '#3a3a40', type: nch, alpha }); shown -= tk.w.length + 1; xx += tk.ww + sp; }); });
    return lines.length * size * lh; };
  // red seal: square (carved, vertical chars) or round; stamps in with overshoot; knock-out speckle
  F.seal = (chars, x, y, k, o = {}) => { if (k <= .01 || S.A <= 0) return; const { size = 64, round = false, rot = .03, f = 'cjk' } = o; const sc = 1 + (1 - ss(k)) * .7; g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = S.A * clamp(k * 3) * .92;
    const n = chars.length, w = round ? size * 1.5 : size * 1.25, h = round ? size * 1.5 : size * (n * 1.05 + .35); g.fillStyle = C.red;
    if (round) { g.beginPath(); g.arc(0, 0, w / 2, 0, TAU); g.fill(); } else { g.fillRect(-w / 2, -h / 2, w, h); }
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.font = font(f, size, 700); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (round) { g.lineWidth = 3; g.strokeStyle = '#000'; g.beginPath(); g.arc(0, 0, w / 2 - 7, 0, TAU); g.stroke(); g.fillText(chars, 0, 3); }
    else { g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); for (let i = 0; i < n; i++) g.fillText(chars[i], 0, -h / 2 + size * (.7 + i * 1.05)); }
    for (let i = 0; i < 140; i++) { g.globalAlpha = .5; g.fillRect((hash(i * 3.3) - .5) * w, (hash(i * 5.7) - .5) * h, 1.5 + hash(i) * 3, 1 + hash(i + 1) * 2.5); } g.restore(); };
  // double-ruled measurement box drawn on
  F.box = (x, y, w, h, k, o = {}) => { if (k <= 0) return; F.rect(x, y, w, h, { w: 1.8, draw: ss(clamp(k * 1.4)), col: C.graph, ...o }); F.rect(x + 7, y + 7, w - 14, h - 14, { w: 1, draw: ss(ramp(k, .25, .75)), col: C.graph, alpha: .7, ...o }); };
  // arrow with drawn head (graphite or red)
  F.arrow = (pts, o = {}) => { const { draw = 1, col = C.red, w = 2.6 } = o; if (draw <= 0) return; F.pencil(pts, { ...o, w, col }); const P = walk(dense(pts), draw); if (P.length < 2 || draw < .3) return; const [x1, y1] = P[P.length - 1], [x0, y0] = P[Math.max(0, P.length - 3)]; const a = Math.atan2(y1 - y0, x1 - x0), L = 18;
    F.pencil([[x1 - Math.cos(a - .45) * L, y1 - Math.sin(a - .45) * L], [x1, y1], [x1 - Math.cos(a + .45) * L, y1 - Math.sin(a + .45) * L]], { w, col, alpha: o.alpha ?? 1, wob: .4 }); };
  // heat/gas squiggle (demo's rising heat lines), animated phase
  F.squig = (x, y, h, t, o = {}) => { const { col = C.graph, alpha = .8, draw = 1, amp = 7 } = o; const P = []; for (let i = 0; i <= 18; i++) { const u = i / 18; P.push([x + Math.sin(u * 9 + t * 4) * amp * (1 - u * .4), y - u * h]); } F.pencil(P, { col, alpha, draw, w: 1.8, wob: .3 }); };
  // footer + page number
  F.footer = (pg, a = 1) => { F.txt(`HOW IT REALLY WORKS   2026   p.${String(pg).padStart(2, '0')}`, 64, H - 72, { size: 20, f: 'mono', ls: 2, col: '#5d5d62', alpha: .75 * a }); };
  return F;
}
