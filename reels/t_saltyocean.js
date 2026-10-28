// t_saltyocean.js: "Why is the ocean salty?" Template #25 Ink moon (demo t25), via styles/inkmoon.
// Cream rice paper, single-brush ink lines, stippled mountains in mist, a pale moon (and a warm sun), rain as brush streaks,
// a big breaking wave in ink and blue-grey wash, ensō circles as insets, quiet italic serif text and a small vermilion seal.
// Ions are the one accent: sodium in vermilion, chloride as ink dots. Hot vents breathe ink plumes from the sea floor.
// Batch N layout: subtitle at y ~1240-1400 centred at x 500 (max width 720); nothing typed in the top 250 px or bottom 480 px;
// titles sit at y >= 400 so the badge spot (44,260) stays clear.
import { createInkMoon, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, PAPER, VERM, paper, range, putRange, mist, moon, birds, enso, ripples, serif, sealMark, parse, figure, house } from './styles/inkmoon/inkmoon.js';
await Promise.all(['italic 600 60px "Cormorant Garamond"', 'italic 700 60px "Cormorant Garamond"'].map(f => document.fonts.load(f)));
const g = createInkMoon(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .45) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const ink = a => `rgba(30,28,30,${clamp(a)})`;
const sea_ = a => `rgba(120,150,178,${clamp(a)})`;
const PAP = paper();
const FAR = range([[160, 200, 300], [520, 260, 340], [900, 190, 300]], 780, { far: true, seed: 3, dots: 9000, col: '#9fb0bd' });
const NEAR = range([[150, 330, 330], [560, 420, 330], [960, 300, 300]], 900, { seed: 7, dots: 26000, fade: 220 });
const LOW = range([[120, 120, 260], [470, 160, 280], [880, 110, 260]], 760, { seed: 11, dots: 12000, fade: 160 });

// ---------------- props ----------------
// sodium = vermilion bead with "+", chloride = ink bead with "−"
function ion(x, y, s, na, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.translate(x, y); g.scale(s, s);
  g.fillStyle = na ? VERM : ink(.88); g.beginPath(); g.arc(0, 0, 11, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(246,236,220,.95)'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-5, 0); g.lineTo(5, 0); if (na) { g.moveTo(0, -5); g.lineTo(0, 5); } g.stroke(); g.restore();
}
function rainSt(x0, x1, y0, y1, t, k, { n = 40, sl = .25, len = 46, a = .55, seed = 1 } = {}) {
  if (k <= 0) return; g.save(); g.strokeStyle = ink(a * k); g.lineCap = 'round'; g.lineWidth = 2.2;
  for (let i = 0; i < n; i++) { const sp = 520 + hash(seed + i) * 200, u = ((t * sp + hash(i * 3.1 + seed) * (y1 - y0)) % (y1 - y0)), x = x0 + hash(i * 7.3 + seed) * (x1 - x0) - u * sl, y = y0 + u;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - len * sl, y + len); g.stroke(); }
  g.restore();
}
function cloud(x, y, s, a = 1, rain = 0) {
  if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.translate(x, y); g.scale(s, s);
  const P = [[-110, 10, 52], [-55, -24, 66], [10, -40, 76], [80, -16, 60], [128, 14, 44], [30, 18, 60], [-50, 22, 54]];
  g.fillStyle = rain ? 'rgba(170,176,186,.9)' : 'rgba(250,247,238,.95)'; P.forEach(([px, py, pr]) => { g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fill(); });
  g.strokeStyle = ink(.8); g.lineWidth = 4 / s; g.beginPath(); P.slice(0, 5).forEach(([px, py, pr], i) => { g.moveTo(px + pr * Math.cos(-2.8), py + pr * Math.sin(-2.8)); g.arc(px, py, pr, -2.8, -.3); }); g.stroke();
  g.beginPath(); g.moveTo(-160, 50); g.lineTo(170, 50); g.lineWidth = 3 / s; g.stroke(); g.restore();
}
// the big breaking wave, Hokusai-ish: a wash body, inner curl bands, foam claws along the lip
function wave(cx, y0, s, t, { a = 1, crystals = 1 } = {}) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; const ph = t * .9, h = 520 * s * (1 + .05 * Math.sin(ph)), lip = 70 * Math.sin(ph * .7);
  const curl = (q, open = false) => { const p = new Path2D(), sh = 1 - q * .55;
    p.moveTo(-40, y0 + 60); p.bezierCurveTo(cx - 420 * s, y0 - h * .1 * sh, cx - 240 * s, y0 - h * sh, cx + (20 + lip * .3) * s, y0 - h * sh);
    p.bezierCurveTo(cx + (260 + lip) * s * sh, y0 - h * sh, cx + (330 + lip) * s * sh, y0 - h * .42 * sh, cx + (180 + lip * .5) * s * sh, y0 - h * .38 * sh);
    p.bezierCurveTo(cx + 80 * s * sh, y0 - h * .36 * sh, cx + 30 * s, y0 - h * .1, cx + 170 * s, y0 + 40);
    if (open) return p; p.lineTo(W + 40, y0 + 60); p.lineTo(W + 40, H + 10); p.lineTo(-40, H + 10); p.closePath(); return p; };
  const body = curl(0); const gr = g.createLinearGradient(0, y0 - h, 0, y0 + 300); gr.addColorStop(0, 'rgba(70,100,130,.85)'); gr.addColorStop(.6, 'rgba(120,150,178,.6)'); gr.addColorStop(1, 'rgba(150,175,200,.25)');
  g.fillStyle = gr; g.fill(body); g.strokeStyle = ink(.9); g.lineWidth = 6; g.stroke(body);
  for (let q = 1; q <= 4; q++) { g.save(); g.clip(body); g.strokeStyle = ink(.35 + .1 * (q % 2)); g.lineWidth = 2.4; g.translate(cx * (1 - (1 - q * .12)), 0); g.stroke(curl(q * .16, true)); g.restore(); }
  // foam claws on the lip
  g.fillStyle = '#faf7ef'; g.strokeStyle = ink(.85); g.lineWidth = 2.5;
  for (let i = 0; i < 9; i++) { const u = i / 8, bx = lerp(cx - 120 * s, cx + (280 + lip) * s, u), by = y0 - h * (1 - .45 * Math.pow(u, 3)) - 6, w2 = 22 * s, wob = Math.sin(t * 5 + i) * 6;
    g.beginPath(); g.moveTo(bx - w2, by + 8); g.quadraticCurveTo(bx, by - 46 * s + wob, bx + w2 * 1.6, by - 30 * s + wob); g.quadraticCurveTo(bx + w2 * .6, by - 18 * s, bx + w2, by + 8); g.closePath(); g.fill(); g.stroke(); }
  // spray: salt crystals glinting in the air
  if (crystals > 0) for (let i = 0; i < 18; i++) { const u = (t * .35 + hash(i * 2.3)) % 1, x = cx + (60 + hash(i) * 380) * s + u * 120, y = y0 - h + 30 - u * 220 + u * u * 260, rot = t * 2 + i, sz = (9 + 7 * hash(i * 5)) * s * 1.4;
    g.save(); g.globalAlpha *= crystals * Math.sin(u * Math.PI); g.translate(x, y); g.rotate(rot); g.fillStyle = '#fbfaf4'; g.fillRect(-sz / 2, -sz / 2, sz, sz); g.strokeStyle = ink(.85); g.lineWidth = 2; g.strokeRect(-sz / 2, -sz / 2, sz, sz); g.restore(); }
  g.restore();
}
function seaBand(y, t, a = 1, deep = 0) {
  g.save(); g.globalAlpha *= a; const gr = g.createLinearGradient(0, y, 0, H); gr.addColorStop(0, sea_(.38)); gr.addColorStop(1, sea_(.2 + deep * .3)); g.fillStyle = gr; g.fillRect(0, y, W, H + 400 - y); g.restore();
  g.save(); g.strokeStyle = ink(.85 * a); g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); for (let x = -10; x <= W + 10; x += 10) { const yy = y + Math.sin(x * .02 + t * 1.6) * 5; x < 0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); g.restore();
  ripples(g, y + 26, t, { a: .9 * a });
}
// a river ribbon down from the mountains to the sea; ions ride it
const RIV = [[300, 880], [640, 960], [260, 1060], [520, 1180]];
function bez(P, u) { const [a, b, c, d] = P, m = 1 - u; return [0, 1].map(k => m * m * m * a[k] + 3 * m * m * u * b[k] + 3 * m * u * u * c[k] + u * u * u * d[k]); }
function river(k, t) {
  if (k <= 0) return; g.save(); g.lineCap = 'round'; const N = Math.floor(60 * k);
  for (let pass = 0; pass < 2; pass++) { g.strokeStyle = pass ? sea_(.75) : ink(.85); g.beginPath(); for (let i = 0; i <= N; i++) { const [x, y] = bez(RIV, i / 60); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.lineWidth = pass ? 20 : 30; g.stroke(); }
  g.strokeStyle = 'rgba(250,247,238,.8)'; g.lineWidth = 2; g.setLineDash([14, 22]); g.lineDashOffset = -t * 60; g.beginPath(); for (let i = 0; i <= N; i++) { const [x, y] = bez(RIV, i / 60); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
}
function rock(cx, cy, R, crack, t) {   // close-up rock face inside an ensō: stippled boulder, cracks, ions leaving
  g.save(); g.beginPath(); g.arc(cx, cy, R - 8, 0, TAU); g.clip(); g.fillStyle = 'rgba(239,232,216,1)'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  g.fillStyle = 'rgba(160,150,140,.55)'; g.beginPath(); g.moveTo(cx - R, cy + R * .1); g.lineTo(cx - R * .5, cy - R * .35); g.lineTo(cx - R * .05, cy - R * .2); g.lineTo(cx + R * .4, cy - R * .5); g.lineTo(cx + R, cy - R * .1); g.lineTo(cx + R, cy + R); g.lineTo(cx - R, cy + R); g.closePath(); g.fill(); g.strokeStyle = ink(.85); g.lineWidth = 5; g.stroke();
  for (let i = 0; i < 900; i++) { const x = cx + (hash(i * 1.3) - .5) * 2 * R, y = cy - R * .4 + hash(i * 2.9) * R * 1.4; g.fillStyle = ink(.25 + .4 * hash(i)); g.fillRect(x, y, 2, 2); }
  g.strokeStyle = ink(.9); g.lineWidth = 3.5; g.lineCap = 'round';
  [[[cx - R * .3, cy - R * .25], [cx - R * .2, cy], [cx - R * .3, cy + R * .25], [cx - R * .15, cy + R * .5]], [[cx + R * .3, cy - R * .4], [cx + R * .2, cy - R * .1], [cx + R * .35, cy + R * .2]]].forEach(L => {
    g.beginPath(); L.forEach(([x, y], i) => { const k = clamp(crack * (L.length - 1) - i + 1); if (i === 0) g.moveTo(x, y); else if (k > 0) { const [px, py] = L[i - 1]; g.lineTo(lerp(px, x, k), lerp(py, y, k)); } }); g.stroke(); });
  g.restore();
}
function fishS(x, y, s, dir, t, a = 1) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s * dir, s); const sw = Math.sin(t * 8) * .25; g.fillStyle = ink(.85);
  g.beginPath(); g.moveTo(30, 0); g.quadraticCurveTo(10, -16, -16, 0); g.quadraticCurveTo(10, 16, 30, 0); g.fill(); g.beginPath(); g.moveTo(-12, 0); g.lineTo(-30, -12 + sw * 20); g.lineTo(-30, 12 + sw * 20); g.closePath(); g.fill();
  g.fillStyle = PAPER; g.beginPath(); g.arc(20, -3, 2.6, 0, TAU); g.fill(); g.restore(); }
// sea-floor cross-section (baked stipple crust)
const CRUST = (() => { const c = document.createElement('canvas'); c.width = W; c.height = 1100; const q = c.getContext('2d'), top = x => 120 + 60 * Math.sin(x * .006 + 1) + 30 * Math.sin(x * .021);
  q.fillStyle = 'rgba(90,80,75,.55)'; q.beginPath(); q.moveTo(0, 1100); for (let x = 0; x <= W; x += 6) q.lineTo(x, top(x)); q.lineTo(W, 1100); q.closePath(); q.fill();
  for (let i = 0; i < 26000; i++) { const x = hash(i * 1.7 + .31) * W, y = top(x) + hash(i * 91.17 + 7.7) * (1100 - top(x)); q.fillStyle = `rgba(30,28,30,${.2 + .5 * hash(i * 5.1)})`; q.fillRect(x, y, 2, 2); }
  q.strokeStyle = 'rgba(30,28,30,.9)'; q.lineWidth = 5; q.beginPath(); for (let x = 0; x <= W; x += 6) x ? q.lineTo(x, top(x)) : q.moveTo(x, top(x)); q.stroke(); return { c, top }; })();
function plume(x, y, t, k, { s = 1, hot = 0, h = 420 } = {}) {   // ink smoke billowing up from a vent
  if (k <= 0) return; g.save();
  for (let i = 0; i < 22; i++) { const u = ((t * .32 + i / 22) % 1), py = y - u * h * k, px = x + Math.sin(u * 7 + i) * 26 * u * s + u * u * 40 * s, pr = (16 + u * 70) * s;
    const gr = g.createRadialGradient(px, py, 0, px, py, pr); const c = hot && i % 3 === 0 ? '184,56,42' : '30,28,30'; gr.addColorStop(0, `rgba(${c},${.55 * (1 - u) * k})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fill();
    if (i % 4 === 0 && u > .1) ion(px + 14, py, .8, i % 8 === 0, (1 - u) * k); }
  g.restore();
}
function chimney(x, y, k) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.fillStyle = ink(.85); g.beginPath(); g.moveTo(x - 46, y + 120); g.lineTo(x - 18, y); g.lineTo(x + 18, y); g.lineTo(x + 50, y + 120); g.closePath(); g.fill(); g.restore(); }
function volcano(x, y, k, t, erupt) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.fillStyle = ink(.82); g.beginPath(); g.moveTo(x - 200, y + 160); g.quadraticCurveTo(x - 70, y + 40, x - 36, y); g.lineTo(x + 36, y); g.quadraticCurveTo(x + 70, y + 40, x + 190, y + 160); g.closePath(); g.fill();
  if (erupt > 0) { g.fillStyle = `rgba(184,56,42,${.85 * erupt})`; g.beginPath(); g.moveTo(x - 30, y + 4); g.quadraticCurveTo(x - 50, y + 60, x - 70, y + 120); g.lineTo(x - 50, y + 120); g.quadraticCurveTo(x - 20, y + 40, x, y + 6); g.fill(); } g.restore();
  plume(x, y, t, erupt, { s: 1.4, hot: 1, h: 460 }); }
function cycleArrow(cx, cy, R, a0, a1, k, col) { if (k <= 0) return; const ae = lerp(a0, a1, k); g.save(); g.strokeStyle = col; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R, a0, ae); g.stroke();
  const hx = cx + Math.cos(ae) * R, hy = cy + Math.sin(ae) * R, ta = ae + Math.PI / 2; g.fillStyle = col; g.beginPath(); g.moveTo(hx + Math.cos(ta) * 30, hy + Math.sin(ta) * 30); g.lineTo(hx + Math.cos(ta + 2.4) * 22, hy + Math.sin(ta + 2.4) * 22); g.lineTo(hx + Math.cos(ta - 2.4) * 22, hy + Math.sin(ta - 2.4) * 22); g.closePath(); g.fill(); g.restore(); }
function sun(x, y, R, a = 1) { moon(g, x, y, R, 1, { a }); }

// ---------------- scenes ----------------
const S = [];
// A (p0-p1): frame 0 is a huge breaking wave with salt crystals in its spray; a fresh river spills into it; "salty?" vs "fresh"
S.push([0, T(2), t => {
  const lift = ss(seg(t, r(1, 1.2), T(2)));     // the camera tilts up toward the rain clouds
  g.save(); g.translate(0, lift * 300);
  moon(g, 800, 470, 90, 0, { a: .8 }); putRange(g, FAR, { a: .55, dy: 40 }); mist(g, 820, 90, t, { a: .4, seed: 2 });
  const rk = ss(seg(t, r(0, 1.8), r(0, 2.8)));
  if (rk > 0) { g.save(); g.globalAlpha = rk; g.strokeStyle = ink(.85); g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, 800); g.quadraticCurveTo(120, 830, 160, 900); g.stroke(); g.strokeStyle = sea_(.8); g.lineWidth = 13; g.stroke(); g.restore(); }
  wave(560, 1180, 1.05 - .1 * ss(seg(t, 0, 4)), t, { crystals: 1 });
  serif(g, 'why is the sea', 520, 420, { size: 86, w: 600, a: 1 }); serif(g, 'salty?', 520, 520, { size: 120, w: 700, a: 1, tone: .95 });
  if (rk > 0) serif(g, 'fresh', 200, 740, { size: 58, w: 700, a: rk, tone: .8 });
  sealMark(g, 820, 560, 56, 'sea', ss(seg(t, .3, .9)));
  cloud(540, -120, 1.3, lift); rainSt(200, 900, -60, 260, t, lift, { n: 30 });
  g.restore();
}]);
// B (p2-p4): rain over big mountains; CO2 joins the drops; a rock close-up cracks and lets go of ions; a river carries them to the sea
S.push([T(2) - .45, T(5) - .1, t => {
  const pan = ss(seg(t, T(4) - .4, r(4, 1.6)));   // pan down toward the sea while the river runs
  g.save(); g.translate(0, -pan * 240);
  moon(g, 820, 460, 70, 0, { a: .4 }); putRange(g, FAR, { a: .5, dy: -80 }); putRange(g, NEAR, { a: 1 }); mist(g, 900, 120, t, { a: .55, seed: 4 });
  seaBand(1180, t, 1); cloud(380, 360, 1.15, 1, 1); cloud(780, 300, .9, 1, 1); rainSt(160, 980, 400, 880, t, 1, { n: 60, seed: 3 });
  // CO2: little bubbles drifting into the rain
  const ck = ss(seg(t, T(2), r(2, 1.2))) * (1 - ss(seg(t, T(3) - .3, T(3))));
  if (ck > 0) { for (let i = 0; i < 6; i++) { const x = 140 + i * 130 + Math.sin(t * 1.5 + i) * 20, y = 560 + Math.cos(t * 1.2 + i * 2) * 50 + (i % 2) * 70; g.save(); g.globalAlpha = ck; g.fillStyle = 'rgba(250,247,238,.9)'; g.beginPath(); g.arc(x, y, 30, 0, TAU); g.fill(); g.strokeStyle = ink(.8); g.lineWidth = 3; g.stroke(); g.restore(); serif(g, 'CO₂', x, y, { size: 28, w: 700, a: ck }); }
    serif(g, 'slightly acidic rain', 540, 1050, { size: 60, w: 700, a: ss(seg(t, r(2, 2.0), r(2, 2.8))) * (1 - ss(seg(t, T(3) - .3, T(3)))) }); }
  // rock close-up inset
  const rk = win(t, T(3) - .1, T(4) + .4);
  if (rk > 0) { g.save(); g.globalAlpha = rk; const cx = 520, cy = 700, R = 270; g.fillStyle = PAPER; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill(); rock(cx, cy, R, ss(seg(t, r(3, .4), r(3, 2.2))), t); enso(g, cx, cy, R, 1, { lw: 16, seed: 4 });
    rainSt(cx - 220, cx + 220, cy - 260, cy - 20, t, 1, { n: 16, seed: 7, a: .7 });
    for (let i = 0; i < 10; i++) { const st = r(3, 1.6 + i * .25), u = seg(t, st, st + 2.2); if (u <= 0) continue; const x = cx - 120 + hash(i * 3) * 240 + Math.sin(t * 2 + i) * 14, y = cy + 40 - u * 200 + hash(i) * 60; ion(x, y, 2.4 * backOut(seg(t, st, st + .4)), i % 2 === 0); }
    serif(g, 'ions', cx, cy + 330, { size: 64, w: 700, a: ss(seg(t, r(3, 3.0), r(3, 3.6))), tone: .85 });
    g.restore(); }
  // the river with ions riding to the sea
  const rv = ss(seg(t, T(4) - .4, r(4, 1.0)));
  river(rv, t); if (rv > .5) for (let i = 0; i < 14; i++) { const u = ((t - T(4)) * .22 + i / 14) % 1, [x, y] = bez(RIV, u); ion(x + Math.sin(i) * 4, y - 2, 1.1, i % 2 === 0, (rv - .5) * 2); }
  serif(g, 'to the sea', 760, 1110, { size: 56, w: 700, a: ss(seg(t, r(4, 1.4), r(4, 2.0))) });
  g.restore();
}]);
// C (p5-p7): the open sea under a warm sun; water rises as vapour into a cloud, the ions stay; rain falls on far hills; fish nibble; salt builds up
let SEAI = []; for (let i = 0; i < 70; i++) SEAI.push([hash(i * 4.1) * 860 + 40, 860 + hash(i * 6.7) * 520, i % 2 === 0, hash(i * 9.3)]);
S.push([T(5) - .45, T(8) - .1, t => {
  const zoom = 1 + .06 * ss(seg(t, T(5), T(8)));
  g.save(); g.translate(540, 900); g.scale(zoom, zoom); g.translate(-540, -900);
  sun(250, 470, 95, 1); putRange(g, LOW, { a: .7, dx: 0, dy: 0 }); birds(g, t, { x0: 300, y0: 380, n: 5, sp: 60, s: 1 });
  seaBand(820, t, 1);
  // vapour: soft wisps rising from the sea into a cloud
  const vk = ss(seg(t, r(5, 1.0), r(5, 2.0)));
  for (let i = 0; i < 12; i++) { const u = (t * .28 + i / 12) % 1, x = 380 + (i % 6) * 90 + Math.sin(u * 6 + i) * 22, y = 820 - u * 360; g.save(); g.globalAlpha = vk * Math.sin(u * Math.PI) * .9; g.strokeStyle = sea_(1); g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y + 30); g.bezierCurveTo(x - 16, y + 18, x + 16, y + 6, x, y - 10); g.stroke(); g.restore(); }
  const cg = ss(seg(t, r(5, 2.0), r(5, 4.0))), drift = ss(seg(t, T(6), r(6, 2.2)));
  cloud(lerp(620, 560, drift), lerp(400, 360, drift), .6 + .5 * cg, cg, drift > .3 ? 1 : 0); if (drift > .3) rainSt(420, 760, 420, 760, t, (drift - .3) / .7, { n: 30, seed: 9 });
  serif(g, 'water rises', 700, 470, { size: 58, w: 700, a: ss(seg(t, r(5, 1.6), r(5, 2.3))) * (1 - ss(seg(t, T(6) - .3, T(6)))) });
  // ions in the sea; one sodium bead tries to rise and drops back
  const n0 = 26, more = Math.floor(lerp(n0, 70, ss(seg(t, T(6), E(7)))));
  for (let i = 0; i < more; i++) { const [x, y, na, ph] = SEAI[i]; const eaten = (i === 3 || i === 8 || i === 15) && t > r(7, .4 + i * .08); if (eaten) continue; ion(x + Math.sin(t * .8 + ph * 9) * 14, y + Math.cos(t * .7 + ph * 7) * 8, 1.15, na, i < n0 ? 1 : clamp((t - T(6)) * 2 - (i - n0) * .05)); }
  const jump = seg(t, r(5, 3.0), r(5, 4.6)), jy = 840 - Math.sin(jump * Math.PI) * 180; if (jump > 0 && jump < 1) ion(560, jy, 1.6, true);
  if (t > r(5, 3.6)) serif(g, 'salt stays', 560, 690, { size: 64, w: 700, a: ss(seg(t, r(5, 3.6), r(5, 4.2))) * (1 - ss(seg(t, T(6) - .3, T(6)))), tone: .95 });
  if (t > T(6)) serif(g, 'left behind', 560, 690, { size: 64, w: 700, a: ss(seg(t, r(6, 1.4), r(6, 2.0))) * (1 - ss(seg(t, T(7) - .3, T(7)))) });
  // sea creatures nibble a few ions
  if (t > T(7) - .4) for (let i = 0; i < 3; i++) { const x = lerp(-60, 1140, seg(t, T(7) - .4 + i * .3, E(7) + .4 + i * .3)), y = 980 + i * 120 + Math.sin(t * 2 + i) * 14; fishS(x, y, 1.6, 1, t + i); }
  // the salt meter: a brush column filling on the left
  const mk_ = seg(t, T(6) - .2, E(7)); if (mk_ > 0) { g.save(); g.globalAlpha = clamp(mk_ * 4); g.strokeStyle = ink(.85); g.lineWidth = 4; g.strokeRect(70, 480, 56, 300); g.fillStyle = VERM; const fh = 290 * ss(mk_); g.fillRect(75, 775 - fh, 46, fh); g.restore();
    serif(g, 'builds up', 150, 640, { size: 56, w: 700, align: 'left', a: ss(seg(t, r(7, 2.0), r(7, 2.6))) }); }
  g.restore();
}]);
// D (p8-p10): dive to the sea floor: seawater seeps into cracks, magma heats it, a vent breathes an ink plume of minerals; then a volcano
S.push([T(8) - .45, T(11) - .1, t => {
  const dive = ss(seg(t, T(8) - .45, r(8, 1.4)));
  g.save(); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sea_(.25)); gr.addColorStop(1, sea_(.55)); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.translate(0, (1 - dive) * 500);
  g.save(); g.globalAlpha = .55; ripples(g, 300 - dive * 200, t, { a: .6 }); g.restore();
  for (let i = 0; i < 26; i++) { const x = hash(i * 3.7) * 860 + 40, y = 330 + hash(i * 5.3) * 520 + Math.sin(t + i) * 10 - ((t * 12 + i * 37) % 60); ion(x, y, 1.3, i % 2 === 0, .75); }
  g.drawImage(CRUST.c, 0, 900);
  // magma glow under the crust
  const mg = ss(seg(t, r(9, 1.6), r(9, 3.0))); if (mg > 0) { g.save(); g.globalAlpha = mg; const rg = g.createRadialGradient(400, 1560, 20, 400, 1560, 360); rg.addColorStop(0, 'rgba(220,90,50,.9)'); rg.addColorStop(1, 'rgba(184,56,42,0)'); g.fillStyle = rg; g.fillRect(0, 1200, W, 720); g.restore();
    serif(g, 'magma', 400, 1530, { size: 52, w: 700, a: mg * .9, tone: .9 }); }
  // cracks and seeping water
  const ck = seg(t, T(9), r(9, 1.6)); if (ck > 0) { g.save(); g.strokeStyle = ink(.95); g.lineWidth = 4; [[230, 1100, 280, 1230, 250, 1340], [420, 1080, 380, 1200, 430, 1330], [600, 1090, 640, 1210, 610, 1320]].forEach(([a1, b1, a2, b2, a3, b3]) => { g.beginPath(); g.moveTo(a1, b1); g.lineTo(lerp(a1, a2, clamp(ck * 2)), lerp(b1, b2, clamp(ck * 2))); if (ck > .5) g.lineTo(lerp(a2, a3, (ck - .5) * 2), lerp(b2, b3, (ck - .5) * 2)); g.stroke(); });
    g.strokeStyle = 'rgba(80,130,180,.95)'; g.lineWidth = 6; g.setLineDash([10, 14]); g.lineDashOffset = -t * 50; [[230, 960, 280, 1230], [600, 960, 640, 1210]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }); g.restore(); }
  const vk = ss(seg(t, r(9, 3.0), r(9, 3.8))); chimney(420, 960, vk); plume(420, 960, t, vk, { s: 1.1, h: 560 });
  if (vk > 0) serif(g, 'vent', 300, 880, { size: 56, w: 700, a: vk });
  const vo = ss(seg(t, T(10) - .5, T(10) + .3)); volcano(720, 960, vo, t, ss(seg(t, r(10, .2), r(10, 1.0))));
  if (vo > 0) serif(g, 'volcano', 720, 1210, { size: 52, w: 700, a: vo, tone: .95 });
  g.restore();
  serif(g, 'salted from below', 540, 430, { size: 76, w: 700, a: ss(seg(t, r(8, 1.0), r(8, 1.8))) * (1 - ss(seg(t, T(10) - .5, T(10)))) }); serif(g, 'and from volcanoes', 540, 430, { size: 72, w: 700, a: ss(seg(t, T(10), r(10, .6))) });
}]);
// E (p11): spread over the land: a white salt layer rises over a house and a figure; a 500-ft measuring rule
S.push([T(11) - .45, T(12) - .1, t => {
  moon(g, 800, 470, 80, 0, { a: .6 }); putRange(g, FAR, { a: .7 }); putRange(g, LOW, { a: .9, dy: 120 });
  house(g, 560, 1010, 1, 1); figure(g, 330, 1010, 1.4, { lantern: 1, t });
  g.save(); g.fillStyle = 'rgba(30,28,30,.12)'; g.fillRect(0, 1010, W, 500); g.restore();
  const up = eo(seg(t, r(11, .6), r(11, 3.6))), top = lerp(1010, 640, up);
  if (up > 0) { g.save(); g.fillStyle = '#fbfaf5'; g.beginPath(); g.moveTo(-10, H); for (let x = -10; x <= W + 10; x += 12) g.lineTo(x, top + Math.sin(x * .03 + t * 2) * 6 + hash(x) * 6); g.lineTo(W + 10, H); g.closePath(); g.fill();
    g.strokeStyle = ink(.85); g.lineWidth = 4; g.stroke(); g.clip(); for (let i = 0; i < 300; i++) { const x = hash(i * 2.1) * W, y = top + 20 + hash(i * 4.3) * 900, sz = 6 + 8 * hash(i); g.save(); g.translate(x, y); g.rotate(i); g.strokeStyle = ink(.25); g.lineWidth = 1.5; g.strokeRect(-sz / 2, -sz / 2, sz, sz); g.restore(); } g.restore();
    g.save(); g.strokeStyle = VERM; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(820, 1010); g.lineTo(820, top); g.moveTo(790, 1010); g.lineTo(850, 1010); g.moveTo(790, top); g.lineTo(850, top); g.stroke(); g.restore();
    g.save(); g.globalAlpha = .28 * up; house(g, 560, 1010, 1, 0); figure(g, 330, 1010, 1.4, {}); g.restore(); figure(g, 470, top + 4, .9, { walk: t });
    serif(g, 'more than', 640, lerp(1010, top, .5) - 40, { size: 50, w: 600, a: ss(seg(t, r(11, 1.6), r(11, 2.4))), tone: .9 }); serif(g, '500 feet', 640, lerp(1010, top, .5) + 30, { size: 74, w: 700, a: ss(seg(t, r(11, 1.6), r(11, 2.4))), tone: .95 }); }
  serif(g, 'all the ocean’s salt,', 520, 420, { size: 62, w: 700, a: ss(seg(t, T(11), r(11, .8))) }); serif(g, 'spread over land', 520, 500, { size: 62, w: 600, a: ss(seg(t, r(11, .3), r(11, 1.1))) });
}]);
// F (p12-p13): payoff: a drop of seawater as a big ensō with a 100-square grid, 3.5 squares in vermilion; then the cycle: rain brings it, the sun leaves it
S.push([T(12) - .45, T(14) - .1, t => {
  putRange(g, FAR, { a: .4 }); seaBand(1150, t, .7); mist(g, 1000, 100, t, { a: .4, seed: 5 });
  const dk = win(t, T(12) - .2, T(13) + .2), cx = 540, cy = 760, R = 290;
  if (dk > 0) { g.save(); g.globalAlpha = dk; g.fillStyle = 'rgba(150,175,200,.35)'; g.beginPath(); g.arc(cx, cy, R - 10, 0, TAU); g.fill(); enso(g, cx, cy, R, ss(seg(t, T(12) - .3, r(12, .6))), { lw: 18, seed: 6 });
    const gk = seg(t, r(12, .4), r(12, 2.2)), cs = 34, x0 = cx - cs * 5, y0 = cy - cs * 5 + 10;
    for (let i = 0; i < 100; i++) { const c = i % 10, rw = Math.floor(i / 10), a = clamp(gk * 100 / 6 - (i / 6)); if (a <= 0) continue; const hot = i >= 96;
      g.fillStyle = hot ? VERM : 'rgba(250,247,238,.85)'; const w = i === 96 ? cs * .5 : cs - 4; g.globalAlpha = dk * a; g.fillRect(x0 + c * cs + 2, y0 + rw * cs + 2, w, cs - 4); g.strokeStyle = ink(.45); g.lineWidth = 1.5; g.strokeRect(x0 + c * cs + 2, y0 + rw * cs + 2, cs - 4, cs - 4); }
    g.globalAlpha = dk; serif(g, '3.5% salt', 540, 400, { size: 96, w: 700, a: ss(seg(t, r(12, 1.6), r(12, 2.4))), tone: .95 });
    const na = ss(seg(t, r(12, 3.0), r(12, 3.8))); if (na > 0) { ion(390, 1110, 2.2, true, na); serif(g, 'sodium', 490, 1110, { size: 52, w: 700, a: na, align: 'left' }); ion(390, 1180, 2.2, false, ss(seg(t, r(12, 3.6), r(12, 4.4)))); serif(g, 'chloride', 490, 1180, { size: 52, w: 700, a: ss(seg(t, r(12, 3.6), r(12, 4.4))), align: 'left' }); }
    g.restore(); }
  // the cycle
  const ck = ss(seg(t, T(13) - .4, r(13, .4)));
  if (ck > 0) { g.save(); g.globalAlpha = ck; const ccx = 520, ccy = 760, CR = 270;
    sun(ccx + 230, ccy - 250, 70, 1); cloud(ccx - 230, ccy - 230, .7, 1, 1); rainSt(ccx - 340, ccx - 140, ccy - 190, ccy + 60, t, 1, { n: 14, seed: 4 });
    cycleArrow(ccx, ccy, CR, Math.PI * .95, Math.PI * 1.55, ss(seg(t, T(13), r(13, .8))), ink(.85)); cycleArrow(ccx, ccy, CR, Math.PI * 1.7, Math.PI * 2.3, ss(seg(t, r(13, 1.0), r(13, 1.8))), VERM);
    for (let i = 0; i < 12; i++) ion(ccx - 120 + (i % 6) * 48 + Math.sin(t * 2 + i) * 6, ccy + 150 + Math.floor(i / 6) * 44, 1.1, i % 2 === 0, clamp((t - T(13)) * 3 - i * .1));
    serif(g, 'rain brings it in', ccx - 60, ccy - 330, { size: 50, w: 700, a: ss(seg(t, r(13, .3), r(13, .9))) }); serif(g, 'the sun leaves it', ccx + 60, ccy + 330, { size: 50, w: 700, a: ss(seg(t, r(13, 1.2), r(13, 1.8))) });
    g.restore(); }
}]);
// G (p14-end): the question over the wave and a rock; the end card; frame 0 returns for the loop
S.push([T(14) - .45, TL.total + 1, t => {
  moon(g, 800, 470, 90, 0, { a: .8 }); putRange(g, FAR, { a: .55, dy: 40 }); mist(g, 820, 90, t, { a: .4, seed: 2 });
  const endK = ss(seg(t, T(15) - .4, T(15) + .2));
  wave(560, 1180 + endK * 540, 1.0 - endK * .3, t, { crystals: 1 - endK });
  if (t < T(15)) { serif(g, 'from rocks?', 520, 470, { size: 110, w: 700, a: ss(seg(t, T(14), r(14, .6))) }); serif(g, 'yes or no?', 520, 580, { size: 64, w: 600, a: ss(seg(t, r(14, 1.4), r(14, 2.0))) }); }
  else { const k = t - T(15); serif(g, 'Follow for more of', 540, 560, { size: 76, w: 700, reveal: ss(seg(k, .1, .9)) }); serif(g, 'how it really works.', 540, 650, { size: 76, w: 700, reveal: ss(seg(k, .5, 1.4)) });
    serif(g, "A new 'wait, really?' every day.", 540, 760, { size: 50, reveal: ss(seg(k, 1.0, 1.8)) }); serif(g, '@howitreallyworkstudio', 540, 1180, { size: 46, reveal: ss(seg(k, 1.3, 2.1)), tone: .7 }); sealMark(g, 820, 880, 64, 'end', ss(seg(k, 1.6, 2.0))); }
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
    for (const tk of ln) { g.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; g.lineJoin = 'round'; g.strokeStyle = 'rgba(239,232,216,.95)'; g.lineWidth = 12; g.strokeText(tk.w, x, top + i * lh); g.fillStyle = tk.b ? VERM : 'rgba(30,28,30,.94)'; g.fillText(tk.w, x, top + i * lh); x += m(tk); } });
  g.restore();
}
function subs(t) { let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start; sub(p.cap, (cur === 0 ? 1 : seg(t, p.start - .05, p.start + .2)) * (1 - seg(t, nx - .25, nx - .05))); }
window.DUR = TL.total;
// loop: the last 0.5 s blends at most 40% of frame 0 over the end card, so the restart reads as a continuation
window.seek = t => { const Tt = TL.total, a = Tt - .5; scene(t); subs(Math.min(t, a)); if (t > a) { const k = .4 * ss((t - a) / .5); g.save(); g.globalAlpha = k; scene(0); g.restore(); } };
window.thumb = () => { const t = 2; g.drawImage(PAP, 0, 0); moon(g, 800, 470, 90, 0, { a: .8 }); putRange(g, FAR, { a: .55, dy: 40 });
  wave(560, 1320, 1.2, t, { crystals: 1 }); serif(g, 'why is the sea', 540, 470, { size: 110, w: 600 }); serif(g, 'salty?', 540, 620, { size: 170, w: 700, tone: .95 }); sealMark(g, 880, 1380, 80, 'sea', 1); };
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
