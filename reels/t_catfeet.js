// t_catfeet.js: "How do cats always land on their feet?" in template #2 Red paper-cut (lemo-opuscar papercut-red). Canvas2D 1080x1920, pure function of t.
// Demo grammar reused (styles/papercut/ engine, kit shared with t_snowflake.js): red paper hero on a night-indigo paper ground, hand-cut wobble,
// paper grain and tight shadows, cut holes, pieces stepping at 12 fps with a one-step pop, cut-out titles letter by letter, the dark-red sawtooth
// banner subtitle. The engine is the explanation: the cat is two paper pieces jointed at the waist, and each half rolls on its own (a 2D roll is
// a squash through zero), so the front-then-back twist is literally visible; below, both halves seen from behind as paper wheels with leg tabs.
// Batch N layout: banner bottom at y 1355 inside x 70-890; titles at y 250-460; content inside y 250-1130; badge strip y 1366-1440 free.
import { PAL, canvas, paperGrain, fillPaper, curve, wob, trace, ellipsePoly, rnd, textPiece } from './styles/papercut/all.js';
await document.fonts.load('800 80px Fraunces'); await document.fonts.load('600 46px Fraunces');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let g = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const step = t => Math.floor(t * 12) / 12;                                   // pieces move on 12 fps steps
const popK = (lt, d = .25) => { const q = step(lt); if (q < 0) return 0; if (q < 1 / 12) return .6; if (q < 2 / 12) return 1.15; return 1; };   // pop: 0.6, 1.15 (one step), 1
const SNOW = '#e9ecf8', PALE = '#e98f86', DEEP = '#a8111f', GOLD = PAL.gold, CREAM = '#fff1d6';

// ---------- paper fill: colour + grain (soft-light) + tight paper shadow; holes cut with evenodd ----------
const [Lc, Lg] = canvas(W, H);
const GR = Lg.createPattern(paperGrain(), 'repeat');
function paper(pathFn, col, o = {}) {      // draw one paper piece (pathFn builds the path on a context); o.rule, o.shadow, o.alpha, o.holes(pathFn)
  Lg.setTransform(1, 0, 0, 1, 0, 0); Lg.clearRect(0, 0, W, H); Lg.globalCompositeOperation = 'source-over';
  Lg.beginPath(); pathFn(Lg); Lg.fillStyle = col; Lg.fill(o.rule || 'nonzero');
  // grain: soft-light, clipped to the piece so empty canvas stays empty
  GR.setTransform(new DOMMatrix([1, 0, 0, 1, (o.seed || 0) * 131 % 768, (o.seed || 0) * 71 % 768]));
  Lg.save(); Lg.beginPath(); pathFn(Lg); Lg.clip(o.rule || 'nonzero'); Lg.globalCompositeOperation = 'soft-light'; Lg.globalAlpha = 1; Lg.fillStyle = GR; Lg.fillRect(0, 0, W, H); Lg.restore();
  if (o.inset) { const [ins, gap] = o.inset; Lg.save(); Lg.beginPath(); pathFn(Lg); Lg.clip(o.rule || 'nonzero'); Lg.lineJoin = 'round'; Lg.globalCompositeOperation = 'destination-out'; Lg.lineWidth = 2 * (ins + gap); Lg.beginPath(); pathFn(Lg); Lg.stroke();
    Lg.globalCompositeOperation = 'source-over'; Lg.strokeStyle = col; Lg.lineWidth = 2 * ins; Lg.beginPath(); pathFn(Lg); Lg.stroke(); Lg.restore(); }
  if (o.holes) { Lg.globalCompositeOperation = 'destination-out'; Lg.beginPath(); o.holes(Lg); Lg.fillStyle = '#000'; Lg.fill(); }
  // cut-edge rim: a light line up-left, a dark line down-right
  Lg.globalCompositeOperation = 'source-atop'; Lg.lineWidth = 2; Lg.strokeStyle = 'rgba(255,200,180,.35)'; Lg.save(); Lg.translate(1, 1); Lg.beginPath(); pathFn(Lg); Lg.stroke(); Lg.restore();
  Lg.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = o.alpha ?? 1; const z = o.shadow ?? 1;
  if (z > 0) { g.shadowColor = o.shadowCol || 'rgba(8,10,30,.55)'; g.shadowBlur = 7 * z; g.shadowOffsetX = 4 * z; g.shadowOffsetY = 6 * z; }
  g.drawImage(Lc, 0, 0); g.restore(); }
const poly = (pts, closed = true) => q => trace(q, pts, closed);
const circ = (x, y, r, seed = 1) => wob(ellipsePoly(x, y, r, r, 0, Math.max(24, Math.round(r / 2))), .8, seed);


// ---------- cut-out titles: letters pop in one per 12 fps step ----------
function title(str, x, y, size, k, col = PAL.red, o = {}) { if (k < 0) return; const q = step(k), shown = Math.floor(q * 36) + 1; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = `800 ${size}px Fraunces`; const ws = [...str].map(ch => g.measureText(ch).width), tw = ws.reduce((a, b) => a + b, 0); let xx = x - (o.align === 'left' ? 0 : tw / 2);
  [...str].forEach((ch, i) => { if (i >= shown) { xx += ws[i]; return; } if (ch !== ' ') { const p = textPiece(ch, size, 800, col, 'Fraunces', 3 + i), sc = i === shown - 1 ? 1.15 : 1;
      g.save(); g.shadowColor = 'rgba(8,10,30,.55)'; g.shadowBlur = 6; g.shadowOffsetX = 3; g.shadowOffsetY = 5; g.translate(xx + ws[i] / 2, y); g.scale(sc, sc); g.drawImage(p.c, -ws[i] / 2 - 10, -size * 1.02, p.w, p.h); g.restore(); } xx += ws[i]; });
  g.restore(); }
function label(str, x, y, size, k, col = CREAM) { if (k < 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = clamp(step(k) * 6); g.font = `600 ${size}px Fraunces`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(8,10,30,.6)'; g.shadowBlur = 6; g.shadowOffsetY = 3; g.fillStyle = col; g.fillText(str, x, y); g.restore(); }
function tag(str, x, y, k, col = PAL.red, txt = CREAM, w = 210) { const u = popK(k); if (u <= 0) return; g.save(); g.translate(x, y); g.scale(u, u); g.translate(-x, -y);
  paper(poly(wob([[x - w / 2, y - 46], [x + w / 2, y - 46], [x + w / 2, y + 46], [x - w / 2, y + 46], [x - w / 2, y - 46]], .8, 9)), col, { seed: 12 }); g.restore();
  label(str, x, y + 2, 54 * u, k + 1, txt); }

// ---------- banner subtitle (demo hud: dark-red strip, sawtooth edges, swallowtails, gold flecks), multi-line ----------
const BAN = {};
function banner(i, t) { const p = PH[i]; if (!p) return; const lt = t - (p.start - .15); if (lt < 0) return;
  let b = BAN[i]; if (!b) { const [m, mg] = canvas(10, 10); mg.font = '600 46px Fraunces'; let bold = false; const toks = p.cap.split(' ').map(w => { const st = w.startsWith('**'); if (st) bold = true; const r = { w: w.replace(/\*\*/g, ''), b: bold }; if (w.replace(/[.,!?:;]+$/, '').endsWith('**')) bold = false; return r; });
    const lines = [[]]; let lw = 0; toks.forEach(o => { const ww = mg.measureText(o.w + ' ').width; if (lw + ww > 740 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...o, ww }); lw += ww; });
    const w = 820, h = lines.length * 56 + 46, K = 1.5, [c, cg] = canvas(w * K, h * K); cg.scale(K, K);
    const pl = []; for (let x = 0; x <= w; x += 10) pl.push([x, 4 + (x / 10 % 2) * 3]); pl.push([w - 26, h / 2]); for (let x = w; x >= 0; x -= 10) pl.push([x, h - 4 - (x / 10 % 2) * 3]); pl.push([26, h / 2]);
    cg.beginPath(); trace(cg, wob(pl, .3, 5)); cg.fillStyle = PAL.sub; cg.fill();
    for (let k = 0; k < 50; k++) { cg.fillStyle = `rgba(222,178,84,${.25 + rnd(k, 3) * .35})`; cg.beginPath(); cg.arc(30 + rnd(k, 1) * (w - 60), 10 + rnd(k, 2) * (h - 20), .8 + rnd(k, 4) * 1.4, 0, 7); cg.fill(); }
    cg.font = '600 46px Fraunces'; cg.textBaseline = 'middle'; lines.forEach((ln, j) => { const tw = ln.reduce((a, o) => a + o.ww, 0); let x = w / 2 - tw / 2; ln.forEach(o => { cg.fillStyle = o.b ? '#f2c14e' : CREAM; cg.fillText(o.w, x, 23 + 28 + j * 56); x += o.ww; }); });
    b = BAN[i] = { c, w, h }; }
  const u = step(lt), drop = u < 1 / 12 ? -14 : u < 2 / 12 ? -5 : 0, x = 480 - b.w / 2, y = 1355 - b.h + drop;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.shadowColor = 'rgba(8,4,20,.5)'; g.shadowBlur = 8; g.shadowOffsetX = 3; g.shadowOffsetY = 5; g.drawImage(b.c, x, y, b.w, b.h); g.restore(); }

// ---------- ground: night-indigo paper, a cut-paper city at the back, a pale street strip ----------
const SKY = [-60, 1140];
function ground(t) { g.setTransform(1, 0, 0, 1, 0, 0); fillPaper(g, 'indigo', 0, 0, W, H);
  for (let i = 0; i < 9; i++) { const x = -40 + i * 135, h = 230 + 170 * rnd(i, 4), w = 120 + 20 * rnd(i, 5); paper(poly(wob([[x, 1150], [x, 1150 - h], [x + w, 1150 - h], [x + w, 1150]], .6, 40 + i)), i % 2 ? '#1f2a55' : '#26326a', { seed: 40 + i, shadow: .4,
    holes: q => { for (let r = 0; r < Math.floor(h / 60); r++) for (let c = 0; c < 2; c++) if (rnd(i * 17 + r * 3 + c, 7) > .45) q.rect(x + 22 + c * 50, 1150 - h + 30 + r * 60, 26, 30); } }); }
  paper(poly(wob(curve([[-40, 1150], [300, 1138], [640, 1152], [1120, 1140]], false, 6), 1, 6).concat([[1120, 1960], [-40, 1960]])), '#7a88ba', { seed: 6, shadow: 1, inset: [3, 1.4] });
  for (let i = 0; i < 18; i++) { const x = 60 + i * 60, y = 1480 + 300 * rnd(i, 9); paper(poly(wob(ellipsePoly(x, y, 14, 9, 0, 14), .5, 60 + i)), '#6a78aa', { seed: 60 + i, shadow: .3 }); } }

// ---------- the paper cat, jointed at the waist: each half rolls on its own (side view: roll = vertical squash through 0) ----------
const tube = (pts, w) => { const L = [], R = []; for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, ww = w * (1 - .55 * i / (pts.length - 1)); L.push([pts[i][0] + Math.cos(an) * ww, pts[i][1] + Math.sin(an) * ww]); R.push([pts[i][0] - Math.cos(an) * ww, pts[i][1] - Math.sin(an) * ww]); } return L.concat(R.reverse()); };
const FRONT = { body: ellipsePoly(62, 0, 82, 46, 0, 36), head: ellipsePoly(165, -38, 50, 44, 0, 32), ears: [[[128, -66], [138, -112], [160, -78]], [[176, -76], [200, -112], [206, -64]]], legs: [[84, 30], [122, 30]] };
const BACK = { body: ellipsePoly(-60, 2, 86, 48, 0, 36), legs: [[-104, 30], [-62, 30]], tail: curve([[-136, -6], [-200, -40], [-226, -110], [-200, -150]], false, 8) };
function xf(P, x, y, s, th, bend, side) { const c = Math.cos(th), a = bend * side, ca = Math.cos(a), sa = Math.sin(a); return P.map(([px, py]) => { const qy = py * c; return [x + s * (px * ca - qy * sa), y + s * (px * sa + qy * ca)]; }); }
function catHalf(part, x, y, s, th, bend, side, o = {}) { const c = Math.cos(th), col = c >= 0 ? (o.col || PAL.red) : DEEP, tk = o.tuck || 0, seed = side > 0 ? 300 : 340;
  const legs = part.legs.map(([lx, ly]) => { const len = 80 * (1 - .6 * tk); return xf([[lx - 11, ly], [lx + 11, ly], [lx + 11 + tk * 30 * side, ly + len], [lx - 11 + tk * 30 * side, ly + len]], x, y, s, th, bend, side); });
  legs.forEach((L, i) => paper(poly(wob(L.concat([L[0]]), .5, seed + i)), col, { seed: seed + i, shadow: .7 }));
  if (part.tail) { const T = xf(tube(part.tail, 15), x, y, s, th, bend, side); paper(poly(wob(T.concat([T[0]]), .5, seed + 5)), col, { seed: seed + 5, shadow: .8 }); }
  const B = xf(part.body, x, y, s, th, bend, side); paper(poly(wob(B, .6, seed + 6)), col, { seed: seed + 6, shadow: 1, holes: c > .3 ? q => trace(q, xf(ellipsePoly(side * 60, -14, 34, 8, 0, 16), x, y, s, th, bend, side)) : null });
  if (part.head) { part.ears.forEach((E, i) => { const P = xf(E, x, y, s, th, bend, side); paper(poly(wob(P.concat([P[0]]), .4, seed + 8 + i)), col, { seed: seed + 8 + i, shadow: .8 }); });
    const Hd = xf(part.head, x, y, s, th, bend, side); paper(poly(wob(Hd, .5, seed + 10)), col, { seed: seed + 10, shadow: 1, holes: q => { for (const ex of [150, 184]) trace(q, xf(ellipsePoly(ex, -46, 9, c > 0 ? 4 : 2, 0, 12), x, y, s, th, bend, side)); trace(q, xf([[176, -22], [190, -22], [183, -14]], x, y, s, th, bend, side)); } }); } }
// thF / thB: roll of the front / back half (0 = feet down, PI = feet up); bend: V-bend at the waist (radians)
function cat(x, y, s, thF, thB, bend = 0, o = {}) { const back = () => catHalf(BACK, x, y, s, thB, bend, -1, o), front = () => catHalf(FRONT, x, y, s, thF, bend, 1, o);
  if (Math.cos(thF) < Math.cos(thB)) { front(); back(); } else { back(); front(); } }
// end-on view: a paper wheel per half with two leg tabs (down when th = 0)
function wheel(x, y, r, th, col, key) { const d = [-Math.sin(th), Math.cos(th)], n = [d[1], -d[0]];
  for (const sg of [-1, 1]) { const a = [x + d[0] * r * .7 + n[0] * r * .35 * sg, y + d[1] * r * .7 + n[1] * r * .35 * sg], b = [a[0] + d[0] * r * .6, a[1] + d[1] * r * .6]; const P = [[a[0] - n[0] * 12, a[1] - n[1] * 12], [a[0] + n[0] * 12, a[1] + n[1] * 12], [b[0] + n[0] * 12, b[1] + n[1] * 12], [b[0] - n[0] * 12, b[1] - n[1] * 12]]; paper(poly(wob(P.concat([P[0]]), .4, key + sg)), col, { seed: key + sg, shadow: .7 }); }
  paper(poly(wob(ellipsePoly(x, y, r, r, 0, 40), .6, key + 3)), col, { seed: key + 3, shadow: 1, holes: q => trace(q, ellipsePoly(x - d[0] * r * .45, y - d[1] * r * .45, r * .16, r * .16, 0, 14)) }); }
function arc(x, y, r, a0, a1, col, w = 10, key = 1) { const P = []; for (let i = 0; i <= 24; i++) { const a = lerp(a0, a1, i / 24); P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } const T = tube(P, w); paper(poly(T.concat([T[0]])), col, { seed: key, shadow: .6 });
  const [ex, ey] = P[24], an = a1 + (a1 > a0 ? Math.PI / 2 : -Math.PI / 2); const hd = [[ex + Math.cos(an) * 26, ey + Math.sin(an) * 26], [ex + Math.cos(an + 2.4) * 22, ey + Math.sin(an + 2.4) * 22], [ex + Math.cos(an - 2.4) * 22, ey + Math.sin(an - 2.4) * 22]]; paper(poly(hd.concat([hd[0]])), col, { seed: key + 1, shadow: .6 }); }
function dial(x, y, r, v, k) { if (k <= 0) return; paper(poly(wob(ellipsePoly(x, y, r, r, 0, 40), .5, 500)), CREAM, { seed: 500, shadow: 1 }); for (let i = -4; i <= 4; i++) { const a = -Math.PI / 2 + i * .32; paper(poly([[x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78], [x + Math.cos(a) * r * .92, y + Math.sin(a) * r * .92], [x + Math.cos(a + .03) * r * .92, y + Math.sin(a + .03) * r * .92]]), '#2a2a40', { shadow: 0 }); }
  const a = -Math.PI / 2 + v * 1.28; paper(poly([[x - 6, y], [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8], [x + 6, y]]), DEEP, { seed: 501, shadow: .5 }); label('0', x, y - r * .5, 40, 1, '#2a2a40'); label('SPIN', x, y + r * .45, 34, 1, '#2a2a40'); }
function building(x, y, w, floors, hi = -1, k = 1) { const fh = 72, top = y - floors * fh; paper(poly(wob([[x, y], [x, top], [x + w, top], [x + w, y]], .6, 520)), '#3a4a8c', { seed: 520, shadow: 1, holes: q => { for (let f = 0; f < floors; f++) for (let c = 0; c < 3; c++) q.rect(x + 30 + c * (w - 60) / 3, y - (f + 1) * fh + 18, (w - 60) / 3 - 24, 38); } });
  if (hi >= 0) for (let f = hi; f < floors; f++) paper(poly([[x - 14, y - (f + 1) * fh + 10], [x + w + 14, y - (f + 1) * fh + 10], [x + w + 14, y - f * fh - 6], [x - 14, y - f * fh - 6]]), GOLD, { seed: 530 + f, shadow: .5, alpha: .55 * k }); return top; }
function bone(x, y, s, crack) { const P = [...ellipsePoly(x - 160 * s, y - 26 * s, 34 * s, 30 * s, 0, 20, Math.PI * .4, Math.PI * 1.6), [x + 150 * s, y - 20 * s], ...ellipsePoly(x + 160 * s, y - 26 * s, 34 * s, 30 * s, 0, 20, Math.PI * 1.4, Math.PI * 2.6),
  ...ellipsePoly(x + 160 * s, y + 26 * s, 34 * s, 30 * s, 0, 20, Math.PI * 1.4 - Math.PI, Math.PI * 2.6 - Math.PI), [x - 150 * s, y + 20 * s], ...ellipsePoly(x - 160 * s, y + 26 * s, 34 * s, 30 * s, 0, 20, Math.PI * .4 - Math.PI, Math.PI * 1.6 - Math.PI)];
  paper(poly(wob(P, .6, 540)), CREAM, { seed: 540, shadow: 1, holes: crack ? q => trace(q, [[x - 4, y - 26 * s], [x + 14, y - 8 * s], [x - 8, y + 4 * s], [x + 10, y + 26 * s], [x + 2, y + 26 * s], [x - 16, y + 4 * s], [x + 6, y - 8 * s], [x - 12, y - 26 * s]]) : null }); }
function card(x, y, w, h, k, fn, seed) { const u = popK(k); if (u <= 0) return; g.save(); g.translate(x + w / 2, y + h / 2); g.scale(u, u); g.translate(-x - w / 2, -y - h / 2); paper(poly(wob([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], .7, seed)), '#2b3670', { seed, shadow: 1, inset: [4, 1.6] }); fn(); g.restore(); }
function windowLedge() { paper(poly(wob([[120, 250], [520, 250], [520, 520], [120, 520]], .6, 560)), '#ffd98a', { seed: 560, shadow: 1, holes: q => { q.rect(150, 280, 155, 210); q.rect(335, 280, 155, 210); } }); paper(poly(wob([[90, 520], [550, 520], [550, 552], [90, 552]], .5, 561)), '#7a88ba', { seed: 561, shadow: 1 }); }
function impact(x, y, k) { if (k <= 0 || k > 1) return; for (let i = 0; i < 6; i++) { const a = Math.PI + (i + .5) / 6 * Math.PI, r0 = 60 + 40 * k, r1 = r0 + 50; paper(poly([[x + Math.cos(a) * r0, y + Math.sin(a) * r0 * .5], [x + Math.cos(a + .05) * r1, y + Math.sin(a + .05) * r1 * .5], [x + Math.cos(a - .05) * r1, y + Math.sin(a - .05) * r1 * .5]]), CREAM, { shadow: .3, alpha: 1 - k }); } }

// ---------- scenes ----------
const r = (i, d = 0) => s(i) + d, L = (i, t) => t - s(i);
const SC = [];
// the fall + flip used by the hook and the landing scenes: u 0..1 over the fall
function fallFlip(u) { const thF = Math.PI * (1 - ss(.15, .55, u)), thB = Math.PI * (1 - ss(.4, .8, u)) + .35 * Math.sin(Math.PI * clamp((u - .15) / .45)) * (u < .55 ? 1 : 0), bend = .45 * Math.sin(Math.PI * clamp((u - .1) / .75)); return [thF, thB, bend]; }
SC[0] = (t) => { windowLedge(); const per = 2.7, q = step(t + 1.0) % per, u = clamp(q / 2.1), y = lerp(560, 1040, u * u), [thF, thB, bend] = fallFlip(u); cat(560, y, .95, thF, thB, bend, { tuck: u > .15 && u < .5 ? .6 : 0 }); impact(560, 1120, (q - 2.1) / .4); title('FEET FIRST?', CX, 330 + 0, 104, 1, CREAM, {}); };
SC[1] = (t) => { const lt = L(1, t); windowLedge(); cat(560, 760 + 6 * Math.sin(step(t) * 4), .95, Math.PI, Math.PI, 0); title('HOW?', 790, 640, 150, lt + .3, PAL.red); title('?', 300, 860, 120, lt - .4, CREAM); };
SC[2] = (t) => { const lt = L(2, t); title('THE RIGHTING', CX, 320, 92, lt - .1, CREAM); title('REFLEX', CX, 430, 110, lt - .4, PAL.red);
  for (let i = 0; i < 4; i++) { const x = 180 + i * 240, y = 760, u = i / 3, [thF, thB, bend] = fallFlip(.15 + u * .7); card(x - 110, y - 190, 220, 380, lt - .6 - i * .25, () => { cat(x, y - 20, .48, thF, thB, bend); label(String(i + 1), x, y + 150, 40, 1, GOLD); }, 600 + i); } };
SC[3] = (t) => { const lt = L(3, t); cat(CX, 720, 1.05, Math.PI, Math.PI, 0); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .6, x = CX + Math.cos(a) * 340, y = 720 + Math.sin(a) * 300; label('?', x, y, 70, lt - .3 - i * .2, '#9aa6d6'); } title('NOTHING TO', CX, 320, 96, lt - .1, CREAM); title('PUSH AGAINST', CX, 430, 96, lt - .4, PAL.red); };
SC[4] = (t) => { const lt = L(4, t); cat(CX, 620, .9, Math.PI, Math.PI, 0); dial(CX, 930, 120, .02 * Math.sin(step(t) * 9), lt - .3); title('NO FREE SPIN', CX, 330, 104, lt - .1, CREAM); };
SC[5] = (t) => { const lt = L(5, t); title('ANGULAR', CX, 330, 112, lt - .1, CREAM); title('MOMENTUM', CX, 450, 112, lt - .4, PAL.red); dial(CX, 760, 150, 0, lt - .7); label('the total spin stays the same', CX, 1010, 46, lt - 1.2, CREAM); };
SC[6] = (t) => { const lt = L(6, t), bend = .5 * ss(.3, 1.4, lt); cat(CX, 700, 1.1, Math.PI, Math.PI, bend); title('IT BENDS', CX, 330, 112, lt - .1, CREAM); title('IN THE MIDDLE', CX, 450, 96, lt - .4, PAL.red); if (lt > 1.4) { for (let i = 0; i < 5; i++) paper(poly([[CX - 4, 560 + i * 60], [CX + 4, 560 + i * 60], [CX + 4, 590 + i * 60], [CX - 4, 590 + i * 60]]), GOLD, { shadow: .3 }); } };
// the twist: side view on top, the two halves seen from behind below (front wheel, back wheel)
function twist(lt, thF, thB, o = {}) { cat(CX, 560, .95, thF, thB, .45); wheel(330, 930, 110, thF, PAL.red, 700); wheel(750, 930, 110, thB, DEEP, 720); label('front half', 330, 1090, 44, 1, CREAM); label('back half', 750, 1090, 44, 1, CREAM); if (o.arrF) arc(330, 930, 150, -2.2, -.6, GOLD, 9, 740); if (o.arrB) arc(750, 930, 150, -.9, -1.5, '#9aa6d6', 9, 742); }
SC[7] = (t) => { const lt = L(7, t), u = ss(.3, 2.4, lt); twist(lt, Math.PI * (1 - u), Math.PI + .35 * u, { arrF: u < 1, arrB: 0 }); title('FRONT HALF FIRST', CX, 330, 92, lt - .1, CREAM); };
SC[8] = (t) => { const lt = L(8, t); twist(lt, 0, Math.PI + .35 + .03 * Math.sin(step(t) * 6), { arrB: 1 }); title('BACK HALF:', CX, 330, 96, lt - .1, CREAM); title('THE OTHER WAY', CX, 440, 92, lt - .4, PAL.red); };
SC[9] = (t) => { const lt = L(9, t), u = ss(.2, 2.2, lt); twist(lt, 0, (Math.PI + .35) * (1 - u), { arrB: u < 1 }); title('THEN SWAP', CX, 330, 104, lt - .1, CREAM); };
SC[10] = (t) => { const lt = L(10, t); cat(CX, 560, .95, 0, 0, .45 * (1 - ss(.4, 1.4, lt))); arc(330, 930, 120, -2.4, -.7, GOLD, 9, 750); arc(750, 930, 120, -.7, -2.4, '#9aa6d6', 9, 752); label('+', 330, 930, 90, lt - .2, GOLD); label('−', 750, 930, 90, lt - .4, '#9aa6d6'); label('total spin: 0', CX, 1080, 52, lt - .9, CREAM); title('IT CANCELS OUT', CX, 330, 96, lt - .1, CREAM); };
SC[11] = (t) => { const lt = L(11, t); card(110, 540, 400, 470, lt - .3, () => { const [a, b, c] = fallFlip(.4); cat(310, 760, .55, a, b, c); label('bend & twist', 310, 940, 44, 1, CREAM); }, 760); card(570, 540, 400, 470, lt - .7, () => { cat(770, 760, .55, .3, Math.PI * .8, .1, { tuck: .8 }); label('tuck & turn', 770, 940, 44, 1, CREAM); }, 762);
  title('PHYSICISTS THINK:', CX, 330, 84, lt - .1, CREAM); title('A MIX OF MOVES', CX, 440, 92, lt - .4, PAL.red); };
SC[12] = (t) => { const lt = L(12, t), u = clamp(lt / 1.1), y = lerp(560, 1040, u * u); cat(CX, y, .95, 0, 0, 0); impact(CX, 1120, (lt - 1.1) / .5); title('BUT SAFE?', CX, 330, 120, lt - .1, PAL.red); };
SC[13] = (t) => { const lt = L(13, t); const top = building(300, 1150, 480, 11); cat(400, top + 210, .45, 0, 0, 0); paper(poly([[280, top + 250], [520, top + 250], [520, top + 262], [280, top + 262]]), '#7a88ba', { shadow: .6 }); title('HIGH-RISE', CX, 330, 112, lt - .1, CREAM); title('SYNDROME', CX, 450, 112, lt - .4, PAL.red); };
SC[14] = (t) => { const lt = L(14, t); bone(CX, 760, 1.4, lt > 1.2); title('119 CATS', CX, 330, 112, lt - .1, CREAM); title('~46% BROKEN LEGS', CX, 450, 84, lt - .7, PAL.red); label('Vnuk et al., 2004', CX, 1000, 40, lt - 1.4, '#9aa6d6'); };
SC[15] = (t) => { const lt = L(15, t); const top = building(330, 1150, 420, 12, 6, clamp(lt / .6)); for (let f = 0; f < 12; f += 3) label(String(f + 1), 290, 1150 - f * 72 - 36, 34, lt - .2, CREAM); label('7th floor +', 540, top - 40, 50, lt - .5, GOLD); title('HIGHER: WORSE', CX, 330, 104, lt - .1, CREAM); };
SC[16] = (t) => { const lt = L(16, t); cat(380, 720, .8, 0, 0, 0); bone(780, 760, .7, true); title('PHYSICS EXPERTS', CX, 330, 92, lt - .1, CREAM); title('NOT UNBREAKABLE', CX, 440, 92, lt - .5, PAL.red); };
SC[17] = (t) => { const lt = L(17, t); cat(CX, 900, 1.05, 0, 0, -.1); title('GRACEFUL?', CX, 380, 130, lt - .1, PAL.red); };
SC[18] = (t) => { const lt = L(18, t); cat(CX, 450, .55, 0, 0, 0); title('Follow for more of', CX, 690, 70, lt - .1, CREAM); title('how it really works.', CX, 790, 70, lt - .4, PAL.red);
  label("A new 'wait, really?' every day.", CX, 870, 46, lt - .8); label('@howitreallyworkstudio', CX, 930, 44, lt - 1.0, '#f2c14e'); };

const START = PH.map(p => p.start); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .2) k = i; return k; }
function draw(t) { const k = sceneAt(t); ground(t); g.setTransform(1, 0, 0, 1, 0, 0); SC[k](t); if (k < PH.length - 1) banner(k, t); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = g; g = F0.getContext('2d'); draw(0); g = keep; }
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } }
window.CUES = [['whoosh', .3], ['pop', 1.9], ['pop', r(1, .1)], ['pop', r(2, .1)], ['pop', r(2, .7)], ['pop', r(2, .95)], ['pop', r(2, 1.2)], ['pop', r(2, 1.45)], ['pop', r(3, .1)], ['pop', r(4, .1)], ['tick', r(4, .6)], ['pop', r(5, .1)], ['chime', r(5, 1), 76], ['pop', r(6, .1)], ['slide', r(6, .5)],
  ['pop', r(7, .1)], ['whoosh', r(7, .5)], ['pop', r(8, .1)], ['slide', r(8, .4)], ['pop', r(9, .1)], ['whoosh', r(9, .4)], ['pop', r(10, .1)], ['chime', r(10, 1), 79], ['pop', r(11, .4)], ['pop', r(11, .8)], ['pop', r(12, .1)], ['thud', r(12, 1.1)], ['pop', r(13, .1)], ['pop', r(14, .1)], ['snap', r(14, 1.2)],
  ['pop', r(15, .1)], ['pop', r(16, .1)], ['pop', r(17, .1)], ['chime', r(18, .2), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { ground(2); windowLedge(); const [a, b, c] = fallFlip(.45); cat(560, 820, 1.1, a, b, c); title('HOW CATS', CX, 1160, 130, 3, CREAM); title('LAND ON FEET', CX, 1300, 110, 3, PAL.red); };
window.seek(0); window.ready = true; window.READY = true;
