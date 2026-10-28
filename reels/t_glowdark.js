// t_glowdark.js: "How do glow-in-the-dark stickers glow?" in template #16 cinematic3d "Christmas story" (demo99) grammar, same kit as
// candle and submarine. Flat ink silhouettes on old film graded sepia (day) drifting to blue-lavender (night); every light is added
// AFTER the grade so it keeps its colour: the stickers' green glow, the sun beam, the lamp, the dial numerals. The demo's glowing house
// windows become the crystal's electron "traps" (a lit window = a trapped electron; it goes dark when the electron escapes as a green
// spark). Dips through black between shots, a burned-in italic hook line, and the dark rolling foreground band carrying the caption.
// Batch N safe zones: titles and labels in y 260-1140; the band starts at y 1160 and the caption sits on it in y 1180-1400, x 120-880;
// nothing written in the right column below y 840. Pure function of t.
import { createFilm, W, H, clamp, lerp, ramp, ss, eo, hash } from './styles/cinefilm/cinefilm.js';
await document.fonts.load('italic 600 54px "Playfair Display"');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, TOT = TL.total;
const F = createFilm(document.getElementById('c')), g = F.g, R = ramp, TAU = Math.PI * 2;
const INK = '#16120e', INK2 = '#221c16', CREAM = '#f0dca8', GREEN = '150,255,170', GHEX = '#b8ffc4';

// ---------- helpers (as candle) ----------
function label(txt, x, y, k, size = 50, col = CREAM) { if (k <= 0) return; g.save(); g.font = `italic 600 ${size}px "Playfair Display"`; g.textAlign = 'center'; g.fillStyle = col; g.globalAlpha = clamp(k); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 10; g.fillText(txt, x, y); g.restore(); }
function leader(x0, y0, x1, y1, k) { if (k <= 0) return; g.save(); g.strokeStyle = 'rgba(240,220,168,.8)'; g.lineWidth = 2.5; g.globalAlpha = clamp(k); g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, clamp(k)), lerp(y0, y1, clamp(k))); g.stroke(); g.restore(); }
function bigCap(str, a, size = 100, y = 420) { if (a <= 0) return; g.save(); g.textAlign = 'center'; g.font = `italic 700 ${size}px "Playfair Display"`; g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 18; g.fillStyle = '#f6e6bf';
  const words = str.split(' '), L = ['']; words.forEach(w => { const tr = (L[L.length - 1] + ' ' + w).trim(); if (g.measureText(tr).width > 820 && L[L.length - 1]) L.push(w); else L[L.length - 1] = tr; }); L.forEach((l, i) => g.fillText(l, 540, y + i * size * 1.05)); g.restore(); }
const starPts = (x, y, r, rot = 0) => Array.from({ length: 10 }, (_, i) => { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; });
// sticker silhouette (pale, before the grade) and its glow (after the grade); k = brightness 0..1
const sticker = (x, y, r, rot = 0) => F.poly(starPts(x, y, r, rot), '#4c463c');
function stickerGlow(x, y, r, k, rot = 0) { if (k <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; F.poly(starPts(x, y, r, rot), GHEX, .85 * k); g.restore(); F.glow(x, y, r * .6, k * .9, GREEN); }
const CEIL = Array.from({ length: 16 }, (_, i) => [110 + hash(i * 3.1) * 860, 300 + hash(i * 5.7) * 560, 22 + 30 * hash(i * 7.3), hash(i) * 1.2]);
// bedroom: wall, ceiling line, window, bed, lamp; day 0..1 lights the window from outside
function bedroom(t, o = {}) { const gr = g.createLinearGradient(0, 0, 0, 1200); gr.addColorStop(0, '#2c2620'); gr.addColorStop(1, '#4a4034'); g.fillStyle = gr; g.fillRect(-100, -100, W + 200, H + 200);
  if (o.window !== false) { g.fillStyle = o.day ? '#b8a07a' : '#4e4438'; g.fillRect(640, 560, 260, 340); if (!o.day) F.stars(t, 25, 880); g.fillStyle = INK; g.fillRect(632, 552, 276, 12); g.fillRect(632, 892, 276, 12); g.fillRect(632, 552, 12, 352); g.fillRect(896, 552, 12, 352); g.fillRect(764, 552, 10, 352); g.fillRect(632, 724, 276, 10); }
  // bed (silhouette) and a bedside lamp
  g.fillStyle = INK; g.fillRect(-60, 960, 640, 200); g.fillRect(-60, 880, 60, 120); g.beginPath(); g.ellipse(170, 950, 120, 40, 0, 0, TAU); g.fill(); g.fillStyle = INK2; g.fillRect(-60, 1000, 640, 40);
  g.fillStyle = INK; g.fillRect(560, 1020, 120, 140); g.fillRect(612, 900, 14, 120); g.beginPath(); g.moveTo(570, 900); g.lineTo(668, 900); g.lineTo(648, 840); g.lineTo(590, 840); g.closePath(); g.fill();
  g.fillStyle = '#0d0b09'; g.fillRect(-100, 1140, W + 200, 400);
  CEIL.forEach(([x, y, r, rot]) => sticker(x, y * .5 + 140, r * .7, rot)); }
const bedroomGlow = (t, k) => CEIL.forEach(([x, y, r, rot], i) => stickerGlow(x, y * .5 + 140, r * .7, k * (.85 + .15 * Math.sin(t * 2 + i)), rot));
// the energy ladder in a round "lens": ground and excited levels, a trap level drawn as little house windows
function lens(x, y, rad) { F.circ(x, y, rad + 10, '#0b0907'); F.circ(x, y, rad, '#3a3228'); }
function levels(x, y, w, o = {}) { g.save(); g.strokeStyle = 'rgba(240,220,168,.85)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - w / 2, y + 160); g.lineTo(x + w / 2, y + 160); g.moveTo(x - w / 2, y - 160); g.lineTo(x + w / 2, y - 160); g.stroke(); g.restore(); }
function house(x, y, n = 4) { g.fillStyle = INK; g.fillRect(x - 170, y - 40, 340, 120); g.beginPath(); g.moveTo(x - 200, y - 40); g.lineTo(x, y - 150); g.lineTo(x + 200, y - 40); g.closePath(); g.fill(); return Array.from({ length: n }, (_, i) => [x - 150 + i * 80, y - 10]); }
function electron(x, y, k = 1, col = '255,240,200') { if (k <= 0) return; F.circ(x, y, 9, `rgba(${col},1)`, k); F.glow(x, y, 10, k, col); }

// ---------- shots ----------
const SH = [[0, s(1) + 1.0, 'hook'], [s(1) + 1.0, s(3) - .15, 'charge'], [s(3) - .15, s(4) - .15, 'flash'], [s(4) - .15, s(5) - .15, 'traps'], [s(5) - .15, s(7) - .15, 'release'],
  [s(7) - .15, s(8) - .15, 'phos'], [s(8) - .15, s(9) - .15, 'zns'], [s(9) - .15, s(11) - .15, 'sral'], [s(11) - .15, s(12) - .15, 'safe'], [s(12) - .15, s(13) - .15, 'radium'],
  [s(13) - .15, s(14) - .15, 'lamp'], [s(14) - .15, s(15) - .05, 'question'], [s(15) - .05, TOT + 1, 'end']];
const shotAt = t => SH.find(x => t >= x[0] && t < x[1]) || SH[SH.length - 1];
const GRADE = { hook: 1, charge: 0, flash: .2, traps: .4, release: .9, phos: .8, zns: .7, sral: .8, safe: 1, radium: .1, lamp: .6, question: 1, end: 1 };

const SCN = {
  hook(t) {   // frame 0: close on the ceiling, big glowing stars drifting; at the question the camera pulls back to the bedroom
    const pb = ss(R(t, s(1) - .2, 1.4)), z = lerp(2.2, 1, pb), cy = lerp(330, 600, pb);
    g.save(); g.translate(540, 600); g.scale(z, z); g.translate(-540 + 20 * Math.sin(t * .3), -cy); bedroom(t); g.restore();
    return () => { g.save(); g.translate(540, 600); g.scale(z, z); g.translate(-540 + 20 * Math.sin(t * .3), -cy); bedroomGlow(t, 1); g.restore(); };
  },
  charge(t) {  // day: sunlight through the window charges the stickers; inset: light lifts electrons up a level
    bedroom(t, { day: true }); const ins = ss(R(t, s(2) + .4, .6)); if (ins > 0) { g.save(); g.globalAlpha = ins; lens(540, 560, 230); levels(540, 560, 300); g.restore(); }
    return () => { g.save(); g.globalCompositeOperation = 'lighter'; const bm = g.createLinearGradient(780, 700, 300, 300); bm.addColorStop(0, 'rgba(255,230,170,.45)'); bm.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = bm; g.beginPath(); g.moveTo(650, 600); g.lineTo(890, 600); g.lineTo(500, 160); g.lineTo(100, 160); g.closePath(); g.fill(); g.restore();
      F.window(644, 564, 252, 328, .6, { col: '#ffe9b8' }); label('daylight in', 300, 620, ss(R(t, s(1) + 1.2, .5)) * (1 - ins), 56);
      if (ins > 0) { for (let i = 0; i < 5; i++) { const u = clamp(((t - s(2) - 1.0) * .7 - i * .25)), x = 420 + i * 60, y = lerp(720, 400, ss(u)); electron(x, y, ins); if (u > 0 && u < 1) { g.save(); g.globalAlpha = ins * (1 - u); g.strokeStyle = 'rgba(255,230,170,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 30, y + 60); g.lineTo(x - 10, y + 20); g.stroke(); g.restore(); } }
        label('electrons', 540, 300, ins * ss(R(t, s(2) + 1.0, .5)), 52); label('a burst of energy', 540, 860, ins * ss(R(t, s(2) + 2.4, .5)), 44); } };
  },
  flash(t) {   // normally: the electron drops straight back and the light leaves in a flash
    bedroom(t, { window: false }); lens(540, 640, 300); levels(540, 640, 400);
    return () => { const ph = ((t - s(3)) * .8) % 1; const y = ph < .5 ? 480 : lerp(480, 800, ss((ph - .5) * 4)); electron(540, y, 1); if (ph > .62 && ph < .8) { F.glow(540, 800, 40, 1 - (ph - .62) * 5, '255,250,220'); }
      label('excited', 860, 488, 1, 40); label('ground', 860, 808, 1, 40); label('normally: a flash', 540, 300, ss(R(t, s(3) + .4, .5)), 60); label('over in an instant', 540, 1080, ss(R(t, s(3) + 2.6, .5)), 44); };
  },
  traps(t) {   // traps: the crystal's defects catch excited electrons and hold them (each trapped one = a lit window)
    bedroom(t, { window: false }); lens(540, 640, 320); const W4 = house(540, 720);
    return () => { const n = Math.floor(clamp((t - s(4) - 1.0) / 1.0, 0, 4)); W4.forEach(([x, y], i) => { const lit = i < n ? 1 : 0; if (lit) F.window(x - 22, y - 26, 44, 52, 1, { col: '#c8ffd0' }); });
      const fly = ((t - s(4) - 1.0) % 1); if (n < 4 && t > s(4) + 1.0) { const [x, y] = W4[n]; electron(lerp(540, x, ss(fly)), lerp(420, y, ss(fly)), 1); }
      label('traps', 540, 300, ss(R(t, s(4) + .2, .5)), 70, '#d8ffdc'); label('defects in the crystal', 540, 1090, ss(R(t, s(4) + 1.6, .5)), 46); label('caught and held', 540, 380, ss(R(t, s(4) + 4.0, .5)), 46); };
  },
  release(t) { // night: the room's warmth shakes them loose; each escape is a green spark; millions of them make the glow
    const zo = ss(R(t, s(6) + 1.6, 2.4)); const z = lerp(1, .45, zo);
    g.save(); g.translate(540, 640); g.scale(z, z); g.translate(-540, -640); bedroom(t, { window: false }); lens(540, 640, 320); const W4 = house(540, 720); g.restore();
    if (zo > 0) { g.save(); g.globalAlpha = zo; bedroom(t); g.restore(); }
    return () => { g.save(); g.translate(540, 640); g.scale(z, z); g.translate(-540, -640);
      W4.forEach(([x, y], i) => { const esc = s(5) + .8 + i * 1.1, lit = t < esc ? 1 : 0; if (lit) F.window(x - 22, y - 26, 44, 52, 1, { col: '#c8ffd0' }); const u = R(t, esc, 1.4); if (u > 0 && u < 1) { electron(x, y - 40 - 160 * u, 1 - u, GREEN); F.glow(x, y - 40 - 160 * u, 20, (1 - u), GREEN); } });
      g.restore(); if (zo > 0) { g.save(); g.globalAlpha = zo; bedroomGlow(t, zo); g.restore(); }
      label("the room's warmth", 540, 300, ss(R(t, s(5) + .3, .5)) * (1 - ss(R(t, s(6) - .3, .4))), 56); label('a few at a time', 540, 1090, ss(R(t, s(5) + 2.2, .5)) * (1 - zo), 46);
      label('a flash of green', 540, 380, ss(R(t, s(6) + .4, .5)) * clamp(1 - zo * 2.5), 52, '#d8ffdc'); label('millions = the glow', 540, 300, clamp(zo * 2 - 1), 62, '#d8ffdc'); };
  },
  phos(t) {    // light in, stored for a while, light out
    bedroom(t, { window: false });
    return () => { bigCap('Phosphorescence', ss(R(t, s(7) - .1, .5)), 96, 380); const items = [['light in', 220, '255,230,170'], ['stored', 540, '200,255,210'], ['light out', 860, GREEN]];
      items.forEach(([n, x, col], i) => { const k = ss(R(t, s(7) + .8 + i * .9, .5)); F.glow(x, 700, 40, k, col); F.circ(x, 700, 26, `rgba(${col},1)`, k); label(n, x, 820, k, 46); });
      g.save(); g.globalAlpha = ss(R(t, s(7) + 2.6, .5)); g.strokeStyle = 'rgba(240,220,168,.7)'; g.lineWidth = 4; g.beginPath(); g.moveTo(290, 700); g.lineTo(470, 700); g.moveTo(610, 700); g.lineTo(790, 700); g.stroke(); g.restore(); };
  },
  zns(t) {     // older stickers: zinc sulfide + copper, fade much sooner
    bedroom(t, { window: false }); sticker(320, 640, 140, 0); sticker(760, 640, 140, 0);
    return () => { const f = 1 - ss(R(t, s(8) + 1.0, 2.6)); stickerGlow(320, 640, 140, .25 + .75 * f, 0); stickerGlow(760, 640, 140, 1, 0);
      label('zinc sulfide', 320, 860, ss(R(t, s(8) + .2, .5)), 46); label('+ copper', 320, 920, ss(R(t, s(8) + .6, .5)), 40); label('fades sooner', 320, 400, ss(R(t, s(8) + 2.6, .5)), 46); label('new', 760, 860, ss(R(t, s(8) + 1.4, .5)), 46); };
  },
  sral(t) {    // the 1990s answer: strontium aluminate with europium and dysprosium; Eu makes the green, Dy holds electrons, hours of glow
    bedroom(t, { window: false }); const tiles = [['Sr', 'strontium', 200], ['Al', 'aluminate', 400], ['Eu', 'europium', 640], ['Dy', 'dysprosium', 860]];
    tiles.forEach(([sy, nm, x], i) => { const k = ss(R(t, s(9) + 1.0 + i * .7, .5)); if (k > 0) { g.save(); g.globalAlpha = k; F.rrect(x - 85, 520, 170, 170, 14, '#3a3228'); g.strokeStyle = 'rgba(240,220,168,.7)'; g.lineWidth = 4; g.strokeRect(x - 85, 520, 170, 170); g.restore(); } });
    return () => { label('1990s', 540, 330, ss(R(t, s(9) + .1, .5)), 60); tiles.forEach(([sy, nm, x], i) => { const k = ss(R(t, s(9) + 1.0 + i * .7, .5)); const hot = (i === 2 && t > s(10)) || (i === 3 && t > s(10) + 2.2);
        if (hot) F.glow(x, 605, 60, 1, i === 2 ? GREEN : '255,214,140'); label(sy, x, 630, k, 84, hot ? (i === 2 ? '#d8ffdc' : '#ffe2a8') : CREAM); label(nm, x, 740, k, 32); });
      label('makes the green', 640, 820, ss(R(t, s(10) + .3, .5)), 40, '#d8ffdc'); label('holds electrons', 820, 880, ss(R(t, s(10) + 2.4, .5)), 38, '#ffe2a8');
      const hk = ss(R(t, s(10) + 4.2, .6)); if (hk > 0) { const L = 600; g.save(); g.globalAlpha = hk; g.fillStyle = 'rgba(150,255,170,.85)'; g.fillRect(240, 1000, L * hk, 26); g.fillStyle = 'rgba(240,220,168,.6)'; g.fillRect(240, 1050, 90 * hk, 26); g.restore(); label('hours', 240 + L * hk + 70, 1024, hk, 40, '#d8ffdc'); label('old', 400, 1074, hk, 32); } };
  },
  safe(t) {    // and no, it's not radioactive
    bedroom(t, { window: false }); sticker(540, 680, 220, 0);
    return () => { stickerGlow(540, 680, 220, 1, 0); bigCap('Not radioactive.', ss(R(t, s(11) - .1, .5)), 96, 380); };
  },
  radium(t) {  // a century ago: radium watch dials (period silhouettes: dial painters at a long workbench)
    const gr = g.createLinearGradient(0, 0, 0, 1200); gr.addColorStop(0, '#2e2820'); gr.addColorStop(1, '#4e4436'); g.fillStyle = gr; g.fillRect(-100, -100, W + 200, H + 200);
    for (let i = 0; i < 3; i++) { g.fillStyle = '#5c5040'; g.fillRect(120 + i * 300, 300, 200, 300); g.fillStyle = INK; g.fillRect(214 + i * 300, 300, 12, 300); g.fillRect(120 + i * 300, 444, 200, 10); }
    g.fillStyle = INK; g.fillRect(-60, 900, W + 120, 40); for (let i = 0; i < 4; i++) { const x = 160 + i * 250; g.beginPath(); g.arc(x, 720, 46, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - 80, 900); g.quadraticCurveTo(x - 70, 780, x, 770); g.quadraticCurveTo(x + 70, 780, x + 80, 900); g.fill(); g.beginPath(); g.ellipse(x, 680, 52, 26, 0, Math.PI, TAU); g.fill(); }
    g.fillStyle = '#0d0b09'; g.fillRect(-100, 1140, W + 200, 400);
    return () => { for (let i = 0; i < 4; i++) { const x = 160 + i * 250 + 60; F.circ(x, 890, 22, 'rgba(200,255,200,.25)', 1); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; F.circ(x + Math.cos(a) * 16, 890 + Math.sin(a) * 8, 3, GHEX, .9); } F.glow(x, 890, 14, .6, GREEN); }
      label('a century ago', 540, 300, ss(R(t, s(12) + .2, .5)), 56); label('radium paint', 540, 1080, ss(R(t, s(12) + 1.6, .5)), 52, '#d8ffdc'); };
  },
  lamp(t) {    // your stickers just need a lamp: on (charge), off (glow back)
    bedroom(t, { window: false }); const on = t > s(13) + .6 && t < s(13) + 2.4;
    return () => { if (on) { F.glow(619, 870, 50, 1); bedroomGlow(t, .2); } else bedroomGlow(t, t > s(13) + 2.4 ? 1 : .5);
      label('a lamp', 619, 780, ss(R(t, s(13) + .4, .5)) * (on ? 1 : .6), 50); label('glow it back', 540, 330, ss(R(t, s(13) + 2.6, .5)), 64, '#d8ffdc'); };
  },
  question(t) { bedroom(t, { window: false }); return () => { bedroomGlow(t, 1); bigCap('Still on a ceiling?', ss(R(t, s(14) + .2, .5)), 80, 560); label('yes', 380, 760, ss(R(t, s(14) + 2.4, .4)), 64); label('no', 700, 760, ss(R(t, s(14) + 2.6, .4)), 64); }; },
  end(t) { bedroom(t, { window: false }); return () => { bedroomGlow(t, .55); const k = ss(R(t, s(15) - .05, .6));
    g.save(); g.textAlign = 'center'; g.font = 'italic 600 70px "Playfair Display"'; g.fillStyle = CREAM; g.globalAlpha = k; g.fillText('Follow for more of', 540, 600); g.globalAlpha = ss(R(t, s(15) + .3, .6)); g.fillText('how it really works.', 540, 690);
    g.font = 'italic 500 44px "Playfair Display"'; g.globalAlpha = ss(R(t, s(15) + .6, .6)); g.fillText("A new 'wait, really?' every day.", 540, 770); g.font = 'italic 600 40px "Playfair Display"'; g.globalAlpha = ss(R(t, s(15) + .9, .6)); g.fillText('@howitreallyworkstudio', 540, 835); g.restore(); }; },
};

function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [a, b, name] = shotAt(t), [wx, wy] = F.weave(t);
  g.save(); g.translate(wx, wy); const glowPass = SCN[name](t); g.restore();
  F.grade(name === 'release' ? lerp(.4, 1, ss(R(t, s(5), 1.5))) : GRADE[name]);
  g.save(); g.translate(wx, wy); glowPass(); g.restore();
  const fi = name === 'hook' ? 1 : ss(R(t, a, .3)), fo = 1 - ss(R(t, b - .3, .3)), dip = Math.min(fi, fo); if (dip < 1) { g.fillStyle = `rgba(0,0,0,${1 - dip})`; g.fillRect(0, 0, W, H); }
  if (t < s(2) - .2) { const one = t < s(1) - .05; bigCap(one ? 'Stored light.' : 'How do they glow?', one ? 1 : ss(R(t, s(1) - .05, .25)), one ? 104 : 84, 960); }
  F.band(t, 1160, { amp: 12 });
  let ci = 0; PH.forEach((p, k) => { if (t >= p.start - .1) ci = k; });
  if (ci < PH.length - 1) F.caption(PH[ci].cap.replace(/\*\*/g, ''), ci === 0 ? 99 : t - PH[ci].start + .1, { x: 130, y: 1380, size: 50, maxW: 760, wps: 4 });
  F.film(t);
}
window.DUR = TOT;
window.seek = t => { scene(t); const fade = Math.min(1, (TOT - t) / .5); if (fade < 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(0,0,0,${(1 - fade) * .4})`; g.fillRect(0, 0, W, H); } };
window.render = window.seek;
window.thumb = () => { const t = 1.2; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.save(); g.translate(540, 600); g.scale(1.6, 1.6); g.translate(-540, -420); bedroom(t); g.restore(); F.grade(1);
  g.save(); g.translate(540, 600); g.scale(1.6, 1.6); g.translate(-540, -420); bedroomGlow(t, 1); g.restore(); bigCap('Why do they', 1, 120, 900); bigCap('glow?', 1, 150, 1060); F.band(t, 1500); F.film(t); };
window.seek(0); window.ready = true; window.READY = true;
