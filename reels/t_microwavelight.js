// t_microwavelight.js: why a microwave door has a metal mesh. Template #21 Storybook paint (demo t21), via styles/storybook.
// Opens on the sketchbook page on the desk (pencil, handwritten title) with the night-kitchen painting already alive, pushes
// into the painting, then white constellation-line wave diagrams on a night sky, coloured-pencil props with glow halos,
// and ends back on the sketchbook page (the end crossfades into frame 0 for the loop).
// Batch N layout: subtitle slip at y ~1240-1400 kept left of x 900; nothing typed in the top 250 px or the bottom 480 px.
import { createSB, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, mk, INK, PAL, finish, blob, circPts, paint, P2, skyBands, hill, stars, glow, rays,
  moonP, constLine, hand, arrowP, kid, PAGE, book, pencil, parse } from './styles/storybook/storybook.js';
await document.fonts.load('700 60px Caveat');
const g = createSB(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .5) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const CREAM = '#f6efe0', GOLD = '#ffd86a', WARM = '255,206,120', HOT = '255,150,70', COLD = '140,190,255';

// ---------------- baked backdrops ----------------
function bake(fn) { const c = mk(W, H), x = c.getContext('2d'); fn(x); return c; }
const KITCHEN = bake(x => {
  skyBands(x, ['#2a2550', '#322c5e', '#3a346a', '#433d76', '#4b4580'], 0, 1180, 10, 4);
  // window with the moon (top right)
  paint(x, P2(p => p.roundRect(620, 300, 330, 270, 14)), '#1c2147', { hatch: .12, lw: 3 });
  x.save(); x.beginPath(); x.roundRect(620, 300, 330, 270, 14); x.clip(); moonP(x, 860, 380, 46); x.restore();
  x.strokeStyle = INK; x.lineWidth = 6; x.beginPath(); x.moveTo(785, 300); x.lineTo(785, 570); x.moveTo(620, 435); x.lineTo(950, 435); x.stroke();
  paint(x, P2(p => p.roundRect(600, 566, 370, 22, 6)), '#b98a5c', { hatch: .2 });
  // shelf with jars (top left)
  paint(x, P2(p => p.roundRect(90, 470, 380, 20, 5)), '#b98a5c', { hatch: .2 });
  [['#e9a7a0', 120], ['#f1c48f', 220], ['#a9c79a', 320]].forEach(([c, jx]) => paint(x, P2(p => blob(p, [[jx, 470], [jx, 390], [jx + 10, 375], [jx + 70, 375], [jx + 80, 390], [jx + 80, 470]], 2, jx)), c, { hatch: .22 }));
  // tiles behind the counter
  x.save(); x.globalAlpha = .18; x.strokeStyle = '#e8e0ff'; x.lineWidth = 2; for (let yy = 700; yy < 1100; yy += 70) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); } for (let xx = 0; xx < W; xx += 90) { x.beginPath(); x.moveTo(xx, 640); x.lineTo(xx, 1100); x.stroke(); } x.restore();
  // counter + cabinets
  paint(x, P2(p => p.rect(-20, 1090, W + 40, 50)), '#c9a27a', { hatch: .22, lw: 3 });
  paint(x, P2(p => p.rect(-20, 1140, W + 40, 800)), '#6a5a8a', { hatch: .2, lw: 3 });
  [[40, 1180], [400, 1180], [760, 1180]].forEach(([cx, cy]) => { paint(x, P2(p => p.roundRect(cx, cy, 300, 560, 12)), '#7a6a9c', { hatch: .16, lw: 2.4 }); paint(x, P2(p => p.roundRect(cx + 130, cy + 40, 40, 14, 7)), '#d9c88a', { hatch: 0, lw: 2 }); });
});
const DIA = bake(x => { skyBands(x, ['#171b3e', '#1c2250', '#222a5e', '#29336c', '#2f3b78'], 0, H, 10, 7); hill(x, 1560, 40, '#26405a', { freq: 1.2, seed: 3, tufts: 12, tuftCol: '#1a3048' }); });

// ---------------- props ----------------
// the microwave (front view): cream body, dark door window with the dotted mesh, warm interior, turntable, popcorn, panel
function microwave(x, y, s, t, { light = 1, pop = 0, open = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  paint(g, P2(p => p.roundRect(0, 0, 600, 380, 26)), '#e6ded0', { hatch: .2, lw: 3.4 });
  paint(g, P2(p => p.roundRect(450, 30, 120, 320, 14)), '#cfc5b4', { hatch: .2, lw: 2.4 });
  g.fillStyle = '#2c3a2c'; g.beginPath(); g.roundRect(468, 50, 84, 40, 6); g.fill(); g.font = '700 30px Caveat'; g.fillStyle = '#9fffb0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('0:' + String(42 - Math.floor(t) % 40).padStart(2, '0'), 510, 71);
  for (let i = 0; i < 6; i++) paint(g, P2(p => p.arc(485 + (i % 2) * 50, 130 + Math.floor(i / 2) * 55, 14, 0, TAU)), '#e9a7a0', { hatch: 0, lw: 2 });
  // door window
  const win_ = P2(p => p.roundRect(40, 40, 380, 300, 18)); g.save(); g.clip(win_);
  g.fillStyle = '#3a2a22'; g.fillRect(40, 40, 380, 300); glow(g, 230, 160, 260 * light, WARM, .9 * light);
  g.fillStyle = `rgba(255,214,140,${.25 * light})`; g.fillRect(40, 40, 380, 300);
  // turntable + bowl
  g.save(); g.translate(230, 280); g.scale(1, .28); paint(g, P2(p => p.arc(0, 0, 150, 0, TAU)), 'rgba(220,235,240,.55)', { hatch: 0, lw: 2 }); g.restore();
  paint(g, P2(p => { p.moveTo(150, 240); p.bezierCurveTo(160, 300, 300, 300, 310, 240); p.closePath(); }), '#d9655a', { hatch: .2, lw: 2.4 });
  for (let i = 0; i < 9; i++) { const ph = (t * 1.3 + hash(i) * 3) % 1, jump = pop ? Math.sin(Math.min(1, ph * 2.2) * Math.PI) * 110 * hash(i + 3) : 0; const px = 170 + i * 15 + Math.sin(i * 2) * 6, py = 236 - jump - (i % 3) * 8;
    paint(g, P2(p => blob(p, circPts(px, py, 14, 12, 7), 4, i * 3 + Math.floor(t * 8))), '#fff6dc', { hatch: 0, lw: 1.8 }); }
  // the mesh: a grid of small dark dots over the window
  g.fillStyle = 'rgba(25,20,25,.55)'; for (let yy = 48; yy < 340; yy += 14) for (let xx = 48 + ((yy / 14) % 2) * 7; xx < 420; xx += 14) { g.beginPath(); g.arc(xx, yy, 3.4, 0, TAU); g.fill(); }
  g.restore(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(win_);
  paint(g, P2(p => p.roundRect(395, 120, 22, 140, 8)), '#bdb3a2', { hatch: 0, lw: 2 });   // handle
  g.restore();
}
// close-up of the mesh: a metal plate with round holes, warm light showing through each hole
function meshPlate(cx, cy, rad, k, t, { holes = 9, label = true } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); const sc = backOut(k); g.translate(cx, cy); g.scale(sc, sc);
  g.beginPath(); g.arc(0, 0, rad, 0, TAU); g.save(); g.clip(); g.fillStyle = '#4d4a55'; g.fillRect(-rad, -rad, rad * 2, rad * 2);
  const st = rad * 2 / holes; for (let i = -holes; i <= holes; i++) for (let j = -holes; j <= holes; j++) { const hx = i * st + (j % 2) * st / 2, hy = j * st * .87; if (Math.hypot(hx, hy) > rad + st) continue;
    const fl = .85 + .15 * Math.sin(t * 5 + i * 1.3 + j); g.fillStyle = `rgba(255,216,140,${fl})`; g.beginPath(); g.arc(hx, hy, st * .3, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(-rad, -rad, rad * 2, rad * .6); g.restore();
  g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#d9c9a8'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, rad + 8, 0, TAU); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(rad * .72, rad * .72); g.lineTo(rad * 1.15, rad * 1.15); g.stroke();
  g.restore();
}
// a wave as a white constellation line (drawn on by k), sliding with phase t
function wavePts(x0, x1, y, amp, lambda, ph = 0, n = null) { const N = n || Math.max(24, Math.round((x1 - x0) / Math.min(lambda / 8, 20))), P = []; for (let i = 0; i <= N; i++) { const x = lerp(x0, x1, i / N); P.push([x, y + Math.sin((x - x0) / lambda * TAU - ph) * amp]); } return P; }
function wave(pts, k, col = 'rgba(255,250,235,.95)', lw = 4) { if (k <= 0) return; g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; const n = Math.max(2, Math.ceil(pts.length * clamp(k)));
  g.beginPath(); pts.slice(0, n).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); const [hx, hy] = pts[n - 1]; g.fillStyle = col; g.beginPath(); g.arc(hx, hy, 7, 0, TAU); g.fill(); glow(g, hx, hy, 40, '255,250,230', .5); g.restore(); }
function bracket(x0, x1, y, k, txt, col = CREAM, size = 64) { if (k <= 0) return; g.save(); g.strokeStyle = col; g.lineWidth = 3.5; g.lineCap = 'round'; const xe = lerp(x0, x1, ss(k));
  g.beginPath(); g.moveTo(x0, y - 16); g.lineTo(x0, y); g.lineTo(xe, y); if (k > .95) g.lineTo(x1, y - 16); g.stroke(); g.restore(); hand(g, txt, (x0 + x1) / 2, y + 46, seg(k, .5, 1), { size, col }); }
function chocolate(x, y, w, t, melt = [], mk_ = 0) {   // a bar seen from above; melt = list of x positions of melted spots
  paint(g, P2(p => p.roundRect(x, y, w, 120, 10)), '#7a4a2e', { hatch: .2, lw: 3 }); g.strokeStyle = 'rgba(40,20,10,.6)'; g.lineWidth = 2; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(x + w * i / 8, y + 6); g.lineTo(x + w * i / 8, y + 114); g.stroke(); } g.beginPath(); g.moveTo(x + 6, y + 60); g.lineTo(x + w - 6, y + 60); g.stroke();
  melt.forEach((mx, i) => { const k = clamp(mk_ * 3 - i * .4); if (k <= 0) return; paint(g, P2(p => blob(p, circPts(mx, y + 60, 46 * k, 52 * k, 14), 6, i * 7)), '#4a2414', { hatch: 0, lw: 2 }); g.fillStyle = `rgba(255,240,220,${.5 * k})`; g.beginPath(); g.ellipse(mx - 12 * k, y + 44, 14 * k, 6 * k, -.4, 0, TAU); g.fill(); });
}

// ---------------- scenes ----------------
const S = [];
// the painted kitchen (painting coordinates): kid peeking at the microwave
function kitchen(t, { pop = 1, look = 1 } = {}) {
  g.drawImage(KITCHEN, 0, 0); stars(g, 18, t, { y1: 560, seed: 4, a: .6 });
  microwave(330, 700, 1.05, t, { pop });
  glow(g, 560, 880, 420, WARM, .35 + .08 * Math.sin(t * 6));
  kid(g, 190, 1090, 2.1, { body: '#8fb3d9', scarf: '#d9655a', arm2: -2.0 + .1 * Math.sin(t * 3), arm: .25, look: 3 * look, mouth: 'o' });
}
// A (p0-p1): sketchbook page with the painting already alive; push in; the mesh close-up pops up on "tiny holes"
S.push([0, T(2), t => {
  const z = lerp(1, 1.2, ss(seg(t, r(1, .2), E(1) + .2))), cx = lerp(540, 600, ss(seg(t, T(1), E(1)))), cy = lerp(900, 880, ss(seg(t, T(1), E(1))));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy);
  book(g); const { x, y, w, h } = PAGE;
  g.save(); g.beginPath(); g.rect(x + 40, y + 260, w - 80, h - 300); g.clip(); g.translate(x + 40, y + 260); g.scale((w - 80) / W, (w - 80) / W); g.translate(0, -300);
  kitchen(t); g.restore();
  g.strokeStyle = 'rgba(60,40,30,.35)'; g.lineWidth = 2; g.strokeRect(x + 40, y + 260, w - 80, h - 300);
  hand(g, 'WHY THE MESH', 520, y + 150, 1, { size: 100 }); hand(g, '?', 850, y + 150, seg(t, .1, .4), { size: 116, col: '#c4543f' });
  pencil(g, 930 + 14 * Math.sin(t * 3), 1500 + 8 * Math.cos(t * 4), -.8);
  g.restore();
  meshPlate(720, 560, 200, seg(t, r(1, 3.0), r(1, 3.6)), t); hand(g, 'tiny holes', 690, 820, seg(t, r(1, 3.4), r(1, 4.0)), { size: 76, col: GOLD });
}]);
// B (p2-p4): night-sky diagram: a long microwave and a tiny light wave; 12 cm; the mesh hole is a few millimetres
S.push([T(2) - .5, T(5) - .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 9, a: .7 });
  const ph = t * 2.2;
  hand(g, 'microwave', 300, 360, seg(t, r(2, .3), r(2, .9)), { size: 74, col: CREAM }); wave(wavePts(80, 1000, 560, 120, 600, ph), seg(t, r(2, .2), r(2, 1.6)));
  hand(g, 'light', 230, 820, seg(t, r(2, 1.8), r(2, 2.3)), { size: 74, col: GOLD }); wave(wavePts(80, 1000, 900, 10, 14, ph * 3, 800), seg(t, r(2, 1.8), r(2, 3.0)), 'rgba(255,216,106,.95)', 3);
  bracket(80, 680, 730, seg(t, r(3, .4), r(3, 1.6)), '~12 cm');
  if (t > T(4) - .2) { const k = seg(t, T(4) - .2, T(4) + .5); meshPlate(540, 1100, 120, k, t, { holes: 4 }); hand(g, 'hole: a few mm', 540, 980 - 0, seg(t, r(4, .6), r(4, 1.4)), { size: 64, col: GOLD }); }
}]);
// C (p5-p6): side view: the big wave runs into the mesh wall and bounces back; the oven as a cage
S.push([T(5) - .5, T(7) - .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 3, a: .7 });
  // the mesh wall: a vertical metal strip with small gaps
  const MX = 660; paint(g, P2(p => p.roundRect(MX - 14, 320, 28, 860, 8)), '#9a97a8', { hatch: .2, lw: 3 }); g.fillStyle = '#1c2250'; for (let yy = 340; yy < 1170; yy += 36) g.fillRect(MX - 14, yy, 28, 10);
  hand(g, 'mesh', MX, 280 + 0, seg(t, T(5), r(5, .5)), { size: 64, col: CREAM });
  const ph = t * 2.2, inK = seg(t, r(5, .2), r(5, 1.6)); wave(wavePts(80, MX - 20, 620, 110, 560, ph), inK);
  const back = seg(t, T(6) - .1, r(6, 1.4)); if (back > 0) { const P = wavePts(80, MX - 20, 900, 110, 560, -ph).reverse(); wave(P, back, 'rgba(255,170,120,.95)'); arrowP(g, 560, 1060, 300, 1060, back, '#ffb08a'); hand(g, 'bounced back', 340, 1120, seg(t, r(6, .6), r(6, 1.3)), { size: 70, col: '#ffb08a' }); }
  hand(g, 'too big to fit', 360, 380, seg(t, r(5, 2.2), r(5, 3.0)), { size: 70, col: GOLD });
  // the cage: the oven outline wrapped in a sketched grid
  const cg = seg(t, r(6, 2.6), r(6, 3.6)); if (cg > 0) { g.save(); g.globalAlpha *= cg; g.strokeStyle = '#d9d4ff'; g.lineWidth = 3; for (let i = 0; i <= 6; i++) { g.beginPath(); g.moveTo(760 + i * 30, 420); g.lineTo(760 + i * 30, 740); g.stroke(); } for (let j = 0; j <= 8; j++) { g.beginPath(); g.moveTo(760, 420 + j * 40); g.lineTo(940, 420 + j * 40); g.stroke(); } g.restore(); hand(g, 'Faraday cage', 860, 800, cg, { size: 58, col: CREAM }); }
}]);
// D (p7): light's tiny waves slip through the holes to the kid's eye
S.push([T(7) - .5, T(8) - .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 5, a: .7 });
  const MX = 560; paint(g, P2(p => p.roundRect(MX - 14, 320, 28, 860, 8)), '#9a97a8', { hatch: .2, lw: 3 }); g.fillStyle = '#1c2250'; for (let yy = 340; yy < 1170; yy += 36) g.fillRect(MX - 14, yy, 28, 10);
  const k = seg(t, r(7, .2), r(7, 3.0)); [520, 700, 880].forEach((yy, i) => { const P = wavePts(60, 760, yy, 9, 14, t * 6 + i, 700); wave(P, clamp(k * 1.2 - i * .1), 'rgba(255,216,106,.95)', 3); });
  g.save(); g.translate(860, 1080); kid(g, 0, 0, 2.0, { body: '#8fb3d9', scarf: '#d9655a', look: -3, mouth: 'smile' }); g.restore();
  hand(g, '< 0.001 mm', 300, 400, seg(t, r(7, .8), r(7, 1.6)), { size: 70, col: GOLD }); hand(g, 'slips right through', 330, 1110, seg(t, r(7, 3.0), r(7, 3.8)), { size: 66, col: GOLD });
}]);
// E (p8-p10): inside the oven from above: hot and cold spots ~6 cm apart; the turntable carries the plate through them
function ovenTop(t, { spots = 1, spin = 0, hot = 1 } = {}) {
  paint(g, P2(p => p.roundRect(120, 380, 840, 760, 30)), '#5a5466', { hatch: .2, lw: 4 }); paint(g, P2(p => p.roundRect(150, 410, 780, 700, 22)), '#d9d2c4', { hatch: .16, lw: 2.4 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const sx = 250 + i * 190, sy = 500 + j * 170, isHot = (i + j) % 2 === 0, k = clamp(spots * 3 - (i + j) * .25); if (k <= 0) continue;
    const pulse = .75 + .25 * Math.sin(t * 4 + i + j); if (isHot) glow(g, sx, sy, 130 * k, HOT, .9 * pulse * hot); else glow(g, sx, sy, 100 * k, COLD, .6 * k); }
  if (spin > 0) { const a = t * 1.2; g.save(); g.translate(540, 760); g.rotate(a); g.globalAlpha *= spin; paint(g, P2(p => p.arc(0, 0, 300, 0, TAU)), 'rgba(230,240,250,.55)', { hatch: .1, lw: 3 }); paint(g, P2(p => blob(p, circPts(120, 0, 70, 60, 12), 4, 3)), '#e9a7a0', { hatch: .2, lw: 2.4 }); g.restore(); }
}
S.push([T(8) - .5, T(11) - .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 11, a: .7 });
  const sp = seg(t, r(9, .2), r(9, 2.4)); ovenTop(t, { spots: t > T(9) ? sp : 0, spin: ss(seg(t, T(10), r(10, .6))) });
  if (t < T(9)) { const ph = t * 3; [600, 800].forEach((yy, i) => { wave(wavePts(160, 920, yy, 70, 360, ph * (i ? -1 : 1)), seg(t, T(8) + i * .3, r(8, 1.6))); }); hand(g, 'sneaky...', 540, 320, seg(t, r(8, 1.4), r(8, 2.2)), { size: 80, col: GOLD }); }
  if (t > T(9) + 1.2 && t < T(10)) { hand(g, 'hot', 250, 470, seg(t, r(9, 1.2), r(9, 1.6)), { size: 60, col: '#ffb08a' }); hand(g, 'cold', 440, 470, seg(t, r(9, 1.6), r(9, 2.0)), { size: 60, col: '#bcd6ff' }); bracket(250, 440, 1180, seg(t, r(9, 2.4), r(9, 3.4)), '~6 cm'); }
  if (t > T(10)) hand(g, 'spin = even heat', 540, 320, seg(t, r(10, .8), r(10, 1.6)), { size: 74, col: GOLD });
}]);
// F (p11-p12): the chocolate test: turntable out, melted spots, the sum
S.push([T(11) - .5, T(13) - .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 13, a: .7 });
  const zz = 1 + .06 * ss(seg(t, T(11), r(12, 6.5))); g.save(); g.translate(540, 760); g.scale(zz, zz); g.translate(-540, -760);
  ovenTop(t, { spots: 1, hot: .9 }); const melt = [250, 440, 630, 820], mk2 = seg(t, r(11, 2.6), r(11, 4.4));
  chocolate(170, 700, 740, t, melt, mk2);
  if (mk2 > .3) melt.forEach((mx, i) => { for (let k = 0; k < 2; k++) { const u = (t * .8 + i * .3 + k * .5) % 1; g.save(); g.strokeStyle = `rgba(255,250,235,${.7 * (1 - u)})`; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); for (let j = 0; j <= 10; j++) { const yy = 680 - u * 160 - j * 9; g.lineTo(mx + Math.sin(j * .9 + t * 5 + i) * 10, yy); } g.stroke(); g.restore(); } });
  g.restore();
  hand(g, 'no turntable', 540, 330, seg(t, T(11), r(11, .8)), { size: 74, col: GOLD });
  if (t > T(12) - .2) { const kb = seg(t, T(12) - .2, T(12) + .3); g.save(); g.globalAlpha *= kb; paint(g, P2(p => p.roundRect(170, 920, 740, 280, 22)), '#1c2250', { hatch: .12, lw: 3 }); g.restore(); bracket(250, 440, 828, seg(t, T(12) - .2, r(12, .6)), '~6 cm', '#3b3340', 52);
    hand(g, '6 cm x 2 = 12 cm', 540, 990, seg(t, r(12, .6), r(12, 1.6)), { size: 66, col: CREAM }); hand(g, '12 cm x 2.45 GHz', 540, 1060, seg(t, r(12, 1.6), r(12, 2.6)), { size: 66, col: CREAM });
    hand(g, '~ the speed of light', 540, 1140, seg(t, r(12, 3.0), r(12, 3.8)), { size: 72, col: GOLD }); }
}]);
// G (p13-end): back on the sketchbook page; "a sieve for waves" written in; the end card handwritten on the page
S.push([T(13) - .5, TL.total + 1, t => {
  const z = lerp(1.2, 1, ss(seg(t, T(13) - .5, r(13, 1.6))));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-540, -900);
  book(g); const { x, y, w, h } = PAGE;
  g.save(); g.beginPath(); g.rect(x + 40, y + 260, w - 80, h - 300); g.clip(); g.translate(x + 40, y + 260); g.scale((w - 80) / W, (w - 80) / W); g.translate(0, -300); kitchen(t, { look: -1 }); g.restore();
  g.strokeStyle = 'rgba(60,40,30,.35)'; g.lineWidth = 2; g.strokeRect(x + 40, y + 260, w - 80, h - 300);
  const endK = seg(t, T(15) - .1, T(15) + .4);
  hand(g, 'WHY THE MESH', 520, y + 150, 1 - endK, { size: 100 }); hand(g, '?', 850, y + 150, 1 - endK, { size: 116, col: '#c4543f' });
  if (t < T(15)) { const k = seg(t, r(13, .6), r(13, 2.0)); if (k > 0) { g.save(); g.fillStyle = 'rgba(246,239,224,.9)'; g.beginPath(); g.roundRect(200, 470, 680, 120, 18); g.globalAlpha *= k; g.fill(); g.restore(); hand(g, 'a sieve for waves', 540, 530, k, { size: 84, col: '#c4543f' }); } }
  if (endK > 0) { g.save(); g.fillStyle = 'rgba(246,239,224,.94)'; g.globalAlpha *= endK; g.beginPath(); g.roundRect(150, 280, 780, 420, 22); g.fill(); g.restore();
    hand(g, 'Follow for more of', 540, 370, seg(t, T(15), r(15, .8)), { size: 86 }); hand(g, 'how it really works.', 540, 470, seg(t, r(15, .5), r(15, 1.4)), { size: 86, col: '#c4543f' });
    hand(g, "A new 'wait, really?' every day.", 540, 560, seg(t, r(15, 1.2), r(15, 2.0)), { size: 54 }); hand(g, '@howitreallyworkstudio', 540, 640, seg(t, r(15, 1.6), r(15, 2.4)), { size: 50, col: '#6a5a8a' }); }
  pencil(g, 930 + 14 * Math.sin(t * 3), 1500 + 8 * Math.cos(t * 4), -.8);
  g.restore();
}]);

function scene(t) {
  g.fillStyle = PAL.night0; g.fillRect(0, 0, W, H);
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .5, b, .5); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  finish(g, { t });
}
// subtitle slip (the module's torn paper slip, re-laid for Batch N: max width 700, centred at x 500, around y 1320)
function slip(cap, a, y0 = 1320, X = 500) {
  if (a <= 0) return; const size = 58, maxW = 700; g.save(); g.font = `700 ${size}px Caveat`;
  const words = []; parse(cap).forEach(p => p.t.split(/(\s+)/).forEach(w => w && words.push({ w, b: p.b })));
  const lines = [[]]; let cw = 0;
  for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > maxW && !/^\s+$/.test(w.w) && lines[lines.length - 1].length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines[lines.length - 1].push(w); cw += m; } }
  const lh = 62, top = y0 - (lines.length - 1) * lh / 2, widest = Math.max(...lines.map(l => l.reduce((s, w) => s + g.measureText(w.w).width, 0)));
  g.globalAlpha = a; g.shadowColor = 'rgba(20,10,10,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 6; g.fillStyle = CREAM;
  const bx = X - widest / 2 - 30, by = top - lh / 2 - 12, bw = widest + 60, bh = lines.length * lh + 24;
  g.beginPath(); g.moveTo(bx, by); for (let i = 0; i <= 12; i++) g.lineTo(bx + bw * i / 12, by + (hash(i * 3.3) - .5) * 6); g.lineTo(bx + bw, by + bh); for (let i = 12; i >= 0; i--) g.lineTo(bx + bw * i / 12, by + bh + (hash(i * 5.1) - .5) * 6); g.closePath(); g.fill();
  g.shadowColor = 'transparent'; g.textBaseline = 'middle';
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + g.measureText(w.w).width, 0); let x = X - tw / 2; for (const w of ln) { g.fillStyle = w.b ? '#c4543f' : INK; g.fillText(w.w, x, top + i * lh); x += g.measureText(w.w).width; } });
  g.restore();
}
function sub(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start, a = (cur === 0 ? 1 : seg(t, p.start - .05, p.start + .15)) * (1 - seg(t, nx - .25, nx - .05));
  slip(p.cap, a);
}
window.DUR = TL.total;
// loop: the last 0.5 s crossfades the end page into frame 0 (same sketchbook page), so the reel restarts seamlessly
window.seek = t => { const Tt = TL.total, a = Tt - .5; scene(Math.min(t, a)); sub(Math.min(t, a)); if (t > a) { const k = ss((t - a) / .5); g.save(); g.globalAlpha = k; scene(0); sub(0); g.restore(); } };
window.thumb = () => {
  const t = 3; g.drawImage(KITCHEN, 0, 0); stars(g, 18, t, { y1: 560, seed: 4, a: .6 });
  g.save(); g.translate(540, 900); g.scale(1.35, 1.35); g.translate(-560, -880); microwave(330, 700, 1.05, t, { pop: 1 }); glow(g, 560, 880, 420, WARM, .4); g.restore();
  meshPlate(820, 520, 170, 1, t);
  g.save(); g.fillStyle = 'rgba(246,239,224,.93)'; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.beginPath(); g.roundRect(110, 1240, 860, 300, 20); g.fill(); g.restore();
  hand(g, 'WHY THE', 540, 1320, 1, { size: 110 }); hand(g, 'METAL MESH?', 540, 1450, 1, { size: 130, col: '#c4543f' });
  finish(g, { t });
};
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
