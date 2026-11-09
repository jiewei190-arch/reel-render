// Sticks After Dark #5 "Voicemail". Kit: /kits/sticks/sticks.js. Accent: cold blue phone/moon light.
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

// ================================================================ shots
// s01 0.0-2.0: dark bedroom, phone already buzzing on the blanket, the sleeper's face lit blue. Slow push in.
K.stickShot('s01_bed_buzz', (g, t) => {
  g.save(); K.camera(g, 1.12 + 0.08 * ease.inOut(prog(t, 0, 2)), 380, 1000);
  const L = bedSide(g, t);
  const buzzing = (t % 0.9) < 0.55, bx = buzzing ? Math.sin(t * 140) * 4 : 0;
  const pulse = 0.75 + 0.25 * Math.sin(t * 7);
  sleeperHead(g, L.head[0], L.head[1], 50, { eyes: 'dot', blink: blinkOpen(t, 0.55, 0.3), look: [1, 0.5], brows: t > 0.8 ? 'worried' : null }, { tilt: -0.22 });
  blanket(g, 310, 900, L.top - 10);
  // phone face-up on the blanket next to the head
  g.save(); g.translate(430 + bx, L.top - 40); g.rotate(-0.25 + (buzzing ? Math.sin(t * 90) * 0.02 : 0));
  rrFill(g, -38, -66, 76, 132, 12, mix(INK.bg, BLUE, 0.55 * pulse)); chalk(g, rrPts(-40, -68, 80, 136, 13), { w: 3.5, seed: 460, closed: true });
  g.restore();
  if (buzzing) for (const s of [-1, 1]) chalk(g, [[430 + s * 62, L.top - 90], [430 + s * 74, L.top - 40]], { w: 3, seed: 470 + s, a: 0.7, double: false });
  lightPool(g, 430, L.top - 40, 380, BLUE, 0.9 * pulse);
  darkness(g, 0.62, [{ x: 400, y: L.top - 40, r: 520 * pulse, k: 1 }, { x: 325, y: 570, r: 330, k: 0.7 }]);
  g.restore();
});

// s02 2.0-3.6: the voicemail screen. Caller: "Me". A thumb comes in and taps play.
K.stickShot('s02_vm_screen', (g, t) => {
  g.save(); K.camera(g, 1 + 0.05 * prog(t, 0, 1.6), 470, 640);
  phoneBody(g, 150, 150, 640, 1030, { inside: (g, x, y, w, h) => {
    T(g, '3:12', x + 70, y + 46, { size: 30, weight: 700 });
    T(g, 'Voicemail', x + 40, y + 140, { size: 58, weight: 900, align: 'left' });
    T(g, '1 new', x + w - 40, y + 140, { size: 30, weight: 700, align: 'right', color: BLUE });
    const cy = y + 250; rrFill(g, x + 22, cy, w - 44, 330, 26, alpha(BLUE, 0.13));
    avatar(g, x + 100, cy + 85, 42);
    T(g, 'Me', x + 170, cy + 70, { size: 76, weight: 900, align: 'left', color: '#ffffff' });
    T(g, 'my number', x + 172, cy + 128, { size: 32, weight: 700, align: 'left', color: alpha('#dfe8ff', 0.6) });
    T(g, '3:12 AM', x + w - 50, cy + 70, { size: 34, weight: 800, align: 'right', color: BLUE });
    const tap = prog(t, 1.15, 1.25); const played = tap > 0 ? 0.02 + 0.1 * prog(t, 1.2, 1.6) : 0;
    // play button
    const px = x + 90, py = cy + 240; g.fillStyle = tap > 0 ? '#ffffff' : BLUE; g.beginPath(); g.arc(px, py, 38, 0, Math.PI * 2); g.fill();
    g.fillStyle = SCREEN; g.beginPath(); if (tap > 0) { g.fillRect(px - 13, py - 15, 9, 30); g.fillRect(px + 4, py - 15, 9, 30); } else { g.moveTo(px - 10, py - 17); g.lineTo(px + 17, py); g.lineTo(px - 10, py + 17); g.closePath(); g.fill(); }
    waveform(g, x + 160, x + w - 50, py, 46, (u) => 0.2 + 0.25 * Math.abs(Math.sin(u * 9)) * (0.5 + 0.5 * noise(u * 20, 3)), played, 3);
    T(g, '0:41', x + w - 50, py + 60, { size: 26, weight: 700, align: 'right', color: alpha('#dfe8ff', 0.5) });
    // nothing else in the list
    for (let i = 0; i < 3; i++) rrFill(g, x + 22, cy + 370 + i * 120, w - 44, 96, 20, alpha('#dfe8ff', 0.03));
  } });
  // the thumb (chalk) slides in from bottom-right and taps play at 1.15 s
  const k = ease.out(prog(t, 0.35, 1.15)), back = ease.in(prog(t, 1.3, 1.6));
  const tx = lerp(860, 290, k) + back * 120, ty = lerp(1500, 640, k) + back * 160;
  chalk(g, [[tx + 190, ty + 520], [tx + 10, ty + 40], [tx + 25, ty - 18], [tx + 75, ty - 22], [tx + 110, ty + 30], [tx + 300, ty + 470]], { w: 5, seed: 480 });
  chalk(g, [[tx + 32, ty - 2], [tx + 70, ty - 6]], { w: 2.5, seed: 481, a: 0.6, double: false });
  g.restore();
});

// s03 3.6-5.45: close on the head on the pillow. Wide eyes, blue light from below. "3:12 a.m."
K.stickShot('s03_head_pillow', (g, t) => {
  const [dx, dy] = K.drift(8);
  g.save(); g.translate(dx, dy); K.camera(g, 1 + 0.06 * prog(t, 0, 1.85), 470, 700);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  ellipse(g, 470, 900, 470, 150, { w: 5, seed: 500 });                // pillow
  sleeperHead(g, 470, 690, 230, { eyes: 'wide', brows: 'worried', look: [0.5, 0.7], mouth: 'flat', blink: (t > 1.1 && t < 1.22) ? 0.95 : 0 }, { tilt: -0.12, seed: 23 });
  blanket(g, -40, 1100, 1020, { hump: 20, seed: 510 });
  const p = 0.8 + 0.2 * Math.sin(t * 5);
  lightPool(g, 760, 1080, 700, BLUE, 0.9 * p);
  darkness(g, 0.68, [{ x: 700, y: 980, r: 900 * p, k: 1 }]);
  g.restore();
});

// s04 5.45-7.75: the voicemail playing: a slow BREATHING waveform.
K.stickShot('s04_breath_wave', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.05 * prog(t, 0, 2.3), 470, 700);
  const breath = (tt) => { const ph = (tt % 2.15) / 2.15; return Math.pow(Math.sin(Math.PI * Math.min(1, ph / 0.92)), 1.4); };
  phoneBody(g, 120, 140, 700, 1060, { inside: (g, x, y, w, h) => {
    avatar(g, x + w / 2, y + 150, 56);
    T(g, 'Me', x + w / 2, y + 270, { size: 80, weight: 900, color: '#ffffff' });
    T(g, 'Voicemail  ·  3:12 AM', x + w / 2, y + 340, { size: 32, weight: 700, color: alpha('#dfe8ff', 0.6) });
    // big live waveform: the bars swell and fall like slow breathing
    const n = 26, x0 = x + 50, x1 = x + w - 50, cy = y + 600;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), x_ = lerp(x0, x1, u), local = breath(t - u * 0.35);
      const h = 10 + 300 * local * (0.55 + 0.45 * Math.abs(noise(u * 9 + t * 3, 5)));
      g.fillStyle = alpha(BLUE, 0.35 + 0.65 * local); g.beginPath(); g.roundRect(x_ - 7, cy - h / 2, 14, h, 7); g.fill();
    }
    lightPool(g, x + w / 2, cy, 300, BLUE, 0.4 * breath(t));
    const sec = Math.floor(2 + t * 1.0);
    T(g, `0:0${Math.min(9, sec)}`, x + 60, y + 820, { size: 30, weight: 700, align: 'left', color: alpha('#dfe8ff', 0.6) });
    T(g, '0:41', x + w - 60, y + 820, { size: 30, weight: 700, align: 'right', color: alpha('#dfe8ff', 0.6) });
    rrFill(g, x + 60, y + 770, w - 120, 6, 3, alpha('#dfe8ff', 0.2)); rrFill(g, x + 60, y + 770, (w - 120) * (0.05 + t * 0.025), 6, 3, BLUE);
  } });
  darkness(g, 0.25, [{ x: 470, y: 700, r: 900 }]);
  g.restore();
});

// s05 7.75-9.95: sitting up in bed, phone pressed to the ear. Eyes go wide on "whispering".
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
K.stickShot('s05_phone_ear', (g, t) => {
  g.save(); K.camera(g, 1.5 + 0.1 * ease.inOut(prog(t, 0, 2.2)), 330, 940);
  const L = bedSide(g, t);
  const wide = prog(t, 1.15, 1.35);
  const { ear } = sitter(g, 330, L.top + 10, 1.2, { eyes: wide > 0.5 ? 'wide' : 'dot', look: [0.6, 0], brows: wide > 0.5 ? 'worried' : 'flat', mouth: wide > 0.5 ? 'o' : 'flat' });
  blanket(g, 250, 900, L.top - 10);
  const p = 0.85 + 0.15 * Math.sin(t * 9);
  lightPool(g, ear[0], ear[1], 300, BLUE, 0.9 * p);
  darkness(g, 0.66, [{ x: ear[0], y: ear[1], r: 480, k: 1 }, { x: 325, y: 570, r: 300, k: 0.6 }]);
  g.restore();
});

// s06 9.95-11.4: extreme close-up: the phone's speaker against the side of the head. The whisper.
K.stickShot('s06_speaker', (g, t, info) => {
  const gt = info.globalT, talking = gt > 10.3 && gt < 12.55;
  const amp = talking ? 0.45 + 0.55 * Math.abs(noise(gt * 9, 2)) : 0.15;
  const [dx, dy] = K.drift(6, 0.6);
  g.save(); g.translate(dx, dy); K.camera(g, 1 + 0.06 * prog(t, 0, 1.45), 540, 700);
  // the head (huge, white) from the left; the phone pressed against it
  blob(g, -260, 820, 640, 660, INK.head, { seed: 620, wob: 6 });
  g.save(); g.translate(560, 820); g.rotate(-0.12);
  rrFill(g, -330, -560, 660, 1250, 90, '#05070c');
  g.save(); g.beginPath(); g.roundRect(-300, -530, 600, 1190, 70); g.clip(); g.fillStyle = SCREEN; g.fillRect(-300, -530, 600, 1190);
  T(g, 'Me', 0, -260, { size: 110, weight: 900, color: '#ffffff' });
  T(g, `0:${String(27 + Math.floor(t * 1)).padStart(2, '0')}`, 0, -150, { size: 44, weight: 700, color: alpha('#dfe8ff', 0.6) });
  const n = 18; for (let i = 0; i < n; i++) { const u = i / (n - 1), h = 12 + 220 * amp * Math.abs(noise(u * 7 + gt * 11, 9)); g.fillStyle = BLUE; g.beginPath(); g.roundRect(-240 + u * 480 - 7, 60 - h / 2, 14, h, 7); g.fill(); }
  g.restore();
  chalk(g, rrPts(-330, -560, 660, 1250, 90), { w: 6, seed: 630, closed: true });
  // speaker slot with holes at the top edge
  chalk(g, rrPts(-150, -500, 300, 46, 23), { w: 4, seed: 631, closed: true });
  for (let i = 0; i < 12; i++) { g.fillStyle = alpha(BLUE, 0.4 + 0.6 * amp); g.beginPath(); g.arc(-120 + i * 22, -477, 5, 0, Math.PI * 2); g.fill(); }
  g.restore();
  lightPool(g, 560 - 20, 820 - 480, 420, BLUE, 0.9 * amp);
  // sound arcs leaking from the speaker into the head
  for (let i = 0; i < 3; i++) { const ph = ((t * 1.2 + i / 3) % 1); if (!talking) break; ellipse(g, 470, 340, 90 + ph * 260, 40 + ph * 120, { w: 3, a: (1 - ph) * 0.7, seed: 640 + i, from: Math.PI * 0.85, to: Math.PI * 1.25, color: BLUE }); }
  darkness(g, 0.45 + 0.2 * prog(t, 0, 1.45), [{ x: 520, y: 520, r: 900, k: 0.9 }]);
  g.restore();
});

// s07 11.4-12.55: "It's under there." Close on the face: the eyes slide DOWN, toward the floor.
K.stickShot('s07_eyes_down', (g, t) => {
  g.save(); K.camera(g, 1.05 + 0.12 * ease.inOut(prog(t, 0, 1.15)), 470, 700);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, E.H + 120);
  ellipse(g, 470, 900, 470, 150, { w: 5, seed: 500 });
  const k = ease.inOut(prog(t, 0.15, 0.75));
  sleeperHead(g, 470, 690, 230, { eyes: 'wide', brows: 'worried', look: [lerp(0.6, 0, k), lerp(-0.3, 1, k)], mouth: 'flat' }, { tilt: -0.12, seed: 23 });
  blanket(g, -40, 1100, 1020, { hump: 20, seed: 510 });
  lightPool(g, 760, 1080, 700, BLUE, 0.8);
  darkness(g, 0.7 + 0.15 * k, [{ x: 640, y: 900, r: 820, k: 1 }]);
  g.restore();
});

// s08 12.55-14.05: slow tilt down from the edge of the bed to the gap under it. Pure black.
K.stickShot('s08_tilt_gap', (g, t) => {
  const pan = 1050 * ease.inOut(prog(t, 0, 1.5));
  g.save(); g.translate(0, -pan);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, 1120);
  // blanket hem hanging over the mattress side
  const hem = []; for (let i = 0; i <= 14; i++) { const u = i / 14; hem.push([lerp(-40, 1120, u), 640 + Math.sin(u * 17 + 1) * 14]); }
  fillPoly(g, [[-40, -60], [1120, -60], ...hem.slice().reverse()].reverse(), '#10141f'); chalk(g, hem, { w: 5, seed: 650 });
  for (let i = 0; i < 4; i++) chalk(g, [[120 + i * 260, 200], [150 + i * 250, 600]], { w: 2.5, seed: 651 + i, a: 0.4, double: false });
  // mattress side + rail
  rect(g, -40, 640, 1160, 300, { w: 4, seed: 655 }); rect(g, -40, 940, 1160, 60, { w: 4, seed: 656 });
  // the gap: pure black, then the floor in moonlight
  g.fillStyle = '#000'; g.fillRect(-60, 1000, E.W + 120, 1300);
  line(g, 60, 1000, 60, 2300, { w: 6, seed: 657 }); line(g, 1020, 1000, 1020, 2300, { w: 6, seed: 658 });
  g.fillStyle = '#0b1120'; g.fillRect(-60, 2300, E.W + 120, 900); line(g, -40, 2300, 1120, 2300, { w: 4, seed: 659 });
  for (let i = 0; i < 6; i++) line(g, -40, 2300 + 70 * (i + 1) * (1 + i * 0.3), 1120, 2300 + 70 * (i + 1) * (1 + i * 0.3), { w: 2, a: 0.25, seed: 660 + i, double: false });
  lightPool(g, 540, 2600, 700, BLUE, 0.5);
  g.fillStyle = '#000'; g.fillRect(-60, 1000, E.W + 120, 1300);   // keep the gap pure black over the light
  line(g, -40, 2300, 1120, 2300, { w: 4, seed: 659 });
  g.restore();
  darkness(g, 0.35, [{ x: 540, y: 1800, r: 900, k: 0.6 }]);
});

// s09 14.05-15.6: "I checked the time." Lying back, the phone raised over the face; the screen wakes.
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
K.stickShot('s09_check_time', (g, t) => {
  g.save(); K.camera(g, 1 + 0.06 * prog(t, 0, 1.55), 470, 800);
  const wake = 0.08 + 0.92 * ease.out(prog(t, 0.3, 0.5));
  lyingWithPhone(g, t, wake, { eyes: 'dot', look: [0.4, -1], brows: 'flat', mouth: 'flat' });
  g.restore();
});
// s10 15.6-17.25: HELD silent frame. Tighter, still; only grain and the screen light.
K.stickShot('s10_held', (g, t) => {
  g.save(); K.camera(g, 1.35 + 0.03 * prog(t, 0, 1.65), 460, 860);
  lyingWithPhone(g, 0, 1, { eyes: 'pin', look: [0.4, -1], brows: 'raised', mouth: 'flat' });
  g.restore();
}, { vignette: 0.85 });

// s11 17.25-18.85: the lock screen: 3:11. Under it, the voicemail from "Me", received 3:12 AM. Jitter + sting.
K.stickShot('s11_clock', (g, t, info) => {
  g.save(); K.camera(g, 1.0 + 0.05 * prog(t, 0, 1.6), 470, 640);
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
}, { jitter: [17.92], jitterAmp: 26 });

// s12 18.85-20.1: floor level. The gap under the bed, pure black. Two dot-eyes OPEN. Hard cut.
K.stickShot('s12_gap_eyes', (g, t) => {
  g.save(); K.camera(g, 1 + 0.08 * prog(t, 0, 1.25), 470, 800);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, E.W + 120, 470);
  const hem = []; for (let i = 0; i <= 12; i++) { const u = i / 12; hem.push([lerp(-40, 1120, u), 300 + Math.sin(u * 15 + 2) * 12]); }
  chalk(g, hem, { w: 5, seed: 760 }); rect(g, -40, 340, 1160, 70, { w: 4, seed: 761 });
  g.fillStyle = '#000'; g.fillRect(-60, 410, E.W + 120, 770);
  line(g, 40, 410, 40, 1180, { w: 6, seed: 762 });
  g.fillStyle = '#0b1120'; g.fillRect(-60, 1180, E.W + 120, 800);
  lightPool(g, 470, 1500, 650, BLUE, 0.45);
  g.fillStyle = '#000'; g.fillRect(-60, 410, E.W + 120, 770);
  line(g, -40, 1180, 1120, 1180, { w: 4, seed: 763 });
  for (let i = 0; i < 5; i++) line(g, -40, 1180 + 60 * (i + 1) * (1 + i * 0.35), 1120, 1180 + 60 * (i + 1) * (1 + i * 0.35), { w: 2, a: 0.22, seed: 764 + i, double: false });
  const open = ease.out(prog(t, 0.3, 0.6));
  K.eyesInDark(g, 470, 790, { gap: 46, size: 13, blink: 1 - open, k: 0.2 + 0.8 * open });
  g.restore();
});

// s13 20.1-22.92: hard cut to the end card.
K.stickShot('s13_end', (g, t) => K.endCard(g, t), { captions: false, fx: false });
