// t_coldbreath.js: "Why can you see your breath when it's cold?" in template #29 Particle flock (demo t29, x.com/ajith_io). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: the violet > pink > peach dusk gradient with a murmuration of tiny dark glyph specks (A), the starry navy sky (B), the glowing
// ringed orb (C), the thin light streak drawn across the frame (D), handwritten notes with curved arrows (E). Here the flock is the water in a breath:
// molecules zooming apart, slowing past the dew point, sticking into droplets, a white cloud, then evaporating again.
// Batch N layout: caption box bottom-anchored at y 1360 inside x 70-890 (badge strip y 1366-1440 stays free), content inside y 250-1130, nothing important in x > 900 below y 840.
await Promise.all(['800 80px Inter', '600 50px Inter', '60px Hand'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let c = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const fr = x => x - Math.floor(x), hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453), tri = u => 1 - Math.abs(2 * fr(u) - 1);
const N = 420, HS = Array.from({ length: N }, (_, i) => [1, 2, 3, 4, 5, 6].map(k => hash(i * 7.31 + k * 1.913)));
const MX = 330, MY = 760;                                      // mouth of the kid's profile
const INK = '#2a2350', WARMY = '#ffd27a', ICEB = '#bfe0ff';

// ---------- backgrounds ----------
const BG = {
  dusk: { sky: ['#4b3d8f', '#9d6fb0', '#e597a6', '#f7c99b'], snow: ['#d9c6e2', '#bfa7d2'] },
  night: { sky: ['#14123a', '#1f1b55', '#2d2770', '#3b3283'], snow: ['#4a4386', '#383270'], stars: 1 },
  cold: { sky: ['#1b2d6b', '#3d5aa8', '#7ea0db', '#bcd3f2'], snow: ['#e4eefb', '#c3d5ef'] },
  warm: { sky: ['#f08a4b', '#f6a866', '#f9c98c', '#fde3b5'], snow: ['#f1d3a1', '#e2b97f'] },
};
function sky(name, a = 1) { if (a <= 0) return; const b = BG[name]; c.save(); c.globalAlpha = a;
  const g = c.createLinearGradient(0, 0, 0, 1250); b.sky.forEach((col, i) => g.addColorStop(i / 3, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (b.stars) for (let i = 0; i < 90; i++) { const x = hash(i * 3.3) * W, y = hash(i * 5.7) * 1150, r = 1.2 + 2.2 * hash(i * 9.1); c.globalAlpha = a * (.35 + .5 * hash(i * 2.2)); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  c.globalAlpha = a; const sg = c.createLinearGradient(0, 1080, 0, H); sg.addColorStop(0, b.snow[0]); sg.addColorStop(1, b.snow[1]); c.fillStyle = sg;
  c.beginPath(); c.moveTo(0, 1150); for (let x = 0; x <= W; x += 30) c.lineTo(x, 1130 + 26 * Math.sin(x * .006 + 1) + 14 * Math.sin(x * .017)); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
  c.restore(); }
function snowfall(t, a = .5) { c.save(); c.fillStyle = '#fff'; for (let i = 0; i < 46; i++) { const sp = 30 + 40 * hash(i * 1.7), y = 260 + fr(hash(i * 4.1) + t * sp / 1600) * 1600, x = 40 + hash(i * 2.9) * 1000 + 22 * Math.sin(t * .8 + i);
  c.globalAlpha = a * (.4 + .6 * hash(i * 6.3)); c.beginPath(); c.arc(x, y, 2.5 + 3 * hash(i * 8.8), 0, TAU); c.fill(); } c.restore(); }

// ---------- the kid (profile silhouette: beanie, pompom, scarf) ----------
function kid(x = 0, y = 0, sc = 1, a = 1, col = INK) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(sc, sc); c.fillStyle = col;
  c.beginPath(); c.ellipse(190, 730, 150, 160, 0, 0, TAU); c.fill();                       // head
  c.beginPath(); c.moveTo(320, 650); c.quadraticCurveTo(372, 698, 338, 716); c.lineTo(318, 712); c.fill();   // nose
  c.beginPath(); c.moveTo(300, 742); c.quadraticCurveTo(340, 752, 322, 780); c.lineTo(300, 790); c.fill();   // lips
  c.beginPath(); c.moveTo(40, 650); c.bezierCurveTo(40, 470, 340, 470, 340, 650); c.closePath(); c.fill();  // beanie
  c.fillRect(30, 628, 320, 46); c.beginPath(); c.arc(190, 470, 44, 0, TAU); c.fill();      // band, pompom
  c.beginPath(); c.moveTo(60, 860); c.quadraticCurveTo(200, 900, 310, 850); c.lineTo(330, 930); c.quadraticCurveTo(200, 980, 50, 935); c.fill();   // scarf
  c.fillRect(70, 900, 220, 260);                                                          // coat
  c.globalAlpha *= .55; c.fillStyle = '#fff'; c.beginPath(); c.arc(250, 700, 9, 0, TAU); c.fill(); c.restore(); }

// ---------- text ----------
function txt(s, x, y, size, col = '#fff', o = {}) { c.save(); c.font = `${o.wt || 800} ${size}px ${o.f || 'Inter'}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  c.globalAlpha *= o.a ?? 1; if (o.glow !== false) { c.shadowColor = o.sc || 'rgba(30,20,70,.55)'; c.shadowBlur = 18; } c.fillStyle = col; c.fillText(s, x, y); c.restore(); }
function pop(k) { return k <= 0 ? 0 : eo(k / .5); }
function title(lines, k, y0 = 330, size = 104, gap = 1.12) { const u = pop(k); if (u <= 0) return; lines.forEach(([s, col], j) => txt(s, CX, y0 + j * size * gap + (1 - u) * 40, size, col || '#fff', { a: u })); }
function note(s, x, y, k, col = '#fff', size = 60, align = 'center') { const u = pop(k); if (u > 0) txt(s, x, y, size, col, { f: 'Hand', wt: 400, a: u, align }); }
function arrow(x0, y0, x1, y1, k, col = '#fff', bend = 60) { const u = eo(k / .6); if (u <= 0) return; const mx = (x0 + x1) / 2 - (y1 - y0) / Math.hypot(x1 - x0, y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) / Math.hypot(x1 - x0, y1 - y0) * bend;
  c.save(); c.strokeStyle = col; c.lineWidth = 5; c.lineCap = 'round'; const n = 30, m = Math.max(2, Math.round(n * u)); c.beginPath();
  let px, py, qx, qy; for (let i = 0; i <= m; i++) { const q = i / n, x = (1 - q) ** 2 * x0 + 2 * (1 - q) * q * mx + q * q * x1, y = (1 - q) ** 2 * y0 + 2 * (1 - q) * q * my + q * q * y1; if (i) c.lineTo(x, y); else c.moveTo(x, y); qx = px; qy = py; px = x; py = y; }
  c.stroke(); if (u > .98) { const an = Math.atan2(py - qy, px - qx); c.beginPath(); c.moveTo(px - 26 * Math.cos(an - .45), py - 26 * Math.sin(an - .45)); c.lineTo(px, py); c.lineTo(px - 26 * Math.cos(an + .45), py - 26 * Math.sin(an + .45)); c.stroke(); } c.restore(); }
function pill(s, x, y, w, h, fill, col, k) { const u = pop(k); if (u <= 0) return; c.save(); c.globalAlpha *= u; c.translate(x, y); c.scale(lerp(.6, 1, u), lerp(.6, 1, u));
  c.fillStyle = fill; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, h / 2); c.fill(); c.restore(); txt(s, x, y + 2, h * .52, col, { a: u, glow: false }); }

// ---------- glowing orb + light streak (demo C, D) ----------
function orb(x, y, r, t, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha *= a; const g = c.createRadialGradient(x, y, 0, x, y, r * 1.9); g.addColorStop(0, 'rgba(255,236,200,.95)'); g.addColorStop(.25, 'rgba(255,200,170,.45)'); g.addColorStop(1, 'rgba(255,200,170,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 1.9, 0, TAU); c.fill(); c.lineWidth = 4;
  for (let j = 0; j < 4; j++) { const rr = r * (.35 + .22 * j) * (1 + .05 * Math.sin(t * 2.4 - j)); c.strokeStyle = ['#ffe9a8', '#ffb3c7', '#b6d8ff', '#fff'][j]; c.globalAlpha = a * (.8 - j * .15); c.beginPath(); c.arc(x, y, rr, 0, TAU); c.stroke(); } c.restore(); }
function streak(y, k, t, col = '#ffe2a8', x0 = 70, x1 = 1010) { const u = eo(k); if (u <= 0) return; c.save(); const xe = lerp(x0, x1, u); c.shadowColor = col; c.shadowBlur = 26; c.strokeStyle = col; c.lineWidth = 6;
  c.beginPath(); c.moveTo(x0, y); for (let x = x0; x <= xe; x += 20) c.lineTo(x, y + 3 * Math.sin(x * .03 + t * 3)); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(xe, y, 9, 0, TAU); c.fill(); c.restore(); }
function boxFrame(x, y, w, h, col, a, lab) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = 5; c.setLineDash([18, 12]); c.beginPath(); c.roundRect(x, y, w, h, 28); c.stroke(); c.restore(); if (lab) note(lab, x + w / 2, y - 44, a * .6, col, 58); }
function thermo(x, y, h, lev, col, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.roundRect(x - 16, y - h, 32, h, 16); c.fill(); c.beginPath(); c.arc(x, y + 14, 30, 0, TAU); c.fill();
  c.fillStyle = col; c.beginPath(); c.arc(x, y + 14, 21, 0, TAU); c.fill(); c.fillRect(x - 8, y - h * lev, 16, h * lev + 10); c.restore(); }

// ---------- particle formations: f(i, t, lt) -> [x, y] ----------
const CLOUD = [[560, 730, 150], [700, 690, 115], [430, 770, 105], [650, 800, 125], [520, 640, 100]];
function inCircle(h1, h2, cx, cy, r) { const a = h1 * TAU, d = Math.sqrt(h2) * r; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * .78]; }
function puffAge(i, t) { return fr(t * .32 + HS[i][0]); }
const F = {
  puff: (i, t) => { const h = HS[i], a = puffAge(i, t); return [MX + 30 + a * 560 + Math.sin(t * 1.3 + h[1] * 6) * 24 * a, MY - a * 40 + (h[2] - .5) * 2 * (24 + a * 160) + Math.sin(t + h[3] * 6) * 12]; },
  box: (x, y, w, h, v) => (i, t) => { const q = HS[i], sp = v * (.6 + .8 * q[2]); return [x + w * tri(q[0] + t * sp * (.4 + .6 * q[3]) / w * 300), y + h * tri(q[1] + t * sp * (.4 + .6 * q[4]) / h * 300)]; },
  orb: (i, t) => { const q = HS[i]; return [CX - 230 + 460 * tri(q[0] + t * (.35 + .5 * q[2])), 500 + 440 * tri(q[1] + t * (.3 + .5 * q[3]))]; },
  two: (i, t) => i % 9 === 0 ? F.box(590, 560, 300, 400, 1.2)(i, t) : F.box(130, 560, 330, 400, 2.6)(i, t),
  cols: (i, t) => { const q = HS[i]; if (i < 300) { const cx = i % 15, cy = Math.floor(i / 15); return [180 + cx * 21 + 3 * Math.sin(t * 9 + i), 1040 - cy * 23 + 3 * Math.cos(t * 8 + i)]; }
    if (i < 330) { const k = i - 300, cx = k % 15, cy = Math.floor(k / 15); return [600 + cx * 21 + 2 * Math.sin(t * 5 + i), 1040 - cy * 23]; } return [1200 + q[0] * 100, 1000]; },
  flock: (cx0, cy0, cx1, cy1, dur) => (i, t, lt) => { const q = HS[i], k = eo(lt / dur), cx = lerp(cx0, cx1, k) + 40 * Math.sin(t * .9), cy = lerp(cy0, cy1, k) + 30 * Math.sin(t * 1.3);
    const u = q[0] * 2 - 1, th = 30 + 110 * Math.sqrt(1 - Math.abs(u)), rot = -.25 + .2 * Math.sin(t * .7);
    const along = u * 330, across = (q[1] - .5) * 2 * th + 30 * Math.sin(u * 3 + t * 2.2);
    return [cx + along * Math.cos(rot) - across * Math.sin(rot) + 14 * Math.sin(t * 3 + q[2] * 9), cy + along * Math.sin(rot) + across * Math.cos(rot) + 50 * Math.sin(u * 2.4 + t * 1.6)]; },
  squeeze: (i, t) => { const q = HS[i], o = F.box(300, 520, 480, 380, 1.4)(i, t); return i % 13 === 0 ? [o[0], 515 - 40 * tri(q[3] + t * .8)] : o; },
  clump: (i, t, lt) => { const q = HS[i], K = 26, j = i % K, a = hash(j * 3.7), b = hash(j * 9.2), k = ss(.4, 3.6, lt);
    const cx = 170 + a * 700 + 16 * Math.sin(t * .8 + j), cy = 520 + b * 520 + 12 * Math.cos(t * .7 + j), free = F.box(110, 480, 820, 620, lerp(1.6, .2, k))(i, t);
    const d = lerp(1, .06, k), [ox, oy] = inCircle(q[3], q[4], 0, 0, 40); return [lerp(cx + ox, free[0], d), lerp(cy + oy, free[1], d)]; },
  cloud: (i, t) => { const q = HS[i], [x, y, r] = CLOUD[i % CLOUD.length], p = inCircle(q[0], q[1], x, y, r); return [p[0] + 10 * Math.sin(t * .9 + q[2] * 6), p[1] + 8 * Math.cos(t * .8 + q[3] * 6)]; },
  big: (i, t) => { const q = HS[i]; if (i % 7 === 0) { const a = puffAge(i, t * .7); return [300 + a * 220, 930 - a * 30 + (q[2] - .5) * (20 + a * 90)]; }
    const [x, y, r] = CLOUD[i % CLOUD.length], p = inCircle(q[0], q[1], x, y, r); return [CX + (p[0] - 560) * 1.85 + 8 * Math.sin(t * .6 + i), 640 + (p[1] - 730) * 1.2 + 6 * Math.cos(t * .5 + i)]; },
  spread: (i, t, lt) => { const q = HS[i], [x, y, r] = CLOUD[i % CLOUD.length], g = 1 + lt * .32, p = inCircle(q[0] + lt * .05 * (q[4] - .5), q[1], 560, 730, 0); const base = inCircle(q[0], q[1], x, y, r);
    return [560 + (base[0] - 560) * g + 40 * Math.sin(t * .9 + q[2] * 6) * g + p[0] * 0, 730 + (base[1] - 730) * g + 30 * Math.cos(t * .8 + q[3] * 6) * g]; },
  evap: (i, t, lt) => { const q = HS[i], [x, y, r] = CLOUD[i % CLOUD.length], b = inCircle(q[0], q[1], x, y, r), k = eo(lt / 3), out = F.box(60, 440, 960, 680, 1.8)(i, t);
    return [lerp(560 + (b[0] - 560) * 2.2, out[0], k), lerp(730 + (b[1] - 730) * 2.2, out[1], k)]; },
  band: (i, t) => { const q = HS[i], u = q[0] * 2 - 1; return [CX + u * 420, 1060 + (q[1] - .5) * 60 * (1 - Math.abs(u)) + 26 * Math.sin(u * 4 + t * 1.5)]; },
};
// particle styles: speck (demo glyph ticks), mol (H2O dot), drop (soft white droplet)
function drawP(style, x, y, i, t, a, sz = 1) { if (a <= .01 || x < -40 || x > W + 40) return; const q = HS[i]; c.globalAlpha = a;
  if (style === 'speck') { c.fillStyle = INK; c.save(); c.translate(x, y); c.rotate(q[2] * TAU + t * (q[3] - .5) * 2); c.fillRect(-7 * sz, -2.5 * sz, 14 * sz, 5 * sz); c.fillRect(-2 * sz, -6 * sz, 4 * sz, 7 * sz); c.restore(); }
  else if (style === 'mol') { c.fillStyle = ICEB; c.beginPath(); c.arc(x, y, 7 * sz, 0, TAU); c.fill(); c.fillStyle = '#fff'; const r = q[4] * TAU + t * (q[5] - .5) * 3;
    c.beginPath(); c.arc(x + Math.cos(r) * 9 * sz, y + Math.sin(r) * 9 * sz, 3.6 * sz, 0, TAU); c.arc(x + Math.cos(r + 1.8) * 9 * sz, y + Math.sin(r + 1.8) * 9 * sz, 3.6 * sz, 0, TAU); c.fill(); }
  else { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, (8 + 9 * q[5]) * sz, 0, TAU); c.fill(); } }

// ---------- scenes ----------
// each: bg, style, form, optional draw(lt, u, t), and pa(i, t, lt) particle alpha
const SC = [];
const ageA = (i, t) => Math.sin(Math.PI * puffAge(i, t)) * .9;
SC[0] = { bg: 'dusk', style: 'drop', form: F.puff, pa: ageA, draw: (lt, u, t) => { kid(); title([['A LITTLE', '#fff'], ['CLOUD?', WARMY]], 1, 300, 118); } };
SC[1] = { bg: 'warm', style: 'drop', form: F.puff, pa: (i, t, lt) => ageA(i, t) * (1 - ss(0, 1.2, lt)) * .9, draw: (lt, u, t) => { kid(0, 0, 1, 1, '#7a3f2a');
  c.save(); c.globalAlpha = .9; const g = c.createRadialGradient(830, 420, 0, 830, 420, 150); g.addColorStop(0, '#fff6c8'); g.addColorStop(.5, '#ffd36b'); g.addColorStop(1, 'rgba(255,211,107,0)'); c.fillStyle = g; c.beginPath(); c.arc(830, 420, 150, 0, TAU); c.fill(); c.restore();
  title([['WARM DAY?', '#fff']], lt, 300, 100); note('nothing...', 700, 760, lt - 1.3, '#7a3f2a', 76); title([['', ''], ['WHY?', '#7a3f2a']], lt - 2.4, 300, 100); } };
SC[2] = { bg: 'night', style: 'mol', form: F.orb, pa: (i, t, lt) => .25 + .55 * ss(.6, 2, lt), draw: (lt, u, t) => { orb(CX, 720, 240, t, ss(0, .8, lt)); title([['ALWAYS FULL', '#fff'], ['OF WATER', ICEB]], lt, 300, 96); } };
SC[3] = { bg: 'night', style: 'mol', form: F.box(110, 490, 840, 600, 2.4), pa: () => .9, draw: (lt, u, t) => { title([['WATER VAPOR', ICEB]], lt, 300, 104); note('invisible molecules', 330, 1030, lt - 1.4, '#fff', 56); arrow(560, 1020, 700, 900, lt - 1.8, '#fff', -40); } };
SC[4] = { bg: 'night', style: 'mol', form: F.box(110, 490, 840, 600, 4.2), pa: () => .9, trail: 1, draw: (lt, u, t) => { thermo(950, 800, 260, .85, '#ff7a6a', pop(lt)); title([['WARM =', '#fff'], ['FAST & APART', WARMY]], lt, 300, 96); } };
SC[5] = { bg: 'night', style: 'mol', form: F.two, pa: (i) => .92, draw: (lt, u, t) => { boxFrame(110, 540, 370, 440, WARMY, pop(lt), 'warm air'); boxFrame(570, 540, 340, 440, ICEB, pop(lt - 1.6), 'cold air');
  title([['WARM: LOTS', WARMY]], lt, 290, 84); title([['', ''], ['COLD: LESS', ICEB]], lt - 1.8, 290, 84); } };
SC[6] = { bg: 'night', style: 'mol', form: F.cols, pa: (i) => i < 330 ? .95 : 0, sz: .85, draw: (lt, u, t) => { title([['ABOUT', '#fff'], ['A TENTH', ICEB]], lt, 290, 104);
  note('body-warm air', 330, 1075, lt - .8, WARMY, 54); note('freezing air', 750, 1075, lt - 1.4, ICEB, 54); arrow(760, 860, 760, 990, lt - 2.2, ICEB, 0); note('1/10', 760, 820, lt - 2.2, '#fff', 80); } };
SC[7] = { bg: 'cold', style: 'speck', form: F.flock(380, 760, 700, 720, 3.4), pa: () => .95, draw: (lt, u, t) => { kid(20, 0, 1, 1, INK); title([['CRASH INTO', '#fff'], ['THE COLD', ICEB]], lt, 300, 104, 1.08); snowfall(t, .6); } };
SC[8] = { bg: 'cold', style: 'speck', form: F.flock(540, 560, 540, 960, 2.6), pa: () => .95, draw: (lt, u, t) => { streak(800, lt / 1.2, t, '#ffe2a8'); note('dew point', 210, 860, lt - 1, '#fff', 64, 'left');
  title([['THE DEW POINT', '#fff']], lt, 300, 96); const k = eo((lt - .4) / 2.6); thermo(860, 1000, 520, lerp(.9, .3, k), '#7fb3ff', pop(lt)); } };
SC[9] = { bg: 'night', style: 'mol', form: F.squeeze, pa: () => .95, draw: (lt, u, t) => { boxFrame(300, 520, 480, 380, '#fff', pop(lt), ''); title([["CAN'T HOLD", '#fff'], ['IT ALL', '#ff9fb0']], lt, 300, 104); note('too much vapor!', CX, 990, lt - 1.2, '#fff', 60); } };
SC[10] = { bg: 'night', style: 'mol', form: F.clump, pa: () => .95, draw: (lt, u, t) => { const k = ss(2.2, 4.2, lt); c.save(); for (let j = 0; j < 26; j++) { const a = hash(j * 3.7), b = hash(j * 9.2), x = 170 + a * 700 + 16 * Math.sin(t * .8 + j), y = 520 + b * 520 + 12 * Math.cos(t * .7 + j);
    const g = c.createRadialGradient(x, y, 0, x, y, 52); g.addColorStop(0, `rgba(255,255,255,${.9 * k})`); g.addColorStop(.6, `rgba(220,236,255,${.5 * k})`); g.addColorStop(1, 'rgba(220,236,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 52, 0, TAU); c.fill(); } c.restore();
  title([['STICK', '#fff'], ['TOGETHER', ICEB]], lt, 290, 104); note('tiny droplets!', CX, 1060, lt - 2.6, WARMY, 62); } };
SC[11] = { bg: 'dusk', style: 'drop', form: F.cloud, pa: () => .85, draw: (lt, u, t) => { kid(-20, 40, .9); title([['A LITTLE', '#fff'], ['WHITE CLOUD', '#fff']], lt, 300, 100); note('droplets', 870, 960, lt - 1, '#fff', 60); arrow(860, 920, 790, 840, lt - 1.2, '#fff', 40); } };
SC[12] = { bg: 'dusk', style: 'drop', form: F.big, pa: (i) => i % 7 === 0 ? .9 : .8, sz: 1.15, draw: (lt, u, t) => { kid(30, 470, .55); title([['SAME WAY', WARMY]], lt - 1, 280, 110);
  note('a real cloud', 800, 850, lt - .6, '#fff', 58); note('your breath', 520, 1060, lt - 1.4, '#fff', 58); arrow(470, 1030, 410, 965, lt - 1.6, '#fff', -30); } };
SC[13] = { bg: 'dusk', style: 'drop', form: F.cloud, pa: () => .85, draw: (lt, u, t) => { kid(-20, 40, .9); title([['GONE IN', '#fff'], ['A SECOND?', WARMY]], lt, 300, 104); } };
SC[14] = { bg: 'cold', style: 'drop', form: F.spread, pa: (i, t, lt) => .85 - .3 * ss(0, 3.4, lt), draw: (lt, u, t) => { kid(-20, 40, .9); snowfall(t, .7); title([['MIXING WITH', '#fff'], ['DRY AIR', ICEB]], lt, 290, 104); } };
SC[15] = { bg: 'night', style: 'mol', form: F.evap, pa: (i, t, lt) => .9 - .55 * ss(1.2, 3.6, lt), sz: .8, draw: (lt, u, t) => { title([['EVAPORATE', ICEB]], lt, 300, 110); note('back to invisible vapor', CX, 1060, lt - 1.3, '#fff', 58); } };
SC[16] = { bg: 'dusk', style: 'drop', form: F.puff, pa: ageA, draw: (lt, u, t) => { kid(); title([['NOT YOUR BREATH:', '#fff'], ['A CLOUD YOU MADE', WARMY]], lt, 290, 88, 1.15); } };
SC[17] = { bg: 'dusk', style: 'drop', form: F.puff, pa: ageA, draw: (lt, u, t) => { kid(); title([['DRAGON', '#fff'], ['SMOKE?', WARMY]], lt, 300, 120); pill('YES', 560, 990, 230, 110, WARMY, INK, lt - 1.4); pill('NO', 800, 990, 200, 110, '#fff', INK, lt - 1.6); } };
SC[18] = { bg: 'night', style: 'mol', form: F.band, pa: () => .7, sz: .8, draw: (lt, u, t) => { const a = pop(lt);
  txt('Follow for more of', CX, 600, 80, '#fff', { a }); txt('how it really works.', CX, 700, 80, WARMY, { a }); txt("A new 'wait, really?' every day.", CX, 830, 50, '#fff', { a: a * .9, f: 'Hand', wt: 400 }); txt('@howitreallyworkstudio', CX, 910, 46, ICEB, { a: a * .9, wt: 600 }); orb(CX, 420, 70, t, a * .8); } };

const START = PH.map(p => p.start); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .3) k = i; return k; }
const MORPH = .9; SC[6].morph = 1.9; SC[11].morph = 1.6; SC[12].morph = 2.2; SC[18].morph = 1.4;   // the template's move: the flock re-forms into the next shape

// ---------- captions (karaoke, inside x 70-890) ----------
function caption(t) { let k = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .15 && t <= (i + 1 < PH.length ? PH[i + 1].start - .15 : TOT)) k = i; if (k < 0 || k === PH.length - 1) return; const p = PH[k];
  // bold (**...**) state carries across words
  let bold = false; const toks = p.cap.split(' ').map(w => { const st = w.startsWith('**'), en = w.endsWith('**') || w.replace(/[.,!?:;]+$/, '').endsWith('**'); if (st) bold = true; const r = { w: w.replace(/\*\*/g, ''), b: bold }; if (en) bold = false; return r; });
  c.save(); c.font = '600 52px Inter'; const maxW = 770, lines = [[]]; let lw = 0; toks.forEach(o => { const ww = c.measureText(o.w + ' ').width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...o, ww }); lw += ww; });
  const lh = 66, bh = lines.length * lh + 44, by = 1360 - bh, fade = clamp((t - p.start + .15) / .25); c.globalAlpha = fade;
  c.fillStyle = 'rgba(24,18,60,.62)'; c.beginPath(); c.roundRect(70, by, 820, bh, 34); c.fill();
  const n = toks.length, prog = clamp((t - p.start) / Math.max(.5, p.end - p.start - .2)); let idx = 0; c.textBaseline = 'middle';
  lines.forEach((ln, j) => { const tw = ln.reduce((a, o) => a + o.ww, 0); let x = 480 - tw / 2; ln.forEach(o => { const on = idx / n <= prog + .02; c.fillStyle = o.b ? WARMY : '#fff'; c.globalAlpha = fade * (on ? 1 : .42); c.fillText(o.w, x, by + 22 + lh / 2 + j * lh); x += o.ww; idx++; }); });
  c.restore(); }

// ---------- frame ----------
function draw(t) {
  const k = sceneAt(t), S = SC[k], P = SC[Math.max(0, k - 1)], lt = t - START[k], lp = t - START[Math.max(0, k - 1)], mk = k === 0 ? 1 : ss(-.3, .5, lt);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; sky(P.bg, 1); if (S.bg !== P.bg) sky(S.bg, mk);
  if (S.bg === 'dusk' || S.bg === 'cold') snowfall(t, .35);
  // particles: morph from the previous scene's formation with a per-particle stagger
  const sameStyle = S.style === P.style;
  for (let i = 0; i < N; i++) { const q = HS[i], mo = S.morph || MORPH, kk = k === 0 ? 1 : eo(clamp((lt + .3 - q[5] * mo * .5) / mo));
    const b = S.form(i, t, lt), a0 = S.pa(i, t, lt); let x = b[0], y = b[1];
    if (kk < 1) { const p = P.form(i, t, lp), ap = P.pa(i, t, lp); x = lerp(p[0], b[0], kk); y = lerp(p[1], b[1], kk);
      if (sameStyle) drawP(S.style, x, y, i, t, lerp(ap, a0, kk), lerp(P.sz || 1, S.sz || 1, kk)); else { drawP(P.style, x, y, i, t, ap * (1 - kk), P.sz || 1); drawP(S.style, x, y, i, t, a0 * kk, S.sz || 1); } }
    else { if (S.trail) { const b2 = S.form(i, t - .05, lt - .05); c.globalAlpha = .35; c.strokeStyle = ICEB; c.lineWidth = 4; c.beginPath(); c.moveTo(b2[0], b2[1]); c.lineTo(x, y); c.stroke(); } drawP(S.style, x, y, i, t, a0, S.sz || 1); } }
  c.globalAlpha = 1;
  if (k > 0 && lt < .45 && P.draw) { c.save(); c.globalAlpha = 1 - lt / .45; P.draw(lp, 0, t); c.restore(); }
  c.save(); c.globalAlpha = k === 0 ? 1 : ss(-.1, .35, lt); S.draw(lt, 0, t); c.restore();
  caption(t);
}

// frame 0 snapshot for the loop ending (fades in at most 40% over the last 0.5 s)
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = c; c = F0.getContext('2d'); draw(0); c = keep; }
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = k; c.drawImage(F0, 0, 0); c.restore(); } }

const r = (i, d = 0) => s(i) + d;
window.CUES = [['whoosh', .3], ['sparkle', 1.2], ['pop', r(1, 1.6)], ['whoosh', r(2, -.3)], ['chime', r(2, .6), 76], ['tick', r(3, .4)], ['tick', r(3, 1.0)], ['tick', r(3, 1.6)], ['whoosh', r(4, -.2)], ['pop', r(5, .2)], ['pop', r(5, 1.8)],
  ['chime', r(6, 1.6), 72], ['whoosh', r(7, -.3)], ['thud', r(7, .9)], ['slide', r(8, .2)], ['chime', r(8, 1.4), 79], ['pop', r(9, .4)], ['bubbles', r(10, 1.4)], ['pop', r(10, 2.6)], ['pop', r(10, 3.1)], ['sparkle', r(11, .3)],
  ['sparkle', r(12, .9)], ['chime', r(12, 1.1), 83], ['whoosh', r(13, -.2)], ['whoosh', r(14, .2)], ['sparkle', r(15, .6)], ['whoosh', r(16, -.2)], ['chime', r(16, .9), 79], ['pop', r(17, 1.4)], ['pop', r(17, 1.6)], ['chime', r(18, .2), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { c.setTransform(1, 0, 0, 1, 0, 0); sky('dusk'); snowfall(2, .4); for (let i = 0; i < N; i++) { const p = F.puff(i, 2.4); drawP('drop', p[0], p[1] + 300, i, 2.4, ageA(i, 2.4), 1.1); } c.globalAlpha = 1; kid(0, 300);
  txt('WHY CAN YOU', CX, 330, 112, '#fff'); txt('SEE YOUR', CX, 460, 112, '#fff'); txt('BREATH?', CX, 600, 140, WARMY); };
window.seek(0); window.ready = true; window.READY = true;
