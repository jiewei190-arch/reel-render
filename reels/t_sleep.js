// sleep: hand-drawn (recipe: awesome-opus-5-5 "Hand-drawn": wobbly pencil/ink lines on off-white paper, redrawn every few frames (line boil), ink black + one accent colour, no gradients/3D/gloss, hand-lettered labels only where needed). Original code.
import { clamp, ramp, ease, eo, lerp, pop, rnd, s, e, TL, captions } from './rl.js';
const cv = document.getElementById('c'), ctx = cv.getContext('2d'); const W = 540, H = 960;
const PAPER = '#f7f2e7', INK = '#1a1a22', AC = '#4b4fd8', ACW = 'rgba(75,79,216,.16)';
const HAND = "'Caveat', cursive";
let BOIL = 0;
const nz = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233 + BOIL * 37.719) * 43758.5453; return x - Math.floor(x) - .5; };
// ---- sketch primitives (all pure functions of t via BOIL)
function sline(x1, y1, x2, y2, prog = 1, w = 3, col = INK, seed = 1, amp = 1.7) { if (prog <= 0) return; const L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.ceil(L / 16)); const nx = -(y2 - y1) / (L || 1), ny = (x2 - x1) / (L || 1); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); const m = Math.max(1, Math.floor(n * clamp(prog)));
  for (let i = 0; i <= m; i++) { const u = Math.min(1, i / n) * (i === m ? 1 : 1); const uu = i === m ? clamp(prog) : i / n; const o = nz(seed * 7.1 + i, seed) * amp * 2; const px = x1 + (x2 - x1) * uu + nx * o, py = y1 + (y2 - y1) * uu + ny * o; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke(); ctx.restore(); }
function spath(pts, prog = 1, w = 3, col = INK, seed = 1, close = false, amp = 1.6) { const P = close ? [...pts, pts[0]] : pts; let tot = 0; const segs = []; for (let i = 0; i < P.length - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); segs.push(l); tot += l; } let rem = tot * clamp(prog); for (let i = 0; i < P.length - 1 && rem > 0; i++) { const take = Math.min(1, rem / (segs[i] || 1)); sline(P[i][0], P[i][1], P[i][0] + (P[i + 1][0] - P[i][0]) * take, P[i][1] + (P[i + 1][1] - P[i][1]) * take, 1, w, col, seed + i * 3.7, amp); rem -= segs[i]; } }
const circPts = (cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const sellipse = (cx, cy, rx, ry, prog = 1, w = 3, col = INK, seed = 1) => spath(circPts(cx, cy, rx, ry, Math.max(14, Math.round((rx + ry) / 5)), -1.2, -1.2 + Math.PI * 2 + .15), prog, w, col, seed);
const srect = (x, y, w, h, prog = 1, lw = 3, col = INK, seed = 1) => spath([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], prog, lw, col, seed, true);
function hatch(clipFn, x0, y0, x1, y1, gap = 9, col = AC, a = .55, prog = 1, w = 2, seed = 3) { ctx.save(); ctx.beginPath(); clipFn(); ctx.clip(); const k = clamp(prog); for (let d = -(y1 - y0); d < (x1 - x0) + (y1 - y0); d += gap) { if ((d + (y1 - y0)) / ((x1 - x0) + 2 * (y1 - y0)) > k) break; ctx.globalAlpha = a; sline(x0 + d, y1, x0 + d + (y1 - y0), y0, 1, w, col, seed + d, 1.2); } ctx.restore(); }
function wash(clipFn, col = ACW) { ctx.save(); ctx.beginPath(); clipFn(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
function HT(str, x, y, size, col = INK, o = {}) { ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.font = `${o.w ?? 700} ${size}px ${HAND}`; ctx.textAlign = o.al ?? 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.fillText(str, 0, 0); ctx.restore(); }
function squig(x, y, w, prog = 1, col = AC, lw = 3, amp = 5, n = 8, seed = 2) { const pts = []; for (let i = 0; i <= n * 2; i++) pts.push([x + w * i / (n * 2), y + (i % 2 ? amp : -amp)]); spath(pts, prog, lw, col, seed, false, 1); }
function arrowS(x1, y1, x2, y2, prog = 1, col = INK, w = 3, seed = 5) { sline(x1, y1, x2, y2, prog, w, col, seed); if (prog > .9) { const a = Math.atan2(y2 - y1, x2 - x1); sline(x2, y2, x2 - 14 * Math.cos(a - .5), y2 - 14 * Math.sin(a - .5), 1, w, col, seed + 1); sline(x2, y2, x2 - 14 * Math.cos(a + .5), y2 - 14 * Math.sin(a + .5), 1, w, col, seed + 2); } }
function star(cx, cy, r, prog = 1, col = INK, w = 2.5, seed = 1) { const p = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } spath(p, prog, w, col, seed, true); }
function moon(cx, cy, r, prog = 1, col = INK) { spath(circPts(cx, cy, r, r, 24, -2.2, 2.2), prog, 3, col, 9); spath(circPts(cx + r * .45, cy, r * .78, r * .86, 20, 2.0, -2.0), prog, 3, col, 12); }
function zzz(x, y, t, a = 1) { [0, 1, 2].forEach(i => { const k = ((t * .5 + i * .33) % 1); HT('z', x + i * 22 + k * 10, y - i * 26 - k * 34, 30 + i * 8, AC, { a: a * Math.sin(k * Math.PI) }); }); }
// ---- brain doodle
function brain(cx, cy, sc, prog = 1, col = INK, seed = 1) { const pts = []; const lobes = 14; for (let i = 0; i <= lobes * 8; i++) { const a = i / (lobes * 8) * Math.PI * 2; const r = 1 + .075 * Math.abs(Math.sin(a * lobes / 2)); pts.push([cx + Math.cos(a) * 76 * sc * r, cy + Math.sin(a) * 56 * sc * r]); } spath(pts, prog, 3.5, col, seed, true, .8);
  spath([[cx, cy - 52 * sc], [cx - 7 * sc, cy - 18 * sc], [cx + 6 * sc, cy + 14 * sc], [cx - 2 * sc, cy + 52 * sc]], prog, 2.5, col, seed + 5, false, .8); [[-42, -14, 2.9], [40, -18, .2], [-36, 22, 3.4], [42, 20, .0]].forEach(([dx, dy, st], i) => spath(circPts(cx + dx * sc, cy + dy * sc, 17 * sc, 10 * sc, 10, st, st + 3.6), prog, 2.2, col, seed + i * 3, false, .7)); return pts; }
// ---- hypnogram
const HX0 = 50, HX1 = 500, HY0 = 250, HY1 = 520; // y: top=awake, bottom=deep; REM near top
const NIGHT = [[0, 0], [.04, .35], [.08, .7], [.14, .95], [.24, .9], [.3, .5], [.34, .2], [.38, .1], [.4, .35], [.46, .7], [.55, .9], [.62, .55], [.66, .12], [.7, .1], [.74, .4], [.8, .6], [.86, .3], [.9, .1], [.95, .12], [1, .05]];
const hy = v => HY0 + 20 + v * (HY1 - HY0 - 40); const hx = u => HX0 + u * (HX1 - HX0);
function hyp(prog, col = INK, w = 3.5) { const pts = NIGHT.map(([u, v]) => [hx(u), hy(v)]); spath(pts, prog, w, col, 21); }
function hypAxes(a = 1) { sline(HX0, HY0, HX0, HY1 + 6, a, 3, INK, 31); sline(HX0, HY1 + 6, HX1 + 6, HY1 + 6, a, 3, INK, 32); if (a > .8) { HT('awake', HX0 + 36, HY0 + 14, 22, INK, { al: 'left', a: .85 }); HT('deep', HX0 + 36, HY1 - 14, 22, INK, { al: 'left', a: .85 }); HT('night →', HX1 - 40, HY1 + 34, 22, INK, { a: .85 }); } }
// ---- scenes
const sc = []; const scn = (a, b, fn) => sc.push({ a, b, fn }); const P = i => s(i);
// 0 hook
scn(0, s(1) - .05, t => { const k = ramp(t + .35, 0, 1.2); // bed + sleeper + brain bulb
  spath([[70, 560], [470, 560]], k, 4, INK, 1); spath([[70, 560], [70, 620], [470, 620], [470, 560]], k, 4, INK, 2); spath([[120, 560], [120, 520], [250, 520], [250, 560]], k, 3.5, INK, 3);
  sellipse(150, 505, 34, 30, ramp(t + .35, .3, .8), 3.5, INK, 4); spath([[180, 520], [180, 540], [470, 540]], ramp(t + .35, .4, .8), 3.5, INK, 5); wash(() => { ctx.rect(185, 520, 285, 40); }, ACW);
  squig(200, 520, 240, ramp(t + .35, .5, .8), INK, 3, 4, 14, 6); moon(430, 190, 34, ramp(t, 1.0, .8)); star(380, 150, 12, ramp(t, 1.4, .5)); star(470, 250, 10, ramp(t, 1.6, .5)); zzz(190, 490, t, ramp(t, .8, .4));
  const bk = ramp(t, 1.1, 1.0); brain(250, 330, 1.2, bk, INK, 11); hatch(() => { ctx.ellipse(250, 330, 85, 62, 0, 0, 7); }, 150, 260, 350, 400, 11, AC, .45, bk); // rays
  for (let i = 0; i < 9; i++) { const a = -Math.PI * .95 + i * Math.PI * 1.9 / 8; const r0 = 120, r1 = 148 + 10 * Math.sin(t * 6 + i); sline(250 + Math.cos(a) * r0, 330 + Math.sin(a) * r0 * .85, 250 + Math.cos(a) * r1, 330 + Math.sin(a) * r1 * .85, ramp(t, 2.0 + i * .08, .3), 3, AC, 70 + i); }
  HT('still working!', 250, 170, 44, AC, { a: ramp(t, 2.0, .5), rot: -.04 }); });
// 1 cycle loops
scn(s(1) - .05, s(2) - .05, t => { const k = t - s(1); for (let i = 0; i < 3; i++) { const cx = 130 + i * 140, cy = 400; const a = ramp(k, .3 + i * .7, .8); spath(circPts(cx, cy, 52, 52, 24, -1.5, 3.9), a, 4, INK, 40 + i); if (a > .9) arrowS(cx + 40, cy - 40, cx + 52, cy - 14, 1, AC, 3.5, 90 + i); }
  HT('again', 270, 520, 50, AC, { a: ramp(k, 1.6, .4) }); HT('and again', 270, 575, 50, AC, { a: ramp(k, 2.0, .4) }); HT('all night', 270, 630, 44, INK, { a: ramp(k, 2.3, .4) }); moon(430, 180, 30, ramp(k, .2, .6)); });
// 2 clock 80-100 min
scn(s(2) - .05, s(3) - .05, t => { const k = t - s(2); sellipse(270, 370, 120, 120, ramp(k, .1, .9), 5, INK, 50); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; sline(270 + Math.cos(a) * 100, 370 + Math.sin(a) * 100, 270 + Math.cos(a) * 112, 370 + Math.sin(a) * 112, ramp(k, .5 + i * .03, .2), 3, INK, 60 + i); }
  const ang = -Math.PI / 2 + ease(ramp(k, .8, 2.0)) * Math.PI * 1.3; sline(270, 370, 270 + Math.cos(ang) * 88, 370 + Math.sin(ang) * 88, ramp(k, .7, .2), 5, AC, 80); sline(270, 370, 270 + Math.cos(ang * .08) * 50, 370 + Math.sin(ang * .08) * 50, ramp(k, .7, .2), 5, INK, 81); wash(() => { ctx.moveTo(270, 370); ctx.arc(270, 370, 100, -Math.PI / 2, ang); ctx.closePath(); }, ACW);
  HT('80 – 100', 270, 575, 76, AC, { a: ramp(k, 1.0, .5) }); HT('minutes', 270, 640, 50, INK, { a: ramp(k, 1.3, .4) }); });
// 3 four to six
scn(s(3) - .05, s(4) - .05, t => { const k = t - s(3); const n = 6; for (let i = 0; i < n; i++) { const cx = 100 + (i % 3) * 170, cy = 300 + Math.floor(i / 3) * 190; const a = ramp(k, .2 + i * .25, .6); const col = i < 4 ? INK : AC; spath(circPts(cx, cy, 52, 52, 22, -1.5, 3.9), a, 4, col, 100 + i); if (i >= 4) { ctx.save(); ctx.setLineDash([6, 8]); ctx.restore(); } if (a > .9) { HT(String(i + 1), cx, cy + 4, 50, col, { a: 1 }); } }
  HT('4 – 6 cycles', 270, 650, 64, AC, { a: ramp(k, 1.6, .4) }); HT('most nights', 270, 705, 40, INK, { a: ramp(k, 1.9, .4) }); });
// 4 non-REM three stages
scn(s(4) - .05, s(5) - .05, t => { const k = t - s(4); HT('NON-REM', 270, 210, 70, INK, { a: ramp(k, .1, .4) }); HT('3 stages', 270, 270, 46, AC, { a: ramp(k, .6, .4) }); const st = [[90, 340, '1'], [200, 420, '2'], [310, 500, '3']]; st.forEach(([x, y, n], i) => { const a = ramp(k, 1.0 + i * .6, .5); srect(x, y, 110, 40, a, 3.5, INK, 130 + i); wash(() => ctx.rect(x, y, 110, 40), i === 2 ? 'rgba(75,79,216,.35)' : ACW); HT(n, x + 55, y + 22, 40, INK, { a }); if (i < 2) arrowS(x + 110, y + 20, x + 128, y + 44, a, AC, 3, 140 + i); }); });
// 5 drift off / asleep / deep
scn(s(5) - .05, s(6) - .05, t => { const k = t - s(5); const steps = [['drift off', 140, 290], ['asleep', 140, 410], ['deep, slow waves', 140, 530]]; steps.forEach(([lab, x, y], i) => { const a = ramp(k, .2 + i * 1.2, .6); spath([[x - 40, y + 36], [x - 40, y], [x + 330, y]], a, 4, i === 2 ? AC : INK, 150 + i); HT(lab, x + 140, y - 26, 44, i === 2 ? AC : INK, { a }); if (i < 2) { const b = ramp(k, .8 + i * 1.2, .5); arrowS(x + 335, y + 2, x + 335, y + 70, b, INK, 3, 160 + i); } });
  // sleeper sinks
  const sink = ease(ramp(k, .5, 3.4)); const py = lerp(280, 540, sink); sellipse(110, py - 14, 16, 16, 1, 3, INK, 170); spath([[110, py + 2], [110, py + 36]], 1, 3, INK, 171); zzz(130, py - 20, t, sink > .5 ? 1 : .3); });
// 6 first part of the night: hypnogram deep early
scn(s(6) - .05, s(7) - .05, t => { const k = t - s(6); hypAxes(ramp(k, .1, .5)); hyp(ramp(k, .5, 1.6), INK, 3.5); const a = ramp(k, 1.4, .8); [[.14, .24], [.55, .62]].forEach(([u0, u1], i) => { hatch(() => { ctx.rect(hx(u0), HY0, hx(u1) - hx(u0), HY1 - HY0); }, hx(u0), HY0, hx(u1), HY1, 10, AC, .45, i === 0 ? a : ramp(k, 2.4, .6)); }); HT('lots of deep sleep', hx(.2), HY0 - 18, 36, AC, { a: ramp(k, 1.6, .5) }); HT('early', hx(.2), HY1 + 40, 34, INK, { a: ramp(k, 1.8, .4) }); });
// 7 heart rate
scn(s(7) - .05, s(8) - .05, t => { const k = t - s(7); const hp = Array.from({ length: 41 }, (_, i) => { const a = i / 40 * Math.PI * 2; return [270 + 12 * Math.pow(Math.sin(a), 3) * 11.5, 360 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 11]; }); spath(hp, ramp(k, .1, 1.0), 5, INK, 180, true); wash(() => { hp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }, 'rgba(75,79,216,.22)');
  // slowing pulse line
  const a = ramp(k, .9, .3); const spd = lerp(14, 6, ease(ramp(k, 1, 2))); const pts = []; for (let x = 60; x <= 480; x += 3) { const ph = (x - 60) / 420 * spd - 0; const f = ph % 1; const y = 600 - (f > .45 && f < .5 ? 60 : f > .5 && f < .55 ? -34 : 0); pts.push([x, y]); } spath(pts, ramp(k, .9, 1.2), 3.5, AC, 181, false, .6);
  HT('heart rate ↓', 270, 665, 50, AC, { a: ramp(k, 1.6, .4) }); HT('blood pressure ↓', 270, 715, 40, INK, { a: ramp(k, 2.0, .4) }); });
// 8 learning (book -> head memory)
scn(s(8) - .05, s(9) - .05, t => { const k = t - s(8); // book
  spath([[90, 520], [200, 490], [200, 420], [90, 450]], ramp(k, .2, .6), 4, INK, 190, true); spath([[200, 490], [310, 520], [310, 450], [200, 420]], ramp(k, .5, .6), 4, INK, 191, true); wash(() => { ctx.moveTo(90, 520); ctx.lineTo(200, 490); ctx.lineTo(200, 420); ctx.lineTo(90, 450); ctx.closePath(); }, ACW);
  for (let i = 0; i < 3; i++) sline(110, 458 + i * 18, 185, 442 + i * 18, ramp(k, .9 + i * .15, .3), 2.5, INK, 195 + i);
  arrowS(330, 470, 395, 400, ramp(k, 1.2, .5), AC, 4, 200); brain(430, 340, .78, ramp(k, 1.4, .8), INK, 201); [0, 1, 2].forEach(i => star(400 + i * 28, 250 - (i % 2) * 18, 9, ramp(k, 2.2 + i * .25, .3), AC, 2.5, 210 + i));
  HT('long-term memories', 270, 620, 50, AC, { a: ramp(k, 2.0, .5) }); HT('get formed', 270, 672, 42, INK, { a: ramp(k, 2.4, .4) }); });
// 9 focus (fog vs clear)
scn(s(9) - .05, s(10) - .05, t => { const k = t - s(9); brain(150, 400, .9, ramp(k, .1, .6), INK, 220); brain(390, 400, .9, ramp(k, .5, .6), INK, 221);
  // fog scribble on left
  for (let i = 0; i < 6; i++) spath(circPts(150 + (i % 3 - 1) * 28, 370 + Math.floor(i / 3) * 40, 38, 18, 14, 0, 6.5), ramp(k, .9 + i * .1, .4), 2.5, '#8d8d99', 230 + i); HT('foggy', 150, 540, 46, INK, { a: ramp(k, 1.4, .4) }); HT('sharp', 390, 540, 46, AC, { a: ramp(k, 1.9, .4) }); [0, 1, 2, 3].forEach(i => { const a = ramp(k, 2.0 + i * .1, .3); const an = -2.6 + i * .55; sline(390 + Math.cos(an) * 90, 400 + Math.sin(an) * 70, 390 + Math.cos(an) * 112, 400 + Math.sin(an) * 88, a, 3, AC, 240 + i); });
  HT('less sleep →', 150, 620, 38, INK, { a: ramp(k, 1.4, .4) }); HT('enough sleep →', 390, 620, 38, AC, { a: ramp(k, 1.9, .4) }); });
// 10 mice waste
scn(s(10) - .05, s(11) - .05, t => { const k = t - s(10); // mouse
  spath(circPts(120, 520, 62, 40, 22, 0, 6.4), ramp(k, .1, .7), 4, INK, 250); sellipse(188, 500, 26, 22, ramp(k, .3, .5), 4, INK, 251); sellipse(176, 468, 13, 13, ramp(k, .5, .3), 3, INK, 252); sellipse(206, 472, 13, 13, ramp(k, .5, .3), 3, INK, 253); spath([[58, 520], [20, 560], [4, 520], [30, 500]], ramp(k, .6, .5), 3, INK, 254); sellipse(194, 498, 3, 3, ramp(k, .7, .2), 3, INK, 255);
  HT('mice', 110, 600, 40, INK, { a: ramp(k, .5, .4) }); brain(370, 340, 1.1, ramp(k, .8, .8), INK, 260);
  // waste blobs washed out
  const flow = ease(ramp(k, 1.8, 2.0)); for (let i = 0; i < 7; i++) { const bx = lerp(320 + (i % 4) * 30, 520, flow), by = lerp(310 + Math.floor(i / 4) * 40 + (i % 2) * 8, 190, flow); ctx.save(); ctx.globalAlpha = 1 - flow * .3; sellipse(bx, by, 9, 7, ramp(k, 1.3 + i * .1, .3), 3, INK, 270 + i); hatch(() => { ctx.ellipse(bx, by, 9, 7, 0, 0, 7); }, bx - 10, by - 8, bx + 10, by + 8, 4, INK, .6, ramp(k, 1.4, .3), 1.5); ctx.restore(); }
  for (let i = 0; i < 4; i++) { const a = ramp(k, 1.6 + i * .2, .5); squig(280, 300 + i * 22, 150, a, AC, 3, 4, 9, 280 + i); } HT('waste clears', 370, 470, 50, AC, { a: ramp(k, 2.2, .4) }); HT('faster', 370, 520, 50, AC, { a: ramp(k, 2.6, .4) }); });
// 11 REM later hypnogram
scn(s(11) - .05, s(12) - .05, t => { const k = t - s(11); hypAxes(1); hyp(1, INK, 3.5); [[.34, .4], [.66, .73], [.88, .96]].forEach(([u0, u1], i) => { const a = ramp(k, .4 + i * .5, .6); hatch(() => { ctx.rect(hx(u0 - .02), HY0, hx(u1 + .03) - hx(u0 - .02), 80); }, hx(u0 - .02), HY0, hx(u1 + .03), HY0 + 80, 8, AC, .7, a, 2.5); }); HT('REM', hx(.37), HY0 - 14, 40, AC, { a: ramp(k, .5, .4) }); HT('REM', hx(.7), HY0 - 14, 40, AC, { a: ramp(k, .9, .4) }); HT('REM', hx(.92), HY0 - 14, 40, AC, { a: ramp(k, 1.3, .4) }); HT('more REM later in the night', 270, HY1 + 52, 38, INK, { a: ramp(k, 1.5, .5) }); });
// 12 eyes dart + active brain
scn(s(12) - .05, s(13) - .05, t => { const k = t - s(12); spath([[110, 380], [190, 330], [270, 320], [350, 330], [430, 380], [350, 430], [270, 440], [190, 430], [110, 380]], ramp(k, .1, .7), 4, INK, 290); const dx = Math.sin(t * 17) * 34 * Math.sign(Math.sin(t * 3.1)), dy = Math.sin(t * 9) * 8; sellipse(270 + dx, 380 + dy, 36, 36, ramp(k, .5, .4), 4, AC, 291); ctx.save(); ctx.beginPath(); ctx.arc(270 + dx, 380 + dy, 14, 0, 7); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
  [[-1], [1]].forEach(([d], i) => { arrowS(270 + d * 60, 300, 270 + d * 130, 300, ramp(k, .9, .3), AC, 3, 300 + i); }); HT('eyes dart', 270, 520, 54, INK, { a: ramp(k, .9, .4) });
  brain(270, 640, .8, ramp(k, 1.6, .6), INK, 310); for (let i = 0; i < 8; i++) { const a = -Math.PI * .95 + i * Math.PI * 1.9 / 7; sline(270 + Math.cos(a) * 92, 640 + Math.sin(a) * 74, 270 + Math.cos(a) * (112 + 8 * Math.sin(t * 7 + i)), 640 + Math.sin(a) * (92 + 8 * Math.sin(t * 7 + i)), ramp(k, 2.0 + i * .1, .3), 3, AC, 320 + i); } HT('as busy as awake', 270, 735, 40, AC, { a: ramp(k, 2.4, .4) }); });
// 13 dreaming bubble
scn(s(13) - .05, s(14) - .05, t => { const k = t - s(13); sellipse(160, 600, 18, 18, ramp(k, .1, .4), 3.5, INK, 330); [[190, 560, 9], [215, 530, 12], [248, 495, 15]].forEach(([x, y, r], i) => sellipse(x, y, r, r, ramp(k, .3 + i * .15, .3), 3, INK, 335 + i));
  const cl = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cl.push([310 + Math.cos(a) * 160 * (1 + .1 * Math.sin(i * 3)), 340 + Math.sin(a) * 120]); } spath(cl, ramp(k, .5, 1.0), 4, INK, 340, true); wash(() => { cl.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }, 'rgba(75,79,216,.10)');
  // dream doodles: house, stars, moon
  if (k > 1.2) { const a = ramp(k, 1.4, .6); spath([[250, 400], [250, 350], [290, 320], [330, 350], [330, 400]], a, 3.5, INK, 350, true); srect(280, 365, 22, 35, a, 3, AC, 351); star(380, 290, 18, ramp(k, 1.8, .4), AC, 3, 352); moon(370, 390, 22, ramp(k, 2.1, .5), INK); star(230, 290, 12, ramp(k, 2.3, .3), INK, 2.5, 353); }
  HT('dreaming', 270, 160, 70, AC, { a: ramp(k, .3, .4), rot: -.03 }); HT('usually during REM', 270, 650, 46, INK, { a: ramp(k, 1.2, .4) }); });
// 14 limp muscles
scn(s(14) - .05, s(15) - .05, t => { const k = t - s(14); // stick figure lying in bed with noodle limbs
  spath([[70, 600], [470, 600]], ramp(k, .1, .5), 4, INK, 360); sellipse(120, 540, 28, 28, ramp(k, .3, .4), 4, INK, 361); const sag = ramp(k, 1.2, 1.2);
  spath([[148, 548], [330, 560 + sag * 12], [440, 575 + sag * 22]], ramp(k, .5, .6), 4, INK, 362); const arm = [[190, 552], [215, 575 + 10 * sag], [225, 598]]; spath(arm, ramp(k, .8, .5), 4, INK, 363); spath([[300, 560], [330, 585 + 10 * sag], [340, 598]], ramp(k, .9, .5), 4, INK, 364);
  zzz(150, 520, t, 1); HT('muscles go limp', 270, 330, 62, AC, { a: ramp(k, .9, .4) }); HT('no acting out dreams!', 270, 400, 42, INK, { a: ramp(k, 1.9, .4) }); for (let i = 0; i < 3; i++) squig(200 + i * 60, 460 + i * 6, 40, ramp(k, 1.4 + i * .2, .3), AC, 3, 5, 3, 370 + i); });
// 15 newborn
scn(s(15) - .05, s(16) - .05, t => { const k = t - s(15); sellipse(140, 300, 50, 50, ramp(k, .1, .6), 4, INK, 380); sellipse(124, 292, 4, 4, ramp(k, .5, .2), 3, INK, 381); sellipse(158, 292, 4, 4, ramp(k, .5, .2), 3, INK, 382); spath(circPts(141, 312, 12, 8, 8, .2, 2.9), ramp(k, .6, .3), 3, INK, 383); spath([[135, 250], [140, 235], [148, 248]], ramp(k, .7, .3), 3, INK, 384); HT('newborn', 140, 380, 38, INK, { a: ramp(k, .6, .3) });
  sellipse(380, 300, 40, 46, ramp(k, .3, .6), 4, INK, 385); HT('adult', 380, 380, 38, INK, { a: ramp(k, .8, .3) });
  const bar = (x, h0, h1, col, a) => { const hh = lerp(0, h0, a); hatch(() => ctx.rect(x, 640 - hh, 90, hh), x, 640 - hh, x + 90, 640, 9, col, .6, 1, 2.5); srect(x, 640 - hh, 90, hh, 1, 3.5, col, x); }; const b1 = ease(ramp(k, 1.0, .9)), b2 = ease(ramp(k, 1.6, .9)); bar(95, 220, 0, AC, b1); bar(335, 110, 0, INK, b2); sline(60, 642, 480, 642, ramp(k, .9, .4), 3.5, INK, 390);
  HT('more REM', 140, 685, 44, AC, { a: ramp(k, 1.9, .4) }); HT('less REM', 380, 685, 44, INK, { a: ramp(k, 2.3, .4) }); });
// 16 why
scn(s(16) - .05, s(17) - .05, t => { const k = t - s(16); brain(270, 400, 1.3, ramp(k, .1, .8), INK, 400); for (let i = 0; i < 5; i++) { const a = ramp(k, .9 + i * .3, .3); const ang = t * .6 + i * 1.26; HT('?', 270 + Math.cos(ang) * 190, 400 + Math.sin(ang) * 150, 56 + i * 6, AC, { a, rot: Math.sin(ang) * .3 }); } HT('why do we dream?', 270, 600, 54, INK, { a: ramp(k, 1.0, .5) }); HT('still debated', 270, 655, 42, AC, { a: ramp(k, 1.8, .4) }); });
// 17 night shift
scn(s(17) - .05, s(18) - .05, t => { const k = t - s(17); moon(120, 200, 40, ramp(k, .1, .6)); star(420, 180, 14, ramp(k, .4, .3)); star(470, 260, 10, ramp(k, .6, .3)); star(60, 300, 10, ramp(k, .7, .3));
  brain(270, 420, 1.3, ramp(k, .3, .8), INK, 410); // hard hat
  const hh = ramp(k, 1.3, .5); spath(circPts(270, 340, 70, 50, 16, Math.PI, 2 * Math.PI), hh, 5, AC, 420); sline(190, 342, 350, 342, hh, 5, AC, 421); hatch(() => { ctx.ellipse(270, 340, 70, 50, 0, Math.PI, 2 * Math.PI); }, 195, 290, 345, 342, 8, AC, .6, hh, 2.5); sellipse(270, 306, 8, 6, hh, 3, AC, 422);
  HT('the brain\'s', 270, 590, 56, INK, { a: ramp(k, 1.5, .4) }); HT('night shift', 270, 655, 74, AC, { a: ramp(k, 1.9, .4), rot: -.02 }); });
// 18 end
scn(s(18) - .05, 1e9, t => { const k = t - s(18) + .05; moon(270, 260, 50, ramp(k, .0, .6)); star(190, 210, 14, ramp(k, .3, .3), AC); star(360, 230, 12, ramp(k, .4, .3), AC); const a = ramp(k, .1, .4); HT('Follow for more of', 270, 440, 52, INK, { a }); HT('how it really works.', 270, 510, 66, AC, { a: ramp(k, .3, .4), rot: -.02 }); squig(110, 560, 320, ramp(k, .6, .6), AC, 4, 6, 14, 430); });
const capUp = captions(document.getElementById('cap'));
const paperN = document.createElement('canvas'); paperN.width = paperN.height = 128; { const x = paperN.getContext('2d'); const im = x.createImageData(128, 128); const R = rnd(3); for (let i = 0; i < 128 * 128; i++) { const v = 215 + R() * 40; im.data[i * 4] = v; im.data[i * 4 + 1] = v - 6; im.data[i * 4 + 2] = v - 22; im.data[i * 4 + 3] = 40; } x.putImageData(im, 0, 0); }
await Promise.all([document.fonts.load('700 40px Caveat'), document.fonts.load('400 40px Caveat')]);
window.seek = t => { BOIL = Math.floor(t * 8) % 3; ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H); ctx.fillStyle = ctx.createPattern(paperN, 'repeat'); ctx.fillRect(0, 0, W, H);
  sc.forEach(o => { if (t >= o.a && t < o.b) { ctx.save(); o.fn(t); ctx.restore(); } }); capUp(t); };
window.ready = true;
