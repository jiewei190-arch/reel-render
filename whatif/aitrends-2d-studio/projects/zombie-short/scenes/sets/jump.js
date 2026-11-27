// sets/jump.js — THE JUMP RIG (ep 2 "What If Every Day, Your Jump Doubled?"), built on acting.js / actors.js.
// Jump grammar: crouch (anticipation) > launch (stretch + dust ring) > rise (motion trail) > apex (hang, hoodie flutter)
//               > fall (speed lines, wind) > landing (impact frame, shake, dust | splash | boing | puff | soft) > recover.
//
//   const J = jumpPose(t, t0, height, { up, hang, down, crouch, landing: 'thud', recover: 'stand' | 'wince' | 'stumble' })
//       t0 = take-off (feet leave the ground). height in world units (240 = one rig height at s 1). Returns
//       { pose, lift, sx, sy, phase, k, v, dir, flutter, times: { tc, t0, tA, tB, tL, tEnd }, impact, landed }
//   jumper(g, 'HERO', J, { x, gy, s, facing, expr, blink, look, rim, t })   draws the figure: squash/stretch, ground shadow,
//       motion trail, hoodie flutter, speed lines. Returns { x, y, head: [x, y] } (world).
//   jumpFX(g, t, J, { x, gy, s, landing })   launch dust ring + the landing variant at J.times.tL (draw on the character layer)
//   impactFrame(g, t, tL, { x, y })   2-frame manga impact flash (screen space, after everything)
//   jumpShake(t, tL, amp)   -> [dx, dy] decaying camera shake from the landing
//   jumpCam(t, t0, height, o)   follow cam with a slight lag on the way up + landing shake: { z, x, y, r }
//   jumpTimes(t0, height, o)   the timeline alone (schedule SFX / words / devices against it)
// Everything is deterministic (t only, rng(seed)).
import { E, clamp, lerp, ease, prog, rng, seg, circle, poly, alpha, shade, mix, glow, text, FONTS, S, noise } from '/engine/core.js';
import { POSES, blendPose, breathe } from '/engine/rig2d.js';
import { actor, outfitOf } from './actors.js';

// ---------- jump poses (same 11 points as rig2d POSES; feet at y=0 in local space) ----------
export const JPOSE = {
  coil:    { head: [20, -146], sh: [10, -114], hip: [0, -56], eF: [-14, -92], hF: [-40, -70], eB: [-24, -96], hB: [-50, -78], kF: [36, -52], fF: [20, 0], kB: [22, -48], fB: [-8, 0] },   // arms swung back
  launch:  { head: [5, -250], sh: [2, -214], hip: [0, -134], eF: [14, -258], hF: [22, -300], eB: [-6, -256], hB: [-10, -298], kF: [3, -68], fF: [5, -2], kB: [-3, -68], fB: [-6, 0] },  // full stretch, arms up
  rise:    { ...POSES.jump },
  apex:    { head: [4, -216], sh: [1, -182], hip: [0, -108], eF: [34, -196], hF: [64, -206], eB: [-30, -194], hB: [-60, -202], kF: [18, -62], fF: [32, -22], kB: [-14, -62], fB: [-28, -26] }, // star hang
  fall:    { head: [2, -212], sh: [0, -178], hip: [0, -104], eF: [28, -214], hF: [44, -246], eB: [-24, -210], hB: [-40, -242], kF: [10, -54], fF: [16, -6], kB: [-8, -54], fB: [-10, -4] },  // arms up, legs dangle
  flail:   { head: [-4, -212], sh: [-2, -178], hip: [0, -104], eF: [40, -190], hF: [58, -226], eB: [-34, -200], hB: [-46, -236], kF: [16, -58], fF: [26, -14], kB: [-12, -50], fB: [-22, -10] },
  land:    { head: [20, -138], sh: [11, -108], hip: [0, -50], eF: [38, -88], hF: [56, -66], eB: [-22, -90], hB: [-38, -70], kF: [38, -46], fF: [24, 0], kB: [-18, -44], fB: [-28, 0] },  // deep impact crouch
  wince:   { head: [14, -192], sh: [8, -162], hip: [0, -96], eF: [26, -128], hF: [34, -98], eB: [12, -130], hB: [20, -96], kF: [18, -48], fF: [10, 0], kB: [-6, -50], fB: [-12, 0] },  // hands to knees
  stumble: { head: [24, -196], sh: [14, -166], hip: [0, -98], eF: [40, -150], hF: [62, -160], eB: [-18, -150], hB: [-40, -172], kF: [26, -46], fF: [34, 0], kB: [-12, -50], fB: [-26, 0] },
};

// ---------- timeline ----------
export function jumpTimes(t0, height, o = {}) {
  const h = Math.max(10, height), up = o.up ?? clamp(0.32 + 0.5 * Math.sqrt(h / 300), 0.32, 2.4), hang = o.hang ?? up * 0.4, down = o.down ?? up * 0.85;
  const crouch = o.crouch ?? 0.24, recover = o.recoverDur ?? 0.55;
  const tc = t0 - crouch, tA = t0 + up, tB = tA + hang, tL = tB + down;
  return { tc, t0, tA, tB, tL, tEnd: tL + recover, up, hang, down, crouch, recover };
}

// ---------- pose + body state at time t ----------
export function jumpPose(t, t0, height, o = {}) {
  const T = jumpTimes(t0, height, o), h = height, base = o.base || POSES.stand;
  let pose = base, lift = 0, sx = 1, sy = 1, phase = 'ground', k = 0, v = 0, dir = 0, flutter = 0;
  if (t < T.tc) { pose = breathe(base, t, 1, o.seed ?? 0); }
  else if (t < T.t0) {                                              // crouch: sink + arms swing back
    phase = 'crouch'; k = prog(t, T.tc, T.t0); const e = ease.out(k);
    pose = k < 0.6 ? blendPose(base, POSES.crouch, k / 0.6) : blendPose(POSES.crouch, JPOSE.coil, (k - 0.6) / 0.4);
    sy = 1 - 0.1 * e; sx = 1 + 0.07 * e;
  } else if (t < T.tA) {                                            // rise: decelerating parabola
    phase = 'rise'; k = prog(t, T.t0, T.tA); lift = h * (1 - (1 - k) ** 2); v = 1 - k; dir = 1;
    const st = clamp((t - T.t0) / 0.14);                            // launch stretch for the first frames
    pose = k < 0.25 ? blendPose(JPOSE.launch, JPOSE.rise, k / 0.25) : blendPose(JPOSE.rise, JPOSE.apex, clamp((k - 0.55) / 0.45));
    sy = lerp(1.2, 1, ease.out(st)) + 0.04 * v; sx = lerp(0.86, 1, ease.out(st)) - 0.02 * v;
    flutter = 0.35 + 0.65 * v;
  } else if (t < T.tB) {                                            // apex hang: everything slows, tiny float
    phase = 'apex'; k = prog(t, T.tA, T.tB); lift = h + Math.sin(k * Math.PI) * Math.min(18, h * 0.04);
    pose = breathe(JPOSE.apex, t * 0.6, 0.6, 2); flutter = 1;
  } else if (t < T.tL) {                                            // fall: accelerating
    phase = 'fall'; k = prog(t, T.tB, T.tL); lift = h * (1 - k * k); v = k; dir = -1;
    pose = blendPose(JPOSE.apex, k < 0.5 ? JPOSE.fall : JPOSE.flail, ease.inOut(clamp(k * 1.6)));
    if (k >= 0.5) pose = blendPose(JPOSE.fall, JPOSE.flail, 0.5 + 0.5 * Math.sin(t * 14));
    if (k > 0.86) pose = blendPose(pose, JPOSE.land, (k - 0.86) / 0.14 * 0.5);
    sy = 1 + 0.08 * k; sx = 1 - 0.05 * k; flutter = 0.5 + 0.5 * k;
  } else {                                                           // landing: impact squash -> recover
    const u = t - T.tL, rec = o.recover || 'stand';
    phase = u < T.recover ? 'land' : 'ground'; k = clamp(u / T.recover);
    const hit = Math.exp(-u * 11) * Math.cos(u * 26);              // spring
    sy = 1 - 0.24 * hit; sx = 1 + 0.16 * hit;
    const end = rec === 'wince' ? JPOSE.wince : rec === 'stumble' ? JPOSE.stumble : base;
    pose = u < 0.12 ? JPOSE.land : blendPose(JPOSE.land, end, ease.out((u - 0.12) / (T.recover - 0.12)));
    if (rec === 'stumble' && u > 0.12) { const w = Math.exp(-(u - 0.3) * 4) * Math.sin(u * 16) * 8; pose = { ...pose, head: [pose.head[0] + w, pose.head[1]] }; }
    if (phase === 'ground') pose = breathe(end, t, 1, o.seed ?? 0);
  }
  return { pose, lift, sx, sy, phase, k, v, dir, flutter, times: T, impact: t >= T.tL && t < T.tL + 2 / 24 + 0.001, landed: t >= T.tL, h };
}

// ---------- draw the jumping figure ----------
const localT = (g, x, y, s, f) => { g.translate(x, y); g.scale(f * s, s); };
export function jumper(g, who, J, o = {}) {
  const x = o.x ?? E.W / 2, gy = o.gy ?? E.H * 0.8, s = o.s ?? 1.9, f = o.facing ?? 1, t = o.t ?? 0, y = gy - J.lift, of = outfitOf(who);
  const eff = s * (of.kid ? 0.72 : 1);
  // ground shadow shrinks and fades with height
  if (o.shadow !== false) { const q = 1 / (1 + J.lift / (260 * eff)); g.save(); g.fillStyle = `rgba(0,0,0,${0.3 * q})`; g.beginPath(); g.ellipse(x, gy + 2, 40 * eff * q * J.sx, 7 * eff * q, 0, 0, 7); g.fill(); g.restore(); }
  // speed lines behind the figure (fall: streaks above; fast rise: streaks below)
  if (o.speedLines !== false && (J.phase === 'fall' || (J.phase === 'rise' && J.v > 0.55))) jumpStreaks(g, t, x, y - 120 * eff, { s: eff, dir: J.dir, a: J.phase === 'fall' ? 0.25 + 0.45 * J.v : 0.4 * J.v, color: o.streakColor });
  const trail = o.trail !== false && (J.phase === 'rise' || J.phase === 'fall') && J.v > 0.25 ? { count: 4, dx: 0, dy: J.dir * 26 * eff * J.v, a: 0.3 } : null;
  g.save(); g.translate(x, y); g.scale(J.sx, J.sy); g.translate(-x, -y);
  if (J.flutter > 0 && of.top === 'hoodie') hoodieFlutter(g, t, J, x, y, eff, f, of, 'back');
  actor(g, who, { ...o, x, y, s, facing: f, pose: J.pose, shadow: false, trail, t });
  if (J.flutter > 0 && of.top === 'hoodie') hoodieFlutter(g, t, J, x, y, eff, f, of, 'front');
  g.restore();
  const hp = J.pose.head; return { x, y, head: [x + hp[0] * f * eff * J.sx, y + hp[1] * eff * J.sy] };
}

// hoodie hem + hood + drawstrings fluttering in the wind (wind blows DOWN on the rise, UP on the fall/apex)
function hoodieFlutter(g, t, J, x, y, s, f, of, layerName) {
  const p = J.pose, c = of.color || '#E1AD01', amp = J.flutter, wind = J.phase === 'rise' ? 1 : -1, fq = 22 + 10 * amp;
  g.save(); localT(g, x, y, s, f);
  if (layerName === 'back') {                                    // hood blown behind the shoulders
    const w = Math.sin(t * fq) * 4 * amp, hx = p.sh[0] - 12, hy = p.sh[1] - 4;
    g.fillStyle = shade(c, -0.3); g.beginPath(); g.moveTo(hx + 10, hy - 6); g.quadraticCurveTo(hx - 20 - 8 * amp, hy - 8 * wind * amp + w, hx - 26 - 12 * amp, hy + (wind > 0 ? 14 : -18) * amp + w); g.quadraticCurveTo(hx - 6, hy + 10, hx + 10, hy + 8); g.closePath(); g.fill();
  } else {                                                        // hem flaps + drawstrings
    const hx = p.hip[0], hy = p.hip[1] - 4, n = 4;
    g.fillStyle = shade(c, -0.12); g.beginPath(); g.moveTo(hx - 16, hy - 6);
    for (let i = 0; i <= n; i++) { const u = i / n, wx = lerp(-16, 16, u), w = Math.sin(t * fq + i * 1.9) * 7 * amp; g.lineTo(hx + wx + w * 0.3, hy + wind * (8 + 9 * amp) + w); }
    g.lineTo(hx + 16, hy - 6); g.closePath(); g.fill();
    for (const [dx, ph] of [[3, 0], [9, 1.7]]) { const w = Math.sin(t * (fq + 6) + ph) * 6 * amp; seg(g, [[p.sh[0] + dx, p.sh[1] + 10], [p.sh[0] + dx + 4 + w, p.sh[1] + 10 + wind * 16 + w * 0.4], [p.sh[0] + dx + 2 + w * 1.4, p.sh[1] + 10 + wind * 28]], 2.4, '#f4efe6'); }
  }
  g.restore();
}

// vertical wind streaks around a moving figure (dir 1 = going up: streaks run below; -1 = falling: streaks above)
export function jumpStreaks(g, t, x, y, o = {}) {
  const s = o.s ?? 1.9, a = o.a ?? 0.4, n = o.count ?? 16, r = rng(o.seed ?? 31), col = o.color || '#fff6e6', dir = o.dir ?? -1;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const dx = (r() - 0.5) * 220 * s, L = (60 + r() * 140) * s, sp = 900 + r() * 900, ph = (t * sp + r() * 1000) % (520 * s);
    const yy = y + dir * (ph - 140 * s), al = a * (0.4 + 0.6 * r()) * Math.sin(clamp(ph / (520 * s)) * Math.PI);
    g.strokeStyle = alpha(col, al); g.lineWidth = 1.5 + r() * 2.5; g.beginPath(); g.moveTo(x + dx, yy); g.lineTo(x + dx, yy + dir * L); g.stroke();
  }
  g.restore();
}

// ---------- ground FX ----------
// dust ring + puffs at (x, gy) starting at t0
export function dustRing(g, t, t0, x, gy, o = {}) {
  const u = t - t0, dur = o.dur ?? 0.9; if (u < 0 || u > dur) return; const k = u / dur, s = o.s ?? 1.9, size = o.size ?? 1, col = o.color || '#d8c8b8', r = rng(o.seed ?? 12);
  const rx = lerp(30, 150 * s * size, ease.out(k)), ry = rx * 0.16;
  g.save(); g.strokeStyle = alpha(col, 0.55 * (1 - k)); g.lineWidth = (5 + 6 * (1 - k)) * size; g.beginPath(); g.ellipse(x, gy + 2, rx, ry, 0, 0, 7); g.stroke();
  for (let i = 0; i < 14; i++) { const side = i % 2 ? 1 : -1, sp = (0.5 + r()) * 120 * s * size, px = x + side * (20 + sp * ease.out(k)), py = gy - (10 + r() * 50 * size) * ease.out(k) - 4, pr = (10 + r() * 22) * size * (0.6 + k);
    circle(g, px, py, pr, alpha(col, 0.35 * (1 - k) * (0.5 + r() * 0.5))); }
  g.restore();
}
// cracks + flying chips (hard landing)
function cracks(g, t, t0, x, gy, o = {}) {
  const u = t - t0; if (u < 0) return; const s = o.s ?? 1.9, k = ease.out(clamp(u / 0.12)), fade = clamp(1.6 - u * 0.6), r = rng(o.seed ?? 44);
  g.save(); g.strokeStyle = alpha('#140f18', 0.75 * fade); g.lineWidth = 3.2; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const side = i % 2 ? 1 : -1, L = (40 + r() * 80) * s * k; let px = x + side * 10, py = gy + 3; g.beginPath(); g.moveTo(px, py); for (let j = 0; j < 3; j++) { px += side * L / 3; py += (r() - 0.4) * 8; g.lineTo(px, py); } g.stroke(); }
  for (let i = 0; i < 9; i++) { const vx = (r() - 0.5) * 520, vy = -(260 + r() * 420), px = x + vx * u, py = gy + vy * u + 900 * u * u; if (py > gy + 6 || u > 1.2) continue; circle(g, px, py, 3 + r() * 4, alpha('#3a2e36', fade)); }
  g.restore();
}
// water crown + droplets + ripples (pool / pond)
export function splash(g, t, t0, x, gy, o = {}) {
  const u = t - t0; if (u < 0 || u > 1.8) return; const s = o.s ?? 1.9, size = o.size ?? 1, r = rng(o.seed ?? 77), col = o.color || '#bfe4ff', fade = clamp(1 - u / 1.8);
  g.save();
  for (let i = 0; i < 3; i++) { const ph = clamp((u - i * 0.18) / 1.2); if (ph <= 0) continue; g.strokeStyle = alpha(col, 0.6 * (1 - ph)); g.lineWidth = 3; g.beginPath(); g.ellipse(x, gy + 4, (40 + ph * 220) * s * 0.5 * size, (8 + ph * 34) * size, 0, 0, 7); g.stroke(); }
  const ch = Math.sin(clamp(u / 0.7) * Math.PI) * 150 * s * 0.6 * size;                       // the crown
  if (ch > 2) { g.fillStyle = alpha(col, 0.75 * fade); g.beginPath(); g.moveTo(x - 60 * size * s * 0.6, gy + 4); for (let i = 0; i <= 8; i++) { const ux = lerp(-1, 1, i / 8), hh = ch * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7))) * (1 - ux * ux * 0.5); g.lineTo(x + ux * 70 * size * s * 0.6, gy + 4 - hh); } g.lineTo(x + 60 * size * s * 0.6, gy + 4); g.closePath(); g.fill(); }
  for (let i = 0; i < 18; i++) { const vx = (r() - 0.5) * 700 * size, vy = -(380 + r() * 520) * size, px = x + vx * u, py = gy + vy * u + 1100 * u * u; if (py > gy + 8) continue; circle(g, px, py, (3 + r() * 6) * size, alpha('#e8f6ff', 0.9 * fade)); }
  g.restore();
}
// cartoon spring "boing": wobble lines + a gold pop word
function boing(g, t, t0, x, gy, o = {}) {
  const u = t - t0; if (u < 0 || u > 1.4) return; const s = o.s ?? 1.9, fade = clamp(1.4 - u) , w = Math.exp(-u * 3) * Math.sin(u * 30);
  g.save(); g.strokeStyle = alpha('#fff1dc', 0.8 * fade); g.lineWidth = 4; g.lineCap = 'round';
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const xx = x + side * (70 + i * 26) * s * 0.6; g.beginPath(); g.moveTo(xx, gy - 30 - i * 14); g.quadraticCurveTo(xx + side * 16 * w, gy - 60 - i * 14, xx, gy - 90 - i * 14); g.stroke(); }
  const p = ease.outBack(clamp(u / 0.3)); if (p > 0.02) text(g, o.word || 'BOING!', x + 170 * s * 0.6, gy - 260 - 30 * u, { size: 76 * p, color: S().ui.gold, font: FONTS.title, weight: 700, stroke: 12, strokeColor: '#1a1020', alpha: fade });
  g.restore();
}
// hay puff (haystack landing)
function puff(g, t, t0, x, gy, o = {}) {
  const u = t - t0; if (u < 0 || u > 1.6) return; const s = o.s ?? 1.9, r = rng(o.seed ?? 91), fade = clamp(1 - u / 1.6);
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const vx = (r() - 0.5) * 600, vy = -(200 + r() * 500), px = x + vx * u, py = gy - 80 + vy * u + 700 * u * u, a = r() * 6 + u * (r() - 0.5) * 8, L = 10 + r() * 14;
    g.strokeStyle = alpha(r() > 0.5 ? '#e8c25a' : '#c99a3a', fade); g.lineWidth = 3; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); g.stroke(); }
  for (let i = 0; i < 6; i++) circle(g, x + (r() - 0.5) * 200 * s * 0.6, gy - 60 - r() * 120 * u, (30 + 40 * u) * s * 0.5, alpha('#e8d8a0', 0.25 * fade));
  g.restore();
}
// launch dust ring + the chosen landing (thud | splash | boing | puff | soft). Draw on the character layer, BEFORE jumper().
export function jumpFX(g, t, J, o = {}) {
  const x = o.x ?? E.W / 2, gy = o.gy ?? E.H * 0.8, s = o.s ?? 1.9, kind = o.landing || 'thud', T = J.times;
  if (o.launchDust !== false) dustRing(g, t, T.t0, x, gy, { s, size: o.dustSize ?? 1, color: o.dustColor, seed: 12 });
  if (kind === 'thud') { dustRing(g, t, T.tL, x, gy, { s, size: 1.5, dur: 1.2, color: o.dustColor, seed: 13 }); cracks(g, t, T.tL, x, gy, { s }); }
  else if (kind === 'splash') splash(g, t, T.tL, x, gy, { s, size: o.size ?? 1 });
  else if (kind === 'boing') boing(g, t, T.tL, x, gy, { s, word: o.word });
  else if (kind === 'puff') puff(g, t, T.tL, x, gy, { s });
  else dustRing(g, t, T.tL, x, gy, { s, size: 0.8, color: o.dustColor, seed: 14 });
}

// ---------- impact frame + shake + follow cam ----------
// two frames of a high-contrast manga flash (cream field, ink burst lines, inverted centre), then a quick fade. Screen space.
export function impactFrame(g, t, tL, o = {}) {
  const u = t - tL; if (u < 0 || u > 0.2) return; const x = o.x ?? E.W / 2, y = o.y ?? E.H * 0.7, hard = u < 2 / 24 + 0.001, r = rng(o.seed ?? 5);
  g.save();
  if (hard) {
    g.fillStyle = 'rgba(255,246,228,.82)'; g.fillRect(0, 0, E.W, E.H);
    g.fillStyle = '#140f18'; for (let i = 0; i < 46; i++) { const a = (i / 46) * Math.PI * 2 + r() * 0.08, d0 = 160 + r() * 140, w = 0.012 + r() * 0.02; poly(g, [[x + Math.cos(a - w) * d0, y + Math.sin(a - w) * d0], [x + Math.cos(a) * 2400, y + Math.sin(a) * 2400], [x + Math.cos(a + w) * d0, y + Math.sin(a + w) * d0]], '#140f18'); }
  } else { g.fillStyle = `rgba(255,246,228,${0.45 * (1 - (u - 0.083) / 0.117)})`; g.fillRect(0, 0, E.W, E.H); }
  g.restore();
}
export function jumpShake(t, tL, amp = 18) { const u = t - tL; if (u < 0 || u > 0.7) return [0, 0]; const d = amp * Math.exp(-u * 6); return [noise(t * 40, 3) * d, noise(t * 40, 11) * d]; }
export function jumpCam(t, t0, height, o = {}) {
  const lag = o.lag ?? 0.12, follow = o.follow ?? 0.8, J = jumpPose(t - lag, t0, height, o), T = J.times, z0 = o.z ?? 1.1;
  const zk = J.phase === 'apex' ? 1 : J.phase === 'rise' ? J.k : J.phase === 'fall' ? 1 - J.k : 0;
  const [sx, sy] = jumpShake(t, T.tL, o.shake ?? 22);
  return { z: z0 - (o.zoomOut ?? 0.06) * zk + (t > T.tL ? 0.05 * Math.exp(-(t - T.tL) * 5) : 0), x: (o.x ?? 0) + Math.sin(t * 0.63) * 6 + sx, y: (o.y ?? 0) - J.lift * follow + Math.cos(t * 0.5) * 4 + sy, r: Math.sin(t * 0.37) * 0.002 };
}
