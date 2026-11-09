// Sticks After Dark #5 "Voicemail" (60-70 s cut). Kit: /kits/sticks/sticks.js. Accent: cold blue phone/moon light.
// Project-local sets (the kit has no side-view bed, no phone UI): bedSide(), phoneBody(), lockScreen() below.
import * as K from '/kits/sticks/sticks.js';
import { E } from '/engine/core.js';
const { INK, chalk, line, rect, ellipse, blob, fillPoly, lightPool, darkness, text, clamp, lerp, prog, ease, noise, rng, alpha, mix } = K;
K.setAccent('blue');
const BLUE = K.K.accent;                     // #8fb2ff
const SCREEN = '#0e1a33';                    // dark blue phone screen
const UI = { font: 'Nunito' };
const T = (g, s, x, y, o = {}) => text(g, s, x, y, { font: 'Nunito', weight: 800, color: '#dfe8ff', ...o });

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
  rrFill(g, x, y, w, h, r, '#05070c');
  const sx = x + b, sy = y + b, sw = w - 2 * b, sh = h - 2 * b;
  g.save(); g.beginPath(); g.roundRect(sx, sy, sw, sh, r * 0.75); g.clip();
  g.fillStyle = SCREEN; g.fillRect(sx, sy, sw, sh);
  g.fillStyle = `rgba(143,178,255,${0.10 * glow})`; g.fillRect(sx, sy, sw, sh);
  inside && inside(g, sx, sy, sw, sh);
  g.fillStyle = `rgba(0,0,0,${1 - glow})`; g.fillRect(sx, sy, sw, sh);
  g.restore();
  chalk(g, rrPts(x, y, w, h, r), { w: 5, seed, closed: true });
  chalk(g, rrPts(sx, sy, sw, sh, r * 0.75), { w: 2, seed: seed + 1, closed: true, a: 0.45, double: false });
  lightPool(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.9, BLUE, 0.35 * glow);
}
// waveform bars across [x0,x1] at y. amp(u) -> 0..1 (u = 0..1 across). played = fraction drawn in the accent
function waveform(g, x0, x1, y, hMax, amp, played = 0, seed = 1) {
  const n = Math.floor((x1 - x0) / 16);
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), x = x0 + u * (x1 - x0), h = Math.max(4, hMax * amp(u));
    g.fillStyle = u <= played ? BLUE : alpha('#dfe8ff', 0.28); g.beginPath(); g.roundRect(x - 4, y - h / 2, 8, h, 4); g.fill();
  }
}
// tiny stick-head avatar
function avatar(g, x, y, r) { g.fillStyle = alpha(BLUE, 0.25); g.beginPath(); g.arc(x, y, r * 1.35, 0, Math.PI * 2); g.fill(); K.stickHead(g, x, y, r, { eyes: 'dot', mouth: 'flat' }, { neck: false, seed: 31 }); }

// the bedroom seen from the side of the bed (project set). Returns anchors.
function bedSide(g, t, o = {}) {
  const L = K.roomBox(g, { back: [110, 300, 860, 1000], seed: 400 });
  K.windowFrame(g, 200, 420, 250, 300, { moon: true, moonColor: BLUE, seed: 410 });
  K.beam(g, 330, 600, 1.05, 1100, 0.2, BLUE, 0.28);
  // bed: headboard left, mattress, rail, legs, and the GAP under it (pure black)
  const top = 1080, panel = 1200, rail = 1245, floor = 1480, x0 = 150, x1 = 930;
  g.fillStyle = '#000'; g.fillRect(x0 + 20, rail, x1 - x0 - 40, floor - rail);
  g.fillStyle = INK.bg2; g.fillRect(x0, top, x1 - x0, rail - top);
  rect(g, x0, top, x1 - x0, panel - top, { w: 4, seed: 430 });
  rect(g, x0, panel, x1 - x0, rail - panel, { w: 3.5, seed: 431, a: 0.85 });
  line(g, x0 + 22, rail, x0 + 22, floor, { w: 5, seed: 432 }); line(g, x1 - 22, rail, x1 - 22, floor, { w: 5, seed: 433 });
  chalk(g, [[x0 - 30, floor], [x0 - 30, 880], [x0 + 10, 870], [x0 + 10, floor]], { w: 4, seed: 434 });
  ellipse(g, 270, top - 22, 105, 32, { w: 3.5, seed: 435 }); // pillow
  return { top, panel, rail, floor, x0, x1, head: [262, top - 52] };
}
// blanket over the sleeper (drawn after the figure so it covers the legs)
function blanket(g, x0, x1, y, o = {}) {
  const { hump = 40, seed = 450 } = o; const P = [[x0, y + 10], [x0 + 80, y - hump * 0.6], [lerp(x0, x1, 0.45), y - hump], [lerp(x0, x1, 0.75), y - hump * 0.6], [x1, y - 5], [x1 + 18, y + 60], [x1 + 10, y + 150]];
  const hem = []; for (let i = 0; i <= 12; i++) { const u = i / 12; hem.push([lerp(x1 + 10, x0 + 30, u), y + 150 + Math.sin(u * 19) * 8]); }
  fillPoly(g, [...P, ...hem], '#10141f'); chalk(g, [...P, ...hem], { w: 4, seed });
  chalk(g, [[lerp(x0, x1, 0.3), y + 40], [lerp(x0, x1, 0.5), y + 70], [lerp(x0, x1, 0.62), y + 60]], { w: 2.5, seed: seed + 1, a: 0.5, double: false });
}
// a sleeper's head on the pillow
function sleeperHead(g, x, y, r, f, o = {}) { K.stickHead(g, x, y, r, f, { neck: false, tilt: o.tilt ?? -0.18, seed: o.seed ?? 21 }); }
const blinkOpen = (t, at, d = 0.25) => 1 - ease.out(prog(t, at, at + d));   // 1 = closed .. 0 = open


// sitting up in bed, phone pressed to the ear
function sitter(g, x, y, s, f, o = {}) {
  const pose = { lean: -0.04, tilt: 0.12, aL: [-0.3, 0.5], aR: [0.4, 0], lL: [1.4, -1.4], lR: [1.3, -1.3], seated: true };
  const R = K.rig(pose, x, y, s);
  const oo = { w: 7 * s, wob: 1.6 * s, step: 36 * s, double: false };
  chalk(g, [R.hip, R.neck], { ...oo, seed: 601 }); chalk(g, [R.sh, R.eL, R.hL], { ...oo, seed: 602 });
  const ear = [R.head[0] + R.headR * 0.95, R.head[1] + R.headR * 0.1], elbow = [R.sh[0] + 95 * s, R.sh[1] + 5 * s];
  blob(g, R.head[0], R.head[1], R.headR, R.headR, INK.head, { seed: 606, wob: 1.2 * s });
  g.save(); g.translate(R.head[0], R.head[1]); g.rotate(R.tilt * 0.6); K.face(g, 0, 0, R.headR, f, { seed: 11 }); g.restore();
  // phone at the ear (screen glowing), then the arm holding it
  g.save(); g.translate(ear[0] + 8 * s, ear[1] - 6 * s); g.rotate(0.35);
  rrFill(g, -14 * s, -40 * s, 28 * s, 80 * s, 6 * s, mix(INK.bg, BLUE, 0.6)); chalk(g, rrPts(-15 * s, -41 * s, 30 * s, 82 * s, 7 * s), { w: 3, seed: 607, closed: true, double: false });
  g.restore();
  chalk(g, [R.sh, elbow, [ear[0] + 12 * s, ear[1] + 22 * s]], { ...oo, seed: 605 });
  return { R, ear };
}

function lyingWithPhone(g, t, wake, eyes) {
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  ellipse(g, 470, 1110, 500, 160, { w: 5, seed: 700 });
  sleeperHead(g, 450, 900, 170, eyes, { tilt: -0.1, seed: 25 });
  blanket(g, -40, 1100, 1210, { hump: 20, seed: 710 });
  // forearm + hand up from the blanket holding the phone over the face (back of the phone toward us)
  const px = 560, py = 520 + 14 * Math.sin(t * 1.3);
  chalk(g, [[860, 1260], [760, 900], [px + 40, py + 120]], { w: 8, seed: 720 });
  g.save(); g.translate(px, py); g.rotate(0.18);
  rrFill(g, -95, -170, 190, 340, 30, '#0a0d14'); chalk(g, rrPts(-95, -170, 190, 340, 30), { w: 5, seed: 721, closed: true });
  K.circleLine(g, -50, -125, 18, { w: 3, seed: 722, a: 0.7 });
  g.restore();
  // light from the screen falls DOWN onto the face
  lightPool(g, 470, 860, 520, BLUE, wake);
  K.beam(g, px - 20, py + 120, Math.PI / 2 + 0.15, 700, 0.42, BLUE, 0.8 * wake);
  darkness(g, 0.72, [{ x: 470, y: 820, r: 520 + 280 * wake, k: wake }]);
}

// ================================================================ reusable set-ups (60-70 s cut)
// the wide bedroom with the sleeper lying down. o.phone: 0..1 screen light; o.face; o.phoneAtEar
function bedWide(g, t, o = {}) {
  const { phone = 1, face = { eyes: 'closed', mouth: 'flat' }, zoom = [1.12, 1.2], focus = [380, 1000], phoneAtEar = false, dark = 0.62 } = o;
  g.save(); K.camera(g, lerp(zoom[0], zoom[1], ease.inOut(prog(t, 0, o.dur || 2))), focus[0], focus[1]);
  const L = bedSide(g, t);
  sleeperHead(g, L.head[0], L.head[1], 50, face, { tilt: -0.22 });
  const px = phoneAtEar ? L.head[0] + 62 : 430, py = phoneAtEar ? L.head[1] + 4 : L.top - 40;
  blanket(g, 310, 900, L.top - 10);
  g.save(); g.translate(px, py); g.rotate(phoneAtEar ? 0.3 : -0.25);
  rrFill(g, -38 * (phoneAtEar ? 0.6 : 1), -66 * (phoneAtEar ? 0.6 : 1), 76 * (phoneAtEar ? 0.6 : 1), 132 * (phoneAtEar ? 0.6 : 1), 12, phone > 0.05 ? mix(INK.bg, BLUE, 0.6 * phone) : '#05070c');
  chalk(g, phoneAtEar ? rrPts(-24, -41, 48, 82, 9) : rrPts(-40, -68, 80, 136, 13), { w: 3.5, seed: 460, closed: true });
  g.restore();
  if (phoneAtEar) chalk(g, [[px + 150, L.top + 10], [px + 90, py + 70], [px + 10, py + 30]], { w: 6, seed: 465 });
  lightPool(g, px, py, 380, BLUE, 0.9 * phone);
  darkness(g, dark, [{ x: px, y: py, r: 120 + 420 * phone, k: clamp(phone * 1.1) }, { x: 325, y: 570, r: 330, k: 0.7 }]);
  g.restore(); return L;
}
// close-up of the head on the pillow, lit from below by the phone. o.hand: hand over the mouth; o.shake: slow head shake
function headClose(g, t, face, o = {}) {
  const { light = 1, z = [1, 1.06], dur = 2, hand = 0, shake = 0, darkK = 0.68 } = o;
  const [dx, dy] = K.drift(8);
  g.save(); g.translate(dx, dy); K.camera(g, lerp(z[0], z[1], ease.inOut(prog(t, 0, dur))), 470, 700);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  ellipse(g, 470, 900, 470, 150, { w: 5, seed: 500 });
  const tilt = -0.12 + shake * 0.09 * Math.sin(t * 4.2);
  sleeperHead(g, 470 + shake * 14 * Math.sin(t * 4.2), 690, 230, face, { tilt, seed: 23 });
  blanket(g, -40, 1100, 1020, { hump: 20, seed: 510 });
  if (hand > 0) {   // a stick arm comes up from the blanket and presses flat across the mouth
    const k = ease.out(clamp(hand)), ex = lerp(330, 640, k), ey = lerp(1300, 785, k);
    const P = [[20, 1420], [240, 1060], [lerp(300, 360, k), lerp(1150, 800, k)], [ex, ey]];
    chalk(g, P, { w: 34, seed: 520, color: INK.feature, double: false, wob: 1 });
    chalk(g, P, { w: 20, seed: 521, color: INK.head, double: false, wob: 1 });
  }
  const p = 0.8 + 0.2 * Math.sin(t * 5);
  lightPool(g, 760, 1080, 700, BLUE, 0.9 * p * light);
  darkness(g, darkK, [{ x: 700, y: 980, r: 900 * p * (0.4 + 0.6 * light), k: 1 }]);
  g.restore();
}
// a chalk thumb whose tip is at (x, y), coming in from the bottom-right
function thumb(g, x, y, seed = 480) {
  chalk(g, [[x + 190, y + 560], [x + 10, y + 60], [x + 25, y + 2], [x + 75, y - 2], [x + 110, y + 50], [x + 300, y + 510]], { w: 5, seed });
  chalk(g, [[x + 32, y + 18], [x + 70, y + 14]], { w: 2.5, seed: seed + 1, a: 0.6, double: false });
}
// the voicemail list. o: { played, swipe (0..1 card slides left to show Delete), glitch (0..1), replayed }
const PH = [150, 150, 640, 1030];
function vmScreen(g, t, o = {}) {
  const { played = 0, swipe = 0, glitch = 0, tapped = false, replayed = false } = o;
  const inside = (g, x, y, w, h) => {
    T(g, 'Voicemail', x + 40, y + 140, { size: 58, weight: 900, align: 'left' });
    T(g, replayed ? '' : '1 new', x + w - 40, y + 140, { size: 30, weight: 700, align: 'right', color: BLUE });
    const cy = y + 250, sx = -swipe * 200;
    if (swipe > 0) {   // the Delete action under the card (chalk, no second colour)
      chalk(g, rrPts(x + w - 22 - 200, cy, 200, 330, 26), { w: 3, seed: 790, closed: true, color: '#dfe8ff', a: 0.9 });
      T(g, 'Delete', x + w - 122, cy + 165, { size: 38, weight: 900, color: '#ffffff' });
    }
    g.save(); g.translate(sx, 0);
    rrFill(g, x + 22, cy, w - 44, 330, 26, swipe > 0 ? '#16264a' : alpha(BLUE, 0.13));
    avatar(g, x + 100, cy + 85, 42);
    T(g, 'Me', x + 170, cy + 70, { size: 76, weight: 900, align: 'left', color: '#ffffff' });
    T(g, 'my number', x + 172, cy + 128, { size: 32, weight: 700, align: 'left', color: alpha('#dfe8ff', 0.6) });
    T(g, '3:12 AM', x + w - 50, cy + 70, { size: 34, weight: 800, align: 'right', color: BLUE });
    const px = x + 90, py = cy + 240; g.fillStyle = tapped ? '#ffffff' : BLUE; g.beginPath(); g.arc(px, py, 38, 0, Math.PI * 2); g.fill();
    g.fillStyle = SCREEN; g.beginPath(); if (tapped) { g.fillRect(px - 13, py - 15, 9, 30); g.fillRect(px + 4, py - 15, 9, 30); } else { g.moveTo(px - 10, py - 17); g.lineTo(px + 17, py); g.lineTo(px - 10, py + 17); g.closePath(); g.fill(); }
    waveform(g, x + 160, x + w - 50, py, 46, (u) => 0.2 + 0.25 * Math.abs(Math.sin(u * 9)) * (0.5 + 0.5 * noise(u * 20, 3)), played, 3);
    T(g, '0:41', x + w - 50, py + 60, { size: 26, weight: 700, align: 'right', color: alpha('#dfe8ff', 0.5) });
    g.restore();
    for (let i = 0; i < 3; i++) rrFill(g, x + 22, cy + 370 + i * 120, w - 44, 96, 20, alpha('#dfe8ff', 0.03));
  };
  const insideG = glitch <= 0 ? inside : (g, x, y, w, h) => {   // horizontal slices shifted on some frames
    const r = rng(K.frame * 17 + 3), on = r() < 0.55 * glitch;
    if (!on) return inside(g, x, y, w, h);
    let yy = y; while (yy < y + h) { const sh = 30 + r() * 120, off = (r() - 0.5) * 70 * glitch; g.save(); g.beginPath(); g.rect(x, yy, w, sh); g.clip(); g.translate(off, 0); g.fillStyle = SCREEN; g.fillRect(x - 100, yy, w + 200, sh); inside(g, x, y, w, h); g.restore(); yy += sh; }
    g.fillStyle = alpha(BLUE, 0.25); g.fillRect(x, y + r() * h, w, 3 + r() * 6);
  };
  phoneBody(g, ...PH, { inside: insideG });
  return { play: [PH[0] + 32 + 90, PH[1] + 32 + 250 + 240], del: [PH[0] + 32 + PH[2] - 64 - 122, PH[1] + 32 + 250 + 165] };
}
const reg = (id, fn, o) => K.stickShot(id, fn, o);

// ================================================================ shots
// v01 0.0-2.2 "I always sleep with my phone on silent." Dark room; the phone lights up with no sound at all.
reg('v01_silent_light', (g, t) => {
  const on = 0.15 + 0.85 * ease.out(prog(t, 0.05, 0.6)), pulse = 0.85 + 0.15 * Math.sin(t * 5);
  bedWide(g, t, { phone: on * pulse, face: { eyes: 'closed', mouth: 'flat' }, dur: 2.2 });
});
// v02 2.2-3.9 the phone face-up on the blanket: silent mode, the screen glowing in the dark.
reg('v02_phone_silent', (g, t) => {
  g.save(); K.camera(g, 1 + 0.06 * prog(t, 0, 1.7), 470, 760);
  g.fillStyle = '#10141f'; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  for (let i = 0; i < 7; i++) chalk(g, [[-40, 300 + i * 230 + Math.sin(i) * 40], [1120, 260 + i * 240 + Math.cos(i) * 50]], { w: 2.5, seed: 800 + i, a: 0.3, double: false });
  g.save(); g.translate(470, 760); g.rotate(-0.18);
  phoneBody(g, -260, -440, 520, 880, { inside: (g, x, y, w, h) => {
    const bx = x + w / 2, by = y + 300;   // bell with a slash = silent
    K.ellipse(g, bx, by, 60, 70, { w: 7, seed: 810, from: Math.PI, to: Math.PI * 2, color: '#eef3ff' });
    chalk(g, [[bx - 60, by], [bx - 74, by + 60], [bx + 74, by + 60], [bx + 60, by]], { w: 7, seed: 811, color: '#eef3ff' });
    chalk(g, [[bx - 22, by + 80], [bx + 22, by + 80]], { w: 7, seed: 812, color: '#eef3ff' });
    chalk(g, [[bx - 90, by - 90], [bx + 90, by + 110]], { w: 8, seed: 813, color: BLUE });
    T(g, 'Silent', bx, by + 200, { size: 54, weight: 900, color: '#eef3ff' });
  } });
  g.restore();
  darkness(g, 0.4, [{ x: 470, y: 760, r: 900, k: 1 }]);
  g.restore();
});
// v03 3.9-5.6 "So it was the light that woke me." Eyes snap open in the blue light.
reg('v03_eyes_open', (g, t) => headClose(g, t, { eyes: 'dot', blink: blinkOpen(t, 0.55, 0.2), look: [0.5, 0.7], brows: t > 0.9 ? 'worried' : null }, { dur: 1.7 }));
// v04 5.6-7.4 "One new voicemail." The notification slides down (tight on it: no clock in frame).
reg('v04_notification', (g, t) => {
  g.save(); K.camera(g, 1 + 0.05 * prog(t, 0, 1.8), 470, 760);
  phoneBody(g, -40, 380, 1020, 1700, { inside: (g, x, y, w, h) => {
    const k = ease.out(prog(t, 0.2, 0.65)), cy = lerp(y - 260, y + 170, k);
    rrFill(g, x + 40, cy, w - 80, 250, 34, alpha('#dfe8ff', 0.16));
    avatar(g, x + 140, cy + 125, 50);
    T(g, 'Voicemail', x + 220, cy + 80, { size: 38, weight: 800, align: 'left', color: alpha('#dfe8ff', 0.75) });
    T(g, '1 new voicemail', x + 220, cy + 150, { size: 52, weight: 900, align: 'left', color: '#ffffff' });
    T(g, 'now', x + w - 80, cy + 80, { size: 34, weight: 800, align: 'right', color: BLUE });
  } });
  darkness(g, 0.3, [{ x: 470, y: 700, r: 800, k: 1 }]);
  g.restore();
});
// v05 7.4-9.3 "From my own number." The voicemail list: one message, from "Me".
reg('v05_list_me', (g, t) => { g.save(); K.camera(g, 1 + 0.08 * ease.inOut(prog(t, 0, 1.9)), 420, 520); vmScreen(g, t); g.restore(); });
// v06 9.3-11.4 "Three twelve a.m." Macro on the card: Me ... 3:12 AM.
reg('v06_card_macro', (g, t) => { g.save(); K.camera(g, lerp(2.0, 2.25, ease.inOut(prog(t, 0, 2.1))), 560, 520, -90, 180); vmScreen(g, t); g.restore(); });
// v07 11.4-13.3 "I thought it was a glitch." The screen tears and stutters.
reg('v07_glitch', (g, t) => { g.save(); K.camera(g, 1.05, 470, 640); vmScreen(g, t, { glitch: 0.4 + 0.6 * prog(t, 0, 1.2) }); g.restore(); });
// v08 13.3-16.3 "Spam. I almost deleted it." The card slides open; the thumb hovers over Delete, trembling.
reg('v08_delete_hover', (g, t) => {
  g.save(); K.camera(g, 1.05 + 0.05 * prog(t, 0, 3), 520, 640);
  const P = vmScreen(g, t, { swipe: ease.inOut(prog(t, 0.15, 0.7)) });
  const k = ease.out(prog(t, 0.6, 1.5)), tr = prog(t, 1.4, 3);
  thumb(g, lerp(860, P.del[0] - 40, k) + noise(t * 9, 1) * 6 * tr, lerp(1500, P.del[1] + 30, k) + noise(t * 9, 4) * 6 * tr);
  g.restore();
});
// v09 16.3-18.6 "I pressed play." The card slides back, the thumb taps play.
const pressPlay = (g, t, info) => {
  const tap = info.tap ?? 1.2;
  g.save(); K.camera(g, 1 + 0.05 * prog(t, 0, 2.3), 470, 640);
  const P = vmScreen(g, t, { swipe: 1 - ease.inOut(prog(t, 0, 0.45)), tapped: t > tap, played: t > tap ? 0.02 + 0.08 * prog(t, tap, tap + 1) : 0, replayed: !!info.replayed });
  const k = ease.out(prog(t, 0.25, tap)), back = ease.in(prog(t, tap + 0.15, tap + 0.6));
  thumb(g, lerp(860, P.play[0] - 45, k) + back * 140, lerp(1400, P.play[1] - 10, k) + back * 220);
  g.restore();
};
reg('v09_press_play', pressPlay);
reg('v20_replay', (g, t, info) => pressPlay(g, t, { ...info, replayed: true, tap: 0.9 }));
// v10 18.6-20.3 (beat) lying back, the phone held over the face, listening. The breathing starts.
reg('v10_listen', (g, t) => { g.save(); K.camera(g, 1.0 + 0.08 * prog(t, 0, 1.7), 470, 800); lyingWithPhone(g, t, 0.9, { eyes: 'dot', look: [0.4, -1], mouth: 'flat' }); g.restore(); });
// v11 20.3-22.3 "At first, just breathing." The waveform breathes.
const breath = (tt) => { const ph = (tt % 2.15) / 2.15; return Math.pow(Math.sin(Math.PI * Math.min(1, ph / 0.92)), 1.4); };
function breathScreen(g, t, gt) {
  phoneBody(g, 120, 140, 700, 1060, { inside: (g, x, y, w, h) => {
    avatar(g, x + w / 2, y + 150, 56);
    T(g, 'Me', x + w / 2, y + 270, { size: 80, weight: 900, color: '#ffffff' });
    T(g, 'Voicemail  ·  3:12 AM', x + w / 2, y + 340, { size: 32, weight: 700, color: alpha('#dfe8ff', 0.6) });
    const n = 26, x0 = x + 50, x1 = x + w - 50, cy = y + 600;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), x_ = lerp(x0, x1, u), local = breath(gt - u * 0.35);
      const hh = 10 + 300 * local * (0.55 + 0.45 * Math.abs(noise(u * 9 + gt * 3, 5)));
      g.fillStyle = alpha(BLUE, 0.35 + 0.65 * local); g.beginPath(); g.roundRect(x_ - 7, cy - hh / 2, 14, hh, 7); g.fill();
    }
    lightPool(g, x + w / 2, cy, 300, BLUE, 0.4 * breath(gt));
    const sec = Math.floor(gt - 18.3);
    T(g, `0:${String(Math.max(0, sec)).padStart(2, '0')}`, x + 60, y + 820, { size: 30, weight: 700, align: 'left', color: alpha('#dfe8ff', 0.6) });
    T(g, '0:41', x + w - 60, y + 820, { size: 30, weight: 700, align: 'right', color: alpha('#dfe8ff', 0.6) });
    rrFill(g, x + 60, y + 770, w - 120, 6, 3, alpha('#dfe8ff', 0.2)); rrFill(g, x + 60, y + 770, (w - 120) * clamp((gt - 18.3) / 41), 6, 3, BLUE);
  } });
}
reg('v11_breath_wave', (g, t, info) => { g.save(); K.camera(g, 1.0 + 0.05 * prog(t, 0, 2), 470, 700); breathScreen(g, t, info.globalT); darkness(g, 0.25, [{ x: 470, y: 700, r: 900 }]); g.restore(); });
// v12 22.3-24.2 "Slow. Close to the phone." Macro on the bars, pushing in.
reg('v12_breath_macro', (g, t, info) => { g.save(); K.camera(g, lerp(2.1, 2.5, ease.inOut(prog(t, 0, 1.9))), 470, 772); breathScreen(g, t, info.globalT); darkness(g, 0.35, [{ x: 470, y: 760, r: 700 }]); g.restore(); });
// v13 24.2-26.4 "Like someone lying very still," Me, frozen flat in bed, phone at the ear, eyes open.
reg('v13_frozen_bed', (g, t) => bedWide(g, t, { phone: 0.8, phoneAtEar: true, face: { eyes: 'pin', look: [0, -0.6], mouth: 'flat' }, zoom: [1.35, 1.45], focus: [330, 1020], dur: 2.2, dark: 0.7 }));
// v14 26.4-29.4 "trying not to make a sound." Close: a hand presses over the mouth.
reg('v14_hand_mouth', (g, t) => headClose(g, t, { eyes: 'wide', brows: 'worried', look: [0.3, -0.4], mouth: 'flat' }, { hand: prog(t, 0.2, 1.0), dur: 3, z: [1.05, 1.15] }));
// v15 29.4-31.7 "Then my own voice, whispering." Sitting up, phone at the ear; eyes go wide.
const phoneEar = (g, t, info) => {
  const wideAt = info.wideAt ?? 1.2;
  g.save(); K.camera(g, (info.z0 ?? 1.5) + (info.dz ?? 0.1) * ease.inOut(prog(t, 0, 2.2)), 330, 940);
  const L = bedSide(g, t);
  const wide = t > wideAt;
  const { ear } = sitter(g, 330, L.top + 10, 1.2, info.frozen ? { eyes: 'pin', look: [0.2, 0.3], brows: 'worried', mouth: 'flat' } : { eyes: wide ? 'wide' : 'dot', look: [0.6, 0], brows: wide ? 'worried' : 'flat', mouth: wide ? 'o' : 'flat' });
  blanket(g, 250, 900, L.top - 10);
  const p = 0.85 + 0.15 * Math.sin(t * 9);
  lightPool(g, ear[0], ear[1], 300, BLUE, 0.9 * p);
  darkness(g, info.frozen ? 0.75 : 0.66, [{ x: ear[0], y: ear[1], r: 480, k: 1 }, { x: 325, y: 570, r: 300, k: 0.6 }]);
  g.restore();
};
reg('v15_phone_ear', phoneEar);
reg('v19_frozen', (g, t, info) => phoneEar(g, t, { ...info, frozen: true, z0: 1.15, dz: 0.03 }));
// v16 31.7-33.3 [WHISPER] "Don't get out of bed." Extreme close-up of the speaker against the head.
reg('v16_speaker', (g, t, info) => {
  const gt = info.globalT, talking = gt > 31.95 && gt < 35.5;
  const amp = talking ? 0.45 + 0.55 * Math.abs(noise(gt * 9, 2)) : 0.15;
  const [dx, dy] = K.drift(6, 0.6);
  g.save(); g.translate(dx, dy); K.camera(g, 1 + 0.06 * prog(t, 0, 1.6), 540, 700);
  blob(g, -260, 820, 640, 660, INK.head, { seed: 620, wob: 6 });
  g.save(); g.translate(560, 820); g.rotate(-0.12);
  rrFill(g, -330, -560, 660, 1250, 90, '#05070c');
  g.save(); g.beginPath(); g.roundRect(-300, -530, 600, 1190, 70); g.clip(); g.fillStyle = SCREEN; g.fillRect(-300, -530, 600, 1190);
  T(g, 'Me', 0, -260, { size: 110, weight: 900, color: '#ffffff' });
  T(g, `0:${String(Math.floor(gt - 18.3)).padStart(2, '0')}`, 0, -150, { size: 44, weight: 700, color: alpha('#dfe8ff', 0.6) });
  const n = 18; for (let i = 0; i < n; i++) { const u = i / (n - 1), h = 12 + 220 * amp * Math.abs(noise(u * 7 + gt * 11, 9)); g.fillStyle = BLUE; g.beginPath(); g.roundRect(-240 + u * 480 - 7, 60 - h / 2, 14, h, 7); g.fill(); }
  g.restore();
  chalk(g, rrPts(-330, -560, 660, 1250, 90), { w: 6, seed: 630, closed: true });
  chalk(g, rrPts(-150, -500, 300, 46, 23), { w: 4, seed: 631, closed: true });
  for (let i = 0; i < 12; i++) { g.fillStyle = alpha(BLUE, 0.4 + 0.6 * amp); g.beginPath(); g.arc(-120 + i * 22, -477, 5, 0, Math.PI * 2); g.fill(); }
  g.restore();
  lightPool(g, 540, 340, 420, BLUE, 0.9 * amp);
  if (talking) for (let i = 0; i < 3; i++) { const ph = ((t * 1.2 + i / 3) % 1); ellipse(g, 470, 340, 90 + ph * 260, 40 + ph * 120, { w: 3, a: (1 - ph) * 0.7, seed: 640 + i, from: Math.PI * 0.85, to: Math.PI * 1.25, color: BLUE }); }
  darkness(g, 0.45 + 0.2 * prog(t, 0, 1.6), [{ x: 520, y: 520, r: 900, k: 0.9 }]);
  g.restore();
});
// v17 33.3-35.6 [WHISPER] "Don't look under it. It's under there." The eyes slide DOWN.
reg('v17_eyes_down', (g, t) => {
  const k = ease.inOut(prog(t, 0.6, 1.5));
  headClose(g, t, { eyes: 'wide', brows: 'worried', look: [lerp(0.6, 0, k), lerp(-0.3, 1, k)], mouth: 'flat' }, { z: [1.05, 1.2], dur: 2.3, darkK: 0.7 + 0.15 * k });
});
// v18 35.6-38.4 (3 s silence) slow tilt down from the edge of the bed to the gap under it. Pure black.
reg('v18_tilt_gap', (g, t, info) => {
  const D = info.dur;
  const pan = 1050 * ease.inOut(prog(t, 0, D));
  g.save(); g.translate(0, -pan);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, 1120);
  const hem = []; for (let i = 0; i <= 14; i++) { const u = i / 14; hem.push([lerp(-40, 1120, u), 640 + Math.sin(u * 17 + 1) * 14]); }
  fillPoly(g, [[-40, -60], [1120, -60], ...hem.slice().reverse()], '#10141f'); chalk(g, hem, { w: 5, seed: 650 });
  for (let i = 0; i < 4; i++) chalk(g, [[120 + i * 260, 200], [150 + i * 250, 600]], { w: 2.5, seed: 651 + i, a: 0.4, double: false });
  rect(g, -40, 640, 1160, 300, { w: 4, seed: 655 }); rect(g, -40, 940, 1160, 60, { w: 4, seed: 656 });
  g.fillStyle = '#0b1120'; g.fillRect(-60, 2300, E.W + 120, 900);
  for (let i = 0; i < 6; i++) line(g, -40, 2300 + 70 * (i + 1) * (1 + i * 0.3), 1120, 2300 + 70 * (i + 1) * (1 + i * 0.3), { w: 2, a: 0.25, seed: 660 + i, double: false });
  lightPool(g, 540, 2600, 700, BLUE, 0.5);
  g.fillStyle = '#000'; g.fillRect(-60, 1000, E.W + 120, 1300);
  line(g, 60, 1000, 60, 2300, { w: 6, seed: 657 }); line(g, 1020, 1000, 1020, 2300, { w: 6, seed: 658 });
  line(g, -40, 2300, 1120, 2300, { w: 4, seed: 659 });
  g.restore();
  darkness(g, 0.35, [{ x: 540, y: 1800, r: 900, k: 0.6 }]);
});
// v19 38.4-40.1 "I didn't move." Wide and still: sitting up, frozen, phone at the ear.
// (uses v15 with params { frozen: true, z0: 1.15, dz: 0.03 })
// v20 40.1-42.2 "I played it again, to be sure." The thumb taps play again.  (uses v09 with params { replayed: true, tap: 0.9 })
// v21 42.2-43.7 "It was me." Macro on the caller: the avatar is MY face.
reg('v21_its_me', (g, t) => { g.save(); K.camera(g, lerp(2.0, 2.2, ease.inOut(prog(t, 0, 1.5))), 400, 510, 70, 190); vmScreen(g, t, { tapped: true, played: 0.4, replayed: true }); g.restore(); });
// v22 43.7-45.6 "It was definitely me." My face, realising.
reg('v22_realise', (g, t) => {
  const k = ease.inOut(prog(t, 0.3, 1.0));
  headClose(g, t, { eyes: k > 0.5 ? 'wide' : 'dot', brows: 'worried', look: [lerp(0.5, 0, k), lerp(0.7, 0, k)], mouth: k > 0.5 ? 'o' : 'flat' }, { z: [1.15, 1.35], dur: 1.9 });
});
// v23 45.6-47.9 "But I never said that." Extreme close, a slow small head shake.
reg('v23_never', (g, t) => headClose(g, t, { eyes: 'pin', brows: 'worried', look: [0, 0], mouth: { w: 0.4, c: -0.15, o: 0 } }, { z: [1.5, 1.6], dur: 2.3, shake: prog(t, 0.3, 0.8), darkK: 0.74 }));
// v24 47.9-49.4 (silence) wide: still sitting up in the dark; the camera drifts toward the gap under the bed.
reg('v24_room_gap', (g, t) => {
  g.save(); K.camera(g, 1.15 + 0.15 * ease.inOut(prog(t, 0, 1.5)), 520, 1350);
  const L = bedSide(g, t);
  const { ear } = sitter(g, 330, L.top + 10, 1.2, { eyes: 'pin', look: [0.2, 0.3], brows: 'worried', mouth: 'flat' });
  blanket(g, 250, 900, L.top - 10);
  lightPool(g, ear[0], ear[1], 260, BLUE, 0.7);
  darkness(g, 0.78, [{ x: ear[0], y: ear[1], r: 380, k: 1 }, { x: 325, y: 570, r: 300, k: 0.5 }]);
  g.restore();
});
// v25 49.4-51.2 "I checked the time." The screen wakes over the face.
reg('v25_check_time', (g, t) => {
  g.save(); K.camera(g, 1 + 0.06 * prog(t, 0, 1.8), 470, 800);
  const wake = 0.08 + 0.92 * ease.out(prog(t, 0.3, 0.5));
  lyingWithPhone(g, t, wake, { eyes: 'dot', look: [0.4, -1], brows: 'flat', mouth: 'flat' });
  g.restore();
});
// v26 51.2-53.75 HELD silent frame: tighter, still; only grain and the screen light.
reg('v26_held', (g, t) => {
  g.save(); K.camera(g, 1.35 + 0.03 * prog(t, 0, 2.5), 460, 860);
  lyingWithPhone(g, 0, 1, { eyes: 'pin', look: [0.4, -1], brows: 'raised', mouth: 'flat' });
  g.restore();
}, { vignette: 0.85 });
// v27 53.75-55.6 the lock screen: 3:11. Under it, the voicemail from "Me", received 3:12 AM. Jitter + sting.
reg('v27_clock', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.05 * prog(t, 0, 1.85), 470, 640);
  phoneBody(g, 110, 90, 720, 1100, { inside: (g, x, y, w, h) => {
    K.circleLine(g, x + w / 2, y + 90, 16, { w: 3, seed: 740, a: 0.8, from: Math.PI, to: Math.PI * 2 }); rrFill(g, x + w / 2 - 22, y + 90, 44, 34, 6, alpha('#dfe8ff', 0.8));
    T(g, 'Tuesday', x + w / 2, y + 200, { size: 40, weight: 700, color: alpha('#dfe8ff', 0.75) });
    T(g, '3:11', x + w / 2, y + 380, { size: 270, weight: 800, color: '#eef3ff', glow: 30, glowColor: alpha(BLUE, 0.8) });
    const cy = y + 610; rrFill(g, x + 30, cy, w - 60, 200, 28, alpha('#dfe8ff', 0.12));
    avatar(g, x + 100, cy + 100, 34);
    T(g, 'Voicemail', x + 160, cy + 70, { size: 34, weight: 800, align: 'left', color: alpha('#dfe8ff', 0.7) });
    T(g, 'Me', x + 160, cy + 130, { size: 58, weight: 900, align: 'left', color: '#ffffff' });
    T(g, '3:12 AM', x + w - 56, cy + 70, { size: 34, weight: 800, align: 'right', color: BLUE });
  } });
  g.restore();
}, { jitterAmp: 26 });
// v28 55.6-57.5 floor level. The gap under the bed, pure black. Two dot-eyes OPEN. Hard cut.
reg('v28_gap_eyes', (g, t) => {
  g.save(); K.camera(g, 1 + 0.1 * prog(t, 0, 1.9), 470, 800);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, 470);
  const hem = []; for (let i = 0; i <= 12; i++) { const u = i / 12; hem.push([lerp(-40, 1120, u), 300 + Math.sin(u * 15 + 2) * 12]); }
  chalk(g, hem, { w: 5, seed: 760 }); rect(g, -40, 340, 1160, 70, { w: 4, seed: 761 });
  g.fillStyle = '#0b1120'; g.fillRect(-60, 1180, E.W + 120, 800);
  lightPool(g, 470, 1500, 650, BLUE, 0.45);
  g.fillStyle = '#000'; g.fillRect(-60, 410, E.W + 120, 770);
  line(g, 40, 410, 40, 1180, { w: 6, seed: 762 });
  line(g, -40, 1180, 1120, 1180, { w: 4, seed: 763 });
  for (let i = 0; i < 5; i++) line(g, -40, 1180 + 60 * (i + 1) * (1 + i * 0.35), 1120, 1180 + 60 * (i + 1) * (1 + i * 0.35), { w: 2, a: 0.22, seed: 764 + i, double: false });
  const open = ease.out(prog(t, 0.45, 0.8));
  K.eyesInDark(g, 470, 790, { gap: 46, size: 13, blink: 1 - open, k: 0.2 + 0.8 * open });
  g.restore();
});
// v29 57.5-61.63 hard cut to the end card.
reg('v29_end', (g, t) => K.endCard(g, t), { captions: false, fx: false });
