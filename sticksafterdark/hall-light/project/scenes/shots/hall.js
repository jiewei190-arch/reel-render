// Sticks After Dark #4 "Hall Light". Accent: warm yellow hallway light.
// Sets not in the kit (his door close-up + calendar, me in bed, his empty room) live here, not in the kit.
import * as K from '/kits/sticks/sticks.js';
const { INK, stickFigure, stickHead, chalk, rect, line, ellipse, circleLine, lerp, clamp, prog, ease, text } = K;

const WARM = '#f2c45a';
K.setAccent(WARM);
const CLICK = 6.22;          // global time the hall light dies ("clicked")
const REVEAL = 21.03;        // "Grandma's": jitter + sting

// ---------------------------------------------------------------- local sets
// his door, close (shared by s02 lit and s11 dark). Calendar taped on it.
const DOOR = [250, 230, 560, 1420];
const CAL = [420, 560, 340, 360];
function calendar(g, o = {}) {
  const [x, y, w, h] = CAL, { arrow = 1, a = 1, label = true } = o;
  g.save(); g.globalAlpha *= a;
  g.fillStyle = '#121319'; g.fillRect(x, y, w, h);
  rect(g, x, y, w, h, { w: 3.5, seed: 1201 });
  // tape
  g.fillStyle = K.alpha(INK.chalk, 0.18); g.save(); g.translate(x + w / 2, y - 4); g.rotate(-0.06); g.fillRect(-40, -12, 80, 24); g.restore();
  text(g, 'NOVEMBER', x + w / 2, y + 30, { size: 26, font: 'Nunito', weight: 900, color: INK.chalk });
  const gx = x + 12, gy = y + 58, cw = (w - 24) / 7, rh = (h - 70) / 5;
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => text(g, d, gx + cw * (i + 0.5), gy - 4, { size: 14, font: 'Nunito', weight: 800, color: INK.dim }));
  for (let r = 0; r <= 5; r++) line(g, gx, gy + 8 + r * rh, gx + cw * 7, gy + 8 + r * rh, { w: 1.6, a: 0.55, seed: 1210 + r, double: false, wob: 0.8 });
  for (let c = 0; c <= 7; c++) line(g, gx + c * cw, gy + 8, gx + c * cw, gy + 8 + rh * 5, { w: 1.6, a: 0.55, seed: 1220 + c, double: false, wob: 0.8 });
  for (let d = 1; d <= 30; d++) { const i = d - 1, c = i % 7, r = Math.floor(i / 7); text(g, String(d), gx + c * cw + 9, gy + 8 + r * rh + 12, { size: 12, font: 'Nunito', weight: 800, color: INK.dim, align: 'left' }); }
  // a few crossed-off days (last week)
  for (let d = 1; d <= 7; d++) { const i = d - 1, cx = gx + (i % 7) * cw, cy = gy + 8; chalk(g, [[cx + 6, cy + 6], [cx + cw - 6, cy + rh - 6]], { w: 2, a: 0.55, seed: 1240 + d, double: false, wob: 0.6 }); }
  // THIS week (8-14): crayon arrow "GRANDMA'S ->" drawn across the row
  const ry = gy + 8 + rh * 1, k = clamp(arrow);
  if (k > 0) {
    g.save(); g.beginPath(); g.rect(gx, ry - 10, cw * 7 * k + 4, rh + 20); g.clip();
    if (label) text(g, "GRANDMA'S →", gx + cw * 3.5, ry + rh * 0.62, { size: 26, font: 'Fredoka', weight: 700, color: WARM });
    chalk(g, [[gx + 8, ry + rh * 0.88], [gx + cw * 7 - 10, ry + rh * 0.88]], { w: 3.5, color: WARM, seed: 1250, double: false, wob: 1 });
    chalk(g, [[gx + cw * 7 - 26, ry + rh * 0.88 - 9], [gx + cw * 7 - 10, ry + rh * 0.88], [gx + cw * 7 - 26, ry + rh * 0.88 + 9]], { w: 3.5, color: WARM, seed: 1251, double: false, wob: 0.8 });
    g.restore();
  }
  g.restore();
}
// a crayon drawing taped on his door: two little stick people holding hands under a sun
function drawing(g) {
  const x = 300, y = 330, w = 220, h = 180;
  g.fillStyle = '#15161c'; g.fillRect(x, y, w, h); rect(g, x, y, w, h, { w: 3, seed: 1301 });
  circleLine(g, x + 175, y + 40, 18, { w: 3, color: WARM, seed: 1302, double: false });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; line(g, x + 175 + Math.cos(a) * 25, y + 40 + Math.sin(a) * 25, x + 175 + Math.cos(a) * 34, y + 40 + Math.sin(a) * 34, { w: 2, color: WARM, seed: 1303 + i, double: false }); }
  stickFigure(g, 'stand', { mouth: 'smile' }, { x: x + 70, y: y + h - 14, s: 0.33, w: 7, wob: 0.5, seed: 1310 });
  stickFigure(g, 'stand', { mouth: 'smile' }, { x: x + 120, y: y + h - 14, s: 0.25, w: 7, wob: 0.5, seed: 1320 });
  line(g, x + 85, y + h - 70, x + 106, y + h - 62, { w: 2, seed: 1330, double: false });
}
function hisDoor(g, t, o = {}) {
  const [x, y, w, h] = DOOR, { lit = 1 } = o;
  g.fillStyle = INK.bg; g.fillRect(-60, -60, 1200, 2040);
  g.fillStyle = K.mix('#0b0c12', '#1b160c', lit); g.fillRect(x, y, w, h);
  rect(g, x - 26, y - 26, w + 52, h + 26, { w: 5, seed: 1101 });         // frame
  rect(g, x, y, w, h, { w: 4, seed: 1102 });
  rect(g, x + 50, y + 60, w - 100, 360, { w: 2.5, seed: 1103, a: 0.5 });  // panels
  rect(g, x + 50, y + 760, w - 100, 520, { w: 2.5, seed: 1104, a: 0.5 });
  circleLine(g, x + w - 60, y + 720, 18, { w: 4, seed: 1105 });
  line(g, -60, y + h, 1140, y + h, { w: 3, seed: 1106, a: 0.7 });          // floor
  g.fillStyle = '#000'; g.fillRect(x + 4, y + h - 8, w - 8, 10);         // gap under the door
  drawing(g); calendar(g, o);
}
// my bed seen from the side, me lying in it (eyes on the door, to the right)
function meInBed(g, x, y, w, f = {}) {
  const h = w * 0.28; K.bed(g, x, y, w);
  stickHead(g, x + w * 0.13, y - h * 1.28, 30, { eyes: 'wide', look: [1, 0], mouth: 'none', ...f }, { neck: false, seed: 1401 });
  // blanket pulled up to the nose
  g.fillStyle = '#0d0f16'; g.beginPath(); g.moveTo(x + w * 0.06, y - h * 1.12); g.quadraticCurveTo(x + w * 0.3, y - h * 1.55, x + w * 0.55, y - h * 1.25); g.quadraticCurveTo(x + w * 0.8, y - h * 1.15, x + w, y - h * 1.05); g.lineTo(x + w, y - h * 0.55); g.lineTo(x + w * 0.06, y - h * 0.55); g.closePath(); g.fill();
  chalk(g, [[x + w * 0.06, y - h * 1.12], [x + w * 0.3, y - h * 1.38], [x + w * 0.55, y - h * 1.25], [x + w, y - h * 1.05]], { w: 4, seed: 1402 });
}
const warmLine = (g, x0, x1, y, k) => { if (k <= 0) return; g.fillStyle = K.alpha(WARM, 0.95 * k); g.fillRect(x0, y - 7, x1 - x0, 8); K.lightPool(g, (x0 + x1) / 2, y, (x1 - x0) * 0.9, WARM, 0.55 * k); };

// ---------------------------------------------------------------- shots
// 0.0 the hall, lit warm, bulb buzzing and swaying, slow push. Moving from frame 1.
K.stickShot('s01_hall_lit', (g, t) => {
  const f = t < 0.15 ? 0.45 : K.flicker({ seed: 11, depth: 0.16, dips: 0.7 });
  g.save(); K.camera(g, 1.0 + 0.035 * t, 540, 900);
  const L = K.hallway(g, t, { endOpen: 0 });
  K.lightPool(g, 540, 1500, 800, WARM, 0.22 * f);
  const [bx, by] = K.bulb(g, 540, -20, { len: 330, swing: Math.sin(t * 1.4 + 0.6) * 0.06, on: f, glowR: 720 });
  K.darkness(g, 0.25 + 0.55 * (1 - f), [{ x: bx, y: by, r: 1100 }]);
  g.restore();
});
// his door at the end of the hall: his drawing, a calendar (planted, not yet read). Hall light washes it.
K.stickShot('s02_his_door', (g, t) => {
  const f = K.flicker({ seed: 12, depth: 0.14, dips: 0.4 });
  g.save(); K.camera(g, 1.06 - 0.03 * (t / 2.6), 540, 760, ...K.drift(5));
  hisDoor(g, t, { lit: f, arrow: 1, label: false });
  K.lightPool(g, 540, 40, 1100, WARM, 0.5 * f);
  K.darkness(g, 0.3 + 0.4 * (1 - f), [{ x: 540, y: 300, r: 1300 }]);
  g.restore();
});
// my room: the warm line under my door, the clock flips 11:59 -> 12:00 on "midnight"
K.stickShot('s03_clock', (g, t, info) => {
  const G = info.globalT, z = lerp(1.0, 1.55, ease.inOut(prog(t, 0, 1.3)));
  g.save(); K.camera(g, z, 690, 1260, 0, -330 * ease.inOut(prog(t, 0, 1.3)));
  const L = K.bedroom(g, t, { doorOpen: 0 }); const [dx, dy, dw, dh] = L.door;
  warmLine(g, dx + 4, dx + dw - 4, dy + dh, K.flicker({ seed: 13, depth: 0.1, dips: 0.3 }));
  meInBed(g, L.bed[0], L.bed[1], L.bed[2], { look: [1, -0.3] });
  // clock on the nightstand
  const cx = 695, cy = 1280; g.fillStyle = '#0a0a0d'; g.fillRect(cx - 52, cy - 26, 104, 52); rect(g, cx - 52, cy - 26, 104, 52, { w: 3, seed: 1501 });
  text(g, G < 5.58 ? '11:59' : '12:00', cx, cy + 2, { size: 34, font: 'Nunito', weight: 900, color: WARM });
  K.lightPool(g, cx, cy, 120, WARM, 0.35);
  K.darkness(g, 0.45, [{ x: dx + dw / 2, y: dy + dh, r: 420 }, { x: cx, y: cy, r: 260 }, { x: 280, y: 700, r: 400, k: 0.6 }]);
  g.restore();
});
// click: the hall goes black
K.stickShot('s04_click', (g, t, info) => {
  const G = info.globalT, f = K.flicker({ seed: 14, depth: 0.12, dips: 0.2, dies: CLICK });
  const after = prog(G, CLICK, CLICK + 0.9);
  g.save(); K.camera(g, 1.08 + 0.01 * t, 540, 900);
  K.hallway(g, t, { endOpen: 0 });
  K.lightPool(g, 540, 1500, 800, WARM, 0.22 * f);
  const [bx, by] = K.bulb(g, 540, -20, { len: 330, swing: 0.02, on: f, glowR: 720 });
  if (G >= CLICK) K.lightPool(g, bx, by, 60, WARM, 0.5 * (1 - after));   // filament after-glow
  K.darkness(g, G < CLICK ? 0.25 + 0.55 * (1 - f) : 0.9, [{ x: bx, y: by, r: 1100, k: G < CLICK ? 1 : 0.15 }]);
  g.restore();
});
// my bedroom door opening a crack into black; me reaching for it
K.stickShot('s05_crack', (g, t) => {
  const open = 0.02 + 0.13 * ease.inOut(prog(t, 0.5, 1.9));
  g.save(); K.camera(g, 1.0 + 0.03 * t, 600, 900, ...K.drift(4));
  g.fillStyle = '#0b0d13'; g.fillRect(-60, -60, 1200, 2040);
  line(g, -60, 1660, 1140, 1660, { w: 3, seed: 1601, a: 0.6 });
  K.door(g, 460, 300, 420, 1360, { open, seed: 1602 });
  circleLine(g, 460 + 420 * 0.15 + 420 * open * 0.6, 1000, 14, { w: 4, seed: 1603 });
  const r = stickFigure(g, K.posesMix('stand', 'reach', ease.out(prog(t, 0, 0.6))), { eyes: 'dot', look: [1, 0], brows: 'worried' }, { x: 240, y: 1660, s: 2.1, seed: 1610 });
  K.darkness(g, 0.55, [{ x: 200, y: 700, r: 700, k: 0.7 }]);
  g.restore();
});
// POV through the crack: the hall, black; his door at the end. The whisper comes from there.
K.stickShot('s06_end_dark', (g, t) => {
  g.save(); K.camera(g, 1.05 + 0.08 * ease.inOut(prog(t, 0, 2.15)), 540, 980);
  const L = K.hallway(g, t, { endOpen: 0 });
  K.darkness(g, 0.82, [{ x: 540, y: 990, r: 520, k: 0.35 }]);
  g.restore();
  // the door edges of my crack, left and right
  const half = 230 + 6 * Math.sin(t * 0.8);
  g.fillStyle = '#000'; g.fillRect(-60, -60, 540 - half + 60, 2040); g.fillRect(540 + half, -60, 600, 2040);
  line(g, 540 - half, -40, 540 - half, 1960, { w: 4, seed: 1701, a: 0.7 }); line(g, 540 + half, -40, 540 + half, 1960, { w: 3, seed: 1702, a: 0.4 });
});
// the gap under his door: something stands just behind it (two long dark shapes slide in)
K.stickShot('s07_under_door', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 1000);
  g.fillStyle = '#090a10'; g.fillRect(-60, -60, 1200, 2040);
  rect(g, 120, -100, 820, 1080, { w: 4, seed: 1801 }); rect(g, 180, 560, 700, 360, { w: 2.5, seed: 1802, a: 0.45 });
  line(g, -60, 1000, 1140, 1000, { w: 3, seed: 1803, a: 0.7 });
  // the gap: faint grey from inside his room
  const gx0 = 124, gx1 = 936, gy = 978, gh = 22;
  g.fillStyle = K.alpha('#9a9a92', 0.22); g.fillRect(gx0, gy, gx1 - gx0, gh);
  K.lightPool(g, 540, gy + 10, 500, '#b9b6aa', 0.12);
  // two shapes slide into the light, too narrow, too long; never more than that
  const k = ease.out(prog(t, 0.55, 1.3));
  g.fillStyle = '#010102';
  for (const [x0, w] of [[300, 120], [560, 130]]) { const x = lerp(x0 - 520, x0, k); g.fillRect(x, gy - 1, w, gh + 2); }
  K.darkness(g, 0.5, [{ x: 540, y: 990, r: 600 }]);
  g.restore();
});
// me, frozen in the crack of my door
K.stickShot('s08_frozen', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.06 * t, 560, 760);
  g.fillStyle = '#000'; g.fillRect(-60, -60, 1200, 2040);
  stickHead(g, 600, 760, 230, { eyes: 'wide', brows: 'worried', mouth: 'o', look: [-0.4 + 0.08 * Math.sin(t * 9), 0], blink: K.onFrames(14.95, 2) ? 1 : 0 }, { neck: true, seed: 1901 });
  g.fillStyle = '#0c0d12'; g.fillRect(780, -60, 400, 2040); line(g, 780, -40, 780, 1960, { w: 5, seed: 1902 });  // door edge cuts my face
  g.fillStyle = '#000'; g.fillRect(-60, -60, 300, 2040);
  K.darkness(g, 0.35, [{ x: 600, y: 700, r: 700 }]);
  g.restore();
});
// I back into bed (walk backwards), blanket up
K.stickShot('s09_back_bed', (g, t) => {
  g.save(); K.camera(g, 1.0, 540, 1000);
  const L = K.bedroom(g, t, { doorOpen: 0.08 + 0.06 * (1 - prog(t, 0.2, 0.7)) });
  if (t < 1.25) {
    const x = lerp(760, 330, ease.inOut(prog(t, 0, 1.25)));
    stickFigure(g, K.walk(-t * 1.5), { eyes: 'wide', look: [1, 0], mouth: 'o' }, { x, y: 1500, s: 1.25, flip: 1, seed: 2001 });
  } else meInBed(g, L.bed[0], L.bed[1], L.bed[2], { blink: K.onFrames(17.4, 2) ? 1 : 0 });
  K.darkness(g, 0.6, [{ x: 330, y: 700, r: 600, k: 0.6 }, { x: 600, y: 1300, r: 700, k: 0.5 }]);
  g.restore();
});
// held, silent: my door from the bed. A crack of black. Nothing moves.
K.stickShot('s10_held', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.025 * t, 540, 900);
  g.fillStyle = '#0b0d13'; g.fillRect(-60, -60, 1200, 2040);
  line(g, -60, 1640, 1140, 1640, { w: 3, seed: 2101, a: 0.6 });
  K.door(g, 330, 260, 420, 1380, { open: 0.1 + 0.015 * t, seed: 2102 });
  K.darkness(g, 0.6, [{ x: 540, y: 900, r: 800, k: 0.6 }]);
  g.restore();
}, { vignette: 0.85 });
// reveal: the calendar on his door. "GRANDMA'S ->" across this week. Jitter + sting on "Grandma's".
K.stickShot('s11_calendar', (g, t, info) => {
  const G = info.globalT, z = lerp(1.15, 2.35, ease.inOut(prog(G, 20.2, REVEAL)));
  g.save(); K.camera(g, z, CAL[0] + CAL[2] / 2, CAL[1] + CAL[3] / 2 - 40, (540 - (CAL[0] + CAL[2] / 2)) * prog(G, 20.2, REVEAL), (760 - CAL[1] - CAL[3] / 2) * prog(G, 20.2, REVEAL));
  hisDoor(g, t, { lit: 0, arrow: 1 });
  K.darkness(g, 0.5, [{ x: CAL[0] + CAL[2] / 2, y: CAL[1] + CAL[3] / 2, r: 600 }]);
  g.restore();
}, { jitter: [REVEAL], jitterAmp: 30 });
// his room: the bed made, a toy on the pillow. Empty all week.
K.stickShot('s12_empty_bed', (g, t) => {
  g.save(); K.camera(g, 1.12 + 0.06 * t, 470, 1150, 0, -480);
  const L = K.roomBox(g, { back: [150, 520, 780, 930], seed: 2200 }); const [bx, by, bw, bh] = L.back;
  K.windowFrame(g, bx + 460, by + 110, 240, 280, { moon: true, seed: 2210 });
  const x = bx + 60, y = by + bh - 20, w = 460; K.bed(g, x, y, w);
  // the covers pulled flat and tight, nobody in them
  chalk(g, [[x + w * 0.22, y - w * 0.28 * 1.0], [x + w, y - w * 0.28]], { w: 3, seed: 2220, a: 0.8 });
  // a small toy on the pillow: round ears, button eyes
  const tx = x + w * 0.13, ty = y - w * 0.28 * 1.2; K.blob(g, tx, ty, 22, 20, '#d8d2c2', { seed: 2230 }); K.blob(g, tx - 14, ty - 22, 8, 12, '#d8d2c2', { seed: 2231 }); K.blob(g, tx + 14, ty - 22, 8, 12, '#d8d2c2', { seed: 2232 });
  g.fillStyle = INK.feature; g.beginPath(); g.arc(tx - 7, ty - 2, 3, 0, 7); g.arc(tx + 7, ty - 2, 3, 0, 7); g.fill();
  // an unplugged night-light by the floor (off)
  rect(g, bx + 640, by + bh - 150, 30, 40, { w: 2.5, seed: 2240, a: 0.7 });
  K.darkness(g, 0.55, [{ x: bx + 580, y: by + 250, r: 650, k: 0.7 }, { x: x + w / 2, y: y - 140, r: 500, k: 0.5 }]);
  g.restore();
});
// final: the dark hall, his door ajar, two warm dot-eyes in his doorway. Hard cut.
K.stickShot('s13_eyes', (g, t) => {
  g.save(); K.camera(g, 1.12 + 0.12 * ease.in(prog(t, 0, 1.63)), 540, 980);
  const L = K.hallway(g, t, { endOpen: 0.45 }); const [x, y, w, h] = L.endDoor;
  K.darkness(g, 0.8, [{ x: 540, y: 990, r: 480, k: 0.4 }]);
  K.eyesInDark(g, x + w * 0.22, y + h * 0.56, { gap: 16, size: 6, k: prog(t, 0.1, 0.45), blink: K.onFrames(24.1, 2) ? 1 : 0 });
  g.restore();
}, { vignette: 0.85 });
K.stickShot('s14_end', (g, t) => K.endCard(g, t), { captions: false, fx: false });
