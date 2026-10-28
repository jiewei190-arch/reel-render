// t_bluejeans.js: "Why do jeans have that tiny pocket and those rivets?" in template #24 stop-motion explainer (demo t24 "Hi, I'm Lotus.": hand-drawn stop-motion, 12 fps).
// Grammar kept from the demo: a navy grid page with a small mono header and a big hand-lettered title with one highlighted word, a taped paper board with
// binder holes and a scene counter, pen line drawings that boil on 12 fps with hatched accent fills, small labelled boxes and arrows, a red ring for the thing to
// look at, a little mascot in the board's corner (a copper rivet), and a big cream caption card whose text types on.
// Batch N: header y 270-390, board y 420-1070, caption card y 1100-1410, nothing written right of x 900 below y 840.
await Promise.all(['400 40px CourierPrime', '400 40px Kalam', '700 40px Gaegu', '400 40px PatrickHand'].map(f => document.fonts.load(f)));
const W = 1080, H = 1920, cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, r = (i, d) => s(i) + d, TOT = TL.total;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u, seg = (t, a, b) => clamp((t - a) / (b - a)), ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const GR = '#2b2b2b', BLUE = '#3346b8', RED = '#d0453a', YEL = 'rgba(208,69,58,.9)', SLIP = '#fbfbf7', COPPER = '#c27a3e', MINT = '#4fd1ae', DENIM = '#5b7fc4', NAVY = '#2a3140';
let TQ = 0, BOIL = 0;   // stop motion: the whole frame is drawn at 12 fps

// ---------- paper + pencil ----------
const PAPER = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const p = c.getContext('2d');
  const gr = p.createRadialGradient(W / 2, H * .35, 100, W / 2, H * .4, H * .9); gr.addColorStop(0, '#eceee9'); gr.addColorStop(1, '#c9cdc6'); p.fillStyle = gr; p.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { p.fillStyle = `rgba(80,80,70,${.02 + hash(i) * .04})`; p.fillRect(hash(i * 3.1) * W, hash(i * 7.7) * H, 1.5, 1.5); } return c; })();
function pencil(pts, { w = 3, col = GR, a = .85, prog = 1, seed = 1, wob = 1.3, boil = true } = {}) {
  if (prog <= 0 || pts.length < 2) return; const sd = seed + (boil ? BOIL * 1.7 : 0);
  const P = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 14)); for (let k = 0; k < n; k++) P.push([lerp(x0, x1, k / n), lerp(y0, y1, k / n)]); } P.push(pts[pts.length - 1]);
  const upto = Math.max(2, Math.ceil(P.length * prog));
  for (let pass = 0; pass < 2; pass++) { g.save(); g.strokeStyle = col; g.globalAlpha = a * (pass ? .45 : 1); g.lineWidth = pass ? w * .6 : w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    for (let i = 0; i < upto; i++) { const [x, y] = P[i], ox = (hash(sd * 3.3 + i * .71 + pass) - .5) * wob * 2, oy = (hash(sd * 5.1 + i * .37 + pass) - .5) * wob * 2; i ? g.lineTo(x + ox, y + oy) : g.moveTo(x + ox, y + oy); } g.stroke(); g.restore(); } }
const line = (x0, y0, x1, y1, o) => pencil([[x0, y0], [x1, y1]], o);
const box = (x, y, w, h, o = {}) => pencil([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], o);
const ell = (cx, cy, rx, ry, n = 28) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * 6.2832) * rx, cy + Math.sin(i / n * 6.2832) * ry]);
function dashed(x, y, w, h, o = {}) { const P = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; for (let i = 0; i < 4; i++) { const [a0, a1] = [P[i], P[i + 1]], L = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), n = Math.floor(L / 22); for (let k = 0; k < n; k += 2) line(lerp(a0[0], a1[0], k / n), lerp(a0[1], a1[1], k / n), lerp(a0[0], a1[0], (k + 1) / n), lerp(a0[1], a1[1], (k + 1) / n), { w: 2, a: .6, seed: i * 50 + k, ...o }); } }
function hatch(poly, { sp = 10, ang = .9, a = .45, seed = 1, col = GR } = {}) { g.save(); g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip(); const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]), x0 = Math.min(...xs) - 200, x1 = Math.max(...xs) + 200, y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let x = x0; x < x1; x += sp) line(x, y1, x + (y1 - y0) * Math.tan(ang) * .5, y0, { w: col === GR ? 1.6 : 3.2, a, seed: seed + x, wob: .8, col }); g.restore(); }
function hand(txt, x, y, { size = 48, col = BLUE, align = 'left', reveal = 1, font = 'PatrickHand', weight = 400, rot = 0 } = {}) { if (reveal <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.font = `${weight} ${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(txt.slice(0, Math.ceil(txt.length * clamp(reveal))), 0, 0); g.restore(); }
function ring(cx, cy, rx, ry, k, seed = 1) { if (k <= 0) return; const P = Array.from({ length: 41 }, (_, i) => { const a = -1.2 + i / 40 * 6.6; return [cx + Math.cos(a) * rx * (1 + .05 * Math.sin(i)), cy + Math.sin(a) * ry * (1 + .05 * Math.cos(i * 1.3))]; }); pencil(P, { w: 5, col: YEL, a: 1, prog: k, seed, wob: 1.5 }); }
function arrow(x0, y0, x1, y1, o = {}) { line(x0, y0, x1, y1, o); const a = Math.atan2(y1 - y0, x1 - x0); for (const d of [-.5, .5]) line(x1, y1, x1 - Math.cos(a + d) * 22, y1 - Math.sin(a + d) * 22, o); }
// a typed paper slip: cream card + shadow, typewriter rows (label left, value right), types on with k
function slip(x, y, w, rows, { k = 1, title = '', rot = 0, size = 34 } = {}) { if (k <= 0) return; const h = (title ? 70 : 30) + rows.length * (size * 1.35) + 20;
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot + (hash(BOIL * .3 + x) - .5) * .004); g.translate(-w / 2, -h / 2);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(8, 10, w, h); g.fillStyle = SLIP; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,60,50,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
  const total = rows.reduce((a, [l, v]) => a + (l + v).length, title.length); let left = Math.ceil(total * clamp(k)); g.textBaseline = 'alphabetic';
  if (title) { g.font = `400 ${size + 6}px CourierPrime`; g.fillStyle = '#1e1e1c'; g.textAlign = 'left'; const n = Math.min(title.length, left); g.fillText(title.slice(0, n), 24, 54); left -= n; }
  rows.forEach(([l, v], i) => { const y0 = (title ? 70 : 30) + size + i * size * 1.35; g.font = `400 ${size}px CourierPrime`; g.fillStyle = '#5a5a54'; g.textAlign = 'left'; const n1 = Math.min(l.length, left); g.fillText(l.slice(0, n1), 24, y0); left -= n1;
    g.fillStyle = '#1e1e1c'; g.textAlign = 'right'; const n2 = Math.min(v.length, Math.max(0, left)); if (n2 > 0) g.fillText(v.slice(0, n2), w - 24, y0); left -= n2; });
  g.restore(); return h; }

// ---------- the waist overalls (graphite front view) ----------
// x, y = waistband centre; sc scale. o: pocketRing, rivets (0..1), rivetErase, watch, labels
function jeans(t, x, y, sc, o = {}) { const T = (px, py) => [x + px * sc, y + py * sc], P = pts => pts.map(([a, b]) => T(a, b)), k = o.k ?? 1;
  const out = P([[-230, 0], [230, 0], [250, 120], [270, 760], [40, 760], [0, 230], [-40, 760], [-270, 760], [-250, 120], [-230, 0]]);
  hatch(out, { sp: 16, a: .5, seed: 11, col: DENIM }); pencil(out, { w: 3.6, prog: k, seed: 12 });
  pencil(P([[-232, 46], [232, 46]]), { w: 2.6, prog: k, seed: 13 }); for (const bx of [-180, -60, 60, 180]) box(...T(bx - 10, -6), 20 * sc, 60 * sc, { w: 2.2, seed: 14 + bx, prog: k });
  pencil(P([[0, 46], [6, 200], [40, 236]]), { w: 2.4, prog: k, seed: 15 }); [70, 120, 170].forEach((yy, i) => { g.save(); g.fillStyle = GR; g.beginPath(); g.arc(...T(16, yy), 5 * sc, 0, 7); g.fill(); g.restore(); });
  // front pockets (curved openings) + the watch pocket inside the wearer's right (viewer's left)
  pencil(P([[-226, 70], [-200, 150], [-130, 200], [-80, 210]]), { w: 3, prog: k, seed: 16 }); pencil(P([[226, 70], [200, 150], [130, 200], [80, 210]]), { w: 3, prog: k, seed: 17 });
  const wp = P([[-196, 66], [-110, 66], [-112, 150], [-194, 150], [-196, 66]]); pencil(wp, { w: 3, prog: k, seed: 18 }); hatch(wp, { sp: 9, a: .9, seed: 19, col: MINT });
  pencil(P([[-40, 760], [0, 230], [40, 760]]), { w: 2.6, prog: k, seed: 20 });
  // rivets at the points of strain (pocket corners + watch pocket corners)
  const RV = [[-226, 70], [-80, 210], [226, 70], [80, 210], [-196, 66], [-110, 66]];
  RV.forEach(([px, py], i) => { const kk = clamp((o.rivets ?? 1) * RV.length - i); if (kk <= 0) return; const erased = i >= 4 ? (o.erase ?? 0) : 0; if (erased >= 1) return;
    g.save(); g.globalAlpha = kk * (1 - erased); g.fillStyle = COPPER; g.strokeStyle = GR; g.lineWidth = 2.4; g.beginPath(); g.arc(...T(px, py), 12 * sc, 0, 7); g.fill(); g.stroke(); g.restore(); });
  if (o.erase > 0) { [[-196, 66], [-110, 66]].forEach(([px, py], i) => { g.save(); g.globalAlpha = .5 * o.erase; g.fillStyle = '#e4e6e0'; g.beginPath(); g.ellipse(...T(px, py), 30 * sc, 20 * sc, .4, 0, 7); g.fill(); g.restore(); }); }
  if (o.watch > 0) { const u = ss(o.watch), wx = lerp(-150, -150, u), wy = lerp(-160, 110, u); pencil(P([[wx, wy], [wx + 60, wy - 120], [wx + 120, -40], [-40, 30]]).slice(0), { w: 2, a: .7, seed: 21 });
    const c = T(wx, wy); g.save(); g.beginPath(); if (u > .7) { const clip = P([[-200, 60], [-106, 60], [-106, 400], [-200, 400]]); g.moveTo(...clip[0]); clip.forEach(p => g.lineTo(...p)); g.closePath(); g.rect(0, 0, W, T(0, 60)[1]); g.clip('evenodd'); }
    g.fillStyle = '#e8e2cf'; g.beginPath(); g.arc(c[0], c[1], 40 * sc, 0, 7); g.fill(); pencil(ell(c[0], c[1], 40 * sc, 40 * sc), { w: 3, seed: 22 }); line(c[0], c[1], c[0], c[1] - 26 * sc, { w: 2.4, seed: 23 }); line(c[0], c[1], c[0] + 18 * sc, c[1] + 6 * sc, { w: 2.4, seed: 24 }); g.restore(); }
  return { wp: T(-153, 108), rv: RV.map(([a, b]) => T(a, b)) }; }

// ---------- scenes (one per beat; cut on the beat like stop motion) ----------
function gauge(x, y, h, lev, lab, k = 1) { if (k <= 0) return; g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x - 64, y - 42, 290, h + 130); g.fillStyle = SLIP; g.fillRect(x - 70, y - 50, 290, h + 130); box(x - 22, y, 44, h, { w: 3, seed: 300 }); pencil(ell(x, y + h + 26, 34, 34), { w: 3, seed: 301 }); const ly = y + h - h * lev; hatch([[x - 20, ly], [x + 20, ly], [x + 20, y + h + 10], [x - 20, y + h + 10]], { sp: 7, a: .6, seed: 302 }); hatch(ell(x, y + h + 26, 32, 32, 16), { sp: 7, a: .6, seed: 303 });
  hand(lab, x + 40, ly + 12, { size: 40, col: lev > .7 ? RED : BLUE }); line(x - 30, y + h * .2, x + 30, y + h * .2, { w: 2, col: RED, a: .8, seed: 304 }); hand('rips', x + 40, y + h * .2 + 12, { size: 34, col: RED }); }
function tearZig(x, y, k) { if (k <= 0) return; const P = Array.from({ length: 9 }, (_, i) => [x + i * 14, y + (i % 2 ? -12 : 12) + i * 6]); pencil(P, { w: 3.4, col: RED, prog: k, seed: 310 }); }
function figure(x, y, sc, seed) { pencil(ell(x, y - 150 * sc, 30 * sc, 34 * sc), { w: 3, seed }); pencil([[x, y - 116 * sc], [x, y - 30 * sc]], { w: 3, seed: seed + 1 }); pencil([[x - 50 * sc, y - 90 * sc], [x, y - 100 * sc], [x + 50 * sc, y - 80 * sc]], { w: 3, seed: seed + 2 }); pencil([[x - 34 * sc, y + 40 * sc], [x, y - 30 * sc], [x + 34 * sc, y + 40 * sc]], { w: 3, seed: seed + 3 }); }
const BEATS = [
  t => { const j = jeans(t, 540, 360, 1.0, { k: 1 }); ring(j.wp[0], j.wp[1], 120, 90, seg(t, -.6, 1.0), 1); for (const [i, p] of j.rv.slice(0, 4).entries()) arrow(p[0] + (i % 2 ? 70 : -70), p[1] - 80, p[0] + (i % 2 ? 16 : -16), p[1] - 14, { w: 3, col: RED, prog: seg(t, 1.6 + i * .3, 2.2 + i * .3), seed: 40 + i });
    hand('that tiny pocket?', 120, 300, { size: 58, col: BLUE, font: 'Gaegu', weight: 700, reveal: seg(t, -.8, 1.0) }); hand('rivets?', 700, 520, { size: 50, col: RED, reveal: seg(t, 1.8, 2.6) }); },
  t => { jeans(t, 540, 380, .85, {}); slip(160, 300, 520, [['made for', 'style'], ['made for', 'work']], { k: seg(t, s(1) + .2, s(1) + 1.6), title: 'PURPOSE' }); line(470, 418, 650, 418, { w: 4, col: RED, prog: seg(t, s(1) + 1.2, s(1) + 1.6), seed: 50 }); hand('✓', 690, 470, { size: 64, col: BLUE, reveal: seg(t, s(1) + 2.0, s(1) + 2.2) }); },
  t => { figure(260, 820, 1.9, 60); jeans(t, 760, 760, .36, {}); pencil([[560, 1060], [960, 1060]], { w: 3, seed: 65 }); hand('Jacob Davis, tailor', 120, 1000, { size: 46, reveal: seg(t, s(2) + .6, s(2) + 1.6) }); slip(470, 380, 460, [['for', 'her husband'], ['must', "not fall apart"]], { k: seg(t, s(2) + 1.8, s(2) + 4.2), title: 'ORDER' });
    hand('scissors · thread · cloth', 600, 1110, { size: 34, col: '#55554f', reveal: seg(t, s(2) + 3, s(2) + 4) }); },
  t => { const z = 1.8, cx = -150, cy = 150; g.save(); g.translate(540, 700); g.scale(z, z); g.translate(-(540 + cx), -(360 + cy)); jeans(t, 540, 360, 1, { rivets: 0 }); g.restore();
    tearZig(260, 690, seg(t, s(3) + .4, s(3) + 1.2)); hand('rip!', 200, 640, { size: 64, col: RED, reveal: seg(t, s(3) + .8, s(3) + 1.2), rot: -.1 }); gauge(780, 420, 300, lerp(.3, .92, seg(t, s(3) + .2, s(3) + 1.6)), 'strain'); },
  t => { const z = 1.8, cx = -150, cy = 150; g.save(); g.translate(540, 700); g.scale(z, z); g.translate(-(540 + cx), -(360 + cy)); const j = jeans(t, 540, 360, 1, { rivets: seg(t, s(4) + .4, s(4) + 1.6) }); g.restore();
    gauge(780, 420, 300, lerp(.92, .35, seg(t, s(4) + 1.0, s(4) + 2.2)), 'strain'); hand('points of strain', 120, 1080, { size: 50, reveal: seg(t, s(4) + 1.4, s(4) + 2.4) }); hand('metal rivets', 160, 400, { size: 54, col: BLUE, font: 'Gaegu', weight: 700, reveal: seg(t, s(4) + .2, s(4) + 1.0) }); },
  t => { const a = slip(110, 420, 380, [['trade', 'tailor'], ['idea', 'rivets']], { k: seg(t, s(5) + .2, s(5) + 1.4), title: 'J. Davis' }), b = slip(590, 420, 380, [['trade', 'cloth'], ['city', 'San Fran.']], { k: seg(t, s(5) + 2.2, s(5) + 3.4), title: 'L. Strauss' });
    hand('you connected:', 360, 330, { size: 44, reveal: seg(t, s(5), s(5) + .6) }); pencil([[300, 640], [300, 720], [780, 720], [780, 640]], { w: 3, prog: seg(t, s(5) + 3.4, s(5) + 4.4), seed: 70 }); hand('partners', 460, 800, { size: 56, col: BLUE, font: 'Gaegu', weight: 700, reveal: seg(t, s(5) + 4.2, s(5) + 5) });
    dashed(80, 380, 920, 480); jeans(t, 540, 900, .26, {}); },
  t => { slip(120, 360, 840, [['No.', '139,121'], ['date', 'May 20, 1873'], ['to', 'J. W. Davis'], ['and', 'Levi Strauss & Co.']], { k: seg(t, s(6) + .2, s(6) + 3.2), title: 'U.S. PATENT OFFICE', size: 40 });
    ring(780, 497, 190, 52, seg(t, s(6) + 3.0, s(6) + 4.0), 80); hand('the patent', 140, 880, { size: 60, col: BLUE, font: 'Gaegu', weight: 700, reveal: seg(t, s(6) + 3.6, s(6) + 4.6) }); hand('"improvement in fastening pocket-openings"', 140, 950, { size: 34, col: '#55554f', reveal: seg(t, s(6) + 4.2, s(6) + 5.2) }); },
  t => { pencil([[240, 420], [840, 420], [880, 960], [200, 960], [240, 420]], { w: 3.4, seed: 90 }); pencil([[300, 460], [500, 640], [780, 640]], { w: 3, seed: 91 }); hatch([[240, 420], [840, 420], [880, 960], [200, 960]], { sp: 12, a: .18, seed: 92 });
    [[300, 460], [780, 640]].forEach(([x, y], i) => { const kk = seg(t, s(7) + .4 + i * .6, s(7) + .9 + i * .6); if (kk <= 0) return; g.save(); g.globalAlpha = kk; g.fillStyle = COPPER; g.strokeStyle = GR; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.stroke(); g.restore();
      dashed(x - 50, y - 50, 100, 100); });
    hand('a rivet at each edge', 220, 1060, { size: 52, col: BLUE, reveal: seg(t, s(7) + 1.2, s(7) + 2.2) }); hand('FIG. 1  pocket opening', 240, 400, { size: 32, col: '#55554f', font: 'CourierPrime', reveal: seg(t, s(7), s(7) + .8) }); },
  t => { const z = lerp(1, 2.2, ss(seg(t, s(8), s(8) + 1.4))); g.save(); g.translate(540, 700); g.scale(z, z); g.translate(-(540 - 153 * (z - 1) / (2.2 - 1) * 1), -(360 + 108 * (z - 1) / 1.2)); const j = jeans(t, 540, 360, 1, {}); g.restore();
    ring(540, 700, 220, 170, seg(t, s(8) + 1.2, s(8) + 2.2), 100); hand('on the very first pair', 200, 1080, { size: 50, col: BLUE, reveal: seg(t, s(8) + 1.6, s(8) + 2.6) }); },
  t => { const z = 2.2; g.save(); g.translate(540, 700); g.scale(z, z); g.translate(-(540 - 153), -(360 + 108)); jeans(t, 540, 360, 1, { watch: seg(t, s(9) + .3, s(9) + 2.4) }); g.restore();
    slip(560, 330, 400, [['carry', 'pocket watch'], ['era', 'late 1800s']], { k: seg(t, s(9) + 2.4, s(9) + 3.8), title: 'WATCH POCKET', size: 30 }); },
  t => { slip(170, 420, 740, [['', 'WAIST OVERALLS']], { k: seg(t, s(10) + 1.6, s(10) + 2.6), size: 52 }); hand('called:', 180, 380, { size: 46, reveal: seg(t, s(10) + 1.2, s(10) + 1.7) });
    line(220, 500, 860, 470, { w: 4, col: RED, prog: seg(t, s(10) + 3.4, s(10) + 3.9), seed: 110 }); hand('until 1960', 300, 640, { size: 64, col: BLUE, font: 'Gaegu', weight: 700, reveal: seg(t, s(10) + 3.6, s(10) + 4.4) }); hand('then: jeans', 330, 740, { size: 58, col: BLUE, reveal: seg(t, s(10) + 4.2, s(10) + 4.9) }); jeans(t, 540, 830, .38, {}); },
  t => { const z = 2.2; g.save(); g.translate(540, 760); g.scale(z, z); g.translate(-(540 - 153), -(360 + 108)); jeans(t, 540, 360, 1, { erase: seg(t, s(11) + 1.6, s(11) + 3.0) }); g.restore();
    slip(560, 330, 400, [['WWII', 'metal saved'], ['pocket', 'no rivets']], { k: seg(t, s(11) + .3, s(11) + 1.8), title: 'WAR EFFORT', size: 30 }); },
  t => { pencil([[120, 560], [940, 560]], { w: 3, seed: 120 }); [[200, '1873'], [700, '1890']].forEach(([x, y], i) => { line(x, 540, x, 580, { w: 3, seed: 121 + i }); hand(y, x - 40, 640, { size: 46, col: i ? RED : BLUE, font: 'CourierPrime', reveal: seg(t, s(12) + i * 1.4, s(12) + .6 + i * 1.4) }); });
    hand('patent', 250, 520, { size: 44, reveal: seg(t, s(12) + .2, s(12) + .8) }); hand('ran out', 640, 520, { size: 44, col: RED, reveal: seg(t, s(12) + 1.6, s(12) + 2.2) });
    for (let i = 0; i < 10; i++) { const kk = seg(t, s(12) + 2.4 + i * .18, s(12) + 2.7 + i * .18); if (kk <= 0) continue; g.save(); g.globalAlpha = kk; jeans(t, 150 + (i % 5) * 190, 720 + Math.floor(i / 5) * 230, .3, {}); g.restore(); } hand("everyone's work pants", 260, 1130, { size: 46, col: BLUE, reveal: seg(t, s(12) + 3.0, s(12) + 4.0) }); },
  t => { const j = jeans(t, 520, 360, .95, {}); arrow(800, 330, j.rv[2][0] + 14, j.rv[2][1] - 6, { w: 3, col: BLUE, seed: 130 }); hand('armor for', 740, 300, { size: 44, col: BLUE }); hand('weak seams', 720, 345, { size: 44, col: BLUE });
    ring(j.wp[0], j.wp[1], 110, 82, seg(t, s(13) + 1.8, s(13) + 2.8), 131); hand('watch pocket', 90, 300, { size: 52, col: BLUE, font: 'Gaegu', weight: 700, reveal: seg(t, s(13) + 2.4, s(13) + 3.4) }); },
  t => { jeans(t, 540, 520, .7, {}); hand('ever used it?', 300, 380, { size: 66, col: BLUE, font: 'Gaegu', weight: 700, reveal: seg(t, s(14), s(14) + .8) });
    [['yes', 330], ['no', 600]].forEach(([w, x], i) => { box(x - 70, 420, 46, 46, { w: 3, seed: 140 + i, prog: seg(t, s(14) + .8 + i * .3, s(14) + 1.2 + i * .3) }); hand(w, x - 10, 460, { size: 52, reveal: seg(t, s(14) + .9 + i * .3, s(14) + 1.3 + i * .3) }); }); },
  t => { const t0 = s(15) - .2; hand('Follow for more of', 540, 640, { size: 74, col: GR, font: 'Gaegu', weight: 700, align: 'center', reveal: seg(t, t0 + .1, t0 + .8) }); hand('how it really works.', 540, 740, { size: 84, col: BLUE, font: 'Gaegu', weight: 700, align: 'center', reveal: seg(t, t0 + .5, t0 + 1.3) });
    line(320, 770, 760, 764, { w: 3, col: BLUE, prog: seg(t, t0 + 1.0, t0 + 1.4), seed: 150 }); slip(250, 820, 580, [['', "a new 'wait, really?'"], ['', 'every day'], ['', '@howitreallyworkstudio']], { k: seg(t, t0 + 1.2, t0 + 2.0), size: 32 }); jeans(t, 540, 360 - 150, .3, {}); },
];
// the page: navy grid, mono header + hand-lettered title, the taped board with binder holes and a scene counter
const BG = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const p = c.getContext('2d'); p.fillStyle = NAVY; p.fillRect(0, 0, W, H); p.strokeStyle = 'rgba(255,255,255,.05)'; p.lineWidth = 2; for (let x = 0; x < W; x += 44) { p.beginPath(); p.moveTo(x, 0); p.lineTo(x, H); p.stroke(); } for (let y = 0; y < H; y += 44) { p.beginPath(); p.moveTo(0, y); p.lineTo(W, y); p.stroke(); } return c; })();
const BX = 50, BY = 420, BW = 980, BH = 650;
function page(t, beat) { g.drawImage(BG, 0, 0); g.font = '400 30px CourierPrime'; g.fillStyle = 'rgba(220,226,235,.7)'; g.textAlign = 'left'; g.fillText('HAND-DRAWN STOP-MOTION · 12 FPS', 60, 300);
  g.font = '700 92px Gaegu'; const t1 = 'Why jeans have ', t2 = 'rivets.', w1 = g.measureText(t1).width, w2 = g.measureText(t2).width; g.fillStyle = MINT; g.globalAlpha = .75; g.fillRect(60 + w1 - 6, 340, w2 + 4, 34); g.globalAlpha = 1; g.fillStyle = '#f3f4f6'; g.fillText(t1, 60, 380); g.fillText(t2, 60 + w1, 380);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(BX + 8, BY + 10, BW, BH); g.drawImage(PAPER, 0, 0, W, H * BH / H * 2, BX, BY, BW, BH); g.fillStyle = 'rgba(236,236,230,.55)'; g.fillRect(BX, BY, BW, BH);
  g.fillStyle = 'rgba(232,214,150,.85)'; [[BX + 10, BY + 8, -.6], [BX + BW - 10, BY + 8, .6]].forEach(([x, y, a]) => { g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-55, -14, 110, 30); g.restore(); });
  g.fillStyle = '#2b2b2b'; g.fillRect(W / 2 - 110, BY + 22, 46, 8); g.fillRect(W / 2 + 64, BY + 22, 46, 8); g.beginPath(); g.arc(W / 2, BY + 26, 9, 0, 7); g.fill();
  g.font = '400 24px CourierPrime'; g.fillStyle = 'rgba(60,60,60,.6)'; g.textAlign = 'right'; g.fillText(`sc ${beat + 1} · ${String(Math.floor(t * 12)).padStart(4, '0')}`, 880, BY + BH - 22); g.textAlign = 'left'; }
// the mascot: a little copper rivet with a face, bobbing in the board's corner
function mascot(t, x, y, sc = 1) { const b = Math.sin(t * 4) * 4; g.save(); g.translate(x, y + b); g.scale(sc, sc); g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(0, 46, 46, 10, 0, 0, 7); g.fill();
  g.fillStyle = COPPER; g.beginPath(); g.arc(0, 0, 40, 0, 7); g.fill(); pencil(ell(0, 0, 40, 40), { w: 3, seed: 900 }); pencil(ell(0, 0, 24, 24), { w: 2, a: .6, seed: 901 });
  g.fillStyle = GR; [[-12, -4], [12, -4]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx, dy, 4, 0, 7); g.fill(); }); pencil([[-10, 12], [0, 17], [10, 12]], { w: 2.4, seed: 902 });
  pencil([[-38, 10], [-60, 24 + Math.sin(t * 6) * 6]], { w: 3, seed: 903 }); pencil([[38, 10], [60, 24 - Math.sin(t * 6) * 6]], { w: 3, seed: 904 }); g.restore(); }
// caption: the big cream card under the board, typed on
function caption(t) { const ph = PH.findLast(p => t >= p.start - .1); if (!ph || ph.i === PH.length - 1) return; const k = seg(t, ph.start - .1, ph.end - .3);
  const txt = ph.cap.replace(/\*\*/g, ''), bold = []; let idx = 0; ph.cap.split('**').forEach((pc, i) => { for (const ch of pc) bold[idx++] = i % 2 === 1; });
  g.save(); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(BX + 8, 1110, BW, 300); g.fillStyle = '#f3f3ee'; g.fillRect(BX, 1100, BW, 300);
  g.font = '400 60px PatrickHand'; const words = txt.split(' '), lines = [[]]; let cw = 0; words.forEach(w => { const m = g.measureText(w + ' ').width; if (cw + m > 860 && lines.at(-1).length) { lines.push([]); cw = 0; } lines.at(-1).push(w); cw += m; });
  const shown = Math.ceil(txt.length * Math.min(1, k * 1.15)); let ci = 0; g.textBaseline = 'alphabetic';
  lines.forEach((ln, li) => { let x = BX + 46; ln.forEach(wd => { for (const ch of wd + ' ') { if (ci >= shown) return; g.fillStyle = bold[ci] ? '#1f7f66' : '#1e1e1c'; g.fillText(ch, x, 1180 + li * 72); x += g.measureText(ch).width; ci++; } }); });
  g.restore(); }
function scene(t) { TQ = Math.floor(t * 12 + 1e-6) / 12; BOIL = Math.round(TQ * 12); t = TQ;
  g.setTransform(1, 0, 0, 1, 0, 0); let i = 0; for (let k = 0; k < PH.length; k++) if (t >= s(k) - .25) i = k; i = Math.min(i, BEATS.length - 1);
  page(t, i); g.save(); g.beginPath(); g.rect(BX, BY + 40, BW, BH - 40); g.clip(); g.translate(540, 745); g.scale(.74, .74); g.translate(-540, -710); BEATS[i](t); g.restore();
  if (i < BEATS.length - 1) mascot(t, BX + 90, BY + BH - 80, .9); caption(t); }
window.DUR = TOT;
// loop: the last 0.5 s blends 30% of frame 0 back in
window.seek = t => { scene(t); const lp = seg(t, TOT - .5, TOT); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); scene(0); const f0 = g.getImageData(0, 0, W, H); const kk = .3 * ss(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * kk; A[i + 1] += (B[i + 1] - A[i + 1]) * kk; A[i + 2] += (B[i + 2] - A[i + 2]) * kk; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { BOIL = 3; g.setTransform(1, 0, 0, 1, 0, 0); page(3, 0); g.save(); g.translate(540, 760); g.scale(.82, .82); g.translate(-540, -700); const j = jeans(3, 540, 380, 1.05, {}); ring(j.wp[0], j.wp[1], 130, 96, 1, 1); j.rv.slice(0, 4).forEach((p, i) => arrow(p[0] + (i % 2 ? 70 : -70), p[1] - 80, p[0] + (i % 2 ? 16 : -16), p[1] - 14, { w: 3, col: RED, seed: 40 + i })); g.restore(); mascot(3, BX + 90, BY + BH - 80, .9);
  g.fillStyle = '#f3f3ee'; g.fillRect(BX, 1100, BW, 300); g.font = '400 76px PatrickHand'; g.fillStyle = '#1e1e1c'; g.fillText('That tiny pocket', BX + 46, 1200); g.fillStyle = '#1f7f66'; g.fillText('had a job.', BX + 46, 1290); };
window.seek(0); window.ready = true; window.READY = true;
