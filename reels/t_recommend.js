// t_recommend.js: "How a recommendation algorithm picks your next video" in template #13 collage "AI Doom" (demo 78). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: ransom-note letters on cork (title / end), little paper sets with wall + floor + baseboard, the kid and the orange box creature,
// blueprint scene with a construction kid, red theatre curtain stage, chalkboards with chalk maths, museum plaques with velvet rope, slider "softmax" board,
// pie wheel, mirror reveal, comic "POW!" burst; karaoke caption on a dark band; hard cuts with a short whip blur between sets.
import { createAD, W, H, TAU, C, clamp, lerp, ramp, ss, eo, bo, hash, FONTS } from './styles/aidoom/aidoom.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const AD = createAD(document.getElementById('c')), g = AD.g, lg = AD.lg, R = ramp;
const thumb = (x, y, w, h, seed, t, o = {}) => { const cols = ['#e86a5c', '#5b8fd1', '#f2c14e', '#7cc36d', '#b07cc9', '#f29fb5', '#4fb3b0'], col = cols[Math.floor(hash(seed) * cols.length)];
  AD.shape(AD.box(x, y, w, h, 2), o.fill || col, { seed, t, lw: o.lw || 3, a: o.a }); AD.shape([[x + w * .42, y + h * .3], [x + w * .42, y + h * .7], [x + w * .66, y + h * .5]], '#fff', { seed: seed + 1, lw: 2, wob: 1, a: o.a });
  if (o.bar != null) { AD.shape(AD.box(x + 6, y + h - 12, (w - 12), 6, 1), 'rgba(0,0,0,.35)', { line: false, wob: 0, a: o.a }); AD.shape(AD.box(x + 6, y + h - 12, (w - 12) * o.bar, 6, 1), '#e33', { line: false, wob: 0, a: o.a }); } };

// ---------- A: ransom title on cork, then the 2011 click problem ----------
function cork(t) { const c = lg; c.fillStyle = '#b98c5a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${hash(i) > .5 ? '90,55,25' : '230,190,140'},${.15 + hash(i * 3) * .25})`; c.fillRect(hash(i * 5) * W, hash(i * 7) * H, 3 + hash(i * 9) * 5, 2 + hash(i * 11) * 4); }
  AD.shape(AD.box(30, 30, W - 60, H - 60, 4), null, { lw: 22, lc: '#7a5232', wob: 1 }); }
const TITLE = [['WHY', 300], ['YOUR', 470], ['FEED', 640], ['PICKED', 810], ['THIS', 980]];
function sceneA(t) { if (t < 2.4) { cork(t); TITLE.forEach(([w, y], li) => { const sz = li === 3 ? 170 : 150, tw = w.length * sz * .8; [...w].forEach((ch, i) => AD.ransom(ch, 540 - tw / 2 + sz * .4 + i * sz * .8, y, sz, li * 17 + i * 3 + 1, t < .05 ? 1 : R(t, -.4 + li * .06 + i * .03, .3))); });
    AD.ransom('?', 540 + 300, 1150, 210, 99, R(t, .9, .3)); thumb(220, 1250, 260, 150, 3, t, { bar: .1 }); AD.shape([[500, 1330], [600, 1330]], null, { open: true, lw: 5, lc: '#c22', wob: 1 }); return; }
  AD.set('#d9e3cf', C.floor);                                                           // living room 2011
  AD.plaque(640, 260, 360, 120, ['YouTube HQ, 2011'], { size: 42, top: 76 });
  AD.shape(AD.box(160, 560, 760, 470, 4), '#3b3b45', { seed: 50, t }); const watched = R(t, s(0) + 3.3, 1.2); thumb(195, 595, 690, 400, 5, t, { bar: .08 + watched * .02 });
  AD.shape(AD.box(470, 1030, 140, 70, 2), '#5a4a40', { seed: 51, t }); AD.shape(AD.box(340, 1100, 400, 280, 3), '#8a6a50', { seed: 52, t });
  const clk = R(t, s(0) + 2.0, .25); if (clk > 0 && clk < 1) AD.ransom('CLICK!', 820, 520, 90, 7, 1); if (clk >= 1 && t < s(0) + 2.8) AD.text('CLICK!', 820, 540, { f: 'roundX', size: 80, col: C.red, align: 'center', outline: 8, ocol: '#fff' });
  const leave = R(t, s(0) + 3.0, 1.6); AD.kid(lerp(540, 1250, ss(leave)), 1360, 1.15, t, { walk: leave > 0 && leave < 1 ? t * 1.8 : null, flip: leave > 0, mood: 'smile' });
  AD.boxy(900, 1500, 1, t, { mood: R(t, s(0) + 3.8, .1) > 0 ? 'o' : 'sleepy' }); if (t > s(0) + 3.9) AD.text('?!', 960, 1300, { f: 'roundX', size: 80, col: C.ink });
  AD.text('CLICKED', 200, 470, { f: 'type', size: 54, col: '#2a7a3a', a: R(t, s(0) + 2.2, .3) }); AD.text('WATCHED?', 200, 530 + 0, { f: 'type', size: 54, col: C.red, a: R(t, s(0) + 4.0, .3) });
}

// ---------- B: blueprint funnel ----------
function funnel(t, k, fill = 0) { const c = lg; const pts = [[180, 520], [900, 520], [640, 1080], [640, 1300], [440, 1300], [440, 1080]]; c.save(); c.globalAlpha = k; AD.shape(pts, 'rgba(255,255,255,.06)', { lc: '#eaf2ff', lw: 5, seed: 60, t }); c.restore(); }
function sceneB(t) { const c = lg; c.fillStyle = '#2c5aa0'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  const t0 = s(1), k = R(t, t0 + 1.2, 1.4); funnel(t, k);
  AD.line([[120, 300], [120, 360], [960, 360]], { lc: '#eaf2ff', lw: 4, t }); AD.line([[880, 360], [880, 520]], { lc: '#eaf2ff', lw: 3, t });   // crane arm
  AD.text('THE FUNNEL', 540, 470, { f: 'type', size: 58, col: '#eaf2ff', align: 'center', write: R(t, t0 + 2.2, .8) });
  AD.text('Covington, Adams & Sargin, 2016', 540, 1390, { f: 'type', size: 32, col: '#cfe0ff', align: 'center', a: R(t, t0 + 2.6, .5) });
  AD.kid(250, 1600, .95, t, { mood: 'smile', arm: 'point', look: 1 }); AD.shape([[170, 1150], [330, 1150], [300, 1105], [200, 1105]], '#f2c14e', { seed: 61, t });  // hard hat
  AD.boxy(860, 1610, .9, t, { hat: true, mood: 'happy' }); }

// ---------- C: theatre of millions ----------
function curtain(t) { const c = lg; c.fillStyle = '#3a1f2b'; c.fillRect(0, 0, W, H); c.fillStyle = '#6a3b2a'; c.fillRect(0, 1320, W, 600); AD.line([[0, 1320], [W, 1320]], { lw: 5 });
  for (const sd of [-1, 1]) { const x0 = sd < 0 ? 0 : W; AD.shape([[x0, 0], [x0 + sd * -230, 0], [x0 + sd * -170, 600], [x0 + sd * -240, 1320], [x0, 1320]], '#a12b30', { seed: 70 + sd, t }); for (let i = 1; i < 4; i++) AD.line([[x0 + sd * -i * 55, 0], [x0 + sd * -i * 50, 1320]], { lc: 'rgba(60,10,15,.6)', lw: 3, t }); }
  AD.shape(AD.box(0, 0, W, 130, 4), '#a12b30', { seed: 73, t }); AD.text('THÉÂTRE DES VIDÉOS', 540, 95, { f: 'roundX', size: 56, col: C.yellow, align: 'center' }); }
function sceneC(t) { const t0 = s(2); curtain(t); const n = Math.floor(lerp(0, 160, ss(R(t, t0 - .3, 2.6))));
  for (let i = 0; i < n; i++) { const col = i % 12, row = Math.floor(i / 12), x = 160 + col * 64 + (row % 2) * 20, y = 1300 - row * 52 - Math.max(0, 6 - Math.abs(col - 5.5)) * 18; thumb(x, y - 44, 58, 40, i + 7, 0, { lw: 2 }); }
  AD.text('MILLIONS', 540, 330, { f: 'poster', size: 170, col: '#fff3d0', align: 'center', a: R(t, t0, .3), outline: 6 });
  AD.boxy(540, 1560, 1.15, t, { mood: R(t, t0 + 2.4, .1) > 0 ? 'dizzy' : 'o' }); }

// ---------- D: viewers like you -> a few hundred ----------
function sceneD(t) { const t0 = s(3); AD.set('#e8d39a', C.floor); AD.chalkboard(110, 260, 860, 330, t);
  AD.text('viewers like you', 540, 380, { f: 'hand', size: 74, col: '#f4f1e6', align: 'center', write: R(t, t0, 1) }); AD.text('watched...', 540, 470, { f: 'hand', size: 66, col: '#f4f1e6', align: 'center', write: R(t, t0 + .8, .8) });
  [200, 420, 640].forEach((x, i) => { AD.kid(x, 1330, .78, t + i, { mood: 'smile', arm: 'phone', screen: ['#e86a5c', '#5b8fd1', '#7cc36d'][i] }); });
  const bk = R(t, t0 + 2.0, 2.2); AD.shape([[790, 1060], [1000, 1060], [970, 1330], [820, 1330]], '#c79a5b', { seed: 80, t });   // basket
  for (let i = 0; i < 9; i++) { const u = ss(R(bk, i * .07, .45)), sx = 200 + (i % 3) * 220, sy = 1000, ex = 840 + (i % 4) * 30, ey = 1080 - Math.floor(i / 4) * 20; if (u > 0) thumb(lerp(sx, ex, u), lerp(sy, ey, u) - Math.sin(u * Math.PI) * 220, 60, 40, i + 30, 0, { lw: 2 }); }
  AD.plaque(760, 1390, 280, 100, ['a few hundred'], { size: 40, top: 64, a: R(t, t0 + 3.2, .4) }); }

// ---------- E: scoring judge -> a few dozen ----------
function sceneE(t) { const t0 = s(4); AD.set('#5b3f7a', '#3a2a4a', { fy: 1300 }); AD.text('THE SCORING ROOM', 540, 230, { f: 'roundX', size: 64, col: C.yellow, align: 'center' });
  AD.shape(AD.box(0, 1000, W, 60, 3), '#777', { seed: 90, t }); for (let i = 0; i < 12; i++) AD.shape(AD.poly(40 + i * 92, 1030, 18, 18, 10), '#555', { seed: 91 + i, lw: 3 });   // conveyor
  const sh = (t - t0) * 160; for (let i = 0; i < 7; i++) { const x = ((i * 190 + sh) % 1330) - 160; thumb(x, 880, 140, 100, i + 50, t); const sc = Math.round(10 + hash(i * 7.1) * 89); AD.text(String(sc), x + 70, 860, { f: 'poster', size: 52, col: sc > 70 ? '#7cff9a' : '#ffd0d0', align: 'center', outline: 5, a: R(t, t0 + .3, .3) }); }
  AD.boxy(300, 1460, 1.3, t, { hat: true, mood: 'happy' }); AD.shape(AD.box(380, 1220, 120, 90, 2), '#fff', { seed: 95, t }); AD.text('9.4', 440, 1285, { f: 'poster', size: 60, align: 'center' });
  const pk = R(t, t0 + 2.2, .6); AD.shape(AD.rbox(660, 1100, 300, 520, 34), '#2b2b3a', { seed: 96, t, a: pk }); for (let i = 0; i < 4; i++) thumb(690, 1140 + i * 115, 240, 95, i + 70, t, { a: R(pk, i * .2, .3) });
  AD.text('a few dozen', 810, 1680, { f: 'hand', size: 56, col: '#fff', align: 'center', a: R(t, t0 + 3.0, .4) }); }

// ---------- F: prediction = expected watch time (chalk) ----------
function sceneF(t) { const t0 = s(5); AD.set('#cfe3dc', C.floor); AD.chalkboard(80, 220, 920, 560, t);
  AD.text('score =', 150, 360, { f: 'hand', size: 80, col: '#f4f1e6', write: R(t, t0, .6) }); AD.text('predicted', 420, 360, { f: 'hand', size: 80, col: C.yellow, write: R(t, t0 + .6, .6) });
  AD.text('watch time', 420, 460, { f: 'hand', size: 80, col: C.yellow, write: R(t, t0 + 1.2, .6) }); AD.text('(2016 paper)', 150, 700, { f: 'hand', size: 50, col: '#cfd8c8', a: R(t, t0 + 1.8, .4) });
  // stopwatch over kid
  const sw = R(t, t0 + 2.2, .4); AD.shape(AD.poly(780, 1000, 110, 110, 30), '#fbf6ea', { seed: 100, t, a: sw }); AD.shape(AD.box(765, 870, 30, 30, 2), '#aaa', { seed: 101, a: sw }); const ang = -Math.PI / 2 + (t - t0) * 2.2; AD.line([[780, 1000], [780 + Math.cos(ang) * 85, 1000 + Math.sin(ang) * 85]], { lw: 6, wob: 0, a: sw });
  AD.kid(380, 1440, 1.05, t, { arm: 'phone', mood: 'smile', screen: '#f2c14e' }); }

// ---------- G: clickbait exhibit ----------
function sceneG(t) { const t0 = s(6); AD.set('#efe0bf', '#d6c4a0'); AD.shape(AD.box(0, 0, 70, 1380, 2), '#ddd', { seed: 110 }); AD.shape(AD.box(1010, 0, 70, 1380, 2), '#ddd', { seed: 111 });
  AD.shape(AD.box(190, 330, 700, 480, 4), '#e9b93a', { seed: 112, t, lw: 5 }); AD.shape(AD.box(230, 370, 620, 400, 4), '#f6efe0', { seed: 113, t });
  thumb(270, 410, 540, 320, 9, t, { fill: '#e2483d', bar: .12 }); AD.text('YOU WON\'T', 540, 520, { f: 'poster', size: 70, col: '#fff', align: 'center', outline: 6 }); AD.text('BELIEVE THIS', 540, 600, { f: 'poster', size: 70, col: C.yellow, align: 'center', outline: 6 });
  AD.plaque(300, 880, 480, 150, ['Clickbait', 'videos people didn\'t finish'], { size: 42, top: 62, lh: 52, write: R(t, t0 + .4, 1) });
  AD.shape(AD.box(330, 1180, 420, 200, 3), '#eee', { seed: 114, t }); AD.text('NOT RANKED', 540, 1290, { f: 'serif', size: 44, col: '#6a5a50', align: 'center' });
  for (const x of [250, 830]) { AD.shape(AD.box(x - 8, 1200, 16, 180, 2), C.yellow, { seed: x }); AD.shape(AD.poly(x, 1195, 22, 22, 12), C.yellow, { seed: x + 1 }); } AD.line([[250, 1230], [540, 1290], [830, 1230]], { lc: C.red, lw: 9, t });
  AD.kid(150, 1640, .8, t, { mood: 'worry', look: 1 }); AD.boxy(920, 1650, .8, t, { mood: 'sleepy' }); }

// ---------- H: survey card ----------
function sceneH(t) { const t0 = s(7); AD.set('#f0c9b0', C.floor); AD.shape(AD.box(140, 300, 800, 620, 4), '#fbf6ea', { seed: 120, t, lw: 5 });
  AD.text('SURVEY', 540, 400, { f: 'type', size: 60, align: 'center' }); AD.text('Was this video', 540, 520, { f: 'round', size: 64, align: 'center', write: R(t, t0, .7) }); AD.text('worth your time?', 540, 600, { f: 'round', size: 64, align: 'center', write: R(t, t0 + .5, .7) });
  for (let i = 0; i < 5; i++) { const on = i < 4 + (R(t, t0 + 3.2, .2) > 0 ? 1 : 0) && R(t, t0 + 1.6 + i * .3, .2) > 0, sz = 56 * (on ? bo(R(t, t0 + 1.6 + i * .3, .3)) : 1); const pts = Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + k / 10 * TAU, r = k % 2 ? sz * .45 : sz; return [210 + i * 165 + Math.cos(a) * r, 780 + Math.sin(a) * r]; });
    AD.shape(pts, on ? C.yellow : '#eee', { seed: 121 + i, lw: 3 }); }
  AD.kid(540, 1500, 1.05, t, { arm: 'phone', mood: R(t, t0 + 3.2, .1) > 0 ? 'smile' : 'worry', screen: '#fbf6ea' }); }

// ---------- I: share / like / dislike: comic POW ----------
function sceneI(t) { const t0 = s(8); const c = lg; c.fillStyle = '#3c3a78'; c.fillRect(0, 0, W, H); for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.moveTo(540, 900); const a = i / 26 * TAU; c.lineTo(540 + Math.cos(a) * 1500, 900 + Math.sin(a) * 1500); c.lineTo(540 + Math.cos(a + .12) * 1500, 900 + Math.sin(a + .12) * 1500); c.fill(); }
  const items = [['SHARE', '➦', C.blue, 330], ['LIKE', '👍', C.green, 760], ['DISLIKE', '👎', C.red, 1190]];
  items.forEach(([lab, ic, col, y], i) => { const k = bo(R(t, t0 + i * .85, .4)); if (k <= 0) return; c.save(); c.translate(540, y); c.scale(k, k); const spikes = Array.from({ length: 24 }, (_, j) => { const a = j / 24 * TAU, r = j % 2 ? 150 : 210; return [Math.cos(a) * r * 1.5, Math.sin(a) * r * .9]; });
    AD.use(c); AD.shape(spikes, col, { seed: 130 + i, t }); AD.text(lab, 0, 30, { f: 'poster', size: 110, col: '#fff', align: 'center', outline: 8 }); c.restore(); AD.use(lg); });
  AD.boxy(860, 1560, 1.0, t, { mood: 'happy', hop: (t - t0) * 1.2 }); }

// ---------- J: Instagram's guesses: slider board ----------
function sceneJ(t) { const t0 = s(9); AD.set('#2f2a44', '#1f1b2e', { fy: 1420 }); AD.text('REELS: PREDICTIONS', 540, 240, { f: 'roundX', size: 60, col: C.yellow, align: 'center' });
  AD.plaque(220, 290, 640, 80, ['according to Instagram, 2023'], { size: 34, top: 52, fill: '#efe6d2' });
  const rows = [['watch to the end', .82], ['like it', .55], ['reshare it', .68]]; rows.forEach(([lab, v], i) => { const y = 520 + i * 250, k = R(t, t0 + .3 + i * .9, .9);
    AD.text(lab, 150, y, { f: 'hand', size: 64, col: '#fbf6ea', a: R(k, 0, .3) }); AD.shape(AD.box(150, y + 40, 780, 34, 3), '#4a4466', { seed: 140 + i, t }); AD.shape(AD.box(150, y + 40, 780 * v * ss(k), 34, 3), ['#7cc36d', '#f29fb5', '#5b8fd1'][i], { seed: 143 + i, t, line: false });
    const kx = 150 + 780 * v * ss(k); AD.shape(AD.box(kx - 16, y + 22, 32, 70, 2), '#ddd', { seed: 146 + i, t }); AD.text(Math.round(v * 100 * ss(k)) + '%', 960, y, { f: 'poster', size: 54, col: '#fff', align: 'right', a: R(k, 0, .3) }); });
  AD.text('(example numbers)', 540, 1300, { f: 'hand', size: 44, col: '#b9b0d0', align: 'center', a: R(t, t0 + 2.5, .5) });
  AD.kid(880, 1390, .6, t, { arm: 'phone', mood: 'smile', screen: '#f29fb5' }); }

// ---------- K/L: the bet (wheel) and the loop ----------
function sceneK(t) { const t0 = s(10); AD.set('#7a2230', '#4a1520'); AD.text('PLACE YOUR BETS', 540, 230, { f: 'poster', size: 92, col: C.yellow, align: 'center', outline: 6 });
  const cols = ['#e86a5c', '#5b8fd1', '#f2c14e', '#7cc36d', '#b07cc9', '#f29fb5'], labs = ['cats', 'cooking', 'science', 'football', 'music', 'DIY'], rot = (t - t0) * 1.4 * (1 - ss(R(t, t0 + 2.6, 1.2)) * .9);
  const cx = 540, cy = 830, r = 360; labs.forEach((lb, i) => { const a0 = rot + i / 6 * TAU, a1 = rot + (i + 1) / 6 * TAU, pts = [[cx, cy]]; for (let k = 0; k <= 10; k++) { const a = lerp(a0, a1, k / 10); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    AD.shape(pts, cols[i], { seed: 150 + i, t }); const am = (a0 + a1) / 2; AD.text(lb, cx + Math.cos(am) * r * .62, cy + Math.sin(am) * r * .62 + 16, { f: 'roundX', size: 44, col: '#fff', align: 'center', outline: 5 }); });
  AD.shape(AD.poly(cx, cy, 40, 40, 16), '#fbf6ea', { seed: 158 }); AD.shape([[cx - 24, cy - r - 50], [cx + 24, cy - r - 50], [cx, cy - r + 10]], '#fff', { seed: 159 });
  if (t < s(11)) { const nk = R(t, t0 + .3, .5); AD.shape(AD.poly(260, 1330, 150, 90, 24), '#fbf6ea', { seed: 160, a: nk }); AD.text('mind', 260, 1325, { f: 'hand', size: 56, align: 'center', a: nk }); AD.text('reading', 260, 1380, { f: 'hand', size: 56, align: 'center', a: nk }); AD.line([[140, 1260], [380, 1400]], { lc: C.red, lw: 12, prog: 1, a: R(t, t0 + 1.2, .3) }); }
  else { const lk = R(t, s(11), .9); const pts = Array.from({ length: 40 }, (_, k) => { const a = -Math.PI * .9 + k / 39 * Math.PI * 1.7 * lk; return [540 + Math.cos(a) * 300, 1380 + Math.sin(a) * 120]; }); AD.line(pts, { lw: 8, lc: C.yellow, wob: 1 });
    AD.text('your swipe', 280, 1550, { f: 'hand', size: 50, col: '#fff', align: 'center', a: lk }); AD.text('next bet', 800, 1550, { f: 'hand', size: 50, col: '#fff', align: 'center', a: R(t, s(11) + .7, .3) }); }
  AD.boxy(860, 1300, .9, t, { hat: true, mood: 'happy' }); }

// ---------- M: reset ----------
function sceneM(t) { const t0 = s(12); AD.set('#d6e6f2', C.floor); AD.shape(AD.box(160, 300, 760, 600, 4), '#fbf6ea', { seed: 170, t, lw: 5 }); AD.text('Watch history', 540, 400, { f: 'roundX', size: 62, align: 'center' });
  [['PAUSE', '#f2c14e', 560, t0 + .9], ['DELETE', '#e2483d', 760, t0 + 1.6]].forEach(([lb, col, y, tt]) => { const k = bo(R(t, tt, .4)); lg.save(); lg.translate(540, y); lg.scale(k, k); AD.use(lg); AD.shape(AD.rbox(-230, -70, 460, 140, 40), col, { seed: y }); AD.text(lb, 0, 26, { f: 'poster', size: 84, col: '#fff', align: 'center', outline: 6 }); lg.restore(); });
  const zap = R(t, t0 + 2.2, .3); AD.boxy(560, 1500, 1.2, t, { mood: zap > 0 ? 'dizzy' : 'happy' }); if (zap > 0) for (let i = 0; i < 5; i++) { const a = t * 3 + i / 5 * TAU; AD.text('★', 560 + Math.cos(a) * 130, 1290 + Math.sin(a) * 30, { f: 'roundX', size: 40, col: C.yellow, align: 'center' }); }
  AD.kid(220, 1560, .85, t, { arm: 'point', mood: 'smile' }); AD.plaque(640, 1000, 360, 90, ['YouTube settings'], { size: 36, top: 58, a: R(t, t0 + .4, .4) }); }

// ---------- N: mirror ----------
function sceneN(t) { const t0 = s(13); AD.set('#cfc2e6', '#a898c4'); const c = lg;
  AD.shape(AD.poly(640, 820, 270, 420, 40), '#e9b93a', { seed: 180, t, lw: 6 }); AD.shape(AD.poly(640, 820, 236, 386, 40), '#dfe9f2', { seed: 181, t });
  c.save(); c.beginPath(); AD.poly(640, 820, 230, 380, 40).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); for (let i = 0; i < 9; i++) thumb(470 + (i % 3) * 120, 560 + Math.floor(i / 3) * 140, 100, 72, i + 90, t, { a: R(t, t0 + .4 + i * .08, .3) }); c.restore();
  AD.kid(250, 1500, 1.0, t, { mood: 'o', look: 1, sweat: true }); AD.text('?', 640, 1360, { f: 'roundX', size: 120, col: C.ink, align: 'center', a: R(t, t0 + 1.0, .3) }); }

// ---------- O: end card (ransom letters on cork) ----------
const ENDL = [['FOLLOW', 360], ['FOR MORE OF', 560], ['HOW IT', 780], ['REALLY', 960], ['WORKS.', 1140]];
function sceneO(t) { const t0 = s(14) - .2; cork(t); ENDL.forEach(([w, y], li) => { const sz = li === 1 ? 100 : 140, step = sz * .78, tw = w.length * step; [...w].forEach((ch, i) => { if (ch !== ' ') AD.ransom(ch, 540 - tw / 2 + step / 2 + i * step, y, sz, li * 23 + i * 5 + 3, R(t, t0 + li * .25 + i * .03, .3)); }); });
  AD.text('@howitreallyworkstudio', 540, 1340, { f: 'type', size: 50, col: '#2b1d10', align: 'center', a: R(t, t0 + 1.5, .5) }); AD.boxy(820, 1600, .9, t, { mood: 'happy', hop: t }); }

// ---------- compositor: hard cuts with a short whip blur (demo) ----------
const SC = [[0, sceneA], [s(1) - .2, sceneB], [s(2) - .2, sceneC], [s(3) - .2, sceneD], [s(4) - .2, sceneE], [s(5) - .2, sceneF], [s(6) - .2, sceneG], [s(7) - .2, sceneH], [s(8) - .2, sceneI],
  [s(9) - .2, sceneJ], [s(10) - .2, sceneK], [s(12) - .2, sceneM], [s(13) - .2, sceneN], [s(14) - .3, sceneO]];
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
function scene(t) { const i = idx(t), u = R(t, SC[i][0], .22); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H);
  AD.clear(); SC[i][1](t); AD.blit({ blur: i > 0 && u < 1 ? (1 - u) * 18 : 0, dx: i > 0 && u < 1 ? (1 - eo(u)) * 160 : 0, z: i > 0 && u < 1 ? lerp(1.04, 1, eo(u)) : 1 + .015 * Math.sin(t * .4) });
  AD.finish(); const ph = PH.findLast(p => t >= p.start - .2); if (ph && ph.i < PH.length - 1 && !(i === 0 && t < 2.4 && t < ph.start)) AD.caption(ph, t, { out: PH[ph.i + 1].start - .12 }); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - f; g.fillStyle = '#1b1410'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
