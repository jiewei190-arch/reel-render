// barcode: kinetic typography (recipe: awesome-opus-5-5 "Kinetic typography": one bold face, huge words that snap on the beat, strict grid, 2-3 colours + one electric accent, hard cuts, no imagery). Original code.
import { clamp, ramp, ease, eo, lerp, pop, rnd, s, e, TL, captions } from './rl.js';
const cv = document.getElementById('c'), ctx = cv.getContext('2d'); const W = 540, H = 960;
const INK = '#0c0c0c', PAPER = '#f3efe4', RED = '#ff2d1f', GREY = '#8d897f';
const A = "'Anton', Impact, sans-serif", MONO = "'JetBrains Mono', monospace";
const beat = 60 / 88; const pulse = t => Math.exp(-(t % beat) * 6);
// ---- real UPC-A
const DIG = '036000291452';
const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const Rr = L.map(p => [...p].map(b => b === '0' ? '1' : '0').join(''));
const BITS = '101' + [...DIG.slice(0, 6)].map(d => L[+d]).join('') + '01010' + [...DIG.slice(6)].map(d => Rr[+d]).join('') + '101';
const NB = BITS.length; // 95
// ---- primitives
let curBG = INK;
function rect(c, x, y, w, h) { if (w === W && h === H) curBG = c; ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function T(str, x, y, size, c, o = {}) { ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.sc) ctx.scale(o.sc, o.sc); ctx.globalAlpha = o.a ?? 1; if (!o.f || o.f === A) { ctx.font = `400 ${size}px ${A}`; ctx.letterSpacing = (o.ls ?? 0) + 'px'; const mw = ctx.measureText(str).width; if (mw > (o.maxw ?? 490)) size *= (o.maxw ?? 490) / mw; }
  ctx.font = `${o.w ?? 400} ${size}px ${o.f ?? A}`; ctx.textAlign = o.al ?? 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = c; ctx.letterSpacing = (o.ls ?? 0) + 'px'; ctx.fillText(str, 0, 0); ctx.restore(); }
// snap-in word: scale-down slam with a little overshoot, hard on the beat
function slam(str, x, y, size, c, t, t0, o = {}) { const k = t - t0; if (k < 0) return; const u = clamp(k / .14); const sc = 1 + (1 - eo(u)) * .45; T(str, x, y, size, c, { ...o, sc, a: (o.a ?? 1) * clamp(k / .05) }); }
// wipe-in word (mask from left)
function wipe(str, x, y, size, c, t, t0, d = .25, o = {}) { const k = ramp(t, t0, d); if (k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(0, y - size, W * 2, size * 1.3); ctx.rect(0, 0, 0, 0); ctx.restore(); ctx.save(); ctx.beginPath(); const w = ctx.measureText(str).width; ctx.rect(x - 300, y - size * 1.05, 600 * k, size * 1.3); ctx.clip(); T(str, x, y, size, c, o); ctx.restore(); }
function bars(x, y, w, h, from = 0, to = NB, col = INK, bits = BITS, tall = 0) { const mw = w / NB; ctx.fillStyle = col; for (let i = from; i < to; i++) if (bits[i] === '1') ctx.fillRect(x + i * mw, y, mw + .4, h + ((i < 3 || (i >= 45 && i < 50) || i >= NB - 3) ? tall : 0)); }
function digits(x, y, w, size, c, k = 1, col2 = RED) { const mw = w / 12; for (let i = 0; i < 12; i++) { const a = ramp(k, i / 12, .12); T(DIG[i], x + mw * (i + .5), y, size, i === 11 ? col2 : c, { f: MONO, w: 700, a }); } }
const stripe = (t, c1, c2) => { for (let x = 0; x < W; x += 18) rect((Math.floor(x / 18) + Math.floor(t * 8)) % 2 ? c1 : c2, x, 0, 18, H); };
// ---- scenes
const sc = [];
const scn = (a, b, fn) => sc.push({ a, b, fn });
// 0 price
scn(0, s(1) - .05, t => { rect(PAPER, 0, 0, W, H); const k = t + .35;
  slam('NO', 270, 250, 220, INK, k, .3); slam('PRICE', 270, 470, 250, INK, k, .55);
  const sk = ramp(t, 1.0, .18); ctx.fillStyle = RED; ctx.fillRect(20, 400 - 10, 500 * sk, 26);
  bars(60, 560, 420, 150, 0, Math.floor(NB * ramp(t, .6, 1.2)), INK); });
// 1 name
scn(s(1) - .05, s(2) - .05, t => { rect(RED, 0, 0, W, H); const k = t - s(1) + .05; slam('NO', 270, 260, 220, PAPER, k, 0); slam('NAME', 270, 480, 250, PAPER, k, .12); rect(INK, 20, 400, 500 * ramp(k, .75, .15), 26); slam('EITHER', 270, 700, 110, INK, k, .45); });
// 2 number
scn(s(2) - .05, s(3) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(2) + .05; slam('ONE', 270, 240, 230, PAPER, k, .1); slam('NUMBER', 270, 440, 200, RED, k, .5);
  digits(30, 560, 480, 38, PAPER, ramp(k, 1.2, 1.4)); const tw = e(2) - 1.6; if (t > tw) { slam('12 DIGITS', 270, 680, 100, PAPER, t, tw); rect(RED, 80, 700, 380 * ramp(t, tw + .15, .2), 10); } });
// 3 lookup
scn(s(3) - .05, s(4) - .05, t => { rect(PAPER, 0, 0, W, H); const k = t - s(3) + .05; slam('LOOK', 270, 200, 200, INK, k, 0); slam('IT UP', 270, 380, 200, RED, k, .18);
  bars(110, 450, 320, 70, 0, NB, INK); digits(60, 560, 420, 26, INK, 1);
  const ak = ramp(k, 1.2, .3); ctx.globalAlpha = ak; ctx.fillStyle = INK; ctx.fillRect(268, 575, 4, 40 * ak); ctx.beginPath(); ctx.moveTo(258, 612); ctx.lineTo(282, 612); ctx.lineTo(270, 630); ctx.fill(); ctx.globalAlpha = 1;
  const tk = ramp(k, 1.9, .3); if (tk > 0) { ctx.globalAlpha = tk; rect(INK, 50, 640, 440, 110); T('STORE COMPUTER · EXAMPLE', 70, 668, 14, GREY, { f: MONO, w: 700, al: 'left', ls: 1 }); T('036000291452', 70, 712, 32, PAPER, { f: MONO, w: 700, al: 'left' }); T('$2.49', 470, 724, 60, RED, { al: 'right' }); ctx.globalAlpha = 1; } });
// 4 how
scn(s(4) - .05, s(5) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(4) + .05; ctx.globalAlpha = .25; stripe(t, INK, '#1d1d1d'); ctx.globalAlpha = 1; slam('HOW?', 270, 420, 330, RED, k, .05); wipe('STRIPES → DIGITS', 270, 520, 56, PAPER, t, s(4) + 1.4, .35); bars(60, 580, 420, 90, 0, NB, PAPER); });
// 5 laser
const BX = 55, BW = 430, BY = 330, BH = 210;
function laserBarcode(t, t0, dur, bg = INK) { const p = clamp((t - t0) / dur); const lx = BX + BW * p; rect(PAPER, BX - 12, BY - 12, BW + 24, BH + 24); bars(BX, BY, BW, BH, 0, NB, INK);
  // glow beam
  ctx.save(); const g = ctx.createLinearGradient(lx - 50, 0, lx + 50, 0); g.addColorStop(0, 'rgba(255,45,31,0)'); g.addColorStop(.5, 'rgba(255,45,31,.55)'); g.addColorStop(1, 'rgba(255,45,31,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 50, BY - 70, 100, BH + 140); ctx.fillStyle = RED; ctx.fillRect(lx - 1.5, BY - 70, 3, BH + 140); ctx.restore(); return { p, lx }; }
scn(s(5) - .05, s(6) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(5) + .05; slam('LASER', 270, 230, 190, RED, k, .05); laserBarcode(t, s(5) + .3, 1.2); slam('SWEEP', 270, 760, 110, PAPER, t, s(5) + .5); });
// 6 absorb / bounce
scn(s(6) - .05, s(7) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(6) + .05; const w1 = e(6) - 2.8; const sw = (t - s(6)) * .35 % 1; slam('BLACK', 30, 200, 100, PAPER, k, .05, { al: 'left', maxw: 195 }); slam('ABSORB', 510, 200, 100, GREY, k, .3, { al: 'right', maxw: 255 });
  slam('WHITE', 30, 320, 100, PAPER, t, s(6) + 1.3, { al: 'left', maxw: 195 }); slam('BOUNCE', 510, 320, 100, RED, t, s(6) + 1.5, { al: 'right', maxw: 255 });
  laserBarcode(t, s(6) - .05, 3.0); const gp = clamp((t - s(6)) / 3.0); const idx = Math.min(NB - 1, Math.floor(gp * NB)); const bit = BITS[idx]; ctx.fillStyle = bit === '1' ? INK : RED; ctx.fillRect(BX, 620, BW, 14); const lvl = bit === '1' ? .12 : .9; rect(PAPER, BX, 660, BW * .0 + 20, 0); T(bit === '1' ? 'DARK: LIGHT LOST' : 'LIGHT: BOUNCES BACK', 270, 700, 30, bit === '1' ? GREY : RED, { f: MONO, w: 700 }); });
// 7 signal
scn(s(7) - .05, s(8) - .05, t => { rect(PAPER, 0, 0, W, H); const k = t - s(7) + .05; slam('SIGNAL', 270, 230, 210, INK, k, 0);
  const p = clamp((t - s(7) - .2) / 1.5); const x0 = 40, wd = 460, y0 = 420, hh = 110; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i <= Math.floor(NB * p); i++) { const v = BITS[Math.min(i, NB - 1)] === '1' ? 0 : 1; const x1 = x0 + wd * i / NB, x2 = x0 + wd * (i + 1) / NB; const y = y0 + (1 - v) * hh; if (i === 0) ctx.moveTo(x1, y); else ctx.lineTo(x1, y); ctx.lineTo(x2, y); } ctx.stroke();
  const lx = x0 + wd * p; ctx.fillStyle = RED; ctx.fillRect(lx - 1.5, y0 - 30, 3, hh + 60);
  bars(x0, 600, wd, 80, 0, NB, INK); T('HIGH = GAP', 40, y0 - 14, 15, RED, { f: MONO, w: 700, al: 'left' }); T('LOW = BAR', 40, y0 + hh + 28, 15, INK, { f: MONO, w: 700, al: 'left' }); T('WIDTHS = DIGITS', 270, 740, 40, RED, { a: ramp(t, s(7) + 1.2, .1) }); });
// 8 seven slices
scn(s(8) - .05, s(9) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(8) + .05; slam('ONE DIGIT', 270, 190, 120, PAPER, k, 0); const e7 = e(8) - 1.7; slam('7 SLICES', 270, 330, 170, RED, t, e7 - .2);
  const pat = L[0]; const cw = 62, x0 = 270 - cw * 3.5; for (let i = 0; i < 7; i++) { const a = ramp(t, s(8) + 1 + i * .35, .15); if (a <= 0) continue; ctx.globalAlpha = a; rect(PAPER, x0 + i * cw, 430, cw - 4, 150); if (pat[i] === '1') rect(INK, x0 + i * cw, 430, cw - 4, 150); T(pat[i], x0 + i * cw + (cw - 4) / 2, 625, 34, PAPER, { f: MONO, w: 700 }); ctx.globalAlpha = 1; }
  T('DIGIT 0  =  0001101', 270, 700, 30, GREY, { f: MONO, w: 700, a: ramp(t, s(8) + 3.6, .2) }); });
// 9 opposite
scn(s(9) - .05, s(10) - .05, t => { rect(PAPER, 0, 0, W, H); const k = t - s(9) + .05; slam('OPPOSITE', 270, 200, 190, INK, k, 0); const cw = 30; const draw = (pat, x, y, flip) => { for (let i = 0; i < 7; i++) { const dark = pat[i] === '1'; rect(dark ? INK : '#d9d4c6', x + i * cw, y, cw - 2, 160); } };
  const fk = ease(ramp(t, s(9) + 1.4, .6)); const left = L[3], right = Rr[3]; const mix = [...left].map((b, i) => fk > .5 ? right[i] : b).join('');
  T('LEFT HALF', 150, 330, 22, INK, { f: MONO, w: 700 }); draw(left, 45, 360, 0); T('RIGHT HALF', 390, 330, 22, RED, { f: MONO, w: 700, a: ramp(t, s(9) + .8, .2) }); ctx.globalAlpha = ramp(t, s(9) + .8, .2); draw(right, 285, 360, 0); ctx.globalAlpha = 1;
  const sw = ramp(t, s(9) + 1.4, .5); if (sw > 0) { T('↔', 270, 460, 70, RED, { a: sw, sc: .7 + .3 * sw }); } T('SAME DIGIT, FLIPPED INK', 270, 620, 30, INK, { f: MONO, w: 700, a: ramp(t, s(9) + 1.7, .2) }); T('dark ⇄ light', 270, 670, 44, RED, { a: ramp(t, s(9) + 2, .2) }); });
// 10 backwards
scn(s(10) - .05, s(11) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(10) + .05; slam('BACKWARDS?', 270, 220, 130, PAPER, k, 0); const rt = e(10) - 1.9; const a = ease(ramp(t, rt, .9)) * Math.PI; ctx.save(); ctx.translate(270, 480); ctx.rotate(a); rect(PAPER, -BW / 2 - 12, -BH / 2 - 12, BW + 24, BH + 24); bars(-BW / 2, -BH / 2, BW, BH, 0, NB, INK); ctx.restore(); slam('OK.', 270, 760, 150, RED, t, rt + .8); T('UPSIDE DOWN TOO', 270, 810 - 40, 24, PAPER, { f: MONO, w: 700, a: ramp(t, rt + 1, .2) }); });
// 11 check digit
scn(s(11) - .05, s(12) - .05, t => { rect(PAPER, 0, 0, W, H); const k = t - s(11) + .05; slam('CHECK', 270, 220, 200, INK, k, 0); slam('DIGIT', 270, 400, 200, RED, k, .15); digits(25, 560, 490, 40, INK, 1); const bk = ramp(t, s(11) + 1.2, .25); ctx.globalAlpha = bk; ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.strokeRect(25 + 490 / 12 * 11 - 6, 520, 490 / 12 + 12, 62); ctx.globalAlpha = 1; T('LAST ONE', 505, 640, 26, RED, { f: MONO, w: 700, a: bk, al: 'right' }); });
// 12 math + reject
scn(s(12) - .05, s(13) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(12) + .05; const st = i => ramp(t, s(12) + .3 + i * .9, .2);
  T('03600029145', 270, 140, 56, PAPER, { f: MONO, w: 700 }); T('(first eleven digits)', 270, 175, 16, GREY, { f: MONO, w: 500, a: st(0) });
  slam('ODD  0+6+0+2+1+5 = 14', 270, 260, 30, PAPER, t, s(12) + .3, { f: MONO, w: 700 }); slam('14 × 3 = 42', 270, 330, 52, RED, t, s(12) + 1.2); slam('EVEN  3+0+0+9+4 = 16', 270, 400, 30, PAPER, t, s(12) + 2.2, { f: MONO, w: 700 }); slam('42 + 16 = 58', 270, 470, 52, RED, t, s(12) + 3.0); slam('58 + 2 = 60', 270, 560, 70, PAPER, t, s(12) + 3.7); const ok = ramp(t, s(12) + 3.9, .2); T('✓ ENDS IN 0', 270, 610, 28, RED, { f: MONO, w: 700, a: ok });
  const rj = e(12) - 1.3; if (t > rj) { rect(RED, 0, 650, W, 130); slam('REJECTED', 270, 755, 130, PAPER, t, rj); } });
// 13 smudge caught
scn(s(13) - .05, s(14) - .05, t => { rect(PAPER, 0, 0, W, H); const k = t - s(13) + .05; slam('CAUGHT', 270, 250, 200, RED, k, 0); rect(INK, BX - 12, 330, BW + 24, 190); rect(PAPER, BX - 6, 336, BW + 12, 178); bars(BX, 345, BW, 150, 0, NB, INK);
  const sm = ramp(t, s(13) + .6, .25); ctx.fillStyle = '#1a1a1a'; ctx.globalAlpha = sm; ctx.beginPath(); ctx.ellipse(300, 430, 70 * sm + 10, 52 * sm + 8, .4, 0, 7); ctx.fill(); ctx.globalAlpha = 1; T('SMUDGE', 300, 445, 24, PAPER, { f: MONO, w: 700, a: sm });
  const xk = pop(ramp(t, s(13) + 1.3, .4)); if (xk > 0) { ctx.save(); ctx.translate(270, 600); ctx.scale(xk, xk); ctx.strokeStyle = RED; ctx.lineWidth = 16; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(50, 50); ctx.moveTo(50, -50); ctx.lineTo(-50, 50); ctx.stroke(); ctx.restore(); }
  slam('NOT WRONG ITEM', 270, 760, 70, INK, t, s(13) + 2.2); });
// 14 gum
scn(s(14) - .05, s(15) - .05, t => { rect(RED, 0, 0, W, H); const k = t - s(14) + .05; slam('GUM', 270, 380, 380, PAPER, k, .05); const pk = pop(ramp(t, s(14) + 1.0, .5)); ctx.save(); ctx.translate(270, 620); ctx.rotate(-.05); ctx.scale(pk * 1.5, pk * 1.5); rect(PAPER, -100, -50, 200, 100); rect(INK, -100, -50, 200, 18); rect(INK, -100, 32, 200, 18); T('GUM', -50, 14, 38, INK, {}); bars(10, -22, 80, 44, 0, NB, INK); ctx.restore(); });
// 15 date
scn(s(15) - .05, s(16) - .05, t => { rect(INK, 0, 0, W, H); const k = t - s(15) + .05; slam('JUNE 26', 270, 230, 170, PAPER, t, s(15) + .1); slam('1974', 270, 430, 250, RED, t, s(15) + 1.6); slam('TROY, OHIO', 270, 550, 100, PAPER, t, s(15) + 2.9); slam('JUICY FRUIT', 270, 690, 120, RED, t, s(15) + 4.2); });
// 16 light and dark
scn(s(16) - .05, s(17) - .05, t => { rect(PAPER, 0, 0, W, H); const k = t - s(16) + .05; const fl = ramp(t, s(16) + 1.6, .5); stripe(t * .3, PAPER, PAPER); bars(30, 190, 480, 220, 0, NB, INK); const pk = pulse(t); slam('LIGHT', 270, 600, 130, INK, k, .05); slam('& DARK', 270, 730, 130, RED, t, s(16) + 1.0); const m = ramp(t, s(16) + 1.7, .5); digits(25, 465, 490, 44, INK, m); });
// 17 end
scn(s(17) - .05, 1e9, t => { rect(RED, 0, 0, W, H); const k = t - s(17) + .05; slam('FOLLOW', 270, 300, 210, PAPER, k, .05); slam('FOR MORE OF', 270, 430, 80, INK, k, .3); slam('HOW IT', 270, 560, 150, PAPER, k, .5); slam('REALLY WORKS.', 270, 690, 100, INK, k, .7); });
const capUp = captions(document.getElementById('cap'));
window.seek = t => { ctx.setTransform(2, 0, 0, 2, 0, 0); sc.forEach(o => { if (t >= o.a && t < o.b) { ctx.save(); o.fn(t); ctx.restore(); } });
  // caption chip colours adapt: draw a backing bar
  const cp = document.getElementById('cap'); cp.style.color = curBG === PAPER ? INK : PAPER; capUp(t); };
await Promise.all([document.fonts.load('100px Anton'), document.fonts.load('700 20px "JetBrains Mono"'), document.fonts.load('500 20px "JetBrains Mono"')]);
window.ready = true;
