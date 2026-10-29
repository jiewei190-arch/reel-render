// t_lemonade.js: "Two lemonade stands in a price war" (prisoner's dilemma) in the story-fable look (template #30), H4.
// Every cut, flip, grade change and caption is driven from the voice timeline (tl_lemonade.js), so re-voicing never breaks sync.
import * as F from './styles/storyfable/fable.js';
const { W, H, PAL, INK, TAU, clamp, lerp, seg, ss, ease, backOut, hash } = F;
const g = F.init(document.getElementById('c'));
const TL = window.TL, P = TL.p, T = i => P[i].start, E = i => P[i].end, TOT = TL.total;
const CH = F.chunks(P);

// ---------- cast ----------
const RED = { body: PAL.red, bodyDark: PAL.redDark, apron: '#f4e7cc', hat: 'cap', hatCol: PAL.redDark, stache: true };
const TEAL = { body: PAL.teal, bodyDark: PAL.tealDark, apron: '#f4e7cc', hat: 'bucket', hatCol: PAL.tealDark, goatee: true };
const CUST = [['#c98d4a', '#9a6634'], ['#8f7bb8', '#6a5890'], ['#e0b84a', '#b38d2a'], ['#7f9cc0', '#5c7a9e'], ['#b5835e', '#8a5f3e'], ['#9cb06a', '#76884a'], ['#d68fa0', '#a86676']];
const K = 1.55;                    // character scale: ~160 cm adults
const person = (o, extra = {}) => (c, s) => F.figure(c, s * K, { ...o, ...extra });
const PERSON = { rim: true, shadow: true, h: 165, w: 90, sw: 50 };

// ---------- world layout (street set) ----------
const RX = -118, TX = 118, OZ = 600;          // owners stand at the track edge
const RSX = -275, TSX = 275, SZ = 640;        // their stands, just outside them
const BX = 0, BZ = 1550;                      // the price board (open/close prop)

// prices over time (cents), with flip timing
function prices(t) { let red = 100, teal = 100, rp = 100, tp = 100, rk = 1, tk = 1;
  const ev = [[T(7) + .15, 'r', 90], [T(11) + .35, 't', 80], [T(12) + .35, 'r', 70], [T(13) + .5, 't', 65], [T(14) + .05, 'b', 60], [T(14) + .55, 'b', 50], [T(14) + 1.05, 'b', 40], [T(15) + 1.0, 'b', 30], [T(30) + .2, 'b', 100]];
  for (const [at, who, v] of ev) { if (t < at) break; const k = clamp((t - at) / .35);
    if (who !== 't') { rp = red; red = v; rk = k; } if (who !== 'r') { tp = teal; teal = v; tk = k; } }
  return { red, teal, rp, tp, rk, tk }; }

// customers: queue mode by time
const NC = 16;
function customers(t, mode) { const out = [];
  for (let i = 0; i < NC; i++) { const red = i % 2 === 0, q = i >> 1; let X, Z, walk = -1, turn = 0, hold = null;
    const rq = n => [-196 - (n % 2) * 34, 900 + n * 135], tq = n => [196 + (n % 2) * 34, 900 + n * 135];    // queues outside the owners, like the reference's armies
    if (mode === 'split' || mode === 'calm') { [X, Z] = red ? rq(q) : tq(q); turn = red ? -.5 : .5; }
    else if (mode === 'toRed') { const k = ss(seg(t, T(8) + .1 + q * .18, T(8) + 1.9 + q * .18)); const [ax, az] = red ? rq(q) : tq(q), [bx, bz] = rq(red ? q * 2 : q * 2 + 1); X = lerp(ax, bx, k); Z = lerp(az, bz, k); if (k > 0 && k < 1) walk = t * 1.6 + i; turn = -.5; }
    else if (mode === 'crowd') { const a = hash(i * 4.1) * TAU; X = (hash(i * 2.3) - .5) * 300; Z = 760 + hash(i * 5.7) * 1100 + Math.sin(t * .6 + a) * 30; X += Math.sin(t * .5 + a) * 40; turn = Math.sin(t * .8 + i) * .6; hold = 'cup'; }
    out.push({ X, Z, walk, turn, hold, col: CUST[i % CUST.length], seed: i * 1.7, happy: mode === 'crowd' }); }
  return out; }

// the whole street set (puts everything; the shot sets the camera first)
function streetSet(t, o = {}) { F.begin(); const c0 = F.drawGround.bind(null);
  F.drawGround(c => { F.sky(c, o.sky || {}); const px = -F.cam.x * .08;
    for (const [x, y, s, sd] of [[180, 300, 1.1, 1], [760, 210, .9, 2], [520, 470, 1.35, 3], [960, 420, .8, 4], [80, 560, .7, 5], [700, 640, .6, 6]]) F.cloud(c, x + px + ((t * 6 * s) % 80), y * (F.cam.hor / 840), s, sd, o.cloud || {});
    F.hills(c, o.hills || {}); F.fields(c, -1); F.fields(c, 1); F.street(c); });
  const pr = prices(t);
  // trees and fence posts along the street, receding to the vanishing point
  for (const [Z] of [[1100], [2400]]) for (const X of [-330, 330]) F.put(X, Z, (c, s) => { c.save(); c.scale(s, s); c.fillStyle = PAL.woodDark; c.strokeStyle = INK; c.lineWidth = 2.4; c.fillRect(-5, -340, 10, 340); c.strokeRect(-5, -340, 10, 340); c.restore(); }, { shadow: true, h: 340, sw: 12 });
  for (let i = 0; i < 9; i++) { const Z = 1900 + i * 900; F.put(-760 - hash(i) * 200, Z, (c, s) => F.tree(c, s * 1.2, i), { h: 330 }); F.put(760 + hash(i + 3) * 200, Z + 450, (c, s) => F.tree(c, s * 1.15, i + 7), { h: 330 }); }
  if (o.bigTree) F.put(TSX + 120, SZ + 260, (c, s) => F.tree(c, s * 2.1, 11, { dark: '#3f7a32', light: '#69a646' }), { h: 600, shadow: true, sw: 240 });
  // dressing: bunting across the street in both colours, lemon crates, flower clumps on the verges
  Q_extra(t);
  // the price board in the middle
  F.put(BX, BZ, (c, s) => F.board(c, s, { red: pr.red, redPrev: pr.rp, redFlip: pr.rk, teal: pr.teal, tealPrev: pr.tp, tealFlip: pr.tk }), { shadow: true, rim: true, h: 310, w: 240, sw: 200 });
  // owners behind their stands (slightly farther than the counter)
  const rex = o.redExpr || 'neutral', tex = o.tealExpr || 'neutral';
  F.put(RX, OZ, person(RED, { t, seed: 1, expr: rex, turn: o.redTurn ?? .4, look: o.redLook ?? .5, armF: o.redArm ?? 150, bendF: -30, hold: o.redHold ?? 'cup', talk: o.redTalk || 0, sweat: o.redSweat, hat: o.redHat || RED.hat }), PERSON);
  F.put(TX, OZ, person(TEAL, { t, seed: 2, expr: tex, turn: o.tealTurn ?? -.4, look: o.tealLook ?? -.5, armF: o.tealArm ?? 150, bendF: -30, hold: o.tealHold ?? 'cup', talk: o.tealTalk || 0, sweat: o.tealSweat }), PERSON);
  F.put(RSX, SZ, (c, s) => F.stand(c, s * 1.05, { col: PAL.red, dark: PAL.redDark, price: pr.red, prev: pr.rp, flip: pr.rk, side: -.8, label: o.redLabel, pcs: 1.2 }), { shadow: true, rim: true, h: 200, w: 240, sw: 210 });
  F.put(TSX, SZ, (c, s) => F.stand(c, s * 1.05, { col: PAL.teal, dark: PAL.tealDark, price: pr.teal, prev: pr.tp, flip: pr.tk, side: .8, pcs: 1.2 }), { shadow: true, rim: true, h: 200, w: 240, sw: 210 });
  // customers
  if (o.crowd) for (const q of customers(t, o.crowd)) F.put(q.X, q.Z, person({ body: q.col[0], bodyDark: q.col[1], hat: 'none' }, { t, seed: q.seed, walk: q.walk, turn: q.turn, expr: q.happy ? 'happy' : 'neutral', hold: q.hold, armF: q.hold ? 150 : 185, bendF: q.hold ? -40 : 10 }), PERSON);
  // foreground dressing: tufts near the camera, blurred
  for (let i = 0; i < 10; i++) { const Z = F.cam.z + 120 + i * 70, X = F.cam.x + (i % 2 ? 1 : -1) * (200 + hash(i * 3) * 260); F.put(X, Z, (c, s) => F.tuft(c, s * 1.6, i + 1), { layer: Z - F.cam.z < F.cam.focus * .55 ? 'near' : undefined }); }
  if (o.extra) o.extra();
  F.flush(); F.SUN.a = .26; if (!o.sky) F.rays(g, t, .09); }

function Q_extra(t) { for (const [Z, k] of [[1100, 0], [2400, 1]]) F.put(0, Z + 1, c => { c.setTransform(1, 0, 0, 1, 0, 0); F.bunting(c, [-330, 330, Z], [330, 330, Z], k ? [PAL.teal, PAL.red, '#f3cf3a'] : [PAL.red, PAL.teal, '#fbf3df'], t); }, {});
  for (const [X, Z] of [[-275, 700], [275, 700]]) F.put(X + (X < 0 ? -40 : 40), Z - 90, (c, s) => F.crate(c, s * 1.1), { shadow: true, rim: true, h: 50, w: 90, sw: 70 });
  for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, Z = 800 + i * 380; F.put(side * (330 + hash(i * 7) * 120), Z, (c, s) => F.flowers(c, s * 1.4, i + 2), {}); } }
// ---------- blueprint desk set (night, candle) ----------
const BP = document.createElement('canvas'); BP.width = 1000; BP.height = 1400; const bp = BP.getContext('2d');
function blueprint(t, page) { const c = bp; c.setTransform(1, 0, 0, 1, 0, 0);
  const gr = c.createLinearGradient(0, 0, 1000, 1400); gr.addColorStop(0, '#2f6fc4'); gr.addColorStop(1, '#1f4f9e'); c.fillStyle = gr; c.fillRect(0, 0, 1000, 1400);
  c.strokeStyle = 'rgba(200,225,255,.16)'; c.lineWidth = 1.5; for (let x = 0; x <= 1000; x += 50) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1400); c.stroke(); } for (let y = 0; y <= 1400; y += 50) { c.beginPath(); c.moveTo(0, y); c.lineTo(1000, y); c.stroke(); }
  c.strokeStyle = 'rgba(225,240,255,.85)'; c.lineWidth = 4; c.strokeRect(30, 30, 940, 1340);
  return c; }
// pen-drawn line: draws a path progressively; returns the pen tip
function drawOn(c, pts, k) { if (k <= 0) return null; let tot = 0; const L = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = tot * clamp(k), tip = pts[0]; c.beginPath(); c.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) { if (left <= 0) break; const f = Math.min(1, left / L[i - 1]); tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; c.lineTo(...tip); left -= L[i - 1]; } c.stroke(); return k < 1 ? tip : null; }
function label(c, txt, x, y, k, o = {}) { if (k <= 0) return; c.save(); c.globalAlpha = clamp(k * 2); c.translate(x, y); const sc = .7 + .3 * backOut(clamp(k)); c.scale(sc, sc); c.font = `${o.w || 700} ${o.size || 44}px ${o.font || 'Cinzel'}`; c.fillStyle = o.col || '#eaf3ff'; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 0); c.restore(); }
function stamp(c, txt, x, y, k, o = {}) { if (k <= 0) return; const sc = lerp(2.2, 1, ss(clamp(k * 1.6))); c.save(); c.globalAlpha = clamp(k * 3) * .92; c.translate(x, y); c.rotate(o.rot ?? -.12); c.scale(sc, sc);
  c.font = `700 ${o.size || 70}px Cinzel`; const w = c.measureText(txt).width + 50; c.strokeStyle = '#d8392b'; c.lineWidth = 7; c.strokeRect(-w / 2, -48, w, 96); c.lineWidth = 2.5; c.strokeRect(-w / 2 + 9, -39, w - 18, 78); c.fillStyle = '#e0412f'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 4); c.restore(); }
// cost sheet (28.5-31.4) and the payoff table (38-53)
function pageCost(t) { const c = blueprint(t); const a = T(16) - .5;
  label(c, 'COST OF ONE CUP', 500, 140, seg(t, a, a + .4), { size: 56 });
  c.strokeStyle = '#eaf3ff'; c.lineWidth = 5; c.lineCap = 'round';
  // a cup drawn on
  const cup = [[380, 300], [620, 300], [590, 700], [410, 700], [380, 300]]; const tip1 = drawOn(c, cup, seg(t, a + .2, a + 1.1));
  drawOn(c, [[395, 420], [605, 420]], seg(t, a + 1.0, a + 1.3)); drawOn(c, [[540, 300], [600, 200]], seg(t, a + 1.2, a + 1.4));
  label(c, 'LEMONS  20¢', 500, 820, seg(t, a + 1.0, a + 1.3), { size: 50 }); label(c, 'SUGAR  10¢', 500, 900, seg(t, a + 1.4, a + 1.7), { size: 50 });
  drawOn(c, [[300, 960], [700, 960]], seg(t, a + 1.8, a + 2.1)); label(c, '= 30¢', 500, 1050, seg(t, a + 2.0, a + 2.3), { size: 84 });
  stamp(c, 'BREAK EVEN', 500, 1220, seg(t, a + 2.5, a + 2.9), { size: 62 });
  return tip1 || null; }
function pageGame(t) { const c = blueprint(t); const a = T(21) - .5;
  label(c, 'RED  vs  TEAL', 500, 120, seg(t, a, a + .4), { size: 58 });
  c.strokeStyle = '#eaf3ff'; c.lineWidth = 6; c.lineCap = 'round';
  const x0 = 260, y0 = 300, cw = 330, rh = 330; const k = seg(t, a + .2, a + 1.6);
  drawOn(c, [[x0, y0], [x0 + cw * 2, y0], [x0 + cw * 2, y0 + rh * 2], [x0, y0 + rh * 2], [x0, y0]], k); drawOn(c, [[x0 + cw, y0], [x0 + cw, y0 + rh * 2]], seg(t, a + 1.2, a + 1.6)); drawOn(c, [[x0, y0 + rh], [x0 + cw * 2, y0 + rh]], seg(t, a + 1.4, a + 1.8));
  label(c, 'TEAL KEEPS', x0 + cw / 2, y0 - 40, seg(t, a + 1.0, a + 1.3), { size: 30, col: '#7fe3dd' }); label(c, 'TEAL CUTS', x0 + cw * 1.5, y0 - 40, seg(t, a + 1.1, a + 1.4), { size: 30, col: '#7fe3dd' });
  c.save(); c.translate(x0 - 50, y0 + rh / 2); c.rotate(-Math.PI / 2); label(c, 'RED KEEPS', 0, 0, seg(t, a + 1.2, a + 1.5), { size: 30, col: '#ff9d8f' }); c.restore();
  c.save(); c.translate(x0 - 50, y0 + rh * 1.5); c.rotate(-Math.PI / 2); label(c, 'RED CUTS', 0, 0, seg(t, a + 1.3, a + 1.6), { size: 30, col: '#ff9d8f' }); c.restore();
  // cells: red's take (left) / teal's take (right)
  const cell = (cx, cy, r, tl, at) => { label(c, r, cx - 70, cy, seg(t, at, at + .3), { size: 52, col: '#ff9d8f' }); label(c, tl, cx + 70, cy, seg(t, at + .1, at + .4), { size: 52, col: '#7fe3dd' }); };
  cell(x0 + cw / 2, y0 + rh / 2, 'OK', 'OK', T(21) + .9);
  cell(x0 + cw / 2, y0 + rh * 1.5, 'WIN', '0', T(21) + .4);                      // red cuts, teal keeps
  cell(x0 + cw * 1.5, y0 + rh / 2, '0', 'WIN', T(22) + .2);                      // red keeps, teal cuts
  cell(x0 + cw * 1.5, y0 + rh * 1.5, '0', '0', T(22) + 1.4);
  // arrows: whatever teal does, red's cut row is better
  c.strokeStyle = '#ffe08a'; c.lineWidth = 7; drawOn(c, [[x0 + cw / 2, y0 + rh * .78], [x0 + cw / 2, y0 + rh * 1.22]], seg(t, T(21) + .9, T(21) + 1.4)); drawOn(c, [[x0 + cw * 1.5, y0 + rh * .78], [x0 + cw * 1.5, y0 + rh * 1.22]], seg(t, T(22) + 1.7, T(22) + 2.2));
  // both cut: circle the bottom-right cell, stamp
  c.strokeStyle = '#ff6b5a'; c.lineWidth = 8; const ck = seg(t, T(23) + .2, T(23) + 1.0); if (ck > 0) { c.beginPath(); c.ellipse(x0 + cw * 1.5, y0 + rh * 1.5, 150, 120, -.1, -1.4, -1.4 + TAU * ck); c.stroke(); }
  stamp(c, 'BOTH LOSE', 500, 1110, seg(t, T(23) + 1.0, T(23) + 1.4), { size: 70 });
  // the name and the rule (P24, P25)
  if (t > T(24) - .2) { c.fillStyle = `rgba(31,79,158,${clamp(seg(t, T(24) - .2, T(24) + .2)) * .92})`; c.fillRect(40, 40, 920, 1320);
    label(c, "THE", 500, 330, seg(t, T(24) + .4, T(24) + .7), { size: 70 }); label(c, "PRISONER'S", 500, 450, seg(t, T(24) + .7, T(24) + 1.0), { size: 96 }); label(c, 'DILEMMA', 500, 580, seg(t, T(24) + 1.0, T(24) + 1.3), { size: 110 });
    c.strokeStyle = '#eaf3ff'; c.lineWidth = 5; drawOn(c, [[200, 680], [800, 680]], seg(t, T(24) + 1.2, T(24) + 1.7));
    label(c, 'EACH SIDE: BEST MOVE', 500, 800, seg(t, T(25) + .1, T(25) + .4), { size: 48 }); label(c, 'BOTH SIDES: WORSE OFF', 500, 890, seg(t, T(25) + 1.0, T(25) + 1.3), { size: 48, col: '#ffb3a8' });
    stamp(c, '0¢ + 0¢', 500, 1100, seg(t, T(25) + 1.6, T(25) + 2.0), { size: 80, rot: .08 }); }
  return null; }
// render the desk: wood, the sheet in perspective (row strips), a candle, a hammer-free pen with glowing tip
function desk(t, pageFn, camK) { const tip = pageFn(t);
  F.begin(); const c = g; c.save();
  c.fillStyle = '#1a1210'; c.fillRect(0, 0, W, H);
  // back wall with a warm fireplace glow
  const wg = c.createLinearGradient(0, 0, 0, 700); wg.addColorStop(0, '#2a1a18'); wg.addColorStop(1, '#5a3424'); c.fillStyle = wg; c.fillRect(0, 0, W, 700);
  F.glow(c, 540, 380, 420, '255,150,60', .55);
  // desk top
  const dg = c.createLinearGradient(0, 600, 0, H); dg.addColorStop(0, '#7a4a2a'); dg.addColorStop(1, '#a8703e'); c.fillStyle = dg; c.fillRect(0, 600, W, H);
  c.strokeStyle = 'rgba(60,30,12,.4)'; c.lineWidth = 3; for (let i = 0; i < 9; i++) { const y = 640 + i * i * 18; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y + 10); c.stroke(); }
  // sheet in perspective: rows from far (top, narrow) to near (bottom, wide)
  const zoom = camK.zoom, cx = camK.cx, ytop = 700 - (zoom - 1) * 500, ybot = 1960 + (zoom - 1) * 700;
  const rows = 140; for (let r = 0; r < rows; r++) { const v0 = r / rows, v1 = (r + 1) / rows; const pz = v => 1 / lerp(1 / 1.0, 1 / .45, v), y = v => lerp(ytop, ybot, (pz(v) - 1) / (1 / .45 - 1) * 0 + v * v * .35 + v * .65);
    const sy0 = y(v0), sy1 = y(v1), w0 = lerp(620, 1240, v0) * zoom; c.drawImage(BP, 0, v0 * 1400, 1000, 1400 / rows + .5, cx - w0 / 2, sy0, w0, sy1 - sy0 + 1); }
  // candle at the top-left of the sheet
  const fl = 1 + .06 * Math.sin(t * 23) + .04 * Math.sin(t * 37); const kx = cx - 330 * zoom, ky = ytop + 90;
  c.fillStyle = '#efe3c8'; c.strokeStyle = INK; c.lineWidth = 3; c.fillRect(kx - 18, ky - 110, 36, 120); c.strokeRect(kx - 18, ky - 110, 36, 120);
  c.fillStyle = '#ffd36b'; c.beginPath(); c.ellipse(kx, ky - 132, 9 * fl, 22 * fl, 0, 0, TAU); c.fill(); F.glow(c, kx, ky - 132, 260 * fl, '255,190,90', .7); F.glow(c, kx, ky - 40, 520, '255,170,80', .25);
  // pen tip glow where lines are being drawn
  if (tip) { const v = tip[1] / 1400, sy = lerp(ytop, ybot, v * v * .35 + v * .65), w0 = lerp(620, 1240, v) * zoom, sx = cx - w0 / 2 + tip[0] / 1000 * w0; F.glow(c, sx, sy, 90, '255,240,200', .9); c.fillStyle = '#fff'; c.beginPath(); c.arc(sx, sy, 6, 0, TAU); c.fill(); }
  c.restore(); }

// ---------- shots ----------
const K0 = { x: 0, y: 150, z: -900, hor: 840, focus: 2400, dof: 1.6, f: 1150 };
const CAM_BOARD = { x: 0, y: 230, z: BZ - 520, hor: 880, focus: 520, dof: 6, f: 1150 };
const camRed = (dz = 0) => ({ x: RX - 30, y: 132, z: OZ - 235 + dz, hor: 700, focus: 235 - dz, dof: 7, f: 1150 });
const camTeal = (dz = 0) => ({ x: TX + 10, y: 132, z: OZ - 235 + dz, hor: 700, focus: 235 - dz, dof: 7, f: 1150 });
const WIDE = (dz = 0, x = 0) => ({ x, y: 150, z: 40 + dz, hor: 840, focus: 560 - dz, dof: 1.8, f: 1150 });
const CARD_R = { x: RSX, y: 60, z: SZ - 300, hor: 860, focus: 300, dof: 7, f: 1150 };
const CARD_T = { x: TSX, y: 60, z: SZ - 300, hor: 860, focus: 300, dof: 7, f: 1150 };

// a shot: [start, end, render(t)]; cuts happen at the starts. whip: true = whip pan into this shot
const S = [];
const shot = (a, b, fn, o = {}) => S.push({ a, b, fn, ...o });
// A: hook, the board, then roam the set (0 - T3)
shot(0, T(3) - .2, t => { F.setCam(F.camKeys(t, [[0, { ...CAM_BOARD, z: BZ - 420 }], [1.7, { ...CAM_BOARD, z: BZ - 500 }], [2.6, { ...camRed(60) }], [3.4, { ...camRed(40) }], [4.4, WIDE(300)], [5.2, WIDE(380)]]), t); streetSet(t, { crowd: 'calm' }); });
// B: Red with a cup, whip to Teal
shot(T(3) - .2, T(4) - .1, t => { F.setCam(F.camKeys(t, [[T(3) - .2, camRed(0)], [T(4), camRed(70)]]), t); streetSet(t, { crowd: 'calm', redExpr: 'smug', redTurn: .5, redArm: 120, redTalk: .4 }); });
shot(T(4) - .1, T(5) - .2, t => { F.setCam(F.camKeys(t, [[T(4) - .1, camTeal(0)], [T(5), camTeal(60)]]), t); streetSet(t, { crowd: 'calm', tealExpr: 'smug', tealTurn: -.5, tealArm: 120 }); }, { whip: true });
// C: wide, two queues, both making money
shot(T(5) - .2, T(6) - .2, t => { F.setCam(F.camKeys(t, [[T(5) - .2, WIDE(0, -60)], [T(6), WIDE(160, 60)]]), t); streetSet(t, { crowd: 'split', redExpr: 'happy', tealExpr: 'happy' }); });
// D: Red has an idea; push to his card; flip to 90
shot(T(6) - .2, T(7) + .05, t => { F.setCam(F.camKeys(t, [[T(6) - .2, camRed(-20)], [T(7), camRed(110)]]), t); streetSet(t, { crowd: 'split', redExpr: 'sly', redTurn: .7, redLook: 1, redArm: 30, redHold: null }); });
shot(T(7) + .05, T(8) - .1, t => { F.setCam(F.camKeys(t, [[T(7), CARD_R], [T(8), { ...CARD_R, z: CARD_R.z + 60 }]]), t); streetSet(t, { crowd: 'split', redExpr: 'sly' }); });
// E: customers walk over to Red; Teal worried. "For one day" - a quick dusk flash
shot(T(8) - .1, T(10) - .2, t => { F.setCam(F.camKeys(t, [[T(8) - .1, WIDE(80, 40)], [T(10), WIDE(260, -80)]]), t); const dk = ss(seg(t, T(9), T(9) + .5)) * (1 - ss(seg(t, T(10) - .5, T(10) - .2)));
  streetSet(t, { crowd: 'toRed', redExpr: 'smug', tealExpr: t > T(8) + 1 ? 'worried' : 'neutral', tealSweat: t > T(8) + 1.2 });
  F.grade(g, dk * 1.0); });
// F: Teal fights back (glare, flips to 80), whip to Red (70)
shot(T(10) - .2, T(11) + .05, t => { F.setCam(F.camKeys(t, [[T(10) - .2, camTeal(0)], [T(11), camTeal(120)]]), t); streetSet(t, { crowd: 'split', tealExpr: 'glare', tealTurn: -.7, tealArm: 30, tealHold: null }); });
shot(T(11) + .05, T(12) - .1, t => { F.setCam(F.camKeys(t, [[T(11), CARD_T], [T(12), { ...CARD_T, z: CARD_T.z + 50 }]]), t); streetSet(t, { crowd: 'split', tealExpr: 'glare' }); });
shot(T(12) - .1, T(13) - .2, t => { F.setCam(F.camKeys(t, [[T(12) - .1, camRed(30)], [T(13), camRed(110)]]), t); streetSet(t, { crowd: 'split', redExpr: 'glare', redTurn: .7, redLook: 1, redArm: 30, redHold: null }); }, { whip: true });
// G: "the whole summer": time-lapse grade sweep on the wide street, a bird lands on Red's cap
shot(T(13) - .2, T(14) - .2, t => { F.setCam(F.camKeys(t, [[T(13) - .2, WIDE(100)], [T(14), WIDE(420)]]), t); const u = seg(t, T(13), T(14) - .3), tod = u < .5 ? u * 4 : (1 - u) * 4;
  streetSet(t, { crowd: 'calm', redExpr: 'tired', tealExpr: 'tired', extra: () => bird(t) }); F.grade(g, clamp(tod, 0, 2)); });
// H: the board flips 60, 50, 40 ... 30
shot(T(14) - .2, T(16) - .2, t => { F.setCam(F.camKeys(t, [[T(14) - .2, { ...CAM_BOARD, z: BZ - 520 }], [T(16), { ...CAM_BOARD, z: BZ - 420 }]]), t); streetSet(t, { crowd: 'split', redExpr: 'worried', tealExpr: 'worried' }); });
// I: the cost sheet on the desk (light-flash in)
shot(T(16) - .2, T(17) - .2, t => desk(t, pageCost, { zoom: lerp(1, 1.12, seg(t, T(16), T(17))), cx: 540 }), { flash: true });
// J: the crowded happy street; then the two tired owners and their empty jars
shot(T(17) - .2, T(18) - .1, t => { F.setCam(F.camKeys(t, [[T(17) - .2, WIDE(0)], [T(18), WIDE(200, 40)]]), t); streetSet(t, { crowd: 'crowd', redExpr: 'tired', tealExpr: 'tired' }); });
shot(T(18) - .1, T(20) - .2, t => { F.setCam(F.camKeys(t, [[T(18) - .1, { x: 0, y: 170, z: OZ - 470, hor: 940, focus: 470, dof: 5, f: 1150 }], [T(20), { x: 0, y: 170, z: OZ - 400, hor: 940, focus: 400, dof: 5, f: 1150 }]]), t);
  streetSet(t, { crowd: 'crowd', redExpr: 'tired', tealExpr: 'tired', redHold: 'jar', tealHold: 'jar', redArm: 150, tealArm: 150, extra: () => zeroTags(t) }); });
// K0: night: the two owners by lantern light at their stands, the board between them ("You see...")
shot(T(20) - .2, T(21) - .2, t => { F.setCam(F.camKeys(t, [[T(20) - .2, { x: 0, y: 175, z: OZ - 420, hor: 930, focus: 420, dof: 5, f: 1150 }], [T(21), { x: 0, y: 175, z: OZ - 330, hor: 930, focus: 330, dof: 5, f: 1150 }]]), t);
  streetSet(t, { redExpr: 'tired', tealExpr: 'tired', redHold: 'lantern', tealHold: 'lantern', redArm: 150, tealArm: 150, redTurn: .6, tealTurn: -.6, sky: { top: '#1d2552', mid: '#36407a', low: '#5a5a8a', haze: '#6f6a8c' }, cloud: { under: '#3a4270', top: '#8088b8', line: 'rgba(30,30,70,.5)' } });
  F.grade(g, 2); nightLights(t); }, { flash: true });
// K: night desk, the payoff table, then the name (T21 - T26)
shot(T(21) - .2, T(26) - .2, t => desk(t, pageGame, { zoom: lerp(1, 1.18, seg(t, T(20), T(26))), cx: 540 + Math.sin(t * .3) * 10 }), { flash: true });
// M: being different: pink lemonade, the shady tree, a loyal regular (day, wide -> medium)
shot(T(26) - .2, T(28) - .2, t => { F.setCam(F.camKeys(t, [[T(26) - .2, WIDE(0)], [T(28), WIDE(350, 0)]]), t); streetSet(t, { crowd: 'split', redExpr: 'happy', tealExpr: 'happy', redLabel: 'PINK LEMONADE', bigTree: true, redHold: 'pink' }); });
// N: next summer: Red's pink lemonade, Teal under the tree, the board flips back to $1.00
shot(T(28) - .2, T(29) - .1, t => { F.setCam(F.camKeys(t, [[T(28) - .2, camRed(0)], [T(29), camRed(80)]]), t); streetSet(t, { crowd: 'split', redExpr: 'smug', redLabel: 'PINK LEMONADE', bigTree: true, redHold: 'pink', redArm: 120 }); });
shot(T(29) - .1, T(30) - .2, t => { F.setCam(F.camKeys(t, [[T(29) - .1, camTeal(-40)], [T(30), camTeal(40)]]), t); streetSet(t, { crowd: 'split', tealExpr: 'happy', redLabel: 'PINK LEMONADE', bigTree: true }); }, { whip: true });
// O: the board again: flips back to $1.00, hold as the opening frame (loop)
shot(T(30) - .2, TOT + 1, t => { F.setCam(F.camKeys(t, [[T(30) - .2, { ...CAM_BOARD, z: BZ - 560 }], [TOT - .4, { ...CAM_BOARD, z: BZ - 420 }]]), t); streetSet(t, { crowd: 'calm', redLabel: 'PINK LEMONADE', bigTree: true }); });

// lantern light at night: warm pools around both owners and the board
function nightLights(t) { const fl = 1 + .05 * Math.sin(t * 19) + .03 * Math.sin(t * 31);
  for (const X of [RX + 34, TX + 34]) { const p = F.proj(X, 52, OZ - 8); if (p) { F.glow(g, p.x, p.y, Math.min(420, 90 * p.s) * fl, '255,170,80', .42); F.glow(g, p.x, p.y, Math.min(120, 22 * p.s) * fl, '255,235,170', .75); } }
  const m = F.proj(-900, 1500, 9000); if (m) { g.save(); g.fillStyle = '#fff3cf'; g.beginPath(); g.arc(m.x, 260, 46, 0, TAU); g.fill(); g.restore(); F.glow(g, m.x, 260, 260, '220,225,255', .5); } }
// bird gag during the time-lapse: lands on Red's cap
function bird(t) { const k = ss(seg(t, T(13) + .2, T(13) + 1.1)); const X = lerp(RX - 300, RX + 8, k), Y = lerp(520, 1.55 * 112, k), Z = OZ;
  F.put(X, Z - 1, (c, s) => { c.save(); c.translate(0, -Y * s); c.scale(s * 1.4, s * 1.4); const fl = k < 1 ? Math.sin(t * 30) * .6 : 0; c.fillStyle = '#3f8fd6'; c.strokeStyle = INK; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(0, 0, 9, 6, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(7, -5, 4.5, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#f2a33a'; c.beginPath(); c.moveTo(11, -5); c.lineTo(16, -4); c.lineTo(11, -3); c.fill();
    c.fillStyle = '#2f6fa8'; c.beginPath(); c.ellipse(-2, -3 - fl * 6, 7, 3, -.4 - fl, 0, TAU); c.fill(); c.restore(); }, { Y: 0 }); }
// "0¢ profit" tags over the empty jars
function zeroTags(t) { const k = backOut(seg(t, T(19) + .2, T(19) + .6)); if (k <= 0) return;
  for (const [X, col] of [[RX, PAL.red], [TX, PAL.teal]]) F.put(X, OZ - 10, (c, s) => { c.save(); c.translate(0, -250 * s); c.scale(s * k, s * k); c.fillStyle = '#fbf3df'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.rect(-70, -30, 140, 60); c.fill(); c.stroke();
    c.fillStyle = col; c.font = '900 30px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PROFIT 0¢', 0, 2); c.restore(); }, { layer: 'mid' }); }

// ---------- frame ----------
function render(t) { let cur = S[0]; for (const s of S) if (t >= s.a) cur = s;
  cur.fn(t);
  // transitions into the current shot
  const since = t - cur.a; if (cur.whip && since < .16) F.smear((1 - since / .16) * 150);
  const nx = S[S.indexOf(cur) + 1]; if (nx && nx.whip && nx.a - t < .16) F.smear((1 - (nx.a - t) / .16) * 150);
  if (cur.flash && since < .3) { g.save(); g.globalAlpha = 1 - since / .3; g.fillStyle = '#fff2d0'; g.fillRect(0, 0, W, H); g.restore(); }
  if (nx && nx.flash && nx.a - t < .2) { g.save(); g.globalAlpha = 1 - (nx.a - t) / .2; g.fillStyle = '#fff2d0'; g.fillRect(0, 0, W, H); g.restore(); }
  F.post(t);
  F.caption(CH, t, 1330); }
window.DUR = TOT;
window.seek = t => render(Math.min(t, TOT - .001));
window.render = window.seek;
document.fonts.load('900 40px Nunito').then(() => document.fonts.load('700 40px Cinzel')).then(() => { window.seek(0); window.ready = true; window.READY = true; });
