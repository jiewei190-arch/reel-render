// t_daylightsleep.js: "Why does the time change mess with your sleep?" in template #6 shadow-puppet (lemo-opuscar shadow-puppet grammar).
// 1080x1920 Canvas2D, deterministic. Backlit hide stage: dyed lace puppets on rods (wall clock, carved head with the SCN, sun, moon,
// walker on a hill, alarm clock, owl, car), cut-letter plaques carried on rods, the storyteller's lacquer placard for subtitles.
import { createSP, cfg, W, H, TAU, clamp, lerp, ramp, win, hash, mixc, DYE, dye, hidePiece, at, rod, inkText, plaque, tag, sun, moon, hill, circ, ring, ell, poly, star, trem, puppet, cutPlaque, stage, rivet, FONT } from './styles/shadowpuppet/shadowpuppet.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"')]);
cfg.hide = true;
const canvas = document.getElementById('c'), R = createSP(canvas), g = R.g;
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end;
const r = (i, d) => T(i) + d, ease = x => 1 - Math.pow(1 - clamp(x), 3);
const cam = (s, cx, cy, ty = 800) => R.cam(s, cx, cy, ty);
const GOLD = 'rgba(255,205,110,1)';
const label = (t, ti, fn) => { const k = ramp(t, ti, ti + .45); if (k > 0) { g.save(); g.globalAlpha *= k; fn(k); g.restore(); } };

// ---------- puppets ----------
// wall clock: lace face with 12 holes, hands as dyed strips; hA/mA in radians from 12 o'clock
function wallClock(x, y, Rr, t, hA, mA, o = {}) {
  const j = trem(x * .01 + 3, t, 1.4);
  at(g, x + j[0], y + j[1], .02 * Math.sin(t * .9 + x), 1, () => {
    hidePiece(g, p => { circ(p, 0, 0, Rr); ring(p, Rr * .84, Rr * .84 + 6); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; circ(p, Math.sin(a) * Rr * .72, -Math.cos(a) * Rr * .72, i % 3 ? Rr * .035 : Rr * .065); } for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + .13; circ(p, Math.sin(a) * Rr * .93, -Math.cos(a) * Rr * .93, Rr * .025); } },
      o.cols || DYE.card, { r: Rr, edge: '#7a3a14' });
    const hand = (L, w, a, cols) => dye(g, p => { const s = Math.sin(a), c = -Math.cos(a), nx = -c, ny = s; poly(p, [[nx * w, ny * w], [s * L + nx * w * .4, c * L + ny * w * .4], [s * (L + 14), c * (L + 14)], [s * L - nx * w * .4, c * L - ny * w * .4], [-nx * w, -ny * w]]); }, cols, { edge: false });
    hand(Rr * .5, 13, hA, ['#2a120a']); hand(Rr * .72, 9, mA, ['#2a120a']); rivet(g, 0, 0, 12);
  });
  if (o.rod !== false) rod(g, x, y + Rr);
}
// carved profile head (ink silhouette, facing right) with a lace brain, the eye, and the SCN as a little clock dial
function head(x, y, s, t, o = {}) {
  const j = trem(x * .02 + 9, t, 1.2);
  at(g, x + j[0], y + j[1], .015 * Math.sin(t * .7), s, () => {
    hidePiece(g, p => { p.moveTo(-180, 130); p.bezierCurveTo(-240, -60, -130, -235, 30, -225); p.bezierCurveTo(160, -215, 222, -120, 210, -25); p.lineTo(250, 42); p.lineTo(212, 62); p.lineTo(222, 96); p.lineTo(202, 110); p.lineTo(206, 150); p.bezierCurveTo(160, 196, 70, 176, 50, 236); p.lineTo(50, 330); p.lineTo(-130, 330); p.lineTo(-118, 210); p.closePath();
      for (let i = 0; i < 9; i++) { const a = -2.6 + i * .32; ell(p, -10 + Math.cos(a) * 130, -40 + Math.sin(a) * 120, 22, 9, a + 1.57); }   // brain lace
      for (let i = 0; i < 6; i++) { const a = -2.4 + i * .42; ell(p, -10 + Math.cos(a) * 80, -40 + Math.sin(a) * 72, 15, 7, a + 1.57); }
      if (!o.closed) ell(p, 150, -28, 24, 11, 0); else { p.moveTo(126, -26); p.quadraticCurveTo(150, -14, 174, -26); p.quadraticCurveTo(150, -18, 126, -26); }   // eye
      circ(p, 40, 30, 44); }, DYE.ink, { r: 300, edge: '#07030c' });
    // the SCN: a small dial in the cut-out (gold lace), its hand turns slowly
    dye(g, p => { circ(p, 40, 30, 40); circ(p, 40, 30, 32); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; circ(p, 40 + Math.sin(a) * 24, 30 - Math.cos(a) * 24, 3.4); } }, DYE.sun, { r: 60, edge: '#8a3a12', hide: false });
    const a = o.scn ?? t * .1; dye(g, p => poly(p, [[40 - 3 * Math.cos(a), 30 - 3 * Math.sin(a)], [40 + Math.sin(a) * 26, 30 - Math.cos(a) * 26], [40 + 3 * Math.cos(a), 30 + 3 * Math.sin(a)]]), ['#3a1608'], { edge: false, hide: false });
  });
  R.glow(x + 40 * s, y + 30 * s, 90 * s, GOLD, (o.glow ?? .35) * g.globalAlpha);
}
// light beam from a point to the eye (dyed translucent wedge + moving motes)
function beam(x0, y0, x1, y1, w, t, a) { if (a <= 0) return; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  dye(g, p => poly(p, [[x0 + nx * w, y0 + ny * w], [x1 + nx * 6, y1 + ny * 6], [x1 - nx * 6, y1 - ny * 6], [x0 - nx * w, y0 - ny * w]]), DYE.sun, { a: .45 * a, edge: false, hide: false });
  for (let i = 0; i < 6; i++) { const u = (t * .8 + i / 6) % 1; R.glow(lerp(x0, x1, u), lerp(y0, y1, u), 40, GOLD, .5 * a * Math.sin(u * Math.PI) * g.globalAlpha); } }
function owl(x, y, s, t) { const j = trem(x * .03, t, 1.6); at(g, x + j[0], y + j[1], .04 * Math.sin(t * 1.3), s, () => {
  hidePiece(g, p => { ell(p, 0, 0, 70, 95, 0); poly(p, [[-62, -70], [-48, -128], [-26, -86]]); poly(p, [[62, -70], [48, -128], [26, -86]]); ring(p, 20, 30, -30, -40); ring(p, 20, 30, 30, -40); circ(p, -30, -40, 8); circ(p, 30, -40, 8); poly(p, [[-8, -16], [8, -16], [0, 2]]);
    for (let r2 = 0; r2 < 3; r2++) for (let c = 0; c < 4; c++) { const cx = -36 + c * 24 + (r2 % 2) * 12, cy = 24 + r2 * 20; p.moveTo(cx - 7, cy); p.quadraticCurveTo(cx, cy + 10, cx + 7, cy); p.quadraticCurveTo(cx, cy + 5, cx - 7, cy); } }, DYE.plum, { r: 100, edge: '#40122e' }); }); rod(g, x, y + 95 * s); }
function car(x, y, s, t) { const j = trem(x * .01, t, 1.0); at(g, x + j[0], y + j[1], 0, s, () => {
  hidePiece(g, p => { p.moveTo(-160, 0); p.lineTo(-150, -50); p.lineTo(-70, -60); p.lineTo(-30, -110); p.lineTo(70, -110); p.lineTo(110, -60); p.lineTo(160, -50); p.lineTo(165, 0); p.closePath(); poly(p, [[-20, -98], [40, -98], [40, -64], [-48, -64]]); poly(p, [[52, -98], [64, -98], [94, -64], [52, -64]]); circ(p, 150, -30, 10); }, DYE.red, { r: 160, edge: '#5a1010' });
  [-95, 95].forEach(wx => { hidePiece(g, p => { circ(p, wx, 6, 34); circ(p, wx, 6, 12); }, DYE.ink, { r: 40, edge: '#07030c' }); }); }); }
function alarm(x, y, s, t, ring2) { const sh = ring2 ? Math.sin(t * 40) * .08 : 0; at(g, x, y, sh, s, () => {
  wallClock(0, 0, 70, t, -2.1, 0, { rod: false, cols: DYE.red });
  hidePiece(g, p => { ell(p, -52, -66, 26, 18, -.6); ell(p, 52, -66, 26, 18, .6); poly(p, [[-46, 60], [-30, 60], [-48, 92], [-62, 92]]); poly(p, [[46, 60], [30, 60], [48, 92], [62, 92]]); }, DYE.red, { r: 80, edge: '#5a1010' });
  if (ring2) for (let i = 0; i < 3; i++) dye(g, p => { p.moveTo(-110 - i * 16, -90 + i * 10); p.lineTo(-96 - i * 16, -82 + i * 10); p.lineTo(-104 - i * 16, -96 + i * 10); p.closePath(); p.moveTo(110 + i * 16, -90 + i * 10); p.lineTo(96 + i * 16, -82 + i * 10); p.lineTo(104 + i * 16, -96 + i * 10); p.closePath(); }, ['#3a1608'], { edge: false }); });
  rod(g, x, y + 92 * s); }
// storyteller's placard, moved up into the caption band (y about 1150-1420) and clear of the right button column
function placard2(m, cap, a = 1, size = 48) {
  if (!cap || a <= 0) return; const segs = cap.split('**').map((s, i) => [s, i % 2 === 1]); const words = [];
  segs.forEach(([s, b]) => s.split(/(\s+)/).forEach(w => { if (w) words.push([w, b]); }));
  m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = a; m.font = `italic 700 ${size}px ${FONT}`; m.textBaseline = 'middle'; if ('letterSpacing' in m) m.letterSpacing = '0px';
  const maxW = 740, lines = [[]]; let lw = 0;
  words.forEach(([w, b]) => { const ww = m.measureText(w).width; if (lw + ww > maxW && !/^\s+$/.test(w) && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (!(lines[lines.length - 1].length === 0 && /^\s+$/.test(w))) { lines[lines.length - 1].push([w, b, ww]); lw += ww; } });
  const lh = size * 1.18, ph = lines.length * lh + 50, cy = 1250, y0 = cy - ph / 2, x0 = 70, pw = 820;
  m.fillStyle = 'rgba(20,10,6,.93)'; m.beginPath(); m.roundRect(x0, y0, pw, ph, 22); m.fill();
  m.strokeStyle = '#d9a441'; m.lineWidth = 3; m.beginPath(); m.roundRect(x0, y0, pw, ph, 22); m.stroke();
  m.strokeStyle = 'rgba(217,164,65,.55)'; m.lineWidth = 1.5; m.beginPath(); m.roundRect(x0 + 12, y0 + 12, pw - 24, ph - 24, 14); m.stroke();
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + w[2], 0); let x = x0 + pw / 2 - tw / 2; const y = y0 + 25 + lh * (i + .5); ln.forEach(([w, b, ww]) => { m.fillStyle = b ? '#ffc65a' : '#f6e6c6'; m.fillText(w, x, y); x += ww; }); });
  m.restore();
}

// ---------- scenes ----------
// p0-p1 hook: the wall clock's hands whirl back an hour; the sleeper's body clock (SCN dial) holds still
function sceneHook(t) {
  const a = 1 - ramp(t, E(1) + .1, E(1) + .6); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const spin = ease(ramp(t, 0, 2.6)), mA = -spin * TAU + .6 * Math.sin(t * .5) * 0, hA = 2.6 - spin * TAU / 12;
  R.glow(330, 700, 420, GOLD, .3 * a); wallClock(330, 700, 210, t, hA, mA + 0);
  head(820, 720, .78, t, { scn: .15 + .02 * Math.sin(t * 3), glow: .5 });
  label(t, .25, () => tag(g, 'wall clock', 330, 990, 40)); label(t, .55, () => tag(g, 'body clock', 840, 990, 40));
  cutPlaque(g, 540, 380, 900, 200, t < T(1) - .1 ? ['THE CLOCK CHANGED.', "YOUR BODY DIDN'T."] : ['WHY DOES IT MESS', 'WITH YOUR SLEEP?'], 62, t < T(1) - .1 ? 1 : ramp(t, T(1) - .1, T(1) + .5), { ls: 3 });
  g.restore();
}
// p2-p4: the master clock in the brain; sleepy cycle; light through the eye resets it
function sceneSCN(t) {
  const a = win(t, T(2) - .3, E(4) + .4, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const z = lerp(1.0, 1.12, ramp(t, T(2), E(4))); cam(z, 560, 760);
  const night = ramp(t, T(3) + .2, T(3) + 1.2) * (1 - ramp(t, T(4), T(4) + .8));
  head(600, 760, 1.25, t, { scn: t * .35, glow: .4 + .3 * Math.sin(t * 3) ** 2, closed: night > .5 });
  label(t, r(2, 1.6), () => { dye(g, p => poly(p, [[648, 640], [652, 640], [652, 520], [648, 520]]), ['#3a1608'], { edge: false }); tag(g, 'SCN: the master clock', 650, 470, 42); });
  // the 24 h dial: moon and sun ride a ring around the head
  if (t > T(3) - .2) { const k = ramp(t, T(3) - .2, T(3) + .4); g.save(); g.globalAlpha *= k; const ang = -Math.PI / 2 + ramp(t, T(3), E(3) + 1) * TAU * .5;
    dye(g, p => { circ(p, 600, 760, 430); circ(p, 600, 760, 424); }, ['#4a5f9a'], { edge: false, a: .7 });
    moon(g, 600 + Math.cos(ang) * 427, 760 + Math.sin(ang) * 427, 46, t); sun(g, 600 - Math.cos(ang) * 427, 760 - Math.sin(ang) * 427, 52, t);
    if (night > .3) for (let i = 0; i < 3; i++) { const u = (t * .6 + i / 3) % 1; inkText(g, 'z', 820 + i * 28 + u * 30, 560 - u * 90, 40 + i * 8, '#3a1608', { a: night * Math.sin(u * Math.PI) }); }
    tag(g, '≈ 24 hours', 600, 1080, 42); g.restore(); }
  // light: a sun puppet rises at the left, a beam enters the eye, the dial glows
  if (t > T(4) - .2) { const k = ramp(t, T(4) - .2, T(4) + .6), sx = 150, sy = lerp(900, 420, ease(k)); sun(g, sx, sy, 110, t); rod(g, sx, sy + 110); R.glow(sx, sy, 300, GOLD, .4 * k * a);
    beam(sx + 60, sy + 20, 600 + 150 * 1.25, 760 - 28 * 1.25, 60, t, ramp(t, T(4) + .5, T(4) + 1.1)); label(t, r(4, 1.3), () => cutPlaque(g, 300, 1060, 380, 110, ['LIGHT'], 64, 1)); }
  g.restore();
}
// p5: the wall clock jumps an hour in a blink; the body clock dial barely moves
function sceneJump(t) {
  const a = win(t, T(5) - .3, E(5) + .4, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const snap = ramp(t, r(5, .9), r(5, 1.05)); wallClock(300, 650, 200, t, 1.2 + snap * TAU / 12, snap * TAU); R.glow(300, 650, 360, GOLD, .25 * a);
  head(800, 700, .72, t, { scn: .4 + ramp(t, r(5, .9), r(5, 3.5)) * .06 });
  label(t, r(5, 1.0), () => cutPlaque(g, 300, 950, 360, 110, ['+1 HOUR'], 60, 1)); label(t, r(5, 2.1), () => tag(g, 'slow, with the light', 790, 960, 38));
  g.restore();
}
// p6-p7: 24 h 10 min; later = downhill, earlier = uphill (a walker on a hill)
function sceneTwist(t) {
  const a = win(t, T(6) - .3, E(7) + .4, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const a1 = 1 - ramp(t, T(7) - .3, T(7) + .1), a2 = ramp(t, T(7) - .1, T(7) + .4);
  if (a1 > 0) { g.save(); g.globalAlpha *= a1; const sweep = ease(ramp(t, r(6, .6), r(6, 4.6)));
    // 24 h dial with an overrun wedge (10 min = 1/144 of a day, drawn 6x for visibility)
    dye(g, p => { circ(p, 540, 700, 300); circ(p, 540, 700, 288); }, ['#4a5f9a'], { edge: false });
    dye(g, p => { p.moveTo(540, 700); p.arc(540, 700, 284, -Math.PI / 2, -Math.PI / 2 + sweep * TAU); p.closePath(); }, DYE.moon, { a: .55, edge: false });
    const over = ramp(t, r(6, 4.6), r(6, 5.6)); if (over > 0) dye(g, p => { p.moveTo(540, 700); p.arc(540, 700, 330, -Math.PI / 2, -Math.PI / 2 + over * .26); p.closePath(); }, DYE.red, { edge: '#7a1c1c' });
    for (let i = 0; i < 24; i++) { const an = i / 24 * TAU; dye(g, p => circ(p, 540 + Math.sin(an) * 262, 700 - Math.cos(an) * 262, i % 6 ? 4 : 8), ['#3a1608'], { edge: false }); }
    head(540, 720, .55, t, { scn: sweep * TAU });
    label(t, r(6, 4.7), () => cutPlaque(g, 540, 1110, 760, 130, ['24 h 10 min'], 76, 1)); g.restore(); }
  if (a2 > 0) { g.save(); g.globalAlpha *= a2; hill(g, 1040); dye(g, p => { p.moveTo(-100, 1040); p.quadraticCurveTo(540, 520, 1180, 1040); p.lineTo(1180, 1200); p.lineTo(-100, 1200); p.closePath(); }, DYE.green, { r: 600, edge: '#10321e' });
    const u = ramp(t, T(7) + .2, E(7) + .2), xd = lerp(600, 820, u), yd = 1040 - 260 * (1 - ((xd - 540) / 640) ** 2) + 6; puppet(g, xd, yd, 1.5, t, { tilt: .35, hand: [60, -200], hand2: [-40, -60] });
    const ux = lerp(250, 330, ramp(t, T(7) + 1.2, E(7) + .4)), uy = 1040 - 260 * (1 - ((ux - 540) / 640) ** 2) + 6; puppet(g, ux, uy, 1.5, t, { tilt: -.45, hand: [70, -120], hand2: [50, -90] });
    label(t, T(7) + .3, () => cutPlaque(g, 780, 320, 330, 110, ['LATER'], 60, 1)); label(t, T(7) + 1.4, () => cutPlaque(g, 290, 320, 360, 110, ['EARLIER'], 60, 1));
    label(t, T(7) + .8, () => tag(g, 'easy', 820, 1110, 44)); label(t, T(7) + 1.9, () => tag(g, 'hard', 260, 1110, 44)); g.restore(); }
  g.restore();
}
// p8: fall back (moonlit, extra hour) vs spring forward (alarm rings while it's still dark)
function sceneSeasons(t) {
  const a = win(t, T(8) - .3, E(8) + .4, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const split = ramp(t, r(8, 2.4), r(8, 2.9));
  // left: fall back
  g.save(); g.globalAlpha *= 1 - .55 * split; moon(g, 290, 520, 80, t); rod(g, 290, 600); owlBed(290, 900, t, false); cutPlaque(g, 290, 340, 400, 110, ['FALL BACK'], 56, ramp(t, T(8) + .1, T(8) + .6)); label(t, r(8, .8), () => tag(g, 'later: easy', 290, 1090, 38)); g.restore();
  // right: spring forward
  g.save(); g.globalAlpha *= split; R.dim = Math.max(R.dim, .25 * split * a); moon(g, 790, 520, 60, t, { dark: .3 }); rod(g, 790, 580); alarm(790, 840, 1.0, t, t > r(8, 3.2));
  cutPlaque(g, 790, 340, 460, 110, ['SPRING FORWARD'], 52, ramp(t, r(8, 2.5), r(8, 3.0))); label(t, r(8, 3.4), () => tag(g, 'still dark', 790, 1090, 38)); g.restore();
  g.restore();
}
function owlBed(x, y, t, awake) { at(g, x, y, 0, 1, () => { hidePiece(g, p => { p.roundRect(-160, -20, 320, 70, 14); poly(p, [[-170, -70], [-150, -70], [-150, 90], [-170, 90]]); poly(p, [[150, -40], [170, -40], [170, 90], [150, 90]]); }, DYE.card, { r: 170, edge: '#7a3a14' });
  hidePiece(g, p => { ell(p, -100, -42, 34, 26, 0); p.moveTo(-70, -30); p.quadraticCurveTo(40, -110, 150, -30); p.lineTo(150, -20); p.lineTo(-70, -20); p.closePath(); }, DYE.plum, { r: 150, edge: '#40122e' });
  for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; inkText(g, 'z', -80 + i * 26 + u * 20, -90 - u * 80, 36 + i * 6, '#3a1608', { a: Math.sin(u * Math.PI) }); } }); rod(g, x - 120, y + 50); rod(g, x + 120, y + 50); }
// p9: the study: owls (night owls) don't adjust after spring forward
function sceneStudy(t) {
  const a = win(t, T(9) - .3, E(9) + .4, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  cutPlaque(g, 540, 360, 800, 120, ['ONE STUDY'], 64, ramp(t, T(9) + .1, T(9) + .6));
  const rows = [['AUTUMN', 'shifted ✓', 560, 0], ['SPRING', 'not adjusted ✗', 860, 1.6]];
  rows.forEach(([s1, s2, y, d]) => { label(t, r(9, .5 + d), () => { tag(g, s1, 210, y, 42); for (let i = 0; i < 4; i++) { const ok = d === 0; const xx = 400 + i * 120, dy = ok ? Math.sin(t * 3 + i) * 6 : 0; puppet(g, xx, y + 90 + dy, .9, t, { tilt: ok ? 0 : .25, hand: ok ? [40, -230] : [30, -80], head: ok ? 0 : .3 }); } inkText(g, s2, 630, y + 130, 38, d ? '#7a1c1c' : '#1e4a2a', { ls: 1 }); }); });
  label(t, r(9, 4.4), () => { owl(830, 1000, .9, t); tag(g, 'night owls', 640, 1060, 38); });
  g.restore();
}
// p10-p11: the road: +6% fatal crashes the week after spring forward; none after fall back
function sceneRoad(t) {
  const a = win(t, T(10) - .3, E(11) + .4, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const fall = t > T(11) - .1; R.dim = Math.max(R.dim, (fall ? .05 : .35) * a);
  dye(g, p => { p.rect(-200, 900, 1500, 160); for (let i = 0; i < 9; i++) p.rect(-100 + ((i * 180 - t * 260) % 1620 + 1620) % 1620 - 200, 972, 90, 14); }, DYE.ink, { r: 600, edge: '#07030c' });
  car(lerp(1150, -150, ((t - T(10)) * .18) % 1), 900, .9, t); if (!fall) { moon(g, 860, 470, 54, t, { dark: .2 }); rod(g, 860, 524); } else { sun(g, 860, 470, 80, t); rod(g, 860, 550); R.glow(860, 470, 260, GOLD, .3 * a); }
  if (!fall) label(t, r(10, 2.4), () => { cutPlaque(g, 420, 520, 520, 220, ['+6%', 'fatal crashes'], 64, 1); tag(g, 'week after spring forward', 420, 760, 36); });
  else { cutPlaque(g, 420, 520, 520, 160, ['FALL BACK: no rise'], 54, ramp(t, T(11), T(11) + .5)); }
  label(t, r(10, 3.4), () => inkText(g, 'US, 1996–2017', 420, 1110, 32, '#3a1608', { ls: 2 }));
  g.restore();
}
// p12: payoff: the head follows the sun, not the wall clock (the clock puppet is pushed away)
function scenePayoff(t) {
  const a = win(t, T(12) - .3, E(12) + .4, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const cx = lerp(280, -60, ramp(t, r(12, 1.2), r(12, 2.6))); wallClock(cx, 640, 150, t, 2.1, t * 2);
  const sx = 860, sy = lerp(800, 470, ease(ramp(t, T(12), r(12, 1.6)))); sun(g, sx, sy, 110, t); rod(g, sx, sy + 110); R.glow(sx, sy, 320, GOLD, .45 * a);
  head(500, 760, 1.0, t, { scn: t * .4, glow: .7 });
  beam(sx - 70, sy + 30, 500 + 150, 760 - 28, 50, t, ramp(t, r(12, 1.0), r(12, 1.6)));
  label(t, r(12, 2.4), () => cutPlaque(g, 520, 1080, 760, 130, ['LIGHT, NOT THE CLOCK'], 58, 1));
  g.restore();
}
// p13: the sleep doctors: stop switching, standard time all year (a clock nailed in place)
function sceneAASM(t) {
  const a = win(t, T(13) - .3, E(13) + .4, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  wallClock(540, 720, 230, t, 0, 0); R.glow(540, 720, 380, GOLD, .3 * a);
  const nail = ramp(t, r(13, 1.4), r(13, 1.7)); if (nail > 0) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([u, v]) => rivet(g, 540 + u * 190, 720 + v * 190, 14 * nail));
  cutPlaque(g, 540, 380, 900, 140, ['SLEEP DOCTORS (AASM):'], 52, ramp(t, T(13) + .1, T(13) + .6));
  label(t, r(13, 1.8), () => cutPlaque(g, 540, 1060, 860, 130, ['STANDARD TIME, ALL YEAR'], 54, 1));
  g.restore();
}
// p14: the question
function sceneQ(t) {
  const a = win(t, T(14) - .3, E(14) + .3, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  cutPlaque(g, 300, 560, 380, 200, ['SPRING?'], 72, ramp(t, T(14) + .1, T(14) + .5)); cutPlaque(g, 780, 560, 380, 200, ['FALL?'], 72, ramp(t, T(14) + .5, T(14) + .9));
  alarm(300, 900, .9, t, true); moon(g, 780, 880, 70, t); rod(g, 780, 950);
  g.restore();
}
// p15 end: the hook clock and head return (loop), closing plaque
function sceneEnd(t) {
  const a = win(t, T(15) - .3, TL.total + 1, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  wallClock(300, 760, 170, t, 2.6, t * .3); head(800, 790, .62, t, { glow: .5 }); R.glow(300, 760, 340, GOLD, .3 * a);
  cutPlaque(g, 540, 400, 900, 230, ['Follow for more of', 'how it really works.'], 64, ramp(t, T(15) + .1, T(15) + .8), { ls: 3 });
  label(t, T(15) + .9, () => { inkText(g, "A new 'wait, really?' every day.", 540, 1050, 46, '#2a120a', { ls: 1 }); inkText(g, '@howitreallyworkstudio', 540, 1120, 34, '#5a2a1a', { ls: 2 }); });
  g.restore();
}
const kStage = t => 1 - ramp(t, 2.2, 3.4);
function scene(t) { R.dim = 0; R.hot = [540, 820]; sceneHook(t); sceneSCN(t); sceneJump(t); sceneTwist(t); sceneSeasons(t); sceneStudy(t); sceneRoad(t); scenePayoff(t); sceneAASM(t); sceneQ(t); sceneEnd(t); }
function subtitle(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1] ? PH[cur + 1].start - .05 : p.end + .6, a = ramp(t, p.start - .05, p.start + .15) * (1 - ramp(t, Math.min(nx, p.end + .8) - .1, Math.min(nx, p.end + .8)));
  placard2(R.main, p.cap, a);
}
window.DUR = TL.total;
window.seek = t => { R.begin(t); scene(t); R.finish(); stage(R.main, kStage(t), t); subtitle(t);
  // loop: the last 0.5 s fades toward the warm lamp (at most 40%), so the replay's clock frame flows on
  const L = ramp(t, TL.total - .5, TL.total); if (L > 0) { const m = R.main; m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = .4 * L; m.fillStyle = '#ffd98a'; m.fillRect(0, 0, W, H); m.restore(); } };
window.render = window.seek;
// thumbnail / cover (rule 11): the clock against the head, big carved plaque
window.thumb = () => { const t = 1.4; R.begin(t); R.hot = [540, 820]; cam(1, 540, 800); wallClock(320, 1000, 230, t, 2.3, -1.2); R.glow(320, 1000, 420, GOLD, .35); head(820, 1010, .85, t, { glow: .6 });
  cutPlaque(g, 540, 520, 940, 300, ['THE TIME CHANGE', 'vs YOUR SLEEP'], 80, 1, { ls: 3 }); R.finish(); };
window.seek(0); window.ready = true; window.READY = true;
