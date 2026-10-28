// t_cricketchirp.js: "Can you tell the temperature from cricket chirps?" in template #1 paper-lantern (Paper-cut Lightbox), same module as gps/foxfire.
// Every shot is one lit shadow box: baked cut-paper layers (back light -> front dark, backlight + pulp mottle, cast shadows, a blurred front layer),
// emissive light (here: the chirps as glowing sound arcs, the lantern, the moon), paper strips that grow from an edge, handwritten tags,
// a vertical title strip with a red seal, paper-on-a-stick motion and dissolves.
// Batch N layout (as gps): the lamp window is y 270-1130 (BOX override); captions on the dark room below at y 1180-1400; the bottom 480 px is
// only the table and the lamp's spill light; nothing written in the right column below y 840.
import { createLantern, W, H, BOX, PAL, clamp, lerp, seg, ss, eo, backOut, hash, glow, rr, subtitle, tag, makeSheet, putSheet,
  layer, put, lampFrame, vignette, strip, vstrip, sealMark, bloom, flick } from './styles/lantern/lantern.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"'), document.fonts.load('700 40px Caveat')]);
BOX.y = 270; BOX.h = 860;
const g = createLantern(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, r = (i, d) => T(i) + d, TOT = TL.total;
const BW = BOX.w, BH = BOX.h, TAU = Math.PI * 2;
const win = (t, a, b, f = .45) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const WARM = '255,190,110', COOL = '150,190,255', CHIRP = '255,226,150';

// ---------- baked paper layers (box-local) ----------
const NIGHT = { light: [700, 160], lightCol: '170,190,255' };
function hillsP(g2, y, amp, n, ph = 1) { g2.beginPath(); g2.moveTo(-100, BH + 100); for (let x = -100; x <= 1100; x += 20) g2.lineTo(x, y - amp * Math.sin(x / 1000 * Math.PI * n + ph)); g2.lineTo(1100, BH + 100); g2.fill(); }
function grassP(g2, y0, n, hmin, hmax, seed) { g2.beginPath(); g2.moveTo(-100, BH + 100); g2.lineTo(-100, y0); for (let i = 0; i < n; i++) { const x = -80 + i * (1200 / n), h = hmin + (hmax - hmin) * hash(i * 1.7 + seed), lean = (hash(i + seed) - .5) * 40;
    g2.lineTo(x + 6, y0); g2.lineTo(x + 12 + lean, y0 - h); g2.lineTo(x + 18, y0); } g2.lineTo(1100, y0); g2.lineTo(1100, BH + 100); g2.fill(); }
function branchP(g2) { g2.lineCap = 'round'; g2.lineWidth = 26; g2.strokeStyle = '#000'; g2.beginPath(); g2.moveTo(-60, 230); g2.bezierCurveTo(260, 180, 480, 280, 700, 240); g2.stroke(); g2.lineWidth = 12; g2.beginPath(); g2.moveTo(380, 230); g2.lineTo(470, 130); g2.stroke();
  [[120, 200, .3], [260, 215, -.4], [420, 140, .8], [560, 260, -.2], [650, 225, .5], [300, 240, 2.6]].forEach(([x, y, a]) => { g2.save(); g2.translate(x, y); g2.rotate(a); g2.beginPath(); g2.ellipse(0, 40, 26, 62, 0, 0, TAU); g2.fill(); g2.restore(); }); }
const L = {
  hillsFar: layer(g2 => hillsP(g2, 560, 50, 1.6), { col: '#3b4a8e', trans: .8, ...NIGHT }),
  hills: layer(g2 => hillsP(g2, 640, 40, 2.4, 2), { col: '#26326b', trans: .5, ...NIGHT }),
  grass: layer(g2 => grassP(g2, 760, 60, 60, 190, 3), { col: '#16204a', trans: .25, ...NIGHT }),
  branch: layer(branchP, { col: '#1a2350', trans: .3, ...NIGHT }),
  front: layer(g2 => { grassP(g2, BH + 10, 40, 120, 300, 9); }, { col: '#070a1c', trans: 0, blur: 3 }),
  porch: layer(g2 => { g2.fillRect(-100, 700, 1200, 300); g2.fillRect(620, 80, 30, 640); g2.fillRect(560, 80, 520, 26); g2.fillRect(-100, 720, 1200, 18); for (let i = 0; i < 12; i++) g2.fillRect(-80 + i * 100, 640, 14, 80); g2.fillRect(-100, 630, 1200, 14); }, { col: '#2a1d2c', trans: .3, light: [470, 400], lightCol: WARM }),
  study: layer(g2 => { g2.fillRect(-100, 650, 1200, 400); g2.fillRect(120, 560, 700, 30); g2.fillRect(160, 590, 30, 160); g2.fillRect(760, 590, 30, 160); g2.fillRect(700, 120, 210, 340); }, { col: '#2b1c18', trans: .35, light: [300, 420], lightCol: WARM }),
  frost: layer(g2 => { grassP(g2, 800, 50, 40, 150, 21); }, { col: '#8fb0e0', trans: .7, light: [470, 300], lightCol: '200,220,255' }),
};
// cut-paper cricket sprite (side view): body, head, long antennae, folded wings, big jumping legs. pale = the slender snowy tree cricket
const mkCricket = (pale) => makeSheet(440, 270, c => { c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineCap = 'round'; c.lineJoin = 'round';
  const bw = pale ? .8 : 1;
  c.beginPath(); c.ellipse(240, 150, 120, 38 * bw, -.04, 0, TAU); c.fill();                                   // abdomen under folded wings
  c.beginPath(); c.ellipse(150, 146, 44, 40 * bw, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(100, 152, 36, 34 * bw, 0, 0, TAU); c.fill();   // thorax + head
  c.beginPath(); c.moveTo(130, 118); c.quadraticCurveTo(250, 96, 360, 128); c.lineTo(352, 140); c.quadraticCurveTo(250, 116, 130, 132); c.closePath(); c.fill();   // wing edge
  c.save(); c.translate(270, 112); c.rotate(-.55); c.beginPath(); c.ellipse(0, 0, 86, 22, 0, 0, TAU); c.fill(); c.restore();   // hind femur (drumstick)
  c.lineWidth = 8; c.beginPath(); c.moveTo(338, 70); c.lineTo(358, 205); c.lineTo(392, 210); c.stroke();                     // hind tibia + foot
  c.lineWidth = 6; c.beginPath(); c.moveTo(170, 180); c.lineTo(160, 222); c.lineTo(140, 240); c.moveTo(130, 180); c.lineTo(112, 220); c.lineTo(92, 236); c.stroke();   // mid + front legs
  c.lineWidth = 4; c.beginPath(); c.moveTo(355, 152); c.lineTo(425, 138); c.moveTo(355, 160); c.lineTo(425, 170); c.stroke();    // cerci
  c.lineWidth = 3.5; c.beginPath(); c.moveTo(80, 132); c.bezierCurveTo(40, 60, 10, 30, 4, 6); c.moveTo(90, 128); c.bezierCurveTo(90, 60, 120, 20, 170, 6); c.stroke();   // antennae
  c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(86, 146, 7, 0, TAU); c.fill(); }, { col: pale ? '#cfe8b8' : '#2c2236', rim: pale ? 'rgba(255,255,230,.9)' : 'rgba(255,214,150,.75)' });
const CR = mkCricket(false), CRP = mkCricket(true);
const CLOCK = makeSheet(300, 300, c => { c.fillStyle = '#000'; c.beginPath(); c.arc(150, 150, 140, 0, TAU); c.fill(); c.fillRect(135, -4, 30, 20); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.arc(150 + Math.cos(a) * 112, 150 + Math.sin(a) * 112, i % 3 ? 5 : 9, 0, TAU); c.fill(); } }, { col: '#f1dfb4' });
const LANT = makeSheet(200, 300, c => { c.fillStyle = '#000'; c.fillRect(90, 0, 20, 40); c.beginPath(); c.ellipse(100, 160, 90, 110, 0, 0, TAU); c.fill(); c.fillRect(60, 40, 80, 20); c.fillRect(60, 260, 80, 24); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 4; i++) { c.fillRect(30 + i * 40, 80, 10, 160); } }, { col: '#c0392b' });
const MAN = makeSheet(320, 440, c => { c.fillStyle = '#000'; c.beginPath(); c.arc(170, 90, 56, 0, TAU); c.fill(); c.beginPath(); c.moveTo(130, 120); c.quadraticCurveTo(170, 230, 215, 120); c.fill();   // head + beard
  c.beginPath(); c.moveTo(70, 440); c.lineTo(90, 200); c.quadraticCurveTo(170, 150, 250, 200); c.lineTo(280, 440); c.fill(); c.lineWidth = 26; c.lineCap = 'round'; c.strokeStyle = '#000'; c.beginPath(); c.moveTo(240, 230); c.lineTo(300, 330); c.lineTo(330, 300); c.stroke(); }, { col: '#20141a' });
const OILLAMP = makeSheet(140, 220, c => { c.fillStyle = '#000'; c.beginPath(); c.ellipse(70, 180, 60, 34, 0, 0, TAU); c.fill(); c.fillRect(55, 60, 30, 130); c.beginPath(); c.ellipse(70, 70, 34, 50, 0, 0, TAU); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.ellipse(70, 70, 22, 38, 0, 0, TAU); c.fill(); }, { col: '#7a5a3a' });

function sky(t, o = {}) { const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, o.top || '#0b1233'); gr.addColorStop(1, o.bot || '#2c3b86'); g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.3) * BW, y = hash(i * 7.1) * BH * .7, tw = .5 + .5 * Math.sin(t * 2 + i); g.fillStyle = `rgba(255,240,210,${.25 + .5 * tw * hash(i)})`; g.beginPath(); g.arc(x, y, 1.2 + 1.6 * hash(i * 2), 0, TAU); g.fill(); }
  if (o.moon !== false) { const mx = o.mx ?? 760, my = o.my ?? 150; glow(g, mx, my, 160, '255,226,160', .5); g.fillStyle = '#ffeec4'; g.beginPath(); g.arc(mx, my, 46, 0, TAU); g.fill(); } }
// the chirp: glowing sound arcs from the cricket's wings; a chirp every 1/rate s, each arc grows for .7 s
function chirps(x, y, t, rate, col = CHIRP, a = 1, dir = -1) { const per = 1 / rate; for (let k = 0; k < 4; k++) { const ph = ((t / per) - k) % 1000, n = Math.floor(t / per) - k; const age = (t - n * per); if (age < 0 || age > .7) continue; const u = age / .7;
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${col},${.85 * (1 - u) * a})`; g.lineWidth = 5; g.lineCap = 'round'; for (let j = 0; j < 3; j++) { const rad = 30 + u * 150 + j * 26; g.beginPath(); g.arc(x, y, rad, dir < 0 ? -Math.PI * .85 : -Math.PI * .15, dir < 0 ? -Math.PI * .45 : Math.PI * .25 - Math.PI * .4); g.stroke(); } g.restore(); void ph; }
  const on = (t % per) < .12; if (on) bloom(g, x, y, 40, col, .6 * a); return on; }
function cricket(x, y, sc, t, o = {}) { const S = o.pale ? CRP : CR, wob = (t % (1 / (o.rate || 2))) < .12 ? 2 : 0; g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1); putSheet(g, S, -220 * sc, -150 * sc + wob, { sc, sh: .8 }); g.restore(); }
function clockFace(x, y, sc, u) { putSheet(g, CLOCK, x - 150 * sc, y - 150 * sc, { sc, sh: .8 }); g.save(); g.translate(x, y); g.fillStyle = 'rgba(255,170,90,.55)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 100 * sc, -Math.PI / 2, -Math.PI / 2 + u * TAU); g.closePath(); g.fill();
  g.strokeStyle = '#2a2140'; g.lineCap = 'round'; g.lineWidth = 7 * sc; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-Math.PI / 2 + u * TAU) * 100 * sc, Math.sin(-Math.PI / 2 + u * TAU) * 100 * sc); g.stroke(); g.restore(); }
function tally(x, y, n, col = '#fff0c8') { g.save(); g.strokeStyle = col; g.lineWidth = 6; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), k = i % 5, gx = x + grp * 74, gy = y + Math.floor(grp / 6) * 70; const X = gx - Math.floor(grp / 6) * 6 * 74;
    if (k < 4) { g.beginPath(); g.moveTo(X + k * 14, gy); g.lineTo(X + k * 14, gy + 50); g.stroke(); } else { g.beginPath(); g.moveTo(X - 8, gy + 40); g.lineTo(X + 52, gy + 8); g.stroke(); } } g.restore(); }
function lantern(x, y, sc, t, a = 1) { g.save(); g.translate(x, y); g.rotate(.04 * Math.sin(t * .9)); putSheet(g, LANT, -100 * sc, 0, { sc, sh: .7, a }); g.restore(); bloom(g, x, y + 160 * sc, 120 * sc * flick(t), WARM, .8 * a); }
function thermo(x, y, sc, v, col = '255,120,90') { g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = '#f3e3bf'; rr(g, -26, -260, 52, 280, 26); g.fill(); g.beginPath(); g.arc(0, 40, 46, 0, TAU); g.fill();
  g.fillStyle = `rgb(${col})`; g.beginPath(); g.arc(0, 40, 32, 0, TAU); g.fill(); g.fillRect(-12, lerp(20, -240, v), 24, lerp(20, -240, v) * -1 + 20); g.restore(); bloom(g, x, y + 40 * sc, 50 * sc, col, .5); }
const cam0 = { x: 0, y: 0 };

// ---------- shots ----------
const S = [];
// A: hook: a cricket on a grass stem, chirping glowing arcs; a paper thermometer hangs like a lantern; title strip + vertical CRICKET strip
S.push([0, T(1), t => { sky(t); const cam = { x: 16 * Math.sin(t * .3), y: 0 }; put(g, L.hillsFar, cam, .2); put(g, L.hills, cam, .35); put(g, L.grass, cam, .6);
  thermo(700, 360, 1.0, .62 + .02 * Math.sin(t * 3)); cricket(330, 640, 1.15, t, { rate: 2.2 }); chirps(240, 560, t, 2.2); put(g, L.front, cam, 1);
  vstrip(g, 'CRICKET', 80, 20, seg(t, .1, .9), { size: 52, seal: '°F' }); strip(g, 'a living thermometer', 520, 90, t < .02 ? 1 : seg(t, 0, .6), { size: 60, rot: -.03 }); }]);
// B: the question: closer on the cricket, arcs; "pretty much, yes"
S.push([T(1) - .3, T(2), t => { sky(t, { moon: false }); put(g, L.branch, cam0, .4); cricket(470, 520, 1.7, t, { rate: 2.2 }); chirps(330, 420, t, 2.2); put(g, L.front, cam0, 1);
  strip(g, 'temperature from chirps?', 470, 90, seg(t, T(1), T(1) + .7), { size: 62, seal: true }); tag(g, 'pretty much, yes', 650, 760, { k: backOut(seg(t, r(1, 2.6), r(1, 3.0))), rot: .05 }); }]);
// C: 1897: Amos Dolbear at his desk by an oil lamp, writing the formula; a cricket on the windowsill
S.push([T(2) - .3, T(3), t => { const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, '#3a2418'); gr.addColorStop(1, '#5a3a24'); g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
  g.fillStyle = '#16204a'; g.fillRect(700, 120, 210, 340); for (let i = 0; i < 20; i++) { g.fillStyle = `rgba(255,240,210,${.4 * hash(i)})`; g.beginPath(); g.arc(710 + hash(i * 3) * 190, 130 + hash(i * 5) * 320, 1.6, 0, TAU); g.fill(); }
  putSheet(g, MAN, 250, 300, { sc: 1, sh: .8 }); put(g, L.study, cam0, .3); putSheet(g, OILLAMP, 600, 380, { sc: 1, sh: .6 }); bloom(g, 670, 450, 150 * flick(t), WARM, .9);
  g.save(); g.translate(420, 548); g.rotate(-.04); g.fillStyle = '#f3e3bf'; g.fillRect(-130, -12, 250, 16); g.restore(); cricket(800, 470, .45, t, { rate: 1.6, flip: true }); chirps(770, 440, t, 1.6, CHIRP, .8, 1);
  strip(g, '1897', 300, 80, seg(t, r(2, .2), r(2, .8)), { size: 80, seal: true }); strip(g, 'The Cricket as a Thermometer', 470, 200, seg(t, r(2, 2.0), r(2, 2.8)), { size: 50 }); tag(g, 'Amos Dolbear', 300, 760, { k: backOut(seg(t, r(2, 1.2), r(2, 1.6))), rot: -.04 }); }]);
// D: his numbers: a cool night card and a warm night card, chirp dots filling each paper strip
S.push([T(3) - .3, T(4), t => { sky(t, { moon: false, top: '#141a3e', bot: '#3a2c5e' }); put(g, L.hills, cam0, .3);
  [[230, '60 °F', 80, COOL, 0], [710, '70 °F', 120, WARM, 2.0]].forEach(([x, lab, n, col, d]) => { const k = backOut(seg(t, r(3, .2 + d * .4), r(3, .8 + d * .4)));
    if (k <= 0) return; g.save(); g.translate(x, 430); g.scale(k, k); g.fillStyle = '#f3e3bf'; g.shadowColor = 'rgba(0,0,8,.5)'; g.shadowBlur = 16; g.shadowOffsetY = 9; rr(g, -190, -250, 380, 500, 20); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = '#2a1d38'; g.font = 'italic 700 74px "Cormorant Garamond"'; g.textAlign = 'center'; g.fillText(lab, 0, -160); const u = clamp((t - r(3, .9 + d * .4)) / 2.2), shown = Math.floor(n * u);
    for (let i = 0; i < shown; i++) { g.fillStyle = `rgb(${col})`; g.beginPath(); g.arc(-160 + (i % 10) * 35, -100 + Math.floor(i / 10) * 26, 9, 0, TAU); g.fill(); }
    g.fillStyle = '#2a1d38'; g.font = '700 44px Caveat'; g.fillText(`${n} chirps / min`, 0, 225); g.restore(); }); }]);
// E: the shortcut: a stopwatch sweeps 15 s while chirp tallies appear; then 30 + 40 = 70 °F
S.push([T(4) - .3, T(5), t => { sky(t); put(g, L.hills, cam0, .3); put(g, L.grass, cam0, .6); const u = seg(t, r(4, .5), r(4, 4.0)); clockFace(250, 330, 1.0, u); tag(g, '15 seconds', 250, 520, { k: 1, size: 46 });
  cricket(720, 330, .75, t, { rate: 2 }); chirps(660, 290, t, 2); tally(450, 600, Math.round(30 * u)); put(g, L.front, cam0, 1);
  strip(g, '30 chirps + 40 = 70 °F', 470, 90, seg(t, r(4, 4.2), r(4, 4.9)), { size: 60, seal: true }); }]);
// F: re-hook: the cricket isn't measuring anything; it's cold-blooded: a thermometer glows inside its body in the air's colour
S.push([T(5) - .3, T(6), t => { sky(t, { moon: false }); put(g, L.branch, cam0, .4); cricket(470, 520, 1.7, t, { rate: 2 }); const k = seg(t, r(5, 1.6), r(5, 2.4));
  bloom(g, 440, 520, 160, WARM, .5 * k); thermo(460, 560, .55 * k + .01, .6, WARM); put(g, L.front, cam0, 1);
  strip(g, 'not measuring anything', 470, 90, seg(t, r(5, .3), r(5, .9)), { size: 58 }); strip(g, 'cold-blooded', 470, 760, seg(t, r(5, 2.2), r(5, 2.8)), { size: 68, seal: true }); }]);
// G: warm night vs cool night: the box splits; slow arcs on the cool side, fast arcs on the warm side
S.push([T(6) - .3, T(7), t => { g.save(); g.beginPath(); g.rect(0, 0, BW / 2, BH); g.clip(); sky(t, { moon: false, top: '#0b1233', bot: '#2a4a8e' }); put(g, L.grass, cam0, .6); cricket(240, 520, .8, t, { rate: 1 }); chirps(190, 470, t, 1, COOL); g.restore();
  g.save(); g.beginPath(); g.rect(BW / 2, 0, BW / 2, BH); g.clip(); sky(t, { moon: false, top: '#3a1c2a', bot: '#a8582e' }); put(g, L.grass, cam0, .6); cricket(700, 520, .8, t, { rate: 3 }); chirps(650, 470, t, 3, WARM); g.restore();
  g.fillStyle = '#f3e3bf'; g.fillRect(BW / 2 - 4, 0, 8, BH); tag(g, 'cool night: slow', 240, 120, { k: backOut(seg(t, r(6, .4), r(6, .8))), col: '#cfe0ff' }); tag(g, 'warm night: fast', 700, 120, { k: backOut(seg(t, r(6, 1.0), r(6, 1.4))), col: '#ffd9a0' });
  strip(g, 'body as warm as the air', 470, 760, seg(t, r(6, 2.6), r(6, 3.2)), { size: 54 }); }]);
// H: the wings: a close-up of two cut-paper wings rubbing; each stroke sparks a chirp; faster when warm
S.push([T(7) - .3, T(8), t => { sky(t, { moon: false, top: '#2a1c3e', bot: '#6a3a2e' }); const rate = lerp(1.5, 3.2, seg(t, r(7, 1.5), r(7, 3.5))), ph = (t * rate) % 1, dx = Math.sin(ph * TAU) * 60;
  g.save(); g.translate(470, 430); g.rotate(-.08); g.fillStyle = '#d8c79a'; g.shadowColor = 'rgba(0,0,8,.5)'; g.shadowBlur = 18; g.shadowOffsetY = 10; g.beginPath(); g.ellipse(-60, 30, 300, 120, 0, 0, TAU); g.fill();
  g.fillStyle = '#efe0b8'; g.beginPath(); g.ellipse(60 + dx, -40, 300, 120, 0, 0, TAU); g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(80,50,30,.5)'; g.lineWidth = 3; for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(-60 + i * 26, -50); g.lineTo(-56 + i * 26, 10); g.stroke(); } g.restore();
  if (ph < .15) bloom(g, 470, 430, 120, CHIRP, .8); chirps(470, 380, t, rate, CHIRP, .9);
  tag(g, 'wings rub together', 470, 110, { k: backOut(seg(t, r(7, .3), r(7, .7))) }); tag(g, 'warmer = faster', 470, 720, { k: backOut(seg(t, r(7, 2.0), r(7, 2.4))), col: '#ffd9a0' }); }]);
// I: the catch: a line-up of crickets; one gets the red seal
S.push([T(8) - .3, T(9), t => { sky(t); put(g, L.hills, cam0, .3); [[150, false, .6], [470, true, .62], [790, false, .7]].forEach(([x, pale, sc], i) => { const k = backOut(seg(t, r(8, .2 + i * .3), r(8, .6 + i * .3))); if (k <= 0) return; cricket(x, 500, sc * k, t, { pale, rate: 1.5 + i }); });
  if (t > r(8, 1.6)) { sealMark(g, 470, 640, 80 * backOut(seg(t, r(8, 1.6), r(8, 2.0))), 'ONE'); } strip(g, 'works best for one kind', 470, 90, seg(t, r(8, .1), r(8, .7)), { size: 58 }); }]);
// J: the snowy tree cricket on a leaf in a lantern-light spot; Dolbear never named his
S.push([T(9) - .3, T(10), t => { sky(t, { moon: false, top: '#0e1a2a', bot: '#2a4a3e' }); put(g, L.branch, cam0, .4); bloom(g, 470, 480, 300, '200,255,170', .35); cricket(470, 500, 1.4, t, { pale: true, rate: 2 }); chirps(360, 420, t, 2, '220,255,190');
  strip(g, 'snowy tree cricket', 470, 90, seg(t, r(9, 1.6), r(9, 2.3)), { size: 62, seal: true }); tag(g, 'Dolbear never named his', 470, 200, { k: backOut(seg(t, r(9, .2), r(9, .6))), size: 40 }); tag(g, '"the thermometer cricket"', 470, 760, { k: backOut(seg(t, r(9, 3.6), r(9, 4.0))), col: '#e0f5c8' }); }]);
// K: other crickets keep their own pace: three crickets, three rhythms
S.push([T(10) - .3, T(11), t => { sky(t); put(g, L.grass, cam0, .6); [[180, 1.2], [470, 2.6], [760, 1.8]].forEach(([x, rate], i) => { cricket(x, 500, .55, t + i, { rate, flip: i === 2 }); chirps(x - 40, 460, t + i * .37, rate, CHIRP, .85); });
  strip(g, 'their own pace', 470, 90, seg(t, r(10, .2), r(10, .8)), { size: 62 }); tag(g, 'same formula, off', 470, 760, { k: backOut(seg(t, r(10, 1.8), r(10, 2.2))), col: '#ffc4b0' }); }]);
// L: cold nights: frost grass, the arcs slow right down
S.push([T(11) - .3, T(12), t => { sky(t, { top: '#0a1024', bot: '#2a3e6e', mx: 200 }); put(g, L.frost, cam0, .6); cricket(520, 560, .9, t, { rate: .5 }); chirps(460, 510, t, .5, COOL);
  for (let i = 0; i < 40; i++) { const x = hash(i) * BW, y = (hash(i + 3) * BH + t * 30) % BH; g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(x, y, 2.5, 0, TAU); g.fill(); }
  strip(g, 'cold night: slow', 470, 90, seg(t, r(11, .2), r(11, .8)), { size: 62 }); }]);
// M: payoff: count 15 s, add 40, pick the right cricket: the stopwatch + tally + the snowy tree cricket + the formula strip
S.push([T(12) - .3, T(13), t => { sky(t); put(g, L.hills, cam0, .3); const u = seg(t, r(12, .3), r(12, 3.3)); clockFace(230, 360, .8, u); tally(420, 300, Math.round(30 * u)); cricket(700, 620, .8, t, { pale: true, rate: 2 }); chirps(640, 580, t, 2, '220,255,190');
  strip(g, 'chirps in 15 s + 40 = °F', 470, 90, seg(t, r(12, .2), r(12, .9)), { size: 58, seal: true }); tag(g, 'the right cricket', 320, 680, { k: backOut(seg(t, r(12, 3.6), r(12, 4.0))), col: '#e0f5c8' }); put(g, L.front, cam0, 1); }]);
// N: the question
S.push([T(13) - .3, T(14), t => { sky(t); put(g, L.hills, cam0, .3); put(g, L.grass, cam0, .6); cricket(470, 560, 1.0, t, { rate: 2.2 }); chirps(400, 500, t, 2.2); strip(g, 'ever counted the chirps?', 470, 120, seg(t, T(13), T(13) + .8), { size: 58 }); put(g, L.front, cam0, 1); }]);
// O: the end card (loops to the hook's meadow)
S.push([T(14) - .35, TOT + 1, t => { sky(t); put(g, L.hillsFar, cam0, .2); put(g, L.hills, cam0, .35); put(g, L.grass, cam0, .6); cricket(330, 640, 1.15, t, { rate: 2.2 }); chirps(240, 560, t, 2.2); thermo(700, 400, .8, .62);
  strip(g, 'Follow for more of', 470, 150, seg(t, T(14) - .2, T(14) + .5), { size: 60 }); strip(g, 'how it really works.', 470, 270, seg(t, T(14) + .3, T(14) + 1.0), { size: 72, seal: true }); put(g, L.front, cam0, 1); }]);

function scene(t) { g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H); g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .45, b); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  vignette(g, .5); g.restore(); lampFrame(g, '255,190,110', .26); }
function sub(t) { let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur < 0 || cur === PH.length - 1) return;
  const p = PH[cur], nx = PH[cur + 1].start, a = seg(t, p.start - .05, p.start + .15) * (1 - seg(t, nx - .25, nx - .05)); subtitle(g, p.cap, cur === 0 ? (1 - seg(t, nx - .25, nx - .05)) : a, 1240); }
window.DUR = TOT;
// the room under the lamp (Batch N band y 1180-1420): the yes/no tags and the end-card lines are paper tags lying on the table
function room(t) { if (t > T(13) - .2 && t < T(14) - .3) { const a = 1 - seg(t, T(14) - .6, T(14) - .3); tag(g, 'YES', 330, 1395, { k: backOut(seg(t, r(13, 1.0), r(13, 1.4))), size: 64, col: '#ffd9a0', a }); tag(g, 'NO', 750, 1395, { k: backOut(seg(t, r(13, 1.3), r(13, 1.7))), size: 64, col: '#bcd6ff', a }); }
  if (t > T(14) - .35) { tag(g, "A new 'wait, really?' every day.", 540, 1230, { k: backOut(seg(t, T(14) + .8, T(14) + 1.2)), size: 50 }); tag(g, '@howitreallyworkstudio', 540, 1340, { k: backOut(seg(t, T(14) + 1.0, T(14) + 1.4)), size: 44, col: '#ffd9a0' }); } }
window.seek = t => { scene(t); sub(t); room(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .35; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { const t = 2; g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H); g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  sky(t); put(g, L.hillsFar, cam0, .2); put(g, L.hills, cam0, .35); put(g, L.grass, cam0, .6); thermo(720, 420, 1.0, .62); cricket(330, 660, 1.15, 1.5, { rate: 2.2 }); chirps(240, 580, 1.55, 2.2);
  strip(g, 'CRICKET', 470, 120, 1, { size: 96 }); strip(g, 'THERMOMETER', 470, 250, 1, { size: 96, seal: true }); put(g, L.front, cam0, 1); vignette(g, .45); g.restore(); lampFrame(g, '255,190,110', .3); };
window.seek(0); window.ready = true; window.READY = true;
