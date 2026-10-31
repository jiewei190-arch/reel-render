// distilbook.js: template #15 handdrawn "Distilbook" (awesome-opus-5-5-video-styles/styles/handdrawn.md, Distilbook Motion
// Graphics Showreel). Look reproduced from the demo: a white sketchbook card floating on a pale grey studio frame with corner
// registration marks and tiny mono labels; ink diagrams drawn on with a fine wobbly pen, coloured-pencil hatching (yellow sun,
// blue water), handwritten labels with blue keywords, circled notes, dotted particles and curved arrows; a media-player bar
// inside the card; a karaoke caption under the card (spoken words dark, keywords blue, upcoming words grey).
// Works portrait (1080x1920) or landscape (1920x1080). Deterministic: everything is a pure function of t.
// Original code. Fonts: Patrick Hand (SIL OFL, fonts/), Inter (system).
export const TAU = Math.PI * 2;
export const C = { bg: '#e7e8ec', card: '#fdfdfb', ink: '#2b2b2e', soft: '#8a8d96', faint: '#c4c7ce', blue: '#3f5ff0', blueL: '#8fa6f5',
  water: '#6f8ff2', yel: '#f4cf2f', org: '#f29a38', red: '#e2574c', pink: '#f3a6a0', grn: '#58b07a', bone: '#e9dcc4', boneD: '#c9b48e' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const R = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const bo = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const HAND = '"Patrick Hand"', SANS = '"Inter"';

export function createDB(canvas, W, H) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d'); let B = 0, GA = 1;
  // paper grain tile
  const tile = document.createElement('canvas'); tile.width = tile.height = 200; const tg = tile.getContext('2d'); const im = tg.createImageData(200, 200);
  for (let i = 0; i < 40000; i++) { const v = 120 + hash(i * 1.37) * 100; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = hash(i * .71 + 2) * 16; }
  tg.putImageData(im, 0, 0); const grain = g.createPattern(tile, 'repeat');
  const D = { g, W, H, C };
  const J = (i, a) => (hash(i * 12.9898 + B * 1.618 + .5) - .5) * 2 * a;   // boil jitter, changes 12x per second
  D.begin = t => { B = Math.floor(t * 12); GA = 1; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); };
  D.alpha = a => { GA = a; }; D.A = () => GA;
  const rs = (pts, step = 18) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)); for (let k = 1; k <= n; k++) o.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); } return o; };
  const partial = (pts, draw) => { const L = [0]; for (let i = 1; i < pts.length; i++) L[i] = L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const tot = L[L.length - 1] * clamp(draw); const P = [pts[0]];
    for (let i = 1; i < pts.length; i++) { if (L[i] <= tot) P.push(pts[i]); else { const u = (tot - L[i - 1]) / (L[i] - L[i - 1] || 1); P.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } } return P; };
  // fine pen line: wobbly, boiling, drawn on with `draw`
  D.poly = (pts0, o = {}) => { const { col = C.ink, w = 3.2, draw = 1, seed = 0, amp = 1.1, alpha = 1, dash = null, close = false } = o; if (draw <= 0 || GA <= 0 || alpha <= 0) return;
    let pts = rs(close ? [...pts0, pts0[0]] : pts0); const P = partial(pts, draw);
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; if (dash) g.setLineDash(dash); g.strokeStyle = col; g.globalAlpha = GA * alpha; g.lineWidth = w; g.beginPath();
    P.forEach(([x, y], i) => { const jx = J(seed * 101 + i * 2, amp), jy = J(seed * 101 + i * 2 + 1, amp); i ? g.lineTo(x + jx, y + jy) : g.moveTo(x + jx, y + jy); }); g.stroke(); g.restore(); };
  const path = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  // flat soft wash (marker under the pencil)
  D.wash = (pts, col, alpha = .25) => { if (GA <= 0 || alpha <= 0) return; g.save(); g.globalAlpha = GA * alpha; g.fillStyle = col; path(pts); g.fill(); g.restore(); };
  // coloured-pencil hatching clipped to the shape; k reveals it (0..1)
  D.hatch = (pts, col, o = {}) => { const { ang = -.9, gap = 7, w = 2.2, alpha = .75, k = 1, seed = 0, wash = .18 } = o; if (k <= 0 || GA <= 0) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    g.save(); path(pts); g.clip(); if (wash) { g.globalAlpha = GA * wash * clamp(k * 1.5); g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.hypot(x1 - x0, y1 - y0) / 2 + 10;
    const ca = Math.cos(ang), sa = Math.sin(ang); const n = Math.ceil(2 * r / gap);
    for (let i = 0; i < n; i++) { const u = i / n; if (u > k) break; const off = -r + i * gap + (hash(i + seed * 31) - .5) * 3; const px = cx - sa * off, py = cy + ca * off;
      g.globalAlpha = GA * alpha * (.55 + .45 * hash(i * 3.1 + seed)); g.beginPath(); g.moveTo(px - ca * r, py - sa * r); g.lineTo(px + ca * r, py + sa * r); g.stroke(); }
    g.restore(); };
  const ellPts = (cx, cy, rx, ry, n = 0, rot = 0, a0 = 0, a1 = 1) => { n = n || Math.max(18, Math.round((rx + ry) / 5)); const P = []; for (let i = 0; i <= n; i++) { const a = rot + (a0 + (a1 - a0) * i / n) * TAU; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
  D.ellPts = ellPts;
  D.ell = (cx, cy, rx, ry, o = {}) => { if (o.fill) D.hatch(ellPts(cx, cy, rx, ry), o.fill, { k: o.fk == null ? 1 : o.fk, seed: o.seed || 0, ang: o.ang, gap: o.gap, alpha: o.fa }); D.poly(ellPts(cx, cy, rx, ry, 0, -1.3), o); };
  const rrPts = (x, y, w, h, r = 14) => { const P = []; const c = [[x + w - r, y + r, -.25], [x + w - r, y + h - r, 0], [x + r, y + h - r, .25], [x + r, y + r, .5]];
    c.forEach(([cx, cy, a0]) => { for (let i = 0; i <= 5; i++) { const a = (a0 + i * .05) * TAU; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); P.push(P[0]); return P; };
  D.rrPts = rrPts;
  D.rr = (x, y, w, h, r, o = {}) => { const P = rrPts(x, y, w, h, r); if (o.fill) D.hatch(P, o.fill, { k: o.fk == null ? 1 : o.fk, seed: o.seed || 0, ang: o.ang, gap: o.gap, alpha: o.fa }); D.poly(P, o); };
  D.line = (x0, y0, x1, y1, o = {}) => D.poly([[x0, y0], [x1, y1]], o);
  const qpts = (x0, y0, cx, cy, x1, y1, n = 24) => { const P = []; for (let i = 0; i <= n; i++) { const u = i / n; P.push([(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1]); } return P; };
  D.qpts = qpts;
  // curved arrow (quadratic), head appears at the end of the draw-on
  D.arrow = (x0, y0, x1, y1, o = {}) => { const { bend = 0, col = C.ink, w = 3.2, draw = 1, seed = 0, head = 16 } = o; if (draw <= 0) return;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1; const cx = mx + nx / L * bend, cy = my + ny / L * bend;
    const P = qpts(x0, y0, cx, cy, x1, y1); D.poly(P, { col, w, draw, seed, alpha: o.alpha });
    if (draw > .9) { const a = Math.atan2(y1 - cy, x1 - cx); D.poly([[x1 - Math.cos(a - .45) * head, y1 - Math.sin(a - .45) * head], [x1, y1], [x1 - Math.cos(a + .45) * head, y1 - Math.sin(a + .45) * head]], { col, w, seed: seed + 9, alpha: o.alpha }); } };
  // text. font 'hand' (default) or 'sans'. write: left-to-right reveal 0..1. kw: segments wrapped in ** are drawn blue
  D.font = (size, f = 'hand', wt = 400) => `${f === 'sans' ? wt : 400} ${size}px ${f === 'sans' ? SANS : HAND}`;
  D.measure = (s, size, f = 'hand', wt = 700) => { g.save(); g.font = D.font(size, f, wt); const w = g.measureText(s.replace(/\*\*/g, '')).width; g.restore(); return w; };
  D.txt = (s, x, y, o = {}) => { const { size = 40, col = C.ink, kcol = C.blue, align = 'left', f = 'hand', wt = 700, alpha = 1, write = 1, rot = 0, ls = 0 } = o; if (alpha <= 0 || GA <= 0 || write <= 0) return;
    g.save(); g.globalAlpha = GA * alpha; g.translate(x + J(77 + x, .5), y + J(78 + y, .5)); if (rot) g.rotate(rot); g.font = D.font(size, f, wt); g.textBaseline = 'middle'; if (ls) g.letterSpacing = ls + 'px';
    const parts = s.split('**'); const tw = g.measureText(s.replace(/\*\*/g, '')).width; let cx = align === 'center' ? -tw / 2 : align === 'right' ? -tw : 0;
    if (write < 1) { g.beginPath(); g.rect(cx - 4, -size, tw * write + 8, size * 2); g.clip(); }
    parts.forEach((p, i) => { g.fillStyle = i % 2 ? kcol : col; g.fillText(p, cx, 0); cx += g.measureText(p).width; }); g.restore(); };
  // multi-line text block, returns height
  D.lines = (arr, x, y, o = {}) => { const lh = (o.size || 40) * (o.lh || 1.18); arr.forEach((s, i) => D.txt(s, x, y + i * lh, { ...o, write: o.write == null ? 1 : clamp(o.write * arr.length - i) })); return arr.length * lh; };
  // circled note (demo: "A single drop can stay airborne for 10 days" in a hand circle)
  D.note = (x, y, r, arr, o = {}) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; D.poly(ellPts(x, y, r * (o.sx || 1), r, 0, -1.4), { w: 3, draw: ss(k * 1.6), seed: o.seed || 3 });
    const size = o.size || 30; const lh = size * 1.12; arr.forEach((s, i) => D.txt(s, x, y + (i - (arr.length - 1) / 2) * lh, { size, align: 'center', alpha: ss(R(k, .45, .4)) })); };
  D.drop = (x, y, r, o = {}) => { const P = []; for (let i = 0; i <= 26; i++) { const a = i / 26 * TAU; const k = Math.sin(a / 2); P.push([x + Math.sin(a) * r * (.15 + .85 * Math.pow(Math.abs(k), .6)) * Math.sign(Math.sin(a)) * .9, y - Math.cos(a) * r * 1.25 + r * .35]); }
    D.hatch(P, o.col || C.water, { k: 1, gap: 5, alpha: .8, seed: x, wash: .45 }); D.poly(P, { col: o.line || C.ink, w: 2.6, seed: x + y, alpha: o.alpha }); };
  D.dots = (x0, y0, x1, y1, n, o = {}) => { g.save(); g.globalAlpha = GA * (o.alpha == null ? 1 : o.alpha); g.fillStyle = o.col || C.ink; for (let i = 0; i < n; i++) { const u = hash(i * 1.7 + (o.seed || 0)), v = hash(i * 2.9 + 5 + (o.seed || 0)); g.beginPath(); g.arc(lerp(x0, x1, u), lerp(y0, y1, v), (o.r || 2.6) * (.6 + hash(i) * .6), 0, TAU); g.fill(); } g.restore(); };
  D.sun = (x, y, r, k = 1, t = 0) => { if (k <= 0) return; D.ell(x, y, r * ss(k), r * ss(k), { fill: C.yel, seed: 41, w: 3 }); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + t * .15; const kk = R(k, .3 + i * .05, .3); D.line(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3, x + Math.cos(a) * r * (1.3 + .45 * kk), y + Math.sin(a) * r * (1.3 + .45 * kk), { w: 3, seed: 50 + i, draw: kk }); } };
  D.moon = (x, y, r, k = 1) => { if (k <= 0) return; const P = [...ellPts(x, y, r, r, 30, 0, -.32, .32 + 0)].concat(ellPts(x + r * .45, y, r * .78, r * .82, 24, 0, .36, -.36)); g.save(); g.translate(x, y); g.scale(ss(k), ss(k)); g.translate(-x, -y);
    const Q = []; for (let i = 0; i <= 30; i++) { const a = (.25 + i / 30 * .5) * TAU; Q.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } for (let i = 0; i <= 24; i++) { const a = (.75 - i / 24 * .5) * TAU; Q.push([x - r * .35 + Math.cos(a) * r * .75, y + Math.sin(a) * r * .86]); }
    D.hatch(Q, C.yel, { seed: 7, gap: 6 }); D.poly(Q, { w: 3, seed: 61 }); g.restore(); };
  D.star = (x, y, r, k = 1) => { if (k <= 0) return; D.line(x - r * k, y, x + r * k, y, { w: 2.6, seed: x }); D.line(x, y - r * k, x, y + r * k, { w: 2.6, seed: y }); };
  D.check = (x, y, r, k = 1, col = C.grn) => { if (k > 0) D.poly([[x - r, y], [x - r * .3, y + r * .7], [x + r, y - r * .8]], { col, w: 5, draw: k, seed: 5 }); };
  D.bracket = (x, y0, y1, o = {}) => { const { side = 1, w = 3, draw = 1 } = o; const d = 16 * side; D.poly([[x, y0], [x + d, y0 + 10], [x + d, (y0 + y1) / 2 - 10], [x + d * 2, (y0 + y1) / 2], [x + d, (y0 + y1) / 2 + 10], [x + d, y1 - 10], [x, y1]], { w, draw, seed: 33 }); };
  // stick man: big white round head, single-line body and limbs, dot eyes. Origin = hip. pose: stand | lie | float | recline.
  // arm: down | point | pointL | wave | up | hips. face: smile | happy | o | worried | sleep. sq = vertical squash (1 = normal)
  D.person = (x, y, s, o = {}) => { const { pose = 'stand', sq = 1, k = 1, face = 'smile', seed = 0, col = C.ink, arm = 'down' } = o; if (k <= 0) return; g.save(); g.translate(x, y); g.scale(s, s);
    if (pose === 'lie') g.rotate(-Math.PI / 2); if (pose === 'float') g.rotate(Math.sin(seed) * .25 - .2); g.scale(1, sq);
    const al = ss(k); const op = { w: 5, col, seed: seed + 1, alpha: al, amp: .8 };
    const head = (hx, hy, r) => { D.wash(ellPts(hx, hy, r, r), '#ffffff', al); D.poly(ellPts(hx, hy, r, r, 0, -1.3), { ...op, seed: seed + 8 });
      const e = r * .32, ey = hy - r * .12; g.fillStyle = col; g.globalAlpha = GA * al;
      if (face === 'sleep') { D.line(hx - e - 7, ey, hx - e + 7, ey, { ...op, w: 3.6 }); D.line(hx + e - 7, ey, hx + e + 7, ey, { ...op, w: 3.6, seed: seed + 3 }); }
      else { g.beginPath(); g.arc(hx - e, ey, 4.2, 0, TAU); g.arc(hx + e, ey, 4.2, 0, TAU); g.fill(); }
      const my = hy + r * .38;
      if (face === 'smile' || face === 'sleep') D.poly(ellPts(hx, my - 8, 11, 8, 10, 0, .1, .4), { ...op, w: 3.6, seed: seed + 9 });
      else if (face === 'happy') { const P = ellPts(hx, my - 6, 15, 12, 12, 0, 0, .5); D.wash(P, col, al * .85); D.poly(P, { ...op, w: 3.6, seed: seed + 9 }); }
      else if (face === 'o') D.ell(hx, my, 6, 8, { ...op, w: 3.6, seed: seed + 9 });
      else if (face === 'worried') { D.poly([[hx - 12, my + 2], [hx - 4, my - 3], [hx + 4, my + 2], [hx + 12, my - 3]], { ...op, w: 3.4, seed: seed + 9 });
        D.line(hx - e - 9, ey - 14, hx - e + 6, ey - 10, { ...op, w: 3.2 }); D.line(hx + e + 9, ey - 14, hx + e - 6, ey - 10, { ...op, w: 3.2, seed: seed + 4 }); } };
    if (pose === 'recline') { // reclined on a wedge, knees raised
      D.poly([[-55, -50], [0, 0], [45, -48], [88, 0]], op); D.poly([[-40, -36], [-2, -14]], { ...op, seed: seed + 4 }); head(-82, -80, 32); g.restore(); return; }
    D.poly([[0, 0], [-18, 72]], { ...op, seed: seed + 2 }); D.poly([[0, 0], [18, 72]], { ...op, seed: seed + 3 });
    D.poly([[0, -86], [0, 0]], { ...op, seed: seed + 5 });
    const L = { down: [[-30, -18], [30, -18]], point: [[-30, -18], [78, -80]], pointL: [[-78, -80], [30, -18]], wave: [[-30, -18], [52, -148]], up: [[-52, -146], [52, -146]], hips: [[-26, -40, -40, -66], [26, -40, 40, -66]] }[arm] || [[-30, -18], [30, -18]];
    L.forEach((a, i) => { const pts = a.length === 4 ? [[0, -68], [a[2], a[3]], [a[0], a[1]]] : [[0, -68], a]; D.poly(pts, { ...op, seed: seed + 6 + i }); });
    head(0, -124, 38);
    g.restore(); };

  // ---------------- frame, card, player, caption ----------------
  const L = W > H ? { land: true, card: [70, 44, W - 140, 904], board: [100, 56, 850], side: [1010, 120, 800], cap: [960, 1000, 1560], bar: [110, 922, W - 220] }
                 : { land: false, card: [40, 330, 1000, 1150], board: [40, 340, 1000], cap: [540, 1610, 960], bar: [90, 1410, 900] };
  D.L = L;
  D.frame = (t, o) => { const [x, y, w, h] = L.card;
    // registration corners + mono labels (demo frame)
    g.save(); g.strokeStyle = 'rgba(40,40,46,.35)'; g.lineWidth = 2; const m = 26, c = 34;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([px, py, sx, sy]) => { g.beginPath(); g.moveTo(px, py + c * sy); g.lineTo(px, py); g.lineTo(px + c * sx, py); g.stroke(); });
    g.font = `600 ${L.land ? 15 : 19}px ${SANS}`; g.fillStyle = 'rgba(40,40,46,.55)'; g.letterSpacing = '2px'; g.textBaseline = 'middle';
    const ty = L.land ? 20 : 70; g.textAlign = 'left'; g.fillText('■ STICKMAN SKETCHBOOK', L.land ? 70 : 60, ty);
    g.textAlign = 'right'; g.fillText(o.right || '', W - (L.land ? 70 : 60), ty);
    const tc = s => { const m = Math.floor(s / 60), r = Math.floor(s % 60), f = Math.floor((s % 1) * 30); return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };
    g.textAlign = 'right'; g.fillText('TC ' + tc(t), W - (L.land ? 70 : 60), H - (L.land ? 14 : 60)); g.textAlign = 'left'; g.fillText(o.left || '', L.land ? 70 : 60, H - (L.land ? 14 : 60));
    g.restore();
    // card: shadow + white sheet + grain
    g.save(); g.shadowColor = 'rgba(30,30,40,.16)'; g.shadowBlur = 40; g.shadowOffsetY = 14; g.fillStyle = C.card; g.beginPath(); g.roundRect(x, y, w, h, 22); g.fill(); g.restore();
    g.save(); g.beginPath(); g.roundRect(x, y, w, h, 22); g.clip(); g.fillStyle = grain; g.fillRect(x, y, w, h); g.restore(); };
  // board transform: author boards in a 1000x1000 space
  D.enterBoard = () => { const [bx, by, bs] = L.board; g.save(); g.beginPath(); g.roundRect(L.card[0], L.card[1], L.card[2], L.card[3], 22); g.clip(); g.translate(bx, by); g.scale(bs / 1000, bs / 1000); };
  D.exitBoard = () => g.restore();
  D.player = (t, total, marks = []) => { const [x, y, w] = L.bar; g.save(); g.globalAlpha = 1; g.fillStyle = C.ink;
    // pause glyph
    g.fillRect(x, y - 11, 6, 22); g.fillRect(x + 12, y - 11, 6, 22);
    const x0 = x + 48, tw = 150, x1 = x + w - tw - 60; g.strokeStyle = C.faint; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    const u = clamp(t / total); g.strokeStyle = C.blue; g.beginPath(); g.moveTo(x0, y); g.lineTo(lerp(x0, x1, u), y); g.stroke();
    marks.forEach(m => { const mx = lerp(x0, x1, m / total); g.fillStyle = C.card; g.fillRect(mx - 2, y - 4, 4, 8); });
    g.fillStyle = C.card; g.strokeStyle = C.blue; g.lineWidth = 3; g.beginPath(); g.arc(lerp(x0, x1, u), y, 10, 0, TAU); g.fill(); g.stroke();
    const f = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; g.font = `600 ${L.land ? 22 : 24}px ${SANS}`; g.textAlign = 'right'; g.textBaseline = 'middle';
    g.fillStyle = C.ink; const tot = ' / ' + f(total); g.fillText(f(t), x1 + 40 + tw - g.measureText(tot).width + 10, y); g.fillStyle = C.soft; g.fillText(tot, x1 + 40 + tw + 10, y);
    // swatch stack (demo's tiny colour chips)
    [C.yel, C.blue, C.red, C.grn].forEach((c, i) => { g.fillStyle = c; g.fillRect(x + w - 6 + i * 0, y - 16 + i * 8, 22, 6); });
    g.restore(); };
  // karaoke caption below the card. cap uses **kw**. u = progress through the phrase (0..1); alpha fades
  D.caption = (cap, u, alpha = 1) => { if (alpha <= 0) return; const [cx, cy, mw] = L.cap; let size = L.land ? 46 : 66; const lh = 1.18;
    const words = []; cap.split('**').forEach((p, i) => { const sp0 = /^\s/.test(p); p.split(/\s+/).filter(Boolean).forEach((w, j) => { if (words.length && j === 0 && !sp0 && /^[^\w(]/.test(w)) words[words.length - 1].w += w; else words.push({ w, k: i % 2 === 1 }); }); });
    let lines; for (;;) { g.font = `800 ${size}px ${SANS}`; lines = [[]]; let lw = 0; const sp = g.measureText(' ').width;
      words.forEach(o => { const ww = g.measureText(o.w).width; if (lw + ww > mw && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(o); lw += ww + sp; });
      if (lines.length <= (L.land ? 2 : 3) || size < 34) break; size -= 3; }
    const nch = words.reduce((a, o) => a + o.w.length + 1, 0); let acc = 0; const sp = g.measureText(' ').width;
    g.save(); g.globalAlpha = alpha; g.font = `800 ${size}px ${SANS}`; g.textBaseline = 'middle'; g.letterSpacing = '-1px';
    const y0 = cy - (lines.length - 1) * size * lh / 2;
    lines.forEach((ln, li) => { const lw = ln.reduce((a, o) => a + g.measureText(o.w).width, 0) + sp * (ln.length - 1); let x = cx - lw / 2;
      ln.forEach(o => { const st = acc / nch; acc += o.w.length + 1; const on = u * 1.08 >= st; g.fillStyle = !on ? '#b9bcc4' : o.k ? C.blue : C.ink; g.fillText(o.w, x, y0 + li * size * lh); x += g.measureText(o.w).width + sp; }); });
    g.restore(); };
  return D;
}
