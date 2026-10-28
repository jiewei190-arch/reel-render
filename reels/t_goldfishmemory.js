// t_goldfishmemory.js: "Do goldfish really have a 3-second memory?" Template #25 Ink moon (demo t25), via styles/inkmoon.
// Cream rice paper, single-brush ink lines, stippled mountains in mist, a pale moon with a halo, plum branch with red blossoms,
// rough ensō circles as frames (the goldfish bowl, a 24-hour dial), quiet italic serif text and a small vermilion seal.
// The goldfish are painted in the demo's one accent colour (vermilion) with ink outlines and translucent wash fins.
// Batch N layout: subtitle at y ~1240-1400 centred at x 500 (max width 720); nothing typed in the top 250 px or bottom 480 px.
import { createInkMoon, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, mk, PAPER, VERM, lc, paper, range, putRange, ridgeLine, mist, haze, moon, birds, plum, enso, ripples, serif, sealMark, parse } from './styles/inkmoon/inkmoon.js';
await Promise.all(['italic 600 60px "Cormorant Garamond"', 'italic 700 60px "Cormorant Garamond"'].map(f => document.fonts.load(f)));
const g = createInkMoon(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .45) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const ink = a => `rgba(30,28,30,${clamp(a)})`;
const PAP = paper();
const FAR = range([[160, 200, 300], [520, 260, 340], [900, 190, 300]], 800, { far: true, seed: 3, dots: 9000, col: '#9fb0bd' });
const NEAR = range([[80, 150, 260], [420, 100, 240], [980, 170, 300]], 860, { seed: 7, dots: 22000, fade: 200 });

// ---------------- goldfish ----------------
function fish(x, y, s, ang, t, { a = 1, col = '#d4502c', sway = 1 } = {}) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const sw = Math.sin(t * 7) * .35 * sway;
  // flowing wash tail (two lobes) with fin-ray strokes
  for (const sd of [-1, 1]) { g.save(); g.translate(-46, 0); g.rotate(sd * .45 + sw); g.fillStyle = 'rgba(212,80,44,.32)'; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-30, sd * 10, -80, sd * 30, -96, sd * 8 + sw * 20); g.bezierCurveTo(-70, sd * 2, -40, -sd * 2, 0, 0); g.fill();
    g.strokeStyle = ink(.45); g.lineWidth = 1.4; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-4, 0); g.quadraticCurveTo(-40, sd * (4 + k * 5), -86 + k * 6, sd * (4 + k * 3) + sw * 16); g.stroke(); } g.restore(); }
  // body
  const body = new Path2D(); body.moveTo(54, 0); body.bezierCurveTo(48, -30, 0, -34, -40, -10); body.quadraticCurveTo(-50, 0, -40, 10); body.bezierCurveTo(0, 34, 48, 30, 54, 0);
  const gr = g.createLinearGradient(0, -30, 0, 30); gr.addColorStop(0, col); gr.addColorStop(.7, lc(col, '#f0a070', .5)); gr.addColorStop(1, '#f3c79a'); g.fillStyle = gr; g.fill(body);
  g.strokeStyle = ink(.85); g.lineWidth = 3; g.stroke(body);
  g.strokeStyle = 'rgba(120,30,10,.35)'; g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(18 - k * 12, -2, 9, -1.2, 1.2); g.stroke(); }
  g.fillStyle = 'rgba(212,80,44,.45)'; g.beginPath(); g.moveTo(10, -26); g.quadraticCurveTo(-6, -48 - sw * 6, -26, -22); g.fill();                    // dorsal fin
  g.beginPath(); g.moveTo(14, 18); g.quadraticCurveTo(4, 34 + sw * 6, -8, 20); g.fill();                                                            // pectoral
  g.fillStyle = ink(.95); g.beginPath(); g.arc(36, -8, 4.5, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(37.5, -9.5, 1.4, 0, TAU); g.fill();
  g.restore();
}
const swimPt = (cx, cy, rx, ry, u) => [cx + Math.cos(u) * rx, cy + Math.sin(u) * ry];
function bubbles(x, y, t, n = 4, a = 1) { g.save(); g.strokeStyle = ink(.5 * a); g.lineWidth = 1.6; for (let i = 0; i < n; i++) { const u = (t * .5 + i / n) % 1; g.beginPath(); g.arc(x + Math.sin(u * 9 + i) * 8, y - u * 140, 4 + u * 6, 0, TAU); g.stroke(); } g.restore(); }

// ---------------- props ----------------
function dial(cx, cy, rad, hand, k, t, { red = 1, label = '' } = {}) {   // a 24-hour ensō dial; the one feeding hour in vermilion
  if (k <= 0) return; enso(g, cx, cy, rad, k, { lw: 14, seed: 5 });
  g.save(); g.globalAlpha *= clamp(k * 2); g.strokeStyle = ink(.7); g.lineCap = 'round';
  for (let i = 0; i < 24; i++) { const a = -Math.PI / 2 + i / 24 * TAU, l = i % 6 ? 14 : 26; g.lineWidth = i % 6 ? 2 : 3.5; g.beginPath(); g.moveTo(cx + Math.cos(a) * (rad - 28), cy + Math.sin(a) * (rad - 28)); g.lineTo(cx + Math.cos(a) * (rad - 28 - l), cy + Math.sin(a) * (rad - 28 - l)); g.stroke(); }
  g.strokeStyle = red ? VERM : ink(.3); g.lineWidth = 18; g.beginPath(); g.arc(cx, cy, rad - 44, -Math.PI / 2, -Math.PI / 2 + TAU / 24); g.stroke();
  g.strokeStyle = ink(.9); g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(hand - Math.PI / 2) * (rad - 70), cy + Math.sin(hand - Math.PI / 2) * (rad - 70)); g.stroke();
  g.fillStyle = ink(.9); g.beginPath(); g.arc(cx, cy, 9, 0, TAU); g.fill(); g.restore();
  if (label) serif(g, label, cx, cy + rad + 50, { size: 44, a: k });
}
function lever(x, y, press, k, live = 1) {   // a little wooden lever on a post, its paddle in the water
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.strokeStyle = ink(.85); g.lineCap = 'round'; g.lineWidth = 9; g.beginPath(); g.moveTo(x, y - 260); g.lineTo(x, y + 10); g.stroke();
  g.save(); g.translate(x, y - 40); g.rotate(-.5 + press * .45); g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 120); g.stroke(); g.fillStyle = live ? '#c8a26a' : '#b9b2a4'; g.fillRect(-22, 100, 44, 46); g.strokeRect(-22, 100, 44, 46); g.restore();
  g.fillStyle = live ? VERM : ink(.25); g.beginPath(); g.arc(x, y - 270, 14, 0, TAU); g.fill(); g.restore();
}
function waterLine(y, t, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = 'rgba(150,175,200,.14)'; g.fillRect(0, y, W, H - y); g.restore(); ripples(g, y + 10, t, { a: .9 * a }); }
function soundRings(x, y, t, k, n = 4) { if (k <= 0) return; g.save(); g.lineCap = 'round'; for (let i = 0; i < n; i++) { const u = (t * .7 + i / n) % 1; g.strokeStyle = `rgba(184,56,42,${(1 - u) * .85 * k})`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 30 + u * 220, -1.1, 1.1); g.stroke(); } g.restore(); }
function moonPhase(x, y, rad, ph, a = 1) {   // ph 0 new .. .5 full .. 1 new
  g.save(); g.globalAlpha *= a; g.fillStyle = '#f3ecd8'; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill(); g.strokeStyle = ink(.6); g.lineWidth = 2.5; g.stroke();
  const lit = Math.cos(ph * TAU); g.fillStyle = ink(.55); g.beginPath(); if (ph < .5) { g.arc(x, y, rad, Math.PI / 2, -Math.PI / 2); g.ellipse(x, y, Math.abs(lit) * rad, rad, 0, -Math.PI / 2, Math.PI / 2, lit < 0); } else { g.arc(x, y, rad, -Math.PI / 2, Math.PI / 2); g.ellipse(x, y, Math.abs(lit) * rad, rad, 0, Math.PI / 2, -Math.PI / 2, lit < 0); } g.fill(); g.restore(); }
function staff(x, y, w, k, kind, t, hot = 0) {   // a little hand-ruled stave: Bach = orderly rising runs, Stravinsky = jagged clusters
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.strokeStyle = ink(.55); g.lineWidth = 1.6; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x, y + i * 14); g.lineTo(x + w * clamp(k * 1.5), y + i * 14); g.stroke(); }
  g.fillStyle = hot ? VERM : ink(.85); for (let i = 0; i < 9; i++) { const nx = x + 24 + i * (w - 40) / 9; if (nx > x + w * k) break; const ny = kind ? y + 56 - ((i % 4) * 14) : y + 28 + (hash(i * 3.3) - .5) * 70, bob = Math.sin(t * 4 + i) * 2;
    g.beginPath(); g.ellipse(nx, ny + bob, 8, 6, -.4, 0, TAU); g.fill(); g.strokeStyle = hot ? VERM : ink(.85); g.lineWidth = 2; g.beginPath(); g.moveTo(nx + 7, ny + bob); g.lineTo(nx + 7, ny + bob - 40); g.stroke(); if (!kind && i % 2) { g.beginPath(); g.ellipse(nx + 4, ny - 16, 8, 6, -.4, 0, TAU); g.fill(); } }
  g.restore();
}
function smallBowl(x, y, s, t, k) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = ink(.85); g.lineWidth = 4; g.beginPath(); g.ellipse(0, 0, 120, 110, 0, -1.2, Math.PI + 1.2); g.stroke(); g.beginPath(); g.ellipse(0, -100, 52, 12, 0, 0, TAU); g.stroke();
  g.fillStyle = 'rgba(150,175,200,.25)'; g.beginPath(); g.ellipse(0, 10, 112, 96, 0, -.35, Math.PI + .35); g.fill(); g.restore();
  fish(x + Math.cos(t * .9) * 40 * s, y + 20 * s, .55 * s, Math.cos(t * .9) > 0 ? Math.PI : 0, t, { a: clamp(k * 2) }); }

// ---------------- scenes ----------------
const S = [];
function lotus(x, y, s, t) { g.save(); g.translate(x, y); g.rotate(.06 * Math.sin(t * .8 + x)); g.scale(s, s * .42); g.fillStyle = 'rgba(70,90,80,.28)'; g.beginPath(); g.arc(0, 0, 90, .25, TAU - .1); g.lineTo(0, 0); g.fill(); g.strokeStyle = ink(.55); g.lineWidth = 3; g.stroke(); g.lineWidth = 1.4; for (let k = 0; k < 7; k++) { const a = .3 + k * .85; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 84, Math.sin(a) * 84); g.stroke(); } g.restore(); }
function pond(t) { g.save(); const gr = g.createLinearGradient(0, 880, 0, H); gr.addColorStop(0, 'rgba(150,175,200,.22)'); gr.addColorStop(1, 'rgba(150,175,200,.10)'); g.fillStyle = gr; g.fillRect(0, 880, W, H - 880); g.restore();
  ripples(g, 900, t, { a: .8 }); ripples(g, 1440, t + 3, { a: .55 }); [[160, 1560, 1], [520, 1660, .8], [880, 1540, 1.1], [330, 1760, .7], [760, 1740, .9]].forEach(([x, y, s_]) => lotus(x, y, s_, t)); }
function base(t, { moonA = 1, mtn = 1, mistA = .5 } = {}) { g.drawImage(PAP, 0, 0); moon(g, 760, 470, 110, 0, { a: moonA }); putRange(g, FAR, { a: mtn }); putRange(g, NEAR, { a: mtn }); mist(g, 850, 110, t, { a: mistA, seed: 2 }); pond(t); }
// A (p0-p1): the goldfish circling inside an ensō bowl from frame 0; the "3-second" title gets struck out
S.push([0, T(2), t => {
  base(t, { mtn: .55 }); plum(g, 1, t, { x: W + 20, y: 260, s: .9 });
  const crack = ss(seg(t, r(1, 2.2), r(1, 2.8))), outK = ss(seg(t, r(1, 2.5), r(1, 3.9)));
  enso(g, 540, 770, 260, 1 - .2 * crack, { lw: 16, seed: 2 });
  if (crack > 0) { g.save(); g.strokeStyle = ink(.8); g.lineWidth = 3; g.lineCap = 'round'; [[[392, 560], [356, 520], [372, 490]], [[300, 700], [252, 690], [236, 650]]].forEach(L => { g.beginPath(); L.forEach(([x, y], i) => { const px = lerp(L[0][0], x, crack), py = lerp(L[0][1], y, crack); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); }); g.restore(); } g.save(); g.globalAlpha = .3; g.fillStyle = PAPER; g.beginPath(); g.arc(540, 770, 246, 0, TAU); g.fill(); g.globalAlpha = .25; g.fillStyle = 'rgba(150,175,200,1)'; g.fill(); g.restore();
  const u = t * 1.1 + 2; let [fx, fy] = swimPt(540, 790, 160, 100, u), fa = u + Math.PI / 2;
  if (outK > 0) { const t0 = r(1, 2.5), [sx, sy] = swimPt(540, 790, 160, 100, t0 * 1.1 + 2); fx = lerp(sx, 120, outK) + Math.sin(outK * 9) * 20 * (1 - outK); fy = lerp(sy, 1010, outK * outK); fa = Math.atan2(1010 - sy, 120 - sx); }
  fish(fx, fy, 1.5, fa, t); bubbles(fx + 40, fy - 40, t, 3, 1 - outK);
  serif(g, 'the 3-second', 400, 340, { size: 96, w: 700 }); serif(g, 'goldfish?', 400, 440, { size: 96, w: 700 });
  if (t > E(0) - .2) { const k = ss(seg(t, r(1, 3.0), r(1, 3.6))); if (k > 0) { g.save(); g.strokeStyle = 'rgba(184,56,42,.9)'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(130, 355); g.lineTo(lerp(130, 680, k), 330); g.stroke(); g.restore(); } }
  sealMark(g, 900, 430, 60, 'myth', ss(seg(t, r(1, 3.4), r(1, 3.8))));
}]);
// B (p2-p6): Plymouth: a lever in the pond, a 24-hour dial with one feeding hour; fish crowd the lever before the hour, even after the food stops
S.push([T(2) - .45, T(7) - .1, t => {
  base(t, { moonA: .5, mtn: .7 });
  serif(g, 'University of Plymouth', 540, 300, { size: 52, a: ss(seg(t, T(2), r(2, .8))) });
  const kd = ss(seg(t, T(3) - .2, r(3, .8))), day = Math.max(0, t - T(3)) * .9, hand = (day % 1) * TAU, nearHour = ((day % 1) > .9 || (day % 1) < .05) && t > T(4) - .3;
  dial(770, 560, 150, hand, kd, t, { red: t < T(5) + .4 ? 1 : 0, label: t < T(5) + .4 ? 'one hour in 24' : 'food off' });
  const live = t < T(5) + .4 ? 1 : 0, press = nearHour ? Math.abs(Math.sin(t * 9)) : 0;
  lever(230, 1000, press, ss(seg(t, r(2, 2.0), r(2, 2.8))), live);
  for (let i = 0; i < 5; i++) { const home = [420 + i * 110, 1040 + (i % 2) * 60], at = [250 + (i - 2) * 22, 1030 + (i % 3) * 28], gather = t > T(4) - .3 ? ss(clamp(nearHour ? 1 : .15)) : 0;
    const wx = lerp(home[0] + Math.sin(t * .8 + i) * 60, at[0], gather), wy = lerp(home[1] + Math.cos(t * .7 + i) * 20, at[1], gather); fish(wx, wy, .8, gather > .5 ? Math.PI + .2 * Math.sin(t * 3 + i) : (Math.cos(t * .8 + i) > 0 ? 0 : Math.PI), t + i); }
  if (t > T(4) + .6) serif(g, 'just before feeding time', 300, 470, { size: 44, a: ss(seg(t, r(4, .6), r(4, 1.2))) * (1 - ss(seg(t, T(5) - .3, T(5)))) });
  if (t > T(5)) serif(g, 'day 1 · day 2 · day 3', 300, 470, { size: 46, a: ss(seg(t, r(5, .5), r(5, 1.2))) * (1 - ss(seg(t, T(6) - .3, T(6)))) });
  if (t > T(6)) { const k = ss(seg(t, T(6), r(6, .6))); serif(g, '3 seconds', 300, 450, { size: 60, a: k }); g.save(); g.strokeStyle = 'rgba(184,56,42,.9)'; g.lineWidth = 8; g.beginPath(); g.moveTo(180, 455); g.lineTo(lerp(180, 420, ss(seg(t, r(6, .6), r(6, 1.0)))), 445); g.stroke(); g.restore();
    serif(g, 'a daily routine', 300, 560, { size: 60, w: 700, a: ss(seg(t, r(6, 1.4), r(6, 2.0))) }); }
}]);
// C (p7-p9): Israel: fish learn a sound with food, swim out to sea; the moon phases mark the months; the sound brings them back
S.push([T(7) - .45, T(10) - .1, t => {
  base(t, { moonA: .25, mtn: .5 });
  const away = ss(seg(t, r(8, 3.6), r(8, 6.0))), back = ss(seg(t, r(9, .2), r(9, 2.2))), out = away * (1 - back), ring = (t > T(7) && t < r(8, 3.4)) || t > r(9, .1);
  soundRings(180, 1030, t, ring ? 1 : 0); g.save(); g.fillStyle = ink(.85); g.fillRect(150, 1000, 40, 60); g.restore();
  for (let i = 0; i < 9; i++) { const bx = 360 + (i % 3) * 70 + Math.sin(t * 1.2 + i) * 14, by = 980 + Math.floor(i / 3) * 50 + Math.cos(t + i) * 8, x = lerp(bx, 1180 + i * 40, out); fish(x, by, .55, out > .02 && back < .02 ? 0 : Math.PI, t + i * .7, { a: 1 - out * .8 }); }
  if (t > r(8, 3.0)) { const k = ss(seg(t, r(8, 3.0), r(8, 4.0))); serif(g, 'released into the sea', 600, 720, { size: 46, a: k * (1 - ss(seg(t, T(9) - .3, T(9)))) }); }
  // months passing: five moon phases across the sky
  const mk_ = seg(t, T(9) - .4, r(9, 1.8)); for (let i = 0; i < 5; i++) { const a = clamp(mk_ * 5 - i); if (a > 0) moonPhase(220 + i * 160, 470, 46, .1 + i * .2, a); }
  if (t > r(9, 1.8)) serif(g, 'months later', 540, 590, { size: 60, w: 700, a: ss(seg(t, r(9, 1.8), r(9, 2.6))) });
  serif(g, 'sound = food', 540, 320, { size: 60, w: 700, a: ss(seg(t, r(7, .6), r(7, 1.4))) * (1 - ss(seg(t, T(9) - .4, T(9)))) });
}]);
// D (p10): Japan: a goldfish told Bach from Stravinsky (it bites a bead for its piece)
S.push([T(10) - .45, T(11) - .1, t => {
  base(t, { moonA: .3, mtn: .35 });
  enso(g, 540, 860, 220, ss(seg(t, T(10) - .4, r(10, .6))), { lw: 14, seed: 6 }); g.save(); g.globalAlpha = .22; g.fillStyle = 'rgb(150,175,200)'; g.beginPath(); g.arc(540, 860, 206, 0, TAU); g.fill(); g.restore();
  const bach = (Math.floor((t - T(10)) / 1.4) % 2) === 0, bite = bach ? Math.abs(Math.sin((t - T(10)) * 6)) : 0;
  staff(130, 360, 360, seg(t, T(10), r(10, 1.0)), 1, t, bach); staff(590, 360, 360, seg(t, r(10, .4), r(10, 1.4)), 0, t, !bach);
  serif(g, 'Bach', 310, 520, { size: 64, w: 700, a: ss(seg(t, r(10, .6), r(10, 1.2))), tone: bach ? .95 : .4 }); serif(g, 'Stravinsky', 770, 520, { size: 64, w: 700, a: ss(seg(t, r(10, 1.2), r(10, 1.8))), tone: bach ? .4 : .95 });
  // the speaker that plays the piece (beside the bowl) and the bead on a stalk the fish bites for its piece
  g.save(); g.fillStyle = ink(.85); g.fillRect(812, 690, 70, 90); g.fillStyle = PAPER; g.beginPath(); g.arc(847, 735, 26, 0, TAU); g.fill(); g.fillStyle = ink(.85); g.beginPath(); g.arc(847, 735, 10, 0, TAU); g.fill();
  g.strokeStyle = bach ? VERM : ink(.5); g.lineWidth = 3; for (let i = 0; i < 3; i++) { const u2 = (t * .9 + i / 3) % 1; g.globalAlpha = 1 - u2; g.beginPath(); g.arc(847, 735, 50 + u2 * 70, Math.PI * .65, Math.PI * 1.35); g.stroke(); } g.globalAlpha = 1;
  g.strokeStyle = ink(.8); g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(560, 1060); g.quadraticCurveTo(570, 960, 560, 880); g.stroke(); g.fillStyle = VERM; g.beginPath(); g.arc(560, 868, 18, 0, TAU); g.fill(); g.strokeStyle = ink(.8); g.lineWidth = 2.5; g.stroke(); g.restore();
  fish(lerp(680, 630, bite), 880, 1.3, Math.PI - .15, t);
  serif(g, 'Keio University', 540, 1130, { size: 40, a: ss(seg(t, r(10, 2.0), r(10, 2.6))), tone: .6 });
}]);
// E (p11-p13): where did the myth come from? a tiny bowl; then weeks, months, years as a vertical column
S.push([T(11) - .45, T(14) - .1, t => {
  base(t, { moonA: .6, mtn: .5 }); birds(g, t, { x0: 100, y0: 300, n: 6, sp: 70, s: 1.1 });
  for (let i = 0; i < 3; i++) { const u = t * .7 + i * 2.1; fish(540 + Math.cos(u) * 360, 1060 + Math.sin(u * 1.3) * 40, .8, Math.sin(u) > 0 ? Math.PI : 0, t + i); }
  smallBowl(540, 760, 1.6, t, ss(seg(t, T(11) - .3, r(11, .6))) * (1 - ss(seg(t, T(13) - .3, T(13)))));
  serif(g, 'where did it come from?', 540, 360, { size: 58, a: ss(seg(t, T(11), r(11, .8))) * (1 - ss(seg(t, T(13) - .3, T(13)))) });
  if (t > T(12) + 2.4 && t < T(13)) serif(g, '(one researcher’s hunch)', 540, 1060, { size: 42, a: ss(seg(t, r(12, 2.4), r(12, 3.0))), tone: .6 });
  if (t > T(13) - .2) { ['weeks', 'months', 'years'].forEach((w_, i) => serif(g, w_, 540, 470 + i * 150, { size: 100, w: 700, a: ss(seg(t, r(13, .5 + i * .9), r(13, 1.1 + i * .9))) })); sealMark(g, 760, 860, 60, 'C Brown', ss(seg(t, r(13, 2.8), r(13, 3.3)))); }
}]);
// F (p14-end): payoff in a big moonlit pond; the question; the end card; the bowl returns for the loop
S.push([T(14) - .45, TL.total + 1, t => {
  base(t, { moonA: 1, mtn: .9, mistA: .6 }); { const pa = 1 - ss(seg(t, T(16) - .4, T(16))); if (pa > 0) { g.save(); g.globalAlpha *= pa; plum(g, 1, t, { x: W + 20, y: 260, s: .9 }); g.restore(); } }
  for (let i = 0; i < 3; i++) { const u = t * .5 + i * 2.1; fish(540 + Math.cos(u) * 330, 1040 + Math.sin(u * 1.3) * 40, .9, Math.sin(u) > 0 ? Math.PI : 0, t + i); }
  if (t < T(16)) { serif(g, 'the fish remembers', 540, 360, { size: 72, w: 700, a: ss(seg(t, r(14, 2.2), r(14, 3.0))) * (1 - ss(seg(t, T(15) - .3, T(15)))) });
    serif(g, 'dinner time?', 540, 360, { size: 80, w: 700, a: ss(seg(t, T(15), r(15, .6))) }); }
  else { const k = t - T(16); serif(g, 'Follow for more of', 540, 560, { size: 76, w: 700, reveal: ss(seg(k, .1, .9)) }); serif(g, 'how it really works.', 540, 650, { size: 76, w: 700, reveal: ss(seg(k, .5, 1.4)) });
    serif(g, "A new 'wait, really?' every day.", 540, 760, { size: 50, reveal: ss(seg(k, 1.0, 1.8)) }); serif(g, '@howitreallyworkstudio', 540, 1200, { size: 46, reveal: ss(seg(k, 1.3, 2.1)), tone: .7 }); sealMark(g, 860, 1100, 64, 'end', ss(seg(k, 1.6, 2.0))); }
}]);

function scene(t) {
  g.drawImage(PAP, 0, 0);
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .45, b)) : win(t, a + .45, b); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
}
// quiet serif subtitle (module grammar, re-laid for Batch N: max width 720, centred at x 500)
function sub(cap, a, y0 = 1310, X = 500) {
  if (a <= 0) return; const SZ = 56, maxW = 720; g.save(); g.globalAlpha = a; g.textBaseline = 'middle';
  const toks = []; parse(cap).forEach(p => p.t.split(/\s+/).filter(Boolean).forEach(w => toks.push({ w, b: p.b })));
  const m = tk => { g.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; return g.measureText(tk.w + ' ').width; };
  const lines = [[]]; let cw = 0; for (const tk of toks) { const w = m(tk); if (cw + w > maxW && lines[lines.length - 1].length) { lines.push([]); cw = 0; } lines[lines.length - 1].push(tk); cw += w; }
  const lh = 62, top = y0 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => { const tw = ln.reduce((s, tk) => s + m(tk), 0); let x = X - tw / 2; if (i === 0) { g.fillStyle = VERM; g.fillRect(x - 28, top - 7, 13, 13); }
    for (const tk of ln) { g.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; g.lineJoin = 'round'; g.strokeStyle = 'rgba(239,232,216,.92)'; g.lineWidth = 10; g.strokeText(tk.w, x, top + i * lh); g.fillStyle = tk.b ? VERM : 'rgba(30,28,30,.92)'; g.fillText(tk.w, x, top + i * lh); x += m(tk); } });
  g.restore();
}
function subs(t) { let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start; sub(p.cap, (cur === 0 ? 1 : seg(t, p.start - .05, p.start + .2)) * (1 - seg(t, nx - .25, nx - .05))); }
window.DUR = TL.total;
// loop: the last 0.5 s fades frame 0 back in over the end card (the paper stays), so the reel restarts seamlessly
window.seek = t => { const Tt = TL.total, a = Tt - .5; scene(Math.min(t, a)); subs(Math.min(t, a)); if (t > a) { const k = ss((t - a) / .5); g.save(); g.globalAlpha = k; scene(0); g.restore(); } };
window.thumb = () => { const t = 2; base(t, { mtn: .55 }); plum(g, 1, t, { x: W + 20, y: 260, s: .9 });
  enso(g, 540, 1000, 320, 1, { lw: 18, seed: 2 }); fish(540, 1010, 2.4, -.15, t);
  serif(g, '3-second', 540, 420, { size: 150, w: 700 }); serif(g, 'memory?', 540, 580, { size: 150, w: 700 });
  g.save(); g.strokeStyle = 'rgba(184,56,42,.9)'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(230, 440); g.lineTo(860, 400); g.stroke(); g.restore(); sealMark(g, 880, 1380, 80, 'myth', 1); };
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
