// t_goosebumps.js: "Why do we get goosebumps?" in template #28 Sand art (demo t28, x.com/Michaelzsguo). Canvas2D 1080x1920, pure function of t.
// Demo grammar reused: a warm sepia light table (bright centre, blotchy darker edges, heavy moving grain); dark sand silhouettes standing on a
// dark sand horizon; shapes that FORM from falling sand (grains rain down and settle into the silhouette, then the solid shape fills in) and
// LEAVE by a hand sweep (a horizontal smear band with streaks); light drawn as sun rays through the sand; serif titles top-left with an italic
// sub-line (LibreBaskerville), like the demo's "1863 / Emancipation". Captions are cream serif type on the dark sand ground.
// Batch N layout: captions inside x 80-880, bottom at y 1355; titles at y 270-460; silhouettes inside y 250-1120; badge strip y 1366-1440 free.
await Promise.all(['700 96px Bask', 'italic 400 52px BaskI', '400 50px Bask'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540, HZ = 1010, DY = -110;   // HZ: sand horizon; DY: scene drawings are lifted to stand on it
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let g = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const fr = x => x - Math.floor(x), hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const SAND = '#2b2016', SAND2 = '#4a3a28', LIGHT = '#fff1c9', CREAM = '#f3e2b8';
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };

// ---------- the light table: sepia glow, blotches, grain (two grain tiles, offset per 12 fps step) ----------
const [BGc, BGg] = mk(W, H);
{ const gr = BGg.createRadialGradient(CX, 760, 80, CX, 860, 1300); gr.addColorStop(0, '#f4e3b6'); gr.addColorStop(.55, '#d9bf8a'); gr.addColorStop(1, '#8c7148'); BGg.fillStyle = gr; BGg.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = hash(i) * W, y = hash(i + 9) * H, r = 80 + 260 * hash(i + 3); const b = BGg.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(120,90,50,${.05 + .07 * hash(i + 5)})`); b.addColorStop(1, 'rgba(120,90,50,0)'); BGg.fillStyle = b; BGg.fillRect(x - r, y - r, 2 * r, 2 * r); } }
const GRAIN = [0, 1].map(k => { const [c, cg] = mk(512, 512), id = cg.createImageData(512, 512); for (let i = 0; i < id.data.length; i += 4) { const v = hash(i * .37 + k * 9.1) < .5 ? 0 : 255, a = Math.floor(hash(i * .91 + k) * 40); id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = a; } cg.putImageData(id, 0, 0); return c; });
const step = t => Math.floor(t * 12) / 12;
function table(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(BGc, 0, 0); }
function grain(t) { const q = Math.floor(t * 12), pat = g.createPattern(GRAIN[q % 2], 'repeat'); pat.setTransform(new DOMMatrix([1, 0, 0, 1, hash(q) * 512, hash(q + 3) * 512])); g.save(); g.fillStyle = pat; g.fillRect(0, 0, W, H); g.restore(); }

// ---------- sand silhouettes: path fill + grainy edge; formForm(k) = grains fall in, then the solid fills ----------
const [Mc, Mg] = mk(W, H);
function sandFill(path, col = SAND, a = 1) { g.save(); g.globalAlpha = a; g.fillStyle = col; g.fill(path); g.globalAlpha = a * .55; g.lineWidth = 3; g.strokeStyle = SAND2; g.setLineDash([2, 5]); g.stroke(path); g.restore(); }
const PTS = new Map();
function inside(path, key, n, box) { if (PTS.has(key)) return PTS.get(key); const out = []; let tries = 0; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); while (out.length < n && tries < n * 40) { tries++; const x = box[0] + hash(tries * 1.31 + key.length) * box[2], y = box[1] + hash(tries * 2.77 + 9) * box[3]; if (g.isPointInPath(path, x, y)) out.push([x, y]); } g.restore(); PTS.set(key, out); return out; }
// k: 0 = scattered sand above, .7 = grains settled, 1 = solid. out: 0..1 sweeps it away to the right
function sandShape(path, key, box, k, o = {}) { if (k <= 0) return; const P = inside(path, key, o.n || 520, box), u = eo(clamp(k / .75)), solid = ss(.6, 1, k), out = o.out || 0;
  if (solid > 0) { g.save(); if (out > 0) { g.beginPath(); g.rect(lerp(-80, 1160, eo(out)), 0, 2000, H); g.clip(); } sandFill(path, o.col || SAND, solid); g.restore(); }
  if (solid < 1 || out > 0) { g.fillStyle = o.col || SAND; for (let i = 0; i < P.length; i++) { const [x, y] = P[i], h1 = hash(i * 3.3 + key.length), x0 = x + (h1 - .5) * 260, y0 = 200 - 300 * hash(i * 5.1), kk = clamp((u - h1 * .35) / .65);
      let px = lerp(x0, x, eo(kk)), py = lerp(y0, y, kk * kk); if (out > 0) { const sw = clamp((eo(out) * 1240 - 80 - x) / 200); px += sw * (200 + 300 * h1); py += sw * (hash(i) - .5) * 60; }
      g.globalAlpha = (1 - solid * .9) * (out > 0 ? 1 - clamp((eo(out) * 1240 - 80 - x) / 400) : 1); const r = 2 + 3 * hash(i * 7.7); g.fillRect(px - r / 2, py - r / 2, r, r * .8); } g.globalAlpha = 1; } }
// hand sweep wipe: a smear band moving left to right (k 0..1)
function sweep(k) { if (k <= 0 || k >= 1) return; const x = lerp(-200, 1280, eo(k)); g.save(); for (let i = 0; i < 70; i++) { const y = 240 + hash(i * 3.1) * 900, len = 80 + 260 * hash(i * 7.3), w = 3 + 9 * hash(i * 1.9); g.globalAlpha = .08 + .14 * hash(i * 2.2); g.fillStyle = SAND2; g.fillRect(x - len, y, len, w * .6); } g.restore(); }
function ground(t) { const p = new Path2D(); p.moveTo(0, HZ); for (let x = 0; x <= W; x += 30) p.lineTo(x, HZ + 6 * Math.sin(x * .01 + 1) + 4 * Math.sin(x * .031)); p.lineTo(W, H); p.lineTo(0, H); p.closePath(); sandFill(p, SAND, 1);
  g.save(); g.globalAlpha = .18; g.fillStyle = '#7a6040'; for (let i = 0; i < 260; i++) { const x = hash(i * 1.7) * W, y = HZ + 30 + hash(i * 2.9) * 330; g.fillRect(x, y, 3, 2); } g.restore(); }
function rays(x, y, r, a, t) { if (a <= 0) return; g.save(); g.globalAlpha = a; const gl = g.createRadialGradient(x, y, 0, x, y, r * 2.6); gl.addColorStop(0, 'rgba(255,244,205,.95)'); gl.addColorStop(.35, 'rgba(255,236,190,.35)'); gl.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gl; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  g.strokeStyle = 'rgba(255,244,210,.5)'; g.lineWidth = 6; for (let i = 0; i < 18; i++) { const an = i / 18 * TAU + t * .05; g.beginPath(); g.moveTo(x + Math.cos(an) * r * 1.2, y + Math.sin(an) * r * 1.2); g.lineTo(x + Math.cos(an) * r * (2.2 + .5 * hash(i)), y + Math.sin(an) * r * (2.2 + .5 * hash(i))); g.stroke(); }
  g.fillStyle = LIGHT; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }

// ---------- sand drawings in the dark ground (light grains scratched in, drawn on progressively with a trickle at the tip) ----------
function scratch(pts, k, w = 6) { if (k <= 0) return; let tot = 0; const Ls = [0]; for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(tot); } const lim = tot * clamp(k);
  g.save(); g.strokeStyle = 'rgba(214,186,130,.75)'; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); let tip = pts[0];
  for (let i = 0; i < pts.length; i++) { if (Ls[i] > lim) { const a = pts[i - 1], b = pts[i], u = (lim - Ls[i - 1]) / (Ls[i] - Ls[i - 1] || 1); tip = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; g.lineTo(...tip); break; } i ? g.lineTo(...pts[i]) : g.moveTo(...pts[i]); tip = pts[i]; } g.stroke();
  if (k < 1) { g.fillStyle = 'rgba(236,212,160,.9)'; for (let j = 0; j < 14; j++) g.fillRect(tip[0] + (hash(j + ST2) - .5) * 14, tip[1] - 40 + hash(j * 3 + ST2) * 40, 3, 3); } g.restore(); }
let ST2 = 0;
const Dl = (x0, x1, y, n, f) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [lerp(x0, x1, u), y + f(u)]; });
function doodle(k, lt, t) { ST2 = Math.floor(t * 12); const y = 1068, d = clamp((lt - .1) / 1.6);
  const thermo = (x, lev, kk) => { scratch([[x, y - 60], [x, y + 40]], kk, 18); scratch(Array.from({ length: 21 }, (_, i) => [x + Math.cos(i / 20 * TAU) * 22, y + 62 + Math.sin(i / 20 * TAU) * 22]), kk, 6); if (kk >= 1) { g.fillStyle = 'rgba(236,212,160,.9)'; g.fillRect(x - 5, y + 40 - 100 * lev, 10, 100 * lev); } };
  if (k <= 1) { scratch(Dl(120, 760, y, 40, u => 8 * Math.sin(u * 18 + t * 2)), d); thermo(860, lerp(.8, .25, ss(.5, 2.5, lt)), clamp(d * 2)); return; }
  if (k <= 4) { const xs = [150, 380, 610, 840], lab = ['cold', 'nerve', 'muscle', 'hair up']; xs.forEach((x, j) => { const kk = clamp(d * 4 - j); scratch(Array.from({ length: 21 }, (_, i) => [x + Math.cos(i / 20 * TAU) * 34, y + Math.sin(i / 20 * TAU) * 34]), kk, 5); if (j < 3) scratch([[x + 44, y], [xs[j + 1] - 44, y]], clamp(d * 4 - j - .5), 5); if (kk > .9) { g.save(); g.font = 'italic 400 30px BaskI'; g.textAlign = 'center'; g.fillStyle = 'rgba(236,212,160,.95)'; g.fillText(lab[j], x, y + 66); g.restore(); } }); return; }
  if (k <= 8) { const fur = k <= 6 ? 1 : k === 7 ? .7 : lerp(.7, .15, ss(.4, 2.4, lt)); scratch(Dl(110, 870, y + 10, 60, u => -((Math.floor(u * 60) % 2) ? 40 * fur * (.6 + .4 * hash(Math.floor(u * 60))) : 0)), d, 5); return; }
  if (k <= 10 || k === 13) { scratch(Dl(110, 640, y, 30, u => 14 * Math.sin(u * 9)), d, 6); for (let j = 0; j < 5; j++) { const kk = clamp(d * 3 - 1 - j * .2); if (kk > 0) { g.fillStyle = `rgba(236,212,160,${.9 * kk})`; g.beginPath(); g.arc(700 + j * 44, y + (j % 2) * 16, 14, 0, TAU); g.fill(); } } return; }
  if (k <= 14) { scratch([[110, y + 40], [870, y + 40]], d, 5); const days = Math.floor(clamp(d * 1.2) * 8); for (let j = 0; j < days; j++) { const x = 140 + j * 100, h = 10 + j * 8 * (k >= 12 ? 1 : .4); scratch([[x, y + 40], [x, y + 40 - h]], 1, 5); } g.save(); g.font = 'italic 400 30px BaskI'; g.fillStyle = 'rgba(236,212,160,.9)'; g.globalAlpha = clamp(d * 2); g.fillText('days of cold (mice)', 620, y - 6); g.restore(); return; }
  if (k <= 16) { thermo(860, .3, clamp(d * 2)); scratch(Dl(120, 760, y, 40, u => 8 * Math.sin(u * 18 + t * 2)), d); } }

// ---------- type (demo: serif title + italic sub-line, top-left) ----------
let TT = []; function title(...args) { TT.push(args); }
function drawTitle(str, sub, k, o = {}) { if (k <= 0) return; const a = clamp(k / .5); g.save(); g.globalAlpha = a; g.fillStyle = o.col || SAND; g.textBaseline = 'alphabetic';
  g.font = `700 ${o.size || 96}px Bask`; g.fillText(str, o.x ?? 90, o.y ?? 360); if (sub) { g.font = `italic 400 ${o.subSize || 50}px BaskI`; g.fillText(sub, (o.x ?? 90) + 4, (o.y ?? 360) + 70); } g.restore(); }
function label(str, x, y, k, o = {}) { if (k <= 0) return; g.save(); g.globalAlpha = clamp(k / .4); g.font = `italic 400 ${o.size || 46}px BaskI`; g.textAlign = o.align || 'center'; g.fillStyle = o.col || SAND; g.fillText(str, x, y); g.restore(); }
function caption(t) { let i = -1; for (let k = 0; k < PH.length - 1; k++) if (t >= PH[k].start - .1 && t < PH[k + 1].start - .1) i = k; if (i < 0) return; const p = PH[i];
  g.save(); g.font = '400 46px Bask'; let bold = false; const toks = p.cap.split(' ').map(w => { if (w.startsWith('**')) bold = true; const r = { w: w.replace(/\*\*/g, ''), b: bold }; if (w.replace(/[.,!?:;]+$/, '').endsWith('**')) bold = false; return r; });
  const lines = [[]]; let lw = 0; toks.forEach(o => { const ww = g.measureText(o.w + ' ').width; if (lw + ww > 800 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...o, ww }); lw += ww; });
  const lh = 58, y0 = 1355 - lines.length * lh + 46, a = clamp((t - p.start + .1) / .3), prog = clamp((t - p.start) / Math.max(.6, p.end - p.start - .2)), n = toks.length; let idx = 0;
  lines.forEach((ln, j) => { const tw = ln.reduce((q, o) => q + o.ww, 0); let x = 480 - tw / 2; ln.forEach(o => { g.font = o.b ? 'italic 400 48px BaskI' : '400 46px Bask'; g.fillStyle = o.b ? '#f6c96a' : CREAM; g.globalAlpha = a * (idx / n <= prog + .03 ? 1 : .45); g.fillText(o.w, x, y0 + j * lh); x += o.ww; idx++; }); });
  g.restore(); }

// ---------- silhouettes (Path2D builders) ----------
function arm(x, y, s = 1) { const p = new Path2D(); p.moveTo(x - 520 * s, y - 70 * s); p.bezierCurveTo(x - 200 * s, y - 110 * s, x + 120 * s, y - 95 * s, x + 260 * s, y - 70 * s); p.bezierCurveTo(x + 330 * s, y - 120 * s, x + 420 * s, y - 110 * s, x + 450 * s, y - 60 * s);
  p.bezierCurveTo(x + 470 * s, y - 20 * s, x + 450 * s, y + 40 * s, x + 380 * s, y + 60 * s); p.bezierCurveTo(x + 200 * s, y + 80 * s, x - 200 * s, y + 90 * s, x - 520 * s, y + 80 * s); p.closePath();
  for (let j = 0; j < 4; j++) { const fy = y - 62 * s + j * 30 * s; p.moveTo(x + 430 * s, fy); p.bezierCurveTo(x + 500 * s, fy - 8 * s, x + 560 * s - j * 12 * s, fy, x + 565 * s - j * 14 * s, fy + 12 * s); p.bezierCurveTo(x + 560 * s - j * 12 * s, fy + 26 * s, x + 500 * s, fy + 24 * s, x + 430 * s, fy + 22 * s); p.closePath(); }
  p.moveTo(x + 400 * s, y - 70 * s); p.bezierCurveTo(x + 440 * s, y - 130 * s, x + 500 * s, y - 150 * s, x + 520 * s, y - 130 * s); p.bezierCurveTo(x + 500 * s, y - 110 * s, x + 460 * s, y - 90 * s, x + 440 * s, y - 60 * s); p.closePath(); return p; }
function goose(x, y, s = 1, step2 = 0) { const p = new Path2D(), b = step2 ? 6 : 0; p.moveTo(x - 120 * s, y); p.bezierCurveTo(x - 140 * s, y - 90 * s, x + 20 * s, y - 120 * s, x + 70 * s, y - 80 * s); p.bezierCurveTo(x + 90 * s, y - 160 * s, x + 80 * s, y - 230 * s, x + 110 * s, y - 250 * s - b);
  p.bezierCurveTo(x + 140 * s, y - 270 * s - b, x + 175 * s, y - 255 * s - b, x + 200 * s, y - 245 * s - b); p.lineTo(x + 150 * s, y - 230 * s - b); p.bezierCurveTo(x + 120 * s, y - 200 * s, x + 130 * s, y - 120 * s, x + 130 * s, y - 60 * s); p.bezierCurveTo(x + 120 * s, y + 10 * s, x + 20 * s, y + 30 * s, x - 120 * s, y); p.closePath();
  p.rect(x - 20 * s, y + 10 * s, 10 * s, 70 * s); p.rect(x + 30 * s, y + 10 * s, 10 * s, 70 * s); return p; }
function cat(x, y, s = 1, puff = 0) { const p = new Path2D(), N = 90, R = (a) => { const body = 1; return body; };
  // sitting cat in profile, outline sampled then pushed outward by "puff" with spiky fur noise
  const base = [[-150, 0], [-170, -120], [-140, -240], [-80, -300], [-60, -390], [-80, -440], [-60, -470], [-20, -430], [40, -440], [70, -480], [80, -420], [90, -360], [60, -300], [110, -230], [140, -120], [130, 0]];
  const pts = []; for (let i = 0; i < base.length; i++) { const a = base[i], b = base[(i + 1) % base.length]; for (let j = 0; j < 8; j++) { const u = j / 8; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); } }
  const cx = -10, cy = -220; pts.forEach(([px, py], i) => { const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, spike = puff * (18 + 26 * hash(i * 3.7)) * (i % 2 ? 1 : .4), nx = px + dx / d * (puff * 30 + spike), ny = py + dy / d * (puff * 30 + spike) * (py > -10 ? 0 : 1); i ? p.lineTo(x + nx * s, y + ny * s) : p.moveTo(x + nx * s, y + ny * s); }); p.closePath();
  const tail = new Path2D(); tail.moveTo(x + 120 * s, y - 10 * s); tail.bezierCurveTo(x + 260 * s, y, x + 280 * s, y - 120 * s, x + 230 * s, y - 220 * s); tail.lineTo(x + 230 * s + 20 * s + puff * 20 * s, y - 210 * s); tail.bezierCurveTo(x + 310 * s, y - 100 * s, x + 270 * s, y + 30 * s, x + 120 * s, y + 20 * s); tail.closePath(); p.addPath(tail); return p; }
function person(x, y, s = 1, fur = 0, stoop = 0) { const p = new Path2D(), sx = stoop * 50;
  // standing figure: head, neck, shoulders, arms a little away from the body, legs; fur = spiky outline, stoop = leaning ancestor
  const O = [[-30, -470], [-95, -440], [-120, -380], [-150, -230], [-160, -130], [-130, -125], [-110, -250], [-95, -300], [-90, -150], [-75, 0], [-15, 0], [-5, -170], [5, -170], [15, 0], [75, 0], [90, -150], [95, -300], [110, -250], [130, -125], [160, -130], [150, -230], [120, -380], [95, -440], [30, -470]];
  const pts = []; for (let i = 0; i < O.length; i++) { const a = O[i], b = O[(i + 1) % O.length]; for (let j = 0; j < 5; j++) { const u = j / 5; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); } }
  pts.forEach(([a, b], i) => { const lean = b < -250 ? sx * (-b - 250) / 220 : 0, f = fur * (5 + 13 * hash(i * 2.3)) * (i % 2), nx = a + Math.sign(a || 1) * f + lean, ny = b - (b < -300 ? f * .5 : 0); i ? p.lineTo(x + nx * s, y + ny * s) : p.moveTo(x + nx * s, y + ny * s); }); p.closePath();
  p.moveTo(x + (sx + 62) * s, y - 540 * s); p.arc(x + sx * s, y - 540 * s, (62 + fur * 14) * s, 0, TAU); return p; }
function mouse(x, y, s = 1, fur = 0) { const p = new Path2D(); const P = []; for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI, rr = 1 + fur * (.08 + .1 * hash(i * 4.1)) * (i % 2); P.push([x + Math.cos(a) * 160 * s * rr, y + Math.sin(a) * 110 * s * rr]); }
  P.forEach(([a, b], i) => i ? p.lineTo(a, b) : p.moveTo(a, b)); p.lineTo(x + 150 * s, y); p.lineTo(x + 230 * s, y - 20 * s); p.lineTo(x + 160 * s, y - 60 * s); p.closePath(); p.moveTo(x + 120 * s, y - 100 * s); p.arc(x + 100 * s, y - 110 * s, 34 * s, 0, TAU);
  const tl = new Path2D(); tl.moveTo(x - 160 * s, y - 10 * s); tl.bezierCurveTo(x - 260 * s, y - 20 * s, x - 300 * s, y - 120 * s, x - 380 * s, y - 90 * s); tl.lineTo(x - 378 * s, y - 80 * s); tl.bezierCurveTo(x - 300 * s, y - 100 * s, x - 270 * s, y, x - 160 * s, y + 4 * s); tl.closePath(); p.addPath(tl); return p; }
// skin cross-section: surface at y0, follicle, hair angle (0 = lying, 1 = upright), muscle, nerve
function skin(k, up, o = {}) { const y0 = 640, fx = 420; const surf = new Path2D(); surf.moveTo(60, y0); for (let x = 60; x <= 1020; x += 20) { const bump = up * 46 * Math.exp(-Math.pow((x - fx - 20) / 70, 2)); surf.lineTo(x, y0 - bump + 3 * Math.sin(x * .05)); } surf.lineTo(1020, 1110); surf.lineTo(60, 1110); surf.closePath();
  sandShape(surf, 'skin', [60, 560, 960, 560], k, { col: '#5a4630', n: 700 }); if (k < .6) return { fx, y0 };
  const th = lerp(.42, 1.35, eo(up)), rx = fx, ry = 880, hx = rx + Math.cos(th) * 320, hy = ry - Math.sin(th) * 320;
  g.save(); g.globalAlpha = ss(.6, 1, k); g.fillStyle = '#e8d3a2'; g.beginPath(); g.ellipse(rx + Math.cos(th) * 120, ry - Math.sin(th) * 120, 150, 34, -th, 0, TAU); g.fill();   // follicle (a light hollow in the sand)
  g.strokeStyle = SAND; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(rx, ry); g.lineTo(hx, hy); g.stroke();   // hair
  const mus = new Path2D(); mus.moveTo(fx + 20, 860); mus.quadraticCurveTo(fx + 120 - up * 30, 820, fx + 230 - up * 40, 700 + up * 20); mus.lineTo(fx + 250 - up * 40, 720 + up * 20); mus.quadraticCurveTo(fx + 130 - up * 30, 850, fx + 26, 890); mus.closePath(); g.fillStyle = '#c78f5a'; g.fill(mus);  // arrector pili
  if (o.nerve) { const nk = clamp(o.nerve); g.strokeStyle = `rgba(255,240,200,${.9 * nk})`; g.lineWidth = 7; g.shadowColor = 'rgba(255,230,170,.9)'; g.shadowBlur = 18; g.beginPath(); g.moveTo(1020, 1020); g.bezierCurveTo(820, 1000, 760, 860, fx + 240 - up * 40, 720 + up * 20); g.stroke(); }
  if (o.stem) { for (let j = 0; j < 7; j++) { const a = j / 7 * TAU, x = fx + 40 + Math.cos(a) * 46, y = 900 + Math.sin(a) * 30; g.fillStyle = `rgba(255,241,201,${.95 * clamp(o.stem)})`; g.beginPath(); g.arc(x, y, 16, 0, TAU); g.fill(); }
    if (o.stemLink) { g.strokeStyle = `rgba(255,240,200,${.9 * clamp(o.stemLink)})`; g.lineWidth = 6; g.beginPath(); g.moveTo(780, 930); g.quadraticCurveTo(620, 960, fx + 80, 905); g.stroke(); } }
  g.restore(); return { fx, y0 }; }

// ---------- scenes ----------
const SC = [];
const L = (i, t) => t - (i ? s(i) - .2 : -1);
let ARMTOP = null;
SC[0] = (t, lt) => { const P = arm(300, 880, 1.4); sandShape(P, 'armBig', [0, 600, 1080, 420], 1, { n: 900 }); const bumps = ss(.3, 2.2, lt);
  if (!ARMTOP) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); ARMTOP = Array.from({ length: 16 }, (_, i) => { const x = 20 + i * 58; for (let y = 600; y < 1000; y += 2) if (g.isPointInPath(P, x, y)) return [x, y]; return [x, 900]; }); g.restore(); }
  g.fillStyle = SAND; g.strokeStyle = SAND; g.lineCap = 'round'; ARMTOP.forEach(([x, y], i) => { const r = 8 + 14 * bumps * (.8 + .4 * hash(i));
    g.beginPath(); g.arc(x, y + 4, r, Math.PI, 0); g.fill(); g.lineWidth = 5; g.beginPath(); g.moveTo(x, y + 2 - r * .6); g.lineTo(x + lerp(46, 8, bumps), y - r * .6 - lerp(14, 72, bumps)); g.stroke(); });
  for (let i = 0; i < 9; i++) { const y = 360 + i * 30, x = ((step(t) * 600 + i * 230) % 1300) - 200; g.fillStyle = 'rgba(74,58,40,.35)'; g.fillRect(x, y + 120, 160 + 60 * hash(i), 4); }
  title('Why goose bumps?', 'a cold breeze', 1, { y: 330, size: 90 }); };
SC[1] = (t, lt) => { sandShape(goose(560, 1060, 1.5), 'goose2', [330, 660, 520, 480], clamp(lt / 1.4), {}); const f = new Path2D(); f.moveTo(760, 480); f.bezierCurveTo(860, 420, 940, 330, 960, 300); f.bezierCurveTo(930, 380, 860, 470, 770, 500); f.closePath(); sandShape(f, 'feather', [750, 290, 230, 230], clamp((lt - .8) / 1.2));
  if (lt > 2.4) { g.save(); g.strokeStyle = '#8a2a1a'; g.lineWidth = 12; g.globalAlpha = clamp((lt - 2.4) / .3); g.beginPath(); g.moveTo(740, 300); g.lineTo(980, 520); g.stroke(); g.restore(); } title('No feathers.', 'so why?', lt - .3, { y: 330 }); };
SC[2] = (t, lt) => { skin(clamp(lt / 1.3), 0); label('arrector pili', 760, 960, lt - 1.4, { col: CREAM }); title('Under every hair', 'a tiny muscle', lt - .2, { y: 330, size: 84 }); };
SC[3] = (t, lt) => { skin(1, 0, { nerve: clamp((lt - .3) / .8) }); label('nerve', 900, 1060, lt - .8, { col: CREAM }); title('Cold!', 'a nerve says: squeeze', lt - .2, { y: 330 }); rays(880, 330, 50, .6, t); };
SC[4] = (t, lt) => { const up = ss(.3, 2.2, lt); skin(1, up, { nerve: 1 }); label('the bump', 250, 620, lt - 2, {}); title('Pull!', 'the hair stands up', lt - .2, { y: 330 }); };
SC[5] = (t, lt) => { const pf = ss(1.6, 3.4, lt); sandShape(cat(470, 1110, 1.08, pf), 'cat' + Math.round(pf * 6), [200, 520, 640, 620], lt < 1.5 ? clamp(lt / 1.4) : 1, { n: 600 }); title('A cat in the cold', 'every hair stands up', lt - .2, { y: 330, size: 84 }); };
SC[6] = (t, lt) => { rays(470, 790, 150, ss(.3, 1.4, lt) * .7, t); sandShape(cat(470, 1110, 1.08, 1), 'cat6', [200, 520, 640, 620], 1); title('A fluffy coat', 'of trapped warm air', lt - .2, { y: 330, size: 88 }); };
SC[7] = (t, lt) => { sandShape(person(620, 1110, .95, 1, 1), 'ape', [400, 460, 480, 660], clamp(lt / 1.6), { n: 600 }); title('Our hairy', 'ancestors', lt - .2, { y: 330 }); rays(300, 640, 44, .55, t); };
SC[8] = (t, lt) => { const loss = ss(.4, 2.4, lt); sandShape(person(620, 1110, .95, 1 - loss, 1 - loss), 'man' + Math.round(loss * 5), [400, 460, 480, 660], 1, { n: 500 });
  g.fillStyle = SAND; for (let i = 0; i < 60; i++) { const f = clamp(loss * 1.4 - hash(i) * .4); if (f <= 0 || f >= 1) continue; g.globalAlpha = 1 - f; g.fillRect(620 + (hash(i * 3) - .5) * 260 + f * 400, 700 + hash(i * 7) * 380 - f * 80, 4, 3); } g.globalAlpha = 1; title('Mostly', 'a leftover', lt - .2, { y: 330 }); };
SC[9] = (t, lt) => { const mic = new Path2D(); mic.moveTo(380, 1110); mic.lineTo(780, 1110); mic.lineTo(760, 1060); mic.lineTo(400, 1060); mic.closePath();           // base
  mic.moveTo(620, 1060); mic.bezierCurveTo(800, 980, 800, 720, 640, 600); mic.lineTo(600, 640); mic.bezierCurveTo(720, 740, 720, 940, 560, 1060); mic.closePath();   // arm
  mic.rect(430, 860, 260, 30);                                                                                  // stage
  mic.moveTo(470, 560); mic.lineTo(560, 470); mic.lineTo(640, 800); mic.lineTo(560, 830); mic.closePath();      // tube (tilted)
  mic.rect(440, 520, 70, 50); mic.moveTo(545, 830); mic.lineTo(585, 830); mic.lineTo(575, 860); mic.lineTo(555, 860); mic.closePath();   // eyepiece, lens
  g.save(); g.translate(580, 1110); g.scale(.78, .78); g.translate(-580, -1110); sandShape(mic, 'mic', [370, 460, 440, 660], clamp(lt / 1.4), { n: 650 }); g.restore(); rays(860, 620, 40, ss(1.4, 2.2, lt) * .6, t); title('The twist', 'Harvard, a second job', lt - .2, { y: 330, size: 92 }); };
SC[10] = (t, lt) => { skin(1, .2, { nerve: 1, stem: clamp((lt - .3) / .6), stemLink: clamp((lt - 1) / .8) }); label('hair stem cells', 470, 1060, lt - .8, { col: CREAM }); title('A second wire', 'to the hair-growing cells', lt - .2, { y: 330, size: 84 }); };
SC[11] = (t, lt) => { sandShape(mouse(600, 1100, 1.6, 0), 'mouse', [0, 800, 1080, 310], clamp(lt / 1.2), { n: 700 }); for (let i = 0; i < 50; i++) { const y = 260 + ((hash(i) * 850 + step(t) * 90) % 850), x = 60 + hash(i * 3) * 960; g.fillStyle = 'rgba(255,245,220,.8)'; g.beginPath(); g.arc(x, y, 4 + 3 * hash(i * 5), 0, TAU); g.fill(); }
  const fl = Math.floor(t * 8) % 2; g.save(); g.strokeStyle = `rgba(255,240,200,${.5 + .4 * fl})`; g.lineWidth = 8; g.shadowColor = 'rgba(255,230,170,.9)'; g.shadowBlur = 20; g.beginPath(); g.moveTo(560, 1010); g.lineTo(620, 930); g.lineTo(590, 880); g.lineTo(680, 790); g.stroke(); g.restore(); title('In mice', 'a long cold spell', lt - .2, { y: 330 }); };
SC[12] = (t, lt) => { const fu = ss(.2, 2.6, lt); sandShape(mouse(600, 1100, 1.6, fu * 2.2), 'mouseF' + Math.round(fu * 6), [0, 760, 1080, 350], 1, { n: 700 }); title('More fur', 'in mice: grew faster', lt - .2, { y: 330 }); rays(840, 600, 46, .5, t); };
SC[13] = (t, lt) => { skin(1, .3, { nerve: 1, stem: 1, stemLink: 1 }); const pk = ss(.4, 1.2, lt); g.save(); g.strokeStyle = `rgba(255,241,201,${pk})`; g.lineWidth = 6; g.setLineDash([12, 10]); g.beginPath(); g.ellipse(640, 760, 120, 90, -.6, 0, TAU); g.stroke(); g.restore();
  label('the muscle holds the nerve in place', 540, 1070, lt - 1, { col: CREAM, size: 42 }); title('Plugged in', 'by the goosebump muscle', lt - .2, { y: 330, size: 90 }); };
SC[14] = (t, lt) => { g.save(); g.fillStyle = 'rgba(43,32,22,.25)'; g.fillRect(538, 470, 4, 640); g.restore(); sandShape(cat(290, 1110, .55, ss(.3, 1.2, lt)), 'catQ' + Math.round(ss(.3, 1.2, lt) * 4), [150, 800, 320, 320], 1); sandShape(mouse(790, 1100, .7, ss(1.6, 3.2, lt) * 2.4), 'mouseL' + Math.round(ss(1.6, 3.2, lt) * 5), [560, 990, 460, 130], clamp((lt - 1.2) / .8));
  label('quick cold', 290, 640, lt - .2, { size: 50 }); label('hair stands up', 290, 700, lt - .4, { size: 40 }); label('long cold', 790, 640, lt - 1.4, { size: 50 }); label('more fur (mice)', 790, 700, lt - 1.6, { size: 40 }); title('Short vs long', '', lt - .1, { y: 330, size: 90 }); };
SC[15] = (t, lt) => { rays(620, 760, 90, ss(.6, 2, lt) * .5, t); const p = person(620, 1110, .95, 0, 0), ghost = person(620, 1110, .95, 1.6, 0); g.save(); g.globalAlpha = .45 * ss(.4, 1.6, lt); g.fillStyle = '#7a5f3e'; g.fill(ghost); g.restore(); sandShape(p, 'manF', [400, 460, 480, 660], 1);
  title('An old fur coat', 'still keeping you warm', lt - .2, { y: 330, size: 88 }); };
SC[16] = (t, lt) => { const gm = new Path2D(); gm.rect(380, 930, 320, 140); gm.rect(530, 800, 26, 140); gm.moveTo(540, 820); gm.bezierCurveTo(600, 620, 760, 560, 860, 520); gm.lineTo(900, 700); gm.bezierCurveTo(800, 700, 640, 760, 556, 850); gm.closePath(); sandShape(gm, 'gramo', [370, 500, 540, 580], clamp(lt / 1.2));
  for (let j = 0; j < 4; j++) { const ph = (t * .5 + j * .25) % 1; label('♪', 760 + ph * 160 + 30 * Math.sin(ph * 6 + j), 560 - ph * 260, 1, { size: 80, col: SAND2 }); } title('Music too?', 'yes or no', lt - .2, { y: 330 }); };
SC[17] = (t, lt) => { rays(540, 560, 70, .6, t); g.save(); g.textAlign = 'center'; g.fillStyle = SAND; g.globalAlpha = clamp(lt / .5); g.font = '700 74px Bask'; g.fillText('Follow for more of', CX, 800); g.fillText('how it really works.', CX, 890);
  g.font = "italic 400 48px BaskI"; g.fillText("A new 'wait, really?' every day.", CX, 980); g.fillStyle = '#6b4a22'; g.fillText('@howitreallyworkstudio', CX, 1050); g.restore(); };

const START = PH.map(p => p.start); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .2) k = i; return k; }
function draw(t) { const k = sceneAt(t), lt = k === 0 ? t + 1 : t - (START[k] - .2); table(t); ground(t); TT = []; g.save(); g.translate(0, DY); SC[k](t, lt); g.restore(); TT.forEach(a => drawTitle(...a)); doodle(k, lt, t); if (k > 0 && lt < .55) sweep(lt / .55); if (k < SC.length - 1) caption(t); grain(t); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = g; g = F0.getContext('2d'); draw(0); g = keep; }
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { g.save(); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } }

const r = (i, d = 0) => s(i) + d;
window.CUES = [['whoosh', .3], ['whoosh', 1.6], ['pop', 2.2], ['whoosh', r(1, -.2)], ['scribble', r(1, .1), r(1, 1.4)], ['snap', r(1, 2.4)], ['whoosh', r(2, -.2)], ['scribble', r(2, 0), r(2, 1.3)], ['whoosh', r(3, -.2)], ['chime', r(3, .4), 84],
  ['whoosh', r(4, -.2)], ['slide', r(4, .4)], ['pop', r(4, 2)], ['whoosh', r(5, -.2)], ['scribble', r(5, 0), r(5, 1.4)], ['sparkle', r(5, 1.8)], ['whoosh', r(6, -.2)], ['chime', r(6, .4), 79], ['whoosh', r(7, -.2)], ['scribble', r(7, 0), r(7, 1.6)],
  ['whoosh', r(8, -.2)], ['whoosh', r(8, .8)], ['whoosh', r(9, -.2)], ['chime', r(9, 1.6), 83], ['whoosh', r(10, -.2)], ['chime', r(10, 1.0), 86], ['whoosh', r(11, -.2)], ['tick', r(11, .5)], ['tick', r(11, 1.0)], ['whoosh', r(12, -.2)], ['sparkle', r(12, 1)],
  ['whoosh', r(13, -.2)], ['pop', r(13, .5)], ['whoosh', r(14, -.2)], ['pop', r(14, .4)], ['pop', r(14, 1.6)], ['whoosh', r(15, -.2)], ['chime', r(15, .8), 79], ['whoosh', r(16, -.2)], ['note', r(16, .6), 72], ['note', r(16, 1.0), 76], ['whoosh', r(17, -.2)], ['chime', r(17, .3), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { table(2); ground(2); g.save(); g.translate(0, DY); sandShape(cat(470, 1110, 1.1, 1), 'catT', [220, 520, 600, 620], 1); rays(860, 560, 50, .6, 2); g.restore(); g.save(); g.fillStyle = SAND; g.font = '700 130px Bask'; g.fillText('Why', 90, 330); g.fillText('goose-', 90, 470); g.fillText('bumps?', 90, 610); g.restore(); grain(2); };
window.seek(0); window.ready = true; window.READY = true;
