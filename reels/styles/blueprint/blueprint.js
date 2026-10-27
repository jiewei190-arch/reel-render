// blueprint.js: vertical 1080x1920 cyanotype engineering-drawing renderer (Canvas2D, deterministic, pure function of t).
// Grammar from lemo-opuscar/styles/blueprint (STYLE.md): white line work on uneven Prussian-blue sheet lying on dark drafting cloth,
// drafting order (centre lines -> outlines -> detail -> hatching -> dimensions -> balloons -> labels), glowing nib at the head of every
// draw-on, line weight scaled with zoom^0.65, dash conventions, paper-fill occlusion, double-ruled subtitle "NOTE n" boxes lettered on
// left to right, title block as story, FIG. numbers as transitions, ONE non-blue colour (red rubber stamp) used once.
// Original code (not copied from the demo's WebGL engine). Hand font: Caveat (SIL OFL); title-block font: Poppins.
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const C = { ink: '#E7F0F9', blue0: '#18336B', blue1: '#2A58A6', paper: '#1d447f', table: '#0D1116', stamp: '#d8262b' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const bo = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const VP = { x: 62, y: 200, w: 956, h: 1150 };           // figure viewport (camera moves inside it)
export const DASH = { centre: [46, 9, 9, 9], hidden: [11, 8], phantom: [46, 9, 9, 9, 9, 9] };

export function createBP(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const S = { z: 1, cx: 540, cy: 775, k: 1, A: 1 };              // camera + width factor + global alpha
  // ---------- cached cyanotype sheet on drafting cloth ----------
  const sheet = document.createElement('canvas'); sheet.width = W; sheet.height = H; const s = sheet.getContext('2d');
  s.fillStyle = C.table; s.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { s.fillStyle = `rgba(255,255,255,${hash(i) * .018})`; s.fillRect(hash(i + 3) * W, hash(i + 7) * H, 1 + hash(i + 9) * 3, 1); }      // cloth weave
  s.save(); s.shadowColor = 'rgba(0,0,0,.65)'; s.shadowBlur = 38; s.shadowOffsetY = 12; s.fillStyle = C.blue0; s.fillRect(36, 36, W - 72, H - 72); s.restore();
  s.save(); s.beginPath(); s.rect(36, 36, W - 72, H - 72); s.clip();
  const gr = s.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1b3b78'); gr.addColorStop(.55, '#2650a0'); gr.addColorStop(1, '#1c3f84'); s.fillStyle = gr; s.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = hash(i * 1.3) * W, y = hash(i * 2.1) * H, r = 160 + hash(i * 3.7) * 380, d = hash(i * 5.3) > .5; const rg = s.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, d ? 'rgba(8,24,70,.20)' : 'rgba(110,160,235,.13)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); s.fillStyle = rg; s.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 90; i++) { const x = hash(i * 7.7) * W, w = 2 + hash(i * 1.9) * 26; s.fillStyle = `rgba(${hash(i) > .5 ? '120,170,240' : '6,20,60'},${.025 + hash(i * 4.4) * .035})`; s.fillRect(x, 0, w, H); }   // coating streaks
  for (let i = 0; i < 1400; i++) { const x = hash(i * 1.7) * W, y = hash(i * 2.9) * H, a = hash(i * 4.1) * TAU, l = 6 + hash(i * 6.1) * 16; s.strokeStyle = `rgba(200,225,255,${.03 + hash(i * 8.3) * .05})`; s.lineWidth = 1; s.beginPath(); s.moveTo(x, y); s.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); s.stroke(); }  // fibres
  for (let i = 0; i < 260; i++) { s.fillStyle = `rgba(230,240,255,${hash(i * 3.1) * .22})`; s.fillRect(hash(i * 5.1) * W, hash(i * 7.9) * H, 1.5, 1.5); }                                                  // specks
  s.strokeStyle = 'rgba(200,225,255,.07)'; s.lineWidth = 1; for (let x = 36; x < W; x += 54) { s.beginPath(); s.moveTo(x, 36); s.lineTo(x, H - 36); s.stroke(); } for (let y = 36; y < H; y += 54) { s.beginPath(); s.moveTo(36, y); s.lineTo(W - 36, y); s.stroke(); }
  [[0, 640, 1], [0, 1280, 1], [1, 540, 1]].forEach(([v, p]) => { const hz = !v; s.fillStyle = 'rgba(0,0,0,.22)'; hz ? s.fillRect(36, p - 1, W - 72, 2) : s.fillRect(p - 1, 36, 2, H - 72); s.fillStyle = 'rgba(190,220,255,.2)'; hz ? s.fillRect(36, p + 1, W - 72, 1.5) : s.fillRect(p + 1, 36, 1.5, H - 72); });  // fold creases
  const eg = s.createLinearGradient(36, 0, 120, 0); eg.addColorStop(0, 'rgba(150,190,240,.28)'); eg.addColorStop(1, 'rgba(150,190,240,0)'); s.fillStyle = eg; s.fillRect(36, 36, 90, H - 72);   // sun-bleached edge
  s.restore();

  const B = { g, S, C };
  B.begin = () => { S.A = 1; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.setLineDash([]); g.drawImage(sheet, 0, 0); };
  // ---------- camera (figure layer) ----------
  B.camBegin = (cx, cy, z) => { S.z = z; S.cx = cx; S.cy = cy; S.k = Math.pow(z, -.35); g.save(); g.beginPath(); g.rect(VP.x, VP.y, VP.w, VP.h); g.clip();
    g.translate(VP.x + VP.w / 2, VP.y + VP.h / 2); g.scale(z, z); g.translate(-cx, -cy); };
  B.camEnd = () => { g.restore(); S.z = 1; S.k = 1; };
  B.alpha = a => { S.A = a; };
  // ---------- line work ----------
  const walk = (pts, draw) => { const L = [0]; for (let i = 1; i < pts.length; i++) L[i] = L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const tot = L[L.length - 1] * clamp(draw), P = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (L[i] <= tot) P.push(pts[i]); else { const u = (tot - L[i - 1]) / (L[i] - L[i - 1] || 1); P.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } } return P; };
  // poly: white line, optional draw-on with glowing nib, dash convention, close
  B.poly = (pts0, o = {}) => { const { w = 2.2, draw = 1, col = C.ink, alpha = 1, dash = null, close = false, seed = 0, nib = true } = o; if (draw <= 0 || S.A <= 0) return;
    const pts = close ? pts0.concat([pts0[0]]) : pts0; const P = walk(pts, draw); g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = w * S.k; if (dash) g.setLineDash(dash);
    g.globalAlpha = S.A * alpha * .96; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.globalAlpha = S.A * alpha * .22; g.lineWidth = w * S.k * 2.4; g.stroke();                   // soft ink bleed
    if (nib && draw < 1 && P.length > 1) { const [x, y] = P[P.length - 1]; const rg = g.createRadialGradient(x, y, 0, x, y, 20 * S.k); rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.setLineDash([]); g.globalAlpha = S.A * alpha; g.fillStyle = rg; g.beginPath(); g.arc(x, y, 20 * S.k, 0, TAU); g.fill(); }
    g.restore(); };
  B.line = (x0, y0, x1, y1, o = {}) => B.poly([[x0, y0], [x1, y1]], o);
  B.rect = (x, y, w, h, o = {}) => B.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { ...o, close: true });
  B.circ = (cx, cy, r, o = {}) => { const n = 48, P = []; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * TAU; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } B.poly(P, o); };
  // paper fill (occlusion): polygon filled with sheet blue before its outline is stroked
  B.paper = (pts, a = .94, col = C.paper) => { if (S.A <= 0) return; g.save(); g.globalAlpha = S.A * a; g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); };
  // fine-line hatching clipped to a polygon (45 deg), spacing in sheet units
  B.hatch = (pts, o = {}) => { const { ang = Math.PI / 4, sp = 13, alpha = .45, w = 1.1, draw = 1, holes = [] } = o; if (draw <= 0 || S.A <= 0) return; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    g.save(); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); holes.forEach(h => { h.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }); g.clip('evenodd'); g.strokeStyle = C.ink; g.lineWidth = w * S.k; g.globalAlpha = S.A * alpha;
    const D = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2), dx = Math.cos(ang), dy = Math.sin(ang);
    const n = Math.ceil(D / sp); g.beginPath(); for (let i = -n; i <= n; i++) { const px = cx + nx * i * sp, py = cy + ny * i * sp; const a = -D / 2 + (D * draw) * 0, b = D / 2 * (2 * draw - 1); g.moveTo(px + dx * -D / 2, py + dy * -D / 2); g.lineTo(px + dx * b, py + dy * b); } g.stroke(); g.restore(); };
  // ---------- text ----------
  B.txt = (str, x, y, o = {}) => { const { size = 40, align = 'left', alpha = 1, write = 1, font = 'Caveat', weight = 700, col = C.ink, rot = 0, ls = 0 } = o; if (write <= 0 || alpha <= 0 || S.A <= 0) return; g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; if (ls && g.letterSpacing !== undefined) g.letterSpacing = ls + 'px';
    const w = g.measureText(str).width, x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    if (write < 1) { g.beginPath(); g.rect(x0 - 4, -size, w * write + 4, size * 2); g.clip(); }
    g.globalAlpha = S.A * alpha * .95; g.fillText(str, 0, 0); g.restore();
    if (write > 0 && write < 1) { const nx = x + (x0 + w * write) * Math.cos(rot), ny = y + (x0 + w * write) * Math.sin(rot); const rg = g.createRadialGradient(nx, ny, 0, nx, ny, 16); rg.addColorStop(0, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.globalAlpha = S.A * alpha; g.fillStyle = rg; g.beginPath(); g.arc(nx, ny, 16, 0, TAU); g.fill(); g.restore(); } };
  B.measure = (str, size, o = {}) => { const { font = 'Caveat', weight = 700 } = o; g.save(); g.font = `${weight} ${size}px "${font}"`; const w = g.measureText(str).width; g.restore(); return w; };
  // ---------- drafting furniture ----------
  B.arrowhead = (x, y, ang, o = {}) => { const L = 15; B.poly([[x - Math.cos(ang - .32) * L, y - Math.sin(ang - .32) * L], [x, y], [x - Math.cos(ang + .32) * L, y - Math.sin(ang + .32) * L]], { w: 1.8, nib: false, ...o }); };
  // dimension line between two points with extension lines, arrowheads and a centred label (live numbers allowed)
  B.dim = (x0, y0, x1, y1, label, o = {}) => { const { off = 40, draw = 1, size = 30, alpha = 1 } = o; if (draw <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a), ox = nx * off, oy = ny * off;
    const k = ss(draw); B.line(x0, y0, x0 + ox * 1.15, y0 + oy * 1.15, { w: 1, alpha: alpha * .8, draw: k, nib: false }); B.line(x1, y1, x1 + ox * 1.15, y1 + oy * 1.15, { w: 1, alpha: alpha * .8, draw: k, nib: false });
    B.line(x0 + ox, y0 + oy, x1 + ox, y1 + oy, { w: 1.3, draw: k, alpha, nib: false });
    if (k > .9) { B.arrowhead(x0 + ox, y0 + oy, a + Math.PI, { alpha }); B.arrowhead(x1 + ox, y1 + oy, a, { alpha }); }
    const mx = (x0 + x1) / 2 + ox * 1.55, my = (y0 + y1) / 2 + oy * 1.55; if (label != null) { const tw = B.measure(String(label), size) + 14; g.save(); g.globalAlpha = S.A * alpha * .9 * k; g.fillStyle = C.paper; g.fillRect(mx - tw / 2, my - size * .6, tw, size * 1.2); g.restore(); B.txt(String(label), mx, my, { size, align: 'center', alpha: alpha * k }); } };
  // numbered part balloon with leader to a target point; k = pop 0..1
  B.balloon = (n, bx, by, tx, ty, k = 1, o = {}) => { if (k <= .02) return; const r = 24; const lk = clamp(k * 1.4); const a = Math.atan2(ty - by, tx - bx);
    B.line(bx + Math.cos(a) * r, by + Math.sin(a) * r, lerp(bx + Math.cos(a) * r, tx, lk), lerp(by + Math.sin(a) * r, ty, lk), { w: 1.3, draw: 1, nib: false, alpha: .9 });
    if (lk >= 1) { g.save(); g.globalAlpha = S.A; g.fillStyle = C.ink; g.beginPath(); g.arc(tx, ty, 4 * S.k, 0, TAU); g.fill(); g.restore(); }
    g.save(); g.translate(bx, by); g.scale(.4 + .6 * bo(k), .4 + .6 * bo(k)); g.translate(-bx, -by); B.paper([[bx - r, by - r], [bx + r, by - r], [bx + r, by + r], [bx - r, by + r]], 0); B.circ(bx, by, r, { w: 1.8, nib: false }); B.txt(String(n), bx, by + 1, { size: 32, align: 'center', font: 'Poppins', weight: 600 }); g.restore(); };
  // spring (zigzag coil) between y0 (top) and y1 (bottom) at x
  B.spring = (x, y0, y1, o = {}) => { const { coils = 7, wd = 18, w = 2, draw = 1, alpha = 1 } = o; const P = [[x, y0]]; for (let i = 0; i < coils * 2; i++) { const yy = lerp(y0 + 6, y1 - 6, (i + .5) / (coils * 2)); P.push([x + (i % 2 ? wd : -wd), yy]); } P.push([x, y1]); B.poly(P, { w, draw, alpha, nib: false }); };
  // red rubber stamp (the film's single non-blue colour)
  B.stamp = (str, x, y, k, o = {}) => { if (k <= .01) return; const { rot = -.14, size = 74 } = o; const sc = 1 + (1 - ss(k)) * .9; g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = S.A * clamp(k * 3) * .93; g.strokeStyle = C.stamp; g.fillStyle = C.stamp; g.lineWidth = 7;
    g.font = `800 ${size}px "Poppins"`; const tw = g.measureText(str).width; g.strokeRect(-tw / 2 - 30, -size * .8, tw + 60, size * 1.6); g.lineWidth = 2.5; g.strokeRect(-tw / 2 - 20, -size * .68, tw + 40, size * 1.36); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, 0, 4);
    for (let i = 0; i < 160; i++) { g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .55; g.fillRect((hash(i * 3.3) - .5) * (tw + 80), (hash(i * 5.7) - .5) * size * 1.7, 2 + hash(i) * 3, 1 + hash(i + 1) * 2); } g.restore(); };
  // ---------- sheet furniture (fixed on screen) ----------
  B.frame = (o = {}) => { const { fig = 'FIG. 1', figSub = '', figK = 1, figOld = '', title = '', sheetN = '1/1' } = o; g.save(); g.globalAlpha = 1; g.strokeStyle = C.ink; g.lineWidth = 3.2; g.strokeRect(60, 60, W - 120, H - 120); g.lineWidth = 1.2; g.strokeRect(70, 70, W - 140, H - 140); g.restore();
    g.save(); g.strokeStyle = C.ink; g.lineWidth = 1.4; g.globalAlpha = .9; g.strokeRect(VP.x + 8, VP.y, VP.w - 16, VP.h); g.restore();
    // header
    B.txt('HOW IT REALLY WORKS', 100, 104, { size: 25, font: 'Poppins', weight: 600, alpha: .85, ls: 3 });
    B.txt(title, 540, 152, { size: 74, align: 'center' });
    B.line(100, 188, 980, 188, { w: 1.5, nib: false, alpha: .8 });
    // fig label (struck through and rewritten)
    if (figOld && figK < 1) { B.txt(figOld, 98, 232, { size: 40, alpha: 1 - ss(figK * 2) }); B.line(94, 232, 94 + B.measure(figOld, 40) + 8, 232, { w: 3, draw: ramp(figK, 0, .35), nib: false }); }
    B.txt(fig + (figSub ? '  ·  ' + figSub : ''), 98, 232, { size: 40, write: figOld ? ramp(figK, .35, .65) : 1 });
    B.txt('SHEET ' + sheetN, 982, 104, { size: 25, font: 'Poppins', weight: 600, align: 'right', alpha: .85, ls: 3 }); };
  // title block (bottom): status field carries the verdict; lettered on
  B.titleBlock = (o = {}) => { const { status = 'LOCKED', title = 'PIN TUMBLER LOCK', write = 1, rows = [] } = o; const y0 = 1722, h = 128;
    g.save(); g.strokeStyle = C.ink; g.lineWidth = 2.4; g.strokeRect(100, y0, 880, h); g.lineWidth = 1.3; [[420, 0, 420, h], [700, 0, 700, h], [100, 64, 980, 64]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a === 100 ? 100 : a + 0, y0 + b); g.lineTo(c === 980 ? 980 : c, y0 + d); g.stroke(); }); g.restore();
    const cells = [['TITLE', title, 112, 0], ['DRAWN BY', '@howitreallyworkstudio', 112, 64], ['STATUS', status, 432, 0], ['SHEET', '1 OF 1', 432, 64], ['SCALE', 'NOT TO SCALE', 712, 0], ['SOURCES', 'SEE CAPTION', 712, 64]];
    cells.forEach(([k, v, x, dy], i) => { const wk = ramp(write, i * .11, .3); B.txt(k, x, y0 + dy + 15, { size: 17, font: 'Poppins', weight: 600, alpha: .7, ls: 2, write: wk }); B.txt(v, x, y0 + dy + 42, { size: v.length > 14 ? 31 : 40, write: wk }); }); };
  // double-ruled subtitle note box, text lettered on over ~0.35 s; bold words get a hair underline
  B.note = (n, cap, tSince, o = {}) => { const { y = 1372, h = 318, size = 58 } = o; const x = 100, w = 880; g.save(); g.globalAlpha = clamp(tSince / .15); g.fillStyle = 'rgba(14,34,82,.62)'; g.fillRect(x, y, w, h); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.strokeRect(x, y, w, h); g.lineWidth = 1; g.strokeRect(x + 7, y + 7, w - 14, h - 14); g.restore();
    B.txt('NOTE', x + 24, y + 28, { size: 17, font: 'Poppins', weight: 600, alpha: .8, ls: 3 }); B.txt(String(n).padStart(2, '0'), x + 92, y + 28, { size: 22, font: 'Poppins', weight: 600 });
    const toks = []; cap.split('**').forEach((sg, k) => sg.split(' ').filter(Boolean).forEach(wd => toks.push({ w: wd, b: k % 2 === 1 }))); const sp = B.measure(' ', size), maxW = w - 70; const lines = [[]]; let acc = 0;
    toks.forEach(tk => { const ww = B.measure(tk.w, size); if (acc + ww > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0; } lines[lines.length - 1].push({ ...tk, ww }); acc += ww + sp; });
    const lh = size * 1.12, ty = y + 62 + (h - 62 - lines.length * lh) / 2 + lh / 2; const total = toks.length; let idx = 0;
    lines.forEach((l, li) => { let xx = x + 36; l.forEach(tk => { const wk = clamp((tSince - .05) / .4 * total - idx); idx++; if (wk > 0) { B.txt(tk.w, xx, ty + li * lh, { size, write: wk }); if (tk.b && wk >= 1) B.line(xx, ty + li * lh + size * .42, xx + tk.ww, ty + li * lh + size * .42, { w: 1.6, nib: false, alpha: .9 }); } xx += tk.ww + sp; }); }); };
  return B;
}
