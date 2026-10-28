// t_sleeptalk.js: "Why do we talk in our sleep?" in template #1 paper-lantern (Paper-cut Lightbox), the gps/cricketchirp kit and grammar.
// Every shot is one lit shadow box: baked cut-paper layers (back light -> front dark, backlight + pulp mottle, cast shadows), emissive light
// (here: the moon, the bedside lamp and glowing speech bubbles), paper strips that grow from an edge with red seals, Caveat tags, the
// vertical title strip, dissolves between shots, YES/NO and end-card tags lying on the table under the lamp.
// Batch N layout (as gps): the lamp window is y 270-1130; in-box strips from box y 130 (screen y >= 360); captions on the dark room at
// y 1180-1400; below that only the table and the spill light; nothing written in the right column below y 840.
import { createLantern, W, H, BOX, PAL, clamp, lerp, seg, ss, eo, backOut, hash, glow, rr, subtitle, tag, makeSheet, putSheet,
  layer, put, lampFrame, vignette, strip, vstrip, sealMark, bloom, flick } from './styles/lantern/lantern.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"'), document.fonts.load('700 40px Caveat')]);
BOX.y = 270; BOX.h = 860;
const g = createLantern(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, r = (i, d) => T(i) + d, TOT = TL.total;
const BW = BOX.w, BH = BOX.h, TAU = Math.PI * 2;
const win = (t, a, b, f = .45) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const WARM = '255,190,110', MOON = '200,215,255', BUB = '255,236,190';
const cam0 = { x: 0, y: 0 };

// ---------- baked paper layers (box-local) ----------
const NIGHT = { light: [700, 200], lightCol: '170,190,255' };
const L = {
  room: layer(g2 => { g2.fillRect(-100, -100, 1200, 1100); g2.globalCompositeOperation = 'destination-out'; g2.fillRect(560, 90, 300, 360); }, { col: '#2a2244', trans: .35, light: [700, 260], lightCol: MOON }),      // wall with a window hole
  sill: layer(g2 => { g2.fillRect(540, 440, 340, 26); g2.fillRect(700, 90, 12, 360); g2.fillRect(560, 260, 300, 10); }, { col: '#1a1530', trans: .2, ...NIGHT }),
  bed: layer(g2 => { g2.fillRect(60, 600, 760, 70); g2.fillRect(60, 520, 34, 300); g2.fillRect(786, 560, 34, 260); g2.beginPath(); g2.moveTo(90, 610); g2.bezierCurveTo(260, 470, 520, 520, 790, 600); g2.lineTo(790, 640); g2.lineTo(90, 640); g2.fill();
    g2.beginPath(); g2.ellipse(190, 540, 110, 40, -.1, 0, TAU); g2.fill(); }, { col: '#3a2f5c', trans: .4, light: [300, 400], lightCol: WARM }),
  front: layer(g2 => { g2.beginPath(); g2.ellipse(-40, BH + 20, 260, 170, 0, 0, TAU); g2.ellipse(BW + 40, BH + 30, 280, 180, 0, 0, TAU); g2.fill(); }, { col: '#0a0818', trans: 0, blur: 3 }),
  hills: layer(g2 => { g2.beginPath(); g2.moveTo(-100, BH + 100); for (let x = -100; x <= 1100; x += 20) g2.lineTo(x, 620 - 40 * Math.sin(x / 1000 * Math.PI * 2.2 + 1)); g2.lineTo(1100, BH + 100); g2.fill(); }, { col: '#26326b', trans: .5, ...NIGHT }),
};
const HEAD = makeSheet(200, 200, c => { c.fillStyle = '#000'; c.beginPath(); c.arc(100, 100, 70, 0, TAU); c.fill(); c.beginPath(); c.ellipse(100, 60, 80, 50, 0, Math.PI, 0); c.fill(); }, { col: '#f0c8a0' });
const PERSON = makeSheet(180, 420, c => { c.fillStyle = '#000'; c.beginPath(); c.arc(90, 60, 50, 0, TAU); c.fill(); c.beginPath(); c.moveTo(30, 420); c.lineTo(40, 140); c.quadraticCurveTo(90, 110, 140, 140); c.lineTo(150, 420); c.fill(); }, { col: '#2b2244' });
const KID = makeSheet(140, 280, c => { c.fillStyle = '#000'; c.beginPath(); c.arc(70, 50, 42, 0, TAU); c.fill(); c.beginPath(); c.moveTo(24, 280); c.lineTo(34, 110); c.quadraticCurveTo(70, 90, 106, 110); c.lineTo(116, 280); c.fill(); }, { col: '#2b2244' });
const LAB = makeSheet(360, 300, c => { c.fillStyle = '#000'; c.fillRect(20, 60, 320, 220); c.globalCompositeOperation = 'destination-out'; c.fillRect(50, 90, 260, 110); c.globalCompositeOperation = 'source-over'; c.fillRect(160, 0, 40, 60); }, { col: '#5a6a8c' });
function sky(t, o = {}) { const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, o.top || '#0b1233'); gr.addColorStop(1, o.bot || '#2c3b86'); g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
  for (let i = 0; i < 60; i++) { const x = hash(i * 3.3) * BW, y = hash(i * 7.1) * BH * .7, tw = .5 + .5 * Math.sin(t * 2 + i); g.fillStyle = `rgba(255,240,210,${.25 + .5 * tw * hash(i)})`; g.beginPath(); g.arc(x, y, 1.2 + 1.6 * hash(i * 2), 0, TAU); g.fill(); }
  if (o.moon !== false) { const mx = o.mx ?? 760, my = o.my ?? 190; glow(g, mx, my, 160, '255,226,160', .5); g.fillStyle = '#ffeec4'; g.beginPath(); g.arc(mx, my, 44, 0, TAU); g.fill(); } }
// glowing speech bubble with Caveat text; w auto; tail toward (tx,ty); a alpha; dashed = an empty "reply" bubble
function bubble(x, y, txt, t, a = 1, o = {}) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = `700 ${o.size || 48}px Caveat`; const w = Math.max(120, g.measureText(txt).width + 60), h = (o.size || 48) + 40;
  if (!o.dashed) bloom(g, x, y, w * .7, BUB, .35 * flick(t, x));
  g.fillStyle = o.dashed ? 'rgba(255,240,210,.0)' : '#fff3d6'; g.strokeStyle = o.dashed ? 'rgba(255,240,210,.8)' : '#3a2b4d'; g.lineWidth = 3; if (o.dashed) g.setLineDash([10, 8]);
  rr(g, x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.stroke(); g.beginPath(); const tx = o.tx ?? x - w * .3, ty = o.ty ?? y + h; g.moveTo(x - w * .2, y + h / 2 - 2); g.lineTo(tx, ty); g.lineTo(x - w * .05, y + h / 2 - 2); g.fill(); g.setLineDash([]);
  if (!o.dashed) { g.fillStyle = '#3a2b4d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 2); } g.restore(); }
function sleeper(t, o = {}) { const br = Math.sin(t * 1.3) * 4; put(g, L.bed, cam0, .5); putSheet(g, HEAD, 120, 440 + br, { sc: .75, sh: .6 }); g.save(); g.fillStyle = 'rgba(60,40,80,.9)'; g.beginPath(); g.ellipse(195, 515 + br, 16, 4, 0, 0, TAU); g.fill(); g.restore();   // closed eye
  for (let i = 0; i < 3; i++) { const u = (t * .35 + i / 3) % 1; g.save(); g.globalAlpha = (1 - u) * .8; g.fillStyle = '#fff3d6'; g.font = `700 ${30 + i * 8}px Caveat`; g.fillText('z', 270 + i * 26 + u * 30, 440 - u * 120); g.restore(); } }
function hypnogram(x, y, w, h, t, k, marks) { const st = [0, 2, 3, 3, 2, 1, 4, 2, 3, 2, 1, 4, 2, 1, 4, 1, 0]; g.save(); g.globalAlpha *= k; g.strokeStyle = 'rgba(255,236,190,.9)'; g.lineWidth = 4; g.beginPath();
  st.forEach((v, i) => { const xx = x + i / (st.length - 1) * w, yy = y + (v === 4 ? -.7 : v) * h / 3; i ? (g.lineTo(xx, g.__ly ?? yy), g.lineTo(xx, yy)) : g.moveTo(xx, yy); g.__ly = yy; }); g.stroke(); g.restore();
  [['awake', 0], ['light', 1.5], ['deep', 3]].forEach(([lab, v]) => tag(g, lab, x - 90, y + v * h / 3, { k: k, size: 30, rot: 0 })); tag(g, 'REM', x - 90, y - .7 * h / 3 - 6, { k, size: 30, rot: 0, col: '#e0d0ff' });
  marks.forEach(([u, lab], i) => { const xx = x + u * w, v = st[Math.round(u * (st.length - 1))], yy = y + (v === 4 ? -.7 : v) * h / 3; if (t > lab) bubble(xx, yy - 80, '…', t, ss(seg(t, lab, lab + .4)), { size: 40, tx: xx, ty: yy - 10 }); }); }

// ---------- shots ----------
const S = [];
// A: hook: the night bedroom; a glowing "No." bubble pulses over the sleeper; vertical SLEEP strip
S.push([0, T(1), t => { sky(t); put(g, L.hills, cam0, .2); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t);
  bubble(420, 330, 'No.', t, .75 + .25 * Math.sin(t * 3), { size: 80, tx: 250, ty: 450 }); put(g, L.front, cam0, 1);
  vstrip(g, 'SLEEP', 80, 20, seg(t, .1, .9), { size: 52, seal: 'Zz' }); strip(g, 'the top word in a sleep lab', 520, 140, t < .02 ? 1 : seg(t, 0, .6), { size: 54, rot: -.03 }); }]);
// B: the question: mumble bubbles over the pillow
S.push([T(1) - .3, T(2), t => { sky(t); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t); ['mmm…', 'nnno…', 'wait…'].forEach((w, i) => bubble(380 + i * 150, 320 - i * 40, w, t, ss(seg(t, r(1, .4 + i * .5), r(1, .8 + i * .5))), { size: 44, tx: 250, ty: 460 }));
  put(g, L.front, cam0, 1); strip(g, 'why do we talk in our sleep?', 470, 140, seg(t, T(1), T(1) + .7), { size: 54, seal: true }); tag(g, "scientists don't fully know", 470, 760, { k: backOut(seg(t, r(1, 2.6), r(1, 3.0))), rot: .03 }); }]);
// C: somniloquy: a row of 20 paper heads; about 13 light up (60-65%)
S.push([T(2) - .3, T(3), t => { sky(t, { moon: false, top: '#141a3e', bot: '#2c2c5e' }); strip(g, 'somniloquy', 470, 140, seg(t, r(2, .2), r(2, .8)), { size: 70, seal: true });
  for (let i = 0; i < 20; i++) { const x = 110 + (i % 10) * 80, y = 420 + Math.floor(i / 10) * 180, on = i < 13 && t > r(2, 2.6 + i * .08); const kk = on ? ss(seg(t, r(2, 2.6 + i * .08), r(2, 3.0 + i * .08))) : 0; if (kk > 0) glow(g, x, y, 70, WARM, .55 * kk * flick(t, i)); putSheet(g, HEAD, x - 32, y - 32, { sc: .32, sh: .5, a: .35 + .65 * kk }); }
  tag(g, '60-65% at some point', 470, 790, { k: backOut(seg(t, r(2, 4.2), r(2, 4.6))), size: 46 }); }]);
// D: children vs adults
S.push([T(3) - .3, T(4), t => { sky(t, { mx: 470, my: 150 }); put(g, L.hills, cam0, .3); putSheet(g, KID, 200, 380, { sc: 1.1, sh: .8 }); putSheet(g, PERSON, 560, 280, { sc: 1.2, sh: .8 });
  bubble(300, 300, 'la la…', t, ss(seg(t, r(3, .4), r(3, .8))), { size: 42, tx: 270, ty: 400 }); bubble(760, 220, '…', t, ss(seg(t, r(3, 2.4), r(3, 2.8))) * .6, { size: 36, tx: 680, ty: 300 });
  tag(g, '50% of young children', 270, 760, { k: backOut(seg(t, r(3, .8), r(3, 1.2))), size: 42 }); tag(g, 'about 5% of adults', 610, 800, { k: backOut(seg(t, r(3, 2.6), r(3, 3.0))), size: 42 }); }]);
// E: any stage of sleep: the hypnogram with bubbles at light, deep and REM points
S.push([T(4) - .3, T(5), t => { sky(t, { moon: false, top: '#0b1233', bot: '#1f2a5e' }); hypnogram(180, 410, 700, 320, t, ss(seg(t, r(4, 0), r(4, .8))), [[.15, r(4, 1.0)], [.4, r(4, 1.6)], [.68, r(4, 2.2)]]);
  strip(g, 'any stage of sleep', 470, 140, seg(t, r(4, .2), r(4, .8)), { size: 58 }); tag(g, 'link to dreams: unclear', 470, 800, { k: backOut(seg(t, r(4, 3.0), r(4, 3.4))), size: 42, col: '#e0d0ff' }); }]);
// F: re-hook: the lab: 883 episodes as a dot grid; 59% squiggles (no words)
S.push([T(5) - .3, T(6), t => { sky(t, { moon: false, top: '#10162e', bot: '#24304e' }); putSheet(g, LAB, 560, 120, { sc: .9, sh: .7 }); for (let i = 0; i < 3; i++) { const u = (t * .8 + i / 3) % 1; g.save(); g.strokeStyle = 'rgba(140,220,255,.8)'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= 230; x += 6) g.lineTo(610 + x, 230 + i * 30 + Math.sin(x * .12 + t * 8 + i) * 10 * (1 - u * .3)); g.stroke(); g.restore(); }
  strip(g, '883 episodes', 300, 160, seg(t, r(5, .4), r(5, 1.0)), { size: 60, seal: true }); const n = 100, shown = Math.floor(n * seg(t, r(5, 1.2), r(5, 3.4)));
  for (let i = 0; i < shown; i++) { const x = 110 + (i % 20) * 36, y = 440 + Math.floor(i / 20) * 46, nv = hash(i * 1.7) < .59; if (nv) { g.save(); g.strokeStyle = 'rgba(255,236,190,.9)'; g.lineWidth = 3; g.beginPath(); for (let q = 0; q <= 16; q += 4) g.lineTo(x - 8 + q, y + Math.sin(q + t * 6 + i) * 6); g.stroke(); g.restore(); } else { g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); } }
  ['mumbles', 'whispers', 'shouts', 'laughs'].forEach((w, i) => tag(g, w, 180 + i * 200, 740 + (i % 2) * 50, { k: backOut(seg(t, r(5, 4.6 + i * .4), r(5, 5.0 + i * .4))), size: 38, rot: (i - 1.5) * .04 })); }]);
// G: "No." brushed big; 1 in 5 clauses a negation
S.push([T(6) - .3, T(7), t => { sky(t); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); const k = backOut(seg(t, r(6, .2), r(6, .7))); g.save(); g.translate(320, 380); g.scale(k, k); bloom(g, 0, 0, 260, BUB, .5 * flick(t)); g.font = 'italic 700 240px "Cormorant Garamond"'; g.fillStyle = '#fff3d6'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('No.', 0, 0); g.restore();
  tag(g, 'about 1 in 5 clauses: a negation', 470, 700, { k: backOut(seg(t, r(6, 2.6), r(6, 3.0))), size: 42 }); }]);
// H: swearing: a #!@% bubble; 1 in 10
S.push([T(7) - .3, T(8), t => { sky(t); put(g, L.room, cam0, .3); sleeper(t); bubble(470, 300, '#!@%', t, ss(seg(t, r(7, .1), r(7, .4))), { size: 80, tx: 250, ty: 450 }); tag(g, 'about 1 in 10: swearing', 470, 760, { k: backOut(seg(t, r(7, .6), r(7, 1.0))), size: 44 }); }]);
// I: the caveat card: mostly sleep-disorder patients
S.push([T(8) - .3, T(9), t => { sky(t, { moon: false, top: '#141a3e', bot: '#2c2c5e' }); putSheet(g, LAB, 300, 380, { sc: .9, sh: .7, a: .6 });
  strip(g, 'mostly sleep-disorder patients', 470, 180, seg(t, r(8, .2), r(8, .9)), { size: 52, seal: true }); tag(g, 'everyday sleep talk: maybe tamer', 470, 780, { k: backOut(seg(t, r(8, 2.2), r(8, 2.6))), size: 42, col: '#e0d0ff' }); }]);
// J: one side of a conversation: bubbles alternate with empty dashed "reply" bubbles
S.push([T(9) - .3, T(10), t => { sky(t); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t);
  const lines = ['where are you going?', '…', 'no, not today.', '…', 'okay. fine.']; lines.forEach((w, i) => { const k = ss(seg(t, r(9, .6 + i * 1.3), r(9, 1.0 + i * 1.3))); const x = i % 2 ? 640 : 420, y = 140 + i * 70; bubble(x, y, w === '…' ? '' : w, t, k, { size: 40, dashed: w === '…', tx: i % 2 ? 760 : 260, ty: y + 70 }); });
  strip(g, 'grammar: mostly normal', 470, 720, seg(t, r(9, 4.6), r(9, 5.3)), { size: 54 }); }]);
// K: secret confession? the seal: NOT A TRUTH SERUM
S.push([T(10) - .3, T(11), t => { sky(t); put(g, L.room, cam0, .3); sleeper(t); bubble(420, 300, 'I took the cookie…', t, ss(seg(t, r(10, .2), r(10, .6))), { size: 44, tx: 250, ty: 450 });
  const k = backOut(seg(t, r(10, 1.4), r(10, 1.8))); if (k > 0) { g.save(); g.translate(560, 560); g.rotate(-.12); g.scale(k, k); g.fillStyle = '#b3261e'; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 10; rr(g, -260, -60, 520, 120, 10); g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = 'rgba(255,220,200,.7)'; g.lineWidth = 3; rr(g, -248, -48, 496, 96, 6); g.stroke(); g.fillStyle = '#ffe9dc'; g.font = '700 54px Caveat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOT A TRUTH SERUM', 0, 2); g.restore(); } }]);
// L: harmless on its own; the doctor note
S.push([T(11) - .3, T(12), t => { sky(t); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t); bubble(420, 330, '…', t, .7, { size: 44, tx: 250, ty: 450 });
  tag(g, 'on its own: harmless', 300, 170, { k: backOut(seg(t, r(11, .2), r(11, .6))), size: 46 }); tag(g, 'new later in life, or other symptoms?', 470, 740, { k: backOut(seg(t, r(11, 2.4), r(11, 2.8))), size: 38 }); tag(g, 'see a doctor', 470, 810, { k: backOut(seg(t, r(11, 3.4), r(11, 3.8))), size: 40, col: '#ffd9a0' }); }]);
// M: payoff: the bubbles drift out of the window into the night
S.push([T(12) - .3, T(13), t => { sky(t); put(g, L.hills, cam0, .2); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t);
  for (let i = 0; i < 5; i++) { const u = ((t - T(12)) * .18 + i / 5) % 1; bubble(lerp(330, 760, u), lerp(400, 120, u), ['no…', 'wait', 'mm', 'okay', '…'][i], t, Math.sin(u * Math.PI), { size: 38 }); }
  strip(g, 'the brain keeps chatting', 470, 740, seg(t, r(12, 2.4), r(12, 3.1)), { size: 56, seal: true }); put(g, L.front, cam0, 1); }]);
// N: question
S.push([T(13) - .3, T(14), t => { sky(t); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t); strip(g, 'do you talk in your sleep?', 470, 150, seg(t, T(13), T(13) + .8), { size: 54 }); put(g, L.front, cam0, 1); }]);
// O: end card (loops to the hook's bedroom)
S.push([T(14) - .35, TOT + 1, t => { sky(t); put(g, L.hills, cam0, .2); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t); bubble(440, 450, 'No.', t, .6, { size: 64, tx: 260, ty: 470 });
  strip(g, 'Follow for more of', 470, 170, seg(t, T(14) - .2, T(14) + .5), { size: 60 }); strip(g, 'how it really works.', 470, 290, seg(t, T(14) + .3, T(14) + 1.0), { size: 72, seal: true }); put(g, L.front, cam0, 1); }]);

function scene(t) { g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H); g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .45, b); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  vignette(g, .5); g.restore(); lampFrame(g, '200,180,255', .26); }
function sub(t) { let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur < 0 || cur === PH.length - 1) return;
  const p = PH[cur], nx = PH[cur + 1].start, a = seg(t, p.start - .05, p.start + .15) * (1 - seg(t, nx - .25, nx - .05)); subtitle(g, p.cap, cur === 0 ? (1 - seg(t, nx - .25, nx - .05)) : a, 1240); }
window.DUR = TOT;
function room(t) { if (t > T(13) - .2 && t < T(14) - .3) { const a = 1 - seg(t, T(14) - .6, T(14) - .3); tag(g, 'YES', 330, 1395, { k: backOut(seg(t, r(13, 1.0), r(13, 1.4))), size: 64, col: '#ffd9a0', a }); tag(g, 'NO', 750, 1395, { k: backOut(seg(t, r(13, 1.3), r(13, 1.7))), size: 64, col: '#bcd6ff', a }); }
  if (t > T(14) - .35) { tag(g, "A new 'wait, really?' every day.", 540, 1230, { k: backOut(seg(t, T(14) + .8, T(14) + 1.2)), size: 50 }); tag(g, '@howitreallyworkstudio', 540, 1340, { k: backOut(seg(t, T(14) + 1.0, T(14) + 1.4)), size: 44, col: '#ffd9a0' }); } }
window.seek = t => { scene(t); sub(t); room(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .35; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { const t = 2; g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H); g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  sky(t); put(g, L.hills, cam0, .2); put(g, L.room, cam0, .3); put(g, L.sill, cam0, .35); sleeper(t); bubble(420, 330, 'No.', t, 1, { size: 90, tx: 250, ty: 450 });
  strip(g, 'WHY WE TALK', 470, 130, 1, { size: 90 }); strip(g, 'IN OUR SLEEP', 470, 250, 1, { size: 90, seal: true }); put(g, L.front, cam0, 1); vignette(g, .45); g.restore(); lampFrame(g, '200,180,255', .3); };
window.seek(0); window.ready = true; window.READY = true;
