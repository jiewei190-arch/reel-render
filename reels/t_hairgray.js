// t_hairgray.js: "Why does hair turn gray?" in template #27 old-master painting (demo t27, x.com/AdornCurates "Netherlandish Proverbs").
// Demo grammar reused: real public-domain old-master paintings explored by slow push-ins and pans, parchment title cards (serif small caps +
// italic line), dotted circle callouts that draw on around a detail, two small guide characters in the lower corners (one points with a stick,
// one reacts in a speech bubble), karaoke subtitles in a bold sans with the key words in gold on a dark pill. The paintings are The Met's
// open-access (CC0) Rembrandt self-portrait (1660) and two "style of Rembrandt" heads; our guides are original. The science is drawn as sepia-ink
// study sheets on parchment (the painter's notebook) laid over the painting.
// Batch N layout: painting window y 260-1160, captions at y 1220-1400, guides inside the window's bottom corners (drawings only in the right
// column below y 840), nothing written in the top 250 px or the bottom 480 px.
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, VY = 260, VH = 900;
const c = document.getElementById('c'); c.width = W; c.height = H; const g = c.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u, R = (t, t0, d) => clamp((t - t0) / d);
const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3), bo = u => { u = clamp(u); const k = 1.7; return 1 + (k + 1) * Math.pow(u - 1, 3) + k * Math.pow(u - 1, 2); };
const hash = n => { const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const INK = '#4a2e18', GOLD = '#f2c45a', PARCH = '#efe2bf';
const load = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = src; });
const [IMG_OLD, IMG_YOUNG, IMG_MAN] = await Promise.all(['assets/hairgray/rembrandt1660.jpg', 'assets/hairgray/young.jpg', 'assets/hairgray/oldman.jpg'].map(load));
await Promise.all(['700 40px "Baskerville"', 'italic 400 40px "BaskervilleI"', '800 40px "Inter"', '400 40px "Hand"'].map(f => document.fonts.load(f)));

// ---------- painting window with Ken Burns: view = [cx, cy, zoom] in painting-normalised coords (zoom 1 = the painting's width fills the window) ----------
function paint(img, view, a = 1, box = [0, VY, W, VH]) { const [cx, cy, z] = view, [bx, by, bw, bh] = box, iw = img.width, ih = img.height;
  const sw = iw / z, sh = sw * bh / bw, sx = clamp(cx * iw - sw / 2, 0, iw - sw), sy = clamp(cy * ih - sh / 2, 0, ih - sh);
  g.save(); g.globalAlpha *= a; g.beginPath(); g.rect(bx, by, bw, bh); g.clip(); g.drawImage(img, sx, sy, sw, sh, bx, by, bw, bh);
  const vg = g.createRadialGradient(bx + bw / 2, by + bh / 2, bh * .35, bx + bw / 2, by + bh / 2, bh * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,6,2,.45)'); g.fillStyle = vg; g.fillRect(bx, by, bw, bh); g.restore();
  return (u, v) => [bx + (u * iw - sx) / sw * bw, by + (v * ih - sy) / sh * bh]; }   // map painting coords -> screen
const mixV = (A, B, u) => A.map((v, i) => lerp(v, B[i], u));
// ---------- demo furniture ----------
function card(title, sub, x, y, k, o = {}) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.letterSpacing = '2px';
  g.font = `700 ${o.size || 34}px "Baskerville"`; const tw = g.measureText(title.toUpperCase()).width; g.letterSpacing = '0px'; g.font = `italic 400 ${o.subSize || 24}px "BaskervilleI"`; const sw = sub ? g.measureText(sub).width : 0; const w = Math.max(tw, sw) + 56, h = sub ? 106 : 70;
  x = Math.min(x, W - 30 - w); g.translate(x, y - 14 * (1 - eo(k)));
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 18; g.shadowOffsetY = 8; g.fillStyle = PARCH; g.fillRect(0, 0, w, h); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(90,60,30,.55)'; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#2a1a0c'; g.font = `700 ${o.size || 34}px "Baskerville"`; g.letterSpacing = '2px'; g.fillText(title.toUpperCase(), 28, 48); g.letterSpacing = '0px';
  if (sub) { g.font = `italic 400 ${o.subSize || 24}px "BaskervilleI"`; g.fillStyle = '#5a3d22'; g.fillText(sub, 28, 86); } g.restore(); }
function callout(x, y, r, k, o = {}) { if (k <= 0) return; g.save(); g.strokeStyle = o.col || 'rgba(255,236,190,.95)'; g.lineWidth = 3.5; g.setLineDash([3, 9]); g.lineCap = 'round'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 6;
  g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * eo(k)); g.stroke(); g.restore(); if (o.label && k > .6) tag(o.label, x + (o.lx ?? 0), y + (o.ly ?? -r - 30), R(k, .6, .4)); }
function tag(txt, x, y, k) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.font = '400 44px "Hand"'; const w = g.measureText(txt).width + 36; g.translate(x - w / 2, y - 30);
  g.fillStyle = 'rgba(250,240,215,.95)'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 10; g.beginPath(); g.roundRect(0, 0, w, 56, 14); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = '#2a1a0c'; g.fillText(txt, 18, 41); g.restore(); }
// guides (original): a little painter in a beret with a long brush (points), and a round paint-blob creature that reacts
function painter(x, y, t, point = null) { g.save(); g.translate(x, y); const bob = Math.sin(t * 2) * 3; g.translate(0, bob);
  g.fillStyle = '#3d6fa6'; g.beginPath(); g.moveTo(-50, 0); g.lineTo(50, 0); g.lineTo(36, -110); g.lineTo(-36, -110); g.closePath(); g.fill(); g.strokeStyle = '#1c2f48'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#f2c9a4'; g.beginPath(); g.arc(0, -150, 46, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#9b2c2c'; g.beginPath(); g.ellipse(-6, -190, 52, 18, -.2, 0, TAU); g.fill(); g.beginPath(); g.arc(-4, -206, 6, 0, TAU); g.fill();
  const bl = (t * 1.3) % 4 > 3.85; g.fillStyle = '#2a1a0c'; for (const ex of [-16, 16]) { g.beginPath(); bl ? g.rect(ex - 7, -153, 14, 3) : g.arc(ex, -152, 6, 0, TAU); g.fill(); } g.strokeStyle = '#7a3a2a'; g.lineWidth = 3; g.beginPath(); g.arc(0, -134, 10, .3, Math.PI - .3); g.stroke();
  const [px, py] = point ? [point[0] - x, point[1] - y - bob] : [90, -60]; const ang = Math.atan2(py + 70, px - 30), L = Math.min(260, Math.hypot(px - 30, py + 70));
  g.strokeStyle = '#6b4a2a'; g.lineWidth = 7; g.beginPath(); g.moveTo(30, -70); g.lineTo(30 + Math.cos(ang) * L, -70 + Math.sin(ang) * L); g.stroke(); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(30 + Math.cos(ang) * L, -70 + Math.sin(ang) * L, 9, 0, TAU); g.fill();
  g.fillStyle = '#f2c9a4'; g.beginPath(); g.arc(30, -70, 12, 0, TAU); g.fill(); g.restore(); }
function blob(x, y, t, say = '', k = 0) { g.save(); g.translate(x, y); const sq = 1 + .05 * Math.sin(t * 3); g.scale(1 / sq, sq);
  g.fillStyle = '#d98b3a'; g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, rr = 52 + 6 * Math.sin(a * 5 + t * 2); i ? g.lineTo(Math.cos(a) * rr, -52 + Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, -52 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.strokeStyle = '#7a3f12'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fff'; for (const ex of [-16, 14]) { g.beginPath(); g.arc(ex, -62, 11, 0, TAU); g.fill(); } g.fillStyle = '#2a1a0c'; for (const ex of [-14, 16]) { g.beginPath(); g.arc(ex, -60, 5, 0, TAU); g.fill(); } g.restore();
  if (say && k > 0) { g.save(); g.globalAlpha = clamp(k * 3); g.font = '400 40px "Hand"'; const w = g.measureText(say).width + 30; const bx = Math.min(x - 40 - w, 880 - w); g.fillStyle = '#fff8e8'; g.beginPath(); g.roundRect(bx, y - 170, w, 56, 16); g.fill(); g.fillStyle = '#2a1a0c'; g.fillText(say, bx + 15, y - 130); g.restore(); } }
// ---------- the study sheet (sepia ink on parchment, laid over the painting) ----------
function sheet(k, x = 60, y = 300, w = 960, h = 820) { if (k <= 0) return null; const off = (1 - eo(k)) * 60; g.save(); g.globalAlpha *= clamp(k * 2); g.translate(0, off);
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = PARCH; g.fillRect(x, y, w, h); g.shadowColor = 'transparent';
  for (let i = 0; i < 60; i++) { const rx = x + hash(i * 3.1) * w, ry = y + hash(i * 5.3) * h, rr = 30 + 90 * hash(i * 7.7); const gr = g.createRadialGradient(rx, ry, 0, rx, ry, rr); gr.addColorStop(0, 'rgba(160,120,60,.10)'); gr.addColorStop(1, 'rgba(160,120,60,0)'); g.fillStyle = gr; g.fillRect(rx - rr, ry - rr, rr * 2, rr * 2); }
  g.strokeStyle = 'rgba(90,60,30,.4)'; g.lineWidth = 2; g.strokeRect(x + 12, y + 12, w - 24, h - 24); g.restore(); return off; }
function ink(pts, k = 1, o = {}) { if (k <= 0) return; const n = Math.max(2, Math.floor(pts.length * clamp(k))); g.save(); g.strokeStyle = o.col || INK; g.lineWidth = o.w || 4; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha *= o.a ?? 1;
  g.beginPath(); for (let i = 0; i < n; i++) { const [px, py] = pts[i], j = (hash(i * 1.7 + (o.seed || 0)) - .5) * 1.4; i ? g.lineTo(px + j, py - j) : g.moveTo(px, py); } if (o.close && k >= 1) g.closePath(); g.stroke(); g.restore(); }
const arc = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
function hatch(x0, y0, x1, y1, k, sp = 14, a = .35) { g.save(); g.globalAlpha *= a * clamp(k); g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip(); g.beginPath(); for (let x = x0 - (y1 - y0); x < x1; x += sp) { g.moveTo(x, y1); g.lineTo(x + (y1 - y0), y0); } g.stroke(); g.restore(); }
function word(txt, x, y, k, o = {}) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.font = `400 ${o.size || 48}px "Hand"`; g.fillStyle = o.col || '#5a3218'; g.textAlign = o.align || 'center'; g.fillText(txt, x, y); g.restore(); }
// a follicle in section: skin line, follicle tube, bulb at the bottom, bulge and hair germ compartments; returns anchor points
function follicle(k, hairCol, o = {}) { const cx = 540, top = 520, bot = 1020; ink([[120, top], [960, top]], k, { w: 5 });
  hatch(120, top, 960, 560, k, 12, .25); ink([[490, top], [480, bot - 80], [460, bot], [540, bot + 40], [620, bot], [600, bot - 80], [590, top]], k, { w: 4.5, seed: 3 });
  // the hair shaft grows up from the bulb
  const grow = o.grow ?? 1, hy = lerp(bot - 20, 330, grow); g.save(); g.fillStyle = hairCol; g.fillRect(526, hy, 28, bot - 20 - hy); g.restore(); ink([[526, bot - 20], [526, hy]], k, { w: 2.5 }); ink([[554, bot - 20], [554, hy]], k, { w: 2.5 });
  if (o.labels) { word('bulge', 340, 690, R(k, .6, .3), { size: 44 }); ink([[400, 680], [478, 690]], R(k, .7, .3), { w: 2.5 }); word('hair germ', 340, 930, R(k, .7, .3), { size: 44 }); ink([[420, 920], [470, 950]], R(k, .8, .3), { w: 2.5 }); }
  return { bulge: [470, 700], germ: [475, 950], bulb: [540, 1000] }; }
function cell(x, y, r, col, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke(); g.restore(); }

// ---------- views on the paintings (u, v, zoom) ----------
const V_HAIR = [.36, .27, 2.6], V_FACE = [.47, .33, 1.5], V_WIDE = [.5, .45, 1], V_YHAIR = [.42, .25, 1.8], V_BEARD = [.5, .55, 1.6];
// ---------- scenes ----------
const SC = [];
SC.push([0, t => { const z = mixV(V_HAIR, [.37, .28, 2.9], ss(t / (s(1) + .5))); const P = paint(IMG_OLD, z); const [hx, hy] = P(.29, .34);
  callout(hx, hy, 150, t < .02 ? 1 : R(t, 0, .7), { label: 'grows in gray', ly: -190 }); card('Rembrandt', 'Self-Portrait, 1660 · The Met', 40, 290, 1, { size: 30 }); }]);
SC.push([s(1) - .3, t => { paint(IMG_YOUNG, [.45, .35, 1.55], 1, [0, VY, 540, VH]); paint(IMG_OLD, [.46, .36, 1.55], 1, [540, VY, 540, VH]); g.fillStyle = '#1a120a'; g.fillRect(536, VY, 8, VH);
  card('young', 'style of Rembrandt', 40, 290, R(t, s(1), .5), { size: 28, subSize: 22 }); card('older', 'Rembrandt, 1660', 580, 290, R(t, s(1) + .4, .5), { size: 28, subSize: 22 }); }]);
SC.push([s(2) - .3, t => { paint(IMG_OLD, V_FACE, .9); const off = sheet(R(t, s(2) - .3, .6)); g.save(); g.translate(0, off);
  const k = R(t, s(2), 1.2), grow = t < s(3) ? .25 : .25 + .75 * ss(R(t, s(3) + .2, 2.4)); const f = follicle(k, '#4a2a14', { grow });
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * .6; cell(540 + Math.cos(a) * 62, 1000 + Math.sin(a) * 26, 14, '#e9c48a', R(t, s(2) + 1.2 + i * .1, .3)); }
  for (let i = 0; i < 8; i++) { const ph = (t * .6 + i / 8) % 1; g.save(); g.globalAlpha = R(t, s(2) + 2, .5); g.fillStyle = '#3a1c08'; g.beginPath(); g.arc(540 + Math.cos(i * 2) * 50 * (1 - ph), 1000 - ph * 60, 6, 0, TAU); g.fill(); g.restore(); }
  word('melanocytes', 790, 1000, R(t, s(2) + 2.6, .5)); ink([[690, 990], [610, 1000]], R(t, s(2) + 2.8, .3), { w: 2.5 }); word('melanin', 760, 860, R(t, s(2) + 1.0, .5), { col: '#3a1c08' }); ink([[690, 850], [560, 960]], R(t, s(2) + 1.2, .3), { w: 2.5 });
  if (t > s(3) - .1) { word('color set as it grows', 540, 420, R(t, s(3) + .4, .6), { size: 54 }); } g.restore(); }]);
SC.push([s(4) - .3, t => { paint(IMG_YOUNG, V_YHAIR, 1, [0, VY, 540, VH]); const P = paint(IMG_MAN, V_BEARD, 1, [540, VY, 540, VH]); g.fillStyle = '#1a120a'; g.fillRect(536, VY, 8, VH);
  callout(150, 760, 120, R(t, s(4) + .2, .7), { label: 'melanin', lx: 60 }); callout(810, 860, 150, R(t, s(4) + 1.0, .7), { label: 'little or none', ly: -190 }); card('Study Head of an Old Man', 'style of Rembrandt · The Met', 560, 290, R(t, s(4) + .4, .5), { size: 22, subSize: 18 }); }]);
SC.push([s(5) - .3, t => { paint(IMG_OLD, V_HAIR, .9); const off = sheet(R(t, s(5) - .3, .6)); g.save(); g.translate(0, off);
  const stuck = t > s(8) - .1, white = t > s(9) - .2; const hairCol = white ? '#f4f1ea' : stuck ? '#9a8f84' : '#4a2a14'; const f = follicle(1, hairCol, { labels: true, grow: white ? .2 + .8 * ss(R(t, s(9), 2)) : 1 });
  card(t < s(6) ? 'stem cells' : 'Sun et al. · Nature, 2023', t < s(6) ? 'in every hair follicle' : 'in mice · NYU Langone', 560, 330, R(t, t < s(6) ? s(5) : s(6), .5), { size: 26, subSize: 20 });
  for (let i = 0; i < 5; i++) { const ph = (t * .35 + i / 5) % 1, sh = Math.sin(ph * TAU) * .5 + .5, stuckK = stuck ? ss(R(t, s(8) + .4 + i * .3, .8)) : 0, y = lerp(lerp(700, 950, sh), 690 + i * 8, stuckK), x = 455 - i * 8;
    const pig = stuckK > .5 ? '#bdb5ab' : (y > 900 ? '#6a3a14' : '#f2e2b8'); cell(x, y, 15, pig, R(t, s(5) + .3 + i * .15, .3)); }
  if (t > s(6) - .1 && !stuck) { ink(arc(400, 825, 30, 120, -Math.PI / 2, Math.PI / 2, 20), R(t, s(6) + 1.6, .8), { w: 3 }); word('shuttle', 300, 830, R(t, s(6) + 2, .5)); }
  if (t > s(7) - .1 && !stuck) word('pigment signal here', 760, 960, R(t, s(7) + .3, .5), { size: 42, col: '#6a3a14' });
  if (stuck) { word('stuck!', 300, 620, R(t, s(8) + 1.4, .5), { size: 60, col: '#a83020' }); }
  if (white) word('no color', 760, 760, R(t, s(9) + .4, .5), { size: 60 }); g.restore(); }]);
SC.push([s(10) - .3, t => { paint(IMG_MAN, V_BEARD, .9); const off = sheet(R(t, s(10) - .3, .6)); g.save(); g.translate(0, off); follicle(1, '#d9d4cc');
  for (let i = 0; i < 14; i++) { const k = R(t, s(10) + .6 + i * .12, .4), x = 470 + 140 * hash(i * 3.3), y = 640 + 360 * hash(i * 7.1) + Math.sin(t * 2 + i) * 6; if (k <= 0) continue; g.save(); g.globalAlpha = k; g.strokeStyle = '#2c5d8a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.stroke(); g.restore(); }
  word('H₂O₂', 780, 760, R(t, s(10) + 1.2, .5), { size: 70, col: '#2c5d8a' }); word('tyrosinase', 780, 960, R(t, s(10) + 3.0, .5), { size: 46 }); const xk = R(t, s(10) + 3.8, .5); ink([[690, 990], [870, 930]], xk, { w: 7, col: '#a83020' }); ink([[690, 930], [870, 990]], R(xk, .4, .6), { w: 7, col: '#a83020' });
  card('Wood et al.', 'The FASEB Journal, 2009', 560, 330, R(t, s(10) + .3, .5), { size: 26, subSize: 20 }); g.restore(); }]);
SC.push([s(11) - .3, t => { paint(IMG_YOUNG, V_YHAIR, .9); const off = sheet(R(t, s(11) - .3, .6)); g.save(); g.translate(0, off);
  const gray = ss(R(t, s(12) + 1.4, 2.2)); const body = arc(520, 760, 260, 150, 0, TAU, 60); g.save(); g.beginPath(); body.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = `rgb(${lerp(120, 205, gray)},${lerp(90, 200, gray)},${lerp(60, 192, gray)})`; g.fill(); g.restore();
  ink(body, R(t, s(11), 1), { w: 4.5 }); ink(arc(780, 690, 90, 70, 0, TAU, 30), R(t, s(11) + .3, .6), { w: 4.5 }); g.save(); g.fillStyle = `rgb(${lerp(120, 205, gray)},${lerp(90, 200, gray)},${lerp(60, 192, gray)})`; g.beginPath(); g.ellipse(780, 690, 88, 68, 0, 0, TAU); g.fill(); g.restore(); ink(arc(780, 690, 90, 70, 0, TAU, 30), 1, { w: 4.5 });
  ink(arc(760, 630, 26, 26, 0, TAU, 20), R(t, s(11) + .5, .4), { w: 4 }); cell(812, 682, 7, '#2a1a0c'); ink([[260, 820], [180, 900], [140, 860]], R(t, s(11) + .6, .5), { w: 4.5 }); word('mouse', 300, 980, R(t, s(11) + .8, .4), { size: 44 });
  const zap = R(t, s(11) + 2.6, .3); if (zap > 0) for (let i = 0; i < 4; i++) { const x0 = 400 + i * 80; ink([[x0, 560], [x0 + 20, 600], [x0 - 10, 620], [x0 + 15, 660]], zap, { w: 4, col: '#c8902a' }); }
  word('noradrenaline', 520, 470, R(t, s(11) + 2.8, .5), { size: 54, col: '#a8601a' });
  for (let i = 0; i < 8; i++) cell(360 + i * 46, 900, 13, '#f2e2b8', 1 - ss(R(t, s(12) + .3 + i * .1, .5)));
  if (t > s(12)) word('stem cells used up in days', 540, 1060, R(t, s(12) + .4, .6), { size: 46 });
  card('Zhang et al. · Nature, 2020', 'in mice · Harvard', 560, 330, R(t, s(11) + .4, .5), { size: 24, subSize: 20 }); g.restore(); }]);
SC.push([s(13) - .3, t => { const P = paint(IMG_OLD, mixV(V_FACE, V_WIDE, ss(R(t, s(13), 3.2)))); const [hx, hy] = P(.29, .34); callout(hx, hy, 110, R(t, s(13) + .6, .7), { label: 'in people?', ly: -150 }); }]);
SC.push([s(14) - .3, t => { const w3 = 360; [[IMG_YOUNG, [.45, .33, 2.3]], [IMG_OLD, [.44, .33, 2.3]], [IMG_MAN, [.5, .4, 2.3]]].forEach(([im, v], i) => paint(im, v, R(t, s(14) - .2 + i * .25, .4), [i * w3, VY, w3, VH]));
  g.fillStyle = '#1a120a'; g.fillRect(356, VY, 8, VH); g.fillRect(716, VY, 8, VH); card('genes', 'set the timing', 380, 300, R(t, s(14) + .3, .5), { size: 30, subSize: 22 });
  for (let i = 0; i < 2; i++) { const x0 = 300 + i * 360; g.save(); g.globalAlpha = R(t, s(14) + 1.0 + i * .4, .4); g.fillStyle = GOLD; g.beginPath(); g.moveTo(x0 + 70, 700); g.lineTo(x0 + 120, 720); g.lineTo(x0 + 70, 740); g.closePath(); g.fill(); g.restore(); } }]);
SC.push([s(15) - .3, t => { const P = paint(IMG_OLD, V_HAIR); const [hx, hy] = P(.29, .34); callout(hx, hy, 150, R(t, s(15) + .2, .7));
  card('first gray hair?', 'yes or no', 300, 300, R(t, s(15), .5), { size: 34, subSize: 26 }); }]);
SC.push([s(16) - .35, t => { paint(IMG_OLD, V_WIDE, .55); const k = R(t, s(16) - .3, .6); if (k > 0) { g.save(); g.globalAlpha = clamp(k * 2); g.fillStyle = PARCH; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.fillRect(110, 420, 860, 470); g.restore();
    g.save(); g.globalAlpha = clamp(k * 2); g.textAlign = 'center'; g.fillStyle = '#2a1a0c'; g.font = '700 54px "Baskerville"'; g.fillText('Follow for more of', 540, 530); g.fillStyle = '#8a2a1a'; g.font = 'italic 400 70px "BaskervilleI"'; g.fillText('how it really works.', 540, 630);
    g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(260, 680); g.lineTo(820, 680); g.stroke(); g.fillStyle = '#5a3d22'; g.font = 'italic 400 40px "BaskervilleI"'; g.fillText("A new 'wait, really?' every day.", 540, 750); g.font = '700 32px "Baskerville"'; g.fillStyle = '#8a2a1a'; g.fillText('@howitreallyworkstudio', 540, 820); g.restore(); } }]);

// karaoke subtitle: bold sans, spoken words white, key (**) words gold, on a dark pill (Batch N: centred at y 1300)
function karaoke(ph, t, out) { if (!ph) return; const a = clamp((t - ph.start + .2) / .2) * (out != null ? clamp((out - t) / .2) : 1); if (a <= 0) return; g.save(); g.font = '800 50px "Inter"';
  const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  const tot = ws.reduce((q, w) => q + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = g.measureText(w.w).width; });
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; ws.forEach(w => { if (lw + w.ww > 860 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const lh = 62, y0 = 1300 - (lines.length - 1) * lh / 2, widest = Math.max(...lines.map(l => l.reduce((q, w) => q + w.ww, 0) + sp * (l.length - 1)));
  g.globalAlpha = a * .85; g.fillStyle = 'rgba(20,14,8,.85)'; g.beginPath(); g.roundRect(540 - widest / 2 - 30, y0 - 50, widest + 60, lines.length * lh + 26, 22); g.fill();
  lines.forEach((ln, li) => { const w = ln.reduce((q, x) => q + x.ww, 0) + sp * (ln.length - 1); let x = 540 - w / 2; ln.forEach(wd => { g.globalAlpha = a * (t >= wd.t0 ? 1 : .55); g.fillStyle = wd.hl ? GOLD : '#fbf3e2'; g.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  g.restore(); }
function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#120c07'; g.fillRect(0, 0, W, H);
  const lit = g.createRadialGradient(540, 1180, 100, 540, 1180, 900); lit.addColorStop(0, 'rgba(90,60,30,.35)'); lit.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lit; g.fillRect(0, 0, W, H);
  let i = 0; SC.forEach((cc, k) => { if (t >= cc[0]) i = k; }); const u = R(t, SC[i][0], .45);
  if (i > 0 && u < 1) { g.save(); SC[i - 1][1](t); g.restore(); g.save(); g.globalAlpha = ss(u); SC[i][1](t); g.restore(); } else SC[i][1](t);
  // the painting's gilt frame line
  g.strokeStyle = '#8a6a32'; g.lineWidth = 6; g.strokeRect(3, VY - 3, W - 6, VH + 6); g.strokeStyle = 'rgba(255,220,150,.25)'; g.lineWidth = 2; g.strokeRect(9, VY + 3, W - 18, VH - 6);
  // the guides (lower corners of the painting window), the painter points at the active callout
  const ptTarget = t < s(1) ? [300, 700] : (t > s(4) - .3 && t < s(5) - .3) ? [170, 790] : (t > s(13) - .3 && t < s(14) - .3) ? [420, 560] : null;
  painter(110, 1150, t, ptTarget); blob(960, 1150, t, t > s(8) + 1.4 && t < s(9) ? 'stuck?!' : t > s(12) && t < s(13) - .3 ? 'yikes' : t > s(3) + 2.4 && t < s(4) - .3 ? 'oh!' : '', 1);
  const ph = PH.findLast(p => t >= p.start - .25); if (ph && ph.i < PH.length - 1) karaoke(ph, t, PH[ph.i + 1].start - .15); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .4; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.fillStyle = '#120c07'; g.fillRect(0, 0, W, H); const P = paint(IMG_OLD, [.37, .3, 2.2]); const [hx, hy] = P(.29, .34); callout(hx, hy, 170, 1);
  card('Why does hair', 'turn gray?', 60, 300, 1, { size: 52, subSize: 44 }); painter(110, 1150, 1, [hx - 120, hy + 60]); blob(960, 1150, 1); };
window.seek(0); window.ready = true; window.READY = true;
