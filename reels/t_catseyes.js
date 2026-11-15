// t_catseyes.js: why cats' eyes glow in the dark. Template #21 Storybook paint (demo t21).
// Opens on the sketchbook page on the desk (pencil, handwritten title), pushes into the painting, white constellation-line
// light-ray diagrams on a night sky, coloured-pencil characters, glow halos with rays, and ends back on the sketchbook page.
import { createSB, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, mk, INK, PAL, finish, blob, circPts, paint, P2, skyBands, hill, stars, glow, rays,
  moonP, constLine, hand, arrowP, kid, cat, PAGE, book, pencil, subtitle } from './styles/storybook/storybook.js';
await document.fonts.load('700 60px Caveat');
const g = createSB(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .5) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const GREEN = '170,255,140';

// ---------------- baked backdrops ----------------
function bake(fn) { const c = mk(W, H), x = c.getContext('2d'); fn(x); return c; }
const NIGHT = ['#1b2046', '#20275a', '#283068', '#303a76', '#394585'];
const GARDEN = bake(x => {
  skyBands(x, NIGHT, 0, 1150, 12, 2); moonP(x, 830, 330, 70);
  hill(x, 1120, 60, '#3d5a66', { freq: 1.4, ph: .4, seed: 2, tufts: 0 });
  // tree at the left
  paint(x, P2(p => { p.moveTo(150, 1200); p.bezierCurveTo(140, 1000, 170, 860, 160, 760); p.lineTo(190, 760); p.bezierCurveTo(200, 860, 186, 1000, 196, 1200); p.closePath(); }), '#5a4652', { hatch: .2 });
  paint(x, P2(p => blob(p, circPts(170, 680, 150, 120, 20), 18, 5)), '#2f5a58', { hatch: .2 });
  hill(x, 1270, 40, '#30505a', { freq: 2, ph: 1, seed: 5, tufts: 14, tuftCol: '#203a3a' });
  // stone wall the cat sits on
  paint(x, P2(p => blob(p, [[300, 1190], [600, 1180], [920, 1192], [930, 1330], [600, 1340], [292, 1328]], 4, 8)), '#7c7390', { hatch: .22 });
  x.strokeStyle = INK; x.lineWidth = 2; for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const bx = 300 + i * 105 + (row % 2) * 50; x.strokeRect(bx + 4, 1196 + row * 45, 96, 40); }
  hill(x, 1450, 30, '#294545', { freq: 1, ph: 2, seed: 7, tufts: 22, tuftCol: '#1c3333' });
  [[150, 1560, 1], [930, 1520, .8]].forEach(([px, py, s]) => { paint(x, P2(p => blob(p, circPts(px, py, 80 * s, 62 * s, 16), 4, px)), '#e0843c', { hatch: .25 });
    x.strokeStyle = 'rgba(90,40,20,.6)'; x.lineWidth = 2; for (const o of [-.4, 0, .4]) { x.beginPath(); x.ellipse(px + o * 60 * s, py, 20 * s, 60 * s, 0, 0, TAU); x.stroke(); }
    paint(x, P2(p => p.rect(px - 7, py - 80 * s, 14, 24)), '#5b7a3a', { hatch: 0 }); });
});
const DIA = bake(x => { skyBands(x, ['#171b3e', '#1c2250', '#222a5e', '#29336c', '#2f3b78'], 0, H, 10, 7); hill(x, 1520, 40, '#26405a', { freq: 1.2, seed: 3, tufts: 12, tuftCol: '#1a3048' }); });
function lanterns(t) { [[150, 1560, 1], [930, 1520, .8]].forEach(([px, py, s], i) => { const f = .8 + .2 * Math.sin(t * 7 + i * 2) * Math.sin(t * 3.1);
  g.fillStyle = `rgba(255,210,110,${f})`; g.beginPath(); g.moveTo(px - 36 * s, py - 18 * s); g.lineTo(px - 14 * s, py - 18 * s); g.lineTo(px - 25 * s, py - 38 * s); g.fill();
  g.beginPath(); g.moveTo(px + 14 * s, py - 18 * s); g.lineTo(px + 36 * s, py - 18 * s); g.lineTo(px + 25 * s, py - 38 * s); g.fill();
  g.beginPath(); g.ellipse(px, py + 20 * s, 34 * s, 12 * s, 0, 0, Math.PI); g.fill(); glow(g, px, py, 150 * s, '255,190,90', .45 * f); }); }

// ---------------- props ----------------
function phone(x, y, s, ang, { flash = 0, back = true, screen = null } = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  paint(g, P2(p => p.roundRect(-44, -80, 88, 160, 16)), back ? '#b9a5d6' : '#2a2a3a', { hatch: .18, lw: 2.4 });
  if (back) { paint(g, P2(p => p.arc(-14, -54, 13, 0, TAU)), '#2b2b3a', { hatch: 0, lw: 2 }); g.fillStyle = '#6a7aa8'; g.beginPath(); g.arc(-14, -54, 5, 0, TAU); g.fill();
    paint(g, P2(p => p.arc(16, -54, 8, 0, TAU)), flash > .1 ? '#fffbe8' : '#e8e0c8', { hatch: 0, lw: 2 });
    if (flash > 0) { glow(g, 16, -54, 260 * flash, '255,255,240', flash); rays(g, 16, -54, 300 * flash, 0, '255,255,240', .5 * flash, 12); } }
  else if (screen) { g.save(); g.beginPath(); g.roundRect(-38, -72, 76, 144, 10); g.clip(); screen(); g.restore(); }
  g.restore();
}
function polaroid(x, y, w, h, rot, k, fn) {
  if (k <= 0) return; g.save(); g.translate(x, y + (1 - eo(k)) * 60); g.rotate(rot); g.globalAlpha *= clamp(k * 2);
  g.shadowColor = 'rgba(20,10,10,.4)'; g.shadowBlur = 16; g.shadowOffsetY = 8; g.fillStyle = '#fbf7ee'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.save(); g.beginPath(); g.rect(-w / 2 + 16, -h / 2 + 16, w - 32, w - 32); g.clip(); fn(-w / 2 + 16, -h / 2 + 16, w - 32); g.restore();
  g.strokeStyle = 'rgba(60,50,60,.3)'; g.strokeRect(-w / 2 + 16, -h / 2 + 16, w - 32, w - 32);
  g.fillStyle = 'rgba(230,210,150,.7)'; g.fillRect(-40, -h / 2 - 14, 80, 28); g.restore();
}
function catFace(x0, y0, s, eyeA, eyeCol = GREEN) { g.fillStyle = '#20264e'; g.fillRect(x0, y0, s, s); g.save(); g.translate(x0 + s / 2, y0 + s * 1.15); cat(g, 0, 0, s / 180, 0, { e: eyeA, eyeCol }); g.restore(); }
function kidFace(x0, y0, s, red) { g.fillStyle = '#e8dcc6'; g.fillRect(x0, y0, s, s); kid(g, x0 + s / 2, y0 + s * 1.62, s / 120, { red, body: '#8fb3d9', scarf: '#d9655a' }); }

// ---------------- the eye diagram (cross-section, light enters from the left) ----------------
const EC = [600, 900], ER = 400;
const onArc = (a, rad) => [EC[0] + Math.cos(a) * rad, EC[1] + Math.sin(a) * rad];
function eyeDiagram(t, { cells = 1, tap = 0, human = 0, glint = 0, lit = [] } = {}) {
  const [cx, cy] = EC;
  paint(g, P2(p => blob(p, circPts(cx, cy, ER, ER, 30), 3, 11)), '#f4ecdc', { hatch: .14, lw: 3 });
  paint(g, P2(p => { p.moveTo(cx - ER + 30, cy - 150); p.bezierCurveTo(cx - ER - 90, cy - 80, cx - ER - 90, cy + 80, cx - ER + 30, cy + 150); }), 'rgba(190,220,240,.5)', { hatch: 0, lw: 2.4 });
  // back layer: human = blood-rich red, cat = dark with the mirror in front of it
  const back = P2(p => { p.arc(cx, cy, ER - 4, -1.15, 1.15); p.arc(cx, cy, ER - 30, 1.15, -1.15, true); p.closePath(); });
  paint(g, back, human ? '#c2453c' : '#4a3a52', { hatch: .2, lw: 2 });
  if (human) { g.save(); g.strokeStyle = 'rgba(120,20,20,.8)'; g.lineWidth = 2.5; for (let i = 0; i < 9; i++) { const a = -1 + i * .25; const [x1, y1] = onArc(a, ER - 12), [x2, y2] = onArc(a + .12, ER - 22); g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(x1 - 8, (y1 + y2) / 2 + 8, x2, y2); g.stroke(); } g.restore(); }
  if (tap > 0) { const a1 = -1.1 + 2.2 * ss(tap);
    const tp = P2(p => { p.arc(cx, cy, ER - 6, -1.1, a1); p.arc(cx, cy, ER - 28, a1, -1.1, true); p.closePath(); });
    g.save(); const gr = g.createLinearGradient(cx + ER - 40, cy - ER, cx + ER, cy + ER); gr.addColorStop(0, '#9fe8c0'); gr.addColorStop(.5, '#f3e48a'); gr.addColorStop(1, '#8fd0f0'); paint(g, tp, gr, { hatch: .25, lw: 2.4, hcol: 'rgba(255,255,255,1)' }); g.restore();
    if (glint > 0) { const ga = lerp(-1.1, 1.1, glint); const [gx, gy] = onArc(ga, ER - 17); glow(g, gx, gy, 90, '255,255,240', .9 * Math.sin(glint * Math.PI)); } }
  // retina cells
  for (let i = 0; i < 15; i++) { const a = -1.0 + i * (2.0 / 14), [x, y] = onArc(a, ER - 52), k = clamp(cells * 3 - i * .12);
    if (k <= 0) continue; g.save(); g.translate(x, y); g.rotate(a); const l = lit.includes(i) ? 1 : 0;
    paint(g, P2(p => p.roundRect(-20, -8, 40, 16, 8)), l ? '#ffe27a' : '#d8a35a', { hatch: .1, lw: 2 }); if (l) glow(g, 0, 0, 60, '255,230,120', .7);
    g.restore(); }
  // iris + pupil + lens
  paint(g, P2(p => p.roundRect(cx - ER + 40, cy - 200, 26, 150, 10)), human ? '#7a5a3a' : '#c9b44a', { hatch: .2 });
  paint(g, P2(p => p.roundRect(cx - ER + 40, cy + 50, 26, 150, 10)), human ? '#7a5a3a' : '#c9b44a', { hatch: .2 });
  paint(g, P2(p => blob(p, circPts(cx - ER + 130, cy, 46, 104, 16), 2, 4)), 'rgba(200,230,245,.75)', { hatch: .1, lw: 2.4 });
}
// a light ray: from far left, through the pupil and lens, to a point on the retina arc (angle a), optionally past it and back
const rayPts = (y0, a, rad = ER - 52) => [[-40, y0], [EC[0] - ER + 50, EC[1] + (y0 - EC[1]) * .25], [EC[0] - ER + 130, EC[1] + (y0 - EC[1]) * .12], onArc(a, rad)];

// ---------------- scenes ----------------
const S = [];
// A (p0-p2): the sketchbook page already painted: cat on a wall, eyes flaring at each phone flash; polaroids: glow vs red
function gardenWorld(t, { flashT = [], eye = null, kidOn = 1, phoneUp = 1, cs = 2.1 } = {}) {
  g.drawImage(GARDEN, 0, 0); stars(g, 50, t, { y1: 1000 }); lanterns(t);
  let fl = 0; for (const ft of flashT) fl = Math.max(fl, Math.exp(-Math.max(0, t - ft) * 5) * (t >= ft ? 1 : 0));
  const e = eye !== null ? eye : .15 + .85 * fl;
  cat(g, 620, 1190, cs, t, { e, blink: (t % 4.3) > 4.15 ? 1 : 0 });
  if (kidOn > 0) { const up = phoneUp; kid(g, 230, 1520, 2.2, { body: '#8fb3d9', scarf: '#d9655a', arm2: lerp(-.3, -2.15, up), arm: .25, look: 3 });
    const sx = 230 + 26 * 2.2, sy = 1520 - 110 * 2.2, an = lerp(-.3, -2.15, up), hx = sx - Math.sin(an) * 52 * 2.2, hy = sy + Math.cos(an) * 52 * 2.2;
    phone(hx + 10, hy - 20, 1.1, .5, { flash: fl * up }); }
  if (fl > .05) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,245,${.22 * fl})`; g.fillRect(0, 0, W, H); g.restore(); }
  return fl;
}
S.push([0, T(3), t => {
  const z = lerp(1, 1.22, ss(seg(t, r(1, .2), E(2) + .4))), cx = lerp(540, 560, ss(seg(t, T(1), E(2)))), cy = lerp(900, 980, ss(seg(t, T(1), E(2))));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy);
  book(g); const { x, y, w, h } = PAGE;
  g.save(); g.beginPath(); g.rect(x + 40, y + 260, w - 80, h - 300); g.clip();
  g.translate(x + 40, y + 260); g.scale((w - 80) / W, (w - 80) / W); g.translate(0, -300);
  gardenWorld(t, { flashT: [.25, 1.5, 2.5], eye: t > T(1) + .6 ? lerp(.15, 0, seg(t, T(1) + .6, T(1) + 1.2)) + .35 * ss(seg(t, T(2), E(2))) : null, phoneUp: 1 - ss(seg(t, T(1) + .3, T(1) + 1.1)), cs: 2.9 });
  if (t > T(2) - .2) constLine(g, [[470, 520], [500, 440], [580, 410], [650, 450], [660, 520], [600, 580], [560, 640], [560, 700]], seg(t, T(2) - .1, T(2) + 1.1));
  if (t > T(2) + .9) { g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(560, 770, 9, 0, TAU); g.fill(); glow(g, 560, 770, 40, '255,250,230', .6); }
  g.restore();
  g.strokeStyle = 'rgba(60,40,30,.35)'; g.lineWidth = 2; g.strokeRect(x + 40, y + 260, w - 80, h - 300);
  hand(g, 'WHY CAT EYES GLOW', 540, y + 150, 1, { size: 96 }); hand(g, '?', 900, y + 150, seg(t, .1, .4), { size: 110, col: '#c4543f' });
  polaroid(330, y + 520, 300, 350, -.08, seg(t, r(0, 1.0), r(0, 1.5)) * (1 - seg(t, E(1) - .3, E(1) + .2)), (x0, y0, s) => catFace(x0, y0, s, 1));
  polaroid(760, y + 540, 300, 350, .07, seg(t, r(0, 2.6), r(0, 3.1)) * (1 - seg(t, E(1) - .3, E(1) + .2)), (x0, y0, s) => kidFace(x0, y0, s, 1));
  hand(g, 'cat', 330, y + 650, seg(t, r(0, 1.4), r(0, 1.8)) * (1 - seg(t, E(1) - .3, E(1) + .2)), { size: 72 }); hand(g, 'you', 760, y + 670, seg(t, r(0, 3.0), r(0, 3.4)) * (1 - seg(t, E(1) - .3, E(1) + .2)), { size: 72 });
  pencil(g, 930 + 14 * Math.sin(t * 3), 1500 + 8 * Math.cos(t * 4), -.8);
  g.restore();
}]);
// B (p3-p8): the eye diagram: rays as white constellation lines; cells, slip past, the tapetum mirror, second chance
S.push([T(3) - .5, T(8) + .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 9, a: .7 });
  const zin = 1 - ss(seg(t, T(3) - .5, T(3) + .4)); g.save(); g.translate(W / 2, H / 2); g.scale(lerp(1, .6, zin), lerp(1, .6, zin)); g.translate(-W / 2, -H / 2);
  const tap = seg(t, r(5, 1.6), r(5, 3.2)), lit1 = t > r(3, 2.0) ? [3, 7, 11] : [], lit2 = t > r(7, 2.0) ? [5, 9] : [];
  eyeDiagram(t, { cells: seg(t, r(3, 1.0), r(3, 2.4)), tap, glint: seg(t, r(6, .1), r(6, 1.0)), lit: [...lit1, ...lit2] });
  const dim = seg(t, T(4), r(4, .6));
  // p3: three rays land on cells
  [[760, -0.71], [900, 0], [1040, .71]].forEach(([y0, a], i) => constLine(g, rayPts(y0, a), seg(t, r(3, .9 + i * .2), r(3, 2.0 + i * .2)), { col: `rgba(255,250,235,${lerp(.92, .55, dim)})` }));
  // p4: two rays slip between cells, into the back
  [[830, -0.43], [970, .43]].forEach(([y0, a], i) => { const k = seg(t, r(4, .3 + i * .3), r(4, 1.6 + i * .3)); if (k <= 0) return;
    const pts = [...rayPts(y0, a, ER - 18)]; constLine(g, pts, k, { dash: tap > 0 ? null : [10, 10] });
    if (t > r(7, .2)) { const [bx, by] = onArc(a, ER - 18), [cx2, cy2] = onArc(a + (i ? .14 : -.14), ER - 52); constLine(g, [[bx, by], [cx2, cy2], [EC[0] - ER + 130, EC[1] + (i ? 30 : -30)], [-40, y0 + (i ? 90 : -90)]], seg(t, r(7, .3 + i * .2), r(7, 2.6 + i * .2)), { col: 'rgba(200,255,190,.95)' }); } });
  g.restore();
  // little cat head = whose eye
  g.save(); g.translate(170, 400); cat(g, 0, 0, 1.3, t, { e: tap > 0 ? .6 : 0 }); g.restore(); hand(g, "a cat's eye", 170, 470, seg(t, T(3), r(3, .6)), { size: 62, col: '#f6efe0' });
  hand(g, 'light-sensing cells', 720, 330, seg(t, r(3, 1.6), r(3, 2.6)) * (1 - seg(t, T(5) - .3, T(5))), { size: 72, col: '#f6efe0' }); arrowP(g, 860, 370, 900, 560, seg(t, r(3, 2.3), r(3, 2.9)) * (1 - seg(t, T(5) - .3, T(5))), '#f6efe0');
  hand(g, 'slips past!', 720, 1440, seg(t, r(4, 1.2), r(4, 1.9)) * (1 - seg(t, T(5) - .3, T(5))), { size: 78, col: '#ffd86a' });
  hand(g, 'tapetum lucidum', 640, 330, seg(t, r(5, 2.4), r(5, 3.4)), { size: 86, col: '#f6efe0' }); arrowP(g, 850, 380, 950, 600, seg(t, r(5, 3.0), r(5, 3.6)), '#f6efe0');
  hand(g, '= a mirror', 700, 1440, seg(t, r(6, .1), r(6, .8)), { size: 86, col: '#ffd86a' });
  hand(g, '2nd chance!', 340, 1580, seg(t, r(7, 1.6), r(7, 2.4)), { size: 86, col: '#b8f0a0' });
}]);
// D (p8-p9): night garden; two round "views": yours (dark) vs the cat's (brighter), which then goes a little blurry
const VIEW = bake(x => { x.drawImage(GARDEN, 0, 0); });
function viewDisc(cx, cy, rad, filt, label, k) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); const s = backOut(k);
  g.translate(cx, cy); g.scale(s, s); g.beginPath(); g.arc(0, 0, rad, 0, TAU); g.save(); g.clip(); g.filter = filt; g.drawImage(VIEW, 260, 900, 760, 760, -rad, -rad, rad * 2, rad * 2); g.filter = 'none'; g.restore();
  g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.restore(); hand(g, label, cx, cy + rad + 50, k, { size: 72, col: '#f6efe0' }); }
S.push([T(8) - .4, T(10) - .1, t => {
  g.drawImage(GARDEN, 0, 0); stars(g, 50, t, { y1: 1000 }); lanterns(t);
  g.save(); g.globalAlpha = .55; g.fillStyle = '#0d1030'; g.fillRect(0, 0, W, H); g.restore();
  cat(g, 620, 1190, 2.1, t, { e: .35 });
  const bl = seg(t, r(9, .8), r(9, 1.8));
  viewDisc(290, 620, 210, 'brightness(.32)', 'your view', seg(t, r(8, .2), r(8, .8)));
  viewDisc(790, 620, 210, `brightness(1.25) blur(${(bl * 5).toFixed(1)}px)`, "cat's view", seg(t, r(8, .7), r(8, 1.3)));
  hand(g, 'a little blurry', 790, 960, seg(t, r(9, 1.6), r(9, 2.3)), { size: 75, col: '#ffd86a' });
}]);
// E (p10-p12): the phone: flash right beside the lens; ray out to the cat's eye and straight back; the photo
S.push([T(10) - .4, T(13) - .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 4, a: .7 });
  const wide = ss(seg(t, r(11, -.2), r(11, .6)));
  // phone close-up -> wide diagram
  const px = lerp(540, 230, wide), py = lerp(900, 1380, wide), ps = lerp(5.2, 1.6, wide);
  const fl = t > r(11, .4) ? Math.exp(-(t - r(11, .4)) * 1.2) : 0;
  if (wide > 0) { g.save(); g.globalAlpha = wide; cat(g, 790, 900, 2.0, t, { e: clamp(seg(t, r(11, 1.6), r(11, 2.4)) * 1.1), tail: 1 }); g.restore(); }
  phone(px, py, ps, 0, { flash: fl * .8 });
  hand(g, 'flash', 760, 420, seg(t, r(10, 2.2), r(10, 2.8)) * (1 - wide), { size: 94, col: '#f6efe0' }); arrowP(g, 700, 450, 640, 560, seg(t, r(10, 2.5), r(10, 3.0)) * (1 - wide), '#f6efe0');
  hand(g, 'lens', 300, 420, seg(t, r(10, 3.0), r(10, 3.5)) * (1 - wide), { size: 94, col: '#f6efe0' }); arrowP(g, 340, 450, 430, 560, seg(t, r(10, 3.2), r(10, 3.7)) * (1 - wide), '#f6efe0');
  if (wide > .5) { const fx = 230 + 16 * 1.6, fy = 1380 - 54 * 1.6, lx = 230 - 14 * 1.6, ly = fy, ex = 790 + 19 * 2, ey = 900 - 166 * 2;
    constLine(g, [[fx, fy], [ex, ey]], seg(t, r(11, .5), r(11, 1.6)), { col: 'rgba(255,255,240,.95)' });
    constLine(g, [[ex - 10, ey + 6], [lx, ly]], seg(t, r(11, 1.8), r(11, 3.0)), { col: 'rgba(200,255,180,.95)' });
    hand(g, 'out', 440, 1000, seg(t, r(11, .9), r(11, 1.3)), { size: 72, col: '#f6efe0' }); hand(g, 'straight back', 330, 1170, seg(t, r(11, 2.4), r(11, 3.0)), { size: 72, col: '#b8f0a0' }); }
  // p12: the photo on screen
  polaroid(540, 520, 420, 480, -.04, seg(t, T(12) - .1, T(12) + .4), (x0, y0, s) => catFace(x0, y0, s, 1));
}]);
// F (p13-p14): people have no mirror: a human eye, the red back layer, the red-eye photo
S.push([T(13) - .4, T(15) - .1, t => {
  g.drawImage(DIA, 0, 0); stars(g, 60, t, { y1: H, seed: 12, a: .7 });
  const zin = 1 - ss(seg(t, T(13) - .4, T(13) + .4)); g.save(); g.translate(W / 2, H / 2); g.scale(lerp(1, .7, zin), lerp(1, .7, zin)); g.translate(-W / 2, -H / 2);
  eyeDiagram(t, { cells: 1, human: 1 });
  const k1 = seg(t, r(14, .2), r(14, 1.8)), k2 = seg(t, r(14, 2.0), r(14, 3.2));
  constLine(g, rayPts(860, -.2, ER - 18), k1); if (k2 > 0) constLine(g, [onArc(-.2, ER - 18), [EC[0] - ER + 130, EC[1] + 40], [-40, 980]], k2, { col: 'rgba(255,140,120,.95)' });
  if (k2 > .9) glow(g, ...onArc(-.2, ER - 18), 120, '255,80,60', .8);
  g.restore();
  g.save(); g.translate(170, 420); kid(g, 0, 0, 1.3, { body: '#8fb3d9', scarf: '#d9655a' }); g.restore(); hand(g, 'your eye', 170, 470, seg(t, T(13), r(13, .5)), { size: 62, col: '#f6efe0' });
  hand(g, 'no mirror', 560, 330, seg(t, r(13, .4), r(13, 1.1)), { size: 86, col: '#f6efe0' });
  hand(g, 'blood-rich layer', 640, 1440, seg(t, r(14, 1.2), r(14, 2.0)), { size: 78, col: '#ffb0a0' }); arrowP(g, 800, 1400, 920, 1150, seg(t, r(14, 1.6), r(14, 2.2)), '#ffb0a0');
  polaroid(880, 330, 250, 290, .06, seg(t, r(14, 3.4), r(14, 3.9)), (x0, y0, s) => kidFace(x0, y0, s, 1));
}]);
// G (p15): kittens blue, grown cats yellow to green
S.push([T(15) - .4, T(16) - .1, t => {
  g.drawImage(GARDEN, 0, 0); stars(g, 50, t, { y1: 1000 }); lanterns(t);
  g.save(); g.globalAlpha = .35; g.fillStyle = '#0d1030'; g.fillRect(0, 0, W, H); g.restore();
  const e1 = seg(t, r(15, .6), r(15, 1.2)), e2 = seg(t, r(15, 2.6), r(15, 3.2)), e3 = seg(t, r(15, 3.2), r(15, 3.8));
  cat(g, 300, 1200, 1.4, t, { e: e1, eyeCol: '140,190,255', kitten: true, col: '#c9b8a8' });
  cat(g, 600, 1190, 1.9, t, { e: e2, eyeCol: '255,220,90', col: '#5b5f73', tail: 2 });
  cat(g, 870, 1200, 1.8, t, { e: e3, eyeCol: GREEN, col: '#3a3a48', tail: 4 });
  hand(g, 'kitten: blue', 300, 1420, seg(t, r(15, .8), r(15, 1.4)), { size: 72, col: '#bcd6ff' });
  hand(g, 'yellow', 600, 1430, seg(t, r(15, 2.8), r(15, 3.2)), { size: 72, col: '#ffe08a' }); hand(g, 'green', 870, 1430, seg(t, r(15, 3.4), r(15, 3.8)), { size: 72, col: '#c8ffb0' });
}]);
// H (p16): other night animals with the same mirror: dog, owl, spider, all glowing in the Halloween garden
function dog(x, y, s, e) { g.save(); g.translate(x, y); g.scale(s, s); const col = '#a5785a';
  paint(g, P2(p => blob(p, [[-60, 0], [-64, -70], [-30, -120], [30, -120], [64, -70], [60, 0]], 3, 2)), col, { hatch: .2 });
  paint(g, P2(p => blob(p, circPts(0, -170, 58, 52, 16), 2, 3)), col, { hatch: .2 });
  for (const sd of [-1, 1]) paint(g, P2(p => blob(p, [[sd * 40, -210], [sd * 76, -180], [sd * 70, -120], [sd * 50, -150]], 2, sd + 5)), '#7a543c', { hatch: .2 });
  paint(g, P2(p => blob(p, circPts(0, -146, 26, 18, 10), 1, 8)), '#e8cdb0', { hatch: 0 }); g.fillStyle = INK; g.beginPath(); g.ellipse(0, -156, 9, 6, 0, 0, TAU); g.fill();
  for (const sd of [-1, 1]) { glow(g, sd * 22, -184, 60 * e + 10, '255,240,150', e); g.fillStyle = e > .05 ? '#fff4b0' : INK; g.beginPath(); g.arc(sd * 22, -184, 8, 0, TAU); g.fill(); } g.restore(); }
function owl(x, y, s, e) { g.save(); g.translate(x, y); g.scale(s, s);
  paint(g, P2(p => blob(p, [[-50, 0], [-58, -80], [-44, -130], [-30, -150], [0, -130], [30, -150], [44, -130], [58, -80], [50, 0]], 2, 4)), '#8a7360', { hatch: .22 });
  for (const sd of [-1, 1]) { paint(g, P2(p => p.arc(sd * 22, -96, 20, 0, TAU)), '#efe3c8', { hatch: 0, lw: 2 }); glow(g, sd * 22, -96, 70 * e + 10, '255,200,90', e); g.fillStyle = e > .05 ? '#ffd36a' : INK; g.beginPath(); g.arc(sd * 22, -96, 9, 0, TAU); g.fill(); }
  g.fillStyle = '#d9a040'; g.beginPath(); g.moveTo(-6, -80); g.lineTo(6, -80); g.lineTo(0, -66); g.fill(); g.restore(); }
function spider(x, y, s, e, t) { g.save(); g.strokeStyle = 'rgba(240,240,255,.6)'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 170 * s, y + Math.sin(a) * 170 * s); g.stroke(); }
  for (let k = 1; k <= 4; k++) { g.beginPath(); for (let i = 0; i <= 8; i++) { const a = i * TAU / 8, rr = k * 40 * s; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.stroke(); } g.restore();
  g.save(); g.translate(x, y + 4 * Math.sin(t * 2)); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 4; for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(sd * 40, -20 + i * 14, sd * 56, 10 + i * 12); g.stroke(); }
  paint(g, P2(p => blob(p, circPts(0, 0, 26, 30, 10), 1, 2)), '#3a3040', { hatch: 0 }); for (const sd of [-1, 1]) { glow(g, sd * 8, -12, 30 * e + 4, '200,255,220', e); g.fillStyle = e > .05 ? '#e0fff0' : '#777'; g.beginPath(); g.arc(sd * 8, -12, 4, 0, TAU); g.fill(); } g.restore(); }
S.push([T(16) - .4, T(17) - .1, t => {
  g.drawImage(GARDEN, 0, 0); stars(g, 50, t, { y1: 1000 }); lanterns(t);
  g.save(); g.globalAlpha = .45; g.fillStyle = '#0d1030'; g.fillRect(0, 0, W, H); g.restore();
  const ed = seg(t, r(16, 2.4), r(16, 2.9)), eo2 = seg(t, r(16, 3.0), r(16, 3.5)), es = seg(t, r(16, 3.8), r(16, 4.3));
  owl(190, 640, 1.3, eo2); spider(820, 520, 1.0, es, t); dog(600, 1250, 1.8, ed);
  hand(g, 'dog', 600, 1330, seg(t, r(16, 2.4), r(16, 2.8)), { size: 75, col: '#ffe9a8' }); hand(g, 'owl', 190, 720, seg(t, r(16, 3.0), r(16, 3.4)), { size: 75, col: '#ffe9a8' }); hand(g, 'spider', 820, 740, seg(t, r(16, 3.8), r(16, 4.2)), { size: 75, col: '#ffe9a8' });
}]);
// I (p17-p18): pull back out to the sketchbook page; all the eyes glow; the follow line is handwritten on the page
S.push([T(17) - .4, TL.total + 1, t => {
  const z = lerp(1.25, 1, ss(seg(t, T(17) - .4, r(17, 2.0))));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2 - 60 * (z - 1) * 3);
  book(g); const { x, y, w, h } = PAGE;
  g.save(); g.beginPath(); g.rect(x + 40, y + 260, w - 80, h - 640); g.clip(); g.translate(x + 40, y + 260); g.scale((w - 80) / W, (w - 80) / W); g.translate(0, -400);
  g.drawImage(GARDEN, 0, 0); stars(g, 50, t, { y1: 1000 }); lanterns(t);
  owl(190, 640, 1.3, 1); cat(g, 470, 1190, 1.7, t, { e: 1 }); cat(g, 780, 1200, 1.3, t, { e: 1, eyeCol: '140,190,255', kitten: true, col: '#c9b8a8' }); g.restore();
  g.strokeStyle = 'rgba(60,40,30,.35)'; g.lineWidth = 2; g.strokeRect(x + 40, y + 260, w - 80, h - 640);
  hand(g, 'a mirror for the night', 540, y + 150, seg(t, T(17) + .3, r(17, 1.6)) * (1 - seg(t, T(18) - .2, T(18) + .2)), { size: 102 });
  const k1 = seg(t, r(18, .05), r(18, .9)), k2 = seg(t, r(18, .7), r(18, 1.7));
  hand(g, 'Follow for more of', 540, y + 1215, k1, { size: 80 }); const pe = hand(g, 'how it really works.', 540, y + 1335, k2, { size: 92, col: '#c4543f' }) || [540 + 300, y + 1210];
  const [qx, qy] = k2 > 0 ? pe : [lerp(700, 760, k1), y + 1100];
  const park = ss(seg(t, r(18, 1.75), r(18, 2.3))), wig = 1 - park;
  pencil(g, lerp(qx + 6 * Math.sin(t * 20) * wig, 960, park), lerp(qy + 4 + 5 * Math.cos(t * 17) * wig, 1590, park), lerp(-.8, -.6, park));
  g.restore();
}]);

function scene(t) {
  g.fillStyle = PAL.night0; g.fillRect(0, 0, W, H);
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .5, b, .5); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  finish(g, { t });
}
function sub(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start, a = seg(t, p.start - .05, p.start + .15) * (1 - seg(t, nx - .25, nx - .05));
  subtitle(g, p.cap, a, 1650);
}
const CUES = [['sparkle', .25], ['sparkle', 1.5], ['sparkle', 2.5], ['pop', r(0, 1.0)], ['pop', r(0, 2.6)], ['whoosh', T(1) + .2], ['scribble', T(2), T(2) + 1.1],
  ['whoosh', T(3) - .4], ['scribble', r(3, .9), r(3, 2.2)], ['pop', r(3, 2.0)], ['scribble', r(4, .3), r(4, 1.8)], ['scribble', r(5, 1.6), r(5, 3.2)], ['chime', r(6, .2), 88], ['scribble', r(7, .3), r(7, 2.6)], ['pop', r(7, 2.0)],
  ['whoosh', T(8) - .4], ['pop', r(8, .3)], ['pop', r(8, .8)], ['whoosh', T(10) - .4], ['pop', r(10, 2.3)], ['pop', r(10, 3.1)], ['sparkle', r(11, .4)], ['scribble', r(11, .5), r(11, 3.0)], ['chime', T(12), 84],
  ['whoosh', T(13) - .4], ['scribble', r(14, .2), r(14, 3.2)], ['pop', r(14, 3.4)], ['whoosh', T(15) - .4], ['chime', r(15, .6), 79], ['chime', r(15, 2.6), 83], ['chime', r(15, 3.2), 86],
  ['whoosh', T(16) - .4], ['pop', r(16, 2.4)], ['pop', r(16, 3.0)], ['pop', r(16, 3.8)], ['pageturn', T(17) - .3], ['scribble', r(18, .05), r(18, 1.7)]];
window.CUES = CUES; window.DUR = TL.total;
window.seek = t => { scene(t); sub(t); };
window.thumb = () => {
  const t = 3; g.drawImage(GARDEN, 0, 0); stars(g, 50, t, { y1: 1000 }); lanterns(t);
  g.save(); g.translate(W / 2, 1000); g.scale(1.5, 1.5); g.translate(-620, -1000); cat(g, 620, 1190, 2.1, t, { e: 1 }); g.restore();
  g.save(); g.fillStyle = 'rgba(246,239,224,.92)'; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.beginPath(); g.roundRect(110, 1240, 860, 330, 20); g.fill(); g.restore();
  hand(g, 'WHY CAT EYES', 540, 1330, 1, { size: 120 }); hand(g, 'GLOW', 540, 1470, 1, { size: 150, col: '#c4543f' });
  finish(g, { t });
};
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
