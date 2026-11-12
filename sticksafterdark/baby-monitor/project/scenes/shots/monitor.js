// Sticks After Dark #9 "Baby Monitor" (60-70 s cut). Accent: green baby-monitor glow.
// Sets the kit lacks (the monitor unit + close-up, our bed side view with a nightstand, the nursery with a crib,
// mobile and the dark ceiling corner) live here, not in the kit.
import * as K from '/kits/sticks/sticks.js';
const { INK, stickFigure, stickHead, chalk, rect, line, ellipse, circleLine, lerp, clamp, prog, ease, text } = K;

const GREEN = '#7dff9a';
K.setAccent(GREEN);
// global times (seconds) set from timeline/words.json
const HUM_AGAIN = 57.25;   // @HUM_AGAIN "And it just started humming again": the lights start again
const CRACKLE = 6.25;     // @CRACKLE "crackled on"

// ---------------------------------------------------------------- the monitor
// sound level 0..1 for the LED bar: humming = slow phrase-like swells + flutter
function humLevel(t, k = 1) {
  const ph = 0.5 + 0.5 * Math.sin(t * 2 * Math.PI / 1.86);           // one swell per hummed note pair
  const fl = 0.5 + 0.5 * K.noise(t * 6, 31);
  return clamp(k * (0.25 + 0.55 * ph + 0.25 * fl));
}
// small unit: body + antenna + speaker grille + 5 LEDs. level 0..1, on 0..1 (power LED)
function monitor(g, x, y, s = 1, level = 0, o = {}) {
  const { glow = 1, seed = 3000 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#101318'; g.beginPath(); g.roundRect(-70, -150, 140, 150, 26); g.fill();
  chalk(g, [[-70, -124], [-70, -26], [-44, 0], [44, 0], [70, -26], [70, -124], [44, -150], [-44, -150]], { w: 4, seed, closed: true });
  chalk(g, [[40, -150], [52, -230]], { w: 4, seed: seed + 1 }); circleLine(g, 52, -234, 7, { w: 3, seed: seed + 2, double: false });
  // speaker grille
  for (let i = 0; i < 4; i++) line(g, -40, -120 + i * 16, 40, -120 + i * 16, { w: 2.5, seed: seed + 3 + i, a: 0.6, double: false });
  // LEDs (bottom row), lit up to level
  const n = 5;
  for (let i = 0; i < n; i++) {
    const lx = -44 + i * 22, ly = -38, lit = level * n > i + 0.15;
    g.fillStyle = lit ? GREEN : '#1c2a20'; g.beginPath(); g.arc(lx, ly, 7, 0, Math.PI * 2); g.fill();
    if (lit && glow > 0) K.lightPool(g, lx, ly, 40, GREEN, 0.7 * glow);
  }
  // power dot
  g.fillStyle = K.alpha(GREEN, 0.8); g.beginPath(); g.arc(50, -132, 4, 0, Math.PI * 2); g.fill();
  g.restore();
  if (glow > 0) K.lightPool(g, x, y - 60 * s, 520 * s, GREEN, (0.25 + 0.55 * level) * glow);
}
// the monitor, big (close-up). Optional static noise + sound rings
function bigMonitor(g, t, level, o = {}) {
  const { stat = 0, rings = 0, z = 1 } = o;
  g.fillStyle = INK.bg; g.fillRect(-60, -60, 1200, 2040);
  // nightstand top
  line(g, -60, 1240, 1140, 1240, { w: 5, seed: 3101 }); g.fillStyle = '#0b0d12'; g.fillRect(-60, 1244, 1200, 800);
  monitor(g, 520, 1236, 3.6 * z, level, { seed: 3110 });
  if (stat > 0) { const r = K.rng(K.K.frame * 7 + 3); for (let i = 0; i < 70 * stat; i++) { g.fillStyle = K.alpha(r() < 0.5 ? GREEN : '#ffffff', 0.25 + 0.5 * r()); g.fillRect(380 + r() * 280, 700 + r() * 230, 4 + r() * 18, 3); } }
  if (rings > 0.01) for (let k = 0; k < 3; k++) {
    const R = 330 + k * 90 + ((K.K.now * 60) % 90), pts = []; for (let i = 0; i <= 30; i++) { const a = -0.42 * Math.PI + i / 30 * 0.84 * Math.PI; pts.push([520 + Math.cos(a - Math.PI / 2) * R * 0.0 + Math.sin(a) * R, 770 - Math.cos(a) * R * 0.55]); }
    chalk(g, pts, { w: 3, color: GREEN, a: rings * (0.55 - k * 0.15), seed: 3150 + k, double: false, step: 22 });
  }
}
// ---------------------------------------------------------------- our bedroom (side view)
// big bed seen from the side, heads on the pillow (wife back, kid middle, me front), nightstand + monitor + clock at the right
const NX = 650;   // nightstand left x (monitor stays left of the right 15% UI zone)
function ourBed(g, t, o = {}) {
  const { level = 0, me = { eyes: 'closed' }, wife = { eyes: 'closed' }, kid = null, clock = '3:00', monGlow = 1, sit = 0 } = o;
  g.fillStyle = INK.bg; g.fillRect(-60, -60, 1200, 2040);
  line(g, -60, 1520, 1140, 1520, { w: 3, seed: 3201, a: 0.6 }); g.fillStyle = '#0a0c12'; g.fillRect(-60, 1524, 1200, 600);
  K.windowFrame(g, 280, 470, 240, 280, { moon: false, sky: '#0a0e18', seed: 3205 });
  const bx = 90, by = 1500, bw = 520;
  chalk(g, [[bx, by], [bx, by - 470]], { w: 5, seed: 3210 }); chalk(g, [[bx + bw, by], [bx + bw, by - 240]], { w: 5, seed: 3211 });
  chalk(g, [[bx, by - 200], [bx + bw, by - 200]], { w: 4, seed: 3212 });
  ellipse(g, bx + 105, by - 236, 80, 28, { w: 3, seed: 3213, a: 0.8 });
  // blanket first, heads on top
  g.fillStyle = '#0e1118'; g.beginPath(); g.moveTo(bx + 175, by - 262); g.quadraticCurveTo(bx + 310, by - 360, bx + 420, by - 290); g.quadraticCurveTo(bx + 480, by - 260, bx + bw, by - 255); g.lineTo(bx + bw, by - 200); g.lineTo(bx + 175, by - 200); g.closePath(); g.fill();
  chalk(g, [[bx + 175, by - 262], [bx + 310, by - 330], [bx + 420, by - 290], [bx + bw, by - 255]], { w: 4, seed: 3250 });
  stickHead(g, bx + 95, by - 318, 50, wife, { neck: false, seed: 3220, tilt: -0.25 });
  if (kid) stickHead(g, bx + 175, by - 300, 36, kid, { neck: false, seed: 3240, tilt: -0.15 });
  const mx = bx + (kid ? 215 : 140) + sit * 40, my = by - 262 - sit * 150;
  if (sit > 0) chalk(g, [[mx + 10, my + 56], [mx + 110, by - 250]], { w: 6, seed: 3235 });
  stickHead(g, mx, my, 56, me, { neck: false, seed: 3230, tilt: -0.3 + sit * 0.3 });
  // nightstand
  const nx = NX, ny = 1520; rect(g, nx, ny - 250, 190, 250, { w: 4, seed: 3260 }); line(g, nx + 10, ny - 125, nx + 180, ny - 125, { w: 2.5, seed: 3261, a: 0.6 });
  monitor(g, nx + 70, ny - 252, 0.85, level, { seed: 3270, glow: monGlow });
  g.fillStyle = '#0a0a0d'; g.fillRect(nx + 122, ny - 290, 62, 36); rect(g, nx + 122, ny - 290, 62, 36, { w: 2.5, seed: 3280, double: false });
  text(g, clock, nx + 153, ny - 271, { size: 21, font: 'Nunito', weight: 900, color: GREEN });
  return { bx, by, bw, me: [mx, my], mon: [nx + 70, ny - 310], clock: [nx + 153, ny - 272] };
}
// ---------------------------------------------------------------- the nursery
const NB = [140, 470, 800, 1000];   // back wall
function crib(g, x, y, w, h, o = {}) {
  const { seed = 3300, front = true } = o;
  rect(g, x, y - h, w, h, { w: 4, seed });
  line(g, x, y - h * 0.18, x + w, y - h * 0.18, { w: 3, seed: seed + 1 });
  if (front) for (let i = 1; i < 11; i++) line(g, x + i * w / 11, y - h, x + i * w / 11, y - h * 0.18, { w: 2.5, seed: seed + 2 + i, a: 0.75, double: false });
  line(g, x + 6, y, x + 6, y + 50, { w: 4, seed: seed + 20 }); line(g, x + w - 6, y, x + w - 6, y + 50, { w: 4, seed: seed + 21 });
}
// a hanging mobile: string from the ceiling, a bar, stars + a moon. rock = swing angle. returns the bar centre
function mobile(g, x, y, len, rock = 0) {
  const ax = x + Math.sin(rock) * len, ay = y + Math.cos(rock) * len;
  chalk(g, [[x, y], [ax, ay]], { w: 2.5, seed: 3400, double: false });
  g.save(); g.translate(ax, ay); g.rotate(rock * 0.5);
  line(g, -120, 0, 120, 0, { w: 3, seed: 3401, double: false });
  for (const [dx, l, kind] of [[-110, 70, 0], [0, 115, 1], [110, 60, 0]]) {
    chalk(g, [[dx, 0], [dx, l]], { w: 2, seed: 3402 + dx, double: false });
    if (kind) ellipse(g, dx, l + 20, 20, 20, { w: 3, seed: 3410, from: 0.6, to: 5.2, double: false });
    else { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 8 : 19; pts.push([dx + Math.cos(a) * rr, l + 19 + Math.sin(a) * rr]); } chalk(g, pts, { w: 2.5, seed: 3420 + dx, closed: true, double: false }); }
  }
  g.restore(); return [ax, ay];
}
function latchWindow(g, x, y, w, h, o = {}) {
  K.windowFrame(g, x, y, w, h, { moon: o.moon ?? true, sky: '#0a0e1a', seed: 3500 });
  g.fillStyle = '#1a1d24'; g.fillRect(x + w / 2 - 24, y + h / 2 - 18, 48, 36);
  rect(g, x + w / 2 - 24, y + h / 2 - 18, 48, 36, { w: 3.5, seed: 3501, double: false });
  chalk(g, [[x + w / 2, y + h / 2 + 4], [x + w / 2 + 44, y + h / 2 + 4]], { w: 6, seed: 3502, double: false });
  circleLine(g, x + w / 2, y + h / 2 + 4, 6, { w: 3, seed: 3503, double: false });
}
// the ceiling corner (top-right of the back wall, where the two walls and the ceiling meet): pure black
const CORNER = [NB[0] + NB[2], NB[1]];
function cornerDark(g, k = 1, r = 330) {
  const [cx, cy] = CORNER; g.save(); g.globalAlpha *= clamp(k);
  const gr = g.createRadialGradient(cx + 30, cy - 60, 10, cx + 30, cy - 60, r);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.97)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(cx - r - 40, cy - r - 80, 2 * r + 120, 2 * r + 120); g.restore();
}
// something long folded into the corner: barely there
function folded(g, k = 0.5) {
  const [cx, cy] = CORNER; if (k <= 0) return;
  chalk(g, [[cx + 60, cy - 220], [cx - 20, cy - 90], [cx - 70, cy + 40], [cx - 40, cy + 170]], { w: 5, color: INK.dim, a: 0.3 * k, seed: 3600, double: false, step: 40 });
  chalk(g, [[cx + 100, cy - 190], [cx + 20, cy - 60], [cx - 10, cy + 80]], { w: 4, color: INK.dim, a: 0.22 * k, seed: 3601, double: false, step: 40 });
}
const CRIB = [NB[0] + 300, NB[1] + NB[3] - 10, 440, 300];
const MOB = [CRIB[0] + CRIB[2] / 2, 300, 640];   // ceiling hook x, y, string length
function nursery(g, t, o = {}) {
  const { empty = false, kid = null, rock = Math.sin(K.K.now * 0.9) * 0.03, corner = 1 } = o;
  const L = K.roomBox(g, { back: NB, seed: 3700, wall: '#141926' });
  const [bx, by, bw, bh] = NB;
  latchWindow(g, bx + 50, by + 120, 230, 280, { moon: true });
  K.lightPool(g, bx + 260, by + 420, 820, '#9fb0d0', 0.16);   // moonlight on the back wall: lets the black corner read
  const [cx, cy, cw, ch] = CRIB; crib(g, cx, cy, cw, ch, { front: false });
  let R = null;
  if (!empty && kid) R = stickFigure(g, kid.pose || 'sit', kid.face || { eyes: 'wide' }, { x: cx + cw / 2, y: cy - ch * 0.18 - 8, s: 0.85, seed: 3710 });
  if (empty) ellipse(g, cx + 90, cy - ch * 0.18 - 18, 52, 16, { w: 2.5, seed: 3720, a: 0.7 });
  crib(g, cx, cy, cw, ch, { seed: 3330 });   // front rails over her legs
  const bar = mobile(g, MOB[0], MOB[1], MOB[2], rock);
  ellipse(g, bx + 160, by + bh + 170, 170, 36, { w: 2.5, seed: 3730, a: 0.4 });
  if (corner) cornerDark(g, corner);
  return { ...L, crib: CRIB, kid: R, bar };
}
const kidSit = (look = [0, 0], extra = {}) => ({ pose: 'sit', face: { eyes: 'wide', look, mouth: 'none', ...extra } });
const pointUp = (k) => K.posesMix('sit', { ...K.POSES.sit, aR: [2.45, 0.05] }, k);
const night = (g, amt, lights) => K.darkness(g, amt, lights);

// ---------------------------------------------------------------- shots
// bed framing: heads (≈ y 1240) lifted to ≈ y 880, the nightstand/monitor in frame, floor under the caption line
const bedCam = (g, z, fx, fy, dx, dy) => K.camera(g, z, fx, fy, dx, dy);
// 1. frame 1: the monitor on the nightstand, LEDs bouncing, green glow on two sleeping figures
K.stickShot('s01_monitor_bed', (g, t) => {
  g.save(); bedCam(g, 1.4 + 0.03 * t, 440, 1250, 60, -360); const L = ourBed(g, t, { level: humLevel(K.K.now, 0.8) });
  night(g, 0.45, [{ x: L.mon[0], y: L.mon[1], r: 800 }]); g.restore();
});
// 2. "when she turned two": her nursery, her asleep in the crib, the camera unit on the shelf
K.stickShot('s02_nursery_intro', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.03 * t, 600, 1000, 0, -200); nursery(g, t, { kid: { pose: K.posesMix('sit', 'slump', 0.6), face: { eyes: 'closed', mouth: 'smile' } }, corner: 0.5 });
  monitor(g, 250, 1450, 0.8, 0.0, { seed: 3800, glow: 0.5 }); night(g, 0.45, [{ x: 660, y: 1150, r: 750 }]); g.restore();
});
// 3. "Last night, around three": the clock 3:00 next to the monitor (lights dark)
K.stickShot('s03_clock', (g, t) => {
  const z = lerp(2.0, 2.6, ease.inOut(prog(t, 0, 2.2))); g.save(); K.camera(g, z, NX + 120, 1240, 420 - NX - 120 + 120, -320);
  ourBed(g, t, { level: 0, monGlow: 0.35 }); night(g, 0.5, [{ x: NX + 120, y: 1240, r: 420 }]); g.restore();
});
// 4. "it crackled on": the monitor close-up, static, LEDs jump
K.stickShot('s04_crackle', (g, t) => {
  const on = K.K.now >= CRACKLE ? 1 : 0, k = prog(K.K.now, CRACKLE, CRACKLE + 1.4);
  g.save(); K.camera(g, 1.05 + 0.03 * t, 520, 900, ...K.drift(6), -120);
  bigMonitor(g, t, on ? clamp(0.3 + K.noise(K.K.now * 14, 5) * 0.9) : 0, { stat: on * (1 - k) }); night(g, 0.35, [{ x: 520, y: 900, r: 700 }]); g.restore();
}, { jitter: [] });
// 5. "Someone was humming.": sound rings from the speaker
K.stickShot('s05_humming', (g, t) => { g.save(); K.camera(g, 1.0 + 0.04 * t, 520, 820, 0, -80); bigMonitor(g, t, humLevel(K.K.now), { rings: 1 }); night(g, 0.35, [{ x: 520, y: 900, r: 700 }]); g.restore(); });
// 6. "Soft. Slow.": the LED bar, close, rising and falling
K.stickShot('s06_leds', (g, t) => { g.save(); K.camera(g, 1.55 + 0.05 * t, 520, 1100, 0, -260); bigMonitor(g, t, humLevel(K.K.now)); night(g, 0.3, [{ x: 520, y: 1100, r: 500 }]); g.restore(); });
// 7. "A lullaby.": wide on the bed, green glow, sound rings drifting over the sleepers
K.stickShot('s07_lullaby', (g, t) => {
  g.save(); K.camera(g, 1.35, 440, 1250, 60, -340); const L = ourBed(g, t, { level: humLevel(K.K.now), me: { eyes: t > 1.0 ? 'half' : 'closed' } });
  for (let k = 0; k < 3; k++) { const R = 140 + k * 90 + ((K.K.now * 50) % 90); ellipse(g, L.mon[0], L.mon[1], R, R * 0.7, { w: 2.5, color: GREEN, a: 0.4 - k * 0.1, seed: 3900 + k, from: Math.PI * 0.9, to: Math.PI * 1.6, double: false }); }
  night(g, 0.45, [{ x: L.mon[0], y: L.mon[1], r: 800 }]); g.restore();
});
// 8. "I shook my wife awake.": I sit up and shake her (heads jiggle)
K.stickShot('s08_shake', (g, t) => {
  const j = Math.sin(t * 24) * 7 * (t > 0.3 && t < 1.5 ? 1 : 0); g.save(); K.camera(g, 1.75, 200, 1220, 340 + j, -330);
  ourBed(g, t, { level: humLevel(K.K.now), sit: ease.out(prog(t, 0, 0.35)), me: { eyes: 'wide', brows: 'worried', look: [-1, 0.3] }, wife: { eyes: t > 1.3 ? 'dot' : 'closed', look: [0.6, 0] } });
  night(g, 0.4, [{ x: 200, y: 1200, r: 600 }]); g.restore();
});
// 9. "She heard it too.": both heads turn to the monitor, eyes wide
K.stickShot('s09_heard', (g, t) => {
  g.save(); K.camera(g, 1.45 + 0.03 * t, 420, 1250, 60, -360);
  ourBed(g, t, { level: humLevel(K.K.now), sit: 1, me: { eyes: 'wide', brows: 'worried', look: [1, 0] }, wife: { eyes: 'wide', brows: 'worried', look: [1, -0.3] } });
  night(g, 0.42, [{ x: 600, y: 1200, r: 800 }]); g.restore();
});
// 10. "We ran down the hall": two figures run into the dark hall, toward her door (faint green under it)
K.stickShot('s10_hall_run', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.06 * t, 540, 1000, 0, -120); const L = K.hallway(g, t, { endOpen: 0 });
  g.fillStyle = K.alpha(GREEN, 0.7); g.fillRect(452, 1213, 176, 6); K.lightPool(g, 540, 1216, 160, GREEN, 0.35);
  const k = ease.inOut(prog(t, 0, 2.4));
  stickFigure(g, K.walk(t * 2.6, { stride: 0.55 }), {}, { x: lerp(430, 520, k), y: lerp(1950, 1250, k), s: lerp(1.6, 0.7, k), back: true, seed: 4001 });
  stickFigure(g, K.walk(t * 2.6 + 0.4, { stride: 0.55 }), {}, { x: lerp(680, 575, k), y: lerp(2020, 1290, k), s: lerp(1.7, 0.75, k), back: true, seed: 4011 });
  K.darkness(g, 0.65, [{ x: 540, y: 1000, r: 420, k: 0.6 }]); g.restore();
});
// 11. "and opened the door.": her door swings open onto dark
K.stickShot('s11_door', (g, t) => {
  const op = ease.out(prog(t, 0.15, 0.9)); g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 900, 0, -60);
  g.fillStyle = '#0b0d13'; g.fillRect(-60, -60, 1200, 2040); line(g, -60, 1460, 1140, 1460, { w: 3, seed: 4101, a: 0.6 });
  g.fillStyle = '#020403'; g.fillRect(300, 300, 480 * op, 1160); K.lightPool(g, 300 + 240 * op, 900, 420 * op, GREEN, 0.18 * op);
  K.door(g, 300, 300, 480, 1160, { open: op * 0.9, seed: 4102 }); rect(g, 270, 270, 540, 1190, { w: 5, seed: 4103 });
  K.darkness(g, 0.5, [{ x: 540, y: 900, r: 700 }]); g.restore();
});
// 12. "Our daughter was sitting up in her crib.": the nursery, her small figure sitting up
K.stickShot('s12_crib', (g, t) => {
  g.save(); K.camera(g, 1.5 + 0.05 * t, 640, 1250, -100, -380); nursery(g, t, { kid: kidSit([0.2, 0]), corner: 0.7 });
  monitor(g, 250, 1450, 0.8, 0.0, { seed: 3800, glow: 0.4 }); night(g, 0.45, [{ x: 590, y: 1200, r: 650 }]); g.restore();
});
// her face, close (wide dot-eyes, calm), crib rails in front
function kidFace(g, t, f, tilt = 0) {
  g.fillStyle = INK.bg; g.fillRect(-60, -60, 1200, 2040);
  stickHead(g, 540, 700, 220, f, { neck: true, seed: 4210, tilt });
  g.fillStyle = INK.bg; g.fillRect(-60, 1080, 1200, 900); line(g, -60, 1080, 1140, 1080, { w: 6, seed: 4220 });
  for (let i = 0; i < 7; i++) line(g, 60 + i * 160, 1080, 60 + i * 160, 1900, { w: 6, seed: 4200 + i, a: 0.8 });
}
// 13. "Wide awake.": her face close
K.stickShot('s13_wide', (g, t) => { g.save(); K.camera(g, 1.0 + 0.04 * t, 540, 700); kidFace(g, t, { eyes: 'wide', look: [0, 0], mouth: 'none' }); K.lightPool(g, 900, 300, 600, GREEN, 0.12); night(g, 0.35, [{ x: 540, y: 700, r: 700 }]); g.restore(); });
// 14. "Nobody else in the room.": slow pan across the dark room
K.stickShot('s14_nobody', (g, t) => {
  g.save(); K.camera(g, 1.3, 540, 1000, lerp(170, -170, ease.inOut(prog(t, 0, 2.2))), -150); nursery(g, t, { kid: kidSit([1, 0]), corner: 0.8 });
  night(g, 0.5, [{ x: 540, y: 1000, r: 900, k: 0.5 }]); g.restore();
});
// 15. "The window locked.": the latch, close
K.stickShot('s15_window', (g, t) => {
  const wx = NB[0] + 165, wy = NB[1] + 260; g.save(); K.camera(g, 2.7 - 0.12 * t, wx, wy, 540 - wx, 760 - wy); nursery(g, t, { kid: kidSit(), corner: 0 }); night(g, 0.3, [{ x: wx, y: wy, r: 420 }]); g.restore();
});
// 16. "Who was singing to you? I asked.": me crouched at the crib, her looking at me
K.stickShot('s16_ask', (g, t) => {
  g.save(); K.camera(g, 1.5, 560, 1300, 0, -400); nursery(g, t, { kid: kidSit([-1, 0]), corner: 0.6 });
  stickFigure(g, 'crouch', { eyes: 'dot', look: [1, 0], brows: 'worried', mouth: 'o' }, { x: 330, y: 1530, s: 1.15, seed: 4300 });
  night(g, 0.45, [{ x: 560, y: 1300, r: 650 }]); g.restore();
});
// 17. "She pointed at the corner of the ceiling.": her arm rises; the camera follows it up to the corner
K.stickShot('s17_point', (g, t) => {
  const k = ease.inOut(prog(t, 0.2, 1.0)), u = ease.inOut(prog(t, 0.9, 2.6));
  g.save(); K.camera(g, lerp(1.9, 1.15, u), 660, lerp(1250, 800, u), -120 * (1 - u), lerp(-420, 0, u));
  nursery(g, t, { kid: { pose: pointUp(k), face: { eyes: 'wide', look: [0.8, -1], mouth: 'none' } } });
  night(g, 0.45, [{ x: 700, y: 1000, r: 800 }]); g.restore();
});
// the corner, framed: wall + ceiling lines run into pure black
function cornerShot(g, t, z, hint) {
  g.save(); K.camera(g, z, CORNER[0], CORNER[1], 520 - CORNER[0], 760 - CORNER[1]); nursery(g, t, { kid: kidSit(), corner: 0 }); cornerDark(g, 1, 300);
  folded(g, hint); night(g, 0.25, [{ x: CORNER[0] - 200, y: CORNER[1] + 300, r: 600 }]); g.restore();
}
// 18. the corner, pure black, held (slow creep in)
K.stickShot('s18_corner', (g, t) => cornerShot(g, t, 1.5 + 0.06 * t, 0), { vignette: 0.85 });
// 19. [CHILD] "The tall lady.": her face, calm, looking up-right
K.stickShot('s19_lady', (g, t) => { g.save(); K.camera(g, 1.0 + 0.03 * t, 540, 700); kidFace(g, t, { eyes: 'dot', look: [0.9, -1], mouth: 'flat' }, -0.08); night(g, 0.35, [{ x: 540, y: 700, r: 700 }]); g.restore(); });
// 20. "She stopped when you came.": the corner again; just the hint of something long folded into it
K.stickShot('s20_folded', (g, t) => cornerShot(g, t, 1.7 + 0.06 * t, ease.inOut(prog(t, 0.4, 2.0))), { vignette: 0.85 });
// 21. "We brought her to sleep in our bed.": three heads, the child safe between us
K.stickShot('s21_three', (g, t) => {
  g.save(); K.camera(g, 1.65 - 0.04 * t, 250, 1220, 290, -330);
  ourBed(g, t, { level: 0, kid: { eyes: 'closed', mouth: 'smile' }, me: { eyes: 'closed' }, wife: { eyes: 'closed' }, clock: '3:20', monGlow: 0.6 });
  night(g, 0.45, [{ x: 190, y: 1220, r: 600 }]); g.restore();
});
// 22. "It's quiet now.": wide, the room still, the monitor lights off
K.stickShot('s22_quiet', (g, t) => {
  g.save(); K.camera(g, 1.35, 440, 1250, 60, -340); ourBed(g, t, { level: 0, kid: { eyes: 'closed' }, me: { eyes: 'half' }, wife: { eyes: 'closed' }, clock: '3:40', monGlow: 0.5 });
  night(g, 0.55, [{ x: 400, y: 1200, r: 800 }]); g.restore();
});
function onBlink(t) { const p = (t % 2.6); return p > 2.4 ? Math.sin((p - 2.4) / 0.2 * Math.PI) : 0; }
// 23. "Everyone's asleep but me.": push in on my open eyes
K.stickShot('s23_me', (g, t) => {
  const z = lerp(1.7, 2.6, ease.inOut(prog(t, 0, 3))); g.save(); K.camera(g, z, 305, 1238, 235, -400);
  ourBed(g, t, { level: 0, kid: { eyes: 'closed' }, me: { eyes: 'dot', look: [1, -0.2], blink: onBlink(t) }, wife: { eyes: 'closed' }, clock: '3:40', monGlow: 0.5 });
  night(g, 0.45, [{ x: 230, y: 1238, r: 420 }]); g.restore();
});
// 24. "The monitor is still on the nightstand.": close on the monitor, green lights flat
K.stickShot('s24_flat', (g, t) => { g.save(); K.camera(g, 1.0 + 0.03 * t, 520, 900, 0, -120); bigMonitor(g, t, 0); night(g, 0.4, [{ x: 520, y: 900, r: 700 }]); g.restore(); });
// 25. "Her room is empty.": the empty nursery, the empty crib, the corner dark
K.stickShot('s25_empty', (g, t) => { g.save(); K.camera(g, 1.05 + 0.04 * t, 620, 1000, 0, -200); nursery(g, t, { empty: true, corner: 1, rock: 0 }); night(g, 0.5, [{ x: 660, y: 1150, r: 700 }]); g.restore(); });
// 26a. held silent frame (2.4 s): the monitor, lights flat, a very slow push
K.stickShot('s26_held', (g, t) => { g.save(); K.camera(g, 1.0 + 0.03 * t, 520, 1000, 0, -150); bigMonitor(g, t, 0); night(g, 0.42, [{ x: 520, y: 950, r: 700 }]); g.restore(); });
// 26b. "And it just started humming again.": closer; the lights start bouncing
K.stickShot('s26_again', (g, t) => {
  const on = K.K.now >= HUM_AGAIN ? ease.out(prog(K.K.now, HUM_AGAIN, HUM_AGAIN + 0.8)) : 0;
  g.save(); K.camera(g, 1.25 + 0.05 * t, 520, 1000, 0, -200); bigMonitor(g, t, on * humLevel(K.K.now), { rings: on * 0.7 }); night(g, 0.4, [{ x: 520, y: 950, r: 700 }]); g.restore();
});
// 20b. carrying her back down the dark hall (she holds on, safe)
K.stickShot('s20b_carry', (g, t) => {
  g.save(); K.camera(g, 1.1 - 0.04 * t, 540, 1000, 0, -150); K.hallway(g, t, { endOpen: 0.15 });
  const k = ease.inOut(prog(t, 0, 1.4)), s = lerp(1.15, 1.6, k), x = lerp(560, 520, k), y = lerp(1450, 1720, k);
  const R = stickFigure(g, { ...K.walk(t * 1.6), aL: [-0.5, -2.0], aR: [0.5, 2.0] }, { eyes: 'dot', brows: 'worried', mouth: 'flat' }, { x, y, s, seed: 4501 });
  stickHead(g, R.sh[0] + 40 * s, R.sh[1] - 20 * s, 26 * s, { eyes: 'closed', mouth: 'none' }, { neck: false, seed: 4510, tilt: 0.3 });
  K.darkness(g, 0.6, [{ x, y: y - 300 * s, r: 520 }]); g.restore();
});
// 23b. beat: the dark hall, her door at the end, closed; a faint green line under it? no: nothing (she's with us)
K.stickShot('s23b_hall_dark', (g, t) => {
  g.save(); K.camera(g, 1.2 + 0.05 * t, 540, 980, 0, -120); K.hallway(g, t, { endOpen: 0 });
  K.darkness(g, 0.8, [{ x: 540, y: 980, r: 380, k: 0.5 }]); g.restore();
}, { vignette: 0.88 });
// 27. final: the empty crib; a long stick arm reaches down out of the black ceiling corner and rocks the mobile (never the face)
K.stickShot('s27_arm', (g, t) => {
  const k = ease.out(prog(t, 0, 0.45)), rock = Math.sin(Math.max(0, t - 0.4) * 2.6) * 0.07 * prog(t, 0.4, 0.9);
  g.save(); K.camera(g, 1.0 + 0.025 * t, 660, 900, -100, -40);
  const L = nursery(g, t, { empty: true, corner: 0, rock });
  const [bxx, byy] = L.bar, rot = rock * 0.5, grip = [bxx + Math.cos(rot) * 112, byy + Math.sin(rot) * 112];
  const sh = [CORNER[0] + 30, CORNER[1] - 70];
  const elbowF = [CORNER[0] - 40, CORNER[1] + 400];
  const elbow = [lerp(sh[0], elbowF[0], k), lerp(sh[1], elbowF[1], k)];
  const hand = [lerp(elbow[0], grip[0], k), lerp(elbow[1], grip[1] - 10, k)];
  cornerDark(g, 1, 380);
  const arm = (col, w, seed) => { chalk(g, [sh, elbow], { w, color: col, seed, double: false, step: 44 }); chalk(g, [elbow, hand], { w: w * 0.9, color: col, seed: seed + 1, double: false, step: 44 }); };
  arm('rgba(0,0,0,0.9)', 22, 4390); arm('#d6d1c3', 9, 4400);
  if (k > 0.9) K.handOnFrame(g, hand[0] - 2, hand[1] - 4, { side: 'right', len: 40, gap: 12, curl: 1, fingers: 3, seed: 4410, color: '#d6d1c3' });
  cornerDark(g, 0.85, 200);
  night(g, 0.38, [{ x: MOB[0], y: 950, r: 700 }]); K.lightPool(g, MOB[0], 1000, 320, GREEN, 0.12); g.restore();
}, { vignette: 0.85 });
// 28. end card
K.stickShot('s28_end', (g, t) => K.endCard(g, t), { captions: false, fx: false });
