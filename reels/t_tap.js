// Tap-to-pay. Style: "Retro / terminal" (awesome-opus-5-5-video-styles, styles/retro.md): CRT terminal, amber phosphor, scanlines, ASCII/line art, type-on text with blinking cursor, no modern gradients.
import { W, H, clamp, lerp, ramp, eo, E, bk, rnd, hash, S, En, P, cur, boot } from './r2lib.js';
const C = { bg: '#0b0802', am: '#ffb000', dim: '#7a5400', hot: '#ffe9a6', mid: '#c98500' };
const F = z => `${z}px VT323, monospace`;
const D = (t, a, b) => eo((t - a) / (b - a));
let G;
function T(s, x, y, o = {}) { G.save(); G.font = F(o.z ?? 30); G.textAlign = o.al ?? 'left'; G.textBaseline = 'middle'; G.fillStyle = o.col ?? C.am; G.shadowColor = o.glow ?? C.am; G.shadowBlur = o.blur ?? 8; G.globalAlpha = (o.a ?? 1); G.fillText(s, x, y); G.restore() }
function inv(s, x, y, o = {}) { G.save(); G.font = F(o.z ?? 30); const w = G.measureText(s).width; G.fillStyle = C.am; G.shadowColor = C.am; G.shadowBlur = 10; G.globalAlpha = o.a ?? 1; const al = o.al ?? 'left'; const x0 = al === 'center' ? x - w / 2 : x; G.fillRect(x0 - 5, y - (o.z ?? 30) * .48, w + 10, (o.z ?? 30) * .92); G.fillStyle = C.bg; G.shadowBlur = 0; G.textBaseline = 'middle'; G.textAlign = 'left'; G.fillText(s, x0, y); G.restore() }
function line(pts, o = {}) { G.save(); G.strokeStyle = o.col ?? C.am; G.lineWidth = o.w ?? 3; G.shadowColor = C.am; G.shadowBlur = 8; G.globalAlpha = o.a ?? 1; if (o.dash) G.setLineDash(o.dash); G.lineJoin = 'round'; G.lineCap = 'round'; G.beginPath(); pts.forEach((p, i) => i ? G.lineTo(p[0], p[1]) : G.moveTo(p[0], p[1])); if (o.close) G.closePath(); if (o.fill) { G.fillStyle = o.fill; G.fill() } G.stroke(); G.restore() }
const rect = (x, y, w, h, o) => line([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { ...o, close: true });
function terminal(x, y, a = 1) { G.save(); G.globalAlpha = a; rect(x, y, 130, 190, { fill: 'rgba(255,176,0,.05)' }); rect(x + 14, y + 40, 102, 44, {}); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { G.fillStyle = C.am; G.beginPath(); G.arc(x + 34 + c * 30, y + 112 + r * 24, 4, 0, 7); G.fill() }
  for (let k = 0; k < 4; k++) { G.strokeStyle = C.am; G.lineWidth = 3; G.shadowColor = C.am; G.shadowBlur = 8; G.beginPath(); G.ellipse(x + 65, y + 18, 54 - k * 12, 11 - k * 2, 0, 0, 7); G.stroke() } G.restore() }
function card(x, y, a = 1, cur_ = 0) { G.save(); G.globalAlpha = a; G.translate(x, y); G.save(); G.beginPath(); G.roundRect(0, 0, 170, 108, 10); G.fillStyle = C.bg; G.fill(); G.restore(); line([[10, 0], [160, 0], [170, 10], [170, 98], [160, 108], [10, 108], [0, 98], [0, 10]], { close: true });
  rect(16, 22, 34, 26, { w: 2 }); G.strokeStyle = C.am; G.lineWidth = 2; G.shadowColor = C.am; G.shadowBlur = 6; for (let k = 0; k < 3; k++) { G.beginPath(); G.roundRect(64 + k * 9, 20 + k * 9, 92 - k * 18, 74 - k * 18, 6); G.stroke() } T('****  ****  ****', 14, 84, { z: 22 });
  if (cur_ > 0) { G.fillStyle = C.hot; G.shadowColor = C.hot; G.shadowBlur = 16 * cur_; G.globalAlpha = cur_; G.fillRect(16, 22, 34, 26) } G.restore() }
function fieldArcs(t, x, y, rmax, alpha = 1, dir = 1, fade = 1) { for (let k = 0; k < 4; k++) { const u = ((t * .9 * dir + k / 4) % 1 + 1) % 1, r = 10 + u * rmax; G.save(); G.strokeStyle = C.am; G.globalAlpha = alpha * (1 - u) * fade; G.lineWidth = 3; G.shadowColor = C.am; G.shadowBlur = 8; G.setLineDash(Math.floor(t * 8 + k) % 2 ? [10, 6] : [4, 8]); G.beginPath(); G.arc(x, y, r, -Math.PI * .95, -Math.PI * .05); G.stroke(); G.restore() } }
// caption: typed on, inverse-video highlights
function captionTerm(t) {
  const i = cur(t), last = i === P.length - 1; if (i < 0 || (!last && t > P[i].end + .5)) return; const k = t - P[i].start, a = last ? 1 : clamp((P[i].end + .5 - t) / .2);
  const words = []; let hl = false; P[i].cap.split(/(\*\*)/).forEach(sg => { if (sg === '**') { hl = !hl; return } sg.split(/\s+/).filter(Boolean).forEach(w => words.push({ w, hl })) });
  const z = 36; G.font = F(z); const cw = G.measureText('M').width, maxc = Math.floor(470 / cw); const lines = []; let cl = [], n = 0;
  words.forEach(wd => { if (n + wd.w.length + (n ? 1 : 0) > maxc && cl.length) { lines.push(cl); cl = []; n = 0 } cl.push(wd); n += wd.w.length + (n ? 1 : 0) }); lines.push(cl);
  const total = words.reduce((s, w) => s + w.w.length + 1, 0), typed = Math.floor(clamp(k / Math.max(.8, (P[i].end - P[i].start) * .75)) * total);
  let used = 0; const y0 = 120; G.globalAlpha = a;
  T('>', 20, y0, { z, col: C.mid }); G.globalAlpha = a;
  lines.forEach((L, li) => { let x = 52; L.forEach(wd => { const take = clamp(typed - used, 0, wd.w.length), s = wd.w.slice(0, take); if (take > 0) { if (wd.hl) inv(s, x, y0 + li * 40, { z }); else T(s, x, y0 + li * 40, { z, col: C.hot }) } used += wd.w.length + 1; x += (wd.w.length + 1) * cw }) });
  if (typed < total || Math.floor(t * 2.5) % 2) { const li = lines.length - 1; const lastLen = lines[li].reduce((s, w) => s + w.w.length + 1, 0); if (typed >= total) { G.fillStyle = C.am; G.globalAlpha = a; G.fillRect(52 + lastLen * cw, y0 + li * 40 - 14, cw * .8, 28) } }
  G.globalAlpha = 1;
}
function draw(g, t) {
  G = g; const i = cur(t);
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const flick = 1 - .04 * Math.sin(t * 60) * Math.sin(t * 7);
  g.save(); g.globalAlpha = flick;
  // top status bar
  T('HOW-IT-REALLY-WORKS TERMINAL v1.0', 20, 40, { z: 22, col: C.dim, glow: C.dim, blur: 2 }); T(`T+${t.toFixed(1).padStart(5, '0')}s`, 520, 40, { z: 22, col: C.dim, glow: C.dim, blur: 2, al: 'right' });
  const sx = 70, sy = 440, cx0 = 320, cy0 = 470;
  const S_ = k => S(k);
  if (i === 0) { const a = D(t, 0, .4); card(cx0 - 20, cy0, 1); // battery crossed
    const b = D(t, S(0) + 1.2, S(0) + 2); g.globalAlpha = b * flick; rect(70, 500, 70, 34, { w: 3 }); g.fillStyle = C.am; g.fillRect(140, 510, 8, 14); T('BATTERY: NONE', 70, 570, { z: 30 }); line([[60, 490], [150, 545]], { w: 5 }); line([[150, 490], [60, 545]], { w: 5 }); g.globalAlpha = flick;
    const tp = D(t, S(0) + 2.4, S(0) + 3.2); T('> tap_', 70, 700, { z: 36, col: C.hot, a: tp }) }
  if (i === 1) { const a = D(t, S(1), S(1) + .6); terminal(sx, sy, 1); card(cx0 + 10 - (1 - D(t, S(1) + .6, S(1) + 1.6)) * 0 + 0, cy0 + 30, 1, D(t, S(1) + 2.2, S(1) + 3));
    fieldArcs(t, sx + 65, sy + 18, 240, D(t, S(1) + 1.2, S(1) + 1.8)); T('READING?', 90, 700, { z: 32, a: D(t, S(1) + .3, S(1) + .8) * (1 - D(t, S(1) + 1.6, S(1) + 2)) }); inv('POWERING', 90, 700, { z: 32, a: D(t, S(1) + 2, S(1) + 2.6) }) }
  if (i === 2) { terminal(sx, sy, 1); fieldArcs(t, sx + 65, sy + 18, 260, 1); const k = D(t, S(2) + 1.2, S(2) + 2); g.globalAlpha = k * flick; T('FIELD FLIPS', 60, 700, { z: 32 }); const n = Math.min(13560000, Math.floor(13560000 * D(t, S(2) + 2.2, S(2) + 5.2) + 1)); T(n.toLocaleString('en-US') + ' / sec', 60, 745, { z: 40, col: C.hot }); g.globalAlpha = flick; T('(13.56 MHz)', 60, 785, { z: 26, col: C.mid }) }
  if (i === 3) { terminal(sx, sy, 1); card(cx0 - 20, cy0 + 10, 1); fieldArcs(t, sx + 65, sy + 18, 300, .8); const k = D(t, S(3) + 1, S(3) + 1.8); g.globalAlpha = k * flick; for (let j = 0; j < 6; j++) { const u = ((t * 1.4 + j / 6) % 1); const px = cx0 - 4 + 20 + (u < .5 ? u * 2 * 120 : 120), py = cy0 + 10 + (u < .5 ? 20 : 20 + (u - .5) * 2 * 68); g.fillStyle = C.hot; g.shadowColor = C.hot; g.shadowBlur = 10; g.beginPath(); g.arc(px - 20 + 20, py + 10, 5, 0, 7); g.fill() } g.globalAlpha = flick; T('tiny current', 250, 700, { z: 36, a: k }) }
  if (i === 4) { // transformer
    const a = D(t, S(4) + .2, S(4) + .8); g.globalAlpha = a * flick; for (let k = 0; k < 4; k++) { g.strokeStyle = C.am; g.lineWidth = 4; g.shadowColor = C.am; g.shadowBlur = 8; g.beginPath(); g.arc(150, 500 + k * 28, 22, -Math.PI / 2, Math.PI / 2); g.stroke(); g.beginPath(); g.arc(390, 500 + k * 28, 22, Math.PI / 2, Math.PI * 1.5); g.stroke() }
    line([[270, 480], [270, 620]], { w: 3, dash: [8, 8] }); T('terminal coil', 150, 650, { z: 26, al: 'center' }); T('card coil', 390, 650, { z: 26, al: 'center' }); T('~ magnetic ~', 270, 720, { z: 30, al: 'center', a: D(t, S(4) + 1, S(4) + 1.5) }); g.globalAlpha = flick;
    const c = D(t, S(4) + 2, S(4) + 2.8); g.globalAlpha = c * flick; inv('CHIP: AWAKE', 270, 790, { z: 36, al: 'center' }); g.globalAlpha = flick }
  if (i === 5) { terminal(70, 440, 1); const mv = D(t, S(5) + .2, S(5) + 1.6), cxx = lerp(400, 250, mv); card(cxx - 40, 470, 1);
    const a = D(t, S(5) + 1.2, S(5) + 1.9); g.globalAlpha = a * flick; line([[200, 690], [200 + (mv) * 0, 690]], {}); line([[205, 700], [350, 700]], { w: 3 }); line([[205, 690], [205, 710]], { w: 3 }); line([[350, 690], [350, 710]], { w: 3 }); T('about 4 cm or less', 270, 745, { z: 36, al: 'center', col: C.hot }); T('(never more than ~10 cm)', 270, 785, { z: 26, al: 'center', col: C.mid }); g.globalAlpha = flick }
  if (i === 6) { terminal(60, 420, 1); card(330, 430, 1, 1); const msgs = [['TERMINAL > hello', 70, 650], ['CARD     > issuer details', 70, 690], ['TERMINAL > check...', 70, 730]];
    msgs.forEach(([s, x, y], k) => { const n = Math.floor(clamp((t - S(6) - .4 - k * 1.0) / .7) * s.length); if (n > 0) T(s.slice(0, n), x, y, { z: 30 }) }); const ok = D(t, S(6) + 3.4, S(6) + 3.9); inv('GENUINE: OK', 70, 790, { z: 36, a: ok }) }
  if (i === 7 || i === 8) {
    const hex = k => ((hash(k * 3.17) * 65535) | 0).toString(16).toUpperCase().padStart(4, '0') + ' ' + ((hash(k * 9.1) * 65535) | 0).toString(16).toUpperCase().padStart(4, '0');
    const rows = [['PAYMENT #1', 1], ['PAYMENT #2', 2], ['PAYMENT #3', 3]];
    rows.forEach(([l, k], r) => { const a = D(t, S(7) + .3 + r * .8, S(7) + .9 + r * .8); g.globalAlpha = a * flick; T(l, 40, 360 + r * 70, { z: 30, col: C.mid }); T('CODE ' + hex(k), 250, 360 + r * 70, { z: 36, col: C.hot }); if (i === 8 || t > S(7) + 3.4) T('USED', 480, 360 + r * 70, { z: 26, al: 'right', col: C.dim }); g.globalAlpha = flick });
    T('(example codes)', 270, 580, { z: 22, al: 'center', col: C.dim, glow: C.dim, blur: 2, a: D(t, S(7) + 1, S(7) + 1.6) });
    if (i === 8) { const a = D(t, S(8) + .4, S(8) + 1); g.globalAlpha = a * flick; T('THIEF RECORDS: CODE ' + hex(1), 40, 650, { z: 28 }); const b = D(t, S(8) + 1.8, S(8) + 2.4); g.globalAlpha = b * flick; T('REPLAYS IT...', 40, 700, { z: 30 }); const c = D(t, S(8) + 2.6, S(8) + 3.2); g.globalAlpha = c * flick; inv('DECLINED: ALREADY USED', 40, 765, { z: 34 }); g.globalAlpha = flick }
    else if (t > S(7) + 3.6) { g.globalAlpha = D(t, S(7) + 3.6, S(7) + 4.2) * flick; inv('ONE-TIME ONLY', 270, 700, { z: 40, al: 'center' }); g.globalAlpha = flick } }
  if (i === 9) { const a = D(t, S(9) + .3, S(9) + .9); g.globalAlpha = a * flick; rect(30, 380, 230, 250, { w: 3 }); T('PHONE', 145, 410, { z: 28, al: 'center' }); T('REAL CARD', 44, 470, { z: 26, col: C.mid }); T('4*** **** **** 1234', 44, 510, { z: 24 }); T('(kept hidden)', 44, 550, { z: 22, col: C.dim, glow: C.dim, blur: 2 });
    const b = D(t, S(9) + 1.6, S(9) + 2.4); g.globalAlpha = b * flick; line([[262, 520], [320, 520]], { w: 4 }); line([[308, 508], [320, 520], [308, 532]], { w: 4 }); T('TERMINAL', 330, 410, { z: 28 }); T('STAND-IN', 330, 470, { z: 28, col: C.hot }); T('NUMBER', 330, 505, { z: 28, col: C.hot }); inv('+ code', 330, 580, { z: 28 }); g.globalAlpha = flick }
  if (i === 10) { terminal(40, 400, 1); const fade = 1 - D(t, S(10) + 1, S(10) + 2.4); fieldArcs(t, 105, 418, 300, .9, 1, fade + .08); const a = D(t, S(10) + .4, S(10) + 1); card(380 + (1 - a) * 0 + 0, 610, 1, 0);
    g.globalAlpha = D(t, S(10) + 2.4, S(10) + 3) * flick; T('SIGNAL AT CARD: ~0', 40, 780, { z: 34, col: C.hot }); inv('NO POWER', 340, 735, { z: 30 }); g.globalAlpha = flick }
  if (i === 11) { const a = D(t, S(11) + .3, S(11) + .9), b = D(t, S(11) + 1.6, S(11) + 2.2); g.globalAlpha = a * flick; T('AMOUNT < LIMIT', 40, 420, { z: 38 }); T('-> TAP AND GO', 40, 465, { z: 38, col: C.hot }); g.globalAlpha = b * flick; T('AMOUNT > LIMIT', 40, 560, { z: 38 }); inv('-> ENTER PIN', 40, 605, { z: 38 }); g.globalAlpha = D(t, S(11) + 2.6, S(11) + 3.2) * flick; T('limit varies by country & bank', 270, 740, { z: 28, al: 'center', col: C.mid }); g.globalAlpha = flick }
  if (i === 12) { const a = D(t, S(12) + .3, S(12) + 1); g.globalAlpha = a * flick; const rows = ['[x] chip authenticates card', '[x] one-time code per payment', '[x] same fraud protections']; rows.forEach((s, k) => { g.globalAlpha = D(t, S(12) + .4 + k * .7, S(12) + .9 + k * .7) * flick; T(s, 30, 430 + k * 60, { z: 31 }) }); g.globalAlpha = flick }
  if (i === 13) { terminal(60, 420, 1); card(330, 440, 1, 1); fieldArcs(t, 125, 438, 240, 1); const a = D(t, S(13) + 2, S(13) + 2.8); g.globalAlpha = a * flick; inv('TAP = RADIO CONVERSATION', 270, 720, { z: 32, al: 'center' }); g.globalAlpha = flick }
  if (i === 14) { card(185, 440 + Math.sin(t * 3) * 6, 1, 0); const a = D(t, S(14) + .6, S(14) + 1.2); g.globalAlpha = a * flick; T('> insert_card  (still?)', 270, 700, { z: 34, al: 'center', col: C.hot }); g.globalAlpha = flick }
  if (i >= 15) { const a = D(t, S(15), S(15) + .5); g.globalAlpha = a * flick; inv('FOLLOW', 270, 560, { z: 90, al: 'center' }); g.globalAlpha = flick }
  captionTerm(t);
  g.restore();
  // CRT: scanlines, vignette, slight bloom band
  g.save(); g.globalAlpha = .22; g.fillStyle = '#000'; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1.2); g.restore();
  const vg = g.createRadialGradient(W / 2, H / 2, 280, W / 2, H / 2, 640); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const rb = (t * .35 % 1.3) * H - 100; g.fillStyle = 'rgba(255,176,0,.035)'; g.fillRect(0, rb, W, 120);
}
boot({ draw, fonts: ['30px VT323'] });
