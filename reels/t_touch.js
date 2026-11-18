// Touchscreen. Style: "Explainers & data viz" (awesome-opus-5-5-video-styles): one idea per scene built step by step, axes/wires draw on, values count up, labels fade in next to what they name, off-white ground, one highlight colour.
import { W, H, clamp, lerp, ramp, eo, E, bk, rnd, hash, S, En, cur, caption, boot } from './r2lib.js';
const C = { bg: '#f6f3ec', ink: '#1d2433', row: '#6f8bb8', col: '#b08968', hi: '#ff5a3c', soft: '#dcd6c8', ok: '#1f9d6b' };
const fnt = (w, s, f = 'Inter') => `${w} ${s}px ${f}`;
const N = 8, X0 = 78, Y0 = 336, SP = 55, GL = 44, GR = 496, GT = 300, GB = 752;
const nx = i => X0 + i * SP, ny = j => Y0 + j * SP;
const D = (t, a, b) => eo((t - a) / (b - a));
// fingers: list of {x,y,s(strength)} by phase
function fingers(t, i) {
  const f = [];
  if (i >= 7 && i <= 9) { const a = D(t, S(7) + 1.8, S(7) + 3); if (i === 7 && t < S(7) + 1.8) return f; f.push({ x: 300, y: 520, s: i === 7 ? a * .0 : 1, z: i === 7 ? a : 1 }); if (i >= 8) f[0].s = 1; }
  if (i === 10) { f.push({ x: 190, y: 450, s: 1 }, { x: 370, y: 430, s: 1 }, { x: 300, y: 640, s: 1 }); }
  if (i === 11) { const h = .5 + .5 * Math.sin((t - S(11)) * 2.5); f.push({ x: 300, y: 520, s: .22 + .1 * h, hover: 1 }); }
  if (i === 13) { const a = D(t, S(13) + .8, S(13) + 1.6); f.push({ x: 405, y: 498, s: a, stylus: 1 }); }
  return f;
}
const val = (x, y, fs, t) => { let v = 50 + (hash(x * 7 + y * 3) - .5) * 2; fs.forEach(f => { const d2 = (x - f.x) ** 2 + (y - f.y) ** 2; v -= f.s * 24 * Math.exp(-d2 / (2 * 46 * 46)) }); return Math.round(v) };
function finger(g, x, y, a, glove, hover) {
  g.save(); g.globalAlpha = a * (hover ? .75 : .85); g.translate(x, y - (hover ? 26 : 0));
  g.fillStyle = glove ? '#4a6fa5' : C.hi; g.strokeStyle = C.ink; g.lineWidth = 3;
  g.beginPath(); const FL = Math.max(60, 770 - y); g.moveTo(-26, FL); g.lineTo(-26, 20); g.quadraticCurveTo(-26, -26, 0, -26); g.quadraticCurveTo(26, -26, 26, 20); g.lineTo(26, FL); g.fill(); g.stroke();
  if (!glove) { g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.roundRect(-14, -14, 28, 20, 8); g.fill() }
  else { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-20, 40 + k * 22); g.lineTo(20, 40 + k * 22); g.stroke() } }
  g.restore();
}
function draw(g, t) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.textBaseline = 'middle';
  const i = cur(t), lab = (s, x, y, col = C.ink, z = 16, w = 700, al = 'center') => { g.font = fnt(w, z); g.fillStyle = col; g.textAlign = al; g.fillText(s, x, y) };
  // phone -> grid morph
  const m = i <= 0 ? 0 : D(t, S(1), S(1) + 1.1), L = lerp(150, GL, m), R = lerp(390, GR, m), T = lerp(300, GT, m), B = lerp(700, GB, m);
  g.fillStyle = '#fff'; g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.roundRect(L, T, R - L, B - T, lerp(34, 14, m)); g.fill(); g.stroke();
  if (i === 0) { // finger tap + ripples
    const a = D(t, -.6, .4), tapY = 520 + (1 - a) * 160; finger(g, 270, tapY, 1, false, false);
    for (let k = 0; k < 3; k++) { const r = ((t * .8 + k / 3) % 1); g.strokeStyle = C.hi; g.globalAlpha = (1 - r) * .8 * ramp(t, .9, 1.2); g.lineWidth = 3; g.beginPath(); g.arc(270, 520, 20 + r * 90, 0, 7); g.stroke() } g.globalAlpha = 1;
    g.strokeStyle = C.soft; g.lineWidth = 3; g.beginPath(); g.arc(270, 340, 6, 0, 7); g.stroke();
    // zigzag bolts
    const a2 = ramp(t, 1.6, 2.4); g.globalAlpha = a2; lab('⚡ electric field', 270, 430, C.hi, 20, 800); g.globalAlpha = 1; }
  // wires draw-on
  const gW = i >= 1 ? D(t, S(1) + .9, S(1) + 2.6) : 0;
  if (i >= 1) {
    g.lineWidth = 4; g.lineCap = 'round';
    for (let j = 0; j < N; j++) { const p = clamp(gW * 2 - j * .06); const wasRow = i >= 3 ? 1 : 0; g.strokeStyle = i >= 3 ? C.row : C.soft; if (i === 5) g.strokeStyle = C.row; g.beginPath(); g.moveTo(GL + 14, ny(j)); g.lineTo(lerp(GL + 14, GR - 14, p), ny(j)); g.stroke() }
    for (let k = 0; k < N; k++) { const p = clamp(gW * 2 - 1 - k * .06); g.strokeStyle = i >= 3 ? C.col : C.soft; g.setLineDash(i >= 3 ? [] : []); g.beginPath(); g.moveTo(nx(k), GT + 14); g.lineTo(nx(k), lerp(GT + 14, GB - 14, p)); g.stroke() }
  }
  // layer labels
  if (i === 2) { const a = D(t, S(2) + .3, S(2) + 1); g.globalAlpha = a; lab('indium tin oxide (ITO)', W / 2, 800, C.ink, 22, 800); lab('a transparent, conductive coating', W / 2, 830, '#5b6578', 16, 600); g.globalAlpha = 1; }
  if (i === 3) { const a = D(t, S(3) + .6, S(3) + 1.2); g.globalAlpha = a; g.fillStyle = C.row; g.fillRect(70, 790, 24, 5); lab('rows (layer 1)', 104, 792, C.row, 17, 700, 'left'); g.fillStyle = C.col; g.fillRect(70, 822, 5, 24); lab('columns (layer 2)', 104, 834, C.col, 17, 700, 'left'); g.globalAlpha = 1; }
  // nodes
  const fs = fingers(t, i); const showNodes = i >= 4;
  if (showNodes) {
    for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
      const a = D(t, S(4) + (j + k) * .05, S(4) + .4 + (j + k) * .05); if (a <= 0) continue;
      const v = val(nx(k), ny(j), fs, t), drop = clamp((50 - v) / 24);
      g.fillStyle = drop > .12 ? `rgb(${Math.round(lerp(255, 255, drop))},${Math.round(lerp(210, 90, drop))},${Math.round(lerp(190, 60, drop))})` : '#fff'; g.strokeStyle = drop > .12 ? C.hi : C.ink; g.lineWidth = 2.5;
      g.beginPath(); g.arc(nx(k), ny(j), (7 + drop * 6) * a, 0, 7); g.fill(); g.stroke();
      if (i >= 6) { g.globalAlpha = ramp(t, S(6) + (j + k) * .03, S(6) + .5 + (j + k) * .03); lab(String(v), nx(k), ny(j) + 19, drop > .12 ? C.hi : '#6a7384', 12, drop > .12 ? 800 : 600); g.globalAlpha = 1 }
    }
  }
  // capacitor callout
  if (i === 4) { const a = D(t, S(4) + 1.4, S(4) + 2.2), cx = nx(5), cy = ny(2); g.globalAlpha = a; g.strokeStyle = C.hi; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx, cy + 20); g.lineTo(cx, 780); g.stroke();
    g.fillStyle = C.ink; g.fillRect(W / 2 - 40, 790, 80, 6); g.fillRect(W / 2 - 40, 812, 80, 6); g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, 770); g.lineTo(W / 2, 790); g.moveTo(W / 2, 818); g.lineTo(W / 2, 838); g.stroke(); lab('capacitor', W / 2 + 56, 792, C.ink, 17, 800, 'left'); lab('stores a little charge', W / 2 + 56, 816, '#5b6578', 15, 600, 'left'); g.globalAlpha = 1; }
  // pulses (scan)
  if (i === 5) { const per = .55, r = Math.floor((t - S(5)) / per) % N, p = ((t - S(5)) % per) / per; if (t > S(5) + .1) { g.fillStyle = C.hi; g.beginPath(); g.arc(lerp(GL + 14, GR - 14, p), ny(r), 9, 0, 7); g.fill(); g.strokeStyle = C.hi; g.globalAlpha = .35; g.lineWidth = 8; g.beginPath(); g.moveTo(GL + 14, ny(r)); g.lineTo(lerp(GL + 14, GR - 14, p), ny(r)); g.stroke(); g.globalAlpha = 1;
      for (let k = 0; k < N; k++) if (nx(k) < lerp(GL + 14, GR - 14, p)) { g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.arc(nx(k), ny(r), 14, 0, 7); g.stroke(); g.fillStyle = C.ink; g.beginPath(); g.arc(nx(k), GB + 12, 5, 0, 7); g.fill() } }
    lab('send pulse →', 120, 790, C.hi, 17, 800); lab('listen ↓', 380, 790, C.ink, 17, 800); }
  if (i === 6) { const a = D(t, S(6) + .4, S(6) + 1); g.globalAlpha = a; lab('normal reading ≈ 50 (made-up units)', W / 2, 800, '#5b6578', 17, 700); g.globalAlpha = 1 }
  // finger drawings
  fs.forEach(f => { if (f.stylus) return; const z = f.z ?? 1; const yy = f.hover ? f.y : f.y + (i === 7 ? (1 - z) * 220 : 0); finger(g, f.x, yy, i === 7 ? z : 1, false, f.hover) });
  // field arcs while finger at 7
  if (i === 7) { const a = D(t, S(7) + .5, S(7) + 1.4); for (let k = 0; k < 3; k++) { g.strokeStyle = C.hi; g.globalAlpha = a * (.7 - k * .2); g.lineWidth = 2.5; g.setLineDash([5, 7]); g.beginPath(); g.arc(300, 520, 40 + k * 28 + Math.sin(t * 3 + k) * 3, 0, 7); g.stroke() } g.setLineDash([]); g.globalAlpha = 1 }
  if (i === 7) { const a = D(t, S(7) + 2.4, S(7) + 3.2); g.globalAlpha = a; lab('body = conductor', W / 2, 800, C.hi, 20, 800); g.globalAlpha = 1 }
  if (i === 8) { const a = D(t, S(8) + .3, S(8) + .8); g.globalAlpha = a; lab('50 → 30: reading drops here', W / 2, 800, C.hi, 19, 800); g.globalAlpha = 1 }
  if (i === 9) { const a = D(t, S(9) + .6, S(9) + 1.4); g.globalAlpha = a; g.strokeStyle = C.ink; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(300, GT + 4); g.lineTo(300, GB - 4); g.moveTo(GL + 4, 520); g.lineTo(GR - 4, 520); g.stroke(); g.setLineDash([]); g.strokeStyle = C.hi; g.lineWidth = 4; g.beginPath(); g.arc(300, 520, 40, 0, 7); g.stroke();
    lab('center of the dip = (x, y) of your touch', W / 2, 800, C.ink, 17, 800); g.globalAlpha = 1 }
  if (i === 10) { const a = D(t, S(10) + .4, S(10) + 1); g.globalAlpha = a; lab('3 separate dips = 3 fingers', W / 2, 800, C.hi, 20, 800); g.globalAlpha = 1 }
  if (i === 11) { const a = D(t, S(11) + .3, S(11) + .9); g.globalAlpha = a; lab('hovering: a weaker dip', W / 2, 800, C.hi, 20, 800); g.globalAlpha = 1 }
  if (i === 12) { const a = D(t, S(12) + .2, S(12) + 1); finger(g, 300, 520 + (1 - a) * 200, a, true, false);
    const b = D(t, S(12) + 1.4, S(12) + 2.2); g.globalAlpha = b; lab('glove (insulator): no dip, no touch', W / 2, 800, C.ink, 18, 800); g.strokeStyle = C.hi; g.lineWidth = 7; g.beginPath(); g.moveTo(262, 470); g.lineTo(338, 546); g.moveTo(338, 470); g.lineTo(262, 546); g.stroke(); g.globalAlpha = 1 }
  if (i === 13) { // stylus: plastic (left) vs conductive (right)
    const a = D(t, S(13) + .2, S(13) + 1);
    const sty = (x, ok) => { g.save(); g.translate(x, 520 + (1 - a) * 160); g.rotate(.35); g.globalAlpha = a; g.fillStyle = ok ? '#c8d2e6' : '#e7e2d6'; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.roundRect(-9, 0, 18, 220, 6); g.fill(); g.stroke(); g.fillStyle = ok ? C.hi : '#8e8a80'; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.lineTo(0, -24); g.fill(); g.stroke(); g.restore() };
    sty(160, false); sty(400, true);
    g.globalAlpha = D(t, S(13) + 1.2, S(13) + 1.8); lab('plastic tip: nothing', 150, 800, '#5b6578', 16, 800); lab('conductive tip: works', 390, 800, C.hi, 16, 800); g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,90,60,.0)'; }
  if (i === 14) { const a = D(t, S(14) + .5, S(14) + 1.2); finger(g, 300, 520, a, false, false); g.globalAlpha = a; for (let k = 0; k < 3; k++) { g.strokeStyle = C.hi; g.lineWidth = 2.5; g.setLineDash([5, 7]); g.globalAlpha = a * (.7 - k * .2); g.beginPath(); g.arc(300, 520, 40 + k * 28, 0, 7); g.stroke() } g.setLineDash([]); g.globalAlpha = 1 }
  if (i === 15) { const a = D(t, S(15), S(15) + .6); finger(g, 300, 540, a, true, false); g.globalAlpha = a; lab('?', 300, 470, C.hi, 54, 800); g.globalAlpha = 1 }
  if (i >= 16) { const a = D(t, S(16), S(16) + .5); g.globalAlpha = a; lab('FOLLOW', W / 2, 830, C.hi, 62, 800); g.globalAlpha = 1 }
  if (i <= 0) { const a = ramp(t, 0, .3); g.globalAlpha = a; lab('HOW IT REALLY WORKS', W / 2, 70, C.ink, 14, 800); g.globalAlpha = 1 }
  caption(g, t, { size: 31, y: 130, w: 470, weight: 600, color: C.ink, hl: C.hi, hlWeight: 800 });
}
boot({ draw, fonts: ['700 16px Inter', '800 16px Inter', '600 16px Inter'] });
