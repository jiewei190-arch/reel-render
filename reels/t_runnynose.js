// t_runnynose.js: "Why does your nose run when it's cold?" in template #4 Crayon picture book (lemo-opuscar crayon-book). 1080x1920, pure function of t.
// Engine from the demo (styles/crayonbook/: crayon.js strokes and zig-zag colouring with overshoot, gl.js WebGL wax-adhesion compositor with paper tooth,
// watercolour wash resisted by wax, emboss + vignette; rig.js parts that knock out the paper behind them). Demo grammar kept: a picture-book page drawn
// while you watch, a dozen-crayon box with indigo outlines (never black), everything drawn steps at 12 fps and boils on twos, lines draw on in 0.4-0.9 s,
// one watercolour (cold ultramarine) that reveals the white-wax snow, hand-lettered titles written letter by letter, subtitles = the book's printed words
// in Patrick Hand on a ragged knock-out patch of blank paper (never a dark box).
// Batch N layout: subtitles bottom-anchored at y 1355 inside x 80-880; titles at y 260-470; drawings inside y 250-1130; badge strip y 1366-1440 stays free.
import { makeComp } from './styles/crayonbook/gl.js';
import { layer, clear, line, fill, dab, text, handCircle, ellipse, smooth, CAM, BOIL, W, H, sx, sy } from './styles/crayonbook/crayon.js';
import { group, clearGroup, part, tube } from './styles/crayonbook/rig.js';
import { PAL } from './styles/crayonbook/pal.js';
import { clamp, lerp, hash } from './styles/crayonbook/lib.js';
await Promise.all(['400 54px "Patrick Hand"', '700 90px Gaegu'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const cv = document.getElementById('gl'); cv.width = W; cv.height = H;
const comp = makeComp(cv);
const K = { ...PAL.crayon, coat: '#4f7fc4' }, CX = 540;
const pr = (t, a, b) => clamp((t - a) / (b - a));
const BG = { f: layer(), l: layer() }, KID = group(), FX = layer(), WASH = layer(), SUBK = layer(), SUBT = layer();
const WASHC = [0.42, 0.58, 0.86];   // the one watercolour: a cold, pale ultramarine

// ---------- drawing helpers (world = screen, CAM fixed per scene) ----------
const L = (pts, o = {}) => line(o.fx ? FX : BG.l, pts, { w: 7, col: K.ink, seed: o.seed ?? 1, ...o });
const F = (poly, col, o = {}) => fill(BG.f, poly, { col, p: .62, gap: 10, w: 11, seed: o.seed ?? 2, ...o });
const shape = (poly, col, seed, d = 1, o = {}) => { if (col) F(poly, col, { seed, draw: clamp(d * 1.6 - .5), ...o }); L([...poly, poly[0], [lerp(poly[0][0], poly[1][0], .12), lerp(poly[0][1], poly[1][1], .12)]], { seed: seed + 1, draw: clamp(d * 1.4), ...(o.line || {}) }); };
function arrow(x0, y0, x1, y1, col, seed, d = 1, bend = 0) { const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend, pts = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([(1 - u) ** 2 * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * my + u * u * y1]); }
  L(pts, { col, w: 9, seed, draw: d }); if (d >= .98) { const a = Math.atan2(y1 - pts[14][1], x1 - pts[14][0]); L([[x1 - 34 * Math.cos(a - .5), y1 - 34 * Math.sin(a - .5)], [x1, y1], [x1 - 34 * Math.cos(a + .5), y1 - 34 * Math.sin(a + .5)]], { col, w: 9, seed: seed + 1 }); } }
function title(str, y, lt, o = {}) { if (lt < 0) return; text(BG.l, str, o.x ?? CX, y, { size: o.size ?? 120, font: 'Gaegu', weight: 700, reveal: pr(lt, 0, o.dur ?? .6), seed: o.seed ?? 21, p: .95, stroke: 2, col: o.col || K.ink, align: o.align }); }
function note(str, x, y, lt, o = {}) { if (lt < 0) return; text(BG.l, str, sx(x), sy(y), { size: o.size ?? 58, font: 'Patrick Hand', reveal: pr(lt, 0, .45), seed: o.seed ?? 31, p: .95, stroke: 1.2, col: o.col || K.ink, align: o.align }); }
function drop(x, y, r, seed, col = K.sky) { if (r <= 1) return; const P = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, k = Math.sin(a) < 0 ? 1 - .55 * Math.pow(-Math.sin(a), 3) : 1; P.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * (Math.sin(a) < 0 ? 1.5 : 1)]); }
  fill(FX, P, { col, p: .85, gap: 4, w: 6, seed, over: 1.5 }); line(FX, P, { w: 4.5, col: K.ink, seed: seed + 1 }); dab(FX, x - r * .3, y - r * .2, r * .22, { col: K.white, seed: seed + 2, p: .9 }); }
function snowWax(n = 40, y0 = 250, y1 = 1150, t = 0) { for (let i = 0; i < n; i++) { const x = 40 + hash(i * 3.1) * 1000, y = y0 + ((hash(i * 5.7) * (y1 - y0) + Math.floor(t * 12) / 12 * (30 + 30 * hash(i))) % (y1 - y0)), r = 6 + 6 * hash(i * 9.3);
  dab(BG.l, x, y, r, { col: K.white, p: .95, seed: 500 + i, gap: 3 }); } }
function ground(d = 1, col = K.white) { const top = []; for (let x = -20; x <= 1100; x += 40) top.push([x, 1150 + 18 * Math.sin(x * .008 + 1) + 8 * Math.sin(x * .03)]);
  L(top, { seed: 40, draw: d, p: .7, w: 6 }); F(top.concat([[1100, 1440], [-20, 1440]]), '#b9c7e6', { seed: 41, p: .36, gap: 13, w: 12, ang: .2 }); }

// ---------- the kid (front view): beanie + pompom, big round nose, striped scarf, coat, mittens ----------
function kid(cx, cy, sc, o = {}) { const C = KID, P = pts => pts.map(([x, y]) => [cx + x * sc, cy + y * sc]), sd = 100, d = o.draw ?? 1;
  const lo = (seed, ex = {}) => ({ w: 7, seed, draw: clamp(d * 1.3), ...ex });
  part(C, P(smooth([[-120, 260], [-140, 520], [140, 520], [120, 260], [0, 240]], 6)), { col: K.coat, p: .7, gap: 10, w: 12, seed: sd, ang: .9, draw: clamp(d * 1.6 - .4) }, lo(sd + 1));     // coat
  part(C, P(ellipse(0, 0, 150, 140, 48)), { col: K.peach, p: .5, gap: 10, w: 12, seed: sd + 2, over: 4, draw: clamp(d * 1.6 - .3) }, lo(sd + 3));                                                 // head
  part(C, P(smooth([[-160, -40], [-150, -120], [-80, -190], [0, -205], [80, -190], [150, -120], [160, -40], [0, -60]], 6)), { col: K.red, p: .8, gap: 9, w: 12, seed: sd + 4, ang: 1.1, draw: clamp(d * 1.6 - .2) }, lo(sd + 5));   // beanie
  part(C, P(smooth([[-168, -60], [168, -60], [170, -10], [-170, -10]], 2)), { col: K.ochre, p: .8, gap: 8, w: 10, seed: sd + 6, draw: clamp(d * 1.6 - .2) }, lo(sd + 7));                           // band
  part(C, P(handCircle(0, -225, 40, 9, 0, 24)), { col: K.yellow, p: .85, gap: 6, w: 9, seed: sd + 8, draw: clamp(d * 1.6 - .2) }, lo(sd + 9));                                                     // pompom
  // scarf: stripes
  const sc0 = P(smooth([[-150, 120], [0, 170], [150, 120], [160, 190], [0, 240], [-160, 190]], 6)); part(C, sc0, { col: K.sky, p: .8, gap: 9, w: 11, seed: sd + 10, draw: clamp(d * 1.6 - .3) }, lo(sd + 11));
  [[-90], [-20], [50], [120]].forEach(([x], j) => fill(C.f, P([[x, 140], [x + 30, 150], [x + 30, 225], [x, 215]]), { col: K.red, p: .8, gap: 6, w: 8, seed: sd + 12 + j }));
  part(C, P(smooth([[60, 200], [110, 210], [120, 380], [70, 370]], 3)), { col: K.sky, p: .8, gap: 8, w: 10, seed: sd + 20 }, lo(sd + 21));
  // face
  for (const sx2 of [-1, 1]) { dab(C.f, cx + sx2 * 55 * sc, cy - 10 * sc, 12 * sc, { col: K.ink, p: 1, seed: sd + 30 + sx2 }); dab(C.f, cx + sx2 * 52 * sc, cy - 14 * sc, 4 * sc, { col: K.white, p: 1, seed: sd + 32 + sx2 }); dab(C.f, cx + sx2 * 92 * sc, cy + 40 * sc, 22 * sc, { col: K.pink, p: .55, seed: sd + 34 + sx2 }); }
  const nose = P(handCircle(0, 30, 40, 5, .08, 30)); part(C, nose, { col: o.coldTip ? '#9cc3ea' : '#f2a58f', p: .7, gap: 6, w: 9, seed: sd + 40 }, lo(sd + 41));
  line(C.l, P(o.smile === false ? [[-40, 100], [0, 92], [40, 100]] : [[-40, 92], [0, 110], [40, 92]]), lo(sd + 44, { w: 6 }));
  for (const sx2 of [-1, 1]) part(C, P(handCircle(sx2 * 160, 470, 45, 11 + sx2, 0, 24)), { col: K.red, p: .8, gap: 7, w: 9, seed: sd + 46 + sx2 }, lo(sd + 48 + sx2));   // mittens
  return { nostril: [cx + 14 * sc, cy + 58 * sc] };
}
function dripCycle(x, y, t, period = 2.2, seed = 1) { const u = ((t + 99) % period) / period, r = 22 * clamp(u / .7), fall = u > .7 ? (u - .7) / .3 : 0; drop(x, y + 18 + r * .8 + fall * fall * 320, r, 700 + seed); }

// ---------- the nose cross-section (child-drawn profile): forehead, nose, nostril, mouth, the airway down to two lungs ----------
const PROF = [[150, 330], [330, 340], [430, 420], [470, 540], [560, 700], [600, 780], [560, 800], [480, 790], [500, 860], [470, 900], [380, 940], [300, 1010], [220, 1080], [120, 1100]];
function profile(d = 1, seed = 200, o = {}) { shape(smooth(PROF.concat([[60, 1100], [60, 330]]), 3), K.peach, seed, d, { p: .45 });
  const cav = smooth([[540, 770], [470, 700], [360, 660], [270, 680], [240, 780], [250, 900], [260, 1000]], 4, false); L(cav, { col: K.pink, w: 34, p: .6, seed: seed + 3, draw: clamp(d * 1.3 - .3) });
  for (const [x, y, sd] of [[190, 1090, 0], [330, 1090, 1]]) { const lg = handCircle(x, y, 60, 40 + sd, .06, 28).map(([a, b]) => [a, y + (b - y) * 1.3]); if (o.lungs !== false) shape(lg, K.pink, seed + 10 + sd * 2, d); }
  dab(BG.f, 360, 470, 14, { col: K.ink, p: 1, seed: seed + 20 }); L(handCircle(190, 600, 46, 3, .1, 24), { seed: seed + 21, draw: d });
  L(smooth([[120, 350], [200, 320], [280, 330], [330, 345]], 4, false), { col: K.brown, w: 22, p: .8, seed: seed + 22, draw: d }); L([[430, 880], [490, 870]], { seed: seed + 23, w: 6, draw: d });
  if (o.lungs !== false) note('lungs', 430, 1110, d - .9, { size: 50, col: K.pink }); }

// ---------- subtitles: the book's printed words on a ragged patch of blank paper ----------
function subtitle(t) { let i = -1; for (let k = 0; k < PH.length - 1; k++) if (t >= PH[k].start - .1 && t < (PH[k + 1] ? PH[k + 1].start - .1 : TOT)) i = k; if (i < 0) return; const S = PH[i];
  const g = SUBK.g; g.save(); g.font = '400 56px "Patrick Hand"'; let bold = false; const toks = S.cap.split(' ').map(w => { if (w.startsWith('**')) bold = true; const r = { w: w.replace(/\*\*/g, ''), b: bold }; if (w.replace(/[.,!?:;]+$/, '').endsWith('**')) bold = false; return r; });
  const lines = [[]]; let lw = 0; toks.forEach(o => { const ww = g.measureText(o.w + ' ').width; if (lw + ww > 740 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...o, ww }); lw += ww; }); g.restore();
  const lh = 66, hh = lines.length * lh / 2 + 26, cy = 1355 - hh, cx = 480, hw = Math.max(...lines.map(l => l.reduce((a, o) => a + o.ww, 0))) / 2 + 46;
  g.save(); g.fillStyle = '#000'; g.beginPath();
  for (let k = 0; k <= 60; k++) { const a = k / 60 * Math.PI * 2, px = Math.cos(a), py = Math.sin(a), sq = Math.pow(Math.abs(px), .3) * Math.sign(px), n = 1 + .05 * Math.sin(a * 7 + i) + .03 * Math.sin(a * 17); const X = cx + sq * hw * n, Y = cy + Math.pow(Math.abs(py), .5) * Math.sign(py) * hh * n; k ? g.lineTo(X, Y) : g.moveTo(X, Y); }
  g.closePath(); g.fill(); g.restore();
  const rv = pr(t, S.start - .1, S.start + .35), n = toks.length; let idx = 0;
  lines.forEach((ln, j) => { const tw = ln.reduce((a, o) => a + o.ww, 0); let x = cx - tw / 2; ln.forEach(o => { const vis = clamp(rv * n - idx); if (vis > 0) text(SUBT, o.w, x, cy - hh + 26 + lh * .78 + j * lh, { size: 56, col: o.b ? K.red : K.ink, reveal: 1, seed: 11 + i * 3 + idx, p: vis, stroke: 1.2, align: 'left' }); x += o.ww; idx++; }); }); }

// ---------- watercolour: a cold sky wash from the top; d = how far the brush has travelled ----------
function washSky(d, y1 = 1120, box = null) { if (d <= 0) return; const g = WASH.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const f = lerp(-80, 1160, d); if (box) { g.beginPath(); g.rect(...box); g.clip(); }
  g.beginPath(); g.moveTo(-60, 200); for (let y = 200; y <= y1; y += 20) g.lineTo(f + 60 * Math.sin(clamp((y - 200) / (y1 - 200)) * Math.PI) + 12 * Math.sin(y * .05), y); g.lineTo(-60, y1); g.closePath(); g.clip();
  g.beginPath(); for (let x = -40; x <= 1120; x += 40) g.lineTo(x, 210 + 10 * Math.sin(x * .01) + 8 * hash(x)); for (let x = 1120; x >= -40; x -= 40) g.lineTo(x, y1 + 14 * Math.sin(x * .007) + 10 * hash(x + 3)); g.closePath();
  g.fillStyle = '#000'; g.globalAlpha = .62; g.fill(); g.restore(); }

// ---------- scenes ----------
const SC = [];
const r = (i, d = 0) => s(i) + d;
SC[0] = (t, lt) => { washSky(1); snowWax(36, 250, 1120, t); ground(); const k = kid(CX, 700, 1.15); dripCycle(k.nostril[0], k.nostril[1], t, 2.4, 1); title('drip.', 330, 1, { x: 800, col: K.red, size: 140 }); };
SC[1] = (t, lt) => { washSky(1); ground(); kid(330, 720, .95, { smile: true }); const d = pr(lt, 0, .8);
  shape([[700, 500], [740, 500], [740, 900], [700, 900]], K.white, 300, d); dab(BG.f, 720, 930, 40, { col: K.red, p: .9, seed: 302 }); L(handCircle(720, 930, 42, 3, .1, 24), { seed: 303, draw: d }); L([[700, 760], [740, 760]], { seed: 304, w: 5, draw: d });
  note('not sick!', 860, 700, lt - .8, { size: 62 }); L([[820, 760], [860, 810], [960, 700]], { col: K.green, w: 12, seed: 305, draw: pr(lt, 1, 1.4) }); title('so WHY?', 300, lt - 2.2, { col: K.red, size: 120 }); };
SC[2] = (t, lt) => { profile(pr(lt, 0, .9)); title('AIR', 300, lt - .4, { x: 760, size: 96 }); title('CONDITIONER', 400, lt - .8, { x: 700, size: 84, col: K.red });
  shape([[680, 560], [960, 560], [960, 700], [680, 700]], K.white, 320, pr(lt, .9, 1.6)); for (let j = 0; j < 4; j++) L([[700, 590 + j * 28], [940, 590 + j * 28]], { seed: 322 + j, w: 4, draw: pr(lt, 1.4, 1.8) }); note('for your lungs', 800, 790, lt - 1.8); };
SC[3] = (t, lt) => { profile(1); const u = pr(lt, .2, 3.4); arrow(980, 820, 590, 790, K.sky, 330, pr(lt, .2, .8), -.1); note('cold', 900, 900, lt - .3, { col: K.sky });
  arrow(460, 680, 300, 700, K.orange, 332, pr(lt, 1.2, 1.8), .2); note('warmed up!', 640, 560, lt - 1.4, { col: K.orange }); arrow(260, 800, 260, 980, K.sky, 334, pr(lt, 2.2, 2.8)); note('made wet!', 420, 960, lt - 2.4, { col: K.sky });
  for (let j = 0; j < 4; j++) { const y = 820 + ((Math.floor(t * 12) / 12 * 120 + j * 50) % 200); if (lt > 2.4) drop(275 + (j % 2) * 14, y, 10, 340 + j); } };
SC[4] = (t, lt) => { washSky(1); ground(); snowWax(30, 250, 1120, t); title('VERY DRY', 330, lt - .2, { size: 120, col: K.red }); const d = pr(lt, .3, 1);
  for (let j = 0; j < 4; j++) arrow(120, 560 + j * 120, 760, 600 + j * 110, K.white, 350 + j * 3, d, .05);
  drop(880, 720, 46, 360, K.sky); L([[820, 650], [940, 800]], { col: K.red, w: 12, seed: 362, draw: pr(lt, 1.2, 1.6), fx: true }); L([[940, 650], [820, 800]], { col: K.red, w: 12, seed: 363, draw: pr(lt, 1.5, 1.9), fx: true }); };
SC[5] = (t, lt) => { profile(1); const blink = Math.floor(t * 6) % 2; title('NERVES:', 300, lt - .2, { x: 780, size: 92 }); title('ALARM!', 400, lt - .7, { x: 780, size: 100, col: K.red });
  for (let j = 0; j < 5; j++) { const x = 480 - j * 40, y = 690 + (j % 2) * 30; L([[x, y], [x - 12, y - 30], [x + 8, y - 44], [x - 6, y - 74]], { col: K.yellow, w: 8, seed: 370 + j, draw: pr(lt, .4 + j * .15, .8 + j * .15) }); }
  const bx = 820, by = 700; shape(smooth([[bx - 70, by + 50], [bx - 60, by - 40], [bx, by - 80], [bx + 60, by - 40], [bx + 70, by + 50]], 4), K.yellow, 380, pr(lt, .8, 1.5)); dab(BG.f, bx, by + 66, 16, { col: K.ink, p: .9, seed: 383 });
  if (lt > 1.5) for (let j = 0; j < 3; j++) L([[bx + 90 + j * 6, by - 60 + j * 40], [bx + 130 + j * 10 + blink * 8, by - 70 + j * 46]], { seed: 384 + j, w: 6, fx: true }); arrow(760, 820, 520, 760, K.ink, 390, pr(lt, 1.8, 2.4), -.2); note('to the brain', 820, 900, lt - 2.4); };
SC[6] = (t, lt) => { profile(1); const bx = 340, by = 500; shape(smooth([[bx - 120, by + 40], [bx - 130, by - 50], [bx - 60, by - 110], [bx + 40, by - 115], [bx + 120, by - 60], [bx + 130, by + 30], [bx + 40, by + 60], [bx - 60, by + 60]], 5), K.pink, 400, pr(lt, 0, .6), { p: .55 });
  for (let j = 0; j < 3; j++) L(smooth([[bx - 60 + j * 50, by - 70], [bx - 40 + j * 50, by - 20], [bx - 70 + j * 50, by + 20]], 4, false), { seed: 403 + j, w: 5, draw: pr(lt, .3, .8) });
  for (let j = 0; j < 3; j++) L(smooth([[430, 560 + j * 20], [480 + j * 20, 640 + j * 30], [520, 720 + j * 20], [560, 770]], 4, false), { col: K.red, w: 9, seed: 410 + j, draw: pr(lt, .6 + j * .2, 1.3 + j * .2) });
  title('EXTRA BLOOD', 300, lt - .2, { x: 720, size: 84, col: K.red }); note('= warmer air', 790, 400, lt - 1.2, { col: K.orange }); };
SC[7] = (t, lt) => { profile(1); for (let j = 0; j < 4; j++) { const x = 330 + j * 50, y = 640 + (j % 2) * 6; shape([[x - 18, y - 30], [x + 18, y - 30], [x + 12, y], [x - 12, y]], K.violet, 420 + j * 3, pr(lt, .2 + j * .2, .6 + j * .2));
    const ph = (t * 1.4 + j * .3) % 1; if (lt > .8) drop(x, y + 20 + ph * 70, 9 + 3 * ph, 440 + j); }
  title('MORE MUCUS', 300, lt - .3, { x: 720, size: 88, col: K.green }); title('+ WATER', 400, lt - .9, { x: 760, size: 88, col: K.sky }); note('tiny glands', 760, 560, lt - 1.4, { col: K.violet }); };
SC[8] = (t, lt) => { const bx = 540, by = 820; shape([[bx - 200, by - 180], [bx + 200, by - 180], [bx + 170, by + 180], [bx - 170, by + 180]], K.white, 450, pr(lt, 0, .6));
  F([[bx - 196, by - 170 + 40 * (1 - pr(lt, .3, 2.5))], [bx + 196, by - 170 + 40 * (1 - pr(lt, .3, 2.5))], [bx + 172, by + 172], [bx - 172, by + 172]], K.sky, { seed: 452, p: .6 });
  const ov = pr(lt, 1.6, 3.4); if (ov > 0) for (let j = 0; j < 4; j++) { const x = bx - 210 + j * 140, ph = (t * 1.2 + j * .25) % 1; drop(x + (j < 2 ? -20 : 20), by - 160 + ph * 330, 14, 460 + j); }
  title('MORE THAN', 300, lt - .2, { size: 110 }); title('IT NEEDS', 410, lt - .6, { size: 110, col: K.red }); note('your nose makes', 540, 1065, lt - 1, {});
  L([[bx - 230, by + 40], [bx + 230, by + 40]], { col: K.red, w: 6, seed: 470, draw: pr(lt, .9, 1.3), fx: true }); note('needed', bx + 300, by + 50, lt - 1.2, { col: K.red, size: 54 }); note('made', bx + 290, by - 160, lt - 2, { col: K.sky, size: 54 }); };
SC[9] = (t, lt) => { washSky(1); ground(); const k = kid(CX, 700, 1.15, { smile: false }); dripCycle(k.nostril[0], k.nostril[1], t, 1.6, 2); title('drip!', 330, lt - .2, { x: 820, col: K.red, size: 140 }); };
SC[10] = (t, lt) => { washSky(1); ground(); const k = kid(CX, 720, 1.15, { coldTip: lt > 1.4 }); title('2nd DRIP', 320, lt - .2, { size: 110, col: K.red });
  for (let j = 0; j < 3; j++) { const ph = ((t * .9 + j * .33) % 1); L(smooth([[k.nostril[0] + 10, k.nostril[1] + 10 - ph * 0], [k.nostril[0] + 80 + ph * 120, k.nostril[1] - 40 - ph * 60], [k.nostril[0] + 40 + ph * 200, k.nostril[1] - 140 - ph * 100]], 4, false), { col: K.orange, w: 8, p: .8 * (1 - ph), seed: 470 + j, fx: true }); }
  note('warm, wet', 880, 520, lt - .9, { col: K.orange, size: 54 }); note('breath', 880, 580, lt - .9, { col: K.orange, size: 54 }); note('cold tip!', 870, 800, lt - 1.6, { col: K.sky, size: 54 }); arrow(800, 820, 650, 770, K.sky, 480, pr(lt, 1.6, 2.2), .15); };
SC[11] = (t, lt) => { const d = pr(lt, 0, .8); shape(handCircle(310, 720, 200, 3, .05, 40), K.orange, 500, d, { p: .35 }); shape([[580, 560], [960, 560], [960, 900], [580, 900]], K.sky, 503, d, { p: .35 });
  for (let j = 0; j < 22; j++) { const a = hash(j * 3.1) * Math.PI * 2, rr = 160 * Math.sqrt(hash(j * 5.3)); dab(FX, 310 + Math.cos(a) * rr, 720 + Math.sin(a) * rr, 9, { col: K.sky, p: .9, seed: 520 + j }); }
  for (let j = 0; j < 5; j++) dab(FX, 620 + hash(j * 7.7) * 300, 600 + hash(j * 2.3) * 260, 9, { col: K.sky, p: .9, seed: 560 + j });
  note('warm air', 310, 980, lt - .4, { col: K.orange }); note('cold air', 770, 980, lt - .6, { col: K.sky }); title('HOLDS LESS', 330, lt - .2, { size: 100, col: K.sky }); title('so: drops!', 440, lt - 2.2, { size: 92, col: K.red });
  if (lt > 2.4) for (let j = 0; j < 3; j++) drop(660 + j * 110, 760 + 20 * Math.sin(t * 3 + j), 20, 570 + j); };
SC[12] = (t, lt) => { const d = pr(lt, 0, .7); shape([[220, 480], [860, 480], [860, 1060], [220, 1060]], null, 600, d); L([[540, 480], [540, 1060]], { seed: 602, draw: d }); L([[220, 770], [860, 770]], { seed: 603, draw: d });
  washSky(pr(lt, .2, 1.6), 1060, [224, 484, 632, 572]); const fg = pr(lt, .4, 1.6); if (fg > 0) dab(BG.f, 560, 800, 150 * fg, { col: K.white, p: .8, seed: 605, gap: 6 });
  if (lt > 1.4) { L(handCircle(560, 800, 90, 7, .1, 30), { col: K.ink, w: 5, seed: 606, draw: pr(lt, 1.4, 2) }); dab(BG.f, 530, 780, 8, { col: K.ink, p: .9, seed: 607 }); dab(BG.f, 590, 780, 8, { col: K.ink, p: .9, seed: 608 }); L([[520, 830], [560, 850], [600, 830]], { w: 5, seed: 609, draw: pr(lt, 1.8, 2.2) }); }
  title('LIKE A', 300, lt - .2, { size: 100 }); title('FOGGY WINDOW', 410, lt - .5, { size: 92, col: K.violet }); };
SC[13] = (t, lt) => { shape([[170, 520], [910, 520], [910, 760], [170, 760]], K.ochre, 620, pr(lt, 0, .6), { p: .4 }); text(BG.l, 'cold-induced', 540, 615, { size: 82, font: 'Gaegu', weight: 700, reveal: pr(lt, .4, 1.2), seed: 622, p: .95, stroke: 2, col: K.ink }); text(BG.l, 'rhinitis', 540, 715, { size: 90, font: 'Gaegu', weight: 700, reveal: pr(lt, 1.2, 1.9), seed: 623, p: .95, stroke: 2, col: K.red });
  title('A REAL NAME', 330, lt - .1, { size: 100 }); if (lt > 3) { note("or: skier's nose", 540, 880, lt - 3, { size: 66, col: K.sky }); const sx2 = 470 + pr(lt, 3.2, 5.4) * 160;
    L([[sx2 - 120, 1080], [sx2 + 60, 1040]], { col: K.red, w: 10, seed: 630 }); L([[sx2 - 30, 1050], [sx2 - 10, 970]], { seed: 631 }); dab(FX, sx2 - 10, 950, 22, { col: K.peach, p: .7, seed: 632 }); L(handCircle(sx2 - 10, 950, 22, 2, .1, 20), { seed: 633, w: 5, fx: true }); dab(FX, sx2 - 10, 932, 18, { col: K.red, p: .9, seed: 634 }); } };
SC[14] = (t, lt) => { title('5 TO 9', 300, lt - .1, { size: 120, col: K.red }); title('OUT OF 10', 410, lt - .5, { size: 100 });
  for (let j = 0; j < 10; j++) { const x = 160 + (j % 5) * 190, y = 640 + Math.floor(j / 5) * 260, d = pr(lt, .4 + j * .12, .8 + j * .12), col = j < 5 ? K.coat : j < 9 ? K.sky : null;
    if (d <= 0) continue; shape(handCircle(x, y, 50, 10 + j, .06, 24), K.peach, 640 + j * 5, d, { p: .5 }); shape([[x - 60, y + 50], [x + 60, y + 50], [x + 70, y + 170], [x - 70, y + 170]], col, 642 + j * 5, d, { p: j < 5 ? .75 : .4 });
    if (j < 9 && lt > 1.8) drop(x + 4, y + 30 + ((t * .8 + j * .3) % 1) * 30, 8, 660 + j); } };
SC[15] = (t, lt) => { const gx = 290, gy = 720, d = pr(lt, 0, .7); const gp = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 2, rr = 120 * (1 + .12 * Math.sin(a * 7)); gp.push([gx + Math.cos(a) * rr, gy + Math.sin(a) * rr]); }
  shape(gp, K.green, 680, d); dab(BG.f, gx - 35, gy - 20, 14, { col: K.ink, p: 1, seed: 683 }); dab(BG.f, gx + 35, gy - 20, 14, { col: K.ink, p: 1, seed: 684 });
  L([[gx - 150, gy - 150], [gx + 150, gy + 150]], { col: K.red, w: 16, seed: 685, draw: pr(lt, .8, 1.2), fx: true }); L([[gx + 150, gy - 150], [gx - 150, gy + 150]], { col: K.red, w: 16, seed: 686, draw: pr(lt, 1.1, 1.5), fx: true }); note('not a germ', gx, 920, lt - 1.2, { col: K.red });
  const nx = 760, ny = 760; shape(handCircle(nx, ny, 110, 4, .06, 30), '#f2a58f', 690, pr(lt, 1.6, 2.3)); shape(smooth([[nx - 130, ny - 90], [nx - 100, ny - 190], [nx, ny - 230], [nx + 100, ny - 190], [nx + 130, ny - 90]], 4), K.yellow, 693, pr(lt, 2, 2.6));
  dab(BG.f, nx - 40, ny - 10, 12, { col: K.ink, p: 1, seed: 696 }); dab(BG.f, nx + 40, ny - 10, 12, { col: K.ink, p: 1, seed: 697 }); if (lt > 2.6) drop(nx + 60 + 6 * Math.sin(t * 6), ny - 110, 14, 698);
  title('WORKING', 300, lt - 2.2, { x: 700, size: 96, col: K.red }); title('OVERTIME', 400, lt - 2.6, { x: 700, size: 96 }); };
SC[16] = (t, lt) => { title('IN THE COLD,', 320, lt - .1, { size: 96 }); title('DOES YOURS RUN?', 430, lt - .4, { size: 92, col: K.red });
  shape(handCircle(320, 820, 150, 2, .05, 36), K.green, 700, pr(lt, .6, 1.2)); shape(handCircle(760, 820, 130, 3, .05, 36), K.red, 703, pr(lt, .9, 1.5)); text(BG.l, 'YES', 320, 850, { size: 96, font: 'Gaegu', weight: 700, reveal: pr(lt, 1.1, 1.5), seed: 706, col: K.white, p: 1 }); text(BG.l, 'NO', 760, 850, { size: 96, font: 'Gaegu', weight: 700, reveal: pr(lt, 1.4, 1.8), seed: 707, col: K.white, p: 1 }); };
SC[17] = (t, lt) => { title('Follow for more of', 700, lt - .1, { size: 92 }); title('how it really works.', 810, lt - .7, { size: 92, col: K.red }); note("A new 'wait, really?' every day.", CX, 930, lt - 1.4, { size: 52 }); note('@howitreallyworkstudio', CX, 1010, lt - 1.7, { size: 50, col: K.coat });
  kid(CX, 360, .55, { draw: 1 }); };

const START = PH.map(p => p.start); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .15) k = i; return k; }
let F0 = null;
// per-scene camera on the page (world centre x, y, zoom) with a slow push: the profile scenes frame the whole head, the nose, the brain, the glands
const CAMS = { 2: [540, 960, 1], 3: [600, 930, 1.04], 5: [500, 900, 1.18], 6: [470, 860, 1.12], 7: [460, 880, 1.3] };
function draw(t) { BOIL.step = Math.floor(t * 12 + 1e-6); BOIL.amp = 1;
  clearGroup(KID); [BG.f, BG.l, FX, WASH, SUBK, SUBT].forEach(clear);
  const k = sceneAt(t), lt = k === 0 ? 99 : t - (START[k] - .15), cm = CAMS[k] || [540, 960, 1]; CAM.x = cm[0]; CAM.y = cm[1]; CAM.s = cm[2] * (1 + .012 * Math.min(lt, 5)); SC[k](t, lt); if (k < SC.length - 1) subtitle(t);
  comp.paperCam(CAM.x * .6, CAM.y * .6, CAM.s / .6); comp.begin(); comp.crayon(BG.f.c); comp.crayon(BG.l.c); comp.wash(WASH.c, { color: WASHC }); const go = [hash(BOIL.step) * 300, hash(BOIL.step + 7) * 300];
  comp.group(KID, { goff: go }); comp.crayon(FX.c, { goff: go }); comp.knock(SUBK.c); comp.crayon(SUBT.c);
  const lp = clamp((t - (TOT - .5)) / .5) * .4; if (lp > 0 && F0) { const [c2, g2] = [document.createElement('canvas'), null]; c2.width = W; c2.height = H; const gg = c2.getContext('2d'); gg.globalAlpha = lp; gg.drawImage(F0, 0, 0); comp.image(c2); }
  comp.finish({ vig: .3 }); }
// frame 0 snapshot for the loop ending (dissolves in at most 40% over the last 0.5 s)
draw(0); F0 = document.createElement('canvas'); F0.width = W; F0.height = H; F0.getContext('2d').drawImage(cv, 0, 0);

window.CUES = [['scribble', .1, .9], ['pop', 1.8], ['pop', 4.2], ['scribble', r(1, .1), r(1, .9)], ['tick', r(1, 1.1)], ['whoosh', r(2, -.2)], ['scribble', r(2, 0), r(2, 1.6)], ['whoosh', r(3, .2)], ['whoosh', r(3, 1.2)], ['bubbles', r(3, 2.4)],
  ['whoosh', r(4, .3)], ['snap', r(4, 1.3)], ['whoosh', r(5, -.1)], ['chime', r(5, 1.0), 84], ['chime', r(5, 1.4), 84], ['scribble', r(6, .2), r(6, 1.4)], ['bubbles', r(7, .8)], ['pop', r(8, .3)], ['bubbles', r(8, 1.6)],
  ['pop', r(9, .6)], ['whoosh', r(10, .3)], ['tick', r(10, 1.6)], ['scribble', r(11, 0), r(11, .8)], ['pop', r(11, 2.4)], ['pop', r(11, 2.6)], ['scribble', r(12, .2), r(12, 1.6)], ['scribble', r(13, .3), r(13, 1.9)], ['whoosh', r(13, 3.2)],
  ['pop', r(14, .4)], ['pop', r(14, .9)], ['pop', r(14, 1.4)], ['snap', r(15, .9)], ['snap', r(15, 1.2)], ['chime', r(15, 2.4), 79], ['pop', r(16, 1.1)], ['pop', r(16, 1.4)], ['chime', r(17, .2), 84]];
window.DUR = TOT;
window.seek = t => draw(t);
window.render = window.seek;
window.thumb = () => { BOIL.step = 24; clearGroup(KID); [BG.f, BG.l, FX, WASH, SUBK, SUBT].forEach(clear); washSky(1); snowWax(36, 250, 1120, 2); ground(); const k = kid(CX, 1000, 1.25); drop(k.nostril[0], k.nostril[1] + 40, 24, 701);
  text(BG.l, 'WHY DOES', CX, 330, { size: 140, font: 'Gaegu', weight: 700, seed: 801, p: .95, stroke: 3, col: K.ink }); text(BG.l, 'YOUR NOSE', CX, 470, { size: 140, font: 'Gaegu', weight: 700, seed: 802, p: .95, stroke: 3, col: K.ink }); text(BG.l, 'RUN?', CX, 620, { size: 160, font: 'Gaegu', weight: 700, seed: 803, p: .95, stroke: 3, col: K.red });
  comp.paperCam(0, 0, 1); comp.begin(); comp.crayon(BG.f.c); comp.crayon(BG.l.c); comp.wash(WASH.c, { color: WASHC }); comp.group(KID); comp.crayon(FX.c); comp.finish({ vig: .3 }); };
window.seek(0); window.ready = true; window.READY = true;
