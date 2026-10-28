// t_fog.js: "Where does fog come from?" in template #29 Particle flock (demo t29, x.com/ajith_io), on the coldbreath engine (as twinkle, EP 94). Canvas2D 1080x1920, pure function of t.
// The flock is the fog: ~420 soft droplet particles re-form scene to scene (a valley bank, a cloud that sinks to the ground, vapour turning into droplets,
// a layer growing from the ground up, a bank drifting in sideways over cold water, Golden Gate fog). Demo moves kept: gradient skies, the flock morphing
// between shapes, the glowing orb (here the sun), handwritten notes with curved arrows, bold Inter titles. Own dawn-valley / grey / sea palette.
// Batch N layout: caption box bottom-anchored at y 1360 inside x 70-890, content inside y 250-1130, nothing written in x > 900 below y 840.
await Promise.all(['800 80px Inter', '600 50px Inter', '60px Hand'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let c = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const fr = x => x - Math.floor(x), hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453), tri = u => 1 - Math.abs(2 * fr(u) - 1);
const N = 420, HS = Array.from({ length: N }, (_, i) => [1, 2, 3, 4, 5, 6].map(k => hash(i * 7.31 + k * 1.913)));
const INK = '#16233a', WARM = '#ffcf8a', COLD = '#9fd8ff', FOGC = '#eef3f7', PEACH = '#ffb48a';
const GY = 1080;   // ground line

// ---------- backgrounds (a dawn-valley palette, distinct from twinkle's violet night) ----------
const BG = {
  night: ['#09142b', '#0f2040', '#183058', '#22406c'],
  dawn: ['#24365a', '#5d6690', '#c2959c', '#f2c49a'],
  grey: ['#56677a', '#7a8898', '#a1acb8', '#c5ccd3'],
  sea: ['#1f3d55', '#36627b', '#79a0b2', '#b6ccd4'],
  day: ['#4f86b8', '#7fa9cf', '#b5cfe3', '#e3ecf2'],
};
function sky(name, a = 1) { if (a <= 0) return; const b = BG[name]; c.save(); c.globalAlpha = a;
  const g = c.createLinearGradient(0, 0, 0, 1300); b.forEach((col, i) => g.addColorStop(i / 3, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (name === 'night') for (let i = 0; i < 60; i++) { const x = hash(i * 3.3) * W, y = 250 + hash(i * 5.7) * 700, r = 1 + 1.6 * hash(i * 9.1); c.globalAlpha = a * (.3 + .4 * hash(i * 2.2)); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  c.restore(); }
// valley hills: two dark slopes meeting low in the middle
function hills(a = 1, col = '#121d2e', y0 = GY) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.moveTo(0, H); c.lineTo(0, y0 - 230);
  for (let x = 0; x <= W; x += 20) { const v = Math.abs(x - 540) / 540; c.lineTo(x, y0 - 230 * v * v + 14 * Math.sin(x * .02)); } c.lineTo(W, H); c.closePath(); c.fill(); c.restore(); }
function flat(a = 1, col = '#14202f', y0 = GY) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.moveTo(0, H); c.lineTo(0, y0); for (let x = 0; x <= W; x += 30) c.lineTo(x, y0 - 8 * Math.sin(x * .013) - 6 * Math.sin(x * .031)); c.lineTo(W, H); c.closePath(); c.fill(); c.restore(); }
function sea(t, a = 1, x0 = 0, x1 = W, y0 = 1000) { if (a <= 0) return; c.save(); c.globalAlpha = a; const g = c.createLinearGradient(0, y0, 0, y0 + 300); g.addColorStop(0, '#2f6f95'); g.addColorStop(1, '#123049'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, H - y0);
  c.strokeStyle = 'rgba(200,235,255,.35)'; c.lineWidth = 3; for (let j = 0; j < 4; j++) { c.beginPath(); for (let x = x0; x <= x1; x += 20) c.lineTo(x, y0 + 18 + j * 26 + 4 * Math.sin(x * .04 + t * 2 + j)); c.stroke(); } c.restore(); }
function sun(x, y, r, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; const g = c.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, 'rgba(255,236,190,.9)'); g.addColorStop(.3, 'rgba(255,200,140,.35)'); g.addColorStop(1, 'rgba(255,200,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3, 0, TAU); c.fill();
  c.fillStyle = '#ffe7b0'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); }
function heat(x, y, t, a = 1, col = PEACH) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = 5; c.lineCap = 'round'; const u = fr(t * .5 + x * .001); c.beginPath(); for (let j = 0; j <= 12; j++) { const yy = y - j * 14 - u * 80; c.lineTo(x + 12 * Math.sin(j * 1.2 + t * 4), yy); } c.globalAlpha = a * (1 - u); c.stroke(); c.restore(); }
function person(x, y, sc = 1, a = 1, col = INK) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(sc, sc); c.fillStyle = col;
  c.beginPath(); c.arc(0, -170, 26, 0, TAU); c.fill(); c.beginPath(); c.roundRect(-30, -140, 60, 90, 18); c.fill(); c.fillRect(-26, -60, 20, 60); c.fillRect(6, -60, 20, 60); c.restore(); }
function lamp(x, y, sc, a) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = INK; c.fillRect(x - 5 * sc, y - 260 * sc, 10 * sc, 260 * sc); c.fillRect(x - 5 * sc, y - 260 * sc, 50 * sc, 8 * sc);
  const g = c.createRadialGradient(x + 45 * sc, y - 245 * sc, 0, x + 45 * sc, y - 245 * sc, 80 * sc); g.addColorStop(0, 'rgba(255,220,150,.9)'); g.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(x + 45 * sc, y - 245 * sc, 80 * sc, 0, TAU); c.fill(); c.restore(); }
function bridge(t, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = '#c4462f'; c.fillStyle = '#c4462f';
  [300, 780].forEach(x => { c.fillRect(x - 14, 560, 28, 450); c.fillRect(x - 26, 640, 52, 12); c.fillRect(x - 26, 760, 52, 12); });
  const cab = x => x < 300 ? lerp(890, 570, Math.pow(x / 300, 1.6)) : x < 780 ? 570 + 300 * (1 - Math.pow((x - 540) / 240, 2)) : lerp(570, 890, Math.pow((x - 780) / 300, .6));
  c.lineWidth = 7; c.beginPath(); for (let x = -20; x <= 1100; x += 10) c.lineTo(x, cab(Math.max(0, Math.min(1080, x)))); c.stroke();
  c.lineWidth = 2; for (let x = 20; x < W; x += 34) { const y = cab(x); if (y < 885) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, 900); c.stroke(); } }
  c.fillRect(-20, 900, 1120, 16); c.restore(); }
function gauge(label, v, x, y, k, col) { const u = pop(k); if (u <= 0) return; c.save(); c.globalAlpha *= u; c.fillStyle = 'rgba(10,20,40,.55)'; c.beginPath(); c.roundRect(x - 150, y - 46, 300, 92, 46); c.fill(); c.restore(); txt(`${label} ${v}`, x, y + 2, 44, col, { a: u, glow: false }); }

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

function thermo(x, y, h, lev, col, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.roundRect(x - 16, y - h, 32, h, 16); c.fill(); c.beginPath(); c.arc(x, y + 14, 30, 0, TAU); c.fill();
  c.fillStyle = col; c.beginPath(); c.arc(x, y + 14, 21, 0, TAU); c.fill(); c.fillRect(x - 8, y - h * lev, 16, h * lev + 10); c.restore(); }

function titleL(lines, k, x = 80, y0 = 330, size = 96, gap = 1.12) { const u = pop(k); if (u <= 0) return; lines.forEach(([str, col], j) => txt(str, x + (1 - u) * -30, y0 + j * size * gap, size, col || '#fff', { a: u, align: 'left' })); }
function inCircle(h1, h2, cx, cy, r) { const a = h1 * TAU, d = Math.sqrt(h2) * r; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; }

// ---------- particle formations: f(i, t, lt) -> [x, y] ----------
const drift = (q, t, sp = .012) => fr(q[0] + t * sp * (.6 + q[4])) * (W + 240) - 120;
const F = {
  valley: (i, t) => { const q = HS[i], x = drift(q, t), v = Math.abs(x - 540) / 540; return [x, GY - 40 - q[1] * 170 * (1 - .6 * v) + 30 * v * v * 0 + 8 * Math.sin(t * .6 + q[2] * 6)]; },
  cloud: (cy) => (i, t, lt) => { const q = HS[i], L = [[540, 0, 170], [380, 30, 120], [700, 25, 130], [460, -70, 110], [630, -60, 110]][i % 5], y = typeof cy === 'function' ? cy(lt) : cy; const p = inCircle(q[1], q[2], L[0] + 8 * Math.sin(t * .5 + i), y + L[1], L[2]); return [p[0], p[1] * 1]; },
  room: (i, t) => { const q = HS[i]; return [70 + q[0] * 940 + 10 * Math.sin(t * .4 + q[3] * 6), 420 + q[1] * 650 + 8 * Math.cos(t * .5 + q[2] * 6)]; },
  layer: (top) => (i, t, lt) => { const q = HS[i], tp = typeof top === 'function' ? top(lt, t) : top; return [drift(q, t, .01), GY - 10 - q[1] * (GY - 10 - tp) + 6 * Math.sin(t * .7 + q[2] * 6)]; },
  two: (i, t) => { const q = HS[i], cx = i % 2 ? 760 : 320; return inCircle(q[1], q[2], cx + 6 * Math.sin(t + i), 760 + 6 * Math.cos(t + i), 170); },
  field: (i, t) => { const q = HS[i]; return [q[0] * W, 270 + q[1] * 640 + 4 * Math.sin(t * .3 + q[2] * 6)]; },
  rise: (i, t, lt) => { const q = HS[i], u = clamp(lt / 3.5 - q[3] * .4); return [drift(q, t, .01), GY - 20 - q[1] * 260 - u * (200 + 500 * q[5])]; },
  stream: (i, t) => { const q = HS[i], x = fr(q[0] + t * .09 * (.7 + .5 * q[4])) * (W + 200) - 100; return [x, 880 + q[1] * 150 + 14 * Math.sin(x * .01 + t + q[2] * 6)]; },
  bank: (i, t, lt) => { const q = HS[i], front = 160 + Math.min(900, lt * 110), y = 800 + q[1] * 260; return [W + 60 - Math.pow(q[0], .8) * front + 90 * (q[3] - .5) + 50 * Math.sin(y * .02 + t * .8) + 10 * Math.sin(t + q[3] * 6), y + 10 * Math.sin(t * .7 + q[2] * 6)]; },
  gate: (i, t) => { const q = HS[i], x = fr(q[0] + t * .05 * (.6 + q[4])) * (W + 240) - 120; return [x, 800 + q[1] * 230 + 18 * Math.sin(x * .008 + t * .8)]; },
  halves: (i, t) => { const q = HS[i], left = i % 2 === 0, x0 = left ? 70 : 560; return [x0 + q[0] * 450 + 6 * Math.sin(t + i), 860 + q[1] * 200 + 6 * Math.cos(t * .8 + i)]; },
  band: (i, t) => { const q = HS[i], u = q[0] * 2 - 1; return [CX + u * 420, 1060 + (q[1] - .5) * 60 * (1 - Math.abs(u)) + 26 * Math.sin(u * 4 + t * 1.5)]; },
};
// particle styles: fg (fog droplet: a soft white blob that overlaps into fog), vp (water vapour turning into droplets), dr (a crisp droplet), tw (star), mx (moist air -> fog over cold water)
function drawP(style, x, y, i, t, a, sz = 1, lt = 0) { if (a <= .01 || x < -80 || x > W + 80) return; const q = HS[i]; c.globalAlpha = a;
  if (style === 'fg') { c.globalAlpha = a * .2; c.fillStyle = FOGC; c.beginPath(); c.arc(x, y, (22 + 26 * q[5]) * sz, 0, TAU); c.fill(); }
  else if (style === 'vp') { const k = clamp((lt - .6 - q[3] * 2.4) / .6); c.globalAlpha = a * lerp(.12, .95, k); c.fillStyle = k > .5 ? '#ffffff' : '#9fb7d0'; c.beginPath(); c.arc(x, y, lerp(2, 6 + 3 * q[5], k) * sz, 0, TAU); c.fill(); if (k > .5) { c.globalAlpha = a * .25 * k; c.beginPath(); c.arc(x, y, 18 * sz, 0, TAU); c.fill(); } }
  else if (style === 'tw') { const b = .35 + .65 * Math.abs(Math.sin(t * (2 + 4 * q[3]) + q[4] * 9)); c.globalAlpha = a * b; c.fillStyle = '#fff'; const r = (1.2 + 2.4 * q[5]) * sz; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  else if (style === 'mx') { const k = clamp((x - 420) / 200); if (k < 1) { c.globalAlpha = a * (1 - k) * .85; c.fillStyle = PEACH; c.beginPath(); c.arc(x, y, (4 + 3 * q[5]) * sz, 0, TAU); c.fill(); } if (k > 0) { c.globalAlpha = a * k * .2; c.fillStyle = FOGC; c.beginPath(); c.arc(x, y, (22 + 24 * q[5]) * sz, 0, TAU); c.fill(); } }
  else { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, (4 + 3 * q[5]) * sz, 0, TAU); c.fill(); } }

// ---------- scenes (one per phrase) ----------
const SC = [];
const on = () => .95, rr = (i, d) => s(i) + d;
SC[0] = { bg: 'dawn', style: 'fg', form: F.valley, pa: on, sz: 1.2, under: (lt, t) => { sun(820, 820, 46, .9); hills(1); }, draw: (lt, u, t) => { lamp(170, GY - 120, .8, 1); title([['WHERE DOES', '#fff'], ['FOG COME FROM?', WARM]], 1, 330, 92); } };
SC[1] = { bg: 'grey', style: 'fg', form: F.cloud(lt => lerp(560, 930, ss(1.6, 4.4, lt))), pa: on, sz: 1.1, morph: 1.4, under: (lt, t) => flat(1), draw: (lt, u, t) => { person(860, GY, 1.1, 1); title([['A CLOUD', '#fff'], ['ON THE GROUND', WARM]], lt, 330, 96); arrow(200, 520, 230, 880, lt - 1.8, '#fff', 40); } };
SC[2] = { bg: 'grey', style: 'vp', form: F.room, pa: on, under: (lt, t) => flat(1), draw: (lt, u, t) => { thermo(960, 780, 260, lerp(.8, .25, ss(.3, 3, lt)), COLD, pop(lt)); titleL([['COOL AIR', '#fff'], ['→ DROPLETS', WARM]], lt, 70, 330, 92); note('invisible vapor', 330, 1110 - 0, lt - .4, '#dfe8f0', 54); note('tiny droplets', 760, 1110, lt - 3.2, '#fff', 58); } };
SC[3] = { bg: 'grey', style: 'fg', form: F.room, pa: on, sz: 1.5, under: (lt, t) => { flat(1); [[120, 1], [420, .7], [660, .45], [860, .25]].forEach(([x, k], j) => lamp(x, GY, 1 - j * .18, k)); }, draw: (lt, u, t) => { title([['DENSE FOG', '#fff']], lt, 330, 104); pill('¼ MILE OR LESS', CX, 500, 520, 96, WARM, INK, lt - 1.2); } };
SC[4] = { bg: 'dawn', style: 'fg', form: F.two, pa: on, sz: .9, under: (lt, t) => flat(1), draw: (lt, u, t) => { title([['TWO WAYS', '#fff']], lt, 330, 110); pill('1', 320, 1010, 110, 96, WARM, INK, lt - .5); pill('2', 760, 1010, 110, 96, COLD, INK, lt - .9); } };
SC[5] = { bg: 'night', style: 'tw', form: F.field, pa: () => .8, under: (lt, t) => { hills(1); }, draw: (lt, u, t) => { for (let j = 0; j < 6; j++) heat(130 + j * 160, GY - 70 - 30 * Math.abs(Math.sin(j)), t + j * .7, pop(lt - .8)); titleL([['1. RADIATION', WARM], ['FOG', WARM]], lt, 70, 330, 92); note('clear, calm night', 300, 560, lt - 1.4, '#fff', 58, 'left'); note('ground loses its heat', 540, 760, lt - 2.4, PEACH, 56); } };
SC[6] = { bg: 'night', style: 'fg', form: F.layer((lt) => lerp(GY - 30, 760, ss(.4, 5, lt))), pa: on, sz: 1.1, under: (lt, t) => hills(1), draw: (lt, u, t) => { gauge('HUMIDITY', `${Math.round(lerp(70, 100, ss(.4, 3.6, lt)))}%`, 760, 560, lt - .4, WARM); titleL([['FROM THE', '#fff'], ['GROUND UP', WARM]], lt, 70, 330, 92); arrow(150, 1040, 150, 800, lt - 1.4, '#fff', 0); } };
SC[7] = { bg: 'night', style: 'fg', form: F.layer((lt, t) => lerp(GY - 60, 520, tri(lt / 3.4 + .5) * 0 + ss(.3, 2.6, lt))), pa: on, sz: 1.1, under: (lt, t) => flat(1), draw: (lt, u, t) => { person(240, GY, .55, 1); note('3 ft', 240, GY - 140, lt - .3, '#fff', 56); c.save(); c.globalAlpha = pop(lt - 1.2); c.fillStyle = INK; c.fillRect(800, 520, 40, GY - 520); c.fillRect(790, 500, 60, 24); c.restore(); note('~1,000 ft', 700, 470, lt - 1.4, WARM, 60); title([['HOW DEEP?', '#fff']], lt, 330, 100); } };
SC[8] = { bg: 'dawn', style: 'fg', form: F.rise, pa: (i, t, lt) => .95 * (1 - ss(1.2, 4.2, lt - HS[i][3])), sz: 1.1, under: (lt, t) => { sun(760, lerp(1080, 640, ss(0, 3.4, lt)), 60, 1); hills(1); }, draw: (lt, u, t) => { title([['THE SUN', '#fff'], ['BURNS IT OFF', WARM]], lt, 330, 96); } };
SC[9] = { bg: 'sea', style: 'mx', form: F.stream, pa: on, under: (lt, t) => { sea(t, 1, 420, W, 1040); flat(1, '#2a3a2a', 1040); c.save(); c.beginPath(); c.rect(0, 0, 440, H); c.clip(); flat(1, '#3d5235', 1040); c.restore(); }, draw: (lt, u, t) => { titleL([['2. ADVECTION', COLD], ['FOG', COLD]], lt, 70, 330, 92); note('warm, moist air', 230, 800, lt - 1.2, PEACH, 54); note('cold water', 720, 1150, lt - 2.4, COLD, 56); arrow(120, 870, 420, 870, lt - 1.4, PEACH, -10); } };
SC[10] = { bg: 'sea', style: 'fg', form: F.bank, pa: on, sz: 1.2, under: (lt, t) => { sea(t, 1, 0, W, 1040); }, draw: (lt, u, t) => { titleL([['CHILLED', '#fff'], ['FROM BELOW', COLD]], lt, 70, 330, 92); arrow(860, 700, 520, 700, lt - 1.4, '#fff', 0); note('drifts in sideways', 560, 620, lt - 1.8, '#fff', 56); } };
SC[11] = { bg: 'sea', style: 'fg', form: F.gate, pa: on, sz: 1.2, under: (lt, t) => { sea(t, 1, 0, W, 1000); bridge(t, 1); for (let j = 0; j < 4; j++) { const u = fr(t * .4 + j / 4); c.save(); c.globalAlpha = .8 * (1 - u); c.fillStyle = COLD; c.beginPath(); c.arc(150 + j * 230, 1120 - u * 110, 10, 0, TAU); c.fill(); c.restore(); } }, draw: (lt, u, t) => { title([['SAN FRANCISCO', '#fff']], lt, 330, 92); note('cold water wells up from below', 540, 470, lt - 2.6, COLD, 56); } };
SC[12] = { bg: 'dawn', style: 'fg', form: F.halves, pa: on, sz: .9, under: (lt, t) => { flat(1); sea(t, 1, 560, W, 1060); }, draw: (lt, u, t) => { title([['A CLOUD AT', '#fff'], ['GROUND LEVEL', WARM]], lt, 330, 96); note('ground cools it', 290, 780, lt - 2.4, PEACH, 50); note('over something cold', 790, 780, lt - 5.0, COLD, 50); } };
SC[13] = { bg: 'grey', style: 'fg', form: F.room, pa: on, sz: 1.4, under: (lt, t) => flat(1), draw: (lt, u, t) => { person(lerp(300, 620, ss(0, 3, lt)), GY, 1.3, .9); title([['WALKED THROUGH', '#fff'], ['A CLOUD?', WARM]], lt, 330, 92); pill('YES', 400, 640, 220, 104, WARM, INK, lt - .9); pill('NO', 660, 640, 190, 104, '#fff', INK, lt - 1.1); } };
SC[14] = { bg: 'dawn', style: 'fg', form: F.band, pa: () => .9, sz: .8, under: (lt, t) => hills(1), draw: (lt, u, t) => { const a = pop(lt);
  txt('Follow for more of', CX, 560, 80, '#fff', { a }); txt('how it really works.', CX, 660, 80, WARM, { a }); txt("A new 'wait, really?' every day.", CX, 790, 50, '#fff', { a: a * .9, f: 'Hand', wt: 400 }); txt('@howitreallyworkstudio', CX, 870, 46, COLD, { a: a * .9, wt: 600 }); } };

const START = PH.map(p => p.start); START[0] = 0;
const MORPH = 1.1;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .3) k = i; return k; }
// ---------- captions (karaoke, inside x 70-890) ----------
function caption(t) { let k = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .15 && t <= (i + 1 < PH.length ? PH[i + 1].start - .15 : TOT)) k = i; if (k < 0 || k === PH.length - 1) return; const p = PH[k];
  // bold (**...**) state carries across words
  let bold = false; const toks = p.cap.split(' ').map(w => { const st = w.startsWith('**'), en = w.endsWith('**') || w.replace(/[.,!?:;]+$/, '').endsWith('**'); if (st) bold = true; const r = { w: w.replace(/\*\*/g, ''), b: bold }; if (en) bold = false; return r; });
  c.save(); c.font = '600 52px Inter'; const maxW = 770, lines = [[]]; let lw = 0; toks.forEach(o => { const ww = c.measureText(o.w + ' ').width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...o, ww }); lw += ww; });
  const lh = 66, bh = lines.length * lh + 44, by = 1360 - bh, fade = clamp((t - p.start + .15) / .25); c.globalAlpha = fade;
  c.fillStyle = 'rgba(14,28,48,.62)'; c.beginPath(); c.roundRect(70, by, 820, bh, 34); c.fill();
  const n = toks.length, prog = clamp((t - p.start) / Math.max(.5, p.end - p.start - .2)); let idx = 0; c.textBaseline = 'middle';
  lines.forEach((ln, j) => { const tw = ln.reduce((a, o) => a + o.ww, 0); let x = 480 - tw / 2; ln.forEach(o => { const on = idx / n <= prog + .02; c.fillStyle = o.b ? WARM : '#fff'; c.globalAlpha = fade * (on ? 1 : .42); c.fillText(o.w, x, by + 22 + lh / 2 + j * lh); x += o.ww; idx++; }); });
  c.restore(); }

// ---------- frame ----------
function draw(t) {
  const k = sceneAt(t), S = SC[k], P = SC[Math.max(0, k - 1)], lt = t - START[k], lp = t - START[Math.max(0, k - 1)], mk = k === 0 ? 1 : ss(-.3, .5, lt);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; sky(P.bg, 1); if (S.bg !== P.bg) sky(S.bg, mk);
  if (P.under && k > 0 && mk < 1) { c.save(); c.globalAlpha = 1 - mk; P.under(lp, t); c.restore(); } if (S.under) { c.save(); c.globalAlpha = mk; S.under(lt, t); c.restore(); }
  const sameStyle = S.style === P.style;
  for (let i = 0; i < N; i++) { const q = HS[i], mo = S.morph || MORPH, kk = k === 0 ? 1 : eo(clamp((lt + .3 - q[5] * mo * .5) / mo));
    const b = S.form(i, t, lt), a0 = S.pa(i, t, lt); let x = b[0], y = b[1];
    if (kk < 1) { const p = P.form(i, t, lp), ap = P.pa(i, t, lp); x = lerp(p[0], b[0], kk); y = lerp(p[1], b[1], kk);
      if (sameStyle) drawP(S.style, x, y, i, t, lerp(ap, a0, kk), lerp(P.sz || 1, S.sz || 1, kk)); else { drawP(P.style, x, y, i, t, ap * (1 - kk), P.sz || 1); drawP(S.style, x, y, i, t, a0 * kk, S.sz || 1); } }
    else drawP(S.style, x, y, i, t, a0, S.sz || 1, lt); }
  c.globalAlpha = 1;
  if (k > 0 && lt < .45 && P.draw) { c.save(); c.globalAlpha = 1 - lt / .45; P.draw(lp, 0, t); c.restore(); }
  c.save(); c.globalAlpha = k === 0 ? 1 : ss(-.1, .35, lt); S.draw(lt, 0, t); c.restore();
  caption(t);
}
// frame 0 snapshot for the loop ending (fades in at most 40% over the last 0.5 s)
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = c; c = F0.getContext('2d'); draw(0); c = keep; }
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = k; c.drawImage(F0, 0, 0); c.restore(); } }
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { c.setTransform(1, 0, 0, 1, 0, 0); sky('dawn'); sun(820, 820, 50, 1); hills(1); for (let i = 0; i < N; i++) { const p = F.valley(i, 1); drawP('fg', p[0], p[1], i, 1, .95, 1.3); } c.globalAlpha = 1;
  txt('WHERE DOES', CX, 380, 104, '#fff'); txt('FOG', CX, 540, 190, WARM); txt('COME FROM?', CX, 700, 100, '#fff'); };
window.seek(0); window.ready = true; window.READY = true;
