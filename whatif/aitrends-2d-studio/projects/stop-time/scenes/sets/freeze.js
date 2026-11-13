// sets/freeze.js — FREEZE FX for "What If You Could Freeze Time for 10 Seconds?" (H1, Stage A). Deterministic: only t / seed.
// TIME
//   frozenTime(t, at, until=1e9)           -> motion clock that STOPS between at..until (feed it to anything that moves: dust, liquids, cat, steam)
//   freezeAt(t, at, until, ramp=.25)       -> 0..1 how frozen the world is (ramps in after the snap, out on the unfreeze)
// THE SNAP (the only power; a finger snap, no gadget)
//   SNAP_PREP / SNAP_HIT                   rig poses: hand raised by the chin, then the flick
//   snapPose(t, t0)                        -> pose: stand -> prep (t0-.45) -> hit at t0 -> settles; feed through idle()
//   handWorld(o, pose)                     -> [x,y] world position of the near hand of actor o (o = the actor() options)
//   snapBurst(g, t, { x, y, t0, s })       finger-snap spark: white star + 3 click arcs + a tiny cyan pop (0.35 s)
//   snapRipple(g, t, { x, y, t0, dur=.7, max, color })   ring that spreads from the hand; INSIDE it the world is already frozen (calls freezeGrade
//                                          clipped to the ring) and the edge refracts the frame (lens bulge) with a cyan/white double line
// THE FROZEN LOOK
//   freezeGrade(g, k, { clip:{x,y,r}, outside, vignette })   cool blue-grey, desaturated still world (k 0..1). Draw it AFTER the scene.
//   hangingDust(g, t, { at, until, count, seed, area, k })   dust motes that drift, then hang with tiny glints when frozen
//   stillMark(g, x, y, s, t, seed)         the tiny "still" sparkle on frozen people/cats/objects (4-point twinkle + tick ring)
//   frozenGlow(g, drawFn, { k, color })    draws drawFn with a faint ice halo (frozen people)
//   liquidArc(g, t, { x0, y0, vx, vy, tt, kind:'juice'|'milk', n, seed, floor, frozen, s })   poured liquid: ribbon + droplets that
//                                          hang like glass beads (highlight, rim, window glint). tt = motion clock since the spill
//   sneezeSpray(g, { x, y, dir, tt, s, frozen, seed })   Dev's frozen sneeze: a cone of droplets hanging in front of the face
//   SNEEZE, SNEEZE_FACE                    pose + face override for Dev mid-sneeze (eyes shut, mouth open, head pitched forward)
//   leapCat(g, { x, y, s, facing, t, eyes:'wide'|'open', rim, stretch })   Biscuit MID-LEAP (body stretched, paws out), purple collar
// THE TWO BROKEN VIEWS
//   blackView(g, t, { k, ghost:(g)=>{}, ghostA, count:{ t0, x, y } })   snap 1: pitch black; ghostA>0 brings back a faint cool outline of
//                                          whatever ghost() draws; count draws the 10 count dots filling once per second
//   countDots(g, t, { t0, x, y, r, n=10 })  the quiet 1..10 counter (dots on a ring, one per second)
//   airWall(g, t, { k, x, press:{x,y,r,depth}, moving, seed, density })   snap 2: visible frozen air molecules (N2 pairs blue, O2 pairs coral),
//                                          three depths, a dented "mattress" membrane where the hero presses in; moving 0..1 adds 500 m/s streaks
//   PRESS                                  rig pose: leaning into the invisible wall, palms flat
//   puffCheeks(g, cx, cy, r, k, o)         giantFace overlay: puffed cheeks + blush + held-breath lips (use with giantFace f: FACE_HOLD)
//   FACE_HOLD                              faceParams for "cheeks puffed, can't breathe"
//   unfreezeWhoosh(g, t, { x, y, t0, dur=.6 })  colour floods back from (x,y) + whoosh arcs + flash ring (call AFTER freezeGrade)
// HERO LOOK (this episode; the rig has no fields for these, so they are drawn on top of actor('HERO'))
//   heroST(g, o)                           actor('HERO', o) + round tortoiseshell glasses, one cowlick, teal/cream stripes + long sleeves,
//                                          navy star pyjamas, mismatched socks (green/yellow), the chunky black watch
//   heroBigFace(g, cx, cy, r, o)           giantFace for THIS hero (faces.js still draws the ep 3 hood): striped tee collar, shaggy black hair,
//                                          the cowlick, round tortoiseshell glasses. o = giantFace options (f, blink, rimColor, rimSide, tilt, glint)
import { E, S, clamp, lerp, ease, prog, rng, seg, circle, ring, poly, rr, alpha, shade, mix, glow, linGrad, radGrad } from '/engine/core.js';
import { POSES, posesAt } from '/engine/rig2d.js';
import { actor } from './actors.js';
import { giantFace } from './faces.js';
import { HERO } from '../cast.js';

export const FZ = { ice: '#cfeaff', ice2: '#8fc8ff', cyan: '#6fe0ff', steel: '#9fb4d0', navy: '#16233c', juice: '#f59a1e', juice2: '#ffc65a', milk: '#f6f8fc', milk2: '#c9d3e6', n2: '#8fb8ff', o2: '#ff9a8a' };
const P = (o) => o;   // pose literal (same 11 points as rig2d POSES)


// draw fn into a pooled offscreen canvas (same transform as g), then composite it ONCE with a filter (a filter on g itself is applied per draw call)
const _pool = {};
function offscreen(g, key, fn) {
  const W = g.canvas.width, H = g.canvas.height; let c = _pool[key];
  if (!c || c.width !== W || c.height !== H) { c = _pool[key] = document.createElement('canvas'); c.width = W; c.height = H; }
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.setTransform(g.getTransform()); fn(x); return c;
}
function composite(g, c, filter, a = 1, op = 'source-over') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= a; g.globalCompositeOperation = op; g.filter = filter; g.drawImage(c, 0, 0); g.restore(); }

// ---------------------------------------------------------------- time
export const frozenTime = (t, at, until = 1e9) => (t < at ? t : t > until ? t - (until - at) : at);
export const freezeAt = (t, at, until = 1e9, ramp = 0.25) => clamp(prog(t, at, at + ramp) - prog(t, until, until + ramp));

// ---------------------------------------------------------------- snap
export const SNAP_PREP = P({ head: [4, -208], sh: [1, -174], hip: [0, -100], eF: [22, -146], hF: [26, -186], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [4, 0], kB: [-6, -50], fB: [-11, 0] });
export const SNAP_HIT  = P({ head: [6, -209], sh: [2, -175], hip: [0, -100], eF: [26, -150], hF: [40, -184], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [4, 0], kB: [-6, -50], fB: [-11, 0] });
export function snapPose(t, t0) { return posesAt(t, [[-1e9, POSES.stand], [t0 - 0.45, SNAP_PREP], [t0, SNAP_HIT], [t0 + 0.9, SNAP_PREP]], 0.12); }
export function handWorld(o, pose, which = 'hF') {
  const p = pose || o.pose || POSES.stand, s = (o.s ?? 1) * ((typeof o.who === 'object' && o.who?.kid) || o.kid ? 0.72 : 1), f = o.facing ?? 1;
  let [x, y] = p[which];
  if (o.rot) { const [hx, hy] = p.hip, c = Math.cos(o.rot), sn = Math.sin(o.rot); const dx = x - hx, dy = y - hy; x = hx + dx * c - dy * sn; y = hy + dx * sn + dy * c; }
  return [o.x + x * s * f, o.y + y * s];
}
export function snapBurst(g, t, o = {}) {
  const { x, y, t0 = 0, s = 1 } = o, u = t - t0; if (u < -0.02 || u > 0.45) return;
  const k = prog(u, 0, 0.35), a = 1 - ease.in(k);
  g.save(); g.translate(x, y); g.scale(s, s); g.globalCompositeOperation = 'lighter';
  glow(g, 0, 0, 90 * (0.4 + k), '#ffffff', 0.7 * a); glow(g, 0, 0, 160 * (0.4 + k), FZ.cyan, 0.35 * a);
  g.strokeStyle = alpha('#ffffff', 0.95 * a); g.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + 0.2, r0 = 14 + 40 * k, r1 = r0 + (i % 2 ? 18 : 34) * (1 - k * 0.5); g.lineWidth = i % 2 ? 3 : 5; g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); g.stroke(); }
  for (let i = 0; i < 3; i++) { g.lineWidth = 4 - i; g.strokeStyle = alpha(i ? FZ.cyan : '#ffffff', 0.8 * a); g.beginPath(); g.arc(0, 0, 44 + i * 18 + k * 50, -1.1 - i * 0.1, -0.3 + i * 0.05); g.stroke(); }
  g.restore();
}
export function snapRipple(g, t, o = {}) {
  const { x, y, t0 = 0, dur = 0.7, color = FZ.cyan } = o, u = t - t0; if (u < 0) return;
  const max = o.max ?? Math.hypot(Math.max(x, E.W - x), Math.max(y, E.H - y)) + 80, k = ease.out(clamp(u / dur)), R = 20 + (max - 20) * k;
  freezeGrade(g, 1, { clip: { x, y, r: R } });
  if (k >= 1) return;
  const fade = 1 - prog(k, 0.75, 1);
  // refraction: the frame bulges a little inside a thin annulus at the edge
  const m = g.getTransform(), c = m.transformPoint(new DOMPoint(x, y)), sc = Math.hypot(m.a, m.b), w = 38;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.beginPath(); g.arc(c.x, c.y, (R + w) * sc, 0, Math.PI * 2); g.arc(c.x, c.y, Math.max(1, R - w) * sc, 0, Math.PI * 2, true); g.clip('evenodd');
  g.translate(c.x, c.y); g.scale(1.035, 1.035); g.translate(-c.x, -c.y); g.globalAlpha = 0.9 * fade; g.drawImage(g.canvas, 0, 0);
  g.restore();
  g.save(); g.globalCompositeOperation = 'lighter';
  ring(g, x, y, R, 10, alpha(color, 0.25 * fade)); ring(g, x, y, R, 3.5, alpha('#ffffff', 0.85 * fade)); ring(g, x, y, R - 12, 2, alpha(color, 0.7 * fade)); ring(g, x, y, R * 0.82, 1.5, alpha('#ffffff', 0.25 * fade));
  const r = rng(11); for (let i = 0; i < 26; i++) { const an = r() * Math.PI * 2, d = R + (r() - 0.5) * 20; circle(g, x + Math.cos(an) * d, y + Math.sin(an) * d, 1.5 + r() * 2.5, alpha('#ffffff', 0.7 * fade)); }
  g.restore();
}

// ---------------------------------------------------------------- frozen look
export function freezeGrade(g, k, o = {}) {
  if (k <= 0.001) return;
  g.save();
  if (o.clip) { g.beginPath(); if (o.outside) g.rect(-E.W, -E.H, E.W * 3, E.H * 3); g.arc(o.clip.x, o.clip.y, Math.max(0.1, o.clip.r), 0, Math.PI * 2, o.outside); g.clip(o.outside ? 'evenodd' : 'nonzero'); }
  g.setTransform(1, 0, 0, 1, 0, 0); const W = g.canvas.width, H = g.canvas.height;
  const f = (op, col, a) => { g.globalCompositeOperation = op; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, W, H); };
  f('saturation', '#808080', 0.72 * k);           // drain the colour
  f('multiply', '#b4c8e2', 0.9 * k);              // cool blue-grey
  f('screen', '#1a2a46', 0.55 * k);               // lift the blacks into navy
  f('soft-light', '#a8d0ff', 0.3 * k);
  if (o.vignette !== false) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.55 * k; g.fillStyle = radGrad(g, W / 2, H / 2, H * 0.35, W * 0.62, ['rgba(10,18,36,0)', 'rgba(10,18,36,.85)']); g.fillRect(0, 0, W, H); }
  g.restore();
}
export function hangingDust(g, t, o = {}) {
  const { at = 1e9, until = 1e9, count = 70, seed = 5, area = [0, 0, E.W, E.H], k = freezeAt(t, at, until) } = o, tt = frozenTime(t, at, until), r = rng(seed);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const near = r() > 0.75, sz = near ? 2.5 + r() * 3 : 1 + r() * 1.8, vx = (r() - 0.5) * 14, vy = -3 - r() * 8, ph = r() * 6.28;
    const x = area[0] + ((r() * area[2] + vx * tt + Math.sin(tt * 0.6 + ph) * 10) % area[2] + area[2]) % area[2], y = area[1] + ((r() * area[3] + vy * tt) % area[3] + area[3]) % area[3];
    const tw = 0.55 + 0.45 * Math.sin(t * 2.3 + ph);
    circle(g, x, y, sz, alpha(mix('#ffe6c0', FZ.ice, k), (near ? 0.32 : 0.22) * (0.7 + 0.3 * tw)));
    if (k > 0.5 && i % 4 === 0) { const a = (k - 0.5) * 2 * tw; seg(g, [[x - sz * 2.6, y], [x + sz * 2.6, y]], 1, alpha('#ffffff', 0.5 * a)); seg(g, [[x, y - sz * 2.6], [x, y + sz * 2.6]], 1, alpha('#ffffff', 0.5 * a)); }
  }
  g.restore();
}
export function stillMark(g, x, y, s = 1, t = 0, seed = 0) {
  const tw = 0.5 + 0.5 * Math.sin(t * 3.1 + seed * 1.7), a = 0.45 + 0.55 * tw, L = (10 + 8 * tw) * s;
  g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.rotate(0.3 + seed);
  glow(g, 0, 0, 22 * s, FZ.ice, 0.5 * a);
  g.fillStyle = alpha('#ffffff', 0.95 * a); g.beginPath();
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rr2 = i % 2 ? L * 0.22 : L; g.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } g.closePath(); g.fill();
  g.strokeStyle = alpha(FZ.ice, 0.5 * a); g.lineWidth = 1.5 * s; for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + 0.78; g.beginPath(); g.arc(0, 0, L * 1.35, an - 0.25, an + 0.25); g.stroke(); }
  g.restore();
}
export function frozenGlow(g, drawFn, o = {}) {
  const k = o.k ?? 1; if (k <= 0.01) { drawFn(g); return; }
  g.save(); g.shadowColor = alpha(o.color || FZ.ice, 0.75 * k); g.shadowBlur = 18 * k * (g.getTransform().a || 1); drawFn(g); g.restore();
}

// ---------------------------------------------------------------- liquids
function bead(g, x, y, r, ang, kind, frozen, glint) {
  const c = kind === 'milk' ? FZ.milk : FZ.juice, c2 = kind === 'milk' ? FZ.milk2 : shade(FZ.juice, -0.25), hi = kind === 'milk' ? '#ffffff' : FZ.juice2;
  g.save(); g.translate(x, y); g.rotate(ang);
  const rx = r * 1.18, ry = r * 0.88;
  g.fillStyle = radGrad(g, -rx * 0.3, -ry * 0.35, r * 0.1, r * 1.3, [hi, c, c2]); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
  if (kind !== 'milk') { g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#ffb040', 0.35); g.beginPath(); g.ellipse(rx * 0.25, ry * 0.3, rx * 0.5, ry * 0.4, 0, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }   // light through the drop
  g.strokeStyle = alpha(shade(c2, -0.3), 0.55); g.lineWidth = Math.max(1, r * 0.12); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0.2, 2.6); g.stroke();
  g.rotate(-ang);
  circle(g, -r * 0.38, -r * 0.4, Math.max(1, r * 0.26), alpha('#ffffff', 0.95));                       // specular
  if (r > 6) { g.fillStyle = alpha('#ffffff', 0.55); g.fillRect(r * 0.12, -r * 0.62, r * 0.3, r * 0.22); }  // the window, reflected
  if (frozen > 0.01) { g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, r * 2.6, FZ.ice, 0.18 * frozen); if (glint) stillMark(g, -r * 0.4, -r * 0.42, 0.45 + r * 0.03, glint.t, glint.seed); }
  g.restore();
}
export function liquidArc(g, t, o = {}) {
  const { x0, y0, vx = 260, vy = -60, tt = 0, kind = 'juice', n = 22, seed = 3, floor = 1e9, frozen = 0, s = 1, G = 1500, emit = 0.4 } = o, r = rng(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const e = (i / n) * emit, age = tt - e, jx = 1 + (r() - 0.5) * (o.spread ?? 0.5), jy = (r() - 0.5) * 160 * (o.spread ?? 0.5) * 2, sz = (3 + r() * 4.5) * s * (i < 2 ? 1.6 : 1), sp = r();
    if (age <= 0) continue;
    const x = x0 + vx * jx * age, y = y0 + (vy + jy) * age + 0.5 * G * age * age;
    if (y > floor) continue;
    pts.push({ x, y, sz, age, ang: Math.atan2(vy + jy + G * age, vx * jx), sp, i });
  }
  if (!pts.length) return pts;
  // the coherent ribbon: youngest particles still joined to the lip
  const rib = pts.filter(p => p.age < 0.16).sort((a, b) => a.age - b.age);
  if (tt < emit + 0.16 && rib.length) {
    const c = kind === 'milk' ? FZ.milk : FZ.juice, line = [[x0, y0], ...rib.map(p => [p.x, p.y])];
    seg(g, line, 12 * s, shade(c, -0.18)); seg(g, line, 8 * s, c); seg(g, line.map(([x, y]) => [x - 2 * s, y - 2 * s]), 2.4 * s, alpha('#ffffff', 0.75));
  }
  for (const p of pts) if (p.age >= 0.1) bead(g, p.x, p.y, p.sz, p.ang, kind, frozen, p.sp > 0.85 ? { t, seed: p.i } : null);
  return pts;
}
export const SNEEZE = P({ head: [18, -196], sh: [8, -170], hip: [0, -100], eF: [28, -150], hF: [30, -186], eB: [-6, -136], hB: [-2, -112], kF: [8, -50], fF: [8, 0], kB: [-6, -50], fB: [-12, 0] });
export const SNEEZE_FACE = { eyes: 'closed', brows: 'worried', mouth: 'oBig' };
export function sneezeSpray(g, o = {}) {
  const { x, y, dir = 1, tt = 0.4, s = 1, frozen = 1, seed = 8, t = 0 } = o, r = rng(seed);
  g.save(); glow(g, x + dir * 60 * s, y, 120 * s, FZ.ice, 0.12 * frozen);
  for (let i = 0; i < 40; i++) {
    const an = (r() - 0.5) * 0.9, sp = (300 + r() * 520) * s, d = sp * Math.min(tt, 0.35) * (0.5 + r() * 0.5), sz = (1.4 + r() * 3.2) * s;
    const px = x + dir * Math.cos(an) * d, py = y + Math.sin(an) * d + 40 * tt * tt * s;
    circle(g, px, py, sz, alpha('#e8f4ff', 0.75)); circle(g, px - sz * 0.35, py - sz * 0.35, sz * 0.35, alpha('#ffffff', 0.95));
    if (frozen > 0.5 && i % 9 === 0) stillMark(g, px, py, 0.45 * s, t, i);
  }
  g.restore();
}

// ---------------------------------------------------------------- Biscuit mid-leap
const ellF = (g, x, y, rx, ry, c, rot = 0) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, 7); g.fill(); };
export function leapCat(g, o = {}) {
  const { x, y, s = 1, facing = 1, t = 0, stretch = 1, eyes = 'wide' } = o, fur = o.fill || '#2a2230', col = '#9a5ad6', eye = '#c8f07a';
  const rim = o.rim === false ? null : { dir: [-0.8, -0.5], color: '#ffc68a', w: 3, ...(o.rim || {}) };
  const st = lerp(0.6, 1, stretch);
  const bodyPass = (c) => {
    ellF(g, 0, 0, 52 * st + 6, 17, c, -0.12);                                                   // long stretched body
    ellF(g, 34 * st, -8, 22, 17, c, -0.2);                                                      // chest
    for (const [a, b, w] of [[[38 * st, 4], [70 * st, 6], [92 * st, 2]], [[30 * st, 6], [64 * st, 14], [86 * st, 12]]]) { seg(g, [a, b, w], 8, c); ellF(g, w[0] + 3, w[1], 7.5, 4, c, 0.1); } // front legs reaching
    for (const [a, b, w] of [[[-38 * st, 4], [-62 * st, 14], [-92 * st, 20]], [[-30 * st, 8], [-56 * st, 22], [-84 * st, 30]]]) { seg(g, [a, b, w], 9, c); ellF(g, w[0] - 3, w[1], 7.5, 4, c, -0.2); } // hind legs pushed back
    seg(g, [[-50 * st, -4], [-84 * st, -10], [-112 * st, -4], [-132 * st, 6]], 10, c);            // tail straight out behind
    g.save(); g.translate(62 * st, -20); g.rotate(0.08);
    ellF(g, 0, 0, 20, 17, c); ellF(g, -9, 8, 9, 8, c); ellF(g, 9, 9, 9, 7, c);
    poly(g, [[-17, -8], [-18, -36], [-2, -15]], c); poly(g, [[3, -15], [12, -36], [18, -6]], c);   // ears flattened back a little
    g.restore();
  };
  g.save(); g.translate(x, y); g.scale(facing * s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  if (rim) { g.save(); g.translate(rim.dir[0] * rim.w * facing, rim.dir[1] * rim.w); g.scale(1.03, 1.03); bodyPass(rim.color); g.restore(); }
  bodyPass(fur);
  g.strokeStyle = alpha(shade(fur, 0.3), 0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(-40 * st, -14); g.quadraticCurveTo(0, -22, 36 * st, -22); g.stroke();
  // face
  g.save(); g.translate(62 * st, -20); g.rotate(0.08);
  poly(g, [[-13, -11], [-14, -28], [-4, -15]], alpha('#e89aa6', 0.55)); poly(g, [[6, -16], [11, -28], [15, -9]], alpha('#e89aa6', 0.55));
  const wide = eyes === 'wide' ? 1.25 : 1;
  for (const ex of [3, 15]) { ellF(g, ex, -3, 5.4 * wide, 6.4 * wide, eye); ellF(g, ex + 0.6, -3, eyes === 'wide' ? 2.6 : 1.5, 6 * wide, '#0a0810'); circle(g, ex - 1.8, -5.5, 1.6, 'rgba(255,255,255,.9)'); }
  ellF(g, 19, 4, 3.2, 2.2, '#e89aa6'); g.fillStyle = '#3a0c18'; g.beginPath(); g.ellipse(17, 10, 3.4, 2.6, 0, 0, 7); g.fill();   // little open mouth
  for (const [dy, a] of [[-1, -7], [2, -2], [5, 4]]) { seg(g, [[19, 5 + dy], [40, 2 + dy + a]], 0.9, alpha('#fff', 0.55)); seg(g, [[5, 5 + dy], [-14, 2 + dy + a]], 0.9, alpha('#fff', 0.3)); }
  seg(g, [[-12, 14], [-2, 19], [10, 17]], 6, col); circle(g, -2, 21, 3.3, '#ffd86a');
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- snap 1: the black view
export function countDots(g, t, o = {}) {
  const { t0 = 0, x = E.W / 2, y = E.H * 0.86, r = 46, n = 10, color = FZ.ice } = o, u = t - t0; if (u < 0) return;
  g.save();
  for (let i = 0; i < n; i++) {
    const an = -Math.PI / 2 + (i / n) * Math.PI * 2, px = x + Math.cos(an) * r, py = y + Math.sin(an) * r, on = u >= i + 1, pop = ease.outBack(prog(u, i + 1, i + 1.25));
    circle(g, px, py, 6, alpha(color, 0.18));
    if (on) { glow(g, px, py, 18, color, 0.35 * pop); circle(g, px, py, 7 * pop, alpha(color, 0.9)); }
  }
  g.restore();
}
export function blackView(g, t, o = {}) {
  const { k = 1, ghostA = 0 } = o;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = clamp(k); g.fillStyle = '#010104'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  if (o.ghost && ghostA > 0.001) {            // light returning: the room comes back as a faint cool outline first
    const c = offscreen(g, 'ghost', o.ghost); composite(g, c, `grayscale(1) contrast(1.8) brightness(${0.5 + ghostA * 0.6}) blur(${(1.5 * (g.getTransform().a || 1)).toFixed(2)}px)`, ghostA);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = Math.min(1, ghostA * 4); g.fillStyle = '#7da4e0'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  }
  if (o.count) countDots(g, t, o.count);
}

// ---------------------------------------------------------------- snap 2: the wall of air
export const PRESS = P({ head: [24, -200], sh: [14, -170], hip: [0, -100], eF: [42, -168], hF: [58, -196], eB: [34, -146], hB: [56, -150], kF: [10, -50], fF: [6, 0], kB: [-14, -52], fB: [-34, 0] });
export function airWall(g, t, o = {}) {
  const { k = 1, x = 0, moving = 0, seed = 21, density = 1 } = o, pr = o.press, r = rng(seed);
  if (k <= 0.01) return;
  const N = Math.round(420 * density);
  g.save();
  const blurPx = (1.6 * (g.getTransform().a || 1)).toFixed(2), dst = g;
  for (let tier = 0; tier < 3; tier++) {
    const cnt = [N * 0.5, N * 0.32, N * 0.18][tier], size = [3, 5.5, 9][tier], a = [0.35, 0.6, 0.85][tier] * k;
    const drawTier = (g) => { for (let i = 0; i < cnt; i++) {
      let px = x + r() * (E.W + 200 - x) - 100, py = r() * (E.H + 120) - 60; const an = r() * Math.PI, o2 = r() < 0.21, sz = size * (0.8 + r() * 0.4), ph = r() * 6.28;
      if (pr) {                                      // squeezed aside around the press point: a dense ring, an emptier dent
        const dx = px - pr.x, dy = py - pr.y, d = Math.hypot(dx, dy) || 1;
        if (d < pr.r) { const nd = pr.r - (pr.r - d) * (1 - (pr.depth ?? 0.6)); px = pr.x + dx / d * nd; py = pr.y + dy / d * nd; }
      }
      if (moving > 0.01) { const sp = 40 * moving, mx = Math.cos(ph) * sp, my = Math.sin(ph) * sp; seg(g, [[px - mx, py - my], [px, py]], sz * 0.7, alpha(o2 ? FZ.o2 : FZ.n2, 0.25 * a)); }
      const c = o2 ? FZ.o2 : FZ.n2, dx2 = Math.cos(an) * sz * 0.8, dy2 = Math.sin(an) * sz * 0.8;
      circle(g, px - dx2, py - dy2, sz, alpha(c, a)); circle(g, px + dx2, py + dy2, sz, alpha(c, a));      // a diatomic pair
      if (tier > 0) { circle(g, px - dx2 - sz * 0.3, py - dy2 - sz * 0.35, sz * 0.3, alpha('#ffffff', 0.7 * a)); circle(g, px + dx2 - sz * 0.3, py + dy2 - sz * 0.35, sz * 0.3, alpha('#ffffff', 0.7 * a)); }
    } };
    if (tier === 0) composite(dst, offscreen(dst, 'air', drawTier), `blur(${blurPx}px)`); else drawTier(dst);
  }
  if (pr) {                                          // the "mattress": a soft glassy membrane bending around the press
    g.globalCompositeOperation = 'lighter';
    const R = pr.r * 1.15;
    g.strokeStyle = alpha(FZ.ice, 0.4 * k); g.lineWidth = 5; g.beginPath(); g.ellipse(pr.x, pr.y, R * 0.5, R, 0, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
    g.strokeStyle = alpha('#ffffff', 0.55 * k); g.lineWidth = 2; g.beginPath(); g.ellipse(pr.x + 6, pr.y, R * 0.42, R * 0.9, 0, Math.PI * 0.62, Math.PI * 1.3); g.stroke();
    for (const dy of [-1, 1]) { g.strokeStyle = alpha(FZ.ice, 0.3 * k); g.lineWidth = 3; g.beginPath(); g.moveTo(pr.x, pr.y + dy * R); g.quadraticCurveTo(pr.x + R * 0.2, pr.y + dy * R * 1.5, pr.x + R * 0.1, pr.y + dy * R * 2.1); g.stroke(); }
    glow(g, pr.x, pr.y, R * 1.3, FZ.ice2, 0.12 * k);
  }
  g.restore();
}
export const FACE_HOLD = { eye: 1.2, pupil: 0.6, brow: 0.8, tilt: -0.5, open: 0, smile: -0.15, w: 0.4, sweat: 0.9, blush: 0.6, look: [0.6, 0] };
export function puffCheeks(g, cx, cy, r, k = 1, o = {}) {
  if (k <= 0.01) return; const st = S(), side = o.side ?? 1, ink = st.ink;
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt);
  for (const s of [-1, 1]) {
    const bx = s * r * 0.8, by = r * 0.42, br = r * 0.3 * k;
    circle(g, bx, by, br, ink);
    g.strokeStyle = alpha(st.feature, 0.45); g.lineWidth = r * 0.025; g.beginPath(); g.arc(bx, by, br * 0.78, s > 0 ? -1.3 : Math.PI + 0.3, s > 0 ? -0.3 : Math.PI + 1.3); g.stroke();
    g.fillStyle = alpha('#ff6a7a', 0.38 * k); g.beginPath(); g.ellipse(bx - s * br * 0.2, by + br * 0.1, br * 0.55, br * 0.32, 0, 0, 7); g.fill();
  }
  g.fillStyle = st.feature; g.beginPath(); g.ellipse(side * r * 0.05, r * 0.46, r * 0.08, r * 0.045, 0, 0, 7); g.fill();     // pursed lips
  g.restore();
}

// ---------------------------------------------------------------- unfreeze
export function unfreezeWhoosh(g, t, o = {}) {
  const { x = E.W / 2, y = E.H / 2, t0 = 0, dur = 0.6 } = o, u = t - t0; if (u < 0 || u > dur + 0.2) return;
  const k = ease.out(clamp(u / dur)), max = Math.hypot(Math.max(x, E.W - x), Math.max(y, E.H - y)) + 60, R = 30 + max * k, a = 1 - prog(u, dur * 0.6, dur + 0.2);
  g.save(); g.globalCompositeOperation = 'lighter';
  ring(g, x, y, R, 26, alpha('#ffd9a0', 0.18 * a)); ring(g, x, y, R, 3, alpha('#ffffff', 0.7 * a));
  g.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2 + 0.2, r0 = R * 0.55, r1 = R * 0.95; g.strokeStyle = alpha(i % 2 ? '#ffe6c0' : '#ffffff', 0.5 * a); g.lineWidth = i % 2 ? 2 : 4; g.beginPath(); g.arc(x, y, lerp(r0, r1, (i % 3) / 2), an, an + 0.35); g.stroke(); }
  if (u < 0.12) glow(g, x, y, 400, '#ffffff', 0.5 * (1 - u / 0.12));
  g.restore();
}

// ---------------------------------------------------------------- hero look (this episode)
export function heroST(g, o = {}) {
  actor(g, 'HERO', o);
  if (o.flat) return;
  const p = o.pose || POSES.stand, s = o.s ?? 1, f = o.facing ?? 1, st = S(), ink = st.ink, teal = HERO.color, cream = HERO.color2 || '#efe3c8';
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  g.translate(o.x, o.y); g.scale(f * s, s); if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
  const [sx, sy] = p.sh, [hx, hy] = p.hip, L = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  // far long sleeve (the rig tee is short-sleeved)
  seg(g, [L(p.sh, p.eB, 0.6), p.eB, L(p.eB, p.hB, 0.78)], 15, shade(teal, -0.3));
  // pyjama stars + mismatched socks
  for (const [a, b, c] of [[p.hip, p.kB, p.fB], [p.hip, p.kF, p.fF]]) for (const kk of [0.3, 0.7]) { const q = L(kk < 0.5 ? a : b, kk < 0.5 ? b : c, kk < 0.5 ? kk * 2 : (kk - 0.5) * 2); star(g, q[0] + 2, q[1], 3.2, alpha('#f2e6b0', 0.85)); }
  seg(g, [L(p.kB, p.fB, 0.8), p.fB], 12, '#e8c52a'); seg(g, [L(p.kF, p.fF, 0.8), p.fF], 13, '#3fa04a');
  // stripes on the torso (clipped to the tee shape)
  g.save(); const top = sy - 7, bot = hy + 4; g.beginPath(); g.moveTo(sx - 15, top + 6); g.quadraticCurveTo(sx, top - 4, sx + 15, top + 6); g.lineTo(hx + 15, bot); g.lineTo(hx - 15, bot); g.closePath(); g.clip();
  for (let i = 0; i < 5; i++) { const yy = lerp(top + 12, bot - 6, i / 4), xx = lerp(sx, hx, i / 4); g.fillStyle = cream; g.fillRect(xx - 20, yy - 3, 40, 6); }
  g.restore();
  // near long sleeve with stripes + the chunky black watch
  const cuff = L(p.eF, p.hF, 0.74); seg(g, [L(p.sh, p.eF, 0.6), p.eF, cuff], 16.5, teal);
  for (const kk of [0.3, 0.75]) { const q = L(p.eF, p.hF, kk * 0.74); circle(g, q[0], q[1], 5.5, cream); }
  const w = L(p.eF, p.hF, 0.8), wa = Math.atan2(p.hF[1] - p.eF[1], p.hF[0] - p.eF[0]);
  g.save(); g.translate(w[0], w[1]); g.rotate(wa + Math.PI / 2); rr(g, -9, -6, 18, 12, 3); g.fillStyle = '#0c0c10'; g.fill(); rr(g, -6, -3.5, 12, 7, 2); g.fillStyle = o.watchGlow || '#9fe0b0'; g.fill(); g.restore();
  // round tortoiseshell glasses + the one cowlick
  const [ex, ey] = p.head;
  for (const dx of [2.5, 19]) { g.strokeStyle = '#7a4a22'; g.lineWidth = 3.4; g.beginPath(); g.arc(ex + dx, ey - 4, 7.5, 0, Math.PI * 2); g.stroke(); g.strokeStyle = alpha('#c88a4a', 0.9); g.lineWidth = 1.4; g.beginPath(); g.arc(ex + dx, ey - 4, 7.5, 3.6, 4.6); g.stroke(); }
  seg(g, [[ex + 10, ey - 5], [ex + 11.5, ey - 5]], 2.6, '#7a4a22'); seg(g, [[ex - 5, ey - 5], [ex - 18, ey - 7]], 2.6, '#5a3418');
  g.strokeStyle = HERO.hair || ink; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - 4, ey - 30); g.quadraticCurveTo(ex - 8, ey - 52, ex + 2, ey - 60); g.quadraticCurveTo(ex + 10, ey - 64, ex + 8, ey - 54); g.stroke();
  g.restore();
}
function star(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); }

export function heroBigFace(g, cx, cy, r, o = {}) {
  const st = S(), ink = st.ink, teal = HERO.color, cream = HERO.color2 || '#efe3c8';
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt);
  // striped long-sleeve tee: shoulders + crew neck
  g.save(); g.beginPath(); g.moveTo(-r * 1.9, r * 2.4); g.quadraticCurveTo(-r * 1.7, r * 1.12, -r * 0.6, r * 0.96); g.lineTo(r * 0.6, r * 0.96); g.quadraticCurveTo(r * 1.7, r * 1.12, r * 1.9, r * 2.4); g.closePath();
  g.fillStyle = teal; g.fill(); g.clip();
  for (let i = 0; i < 6; i++) { g.fillStyle = cream; g.fillRect(-r * 2, r * (1.12 + i * 0.26), r * 4, r * 0.11); }
  g.fillStyle = linGrad(g, 0, r * 0.9, 0, r * 2.4, [alpha('#000', 0), alpha('#000', 0.35)]); g.fillRect(-r * 2, r * 0.9, r * 4, r * 1.6);
  g.restore();
  g.strokeStyle = shade(teal, -0.35); g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(-r * 0.6, r * 0.97); g.quadraticCurveTo(0, r * 1.28, r * 0.6, r * 0.97); g.stroke();
  // shaggy hair behind the crown
  g.fillStyle = HERO.hair || ink;
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.02 + i * 0.12), L = r * (0.2 + ((i * 7) % 3) * 0.06); g.beginPath(); g.moveTo(Math.cos(a - 0.16) * r * 0.9, Math.sin(a - 0.16) * r * 0.9); g.quadraticCurveTo(Math.cos(a) * (r + L), Math.sin(a) * (r + L), Math.cos(a + 0.22) * (r + L * 0.8), Math.sin(a + 0.22) * (r + L * 0.8)); g.lineTo(Math.cos(a + 0.16) * r * 0.9, Math.sin(a + 0.16) * r * 0.9); g.closePath(); g.fill(); }
  g.restore();
  giantFace(g, cx, cy, r, { ...o, who: 'NONE', tilt: o.tilt });
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt);
  // fringe over the forehead (sits above the brows) + the cowlick standing straight up
  g.fillStyle = HERO.hair || ink; g.beginPath(); g.moveTo(-r * 0.95, -r * 0.3); for (let i = 0; i <= 8; i++) { const x = lerp(-r * 0.92, r * 0.92, i / 8), y = -r * (0.62 + (i % 2) * 0.12) - Math.cos((i / 8 - 0.5) * Math.PI) * r * 0.18; g.lineTo(x, y); } g.lineTo(r * 0.95, -r * 0.3); g.arc(0, 0, r, -0.3, Math.PI + 0.3, true); g.fill();
  g.strokeStyle = HERO.hair || ink; g.lineWidth = r * 0.09; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * 0.1, -r * 0.92); g.quadraticCurveTo(-r * 0.2, -r * 1.35, r * 0.05, -r * 1.5); g.quadraticCurveTo(r * 0.25, -r * 1.56, r * 0.2, -r * 1.36); g.stroke();
  g.strokeStyle = alpha(shade(ink, 0.6), 0.5); g.lineWidth = r * 0.02; g.beginPath(); g.moveTo(-r * 0.4, -r * 0.82); g.quadraticCurveTo(0, -r * 0.92, r * 0.4, -r * 0.8); g.stroke();
  // round tortoiseshell glasses
  const ex = r * 0.34, ey = -r * 0.04, gr = r * 0.27;
  for (const s of [-1, 1]) {
    g.strokeStyle = '#6a3c1a'; g.lineWidth = r * 0.065; g.beginPath(); g.arc(s * ex, ey, gr, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = alpha('#c88a4a', 0.9); g.lineWidth = r * 0.025; g.beginPath(); g.arc(s * ex, ey, gr, 3.5, 4.5); g.stroke(); g.beginPath(); g.arc(s * ex, ey, gr, 0.3, 0.9); g.stroke();
    g.fillStyle = alpha('#ffffff', 0.12); g.beginPath(); g.moveTo(s * ex - gr * 0.6, ey - gr * 0.5); g.lineTo(s * ex - gr * 0.1, ey - gr * 0.85); g.lineTo(s * ex + gr * 0.1, ey - gr * 0.6); g.lineTo(s * ex - gr * 0.45, ey - gr * 0.2); g.closePath(); g.fill();
    seg(g, [[s * (ex + gr), ey - r * 0.04], [s * r * 0.98, ey - r * 0.1]], r * 0.05, '#5a3418');
  }
  g.strokeStyle = '#6a3c1a'; g.lineWidth = r * 0.055; g.beginPath(); g.moveTo(-ex + gr, ey - r * 0.02); g.quadraticCurveTo(0, ey - r * 0.12, ex - gr, ey - r * 0.02); g.stroke();
  g.restore();
}
