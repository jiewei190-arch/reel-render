// t_tidesmoon.js: "How does the Moon cause tides?" (EP 100) in template #25 Ink moon (demo t25), same kit as harvestmoon.
// The demo's grammar: cream rice paper, a single brush line that becomes stippled ink peaks over drifting mist, a pale full moon with a
// warm halo and blue haze, a plum branch with red blossoms, tiny flying birds, a small house and a traveller with a lantern, ripples,
// rough ensō brush circles framing insets, vertical title columns with a vermilion seal, quiet centred serif subtitles.
// Here the ensō circle becomes the Earth, a pale ink wash around it becomes the ocean with its two bulges, the kit's moon is the Moon,
// a vermilion sun joins for spring and neap tides, and the landscape's water climbs the shore twice a day. The plum blossoms carry the
// "spring tide has nothing to do with spring" beat.
// Batch N layout: drawings in y 300-1150, the kit's subtitle centred at y 1300, the plum branch kept below the EP badge (y > 360),
// nothing written in the top 250 px, the bottom 480 px, or the right column (x>900) below y 840. Pure function of t.
import { createInkMoon, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, paper, range, putRange, ridgeLine, mist, haze, moon, birds, plum, enso,
  figure, house, ripples, serif, column, sealMark, subtitle } from './styles/inkmoon/inkmoon.js';
await document.fonts.load('italic 700 60px "Cormorant Garamond"');
const g = createInkMoon(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, r = (i, d) => T(i) + d, TOT = TL.total;
const win = (t, a, b, f = .5) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const ink = a => `rgba(30,28,30,${clamp(a)})`, VERM = '#b8382a';

// ---------------- the landscape (baked ranges), as harvestmoon but re-laid for y 300-1150 ----------------
const FARP = [[80, 200, 240], [360, 280, 260], [660, 220, 240], [960, 270, 260]];
const NEARP = [[170, 300, 240], [500, 220, 210], [820, 360, 250], [1080, 240, 210]];
const FAR = range(FARP, 900, { far: true, dots: 9000, seed: 3, fade: 200 });
const NEAR = range(NEARP, 1000, { dots: 140000, seed: 7, fade: 220 });
function land(t, { mx = 760, my = 520, mr = 120, tide = 0, plumK = 0, birdsA = 1, houseA = 1, fig = 0, moonA = 1 } = {}) {
  g.drawImage(paper(), 0, 0); { const sk = g.createLinearGradient(0, 280, 0, 1000); sk.addColorStop(0, 'rgba(150,170,195,.5)'); sk.addColorStop(1, 'rgba(150,170,195,0)'); g.fillStyle = sk; g.fillRect(0, 280, W, 720); }
  moon(g, mx, my, mr, 0, { a: moonA }); g.save(); g.globalAlpha *= moonA; enso(g, mx, my, mr + 4, 1, { lw: 5, seed: 8, a: .6 }); g.restore();
  putRange(g, FAR); mist(g, 900, 100, t, { seed: 2 }); putRange(g, NEAR); mist(g, 1010, 80, t, { seed: 5, a: .8 });
  // the shore and the sea: the waterline climbs with tide 0..1
  const wl = lerp(1110, 1035, tide); g.save(); g.fillStyle = '#e4ddcb'; g.beginPath(); g.moveTo(0, 1030); g.bezierCurveTo(300, 1010, 620, 1060, W, 1040); g.lineTo(W, 1160); g.lineTo(0, 1160); g.closePath(); g.fill();
  g.fillStyle = 'rgba(150,170,190,.55)'; g.beginPath(); g.moveTo(0, wl + 12); for (let x = 0; x <= W; x += 30) g.lineTo(x, wl + 6 * Math.sin(x * .02 + t * 1.5)); g.lineTo(W, 1160); g.lineTo(0, 1160); g.closePath(); g.fill();
  g.strokeStyle = ink(.6); g.lineWidth = 2.5; g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, wl + 6 * Math.sin(x * .02 + t * 1.5)); g.stroke(); g.restore();
  ripples(g, wl + 20, t, { a: .7 });
  // moon's reflection
  g.save(); g.globalAlpha *= .5 * moonA; for (let i = 0; i < 6; i++) { const y = wl + 16 + i * 14, w = (50 - i * 5) * (1 + .3 * Math.sin(t * 2 + i)); g.fillStyle = `rgba(250,240,215,${.7 - i * .08})`; g.fillRect(mx - w, y, w * 2, 4); } g.restore();
  if (houseA > 0) { g.save(); g.globalAlpha *= houseA; house(g, 220, 1030, 1.0); g.restore(); }
  if (fig > 0) { g.save(); g.globalAlpha *= fig; figure(g, 420, 1040, 1.5, { lantern: 1, t }); g.restore(); }
  if (birdsA > 0) { g.save(); g.globalAlpha *= birdsA; birds(g, t, { x0: 100, y0: 430, sp: 30 }); g.restore(); }
  if (plumK > 0) plum(g, plumK, t, { x: W + 20, y: 400 });
}
// tide line marks on a post (how high the water reached)
function post(x, t, tide) { g.save(); g.fillStyle = ink(.85); g.fillRect(x - 7, 940, 14, 180); for (let i = 0; i < 5; i++) { g.fillRect(x + 7, 960 + i * 30, 16, 3); } g.restore(); }

// ---------------- the diagram: Earth (ensō), ocean wash with two bulges, Moon, Sun ----------------
// bulge: amplitude along the Earth-Moon line; ang: direction to the Moon; bulgeFar 0..1 (far bulge grows separately)
function ocean(x, y, R, A, ang, far = 1, t = 0, extra = 0, extraAng = 0) { g.save(); g.beginPath();
  for (let i = 0; i <= 120; i++) { const th = i / 120 * TAU, c = Math.cos(th - ang); const near = c > 0 ? 1 : far; const e = extra * Math.pow(Math.cos(th - extraAng), 2);
    const rr = R + A * near * c * c + e + 3 * Math.sin(th * 9 + t * 2); const px = x + Math.cos(th) * rr, py = y + Math.sin(th) * rr; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.fillStyle = 'rgba(150,175,200,.5)'; g.fill(); g.strokeStyle = ink(.45); g.lineWidth = 3; g.stroke();
  // dry-brush stipple at the rim
  g.clip(); g.fillStyle = ink(.12); for (let i = 0; i < 500; i++) { const th = hash(i) * TAU, rr = R + (A + 40) * hash(i * 3); g.fillRect(x + Math.cos(th) * rr, y + Math.sin(th) * rr, 2, 2); } g.restore(); }
function earth(x, y, R, t, rot = 0, k = 1) { g.save(); g.fillStyle = '#efe8d8'; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
  // stippled "continents" that turn with rot
  g.save(); g.beginPath(); g.arc(x, y, R - 6, 0, TAU); g.clip(); for (let c = 0; c < 4; c++) { const a = rot + c * 1.7, cx = x + Math.cos(a) * R * .55, cy = y + Math.sin(a * 1.3) * R * .3, rr = R * (.28 + .1 * hash(c));
    for (let i = 0; i < 260; i++) { const th = hash(c * 99 + i) * TAU, d = Math.sqrt(hash(c * 77 + i * 3)) * rr; g.fillStyle = ink(.35 + .4 * hash(i)); g.fillRect(cx + Math.cos(th) * d, cy + Math.sin(th) * d * .8, 2.6, 2.6); } } g.restore();
  g.restore(); enso(g, x, y, R, k, { lw: 14, seed: 4 }); }
function sun(x, y, r, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; haze(g, x, y, r * 3, '230,120,90', .35); g.fillStyle = VERM; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }
function arrow(x0, y0, x1, y1, k, { col = ink(.85), lw = 6 } = {}) { if (k <= 0) return; const x = lerp(x0, x1, eo(k)), y = lerp(y0, y1, eo(k)), a = Math.atan2(y1 - y0, x1 - x0); g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke(); if (k > .8) { g.beginPath(); g.moveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); g.lineTo(x - Math.cos(a - .5) * 26, y - Math.sin(a - .5) * 26); g.lineTo(x - Math.cos(a + .5) * 26, y - Math.sin(a + .5) * 26); g.closePath(); g.fill(); } g.restore(); }
const lab = (s, x, y, k, o = {}) => serif(g, s, x, y, { size: o.size || 52, w: 700, a: clamp(k), tone: o.tone || .9, reveal: clamp(k * 1.5), align: o.align || 'center' });
const EX = 440, EY = 720, ER = 210;   // Earth in the diagram shots
function diagram(t, o = {}) { const { A = 70, far = 1, moonA = 1, rot = t * .25, mx = 930, my = 720, sunA = 0, sx = 120, sy = 380, extra = 0, extraAng = 0, mr = 70 } = o;
  g.drawImage(paper(), 0, 0); mist(g, 1080, 120, t, { seed: 9, a: .5 }); birds(g, t, { x0: 80, y0: 380, n: 4, sp: 26, s: .8 });
  const ang = Math.atan2(my - EY, mx - EX); ocean(EX, EY, ER + 20, A, ang, far, t, extra, extraAng); earth(EX, EY, ER, t, rot); haze(g, mx, my, mr * 2.6, '120,140,170', .35 * moonA); moon(g, mx, my, mr, 0, { a: moonA }); g.save(); g.globalAlpha *= moonA; g.fillStyle = 'rgba(200,205,215,.6)'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill(); g.restore(); enso(g, mx, my, mr + 2, moonA, { lw: 7, seed: 6 }); sun(sx, sy, 56, sunA); }

// ---------------- scenes ----------------
const S = [];
// hook: the two bulges, big; a vermilion arrow lands on the far one
S.push([0, T(1), t => { diagram(t, { A: 90 }); const k = seg(t, 1.0, 1.6); arrow(160, 420, 220, 610, k, { col: VERM }); lab('here too', 190, 380, seg(t, 1.2, 1.8), { size: 64 });
  lab('Moon', 930, 610, seg(t, .3, .9), { size: 44 }); }]);
// question: the landscape, moon over the ink peaks, the sea climbing the shore; vertical title column
S.push([T(1), T(2), t => { land(t, { tide: .4 + .2 * Math.sin(t * .8), plumK: seg(t, T(1), r(1, 1.2)) }); column(g, ['Moon', '&', 'tide'], 110, 420, seg(t, T(1), r(1, 1.2)), { size: 80, seal: 'EP 100' }); }]);
// not evenly: pull arrows at the near side, centre and far side; strongest / weakest
S.push([T(2), T(4), t => { diagram(t, { A: 0 }); const k = seg(t, r(2, .6), r(2, 1.6));
  arrow(EX + ER, EY, EX + ER + 170, EY, k, { lw: 9 }); arrow(EX, EY, EX + 115, EY, seg(k, .2, 1), { lw: 7 }); arrow(EX - ER, EY, EX - ER + 70, EY, seg(k, .4, 1), { lw: 5 });
  lab('not evenly', 440, 380, seg(t, r(2, 1.0), r(2, 1.6)), { size: 62 }); lab('hardest', EX + ER + 90, EY - 60, seg(t, r(3, .6), r(3, 1.0)), { size: 44 }); lab('weakest', EX - ER + 30, EY - 60, seg(t, r(3, 2.6), r(3, 3.0)), { size: 44 }); }]);
// one bulge: near side pulled toward the Moon
S.push([T(4), T(5), t => { const a = 90 * ss(seg(t, T(4), r(4, 2.0))); diagram(t, { A: a, far: 0 }); lab('one bulge', 440, 380, seg(t, r(4, 2.2), r(4, 2.8)), { size: 64 }); arrow(EX + ER + 40, EY - 140, EX + ER + 110, EY - 50, seg(t, r(4, 1.0), r(4, 1.6)), { col: VERM }); }]);
// the second bulge: far side keeps going, lags behind
S.push([T(5), T(6), t => { const f = ss(seg(t, r(5, 1.6), r(5, 3.6))); diagram(t, { A: 90, far: f }); arrow(EX - ER - 20, EY, EX - ER - 130, EY, seg(t, r(5, 2.0), r(5, 2.8)), { col: VERM, lw: 7 });
  lab('keeps going', EX - 120, EY + 290, seg(t, r(5, 2.4), r(5, 3.0)), { size: 50 }); lab('second bulge', 440, 380, seg(t, r(5, 4.4), r(5, 5.0)), { size: 64 }); }]);
// Earth spins through both: a coast marker goes round, high-low-high-low
S.push([T(6), T(7), t => { const sp = (t - T(6)) * .9; diagram(t, { A: 90, rot: sp }); const a = sp + 2.6, mx = EX + Math.cos(a) * (ER + 4), my = EY + Math.sin(a) * (ER + 4);
  g.save(); g.fillStyle = VERM; g.beginPath(); g.arc(mx, my, 16, 0, TAU); g.fill(); g.restore(); const hi = Math.pow(Math.cos(a), 2);
  lab(hi > .5 ? 'high tide' : 'low tide', 440, 380, seg(t, r(6, .6), r(6, 1.2)), { size: 64, tone: hi > .5 ? .95 : .6 }); lab('two highs, two lows a day', 440, 1100, seg(t, r(6, 2.4), r(6, 3.0)), { size: 46 }); }]);
// a little later each day: the Moon moves on along its orbit
S.push([T(7), T(8), t => { const mo = .35 * ss(seg(t, r(7, .4), r(7, 3.0))); const mx = EX + Math.cos(-mo) * 490, my = EY + Math.sin(-mo) * 490; diagram(t, { A: 90, mx, my });
  g.save(); g.strokeStyle = ink(.35); g.setLineDash([6, 12]); g.lineWidth = 3; g.beginPath(); g.arc(EX, EY, 490, -.6, .15); g.stroke(); g.restore();
  lab('the Moon moves on', 440, 380, seg(t, r(7, .8), r(7, 1.4)), { size: 56 }); lab('~50 min later each day', 440, 1100, seg(t, r(7, 2.4), r(7, 3.0)), { size: 44 }); }]);
// the Sun pulls too, about half as strongly
S.push([T(8), T(9), t => { diagram(t, { A: 80, sunA: seg(t, T(8), r(8, 1.0)), sx: 150, sy: 420 }); const k = seg(t, r(8, 1.4), r(8, 2.4)); arrow(EX + ER + 20, EY + 120, EX + ER + 190, EY + 120, k, { lw: 9 }); arrow(EX - ER + 20, EY - 250, EX - ER - 70, EY - 290, k, { col: VERM, lw: 6 });
  lab('Moon', EX + ER + 110, EY + 180, k, { size: 40 }); lab('Sun: about ½ as strong', 440, 1100, seg(t, r(8, 2.6), r(8, 3.2)), { size: 50 }); }]);
// spring tides: everything in a line (new and full moon), bulges extra high
S.push([T(9), T(10) + .3, t => { const al = ss(seg(t, r(9, .4), r(9, 2.4))); const A = lerp(80, 130, al); diagram(t, { A, mx: 930, my: 720, sunA: 1, sx: lerp(150, 70, al), sy: lerp(420, 720, al) });
  lab('in a line', 440, 380, seg(t, r(9, 1.6), r(9, 2.2)), { size: 60 }); lab('spring tide', 440, 1100, seg(t, r(9, 4.0), r(9, 4.6)), { size: 66, tone: .95 }); }]);
// "spring" has nothing to do with the season: plum blossoms (spring!) crossed out, the tide springs forth on the shore
S.push([T(10) + .3, T(11), t => { land(t, { tide: .4 + .6 * ss(seg(t, r(10, 2.6), r(10, 4.4))), plumK: 1, birdsA: .6 });
  const xk = seg(t, r(10, .8), r(10, 1.4)); g.save(); g.strokeStyle = VERM; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(620, 420); g.lineTo(620 + 260 * xk, 420 + 160 * xk); g.stroke(); g.restore();
  lab('not the season', 300, 420, seg(t, r(10, 1.0), r(10, 1.6)), { size: 56 }); lab('springs forth', 540, 900, seg(t, r(10, 2.8), r(10, 3.4)), { size: 64, tone: .95 }); lab('twice a month, all year', 540, 960, seg(t, r(10, 3.8), r(10, 4.4)), { size: 42 }); }]);
// neap tides: Sun at right angles, bulges gentler
S.push([T(11), T(12), t => { const k = ss(seg(t, r(11, .4), r(11, 2.0))); diagram(t, { A: lerp(110, 55, k), sunA: 1, sx: EX, sy: lerp(720, 330, k) * 1 + 0, extra: 25 * k, extraAng: -Math.PI / 2 });
  lab('right angles', 760, 400, seg(t, r(11, 1.2), r(11, 1.8)), { size: 54 }); lab('neap tide', 440, 1100, seg(t, r(11, 2.8), r(11, 3.4)), { size: 66, tone: .95 }); }]);
// coastlines and seafloor: two ensō insets, two different shores
S.push([T(12), T(13), t => { land(t, { tide: .5, plumK: 1, birdsA: .5, moonA: .6 }); [[300, 640, .9, 'a bay'], [780, 640, .35, 'a headland']].forEach(([x, y, hi, nm], i) => { const k = seg(t, r(12, .4 + i * .7), r(12, 1.2 + i * .7));
    g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(239,232,216,.92)'; g.beginPath(); g.arc(x, y, 190, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y, 180, 0, TAU); g.clip();
    const lvl = lerp(740, 600, hi * (.5 + .5 * Math.sin(t * 1.4 + i))); g.fillStyle = 'rgba(150,175,200,.6)'; g.fillRect(x - 200, lvl, 400, 300); g.fillStyle = ink(.8); g.beginPath(); g.moveTo(x - 190, 760); g.lineTo(x - 40, 600 + i * 40); g.lineTo(x + 190, 700); g.lineTo(x + 190, 900); g.lineTo(x - 190, 900); g.closePath(); g.fill(); g.restore();
    enso(g, x, y, 185, k, { lw: 12, seed: 5 + i }); lab(nm, x, y + 240, k, { size: 44 }); }); }]);
// the Moon at work: night shore, the traveller with a lantern, the water climbing
S.push([T(13), T(14), t => { land(t, { tide: ss(seg(t, T(13), r(13, 3.2))), fig: 1, mx: 700, my: 520, mr: 140 }); lab('the Moon at work', 540, 380, seg(t, r(13, 1.6), r(13, 2.2)), { size: 60 }); }]);
// yes / no
S.push([T(14), T(15) - .05, t => { land(t, { tide: .9, plumK: 0 }); lab('seen a spring tide?', 540, 380, seg(t, r(14, .3), r(14, .9)), { size: 60 }); lab('yes', 380, 640, seg(t, r(14, 1.8), r(14, 2.2)), { size: 72 }); lab('no', 700, 640, seg(t, r(14, 2.0), r(14, 2.4)), { size: 72 }); }]);
// end card on the landscape
S.push([T(15) - .05, TOT + 1, t => { land(t, { tide: .6, plumK: 0, birdsA: .7, mx: 820, my: 800, mr: 100, moonA: .7 }); const k = seg(t, T(15) - .05, r(15, .6));
  serif(g, 'Follow for more of', 540, 430, { size: 70, w: 600, reveal: k }); serif(g, 'how it really works.', 540, 520, { size: 80, w: 700, reveal: seg(t, r(15, .3), r(15, 1.0)) });
  serif(g, "A new 'wait, really?' every day.", 540, 600, { size: 46, w: 600, reveal: seg(t, r(15, .6), r(15, 1.2)) }); serif(g, '@howitreallyworkstudio', 540, 660, { size: 44, w: 700, tone: .8, reveal: seg(t, r(15, .9), r(15, 1.4)) });
  sealMark(g, 860, 700, 50, 'EP 100', seg(t, r(15, 1.2), r(15, 1.6))); }]);

function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0);
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .5, b, .5); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); } }
function sub(t) { let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur < 0 || cur === PH.length - 1) return;
  const p = PH[cur], nx = PH[cur + 1].start, a = (cur === 0 ? 1 : seg(t, p.start - .05, p.start + .15)) * (1 - seg(t, nx - .25, nx - .05)); subtitle(g, p.cap, a, 1300); }
window.DUR = TOT;
window.seek = t => { g.fillStyle = '#efe8d8'; g.fillRect(0, 0, W, H); scene(t); sub(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .35; g.fillStyle = '#1e1c1e'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { const t = 3; diagram(t, { A: 110 }); serif(g, 'Why TWO', 540, 360, { size: 120, w: 700 }); serif(g, 'high tides?', 540, 480, { size: 110, w: 700 }); sealMark(g, 880, 1060, 64, 'EP 100'); };
window.seek(0); window.ready = true; window.READY = true;
