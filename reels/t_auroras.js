// t_auroras.js: "What causes the northern lights?" in template #5 Impasto / palette knife (lemo-opuscar impasto). 1080x1920, pure function of t.
// Engine from the demo (styles/knife/: impasto.js WebGL knife/brush/dab/line strokes into colour + height targets at 2x, raking light over the
// paint ridges, wet speculars, canvas weave; plate.js turns a flat value-planned reference illustration into coarse-to-fine knife strokes that
// never cross shape groups). Demo grammar kept: static paint stays static, only story things move (the aurora curtains, the solar wind, particles),
// rebuilt each frame from fixed seeds so the paint never boils; reflections on wet/icy ground are explicit stacks of short horizontal knife dabs;
// warm light against cool shadow, the purest chroma kept for the subject (the aurora); titles are laid in with the knife (a left-to-right appear
// sweep); small text (captions) stays crisp. Batch N layout: captions inside x 80-880, bottom at y 1355 on the dark frozen lake.
import { Impasto, Strokes, KNIFE, BRUSH, DAB, LINE, hex } from './styles/knife/impasto.js';
import { Ref, paintRef } from './styles/knife/plate.js';
import { P, E as EL, lin, rad, clamp, lerp, seg, eo, hash } from './styles/knife/common.js';
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
await Promise.all(['italic 600 110px Corm', '400 46px Bask', 'italic 400 48px BaskI'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const W = 1080, H = 1920, CX = 540, TAU = Math.PI * 2;
const glc = document.getElementById('gl'), ov = document.getElementById('ov'); ov.width = W; ov.height = H; const o2 = ov.getContext('2d');
const E = new Impasto(glc, { W, H, ss: 2 }); const dyn = new Strokes(12000);
const CAM = { x: W / 2, y: H / 2, zoom: 1, rot: 0 };

// ---------- plates (reference illustration -> knife strokes, once) ----------
const up = (R, strokes, w, h) => ({ b: E.batch(strokes.data()), tex: E.texture(R.ctx.canvas), w, h });
function build(fn, w = W, h = H, sc = .5, o = {}) { const R = new Ref(w, h, sc); fn(R); const st = paintRef(R, { T: 14, seed: o.seed || 3, ...o }); return up(R, st, w, h); }
const stars = (R, n, y1, seed) => { for (let i = 0; i < n; i++) { const x = hash(i * 3.1 + seed) * W, y = 40 + hash(i * 7.7 + seed) * (y1 - 40), r = 2.5 + 3 * hash(i * 1.3 + seed); R.fill(EL(x, y, r, r), hash(i) > .8 ? '#ffe9b8' : '#e8ecff', { maxR: 2, type: DAB, group: 'st' + (i % 3) }); } };
const SKY = lin(0, 0, 0, 1080, [[0, '#060a1f'], [.55, '#0d1b3c'], [1, '#1f3f52']]);
function nightPlate(R, town = false) {
  R.fill(P([[0, 0], [W, 0], [W, 1110], [0, 1110]]), SKY, { dir: 0, fallback: 0, group: 'sky', maxR: 40, jit: .05, detail: 2.2 });
  stars(R, 90, 900, town ? 11 : 3);
  R.fill(P([[0, 1010], [120, 940], [260, 980], [420, 900], [560, 970], [700, 920], [860, 975], [1080, 930], [1080, 1110], [0, 1110]]), lin(0, 900, 0, 1110, [[0, '#1d2446'], [1, '#141a33']]), { dir: 10, group: 'mtn', maxR: 18 });
  if (!town) { for (const [x, h] of [[60, 160], [130, 120], [190, 190], [930, 170], [1000, 130], [1050, 200]]) R.fill(P([[x, 1100 - h], [x + 44, 1100], [x - 44, 1100]]), '#0a1216', { dir: 90, group: 'pine', maxR: 8 });
    R.fill(P([[680, 1040], [860, 1040], [860, 1100], [680, 1100]]), '#3b2a26', { dir: 90, group: 'cab', maxR: 8 }); R.fill(P([[660, 1044], [770, 980], [880, 1044]]), '#d8e2f2', { dir: 20, group: 'roof', maxR: 6 });
    for (const x of [710, 800]) R.fill(P([[x, 1056], [x + 34, 1056], [x + 34, 1084], [x, 1084]]), '#ffb75e', { maxR: 4, group: 'win' }); }
  else { let x = -20; let k = 0; while (x < W + 40) { const w = 110 + 50 * hash(k), h = 70 + 40 * hash(k + 3), b = 1100; R.fill(P([[x, b - h], [x + w / 2, b - h - 50], [x + w, b - h], [x + w, b], [x, b]]), k % 2 ? '#2a2c44' : '#33304a', { dir: 90, group: 'h' + k, maxR: 10 });
      R.fill(P([[x + w * .35, b - h * .6], [x + w * .55, b - h * .6], [x + w * .55, b - h * .3], [x + w * .35, b - h * .3]]), '#ffc56e', { maxR: 4, group: 'hw' + k }); x += w + 8; k++; } }
  R.fill(P([[0, 1100], [W, 1100], [W, 1140], [0, 1140]]), '#7d8ab0', { dir: 0, group: 'shore', maxR: 8 });
  R.fill(P([[0, 1140], [W, 1140], [W, H], [0, H]]), lin(0, 1140, 0, H, [[0, '#0e1d38'], [1, '#050a16']]), { dir: 0, fallback: 0, group: 'lake', maxR: 36, detail: 2 }); }
function spacePlate(R, sun = true) { R.fill(P([[0, 0], [W, 0], [W, H], [0, H]]), lin(0, 0, 0, H, [[0, '#04050c'], [1, '#0a0b1c']]), { dir: 0, group: 'space', maxR: 40, detail: 2.4 }); stars(R, 120, 1880, sun ? 21 : 31);
  if (sun) { R.fill(EL(250, 760, 340, 340), rad(250, 760, 40, 340, [[0, '#fff4c2'], [.5, '#ffc04a'], [1, '#e2541c']]), { dir: { radial: [250, 760] }, group: 'sun', maxR: 26, detail: 1.4 });
    R.fill(EL(900, 1180, 46, 46), rad(890, 1170, 4, 46, [[0, '#8fc4ff'], [1, '#1f4f9a']]), { maxR: 6, group: 'earthS' }); }
  else { R.fill(EL(540, 900, 230, 230), rad(500, 860, 30, 230, [[0, '#3d86d8'], [1, '#0f3270']]), { dir: { radial: [540, 900], off: 90 }, group: 'earth', maxR: 16 });
    for (const [x, y, rx, ry] of [[470, 830, 90, 60], [620, 960, 70, 90], [520, 1010, 60, 40]]) R.fill(EL(x, y, rx, ry), '#4f8c4a', { group: 'land', maxR: 8 });
    R.fill(EL(540, 676, 70, 14), '#eef4ff', { group: 'ice', maxR: 5 }); R.fill(EL(540, 1124, 70, 14), '#eef4ff', { group: 'ice2', maxR: 5 }); } }
function atmoPlate(R) { R.fill(P([[0, 0], [W, 0], [W, H], [0, H]]), lin(0, 0, 0, H, [[0, '#04050d'], [1, '#0b1020']]), { dir: 0, group: 'space', maxR: 40, detail: 2.4 }); stars(R, 70, 600, 41);
  R.fill(c => { c.arc(540, 3300, 2280, 0, TAU); }, rad(540, 3300, 2000, 2300, [[0, '#0d1828'], [.9, '#162a44'], [1, '#2a4a6c']]), { dir: 0, group: 'earth', maxR: 30 });
  for (let i = 0; i < 26; i++) { const x = 60 + hash(i * 2.7) * 960, y = 1080 + hash(i * 5.1) * 200; R.fill(EL(x, y, 4, 3), '#ffcf7a', { maxR: 2, type: DAB, group: 'city' + (i % 2) }); } }
const PL = {};
function plates() { PL.night = build(R => nightPlate(R, false)); PL.town = build(R => nightPlate(R, true), W, H, .5, { seed: 5 }); PL.sun = build(R => spacePlate(R, true), W, H, .5, { seed: 7 }); PL.earth = build(R => spacePlate(R, false), W, H, .5, { seed: 9 }); PL.atmo = build(atmoPlate, W, H, .5, { seed: 13 }); }
function plate(pl, t, o = {}) { E.under(pl.tex, pl.w, pl.h, { M: o.M, cam: CAM, t, grey: 0, alpha: o.alpha ?? 1 }); E.draw(pl.b, { M: o.M, cam: CAM, t, grey: 0, alpha: o.alpha ?? 1, hgt: o.hgt ?? 1 }); }

// ---------- knife-laid titles (one plate per scene, laid left to right) ----------
const TI = {};
function titlePlate(key, l1, l2, col = '#f3e6c6', col2 = '#7ff0b4') { const R = new Ref(1000, 300, 1);
  R.text(l1, 0, 120, 'italic 600 112px Corm', col, { align: 'left', maxR: 6, dir: 0, group: 't1' }); if (l2) R.text(l2, 4, 240, 'italic 600 96px Corm', col2, { align: 'left', maxR: 6, dir: 0, group: 't2' });
  const st = paintRef(R, { R: [9, 5, 3, 2], T: 18, seed: 17 + key.length, app: (ux) => ux / 1000 * .8 }); TI[key] = { b: E.batch(st.data()), w: 1000, h: 300 }; }
function title(key, t, at) { const T2 = TI[key]; if (!T2) return; E.draw(T2.b, { M: [1, 0, 0, 1, 56, 220], cam: CAM, t, grey: 0, appear: at, appDur: .14, hgt: 1.3 }); }

// ---------- dynamic paint (fixed seeds: positions move smoothly, the paint never boils) ----------
const GREEN = hex('#4dff9a'), GREEN2 = hex('#2bd38a'), RED = hex('#ff4f7a'), PURP = hex('#a874ff'), BLUE = hex('#5a8cff'), CREAMc = hex('#f3e6c6');
function curtain(t, o = {}) { const n = o.n || 64, y0 = o.y || 560, amp = o.amp || 1, a = o.a ?? 1, top = o.top || RED, bot = o.bot || GREEN, x0 = o.x0 ?? -60, x1 = o.x1 ?? 1140, sd = o.seed || 1;
  for (let i = 0; i < n; i++) { const u = i / (n - 1), x = lerp(x0, x1, u), base = y0 + amp * (110 * Math.sin(u * 5.2 + t * .35 + sd) + 50 * Math.sin(u * 13 - t * .6 + sd * 2)), hgt = (260 + 140 * Math.sin(u * 7 + t * .4 + sd)) * (o.tall || 1), fl = .6 + .4 * Math.sin(t * 1.3 + i * .7 + sd);
    for (let j = 0; j < 6; j++) { const f = j / 5, y = base - f * hgt, c = f < .55 ? (o.mid ? mix3(bot, o.mid, f / .55) : bot) : mix3(bot, top, (f - .55) / .45);
      const cap = ss(o.capY ?? 470, (o.capY ?? 470) + 150, y);     // keep the title band clear: the curtain fades out above it
      dyn.push({ x: x + 6 * Math.sin(t * .8 + j + i), y, ang: Math.PI / 2 + .08 * Math.sin(u * 9 + t * .5), len: hgt / 4.2, wid: 20 + 10 * hash(i * 3 + j + sd), c, c2: mix3(c, [1, 1, 1], .18), seed: i * 31 + j + sd * 97, type: KNIFE, alpha: a * fl * (1 - f * .55) * cap, hgt: .6 });
      if (o.reflect) { const ry = 1145 + (1100 - y) * .42; if (ry < 1146 || ry > 1560) continue;     // mirrored in the frozen lake as broken horizontal dabs
        for (let q = 0; q < 2; q++) dyn.push({ x: x + (q - .5) * 18 + 10 * Math.sin(t * 2 + i + q), y: ry + q * 10 + 5 * Math.sin(t * 1.6 + i * .9), ang: 0, len: 26 + 30 * hash(i + j + q), wid: 8, c, seed: i * 17 + j * 3 + q + 500, type: KNIFE, alpha: a * .34 * fl * (1 - f * .5) * cap * (1 - (ry - 1145) / 480), hgt: .4 }); } } } }
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function wind(t, k, o = {}) { const n = o.n || 160; for (let i = 0; i < n; i++) { const h1 = hash(i * 1.7), u = (t * (o.sp || .22) + h1) % 1, ang = lerp(-.45, .75, hash(i * 3.3)), r0 = 340 + u * 900, x = 250 + Math.cos(ang) * r0, y = 760 + Math.sin(ang) * r0;
  if (x > W + 40 || y > H) continue; dyn.push({ x, y, ang, len: 30 + 30 * hash(i * 5), wid: 6 + 4 * hash(i * 7), c: hex('#ffd36a'), c2: hex('#ff9a3a'), seed: i * 13 + 7, type: KNIFE, alpha: k * (1 - u * .6), hgt: .5 }); } }
function cme(t, lt) { const r = 360 + eo(lt / 4) * 520; for (let i = 0; i < 140; i++) { const a = -.3 + .9 * hash(i * 2.3) + .1 * Math.sin(t + i), rr = r * (.85 + .2 * hash(i * 4.4)); dyn.push({ x: 250 + Math.cos(a) * rr, y: 760 + Math.sin(a) * rr, ang: a, len: 50, wid: 26, c: hex('#ff7a3a'), c2: hex('#ffd36a'), seed: i * 11 + 3, type: DAB, alpha: .85 * (1 - eo(lt / 4) * .4), hgt: .7 }); } }
function field(t, k, flow) { const cx = 540, cy = 900, R0 = 230; for (const L of [1.5, 2.1, 2.9, 3.8]) for (const sd of [-1, 1]) { const pts = []; for (let i = 0; i <= 40; i++) { const th = lerp(.18, Math.PI - .18, i / 40), r = L * R0 * Math.sin(th) ** 2; if (r < R0 * 1.02) continue; pts.push([cx + sd * r * Math.sin(th), cy - r * Math.cos(th)]); }
    for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; dyn.push({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, ang: Math.atan2(y1 - y0, x1 - x0), len: Math.hypot(x1 - x0, y1 - y0) * 1.2, wid: 4, c: hex('#8f9cff'), seed: L * 100 + i + sd * 7, type: LINE, alpha: .6 * clamp(k * 40 / (i + 1)), hgt: .3 }); }
    if (flow > 0) for (let q = 0; q < 6; q++) { const u = (t * .25 + q / 6 + L * .13) % 1, th = lerp(Math.PI / 2, u < .5 ? .3 : Math.PI - .3, (u % .5) * 2), r = L * R0 * Math.sin(th) ** 2; if (r < R0) continue; dyn.push({ x: cx + sd * r * Math.sin(th), y: cy - r * Math.cos(th), ang: 0, len: 16, wid: 16, c: GREEN, seed: q * 9 + L * 3 + sd, type: DAB, alpha: flow, hgt: .6 }); } }
  if (flow > 0) for (const py of [676, 1124]) for (let i = 0; i < 14; i++) dyn.push({ x: 540 + (hash(i * 3.1) - .5) * 150, y: py + (py < 900 ? -1 : 1) * (10 + 20 * hash(i * 5.3)), ang: 0, len: 22, wid: 12, c: GREEN, seed: i + py, type: DAB, alpha: flow * (.5 + .5 * Math.sin(t * 3 + i)), hgt: .5 }); }
function rainHits(t, k, mixc) { for (let i = 0; i < 90; i++) { const u = (t * .5 + hash(i * 2.1)) % 1, x = 60 + hash(i * 3.7) * 960, yh = 620 + hash(i * 5.9) * 380, y = lerp(120, yh, Math.min(1, u * 1.4)), hit = u > .7;
  const c = mixc ? mixc(i, yh) : GREEN; dyn.push({ x, y, ang: Math.PI / 2, len: hit ? 40 : 60, wid: hit ? 34 : 6, c: hit ? c : hex('#ffe9a0'), seed: i * 7, type: hit ? DAB : LINE, alpha: k * (hit ? 1 - (u - .7) / .3 : .8), hgt: .5 }); } }
function atom(x, y, r, c, k, t, sd) { for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + t * .4; dyn.push({ x: x + Math.cos(a) * r * .7, y: y + Math.sin(a) * r * .7, ang: a + Math.PI / 2, len: r * .5, wid: r * .32, c, c2: mix3(c, [1, 1, 1], .35), seed: sd + i, type: KNIFE, alpha: k * (.75 + .25 * Math.sin(t * 3 + i)), hgt: .7 }); }
  dyn.push({ x, y, ang: 0, len: r * .8, wid: r * .8, c: mix3(c, [1, 1, 1], .5), seed: sd + 50, type: DAB, alpha: k, hgt: .8 }); }
function cycleWave(t, k) { const x0 = 610, x1 = 1010, y = 1060; for (let i = 0; i < 60; i++) { const u = i / 59, uu = (i + 1) / 59; if (u > k) break; const ya = y - 150 * (.5 + .5 * Math.sin(u * TAU * 1.5 - 1.2)), yb = y - 150 * (.5 + .5 * Math.sin(uu * TAU * 1.5 - 1.2)), xa = lerp(x0, x1, u), xb = lerp(x0, x1, uu);
  dyn.push({ x: (xa + xb) / 2, y: (ya + yb) / 2, ang: Math.atan2(yb - ya, xb - xa), len: Math.hypot(xb - xa, yb - ya) * 1.3, wid: 12, c: hex('#ffc04a'), seed: i * 3, type: KNIFE, alpha: 1, hgt: .8 }); } }
const flush = (o = {}) => { if (dyn.n) E.drawNow(dyn.data(), { cam: CAM, grey: 0, ...o }); dyn.clear(); };

// ---------- crisp overlay: captions + small labels ----------
function caption(t) { let i = -1; for (let k = 0; k < PH.length - 1; k++) if (t >= PH[k].start - .1 && t < PH[k + 1].start - .1) i = k; if (i < 0) return; const p = PH[i];
  const g = o2; g.save(); g.font = '400 46px Bask'; let bold = false; const toks = p.cap.split(' ').map(w => { if (w.startsWith('**')) bold = true; const r = { w: w.replace(/\*\*/g, ''), b: bold }; if (w.replace(/[.,!?:;]+$/, '').endsWith('**')) bold = false; return r; });
  const lines = [[]]; let lw = 0; toks.forEach(o => { const ww = g.measureText(o.w + ' ').width; if (lw + ww > 780 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...o, ww }); lw += ww; });
  const lh = 58, y0 = 1355 - lines.length * lh + 44, a = clamp((t - p.start + .1) / .3), prog = clamp((t - p.start) / Math.max(.6, p.end - p.start - .2)), n = toks.length; let idx = 0;
  { const gr = g.createLinearGradient(0, y0 - 70, 0, 1385); gr.addColorStop(0, 'rgba(4,7,18,0)'); gr.addColorStop(.25, 'rgba(4,7,18,.5)'); gr.addColorStop(1, 'rgba(4,7,18,.55)'); g.fillStyle = gr; g.globalAlpha = a; g.fillRect(0, y0 - 70, W, 1385 - y0 + 70); g.globalAlpha = 1; }   // a calm plane for the type
  g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 10; lines.forEach((ln, j) => { const tw = ln.reduce((q, o) => q + o.ww, 0); let x = 480 - tw / 2; ln.forEach(o => { g.font = o.b ? 'italic 400 48px BaskI' : '400 46px Bask'; g.fillStyle = o.b ? '#8ff5bd' : '#f3e6c6'; g.globalAlpha = a * (idx / n <= prog + .03 ? 1 : .5); g.fillText(o.w, x, y0 + j * lh); x += o.ww; idx++; }); }); g.restore(); }
function label(str, x, y, k, o = {}) { if (k <= 0) return; const g = o2; g.save(); g.globalAlpha = clamp(k / .4); g.font = `${o.it ? 'italic 400 ' : '400 '}${o.size || 40}px ${o.it ? 'BaskI' : 'Bask'}`; g.textAlign = o.align || 'center'; g.fillStyle = o.col || '#f3e6c6'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 8; g.fillText(str, x, y); g.restore(); }

// ---------- shots ----------
const START = PH.map(p => p.start); START[0] = 0;
const SH = [
  { pl: 'night', ti: ['hook', 'Green fire?', 'silent and enormous'], f: (t, lt) => { curtain(t, { reflect: true, amp: .8, y: 880, tall: 1.1 }); } },
  { pl: 'night', ti: ['but', 'Not fire.', 'so what is it?'], f: (t, lt) => { curtain(t, { reflect: true, amp: .8, y: 880, tall: 1.1 }); } },
  { pl: 'sun', ti: ['sun', 'It starts', 'on the Sun'], f: (t, lt) => { label('93 million miles away', 760, 1260 - 160, lt - .8, { it: true }); } },
  { pl: 'sun', ti: ['wind', 'The solar wind', 'charged particles'], f: (t, lt) => { wind(t, clamp(lt / .8)); } },
  { pl: 'sun', ti: ['cme', 'A giant cloud', 'coronal mass ejection'], f: (t, lt) => { wind(t, .6); cme(t, lt); } },
  { pl: 'earth', ti: ['field', 'Caught', "by Earth's magnetic field"], f: (t, lt) => { field(t, clamp(lt / 1.2), 0); wind2(t); } },
  { pl: 'earth', ti: ['poles', 'Steered', 'to the North and South Poles'], f: (t, lt) => { field(t, 1, clamp(lt / .6)); } },
  { pl: 'atmo', ti: ['slam', 'They slam', 'into the air'], f: (t, lt) => { rainHits(t, clamp(lt / .6)); label('300 miles', 110, 560, lt - .6, { it: true, align: 'left', size: 36 }); label('50 miles', 110, 1000, lt - .9, { it: true, align: 'left', size: 36 }); } },
  { pl: 'atmo', ti: ['glow', 'The air glows', 'like a giant neon sign'], f: (t, lt) => { rainHits(t, 1); curtain(t, { y: 980, amp: .4, tall: .8, a: clamp(lt / 1.2) }); } },
  { pl: 'atmo', ti: ['gas', 'Which gas?', 'the color tells you'], f: (t, lt) => { atom(300, 780, 150, GREEN, clamp(lt / .5), t, 10); atom(780, 780, 150, BLUE, clamp((lt - .5) / .5), t, 40); label('?', 540, 820, lt - .9, { size: 90, col: '#8ff5bd' }); } },
  { pl: 'atmo', ti: ['oxy', 'Oxygen', 'green, or red'], f: (t, lt) => { atom(300, 780, 150, GREEN, 1, t, 10); atom(780, 780, 150, RED, clamp((lt - .6) / .5), t, 20); label('O', 300, 800, 1, { size: 70 }); label('O', 780, 800, lt - .6, { size: 70 }); } },
  { pl: 'atmo', ti: ['nit', 'Nitrogen', 'blue and purple'], f: (t, lt) => { atom(300, 780, 150, BLUE, 1, t, 40); atom(780, 780, 150, PURP, clamp((lt - .4) / .5), t, 60); label('N', 300, 800, 1, { size: 70 }); label('N', 780, 800, lt - .4, { size: 70 }); } },
  { pl: 'sun', ti: ['cycle', 'An 11-year cycle', 'and 2024 was the peak'], f: (t, lt) => { cycleWave(t, clamp(lt / 3)); label('11 years', 810, 1110, lt - 1.5, { it: true, size: 36 }); label('2024: peak', 880, 880, lt - 3, { it: true, col: '#ffd36a' }); wind(t, .4, { n: 80 }); } },
  { pl: 'town', ti: ['storm', 'May 2024', 'strongest in 20 years'], f: (t, lt) => { curtain(t, { reflect: true, y: 880, amp: .8, tall: 1.1, top: PURP, bot: RED, mid: GREEN, a: clamp(lt / 1.2) }); } },
  { pl: 'night', ti: ['more', 'More storms', 'more chances to look up'], f: (t, lt) => { curtain(t, { reflect: true, y: 900, amp: .8, tall: 1.05 }); curtain(t, { reflect: true, y: 800, amp: .6, seed: 3, a: clamp(lt / 1), top: PURP, bot: GREEN2, tall: .8 }); } },
  { pl: 'night', ti: ['pay', "The Sun's wind,", 'painted on our sky'], f: (t, lt) => { curtain(t, { reflect: true, y: 900, amp: .8, tall: 1.1 }); curtain(t, { reflect: true, y: 790, amp: .6, seed: 5, top: PURP, bot: GREEN2, tall: .8 }); } },
  { pl: 'night', ti: ['yes', 'Seen them?', 'yes or no'], f: (t, lt) => { curtain(t, { reflect: true, y: 880, amp: .8, tall: 1.1 }); } },
  { pl: 'night', ti: null, f: (t, lt) => { curtain(t, { reflect: true, y: 1020, tall: .45, a: .6, capY: 880 }); const k = clamp(lt / .5); label('Follow for more of', CX, 600, k, { size: 70 }); label('how it really works.', CX, 690, k, { size: 70, col: '#8ff5bd' }); label("A new 'wait, really?' every day.", CX, 775, lt - .6, { it: true, size: 44 }); label('@howitreallyworkstudio', CX, 840, lt - .8, { size: 40, col: '#ffd36a' }); } },
];
function wind2(t) { for (let i = 0; i < 70; i++) { const u = (t * .2 + hash(i * 1.9)) % 1, x = lerp(-40, 300, u), y = 520 + hash(i * 4.1) * 760; dyn.push({ x, y, ang: 0, len: 30, wid: 6, c: hex('#ffd36a'), seed: i + 900, type: KNIFE, alpha: .8 * (1 - u), hgt: .4 }); } }
function sceneAt(t) { let k = 0; for (let i = 0; i < SH.length; i++) if (t >= START[i] - .25) k = i; return k; }
const POST = { light: [-.5, -.6, .7], norm: 3.4, amb: .82, dif: .3, spec: .22, shin: 28, ao: 1.2, ground: [.05, .07, .14], vig: .3, weave: .1, lightCol: [.9, .97, 1], sat: 1.05, contrast: 1.04 };
let F0 = null;
function draw(t) { const k = sceneAt(t), S = SH[k], lt = k === 0 ? t + 1 : t - (START[k] - .25); E.begin([.05, .07, .14]);
  plate(PL[S.pl], t); S.f(t, lt); flush({ t }); if (S.ti) title(S.ti[0], t, k === 0 ? -9 : START[k] - .25);
  E.finish(POST); o2.setTransform(1, 0, 0, 1, 0, 0); o2.clearRect(0, 0, W, H); S.f2 && S.f2(t, lt); labelsOf(k, t, lt); if (k < SH.length - 1) caption(t);
  const lp = clamp((t - (TOT - .5)) / .5) * .4; if (lp > 0 && F0) { o2.save(); o2.globalAlpha = lp; o2.drawImage(F0, 0, 0); o2.restore(); } }
// labels are issued from the shot functions during the stroke pass; buffer them and draw after the overlay is cleared
let LQ = []; const _label = label; function labelsOf() { LQ.forEach(a => _label(...a)); LQ = []; }
label = (...a) => LQ.push(a);

plates(); SH.forEach(S => S.ti && titlePlate(S.ti[0], S.ti[1], S.ti[2]));
draw(0); F0 = document.createElement('canvas'); F0.width = W; F0.height = H; { const g = F0.getContext('2d'); g.drawImage(glc, 0, 0); g.drawImage(ov, 0, 0); }

const r = (i, d = 0) => s(i) + d;
window.CUES = [['whoosh', .3], ['sparkle', 1.4], ['chime', 2.6, 79], ['whoosh', r(1, -.2)], ['whoosh', r(2, -.2)], ['chime', r(2, .5), 72], ['whoosh', r(3, .2)], ['whoosh', r(3, 1.6)], ['thud', r(4, .3)], ['whoosh', r(4, 1)], ['whoosh', r(5, -.2)], ['chime', r(5, .6), 76],
  ['slide', r(6, .2)], ['whoosh', r(7, -.2)], ['pop', r(7, .8)], ['pop', r(7, 1.3)], ['sparkle', r(8, .4)], ['chime', r(8, 1.2), 84], ['pop', r(9, .3)], ['pop', r(9, .8)], ['chime', r(10, .2), 79], ['chime', r(10, .8), 74], ['chime', r(11, .2), 76], ['chime', r(11, .6), 81],
  ['whoosh', r(12, -.2)], ['scribble', r(12, .2), r(12, 3)], ['thud', r(13, .2)], ['sparkle', r(13, 1.2)], ['whoosh', r(14, -.2)], ['sparkle', r(14, 1)], ['chime', r(15, .5), 79], ['sparkle', r(15, 1.6)], ['pop', r(16, .6)], ['chime', r(17, .3), 84]];
window.DUR = TOT;
window.seek = t => draw(t);
window.render = window.seek;
window.thumb = () => { E.begin([.05, .07, .14]); plate(PL.night, 3); curtain(3, { reflect: true, y: 920, tall: 1.2, capY: 700 }); curtain(3, { reflect: true, y: 820, amp: .6, seed: 5, top: PURP, bot: GREEN2, capY: 700 }); flush({ t: 3 }); E.finish(POST);
  o2.setTransform(1, 0, 0, 1, 0, 0); o2.clearRect(0, 0, W, H); o2.save(); o2.font = 'italic 600 150px Corm'; o2.fillStyle = '#f3e6c6'; o2.shadowColor = 'rgba(0,0,0,.7)'; o2.shadowBlur = 16; o2.fillText('What causes', 70, 360); o2.fillStyle = '#8ff5bd'; o2.fillText('the northern', 70, 510); o2.fillText('lights?', 70, 660); o2.restore(); };
window.seek(0); window.ready = true; window.READY = true;
