// t_sodabubbles.js: "Why do soda bubbles rise in lines?" in template #29 particle flock (demo t29, x.com/ajith_io Distilbook showreel).
// Demo grammar reused: a flock of hundreds of tiny dark glyphs drifting and wheeling as one over a purple-to-peach sunset gradient, the flock
// re-forming into shapes, a glowing orb with concentric halos and a thin glowing line on a starry deep-purple night, handwritten labels.
// Our glyphs are CO2 molecules (O-C-O), the orb is a gas pocket, the glowing lines are bubble trains. All drawing is original code.
// Batch N layout: drawings in y 330-1150, captions at y 1220-1400, nothing written in the top 250 px, the bottom 480 px, or x>900 below y 840.
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, TAU = Math.PI * 2;
const c = document.getElementById('c'); c.width = W; c.height = H; const g = c.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u, R = (t, t0, d) => clamp((t - t0) / d);
const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3), bo = u => { u = clamp(u); const k = 1.7; return 1 + (k + 1) * Math.pow(u - 1, 3) + k * Math.pow(u - 1, 2); };
const hash = n => { const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const INK = '#2a1f45', PEACH = '#ffbf8f', CREAM = '#f6eee6', GLOW = '#ffd9a8';
await Promise.all(['800 40px "Inter"', '400 40px "Hand"'].map(f => document.fonts.load(f)));

// ---------- backgrounds ----------
function sunset(t) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5d4f9e'); gr.addColorStop(.38, '#a985b8'); gr.addColorStop(.7, '#e9a99a'); gr.addColorStop(1, '#f7c08e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const sun = g.createRadialGradient(540, 1180 + Math.sin(t * .2) * 20, 40, 540, 1180, 700); sun.addColorStop(0, 'rgba(255,226,180,.35)'); sun.addColorStop(1, 'rgba(255,226,180,0)'); g.fillStyle = sun; g.fillRect(0, 0, W, H); }
function night(t) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#120e2e'); gr.addColorStop(.55, '#2c1d58'); gr.addColorStop(1, '#4a2f72'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { const a = .25 + .5 * (.5 + .5 * Math.sin(t * (1 + hash(i + 3)) + i)); g.fillStyle = `rgba(240,230,255,${a * .6})`; g.fillRect(hash(i) * W, hash(i + .7) * 1300 + 200, 2.5, 2.5); } }

// ---------- the flock: N CO2 glyphs; each scene gives every glyph a home point, glyphs wheel around it on smooth noise ----------
const N = 420;
const PS = Array.from({ length: N }, (_, i) => ({ h: [0, 1, 2, 3, 4, 5, 6].map(k => hash(i * 7.31 + k * 1.17)) }));
function wob(i, t, a) { const h = PS[i].h; return [Math.sin(t * (.6 + h[0] * .7) + h[1] * TAU) * a + Math.sin(t * .27 + h[2] * 9) * a * .7, Math.cos(t * (.5 + h[3] * .6) + h[4] * TAU) * a + Math.cos(t * .33 + h[5] * 7) * a * .6]; }
function glyph(x, y, ang, k, col) { const ca = Math.cos(ang) * 7 * k, sa = Math.sin(ang) * 7 * k; g.fillStyle = col;
  g.beginPath(); g.arc(x, y, 3.4 * k, 0, TAU); g.arc(x + ca, y + sa, 2.6 * k, 0, TAU); g.arc(x - ca, y - sa, 2.6 * k, 0, TAU); g.fill(); }
// home(i) -> [x,y] or [x,y,alpha]; opt.amp wobble, opt.col, opt.k size, opt.a alpha, opt.from/opt.t0/opt.dur: flock flies from one shape to another
function flock(t, home, o = {}) { const amp = o.amp ?? 26, col = o.col || INK, k = (o.k || 1) * 1.25; g.save();
  for (let i = 0; i < (o.n || N); i++) { const h = PS[i].h; let p = home(i, t); if (!p) continue;
    if (o.from) { const u = ss(R(t, o.t0 + h[5] * (o.spread ?? .7), o.dur || 1.4)); if (u < 1) { const q = o.from(i, t); const bend = Math.sin(u * Math.PI) * (h[6] - .5) * 380; const dx = p[0] - q[0], dy = p[1] - q[1], L = Math.hypot(dx, dy) || 1;
      p = [lerp(q[0], p[0], u) - dy / L * bend, lerp(q[1], p[1], u) + dx / L * bend, lerp(q[2] ?? 1, p[2] ?? 1, u)]; } }
    const [wx, wy] = wob(i, t, amp); const ang = h[0] * TAU + t * (h[1] - .5) * 1.4;
    g.globalAlpha = (o.a ?? .78) * (p[2] ?? 1); if (g.globalAlpha > .01) glyph(p[0] + wx, p[1] + wy, ang, k * (.8 + h[2] * .5), col); }
  g.restore(); }
// sample a filled shape into N home points (drawn at 1/4 scale offscreen)
function sampler(draw) { const S = 4, oc = document.createElement('canvas'); oc.width = W / S; oc.height = H / S; const o = oc.getContext('2d'); o.scale(1 / S, 1 / S); o.fillStyle = '#000'; draw(o);
  const d = o.getImageData(0, 0, oc.width, oc.height).data, pts = []; for (let y = 0; y < oc.height; y++) for (let x = 0; x < oc.width; x++) if (d[(y * oc.width + x) * 4 + 3] > 128) pts.push([x * S, y * S]);
  return Array.from({ length: N }, (_, i) => { const p = pts[Math.floor(hash(i * 3.7 + .2) * pts.length)] || [540, 760]; return [p[0] + hash(i + .3) * S, p[1] + hash(i + .9) * S]; }); }
const glassPath = (o, x0 = 270, y0 = 360, w = 540, h = 780, taper = 40) => { o.beginPath(); o.moveTo(x0, y0); o.lineTo(x0 + w, y0); o.lineTo(x0 + w - taper, y0 + h - 40); o.quadraticCurveTo(x0 + w - taper, y0 + h, x0 + w - taper - 40, y0 + h); o.lineTo(x0 + taper + 40, y0 + h); o.quadraticCurveTo(x0 + taper, y0 + h, x0 + taper, y0 + h - 40); o.closePath(); };
const bottlePath = o => { o.beginPath(); o.moveTo(480, 370); o.lineTo(600, 370); o.lineTo(600, 470); o.bezierCurveTo(600, 540, 740, 560, 740, 660); o.lineTo(740, 1110); o.quadraticCurveTo(740, 1140, 710, 1140); o.lineTo(370, 1140); o.quadraticCurveTo(340, 1140, 340, 1110); o.lineTo(340, 660); o.bezierCurveTo(340, 560, 480, 540, 480, 470); o.closePath(); };
const H_LIQ = sampler(o => { o.fillRect(310, 480, 460, 640); });
const H_Q = sampler(o => { o.font = '900 820px "Inter"'; o.textAlign = 'center'; o.fillText('?', 540, 1080); });
const H_BOT = sampler(o => { o.save(); bottlePath(o); o.clip(); o.fillRect(350, 480, 380, 650); o.restore(); });
const H_SKY = sampler(o => { o.beginPath(); o.ellipse(540, 600, 470, 260, 0, 0, TAU); o.fill(); });
const H_ALL = sampler(o => { o.fillRect(70, 330, 860, 800); });
const H_RING = Array.from({ length: N }, (_, i) => { const a = i / N * TAU, r = 360 + (hash(i + .4) - .5) * 70; return [540 + Math.cos(a) * r * 1.02, 760 + Math.sin(a) * r * .95]; });
const at = arr => (i => arr[i]);

// ---------- drawing pieces ----------
function bub(x, y, r, a = 1) { if (r < .5 || a <= 0) return; g.save(); g.globalAlpha *= a; const gr = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(.8, 'rgba(255,240,230,.28)'); gr.addColorStop(1, 'rgba(255,250,245,.7)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,252,248,.95)'; g.lineWidth = Math.max(1.6, r * .11); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(x - r * .38, y - r * .4, r * .2, r * .12, -.7, 0, TAU); g.fill(); g.restore(); }
// a bubble train from a site: bubbles released every 1/rate s, rising with growing speed and size
function train(x0, y0, yTop, t, o = {}) { const rate = o.rate || 4, v0 = o.v0 || 120, acc = o.acc || 160, r0 = o.r0 || 5, gr = o.gr || 9, T = 1 / rate, a = o.a ?? 1;
  const n0 = Math.floor(t / T); for (let k = 0; k < 120; k++) { const age = t - (n0 - k) * T; const y = y0 - v0 * age - acc * age * age / 2; if (y < yTop) break; const r = r0 + gr * age;
    const fade = clamp((y - yTop) / 50) * clamp(age / .08); bub(x0 + Math.sin(age * 5 + x0) * Math.min(6, age * 6) * (o.wig ?? 1), y, r, a * fade); } }
function speck(x, y, t, a = 1, glow = 0) { g.save(); g.globalAlpha *= a; if (glow) { const gr = g.createRadialGradient(x, y, 2, x, y, 34); gr.addColorStop(0, `rgba(255,220,160,${.8 * glow})`); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 34, 0, TAU); g.fill(); }
  g.strokeStyle = '#3a2a1e'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 12, y + 3); g.quadraticCurveTo(x - 2, y - 7, x + 13, y - 2); g.stroke(); g.restore(); }
function glowLine(pts, a = 1, w = 5, col = GLOW) { g.save(); g.globalAlpha *= a; g.lineJoin = g.lineCap = 'round'; g.strokeStyle = col; g.shadowColor = col; g.shadowBlur = 24; g.lineWidth = w;
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = w * .4; g.stroke(); g.restore(); }
function glass(t, a = 1, x0, y0, w, h, taper) { g.save(); g.globalAlpha *= a; glassPath(g, x0, y0, w, h, taper); g.save(); g.clip(); g.fillStyle = 'rgba(58,30,74,.5)'; g.fillRect(0, (y0 ?? 360) + 110 + Math.sin(t * 2) * 3, W, H); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, 0, W, H); g.restore();
  g.lineJoin = 'round'; g.strokeStyle = 'rgba(255,240,225,.95)'; g.shadowColor = GLOW; g.shadowBlur = 22; g.lineWidth = 6; glassPath(g, x0, y0, w, h, taper); g.stroke(); g.shadowBlur = 0;
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.beginPath(); const yl = (y0 ?? 360) + 110 + Math.sin(t * 2) * 3; g.moveTo((x0 ?? 270) + 8, yl); for (let x = (x0 ?? 270) + 8; x <= (x0 ?? 270) + (w ?? 540) - 8; x += 20) g.lineTo(x, yl + Math.sin(x * .03 + t * 3) * 3); g.stroke(); g.restore(); }
function label(txt, x, y, k, o = {}) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 1.6); g.font = `400 ${Math.round((o.size || 54) * 1.2)}px "Hand"`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  const yy = y + (1 - eo(k)) * 16; if (o.halo !== false) { g.lineWidth = 10; g.lineJoin = 'round'; g.strokeStyle = o.night ? 'rgba(18,14,46,.6)' : 'rgba(255,236,220,.6)'; g.strokeText(txt, x, yy); }
  g.fillStyle = o.col || (o.night ? CREAM : INK); g.fillText(txt, x, yy); g.restore(); }
function arrow(x0, y0, x1, y1, k, o = {}) { if (k <= 0) return; const u = eo(k), x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0); g.save(); g.strokeStyle = g.fillStyle = o.col || INK; g.lineWidth = o.w || 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x) / 2 + (o.bend || 0), (y0 + y) / 2 - (o.bend || 0), x, y); g.stroke(); if (u > .9) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 22 * Math.cos(a - .45), y - 22 * Math.sin(a - .45)); g.lineTo(x - 22 * Math.cos(a + .45), y - 22 * Math.sin(a + .45)); g.closePath(); g.fill(); } g.restore(); }
function orb(x, y, r, t, a = 1) { if (r <= 0) return; g.save(); g.globalAlpha *= a; const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.6); gr.addColorStop(0, 'rgba(255,236,200,.9)'); gr.addColorStop(.35, 'rgba(255,200,140,.35)'); gr.addColorStop(1, 'rgba(255,190,140,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.6, 0, TAU); g.fill();
  for (let k = 0; k < 3; k++) { const rr = r * (1.15 + k * .35 + .08 * Math.sin(t * 2 + k)); g.strokeStyle = `rgba(255,225,190,${.55 - k * .15})`; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.stroke(); }
  bub(x, y, r, 1); g.restore(); }
// the hollow cellulose fibre: a glowing tube from (x0,y0) to (x1,y1), radius r, gas inside when gas>0
function fiber(x0, y0, x1, y1, r, t, k = 1, gas = 0) { if (k <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0); g.save(); g.translate(x0, y0); g.rotate(a); const l = L * eo(k);
  const edge = (side) => { const p = []; for (let u = 0; u <= l; u += 12) p.push([u, side * r + Math.sin(u * .02 + side) * r * .08]); return p; };
  g.fillStyle = 'rgba(250,236,214,.42)'; g.beginPath(); edge(-1).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); edge(1).reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fill();
  if (gas > 0) { const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, 'rgba(255,255,255,.2)'); gr.addColorStop(.5, 'rgba(255,250,235,.95)'); gr.addColorStop(1, 'rgba(255,255,255,.2)'); g.fillStyle = gr; g.globalAlpha = gas; g.fillRect(r * .4, -r * .55, Math.max(0, l - r * .6), r * 1.1); g.globalAlpha = 1; }
  glowLine(edge(-1), 1, 5); glowLine(edge(1), 1, 5); g.strokeStyle = 'rgba(120,80,60,.35)'; g.lineWidth = 2; for (let u = 30; u < l - 20; u += 46) { g.beginPath(); g.moveTo(u, -r * .7); g.lineTo(u + 16, r * .7); g.stroke(); }
  if (k >= 1) { g.strokeStyle = 'rgba(255,240,220,.95)'; g.lineWidth = 4; g.shadowColor = GLOW; g.shadowBlur = 16; g.beginPath(); g.ellipse(l, 0, r * .3, r, 0, 0, TAU); g.stroke(); } g.restore(); }
const LIQ = (a = 1) => { g.save(); g.globalAlpha *= a; g.fillStyle = 'rgba(58,30,74,.42)'; g.beginPath(); g.roundRect(60, 330, 960, 830, 40); g.fill(); g.strokeStyle = 'rgba(255,236,220,.35)'; g.lineWidth = 3; g.stroke(); g.restore(); };

// ---------- scenes ----------
const SC = [];
const SPECKS = [[335, 1050], [430, 1112], [560, 1106], [690, 1090], [752, 880], [318, 760]];
function bigGlass(t, lit = 0) { sunset(t); glass(t); g.save(); glassPath(g); g.clip();
  SPECKS.forEach(([x, y], k) => { train(x + (x < 540 ? 8 : -8), y - 8, 485, t + k * .37, { rate: 3.2 + k * .4, r0: 4, gr: 7 + k }); speck(x, y, t, 1, lit); });
  flock(t, at(H_LIQ), { amp: 30, col: 'rgba(250,236,255,1)', a: .55, k: .9, n: 260 }); g.restore(); }
SC.push([0, t => { bigGlass(t, ss(R(t, 2.2, .5)));
  const k = R(t, 2.1, .5); if (k > 0) { g.save(); g.strokeStyle = CREAM; g.lineWidth = 4; g.setLineDash([10, 10]); g.beginPath(); g.arc(430, 1112, 50 + 6 * Math.sin(t * 4), 0, TAU * eo(k)); g.stroke(); g.restore(); }
  label('a speck of lint', 230, 980, R(t, 2.3, .5), { size: 52, col: CREAM, night: true }); arrow(250, 1010, 385, 1090, R(t, 2.5, .4), { col: CREAM }); }]);
SC.push([s(1) - .3, t => { sunset(t); train(170, 1140, 340, t, { rate: 3, r0: 4, gr: 8 }); train(880, 1140, 340, t + .4, { rate: 3.4, r0: 4, gr: 8 }); train(780, 1140, 340, t + .9, { rate: 2.6, r0: 3, gr: 9 });
  flock(t, at(H_Q), { from: at(H_LIQ), t0: s(1) - .3, dur: 1.3, amp: 12, k: 1.15 }); }]);
SC.push([s(2) - .3, t => { sunset(t); g.save(); g.strokeStyle = 'rgba(255,240,225,.95)'; g.shadowColor = GLOW; g.shadowBlur = 22; g.lineWidth = 6; g.fillStyle = 'rgba(58,30,74,.3)'; bottlePath(g); g.fill(); g.stroke(); g.restore();
  g.save(); g.fillStyle = '#c94f4f'; g.fillRect(470, 340, 140, 40); g.restore();
  flock(t, at(H_BOT), { from: at(H_Q), t0: s(2) - .3, dur: 1.2, amp: 5 + 3 * Math.sin(t * 9), k: 1.05 });
  const p = .5 + .5 * Math.sin(t * 5); for (let i = 0; i < 3; i++) { arrow(150, 720 + i * 150, 290 - p * 20, 720 + i * 150, R(t, s(2) + 1.6 + i * .15, .4), { col: CREAM, w: 6 }); arrow(930, 720 + i * 150, 790 + p * 20, 720 + i * 150, R(t, s(2) + 1.6 + i * .15, .4), { col: CREAM, w: 6 }); }
  label('CO₂', 230, 520, R(t, s(2) + .9, .5), { size: 76 }); arrow(260, 560, 400, 720, R(t, s(2) + 1.1, .4)); }]);
SC.push([s(3) - .3, t => { sunset(t); g.save(); g.strokeStyle = 'rgba(255,240,225,.95)'; g.shadowColor = GLOW; g.shadowBlur = 22; g.lineWidth = 6; g.fillStyle = 'rgba(58,30,74,.3)'; bottlePath(g); g.fill(); g.stroke(); g.restore();
  const cu = R(t, s(3) + .25, 1.0); g.save(); g.translate(540 + cu * 260, 360 - 300 * cu + 380 * cu * cu); g.rotate(cu * 5); g.globalAlpha = 1 - R(t, s(3) + 1.0, .3); g.fillStyle = '#c94f4f'; g.fillRect(-70, -20, 140, 40); g.restore();
  // glyphs leave through the neck and spread into a wheeling cloud above
  flock(t, (i, tt) => { const h = PS[i].h, out = ss(R(tt, s(3) + .3 + h[5] * 2.2, 1.2)); if (out <= 0) return H_BOT[i]; const n = [540 + (h[2] - .5) * 60, 380];
    if (out < .35) { const u = out / .35; return [lerp(H_BOT[i][0], n[0], u), lerp(H_BOT[i][1], n[1], u)]; } const u = (out - .35) / .65; const q = H_SKY[i]; return [lerp(n[0], q[0], u), lerp(n[1], q[1], u) - Math.sin(u * Math.PI) * 120, 1]; }, { amp: 22, k: 1.05 });
  label('pressure drops', 200, 930, R(t, s(3) + .5, .5), { size: 50 }); label('more gas than it wants', 540, 1080, R(t, s(3) + 3.0, .5), { size: 54 }); }]);
SC.push([s(4) - .3, t => { night(t); flock(t, at(H_ALL), { amp: 34, col: '#d9cff5', a: .55 });
  const T = 1.7, ph = ((t - s(4) + 10 * T) % T) / T, grow = ss(ph / .55), crush = R(ph, .55, .3); const r = 46 * grow * (1 - eo(crush));
  orb(540, 760, r, t, 1 - R(ph, .85, .1)); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = lerp(260, 120, eo(crush)); if (crush > 0 && crush < 1) arrow(540 + Math.cos(a) * (d + 90), 760 + Math.sin(a) * (d + 90), 540 + Math.cos(a) * d, 760 + Math.sin(a) * d, 1, { col: PEACH, w: 6 }); }
  label('a brand-new bubble', 540, 430, R(t, s(4) + .2, .5), { night: true, size: 56 }); label('crushed!', 540, 1060, R(t, s(4) + 1.6, .4), { night: true, size: 66, col: PEACH }); }]);
SC.push([s(5) - .3, t => { night(t); const k = R(t, s(5) + .4, 3.5); const r = 70 + 70 * ss(k);
  flock(t, (i, tt) => { const h = PS[i].h, p = H_ALL[i], u = ss(R(tt, s(5) + .3 + h[5] * 3, .9)); if (u >= 1) return null; return [lerp(p[0], 540, u), lerp(p[1], 760, u), 1 - u * .8]; }, { amp: 30, col: '#d9cff5', a: .65 });
  orb(540, 760, r, t); label('a pocket of gas', 540, 420, R(t, s(5) + 1.6, .5), { night: true, size: 58 }); label('= a head start', 540, 1070, R(t, s(5) + 2.6, .5), { night: true, size: 58, col: PEACH }); }]);
SC.push([s(6) - .3, t => { sunset(t); flock(t, at(H_SKY), { amp: 40, a: .45, k: .9 });
  g.save(); g.fillStyle = 'rgba(230,240,255,.35)'; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 4; g.beginPath(); g.roundRect(330, 340, 420, 800, 20); g.fill(); g.stroke(); g.restore();
  for (let i = 0; i < 6; i++) { const y = 420 + i * 120, x = 380 + hash(i) * 120; const k = R(t, s(6) + .2 + i * .1, .4); glowLine([[x, y], [x + 200 * k, y + 30 * k - 10 * Math.sin(i)]], k > 0 ? 1 : 0, 3, '#ffffff'); }
  label('scratches?', 540, 1080, R(t, s(6) + .2, .4), { size: 62 });
  const lens = R(t, s(6) + 2.6, .7); if (lens > 0) { g.save(); g.globalAlpha = clamp(lens * 2); g.fillStyle = 'rgba(42,31,69,.92)'; g.beginPath(); g.arc(540, 740, 260 * eo(lens), 0, TAU); g.fill(); g.clip();
    fiber(380, 840, 720, 640, 30, t, R(t, s(6) + 3.3, .8), 1); train(705, 640, 480, t, { rate: 3.5, r0: 6, gr: 14 }); g.restore();
    g.save(); g.globalAlpha = clamp(lens * 2); g.strokeStyle = CREAM; g.lineWidth = 12; g.shadowColor = GLOW; g.shadowBlur = 20; g.beginPath(); g.arc(540, 740, 260 * eo(lens), 0, TAU); g.stroke(); g.restore(); }
  const cardK = R(t, s(6) + 3.0, .5); if (cardK > 0) { g.save(); g.globalAlpha = clamp(cardK * 2); g.fillStyle = 'rgba(255,240,228,.92)'; g.beginPath(); g.roundRect(170, 380, 740, 120, 22); g.fill(); g.textAlign = 'center'; g.fillStyle = INK;
    g.font = '800 40px "Inter"'; g.fillText('Gérard Liger-Belair', 540, 432); g.font = '400 34px "Hand"'; g.fillText('University of Reims · filmed the bubble sites', 540, 478); g.restore(); } }]);
SC.push([s(7) - .3, t => { sunset(t); flock(t, at(H_SKY), { amp: 45, a: .4, k: .8, n: 200 });
  g.save(); g.fillStyle = 'rgba(230,240,255,.4)'; g.fillRect(60, 330, 70, 820); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(60, 330, 70, 820); g.restore();
  fiber(130, 1000, 880, 560, 52, t, R(t, s(7) - .1, 1.4)); label('hollow fiber', 560, 440, R(t, s(7) + .5, .5), { size: 62 }); label('cellulose', 640, 1000, R(t, s(7) + 1.3, .5), { size: 50 });
  const icons = [['towels', 260], ['paper', 540], ['dust', 800]]; icons.forEach(([nm, x], k) => { const kk = R(t, s(7) + 2.0 + k * .45, .4); if (kk <= 0) return; g.save(); g.globalAlpha = clamp(kk * 2); g.translate(x, 1090 - 30 * (1 - bo(kk))); g.fillStyle = 'rgba(255,240,228,.9)'; g.beginPath(); g.roundRect(-110, -44, 220, 88, 20); g.fill(); g.restore();
    label(nm, x, 1090 - 30 * (1 - bo(kk)), kk, { size: 48, halo: false }); });
  label('stuck to the wall', 330, 800, R(t, s(7) + 4.4, .5), { size: 52 }); arrow(220, 830, 150, 960, R(t, s(7) + 4.6, .4)); }]);
SC.push([s(8) - .3, t => { sunset(t); g.save(); g.fillStyle = 'rgba(230,240,255,.4)'; g.fillRect(60, 330, 70, 820); g.restore();
  const lv = lerp(1150, 340, ss(R(t, s(8) - .1, 2.0))); g.save(); g.fillStyle = 'rgba(58,30,74,.5)'; g.beginPath(); g.moveTo(130, 1150); g.lineTo(130, lv); for (let x = 130; x <= 1020; x += 20) g.lineTo(x, lv + Math.sin(x * .02 + t * 5) * 10); g.lineTo(1020, 1150); g.closePath(); g.save(); g.clip(); g.fillRect(0, 0, W, H);
  flock(t, at(H_ALL), { amp: 26, col: '#efe6ff', a: .5, k: .85, n: 240 }); g.restore(); g.restore();
  fiber(130, 780, 820, 700, 64, t, 1, 1); g.save(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(0, 1150, W, 10); g.restore();
  label('liquid pours in', 560, 470, R(t, s(8) + .2, .5), { size: 52, night: true }); label('gas pocket stays trapped', 500, 960, R(t, s(8) + 1.6, .5), { size: 54, night: true, col: PEACH }); arrow(500, 920, 520, 770, R(t, s(8) + 1.9, .4), { col: PEACH }); }]);
SC.push([s(9) - .3, t => { sunset(t); LIQ(); const T = 1.6, t0 = s(9) - .3; const n = Math.floor((t - t0) / T), ph = ((t - t0) / T) % 1;
  flock(t, (i, tt) => { const h = PS[i].h, cyc = ((tt - t0 + h[5] * T * 3) / (T * 3)) % 1; const p = H_ALL[i]; const u = ss(cyc / .85); return [lerp(p[0], 450, u * .9), lerp(p[1], 880, u * .9), 1 - ss((cyc - .7) / .3)]; }, { amp: 22, col: '#efe6ff', a: .55 });
  fiber(-20, 1000, 440, 880, 70, t, 1, 1); const r = lerp(30, 100, ss(ph / .75)); const det = R(ph, .75, .25);
  bub(450 + det * 10, 880 - det * 120, r * (1 + det * .1)); for (let k = 1; k < 4; k++) { const age = (k - 1 + ph) * T + (1 - .75) * T; bub(462 + Math.sin(age * 3) * 10, 760 - age * 260 - 20 * age * age, 100 + age * 14, clamp((760 - age * 260 - 20 * age * age - 330) / 80)); }
  [['1  gas seeps in', 0], ['2  the pocket swells', 1.4], ['3  a bubble breaks off', 2.8], ['4  start again', 4.3]].forEach(([tx, d], k) => label(tx, 560, 440 + k * 100, R(t, s(9) + d, .5), { size: 50, align: 'left', night: true, col: k === 3 ? PEACH : CREAM })); }]);
SC.push([s(10) - .3, t => { sunset(t); LIQ(); g.save(); g.beginPath(); g.roundRect(60, 330, 960, 830, 40); g.clip(); flock(t, at(H_ALL), { amp: 26, col: '#efe6ff', a: .4, k: .8, n: 220 });
  train(620, 1110, 345, t * 1.0, { rate: 14, v0: 420, acc: 260, r0: 3, gr: 12, wig: .3 }); g.restore(); fiber(560, 1125, 690, 1105, 12, t, 1, 1);
  const cnt = Math.round(30 * ss(R(t, s(10) + 1.2, 2.0))); if (t > s(10) + 1.1) { label('up to', 290, 520, R(t, s(10) + 1.1, .4), { size: 52, night: true }); label(String(cnt), 290, 640, 1, { size: 170, night: true, col: PEACH }); label('bubbles a second', 290, 770, R(t, s(10) + 1.4, .4), { size: 48, night: true }); }
  label("that's your line", 800, 470, R(t, s(10) + 3.4, .5), { size: 50, night: true }); arrow(760, 500, 650, 560, R(t, s(10) + 3.6, .4), { col: CREAM }); }]);
SC.push([s(11) - .3, t => { sunset(t); LIQ(); g.save(); g.beginPath(); g.roundRect(60, 330, 960, 830, 40); g.clip();
  flock(t, (i, tt) => { const h = PS[i].h, p = H_ALL[i], cyc = ((tt + h[5] * 4) / 4) % 1, u = ss(cyc); const tx = 540, ty = p[1]; return [lerp(p[0], tx, u), ty, 1 - u]; }, { amp: 18, col: '#efe6ff', a: .55 });
  train(540, 1110, 360, t, { rate: 3, v0: 60, acc: 300, r0: 4, gr: 26, wig: .5 }); g.restore(); speck(540, 1125, t, 1, 1);
  label('small', 380, 1040, R(t, s(11) + .4, .4), { size: 50, night: true }); label('bigger', 300, 520, R(t, s(11) + 1.2, .4), { size: 56, night: true, col: PEACH }); arrow(380, 1000, 320, 570, R(t, s(11) + 1.4, .6), { col: CREAM, bend: 20 });
  label('soaking up gas', 780, 800, R(t, s(11) + 2.2, .5), { size: 48, night: true }); label('spreads out', 760, 430, R(t, s(11) + 3.6, .5), { size: 54, night: true, col: PEACH }); }]);
SC.push([s(12) - .3, t => { sunset(t); flock(t, at(H_SKY), { amp: 40, a: .4, k: .85, n: 220 }); const z = eo(R(t, s(12) - .2, 2.4));
  g.save(); g.fillStyle = 'rgba(230,240,255,.55)'; g.beginPath(); g.moveTo(60, 1150); g.lineTo(60, 1010); for (let x = 60; x <= 1020; x += 6) g.lineTo(x, 1010 + Math.sin(x * .9) * 2 * (1 + 3 * z) + Math.sin(x * .23) * 2 * z); g.lineTo(1020, 1150); g.closePath(); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke(); g.restore();
  label('glass bumps', 300, 940, R(t, s(12) + .6, .5), { size: 54 }); arrow(300, 970, 330, 1005, R(t, s(12) + .8, .3));
  const ck = R(t, s(12) + 1.6, .8); if (ck > 0) { g.save(); g.setLineDash([14, 12]); g.strokeStyle = PEACH; g.lineWidth = 6; g.beginPath(); g.arc(560, 700, 200 * eo(ck), 0, TAU); g.stroke(); g.restore(); bub(560, 700, 190 * eo(ck), .35); }
  label('pocket needed', 560, 700, R(t, s(12) + 2.0, .5), { size: 56 }); label('far too small', 790, 930, R(t, s(12) + 2.4, .5), { size: 56, col: '#7a2e3a' }); }]);
SC.push([s(13) - .3, t => { sunset(t); flock(t, at(H_SKY), { amp: 40, a: .4, k: .85, n: 200 });
  const flute = o => { o.beginPath(); o.moveTo(400, 340); o.lineTo(680, 340); o.bezierCurveTo(690, 700, 640, 900, 560, 940); o.lineTo(520, 940); o.bezierCurveTo(440, 900, 390, 700, 400, 340); o.closePath(); };
  g.save(); flute(g); g.save(); g.clip(); g.fillStyle = 'rgba(58,30,74,.45)'; g.fillRect(0, 410, W, H); train(540, 925, 420, t, { rate: 9, v0: 150, acc: 200, r0: 3, gr: 9, wig: 1.6 }); train(530, 925, 420, t + .05, { rate: 7, v0: 140, acc: 220, r0: 3, gr: 8, wig: 2.4 }); g.restore();
  g.strokeStyle = 'rgba(255,240,225,.95)'; g.shadowColor = GLOW; g.shadowBlur = 22; g.lineWidth = 6; g.stroke(); g.beginPath(); g.moveTo(540, 940); g.lineTo(540, 1100); g.moveTo(430, 1120); g.quadraticCurveTo(540, 1095, 650, 1120); g.stroke(); g.restore();
  const ek = R(t, s(13) + .6, .6); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t; glowLine([[540, 922], [540 + Math.cos(a) * 30 * eo(ek), 922 + Math.sin(a) * 14 * eo(ek)]], ek > 0 ? 1 : 0, 3, PEACH); }
  label('laser-etched', 220, 830, R(t, s(13) + .7, .5), { size: 58 }); arrow(260, 865, 505, 925, R(t, s(13) + .9, .5), { bend: -30 }); label('a place to start', 830, 700, R(t, s(13) + 2.6, .5), { size: 50 }); }]);
SC.push([s(14) - .3, t => { bigGlass(t, .6 + .4 * Math.sin(t * 4)); for (let k = 0; k < SPECKS.length; k++) { const kk = R(t, s(14) + .4 + k * .25, .4); if (kk > 0) { g.save(); g.globalAlpha = clamp(kk * 2); g.strokeStyle = PEACH; g.lineWidth = 5; g.beginPath(); g.arc(SPECKS[k][0], SPECKS[k][1], 34, 0, TAU * eo(kk)); g.stroke(); g.restore(); } }
  label('1 speck = 1 line', 540, 418, R(t, s(14) + .3, .5), { size: 60, col: CREAM, night: true }); }]);
SC.push([s(15) - .3, t => { bigGlass(t, 1); const z = eo(R(t, s(15) + .3, .8)); if (z > 0) { g.save(); g.globalAlpha = clamp(z * 2); g.fillStyle = 'rgba(42,31,69,.9)'; g.beginPath(); g.arc(560, 700, 250 * z, 0, TAU); g.fill(); g.clip();
    train(560, 860, 450, t, { rate: 3.5, r0: 8, gr: 22 }); g.save(); g.translate(560, 880); g.scale(4, 4); speck(0, 0, t, 1, 1); g.restore(); g.restore();
    g.save(); g.globalAlpha = clamp(z * 2); g.strokeStyle = CREAM; g.lineWidth = 12; g.shadowColor = GLOW; g.shadowBlur = 20; g.beginPath(); g.arc(560, 700, 250 * z, 0, TAU); g.stroke(); g.restore(); }
  label('yes or no?', 540, 1060, R(t, s(15) + 2.6, .5), { size: 66, col: CREAM, night: true }); }]);
SC.push([s(16) - .35, t => { sunset(t); train(150, 1150, 330, t, { rate: 3, r0: 4, gr: 9 }); train(930, 840, 330, t + .5, { rate: 3, r0: 4, gr: 9 });
  flock(t, (i, tt) => { const a = i / N * TAU + tt * .35, r = 360 + (PS[i].h[4] - .5) * 70; return [540 + Math.cos(a) * r, 760 + Math.sin(a) * r * .95]; }, { from: at(H_LIQ), t0: s(16) - .35, dur: 1.2, amp: 10 });
  const k = R(t, s(16) - .2, .6); g.save(); g.globalAlpha = clamp(k * 2); g.fillStyle = 'rgba(255,240,228,.86)'; g.beginPath(); g.roundRect(200, 665, 680, 175, 30); g.fill(); g.textAlign = 'center'; g.fillStyle = INK; g.font = '800 62px "Inter"'; g.fillText('Follow for more of', 540, 730); g.fillStyle = '#7a2e5a'; g.fillText('how it really works.', 540, 810); g.restore();
  g.save(); g.globalAlpha = clamp(R(t, s(16) + .1, .6) * 2); g.fillStyle = 'rgba(42,31,69,.82)'; g.beginPath(); g.roundRect(150, 1205, 780, 150, 26); g.fill(); g.textAlign = 'center'; g.fillStyle = CREAM; g.font = '400 52px "Hand"'; g.fillText("A new 'wait, really?' every day.", 540, 1265); g.fillStyle = PEACH; g.font = '700 40px "Inter"'; g.fillText('@howitreallyworkstudio', 540, 1325); g.restore(); }]);

// karaoke subtitle: bold sans, spoken words cream, key (**) words peach, on a dark plum pill centred at y 1300
function karaoke(ph, t, out) { if (!ph) return; const a = clamp((t - ph.start + .2) / .2) * (out != null ? clamp((out - t) / .2) : 1); if (a <= 0) return; g.save(); g.font = '800 50px "Inter"';
  const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  const tot = ws.reduce((q, w) => q + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = g.measureText(w.w).width; });
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; ws.forEach(w => { if (lw + w.ww > 860 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const lh = 62, y0 = 1300 - (lines.length - 1) * lh / 2, widest = Math.max(...lines.map(l => l.reduce((q, w) => q + w.ww, 0) + sp * (l.length - 1)));
  g.globalAlpha = a * .88; g.fillStyle = 'rgba(32,20,52,.86)'; g.beginPath(); g.roundRect(540 - widest / 2 - 30, y0 - 50, widest + 60, lines.length * lh + 26, 22); g.fill();
  lines.forEach((ln, li) => { const w = ln.reduce((q, x) => q + x.ww, 0) + sp * (ln.length - 1); let x = 540 - w / 2; ln.forEach(wd => { g.globalAlpha = a * (t >= wd.t0 ? 1 : .55); g.fillStyle = wd.hl ? PEACH : CREAM; g.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  g.restore(); }
function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  let i = 0; SC.forEach((cc, k) => { if (t >= cc[0]) i = k; }); const u = R(t, SC[i][0], .45);
  if (i > 0 && u < 1) { g.save(); SC[i - 1][1](t); g.restore(); g.save(); g.globalAlpha = ss(u); SC[i][1](t); g.restore(); } else SC[i][1](t);
  const ph = PH.findLast(p => t >= p.start - .25); if (ph && ph.i < PH.length - 1) karaoke(ph, t, PH[ph.i + 1].start - .15); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .4; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { bigGlass(3, 1); g.save(); g.textAlign = 'center'; g.font = '800 92px "Inter"'; g.lineWidth = 14; g.lineJoin = 'round'; g.strokeStyle = 'rgba(32,20,52,.85)';
  [['Why do soda bubbles', 300], ['rise in lines?', 400]].forEach(([tx, y], k) => { g.strokeText(tx, 540, y); g.fillStyle = k ? PEACH : CREAM; g.fillText(tx, 540, y); }); g.restore(); };
window.seek(0); window.ready = true; window.READY = true;
