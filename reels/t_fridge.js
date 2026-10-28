// t_fridge.js: "How does a refrigerator keep food cold?" in template #3 blueprint (lemo-opuscar/styles/blueprint grammar, same module as lock).
// 1080x1920 Canvas2D, deterministic, pure function of t. Cyanotype sheet, white line work drafted on with a glowing nib, FIG labels struck through
// and rewritten, callouts with leaders, hatching, numbered balloons, a STATUS field that carries the story, one red stamp.
// Batch N layout: the kit's header, title block and NOTE box sit in the platform's UI bands, so this reel draws its own furniture:
// header text at y 282-330 (nothing in the top 250 px; top-right corner left for the EP badge), the figure viewport at y 360-1140,
// a double-ruled NOTE box at y 1158-1414 (text x 146-866), nothing written in the right column below y 840 or under y 1440.
import { createBP, W, H, VP, DASH, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/blueprint/blueprint.js';
await Promise.all(['700 40px "Caveat"', '600 20px "Poppins"', '800 40px "Poppins"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
VP.y = 380; VP.h = 760;   // Batch N viewport (below the ruled header block)
const B = createBP(document.getElementById('c')), g = B.g, R = ramp, TAU = Math.PI * 2;
// sepia (diazo) print instead of the kit's cyanotype, so this reel reads apart from the other blueprint reels: brown ink on cream stock
C.ink = '#4a2f1c'; C.paper = '#f1e3c4'; const COLD = '#2f6fb3', HOT = '#c8442b', WARM = '#b8862b';
const SEPIA = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#2a1d14'; x.fillRect(0, 0, W, H);
  x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 34; x.shadowOffsetY = 10; x.fillStyle = '#efe0bf'; x.fillRect(36, 36, W - 72, H - 72); x.restore();
  x.save(); x.beginPath(); x.rect(36, 36, W - 72, H - 72); x.clip(); const gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#f4e7c9'); gr.addColorStop(.6, '#ecdcb6'); gr.addColorStop(1, '#e6d2a6'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const px = hash(i * 1.3) * W, py = hash(i * 2.1) * H, r = 140 + hash(i * 3.7) * 360, rg = x.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, hash(i * 5.3) > .5 ? 'rgba(170,120,60,.05)' : 'rgba(255,250,235,.18)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2); }
  for (let i = 0; i < 1200; i++) { const px = hash(i * 1.7) * W, py = hash(i * 2.9) * H, a = hash(i * 4.1) * TAU, l = 5 + hash(i * 6.1) * 14; x.strokeStyle = `rgba(120,80,40,${.03 + hash(i * 8.3) * .05})`; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  x.strokeStyle = 'rgba(110,70,30,.08)'; for (let gx = 36; gx < W; gx += 54) { x.beginPath(); x.moveTo(gx, 36); x.lineTo(gx, H - 36); x.stroke(); } for (let gy = 36; gy < H; gy += 54) { x.beginPath(); x.moveTo(36, gy); x.lineTo(W - 36, gy); x.stroke(); }
  x.restore(); return c; })();
B.begin = () => { B.S.A = 1; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.setLineDash([]); g.drawImage(SEPIA, 0, 0); };
const tint = (pts, a) => { g.save(); g.globalAlpha = B.S.A * a; g.fillStyle = '#E7F0F9'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); };
const circPts = (cx, cy, rx, ry = rx, n = 48, a0 = 0, a1 = TAU) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function callout(txt, x, y, tx, ty, k, o = {}) { if (k <= .02) return; const size = o.size || 30, w = B.measure(txt, size, { font: 'Poppins', weight: 600 }) + 30, h = size * 1.4, lk = ss(clamp(k * 1.5)), by = y + (ty > y ? h / 2 : -h / 2);
  B.line(x, by, lerp(x, tx, lk), lerp(by, ty, lk), { w: 1.4, nib: false }); if (lk >= 1) { g.save(); g.globalAlpha = B.S.A; g.fillStyle = C.ink; g.beginPath(); g.arc(tx, ty, 4.5 * B.S.k, 0, 7); g.fill(); g.restore(); }
  B.paper(rectPts(x - w / 2, y - h / 2, w, h), .96); B.rect(x - w / 2, y - h / 2, w, h, { w: 1.6, nib: false, draw: clamp(k * 2) }); B.txt(txt, x, y + 2, { size, align: 'center', write: R(k, .3, .7), font: 'Poppins', weight: 600 }); }
// wavy heat arrow from (x0,y0) to (x1,y1)
function heat(x0, y0, x1, y1, k, t, o = {}) { if (k <= 0) return; o = { col: HOT, ...o }; const n = 24, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, P = [];
  for (let i = 0; i <= n; i++) { const u = i / n, w = Math.sin(u * TAU * 2.5 - t * 6) * 10 * Math.sin(u * Math.PI); P.push([x0 + dx * u + nx * w, y0 + dy * u + ny * w]); }
  B.poly(P, { w: o.w || 3, draw: k, nib: false, alpha: o.a ?? 1, col: o.col }); if (k >= 1) B.arrowhead(x1, y1, Math.atan2(dy, dx), { alpha: o.a ?? 1, col: o.col }); }
// zigzag coil between two points
function coil(x0, y0, x1, y1, n, amp, o = {}) { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, P = [[x0, y0]];
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, sd = i % 2 ? 1 : -1; P.push([x0 + dx * u + nx * amp * sd, y0 + dy * u + ny * amp * sd]); } P.push([x1, y1]); return P; }

// ---------- the refrigeration loop (FIG. 3): cabinet on the left, the back of the fridge on the right ----------
// loop: valve -> evaporator (inside, top) -> suction line down the left -> under -> compressor (bottom right) -> condenser up the back -> valve
const CAB = rectPts(210, 430, 380, 620), VALVE = [660, 470], COMP = [820, 1090];
const EVAP = coil(560, 470, 250, 470, 9, 22), CONDS = coil(820, 1010, 820, 560, 11, 26);
const LOOP = [[820, 470], [VALVE[0] + 22, 470], [VALVE[0] - 22, 470], [580, 470], ...EVAP, [160, 470], [160, 1090], [COMP[0] - 55, 1090], [COMP[0], 1090], [820, 1040], ...CONDS, [820, 470]];
const LOOPL = (() => { let a = 0; return LOOP.map((p, i) => i ? (a += Math.hypot(p[0] - LOOP[i - 1][0], p[1] - LOOP[i - 1][1])) : 0); })();
function onLoop(u) { const d = LOOPL[LOOPL.length - 1] * (((u % 1) + 1) % 1); for (let i = 1; i < LOOP.length; i++) if (d <= LOOPL[i]) { const v = (d - LOOPL[i - 1]) / (LOOPL[i] - LOOPL[i - 1] || 1); return [lerp(LOOP[i - 1][0], LOOP[i][0], v), lerp(LOOP[i - 1][1], LOOP[i][1], v), i]; } return [...LOOP[0], 0]; }
// which part of the loop a point index is in: 0 cold liquid->boiling (evap), 1 cold gas (suction), 2 hot gas (after compressor), 3 liquid (after condenser)
const EV0 = 4, EV1 = 4 + EVAP.length, CO0 = EV1 + 5, CO1 = CO0 + CONDS.length;
function food(k) { [[250, 900, 110, 140], [380, 940, 90, 100], [490, 880, 70, 160]].forEach(([x, y, w, h], i) => { const r = rectPts(x, y, w, h); B.paper(r, .95); B.hatch(r, { sp: 10, alpha: .35, draw: R(k, i * .1, .5) }); B.poly(r, { w: 2.2, close: true, draw: R(k, i * .1, .6), nib: false }); }); }
function loopFig(t, k, o = {}) {
  B.poly(CAB, { w: 2.6, close: true, draw: R(k, 0, .4), dash: DASH.phantom }); B.line(590, 430, 590, 1050, { w: 3, draw: R(k, 0, .4) });   // cabinet (phantom), back wall
  B.txt('INSIDE', 230, 410, { size: 26, font: 'Poppins', weight: 600, alpha: .7, write: R(k, .2, .4) }); B.txt('BACK', 640, 410, { size: 26, font: 'Poppins', weight: 600, alpha: .7, write: R(k, .2, .4) });
  food(R(k, .2, .6));
  B.poly(LOOP, { w: 3.2, draw: R(k, .2, .8) });
  if (o.flow > 0) { const mid = CO0 + Math.floor(CONDS.length / 2), segs = [[LOOP.slice(2, EV1 + 4), COLD], [LOOP.slice(EV1 + 3, mid + 1), HOT], [LOOP.slice(mid, CO1 + 1).concat(LOOP.slice(0, 3)), WARM]];
    segs.forEach(([pts, col]) => { g.save(); g.globalAlpha = B.S.A * o.flow * .9; g.strokeStyle = col; g.lineWidth = 9 * B.S.k; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
      g.globalAlpha = B.S.A * o.flow; g.strokeStyle = '#fff6e4'; g.lineWidth = 3 * B.S.k; g.setLineDash([16, 26]); g.lineDashOffset = -t * 90; g.stroke(); g.restore(); }); }
  // compressor: hatched dome on a base
  const dome = circPts(COMP[0], COMP[1] - 10, 62, 52, 36, Math.PI, TAU); const cb = [...dome, [COMP[0] + 62, COMP[1] + 30], [COMP[0] - 62, COMP[1] + 30]]; B.paper(cb, .95); B.hatch(cb, { sp: 9, alpha: .5, draw: R(k, .5, .5) }); B.poly(cb, { w: 2.6, close: true, draw: R(k, .5, .5) });
  // expansion valve: bow-tie
  const v = [[VALVE[0] - 22, 452], [VALVE[0] + 22, 488], [VALVE[0] + 22, 452], [VALVE[0] - 22, 488]]; B.paper(v, .95); B.poly(v, { w: 2.6, close: true, draw: R(k, .6, .4), nib: false });
  // refrigerant: dots moving round; spacing tight where liquid, loose where gas
  if (o.flow > 0) for (let i = 0; i < 26; i++) { const [x, y, si] = onLoop(t * .07 + i / 26), gas = (si >= EV0 + 3 && si < CO0 + 6); const mid = CO0 + Math.floor(CONDS.length / 2), dc = si >= 3 && si <= EV1 + 3 ? COLD : si > EV1 + 3 && si <= mid ? HOT : WARM; g.save(); g.globalAlpha = B.S.A * o.flow; g.fillStyle = dc; g.beginPath(); g.arc(x, y, gas ? 7 : 10, 0, TAU); g.fill();
    if (si >= EV1 && si < CO1) { g.globalAlpha = B.S.A * o.flow * .35; g.beginPath(); g.arc(x, y, 16, 0, TAU); g.fill(); } g.restore(); }
  if (o.heatIn > 0) for (let i = 0; i < 3; i++) heat(290 + i * 110, 870, 300 + i * 110, 540, o.heatIn, t + i);
  if (o.heatOut > 0) for (let i = 0; i < 4; i++) heat(860, 620 + i * 110, 990, 600 + i * 110, o.heatOut, t + i * .7); }

// ---------- figures ----------
function fridgeFront(x, y, sc, k, o = {}) { g.save(); g.translate(x, y); g.scale(sc, sc); const body = rectPts(-190, 0, 380, 640); B.paper(body, .95); B.poly(body, { w: 3, close: true, draw: k });
  B.line(-190, 220, 190, 220, { w: 2.4, draw: R(k, .3, .4) }); B.line(150, 70, 150, 170, { w: 6, draw: R(k, .5, .3), nib: false }); B.line(150, 280, 150, 420, { w: 6, draw: R(k, .5, .3), nib: false });
  B.rect(-150, 650, 300, 18, { w: 2, draw: R(k, .4, .3), nib: false }); g.restore(); }
const FIGS = [[0, 'FIG. 1', 'ELEVATION'], [s(1) - .2, 'FIG. 1', 'THE QUESTION'], [s(2) - .2, 'FIG. 2', 'COLD = LESS HEAT'], [s(3) - .2, 'FIG. 3', 'THE LOOP'], [s(4) - .2, 'FIG. 3A', 'EVAPORATOR'], [s(6) - .2, 'FIG. 3B', 'COMPRESSOR'],
  [s(8) - .2, 'FIG. 3C', 'CONDENSER COILS'], [s(10) - .2, 'FIG. 3D', 'EXPANSION VALVE'], [s(11) - .2, 'FIG. 3', 'FULL LOOP'], [s(12) - .2, 'FIG. 4', 'REAR VIEW'], [s(13) - .2, 'FIG. 5', 'DOOR OPEN'], [s(14) - .2, 'FIG. 6', 'SAME TRICK'], [s(15) - .2, 'SPEC', '']];
const segOf = t => { let i = 0; FIGS.forEach((f, k) => { if (t >= f[0]) i = k; }); return i; };
function figure(t) { const i = segOf(t);
  if (i === 0) { // hook: fridge, heat pouring out of the back; MAKES COLD struck, MOVES HEAT
    B.camBegin(540, 760, 1); fridgeFront(470, 560, .78, 1); for (let j = 0; j < 4; j++) heat(640, 640 + j * 100, 900, 600 + j * 100, 1, t + j * .6);
    for (let j = 0; j < 3; j++) { const ph = (t * .5 + j / 3) % 1; g.save(); g.globalAlpha = .8 * (1 - ph); g.fillStyle = HOT; g.beginPath(); g.arc(lerp(470, 900, ph), lerp(800, 700, ph) + Math.sin(ph * 9) * 20, 8, 0, TAU); g.fill(); g.restore(); }
    B.txt('MAKES COLD', 330, 440, { size: 64, align: 'center', font: 'Poppins', weight: 800 }); B.line(110, 440, lerp(110, 550, R(t, .4, .5)), 440, { w: 7, nib: false });
    B.txt('MOVES HEAT', 330, 1090, { size: 64, align: 'center', font: 'Poppins', weight: 800, write: t < .05 ? 1 : R(t, .9, .7) }); callout('HEAT OUT', 760, 520, 820, 620, 1, { size: 30 }); B.camEnd(); return; }
  if (i === 1) { // the question: the fridge, and a "?" over the coils on the back
    B.camBegin(540, 760, 1); fridgeFront(540, 470, .9, 1); B.txt('?', 540, 690, { size: 220, align: 'center', write: R(t, s(1) + .3, .4) }); B.camEnd(); return; }
  if (i === 2) { // cold = less heat: heat dots leave the box through the wall
    B.camBegin(540, 760, 1); const bx = rectPts(220, 480, 440, 560); B.paper(bx, .95); B.poly(bx, { w: 3, close: true, draw: R(t, s(2) - .2, .6) }); food(R(t, s(2), .8));
    const out = ss(R(t, s(2) + 2.0, 2.2)); for (let j = 0; j < 18; j++) { const hx = 260 + hash(j) * 360, hy = 520 + hash(j * 3.3) * 480, u = clamp(out * 1.6 - hash(j * 7) * .6), x = lerp(hx, 900, u), y = lerp(hy, 560 + hash(j * 5) * 300, u);
      g.save(); g.globalAlpha = .9; g.fillStyle = HOT; g.beginPath(); g.arc(x + Math.sin(t * 5 + j) * 4, y, 7, 0, TAU); g.fill(); g.restore(); }
    B.txt('HEAT', 440, 440, { size: 44, align: 'center', font: 'Poppins', weight: 600, write: R(t, s(2) + .3, .5) }); heat(680, 760, 940, 760, R(t, s(2) + 2.0, .8), t, { w: 3.4 });
    B.txt(out > .6 ? 'LESS HEAT = COLD' : 'COLD = LESS HEAT', 440, 1100, { size: 52, align: 'center', font: 'Poppins', weight: 800, write: R(t, s(2) + .5, .8) }); B.camEnd(); return; }
  // FIG 3 and its close-ups: camera moves round the loop
  if (i >= 3 && i <= 8) { const cams = { 3: [520, 760, 1], 4: [400, 580, 1.5], 5: [740, 960, 1.45], 6: [760, 760, 1.2], 7: [640, 520, 1.9], 8: [520, 760, 1] };
    const prev = { 3: 3, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 }[i], f0 = FIGS[i][0], u = ss(R(t, f0, 1.1)), c0 = cams[prev], c1 = cams[i];
    const cm = c0.map((v, j) => lerp(v, c1[j], u));
    const t3 = s(3) - .2; B.camBegin(cm[0], cm[1], cm[2]); loopFig(t, t < s(4) - .2 ? R(t, t3, 3.2) : 1, { flow: R(t, s(3) + 2.0, .8), heatIn: t > s(5) ? R(t, s(5) + .4, .8) : 0, heatOut: t > s(8) ? R(t, s(8) + .5, .8) : 0 });
    if (i === 3) { B.balloon(1, 400, 380 + 30, 420, 470, R(t, s(3) + 2.4, .4)); B.balloon(2, 700, 1000, COMP[0] - 40, COMP[1] - 30, R(t, s(3) + 2.7, .4)); B.balloon(3, 960, 820, 846, 820, R(t, s(3) + 3.0, .4)); B.balloon(4, 660, 380 + 30, VALVE[0], 452, R(t, s(3) + 3.3, .4)); callout('REFRIGERANT', 390, 720, 160, 760, R(t, s(3) + 1.0, .5)); }
    if (i === 4) { callout('COLD · LOW PRESSURE', 400, 400 + 20, 460, 470, R(t, s(4) + .4, .5), { size: 26 }); callout('BOILS INTO A GAS', 400, 660, 330, 500, R(t, s(4) + 2.4, .5), { size: 26 }); if (t > s(5)) callout('SOAKS UP HEAT', 420, 760, 380, 640, R(t, s(5) + .3, .5), { size: 28 }); }
    if (i === 5) { const sq = .5 + .5 * Math.sin(t * 8); g.save(); g.globalAlpha = .5 * R(t, s(6) + .6, .4); for (let j = 0; j < 3; j++) B.circ(COMP[0], COMP[1] - 20, 80 + j * 22 + sq * 6, { w: 1.4, nib: false, draw: 1 }); g.restore();
      callout('SQUEEZES THE GAS', 690, 900, COMP[0] - 20, COMP[1] - 50, R(t, s(6) + .4, .5), { size: 26 }); if (t > s(7)) callout('HOT · HIGH PRESSURE', 700, 1010, 820, 1000, R(t, s(7) + .2, .5), { size: 24 }); }
    if (i === 6) { callout('HEAT OUT TO THE ROOM', 640, 560, 840, 640, R(t, s(8) + .8, .5), { size: 26 }); if (t > s(9)) callout('BACK TO LIQUID', 640, 980, 820, 940, R(t, s(9) + .2, .5), { size: 26 }); }
    if (i === 7) { callout('TINY GAP', 560, 400 + 20, VALVE[0] - 10, 455, R(t, s(10) + .4, .5), { size: 22 }); callout('EXPANDS · COLD AGAIN', 520, 560, 560, 478, R(t, s(10) + 2.0, .5), { size: 22 }); }
    if (i === 8) { callout('HEAT IN', 380, 690, 360, 600, R(t, s(11) + .4, .5), { size: 28 }); callout('HEAT OUT', 700, 560, 870, 620, R(t, s(11) + 1.6, .5), { size: 28 }); }
    B.camEnd(); if (i === 8) B.stamp('MOVES HEAT', 540, 1060, R(t, s(11) + 2.2, .45), { size: 60, rot: -.1 }); return; }
  if (i === 9) { // rear view: the coil grid, warm
    B.camBegin(540, 760, 1); const k = R(t, s(12) - .2, 1); const fr = rectPts(260, 420, 560, 680); B.paper(fr, .95); B.poly(fr, { w: 3, close: true, draw: k });
    for (let j = 0; j < 9; j++) B.line(300, 480 + j * 62, 780, 480 + j * 62, { w: 2.2, draw: R(k, .2 + j * .04, .4), nib: false }); for (let j = 0; j < 8; j++) { const y = 480 + j * 62; B.poly(circPts(j % 2 ? 300 : 780, y + 31, 31, 31, 16, j % 2 ? Math.PI / 2 : -Math.PI / 2, j % 2 ? Math.PI * 1.5 : Math.PI / 2), { w: 2.2, draw: R(k, .4, .4), nib: false }); }
    for (let j = 0; j < 6; j++) { const x0 = 330 + j * 80, wv = []; for (let q = 0; q <= 12; q++) wv.push([x0 + Math.sin(q * .9 + t * 6 + j) * 10, 400 - q * 14 - ((t * 40) % 14)]); B.poly(wv, { w: 2, alpha: R(t, s(12) + .5, .6), nib: false }); }
    callout('WARM: YOUR FOOD\'S HEAT', 540, 1100, 540, 980, R(t, s(12) + 1.4, .5), { size: 30 }); B.camEnd(); return; }
  if (i === 10) { // door open: the heat just goes round in a circle
    B.camBegin(540, 760, 1); const k = R(t, s(13) - .2, .9); const fr = rectPts(380, 520, 320, 520); B.paper(fr, .95); B.poly(fr, { w: 3, close: true, draw: k }); const sw = ss(R(t, s(13) + .1, .9)), dx = lerp(0, -130, sw), dy = lerp(0, 80, sw); const door = [[380, 520], [380 + dx, 520 + dy], [380 + dx, 1040 - dy], [380, 1040]]; B.paper(door, .9); B.poly(door, { w: 2.8, close: true, draw: R(k, .3, .5) });
    const ringP = circPts(540, 780, 400, 300, 60, -Math.PI * .9, Math.PI * .7); if (t > s(13) + 3.0) for (let j = 0; j < 10; j++) { const u = ((t - s(13)) * .22 + j / 10) % 1, q = ringP[Math.floor(u * (ringP.length - 1))]; g.save(); g.globalAlpha = .9; g.fillStyle = HOT; g.beginPath(); g.arc(q[0], q[1], 11, 0, TAU); g.fill(); g.restore(); }
    const ring = circPts(540, 780, 400, 300, 60, -Math.PI * .9, Math.PI * .7); B.poly(ring, { w: 3, draw: R(t, s(13) + 1.4, 1.6), dash: [16, 10] }); if (R(t, s(13) + 1.4, 1.6) >= 1) B.arrowhead(ring[ring.length - 1][0], ring[ring.length - 1][1], Math.PI * .7 + Math.PI / 2);
    heat(170, 780, 360, 780, R(t, s(13) + .6, .6), t); heat(720, 780, 900, 780, R(t, s(13) + 2.4, .6), t);
    B.txt('IN THE FRONT', 300, 470, { size: 34, align: 'center', font: 'Poppins', weight: 600, write: R(t, s(13) + .8, .5) }); B.txt('OUT THE BACK', 720, 470, { size: 34, align: 'center', font: 'Poppins', weight: 600, write: R(t, s(13) + 2.6, .5) });
    B.txt('KITCHEN: NO COOLER', 540, 1110, { size: 46, align: 'center', write: R(t, s(13) + 3.4, .6) }); B.camEnd(); return; }
  if (i === 11) { // same trick: a house with an air conditioner
    B.camBegin(540, 760, 1); const k = R(t, s(14) - .2, 1); const hs = [[220, 700], [520, 470], [820, 700], [820, 1090], [220, 1090]]; B.paper(hs, .95); B.poly(hs, { w: 3, close: true, draw: k });
    const ac = rectPts(840, 900, 140, 120); B.paper(ac, .95); B.hatch(ac, { sp: 10, alpha: .45, draw: R(k, .5, .4) }); B.poly(ac, { w: 2.4, close: true, draw: R(k, .4, .4) }); B.circ(910, 960, 40, { w: 2, draw: R(k, .5, .4), nib: false });
    heat(500, 900, 820, 940, R(t, s(14) + .6, .7), t); B.txt('AIR CONDITIONER', 520, 420, { size: 40, align: 'center', font: 'Poppins', weight: 600, write: R(t, s(14) + .3, .6) }); B.txt('SAME LOOP', 520, 820, { size: 56, align: 'center', write: R(t, s(14) + 1.2, .6) }); B.camEnd(); return; }
  // question + end card
  B.camBegin(540, 760, 1); const q = 1 - R(t, s(16) - .3, .3);
  if (q > 0) { B.alpha(q); B.txt('FELT THE WARM AIR', 540, 470, { size: 58, align: 'center', font: 'Poppins', weight: 800, write: R(t, s(15) - .1, .6) }); B.txt('BEHIND YOUR FRIDGE?', 540, 550, { size: 58, align: 'center', font: 'Poppins', weight: 800, write: R(t, s(15) + .3, .6) });
    [['YES', 330], ['NO', 750]].forEach(([w, x], j) => { const kk = R(t, s(15) + .8 + j * .3, .4); B.rect(x - 140, 700, 280, 130, { w: 3, draw: kk, nib: false }); B.rect(x - 130, 710, 260, 110, { w: 1.3, draw: kk, nib: false }); B.txt(w, x, 768, { size: 70, align: 'center', font: 'Poppins', weight: 800, write: R(kk, .4, .6) }); });
    fridgeFront(540, 900, .28, R(t, s(15) + .4, .8)); B.alpha(1); }
  B.camEnd();
  if (t > s(16) - .3) { const k = R(t, s(16) - .3, .6), bx = 130, by = 470, bw = 820, bh = 420; g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(244,232,206,.96)'; g.fillRect(bx, by, bw, bh); g.restore(); B.rect(bx, by, bw, bh, { w: 3, draw: k, nib: false }); B.rect(bx + 9, by + 9, bw - 18, bh - 18, { w: 1.3, draw: k, nib: false });
    B.txt('Follow for more of', 540, by + 90, { size: 64, align: 'center', write: R(t, s(16), .6) }); B.txt('how it really works.', 540, by + 170, { size: 72, align: 'center', write: R(t, s(16) + .3, .7) }); B.line(230, by + 225, 850, by + 225, { w: 2, draw: R(t, s(16) + .9, .5), nib: false });
    B.txt("A new 'wait, really?' every day.", 540, by + 285, { size: 46, align: 'center', write: R(t, s(16) + 1.0, .6) }); B.txt('@howitreallyworkstudio', 540, by + 355, { size: 32, font: 'Poppins', weight: 600, align: 'center', ls: 2, write: R(t, s(16) + 1.2, .6) });
    B.camBegin(540, 760, 1); fridgeFront(540, 940, .26, R(t, s(16) + .8, .8)); B.camEnd(); } }

// ---------- furniture (Batch N) ----------
function header(t) { const i = segOf(t), f = FIGS[i], old = i > 0 ? FIGS[i - 1] : null, fk = old ? R(t, f[0], .9) : 1, lab = x => x[1] + (x[2] ? '  ·  ' + x[2] : '');
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 3.2; g.strokeRect(60, 60, W - 120, H - 120); g.lineWidth = 1.2; g.strokeRect(70, 70, W - 140, H - 140); g.lineWidth = 1.4; g.globalAlpha = .9; g.strokeRect(VP.x + 8, VP.y, VP.w - 16, VP.h); g.restore();
  // ruled title block: row 1 (x 90-640, under the badge-free zone) drawing number + subject, row 2 full width: figure + status
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.strokeRect(90, 268, 550, 48); g.strokeRect(90, 324, 900, 46); g.lineWidth = 1.2; g.beginPath(); g.moveTo(250, 268); g.lineTo(250, 316); g.moveTo(640, 324); g.lineTo(640, 370); g.stroke(); g.restore();
  B.txt('DWG FR-66', 104, 293, { size: 20, font: 'Poppins', weight: 600, ls: 2 }); B.txt('HOW IT REALLY WORKS', 264, 293, { size: 19, font: 'Poppins', weight: 600, ls: 2, alpha: .85 });
  if (old && fk < 1) { B.txt(lab(old), 104, 348, { size: 32, alpha: 1 - ss(fk * 2) }); B.line(100, 348, 100 + B.measure(lab(old), 32) + 8, 348, { w: 3, draw: ramp(fk, 0, .35), nib: false }); }
  B.txt(lab(f), 104, 348, { size: 32, write: old ? ramp(fk, .35, .65) : 1 });
  const status = t < s(2) ? 'MAKES COLD?' : t < s(3) ? 'MOVES HEAT' : t < s(11) ? 'PUMPING HEAT' : t < s(15) ? 'HEAT OUT BACK' : 'MOVES HEAT';
  B.txt('STATUS', 654, 348, { size: 16, font: 'Poppins', weight: 600, ls: 2, alpha: .7 }); B.txt(status, 976, 348, { size: 22, font: 'Poppins', weight: 600, align: 'right', ls: 2, col: status === 'MAKES COLD?' ? C.ink : HOT }); }
function note(n, cap, tSince) { const x = 110, y = 1158, w = 860, h = 256, size = 46; g.save(); g.globalAlpha = clamp(tSince / .15); g.fillStyle = 'rgba(244,232,206,.94)'; g.fillRect(x, y, w, h); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.strokeRect(x, y, w, h); g.lineWidth = 1; g.strokeRect(x + 7, y + 7, w - 14, h - 14); g.restore();
  B.txt('NOTE', x + 24, y + 28, { size: 17, font: 'Poppins', weight: 600, alpha: .8, ls: 3 }); B.txt(String(n).padStart(2, '0'), x + 92, y + 28, { size: 22, font: 'Poppins', weight: 600 });
  const toks = []; cap.split('**').forEach((sg, k) => sg.split(' ').filter(Boolean).forEach(wd => toks.push({ w: wd, b: k % 2 === 1 }))); const sp = B.measure(' ', size), maxW = 720; const lines = [[]]; let acc = 0;
  toks.forEach(tk => { const ww = B.measure(tk.w, size); if (acc + ww > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0; } lines[lines.length - 1].push({ ...tk, ww }); acc += ww + sp; });
  const lh = size * 1.12, ty = y + 56 + (h - 56 - lines.length * lh) / 2 + lh / 2; const total = toks.length; let idx = 0;
  lines.forEach((l, li) => { const lw = l.reduce((a, tk) => a + tk.ww, 0) + sp * (l.length - 1); let xx = x + w / 2 - lw / 2; l.forEach(tk => { const wk = clamp((tSince - .05) / .4 * total - idx); idx++; if (wk > 0) { B.txt(tk.w, xx, ty + li * lh, { size, write: wk }); if (tk.b && wk >= 1) B.line(xx, ty + li * lh + size * .42, xx + tk.ww, ty + li * lh + size * .42, { w: 1.6, nib: false, alpha: .9 }); } xx += tk.ww + sp; }); }); }
function scene(t) { B.begin(); header(t); figure(t); let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .1) ci = k; }); if (ci >= 0 && t < s(16) - .3) note(ci + 1, PH[ci].cap, t - PH[ci].start + .1); }
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.save(); g.globalAlpha = (1 - fade) * .4; g.fillStyle = '#0D1116'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { B.begin(); header(0); B.camBegin(540, 760, 1); fridgeFront(470, 640, .7, 1); for (let j = 0; j < 4; j++) heat(620, 700 + j * 90, 900, 660 + j * 90, 1, j * .6); B.camEnd();
  g.save(); g.fillStyle = 'rgba(244,232,206,.92)'; g.fillRect(90, 380, 900, 240); g.restore(); B.txt('YOUR FRIDGE', 540, 450, { size: 100, align: 'center', font: 'Poppins', weight: 800 }); B.txt('MOVES HEAT', 540, 560, { size: 100, align: 'center', font: 'Poppins', weight: 800 });
  B.stamp('NOT COLD', 640, 1200, 1, { size: 80, rot: -.12 }); };
window.seek(0); window.ready = true; window.READY = true;
