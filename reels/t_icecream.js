// t_icecream.js: "Why do rival ice-cream carts end up side by side?" (Hotelling's law) in the story-fable look (template #30),
// on H1's own fable.js. Red cart vs teal cart; the "STEPS APART" counter sign opens and closes the reel (loop).
// Every cut, caption chunk and grade change is driven by the line timings in tl_icecream.js.
import { create, W, H, TAU, clamp, lerp, ss, eio, fr, hash, mix, rgba, shade, C } from './styles/storyfable/fable.js';
await Promise.all(['900 78px Nunito', '700 40px Cinzel'].map(f => document.fonts.load(f)));
const F = create(document.getElementById('c')), g = F.g;
const TL = window.TL, P = TL.p, T = i => P[i].start, E = i => P[i].end, r = (i, d) => T(i) + d, TOT = TL.total;

// ---------- captions: 1-2 words at a time, timed by word length inside each line ----------
const CHUNKS = []; P.forEach(p => { const words = p.cap.replace(/\*\*/g, '').split(/\s+/).filter(Boolean), groups = [];
  for (let i = 0; i < words.length;) { const w = words[i], two = i + 1 < words.length && (w.length + words[i + 1].length <= 9) && !/[.,?!:]$/.test(w); groups.push(two ? w + ' ' + words[i + 1] : w); i += two ? 2 : 1; }
  const wt = groups.map(s => s.length + 3), tot = wt.reduce((a, b) => a + b, 0), dur = p.end - p.start; let acc = 0;
  groups.forEach((s, k) => { CHUNKS.push({ s, a: p.start + acc / tot * dur, b: p.start + (acc + wt[k]) / tot * dur }); acc += wt[k]; }); });
function captions(t) { const c = CHUNKS.find(c => t >= c.a - .05 && t < c.b + .08); if (c) F.caption(c.s, 1340, 1); }

// ---------- camera keys ----------
function cam(t, keys) { let i = 0; while (i < keys.length - 1 && t > keys[i + 1][0]) i++; const [t0, a] = keys[i], [t1, b] = keys[Math.min(i + 1, keys.length - 1)], u = t1 > t0 ? eio((t - t0) / (t1 - t0)) : 0, o = {};
  for (const k in a) o[k] = lerp(a[k], b[k] ?? a[k], u); o.x += 4 * Math.sin(t * .7); o.y = (o.y ?? 150) + 3 * Math.sin(t * .9); F.setCam(o); }

// ---------- the beach set (camera faces the sea; the beach runs left-right) ----------
const SHORE = 2300, SEA_END = 60000;
const TOWELS = Array.from({ length: 26 }, (_, i) => ({ X: -2600 + (i % 13) * 420 + 120 * hash(i), Z: 1150 + Math.floor(i / 13) * 600 + 200 * hash(i * 3), col: ['#f2b54a', '#6fb6e8', '#f08ab0', '#9bd36a', '#ffffff'][i % 5], suit: ['#5b8fd6', '#e8a33a', '#7c5bd6', '#d65b5b'][i % 4], par: i % 3 === 0 }));
function beachSet(t, o = {}) { const k = o.grade || 0;
  F.sky(); const cl = [[120, 330, 170, 3], [620, 260, 230, 7], [980, 420, 150, 11], [380, 560, 120, 19]]; cl.forEach(([x, y, s, sd]) => F.cloud(x + 20 * Math.sin(t * .05 + sd) - (F.cam.x * .03), y + (F.cam.hor - 840) * .4, s, sd));
  // far headland + island on the horizon (hazed)
  const hor = F.cam.hor; g.save(); g.fillStyle = mix('#7fa070', C.haze, .55); g.beginPath(); g.moveTo(-50, hor + 2); g.quadraticCurveTo(120, hor - 60, 300, hor - 30); g.quadraticCurveTo(380, hor - 20, 430, hor + 2); g.closePath(); g.fill(); g.fillStyle = mix('#8fae86', C.haze, .7); g.beginPath(); g.ellipse(840, hor + 2, 110, 26, 0, Math.PI, TAU); g.fill(); g.restore();
  // sea plane: far pale, near deeper, foam line at the shore
  const [, ys] = F.proj(0, 0, SHORE); const gr = g.createLinearGradient(0, hor, 0, ys); gr.addColorStop(0, C.seaFar); gr.addColorStop(1, C.sea); g.fillStyle = gr; g.fillRect(0, hor, W, ys - hor + 1);
  g.strokeStyle = rgba('#ffffff', .55); for (let i = 0; i < 9; i++) { const Z = SHORE + 300 + i * i * 260, [, y, s] = F.proj(0, 0, Z); g.lineWidth = Math.max(1, s * 6); g.beginPath(); for (let x = -40; x <= W + 40; x += 30) g.lineTo(x, y + Math.sin(x * .02 + t * 1.2 + i) * s * 18); g.globalAlpha = .5 * (1 - i / 9); g.stroke(); } g.globalAlpha = 1;
  // sand
  g.save(); g.beginPath(); g.rect(0, ys, W, H - ys); g.clip(); F.ground({ far: '#e3cf9f', mid: C.sand, near: C.sandNear }); g.restore();
  // wet sand + foam
  const [, yw] = F.proj(0, 0, SHORE - 260); g.fillStyle = rgba('#b39a6a', .55); g.fillRect(0, ys, W, Math.max(2, yw - ys)); g.strokeStyle = C.foam; g.lineWidth = Math.max(2, (yw - ys) * .35); g.beginPath(); for (let x = -40; x <= W + 40; x += 24) g.lineTo(x, ys + 2 + Math.sin(x * .015 + t * 1.5) * 4); g.stroke();
  F.texture(-4000, 4000, F.cam.z + 80, SHORE - 300, 7, { n: 1300 });
  F.horizonHaze(70, .7);
  // sunbathers, parasols, grass in the foreground
  TOWELS.forEach((w, i) => { if (o.noTowels) return; F.put(w.X, w.Z, (c) => F.towel(c, { col: w.col, person: true, suit: w.suit }), { w: 70, h: 40, foot: 50 }); if (w.par) F.put(w.X + 70, w.Z + 30, c => F.parasol(c, { col: w.col }), { w: 80, h: 160, foot: 10 }); });
  if (o.fg !== false) { const fx = F.cam.x, fz = F.cam.z; F.put(fx + 72, fz + 230, c => F.bucket(c, { col: '#f2c230' }), { w: 50, h: 70, foot: 26 }); F.put(fx - 80, fz + 200, c => F.grassTuft(c, { seed: 2, col: '#9db45a' }), { w: 50, h: 50, shadow: false, rim: false });
    [[-30, 330], [120, 380], [-150, 420]].forEach(([dx, dz], i) => F.put(fx + dx, fz + dz, c => F.shell(c, { col: ['#f3c9b8', '#f7e3c4', '#e8b59e'][i] }), { w: 14, h: 20, foot: 10, shadow: false }));
    F.put(fx + 20, fz + 260, c => F.footprints(c), { w: 30, h: 160, rim: false, shadow: false }); }
}
function vendorRed(t, X, Z, o = {}) { F.put(X, Z, c => F.figure(c, { t, body: C.red, bodyD: C.redD, apron: '#fff6e2', hat: 'paper', hatCol: C.red, stache: true, expr: o.expr || 'smug', look: o.look ?? .6, turn: o.turn ?? .3, arms: o.arms || { F: [30, -72], B: [-32, -66] }, walk: o.walk ?? -1, hold: o.hold, talk: o.talk, sweat: o.sweat, seed: 1, blink: blink(t, 1) }), { w: 70, h: 210, foot: 26 }); }
function vendorTeal(t, X, Z, o = {}) { F.put(X, Z, c => F.figure(c, { t, body: C.teal, bodyD: C.tealD, apron: '#fff6e2', hat: 'visor', hatCol: C.teal, goatee: true, expr: o.expr || 'sly', look: o.look ?? -.6, turn: o.turn ?? -.3, arms: o.arms || { F: [-30, -72], B: [32, -66] }, walk: o.walk ?? -1, hold: o.hold, talk: o.talk, seed: 4, blink: blink(t, 5) }), { w: 70, h: 210, foot: 26 }); }
const blink = (t, s) => (fr(t * .23 + s * .37) < .03) ? 1 : 0;
function cart(X, Z, col, o = {}) { F.put(X, Z, c => F.cart(c, { col, roll: o.roll || 0, side: o.side || 1, scoop: o.scoop }), { w: 120, h: 290, foot: 70 }); }
function priceTag(X, Z, col) { F.put(X, Z, c => { F.stick(c, [[0, 0], [0, -120]], 3); c.beginPath(); c.roundRect(-34, -150, 68, 40, 6); F.fs(c, '#fbf6ea', 2); c.fillStyle = col; c.fillRect(-30, -146, 60, 8); c.fillStyle = C.ink; c.font = '700 22px Cinzel'; c.textAlign = 'center'; c.fillText('$3', 0, -118); }, { w: 40, h: 160, foot: 8, sharp: true }); }

// ---------- the aerial map (top-down beach strip, portrait) ----------
// u = position along the beach 0..1 (top to bottom on screen)
const AU = Array.from({ length: 34 }, (_, i) => ({ u: (i + .5) / 34, x: 430 + 230 * hash(i * 2.3), col: ['#f2b54a', '#6fb6e8', '#f08ab0', '#9bd36a', '#ffffff'][i % 5] }));
function aerial(t, o) { const rx = o.rot || 0, zm = o.zoom || 1, by = 260, ey = 1500; g.save(); g.translate(540, 900); g.rotate(rx); g.scale(zm, zm); g.translate(-540, -900);
  // sea (left), sand strip, dune grass (right)
  g.fillStyle = '#3da7bd'; g.fillRect(-400, -300, 700, 2600); const sgr = g.createLinearGradient(240, 0, 340, 0); sgr.addColorStop(0, '#62c3cf'); sgr.addColorStop(1, '#d9c79a'); g.fillStyle = sgr; g.fillRect(240, -300, 100, 2600);
  g.fillStyle = '#d6bb84'; g.fillRect(320, -300, 520, 2600); g.fillStyle = '#88a84e'; g.fillRect(840, -300, 700, 2600);
  g.strokeStyle = rgba('#ffffff', .7); g.lineWidth = 6; for (let j = 0; j < 3; j++) { g.beginPath(); for (let y = -300; y < 2300; y += 30) g.lineTo(300 - j * 40 + 10 * Math.sin(y * .01 + t * 1.6 + j), y); g.stroke(); }
  for (let i = 0; i < 260; i++) { g.fillStyle = rgba('#8a6a3a', .22); g.beginPath(); g.ellipse(330 + hash(i) * 500, -300 + hash(i * 3) * 2600, 4, 2, 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 40; i++) { const x = 860 + hash(i * 5) * 200, y = -300 + hash(i * 7) * 2600; g.fillStyle = shade('#88a84e', .8); g.beginPath(); g.arc(x, y, 12 + 10 * hash(i), 0, TAU); g.fill(); }
  // the beach scale: a dashed ruler on the sand edge
  const yAt = u => lerp(by, ey, u);
  // zones and towels
  const R = o.red ?? .25, Tq = o.teal ?? .75, mid = (R + Tq) / 2, zk = o.zones || 0;
  if (zk > 0) { g.globalAlpha = .28 * zk; g.fillStyle = C.red; g.fillRect(320, yAt(0) - 20, 520, yAt(mid) - yAt(0) + 20); g.fillStyle = C.teal; g.fillRect(320, yAt(mid), 520, yAt(1) - yAt(mid) + 20); g.globalAlpha = 1;
    g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.setLineDash([18, 12]); g.beginPath(); g.moveTo(320, yAt(mid)); g.lineTo(840, yAt(mid)); g.stroke(); g.setLineDash([]); }
  AU.forEach((w, i) => { const y = yAt(w.u), side = w.u < mid ? C.red : C.teal, tc = zk > 0 ? mix(w.col, side, .75 * zk) : w.col; g.save(); g.translate(w.x, y); g.rotate(.15 * (hash(i) - .5));
    g.fillStyle = 'rgba(60,40,20,.25)'; g.fillRect(-26, -12, 60, 34); g.fillStyle = tc; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.roundRect(-30, -16, 60, 32, 4); g.fill(); g.stroke(); g.fillStyle = C.head; g.beginPath(); g.arc(-14, 0, 9, 0, TAU); g.fill(); g.stroke(); g.restore();
    if (o.walk && zk > 0) { const cy = w.u < mid ? yAt(R) : yAt(Tq), k = fr(t * .5 + hash(i)), d = Math.abs(cy - y); g.strokeStyle = rgba('#ffffff', .8); g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(w.x, y); g.lineTo(lerp(w.x, 600, .5), lerp(y, cy, 1)); g.stroke(); g.setLineDash([]); if (d > (o.far || 1e9)) { g.fillStyle = '#fff'; g.font = '900 30px Nunito'; } } });
  // carts from above: striped umbrella discs
  const cartTop = (u, col, k, label) => { if (k <= 0) return; const y = yAt(u), x = 600, s = lerp(2.2, 1, eio(k)); g.save(); g.globalAlpha = clamp(k * 3); g.translate(x, y); g.scale(s, s);
    g.fillStyle = 'rgba(40,30,20,.3)'; g.beginPath(); g.arc(14, 16, 62, 0, TAU); g.fill(); for (let j = 0; j < 8; j++) { g.fillStyle = j % 2 ? '#ffffff' : col; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 60, j * TAU / 8 + t * .2, (j + 1) * TAU / 8 + t * .2); g.closePath(); g.fill(); } g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 60, 0, TAU); g.stroke(); g.fillStyle = C.ink; g.beginPath(); g.arc(0, 0, 6, 0, TAU); g.fill();
    if (label) { g.fillStyle = '#fbf6ea'; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.roundRect(78, -30, 96, 60, 10); g.fill(); g.stroke(); g.fillStyle = C.ink; g.font = '900 40px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 126, 2); }
    g.restore(); };
  cartTop(R, C.red, o.redK ?? 1, o.redL); cartTop(Tq, C.teal, o.tealK ?? 1, o.tealL);
  if (o.sign) { g.save(); g.translate(400, 300); g.fillStyle = '#fbf6ea'; g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.roundRect(-10, -50, 330, 90, 14); g.fill(); g.stroke(); g.fillStyle = C.ink; g.font = '900 48px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.sign, 155, -4); g.restore(); }
  g.restore();
  // drone haze + slight vignette in the corners
  const hz = g.createLinearGradient(0, 0, 0, 500); hz.addColorStop(0, rgba(C.haze, .55)); hz.addColorStop(1, rgba(C.haze, 0)); g.fillStyle = hz; g.fillRect(0, 0, W, 500); }

// ---------- other sets ----------
function journal(t) { // an old journal page lying on a towel: Hotelling, "Stability in Competition", 1929
  g.fillStyle = '#e8b04a'; g.fillRect(0, 0, W, H); g.fillStyle = rgba('#ffffff', .6); for (let i = 0; i < 6; i++) g.fillRect(i * 200 - 40, 0, 50, H);
  g.save(); g.translate(540, 820); g.rotate(-.06 + .01 * Math.sin(t)); const s = 1 + .04 * (t - T(1)); g.scale(s, s);
  g.fillStyle = 'rgba(60,40,20,.3)'; g.fillRect(-360, -460, 740, 960); g.fillStyle = '#f6eed8'; g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.rect(-380, -480, 740, 960); g.fill(); g.stroke();
  g.fillStyle = C.ink; g.textAlign = 'center'; g.font = '700 34px Cinzel'; g.fillText('THE ECONOMIC JOURNAL', -10, -400); g.font = '700 64px Cinzel'; g.fillText('STABILITY IN', -10, -270); g.fillText('COMPETITION', -10, -190); g.font = '700 36px Cinzel'; g.fillText('HAROLD HOTELLING', -10, -110);
  g.strokeStyle = rgba(C.ink, .35); g.lineWidth = 4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-320, -40 + i * 44); g.lineTo(300 - (i % 3) * 60, -40 + i * 44); g.stroke(); }
  const k = ss(r(1, 3.3), r(1, 3.7), t); if (k > 0) { g.save(); g.translate(150, 300); g.rotate(-.2); g.scale(lerp(2, 1, k), lerp(2, 1, k)); g.globalAlpha = clamp(k * 2); g.strokeStyle = C.red; g.fillStyle = C.red; g.lineWidth = 8; g.beginPath(); g.roundRect(-140, -60, 280, 120, 14); g.stroke(); g.font = '900 86px Nunito'; g.textBaseline = 'middle'; g.fillText('1929', 0, 6); g.restore(); }
  g.restore(); }
function blueprint(t) { const t0 = T(11), k = t - t0; g.fillStyle = '#1f4f9a'; g.fillRect(0, 0, W, H); g.strokeStyle = rgba('#ffffff', .12); g.lineWidth = 2; for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.save(); const s = 1 + .02 * k; g.translate(540, 900); g.scale(s, s); g.translate(-540, -900); g.strokeStyle = '#eaf2ff'; g.fillStyle = '#eaf2ff'; g.textAlign = 'center'; g.font = '700 70px Cinzel'; const tw = ss(.2, 1.4, k); g.save(); g.beginPath(); g.rect(0, 300, W * tw, 200); g.clip(); g.fillText("HOTELLING'S", 540, 400); g.fillText('LAW', 540, 480); g.restore();
  // the beach line with two markers that slide to the middle
  const lk = ss(1.0, 2.2, k); g.lineWidth = 6; g.beginPath(); g.moveTo(140, 700); g.lineTo(140 + 800 * lk, 700); g.stroke(); for (let i = 0; i <= 4; i++) if (i / 4 <= lk) { g.beginPath(); g.moveTo(140 + i * 200, 685); g.lineTo(140 + i * 200, 715); g.stroke(); }
  const mv = ss(2.2, 4.0, k), xr = lerp(340, 520, mv), xt = lerp(740, 560, mv); [[xr, C.red], [xt, C.teal]].forEach(([x, col]) => { if (lk < 1) return; g.fillStyle = col; g.strokeStyle = '#eaf2ff'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 690); g.lineTo(x - 24, 640); g.lineTo(x + 24, 640); g.closePath(); g.fill(); g.stroke(); });
  g.fillStyle = '#eaf2ff'; g.font = '700 34px Cinzel'; if (lk >= 1) { g.fillText('BEACH', 540, 790); }
  // shops and podiums pop in
  const pop = (x, y, k2, fn) => { if (k2 <= 0) return; g.save(); g.translate(x, y); const e = 1 + .25 * Math.sin(clamp(k2) * Math.PI); g.scale(clamp(k2 * 3) * e, clamp(k2 * 3) * e); fn(); g.restore(); };
  const shop = col => { g.fillStyle = 'rgba(234,242,255,.15)'; g.strokeStyle = '#eaf2ff'; g.lineWidth = 5; g.beginPath(); g.rect(-70, -90, 140, 120); g.fill(); g.stroke(); g.fillStyle = col; g.beginPath(); g.moveTo(-84, -90); g.lineTo(84, -90); g.lineTo(70, -130); g.lineTo(-70, -130); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.rect(-20, -40, 40, 70); g.stroke(); };
  const pod = col => { g.fillStyle = col; g.strokeStyle = '#eaf2ff'; g.lineWidth = 5; g.beginPath(); g.moveTo(-50, 30); g.lineTo(50, 30); g.lineTo(40, -70); g.lineTo(-40, -70); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, -110, 26, 0, TAU); g.fillStyle = '#eaf2ff'; g.fill(); };
  const ks = k - 4.2, kp = k - 5.6; pop(450, 1000, ks / .6, () => shop(C.red)); pop(630, 1000, (ks - .2) / .6, () => shop(C.teal)); pop(450, 1170, kp / .6, () => pod(C.red)); pop(630, 1170, (kp - .2) / .6, () => pod(C.teal));
  g.restore();
  // glowing pen tip drawing the line
  if (lk > 0 && lk < 1) { const x = 140 + 800 * lk, gr = g.createRadialGradient(x, 700, 0, x, 700, 60); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(160,200,255,0)'); g.fillStyle = gr; g.fillRect(x - 60, 640, 120, 120); } }

// ---------- scenes ----------
const SCN = [];
const add = (a, b, fn) => SCN.push({ a, b, fn });
// cart positions on the ground set (X), by story time
const CX0 = 280;   // a quarter / three quarters of the way along, as seen from the camera
function cartsAt(t) { // creep: the two carts move in alternating steps toward 0
  if (t < T(5)) return [-CX0, CX0];
  if (t < T(7)) return [-CX0, lerp(CX0, 190, ss(T(5) + .5, T(6), t))];
  if (t < T(8)) return [lerp(-CX0, -170, ss(T(7), r(7, 1.2), t)), lerp(190, 120, ss(r(7, 1.2), E(7), t))];
  const u = ss(T(8), r(8, 3.6), t); return [lerp(-170, -75, u), lerp(120, 75, u)]; }
// 0: the counter sign (open/close prop) then pull back to the carts side by side in the middle
add(0, T(1), t => { cam(t, [[0, { x: -60, z: 330, hor: 860, focus: 740, dof: 4 }], [1.4, { x: -40, z: 300, hor: 860, focus: 740, dof: 4 }], [3.0, { x: 0, z: 340, hor: 840, focus: 900, dof: 2.4 }], [4.4, { x: 40, z: 370, hor: 840, focus: 900, dof: 2.4 }]]);
  beachSet(t); cart(-75, 900, C.red); cart(75, 900, C.teal, { side: -1 }); vendorRed(t, -215, 900, { expr: 'glare', look: 1, turn: .4 }); vendorTeal(t, 215, 900, { expr: 'glare', look: -1, turn: -.4 });
  F.put(-120, 740, c => F.counterSign(c, { value: 0, title: 'STEPS APART' }), { w: 110, h: 270, foot: 60, sharp: true }); F.flush(); });
// 1: medium two-shot: they glare; then the 1929 paper
add(T(1), r(1, 2.6), t => { cam(t, [[T(1), { x: -120, z: 430, hor: 900, focus: 900, dof: 7 }], [r(1, 1.2), { x: -220, z: 450, hor: 900, focus: 900, dof: 7 }], [r(1, 2.6), { x: 200, z: 450, hor: 900, focus: 900, dof: 7 }]]);
  beachSet(t); cart(-75, 900, C.red); cart(75, 900, C.teal, { side: -1 }); vendorRed(t, -215, 900, { expr: 'glare', look: 1, turn: .5, arms: { F: [34, -96], B: [-30, -66] } }); vendorTeal(t, 215, 900, { expr: 'smug', look: -1, turn: -.5 }); F.flush(); });
add(r(1, 2.6), T(2), t => journal(t));
// 2-3b: aerial, towels spread evenly, then the carts drop in at a quarter and three quarters
add(T(2), T(3), t => aerial(t, { rot: .03 * Math.sin(t * .3), zoom: lerp(1.05, 1.12, ss(T(2), T(3), t)), redK: 0, tealK: 0 }));
add(T(3), r(3, 2.5), t => { cam(t, [[T(3), { x: 0, z: 320, hor: 820, focus: 900, dof: 1.8 }], [r(3, 2.5), { x: 0, z: 380, hor: 820, focus: 900, dof: 1.8 }]]);
  beachSet(t); const [xr, xt] = cartsAt(t); cart(xr, 900, C.red); cart(xt, 900, C.teal, { side: -1 }); vendorRed(t, xr + (xr < -150 ? 120 : -140), 940); vendorTeal(t, xt + (xt > 150 ? -120 : 140), 940); priceTag(xr + 90, 760, C.red); priceTag(xt - 90, 760, C.teal); F.flush(); });
add(r(3, 2.5), T(4), t => aerial(t, { zoom: 1.12, redK: ss(r(3, 2.9), r(3, 3.5), t), tealK: ss(r(3, 4.6), r(3, 5.2), t), redL: '¼', tealL: '¾' }));
// 4: everyone walks to the nearest cart: half and half
add(T(4), T(5), t => aerial(t, { zoom: lerp(1.12, 1.0, ss(T(4), T(5), t)), zones: ss(T(4), r(4, 1.2), t), walk: true, sign: t > r(4, 2.4) ? 'HALF | HALF' : null }));
// 5: Teal rolls toward the middle (ground dolly, morning)
add(T(5), T(6), t => { const [xr, xt] = cartsAt(t); cam(t, [[T(5), { x: xt + 200, z: 520, hor: 880, focus: 900, dof: 6 }], [T(6), { x: xt - 100, z: 540, hor: 880, focus: 900, dof: 6 }]]);
  beachSet(t); const mv = ss(T(5) + .5, T(6), t) > 0 && ss(T(5) + .5, T(6), t) < 1; cart(xt, 900, C.teal, { side: -1, roll: -xt / 17 }); vendorTeal(t, xt + 125, 900, { walk: mv ? t * 1.6 : -1, arms: { F: [-36, -96], B: [-30, -94] }, expr: 'sly', turn: -.5 }); F.flush(); F.grade(.25 * (1 - ss(T(5), T(6), t))); });
// 6: aerial: the boundary slides; then Red, worried
add(T(6), r(6, 2.6), t => { const tq = lerp(.75, .6, ss(T(6), r(6, 1.4), t)); aerial(t, { zoom: 1.04, zones: 1, red: .25, teal: tq, walk: false }); });
add(r(6, 2.6), T(7), t => { const [xr] = cartsAt(t); cam(t, [[r(6, 2.6), { x: xr - 120, z: 470, hor: 900, focus: 900, dof: 7.5 }], [T(7), { x: xr - 160, z: 470, hor: 900, focus: 900, dof: 7.5 }]]); beachSet(t); cart(xr, 900, C.red); vendorRed(t, xr - 140, 900, { expr: 'worried', look: 1, turn: .4, sweat: true }); F.flush(); });
// 7: Red does the same, then Teal again (two short push shots with a whip between)
add(T(7), r(7, 1.2), t => { const [xr] = cartsAt(t); cam(t, [[T(7), { x: xr + 120, z: 540, hor: 880, focus: 900, dof: 6 }], [r(7, 1.2), { x: xr + 220, z: 540, hor: 880, focus: 900, dof: 6 }]]); beachSet(t); cart(xr, 900, C.red, { roll: xr / 17 }); vendorRed(t, xr - 125, 900, { walk: t * 1.6, arms: { F: [36, -96], B: [30, -94] }, expr: 'glare', turn: .5 }); F.flush(); });
add(r(7, 1.2), T(8), t => { const [, xt] = cartsAt(t); cam(t, [[r(7, 1.2), { x: xt - 100, z: 540, hor: 880, focus: 900, dof: 6 }], [T(8), { x: xt - 220, z: 540, hor: 880, focus: 900, dof: 6 }]]); beachSet(t); cart(xt, 900, C.teal, { side: -1, roll: -xt / 17 }); vendorTeal(t, xt + 125, 900, { walk: t * 1.6, arms: { F: [-36, -96], B: [-30, -94] }, expr: 'glare', turn: -.5 }); F.flush(); });
// 8: time-lapse: day -> night -> day while they creep together; the sign counts down in the foreground
add(T(8), T(9), t => { cam(t, [[T(8), { x: 0, z: 320, hor: 820, focus: 900, dof: 1.8 }], [T(9), { x: 0, z: 400, hor: 820, focus: 900, dof: 1.8 }]]);
  const u = ss(T(8), r(8, 3.6), t), gk = Math.sin(u * Math.PI) * .95; const [xr, xt] = cartsAt(t); beachSet(t); cart(xr, 900, C.red); cart(xt, 900, C.teal, { side: -1 }); vendorRed(t, xr + (xr < -150 ? 120 : -140), 940); vendorTeal(t, xt + (xt > 150 ? -120 : 140), 940);
  const val = Math.round(lerp(26, 0, u)), pv = Math.round(lerp(26, 0, Math.max(0, u - .04))); F.put(-260, 600, c => F.counterSign(c, { value: val, prev: pv, flip: fr(u * 26), title: 'STEPS APART' }), { w: 110, h: 270, foot: 60, sharp: true });
  F.flush(); F.grade(gk); });
// 9: side by side in the middle; then a sunbather at the far end walks a long way
add(T(9), r(9, 2.2), t => { cam(t, [[T(9), { x: 0, z: 430, hor: 900, focus: 900, dof: 7 }], [r(9, 2.2), { x: 0, z: 470, hor: 900, focus: 900, dof: 7 }]]); beachSet(t); cart(-75, 900, C.red); cart(75, 900, C.teal, { side: -1 }); vendorRed(t, -215, 900, { expr: 'smug', look: 1 }); vendorTeal(t, 215, 900, { expr: 'smug', look: -1 }); F.flush(); });
add(r(9, 2.2), T(10), t => { const u = ss(r(9, 2.2), T(10), t), X = lerp(-3200, -2300, u); cam(t, [[r(9, 2.2), { x: -3000, z: 540, hor: 880, focus: 900, dof: 6 }], [T(10), { x: -2250, z: 540, hor: 880, focus: 900, dof: 6 }]]); beachSet(t);
  F.put(X, 900, c => F.figure(c, { t, body: '#f2b54a', bodyD: '#c98e2e', expr: 'worried', walk: t * 1.8, turn: .6, look: 1, sweat: true, arms: { F: [34, -80], B: [-30, -60] }, seed: 9 }), { w: 70, h: 210, foot: 26 });
  F.put(-2000, 760, c => { F.stick(c, [[0, 0], [0, -130]], 4); c.beginPath(); c.moveTo(-60, -170); c.lineTo(60, -170); c.lineTo(80, -145); c.lineTo(60, -120); c.lineTo(-60, -120); c.closePath(); F.fs(c, C.wood, 2); c.fillStyle = '#fff'; c.font = '900 26px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('2× FARTHER', 0, -145); }, { w: 90, h: 180, foot: 10, sharp: true }); F.flush(); });
// 10: neither can leave: each edges away and slides back
add(T(10), T(11), t => { cam(t, [[T(10), { x: 0, z: 300, hor: 900, focus: 900, dof: 7 }], [T(11), { x: 0, z: 470, hor: 900, focus: 900, dof: 7 }]]); beachSet(t); const k1 = Math.sin(clamp((t - r(10, .4)) / 1.2) * Math.PI) * 40, k2 = Math.sin(clamp((t - r(10, 1.8)) / 1.2) * Math.PI) * 40;
  cart(-75 - k1, 900, C.red); cart(75 + k2, 900, C.teal, { side: -1 }); vendorRed(t, -215 - k1, 900, { expr: k1 > 10 ? 'worried' : 'glare', look: 1 }); vendorTeal(t, 215 + k2, 900, { expr: k2 > 10 ? 'worried' : 'glare', look: -1 }); F.flush(); });
// 11: the blueprint states the law; shops and politicians pop in
add(T(11), T(12), t => blueprint(t));
// 12: the question: both offer a cone; YES / NO flags on the carts
add(T(12), T(13), t => { cam(t, [[T(12), { x: 0, z: 470, hor: 900, focus: 900, dof: 7 }], [T(13), { x: 0, z: 470, hor: 900, focus: 900, dof: 7 }]]); beachSet(t); cart(-150, 900, C.red); cart(150, 900, C.teal, { side: -1 });
  vendorRed(t, -300, 900, { expr: 'happy', look: 0, turn: 0, hold: 'cone', arms: { F: [34, -100], B: [-30, -66] } }); vendorTeal(t, 215, 900, { expr: 'happy', look: 0, turn: 0, hold: 'cone', arms: { F: [-34, -100], B: [30, -66] } });
  [[-75, C.red, 'YES'], [75, C.teal, 'NO']].forEach(([X, col, s], i) => F.put(X, 860, c => { F.stick(c, [[0, -260], [0, -330]], 3); c.beginPath(); c.moveTo(0, -330); c.lineTo(70 * (i ? -1 : 1), -312); c.lineTo(0, -294); c.closePath(); F.fs(c, col, 2); c.fillStyle = '#fff'; c.font = '900 16px Nunito'; c.textAlign = 'center'; c.fillText(s, 26 * (i ? -1 : 1), -307); }, { w: 80, h: 340, sharp: true, shadow: false })); F.flush(); });
// 13: back to the sign (loop)
add(T(13), TOT + 1, t => { cam(t, [[T(13), { x: 0, z: 340, hor: 840, focus: 900, dof: 2.4 }], [r(13, 1.6), { x: -40, z: 300, hor: 860, focus: 740, dof: 4 }], [TOT, { x: -60, z: 330, hor: 860, focus: 740, dof: 4 }]]);
  beachSet(t); cart(-75, 900, C.red); cart(75, 900, C.teal, { side: -1 }); vendorRed(t, -215, 900, { expr: 'glare', look: 1, turn: .4 }); vendorTeal(t, 215, 900, { expr: 'glare', look: -1, turn: -.4 });
  F.put(-120, 740, c => F.counterSign(c, { value: 0, title: 'STEPS APART' }), { w: 110, h: 270, foot: 60, sharp: true }); F.flush(); });

// whip pans at these cuts
const WHIPS = [T(1), r(3, 2.5), r(7, 1.2), T(9), T(12)];
function frame(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const S = SCN.find(s => t >= s.a && t < s.b) || SCN[SCN.length - 1]; let slide = 0; for (const w of WHIPS) { const d = t - w; if (Math.abs(d) < .16) slide = (d < 0 ? -1 : 1) * (1 - Math.abs(d) / .16); }
  g.save(); if (slide) g.translate(-slide * 160, 0); S.fn(t); g.restore(); if (slide) F.smear(Math.abs(slide) * 90);
  F.post(t); captions(t); }
window.DUR = TOT;
window.seek = t => frame(t);
window.render = window.seek;
window.thumb = () => { frame(2.2); };
window.seek(0); window.ready = true; window.READY = true;
