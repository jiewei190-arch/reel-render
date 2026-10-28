// t_snowflake.js: "Why do snowflakes have six sides?" in template #2 Red paper-cut (lemo-opuscar papercut-red). Canvas2D 1080x1920, pure function of t.
// Demo grammar reused (styles/papercut/: paper.js, motifs.js, hud.js from the demo): red paper is the hero on a night-indigo paper ground; every shape
// is cut (hand-cut wobble, paper grain, tight paper shadow, yin-cut holes and slits, sawtooth and crescent cuts); pieces step at 12 fps with a one-step
// 1.15x pop; cut-out titles pop in letter by letter; the subtitle is a dark-red paper banner strip with sawtooth edges, swallowtails and gold flecks that
// drops in on two steps; the fold-cut-unfold of a window flower (here a six-fold snowflake); gold foil kept for one late moment (the "diary" payoff).
// Batch N layout: banner bottom at y 1355 inside x 70-890; titles at y 250-460; content inside y 250-1130; badge strip y 1366-1440 stays free.
import { PAL, canvas, paperGrain, fillPaper, curve, wob, trace, ellipsePoly, rnd, textPiece } from './styles/papercut/all.js';
await document.fonts.load('800 80px Fraunces'); await document.fonts.load('600 46px Fraunces');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2, CX = 540;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; let g = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3);
const step = t => Math.floor(t * 12) / 12;                                   // pieces move on 12 fps steps
const popK = (lt, d = .25) => { const q = step(lt); if (q < 0) return 0; if (q < 1 / 12) return .6; if (q < 2 / 12) return 1.15; return 1; };   // pop: 0.6, 1.15 (one step), 1
const SNOW = '#e9ecf8', PALE = '#e98f86', DEEP = '#a8111f', GOLD = PAL.gold, CREAM = '#fff1d6';

// ---------- paper fill: colour + grain (soft-light) + tight paper shadow; holes cut with evenodd ----------
const [Lc, Lg] = canvas(W, H);
const GR = Lg.createPattern(paperGrain(), 'repeat');
function paper(pathFn, col, o = {}) {      // draw one paper piece (pathFn builds the path on a context); o.rule, o.shadow, o.alpha, o.holes(pathFn)
  Lg.setTransform(1, 0, 0, 1, 0, 0); Lg.clearRect(0, 0, W, H); Lg.globalCompositeOperation = 'source-over';
  Lg.beginPath(); pathFn(Lg); Lg.fillStyle = col; Lg.fill(o.rule || 'nonzero');
  // grain: soft-light, clipped to the piece so empty canvas stays empty
  GR.setTransform(new DOMMatrix([1, 0, 0, 1, (o.seed || 0) * 131 % 768, (o.seed || 0) * 71 % 768]));
  Lg.save(); Lg.beginPath(); pathFn(Lg); Lg.clip(o.rule || 'nonzero'); Lg.globalCompositeOperation = 'soft-light'; Lg.globalAlpha = 1; Lg.fillStyle = GR; Lg.fillRect(0, 0, W, H); Lg.restore();
  if (o.inset) { const [ins, gap] = o.inset; Lg.save(); Lg.beginPath(); pathFn(Lg); Lg.clip(o.rule || 'nonzero'); Lg.lineJoin = 'round'; Lg.globalCompositeOperation = 'destination-out'; Lg.lineWidth = 2 * (ins + gap); Lg.beginPath(); pathFn(Lg); Lg.stroke();
    Lg.globalCompositeOperation = 'source-over'; Lg.strokeStyle = col; Lg.lineWidth = 2 * ins; Lg.beginPath(); pathFn(Lg); Lg.stroke(); Lg.restore(); }
  if (o.holes) { Lg.globalCompositeOperation = 'destination-out'; Lg.beginPath(); o.holes(Lg); Lg.fillStyle = '#000'; Lg.fill(); }
  // cut-edge rim: a light line up-left, a dark line down-right
  Lg.globalCompositeOperation = 'source-atop'; Lg.lineWidth = 2; Lg.strokeStyle = 'rgba(255,200,180,.35)'; Lg.save(); Lg.translate(1, 1); Lg.beginPath(); pathFn(Lg); Lg.stroke(); Lg.restore();
  Lg.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = o.alpha ?? 1; const z = o.shadow ?? 1;
  if (z > 0) { g.shadowColor = o.shadowCol || 'rgba(8,10,30,.55)'; g.shadowBlur = 7 * z; g.shadowOffsetX = 4 * z; g.shadowOffsetY = 6 * z; }
  g.drawImage(Lc, 0, 0); g.restore(); }
const poly = (pts, closed = true) => q => trace(q, pts, closed);
const circ = (x, y, r, seed = 1) => wob(ellipsePoly(x, y, r, r, 0, Math.max(24, Math.round(r / 2))), .8, seed);

// ---------- the snowflake: one arm built from a spine, side branches and a tip, rotated n times ----------
// grow 0..1: the spine extends first, then side branches sprout in order; plate = the central hexagon
function armPolys(R, gr, n, seed, style = 'stellar') {
  const out = [], spine = R * clamp(gr * 1.25), w = R * .055;
  if (spine > R * .12) out.push([[R * .1, -w], [spine, -w * .7], [spine + w * 1.6, 0], [spine, w * .7], [R * .1, w]]);
  if (style === 'stellar') {
    const BR = [[.34, .38], [.52, .34], [.68, .26], [.82, .16]];
    BR.forEach(([f, L], k) => { const kg = clamp((gr - .18 - k * .16) / .3); if (kg <= 0 || spine < R * f) return; const len = R * L * kg, x0 = R * f, a = Math.PI / 3;
      for (const sd of [-1, 1]) { const ex = x0 + Math.cos(a) * len, ey = sd * Math.sin(a) * len, ww = w * .62, nx = -Math.sin(a) * sd, ny = Math.cos(a);
        out.push([[x0 - ww, sd * ww * .4], [ex - nx * ww * .5, ey - ny * ww * .5 * sd], [ex + Math.cos(a) * ww * 1.4, ey + sd * Math.sin(a) * ww * 1.4], [ex + nx * ww * .5, ey + ny * ww * .5 * sd], [x0 + ww, -sd * ww * .2]]); } });
    const tip = clamp((gr - .7) / .3); if (tip > 0) { const r = R * .09 * tip, x = spine - R * .02; out.push([[x - r, 0], [x - r * .2, -r], [x + r * .9, -r * .6], [x + r * 1.3, 0], [x + r * .9, r * .6], [x - r * .2, r]]); }
  }
  return out;
}
function hexPts(x, y, r, rot = 0) { return Array.from({ length: 6 }, (_, i) => { const a = rot + i * TAU / 6; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }); }
function flake(x, y, R, o = {}) {   // o: n arms, grow, rot, col, plate, seed, alpha, holes, gold
  const n = o.n || 6, gr = o.grow ?? 1, rot = o.rot || 0, seed = o.seed || 1, col = o.col || PAL.red;
  const arms = armPolys(R, gr, n, seed, o.style);
  const tf = (p, k) => { const a = rot + k * TAU / n; return [x + p[0] * Math.cos(a) - p[1] * Math.sin(a), y + p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
  const plateR = R * (o.plate ?? .2);
  paper(q => { const hx = hexPts(x, y, plateR, rot); trace(q, wob(hx.concat([hx[0]]), .6, seed)); for (let k = 0; k < n; k++) for (const P of arms) trace(q, wob(P.map(p => tf(p, k)), .5, seed + k)); }, col,
    { seed, alpha: o.alpha, shadow: o.shadow, holes: o.holes === false ? null : q => { const h = hexPts(x, y, plateR * .5, rot + Math.PI / 6); trace(q, h);
      for (let k = 0; k < n; k++) { const a = rot + k * TAU / n, sp = R * clamp(gr * 1.25); if (sp > R * .4) { for (let j = 1; j <= 3; j++) { const u = R * (.26 + j * .16); if (u > sp - R * .06) break; const cx = x + Math.cos(a) * u, cy = y + Math.sin(a) * u, rr = R * .022; q.moveTo(cx + rr, cy); q.arc(cx, cy, rr, 0, TAU); } } } } });
  if (o.gold) { g.save(); g.globalAlpha = o.gold; g.strokeStyle = GOLD; g.lineWidth = 4; g.shadowColor = 'rgba(255,210,120,.8)'; g.shadowBlur = 16; g.beginPath(); for (let k = 0; k < n; k++) for (const P of arms) { const q = P.map(p => tf(p, k)); trace(g, q); } g.stroke(); g.restore(); }
}

// ---------- background: night-indigo paper, far hills, a snow bank, stepping paper snow ----------
// ---------- background (demo layering): night paper, two sawtooth hill layers, a cut-paper village row (tiled roofs cut as sawtooth
// rows, glowing windows with tiny red rosettes, pines), a snow layer with crescent cuts, paper flakes on three depths; each layer pans
// at its own rate (parallax), and the lit windows change from scene to scene ----------
const SAW = (x0, x1, yf, h, sp) => { const o = []; for (let x = x0, i = 0; x <= x1; x += sp / 2, i++) o.push([x, yf(x) - (i % 2) * h]); return o; };
function house(x, base, w, h, k, lit) { const roofH = h * .55, top = base - h;
  paper(q => { q.rect(x, top, w, h); }, '#35457f', { seed: 200 + k, shadow: .7, inset: [3, 1.4], holes: q => { if (!lit) { q.rect(x + w * .18, top + h * .3, w * .2, h * .26); q.rect(x + w * .62, top + h * .3, w * .2, h * .26); } q.rect(x + w * .42, top + h * .55, w * .16, h * .45); } });
  if (lit) for (const fx of [.18, .62]) { const wx = x + w * fx, wy = top + h * .3, ww = w * .2, wh = h * .26; g.save(); g.fillStyle = '#ffcf7a'; g.shadowColor = 'rgba(255,190,110,.8)'; g.shadowBlur = 18; g.fillRect(wx, wy, ww, wh); g.restore();
    g.fillStyle = PAL.red; g.beginPath(); for (let j = 0; j < 6; j++) { const a = j * TAU / 6, cx = wx + ww / 2, cy = wy + wh / 2; g.moveTo(cx, cy); g.arc(cx, cy, Math.min(ww, wh) * .38, a, a + .5); } g.fill(); }
  const roof = [[x - 18, top], [x + w + 18, top], [x + w - 10, top - roofH], [x + 10, top - roofH]];
  paper(poly(wob(roof.concat([roof[0]]), .6, 210 + k)), '#2c3a74', { seed: 211 + k, shadow: .8, holes: q => { for (let r2 = 1; r2 <= 3; r2++) { const yy = top - roofH * r2 / 4; for (let xx = x + 4; xx < x + w - 4; xx += 13) { q.moveTo(xx, yy - 3); q.lineTo(xx + 9, yy - 3); q.lineTo(xx + 4.5, yy + 6); q.closePath(); } } } }); }
function pine(x, base, h, k) { const pts = [[x, base - h]]; for (let j = 1; j <= 4; j++) { const y = base - h + h * j / 4.4, wdt = h * .1 * j + 8; pts.push([x + wdt, y], [x + wdt * .45, y - 4]); } const L2 = pts.slice(1).map(([a, b]) => [2 * x - a, b]).reverse();
  paper(poly(wob(pts.concat([[x + 10, base], [x - 10, base]], L2), .5, 230 + k)), '#28346c', { seed: 231 + k, shadow: .7 }); }
function flakeDot(x, y, r, a = 1) { g.save(); g.globalAlpha = a; g.fillStyle = SNOW; g.beginPath(); for (let j = 0; j < 6; j++) { const an = j * TAU / 6 + x * .01; g.moveTo(x, y); g.lineTo(x + Math.cos(an - .18) * r, y + Math.sin(an - .18) * r); g.lineTo(x + Math.cos(an) * r * 1.2, y + Math.sin(an) * r * 1.2); g.lineTo(x + Math.cos(an + .18) * r, y + Math.sin(an + .18) * r); g.closePath(); } g.fill();
  g.fillStyle = '#1c2446'; g.beginPath(); g.arc(x, y, r * .28, 0, TAU); g.fill(); g.restore(); }
function snowLayer(t, depth, n, size, seed) { const q = step(t); for (let i = 0; i < n; i++) { const sp = (28 + 30 * rnd(i, seed)) * depth, y = 230 + ((rnd(i, seed + 1) * 1300 + q * sp * 2) % 1300), x = ((rnd(i, seed + 2) * 1200 - q * 6 * depth + 18 * Math.sin(q * .9 + i)) % 1200 + 1200) % 1200 - 60;
  flakeDot(x, y, size * (.7 + .5 * rnd(i, seed + 3)), .5 + .45 * rnd(i, seed + 4)); } }
let SCENE = 0;
function ground(t, tint = 0) { g.setTransform(1, 0, 0, 1, 0, 0); fillPaper(g, 'indigo', 0, 0, W, H);
  if (tint) { g.fillStyle = `rgba(120,40,60,${tint})`; g.fillRect(0, 0, W, H); }
  const pan = t * 9;
  snowLayer(t, .45, 26, 7, 11);                                                                              // far flakes
  const p1 = pan * .3, p2 = pan * .55, p3 = pan * 1;
  paper(poly(wob(SAW(-60, 1140, x => 900 + 40 * Math.sin((x + p1) * .006) + 20 * Math.sin((x + p1) * .017), 16, 26), .6, 3).concat([[1140, 1300], [-60, 1300]])), '#1f2a55', { seed: 4, shadow: .5 });
  paper(poly(wob(SAW(-60, 1140, x => 980 + 30 * Math.sin((x + p2) * .008 + 2), 12, 22), .6, 5).concat([[1140, 1300], [-60, 1300]])), '#29356e', { seed: 5, shadow: .6 });
  // village row (repeats along an endless street; house k = index along the street)
  const sp = 300, base = 1172, i0 = Math.floor((p2 * 1.3 - 200) / sp);
  for (let i = i0; i < i0 + 6; i++) { const x = i * sp - p2 * 1.3, k = ((i % 97) + 97) % 97, w = 170 + 50 * rnd(k, 1), h = 110 + 60 * rnd(k, 2);
    pine(x - 40, base, 120 + 60 * rnd(k, 3), k); house(x + 10, base, w, h, k, rnd(k, 5 + SCENE) > .35); }
  snowLayer(t, .8, 18, 10, 23);                                                                              // middle flakes
  paper(poly(wob(curve([[-40, 1160], [220, 1128], [480, 1160], [700, 1122], [900, 1150], [1120, 1132]], false, 6), 1.2, 6).concat([[1120, 1960], [-40, 1960]])), '#7a88ba', { seed: 6, shadow: 1, inset: [3, 1.4],
    holes: q => { for (let i = 0; i < 26; i++) { const x = ((rnd(i, 31) * 1300 - p3 * .4) % 1300 + 1300) % 1300 - 110, y = 1200 + rnd(i, 32) * 230, r = 18 + 10 * rnd(i, 33); const pts = []; for (let j = 0; j <= 10; j++) { const a = .25 * Math.PI + .5 * Math.PI * j / 10; pts.push([x + Math.cos(a) * r, y - r + Math.sin(a) * r]); } for (let j = 10; j >= 0; j--) { const a = .25 * Math.PI + .5 * Math.PI * j / 10; pts.push([x + Math.cos(a) * r * .8, y - r * 1.04 + Math.sin(a) * r * .82]); } trace(q, pts); } } });
  snowLayer(t, 1.2, 10, 13, 37);                                                                             // near flakes
}

// ---------- cut-out titles: letters pop in one per 12 fps step ----------
function title(str, x, y, size, k, col = PAL.red, o = {}) { if (k < 0) return; const q = step(k), shown = Math.floor(q * 24) + 1; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = `800 ${size}px Fraunces`; const ws = [...str].map(ch => g.measureText(ch).width), tw = ws.reduce((a, b) => a + b, 0); let xx = x - (o.align === 'left' ? 0 : tw / 2);
  [...str].forEach((ch, i) => { if (i >= shown) { xx += ws[i]; return; } if (ch !== ' ') { const p = textPiece(ch, size, 800, col, 'Fraunces', 3 + i), sc = i === shown - 1 ? 1.15 : 1;
      g.save(); g.shadowColor = 'rgba(8,10,30,.55)'; g.shadowBlur = 6; g.shadowOffsetX = 3; g.shadowOffsetY = 5; g.translate(xx + ws[i] / 2, y); g.scale(sc, sc); g.drawImage(p.c, -ws[i] / 2 - 10, -size * 1.02, p.w, p.h); g.restore(); } xx += ws[i]; });
  g.restore(); }
function label(str, x, y, size, k, col = CREAM) { if (k < 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = clamp(step(k) * 6); g.font = `600 ${size}px Fraunces`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(8,10,30,.6)'; g.shadowBlur = 6; g.shadowOffsetY = 3; g.fillStyle = col; g.fillText(str, x, y); g.restore(); }
function tag(str, x, y, k, col = PAL.red, txt = CREAM, w = 210) { const u = popK(k); if (u <= 0) return; g.save(); g.translate(x, y); g.scale(u, u); g.translate(-x, -y);
  paper(poly(wob([[x - w / 2, y - 46], [x + w / 2, y - 46], [x + w / 2, y + 46], [x - w / 2, y + 46], [x - w / 2, y - 46]], .8, 9)), col, { seed: 12 }); g.restore();
  label(str, x, y + 2, 54 * u, k + 1, txt); }

// ---------- molecules (cut paper), hydrogen bonds (rows of slits) ----------
function molecule(x, y, r, ang = 0, k = 1, seed = 1) { const u = popK(k); if (u <= 0) return; const R = r * u, hr = R * .56, d = R * 1.05, a1 = ang + Math.PI / 2 - .91, a2 = ang + Math.PI / 2 + .91;
  paper(q => { trace(q, circ(x, y, R, seed)); trace(q, circ(x + Math.cos(a1) * d, y + Math.sin(a1) * d, hr, seed + 1)); trace(q, circ(x + Math.cos(a2) * d, y + Math.sin(a2) * d, hr, seed + 2)); }, PAL.red,
    { seed, inset: [3, 1.3], holes: q => { const rr = R * .5; q.moveTo(x + rr, y); for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; q.lineTo(x + Math.cos(a) * rr * (1 + .08 * Math.cos(a * 6)), y + Math.sin(a) * rr * (1 + .08 * Math.cos(a * 6))); } } });
  return [[x + Math.cos(a1) * d, y + Math.sin(a1) * d], [x + Math.cos(a2) * d, y + Math.sin(a2) * d]]; }
function bond(x0, y0, x1, y1, k) { const u = clamp(step(k) * 3); if (u <= 0) return; const n = 6, L = Math.hypot(x1 - x0, y1 - y0), ax = (x1 - x0) / L, ay = (y1 - y0) / L;
  paper(q => { for (let i = 0; i < Math.round(n * u); i++) { const f = (i + .5) / n, cx = x0 + ax * L * f, cy = y0 + ay * L * f, hl = L / n * .32, hw = 6; q.moveTo(cx - ax * hl - ay * hw, cy - ay * hl + ax * hw); q.lineTo(cx + ax * hl - ay * hw, cy + ay * hl + ax * hw); q.lineTo(cx + ax * hl + ay * hw, cy + ay * hl - ax * hw); q.lineTo(cx - ax * hl + ay * hw, cy - ay * hl - ax * hw); q.closePath(); } }, PALE, { seed: 30, shadow: .5 }); }

// ---------- other cut pieces ----------
function scissors(x, y, ang, open, S = 1.7) { g.save(); const pts = (sd) => { const a = ang + sd * open / 2; const c = Math.cos(a) * S, sn = Math.sin(a) * S, P = (u, v) => [x + c * u - sn * v, y + sn * u + c * v];
    return { blade: [P(0, -10 * sd), P(190, -3 * sd), P(205, 4 * sd), P(0, 14 * sd)], ring: ellipsePoly(...P(-95, 26 * sd), 46 * S, 30 * S, a, 30) }; };
  for (const sd of [-1, 1]) { const p = pts(sd); paper(poly(wob(p.blade, .4, 40 + sd)), '#c9ced9', { seed: 41, shadow: 1.2 }); paper(q => trace(q, p.ring), DEEP, { seed: 42, shadow: 1.2, holes: q => { const c = p.ring.reduce((a, b) => [a[0] + b[0] / p.ring.length, a[1] + b[1] / p.ring.length], [0, 0]); q.moveTo(c[0] + 24 * S, c[1]); q.arc(c[0], c[1], 24 * S, 0, TAU); } }); }
  g.fillStyle = '#5a0a12'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); g.restore(); }
function wedge(x, y, r, a0, a1, cutU = 0) {   // a folded 60-degree stack of red paper; cutU 0..1 reveals the snowflake-arm cut along the outer edge
  const pts = [[x, y]]; for (let i = 0; i <= 20; i++) { const a = a0 + (a1 - a0) * i / 20; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  for (let j = 4; j >= 1; j--) { g.save(); g.translate(j * 1.6, j * 2); paper(poly(pts), j % 2 ? '#9c1418' : '#b51a1c', { shadow: 0, seed: 50 + j }); g.restore(); }
  paper(poly(wob(pts, .5, 51)), PAL.red, { seed: 52, holes: cutU > 0 ? q => { const am = (a0 + a1) / 2; for (let k = 0; k < 4; k++) { const f = (k + 1) / 5; if (f > cutU) break; const rr = r * (.3 + .17 * k), a = lerp(a0, a1, k % 2 ? .2 : .8);
      q.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); q.lineTo(x + Math.cos(am) * (rr + 60), y + Math.sin(am) * (rr + 60)); q.lineTo(x + Math.cos(a) * (rr + 90), y + Math.sin(a) * (rr + 90)); q.closePath(); } } : null }); }
function cloudPiece(x, y, w, col = '#3a4a8c', seed = 1) { const pts = []; for (let i = 0; i <= 28; i++) { const a = Math.PI + i / 28 * Math.PI, bump = 1 + .16 * Math.abs(Math.sin(i * 1.2)); pts.push([x + Math.cos(a) * w / 2 * bump, y + Math.sin(a) * w * .28 * bump]); }
  paper(poly(wob(pts.concat([[x + w / 2, y + 18], [x - w / 2, y + 18]]), .9, seed)), col, { seed, shadow: .8, holes: q => { for (let j = 0; j < 3; j++) { const cx = x - w * .25 + j * w * .25, cy = y - w * .06; for (let m = 0; m < 14; m++) { const a = Math.PI * (1 + m / 13), r = w * .07; m ? q.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : q.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } for (let m = 13; m >= 0; m--) { const a = Math.PI * (1 + m / 13), r = w * .055; q.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r + 2); } q.closePath(); } } }); }
function mitten(x, y, s = 1) { const P = [[-110, 140], [-120, -40], [-90, -150], [-10, -190], [80, -150], [110, -50], [105, 140]].map(([a, b]) => [x + a * s, y + b * s]);
  const th = [[-100, 0], [-190, -40], [-210, -110], [-170, -140], [-110, -90]].map(([a, b]) => [x + a * s, y + b * s]);
  paper(q => { trace(q, wob(curve(P, true, 4), .8, 60)); trace(q, wob(curve(th, true, 4), .8, 61)); }, PAL.red, { seed: 62, inset: [4, 1.6] });
  const cuff = [[-125, 120], [120, 120], [120, 230], [-125, 230]].map(([a, b]) => [x + a * s, y + b * s]); const saw = []; for (let i = 0; i <= 18; i++) saw.push([x + (-125 + i * 245 / 18) * s, y + (230 + (i % 2) * 18) * s]);
  paper(q => { trace(q, [cuff[0], cuff[1], ...saw.reverse()]); }, DEEP, { seed: 63, holes: q => { for (let i = 0; i < 7; i++) { const cx = x + (-95 + i * 32) * s, cy = y + 175 * s; q.moveTo(cx + 9, cy); q.arc(cx, cy, 9, 0, TAU); } } }); }
function cross(x, y, r, k) { const u = clamp(step(k) * 4); if (u <= 0) return; g.save(); g.strokeStyle = CREAM; g.lineWidth = 14; g.lineCap = 'round'; g.globalAlpha = .95; g.shadowColor = 'rgba(8,10,30,.6)'; g.shadowBlur = 6;
  g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x - r + 2 * r * u, y - r + 2 * r * u); if (u > .5) { g.moveTo(x + r, y - r); g.lineTo(x + r - 2 * r * (u - .5) * 2, y - r + 2 * r * (u - .5) * 2); } g.stroke(); g.restore(); }
function thermoStrip(x0, x1, y, k, mark) { paper(poly(wob([[x0, y - 26], [x1, y - 26], [x1, y + 26], [x0, y + 26], [x0, y - 26]], .6, 70)), CREAM, { seed: 71 });
  paper(q => { const xm = lerp(x0 + 20, x1 - 20, mark); q.rect(x0 + 16, y - 10, xm - x0 - 16, 20); }, '#3d8fd1', { seed: 72, shadow: .3 }); }
function hexRing(cx, cy, r, k, rot = Math.PI / 6) { const V = hexPts(cx, cy, r, rot); V.forEach((p, i) => { const q = V[(i + 1) % 6]; bond(p[0], p[1], q[0], q[1], k - .3 - i * .08); }); V.forEach(([x, y], i) => molecule(x, y, 34, Math.atan2(y - cy, x - cx) - Math.PI / 2, k - i * .08, 80 + i)); return V; }
function honeycomb(k, cx = CX, cy = 870) { const u = eo(k / 1.4); if (u <= 0) return; const r = 56, RR = 120 + 200 * u;
  paper(q => trace(q, circ(cx, cy, RR, 90)), PAL.red, { seed: 91, inset: [4, 1.6], holes: q => { const dx = r * Math.sqrt(3), dy = r * 1.5; for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) { const x = cx + i * dx + (j % 2 ? dx / 2 : 0), y = cy + j * dy; if (Math.hypot(x - cx, y - cy) > RR - r * .9) continue; trace(q, hexPts(x, y, r * .78, Math.PI / 6)); } } }); }
function prism(cx, cy, r, h, k) { const u = popK(k); if (u <= 0) return; const R = r * u, top = hexPts(cx, cy, R, 0).map(([x, y]) => [x, cy + (y - cy) * .5]);
  for (const [i, col] of [[0, '#8f1019'], [1, '#a8111f'], [2, '#b81a1d']]) { const a = top[i], b = top[i + 1]; paper(poly([a, b, [b[0], b[1] + h * u], [a[0], a[1] + h * u]]), col, { seed: 100 + i, shadow: i === 1 ? 1 : 0 }); }
  paper(poly(wob(top.concat([top[0]]), .5, 104)), PAL.red, { seed: 105, shadow: 0, holes: q => trace(q, hexPts(cx, cy, R * .45, 0).map(([x, y]) => [x, cy + (y - cy) * .5])) }); }

// ---------- banner subtitle (demo hud: dark-red strip, sawtooth edges, swallowtails, gold flecks), multi-line ----------
const BAN = {};
function banner(i, t) { const p = PH[i]; if (!p) return; const lt = t - (p.start - .15); if (lt < 0) return;
  let b = BAN[i]; if (!b) { const [m, mg] = canvas(10, 10); mg.font = '600 46px Fraunces'; let bold = false; const toks = p.cap.split(' ').map(w => { const st = w.startsWith('**'); if (st) bold = true; const r = { w: w.replace(/\*\*/g, ''), b: bold }; if (w.replace(/[.,!?:;]+$/, '').endsWith('**')) bold = false; return r; });
    const lines = [[]]; let lw = 0; toks.forEach(o => { const ww = mg.measureText(o.w + ' ').width; if (lw + ww > 740 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...o, ww }); lw += ww; });
    const w = 820, h = lines.length * 56 + 46, K = 1.5, [c, cg] = canvas(w * K, h * K); cg.scale(K, K);
    const pl = []; for (let x = 0; x <= w; x += 10) pl.push([x, 4 + (x / 10 % 2) * 3]); pl.push([w - 26, h / 2]); for (let x = w; x >= 0; x -= 10) pl.push([x, h - 4 - (x / 10 % 2) * 3]); pl.push([26, h / 2]);
    cg.beginPath(); trace(cg, wob(pl, .3, 5)); cg.fillStyle = PAL.sub; cg.fill();
    for (let k = 0; k < 50; k++) { cg.fillStyle = `rgba(222,178,84,${.25 + rnd(k, 3) * .35})`; cg.beginPath(); cg.arc(30 + rnd(k, 1) * (w - 60), 10 + rnd(k, 2) * (h - 20), .8 + rnd(k, 4) * 1.4, 0, 7); cg.fill(); }
    cg.font = '600 46px Fraunces'; cg.textBaseline = 'middle'; lines.forEach((ln, j) => { const tw = ln.reduce((a, o) => a + o.ww, 0); let x = w / 2 - tw / 2; ln.forEach(o => { cg.fillStyle = o.b ? '#f2c14e' : CREAM; cg.fillText(o.w, x, 23 + 28 + j * 56); x += o.ww; }); });
    b = BAN[i] = { c, w, h }; }
  const u = step(lt), drop = u < 1 / 12 ? -14 : u < 2 / 12 ? -5 : 0, x = 480 - b.w / 2, y = 1355 - b.h + drop;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.shadowColor = 'rgba(8,4,20,.5)'; g.shadowBlur = 8; g.shadowOffsetX = 3; g.shadowOffsetY = 5; g.drawImage(b.c, x, y, b.w, b.h); g.restore(); }

// ---------- scenes ----------
const r = (i, d = 0) => s(i) + d, L = (i, t) => t - s(i);
const SC = [];
SC[0] = (t) => { const lt = t; flake(CX, 750, 290, { rot: step(t) * .25, seed: 1 }); title('SIX ARMS.', CX, 330, 112, -1, PAL.red); title('SIX ARMS.', CX, 330, 112, 1, CREAM);
  if (lt > 1.9) flake(220, 1000, 100 * popK(lt - 1.9), { seed: 7, rot: .3, shadow: .8 }); if (lt > 2.6) flake(820, 1000, 100 * popK(lt - 2.6), { seed: 8, rot: .2, shadow: .8 }); if (lt > 3.0) label('almost always six', CX, 405, 54, lt - 3.0, '#f2c14e'); };
SC[1] = (t) => { const lt = L(1, t), cu = clamp((lt - .3) / 2.6); wedge(560, 980, 520, -Math.PI / 2 - Math.PI / 6, -Math.PI / 2 + Math.PI / 6, cu);
  const p = lerp(.25, .85, cu), sx = 560 + Math.cos(-Math.PI / 2 - .2) * 520 * p, sy = 980 + Math.sin(-Math.PI / 2 - .2) * 520 * p; scissors(sx + 60, sy, Math.PI + .5, .3 + .25 * Math.abs(Math.sin(step(lt) * 9)));
  title('NOBODY CUTS THEM', CX, 330, 84, lt - .2, CREAM); if (lt > 2.6) title('SO WHY SIX?', CX, 1110, 96, lt - 2.6, PAL.red); };
SC[2] = (t) => { const lt = L(2, t); molecule(CX, 700, 130, 0, lt, 1); title('ONE WATER', CX, 330, 104, lt - .3, CREAM); title('MOLECULE', CX, 450, 104, lt - .6, PAL.red); };
SC[3] = (t) => { const lt = L(3, t), H = molecule(CX, 680, 130, 0, 1, 1); label('O', CX, 680, 70, lt); label('H', H[0][0], H[0][1], 56, lt - .5); label('H', H[1][0], H[1][1], 56, lt - .7);
  if (lt > 1.4) { g.save(); g.strokeStyle = CREAM; g.lineWidth = 6; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(H[0][0], H[0][1]); g.lineTo(CX, 680); g.lineTo(H[1][0], H[1][1]); g.stroke(); g.restore(); }
  title('BENT, LIKE A V', CX, 330, 96, lt - 1.2, CREAM); };
SC[4] = (t) => { const lt = L(4, t), V = hexPts(CX, 720, 250, Math.PI / 6); const sh = clamp(lt / 3.4);
  V.forEach(([x, y], i) => { const k = lt - i * .45; if (k < 0) return; const ox = x + (x - CX) * .5 * (1 - sh), oy = y + (y - 720) * .5 * (1 - sh); molecule(ox, oy, 44, Math.atan2(oy - 720, ox - CX) - Math.PI / 2, k, 80 + i); });
  V.forEach((p, i) => { const q = V[(i + 1) % 6]; bond(p[0], p[1], q[0], q[1], lt - 1.2 - i * .4); }); title('HYDROGEN BONDS', CX, 330, 88, lt - .4, CREAM); };
SC[5] = (t) => { const lt = L(5, t); hexRing(CX, 720, 250, 3); if (lt > .2) { g.save(); g.strokeStyle = 'rgba(255,241,214,.8)'; g.lineWidth = 5; g.setLineDash([16, 12]); g.beginPath(); trace(g, hexPts(CX, 720, 170, Math.PI / 6)); g.stroke(); g.restore(); }
  title('A RING OF SIX', CX, 330, 104, lt - .2, PAL.red); };
SC[6] = (t) => { const lt = L(6, t); honeycomb(lt); title('A HONEYCOMB', CX, 300, 92, lt - .3, CREAM); title('OF ICE', CX, 400, 92, lt - .6, PAL.red); };
SC[7] = (t) => { const lt = L(7, t); prism(CX, 760, 240, 90, lt - .2); title('A TINY', CX, 330, 100, lt - .3, CREAM); title('SIX-SIDED PRISM', CX, 450, 90, lt - .7, PAL.red); };
SC[8] = (t) => { const lt = L(8, t), gr = clamp((lt - .4) / 5); flake(CX, 790, 300, { grow: gr, plate: .2, seed: 2 });
  for (let i = 0; i < 26; i++) { const a = rnd(i, 7) * TAU, d = 480 - ((step(lt) * 160 + rnd(i, 8) * 300) % 300); if (d < 120) continue; g.fillStyle = 'rgba(233,236,248,.85)'; g.beginPath(); g.arc(CX + Math.cos(a) * d, 790 + Math.sin(a) * d, 7, 0, TAU); g.fill(); }
  title('VAPOR FREEZES ON', CX, 330, 84, lt - .3, CREAM); if (lt > 3.6) label('branches sprout from the six corners', CX, 1100, 44, lt - 3.6); };
SC[9] = (t) => { const lt = L(9, t), u = popK(lt); flake(CX, 790, 300 * (u > 1 ? 1.06 : 1), { seed: 2 }); title('SIX CORNERS,', CX, 300, 92, lt - .1, CREAM); title('SIX ARMS', CX, 405, 96, lt - .5, PAL.red); };
SC[10] = (t) => { const lt = L(10, t); flake(CX, 760, 340, { seed: 2, rot: step(lt) * .05 }); title('SO ALIKE?', CX, 330, 112, lt - .2, CREAM);
  label('?', CX + 300, 520, 110, lt - 1.2, '#f2c14e'); label('?', CX - 300, 1000, 110, lt - 1.6, '#f2c14e'); };
SC[11] = (t) => { const lt = L(11, t); flake(CX, 790, 300, { seed: 2 }); const wv = (step(lt) * .55) % 1, rr = 80 + wv * 420;
  g.save(); g.strokeStyle = `rgba(233,236,248,${.7 * (1 - wv)})`; g.lineWidth = 10; g.setLineDash([20, 14]); g.beginPath(); g.arc(CX, 790, rr, 0, TAU); g.stroke(); g.restore();
  title('SAME TIME,', CX, 300, 92, lt - .2, CREAM); title('SAME AIR', CX, 405, 92, lt - 1.6, PAL.red); };
SC[12] = (t) => { const lt = L(12, t), k = clamp(lt / 3.6); flake(CX, 790, 270 + 40 * eo(k), { seed: 3, grow: lerp(.7, 1, k) });
  const wv = clamp((lt - .6) / 2.4); g.save(); g.strokeStyle = `rgba(242,193,78,${.85 * (1 - wv)})`; g.lineWidth = 12; g.beginPath(); g.arc(CX, 790, 60 + wv * 400, 0, TAU); g.stroke(); g.restore();
  title('ALL SIX AT ONCE', CX, 330, 92, lt - .3, CREAM); };
SC[13] = (t) => { const lt = L(13, t), T1 = 1.9, T2 = 4.6, T3 = 7.0; title('TEMPERATURE', CX, 300, 92, lt - .2, CREAM); title('PICKS THE SHAPE', CX, 410, 86, lt - .5, PAL.red);
  const mk = lt < T1 ? .82 : lt < T2 ? lerp(.82, .62, clamp((lt - T1) / .5)) : lt < T3 ? lerp(.62, .62, 0) : lerp(.62, .2, clamp((lt - T2 - 2.4) / .6)); thermoStrip(120, 880, 540, lt, lt < T2 ? lerp(.82, .82, 0) * 1 : lt < T3 - .1 ? .62 : .25);
  const cols = [[250, '-2°C', 'plates', T1], [530, '-5°C', 'needles', T2], [800, '-15°C', 'starry', T3]];
  cols.forEach(([x, deg, nm, T], j) => { const k = lt - T; if (k < 0) return; label(deg, x, 610, 50, k); const u = popK(k);
    if (j === 0) paper(q => trace(q, wob(hexPts(x, 760, 110 * u, 0).concat([hexPts(x, 760, 110 * u, 0)[0]]), .6, 110)), PAL.red, { seed: 111, holes: q => { trace(q, hexPts(x, 760, 55 * u, 0)); } });
    if (j === 1) for (let n2 = 0; n2 < 3; n2++) paper(poly(wob([[x - 60 + n2 * 55 - 9, 660 + n2 * 15], [x - 60 + n2 * 55 + 9, 660 + n2 * 15], [x - 50 + n2 * 55 + 9, (660 + 210 * u) + n2 * 8], [x - 50 + n2 * 55 - 9, (660 + 210 * u) + n2 * 8]], .5, 120 + n2)), PAL.red, { seed: 121 + n2 });
    if (j === 2) flake(x, 760, 120 * u, { seed: 5 });
    label(nm, x, 930, 48, k - .3); }); };
SC[14] = (t) => { const lt = L(14, t); const X = [230, 520, 790]; X.forEach((x, j) => cloudPiece(x, 500, 280, '#3a4a8c', 3 + j));
  X.forEach((x, j) => { const pts = []; for (let i = 0; i <= 30; i++) { const f = i / 30; pts.push([x + Math.sin(f * (5 + j * 2) + j) * (40 + 20 * j), 560 + f * 420]); }
    g.save(); g.fillStyle = 'rgba(233,236,248,.6)'; pts.forEach(([px, py], i) => { if (i % 2) return; g.beginPath(); g.arc(px, py, 5, 0, TAU); g.fill(); }); g.restore();
    const f = clamp((lt - .3 - j * .3) / 3), idx = Math.min(30, Math.floor(f * 30)), [px, py] = pts[idx]; flake(px, py, lerp(24, 92, f), { seed: 20 + j * 7, grow: lerp(.3, 1, f), style: j === 1 ? 'plain' : 'stellar', rot: j * .4 }); });
  title('NO TWO ALIKE', CX, 330, 104, lt - 2.4, PAL.red); };
SC[15] = (t) => { const lt = L(15, t), gk = ss(.4, 1.8, lt); flake(CX, 730, 290, { seed: 2, gold: gk });
  for (let j = 1; j <= 3; j++) { g.save(); g.strokeStyle = `rgba(242,193,78,${.5 * gk})`; g.lineWidth = 3; g.setLineDash([8, 10]); g.beginPath(); g.arc(CX, 730, 80 * j, 0, TAU); g.stroke(); g.restore(); }
  title('A DIARY OF ITS FALL', CX, 330, 80, lt - .3, GOLD); title('WRITTEN SIX TIMES', CX, 1100, 80, lt - .9, CREAM); };
SC[16] = (t) => { const lt = L(16, t); mitten(380, 760, 1.5); flake(400, 650, 90, { seed: 9, col: '#f4ecd8', shadow: .7 }); title('ON YOUR MITTEN?', CX, 330, 88, lt - .2, CREAM);
  tag('YES', 800, 640, lt - 1.1, PAL.red, CREAM); tag('NO', 800, 820, lt - 1.3, '#f4ecd8', DEEP); };
SC[17] = (t) => { const lt = L(17, t); flake(CX, 440, 150, { seed: 2, rot: step(lt) * .12 }); title('Follow for more of', CX, 690, 70, lt - .1, CREAM); title('how it really works.', CX, 790, 70, lt - .4, PAL.red);
  label("A new 'wait, really?' every day.", CX, 870, 46, lt - .8); label('@howitreallyworkstudio', CX, 930, 44, lt - 1.0, '#f2c14e'); };

const START = PH.map(p => p.start); START[0] = 0;
function sceneAt(t) { let k = 0; for (let i = 0; i < SC.length; i++) if (t >= START[i] - .2) k = i; return k; }
function draw(t) { const k = sceneAt(t); SCENE = k; ground(t); g.setTransform(1, 0, 0, 1, 0, 0); SC[k](t); if (k < PH.length - 1) banner(k, t); }

// frame 0 snapshot for the loop ending (dissolves in at most 40% in the last 0.5 s)
const F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const keep = g; g = F0.getContext('2d'); draw(0); g = keep; }
function frame(t) { draw(t); const k = ss(TOT - .5, TOT, t) * .4; if (k > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.drawImage(F0, 0, 0); g.restore(); } }

window.CUES = [['pop', .3], ['pop', 2.4], ['pop', 3.3], ['scribble', r(1, .3), r(1, 2.9)], ['snap', r(1, 1.2)], ['snap', r(1, 2.2)], ['pop', r(2, .05)], ['pop', r(3, .5)], ['pop', r(3, .7)],
  ['pop', r(4, 0)], ['pop', r(4, .45)], ['pop', r(4, .9)], ['pop', r(4, 1.35)], ['pop', r(4, 1.8)], ['pop', r(4, 2.25)], ['chime', r(5, .3), 76], ['whoosh', r(6, -.2)], ['pop', r(7, .2)], ['sparkle', r(8, 1)],
  ['chime', r(9, .1), 79], ['whoosh', r(10, -.2)], ['whoosh', r(11, .3)], ['chime', r(12, .6), 74], ['pop', r(13, 1.9)], ['pop', r(13, 4.6)], ['pop', r(13, 7.0)], ['whoosh', r(14, .3)], ['sparkle', r(15, .5)], ['chime', r(15, .6), 83],
  ['pop', r(16, 1.1)], ['pop', r(16, 1.3)], ['chime', r(17, .2), 84]];
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { ground(2); flake(CX, 900, 360, { seed: 2 }); title('WHY SIX', CX, 360, 150, 3, CREAM); title('SIDES?', CX, 530, 150, 3, PAL.red); };
window.seek(0); window.ready = true; window.READY = true;
