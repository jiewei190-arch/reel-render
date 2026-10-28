// t_darkeyes.js: "Why the dark gets less dark after a few minutes" (dark adaptation) in template #16 cinematic3d "Christmas story" (demo99).
// Reuses the cinefilm module (film gate, grain, flicker, sepia/blue grade, silhouettes, warm windows, word-by-word italic caption).
// Metaphor: the retina is a little night village. Cones = a few tall towers with coloured windows; rods = many small cottages; rhodopsin = the lit windows.
import { createFilm, W, H, clamp, lerp, ramp, ss, eo, hash } from './styles/cinefilm/cinefilm.js';
await document.fonts.load('italic 600 54px "Playfair Display"');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const F = createFilm(document.getElementById('c')), g = F.g, R = ramp, TAU = Math.PI * 2;
const INK = '#14110e';

// ---------- props ----------
function house(x, y, sc, o = {}) {   // the demo's cottage: pitched roof with a pale edge, chimney, porch
  g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = INK;
  g.fillRect(-200, -260, 400, 260); g.beginPath(); g.moveTo(-240, -250); g.lineTo(0, -430); g.lineTo(240, -250); g.closePath(); g.fill(); g.fillRect(110, -420, 46, 110);
  g.strokeStyle = 'rgba(240,226,200,.85)'; g.lineWidth = 9; g.beginPath(); g.moveTo(-246, -246); g.lineTo(0, -434); g.lineTo(246, -246); g.stroke();
  g.fillRect(-330, -170, 140, 12); g.fillRect(-326, -170, 10, 170); g.fillRect(-206, -170, 10, 170);   // porch
  g.restore(); }
const winRect = (x, y, sc) => [x - 70 * sc, y - 210 * sc, 140 * sc, 120 * sc];
function person(x, y, sc, reach = 0) { g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = INK; g.beginPath(); g.arc(0, -150, 22, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-26, -122); g.lineTo(26, -122); g.lineTo(34, 0); g.lineTo(-34, 0); g.closePath(); g.fill();
  g.lineWidth = 12; g.lineCap = 'round'; g.strokeStyle = INK; g.beginPath(); g.moveTo(18, -110); g.lineTo(18 + 40 * reach, -110 - 50 * reach); g.stroke(); g.restore(); }
function tree(x, y, h) { g.fillStyle = INK; for (let k = 0; k < 3; k++) { const w = h * (.5 - k * .1), yy = y - k * h * .28; g.beginPath(); g.moveTo(x - w / 2, yy); g.lineTo(x, yy - h * .45); g.lineTo(x + w / 2, yy); g.fill(); } g.fillRect(x - 8, y, 16, 30); }
function pumpkin(x, y, r) { g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, r * 1.2, r, 0, 0, TAU); g.fill(); g.fillRect(x - 5, y - r - 14, 10, 18); }
function pumpkinGlow(x, y, r, k) { if (k <= 0) return; g.save(); g.fillStyle = `rgba(255,190,90,${k})`; [[-.45, -.2], [.45, -.2]].forEach(([a, b]) => { g.beginPath(); g.moveTo(x + a * r - 12, y + b * r + 10); g.lineTo(x + a * r, y + b * r - 12); g.lineTo(x + a * r + 12, y + b * r + 10); g.fill(); }); g.beginPath(); g.ellipse(x, y + .35 * r, r * .55, r * .18, 0, 0, Math.PI); g.fill(); g.restore(); F.glow(x, y, r * .7, k * .8); }
function bat(x, y, sc, t) { const f = Math.sin(t * 14) * .5; g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = INK; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-30, -30 * f - 10, -60, 0 - 10 * f); g.quadraticCurveTo(-30, 0, 0, 10); g.quadraticCurveTo(30, 0, 60, -10 * f); g.quadraticCurveTo(30, -30 * f - 10, 0, 0); g.fill(); g.restore(); }
function ground(y) { g.fillStyle = '#2a2622'; g.fillRect(-100, y, W + 200, H); }
function nightSky(t, y1, light = .4) { const gr = g.createLinearGradient(0, 0, 0, y1); gr.addColorStop(0, '#15120f'); gr.addColorStop(1, light > .5 ? '#6e6052' : '#4a4038'); g.fillStyle = gr; g.fillRect(-100, -100, W + 200, y1 + 100); }
// a glowing clock face (the demo's wall clock), minutes hand runs through the time-lapse
function clock(x, y, r, mins, k = 1) { if (k <= 0) return; g.save(); g.globalAlpha = k; g.fillStyle = '#ffe9c0'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = r * .08; g.stroke(); g.lineWidth = r * .04; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.moveTo(x + Math.cos(a) * r * .76, y + Math.sin(a) * r * .76); g.lineTo(x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9); g.stroke(); }
  const am = mins / 60 * TAU - Math.PI / 2, ah = (9 + mins / 60) / 12 * TAU - Math.PI / 2; g.lineWidth = r * .07; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ah) * r * .45, y + Math.sin(ah) * r * .45); g.stroke(); g.lineWidth = r * .045; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(am) * r * .7, y + Math.sin(am) * r * .7); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(x, y, r * .07, 0, TAU); g.fill(); g.restore(); F.glow(x, y, r * .8, .5 * k); }
// the retina village: cone towers (centre) and rod cottages (mostly around the edges)
const RODS = Array.from({ length: 46 }, (_, i) => { const side = i % 2 ? 1 : -1, d = 170 + Math.pow(hash(i * 3.1), .6) * 380; return { x: 540 + side * d, y: 1330 - hash(i * 5.7) * 160, s: .5 + hash(i * 7.3) * .35 }; }).sort((a, b) => a.y - b.y);
const CONES = [[430, 1300, '#ff7a5a'], [500, 1290, '#7ad0ff'], [560, 1310, '#9cff7a'], [620, 1290, '#ff7a5a'], [660, 1310, '#7ad0ff']];
function village(t, o = {}) { const { coneK = 0, rodK = 0, rodN = 46, coneCol = true } = o; const VS = 1.4; g.save(); g.translate(540, 1340); g.scale(VS, VS); g.translate(-540, -1340);
  CONES.forEach(([x, y]) => { g.fillStyle = INK; g.fillRect(x - 22, y - 230, 44, 230); g.beginPath(); g.moveTo(x - 30, y - 226); g.lineTo(x, y - 270); g.lineTo(x + 30, y - 226); g.fill(); });
  RODS.forEach(r => { g.save(); g.translate(r.x, r.y); g.scale(r.s, r.s); g.fillStyle = INK; g.fillRect(-36, -60, 72, 60); g.beginPath(); g.moveTo(-44, -56); g.lineTo(0, -96); g.lineTo(44, -56); g.fill(); g.restore(); }); g.restore();
  return () => { g.save(); g.translate(540, 1340); g.scale(VS, VS); g.translate(-540, -1340); CONES.forEach(([x, y, c], i) => { for (let k = 0; k < 4; k++) F.window(x - 10, y - 200 + k * 48, 20, 26, coneK, { col: coneCol ? c : '#ffe2a8', cross: false }); });
    RODS.forEach((r, i) => { if (i >= rodN) return; const k = clamp(rodK * 1.3 - hash(i * 9.1) * .3); F.window(r.x - 12 * r.s, r.y - 44 * r.s, 24 * r.s, 22 * r.s, k, { cross: false }); }); g.restore(); }; }
function bigEye(cx, cy, r, t, o = {}) {   // side-view eyeball silhouette: cornea bulge left, retina band at the back (right)
  g.save(); g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.beginPath(); g.ellipse(cx - r * .92, cy, r * .22, r * .45, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(240,226,200,.5)'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); g.restore();
  return () => { g.save(); g.strokeStyle = `rgba(255,214,140,${o.retina ?? .9})`; g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, r * .86, -1.1, 1.1); g.stroke(); g.restore(); F.glow(cx + r * .8, cy, r * .3, (o.retina ?? .9) * .5);
    g.save(); g.fillStyle = '#ffe9c0'; g.globalAlpha = .9; g.beginPath(); g.ellipse(cx - r * .72, cy, r * .1, r * .3, 0, 0, TAU); g.fill(); g.restore();   // lens
    if (o.ray) { const u = (t * .6) % 1; g.save(); g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 4; g.setLineDash([18, 14]); g.lineDashOffset = -t * 60; g.beginPath(); g.moveTo(cx - r * 1.6, cy - 40); g.lineTo(cx + r * .82, cy + 10); g.stroke(); g.restore(); } }; }

// ---------- shots ----------
const SH = [[0, s(2) - .15, 'room'], [s(2) - .15, s(7) - .15, 'retina'], [s(7) - .15, s(9) - .15, 'pigment'], [s(9) - .15, s(13) - .15, 'curve'], [s(13) - .15, s(16) - .15, 'flash'], [s(16) - .15, s(17) - .15, 'grey'], [s(17) - .15, s(18) - .15, 'porch'], [s(18) - .15, TL.total + 1, 'end']];
const shotAt = t => SH.find(x => t >= x[0] && t < x[1]) || SH[SH.length - 1];
let GRADE = 1, DARK = 0;   // grade: 0 sepia/grey .. 1 blue-lavender night; DARK: extra darkness of the not-yet-adapted eye

const SCN = {
  room(t) {   // frame 0: the lit window, a hand on the lamp; lights off at .5 s; then the time-lapse as the eyes adapt
    const off = ss(R(t, .45, .15)), adapt = ss(R(t, s(1) + .2, e(1) - s(1) + .2)), dx = t * 6;
    DARK = off * (1 - adapt) * .68; GRADE = 1;
    nightSky(t, 1300); F.stars(t, 130, 1150); ground(1300); tree(140 - dx, 1300, 380); tree(980 - dx * .7, 1300, 300); house(560 - dx * .5, 1300, 1.25); pumpkin(270 - dx * .5, 1270, 30); [0, 1].forEach(i => bat(200 + i * 520 + Math.sin(t + i) * 40, 380 + i * 90, .9, t + i));
    const [wx, wy, ww, wh] = winRect(560 - dx * .5, 1300, 1.25);
    return () => { F.window(wx, wy, ww, wh, 1 - off); if (off < 1) person(wx + ww * .4, wy + wh + 10, .55, ss(R(t, 0, .4))); pumpkinGlow(270 - dx * .5, 1270, 30, (1 - off) * .9 + adapt * .3);
      clock(900, 360, 90, adapt * 22, ss(R(t, s(1) - .1, .4))); };
  },
  retina(t) {  // two kinds of light cells: zoom from a big eye silhouette into the retina village
    GRADE = t < s(4) - .2 ? 0 : 1; DARK = 0;
    const toV = ss(R(t, s(3) - .6, .7));
    if (toV < 1) { nightSky(t, 1400, 1); ground(1400); const z = lerp(1, 2.6, toV); g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540 - toV * 300, -900); const gp = bigEye(540, 900, 300, t, { ray: true }); g.restore(); return () => { g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540 - toV * 300, -900); gp(); g.restore(); if (toV > .5) { g.fillStyle = `rgba(0,0,0,${(toV - .5) * 2})`; g.fillRect(0, 0, W, H); } }; }
    const day = t < s(4) - .2; nightSky(t, 1400, day ? 1 : .3); if (!day) { F.stars(t, 120, 1000); F.circ(820, 380, 70, '#e8dcc0'); } else { F.circ(820, 380, 90, '#f6e6bf'); } ground(1340);
    const gp = village(t, { coneK: day ? ss(R(t, s(3) - .1, .5)) : .12, rodK: day ? 0 : ss(R(t, s(4) + .4, 1.4)), rodN: t > s(5) ? 46 : t > s(4) + 1.2 ? 30 : 1 });
    return () => { gp(); if (day) F.glow(820, 380, 90, .6);
      if (!day && t > s(4) + .8 && t < s(5)) { const u = clamp((t - s(4) - .8) / 1.4); const r = RODS[0]; F.circ(lerp(540, r.x, u), lerp(300, r.y - 50, u), 6, '#fff6d8'); F.glow(lerp(540, r.x, u), lerp(300, r.y - 50, u), 8, 1); }
      if (t > s(6)) { const k = ss(R(t, s(6), .5)); g.save(); g.globalAlpha = k * .9; g.strokeStyle = '#f0dca8'; g.lineWidth = 3; g.setLineDash([10, 10]); g.beginPath(); g.moveTo(360, 900); g.lineTo(360, 1380); g.moveTo(730, 900); g.lineTo(730, 1380); g.stroke(); g.restore(); label('cones: centre', 545, 820, k); label('rods: the edges', 540, 700, k); }
      if (t > s(5) + .3 && t < s(6)) label('≈ 100,000,000 rods', 540, 700, ss(R(t, s(5) + .3, .5))); if (day && t > s(3)) label('cones', 545, 760, ss(R(t, s(3), .5))); if (!day && t > s(4) && t < s(5)) label('rods', 540, 700, ss(R(t, s(4), .5))); };
  },
  pigment(t) { // inside one rod: stacked discs = floors, rhodopsin = lit windows; a sun-flash bleaches them, then they relight one by one
    GRADE = 1; DARK = 0; const bleach = ss(R(t, s(7) + .9, .25)), rebuild = R(t, s(8) + .2, e(8) - s(8) + .4);
    nightSky(t, 1500, .3); F.stars(t, 90, 1100); ground(1500);
    g.fillStyle = INK; g.beginPath(); g.roundRect(330, 330, 420, 1180, 60); g.fill(); g.strokeStyle = 'rgba(240,226,200,.5)'; g.lineWidth = 5; g.stroke();
    const N = 9, M = 5;
    return () => { for (let r = 0; r < N; r++) for (let c = 0; c < M; c++) { const i = r * M + c, lit = t < s(7) + .9 ? 1 : 1 - bleach + clamp(rebuild * 1.25 - hash(i * 4.3) * .35) * bleach; F.window(375 + c * 72, 400 + r * 118, 46, 54, clamp(lit) * .95, { cross: false }); }
      if (t > s(7) + .7 && t < s(7) + 1.4) { const k = 1 - Math.abs(t - s(7) - 1.0) / .4; g.fillStyle = `rgba(255,250,235,${clamp(k) * .85})`; g.fillRect(0, 0, W, H); }
      label('rhodopsin', 540, 290, ss(R(t, s(7) + .2, .5))); if (t > s(8)) label('rebuilding…', 540, 1590, ss(R(t, s(8), .5)) * (1 - ss(R(t, s(9) - .5, .3)))); };
  },
  curve(t) {  // the time-lapse: a big clock; cone towers recover first (~10 min), then the rod cottages keep brightening; pupils widen ~10x
    GRADE = 1; DARK = 0; const mins = lerp(0, 30, ss(R(t, s(9), e(11) - s(9)))), pupil = t > s(12) - .1;
    if (!pupil) { nightSky(t, 1400, .3); F.stars(t, Math.round(40 + mins * 4), 1000); ground(1340);
      const gp = village(t, { coneK: clamp(mins / 10), rodK: clamp((mins - 8) / 22), coneCol: false }); return () => { gp(); clock(540, 520, 190, mins); const mult = mins < 10 ? 'cones: ready' : '×' + Math.pow(10, Math.max(1, Math.floor(lerp(1, 6.99, clamp((mins - 8) / 22))))).toLocaleString('en-US'); label(mult, 540, 800, 1, 72); }; }
    // pupil close-up: iris ring opening
    nightSky(t, 1900, .2); const k = ss(R(t, s(12), 1.4)), pr = lerp(70, 210, k);
    g.fillStyle = INK; g.beginPath(); g.ellipse(540, 900, 440, 260, 0, 0, TAU); g.fill();
    return () => { g.save(); g.fillStyle = '#a99a7a'; g.beginPath(); g.arc(540, 900, 250, 0, TAU); g.arc(540, 900, pr, 0, TAU, true); g.fill('evenodd'); g.restore(); F.glow(600, 840, 30, .4); label('pupil: only about ×10', 540, 1300, ss(R(t, s(12) + 1, .5)), 56); };
  },
  flash(t) {  // one flash bleaches everything; ship's bridge rigged for red; the rods' village stays lit under red light
    GRADE = 1; DARK = 0; const bridge = t > s(14) - .1;
    if (!bridge) { nightSky(t, 1400, .3); F.stars(t, 120, 1000); ground(1340); const fl = R(t, s(13) + 1.0, .2), after = ss(R(t, s(13) + 1.1, .3)); const gp = village(t, { coneK: 1 - after, rodK: 1 - after * .95, coneCol: false });
      return () => { gp(); const k = 1 - Math.abs(t - s(13) - 1.1) / .25; if (k > 0) { g.fillStyle = `rgba(255,252,240,${clamp(k) * .9})`; g.fillRect(0, 0, W, H); } F.circ(540, 520, 30, '#fff', after < 1 ? 1 - after : 0); label('flash!', 540, 640, clamp(k * 2)); }; }
    // ship's bridge at night: big window to the starry sea, a lookout, a red lamp
    nightSky(t, 1200, .4); F.stars(t, 140, 1100); g.fillStyle = '#3a342c'; g.fillRect(-100, 1080, W + 200, 200); ground(1250);
    g.fillStyle = INK; g.fillRect(0, 0, W, 300); g.fillRect(0, 1180, W, 800); g.fillRect(0, 0, 90, H); g.fillRect(W - 90, 0, 90, H); for (const x of [380, 700]) g.fillRect(x - 12, 280, 24, 920);
    person(560, 1260, 1.6, 0); g.fillRect(150, 1100, 260, 80);
    const rodsOk = t > s(15);
    return () => { const lx = 230, ly = 1080; F.circ(lx, ly, 22, '#ff5a3a'); F.glow(lx, ly, 40, 1, '255,70,40'); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,40,20,.10)'; g.fillRect(0, 0, W, H); g.restore();
      label('rigged for red', 540, 400, ss(R(t, s(14), .5))); if (rodsOk) label('rods: still dark-adapted', 540, 1440, ss(R(t, s(15) + .4, .5)), 50); };
  },
  grey(t) {   // rods don't do colour: the night village drains to grey (the film's own sepia monochrome)
    DARK = 0; const k = ss(R(t, s(16) + .3, 1.6)); GRADE = 1 - k;
    nightSky(t, 1300, .5); F.stars(t, 120, 1100); ground(1300); house(560, 1300, 1.1); tree(150, 1300, 340); tree(960, 1300, 280); pumpkin(270, 1270, 30);
    return () => { const [wx, wy, ww, wh] = winRect(560, 1300, 1.1); F.window(wx, wy, ww, wh, .25 * (1 - k)); label('no colour at night', 540, 520, k); };
  },
  porch(t) {  // the question: a figure on the porch bench in the dark, a jack-o'-lantern, a shooting star
    DARK = 0; GRADE = 1; const dx = (t - s(17)) * 10;
    nightSky(t, 1300, .5); F.stars(t, 160, 1150); ground(1300); house(640 - dx, 1300, 1.2); tree(130 - dx * .6, 1300, 360); g.fillStyle = INK; g.fillRect(150 - dx, 1210, 200, 14); g.fillRect(160 - dx, 1224, 10, 76); g.fillRect(330 - dx, 1224, 10, 76); person(250 - dx, 1215, .8, 0); pumpkin(420 - dx, 1270, 30); bat(820, 420, .9, t);
    return () => { pumpkinGlow(420 - dx, 1270, 30, .9); F.shooting(t, s(17) + .6, 900, 260); clock(870, 640, 70, 20, .9); };
  },
  end(t) { DARK = 0; GRADE = 0; g.fillStyle = '#0e0c0a'; g.fillRect(0, 0, W, H); return () => { const k = ss(R(t, s(18) - .1, .6)); const r = 16; g.save(); g.globalAlpha = k; g.fillStyle = '#f0dca8'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(540 + Math.cos(a) * rr, 820 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); F.glow(540, 820, 12, k * .6);
    g.save(); g.textAlign = 'center'; g.font = 'italic 600 74px "Playfair Display"'; g.fillStyle = '#f0dca8'; g.globalAlpha = k; g.fillText('Follow for more of', 540, 960); g.globalAlpha = ss(R(t, s(18) + .3, .6)); g.fillText('how it really works.', 540, 1060); g.font = 'italic 400 38px "Playfair Display"'; g.globalAlpha = ss(R(t, s(18) + .9, .6)) * .8; g.fillText('@howitreallyworkstudio', 540, 1160); g.restore(); }; },
};
function label(txt, x, y, k, size = 60) { if (k <= 0) return; g.save(); g.font = `italic 600 ${size}px "Playfair Display"`; g.textAlign = 'center'; g.fillStyle = '#f0dca8'; g.globalAlpha = clamp(k); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 12; g.fillText(txt, x, y); g.restore(); }
function bigCap(str, a, size = 104) { if (a <= 0) return; g.save(); g.textAlign = 'center'; g.font = `italic 700 ${size}px "Playfair Display"`; g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 18; g.fillStyle = '#f6e6bf'; g.fillText(str, 540, 330); g.restore(); }

function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [a, b, name] = shotAt(t), [wx, wy] = F.weave(t);
  g.save(); g.translate(wx, wy); const glowPass = SCN[name](t); g.restore();
  F.grade(GRADE);
  if (DARK > 0) { g.fillStyle = `rgba(0,0,0,${DARK})`; g.fillRect(0, 0, W, H); }
  g.save(); g.translate(wx, wy); glowPass(); g.restore();
  const fi = name === 'room' ? 1 : ss(R(t, a, .3)), fo = 1 - ss(R(t, b - .3, .3)); const dip = Math.min(fi, fo); if (dip < 1) { g.fillStyle = `rgba(0,0,0,${(1 - dip) * .85})`; g.fillRect(0, 0, W, H); }
  // burned-in hook captions (HOOKS.md), then the demo's band + word-by-word italic line
  if (t < s(2) - .2) bigCap(t < s(1) - .05 ? 'Lights off. Nothing.' : 'Now wait…', t < s(1) - .05 ? 1 : ss(R(t, s(1) - .05, .25)));
  if (name !== 'end') { F.band(t, 1585); let ci = 0; PH.forEach((p, k) => { if (t >= p.start - .1) ci = k; }); F.caption(PH[ci].cap.replace(/\*\*/g, ''), t - PH[ci].start + .1, { y: 1712, size: 60, wps: 4.4 }); }
  F.film(t);
}
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, (TL.total - t) / .5); if (fade < 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(0,0,0,${1 - fade})`; g.fillRect(0, 0, W, H); } };
window.render = window.seek;
// thumbnail / cover (rule 11): the night house half-adapted, glowing clock, hook text inside y 300-1620
window.thumb = () => { const t = 4.6; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gp = SCN.room(t); F.grade(1); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, W, H); gp(); F.band(t, 1585);
  g.save(); g.textAlign = 'center'; g.font = 'italic 700 150px "Playfair Display"'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 20; g.fillStyle = '#f6e6bf'; g.fillText('Wait 20', 540, 560); g.fillText('minutes.', 540, 720); g.restore(); F.caption('Why the dark gets less dark.', 9, { y: 1712, size: 60 }); F.film(t); };
window.seek(0); window.ready = true; window.READY = true;
