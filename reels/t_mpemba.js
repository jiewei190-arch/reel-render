// t_mpemba.js: "Does hot water really freeze faster than cold?" in template #24 Stop-motion explainer (demo t24, x.com/chavis_). Canvas2D 1080x1920, pure function of t.
// Demo grammar reused: a navy grid board; a spaced mono header "HAND-DRAWN STOP-MOTION · 12 FPS"; a rounded bold title with one word on a mint
// highlighter stripe; a paper sheet taped at the two top corners with the camera notch (dash-dot-dash) and faint doodle circles; black ink drawings
// that draw on and boil on 12 fps steps, mint diagonal hatching, purple accent lines; a small mascot at the sheet's bottom-left (here an ice cube);
// the "sc N · frame" counter on the sheet; a white caption card under the sheet with rounded handwritten type.
// Batch N layout: caption card y 1150-1355 (text inside x 100-860); sheet y 450-1110; title y 300-420; badge strip y 1366-1440 stays on the board.
await Promise.all(['800 80px SnigX', '400 52px Snig', '600 30px Mono', '700 44px Bal'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let g = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const fr = x => x - Math.floor(x), hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const INK = '#1d1f26', MINT = '#4fe0bd', PURP = '#7b6cf0', RED = '#e2574c', BLUE = '#4f8fe6', PAPER = '#eeeee8', BOARD = '#2a3245';
let ST = 0;                      // 12 fps step index (the boil seed)
const SX0 = 60, SY0 = 360, SX1 = 1020, SY1 = 1140;    // the sheet

// ---------- ink: wobbly line that draws on (k) and re-jitters on 12 fps steps ----------
function ink(pts, k = 1, o = {}) { if (k <= 0 || pts.length < 2) return; const seed = o.seed || 1, j = o.j ?? 1.8; let tot = 0; const L = [0]; for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(tot); }
  const lim = tot * clamp(k); g.save(); g.strokeStyle = o.col || INK; g.lineWidth = o.w || 3.4; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = o.a ?? 1; g.beginPath();
  for (let i = 0; i < pts.length; i++) { if (L[i] > lim) { const a = pts[i - 1], b = pts[i], u = (lim - L[i - 1]) / (L[i] - L[i - 1] || 1); g.lineTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u)); break; }
    const x = pts[i][0] + (hash(seed * 13 + i * 1.7 + ST * .31) - .5) * j, y = pts[i][1] + (hash(seed * 7 + i * 2.3 + ST * .53) - .5) * j; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); }
const dens = (P, closed, step = 8) => { const o = []; const n = closed ? P.length : P.length - 1; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % P.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.ceil(d / step)); for (let j = 0; j < m; j++) o.push([lerp(a[0], b[0], j / m), lerp(a[1], b[1], j / m)]); } o.push(closed ? P[0] : P[P.length - 1]); return o; };
const rect = (x, y, w, h) => dens([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
const circle = (x, y, r, n = 40) => Array.from({ length: n + 1 }, (_, i) => [x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]);
function hatch(poly, col = MINT, k = 1, o = {}) { if (k <= 0) return; g.save(); g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip(); g.strokeStyle = col; g.lineWidth = o.w || 3; g.globalAlpha = (o.a ?? .9) * clamp(k * 1.5);
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), gap = o.gap || 11, n = Math.ceil((x1 - x0 + y1 - y0) / gap), lim = Math.floor(n * clamp(k));
  for (let i = 0; i < lim; i++) { const c = x0 - (y1 - y0) + i * gap + (hash(i + ST * .7) - .5) * 1.5; g.beginPath(); g.moveTo(c, y1); g.lineTo(c + (y1 - y0), y0); g.stroke(); } g.restore(); }
function shape(poly, k, col, o = {}) { if (col) hatch(poly, col, clamp(k * 1.4 - .4), o); ink(poly, clamp(k * 1.3), o); }
function arrow(x0, y0, x1, y1, k, o = {}) { if (k <= 0) return; ink(dens([[x0, y0], [x1, y1]], false, 10), k, o); if (k >= .98) { const a = Math.atan2(y1 - y0, x1 - x0); ink([[x1 - 22 * Math.cos(a - .45), y1 - 22 * Math.sin(a - .45)], [x1, y1], [x1 - 22 * Math.cos(a + .45), y1 - 22 * Math.sin(a + .45)]], 1, o); } }
function txt(str, x, y, size, k = 1, o = {}) { if (k <= 0) return; g.save(); g.globalAlpha = clamp(k * 3); g.font = `${o.wt || 700} ${size}px ${o.f || 'Bal'}`; g.textAlign = o.align || 'center'; g.fillStyle = o.col || INK; g.fillText(str, x, y); g.restore(); }

// ---------- board, header, title, sheet, mascot, caption card ----------
function board() { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BOARD; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.045)'; g.lineWidth = 2; for (let x = 0; x <= W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.font = '600 26px Mono'; g.fillStyle = 'rgba(214,220,235,.75)'; if ('letterSpacing' in g) g.letterSpacing = '6px'; g.fillText('HAND-DRAWN STOP-MOTION · 12 FPS', 64, 268); if ('letterSpacing' in g) g.letterSpacing = '0px'; }
let TT = null; function title(pre, hi, post = '') { TT = [pre, hi, post]; }
function drawTitle() { if (!TT) return; const [pre, hi, post] = TT; g.save(); g.font = '800 78px SnigX'; const w1 = g.measureText(pre).width, w2 = g.measureText(hi).width; g.fillStyle = MINT; g.fillRect(64 + w1 - 4, 318, w2 + 10, 24); g.fillStyle = '#f4f6fb'; g.fillText(pre + hi + post, 64, 337); g.restore(); }
function sheet(sc) { g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = PAPER; g.fillRect(SX0, SY0, SX1 - SX0, SY1 - SY0); g.restore();
  const vg = g.createRadialGradient(540, 760, 100, 540, 780, 640); vg.addColorStop(0, 'rgba(255,255,255,.35)'); vg.addColorStop(1, 'rgba(0,0,0,.06)'); g.fillStyle = vg; g.fillRect(SX0, SY0, SX1 - SX0, SY1 - SY0);
  g.strokeStyle = 'rgba(0,0,0,.05)'; g.lineWidth = 2; for (const [x, y, r] of [[880, 470, 60], [930, 1040, 40], [150, 560, 34]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); }
  g.fillStyle = INK; g.fillRect(430, SY0 + 26, 50, 8); g.fillRect(600, SY0 + 26, 50, 8); g.beginPath(); g.arc(540, SY0 + 30, 8, 0, TAU); g.fill();          // camera notch
  for (const [x, a] of [[SX0 + 10, -.6], [SX1 - 10, .6]]) { g.save(); g.translate(x, SY0 + 4); g.rotate(a); g.fillStyle = 'rgba(232,214,160,.85)'; g.fillRect(-60, -16, 120, 32); g.restore(); }   // tape
  g.font = '400 22px Mono'; g.fillStyle = 'rgba(0,0,0,.35)'; g.textAlign = 'right'; g.fillText(`sc ${sc} · ${String(ST).padStart(4, '0')}`, 860, SY1 - 22); g.textAlign = 'left'; }
function cube(x, y, s = 1, mood = 'smile', k = 1) { if (k <= 0) return; const P = dens([[x - 46 * s, y - 40 * s], [x + 40 * s, y - 46 * s], [x + 46 * s, y + 40 * s], [x - 40 * s, y + 46 * s]], true, 6); shape(P, k, '#9adff0', { seed: 900 });
  g.fillStyle = INK; g.beginPath(); g.arc(x - 14 * s, y - 6 * s, 4.5 * s, 0, TAU); g.arc(x + 16 * s, y - 8 * s, 4.5 * s, 0, TAU); g.fill();
  ink(mood === 'oh' ? circle(x + 2 * s, y + 18 * s, 7 * s, 16) : mood === 'flat' ? [[x - 10 * s, y + 18 * s], [x + 14 * s, y + 16 * s]] : [[x - 14 * s, y + 12 * s], [x + 1 * s, y + 22 * s], [x + 16 * s, y + 10 * s]], 1, { w: 3, seed: 901 });
  if (mood === 'shrug') { ink([[x - 50 * s, y + 10 * s], [x - 80 * s, y - 20 * s]], 1, { seed: 903 }); ink([[x + 50 * s, y + 10 * s], [x + 80 * s, y - 20 * s]], 1, { seed: 904 }); } }
function card(t) { g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = '#f4f4ef'; g.fillRect(SX0, 1160, SX1 - SX0, 202); g.restore();
  let i = -1; for (let k = 0; k < PH.length - 1; k++) if (t >= PH[k].start - .1 && t < PH[k + 1].start - .1) i = k;
  if (i < 0) { if (t >= 0 && t < PH[0].start) { g.save(); g.font = '400 42px Snig'; g.fillStyle = INK; g.fillText('Hot vs cold?', 100, 1213); g.restore(); } return; } const p = PH[i];
  g.save(); g.font = '400 42px Snig'; const words = p.cap.replace(/\*\*/g, '').split(' '), lines = [[]]; let lw = 0; words.forEach(w => { const ww = g.measureText(w + ' ').width; if (lw + ww > 800 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += ww; });
  const total = words.join(' ').length, shown = Math.floor(Math.max(0, t - p.start + .05) * 120); let c = 0; g.fillStyle = INK;     // typed on, letter by letter, like the demo's caption card   // typed at 120 characters/s
  lines.forEach((ln, j) => { let str = ln.join(' '); if (c + str.length > shown) str = str.slice(0, Math.max(0, shown - c)); g.fillText(str, 100, 1213 + j * 48); c += ln.join(' ').length + 1; }); g.restore(); }

// ---------- objects ----------
function mug(x, y, k, hot, o = {}) { const P = dens([[x - 80, y - 120], [x + 80, y - 120], [x + 66, y + 60], [x - 66, y + 60]], true); shape(P, k, hot ? RED : BLUE, { seed: hot ? 10 : 20, a: .55 }); ink(dens([[x + 78, y - 80], [x + 120, y - 70], [x + 118, y], [x + 72, y + 10]], false), k, { seed: hot ? 11 : 21 });
  if (k >= 1 && hot) for (let j = 0; j < 3; j++) { const ph = (ST / 12 * .8 + j * .33) % 1; ink(Array.from({ length: 9 }, (_, i) => [x - 40 + j * 40 + 10 * Math.sin(i * .9 + ph * 6), y - 140 - i * 14 - ph * 30]), 1, { col: RED, w: 3, seed: 12 + j, a: 1 - ph }); }
  if (k >= 1 && !hot) for (let j = 0; j < 2; j++) shape(dens([[x - 40 + j * 46, y - 100], [x - 6 + j * 46, y - 104], [x - 4 + j * 46, y - 70], [x - 38 + j * 46, y - 66]], true, 5), 1, '#bfeaf6', { seed: 22 + j }); }
function freezer(x, y, w, h, k) { ink(rect(x, y, w, h), k, { seed: 30 }); ink(dens([[x, y + h * .35], [x + w, y + h * .35]], false), k, { seed: 31 }); ink(dens([[x + w - 30, y + 40], [x + w - 30, y + 100]], false), k, { seed: 32, w: 5 }); }
function chart(x, y, w, h, k, o = {}) { arrow(x, y + h, x + w, y + h, k, { seed: 40 }); arrow(x, y + h, x, y, k, { seed: 41 }); txt(o.xl ?? 'time', x + w - 40, y + h + 44, 32, k); txt(o.yl ?? 'temp', x + 10, y - 16, 32, k, { align: 'left' });
  if (o.zero) { ink(dens([[x, y + h * o.zero], [x + w, y + h * o.zero]], false, 14), k, { col: BLUE, w: 2.6, seed: 42 }); txt('0 °C', x + w + 4, y + h * o.zero + 10, 28, k, { align: 'left', col: BLUE }); } }
function curve(x, y, w, h, f, k, col, seed) { const pts = Array.from({ length: 40 }, (_, i) => { const u = i / 39; return [x + u * w, y + h * (1 - f(u))]; }); ink(pts, k, { col, w: 5, seed }); }
function bust(x, y, name, k, seed) { shape(circle(x, y - 60, 44), k, null, { seed }); shape(dens([[x - 70, y + 60], [x - 50, y - 6], [x + 50, y - 6], [x + 70, y + 60]], true), k, MINT, { seed: seed + 1 }); txt(name, x, y + 110, 36, k - .4); }
function stick(x, y, k, seed, o = {}) { ink(circle(x, y - 150, 28, 24), k, { seed }); ink([[x, y - 122], [x, y - 40]], k, { seed: seed + 1 }); ink([[x, y - 40], [x - 26, y]], k, { seed: seed + 2 }); ink([[x, y - 40], [x + 26, y]], k, { seed: seed + 3 }); ink([[x - 34, y - 100], [x, y - 90], [x + 34, y - 100 - (o.wave ? 40 * Math.abs(Math.sin(ST * .5)) : 0)]], k, { seed: seed + 4 }); }

// ---------- scenes ----------
const SC = [], r = (i, d = 0) => s(i) + d;
SC[0] = (lt) => { freezer(640, 560, 300, 480, 1); mug(270, 860, 1, true); mug(500, 900, 1, false); txt('?', 790, 820, 150, 1, { col: PURP }); title('Hot vs ', 'cold', '?'); return { sc: 1, mood: 'oh' }; };
SC[1] = (lt) => { stick(300, 1060, clamp(lt / .8), 50); stick(760, 1060, clamp((lt - 1.2) / .8), 55, { wave: true });
  for (const [x, y, w2, word, col, k] of [[330, 680, 300, 'cold, obviously.', BLUE, lt - .5], [740, 680, 240, 'hot!', RED, lt - 1.8]]) { shape(dens(Array.from({ length: 24 }, (_, i) => { const a = i / 24 * TAU; return [x + Math.cos(a) * w2 / 2 * (1 + .06 * Math.sin(a * 7)), y + Math.sin(a) * 90 * (1 + .06 * Math.sin(a * 7))]; }), true, 10), clamp(k / .6), null, { seed: 52 + x }); ink(circle(x - 40, y + 130, 16, 16), clamp(k / .6), { seed: 53 + x }); ink(circle(x - 60, y + 175, 9, 12), clamp(k / .6), { seed: 54 + x }); txt(word, x, y + 14, 44, k - .3, { col }); } title('Which ', 'freezes', ' first?'); return { sc: 2, mood: 'smile' }; };
SC[2] = (lt) => { bust(260, 820, 'Aristotle', clamp(lt / .9), 60); bust(540, 820, 'Bacon', clamp((lt - 1.2) / .9), 62); bust(820, 820, 'Descartes', clamp((lt - 1.8) / .9), 64); txt('"warmed water freezes quickly"', 540, 600, 34, lt - .6, { f: 'Snig', wt: 400 }); title('An ', 'old', ' idea'); return { sc: 3, mood: 'smile' }; };
SC[3] = (lt) => { stick(420, 1020, clamp(lt / 1), 70, { wave: true }); shape(rect(600, 640, 300, 200), clamp((lt - .6) / .8), MINT, { seed: 72 }); ink(dens([[600, 640], [750, 560], [900, 640]], false), clamp((lt - .6) / .8), { seed: 73 }); txt('school', 750, 760, 40, lt - 1.2); txt('Tanzania', 750, 900, 40, lt - 1.4, { col: PURP });
  txt('Erasto Mpemba', 420, 720, 46, lt - 1.8); title('A schoolboy, ', 'Mpemba'); return { sc: 4, mood: 'smile' }; };
SC[4] = (lt) => { const k = clamp(lt / 1); shape(dens([[220, 820], [460, 820], [440, 1000], [240, 1000]], true), k, '#f2c9a8', { seed: 80 }); txt('ice cream mix', 340, 1060, 34, lt - .4); for (let j = 0; j < 3; j++) { const ph = (ST / 12 * .8 + j * .33) % 1; ink(Array.from({ length: 8 }, (_, i) => [260 + j * 70 + 10 * Math.sin(i + ph * 6), 800 - i * 14 - ph * 30]), k, { col: RED, seed: 81 + j, a: 1 - ph }); }
  freezer(620, 560, 300, 480, clamp((lt - .6) / .8)); arrow(480, 880, 610, 880, clamp((lt - 1.4) / .5), { col: PURP, seed: 84 }); txt('still hot!', 340, 720, 40, lt - 1.8, { col: RED }); title('Into the ', 'freezer', ', hot'); return { sc: 5, mood: 'oh' }; };
SC[5] = (lt) => { freezer(250, 540, 700, 540, 1); const k = clamp(lt / .8); shape(dens([[290, 760], [470, 760], [450, 900], [310, 900]], true), k, '#bfeaf6', { seed: 90 }); shape(dens([[640, 760], [820, 760], [800, 900], [660, 900]], true), k, '#f2c9a8', { seed: 91, a: .5 });
  txt('his (hot)', 380, 950, 36, lt - .3); txt('classmate (cooler)', 730, 950, 36, lt - .5); txt('frozen!', 380, 1020, 44, lt - 1, { col: BLUE }); txt('still liquid', 730, 1020, 40, lt - 1.4, { col: RED }); title('His froze ', 'first'); return { sc: 6, mood: 'oh' }; };
SC[6] = (lt) => { shape(rect(160, 540, 360, 480), clamp(lt / .8), null, { seed: 100 }); txt('Physics Education', 340, 600, 30, lt - .3, { f: 'Mono', wt: 600 }); txt('"Cool?"', 340, 680, 50, lt - .5); txt('Mpemba & Osborne', 340, 740, 30, lt - .7, { f: 'Snig', wt: 400 }); for (let j = 0; j < 6; j++) ink(dens([[200, 800 + j * 30], [480, 800 + j * 30]], false, 20), clamp((lt - .8 - j * .08) / .3), { w: 2, a: .5, seed: 101 + j });
  chart(590, 600, 360, 380, clamp((lt - 1) / .8), { zero: .82, xl: 'time' }); curve(590, 600, 360, 380, u => .95 - u * 1.4 + u * u * .3, clamp((lt - 1.8) / 1.2), RED, 110); curve(590, 600, 360, 380, u => .55 - u * .45, clamp((lt - 2) / 1.2), BLUE, 111); txt('hot froze first', 770, 560, 32, lt - 3.2, { col: RED });
  title('Published, ', '1969'); return { sc: 7, mood: 'smile' }; };
SC[7] = (lt) => { const k = clamp(lt / .6); g.save(); g.translate(540, 800); g.rotate(-.12); g.globalAlpha = k; g.strokeStyle = RED; g.lineWidth = 8; g.strokeRect(-300, -90, 600, 180); g.font = '800 84px SnigX'; g.fillStyle = RED; g.textAlign = 'center'; g.fillText('CASE CLOSED', 0, 30); g.restore();
  if (lt > .9) ink(dens([[220, 900], [860, 700]], false), clamp((lt - .9) / .4), { col: PURP, w: 9, seed: 120 }); txt('not quite.', 700, 990, 54, lt - 1.2, { col: PURP }); title('Case ', 'closed', '?'); return { sc: 8, mood: 'flat' }; };
SC[8] = (lt) => { shape(rect(300, 560, 480, 480), clamp(lt / .8), '#bfeaf6', { seed: 130, a: .5 }); for (let j = 0; j < 7; j++) { const y = 600 + j * 62, k = clamp((lt - .6 - j * .12) / .3); ink(dens([[180, y], [440, y]], false), k, { seed: 131 + j, w: 2.6 }); g.fillStyle = INK; if (k >= 1) { g.beginPath(); g.arc(440, y, 7, 0, TAU); g.fill(); } }
  txt('7 thermometers', 880, 640, 34, lt - 1.4); txt('2016', 860, 1060, 40, lt - .4, { f: 'Mono', wt: 600, col: PURP }); title('Very ', 'careful', ' tests'); return { sc: 9, mood: 'smile' }; };
SC[9] = (lt) => { chart(180, 580, 680, 420, clamp(lt / .7), { zero: .82 }); curve(180, 580, 680, 420, u => .95 - .82 * (1 - Math.exp(-u * 2.6)) / (1 - Math.exp(-2.6)), clamp((lt - .5) / 1.2), RED, 140); curve(180, 580, 680, 420, u => .55 - .42 * (1 - Math.exp(-u * 3)) / (1 - Math.exp(-3)), clamp((lt - .7) / 1.2), BLUE, 141);
  txt('hot', 260, 600, 36, lt - .9, { col: RED }); txt('cold', 260, 790, 36, lt - 1.1, { col: BLUE }); if (lt > 1.8) { g.save(); g.translate(660, 700); g.rotate(-.1); g.strokeStyle = PURP; g.lineWidth = 6; g.strokeRect(-190, -50, 380, 100); g.font = '800 48px SnigX'; g.fillStyle = PURP; g.textAlign = 'center'; g.fillText('NO REAL EVIDENCE', 0, 16); g.restore(); }
  title('Hot does ', 'not', ' win'); return { sc: 10, mood: 'flat' }; };
SC[10] = (lt) => { shape(dens([[240, 600], [600, 600], [570, 1040], [270, 1040]], true), 1, '#bfeaf6', { seed: 150, a: .5 }); const up = Math.floor(ST / 12) % 2; const py = 820 - up * 40; ink(dens([[690, py], [440, py]], false), 1, { seed: 151, w: 4 }); g.fillStyle = INK; g.beginPath(); g.arc(440, py, 9, 0, TAU); g.fill();
  ink([[630, 780], [630, 820]], clamp((lt - .6) / .3), { col: PURP, seed: 152 }); txt('1 cm', 680, 806, 34, lt - .6, { col: PURP, align: 'left' }); shape(rect(720, 620, 250, 110), clamp((lt - .8) / .4), up ? RED : BLUE, { seed: 153, a: .35 }); txt(up ? 'hot wins!' : 'cold wins!', 845, 690, 40, lt - 1, { col: up ? RED : BLUE });
  title('A sneaky ', 'trap'); return { sc: 11, mood: up ? 'oh' : 'flat' }; };
SC[11] = (lt) => { freezer(300, 560, 480, 500, clamp(lt / .8)); for (let j = 0; j < 3; j++) txt('?', 220 + j * 320 + (j === 1 ? 0 : 0), 700 + (j % 2) * 120, 110, lt - .5 - j * .2, { col: PURP }); title('Why do some ', 'see', ' it?'); return { sc: 12, mood: 'oh' }; };
const ICON = (j, lt) => { const cx = [300, 760, 300, 760][j], cy = [680, 680, 950, 950][j], k = clamp(lt); shape(rect(cx - 170, cy - 110, 340, 220), k, null, { seed: 160 + j * 5 });
  if (j === 0) { for (let i = 0; i < 3; i++) ink(Array.from({ length: 8 }, (_, q) => [cx - 60 + i * 60 + 10 * Math.sin(q + ST * .6), cy + 10 - q * 12]), k, { col: RED, seed: 161 + i }); txt('evaporation', cx, cy + 90, 34, k); }
  if (j === 1) { for (let i = 0; i < 7; i++) ink(circle(cx - 80 + i * 26, cy + 20 - ((ST * 3 + i * 17) % 60), 9, 14), k, { col: BLUE, seed: 170 + i }); txt('dissolved gas', cx, cy + 90, 34, k); }
  if (j === 2) { ink(circle(cx, cy - 10, 54, 30).slice(0, 26), k, { col: PURP, w: 4, seed: 180 }); arrow(cx + 30, cy - 58, cx + 52, cy - 34, k, { col: PURP, seed: 181 }); txt('currents', cx, cy + 90, 34, k); }
  if (j === 3) { ink(rect(cx - 14, cy - 90, 28, 120), k, { seed: 190 }); hatch(rect(cx - 10, cy - 10, 20, 36), BLUE, k); ink(dens([[cx - 40, cy - 20], [cx + 40, cy - 20]], false), k, { col: BLUE, seed: 191 }); txt('below 0, still liquid', cx, cy + 90, 30, k); } };
SC[12] = (lt) => { shape(dens([[340, 720], [740, 720], [710, 1040], [370, 1040]], true), 1, '#bfeaf6', { seed: 200, a: .5 }); const lv = 720 + 40 * ss(.4, 2.6, lt); ink(dens([[350, lv], [730, lv]], false), 1, { col: BLUE, seed: 201, w: 4 });
  for (let j = 0; j < 4; j++) { const ph = (ST / 12 * .7 + j * .25) % 1; ink(Array.from({ length: 9 }, (_, q) => [400 + j * 90 + 10 * Math.sin(q + ph * 6), 700 - q * 16 - ph * 60]), 1, { col: RED, seed: 202 + j, a: 1 - ph }); } txt('a little less water', 540, 600, 38, lt - .8); title('Hot water ', 'evaporates'); return { sc: 13, mood: 'smile' }; };
SC[13] = (lt) => { ICON(0, 1); ICON(1, (lt - .4) / .5); ICON(2, (lt - 2.0) / .5); ICON(3, (lt - 3.4) / .5); title('Other ', 'suspects'); return { sc: 14, mood: 'oh' }; };
SC[14] = (lt) => { const k = clamp(lt / .8), tl = .09 * Math.sin(ST / 12 * 1.7), dy = 240 * tl;   // the balance keeps rocking: the verdict is not settled
  ink(dens([[540, 640], [540, 1000]], false), k, { seed: 210, w: 5 }); ink(dens([[300, 700 + dy], [780, 700 - dy]], false), k, { seed: 211, w: 5 }); ink(dens([[440, 1000], [640, 1000]], false), k, { seed: 212, w: 5 });
  for (const [x, w2, c, sd, oy] of [[300, 'sometimes', MINT, 213, dy], [780, 'still argued', PURP, 214, -dy]]) { ink(dens([[x - 90, 820 + oy], [x, 700 + oy], [x + 90, 820 + oy]], false), k, { seed: sd }); shape(dens([[x - 100, 820 + oy], [x + 100, 820 + oy], [x + 80, 860 + oy], [x - 80, 860 + oy]], true), k, c, { seed: sd + 5 }); txt(w2, x, 920 + oy, 40, lt - .8); }
  txt('?', 540, 600 + 10 * Math.sin(ST / 12 * 3), 90, lt - 1.2, { col: PURP }); title('The honest ', 'answer'); return { sc: 15, mood: 'shrug' }; };
SC[15] = (lt) => { mug(330, 860, 1, true); mug(750, 900, 1, false); for (const [x, sd] of [[330, 220], [750, 222]]) ink(rect(x - 50, 1000, 100, 70), clamp((lt - .5) / .5), { seed: sd }); txt('HOT', 330, 1050, 40, lt - .7, { col: RED }); txt('COLD', 750, 1050, 40, lt - .9, { col: BLUE }); title('Hot or ', 'cold', '?'); return { sc: 16, mood: 'oh' }; };
SC[16] = (lt) => { const k = clamp(lt / .5); txt('Follow for more of', CX, 700, 64, k, { f: 'SnigX', wt: 800 }); g.save(); g.font = '800 64px SnigX'; const w2 = g.measureText('how it really works.').width; g.fillStyle = MINT; g.globalAlpha = k; g.fillRect(CX - w2 / 2, 775, w2 * clamp((lt - .3) / .5), 22); g.restore(); txt('how it really works.', CX, 790, 64, k, { f: 'SnigX', wt: 800 });
  txt("A new 'wait, really?' every day.", CX, 880, 44, lt - .6, { f: 'Snig', wt: 400 }); txt('@howitreallyworkstudio', CX, 950, 40, lt - .8, { f: 'Mono', wt: 600, col: PURP }); title('Hot vs ', 'cold', '.'); return { sc: 17, mood: 'smile' }; };

// per-scene zoom of the drawing on the taller sheet [scale, centre x]; the freezer, mugs and the 1 cm trap get the biggest
const ZOOM = { 0: [1.22, 560], 5: [1.15, 590], 10: [1.28, 600], 11: [1.3, 540], 13: [1.15, 530], 16: [1.1, 540] };
const START = PH.map(p => p.start); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .2) k = i; return k; }
function draw(t) { ST = Math.floor(t * 12); const k = sceneAt(t), lt = k === 0 ? 9 : t - (START[k] - .2); board(); sheet(k + 1); g.save(); g.beginPath(); g.rect(SX0, SY0, SX1 - SX0, SY1 - SY0); g.clip(); const [zs, zx] = ZOOM[k] || [1.17, 540]; g.translate(540, 770); g.scale(zs, zs); g.translate(-zx, -790); TT = null; const st = SC[k](lt); g.restore(); drawTitle(); cube(165, 1085, .9, st.mood); if (k < SC.length - 1) card(t); else card(-1); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = g; g = F0.getContext('2d'); draw(0); g = keep; }
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { g.save(); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } }

window.CUES = [['pop', .3], ['tick', 1.2], ['tick', 2.4], ['whoosh', r(1, -.2)], ['scribble', r(1, .3), r(1, 2.4)], ['whoosh', r(2, -.2)], ['scribble', r(2, 0), r(2, 2.6)], ['whoosh', r(3, -.2)], ['scribble', r(3, 0), r(3, 1.6)], ['whoosh', r(4, -.2)], ['slide', r(4, 1.4)],
  ['whoosh', r(5, -.2)], ['pop', r(5, 1)], ['whoosh', r(6, -.2)], ['scribble', r(6, 1.8), r(6, 3)], ['thud', r(7, .1)], ['snap', r(7, .9)], ['whoosh', r(8, -.2)], ['tick', r(8, .6)], ['tick', r(8, .9)], ['tick', r(8, 1.2)], ['whoosh', r(9, -.2)], ['thud', r(9, 1.8)],
  ['whoosh', r(10, -.2)], ['tick', r(10, 1)], ['tick', r(10, 2)], ['tick', r(10, 3)], ['whoosh', r(11, -.2)], ['pop', r(11, .5)], ['whoosh', r(12, -.2)], ['bubbles', r(13, .4)], ['pop', r(13, 2)], ['pop', r(13, 3.4)], ['whoosh', r(14, -.2)], ['chime', r(14, .8), 79], ['pop', r(15, .7)], ['pop', r(15, .9)], ['chime', r(16, .2), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { ST = 30; board(); sheet(1); freezer(640, 560, 300, 480, 1); mug(270, 860, 1, true); mug(500, 900, 1, false); cube(170, 1030, .9, 'oh'); g.save(); g.font = '800 104px SnigX'; g.fillStyle = MINT; g.fillRect(60, 1210, 560, 34); g.fillStyle = '#f4f6fb'; g.fillText('Does HOT', 64, 1180); g.fillText('freeze first?', 64, 1240); g.restore(); title('Hot vs ', 'cold', '?'); drawTitle(); };
window.seek(0); window.ready = true; window.READY = true;
