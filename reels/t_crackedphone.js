// t_crackedphone.js: "Why does a phone screen crack from a short drop?" in template #26 doodle robot (demo t26, x.com/garmdotcom "Headroom").
// Demo grammar reused: a hand-inked room in one-point perspective (mottled warm paper walls, tiled floor, pendant lamp, framed window,
// poster, filing cabinet, potted plant), a cute teal robot with a screen face that changes expression, a battery-style gauge on the left wall,
// handwritten labels with little curly arrows and tape-box labels, a red rubber stamp, camera push-ins on the robot and on things in the room,
// big orange handwritten stats. Here the gauge measures the pull (tension) on the glass, and the micro-scale diagrams are drawn on a
// whiteboard on the back wall that the camera pushes into. Original code; fonts Kalam + Caveat (OFL).
// Batch N layout: the room fills y 300-1150, captions centred at y 1300 on a paper strip, nothing written in the top 250 px, the bottom
// 480 px, or the right column (x>900) below y 840; labels stay below y 340 on the right (EP badge).
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2;
const c = document.getElementById('c'); c.width = W; c.height = H; const g = c.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u, R = (t, t0, d) => clamp((t - t0) / d);
const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3), bo = u => { u = clamp(u); const k = 1.7; return 1 + (k + 1) * Math.pow(u - 1, 3) + k * Math.pow(u - 1, 2); };
const hash = n => { const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const INK = '#2b211c', TEAL = '#8fcfc6', TEALD = '#5aa79c', ORANGE = '#e0763a', CREAM = '#f3e7cc', SCREEN = '#22302f', RED = '#c8402e', WOOD = '#b0703c';
await Promise.all(['700 40px "Kalam"', '400 40px "KalamR"', '700 40px "Caveat"'].map(f => document.fonts.load(f)));

// ---------- ink helpers: wobbly hand-inked strokes ----------
function path(pts, close) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); }
function wob(pts, seed = 1, a = 1.6) { return pts.map(([x, y], i) => [x + (hash(seed * 13 + i * 1.3) - .5) * a, y + (hash(seed * 7 + i * 2.1) - .5) * a]); }
function seg(x0, y0, x1, y1, n = 8) { return Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); }
function ink(pts, o = {}) { const k = o.k ?? 1; if (k <= 0) return; let p = wob(pts, o.seed || 1, o.wob ?? 1.6); if (k < 1) { const n = Math.max(2, Math.ceil(p.length * k)); p = p.slice(0, n); }
  g.save(); g.globalAlpha *= o.a ?? 1; g.strokeStyle = o.col || INK; g.lineWidth = o.w || 5; g.lineCap = g.lineJoin = 'round'; path(p, o.close && k >= 1); g.stroke(); g.restore(); }
function blob(pts, col, o = {}) { g.save(); g.globalAlpha *= o.a ?? 1; g.fillStyle = col; path(wob(pts, o.seed || 2, 1), true); g.fill(); g.restore(); if (o.line !== false) ink(pts, { close: true, w: o.w || 5, seed: o.seed || 2, col: o.col, a: o.a }); }
const rect = (x, y, w, h, n = 4) => [...seg(x, y, x + w, y, n), ...seg(x + w, y, x + w, y + h, n).slice(1), ...seg(x + w, y + h, x, y + h, n).slice(1), ...seg(x, y + h, x, y, n).slice(1, -1)];
const rrect = (x, y, w, h, r, n = 6) => { const o = []; [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]].forEach(([cx, cy, a0]) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return o; };
const circ = (x, y, r, n = 24, sq = 1) => Array.from({ length: n }, (_, i) => [x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r * sq]);
function write(txt, x, y, k = 1, o = {}) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 1.8); g.font = `${o.reg ? '400' : '700'} ${o.size || 46}px ${o.reg ? '"KalamR"' : '"Kalam"'}`; g.fillStyle = o.col || INK; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  g.fillText(txt, x, y + (1 - eo(k)) * 12); g.restore(); }
function curly(x0, y0, x1, y1, k = 1, o = {}) { if (k <= 0) return; const mx = (x0 + x1) / 2 + (o.bend ?? 30), my = (y0 + y1) / 2 - (o.bend ?? 30); const pts = Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y1]; });
  ink(pts, { k, w: o.w || 3.5, col: o.col, seed: o.seed || 9 }); if (k >= 1) { const a = Math.atan2(y1 - my, x1 - mx); ink([[x1 - 18 * Math.cos(a - .5), y1 - 18 * Math.sin(a - .5)], [x1, y1], [x1 - 18 * Math.cos(a + .5), y1 - 18 * Math.sin(a + .5)]], { w: o.w || 3.5, col: o.col, seed: (o.seed || 9) + 1 }); } }
// tape-box label (the demo's "originals" tag)
function tag(txt, x, y, k = 1, o = {}) { if (k <= 0) return; g.save(); g.font = `700 ${o.size || 40}px "Kalam"`; const w = g.measureText(txt).width + 36, h = (o.size || 40) * 1.5; g.restore(); const sc = bo(k);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.03); g.scale(sc, sc); blob(rrect(-w / 2, -h / 2, w, h, 10), o.bg || '#fbf5e6', { w: 3.5, seed: o.seed || 31 }); write(txt, 0, 2, 1, { size: o.size || 40, col: o.col }); g.restore(); }
function stamp(txt, x, y, k) { if (k <= 0) return; const sc = lerp(1.8, 1, eo(k)); g.save(); g.translate(x, y); g.rotate(-.1); g.scale(sc, sc); g.globalAlpha *= clamp(k * 2) * .9; g.strokeStyle = RED; g.lineWidth = 7; g.font = '700 74px "Kalam"'; const w = g.measureText(txt).width + 50;
  g.strokeRect(-w / 2, -52, w, 104); g.fillStyle = RED; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4); g.restore(); }

// ---------- the mottled warm paper (cached) ----------
const PAPER = (() => { const o = document.createElement('canvas'); o.width = W; o.height = H; const q = o.getContext('2d'); q.fillStyle = '#efe2c8'; q.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { const x = hash(i * 1.7) * W, y = hash(i * 2.9) * H, r = 20 + 70 * hash(i * 4.1); const gr = q.createRadialGradient(x, y, 0, x, y, r); const d = hash(i * 5.3) > .5; gr.addColorStop(0, d ? 'rgba(170,130,80,.10)' : 'rgba(255,250,235,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.fillRect(x - r, y - r, r * 2, r * 2); }
  return o; })();

// ---------- the room (one-point perspective; back wall x 140-940, y 420-900) ----------
const BW = [140, 420, 940, 900];
function room(t, o = {}) { const [x0, y0, x1, y1] = BW;
  g.save(); path([[0, 300], [1080, 300], [x1, y0], [x0, y0]], true); g.fillStyle = 'rgba(150,110,70,.10)'; g.fill(); g.restore();   // ceiling
  g.save(); path([[0, 300], [x0, y0], [x0, y1], [0, 1150]], true); g.fillStyle = 'rgba(150,110,70,.08)'; g.fill(); path([[1080, 300], [x1, y0], [x1, y1], [1080, 1150]], true); g.fill(); g.restore();
  g.save(); g.fillStyle = 'rgba(255,248,232,.55)'; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.restore();   // back wall (lighter)
  g.save(); path([[x0, y1], [x1, y1], [1080, 1150], [0, 1150]], true); g.fillStyle = '#d7a77a'; g.fill(); g.clip();   // tiled floor
  g.strokeStyle = 'rgba(80,50,30,.35)'; g.lineWidth = 2; for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(540 + i * 100, y1); g.lineTo(540 + i * 270, 1150); g.stroke(); } [930, 975, 1035, 1110].forEach(y => { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }); g.restore();
  ink([[0, 300], [x0, y0]], { seed: 3, w: 4 }); ink([[1080, 300], [x1, y0]], { seed: 4, w: 4 }); ink([[0, 1150], [x0, y1]], { seed: 5 }); ink([[1080, 1150], [x1, y1]], { seed: 6 }); ink(rect(x0, y0, x1 - x0, y1 - y0), { close: true, seed: 7 });
  // pendant lamp
  ink([[540, y0], [540, 470]], { w: 3, seed: 8 }); blob([[505, 470], [575, 470], [600, 505], [480, 505]], '#e8c25a', { seed: 9, w: 4 }); g.save(); const lg = g.createRadialGradient(540, 520, 5, 540, 520, 160); lg.addColorStop(0, `rgba(255,236,170,${.45 + .1 * Math.sin(t * 3)})`); lg.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = lg; g.fillRect(380, 460, 320, 260); g.restore();
  // window (left of the back wall)
  if (!o.noWindow) { blob(rect(180, 470, 150, 130), '#a9d3e6', { seed: 10, w: 4.5 }); ink([[255, 470], [255, 600]], { w: 3.5, seed: 11 }); ink([[180, 535], [330, 535]], { w: 3.5, seed: 12 }); g.fillStyle = '#f1c94e'; g.beginPath(); g.arc(300, 495, 14, 0, TAU); g.fill(); }
  // poster (right) and filing cabinet
  if (!o.noPoster) { blob(rect(790, 460, 120, 150), '#f6edd6', { seed: 13, w: 4 }); blob([[850, 480], [868, 530], [850, 540], [832, 530]], '#fbfbf6', { seed: 14, w: 3 }); g.fillStyle = ORANGE; g.beginPath(); g.arc(850, 548, 6 + Math.sin(t * 8) * 2, 0, TAU); g.fill(); write('ship it!', 850, 585, 1, { size: 26 }); }
  blob(rect(800, 700, 110, 200), '#e9d7ad', { seed: 15, w: 4.5 }); ink(rect(812, 712, 86, 82), { close: true, w: 3, seed: 16 }); ink(rect(812, 806, 86, 82), { close: true, w: 3, seed: 17 }); ink([[838, 752], [872, 752]], { w: 6, col: '#9a8f80', seed: 18 }); ink([[838, 846], [872, 846]], { w: 6, col: '#9a8f80', seed: 19 });
  // potted plant (front left floor)
  blob([[60, 1040], [150, 1040], [140, 1120], [70, 1120]], ORANGE, { seed: 20, w: 4.5 }); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .3 + .04 * Math.sin(t * 1.5 + i); blob([[105, 1040], [105 + Math.cos(a - .12) * 60, 1040 + Math.sin(a - .12) * 60], [105 + Math.cos(a) * 120, 1040 + Math.sin(a) * 120], [105 + Math.cos(a + .12) * 60, 1040 + Math.sin(a + .12) * 60]], '#4f9a86', { seed: 21 + i, w: 3.5 }); }
  gauge(t, o.pull ?? 0, o.gaugeA ?? 1); }
// the left-wall gauge (the demo's "tokens" battery) reads the pull on the glass
function gauge(t, v, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; const x = 40, y = 520, w = 70, h = 210; blob(rrect(x + 22, y - 18, 26, 22, 5), '#bdb2a0', { seed: 40, w: 3.5 }); blob(rrect(x, y, w, h, 12), '#fbf5e6', { seed: 41, w: 4.5 });
  const n = 5, f = clamp(v); for (let i = 0; i < n; i++) { const on = f * n > i; if (!on) continue; const col = f > .8 ? RED : f > .5 ? ORANGE : TEALD; blob(rrect(x + 10, y + h - 12 - (i + 1) * 38, w - 20, 30, 6), col, { seed: 42 + i, line: false }); }
  write('pull', x + w / 2, y + h + 34, 1, { size: 36 }); g.restore(); }

// ---------- the robot (teal body, screen face) ----------
// o: face 'happy'|'oh'|'worried'|'think'|'dizzy'|'proud', armL/armR angles (radians, 0 = down), hold: fn drawn at the right hand, look -1..1
function robot(x, y, sc, t, o = {}) { g.save(); g.translate(x, y); g.scale(sc, sc); const bob = Math.sin(t * 2.4) * 4;
  // legs + feet
  ink([[-30, 120], [-30, 168]], { w: 6, seed: 50 }); ink([[30, 120], [30, 168]], { w: 6, seed: 51 }); blob(circ(-38, 176, 30, 16, .4), '#c9c3b8', { seed: 52, w: 4 }); blob(circ(38, 176, 30, 16, .4), '#c9c3b8', { seed: 53, w: 4 });
  g.translate(0, bob);
  // arms (behind the body) with grey round hands
  const arm = (side, ang, seed) => { const sx = side * 72, sy = 20, L = 96, ex = sx + Math.sin(ang) * L * side, ey = sy + Math.cos(ang) * L; ink([[sx, sy], [(sx + ex) / 2 + side * 6, (sy + ey) / 2], [ex, ey]], { w: 12, col: INK, seed }); ink([[sx, sy], [(sx + ex) / 2 + side * 6, (sy + ey) / 2], [ex, ey]], { w: 7, col: TEAL, seed, wob: 0 }); blob(circ(ex, ey, 15, 14), '#c9c3b8', { seed: seed + 1, w: 4 }); return [ex, ey]; };
  const hl = arm(-1, o.armL ?? .25, 54), hr = arm(1, o.armR ?? .25, 56);
  // body
  blob(rrect(-78, -30, 156, 160, 34), TEAL, { seed: 58, w: 5.5 }); blob(rrect(-46, 20, 92, 50, 12), '#e9e2cf', { seed: 59, w: 4 });
  ['#e8c25a', ORANGE, TEALD].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(-24 + i * 24, 45, 8, 0, TAU); g.fill(); });
  // head: frame + screen
  ink([[0, -150], [0, -186]], { w: 5, seed: 60 }); blob(circ(0, -196, 13, 14), ORANGE, { seed: 61, w: 4 });
  blob(circ(-104, -88, 14, 12, 1.2), ORANGE, { seed: 62, w: 4 }); blob(circ(104, -88, 14, 12, 1.2), ORANGE, { seed: 63, w: 4 });
  blob(rrect(-104, -156, 208, 140, 30), '#e8dcc2', { seed: 64, w: 5.5 }); blob(rrect(-86, -140, 172, 108, 22), SCREEN, { seed: 65, w: 3 });
  face(o.face || 'happy', (o.look || 0) * 10, -86, t); g.restore();
  if (o.hold) { g.save(); g.translate(x, y + bob * sc); g.scale(sc, sc); o.hold(hr[0], hr[1]); g.restore(); } }
function face(kind, lx, cy, t) { const col = '#9ff0e2'; g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 6; g.lineCap = 'round'; const ex = 38, ey = cy - 8;
  const blink = (t % 3.7) < .12;
  if (kind === 'happy' || kind === 'proud') { [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * ex + lx, ey + 6, 16, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }); g.beginPath(); g.arc(lx, cy + 14, 20, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
  else if (kind === 'oh') { [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * ex + lx, ey, blink ? 2 : 11, 0, TAU); g.fill(); }); g.beginPath(); g.ellipse(lx, cy + 30, 12, 15, 0, 0, TAU); g.stroke(); }
  else if (kind === 'worried') { [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * ex + lx, ey + 2, blink ? 2 : 9, 0, TAU); g.fill(); g.beginPath(); g.moveTo(sd * ex + lx - 16, ey - 22 + sd * 6); g.lineTo(sd * ex + lx + 16, ey - 22 - sd * 6); g.stroke(); });
    g.beginPath(); for (let i = 0; i <= 6; i++) g.lineTo(lx - 24 + i * 8, cy + 30 + (i % 2 ? -5 : 5)); g.stroke(); }
  else if (kind === 'think') { [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * ex + lx, ey, blink ? 2 : 9, 0, TAU); g.fill(); }); g.beginPath(); g.moveTo(lx - 16, cy + 28); g.lineTo(lx + 18, cy + 22); g.stroke(); }
  else if (kind === 'dizzy') { [-1, 1].forEach(sd => { const x = sd * ex + lx; g.beginPath(); g.moveTo(x - 11, ey - 11); g.lineTo(x + 11, ey + 11); g.moveTo(x + 11, ey - 11); g.lineTo(x - 11, ey + 11); g.stroke(); }); g.beginPath(); g.ellipse(lx, cy + 30, 16, 9, 0, 0, TAU); g.stroke(); }
  g.restore(); }
// the phone (dark slab, glowing screen); crack: 0..1 grows a star of cracks from (cx,cy) in phone units
function phone(x, y, w, h, rot, o = {}) { g.save(); g.translate(x, y); g.rotate(rot); blob(rrect(-w / 2, -h / 2, w, h, w * .14), '#33363d', { seed: 70, w: 4 });
  const sc = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); sc.addColorStop(0, '#9fd5ef'); sc.addColorStop(1, '#c9b8f0'); g.fillStyle = sc; g.beginPath(); g.roundRect(-w / 2 + w * .08, -h / 2 + w * .1, w * .84, h - w * .2, w * .08); g.fill();
  if (o.crack > 0) { const [cx, cy] = [(o.cx ?? .3) * w, (o.cy ?? -.2) * h]; g.save(); g.beginPath(); g.roundRect(-w / 2 + w * .08, -h / 2 + w * .1, w * .84, h - w * .2, w * .08); g.clip();
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + hash(i) * .5, L = (w * .5 + w * .9 * hash(i + 3)) * eo(o.crack); const pts = [[cx, cy]]; for (let k = 1; k <= 5; k++) pts.push([cx + Math.cos(a + (hash(i * 9 + k) - .5) * .5) * L * k / 5, cy + Math.sin(a + (hash(i * 7 + k) - .5) * .5) * L * k / 5]);
      ink(pts, { w: Math.max(2, w * .018), col: '#ffffff', seed: 80 + i, wob: 2 }); ink(pts, { w: Math.max(1, w * .008), col: '#2b2f3a', seed: 80 + i, wob: 2 }); }
    g.restore(); }
  g.restore(); }

// ---------- whiteboard on the back wall (the micro diagrams), camera pushes into it ----------
const BD = [230, 450, 620, 430];   // x, y, w, h
function board(k = 1) { if (k <= 0) return; const [x, y, w, h] = BD; g.save(); g.globalAlpha *= k; blob(rect(x - 10, y - 10, w + 20, h + 20), '#c9a77a', { seed: 90, w: 4.5 }); blob(rect(x, y, w, h), '#fdfaf1', { seed: 91, w: 3 }); g.restore(); }
// camera: [cx, cy, zoom] in room coords -> screen centre (540, 725)
function cam(v, fn) { const [cx, cy, z] = v; g.save(); g.translate(540, 725); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore(); }
const mixV = (A, B, u) => A.map((a, i) => lerp(a, B[i], u));
const V_WIDE = [540, 725, 1], V_BOARD = [540, 665, 1.62], V_ROBOT = [600, 760, 1.55];

// glass slab drawings for the board (in room coords inside the board)
function slab(x, y, w, h, o = {}) { g.save(); if (o.bend) { g.translate(x + w / 2, y + h / 2); } const b = o.bend || 0; const top = [], bot = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16, xx = (o.bend ? -w / 2 : x) + u * w, dy = -b * Math.sin(u * Math.PI); top.push([xx, (o.bend ? -h / 2 : y) + dy]); bot.push([xx, (o.bend ? h / 2 : y + h) + dy]); }
  blob([...top, ...bot.reverse()], o.col || 'rgba(170,215,230,.75)', { seed: o.seed || 100, w: 4.5 }); g.restore(); return { top, bot }; }
function arrowsIn(x, y, w, k, col = TEALD, out = false, t = 0) { const p = 6 * Math.sin(t * 6); [[-1, x - 20], [1, x + w + 20]].forEach(([sd, ex]) => { const a = out ? ex + sd * 90 + sd * p : ex + sd * 100 - sd * p, b = out ? ex + sd * 10 : ex + sd * 10; const [s0, s1] = out ? [ex + sd * 10, ex + sd * 100 + sd * p] : [ex + sd * 110 - sd * p, ex + sd * 14];
    curly(s0, y, s1, y, k, { col, w: 6, bend: 0, seed: 110 + sd }); }); }

// ---------- scenes ----------
const SC = [];
// 0: the drop, close on the robot: phone slips, falls, cracks; "a scratch"
SC.push([0, t => { const fall = R(t, .5, .55), crack = R(t, 1.05, .5), z = mixV([600, 760, 1.55], [560, 800, 1.35], ss(R(t, 2, 2)));
  cam(z, () => { room(t, { pull: crack }); robot(560, 840, 1, t, { face: t < 1.05 ? 'happy' : 'oh', armR: t < .5 ? 2.2 : lerp(2.2, .9, ss(R(t, .5, .4))), armL: t > 1.1 ? 2.6 : .3,
      hold: t < .5 ? (hx, hy) => phone(hx + 10, hy - 50, 64, 120, .2, {}) : null });
    if (t >= .5) { const y = lerp(720, 1060, fall * fall), rot = lerp(.2, 1.57, fall); phone(lerp(680, 720, fall), y, 64 * (1 + .25 * fall), 120 * (1 + .25 * fall), rot, { crack, cx: .2, cy: -.25 }); }
    if (crack > 0) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ink([[720 + Math.cos(a) * 60, 1060 + Math.sin(a) * 30], [720 + Math.cos(a) * (60 + 40 * eo(crack)), 1060 + Math.sin(a) * (30 + 20 * eo(crack))]], { w: 4, seed: 120 + i, a: 1 - R(t, 1.8, .6) }); } });
  if (t > 2.3) { tag('a scratch', 770, 1010 - 230, R(t, 2.4, .4), { rot: .05 }); curly(800, 830, 760, 930, R(t, 2.6, .4), { seed: 125 }); } }]);
// 1: wide room, the robot holds the cracked phone; "short drop" height marker
SC.push([s(1) - .3, t => { cam(V_WIDE, () => { room(t, { pull: .8 }); robot(560, 760, .95, t, { face: 'worried', armR: 2.4, armL: .4, hold: (hx, hy) => phone(hx + 6, hy - 52, 62, 116, .1, { crack: 1, cx: .2, cy: -.25 }) });
    const k = R(t, s(1) + .6, .6); ink([[740, 640], [740, 640 + 260 * eo(k)]], { w: 4, col: ORANGE, seed: 130 }); if (k >= 1) { ink([[722, 640], [758, 640]], { w: 4, col: ORANGE, seed: 131 }); ink([[722, 900], [758, 900]], { w: 4, col: ORANGE, seed: 132 }); }
    write('short drop', 760, 770, R(t, s(1) + 1.0, .5), { align: 'left', size: 44, col: ORANGE }); write('?', 470, 560, R(t, s(1) + .4, .4), { size: 90, col: ORANGE }); }); }]);
// 2: whiteboard: squeeze = strong, pull = weak (pull gauge rises)
SC.push([s(2) - .3, t => { const z = mixV(V_WIDE, V_BOARD, ss(R(t, s(2) - .3, 1.0))); const pull = R(t, s(2) + 2.4, 1.2);
  cam(z, () => { room(t, { pull: pull * .8 }); board(); slab(300, 520, 480, 70, { seed: 140 }); slab(300, 700, 480, 70, { seed: 141 });
    arrowsIn(300, 555, 480, R(t, s(2) + .4, .5), TEALD, false, t); write('squeeze: strong', 540, 650, R(t, s(2) + .8, .5), { size: 38, col: TEALD });
    arrowsIn(300, 735, 480, R(t, s(2) + 2.4, .5), RED, true, t); write('pull: weak', 540, 830, R(t, s(2) + 2.9, .5), { size: 38, col: RED }); });
  robot(150, 1080, .55, t, { face: t < s(2) + 2.4 ? 'happy' : 'oh', armR: 2.0 }); }]);
// 3: tiny flaws under a magnifier
SC.push([s(3) - .3, t => { cam(V_BOARD, () => { room(t, { pull: .2 }); board(); slab(270, 640, 540, 110, { seed: 150 });
    for (let i = 0; i < 14; i++) { const x = 290 + hash(i * 3.3) * 500, k = R(t, s(3) + .6 + i * .07, .3); ink([[x, 640], [x + 6 - hash(i) * 12, 640 + 8 + 14 * hash(i * 5)]], { w: 2.4, seed: 160 + i, k }); }
    const mx = lerp(330, 640, ss(R(t, s(3) + .4, 3.2))); g.save(); g.beginPath(); g.arc(mx, 620, 90, 0, TAU); g.clip(); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(mx - 90, 530, 180, 180); g.translate(mx, 640); g.scale(2.4, 2.4); g.translate(-mx, -640);
    for (let i = 0; i < 14; i++) { const x = 290 + hash(i * 3.3) * 500; ink([[x, 640], [x + 6 - hash(i) * 12, 640 + 8 + 14 * hash(i * 5)]], { w: 2.4, seed: 160 + i }); } g.restore();
    ink(circ(mx, 620, 90, 30), { close: true, w: 7, seed: 170 }); ink([[mx + 64, 684], [mx + 130, 760]], { w: 12, seed: 171, col: WOOD });
    write('tiny flaws', 540, 520, R(t, s(3) + 1.2, .5), { size: 50 }); write('too small to see', 540, 820, R(t, s(3) + 2.2, .5), { size: 36, reg: true }); }); }]);
// 4: bending piles the pull at the tip of the deepest flaw
SC.push([s(4) - .3, t => { const b = 40 * ss(R(t, s(4), 1.4)); cam(V_BOARD, () => { room(t, { pull: .4 + .5 * ss(R(t, s(4), 2)) }); board(); g.save(); g.translate(0, 30); slab(270, 610, 540, 110, { seed: 180, bend: -b });
    // flaw on the bottom face (in tension when bent like a smile)
    const fx = 540, fy = 665 + b; ink([[fx - 8, fy], [fx, fy - 46], [fx + 8, fy]], { w: 3, seed: 181 });
    for (let i = 0; i < 7; i++) { const u = (t * .7 + i / 7) % 1, x0 = lerp(i < 3.5 ? 300 : 780, fx, u), y0 = lerp(fy - 10, fy - 46, u); g.fillStyle = `rgba(200,64,46,${.8 * (1 - u)})`; g.beginPath(); g.arc(x0, y0, 7, 0, TAU); g.fill(); }
    const glow = R(t, s(4) + 1.2, .6); if (glow > 0) { const gr = g.createRadialGradient(fx, fy - 46, 2, fx, fy - 46, 50); gr.addColorStop(0, `rgba(230,70,40,${.8 * glow})`); gr.addColorStop(1, 'rgba(230,70,40,0)'); g.fillStyle = gr; g.fillRect(fx - 60, fy - 106, 120, 120); }
    curly(640, 540, 552, 596 + b, R(t, s(4) + 1.6, .5), { col: RED, seed: 182 }); write('the pull piles up here', 600, 500, R(t, s(4) + 1.4, .5), { size: 38, col: RED }); g.restore(); }); }]);
// 5: Griffith, 1920: the crack runs
SC.push([s(5) - .3, t => { cam(V_BOARD, () => { room(t, { pull: 1 }); board(); slab(270, 640, 540, 110, { seed: 190 });
    const run = R(t, s(5) + 3.2, 1.2); const pts = [[540, 750]]; for (let i = 1; i <= 10; i++) pts.push([540 + (hash(i * 3) - .5) * 40, 750 - i * 11 * eo(run)]); if (run > 0) ink(pts, { w: 4, col: RED, seed: 191 });
    ink([[532, 750], [540, 704], [548, 750]], { w: 3, seed: 192 }); if (run >= 1) { stamp('CRACK', 660, 560, R(t, s(5) + 4.6, .3)); }
    const ck = R(t, s(5) + .2, .5); if (ck > 0) { g.save(); g.translate(330, 545); g.rotate(-.06); g.scale(bo(ck), bo(ck)); blob(rect(-90, -55, 180, 110), '#fbf5e6', { seed: 193, w: 3.5 }); write('Griffith', 0, -15, 1, { size: 38 }); write('1920', 0, 28, 1, { size: 34, col: ORANGE }); g.restore(); } });
  robot(150, 1080, .55, t, { face: t > s(5) + 3.4 ? 'oh' : 'think', armR: 1.8 }); }]);
// 6: the salt bath: the glass goes into a tub of hot melted salt
SC.push([s(6) - .3, t => { cam(V_WIDE, () => { room(t, { pull: .3 }); const dip = ss(R(t, s(6) + .2, 1.0));
    blob([[300, 840], [780, 840], [740, 1000], [340, 1000]], '#cfd8dc', { seed: 200, w: 5 }); g.save(); g.fillStyle = 'rgba(244,164,96,.75)'; path([[310, 870], [770, 870], [742, 990], [338, 990]], true); g.fill(); g.restore();
    for (let i = 0; i < 6; i++) { const ph = (t * .6 + i / 6) % 1; ink([[340 + i * 70, 860 - ph * 80], [350 + i * 70, 830 - ph * 80], [338 + i * 70, 800 - ph * 80]], { w: 3, col: ORANGE, a: 1 - ph, seed: 205 + i }); }
    g.save(); g.beginPath(); g.rect(0, 0, W, 870); g.clip(); phone(540, lerp(640, 900, dip), 90, 170, 1.57, {}); g.restore();
    write('hot melted salt', 540, 1050 - 90, R(t, s(6) + .6, .5), { size: 34 }); robot(840, 960, .5, t, { face: 'proud', armL: 2.2 }); });
  tag('salt bath', 540, 560, R(t, s(6) + .1, .4), { size: 48 }); }]);
// 7-9: the atoms: small sodium out, big potassium in; the surface squeezed; flaws stay shut
const NA = '#e8c25a', K = '#9b7fd1';
function atoms(t, swap, squeeze, flaw) { const cols = 11, rows = 5, x0 = 300, y0 = 560, dx = 48, dy = 52; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const x = x0 + q * dx + (r % 2) * 24, y = y0 + r * dy; const surf = r < 2;
  const sw = surf ? ss(clamp(swap * 2.2 - hash(q * 7 + r) * 1.2)) : 0; const big = sw > .5; const rr = big ? lerp(16, 22, ss((sw - .5) * 2)) : 15;
  g.fillStyle = '#d9e6ea'; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill();
  if (surf && sw > 0 && sw < 1) { const ox = x + (hash(q) - .5) * 40 * (1 - sw), oy = y - 120 * sw; g.save(); g.globalAlpha = 1 - sw; blob(circ(ox, oy, 15, 12), NA, { seed: 220 + q, w: 2.5 }); g.restore(); }
  blob(circ(x + (big ? Math.sin(t * 9 + q) * squeeze * 1.5 : 0), y, rr, 12), big ? K : NA, { seed: 230 + q + r * 11, w: 2.5 }); }
  if (squeeze > 0) { for (let i = 0; i < 2; i++) curly(i ? 860 : 220, 585, i ? 800 : 280, 585, squeeze, { col: TEALD, w: 6, bend: 0, seed: 260 + i }); g.save(); g.globalAlpha = squeeze * .25; g.fillStyle = TEALD; g.fillRect(270, 530, 580, 115); g.restore(); }
  if (flaw > 0) { const open = flaw * (1 - squeeze * .85), fx = 560; g.save(); g.fillStyle = '#fdfaf1'; path([[fx - 30 * open, 530], [fx, 530 + 120 * flaw], [fx + 30 * open, 530]], true); g.fill(); g.restore(); ink([[fx - 30 * open, 530], [fx, 530 + 120 * flaw], [fx + 30 * open, 530]], { w: 3.5, col: RED, seed: 270 }); } }
SC.push([s(7) - .3, t => { cam(V_BOARD, () => { room(t, { pull: .3 }); board(); g.save(); g.fillStyle = 'rgba(244,164,96,.35)'; g.fillRect(240, 455, 600, 70); g.restore(); write('melted salt', 540, 488, 1, { size: 30, col: ORANGE });
    atoms(t, R(t, s(7) + 1.6, 4.2), 0, 0); tag('Na  sodium: small', 390, 840, R(t, s(7) + 4.6, .4), { size: 30, bg: '#fbefc2', rot: -.04 }); tag('K  potassium: big', 620, 840, R(t, s(7) + 3.2, .4), { size: 30, bg: '#e6dcf6', rot: .03 }); }); }]);
SC.push([s(8) - .3, t => { cam(V_BOARD, () => { room(t, { pull: .2 }); board(); atoms(t, 1, ss(R(t, s(8) + .6, .8)), 0); write('squeezed tight', 540, 840, R(t, s(8) + 1.4, .5), { size: 44, col: TEALD }); write('surface', 252, 590, R(t, s(8) + .8, .4), { size: 26, col: TEALD, align: 'left' }); }); }]);
SC.push([s(9) - .3, t => { const f = ss(R(t, s(9) + .3, 1.2)); cam(V_BOARD, () => { room(t, { pull: .3 * f }); board(); atoms(t, 1, 1, f); write('small flaws stay shut', 540, 840, R(t, s(9) + 2.6, .5), { size: 44, col: TEALD }); });
  robot(150, 1080, .55, t, { face: t > s(9) + 2.6 ? 'proud' : 'think', armL: 2.6, armR: 2.6 }); }]);
// 10: the layer is about as thick as a hair
SC.push([s(10) - .3, t => { cam(V_BOARD, () => { room(t, { pull: .2 }); board(); slab(270, 640, 540, 150, { seed: 280 }); g.save(); g.globalAlpha = .45; g.fillStyle = TEALD; g.fillRect(272, 640, 536, 26); g.restore();
    write('squeezed layer', 300, 610, R(t, s(10) + .3, .5), { size: 34, col: TEALD, align: 'left' });
    const hk = R(t, s(10) + 1.2, 1.0); ink(Array.from({ length: 24 }, (_, i) => [300 + i * 22 * eo(hk) * 1.0, 860 + Math.sin(i * .7 + t * 2) * 10]), { w: 22, col: '#6b4a2e', seed: 281, k: hk });
    write('≈ one hair', 640, 820, R(t, s(10) + 1.8, .5), { size: 40 }); }); }]);
// 11: face-down on pavement: a sharp grain drives a flaw through the layer
SC.push([s(11) - .3, t => { cam(V_BOARD, () => { room(t, { pull: .5 + .5 * R(t, s(11) + 2.2, .5) }); board(); g.save(); g.fillStyle = '#8f8a84'; g.fillRect(240, 760, 600, 110); for (let i = 0; i < 40; i++) { g.fillStyle = hash(i) > .5 ? '#6f6a64' : '#b4aea6'; g.beginPath(); g.arc(250 + hash(i * 3) * 580, 770 + hash(i * 7) * 90, 4 + 6 * hash(i * 5), 0, TAU); g.fill(); } g.restore();
    const down = ss(R(t, s(11) + .3, 1.2)); g.save(); g.translate(0, down * 40); slab(270, 610, 540, 110, { seed: 290 }); g.save(); g.globalAlpha = .45; g.fillStyle = TEALD; g.fillRect(272, 694, 536, 24); g.restore();
    const gk = R(t, s(11) + 1.4, .9); ink([[540, 720], [540, 720 - 90 * eo(gk)]], { w: 4, col: RED, seed: 291 }); g.restore();
    blob([[520, 762], [540, 722 + down * 40 - 30], [560, 762]], '#55504a', { seed: 292, w: 3 }); write('pavement', 400, 850, R(t, s(11) + .5, .4), { size: 30, col: '#fdfaf1' });
    write('sharp grain', 640, 540, R(t, s(11) + 1.6, .5), { size: 42, col: RED }); curly(640, 568, 556, 720, R(t, s(11) + 1.9, .4), { col: RED, seed: 293 }); }); }]);
// 12: Corning: sharp contact caused over 70% of field failures
SC.push([s(12) - .3, t => { cam(V_WIDE, () => { room(t, { pull: .9 }); board(); const n = Math.round(70 * ss(R(t, s(12) + 1.6, 1.6)));
    write(n + '%+', 540, 610, R(t, s(12) + 1.4, .3), { size: 150, col: ORANGE }); write('sharp contact', 540, 730, R(t, s(12) + 2.4, .4), { size: 48 }); write('of broken phones Corning studied', 540, 800, R(t, s(12) + 2.8, .4), { size: 30, reg: true });
    for (let i = 0; i < 6; i++) phone(260 + i * 112, 1020, 50, 92, (hash(i) - .5) * .5, { crack: R(t, s(12) + .4 + i * .15, .4), cx: hash(i) - .5, cy: hash(i * 3) - .5 }); }); }]);
// 13: exposed edges are weak spots too
SC.push([s(13) - .3, t => { cam(V_ROBOT, () => { room(t, { pull: .7 }); const hit = R(t, s(13) + .4, .5); phone(600, lerp(700, 860, eo(hit)), 130, 240, .6, { crack: R(t, s(13) + .9, .5), cx: .45, cy: .45 });
    if (hit >= 1) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .35; ink([[640 + Math.cos(a) * 40, 960 + Math.sin(a) * 40], [640 + Math.cos(a) * 80, 960 + Math.sin(a) * 80]], { w: 4, col: RED, seed: 300 + i, a: 1 - R(t, s(13) + 1.4, .6) }); } });
  tag('exposed edge', 420, 580, R(t, s(13) + .6, .4), { size: 46 }); }]);
// 14: it's what the glass meets
SC.push([s(14) - .3, t => { cam(V_WIDE, () => { room(t, { pull: .3 }); board();
    blob(rect(270, 600, 250, 160), '#cfe3c3', { seed: 310, w: 4 }); write('smooth', 395, 640, 1, { size: 36 }); phone(395, 715, 120, 50, 0, {}); ink([[350, 790], [380, 815], [440, 770]], { w: 6, col: TEALD, seed: 311, k: R(t, s(14) + .6, .4) });
    blob(rect(560, 600, 250, 160), '#b9b3ab', { seed: 312, w: 4 }); for (let i = 0; i < 18; i++) { g.fillStyle = '#6f6a64'; g.beginPath(); g.arc(575 + hash(i * 3) * 220, 735 + hash(i * 5) * 20, 4 + 5 * hash(i), 0, TAU); g.fill(); } write('grit', 685, 640, 1, { size: 36 }); phone(685, 715, 120, 50, 0, { crack: R(t, s(14) + 1.3, .4), cx: 0, cy: 0 });
    ink([[650, 770], [720, 820]], { w: 6, col: RED, seed: 313, k: R(t, s(14) + 1.6, .3) }); ink([[720, 770], [650, 820]], { w: 6, col: RED, seed: 314, k: R(t, s(14) + 1.8, .3) });
    robot(540, 1010, .45, t, { face: 'proud', armL: 2.4 }); }); }]);
// 15: yes or no
SC.push([s(15) - .3, t => { cam(V_ROBOT, () => { room(t, { pull: .5 }); robot(560, 840, 1, t, { face: 'think', armR: 2.4, hold: (hx, hy) => phone(hx + 6, hy - 52, 62, 116, .1, { crack: 1, cx: .2, cy: -.25 }) }); });
  tag('yes', 300, 610, R(t, s(15) + 2.2, .4), { size: 56, bg: '#d9efe3' }); tag('no', 810, 610, R(t, s(15) + 2.5, .4), { size: 56, bg: '#f6dcd2' }); }]);
// 16: end card on the back wall
SC.push([s(16) - .05, t => { cam(V_WIDE, () => { room(t, { pull: 0, noPoster: true }); board(); write('Follow for more of', 540, 560, R(t, s(16), .4), { size: 50 }); write('how it really works.', 540, 630, R(t, s(16) + .2, .4), { size: 50, col: ORANGE });
    write("A new 'wait, really?' every day.", 540, 720, R(t, s(16) + .4, .4), { size: 34, reg: true }); write('@howitreallyworkstudio', 540, 790, R(t, s(16) + .6, .4), { size: 32, col: TEALD });
    robot(820, 990, .5, t, { face: 'happy', armL: 2.6 + .3 * Math.sin(t * 6) }); }); }]);

// captions: Kalam on a cream tape strip, key words orange, centred at y 1300
function caption(ph, t, out) { if (!ph) return; const a = clamp((t - ph.start + .2) / .2) * (out != null ? clamp((out - t) / .2) : 1); if (a <= 0) return; g.save(); g.font = '700 50px "Kalam"';
  const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  ws.forEach(w => w.ww = g.measureText(w.w).width); const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; ws.forEach(w => { if (lw + w.ww > 820 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const lh = 64, y0 = 1300 - (lines.length - 1) * lh / 2, widest = Math.max(...lines.map(l => l.reduce((q, w) => q + w.ww, 0) + sp * (l.length - 1)));
  g.globalAlpha = a; g.save(); g.translate(540, 1300); g.rotate(-.008); blob(rrect(-widest / 2 - 34, -(lines.length * lh) / 2 - 16, widest + 68, lines.length * lh + 26, 12), 'rgba(251,245,230,.95)', { seed: 400, w: 3.5 }); g.restore();
  g.textBaseline = 'middle'; lines.forEach((ln, li) => { const w = ln.reduce((q, x) => q + x.ww, 0) + sp * (ln.length - 1); let x = 540 - w / 2; ln.forEach(wd => { g.fillStyle = wd.hl ? ORANGE : INK; g.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  g.restore(); }
function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(PAPER, 0, 0);
  let i = 0; SC.forEach((cc, k) => { if (t >= cc[0]) i = k; }); const u = R(t, SC[i][0], .4); g.save(); g.beginPath(); g.rect(0, 280, W, 870); g.clip();
  if (i > 0 && u < 1) { g.save(); SC[i - 1][1](t); g.restore(); g.save(); g.globalAlpha = ss(u); g.drawImage(PAPER, 0, 0); SC[i][1](t); g.restore(); } else SC[i][1](t);
  g.restore(); ink([[0, 280], [W, 280]], { w: 5, seed: 402 });
  g.save(); g.fillStyle = '#efe2c8'; g.globalAlpha = 1; g.fillRect(0, 1150, W, H - 1150); g.drawImage(PAPER, 0, 1150, W, H - 1150, 0, 1150, W, H - 1150); ink([[0, 1150], [W, 1150]], { w: 5, seed: 401 }); g.restore();
  const ph = PH.findLast(p => t >= p.start - .25); if (ph && ph.i < PH.length - 1) caption(ph, t, PH[ph.i + 1].start - .15); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .4; g.fillStyle = '#2b211c'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(PAPER, 0, 0); cam([600, 800, 1.35], () => { room(3, { pull: 1 }); robot(560, 840, 1, 3, { face: 'oh', armL: 2.6 }); phone(720, 1050, 80, 150, 1.57, { crack: 1, cx: .2, cy: -.25 }); });
  g.save(); g.fillStyle = '#efe2c8'; g.fillRect(0, 0, W, 290); g.restore(); write('Why did a short drop', 540, 160, 1, { size: 78 }); write('crack my screen?', 540, 250, 1, { size: 78, col: ORANGE }); };
window.seek(0); window.ready = true; window.READY = true;
