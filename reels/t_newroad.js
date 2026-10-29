// t_newroad.js v2: "The town that built a new road and traffic got worse" (Braess's paradox), template #30 story fable.
// Built on the owner's styles/storyfable/fable.js (reference/story-fable 6b5e283). Two sides: red route vs teal route.
// Every cut, caption chunk and grade change is driven by the line timings in tl_newroad.js.
import { createFable, PAL, W, H, seg, ss, eio, lerp, hash, clamp } from './styles/storyfable/fable.js';
await Promise.all(['900 50px Nunito', '800 50px Cinzel'].map(f => document.fonts.load(f)));
const F = createFable(document.getElementById('c'));
const TLV = window.TL, P = TLV.p, DUR = TLV.total, N = P.length, s = i => P[i].start;
const FIG = 170 / 640, CAR = 150 / 420, SIGN = 230 / 760;
const C = () => F.ctx();
PAL.skyMid = '#6aa9e0'; PAL.skyTop = '#3f8bd6'; // v4: sky band measured paler than the reference (s0.15 vs 0.25)
const mixc = (a, b, k) => { const h = x => parseInt(x.slice(1), 16), A = h(a), B = h(b); return '#' + [16, 8, 0].map(sh => Math.round(lerp((A >> sh) & 255, (B >> sh) & 255, k)).toString(16).padStart(2, '0')).join(''); };

// ---------- cast (ours) ----------
const MAYOR = { robe: '#d79b3c', robeD: '#a8732a', robeL: '#eab45c', long: true, stache: true, hat: 'none' };
const REDD = { robe: PAL.sideA, robeD: PAL.sideAD, robeL: PAL.sideAL, hat: 'none' }, TEALD = { robe: PAL.sideB, robeD: PAL.sideBD, robeL: PAL.sideBL, hat: 'none', goatee: true, phase: .45 };
function topHat(turn = 0) { const x = turn * 10; F.fs(F.rr(x - 120, -662, 240, 24, 10), '#2e2a35', 6); F.fs(F.rr(x - 78, -840, 156, 186, 14), '#2e2a35', 6); F.fs(F.rr(x - 78, -700, 156, 30, 0), '#e9b949', 4); }
function cap(col, colD, turn = 0, dir = 1) { const x = turn * 26, c = C(), dome = () => { c.moveTo(x - 102, -600); c.quadraticCurveTo(x - 96, -706, x, -708); c.quadraticCurveTo(x + 96, -706, x + 102, -600); c.closePath(); };
  F.fs(dome, col, 6); F.shade(dome, colD, 16, 0); F.fs(dome, null, 6);
  F.fs(() => { c.moveTo(x - 20 * dir, -606); c.quadraticCurveTo(x + 110 * dir, -616, x + 160 * dir, -590); c.quadraticCurveTo(x + 100 * dir, -588, x - 20 * dir, -590); c.closePath(); }, colD, 5); F.fs(F.ell(x, -706, 14, 9), colD, 3); }
function mayor(t, o = {}) { F.figure({ ...MAYOR, t, ...o }); topHat(o.turn || 0); F.fs(F.poly([[-60, -460], [-30, -470], [70, -190], [44, -180]]), '#e9b949', 4); }
// held props (drawn at the hand, local figure units): the red commuter grips a steering wheel, the teal one a briefcase
const wheelProp = () => { const c = C(); c.save(); c.translate(14, 44); c.scale(1.45, 1.45); F.fs(F.ell(0, 0, 70, 70), null, 0); c.lineWidth = 20; c.strokeStyle = PAL.ink; c.beginPath(); c.arc(0, 0, 66, 0, Math.PI * 2); c.stroke(); c.lineWidth = 12; c.strokeStyle = PAL.sideA; c.beginPath(); c.arc(0, 0, 66, 0, Math.PI * 2); c.stroke();
  F.line([[-62, 0], [62, 0]], 12); F.line([[0, 0], [0, 62]], 12); F.fs(F.ell(0, 0, 20, 20), PAL.sideAD, 5); c.restore(); };
const caseProp = () => { C().scale(1.3, 1.3); F.fs(F.rr(-58, 22, 116, 84, 12), '#8a5a3a', 5); F.fs(F.rr(-58, 22, 116, 22, 8), '#6e4630', 5); F.fs(F.rr(-22, 2, 44, 26, 10), null, 5); F.fs(F.rr(-8, 40, 16, 12, 3), PAL.gold, 3); };
function driver(side, t, o = {}) { const B = side ? TEALD : REDD; F.figure({ ...B, t, ...o }); cap(side ? PAL.sideB : PAL.sideA, side ? PAL.sideBD : PAL.sideAD, o.turn || 0, o.flip ? -1 : 1); }

// ---------- props (our own, drawn with the module's outline + shade language) ----------
function dash(pts) { const c = C(); c.save(); c.setLineDash([16, 14]); F.line(pts, 4, 'rgba(255,240,220,.55)'); c.restore(); }
function car(col, colD, o = {}) { const c = C(), t = o.t || 0, jig = o.idle ? Math.sin(t * 18 + (o.seed || 0)) * 2 : 0;
  c.save(); c.translate(0, jig);
  [-230, 230].forEach(wx => F.fs(F.rr(wx - 50, -120, 100, 120, 26), '#3e3a44', 7));
  const body = F.rr(-290, -300, 580, 210, 70); F.fs(body, col, 7); F.shade(body, colD, 0, -26); F.fs(body, null, 7);
  const cab = F.poly([[-210, -296], [-150, -440], [150, -440], [210, -296]]); F.fs(cab, col, 7); F.shade(cab, colD, 26, 0); F.fs(cab, null, 7);
  const glass = F.poly([[-176, -306], [-128, -416], [128, -416], [176, -306]]); F.fs(glass, '#bfe3f2', 5);
  if (o.driver) { c.save(); c.beginPath(); glass(); c.clip(); c.translate(o.back ? 0 : -40, -120); c.scale(.42, .42); o.driver(); c.restore(); F.fs(glass, null, 5); }
  F.fs(F.poly([[-120, -410], [-80, -410], [-140, -312], [-170, -312]]), 'rgba(255,255,255,.45)', 0);
  [-210, 210].forEach(lx => { F.fs(F.ell(lx, -214, 40, 28), o.back ? '#ff6b4f' : '#fff1c4', 5); if (o.lights && !o.back) F.glow(lx, -214, 160, 'rgba(255,240,190,.7)', .7); });
  F.fs(F.rr(-80, -170, 160, 46, 8), '#efe8d8', 4); if (o.plate) F.text(o.plate, 0, -147, { size: 30, col: PAL.ink, font: 'Cinzel', weight: 800 });
  dash([[-270, -126], [270, -126]]);
  if (o.honk > .05) { c.save(); c.translate(150, -560); c.scale(o.honk, o.honk); F.fs(F.ell(0, 0, 70, 56), '#fff', 5); F.text('!', 0, 4, { size: 70, col: PAL.sideA, weight: 900 }); c.restore(); }
  c.restore(); }
function house(o = {}) { const w = o.w || 520, h = o.h || 440, roof = o.roof || PAL.sideA, roofD = mixc(roof, '#2b2422', .3);
  const wall = F.rr(-w / 2, -h, w, h, 6); F.fs(wall, o.wall || '#f1e6cf', 7); F.shade(wall, '#dccdb0', 30, 0); F.fs(wall, null, 7);
  if (o.timber) { [-w / 2 + 40, -w / 6, w / 6, w / 2 - 40].forEach(x => F.line([[x, -h], [x, 0]], 10, '#7a5638')); F.line([[-w / 2, -h * .55], [w / 2, -h * .55]], 10, '#7a5638'); }
  const rf = F.poly([[-w / 2 - 50, -h + 4], [0, -h - w * .5], [w / 2 + 50, -h + 4]]); F.fs(rf, roof, 7); F.shade(rf, roofD, 0, -22); F.fs(rf, null, 7);
  for (let i = 1; i < 5; i++) F.line([[-w / 2 - 50 + i * (w / 2 + 50) / 5, -h + 4 - i * w * .1], [w / 2 + 50 - i * (w / 2 + 50) / 5, -h + 4 - i * w * .1]], 3, 'rgba(0,0,0,.18)');
  F.fs(F.rr(-56, -200, 112, 200, 10), '#7a5638', 6); F.fs(F.ell(30, -100, 8, 8), '#e9b949', 0);
  [-w * .3, w * .3].forEach(wx => { const win = F.rr(wx - 60, -h + 70, 120, 110, 8); F.fs(win, o.lit ? '#ffd889' : '#a9d4ea', 6); if (o.lit) F.glow(wx, -h + 125, 140, 'rgba(255,210,120,.55)', .7); F.line([[wx, -h + 70], [wx, -h + 180]], 5); F.line([[wx - 60, -h + 125], [wx + 60, -h + 125]], 5);
    F.fs(F.rr(wx - 84, -h + 66, 22, 118, 4), o.shut || roof, 4); F.fs(F.rr(wx + 62, -h + 66, 22, 118, 4), o.shut || roof, 4); F.fs(F.rr(wx - 70, -h + 186, 140, 30, 6), '#8a5a3a', 4); [0, 1, 2].forEach(k => F.fs(F.ell(wx - 40 + k * 40, -h + 184, 16, 14), k % 2 ? '#e9b949' : PAL.sideA, 3)); });
  if (o.chimney) F.fs(F.rr(w * .2, -h - w * .42, 60, 120, 4), '#b07a52', 6); }
function tree(o = {}) { const c = C(); F.fs(F.rr(-22, -300, 44, 300, 14), PAL.woodD, 6); const cr = () => { c.moveTo(210, -470); c.arc(0, -470, 210, 0, Math.PI * 2); c.moveTo(0, -360); c.arc(-150, -360, 150, 0, Math.PI * 2); c.moveTo(300, -370); c.arc(150, -370, 150, 0, Math.PI * 2); };
  F.fs(cr, o.col || PAL.leaf, 7); F.shade(cr, PAL.leafD, 30, 24); F.fs(cr, null, 7); F.fs(F.ell(-70, -560, 60, 40), 'rgba(255,255,255,.18)', 0); }
function tuft(i, k = 1) { const c = C(); for (let j = 0; j < 7; j++) { const a = -1.9 + j * .13 + (hash(i + j) - .5) * .2, l = (90 + hash(i * 3 + j) * 110) * k; c.strokeStyle = j % 2 ? PAL.leafD : '#8fb35e'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(j * 6 - 20, 0); c.quadraticCurveTo(Math.cos(a) * l * .4, -l * .6, Math.cos(a) * l, Math.sin(a) * l); c.stroke(); }
  if (i % 3 === 0) [0, 1, 2].forEach(j => F.fs(F.ell(-30 + j * 30, -150 - 30 * hash(i + j), 16, 16), j % 2 ? '#f1d15a' : PAL.sideA, 3)); }
function flowerBox(col) { const b = F.rr(-200, -120, 400, 120, 14); F.fs(b, PAL.wood, 6); F.shade(b, PAL.woodD, 0, -20); F.fs(b, null, 6); for (let i = 0; i < 9; i++) { const x = -170 + i * 42; F.line([[x, -120], [x + 6, -200 - 30 * hash(i)]], 6, PAL.leafD); F.fs(F.ell(x + 6, -206 - 30 * hash(i), 20, 18), i % 2 ? col : PAL.cream, 4); } }
function lamp(lit = 0) { F.fs(F.rr(-14, -620, 28, 620, 8), '#3e3a44', 5); F.fs(F.poly([[-50, -620], [50, -620], [34, -700], [-34, -700]]), lit ? '#ffe39a' : '#cfd6dc', 5); if (lit) F.glow(0, -660, 220, 'rgba(255,220,140,.8)', .8); F.fs(F.poly([[-58, -700], [58, -700], [0, -760]]), '#3e3a44', 5); }
function fountain(t) { const c = C(); F.fs(F.ell(0, -40, 380, 90), '#cfc3ae', 7); F.fs(F.ell(0, -60, 330, 64), '#78b9d3', 5); F.fs(F.rr(-50, -360, 100, 300, 16), '#d9cdb6', 6); F.fs(F.ell(0, -360, 150, 36), '#cfc3ae', 6);
  for (let k = -1; k <= 1; k += 2) for (let j = 0; j < 3; j++) { c.strokeStyle = 'rgba(220,240,255,.9)'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -380); c.quadraticCurveTo(k * (120 + j * 40), -520 + Math.sin(t * 6 + j) * 8, k * (200 + j * 50), -80); c.stroke(); } }
function stall(col) { const c = C(); F.fs(F.rr(-260, -300, 520, 300, 10), '#efe1c6', 6); for (let i = 0; i < 6; i++) F.fs(F.poly([[-300 + i * 100, -470], [-200 + i * 100, -470], [-200 + i * 100, -380], [-300 + i * 100, -380]]), i % 2 ? PAL.cream : col, 5);
  for (let i = 0; i < 6; i++) F.fs(() => { c.moveTo(-300 + i * 100, -380); c.quadraticCurveTo(-250 + i * 100, -340, -200 + i * 100, -380); c.closePath(); }, i % 2 ? PAL.cream : col, 4); [-180, -60, 60, 180].forEach((x, i) => F.fs(F.ell(x, -260, 44, 40), ['#e9b949', '#d24a44', '#8fb35e', '#f08a3c'][i], 4)); }
function carIcon(x, y, k, col) { const c = C(); c.save(); c.translate(x, y); c.scale(k, k); F.fs(F.rr(-70, -30, 140, 50, 16), col, 0); F.fs(F.poly([[-44, -30], [-26, -64], [26, -64], [44, -30]]), col, 0); F.fs(F.ell(-40, 22, 16, 16), col, 0); F.fs(F.ell(40, 22, 16, 16), col, 0); c.restore(); }
function banner(col, colD, t, seed) { F.line([[0, 0], [0, -1000]], 12, PAL.woodD); const wv = Math.sin(t * 2 + seed) * 14, b = F.poly([[0, -980], [250, -980 + wv * .3], [250, -520 + wv], [125, -600 + wv], [0, -520]]); F.fs(b, col, 7); F.shade(b, colD, -30, 0); F.fs(b, null, 7); carIcon(125, -770, 1, PAL.cream); }
function emblem() { const c = C(); c.save(); c.scale(1, .32); c.beginPath(); c.arc(0, 0, 420, 0, Math.PI * 2); c.clip(); c.fillStyle = PAL.sideA; c.fillRect(-420, -420, 420, 840); c.fillStyle = PAL.sideB; c.fillRect(0, -420, 420, 840); c.restore();
  F.fs(() => c.ellipse(0, 0, 420, 134, 0, 0, Math.PI * 2), null, 10); F.fs(() => c.ellipse(0, 0, 470, 150, 0, 0, Math.PI * 2), null, 6);
  c.save(); c.scale(1, .32); c.strokeStyle = PAL.cream; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 240); c.lineTo(0, 20); c.lineTo(-160, -200); c.moveTo(0, 20); c.lineTo(160, -200); c.stroke(); c.restore(); }
function signpost(lines, col = '#f2ead6', ink = PAL.ink) { F.fs(F.rr(-16, -700, 32, 700, 8), PAL.wood, 6); const b = F.rr(-290, -760, 580, 70 + lines.length * 86, 18); F.fs(b, col, 7); F.shade(b, 'rgba(0,0,0,.08)', 0, -16); F.fs(b, null, 7); lines.forEach((l, i) => F.text(l, 0, -690 + i * 86, { size: i ? 52 : 64, col: ink, font: i ? 'Nunito' : 'Cinzel', weight: 800 })); }
function barrier(lab) { [-280, 280].forEach(x => { F.fs(F.rr(x - 14, -260, 28, 260, 6), '#3e3a44', 5); F.fs(F.poly([[x - 60, 0], [x + 60, 0], [x, -60]]), '#3e3a44', 0); }); const c = C(), b = F.rr(-340, -300, 680, 90, 12); F.fs(b, PAL.cream, 7); c.save(); c.beginPath(); b(); c.clip(); c.fillStyle = PAL.sideA; for (let i = -8; i < 10; i++) { c.beginPath(); c.moveTo(i * 90, -300); c.lineTo(i * 90 + 45, -300); c.lineTo(i * 90 - 15, -210); c.lineTo(i * 90 - 60, -210); c.fill(); } c.restore(); F.fs(b, null, 7); if (lab) F.text(lab, 0, -360, { size: 70, col: PAL.ink, font: 'Nunito', weight: 900 }); }
function mill(t) { const c = C(), tw = F.poly([[-150, 0], [-100, -620], [100, -620], [150, 0]]); F.fs(tw, '#f0e2c6', 7); F.shade(tw, '#d6c6a4', 30, 0); F.fs(tw, null, 7); F.fs(F.poly([[-120, -616], [0, -780], [120, -616]]), PAL.woodD, 7); F.fs(F.rr(-40, -150, 80, 150, 30), PAL.wood, 6);
  const a = t * .6; for (let i = 0; i < 4; i++) { c.save(); c.translate(0, -640); c.rotate(a + i * Math.PI / 2); F.fs(F.rr(-24, -440, 48, 420, 8), '#f7efdf', 5); for (let k = 0; k < 5; k++) F.line([[-24, -420 + k * 80], [24, -420 + k * 80]], 3); c.restore(); } F.fs(F.ell(0, -640, 30, 30), PAL.woodD, 5); }
function willow() { F.fs(F.rr(-24, -360, 48, 360, 14), PAL.woodD, 6); for (let i = 0; i < 14; i++) { const x = -260 + i * 40; F.line([[x * .4, -460], [x, -340], [x + 10, -120 - 60 * hash(i)]], 12, i % 2 ? PAL.leaf : '#7fae58'); } F.fs(F.ell(0, -480, 220, 90), PAL.leaf, 6); }
function bus(col) { const b = F.rr(-520, -420, 1040, 360, 50); F.fs(b, col, 7); F.shade(b, mixc(col, '#2b2422', .3), 0, -30); F.fs(b, null, 7); for (let i = 0; i < 6; i++) F.fs(F.rr(-470 + i * 160, -380, 120, 120, 14), '#bfe3f2', 5); F.text('BUS', 0, -170, { size: 70, col: PAL.cream, weight: 900 }); [-330, 330].forEach(wx => { F.fs(F.ell(wx, -60, 76, 76), '#3e3a44', 7); F.fs(F.ell(wx, -60, 34, 34), '#d8d2c6', 5); }); }

// ---------- painted backdrops ----------
function skyline(t, o = {}) { F.layer(1.6, () => skylineRaw(t, o)); }
function skylineRaw(t, o) { const g = F.g, hor = F.cam().hor, px = -F.cam().x * .05; g.save();
  g.fillStyle = '#9fb5c9'; g.beginPath(); g.moveTo(-50, hor + 4); for (let x = -50; x <= 1130; x += 60) g.lineTo(x + px * .5, hor - 120 - 70 * Math.abs(Math.sin(x * .004 + 1)) - 30 * Math.sin(x * .013)); g.lineTo(1130, hor + 4); g.fill();
  g.fillStyle = '#8fae74'; g.beginPath(); g.moveTo(-50, hor + 4); for (let x = -50; x <= 1130; x += 40) g.lineTo(x + px, hor - 40 - 26 * Math.sin(x * .009 + 2)); g.lineTo(1130, hor + 4); g.fill();
  if (o.town !== false) for (let i = 0; i < 22; i++) { const x = 20 + i * 48 + px, h = 30 + 30 * hash(i), y = hor - 34 - (i % 4) * 8; g.fillStyle = '#efe6d4'; g.fillRect(x, y - h, 38, h); g.fillStyle = i % 2 ? PAL.sideA : PAL.sideB; g.beginPath(); g.moveTo(x - 4, y - h); g.lineTo(x + 19, y - h - 18); g.lineTo(x + 42, y - h); g.fill();
    if (i === 11) { g.fillStyle = '#efe6d4'; g.fillRect(x + 6, y - h - 90, 26, 90); g.fillStyle = PAL.sideB; g.beginPath(); g.moveTo(x + 2, y - h - 90); g.lineTo(x + 19, y - h - 126); g.lineTo(x + 36, y - h - 90); g.fill(); } }
  for (let i = 0; i < 14; i++) { const x = hash(i * 7) * 1080 + px * 1.2, y = hor - 14 - hash(i) * 10; g.fillStyle = i % 2 ? '#6f9a52' : '#5f8a46'; g.beginPath(); g.arc(x, y, 14 + 10 * hash(i + 2), 0, Math.PI * 2); g.fill(); }
  g.restore(); F.horizonHaze(.68); }
// cream mist lying on the ground just below the horizon (the reference's horizon band reads ~#e2dbcd, s0.09); drawn after the
// ground and before the sprites, so far ground fades and the sprites keep their own depth haze
function groundHaze(a = .85, depth = 420) { const g = F.g, hor = F.cam().hor; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = F.vgrad(hor - 60, hor + depth, [[0, `rgba(236,230,214,${a * .6})`], [.25, `rgba(236,230,214,${a})`], [1, 'rgba(236,230,214,0)']]); g.fillRect(0, hor - 60, W, depth + 60); g.restore(); }
function pebbleField(z1, base, n = 420) { const g = F.g; for (let i = 0; i < n; i++) { const X = (hash(i * 1.31) - .5) * 2600 + F.cam().x, Z = F.cam().z + 40 + Math.pow(hash(i * 2.17), 1.7) * z1, q = F.proj(X, 0, Z); if (q.dz < 30 || q.x < -20 || q.x > W + 20 || q.y > H + 10) continue;
  const r = Math.min(9, (3 + hash(i * 5.7) * 5) * q.s); g.fillStyle = base[i % 4]; g.beginPath(); g.ellipse(q.x, q.y, r * 1.6, r * .7, 0, 0, Math.PI * 2); g.fill(); } }
function tiles(x0, x1, z0, z1, a, b, sz = 60) { for (let z = Math.max(z0, Math.floor((F.cam().z + 20) / sz) * sz); z < z1; z += sz) for (let x = x0; x < x1; x += sz) { const k = hash(Math.floor(x / sz) * 31 + Math.floor(z / sz) * 7); F.groundQuad(x + 2, z + 2, x + sz - 2, z + sz - 2, k < .5 ? a : b, 0); } }
function roadQuad(xa, xb, z0, z1, w, col) { const g = F.g, n = F.cam().z + 20, a = F.proj(xa - w, 0, Math.max(z0, n)), b = F.proj(xa + w, 0, Math.max(z0, n)), c = F.proj(xb + w, 0, z1), d = F.proj(xb - w, 0, z1); g.fillStyle = col; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill(); }

// ---------- SETS ----------
function setSquare(t, o) { F.sky(t, { sunX: 860, sunY: 320 }); skyline(t); const g = F.g, hor = F.cam().hor;
  g.fillStyle = F.vgrad(hor, H, [[0, '#e0cfa6'], [1, '#c9ad78']]); g.fillRect(0, hor, W, H - hor);
  tiles(-1600, 1600, F.cam().z + 20, 3400, '#dccaa2', '#cfbb92', 90); F.groundQuad(-30, F.cam().z + 20, 30, 3400, '#e9b949', 0);
  for (let i = -3; i <= 3; i++) F.put(i * 520 + 120 * (i % 2), 3600 + 200 * Math.abs(i % 2), 1, () => house({ roof: i % 2 ? PAL.sideB : PAL.sideA, shut: i % 2 ? PAL.sideBD : PAL.sideAD, chimney: i % 3 === 0, w: 460, h: 420 }), { rim: true });
  F.put(0, 2600, .9, () => fountain(t), { rim: true }); F.put(-900, 2300, .9, () => stall(PAL.sideA), { rim: true, shadow: true }); F.put(900, 2400, .9, () => stall(PAL.sideB), { rim: true, shadow: true });
  F.put(-560, 1500, .45, () => banner(PAL.sideA, PAL.sideAD, t, 0), { rim: true, shadow: true }); F.put(560, 1500, .45, () => banner(PAL.sideB, PAL.sideBD, t, 2), { rim: true, shadow: true });
  F.put(-760, 1100, .35, () => lamp(0), { rim: true, shadow: true }); F.put(760, 1100, .35, () => lamp(0), { rim: true, shadow: true });
  F.put(0, o.duo ? 520 : 760, .42, () => emblem(), {});
  F.put(o.duo ? 0 : -120, o.duo ? 720 : 640, SIGN * (o.duo ? 1.4 : 1.08), () => F.counterSign(o.sign), { sharp: true, rim: true, shadow: true });
  F.put(o.mayorX ?? 200, o.mayorZ ?? 560, FIG, () => mayor(t, { expr: o.mayorExpr || 'smug', look: o.look ?? -1, turn: o.turn ?? -.4, armF: 30, bendF: -70, flip: true }), { rim: true, shadow: true });
  (o.cars || []).forEach(([x, z, side, ex]) => F.put(x, z, CAR, () => car(side ? PAL.sideB : PAL.sideA, side ? PAL.sideBD : PAL.sideAD, { t, plate: side ? 'TEAL' : 'RED', driver: () => driver(side, t, { expr: ex || 'glare', turn: side ? -.3 : .3 }) }), { rim: true, shadow: true }));
  // the two commuters stand up front, the reference's big-heads-in-the-foreground staging
  if (o.duo) { const [ea, eb] = o.duo; F.put(-112, 330, FIG, () => driver(0, t, { expr: ea, turn: .45, look: 1, armF: 20, hold: wheelProp }), { rim: true, shadow: true });
    F.put(84, 340, FIG, () => driver(1, t, { expr: eb, turn: -.45, look: -1, flip: true, armF: 80, bendF: 10, hold: caseProp }), { rim: true, shadow: true }); }
  F.put(-330, 240, .5, () => flowerBox(PAL.sideA), {}); F.put(380, 230, .5, () => flowerBox(PAL.sideB), {});
  groundHaze(); F.flush(); }
function setValley(t, o) { F.sky(t, { sunX: 780, sunY: 340 }); skyline(t, { town: false }); const g = F.g, hor = F.cam().hor;
  g.fillStyle = F.vgrad(hor, H, [[0, '#cdc08c'], [.25, '#b9ad62'], [1, '#9a8c48']]); g.fillRect(0, hor, W, H - hor);
  for (let r = 0; r < 7; r++) for (let k = -6; k <= 6; k++) { const z = 3000 + r * 900, x = k * 700 + (r % 2) * 350; F.groundQuad(x, z, x + 680, z + 860, ['#c2b46a', '#d4bb6e', '#aab060', '#c9a95e'][Math.floor(hash(r * 13 + k) * 4)], 0); }
  pebbleField(3000, ['#6d8a3a', '#a3b46a', 'rgba(60,80,30,.4)', '#b9c27e'], 360);
  roadQuad(-120, -1500, F.cam().z + 20, 9000, 120, '#bfa271'); roadQuad(120, 1500, F.cam().z + 20, 9000, 120, '#bfa271');
  for (let z = 200; z < 9000; z += 420) { const u = z / 9000; [[-120, -1500], [120, 1500]].forEach(([xa, xb]) => { const a = F.proj(lerp(xa, xb, u), 0, z), b = F.proj(lerp(xa, xb, (z + 180) / 9000), 0, z + 180); if (a.dz < 40) return; g.strokeStyle = 'rgba(255,245,215,.9)'; g.lineWidth = Math.max(1, 14 * a.s); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }); }
  for (let z = 400; z < 8000; z += 520) [[-120, -1500, -1], [120, 1500, 1]].forEach(([xa, xb, sd]) => F.put(lerp(xa, xb, z / 9000) + sd * 200, z, .25, () => { F.fs(F.rr(-16, -150, 32, 150, 6), PAL.woodL, 5); F.fs(F.rr(-16, -150, 32, 40, 6), sd < 0 ? PAL.sideA : PAL.sideB, 5); }));
  F.put(0, 9600, 3.2, () => mill(t), {}); F.put(-1700, 8800, 1.3, () => house({ roof: PAL.sideA }), {}); F.put(1700, 8800, 1.3, () => house({ roof: PAL.sideB }), {});
  for (let i = 0; i < 10; i++) { const sd = i % 2 ? 1 : -1; F.put(sd * (1800 + 400 * hash(i)), 1500 + i * 700, 1, () => tree({}), { rim: true, shadow: true }); }
  const n = o.cars ?? 10; for (let i = 0; i < n; i++) { const sd = i % 2, u = ((t * .03 + i * .1) % 1), z = lerp(300, 8000, u), x = lerp(sd ? 120 : -120, sd ? 1500 : -1500, z / 9000); F.put(x, z, CAR, () => car(sd ? PAL.sideB : PAL.sideA, sd ? PAL.sideBD : PAL.sideAD, { back: true, t, driver: () => driver(sd, t, {}) }), { rim: true, shadow: true }); }
  if (o.posts) { F.put(-460, 900, SIGN * .9, () => signpost(['RED ROUTE', 'narrow street', '+ highway'], '#f6dcd8', PAL.sideAD), { sharp: true, rim: true, shadow: true }); F.put(460, 900, SIGN * .9, () => signpost(['TEAL ROUTE', 'highway', '+ narrow street'], '#d6efec', PAL.sideBD), { sharp: true, rim: true, shadow: true }); }
  if (o.walkers !== false) [0, 1].forEach(sd => F.put(sd ? 105 : -125, F.cam().z + 330 + sd * 20, FIG, () => driver(sd, t, { expr: sd ? 'smug' : 'neutral', walk: t * 1.3 + sd * .5, turn: sd ? -.25 : .25, look: sd ? -1 : 1, flip: !!sd, armF: sd ? 80 : 30, bendF: sd ? 10 : 20, hold: sd ? caseProp : wheelProp }), { rim: true, shadow: true, sharp: true }));
  F.put(-160, 140, .5, () => tuft(3)); F.put(190, 130, .5, () => tuft(9)); groundHaze(); F.flush(); }
const NODE = { home: [540, 380], A: [230, 820], B: [850, 820], mill: [540, 1260] };
function setMap(t, o) { const g = F.g; g.fillStyle = '#8bb85c'; g.fillRect(0, 0, W, H);
  for (let r = 0; r < 12; r++) for (let k = 0; k < 7; k++) { g.fillStyle = ['#97c266', '#a9c86e', '#7fae52', '#b8c97a', '#c8bf6a'][Math.floor(hash(r * 11 + k) * 5)]; g.fillRect(k * 160 - 20 + (r % 2) * 40, r * 170 - 30, 150, 160); }
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.7) * W, y = hash(i * 5.1) * H; g.fillStyle = '#4f7d3a'; g.beginPath(); g.arc(x, y, 20 + 14 * hash(i), 0, Math.PI * 2); g.fill(); g.fillStyle = '#6f9a4e'; g.beginPath(); g.arc(x - 6, y - 6, 14 + 8 * hash(i), 0, Math.PI * 2); g.fill(); }
  const road = (a, b, w) => { const A = NODE[a], B = NODE[b]; g.lineCap = 'round'; g.strokeStyle = '#4a3d30'; g.lineWidth = w + 12; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); g.strokeStyle = '#b39a74'; g.lineWidth = w; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); g.setLineDash([24, 20]); g.strokeStyle = 'rgba(255,245,215,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); g.setLineDash([]); };
  road('home', 'A', 34); road('A', 'mill', 86); road('home', 'B', 86); road('B', 'mill', 34);
  if (o.shortcut > 0) { const A = NODE.A, B = NODE.B, k = clamp(o.shortcut); g.strokeStyle = '#4a3d30'; g.lineWidth = 50; g.lineCap = 'round'; g.beginPath(); g.moveTo(...A); g.lineTo(lerp(A[0], B[0], k), A[1]); g.stroke(); g.strokeStyle = '#e9b949'; g.lineWidth = 36; g.beginPath(); g.moveTo(...A); g.lineTo(lerp(A[0], B[0], k), A[1]); g.stroke(); }
  for (const [n, lab] of [['home', 'HILLTOWN'], ['mill', 'THE MILL']]) { const [x, y] = NODE[n]; for (let i = 0; i < 7; i++) { const hx = x - 110 + (i % 4) * 66, hy = y - 40 + Math.floor(i / 4) * 60; g.fillStyle = '#f1e6cf'; g.fillRect(hx, hy, 50, 40); g.fillStyle = i % 2 ? PAL.sideA : PAL.sideB; g.fillRect(hx - 4, hy - 10, 58, 14); } F.text(lab, x, y - 90, { size: 44, col: PAL.cream, font: 'Cinzel', weight: 800, stroke: 8 }); }
  const n = 90; for (let i = 0; i < n; i++) { const r = o.routes[i % o.routes.length], u = (t * .14 + i / n) % 1, segs = r.segs, k = u * segs.length, si = Math.min(segs.length - 1, Math.floor(k)), a = NODE[segs[si][0]], b = NODE[segs[si][1]], v = k - si, x = lerp(a[0], b[0], v), y = lerp(a[1], b[1], v), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    g.save(); g.translate(x + (hash(i) - .5) * 20, y + (hash(i + 3) - .5) * 20); g.rotate(ang); g.fillStyle = r.col; g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); g.roundRect(-14, -9, 28, 18, 5); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(2, -6, 8, 12); g.restore(); }
  (o.tags || []).forEach(([x, y, txt, col, k]) => { if (k <= 0) return; const sc = .85 + .15 * ss(k * 4); g.save(); g.globalAlpha = clamp(k * 5); g.translate(x, y); g.scale(sc, sc); g.font = '900 46px Nunito'; const w = g.measureText(txt).width + 46; F.fs(F.rr(-w / 2, -38, w, 70, 16), col, 6); F.text(txt, 0, -2, { size: 46, col: PAL.cream, weight: 900 }); g.restore(); }); }
function setDesk(t, o) { const g = F.g; F.setCam({ x: 0, y: 330, z: -260 + (o.push || 0), hor: 380, f: 1100, focus: 1700, dof: 3 });
  g.fillStyle = F.vgrad(0, 800, [[0, '#2b2544'], [1, '#4a3a5a']]); g.fillRect(0, 0, W, 800);
  F.layer(2.5, () => { F.fs(F.rr(620, 60, 320, 360, 16), '#1b2a55', 8); F.glow(800, 180, 120, 'rgba(240,240,255,.9)', .9); F.fs(F.ell(800, 180, 46, 46), '#f4f2e8', 0); F.line([[780, 60], [780, 420]], 8); F.line([[620, 240], [940, 240]], 8);
  for (let i = 0; i < 4; i++) { F.fs(F.rr(80, 60 + i * 110, 420, 18, 4), PAL.woodD, 4); for (let k = 0; k < 9; k++) F.fs(F.rr(96 + k * 44, 60 + i * 110 - 80 + 10 * hash(i * 9 + k), 34, 80 - 10 * hash(i * 9 + k), 4), [PAL.sideA, PAL.sideB, '#e9b949', '#8a6a9a'][(i + k) % 4], 3); } });
  F.glow(860, 460, 520, 'rgba(255,170,90,.5)', .8);
  F.groundQuad(-1400, 0, 1400, 2400, '#6b4630', 0); F.groundQuad(-560, 140, 560, 1600, '#2f63b8', 0); F.groundQuad(-560, 140, 560, 160, '#e8f0ff', 0);
  for (let x = -540; x <= 540; x += 90) { const a = F.proj(x, 0, 150), b = F.proj(x, 0, 1590); g.strokeStyle = 'rgba(220,235,255,.2)'; g.lineWidth = 2; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
  for (let z = 200; z < 1600; z += 90) { const a = F.proj(-550, 0, z), b = F.proj(550, 0, z); g.strokeStyle = 'rgba(220,235,255,.2)'; g.lineWidth = 2; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
  const M = { home: [0, 1380], A: [-320, 860], B: [320, 860], mill: [0, 380] }, ln = (a, b, w, col) => { const A = F.proj(M[a][0], 0, M[a][1]), B = F.proj(M[b][0], 0, M[b][1]); g.strokeStyle = col; g.lineWidth = w * (A.s + B.s) / 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); };
  ln('home', 'A', 8, '#ffc1bb'); ln('A', 'mill', 20, '#ffc1bb'); ln('home', 'B', 20, '#b6efe9'); ln('B', 'mill', 8, '#b6efe9');
  if (o.draw > 0) { const k = clamp(o.draw), A = F.proj(M.A[0], 0, M.A[1]), E = F.proj(lerp(M.A[0], M.B[0], k), 0, M.A[1]); g.strokeStyle = '#ffe27a'; g.lineWidth = 12 * A.s; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(E.x, E.y); g.stroke(); F.glow(E.x, E.y, 110, 'rgba(255,250,220,1)', 1); F.glow(E.x, E.y, 40, 'rgba(255,255,255,1)', 1); }
  const tx = (str, X, Z, size, col, k = 1) => { if (k <= 0) return; const p = F.proj(X, 0, Z); g.save(); g.globalAlpha = clamp(k * 4); g.translate(p.x, p.y); g.scale(p.s, p.s * .55); F.text(str, 0, 0, { size, col, font: 'Cinzel', weight: 800 }); g.restore(); };
  tx('HILLTOWN', 0, 1470, 70, '#e8f0ff'); tx('THE MILL', 0, 290, 70, '#e8f0ff'); if (o.draw > .6) tx('SHORTCUT  0 MIN', 0, 930, 56, '#ffe27a', (o.draw - .6) * 2);
  (o.texts || []).forEach(a => tx(...a));
  if (o.stamp > 0) { const k = o.stamp, sc = k < .15 ? lerp(1.9, 1, k / .15) : 1; g.save(); g.translate(540, 1050); g.rotate(-.14); g.scale(sc, sc); g.globalAlpha = .92; g.strokeStyle = '#d8352e'; g.lineWidth = 12; g.strokeRect(-300, -84, 600, 150); g.strokeRect(-284, -68, 568, 118); F.text(o.stampText || 'WORSE!', 0, -8, { size: 104, col: '#d8352e', weight: 900 }); g.restore(); }
  F.put(430, 1450, .5, () => { F.fs(F.rr(-50, -300, 100, 300, 10), '#f4ecd8', 6); F.fs(F.ell(0, -330, 22 + 2 * Math.sin(t * 17), 50), '#ffd36a', 0); F.glow(0, -330, 260, 'rgba(255,200,110,.9)', .9); }, { sharp: true });
  if (o.mayor) F.put(-430, 1700, FIG * 1.4, () => mayor(t, { expr: o.mayorExpr || 'sly', turn: .5, look: 1, armF: 10, bendF: -20 }), { rim: true });
  F.flush();
  // candle grade: the reference's night interiors are lit warm from one low source, cool in the corners
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; const cp = F.proj(430, 300, 1450); const wg = g.createRadialGradient(cp.x, cp.y, 40, cp.x, cp.y, 1600); wg.addColorStop(0, '#fff0d8'); wg.addColorStop(.35, '#f2b27a'); wg.addColorStop(.75, '#b06a6a'); wg.addColorStop(1, '#4a3060'); g.fillStyle = wg; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen'; F.glow(cp.x, cp.y, 700, 'rgba(255,150,60,1)', .45);
  g.globalCompositeOperation = 'source-over'; g.restore();
  // the mayor leans in over the plan, big in the foreground, lit warm from the candle side
  if (o.fgMayor) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const k = o.fgMayor; g.translate(lerp(-120, 150, ss(k)), 2260); g.rotate(.08); g.scale(1.75, 1.75);
    const keep = F.g; mayor(t, { expr: o.mayorExpr || 'sly', turn: .55, look: 1, armF: 60, bendF: -40 }); g.restore();
    g.save(); g.globalCompositeOperation = 'soft-light'; F.glow(cp.x - 200, cp.y + 300, 700, 'rgba(255,160,70,1)', .8); g.restore(); }
  }
function setJam(t, o) { F.sky(t, { sunX: 300, sunY: 300 }); skyline(t, { town: false }); const g = F.g, hor = F.cam().hor;
  g.fillStyle = F.vgrad(hor, H, [[0, '#c8b894'], [1, '#a8906a']]); g.fillRect(0, hor, W, H - hor); tiles(-800, 800, F.cam().z + 20, 6000, '#cdb98f', '#bfa982', 80); F.groundQuad(-190, F.cam().z + 20, 190, 9000, '#9a8b74', 0);
  for (let z = 700; z < 9000; z += 900) { F.put(-640, z, 1, () => house({ roof: PAL.sideA, shut: PAL.sideAD, timber: true, w: 480, h: 520, lit: o.night }), { rim: true, shadow: true }); F.put(640, z + 450, 1, () => house({ roof: PAL.sideB, shut: PAL.sideBD, timber: true, w: 480, h: 500, lit: o.night }), { rim: true, shadow: true }); }
  for (let i = 0; i < 24; i++) { const z = 520 + i * 340, sd = i % 2, col = (i % 3 === 1) ? 1 - sd : sd; F.put(sd ? 80 : -80, z, CAR, () => car(col ? PAL.sideB : PAL.sideA, col ? PAL.sideBD : PAL.sideAD, { t, idle: true, seed: i, lights: o.night, honk: i === 1 ? clamp(Math.sin(t * 3)) : 0, plate: col ? 'TEAL' : 'RED', driver: () => driver(col, t, { expr: i < 4 ? 'glare' : 'neutral' }) }), { rim: true, shadow: true }); }
  F.put(-330, 200, .5, () => tuft(6)); F.put(360, 190, .5, () => tuft(12)); groundHaze(); F.flush(); }
function setStuttgart(t) { F.sky(t, { sunX: 820, sunY: 380 }); skyline(t, { town: true }); const g = F.g, hor = F.cam().hor;
  g.fillStyle = F.vgrad(hor, H, [[0, '#c9b998'], [1, '#a99070']]); g.fillRect(0, hor, W, H - hor); tiles(-1200, 1200, F.cam().z + 20, 6000, '#cfbd96', '#c1ad86', 80); F.groundQuad(-240, F.cam().z + 20, 240, 9000, '#8f8a82', 0);
  for (let z = 1200; z < 9000; z += 1200) { F.put(-760, z, 1.1, () => house({ roof: '#b8583f', w: 500, h: 600, timber: true, chimney: true }), { rim: true, shadow: true }); F.put(760, z + 500, 1.1, () => house({ roof: '#6e7f8f', w: 500, h: 560, timber: true }), { rim: true, shadow: true }); }
  F.put(0, 1200, .5, () => barrier('CLOSED'), { rim: true, shadow: true, sharp: true }); F.put(-430, 800, SIGN, () => signpost(['STUTTGART', '1969', 'new road']), { rim: true, shadow: true, sharp: true });
  F.put(260, 520, FIG, () => driver(0, t, { expr: 'smug', turn: -.4, look: -1, flip: true }), { rim: true, shadow: true }); F.put(-200, 200, .5, () => tuft(9)); groundHaze(.65); F.flush(); }
function setSeoul(t) { F.sky(t, { sunX: 760, sunY: 300 }); skyline(t, { town: true }); const g = F.g, hor = F.cam().hor;
  g.fillStyle = F.vgrad(hor, H, [[0, '#c8bfa6'], [1, '#a99a7a']]); g.fillRect(0, hor, W, H - hor);
  F.groundQuad(-300, F.cam().z + 20, 300, 9000, '#4c9fc4', 0); for (let z = Math.max(200, F.cam().z + 60); z < 7000; z += 160) { const a = F.proj(-200 + 150 * Math.sin(z * .01 + t), 0, z), b = F.proj(-120 + 150 * Math.sin(z * .01 + t), 0, z); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(1, 6 * a.s); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
  for (let z = 400; z < 6000; z += 700) [-1, 1].forEach(sd => F.put(sd * 120, z, .3, () => F.fs(F.ell(0, -20, 90, 40), '#d8cdb6', 5)));
  for (let z = 1200; z < 9000; z += 1300) [-1, 1].forEach(sd => F.put(sd * 520, z, 1, () => willow(), { rim: true, shadow: true }));
  for (let z = 2200; z < 9000; z += 1600) { F.put(-1100, z, 1.3, () => house({ roof: '#7d8fa3', w: 560, h: 900, wall: '#e8e2d6' }), { rim: true }); F.put(1100, z + 600, 1.3, () => house({ roof: '#9a7d6a', w: 560, h: 800, wall: '#ece4d8' }), { rim: true }); }
  for (let i = 0; i < 6; i++) { const sd = i % 2, z = 400 + i * 420 + ((t * 40 + i * 90) % 300); F.put(sd ? 420 : -420, z, FIG, () => F.figure({ ...(sd ? TEALD : REDD), t, walk: t * 1.2 + i * .3, expr: 'smug', turn: sd ? -.3 : .3, flip: !!sd }), { rim: true, shadow: true }); }
  F.put(-760, 1400 + ((t * 160) % 900), CAR * .9, () => bus(PAL.sideB), { rim: true, shadow: true }); F.put(560, 900, SIGN, () => signpost(['SEOUL', 'bus + subway', 'riders up']), { rim: true, shadow: true, sharp: true }); F.put(260, 200, .5, () => tuft(3)); groundHaze(.65); F.flush(); }

// ---------- camera keys ----------
function keys(t, K) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) { const [ta, A] = K[i], [tb, B] = K[i + 1]; if (t <= tb) { const u = eio((t - ta) / (tb - ta)), o = {}; for (const k in A) o[k] = lerp(A[k], B[k] ?? A[k], u); return o; } } return K[K.length - 1][1]; }
const CAM0 = { x: 0, z: 0, y: 135, hor: 760, focus: 500, dof: 3, f: 1100 };
const cam = (t, K) => F.setCam(keys(t, K.map(([tt, c]) => [tt, { ...CAM0, ...c }])));
function dusk(k) { if (k <= 0) return; const g = F.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = k * .75; g.fillStyle = F.vgrad(0, H, [[0, '#5b4a9a'], [.45, '#e58a6a'], [1, '#c98a7a']]); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'screen'; g.globalAlpha = k * .35; F.glow(W / 2, 760, 700, 'rgba(255,170,90,1)'); g.restore(); }
function night(k) { if (k <= 0) return; const g = F.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = k * .8; g.fillStyle = F.vgrad(0, H, [[0, '#2a2a6a'], [1, '#4a4a8a']]); g.fillRect(0, 0, W, H); g.restore(); }

// ---------- shots ----------
const S = i => s(i) - .15;
const SHOTS = [
  [0, t => { cam(t, [[0, { x: -10, z: 40, hor: 690, focus: 295, dof: 5 }], [1.4, { x: -25, z: 80, hor: 690, focus: 255, dof: 5 }], [2.2, { x: 25, z: 95, hor: 690, focus: 240, dof: 5 }], [3.6, { x: 35, z: 130, hor: 690, focus: 205, dof: 5 }], [S(2), { x: 0, z: 40, hor: 760, focus: 500, dof: 3, f: 900 }]]);
    const fl = seg(t, .9, 1.4); setSquare(t, { sign: { title: 'MINUTES TO WORK', value: t < .9 ? '65 min' : '80 min', prev: '65 min', flip: fl > 0 && fl < 1 ? fl : 0 }, mayorExpr: t > 1.4 ? 'worried' : 'smug', look: t > 2.2 ? 1 : -1, mayorX: 300, mayorZ: 900, duo: t < .9 ? ['neutral', 'neutral'] : ['worried', 'glare'], cars: [[-620, 1000, 0], [620, 1050, 1]] }); }],
  [S(2), (t, lt) => { cam(lt, [[0, { x: 0, y: 300, z: -500, hor: 700, focus: 1400, dof: 1.6, f: 900 }], [S(4) - S(2), { x: 0, y: 240, z: 150, focus: 1100 }]]); setValley(t, { posts: lt > 3.4 }); }],
  [S(4), (t, lt) => setMap(t, { routes: [{ col: PAL.sideA, segs: [['home', 'A'], ['A', 'mill']] }, { col: PAL.sideB, segs: [['home', 'B'], ['B', 'mill']] }], tags: [[230, 600, 'NARROW', '#8a5a3a', lt - .2], [230, 1040, '45 MIN', '#4a4a52', lt - 1.4], [850, 600, '45 MIN', '#4a4a52', lt - 1.6], [850, 1040, 'NARROW', '#8a5a3a', lt - .4], [260, 300, '2000', PAL.sideA, lt - 5.6], [820, 300, '2000', PAL.sideB, lt - 5.8], [540, 1380, '65 MIN', '#3b3b44', lt - 6.4]] })],
  [S(7), (t, lt) => setDesk(t, { draw: clamp((lt - 1.4) / 2), fgMayor: clamp(lt / 1.2), push: lt * 40 })],
  [S(8), (t, lt) => setMap(t, { shortcut: 1, routes: [{ col: PAL.sideA, segs: [['home', 'A'], ['A', 'B'], ['B', 'mill']] }, { col: PAL.sideB, segs: [['home', 'A'], ['A', 'B'], ['B', 'mill']] }], tags: [[540, 760, '0 MIN', '#c8962a', lt - .4], [230, 600, 'NARROW', '#8a5a3a', lt - 2.8], [850, 1040, 'NARROW', '#8a5a3a', lt - 3.4]] })],
  [S(10), (t, lt) => { cam(lt, [[0, { x: 0, y: 170, z: -150, hor: 760, focus: 640, dof: 4 }], [4, { x: 40, y: 150, z: 180, focus: 820 }]]); setJam(t, { night: lt > 2.4 }); const k = seg(lt, .5, 3.6); dusk(ss(seg(k, 0, .45)) * (1 - ss(seg(k, .55, 1)))); night(ss(seg(k, .45, .75)) * (1 - ss(seg(k, .85, 1)))); }],
  [S(11), (t, lt) => { cam(lt, [[0, { x: -110, z: 150, hor: 700, focus: 520, dof: 5 }], [3, { x: -40, z: 230, focus: 520 }]]); const fl = seg(lt, .6, 1.1); setSquare(t, { sign: { title: 'MINUTES TO WORK', value: lt < .6 ? '65 min' : '80 min', prev: '65 min', flip: fl > 0 && fl < 1 ? fl : 0 }, mayorExpr: 'worried', look: -1, cars: [[-420, 820, 0, 'glare'], [430, 860, 1, 'glare'], [-700, 1200, 1], [700, 1250, 0]] }); }],
  [S(12), (t, lt) => setDesk(t, { draw: 1, push: lt * 50, fgMayor: 1, mayorExpr: lt > 4.4 ? 'shock' : 'sly', texts: [['BRAESS\'S PARADOX', 0, 1140, 76, '#ffffff', lt - 2.6], ['more road, slower trip', 0, 1020, 50, '#e8f0ff', lt - 3]], stamp: clamp((lt - 4.4) / 1), stampText: 'WORSE!' })],
  [S(14), (t, lt) => { cam(lt, [[0, { x: 0, y: 160, z: -200, hor: 760, focus: 520, dof: 4 }], [6, { x: -40, y: 150, z: 0, focus: 520 }]]); setStuttgart(t); }],
  [S(15), (t, lt) => { cam(lt, [[0, { x: 0, y: 220, z: -300, hor: 760, focus: 700, dof: 3 }], [5, { x: 60, y: 200, z: 100, focus: 700 }]]); setSeoul(t); }],
  [S(16), (t, lt) => { const fl = seg(lt, 2.3, 2.8); cam(lt, [[0, { x: 60, z: 160, hor: 690, focus: 210, dof: 5 }], [2.4, { x: 20, z: 100, hor: 690, focus: 250, dof: 5 }], [DUR - S(16) - 1.1, { x: -10, z: 40, hor: 690, focus: 295, dof: 5 }]]);
    setSquare(t, { sign: { title: 'MINUTES TO WORK', value: lt < 2.3 ? '80 min' : '65 min', prev: '80 min', flip: fl > 0 && fl < 1 ? fl : 0 }, mayorExpr: fl >= 1 ? 'smug' : 'neutral', look: -1, mayorX: 300, mayorZ: 900, duo: lt > 2.6 && t < DUR - 1.2 ? ['smug', 'smug'] : lt > 2.6 ? ['neutral', 'neutral'] : ['worried', 'glare'], cars: [[-620, 1000, 0], [620, 1050, 1]] }); }],
];
// captions: 1-2 words per chunk, timed by characters through each line
const CAPS = []; P.forEach((p, i) => { if (i === N - 1) return; const ws = p.cap.replace(/\*\*/g, '').split(/\s+/), ch = []; for (let j = 0; j < ws.length;) { const w = ws[j]; if (w.length > 7 || j === ws.length - 1 || ws[j + 1].length > 7 || /[.,:;]$/.test(w)) { ch.push(w); j++; } else { ch.push(w + ' ' + ws[j + 1]); j += 2; } }
  const tot = ch.reduce((a, c) => a + c.length + 1, 0); let acc = 0; ch.forEach((c, j) => { const a = p.start + (p.end - p.start) * acc / tot; acc += c.length + 1; const b = j === ch.length - 1 ? Math.min(p.end + .3, P[i + 1].start - .05) : p.start + (p.end - p.start) * acc / tot; CAPS.push({ a: a - .04, b: b - .04, w: c.replace(/[,:;]$/, '') }); }); });
function endCard(lt) { if (lt <= 0) return; const g = F.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = clamp(lt / .4); F.text('Follow for more of', W / 2, 290, { size: 66, col: '#fff', weight: 900, stroke: 12, strokeCol: '#151015', shadow: 6 }); F.text('how it really works.', W / 2, 370, { size: 66, col: '#fff', weight: 900, stroke: 12, strokeCol: '#151015', shadow: 6 }); g.restore(); }
const WHIP = .16, WHIPS = [2, 5, 8, 9].map(i => SHOTS[i][0]);
function render(t) { const g = F.g; g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i][0]) k = i; const [t0, fn] = SHOTS[k]; fn(t, t - t0);
  const cut = WHIPS.find(c => Math.abs(t - c) < WHIP); if (cut != null) { const d = Math.abs(t - cut), kk = 1 - d / WHIP, sh = Math.round((t < cut ? -1 : 1) * kk * kk * 300); const img = g.getImageData(0, 0, W, H); g.putImageData(img, sh, 0); g.putImageData(img, sh - Math.sign(sh || 1) * W, 0); F.smear(kk * 460); }
  F.post(t); F.captions(CAPS, t, 1330); endCard(t - (s(N - 1) - .1)); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H;
const r = (i, d = 0) => s(i) + d;
window.CUES = [['tick', 1.0], ['tick', 1.25], ['whoosh', S(2)], ['pop', r(4, .3)], ['pop', r(4, 1.6)], ['pop', r(6, .6)], ['pop', r(6, 1.0)], ['scribble', r(7, 1.4), r(7, 3.4)], ['whoosh', S(8)], ['chime', r(8, .4), 79], ['whoosh', S(10)], ['thud', r(10, .6)], ['thud', r(10, 1.4)],
  ['tick', r(11, .6)], ['tick', r(11, .8)], ['scribble', r(12, 2.6), r(12, 3.4)], ['thud', r(12, 4.5)], ['whoosh', S(14)], ['slide', r(14, 1)], ['whoosh', S(15)], ['tick', r(16, 2.3)], ['tick', r(16, 2.5)], ['chime', r(17, .3), 84]];
window.DUR = DUR;
window.seek = t => { render(Math.min(t, DUR - 1e-3)); const kk = ss(seg(t, DUR - .5, DUR)) * .4; if (kk > 0) { const g = F.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = kk; g.drawImage(F0, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { render(1.6); const g = F.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); F.text('NEW ROAD,', W / 2, 1180, { size: 120, col: '#fff', weight: 900, stroke: 18, strokeCol: '#151015', shadow: 8 }); F.text('MORE TRAFFIC?', W / 2, 1320, { size: 120, col: '#fff', weight: 900, stroke: 18, strokeCol: '#151015', shadow: 8 }); g.restore(); };
render(0); F0.getContext('2d').drawImage(F.g.canvas, 0, 0);
window.seek(0); window.ready = true; window.READY = true;
