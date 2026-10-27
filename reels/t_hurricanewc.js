// Watercolor "How a hurricane forms". Pure function of t. Style: styles/watercolor (journal page, painted washes, cute faces).
import { createWC, W, H, clamp, lerp, seg, ss, eo, backOut, hash, mix, rgba, PAL, PAPER, INK, INK2 } from './styles/watercolor/watercolor.js';
await Promise.all([document.fonts.load('600 60px Caveat'), document.fonts.load('italic 600 54px "Cormorant Garamond"')]);
const R = createWC(document.getElementById('c')), g = R.g, TL = window.TL, P = TL.p;
const SEA = '#4f9db5', DSEA = '#2c6f86', SUN = '#f4a43a', STORM = '#8d97ae', STORM2 = '#c3cadb', SHADE = '#59608a', RED = '#d4543a', LAND = '#8fbf5a';
const blob = (cx, cy, r, n = 14, sd = 1, sq = 1, jv = .3) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, k = 1 + (hash(sd * 7 + i * 3.1) - .5) * jv; o.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * sq]); } return o; };
const rect = (x0, y0, x1, y1) => [[x0, y0], [(x0 + x1) / 2, y0 - 4], [x1, y0], [x1 + 4, (y0 + y1) / 2], [x1, y1], [(x0 + x1) / 2, y1 + 4], [x0, y1], [x0 - 4, (y0 + y1) / 2]];
const arrowHead = (pts, col, w = 16, seed = 1) => { const n = pts.length, a = pts[n - 1], b = pts[Math.max(0, n - 4)]; const ang = Math.atan2(a[1] - b[1], a[0] - b[0]); for (const s of [-1, 1]) R.stroke([[a[0], a[1]], [a[0] - Math.cos(ang + s * .5) * 46, a[1] - Math.sin(ang + s * .5) * 46]], { w, col, a: .9, seed: seed + s, bristles: 0, prof: u => 1 - u * .4 }); };
const arrow = (pts, prog, col, w = 18, seed = 1) => { if (prog <= 0) return; R.stroke(pts, { w, col, a: .88, seed, prog, bristles: 2, prof: u => .9 - .3 * u }); if (prog >= .98) arrowHead(pts, col, w * .8, seed); };
function face(x, y, s, mood, seed) {
  g.save(); g.translate(x, y); const ex = s * .24, fy = -s * .02;
  for (const k of [-1, 1]) { g.fillStyle = rgba(INK, .9); g.beginPath(); g.ellipse(k * ex, fy, s * .06, s * .08, 0, 0, 6.3); g.fill(); g.fillStyle = rgba(PAPER, .95); g.beginPath(); g.arc(k * ex + 4, fy - 6, s * .02, 0, 6.3); g.fill();
    R.wash([[k * ex * 1.5 - s * .1, fy + s * .17], [k * ex * 1.5, fy + s * .1], [k * ex * 1.5 + s * .1, fy + s * .17], [k * ex * 1.5, fy + s * .24]], PAL.pink, { a: .5, seed: seed + k, jit: 3, blooms: 0, edge: 1 }); }
  if (mood === 'happy') R.stroke(R.bezier(-s * .13, fy + s * .2, 0, fy + s * .36, s * .13, fy + s * .2), { w: 8, col: INK, a: .85, seed: seed + 5, bristles: 0 });
  else if (mood === 'sleepy') { R.stroke(R.bezier(-s * .13, fy, -s * .1, fy + s * .03, -s * .05, fy), { w: 7, col: INK, a: .8, seed, bristles: 0 }); R.stroke(R.bezier(s * .05, fy, s * .1, fy + s * .03, s * .13, fy), { w: 7, col: INK, a: .8, seed: seed + 1, bristles: 0 }); R.stroke(R.bezier(-s * .05, fy + s * .2, 0, fy + s * .27, s * .05, fy + s * .2), { w: 6, col: INK, a: .8, seed: seed + 3, bristles: 0 }); }
  else if (mood === 'sad') R.stroke(R.bezier(-s * .12, fy + s * .27, 0, fy + s * .16, s * .12, fy + s * .27), { w: 8, col: INK, a: .85, seed: seed + 6, bristles: 0 });
  else { g.fillStyle = rgba(INK, .85); g.beginPath(); g.ellipse(0, fy + s * .24, s * .05, s * .07, 0, 0, 6.3); g.fill(); }
  g.restore();
}
function sun(x, y, r, t, mood, seed, k = 1, rays = true) {
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y);
  if (rays) for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832 + t * .15; R.stroke([[x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15], [x + Math.cos(a) * r * 1.52, y + Math.sin(a) * r * 1.52]], { w: r * .07, col: SUN, a: .75, seed: seed + i, bristles: 1 }); }
  R.wash(blob(x, y, r, 18, seed), SUN, { a: .88, seed, blooms: 5, br: r * .55, jit: 5 }); R.wash(blob(x - r * .12, y - r * .15, r * .6, 14, seed + 1), '#f9d56a', { a: .5, seed: seed + 1, blooms: 2, br: r * .3, jit: 4, edge: 1.4 });
  face(x, y, r * 2, mood, seed + 3); g.restore();
}
function sea(t, top, prog = 1, wob = 22) {
  const pts = []; for (let i = -1; i <= 18; i++) pts.push([i * W / 17, top + Math.sin(i * 1.3 + t * .9) * wob + (i % 2) * 9]); pts.push([W + 80, H + 80], [-80, H + 80]);
  R.wash(pts, SEA, { a: .7, seed: 31, blooms: 9, by0: top, br: 240, alpha: prog, edge: 1.6 });
  R.wash(pts.map(([x, y], i) => [x, y > top + 300 ? y : y + 170 + Math.sin(i + t) * 12]), DSEA, { a: .26, seed: 32, blooms: 6, by0: top + 300, br: 260, alpha: prog, edge: 1 });
  for (let k = 0; k < 8; k++) { const x = 90 + (k * 157) % 900, y = top + 80 + (k * 113) % 380; R.stroke(R.bezier(x - 70, y, x - 30, y - 22, x, y), { w: 7, col: '#eef7f9', a: .8, seed: 40 + k, bristles: 0, prog }); R.stroke(R.bezier(x, y, x + 30, y + 20, x + 70, y), { w: 7, col: '#eef7f9', a: .8, seed: 60 + k, bristles: 0, prog }); }
}
function cloud(x, y, s, k, seed, dark = 0) {
  if (k <= 0) return; const c = mix('#e6ebf4', SHADE, dark);
  [[-.55, .12, .55], [-.15, -.1, .7], [.35, -.05, .62], [.7, .15, .5], [0, .2, .65]].forEach(([dx, dy, rr], i) => R.wash(blob(x + dx * s, y + dy * s, rr * s * .6 * k, 12, seed + i), c, { a: .72, seed: seed + i, blooms: 2, br: s * .3, jit: 3, edge: 2 }));
}
function storm(cx, cy, rad, t, reveal, alp = 1) {
  for (let a = 0; a < 3; a++) for (let i = 0; i < 24; i++) {
    const u = i / 23, k = ss(seg(reveal, u * .6, u * .6 + .4)); if (k <= 0) continue;
    const ang = a * 2.0944 + u * 4.3 + t * .3, r = rad * (.2 + .82 * u), x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * .96, s = rad * (.19 - .08 * u);
    R.wash(blob(x, y, s * k, 12, a * 17 + i), mix(STORM2, STORM, .5 - u * .45), { a: (.5 - .2 * u) * alp, seed: a * 31 + i, blooms: 2, br: s * .8, jit: 4, edge: 1.1 });
  }
  for (let i = 0; i < 16; i++) { const ang = i / 16 * 6.2832 + t * .5, x = cx + Math.cos(ang) * rad * .27, y = cy + Math.sin(ang) * rad * .27, k = ss(seg(reveal, 0, .3)); R.wash(blob(x, y, rad * .12 * k, 10, 90 + i), mix(STORM2, SHADE, .35), { a: .72 * alp, seed: 90 + i, blooms: 1, br: 60, jit: 3, edge: 1.4 }); }
  R.wash(blob(cx, cy, rad * .16 * ss(seg(reveal, 0, .25)), 14, 7), SEA, { a: .68 * alp, seed: 8, blooms: 2, br: 50, jit: 3 });
}
const title = (s, ts, y = 230, size = 120, col = INK, ul = SUN) => { R.text(s, W / 2, y, { size, col, reveal: seg(ts, .15, 1.1) }); const w = R.measure(s.split('\n').pop(), size) * .6; const yy = y + (s.split('\n').length - 1) * size * 1.05 + 40; R.wash([[W / 2 - w, yy], [W / 2 + w, yy - 10], [W / 2 + w + 10, yy + 16], [W / 2 - w + 8, yy + 26]], ul, { a: .6, seed: 15, blooms: 0, jit: 3, alpha: seg(ts, .9, 1.4) }); };
const chip = (s, x, y, ts, col, rot = 0, size = 58) => R.text(s, x, y, { size, col, reveal: seg(ts, 0, .7), rot, a: .95 });
const ring = (cx, cy, r, a0, a1, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };

// ---------- scenes: (ts = seconds since scene start, t = absolute) ----------
const S = [];
S[0] = (ts, t) => { // hook
  title('How does a\nhurricane form?', ts, 250, 128);
  sun(540, 900, 220, t, 'happy', 4, backOut(seg(ts, .4, 1.4)));
  sea(t, 1200, ss(seg(ts, 1, 2.2)));
  for (let i = 0; i < 5; i++) R.stroke([[250 + i * 140, 1220], [268 + i * 140, 1160], [236 + i * 140, 1110], [266 + i * 140, 1050]], { w: 12, col: '#e4eef2', a: .85, seed: 300 + i, prog: ss(seg(ts, 2.2 + i * .15, 3.4 + i * .15)), bristles: 1, prof: u => 1 - .5 * u });
};
S[1] = (ts, t) => { // warm sea: thermometer, then vapour rises
  const p2 = seg(ts, 5.4, 6.2), th = 1 - p2;
  title(ts < 5.6 ? 'Warm sea' : 'Vapor rises', ts < 5.6 ? ts : ts - 5.6, 230, 120);
  sea(t, 1330, 1);
  sun(190, 520, 110, t, 'happy', 12, ss(seg(ts, 0, .8)), true);
  if (th > 0) {
    const f = ss(seg(ts, .7, 3.6)), top = 1240 - f * 560; g.save(); g.globalAlpha = th;
    R.wash(rect(500, 560, 580, 1210), '#f3ecd9', { a: .55, seed: 41, blooms: 2, edge: 3 });
    R.wash(rect(515, top, 565, 1210), RED, { a: .8, seed: 42, blooms: 2, jit: 2, edge: 1.6 });
    R.wash(blob(540, 1250, 95, 16, 43), RED, { a: .85, seed: 43, blooms: 3, br: 60, jit: 3 }); face(540, 1250, 190, 'happy', 44);
    for (let k = 0; k < 5; k++) R.stroke([[585, 640 + k * 130], [625, 640 + k * 130]], { w: 6, col: INK2, a: .7, seed: 50 + k, bristles: 0 });
    g.restore();
    chip('27°C / 80°F', 830, 700, ts - 3.2, RED, .04, 74); R.leader([[700, 725], [650, 780], [600, 800]], seg(ts, 3.5, 4.1), RED);
    chip('at least', 830, 770, ts - 3.4, INK2, .04, 48);
  }
  for (let i = 0; i < 7; i++) { const x = 220 + i * 105, p = ss(seg(ts, 6.2 + i * .25, 9 + i * .25)); R.stroke([[x, 1330], [x + 24, 1230], [x - 20, 1130], [x + 22, 1030], [x - 10, 930], [x + 16, 830], [x - 6, 740]], { w: 14, col: '#dfeaf0', a: .9, seed: 310 + i, prog: p, bristles: 1, prof: u => .9 - .55 * u }); }
  chip('warm, wet air\nrises', 790, 560, ts - 8.2, DSEA, -.03, 60);
};
S[2] = (ts, t) => { // clouds and rain, ocean -> storm energy
  title('Clouds & rain', ts, 230, 120);
  sea(t, 1380, 1);
  for (let i = 0; i < 6; i++) { const x = 230 + i * 125; R.stroke([[x, 1380], [x + 20, 1280], [x - 16, 1180], [x + 16, 1080], [x - 6, 980]], { w: 11, col: '#e2edf2', a: .8, seed: 330 + i, bristles: 1, prof: u => .9 - .5 * u }); }
  cloud(540, 760, 430, ss(seg(ts, .6, 3)), 5, ss(seg(ts, 2, 6)) * .4);
  for (let i = 0; i < 9; i++) { const x = 320 + i * 55, p = (ts * .55 + i * .23) % 1, y = 920 + p * 360; if (ts > 3 && y < 1330) R.stroke([[x, y], [x - 8, y + 36]], { w: 9, col: DSEA, a: .85 * (ts > 3 ? 1 : 0), seed: 400 + i, bristles: 0 }); }
  const ap = seg(ts, 4.4, 6.4); arrow(R.bezier(150, 1320, 80, 1000, 190, 720), ap, SUN, 22, 61); chip('ocean water\n→ storm clouds', 880, 1000, ts - 4.2, DSEA, .03, 54);
  chip('= the storm\'s energy', 850, 480, ts - 5.4, '#c0701a', -.03, 66);
};
S[3] = (ts, t) => { // low pressure, inflow bends into a spin
  title(ts < 4.4 ? 'Low pressure' : 'It spins', ts < 4.4 ? ts : ts - 4.4, 230, 120);
  R.wash(blob(540, 1060, 480, 40, 77, 1, .06), SEA, { a: .26, seed: 77, blooms: 6, br: 220, jit: 8 });
  const bend = ss(seg(ts, 4.4, 8)), sr = seg(ts, 5.5, 8.2);
  for (let k = 0; k < 8; k++) { const a0 = k / 8 * 6.2832, pts = []; for (let j = 0; j <= 24; j++) { const u = j / 24, r = lerp(480, 150, u), a = a0 + bend * 1.7 * u; pts.push([540 + Math.cos(a) * r, 1060 + Math.sin(a) * r]); } arrow(pts, ss(seg(ts, .5 + k * .12, 2.2 + k * .12)), mix(DSEA, SHADE, bend), 16, 80 + k); }
  if (sr > 0) storm(540, 1060, 400, t, sr, .85 * ss(seg(ts, 5.5, 6.5)));
  const lp = ss(seg(ts, .3, 1.1)); if (lp > 0) { g.save(); g.globalAlpha = lp; R.wash(blob(540, 1060, 70, 14, 5), '#f6e9c7', { a: .9, seed: 5, blooms: 1, edge: 2 }); R.text('L', 540, 1108, { size: 130, col: RED, reveal: 1 }); g.restore(); }
  chip('air flows in', 200, 1580, ts - 1.5, DSEA, -.05, 56);
  chip('Earth\'s rotation bends it:\nthe Coriolis effect', 540, 1500, ts - 6.5, SHADE, 0, 56);
};
S[4] = (ts, t) => { // globe: north CCW, south CW, equator dead zone
  title('Which way?', ts, 230, 120);
  R.wash(blob(540, 960, 400, 40, 88, 1, .05), SEA, { a: .6, seed: 88, blooms: 8, br: 200, jit: 7 });
  R.wash(blob(400, 800, 120, 12, 89, .7), LAND, { a: .7, seed: 89, blooms: 2, br: 60 }); R.wash(blob(720, 1130, 130, 12, 90, .7), LAND, { a: .7, seed: 90, blooms: 2, br: 60 }); R.wash(blob(700, 760, 70, 10, 91), LAND, { a: .7, seed: 91, blooms: 1, br: 40 });
  R.stroke([[170, 960], [330, 975], [540, 980], [750, 975], [910, 960]], { w: 10, col: INK, a: .8, seed: 92, bristles: 1, prof: u => 1, prog: ss(seg(ts, .3, 1.3)) });
  chip('equator', 900, 940, ts - 1.2, INK, .03, 50);
  const n = ss(seg(ts, 1.8, 3.6)), s2 = ss(seg(ts, 3.4, 5)), eq = ss(seg(ts, 5.9, 7));
  R.stroke(ring(540, 720, 120, 1.3, -3.4), { w: 18, col: SHADE, a: .9, seed: 93, prog: n, bristles: 2, prof: u => 1 }); if (n > .98) arrowHead(ring(540, 720, 120, 1.3, -3.4).slice(-6), SHADE, 16, 94);
  chip('north: counter-\nclockwise', 190, 620, ts - 2.4, SHADE, -.05, 52);
  R.stroke(ring(540, 1200, 120, -1.3, 3.4), { w: 18, col: SHADE, a: .9, seed: 95, prog: s2, bristles: 2, prof: u => 1 }); if (s2 > .98) arrowHead(ring(540, 1200, 120, -1.3, 3.4).slice(-6), SHADE, 16, 96);
  chip('south:\nclockwise', 880, 1330, ts - 4, SHADE, .05, 52);
  if (eq > 0) { R.wash(rect(160, 905, 920, 1015), RED, { a: .3 * eq, seed: 97, blooms: 2, edge: 2.4 }); R.text('±5°  too weak to spin', 540, 1500, { size: 72, col: RED, reveal: eq }); R.leader([[540, 1440], [540, 1190], [540, 1020]].map(p => p), seg(ts, 6.6, 7.4), RED); }
};
S[5] = (ts, t) => { // ingredients, then 74 mph
  const cards = ts < 5.1; title(cards ? 'Three ingredients' : 'How strong?', cards ? ts : ts - 5.1, 230, 118);
  if (cards) {
    const fadeOut = 1 - seg(ts, 4.6, 5.1);
    [['warm sea', 640], ['moist air', 920], ['low wind shear', 1200]].forEach(([s, y], i) => {
      const k = backOut(seg(ts, .5 + i * 1.4, 1.2 + i * 1.4)) * fadeOut; if (k <= 0) return;
      g.save(); g.translate(540, y); g.scale(k, k); g.translate(-540, -y);
      R.wash(rect(130, y - 100, 950, y + 100), i === 0 ? SEA : (i === 1 ? STORM2 : '#e9d6a8'), { a: .5, seed: 120 + i, blooms: 3, edge: 2.6, by0: y - 100, by1: y + 100 });
      R.text(s, 590, y + 25, { size: 80, col: INK, reveal: 1 });
      if (i === 0) { R.wash(blob(240, y, 55, 12, 130), SEA, { a: .8, seed: 130, blooms: 1, br: 30 }); R.stroke(R.bezier(190, y + 25, 215, y + 5, 240, y + 25), { w: 7, col: '#eef7f9', a: .9, seed: 131, bristles: 0 }); }
      if (i === 1) cloud(240, y, 110, 1, 135);
      if (i === 2) { arrow([[170, y - 25], [240, y - 25], [300, y - 25]], 1, INK2, 12, 140); arrow([[170, y + 30], [240, y + 30], [300, y + 30]], 1, INK2, 12, 145); }
      const ck = seg(ts, 1.1 + i * 1.4, 1.7 + i * 1.4); if (ck > 0) R.stroke([[850, y + 5], [880, y + 40], [930, y - 40]], { w: 20, col: PAL.deepGreen, a: .9, seed: 150 + i, prog: ck, bristles: 1, prof: u => 1 });
      g.restore();
    });
  } else {
    const c = Math.round(lerp(0, 74, eo(seg(ts, 5.6, 7.4))));
    for (let k = 0; k < 6; k++) { const y = 560 + k * 170, x0 = ((ts * 600 + k * 250) % 1500) - 200; R.stroke([[x0, y], [x0 + 260, y + 14]], { w: 11, col: STORM2, a: .85, seed: 160 + k, bristles: 1, prof: u => Math.sin(Math.PI * u) }); }
    R.text(String(c), 540, 1060, { size: 330, col: SHADE, reveal: 1, a: .95 }); R.text('miles per hour', 540, 1180, { size: 84, col: INK, reveal: seg(ts, 6.2, 7) });
    const st = backOut(seg(ts, 7.6, 8.4)); if (st > 0) { g.save(); g.translate(540, 1380); g.rotate(-.06); g.scale(st, st); R.text('= HURRICANE', 0, 0, { size: 112, col: RED, reveal: 1 }); g.restore(); }
  }
};
S[6] = (ts, t) => { // eye and eyewall
  title('Inside the storm', ts, 230, 118);
  storm(540, 1060, 470, t, 1, 1);
  face(540, 1060, 220, 'sleepy', 12);
  chip('the eye:\ncalm & clear', 190, 600, ts - .5, DSEA, -.05, 58); R.leader(R.bezier(260, 700, 340, 850, 480, 1020), seg(ts, .8, 1.5), DSEA);
  const ew = seg(ts, 3.6, 4.4); if (ew > 0) { R.stroke(ring(540, 1060, 140 + Math.sin(t * 4) * 5, -1.6, -1.6 + 6.28), { w: 22, col: RED, a: .8 * ew, seed: 170, bristles: 2, prof: u => 1, prog: ew }); chip('eyewall:\nfastest winds', 860, 1500, ts - 3.9, RED, .04, 58); R.leader(R.bezier(800, 1440, 720, 1330, 650, 1210), seg(ts, 4, 4.7), RED); }
};
S[7] = (ts, t) => { // landfall: storm weakens
  title('Over land', ts, 230, 120);
  const u = ss(seg(ts, .6, 5)), cx = lerp(330, 760, u), rad = lerp(330, 170, u), alp = lerp(.9, .3, u);
  R.wash(blob(540, 1180, 470, 44, 180, 1, .05), SEA, { a: .6, seed: 180, blooms: 7, br: 200, jit: 5 });
  R.wash(blob(800, 1180, 300, 36, 181, 1.1, .12), LAND, { a: .72, seed: 181, blooms: 7, br: 160, jit: 5 });
  R.wash(blob(860, 1120, 150, 20, 184, 1, .2), '#c9d88a', { a: .45, seed: 184, blooms: 2, br: 80, jit: 4, edge: 1 });
  for (let k = 0; k < 6; k++) R.stroke(R.bezier(430 + (k % 2) * 40, 880 + k * 90, 470, 910 + k * 90, 450, 940 + k * 90), { w: 7, col: '#f2f6f8', a: .8, seed: 185 + k, bristles: 0 });
  storm(cx, 1180, rad, t, 1, alp);
  face(cx, 1180, rad * .5, u > .5 ? 'sad' : 'sleepy', 183);
  chip('warm ocean\nfuel: gone', 250, 560, ts - 2.2, DSEA, -.04, 58); chip('friction\nslows it', 850, 560, ts - 3.4, '#4f7d25', .04, 58);
};
S[8] = (ts, t) => { // recap
  title('A heat engine', ts, 230, 118);
  sun(260, 760, 100, t, 'happy', 20, ss(seg(ts, .2, 1)), true);
  const pu = ss(seg(ts, .4, 1.2)); R.wash(blob(260, 1010, 200, 30, 25, .42, .08), SEA, { a: .75, seed: 25, blooms: 4, br: 120, jit: 4, alpha: pu });
  for (let k = 0; k < 3; k++) R.stroke(R.bezier(150 + k * 90, 1000 + (k % 2) * 30, 185 + k * 90, 980 + (k % 2) * 30, 220 + k * 90, 1000 + (k % 2) * 30), { w: 7, col: '#eef7f9', a: .85, seed: 26 + k, bristles: 0, prog: pu });
  R.text('warm ocean in', 260, 1190, { size: 66, col: DSEA, reveal: seg(ts, 1, 1.8), a: .95 });
  arrow(R.bezier(430, 880, 540, 830, 640, 880), seg(ts, 1.6, 2.4), INK2, 22, 190);
  storm(810, 900, 230, t, ss(seg(ts, 2.4, 4)), 1); face(810, 900, 120, 'happy', 191);
  R.text('spinning storm out', 790, 1190, { size: 66, col: SHADE, reveal: seg(ts, 3.4, 4.2), a: .95 });
  const hb = seg(ts, 5.4, 6.2); if (hb > 0) { const sc = (1 + .06 * Math.sin(t * 6)) * backOut(hb) * 5.2, hp = []; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.2832; hp.push([16 * Math.pow(Math.sin(a), 3), -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); } g.save(); g.translate(540, 1450); g.scale(sc, sc); R.wash(hp.map(([x, y]) => [x, y]), RED, { a: .8, seed: 195, blooms: 0, jit: .8, edge: .5 }); g.restore(); }
};
S[9] = (ts, t) => { // end card
  sun(540, 760, 190, t, 'happy', 21, backOut(seg(ts, .1, 1)), true);
  sea(t, 1300, 1);
  R.text('Follow for more of', W / 2, 1020, { size: 80, col: INK, reveal: seg(ts, .8, 1.5) });
  R.text('how it really works.', W / 2, 1130, { size: 100, col: '#d96a1a', reveal: seg(ts, 1.3, 2.2), a: .95 });
};
const B = [0, P[1].start - .2, P[3].start - .2, P[5].start - .2, P[7].start - .2, P[9].start - .2, P[11].start - .2, P[13].start - .2, P[14].start - .2, P[16].start - .35, TL.total + 1];
const plain = s => s.replace(/\*\*/g, '');
window.DUR = TL.total;
window.seek = t => {
  R.begin(t); let si = 0; while (si < 9 && t >= B[si + 1]) si++;
  S[si](t - B[si], t);
  let veil = 0; for (const b of B.slice(1, 10)) veil = Math.max(veil, clamp(1 - Math.abs(t - b) / .3));
  if (veil > 0) { g.save(); g.globalAlpha = ss(veil); g.drawImage(R.paperImg, 0, 0); g.restore(); }
  let pi = -1; for (let i = 0; i < P.length; i++) if (t >= P[i].start - .02) pi = i;
  if (pi >= 0 && !(pi === 16)) R.subtitle(plain(P[pi].cap), 1700, seg(t, P[pi].start, P[pi].start + .7));
  R.finish();
};
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
