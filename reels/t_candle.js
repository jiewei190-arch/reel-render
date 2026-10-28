// t_candle.js: "How does a candle actually burn?" in template #16 cinematic3d "Christmas story" (demo99) grammar, same kit as submarine.
// Flat ink silhouettes on old film graded sepia; every light (flame, melt pool, glowing carbon, embers) is added after the grade so it
// stays warm; dips through black between shots; a burned-in italic hook line; the dark rolling foreground band carries the caption.
// Batch N safe zones: titles and labels in y 260-1140; the band starts at y 1160 and the caption sits on it in y 1180-1400, x 120-880;
// nothing written in the right column below y 840. Every frame is a pure function of t.
import { createFilm, W, H, clamp, lerp, ramp, ss, eo, hash } from './styles/cinefilm/cinefilm.js';
await document.fonts.load('italic 600 54px "Playfair Display"');
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const F = createFilm(document.getElementById('c')), g = F.g, R = ramp, TAU = Math.PI * 2;
const INK = '#16120e', INK2 = '#221c16', CREAM = '#f0dca8';

// ---------- the candle ----------
// silhouette part (before the grade): body, table, holder. Returns geometry for the light pass.
function candle(x, y, sc, o = {}) {
  const { h = 420, w = 120 } = o;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.fillStyle = INK2; g.beginPath(); g.roundRect(-w / 2, -h, w, h, 10); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, w * 1.1, 26, 0, 0, TAU); g.fill(); g.fillRect(-w * .9, 0, w * 1.8, 16);
  g.strokeStyle = 'rgba(255,236,200,.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-w / 2 + 10, -h + 20); g.lineTo(-w / 2 + 10, -30); g.stroke();
  g.restore();
  return { x, y, sc, h, w, top: y - h * sc };
}
// light pass (after the grade): melt pool, wick, flame zones, glow. k: flame size 0..1; pool 0..1; zones: show dark core etc.
function flame(C, t, o = {}) {
  const { k = 1, pool = 1, wick = 1, zones = 0, cut = 0 } = o, sc = C.sc, x = C.x, y = C.top;
  // melt pool (a cup of liquid wax at the top)
  if (pool > 0) { g.save(); g.globalAlpha = pool; g.fillStyle = '#f2b860'; g.beginPath(); g.ellipse(x, y + 4 * sc, C.w * .42 * sc, 12 * sc, 0, 0, TAU); g.fill(); g.restore(); }
  // wick
  if (wick > 0) { g.save(); g.strokeStyle = '#2a1a10'; g.lineWidth = 6 * sc; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y + 6 * sc); g.quadraticCurveTo(x + 4 * sc, y - 20 * sc, x + 8 * sc, y - 34 * sc); g.stroke();
    if (k > 0) { g.strokeStyle = 'rgba(255,120,40,.9)'; g.lineWidth = 3 * sc; g.beginPath(); g.moveTo(x + 6 * sc, y - 26 * sc); g.lineTo(x + 8 * sc, y - 34 * sc); g.stroke(); } g.restore(); }
  if (k <= 0) return;
  const fl = 1 + .06 * Math.sin(t * 13) + .04 * Math.sin(t * 7.3), sw = 4 * Math.sin(t * 3.1);
  const fh = 150 * sc * k * fl, fw = 34 * sc * k, by = y - 24 * sc;
  const shape = (hh, ww, dy = 0) => { g.beginPath(); g.moveTo(x, by + dy); g.bezierCurveTo(x - ww, by - hh * .1 + dy, x - ww * .9, by - hh * .55 + dy, x + sw * .5, by - hh + dy); g.bezierCurveTo(x + ww * .9, by - hh * .55 + dy, x + ww, by - hh * .1 + dy, x, by + dy); };
  F.glow(x, by - fh * .45, 40 * sc * k, .9 * k);
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(0, by, 0, by - fh); gr.addColorStop(0, 'rgba(90,130,255,.9)'); gr.addColorStop(.12, 'rgba(255,130,40,.95)'); gr.addColorStop(.55, 'rgba(255,200,110,1)'); gr.addColorStop(1, 'rgba(255,150,70,.25)');
  g.fillStyle = gr; shape(fh, fw); g.fill(); g.restore();
  // dark core: unburnt vapour around the wick
  const dc = cut > 0 ? 1 : .55;
  g.save(); g.globalAlpha = dc * (.35 + .45 * zones); g.fillStyle = '#3a2a1c'; shape(fh * .42, fw * .42, -4 * sc); g.fill(); g.restore();
}
function smoke(x, y, t, a = 1, len = 520, k = 1) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(220,210,190,.55)'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i <= 40; i++) { const u = i / 40; if (u > k) break; const yy = y - u * len, xx = x + Math.sin(u * 7 + t * 1.6) * 30 * u + 14 * Math.sin(t * .8 + u * 3); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); g.restore(); }
const smokeAt = (x, y, t, u, len = 520) => [x + Math.sin(u * 7 + t * 1.6) * 30 * u + 14 * Math.sin(t * .8 + u * 3), y - u * len];
// room: wall, window with stars, table
function room(t, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, 1200); gr.addColorStop(0, '#2a241e'); gr.addColorStop(1, '#4a4034'); g.fillStyle = gr; g.fillRect(-100, -100, W + 200, H + 200);
  if (o.window !== false) { g.fillStyle = '#5e5244'; g.fillRect(620, 300, 300, 420); F.stars(t, 30, 700); g.fillStyle = INK; g.fillRect(612, 292, 316, 14); g.fillRect(612, 714, 316, 14); g.fillRect(612, 292, 14, 436); g.fillRect(914, 292, 14, 436); g.fillRect(764, 292, 10, 436); g.fillRect(612, 500, 316, 10); }
  g.fillStyle = INK; g.fillRect(-100, 1000, W + 200, 400);
}
function label(txt, x, y, k, size = 46) { if (k <= 0) return; g.save(); g.font = `italic 600 ${size}px "Playfair Display"`; g.textAlign = 'center'; g.fillStyle = CREAM; g.globalAlpha = clamp(k); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 10; g.fillText(txt, x, y); g.restore(); }
function leader(x0, y0, x1, y1, k) { if (k <= 0) return; g.save(); g.strokeStyle = 'rgba(240,220,168,.8)'; g.lineWidth = 2.5; g.globalAlpha = clamp(k); g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, clamp(k)), lerp(y0, y1, clamp(k))); g.stroke(); g.restore(); }
function bigCap(str, a, size = 100, y = 420) { if (a <= 0) return; g.save(); g.textAlign = 'center'; g.font = `italic 700 ${size}px "Playfair Display"`; g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 18; g.fillStyle = '#f6e6bf';
  const words = str.split(' '), L = ['']; words.forEach(w => { const tr = (L[L.length - 1] + ' ' + w).trim(); if (g.measureText(tr).width > 820 && L[L.length - 1]) L.push(w); else L[L.length - 1] = tr; }); L.forEach((l, i) => g.fillText(l, 540, y + i * size * 1.05)); g.restore(); }
function arrowUp(x, y0, y1, k, col = 'rgba(255,214,140,.95)') { if (k <= 0) return; const yy = lerp(y0, y1, clamp(k)); g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, yy + 10); g.stroke(); g.beginPath(); g.moveTo(x - 16, yy + 18); g.lineTo(x + 16, yy + 18); g.lineTo(x, yy - 8); g.fill(); g.restore(); }

// ---------- shots ----------
const SH = [[0, s(1) + 1.0, 'hook'], [s(1) + 1.0, s(3) - .15, 'faraday'], [s(3) - .15, s(5) - .15, 'melt'], [s(5) - .15, s(7) - .15, 'vapour'], [s(7) - .15, s(9) - .15, 'relight'],
  [s(9) - .15, s(11) - .15, 'zones'], [s(11) - .15, s(13) - .15, 'water'], [s(13) - .15, s(14) - .15, 'pump'], [s(14) - .15, s(15) - .15, 'question'], [s(15) - .15, TL.total + 1, 'end']];
const shotAt = t => SH.find(x => t >= x[0] && t < x[1]) || SH[SH.length - 1];

const SCN = {
  hook(t) {   // frame 0: a big flame close-up; at the question the camera pulls back to the candle by a window at night
    const pb = ss(R(t, s(1) - .2, 1.4)), z = lerp(2.6, 1, pb);
    g.save(); g.translate(540, 760); g.scale(z, z); g.translate(-540, -760 + 120 * (1 - pb)); room(t); const C = candle(540, 1000, 1); g.restore();
    return () => { g.save(); g.translate(540, 760); g.scale(z, z); g.translate(-540, -760 + 120 * (1 - pb)); flame(C, t, { k: 1, zones: .3 }); g.restore();
      const vp = 1 - pb; if (vp > 0) for (let i = 0; i < 18; i++) { const u = (t * .6 + hash(i * 3.3)) % 1, x = 540 + (hash(i) - .5) * 60 * (1 - u), y = lerp(860, 520, u); F.circ(x, y, 4, '#fff6dc', vp * (1 - u) * .8); }
      label('the wick', 360, 900, (1 - pb) * ss(R(t, 1.0, .5))); leader(440, 890, 540, 870, (1 - pb) * ss(R(t, 1.2, .5)));
      F.snow(t, 30, { speed: 18, a: .35 * pb, y1: 1000 }); };
  },
  faraday(t) {  // 1860: a lecture desk at the Royal Institution-style hall, a lecturer silhouette with a candle, rows of young heads
    room(t, { window: false });
    g.fillStyle = '#3a3128'; for (let i = 0; i < 5; i++) g.fillRect(80 + i * 220, 160, 60, 840);   // columns
    g.fillStyle = INK; g.fillRect(180, 820, 720, 40); g.fillRect(200, 860, 680, 160);           // desk
    const C = candle(620, 820, .55);
    // lecturer: coat, head, raised arm pointing at the candle
    const arm = .3 + .1 * Math.sin(t * 1.3);
    g.save(); g.translate(400, 820); g.fillStyle = INK; g.beginPath(); g.moveTo(-70, 0); g.lineTo(-56, -260); g.lineTo(56, -260); g.lineTo(70, 0); g.fill(); g.beginPath(); g.arc(0, -300, 42, 0, TAU); g.fill();
    g.save(); g.translate(40, -230); g.rotate(-arm); g.fillRect(0, -10, 150, 22); g.restore(); g.fillRect(-26, -340, 52, 16); g.restore();
    for (let i = 0; i < 9; i++) { const hx = 90 + i * 115, hy = 1080 + (i % 2) * 20 + 4 * Math.sin(t * 2 + i); g.fillStyle = INK2; g.beginPath(); g.arc(hx, hy, 46, 0, TAU); g.fill(); g.fillRect(hx - 60, hy + 30, 120, 200); }
    return () => { flame(C, t, { k: .9 }); bigCap('1860', ss(R(t, s(2) + .3, .6)), 110, 340); label('Michael Faraday', 540, 425, ss(R(t, s(2) + 1.0, .6)) * (1 - ss(R(t, s(2) + 3.0, .4))), 50); label('a lecture for young people', 540, 425, ss(R(t, s(2) + 3.2, .6)), 44); };
  },
  melt(t) {   // close-up cutaway: the heat melts a cup of liquid wax; the liquid climbs the wick (like water up a towel)
    room(t, { window: false }); const C = candle(540, 1640, 2.2, { h: 400 });
    return () => { g.save(); g.globalAlpha = ss(R(t, s(3) + .3, 1.0)); g.fillStyle = '#e8a850'; g.beginPath(); g.ellipse(540, C.top + 30, 110, 34, 0, 0, TAU); g.fill(); g.restore();
      flame(C, t, { k: .85, pool: 0 });
      const ck = R(t, s(4), 3.0); for (let i = 0; i < 10; i++) { const u = ((t * .8 + i / 10) % 1); g.save(); g.globalAlpha = ck * (1 - u * .3); g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(540 + 4 + Math.sin(u * 6) * 3, C.top + 20 - u * 70, 6, 0, TAU); g.fill(); g.restore(); }
      label('melted wax', 300, 620, ss(R(t, s(3) + 1.6, .5))); leader(380, 640, 470, C.top + 20, ss(R(t, s(3) + 1.8, .5)));
      // towel inset: a strip of cloth in a glass of water, the wet line creeping up
      const tk = ss(R(t, s(4) + 1.6, .6)), wet = R(t, s(4) + 2.0, 2.2);
      if (tk > 0) { g.save(); g.globalAlpha = tk; g.fillStyle = 'rgba(14,12,10,.85)'; g.beginPath(); g.roundRect(660, 300, 300, 420, 30); g.fill(); g.strokeStyle = CREAM; g.lineWidth = 3; g.stroke();
        g.fillStyle = 'rgba(150,180,230,.6)'; g.fillRect(700, 600, 220, 90); g.strokeStyle = CREAM; g.strokeRect(700, 520, 220, 170);
        g.fillStyle = '#d9cbb0'; g.fillRect(790, 340, 40, 330); g.fillStyle = 'rgba(110,150,220,.85)'; g.fillRect(790, lerp(640, 380, wet), 40, lerp(30, 290, wet)); g.restore();
        label('like a towel', 810, 270 + 0, tk, 40); } };
  },
  vapour(t) { // near the flame the liquid turns to vapour, and the vapour is what burns
    room(t, { window: false }); const C = candle(540, 1772, 2.4, { h: 380 });
    return () => { flame(C, t, { k: 1.1, zones: .4 });
      const vk = ss(R(t, s(5) + .4, .8)); for (let i = 0; i < 26; i++) { const u = (t * .7 + hash(i * 4.1)) % 1, x = 540 + 14 + (hash(i * 2) - .5) * 70 * (.4 + u), y = C.top - 80 - u * 160; F.circ(x, y, 5, '#fff6dc', vk * (1 - u) * .9); }
      label('wax vapour, a gas', 540, 300, vk, 52);
      const bk = ss(R(t, s(6) + .3, .6)); label('this is what burns', 540, 1060, bk, 52); };
  },
  relight(t) { // blow it out, light the smoke: a trail of fire runs down and relights the wick
    room(t); const C = candle(540, 1000, 1.1);
    const out = ss(R(t, s(7) + .5, .3)), m = ss(R(t, s(7) + 1.8, 1.2)), run = ss(R(t, s(8) + .2, 1.2)), rel = ss(R(t, s(8) + 1.3, .4));
    // a taper (long match) coming in from the right
    const tx = lerp(1100, 650, m), ty = 560; g.save(); g.translate(tx, ty); g.rotate(-.5); g.fillStyle = INK; g.fillRect(0, -6, 360, 12); g.restore();
    return () => { flame(C, t, { k: Math.max(1 - out, rel) });
      const sa = out * (1 - rel); smoke(C.x + 8, C.top - 30, t, sa, 520);
      if (m > 0) { F.glow(tx, ty, 14, .9); F.circ(tx, ty - 6, 10, '#ffd27a'); }
      if (run > 0 && rel < 1) for (let i = 0; i < 6; i++) { const u = clamp(1 - run + i * .02); const [fx, fy] = smokeAt(C.x + 8, C.top - 30, t, lerp(.55, 0, run) + i * .02, 520); F.circ(fx, fy, 12 - i, '#ffb050', 1 - rel); F.glow(fx, fy, 10, (1 - rel) * .8); }
      label('blow it out', 380, 320, ss(R(t, s(7) + .3, .5)) * (1 - m));
      label('light the smoke', 380, 320, m * (1 - run));
      label('fire runs down the vapour', 540, 320, run, 44); };
  },
  zones(t) {  // inside the flame: a dark core of unburnt vapour; the yellow glow is solid carbon specks so hot they shine
    room(t, { window: false }); const C = candle(540, 1980, 3.0, { h: 340 });
    return () => { flame(C, t, { k: 1.2, zones: 1, cut: 1 });
      const ck = ss(R(t, s(9) + .4, .6)); label('dark core', 300, 700, ck); leader(380, 690, 520, C.top - 140, ck); label('unburnt vapour', 300, 760, ss(R(t, s(9) + 1.6, .6)), 40);
      const yk = ss(R(t, s(10) + .6, .6)); if (yk > 0) for (let i = 0; i < 40; i++) { const u = (t * .5 + hash(i * 5.3)) % 1, a = hash(i * 2.1) * TAU, rr = 40 + 50 * hash(i * 7); const x = 540 + Math.cos(a) * rr * .7, y = C.top - 300 + Math.sin(a) * rr * 1.6 - u * 40; F.circ(x, y, 3 + 2 * hash(i), '#fff2c0', yk * (.4 + .6 * hash(i + Math.floor(t * 8)))); }
      label('glowing carbon specks', 540, 300, yk, 50); };
  },
  water(t) {  // the products: water and carbon dioxide; Faraday catches the water on a cold vessel above the flame
    room(t, { window: false }); const C = candle(540, 1160, 1.2);
    const fk = ss(R(t, s(12) - .2, .8));
    // a cold round-bottomed flask held above the flame
    g.save(); g.globalAlpha = fk; g.fillStyle = '#3d3a3a'; g.beginPath(); g.arc(540, 280, 110, 0, TAU); g.fill(); g.fillRect(512, 100, 56, 90); g.restore();
    return () => { flame(C, t, { k: 1 });
      const pk = ss(R(t, s(11) + 1.2, .6)) * (1 - fk); if (pk > 0) for (let i = 0; i < 10; i++) { const u = (t * .5 + i / 10) % 1, x = 540 + (i % 2 ? 1 : -1) * (60 + u * 200), y = C.top - 200 - u * 300;
        if (i % 2) { F.circ(x, y, 14, 'rgba(150,190,255,.9)', pk * (1 - u)); } else { F.circ(x - 14, y, 9, '#9a9a9a', pk * (1 - u)); F.circ(x, y, 12, '#ffd27a', pk * (1 - u)); F.circ(x + 14, y, 9, '#9a9a9a', pk * (1 - u)); } }
      label('water', 260, 560, pk); label('carbon dioxide', 790, 560, pk, 44);
      if (fk > 0) { for (let i = 0; i < 8; i++) { const a = Math.PI * (.2 + .6 * i / 7), dx = Math.cos(a) * 120, dy = Math.sin(a) * 120; const dr = (t * .4 + hash(i)) % 1; F.circ(540 + dx * .92, 280 + dy * .92 + dr * 30 * (i % 3 === 0 ? 1 : 0), 7, 'rgba(170,205,255,.95)', fk); }
        label('a cold flask', 800, 300, fk, 42); label('water drops form', 790, 470, ss(R(t, s(12) + 2.2, .6)), 46); } };
  },
  pump(t) {   // payoff: a tiny fuel pump. lift, melt to gas, burn
    room(t); const C = candle(540, 1160, 1.1);
    return () => { flame(C, t, { k: 1 });
      const a1 = ss(R(t, s(13) + .4, .5)), a2 = ss(R(t, s(13) + 2.0, .5)), a3 = ss(R(t, s(13) + 3.6, .5));
      arrowUp(420, C.top + 120, C.top + 10, a1); label('wick lifts wax', 260, C.top + 60, a1, 42);
      arrowUp(660, C.top - 20, C.top - 130, a2); label('heat makes gas', 790, C.top - 120, a2, 42);
      label('the gas burns', 540, 330, a3, 58);
      label('a tiny fuel pump', 540, 330, ss(R(t, s(13) + .2, .5)) * (1 - a3), 58); };
  },
  question(t) { // blown out, smoke rising: have you tried it?
    room(t); const C = candle(540, 1000, 1.1);
    return () => { flame(C, t, { k: 0 }); smoke(C.x + 8, C.top - 30, t, .9, 520); bigCap('Through the smoke?', ss(R(t, s(14) + .2, .5)), 80, 360); label('yes', 380, 560, ss(R(t, s(14) + 1.2, .4)), 64); label('no', 700, 560, ss(R(t, s(14) + 1.4, .4)), 64); };
  },
  end(t) { room(t, { window: false }); const C = candle(540, 1160, .8);
    return () => { flame(C, t, { k: 1 }); const k = ss(R(t, s(15) - .1, .7));
      g.save(); g.textAlign = 'center'; g.font = 'italic 600 70px "Playfair Display"'; g.fillStyle = CREAM; g.globalAlpha = k; g.fillText('Follow for more of', 540, 340); g.globalAlpha = ss(R(t, s(15) + .5, .7)); g.fillText('how it really works.', 540, 430);
      g.font = 'italic 500 44px "Playfair Display"'; g.globalAlpha = ss(R(t, s(15) + 1.0, .7)); g.fillText("A new 'wait, really?' every day.", 540, 510); g.font = 'italic 600 40px "Playfair Display"'; g.globalAlpha = ss(R(t, s(15) + 1.3, .7)); g.fillText('@howitreallyworkstudio', 540, 575); g.restore(); };
  },
};

function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [a, b, name] = shotAt(t), [wx, wy] = F.weave(t);
  g.save(); g.translate(wx, wy); const glowPass = SCN[name](t); g.restore();
  F.grade(0);
  g.save(); g.translate(wx, wy); glowPass(); g.restore();
  const fi = name === 'hook' ? 1 : ss(R(t, a, .3)), fo = 1 - ss(R(t, b - .3, .3)), dip = Math.min(fi, fo); if (dip < 1) { g.fillStyle = `rgba(0,0,0,${1 - dip})`; g.fillRect(0, 0, W, H); }
  // burned-in hook line (top third), then the question
  if (t < s(2) - .2) { const one = t < s(1) - .05; bigCap(one ? 'The wick doesn’t burn.' : 'So how does it burn?', one ? 1 : ss(R(t, s(1) - .05, .25)), one ? 96 : 84, 920); }
  // foreground wavy black band + italic caption written in word by word (inside y 1180-1400)
  F.band(t, 1160, { amp: 12 });
  let ci = 0; PH.forEach((p, k) => { if (t >= p.start - .1) ci = k; });
  if (ci < PH.length - 1) F.caption(PH[ci].cap.replace(/\*\*/g, ''), ci === 0 ? 99 : t - PH[ci].start + .1, { x: 130, y: 1380, size: 50, maxW: 760, wps: 4 });
  F.film(t);
}
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, (TL.total - t) / .5); if (fade < 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(0,0,0,${(1 - fade) * .4})`; g.fillRect(0, 0, W, H); } };
window.render = window.seek;
window.thumb = () => { const t = 1.2; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); room(t); const C = candle(540, 1300, 1.8); F.grade(0); flame(C, t, { k: 1.1, zones: .4 });
  bigCap('What really', 1, 130, 420); bigCap('burns?', 1, 150, 570); F.band(t, 1500); F.film(t); };
window.seek(0); window.ready = true; window.READY = true;
