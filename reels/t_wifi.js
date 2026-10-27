// WiFi through walls. Style: "Generative & neon" (awesome-opus-5-5-video-styles): procedural dot-field, dark ground, 4-colour neon, motion on the beat (88 bpm).
import { W, H, clamp, lerp, ramp, eo, E, bk, rnd, hash, S, En, cur, caption, boot } from './r2lib.js';
const C = { bg: '#05060f', cy: '#19f0ff', mg: '#ff2fd0', lm: '#b6ff3d', wh: '#eaf6ff' };
const BEAT = 60 / 88, RX = 78, RY = 520, WX = 285, PX = 468, PY = 520;
const fnt = (w, s, f = 'Inter') => `${w} ${s}px ${f}`;
// transmission through the wall for each phase; lambda in px (visual)
function field(t) {
  const i = cur(t);
  let T = .72, lam = 44, wall = 'brick', walls = 1;
  if (i >= 6 && i < 10) T = .72;
  if (i >= 10 && i < 13) { walls = 1 + (t > S(10) + 1 ? 1 : 0) + (t > S(10) + 2.2 ? 1 : 0); T = Math.pow(.72, walls) }
  if (i >= 13) { lam = t < S(13) + 3.3 ? 44 : 24; T = t < S(13) + 3.3 ? .72 : .4; walls = 1 }
  if (i === 14) { wall = 'metal'; T = .03; lam = 44 }
  if (i >= 15) { T = .92; lam = 44; wall = 'ghost' }
  return { T, lam, wall, walls };
}
let Tsm = .72, lastT = -1;
function draw(g, t) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const f = field(t); const i = cur(t);
  // smooth T over time (closed form: depends only on t)
  const Tn = f.T; const Tm = Tn; // phases switch on beat; short blend below
  const sw = [S(10), S(14), S(15), S(13)].reduce((a, s) => Math.abs(t - s) < .5 ? s : a, -9);
  const prevT = sw === S(14) ? .4 : sw === S(15) ? .03 : sw === S(10) ? .72 : sw === S(13) ? .72 : Tn;
  const Teff = sw > -9 ? lerp(prevT, Tn, E((t - sw) / .5 + .5 > 1 ? 1 : (t - sw) / .5 < 0 ? 0 : (t - sw) / .5)) : Tn;
  // dot field
  const sp = 22, nx = Math.ceil(W / sp), ny = Math.ceil(H / sp);
  const start = -.8, grow = eo((t - start) / 1.2), speed = 1.2; // cycles/s
  const rows = f.walls;
  for (let yy = 0; yy < ny; yy++) for (let xx = 0; xx < nx; xx++) {
    const x = xx * sp + sp / 2, y = yy * sp + sp / 2;
    if (y < 290 || y > 765) continue;
    const d = Math.hypot(x - RX, y - RY);
    let A = Math.sin(2 * Math.PI * (d / f.lam - speed * t)) / Math.sqrt(1 + d / 60);
    // wall crossings
    let tr = 1; const wxs = f.walls === 1 ? [WX] : f.walls === 2 ? [WX, WX + 70] : [WX, WX + 70, WX + 140];
    wxs.forEach((wx, k) => { if (x > wx + 10) tr *= (k === 0 ? Teff / Math.pow(.72, Math.max(0, f.walls - 1)) : .72) });
    if (x > WX + 10) A *= (f.walls === 1 ? Teff : tr);
    if (i === 14 && x < WX - 10) { const d2 = Math.hypot(x - (2 * WX - RX), y - RY); A += .8 * Math.sin(2 * Math.PI * (d2 / f.lam + speed * t)) / Math.sqrt(1 + d2 / 60) * ramp(t, S(14), S(14) + .8); }
    if (Math.abs(x - WX) < 12) continue;
    A *= grow * clamp((d - 6) / 20);
    const r = Math.min(sp * .46, 1.2 + Math.abs(A) * 7);
    g.fillStyle = A > 0 ? C.cy : C.mg; g.globalAlpha = clamp(.15 + Math.abs(A) * 1.1);
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
  // wall(s)
  const wallPhase = ramp(t, -.6, .0);
  const wxs = f.walls === 1 ? [WX] : f.walls === 2 ? [WX, WX + 70] : [WX, WX + 70, WX + 140];
  wxs.forEach((wx, k) => {
    const a = k === 0 ? wallPhase : eo((t - (S(10) + (k === 1 ? 1 : 2.2))) / .4);
    if (a <= 0) return; g.save(); g.globalAlpha = a * (f.wall === 'ghost' ? .0 : 1);
    const hh = 460 * eo(a);
    const col = f.wall === 'metal' ? '#c9d6e8' : '#ffb347';
    g.shadowColor = col; g.shadowBlur = 18; g.fillStyle = f.wall === 'metal' ? 'rgba(201,214,232,.9)' : 'rgba(255,179,71,.22)'; g.strokeStyle = col; g.lineWidth = 3;
    g.fillRect(wx - 9, RY - hh / 2, 18, hh); g.strokeRect(wx - 9, RY - hh / 2, 18, hh); g.shadowBlur = 0;
    if (f.wall === 'brick') { g.strokeStyle = 'rgba(255,179,71,.55)'; g.lineWidth = 1.5; for (let b = 0; b < 17; b++) { const yy = RY - hh / 2 + b * 30.5; g.beginPath(); g.moveTo(wx - 9, yy); g.lineTo(wx + 9, yy); g.stroke() } }
    g.restore();
  });
  if (f.wall === 'ghost') { g.save(); g.globalAlpha = .5 * (1 - ramp(t, S(15), S(15) + 1)) + .18; g.setLineDash([6, 8]); g.strokeStyle = '#ffb347'; g.lineWidth = 2; g.strokeRect(WX - 9, RY - 230, 18, 460); g.restore(); }
  // router
  const pop = bk((t + .5) / .5);
  g.save(); g.translate(RX, RY); g.scale(pop, pop);
  g.shadowColor = C.lm; g.shadowBlur = 22; g.fillStyle = '#0b1a14'; g.strokeStyle = C.lm; g.lineWidth = 3;
  g.beginPath(); g.roundRect(-34, -4, 68, 30, 8); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-18, -4); g.lineTo(-24, -40); g.moveTo(18, -4); g.lineTo(24, -40); g.stroke(); g.shadowBlur = 0;
  g.fillStyle = C.lm; for (let k = 0; k < 3; k++) { g.globalAlpha = .5 + .5 * Math.sin(t * 6 + k * 2); g.beginPath(); g.arc(-14 + k * 14, 11, 3, 0, 7); g.fill() } g.restore();
  // phone with bars
  const bars = i < 10 ? 3 : i === 10 ? (t > S(10) + 2.2 ? 1 : t > S(10) + 1 ? 2 : 3) : i < 14 ? 1 : i === 14 ? 0 : 4;
  g.save(); g.translate(PX, PY); const pp = bk((t + .5) / .5); g.scale(pp, pp);
  g.shadowColor = C.cy; g.shadowBlur = 16; g.strokeStyle = C.cy; g.lineWidth = 3; g.fillStyle = '#06141c'; g.beginPath(); g.roundRect(-20, -34, 40, 68, 8); g.fill(); g.stroke(); g.shadowBlur = 0;
  for (let k = 0; k < 4; k++) { g.fillStyle = k < bars ? C.lm : 'rgba(255,255,255,.15)'; g.fillRect(-14 + k * 8, 14 - k * 6, 5, 6 + k * 6) } g.restore();
  // ---- per-phase graphics (lower zone y 790-900, plus labels) ----
  const lab = (s, x, y, col = C.wh, size = 15, z = Math.max(size, 16)) => { g.font = fnt(700, z); g.fillStyle = col; g.textAlign = 'center'; g.fillText(s, x, y) };
  g.textBaseline = 'middle';
  if (i === 0 || i === 1) { const a = ramp(t, .6, 1.2); g.globalAlpha = a; lab('ROUTER', RX, RY + 56, C.lm, 13); lab('PHONE', PX, RY + 56, C.cy, 13); lab('WALL', WX, RY - 250, '#ffb347', 13); g.globalAlpha = 1; }
  if (i === 2) { // spectrum strip
    const a = eo((t - S(2)) / .5), y = 830; g.globalAlpha = a;
    const x0 = 40, x1 = 500, gr = g.createLinearGradient(x0, 0, x1, 0); ['#ff2fd0', '#ffb347', '#b6ff3d', '#19f0ff', '#7a5cff'].forEach((c, k, ar) => gr.addColorStop(k / (ar.length - 1), c));
    g.fillStyle = gr; g.globalAlpha = a * .8; g.fillRect(x0, y, x1 - x0, 14); g.globalAlpha = a;
    lab('RADIO / WIFI', 90, y - 18, C.cy, 12); lab('VISIBLE LIGHT', 410, y - 18, C.lm, 12); lab('same family: waves of light', W / 2, y + 40, C.wh, 14);
    g.fillStyle = C.cy; g.beginPath(); g.moveTo(90, y + 22); g.lineTo(84, y + 32); g.lineTo(96, y + 32); g.fill(); g.globalAlpha = 1; }
  if (i === 3) { // bits -> wiggle
    const a = eo((t - S(3)) / .5), y = 830; g.globalAlpha = a; const r = rnd(5); g.font = fnt(700, 17, 'monospace'); g.fillStyle = C.lm; g.textAlign = 'left';
    let bs = ''; for (let k = 0; k < 14; k++) bs += r() > .5 ? '1' : '0'; g.fillText(bs, 40, y - 10); g.fillStyle = C.wh; g.fillText('data', 40, y - 32);
    g.strokeStyle = C.cy; g.lineWidth = 2.5; g.shadowColor = C.cy; g.shadowBlur = 10; g.beginPath(); for (let x = 0; x <= 300; x += 3) { const yy = y + 18 + Math.sin(x / 8 - t * 9) * 14 * (Math.sin(x / 40) > 0 ? 1 : .5); x ? g.lineTo(200 + x, yy) : g.moveTo(200, yy) } g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1; }
  if (i === 4) { const a = eo((t - S(4)) / .5); g.globalAlpha = a; lab('300,000 km every second', W / 2, 830, C.cy, 20); lab('(about 7 times around the Earth)', W / 2, 862, C.wh, 13); g.globalAlpha = 1; }
  if (i === 5 || i === 13) { // wavelength ruler
    const a = eo((t - S(i)) / .5); g.globalAlpha = a; const y = 830, big = i === 5 || t < S(13) + 3.3, L = big ? 150 : 82;
    g.strokeStyle = C.cy; g.lineWidth = 3; g.shadowColor = C.cy; g.shadowBlur = 10; g.beginPath(); for (let x = 0; x <= 2 * L + 1; x += 2) { const yy = y + Math.sin(x / L * Math.PI * 2 - Math.PI / 2) * 26; x ? g.lineTo(W / 2 - L + x, yy) : g.moveTo(W / 2 - L + x, yy) } g.stroke(); g.shadowBlur = 0;
    g.strokeStyle = C.lm; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - L, y + 48); g.lineTo(W / 2, y + 48); g.moveTo(W / 2 - L, y + 42); g.lineTo(W / 2 - L, y + 54); g.moveTo(W / 2, y + 42); g.lineTo(W / 2, y + 54); g.stroke();
    lab(big ? '≈ 12 cm  (2.4 GHz)' : '≈ 6 cm  (5 GHz)', W / 2 - L / 2, y + 72, C.lm, 17); g.globalAlpha = 1; }
  if (i === 6 || i === 7) { const a = eo((t - S(6)) / .5); g.globalAlpha = a; lab('passes through ✓', WX + 105, RY - 70, C.cy, 16); if (i === 7) { const b = eo((t - S(7) - .6) / .5); g.globalAlpha = b; lab('a little energy absorbed', WX, 800, '#ffb347', 17); lab('(water absorbs the most)', WX, 826, C.wh, 13); for (let k = 0; k < 5; k++) { const yy = 700 - ((t * 40 + k * 31) % 120); g.fillStyle = '#4ac8ff'; g.globalAlpha = b * .8; g.beginPath(); g.arc(WX + Math.sin(k * 3 + t) * 4, yy + 90, 4, 0, 7); g.fill() } } g.globalAlpha = 1; }
  if (i === 8 || i === 9) { // oven vs wifi
    const a = eo((t - S(8)) / .5), y = i === 9 ? 715 : 800; g.globalAlpha = a;
    g.strokeStyle = C.mg; g.lineWidth = 3; g.fillStyle = '#1a0614'; g.beginPath(); g.roundRect(70, y - 30, 80, 62, 10); g.fill(); g.stroke(); g.fillStyle = C.mg; g.fillRect(84, y - 18, 40, 36); lab('OVEN', 110, y + 52, C.mg, 14); lab('2.45 GHz', 110, y + 72, C.wh, 13);
    g.strokeStyle = C.lm; g.fillStyle = '#0b1a14'; g.beginPath(); g.roundRect(390, y - 6, 80, 30, 8); g.fill(); g.stroke(); lab('WIFI', 430, y + 52, C.lm, 14); lab('2.4 GHz', 430, y + 72, C.wh, 13);
    lab('≈', W / 2, y, C.wh, 40); g.globalAlpha = 1;
    if (i === 9) { const b = eo((t - S(9)) / .6); g.globalAlpha = b; const by = 866; const ow = 380 * eo((t - S(9) - 1) / 1.2), ww = Math.max(2, 380 / 6000 * 12 * eo((t - S(9) - 3.2) / .8));
      g.fillStyle = C.mg; g.fillRect(80, by - 14, ow, 12); g.fillStyle = C.lm; g.fillRect(80, by + 10, ww, 12); g.textAlign='left'; g.font=fnt(700,16); g.fillStyle=C.mg; g.fillText('oven: 600–1200 W', 80, by - 30); g.fillStyle=C.lm; g.fillText('WiFi: 0.1 W max (EU)', 80, by + 36); g.globalAlpha = 1; } }
  if (i === 10 || i === 11 || i === 12) { const a = eo((t - S(10)) / .5); g.globalAlpha = a; lab('each wall: a little weaker', W / 2, 810, '#ffb347', 17); if (i >= 11) lab('far room = weak signal', W / 2, 840, C.wh, 14); g.globalAlpha = 1; }
  if (i === 13) { const b = eo((t - S(13) - 3.6) / .6); g.globalAlpha = b; lab('5 GHz: faster, shorter reach', W / 2, 770, C.mg, 16); g.globalAlpha = 1 }
  if (i === 14) { const a = eo((t - S(14)) / .4); g.globalAlpha = a; lab('METAL REFLECTS THE WAVE', WX, RY - 250, '#c9d6e8', 15); lab('reflected', 150, 320, C.mg, 13); g.globalAlpha = 1; }
  if (i >= 15) { const a = eo((t - S(15)) / .6); g.globalAlpha = a; lab('SIGNAL ✓', PX, PY + 56, C.lm, 14); g.globalAlpha = 1; }
  if (i >= 17) { const a = eo((t - S(17)) / .5); g.globalAlpha = a; g.fillStyle = C.lm; g.shadowColor = C.lm; g.shadowBlur = 24; g.font = fnt(800, 64); g.textAlign = 'center'; g.fillText('FOLLOW', W / 2, 860); g.shadowBlur = 0; g.globalAlpha = 1 }
  // top banner & caption
  if (i <= 1) { const a = eo(t / .4); g.globalAlpha = a; g.fillStyle = C.cy; g.font = fnt(800, 14); g.textAlign = 'center'; g.fillText('HOW IT REALLY WORKS', W / 2, 70); g.globalAlpha = 1; }
  caption(g, t, { size: 31, y: 130, w: 470, color: 'rgba(234,246,255,.8)', hl: C.cy, shadow: 'rgba(0,0,0,.9)', shadowBlur: 12 });
  // end flourish: pulse on the beat
  const bt = (t / BEAT) % 1; if (i >= 16) { g.globalAlpha = .5 * (1 - bt); g.strokeStyle = C.cy; g.lineWidth = 2; g.beginPath(); g.arc(RX, RY, 20 + bt * 80, 0, 7); g.stroke(); g.globalAlpha = 1 }
}
boot({ draw, fonts: ['700 16px Inter', '800 16px Inter'] });
