// t_microwavecenter.js: "Why is food cold in the middle after microwaving?" paper pop-up book reel (template #10, popup kit).
// Grammar from t_ship (demo 28): cut-paper cards with white border + cardboard edge, back-to-front pop-ups, page turns between acts,
// cardboard signs dropping on strings, cream paper tags, layered scenery on the standing board. The hero is a live paper cutaway of a
// bowl whose heat map changes (hot rim band about an inch deep, cold core, ice core, stirring, standing time).
// Batch N layout: subtitles at y 1160-1420; no text in the top 250 px, the bottom 480 px or x > 900 below y 840; loop back to frame 0.
import * as P from './styles/popup/popup.js';
const { PAL, W, H, BOOK, card, pop, foldTab, desk, book, board, sign, label, ink, wobble, ramp, ease, back, lerp, clamp, hash } = P;

const TL = window.TL, PH = TL.p, TOT = TL.total;
const s = i => PH[i].start, e = i => PH[i].end;
const cv = document.getElementById('c');
const g = P.ctx2d(cv);
const mkc = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const LA = mkc(), la = LA.getContext('2d');

// acts: 0 hook + the inch of heating (p0-4), 1 frozen + cold spot (p5-8), 2 three tricks (p9-12), 3 recap + question + end (p13-15)
const Sa = [0, s(5) - .05, s(9) - .05, s(13) - .05], TW = .6;
const TINT = [PAL.page, '#eef4f4', '#f6ecd6', '#f3efe2'];
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
const spr = (t, t0, d = .5) => back(ramp(t, t0, d));
function stand(c, key, w, h, art, x, y, k, o = {}, co) { if (k <= .001) return null; const cd = card(key, w, h, art, co); pop(c, cd, x, y, k, o); return cd; }
const rect = (w, h, m = 8) => [[m, m], [w - m, m], [w - m, h - m], [m, h - m]];
const HOT = '#ff7a59', WARM = '#ffc15e', COLD = '#8fd0ec', ICE = '#eaf7fb';
const mixc = (a, b, u) => { const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join(''); };

// ==================================================== BOARDS ====================================================
function kitchenBoard(c, w, h, tile = '#e3f1f2', acc = '#bfe0e4') {
  ink(c, rect(w, h, 6), { fill: tile, w: 7 }); c.save(); c.beginPath(); c.rect(6, 6, w - 12, h - 12); c.clip();
  for (let y = 0; y < h; y += 70) for (let x = (y / 70) % 2 ? -35 : 0; x < w; x += 70) { c.fillStyle = hash(x * .3 + y) > .8 ? acc : tile; c.fillRect(x + 3, y + 3, 64, 64); }
  c.strokeStyle = 'rgba(74,47,42,.18)'; c.lineWidth = 3; for (let y = 0; y < h; y += 70) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  // shelf with jars
  ink(c, [[40, 250], [w - 40, 250], [w - 40, 270], [40, 270]], { fill: '#c9925a', w: 5 });
  [[90, '#f2b33d'], [170, '#6fbf73'], [250, '#e8763a']].forEach(([x, col], i) => { ink(c, [[x - 30, 250], [x - 34, 170 + i * 10], [x + 34, 170 + i * 10], [x + 30, 250]], { fill: col, w: 5 }); ink(c, [[x - 30, 170 + i * 10], [x + 30, 170 + i * 10], [x + 30, 152 + i * 10], [x - 30, 152 + i * 10]], { fill: '#fff7e6', w: 4 }); });
  c.restore();
}
const freezerBoard = (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9f1f8'); gr.addColorStop(1, '#f4fbfd'); ink(c, rect(w, h, 6), { fill: gr, w: 7 });
  c.save(); c.beginPath(); c.rect(6, 6, w - 12, h - 12); c.clip(); for (let i = 0; i < 26; i++) { const x = hash(i) * w, y = hash(i + 7) * h, r = 14 + hash(i + 3) * 22; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; c.beginPath(); c.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); } } c.restore(); };
const recipeBoard = (c, w, h) => { ink(c, rect(w, h, 6), { fill: '#fff4dc', w: 7 }); c.save(); c.beginPath(); c.rect(6, 6, w - 12, h - 12); c.clip(); c.strokeStyle = 'rgba(120,160,200,.35)'; c.lineWidth = 3; for (let y = 120; y < h; y += 56) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.strokeStyle = 'rgba(220,90,80,.4)'; c.beginPath(); c.moveTo(90, 0); c.lineTo(90, h); c.stroke(); c.restore(); };
// microwave oven (flat card); the window glow and the turntable are drawn live on top
const OV = { x: 760, y: 560, w: 340, h: 220 };   // card bottom-centre at (OV.x, OV.y + OV.h/2)
function ovenArt(c, w, h) { ink(c, rect(w, h, 6), { fill: '#e9e4da', w: 6 }); ink(c, [[22, 24], [w - 100, 24], [w - 100, h - 24], [22, h - 24]], { fill: '#3a3540', w: 5 });
  ink(c, [[w - 84, 24], [w - 18, 24], [w - 18, h - 24], [w - 84, h - 24]], { fill: '#d2ccc0', w: 4 }); for (let i = 0; i < 6; i++) { c.fillStyle = PAL.ink; c.beginPath(); c.arc(w - 66 + (i % 2) * 30, 60 + Math.floor(i / 2) * 34, 8, 0, 7); c.fill(); }
  c.fillStyle = '#7fe08a'; c.fillRect(w - 78, 34, 54, 16); }
function ovenLive(c, t, k, on) { if (k <= .01) return; const cd = card('oven', OV.w, OV.h, ovenArt); pop(c, cd, OV.x, OV.y + OV.h / 2, k, { shadowA: .25 });
  if (k < .95) return; const x0 = OV.x - OV.w / 2 + 22 + 30, y0 = OV.y - OV.h / 2 + 24 + 30 - 5, ww = OV.w - 122, hh = OV.h - 48;
  c.save(); c.globalAlpha = on * (.55 + .2 * Math.sin(t * 9)); c.fillStyle = '#ffd24d'; c.fillRect(x0, y0, ww, hh); c.restore();
  c.save(); c.beginPath(); c.rect(x0, y0, ww, hh); c.clip(); const a = t * 2.2 * on; c.fillStyle = '#fff7e6'; c.strokeStyle = PAL.ink; c.lineWidth = 4; c.beginPath(); c.ellipse(x0 + ww / 2, y0 + hh - 30, 90, 20, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = HOT; c.beginPath(); c.ellipse(x0 + ww / 2 + Math.cos(a) * 30, y0 + hh - 48, 44, 22, 0, 0, 7); c.fill(); c.stroke(); c.restore(); }

// ==================================================== THE BOWL (live cutaway) ====================================================
const BW = { cx: 520, top: 690, rx: 360, ry: 270, wall: 28, surf: 712 };
function halfEll(cx, cy, rx, ry, y0, n = 40) { const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return pts.filter(p => p[1] >= y0 - .5); }
// food region inset by d: the inner bowl ellipse shrunk by d, top surface pushed down by d
function foodPath(c, d) { const rx = BW.rx - BW.wall - d, ry = BW.ry - BW.wall - d, y0 = BW.surf + d; if (rx < 4 || ry < 4) return false; c.beginPath(); const yy = Math.min(1, (y0 - BW.top) / ry), a0 = Math.asin(clamp(yy, -1, 1));
  c.ellipse(BW.cx, BW.top, rx, ry, 0, a0, Math.PI - a0); c.closePath(); return true; }
// st: {d: hot band depth px, core: core colour, mid: mid ring colour, mid2: mid ring depth, ice: 0..1, steam, bubbles, germs, waves, mol, bracket}
function bowl(c, t, k, st) {
  if (k <= .01) return; c.save(); c.translate(BW.cx, 990); c.transform(1, 0, 0, Math.max(.04, k), 0, 0); c.translate(-BW.cx, -990);
  // shadow
  c.save(); c.globalAlpha = .25; c.filter = 'blur(10px)'; c.fillStyle = '#2a1608'; c.beginPath(); c.ellipse(BW.cx + 30, 985, BW.rx * .8, 26, 0, 0, 7); c.fill(); c.restore();
  // paper border then bowl
  const out = halfEll(BW.cx, BW.top, BW.rx, BW.ry, BW.top); const foot = [[BW.cx + 120, BW.top + BW.ry - 10], [BW.cx + 140, 990], [BW.cx - 140, 990], [BW.cx - 120, BW.top + BW.ry - 10]];
  ink(c, out, { stroke: PAL.border, w: 30 }); ink(c, foot, { fill: PAL.border, stroke: PAL.border, w: 28 });
  ink(c, foot, { fill: '#e8e2d6', w: 6 }); ink(c, out, { fill: '#f4f0e8', w: 7 });
  // food: outer hot band, a mid ring (conduction), the core
  c.save(); foodPath(c, 0); c.clip(); c.fillStyle = st.edge || HOT; c.fillRect(0, 0, W, H);
  if (st.mid2 > 0 && foodPath(c, st.d)) { c.fillStyle = st.mid || WARM; c.fill(); }
  if (foodPath(c, st.d + (st.mid2 || 0))) { c.fillStyle = st.core || COLD; c.fill(); if (st.ice > 0) { c.save(); c.clip(); c.globalAlpha = st.ice; c.fillStyle = ICE; c.fillRect(0, 0, W, H); c.strokeStyle = '#9fd8ec'; c.lineWidth = 4;
      for (let i = 0; i < 14; i++) { const x = BW.cx - 200 + hash(i) * 400, y = BW.surf + 60 + hash(i + 4) * 160, r = 12 + hash(i + 9) * 14; for (let q = 0; q < 3; q++) { const a = q * Math.PI / 3; c.beginPath(); c.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); } } c.restore(); } }
  // water molecules jiggling in the hot band
  if (st.mol > 0) for (let i = 0; i < 16; i++) { const a = Math.PI * (.08 + i / 15 * .84), rx = BW.rx - BW.wall - st.d * .5, ry = BW.ry - BW.wall - st.d * .5; let x = BW.cx + Math.cos(a) * rx, y = BW.top + Math.sin(a) * ry; if (y < BW.surf + st.d * .5) continue;
    const j = st.mol * 7; x += Math.sin(t * 40 + i * 3) * j; y += Math.cos(t * 37 + i * 5) * j; mol(c, x, y, t * 30 * st.mol + i, .8); }
  if (st.mol > 0) for (let i = 0; i < 5; i++) { const x = BW.cx - 240 + i * 120 + Math.sin(t * 40 + i) * st.mol * 7, y = BW.surf + st.d * .5 + Math.cos(t * 33 + i) * st.mol * 6; mol(c, x, y, t * 30 * st.mol + i * 2, .8); }
  // germs hiding in the cold core
  if (st.germs > 0) for (let i = 0; i < 4; i++) { const x = BW.cx - 110 + i * 70 + Math.sin(t * 2 + i) * 8, y = BW.surf + 140 + (i % 2) * 50 + Math.cos(t * 2.4 + i) * 6; germ(c, x, y, st.germs * (i % 2 ? .9 : 1.1), t + i); }
  c.restore(); foodPath(c, 0); c.strokeStyle = PAL.ink; c.lineWidth = 5; c.stroke();
  ink(c, [[BW.cx - BW.rx, BW.top], [BW.cx + BW.rx, BW.top]], { w: 7 });
  // bubbles at the rim
  if (st.bubbles > 0) for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, u = (t * .8 + hash(i) ) % 1, x = BW.cx + side * (BW.rx - 70 - hash(i + 2) * 50), y = BW.surf - u * 70, r = (6 + hash(i + 5) * 10) * st.bubbles * Math.sin(u * Math.PI);
    if (r > .5) { c.fillStyle = '#ffe3d6'; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); } }
  // steam over the rim (edges only)
  if (st.steam > 0) { c.save(); c.globalAlpha = st.steam; c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round'; for (const x of [BW.cx - 250, BW.cx - 190, BW.cx + 190, BW.cx + 250]) { c.beginPath(); for (let y = 0; y < 150; y += 10) { const xx = x + Math.sin(y * .06 - t * 4 + x) * 14; y ? c.lineTo(xx, BW.top - 30 - y) : c.moveTo(xx, BW.top - 30); } c.stroke(); } c.restore(); }
  c.restore();
}
function mol(c, x, y, rot, sc) { c.save(); c.translate(x, y); c.rotate(rot * .3); c.scale(sc, sc); c.strokeStyle = PAL.ink; c.lineWidth = 3;
  [[-16, 12], [16, 12]].forEach(([dx, dy]) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(dx, dy, 8, 0, 7); c.fill(); c.stroke(); }); c.fillStyle = '#e04a3a'; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill(); c.stroke(); c.restore(); }
function germ(c, x, y, sc, t) { if (sc <= .01) return; c.save(); c.translate(x, y); c.scale(sc, sc); const p = wobble(0, 0, 26, 22, 7, .12, 24); ink(c, p, { fill: '#7cc36d', w: 4 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(Math.cos(a) * 26, Math.sin(a) * 22); c.lineTo(Math.cos(a) * 36, Math.sin(a) * 31); c.stroke(); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-8, -4, 6, 0, 7); c.arc(8, -4, 6, 0, 7); c.fill(); c.fillStyle = PAL.ink; c.beginPath(); c.arc(-8, -3, 3, 0, 7); c.arc(8, -3, 3, 0, 7); c.fill(); c.restore(); }
// microwave "waves": wavy arrows from outside to the food edge; dashed for ice (they pass through)
function mwaves(c, t, k, d, o = {}) { if (k <= .01) return; const tg = [[-.5, -1], [0, -1], [.5, -1], [-1, .2], [1, .2]];
  tg.forEach(([dx, dy], i) => { let ex, ey; if (dy < 0) { ex = BW.cx + dx * 220; ey = BW.surf; } else { const a = dx < 0 ? Math.PI * .82 : Math.PI * .18; ex = BW.cx + Math.cos(a) * (BW.rx - BW.wall); ey = BW.top + Math.sin(a) * (BW.ry - BW.wall); }
    const len = dy < 0 ? 230 : 190, sx = ex - (dy < 0 ? 0 : dx * len), sy = ey - (dy < 0 ? len : len * .25), u = clamp(k * 1.3 - i * .06), n = 30;
    c.save(); c.strokeStyle = o.col || '#e04a3a'; c.lineWidth = 7; c.lineCap = 'round'; c.globalAlpha = o.a ?? 1; if (o.dash) c.setLineDash([14, 12]);
    c.beginPath(); for (let j = 0; j <= n * u; j++) { const q = j / n, px = lerp(sx, ex, q), py = lerp(sy, ey, q), nx = -(ey - sy), ny = ex - sx, nl = Math.hypot(nx, ny), w = Math.sin(q * 18 - t * 10) * 10; j ? c.lineTo(px + nx / nl * w, py + ny / nl * w) : c.moveTo(px + nx / nl * w, py + ny / nl * w); } c.stroke(); c.setLineDash([]);
    if (u >= 1 && !o.dash) { const ax = ex - sx, ay = ey - sy, al = Math.hypot(ax, ay), ux = ax / al, uy = ay / al; c.fillStyle = o.col || '#e04a3a'; c.beginPath(); c.moveTo(ex + ux * d * .7, ey + uy * d * .7); c.lineTo(ex - uy * 14, ey + ux * 14); c.lineTo(ex + uy * 14, ey - ux * 14); c.closePath(); c.fill(); }
    c.restore(); }); }
// conduction arrows: short arrows creeping from the band inward
function condArrows(c, t, k, d) { if (k <= .01) return; for (let i = 0; i < 5; i++) { const a = Math.PI * (.2 + i * .15), r0x = BW.rx - BW.wall - d, r0y = BW.ry - BW.wall - d, u = ((t * .35 + i * .2) % 1);
    const x0 = BW.cx + Math.cos(a) * r0x, y0 = BW.top + Math.sin(a) * r0y, x1 = lerp(x0, BW.cx, .35), y1 = lerp(y0, BW.surf + 120, .35), px = lerp(x0, x1, u), py = lerp(y0, y1, u);
    c.save(); c.globalAlpha = k * Math.sin(u * Math.PI); c.fillStyle = HOT; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.arc(px, py, 12, 0, 7); c.fill(); c.stroke(); c.restore(); } }
// depth bracket on the left edge of the band
function bracket(c, d, a, txt = 'about 1 inch') { if (a <= 0) return; const a0 = Math.PI * .86, x0 = BW.cx + Math.cos(a0) * (BW.rx - BW.wall), y0 = BW.top + Math.sin(a0) * (BW.ry - BW.wall), x1 = BW.cx + Math.cos(a0) * (BW.rx - BW.wall - d), y1 = BW.top + Math.sin(a0) * (BW.ry - BW.wall - d);
  c.save(); c.globalAlpha = a; c.strokeStyle = PAL.ink; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); [[x0, y0], [x1, y1]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 7, 0, 7); c.fillStyle = PAL.ink; c.fill(); });
  c.beginPath(); c.moveTo((x0 + x1) / 2, (y0 + y1) / 2); c.lineTo(250, 610); c.stroke(); c.restore(); tag(c, txt, '2.5 cm', 250, 560, 330, 110, '#fff7e6', a); }

// ==================================================== dynamic bits ====================================================
function tag(c, text, sub, x, y, w, h, col = PAL.cream, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(40,20,8,.3)'; c.filter = 'blur(7px)'; rr(c, x - w / 2 + 3, y - h / 2 + 10, w, h, 22); c.fill(); c.filter = 'none';
  c.fillStyle = col; c.strokeStyle = PAL.ink; c.lineWidth = 5; rr(c, x - w / 2, y - h / 2, w, h, 22); c.fill(); c.stroke();
  c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (sub) { c.font = '700 50px Fredoka'; c.fillText(text, x, y - 16); c.font = '500 30px Fredoka'; c.fillStyle = '#7a5a46'; c.fillText(sub, x, y + h / 2 - 26); } else { c.font = '700 48px Fredoka'; c.fillText(text, x, y + 2); }
  c.restore();
}
function stamp(c, txt, x, y, k, rot = -.14) { if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(rot); const sc = back(k); c.scale(sc, sc); c.font = '700 64px Fredoka'; const w = c.measureText(txt).width + 50; c.globalAlpha = .9; c.strokeStyle = '#d64545'; c.lineWidth = 8; rr(c, -w / 2, -48, w, 96, 14); c.stroke(); c.fillStyle = '#d64545'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 4); c.restore(); }
function sub2(c, text, a) {   // cream paper strip in the Batch N caption band (y about 1160-1420)
  if (!text || a <= 0) return; c.save(); c.globalAlpha = a; c.font = '600 48px Fredoka'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const toks = []; text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach(sg => { const b = sg.startsWith('**'); (b ? sg.slice(2, -2) : sg).split(/(\s+)/).filter(Boolean).forEach(w => toks.push([w, b])); });
  const maxW = 860, lines = [[]]; let lw = 0;
  toks.forEach(([w, b]) => { const sp = /^\s+$/.test(w), ww = c.measureText(w).width; if (!sp && lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (sp && !lines[lines.length - 1].length) return; lines[lines.length - 1].push([w, b, ww]); lw += ww; });
  const lwid = ln => { let q = ln.slice(); while (q.length && /^\s+$/.test(q[q.length - 1][0])) q.pop(); return q.reduce((m, t) => m + t[2], 0); };
  const mw = Math.max(...lines.map(lwid)), wCard = Math.min(940, mw + 80), hCard = 44 + lines.length * 64, x0 = (W - wCard) / 2, y0 = 1290 - hCard / 2;
  c.fillStyle = 'rgba(40,20,8,.35)'; c.filter = 'blur(8px)'; rr(c, x0 + 4, y0 + 12, wCard, hCard, 28); c.fill(); c.filter = 'none';
  c.fillStyle = PAL.cream; c.strokeStyle = PAL.ink; c.lineWidth = 5; rr(c, x0, y0, wCard, hCard, 28); c.fill(); c.stroke();
  lines.forEach((ln, li) => { let x = (W - lwid(ln)) / 2; const y = y0 + 22 + 32 + li * 64; ln.forEach(([w, b, ww]) => { c.fillStyle = b ? PAL.coral : PAL.ink; c.fillText(w, x, y); x += ww; }); });
  c.restore();
}
// flat props lying on the lower page (art only, no text): tea towel, spoon, oven mitt
function lowerProps(c, t) { c.save(); c.translate(250, 1540); c.rotate(-.08); ink(c, [[-150, -60], [150, -60], [150, 60], [-150, 60]], { fill: '#fff7e6', w: 6 }); c.fillStyle = '#e8763a'; for (let i = 0; i < 4; i++) c.fillRect(-150, -46 + i * 28, 300, 10); ink(c, [[-150, -60], [150, -60], [150, 60], [-150, 60]], { w: 6 }); c.restore();
  c.save(); c.translate(520, 1560); c.rotate(-.2); ink(c, [[-14, -130], [14, -130], [14, 60], [-14, 60]], { fill: '#c9cfd8', w: 5 }); for (let i = -1; i <= 1; i++) ink(c, [[i * 14 - 4, -200], [i * 14 + 4, -200], [i * 14 + 4, -130], [i * 14 - 4, -130]], { fill: '#c9cfd8', w: 4 }); c.restore();
  c.save(); c.translate(760, 1530); c.rotate(.35); ink(c, wobble(0, -70, 50, 66, 4, .04, 30), { fill: '#d64545', w: 6 }); ink(c, [[-20, -10], [20, -10], [16, 120], [-16, 120]], { fill: '#c9925a', w: 5 }); c.restore(); }
// heat legend strip on the page between the bowl and the subtitle band (hot / warm / cold, ice in act 2)
function legend(c, t, a, ice) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(500, 1075); c.rotate(-.015); ink(c, [[-330, -40], [330, -40], [330, 40], [-330, 40]], { fill: '#fff7e6', stroke: PAL.border, w: 20 }); ink(c, [[-330, -40], [330, -40], [330, 40], [-330, 40]], { fill: '#fff7e6', w: 5 });
  [[HOT, 'hot'], [WARM, 'warm'], [ice ? ICE : COLD, ice ? 'ice' : 'cold']].forEach(([col, lab], i) => { const x = -300 + i * 210; ink(c, [[x, -20], [x + 44, -20], [x + 44, 20], [x, 20]], { fill: col, w: 4 }); c.fillStyle = PAL.ink; c.font = '600 38px Fredoka'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(lab, x + 60, 2); }); c.restore(); }
// a second row of flat props higher on the lower page (seen under the subtitles when the camera is zoomed in)
function lowerProps2(c) { c.save(); c.translate(250, 1215); c.rotate(.06); ink(c, wobble(0, 0, 130, 46, 12, .02, 30), { fill: '#e8ecf2', stroke: PAL.border, w: 22 }); ink(c, wobble(0, 0, 130, 46, 12, .02, 30), { fill: '#e8ecf2', w: 6 }); ink(c, wobble(0, -30, 26, 14, 13, .02, 16), { fill: '#c9cfd8', w: 5 }); c.restore();
  c.save(); c.translate(560, 1230); c.rotate(-.1); ink(c, [[-80, -60], [80, -60], [64, 60], [-64, 60]], { fill: '#bfe0e4', stroke: PAL.border, w: 22 }); ink(c, [[-80, -60], [80, -60], [64, 60], [-64, 60]], { fill: '#bfe0e4', w: 6 }); for (let i = 0; i < 3; i++) { c.strokeStyle = PAL.ink; c.lineWidth = 4; c.beginPath(); c.moveTo(-60, -30 + i * 30); c.lineTo(-30, -30 + i * 30); c.stroke(); } ink(c, wobble(98, 0, 30, 40, 15, .02, 18), { w: 6 }); c.restore();
  c.save(); c.translate(820, 1215); c.rotate(.12); ink(c, [[-90, -50], [90, -50], [90, 50], [-90, 50]], { fill: '#ffd9a8', stroke: PAL.border, w: 22 }); ink(c, [[-90, -50], [90, -50], [90, 50], [-90, 50]], { fill: '#ffd9a8', w: 6 }); c.strokeStyle = 'rgba(74,47,42,.4)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-90, 0); c.lineTo(90, 0); c.stroke(); c.restore(); }
// spoon (stirring)
function spoon(c, x, y, a, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; c.translate(x, y); c.rotate(a); ink(c, [[-10, -300], [10, -300], [12, -40], [-12, -40]], { fill: '#c9cfd8', stroke: PAL.border, w: 22 }); ink(c, wobble(0, 0, 38, 56, 3, .03, 30), { fill: '#c9cfd8', stroke: PAL.border, w: 22 });
  ink(c, [[-10, -300], [10, -300], [12, -40], [-12, -40]], { fill: '#c9cfd8', w: 5 }); ink(c, wobble(0, 0, 38, 56, 3, .03, 30), { fill: '#c9cfd8', w: 5 }); c.restore(); }
// power dial (HIGH -> 50%)
function dial(c, x, y, v, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); ink(c, wobble(0, 0, 130, 130, 2, .01, 40), { fill: '#fff7e6', w: 6 }); c.font = '700 34px Fredoka'; c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('HIGH', 70, -70); c.fillText('50%', -70, -70); c.fillText('LOW', -90, 40); const a = lerp(-Math.PI * .25, -Math.PI * .75, v); c.strokeStyle = '#d64545'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 100, Math.sin(a) * 100); c.stroke();
  c.fillStyle = PAL.ink; c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill(); c.restore(); }
// kitchen timer (standing time)
function timer(c, x, y, u, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); ink(c, wobble(0, 0, 110, 110, 5, .01, 40), { fill: '#ffd24d', w: 6 }); ink(c, wobble(0, 0, 80, 80, 6, .01, 40), { fill: '#fff7e6', w: 5 });
  c.fillStyle = '#ff7a59'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 76, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); c.closePath(); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(-Math.PI / 2 + u * Math.PI * 2) * 70, Math.sin(-Math.PI / 2 + u * Math.PI * 2) * 70); c.stroke();
  ink(c, [[-20, -110], [20, -110], [20, -136], [-20, -136]], { fill: '#ffd24d', w: 5 }); c.restore(); }
// flip slats (three tricks list)
function slatArt(n, txt, col) { return (c, w, h) => { ink(c, rect(w, h, 6), { fill: col, w: 6 }); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(16, 14, w - 32, 8); c.fillStyle = PAL.ink; c.textBaseline = 'middle'; c.font = '700 56px Fredoka'; c.textAlign = 'left'; c.fillText(n, 30, h / 2 + 2); c.font = '700 42px Fredoka'; c.fillText(txt, 90, h / 2 + 2); }; }
function slat(c, i, t, t0, txt, col, y, on) { const q = ramp(t, t0, .45); if (q <= 0) return; const cd = card('slat' + i, 540, 84, slatArt(String(i + 1), txt, col)); c.save(); c.translate(350, y); c.scale(1, Math.max(.04, Math.abs(Math.cos(Math.PI * (q > .5 ? 1 - q : q))))); c.globalAlpha = on ? 1 : .55; c.drawImage(cd.c, -cd.w / 2, -cd.h / 2); c.restore(); }

// ==================================================== v2 SET PIECES (one composition per beat) ====================================================
// live pop-up: draws fn() standing up around its bottom edge (k 0 flat .. 1 upright, back overshoot), with a paper border pass
function livePop(c, by, k, fn) { if (k <= .01) return; c.save(); c.translate(540, by); c.transform(1, 0, 0, Math.max(.04, k), 0, 0); c.translate(-540, -by); fn(); c.restore(); }
function paperRect(c, x, y, w, h, fill, r = 16) { c.save(); c.fillStyle = 'rgba(40,20,8,.28)'; c.filter = 'blur(9px)'; rr(c, x + 10, y + 16, w, h, r); c.fill(); c.restore();
  c.fillStyle = PAL.border; rr(c, x - 12, y - 12, w + 24, h + 24, r + 8); c.fill(); c.strokeStyle = PAL.edge; c.lineWidth = 4; c.stroke(); c.fillStyle = fill; rr(c, x, y, w, h, r); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.stroke(); }
// p2: the cross-section page: a slab of food sliced open, hot band ~1 inch from every face, a paper ruler against the band
const SL = { x: 170, y: 520, w: 740, h: 360 };
function slab(c, t, k, d, o = {}) { livePop(c, SL.y + SL.h + 20, k, () => {
  paperRect(c, SL.x, SL.y, SL.w, SL.h, o.edge || HOT, 10);
  c.save(); rr(c, SL.x, SL.y, SL.w, SL.h, 10); c.clip(); if (o.mid2 > 0) { c.fillStyle = WARM; c.fillRect(SL.x + d, SL.y + d, SL.w - 2 * d, SL.h - 2 * d); }
  c.fillStyle = o.core || COLD; const m = d + (o.mid2 || 0); c.fillRect(SL.x + m, SL.y + m, SL.w - 2 * m, SL.h - 2 * m);
  c.strokeStyle = 'rgba(74,47,42,.25)'; c.lineWidth = 3; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(SL.x, SL.y + i * SL.h / 4 + Math.sin(i) * 6); for (let x = 0; x <= SL.w; x += 30) c.lineTo(SL.x + x, SL.y + i * SL.h / 4 + Math.sin(x * .02 + i) * 6); c.stroke(); } c.restore();
  rr(c, SL.x, SL.y, SL.w, SL.h, 10); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.stroke();
  c.setLineDash([12, 10]); c.strokeStyle = 'rgba(74,47,42,.7)'; c.lineWidth = 4; c.strokeRect(SL.x + d, SL.y + d, SL.w - 2 * d, SL.h - 2 * d); c.setLineDash([]); }); }
function ruler(c, x, y, len, k, d) { if (k <= .01) return; c.save(); c.translate(x, y); c.rotate(-Math.PI / 2 * 0); c.globalAlpha = clamp(k * 2);
  c.fillStyle = PAL.border; rr(c, -12, -12, 84, len + 24, 10); c.fill(); c.fillStyle = '#ffd24d'; rr(c, 0, 0, 60, len, 6); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 5; c.stroke();
  for (let i = 0; i <= 8; i++) { const yy = i / 8 * d * 2; if (yy > len) break; c.beginPath(); c.moveTo(0, yy); c.lineTo(i % 4 ? 18 : 34, yy); c.stroke(); } c.fillStyle = PAL.ink; c.font = '700 30px Fredoka'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('1"', 22, d - 2); c.restore(); }
// straight wave arrows coming in from outside to the slab faces; they fade out at depth d
function slabWaves(c, t, k, d, o = {}) { if (k <= .01) return; const hits = [[SL.x + 160, SL.y, 0, 1], [SL.x + 370, SL.y, 0, 1], [SL.x + 580, SL.y, 0, 1], [SL.x, SL.y + 180, 1, 0], [SL.x + SL.w, SL.y + 180, -1, 0]];
  hits.forEach(([x, y, dx, dy], i) => { const u = clamp(k * 1.4 - i * .08), L = 200, sx = x - dx * L, sy = y - dy * L; c.save(); c.strokeStyle = o.col || '#e04a3a'; c.lineWidth = 7; c.lineCap = 'round'; c.globalAlpha = o.a ?? 1; if (o.dash) c.setLineDash([14, 12]);
    const ex = lerp(sx, x + dx * d, u), ey = lerp(sy, y + dy * d, u); c.beginPath(); const n = 26; for (let j = 0; j <= n; j++) { const q = j / n, px = lerp(sx, ex, q), py = lerp(sy, ey, q), w = Math.sin(q * 16 - t * 10) * 10 * (1 - clamp((q * (L + d) - L) / d)); j ? c.lineTo(px + dy * w, py + dx * w) : c.moveTo(px + dy * w, py + dx * w); } c.stroke(); c.restore(); }); }
// p3: inside the oven: cavity, light, rotating turntable with a plate, a magnifier on the food's surface with jiggling water molecules
function ovenInside(c, t, k, jig) { livePop(c, 940, k, () => {
  paperRect(c, 130, 380, 820, 540, '#3a3540', 14); c.save(); rr(c, 130, 380, 820, 540, 14); c.clip();
  const gl = c.createRadialGradient(540, 420, 20, 540, 600, 520); gl.addColorStop(0, 'rgba(255,214,90,.75)'); gl.addColorStop(1, 'rgba(255,214,90,.08)'); c.fillStyle = gl; c.fillRect(130, 380, 820, 540);
  c.fillStyle = '#4a4552'; c.beginPath(); c.moveTo(130, 920); c.lineTo(240, 760); c.lineTo(840, 760); c.lineTo(950, 920); c.closePath(); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#d8e4ea'; c.beginPath(); c.ellipse(540, 830, 300, 62, 0, 0, 7); c.fill(); c.stroke();
  const a = t * 1.6; for (let i = 0; i < 6; i++) { const b = a + i * Math.PI / 3; c.strokeStyle = 'rgba(74,47,42,.35)'; c.beginPath(); c.moveTo(540, 830); c.lineTo(540 + Math.cos(b) * 280, 830 + Math.sin(b) * 56); c.stroke(); }
  const px = 540 + Math.cos(a) * 60, py = 818 + Math.sin(a) * 12; c.fillStyle = '#fff7e6'; c.strokeStyle = PAL.ink; c.lineWidth = 5; c.beginPath(); c.ellipse(px, py, 170, 40, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = HOT; c.beginPath(); c.ellipse(px, py - 16, 110, 30, 0, Math.PI, 0); c.lineTo(px + 110, py - 6); c.ellipse(px, py - 6, 110, 18, 0, 0, Math.PI); c.closePath(); c.fill(); c.stroke();
  for (let i = 0; i < 4; i++) { const yy = 420 + i * 18; c.strokeStyle = 'rgba(255,240,180,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(150, yy); c.lineTo(930, yy); c.stroke(); }
  c.restore();
  // magnifier
  const mx = 360, my = 560, mr = 140; c.save(); c.beginPath(); c.arc(mx, my, mr, 0, 7); c.fillStyle = '#ffe3d6'; c.fill(); c.clip();
  for (let i = 0; i < 9; i++) { const x = mx - 100 + (i % 3) * 100 + Math.sin(t * 38 + i * 2) * 10 * jig, y = my - 90 + Math.floor(i / 3) * 90 + Math.cos(t * 41 + i) * 10 * jig; mol(c, x, y, t * 25 * jig + i, 1.25);
    if (jig > .3) { c.strokeStyle = 'rgba(224,74,58,.6)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 34, -.6, .6); c.stroke(); c.beginPath(); c.arc(x, y, 34, Math.PI - .6, Math.PI + .6); c.stroke(); } }
  c.restore(); c.strokeStyle = PAL.border; c.lineWidth = 26; c.beginPath(); c.arc(mx, my, mr + 6, 0, 7); c.stroke(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.beginPath(); c.arc(mx, my, mr + 18, 0, 7); c.stroke(); c.beginPath(); c.arc(mx, my, mr - 6, 0, 7); c.stroke();
  c.strokeStyle = PAL.ink; c.lineWidth = 9; c.beginPath(); c.moveTo(mx + 80, my + 150); c.lineTo(px - 40, py - 30); c.stroke(); }); }
// p4: the conduction chain: food cubes from the edge to the center, heat passed slowly cube to cube
function chain(c, t, k, u) { const n = 7; for (let i = 0; i < n; i++) { const x = 230 + i * 103, kk = spr(t, i * .08 + (t - u), .4); void kk;
    const h = clamp(u * 5.2 - i * .95), col = mixc(COLD, i === 0 ? HOT : WARM, h), cd = card('cube' + i, 96, 96, (cc, w, hh) => { ink(cc, rect(w, hh, 6), { fill: '#fff', w: 6 }); }, { border: 10 });
    livePop(c, 820, k, () => { pop(c, cd, x, 820, 1, { shadowA: .2 }); c.fillStyle = col; rr(c, x - 42, 820 - 5 - 96 + 6, 84, 84, 6); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 5; c.stroke(); });
    if (i < n - 1 && h > .5) { const q = clamp(u * 5.2 - i * .95 - .5) * 2; c.save(); c.globalAlpha = clamp(q); c.fillStyle = HOT; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.arc(x + 58, 770, 12, 0, 7); c.fill(); c.stroke(); c.restore(); } } }
// p5-p6: frozen block close-up (peas frozen in a slab of ice); thaw 0..1 turns the outer layer into a hot wet layer with drips
function iceBlock(c, t, k, thaw) { livePop(c, 920, k, () => {
  const x = 230, y = 470, w = 620, h = 420; paperRect(c, x, y, w, h, '#d8f0f8', 22);
  c.save(); rr(c, x, y, w, h, 22); c.clip(); for (let i = 0; i < 26; i++) { const px = x + 60 + hash(i) * (w - 120), py = y + 60 + hash(i + 11) * (h - 120); c.fillStyle = i % 3 ? '#7cc36d' : '#f2c94c'; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.arc(px, py, 16, 0, 7); c.fill(); c.stroke(); }
  c.fillStyle = 'rgba(234,247,251,.55)'; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 40, y + 60); c.lineTo(x + 40, y + 200); c.moveTo(x + 70, y + 40); c.lineTo(x + 200, y + 40); c.stroke();
  if (thaw > 0) { const d = 26 + 40 * thaw; c.save(); c.beginPath(); c.rect(x, y, w, h); c.rect(x + d, y + d, w - 2 * d, h - 2 * d); c.fillStyle = mixc('#ffc8a8', '#ff5a3a', thaw); c.globalAlpha = .9; c.fill('evenodd'); c.restore(); }
  c.restore(); rr(c, x, y, w, h, 22); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.stroke();
  if (thaw > .2) { for (let i = 0; i < 5; i++) { const u = (t * .7 + i * .21) % 1, dx = x + 90 + i * 110; c.fillStyle = '#ff9a7a'; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.ellipse(dx, y + h + 10 + u * 50, 9, 13, 0, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = 'rgba(255,154,122,.6)'; c.beginPath(); c.ellipse(540, y + h + 70, 300 * thaw, 22, 0, 0, 7); c.fill(); } }); }
// waves that mostly pass through/bounce off the ice: they arrive, weaken and continue dashed
function iceWaves(c, t, k) { if (k <= .01) return; for (let i = 0; i < 4; i++) { const u = clamp(k * 1.3 - i * .1), y = 520 + i * 100, sx = 60, ex = lerp(sx, 1000, u);
    c.save(); c.lineCap = 'round'; c.lineWidth = 7; c.strokeStyle = '#e04a3a'; c.beginPath(); for (let x = sx; x <= Math.min(ex, 230); x += 8) { const yy = y + Math.sin(x * .06 - t * 10) * 10; x === sx ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
    if (ex > 230) { c.setLineDash([12, 14]); c.globalAlpha = .75; c.strokeStyle = '#5aa8d8'; c.beginPath(); for (let x = 230; x <= ex; x += 8) { const yy = y + Math.sin(x * .06 - t * 10) * 10; x === 230 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); } c.restore(); } }
// p7, p10, p12: the bowl seen from above: a hot ring at the rim, the core (cold/icy/mixing)
function plateTop(c, t, k, st, cx = 540, cy = 690, sc = 1) { livePop(c, cy + 330 * sc, k, () => { c.save(); c.translate(cx, cy); c.scale(sc, sc);
  c.fillStyle = 'rgba(40,20,8,.28)'; c.save(); c.filter = 'blur(10px)'; c.beginPath(); c.arc(14, 20, 330, 0, 7); c.fill(); c.restore();
  c.fillStyle = PAL.border; c.beginPath(); c.arc(0, 0, 334, 0, 7); c.fill(); c.fillStyle = '#f4f0e8'; c.strokeStyle = PAL.ink; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 320, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(0, 0, 286, 0, 7); c.stroke();
  const R0 = 270, ring = st.ring ?? 70; c.fillStyle = st.edge || HOT; c.beginPath(); c.arc(0, 0, R0, 0, 7); c.fill(); if (st.mid2) { c.fillStyle = st.mid || WARM; c.beginPath(); c.arc(0, 0, R0 - ring, 0, 7); c.fill(); }
  c.fillStyle = st.core || COLD; c.beginPath(); c.arc(0, 0, R0 - ring - (st.mid2 || 0), 0, 7); c.fill();
  if (st.swirl) { c.save(); c.rotate(t * 2.4); c.strokeStyle = 'rgba(255,193,94,.9)'; c.lineWidth = 14; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, 70 + i * 60, i * 2, i * 2 + 2.2 * st.swirl); c.stroke(); } c.restore(); }
  if (st.ice) { c.strokeStyle = '#9fd8ec'; c.lineWidth = 5; for (let i = 0; i < 10; i++) { const a = hash(i) * 7, r = hash(i + 3) * (R0 - ring - 40), x = Math.cos(a) * r, y = Math.sin(a) * r, s = 16 + hash(i + 8) * 10; for (let q = 0; q < 3; q++) { const b = q * Math.PI / 3; c.beginPath(); c.moveTo(x - Math.cos(b) * s, y - Math.sin(b) * s); c.lineTo(x + Math.cos(b) * s, y + Math.sin(b) * s); c.stroke(); } } }
  if (st.bubbles) for (let i = 0; i < 18; i++) { const a = i / 18 * 7 + hash(i), u = (t * 1.2 + hash(i + 2)) % 1, r = (8 + 10 * hash(i + 5)) * Math.sin(u * Math.PI) * st.bubbles, rr2 = R0 - ring / 2 + Math.sin(i) * 12; if (r > .5) { c.fillStyle = '#ffe3d6'; c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.arc(Math.cos(a) * rr2, Math.sin(a) * rr2, r, 0, 7); c.fill(); c.stroke(); } }
  if (st.germs) for (let i = 0; i < 4; i++) germ(c, -70 + (i % 2) * 120 + Math.sin(t * 2 + i) * 8, -50 + Math.floor(i / 2) * 100, st.germs, t + i);
  c.beginPath(); c.arc(0, 0, R0, 0, 7); c.strokeStyle = PAL.ink; c.lineWidth = 5; c.stroke(); c.restore(); }); }
// p8: big thermometer card with the 165 °F line; the reading sits low (cold spot)
function bigThermo(c, x, t, k, v) { livePop(c, 960, k, () => { const top = 360, bot = 900; paperRect(c, x - 50, top, 100, bot - top - 60, '#fff7e6', 50);
  c.fillStyle = PAL.border; c.beginPath(); c.arc(x, bot - 40, 78, 0, 7); c.fill(); c.fillStyle = '#3f8fd0'; c.strokeStyle = PAL.ink; c.lineWidth = 6; c.beginPath(); c.arc(x, bot - 40, 64, 0, 7); c.fill(); c.stroke();
  const hy = lerp(bot - 100, top + 40, v); c.fillStyle = '#3f8fd0'; c.fillRect(x - 18, hy, 36, bot - 100 - hy + 30);
  const my = lerp(bot - 100, top + 40, .82); c.strokeStyle = '#d64545'; c.lineWidth = 8; c.beginPath(); c.moveTo(x - 60, my); c.lineTo(x + 60, my); c.stroke();
  c.fillStyle = PAL.ink; c.font = '700 54px Fredoka'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText('165 °F', x - 80, my); c.font = '500 30px Fredoka'; c.fillText('safe', x - 80, my + 44);
  for (let i = 0; i < 8; i++) { const yy = lerp(bot - 100, top + 40, i / 8); c.strokeStyle = PAL.ink; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 18, yy); c.lineTo(x + 40, yy); c.stroke(); } }); }
// p10: a paper hand with a spoon stirring in circles over the top-down bowl
function handStir(c, t, k, cx, cy) { if (k <= .01) return; const a = t * 3.4, x = cx + Math.cos(a) * 120, y = cy + Math.sin(a) * 90; c.save(); c.globalAlpha = clamp(k * 2);
  c.strokeStyle = PAL.border; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 170, y - 300); c.stroke(); c.strokeStyle = '#c9cfd8'; c.lineWidth = 18; c.stroke(); c.strokeStyle = PAL.ink; c.lineWidth = 4; c.stroke();
  ink(c, wobble(x, y, 40, 30, 3, .03, 24), { fill: '#c9cfd8', w: 5 });
  const hx = x + 190, hy = y - 330; ink(c, wobble(hx, hy, 80, 66, 9, .06, 30), { fill: '#f2c9a0', stroke: PAL.border, w: 24 }); ink(c, wobble(hx, hy, 80, 66, 9, .06, 30), { fill: '#f2c9a0', w: 6 });
  [[-70, -30], [-60, 10], [-50, 44]].forEach(([dx, dy]) => ink(c, wobble(hx + dx, hy + dy, 34, 18, dx, .05, 18), { fill: '#f2c9a0', w: 5 })); ink(c, [[hx + 40, hy + 40], [hx + 140, hy + 160], [hx + 220, hy + 120], [hx + 110, hy - 10]], { fill: '#6fa8dc', w: 6 }); c.restore(); }

// ==================================================== BEATS + CAMERA ====================================================
// act start for pop-ins = the start of its page turn, so the next spread is already up while the old page lifts
const A0 = i => i ? Sa[i] - TW : -1;
function act1(c, t) {
  const kb = spr(t, -.6, .7); board(c, 'kitchen', (cc, w, h) => kitchenBoard(cc, w, h), kb); foldTab(c, 540, BOOK.fold, 820, kb);
  if (t < s(2) - .2) {                                     // p0-p1: the hook bowl (front-on), INSIDE OUT? + NOPE, the COLD probe
    ovenLive(c, t, spr(t, -.3, .6), 1);
    bowl(c, t, 1, { d: 80, core: COLD, steam: 1, bubbles: .8 });
    if (t > s(1) - .1) { const q = ease(ramp(t, s(1) + .2, .6)); ink(c, [[BW.cx - 10, 380 + q * 300], [BW.cx + 10, 380 + q * 300], [BW.cx + 10, 380 + q * 300 - 280], [BW.cx - 10, 380 + q * 300 - 280]], { fill: '#c9cfd8', w: 5 }); ink(c, wobble(BW.cx, 380 + q * 300 - 320, 50, 50, 8, .01, 30), { fill: '#fff7e6', w: 6 }); c.fillStyle = '#3f8fd0'; c.font = '700 30px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('COLD', BW.cx, 380 + q * 300 - 318); }
    const kd = ramp(t, -.6, .9), rise = ease(ramp(t, s(1) - .15, .5)), y1 = lerp(-260, 300, ease(kd)) - rise * 640;
    if (kd > 0 && rise < 1) { sign(c, 'inside', 'Inside out?', 380, y1 - 200, y1, 560, 150, Math.sin(ease(kd) * 3.5) * (1 - kd) * .1); stamp(c, 'NOPE', 380, y1 + 80, ramp(t, 1.4, .3)); }
    tag(c, 'cold', '', BW.cx, BW.surf + 150, 170, 80, '#dff1fb', ramp(t, s(1) + 1, .3));
  } else if (t < s(3) - .2) {                              // p2: the cross-section page and the 1-inch ruler
    const t0 = s(2) - .2, d = 70; slab(c, t, spr(t, t0, .6), d); slabWaves(c, t, ramp(t, t0 + .6, 1.2), d); ruler(c, SL.x + 40, SL.y + 8, 260, ramp(t, t0 + 1.6, .4), d);
    tag(c, 'about 1 inch', '2.5 cm', 600, 440, 380, 110, '#fff7e6', ramp(t, t0 + 1.9, .3)); tag(c, 'cold', '', 560, SL.y + SL.h / 2 + 10, 170, 80, '#dff1fb', ramp(t, t0 + 2.6, .3));
  } else if (t < s(4) - .2) {                              // p3: inside the oven: turntable + magnifier on jiggling molecules
    const t0 = s(3) - .2; ovenInside(c, t, spr(t, t0, .6), ramp(t, t0 + .6, .6)); tag(c, 'jiggle = heat', '', 640, 470, 400, 92, '#ffe9de', ramp(t, t0 + 1.6, .3));
  } else {                                                 // p4: conduction chain, edge -> center, slow
    const t0 = s(4) - .2, u = ramp(t, t0 + .6, 4.6); chain(c, t, spr(t, t0, .6), u);
    tag(c, 'edge', '', 250, 640, 160, 80, '#ffe9de', ramp(t, t0 + .4, .3)); tag(c, 'center', '', 800, 640, 200, 80, '#dff1fb', ramp(t, t0 + .5, .3)); tag(c, 'conduction', 'slow, cube by cube', 520, 500, 480, 120, '#fff7e6', ramp(t, t0 + 1.4, .3));
  }
}
function act2(c, t) {
  const o = A0(1); const kb = spr(t, o + .05, .5); board(c, 'freezer', freezerBoard, kb); foldTab(c, 540, BOOK.fold, 820, kb);
  if (t < s(7) - .2) {                                     // p5-p6: frozen block close-up: waves slip past the ice; then the edges thaw and overheat
    const kb2 = spr(t, o + .1, .5), thaw = ease(ramp(t, s(6) + .2, 3)); iceBlock(c, t, kb2, thaw);
    iceWaves(c, t, ramp(t, s(5) + .6, 1.4) * (1 - ramp(t, s(6) + .1, .3)));
    if (t > s(6)) slabWaves(c, t, 0, 0);
    const ks = ramp(t, o + .1, .7), rise = ease(ramp(t, s(5) + 1.6, .45)); if (ks > 0 && rise < 1) sign(c, 'frozen', 'Frozen?', 540, lerp(-260, 300, ease(ks)) - 200 - rise * 640, lerp(-260, 300, ease(ks)) - rise * 640, 480, 150, Math.sin(ease(ks) * 3.5) * (1 - ks) * .1);
    tag(c, 'ice barely absorbs', '', 540, 430, 520, 92, '#dff1fb', ramp(t, s(5) + 2.2, .3) * (1 - ramp(t, s(6) - .1, .25)));
    tag(c, 'edges: hotter', '', 420, 430, 400, 92, '#ffe9de', ramp(t, s(6) + 1.4, .3)); tag(c, 'icy', '', 540, 690, 150, 80, '#dff1fb', ramp(t, s(6) + 2.2, .3));
  } else if (t < s(8) - .2) {                              // p7: top-down: bubbling ring, icy centre
    const t0 = s(7) - .2; plateTop(c, t, spr(t, t0, .6), { ring: 90, edge: '#ff5a3a', core: ICE, ice: 1, bubbles: 1 });
    tag(c, 'bubbling', '', 540, 400, 300, 86, '#ffe9de', ramp(t, t0 + .6, .3)); tag(c, 'icy', '', 540, 700, 150, 80, '#dff1fb', ramp(t, t0 + 1.6, .3));
  } else {                                                 // p8: the big thermometer (165 °F) next to the cold spot with germs
    const t0 = s(8) - .2; plateTop(c, t, spr(t, t0, .6), { ring: 80, core: COLD, germs: back(ramp(t, t0 + .8, .5)) }, 400, 700, .72); bigThermo(c, 840, t, spr(t, t0 + .3, .6), lerp(.1, .3, ease(ramp(t, t0 + 1, 2))));
    tag(c, 'USDA', 'cold spot: bacteria survive', 330, 420, 400, 120, '#fff7e6', ramp(t, t0 + 2.4, .3));
  }
}
function act3(c, t) {
  const o = A0(2); const kb = spr(t, o + .05, .5); board(c, 'recipe', recipeBoard, kb); foldTab(c, 540, BOOK.fold, 820, kb);
  if (t < s(10) - .2) {                                    // p9: 3 tricks: sign + flip slats
    const ks = ramp(t, o + .1, .8), rise = ease(ramp(t, s(9) + 1.2, .45)); if (ks > 0 && rise < 1) sign(c, 'tricks', '3 tricks', 540, lerp(-260, 300, ease(ks)) - 200 - rise * 640, lerp(-260, 300, ease(ks)) - rise * 640, 500, 150, Math.sin(ease(ks) * 3.5) * (1 - ks) * .1);
    [['stir or rotate', '#bfe6c4'], ['medium power', '#ffd9a8'], ['let it stand', '#d6d9f5']].forEach(([txt, col], i) => slat(c, i, t, s(9) + 1.2 + i * .25, txt, col, 560 + i * 110, true));
  } else if (t < s(11) - .2) {                             // p10: a hand stirring the top-down bowl; the cold middle mixes out
    const t0 = s(10) - .2, u = ease(ramp(t, t0 + .6, 3.6)); plateTop(c, t, spr(t, t0, .6), { ring: 80, edge: mixc(HOT, WARM, u * .7), core: mixc(COLD, WARM, u), swirl: ramp(t, t0 + .6, .6) }, 540, 720, .95);
    handStir(c, t, ramp(t, t0 + .3, .4), 540, 720); tag(c, '1  stir or rotate', '', 360, 420, 440, 86, '#bfe6c4', ramp(t, t0 + .4, .3));
  } else if (t < s(12) - .2) {                             // p11: power-dial close-up
    const t0 = s(11) - .2; livePop(c, 960, spr(t, t0, .6), () => { paperRect(c, 170, 500, 740, 440, '#e9e4da', 20); dial(c, 540, 730, ease(ramp(t, t0 + .8, 1.2)), 1.5); });
    tag(c, '2  medium power', 'big portions', 540, 440, 520, 120, '#ffd9a8', ramp(t, t0 + .4, .3));
  } else {                                                 // p12: let it stand: timer close-up, the top-down bowl evens out
    const t0 = s(12) - .2, u = ease(ramp(t, t0 + .5, 4)); plateTop(c, t, spr(t, t0, .6), { ring: 80, mid2: 60, edge: mixc(HOT, WARM, .4 + .6 * u), mid: WARM, core: mixc('#c8e6c0', WARM, u) }, 660, 740, .7);
    timer(c, 300, 640, ramp(t, t0 + .5, 4.4), back(ramp(t, t0 + .2, .5)) * 1.5); tag(c, '3  let it stand', '', 380, 440, 420, 86, '#d6d9f5', ramp(t, t0 + .4, .3));
    tag(c, 'USDA', 'standing time completes the cooking', 540, 845, 720, 120, '#fff7e6', ramp(t, t0 + 2.0, .3));
  }
}
function act4(c, t) {
  const o = A0(3); const kb = spr(t, o + .05, .5); board(c, 'kitchen2', (cc, w, h) => kitchenBoard(cc, w, h, '#f1e6f0', '#e2cfe0'), kb); foldTab(c, 540, BOOK.fold, 820, kb);
  ovenLive(c, t, spr(t, o + .2, .5), 1);
  const mid2 = t < s(14) ? lerp(0, 60, ease(ramp(t, s(13) + 2.5, 2.5))) : 60;
  bowl(c, t, spr(t, o + .1, .5), { d: 80, mid2, core: COLD, steam: 1, bubbles: .6 });
  mwaves(c, t, ramp(t, s(13) + .4, 1.0) * (1 - ramp(t, s(14) - .2, .3)), 80); condArrows(c, t, ramp(t, s(13) + 2.4, .4) * (1 - ramp(t, s(14) - .2, .3)), 80);
  tag(c, 'outside: microwaves', '', 380, 520, 560, 92, '#ffe9de', ramp(t, s(13) + 1.0, .3) * (1 - ramp(t, s(14) - .2, .25)));
  tag(c, 'middle: conduction', '', 380, 630, 560, 92, '#dff1fb', ramp(t, s(13) + 2.6, .3) * (1 - ramp(t, s(14) - .2, .25)));
  const kq = ramp(t, s(14) - .1, .8), rq = ease(ramp(t, s(15) - .2, .45));
  if (kq > 0 && rq < 1) { const y = lerp(-260, 330, ease(kq)) - rq * 700; sign(c, 'yes', 'YES', 260, y - 200, y, 300, 140, Math.sin(ease(kq) * 3.5) * (1 - kq) * .12, { fill: '#bfe6c4' }); sign(c, 'no', 'NO', 620, y - 230, y + 30, 300, 140, -Math.sin(ease(kq) * 3.5) * (1 - kq) * .12, { fill: '#ffc4c4' }); }
  const kf = ramp(t, s(15) - .05, .9), yf = lerp(-300, 290, ease(kf));
  if (kf > 0) { sign(c, 'follow', 'Follow for more of\nhow it really works.', 540, yf - 200, yf, 860, 220, Math.sin(ease(kf) * 3.5) * (1 - kf) * .12, { font: '600 60px Fredoka' });
    label(c, "A new 'wait, really?' every day.", 470, yf + 290, { a: ramp(t, s(15) + .5, .3) }); label(c, '@howitreallyworkstudio', 470, yf + 390, { a: ramp(t, s(15) + .8, .3) }); }
}
const ACTS = [act1, act2, act3, act4];
// per-beat camera [start, zoom, cx, cy]; eased over 0.6 s at each cut, plus a slow push within the beat
const CAM = () => [[0, 1.08, 540, 760], [s(2) - .2, 1.3, 540, 620], [s(3) - .2, 1.3, 540, 620], [s(4) - .2, 1.32, 540, 620], [Sa[1] - TW, 1.2, 540, 690], [s(5) + .2, 1.25, 540, 620], [s(6) - .2, 1.2, 540, 620],
  [s(7) - .2, 1.3, 540, 620], [s(8) - .2, 1.18, 560, 620], [Sa[2] - TW, 1.08, 540, 720], [s(10) - .2, 1.35, 540, 620], [s(11) - .2, 1.35, 540, 620], [s(12) - .2, 1.25, 520, 620], [Sa[3] - TW, 1.08, 540, 760]];
function camAt(t) { const K = CAM(); let i = 0; for (let k = 0; k < K.length; k++) if (t >= K[k][0]) i = k; const cur = K[i], prev = K[Math.max(0, i - 1)], u = i ? ease(ramp(t, cur[0], .6)) : 1, push = 1 + .025 * ramp(t, cur[0], (K[i + 1] ? K[i + 1][0] : TOT) - cur[0]);
  return { z: lerp(prev[1], cur[1], u) * push, cx: lerp(prev[2], cur[2], u), cy: lerp(prev[3], cur[3], u) }; }

// ==================================================== frame ====================================================
function drawWorld(t) {
  let a = 0; for (let i = 1; i < 4; i++) if (t >= Sa[i] - TW) a = i;
  const turning = a >= 1 && t < Sa[a];
  book(g, { pageTint: TINT[a] }); lowerProps(g, t); lowerProps2(g);
  ACTS[a](g, t);
  if (turning) {
    la.setTransform(1, 0, 0, 1, 0, 0); la.clearRect(0, 0, W, H);
    la.fillStyle = TINT[a - 1]; rr(la, 94, 176, 892, 1480, 10); la.fill(); lowerProps(la, t); lowerProps2(la);
    ACTS[a - 1](la, t);
    const p = ramp(t, Sa[a] - TW, TW), e2 = ease(p), sy = Math.max(.001, 1 - e2), top = 176;
    const edge = top + 1480 * sy; g.save(); g.filter = 'blur(14px)'; g.fillStyle = `rgba(30,12,2,${.32 * (1 - p * .6)})`; g.fillRect(100, edge - 4, 880, 46); g.filter = 'none'; g.restore();
    g.save(); g.translate(0, top); g.scale(1, sy); g.translate(0, -top); g.drawImage(LA, 0, 0); g.restore();
    g.save(); g.globalAlpha = .28 * e2; g.fillStyle = '#2a1608'; g.fillRect(94, top, 892, Math.max(0, 1480 * sy)); g.restore();
  }
}
const LOOP = mkc(), lo = LOOP.getContext('2d');
function frame(t, cap = true) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); desk(g);
  const cm = camAt(t); g.save(); g.translate(540, 760); g.scale(cm.z, cm.z); g.translate(-cm.cx, -cm.cy); drawWorld(t); g.restore();
  if (!cap) return; let ci = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .1) ci = i;
  if (ci >= 0 && ci < PH.length - 1) sub2(g, PH[ci].cap, ramp(t, PH[ci].start - .1, .25) * (1 - ramp(t, PH[ci + 1] ? PH[ci + 1].start - .25 : 1e9, .15)));
}
window.DUR = TOT;
window.seek = t => { const lp = ramp(t, TOT - .6, .6); if (lp > 0) { frame(.6, false); lo.setTransform(1, 0, 0, 1, 0, 0); lo.drawImage(cv, 0, 0); }
  frame(t); if (lp > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = ease(lp); g.drawImage(LOOP, 0, 0); g.restore(); } };
window.render = window.seek;
// cover: the hook bowl (hot rim, cold core) under a sign
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); desk(g); book(g, {}); lowerProps(g, 0); board(g, 'kitchen', (cc, w, h) => kitchenBoard(cc, w, h), 1); foldTab(g, 540, BOOK.fold, 820, 1); ovenLive(g, 1, 1, 1);
  bowl(g, 1, 1, { d: 80, mid2: 0, core: COLD, steam: 1, bubbles: .8 }); tag(g, 'cold', '', BW.cx, BW.surf + 150, 170, 80, '#dff1fb', 1); sign(g, 'thumb', 'Cold in\nthe middle?', 380, 100, 300, 600, 240, 0); };

await document.fonts.load('600 60px Fredoka'); await document.fonts.load('700 60px Fredoka'); await document.fonts.load('500 30px Fredoka');
window.seek(0); window.ready = true; window.READY = true;
