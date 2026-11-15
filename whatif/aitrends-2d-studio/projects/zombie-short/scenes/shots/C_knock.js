// C_knock.js — zombie Short batch C (s025-s032, 47.23-65.452): hours pass, the phone dies, the knocks, the light under the door, Dev's voice
// and the shadow, "But Dev didn't make it out on day one.", "Would you open the door?", hard cut + end card.
// Dev is NEVER seen (voice + shadow only). No gore. Word beats = the shots.json scene seconds (words.json was re-timed from the voice).
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, mix, glow, rr, seg, circle, poly, linGrad, radGrad, rng, noise } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { exprAt, idle, reaction, lookToward } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { store, storeFg, breathFog, deadPhone } from '../sets/store.js';
import { grain, coldGrade, breathe, endCard } from '../sets/horror.js';
import { knockAt } from '../sets/house.js';
import { HERO } from '../cast.js';

const WARM = '#ffd9a0', DOORL = '#ffe6b8', ICE = '#bfe4ff';
const post = (g, t, o = {}) => { coldGrade(g, o.cold ?? 0.14); breathe(g, t, o.vig ?? 0.3); grain(g, t, o.grain ?? 0.09); };
const push = (t, dur, z0, z1, x = 0, y = 0) => ({ z: lerp(z0, z1, ease.inOut(clamp(t / dur))), x, y, r: 0 });
// the warm line under the steel door, redrawn over a darkened frame (so it stays the only warm thing); bars = shadow shapes on the floor
function underLight(g, cam, x, w, gy, a = 1, bars = null) {
  layer(g, cam, 1, (g) => {
    if (a <= 0.01) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = alpha(DOORL, 0.95 * a); g.fillRect(x + 6, gy - 7, w - 12, 6); glow(g, x + w / 2, gy, w * 0.7, DOORL, 0.35 * a);
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 420, [alpha(DOORL, 0.3 * a), alpha(DOORL, 0)]); g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.lineTo(x + w + 180, gy + 420); g.lineTo(x - 180, gy + 420); g.closePath(); g.fill();
    g.restore();
    if (bars) { g.save(); g.fillStyle = '#020306'; for (const b of bars) { if (b.a <= 0) continue; g.globalAlpha = b.a; g.beginPath(); g.moveTo(b.x, gy - 7); g.lineTo(b.x + b.w, gy - 7); g.lineTo(b.x + b.w + b.dx + b.w * 0.8, gy + b.len); g.lineTo(b.x + b.dx - b.w * 0.2, gy + b.len); g.closePath(); g.fill(); } g.restore(); }
  });
}
const frostDrop = (g, cam, t, tk, x0, w, y) => layer(g, cam, 1, (g) => { const u = t - tk; if (u < 0 || u > 1.1) return; const R = rng(Math.round(tk * 100) + 5); for (let i = 0; i < 14; i++) circle(g, x0 + R() * w, y + u * (120 + R() * 220), 2 + R() * 2.5, alpha('#eaf4ff', 0.8 * (1 - u / 1.1))); });
const huddle = { head: [14, -150], sh: [6, -118], hip: [-10, -40], eF: [40, -96], hF: [52, -70], eB: [34, -92], hB: [46, -66], kF: [46, -90], fF: [40, 0], kB: [36, -86], fB: [28, 0] };   // sitting on the floor, knees up, arms round them

// ===================================================================================================
// s025 — "Hours pass."  time-lapse from high in the corner: frost creeps up the walls and over his shoulders, the bulb strobes, his breath
// slows; the flashlight beside him dims and goes out on "pass". The line of light under the door never changes.
registerShot('s025', { draw(g, t, info) {
  const tPass = 0.59, k = clamp(t / info.dur), cam = push(t, info.dur, 1.0, 1.03, -40, 160);
  const S = store(g, t * 6, cam, { view: 'freezer', frost: lerp(0.6, 1, k), flicker: lerp(0.2, 0.7, k), strips: 0.1 });
  const hx = S.CX - 300, gy = S.GY + 10, s = 2.0, torch = t < tPass ? lerp(1, 0.3, t / tPass) : 0;
  layer(g, cam, 1, (g) => {
    if (torch > 0) { glow(g, hx + 180, gy - 10, 180 * torch, WARM, 0.45 * torch); }
    rr(g, hx + 140, gy - 26, 80, 24, 10); g.fillStyle = '#1a1c22'; g.fill(); circle(g, hx + 222, gy - 14, 12, mix('#2a2c32', '#fff2c8', torch));
    actor(g, 'HERO', { x: hx, y: gy, s, facing: 1, pose: huddle, expr: 'worried', blink: (t * 3) % 1 > 0.85, look: lookToward(1, 0.3), rim: S.rim, t });
    // frost creeping over his shoulders + hood (a white edge growing)
    const R = rng(3), fk = k; for (let i = 0; i < 40 * fk; i++) circle(g, hx + (-20 + R() * 70) * s, gy + (-170 + R() * 80) * s, 1.5 + R() * 2.5, alpha('#f0f8ff', 0.5 + 0.3 * R()));
    breathFog(g, t, hx + 28 * s, gy - 140 * s, { rate: lerp(2, 0.5, k), s: 1.0, facing: 1 });
  });
  storeFg(g, t, cam, { view: 'freezer' });
  post(g, t);
} });

// ===================================================================================================
// s026 — "Your phone dies. Then, a knock."  the phone in his frosty hand is the only light: 10% -> 3% -> 1% -> black. Then near-total dark,
// only the warm line under the door far behind. In the black screen's reflection that line is briefly broken: something passed.
registerShot('s026', { draw(g, t, info) {
  const tPhone = 0.47, tDies = 0.84, tBlack = 1.14, z = t < tBlack ? lerp(1.0, 1.05, ease.inOut(t / tBlack)) : 1.05;
  g.fillStyle = '#010205'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  // the door line far behind, out of focus
  blurLayer(g, 14, (g) => { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(DOORL, 0.7); g.fillRect(E.W * 0.55, 990, 340, 10); glow(g, E.W * 0.55 + 170, 995, 260, DOORL, 0.25); g.restore(); }, null, 1);
  const pct = t < tPhone ? Math.round(lerp(10, 3, t / tPhone)) : t < tDies ? 3 : t < tBlack ? 1 : 0;
  g.save(); g.translate(540, 720); g.scale(z, z); g.translate(-540, -720);
  const lit = pct > 0 ? 1 : 0;
  // the hand + mustard cuff under the phone, lit blue-white by the screen
  g.save(); g.translate(640, 1180); g.rotate(-0.5); g.fillStyle = HERO.color; rr(g, -130, 0, 260, 700, 70); g.fill(); g.fillStyle = alpha('#000', 0.45); g.fillRect(-130, 0, 260, 34); g.restore();   // the sleeve from the bottom right
  g.fillStyle = '#0c0b10'; g.beginPath(); g.ellipse(560, 1020, 230, 190, -0.3, 0, 7); g.fill();                                                      // palm behind the phone
  rr(g, 310, 760, 120, 250, 56); g.fill(); for (let i = 0; i < 4; i++) { rr(g, 720, 540 + i * 70, 70, 54, 26); g.fill(); }                            // thumb (left), fingertips (right)
  if (lit) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 540, 720, 420, '#9fc8ff', 0.22 * (pct / 10 + 0.3)); g.restore(); g.strokeStyle = alpha('#bcd8ff', 0.5); g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(752, 567 + i * 70, 26, Math.PI * 0.6, Math.PI * 1.3); g.stroke(); } }
  deadPhone(g, t, 540, 720, 2.0, { pct });
  // frost on the knuckles
  const R = rng(9); for (let i = 0; i < 26; i++) circle(g, 720 + R() * 80, 530 + R() * 280, 1.5 + R() * 2, alpha('#eaf4ff', 0.6));
  // reflection in the black screen: the door line, broken for a moment (something passed)
  if (!lit) { const y = 900, brk = prog(t, 1.55, 2.0); g.save(); rr(g, 344, 308, 392, 824, 52); g.clip(); g.fillStyle = alpha(DOORL, 0.35); g.fillRect(420, y, 240, 5); if (brk > 0 && brk < 1) { g.fillStyle = '#02030a'; g.fillRect(420 + brk * 240 - 30, y - 2, 60, 9); } g.restore(); }
  g.restore();
  if (!lit) breathFog(g, t, 760, 980, { rate: 0.5, s: 1.2, facing: 1 });
  post(g, t, { cold: 0.08 });
} });

// ===================================================================================================
// s027 — "Slow. Patient."  (cut on knock 1) the pitch-dark freezer: HERO crouched left, only a rim of the warm door line. Knocks at 0 and 1.6
// s, LOW on the door; the door shivers, frost drops into the light; he flinches each time and stops breathing; on "Patient" his head turns.
registerShot('s027', { draw(g, t, info) {
  const knocks = [0, 1.6], k = knockAt(t, knocks, { decay: 12 }), tPat = 2.15;
  const cam = push(t, info.dur, 1.0, 1.05, lerp(-60, 20, ease.inOut(t / info.dur)), 120); cam.x += k * Math.sin(t * 120) * 1.5;
  const S = store(g, t, cam, { view: 'freezer', flicker: 0, frost: 1, under: 1 });
  veil(g, '#010208', 0.86);                                                                           // the bulb is dead: pitch dark
  const P = S.pos, dx = P.doorX - P.doorW / 2;
  underLight(g, cam, dx, P.doorW, S.GY);
  knocks.forEach((tk) => frostDrop(g, cam, t, tk, dx, P.doorW, S.GY - 300));
  layer(g, cam, 1, (g) => {
    const hx = S.CX - 240, last = knocks.filter((x) => t >= x).pop() ?? -9, u = t - last, jolt = u >= 0 && u < 0.6 ? Math.exp(-u * 7) * Math.sin(u * 30) : 0;
    const pose = idle({ ...POSES.crouch }, t, 3); pose.head = [pose.head[0] - 10 * jolt, pose.head[1] - 6 * Math.abs(jolt)]; pose.sh = [pose.sh[0] - 5 * jolt, pose.sh[1]];
    actor(g, 'HERO', { x: hx, y: S.GY + 20, s: 2.3, facing: 1, pose, expr: exprAt(t, [[0, 'shocked'], [0.6, 'worried'], [tPat, 'scared']]), blink: false, look: t > tPat ? lookToward(1, 0.2) : lookToward(0.3, 0.5), rim: { color: WARM, dir: [1, 0.25], w: 5 }, dim: true, t });
    // the knock point: low on the door, a faint shiver ring at knee height
    knocks.forEach((tk) => { const u = t - tk; if (u >= 0 && u < 0.5) { g.strokeStyle = alpha('#c8d4e8', 0.35 * (1 - u / 0.5)); g.lineWidth = 3; g.beginPath(); g.arc(P.doorX - 40, S.GY - 260, 30 + u * 120, 0, 7); g.stroke(); } });
  });
  post(g, t, { vig: 0.4 });
} });

// ===================================================================================================
// s028 — "Hey. It's me. Open up."  (cut on knock 3) FLOOR LEVEL at the bottom of the steel door: the warm line across the frame, the glow
// pooling over the frost. Two shadow bars slide in on "Hey" - NOT side by side, one far behind the other, like a body leaning at a wrong
// angle; they shift on "It's me" and come closer on "Open up" as the light dims around them.
registerShot('s028', { draw(g, t, info) {
  const tHey = 0.67, tMe = 1.02, tOpen = 1.4, k = knockAt(t, [0], { decay: 12 });
  const cam = push(t, info.dur, 1.8, 1.9, 0, 494); cam.x += k * Math.sin(t * 120) * 2;
  const S = store(g, t, cam, { view: 'door', under: 0, shadow: 0, frost: 1 });
  veil(g, '#010208', 0.55);
  const dx = S.CX - 340, w = 680, sl = ease.out(prog(t, tHey, tHey + 0.4)), shift = ease.inOut(prog(t, tMe, tMe + 0.3)), near = ease.inOut(prog(t, tOpen, tOpen + 0.5));
  const dim = 1 - 0.35 * near;
  const bars = [
    { x: S.CX - 40 + lerp(-360, 0, sl) + shift * 18, w: 46 + near * 14, dx: -60, len: 420, a: sl },
    { x: S.CX + 70 + lerp(-360, 0, sl) - shift * 10, w: 30, dx: 160 + near * 40, len: 300 + near * 80, a: sl * 0.85 },        // the far one: offset, wrong
  ];
  underLight(g, cam, dx, w, S.GY, dim, bars);
  frostDrop(g, cam, t, 0, dx, w, S.GY - 200);
  storeFg(g, t, cam, { view: 'door' });
  post(g, t, { vig: 0.35 });
} });

// ===================================================================================================
// s029 — "It's Dev."  GIANT FACE HERO, hope: lit from below-right by the door line, frost on his lashes and hood; on "Dev" his face opens,
// he breathes again (a cloud rushes out) and starts to lean toward the door. The warm light on his face flickers like breathing at the gap.
function frostFace(g, cx, cy, r) { const R = rng(21); for (let i = 0; i < 30; i++) { const a = Math.PI * (1.05 + R() * 0.9), d = r * (1.0 + R() * 0.2); circle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 + R() * 3, alpha('#f0f8ff', 0.55)); } for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) circle(g, cx + sx * r * 0.34 + (i - 1.5) * r * 0.05, cy - r * 0.2, 2.5, alpha('#f0f8ff', 0.75)); }
function faceBg(g, t) { blurLayer(g, 12, (g) => store(g, t, { z: 1.3, x: 120, y: 200 }, { view: 'freezer', flicker: 0, frost: 1 }), null, 1); veil(g, '#010208', 0.78); }
registerShot('s029', { draw(g, t, info) {
  const tDev = 0.47, z = lerp(1.0, 1.05, ease.inOut(t / info.dur)), tilt = 0.1 * ease.inOut(prog(t, tDev, info.dur));
  faceBg(g, t);
  g.save(); g.translate(470, 720); g.scale(z, z); g.translate(-470, -720);
  const f = faceAt(t, [[0, 'worried'], [tDev, { eye: 1.15, pupil: 1.3, brow: 0.6, tilt: -0.3, open: 0.3, smile: 0.25, w: 0.9, glint: 0.8, sweat: 0, look: [0.6, 0.15] }]], 0.2);
  giantFace(g, 470, 720, 330, { who: 'HERO', f, rimSide: 1, rimColor: WARM, glint: WARM, blink: 0, tilt, breath: Math.sin(t * 2) * 0.4 });
  frostFace(g, 470, 720, 330);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.6); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 720, 1000, 380, WARM, 0.12 + 0.12 * pulse); g.restore();
  if (t > tDev) breathFog(g, t - tDev + 0.3, 600, 900, { rate: 1.6, s: 2.2, facing: 1 });
  g.restore();
  post(g, t, { vig: 0.35 });
} });

// ===================================================================================================
// s030 — "But Dev didn't make it out on day one."  THE TURN: the same face, tighter. On "didn't" the hope drains and the eyes go wide; on
// "day one" a tiny shake of the head, lips pressed; no blink. The warm rim on his chin dims - the shadow outside is standing up now.
registerShot('s030', { draw(g, t, info) {
  const tDidnt = 0.56, tDay = 1.66, z = lerp(1.0, 1.08, ease.inOut(t / info.dur));
  faceBg(g, t);
  g.save(); g.translate(470, 700); g.scale(z, z); g.translate(-470, -700);
  const awe = { eye: 1.15, pupil: 1.3, brow: 0.6, tilt: -0.3, open: 0.3, smile: 0.25, w: 0.9, glint: 0.8, look: [0.6, 0.15] };
  const scared = { eye: 1.2, pupil: 0.5, brow: 0.8, tilt: -0.8, open: 0, smile: -0.45, w: 0.55, sweat: 0.8, look: [0.4, 0.1] };
  const f = faceAt(t, [[0, awe], [tDidnt, 'shocked'], [tDay, scared]], 0.2);
  const shake = t > tDay && t < tDay + 0.4 ? Math.sin((t - tDay) * 30) * 0.03 * (1 - (t - tDay) / 0.4) : 0;
  const rimK = 1 - 0.75 * ease.inOut(prog(t, 0.3, info.dur));
  giantFace(g, 470, 700, 340, { who: 'HERO', f, rimSide: 1, rimColor: mix('#20140c', WARM, rimK), glint: WARM, blink: 0, tilt: 0.1 + shake });
  frostFace(g, 470, 700, 340);
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 720, 1000, 380, WARM, 0.2 * rimK); g.restore();
  g.restore();
  post(g, t, { vig: 0.4 });
} });

// ===================================================================================================
// s031 — "Would you open the door?"  the inside of the steel door, frontal: the bare plate, four empty screw holes, the scratches; the
// warm line under it broken by two still shadow bars. Nothing moves. Then the dead-still hold; in the last 0.3 s the line goes out completely.
registerShot('s031', { draw(g, t, info) {
  const z = lerp(1.0, 1.04, ease.inOut(clamp(t / (info.dur - 0.5))));
  const cam = { z, x: 0, y: 321, r: 0 };
  const S = store(g, t, cam, { view: 'door', under: 0, shadow: 0, frost: 1 });
  veil(g, '#010208', 0.45);
  const out = t > info.dur - 0.3 ? 0 : 1, dx = S.CX - 340, w = 680;
  underLight(g, cam, dx, w, S.GY, out, out ? [{ x: S.CX - 60, w: 46, dx: -40, len: 420, a: 1 }, { x: S.CX + 70, w: 30, dx: 160, len: 300, a: 0.85 }] : null);
  storeFg(g, t, cam, { view: 'door' });
  post(g, t, { vig: 0.35 });
} });

// ===================================================================================================
// s032 — hard cut to black + end card.
registerShot('s032', { draw(g, t, info) {
  endCard(g, t, 'Full What If stories on the channel.');
  grain(g, t, 0.03);
} });
