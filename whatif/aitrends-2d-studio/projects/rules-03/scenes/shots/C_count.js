// C_count.js — THE RULES #3 batch C (s019-s030, 42.90-66.512): the knock, Mom's voice, the shadow in the light, the stairs, the count,
// "Four.", "Five." from the empty black, the hard cut + end card. The thing at the door and the fifth one are NEVER shown.
// Word beats are the shots.json scene-text seconds (words.json was re-timed from the voice envelope).
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, glow, rr, seg, circle, poly, radGrad, rng, noise } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { home4, home4Fg, outsideLight } from '../sets/home4.js';
import { doorKnob, fingerCount } from '../sets/rules3.js';
import { grain, coldGrade, vignette, endCard } from '../sets/horror.js';
import { knockAt } from '../sets/house.js';
import { HERO } from '../cast.js';

const LIGHT = '#fff3d6', WARM = '#ffd9a0', COLD = '#8ea6d8';
const post = (g, t, o = {}) => { coldGrade(g, o.cold ?? 0.12); if (o.vig) vignette(g, o.vig); grain(g, t, o.grain ?? 0.07); };
const still = (t, dur, z0, z1, x = 0, y = 0) => ({ z: lerp(z0, z1, ease.inOut(clamp(t / dur))), x, y, r: 0 });     // a slow push, no handheld drift (dread)
// the counting hand: dark red hoodie cuff under the wrist, warm rim from the door side; optional faint second rim on the other side
function hand(g, t, n, o) {
  const s = o.s ?? 3.2, x = o.x, y = o.y;
  g.save(); g.fillStyle = HERO.color; rr(g, x - 46 * s, y + 120 * s, 92 * s, 400 * s, 30 * s); g.fill(); g.fillStyle = alpha('#000', 0.35); g.fillRect(x - 46 * s, y + 120 * s, 92 * s, 14 * s); g.restore();
  if (o.ghostRim) { g.save(); g.globalAlpha *= 0.45; fingerCount(g, t, n, { x: x - 7, y, s, facing: -1, rim: '#c8d4ff', tremble: o.tremble ?? 0.2 }); g.restore(); }
  return fingerCount(g, t, n, { x, y, s, facing: -1, rim: WARM, tremble: o.tremble ?? 0.25 });
}
const roomDark = (g, t, cam, a = 0.62) => { blurLayer(g, 8, (g) => home4(g, t, cam, { view: 'living', glow: 1, boarded: 1, creep: 0.6 }), null, 1); veil(g, '#02030a', a); };

// ===================================================================================================
// s019 — "Sweetheart? It's Mom."  THREE SOFT KNOCKS low on the door (the cut lands on knock 1), dust jumps into the light; the muffled voice;
// on "Mom" the knob catches a soft glint as if a hand rested on it outside. It does NOT turn.
registerShot('s019', { draw(g, t, info) {
  const knocks = [0, 0.33, 0.66], k = knockAt(t, knocks, { decay: 14 }), tMom = 1.62;
  const cam = still(t, info.dur, 1.15, 1.21, 110, 270); cam.x += k * Math.sin(t * 120) * 1.5;
  const H = home4(g, t, cam, { view: 'door', glow: 1, creep: 0.5 });
  layer(g, cam, 1, (g) => {
    const P = H.pos;
    doorKnob(g, P.knobX, P.knobY, 0.4, { t, turn: 0, under: 1 });
    // the knock point: LOW on the door (crawling height); each knock puffs dust out of the frame into the light
    knocks.forEach((tk, i) => { const u = t - tk; if (u < 0 || u > 1.2) return; const R = rng(i + 3); for (let j = 0; j < 10; j++) { const ang = -Math.PI / 2 + (R() - 0.5) * 2.4, sp = 40 + R() * 90; circle(g, P.doorX + (R() - 0.5) * 300 + Math.cos(ang) * sp * u, H.GY - 60 + Math.sin(ang) * sp * u + 60 * u * u, 2 + R() * 2, alpha(LIGHT, 0.7 * (1 - u / 1.2))); } });
    if (t > tMom - 0.05) { const gk = Math.sin(clamp((t - tMom) / 0.7) * Math.PI); glow(g, P.knobX - 8, P.knobY - 10, 60, LIGHT, 0.45 * gk); circle(g, P.knobX - 10, P.knobY - 12, 4 * gk, alpha('#ffffff', 0.9 * gk)); }
  });
  home4Fg(g, t, cam, { view: 'door' });
  post(g, t);
} });

// ===================================================================================================
// s020 — "The sun's up. Come and see."  FLOOR LEVEL at the gap under the door: the white-warm line across the frame, its glow pooling
// toward camera with dust; two dark bars (far too thin, far too far apart to be feet) slide into the light on "sun's", lean on "Come",
// and the light flares around them on "see".
registerShot('s020', { draw(g, t, info) {
  const tSun = 0.35, tCome = 1.02, tSee = 1.46;
  const cam = still(t, info.dur, 2.4, 2.54, 0, 486);
  const sh = ease.out(prog(t, tSun, tSun + 0.45));
  const H = home4(g, t, cam, { view: 'door', glow: 1, creep: 0.55, shadow: 0 });
  // the bars: drawn here (not outsideLight's) so they can slide in from the left and lean; thin, wide apart, wrong
  layer(g, cam, 1, (g) => {
    const y = H.GY, x0 = H.pos.doorX, lean = ease.inOut(prog(t, tCome, tCome + 0.5)) * 14, slide = lerp(-260, 0, sh);
    if (sh > 0) { g.save(); g.globalAlpha *= 0.92 * clamp(sh * 1.4); g.fillStyle = '#04050a';
      for (const off of [-80, 64]) { const bx = x0 + off + slide + lean * (off > 0 ? 1 : 0.5), bw = 16; g.beginPath(); g.moveTo(bx, y - 5); g.lineTo(bx + bw, y - 5); g.lineTo(bx + bw * 1.8 + off * 0.25, y + 380); g.lineTo(bx - bw * 0.2 + off * 0.25, y + 380); g.closePath(); g.fill(); }
      g.restore(); }
    const fl = Math.exp(-Math.max(0, t - tSee) * 5) * (t > tSee ? 1 : 0); if (fl > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x0, y, 420, LIGHT, 0.5 * fl); g.restore(); }
  });
  home4Fg(g, t, cam, { view: 'door' });
  post(g, t);
} });

// ===================================================================================================
// s021 — "Mom is asleep upstairs."  From the foot of the stairs: the two closed doors at the top, warm spill only on the bottom steps,
// HERO's hand on the newel lower-left. The camera rises one step on "asleep". MOM's doormat is pushed slightly OUT.
registerShot('s021', { draw(g, t, info) {
  const tAsleep = 0.61;
  const cam = still(t, info.dur, 1.0, 1.06, 0, -340 - 40 * ease.inOut(prog(t, tAsleep, tAsleep + 0.45)));
  const H = home4(g, t, cam, { view: 'stairs', glow: 0.3 });
  layer(g, cam, 0.8, (g) => {
    const mx = H.pos.momX, dy = H.pos.doorsY + 600;                                                // MOM's doormat, pushed out a little and askew
    g.save(); g.translate(mx + 18, dy + 22); g.rotate(0.06); rr(g, -120, -10, 240, 26, 6); g.fillStyle = '#2a2018'; g.fill(); g.restore();
  });
  layer(g, cam, 1, (g) => {                                                                       // her hand on the newel post, lower-left
    const hx = 230, hy = H.GY - 120; g.fillStyle = '#1a1612'; rr(g, hx - 40, hy - 40, 80, 700, 10); g.fill(); circle(g, hx, hy - 50, 48, '#221a14');
    g.fillStyle = HERO.color; rr(g, hx - 260, hy - 90, 220, 70, 30); g.fill(); g.fillStyle = '#0a0a10'; rr(g, hx - 60, hy - 100, 80, 70, 24); g.fill();
    g.strokeStyle = alpha(WARM, 0.5); g.lineWidth = 4; g.beginPath(); g.arc(hx - 20, hy - 66, 36, -1.4, 0.2); g.stroke();
  });
  home4Fg(g, t, cam, { view: 'stairs' });
  post(g, t);
} });

// ===================================================================================================
// s022 — "You're almost sure."  GIANT FACE HERO at the foot of the stairs: warm door light on her right cheek, cold blue from above on her
// left; eyes up the stairs on "You're", back to the door on "almost", a swallow on "sure", lips pressed, no blink. The warm light on her
// cheek pulses slowly like breathing, in time with nothing in this room.
registerShot('s022', { draw(g, t, info) {
  const tYou = 0.15, tAlm = 0.46, tSure = 0.77, z = lerp(1.0, 1.08, ease.inOut(t / info.dur));
  blurLayer(g, 10, (g) => home4(g, t, { z: 1.1, x: 0, y: -200 }, { view: 'stairs', glow: 0.3 }), null, 1); veil(g, '#02030a', 0.4);
  g.save(); g.translate(E.W / 2, E.H * 0.4); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.4);
  const base = { eye: 1.0, pupil: 0.85, brow: 0.45, tilt: -0.75, smile: -0.35, w: 0.75, sweat: 0.3 };
  const f0 = faceAt(t, [[0, { ...base, look: [0.1, 0.1] }], [tYou, { ...base, eye: 1.12, look: [0, -0.8] }], [tAlm, { ...base, look: [0.85, 0.05] }], [tSure, { ...base, eye: 0.9, open: 0, smile: -0.45, w: 0.6, look: [0.7, 0.1] }]], 0.18);
  const sw = t > tSure ? Math.sin(clamp((t - tSure) / 0.35) * Math.PI) * 8 : 0;
  glow(g, 160, 560, 360, COLD, 0.18);
  giantFace(g, 460, 730 + sw, 330, { who: 'HERO', f: f0, rimSide: 1, rimColor: WARM, glint: LIGHT, blink: 0, breath: Math.sin(t * 2.2) * 0.4 });
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + 1);                                              // the light breathing on her cheek
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 700, 780, 260, WARM, 0.16 + 0.14 * pulse); g.restore();
  g.restore();
  post(g, t, { vig: 0.7 });
} });

// ===================================================================================================
// s023 — "So you count."  The hand rises into frame in the dark living room, a loose fist, warm rim from the door (right); on "count" it
// tightens. A second, fainter rim on the LEFT, where there is no light source.
registerShot('s023', { draw(g, t, info) {
  const tCount = 0.58, z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  roomDark(g, t, { z: 1.2, x: -100, y: 120 });
  const rise = ease.out(prog(t, 0, 0.45)), tight = ease.out(prog(t, tCount, tCount + 0.2));
  g.save(); g.translate(E.W / 2, 760); g.scale(z * (1 - 0.04 * tight), z * (1 - 0.04 * tight)); g.translate(-E.W / 2, -760);
  hand(g, t, 0, { x: 520, y: lerp(1100, 760, rise), s: 3.2, ghostRim: true, tremble: 0.2 });
  g.restore();
  post(g, t, { vig: 0.75 });
} });

// ===================================================================================================
// s024 / s025 — "Mom, upstairs." / "Dad, upstairs."  match cut on the two closed doors; the hand (lower-left) shows 1 then 2 fingers.
// MOM: no sound of sleep behind it, the knob cold-fogged. DAD: a jacket on the coat hook sways once, though the air is dead still.
function upstairsDoor(g, t, info, who, n, tWord, tUp) {
  const camX = who === 'MOM' ? -250 : 250, cam = still(t, info.dur, 1.35, 1.42, camX, 191);
  const H = home4(g, t, cam, { view: 'upstairs' });
  layer(g, cam, 1, (g) => {
    const dx = who === 'MOM' ? H.pos.momX : H.pos.dadX, top = H.pos.doorTop, kx = dx - 200 + 400 * 0.85, ky = top + 1000 * 0.55;
    if (who === 'MOM') { glow(g, kx, ky, 46, '#dfe8ff', 0.4); for (let i = 0; i < 6; i++) circle(g, kx - 10 + (i % 3) * 9, ky - 6 + Math.floor(i / 3) * 10, 2.5, alpha('#e8eeff', 0.5)); }
    else {                                                                                             // the jacket on a hook, swaying once on "upstairs"
      const hx = dx + 110, hy = top + 300, u = t - tUp, sw = u > 0 ? Math.exp(-u * 3) * Math.sin(u * 7) * 0.09 : 0;
      seg(g, [[hx, hy - 24], [hx, hy]], 6, '#6a6a70');
      g.save(); g.translate(hx, hy); g.rotate(sw);
      g.fillStyle = '#2a3348'; g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.lineTo(70, 40); g.lineTo(80, 330); g.lineTo(-80, 330); g.lineTo(-70, 40); g.closePath(); g.fill();
      g.fillStyle = alpha('#000', 0.3); g.fillRect(-4, 20, 8, 300); seg(g, [[-70, 40], [-92, 260]], 26, '#232b3e'); seg(g, [[70, 40], [92, 260]], 26, '#232b3e');
      g.restore();
    }
  });
  home4Fg(g, t, cam, { view: 'upstairs' });
  const nn = n - 1 + ease.out(prog(t, tWord, tWord + 0.22));
  hand(g, t, nn, { x: 250, y: 1060, s: 2.0, tremble: 0.2 });
  post(g, t);
}
registerShot('s024', { draw(g, t, info) { upstairsDoor(g, t, info, 'MOM', 1, 0.15, 0.48); } });
registerShot('s025', { draw(g, t, info) { upstairsDoor(g, t, info, 'DAD', 2, 0.15, 0.46); } });

// ===================================================================================================
// s026 — "Your brother, on the couch."  the brother asleep under the blanket, the warm floor glow reaching the couch legs and stopping
// exactly at the couch's edge, blades through the cardboard behind; THREE fingers on "brother".
registerShot('s026', { draw(g, t, info) {
  const tBro = 0.4, cam = still(t, info.dur, 1.15, 1.2, -120, 183);
  const H = home4(g, t, cam, { view: 'living', glow: 1, boarded: 1, creep: 0.6 });
  home4Fg(g, t, cam, { view: 'living' });
  hand(g, t, 2 + ease.out(prog(t, tBro, tBro + 0.22)), { x: 250, y: 1080, s: 2.0, tremble: 0.2 });
  post(g, t);
} });

// ===================================================================================================
// s027 — "You."  medium on HERO in the dark living room, warm rim from the door on her right, cold on the left; she touches her chest
// with the counting hand on "You". The space at her left shoulder is darker than the rest of the dark.
registerShot('s027', { draw(g, t, info) {
  const tYou = 0.15, cam = still(t, info.dur, 1.25, 1.3, 120, 40);
  const H = home4(g, t, cam, { view: 'living', glow: 1, boarded: 1, creep: 0.6 });
  layer(g, cam, 1, (g) => {
    const hx = H.CX + 120, gy = H.GY + 60;
    g.save(); g.fillStyle = radGrad(g, hx - 300, gy - 520, 20, 340, ['rgba(0,0,2,.85)', 'rgba(0,0,2,0)']); g.fillRect(hx - 700, gy - 1000, 800, 1000); g.restore();   // the darker space at her shoulder
    const chest = { ...POSES.stand, eF: [30, -150], hF: [12, -158] };
    actor(g, 'HERO', { x: hx, y: gy, s: 2.3, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tYou, chest]], 0.25), t, 7), expr: exprAt(t, [[0, 'scared'], [tYou + 0.3, 'determined']]), blink: blinkFlag(t, 3.3, 7), look: lookToward(0.3, 0.2), rim: H.warmRim, t });
  });
  home4Fg(g, t, cam, { view: 'living' });
  post(g, t);
} });

// ===================================================================================================
// s028 — "Four."  close on the hand, four fingers; the fourth straightens on "Four", then dead still (1 px tremble) for the silence.
// The dust to the left of the hand drifts AROUND an empty space, as if something is standing there.
registerShot('s028', { draw(g, t, info) {
  const tFour = 0.15, z = lerp(1.0, 1.05, ease.inOut(t / info.dur));
  roomDark(g, t, { z: 1.2, x: -100, y: 120 }, 0.72);
  // motes, displaced around an invisible obstacle at (290, 700)
  const R = rng(17), ox = 290, oy = 700, orad = 190;
  for (let i = 0; i < 70; i++) {
    let px = R() * 520, py = 300 + ((R() * 900 - t * (10 + R() * 14)) % 900 + 900) % 900; const dx = px - ox, dy = py - oy, d = Math.hypot(dx, dy);
    if (d < orad) { const k = (orad - d) / orad; px += dx / (d || 1) * orad * k; py += dy / (d || 1) * orad * k * 0.6; }
    circle(g, px, py, 1.5 + R() * 2, alpha(WARM, 0.35 + 0.3 * Math.sin(t * 2 + i) ** 2));
  }
  g.save(); g.translate(E.W / 2, 740); g.scale(z, z); g.translate(-E.W / 2, -740);
  hand(g, t, 3 + ease.out(prog(t, tFour, tFour + 0.25)), { x: 560, y: 740, s: 3.4, tremble: t > tFour + 0.3 ? 0.05 : 0.2 });
  g.restore();
  post(g, t, { vig: 0.75 });
} });

// ===================================================================================================
// s029 — "Five."  the cut lands on the whisper. HERO's face LEFT of centre, a thin warm rim on her far cheek; the RIGHT half of the frame
// is pure black and stays empty. Her eyes slide right into the black without turning her head, pupils shrink; no blink, no breath.
// Then the dead-still hold (only grain). Camera dead still. Hard cut at the end (s030).
registerShot('s029', { draw(g, t, info) {
  g.fillStyle = '#000'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.save(); g.fillStyle = radGrad(g, 300, 760, 40, 520, ['rgba(20,26,44,.55)', 'rgba(0,0,0,0)']); g.fillRect(0, 0, 540, E.H); g.restore();   // only her side has any air
  const focused = { eye: 0.7, pupil: 1, brow: -0.2, tilt: 0.3, smile: -0.2, w: 0.7, look: [0, 0.05] };
  const terrified = { eye: 1.25, pupil: 0.45, brow: 0.8, tilt: -0.7, open: 0.08, smile: -0.45, w: 0.6, sweat: 0.5, look: [0.95, 0] };
  const f = faceAt(t, [[0, focused], [0.25, terrified]], 0.35);
  giantFace(g, 350, 760, 305, { who: 'HERO', f, rimSide: -1, rimColor: WARM, glint: LIGHT, blink: 0, breath: 0 });
  g.save(); const gr = g.createLinearGradient(520, 0, 720, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(520, 0, 200, E.H); g.fillStyle = '#000'; g.fillRect(719, 0, E.W, E.H); g.restore();                     // the right side: nothing, ever
  grain(g, t, 0.07);
} });

// ===================================================================================================
// s030 — hard cut to black + "Follow for the next rule."
registerShot('s030', { draw(g, t, info) {
  endCard(g, t, 'Follow for the next rule.');
  grain(g, t, 0.03);
} });
