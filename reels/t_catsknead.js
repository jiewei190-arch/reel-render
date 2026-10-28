// Why do cats knead? — template #26 doodle room (garmdotcom "Headroom" demo): a one-point sketched room on mottled kraft paper,
// wobbly ink outlines over watercolour fills, a meter on the side wall that fills and drains, tape labels, notes that fly in
// over the room, and a red rubber stamp. Here the room is the cat's world: the wall meter is milk, then comfort; the poster
// becomes the running list of theories; notes fly in for the close-ups (paw pads, wild grass bed, vet clipboard).
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let g = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const fr = x => x - Math.floor(x), hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const INK = '#241d18', WALL = '#f2e6cb', SIDE = '#e6d3ad', CEIL = '#e3cfa6', FLOOR = '#d7a67b', TILE = '#a97b57';
const ORANGE = '#e58c50', ORD = '#bf6634', TEAL = '#3f8f88', MINT = '#a6d9ce', MUST = '#dba643', MUSD = '#b4852c', RED = '#d4473c',
  BLUE = '#4d6a8e', PINK = '#eba5a1', SKIN = '#f1c8a2', CREAM = '#f8f0dd', HAIR = '#5b3b28', GREY = '#9a958c', SKY = '#a9cfe2', GREEN = '#5f9a5c';
let ST = 0, T = 0, Z = 1;                // ST: 12 fps step (the line boil), T: seconds

// ---------- drawing kit: catmull-rom outlines, wobbly ink, watercolour fills ----------
function cr(P, closed = true, n = 7) { const o = [], L = P.length, m = closed ? L : L - 1;
  for (let i = 0; i < m; i++) { const p0 = P[(i - 1 + L) % L], p1 = P[i], p2 = P[(i + 1) % L], p3 = P[(i + 2) % L];
    const a = (!closed && i === 0) ? p1 : p0, d = (!closed && i === L - 2) ? p2 : p3;
    for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t;
      o.push([.5 * (2 * p1[0] + (-a[0] + p2[0]) * t + (2 * a[0] - 5 * p1[0] + 4 * p2[0] - d[0]) * t2 + (-a[0] + 3 * p1[0] - 3 * p2[0] + d[0]) * t3),
              .5 * (2 * p1[1] + (-a[1] + p2[1]) * t + (2 * a[1] - 5 * p1[1] + 4 * p2[1] - d[1]) * t2 + (-a[1] + 3 * p1[1] - 3 * p2[1] + d[1]) * t3)]); } }
  o.push(closed ? o[0] : P[L - 1]); return o; }
const dens = (P, closed, step = 9) => { const o = []; const n = closed ? P.length : P.length - 1; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % P.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.ceil(d / step)); for (let j = 0; j < m; j++) o.push([lerp(a[0], b[0], j / m), lerp(a[1], b[1], j / m)]); } o.push(closed ? P[0] : P[P.length - 1]); return o; };
const ell = (x, y, rx, ry, n = 44, a0 = 0, a1 = TAU) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [x + Math.cos(a) * rx, y + Math.sin(a) * ry]; });
const rr = (x, y, w, h, r = 18) => { const o = []; const c = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]; c.forEach(([cx, cy, a]) => { for (let i = 0; i <= 6; i++) { const b = a + i / 6 * Math.PI / 2; o.push([cx + Math.cos(b) * r, cy + Math.sin(b) * r]); } }); return dens(o, true); };
const poly = P => dens(P, true);
function path(P, jx = 0, seed = 1) { g.beginPath(); P.forEach(([x, y], i) => { const dx = jx ? (hash(seed + i * 1.7) - .5) * jx : 0, dy = jx ? (hash(seed * 3 + i * 2.3) - .5) * jx : 0; i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy); }); }
function ink(P, o = {}) { const k = o.k ?? 1; if (k <= 0 || P.length < 2) return; const seed = o.seed || 1, j = o.j ?? 1.3, b = Math.floor(ST / 3) * 17.3, m = k < 1 ? Math.max(2, Math.ceil(P.length * k)) : P.length;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = o.col || INK; g.globalAlpha *= o.a ?? 1;
  for (const [w, sd, al] of [[o.w || 4.6, seed, 1], [(o.w || 4.6) * .4, seed + 50, .45]]) { g.lineWidth = w; g.globalAlpha *= al; g.beginPath();
    for (let i = 0; i < m; i++) { const [x, y] = P[i]; const dx = (hash(sd * 7.1 + i * .37 + b) - .5) * j + Math.sin(i * .21 + sd) * j * .9, dy = (hash(sd * 3.3 + i * .53 + b) - .5) * j + Math.cos(i * .17 + sd) * j * .9; i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy); }
    g.stroke(); }
  g.restore(); }
function wc(P, col, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; path(P, 2.5, o.seed || 3); g.closePath(); g.fillStyle = col; g.fill(); g.clip();   // watercolour: flat wash, darker pooled edge, soft light bloom
  path(P); g.closePath(); g.lineWidth = 16; g.strokeStyle = 'rgba(70,35,10,.14)'; g.stroke();
  if (!o.flat) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; P.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    const gr = g.createRadialGradient(lerp(x0, x1, .35), lerp(y0, y1, .3), 0, lerp(x0, x1, .35), lerp(y0, y1, .3), Math.max(x1 - x0, y1 - y0) * .7); gr.addColorStop(0, 'rgba(255,250,235,.22)'); gr.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  g.restore(); }
function shape(P, col, o = {}) { if (col) wc(P, col, o); if (!o.noink) ink(P, o); }
function tube(P, col, w, o = {}) { const Q = cr(P, false, 6); g.save(); g.globalAlpha *= o.a ?? 1; g.lineCap = 'round'; g.lineJoin = 'round'; path(Q); g.strokeStyle = INK; g.lineWidth = w + 9; g.stroke(); path(Q); g.strokeStyle = col; g.lineWidth = w; g.stroke(); g.restore(); }
function txt(str, x, y, size, o = {}) { const k = o.k ?? 1; if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 3) * (o.a ?? 1); g.font = `${o.wt || 700} ${size}px ${o.f || 'KalB'}`; g.textAlign = o.align || 'center'; g.fillStyle = o.col || INK; if (o.rot) { g.translate(x, y); g.rotate(o.rot); g.fillText(str, 0, 0); } else g.fillText(str, x, y); g.restore(); }
function heart(x, y, r, col, o = {}) { const P = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; P.push([x + r * 16 * Math.pow(Math.sin(a), 3) / 16, y - r * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); } shape(P, col, { w: 3.5, ...o }); }
function arrow(x0, y0, x1, y1, o = {}) { const k = o.k ?? 1; if (k <= 0) return; const bend = o.bend || 0, mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend; const P = cr([[x0, y0], [mx, my], [x1, y1]], false, 12); ink(P, { ...o, k }); if (k >= .98) { const [ax, ay] = P[P.length - 3], a = Math.atan2(y1 - ay, x1 - ax); ink([[x1 - 24 * Math.cos(a - .5), y1 - 24 * Math.sin(a - .5)], [x1, y1], [x1 - 24 * Math.cos(a + .5), y1 - 24 * Math.sin(a + .5)]], o); } }

// ---------- the mottled kraft paper (built once, multiplied over every frame) ----------
const TX = document.createElement('canvas'); TX.width = W; TX.height = H; { const c = TX.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 1300; i++) { const x = hash(i * 1.3) * W, y = hash(i * 2.9 + 4) * H, r = 30 + hash(i * 5.1) * 120, dark = hash(i * 7.7) < .62; const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, dark ? 'rgba(150,110,60,.045)' : 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(150,110,60,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  const id = c.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (hash(i * .013) - .5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; } c.putImageData(id, 0, 0); }

// ---------- the room (one-point perspective, vanishing point at the back wall centre) ----------
const VP = [540, 775], BX0 = 150, BX1 = 930, BY0 = 470, BY1 = 1080;
const onLine = (c, x) => VP[1] + (c[1] - VP[1]) * (x - VP[0]) / (c[0] - VP[0]);
function room(o) { const XL = -420, XR = 1500;
  wc(poly([[XL, -600], [XR, -600], [XR, onLine([BX1, BY0], XR)], [BX1, BY0], [BX0, BY0], [XL, onLine([BX0, BY0], XL)]]), CEIL, { flat: 1 });
  wc(poly([[XL, onLine([BX0, BY0], XL)], [BX0, BY0], [BX0, BY1], [XL, onLine([BX0, BY1], XL)]]), SIDE, { flat: 1 });
  wc(poly([[XR, onLine([BX1, BY0], XR)], [BX1, BY0], [BX1, BY1], [XR, onLine([BX1, BY1], XR)]]), SIDE, { flat: 1 });
  const FL = poly([[XL, onLine([BX0, BY1], XL)], [BX0, BY1], [BX1, BY1], [XR, onLine([BX1, BY1], XR)], [XR, 2600], [XL, 2600]]); wc(FL, FLOOR, { flat: 1 });
  wc(rr(BX0, BY0, BX1 - BX0, BY1 - BY0, 2), WALL, { flat: 1 });
  g.save(); path(FL); g.closePath(); g.clip();                                     // floor tiles toward the vanishing point
  for (let i = -8; i <= 18; i++) { const x0 = BX0 + i * 78, x1 = VP[0] + (x0 - VP[0]) * (2600 - VP[1]) / (BY1 - VP[1]); ink(dens([[x0, BY1], [x1, 2600]], false, 20), { w: 2.2, col: TILE, a: .55, seed: 600 + i, j: .8 }); }
  for (let k = 1; k < 8; k++) { const y = VP[1] + 305 / (1 - k * .118); if (y > 2600) break; ink(dens([[XL, y], [XR, y]], false, 30), { w: 2.2, col: TILE, a: .55, seed: 640 + k, j: .8 }); }
  g.restore();
  for (const c of [[BX0, BY0], [BX0, BY1]]) ink(dens([[XL, onLine(c, XL)], c], false, 16), { seed: 660 + c[1], w: 5.2 });
  for (const c of [[BX1, BY0], [BX1, BY1]]) ink(dens([c, [XR, onLine(c, XR)]], false, 16), { seed: 670 + c[1], w: 5.2 });
  ink(rr(BX0, BY0, BX1 - BX0, BY1 - BY0, 2), { seed: 680, w: 5.2 });
  ink(dens([[BX0 + 4, BY1 - 16], [BX1 - 4, BY1 - 16]], false, 20), { seed: 681, w: 2.4, a: .6 });   // skirting
  win(o); lamp(o); poster(o); meter(o); plant(); rug(o); }
function win(o) { wc(rr(205, 560, 175, 165, 4), o.night ? '#3d4d6e' : SKY, { flat: 1 }); g.save(); path(rr(205, 560, 175, 165, 4)); g.clip();
  if (!o.night) { shape(ell(330, 600, 22, 22), '#f1d06a', { w: 3, seed: 701 }); shape(cr([[240, 650], [262, 628], [292, 632], [306, 618], [332, 630], [336, 652]], true, 5), '#fdfaf2', { w: 3, seed: 702 }); }
  else for (let i = 0; i < 6; i++) txt('·', 220 + hash(i) * 150, 590 + hash(i + 9) * 110, 40, { col: '#f5edd2' });
  if (o.peek) { const k = o.peek; g.save(); g.translate(300, 760 - 90 * k); cat(0, 0, .62, { eyes: 'open', col: GREY, tail: 0, nobody: 1 }); g.restore(); }
  g.restore(); shape(rr(198, 553, 189, 179, 4), null, { seed: 703, w: 6 }); ink(dens([[292, 556], [292, 728]], false), { seed: 704, w: 4 }); ink(dens([[202, 642], [384, 642]], false), { seed: 705, w: 4 });
  ink(dens([[190, 738], [398, 738]], false), { seed: 706, w: 5 }); }
function lamp(o) { const on = o.lamp ?? 1; ink(dens([[540, BY0], [540, 548]], false), { seed: 710, w: 2.6 });
  if (on > 0) { const gr = g.createRadialGradient(540, 600, 0, 540, 600, 230); gr.addColorStop(0, `rgba(255,228,140,${.5 * on})`); gr.addColorStop(1, 'rgba(255,228,140,0)'); g.fillStyle = gr; g.fillRect(300, 380, 480, 460); }
  shape(poly([[510, 548], [570, 548], [594, 594], [486, 594]]), MUST, { seed: 711 }); shape(ell(540, 600, 10, 6, 16), on > .5 ? '#fff7d6' : '#cfc6b0', { seed: 712, w: 3 }); }
function poster(o) { shape(rr(690, 530, 200, 255, 4), CREAM, { seed: 720, w: 5 }); const kind = o.poster || 'home';
  if (kind === 'home') { heart(790, 650, 56, '#e98c7c', { seed: 721 }); }
  if (kind === 'kitten') { cat(790, 690, .52, { eyes: 'happy', tail: 0, nobody: 1 }); txt('day 1', 790, 760, 38, { rot: -.05 }); }
  if (kind === 'list') { const L = o.list || 0; txt('theories', 790, 576, 34, { col: ORD }); ink(dens([[722, 590], [858, 590]], false), { seed: 722, w: 2.5 });
    [['1 comfort', 1], ['2 scent', 2], ['3 bed', 3]].forEach(([w, n], i) => { if (L >= n) { txt(w, 712, 640 + i * 58, 34, { align: 'left', k: clamp(o.listK?.[i] ?? 1) }); if (o.ticks > i) ink(cr([[836, 624 + i * 58], [848, 638 + i * 58], [874, 600 + i * 58]], false, 5), { seed: 730 + i, col: TEAL, w: 5 }); } }); } }
function meter(o) { if (Z > 1.02) return; const v = clamp(o.meter ?? .5), x = 58, y = 600, w = 84, h = 250; shape(rr(x + 26, y - 14, 32, 18, 4), GREY, { seed: 740, w: 3.4 }); shape(rr(x, y, w, h, 16), CREAM, { seed: 741 });
  const n = 5, on = Math.round(v * n * 10) / 10; for (let i = 0; i < n; i++) { const f = clamp(on - i); if (f <= 0) continue; const yy = y + h - 14 - (i + 1) * 45; shape(rr(x + 12, yy + 45 * (1 - f) + 4, w - 24, 37 * f, 8), o.mcol || TEAL, { seed: 742 + i, w: 3, a: .95 }); }
  if (v < .12) ink(rr(x, y, w, h, 16), { col: RED, seed: 749, w: 4 });
  txt(o.mlabel || 'comfort', x + w / 2 + 2, y + h + 54, 34, { rot: -.03 }); }   // label kept >= 40 px from the frame edge
function plant() { shape(poly([[958, 1252], [1046, 1252], [1036, 1348], [968, 1348]]), '#d8723f', { seed: 750 }); ink(dens([[952, 1262], [1052, 1262]], false), { seed: 751, w: 4 });
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .26 + Math.sin(T * 1.3 + i) * .03, L = 150 - Math.abs(i - 3) * 22; const bx = 1002, by = 1252; shape(cr([[bx - 9, by], [bx + Math.cos(a) * L * .5 - 10, by + Math.sin(a) * L * .5], [bx + Math.cos(a) * L, by + Math.sin(a) * L], [bx + Math.cos(a) * L * .5 + 10, by + Math.sin(a) * L * .5], [bx + 9, by]], true, 4), TEAL, { seed: 752 + i, w: 3.4 }); } }
function rug(o) { shape(ell(540, 1530, 400, 92), '#c8907a', { seed: 760 }); ink(ell(540, 1530, 340, 70), { seed: 761, w: 3, a: .7 }); ink(ell(540, 1530, 280, 50), { seed: 762, w: 3, a: .5 });
  const yx = 250 + 40 * Math.sin(T * .7); shape(ell(yx, 1600, 48, 44), '#8ab0d8', { seed: 763 }); for (let i = 0; i < 4; i++) ink(ell(yx, 1600, 40 - i * 9, 36 - i * 8, 20, i, i + 3.6), { seed: 764 + i, w: 2.6 });
  ink(cr([[yx + 44, 1612], [yx + 120, 1640], [yx + 190, 1622], [yx + 260, 1650]], false, 8), { seed: 769, w: 3, col: '#5f86b4' });
  const mx = 800, my = 1650; shape(cr([[mx - 50, my], [mx - 20, my - 34], [mx + 30, my - 30], [mx + 52, my], [mx, my + 14]], true, 5), GREY, { seed: 770 }); shape(ell(mx - 18, my - 36, 12, 12, 14), PINK, { seed: 771, w: 3 }); ink(cr([[mx + 52, my], [mx + 90, my - 20], [mx + 120, my + 6]], false, 6), { seed: 772, w: 3 }); }

// ---------- characters ----------
function cat(x, y, sc, o = {}) { g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha *= o.a ?? 1; const col = o.col || ORANGE, dk = o.col ? '#6f6a62' : ORD, kn = o.knead ?? 0, wig = o.purr ? Math.sin(T * 40) * 1.6 : 0;
  const ph = T * TAU * 1.5 + 1.3, p1 = kn * 14 * Math.max(0, Math.sin(ph)), p2 = kn * 14 * Math.max(0, Math.sin(ph + Math.PI));
  if (!o.nobody) { if (o.tail !== 0) ink(cr([[62, 40], [112, 20], [124, -30], [104, -62 + 8 * Math.sin(T * 2)]], false, 8), { seed: 801, w: 15, col: INK }), ink(cr([[62, 40], [112, 20], [124, -30], [104, -62 + 8 * Math.sin(T * 2)]], false, 8), { seed: 801, w: 8, col }, g);
    shape(ell(wig, 22, 80, 47), col, { seed: 802 }); for (let i = 0; i < 3; i++) ink(cr([[-36 + i * 30, -10], [-30 + i * 30, 10], [-36 + i * 30, 30]], false, 5), { seed: 803 + i, w: 5, col: dk });
    for (const [px, pp, sd] of [[-26, p1, 810], [26, p2, 820]]) { const py = 56 + pp; shape(ell(px, py, 20, 15, 20), col, { seed: sd, w: 3.6 });
      if (pp > 6 || o.claws) { for (let t = -1; t <= 1; t++) ink([[px + t * 9, py + 12], [px + t * 11, py + 22]], { seed: sd + t + 3, w: 2.6 }); }
      ink([[px - 6, py + 6], [px - 6, py + 13]], { seed: sd + 7, w: 2.4 }); ink([[px + 6, py + 6], [px + 6, py + 13]], { seed: sd + 8, w: 2.4 });
      if (pp > 9 && o.marks !== 0) { ink(ell(px, py + 26, 26, 6, 14, .2, Math.PI - .2), { seed: sd + 9, w: 2.6, a: .7 }); } } }
  shape(poly([[-46, -66], [-38, -116], [-8, -90]]), col, { seed: 830 }); shape(poly([[46, -66], [38, -116], [8, -90]]), col, { seed: 831 });
  wc(poly([[-38, -76], [-35, -104], [-17, -88]]), PINK, { flat: 1 }); wc(poly([[38, -76], [35, -104], [17, -88]]), PINK, { flat: 1 });
  shape(ell(wig * .5, -52, 52, 45), col, { seed: 832 }); ink(cr([[-12, -94], [-8, -82], [-4, -94]], false, 3), { seed: 833, w: 3.5, col: dk }); ink(cr([[4, -94], [8, -82], [12, -94]], false, 3), { seed: 834, w: 3.5, col: dk });
  const e = o.eyes || 'happy';
  for (const ex of [-19, 19]) { if (e === 'happy') ink(cr([[ex - 10, -50], [ex, -60], [ex + 10, -50]], false, 4), { seed: 840 + ex, w: 4.5 });
    else if (e === 'sly') { shape(ell(ex, -54, 10, 6, 16), '#e9d36a', { seed: 845 + ex, w: 3 }); ink(dens([[ex - 13, -58], [ex + 12, -56]], false), { seed: 846 + ex, w: 4.5 }); wc(ell(ex + 1, -54, 2.5, 5, 10), INK, { flat: 1 }); }
    else { const r = e === 'wide' ? 13 : 10; shape(ell(ex, -54, r, r + 1, 18), INK, { seed: 850 + ex, w: 2 }); wc(ell(ex - 3, -58, 3.5, 3.5, 10), '#fff', { flat: 1 }); } }
  shape(poly([[-7, -38], [7, -38], [0, -30]]), PINK, { seed: 860, w: 2.6 }); ink(cr([[-12, -24], [-6, -20], [0, -26], [6, -20], [12, -24]], false, 3), { seed: 861, w: 3 });
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) ink([[sx * 26, -32 + i * 7], [sx * 70, -40 + i * 12]], { seed: 870 + i + sx * 5, w: 2, a: .8 });
  wc(ell(-30, -36, 9, 5, 12), 'rgba(235,130,120,.45)', { flat: 1 }); wc(ell(30, -36, 9, 5, 12), 'rgba(235,130,120,.45)', { flat: 1 });
  if (o.purr) for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) ink(cr([[sx * (100 + i * 22), -10], [sx * (108 + i * 22), 10], [sx * (100 + i * 22), 30]], false, 4), { seed: 880 + i + sx, w: 3.4, a: .5 + .5 * Math.sin(T * 9 + i) });
  g.restore(); }
function person(o = {}) { const pet = o.pet ? Math.sin(T * 2.2) * 22 : 0;
  shape(poly([[470, 790], [610, 790], [642, 958], [438, 958]]), TEAL, { seed: 900 }); shape(rr(468, 940, 144, 60, 16), BLUE, { seed: 901 });
  shape(rr(478, 990, 52, 84, 10), BLUE, { seed: 902 }); shape(rr(550, 990, 52, 84, 10), BLUE, { seed: 903 }); shape(ell(500, 1080, 36, 14, 18), INK, { seed: 904, w: 2 }); shape(ell(580, 1080, 36, 14, 18), INK, { seed: 905, w: 2 });
  shape(ell(540, 725, 60, 62), SKIN, { seed: 906 }); shape(cr([[478, 732], [474, 680], [512, 652], [566, 654], [604, 684], [602, 732], [590, 702], [562, 690], [532, 704], [502, 694]], true, 4), HAIR, { seed: 907 });
  shape(ell(482, 734, 9, 14, 14), SKIN, { seed: 908, w: 3 }); shape(ell(598, 734, 9, 14, 14), SKIN, { seed: 909, w: 3 });
  for (const ex of [517, 563]) { ink(ell(ex, 732, 17, 17, 22), { seed: 910 + ex, w: 3.4 }); const look = o.look === 'down' ? 6 : 0; wc(ell(ex + (o.look === 'cam' ? 0 : 1), 733 + look, 4, 4, 10), INK, { flat: 1 }); }
  ink([[534, 731], [546, 731]], { seed: 912, w: 3 }); wc(ell(500, 754, 11, 7, 12), 'rgba(235,130,120,.5)', { flat: 1 }); wc(ell(580, 754, 11, 7, 12), 'rgba(235,130,120,.5)', { flat: 1 });
  if (o.mouth === 'o') shape(ell(540, 764, 7, 9, 14), '#7a3a30', { seed: 913, w: 3 }); else ink(cr([[524, 760], [540, 768], [556, 760]], false, 4), { seed: 913, w: 3.4 });
  o.drawLap?.(); tube([[474, 806], [436, 880], [494 + pet, 902]], TEAL, 34, {}); shape(ell(500 + pet, 904, 17, 15, 16), SKIN, { seed: 915, w: 3.4 });
  tube([[606, 806], [644, 880], [606, 920]], TEAL, 34, {}); shape(ell(600, 922, 17, 15, 16), SKIN, { seed: 916, w: 3.4 }); }
function couch() { shape(rr(300, 828, 480, 140, 26), MUST, { seed: 920 }); shape(rr(290, 946, 500, 66, 18), MUST, { seed: 921 }); ink(dens([[540, 834], [540, 950]], false), { seed: 922, w: 3, a: .6 });
  shape(rr(252, 878, 80, 160, 28), MUSD, { seed: 923 }); shape(rr(748, 878, 80, 160, 28), MUSD, { seed: 924 }); shape(rr(272, 1036, 22, 40, 4), INK, { seed: 925, w: 2 }); shape(rr(786, 1036, 22, 40, 4), INK, { seed: 926, w: 2 }); }
function mom(lt, o = {}) { const br = Math.sin(T * 2) * 3;   // mother cat lying on her side in the basket, belly to us
  ink(cr([[700, 900], [770, 880], [790, 830], [770, 800 + 6 * Math.sin(T * 1.5)]], false, 8), { seed: 940, w: 16 }); ink(cr([[700, 900], [770, 880], [790, 830], [770, 800 + 6 * Math.sin(T * 1.5)]], false, 8), { seed: 940, w: 8, col: ORANGE });
  shape(ell(560, 905 - br, 180, 64 + br), ORANGE, { seed: 941 }); wc(ell(560, 940 - br, 140, 28), '#f6d7b0', { flat: 1 }); for (let i = 0; i < 4; i++) ink(cr([[470 + i * 52, 850], [480 + i * 52, 870], [470 + i * 52, 888]], false, 4), { seed: 942 + i, w: 5, col: ORD });
  g.save(); g.translate(368, 872); g.rotate(-.22); cat(0, 0, .9, { nobody: 1, eyes: o.eyes || 'happy' }); g.restore(); }
function kitten(x, y, c, seed, kn) { const ph = T * TAU * 2 + seed, a = kn * 12 * Math.max(0, Math.sin(ph)), b = kn * 12 * Math.max(0, Math.sin(ph + Math.PI));
  shape(ell(x, y + 10, 36, 26, 24), c, { seed, w: 3.6 }); shape(ell(x - 12, y - 30 - a, 9, 8, 12), c, { seed: seed + 1, w: 3 }); shape(ell(x + 12, y - 30 - b, 9, 8, 12), c, { seed: seed + 2, w: 3 });
  shape(ell(x, y - 14, 25, 22, 22), c, { seed: seed + 3, w: 3.6 }); shape(poly([[x - 22, y - 22], [x - 18, y - 44], [x - 6, y - 32]]), c, { seed: seed + 4, w: 3 }); shape(poly([[x + 22, y - 22], [x + 18, y - 44], [x + 6, y - 32]]), c, { seed: seed + 5, w: 3 });
  ink([[x - 12, y - 14], [x - 5, y - 13]], { seed: seed + 6, w: 3 }); ink([[x + 5, y - 13], [x + 12, y - 14]], { seed: seed + 7, w: 3 }); shape(poly([[x - 3, y - 6], [x + 3, y - 6], [x, y - 2]]), PINK, { seed: seed + 8, w: 2 });
  if (a > 8) ink(ell(x - 12, y - 44 - a, 14, 4, 10, Math.PI + .3, TAU - .3), { seed: seed + 9, w: 2.4, a: .7 }); if (b > 8) ink(ell(x + 12, y - 44 - b, 14, 4, 10, Math.PI + .3, TAU - .3), { seed: seed + 10, w: 2.4, a: .7 }); }
function basket(part) { if (part === 0) { shape(ell(540, 975, 300, 78), '#8b6a3c', { seed: 960 }); return; }
  const Q = poly([...ell(540, 985, 300, 44, 30, Math.PI, 0), [808, 1084], [272, 1084]]);
  shape(Q, MUST, { seed: 961 }); g.save(); path(Q); g.closePath(); g.clip(); for (let i = 0; i < 14; i++) ink(dens([[262 + i * 42, 1000], [270 + i * 40, 1084]], false, 12), { seed: 962 + i, w: 2.6, col: MUSD }); for (let j = 0; j < 3; j++) ink(dens([[240, 1010 + j * 24], [840, 1010 + j * 24]], false, 20), { seed: 980 + j, w: 2.4, col: MUSD, a: .8 }); g.restore();
  ink(ell(540, 985, 300, 44, 40, Math.PI, 0), { seed: 985, w: 6 }); }
function note(x, y, w, h, rot, k, fn, o = {}) { if (k <= 0) return; const e = eo(k); g.save(); g.translate(x + w / 2, y + h / 2 + (1 - e) * 600); g.rotate(rot * (1 + (1 - e) * 3)); g.translate(-(x + w / 2), -(y + h / 2));
  g.save(); g.shadowColor = 'rgba(60,40,20,.28)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = o.col || CREAM; path(rr(x, y, w, h, 6)); g.fill(); g.restore(); shape(rr(x, y, w, h, 6), o.col || CREAM, { seed: o.seed || 990, w: 4, flat: 1 });
  if (!o.notape) for (const [tx, ty, tr] of [[x + 30, y - 12, -.25], [x + w - 110, y - 10, .2]]) { g.save(); g.translate(tx + 40, ty + 14); g.rotate(tr); g.fillStyle = 'rgba(232,206,130,.85)'; g.fillRect(-46, -15, 92, 30); g.restore(); }
  fn(); g.restore(); }
function scent(x, y, r, a, seed) { if (a <= 0) return; ink(cr([[x - r, y + r * .2], [x - r * .4, y - r * .5], [x + r * .2, y - r * .1], [x - r * .1, y + r * .3], [x + r * .5, y + r * .4], [x + r, y - r * .3]], false, 6), { seed, col: '#2f8f7f', w: 6.5, a }); }

// ---------- scenes: each returns the room state; drawing in world space, notes in screen space ----------
const SC = [], N = PH.length;
const START = PH.map(p => p.start); START[0] = 0;
const CAM = { 0: [2.0, 540, 930], 1: [1.2, 540, 880], 2: [1.06, 540, 890], 3: [1.15, 540, 920], 4: [1.7, 540, 950], 5: [1.0, 520, 900], 6: [1.3, 520, 900], 7: [1.0, 540, 900],
  8: [1.3, 540, 900], 9: [1.0, 540, 900], 10: [1.0, 540, 900], 11: [1.38, 540, 920], 12: [1.12, 540, 900], 13: [1.0, 540, 900], 14: [1.0, 540, 900], 15: [1.3, 540, 935], 16: [1.0, 540, 900],
  17: [1.0, 540, 900], 18: [1.0, 540, 900], 19: [1.36, 540, 940], 20: [1.55, 540, 880], 21: [1.0, 540, 900] };
const TITLE = ['kneading', 'why?', 'making biscuits', 'day 1', 'push, push', 'milk on', 'oxytocin', 'all at once', 'never stopped', 'neoteny', 'theory #1', 'prrrr', 'theory #2', 'paw pads', 'pheromones',
  'invisible label', 'theory #3', 'safe + claimed', 'when to check', 'blanket trick', 'biscuits?', ''];
const METER = [.35, .45, .5, .1, .25, .7, .9, 1, .55, .65, .95, 1, .8, .8, .8, .85, .85, 1, .6, .9, 1, 1];
const NURSERY = k => k >= 3 && k <= 7;
let MLAB = 'comfort';
function lapScene(k, lt, o = {}) { const grow = o.grow ?? 1; couch();   // the cat goes on the lap before the arms, so the hands rest on it
  person({ pet: o.pet, look: o.look, mouth: o.mouth, drawLap: () => { o.drawLap?.(); cat(540, 915 + (1 - grow) * 40, lerp(.5, 1.18, grow), { knead: o.knead ?? 1, eyes: o.eyes, purr: o.purr, claws: o.claws }); } }); }
function world(k, lt, t) { const o = { meter: lerp(METER[Math.max(0, k - 1)], METER[k], eo(lt / 1.2)), mlabel: MLAB, poster: 'home', lamp: 1 };
  if (k >= 3 && k <= 7) { o.mlabel = 'milk'; o.mcol = '#e9e3d0'; o.poster = 'kitten'; }
  if (k >= 10 && k <= 20) { o.poster = 'list'; o.list = k >= 16 ? 3 : k >= 12 ? 2 : 1; o.listK = [k === 10 ? (lt - .6) / .5 : 1, k === 12 ? (lt - 1) / .5 : 1, k === 16 ? (lt - 2.2) / .5 : 1]; o.ticks = k >= 17 ? Math.floor(clamp((lt - .4) / .5, 0, 3) + (k > 17 ? 3 : 0)) : 0; }
  if (k === 12) o.lamp = 1 - ss(0, .3, lt) * (.8 + .2 * Math.sin(lt * 30));
  room(o);
  if (k === 21) return;
  const nA = NURSERY(k) ? (k === 3 ? ss(-.1, .5, lt) : 1) : 0, cA = 1 - nA;
  if (cA > 0) { g.save(); g.globalAlpha = cA; const L = {};
    if (k === 8) { L.grow = eo((lt - .1) / 1.1); L.eyes = 'wide'; }
    if (k === 1) { L.look = 'down'; L.mouth = 'o'; L.eyes = 'open'; }
    if (k === 2 || k === 10 || k === 17) L.pet = 1;
    if (k === 11) { L.purr = 1; L.pet = 1; L.drawLap = () => shape(cr([[440, 935], [540, 925], [645, 938], [650, 1000], [540, 1010], [432, 1000]], true, 5), MINT, { seed: 995 }); }
    if (k === 12) L.eyes = 'sly';
    if (k === 19) { L.claws = 1; L.drawLap = () => { const B = cr([[410, 930], [540, 912], [672, 932], [690, 1030], [540, 1046], [392, 1030]], true, 5); shape(B, '#e0897a', { seed: 996 }); g.save(); path(B); g.clip(); for (let i = 0; i < 7; i++) ink(dens([[390 + i * 48, 900], [390 + i * 48, 1050]], false), { seed: 997 + i, w: 6, col: '#f3d1c5', j: .6 }); g.restore(); ink(B, { seed: 998, w: 5 }); }; }
    if (k === 20) L.eyes = 'open';
    lapScene(k, lt, L); g.restore(); }
  if (nA > 0) { g.save(); g.globalAlpha = nA; basket(0); mom(lt); const kn = k >= 4 ? 1 : .2; kitten(470, 990, GREY, 1100, kn); kitten(560, 1000, ORANGE, 1120, kn); kitten(650, 990, '#f2dcb4', 1140, kn); basket(1);
    if (k === 5 || k === 6) for (let i = 0; i < 6; i++) { const u = fr(lt * .5 + i / 6), x = 460 + (i % 3) * 95 + 10 * Math.sin(u * 6 + i); heart(x, 930 - u * 260, 13 + u * 6, '#f4f1ea', { a: 1 - u, seed: 1200 + i, w: 3 }); }
    if (k === 6) { const k2 = eo((lt - .4) / .5); g.save(); g.globalAlpha *= k2; shape(rr(300, 770, 230, 70, 8), '#f1dc94', { seed: 1210, w: 3 }); txt('oxytocin', 415, 820, 44, { k: k2 }); g.restore(); for (let i = 0; i < 5; i++) { const u = fr(lt * .35 + i / 5); shape(ell(470 + i * 40 + 30 * Math.sin(u * 5 + i), 880 - u * 300, 12, 12, 6), '#f0a3b8', { a: (1 - u) * k2, seed: 1220 + i, w: 3 }); } }
    g.restore(); }
  if (k === 15) { const n = Math.floor(lt * 3); for (let i = 0; i < Math.min(n, 14); i++) { const a = clamp((lt - i / 3) / .4); scent(420 + hash(i) * 240, 950 + hash(i + 3) * 70 - a * 14, 44 + hash(i + 6) * 20, a, 1300 + i); } }
  if (k === 17) { const kk = eo((lt - 1) / .5); heart(540, 800 - 20 * kk, 40 * kk + .1, '#e98c7c', { a: kk, seed: 1350 }); }
  if (k === 1) { const kk = eo((lt - .2) / .4); txt('?', 660, 690 + 8 * Math.sin(T * 4), 120, { k: kk, col: ORD, rot: .12 }); }
  if (k === 2 || k === 20) { const kk = eo((lt - .3) / .5); g.save(); g.globalAlpha *= kk; for (const [bx, by, br] of [[640, 790, 10], [665, 760, 15]]) shape(ell(bx, by, br, br, 14), '#fdfaf2', { seed: 1400 + br, w: 3 });
    shape(cr([[690, 560], [760, 520], [850, 540], [890, 600], [860, 690], [770, 720], [700, 690], [672, 620]], true, 5), '#fdfaf2', { seed: 1410 }); shape(rr(712, 590, 140, 82, 8), '#b9b4aa', { seed: 1411, w: 3.4 });
    for (let i = 0; i < 6; i++) { const kb = eo((lt - .6 - i * .25) / .3); if (kb > 0) shape(ell(737 + (i % 3) * 45, 612 + Math.floor(i / 3) * 38, 17 * kb, 14 * kb, 14), '#e2b162', { seed: 1420 + i, w: 3 }); } g.restore(); }
  if (k === 12) { const d = ss(0, .4, lt) * .5; g.save(); const gr = g.createRadialGradient(540, 900, 120, 540, 900, 560); gr.addColorStop(0, 'rgba(25,22,45,0)'); gr.addColorStop(1, `rgba(25,22,45,${d * 1.6})`); g.fillStyle = gr; g.fillRect(-400, -600, 1900, 3200); g.restore(); }
}
// screen-space overlays per scene (notes over the room, stamps)
function overlay(k, lt) {
  if (k === 0) { const kk = eo((lt - .1) / .4); g.save(); g.globalAlpha = kk; g.translate(190, 1068); g.rotate(-.05); g.fillStyle = 'rgba(236,210,136,.95)'; g.fillRect(-160, -40, 320, 66); g.restore(); txt('press, press!', 190, 1088, 54, { k: kk, rot: -.05 }); arrow(352, 1062, 432, 1050, { k: kk, seed: 1490, bend: -.15, w: 4.6 }); }
  if (k === 7) { const L = [['push', 110, 470, -.06], ['milk', 640, 470, .05], ['safety', 110, 1000, .04], ['warmth', 640, 1000, -.05]];
    L.forEach(([w, x, y, r], i) => note(x, y, 250, 100, r, (lt + .2 - i * .32) / .5, () => txt(w, x + 125, y + 68, 54, {}), { seed: 1500 + i, notape: 1 }));
    const kk = clamp((lt - 1.6) / .5); arrow(370, 520, 630, 520, { k: kk, seed: 1510 }); arrow(770, 580, 770, 990, { k: kk, seed: 1511, bend: .06 }); arrow(630, 1050, 370, 1050, { k: kk, seed: 1512 }); arrow(240, 990, 240, 580, { k: kk, seed: 1513, bend: .06 }); }
  if (k === 8) stamp('NEVER STOPPED', lt - .9, 96);
  if (k === 15) stamp('MINE!', lt - 2.1, 170);
  if (k === 9) { note(110, 470, 380, 360, -.04, lt / .5, () => { cat(300, 690, .62, { knead: 1, eyes: 'happy', tail: 0 }); txt('kitten', 300, 800, 46); }, { seed: 1600 });
    note(590, 470, 380, 360, .04, (lt - .5) / .5, () => { cat(780, 680, .9, { knead: 1, eyes: 'happy', tail: 0 }); txt('adult', 780, 800, 46); }, { seed: 1601 });
    arrow(450, 640, 630, 640, { k: clamp((lt - 1) / .4), seed: 1602, w: 6, col: ORD }); note(300, 880, 480, 92, -.02, (lt - 1.6) / .4, () => txt('baby habit, kept', 540, 942, 50, { col: ORD }), { seed: 1603, notape: 1, col: '#f1dc94' }); }
  if (k === 13 || k === 14) note(140, 450, 800, 680, -.02, k === 13 ? lt / .5 : 1, () => { paw(k, lt); });
  if (k === 16) note(120, 450, 840, 700, .02, lt / .5, () => grass(lt));
  if (k === 18) note(220, 440, 640, 720, -.03, lt / .5, () => vet(lt), { col: '#a8794a', notape: 1, seed: 1700 });
}
function stamp(word, lt, size) { if (lt <= 0) return; const e = lt < .14 ? lerp(1.7, 1, lt / .14) : 1 + .03 * Math.exp(-(lt - .14) * 8) * Math.sin(lt * 40); g.save(); g.translate(540, 760); g.rotate(-.1); g.scale(e, e); g.globalAlpha = .9 * clamp(lt / .1);
  g.font = `700 ${size}px KalB`; const w = g.measureText(word).width + 70, h = size * 1.25; g.strokeStyle = RED; g.lineWidth = 9; path(rr(-w / 2, -h / 2 - size * .1, w, h, 16)); g.closePath(); g.stroke(); g.lineWidth = 3.5; path(rr(-w / 2 + 14, -h / 2 - size * .1 + 14, w - 28, h - 28, 10)); g.closePath(); g.stroke();
  g.fillStyle = RED; g.textAlign = 'center'; g.fillText(word, 0, size * .32); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${.35 + hash(i) * .5})`; g.fillRect((hash(i * 3.1) - .5) * w, (hash(i * 5.7) - .5) * h, 2 + hash(i) * 5, 2 + hash(i * 2) * 4); } g.restore(); }
function paw(k, lt) { const cx = 540, cy = 790, pr = k === 13 ? 1 + .03 * Math.sin(T * 5) : 1;
  shape(cr([[cx - 300, cy + 120], [cx - 320, cy - 120], [cx - 160, cy - 270], [cx + 160, cy - 270], [cx + 320, cy - 120], [cx + 300, cy + 120], [cx + 170, cy + 260], [cx - 170, cy + 260]], true, 6), ORANGE, { seed: 1800 });
  shape(cr([[cx - 130, cy + 60], [cx - 60, cy - 30], [cx + 60, cy - 30], [cx + 130, cy + 60], [cx + 110, cy + 170], [cx, cy + 140], [cx - 110, cy + 170]], true, 6).map(([x, y]) => [cx + (x - cx) * pr, cy + (y - cy) * pr]), PINK, { seed: 1801 });
  [[cx - 190, cy - 70], [cx - 75, cy - 160], [cx + 75, cy - 160], [cx + 190, cy - 70]].forEach(([x, y], i) => shape(ell(x, y, 50 * pr, 62 * pr, 26), PINK, { seed: 1802 + i }));
  const G = [[cx - 40, cy + 70], [cx + 40, cy + 70], [cx, cy + 115], [cx - 190, cy - 60], [cx - 75, cy - 150], [cx + 75, cy - 150], [cx + 190, cy - 60]];
  G.forEach(([x, y], i) => { const a = clamp((lt - .6 - i * .12) / .3), pu = 1 + .25 * Math.sin(T * 6 + i); if (a > 0) shape(ell(x, y, 8 * pu * a, 8 * pu * a, 12), '#8f3e3e', { seed: 1810 + i, w: 2 }); });
  if (k === 13) { for (let i = 0; i < 7; i++) { const u = fr(lt * .45 + i / 7), [x, y] = G[i]; scent(x + 10 * Math.sin(u * 7), y - 30 - u * 160, 18, (1 - u) * clamp((lt - 1) / .5), 1830 + i); }
    txt('scent glands', 540, 1095, 54, { k: (lt - 1.1) / .4, col: ORD }); arrow(440, 1060, 500, 900, { k: clamp((lt - 1.3) / .4), seed: 1840 }); }
  else { for (let i = 0; i < 6; i++) { const u = fr(lt * .38 + i / 6), x = lerp(G[i][0], 830, u), y = lerp(G[i][1], 600, u) - Math.sin(u * Math.PI) * 120; g.save(); g.globalAlpha *= Math.sin(u * Math.PI); shape(rr(x - 26, y - 17, 52, 34, 4), '#fdfaf2', { seed: 1850 + i, w: 3 }); ink([[x - 26, y - 17], [x, y + 3], [x + 26, y - 17]], { seed: 1860 + i, w: 2.6 }); g.restore(); }
    cat(850, 600, .55, { nobody: 1, col: GREY, eyes: 'open' }); txt('cat-to-cat messages', 540, 1095, 52, { col: ORD }); } }
function grass(lt) { const cx = 540, cy = 830, R = clamp(lt / 3) * 190, a = lt * 2.3;
  shape(ell(cx, cy + 40, 330, 150), '#c9c07a', { seed: 1900 }); txt('wild ancestors', 540, 545, 52, { col: ORD });
  const blades = []; for (let i = 0; i < 150; i++) { const r = Math.sqrt(hash(i * 1.7)) * 300, th = hash(i * 2.3) * TAU, x = cx + Math.cos(th) * r, y = cy + 40 + Math.sin(th) * r * .45; blades.push([x, y, r, th, i]); }
  blades.sort((p, q) => p[1] - q[1]); const catx = cx + Math.cos(a) * 120, caty = cy + 40 + Math.sin(a) * 50;
  let drawn = false; for (const [x, y, r, th, i] of blades) { if (!drawn && y > caty) { cat(catx, caty - 30, .5, { col: GREY, knead: 1, eyes: 'happy', marks: 0 }); drawn = true; } const flat = r < R, h = 60 + hash(i * 4.1) * 50, lean = Math.sin(T * 2 + i) * .08 + (hash(i) - .5) * .4;
    if (flat) ink(cr([[x - 22, y], [x, y - 4], [x + 24, y + 2]], false, 3), { seed: 1910 + i, w: 3, col: '#7d8f45' });
    else ink(cr([[x, y], [x + Math.sin(lean) * h * .5, y - h * .5], [x + Math.sin(lean) * h, y - h]], false, 4), { seed: 1910 + i, w: 3.4, col: GREEN });
  }
  txt('trample, trample: bed!', 540, 1095, 48, { k: (lt - 2.4) / .4 }); }
function vet(lt) { shape(rr(270, 500, 540, 630, 6), CREAM, { seed: 1950 }); shape(rr(450, 460, 180, 70, 14), '#8a8f96', { seed: 1951 });
  [['frantic?', 640], ['nonstop?', 760]].forEach(([w, y], i) => { const kk = clamp((lt - .5 - i * .8) / .4); shape(rr(330, y - 50, 56, 56, 6), '#fff', { seed: 1960 + i, w: 4, a: kk }); txt(w, 420, y - 6, 58, { align: 'left', k: kk }); if (lt > 1 + i * .8) ink(cr([[336, y - 26], [356, y - 2], [394, y - 62]], false, 5), { seed: 1970 + i, col: RED, w: 6 }); });
  const kk = clamp((lt - 2.2) / .4); shape(poly([[390, 860], [430, 860], [430, 900], [470, 900], [470, 940], [430, 940], [430, 980], [390, 980], [390, 940], [350, 940], [350, 900], [390, 900]]), RED, { seed: 1980, a: kk }); txt('call the vet', 640, 945, 60, { k: kk, col: RED }); }

// ---------- caption note + title tape (screen space) ----------
function card(t) { let i = -1; for (let k = 0; k < N - 1; k++) if (t >= PH[k].start - .1 && t < (k + 1 < N - 1 ? PH[k + 1].start - .1 : 1e9)) i = k; if (i < 0 && t < PH[0].start) i = 0; if (i < 0 || i >= N - 1) return;
  g.save(); g.shadowColor = 'rgba(60,40,20,.3)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = CREAM; path(rr(60, 1160, 960, 194, 8)); g.fill(); g.restore(); ink(rr(60, 1160, 960, 194, 8), { seed: 2000, w: 4 });
  for (const [tx, tr] of [[110, -.2], [880, .18]]) { g.save(); g.translate(tx, 1162); g.rotate(tr); g.fillStyle = 'rgba(232,206,130,.88)'; g.fillRect(-55, -17, 110, 34); g.restore(); }
  const p = PH[i]; g.save(); g.font = '400 46px Kal'; const raw = p.cap; const toks = []; let hi = false; raw.split(/(\*\*)/).forEach(seg => { if (seg === '**') { hi = !hi; return; } seg.split(' ').forEach(w => { if (w) toks.push([w, hi]); }); });
  const lines = [[]]; let lw = 0; toks.forEach(tk => { g.font = tk[1] ? '700 46px KalB' : '400 46px Kal'; const ww = g.measureText(tk[0] + ' ').width; if (lw + ww > 790 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([...tk, ww]); lw += ww; });
  const dur = Math.max(.6, p.end - p.start), nW = toks.length; let wi = 0; const y0 = lines.length >= 3 ? 1214 : lines.length === 2 ? 1238 : 1268;
  lines.forEach((ln, j) => { let x = 100; ln.forEach(([w, h, ww]) => { const wt = p.start + dur * wi / nW, a = clamp((t - wt + .25) / .15); g.font = h ? '700 46px KalB' : '400 46px Kal';
    if (h) { const m = clamp((t - wt) / .3), wd = g.measureText(w).width; g.fillStyle = 'rgba(232,180,70,.6)'; g.fillRect(x - 4, y0 + j * 56 - 18, (wd + 8) * m, 26); }
    g.globalAlpha = .45 + .55 * a; g.fillStyle = h ? ORD : INK; g.fillText(w, x, y0 + j * 56); g.globalAlpha = 1; x += ww; wi++; }); });
  g.restore(); }
function tape(str, t0) { if (!str) return; const k = eo(t0 / .35); g.save(); g.font = '700 64px KalB'; const w = g.measureText(str).width + 90; g.translate(540, 320); g.rotate(-.025); g.globalAlpha = clamp(t0 / .2);
  g.fillStyle = 'rgba(236,210,136,.95)'; g.beginPath(); const x0 = -w / 2, x1 = -w / 2 + w * k; g.moveTo(x0, -42); for (let x = x0; x < x1; x += 16) g.lineTo(x, -42 + (hash(x) - .5) * 3); g.lineTo(x1, -42); for (let y = -42; y <= 42; y += 10) g.lineTo(x1 + (hash(y + 3) - .5) * 10, y); g.lineTo(x0, 42); g.closePath(); g.fill();
  g.fillStyle = INK; g.textAlign = 'center'; g.globalAlpha *= clamp((t0 - .15) / .2); g.fillText(str, 0, 22); g.restore(); }
function endCard(lt) { const k = clamp(lt / .5); txt('Follow for more of', CX, 640, 70, { k }); g.save(); g.font = '700 70px KalB'; const w2 = g.measureText('how it really works.').width; g.fillStyle = 'rgba(232,180,70,.7)'; g.globalAlpha = k; g.fillRect(CX - w2 / 2, 712, w2 * clamp((lt - .3) / .5), 28); g.restore();
  txt('how it really works.', CX, 730, 70, { k, col: ORD }); txt("A new 'wait, really?' every day.", CX, 820, 46, { k: lt - .6, f: 'Kal', wt: 400 }); txt('@howitreallyworkstudio', CX, 890, 40, { k: lt - .8, f: 'Mono', wt: 600, col: TEAL });
  g.save(); g.translate(540, 1150); g.scale(1.5, 1.5); g.translate(-540, -1050); g.save(); g.translate(540, 1050); const br = 1 + .02 * Math.sin(T * 2); g.scale(1, br); shape(ell(0, 0, 150, 60), ORANGE, { seed: 2100 }); for (let i = 0; i < 3; i++) ink(cr([[-60 + i * 40, -50], [-50 + i * 40, -30], [-60 + i * 40, -10]], false, 4), { seed: 2101 + i, w: 5, col: ORD }); g.restore();
  cat(430, 1040, .8, { nobody: 1, eyes: 'happy' }); for (let i = 0; i < 3; i++) { const u = fr(T * .4 + i / 3); txt('z', 380 - u * 40, 985 - u * 70 - i * 4, 26 + u * 14, { a: 1 - u, col: INK }); } g.restore(); }

// ---------- frame ----------
function sceneAt(t) { let k = 0; for (let i = 0; i < N; i++) if (t >= START[i] - .2) k = i; return k; }
function draw(t) { T = t; ST = Math.floor(t * 12); const k = sceneAt(t), lt = k === 0 ? t + .2 : t - (START[k] - .2);
  const pc = CAM[Math.max(0, k - 1)] || CAM[0], cc = CAM[k] || [1, 540, 900], e = k === 0 ? 1 : eo(lt / .7), z = Z = lerp(pc[0], cc[0], e), cx = lerp(pc[1], cc[1], e), cy = lerp(pc[2], cc[2], e);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = WALL; g.fillRect(0, 0, W, H);
  if (k === N - 1) { g.fillStyle = '#efe3c6'; g.fillRect(0, 0, W, H); endCard(lt); }
  else { g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-cx, -cy); world(k, lt, t); g.restore(); overlay(k, lt); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(TX, 0, 0); g.restore();
  if (k < N - 1) { tape(TITLE[k], k === 0 ? 1 : lt); card(t); } }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H;
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { g.save(); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } }

const r = (i, d = 0) => s(i) + d;
window.CUES = [['pop', .3], ['tick', .9], ['tick', 1.6], ['tick', 2.3], ['whoosh', r(1, -.2)], ['pop', r(1, .3)], ['whoosh', r(2, -.2)], ['pop', r(2, .9)], ['pop', r(2, 1.15)], ['pop', r(2, 1.4)], ['pop', r(2, 1.65)],
  ['pageturn', r(3, -.2)], ['sparkle', r(3, .3)], ['whoosh', r(4, -.2)], ['tick', r(4, .6)], ['tick', r(4, 1.1)], ['tick', r(4, 1.6)], ['whoosh', r(5, -.2)], ['bubbles', r(5, .4)], ['slide', r(6, -.1)], ['sparkle', r(6, .6)],
  ['slide', r(7, -.1)], ['slide', r(7, .2)], ['slide', r(7, .5)], ['slide', r(7, .8)], ['scribble', r(7, 1.4), r(7, 2.2)], ['whoosh', r(8, -.2)], ['thud', r(8, .7)], ['slide', r(9, -.1)], ['slide', r(9, .4)], ['scribble', r(9, .9), r(9, 1.3)],
  ['whoosh', r(10, -.2)], ['scribble', r(10, .4), r(10, 1)], ['whoosh', r(11, -.2)], ['heartbeat', r(11, .3), 4, .5], ['silence', r(12, -.2), r(12, .4)], ['snap', r(12, -.1)], ['scribble', r(12, .8), r(12, 1.4)], ['slide', r(13, -.1)],
  ['pop', r(13, .5)], ['pop', r(13, .7)], ['pop', r(13, .9)], ['whoosh', r(14, -.2)], ['sparkle', r(14, .5)], ['pop', r(14, 1.3)], ['whoosh', r(15, -.2)], ['bubbles', r(15, .4)], ['thud', r(15, 1.9)], ['slide', r(16, -.1)],
  ['scribble', r(16, .4), r(16, 3)], ['whoosh', r(17, -.2)], ['tick', r(17, .5)], ['tick', r(17, 1)], ['tick', r(17, 1.5)], ['chime', r(17, 1), 79], ['slide', r(18, -.1)], ['tick', r(18, 1)], ['tick', r(18, 1.8)], ['pop', r(18, 2.2)],
  ['whoosh', r(19, -.2)], ['scribble', r(19, .3), r(19, 1)], ['pop', r(20, .1)], ['chime', r(21, .2), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { T = 1.3; ST = 15; g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.translate(540, 960); g.scale(1.42, 1.42); g.translate(-540, -930); world(0, 2, 1.3); g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(TX, 0, 0); g.restore(); g.save(); g.shadowColor = 'rgba(40,25,10,.35)'; g.shadowBlur = 18; g.fillStyle = CREAM; path(rr(60, 1130, 960, 230, 8)); g.fill(); g.restore(); ink(rr(60, 1130, 960, 230, 8), { seed: 2000, w: 4 });
  g.save(); g.font = '700 96px KalB'; g.fillStyle = INK; g.fillText('Why do cats', 100, 1225); g.fillStyle = 'rgba(232,180,70,.7)'; g.fillRect(96, 1278, 330, 34); g.fillStyle = ORD; g.fillText('knead?', 100, 1320); g.restore(); tape('making biscuits', 1); };
Promise.all([document.fonts.load('700 40px KalB'), document.fonts.load('400 40px Kal'), document.fonts.load('600 40px Mono')]).then(() => { { const keep = g; g = F0.getContext('2d'); draw(0); g = keep; } window.seek(0); window.ready = true; window.READY = true; });
