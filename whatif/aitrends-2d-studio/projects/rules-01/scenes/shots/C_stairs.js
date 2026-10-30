// C_stairs.js — THE RULES #1, batch C (s021-s027, 46.94-65.644 s): the monitor, the whisper, the stairs, Rule 4, the hand, black.
//   s021 hallway at the foot of the stairs: she looks down at the monitor on 'monitor', it crackles on 'crackles' (green light on her chin)
//   s022 macro: static key-up, the whisper drives the LEDs (red on 'come' / 'tuck'), then ONE dim red bar stays lit (something still breathing)
//   s023 halfway up the stairs (door ajar 0.15, no light behind it), Biscuit on a low step staring up, she turns the note over on 'turn'
//   s024 the flip: the front swings away, the back is blank... ink bleeds through on 'Rule', '4.' on 'four', the line writes on, wet drip
//   s025 giant face: eyes widen on 'no', roll UP to the top of the stairs on 'house'; the door behind her is wider (0.3); one red LED, no sound
//   s026 behind her shoulder looking up: monitor whisper, door 0.45, a shape that is almost there, a small pale hand on the banister on 'stairs'
//   s027 hard cut to black, "Follow for Rule 5."
// The monitor lines are filtered, so words.json is wrong there: every beat below uses the corrected times from the shot texts.
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, glow, rr, seg, circle, noise, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove } from '../sets/acting.js';
import { house, houseFg, flick } from '../sets/house.js';
import { note, babyMonitor, grain, vignette, coldGrade, breathe, interference, endCard } from '../sets/horror.js';
import { giantFace, faceAt } from '../sets/faces.js';

const MOONRIM = { color: '#8fb0ff', dir: [0.8, -0.5] };
const HOLD = { ...POSES.holdFront, eF: [22, -146], hF: [40, -150] };            // the monitor held up at chest height
const hand = (x, y, s, f, p) => [x + p.hF[0] * s * f, y + p.hF[1] * s];         // world position of the near hand
const gauss = (t, c, w) => Math.exp(-(((t - c) / w) ** 2));
// the whisper's loudness: syllable flutter inside [a, b], peaks on the stressed words
function whisper(t, a, b, peaks = []) {
  if (t < a || t > b) return 0;
  const edge = clamp((t - a) / 0.08) * clamp((b - t) / 0.12), flut = 0.28 + 0.32 * Math.abs(Math.sin(t * 13.7)) * (0.6 + 0.4 * Math.abs(Math.sin(t * 4.1)));
  return clamp(edge * Math.max(flut, ...peaks.map((c) => 0.98 * gauss(t, c, 0.13))));
}
// one dim red LED (the 5th) lit on its own: drawn over babyMonitor, which can only light the bars in order
function loneRed(g, x, y, s, a) {
  if (a <= 0.01) return; const lx = x + 88 * s, ly = y + 70 * s;
  g.save(); rr(g, lx - 16 * s, ly - 10 * s, 32 * s, 20 * s, 6 * s); g.fillStyle = alpha('#ff3a3a', 0.35 + 0.55 * a); g.fill(); glow(g, lx, ly, 46 * s, '#ff3a3a', 0.45 * a); g.restore();
}
// grey hoodie cuff + fingers gripping something at (x, y), pointing in from `side`
function gripHand(g, x, y, s, side, o = {}) {
  g.save(); g.translate(x, y); g.scale(side * s, s);
  rr(g, -150, -50, 130, 110, 34); g.fillStyle = o.cuff || '#6a7080'; g.fill(); seg(g, [[-36, -44], [-36, 54]], 6, '#555a68');
  g.fillStyle = o.skin || '#c89a7a'; rr(g, -38, -40, 70, 86, 30); g.fill();
  for (let i = 0; i < 3; i++) { rr(g, 14, -34 + i * 26, 34, 22, 11); g.fill(); }
  g.fillStyle = alpha('#000', 0.18); rr(g, -38, 20, 70, 26, 13); g.fill();
  g.restore();
}
// the hero's ponytail + hairline for her giant face (faces.js knows hoodie colour, not the ponytail)
function heroFace(g, t, cx, cy, r, o) { giantFace(g, cx, cy, r, { ...o, who: 'HERO', t }); }   // ponytail + hair cap now live in sets/faces.js
const fxStack = (g, t, o = {}) => { coldGrade(g, o.cold ?? 0.5); vignette(g, o.vig ?? 0.8); breathe(g, t, o.breathe ?? 0.3); grain(g, t, o.grain ?? 0.08); };

// ---------------------------------------------------------------------------------------------------
// s021 — "Then the monitor crackles."
// ---------------------------------------------------------------------------------------------------
registerShot('s021', { draw(g, t, info) {
  const tM = 0.47, tC = 0.83, s = 2.9;
  const cam = camMove(t, info.dur, { z: [1.2, 1.27], x: [-60, -50], y: [130, 110], drift: 0.4 });
  const H = house(g, t, cam, { room: 'hallway', lights: { hall: 1 }, switchOn: true });
  const hx = H.CX - 260, hy = H.GY + 300, pose = idle(t < tM ? { ...HOLD, hF: [36, -138] } : HOLD, t, 7), st = clamp(prog(t, tC, tC + 0.15)) * 0.6, lv = t > tC ? 0.1 + 0.3 * Math.abs(Math.sin(t * 23)) * Math.abs(Math.sin(t * 7)) : 0;
  layer(g, cam, 1, (g) => {
    // the foot of the stairs in the right third: one lit step, then nothing; the hall light stops dead at it
    const sx = H.CX + 260; g.fillStyle = '#2a2420'; g.fillRect(sx, hy - 90, 700, 90); g.fillStyle = '#3a3028'; g.fillRect(sx, hy - 100, 700, 14);
    g.fillStyle = linGrad(g, sx, 0, sx + 260, 0, ['rgba(2,3,8,0)', 'rgba(2,3,8,1)']); g.fillRect(sx, -E.H, 1400, E.H * 3);
    actor(g, 'HERO', { x: hx, y: hy, s, facing: 1, pose, expr: exprAt(t, [[0, 'worried'], [tC, 'scared']]), blink: blinkFlag(t, 3.3, 7), look: t < tM ? lookToward(1, 0) : lookToward(0.5, 0.9), rim: MOONRIM, t });
    const [mx, my] = hand(hx, hy, s, 1, pose);
    babyMonitor(g, mx + 30, my - 10, 0.26, { t, level: lv, static: st });
    if (t > tC) glow(g, mx + 10, my - 120, 160, '#7aff8a', 0.25 * (0.5 + 0.5 * Math.abs(Math.sin(t * 31))));   // green flicker up onto her chin
  });
  houseFg(g, t, cam, { room: 'hallway' });
  fxStack(g, t);
  if (t > tC) interference(g, t, 0.12 * (1 - prog(t, tC + 0.3, info.dur)));
} });

// ---------------------------------------------------------------------------------------------------
// s022 — [MONITOR] "Can you come tuck me in?"
// ---------------------------------------------------------------------------------------------------
registerShot('s022', { draw(g, t, info) {
  const tA = 0.71, tB = 2.92, z = lerp(1.0, 1.1, ease.inOut(t / info.dur));
  const keyUp = t < 0.7 ? 1 - prog(t, 0.05, 0.7) : 0;
  const lv = Math.max(keyUp * (t < 0.3 ? 1 : 0.4), whisper(t, tA, tB, [1.4, 1.8]));
  const st = t < 0.7 ? lerp(1, 0.4, prog(t, 0, 0.7)) : t < tB ? 0.3 : 0.15, after = prog(t, tB, tB + 0.25) * (0.6 + 0.4 * Math.sin((t - tB) * 5));
  // the dark hallway, out of focus
  blurLayer(g, 14, (g) => house(g, t, { z: 1.4, x: 120, y: -200 }, { room: 'hallway', lights: { hall: 0.5 } }), null, 1); veil(g, '#02040a', 0.55);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // her frightened face behind, soft focus, lit green from below
  const f = faceAt(t, [[0, 'worried'], [2.9, 'shocked']]);
  blurLayer(g, 5, (g) => { heroFace(g, t, 330, 470, 220, { f: { ...f, look: [0.3, 0.6] }, rimSide: 1, rimColor: '#8fb0ff', blink: 0, breath: Math.sin(t * 3) }); glow(g, 330, 610, 260, lv > 0.7 ? '#ff6a5a' : '#7aff8a', 0.18 + 0.25 * lv); }, null, 1);
  // the monitor in her hand (thumb on the side, grey cuff)
  const mx = 600, my = 1090, ms = 1.6, tr = noise(t * 9, 3) * 2;
  gripHand(g, mx - 240 + tr, my + 100, 0.85, 1, {});
  babyMonitor(g, mx + tr, my, ms, { t, level: lv, static: st });
  g.fillStyle = '#c89a7a'; rr(g, mx - 268 + tr, my - 10, 50, 92, 24); g.fill();                         // thumb over the side
  loneRed(g, mx + tr, my, ms, after);
  g.restore();
  // the light from the LEDs on everything
  glow(g, 560, 1100, 700, lv > 0.7 ? '#ff4a3a' : '#5aff7a', 0.08 * lv);
  fxStack(g, t, { breathe: 0.35 });
  interference(g, t, clamp(keyUp * 0.9 + (t > tA && t < tB ? 0.12 : 0) + (t > tB && t < tB + 0.25 ? 0.4 : 0)));
} });

// ---------------------------------------------------------------------------------------------------
// s023 — "You're halfway up the stairs when you turn the note over."
// ---------------------------------------------------------------------------------------------------
const stepY = (H, i) => lerp(H.pos.baseY, H.pos.topY, Math.pow(i / 12, 0.85));
registerShot('s023', { draw(g, t, info) {
  const tHalf = 0.6, tTurn = 1.94, climb = 1 - Math.pow(1 - clamp(t / 1.8), 2);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [-20, 0], y: [-40, -140], drift: 0.3 });
  const H = house(g, t, cam, { room: 'stairs', lights: { hall: 1 }, doorAjar: 0.15, shape: 0, hand: 0 });
  const step = lerp(3, 6, climb), hy = lerp(stepY(H, Math.floor(step)), stepY(H, Math.floor(step) + 1), step % 1), s = lerp(1.8, 1.6, climb), hx = H.CX - 150 + climb * 40;
  const walk = walkAlong(climb * 420, s, { facing: 1 }).pose;
  const pose = idle(t < 1.8 ? walk : poseAt(t, [[1.8, 'stand'], [tTurn - 0.15, HOLD]], 0.25), t, 7);
  layer(g, cam, 1, (g) => {
    cat(g, { x: H.CX - 330, y: stepY(H, 2) + 10, s: 1.8, facing: 1, pose: 'sit', eyes: 'glint', t, rim: MOONRIM });
    actor(g, 'HERO', { x: hx, y: hy, s, facing: 1, pose, expr: exprAt(t, [[0, 'worried'], [tHalf, 'worried'], [tTurn, 'nervous']]), blink: blinkFlag(t, 3.3, 7), look: lookToward(1, t < tTurn ? -0.5 : 0.6), rim: MOONRIM, t });
    const [px, py] = hand(hx, hy, s, 1, pose);
    glow(g, px - 20, py, 40, '#7aff8a', 0.6); circle(g, px - 20, py, 5, '#7aff8a');                              // the monitor's green dot
    if (t > tTurn - 0.1) { const k = ease.inOut(prog(t, tTurn, tTurn + 0.6)), w = 70 * Math.max(0.08, Math.abs(Math.cos(k * Math.PI)));
      g.fillStyle = k < 0.5 ? '#efe6d2' : '#e6dcc4'; g.fillRect(px + 6 - w / 2, py - 60, w, 86); glow(g, px + 6, py - 20, 90, '#ffd8a0', 0.25); }
  });
  houseFg(g, t, cam, { room: 'stairs' });
  fxStack(g, t, { breathe: 0.35 });
} });

// ---------------------------------------------------------------------------------------------------
// s024 — "Rule four."  the flip
// ---------------------------------------------------------------------------------------------------
registerShot('s024', { draw(g, t, info) {
  const tR = 1.58, tF = 1.90, z = lerp(1.0, 1.1, ease.inOut(t / info.dur));
  blurLayer(g, 16, (g) => house(g, t, { z: 1.5, x: 200, y: -300 }, { room: 'stairs', lights: { hall: 1 }, doorAjar: 0.15 }), null, 1); veil(g, '#02040a', 0.4);
  glow(g, E.W / 2, E.H * 0.95, 1000, '#ffcf8f', 0.18);                                                     // warm from below
  const flip = ease.inOut(prog(t, 0.05, 0.75)), back = t < tR ? 0 : t < tF ? lerp(0, 0.17, prog(t, tR, tF)) : lerp(0.17, 1, ease.inOut(prog(t, tF, tF + 0.9)));
  const tx = noise(t * 14, 2) * 2, ty = noise(t * 14, 7) * 2;
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(z, z); g.translate(-E.W / 2 + tx, -E.H * 0.42 + ty);
  const N = note(g, 520, 760, 0.9, { t, rules: 3.2, flip, back, shake: t > tF ? 0.25 : 0.1, magnet: false, rot: -0.02 });
  // the hands holding it at the bottom corners
  gripHand(g, 520 - 300, 760 + 360, 0.9, 1, {}); gripHand(g, 520 + 300, 760 + 360, 0.9, -1, {});
  // the wet ink of rule 4 runs down in a drip
  if (back > 0.4) { const dk = ease.in(prog(t, tF + 0.6, info.dur)), dx = 520 + 110, dy = 760 + 92 * 0.9;
    g.strokeStyle = '#2a1a24'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx + 2, dy + 12 + dk * 150); g.stroke(); circle(g, dx + 2, dy + 14 + dk * 150, 7, '#2a1a24');
    const dx2 = 520 - 90; g.beginPath(); g.moveTo(dx2, dy + 4); g.lineTo(dx2 + 1, dy + 8 + dk * 70); g.stroke(); circle(g, dx2 + 1, dy + 10 + dk * 70, 5, '#2a1a24'); }
  g.restore();
  fxStack(g, t, { cold: 0.4, vig: 0.85 });
} });

// ---------------------------------------------------------------------------------------------------
// s025 — "There are no kids in this house."  the realisation
// ---------------------------------------------------------------------------------------------------
registerShot('s025', { draw(g, t, info) {
  const tNo = 0.29, tHouse = 1.23, z = lerp(1.0, 1.08, ease.inOut(t / info.dur));
  // the top of the stairs behind her, soft focus: the door is wider now (0.3), black inside
  blurLayer(g, 8, (g) => house(g, t, { z: 1.25, x: -390, y: -416 + t * 6 }, { room: 'stairs', lights: { hall: 0.8 }, doorAjar: 0.3 }), null, 1); veil(g, '#02040a', 0.25);
  g.save(); g.translate(E.W / 2, E.H * 0.45); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.45);
  const f = faceAt(t, [[0, 'worried'], [tNo, 'shocked'], [tHouse, 'shocked']]), up = ease.inOut(prog(t, tHouse, tHouse + 0.7));
  f.pupil = lerp(f.pupil, 0.45, prog(t, tNo, tNo + 0.2)); f.eye = Math.max(f.eye, 1.25 * prog(t, tNo, tNo + 0.15)); f.open = Math.min(f.open, 0.22); f.smile = Math.min(f.smile, -0.35); f.w = Math.min(f.w, 0.55); f.blush = 0;
  f.look = [lerp(f.look[0], 0.3, up), lerp(f.look[1], -0.9, up)];
  glow(g, 430, 1100, 600, '#ffcf8f', 0.2);
  heroFace(g, t, 430, 720, 330, { f, rimSide: -1, rimColor: '#ffc68a', blink: 0, breath: Math.sin(t * 5) * 0.6, tilt: -0.04 * up });
  g.restore();
  g.fillStyle = linGrad(g, 0, 1180, 0, 1560, ['rgba(2,3,8,0)', 'rgba(2,3,8,1)']); g.fillRect(0, 1180, E.W, E.H - 1180);       // the hoodie sinks into the dark
  // the monitor in her hand, lower left: one red LED lit, no sound
  babyMonitor(g, 190, 1290, 0.6, { t, level: 0, static: 0.05 });
  loneRed(g, 190, 1290, 0.6, 0.7 + 0.3 * Math.sin(t * 4));
  fxStack(g, t, { vig: 0.85, breathe: 0.4 });
} });

// ---------------------------------------------------------------------------------------------------
// s026 — [MONITOR] "I can see you on the stairs."  + 0.6 s hold
// ---------------------------------------------------------------------------------------------------
registerShot('s026', { draw(g, t, info) {
  const tA = 0.15, tB = 2.80, tSee = 0.91, tStairs = 2.42;
  const cam = camMove(t, info.dur, { z: [1.0, 1.12], x: [-10, 0], y: [-260, -420], drift: t > tB ? 0 : 0.25 });
  const hall = t > 3.1 && t < 3.18 ? 0.15 : 1;                                                         // the bulb below flickers once at the end
  const shape = 0.3 * ease.inOut(prog(t, 0.6, tStairs)), handK = ease.inOut(prog(t, tStairs, tStairs + 0.5));
  const H = house(g, t, cam, { room: 'stairs', lights: { hall }, doorAjar: 0.45, shape, hand: handK > 0 ? handK * (1 - 0.06 * gauss(t, 3.25, 0.06)) : 0 });
  const lv = whisper(t, tA, tB, [tSee, tStairs]);
  // the LEDs throw red-green flicker up the wall
  if (lv > 0.05) glow(g, E.W * 0.3, E.H * 0.45, 700, lv > 0.7 ? '#ff4a3a' : '#5aff7a', 0.07 * lv);
  // her back (grey hoodie + ponytail), low, lower-left: she turns her head up on 'see'
  const sH = 2.2, hx = 230, hy = 1640, up = ease.out(prog(t, tSee, tSee + 0.4));
  const pose = idle({ ...POSES.stand, head: [lerp(5, -6, up), lerp(-207, -214, up)], eF: [20, -150], hF: [34, -186] }, t * (t > tB ? 0.3 : 1), 7);
  actor(g, 'HERO', { x: hx, y: hy, s: sH, facing: 1, pose, expr: exprAt(t, [[0, 'scared'], [tSee, 'shocked']]), blink: t > tSee ? false : blinkFlag(t, 3.3, 7), look: lookToward(0.3, -1), rim: MOONRIM, dim: true, t });
  const [mx, my] = hand(hx, hy, sH, 1, pose);
  babyMonitor(g, mx + 20, my - 40, 0.42, { t, level: lv, static: 0.4 });
  houseFg(g, t, cam, { room: 'stairs' });
  fxStack(g, t, { vig: 0.88, breathe: 0.45 });
  if (t < 0.4) interference(g, t, 0.6 * (1 - t / 0.4));
} });

// ---------------------------------------------------------------------------------------------------
// s027 — hard cut to black + "Follow for Rule 5."
// ---------------------------------------------------------------------------------------------------
registerShot('s027', { draw(g, t, info) {
  endCard(g, t + 0.15 - 0.29, 'Follow for Rule 5.');
  grain(g, t, 0.03);
} });
