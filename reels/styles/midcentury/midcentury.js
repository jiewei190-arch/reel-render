// midcentury.js: vertical 1080x1920 "mid-century cartoon" renderer (Canvas2D, deterministic).
// Our own re-implementation of the grammar in Lemo-Opuscar's midcentury-toon (MIT): flat fills printed a few px
// off a broken, breathing ink line; held-body presenter with acting hands; colour-plane sets. No code or characters copied.
// Use: const M = createMC(canvas); per frame: M.begin(t); ...draw...; M.end();
export const W = 1080, H = 1920;
export const PAL = {
  paper: '#f6ead3', paper2: '#fbf3e2', ink: '#3b2a24', tomato: '#e4572e', mustard: '#eaae3f', teal: '#3aa7a3', tealL: '#86cbc4',
  olive: '#8a9a45', powder: '#a9cfe0', plum: '#6b3f5e', coral: '#f0b99a', roast: '#cf6a2b', skin: '#f1c7a0', hair: '#5a3a2a', white: '#fbf6ea',
};
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 2.2; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

// ── geometry helpers ──
export const ellipsePts = (cx, cy, rx, ry, n = 48, rot = 0) => Array.from({ length: n }, (_, i) => {
  const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
export const rrectPts = (x, y, w, h, r, seg = 6) => {
  r = Math.min(r, w / 2, h / 2); const P = [], c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
  for (const [cx, cy, a0] of c) for (let i = 0; i <= seg; i++) { const a = (a0 + i / seg * 90) * Math.PI / 180; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };
export const capsulePts = (x1, y1, x2, y2, w, seg = 6) => {
  const a = Math.atan2(y2 - y1, x2 - x1), r = w / 2, P = [];
  for (let i = 0; i <= seg; i++) { const b = a - Math.PI / 2 + i / seg * Math.PI; P.push([x2 + Math.cos(b) * r, y2 + Math.sin(b) * r]); }
  for (let i = 0; i <= seg; i++) { const b = a + Math.PI / 2 + i / seg * Math.PI; P.push([x1 + Math.cos(b) * r, y1 + Math.sin(b) * r]); } return P; };
export const smooth = (pts, n = 8, closed = false) => {
  const P = pts, L = P.length, out = [], g = i => closed ? P[(i + L) % L] : P[Math.max(0, Math.min(L - 1, i))], m = closed ? L : L - 1;
  for (let i = 0; i < m; i++) for (let k = 0; k < n; k++) { const t = k / n, p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t * t + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t * t * t))); }
  if (!closed) out.push(P[L - 1]); return out; };
export const quad = (a, b, c, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [0, 1].map(d => (1 - t) * (1 - t) * a[d] + 2 * (1 - t) * t * b[d] + t * t * c[d]); });
export const tubePts = (path, w0, w1 = w0) => { // thick ribbon around a polyline
  const L = [], R = [];
  path.forEach((p, i) => { const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = lerp(w0, w1, i / (path.length - 1)) / 2; L.push([p[0] - dy * w, p[1] + dx * w]); R.push([p[0] + dy * w, p[1] - dx * w]); });
  const cap = (c, a0) => Array.from({ length: 7 }, (_, i) => { const t = a0 + i / 6 * Math.PI; return [c[0] + Math.cos(t) * w1 / 2, c[1] + Math.sin(t) * w1 / 2]; });
  return [...L, ...R.reverse()]; };

export function createMC(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d'); let STEP = 0, T = 0;
  const M = { g, W, H };
  const INK = PAL.ink;
  // paper grain + vignette (built once)
  const grain = document.createElement('canvas'); grain.width = 540; grain.height = 960; { const gg = grain.getContext('2d'), id = gg.createImageData(540, 960);
    for (let i = 0; i < 540 * 960; i++) { const x = i % 540, y = (i / 540) | 0, v = 236 + (hash(i * .37) * 19) + Math.sin(x * .9 + hash(y * .1) * 6) * 2.5; id.data[i * 4] = v; id.data[i * 4 + 1] = v - 3; id.data[i * 4 + 2] = v - 9; id.data[i * 4 + 3] = 255; } gg.putImageData(id, 0, 0); }
  const jit = (seed, a = 1.4) => [(hash(seed * 3.1 + STEP * 7.7) - .5) * 2 * a, (hash(seed * 5.3 + STEP * 4.1) - .5) * 2 * a];
  M.begin = t => { T = t; STEP = Math.floor(t * 12 + 1e-6); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H); };
  M.end = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.imageSmoothingEnabled = true; g.drawImage(grain, 0, 0, W, H);
    const v = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(150,100,60,.32)'); g.fillStyle = v; g.fillRect(0, 0, W, H); g.restore(); };
  const path = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  // ink: a 3-5 px line that breathes in width and has small breaks
  M.ink = (pts, { w = 4, col = INK, seed = 1, closed = false, breaks = true } = {}) => {
    const P = (closed ? [...pts, pts[0]] : pts).map((p, i) => { const j = jit(seed + i * .7, .8); return [p[0] + j[0], p[1] + j[1]]; });
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const L = cum[cum.length - 1], nb = breaks ? Math.floor(L / 650) : 0, gaps = []; for (let k = 0; k < nb; k++) gaps.push([hash(seed + k * 3.7) * L, 12 + hash(seed + k * 9.1) * 14]);
    g.save(); g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 1; i < P.length; i++) { const s = (cum[i - 1] + cum[i]) / 2; if (gaps.some(([c, l]) => Math.abs(s - c) < l / 2)) continue;
      g.lineWidth = w * (1 + .32 * Math.sin(s * .02 + seed + STEP * .45)); g.beginPath(); g.moveTo(P[i - 1][0], P[i - 1][1]); g.lineTo(P[i][0], P[i][1]); g.stroke(); }
    g.restore(); };
  // cel: a flat fill printed off-register from its ink line
  M.cel = (pts, fill, { w = 4, seed = 1, off = [7, 6], ink = true, closed = true, shade = null, reg = true } = {}) => {
    const j = reg ? jit(seed) : [0, 0]; g.save(); g.translate((reg ? off[0] : 0) + j[0], (reg ? off[1] : 0) + j[1]); g.fillStyle = fill; path(pts); g.fill();
    if (shade) { g.clip(); g.fillStyle = shade.col; shade.draw ? shade.draw(g) : g.fillRect(-2000, -2000, 4000, 4000); } g.restore();
    if (ink) M.ink(pts, { w, seed, closed }); };
  M.shadow = (pts, off = [16, 18]) => { g.save(); g.translate(off[0], off[1]); g.globalAlpha = .45; g.fillStyle = '#c9b48f'; path(pts); g.fill(); g.restore(); };
  // clipped dark plane inside a shape (flat shading): fn(g) draws in the shape's clip (offset like the fill)
  M.clipped = (pts, fn, { off = [7, 6], seed = 1 } = {}) => { const j = jit(seed); g.save(); g.translate(off[0] + j[0], off[1] + j[1]); path(pts); g.clip(); fn(g); g.restore(); };
  M.text = (str, x, y, { font = 'Alfa Slab One', size = 100, weight = 400, col = INK, plate = null, po = [6, 5], align = 'center', rot = 0, alpha = 1, reg = true } = {}) => {
    g.save(); g.translate(x, y); g.rotate(rot); g.textAlign = align; g.textBaseline = 'alphabetic'; g.font = `${weight} ${size}px "${font}"`; g.globalAlpha = alpha;
    const j = reg ? jit(x + y + size, 1.1) : [0, 0];
    if (plate) { g.fillStyle = plate; g.fillText(str, po[0] + j[0], po[1] + j[1]); } g.fillStyle = col; g.fillText(str, 0, 0); g.restore(); };
  M.textW = (str, size, font = 'Jost', weight = 600) => { g.save(); g.font = `${weight} ${size}px "${font}"`; const w = g.measureText(str).width; g.restore(); return w; };
  // ornaments
  M.sparkle = (x, y, r, rot = 0, col = PAL.mustard) => { const P = []; for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, rr = i % 2 ? r * .22 : r; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } M.cel(P, col, { w: 3, seed: x * .1 + y, off: [4, 3] }); };
  M.burst = (x, y, r1, r2, n, col, { rot = 0, seed = 2, w = 4 } = {}) => { const P = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n; P.push([x + Math.cos(a) * (i % 2 ? r1 : r2), y + Math.sin(a) * (i % 2 ? r1 : r2)]); } M.cel(P, col, { w, seed }); };
  M.rays = (cx, cy, R, n, col, alpha = .35, rot = 0) => { g.save(); g.globalAlpha = alpha; g.fillStyle = col; for (let i = 0; i < n; i++) { const a0 = rot + i * 2 * Math.PI / n, a1 = a0 + Math.PI / n; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); g.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); g.closePath(); g.fill(); } g.restore(); };
  M.dots = (x0, y0, x1, y1, step, r, col, alpha = .5) => { g.save(); g.globalAlpha = alpha; g.fillStyle = col; for (let y = y0, row = 0; y < y1; y += step, row++) for (let x = x0 + (row % 2) * step / 2; x < x1; x += step) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore(); };
  // colour-plane set: wall tint, darker floor band, horizon with gaps
  M.set = (wall, floor, horizon = 1380) => { g.fillStyle = wall; g.fillRect(0, 0, W, horizon); g.fillStyle = floor; g.fillRect(0, horizon, W, H - horizon);
    M.ink([[0, horizon], [W, horizon]], { w: 4, seed: 77, breaks: true }); };
  // ink-stamp: double border slab text, speckled, slams in with a back-ease
  M.stamp = (str, x, y, { size = 190, col = PAL.tomato, rot = -.14, scale = 1, alpha = 1 } = {}) => {
    const tw = M.textW(str, size, 'Alfa Slab One', 400) + 90, th = size * 1.3, c = document.createElement('canvas'); c.width = tw + 40; c.height = th + 40; const s = c.getContext('2d');
    s.strokeStyle = col; s.fillStyle = col; s.lineWidth = 14; const rr = (x, y, w, h, r) => { s.beginPath(); s.roundRect(x, y, w, h, r); };
    rr(14, 14, tw + 12, th + 12, 26); s.stroke(); s.lineWidth = 5; rr(36, 36, tw - 32, th - 32, 14); s.stroke();
    s.font = `400 ${size}px "Alfa Slab One"`; s.textAlign = 'center'; s.textBaseline = 'middle'; s.fillText(str, c.width / 2, c.height / 2 + size * .04);
    s.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 520; i++) { const px = hash(i * 1.7) * c.width, py = hash(i * 2.9) * c.height, pr = hash(i * 4.1) * 3.2 + .6; s.globalAlpha = .55 + hash(i) * .45; s.beginPath(); s.arc(px, py, pr, 0, 7); s.fill(); }
    s.globalAlpha = .6; s.lineWidth = 3; for (let i = 0; i < 14; i++) { s.beginPath(); const y0 = hash(i * 7.7) * c.height; s.moveTo(0, y0); s.lineTo(c.width, y0 + (hash(i * 3.3) - .5) * 40); s.stroke(); }
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(scale, scale); g.globalAlpha = alpha; g.globalCompositeOperation = 'multiply'; g.drawImage(c, -c.width / 2, -c.height / 2); g.restore(); };
  // caption card: paper slab, ink border, colour plate off-register, stars at both ends. lines: [[ [txt,col], ... ], ...]
  M.capCard = (lines, { y = 1620, size = 42, alpha = 1, rise = 0 } = {}) => {
    const ws = lines.map(l => l.reduce((a, [t]) => a + M.textW(t, size), 0)), w = Math.min(980, Math.max(...ws) + 110), h = lines.length * size * 1.3 + 40, x = (W - w) / 2, yy = y + rise;
    g.save(); g.globalAlpha = alpha; const box = rrectPts(x, yy, w, h, 30); M.cel(box, PAL.mustard, { w: 4, seed: 91, off: [9, 8], ink: false }); M.cel(box.map(p => [p[0] - 2, p[1] - 2]), PAL.paper2, { w: 4, seed: 92, off: [0, 0], reg: false });
    lines.forEach((l, i) => { let xx = (W - ws[i]) / 2; l.forEach(([t, c]) => { M.text(t, xx, yy + 20 + size * 1.05 + i * size * 1.3, { font: 'Jost', weight: 600, size, col: c || INK, align: 'left', reg: false }); xx += M.textW(t, size); }); });
    const rot = T * 1.8; M.sparkle(x + 36, yy + h / 2, 20, rot, PAL.tomato); M.sparkle(x + w - 36, yy + h / 2, 20, -rot, PAL.tomato); g.restore(); };

  // ── glove hands and the presenter ──
  const glove = (p, ang, kind, seed) => { // p: wrist point (local), pointing along +x after rotate
    g.save(); g.translate(p[0], p[1]); g.rotate(ang);
    const c = PAL.white, shapes = [];
    const part = (pts, sd) => M.cel(pts, c, { w: 3.4, seed: seed + sd, off: [4, 4] });
    if (kind === 'point') { part(capsulePts(26, -4, 80, -4, 17), 1); part(ellipsePts(22, 4, 30, 25), 2); part(ellipsePts(34, 17, 11, 11), 3); part(ellipsePts(52, 12, 11, 11), 4); part(ellipsePts(14, -24, 12, 12, 24, .6), 5); }
    else if (kind === 'open') { [-.55, -.18, .18, .55].forEach((a, i) => part(capsulePts(38, 0, 38 + Math.cos(a) * 44, Math.sin(a) * 44, 16), 6 + i)); part(ellipsePts(22, 0, 30, 28), 2); part(capsulePts(12, -22, 26, -50, 15), 12); }
    else { part(ellipsePts(22, 2, 31, 27), 2); part(ellipsePts(46, 4, 14, 22), 3); part(ellipsePts(16, -24, 12, 12, 24, .6), 5); }
    g.restore(); };
  const ik = (S, Tg, a, b, bend) => { let dx = Tg[0] - S[0], dy = Tg[1] - S[1], d = Math.hypot(dx, dy); const mx = a + b - 4; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; } d = Math.max(d, Math.abs(a - b) + 4);
    const c = (a * a + d * d - b * b) / (2 * a * d), ang = Math.atan2(dy, dx) + bend * Math.acos(Math.max(-1, Math.min(1, c))); return { E: [S[0] + Math.cos(ang) * a, S[1] + Math.sin(ang) * a], H: [S[0] + dx, S[1] + dy] }; };
  // o: {flip, hand:[wx,wy] world target of the acting (near) hand, kind, stick:[wx,wy], rest:[lx,ly] local target of the other hand, mouth 0..1, look:[dx,dy], blink, jacket, tie}
  M.presenter = (x, y, s, o = {}) => {
    const fl = o.flip ? -1 : 1, jacket = o.jacket || PAL.mustard, tie = o.tie || PAL.tomato; g.save(); g.translate(x, y); g.scale(fl * s, s);
    const toL = ([wx, wy]) => [(wx - x) / (fl * s), (wy - y) / s];
    const arm = (S, Tg, bend, kind, seed, stick) => { const { E, H } = ik(S, Tg, 128, 118, bend); const path = [...quad(S, [(S[0] + E[0]) / 2, (S[1] + E[1]) / 2], E, 6), ...quad(E, [(E[0] + H[0]) / 2, (E[1] + H[1]) / 2], H, 6).slice(1)];
      const th = tubePts(path, 44, 36); M.cel(th, jacket, { w: 4, seed, off: [6, 5] }); const ang = Math.atan2(H[1] - E[1], H[0] - E[0]);
      M.cel(ellipsePts(H[0] - Math.cos(ang) * 5, H[1] - Math.sin(ang) * 5, 14, 24, 20, ang), PAL.paper2, { w: 3, seed: seed + 5, off: [3, 3] });
      if (stick) { const st = toL(stick); M.cel(capsulePts(H[0] + Math.cos(ang) * 40, H[1] + Math.sin(ang) * 40, st[0], st[1], 10), PAL.hair, { w: 3, seed: seed + 6, off: [3, 3] }); M.cel(ellipsePts(st[0], st[1], 15, 15, 20), PAL.tomato, { w: 3.4, seed: seed + 7, off: [3, 3] }); }
      glove(H, ang, kind, seed + 10); };
    // back arm (resting, hand on hip)
    arm([-96, -232], o.rest || [-150, -80], 1, 'fist', 300);
    // legs + shoes
    [-1, 1].forEach((sd, i) => { const leg = rrectPts(sd * 44 - 36, -4, 72, 196, 12); M.cel(leg, PAL.plum, { w: 4, seed: 310 + i, off: [6, 5] }); M.cel(ellipsePts(sd * 44 + sd * 14, 204, 58, 24), PAL.hair, { w: 4, seed: 320 + i, off: [5, 5] }); });
    // torso
    const tor = [[-104, -258], [104, -258], [128, 6], [-128, 6]]; const torS = smooth(tor, 5, true);
    M.cel(torS, jacket, { w: 4.4, seed: 330, off: [8, 7], shade: { col: 'rgba(160,100,20,.30)', draw: gg => gg.fillRect(-300, -300, 215, 600) } });
    M.cel([[-36, -258], [36, -258], [0, -150]], PAL.white, { w: 3.6, seed: 331, off: [5, 4] });
    M.ink([[-60, -120], [-60, -30]], { w: 3, seed: 332 }); // jacket seam
    [[-14, -88], [-14, -42]].forEach(([bx, by], i) => M.cel(ellipsePts(bx, by, 8, 8, 14), PAL.paper2, { w: 3, seed: 333 + i, off: [3, 3] }));
    // neck, bow tie
    M.cel(rrectPts(-22, -300, 44, 52, 8), PAL.skin, { w: 3.6, seed: 340, off: [5, 4] });
    // head: an egg whose outline carries the nose
    const hc = [0, -392], head = Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2; let rx = 94, ry = 114; const bump = (o.nose ?? 14) * Math.exp(-Math.pow(Math.atan2(Math.sin(a - .1), Math.cos(a - .1)) / (o.noseW ?? .42), 2));
      const cx = Math.cos(a), cy = Math.sin(a), ex = 1 + (cy < 0 ? .0 : -.06 * cy); return [hc[0] + (rx + bump) * cx * ex, hc[1] + ry * cy]; });
    M.cel(head, PAL.skin, { w: 4.4, seed: 350, off: [7, 6] });
    M.cel(ellipsePts(-90, -388, 15, 22), PAL.skin, { w: 3.6, seed: 351, off: [4, 4] }); // ear
    // hair: flat cap with a quiff
    const hair = smooth([[-96, -392], [-92, -450], [-52, -500], [10, -512], [66, -498], [98, -452], [90, -420], [60, -444], [20, -452], [-30, -444], [-70, -418]], 6, true);
    M.cel(hair, PAL.hair, { w: 4, seed: 352, off: [6, 5] });
    // eyes
    const look = o.look || [0, 0];
    [[-12, -396, 1], [50, -396, .92]].forEach(([ex, ey, sc], i) => {
      if (o.blink) { M.ink(quad([ex - 15, ey], [ex, ey + 8], [ex + 15, ey], 6), { w: 4, seed: 360 + i, breaks: false }); return; }
      M.cel(ellipsePts(ex, ey, 17 * sc, 21 * sc), PAL.white, { w: 3.6, seed: 360 + i, off: [3, 3] });
      g.fillStyle = INK; g.beginPath(); g.arc(ex + look[0] * 8 + 3, ey + look[1] * 8, 8.5 * sc, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + look[0] * 8 + 6, ey + look[1] * 8 - 3, 2.6, 0, 7); g.fill(); });
    M.ink(quad([-32, -428 - (o.brow || 0) * 8], [-12, -440 - (o.brow || 0) * 12], [10, -430 - (o.brow || 0) * 8], 6), { w: 4.4, seed: 370, breaks: false });
    M.ink(quad([32, -428 - (o.brow || 0) * 8], [52, -439 - (o.brow || 0) * 12], [72, -428 - (o.brow || 0) * 8], 6), { w: 4.4, seed: 371, breaks: false });
    // mouth
    const m = o.mouth || 0, mx = 26, my = -326;
    if (m < .12) M.ink(quad([mx - 26, my - 4], [mx, my + 14], [mx + 30, my - 6], 8), { w: 4.6, seed: 380, breaks: false });
    else { const mp = ellipsePts(mx + 2, my + 4, 25, 8 + 22 * m, 28); g.save(); g.fillStyle = '#7a2b22'; g.beginPath(); mp.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fill(); g.clip(); g.fillStyle = '#e8837a'; g.beginPath(); g.ellipse(mx + 2, my + 8 + 22 * m, 17, 11 * m + 3, 0, 0, 7); g.fill(); g.restore(); M.ink(mp, { w: 4, seed: 381, closed: true, breaks: false }); }
    M.cel(ellipsePts(-22, -352, 14, 9), '#f0a08c', { w: 0, seed: 382, off: [0, 0], ink: false, reg: false }); // cheek
    // bow tie
    M.cel([[0, -248], [-46, -276], [-46, -222]], tie, { w: 3.6, seed: 390, off: [4, 4] }); M.cel([[0, -248], [46, -276], [46, -222]], tie, { w: 3.6, seed: 391, off: [4, 4] }); M.cel(ellipsePts(0, -248, 12, 13), tie, { w: 3.4, seed: 392, off: [3, 3] });
    // acting arm
    const ht = o.hand ? toL(o.hand) : [150, -80]; arm([96, -232], ht, 1, o.kind || 'open', 400, o.stick);
    g.restore(); };
  return M;
}
