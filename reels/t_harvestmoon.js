// t_harvestmoon.js: why the October moon looks huge and orange. Template #25 Ink moon (demo t25).
// Rice paper, stippled dry-brush ink peaks over mist, a moon with halo and haze, plum branch with red blossoms, birds,
// ensō circles as insets, ink diagrams (earth curve, air band, light paths), vertical title column with a vermilion seal.
import { createInkMoon, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, paper, range, putRange, ridgeLine, mist, haze, moon, birds, plum, enso,
  figure, house, ripples, serif, column, sealMark, subtitle } from './styles/inkmoon/inkmoon.js';
await document.fonts.load('italic 700 60px "Cormorant Garamond"');
const g = createInkMoon(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .5) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const ink = a => `rgba(30,28,30,${clamp(a)})`;

// ---------------- the landscape (baked ranges) ----------------
const FARP = [[60, 210, 240], [340, 300, 260], [650, 230, 240], [940, 290, 260]];
const NEARP = [[150, 330, 240], [480, 240, 210], [800, 420, 250], [1070, 270, 210]];
const FAR = range(FARP, 1180, { far: true, dots: 9000, seed: 3, fade: 200 });
const NEAR = range(NEARP, 1310, { dots: 150000, seed: 7, fade: 230 });
const BANK = range([[180, 90, 280], [640, 60, 300], [990, 110, 220]], 1400, { dots: 40000, seed: 11, fade: 90 });
function land(t, { mx = 540, my = 1000, mr = 250, o = 0, plumK = 0, plumX = 0, birdsA = 1, houseA = 0, fig = null, extra = null, fields = 0, moonA = 1, plumY = 430 } = {}) {
  g.drawImage(paper(), 0, 0);
  moon(g, mx, my, mr, o, { a: moonA, sq: clamp((my - 800) / 300) });
  putRange(g, FAR); mist(g, 1180, 110, t, { seed: 2 }); putRange(g, NEAR); mist(g, 1330, 90, t, { seed: 5, a: .8 });
  putRange(g, BANK);
  if (houseA > 0) { g.save(); g.globalAlpha *= houseA; house(g, 250, 1395, 1.1); g.restore(); }
  if (extra) extra();
  // water with the moon's reflection
  g.save(); g.globalAlpha *= .55 * moonA; for (let i = 0; i < 12; i++) { const y = 1430 + i * 14, w = (70 - i * 3) * (1 + .3 * Math.sin(t * 2 + i)); g.fillStyle = o > .5 ? `rgba(240,150,90,${.6 - i * .04})` : `rgba(250,240,215,${.7 - i * .05})`; g.fillRect(mx - w / 2 + 10 * Math.sin(t + i), y, w, 5); } g.restore();
  ripples(g, 1430, t, { a: .8 });
  if (fields > 0) { g.save(); g.globalAlpha *= fields; g.strokeStyle = ink(.5); g.lineWidth = 2; for (let i = 0; i < 8; i++) { const y = 1430 + i * 30; g.beginPath(); for (let x = 0; x < W; x += 26) { g.moveTo(x, y + i * 2); g.lineTo(x + 6, y - 12 - 4 * hash(x + i)); } g.stroke(); }
    [[180, 1480], [400, 1520], [760, 1470], [930, 1540]].forEach(([x, y], i) => { g.fillStyle = ink(.82); g.beginPath(); g.moveTo(x - 26, y); g.lineTo(x - 8, y - 70); g.lineTo(x + 8, y - 70); g.lineTo(x + 26, y); g.fill(); g.strokeStyle = 'rgba(239,232,216,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 14, y - 34); g.lineTo(x + 14, y - 34); g.stroke(); });
    g.restore(); }
  if (fig) fig();
  if (birdsA > 0) { g.save(); g.globalAlpha *= birdsA; birds(g, t, { x0: 120, y0: 520, sp: 30 }); g.restore(); }
  if (plumK > 0) plum(g, plumK, t, { x: W + 20 + plumX, y: plumY });
}

// ---------------- scenes ----------------
const S = [];
// A (p0-p2): huge orange moon rising behind the ink peaks; it isn't bigger or orange; two tricks: sky and brain
S.push([0, T(3), t => {
  const o = 1 - .85 * ss(seg(t, r(1, 1.4), r(1, 2.3))) * (1 - ss(seg(t, T(2) - .1, T(2) + .6)));
  land(t, { my: lerp(860, 740, ss(seg(t, 0, 10))), mr: 260, o, plumK: seg(t, 0, 2.5) + .5, plumX: 600 * ss(seg(t, T(2) - .4, T(2) + .4)) });
  const ta = 1 - seg(t, T(2) - .3, T(2) + .1);
  serif(g, 'WHY THE MOON', 540, 250, { size: 96, w: 700, ls: 6, a: ta }); serif(g, 'LOOKS HUGE', 540, 360, { size: 96, w: 700, ls: 6, a: ta }); sealMark(g, 820, 410, 54, 'moon', ta);
  // the two tricks
  const k1 = seg(t, r(2, .9), r(2, 1.8)), k2 = seg(t, r(2, 2.0), r(2, 2.9));
  enso(g, 210, 430, 130, k1, { seed: 2 }); enso(g, 870, 430, 130, k2, { seed: 5 });
  if (k1 > .5) { g.save(); g.globalAlpha *= seg(k1, .5, 1); g.translate(210, 430); g.scale(.81, .81); g.translate(-290, -560); g.beginPath(); g.arc(290, 560, 150, 0, TAU); g.clip();
    g.fillStyle = 'rgba(150,180,205,.45)'; g.beginPath(); g.arc(290, 1100, 520, 0, TAU); g.fill(); g.fillStyle = ink(.85); g.beginPath(); g.arc(290, 1100, 460, 0, TAU); g.fill();
    g.fillStyle = '#d9763e'; g.beginPath(); g.arc(360, 540, 26, 0, TAU); g.fill(); g.restore(); serif(g, 'sky', 210, 255, { size: 64, w: 700 }); }
  if (k2 > .5) { g.save(); g.globalAlpha *= seg(k2, .5, 1); g.translate(870, 430); g.scale(.81, .81); g.translate(-790, -560); g.strokeStyle = ink(.85); g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.ellipse(790, 560, 95, 70, 0, 0, TAU); g.stroke();
    g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(740 + i * 26, 540 + (i % 2) * 30, 22, Math.PI * (.9 + .1 * i), Math.PI * (2.1 + .1 * i)); g.stroke(); } g.beginPath(); g.moveTo(790, 492); g.lineTo(790, 628); g.stroke(); g.restore(); serif(g, 'brain', 870, 255, { size: 64, w: 700 }); }
}]);
// B (p3-p7): the colour: sunlight off the moon, the long path through air near the horizon, blue scattered, sunsets, pale overhead
const EC = [540, 2900], ER = 1500, AR = 1650;
const onE = (a, rad = ER) => [EC[0] + Math.sin(a) * rad, EC[1] - Math.cos(a) * rad];
function brush(pts, k, { col = ink(.85), lw = 5, dash = null } = {}) { if (k <= 0) return; g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; if (dash) g.setLineDash(dash);
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let rem = tot * clamp(k); g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length && rem > 0; i++) { const u = Math.min(1, rem / L[i - 1]); g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); rem -= L[i - 1]; } g.stroke(); g.restore(); }
S.push([T(3) - .5, T(8) - .1, t => {
  g.drawImage(paper(), 0, 0);
  const zin = ss(seg(t, T(3) - .5, T(3) + .3));
  // air band + earth (stippled brush arc)
  g.save(); g.globalAlpha = zin; g.fillStyle = 'rgba(150,180,205,.38)'; g.beginPath(); g.arc(EC[0], EC[1], AR, 0, TAU); g.fill();
  mist(g, 1250, 120, t, { seed: 8, a: .5 });
  g.fillStyle = '#e6dfcd'; g.beginPath(); g.arc(EC[0], EC[1], ER, 0, TAU); g.fill();
  for (let i = 0; i < 9000; i++) { const a = (hash(i * 1.3) - .5) * 1.1, d = hash(i * 2.9) ** 2 * 260; if (hash(i * 5.3) > Math.exp(-d / 90)) continue; const [x, y] = onE(a, ER - d); g.fillStyle = ink(.5 * hash(i * 7)); g.fillRect(x, y, 2, 2); }
  g.strokeStyle = ink(.9); g.lineWidth = 5; g.beginPath(); g.arc(EC[0], EC[1], ER, -Math.PI / 2 - .6, -Math.PI / 2 + .6); g.stroke();
  serif(g, 'air', 160, 1160, { size: 58, w: 700, tone: .6 });
  g.restore();
  const ox = 540, oy = 1400; figure(g, ox, oy, 1.5, { t });
  // sun (p3), moving down to a red sunset (p6)
  const sunDown = ss(seg(t, r(6, .1), r(6, 1.6))), sx = lerp(150, 110, sunDown), sy = lerp(320, 1330, sunDown);
  const sunA = seg(t, r(3, .6), r(3, 1.2)) * (1 - seg(t, T(7) - .2, T(7) + .3));
  if (sunA > 0) { g.save(); g.globalAlpha *= sunA; haze(g, sx, sy, 200, '230,120,70', .3 + .3 * sunDown); g.fillStyle = sunDown > .5 ? '#c8462e' : '#d9763e'; g.beginPath(); g.arc(sx, sy, 58, 0, TAU); g.fill(); g.restore();
    serif(g, 'sun', sx + 110, sy - 10, { size: 54, w: 700, a: sunA * (1 - sunDown) }); }
  // high moon and low moon
  const rise = ss(seg(t, r(7, .3), r(7, 2.6)));
  const hx = 560, hy = 470, lx = lerp(1000, 760, rise), ly = lerp(1330, 560, rise);
  const scat = seg(t, r(5, .3), r(5, 2.4)), lo = lerp(scat, 0, rise);
  moon(g, hx, hy, 66, 0, { a: seg(t, r(3, 1.0), r(3, 1.6)) * (1 - rise) });
  moon(g, lx, ly, 66, lo, { a: seg(t, r(4, .2), r(4, .8)) });
  // sunlight bouncing off the moon to you
  const bA = 1 - seg(t, T(4) + 1.2, T(4) + 1.8);
  brush([[sx + 50, sy + 20], [hx - 60, hy - 10]], seg(t, r(3, 1.6), r(3, 2.5)) * bA, { dash: [16, 12], col: 'rgba(200,110,60,.9)' });
  brush([[hx, hy + 66], [ox + 6, oy - 120]], seg(t, r(3, 2.4), r(3, 3.2)) * bA, { dash: [16, 12] });
  serif(g, 'sunlight, bounced', 760, 330, { size: 52, w: 700, a: seg(t, r(3, 2.4), r(3, 3.0)) * bA });
  // p4: short path overhead vs long path near the horizon (the part inside the air is marked)
  const pA = seg(t, r(4, .5), r(4, 1.5)) * (1 - seg(t, T(7) + .1, T(7) + .6));
  if (pA > 0) { brush([[ox + 6, oy - 120], [hx, hy + 70]], pA, { lw: 4 });
    const [ax, ay] = [ox, oy - (AR - ER)]; brush([[ox + 4, oy - 100], [ax + 4, ay]], pA, { col: 'rgba(110,150,190,.9)', lw: 14 });
    brush([[ox + 20, oy - 110], [lx - 60, ly + 4]], seg(t, r(4, 1.0), r(4, 2.0)), { col: lo > .3 ? `rgba(220,110,50,.9)` : ink(.85), lw: 4 + 10 * (1 - rise) });
    serif(g, 'a little air', ox - 170, 980, { size: 50, w: 700, a: seg(t, r(4, 1.2), r(4, 1.7)) * (1 - rise) });
    serif(g, 'much more air', 790, 1200, { size: 56, w: 700, a: seg(t, r(4, 2.0), r(4, 2.6)) * (1 - rise) }); }
  // p5: blue scattered out of the long path
  if (scat > 0 && rise < 1) for (let i = 0; i < 26; i++) { const u = hash(i * 3.3), k = clamp(scat * 1.5 - u * .5); if (k <= 0) continue; const bx = lerp(ox + 20, lx - 60, u), by = lerp(oy - 110, ly + 4, u);
    g.fillStyle = `rgba(80,130,200,${.85 * (1 - rise)})`; g.beginPath(); g.arc(bx + (hash(i) - .5) * 120 * k, by - 170 * k * (.4 + hash(i * 5)), 7, 0, TAU); g.fill(); }
  serif(g, 'blue scattered away', 800, 860, { size: 56, w: 700, a: seg(t, r(5, .8), r(5, 1.4)) * (1 - seg(t, T(6) - .2, T(6) + .2)), tone: .8 });
  serif(g, 'orange & red get through', 640, 1520, { size: 56, w: 700, a: seg(t, r(5, 2.0), r(5, 2.6)) * (1 - seg(t, T(6) - .2, T(6) + .2)) });
  serif(g, 'same at sunset', 300, 1060, { size: 58, w: 700, a: seg(t, r(6, 1.0), r(6, 1.5)) * (1 - seg(t, T(7) - .2, T(7) + .2)) });
  serif(g, 'less air: pale again', 540, 760, { size: 58, w: 700, a: seg(t, r(7, 2.0), r(7, 2.6)) });
  serif(g, 'the color', 540, 190, { size: 76, w: 700, a: seg(t, T(3), r(3, .8)) * (1 - seg(t, T(8) - .6, T(8) - .2)) });
}]);
// C (p8-p9): the size: fingernail at arm's length, low or high; two photos, same width
function photo(x, y, w, h, rot, k, my, mr) { if (k <= 0) return; g.save(); g.translate(x, y + (1 - eo(k)) * 50); g.rotate(rot); g.globalAlpha *= clamp(k * 2);
  g.shadowColor = 'rgba(40,30,20,.3)'; g.shadowBlur = 14; g.shadowOffsetY = 6; g.fillStyle = '#f7f2e6'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.save(); g.beginPath(); g.rect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 70); g.clip(); g.translate(-w / 2 + 14, -h / 2 + 14); const sc = (w - 28) / W; g.scale(sc, sc); g.translate(0, -560);
  g.drawImage(paper(), 0, 0); moon(g, 540, my, mr, 0); putRange(g, FAR); putRange(g, NEAR); g.restore();
  g.strokeStyle = ink(.6); g.lineWidth = 2; g.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 70); g.restore(); }
S.push([T(8) - .5, T(10) - .1, t => {
  const lowA = 1 - ss(seg(t, r(8, 2.6), r(8, 3.4))), my = lerp(1000, 560, 1 - lowA), hk = seg(t, r(8, 1.0), r(8, 1.6)) * (1 - seg(t, T(9) - .2, T(9) + .2));
  land(t, { mx: 540, my, mr: lerp(250, 46, Math.max(hk, 1 - lowA)), o: .55 * lowA, birdsA: .8 });
  // a hand at arm's length: the index fingernail covers the moon, low or high
  if (hk > 0) { g.save(); g.globalAlpha *= hk; const fx = 540, fy = my + (1 - eo(hk)) * 400, col = '#2a2628';
    g.fillStyle = col; g.beginPath(); g.moveTo(fx - 50, fy + 40); g.lineTo(fx - 50, fy - 30); g.quadraticCurveTo(fx - 50, fy - 64, fx, fy - 64); g.quadraticCurveTo(fx + 50, fy - 64, fx + 50, fy - 30); g.lineTo(fx + 50, fy + 120); g.closePath(); g.fill();
    g.beginPath(); g.roundRect(fx - 110, fy + 100, 230, 190, 60); g.fill(); const ay = Math.min(fy + 520, 1540); g.beginPath(); g.moveTo(fx - 40, fy + 270); g.lineTo(fx + 110, fy + 200); g.lineTo(W + 40, ay - 200); g.lineTo(W + 40, ay); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(239,232,216,.35)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(fx - 100, fy + 150 + i * 40); g.lineTo(fx + 90, fy + 150 + i * 40); g.stroke(); }
    g.fillStyle = '#e9e1cf'; g.beginPath(); g.ellipse(fx, fy - 26, 40, 44, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(30,28,30,.5)'; g.lineWidth = 2; g.stroke(); g.restore();
    serif(g, 'fingernail covers the moon', 540, 330, { size: 62, w: 700, a: hk * seg(t, r(8, 1.8), r(8, 2.3)) }); serif(g, lowA > .5 ? 'low' : 'high', 760, my - 20, { size: 64, w: 700, a: hk }); }
  // two photos with equal widths
  const pk = seg(t, T(9) - .1, T(9) + .5);
  if (pk > 0) { g.save(); g.fillStyle = `rgba(239,232,216,${.7 * pk})`; g.fillRect(0, 0, W, H); g.restore();
    photo(290, 760, 440, 600, -.04, pk, 1000, 150); photo(790, 760, 440, 600, .04, seg(t, T(9) + .2, T(9) + .8), 760, 150);
    const mk2 = seg(t, r(9, 1.4), r(9, 2.4)); const s1 = 412 / W;
    [[290, 760 - 300 + 14 + (1000 - 560) * s1, -.04], [790, 760 - 300 + 14 + (760 - 560) * s1, .04]].forEach(([cx, cy, ro]) => { const hw = 150 * s1 + 2; brush([[cx - hw, cy + 60], [cx + hw, cy + 60]], mk2, { col: 'rgba(184,56,42,.95)', lw: 4 }); brush([[cx - hw, cy + 46], [cx - hw, cy + 74]], mk2, { col: 'rgba(184,56,42,.95)', lw: 4 }); brush([[cx + hw, cy + 46], [cx + hw, cy + 74]], mk2, { col: 'rgba(184,56,42,.95)', lw: 4 }); });
    serif(g, 'low', 290, 1120, { size: 58, w: 700, a: pk }); serif(g, 'high', 790, 1120, { size: 58, w: 700, a: pk });
    serif(g, 'same width', 540, 1260, { size: 76, w: 700, a: seg(t, r(9, 2.0), r(9, 2.6)) }); }
}]);
// D (p10-p11): an illusion made by the brain; hills and trees make it seem farther away (converging tracks, equal moons)
S.push([T(10) - .5, T(12) - .1, t => {
  const pz = ss(seg(t, T(11) - .2, T(11) + .6));
  land(t, { my: 1000, mr: lerp(250, 200, pz), o: .5, birdsA: 1 - pz, houseA: 1 - pz, moonA: 1 - pz * .9 });
  // p10: the brain inflates it: camera-size ring inside the big moon
  const ik = seg(t, r(10, .5), r(10, 1.5)) * (1 - pz);
  if (ik > 0) { g.save(); g.setLineDash([14, 12]); g.strokeStyle = 'rgba(184,56,42,.9)'; g.lineWidth = 5; g.beginPath(); g.arc(540, 1000, 120, 0, TAU * ik); g.stroke(); g.restore();
    serif(g, 'what a camera sees', 540, 680, { size: 56, w: 700, a: ik }); serif(g, 'what you feel you see', 540, 1540, { size: 56, w: 700, a: seg(t, r(10, 1.4), r(10, 2.0)) * (1 - pz) });
    column(g, ['ILLU', 'SION'], 950, 220, seg(t, r(10, .3), r(10, 1.0)) * (1 - pz), { size: 76, seal: 'brain' }); }
  // p11: Ponzo: converging tracks, two equal moons, the far one looks bigger
  if (pz > 0) { g.save(); g.globalAlpha *= pz; g.fillStyle = 'rgba(239,232,216,.9)'; g.fillRect(0, 0, W, H);
    const vx = 540, vy = 520; g.strokeStyle = ink(.85); g.lineCap = 'round';
    for (const sd of [-1, 1]) { g.lineWidth = 7; g.beginPath(); g.moveTo(vx + sd * 12, vy); g.lineTo(vx + sd * 430, 1560); g.stroke(); }
    for (let i = 0; i < 12; i++) { const u = Math.pow(i / 11, 1.8), y = lerp(vy + 20, 1540, u), hw = lerp(18, 440, u); g.lineWidth = 2 + 6 * u; g.beginPath(); g.moveTo(vx - hw, y); g.lineTo(vx + hw, y); g.stroke(); }
    for (let i = 0; i < 6; i++) { const u = i / 5, x = lerp(vx - 40, -40, u * u), y = lerp(vy + 30, 1300, u * u), s = .3 + 2.2 * u * u; g.fillStyle = ink(.8); g.beginPath(); g.moveTo(x - 20 * s, y); g.lineTo(x, y - 90 * s); g.lineTo(x + 20 * s, y); g.fill(); }
    const mk3 = seg(t, r(11, 1.2), r(11, 2.0)); moon(g, vx, 720, 90, .7, { a: mk3 }); moon(g, vx, 1250, 90, .7, { a: seg(t, r(11, 1.6), r(11, 2.4)) });
    serif(g, 'same size', 820, 1250, { size: 56, w: 700, a: seg(t, r(11, 2.6), r(11, 3.1)) }); serif(g, 'looks bigger', 820, 720, { size: 56, w: 700, a: seg(t, r(11, 3.2), r(11, 3.7)) });
    serif(g, 'farther away?', 540, 330, { size: 76, w: 700, a: seg(t, r(11, 1.2), r(11, 1.8)) });
    g.restore(); }
}]);
// E (p12-p13): astronauts see it too, with no hills; still not fully explained
function astronaut(x, y, s, t) { g.save(); g.translate(x, y + 8 * Math.sin(t * 1.2)); g.rotate(-.2 + .05 * Math.sin(t)); g.scale(s, s); g.fillStyle = '#f4efe4'; g.strokeStyle = ink(.9); g.lineWidth = 4;
  const sh = (fn) => { g.beginPath(); fn(); g.fill(); g.stroke(); };
  sh(() => g.roundRect(-38, -30, 76, 90, 20)); sh(() => g.roundRect(-58, -24, 22, 70, 10)); sh(() => g.roundRect(36, -24, 22, 70, 10)); sh(() => g.roundRect(-34, 56, 26, 60, 10)); sh(() => g.roundRect(8, 56, 26, 60, 10));
  sh(() => g.arc(0, -66, 44, 0, TAU)); g.fillStyle = ink(.85); g.beginPath(); g.ellipse(6, -66, 30, 22, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(16, -74, 8, 5, -.5, 0, TAU); g.fill(); g.restore(); }
S.push([T(12) - .5, T(14) - .1, t => {
  g.drawImage(paper(), 0, 0);
  const k = seg(t, T(12) - .4, T(12) + .6); enso(g, 540, 860, 380, k, { lw: 18, seed: 4 });
  g.save(); g.beginPath(); g.arc(540, 860, 360, 0, TAU); g.clip(); g.globalAlpha *= seg(k, .3, 1);
  g.fillStyle = 'rgba(40,40,60,.88)'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,250,235,${.4 + .5 * hash(i * 3)})`; g.fillRect(180 + hash(i) * 720, 480 + hash(i * 7) * 760, 3, 3); }
  g.fillStyle = 'rgba(150,180,205,.6)'; g.beginPath(); g.arc(540, 2050, 960, 0, TAU); g.fill(); g.fillStyle = '#d9d2c0'; g.beginPath(); g.arc(540, 2050, 920, 0, TAU); g.fill();
  for (let i = 0; i < 3000; i++) { const a = (hash(i * 1.7) - .5) * 1.2, d = hash(i * 3.3) ** 2 * 120; if (hash(i * 5.9) > Math.exp(-d / 50)) continue; g.fillStyle = ink(.5); g.fillRect(540 + Math.sin(a) * (920 - d), 2050 - Math.cos(a) * (920 - d), 2, 2); }
  moon(g, 760, 660, 80, 0); astronaut(420, 860, 1.5, t); g.restore();
  serif(g, 'no hills at all', 540, 1330, { size: 64, w: 700, a: seg(t, r(12, 2.2), r(12, 2.8)) });
  serif(g, 'astronauts see it too', 540, 380, { size: 64, w: 700, a: seg(t, r(12, .6), r(12, 1.2)) * (1 - seg(t, T(13) - .2, T(13) + .2)) });
  serif(g, 'still not fully explained', 540, 380, { size: 64, w: 700, a: seg(t, r(13, .3), r(13, .9)) }); sealMark(g, 860, 420, 50, '?', seg(t, r(13, .8), r(13, 1.2)));
}]);
// F (p14-p15): the Hunter's Moon: bare harvested fields, a traveller with a lantern, a deer far off, under the moon
function deer(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = ink(.85); g.beginPath(); g.ellipse(0, -40, 40, 16, 0, 0, TAU); g.fill();
  [[-28], [-18], [22], [32]].forEach(([lx]) => g.fillRect(lx, -30, 4, 30)); g.beginPath(); g.moveTo(30, -48); g.lineTo(46, -84); g.lineTo(56, -80); g.lineTo(44, -44); g.fill(); g.beginPath(); g.ellipse(54, -86, 12, 7, -.3, 0, TAU); g.fill();
  g.strokeStyle = ink(.85); g.lineWidth = 2.5; g.beginPath(); g.moveTo(50, -92); g.lineTo(44, -116); g.moveTo(46, -104); g.lineTo(36, -110); g.moveTo(56, -92); g.lineTo(64, -114); g.stroke(); g.restore(); }
S.push([T(14) - .5, T(16) - .1, t => {
  land(t, { my: 780, mr: 190, o: .35, fields: 1, birdsA: 0, fig: () => { const wk = seg(t, T(14), E(15)); figure(g, lerp(560, 760, wk), 1500, 1.7, { lantern: 1, t, walk: t }); deer(300, 1388, .8); } });
  serif(g, 'after the Harvest Moon', 540, 380, { size: 58, w: 700, a: seg(t, r(14, .9), r(14, 1.6)) * (1 - seg(t, T(15) - .2, T(15) + .2)) });
  column(g, ["HUNTER'S", 'MOON'], 180, 520, seg(t, r(14, 2.6), r(14, 3.4)), { size: 78, seal: 'Oct' });
  serif(g, 'fields bare', 820, 1290, { size: 54, w: 700, a: seg(t, r(15, 1.0), r(15, 1.5)) });
  serif(g, 'tracking by moonlight', 540, 300, { size: 56, w: 700, a: seg(t, r(15, 2.4), r(15, 3.0)) });
}]);
// G (p16): the end card under the pale moon
S.push([T(16) - .5, TL.total + 1, t => {
  land(t, { my: 720, mr: 170, o: .1, plumK: 1, plumY: 560, houseA: 1, fig: () => figure(g, 640, 1396, 1.2, { lantern: 1, t }) });
  serif(g, 'Follow for more of', 540, 250, { size: 74, w: 600, reveal: seg(t, r(16, .05), r(16, .8)) });
  serif(g, 'how it really works.', 540, 350, { size: 84, w: 700, reveal: seg(t, r(16, .5), r(16, 1.3)) }); sealMark(g, 920, 400, 50, 'moon', seg(t, r(16, 1.2), r(16, 1.6)));
}]);

function scene(t) {
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .5, b, .5); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
}
function sub(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start, a = seg(t, p.start - .05, p.start + .15) * (1 - seg(t, nx - .25, nx - .05));
  subtitle(g, p.cap, a, 1660);
}
const CUES = [['chime', .3, 72], ['whoosh', r(1, 1.4)], ['pageturn', r(2, .9)], ['pageturn', r(2, 2.0)], ['whoosh', T(3) - .4], ['scribble', r(3, 1.6), r(3, 3.2)], ['scribble', r(4, .5), r(4, 2.0)],
  ['sparkle', r(5, .3)], ['chime', r(6, .2), 76], ['whoosh', r(7, .3)], ['whoosh', T(8) - .4], ['pop', r(8, 1.0)], ['slide', T(9)], ['scribble', r(9, 1.4), r(9, 2.4)], ['whoosh', T(10) - .4], ['scribble', r(10, .5), r(10, 1.5)],
  ['whoosh', T(11) - .2], ['pop', r(11, 1.2)], ['pop', r(11, 1.6)], ['whoosh', T(12) - .4], ['chime', r(12, 2.2), 79], ['pop', r(13, .8)], ['whoosh', T(14) - .4], ['chime', r(14, 2.6), 74], ['whoosh', T(16) - .4], ['chime', r(16, 1.2), 81]];
window.CUES = CUES; window.DUR = TL.total;
window.seek = t => { scene(t); sub(t); };
window.thumb = () => { const t = 4; land(t, { my: 860, mr: 280, o: 1, plumK: 1, plumY: 760, birdsA: 0 });
  serif(g, 'WHY SO HUGE', 540, 400, { size: 118, w: 700, ls: 4 }); serif(g, '& ORANGE?', 540, 540, { size: 118, w: 700, ls: 4 }); sealMark(g, 880, 610, 64, 'moon'); };
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
