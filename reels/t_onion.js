// Why onions make you cry. Style: "Hand-drawn, sketch & comic" (awesome-opus-5-5-video-styles, styles/handdrawn.md): wobbly pencil/ink lines on off-white paper, redrawn every few frames (line boil), ink black + ONE accent colour, no gradients, hand-lettered labels.
import { W, H, clamp, lerp, ramp, eo, E, bk, rnd, hash, S, En, cur, caption, boot } from './r2lib.js';
const C = { paper: '#f5f1e6', ink: '#23211f', ac: '#d6336c', acL: 'rgba(214,51,108,.22)', gr: '#8b867b' };
const fnt = (w, s) => `${w} ${s}px Caveat`;
const D = (t, a, b) => eo((t - a) / (b - a));
let G, JT = 0;
const wob = (k, amp = 2.2) => [(hash(k * 1.73 + JT * 13.17) - .5) * amp * 2, (hash(k * 2.91 + JT * 7.31) - .5) * amp * 2];
// draw a wobbly polyline; p = draw-on progress 0..1
function ln(pts, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return; const n = Math.max(1, Math.floor((pts.length - 1) * p)); G.save(); G.lineJoin = 'round'; G.lineCap = 'round';
  for (let pass = 0; pass < (o.pencil === false ? 1 : 2); pass++) {
    G.strokeStyle = o.col ?? C.ink; G.lineWidth = (o.w ?? 3.4) * (pass ? .55 : 1); G.globalAlpha = (o.a ?? 1) * (pass ? .55 : 1); G.beginPath();
    for (let i = 0; i <= n; i++) { let q = pts[i]; if (i === n && p < 1) { const f = (pts.length - 1) * p - n; const nx = pts[Math.min(i + 1, pts.length - 1)]; q = [lerp(q[0], nx[0], f), lerp(q[1], nx[1], f)] } const [dx, dy] = wob(i + (o.seed ?? 0) * 7 + pass * 31, o.amp ?? 1.6); const X = q[0] + dx, Y = q[1] + dy; i ? G.lineTo(X, Y) : G.moveTo(X, Y) }
    if (o.close && p >= 1) G.closePath(); if (o.fill && pass === 0) { G.fillStyle = o.fill; G.fill() } G.stroke() }
  G.restore();
}
const ellP = (cx, cy, rx, ry, n = 30, a0 = 0, a1 = Math.PI * 2, rot = 0) => { const r = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry; r.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]) } return r };
function hatch(pts, ang, gap, col, a = .6, w = 1.8) { G.save(); G.beginPath(); pts.forEach((p, i) => i ? G.lineTo(p[0], p[1]) : G.moveTo(p[0], p[1])); G.closePath(); G.clip(); G.strokeStyle = col; G.lineWidth = w; G.globalAlpha = a; const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length; G.translate(cx, cy); G.rotate(ang); for (let y = -400; y < 400; y += gap) { G.beginPath(); const [dx, dy] = wob(y * .3, 1.5); G.moveTo(-400, y + dy); G.lineTo(400, y + dx); G.stroke() } G.restore() }
function tx(s, x, y, o = {}) { G.save(); G.font = fnt(o.w ?? 700, o.z ?? 30); G.fillStyle = o.col ?? C.ink; G.textAlign = o.al ?? 'center'; G.textBaseline = 'middle'; G.globalAlpha = o.a ?? 1; G.translate(x, y); G.rotate(o.rot ?? 0); const [dx, dy] = wob(s.length, .8); G.fillText(s, dx, dy); G.restore() }
function arrow(x0, y0, x1, y1, p = 1, col = C.ink, seed = 0) { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, mx = (x0 + x1) / 2 - uy * 10, my = (y0 + y1) / 2 + ux * 10; ln([[x0, y0], [mx, my], [x1, y1]], { p, col, seed, w: 3.4 }); if (p >= .98) { ln([[x1 - ux * 16 - uy * 9, y1 - uy * 16 + ux * 9], [x1, y1], [x1 - ux * 16 + uy * 9, y1 - uy * 16 - ux * 9]], { col, seed: seed + 3, w: 3.4 }) } }
function onion(x, y, s = 1, o = {}) { G.save(); G.translate(x, y); G.scale(s, s);
  const bulb = [[0, -120], [30, -70], [76, -40], [90, 20], [70, 80], [30, 112], [0, 118], [-30, 112], [-70, 80], [-90, 20], [-76, -40], [-30, -70]];
  const sm = []; for (let i = 0; i < bulb.length; i++) { const a = bulb[i], b = bulb[(i + 1) % bulb.length]; sm.push(a); sm.push([(a[0] + b[0]) / 2 * 1.0, (a[1] + b[1]) / 2]) } sm.push(bulb[0]);
  const hp = o.p ?? 1; if (!o.noFill) hatch(sm.slice(0, -1), .5, 11, C.ac, .55, 2.2);
  ln(sm, { col: C.ink, w: 4, p: hp, close: true, seed: 3 });
  [[-60, -20], [-30, 20], [0, 10], [30, 20], [60, -20]].forEach(([a, b], k) => ln([[a * .15, -100], [a, b], [a * .85, 90]], { col: C.ink, w: 2.2, a: .55, p: hp, seed: 10 + k }));
  ln([[0, -120], [-8, -150], [4, -178]], { w: 4, p: hp, seed: 40 }); ln([[0, -120], [14, -146], [22, -170]], { w: 3, p: hp, seed: 41 });
  for (let k = -3; k <= 3; k++) ln([[k * 7, 118], [k * 9 + Math.sin(k) * 6, 138]], { w: 2.4, p: hp, seed: 50 + k });
  G.restore() }
function eye(x, y, s = 1, o = {}) { G.save(); G.translate(x, y); G.scale(s, s);
  const up = ellP(0, 0, 80, 46, 24, Math.PI, Math.PI * 2, 0), lo = ellP(0, 0, 80, 40, 24, 0, Math.PI, 0);
  ln([...up, ...lo], { w: 4, close: true, seed: 60, fill: o.red ? 'rgba(214,51,108,.12)' : '#fffdf6' }); ln(ellP(0, 0, 26, 26, 18), { w: 3.4, seed: 61 }); G.fillStyle = C.ink; G.beginPath(); G.arc(0, 0, 11, 0, 7); G.fill();
  for (let k = -3; k <= 3; k++) ln([[k * 22, -40 + Math.abs(k) * 6], [k * 26, -64 + Math.abs(k) * 7]], { w: 3, seed: 70 + k });
  G.restore() }
function tear(x, y, s = 1, a = 1) { G.save(); G.translate(x, y); G.scale(s, s); G.globalAlpha = a; const p = [[0, -20], [10, -4], [12, 6], [6, 16], [0, 18], [-6, 16], [-12, 6], [-10, -4]]; ln([...p, p[0]], { w: 3, col: C.ink, fill: 'rgba(214,51,108,.18)', seed: 90, close: true }); G.restore() }
function wisp(x, y, h, t, k = 0, p = 1) { const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([x + Math.sin(u * 7 + t * 2 + k) * 16 * (.4 + u), y - u * h]) } ln(pts, { col: C.ac, w: 3.2, p, a: .9, seed: k + 100 }) }
function draw(g, t) {
  G = g; JT = Math.floor(t * 8); const i = cur(t);
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  // paper specks (static)
  g.save(); g.globalAlpha = .12; g.fillStyle = '#8a7f68'; const r = rnd(9); for (let k = 0; k < 260; k++) { g.fillRect(r() * W, r() * H, 1.4 + r() * 1.6, 1) } g.restore();
  g.textBaseline = 'middle';
  if (i === 0) { const a = D(t, .1, 1), tearsOn = ramp(t, 1.6, 2.2);
    onion(270, 640, 1.2, { p: D(t, 0, 1.2) }); eye(270, 360, 1.3, { red: true });
    for (let k = 0; k < 3; k++) { const u = ((t * .7 + k / 3) % 1); if (tearsOn > 0) { tear(214 + k * 56 - 10, 420 + u * 150, .9, tearsOn * (1 - u)) } }
    tx('(cut!)', 430, 520, { z: 34, col: C.ac, rot: .15, a: D(t, S(0) + 3, S(0) + 3.5) }) }
  if (i === 1) { const a = D(t, S(1) + .2, S(1) + 1);
    // big cell
    ln(ellP(0, 0, 1, 1, 1), {}); const cell = [[50, 360], [490, 360], [490, 700], [50, 700]];
    ln([...cell, cell[0]], { p: a, w: 4.5, close: true, seed: 1 });
    ln([[270, 360], [270, 700]], { p: D(t, S(1) + .8, S(1) + 1.5), w: 3.4, seed: 2, col: C.gr });
    const lft = [[56, 366], [264, 366], [264, 694], [56, 694]]; if (a > .9) hatch(lft, .6, 12, C.ac, .45 * D(t, S(1) + 1.2, S(1) + 1.8), 2.2);
    tx('enzymes', 160, 530, { z: 44, col: C.ac, a: D(t, S(1) + 1.4, S(1) + 2) }); tx('sulfur-rich', 380, 510, { z: 40, a: D(t, S(1) + 2.4, S(1) + 3) }); tx('chemicals', 380, 552, { z: 40, a: D(t, S(1) + 2.4, S(1) + 3) });
    tx('inside ONE onion cell', 270, 320, { z: 32, col: C.gr, a: a }); tx('kept apart', 270, 750, { z: 38, col: C.ink, a: D(t, S(1) + 2.6, S(1) + 3.2) }); }
  if (i === 2) { const k = t - S(2); const cell = [[50, 360], [490, 360], [490, 700], [50, 700]]; ln([...cell, cell[0]], { w: 4.5, close: true, seed: 1 });
    const lft = [[56, 366], [264, 366], [264, 694], [56, 694]]; hatch(lft, .6, 12, C.ac, .45, 2.2);
    const wall = D(t, S(2) + 1.2, S(2) + 1.8); ln([[270, 360], [270, 700]], { w: 3.4, seed: 2, col: C.gr, a: 1 - wall });
    // knife slashing through
    const kp = D(t, S(2) + .3, S(2) + 1.1); const kx = lerp(-60, 330, kp), ky = lerp(250, 640, kp);
    G.save(); G.translate(kx, ky); G.rotate(.8); ln([[-8, -90], [8, -90], [10, 60], [-12, 60]], { w: 4, close: true, fill: '#fffdf6', seed: 5 }); ln([[-4, 60], [-4, 130], [4, 130], [4, 60]], { w: 4, fill: C.ink, seed: 6 }); G.restore();
    ln([[50, 360], [kx, ky]], { w: 3, col: C.ac, a: .0 }); const mx = D(t, S(2) + 1.8, S(2) + 3);
    for (let j = 0; j < 8; j++) { const yy = 400 + j * 40, d = Math.sin(t * 3 + j) * 18 * mx; tx('•', 270 + d * (j % 2 ? -1 : 1) * 4, yy, { z: 40, col: j % 2 ? C.ink : C.ac, a: mx }) }
    tx('everything mixes!', 270, 750, { z: 44, col: C.ac, a: D(t, S(2) + 2.2, S(2) + 2.8) }) }
  if (i === 3) { const e = (a, b) => D(t, S(3) + a, S(3) + b);
    const bx = (x, y, w, h, s, col = C.ink, sd = 0, p = 1) => { ln([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], { w: 3.6, col, p, seed: sd, close: true }) };
    bx(60, 380, 150, 70, '', C.ink, 1, e(.2, .8)); tx('sulfur', 135, 415, { z: 34, a: e(.5, 1) });
    arrow(215, 415, 300, 415, e(.9, 1.5), C.ink, 2); bx(305, 380, 175, 70, '', C.ac, 3, e(1.1, 1.8)); tx('enzyme #1', 392, 415, { z: 34, col: C.ac, a: e(1.4, 2) });
    arrow(392, 460, 392, 560, e(2.2, 2.8), C.ink, 4); tx('...', 460, 510, { z: 40, a: e(2.6, 3) });
    bx(250, 570, 230, 80, '', C.ac, 5, e(2.8, 3.5)); tx('enzyme #2', 365, 600, { z: 34, col: C.ac, a: e(3.2, 3.8) }); tx('(LF synthase)', 365, 634, { z: 26, col: C.ac, a: e(3.2, 3.8) });
    arrow(250, 610, 150, 700, e(4, 4.7), C.ink, 6); tx('GAS!', 120, 740, { z: 60, col: C.ac, a: e(4.5, 5), rot: -.1 }) }
  if (i === 4) { const a = D(t, S(4) + .3, S(4) + 1);
    // molecule CH3-CH2-CH=S-O
    const atoms = [[70, 520, 'CH₃'], [170, 470, 'CH₂'], [270, 520, 'CH'], [370, 470, 'S'], [470, 520, 'O']];
    atoms.forEach(([x, y, s], k) => { const q = D(t, S(4) + .4 + k * .35, S(4) + .9 + k * .35); G.save(); G.globalAlpha = q; ln(ellP(x, y, 36, 32, 20), { w: 3.6, seed: 100 + k, fill: k >= 3 ? C.acL : '#fffdf6' }); tx(s, x, y, { z: 34, col: k >= 3 ? C.ac : C.ink }); G.restore() });
    for (let k = 0; k < 4; k++) { const [x0, y0] = atoms[k], [x1, y1] = atoms[k + 1]; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); ln([[x0 + dx / L * 38, y0 + dy / L * 36], [x1 - dx / L * 38, y1 - dy / L * 36]], { p: D(t, S(4) + .7 + k * .35, S(4) + 1.1 + k * .35), w: 3.6, seed: 120 + k }) }
    tx('syn-propanethial-S-oxide', 270, 660, { z: 42, col: C.ac, a: D(t, S(4) + 2, S(4) + 2.6) }); tx('a stinging gas', 270, 710, { z: 34, a: D(t, S(4) + 2.4, S(4) + 3) }); tx('(simplified drawing)', 270, 770, { z: 24, col: C.gr, a: D(t, S(4) + 2.4, S(4) + 3) }) }
  if (i === 5) { onion(200, 720, .7, {}); eye(380, 360, 1, { red: false }); for (let k = 0; k < 4; k++) wisp(160 + k * 28, 600, 190, t, k, D(t, S(5) + .3 + k * .2, S(5) + 1.2 + k * .2)); arrow(250, 520, 340, 420, D(t, S(5) + 1.8, S(5) + 2.4), C.ac, 7); tx('evaporates', 400, 540, { z: 36, col: C.ac, a: D(t, S(5) + .6, S(5) + 1.2) }) }
  if (i === 6) { eye(270, 520, 1.9, { red: true }); const a = D(t, S(6) + .3, S(6) + 1); ln([[100, 560], [160, 575], [270, 582], [380, 575], [440, 560]], { w: 5, col: C.ac, a, seed: 4, p: a }); tx('wet surface', 270, 650, { z: 38, a }); for (let k = 0; k < 5; k++) { const u = ((t * .6 + k / 5) % 1); G.globalAlpha = a * (1 - u * .5); wisp(160 + k * 55, 540 - u * 0 + 20, 120, t, k, 1); G.globalAlpha = 1 } tx('= mild irritant', 270, 730, { z: 48, col: C.ac, a: D(t, S(6) + 2.2, S(6) + 2.8) }) }
  if (i === 7) { eye(130, 420, .8, {}); const a = D(t, S(7) + .4, S(7) + 1.6); const nerve = [[190, 440], [250, 470], [300, 520], [350, 560], [380, 520], [410, 480]]; ln(nerve, { w: 4, p: a, col: C.ac, seed: 8 }); const bx = 410, by = 380; const brain = ellP(bx + 20, by, 80, 56, 24); ln(brain, { w: 4, close: true, seed: 9, fill: '#fffdf6', p: D(t, S(7) + 1.2, S(7) + 1.8) }); ln([[bx - 20, by + 4], [bx + 10, by - 24], [bx + 40, by + 4], [bx + 70, by - 20]], { w: 3, p: D(t, S(7) + 1.5, S(7) + 2), seed: 11, a: .6 }); tx('!', bx + 20, by - 2, { z: 60, col: C.ac, a: D(t, S(7) + 2, S(7) + 2.4) }); tx('cornea nerves', 250, 620, { z: 36, a: D(t, S(7) + .8, S(7) + 1.4) }); tx('"warning!"', 410, 700, { z: 40, col: C.ac, a: D(t, S(7) + 2.2, S(7) + 2.8) }) }
  if (i === 8) { eye(270, 560, 1.5, { red: true }); const a = D(t, S(8) + .3, S(8) + .9); ln(ellP(270, 410, 70, 26, 20), { w: 4, close: true, seed: 12, fill: '#fffdf6', p: a }); tx('tear gland', 270, 410, { z: 30, a }); const fl = D(t, S(8) + 1.8, S(8) + 2.4); for (let k = 0; k < 6; k++) { const u = ((t * .8 + k / 6) % 1); tear(180 + k * 36, 620 + u * 200, 1.1, fl * (1 - u)) } tx('flush it out!', 270, 280, { z: 46, col: C.ac, a: D(t, S(8) + 2, S(8) + 2.6) }); }
  if (i === 9) { onion(150, 600, .9, {}); const a = D(t, S(9) + .4, S(9) + 1.2); // mouse
    G.save(); G.translate(400 + (1 - a) * 60 + Math.sin(t * 20) * (D(t, S(9) + 2, S(9) + 2.1) * 3), 650); ln(ellP(0, 0, 70, 46, 24), { w: 4, close: true, seed: 20, fill: '#fffdf6' }); ln(ellP(-58, -14, 36, 30, 20), { w: 4, close: true, seed: 21, fill: '#fffdf6' }); ln(ellP(-66, -52, 18, 18, 16), { w: 3.4, seed: 22 }); ln(ellP(-38, -50, 16, 16, 16), { w: 3.4, seed: 23 }); G.fillStyle = C.ink; G.beginPath(); G.arc(-70, -18, 5, 0, 7); G.fill(); ln([[70, 10], [110, 0], [130, -26]], { w: 3.4, seed: 24 }); ln([[-92, -8], [-110, -2]], { w: 3, seed: 25 }); G.restore();
    tx('NOPE!', 330, 440, { z: 74, col: C.ac, rot: -.12, a: D(t, S(9) + 2.2, S(9) + 2.7) }); tx('a defense', 270, 800, { z: 46, a: D(t, S(9) + 3, S(9) + 3.6) }) }
  if (i === 10) { onion(200, 640, 1, {}); // snowflake
    const a = D(t, S(10) + .4, S(10) + 1.2); G.save(); G.translate(420, 440); G.rotate(t * .15); for (let k = 0; k < 6; k++) { G.save(); G.rotate(k * Math.PI / 3); ln([[0, 0], [0, -60]], { w: 4, col: C.ink, p: a, seed: 30 + k }); ln([[0, -34], [-16, -50]], { w: 3, p: a, seed: 40 + k }); ln([[0, -34], [16, -50]], { w: 3, p: a, seed: 50 + k }); G.restore() } G.restore();
    tx('cold = slower enzymes', 270, 800, { z: 42, a: D(t, S(10) + 1.4, S(10) + 2) }); tx('(plausible, not well tested)', 270, 848, { z: 32, col: C.ac, a: D(t, S(10) + 2.6, S(10) + 3.2) }) }
  if (i === 11) { const a = D(t, S(11) + .3, S(11) + 1), b = D(t, S(11) + 1.6, S(11) + 2.6), c = D(t, S(11) + 3.4, S(11) + 4.2);
    ln([[60, 760], [480, 760]], { w: 4, seed: 1 }); const bar = (x, h, col, lab, sd) => { const bp = [[x, 760], [x, 760 - h], [x + 100, 760 - h], [x + 100, 760]]; if (h > 4) hatch(bp, .7, 10, col, .5, 2.2); ln([...bp], { w: 4, seed: sd }); tx(lab, x + 50, 800, { z: 32 }) };
    bar(110, 300 * a, C.ac, 'normal', 3); bar(300, 300 * (1 - b * .86) * a, C.ac, 'switched down', 4);
    tx('gas made', 270, 380, { z: 36, col: C.gr, a }); tx('≈ 7× less', 400, 560, { z: 54, col: C.ac, rot: -.08, a: b }); tx('tasters: no tears', 270, 880, { z: 34, a: c }); tx('(reported result, 2015)', 270, 920, { z: 26, col: C.gr, a: c }) }
  if (i === 12) { onion(150, 620, .85, {}); const a = D(t, S(12) + .4, S(12) + 1.2); G.save(); G.translate(400, 630); G.globalAlpha = a; const gp = [[0, -110], [30, -70], [66, -20], [60, 50], [30, 100], [0, 110], [-30, 100], [-60, 50], [-66, -20], [-30, -70]]; ln([...gp, gp[0]], { w: 4, close: true, seed: 70, fill: '#fffdf6' }); [-30, 0, 30].forEach((q, k) => ln([[q * .3, -90], [q * 1.4, 0], [q, 90]], { w: 2.4, a: .55, seed: 71 + k })); ln([[0, -110], [6, -140]], { w: 4, seed: 80 }); G.restore();
    tx('onion', 150, 800, { z: 38 }); tx('garlic', 400, 800, { z: 38, a }); tx('different chemical', 270, 880, { z: 44, col: C.ac, a: D(t, S(12) + 1.6, S(12) + 2.2) }) }
  if (i === 13) { const items = [['knife', 70], ['enzymes', 175], ['gas', 285], ['nerves', 390], ['tears', 480]];
    items.forEach(([s, x], k) => { const q = D(t, S(13) + .4 + k * .6, S(13) + .9 + k * .6); G.globalAlpha = q; tx(s, x, 520 + (k % 2) * 80, { z: 34, col: k === 2 ? C.ac : C.ink }); if (k < 4) arrow(x + 40, 520 + (k % 2) * 80 + (k % 2 ? -18 : 20), items[k + 1][1] - 30, 520 + ((k + 1) % 2) * 80 + (k % 2 ? 22 : -18), q, C.ink, k); G.globalAlpha = 1 });
    tx('chemical alarm!', 270, 760, { z: 70, col: C.ac, rot: -.05, a: D(t, S(13) + 3.4, S(13) + 4) }) }
  if (i === 14) { onion(190, 650, 1, {}); eye(380, 420, 1, { red: true }); for (let k = 0; k < 3; k++) { const u = ((t * .7 + k / 3) % 1); tear(340 + k * 36, 470 + u * 120, .8, 1 - u) } tx('your turn →', 380, 600, { z: 38, col: C.ac }) }
  if (i >= 15) { const a = D(t, S(15), S(15) + .5); g.globalAlpha = a; tx('Follow', 270, 560, { z: 130, col: C.ac, rot: -.06 }); ln([[110, 640], [200, 655], [330, 630], [430, 650]], { w: 6, col: C.ink, seed: 3, p: D(t, S(15) + .4, S(15) + .9) }); g.globalAlpha = 1 }
  if (i <= 0) { tx('HOW IT REALLY WORKS', 270, 66, { z: 26, col: C.gr, a: ramp(t, 0, .3) }) }
  caption(g, t, { font: 'Caveat', size: 42, y: 130, w: 470, weight: 700, hlWeight: 700, color: C.ink, hl: C.ac, lh: 1.05 });
}
boot({ draw, fonts: ['700 30px Caveat'] });
