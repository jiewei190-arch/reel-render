// t_newroad.js: "The town that built a new road and traffic got worse" (Braess's paradox) in template #30 story fable (look: STYLE_STORY.md).
// Two sides, red route vs teal route. Every cut, caption chunk and grade change is driven by the line timings in tl_newroad.js.
import { createFable, W, H, TAU, clamp, lerp, ss, eo, eio, hash, mix, INK, CREAM, HEAD, RED, RED2, TEAL, TEAL2 } from './styles/storyfable/fable.js';
await Promise.all(['900 78px Nunito', '700 40px Cinzel'].map(f => document.fonts.load(f)));
const TL = window.TL, P = TL.p, TOT = TL.total, s = i => P[i].start, N = P.length;
const F = createFable(document.getElementById('c')), g = F.g;
const MAYOR = { col: '#d19a3c', dark: '#a8742a', hat: 'top', stache: true, sash: '#e9cf6a', pocket: true };
const DRV = (side, i) => ({ col: side ? '#2c9e98' : '#d24a44', cap: side ? TEAL : RED, capDir: side ? -1 : 1, seed: i, stache: hash(i) > .6, goatee: hash(i + 3) > .8, expr: 'neutral' });

// ---------- camera keys: eased moves between keyframes ----------
function cam(t, keys) { let a = keys[0], b = keys[keys.length - 1]; for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; } if (t < keys[0][0]) b = a; const u = b[0] === a[0] ? 1 : eio((t - a[0]) / (b[0] - a[0])); const c = {}; for (const k in a[1]) c[k] = lerp(a[1][k], b[1][k] ?? a[1][k], u); F.setCam(c); }
// ---------- set pieces ----------
function house(c, o) { const w = o.w || 220, h = o.h || 190, roof = o.roof || RED; F.shape(c, q => q.rect(-w / 2, -h, w, h), o.wall || '#efe4cf', { side: '#d9cdb5', sx: w * .2 });
  F.shape(c, q => { q.moveTo(-w / 2 - 22, -h); q.lineTo(0, -h - w * .55); q.lineTo(w / 2 + 22, -h); q.closePath(); }, roof, { side: mix(roof, INK, .25), sx: 0 });
  if (!F.RIM) { c.fillStyle = '#6e4a34'; c.fillRect(-22, -70, 44, 70); c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(-22, -70, 44, 70); for (const wx of [-w * .32, w * .32]) { c.fillStyle = o.lit ? '#ffd889' : '#9cc9e4'; c.fillRect(wx - 20, -h + 40, 40, 40); c.strokeRect(wx - 20, -h + 40, 40, 40); c.beginPath(); c.moveTo(wx, -h + 40); c.lineTo(wx, -h + 80); c.moveTo(wx - 20, -h + 60); c.lineTo(wx + 20, -h + 60); c.stroke(); } } }
function banner(c, o) { F.stick(c, [[0, 0], [0, -460]], 6); const col = o.col; const wv = Math.sin((o.t || 0) * 2 + (o.seed || 0)) * 6; F.shape(c, q => { q.moveTo(0, -450); q.lineTo(110, -450 + wv * .3); q.lineTo(110, -230 + wv); q.lineTo(55, -265 + wv); q.lineTo(0, -230); q.closePath(); }, col, { side: mix(col, INK, .25), sx: 80 });
  if (!F.RIM) { c.strokeStyle = 'rgba(255,240,220,.85)'; c.lineWidth = 5; c.beginPath(); if (o.mark === 'R') { c.moveTo(55, -280); c.lineTo(55, -400); c.moveTo(38, -380); c.lineTo(55, -405); c.lineTo(72, -380); } else { c.arc(55, -350, 26, 0, TAU); } c.stroke(); } }
function tree(c, o) { const r = o.r || 90; F.stick(c, [[0, 0], [0, -r * 1.2]], 10); F.shape(c, q => { q.arc(0, -r * 1.7, r, 0, TAU); q.moveTo(r * .9 + -r * .5, -r * 1.3); q.arc(-r * .5, -r * 1.3, r * .7, 0, TAU); q.moveTo(r * .5 + r * .7, -r * 1.35); q.arc(r * .5, -r * 1.35, r * .7, 0, TAU); }, o.col || '#5b9a48', { side: '#467e38', sideFn: q => q.rect(-r * 2, -r * 1.5, r * 4, r) }); }
function tuft(c, o) { if (F.RIM) return; const col = o.col || '#6d9c3e'; c.strokeStyle = col; c.lineCap = 'round'; for (let i = 0; i < 9; i++) { const a = (i - 4) * .16 + Math.sin((o.t || 0) * 1.5 + i) * .04, L = 40 + 30 * hash(i + (o.seed || 0)); c.lineWidth = 5; c.beginPath(); c.moveTo((i - 4) * 4, 0); c.quadraticCurveTo((i - 4) * 6 + Math.sin(a) * L * .5, -L * .6, (i - 4) * 4 + Math.sin(a) * L, -L); c.stroke(); }
  if (o.flower) { c.fillStyle = o.flower; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-14 + i * 14, -54 - 8 * hash(i), 7, 0, TAU); c.fill(); } } }
function mill(c, o) { F.shape(c, q => { q.moveTo(-70, 0); q.lineTo(-48, -260); q.lineTo(48, -260); q.lineTo(70, 0); q.closePath(); }, '#efe1c4', { side: '#d8c8a6', sx: 10 }); F.shape(c, q => { q.moveTo(-60, -258); q.lineTo(0, -330); q.lineTo(60, -258); q.closePath(); }, '#8a5a3a', { sx: 0, side: '#6d4630' });
  const a = (o.t || 0) * .8; for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; F.shape(c, q => { q.moveTo(0, -270); q.lineTo(Math.cos(b - .12) * 190, -270 + Math.sin(b - .12) * 190); q.lineTo(Math.cos(b + .12) * 190, -270 + Math.sin(b + .12) * 190); q.closePath(); }, '#f6efe1', { lw: 3 }); } }
function busV(c, o) { F.shape(c, q => q.roundRect(-220, -170, 440, 150, 22), o.col || TEAL, { side: mix(o.col || TEAL, INK, .25), sideFn: q => q.rect(-230, -60, 460, 50) }); if (!F.RIM) { c.fillStyle = '#cfe6f2'; for (let i = 0; i < 5; i++) { c.fillRect(-196 + i * 82, -150, 64, 50); c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(-196 + i * 82, -150, 64, 50); } c.font = '900 36px Nunito'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('BUS', 0, -66); }
  for (const wx of [-150, 150]) F.shape(c, q => q.arc(wx, -22, 24, 0, TAU), '#2d2a2e', { lw: 3 }); }
function barrier(c, o) { for (const px of [-120, 120]) F.stick(c, [[px, 0], [px, -90]], 7); F.shape(c, q => q.rect(-150, -110, 300, 36), '#f4efe6', { lw: 4 }); if (!F.RIM) { c.save(); c.beginPath(); c.rect(-150, -110, 300, 36); c.clip(); c.fillStyle = RED; for (let i = -6; i < 8; i++) { c.beginPath(); c.moveTo(i * 44, -110); c.lineTo(i * 44 + 22, -110); c.lineTo(i * 44 - 14, -74); c.lineTo(i * 44 - 36, -74); c.closePath(); c.fill(); } c.restore(); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(-150, -110, 300, 36); } if (o.label && !F.RIM) { c.font = '900 34px Nunito'; c.fillStyle = INK; c.textAlign = 'center'; c.fillText(o.label, 0, -124); } }
function signpost(c, o) { F.stick(c, [[0, 0], [0, -300]], 8); F.shape(c, q => q.roundRect(-150, -330, 300, o.lines.length * 52 + 26, 10), o.col || '#f2ead6', { lw: 4 }); if (!F.RIM) { c.textAlign = 'center'; o.lines.forEach((ln, i) => { c.font = `${i ? 700 : 900} ${i ? 34 : 44}px ${i ? 'Nunito' : 'Cinzel'}`; c.fillStyle = o.ink || INK; c.fillText(ln, 0, -290 + i * 52); }); } }

// ---------- shared sky + far layer ----------
function skyDay(t, o = {}) { F.sky({ sun: o.sun, top: o.top, mid: o.mid, hz: o.hz }); const dx = t * 6; [[150, 260, .9, 3], [620, 200, 1.1, 7], [930, 430, .8, 9], [380, 560, 1.2, 12], [820, 690, .7, 15]].forEach(([x, y, sc, sd]) => F.cloud(((x + dx * sc) % 1400) - 160, y + (F.cam.hor - 840) * .3, sc, sd, o.cloud)); }
function farTown(k = .55) { F.hills([[0, 120], [180, 170], [360, 130], [560, 200], [760, 140], [960, 180], [1080, 150]], '#7fa7c9', .55); F.hills([[0, 60], [220, 90], [430, 70], [650, 100], [880, 64], [1080, 86]], '#7ca35f', k); F.horizonHaze(.75, 110); }
// ---------- grade overlays ----------
function grade(kind, k) { if (k <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (kind === 'night') { g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(70,80,160,${.75 * k})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  if (kind === 'dusk') { g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(255,170,150,${.5 * k})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(80,30,60,${.15 * k})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; } g.restore(); }

// ---------- SETS ----------
// A: town square with the counter sign (open / close prop)
function setSquare(t, o) { skyDay(t); farTown(); for (let i = -2; i <= 2; i++) F.put(i * 330 + 60, 2600 + 140 * (i % 2), (c) => house(c, { roof: i % 2 ? TEAL : RED, w: 260, h: 220 }), { rim: true });
  // tiled plaza
  F.groundQuad(-1400, 80, 1400, 2600, '#d9c7a0'); for (let z = 100; z < 2600; z += 120) F.groundLine([[-1400, z], [1400, z]], 'rgba(120,95,60,.5)', 3); for (let x = -1400; x <= 1400; x += 140) F.groundLine([[x, 80], [x, 2600]], 'rgba(120,95,60,.5)', 3);
  F.groundQuad(-110, 80, 110, 2600, 'rgba(201,56,58,.0)'); F.groundLine([[0, 80], [0, 2600]], 'rgba(212,168,46,.8)', 10);
  F.put(-560, 1400, c => banner(c, { col: RED, mark: 'R', t }), { shadow: .8 }); F.put(560, 1400, c => banner(c, { col: TEAL, t, seed: 2 }), { shadow: .8 });
  F.put(-190, 820, c => F.counterSign(c, o.sign), { shadow: 1, sharp: true });
  F.put(200, 780, c => F.figure(c, { ...MAYOR, t, expr: o.mayorExpr || 'smug', turn: o.turn ?? -.4, look: -.6, armF: o.armF ?? .5, bendF: .6, sweat: o.sweat }), { shadow: 1 });
  (o.drivers || []).forEach(([x, z, side, ex], i) => F.put(x, z, c => F.figure(c, { ...DRV(side, i + 3), t, long: false, expr: ex || 'glare', turn: side ? -.6 : .6 }), { shadow: 1 }));
  F.put(-260, 260, c => tuft(c, { t, flower: RED, seed: 4 }), {}); F.put(300, 240, c => tuft(c, { t, flower: '#f1d15a', seed: 8 }), {});
  F.flush(); }
// B: the valley from Hilltown: red road left, teal road right, the Mill far away
function roadPoly(xa, xb, z0, z1, w0, w1) { return [[xa - w0, z0], [xa + w0, z0], [xb + w1, z1], [xb - w1, z1]]; }
function setValley(t, o) { skyDay(t, { sun: o.sun }); farTown(.5); F.field('#7f9a3c', '#a9b273');
  const L = roadPoly(-120, -1300, 60, 9000, 120, 140), R = roadPoly(120, 1300, 60, 9000, 120, 140); F.groundPoly(L, mix('#9a7d58', RED, .18)); F.groundPoly(R, mix('#9a7d58', TEAL, .18));
  for (const [xa, xb] of [[-120, -1300], [120, 1300]]) { F.groundLine([[xa - 120, 60], [xb - 140, 9000]], 'rgba(240,225,190,.8)', 6); F.groundLine([[xa + 120, 60], [xb + 140, 9000]], 'rgba(240,225,190,.8)', 6); for (let z = 100; z < 9000; z += 380) { const u0 = z / 9000, u1 = (z + 160) / 9000; F.groundLine([[lerp(xa, xb, u0), z], [lerp(xa, xb, u1), z + 160]], 'rgba(255,245,215,.85)', 5); } }
  F.pebbles(-1800, 1800, 150, 4000, 260, 'rgba(90,70,40,.5)', 3);
  F.put(0, 9500, c => mill(c, { t }), { haze: .6 }); F.put(-1500, 8600, c => house(c, { roof: RED }), {}); F.put(1500, 8600, c => house(c, { roof: TEAL }), {});
  for (let i = 0; i < 8; i++) F.put((i % 2 ? 1 : -1) * (1700 + 500 * hash(i)), 1500 + i * 900, c => tree(c, { r: 90 }), { shadow: .6 });
  const cars = o.cars ?? 8; for (let i = 0; i < cars; i++) { const side = i % 2, u = ((t * .045 + i * .13) % 1), z = lerp(250, 8000, u), xa = side ? 120 : -120, xb = side ? 1300 : -1300, x = lerp(xa, xb, z / 9000) + (side ? 30 : -30); F.put(x, z, c => F.car(c, { col: side ? TEAL : RED, back: true, t, seed: i, driver: DRV(side, i) }), { shadow: .7 }); }
  if (o.posts) { F.put(-470, 900, c => signpost(c, { lines: ['RED ROUTE', 'narrow street', '+ highway'], col: '#f6dcd8', ink: RED2 }), { sharp: true, shadow: .7 }); F.put(470, 900, c => signpost(c, { lines: ['TEAL ROUTE', 'highway', '+ narrow street'], col: '#d6efec', ink: TEAL2 }), { sharp: true, shadow: .7 }); }
  F.put(-280, 160, c => tuft(c, { t, seed: 2, flower: '#f1d15a' })); F.put(330, 150, c => tuft(c, { t, seed: 5, flower: RED }));
  F.flush(); }
// C/E: overhead map of the network (graphic top-down, like the reference's formation shots)
const NODE = { home: [540, 430], A: [250, 800], B: [830, 800], mill: [540, 1150] };
function mapPath(seg) { const a = NODE[seg[0]], b = NODE[seg[1]]; return u => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; }
function setMap(t, o) { g.fillStyle = '#86b25a'; g.fillRect(0, 0, W, H); for (let i = 0; i < 380; i++) { g.fillStyle = hash(i) > .5 ? 'rgba(60,100,40,.18)' : 'rgba(200,230,140,.18)'; g.beginPath(); g.ellipse(hash(i * 2.1) * W, hash(i * 3.3) * H, 30 + 60 * hash(i), 14 + 20 * hash(i + 1), hash(i + 4) * 3, 0, TAU); g.fill(); }
  const road = (a, b, w, col, edge) => { const A = NODE[a], B = NODE[b]; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = w + 10; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); if (edge) { g.setLineDash([22, 18]); g.strokeStyle = 'rgba(255,245,215,.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); g.setLineDash([]); } };
  road('home', 'A', 30, mix('#9a7d58', RED, .35)); road('A', 'mill', 74, mix('#8b8378', RED, .2), 1); road('home', 'B', 74, mix('#8b8378', TEAL, .2), 1); road('B', 'mill', 30, mix('#9a7d58', TEAL, .35));
  if (o.shortcut > 0) { const k = clamp(o.shortcut), A = NODE.A, B = NODE.B; g.strokeStyle = INK; g.lineWidth = 44; g.lineCap = 'round'; g.beginPath(); g.moveTo(...A); g.lineTo(lerp(A[0], B[0], k), A[1]); g.stroke(); g.strokeStyle = '#e6be3c'; g.lineWidth = 32; g.beginPath(); g.moveTo(...A); g.lineTo(lerp(A[0], B[0], k), A[1]); g.stroke(); }
  // towns
  for (const [n, col, lab] of [['home', '#efe4cf', 'HILLTOWN'], ['mill', '#efe4cf', 'THE MILL']]) { const [x, y] = NODE[n]; g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.roundRect(x - 80, y - 50, 160, 100, 20); g.fill(); g.stroke(); g.font = '700 34px Cinzel'; g.fillStyle = INK; g.textAlign = 'center'; g.fillText(lab, x, y + 12); }
  // car dots flowing along each driver's route
  const routes = o.routes; const n = 60; for (let i = 0; i < n; i++) { const r = routes[i % routes.length], u = (t * .18 + i / n) % 1, segs = r.segs, k = u * segs.length, si = Math.min(segs.length - 1, Math.floor(k)), p = mapPath(segs[si])(k - si);
    g.fillStyle = r.col; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.roundRect(p[0] - 12, p[1] - 9, 24, 18, 5); g.fill(); g.stroke(); }
  (o.tags || []).forEach(([x, y, txt, col, k]) => { if (k <= 0) return; g.save(); g.globalAlpha = clamp(k * 4); g.translate(x, y); g.scale(.8 + .2 * eo(k * 3), .8 + .2 * eo(k * 3)); g.font = '900 40px Nunito'; const w = g.measureText(txt).width + 40; g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2, -34, w, 60, 14); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(txt, 0, 10); g.restore(); }); }
// D/H: night desk with the blueprint
function setDesk(t, o) { g.fillStyle = '#2a2140'; g.fillRect(0, 0, W, H); const rg = g.createRadialGradient(780, 420, 20, 780, 420, 900); rg.addColorStop(0, 'rgba(255,190,110,.55)'); rg.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  F.setCam({ x: 0, y: 420, z: -300 + (o.push || 0), hor: 360, f: 1000, focus: 700, dof: 3 });
  F.groundQuad(-1200, 0, 1200, 2200, '#6b4630'); F.groundQuad(-520, 180, 520, 1500, '#2f5fb8', { line: '#e9f1ff', lw: 4 }); for (let x = -500; x <= 500; x += 100) F.groundLine([[x, 190], [x, 1490]], 'rgba(220,235,255,.18)', 2); for (let z = 200; z < 1500; z += 100) F.groundLine([[-510, z], [510, z]], 'rgba(220,235,255,.18)', 2);
  // the network drawn on the blueprint (in ground coords)
  const M = { home: [0, 1280], A: [-300, 830], B: [300, 830], mill: [0, 380] }; const ln = (a, b, w, col = '#eaf2ff') => F.groundLine([M[a], M[b]], col, w);
  ln('home', 'A', 6, '#ffb3ae'); ln('A', 'mill', 14, '#ffb3ae'); ln('home', 'B', 14, '#a6ece6'); ln('B', 'mill', 6, '#a6ece6');
  if (o.draw > 0) { const k = clamp(o.draw), e = [lerp(M.A[0], M.B[0], k), M.A[1]]; F.groundLine([M.A, e], '#ffe27a', 10); const p = F.proj(e[0], 0, e[1]); const gl = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 90); gl.addColorStop(0, 'rgba(255,250,220,1)'); gl.addColorStop(.25, 'rgba(255,230,150,.6)'); gl.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = gl; g.fillRect(p.x - 90, p.y - 90, 180, 180); }
  const tx = (str, X, Z, size, col, k = 1) => { if (k <= 0) return; const p = F.proj(X, 0, Z); g.save(); g.globalAlpha = clamp(k * 4); g.translate(p.x, p.y); g.scale(p.s * 1.6, p.s * .9 * 1.6); g.font = `700 ${size}px Cinzel`; g.textAlign = 'center'; g.fillStyle = col; g.fillText(str, 0, 0); g.restore(); };
  tx('HILLTOWN', 0, 1360, 34, '#eaf2ff'); tx('THE MILL', 0, 300, 34, '#eaf2ff'); if (o.draw > .6) tx('SHORTCUT: 0 MIN', 0, 900, 30, '#ffe27a', (o.draw - .6) * 2);
  (o.texts || []).forEach(a => tx(...a));
  if (o.stamp > 0) { const k = o.stamp, sc = k < .15 ? lerp(1.8, 1, k / .15) : 1; g.save(); g.translate(540, 1020); g.rotate(-.14); g.scale(sc, sc); g.globalAlpha = .9; g.strokeStyle = '#d8352e'; g.lineWidth = 10; g.strokeRect(-260, -70, 520, 130); g.font = '900 96px Nunito'; g.fillStyle = '#d8352e'; g.textAlign = 'center'; g.fillText(o.stampText || 'WORSE!', 0, 32); g.restore(); }
  // candle + mayor
  F.put(430, 1500, c => { F.shape(c, q => q.rect(-16, -110, 32, 110), '#f4ecd8', { lw: 3 }); if (!F.RIM) { const fl = 1 + .1 * Math.sin(t * 17); c.fillStyle = '#ffd36a'; c.beginPath(); c.ellipse(0, -128, 9 * fl, 18 * fl, 0, 0, TAU); c.fill(); } }, { sharp: true });
  if (o.mayor) F.put(-420, 1650, c => F.figure(c, { ...MAYOR, t, expr: o.mayorExpr || 'sly', turn: .5, look: .5, armF: 1.3, bendF: .5 }), {});
  F.flush(); g.save(); g.globalCompositeOperation = 'screen'; const cg = g.createRadialGradient(840, 700, 0, 840, 700, 700); cg.addColorStop(0, 'rgba(255,170,80,.25)'); cg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = cg; g.fillRect(0, 0, W, H); g.restore(); }
// F: the jam on the narrow street (ground level, cars facing us)
function setJam(t, o) { skyDay(t, { cloud: o.night ? { top: '#c7c3e0', under: '#8f8bb6', under2: '#7d79a8' } : undefined }); farTown(.5); F.field('#7f9a3c', '#a9b273');
  F.groundQuad(-170, 40, 170, 9000, '#9a8466'); F.groundLine([[-170, 40], [-170, 9000]], 'rgba(240,225,190,.9)', 7); F.groundLine([[170, 40], [170, 9000]], 'rgba(240,225,190,.9)', 7); F.pebbles(-2000, 2000, 150, 3500, 300, 'rgba(90,70,40,.5)', 7);
  for (let z = 1600; z < 9000; z += 1500) { F.put(-560, z, c => house(c, { roof: o.side ? TEAL : RED, w: 200 }), { shadow: .5 }); F.put(560, z + 600, c => house(c, { roof: o.side ? TEAL : RED, w: 200 }), { shadow: .5 }); }
  for (let i = 0; i < 22; i++) { const z = 520 + i * 300, side = i % 2; F.put(side ? 70 : -70, z, c => F.car(c, { col: i % 3 ? (side ? TEAL : RED) : (side ? RED : TEAL), t, idle: true, seed: i, lights: o.night, driver: { ...DRV(side, i), expr: i < 3 ? 'glare' : 'neutral' } }), { shadow: .6 }); }
  F.put(-360, 300, c => tuft(c, { t, seed: 3, flower: RED })); F.put(380, 280, c => tuft(c, { t, seed: 6, flower: '#f1d15a' }));
  F.flush(); }
// I: Stuttgart: the new road closed with a barrier
function setStuttgart(t, o) { skyDay(t, { top: '#a7c2e6', mid: '#cfdcef', hz: '#efe2cc' }); F.hills([[0, 150], [200, 210], [420, 170], [700, 240], [1080, 190]], '#7d97b8', .5); F.horizonHaze(.7, 110); F.field('#7d8f4a', '#aab07a');
  F.groundQuad(-220, 40, 220, 9000, '#8f8a82'); F.groundLine([[0, 60], [0, 9000]], 'rgba(255,240,200,.8)', 6);
  for (let z = 1200; z < 9000; z += 1300) { F.put(-620, z, c => house(c, { roof: '#b8583f', w: 230, h: 260 }), { shadow: .5 }); F.put(620, z + 500, c => house(c, { roof: '#6e7f8f', w: 230, h: 240 }), { shadow: .5 }); }
  F.put(0, 1100, c => barrier(c, { label: 'CLOSED' }), { shadow: .8, sharp: true }); F.put(-380, 800, c => signpost(c, { lines: ['STUTTGART', '1969', 'new road'] }), { shadow: .8, sharp: true });
  F.put(230, 420, c => F.figure(c, { ...DRV(0, 31), t, long: false, expr: 'smug', turn: -.5, armF: 1.2, bendF: .4 }), { shadow: 1 }); F.put(-200, 300, c => tuft(c, { t, seed: 9, flower: RED })); F.flush(); }
// J: Seoul: a stream where the highway was, people walking, a bus above
function setSeoul(t, o) { skyDay(t, { top: '#9fc8ee' }); F.hills([[0, 240], [160, 300], [320, 260], [500, 340], [700, 280], [900, 330], [1080, 300]], '#8aa1bf', .5); F.horizonHaze(.7, 120); F.field('#8b8a7a', '#c0b9a4');
  F.groundQuad(-260, 40, 260, 9000, '#5aa3c4'); for (let z = 100; z < 9000; z += 240) F.groundLine([[-200 + 120 * Math.sin(z * .01 + t), z], [-120 + 120 * Math.sin(z * .01 + t), z]], 'rgba(255,255,255,.55)', 4);
  F.groundQuad(-460, 40, -260, 9000, '#c8b89a'); F.groundQuad(260, 40, 460, 9000, '#c8b89a');
  for (let z = 1800; z < 9000; z += 1400) { F.put(-820, z, c => house(c, { roof: '#7d8fa3', w: 240, h: 330, wall: '#e8e2d6' }), { shadow: .4 }); F.put(820, z + 500, c => house(c, { roof: '#9a7d6a', w: 240, h: 300, wall: '#ece4d8' }), { shadow: .4 }); }
  for (let i = 0; i < 6; i++) { const side = i % 2, z = 300 + i * 500 + ((t * 40 + i * 90) % 300); F.put(side ? 340 : -340, z, c => F.figure(c, { ...DRV(side, 40 + i), cap: undefined, t, long: false, walk: t * 1.3 + i, expr: 'smug', turn: side ? -.3 : .3 }), { shadow: 1 }); }
  F.put(-640, 1200 + ((t * 120) % 800), c => busV(c, { col: TEAL }), { shadow: .7 }); F.put(560, 700, c => signpost(c, { lines: ['SEOUL', 'bus + subway', 'up'] }), { sharp: true, shadow: .8 });
  F.put(300, 260, c => tuft(c, { t, seed: 1, flower: '#f1d15a' })); F.flush(); }

// ---------- shots, timed by the lines ----------
const S = i => s(i) - .15;
const SHOTS = [
  [0, t => { const k = clamp((t - .9) / .5); cam(t, [[0, { x: -150, y: 170, z: 330, hor: 760, f: 1000, focus: 800, dof: 4 }], [1.6, { x: -170, z: 400 }], [3, { x: 150, z: 360 }], [S(2), { x: 20, z: 160, focus: 820 }]]);
    setSquare(t, { sign: { value: 80, prev: 65, flip: k }, mayorExpr: t > 1.4 ? 'worried' : 'smug', sweat: t > 1.6, drivers: t > 3 ? [[-470, 950, 0], [520, 980, 1]] : [] }); }],
  [S(2), (t, lt) => { cam(lt, [[0, { x: 0, y: 260, z: -400, hor: 760, f: 1000, focus: 2600, dof: 1.4 }], [S(4) - S(2), { x: 0, y: 220, z: 200 }]]); setValley(t, { posts: lt > 3.6 }); }],
  [S(4), (t, lt) => { const k = lt; setMap(t, { routes: [{ col: RED, segs: [['home', 'A'], ['A', 'mill']] }, { col: TEAL, segs: [['home', 'B'], ['B', 'mill']] }], tags: [[250, 620, 'NARROW', '#8a5a3a', k - .2], [250, 1000, '45 MIN', '#4a4a52', k - 1.4], [830, 620, '45 MIN', '#4a4a52', k - 1.6], [830, 1000, 'NARROW', '#8a5a3a', k - .4], [250, 360, '2000', RED, k - 5.6], [830, 360, '2000', TEAL, k - 5.8], [540, 1280, '65 MIN', '#3b3b44', k - 6.4]] }); }],
  [S(7), (t, lt) => setDesk(t, { draw: clamp((lt - 1.4) / 2), mayor: true, push: lt * 40 })],
  [S(8), (t, lt) => setMap(t, { shortcut: 1, routes: [{ col: RED, segs: [['home', 'A'], ['A', 'B'], ['B', 'mill']] }, { col: TEAL, segs: [['home', 'A'], ['A', 'B'], ['B', 'mill']] }], tags: [[540, 760, '0 MIN', '#c8962a', lt - .4], [250, 620, 'NARROW', '#8a5a3a', lt - 2.8], [830, 1000, 'NARROW', '#8a5a3a', lt - 3.4]] })],
  [S(10), (t, lt) => { cam(lt, [[0, { x: 0, y: 190, z: -200, hor: 860, f: 1000, focus: 900, dof: 4 }], [4, { x: 30, y: 170, z: 150 }]]); setJam(t, { side: 0 }); grade('dusk', ss(.5, 3.5, lt)); }],
  [S(11), (t, lt) => { cam(lt, [[0, { x: -80, y: 170, z: 330, hor: 760, f: 1000, focus: 820, dof: 4 }], [3, { x: -60, z: 420 }]]); setSquare(t, { sign: { value: 80, prev: 65, flip: clamp((lt - .6) / .5) }, mayorExpr: 'worried', sweat: true, drivers: [[-420, 820, 0], [430, 860, 1], [-640, 1100, 1], [640, 1150, 0]] }); }],
  [S(12), (t, lt) => setDesk(t, { draw: 1, push: lt * 50, texts: [['BRAESS\'S PARADOX', 0, 1100, 40, '#ffffff', lt - 2.6], ['more road, slower trip', 0, 1010, 24, '#eaf2ff', lt - 3]], stamp: clamp((lt - 4.4) / 1), stampText: 'WORSE!' })],
  [S(14), (t, lt) => { cam(lt, [[0, { x: 0, y: 180, z: -200, hor: 800, f: 1000, focus: 450, dof: 3 }], [6, { x: -40, y: 170, z: -60 }]]); setStuttgart(t, {}); }],
  [S(15), (t, lt) => { cam(lt, [[0, { x: 0, y: 220, z: -300, hor: 820, f: 1000, focus: 700, dof: 2.5 }], [5, { x: 60, y: 200, z: 150 }]]); setSeoul(t, {}); }],
  [S(16), (t, lt) => { const k = clamp((lt - 2.3) / .5); cam(lt, [[0, { x: 60, y: 170, z: 160, hor: 760, f: 1000, focus: 820, dof: 4 }], [3, { x: -120, z: 360 }], [8, { x: -150, y: 170, z: 330 }]]); setSquare(t, { sign: { value: 65, prev: 80, flip: k }, mayorExpr: k > .5 ? 'smug' : 'neutral', drivers: lt > 2.6 ? [[-520, 900, 0, 'smug'], [520, 950, 1, 'smug']] : [[-520, 900, 0], [520, 950, 1]] }); }],
];
// captions: 1-2 words per chunk, timed by characters through each line
const CAP = []; P.forEach((p, i) => { if (i === N - 1) return; const ws = p.cap.replace(/\*\*/g, '').split(/\s+/), ch = []; for (let j = 0; j < ws.length;) { const w = ws[j]; if (w.length > 7 || j === ws.length - 1 || ws[j + 1].length > 7 || /[.,:;]$/.test(w)) { ch.push(w); j++; } else { ch.push(w + ' ' + ws[j + 1]); j += 2; } }
  const tot = ch.reduce((a, c) => a + c.length + 1, 0); let acc = 0; ch.forEach(c => { CAP.push([p.start + (p.end - p.start) * acc / tot, c]); acc += c.length + 1; }); CAP.push([p.end + .05, '']); });
function caption(t) { let c = null, t0 = 0; for (const [ts, str] of CAP) if (t >= ts) { c = str; t0 = ts; } if (c) F.caption(c.replace(/[,.:;]$/, ''), 1310, (t - t0) / .3); }
function endCard(t, lt) { if (lt <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '900 64px Nunito'; g.textAlign = 'center'; g.lineJoin = 'round'; const a = clamp(lt / .4); g.globalAlpha = a; for (const [str, y] of [['Follow for more of', 420], ['how it really works.', 500]]) { g.strokeStyle = '#1a1412'; g.lineWidth = 12; g.strokeText(str, 540, y); g.fillStyle = '#fff'; g.fillText(str, 540, y); } g.restore(); }
function draw(t) { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i][0]) k = i; const [t0, fn] = SHOTS[k]; g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.globalAlpha = 1; fn(t, t - t0); F.post(t);
  const nx = SHOTS[k + 1]?.[0]; const wp = (nx && nx - t < .16) ? (.16 - (nx - t)) / .16 : (t - t0 < .16 && k > 0) ? 1 - (t - t0) / .16 : 0; if (wp > 0 && [2, 5, 8].includes(k + (nx && nx - t < .16 ? 1 : 0))) F.smear(wp * 300);
  caption(t); endCard(t, t - (s(N - 1) - .1)); }
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H;
const r = (i, d = 0) => s(i) + d;
window.CUES = [['tick', 1.1], ['tick', 1.3], ['whoosh', S(2)], ['pop', r(4, .3)], ['pop', r(4, 1.6)], ['pop', r(6, .6)], ['pop', r(6, 1.0)], ['scribble', r(7, 1.4), r(7, 3.4)], ['whoosh', S(8)], ['chime', r(8, .4), 79], ['whoosh', S(10)], ['thud', r(10, .6)], ['thud', r(10, 1.4)],
  ['tick', r(11, .6)], ['tick', r(11, .8)], ['scribble', r(12, 2.6), r(12, 3.4)], ['thud', r(12, 4.5)], ['whoosh', S(14)], ['slide', r(14, 1)], ['whoosh', S(15)], ['tick', r(16, 2.3)], ['tick', r(16, 2.5)], ['chime', r(17, .3), 84]];
window.DUR = TOT;
window.seek = t => { draw(t); const kk = ss(TOT - .5, TOT, t) * .4; if (kk > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = kk; g.drawImage(F0, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { draw(1.6); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '900 120px Nunito'; g.textAlign = 'center'; g.lineJoin = 'round'; for (const [str, y] of [['NEW ROAD,', 1180], ['MORE TRAFFIC?', 1320]]) { g.strokeStyle = '#1a1412'; g.lineWidth = 18; g.strokeText(str, 540, y); g.fillStyle = '#fff'; g.fillText(str, 540, y); } g.restore(); };
draw(0); F0.getContext('2d').drawImage(g.canvas, 0, 0);
window.seek(0); window.ready = true; window.READY = true;
