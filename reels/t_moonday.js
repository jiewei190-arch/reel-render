// Why can you see the Moon during the day? — template #22 paper stop-motion ledger (x.com/_nikolajankovic "Through DeFi Saver's eyes"):
// graphite pencil on off-white paper (lines re-drawn every frame at 12 fps, so they boil), coloured-pencil labels, typed paper slips with a
// soft shadow, the pencil thermometer gauge, the crescent-moon-and-plus-sign stars, and a taped paper caption strip typed on letter by letter.
// Here the paper is the sky over a pencil horizon; the gauge ranks Moon / day sky / stars by brightness; the ledger logs moonrise times
// creeping 50 minutes a day; a 24-hour clock shows the Moon keeping its own schedule. All motion steps at 12 fps like the demo.
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total, N = PH.length;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const fr = x => x - Math.floor(x), hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const GR = '#3b3b3d', BLUE = '#3f55c8', RED = '#c43b3b', YEL = '#e9c94a', SKYB = '#8fb0d8', PAPER = '#ecebe6';
let ST = 0, T = 0;                         // ST: 12 fps frame index (boil seed), T: time quantised to 12 fps (stop motion)
const HY = 1100;                           // horizon

// ---------- graphite kit ----------
const dens = (P, closed, step = 10) => { const o = []; const n = closed ? P.length : P.length - 1; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % P.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.ceil(d / step)); for (let j = 0; j < m; j++) o.push([lerp(a[0], b[0], j / m), lerp(a[1], b[1], j / m)]); } o.push(closed ? P[0] : P[P.length - 1]); return o; };
const ell = (x, y, rx, ry, n = 48, a0 = 0, a1 = TAU) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [x + Math.cos(a) * rx, y + Math.sin(a) * ry]; });
const box = (x, y, w, h) => dens([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
function pen(P, o = {}) { const k = o.k ?? 1; if (k <= 0 || P.length < 2) return; const m = k < 1 ? Math.max(2, Math.ceil(P.length * k)) : P.length, j = o.j ?? 1.1, sd = (o.seed || 1) + ST * 13.7;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = o.col || GR; g.setLineDash(o.dash || []);
  for (const [w, al, s2] of [[o.w || 2.8, .85, 0], [(o.w || 2.8) * .55, .45, 5]]) { g.lineWidth = w; g.globalAlpha = (o.a ?? 1) * al; g.beginPath();
    for (let i = 0; i < m; i++) { const [x, y] = P[i]; const dx = (hash(sd + i * .71 + s2) - .5) * j * 2, dy = (hash(sd * 1.3 + i * .53 + s2) - .5) * j * 2; i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy); } g.stroke(); }
  g.restore(); }
function hatch(P, col, o = {}) { const a = o.a ?? .55; if (a <= 0) return; g.save(); g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; P.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
  g.strokeStyle = col; g.lineWidth = o.w || 2; g.globalAlpha = a; const sp = o.sp || 10, ang = o.ang ?? 1.0, L = (x1 - x0) + (y1 - y0); g.beginPath();
  for (let d = -L; d < L; d += sp) { const jx = (hash(d * .13 + ST * 3.1) - .5) * 2.5; g.moveTo(x0 + d + jx, y1); g.lineTo(x0 + d + jx + (y1 - y0) / Math.tan(ang), y0); } g.stroke(); g.restore(); }
function wash(P, col, a = .35) { g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); }
function hand(str, x, y, size, o = {}) { const k = o.k ?? 1; if (k <= 0) return; g.save(); g.globalAlpha = clamp(k * 3) * (o.a ?? 1); g.font = `${size}px Hand`; g.textAlign = o.align || 'center'; g.fillStyle = o.col || GR;
  const n = o.write == null ? str.length : Math.floor(str.length * clamp(o.write)); if (o.rot) { g.translate(x, y); g.rotate(o.rot); g.fillText(str.slice(0, n), 0, 0); } else g.fillText(str.slice(0, n), x, y); g.restore(); }
function slip(x, y, w, h, rot, lines, o = {}) { const k = o.k ?? 1; if (k <= 0) return; const st = Math.floor(clamp(k) * 4) / 4, dy = (1 - eo(st)) * 260;   // slides in on 12 fps steps (stop motion)
  g.save(); g.globalAlpha = clamp(k * 4); g.translate(x + w / 2, y + h / 2 + dy); g.rotate(rot); g.shadowColor = 'rgba(40,40,40,.25)'; g.shadowBlur = 14; g.shadowOffsetY = 6; g.fillStyle = o.col || '#f8f7f1'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(60,60,60,.35)'; g.lineWidth = 1.5; g.strokeRect(-w / 2, -h / 2, w, h); lines.forEach((ln, i) => { const [txt, al, sz, col, f] = Array.isArray(ln) ? ln : [ln]; g.font = `${sz || 40}px ${f || 'Typed'}`; g.fillStyle = col || '#2b2b2b'; g.textAlign = al || 'left';
    g.fillText(txt, al === 'right' ? w / 2 - 24 : al === 'center' ? 0 : -w / 2 + 24, -h / 2 + 56 + i * (o.lh || 50)); }); g.restore(); }
const plus = (x, y, r = 12, o = {}) => { pen([[x - r, y], [x + r, y]], { w: 2.4, ...o }); pen([[x, y - r], [x, y + r]], { w: 2.4, ...o }); };
function sun(x, y, r, k = 1, o = {}) { if (k <= 0) return; g.save(); g.globalAlpha = k; if (o.glare) { const rg = g.createRadialGradient(x, y, r * .5, x, y, r * 4.5); rg.addColorStop(0, 'rgba(255,236,150,.9)'); rg.addColorStop(1, 'rgba(255,236,150,0)'); g.fillStyle = rg; g.fillRect(x - r * 5, y - r * 5, r * 10, r * 10); }
  const C = ell(x, y, r, r, 40); wash(C, YEL, .55); hatch(C, '#d6a92a', { a: .5, sp: 8 }); pen(C, { seed: 11 }); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .2; pen([[x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3], [x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75]], { seed: 12 + i }); } g.restore(); }
// moon: lit fraction f (0 new .. .5 quarter .. 1 full), side 'R' (waxing, lit on the right) or 'L'
function moon(x, y, r, f, side = 'R', o = {}) { const k = o.k ?? 1; if (k <= 0) return; g.save(); g.globalAlpha = k; const C = ell(x, y, r, r, 44);
  wash(C, '#c9c6bb', .45); hatch(C, '#6a6a70', { a: .3, sp: 9, ang: .8 }); const sgn = side === 'R' ? 1 : -1, tx = r * (1 - 2 * f); g.save(); g.beginPath(); g.ellipse(x, y, r, r, 0, -Math.PI / 2, Math.PI / 2, sgn < 0); g.ellipse(x, y, Math.abs(tx), r, 0, Math.PI / 2, -Math.PI / 2, (sgn > 0) === (tx > 0)); g.closePath();
  g.fillStyle = '#f3d670'; g.globalAlpha = k * (o.faint ?? 1); g.fill(); g.clip(); hatch(C, '#c9b35a', { a: .35, sp: 9, ang: 2.2 }); g.restore();
  pen(C, { seed: 21, a: o.faint ?? 1 }); for (const [cx, cy, cr] of [[.3, -.25, .14], [-.1, .3, .1], [.45, .25, .08]]) if (side === 'R' ? cx > -.1 : cx < .1) pen(ell(x + cx * r * sgn, y + cy * r, cr * r, cr * r, 14), { seed: 22, w: 1.6, a: .5 * (o.faint ?? 1) }); g.restore(); }
function cloud(x, y, sc, sd) { const P = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI, bump = 1 + .22 * Math.abs(Math.sin(a * 3 + sd)); P.push([x + Math.cos(a) * 120 * sc * bump, y + Math.sin(a) * 55 * sc * bump]); } P.push([x - 120 * sc, y]); pen(P, { seed: 30 + sd, w: 2.4, a: .7 }); }
function clouds(t, k = 1) { if (k <= 0) return; g.save(); g.globalAlpha = k; for (let i = 0; i < 3; i++) { const x = ((t * (12 + i * 5) + i * 420) % 1500) - 210, y = 420 + i * 170; cloud(x, y, .75 - i * .1, i); } g.restore(); }
function skyTint(k = 1, x1 = W) { if (k <= 0) return; wash(box(0, 250, x1, HY - 250), '#b9cde6', .35 * k); hatch(box(0, 250, x1, HY - 250), '#6f93c8', { a: .4 * k, sp: 11, ang: .9, w: 2.4 }); }
function ground() { pen(dens([[-20, HY], [200, HY - 18], [420, HY - 6], [640, HY - 26], [860, HY - 10], [1100, HY - 20]], false, 18), { seed: 40, w: 3 });
  hatch(dens([[0, 1365], [1080, 1365], [1080, 1920], [0, 1920]], true), '#7a8a5a', { a: .3, sp: 14, ang: .7 }); pen(dens([[-20, 1420], [300, 1395], [640, 1430], [1100, 1400]], false, 20), { seed: 41, w: 2.6 });
  for (let i = 0; i < 18; i++) { const x = 40 + i * 60 + (hash(i) - .5) * 30, y = 1470 + hash(i * 3) * 380; pen([[x - 8, y], [x - 2, y - 22], [x, y], [x + 6, y - 26], [x + 10, y]], { seed: 50 + i, w: 2 }); }
  for (let i = 0; i < 7; i++) { const x = 120 + i * 120; pen([[x, 1560], [x, 1660]], { seed: 70 + i, w: 3 }); } pen(dens([[100, 1590], [860, 1590]], false, 20), { seed: 78, w: 2.4 }); pen(dens([[100, 1635], [860, 1635]], false, 20), { seed: 79, w: 2.4 });
  const hx = 880, hy = 1740; pen(box(hx - 90, hy - 110, 180, 110), { seed: 80 }); pen([[hx - 110, hy - 105], [hx, hy - 190], [hx + 110, hy - 105]], { seed: 81 }); pen(box(hx - 25, hy - 60, 50, 60), { seed: 82 }); }
function person(x, y, o = {}) { pen(ell(x, y - 150, 22, 24, 20), { seed: 90 }); pen([[x, y - 126], [x, y - 50]], { seed: 91 }); pen([[x, y - 50], [x - 22, y]], { seed: 92 }); pen([[x, y - 50], [x + 22, y]], { seed: 93 });
  pen([[x, y - 110], [x - 30, y - 70]], { seed: 94 }); if (o.point) { const w = o.wave ? Math.sin(T * 9) * 14 : 0; pen([[x, y - 112], [x + 40 + w, y - 168 - w * .4]], { seed: 95 }); } else pen([[x, y - 110], [x + 30, y - 70]], { seed: 95 }); }
function gauge(x, y, h, v, marks, k = 1) { if (k <= 0) return; g.save(); g.globalAlpha = k; const tube = dens([[x - 22, y], [x + 22, y], [x + 22, y + h], [x - 22, y + h]], true), bulb = ell(x, y + h + 26, 36, 36, 30);
  const lv = y + h * (1 - v); hatch(dens([[x - 22, lv], [x + 22, lv], [x + 22, y + h + 20], [x - 22, y + h + 20]], true), GR, { a: .55, sp: 8 }); hatch(bulb, GR, { a: .55, sp: 8 }); pen(tube, { seed: 100 }); pen(bulb, { seed: 101 });
  marks.forEach(([u, label, col, dash, kk], i) => { const yy = y + h * (1 - u); pen([[x - 44, yy], [x + 44, yy]], { seed: 110 + i, col, w: 3, dash: dash ? [10, 8] : [] }); hand(label, x + 60, yy + 14, 46, { col, align: 'left', k: kk ?? 1 }); }); g.restore(); }
function clock(x, y, r, o = {}) { const k = o.k ?? 1; if (k <= 0) return; g.save(); g.globalAlpha = k; const C = ell(x, y, r, r, 60);
  const day = [[x, y], ...ell(x, y, r, r, 30, Math.PI, TAU)]; wash(day, '#f3e7b0', .45); const night = [[x, y], ...ell(x, y, r, r, 30, 0, Math.PI)]; hatch(night, '#4a5a9a', { a: .3, sp: 10 });
  pen(C, { seed: 120, w: 3.2 }); for (let h = 0; h < 24; h++) { const a = -Math.PI / 2 + (h - 12) / 24 * TAU, L = h % 6 ? 14 : 28; pen([[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a) * (r - L), y + Math.sin(a) * (r - L)]], { seed: 121 + h, w: 2.4 }); }
  [['noon', 12], ['6 pm', 18], ['midnight', 0], ['6 am', 6]].forEach(([w, h]) => { const a = -Math.PI / 2 + (h - 12) / 24 * TAU; hand(w, x + Math.cos(a) * (r + 62), y + Math.sin(a) * (r + 62) + 14, 40); });
  const hd = (hr, col, rr, sd) => { const a = -Math.PI / 2 + (hr - 12) / 24 * TAU; pen([[x, y], [x + Math.cos(a) * rr, y + Math.sin(a) * rr]], { seed: sd, col, w: 5 }); return [x + Math.cos(a) * (rr + 10), y + Math.sin(a) * (rr + 10)]; };
  if (o.sun != null) { const p = hd(o.sun, '#c7962a', r * .62, 130); sun(p[0], p[1], 22); } if (o.moon != null) { const p = hd(o.moon, BLUE, r * .82, 131); moon(p[0], p[1], 24, .5, 'R'); }
  if (o.up) { const a0 = -Math.PI / 2 + (o.up[0] - 12) / 24 * TAU, a1 = -Math.PI / 2 + (o.up[1] - 12) / 24 * TAU; pen(ell(x, y, r + 18, r + 18, 40, a0, a1), { seed: 132, col: BLUE, w: 6 }); }
  pen(ell(x, y, 8, 8, 10), { seed: 133 }); g.restore(); }

// ---------- scenes ----------
const SC = [];
const daySky = (t, k = 1) => { skyTint(k); clouds(t, .8); };
SC[0] = (t, lt) => { daySky(t); sun(820, 640, 90); moon(330, 470, 130, .5, 'R'); slip(560, 300, 300, 110, .03, [['3:30 pm', 'center', 60, '#2b2b2b', 'Typed']], { k: 1 }); hand('the Moon?', 330, 680, 60, { col: BLUE }); pen(dens([[330, 636], [330, 604]], false), { col: BLUE, seed: 140 }); person(260, HY - 4, { point: true, wave: 1 }); cloud(((T * 40) % 900) + 60, 520, .6, 7); };
SC[1] = (t, lt) => { const L = dens([[0, 250], [540, 250], [540, HY], [0, HY]], true), Rr = dens([[540, 250], [1080, 250], [1080, HY], [540, HY]], true);   // split page: night vs day
  wash(L, '#3d4870', .55); hatch(L, '#2a3358', { a: .45, sp: 9 }); hatch(Rr, SKYB, { a: .3, sp: 12, ang: .9 }); pen(dens([[540, 250], [540, HY]], false, 14), { seed: 143, w: 3 });
  moon(270, 470, 100, .25, 'R', { night: 1 }); for (const [x, y] of [[90, 330], [420, 360], [130, 640], [460, 700], [300, 860]]) plus(x, y, 12, { col: '#e8e6dc' });
  hand('night', 270, 980, 60, { col: '#f2efe4' }); hand('day', 810, 980, 60, { col: '#a87b14' }); sun(880, 700, 70);
  const k = (lt - .9) / .5; moon(720, 470, 100, .5, 'R', { k: clamp(k) }); hand('?', 720, 500, 120, { col: BLUE, k: 1 - clamp(k) });
  slip(600, 560, 400, 110, .03, [['night only?', 'center', 44]], { k: (lt - 1.6) / .4 }); if (lt > 2.2) pen([[610, 590], [990, 650]], { col: RED, w: 5, seed: 141 }); };
SC[2] = (t, lt) => { sun(880, 420, 80); moon(460, 520, 80, .5, 'R'); const u = clamp(lt / 1.2); for (let i = 0; i < 4; i++) { const y0 = 380 + i * 30; pen(dens([[790, y0], [lerp(790, 560, u), lerp(y0, 480 + i * 22, u)]], false), { col: '#c7962a', w: 3.2, seed: 150 + i }); }
  if (lt > 1.2) { const v = clamp((lt - 1.2) / 1); for (let i = 0; i < 3; i++) pen(dens([[440 - i * 20, 610], [lerp(440 - i * 20, 300 - i * 50, v), lerp(610, 1040, v)]], false), { col: '#c7962a', w: 3, seed: 160 + i, dash: [12, 10] }); }
  hand('sunlight in', 690, 340, 46, { col: '#a87b14', k: lt / .4 }); hand('bounces to us', 260, 880, 48, { col: '#a87b14', k: (lt - 1.6) / .4 }); hand('no light of its own', 460, 700, 44, { k: (lt - .6) / .4 }); };
SC[3] = (t, lt) => { const u = clamp(lt / 2.4); skyTint(1, W * u); clouds(t, .6); sun(860, 520, 70); moon(330, 470, 130, .5, 'R', { k: 1 }); hand('still visible', 330, 670, 56, { col: BLUE, k: (lt - 2) / .4 }); };
SC[4] = (t, lt) => { const u = clamp(lt / 2.2); skyTint(u); for (let i = 0; i < 9; i++) plus(120 + hash(i) * 840, 320 + hash(i * 3) * 600, 13, { a: 1 - u * .85, seed: 170 + i }); hand('stars: still up there', 540, 540, 56, { k: lt / .4 }); hand('lost in the glare', 540, 640, 56, { col: RED, k: (lt - 1.6) / .4 }); sun(880, 420, 60, 1, { glare: 1 }); };
SC[5] = (t, lt) => { daySky(t, .5); const v = lerp(.15, .86, eo(clamp((lt - .3) / 1.6))); gauge(330, 340, 600, v, [[.86, 'Moon', BLUE, 0], [.6, 'daytime sky', '#2b6cc4', 1], [.22, 'stars', RED, 1]]); hand('brightness', 330, 1060, 46, {}); moon(760, 420, 60, .5, 'R'); };
SC[6] = (t, lt) => { clock(540, 680, 300, { k: lt / .4, sun: 12 + 3.5 * clamp(lt / 3) }); hand('?', 540, 700, 120, { col: BLUE, k: (lt - .8) / .3 }); };
SC[7] = (t, lt) => { const ex = 540, ey = 680, R = 290; pen(ell(ex, ey, R, R, 70), { seed: 180, dash: [14, 12] }); pen(ell(ex, ey, 70, 70, 30), { seed: 181 }); hatch(ell(ex, ey, 70, 70, 30), '#4a7ac0', { a: .35 }); hand('Earth', ex, ey + 14, 40, {});
  const a = -Math.PI / 2 + T * .6; moon(ex + Math.cos(a) * R, ey + Math.sin(a) * R, 46, .5, 'R'); for (let i = 1; i < 6; i++) { const b = a - i * .12; plus(ex + Math.cos(b) * R, ey + Math.sin(b) * R, 4, { a: .5 }); } hand('orbit, about a month', 540, 1060, 52, { col: BLUE, k: (lt - 1) / .4 }); sun(980, 330, 40); hand('sunlight', 870, 330, 40, { col: '#a87b14', align: 'right' }); };
const LEDG = [['MON', '12:00'], ['TUE', '12:50'], ['WED', '13:40'], ['THU', '14:30']];
SC[8] = (t, lt) => { slip(150, 290, 640, 96, -.01, [['moonrise log (about)', 'left', 40, '#555']], { k: lt / .3 }); LEDG.forEach(([d, tm], i) => { slip(150, 420 + i * 150, 540, 110, (hash(i) - .5) * .04, [[`${d}    rises ${tm}`, 'left', 46]], { k: (lt - .4 - i * .45) / .35 });
  if (i > 0 && lt > .8 + i * .45) { hand('+50 min', 726, 438 + i * 150, 46, { col: RED, align: 'left' }); pen(dens([[700, 380 + i * 150], [722, 400 + i * 150], [700, 420 + i * 150]], false), { col: RED, w: 3, seed: 190 + i }); } }); };
SC[9] = (t, lt) => { const days = Math.min(29, Math.floor(lt / 3.1 * 29)); clock(540, 690, 300, { moon: (12 + days * 50 / 60) % 24, up: [(12 + days * 50 / 60) % 24 - 6, (12 + days * 50 / 60) % 24 + 6] }); slip(390, 270, 300, 90, .02, [[`day ${days + 1}`, 'center', 48]], { k: 1 }); hand('moonrise', 540, 1080, 44, { col: BLUE }); };
SC[10] = (t, lt) => { const u = eo(clamp(lt / 1.4)); const bar = (x, h, col, lab, sd) => { const B = dens([[x, 1000 - h * u], [x + 220, 1000 - h * u], [x + 220, 1000], [x, 1000]], true); hatch(B, col, { a: .5, sp: 9 }); pen(B, { seed: sd }); hand(lab, x + 110, 1060, 44, {}); };
  bar(180, 560, '#d6a92a', 'in the day sky', 200); bar(620, 590, '#4a5a9a', 'at night', 201); pen(dens([[120, 1000], [960, 1000]], false), { seed: 202 }); hand('almost as much', 540, 340, 62, { col: BLUE, k: (lt - 1.4) / .4 }); sun(290, 380, 34); moon(730, 380, 34, .5, 'R'); };
const PHS = [['new', 0, 'R'], ['first quarter', .5, 'R'], ['full', 1, 'R'], ['third quarter', .5, 'L']];
SC[11] = (t, lt) => { PHS.forEach(([w, f, sd], i) => { const x = 130 + (i % 2) * 420, y = 300 + Math.floor(i / 2) * 380, k = (lt - i * .3) / .35; slip(x, y, 380, 330, (hash(i + 4) - .5) * .05, [[w, 'center', 42]], { k }); if (k > .9) moon(x + 190, y + 210, 70, f, sd, { faint: f === 0 ? .4 : 1 }); });
  if (lt > 1.6) { hand('best?', 540, 1080, 60, { col: RED }); } };
SC[12] = (t, lt) => { skyTint(1); sun(620, 520, 70, 1, { glare: 1 }); moon(800, 470, 44, .03, 'R', { faint: .35 }); hand('new Moon: next to the Sun', 480, 800, 52, { k: lt / .4 }); hand('lost in the glare', 480, 880, 52, { col: RED, k: (lt - 1.2) / .4 }); pen(dens([[800, 530], [760, 760]], false), { col: RED, w: 3, seed: 210, k: clamp((lt - 1.4) / .4) }); };
SC[13] = (t, lt) => { daySky(t); sun(820, 620, 70); moon(330, 450, 125, .5, 'R'); slip(130, 660, 420, 120, -.02, [['first quarter', 'left', 40], ['rises ~ noon', 'left', 38, BLUE]], { k: (lt - .3) / .35 }); hand('all afternoon', 330, 850, 56, { col: BLUE, k: (lt - 1.6) / .4 }); hand('afternoon', 820, 760, 46, { col: '#a87b14' }); };
SC[14] = (t, lt) => { daySky(t); sun(250, 640, 70); moon(750, 450, 125, .5, 'L'); slip(470, 660, 400, 120, .02, [['third quarter', 'left', 40], ['morning sky', 'left', 38, BLUE]], { k: (lt - .3) / .35 }); hand('morning', 250, 780, 46, { col: '#a87b14' }); };
SC[15] = (t, lt) => { const hr = 9 + lt * 1.4; clock(540, 690, 300, { sun: hr, moon: hr + 3 + lt * .6 }); hand('its own schedule', 540, 300, 62, { col: BLUE, k: lt / .4 }); };
SC[16] = (t, lt) => { daySky(t); sun(820, 600, 70); moon(330, 450, 125, .5, 'R'); person(300, HY - 4, { point: true }); slip(450, 280, 470, 140, .02, [['~1 week after new Moon', 'left', 34], ['clear afternoon', 'left', 34, BLUE]], { k: (lt - .3) / .35 }); };
SC[17] = (t, lt) => { daySky(t); sun(820, 600, 70); moon(330, 450, 125, .5, 'R'); person(300, HY - 4, { point: true }); pen(ell(330, 450, 165, 158, 50), { col: BLUE, w: 5, seed: 220, k: clamp(lt / .5) }); hand('?', 545, 360, 110, { col: BLUE, k: (lt - .4) / .3 }); };
SC[18] = (t, lt) => { moon(150, 330, 56, .3, 'R', { night: 1 }); for (const [x, y] of [[300, 300], [440, 340], [360, 420], [120, 470]]) plus(x, y, 12);
  slip(180, 560, 720, 130, -.015, [['Follow for more of', 'center', 56]], { k: lt / .3 }); slip(160, 720, 760, 130, .012, [['how it really works.', 'center', 60, BLUE]], { k: (lt - .3) / .3 }); pen(dens([[300, 820], [780, 818]], false), { col: BLUE, w: 4, seed: 230, k: clamp((lt - .7) / .5) });
  hand("A new 'wait, really?' every day.", 540, 960, 50, { k: (lt - .8) / .4 }); hand('@howitreallyworkstudio', 540, 1040, 44, { col: GR, k: (lt - 1) / .4 }); };

// ---------- caption strip (typed on, like the demo) ----------
function strip(t) { let i = -1; for (let k = 0; k < N - 1; k++) if (t >= PH[k].start - .1) i = k; if (i < 0 && t < PH[0].start) i = 0; if (i < 0 || i >= N - 1) return; const p = PH[i];
  g.save(); g.translate(540, 1256); g.rotate(-.006); g.shadowColor = 'rgba(30,30,30,.25)'; g.shadowBlur = 16; g.shadowOffsetY = 6; g.fillStyle = '#f6f5ee'; g.fillRect(-480, -96, 960, 194); g.restore();
  for (const [tx, tr] of [[95, -.35], [985, .3]]) { g.save(); g.translate(tx, 1166); g.rotate(tr); g.fillStyle = 'rgba(236,220,160,.8)'; g.fillRect(-60, -18, 120, 36); g.restore(); }
  g.save(); g.font = '48px Hand'; g.fillStyle = '#2b2b2b'; const words = p.cap.replace(/\*\*/g, '').split(' '), lines = [[]]; let lw = 0; words.forEach(w => { const ww = g.measureText(w + ' ').width; if (lw + ww > 790 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += ww; });
  const shown = Math.floor(Math.max(0, Math.floor((t - p.start + .05) * 12) / 12) * 70); let c = 0; const y0 = lines.length >= 3 ? 1218 : lines.length === 2 ? 1244 : 1272;
  lines.forEach((ln, j) => { let str = ln.join(' '); if (c + str.length > shown) str = str.slice(0, Math.max(0, shown - c)); g.fillText(str, 100, y0 + j * 54); c += ln.join(' ').length + 1; }); g.restore(); }

// ---------- frame ----------
const START = PH.map(p => p.start - .2); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < N; i++) if (t >= START[i]) k = i; return k; }
function paperBg() { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); const rg = g.createRadialGradient(540, 800, 300, 540, 900, 1300); rg.addColorStop(0, 'rgba(255,255,255,.35)'); rg.addColorStop(1, 'rgba(120,120,110,.28)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); g.drawImage(FIB, 0, 0); }
const FIB = document.createElement('canvas'); FIB.width = W; FIB.height = H; { const c = FIB.getContext('2d'); for (let i = 0; i < 2600; i++) { const x = hash(i * 1.7) * W, y = hash(i * 2.9) * H, a = hash(i * 4.1) * TAU, L = 6 + hash(i * 5.3) * 22; c.strokeStyle = `rgba(90,90,80,${.04 + hash(i) * .05})`; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); } }
function draw(t) { ST = Math.floor(t * 12); T = ST / 12; const k = sceneAt(t), lt = Math.floor((t - START[k]) * 12) / 12 + (k === 0 ? .2 : 0);
  g.setTransform(1, 0, 0, 1, 0, 0); paperBg(); if (k === 0) { const z = 1.12 - .1 * eo(lt / 3.4); g.translate(330, 470); g.scale(z, z); g.translate(-330, -470); }   // hook: a slow stop-motion push in on the Moon
  if (k < N - 1) ground(); SC[k](T, lt); g.setTransform(1, 0, 0, 1, 0, 0); if (k < N - 1) strip(t); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H;
function frame(t) { draw(t); const kk = ss(TOT - .5, TOT, t) * .4; if (kk > 0) { g.save(); g.globalAlpha = kk; g.drawImage(F0, 0, 0); g.restore(); } }
const r = (i, d = 0) => s(i) + d;
window.CUES = [['pageturn', .2], ['tick', 1.2], ['pageturn', r(1, -.2)], ['scribble', r(1, 1), r(1, 1.5)], ['pageturn', r(2, -.2)], ['slide', r(2, .3)], ['slide', r(2, 1.3)], ['pageturn', r(3, -.2)], ['scribble', r(3, 0), r(3, 2.4)], ['pageturn', r(4, -.2)], ['sparkle', r(4, .3)],
  ['pageturn', r(5, -.2)], ['slide', r(5, .3)], ['chime', r(5, 1.8), 76], ['pageturn', r(6, -.2)], ['tick', r(6, .5)], ['tick', r(6, 1)], ['tick', r(6, 1.5)], ['pageturn', r(7, -.2)], ['whoosh', r(7, .5)], ['pageturn', r(8, -.2)], ['slide', r(8, .4)], ['slide', r(8, .85)], ['slide', r(8, 1.3)], ['slide', r(8, 1.75)],
  ['pageturn', r(9, -.2)], ['tick', r(9, .5)], ['tick', r(9, 1)], ['tick', r(9, 1.5)], ['tick', r(9, 2)], ['tick', r(9, 2.5)], ['pageturn', r(10, -.2)], ['scribble', r(10, .2), r(10, 1.4)], ['pageturn', r(11, -.2)], ['slide', r(11, 0)], ['slide', r(11, .3)], ['slide', r(11, .6)], ['slide', r(11, .9)],
  ['pageturn', r(12, -.2)], ['scribble', r(12, 1.4), r(12, 1.8)], ['pageturn', r(13, -.2)], ['slide', r(13, .3)], ['chime', r(13, 1.6), 79], ['pageturn', r(14, -.2)], ['slide', r(14, .3)], ['pageturn', r(15, -.2)], ['tick', r(15, .6)], ['tick', r(15, 1.6)], ['pageturn', r(16, -.2)], ['slide', r(16, .3)],
  ['scribble', r(17, 0), r(17, .5)], ['chime', r(18, .2), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { ST = 5; T = 1; g.setTransform(1, 0, 0, 1, 0, 0); paperBg(); ground(); skyTint(1); sun(820, 640, 90); moon(330, 430, 110, .5, 'R'); person(260, HY - 4, { point: true });
  slip(90, 1150, 900, 210, -.01, [['Why is the Moon', 'left', 76, '#2b2b2b', 'Hand'], ['out in the DAY?', 'left', 80, BLUE, 'Hand']], { k: 1, lh: 84 }); };
Promise.all([document.fonts.load('40px Hand'), document.fonts.load('40px Typed'), document.fonts.load('600 40px Mono')]).then(() => { draw(0); F0.getContext('2d').drawImage(cv, 0, 0); window.seek(0); window.ready = true; window.READY = true; });
