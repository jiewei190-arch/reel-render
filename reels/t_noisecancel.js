// t_noisecancel.js: "How do noise-cancelling headphones work?" in template #14 explainer "Alchemy Infra" (demo 80), same kit as search.
// Demo moves reused: kinetic Inter/Instrument-Serif type with horizontal smear; indigo iso geometry with thin light edges + leader callouts;
// glass terminal card with traffic lights and a status pill; motion-blur big number; full-frame indigo / white flash cards between sections;
// lens-flare end ring. The waves are the subject: a white noise wave, an indigo anti-noise wave, their cyan sum.
// Batch N layout: corner brackets kept, HUD text moved to y 280 (no text in the top 250 px); content y 300-1130; captions centred at y 1290
// (x 180-900); a live "net sound" oscilloscope strip at y 1395-1440 under the caption; nothing written in the right column below y 840.
import { createAL, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/alchemy/alchemy.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const A = createAL(document.getElementById('c')), g = A.g, lg = A.lg, R = ramp;

// ---------- waves ----------
// draw y = y0 + amp*sin(k*x - w*t + ph) across [x0,x1]; k from wavelength
function wave(x0, x1, y0, amp, wl, t, o = {}) { const c = lg, sp = o.speed ?? 2, ph = o.ph || 0, inv = o.inv ? -1 : 1, prog = o.prog ?? 1; if (prog <= 0) return; c.save(); c.globalAlpha *= o.a ?? 1;
  c.strokeStyle = o.col || C.white; c.lineWidth = o.w || 6; c.lineCap = 'round'; if (o.glow) { c.shadowColor = o.col || C.white; c.shadowBlur = o.glow; }
  c.beginPath(); const xe = lerp(x0, x1, prog); for (let x = x0; x <= xe; x += 4) { const y = y0 + inv * amp * Math.sin((x / wl) * TAU - t * sp + ph) * (o.env ? o.env(x) : 1); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); c.restore(); }
// headphones (line art over glass): headband arc + two earcups, centred at x, y (cup centres), scale s
function phones(x, y, s, o = {}) { const c = lg; c.save(); c.globalAlpha *= o.a ?? 1; c.translate(x, y); c.scale(s, s);
  c.strokeStyle = 'rgba(200,205,255,.9)'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 230, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
  [-1, 1].forEach(sd => { A.use(c); A.glass(sd * 230 - 80, -40, 160, 220, { r: 70 }); c.fillStyle = 'rgba(75,75,245,.55)'; c.beginPath(); c.roundRect(sd * 230 - 56, -10, 112, 160, 50); c.fill();
    if (o.mic) { const mx = sd * 230 + sd * 86, my = 20; A.dot(mx, my, 10, C.cyan, 1, 18); } });
  c.restore(); }
// steady low hum source (fan) and a voice bubble
function fan(x, y, r, t, a = 1) { const c = lg; c.save(); c.globalAlpha *= a; c.translate(x, y); c.strokeStyle = 'rgba(200,205,255,.85)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.rotate(t * 9);
  for (let i = 0; i < 3; i++) { c.rotate(TAU / 3); c.fillStyle = '#4b4bf5'; c.beginPath(); c.ellipse(0, -r * .45, r * .2, r * .42, 0, 0, TAU); c.fill(); } c.restore(); }
function bubble(x, y, a = 1) { const c = lg; c.save(); c.globalAlpha *= a; A.use(c); A.glass(x - 110, y - 70, 220, 120, { r: 40 }); A.text('"hi!"', x, y + 12, { size: 52, wt: 700, align: 'center' }); c.restore(); }
function label(s0, x, y, k, o = {}) { A.text(s0, x, y, { f: 'mono', size: o.size || 30, wt: 700, track: 5, align: o.align || 'left', col: o.col || C.white, write: clamp(k * 1.5), a: clamp(k * 3) }); }

// ---------- scenes ----------
// A (p0): frame 0: a noise wave and its upside-down twin meet in the middle and flatten
function sceneA(t) { const out = R(t, s(1) - .25, .5);
  A.kinetic('Fight sound', 90, 420, t < .01 ? 1 : R(t, -1, 1), { size: 116, out });
  A.kinetic('with sound.', 90, 550, t < .01 ? 1 : R(t, -1, 1), { f: 'serif', wt: 400, size: 150, col: C.indL, track: 0, out });
  const m = 540, env = x => clamp(Math.abs(x - m) / 220);
  wave(80, 1000, 820, 120, 260, t, { col: C.white, glow: 18, env });
  wave(80, 1000, 820, 120, 260, t, { col: C.ind, glow: 24, inv: 1, env, a: .95 });
  A.line(m - 200, 820, m + 200, 820, { w: 6, col: C.cyan }); A.dot(m, 820, 10, '#fff', 1, 30);
  label('NOISE', 90, 680, 1); label('ANTI-NOISE', 880, 1000, 1, { col: C.indL, align: 'right' }); label('QUIET', m, 760, R(t, .6, .5), { align: 'center', col: C.cyan });
}
// B (p1): the question over a pair of headphones
function sceneB(t) { const t0 = s(1); A.kinetic('How do they', 90, 420, R(t, t0, .7), { size: 108 }); A.kinetic('work?', 90, 550, R(t, t0 + .3, .7), { f: 'serif', wt: 400, size: 150, col: C.indL, track: 0 });
  phones(540, 870, 1.1, { a: ex(R(t, t0 + .1, .7)) }); for (let i = 0; i < 6; i++) { const u = (t * .7 + i / 6) % 1; A.line(lerp(-40, 220, u), 860 + 40 * Math.sin(i * 2), lerp(40, 300, u), 860 + 40 * Math.sin(i * 2), { w: 3, col: 'rgba(240,240,255,.6)', a: 1 - u }); } }
// C (p2): sound = squeezes and stretches of air (dot columns bunching and spreading) with the pressure wave above
function sceneC(t) { const t0 = s(2), k = R(t, t0, .6);
  A.kinetic('a pressure wave', 90, 400, k, { size: 92 });
  wave(80, 1000, 600, 90, 300, t, { col: C.white, glow: 16, prog: ex(R(t, t0 + .2, 1)) });
  for (let i = 0; i < 46; i++) { const x0 = 80 + i * 20, d = 18 * Math.sin((x0 / 300) * TAU - t * 2 - Math.PI / 2), x = x0 + d; for (let j = 0; j < 9; j++) A.dot(x, 760 + j * 36, 4, C.indL, k * .9); }
  A.callout(160, 790, 220, 720 - 0, 'SQUEEZE', 'air packed tight', R(t, t0 + 1.4, .8), { dir: 1, shelf: 200 });
  A.callout(310, 1050, 380, 1100, 'STRETCH', 'air spread out', R(t, t0 + 2.4, .8), { dir: 1, shelf: 200 }); }
// D (p3): microphones on the earcups listen to the noise outside
function sceneD(t) { const t0 = s(3); phones(540, 760, 1.15, { mic: 1, a: 1 });
  wave(60, 250, 790, 50, 120, t, { col: C.white, glow: 12, prog: ex(R(t, t0, 1)) });
  for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1; lg.save(); lg.strokeStyle = 'rgba(88,230,212,' + (1 - u) + ')'; lg.lineWidth = 3; lg.beginPath(); lg.arc(540 - 1.15 * 316, 760 + 23, 14 + u * 60, 0, TAU); lg.stroke(); lg.restore(); }
  A.callout(540 - 1.15 * 316, 783, 230, 560, 'MICROPHONE', 'listens to the noise', R(t, t0 + .6, .9), { dir: 1, shelf: 300 });
  A.kinetic('mics listen.', 90, 420, R(t, t0, .7), { size: 104 }); }
// E (p4): the chip flips the wave (in: white, out: indigo)
function sceneE(t) { const t0 = s(4); A.kinetic('the chip', 90, 400, R(t, t0, .7), { size: 104 }); A.kinetic('flips it.', 90, 520, R(t, t0 + .3, .7), { f: 'serif', wt: 400, size: 130, col: C.indL, track: 0 });
  const cx = 540, cy = 860; A.iso(cx, cy - 60, 120, 120, { top: '#5a5aff', left: '#3c3cdc', right: '#26268f' }); A.text('DSP', cx, cy - 46, { f: 'mono', size: 30, wt: 700, align: 'center', track: 6 });
  wave(60, cx - 130, 860, 60, 140, t, { col: C.white, glow: 12, prog: ex(R(t, t0 + .2, .8)) });
  wave(cx + 130, 1020, 860, 60, 140, t, { col: C.ind, glow: 20, inv: 1, prog: ex(R(t, t0 + 1.2, .8)) });
  label('IN', 80, 980, R(t, t0 + .4, .5)); label('FLIPPED', 700, 980, R(t, t0 + 1.4, .5), { col: C.indL });
  A.callout(cx, cy - 130, cx + 40, cy - 250, 'INVERT', 'squeeze → stretch', R(t, t0 + 2.0, .9), { dir: 1, shelf: 270 }); }
// F (p5): the speaker plays the anti-noise along with your music
function sceneF(t) { const t0 = s(5); A.kinetic('anti-noise', 90, 430, R(t, t0, .7), { f: 'serif', wt: 400, size: 150, col: C.indL, track: 0 });
  phones(540, 820, 1.0, { a: 1 });
  wave(150, 930, 1060, 40, 150, t, { col: C.ind, glow: 20, inv: 1, prog: ex(R(t, t0 + .3, 1)) });
  for (let i = 0; i < 4; i++) { const u = (t * .5 + i / 4) % 1, x = 300 + i * 160, y = 620 - u * 120; A.text('♪', x, y, { size: 64, col: C.cyan, a: 1 - u }); }
  label('+ YOUR MUSIC', 540, 1120, R(t, t0 + 1.2, .6), { align: 'center', col: C.cyan }); }
// G (p6): white card: the two waves meet and cancel
function sceneG(t) { const t0 = s(6), mix = ex(R(t, t0 + .4, 1.6));
  A.kinetic('they cancel.', 90, 440, R(t, t0, .7), { size: 108, col: '#15172e' });
  wave(80, 1000, 700 - 150 * (1 - mix), 90, 280, t, { col: '#15172e', w: 6 });
  wave(80, 1000, 700 + 150 * (1 - mix), 90, 280, t, { col: C.ind, w: 6, inv: 1 });
  if (mix > .95) A.line(80, 700, 1000, 700, { w: 8, col: '#16b3a2' });
  A.text('much quieter', 540, 960, { f: 'serif', size: 110, col: C.ind, align: 'center', a: R(t, t0 + 2.4, .6) }); }
// H (p7): the catch: keep up, thousands of times a second
function sceneH(t) { const t0 = s(7), k = R(t, t0 + .2, .9), v = Math.round(1000 * ex(k));
  A.kinetic('keep up.', 90, 420, R(t, t0, .7), { size: 108 });
  if (k > 0) A.text(v.toLocaleString('en-US') + 's', 540, 860, { size: 300, wt: 800, align: 'center', track: -10, blur: (1 - ex(k)) * 14, a: clamp(k * 3) });
  A.text('OF TIMES A SECOND', 540, 960, { f: 'mono', size: 32, col: C.grey, track: 8, align: 'center', a: R(t, t0 + 1.2, .5) }); }
// I (p8-p9): slow, steady hums: long waves, the anti-wave lines up even with a small delay -> cancels
function terminal(x, y, rows, t, t0, o = {}) { A.glass(x, y, 820, 300, { title: '~/anc — zsh', pill: o.pill, a: 1 });
  rows.forEach(([txt, ok], i) => { const k = R(t, t0 + i * .7, .4); if (k <= 0) return; A.text(txt, x + 50, y + 170 + i * 64, { f: 'mono', size: 34, col: C.white, write: k });
    A.text(ok ? '✓ cancels' : '✗ too fast', x + 520, y + 170 + i * 64, { f: 'mono', size: 34, wt: 700, col: ok ? C.green : C.red, a: R(k, .6, .4) }); }); }
function sceneI(t) { const t0 = s(8), dl = 14;
  A.kinetic('slow, steady hums', 90, 400, R(t, t0, .7), { size: 84 });
  terminal(130, 470, [['engine drone', 1], ['air con hum', 1]], t, t0 + .8);
  const k9 = R(t, s(9) - .2, .6); wave(80, 1000, 960, 70, 420, t, { col: C.white, glow: 12, a: k9, speed: 1.2 }); wave(80 + dl, 1000, 960, 70, 420, t, { col: C.ind, glow: 16, inv: 1, a: k9, speed: 1.2 });
  label('LONG WAVES: A TINY DELAY BARELY MATTERS', 540, 1100, R(t, s(9) + .6, .6), { align: 'center', size: 26, col: C.cyan }); }
// J (p10): high, sudden sounds: short waves; the same delay leaves them out of step -> no cancel
function sceneJ(t) { const t0 = s(10), dl = 14;
  A.kinetic('high, sudden sounds', 90, 400, R(t, t0, .7), { size: 80 });
  terminal(130, 470, [['a voice', 0], ['a dog bark', 0]], t, t0 + 1.2);
  wave(80, 1000, 960, 60, 60, t, { col: C.white, glow: 10, speed: 8 }); wave(80 + dl, 1000, 960, 60, 60, t, { col: C.red, glow: 10, inv: 1, speed: 8, a: .8 });
  label('SHORT WAVES: TOO FAST TO COPY IN TIME', 540, 1100, R(t, t0 + 2.4, .6), { align: 'center', size: 26, col: C.red }); }
// K (p11): passive padding blocks the highs: iso cushion block with the short wave stopping at it
function sceneK(t) { const t0 = s(11);
  A.kinetic('padding', 90, 420, R(t, t0, .7), { size: 116 }); A.kinetic('does the rest.', 90, 540, R(t, t0 + .3, .7), { f: 'serif', wt: 400, size: 120, col: C.indL, track: 0 });
  A.iso(620, 760, 140, 260, { top: '#6b6bff', left: '#3c3cdc', right: '#26268f' });
  wave(60, 470, 900, 60, 60, t, { col: C.white, glow: 10, speed: 8 }); wave(780, 1000, 900, 10, 60, t, { col: C.white, a: .5, speed: 8 });
  A.callout(620, 700, 520, 640, 'EARCUP PADDING', 'blocks highs', R(t, t0 + .8, .9), { shelf: 330 }); }
// L (p12): 1936
function sceneL(t) { const t0 = s(12), k = R(t, t0 + .2, .9), v = Math.round(1900 + 36 * ex(k));
  if (k > 0) A.text(String(v), 540, 860, { size: 300, wt: 800, align: 'center', track: -10, blur: (1 - ex(k)) * 14, a: clamp(k * 3) });
  A.text('FIRST PATENT', 540, 960, { f: 'mono', size: 32, col: C.grey, track: 8, align: 'center', a: R(t, t0 + 1.2, .5) });
  A.kinetic('an old idea', 90, 420, R(t, t0, .7), { size: 108 }); }
// M (p13): try it near a fan: ANC on, the hum fades, the voice gets through
function sceneM(t) { const t0 = s(13), on = ss(R(t, t0 + 1.6, .6));
  A.kinetic('try it.', 90, 420, R(t, t0, .7), { size: 116 });
  fan(260, 740, 110, t); wave(380, 1000, 700, 50 * (1 - on * .9), 320, t, { col: C.white, glow: 10, speed: 1.5 });
  bubble(360, 960); wave(480, 1000, 960, 30, 50, t, { col: C.cyan, glow: 8, speed: 6 });
  const tx = 720, ty = 1080; lg.save(); lg.fillStyle = on > .5 ? C.ind : C.dim; lg.beginPath(); lg.roundRect(tx - 90, ty - 40, 180, 80, 40); lg.fill(); A.dot(lerp(tx - 50, tx + 50, on), ty, 30, '#fff'); lg.restore();
  label('NOISE CANCELLING', tx - 390, ty + 10, R(t, t0 + .8, .5), { size: 24 });
  label('hum fades', 600, 640, R(t, t0 + 2.4, .5), { col: C.white, size: 28 }); label('voices get through', 560, 900, R(t, t0 + 3.6, .5), { col: C.cyan, size: 28 }); }
// N (p14): payoff on indigo flash
function sceneN(t) { const t0 = s(14); A.kinetic("they don't just", 90, 640, R(t, t0, .7), { size: 104 }); A.kinetic('block noise.', 90, 760, R(t, t0 + .3, .7), { size: 104 });
  A.kinetic('they play its', 90, 900, R(t, t0 + 1.6, .7), { size: 104 }); A.kinetic('opposite.', 90, 1060, R(t, t0 + 2.0, .8), { f: 'serif', wt: 400, size: 150, col: '#fff', track: 0 }); }
// O (p15): question
function sceneO(t) { const t0 = s(15); A.kinetic('noise cancelling', 90, 420, R(t, t0, .7), { size: 92 }); A.kinetic('on flights?', 90, 540, R(t, t0 + .3, .7), { f: 'serif', wt: 400, size: 130, col: C.indL, track: 0 });
  [['YES', 300], ['NO', 700]].forEach(([w, x], i) => { const k = R(t, t0 + .9 + i * .2, .4); A.glass(x - 140, 700, 280, 160, { a: k, r: 40 }); A.text(w, x, 805, { size: 80, wt: 800, align: 'center', a: k }); }); }
// P (p16): lens flare + end card
function sceneP(t) { const t0 = s(16) - .3, c = lg, fl = R(t, t0, .9), cx = 540, cy = 640;
  if (fl < 1) { c.save(); c.globalAlpha = Math.sin(fl * Math.PI); const gr = c.createLinearGradient(0, cy, W, cy); gr.addColorStop(0, 'rgba(120,120,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(120,120,255,0)'); c.fillStyle = gr; c.fillRect(0, cy - 3, W, 6);
    c.strokeStyle = 'rgba(160,160,255,.8)'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, 80 + fl * 360, 0, TAU); c.stroke(); A.dot(cx, cy, 30 + 30 * Math.sin(fl * Math.PI), '#fff', 1, 60); c.restore(); }
  const mk = ex(R(t, t0 + .5, .6)); wave(cx - 160, cx + 160, cy, 40 * (1 - mk), 160, t, { col: C.ind, w: 10, glow: 20 }); A.line(cx - 160, cy, cx + 160, cy, { w: 10, col: C.cyan, a: mk });
  A.text('Follow for more of', cx, 820, { size: 62, wt: 500, align: 'center', col: '#c9cdf0', a: R(t, t0 + 1.0, .5) }); A.text('how it really works.', cx, 920, { size: 88, wt: 800, align: 'center', a: R(t, t0 + 1.2, .5), track: -2 });
  A.text("A new 'wait, really?' every day.", cx, 1000, { size: 42, wt: 500, align: 'center', col: '#c9cdf0', a: R(t, t0 + 1.4, .5) });
  A.text('@HOWITREALLYWORKSTUDIO', cx, 1070, { f: 'mono', size: 26, col: C.grey, align: 'center', track: 6, a: R(t, t0 + 1.6, .5) }); }

// ---------- caption + net-sound strip (Batch N band) ----------
function caption(ph, t, white) { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; const size = 46; c.font = A.font('sans', size, 600);
  const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
  const lines = [[]]; let lw = 0; const sp = c.measureText(' ').width; ws.forEach(w => { w.ww = c.measureText(w.w).width; if (lw + w.ww > 720 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
  const nx = ph.i < PH.length - 1 ? PH[ph.i + 1].start - .15 : 1e9, a = (ph.i === 0 ? 1 : clamp((t - ph.start + .2) / .25)) * clamp((nx - t) / .2), lh = size * 1.25, y0 = 1290 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, li) => { const w = ln.reduce((s0, x) => s0 + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { c.globalAlpha = a; c.fillStyle = wd.hl ? (white ? C.ind : C.indL) : (white ? '#15172e' : C.white); c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
  c.restore(); }
// residual sound level through the reel (what you'd hear): loud until the cancel, low for hums, high for the voice/bark section
function netLevel(t) { if (t < s(6) + .5) return t < 1.0 ? lerp(1, .15, ss(R(t, 0, 1))) : 1; if (t < s(10) - .2) return lerp(1, .15, ss(R(t, s(6) + .5, 1.5)));
  if (t < s(11)) return lerp(.15, .9, ss(R(t, s(10), .8))); if (t < s(13)) return lerp(.9, .5, ss(R(t, s(11), 1))); if (t < s(14)) return lerp(1, .3, ss(R(t, s(13) + 1.6, .6))); return .1; }
function strip(t, white) { const c = g, y = 1418, lv = netLevel(t); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none';
  c.strokeStyle = white ? 'rgba(30,30,60,.4)' : 'rgba(140,145,220,.45)'; c.lineWidth = 2; c.beginPath(); c.roundRect(170, y - 26, 740, 52, 26); c.stroke();
  c.font = A.font('mono', 20, 700); c.letterSpacing = '4px'; c.fillStyle = white ? '#15172e' : C.grey; c.fillText('NET SOUND', 196, y + 7);
  c.strokeStyle = C.cyan; c.lineWidth = 3; c.beginPath(); for (let x = 360; x <= 880; x += 3) { const yy = y + 17 * lv * Math.sin(x * .09 - t * 9) * (.6 + .4 * Math.sin(x * .021 + t * 2)); x === 360 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); c.restore(); }
// HUD: the demo's corner brackets; its corner labels moved below the top 250 px
function hud(t, label0, white) { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const col = white ? 'rgba(30,30,60,' : 'rgba(200,205,240,'; c.strokeStyle = col + '.55)'; c.lineWidth = 2.5;
  const m = 60, q = 46; [[m, 260, 1, 1], [W - m, 260, -1, 1], [m, H - 500, 1, -1], [W - m, H - 500, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * q); c.lineTo(x, y); c.lineTo(x + sx * q, y); c.stroke(); });
  c.font = A.font('mono', 22, 500); c.letterSpacing = '5px'; c.fillStyle = col + '.6)'; c.fillText(label0, m + 64, 286);
  const f = Math.floor(t * 30); c.textAlign = 'right'; c.fillText(`00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`, W - m - 64, 286); c.restore(); }

// ---------- compositor (the search reel's: blurred slide transitions, indigo/white flash cards) ----------
const SC = [[0, sceneA, 0, 'SC 01  NOISE'], [s(1) - .3, sceneB, 0, 'SC 02  ASK'], [s(2) - .3, sceneC, 0, 'SC 03  WAVE'], [s(3) - .3, sceneD, 0, 'SC 04  MIC'], [s(4) - .3, sceneE, 0, 'SC 05  CHIP'],
  [s(5) - .3, sceneF, 0, 'SC 06  SPEAKER'], [s(6) - .3, sceneG, 2, 'SC 07  CANCEL'], [s(7) - .3, sceneH, 0, 'SC 08  SPEED'], [s(8) - .3, sceneI, 0, 'SC 09  HUMS'], [s(10) - .3, sceneJ, 0, 'SC 10  SPIKES'],
  [s(11) - .3, sceneK, 0, 'SC 11  PADS'], [s(12) - .3, sceneL, 0, 'SC 12  1936'], [s(13) - .3, sceneM, 0, 'SC 13  TRY'], [s(14) - .3, sceneN, 1, 'SC 14  OPPOSITE'], [s(15) - .3, sceneO, 0, 'SC 15  YOU'], [s(16) - .3, sceneP, 0, 'SC 16  END']];
const TR = .4;
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
const gmode = (m, u) => ({ fl: m === 1 ? u : 0, wh: m === 2 ? u : 0 });
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), cur = SC[i][2], prev = i > 0 ? SC[i - 1][2] : cur;
  const a = gmode(prev, 1 - ss(u)), b = gmode(cur, ss(u)); const flashCut = i > 0 && u < 1 && cur !== prev ? Math.sin(u * Math.PI) * .9 : 0;
  A.ground(Math.max(a.fl + b.fl, cur === 2 || prev === 2 ? 0 : flashCut), a.wh + b.wh);
  if (i > 0 && u < 1) { A.clear(); SC[i - 1][1](t); A.blit({ a: 1 - ss(u), z: 1 + .08 * u, blur: 16 * u, dx: -120 * ex(u) }); }
  A.clear(); SC[i][1](t); A.blit({ a: i > 0 ? ss(u) : 1, z: i > 0 ? lerp(.96, 1, ex(u)) : 1, blur: i > 0 ? 14 * (1 - u) : 0, dx: i > 0 ? 120 * (1 - ex(u)) : 0 });
  const ph = PH.findLast(p => t >= p.start - .2) || PH[0], white = cur === 2 && u > .5;
  if (ph.i < PH.length - 1) caption(ph, t, white);
  strip(t, white); hud(t, SC[i][3], white);
}
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = (1 - f) * .4; g.fillStyle = C.bg0; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { A.ground(0, 0); A.clear();
  A.text('Fight sound', 80, 470, { size: 128, wt: 800, track: -3 }); A.text('with sound.', 80, 640, { f: 'serif', size: 176, col: C.indL });
  const m = 540, env = x => clamp(Math.abs(x - m) / 220), t = 1.3; wave(80, 1000, 960, 150, 300, t, { col: C.white, glow: 18, env, w: 9 }); wave(80, 1000, 960, 150, 300, t, { col: C.ind, glow: 24, inv: 1, env, w: 9 });
  A.line(m - 200, 960, m + 200, 960, { w: 9, col: C.cyan }); phones(540, 1330, .8, {}); A.blit({}); hud(4.2, 'SC 01  NOISE', 0); };
window.seek(0); window.ready = true; window.READY = true;
