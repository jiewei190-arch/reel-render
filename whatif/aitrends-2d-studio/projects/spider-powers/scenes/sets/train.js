// sets/train.js — THE EXERCISE RIG (ep 3 "What If You Trained Every Day for 3 Years?"), built on rig2d / acting.js / actors.js.
// Every exercise is a pure function of t that returns R = { pose, n, since, depth, u, ... } (R.pose goes straight into actor()).
// Local space is the rig's: feet/hands on the floor at y = 0, figure faces +x, base height 240 at s 1.
//
//   pushUp(t, rate, o)       plank on the hands. rate = reps/s (0.6 slow .. 1.4 fast). o: { t0, from, fatigue 0..1 (stall on the way up),
//                            tremble 0..1, sag 0..1 (hips droop), collapse: local time the arms give out (chest hits the floor, count freezes) }
//   kneePushUp(t, rate, o)   same, on the knees (feet crossed in the air)
//   sitUp(t, rate, o)        lying, knees bent, hands behind the head; same fatigue options (collapse = flops back flat)
//   squat(t, rate, o)        deep squat, SLOW lowering (60% of the rep), quick rise, arms forward; o.load 0..1 (backpack) slows the rise
//   runCycle(t, speed, o)    speed = strides/s. o.mode 'walk'|'jog'|'run'|'sprint'|'limp'|'sore', o.fatigue 0..1 (lean, droop, heavy arms)
//                            o.x (+o.s, o.facing) locks the foot phase to world x like walkAlong (no foot sliding): use it whenever x moves.
//                            -> { pose, phase, step (footfall index, changes on every footfall), cycleLen (world units per stride pair) }
//   soreStand(t, o)          day-two soreness: arms hang stiff, shoulders up, tiny wince shakes (o.lift 0..1 = trying to lift the arms)
//   punchPose(t, t0, o)      guard > chamber (wind-up) > punch (contact at t0) > follow-through > back to guard. -> { pose, phase, hit, k }
//   fatigue(pose, t, o)      add tremble / sag / droop to ANY pose ({ tremble, droop, seed })
//
//   trainee(g, who, R, o)    draw an exerciser: long floor shadow + actor + extras. o = actor() opts (x, y, s, facing, expr, blink, look, rim, t)
//                            plus { backpack: 0..1 load, cat: { pose, eyes, s } (Biscuit on the back), sweat: 0..1, breath: puffs/s }.
//                            Returns { head: [x, y, r], mouth: [x, y], back: [x, y], fist: [x, y], hand: [x, y] } in world space.
//   sweat(g, t, head, o)     beads on the brow + drops flying off. head = [x, y, r] (from trainee / headPos). o: { amt, facing, seed, fling }
//   breathPuff(g, t, mouth, o)  huffing puffs from the mouth. o: { rate, facing, s, cold (bigger, whiter) }
//   backpack(g, o)           textbook-stuffed backpack on the hero's back. o = the actor opts + { load 0..1, layer: 'back'|'front' }
//   catOnBack(g, o)          Biscuit riding the hero's back (plank or upright). o = the actor opts + { cat: { pose:'loaf'|'sit', eyes, s, facing } }
//   pillow(g, t, o)          the punching pillow. o: { x, y, s, hit: impact time (or [t1, t2, ...]), dir: 1 = punched from the left, color, sfx }
//                            squashes "flump", wobbles, sheds feathers. -> { x, y, w, h } (world)
//   repCounter(g, n, o)      big gold extruded number that pops on every tick. o: { x, y, size, since (s since the last rep), label, of: 100, color }
//   stopwatch(g, sec, o)     chrome stopwatch: sweeping hand, minute sub-dial, LCD "1:20:00". o: { x, y, r, label, alarm 0..1 }
//   fmtTime(sec)             '1:20:00' | '54:59' | '0:23'
// Deterministic: only t, seeds, noise(); never Math.random.
import { E, clamp, lerp, ease, prog, rng, seg, circle, ring, poly, rr, alpha, shade, mix, glow, text, FONTS, S, noise, linGrad, radGrad } from '/engine/core.js';
import { POSES, blendPose, breathe, headPos } from '/engine/rig2d.js';
import { actor, cat, outfitOf } from './actors.js';

// ---------- small geometry ----------
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (a) => Math.hypot(a[0], a[1]) || 1;
const nrm = (a) => { const l = len(a); return [a[0] / l, a[1] / l]; };
const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const mixPose = (a, b, k) => { const o = {}; for (const key in a) o[key] = lp(a[key], b[key] || a[key], k); return o; };
// two-bone IK (same convention as rig2d): returns the joint between a and b. dir flips the bend side.
function ik(a, b, L1, L2, dir = 1) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; let d = Math.hypot(dx, dy); d = Math.min(d, L1 + L2 - 0.01);
  const ang = Math.atan2(dy, dx) - dir * Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [a[0] + Math.cos(ang) * L1, a[1] + Math.sin(ang) * L1];
}
const ARM1 = 38, ARM2 = 36, TORSO = 74, THIGH = 50, SHIN = 50, NECK = 34;
const scaleOf = (o) => (o.s ?? 1) * (outfitOf(o.who || 'HERO')?.kid ? 0.72 : 1);
const toWorld = (o, p) => { const s = (o.s ?? 1) * (o._kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + p[0] * f * s, o.y + p[1] * s]; };

// ---------- rep clock ----------
// rep phase u: 0 = top/start of the rep, 1 = rep done. n = completed reps (+ o.from). since = s since the last completed rep.
function repClock(t, rate, o = {}) {
  const tt = t - (o.t0 ?? 0), from = o.from ?? 0, col = o.collapse;
  if (tt < 0) return { n: from, u: 0, since: 99, active: false, tt };
  const tc = col != null && tt >= col ? col : tt, ph = tc * rate, n = Math.floor(ph);
  return { n: from + n, u: ph - n, since: (ph - n) / rate + (tc !== tt ? tt - tc : 0), active: true, tt, collapsed: col != null && tt >= col, tCol: col != null ? tt - col : -1 };
}
// lowering takes `down` of the rep, a short hold at the bottom, then the push. fatigue adds a sticking point on the way up.
function repDepth(u, o = {}) {
  const down = o.down ?? 0.5, hold = o.hold ?? 0.07, f = clamp(o.fatigue ?? 0);
  if (u < down) return ease.inOut(u / down);
  if (u < down + hold) return 1;
  let w = (u - down - hold) / (1 - down - hold);
  if (f > 0) { const st = w < 0.3 ? w * 1.4 : w < 0.78 ? 0.42 + (w - 0.3) * 0.25 : 0.54 + (w - 0.78) * 2.09; w = lerp(w, st, f); }
  return 1 - ease.out(clamp(w));
}

// ---------- fatigue: tremble, droop ----------
export function fatigue(p, t, o = {}) {
  const tr = (o.tremble ?? 0) * 2.6, dr = (o.droop ?? 0), sd = o.seed ?? 0, q = {};
  for (const k in p) q[k] = [p[k][0], p[k][1]];
  if (tr > 0) for (const [k, i] of [['eF', 1], ['hF', 2], ['eB', 3], ['hB', 4], ['sh', 5], ['head', 6], ['kF', 7], ['kB', 8]]) {
    const a = k[0] === 'h' && k !== 'head' ? 0.4 : 1;   // hands on the floor barely move; elbows and shoulders shake
    q[k] = [q[k][0] + noise(t * 31 + i * 7, sd + i) * tr * a, q[k][1] + noise(t * 29 + i * 5, sd + i + 20) * tr * a];
  }
  if (dr > 0) q.head = [q.head[0] + 5 * dr, q.head[1] + 7 * dr];
  return q;
}

// ---------- push-ups ----------
// plank with the shoulders h above the floor (top ~68, bottom ~26, flat 15). Hands under the shoulders, body straight to the feet.
function plank(h, sag = 0, knees = false) {
  const sh = [70, -h], hand = [74, 0];
  let hip, kF, fF, kB, fB;
  if (!knees) {
    const L = TORSO + THIGH + SHIN, fx = sh[0] - Math.sqrt(Math.max(1, L * L - h * h));
    fF = [fx, 0]; fB = [fx - 8, 0];
    hip = add(lp(sh, fF, TORSO / L), [0, sag * 20]);
    kF = add(lp(hip, fF, 0.5), [0, 2 + sag * 4]); kB = add(kF, [-6, 0]);
  } else {
    const L = TORSO + THIGH, kx = sh[0] - Math.sqrt(Math.max(1, L * L - h * h));
    kF = [kx, -6]; kB = [kx - 6, -6];
    hip = add(lp(sh, kF, TORSO / L), [0, sag * 14]);
    fF = [kx - 34, -40]; fB = [kx - 44, -30];                    // shins up, feet crossed in the air
  }
  const d = nrm(sub(sh, hip)), up = [d[1], -d[0]];               // up = the back side of the torso
  const head = add(add(sh, d, NECK * 0.82), up, 12 - h * 0.05);
  const eF = ik(sh, hand, ARM1, ARM2, -1), hB = [hand[0] - 10, 0], eB = ik(add(sh, [-6, 2]), hB, ARM1, ARM2, -1);
  return { head, sh, hip, eF, hF: hand, eB, hB, kF, fF, kB, fB };
}
function pushCore(t, rate, o, knees) {
  const C = repClock(t, rate, o), top = knees ? 66 : 68, bot = knees ? 24 : 26, sag = clamp(o.sag ?? 0);
  let depth = C.active ? repDepth(C.u, { down: 0.5, fatigue: o.fatigue }) : 0;
  let h = lerp(top, bot, depth), pose;
  if (C.collapsed) {                                             // arms give out: drop to the floor with a little bounce, face to the side
    const k = C.tCol, d0 = repDepth(C.u, { down: 0.5, fatigue: o.fatigue }), h0 = lerp(top, bot, d0);
    const drop = ease.in(clamp(k / 0.2)), bounce = k > 0.2 ? Math.exp(-(k - 0.2) * 9) * Math.sin((k - 0.2) * 30) * 4 : 0;
    h = lerp(h0, 15, drop) - bounce; depth = 1;
    pose = plank(h, lerp(sag, 1, drop), knees);
    pose.eF = lp(pose.eF, [pose.sh[0] + 30, -10], drop); pose.hF = lp(pose.hF, [pose.sh[0] + 54, -3], drop);   // arms splay out
    pose.head = add(pose.head, [6 * drop, 6 * drop]);
  } else pose = plank(h, sag * (0.5 + 0.5 * depth), knees);
  pose = fatigue(pose, t, { tremble: (o.tremble ?? 0) * (C.collapsed ? 0.3 : 1), seed: o.seed ?? 1 });
  return { pose, n: C.n, since: C.since, depth, u: C.u, collapsed: !!C.collapsed, tCol: C.tCol, h, shadow: [knees ? -10 : -10, knees ? 72 : 96] };
}
export const pushUp = (t, rate = 0.9, o = {}) => pushCore(t, rate, o, false);
export const kneePushUp = (t, rate = 0.9, o = {}) => pushCore(t, rate, o, true);

// ---------- sit-ups ----------
function situpPose(k) {                                          // k 0 = flat on the back, 1 = chest to the knees
  const hip = [0, -13], fF = [78, 0], fB = [70, 0];
  const kF = ik(hip, fF, THIGH, SHIN, 1), kB = ik(add(hip, [-4, 0]), fB, THIGH, SHIN, 1);
  const phi = lerp(Math.PI * 0.985, Math.PI * 0.4, k), d = [Math.cos(phi), -Math.sin(phi)];
  const sh = add(hip, d, TORSO), n = [-d[1], d[0]];              // n = belly side
  const head = add(add(sh, d, NECK), n, 3);
  const eF = add(add(sh, d, 20), n, 26), hF = add(head, n, -15), eB = add(add(sh, d, 16), n, -20), hB = add(head, n, -12);
  return { head, sh, hip, eF, hF, eB, hB, kF, fF, kB, fB };
}
export function sitUp(t, rate = 0.7, o = {}) {
  const C = repClock(t, rate, o);
  // the effort is the curl UP (first half), then lowering back: invert the generic depth (0 = up)
  let k = C.active ? repDepth(C.u, { down: 0.45, hold: 0.08, fatigue: 0 }) : 0;
  const f = clamp(o.fatigue ?? 0);
  if (f > 0 && C.active && C.u < 0.45) { const w = C.u / 0.45; k = ease.inOut(lerp(w, w < 0.5 ? w * 1.3 : 0.65 + (w - 0.5) * 0.7, f)); }
  let pose;
  if (C.collapsed) { const k0 = k, drop = ease.in(clamp(C.tCol / 0.25)); k = lerp(k0, -0.02, drop); pose = situpPose(Math.max(0, k)); pose.hF = lp(pose.hF, add(pose.sh, [-30, -2]), drop); pose.eF = lp(pose.eF, add(pose.sh, [-10, -26]), drop); }
  else pose = situpPose(k);
  pose = fatigue(pose, t, { tremble: o.tremble ?? 0, seed: o.seed ?? 2 });
  return { pose, n: C.n, since: C.since, depth: k, u: C.u, collapsed: !!C.collapsed, tCol: C.tCol, shadow: [10, 92] };
}

// ---------- squats ----------
const SQ = {
  deep: { head: [52, -143], sh: [34, -113], hip: [-8, -52], eF: [70, -118], hF: [106, -122], eB: [66, -112], hB: [100, -116], kF: [40, -38], fF: [8, 0], kB: [26, -40], fB: [-6, 0] },
  top:  { head: [6, -208], sh: [2, -174], hip: [0, -100], eF: [24, -146], hF: [44, -140], eB: [20, -144], hB: [40, -138], kF: [8, -50], fF: [8, 0], kB: [-4, -50], fB: [-6, 0] },
};
export function squat(t, rate = 0.5, o = {}) {
  const C = repClock(t, rate, o), load = clamp(o.load ?? 0);
  const depth = C.active ? repDepth(C.u, { down: 0.6, hold: 0.06, fatigue: Math.max(o.fatigue ?? 0, load * 0.6) }) : 0;
  let pose = mixPose(SQ.top, SQ.deep, depth);
  if (load > 0) { pose.sh = add(pose.sh, [6 * load, 4 * load]); pose.head = add(pose.head, [8 * load, 6 * load]); }   // the pack pulls the chest forward
  pose = breathe(pose, t, 0.6, o.seed ?? 3);
  pose = fatigue(pose, t, { tremble: (o.tremble ?? 0) * (0.4 + depth), seed: o.seed ?? 3 });
  return { pose, n: C.n, since: C.since, depth, u: C.u, collapsed: false, shadow: [6, 44] };
}

// ---------- run / walk cycles ----------
const GAIT = {
  walk:   { stride: 26, lift: 12, bob: 3, arm: 16, lean: 2, run: false },
  sore:   { stride: 14, lift: 4,  bob: 2, arm: 3,  lean: 3, run: false },
  limp:   { stride: 22, lift: 10, bob: 3, arm: 12, lean: 4, run: false },
  jog:    { stride: 34, lift: 22, bob: 5, arm: 22, lean: 8, run: true },
  run:    { stride: 46, lift: 34, bob: 7, arm: 30, lean: 14, run: true },
  sprint: { stride: 54, lift: 44, bob: 8, arm: 36, lean: 20, run: true },
};
export const gaitLen = (mode = 'jog', s = 1) => 4 * (GAIT[mode] || GAIT.jog).stride * s;     // world units per stride pair (two footfalls)
function gaitPose(phase, G, fat, mode) {
  let ph = phase;
  if (mode === 'limp') ph = phase + 0.45 * Math.sin(phase);     // short stance on the bad (near) leg
  const st = G.stride, li = G.lift, bb = G.bob * (1 + fat * 0.6), ar = G.arm * (1 - fat * 0.45), le = G.lean + fat * 10;
  let hipY = -100 + (G.run ? 6 : 0) - bb * (1 - Math.abs(Math.sin(ph))) + bb * 0.5;
  if (mode === 'limp') hipY += 7 * Math.max(0, Math.sin(phase));
  const hip = [0, hipY], sh = [le, hipY - TORSO], head = [le + 4 + fat * 4, hipY - 108 + fat * 7];
  const foot = (p) => [st * Math.sin(p), -li * Math.max(0, Math.cos(p))];
  const fF = foot(ph), fB = foot(ph + Math.PI);
  const kF = ik(hip, fF, THIGH + 2, SHIN + 2, 1), kB = ik(hip, fB, THIGH + 2, SHIN + 2, 1);
  const hand = (p) => G.run ? [le + ar * Math.sin(p) * 0.9 + 6, hipY - 46 + fat * 14 - Math.cos(p) * 10] : [le * 0.5 - ar * Math.sin(p) + 4 + (mode === 'sore' ? 4 : 0), hipY - 2 + (mode === 'sore' ? 4 : 0)];
  const hF = hand(ph + Math.PI), hB = hand(ph);
  const elbow = (h) => G.run ? [lerp(sh[0], h[0], 0.5) - 14, lerp(sh[1], h[1], 0.5) + 6] : [lerp(sh[0], h[0], 0.5) - 3 + (mode === 'sore' ? 3 : 0), sh[1] + 38];
  return { head, sh, hip, eF: elbow(hF), hF, eB: elbow(hB), hB, kF, fF, kB, fB };
}
export function runCycle(t, speed = 1.4, o = {}) {
  const mode = o.mode || 'jog', G = GAIT[mode] || GAIT.jog, fat = clamp(o.fatigue ?? 0);
  let phase;
  if (o.x != null) { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; phase = (o.x * f) / (4 * G.stride * s) * Math.PI * 2; }
  else phase = t * speed * Math.PI * 2;
  let pose = gaitPose(phase, G, fat, mode);
  if (mode === 'sore') pose = fatigue(pose, t, { tremble: 0.35, seed: 7 });
  return { pose, phase, step: Math.floor(phase / Math.PI), cycleLen: 4 * G.stride, mode };
}

// ---------- day-two soreness ----------
const SORE = { head: [6, -200], sh: [0, -170], hip: [0, -100], eF: [8, -134], hF: [12, -98], eB: [-6, -134], hB: [-8, -98], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] };
const SORE_LIFT = { head: [10, -198], sh: [2, -168], hip: [0, -100], eF: [24, -150], hF: [30, -176], eB: [-6, -134], hB: [-8, -98], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] };
export function soreStand(t, o = {}) {
  const lift = clamp(o.lift ?? 0), shake = 0.25 + 0.75 * lift;
  let p = mixPose(SORE, SORE_LIFT, ease.inOut(lift));
  p = breathe(p, t, 0.5, o.seed ?? 4);
  return fatigue(p, t, { tremble: shake, seed: o.seed ?? 4 });
}

// ---------- punch ----------
const PUNCH = {
  guard:   { head: [10, -204], sh: [4, -172], hip: [0, -98], eF: [28, -148], hF: [36, -176], eB: [22, -146], hB: [30, -170], kF: [22, -50], fF: [30, 0], kB: [-14, -50], fB: [-28, 0] },
  chamber: { head: [0, -200], sh: [-6, -168], hip: [-4, -94], eF: [-24, -130], hF: [-6, -120], eB: [24, -150], hB: [38, -172], kF: [24, -46], fF: [32, 0], kB: [-18, -46], fB: [-30, 0] },
  punch:   { head: [24, -198], sh: [16, -168], hip: [4, -96], eF: [53, -166], hF: [89, -166], eB: [8, -138], hB: [-6, -122], kF: [42, -46], fF: [50, 0], kB: [-20, -48], fB: [-42, 0] },
};
export { PUNCH as PUNCH_POSES };
export function punchPose(t, t0, o = {}) {
  const wind = o.wind ?? 0.42, strike = o.strike ?? 0.07, fol = o.follow ?? 0.32, rec = o.recover ?? 0.5;
  const tw = t0 - strike - wind, ts = t0 - strike, tr = t0 + fol;
  let pose, phase;
  if (t < tw) { pose = breathe(PUNCH.guard, t, 1, o.seed ?? 5); phase = 'guard'; }
  else if (t < ts) { const k = ease.inOut(prog(t, tw, ts)); pose = mixPose(PUNCH.guard, PUNCH.chamber, k); phase = 'wind'; }
  else if (t < t0) { const k = ease.in(prog(t, ts, t0)); pose = mixPose(PUNCH.chamber, PUNCH.punch, k); phase = 'strike'; }
  else if (t < tr) { const u = t - t0, ov = Math.exp(-u * 14) * Math.sin(u * 40) * 0.06; pose = mixPose(PUNCH.punch, PUNCH.chamber, -ov); phase = 'follow'; }
  else { const k = ease.inOut(prog(t, tr, tr + rec)); pose = breathe(mixPose(PUNCH.punch, PUNCH.guard, k), t, k, o.seed ?? 5); phase = k < 1 ? 'recover' : 'guard'; }
  return { pose, phase, hit: t >= t0 && t < t0 + 1 / 24 + 1e-3, k: t - t0 };
}

// =====================================================================================================
// DRAWING
// =====================================================================================================
const local = (g, o) => { const s = (o.s ?? 1) * (o._kid ? 0.72 : 1), f = o.facing ?? 1; g.translate(o.x, o.y); g.scale(f * s, s); };

export function trainee(g, who, R, o = {}) {
  const of = outfitOf(who), kid = !!of.kid, base = { ...o, _kid: kid, pose: R.pose };
  const s = (o.s ?? 1) * (kid ? 0.72 : 1), f = o.facing ?? 1, p = R.pose;
  // long contact shadow under the whole body (exercises are wide, the rig's own shadow is a small oval)
  if (o.shadow !== false) {
    const [cx, rx] = R.shadow || [0, 40];
    g.save(); g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(o.x + cx * f * s, o.y + 2, rx * s, 7 * s, 0, 0, 7); g.fill(); g.restore();
  }
  if (o.backpack != null) backpack(g, { ...base, load: o.backpack, layer: 'back' });
  actor(g, who, { ...o, pose: p, shadow: false });
  if (o.backpack != null) backpack(g, { ...base, load: o.backpack, layer: 'front' });
  if (o.cat) catOnBack(g, { ...base, cat: o.cat });
  const head = headPos({ x: o.x, y: o.y, s: o.s, facing: f, pose: p, outfit: of });
  const mouth = [head[0] + f * head[2] * 0.62, head[1] + head[2] * 0.42];
  if (o.sweat) sweat(g, o.t ?? 0, head, { amt: o.sweat, facing: f, seed: o.seed ?? 1 });
  if (o.breath) breathPuff(g, o.t ?? 0, mouth, { rate: o.breath, facing: f, s, cold: o.cold });
  return { head, mouth, back: toWorld(base, backPoint(p)), fist: toWorld(base, p.hF), hand: toWorld(base, p.hF) };
}

// a point on the BACK of the torso (opposite the belly), mid-way between hips and shoulders
function backPoint(p, k = 0.5, off = 9) { const d = nrm(sub(p.sh, p.hip)), back = [d[1], -d[0]]; return add(lp(p.hip, p.sh, k), back, off); }

// ---------- sweat + breath ----------
function drop(g, x, y, r, a, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a;
  g.fillStyle = '#bfe6ff'; g.beginPath(); g.moveTo(0, -r * 1.9); g.bezierCurveTo(r * 0.9, -r * 0.6, r, r * 0.2, 0, r); g.bezierCurveTo(-r, r * 0.2, -r * 0.9, -r * 0.6, 0, -r * 1.9); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.1, r * 0.22, r * 0.35, -0.3, 0, 7); g.fill();
  g.strokeStyle = 'rgba(40,90,140,.55)'; g.lineWidth = Math.max(1, r * 0.18); g.stroke();
  g.restore();
}
export function sweat(g, t, head, o = {}) {
  const amt = clamp(o.amt ?? 1), f = o.facing ?? 1, [hx, hy, hr] = head, R = rng(o.seed ?? 1);
  if (amt <= 0) return;
  // beads on the brow / temple that slowly slide
  const beads = Math.round(1 + amt * 3);
  for (let i = 0; i < beads; i++) {
    const a = -1.2 + R() * 1.4, per = 1.6 + R() * 1.4, ph = (t / per + R()) % 1, slide = ease.in(ph) * hr * 0.5;
    const x = hx + f * Math.cos(a) * hr * 0.98, y = hy + Math.sin(a) * hr * 0.98 + slide;
    drop(g, x, y, hr * 0.13 * (0.8 + R() * 0.4), (1 - Math.max(0, ph - 0.85) / 0.15));
  }
  // drops flung off the head (arc + gravity)
  const fl = Math.round(amt * (o.fling ?? 4));
  for (let i = 0; i < fl; i++) {
    const per = 0.7 + R() * 0.6, off = R(), u = ((t / per + off) % 1), side = R() < 0.5 ? -1 : 1;
    const vx = side * (90 + R() * 120) * (hr / 48), vy = -(120 + R() * 90) * (hr / 48), tt = u * per;
    const x = hx + side * hr * 0.8 + vx * tt, y = hy - hr * 0.4 + vy * tt + 420 * (hr / 48) * tt * tt;
    drop(g, x, y, hr * 0.1, 1 - u, Math.atan2(vy + 840 * (hr / 48) * tt, vx) - Math.PI / 2);
  }
}
export function breathPuff(g, t, mouth, o = {}) {
  const rate = o.rate ?? 1.2, f = o.facing ?? 1, s = o.s ?? 1.9, cold = !!o.cold, life = cold ? 1.6 : 0.9;
  const per = 1 / Math.max(0.1, rate), n = Math.ceil(life / per) + 1, base = Math.floor(t / per);
  for (let i = 0; i < n; i++) {
    const k = base - i, age = t - k * per; if (age < 0 || age > life) continue;
    const u = age / life, R = rng(1000 + k), x = mouth[0] + f * (8 + 70 * ease.out(u)) * s * 0.5, y = mouth[1] - 14 * u * s * 0.5 + (R() - 0.5) * 6;
    const r = (6 + 18 * ease.out(u)) * s * 0.5 * (cold ? 1.5 : 1), a = (cold ? 0.55 : 0.42) * (1 - u) * Math.min(1, age / 0.06);
    g.save(); g.globalAlpha *= a; g.fillStyle = '#f2f6ff';
    for (const [dx, dy, rr2] of [[0, 0, 1], [0.6, -0.35, 0.7], [0.55, 0.35, 0.6], [-0.4, 0.1, 0.55]]) { g.beginPath(); g.arc(x + f * dx * r, y + dy * r, r * rr2, 0, 7); g.fill(); }
    g.restore();
  }
}

// ---------- backpack full of textbooks ----------
const BOOKS = ['#c23b3b', '#2f6fd0', '#e0b13a', '#3a8a5a', '#8a4fc8', '#e07a3a'];
export function backpack(g, o = {}) {
  const p = o.pose || POSES.stand, load = clamp(o.load ?? 1), d = nrm(sub(p.sh, p.hip)), back = [d[1], -d[0]];
  const ang = Math.atan2(d[1], d[0]) + Math.PI / 2;                // rotation that maps local "up" (-y) onto the torso direction
  const c = add(lp(p.hip, p.sh, 0.52), back, 15 + load * 6);
  const bag = '#3b4a6b', bagD = shade(bag, -0.35), w = 40 + load * 10, h = 66 + load * 6;
  g.save(); local(g, o);
  if (o.layer === 'front') {                                        // shoulder strap over the near shoulder + chest clip
    seg(g, [add(p.sh, back, 4), add(p.sh, [-d[1] * -10, d[0] * -10], 0), add(lp(p.hip, p.sh, 0.38), back, -10)], 7, shade(bagD, -0.2));
    seg(g, [add(p.sh, back, 4), add(lp(p.hip, p.sh, 0.38), back, -10)], 4.5, '#4a5a7e');
    g.restore(); return;
  }
  g.translate(c[0], c[1]); g.rotate(ang);
  // books sticking out of the top (rotated a little each, colourful spines)
  const R = rng(17), nb = 3 + Math.round(load * 2);
  for (let i = 0; i < nb; i++) {
    const bx = -w / 2 + 6 + i * (w - 12) / Math.max(1, nb - 1) - 6, bw = 10 + R() * 5, bh = 22 + R() * 14 + load * 6, rot = (R() - 0.5) * 0.4;
    g.save(); g.translate(bx + bw / 2, -h / 2 + 4); g.rotate(rot);
    rr(g, -bw / 2, -bh, bw, bh + 6, 2); g.fillStyle = BOOKS[i % BOOKS.length]; g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-bw / 2 + 2, -bh + 5, bw - 4, 2.5); g.fillRect(-bw / 2 + 2, -bh + 10, bw - 4, 1.5);
    g.fillStyle = '#f4efe2'; g.fillRect(bw / 2 - 2.5, -bh + 2, 2, bh);        // page edge
    g.restore();
  }
  // bag body (bulges with the load), zip under strain, front pocket, top handle
  const bulge = 6 + load * 8;
  g.fillStyle = bag; g.beginPath(); g.moveTo(-w / 2, -h / 2 + 8); g.quadraticCurveTo(-w / 2 - bulge, 0, -w / 2 + 2, h / 2);
  g.lineTo(w / 2 - 2, h / 2); g.quadraticCurveTo(w / 2 + bulge * 0.4, 0, w / 2, -h / 2 + 8); g.quadraticCurveTo(0, -h / 2 - 4, -w / 2, -h / 2 + 8); g.fill();
  g.fillStyle = alpha('#ffffff', 0.12); g.beginPath(); g.ellipse(-w * 0.18, -h * 0.12, w * 0.18, h * 0.3, 0, 0, 7); g.fill();
  rr(g, -w / 2 + 6, h * 0.08, w - 12, h * 0.34, 7); g.fillStyle = bagD; g.fill();
  seg(g, [[-w / 2 + 9, h * 0.1 + 3], [w / 2 - 9, h * 0.1 + 3]], 2, '#c9d0de');
  seg(g, [[-w / 2 + 4, -h / 2 + 12], [w / 2 - 4, -h / 2 + 12]], 2.4, load > 0.5 ? '#e6c25a' : '#c9d0de');   // the zip, gold when straining
  seg(g, [[-8, -h / 2 + 2], [0, -h / 2 - 8], [8, -h / 2 + 2]], 4, bagD);
  g.restore();
}

// ---------- Biscuit riding the hero's back ----------
export function catOnBack(g, o = {}) {
  const p = o.pose || POSES.stand, C = o.cat || {}, d = nrm(sub(p.sh, p.hip));
  const spot = backPoint(p, C.at ?? 0.5, 13), tilt = Math.atan2(d[1], d[0]);
  const horiz = Math.abs(d[0]) > 0.6;                               // plank: sit on top of the back; upright: cling to the shoulders
  g.save(); local(g, o);
  g.translate(spot[0], spot[1]);
  if (horiz) g.rotate(tilt * 0.75 + (d[0] < 0 ? Math.PI : 0)); else g.rotate(tilt + Math.PI / 2 - 0.25);
  const sc = C.s ?? 0.55;
  cat(g, { x: 0, y: 2, s: sc, facing: C.facing ?? -1, pose: C.pose || 'loaf', eyes: C.eyes || 'auto', t: o.t ?? 0, rim: o.rim, shadow: false });
  g.restore();
}

// ---------- the punching pillow ----------
export function pillow(g, t, o = {}) {
  const x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, s = o.s ?? 1.9, dir = o.dir ?? 1, col = o.color || '#e8e2f2';
  const hits = o.hit == null ? [] : Array.isArray(o.hit) ? o.hit : [o.hit];
  let last = null; for (const h of hits) if (t >= h) last = h;
  const u = last == null ? 99 : t - last;
  const sq = u < 2 ? Math.exp(-u * 6) * Math.cos(u * 19) : 0;       // squash spring
  const sx = 1 - 0.32 * sq, sy = 1 + 0.26 * sq, dent = u < 2 ? Math.max(0, Math.exp(-u * 5)) : 0, idle = Math.sin(t * 2) * 0.01;
  const W = 92 * s * sx, H = 62 * s * (sy + idle);
  g.save(); g.translate(x, y);
  g.save(); g.translate(dir * 10 * s * sq, 0); g.rotate(-dir * 0.06 * sq);
  // puffy body: four pinched corners + bulging sides; dent on the punched side
  const P = (px, py) => [px * W, py * H];
  const path = () => {
    g.beginPath(); const c = 0.08;
    g.moveTo(...P(-0.5, -0.5));
    g.quadraticCurveTo(...P(0, -0.5 - c), ...P(0.5, -0.5));
    g.quadraticCurveTo(...P(0.5 + c - (dir < 0 ? dent * 0.2 : 0), 0), ...P(0.5, 0.5));
    g.quadraticCurveTo(...P(0, 0.5 + c), ...P(-0.5, 0.5));
    g.quadraticCurveTo(...P(-0.5 - c + (dir > 0 ? dent * 0.24 : 0), 0), ...P(-0.5, -0.5));
    g.closePath();
  };
  g.fillStyle = 'rgba(0,0,0,.25)'; g.save(); g.translate(6 * s, 8 * s); path(); g.fill(); g.restore();
  if (o.rim) { g.save(); g.translate(o.rim.dir[0] * 4, o.rim.dir[1] * 4); g.scale(1.03, 1.04); path(); g.fillStyle = o.rim.color; g.fill(); g.restore(); }
  path(); g.fillStyle = linGrad(g, 0, -H / 2, 0, H / 2, [shade(col, 0.15), col, shade(col, -0.22)]); g.fill();
  g.save(); path(); g.clip();
  g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.ellipse(-W * 0.12, -H * 0.18, W * 0.3, H * 0.16, -0.1, 0, 7); g.fill();
  if (dent > 0.02) { g.fillStyle = alpha('#2a1f3a', 0.3 * dent); g.beginPath(); g.ellipse(-dir * W * 0.36, 0, W * 0.16 * dent, H * 0.3 * dent, 0, 0, 7); g.fill(); }
  g.strokeStyle = alpha(shade(col, -0.35), 0.6); g.lineWidth = 2 * s; g.setLineDash([5 * s, 4 * s]); path(); g.stroke(); g.setLineDash([]);
  g.restore();
  // corner tufts
  for (const [cx, cy] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) { circle(g, cx * W, cy * H, 4 * s, shade(col, -0.1)); }
  g.restore();
  // feathers burst on each hit (drift down, rock side to side)
  for (const h of hits) {
    const v = t - h; if (v < 0 || v > 2.4) continue;
    const R = rng(Math.round(h * 100) + 7);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (R() - 0.5) * 2.6, sp = (120 + R() * 220) * s / 1.9, k = 1 - Math.exp(-v * 4);
      const fx = Math.cos(a) * sp * k * 0.6 + Math.sin(v * 5 + i) * 10 * s / 1.9 + dir * 30 * k, fy = Math.sin(a) * sp * k * 0.5 + 40 * v * v * s / 1.9;
      const al = 1 - prog(v, 1.4, 2.4);
      g.save(); g.translate(fx, fy); g.rotate(Math.sin(v * 6 + i * 2) * 0.8 + i); g.globalAlpha *= al;
      g.fillStyle = '#f6f2ff'; g.beginPath(); g.ellipse(0, 0, 9 * s / 1.9 * 1.4, 3.4 * s / 1.9 * 1.4, 0, 0, 7); g.fill();
      seg(g, [[-12 * s / 1.9, 0], [12 * s / 1.9, 0]], 1.2, 'rgba(120,110,140,.7)');
      g.restore();
    }
  }
  // impact lines + "FLUMP"
  if (u < 0.6) {
    const a = 1 - u / 0.6, R = rng(41);
    g.save(); g.globalAlpha *= a;
    for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2 + R() * 0.3, r0 = W * 0.65 + u * 160, r1 = r0 + 30 + R() * 50; seg(g, [[Math.cos(an) * r0, Math.sin(an) * r0 * 0.75], [Math.cos(an) * r1, Math.sin(an) * r1 * 0.75]], 4, '#fff6dc'); }
    g.restore();
    if (o.sfx !== false) {
      const k = ease.outBack ? ease.outBack(clamp(u / 0.18)) : ease.out(clamp(u / 0.18));
      g.save(); g.translate(dir * W * 0.2, -H * 0.95); g.rotate(-0.12 * dir); g.scale(k, k); g.globalAlpha *= clamp(a * 1.6);
      text(g, o.sfx || 'FLUMP', 0, 0, { size: 30 * s, color: '#ffd45a', stroke: 10, strokeColor: '#2a1630', spacing: 2 });
      g.restore();
    }
  }
  g.restore();
  return { x, y, w: W, h: H };
}

// ---------- rep counter ----------
const fmtN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export function repCounter(g, n, o = {}) {
  const x = o.x ?? E.W - 230, y = o.y ?? 190, size = o.size ?? 150, since = o.since ?? 99, gold = o.color || S().ui?.gold || '#ffc66e';
  const pop = 1 + 0.32 * Math.exp(-since * 9) * (since < 2 ? 1 : 0), str = fmtN(n);
  g.save(); g.translate(x, y);
  glow(g, 0, 0, size * 1.1, gold, 0.18 + 0.25 * Math.exp(-since * 6));
  if (o.label) text(g, o.label, 0, -size * 0.78, { size: size * 0.24, color: '#f4efe6', stroke: 7, strokeColor: '#140f1c', spacing: 3, font: FONTS.ui, weight: 900 });
  g.save(); g.scale(pop, pop);
  for (let i = 7; i >= 1; i--) text(g, str, i * 1.4, i * 1.8, { size, color: shade(gold, -0.55), stroke: 0 });   // extrusion
  text(g, str, 0, 0, { size, color: gold, stroke: 14, strokeColor: '#140f1c' });
  text(g, str, 0, 0, { size, color: gold, glow: 18, glowColor: alpha(gold, 0.8) });
  g.restore();
  if (o.of) text(g, '/ ' + fmtN(o.of), size * 0.22 + (str.length * size * 0.29), size * 0.3, { size: size * 0.3, color: '#f4efe6', stroke: 7, strokeColor: '#140f1c', align: 'left', font: FONTS.ui, weight: 900 });
  if (since < 0.6) { const k = since / 0.6; text(g, '+1', size * 0.55, -size * 0.5 - k * 40, { size: size * 0.26, color: gold, alpha: 1 - k, stroke: 6, strokeColor: '#140f1c' }); }
  g.restore();
}

// ---------- stopwatch ----------
export function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60, p2 = (v) => String(v).padStart(2, '0');
  return h ? `${h}:${p2(m)}:${p2(ss)}` : `${m}:${p2(ss)}`;
}
export function stopwatch(g, sec, o = {}) {
  const x = o.x ?? 230, y = o.y ?? 220, r = o.r ?? 120, gold = S().ui?.gold || '#ffc66e', alarm = clamp(o.alarm ?? 0);
  const red = '#e04a3a', ink = '#16121e', shake = alarm ? Math.sin(sec * 60) * 3 * alarm : 0;
  g.save(); g.translate(x + shake, y); g.rotate(o.rot ?? 0);
  glow(g, 0, 0, r * 1.7, alarm ? red : gold, 0.16 + 0.25 * alarm);
  // crown + side button + lanyard ring
  rr(g, -r * 0.13, -r * 1.32, r * 0.26, r * 0.2, r * 0.05); g.fillStyle = '#c9ced8'; g.fill();
  rr(g, -r * 0.08, -r * 1.16, r * 0.16, r * 0.14, r * 0.03); g.fillStyle = '#9aa0ac'; g.fill();
  ring(g, 0, -r * 1.38, r * 0.12, r * 0.05, '#9aa0ac');
  g.save(); g.rotate(0.75); rr(g, -r * 0.08, -r * 1.2, r * 0.16, r * 0.18, r * 0.03); g.fillStyle = '#b4bac6'; g.fill(); g.restore();
  // case + bezel
  circle(g, 0, 0, r * 1.08, '#0c0a12');
  g.fillStyle = linGrad(g, -r, -r, r, r, ['#f2f4f8', '#9aa2b0', '#5c6474', '#d6dbe4']); g.beginPath(); g.arc(0, 0, r * 1.04, 0, 7); g.fill();
  circle(g, 0, 0, r * 0.9, '#f6f3ea');
  g.fillStyle = radGrad(g, -r * 0.3, -r * 0.4, 0, r, ['rgba(255,255,255,.0)', 'rgba(0,0,0,.08)']); g.beginPath(); g.arc(0, 0, r * 0.9, 0, 7); g.fill();
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 - Math.PI / 2, big = i % 5 === 0, r0 = r * (big ? 0.74 : 0.8); seg(g, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86]], big ? r * 0.035 : r * 0.015, ink, 'butt'); }
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; text(g, String(i * 5), Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, { size: r * 0.12, color: ink, font: FONTS.ui, weight: 800 }); }
  // minute sub-dial (top) + LCD (bottom)
  const mdx = 0, mdy = -r * 0.3, mr = r * 0.17;
  circle(g, mdx, mdy, mr, '#e9e4d6'); ring(g, mdx, mdy, mr, r * 0.015, ink);
  const ma = ((sec / 60) % 30) / 30 * Math.PI * 2 - Math.PI / 2; seg(g, [[mdx, mdy], [mdx + Math.cos(ma) * mr * 0.85, mdy + Math.sin(ma) * mr * 0.85]], r * 0.025, ink);
  rr(g, -r * 0.42, r * 0.2, r * 0.84, r * 0.3, r * 0.06); g.fillStyle = '#1c2a22'; g.fill();
  text(g, fmtTime(sec), 0, r * 0.355, { size: r * 0.22, color: alarm ? '#ff8a7a' : '#a8ffb8', font: FONTS.ui, weight: 900, glow: 8, glowColor: 'rgba(120,255,160,.7)' });
  // red sweep hand
  const sa = (sec % 60) / 60 * Math.PI * 2 - Math.PI / 2;
  seg(g, [[-Math.cos(sa) * r * 0.16, -Math.sin(sa) * r * 0.16], [Math.cos(sa) * r * 0.82, Math.sin(sa) * r * 0.82]], r * 0.03, red);
  circle(g, 0, 0, r * 0.06, red); circle(g, 0, 0, r * 0.025, '#fff');
  // glass glint
  g.save(); g.globalAlpha *= 0.35; g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.05; g.beginPath(); g.arc(0, 0, r * 0.78, Math.PI * 1.1, Math.PI * 1.4); g.stroke(); g.restore();
  if (alarm) for (let i = 0; i < 3; i++) { const a = -Math.PI * 0.75 + i * 0.25, k = (sec * 2 + i * 0.3) % 1; g.save(); g.globalAlpha *= alarm * (1 - k); seg(g, [[Math.cos(a) * r * (1.2 + k * 0.3), Math.sin(a) * r * (1.2 + k * 0.3)], [Math.cos(a) * r * (1.4 + k * 0.3), Math.sin(a) * r * (1.4 + k * 0.3)]], r * 0.05, red); g.restore(); }
  g.restore();
  if (o.label) text(g, o.label, x, y + r * 1.35, { size: Math.max(36, r * 0.3), color: gold, stroke: 9, strokeColor: '#140f1c', font: FONTS.title });
}
