// t_icecream.js v2: "Why do rival ice-cream carts end up side by side?" (Hotelling's law), template #30 story fable,
// grown from the owner's 10 s test (t_storytest.js) on the owner's fable.js. Red cart vs teal cart on every prop.
// Every cut, caption chunk and grade change is driven by the line timings in tl_icecream.js (af_heart).
import { createFable, PAL, W, H, seg, ss, eio, lerp, hash, clamp } from './styles/storyfable/fable.js';
await Promise.all(['900 50px Nunito', '800 50px Cinzel'].map(f => document.fonts.load(f)));
const F = createFable(document.getElementById('c')), g = F.g, X = () => F.ctx();
const TLV = window.TL, P = TLV.p, DUR = TLV.total, T = i => P[i].start, E = i => P[i].end, r = (i, d) => T(i) + d;
Object.assign(PAL, { sand: '#bba465', sandL: '#d8c793', sandD: '#957541', wood: '#94744e', woodL: '#a6865c', woodD: '#6b4f34' });   // v4: earthier wood   // v3: muted sand matched to the reference's ground bands
const FIG = 170 / 640, CART = 165 / 650, SIGN = 230 / 760, UMB = 210 / 300, SHORE = 6000, WHIP = .16;

// ---------- captions: 1-2 words, timed by character share of the line ----------
const CAPS = P.flatMap((p, i) => { const words = p.cap.replace(/\*\*/g, '').split(/\s+/).filter(Boolean), ws = [];
  for (let k = 0; k < words.length;) { const a = words[k], b = words[k + 1]; const two = b && a.length + b.length <= 10 && !/[.,?!:]$/.test(a); ws.push(two ? a + ' ' + b : a); k += two ? 2 : 1; }
  const tot = ws.join('').length; let acc = 0;
  return ws.map((w, j) => { const a = p.start + (p.end - p.start) * acc / tot; acc += w.length; const last = j === ws.length - 1;
    return { a: a - .04, b: last ? Math.min(p.end + .3, i + 1 < P.length ? P[i + 1].start - .05 : DUR) : p.start + (p.end - p.start) * acc / tot - .04, w }; }); });

// ---------- our two vendors (red: striped shirt, paper cap, moustache; teal: apron, sun visor, goatee) ----------
const RED = { robe: PAL.sideA, robeD: PAL.sideAD, robeL: PAL.sideAL, stripes: true, hat: 'paper', hatCol: PAL.sideA, stache: true, hold: 'none' };
const TEAL = { robe: PAL.sideB, robeD: PAL.sideBD, robeL: PAL.sideBL, apron: PAL.cream, hat: 'visor', hatCol: PAL.sideB, goatee: true, phase: .45, hold: 'none' };
const BATHER = { robe: '#e9b949', robeD: '#c58e2a', robeL: '#f4cf72', hat: 'bucket', hatCol: '#5b8fd6', phase: .2 };

// ---------- the beach set ----------
// umbrella colour by mode: 'mixed' (before the carts arrive) or a boundary X: red left of it, teal right of it
let UMODE = 'split', UBOUND = 0;
const MIXED = ['#e9b949', '#5b8fd6', '#e07aa0', '#8fbf5a'];
const uCol = (x, i) => UMODE === 'mixed' ? MIXED[i % 4] : (x < UBOUND ? PAL.sideA : PAL.sideB);
function headland(t) { const shore = F.proj(0, 0, SHORE).y, hor = F.cam().hor, px = -F.cam().x * .05;
  // v7: the far layer, like the reference's mountains / castle hills: blue-grey peaks with snow, green coastal hills with tree clumps, a cliff lighthouse
  F.layer(g => { const qx = px * .6;
    g.fillStyle = '#aebdd2'; g.beginPath(); g.moveTo(-100, hor + 2); [[-40, 230], [120, 120], [260, 300], [430, 150], [560, 260], [720, 140], [880, 290], [1040, 170], [1200, 240]].forEach(([x, h], k) => { g.lineTo(x + qx - 60, hor - h * .35); g.lineTo(x + qx, hor - h); }); g.lineTo(1300, hor + 2); g.closePath(); g.fill();
    g.fillStyle = '#f4f6fa'; [[-40, 230], [260, 300], [560, 260], [880, 290], [1200, 240]].forEach(([x, h]) => { g.beginPath(); g.moveTo(x + qx, hor - h); g.lineTo(x + qx - 38, hor - h + 60); g.lineTo(x + qx - 12, hor - h + 46); g.lineTo(x + qx + 4, hor - h + 64); g.lineTo(x + qx + 30, hor - h + 52); g.closePath(); g.fill(); });
    g.fillStyle = '#8fb07c'; g.beginPath(); g.moveTo(-200, hor + 2); g.quadraticCurveTo(100 + qx, hor - 190, 420 + qx, hor - 90); g.quadraticCurveTo(560 + qx, hor - 50, 640 + qx, hor + 2); g.closePath(); g.fill();
    g.fillStyle = '#9dba86'; g.beginPath(); g.moveTo(560 + qx, hor + 2); g.quadraticCurveTo(860 + qx, hor - 170, 1300, hor - 110); g.lineTo(1300, hor + 2); g.closePath(); g.fill();
    for (let k = 0; k < 26; k++) { const x = hash(k * 3.7) * 1200 - 60 + qx, y = hor - 20 - hash(k * 5.1) * 90, rr = 10 + hash(k) * 12; if (y < hor - (x < 600 ? 150 : 120) * (1 - Math.abs((x - (x < 600 ? 160 : 900)) / 700))) continue; g.fillStyle = k % 2 ? '#5f8a52' : '#6f9a5c'; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.arc(x + rr * .8, y + 4, rr * .8, 0, Math.PI * 2); g.fill(); }
    // the cliff lighthouse on the right hill
    g.fillStyle = '#f2ebde'; g.fillRect(960 + qx, hor - 230, 26, 90); g.fillStyle = PAL.sideA; g.fillRect(960 + qx, hor - 210, 26, 12); g.fillRect(960 + qx, hor - 180, 26, 12); g.fillStyle = '#fff4c8'; g.fillRect(962 + qx, hor - 244, 22, 14); g.fillStyle = PAL.sideAD; g.beginPath(); g.moveTo(956 + qx, hor - 244); g.lineTo(973 + qx, hor - 262); g.lineTo(990 + qx, hor - 244); g.fill();
    // far little clouds, hazed
    g.globalAlpha = .75; F.cloud(260 + qx, hor - 300, .32, 21); F.cloud(760 + qx, hor - 340, .26, 33); F.cloud(1000 + qx, hor - 260, .22, 41); g.globalAlpha = 1;
  }, 'blur(1.5px)');
  g.fillStyle = F.vgrad(hor - 320, hor + 10, [[0, 'rgba(236,230,214,0)'], [1, 'rgba(236,230,214,.35)']]); g.fillRect(0, hor - 320, W, 330);
  F.layer(g => {
  g.fillStyle = '#a9bfae'; g.beginPath(); g.moveTo(-200 + px, hor + 2); g.quadraticCurveTo(80 + px, hor - 90, 360 + px, hor - 30); g.quadraticCurveTo(440 + px, hor - 20, 520 + px, hor + 2); g.fill();
  g.fillStyle = '#93ad98'; g.beginPath(); g.moveTo(-200 + px, hor + 2); g.quadraticCurveTo(0 + px, hor - 50, 180 + px, hor - 20); g.lineTo(260 + px, hor + 2); g.fill();
  g.fillStyle = '#bccbbd'; g.beginPath(); g.moveTo(640 + px, hor + 2); g.quadraticCurveTo(860 + px, hor - 70, 1300 + px, hor - 40); g.lineTo(1300, hor + 2); g.fill();
  // the seaside town on the headland: houses with red / teal roofs, a church spire, a lighthouse
  for (let i = 0; i < 9; i++) { const x = 40 + i * 34 + px, y = hor - 44 - (i % 3) * 8; g.fillStyle = '#f2ebde'; g.fillRect(x, y, 28, 30); g.fillStyle = i % 2 ? PAL.sideA : PAL.sideB; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 14, y - 13); g.lineTo(x + 31, y); g.fill(); g.fillStyle = 'rgba(60,50,60,.4)'; g.fillRect(x + 9, y + 10, 8, 9); }
  g.fillStyle = '#efe6d6'; g.fillRect(200 + px, hor - 96, 18, 50); g.beginPath(); g.moveTo(196 + px, hor - 96); g.lineTo(209 + px, hor - 128); g.lineTo(222 + px, hor - 96); g.fill();
  g.fillStyle = '#f2ebde'; g.fillRect(900 + px, hor - 120, 20, 70); g.fillStyle = PAL.sideA; g.fillRect(900 + px, hor - 104, 20, 10); g.fillRect(900 + px, hor - 80, 20, 10); g.fillStyle = '#fff4c8'; g.fillRect(902 + px, hor - 130, 16, 10);
  }, 'blur(2px)');
  // sea between the horizon and the shoreline, with glints, sailboats and a pier
  g.fillStyle = F.vgrad(hor, shore, [[0, PAL.seaD], [.6, PAL.sea], [1, '#6fc0cf']]); g.fillRect(0, hor, W, shore - hor + 2);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; for (let i = 0; i < 34; i++) { const y = lerp(hor + 6, shore - 4, hash(i * 2.3)), x = hash(i) * W + Math.sin(t * 1.3 + i) * 12, l = 14 + (y - hor) * .6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
  [[-900, 9000, PAL.sideA], [700, 12000, PAL.sideB], [1800, 15000, '#f2ebde']].forEach(([bx, bz, col], i) => { const p = F.proj(bx + Math.sin(t * .2 + i) * 40, 0, bz); if (p.dz < 50) return; const s = p.s; g.save(); g.translate(p.x, p.y); g.scale(s, s);
    g.fillStyle = '#f2ebde'; g.strokeStyle = 'rgba(43,36,34,.5)'; g.lineWidth = 6; g.beginPath(); g.moveTo(-160, -20); g.lineTo(160, -20); g.lineTo(120, 30); g.lineTo(-120, 30); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = col; g.beginPath(); g.moveTo(0, -30); g.lineTo(0, -380); g.lineTo(150, -40); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff6e2'; g.beginPath(); g.moveTo(-10, -60); g.lineTo(-10, -300); g.lineTo(-120, -60); g.closePath(); g.fill(); g.stroke(); g.restore(); });
  // the pier on the right: deck and posts running out to sea
  const pierX = 1700; for (let z = SHORE - 300; z < SHORE + 4200; z += 260) { const a = F.proj(pierX, 0, z), b = F.proj(pierX, 110, z); if (a.dz < 60) continue; g.strokeStyle = PAL.woodD; g.lineWidth = Math.max(1.5, 14 * a.s); g.beginPath(); g.moveTo(a.x, a.y + 10 * a.s); g.lineTo(b.x, b.y); g.stroke(); }
  { const a = F.proj(pierX - 120, 110, SHORE - 300), b = F.proj(pierX + 120, 110, SHORE - 300), c = F.proj(pierX + 120, 110, SHORE + 4200), d = F.proj(pierX - 120, 110, SHORE + 4200);
    g.fillStyle = PAL.woodL; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill(); g.strokeStyle = PAL.woodD; g.lineWidth = 3; g.stroke(); }
}
function beach(t, o = {}) {
  const shore = F.proj(0, 0, SHORE).y;
  g.fillStyle = F.vgrad(shore, H, [[0, PAL.sandL], [.14, PAL.sand], [.6, '#b39a5c'], [1, '#8f7343']]); g.fillRect(0, shore, W, H - shore);
  // wet sand + foam line at the water's edge
  g.fillStyle = 'rgba(150,120,80,.35)'; g.fillRect(0, shore, W, 10); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(0, shore, W, 3 + Math.sin(t * 2) * 1.5);
  F.horizonHaze(.92);
  // pebbles, shell bits and dimples in perspective
  for (let i = 0; i < 700; i++) { const Xw = (hash(i * 1.31) - .5) * 3000, Z = F.cam().z + 40 + Math.pow(hash(i * 2.17), 1.7) * 3000, q = F.proj(Xw, 0, Z); if (q.dz < 30 || q.x < -20 || q.x > W + 20 || q.y > H + 10 || q.y < shore) continue;
    const rr = Math.min(9, (3 + hash(i * 5.7) * 5) * q.s), kind = i % 4; g.fillStyle = kind === 0 ? '#f1dcae' : kind === 1 ? '#a8803f' : kind === 2 ? 'rgba(140,100,50,.45)' : '#cfa665';
    g.beginPath(); g.ellipse(q.x, q.y, rr * 1.6, rr * .7, 0, 0, Math.PI * 2); g.fill(); if (kind === 1) { g.fillStyle = 'rgba(255,240,205,.8)'; g.beginPath(); g.ellipse(q.x - rr * .4, q.y - rr * .2, rr * .6, rr * .25, 0, 0, Math.PI * 2); g.fill(); } }
  for (let i = 0; i < 260; i++) { const v = hash(i * 1.7), y = shore + Math.pow(v, 1.8) * (H - shore), x = hash(i * 3.3) * W, s = 1 + (y - shore) / 260; if (i % 3) { g.fillStyle = 'rgba(120,85,40,.18)'; g.fillRect(x, y, 5 * s, 2 * s); } }
  for (let z = F.cam().z + 80; z < SHORE; z *= 1.09) { const a = F.proj(-3000, 0, z), b = F.proj(3000, 0, z), w = Math.sin(z * .013);
    g.strokeStyle = 'rgba(190,150,90,.28)'; g.lineWidth = Math.max(1, 900 / (z - F.cam().z + 1)); g.beginPath(); g.moveTo(a.x, a.y); for (let i = 1; i <= 12; i++) { const u = i / 12; g.lineTo(lerp(a.x, b.x, u), a.y + Math.sin(u * 14 + w * 3) * g.lineWidth * 1.4); } g.stroke(); z += 40; }
  // cart-wheel ruts and sea-grass verges along the boardwalk, flowers in perspective
  for (const rx of [-150, -105, 105, 150]) F.groundQuad(rx - 7, F.cam().z + 40, rx + 7, SHORE - 300, 'rgba(110,85,45,.28)');
  for (const side of [-1, 1]) { F.groundQuad(side > 0 ? 44 : -95, F.cam().z + 40, side > 0 ? 95 : -44, SHORE - 300, 'rgba(120,150,70,.55)'); F.groundQuad(side > 0 ? 190 : -330, F.cam().z + 40, side > 0 ? 330 : -190, SHORE - 300, 'rgba(120,150,70,.35)'); }
  for (let i = 0; i < 160; i++) { const side = i % 2 ? 1 : -1, Xw = side * (50 + hash(i * 3.3) * 280), Z = F.cam().z + 60 + Math.pow(hash(i * 1.9), 1.5) * 3200, q = F.proj(Xw, 0, Z); if (q.dz < 40 || q.y > H + 20 || q.x < -30 || q.x > W + 30) continue;
    const s2 = q.s, hz = F.hazeK(q.dz); g.globalAlpha = 1 - hz * .7; if (i % 3) { g.strokeStyle = i % 2 ? PAL.leafD : '#8fb35e'; g.lineWidth = Math.max(1, 3 * s2); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(q.x + (k - 1.5) * 4 * s2, q.y); g.quadraticCurveTo(q.x + (k - 1.5) * 8 * s2, q.y - 20 * s2, q.x + (k - 1.5) * 14 * s2, q.y - (34 + k * 6) * s2); g.stroke(); } }
    else { g.fillStyle = ['#e85a6a', '#f2c84a', '#fff4e0', '#b36ad6'][i % 4]; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(q.x + Math.cos(k * 1.26) * 5 * s2, q.y - 22 * s2 + Math.sin(k * 1.26) * 5 * s2, 3.6 * s2, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#7a4a20'; g.beginPath(); g.arc(q.x, q.y - 22 * s2, 2.4 * s2, 0, Math.PI * 2); g.fill(); g.strokeStyle = PAL.leafD; g.lineWidth = Math.max(1, 2 * s2); g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x, q.y - 18 * s2); g.stroke(); } }
  g.globalAlpha = 1;
  // the boardwalk down the middle (the reference's track to the vanishing point)
  const z0 = F.cam().z + 60; F.groundQuad(-27, z0, 27, SHORE - 200, PAL.woodD, .4);
  for (let z = Math.floor(z0 / 26) * 26; z < SHORE - 200; z += 26) { const k = hash(Math.floor(z / 26)); F.groundQuad(-27, z, 27, z + 22, k < .33 ? PAL.wood : k < .66 ? PAL.woodL : '#9f8358', .5); }
  F.groundQuad(-31, z0, -27, SHORE - 200, PAL.woodD, .6); F.groundQuad(27, z0, 31, SHORE - 200, PAL.woodD, .6);
  // bunting between the distance posts: red on the left, teal on the right
  for (let z = 400; z + 380 < SHORE - 400; z += 380) [-70, 70].forEach(x => { const a = F.proj(x, 150, z), b = F.proj(x, 150, z + 380); if (a.dz < 520) return;
    const col = x < 0 ? PAL.sideA : PAL.sideB, sag = 18 * a.s; g.strokeStyle = 'rgba(60,40,30,.7)'; g.lineWidth = Math.max(1, 2 * a.s);
    g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + sag, b.x, b.y); g.stroke();
    for (let k = 1; k < 7; k++) { const u = k / 7, px = lerp(a.x, b.x, u), py = lerp(a.y, b.y, u) + sag * u * (1 - u) * 2, sz = lerp(a.s, b.s, u) * 16;
      g.fillStyle = k % 2 ? col : PAL.cream; g.beginPath(); g.moveTo(px - sz, py); g.lineTo(px + sz, py); g.lineTo(px, py + sz * 2); g.closePath(); g.fill(); } });
  for (let z = 400; z < SHORE - 400; z += 380) [-70, 70].forEach(x => F.put(x, z, .25, () => { F.fs(F.rr(-16, -150, 32, 150, 6), PAL.woodL, 5); F.fs(F.rr(-16, -150, 32, 40, 6), x < 0 ? PAL.sideA : PAL.sideB, 5); }));
  // beach huts along the back of the beach, two-tone
  for (let i = 0; i < 14; i++) { const x = -2600 + i * 400 + (i > 6 ? 200 : 0), z = 4700 + hash(i) * 200; if (Math.abs(x) < 300) continue; F.put(x, z, .9, () => hut(i)); }
  // lifeguard tower and dune grass at the edges
  F.put(1150, 3000, 1, () => tower(t)); F.put(-1250, 3300, 1, () => tower(t, true));
  for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1, x = side * (1500 + hash(i * 3.7) * 900), z = 900 + hash(i * 5.1) * 3600; F.put(x, z, .7 + hash(i) * .5, () => tuft(i + 60)); }
  // the beachgoers: umbrellas with towels and sunbathers
  if (o.umbrellas !== false) for (let rI = 0; rI < 12; rI++) for (let c = 0; c < 4; c++) { const z = 700 + rI * 330 + hash(rI * 7 + c) * 120, xo = 360 + c * 280 + hash(rI + c * 13) * 80, i = rI * 4 + c;
    F.put(-xo, z, UMB, () => F.umbrella(uCol(-xo, i), hash(rI + c))); F.put(xo, z + 60, UMB, () => F.umbrella(uCol(xo, i + 1), hash(rI * 3 + c))); }
  for (let i = 0; i < 70; i++) { const side = i % 2 ? 1 : -1, x = side * (130 + hash(i * 4.1) * 1100), z = 140 + Math.pow(hash(i * 2.7), 1.6) * 3200;
    F.put(x, z, i % 5 ? .45 : .22, () => (i % 5 ? tuft(i) : shell(i))); }
  [[-1500, 4200], [-1250, 5200], [1450, 4500], [1300, 5400], [-2100, 4800], [2000, 5000]].forEach(([x, z], i) => F.put(x, z, 1.4, () => palm(t, i)));
}
function hut(i) { const c = X(), col = i % 2 ? PAL.sideA : PAL.sideB; const body = F.rr(-110, -240, 220, 240, 6); F.fs(body, PAL.cream, 6);
  c.save(); c.beginPath(); body(); c.clip(); c.fillStyle = col; for (let x = -110; x < 110; x += 44) c.fillRect(x, -240, 22, 240); c.restore(); F.shade(body, 'rgba(0,0,0,.16)', 22, 0); F.fs(body, null, 6);
  F.fs(F.poly([[-130, -236], [130, -236], [0, -330]]), col === PAL.sideA ? PAL.sideAD : PAL.sideBD, 6); F.fs(F.rr(-36, -150, 72, 150, 4), PAL.woodD, 5); }
function tower(t, flip) { F.line([[-70, 0], [-50, -300]], 10, PAL.woodD); F.line([[70, 0], [50, -300]], 10, PAL.woodD); F.line([[-62, -120], [62, -200]], 7, PAL.woodD); F.line([[62, -120], [-62, -200]], 7, PAL.woodD);
  const cab = F.rr(-90, -440, 180, 140, 8); F.fs(cab, PAL.cream, 6); F.fs(F.rr(-90, -440, 180, 30, 6), PAL.sideA, 5); F.fs(F.poly([[-110, -440], [110, -440], [0, -500]]), PAL.sideAD, 6);
  const c = X(); c.save(); c.translate(flip ? -40 : 40, -300); c.rotate(.1 * Math.sin(t * 1.5)); F.line([[0, 0], [0, -260]], 6, PAL.ink); F.fs(F.poly([[0, -260], [110, -235], [0, -210]]), PAL.sideA, 4); c.restore(); }
function tuft(i) { const c = X(); for (let k = 0; k < 7; k++) { const a = -1.9 + k * .13 + (hash(i + k) - .5) * .2, l = 90 + hash(i * 3 + k) * 110;
  c.strokeStyle = k % 2 ? PAL.leafD : '#8fb35e'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(k * 6 - 20, 0); c.quadraticCurveTo(Math.cos(a) * l * .4, -l * .6, Math.cos(a) * l, Math.sin(a) * l); c.stroke(); } }
function shell(i) { F.fs(F.ell(0, -10, 34, 20), i % 2 ? '#f6dccb' : '#fbeee0', 4); for (let k = -2; k <= 2; k++) F.line([[0, 6], [k * 12, -24]], 3, 'rgba(120,80,60,.5)'); }
function bucket(col) { const c = X(), b = F.poly([[-70, -150], [70, -150], [52, 0], [-52, 0]]); F.fs(b, col, 6); F.shade(b, 'rgba(0,0,0,.18)', 20, 0); F.fs(b, null, 6);
  F.fs(F.ell(0, -150, 70, 16), 'rgba(0,0,0,.25)', 6); c.beginPath(); c.ellipse(0, -150, 76, 70, 0, Math.PI, 0); c.lineWidth = 6; c.strokeStyle = PAL.ink; c.stroke();
  c.save(); c.translate(60, -160); c.rotate(.5); F.fs(F.rr(-6, -170, 12, 150, 5), PAL.woodL, 5); F.fs(F.poly([[-30, -20], [30, -20], [22, 40], [-22, 40]]), PAL.gold, 5); c.restore(); }
function ball() { const c = X(), b = F.ell(0, -60, 60, 60); F.fs(b, PAL.cream, 6); c.save(); c.beginPath(); b(); c.clip(); [PAL.sideA, PAL.gold, PAL.sideB].forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, -60); c.arc(0, -60, 70, k * 2.1, k * 2.1 + 1); c.closePath(); c.fill(); }); c.restore(); F.shade(b, 'rgba(0,0,0,.15)', 16, 12); F.fs(b, null, 6); F.fs(F.ell(-20, -82, 12, 8), 'rgba(255,255,255,.8)', 0); }
function palm(t, i) { const c = X(); c.strokeStyle = PAL.woodD; c.lineWidth = 30; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(30, -220, 100, -420); c.stroke();
  for (let k = 0; k < 7; k++) { const a = -2.9 + k * .5 + Math.sin(t * 1.5 + k + i) * .04; c.fillStyle = k % 2 ? PAL.leafD : PAL.leaf;
    c.beginPath(); c.moveTo(100, -420); c.quadraticCurveTo(100 + Math.cos(a - .3) * 140, -420 + Math.sin(a - .3) * 140, 100 + Math.cos(a) * 250, -420 + Math.sin(a) * 250 + 50); c.quadraticCurveTo(100 + Math.cos(a + .3) * 120, -420 + Math.sin(a + .3) * 120, 100, -420); c.fill(); } }
function foreground(side = 1, bucketToo = true) { const cx = F.cam().x, cz = F.cam().z; F.put(cx + side * 150, cz + 300, .5, () => tuft(31)); F.put(cx - side * 165, cz + 330, .55, () => tuft(47)); if (bucketToo) F.put(cx - side * 120, cz + 280, .35, () => bucket(PAL.gold)); }
function set(t, o) { F.sky(t); headland(t); beach(t, o); }

// ---------- camera ----------
function keys(t, K) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) { const [ta, A] = K[i], [tb, B] = K[i + 1];
  if (t <= tb) { const u = eio((t - ta) / (tb - ta)), o = {}; for (const k in A) o[k] = lerp(A[k], B[k] ?? A[k], u); return o; } } return K[K.length - 1][1]; }
const CAM0 = { x: 0, z: 0, y: 135, hor: 760, focus: 400, dof: 3, f: 1100 };
const cam = (t, K) => F.setCam(keys(t, K.map(([tt, c]) => [tt, { ...CAM0, ...c }])));
const fig = (x, z, o) => F.put(x, z, FIG, () => F.figure(o), { rim: true, shadow: true });
const cart = (x, z, side, o = {}) => F.put(x, z, CART, () => F.cart({ col: side ? PAL.sideB : PAL.sideA, colD: side ? PAL.sideBD : PAL.sideAD, ...o }), { rim: true, shadow: true });
const sign = (x, z, size, value, o = {}) => F.put(x, z, SIGN * size, () => F.counterSign({ title: 'DISTANCE APART', value, ...o }), { sharp: true });
function priceTag(x, z, side) { F.put(x, z, .3, () => { F.line([[0, 0], [0, -330]], 10, PAL.woodD); F.fs(F.rr(-110, -470, 220, 140, 14), PAL.cream, 6); F.fs(F.rr(-110, -470, 220, 34, 10), side ? PAL.sideB : PAL.sideA, 5); F.text('$3', 0, -385, { size: 74, col: PAL.ink, font: 'Cinzel', weight: 900 }); }, { sharp: true, rim: true }); }

// ---------- the overhead (painted plan view of the beach; the beach runs top to bottom, the sea on the left) ----------
// v4: a painted overhead like the reference's field: textured sand, foam, dune grass, dense small umbrellas, and the crowds
// as red / teal formations streaming toward their cart (arrow-shaped, like the reference's armies), glints, tilt-shift blur.
const AUMB = Array.from({ length: 150 }, (_, i) => ({ u: hash(i * 1.37) * 1.1 - .05, x: 430 + hash(i * 2.91) * 430, i, r: 13 + hash(i * 5.1) * 7 }));
const CROWD = Array.from({ length: 520 }, (_, i) => ({ u: hash(i * 3.17), x: 420 + hash(i * 4.33) * 460, i }));
let OVER = null;
function overhead(t, o = {}) { const zm = o.zoom || 1, rot = o.rot || 0, by = 160, ey = 1760, yAt = u => lerp(by, ey, u);
  g.save(); g.translate(540, 940); g.rotate(rot); g.scale(zm, zm); g.translate(-540, -940);
  // sea: depth bands, wave crests, foam lace at the shore
  g.fillStyle = F.vgrad(0, H, [[0, '#2f7fa8'], [1, '#3a8fb6']]); g.fillRect(-400, -300, 780, 2600);
  const sg = g.createLinearGradient(160, 0, 400, 0); sg.addColorStop(0, 'rgba(76,159,196,0)'); sg.addColorStop(1, '#7fcfd2'); g.fillStyle = sg; g.fillRect(160, -300, 240, 2600);
  for (let j = 0; j < 10; j++) { g.strokeStyle = `rgba(255,255,255,${.18 + .12 * (j % 3)})`; g.lineWidth = 3 + (j % 2) * 2; g.beginPath(); for (let y = -300; y < 2300; y += 18) g.lineTo(-20 + j * 40 + 10 * Math.sin(y * .011 + t * 1.2 + j * 1.7) + 4 * Math.sin(y * .05 + j), y); g.stroke(); }
  for (let i = 0; i < 90; i++) { const y = -300 + hash(i * 7.1) * 2600, x = 20 + hash(i * 3.3) * 330, tw = .5 + .5 * Math.sin(t * 3 + i); g.fillStyle = `rgba(255,255,240,${.5 * tw})`; g.fillRect(x, y, 10, 2); }
  // sand: base gradient, wet edge, foam lace, ripples, speckle
  g.fillStyle = F.vgrad(-300, 2300, [[0, '#cdb882'], [1, '#c2aa70']]); g.fillRect(380, -300, 640, 2600);
  g.fillStyle = 'rgba(140,115,70,.45)'; g.fillRect(380, -300, 34, 2600);
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 6; g.beginPath(); for (let y = -300; y < 2300; y += 14) g.lineTo(382 + 7 * Math.sin(y * .03 + t * 2) + 3 * Math.sin(y * .11), y); g.stroke();
  g.strokeStyle = 'rgba(150,120,70,.22)'; g.lineWidth = 3; for (let j = 0; j < 70; j++) { const y0 = -300 + j * 38; g.beginPath(); for (let x = 420; x < 1000; x += 20) g.lineTo(x, y0 + 6 * Math.sin(x * .03 + j)); g.stroke(); }
  if (!OVER) { OVER = document.createElement('canvas'); OVER.width = 700; OVER.height = 2600; const c = OVER.getContext('2d'); for (let i = 0; i < 9000; i++) { const k = hash(i * .73); c.fillStyle = k < .4 ? 'rgba(120,90,50,.28)' : k < .75 ? 'rgba(255,245,215,.5)' : 'rgba(90,70,40,.35)'; c.fillRect(hash(i * 1.9) * 700, hash(i * 2.3) * 2600, 2 + k * 3, 2); } }
  g.drawImage(OVER, 380, -300);
  // dunes and grass on the right, a dirt path
  g.fillStyle = F.vgrad(-300, 2300, [[0, '#a99a5c'], [1, '#9c8e55']]); g.fillRect(900, -300, 600, 2600);
  for (let i = 0; i < 260; i++) { const x = 890 + hash(i * 5.3) * 230, y = -300 + hash(i * 7.7) * 2600, l = 14 + hash(i) * 18; g.strokeStyle = i % 3 ? PAL.leafD : '#8fb35e'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y - l); g.moveTo(x, y); g.lineTo(x - 6, y - l * .8); g.stroke(); }
  // boardwalk across the middle of the beach
  g.fillStyle = '#6e5236'; g.fillRect(380, yAt(.5) - 20, 540, 40); for (let x = 382; x < 918; x += 16) { g.fillStyle = hash(x) < .5 ? '#9a7a52' : '#a8875c'; g.fillRect(x, yAt(.5) - 17, 13, 34); }
  // the crowd: each beachgoer a tiny head + towel; coloured by the cart they walk to, streaming in formation toward it
  const R = o.red ?? .25, Tq = o.teal ?? .75, mid = (R + Tq) / 2, zk = o.zones || 0;
  AUMB.forEach(a => { const y = yAt(a.u), side = a.u < mid, col = zk > .5 ? (side ? PAL.sideA : PAL.sideB) : MIXED[a.i % 4], rr = a.r;
    g.fillStyle = 'rgba(60,40,20,.28)'; g.beginPath(); g.ellipse(a.x + 8, y + 9, rr, rr * .85, 0, 0, Math.PI * 2); g.fill();
    for (let j = 0; j < 6; j++) { g.fillStyle = j % 2 ? '#fbf3e2' : col; g.beginPath(); g.moveTo(a.x, y); g.arc(a.x, y, rr, j * Math.PI / 3 + a.i, (j + 1) * Math.PI / 3 + a.i); g.closePath(); g.fill(); }
    g.lineWidth = 2.5; g.strokeStyle = 'rgba(43,36,34,.85)'; g.beginPath(); g.arc(a.x, y, rr, 0, Math.PI * 2); g.stroke(); });
  CROWD.forEach(c => { const y0 = yAt(c.u), side = c.u < mid, tgt = side ? yAt(R) : yAt(Tq), walk = o.walk ? clamp((t - (o.walkT || 0)) * .35 - hash(c.i) * .5) : 0;
    // walkers move into a tight arrow-shaped column that points at their cart
    const lane = (hash(c.i * 9.1) - .5), ty = lerp(y0, tgt + Math.sign(y0 - tgt) * (40 + Math.abs(lane) * 220), walk * .8), tx = lerp(c.x, 760 + lane * 120 * (1 - walk * .5), walk * .8);
    const col = zk > .5 ? (side ? PAL.sideA : PAL.sideB) : '#f4f0e8'; g.fillStyle = col; g.beginPath(); g.arc(tx, ty, 5.5, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(43,36,34,.8)'; g.lineWidth = 1.6; g.stroke(); });
  if (zk > 0) { g.save(); g.globalAlpha = zk; g.setLineDash([22, 14]); g.lineWidth = 7; g.strokeStyle = PAL.cream; g.beginPath(); g.moveTo(400, yAt(mid)); g.lineTo(890, yAt(mid)); g.stroke(); g.restore(); }
  // the carts from above: striped umbrellas, a soft shadow, a name board; a glint on each
  const cartTop = (u, col, colD, k, label) => { if (k <= 0) return; const y = yAt(u), x = 760, s2 = lerp(2.4, 1, eio(k)); g.save(); g.globalAlpha = clamp(k * 3); g.translate(x, y); g.scale(s2, s2);
    g.fillStyle = 'rgba(40,30,20,.35)'; g.beginPath(); g.ellipse(20, 24, 66, 60, 0, 0, Math.PI * 2); g.fill();
    for (let j = 0; j < 8; j++) { g.fillStyle = j % 2 ? PAL.cream : col; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 62, j * Math.PI / 4 + t * .15, (j + 1) * Math.PI / 4 + t * .15); g.closePath(); g.fill(); }
    const gl = g.createRadialGradient(-20, -24, 2, 0, 0, 62); gl.addColorStop(0, 'rgba(255,255,255,.45)'); gl.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.fill();
    g.lineWidth = 6; g.strokeStyle = PAL.ink; g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.stroke(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill();
    if (label) { F.fs(F.rr(80, -40, 116, 80, 14), PAL.cream, 6); F.text(label, 138, 2, { size: 52, col: colD, font: 'Nunito', weight: 900 }); }
    g.restore(); F.glow(x - 18, y - 24, 70, 'rgba(255,255,255,.9)', .35 * k * (.6 + .4 * Math.sin(t * 5 + u * 9))); };
  cartTop(R, PAL.sideA, PAL.sideAD, o.redK ?? 1, o.redL); cartTop(Tq, PAL.sideB, PAL.sideBD, o.tealK ?? 1, o.tealL);
  if (o.sign) { g.save(); g.translate(600, 330); F.fs(F.rr(-200, -60, 400, 120, 18), PAL.wood, 7); F.fs(F.rr(-180, -44, 180, 88, 10), PAL.sideA, 5); F.fs(F.rr(0, -44, 180, 88, 10), PAL.sideB, 5); F.text('½', -90, 2, { size: 72, col: PAL.cream, stroke: 8 }); F.text('½', 90, 2, { size: 72, col: PAL.cream, stroke: 8 }); g.restore(); }
  g.restore();
  // tilt-shift: blur the top and bottom of the frame (the reference's drone shot), haze at the top
  const snap = g.getImageData(0, 0, W, H); F.layer(c => { c.putImageData(snap, 0, 0); }, 'blur(7px)');
  // put the sharp middle band back over the blurred frame
  g.save(); F.layer(c => { c.putImageData(snap, 0, 0); c.globalCompositeOperation = 'destination-in'; const m = c.createLinearGradient(0, 0, 0, H); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.22, 'rgba(0,0,0,1)'); m.addColorStop(.74, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = m; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }, 'none'); g.restore();
  g.fillStyle = F.vgrad(0, 520, [[0, 'rgba(236,230,214,.6)'], [1, 'rgba(236,230,214,0)']]); g.fillRect(0, 0, W, 520); }

// ---------- props as full-frame shots ----------
function paperShot(t) { // the 1929 journal lying on a striped towel, seen from above at an angle; a stamp slams down
  const k = t - r(1, 2.6); g.fillStyle = PAL.gold; g.fillRect(0, 0, W, H); g.save(); g.translate(540, 960); g.rotate(-.35); for (let x = -1400; x < 1400; x += 180) { g.fillStyle = PAL.cream; g.fillRect(x, -1400, 70, 2800); } g.restore();
  g.save(); g.translate(540, 900); const s = 1.04 + .03 * k; g.scale(s, s); g.rotate(-.07);
  g.fillStyle = 'rgba(60,40,20,.35)'; g.filter = 'blur(10px)'; g.fillRect(-340, -450, 720, 950); g.filter = 'none';
  F.fs(F.rr(-370, -480, 720, 950, 8), '#f6eed8', 7); F.shade(F.rr(-370, -480, 720, 950, 8), 'rgba(160,130,90,.25)', 24, 18); F.fs(F.rr(-370, -480, 720, 950, 8), null, 7);
  F.text('THE ECONOMIC JOURNAL', -10, -400, { size: 34, col: PAL.ink, font: 'Cinzel', weight: 800 }); F.line([[-300, -360], [280, -360]], 4);
  F.text('STABILITY IN', -10, -270, { size: 68, col: PAL.ink, font: 'Cinzel', weight: 900 }); F.text('COMPETITION', -10, -190, { size: 68, col: PAL.ink, font: 'Cinzel', weight: 900 }); F.text('HAROLD HOTELLING', -10, -110, { size: 36, col: PAL.woodD, font: 'Cinzel', weight: 800 });
  for (let i = 0; i < 8; i++) F.line([[-300, -30 + i * 44], [290 - (i % 3) * 70, -30 + i * 44]], 5, 'rgba(43,36,34,.3)');
  // a little line diagram on the page: two marks on a line
  F.line([[-260, 330], [260, 330]], 6); [[-130, PAL.sideA], [130, PAL.sideB]].forEach(([x, col]) => F.fs(F.poly([[x, 320], [x - 20, 280], [x + 20, 280]]), col, 4));
  const sk = ss(seg(t, r(1, 3.3), r(1, 3.6))); if (sk > 0) { g.save(); g.translate(170, 160); g.rotate(-.18); const sc = lerp(2.2, 1, sk); g.scale(sc, sc); g.globalAlpha = clamp(sk * 2);
    g.lineWidth = 10; g.strokeStyle = '#c0392b'; g.beginPath(); g.roundRect(-150, -70, 300, 140, 16); g.stroke(); F.text('1929', 0, 6, { size: 104, col: '#c0392b', font: 'Cinzel', weight: 900 }); g.restore(); }
  g.restore();
  F.glow(860, 260, 380, 'rgba(255,240,200,.8)', .5); }
function blueprintShot(t) { // the law on a blueprint on a desk at an angle; a glowing pen draws it, labels pop, a red stamp slams
  const k = t - T(11); g.fillStyle = '#3a2a22'; g.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#4a3428' : '#432f25'; g.fillRect(0, i * 170, W, 170); }
  g.save(); g.translate(495, 940); const s = (1 + .02 * k) * .86; g.scale(s, s); g.transform(1, 0, -.12, .92, 0, 0);
  g.fillStyle = 'rgba(0,0,0,.4)'; g.filter = 'blur(14px)'; g.fillRect(-440, -700, 900, 1400); g.filter = 'none';
  g.fillStyle = '#1f4f9a'; g.fillRect(-460, -720, 920, 1400); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; for (let x = -460; x <= 460; x += 46) { g.beginPath(); g.moveTo(x, -720); g.lineTo(x, 680); g.stroke(); } for (let y = -720; y <= 680; y += 46) { g.beginPath(); g.moveTo(-460, y); g.lineTo(460, y); g.stroke(); }
  g.strokeStyle = '#eaf2ff'; g.lineWidth = 5; g.strokeRect(-430, -690, 860, 1340);
  const tw = ss(seg(k, .2, 1.4)); g.save(); g.beginPath(); g.rect(-430, -650, 860 * tw, 220); g.clip(); F.text("HOTELLING'S LAW", 0, -560, { size: 74, col: '#eaf2ff', font: 'Cinzel', weight: 900 }); g.restore();
  const lk = ss(seg(k, 1.0, 2.2)); g.strokeStyle = '#eaf2ff'; g.lineWidth = 7; g.beginPath(); g.moveTo(-360, -260); g.lineTo(-360 + 720 * lk, -260); g.stroke();
  for (let i = 0; i <= 4; i++) if (i / 4 <= lk) { g.beginPath(); g.moveTo(-360 + i * 180, -280); g.lineTo(-360 + i * 180, -240); g.stroke(); }
  if (lk >= 1) { F.text('BEACH', 0, -200, { size: 34, col: '#eaf2ff', font: 'Cinzel', weight: 800 }); const mv = ss(seg(k, 2.2, 4.0)), xr = lerp(-180, -22, mv), xt = lerp(180, 22, mv);
    [[xr, PAL.sideA], [xt, PAL.sideB]].forEach(([x, col]) => F.fs(F.poly([[x, -272], [x - 26, -330], [x + 26, -330]]), col, 5)); }
  const pop = (x, y, k2, fn) => { if (k2 <= 0) return; g.save(); g.translate(x, y); const e = clamp(k2 * 3) * (1 + .2 * Math.sin(clamp(k2) * Math.PI)); g.scale(e, e); fn(); g.restore(); };
  const shop = (col, colD) => { F.fs(F.rr(-80, -100, 160, 140, 6), 'rgba(234,242,255,.15)', 5); F.fs(F.poly([[-96, -100], [96, -100], [80, -150], [-80, -150]]), col, 5); F.fs(F.rr(-24, -50, 48, 90, 4), null, 4); };
  const pod = col => { F.fs(F.poly([[-56, 40], [56, 40], [44, -80], [-44, -80]]), col, 5); F.fs(F.ell(0, -126, 32, 32), '#eaf2ff', 5); };
  const ks = k - 4.2, kp = k - 5.6; pop(-110, 60, ks / .5, () => shop(PAL.sideA)); pop(110, 60, (ks - .2) / .5, () => shop(PAL.sideB));
  F.text(ks > .3 ? 'SHOPS' : '', 0, 170, { size: 40, col: '#eaf2ff', font: 'Cinzel', weight: 800 });
  pop(-110, 380, kp / .5, () => pod(PAL.sideA)); pop(110, 380, (kp - .2) / .5, () => pod(PAL.sideB)); F.text(kp > .3 ? 'POLITICIANS' : '', 0, 500, { size: 40, col: '#eaf2ff', font: 'Cinzel', weight: 800 });
  // the red stamp
  const sk = ss(seg(k, 3.2, 3.45)); if (sk > 0) { g.save(); g.translate(250, -40); g.rotate(-.2); const sc = lerp(2.4, 1, sk); g.scale(sc, sc); g.globalAlpha = clamp(sk * 2); g.lineWidth = 10; g.strokeStyle = '#d0392b'; g.beginPath(); g.roundRect(-130, -60, 260, 120, 14); g.stroke(); F.text('STUCK', 0, 4, { size: 66, col: '#d0392b', font: 'Cinzel', weight: 900 }); g.restore(); }
  g.restore();
  // glowing pen tip while drawing, a candle glow at the top left, the pen blurred in the foreground
  if (lk > 0 && lk < 1) { const px = 495 + (-360 + 720 * lk) * s - (-260) * .12 * s, py = 940 + (-260) * .92 * s; F.glow(px, py, 90, 'rgba(255,255,255,1)', .9); }
  F.glow(120, 160, 420, 'rgba(255,200,120,.9)', .55); g.save(); g.filter = 'blur(8px)'; g.translate(900, 1560); g.rotate(-.7); g.fillStyle = PAL.woodD; g.fillRect(-20, -340, 40, 420); g.fillStyle = '#c8ccd2'; g.beginPath(); g.moveTo(-20, 80); g.lineTo(20, 80); g.lineTo(0, 150); g.fill(); g.restore(); }

// ---------- story timeline ----------
// cart X on the ground set: a quarter / three quarters along (the edges of the wide shot), then the creep to the boardwalk
const CW = 290;
function cartsAt(t) { if (t < T(5)) return [-CW, CW]; if (t < T(7)) return [-CW, lerp(CW, 200, ss(seg(t, T(5) + .5, T(6))))];
  if (t < T(8)) return [lerp(-CW, -150, ss(seg(t, T(7), r(7, 1.2)))), lerp(200, 120, ss(seg(t, r(7, 1.2), E(7))))];
  const u = ss(seg(t, T(8), r(8, 3.8))); return [lerp(-150, -47, u), lerp(120, 47, u)]; }
const vendorX = (x, side) => x + (Math.abs(x) > 200 ? (side ? -100 : 100) : (side ? 88 : -88));
function wideCarts(t, o = {}) { const [xr, xt] = o.at || cartsAt(t); cart(xr, 540, 0); cart(xt, 540, 1); queues(t, vendorX(xr, 0), vendorX(xt, 1), o);
  fig(vendorX(xr, 0) + (o.jigR || 0), 470, { ...RED, t, expr: o.exprR || 'glare', look: 1, turn: .4, armF: 70, bendF: 150, armB: 70, bendB: 150, ...o.red });
  fig(vendorX(xt, 1) - (o.jigT || 0), 470, { ...TEAL, t, expr: o.exprT || 'glare', look: 1, turn: .4, flip: true, armF: 70, bendF: 150, armB: 70, bendB: 150, ...o.teal }); }
// v6: each side's customers queue behind its vendor (the reference stacks each side's army right behind its king)
const QUEUE = Array.from({ length: 18 }, (_, i) => ({ dx: -10 + (i % 6) * 105 + hash(i * 3.1) * 30, z: 700 + Math.floor(i / 6) * 170 + hash(i * 1.7) * 60, look: hash(i * 5.3), cone: i % 3 === 0, ph: hash(i * 7.7) }));
function queues(t, xr, xt, o = {}) { if (o.queues === false) return;
  [[xr, 0], [xt, 1]].forEach(([cx, side]) => QUEUE.forEach((q, i) => { const x = cx + (side ? 1 : -1) * q.dx, near = i < 4, A = side ? PAL.sideB : PAL.sideA, AD = side ? PAL.sideBD : PAL.sideAD, AL = side ? PAL.sideBL : PAL.sideAL;
    const cos = { robe: i % 2 ? AL : PAL.cream, robeD: i % 2 ? A : '#e2d3b4', robeL: AL, hat: i % 3 === 1 ? 'bucket' : 'none', hatCol: A, stripes: i % 4 === 2, stache: i % 5 === 3, goatee: i % 5 === 1, phase: q.ph, t,
      expr: q.look < .5 ? 'neutral' : 'smug', look: side ? -1 : 1, turn: (side ? -1 : 1) * .3, flip: !!side, hold: q.cone ? 'cone' : 'none', armF: q.cone ? 40 : 75, bendF: q.cone ? -95 : 20 };
    F.put(x, q.z, FIG * .9, () => F.figure(cos), near ? { rim: true, shadow: true } : {}); })); }
const SH = [];
const shot = (a, b, fn) => SH.push({ a, b, fn });
// 0 hook: the sign (open prop) close, then the camera roams: wide on the carts side by side, push to red, across to teal
shot(0, T(1), t => { cam(t, [[0, { x: 0, z: 40, y: 160, hor: 760, focus: 430, dof: 6 }], [1.2, { x: 0, z: 90, y: 160, hor: 760, focus: 430, dof: 6 }], [2.0, { x: 0, z: 190, hor: 860, focus: 300, dof: 1.2, f: 940 }], [3.0, { x: -135, z: 295, hor: 780, focus: 175, dof: 6 }], [T(1) + WHIP, { x: 135, z: 305, hor: 780, focus: 165, dof: 6 }]]);
  UMODE = 'split'; UBOUND = 0; set(t); if (F.cam().z < 240) sign(0, 450, 1.05, '0 m'); wideCarts(t, { at: [-47, 47] }); foreground(-1, false); F.flush(); });
// 1 medium two-shot: they glare (heads turn), then the paper with the 1929 stamp
shot(T(1), r(1, 2.6), t => { cam(t, [[T(1) - WHIP, { x: -60, z: 60, hor: 830, focus: 410, dof: 5 }], [r(1, 1.3), { x: -30, z: 90, hor: 830, focus: 380, dof: 5 }], [r(1, 2.6), { x: 50, z: 100, hor: 830, focus: 370, dof: 5 }]]);
  set(t); const k = seg(t, r(1, .9), r(1, 1.4)); wideCarts(t, { at: [-47, 47], exprR: k > 0 ? 'glare' : 'sly', red: { turn: lerp(0, .5, k), talk: t < r(1, 1.2) ? Math.abs(Math.sin(t * 14)) : 0 } }); foreground(1); F.flush(); });
shot(r(1, 2.6), T(2), t => paperShot(t));
// 2 overhead: towels and umbrellas spread evenly along the beach
shot(T(2), T(3), t => overhead(t, { zoom: lerp(1.06, 1.14, seg(t, T(2), T(3))), rot: .02 * Math.sin(t * .4), redK: 0, tealK: 0 }));
// 3 wide down the beach: the two carts at the edges, same price; then overhead, they drop in at a quarter and three quarters
shot(T(3), r(3, 2.6), t => { cam(t, [[T(3), { x: 0, z: 120, hor: 860, focus: 520, dof: 1.2, f: 760 }], [r(3, 2.6), { x: 0, z: 180, hor: 860, focus: 520, dof: 1.2, f: 760 }]]); UMODE = 'mixed'; set(t);
  wideCarts(t, { exprR: 'smug', exprT: 'smug', red: { turn: 0, look: 0 }, teal: { turn: 0, look: 0 } }); priceTag(-CW + 70, 420, 0); priceTag(CW - 70, 420, 1); foreground(1); F.flush(); });
shot(r(3, 2.6), T(4), t => overhead(t, { zoom: 1.14, redK: ss(seg(t, r(3, 3.0), r(3, 3.6))), tealK: ss(seg(t, r(3, 4.6), r(3, 5.2))), redL: '¼', tealL: '¾' }));
// 4 overhead: everyone walks to the nearest cart: half and half
shot(T(4), T(5), t => overhead(t, { zoom: lerp(1.14, 1.02, seg(t, T(4), T(5))), zones: ss(seg(t, T(4), r(4, 1.2))), walk: true, walkT: T(4), sign: t > r(4, 2.4) }));
// 5 tracking shot: teal rolls toward the middle one morning
shot(T(5), T(6), t => { const [, xt] = cartsAt(t), push = seg(t, T(5) + .5, T(6)); cam(t, [[T(5) - WHIP, { x: xt + 40, z: 30, y: 128, hor: 760, focus: 175, dof: 8 }], [T(6), { x: xt + 60, z: 50, y: 128, hor: 760, focus: 155, dof: 8 }]]); F.cam().x = xt + 50; UMODE = 'split'; UBOUND = 0; set(t);
  F.put(xt - 105, 212, CART, () => F.cart({ col: PAL.sideB, colD: PAL.sideBD, handle: 'right', roll: -xt / 40 }), { rim: true, shadow: true });
  fig(xt, 200, { ...TEAL, t, flip: true, expr: 'sly', look: 1, turn: .35, armF: 35, bendF: 0, armB: 30, bendB: 0, reach: true, walk: push > 0 && push < 1 ? (CW - xt) / 30 : -1 });
  F.put(xt + 120, 110, .45, () => tuft(41)); F.put(xt - 200, 105, .45, () => tuft(52)); F.flush(); });
// 6 overhead: teal's half grows past the middle; then red, worried
shot(T(6), r(6, 2.6), t => overhead(t, { zoom: 1.04, zones: 1, red: .25, teal: lerp(.75, .6, ss(seg(t, T(6), r(6, 1.4)))) }));
shot(r(6, 2.6), T(7), t => { cam(t, [[r(6, 2.6), { x: vendorX(-CW, 0) - 25, z: 300, y: 128, hor: 780, focus: 170, dof: 7 }], [T(7) + WHIP, { x: vendorX(-CW, 0) - 10, z: 315, y: 128, hor: 780, focus: 155, dof: 7 }]]); UBOUND = 60; set(t);
  cart(-CW, 540, 0); fig(vendorX(-CW, 0), 470, { ...RED, t, expr: 'worried', look: 1, turn: .5, armF: 60, bendF: 120, armB: 70, bendB: 150 }); foreground(-1); F.flush(); });
// 7 red does the same, then teal again (two tracking shots with a whip between)
shot(T(7), r(7, 1.2), t => { const [xr] = cartsAt(t), push = seg(t, T(7), r(7, 1.2)); cam(t, [[T(7) - WHIP, { x: xr + 10, z: 0, y: 128, hor: 760, focus: 200, dof: 8 }], [r(7, 1.2), { x: xr + 60, z: 25, y: 128, hor: 760, focus: 175, dof: 8 }]]); F.cam().x = xr + 40; set(t);
  F.put(xr + 105, 212, CART, () => F.cart({ col: PAL.sideA, colD: PAL.sideAD, handle: 'left', roll: xr / 40 }), { rim: true, shadow: true });
  fig(xr, 200, { ...RED, t, expr: 'glare', look: 1, turn: .35, armF: 35, bendF: 0, armB: 30, bendB: 0, reach: true, walk: push > 0 && push < 1 ? (xr + CW) / 30 : -1 }); F.put(xr - 120, 110, .45, () => tuft(12)); F.flush(); });
shot(r(7, 1.2), T(8), t => { const [, xt] = cartsAt(t), push = seg(t, r(7, 1.2), E(7)); cam(t, [[r(7, 1.2), { x: xt - 35, z: 30, y: 128, hor: 760, focus: 175, dof: 8 }], [T(8) + WHIP, { x: xt - 50, z: 50, y: 128, hor: 760, focus: 155, dof: 8 }]]); F.cam().x = xt - 40; set(t);
  F.put(xt - 105, 212, CART, () => F.cart({ col: PAL.sideB, colD: PAL.sideBD, handle: 'right', roll: -xt / 40 }), { rim: true, shadow: true });
  fig(xt, 200, { ...TEAL, t, flip: true, expr: 'glare', look: 1, turn: .35, armF: 35, bendF: 0, armB: 30, bendB: 0, reach: true, walk: push > 0 && push < 1 ? (200 - xt) / 30 : -1 }); F.put(xt + 120, 110, .45, () => tuft(41)); F.flush(); });
// 8 time-lapse: day -> sunset -> night -> day while they creep together; the sign counts down in the foreground
shot(T(8), T(9), t => { cam(t, [[T(8), { x: 0, z: 150, hor: 860, focus: 520, dof: 1.2, f: 760 }], [T(9), { x: 0, z: 200, hor: 860, focus: 520, dof: 1.2, f: 760 }]]); const [xr, xt] = cartsAt(t); UBOUND = (xr + xt) / 2; set(t);
  wideCarts(t, { exprR: 'glare', exprT: 'glare' }); const u = ss(seg(t, T(8), r(8, 3.8))), v = Math.round(lerp(400, 0, u) / 10) * 10, pv = Math.round(lerp(400, 0, Math.max(0, u - .03)) / 10) * 10;
  sign(-150, 230, .7, `${v} m`, { prev: `${pv} m`, flip: v !== pv ? .6 : 0 }); F.flush(); });
// 9 side by side in the middle; then a sunbather at the far end walks a long way for a cone
shot(T(9), r(9, 2.2), t => { cam(t, [[T(9) - WHIP, { x: 0, z: 240, hor: 860, focus: 240, dof: 1.2, f: 940 }], [r(9, 2.2), { x: 0, z: 200, hor: 860, focus: 280, dof: 1.2, f: 940 }]]); UBOUND = 0; set(t); wideCarts(t, { at: [-47, 47], exprR: 'smug', exprT: 'smug' }); foreground(1); F.flush(); });
shot(r(9, 2.2), T(10), t => { const u = seg(t, r(9, 2.2), T(10)), x = lerp(-1300, -1000, u); cam(t, [[r(9, 2.2), { x: -1250, z: 0, y: 128, hor: 760, focus: 200, dof: 8 }], [T(10), { x: -960, z: 25, y: 128, hor: 760, focus: 200, dof: 8 }]]); set(t);
  fig(x, 200, { ...BATHER, t, expr: 'worried', look: 1, turn: .4, walk: t * 1.4, armF: 50, bendF: 30, armB: 110, bendB: 0 });
  for (let i = 0; i < 8; i++) F.put(x - 60 - i * 62, 200 + (i % 2) * 16, .2, () => F.fs(F.ell(0, -4, 50, 18), 'rgba(140,100,55,.32)', 0));
  F.put(x + 110, 620, .3, () => { F.line([[0, 0], [0, -420]], 12, PAL.woodD); F.fs(F.poly([[-170, -560], [150, -560], [210, -490], [150, -420], [-170, -420]]), PAL.wood, 7); F.text('2× FARTHER', -10, -490, { size: 52, col: PAL.cream, font: 'Cinzel', weight: 900, stroke: 7 }); }, { sharp: true, rim: true });
  F.put(x - 140, 110, .45, () => tuft(19)); F.flush(); });
// 10 neither can leave: each edges away and slides back
shot(T(10), T(11), t => { cam(t, [[T(10), { x: 0, z: 60, hor: 830, focus: 410, dof: 5 }], [T(11), { x: 0, z: 110, hor: 830, focus: 360, dof: 5 }]]); set(t);
  const k1 = Math.sin(clamp((t - r(10, .3)) / 1.2) * Math.PI) * 60, k2 = Math.sin(clamp((t - r(10, 1.7)) / 1.2) * Math.PI) * 60;
  wideCarts(t, { at: [-47 - k1, 47 + k2], exprR: k1 > 8 ? 'worried' : 'glare', exprT: k2 > 8 ? 'worried' : 'glare', red: { hold: 'scoop', armF: 40, bendF: -95 }, teal: { hold: 'scoop', armF: 40, bendF: -95 } }); foreground(1); F.flush();
  // v8: the stand-off at night, lit by a lantern on each cart (the reference's candle-lit / night beats)
  NIGHTK = 1; [[-47 - k1, 'rgba(255,190,110,1)'], [47 + k2, 'rgba(255,200,140,1)']].forEach(([x, col], i) => { const q = F.proj(x + (i ? 30 : -30), 175, 540); LAMPS.push([q.x, q.y, q.s, col]); }); });
// 11 the blueprint states the law
shot(T(11), T(12), t => blueprintShot(t));
// 12 the question: both offer a cone; YES / NO pennants on the carts
shot(T(12), T(13), t => { cam(t, [[T(12) - WHIP, { x: 0, z: 70, hor: 830, focus: 400, dof: 5 }], [T(13), { x: 0, z: 120, hor: 830, focus: 350, dof: 5 }]]); set(t);
  wideCarts(t, { at: [-47, 47], exprR: 'smug', exprT: 'smug', red: { hold: 'cone', armF: 40, bendF: -95, turn: 0, look: 0 }, teal: { hold: 'cone', armF: 40, bendF: -95, turn: 0, look: 0 } });
  [[-47, 0, 'YES'], [47, 1, 'NO']].forEach(([x, s2, w]) => F.put(x, 535, CART, () => { const d = s2 ? 1 : -1; F.line([[0, -650], [0, -760]], 8); F.fs(F.poly([[0, -760], [d * 170, -720], [0, -680]]), s2 ? PAL.sideB : PAL.sideA, 5); F.text(w, d * 62, -722, { size: 40, col: PAL.cream, font: 'Nunito', weight: 900 }); }, { sharp: true }));
  foreground(1); F.flush(); });
// 13 back to the sign (loop into frame 0)
shot(T(13), DUR + 1, t => { cam(t, [[T(13), { x: 0, z: 190, hor: 860, focus: 300, dof: 1.2, f: 940 }], [r(13, 1.2), { x: 0, z: 90, y: 160, hor: 760, focus: 430, dof: 6 }], [DUR, { x: 0, z: 40, y: 160, hor: 760, focus: 430, dof: 6 }]]);
  set(t); sign(0, 450, 1.05, '0 m'); wideCarts(t, { at: [-47, 47] }); foreground(-1, false); F.flush(); });

// time-lapse grade: day -> sunset -> night -> day
function grade(k) { if (k <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const sun = clamp(1 - Math.abs(k - .35) / .3), night = clamp(1 - Math.abs(k - .7) / .25);
  if (sun > 0) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = sun * .75; g.fillStyle = F.vgrad(0, H, [[0, '#5b4a9a'], [.45, '#e58a6a'], [1, '#c98a7a']]); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'screen'; g.globalAlpha = sun * .35; F.glow(W / 2, 760, 700, 'rgba(255,170,90,1)'); }
  if (night > 0) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = night * .88; g.fillStyle = F.vgrad(0, H, [[0, '#1e1c4a'], [.45, '#3e4488'], [1, '#33305e']]); g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = night; for (let i = 0; i < 90; i++) { const x = hash(i * 1.7) * W, y = 40 + hash(i * 2.9) * 640, tw = .5 + .5 * Math.sin(i * 3 + k * 40); g.fillStyle = `rgba(255,250,230,${.4 + .6 * tw})`; g.beginPath(); g.arc(x, y, 1.5 + 2 * hash(i * 4.3), 0, Math.PI * 2); g.fill(); }
    F.glow(820, 300, 220, 'rgba(255,250,230,.9)', .55 * night); g.fillStyle = '#fbf3da'; g.beginPath(); g.arc(820, 300, 46, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(30,28,74,.9)'; g.beginPath(); g.arc(842, 290, 42, 0, Math.PI * 2); g.fill(); }
  g.restore(); }
let NIGHTK = 0, LAMPS = [];
function nightLamps(t) { if (!NIGHTK) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = F.vgrad(0, H, [[0, '#1c1b48'], [.45, '#3a4282'], [1, '#2c2a55']]); g.globalAlpha = .82; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; for (let i = 0; i < 70; i++) { const x = hash(i * 1.7) * W, y = 40 + hash(i * 2.9) * 600; g.fillStyle = `rgba(255,250,230,${.35 + .4 * Math.sin(i + t * 2) ** 2})`; g.beginPath(); g.arc(x, y, 1.4 + 1.6 * hash(i), 0, Math.PI * 2); g.fill(); }
  g.globalCompositeOperation = 'screen'; LAMPS.forEach(([x, y, s2, col]) => { const fl = 1 + .06 * Math.sin(t * 13 + x); F.glow(x, y, 230 * s2 * fl, col, .42); F.glow(x, y, 34 * s2, 'rgba(255,240,200,1)', .85); });
  g.globalCompositeOperation = 'source-over'; LAMPS.forEach(([x, y, s2]) => { g.fillStyle = '#2b2422'; g.fillRect(x - 9 * s2, y - 14 * s2, 18 * s2, 26 * s2); g.fillStyle = '#ffe7a8'; g.fillRect(x - 6 * s2, y - 10 * s2, 12 * s2, 18 * s2); });
  g.restore(); NIGHTK = 0; LAMPS = []; }
const WHIPS = [T(1), T(5), r(7, 1.2), T(9), T(12)];
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  (SH.find(s => t >= s.a && t < s.b) || SH[SH.length - 1]).fn(t);
  for (const w of WHIPS) { const d = Math.abs(t - w); if (d < WHIP) { const k = 1 - d / WHIP, sh = (t < w ? -1 : 1) * k * k * 300; const img = g.getImageData(0, 0, W, H); g.putImageData(img, sh, 0); g.putImageData(img, sh - Math.sign(sh) * W, 0); F.smear(k * 460); } }
  grade(t >= T(8) && t < T(9) ? seg(t, T(8), r(8, 3.9)) : 0);
  nightLamps(t);
  F.post(t);
  F.captions(CAPS, t, 1340);
}
window.DUR = DUR; window.__F = F;
// loop: blend frame 0 back in over the last 0.4 s (max 30%)
window.seek = t => { t = Math.min(t, DUR - 1e-3); render(t); const lp = seg(t, DUR - .4, DUR); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); render(0); const f0 = g.getImageData(0, 0, W, H), A = keep.data, B = f0.data, k = .3 * lp; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
