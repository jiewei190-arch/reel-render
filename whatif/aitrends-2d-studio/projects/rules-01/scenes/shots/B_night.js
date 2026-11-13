// B_night.js — THE RULES #1, batch B (s011-s020, 25.17-46.94 s): Rule 3 inks on, the baby monitor switched on, "All night" with Biscuit
// staring toward the stairs, the clock at 11:10, "Something knocks", the three low knocks, "You don't move", 11:40, the hallway light goes off
// (wait in the dark) and comes back on by itself. Vertical 1080x1920: faces/text above y 1440 and left of x 900.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, ring, poly, text, FONTS, rng, noise, shade } from '/engine/core.js';
import { POSES, headPos } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { HERO } from '../cast.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { house, houseFg, knockAt, flick } from '../sets/house.js';
import { note, babyMonitor, scrawl, grain, vignette, coldGrade, breathe, motes } from '../sets/horror.js';

const HS = 2.4, MOON = { color: '#9fc0ff', dir: [0.8, -0.5] };
const HOOD = { ...HERO, head: 'hood', headColor: HERO.color };
const PALE = '#e4dccb';
// the horror finish on every shot: cold grade, vignette, slow breathing darkness, film grain
const finish = (g, t, o = {}) => { coldGrade(g, o.cold ?? 0.45); vignette(g, o.vig ?? 0.8); breathe(g, t, o.breathe ?? 0.3); grain(g, t, 0.08); };
// a pale-ink time chip (horror palette, not gold)
const inkChip = (g, t, at, str, x, y) => { const k = prog(t, at, at + 0.35); if (k <= 0) return; g.save(); g.globalAlpha *= ease.out(k); rr(g, x - 20, y - 56, 250, 92, 16); g.fillStyle = 'rgba(6,8,14,.72)'; g.fill(); scrawl(g, str, x, y, { size: 64, color: PALE, k: ease.out(k), seed: 9, align: 'left' }); g.restore(); };
// a simple table edge on the character plane (kitchen)
const table = (g, x, y, w) => { rr(g, x - w / 2, y, w, 34, 10); g.fillStyle = '#3a2c28'; g.fill(); g.fillStyle = '#4a3a34'; g.fillRect(x - w / 2, y, w, 8); seg(g, [[x - w / 2 + 40, y + 30], [x - w / 2 + 50, y + 420]], 18, '#2a201c'); seg(g, [[x + w / 2 - 40, y + 30], [x + w / 2 - 50, y + 420]], 18, '#2a201c'); };

// ---------- the kitchen wall clock, close (s014 / s018) ----------
function wallClock(g, t, cx, cy, R, o) {
  const [hh, mm] = o.time, sec = o.sec ?? 0, ink = '#141018';
  circle(g, cx + 10, cy + 16, R * 1.08, 'rgba(0,0,0,.45)');
  circle(g, cx, cy, R * 1.08, '#3a3038'); circle(g, cx, cy, R, '#d8d2c4');
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, big = i % 5 === 0, r0 = R * (big ? 0.8 : 0.88); seg(g, [[cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * R * 0.94, cy - Math.cos(a) * R * 0.94]], big ? R * 0.03 : R * 0.012, ink); }
  for (let n = 1; n <= 12; n++) { const a = n / 12 * Math.PI * 2; text(g, String(n), cx + Math.sin(a) * R * 0.68, cy - Math.cos(a) * R * 0.68, { size: R * 0.15, color: ink, font: FONTS.serif, weight: 900 }); }
  const ma = (mm / 60) * Math.PI * 2, ha = ((hh % 12) / 12 + mm / 720) * Math.PI * 2, sa = (sec / 60) * Math.PI * 2;
  seg(g, [[cx, cy], [cx + Math.sin(ha) * R * 0.5, cy - Math.cos(ha) * R * 0.5]], R * 0.06, ink);
  seg(g, [[cx, cy], [cx + Math.sin(ma) * R * 0.78, cy - Math.cos(ma) * R * 0.78]], R * 0.04, ink);
  seg(g, [[cx - Math.sin(sa) * R * 0.15, cy + Math.cos(sa) * R * 0.15], [cx + Math.sin(sa) * R * 0.86, cy - Math.cos(sa) * R * 0.86]], R * 0.012, '#8a1a1a');
  circle(g, cx, cy, R * 0.05, ink);
  // glass: moon streak + (optional) a reflection of the hallway with a darker shape on the landing
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
  if (o.reflect) { g.fillStyle = alpha('#203048', 0.18); g.fillRect(cx - R * 0.2, cy - R * 0.9, R * 0.9, R * 1.6); seg(g, [[cx - R * 0.1, cy + R * 0.6], [cx + R * 0.5, cy - R * 0.6]], R * 0.03, alpha('#203048', 0.25)); if (o.shape > 0) { g.fillStyle = alpha('#05060a', 0.28 * o.shape); g.beginPath(); g.ellipse(cx + R * 0.42, cy - R * 0.6, R * 0.06, R * 0.14, 0, 0, 7); g.fill(); circle(g, cx + R * 0.42, cy - R * 0.78, R * 0.05, alpha('#05060a', 0.28 * o.shape)); } }
  g.fillStyle = 'rgba(190,210,255,.14)'; g.beginPath(); g.moveTo(cx - R, cy - R * 0.2); g.lineTo(cx - R * 0.2, cy - R); g.lineTo(cx + R * 0.1, cy - R); g.lineTo(cx - R, cy + R * 0.1); g.closePath(); g.fill();
  if (o.green) glow(g, cx + R * 0.3, cy + R * 0.5, R * 0.12, '#5fe08a', 0.6);
  g.restore();
}

// s011 — RULE 3 (fast): "Rule three."  the note on the kitchen table under the monitor's green glow; rule 3 inks on; her fingertip traces it; a ghost of the back pressed through
registerShot('s011', { draw(g, t, info) {
  const z = lerp(1.12, 1.16, ease.inOut(t / info.dur)), U = S().ui;
  g.save(); g.translate(E.W / 2, E.H * 0.4); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.4);
  g.fillStyle = '#1e1714'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let i = 0; i < 14; i++) seg(g, [[-E.W, 140 + i * 150], [E.W * 2, 120 + i * 150]], 3, alpha('#2c221d', 0.9));   // table grain
  glow(g, E.W * 0.9, E.H * 0.12, 600, '#5fe08a', 0.18);
  const nx = E.W * 0.45, ny = E.H * 0.36, N = note(g, nx, ny, 0.95, { t, rules: 2 + clamp(prog(t, 0.45, 1.3)), rot: -0.04 });
  // ghost of the back: mirror-image writing pressed through, faint
  g.save(); g.translate(nx, ny + 260); g.rotate(-0.04); g.scale(-1, 1); g.globalAlpha *= 0.09; scrawl(g, 'There are no kids', -300, 0, { size: 56, color: '#2a2630', k: 1, seed: 4, align: 'left' }); g.restore();
  // fingertip tracing rule 3 (grey cuff)
  const L = N.lines?.[2] || [nx - 250, ny + 140], fx = L[0] + lerp(0, 520, ease.inOut(prog(t, 0.5, 1.4)));
  g.save(); g.translate(fx, L[1] + 34); g.rotate(-0.25); rr(g, -16, -10, 32, 80, 16); g.fillStyle = '#1a1418'; g.fill(); rr(g, -46, 60, 92, 110, 34); g.fill(); rr(g, -58, 150, 116, 900, 40); g.fillStyle = HERO.color; g.fill(); seg(g, [[-58, 170], [58, 170]], 6, shade(HERO.color, -0.3)); g.restore();
  g.restore();
  finish(g, t);
} });

// s012 — THE BABY MONITOR: "Keep the baby monitor on."  her hand clicks it on; LEDs flicker once; static breath; then the first LED keeps twitching
registerShot('s012', { draw(g, t, info) {
  const tOn = 1.12, cam = camMove(t, info.dur, { z: [1.5, 1.58], x: [-260, -240], y: [-120, -130], drift: 0.4 });
  blurLayer(g, 8, (g) => house(g, t, cam, { room: 'kitchen', clock: '11:02', lights: { lamp: 0.8 }, monitor: false }), null, 1); veil(g, '#03050c', 0.35);
  const z = lerp(1.0, 1.08, ease.inOut(t / info.dur)); g.save(); g.translate(470, 820); g.scale(z, z); g.translate(-470, -820);
  rr(g, -200, 1040, E.W + 400, 900, 30); g.fillStyle = '#2a201c'; g.fill();                                                             // table top
  const on = t >= tOn, flash = on ? Math.max(0, 1 - (t - tOn) / 0.3) : 0, twitch = t > tOn + 0.6 && Math.sin(t * 23) * Math.sin(t * 7.3) > 0.55 ? 0.14 : 0;
  babyMonitor(g, 470, 820, 2.4, { t, on, level: on ? Math.max(0.25 * flash, twitch) : 0, static: on && t < tOn + 0.2 ? 0.3 : 0 });
  // her hand: in from the left, a finger on the switch, then away
  const hk = ease.inOut(prog(t, 0.3, tOn)) * (1 - ease.inOut(prog(t, tOn + 0.25, tOn + 0.9))), hx = lerp(-420, 300, hk), hy = 720;
  g.save(); g.translate(hx, hy); g.rotate(0.15); rr(g, -420, -60, 400, 120, 50); g.fillStyle = HERO.color; g.fill(); rr(g, -40, -48, 140, 96, 44); g.fillStyle = '#1a1418'; g.fill(); rr(g, 70, -30, 70, 34, 16); g.fill(); g.restore();
  g.restore();
  finish(g, t);
} });

// s013 — ALL NIGHT: "All night."  hood up at the kitchen table, sleeves over her hands, the monitor glowing green; Biscuit on the counter staring toward the stairs, never blinking
registerShot('s013', { draw(g, t, info) {
  const tNight = 0.47, cam = camMove(t, info.dur, { z: [1.4, 1.48], x: [-330, -310], y: [-130, -150], drift: 0.4 });
  const H = house(g, t, cam, { room: 'kitchen', clock: '11:04', lights: { lamp: 0.7 }, monitor: false }), GY = H.GY, CX = H.CX;
  layer(g, cam, 1, (g) => {
    const tx = CX - 420, ty = GY - 330; table(g, tx + 120, ty, 560);
    const pose = idle(t < tNight ? { ...POSES.sit, hF: [44, -112] } : { ...POSES.holdFront, hip: [0, -72], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0], hF: [26, -128], hB: [20, -130], head: [8, -184], sh: [2, -146] }, t, 7);
    const o = { x: tx - 120, y: ty + 72 * HS * 0.62 + 40, s: HS * 0.95, facing: 1 };
    actor(g, HOOD, { ...o, pose, t, rim: MOON, expr: exprAt(t, [[0, 'neutral'], [tNight, 'worried']]), blink: blinkFlag(t, 3.3, 7), look: t > tNight ? lookToward(1, 0.5) : lookToward(1, 0) });
    babyMonitor(g, tx + 170, ty - 70, 0.55, { t, on: true, level: 0, static: 0 });
    rr(g, o.x + 4, o.y - 120 * o.s, 20, 30, 3); g.fillStyle = '#efe6d4'; g.fill();                                                 // note corner in the hoodie pocket
    cat(g, { x: CX - 40, y: GY - 420, s: 1.8, facing: 1, pose: 'sit', eyes: 'open', t, rim: MOON });
  });
  houseFg(g, t, cam, { room: 'kitchen' });
  finish(g, t);
} });

// s014 — "Ten past eleven."  the wall clock close: the minute hand clunks to 11:10; pale '11:10'; a shape in the glass reflection, gone 0.4 s later
registerShot('s014', { draw(g, t, info) {
  const tTen = 0.26, tEl = 0.66, cam = camMove(t, info.dur, { z: [1.0, 1.06], r: [0, 0.035], drift: 0.3 });
  blurLayer(g, 10, (g) => house(g, t, { z: 2.4, x: -20, y: -500 }, { room: 'kitchen', clock: '11:10', lights: { lamp: 0.7 } }), null, 1); veil(g, '#03050c', 0.3);
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.rotate(cam.r); g.scale(cam.z, cam.z); g.translate(-E.W / 2, -E.H * 0.42);
  const clunk = t >= tTen ? Math.exp(-(t - tTen) * 14) * Math.sin((t - tTen) * 40) * 0.6 : 0;
  wallClock(g, t, E.W * 0.47, E.H * 0.42, 380, { time: [11, t < tTen ? 9 : 10 + clunk], sec: t < tTen ? 58 + t * 4 : Math.floor((t - tTen) * 1) + 1, reflect: true, shape: Math.max(0, 1 - Math.abs(t - 0.95) / 0.22) });
  g.restore();
  inkChip(g, t, tEl, '11:10', 90, 300);
  finish(g, t);
} });

// s015 — "Something knocks on the basement door."  low angle over her shoulder: she freezes mid-sip; the basement door deep right, the bolt now UNLOCKED
registerShot('s015', { draw(g, t, info) {
  const tKn = 0.49, tBase = 1.23, tDoor = 1.57, cam = camMove(t, info.dur, { z: [1.0, 1.1], x: [60, 160], y: [-200, -210], drift: 0.4 });
  blurLayer(g, 7, (g) => house(g, t, cam, { room: 'basement', bolt: 0, seep: 0.5, lights: { lamp: 0.5 } }), null, 1); veil(g, '#02040a', 0.2);
  const HX = 250, HY = E.H * 1.12;
  layer(g, { z: 1, x: 0, y: 0 }, 1, (g) => {
    const frozen = t >= tKn, cup = frozen ? 1 : ease.inOut(prog(t, 0, tKn)), pose = idle({ ...POSES.holdFront, hF: [24, lerp(-150, -186, cup)], eF: [26, -150], head: [frozen ? 6 : 8, -206] }, frozen ? 0 : t, 7);
    const eyes = t > tBase ? lookToward(1, -0.05) : lookToward(0.3, 0.2), headTurn = t > tBase + 0.25 ? 1 : 0;
    actor(g, 'HERO', { x: HX, y: HY, s: 3.4, facing: 1, pose: headTurn ? { ...pose, head: [pose.head[0] + 4, pose.head[1]] } : pose, t, rim: MOON, expr: exprAt(t, [[0, 'neutral'], [tKn, 'surprised'], [tBase, 'worried'], [tDoor, 'scared']]), blink: frozen ? false : blinkFlag(t, 3.3, 7), look: eyes });
    const [hx, hy] = [HX + 24 * 3.4, HY + lerp(-150, -186, cup) * 3.4]; rr(g, hx - 28, hy - 70, 56, 70, 10); g.fillStyle = '#c8b8a0'; g.fill(); ring(g, hx + 36, hy - 36, 16, 7, '#c8b8a0');   // the mug
    rr(g, -200, HY - 300, 900, 40, 10); g.fillStyle = '#2a201c'; g.fill();                                                         // table edge
  });
  finish(g, t, { breathe: 0.35 });
} });

// s016 — THREE KNOCKS: "Three times."  tight on the basement door: three LOW knocks rattle it, dust falls from knee height, a shadow passes the light under the door
registerShot('s016', { draw(g, t, info) {
  const ks = [0, 0.45, 0.9], k = knockAt(t, ks), cam = { z: 1.42 * (1 + 0.02 * k), x: noise(t * 60, 3) * 6 * k, y: -60 + noise(t * 60, 7) * 6 * k, r: 0 };
  const H = house(g, t, cam, { room: 'basement', knock: k, bolt: 0, seep: 0.7, lights: { lamp: 0.2 } }), p = H.pos;
  layer(g, cam, 1, (g) => {
    const r = rng(5), lowY = p.doorTop + p.doorH * 0.72;
    ks.forEach((tk, j) => { const u = t - tk; if (u < 0 || u > 1.4) return; for (let i = 0; i < 12; i++) { const x = p.doorX - p.doorW * 0.3 + r() * p.doorW * 0.6, vy = 80 + r() * 160, y = lowY + (r() - 0.5) * 40 + vy * u + 400 * u * u; circle(g, x + Math.sin(u * 8 + i) * 6, y, 2 + r() * 2.5, alpha('#c8c0b0', 0.8 * (1 - u / 1.4))); } });
    const ly = p.gapY + 2, sh = prog(t, 1.15, 1.9); g.fillStyle = alpha('#ffcf8a', 0.55); g.fillRect(p.doorX - p.doorW / 2 + 10, ly - 3, p.doorW - 20, 5);                   // light under the door
    if (sh > 0 && sh < 1) { const sx = lerp(p.doorX - p.doorW / 2, p.doorX + p.doorW / 2, sh); g.fillStyle = '#030305'; g.fillRect(sx - 60, ly - 4, 120, 7); }
  });
  houseFg(g, t, cam, { room: 'basement' });
  finish(g, t, { breathe: 0.4 });
} });

// s017 — GIANT FACE: "You don't move."  shocked -> worried on 'move', eyes huge, no blink, no breath; the basement doorknob turns a quarter at the right edge
registerShot('s017', { draw(g, t, info) {
  const tMove = 0.55, tr = [noise(t * 30, 2) * 1.2, noise(t * 30, 5) * 1.2];
  g.fillStyle = '#05070e'; g.fillRect(0, 0, E.W, E.H);
  blurLayer(g, 12, (g) => house(g, t, { z: 1.4, x: 180, y: -200 }, { room: 'basement', bolt: 0, lights: { lamp: 0.1 } }), null, 1); veil(g, '#02040a', 0.5);
  // the doorknob, out of focus at the right edge: turns a quarter and stops
  const kk = ease.inOut(prog(t, 0.8, 1.25)); blurLayer(g, 5, (g) => { circle(g, 840, 980, 46, '#8a7448'); circle(g, 840, 980, 34, '#a88c58'); g.save(); g.translate(840, 980); g.rotate(kk * Math.PI / 2); g.fillStyle = '#3a2c18'; g.fillRect(-4, -30, 8, 60); g.restore(); }, null, 1);
  glow(g, 430, 1300, 500, '#5fe08a', 0.2);
  g.save(); g.translate(tr[0], tr[1]);
  const f = { ...faceAt(t, [[0, 'shocked'], [tMove, 'worried']], 0.2), sweat: 1, glint: t > tMove ? 0.4 : 0.2 };
  giantFace(g, 430, 740, 330, { who: 'HERO', f, rimSide: 1, rimColor: '#9fc0ff', glint: '#e8f4ff', blink: 0, breath: 0 });
  g.restore();
  finish(g, t, { breathe: 0.4 });
} });

// s018 — "Eleven forty."  the same clock: the lamp is off now, only moonlight + the green monitor dot in the glass; 11:40; the second hand stutters backwards once
registerShot('s018', { draw(g, t, info) {
  const tEl = 0.15, tF = 0.47, cam = camMove(t, info.dur, { z: [1.04, 1.08], r: [0.02, 0.03], drift: 0.3 });
  blurLayer(g, 10, (g) => house(g, t, { z: 2.4, x: -20, y: -500 }, { room: 'kitchen', clock: '11:40', lights: { lamp: 0 } }), null, 1); veil(g, '#02040a', 0.45);
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.rotate(cam.r); g.scale(cam.z, cam.z); g.translate(-E.W / 2, -E.H * 0.42);
  const clunk = t >= tEl ? Math.exp(-(t - tEl) * 14) * Math.sin((t - tEl) * 40) * 0.6 : 0, s0 = Math.floor(t);
  const sec = t < 1.2 ? s0 + 1 : t < 1.45 ? s0 : s0 + 1;                                                                     // one tick backwards at ~1.2 s
  wallClock(g, t, E.W * 0.47, E.H * 0.42, 380, { time: [11, t < tEl ? 39 : 40 + clunk], sec, green: true });
  g.restore();
  inkChip(g, t, tF, '11:40', 90, 300);
  finish(g, t, { cold: 0.55 });
} });

// s019 — "The hallway light goes off. You wait."  the bulb buzzes, flickers, CLICKS dark; she is a rim-lit silhouette with the green monitor dot; eyes shut, back to the wall;
// breathing darkness where the stairs start; Biscuit's green eyes low at the foot of the stairs, looking up
registerShot('s019', { draw(g, t, info) {
  const tOff = 1.15, tWait = 2.57, hall = t < 0.6 ? 1 : t < tOff ? flick(t, 0.9, 4) : 0;
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-60, -40], y: [-60, -70], drift: 0.35 });
  const H = house(g, t, cam, { room: 'hallway', lights: { hall }, flicker: t > 0.6 && t < tOff ? 0.9 : 0, switchOn: t < tOff }), GY = H.GY, CX = H.CX, p = H.pos;
  layer(g, cam, 1, (g) => {
    if (t > tOff) { const k = 0.6 + 0.4 * Math.sin(t * 1.3), r = 300 + 40 * k, gr = g.createRadialGradient(p.vpX, p.vpY + 80, 0, p.vpX, p.vpY + 80, r); gr.addColorStop(0, alpha('#000000', 0.6 * k)); gr.addColorStop(1, alpha('#000000', 0)); g.fillStyle = gr; g.fillRect(p.vpX - r, p.vpY + 80 - r, r * 2, r * 2); }
    const eyes = prog(t, 2.0, 2.3); if (eyes > 0) { const ex = p.vpX + 30, ey = p.vpY + 250, gl = 0.6 + 0.4 * Math.sin(t * 2); for (const dx of [-10, 10]) { glow(g, ex + dx, ey, 22, '#7fe86a', 0.7 * eyes * gl); circle(g, ex + dx, ey, 3.5, alpha('#c8ff9a', eyes)); } }
    const back = ease.inOut(prog(t, tWait, tWait + 0.4)), pose = idle(t < tWait ? { ...POSES.stand, eB: [-8, -134], hB: [-10, -110] } : { ...POSES.holdFront, hF: [18, -150], hB: [14, -152], head: [-6, -208], sh: [-6, -174] }, t, 7);
    const o = { x: CX - 300 - back * 40, y: GY + 300, s: 2.6, facing: 1 };
    actor(g, 'HERO', { ...o, pose, t, rim: { color: '#7fa8ff', dir: [0.9, -0.4] }, dim: t > tOff, expr: exprAt(t, [[0, 'worried'], [tOff, 'scared']]), blink: t > tWait ? true : blinkFlag(t, 3.3, 7), look: lookToward(1, -0.4) });
    const hx = o.x + (t < tWait ? -10 : 14) * o.s, hy = o.y + (t < tWait ? -110 : -152) * o.s; rr(g, hx - 18, hy - 30, 36, 56, 8); g.fillStyle = '#e8e4ea'; g.fill(); glow(g, hx, hy - 20, 30, '#5fe08a', 0.8); circle(g, hx, hy - 20, 4, '#7fff9a');   // the monitor + green dot
  });
  houseFg(g, t, cam, { room: 'hallway' });
  finish(g, t, { breathe: t > tOff ? 0.55 : 0.3 });
} });

// s020 — "It comes back on."  the bulb snaps on (one flicker), she flinches, eyes open; push into the switch: it is ON though she never touched it, a small fresh fingerprint on the plate;
// Biscuit at the foot of the stairs, staring up
registerShot('s020', { draw(g, t, info) {
  const tBack = 0.76, tOn = 1.08, hall = t > 0.15 && t < 0.2 ? 0 : 1, push = ease.inOut(prog(t, tOn, info.dur));
  const base = camMove(t, info.dur, { z: [1.0, 1.04], drift: 0.35 }), cam = { ...base, x: base.x + lerp(-40, 360, push), y: base.y + lerp(-70, -110, push), z: base.z * lerp(1, 1.12, push) };
  const H = house(g, t, cam, { room: 'hallway', lights: { hall }, switchOn: true }), GY = H.GY, CX = H.CX, p = H.pos;
  layer(g, cam, 1, (g) => {
    cat(g, { x: p.vpX + 30, y: p.vpY + 270, s: 0.9, facing: 1, pose: 'sit', eyes: 'open', t, rim: MOON });
    const o = { x: CX - 340, y: GY + 300, s: 2.6, facing: 1 };
    actor(g, 'HERO', { ...o, pose: idle(reaction('shock', t, 0, 'holdFront'), t, 7), t, rim: MOON, expr: exprAt(t, [[0, 'shocked'], [tBack, 'worried']]), blink: t < 0.25 ? true : blinkFlag(t, 3.3, 7), look: t > tBack ? lookToward(1, -0.3) : lookToward(0.4, -0.4) });
    // the fingerprint on the switch plate: small, fresh, slightly smudged
    const fx = p.switchX + 22, fy = p.switchY - 30; g.save(); g.translate(fx, fy); g.rotate(-0.3); for (let i = 0; i < 4; i++) { g.strokeStyle = alpha('#3a3436', 0.55 - i * 0.1); g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0, 4 + i * 3, 6 + i * 3.6, 0, 0, 7); g.stroke(); } g.restore();
  });
  houseFg(g, t, cam, { room: 'hallway' });
  finish(g, t);
} });
