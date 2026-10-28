// t_twinkle.js: "Why do stars twinkle, but planets don't?" in template #29 Particle flock (demo t29, x.com/ajith_io), on the coldbreath engine. Canvas2D 1080x1920, pure function of t.
// Demo moves reused: the starry navy sky (B) and the violet > pink dusk band at the horizon (A), the glowing ringed orb (C) as the star, the thin light streak (D) as
// the top of the atmosphere, handwritten notes with curved arrows (E). Here the flock is the light: photons fall in one thin beam from a star point and get
// knocked around by moving air pockets, while a planet's disk sends many beams whose wobbles average out.
// Batch N layout: caption box bottom-anchored at y 1360 inside x 70-890, content inside y 250-1130, nothing important in x > 900 below y 840.
await Promise.all(['800 80px Inter', '600 50px Inter', '60px Hand'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let c = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const fr = x => x - Math.floor(x), hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453), tri = u => 1 - Math.abs(2 * fr(u) - 1);
const N = 420, HS = Array.from({ length: N }, (_, i) => [1, 2, 3, 4, 5, 6].map(k => hash(i * 7.31 + k * 1.913)));
const INK = '#2a2350', WARMY = '#ffd27a', ICEB = '#bfe0ff', PINK = '#ff9fb0';
const AT = 760, AB = 1080;   // the atmosphere band (top / bottom) where light gets knocked around

// ---------- backgrounds ----------
const BG = {
  night: { sky: ['#0d0b2e', '#16134a', '#221d62', '#2f2878'] },
  deep: { sky: ['#07061c', '#0d0b2e', '#16134a', '#1f1b55'] },
  dusk: { sky: ['#1a1550', '#3b2f7a', '#8a5aa0', '#e597a6'] },
};
function sky(name, a = 1) { if (a <= 0) return; const b = BG[name]; c.save(); c.globalAlpha = a;
  const g = c.createLinearGradient(0, 0, 0, 1350); b.sky.forEach((col, i) => g.addColorStop(i / 3, col)); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.3) * W, y = 250 + hash(i * 5.7) * 900, r = 1 + 1.8 * hash(i * 9.1); c.globalAlpha = a * (.25 + .4 * hash(i * 2.2)); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  c.restore(); }
function airBand(t, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a * .22; const g = c.createLinearGradient(0, AT, 0, AB); g.addColorStop(0, 'rgba(150,170,255,0)'); g.addColorStop(.2, 'rgba(150,170,255,.7)'); g.addColorStop(1, 'rgba(255,170,190,.9)'); c.fillStyle = g; c.fillRect(0, AT - 20, W, AB - AT + 60); c.restore(); }
function ground(a = 1, col = '#0a0820') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.moveTo(0, AB + 30); for (let x = 0; x <= W; x += 30) c.lineTo(x, AB + 10 - 40 * Math.abs(Math.sin(x * .004 + .7)) - 18 * Math.abs(Math.sin(x * .013))); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill(); c.restore(); }
// a star: a sparkle with a soft halo; jit = how hard it twinkles (position jump, dimming, colour flash)
const FLASH = ['#ffffff', '#bfe0ff', '#ff9fb0', '#ffd27a', '#b8ffd8'];
function star(x, y, r, t, jit = 0, a = 1) { if (a <= 0) return; const f = Math.floor(t * 14), j = jit;
  const dx = (hash(f * 1.3) - .5) * 26 * j, dy = (hash(f * 2.7) - .5) * 26 * j, dim = 1 - j * .7 * hash(f * 3.9), col = j > .2 ? FLASH[Math.floor(hash(f * 5.1) * 5)] : '#fff';
  x += dx; y += dy; c.save(); c.globalAlpha = a * dim; const g = c.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, col); g.addColorStop(.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3, 0, TAU); c.fill();
  c.fillStyle = col; c.beginPath(); for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4, rr = k % 2 ? r * .28 : r * (1 + .25 * Math.sin(t * 7)); c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } c.closePath(); c.fill(); c.restore(); }
// a planet: a banded disk with a soft glow; steady
function planet(x, y, r, t, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; const g = c.createRadialGradient(x, y, r * .8, x, y, r * 2.2); g.addColorStop(0, 'rgba(255,214,150,.45)'); g.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 2.2, 0, TAU); c.fill();
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.fillStyle = '#e8b878'; c.fillRect(x - r, y - r, 2 * r, 2 * r); ['#c98a52', '#f2d2a2', '#b8743e', '#f6dcb0', '#d49a62'].forEach((col, k) => { c.fillStyle = col; c.fillRect(x - r, y - r + (k * .38 + .1) * r, 2 * r, r * .16); });
  const sh = c.createRadialGradient(x - r * .4, y - r * .4, r * .2, x, y, r * 1.1); sh.addColorStop(0, 'rgba(255,255,255,.25)'); sh.addColorStop(1, 'rgba(20,10,40,.45)'); c.fillStyle = sh; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); }
function eye(x, y, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, y, 46, 26, 0, 0, TAU); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(x, y, 14, 0, TAU); c.fill(); c.restore(); }

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

function titleL(lines, k, x = 80, y0 = 330, size = 96, gap = 1.12) { const u = pop(k); if (u <= 0) return; lines.forEach(([str, col], j) => txt(str, x + (1 - u) * -30, y0 + j * size * gap, size, col || '#fff', { a: u, align: 'left' })); }
// ---------- particle formations: f(i, t, lt) -> [x, y] ----------
function inCircle(h1, h2, cx, cy, r) { const a = h1 * TAU, d = Math.sqrt(h2) * r; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; }
// turbulence: the sideways kick a photon gets at height y (0 above the atmosphere), different per beam (seed) and over time
const kick = (y, seed, t, amp) => { const k = clamp((y - AT) / (AB - AT)); return amp * k * (Math.sin(y * .02 + t * 3.1 + seed * 7) + .6 * Math.sin(y * .047 - t * 4.3 + seed * 3)); };
const POCK = Array.from({ length: 9 }, (_, j) => [hash(j * 4.1), hash(j * 8.3), j % 2]);
const F = {
  field: (i, t) => { const q = HS[i]; return [q[0] * W, 260 + q[1] * 860 + 6 * Math.sin(t * .3 + q[2] * 6)]; },
  // photons falling along one beam from (x0,y0) to (x1,y1), knocked sideways inside the air band
  beam: (x0, y0, x1, y1, amp = 0, spread = 0) => (i, t) => { const q = HS[i], u = fr(q[0] + t * .35), y = lerp(y0, y1, u), x = lerp(x0, x1, u) + (q[1] - .5) * spread + kick(y, 1, t, amp); return [x, y]; },
  air: (i, t) => { const q = HS[i], u = q[0] * 2 - 1; return [CX + u * 560, (AT + AB) / 2 + (q[1] - .5) * 220 * (1 - .5 * Math.abs(u)) + 40 * Math.sin(u * 4 + t * 1.5)]; },
  pockets: (i, t) => { const q = HS[i], [a, b] = POCK[i % 9], cx = fr(a + t * .05 * (1 + b)) * (W + 300) - 150, cy = AT + 40 + b * (AB - AT - 80) + 30 * Math.sin(t * .7 + a * 9); return inCircle(q[2], q[3], cx, cy, 70 + 40 * hash(i % 9)); },
  bent: (i, t) => { const q = HS[i], u = fr(q[0] + t * .35), y = lerp(300, 1100, u); let x = 720 + (q[1] - .5) * 6; const k = clamp((y - AT) / (AB - AT)); x += 120 * k * Math.sin(y * .015 + t * 2.4) + 60 * k * Math.sin(y * .041 - t * 3.3); return [x, y]; },
  disk: (cx, cy, r) => (i, t) => { const q = HS[i]; return inCircle(q[0], q[1], cx + 3 * Math.sin(t * 2 + i), cy + 3 * Math.cos(t * 2 + i), r); },
  // many beams from points on a planet disk to one eye; each wobbles differently, the bundle stays put
  beams: (cx, cy, r, ex, ey, amp) => (i, t) => { const q = HS[i], b = i % 14, [sx, sy] = inCircle(hash(b * 2.3), hash(b * 5.9), cx, cy, r), u = fr(q[0] + t * .35), y = lerp(sy, ey, u), x = lerp(sx, ex, u) + kick(y, b, t, amp); return [x, y]; },
  // two paths: overhead (short trip through the air) and toward the horizon (long, slanted, more kicks)
  paths: (i, t) => { const q = HS[i], u = fr(q[0] + t * .35); if (i % 2) { const y = lerp(580, 1050, u); return [300 + kick(y, 2, t, 18), y]; } const x = lerp(1080, 360, u), y = lerp(860, 1050, u), k = clamp(u * 1.6); return [x + 30 * k * Math.sin(u * 30 + t * 3), y + 30 * k * Math.sin(u * 23 - t * 4)]; },
  band: (i, t) => { const q = HS[i], u = q[0] * 2 - 1; return [CX + u * 420, 1060 + (q[1] - .5) * 60 * (1 - Math.abs(u)) + 26 * Math.sin(u * 4 + t * 1.5)]; },
};
// particle styles: tw (twinkling background star), ph (photon: a small warm dot), pk (air pocket: soft warm or cool blob)
function drawP(style, x, y, i, t, a, sz = 1) { if (a <= .01 || x < -60 || x > W + 60) return; const q = HS[i]; c.globalAlpha = a;
  if (style === 'tw') { const b = .35 + .65 * Math.abs(Math.sin(t * (2 + 4 * q[3]) + q[4] * 9)); c.globalAlpha = a * b; c.fillStyle = '#fff'; const r = (1.5 + 3 * q[5]) * sz; c.fillRect(x - r * 2, y - .7, r * 4, 1.4); c.fillRect(x - .7, y - r * 2, 1.4, r * 4); c.beginPath(); c.arc(x, y, r * .8, 0, TAU); c.fill(); }
  else if (style === 'ph') { c.fillStyle = y > AT ? (q[2] > .7 ? PINK : q[2] > .4 ? ICEB : '#fff4d8') : '#fff4d8'; c.beginPath(); c.arc(x, y, (4 + 3 * q[5]) * sz, 0, TAU); c.fill(); }
  else { const warm = (i % 9) % 2 === 0; c.globalAlpha = a * .22; c.fillStyle = warm ? '#ff9f80' : '#80b4ff'; c.beginPath(); c.arc(x, y, (10 + 10 * q[5]) * sz, 0, TAU); c.fill(); } }

// ---------- scenes (one per phrase) ----------
const SC = [];
const on = () => .95;
SC[0] = { bg: 'night', style: 'tw', form: F.field, pa: () => .9, draw: (lt, u, t) => { star(330, 640, 70, t, 1); planet(780, 880, 90, t); title([['TWINKLE,', '#fff'], ['TWINKLE?', WARMY]], 1, 300, 112); note('steady', 780, 1040, 1, WARMY, 62); } };
SC[1] = { bg: 'night', style: 'pk', form: F.air, pa: on, sz: 1.4, draw: (lt, u, t) => { airBand(t, pop(lt)); star(CX, 520, 60, t, .9); title([["IT'S THE AIR", '#fff']], lt, 300, 100); note('our atmosphere', CX, 1120, lt - 1, ICEB, 56); } };
SC[2] = { bg: 'deep', style: 'ph', form: F.beam(820, 260, 820, 1120, 0, 6), pa: on, draw: (lt, u, t) => { star(820, 250, 40, t, 0); titleL([['STEADY FOR', '#fff'], ['YEARS', WARMY]], lt, 80, 400, 96); note('empty space', 300, 700, lt - 1, ICEB, 56); arrow(450, 690, 780, 640, lt - 1.3, ICEB, -30); } };
SC[3] = { bg: 'deep', style: 'ph', form: F.beam(820, 260, 820, 1120, 30, 6), pa: on, draw: (lt, u, t) => { streak(AT, lt / 1.2, t, ICEB); airBand(t, pop(lt - .4)); star(820, 250, 40, t, .3); titleL([['THE LAST', '#fff'], ['SPLIT', ICEB], ['SECOND', ICEB]], lt, 80, 400, 96); note('atmosphere', 230, AT - 50, lt - 1.2, ICEB, 56, 'left'); } };
SC[4] = { bg: 'night', style: 'pk', form: F.pockets, pa: on, sz: 1.6, draw: (lt, u, t) => { airBand(t, 1); title([['MOVING', '#fff'], ['POCKETS', PINK]], lt, 330, 104); note('warm', 230, AT - 60, lt - 1.2, '#ff9f80', 60); note('cool', 820, AT - 60, lt - 1.8, '#80b4ff', 60); } };
SC[5] = { bg: 'night', style: 'ph', form: F.bent, pa: on, draw: (lt, u, t) => { airBand(t, 1); star(720, 290, 40, t, .4); titleL([['EVERY', '#fff'], ['POCKET', '#fff'], ['BENDS', WARMY], ['LIGHT', WARMY]], lt, 80, 360, 90, 1.05); arrow(330, 960, 560, 920, lt - 1.8, '#fff', -40); note('bend!', 240, 1000, lt - 1.6, '#fff', 60); } };
SC[6] = { bg: 'deep', style: 'ph', form: F.beam(800, 330, 800, 1100, 70, 2), pa: on, sz: .9, draw: (lt, u, t) => { airBand(t, 1); star(800, 320, 26, t, .5); titleL([['ONE THIN', '#fff'], ['BEAM', WARMY]], lt, 80, 480, 100); note('a point', 560, 330, lt - 1, '#fff', 60, 'right'); arrow(580, 340, 760, 325, lt - 1.2, '#fff', -20); } };
SC[7] = { bg: 'night', style: 'ph', form: F.beam(760, 360, 760, 1100, 110, 2), pa: on, draw: (lt, u, t) => { airBand(t, 1); star(760, 340, 64, t, 1); eye(760, 1150, pop(lt)); titleL([['JUMPS,', '#fff'], ['DIMS,', '#fff'], ['FLASHES!', PINK]], lt, 70, 480, 92); } };
SC[8] = { bg: 'night', style: 'ph', form: F.disk(CX, 600, 170), pa: () => .5, sz: .9, draw: (lt, u, t) => { planet(CX, 600, 180, t); title([['A TINY DISK', WARMY]], lt, 330, 100); note('much closer', CX, 880, lt - 1.4, '#fff', 60); } };
SC[9] = { bg: 'night', style: 'ph', form: F.beams(740, 420, 120, 740, 1120, 0), pa: on, sz: .8, draw: (lt, u, t) => { airBand(t, 1); planet(740, 420, 125, t); titleL([['LOTS OF', '#fff'], ['POINTS', WARMY]], lt, 70, 640, 92); } };
SC[10] = { bg: 'night', style: 'ph', form: F.beams(740, 420, 120, 740, 1120, 60), pa: on, sz: .8, draw: (lt, u, t) => { airBand(t, 1); planet(740, 420, 125, t); eye(740, 1150, 1); titleL([['THEY', '#fff'], ['AVERAGE', '#fff'], ['OUT', WARMY]], lt, 70, 600, 92); pill('STEADY', 280, 420, 260, 100, WARMY, INK, lt - 2.4); } };
SC[11] = { bg: 'dusk', style: 'tw', form: F.field, pa: () => .7, draw: (lt, u, t) => { ground(1); star(900, 980, 46, t, 1); title([['LOOK', '#fff'], ['LOW', PINK]], lt, 330, 120); note('horizon', 260, 1040, lt - 1, '#fff', 60); arrow(330, 1010, 760, 1000, lt - 1.4, '#fff', 30); } };
SC[12] = { bg: 'dusk', style: 'ph', form: F.paths, pa: on, sz: .9, draw: (lt, u, t) => { airBand(t, 1); ground(1); star(300, 570, 34, t, .2); star(1040, 840, 40, t, 1); eye(330, 1100, 1); title([['MORE AIR =', '#fff'], ['MORE DANCE', PINK]], lt, 330, 92); } };
SC[13] = { bg: 'night', style: 'tw', form: F.field, pa: () => .6, draw: (lt, u, t) => { star(300, 700, 80, t, 1); planet(790, 700, 100, t); note('a point', 300, 900, lt - .4, '#fff', 64); note('a disk', 790, 900, lt - 1.8, WARMY, 64); title([['POINT VS', '#fff'], ['DISK', WARMY]], lt, 330, 112); } };
SC[14] = { bg: 'dusk', style: 'tw', form: F.field, pa: () => .7, draw: (lt, u, t) => { ground(1); planet(760, 640, 60, t); note('planet', 760, 760, lt - .4, WARMY, 56); title([['SPOTTED', '#fff'], ['ONE?', WARMY]], lt, 330, 112); pill('YES', 400, 980, 220, 104, WARMY, INK, lt - .9); pill('NO', 660, 980, 190, 104, '#fff', INK, lt - 1.1); } };
SC[15] = { bg: 'deep', style: 'ph', form: F.band, pa: () => .7, sz: .8, draw: (lt, u, t) => { const a = pop(lt);
  txt('Follow for more of', CX, 600, 80, '#fff', { a }); txt('how it really works.', CX, 700, 80, WARMY, { a }); txt("A new 'wait, really?' every day.", CX, 830, 50, '#fff', { a: a * .9, f: 'Hand', wt: 400 }); txt('@howitreallyworkstudio', CX, 910, 46, ICEB, { a: a * .9, wt: 600 }); star(CX, 430, 50, t, .6, a); } };

const START = PH.map(p => p.start); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .3) k = i; return k; }
const MORPH = .9; SC[8].morph = 1.4; SC[11].morph = 1.4; SC[15].morph = 1.4;

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
  const sameStyle = S.style === P.style;
  for (let i = 0; i < N; i++) { const q = HS[i], mo = S.morph || MORPH, kk = k === 0 ? 1 : eo(clamp((lt + .3 - q[5] * mo * .5) / mo));
    const b = S.form(i, t, lt), a0 = S.pa(i, t, lt); let x = b[0], y = b[1];
    if (kk < 1) { const p = P.form(i, t, lp), ap = P.pa(i, t, lp); x = lerp(p[0], b[0], kk); y = lerp(p[1], b[1], kk);
      if (sameStyle) drawP(S.style, x, y, i, t, lerp(ap, a0, kk), lerp(P.sz || 1, S.sz || 1, kk)); else { drawP(P.style, x, y, i, t, ap * (1 - kk), P.sz || 1); drawP(S.style, x, y, i, t, a0 * kk, S.sz || 1); } }
    else drawP(S.style, x, y, i, t, a0, S.sz || 1); }
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
window.thumb = () => { c.setTransform(1, 0, 0, 1, 0, 0); sky('night'); for (let i = 0; i < N; i++) { const p = F.field(i, 1); drawP('tw', p[0], p[1], i, 1, .8, 1); } c.globalAlpha = 1; star(330, 860, 110, 1.3, 1); planet(780, 1080, 120, 1);
  txt('WHY DO STARS', CX, 360, 104, '#fff'); txt('TWINKLE', CX, 500, 150, WARMY); txt('BUT PLANETS DON\'T?', CX, 640, 76, '#fff'); };
window.seek(0); window.ready = true; window.READY = true;
