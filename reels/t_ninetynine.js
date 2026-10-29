// t_ninetynine.js: "Why do prices end in .99?" in template #30 "story fable" (reference: reference/story-fable, STYLE_STORY.md).
// v5: built on the owner's style module styles/storyfable/fable.js (camera, depth of field, haze, rim light + cast shadows,
// round-head characters, sky, clouds, whip-pan smear, post grade, captions). Our own props and sets live in
// styles/storyfable/bakery_kit.js. Our story and characters: two rival bakeries, Red (handlebar moustache) and Teal (goatee),
// facing each other across a cobbled street. The price boards (flip digits) open and close the reel (loop). Every fact is a
// physical object: boards, a penny, a blueprint with the finding stamped on it, an overhead queue map, a brass till ("UNPROVEN").
// Safe zones: top 250, bottom 1440, right column x>900 from y 840. Pure function of t.
import { createFable, PAL } from './styles/storyfable/fable.js';
import { W, H, TAU, clamp, lerp, seg, ss, eo, eio, back, hash, mk, INK, HEAD, RIM as RIMC, g, useFable, sync, CAM, proj, quad, farLand, street, ink, stick, dashes, castShadow, priceBoard, bakery, loaf, coin, chunks, withCtx } from './styles/storyfable/bakery_kit.js';
await Promise.all(['900 60px Nunito', '700 40px Cinzel'].map(f => document.fonts.load(f)));
const F = createFable(document.getElementById('c')); useFable(F);
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const RED = PAL.sideA, REDS = PAL.sideAD, REDL = PAL.sideAL, TEAL = PAL.sideB, TEALS = PAL.sideBD, TEALL = PAL.sideBL;
const CAPS = chunks(PH).filter(c => c.i < PH.length - 1).map(c => ({ a: c.t0, b: c.t1 + .05, w: c.s }));
const FIG = 235 / 640, BBOX = [-330, -1300, 330, 40], VBOX = [-230, -780, 230, 40];   // the owner's figure is ~640 units tall; ours stand ~2.35 m in world units (cm), as in v1-v4 framing

// ---------------- camera keys (eased), mapped onto the owner's camera ----------------
function camKeys(t, keys) { let a = keys[0], b = keys[keys.length - 1]; for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t < keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; } if (t >= b[0]) a = b;
  const u = a === b ? 1 : eio((t - a[0]) / (b[0] - a[0])); const c = {}; for (const k of Object.keys(b[1])) c[k] = lerp(a[1][k] ?? b[1][k], b[1][k], u);
  const o = { y: 150, hor: 840, f: 1150, dof: 1.8, ...c }; o.dof *= 1.4; F.setCam(o); sync(); }

// ---------------- cached props (drawn once per variant into an offscreen canvas; one filtered draw per frame) ----------------
const CACHE = new Map();
function cached(key, x0, y0, w, h, R, draw) { let c = CACHE.get(key); if (!c) { c = mk(Math.ceil(w * R), Math.ceil(h * R)); const cx = c.getContext('2d'); cx.scale(R, R); cx.translate(-x0, -y0); withCtx(cx, draw); CACHE.set(key, c); }
  g.drawImage(c, x0, y0, w, h); }
const house = (roof, win) => cached('house' + roof + win, -220, -560, 440, 580, 1, () => { ink(() => { g.beginPath(); g.rect(-160, -380, 320, 380); }, '#e8d9b8', { shade: '#d4c19c', sx: 60, lw: 6 }); ink(() => { g.beginPath(); g.moveTo(-190, -380); g.lineTo(0, -520); g.lineTo(190, -380); g.closePath(); }, roof, { lw: 6 }); ink(() => { g.beginPath(); g.rect(-60, -260, 120, 100); }, win, { lw: 5 }); });
const lamp = () => cached('lamp', -40, -400, 80, 420, 2, () => { stick(0, 0, 0, -330, 0, 8); ink(() => { g.beginPath(); g.roundRect(-22, -380, 44, 54, 8); }, '#e9e2c8', { lw: 4 }); });
const barrel = () => cached('barrel', -80, -160, 160, 170, 2, () => { ink(() => { g.beginPath(); g.roundRect(-60, -110, 120, 110, 12); }, '#8a5a34', { shade: '#6e4628', sx: 20, lw: 4 }); g.fillStyle = '#5c8a3a'; g.fillRect(-56, -118, 112, 10); for (let i = 0; i < 7; i++) { g.fillStyle = ['#e85a5a', '#f2c24e', '#ffffff'][i % 3]; g.beginPath(); g.arc(-48 + i * 16, -126 - 10 * hash(i), 12, 0, TAU); g.fill(); } });
function board(title, value, prev, flip, team, o = {}) { if ((prev && flip < 1 && prev !== value) || o.glow != null) return priceBoard(title, value, prev, flip, team, o);
  cached('board' + title + value + (o.unit || ''), -170, -260, 340, 400, 2, () => priceBoard(title, value, null, 1, team, o)); }
// set dressing (v6): team banners on poles, bread crates, flour sacks, a bread cart, flower pots
const banner = (team, teamS) => cached('banner' + team, -70, -620, 200, 640, 1.5, () => {
  stick(0, 0, 0, -600, 0, 9); ink(() => { g.beginPath(); g.arc(0, -604, 12, 0, TAU); }, '#e9b949', { lw: 4 });
  stick(-6, -560, 110, -560, 0, 6);
  ink(() => { g.beginPath(); g.moveTo(10, -556); g.lineTo(104, -556); g.lineTo(104, -250); g.lineTo(57, -290); g.lineTo(10, -250); g.closePath(); }, team, { shade: teamS, sx: 70, lw: 5 });
  ink(() => { g.beginPath(); g.arc(57, -440, 30, 0, TAU); }, '#f2e3bf', { lw: 4 }); g.fillStyle = team; g.font = '700 40px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¢', 57, -438);
  dashes([[18, -540], [18, -262]], 'rgba(255,240,215,.6)', 2.5); });
const crates = () => cached('crates', -150, -260, 300, 280, 2, () => {
  const crate = (x, y, w, h) => { ink(() => { g.beginPath(); g.rect(x, y, w, h); }, '#a8743f', { shade: '#8a5c30', sx: x + w * 0.7, lw: 4.5 }); g.strokeStyle = 'rgba(70,40,20,.6)'; g.lineWidth = 3; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(x, y + h * i / 3); g.lineTo(x + w, y + h * i / 3); g.stroke(); } };
  crate(-130, -110, 130, 110); crate(4, -110, 130, 110); crate(-62, -220, 130, 110);
  for (let i = 0; i < 3; i++) loaf(-30 + i * 32, -226, 0.85); });
const sacks = () => cached('sacks', -130, -190, 260, 210, 2, () => {
  const sack = (x, s2) => { ink(() => { g.beginPath(); g.moveTo(x - 48 * s2, 0); g.quadraticCurveTo(x - 60 * s2, -110 * s2, x - 24 * s2, -150 * s2); g.lineTo(x + 24 * s2, -150 * s2); g.quadraticCurveTo(x + 60 * s2, -110 * s2, x + 48 * s2, 0); g.closePath(); }, '#efe3c6', { shade: '#d8c8a2', sx: x + 18, lw: 4 });
    stick(x - 26 * s2, -146 * s2, x + 26 * s2, -146 * s2, 0, 4); g.fillStyle = '#9b6a3a'; g.font = `700 ${22 * s2}px Cinzel`; g.textAlign = 'center'; g.fillText('FLOUR', x, -64 * s2); };
  sack(-60, 1); sack(62, 0.85); });
const cart = (team, teamS) => cached('cart' + team, -190, -330, 380, 350, 1.6, () => {
  stick(-150, -110, -200, -30, 0, 7); stick(150, -110, 200, -30, 0, 7);
  ink(() => { g.beginPath(); g.roundRect(-160, -200, 320, 110, 10); }, '#b98a5a', { shade: '#966a3f', sx: 80, lw: 5 });
  for (let i = -1; i <= 1; i++) loaf(i * 80, -206, 1.05);
  ink(() => { g.beginPath(); g.moveTo(-170, -200); g.lineTo(0, -320); g.lineTo(170, -200); g.closePath(); }, team, { shade: teamS, sx: 60, lw: 5 });
  for (const wx of [-100, 100]) { ink(() => { g.beginPath(); g.arc(wx, -60, 52, 0, TAU); }, '#5a4434', { lw: 5 }); ink(() => { g.beginPath(); g.arc(wx, -60, 14, 0, TAU); }, '#c9a46b', { lw: 3 }); for (let a = 0; a < 6; a++) stick(wx, -60, wx + Math.cos(a) * 46, -60 + Math.sin(a) * 46, 0, 3); } });
const pot = (c) => cached('pot' + c, -60, -150, 120, 160, 2, () => { ink(() => { g.beginPath(); g.moveTo(-40, -60); g.lineTo(40, -60); g.lineTo(30, 0); g.lineTo(-30, 0); g.closePath(); }, '#b0603c', { shade: '#8e4a2c', sx: 14, lw: 4 }); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#5f9447' : c; g.beginPath(); g.arc(-30 + i * 12, -78 - 16 * Math.sin(i * 1.7) ** 2, 14, 0, TAU); g.fill(); } });
function shop(name, team, teamS, t, mood) { cached('shop' + name + mood, -320, -800, 640, 820, 1.4, () => bakery(name, team, teamS, 0, { mood, lit: 0, smoke: false }));
  for (let i = 0; i < 3; i++) { const u = (t * .25 + i / 3) % 1; g.fillStyle = `rgba(240,240,245,${.55 * (1 - u)})`; g.beginPath(); g.arc(167 + Math.sin(u * 6 + i) * 18, -790 - u * 220, 26 + u * 40, 0, TAU); g.fill(); }
  g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(-95, -140, 20, -95, -100, 420); lg.addColorStop(0, 'rgba(255,200,120,.15)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = lg; g.fillRect(-520, -500, 840, 800); g.restore(); }

// ---------------- characters: the owner's F.figure, dressed as our bakers and villagers ----------------
// hand position of the figure's front arm (same construction as F.figure), for props held in the hand
function hand(o) { const a = (o.armF ?? 75) * Math.PI / 180, b = ((o.armF ?? 75) + (o.bendF ?? 20)) * Math.PI / 180, ex = 56 + Math.cos(a) * 80, ey = -400 + Math.sin(a) * 80; return [ex + Math.cos(b) * 74, ey + Math.sin(b) * 74]; }
function bob(o) { return Math.sin(((o.t || 0) + (o.phase || 0)) * Math.PI * 1.4) * 3; }
function bakerFig(red, t, o = {}) { const f = { robe: red ? RED : TEAL, robeD: red ? REDS : TEALS, robeL: red ? REDL : TEALL, long: true, apron: PAL.cream, stache: red, goatee: !red, t, phase: red ? 0 : .45, ...o };
  F.figure(f); const by = bob(f) - 548;   // then a toque (white puffed hat with a team band), drawn with the module's own pen so it gets the rim light too
  const puffs = [F.ell(-52, by - 132, 56, 52), F.ell(52, by - 132, 56, 52), F.ell(0, by - 160, 68, 62)];
  puffs.forEach(p => F.fs(p, null, 11)); puffs.forEach(p => F.fs(p, '#fbf8f0', 0)); F.fs(F.rr(-86, by - 120, 172, 52, 8), '#fbf8f0', 5);
  F.fs(F.rr(-87, by - 92, 174, 22, 5), red ? RED : TEAL, 4);
  const m = f.flip ? -1 : 1;   // F.figure mirrors itself inside; props drawn here mirror their x by hand
  if (f.loaf) { const [hx0, hy] = hand(f), hx = m * hx0 - (m < 0 ? 28 : 0); const lf = F.ell(hx + 14, hy + bob(f) - 26, 74, 40); F.fs(lf, '#d9944a', 5); F.shade(lf, '#b8763a', 14, 10); F.fs(lf, null, 5); for (let i = -1; i <= 1; i++) F.line([[hx + 14 + i * 26 - 10, hy + bob(f) - 46], [hx + 14 + i * 26 + 10, hy + bob(f) - 16]], 5, '#f6d9a6'); }
  if (f.cake) { const [hx0, hy] = hand(f), hx = m * hx0, cx = hx + 10 * m, cy = hy + bob(f) - 10; const t1 = F.rr(cx - 84, cy - 70, 168, 70, 14), t2 = F.rr(cx - 56, cy - 128, 112, 60, 14);
    F.fs(t1, '#f2b8c6', 5); F.shade(t1, '#d995a6', 20, 0); F.fs(t1, null, 5); F.fs(t2, '#fbe6ea', 5); F.shade(t2, '#efc9d1', 14, 0); F.fs(t2, null, 5); F.fs(F.ell(cx, cy - 146, 16, 16), '#d8343a', 4); }
  if (f.bird > 0) { const yb = by - 236 - (1 - ss(f.bird)) * 500, xb = m * (10 + (1 - ss(f.bird)) * 300); const bd = F.ell(xb, yb, 38, 28); F.fs(bd, '#7a6a5a', 5); F.fs(F.ell(xb + 30, yb - 22, 20, 18), '#7a6a5a', 4); F.fs(F.poly([[xb + 48, yb - 24], [xb + 66, yb - 18], [xb + 48, yb - 14]]), PAL.gold, 3); F.fs(F.ell(xb + 34, yb - 26, 4, 4), INK, 0);
    if (f.bird < 1) F.fs(F.poly([[xb - 10, yb - 10], [xb - 60, yb - 60 + 40 * Math.sin(t * 40)], [xb + 10, yb - 20]]), '#8f7e6c', 4); }
}
const CUST = [['#d9a441', '#b78327', '#ecc06a'], ['#7d5aa6', '#5f4383', '#9a7cc0'], ['#6f8f5a', '#55703f', '#8fae78'], ['#c27a8a', '#9e5d6c', '#d99aa8'], ['#5a7ea6', '#425f83', '#7c9cc2'], ['#b98a5a', '#966a3f', '#d0a676']];
function villager(i, t, o = {}) { const [c, cd, cl] = CUST[i % CUST.length]; F.figure({ robe: c, robeD: cd, robeL: cl, long: i % 3 === 2, stripes: i % 4 === 3, stache: i % 3 === 0, hat: ['none', 'bucket', 'none', 'paper', 'bucket'][i % 5], hatCol: cd, t, phase: hash(i) * 2, ...o }); }

// ---------------- the street set ----------------
// sprites: F.put(X, Z, size, draw, { sharp, rim, shadow }) — the module sorts them, blurs by depth and hazes the far ones
function world(t, o = {}) { const { mood = 0, redQ = 2, tealQ = 5, boards = ['3.00', '2.99'], prev = null, flip = 1, bakersOn = true, walkIn = 1, bird = 0, bk = [620, 1050], bx = 158, bz = 900 } = o;
  F.sky(t); farLand(t, mood); street(t, { mood }); F.horizonHaze(.55);
  // bunting across the street, two rows
  for (const bz2 of [1100, 2300]) { const a = proj(-420, 360, bz2), b = proj(420, 360, bz2); if (a && b) { const sag = 60 * a.k; g.save(); g.strokeStyle = INK; g.lineWidth = Math.max(1.2, 2.2 * a.k); g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, a.y + sag * 2, b.x, b.y); g.stroke();
    for (let i = 1; i < 12; i++) { const u = i / 12, x = lerp(a.x, b.x, u), y = (1 - u) * (1 - u) * a.y + 2 * u * (1 - u) * (a.y + sag * 2) + u * u * b.y, w = 15 * a.k, sw = Math.sin(t * 3 + i) * 3 * a.k;
      g.fillStyle = i % 2 ? RED : TEAL; g.strokeStyle = INK; g.lineWidth = Math.max(1, 1.6 * a.k); g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.lineTo(x + sw, y + 30 * a.k); g.closePath(); g.fill(); g.stroke(); } g.restore(); } }
  // painted floor emblem in the road: a coin, half red half teal
  { const EZ = o.emZ ?? 600, R0 = 150, N = 28, ring = (rad, a0, a1) => { const P = []; for (let i = 0; i <= N; i++) { const a = lerp(a0, a1, i / N); P.push(proj(Math.cos(a) * rad, 0, EZ + Math.sin(a) * rad)); } return P; };
    const half = (a0, a1, col) => { const P = ring(R0, a0, a1); const c = proj(0, 0, EZ); if (!c || P.some(p => !p)) return; g.beginPath(); g.moveTo(c.x, c.y); P.forEach(p => g.lineTo(p.x, p.y)); g.closePath(); g.fillStyle = col; g.fill(); };
    half(Math.PI / 2, Math.PI * 1.5, '#c75a48'); half(-Math.PI / 2, Math.PI / 2, '#2f8f86');
    const P = ring(R0, 0, TAU); if (!P.some(p => !p)) { g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.strokeStyle = '#f2e3bf'; g.lineWidth = 6 * P[0].k; g.stroke(); g.strokeStyle = INK; g.lineWidth = 2.5 * P[0].k; g.stroke(); }
    const c = proj(0, 0, EZ); if (c) { g.save(); g.translate(c.x, c.y); g.scale(c.k, c.k * .32); g.fillStyle = '#f7ead0'; g.font = '700 150px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¢', 0, 10); g.restore(); } }
  // shops, far houses (roofs alternate red / teal), lamps
  F.put(-900, 1500, 1, () => shop('RED', RED, REDS, t, mood)); F.put(900, 1500, 1, () => shop('TEAL', TEAL, TEALS, t, mood));
  for (const sd of [-1, 1]) for (let z = 2400; z < 7000; z += 1100) F.put(sd * 1100, z, 1, () => house((Math.round(z / 1100) + (sd > 0 ? 1 : 0)) % 2 ? '#c0503f' : '#2a8a84', '#9cc0d8'));
  for (const sd of [-1, 1]) F.put(sd * 420, 1100, 1, lamp);
  // set dressing around each shop (team colour on every prop)
  for (const sd of [-1, 1]) { const tc = sd < 0 ? RED : TEAL, ts = sd < 0 ? REDS : TEALS;
    F.put(sd * 560, 1330, 1, () => { g.save(); g.rotate(Math.sin(t * 1.3 + sd) * 0.015); banner(tc, ts); g.restore(); });
    F.put(sd * 1240, 1420, 1, () => banner(tc, ts));
    F.put(sd * 680, 1260, 1, crates); F.put(sd * 1150, 1300, 1, sacks);
    F.put(sd * 980, 1180, 1, () => cart(tc, ts)); F.put(sd * 470, 1450, 0.9, () => pot(sd < 0 ? '#e2483f' : '#f2c24e')); F.put(sd * 1320, 1250, 1, () => pot('#fff4dc')); }
  // price boards
  F.put(-bx, bz, 1, () => board('RED', boards[0], prev ? prev[0] : null, flip, RED, o.boardO0 || {}), { sharp: !!o.sharpBoards });
  F.put(bx, bz, 1, () => board('TEAL', boards[1], prev ? prev[1] : null, flip, TEAL, o.boardO1 || {}), { sharp: !!o.sharpBoards });
  // bakers (rim light + long cast shadow from the module)
  if (bakersOn) { F.put(-bk[0], bk[1], FIG, () => bakerFig(true, t, { expr: o.redExpr || 'glare', look: .6, turn: .3, armF: 80, bendF: -30, talk: o.redTalk || 0, bird, ...(o.redO || {}) }), { rim: true, shadow: true, box: BBOX });
    F.put(bk[0], bk[1], FIG, () => bakerFig(false, t, { expr: o.tealExpr || 'smug', look: -.6, turn: -.3, armF: -10, bendF: -40, loaf: true, talk: o.tealTalk || 0, flip: true }), { rim: true, shadow: true, box: BBOX }); }
  // queues of villagers
  for (let i = 0; i < tealQ; i++) { const z = 1150 - i * 120, x = 560 - i * 30 + (1 - walkIn) * (i * 160 - 500); F.put(x, z, FIG * .92, () => villager(i, t, { look: .8, turn: .2, walk: walkIn < 1 ? (t * 1.6 + i * .3) % 1 : -1 }), { rim: i < 3, shadow: i < 3, box: VBOX }); }
  for (let i = 0; i < redQ; i++) { const z = 1150 - i * 120, x = -560 + i * 30; F.put(x, z, FIG * .92, () => villager(i + 3, t, { look: -.8, turn: -.2, expr: 'neutral', flip: true }), { rim: i < 2, shadow: i < 2, box: VBOX }); }
  // foreground: a flower barrel near the lens (blurred by the module's depth of field)
  const fs = o.fg ?? -1; if (fs) F.put(CAM.x + fs * 230, CAM.z + 330, 1, barrel);
  F.flush();
}

// ---------------- other sets (screen space) ----------------
const SC = mk(840, 940);
function sheetContent(k) {   // the blueprint sheet itself (840x940), drawn flat into SC, later laid onto the desk in perspective
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 840, 940); g.translate(420, 470);
  g.fillStyle = '#2f6fbf'; g.fillRect(-420, -470, 840, 940); const sg = g.createRadialGradient(-200, -300, 50, -200, -300, 900); sg.addColorStop(0, 'rgba(120,180,255,.35)'); sg.addColorStop(1, 'rgba(10,40,100,.25)'); g.fillStyle = sg; g.fillRect(-420, -470, 840, 940);
  g.strokeStyle = 'rgba(200,225,255,.28)'; g.lineWidth = 2; for (let x = -420; x <= 420; x += 40) { g.beginPath(); g.moveTo(x, -470); g.lineTo(x, 470); g.stroke(); } for (let y = -470; y <= 470; y += 40) { g.beginPath(); g.moveTo(-420, y); g.lineTo(420, y); g.stroke(); }
  g.strokeStyle = 'rgba(230,241,255,.8)'; g.lineWidth = 5; g.strokeRect(-396, -446, 792, 892);
  g.fillStyle = '#e6f1ff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const dr = seg(k, .2, 2.2); g.font = '700 74px Cinzel'; g.save(); g.beginPath(); g.rect(-420, -470, 840 * dr, 300); g.clip(); g.fillText('LEFT-DIGIT', 0, -370); g.fillText('EFFECT', 0, -280); g.restore();
  const d2 = seg(k, 1.4, 3.0); g.font = '700 128px Cinzel'; g.save(); g.beginPath(); g.rect(-420, -200, 840 * d2, 200); g.clip(); g.fillText('3.00→2.99', 0, -100); g.restore();
  const d3 = back(seg(k, 3.2, 3.5), 2); if (d3 > 0) { g.save(); g.translate(-268, -100); g.scale(d3, d3); g.strokeStyle = '#ffd36e'; g.lineWidth = 9; g.beginPath(); g.ellipse(0, 0, 66, 92, 0, 0, TAU); g.stroke(); g.fillStyle = '#ffd36e'; g.font = '700 58px Cinzel'; g.fillText('FIRST DIGIT', 70, 150); g.restore(); }
  const d4 = seg(k, 3.6, 4.2); g.font = '700 46px Cinzel'; g.fillStyle = `rgba(230,241,255,${d4})`; g.fillText('THOMAS & MORWITZ', 0, 340); g.fillText('J. CONSUMER RES. 2005', 0, 396);
  const st = seg(k, 6.0, 6.25); if (st > 0) { g.save(); g.translate(40, 160); g.rotate(-.1); const sc = lerp(2.2, 1, eo(st)); g.scale(sc, sc); g.globalAlpha = clamp(st * 2) * .92; g.strokeStyle = '#d8382c'; g.lineWidth = 11; g.strokeRect(-300, -72, 600, 144); g.fillStyle = '#d8382c'; g.font = '700 60px Cinzel'; g.fillText('WHEN IT CHANGES', 0, 6); g.restore(); }
  g.restore(); return d2;
}
function blueprint(t, t0) { const k = t - t0;   // a baker's desk seen from above at an angle: brick wall + glowing oven behind, the blue sheet in perspective, a pen draws on it, a red stamp slams
  const YH = 300, HC = 520, F = 1100, push = 15 * k, cx = 20 * Math.sin(k * .4);
  const P = (X, z) => ({ x: 540 + (X - cx) * F / (z - push), y: YH + HC * F / (z - push), k: F / (z - push) });
  // back wall: warm bricks, a glowing bread oven, a shelf of red and teal jars
  const wy = P(0, 2600).y; g.fillStyle = '#8a4b34'; g.fillRect(0, 0, W, wy + 4);
  g.strokeStyle = 'rgba(50,20,15,.35)'; g.lineWidth = 3; for (let r = 0; r * 46 < wy; r++) { g.beginPath(); g.moveTo(0, r * 46); g.lineTo(W, r * 46); g.stroke(); for (let x = (r % 2) * 60; x < W; x += 120) { g.beginPath(); g.moveTo(x, r * 46); g.lineTo(x, r * 46 + 46); g.stroke(); } }
  const ox = 300 - cx * .4, oy = wy - 10, fl = 1 + .05 * Math.sin(k * 9) + .03 * Math.sin(k * 23);
  ink(() => { g.beginPath(); g.moveTo(ox - 230, oy); g.lineTo(ox - 230, oy - 250); g.arc(ox, oy - 250, 230, Math.PI, 0); g.lineTo(ox + 230, oy); g.closePath(); }, '#6e3a2a', { lw: 6, rim: false });
  const og = g.createRadialGradient(ox, oy - 120, 10, ox, oy - 120, 260); og.addColorStop(0, '#fff2b0'); og.addColorStop(.45, '#ffb347'); og.addColorStop(1, '#c4521f'); ink(() => { g.beginPath(); g.moveTo(ox - 150, oy); g.lineTo(ox - 150, oy - 190); g.arc(ox, oy - 190, 150, Math.PI, 0); g.lineTo(ox + 150, oy); g.closePath(); }, og, { lw: 6, rim: false });
  for (let i = 0; i < 3; i++) loaf(ox - 70 + i * 70, oy - 40, 1.1);
  g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(ox, oy - 150, 20, ox, oy - 150, 700 * fl); gl.addColorStop(0, 'rgba(255,170,80,.55)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.restore();
  ink(() => { g.beginPath(); g.rect(600, 390, 480, 22); }, '#6b4a30', { lw: 5, rim: false });
  for (let i = 0; i < 5; i++) { const x = 650 + i * 92, c = i % 2 ? '#1f8f8a' : '#c8443a'; ink(() => { g.beginPath(); g.roundRect(x - 30, 290, 60, 100, 12); }, c, { lw: 4, shade: i % 2 ? '#16706c' : '#9b2f29', sx: 10 }); ink(() => { g.beginPath(); g.rect(x - 22, 276, 44, 18); }, '#f4eedf', { lw: 3.5, rim: false }); }
  // desk: planks running away from us
  const d0 = 380, d1 = 2600; g.beginPath(); const c0 = P(-1400, d0), c1 = P(1400, d0), c2 = P(1400, d1), c3 = P(-1400, d1); g.moveTo(c0.x, c0.y); g.lineTo(c1.x, c1.y); g.lineTo(c2.x, c2.y); g.lineTo(c3.x, c3.y); g.closePath(); const dg = g.createLinearGradient(0, c3.y, 0, H); dg.addColorStop(0, '#b77d4a'); dg.addColorStop(1, '#7c4d2b'); g.fillStyle = dg; g.fill();
  g.strokeStyle = 'rgba(60,30,15,.45)'; g.lineWidth = 3; for (let X = -1400; X <= 1400; X += 200) { const a = P(X, d0), b = P(X, d1); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
  const de = P(0, d1); g.fillStyle = '#5a3420'; g.fillRect(0, de.y - 6, W, 14); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, de.y - 6); g.lineTo(W, de.y - 6); g.stroke();
  // the sheet in perspective, drawn in thin strips
  let dd = 0; withCtx(SC.getContext('2d'), () => { dd = sheetContent(k); });
  const zN = 600, zF = 1350, SW = 620; const S = v => { const z = zF + (zN - zF) * v; return P(0, z); };
  const shadow = [P(-SW / 2 + 30, zN + 30), P(SW / 2 + 30, zN + 30), P(SW / 2 + 30, zF + 30), P(-SW / 2 + 30, zF + 30)]; g.fillStyle = 'rgba(40,20,10,.35)'; g.beginPath(); shadow.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fill();
  for (let r = 0; r < 940; r += 4) { const a = S(r / 940), b = S((r + 4) / 940), w = SW * a.k; g.drawImage(SC, 0, r, 840, 4, 540 + (-SW / 2 - cx) * a.k, a.y, w, b.y - a.y + .6); }
  const e = [P(-SW / 2, zN), P(SW / 2, zN), P(SW / 2, zF), P(-SW / 2, zF)]; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); e.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.stroke();
  // the pen: tip follows the line being drawn, glowing
  const dr = seg(k, .2, 2.2), pd = dd > 0 && dd < 1 ? dd : dr > 0 && dr < 1 ? dr : 0;
  if (pd > 0) { const srcY = dd > 0 && dd < 1 ? 370 : 140, srcX = -380 + 760 * pd + 30 * Math.sin(k * 40); const v = srcY / 940, z = zF + (zN - zF) * v, p = P(srcX * SW / 840, z);
    g.save(); g.globalCompositeOperation = 'lighter'; const pg = g.createRadialGradient(p.x, p.y, 2, p.x, p.y, 80); pg.addColorStop(0, 'rgba(255,240,200,.95)'); pg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = pg; g.fillRect(p.x - 80, p.y - 80, 160, 160); g.restore();
    g.save(); g.lineCap = 'round'; g.strokeStyle = RIMC; g.lineWidth = 26; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + 150, p.y - 300); g.stroke(); g.strokeStyle = INK; g.lineWidth = 18; g.stroke(); g.strokeStyle = '#c8443a'; g.lineWidth = 10; g.beginPath(); g.moveTo(p.x + 20, p.y - 40); g.lineTo(p.x + 150, p.y - 300); g.stroke(); g.restore(); }
  // candle on the desk (left, near)
  const cp = P(-560, 820); g.save(); g.translate(cp.x, cp.y); g.scale(cp.k, cp.k); castShadow(50, 120, .3); ink(() => { g.beginPath(); g.roundRect(-30, -200, 60, 200, 10); }, '#f3ead6', { lw: 4.5, shade: '#e0d2b4', sx: 8 }); const cf = 1 + .08 * Math.sin(k * 13);
  g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(0, -230, 2, 0, -230, 200 * cf); cg.addColorStop(0, 'rgba(255,220,140,.9)'); cg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = cg; g.fillRect(-220, -450, 440, 440); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(0, -232, 11 * cf, 24 * cf, 0, 0, TAU); g.fill(); g.restore();
}
function topPerson(x, y, c, cs, hat, sc = 1) {   // a villager seen from straight above: shadow, coloured shoulders, round head, hat
  g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = 'rgba(50,30,20,.28)'; g.beginPath(); g.ellipse(12, 14, 30, 22, .5, 0, TAU); g.fill();
  ink(() => { g.beginPath(); g.ellipse(0, 4, 30, 20, 0, 0, TAU); }, c, { shade: cs, sx: 6, lw: 3.5 }); ink(() => { g.beginPath(); g.arc(0, 0, 17, 0, TAU); }, hat || HEAD, { lw: 3.5 });
  if (hat === '#fbf8f0') { g.strokeStyle = 'rgba(42,34,48,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.stroke(); } g.restore(); }
function overhead(t, t0) { const k = t - t0;   // drone view straight down on the street: roofs, trees, queues of villagers, glints; slow rotate + push
  g.save(); const z = 1.12 - .1 * seg(k, 0, 6.5); g.translate(540, 900); g.scale(z, z); g.rotate(-.06 + .03 * seg(k, 0, 6.5)); g.translate(-540, -900);
  // ground: grass with mottling, the cobbled street running top to bottom, pavement strips
  g.fillStyle = '#8db35c'; g.fillRect(-200, -200, W + 400, H + 400); for (let i = 0; i < 260; i++) { g.fillStyle = i % 3 ? 'rgba(70,120,40,.22)' : 'rgba(220,235,150,.22)'; g.beginPath(); g.ellipse(hash(i * 1.3) * 1400 - 160, hash(i * 2.7) * 2300 - 200, 20 + 30 * hash(i), 10 + 14 * hash(i * 5), hash(i * 9) * 3, 0, TAU); g.fill(); }
  g.fillStyle = '#c9b48c'; g.fillRect(300, -200, 480, H + 400); g.fillStyle = '#a2834a'; g.fillRect(400, -200, 280, H + 400);
  for (let y = -200; y < H + 200; y += 46) for (let x = 400 + ((y / 46) % 2) * 20; x < 680; x += 40) { g.fillStyle = hash(x * .3 + y) > .5 ? '#b8954f' : '#ad8a47'; g.fillRect(x + 2, y + 2, 36, 42); g.fillStyle = 'rgba(255,236,190,.18)'; g.fillRect(x + 6, y + 5, 26, 10); }
  for (const x0 of [300, 680]) for (let y = -200; y < H + 200; y += 70) { g.strokeStyle = 'rgba(120,100,70,.4)'; g.lineWidth = 2; g.strokeRect(x0, y, 100, 70); }
  // painted coin emblem in the middle of the road
  g.save(); g.translate(540, 760); g.fillStyle = '#c75a48'; g.beginPath(); g.arc(0, 0, 110, Math.PI / 2, Math.PI * 1.5); g.fill(); g.fillStyle = '#2f8f86'; g.beginPath(); g.arc(0, 0, 110, -Math.PI / 2, Math.PI / 2); g.fill(); g.strokeStyle = '#f2e3bf'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 110, 0, TAU); g.stroke(); g.fillStyle = '#f7ead0'; g.font = '700 130px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¢', 0, 8); g.restore();
  // shop roofs from above (ridge, tiles), striped awnings toward the street, chimneys
  for (const [x, c, cs, aw, nm] of [[20, '#c0503f', '#9b3a2e', RED, 'RED'], [800, '#2a8a84', '#1f6d68', TEAL, 'TEAL']]) { const yy = 520;
    g.fillStyle = 'rgba(40,25,20,.3)'; g.fillRect(x + 22, yy + 26, 260, 360);
    ink(() => { g.beginPath(); g.rect(x, yy, 260, 360); }, c, { lw: 6 }); g.save(); g.beginPath(); g.rect(x, yy, 260, 360); g.clip(); g.fillStyle = cs; g.fillRect(x + 130, yy, 130, 360); g.strokeStyle = 'rgba(40,20,20,.3)'; g.lineWidth = 3; for (let ty = yy + 30; ty < yy + 360; ty += 30) { g.beginPath(); g.moveTo(x, ty); g.lineTo(x + 260, ty); g.stroke(); } g.restore();
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 130, yy); g.lineTo(x + 130, yy + 360); g.stroke();
    ink(() => { g.beginPath(); g.rect(x + 40, yy + 60, 44, 44); }, '#7a5236', { lw: 4 }); g.fillStyle = 'rgba(240,240,240,.5)'; g.beginPath(); g.arc(x + 62 + 30 * Math.sin(k), yy + 40 - 20 * (k % 1), 18 + 10 * (k % 1), 0, TAU); g.fill();
    const ax = x < 500 ? x + 260 : x - 60; for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#fbf3df' : aw; g.fillRect(ax, yy + 60 + i * 30, 60, 30); } g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(ax, yy + 60, 60, 240);
    g.save(); g.translate(x + 130, yy + 250); g.rotate(-Math.PI / 2 * (x < 500 ? 1 : -1)); g.fillStyle = '#fff8ea'; g.font = '700 46px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(nm, 0, 0); g.restore(); }
  // tree crowns along the verges
  for (const [x, y, r] of [[230, 120, 90], [880, 200, 80], [200, 1180, 100], [900, 1260, 95], [180, 1620, 85], [920, 1700, 90], [250, -80, 80]]) { g.fillStyle = 'rgba(40,40,20,.3)'; g.beginPath(); g.arc(x + 24, y + 26, r, 0, TAU); g.fill();
    const cr = () => { g.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; g.moveTo(x + Math.cos(a) * r * .55 + r * .5, y + Math.sin(a) * r * .55); g.arc(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .5, 0, TAU); } g.moveTo(x + r * .6, y); g.arc(x, y, r * .6, 0, TAU); }; ink(cr, '#5f9450', { lw: 4.5 }); cr(); g.fillStyle = '#5f9450'; g.fill(); g.strokeStyle = 'rgba(40,70,30,.4)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + r * .2 * i - r * .2, y + r * .1, r * .3, .2, 1.6); g.stroke(); } g.fillStyle = 'rgba(220,240,160,.35)'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .35, 0, TAU); g.fill(); }
  // queues: teal grows from 3 to 9, red stays at 3; villagers bob as they shuffle
  const nT = Math.round(lerp(3, 9, seg(k, .4, 3.0))); const CU = [['#d9a441', '#b78327'], ['#7d5aa6', '#5f4383'], ['#6f8f5a', '#55703f'], ['#c27a8a', '#9e5d6c'], ['#5a7ea6', '#425f83']];
  for (let i = 0; i < nT; i++) { const [c, cs] = CU[i % 5], ap = seg(k, .4 + i * .28, .9 + i * .28); topPerson(640 - (i % 2) * 40, 1000 + i * 92 + (1 - ap) * 400, c, cs, i % 3 === 1 ? cs : null, ap > 0 ? 1.4 : 0); }
  for (let i = 0; i < 3; i++) { const [c, cs] = CU[(i + 2) % 5]; topPerson(440 + (i % 2) * 40, 1000 + i * 92, c, cs, null, 1.4); }
  topPerson(330, 760, RED, REDS, '#fbf8f0', 1.6); topPerson(750, 760, TEAL, TEALS, '#fbf8f0', 1.6);
  g.restore();
  const tg = back(seg(k, 1.4, 1.7), 2); if (tg > 0) { g.save(); g.translate(560, 380); g.rotate(-.05); g.scale(tg, tg); ink(() => { g.beginPath(); g.roundRect(-300, -80, 600, 160, 18); }, '#fbf3df', { lw: 5 }); g.fillStyle = INK; g.font = '700 42px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CATALOG FIELD TESTS', 0, -24); g.fillText('ENDING IN 9: SOLD MORE', 0, 30); g.restore(); }
  if (k > 5.2) { const d = back(seg(k, 5.2, 5.5), 2); g.save(); g.translate(330, 1100); g.rotate(.1); g.scale(d, d); ink(() => { g.beginPath(); g.moveTo(-110, -60); g.lineTo(110, -60); g.lineTo(150, 0); g.lineTo(110, 60); g.lineTo(-110, 60); g.closePath(); }, '#f2d16b', { lw: 5 }); g.fillStyle = INK; g.font = '700 56px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('…9', -10, 4); g.restore();
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + k * 2, r = 150 + 20 * Math.sin(k * 6 + i); g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(330 + Math.cos(a) * r, 1100 + Math.sin(a) * r * .6, 7, 0, TAU); g.fill(); } }
}
function nightTill(t, t0) { const k = t - t0;   // night, inside the shop: panelled wall, moonlit window, a cashier behind the counter by candlelight; the till drawer slides out; a LEGEND note on the wall gets stamped UNPROVEN
  g.save(); const z = 1 + .035 * k; g.translate(540 + 30 * Math.sin(k * .3), 900); g.scale(z, z); g.translate(-540, -900);
  // wall: dark plum planks
  g.fillStyle = '#3b2a44'; g.fillRect(-100, -100, W + 200, 1100); for (let x = -100; x < W + 100; x += 90) { g.fillStyle = hash(x) > .5 ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.08)'; g.fillRect(x, -100, 90, 1100); g.strokeStyle = 'rgba(15,8,20,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -100); g.lineTo(x, 1000); g.stroke(); }
  // window with moon + stars (top right) and its light falling in
  ink(() => { g.beginPath(); g.rect(640, 300, 300, 360); }, '#2a3a78', { lw: 8, rim: false }); const mg = g.createRadialGradient(830, 400, 10, 830, 400, 160); mg.addColorStop(0, 'rgba(230,235,255,.6)'); mg.addColorStop(1, 'rgba(120,140,220,0)'); g.fillStyle = mg; g.fillRect(640, 300, 300, 360); g.fillStyle = '#f4f1e2'; g.beginPath(); g.arc(830, 400, 40, 0, TAU); g.fill();
  for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(255,250,235,${.4 + .5 * Math.abs(Math.sin(k * 2 + i))})`; g.fillRect(660 + hash(i * 3) * 260, 320 + hash(i * 7) * 320, 4, 4); }
  g.strokeStyle = '#5a3a2a'; g.lineWidth = 12; g.beginPath(); g.moveTo(790, 300); g.lineTo(790, 660); g.moveTo(640, 480); g.lineTo(940, 480); g.stroke(); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(640, 300, 300, 360);
  // shelf with loaves
  ink(() => { g.beginPath(); g.rect(40, 700, 520, 20); }, '#5a3a2a', { lw: 4, rim: false }); for (let i = 0; i < 4; i++) loaf(110 + i * 120, 690, 1.05);
  // the LEGEND note pinned to the wall + UNPROVEN stamp
  const pk = back(seg(k, .3, .6), 2); if (pk > 0) { g.save(); g.translate(280, 450); g.rotate(-.06); g.scale(pk, pk); ink(() => { g.beginPath(); g.rect(-200, -140, 400, 280); }, '#efe0bd', { lw: 5, shade: '#e0cca2', sx: 120 }); ink(() => { g.beginPath(); g.arc(0, -122, 12, 0, TAU); }, '#c8443a', { lw: 3, rim: false }); g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 50px Cinzel'; g.fillText('LEGEND', 0, -70); g.font = '700 32px Cinzel'; g.fillText('odd price =', 0, -8); g.fillText('open the till', 0, 38); g.fillText('for change', 0, 84);
    const st = seg(k, 4.6, 4.85); if (st > 0) { g.save(); g.translate(10, 10); g.rotate(-.16); const sc = lerp(2.2, 1, eo(st)); g.scale(sc, sc); g.globalAlpha = clamp(st * 2) * .92; g.strokeStyle = '#d8382c'; g.lineWidth = 9; g.strokeRect(-190, -54, 380, 108); g.fillStyle = '#d8382c'; g.font = '700 58px Cinzel'; g.fillText('UNPROVEN', 0, 6); g.restore(); } g.restore(); }
  // the cashier behind the counter (only the top half shows)
  const dr = ss(seg(k, 1.4, 1.9)); g.save(); g.translate(330, 1290); g.scale(1.0, 1.0); F.figure({ robe: '#7d5aa6', robeD: '#5f4383', robeL: '#9a7cc0', hat: 'paper', hatCol: TEAL, stache: true, expr: dr > .5 ? 'shock' : 'sly', look: dr > .5 ? .9 : .3, turn: dr > .5 ? .5 : .1, t, armF: -20 + 30 * dr, bendF: 10 }); g.restore();
  // counter: top surface + plank front
  ink(() => { g.beginPath(); g.moveTo(-100, 1000); g.lineTo(W + 100, 1000); g.lineTo(W + 100, 1080); g.lineTo(-100, 1080); g.closePath(); }, '#9a6a3e', { lw: 6, rim: false });
  ink(() => { g.beginPath(); g.rect(-100, 1080, W + 200, 1200); }, '#6b4428', { lw: 6, rim: false }); for (let x = -100; x < W + 100; x += 110) { g.strokeStyle = 'rgba(30,15,10,.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 1080); g.lineTo(x, 2280); g.stroke(); } g.strokeStyle = 'rgba(30,15,10,.6)'; g.lineWidth = 8; g.beginPath(); g.moveTo(-100, 1180); g.lineTo(W + 100, 1180); g.stroke();
  // brass till on the counter; drawer slides toward us, a coin pops
  g.save(); g.translate(-90, 0);
  ink(() => { g.beginPath(); g.roundRect(560, 700, 380, 300, 22); }, '#c9973e', { shade: '#a87a2c', sx: 820, lw: 6 }); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ink(() => { g.beginPath(); g.arc(620 + c * 86, 760 + r * 64, 24, 0, TAU); }, '#f3ead6', { lw: 3, rim: false });
  ink(() => { g.beginPath(); g.roundRect(690, 640 - 40 * back(seg(k, 1.4, 1.7), 2), 120, 60, 10); }, '#f3ead6', { lw: 4 }); g.fillStyle = INK; g.font = '700 34px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 750, 670 - 40 * back(seg(k, 1.4, 1.7), 2));
  ink(() => { g.beginPath(); g.rect(550 - 20 * dr, 990 + dr * 40, 400 + 40 * dr, 60 + dr * 40); }, '#a87a2c', { lw: 5 }); if (dr > 0) for (let i = 0; i < 3; i++) { g.fillStyle = '#f2d16b'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(640 + i * 110, 1040 + dr * 40, 34, 12, 0, 0, TAU); g.fill(); g.stroke(); }
  g.restore(); g.restore();
  // blurred foreground: a basket of loaves at the lower left, close to the lens
  g.save(); g.filter = 'blur(9px)'; g.translate(110, 1840); g.scale(2.2, 2.2); ink(() => { g.beginPath(); g.moveTo(-90, -40); g.lineTo(90, -40); g.lineTo(70, 40); g.lineTo(-70, 40); g.closePath(); }, '#b07a3c', { lw: 5, shade: '#8e5f2b', sx: 30 }); for (let i = 0; i < 3; i++) loaf(-50 + i * 50, -46, 1); g.restore();
  // candle on the counter + warm glow over everything
  ink(() => { g.beginPath(); g.roundRect(120, 840, 64, 170, 10); }, '#f3ead6', { lw: 4.5, shade: '#e0d2b4', sx: 160 }); const fl = 1 + .08 * Math.sin(k * 13);
  g.save(); g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(152, 810, 2, 152, 810, 520 * fl); cg.addColorStop(0, 'rgba(255,200,120,.7)'); cg.addColorStop(.5, 'rgba(255,150,70,.18)'); cg.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = cg; g.fillRect(-400, 300, 1100, 1100); g.restore(); g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(152, 816, 11 * fl, 24 * fl, 0, 0, TAU); g.fill();
}

// ---------------- shots ----------------
const SH = [
  [0, s(2) - .15, t => { camKeys(t, [[0, { x: 0, y: 190, z: 120, focus: 900, dof: 4 }], [1.6, { x: -30, y: 190, z: 160, focus: 900, dof: 4 }], [s(1) - .4, { x: 0, y: 200, z: 40, focus: 900, dof: 3 }], [s(1) + 1.0, { x: 0, y: 150, z: -700, focus: 1100, dof: 1.8 }], [s(2) - .15, { x: 60, y: 150, z: -580, focus: 1100, dof: 1.8 }]]); world(t, { sharpBoards: t < s(1) + .3, fg: -1, bk: [175, -40], walkIn: seg(t, s(1), s(1) + 1.8) }); }],
  [s(2) - .15, s(3) - .1, t => { camKeys(t, [[s(2) - .15, { x: -540, z: 520, focus: 530, dof: 7 }], [s(2) + 1.5, { x: -600, z: 640, focus: 420, dof: 7 }], [s(3), { x: -520, z: 600, focus: 460, dof: 7 }]]); world(t, { redTalk: 0, fg: -1 }); }],
  [s(3) - .1, s(4) - .1, t => { camKeys(t, [[s(3) - .1, { x: 600, z: 560, focus: 490, dof: 7 }], [s(3) + 1.8, { x: 520, z: 640, focus: 420, dof: 7 }], [s(4), { x: 560, z: 600, focus: 460, dof: 7 }]]); world(t, { fg: 1, tealExpr: 'smug' }); }],
  [s(4) - .1, s(5) - .1, t => { camKeys(t, [[s(4) - .1, { x: 0, y: 60, z: 260, focus: 560, dof: 7 }], [s(5), { x: 0, y: 70, z: 320, focus: 560, dof: 7 }]]); world(t, { fg: 1 });
    const sp = (t - s(4)) * 9; const p = proj(0, 0, 560); if (p) { g.save(); g.translate(p.x, p.y - 50 * p.k * Math.abs(Math.sin(sp * .3)) * (1 - seg(t, s(4) + .8, s(4) + 1.4))); coin(0, 0, p.k * 1.2, sp, t); g.restore(); } }],
  [s(5) - .1, s(7) - .2, t => { camKeys(t, [[s(5) - .1, { x: 158, y: 150, z: 380, focus: 520, dof: 6 }], [s(6), { x: 175, y: 160, z: 450, focus: 450, dof: 6 }], [s(7), { x: 150, y: 150, z: 430, focus: 470, dof: 6 }]]); const sweep = seg(t, s(5) + .4, s(5) + 2.0);
    world(t, { sharpBoards: true, fg: 1, emZ: 2600, boardO1: { glow: Math.min(3, Math.floor(sweep * 4)), glowK: sweep < 1 ? 1 : .6 + .4 * Math.sin(t * 4) } });
    if (t > s(6) - .1) { const k = back(seg(t, s(6), s(6) + .3), 2); g.save(); g.translate(300, 520); g.scale(k, k); ink(() => { g.beginPath(); g.ellipse(0, 0, 230, 110, 0, 0, TAU); }, '#fbf3df', { lw: 5 }); for (let i = 0; i < 3; i++) ink(() => { g.beginPath(); g.arc(150 - i * 40, 130 + i * 40, 18 - i * 4, 0, TAU); }, '#fbf3df', { lw: 4, rim: false }); g.fillStyle = INK; g.font = '700 60px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('2-something', 0, 4); g.restore(); } }],
  [s(7) - .2, s(9) - .2, t => blueprint(t, s(7) - .2)],
  [s(9) - .2, s(11) - .2, t => overhead(t, s(9) - .2)],
  [s(11) - .2, s(12) - .15, t => nightTill(t, s(11) - .2)],
  [s(12) - .15, s(13) - .15, t => { const u = seg(t, s(12), s(12) + 1.2); camKeys(t, [[s(12) - .15, { x: -360, z: 300, focus: 700, dof: 6 }], [s(13), { x: -380, z: 360, focus: 640, dof: 6 }]]);
    world(t, { mood: u < .5 ? 1 : 0, boards: ['2.99', '2.99'], prev: ['3.00', '2.99'], flip: seg(t, s(12) + 1.4, s(12) + 2.2), sharpBoards: true, redExpr: 'sly', fg: -1, bx: 330 }); if (u < 1) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5 * (1 - u); g.fillStyle = '#f3a46b'; g.fillRect(0, 0, W, H); g.restore(); } }],
  [s(13) - .15, s(14) - .15, t => { camKeys(t, [[s(13) - .15, { x: 0, z: -740, focus: 1100, dof: 1.8 }], [s(13) + 1.5, { x: -70, z: -660, focus: 1100, dof: 1.8 }], [s(14), { x: 50, z: -580, focus: 1100, dof: 1.8 }]]); world(t, { boards: ['2.99', '2.99'], redQ: 4, tealQ: 4, bird: seg(t, s(13) + 1.0, s(13) + 1.6), bk: [175, -40] }); }],
  [s(14) - .15, s(15) - .15, t => { camKeys(t, [[s(14) - .15, { x: -540, z: 200, focus: 600, dof: 6 }], [s(15), { x: -520, z: 280, focus: 520, dof: 6 }]]); world(t, { boards: ['10.00', '2.99'], sharpBoards: true, bk: [720, 800], bx: 470, boardO0: { unit: 'per cake' }, redExpr: 'smug', redO: { armF: -10, bendF: -40, cake: true }, fg: 1 }); }],
  [s(15) - .15, s(16) - .1, t => { camKeys(t, [[s(15) - .15, { x: 0, z: 460, focus: 440, dof: 6 }], [s(16), { x: 0, z: 520, focus: 380, dof: 6 }]]); world(t, { boards: ['2.99', '2.99'], redExpr: 'glare', tealExpr: 'glare', bk: [95, 900], bx: 330, fg: -1 }); }],
  [s(16) - .1, TOT + 1, t => { camKeys(t, [[s(16) - .1, { x: 0, y: 200, z: 20, focus: 900, dof: 3 }], [TOT, { x: 0, y: 190, z: 120, focus: 900, dof: 4 }]]); world(t, { boards: ['2.99', '2.99'], sharpBoards: true, fg: -1, bk: [175, -40] }); }],
];
function render(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const i = SH.findIndex(([a, b]) => t >= a && t < b); const [a, b, fn] = SH[i < 0 ? SH.length - 1 : i]; fn(t);
  // whip pan smear around the red→teal cut; light flash into the night till
  for (const wc of [s(3) - .1, s(13) - .15]) { const dw = Math.abs(t - wc); if (dw < .16) F.smear((1 - dw / .16) * 260); }
  const fc = s(11) - .2, df = Math.abs(t - fc); if (df < .2) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - df / .2) * .85; g.fillStyle = '#ffd9a0'; g.fillRect(0, 0, W, H); g.restore(); }
  F.post(t);
  F.captions(CAPS, t, 1330);
  const L = TOT - t; if (L < .35) { g.save(); g.globalAlpha = (1 - L / .35) * .35; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
}
window.DUR = TOT; window.__F = F; window.__world = world; window.__camKeys = camKeys;
window.seek = t => render(t);
window.render = window.seek;
window.thumb = () => { const t = 1.2; camKeys(t, [[0, { x: 0, y: 190, z: 120, focus: 900, dof: 4 }]]); g.setTransform(1, 0, 0, 1, 0, 0); world(t, { sharpBoards: true }); F.post(t);
  g.save(); g.font = '900 120px Nunito'; g.textAlign = 'center'; g.lineJoin = 'round'; g.strokeStyle = '#1a1420'; g.lineWidth = 18; g.strokeText('WHY .99?', 540, 330); g.fillStyle = '#fff'; g.fillText('WHY .99?', 540, 330); g.restore(); };
window.seek(0); window.ready = true; window.READY = true;
