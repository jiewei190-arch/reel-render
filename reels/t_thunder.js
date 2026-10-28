// t_thunder.js: "Why does thunder rumble instead of just bang?" in template #28 Sand art (demo t28, x.com/Michaelzsguo). Canvas2D 1080x1920, pure function of t.
// Demo grammar reused (kit shared with t_goosebumps.js): the warm sepia light table with heavy 12 fps grain, dark sand silhouettes on a sand horizon,
// hand-sweep wipes between scenes, serif titles with an italic sub-line. Sand-art light: the storm sky is a layer of dark sand and the lightning and
// the sound are CLEARED through it, so the bolt and every sound ring glow with the table's light. The rumble machine: rings leave every point of
// a long crooked bolt at the same speed, the listener hears the nearest point first, and the arrivals stack up in a strip into one long rumble.
// Batch N layout: captions inside x 80-880 ending at y 1355 on the dark ground; titles y 290-430; badge strip y 1366-1440 free.
await Promise.all(['700 96px Bask', 'italic 400 52px BaskI', '400 50px Bask'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540, HZ = 1050;   // HZ: sand horizon
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
let ST2 = 0;
// sand ripples scratched into the dark ground below the captions (they drift slowly, like the demo's ground drawings)
function ripples(t) { for (let r = 0; r < 6; r++) { const y = 1460 + r * 72, ph = t * .25 + r * 1.3; scratch(Array.from({ length: 41 }, (_, i) => { const u = i / 40; return [lerp(40, 1040, u), y + 14 * Math.sin(u * 9 + ph) + 6 * Math.sin(u * 23 - ph)]; }), 1, 4 + (r % 2)); }
  for (let i = 0; i < 9; i++) { const x = 90 + i * 115 + 20 * Math.sin(i), y = 1430 + (i % 3) * 170 + 30; scratch(Array.from({ length: 13 }, (_, j) => [x + Math.cos(j / 12 * TAU) * 12, y + Math.sin(j / 12 * TAU) * 8]), 1, 3); } }

// ---------- storm vocabulary: the sky is a layer of dark sand; lightning and sound are CLEARED through it to the light table ----------
function storm(t, a = .62) { const p = new Path2D(); p.moveTo(0, 0); p.lineTo(W, 0); p.lineTo(W, HZ); p.lineTo(0, HZ); p.closePath(); g.save(); g.globalAlpha = a; g.fillStyle = SAND; g.fill(p); g.restore();
  g.save(); g.globalAlpha = .55; g.fillStyle = '#1a130c'; for (let i = 0; i < 7; i++) { const x = ((i * 190 + t * (8 + i)) % 1400) - 160, y = 260 + (i % 3) * 60; g.beginPath(); for (let j = 0; j < 5; j++) g.arc(x + j * 70, y + 30 * Math.sin(j * 1.7 + i), 90 - j * 6, 0, TAU); g.fill(); } g.restore(); }
// cleared light line (a scraped groove that lets the table shine through), glowing
function glowLine(P, k = 1, o = {}) { if (k <= 0 || P.length < 2) return; const n = Math.max(2, Math.ceil(P.length * clamp(k))); const path = () => { g.beginPath(); for (let i = 0; i < n; i++) i ? g.lineTo(...P[i]) : g.moveTo(...P[i]); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; const a = o.a ?? 1; for (const [w, c] of [[o.w ? o.w * 6 : 46, 'rgba(255,240,200,.16)'], [o.w ? o.w * 2.6 : 18, 'rgba(255,240,200,.45)'], [o.w || 6, 'rgba(255,252,236,1)']]) { g.globalAlpha = a; g.lineWidth = w; g.strokeStyle = c; path(); g.stroke(); } g.restore(); }
// deterministic jagged bolt between two points, with a couple of side branches
const BOLTS = new Map();
function boltPts(key, x0, y0, x1, y1, n = 22, amp = 60) { if (BOLTS.has(key)) return BOLTS.get(key); const P = [[x0, y0]]; for (let i = 1; i < n; i++) { const u = i / n; P.push([lerp(x0, x1, u) + (hash(i * 3.7 + key.length) - .5) * amp * 2, lerp(y0, y1, u) + (hash(i * 5.3 + key.length) - .5) * amp * .5]); } P.push([x1, y1]);
  const br = [5, 12].map(j => { const [bx, by] = P[j]; const Q = [[bx, by]]; for (let i = 1; i <= 5; i++) Q.push([bx + i * 26 * (j % 2 ? 1 : -1) + (hash(i + j) - .5) * 30, by + i * 30]); return Q; }); const r = { P, br }; BOLTS.set(key, r); return r; }
function bolt(key, x0, y0, x1, y1, k, o = {}) { const B = boltPts(key, x0, y0, x1, y1, o.n, o.amp); glowLine(B.P, k, o); if (k >= 1) B.br.forEach(Q => glowLine(Q, 1, { w: 3, a: .8 * (o.a ?? 1) })); return B.P; }
function flash(a) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(255,248,225,1)'; g.fillRect(0, 0, W, HZ); g.restore(); }
// sound: cleared rings expanding from a point
function ring(x, y, r, a, w = 5) { if (a <= 0 || r <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(255,240,200,.9)'; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore(); }
function rings(x, y, age, o = {}) { const sp = o.sp || 260; for (let j = 0; j < (o.n || 3); j++) { const r = (age - j * .18) * sp; if (r > 0) ring(x, y, r, clamp(1 - r / (o.max || 900)) * (o.a ?? .9), o.w || 5); } }
function person(x, y, s = 1) { const p = new Path2D(); p.arc(x, y - 150 * s, 24 * s, 0, TAU); p.moveTo(x - 30 * s, y - 120 * s); p.lineTo(x + 30 * s, y - 120 * s); p.lineTo(x + 24 * s, y - 50 * s); p.lineTo(x + 18 * s, y); p.lineTo(x + 4 * s, y); p.lineTo(x, y - 46 * s); p.lineTo(x - 4 * s, y); p.lineTo(x - 18 * s, y); p.lineTo(x - 24 * s, y - 50 * s); p.closePath(); sandFill(p, '#14100a'); }
function house(x, y, s = 1, lit = 0) { const p = new Path2D(); p.moveTo(x - 90 * s, y); p.lineTo(x - 90 * s, y - 110 * s); p.lineTo(x, y - 190 * s); p.lineTo(x + 90 * s, y - 110 * s); p.lineTo(x + 90 * s, y); p.closePath(); sandFill(p, '#14100a');
  if (lit > 0) { g.save(); g.globalAlpha = lit; g.fillStyle = '#ffd27a'; g.fillRect(x - 30 * s, y - 90 * s, 60 * s, 50 * s); g.restore(); } }
function hills() { const p = new Path2D(); p.moveTo(0, HZ); for (let x = 0; x <= W; x += 20) p.lineTo(x, HZ - 60 - 50 * Math.sin(x * .004 + .6) - 20 * Math.sin(x * .013)); p.lineTo(W, HZ); p.closePath(); sandFill(p, '#1d160e'); }
function sun(x, y, r, a, t) { rays(x, y, r, a, t); }
function wave(x0, x1, y, f, k, o = {}) { const P = []; for (let i = 0; i <= 120; i++) { const u = i / 120; P.push([lerp(x0, x1, u), y + f(u)]); } glowLine(P, k, { w: o.w || 4, a: o.a ?? 1 }); }

// ---------- scenes ----------
const SC = [];
const BIG = () => boltPts('big', 520, 250, 600, HZ - 10, 24, 70);
const LONG = () => boltPts('long', 120, 330, 820, HZ - 20, 30, 80);
const nearest = (P, x, y) => P.reduce((m, p) => Math.min(m, Math.hypot(p[0] - x, p[1] - y)), 1e9);
SC[0] = (t, lt) => { storm(t); hills(); const f = lt < .35 ? ss(.05, .2, lt) - ss(.25, .35, lt) : 0; flash(f * .5); bolt('big', 520, 250, 600, HZ - 10, clamp(lt / .25)); house(820, HZ, 1, .8); person(240, HZ, 1);
  rings(600, 640, lt - .4, { n: 4, sp: 300, max: 1100 }); title('Crack!', 'then the long rumble', lt - .1, { col: CREAM }); };
SC[1] = (t, lt) => { storm(t); hills(); bolt('big', 520, 250, 600, HZ - 10, 1, { a: .5 + .5 * hash(Math.floor(t * 12)) }); house(820, HZ, 1, .8); person(240, HZ, 1); rings(600, 640, (lt % 2.2), { n: 4, sp: 300, max: 1100 }); title('Why the rumble?', 'not just one bang', lt, { col: CREAM }); };
SC[2] = (t, lt) => { storm(t, .85); const P = boltPts('zoom', 540, 200, 520, HZ, 14, 120); glowLine(P, clamp(lt / .3), { w: 14 }); label('50,000 °F', 300, 700, lt - .6, { size: 80, col: '#ffd99a' }); title('Hot', 'in a split second', lt, { col: CREAM }); };
SC[3] = (t, lt) => { storm(t, .85); const P = boltPts('zoom', 540, 200, 520, HZ, 14, 120); glowLine(P, 1, { w: 14 + 4 * Math.sin(t * 20) }); sun(220, 780, 70, clamp(lt / .6), t); label('the Sun’s surface', 220, 940, lt - .4, { col: CREAM, size: 40 }); label('× 5', 760, 700, lt - .9, { size: 110, col: '#ffd99a' }); title('Hotter than the Sun', 'about five times its surface', lt, { col: CREAM, size: 80 }); };
SC[4] = (t, lt) => { storm(t, .85); const P = boltPts('zoom', 540, 200, 520, HZ, 14, 120); glowLine(P, 1, { w: 12 }); const e = eo(clamp(lt / 1.4)); for (let i = 0; i < P.length; i += 2) { const [x, y] = P[i]; for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + i, r = 20 + e * 160; g.fillStyle = 'rgba(255,236,190,.7)'; g.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r * .6, 5, 4); } }
  label('the air bursts outward', 540, 1000, lt - .5, { col: CREAM, size: 50 }); title('Boom', 'air expands, then snaps back', lt, { col: CREAM }); };
SC[5] = (t, lt) => { storm(t, .85); glowLine(boltPts('zoom', 540, 200, 520, HZ, 14, 120).P, 1, { w: 10, a: .8 }); for (let j = 0; j < 6; j++) ring(530, 620, ((lt * 300 + j * 120) % 720), clamp(1 - ((lt * 300 + j * 120) % 720) / 720), 6); title('A sound wave', 'that is thunder', lt, { col: CREAM }); };
SC[6] = (t, lt) => { storm(t); hills(); const P = LONG().P; glowLine(P, clamp(lt / 1.6)); if (lt > 1.6) LONG().br.forEach(Q => glowLine(Q, 1, { w: 3, a: .8 })); title('Not a dot', 'a long, crooked channel', lt, { col: CREAM }); person(960, HZ, .8); };
SC[7] = (t, lt) => { storm(t); hills(); const P = LONG().P; glowLine(P, 1, { a: .7 }); P.forEach(([x, y], i) => { if (i % 3 === 0) rings(x, y, lt - i * .04, { n: 2, sp: 160, max: 260, w: 3 }); }); title('Boom, boom, boom', 'every piece booms', lt, { col: CREAM }); person(960, HZ, .8); };
SC[8] = (t, lt) => { storm(t, .6); hills(); const x0 = 140, x1 = 860, y = 760; glowLine([[x0, y], [x1, y]], clamp(lt / .5), { w: 4 }); for (let i = 0; i <= 3; i++) { glowLine([[lerp(x0, x1, i / 3), y - 20], [lerp(x0, x1, i / 3), y + 20]], clamp((lt - .5) / .3), { w: 4 }); label(`${i * 3} s`, lerp(x0, x1, i / 3), y + 80, lt - .6, { col: CREAM, size: 42 }); }
  const u = clamp((lt - .8) / 2.6); ring(lerp(x0, x1, u), y, 18, 1, 8); label('1 km', 500, y - 50, lt - 1.2, { col: '#ffd99a', size: 52 }); title('Sound is slow', 'about 1 km every 3 seconds', lt, { col: CREAM }); };
// the rumble machine: rings from every bolt point at the same speed; the listener at the right hears the nearest first
const EAR = [960, HZ - 150];
function arrivals(P, sp) { return P.map(p => Math.hypot(p[0] - EAR[0], p[1] - EAR[1]) / sp).sort((a, b) => a - b); }
function machine(t, lt, o = {}) { storm(t); hills(); const P = LONG().P, sp = 260; glowLine(P, 1, { a: .55 }); P.forEach(([x, y], i) => { if (i % 2 === 0) { const r = lt * sp; if (r < 1300) ring(x, y, r, .5 * clamp(1 - r / 1300), 3); } });
  person(960, HZ, .8); const A = arrivals(P, sp), heard = A.filter(a => a <= lt).length; const ex = EAR[0], ey = EAR[1]; if (heard > 0) { g.save(); g.globalAlpha = .4 + .4 * Math.sin(t * 30); g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(ex, ey, 40, 0, TAU); g.fill(); g.restore(); }
  if (o.strip) { const x0 = 120, x1 = 860, y = 900, T0 = A[0], T1 = A[A.length - 1]; glowLine([[x0, y], [x1, y]], 1, { w: 2, a: .5 }); A.forEach((a, i) => { if (a <= lt) { const x = lerp(x0, x1, (a - T0) / (T1 - T0 + .001)); glowLine([[x, y - 30 - 20 * hash(i)], [x, y + 30]], 1, { w: 4 }); } });
    label('what you hear', 490, 980, lt - .4, { col: CREAM, size: 42 }); } return heard; }
SC[9] = (t, lt) => { machine(t, lt); title('Closest first', 'the nearest part arrives first', lt, { col: CREAM }); };
SC[10] = (t, lt) => { machine(t, lt + 1.2, { strip: 1 }); title('Then the rest', 'seconds later, one by one', lt, { col: CREAM }); };
SC[11] = (t, lt) => { storm(t, .6); hills(); const k = clamp(lt / 1.6); wave(120, 860, 820, u => (1 - k) * (hash(Math.floor(u * 60)) - .5) * 160 * (u * 60 % 1 < .2 ? 1 : .1) + k * 70 * Math.sin(u * 26) * Math.exp(-u * .8) * (.6 + .4 * Math.sin(u * 7 + t)), 1, { w: 5 }); label('rumble', 490, 980, lt - 1.4, { col: '#ffd99a', size: 60 }); title('Smeared together', 'one long rumble', lt, { col: CREAM }); };
SC[12] = (t, lt) => { storm(t, .7); const p = new Path2D(); p.moveTo(0, HZ); for (let x = 0; x <= W; x += 20) p.lineTo(x, HZ - 120 - 90 * Math.sin(x * .006 + 2) - 40 * Math.sin(x * .02)); p.lineTo(W, HZ); p.closePath(); sandFill(p, '#1d160e'); bolt('far', 200, 300, 260, 760, clamp(lt / .3), { w: 4 }); person(860, HZ, .7); label('far away', 860, 760, lt - .6, { col: CREAM, size: 44 }); title('Distance', 'changes the sound', lt, { col: CREAM }); };
SC[13] = (t, lt) => { storm(t, .6); hills(); person(240, HZ, .8); person(860, HZ, .8); label('close', 240, 760, lt, { col: CREAM, size: 44 }); label('far', 860, 700, lt, { col: CREAM, size: 44 }); wave(120, 420, 620, u => (hash(Math.floor(u * 90)) - .5) * 120, clamp(lt / .6), { w: 4 }); wave(660, 980, 560, u => 40 * Math.sin(u * 9 + t * 2), clamp((lt - 1.4) / .8), { w: 6 });
  title('Crack vs rumble', 'air soaks up the high notes', lt, { col: CREAM, size: 84 }); };
SC[14] = (t, lt) => { storm(t); hills(); const P = LONG().P; glowLine(P, 1); P.forEach(([x, y], i) => rings(x, y, (lt * .8 + i * .03) % 1.6, { n: 1, sp: 260, max: 420, w: 3 })); person(960, HZ, .8); title('One bolt', 'heard from every point', lt, { col: CREAM }); };
SC[15] = (t, lt) => { storm(t); hills(); const f = lt > .2 && lt < .5 ? 1 - (lt - .2) / .3 : 0; flash(f * .45); bolt('big', 520, 250, 600, HZ - 10, lt > .2 ? 1 : 0, { a: lt > .2 ? 1 - .5 * clamp((lt - .5) / 1) : 0 }); const n = Math.min(5, Math.floor((lt - .4) / .55) + 1);
  if (lt > .4) label(String(n), 540, 820, 1, { size: 150, col: '#ffd99a' }); person(240, HZ, 1); title('Flash... bang', 'count the seconds', lt, { col: CREAM }); };
SC[16] = (t, lt) => { storm(t, .6); hills(); label('5 s  ≈  1 mile', 520, 640, lt - .2, { size: 84, col: '#ffd99a' }); label('3 s  ≈  1 km', 520, 790, lt - 1.6, { size: 84, col: CREAM }); title('The 5-second rule', 'count, then divide', lt, { col: CREAM, size: 84 }); };
SC[17] = (t, lt) => { storm(t); hills(); bolt('near', 300, 260, 380, HZ - 10, lt > .3 ? 1 : 0, { a: .6 + .4 * hash(Math.floor(t * 12)) }); const u = eo(clamp((lt - .4) / 1.6)); house(780, HZ, 1.2, .9); person(lerp(420, 760, u), HZ, .9 * (1 - .3 * u)); title('Head indoors', 'if you hear it, you can be struck', lt, { col: CREAM, size: 84 }); };
SC[18] = (t, lt) => { storm(t); hills(); bolt('big', 520, 250, 600, HZ - 10, 1, { a: .5 + .5 * hash(Math.floor(t * 12)) }); person(240, HZ, 1); title('Counting?', '', lt, { col: CREAM }); house(820, HZ, 1, .8); };
SC[19] = (t, lt) => { const k = clamp(lt / .5); label('Follow for more of', CX, 600, k, { size: 72, col: SAND }); label('how it really works.', CX, 700, k, { size: 72, col: '#7a4a1c' }); label("A new 'wait, really?' every day.", CX, 790, lt - .6, { size: 46 }); label('@howitreallyworkstudio', CX, 860, lt - .8, { size: 42 });
  const p = new Path2D(); for (let j = 0; j < 5; j++) p.arc(390 + j * 70, 1000 + 20 * Math.sin(j * 1.7), 80 - j * 5, 0, TAU); sandFill(p, SAND); };

// ---------- frame ---------- (scene drawing is clipped to the sky, so rings and glow stay off the captions)
const START = PH.map(p => p.start - .2); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i]) k = i; return k; }
function draw(t) { ST2 = Math.floor(t * 12); const k = sceneAt(t), lt = k === 0 ? t + .3 : t - START[k]; table(t); TT = []; const sh = k === 0 && lt > .5 && lt < 2.5 ? Math.sin(t * 60) * 4 * (1 - (lt - .5) / 2) : 0;
  g.save(); g.translate(sh, 0); if (k < SC.length - 1) { ground(t); ripples(t); g.beginPath(); g.rect(-20, 0, W + 40, HZ + 6); g.clip(); } SC[k](t, lt); g.restore(); TT.forEach(a => drawTitle(...a)); if (k > 0 && lt < .4) sweep(lt / .4); grain(t); if (k < SC.length - 1) caption(t); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = g; g = F0.getContext('2d'); draw(0); g = keep; }
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { g.save(); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } }
const r = (i, d = 0) => s(i) + d;
window.CUES = [['thud', .45], ['silence', 1.5, 2.0], ['whoosh', r(1, -.2)], ['whoosh', r(2, -.2)], ['snap', r(2, .1)], ['whoosh', r(3, -.2)], ['sparkle', r(3, .5)], ['whoosh', r(4, -.2)], ['thud', r(4, .3)], ['whoosh', r(5, -.2)], ['whoosh', r(6, -.2)], ['scribble', r(6, 0), r(6, 1.6)],
  ['whoosh', r(7, -.2)], ['thud', r(7, .3)], ['thud', r(7, .7)], ['thud', r(7, 1.1)], ['whoosh', r(8, -.2)], ['tick', r(8, .9)], ['tick', r(8, 1.8)], ['tick', r(8, 2.7)], ['whoosh', r(9, -.2)], ['thud', r(9, 1.4)], ['whoosh', r(10, -.2)], ['thud', r(10, .5)], ['thud', r(10, 1.1)], ['thud', r(10, 1.8)],
  ['whoosh', r(11, -.2)], ['heartbeat', r(11, .4), 4, .9], ['whoosh', r(12, -.2)], ['snap', r(12, .1)], ['whoosh', r(13, -.2)], ['snap', r(13, .2)], ['whoosh', r(14, -.2)], ['chime', r(14, .6), 74], ['whoosh', r(15, -.2)], ['snap', r(15, .25)], ['tick', r(15, .95)], ['tick', r(15, 1.5)], ['tick', r(15, 2.05)], ['tick', r(15, 2.6)],
  ['whoosh', r(16, -.2)], ['pop', r(16, .3)], ['pop', r(16, 1.7)], ['whoosh', r(17, -.2)], ['snap', r(17, .35)], ['slide', r(17, .5)], ['whoosh', r(18, -.2)], ['chime', r(19, .2), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { table(1); TT = []; ground(1); storm(1); hills(); bolt('big', 520, 250, 600, HZ - 10, 1); house(820, HZ, 1, .8); person(240, HZ, 1); rings(600, 640, 1.2, { n: 4, sp: 300, max: 1100 }); grain(1);
  g.save(); g.font = '700 110px Bask'; g.fillStyle = CREAM; g.fillText('Why does', 90, 1220); g.fillStyle = '#ffd99a'; g.font = 'italic 400 110px BaskI'; g.fillText('thunder rumble?', 90, 1340); g.restore(); };
window.seek(0); window.ready = true; window.READY = true;
