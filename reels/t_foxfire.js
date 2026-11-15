// t_foxfire.js: why some mushrooms glow. Template #1 paper-lantern (Paper-cut Lightbox, lemo-opuscar paper-lantern).
// Every shot is one lit shadow box: baked cut-paper layers (value ladder back light -> front dark, backlight + pulp mottle,
// cast shadows, blurred front layer), emissive windows (here: the foxfire itself), paper strips that grow from an edge,
// a vertical title strip with a red seal, paper-on-a-stick motion, dissolves and a near-plane fern curtain.
import { createLantern, W, H, BOX, BW, BH, PAL, clamp, lerp, seg, ss, eo, backOut, hash, glow, rr, moon, subtitle, tag,
  layer, put, lampFrame, vignette, strip, vstrip, sealMark, bloom, flick } from './styles/lantern/lantern.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"'), document.fonts.load('700 40px Caveat')]);
const g = createLantern(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .5) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const GRN = '140,255,160', TAU = Math.PI * 2;

// ---------------- shapes (box-local coords) ----------------
function pines(g, base, n, h0, h1, seed, x0 = -60, x1 = BW + 60) {
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, (i + .5) / n) + (hash(seed + i) - .5) * 70, h = lerp(h0, h1, hash(seed + i * 3.3)), w = h * .44;
    g.beginPath(); g.rect(x - w * .06, base - h * .2, w * .12, h * .25 + 400); g.fill();
    for (let k = 0; k < 5; k++) { const y = base - h * .15 - k * h * .18, ww = w * (1 - k * .17);
      g.beginPath(); g.moveTo(x - ww, y); g.lineTo(x, y - h * .34); g.lineTo(x + ww, y); g.closePath(); g.fill(); }
  }
  g.fillRect(-100, base, BW + 200, BH);
}
function mountains(g, base, peaks) {           // the demo's rounded paper peaks with carved contour lines
  g.beginPath(); g.moveTo(-100, BH + 100); g.lineTo(-100, base);
  peaks.forEach(([x, h]) => { g.lineTo(x - h * .55, base); g.bezierCurveTo(x - h * .3, base - h * .2, x - h * .12, base - h, x, base - h); g.bezierCurveTo(x + h * .12, base - h, x + h * .3, base - h * .2, x + h * .55, base); });
  g.lineTo(BW + 100, base); g.lineTo(BW + 100, BH + 100); g.closePath(); g.fill();
  g.globalCompositeOperation = 'destination-out'; g.lineWidth = 4;
  peaks.forEach(([x, h]) => { for (let k = 1; k <= 3; k++) { const hh = h * (1 - k * .22); g.beginPath(); g.moveTo(x - hh * .4, base - h + (h - hh) + hh * .35); g.bezierCurveTo(x - hh * .2, base - h + (h - hh) * .9, x + hh * .2, base - h + (h - hh) * .9, x + hh * .4, base - h + (h - hh) + hh * .35); g.stroke(); } });
  g.globalCompositeOperation = 'source-over';
}
function canopy(g, base, n, seed) {             // round cut-paper tree crowns on trunks
  for (let i = 0; i < n; i++) { const x = (i + .5) / n * (BW + 160) - 80 + (hash(seed + i) - .5) * 60, h = 260 + 200 * hash(seed + i * 2), r = 70 + 50 * hash(seed + i * 3);
    g.fillRect(x - 9, base - h, 18, h); g.beginPath(); g.arc(x, base - h, r, 0, TAU); g.arc(x - r * .7, base - h + r * .4, r * .7, 0, TAU); g.arc(x + r * .7, base - h + r * .35, r * .75, 0, TAU); g.fill(); }
  g.fillRect(-100, base, BW + 200, BH);
}
function hillsP(g, base, amp, seed, n = 5) {
  g.beginPath(); g.moveTo(-100, BH + 100); g.lineTo(-100, base);
  for (let i = 0; i <= 40; i++) { const x = -100 + i * (BW + 200) / 40; g.lineTo(x, base - amp * (.5 + .5 * Math.sin(i / 40 * n * Math.PI + seed)) * (.7 + .3 * hash(seed + i))); }
  g.lineTo(BW + 100, BH + 100); g.closePath(); g.fill();
}
function logP(g, x, y, w, h) {
  g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.beginPath(); g.moveTo(x + w * .18, y - h * .3); g.lineTo(x + w * .26, y - h * 1.05); g.lineTo(x + w * .3, y - h * .95); g.lineTo(x + w * .26, y - h * .3); g.fill();
}
function fernP(g, x, y, len, ang, side) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * .4, -len * .1 * side, len, -len * .25 * side); g.lineWidth = 9; g.strokeStyle = '#000'; g.stroke();
  for (let i = 1; i < 16; i++) { const u = i / 16, px = len * u, py = -len * .25 * side * u * u, l = 120 * (1 - u * .8);
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(px + l * .3, py + s * l * .45, l * .55, l * .16, s * .9, 0, TAU); g.fill(); } }
  g.restore();
}
function ferns(g) { fernP(g, -40, BH + 30, 520, -1.1, 1); fernP(g, -20, BH - 120, 420, -.55, 1); fernP(g, BW + 40, BH + 30, 520, -2.05, -1); fernP(g, BW + 20, BH - 100, 400, -2.6, -1); }
function palmP(g, x, base, h, lean) {
  g.beginPath(); g.moveTo(x - 14, base); g.quadraticCurveTo(x + lean * .4, base - h * .5, x + lean, base - h); g.lineTo(x + lean + 12, base - h); g.quadraticCurveTo(x + lean * .4 + 18, base - h * .5, x + 14, base); g.fill();
  const tx = x + lean + 6, ty = base - h;
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .5, L = 190 + 40 * hash(k + x);
    g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * .6, ty + Math.sin(a) * L * .6 - 40, tx + Math.cos(a) * L, ty + Math.sin(a) * L + 60);
    g.quadraticCurveTo(tx + Math.cos(a) * L * .5, ty + Math.sin(a) * L * .5 - 10, tx, ty + 8); g.fill(); }
}
// per-frame cut paper: flat colour, soft cast shadow, warm top rim
function cut(g, fn, col, { rim = 'rgba(255,214,150,.45)', sh = .5 } = {}) {
  const p = new Path2D(); fn(p); g.save(); g.fillStyle = col; g.shadowColor = `rgba(0,0,8,${sh})`; g.shadowBlur = 14; g.shadowOffsetY = 8; g.fill(p);
  g.shadowColor = 'transparent'; g.clip(p); g.translate(0, 4); g.strokeStyle = rim; g.lineWidth = 3; g.stroke(p); g.restore();
}
// a glowing mushroom: dark paper stem, emissive cap (k = glow 0..1)
function mushroom(g, x, y, s, k, t, seed = 0) {
  const cw = s, ch = s * .42, sh = s * .62, f = flick(t, seed) * k;
  cut(g, p => { p.moveTo(x - s * .07, y); p.quadraticCurveTo(x - s * .1, y - sh * .5, x - s * .06, y - sh); p.lineTo(x + s * .06, y - sh); p.quadraticCurveTo(x + s * .03, y - sh * .5, x + s * .09, y); p.closePath(); }, '#1d2a44');
  const cap = new Path2D(); cap.moveTo(x - cw / 2, y - sh); cap.bezierCurveTo(x - cw * .45, y - sh - ch * 1.25, x + cw * .45, y - sh - ch * 1.25, x + cw / 2, y - sh);
  for (let i = 6; i >= 0; i--) cap.quadraticCurveTo(x - cw / 2 + cw * (i + .5) / 7, y - sh + ch * .16, x - cw / 2 + cw * i / 7, y - sh); cap.closePath();
  g.save(); g.shadowColor = 'rgba(0,0,8,.5)'; g.shadowBlur = 14; g.shadowOffsetY = 8; g.fillStyle = '#1a2340'; g.fill(cap); g.restore();
  if (f > 0) {
    g.save(); g.globalAlpha *= clamp(f); const gr = g.createRadialGradient(x - cw * .1, y - sh - ch * .6, 2, x, y - sh - ch * .3, cw * .62);
    gr.addColorStop(0, '#f4ffd8'); gr.addColorStop(.35, '#b9ff9a'); gr.addColorStop(1, '#3fc566'); g.fillStyle = gr; g.fill(cap);
    g.strokeStyle = 'rgba(20,80,40,.5)'; g.lineWidth = 2; for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(x - cw / 2 + cw * i / 7, y - sh + 2); g.lineTo(x - cw * .05 + (i - 3.5) * cw * .04, y - sh - ch * .55); g.stroke(); }
    g.restore(); bloom(g, x, y - sh - ch * .4, cw * 1.25, GRN, .55 * f); glow(g, x, y - sh * .3, cw * .7, GRN, .18 * f);
  }
}
function insect(g, x, y, s, t, { fly = 1, ang = 0, kind = 0, seed = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); const col = '#0b0f1c';
  const fl = fly ? Math.sin(t * 38 + seed * 5) : 0;
  if (fly) { g.save(); g.fillStyle = 'rgba(220,235,255,.55)'; for (const sd of [-1, 1]) { g.save(); g.rotate(sd * (.5 + .45 * fl)); g.beginPath(); g.ellipse(sd * 4, -16, 9, 22, 0, 0, TAU); g.fill(); g.restore(); } g.restore(); }
  g.strokeStyle = col; g.lineWidth = 2.6; for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(0, -4 + i * 7); g.lineTo(sd * 15, -8 + i * 10 + (fly ? 0 : 3 * Math.sin(t * 14 + i + sd))); g.stroke(); }
  cut(g, p => { if (kind === 0) p.ellipse(0, 4, 11, 17, 0, 0, TAU); else p.ellipse(0, 4, 7, 15, 0, 0, TAU); p.moveTo(8, -16); p.arc(0, -16, 8, 0, TAU); }, col, { rim: 'rgba(180,255,190,.5)', sh: .3 });
  g.restore();
}
// small cut card on a stick with an icon
function card(g, x, y, w, h, k, icon, { col = '#f3e3bf', stick = true } = {}) {
  if (k <= 0) return; g.save(); g.translate(x, y + (1 - backOut(k)) * 420); g.globalAlpha *= clamp(k * 2);
  if (stick) cut(g, p => p.rect(-5, h / 2 - 4, 10, 420), '#3a2616', { sh: .3 });
  cut(g, p => p.roundRect(-w / 2, -h / 2, w, h, 12), col); icon(g); g.restore();
}
function xMark(g, k, s = 70) { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 3); const sc = lerp(1.6, 1, eo(k)); g.scale(sc, sc);
  g.strokeStyle = '#b3261e'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-s, -s); g.lineTo(s, s); g.moveTo(s, -s); g.lineTo(-s, s); g.stroke(); g.restore(); }
function thermo(g, x, y, lev, k) { if (k <= 0) return; g.save(); g.globalAlpha *= k; g.translate(x, y);
  cut(g, p => p.roundRect(-60, -170, 120, 330, 20), '#f3e3bf'); g.fillStyle = '#c9d6e4'; g.beginPath(); g.roundRect(-14, -140, 28, 220, 14); g.fill();
  g.fillStyle = '#3d7fd8'; g.beginPath(); g.arc(0, 100, 30, 0, TAU); g.fill(); g.fillRect(-9, 80 - 200 * lev, 18, 200 * lev + 20);
  g.fillStyle = '#2a1d38'; for (let i = 0; i < 6; i++) g.fillRect(18, -120 + i * 34, 16, 3); g.restore(); }

// ---------------- baked layer stacks ----------------
const NIGHT = { light: [700, 330], lightCol: '255,214,160' };
const F = {
  far: layer(g => mountains(g, 880, [[120, 380], [330, 520], [560, 330], [760, 470], [940, 360]]), { col: '#5a76ad', trans: .95, ...NIGHT }),
  mid: layer(g => canopy(g, 1000, 9, 11), { col: '#2c3f72', trans: .5, ...NIGHT }),
  grd: layer(g => hillsP(g, 1060, 50, 2, 3), { col: '#1a2248', trans: .22, ...NIGHT }),
  log: layer(g => { logP(g, 470, 1050, 840, 160); g.globalCompositeOperation = 'destination-out'; g.lineWidth = 5; g.strokeStyle = '#000';
    for (let i = 0; i < 9; i++) { const y = 1000 + i * 12 + 6 * hash(i); g.beginPath(); g.moveTo(90 + 60 * hash(i * 3), y); g.bezierCurveTo(300, y + 10 * Math.sin(i), 600, y - 8, 850 - 50 * hash(i * 5), y + 4); g.stroke(); }
    g.lineWidth = 6; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(70, 1050, 50 - k * 16, 74 - k * 22, 0, 0, TAU); g.stroke(); } }, { col: '#2e3766', trans: .18, ...NIGHT }),
  moss: layer(g => { for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-40 + i * 125, 1250 + 40 * hash(i), 120, 70 + 30 * hash(i * 2), 0, 0, TAU); g.fill(); }
    g.fillRect(-100, 1270, BW + 200, 300); for (let i = 0; i < 70; i++) { const x = hash(i * 1.3) * BW, y = 1180 + hash(i * 2.7) * 90, h = 40 + 50 * hash(i * 4.1); g.beginPath(); g.moveTo(x - 5, y + 30); g.quadraticCurveTo(x + 6, y - h * .5, x + 14 * (hash(i) - .5), y - h); g.quadraticCurveTo(x + 4, y - h * .4, x + 5, y + 30); g.fill(); }
    [[120, 1205, 60], [830, 1215, 70], [690, 1235, 44]].forEach(([x, y, s]) => { g.fillRect(x - 6, y - s * .55, 12, s * .6); g.beginPath(); g.ellipse(x, y - s * .55, s * .5, s * .32, 0, Math.PI, 0); g.fill(); }); }, { col: '#0c1230', trans: .06, ...NIGHT }),
  logs: layer(g => { logP(g, 260, 1060, 520, 120); logP(g, 760, 1150, 560, 140); }, { col: '#252e5a', trans: .14, ...NIGHT }),
  front: layer(ferns, { col: '#060a18', trans: 0, blur: 3 }),
};
const WARM = { light: [470, 420], lightCol: '255,230,170' };
const A = {
  far: layer(g => hillsP(g, 760, 170, 1, 2), { col: '#d08a5c', trans: .9, ...WARM }),
  mid: layer(g => { g.fillRect(160, 900, 620, 60); g.fillRect(190, 870, 560, 34);
    for (let i = 0; i < 6; i++) { const x = 220 + i * 100; g.fillRect(x, 560, 50, 320); g.fillRect(x - 10, 548, 70, 20); }
    g.beginPath(); g.moveTo(170, 548); g.lineTo(470, 400); g.lineTo(770, 548); g.closePath(); g.fill(); g.fillRect(-100, 960, BW + 200, 600);
    g.beginPath(); g.arc(860, 640, 130, 0, TAU); g.arc(780, 700, 100, 0, TAU); g.fill(); g.fillRect(842, 680, 30, 300); }, { col: '#7a3a22', trans: .4, ...WARM }),
  grd: layer(g => hillsP(g, 1150, 40, 4, 2), { col: '#2a120a', trans: .1, ...WARM }),
  front: layer(g => { g.beginPath(); g.ellipse(-30, BH, 260, 200, 0, 0, TAU); g.ellipse(BW + 40, BH + 20, 280, 210, 0, 0, TAU); g.fill(); }, { col: '#140806', trans: 0, blur: 3 }),
};
const SEA = { light: [470, 0], lightCol: '170,240,230' };
const D = {
  far: layer(g => hillsP(g, 1130, 120, 2, 4), { col: '#2f7480', trans: .9, ...SEA }),
  mid: layer(g => { for (let i = 0; i < 9; i++) { const x = 40 + i * 110 + 30 * hash(i); g.beginPath(); g.moveTo(x, BH); for (let k = 0; k <= 12; k++) g.lineTo(x + 26 * Math.sin(k * .8 + i), BH - k * (60 + 30 * hash(i * 2))); for (let k = 12; k >= 0; k--) g.lineTo(x + 18 + 26 * Math.sin(k * .8 + i), BH - k * (60 + 30 * hash(i * 2))); g.fill(); } hillsP(g, 1230, 40, 7, 3); }, { col: '#17505e', trans: .4, ...SEA }),
  front: layer(ferns, { col: '#041219', trans: 0, blur: 3 }),
};
const VIO = { light: [470, 640], lightCol: '200,255,200' };
const C = {
  far: layer(g => { g.beginPath(); g.arc(470, 650, 520, Math.PI, 0); g.lineTo(990, 680); g.lineTo(-50, 680); g.fill(); }, { col: '#43337a', trans: .9, ...VIO }),
  mid: layer(g => { g.beginPath(); g.rect(-100, -100, BW + 200, BH + 200); for (let i = 0; i < 26; i++) { const a = Math.PI + (i + .5) / 26 * Math.PI; g.moveTo(470, 690); g.arc(470, 690, 600, a - .035, a + .035); g.lineTo(470, 690); } g.fill('evenodd');
    g.beginPath(); g.arc(470, 1300, 360, 0, TAU); g.fill(); }, { col: '#271a50', trans: .45, ...VIO }),
  front: layer(ferns, { col: '#0a0618', trans: 0, blur: 3 }),
};
const P = {
  far: layer(g => { for (let i = 0; i < 7; i++) palmP(g, 60 + i * 140, 980, 380 + 120 * hash(i), (hash(i + 4) - .5) * 160); hillsP(g, 960, 30, 1, 4); }, { col: '#3f726c', trans: .9, light: [470, 380], lightCol: '200,240,220' }),
  mid: layer(g => { palmP(g, 120, 1100, 640, 90); palmP(g, 860, 1100, 600, -110); hillsP(g, 1080, 50, 3, 4); }, { col: '#1f4446', trans: .45, light: [470, 380], lightCol: '200,240,220' }),
  front: layer(ferns, { col: '#061212', trans: 0, blur: 3 }),
};

// ---------------- shared stack drawing ----------------
function stack(cam, z, cx, cy, fn) {           // camera zoom about (cx,cy) in box space, hand-held micro drift
  g.save(); g.translate(BW / 2, BH / 2); g.scale(z, z); g.translate(-cx + 1.2 * Math.sin(cam.t * .9), -cy + 1.0 * Math.sin(cam.t * .7 + 1)); fn(); g.restore();
}
function nightSky(t, dusk = 0, moonA = 1) {
  const gr = g.createLinearGradient(0, 0, 0, BH * .8);
  gr.addColorStop(0, `rgb(${lerp(10, 222, dusk)},${lerp(19, 140, dusk)},${lerp(48, 110, dusk)})`); gr.addColorStop(1, `rgb(${lerp(29, 250, dusk)},${lerp(43, 196, dusk)},${lerp(94, 140, dusk)})`);
  g.fillStyle = gr; g.fillRect(-200, -200, BW + 400, BH + 400);
  g.fillStyle = '#fff3d0'; for (let i = 0; i < 46; i++) { const a = (1 - dusk) * (.4 + .6 * Math.abs(Math.sin(t * .8 + i))); if (a < .05) continue; g.globalAlpha = a; g.beginPath(); g.arc(hash(i) * BW, hash(i * 7.1) * 760, 1.5 + 2 * hash(i * 3), 0, TAU); g.fill(); }
  g.globalAlpha = 1; if (moonA > 0) moon(g, 760, 300, 74, Math.PI, { a: moonA, glowA: moonA });
}
const CLUSTER = [[300, 975, 250, 0], [470, 968, 330, 1], [620, 978, 190, 2], [720, 985, 130, 3], [170, 985, 120, 4]];
function forest(t, cam, { dusk = 0, glowK = 1, ks = null, moonA = 1, extra = null, near = null, sunY = null, logs = false } = {}) {
  nightSky(t, dusk, moonA);
  if (sunY !== null) { glow(g, 300, sunY, 300, '255,190,110', .6); g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(300, sunY, 70, 0, TAU); g.fill(); }
  put(g, F.far, cam, .25); put(g, F.mid, cam, .5);
  if (dusk > 0) { g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = dusk * .6; g.fillStyle = '#ffb070'; g.fillRect(-200, -200, BW + 400, BH + 400); g.restore(); }
  put(g, F.grd, cam, .65); if (logs) put(g, F.logs, cam, .75); else put(g, F.log, cam, .75);
  g.save(); g.translate(-cam.x * .75, -cam.y * .75);
  if (!logs) CLUSTER.forEach(([x, y, s, sd], i) => mushroom(g, x, y, s, glowK * (ks ? ks[i] : 1), t, sd));
  if (extra) extra();
  g.restore();
  put(g, F.moss, cam, .9);
  if (near) { g.save(); g.translate(-cam.x * .9, -cam.y * .9); near(); g.restore(); }
  g.save(); g.translate(-cam.x * .9, -cam.y * .9); for (let i = 0; i < 18; i++) { const x = hash(i * 9.1) * BW, y = 1190 + hash(i * 3.9) * 110, k = glowK * (ks ? ks[i % 5] : 1) * (.5 + .5 * Math.sin(t * 1.3 + i)); if (k > .05) { g.fillStyle = `rgba(200,255,190,${.8 * k})`; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); glow(g, x, y, 24, GRN, .35 * k); } } g.restore();
  put(g, F.front, cam, 1);
}

// ---------------- scenes ----------------
const S = [];
// A: hook (p0-p2): glowing mushroom cluster already lit at frame 0; no battery / fire / sunlight cards
S.push([0, T(3), t => {
  const z = t < T(2) ? lerp(1.55, 1.2, ss(seg(t, 0, T(1) + .4))) : lerp(1.2, 1.75, ss(seg(t, T(2) - .2, E(2) + .4)));
  const cam = { x: lerp(-30, 20, seg(t, 0, 9)), y: 0, t };
  stack(cam, z, 470, lerp(830, 860, seg(t, T(2), E(2))), () => {
    const pulse = t > T(2) ? 1 + .35 * Math.sin(seg(t, T(2), E(2) + .3) * Math.PI) : 1;
    forest(t, cam, { glowK: pulse, near: () => {
      const k1 = seg(t, T(1) - .2, T(1) + .5) * (1 - seg(t, E(1) + .3, E(1) + .9));
      const w = [r(1, .85), r(1, 1.55), r(1, 2.55)];
      [[300, 'bat'], [470, 'fire'], [640, 'sun']].forEach(([x, ic], i) => card(g, x, 1215, 150, 150, clamp(k1 * 1.4 - i * .15), gg => {
        gg.fillStyle = '#2a1d38';
        if (ic === 'bat') { gg.fillRect(-44, -26, 80, 52); gg.fillRect(36, -12, 12, 24); gg.fillStyle = '#f3e3bf'; gg.fillRect(-30, -4, 30, 8); gg.fillRect(-19, -15, 8, 30); }
        if (ic === 'fire') { gg.beginPath(); gg.moveTo(0, -50); gg.bezierCurveTo(40, -10, 40, 40, 0, 44); gg.bezierCurveTo(-40, 40, -40, -10, 0, -50); gg.fill(); }
        if (ic === 'sun') { gg.beginPath(); gg.arc(0, 0, 26, 0, TAU); gg.fill(); gg.lineWidth = 8; gg.strokeStyle = '#2a1d38'; for (let a = 0; a < 8; a++) { gg.beginPath(); gg.moveTo(Math.cos(a * TAU / 8) * 36, Math.sin(a * TAU / 8) * 36); gg.lineTo(Math.cos(a * TAU / 8) * 52, Math.sin(a * TAU / 8) * 52); gg.stroke(); } }
        xMark(gg, seg(t, w[i], w[i] + .3), 52);
      }));
    } });
  });
  strip(g, 'WHY MUSHROOMS GLOW', BW / 2, 150, 1, { size: 62, seal: true, a: 1 - seg(t, E(2) - .2, E(2) + .3) });
}]);
// B: Aristotle (p3): warm ladder, temple, a jointed robed figure lifts a glowing stick; cold-to-the-touch thermometer
S.push([T(3) - .5, T(4), t => {
  const cam = { x: lerp(40, -30, seg(t, T(3) - .5, E(3) + .4)), y: 0, t };
  stack(cam, lerp(1.08, 1.18, seg(t, T(3), E(3))), 470, 760, () => {
    const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, '#f6d49c'); gr.addColorStop(1, '#e49a68'); g.fillStyle = gr; g.fillRect(-200, -200, BW + 400, BH + 400);
    glow(g, 470, 420, 380, '255,240,200', .5); put(g, A.far, cam, .25); put(g, A.mid, cam, .5); put(g, A.grd, cam, .75);
    g.save(); g.translate(-cam.x * .8, -cam.y * .8);
    const lift = ss(seg(t, r(3, 1.6), r(3, 2.4))), x = 330, y = 1180;
    cut(g, p => { p.moveTo(x - 90, y + 60); p.quadraticCurveTo(x - 80, y - 160, x - 40, y - 250); p.lineTo(x + 40, y - 250); p.quadraticCurveTo(x + 80, y - 160, x + 100, y + 60); p.closePath(); }, '#1c0c08');
    cut(g, p => { p.arc(x, y - 300, 46, 0, TAU); p.moveTo(x - 34, y - 290); p.quadraticCurveTo(x - 30, y - 200, x + 6, y - 196); p.quadraticCurveTo(x + 40, y - 220, x + 44, y - 290); p.closePath(); }, '#1c0c08');
    g.strokeStyle = 'rgba(255,200,140,.25)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 30 + i * 22, y - 220); g.quadraticCurveTo(x - 50 + i * 30, y - 80, x - 70 + i * 45, y + 50); g.stroke(); }
    g.fillStyle = '#1c0c08'; for (let i = 0; i < 7; i++) { const a = Math.PI * 1.05 + i * .18; g.beginPath(); g.ellipse(x + Math.cos(a) * 50, y - 300 + Math.sin(a) * 50, 14, 7, a, 0, TAU); g.fill(); }
    g.save(); g.translate(x + 40, y - 230); g.rotate(lerp(.9, -.55, lift));
    cut(g, p => { p.roundRect(-16, -14, 150, 32, 16); }, '#1c0c08');
    g.translate(150, 0); g.rotate(-lerp(.9, -.55, lift) - .3); cut(g, p => p.roundRect(-8, -60, 22, 120, 8), '#3a2412');
    const gw = .6 + .4 * flick(t); g.strokeStyle = `rgba(${GRN},.9)`; g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-2 + i * 5, -50); g.quadraticCurveTo(6 + i * 3, 0, -2 + i * 5, 50); g.stroke(); }
    bloom(g, 3, 0, 120, GRN, .5 * gw); g.restore();
    thermo(g, 720, 880, .12, seg(t, r(3, 3.1), r(3, 3.6)));
    g.restore(); put(g, A.front, cam, 1);
    tag(g, 'COLD LIGHT', 720, 1110, { k: eo(seg(t, r(3, 3.4), r(3, 3.8))), size: 46 });
  });
  strip(g, 'OVER 2,000 YEARS AGO', BW / 2, 150, seg(t, T(3) + .1, T(3) + .9), { size: 56 });
}]);
// C: foxfire (p4): lateral travel along glowing logs, vertical FOXFIRE title strip with seal
function logGlow(t, a = 1) {
  [[260, 1060, 520, 120], [760, 1150, 560, 140]].forEach(([x, y, w, h], j) => {
    for (let i = 0; i < 14; i++) { const yy = y - h * .35 + h * .7 * hash(i + j * 20), x0 = x - w * .42 + w * .3 * hash(i * 3 + j), L = w * (.2 + .4 * hash(i * 5 + j));
      g.strokeStyle = `rgba(${GRN},${(.35 + .35 * hash(i * 7)) * a * flick(t, i)})`; g.lineWidth = 3 + 3 * hash(i); g.beginPath(); g.moveTo(x0, yy); g.bezierCurveTo(x0 + L * .3, yy - 8, x0 + L * .6, yy + 8, x0 + L, yy); g.stroke(); }
    bloom(g, x, y, w * .6, GRN, .28 * a);
  });
}
S.push([T(4) - .5, T(5), t => {
  const cam = { x: lerp(-60, 60, seg(t, T(4) - .5, E(4) + .5)), y: 0, t };
  stack(cam, 1.12, 470, 820, () => forest(t, cam, { logs: true, extra: () => { logGlow(t); mushroom(g, 430, 1015, 130, 1, t, 2); mushroom(g, 540, 1008, 90, 1, t, 4); } }));
  vstrip(g, 'FOXFIRE', 820, 70, seg(t, r(4, 1.9), r(4, 2.9)), { size: 66 });
}]);
// D: the Turtle submarine (1776) - its compass lit by foxfire
S.push([T(5) - .5, T(6) + .1, t => {
  const cam = { x: lerp(-30, 30, seg(t, T(5), E(5))), y: 0, t };
  const z = lerp(1.0, 1.65, ss(seg(t, r(5, 1.8), E(5) - .2)));
  stack(cam, z, 470, lerp(700, 690, seg(t, T(5), E(5))), () => {
    const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, '#1d6170'); gr.addColorStop(1, '#03121a'); g.fillStyle = gr; g.fillRect(-200, -200, BW + 400, BH + 400);
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const x = 120 + i * 150 + 30 * Math.sin(t * .5 + i); g.fillStyle = 'rgba(160,240,230,.05)'; g.beginPath(); g.moveTo(x - 30, -100); g.lineTo(x + 30, -100); g.lineTo(x + 140, 1200); g.lineTo(x + 40, 1200); g.fill(); } g.restore();
    put(g, D.far, cam, .25); put(g, D.mid, cam, .5);
    g.save(); g.translate(-cam.x * .75, 8 * Math.sin(t * 1.3)); const x = 470, y = 700;
    cut(g, p => { p.roundRect(x - 60, y - 380, 120, 110, 40); }, '#7a5a2a');
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(255,220,150,.5)'; g.beginPath(); g.arc(x - 30 + i * 30, y - 330, 9, 0, TAU); g.fill(); }
    cut(g, p => { p.ellipse(x, y, 240, 300, 0, 0, TAU); }, '#3b2814');
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 4; for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(x, y, 240 - Math.abs(i) * 8, 300, 0, Math.PI * .55, Math.PI * 1.45); g.stroke(); }
    g.save(); g.translate(x + 250, y - 40); g.rotate(t * 3); cut(g, p => { p.ellipse(0, -50, 16, 50, 0, 0, TAU); p.ellipse(0, 50, 16, 50, 0, 0, TAU); }, '#7a5a2a'); g.restore();
    cut(g, p => p.rect(x - 300, y + 120, 70, 24), '#7a5a2a'); cut(g, p => { p.moveTo(x - 10, y + 300); p.lineTo(x + 30, y + 420); p.lineTo(x - 50, y + 420); p.closePath(); }, '#3b2814');
    // cutaway window: compass under foxfire
    g.save(); g.beginPath(); g.arc(x, y, 120, 0, TAU); g.clip(); g.fillStyle = '#0c1410'; g.fillRect(x - 130, y - 130, 260, 260);
    const fk = .75 + .25 * flick(t, 3); bloom(g, x, y, 170, GRN, .45 * fk);
    g.strokeStyle = `rgba(${GRN},.85)`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 90, 0, TAU); g.stroke();
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16; g.beginPath(); g.moveTo(x + Math.cos(a) * 78, y + Math.sin(a) * 78); g.lineTo(x + Math.cos(a) * 90, y + Math.sin(a) * 90); g.stroke(); }
    const na = -.4 + .15 * Math.sin(t * .9); g.fillStyle = `rgba(200,255,200,${fk})`; g.beginPath(); g.moveTo(x + Math.cos(na) * 72, y + Math.sin(na) * 72); g.lineTo(x + Math.cos(na + 1.6) * 10, y + Math.sin(na + 1.6) * 10); g.lineTo(x - Math.cos(na) * 50, y - Math.sin(na) * 50); g.lineTo(x + Math.cos(na - 1.6) * 10, y + Math.sin(na - 1.6) * 10); g.fill();
    g.fillStyle = `rgba(200,255,200,${.9 * fk})`; g.font = 'italic 700 34px "Cormorant Garamond"'; g.textAlign = 'center'; g.fillText('N', x, y - 52);
    g.restore(); g.strokeStyle = '#7a5a2a'; g.lineWidth = 14; g.beginPath(); g.arc(x, y, 124, 0, TAU); g.stroke();
    for (let i = 0; i < 10; i++) { const bt = (t * .35 + hash(i)) % 1; g.strokeStyle = `rgba(200,250,240,${.5 * (1 - bt)})`; g.lineWidth = 2; g.beginPath(); g.arc(x - 200 + hash(i * 3) * 400, y - 380 - bt * 500, 5 + 6 * hash(i), 0, TAU); g.stroke(); }
    g.restore(); put(g, D.front, cam, 1);
  });
  strip(g, 'THE TURTLE, 1776', BW / 2, 150, seg(t, r(5, 2.4), r(5, 3.2)), { size: 56, seal: true });
  tag(g, 'compass lit by foxfire', 470, 1240, { k: eo(seg(t, r(5, 3.4), r(5, 3.9))), size: 44 });
}]);
// E: chemistry (p6-p9): inside the cap; luciferin card, luciferase jaws + oxygen, burst of green light, recycle loop
function molCard(g, x, y, k, used = 0) {
  card(g, x, y, 280, 190, k, gg => { gg.strokeStyle = used ? '#7a6a80' : '#2a1d38'; gg.lineWidth = 6;
    const hex = (cx, cy) => { gg.beginPath(); for (let i = 0; i <= 6; i++) { const a = i * TAU / 6 + Math.PI / 6; gg.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34); } gg.stroke(); };
    hex(-62, 0); hex(0, 0); gg.beginPath(); gg.moveTo(30, 0); gg.lineTo(70, -24); gg.lineTo(110, 0); gg.stroke(); gg.beginPath(); gg.arc(110, 0, 6, 0, TAU); gg.stroke(); }, { stick: false });
}
S.push([T(6) - .3, T(10), t => {
  const cam = { x: 30 * Math.sin(t * .2), y: 0, t };
  stack(cam, lerp(1.0, 1.08, seg(t, T(6), E(9))), 470, 680, () => {
    const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, '#1a1036'); gr.addColorStop(1, '#07040f'); g.fillStyle = gr; g.fillRect(-200, -200, BW + 400, BH + 400);
    put(g, C.far, cam, .25); put(g, C.mid, cam, .5);
    g.save(); g.translate(-cam.x * .75, 0);
    const cx = 470, cy = 700, burst1 = seg(t, r(8, .1), r(8, 1.4)), loop = seg(t, r(9, .4), r(9, 3.2));
    const meet = ss(seg(t, r(7, 2.6), E(7) + .2));
    // luciferase jaws (left) and oxygen (right) slide in on sticks
    const jx = lerp(-260, lerp(210, 330, meet), eo(seg(t, T(7) + .1, r(7, 1.0)))) , ox = lerp(1200, lerp(730, 610, meet), eo(seg(t, r(7, 2.0), r(7, 2.7))));
    const gone = 1 - seg(t, r(8, 1.2), r(8, 1.8));
    if (t > T(7) && gone > 0) { g.save(); g.globalAlpha *= gone; g.translate(jx, cy);
      cut(g, p => p.rect(-6, 90, 12, 500), '#3a2616'); const o = .35 + .25 * (1 - meet);
      cut(g, p => { p.moveTo(0, 0); p.arc(0, 0, 110, o, TAU - o); p.closePath(); }, '#e6b85c'); g.restore();
      g.save(); g.globalAlpha *= gone; g.translate(ox, cy); cut(g, p => p.rect(-6, 60, 12, 500), '#3a2616');
      cut(g, p => { p.arc(-34, 0, 50, 0, TAU); p.moveTo(84, 0); p.arc(34, 0, 50, 0, TAU); }, '#9cc8ef');
      g.fillStyle = '#1e2a48'; g.font = 'italic 700 52px "Cormorant Garamond"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('O', -34, 2); g.fillText('O', 34, 2); g.restore(); }
    // the fuel card (luciferin) rises in, rides the recycle loop
    const kin = seg(t, r(6, 1.6), r(6, 2.4)); let mx = cx, my = cy, used = 0, mk = kin;
    if (t > r(9, .4)) { const a = -Math.PI / 2 + loop * TAU; mx = cx + Math.cos(a) * 250 * Math.sin(loop * Math.PI); my = cy + 160 + Math.sin(a) * 250 * Math.sin(loop * Math.PI) - 160 * Math.cos(loop * Math.PI * 2) * 0 + 0; used = loop < .7 ? 1 : 0; }
    if (burst1 > 0 && t < r(9, .4)) used = burst1 > .5 ? 1 : 0;
    // light burst rays
    const bk = Math.sin(clamp(burst1) * Math.PI) + .8 * Math.sin(seg(t, r(9, 2.9), r(9, 3.6)) * Math.PI);
    if (bk > 0) { g.save(); g.globalAlpha *= clamp(bk); for (let i = 0; i < 14; i++) { const a = i * TAU / 14 + .1, L = 220 + 260 * bk;
      cut(g, p => { p.moveTo(cx + Math.cos(a - .05) * 150, cy + Math.sin(a - .05) * 150); p.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); p.lineTo(cx + Math.cos(a + .05) * 150, cy + Math.sin(a + .05) * 150); p.closePath(); }, '#c9ffb0', { rim: 'rgba(255,255,255,.6)', sh: .2 }); }
      g.restore(); bloom(g, cx, cy, 520 * clamp(bk), GRN, .8 * clamp(bk)); }
    // recycle arrows: paper arc strips growing round the loop
    const ak = seg(t, r(9, .2), r(9, 1.4)) * (1 - seg(t, E(9), E(9) + .4));
    if (ak > 0) for (let i = 0; i < 3; i++) { const a0 = -Math.PI / 2 + i * TAU / 3 + .25, a1 = a0 + (TAU / 3 - .5) * ss(ak);
      cut(g, p => { p.arc(cx, cy + 160, 330, a0, a1); p.arc(cx, cy + 160, 296, a1, a0, true); p.closePath(); }, '#f3e3bf');
      const ex = cx + Math.cos(a1) * 313, ey = cy + 160 + Math.sin(a1) * 313; cut(g, p => { p.moveTo(ex + Math.cos(a1) * 34, ey + Math.sin(a1) * 34); p.lineTo(ex - Math.cos(a1) * 34, ey - Math.sin(a1) * 34); p.lineTo(ex + Math.cos(a1 + Math.PI / 2) * 40, ey + Math.sin(a1 + Math.PI / 2) * 40); p.closePath(); }, '#f3e3bf'); }
    molCard(g, mx, my, mk, used);
    thermo(g, 800, 1120, .1, seg(t, r(8, 2.0), r(8, 2.5)) * (1 - seg(t, E(8) + .1, E(8) + .5)));
    g.restore(); put(g, C.front, cam, 1);
    tag(g, 'LUCIFERIN (the fuel)', 470, 960, { k: eo(seg(t, r(6, 2.6), r(6, 3.1))) * (1 - seg(t, T(7) - .1, T(7) + .4)), size: 46 });
    tag(g, 'LUCIFERASE', 250, 900, { k: eo(seg(t, r(7, .9), r(7, 1.3))) * (1 - seg(t, E(7) - .2, E(7) + .2)), size: 44, rot: .04 });
    tag(g, 'OXYGEN', 700, 900, { k: eo(seg(t, r(7, 2.4), r(7, 2.8))) * (1 - seg(t, E(7) - .2, E(7) + .2)), size: 44 });
    tag(g, 'LIGHT, NOT HEAT', 470, 1150, { k: eo(seg(t, r(8, 2.1), r(8, 2.5))) * (1 - seg(t, E(8) + .1, E(8) + .5)), size: 50 });
  });
  strip(g, 'THE TRICK: CHEMISTRY', BW / 2, 150, seg(t, T(6) + .2, T(6) + 1.0) * (1 - seg(t, T(9) - .3, T(9) + .1)), { size: 56, seal: true });
  strip(g, 'RECYCLED, AGAIN AND AGAIN', BW / 2, 150, seg(t, r(9, .9), r(9, 1.7)), { size: 52 });
}]);
// F: it costs energy (p10): close on one mushroom, its paper energy meter empties, WHY BOTHER?
S.push([T(10) - .5, T(11), t => {
  const cam = { x: 0, y: 0, t }, ml = seg(t, r(10, .3), r(10, 1.7));
  stack(cam, lerp(1.6, 1.85, seg(t, T(10) - .5, E(10))), 470, 870, () => forest(t, cam, { glowK: 1 - .45 * ml, extra: () => {
    for (let i = 0; i < 5; i++) { const on = i >= Math.floor(ml * 5.01) ? 1 : 0; cut(g, p => p.roundRect(340 + i * 54, 590, 44, 44, 6), on ? '#c9ffb0' : '#2a3350'); if (on) glow(g, 362 + i * 54, 612, 50, GRN, .4); }
  } }));
  tag(g, 'light costs energy', 470, 470, { k: eo(seg(t, r(10, .3), r(10, .8))), size: 46 });
  strip(g, 'WHY BOTHER?', BW / 2, 150, seg(t, r(10, 1.6), r(10, 2.3)), { size: 66, seal: true });
}]);
// G: the 2015 Brazil experiment (p11-p12): glowing vs dark fake mushrooms, insects fly in, paper tallies
const BUGS = Array.from({ length: 13 }, (_, i) => ({ to: i < 10 ? 0 : 1, sx: hash(i * 3) < .5 ? -120 : BW + 120, sy: 200 + hash(i * 5) * 700, d: hash(i * 7) * 2.4, kind: i % 2 }));
S.push([T(11) - .5, T(13), t => {
  const cam = { x: lerp(-30, 30, seg(t, T(11), E(12))), y: 0, t };
  stack(cam, 1.1, 470, 800, () => {
    const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, '#081a20'); gr.addColorStop(1, '#16343a'); g.fillStyle = gr; g.fillRect(-200, -200, BW + 400, BH + 400);
    g.fillStyle = '#fff3d0'; for (let i = 0; i < 30; i++) { g.globalAlpha = .3 + .5 * Math.abs(Math.sin(t + i)); g.beginPath(); g.arc(hash(i + 9) * BW, hash(i * 4.3) * 500, 2, 0, TAU); g.fill(); } g.globalAlpha = 1;
    put(g, P.far, cam, .25); put(g, P.mid, cam, .5);
    g.save(); g.translate(-cam.x * .75, 0);
    const k = seg(t, T(11) - .3, T(11) + .5);
    const fake = (x, lit) => { cut(g, p => p.rect(x - 10, 940, 20, 160), '#55606a'); cut(g, p => { p.ellipse(x, 940, 120, 70, 0, Math.PI, 0); p.closePath(); }, lit ? '#b9ffa0' : '#3e4a5a', { rim: 'rgba(255,255,255,.5)' });
      if (lit) { bloom(g, x, 905, 280, GRN, .6 * flick(t, x)); g.fillStyle = '#f4ffe0'; g.beginPath(); g.arc(x, 930, 14, 0, TAU); g.fill(); } };
    g.save(); g.globalAlpha *= k; g.fillStyle = '#081414'; g.fillRect(-200, 1090, BW + 400, 400); fake(260, 1); fake(680, 0); g.restore();
    BUGS.forEach((b, i) => { const ta = r(12, .1 + b.d * .9), u = eo(seg(t, ta, ta + 1.3)); if (u <= 0) return;
      const tx = (b.to ? 680 : 260) + Math.cos(i * 2.4) * (60 + 40 * hash(i)), ty = 880 + Math.sin(i * 2.4) * 60;
      const x = lerp(b.sx, tx, u) + (1 - u) * 60 * Math.sin(t * 3 + i), y = lerp(b.sy, ty, u) + (1 - u) * 50 * Math.cos(t * 2.5 + i) + (u >= 1 ? 6 * Math.sin(t * 4 + i) : 0);
      insect(g, x, y, 2.2, t, { kind: b.kind, seed: i, ang: (u < 1 ? (b.sx < 0 ? .5 : -.5) : 0) }); });
    g.restore(); put(g, P.front, cam, 1);
    tag(g, 'glowing fake', 260, 1180, { k: eo(seg(t, r(11, 2.2), r(11, 2.7))), size: 44 });
    tag(g, 'dark fake', 680, 1180, { k: eo(seg(t, r(11, 2.5), r(11, 3.0))), size: 44, rot: .03 });
    const ck = seg(t, r(12, .5), r(12, 3.2));
    // paper tally: one cut slip per insect that landed (no counts claimed, just many vs few)
    [[260, 10], [680, 3]].forEach(([x, n], j) => { for (let i = 0; i < n; i++) { const tk = seg(t, r(12, .6 + i * .22 + j * .4), r(12, .9 + i * .22 + j * .4)); if (tk <= 0) continue;
      cut(g, p => p.roundRect(x - 120 + (i % 5) * 50, 470 + Math.floor(i / 5) * 70 - (1 - eo(tk)) * 30, 36, 56, 5), '#f3e3bf'); g.fillStyle = '#2a1d38'; g.fillRect(x - 108 + (i % 5) * 50, 496 + Math.floor(i / 5) * 70, 12, 4); } });
    tag(g, 'insects caught', 470, 660, { k: eo(seg(t, r(12, .8), r(12, 1.2))), size: 42 });
  });
  strip(g, 'A 2015 STUDY IN BRAZIL', BW / 2, 150, seg(t, T(11) + .1, T(11) + .9), { size: 56, seal: true });
}]);
// H: spores (p13): a beetle on the real cap picks up spores and carries them to a new log, where a tiny mushroom sprouts
S.push([T(13) - .5, T(14), t => {
  const cam = { x: lerp(-40, 60, seg(t, T(13), E(13))), y: 0, t };
  stack(cam, 1.3, lerp(420, 560, seg(t, T(13), E(13))), 900, () => forest(t, cam, { extra: () => {
    const u = ss(seg(t, r(13, 1.2), r(13, 3.0))), bx = lerp(470, 860, u), by = lerp(700, 960, u) - 160 * Math.sin(u * Math.PI);
    for (let i = 0; i < 26; i++) { const s0 = hash(i * 4.1), sp = seg(t, r(13, .2 + s0), r(13, .8 + s0)); if (sp <= 0) continue;
      const fx = lerp(470 + (hash(i) - .5) * 300, bx + (hash(i * 2) - .5) * 40, sp), fy = lerp(700, by + 10, sp);
      g.fillStyle = `rgba(230,255,210,${.8})`; g.beginPath(); g.arc(fx, fy, 4, 0, TAU); g.fill(); glow(g, fx, fy, 16, GRN, .4); }
    insect(g, bx, by, 2.4, t, { fly: u > 0 && u < 1 ? 1 : 0, ang: u > 0 && u < 1 ? .6 : 0, seed: 3 });
    const sp = seg(t, r(13, 3.0), E(13) + .3); if (sp > 0) { g.save(); g.translate(880, 1000); g.scale(backOut(sp), backOut(sp)); mushroom(g, 0, 0, 110, 1, t, 9); g.restore(); }
  } }));
  tag(g, 'spores hitch a ride', 470, 1250, { k: eo(seg(t, r(13, 2.3), r(13, 2.8))), size: 46 });
}]);
// I: daily clock (p14): locked frame, only the light changes: dusk to night, the glow rises as the sun sets
S.push([T(14) - .5, T(15), t => {
  const cam = { x: 0, y: 0, t }, n = ss(seg(t, T(14), r(14, 3.6)));
  stack(cam, 1.15, 470, 820, () => forest(t, cam, { dusk: 1 - n, glowK: lerp(.12, 1, n), moonA: n, sunY: lerp(640, 1000, n) }));
  card(g, BW / 2, 330, 230, 230, seg(t, T(14) - .4, T(14) + .3), gg => { gg.strokeStyle = '#2a1d38'; gg.lineWidth = 6; gg.beginPath(); gg.arc(0, 0, 88, 0, TAU); gg.stroke();
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12; gg.beginPath(); gg.moveTo(Math.cos(a) * 72, Math.sin(a) * 72); gg.lineTo(Math.cos(a) * 84, Math.sin(a) * 84); gg.stroke(); }
    const a = -Math.PI / 2 + lerp(.5, 1, n) * TAU * 1; gg.lineWidth = 9; gg.beginPath(); gg.moveTo(0, 0); gg.lineTo(Math.cos(a) * 64, Math.sin(a) * 64); gg.stroke(); gg.fillStyle = '#b3261e'; gg.beginPath(); gg.arc(0, 0, 10, 0, TAU); gg.fill(); }, { stick: false });
  strip(g, 'GLOW ON A DAILY CLOCK', BW / 2, 150, seg(t, r(14, .8), r(14, 1.5)), { size: 54 });
}]);
// J: the answer (p15): mushrooms as a row of lanterns, insects circling
S.push([T(15) - .5, T(16), t => {
  const cam = { x: lerp(20, -20, seg(t, T(15), E(15))), y: 0, t };
  stack(cam, lerp(1.35, 1.1, ss(seg(t, T(15) - .5, E(15)))), 470, 860, () => forest(t, cam, { glowK: 1.15, extra: () => {
    for (let i = 0; i < 5; i++) { const a = t * (.8 + .2 * i) + i * 1.3; insect(g, 470 + Math.cos(a) * (180 + 40 * i), 730 + Math.sin(a) * 90, 1.9, t, { seed: i, kind: i % 2, ang: Math.cos(a) > 0 ? .4 : -.4 }); }
  } }));
  strip(g, 'A NIGHT-TIME SIGN', BW / 2, 150, seg(t, r(15, 1.4), r(15, 2.2)), { size: 62, seal: true });
}]);
// K: end card (p16): the lights go out one by one, the big cap last; follow line as a paper strip
S.push([T(16) - .5, TL.total + 1, t => {
  const cam = { x: 0, y: 0, t };
  const ks = CLUSTER.map((c, i) => i === 1 ? 1 : 1 - seg(t, r(16, .2 + i * .25), r(16, .6 + i * .25)));
  stack(cam, lerp(1.1, 1.25, seg(t, T(16), TL.total)), 470, 900, () => forest(t, cam, { ks }));
  strip(g, 'Follow for more of', BW / 2, 230, seg(t, r(16, .05), r(16, .7)), { size: 64, font: 'italic 700' });
  strip(g, 'how it really works.', BW / 2, 345, seg(t, r(16, .5), r(16, 1.2)), { size: 72, seal: true });
}]);

// curtain: near-plane fern halves meeting at the centre (chapter change into the chemistry)
function curtain(k) { if (k <= 0) return; const off = (1 - k) * (BW / 2 + 140);
  g.save(); g.fillStyle = '#05030c'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30;
  g.save(); g.translate(-off, 0); g.beginPath(); g.moveTo(-50, -50); g.lineTo(BW / 2 + 6, -50); for (let y = 0; y <= BH + 50; y += 50) g.lineTo(BW / 2 + 6 + 30 * Math.sin(y * .05), y); g.lineTo(-50, BH + 50); g.fill(); g.restore();
  g.save(); g.translate(off, 0); g.beginPath(); g.moveTo(BW + 50, -50); g.lineTo(BW / 2 - 6, -50); for (let y = 0; y <= BH + 50; y += 50) g.lineTo(BW / 2 - 6 + 30 * Math.sin(y * .05), y); g.lineTo(BW + 50, BH + 50); g.fill(); g.restore();
  g.restore(); }
function spillCol(t) { if (t > T(3) - .3 && t < T(4) - .2) return ['255,200,140', .35]; if (t > T(5) - .3 && t < T(6) - .3) return ['120,230,220', .3]; return [GRN, .3]; }
function scene(t) {
  g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H);
  g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .5, b, .5); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  curtain(Math.sin(clamp(seg(t, T(6) - 1.0, T(6) + .2)) * Math.PI));
  vignette(g, .5); g.restore();
  const [sc, sa] = spillCol(t); lampFrame(g, sc, sa);
}
function sub(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start, a = seg(t, p.start - .05, p.start + .15) * (1 - seg(t, nx - .25, nx - .05));
  subtitle(g, p.cap, a, 1570);
}
const CUES = [['chime', .3, 84], ['pop', r(1, .85)], ['pop', r(1, 1.55)], ['pop', r(1, 2.55)], ['sparkle', r(2, .2)], ['whoosh', T(3) - .4], ['chime', r(3, 3.3), 79], ['whoosh', T(4) - .4], ['sparkle', r(4, 2.0)],
  ['whoosh', T(5) - .4], ['bubbles', r(5, .5)], ['chime', r(5, 2.5), 76], ['whoosh', T(6) - .9], ['slide', r(6, 1.6)], ['slide', r(7, .1)], ['slide', r(7, 2.0)], ['pop', r(7, 2.8)], ['sparkle', r(8, .1)], ['chime', r(8, .2), 88],
  ['whoosh', r(9, .3)], ['sparkle', r(9, 3.0)], ['whoosh', T(10) - .4], ['pop', r(10, 1.7)], ['whoosh', T(11) - .4], ['pop', r(11, 2.3)], ['pop', r(11, 2.6)], ['sparkle', r(12, .6)], ['whoosh', T(13) - .4], ['sparkle', r(13, 3.1)],
  ['whoosh', T(14) - .4], ['chime', r(14, 3.4), 81], ['whoosh', T(15) - .4], ['sparkle', r(15, 1.5)], ['chime', T(16) + .2, 84]];
window.CUES = CUES; window.DUR = TL.total;
window.seek = t => { scene(t); sub(t); };
window.thumb = () => {
  const t = 3.0; g.save(); g.fillStyle = PAL.room; g.fillRect(0, 0, W, H); g.translate(BOX.x, BOX.y); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  const cam = { x: 0, y: 0, t }; stack(cam, 1.45, 470, 900, () => forest(t, cam, { glowK: 1.25 })); vignette(g, .45);
  strip(g, 'MUSHROOMS', BW / 2, 1020, 1, { size: 120 }); strip(g, 'THAT GLOW', BW / 2, 1200, 1, { size: 120, seal: true });
  g.restore(); lampFrame(g, GRN, .35);
};
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
