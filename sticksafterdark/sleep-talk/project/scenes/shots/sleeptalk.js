// Sticks After Dark #8 "Sleep Talk" (60-70 s cut). Kit: /kits/sticks/sticks.js. Accent: violet sleep-app glow.
// Project-local sets (the kit has no phone app UI, no lying close-up, no small bedroom): defined below.
import * as K from '/kits/sticks/sticks.js';
import { E } from '/engine/core.js';
const { INK, chalk, line, rect, ellipse, blob, fillPoly, lightPool, darkness, text, clamp, lerp, prog, ease, noise, rng, alpha, mix } = K;
K.setAccent('#b48cff');
const VIO = K.K.accent;                      // violet sleep-app glow
const SCREEN = '#120c22';                    // dark violet phone screen
const PALE = '#ece4ff';
const T = (g, s, x, y, o = {}) => text(g, s, x, y, { font: 'Nunito', weight: 800, color: PALE, ...o });

// ---------------------------------------------------------------- helpers
function rrPts(x, y, w, h, r, n = 5) {
  const P = [], c = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  for (const [cx, cy, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return P;
}
function rrFill(g, x, y, w, h, r, fill) { g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); }
// a phone seen face-on; inside(g, sx, sy, sw, sh) draws the screen (clipped). glow 0..1
function phoneBody(g, x, y, w, h, o = {}) {
  const { glow = 1, inside, seed = 700 } = o, r = w * 0.12, b = w * 0.05;
  rrFill(g, x, y, w, h, r, '#05040a');
  const sx = x + b, sy = y + b, sw = w - 2 * b, sh = h - 2 * b;
  g.save(); g.beginPath(); g.roundRect(sx, sy, sw, sh, r * 0.75); g.clip();
  g.fillStyle = SCREEN; g.fillRect(sx, sy, sw, sh);
  g.fillStyle = `rgba(180,140,255,${0.08 * glow})`; g.fillRect(sx, sy, sw, sh);
  inside && inside(g, sx, sy, sw, sh);
  g.fillStyle = `rgba(0,0,0,${1 - glow})`; g.fillRect(sx, sy, sw, sh);
  g.restore();
  chalk(g, rrPts(x, y, w, h, r), { w: 5, seed, closed: true });
  chalk(g, rrPts(sx, sy, sw, sh, r * 0.75), { w: 2, seed: seed + 1, closed: true, a: 0.45, double: false });
  lightPool(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.9, VIO, 0.32 * glow);
}
// crescent moon icon (the app's logo)
function moonIcon(g, x, y, r, col = VIO) {
  g.save(); g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(x + r * 0.45, y - r * 0.3, r * 0.85, 0, Math.PI * 2); g.fill(); g.restore();
}
const fmt = (s) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// ---------------------------------------------------------------- the night's recording (41:07 = 2467 s)
const LEN = 2467;
// my whispered answers (seconds). Long flat pauses between them. The OTHER voice is the very last shape.
const MINE = [[188, 214], [541, 558], [904, 949], [1287, 1322], [1548, 1559], [1748, 1797], [1972, 2006]];
const OTHER = [2448, 2458];
function ampAt(sec, showOther = true) {
  for (const [a, b] of MINE) if (sec >= a && sec <= b) { const u = (sec - a) / (b - a); return (0.25 + 0.75 * Math.abs(noise(sec * 0.9, 3))) * Math.sin(Math.PI * u) ** 0.4; }
  return 0.02 + 0.015 * Math.abs(noise(sec * 2.1, 5));
}
const isOther = (sec) => sec >= OTHER[0] && sec <= OTHER[1];
// a waveform strip. view: [s0, s1] seconds shown across [x0, x1]. playhead (sec) colours bars before it.
function strip(g, x0, x1, y, hMax, s0, s1, o = {}) {
  const { play = -1, other = false, barW = 10, gap = 16, otherK = 1 } = o;
  const n = Math.floor((x1 - x0) / gap);
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), sec = lerp(s0, s1, u), x = x0 + u * (x1 - x0);
    if (isOther(sec) && other) continue;
    const a = ampAt(sec), h = Math.max(5, hMax * a);
    g.fillStyle = play >= sec ? VIO : alpha(PALE, a > 0.1 ? 0.55 : 0.25);
    g.beginPath(); g.roundRect(x - barW / 2, y - h / 2, barW, h, barW / 2); g.fill();
  }
  if (other) {   // the last shape: not rounded bars. Thin, tall, jagged chalk spikes, hanging mostly BELOW the line.
    const a = (OTHER[0] - s0) / (s1 - s0), b = (OTHER[1] - s0) / (s1 - s0);
    if (b > 0 && a < 1) {
      const xa = x0 + a * (x1 - x0), xb = x0 + b * (x1 - x0), P = [], m = 14;
      for (let i = 0; i <= m; i++) { const u = i / m, env = Math.sin(Math.PI * u) ** 0.6; const up = i % 2 ? -0.35 : 1; P.push([lerp(xa, xb, u), y + up * hMax * 0.62 * env * (0.6 + 0.4 * Math.abs(noise(i * 1.7, 9)))]); }
      chalk(g, P, { w: 4, color: PALE, seed: 880, a: otherK, wob: 1.4 });
    }
  }
  if (play >= s0 && play <= s1) { const px = x0 + (play - s0) / (s1 - s0) * (x1 - x0); g.fillStyle = PALE; g.fillRect(px - 2, y - hMax * 0.75, 4, hMax * 1.5); g.beginPath(); g.arc(px, y - hMax * 0.75, 9, 0, Math.PI * 2); g.fill(); }
}

// ---------------------------------------------------------------- app screens (full phone, PH)
const PH = [150, 130, 640, 1040];
function appHeader(g, x, y, w, title, sub) {
  moonIcon(g, x + 70, y + 92, 26);
  T(g, title, x + 116, y + 92, { size: 44, weight: 900, align: 'left', color: '#ffffff' });
  if (sub) T(g, sub, x + 116, y + 140, { size: 28, weight: 700, align: 'left', color: alpha(PALE, 0.55) });
}
// live recording screen (night)
function recScreen(g, t, gt, talk) {
  phoneBody(g, ...PH, { inside: (g, x, y, w, h) => {
    appHeader(g, x, y, w, 'Sleep Talk', 'listening…');
    const on = Math.sin(gt * 3) > 0; g.fillStyle = on ? '#ff5a7a' : alpha('#ff5a7a', 0.3); g.beginPath(); g.arc(x + w - 80, y + 92, 12, 0, Math.PI * 2); g.fill();
    T(g, 'REC', x + w - 140, y + 92, { size: 28, weight: 900, align: 'right', color: alpha(PALE, 0.8) });
    const n = 24, cy = y + 470;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), xx = lerp(x + 50, x + w - 50, u);
      const a = 0.04 + talk * (0.3 + 0.7 * Math.abs(noise(u * 6 + gt * 7, 4))) * Math.sin(Math.PI * u) ** 0.5;
      const hh = 8 + 380 * a; g.fillStyle = alpha(VIO, 0.4 + 0.6 * Math.min(1, a * 2)); g.beginPath(); g.roundRect(xx - 7, cy - hh / 2, 14, hh, 7); g.fill();
    }
    lightPool(g, x + w / 2, cy, 320, VIO, 0.35 + 0.5 * talk);
    T(g, '2:14 AM', x + w / 2, y + 760, { size: 92, weight: 800, color: alpha(PALE, 0.9) });
  } });
}
// nights list
const NIGHTS = [['Mon', '0:00'], ['Tue', '0:00'], ['Wed', '0:03'], ['Thu', '0:00'], ['Fri', '0:00']];
function historyScreen(g, t, o = {}) {
  phoneBody(g, ...PH, { inside: (g, x, y, w, h) => {
    appHeader(g, x, y, w, 'Sleep Talk', 'past nights');
    NIGHTS.forEach(([d, len], i) => {
      const ry = y + 210 + i * 150, rh = 124, k = ease.out(prog(t, 0.1 + i * 0.12, 0.45 + i * 0.12));
      g.save(); g.globalAlpha *= k; g.translate(0, (1 - k) * 30);
      rrFill(g, x + 26, ry, w - 52, rh, 22, alpha(PALE, 0.06));
      T(g, d, x + 66, ry + rh / 2, { size: 40, weight: 900, align: 'left', color: '#ffffff' });
      T(g, len, x + w - 60, ry + rh / 2, { size: 34, weight: 800, align: 'right', color: len === '0:00' ? alpha(PALE, 0.45) : VIO });
      const x0 = x + 160, x1 = x + w - 150, my = ry + rh / 2;
      if (len === '0:00') chalk(g, [[x0, my], [x1, my]], { w: 3, color: alpha(PALE, 0.35), seed: 300 + i, double: false, wob: 0.6 });
      else { const P = []; for (let j = 0; j <= 30; j++) { const u = j / 30, bump = Math.exp(-((u - 0.55) ** 2) / 0.003); P.push([lerp(x0, x1, u), my - bump * 34 * (0.6 + 0.4 * Math.sin(j * 2.3))]); } chalk(g, P, { w: 3.5, color: VIO, seed: 310, double: false, wob: 0.6 }); }
      g.restore();
    });
  } });
}
// this morning: 41:07
function resultScreen(g, t, o = {}) {
  const { count = 1 } = o;
  phoneBody(g, ...PH, { inside: (g, x, y, w, h) => {
    appHeader(g, x, y, w, 'Last night', 'Sat · 11:48 PM – 6:52 AM');
    const s = Math.round(LEN * count);
    T(g, fmt(s), x + w / 2, y + 380, { size: 190, weight: 900, color: '#ffffff', glow: 26, glowColor: alpha(VIO, 0.8) });
    T(g, 'recorded', x + w / 2, y + 500, { size: 46, weight: 800, color: VIO });
    strip(g, x + 50, x + w - 50, y + 700, 120, 0, LEN * 0.985, { barW: 8, gap: 12 });
    T(g, '11:48 PM', x + 50, y + 820, { size: 26, weight: 700, align: 'left', color: alpha(PALE, 0.5) });
    T(g, '6:52 AM', x + w - 50, y + 820, { size: 26, weight: 700, align: 'right', color: alpha(PALE, 0.5) });
  } });
}
// playback: a zoomed strip that scrolls under a centred playhead. pos = seconds into the recording
function playScreen(g, t, pos, o = {}) {
  const { span = 90, other = false, otherK = 1, thumbAt = null } = o;
  phoneBody(g, ...PH, { inside: (g, x, y, w, h) => {
    appHeader(g, x, y, w, 'Last night', 'playing');
    T(g, fmt(pos), x + w / 2, y + 300, { size: 110, weight: 900, color: '#ffffff' });
    T(g, `/ ${fmt(LEN)}`, x + w / 2, y + 380, { size: 36, weight: 700, color: alpha(PALE, 0.5) });
    strip(g, x + 20, x + w - 20, y + 590, 260, pos - span / 2, pos + span / 2, { play: pos, other, otherK, barW: 12, gap: 20 });
    // scrub bar (whole night)
    const bx0 = x + 50, bx1 = x + w - 50, by = y + 830, u = clamp(pos / LEN);
    rrFill(g, bx0, by - 4, bx1 - bx0, 8, 4, alpha(PALE, 0.18)); rrFill(g, bx0, by - 4, (bx1 - bx0) * u, 8, 4, VIO);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx0 + (bx1 - bx0) * u, by, 16, 0, Math.PI * 2); g.fill();
    T(g, fmt(pos), bx0, by + 50, { size: 26, weight: 700, align: 'left', color: alpha(PALE, 0.5) });
    T(g, fmt(LEN), bx1, by + 50, { size: 26, weight: 700, align: 'right', color: alpha(PALE, 0.5) });
  } });
  const sx = PH[0] + 32 + 50, sw = PH[2] - 64 - 100, by = PH[1] + 32 + 830;
  return { knob: [sx + sw * clamp(pos / LEN), by] };
}
// a chalk thumb whose tip is at (x, y), coming in from the bottom-right
function thumb(g, x, y, seed = 480) {
  chalk(g, [[x + 190, y + 560], [x + 10, y + 60], [x + 25, y + 2], [x + 75, y - 2], [x + 110, y + 50], [x + 300, y + 510]], { w: 5, seed });
  chalk(g, [[x + 32, y + 18], [x + 70, y + 14]], { w: 2.5, seed: seed + 1, a: 0.6, double: false });
}

// ---------------------------------------------------------------- me, asleep (close, lying on the pillow)
// talk 0..1 = lips moving. o.turn: head turned toward the dark side. o.thing 0..1: the tall figure bending in (s29)
function sleepFace(g, t, gt, o = {}) {
  const { talk = 0, turn = 0, z = [1, 1.05], dur = 2, light = 1, thing = 0, still = false } = o;
  const [dx, dy] = still ? [0, 0] : K.drift(7);
  g.save(); g.translate(dx, dy); K.camera(g, lerp(z[0], z[1], ease.inOut(prog(t, 0, dur))), 470, 760);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  // mattress edge + pillow
  chalk(g, [[-40, 1150], [300, 1130], [700, 1140], [1120, 1120]], { w: 4, seed: 501, a: 0.7 });
  ellipse(g, 450, 980, 470, 150, { w: 5, seed: 500 });
  const px = 190, py = 1075;
  // my head on the pillow, eyes closed; lips move when the recording catches me
  const m = talk > 0.02 ? { w: 0.28 + 0.14 * Math.abs(noise(gt * 7, 1)), c: 0, o: talk * (0.04 + 0.2 * Math.abs(noise(gt * 9, 2))) } : { w: 0.4, c: 0.04, o: 0 };
  const hx = 470 + turn * 20, hy = 770;
  K.stickHead(g, hx, hy, 215, { eyes: 'closed', look: [turn, 0], mouth: m }, { neck: false, tilt: -0.16 + turn * 0.22, seed: 23 });
  // blanket over the shoulder
  const P = [[-60, 1010], [160, 960], [420, 1010], [700, 990], [1140, 1030], [1140, 2000], [-60, 2000]];
  fillPoly(g, P, '#100c1c'); chalk(g, P.slice(0, 5), { w: 5, seed: 510 });
  chalk(g, [[200, 1150], [420, 1220], [560, 1200]], { w: 2.5, seed: 511, a: 0.5, double: false });
  // the phone, lying on the blanket by the pillow, screen up: live waveform
  g.save(); g.translate(px, py); g.rotate(-0.32);
  rrFill(g, -88, -150, 176, 300, 26, '#05040a'); rrFill(g, -78, -140, 156, 280, 20, mix(SCREEN, VIO, 0.12 * light));
  moonIcon(g, -40, -105, 12);
  for (let i = 0; i < 9; i++) { const a = 0.06 + talk * Math.abs(noise(i * 1.3 + gt * 8, 2)); const hh = 6 + 120 * a; g.fillStyle = alpha(VIO, 0.5 + 0.5 * Math.min(1, a * 2)); g.beginPath(); g.roundRect(-60 + i * 15 - 4, 10 - hh / 2, 8, hh, 4); g.fill(); }
  g.restore();
  chalk(g, rrPts(px - 88, py - 150, 176, 300, 26).map(([x, y]) => { const c = Math.cos(-0.32), s = Math.sin(-0.32), X = x - px, Y = y - py; return [px + X * c - Y * s, py + X * s + Y * c]; }), { w: 4, seed: 502, closed: true });
  // violet light from the phone, up across the face
  const p = 0.85 + 0.15 * Math.sin(gt * 2.2) + 0.15 * talk;
  lightPool(g, px + 60, py - 120, 640, VIO, 0.75 * p * light);
  if (thing > 0) drawThing(g, t, thing);
  darkness(g, 0.72, [{ x: px + 120, y: py - 200, r: 760 * p * (0.5 + 0.5 * light), k: 1 }]);
  if (thing > 0) thingEyes(g, t, thing);
  g.restore();
}
// THE THING (s29): tall, thin, bent down close at the edge of the violet glow. Only the head shape + dot-eyes.
const THING = [735, 530];
function drawThing(g, t, k) {
  const [x, y] = THING, bend = 6 * Math.sin(t * 0.9);
  // a long neck/back line rising out of frame (barely there), and the head: a dark blob with a faint rim
  chalk(g, [[x + 40, y - 30], [x + 120, y - 260], [x + 190, y - 520], [x + 230, y - 820]], { w: 16, color: '#020203', seed: 960, double: false, wob: 1.2 });
  blob(g, x + bend, y, 78, 104, alpha(INK.chalk, 0.24 * k), { seed: 961, wob: 2.4 });
  blob(g, x + bend, y, 72, 98, '#020203', { seed: 962, wob: 2.2 });
}
function thingEyes(g, t, k) {
  const [x, y] = THING, bend = 6 * Math.sin(t * 0.9);
  K.eyesInDark(g, x + bend - 6, y + 4, { gap: 24, size: 8, k: 0.75 * k, color: VIO });
}

// ---------------------------------------------------------------- me, awake (morning, phone in hand below frame)
function awakeFace(g, t, f, o = {}) {
  const { z = [1, 1.06], dur = 2, shake = 0, darkK = 0.7, cx = 470, cy = 700 } = o;
  const [dx, dy] = K.drift(8);
  g.save(); g.translate(dx, dy); K.camera(g, lerp(z[0], z[1], ease.inOut(prog(t, 0, dur))), cx, cy);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  K.windowFrame(g, 700, 140, 300, 380, { seed: 520, sky: '#1a1830' });          // grey pre-dawn window behind
  lightPool(g, 850, 330, 360, '#9a96c0', 0.25);
  K.stickHead(g, 470 + shake * 12 * Math.sin(t * 4.4), 680, 230, f, { neck: true, seed: 27, tilt: shake * 0.06 * Math.sin(t * 4.4) });
  const p = 0.85 + 0.15 * Math.sin(t * 3);
  lightPool(g, 520, 1250, 760, VIO, 0.85 * p);
  darkness(g, darkK, [{ x: 520, y: 1150, r: 980 * p, k: 1 }, { x: 850, y: 330, r: 330, k: 0.55 }]);
  g.restore();
}

// ---------------------------------------------------------------- my bedroom doorway (from the bed), and the hallway
function doorway(g, t, o = {}) {
  const { z = [1.0, 1.12], dur = 2 } = o;
  g.save(); K.camera(g, lerp(z[0], z[1], ease.inOut(prog(t, 0, dur))), 540, 760);
  K.roomBox(g, { back: [80, 260, 920, 1180], seed: 540 });
  // the open door: the gap beyond is black, and the black is DEEPER than black (a soft hole that breathes)
  const dx0 = 330, dy0 = 380, dw = 360, dh = 1060;
  K.door(g, dx0, dy0, dw, dh, { open: 0.72, seed: 545 });
  g.save(); g.beginPath(); g.rect(dx0, dy0, dw * 0.72, dh); g.clip();
  const br = 0.5 + 0.5 * Math.sin(t * 1.4);
  g.fillStyle = '#000'; g.fillRect(dx0, dy0, dw, dh);
  const gr = g.createRadialGradient(dx0 + dw * 0.36, dy0 + dh * 0.45, 10, dx0 + dw * 0.36, dy0 + dh * 0.45, 260 + 40 * br);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'source-over'; g.fillStyle = gr; g.fillRect(dx0, dy0, dw, dh);
  g.restore();
  // a dresser, and the foot of my bed in the foreground
  rect(g, 760, 980, 200, 300, { w: 3.5, seed: 548, a: 0.8 }); line(g, 760, 1130, 960, 1130, { w: 3, seed: 549, a: 0.7 });
  fillPoly(g, [[-60, 1500], [1140, 1440], [1140, 2000], [-60, 2000]], '#100c1c'); chalk(g, [[-60, 1500], [500, 1470], [1140, 1440]], { w: 5, seed: 550 });
  lightPool(g, 120, 1700, 700, VIO, 0.45);
  darkness(g, 0.66, [{ x: 160, y: 1650, r: 900, k: 0.9 }]);
  // the doorway gets darker than the room around it, slowly
  g.fillStyle = `rgba(0,0,0,${0.35 + 0.25 * prog(t, 0, dur)})`; g.fillRect(dx0, dy0, dw * 0.72, dh);
  g.restore();
}
// the second door on the left = the far left door of the kit hallway (k = 0.2). Its quad:
function hallDoorQuad() {
  const [bx, by, bw, bh] = [400, 700, 280, 520], k = 0.2;
  const xn = lerp(bx, -40, k), yt = lerp(by + 80, -100, k * 0.9), yb = lerp(by + bh, E.H + 60, k);
  const xf = lerp(bx, -40, k + 0.14), ytf = lerp(by + 80, -100, (k + 0.14) * 0.9), ybf = lerp(by + bh, E.H + 60, k + 0.14);
  return [[xn, yb], [xn, yt], [xf, ytf], [xf, ybf]];
}
function hall(g, t, o = {}) {
  const { z = [1.0, 1.15], focus = [380, 980], dur = 2, mark = 0, star = 0, dawn = 0, runner = null } = o;
  g.save(); K.camera(g, lerp(z[0], z[1], ease.inOut(prog(t, 0, dur))), focus[0], focus[1]);
  K.hallway(g, t, { endOpen: 0 });
  const Q = hallDoorQuad();
  if (mark > 0) { chalk(g, Q, { w: 6, seed: 570, closed: true, a: mark }); fillPoly(g, Q, alpha(INK.chalk, 0.035 * mark)); }
  if (star > 0) {   // a paper star taped to her door (a kid's drawing)
    const cx = lerp(Q[0][0], Q[3][0], 0.5), cy = lerp(Q[1][1], Q[0][1], 0.42) + 14, P = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 16 : 38; P.push([cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r]); }
    g.save(); g.globalAlpha *= star; chalk(g, P, { w: 3.5, seed: 575, closed: true }); g.restore();
  }
  if (runner) runner(g);
  const night = 1 - dawn;
  lightPool(g, 540, 1500, 900, VIO, 0.25 + 0.2 * night);
  darkness(g, 0.55 + 0.15 * night, [{ x: 520, y: 1400, r: 1100, k: 0.8 }, { x: lerp(Q[0][0], Q[3][0], 0.5), y: 900, r: 420, k: 0.5 * mark }]);
  g.restore();
}

// ---------------------------------------------------------------- my little sister's room
function sisterRoom(g, t, o = {}) {
  const { z = [1.0, 1.06], dur = 1.5 } = o;
  g.save(); K.camera(g, lerp(z[0], z[1], ease.inOut(prog(t, 0, dur))), 540, 980);
  K.roomBox(g, { back: [140, 420, 800, 1000], seed: 600 });
  K.windowFrame(g, 560, 560, 220, 260, { seed: 610, sky: '#17152a' });
  // small bed, headboard left
  const x0 = 200, x1 = 760, top = 1180;
  g.fillStyle = INK.bg2; g.fillRect(x0, top, x1 - x0, 130);
  rect(g, x0, top, x1 - x0, 130, { w: 4, seed: 620 }); chalk(g, [[x0 - 20, top + 230], [x0 - 20, top - 120], [x0 + 20, top - 128], [x0 + 20, top + 230]], { w: 4, seed: 621 });
  line(g, x0 + 20, top + 130, x0 + 20, top + 230, { w: 4, seed: 622 }); line(g, x1 - 20, top + 130, x1 - 20, top + 230, { w: 4, seed: 623 });
  ellipse(g, 290, top - 18, 80, 26, { w: 3.5, seed: 624 });
  // her: a small head on the pillow, eyes closed, two little bunches; the blanket rises with her breathing
  const br = Math.sin(t * 2.6) * 6;
  K.stickHead(g, 300, top - 46, 46, { eyes: 'closed', mouth: { w: 0.3, c: 0.12, o: 0 } }, { neck: false, tilt: -0.2, seed: 41 });
  K.circleLine(g, 258, top - 86, 13, { w: 3, seed: 625 }); K.circleLine(g, 344, top - 92, 13, { w: 3, seed: 626 });
  const B = [[340, top + 6], [420, top - 22 - br], [560, top - 30 - br], [700, top - 12], [740, top + 20], [740, top + 60], [330, top + 60]];
  fillPoly(g, B, '#151021'); chalk(g, B.slice(0, 6), { w: 4, seed: 627 });
  // a teddy on the floor, a nightstand
  K.circleLine(g, 860, 1460, 30, { w: 3, seed: 630, a: 0.8 }); K.circleLine(g, 860, 1410, 22, { w: 3, seed: 631, a: 0.8 });
  // me in the doorway (left edge), phone light in my hand
  const R = K.stickFigure(g, { ...K.POSES.freeze, aR: [0.5, 0.6] }, { eyes: 'dot', look: [1, 0.3], brows: 'worried', mouth: 'flat' }, { x: 60, y: 1560, s: 1.25, seed: 640 });
  lightPool(g, R.hR[0] + 10, R.hR[1], 520, VIO, 0.7);
  lightPool(g, 360, 1130, 420, VIO, 0.35);
  darkness(g, 0.66, [{ x: R.hR[0] + 120, y: R.hR[1] - 40, r: 720, k: 0.9 }, { x: 360, y: 1140, r: 420, k: 0.7 }]);
  g.restore();
}
function sisterClose(g, t) {
  const [dx, dy] = K.drift(5);
  g.save(); g.translate(dx, dy); K.camera(g, 1 + 0.06 * prog(t, 0, 1.7), 470, 760);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  ellipse(g, 470, 960, 440, 140, { w: 5, seed: 650 });
  K.stickHead(g, 470, 760, 170, { eyes: 'closed', mouth: { w: 0.3, c: 0.14, o: 0 } }, { neck: false, tilt: -0.1, seed: 43 });
  K.circleLine(g, 330, 610, 46, { w: 5, seed: 651 }); K.circleLine(g, 615, 600, 46, { w: 5, seed: 652 });
  const br = Math.sin(t * 2.6) * 10;
  const B = [[-60, 990 - br], [300, 950 - br], [620, 980 - br], [1140, 960], [1140, 2000], [-60, 2000]];
  fillPoly(g, B, '#151021'); chalk(g, B.slice(0, 4), { w: 5, seed: 653 });
  lightPool(g, 520, 900, 700, VIO, 0.55);
  darkness(g, 0.6, [{ x: 500, y: 820, r: 820, k: 1 }]);
  g.restore();
}
// me sitting on the edge of my bed, phone in hand, its light on my face
function sitPhone(g, t, f, o = {}) {
  const { z = [1.2, 1.28], dur = 1.5 } = o;
  g.save(); K.camera(g, lerp(z[0], z[1], ease.inOut(prog(t, 0, dur))), 470, 1000);
  K.roomBox(g, { back: [110, 300, 860, 1000], seed: 660 });
  K.windowFrame(g, 650, 420, 260, 320, { seed: 661, sky: '#1a1830' }); lightPool(g, 780, 580, 320, '#9a96c0', 0.22);
  fillPoly(g, [[-60, 1230], [800, 1230], [800, 1330], [-60, 1330]], '#100c1c'); chalk(g, [[-60, 1230], [800, 1230], [800, 1330]], { w: 4, seed: 662 });
  const pose = { ...K.POSES.phone, lL: K.POSES.sit.lL, lR: K.POSES.sit.lR, seated: true, aL: [0.25, 2.1] };
  const R = K.stickFigure(g, pose, f, { x: 470, y: 1225, s: 1.6, seed: 670 });
  const hx = R.hR[0], hy = R.hR[1];
  g.save(); g.translate(hx, hy - 14); g.rotate(-0.3); rrFill(g, -26, -44, 52, 88, 8, mix(INK.bg, VIO, 0.6)); chalk(g, rrPts(-28, -46, 56, 92, 9), { w: 3, seed: 671, closed: true, double: false }); g.restore();
  lightPool(g, hx, hy - 60, 420, VIO, 0.95);
  darkness(g, 0.68, [{ x: hx, y: hy - 120, r: 560, k: 1 }, { x: 780, y: 580, r: 300, k: 0.5 }]);
  g.restore();
}

const reg = (id, fn, o) => K.stickShot(id, fn, o);
const talkIn = (gt, spans) => { for (const [a, b] of spans) if (gt >= a && gt <= b) return 1; return 0; };
const WHISPERS = [[25.74, 26.46], [28.26, 30.17], [31.67, 33.12]];

// ================================================================ shots
// s01 0.0-2.0 FRAME 1: asleep in the violet glow, the waveform already pulsing, lips moving.
reg('s01_asleep_talking', (g, t, info) => sleepFace(g, t, info.globalT, { talk: 0.6 + 0.4 * Math.abs(noise(info.globalT * 2, 8)), z: [1.06, 1.12], dur: 2 }));
// s02 2.0-3.95 "in my sleep." The app recording live.
reg('s02_rec_screen', (g, t, info) => { g.save(); K.camera(g, 1 + 0.05 * prog(t, 0, 2), 470, 640); recScreen(g, t, info.globalT, 0.5 + 0.5 * Math.abs(noise(info.globalT * 1.5, 3))); darkness(g, 0.3, [{ x: 470, y: 640, r: 900 }]); g.restore(); });
// s03 3.95-6.2 "Most nights, it catches nothing." Past nights: 0:00, 0:00, 0:03 ...
reg('s03_history', (g, t) => { g.save(); K.camera(g, 1 + 0.04 * prog(t, 0, 2.2), 470, 640); historyScreen(g, t); g.restore(); });
// s04 6.2-7.9 "Maybe a mumble." Macro on Wednesday's tiny blip.
reg('s04_mumble', (g, t) => { g.save(); K.camera(g, lerp(2.0, 2.3, ease.inOut(prog(t, 0, 1.7))), 480, 642, 0, 0); historyScreen(g, 9); g.restore(); });
// s05 7.9-10.7 "This morning, it had forty-one minutes." 41:07 recorded (the counter rolls up).
reg('s05_4107', (g, t) => { g.save(); K.camera(g, 1 + 0.06 * ease.inOut(prog(t, 0, 2.8)), 470, 560); resultScreen(g, t, { count: ease.out(prog(t, 0.15, 1.6)) }); g.restore(); });
// s06 10.7-12.2 "It's me." Sitting on the edge of the bed, listening, in the grey pre-dawn.
reg('s06_its_me', (g, t) => sitPhone(g, t, { eyes: 'dot', look: [0.4, 0.6], mouth: 'flat' }));
// s07 12.2-13.6 "Whispering." Playback: soft violet peaks.
reg('s07_whisper_wave', (g, t) => { g.save(); K.camera(g, 1.05, 470, 640); playScreen(g, t, 905 + t * 9, { span: 70 }); g.restore(); });
// s08 13.6-15.0 "Calm." Last night: asleep, peaceful, lips moving.
reg('s08_calm', (g, t, info) => sleepFace(g, t, info.globalT, { talk: 0.55, z: [1.25, 1.3], dur: 1.4 }));
// s09 15.0-17.3 "Like I'm answering questions." Head turns a little toward the dark side, as if listening... then answers.
reg('s09_answering', (g, t, info) => sleepFace(g, t, info.globalT, { turn: 0.6 * ease.inOut(prog(t, 0.1, 1.0)), talk: t > 1.3 ? 0.7 : 0, z: [1.1, 1.18], dur: 2.3 }));
// s10 17.3-19.3 "But there are no questions." Playback: my peak... then nothing. Flat.
reg('s10_no_questions', (g, t) => { g.save(); K.camera(g, 1.05, 470, 640); playScreen(g, t, 1300 + t * 22, { span: 120 }); g.restore(); });
// s11 19.3-21.9 "Just pauses. Long ones." Macro: the flat line crawls under the playhead.
reg('s11_pauses', (g, t) => { g.save(); K.camera(g, lerp(1.6, 1.7, ease.inOut(prog(t, 0, 2.6))), 470, 300); playScreen(g, t, 1400 + t * 3, { span: 120 }); g.restore(); });
// s12 21.9-23.9 (beat) the dark bedroom doorway, slow push. Nothing there. The dark is a little too dark.
reg('s12_doorway', (g, t) => doorway(g, t, { z: [1.0, 1.12], dur: 2 }), { vignette: 0.85 });
// s13 23.9-25.6 "Then my voice." The playhead reaches a peak; it lights up.
reg('s13_then_voice', (g, t) => { g.save(); K.camera(g, 1.05 + 0.05 * prog(t, 0, 1.7), 470, 640); playScreen(g, t, 1736 + t * 14, { span: 70 }); g.restore(); });
// s14 25.6-28.2 [WHISPER] "Yes." Asleep, calm, the lips say it. Then stillness.
reg('s14_yes', (g, t, info) => sleepFace(g, t, info.globalT, { talk: talkIn(info.globalT, WHISPERS) * 0.9, z: [1.3, 1.42], dur: 2.6 }));
// s15 28.2-30.0 [WHISPER] "The second door on the left." The hallway: the second door on the left.
reg('s15_hallway', (g, t) => hall(g, t, { z: [1.0, 1.12], focus: [300, 900], dur: 1.8, mark: ease.inOut(prog(t, 0.6, 1.5)) }));
// s16 30.0-31.6 (beat) closer on that door. Still. Dark.
reg('s16_door_close', (g, t) => hall(g, t, { z: [1.6, 1.7], focus: [215, 860], dur: 1.6, mark: 1 }), { vignette: 0.85 });
// s17 31.6-33.4 [WHISPER] "She's a heavy sleeper." Asleep, whispering it, calm.
reg('s17_heavy_sleeper', (g, t, info) => sleepFace(g, t, info.globalT, { talk: talkIn(info.globalT, WHISPERS) * 0.9, turn: 0.4, z: [1.5, 1.6], dur: 1.8 }));
// s18 33.4-35.3 (beat) morning: me, listening, frozen.
reg('s18_frozen', (g, t) => awakeFace(g, t, { eyes: 'pin', look: [0, 0.8], brows: 'worried', mouth: 'flat' }, { z: [1.0, 1.08], dur: 1.9 }));
// s19 35.3-37.2 "The second door on the left is" ... her door, the paper star on it (grey morning).
reg('s19_her_door', (g, t) => hall(g, t, { z: [1.25, 1.4], focus: [215, 860], dur: 1.9, mark: 1, star: ease.out(prog(t, 0.2, 0.6)), dawn: 0.4 }));
// s20 37.2-39.1 "my little sister's room." Realising: eyes go wide.
reg('s20_realise', (g, t) => { const k = t > 0.6; awakeFace(g, t, { eyes: k ? 'wide' : 'dot', look: [0, 0], brows: 'worried', mouth: k ? 'o' : 'flat' }, { z: [1.15, 1.3], dur: 1.9 }); });
// s21 39.1-40.6 "I ran in." Down the hallway, from behind, to her door.
reg('s21_ran_in', (g, t) => hall(g, t, { z: [1.0, 1.05], focus: [380, 980], dur: 1.5, mark: 0.8, star: 1, dawn: 0.4, runner: (g) => {
  const k = ease.in(prog(t, 0, 1.5)), ph = t * 2.6;
  const x = lerp(560, 300, k), y = lerp(1750, 1250, k), s = lerp(2.0, 1.0, k);
  K.stickFigure(g, K.walk(ph, { stride: 0.55 }), {}, { x, y, s, back: true, seed: 680 });
} }));
// s22 40.6-42.1 "She was fine." Her room: she's asleep, safe. Me in the doorway.
reg('s22_she_was_fine', (g, t) => sisterRoom(g, t));
// s23 42.1-43.8 "Still asleep." Close: her sleeping face; the blanket rises and falls.
reg('s23_still_asleep', (g, t) => sisterClose(g, t));
// s24 43.8-46.6 "I went back to the recording." The thumb on the scrub bar.
reg('s24_back_to_rec', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.04 * prog(t, 0, 2.8), 470, 700);
  const pos = 2006 + 80 * ease.inOut(prog(t, 1.2, 2.8));
  const P = playScreen(g, t, pos, { span: 90 });
  const k = ease.out(prog(t, 0.2, 1.1)); thumb(g, lerp(820, P.knob[0] - 40, k), lerp(1500, P.knob[1] - 8, k));
  g.restore();
});
// s25 46.6-48.6 "At the very end, after a long silence," Scrubbing on: a long flat line.
reg('s25_scrub_end', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.04 * prog(t, 0, 2), 470, 700);
  const pos = lerp(2086, 2410, ease.inOut(prog(t, 0, 1.9)));
  const P = playScreen(g, t, pos, { span: 90 });
  thumb(g, P.knob[0] - 40, P.knob[1] - 8);
  g.restore();
});
// s26 48.6-50.9 "there's one more voice." The last shape arrives: not like mine. Push in on it.
reg('s26_one_more', (g, t) => {
  g.save(); K.camera(g, lerp(1.05, 1.6, ease.inOut(prog(t, 0.4, 2.3))), 470, 750);
  const pos = lerp(2420, 2453, ease.out(prog(t, 0, 1.6)));
  playScreen(g, t, pos, { span: 90, other: true });
  g.restore();
});
// s27 50.9-52.9 "It isn't mine." My face, the screen light, pin eyes.
reg('s27_isnt_mine', (g, t) => awakeFace(g, t, { eyes: 'pin', look: [0, 0.9], brows: 'worried', mouth: 'flat' }, { z: [1.35, 1.5], dur: 2, darkK: 0.76 }));
// s28 52.9-55.1 HELD silent frame: last night. Asleep in the violet glow. Nothing beside the bed. Nothing moves.
reg('s28_held', (g, t, info) => sleepFace(g, 0, 52.9, { talk: 0, z: [1.0, 1.0], still: true, light: 0.9 }), { vignette: 0.85 });
// s29 55.1-57.9 [OTHER] "Thank you." The same frame: at the edge of the glow, something tall, bent down close.
reg('s29_thank_you', (g, t, info) => sleepFace(g, t, 52.9, { talk: 0, z: [1.0, 1.0], still: true, light: 0.9, thing: 1 }), { vignette: 0.85, jitterAmp: 26 });
// s30 57.9-62.28 hard cut to the end card.
reg('s30_end', (g, t) => K.endCard(g, t), { captions: false, fx: false });
