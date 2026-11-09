// Sticks After Dark #4 "Hall Light" (60-70 s cut). Accent: warm yellow hallway light.
// Sets not in the kit (his door close-up + calendar, me in bed, his empty room, bulb/switch close-ups, ladder) live here, not in the kit.
import * as K from '/kits/sticks/sticks.js';
const { INK, stickFigure, stickHead, chalk, rect, line, ellipse, circleLine, lerp, clamp, prog, ease, text } = K;

const WARM = '#f2c45a';
K.setAccent(WARM);
const MIDNIGHT = 19.28;      // clock flips on "midnight"
const CLICK = 19.85;         // the hall light dies on "clicked"
const CLICK2 = 24.40;        // "Just, click." (the line under my door snaps off)
const REVEAL = 59.97;        // "Grandma's": jitter + sting
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
// blanket lump over my head (cover 0..1)
function lump(g, x, y, w, k) {
  if (k <= 0) return; const h = w * 0.28, cx = x + w * 0.15, cy = y - h * 1.15, rx = 62, ry = 66 * k;
  g.fillStyle = '#0d0f16'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2); g.closePath(); g.fill();
  const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  chalk(g, pts, { w: 4, seed: 1450 });
}
const warmLine = (g, x0, x1, y, k) => { if (k <= 0) return; g.fillStyle = K.alpha(WARM, 0.95 * k); g.fillRect(x0, y - 7, x1 - x0, 8); K.lightPool(g, (x0 + x1) / 2, y, (x1 - x0) * 0.9, WARM, 0.55 * k); };
// the hall: lit by the bulb with flicker f (0 = black)
function hall(g, t, f, o = {}) {
  const L = K.hallway(g, t, { endOpen: o.endOpen ?? 0 });
  K.lightPool(g, 540, 1500, 800, WARM, 0.22 * f);
  const [bx, by] = K.bulb(g, 540, -20, { len: 330, swing: o.swing ?? Math.sin(K.K.now * 1.4 + 0.6) * 0.05, on: f, glowR: 720 });
  K.darkness(g, o.dark ?? (0.25 + 0.6 * (1 - f)), [{ x: bx, y: by, r: 1100, k: 0.15 + 0.85 * f }]);
  return L;
}
// big bulb close-up: filament, glow, hum lines (hum 0..1)
function bigBulb(g, t, on, hum, o = {}) {
  g.fillStyle = INK.bg; g.fillRect(-60, -60, 1200, 2040);
  const cx = 540 + Math.sin(K.K.now * 1.3) * 10, cy = 820;
  chalk(g, [[540, -60], [cx, cy - 230]], { w: 4, seed: 1601 });
  rect(g, cx - 50, cy - 240, 100, 90, { w: 5, seed: 1602 });
  for (let i = 0; i < 3; i++) line(g, cx - 50, cy - 220 + i * 25, cx + 50, cy - 212 + i * 25, { w: 2.5, seed: 1603 + i, a: 0.7 });
  g.save(); g.fillStyle = on > 0.05 ? K.mix(INK.bg, WARM, 0.25 + 0.6 * on) : '#101116'; g.beginPath(); g.ellipse(cx, cy, 130, 150, 0, 0, Math.PI * 2); g.fill(); g.restore();
  ellipse(g, cx, cy, 132, 152, { w: 5, seed: 1610 });
  // filament
  const fc = on > 0.05 ? K.mix('#ffffff', WARM, 0.3) : INK.dim;
  chalk(g, [[cx - 40, cy - 150], [cx - 34, cy + 10], [cx - 20, cy - 20], [cx - 6, cy + 10], [cx + 8, cy - 20], [cx + 22, cy + 10], [cx + 34, cy + 10], [cx + 40, cy - 150]], { w: 3, color: fc, seed: 1611, double: false });
  if (o.cracked) chalk(g, [[cx + 60, cy - 90], [cx + 30, cy - 40], [cx + 55, cy - 10], [cx + 25, cy + 40]], { w: 3, seed: 1612, a: 0.8 });
  if (on > 0.02) { K.lightPool(g, cx, cy, 1100, WARM, 0.9 * on); K.lightPool(g, cx, cy, 200, '#ffffff', 0.6 * on); }
  // hum: wavy rings that flatten as hum -> 0
  if (hum > 0.01) for (let r = 0; r < 3; r++) {
    const R = 230 + r * 70, pts = []; for (let i = 0; i <= 40; i++) { const a = -0.55 * Math.PI + i / 40 * 1.1 * Math.PI; const rr = R + Math.sin(i * 1.7 + K.K.now * 30 + r) * 9 * hum; pts.push([cx + Math.cos(a) * rr * 0.9, cy + Math.sin(a) * rr]); }
    chalk(g, pts, { w: 2.5, a: 0.6 * hum * (1 - r * 0.25), seed: 1620 + r, double: false, step: 20 });
    const p2 = pts.map(([x, y]) => [2 * cx - x, y]); chalk(g, p2, { w: 2.5, a: 0.6 * hum * (1 - r * 0.25), seed: 1630 + r, double: false, step: 20 });
  }
  return [cx, cy];
}
// the wall switch, close (lit 0..1)
function wallSwitch(g, lit) {
  g.fillStyle = K.mix('#0b0c12', '#221b0c', lit); g.fillRect(-60, -60, 1200, 2040);
  const x = 400, y = 560, w = 260, h = 400;
  g.fillStyle = '#16171d'; g.fillRect(x, y, w, h); rect(g, x, y, w, h, { w: 5, seed: 1701 });
  circleLine(g, x + w / 2, y + 40, 9, { w: 3, seed: 1702 }); circleLine(g, x + w / 2, y + h - 40, 9, { w: 3, seed: 1703 });
  rect(g, x + 85, y + 130, 90, 140, { w: 4, seed: 1704 });
  g.fillStyle = '#d8d2c2'; g.fillRect(x + 100, y + 140, 60, 62); rect(g, x + 100, y + 140, 60, 62, { w: 3, seed: 1705 }); // toggle UP (on)
  if (lit > 0) K.lightPool(g, 540, 0, 1200, WARM, 0.6 * lit);
}
// my bedroom with me in bed; returns layout
function myRoom(g, t, o = {}) {
  const L = K.bedroom(g, t, { doorOpen: o.doorOpen ?? 0, moon: o.moon ?? true });
  if (o.sky) K.windowFrame(g, ...L.window, { moon: false, sky: o.sky, seed: 410 });
  const [dx, dy, dw, dh] = L.door; warmLine(g, dx + 4, dx + dw - 4, dy + dh, o.line ?? 0);
  if (o.inBed !== false) { meInBed(g, L.bed[0], L.bed[1], L.bed[2], o.face || {}); lump(g, L.bed[0], L.bed[1], L.bed[2], o.cover || 0); }
  return L;
}
function ladderDad(g, t) {
  const top = 520; chalk(g, [[330, 1700], [470, top]], { w: 6, seed: 1801 }); chalk(g, [[690, 1700], [570, top]], { w: 6, seed: 1802 });
  for (let i = 1; i < 9; i++) { const k = i / 9, y = lerp(1700, top, k); line(g, lerp(330, 470, k), y, lerp(690, 570, k), y, { w: 4, seed: 1810 + i }); }
  return stickFigure(g, K.posesMix('stand', 'handsUp', 0.6 + 0.2 * Math.sin(t * 3)), { eyes: 'dot', look: [0, -1], mouth: 'flat' }, { x: 520, y: lerp(1700, top, 4 / 9), s: 1.5, seed: 1820 });
}
const flashback = (g) => { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(150,140,120,1)'; g.fillRect(-60, -60, 1200, 2040); g.restore(); };
const grey = (t0, t1) => K.mix('#0b0f1c', '#4a4c52', ease.inOut(prog(K.K.now, t0, t1)));

// ---------------------------------------------------------------- shots
// 1. frame 1: the hall, lit warm, bulb flickering + swaying, slow push
K.stickShot('s01_hall_lit', (g, t) => { const f = t < 0.15 ? 0.45 : K.flicker({ seed: 11, depth: 0.16, dips: 0.7 }); g.save(); K.camera(g, 1.0 + 0.035 * t, 540, 900); hall(g, t, f); g.restore(); });
// 2. his door, his drawing, the calendar planted (label hidden)
K.stickShot('s02_his_door', (g, t) => {
  const f = K.flicker({ seed: 12, depth: 0.14, dips: 0.4 }); g.save(); K.camera(g, 1.06 - 0.02 * t, 540, 760, ...K.drift(5));
  hisDoor(g, t, { lit: f, arrow: 1, label: false }); K.lightPool(g, 540, 40, 1100, WARM, 0.5 * f); K.darkness(g, 0.3 + 0.4 * (1 - f), [{ x: 540, y: 300, r: 1300 }]); g.restore();
});
// 3. the switch, always up
K.stickShot('s03_switch', (g, t) => { g.save(); K.camera(g, 1.0 + 0.04 * t, 530, 760); wallSwitch(g, K.flicker({ seed: 13, depth: 0.12, dips: 0.3 })); g.restore(); });
// 4. "an old yellow bulb": close-up
K.stickShot('s04_bulb', (g, t) => { g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 820); bigBulb(g, t, K.flicker({ seed: 14, depth: 0.12, dips: 0.4 }), 0.6); g.restore(); });
// 5. "It hums. You get used to it.": me in bed, eyes closing, warm line under my door
K.stickShot('s05_used', (g, t) => {
  g.save(); K.camera(g, 1.15, 420, 1250, 0, -260);
  const L = myRoom(g, t, { line: K.flicker({ seed: 15, depth: 0.1, dips: 0.2 }), face: { eyes: t > 1.6 ? 'closed' : 'half', look: [0.5, 0] } });
  const [dx, dy, dw, dh] = L.door; K.darkness(g, 0.45, [{ x: dx + dw / 2, y: dy + dh, r: 420 }, { x: 280, y: 1250, r: 360, k: 0.6 }]); g.restore();
});
// 6. flashback: "last month it burned out": the dead bulb, cracked
K.stickShot('s06_burned', (g, t) => { g.save(); K.camera(g, 1.1 - 0.03 * t, 540, 820, ...K.drift(4)); bigBulb(g, t, t < 0.35 ? K.flicker({ seed: 16, dies: 11.55 }) : 0, 0, { cracked: true }); K.darkness(g, 0.4, [{ x: 540, y: 820, r: 500 }]); g.restore(); flashback(g); });
// 7. flashback: he screamed (small figure in his doorway, dark hall)
K.stickShot('s07_scream', (g, t) => {
  g.save(); K.camera(g, 1.25, 540, 1000, ...K.drift(9, 4)); const L = K.hallway(g, t, { endOpen: 1 }); const [x, y, w, h] = L.endDoor;
  stickFigure(g, 'handsUp', { eyes: 'wide', mouth: { w: 0.5, c: 0, o: 0.5 }, brows: 'worried' }, { x: x + w / 2, y: y + h - 4, s: 0.62, seed: 1901 });
  K.darkness(g, 0.65, [{ x: x + w / 2, y: y + h * 0.6, r: 380 }]); g.restore(); flashback(g);
});
// 8. flashback: Dad on a ladder, the new bulb comes on
K.stickShot('s08_ladder', (g, t) => {
  const on = ease.out(prog(t, 0.7, 1.0)); g.save(); K.camera(g, 1.0, 540, 900);
  g.fillStyle = INK.bg; g.fillRect(-60, -60, 1200, 2040); line(g, -60, 1700, 1140, 1700, { w: 3, seed: 1951, a: 0.6 });
  ladderDad(g, t); K.bulb(g, 520, -20, { len: 280, on, glowR: 800 });
  K.darkness(g, 0.75 * (1 - on) + 0.25, [{ x: 520, y: 260, r: 1000, k: on }]); g.restore(); flashback(g);
});
// 9. "so we never let it go out": the hall again, bulb steady
K.stickShot('s09_never', (g, t) => { g.save(); K.camera(g, 1.12 - 0.04 * t, 540, 400); hall(g, t, K.flicker({ seed: 19, depth: 0.08, dips: 0.1 })); g.restore(); });
// 10. midnight: clock flips 11:59 -> 12:00
K.stickShot('s10_clock', (g, t) => {
  const z = lerp(1.1, 1.5, ease.inOut(prog(t, 0, 1.2))); g.save(); K.camera(g, z, 690, 1260, 0, -330);
  const L = myRoom(g, t, { line: 1, face: { look: [1, -0.3] } });
  const cx = 695, cy = 1280; g.fillStyle = '#0a0a0d'; g.fillRect(cx - 52, cy - 26, 104, 52); rect(g, cx - 52, cy - 26, 104, 52, { w: 3, seed: 1501 });
  text(g, K.K.now < MIDNIGHT ? '11:59' : '12:00', cx, cy + 2, { size: 34, font: 'Nunito', weight: 900, color: WARM }); K.lightPool(g, cx, cy, 120, WARM, 0.35);
  const [dx, dy, dw, dh] = L.door; K.darkness(g, 0.45, [{ x: dx + dw / 2, y: dy + dh, r: 420 }, { x: cx, y: cy, r: 260 }]); g.restore();
});
// 11. click: the hall goes black
K.stickShot('s11_click', (g, t) => {
  const f = K.K.now < CLICK ? 1 : 0; g.save(); K.camera(g, 1.08 + 0.01 * t, 540, 900);
  hall(g, t, f, { swing: 0.02, dark: f ? 0.25 : 0.9 }); if (!f) K.lightPool(g, 540, 310, 60, WARM, 0.5 * (1 - prog(K.K.now, CLICK, CLICK + 0.9))); g.restore();
});
// 12. "No flicker.": the bulb, dead, still
K.stickShot('s12_noflicker', (g, t) => { g.save(); K.camera(g, 1.05, 540, 820); bigBulb(g, t, 0, 0); K.darkness(g, 0.55, [{ x: 540, y: 820, r: 520 }]); g.restore(); });
// 13. "No pop.": the switch in the dark, still UP
K.stickShot('s13_nopop', (g, t) => { g.save(); K.camera(g, 1.05 + 0.04 * t, 530, 760); wallSwitch(g, 0); K.darkness(g, 0.5, [{ x: 530, y: 760, r: 520 }]); g.restore(); });
// 14. "Just, click.": the line under my door snaps off
K.stickShot('s14_line_off', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.02 * t, 540, 1100); g.fillStyle = '#0b0d13'; g.fillRect(-60, -60, 1200, 2040);
  K.door(g, 300, 160, 480, 1320, { seed: 2001 }); line(g, -60, 1480, 1140, 1480, { w: 3, seed: 2002, a: 0.6 });
  warmLine(g, 304, 776, 1480, K.K.now < CLICK2 ? 1 : 0); K.darkness(g, 0.55, [{ x: 540, y: 1480, r: 500 }]); g.restore();
});
// 15. "The hum stopped.": hum rings flatten around the dead bulb
K.stickShot('s15_hum_stop', (g, t) => { g.save(); K.camera(g, 1.0, 540, 820); bigBulb(g, t, 0, 1 - ease.inOut(prog(t, 0.2, 0.9))); K.darkness(g, 0.45, [{ x: 540, y: 820, r: 700 }]); g.restore(); });
// 16. "The whole house went quiet.": the house from outside, every window dark
K.stickShot('s16_quiet', (g, t) => { g.save(); K.camera(g, 1.0 + 0.03 * t, 540, 1000, 0, -120); K.outside(g, t, { litWindow: false }); K.darkness(g, 0.35, [{ x: 820, y: 360, r: 400 }]); g.restore(); });
// 17. "I waited for my brother to scream.": me in bed, eyes on the door, push in
K.stickShot('s17_wait', (g, t) => {
  const z = lerp(1.2, 1.9, ease.inOut(prog(t, 0, 2.6))); g.save(); K.camera(g, z, 254, 1310, 286, -420);
  myRoom(g, t, { face: { look: [1, 0], brows: 'worried' } }); K.darkness(g, 0.45, [{ x: 254, y: 1310, r: 400 }]); g.restore();
});
// 18. "He didn't.": his door at the end of the black hall
K.stickShot('s18_didnt', (g, t) => { g.save(); K.camera(g, 1.15 + 0.04 * t, 540, 980); hall(g, t, 0, { dark: 0.82 }); g.restore(); }, { vignette: 0.85 });
// 19. "I got up...": me out of bed, walking to my door
K.stickShot('s19_get_up', (g, t) => {
  g.save(); K.camera(g, 1.0, 540, 1000); const L = K.bedroom(g, t, { doorOpen: 0 }); K.bed(g, ...L.bed);
  const x = lerp(330, 760, ease.inOut(prog(t, 0.2, 2.2))); stickFigure(g, K.walk(t * 1.4), { eyes: 'dot', look: [1, 0], brows: 'worried' }, { x, y: 1500, s: 1.25, seed: 2101 });
  K.darkness(g, 0.6, [{ x: 330, y: 700, r: 600, k: 0.6 }, { x, y: 1300, r: 600, k: 0.5 }]); g.restore();
});
// 20. "My hand was on the doorknob": the arm reaches into frame
function knob(g, t, reach) {
  g.fillStyle = '#0b0d13'; g.fillRect(-60, -60, 1200, 2040); rect(g, 380, -80, 800, 2100, { w: 5, seed: 2201 });
  const kx = 600, ky = 900; circleLine(g, kx, ky, 46, { w: 5, seed: 2202 }); circleLine(g, kx, ky, 20, { w: 3, seed: 2203, a: 0.6 });
  const hx = lerp(-40, kx - 10, reach), hy = lerp(1300, ky + 10, reach);
  chalk(g, [[-80, 1400], [lerp(-60, 300, reach), lerp(1350, 1080, reach)], [hx, hy]], { w: 11, seed: 2204 });
  K.blob(g, hx, hy, 18, 16, INK.chalk, { seed: 2205 });
}
K.stickShot('s20_knob', (g, t) => { g.save(); K.camera(g, 1.05 + 0.04 * t, 600, 900); knob(g, t, ease.out(prog(t, 0, 0.9))); K.darkness(g, 0.45, [{ x: 600, y: 900, r: 600 }]); g.restore(); });
// 21. "from his room, he whispered": POV through my door crack
K.stickShot('s21_crack_pov', (g, t) => {
  g.save(); K.camera(g, 1.05 + 0.08 * ease.inOut(prog(t, 0, 1.8)), 540, 980); hall(g, t, 0, { dark: 0.82 }); g.restore();
  const half = 230 + 6 * Math.sin(t * 0.8); g.fillStyle = '#000'; g.fillRect(-60, -60, 540 - half + 60, 2040); g.fillRect(540 + half, -60, 600, 2040);
  line(g, 540 - half, -40, 540 - half, 1960, { w: 4, seed: 1701, a: 0.7 }); line(g, 540 + half, -40, 540 + half, 1960, { w: 3, seed: 1702, a: 0.4 });
});
// 22. "Don't. It turned it off": the gap under his door; two long narrow shapes slide in
K.stickShot('s22_under_door', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 1000); g.fillStyle = '#090a10'; g.fillRect(-60, -60, 1200, 2040);
  rect(g, 120, -100, 820, 1080, { w: 4, seed: 1801 }); rect(g, 180, 560, 700, 360, { w: 2.5, seed: 1802, a: 0.45 }); line(g, -60, 1000, 1140, 1000, { w: 3, seed: 1803, a: 0.7 });
  const gx0 = 124, gx1 = 936, gy = 978, gh = 22; g.fillStyle = K.alpha('#9a9a92', 0.22); g.fillRect(gx0, gy, gx1 - gx0, gh); K.lightPool(g, 540, gy + 10, 500, '#b9b6aa', 0.12);
  const k = ease.out(prog(t, 0.55, 1.4)); g.fillStyle = '#010102'; for (const [x0, w] of [[300, 120], [560, 130]]) g.fillRect(lerp(x0 - 520, x0, k), gy - 1, w, gh + 2);
  K.darkness(g, 0.5, [{ x: 540, y: 990, r: 600 }]); g.restore();
});
// 23. "so you'd come out.": my face, frozen in the crack
K.stickShot('s23_frozen', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.06 * t, 560, 760); g.fillStyle = '#000'; g.fillRect(-60, -60, 1200, 2040);
  stickHead(g, 600, 760, 230, { eyes: 'wide', brows: 'worried', mouth: 'o', look: [-0.4 + 0.08 * Math.sin(t * 9), 0] }, { neck: true, seed: 1901 });
  g.fillStyle = '#0c0d12'; g.fillRect(780, -60, 400, 2040); line(g, 780, -40, 780, 1960, { w: 5, seed: 1902 }); g.fillStyle = '#000'; g.fillRect(-60, -60, 300, 2040);
  K.darkness(g, 0.35, [{ x: 600, y: 700, r: 700 }]); g.restore();
});
// 24. "I let go of the doorknob.": the arm slides back out
K.stickShot('s24_let_go', (g, t) => { g.save(); K.camera(g, 1.12, 600, 900); knob(g, t, 1 - ease.inOut(prog(t, 0.6, 1.6))); K.darkness(g, 0.5, [{ x: 600, y: 900, r: 600 }]); g.restore(); });
// 25. "I got back in bed.": walking backwards to the bed
K.stickShot('s25_back_bed', (g, t) => {
  g.save(); K.camera(g, 1.0, 540, 1000); const L = K.bedroom(g, t, { doorOpen: 0.06 });
  if (t < 1.3) { K.bed(g, ...L.bed); stickFigure(g, K.walk(-t * 1.5), { eyes: 'wide', look: [1, 0], mouth: 'o' }, { x: lerp(760, 330, ease.inOut(prog(t, 0, 1.3))), y: 1500, s: 1.25, seed: 2001 }); }
  else meInBed(g, ...L.bed, {});
  K.darkness(g, 0.6, [{ x: 330, y: 700, r: 600, k: 0.6 }, { x: 600, y: 1300, r: 700, k: 0.5 }]); g.restore();
});
// 26. "I pulled the blanket over my head.": the blanket rises over me
K.stickShot('s26_blanket', (g, t) => {
  g.save(); K.camera(g, 1.6, 254, 1310, 286, -420); myRoom(g, t, { doorOpen: 0.06, face: { look: [1, 0], brows: 'worried' }, cover: ease.inOut(prog(t, 0.5, 1.4)) });
  K.darkness(g, 0.45, [{ x: 254, y: 1310, r: 400 }]); g.restore();
});
// 27. "And I lay there, listening to the quiet": wide, a lump in the bed, my door a crack of black
K.stickShot('s27_lump', (g, t) => { g.save(); K.camera(g, 1.0 + 0.02 * t, 540, 1000); myRoom(g, t, { doorOpen: 0.06, cover: 1 }); K.darkness(g, 0.55, [{ x: 330, y: 700, r: 600, k: 0.6 }]); g.restore(); });
// 28. "until morning.": the window turns grey
K.stickShot('s28_morning', (g, t, info) => {
  const s0 = info.shot.start, s1 = info.shot.end; g.save(); K.camera(g, 1.0 + 0.03 * t, 540, 1000);
  myRoom(g, t, { doorOpen: 0.06, cover: 1, moon: false, sky: grey(s0, s1) });
  K.lightPool(g, 320, 760, 700, '#c9c6bb', 0.4 * prog(K.K.now, s0, s1)); K.darkness(g, 0.55 - 0.2 * prog(K.K.now, s0, s1), [{ x: 320, y: 760, r: 700, k: 0.7 }]); g.restore();
});
// 29. "Then I remembered.": the blanket comes down, eyes open in grey light
K.stickShot('s29_remember', (g, t) => {
  g.save(); K.camera(g, 1.6 + 0.1 * t, 254, 1310, 286, -420); myRoom(g, t, { doorOpen: 0.06, moon: false, sky: '#4a4c52', face: { eyes: 'wide', look: [0, 0], brows: 'raised' }, cover: 1 - ease.inOut(prog(t, 0.0, 0.6)) });
  K.darkness(g, 0.3, [{ x: 254, y: 1310, r: 500 }]); g.restore();
});
// 30. held, silent: my door from the bed, a crack of black, grey morning
K.stickShot('s30_held', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.02 * t, 540, 900); g.fillStyle = '#14161c'; g.fillRect(-60, -60, 1200, 2040);
  line(g, -60, 1640, 1140, 1640, { w: 3, seed: 2101, a: 0.6 }); K.door(g, 330, 260, 420, 1380, { open: 0.1, seed: 2102 }); K.darkness(g, 0.4, [{ x: 540, y: 900, r: 800, k: 0.6 }]); g.restore();
}, { vignette: 0.85 });
// 31. reveal: the calendar on his door, "GRANDMA'S ->" across this week. Jitter + sting on "Grandma's".
K.stickShot('s31_calendar', (g, t, info) => {
  const s0 = info.shot.start, k = prog(K.K.now, s0 + 0.1, REVEAL), z = lerp(1.15, 2.35, ease.inOut(k));
  g.save(); K.camera(g, z, CAL[0] + CAL[2] / 2, CAL[1] + CAL[3] / 2 - 40, (540 - (CAL[0] + CAL[2] / 2)) * k, (760 - CAL[1] - CAL[3] / 2) * k);
  hisDoor(g, t, { lit: 0, arrow: 1 }); K.darkness(g, 0.4, [{ x: CAL[0] + CAL[2] / 2, y: CAL[1] + CAL[3] / 2, r: 600 }]); g.restore();
}, { jitter: [REVEAL], jitterAmp: 30 });
// 32. his room: the bed made, a toy on the pillow. Empty all week.
K.stickShot('s32_empty_bed', (g, t) => {
  g.save(); K.camera(g, 1.12 + 0.06 * t, 470, 1150, 0, -480);
  const L = K.roomBox(g, { back: [150, 520, 780, 930], seed: 2200 }); const [bx, by, bw, bh] = L.back;
  K.windowFrame(g, bx + 460, by + 110, 240, 280, { moon: false, sky: '#4a4c52', seed: 2210 });
  const x = bx + 60, y = by + bh - 20, w = 460; K.bed(g, x, y, w); chalk(g, [[x + w * 0.22, y - w * 0.28], [x + w, y - w * 0.28]], { w: 3, seed: 2220, a: 0.8 });
  const tx = x + w * 0.13, ty = y - w * 0.28 * 1.2; K.blob(g, tx, ty, 22, 20, '#d8d2c2', { seed: 2230 }); K.blob(g, tx - 14, ty - 22, 8, 12, '#d8d2c2', { seed: 2231 }); K.blob(g, tx + 14, ty - 22, 8, 12, '#d8d2c2', { seed: 2232 });
  g.fillStyle = INK.feature; g.beginPath(); g.arc(tx - 7, ty - 2, 3, 0, 7); g.arc(tx + 7, ty - 2, 3, 0, 7); g.fill();
  rect(g, bx + 640, by + bh - 150, 30, 40, { w: 2.5, seed: 2240, a: 0.7 });
  K.lightPool(g, bx + 580, by + 250, 600, '#c9c6bb', 0.2); K.darkness(g, 0.45, [{ x: bx + 580, y: by + 250, r: 650, k: 0.7 }, { x: x + w / 2, y: y - 140, r: 500, k: 0.5 }]); g.restore();
});
// 33. final: the dark hall, his door ajar, two warm dot-eyes in his doorway. Hard cut.
K.stickShot('s33_eyes', (g, t) => {
  g.save(); K.camera(g, 1.12 + 0.12 * ease.in(prog(t, 0, 1.6)), 540, 980); const L = K.hallway(g, t, { endOpen: 0.45 }); const [x, y, w, h] = L.endDoor;
  K.darkness(g, 0.8, [{ x: 540, y: 990, r: 480, k: 0.4 }]);
  K.eyesInDark(g, x + w * 0.22, y + h * 0.56, { gap: 16, size: 6, k: prog(t, 0.1, 0.45), blink: K.onFrames(63.3, 2) ? 1 : 0 }); g.restore();
}, { vignette: 0.85 });
K.stickShot('s34_end', (g, t) => K.endCard(g, t), { captions: false, fx: false });
