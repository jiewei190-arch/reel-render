// t_ninetynine.js: "Why do prices end in .99?" in template #30 "story fable" (reference: reference/story-fable, STYLE_STORY.md).
// Our story and characters: two rival bakeries, Red (handlebar moustache) and Teal (goatee), facing each other across a cobbled street.
// The price boards (flip digits) open and close the reel (loop). Every fact is a physical object: boards, a penny, a blueprint with the
// finding stamped on it, an overhead queue map, a brass till for the cash-register legend ("UNPROVEN" stamp).
// Camera roams inside each set, hard cuts / one whip pan / a light-flash, captions 1-2 words (Nunito 900) at y 1330.
// Safe zones: top 250, bottom 1440, right column x>900 from y 840 (faces and key props kept out). Pure function of t.
import { W, H, TAU, clamp, lerp, seg, ss, eo, eio, back, hash, mix, INK, HEAD, create, g, CAM, setCam, proj, put, flush, sky, cloud, farLand, street, ink, stick, dashes, castShadow, figure, priceBoard, bakery, loaf, coin, post, caption, chunks } from './styles/storyfable/fable.js';
await Promise.all(['900 60px Nunito', '700 40px Cinzel'].map(f => document.fonts.load(f)));
create(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const RED = '#c8443a', REDS = '#9b2f29', TEAL = '#1f8f8a', TEALS = '#16706c';
const CH = chunks(PH);

// ---------------- camera keys ----------------
function camKeys(t, keys) { let a = keys[0], b = keys[keys.length - 1]; for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t < keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; } if (t >= b[0]) a = b;
  const u = a === b ? 1 : eio((t - a[0]) / (b[0] - a[0])); const c = {}; for (const k of Object.keys(b[1])) c[k] = lerp(a[1][k] ?? b[1][k], b[1][k], u); setCam({ y: 150, hor: 840, f: 1150, dof: 1.8, ...c }); }

// ---------------- the street set ----------------
const CUST = [['#d9a441', '#b78327'], ['#7d5aa6', '#5f4383'], ['#6f8f5a', '#55703f'], ['#c27a8a', '#9e5d6c'], ['#5a7ea6', '#425f83'], ['#b98a5a', '#966a3f']];
function baker(side, t, o = {}) { const red = side < 0; return figure({ col: red ? RED : TEAL, colS: red ? REDS : TEALS, apron: '#f4eedf', hat: 'toque', hatBand: red ? RED : TEAL, stache: red ? 'handle' : null, goatee: !red, t, ...o }); }
function customer(i, t, o = {}) { const [c, cs] = CUST[i % CUST.length]; return figure({ col: c, colS: cs, stache: i % 3 === 0 ? 'brush' : null, hat: i % 4 === 1 ? 'cap' : null, hatBand: cs, t, scale: .92, ...o }); }
function world(t, o = {}) { const { mood = 0, redQ = 2, tealQ = 5, boards = ['3.00', '2.99'], prev = null, flip = 1, bakersOn = true, walkIn = 1, bird = 0, bk = [620, 1050], bx = 330, bz = 900 } = o;
  sky(t, mood); if (mood !== 2) { cloud(220 + t * 6, 300, 1.2, 3); cloud(780 + t * 4, 220, .9, 7); cloud(560 + t * 5, 420, .7, 11, .9); } farLand(t, mood); street(t, { mood });
  put(-900, 0, 1500, (g2, p) => bakery('RED', RED, REDS, t, { mood }), { hazeBox: [-300, -800, 600, 820] });
  put(900, 0, 1500, (g2, p) => bakery('TEAL', TEAL, TEALS, t, { mood }), { hazeBox: [-300, -800, 600, 820] });
  // street lamps + far houses
  for (const sd of [-1, 1]) for (let z = 2400; z < 7000; z += 1100) put(sd * 1100, 0, z, () => { ink(() => { g.beginPath(); g.rect(-160, -380, 320, 380); }, mood === 2 ? '#6a6688' : '#e8d9b8', { shade: mood === 2 ? '#56537a' : '#d4c19c', sx: 60, lw: 5 }); ink(() => { g.beginPath(); g.moveTo(-190, -380); g.lineTo(0, -520); g.lineTo(190, -380); g.closePath(); }, '#8d4a3a', { lw: 5 }); ink(() => { g.beginPath(); g.rect(-60, -260, 120, 100); }, mood === 2 ? '#f5c66b' : '#9cc0d8', { lw: 4 }); }, { hazeBox: [-200, -540, 400, 560] });
  for (const sd of [-1, 1]) put(sd * 420, 0, 1100, () => { stick(0, 0, 0, -330, 0, 8); ink(() => { g.beginPath(); g.roundRect(-22, -380, 44, 54, 8); }, mood === 2 ? '#ffd27a' : '#e9e2c8', { lw: 4 }); if (mood === 2) { g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(0, -352, 4, 0, -352, 160); lg.addColorStop(0, 'rgba(255,210,120,.6)'); lg.addColorStop(1, 'rgba(255,210,120,0)'); g.fillStyle = lg; g.fillRect(-160, -512, 320, 320); g.restore(); } });
  // price boards
  put(-bx, 0, bz, () => priceBoard('RED', boards[0], prev ? prev[0] : null, flip, RED, o.boardO0 || {}), { sharp: !!o.sharpBoards });
  put(bx, 0, bz, () => priceBoard('TEAL', boards[1], prev ? prev[1] : null, flip, TEAL, o.boardO1 || {}), { sharp: !!o.sharpBoards });
  // bakers by their doors
  if (bakersOn) { put(-bk[0], 0, bk[1], () => baker(-1, t, { expr: o.redExpr || 'glare', look: .6, turn: .3, armF: { x: 52, y: -100, bend: 12 }, talk: o.redTalk || 0, bird, ...(o.redO || {}) }));
    put(bk[0], 0, bk[1], () => baker(1, t, { expr: o.tealExpr || 'smug', look: -.6, turn: -.3, armF: { x: 40, y: -160, bend: 20 }, hold: (x, y) => loaf(x + 6, y - 20, .9), talk: o.tealTalk || 0 })); }
  // queues
  for (let i = 0; i < tealQ; i++) { const z = 1150 - i * 120, x = 560 - i * 30 + (1 - walkIn) * (i * 160 - 500); put(x, 0, z, () => customer(i, t, { look: .8, turn: .2, walk: walkIn < 1 ? (t * 1.6 + i * .3) % 1 : -1 })); }
  for (let i = 0; i < redQ; i++) { const z = 1150 - i * 120, x = -560 + i * 30; put(x, 0, z, () => customer(i + 3, t, { look: -.8, turn: -.2, expr: 'neutral' })); }
  // foreground element: a flower barrel near the camera (blurred)
  const fs = o.fg ?? -1; if (fs) put(CAM.x + fs * 230, 0, CAM.z + 330, () => { ink(() => { g.beginPath(); g.roundRect(-60, -110, 120, 110, 12); }, '#8a5a34', { shade: '#6e4628', sx: 20, lw: 4 }); for (let i = 0; i < 7; i++) { g.fillStyle = ['#e85a5a', '#f2c24e', '#ffffff'][i % 3]; g.beginPath(); g.arc(-48 + i * 16, -126 - 10 * hash(i), 12, 0, TAU); g.fill(); } g.fillStyle = '#5c8a3a'; g.fillRect(-56, -118, 112, 10); });
  flush();
}

// a two-tier birthday cake with a round tag (the round-price twist)
function cake(x, y) { g.save(); g.translate(x, y); ink(() => { g.beginPath(); g.roundRect(-46, -40, 92, 40, 8); }, '#f2b8c6', { shade: '#d995a6', sx: 20, lw: 3.5 }); ink(() => { g.beginPath(); g.roundRect(-30, -72, 60, 34, 8); }, '#fbe6ea', { shade: '#efc9d1', sx: 12, lw: 3.5 });
  ink(() => { g.beginPath(); g.arc(0, -82, 9, 0, TAU); }, '#d8343a', { lw: 3 }); dashes([[-40, -20], [40, -20]], 'rgba(255,255,255,.8)', 2.5); g.restore(); }
// ---------------- other sets (screen space) ----------------
function blueprint(t, t0) { const k = t - t0;   // desk + blue sheet; a glowing pen draws, labels pop, a red stamp slams
  g.fillStyle = '#3a2418'; g.fillRect(0, 0, W, H); const dg = g.createRadialGradient(240, 420, 40, 240, 420, 900); dg.addColorStop(0, 'rgba(255,190,110,.55)'); dg.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = dg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(540, 820); g.rotate(-.04 + .01 * Math.sin(k * .5)); const z = 1 + .04 * k; g.scale(z, z);
  ink(() => { g.beginPath(); g.rect(-420, -470, 840, 940); }, '#2f6fbf', { lw: 5 }); g.strokeStyle = 'rgba(200,225,255,.25)'; g.lineWidth = 1.5; for (let x = -420; x <= 420; x += 40) { g.beginPath(); g.moveTo(x, -470); g.lineTo(x, 470); g.stroke(); } for (let y = -470; y <= 470; y += 40) { g.beginPath(); g.moveTo(-420, y); g.lineTo(420, y); g.stroke(); }
  g.fillStyle = '#e6f1ff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const dr = seg(k, .2, 2.2); g.font = '700 56px Cinzel'; g.save(); g.beginPath(); g.rect(-420, -470, 840 * dr, 300); g.clip(); g.fillText('LEFT-DIGIT', 0, -390); g.fillText('EFFECT', 0, -320); g.restore();
  const d2 = seg(k, 1.4, 3.0); g.font = '700 120px Cinzel'; g.save(); g.beginPath(); g.rect(-420, -230, 840 * d2, 200); g.clip(); g.fillText('3.00 → 2.99', 0, -130); g.restore();
  if (d2 > 0 && d2 < 1) { const px = -360 + 720 * d2, py = -130; g.save(); g.globalCompositeOperation = 'lighter'; const pg = g.createRadialGradient(px, py, 2, px, py, 60); pg.addColorStop(0, 'rgba(255,240,200,.95)'); pg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = pg; g.fillRect(px - 60, py - 60, 120, 120); g.restore(); }
  const d3 = back(seg(k, 3.2, 3.5), 2); if (d3 > 0) { g.save(); g.translate(-160, 60); g.scale(d3, d3); g.strokeStyle = '#ffd36e'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 70, 90, 0, 0, TAU); g.stroke(); g.fillStyle = '#ffd36e'; g.font = '700 46px Cinzel'; g.fillText('FIRST', 0, 140); g.fillText('DIGIT', 0, 190); g.restore(); }
  const d4 = seg(k, 3.6, 4.2); g.font = '700 38px Cinzel'; g.fillStyle = `rgba(230,241,255,${d4})`; g.fillText('THOMAS & MORWITZ', 120, 360); g.fillText('J. CONSUMER RES. 2005', 120, 410);
  const st = seg(k, 6.0, 6.25); if (st > 0) { g.save(); g.translate(150, 120); g.rotate(-.12); const sc = lerp(2.2, 1, eo(st)); g.scale(sc, sc); g.globalAlpha = clamp(st * 2) * .92; g.strokeStyle = '#d8382c'; g.lineWidth = 8; g.strokeRect(-220, -60, 440, 120); g.fillStyle = '#d8382c'; g.font = '700 44px Cinzel'; g.fillText('WHEN IT CHANGES', 0, 6); g.restore(); }
  g.restore();
  // candle at the left edge (warm source)
  ink(() => { g.beginPath(); g.roundRect(70, 520, 70, 200, 10); }, '#f3ead6', { lw: 4 }); const fl = 1 + .08 * Math.sin(k * 13); g.save(); g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(105, 490, 2, 105, 490, 160 * fl); cg.addColorStop(0, 'rgba(255,220,140,.9)'); cg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = cg; g.fillRect(-60, 330, 330, 330); g.restore(); g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(105, 495, 10 * fl, 22 * fl, 0, 0, TAU); g.fill();
}
function overhead(t, t0) { const k = t - t0; g.fillStyle = '#b8a37a'; g.fillRect(0, 0, W, H);   // top-down plaza: two shops, queues as dots + arrows
  g.save(); const z = 1.05 - .05 * seg(k, 0, 7); g.translate(540, 900); g.scale(z, z); g.rotate(.02 * Math.sin(k * .4)); g.translate(-540, -900);
  g.fillStyle = '#a9946c'; g.fillRect(400, 0, 280, H); for (let y = 0; y < H; y += 60) for (let x = 400; x < 680; x += 70) { g.strokeStyle = 'rgba(110,90,60,.35)'; g.lineWidth = 2; g.strokeRect(x + ((y / 60) % 2) * 35, y, 70, 60); }
  for (const [x, c, cs, nm] of [[120, RED, REDS, 'RED'], [700, TEAL, TEALS, 'TEAL']]) { ink(() => { g.beginPath(); g.rect(x, 500, 260, 420); }, c, { shade: cs, sx: x + 180, lw: 6 }); g.fillStyle = '#fff8ea'; g.font = '700 50px Cinzel'; g.textAlign = 'center'; g.fillText(nm, x + 130, 720); }
  const nT = Math.round(lerp(3, 9, seg(k, .4, 3.0))), nR = 3; for (let i = 0; i < nT; i++) ink(() => { g.beginPath(); g.arc(640 - (i % 2) * 40, 960 + i * 50, 18, 0, TAU); }, HEAD, { lw: 3 }); for (let i = 0; i < nR; i++) ink(() => { g.beginPath(); g.arc(440 + (i % 2) * 40, 960 + i * 50, 18, 0, TAU); }, HEAD, { lw: 3 });
  g.restore();
  const tg = back(seg(k, 1.4, 1.7), 2); if (tg > 0) { g.save(); g.translate(560, 420); g.rotate(-.05); g.scale(tg, tg); ink(() => { g.beginPath(); g.roundRect(-300, -80, 600, 160, 18); }, '#fbf3df', { lw: 5 }); g.fillStyle = INK; g.font = '700 42px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CATALOG FIELD TESTS', 0, -24); g.fillText('ENDING IN 9: SOLD MORE', 0, 30); g.restore(); }
  if (k > 5.2) { const d = back(seg(k, 5.2, 5.5), 2); g.save(); g.translate(360, 1120); g.rotate(.1); g.scale(d, d); ink(() => { g.beginPath(); g.moveTo(-110, -60); g.lineTo(110, -60); g.lineTo(150, 0); g.lineTo(110, 60); g.lineTo(-110, 60); g.closePath(); }, '#f2d16b', { lw: 5 }); g.fillStyle = INK; g.font = '700 56px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('…9', -10, 4); g.restore();
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + k * 2, r = 150 + 20 * Math.sin(k * 6 + i); g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(360 + Math.cos(a) * r, 1120 + Math.sin(a) * r * .6, 7, 0, TAU); g.fill(); } }
}
function nightTill(t, t0) { const k = t - t0;   // candle-lit counter, brass till; the drawer slides out (ding); parchment "LEGEND"; stamp UNPROVEN
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1b1530'); bg.addColorStop(1, '#3a2638'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); const z = 1 + .03 * k; g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  ink(() => { g.beginPath(); g.rect(-40, 1000, 1160, 500); }, '#6b4428', { shade: '#553419', sx: 700, lw: 6 });
  ink(() => { g.beginPath(); g.roundRect(330, 620, 420, 330, 20); }, '#c9973e', { shade: '#a87a2c', sx: 600, lw: 6 }); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ink(() => { g.beginPath(); g.arc(400 + c * 90, 690 + r * 70, 26, 0, TAU); }, '#f3ead6', { lw: 3, rim: false });
  const dr = ss(seg(k, 1.4, 1.9)); ink(() => { g.beginPath(); g.rect(320, 950 + dr * 40, 440, 70 + dr * 30); }, '#a87a2c', { lw: 5 }); ink(() => { g.beginPath(); g.roundRect(480, 600 - 40 * back(seg(k, 1.4, 1.7), 2), 120, 60, 10); }, '#f3ead6', { lw: 4 }); g.fillStyle = INK; g.font = '700 34px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 540, 630 - 40 * back(seg(k, 1.4, 1.7), 2));
  const pk = back(seg(k, .3, .6), 2); if (pk > 0) { g.save(); g.translate(250, 420); g.rotate(-.06); g.scale(pk, pk); ink(() => { g.beginPath(); g.rect(-190, -130, 380, 260); }, '#efe0bd', { lw: 5 }); g.fillStyle = INK; g.font = '700 46px Cinzel'; g.fillText('LEGEND', 0, -70); g.font = '700 30px Cinzel'; g.fillText('odd price =', 0, -10); g.fillText('open the till', 0, 34); g.fillText('for change', 0, 76); g.restore(); }
  const st = seg(k, 4.6, 4.85); if (st > 0) { g.save(); g.translate(560, 380); g.rotate(-.1); g.scale(lerp(2.2, 1, eo(st)), lerp(2.2, 1, eo(st))); g.globalAlpha = clamp(st * 2); g.strokeStyle = '#e04a3a'; g.lineWidth = 9; g.strokeRect(-210, -60, 420, 120); g.fillStyle = '#e04a3a'; g.font = '700 60px Cinzel'; g.fillText('UNPROVEN', 0, 6); g.restore(); }
  g.restore();
  // candle + glow
  ink(() => { g.beginPath(); g.roundRect(150, 860, 60, 160, 10); }, '#f3ead6', { lw: 4 }); const fl = 1 + .08 * Math.sin(k * 13); g.save(); g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(180, 830, 2, 180, 830, 380 * fl); cg.addColorStop(0, 'rgba(255,210,130,.75)'); cg.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = cg; g.fillRect(-200, 450, 760, 760); g.restore(); g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(180, 836, 10 * fl, 22 * fl, 0, 0, TAU); g.fill();
}

// ---------------- shots ----------------
const SH = [
  [0, s(1) - .15, t => { camKeys(t, [[0, { x: 0, y: 70, z: 120, focus: 900, dof: 4 }], [1.6, { x: -30, y: 70, z: 160, focus: 900, dof: 4 }], [s(1) - .5, { x: 0, y: 80, z: 20, focus: 900, dof: 3 }]]); world(t, { sharpBoards: true, fg: -1, bx: 158, bk: [520, 1300] }); }],
  [s(1) - .15, s(2) - .15, t => { camKeys(t, [[s(1) - .15, { x: 0, z: -700, focus: 1100, dof: 1.8 }], [s(2), { x: 60, z: -560, focus: 1100, dof: 1.8 }]]); world(t, { walkIn: seg(t, s(1), s(1) + 1.8), bk: [175, -40] }); }],
  [s(2) - .15, s(3) - .1, t => { camKeys(t, [[s(2) - .15, { x: -540, z: 560, focus: 490, dof: 7 }], [s(3), { x: -570, z: 620, focus: 430, dof: 7 }]]); world(t, { redTalk: 0, fg: -1 }); }],
  [s(3) - .1, s(4) - .1, t => { camKeys(t, [[s(3) - .1, { x: 540, z: 560, focus: 490, dof: 7 }], [s(4), { x: 570, z: 620, focus: 430, dof: 7 }]]); world(t, { fg: 1, tealExpr: 'smug' }); }],
  [s(4) - .1, s(5) - .1, t => { camKeys(t, [[s(4) - .1, { x: 0, y: 60, z: 260, focus: 560, dof: 7 }], [s(5), { x: 0, y: 70, z: 320, focus: 560, dof: 7 }]]); world(t, { fg: 1 });
    const sp = (t - s(4)) * 9; const p = proj(0, 0, 560); if (p) { g.save(); g.translate(p.x, p.y - 50 * p.k * Math.abs(Math.sin(sp * .3)) * (1 - seg(t, s(4) + .8, s(4) + 1.4))); coin(0, 0, p.k * 1.2, sp, t); g.restore(); } }],
  [s(5) - .1, s(7) - .2, t => { camKeys(t, [[s(5) - .1, { x: 330, y: 150, z: 400, focus: 900, dof: 6 }], [s(7), { x: 310, y: 150, z: 450, focus: 900, dof: 6 }]]); const sweep = seg(t, s(5) + .4, s(5) + 2.0);
    world(t, { sharpBoards: true, fg: 1, boardO1: { glow: Math.min(3, Math.floor(sweep * 4)), glowK: sweep < 1 ? 1 : .6 + .4 * Math.sin(t * 4) } });
    if (t > s(6) - .1) { const k = back(seg(t, s(6), s(6) + .3), 2); g.save(); g.translate(300, 520); g.scale(k, k); ink(() => { g.beginPath(); g.ellipse(0, 0, 230, 110, 0, 0, TAU); }, '#fbf3df', { lw: 5 }); for (let i = 0; i < 3; i++) ink(() => { g.beginPath(); g.arc(150 - i * 40, 130 + i * 40, 18 - i * 4, 0, TAU); }, '#fbf3df', { lw: 4, rim: false }); g.fillStyle = INK; g.font = '700 60px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('2-something', 0, 4); g.restore(); } }],
  [s(7) - .2, s(9) - .2, t => blueprint(t, s(7) - .2)],
  [s(9) - .2, s(11) - .2, t => overhead(t, s(9) - .2)],
  [s(11) - .2, s(12) - .15, t => nightTill(t, s(11) - .2)],
  [s(12) - .15, s(13) - .15, t => { const u = seg(t, s(12), s(12) + 1.2); camKeys(t, [[s(12) - .15, { x: -360, z: 300, focus: 700, dof: 6 }], [s(13), { x: -380, z: 360, focus: 640, dof: 6 }]]);
    world(t, { mood: u < .5 ? 1 : 0, boards: ['2.99', '2.99'], prev: ['3.00', '2.99'], flip: seg(t, s(12) + 1.4, s(12) + 2.2), sharpBoards: true, redExpr: 'sly', fg: -1 }); if (u < 1) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5 * (1 - u); g.fillStyle = '#f3a46b'; g.fillRect(0, 0, W, H); g.restore(); } }],
  [s(13) - .15, s(14) - .15, t => { camKeys(t, [[s(13) - .15, { x: 0, z: -720, focus: 1100, dof: 1.8 }], [s(14), { x: 0, z: -600, focus: 1100, dof: 1.8 }]]); world(t, { boards: ['2.99', '2.99'], redQ: 4, tealQ: 4, bird: seg(t, s(13) + 1.0, s(13) + 1.6), bk: [175, -40] }); }],
  [s(14) - .15, s(15) - .15, t => { camKeys(t, [[s(14) - .15, { x: -540, z: 200, focus: 600, dof: 6 }], [s(15), { x: -520, z: 280, focus: 520, dof: 6 }]]); world(t, { boards: ['10.00', '2.99'], sharpBoards: true, bk: [720, 800], bx: 470, boardO0: { unit: 'per cake' }, redExpr: 'smug', redO: { armF: { x: 54, y: -118, bend: 10 }, hold: (x, y) => cake(x + 4, y - 6) }, fg: 1 }); }],
  [s(15) - .15, s(16) - .1, t => { camKeys(t, [[s(15) - .15, { x: 0, z: 460, focus: 440, dof: 6 }], [s(16), { x: 0, z: 520, focus: 380, dof: 6 }]]); world(t, { boards: ['2.99', '2.99'], redExpr: 'glare', tealExpr: 'glare', bk: [95, 900], fg: -1 }); }],
  [s(16) - .1, TOT + 1, t => { camKeys(t, [[s(16) - .1, { x: 0, y: 80, z: 20, focus: 900, dof: 3 }], [TOT, { x: 0, y: 70, z: 120, focus: 900, dof: 4 }]]); world(t, { boards: ['2.99', '2.99'], sharpBoards: true, fg: -1, bx: 158, bk: [520, 1300] }); }],
];
function render(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const i = SH.findIndex(([a, b]) => t >= a && t < b); const [a, b, fn] = SH[i < 0 ? SH.length - 1 : i]; fn(t);
  // whip pan smear around the red→teal cut; light flash into the night till
  const wc = s(3) - .1, dw = Math.abs(t - wc); if (dw < .16) { const sm = (1 - dw / .16) * 60; g.save(); g.filter = `blur(${sm.toFixed(0)}px)`; g.drawImage(g.canvas, t < wc ? -sm * 2 : sm * 2, 0); g.restore(); }
  const fc = s(11) - .2, df = Math.abs(t - fc); if (df < .2) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - df / .2) * .85; g.fillStyle = '#ffd9a0'; g.fillRect(0, 0, W, H); g.restore(); }
  post(t, { warm: SH[i]?.[0] === s(11) - .2 ? .1 : 0 });
  const c = CH.find(c => t >= c.t0 && t < c.t1 + .05 && c.i < PH.length - 1); if (c) caption(c.s, 1330);
  const L = TOT - t; if (L < .35) { g.save(); g.globalAlpha = (1 - L / .35) * .35; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
}
window.DUR = TOT;
window.seek = t => render(t);
window.render = window.seek;
window.thumb = () => { const t = 1.2; camKeys(t, [[0, { x: 0, z: 60, focus: 900, dof: 3 }]]); g.setTransform(1, 0, 0, 1, 0, 0); world(t, { sharpBoards: true }); post(t);
  g.save(); g.font = '900 120px Nunito'; g.textAlign = 'center'; g.lineJoin = 'round'; g.strokeStyle = '#1a1420'; g.lineWidth = 18; g.strokeText('WHY .99?', 540, 330); g.fillStyle = '#fff'; g.fillText('WHY .99?', 540, 330); g.restore(); };
window.seek(0); window.ready = true; window.READY = true;
