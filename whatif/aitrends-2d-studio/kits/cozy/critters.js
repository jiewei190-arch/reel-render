// kits/cozy/critters.js — the three reusable character rigs (front view, chubby, short legs, big heads) + expressions.
//   critter(g, 'mango'|'pebble'|'biscuit', x, y, s, {pose, face, t, flip})   -> anchors {head, hL, hR, mouth, top, headR}
//   x,y = floor point between the feet (or the bottom of the loaf). Standing Mango at s=1 is ~330 units tall.
import { PAL, C, shape, oval, dot, wline, tube, curve, heart, sparkle, sweat, at, starPts } from './base.js';
import { clamp, lerp, mixVal, noise } from '/engine/core.js';

export const KINDS = {
  mango:   { name: 'Mango',   fur: '#f59a4a', dark: '#de7a34', belly: '#fdebcf', inner: '#f7b0a0', nose: '#ee8a8a', ears: 'cat',   tail: 'cat',  stripes: true, head: [118, 98], body: [90, 76], neck: 205 },
  pebble:  { name: 'Pebble',  fur: '#cdc9d6', dark: '#a9a4b8', belly: '#f6f3f8', inner: '#f7b9c6', nose: '#f19aae', ears: 'bunny', tail: 'puff', teeth: true,  head: [110, 94], body: [86, 74], neck: 200 },
  biscuit: { name: 'Biscuit', fur: '#c0845a', dark: '#9b653e', belly: '#f0d0a4', inner: '#e8b88c', nose: '#4a2c20', ears: 'bear',  tail: 'nub',  muzzle: true,  head: [122, 102], body: [100, 84], neck: 214 },
};
// expressions (face presets). Any field can be overridden: {...EXPR.happy, look:[1,0]}
export const EXPR = {
  calm:    { eyes: 'open',    mouth: 'w',      blush: 0.6 },
  sleepy:  { eyes: 'closed',  mouth: 'w',      blush: 0.6 },
  drowsy:  { eyes: 'sleepy',  mouth: 'w',      blush: 0.6 },
  hungry:  { eyes: 'wide',    mouth: 'o',      blush: 0.5 },
  happy:   { eyes: 'happy',   mouth: 'open',   blush: 1 },
  blush:   { eyes: 'happy',   mouth: 'w',      blush: 1.4, lines: true },
  spicy:   { eyes: 'squeeze', mouth: 'open',   blush: 0.6, spicy: 1, sweat: true },
  sweat:   { eyes: 'open',    mouth: 'wavy',   blush: 0.4, sweat: true, brows: 'worried' },
  heart:   { eyes: 'heart',   mouth: 'open',   blush: 1.1 },
  sparkle: { eyes: 'sparkle', mouth: 'w',      blush: 0.9 },
  beg:     { eyes: 'sparkle', mouth: 'o',      blush: 0.9, brows: 'worried' },
  chew:    { eyes: 'happy',   mouth: 'chew',   blush: 1.2, cheeks: 1 },
  sneaky:  { eyes: 'sneaky',  mouth: 'w',      blush: 0.5, look: [1, 0] },
  focus:   { eyes: 'open',    mouth: 'tongue', blush: 0.6, brows: 'focus' },
  sip:     { eyes: 'closed',  mouth: 'sip',    blush: 1 },
  shock:   { eyes: 'dots',    mouth: 'o',      blush: 0.3 },
  content: { eyes: 'closed',  mouth: 'smile',  blush: 1.2, lines: true },
};
export const POSES = {
  stand: { armL: 0.25, armR: 0.25 },
  idle:  { armL: 0.18, armR: 0.3, tilt: 0.05 },
  wave:  { armL: 0.25, armR: 2.6 },
  cheer: { armL: 2.5, armR: 2.5, bob: -8 },
  hold:  { armL: -0.55, armR: -0.55 },          // both paws in front of the tummy (a bowl)
  offer: { armL: -1.1, armR: -1.1 },            // holding something up/forward
  sneak: { armL: 2.45, armR: 2.45, lean: 0.05 }, // paws up by the chin, tiptoe
  eat:   { armL: -0.5, armR: -2.45 },           // right paw to the mouth (spoon)
  sip:   { armL: -0.5, armR: -2.2 },
  pat:   { armL: -0.85, armR: -0.85, lean: -0.06 },
  reach: { armL: 0.25, armR: 1.45 },
  stir:  { armL: -0.6, armR: -1.0 },
  shrug: { armL: 1.2, armR: 1.2, tilt: 0.12 },
  loaf:  { loaf: true },
};
export const poseMix = (a, b, k) => mixVal(typeof a === 'string' ? POSES[a] : a, typeof b === 'string' ? POSES[b] : b, clamp(k));
const P0 = { armL: 0.25, armR: 0.25, lean: 0, bob: 0, liftL: 0, liftR: 0, tilt: 0, squash: 1, loaf: false };

// ---------------------------------------------------------------- eyes / mouth
function eye(g, x, y, st, f, side) {
  const lk = f.look || [0, 0], bl = clamp(f.blink || 0), ex = x + lk[0] * 7, ey = y + lk[1] * 6;
  const shine = (r1, r2) => { dot(g, ex + 5.5, ey - 7, r1, '#fff'); dot(g, ex - 5, ey + 6, r2, '#fff'); };
  if ((st === 'open' || st === 'wide' || st === 'sparkle' || st === 'sneaky') && bl > 0.8) st = 'closed';
  const ry = (r) => r * (1 - bl * 0.85);
  switch (st) {
    case 'open': oval(g, ex, ey, 15, ry(19), { fill: PAL.ink, line: false }); shine(6, 3); break;
    case 'wide': oval(g, ex, ey, 18, ry(23), { fill: PAL.ink, line: false }); shine(7.5, 3.5); break;
    case 'sparkle': oval(g, ex, ey, 21, ry(26), { fill: PAL.ink, line: false }); oval(g, ex, ey + 9, 14, ry(9), { fill: '#6a4a3a', line: false }); dot(g, ex + 6, ey - 9, 8.5, '#fff'); dot(g, ex - 7, ey + 7, 4, '#fff'); sparkle(g, ex - 6, ey - 12, 6, '#fff', { line: false }); break;
    case 'dots': dot(g, ex, ey, 7, PAL.ink); break;
    case 'closed': wline(g, [[x - 15, y - 2], [x - 7, y + 6], [x + 7, y + 6], [x + 15, y - 2]], { w: C.lw * 0.9, seed: 3 + side }); break;
    case 'happy': wline(g, [[x - 15, y + 5], [x - 7, y - 5], [x + 7, y - 5], [x + 15, y + 5]], { w: C.lw * 0.9, seed: 5 + side }); break;
    case 'squeeze': { const d = side < 0 ? 1 : -1; wline(g, [[x - 12 * d, y - 10], [x + 10 * d, y], [x - 12 * d, y + 10]], { w: C.lw * 0.9, seed: 7 + side }); break; }
    case 'heart': heart(g, x, y + 2, 21, PAL.heart, { w: C.lw * 0.6, seed: 8 + side }); dot(g, x + 6, y - 5, 4, '#fff'); break;
    case 'sleepy': case 'sneaky': {
      oval(g, ex, ey + 3, 15, ry(16), { fill: PAL.ink, line: false }); dot(g, ex + 5, ey + 1, 4.5, '#fff');
      g.save(); g.fillStyle = f._fur || PAL.orange; g.fillRect(x - 22, y - 26, 44, 26); g.restore();
      wline(g, [[x - 18, y], [x + 18, y]], { w: C.lw * 0.85, seed: 9 + side }); break;
    }
  }
}
function brows(g, st, f) {
  if (!st) return;
  if (st === 'worried') { wline(g, [[-62, -38], [-34, -46]], { w: C.lw * 0.8, seed: 21 }); wline(g, [[62, -38], [34, -46]], { w: C.lw * 0.8, seed: 22 }); }
  if (st === 'focus') { wline(g, [[-62, -44], [-32, -36]], { w: C.lw * 0.8, seed: 23 }); wline(g, [[62, -44], [32, -36]], { w: C.lw * 0.8, seed: 24 }); }
}
function mouth(g, st, f, t) {
  const y = 30, lw = C.lw * 0.8;
  switch (st) {
    case 'w': wline(g, [[-17, y - 2], [-9, y + 6], [0, y]], { w: lw, seed: 31 }); wline(g, [[0, y], [9, y + 6], [17, y - 2]], { w: lw, seed: 32 }); break;
    case 'smile': wline(g, [[-16, y], [0, y + 10], [16, y]], { w: lw, seed: 33 }); break;
    case 'flat': wline(g, [[-12, y + 4], [12, y + 4]], { w: lw, seed: 34 }); break;
    case 'o': oval(g, 0, y + 8, 9, 11, { fill: '#7a3a34', w: lw * 0.8 }); break;
    case 'sip': oval(g, 6, y + 6, 6, 7, { fill: '#7a3a34', w: lw * 0.7 }); break;
    case 'open': { const o = f.open ?? 1; shape(g, [[-22, y], [22, y], [14, y + 16 * o + 6], [0, y + 22 * o + 6], [-14, y + 16 * o + 6]], { fill: '#7a3a34', w: lw, step: 12, seed: 35 }); oval(g, 0, y + 15 * o + 3, 11, 6 * o + 1, { fill: '#f08a8a', line: false }); break; }
    case 'chew': { const k = Math.sin((t || 0) * 16); wline(g, [[-12, y + 4 + k * 2], [-4, y + 9], [4, y + 2 - k * 2], [12, y + 6]], { w: lw, seed: 36 }); break; }
    case 'wavy': wline(g, [[-20, y + 6], [-10, y], [0, y + 6], [10, y], [20, y + 6]], { w: lw, seed: 37 }); break;
    case 'tongue': wline(g, [[-16, y], [0, y + 8], [16, y]], { w: lw, seed: 38 }); oval(g, 10, y + 12, 8, 9, { fill: '#f08a8a', w: lw * 0.7, seed: 39 }); break;
  }
}

// ---------------------------------------------------------------- head (centre at 0,0)
export function critterHead(g, kind, f = {}, t = 0) {
  const K = typeof kind === 'string' ? KINDS[kind] : kind; const [rx, ry] = K.head; f = { ...f, _fur: K.fur };
  const sw = Math.sin(t * 2.2) * 0.04;
  // ears behind the head
  if (K.ears === 'cat') {
    for (const sd of [-1, 1]) { const E = [[sd * 112, -28], [sd * (96 + sw * 40), -128], [sd * 34, -88]]; shape(g, E, { fill: K.fur, step: 22, seed: 40 + sd });
      const c = [sd * 82, -74]; shape(g, E.map(([x, y]) => [lerp(c[0], x, 0.55), lerp(c[1], y, 0.55) + 6]), { fill: K.inner, line: false, step: 22, seed: 42 + sd }); }
  } else if (K.ears === 'bunny') {
    oval(g, -44, -150, 27, 80, { fill: K.fur, rot: -0.16 + sw, seed: 44 }); oval(g, -44, -146, 13, 58, { fill: K.inner, line: false, rot: -0.16 + sw, seed: 45 });
    // right ear flops at the tip
    const tip = 0.5 + sw * 2; oval(g, 46, -136, 26, 66, { fill: K.fur, rot: 0.32, seed: 46 }); oval(g, 46, -134, 12, 46, { fill: K.inner, line: false, rot: 0.32, seed: 47 });
    oval(g, 92, -196, 24, 34, { fill: K.fur, rot: 0.32 + tip, seed: 48 });
  } else if (K.ears === 'bear') {
    for (const sd of [-1, 1]) { oval(g, sd * 86, -72, 36, 34, { fill: K.fur, seed: 50 + sd }); oval(g, sd * 84, -70, 19, 17, { fill: K.inner, line: false, seed: 52 + sd }); }
  }
  if (f.cheeks) for (const sd of [-1, 1]) oval(g, sd * 80, 26, 44, 36, { fill: K.fur, seed: 54 + sd });
  oval(g, 0, 0, rx, ry, { fill: K.fur, seed: 56 });
  if (K.stripes) { for (const [x, l] of [[-24, 30], [0, 40], [24, 30]]) tube(g, [[x * 1.1, -ry + 6], [x, -ry + 6 + l]], 9, K.dark, { line: false, seed: 60 + x }); for (const sd of [-1, 1]) { tube(g, [[sd * (rx - 4), -4], [sd * (rx - 26), 0]], 8, K.dark, { line: false, seed: 63 + sd }); tube(g, [[sd * (rx - 8), 18], [sd * (rx - 26), 20]], 7, K.dark, { line: false, seed: 65 + sd }); } }
  if (K.muzzle) oval(g, 0, 30, 54, 38, { fill: K.belly, w: C.lw * 0.7, seed: 58 });
  else oval(g, 0, 26, 44, 26, { fill: K.belly, line: false, seed: 58 });
  // blush / spicy red
  const b = f.blush ?? 0.6; if (b > 0) for (const sd of [-1, 1]) oval(g, sd * 72, 26, 23, 13, { fill: `rgba(245,128,140,${clamp(0.55 * b, 0, 0.9)})`, line: false, seed: 66 + sd });
  if (f.lines) for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) wline(g, [[sd * 62 + i * 9 - 9, 20], [sd * 62 + i * 9 - 13, 32]], { w: C.lw * 0.55, line: PAL.rose, seed: 70 + i + sd * 5 });
  if (f.spicy) { g.save(); g.globalAlpha *= clamp(f.spicy); oval(g, 0, 8, rx * 0.86, ry * 0.7, { fill: 'rgba(255,80,70,.32)', line: false, seed: 74 }); g.restore(); }
  eye(g, -46, -6, f.eyes || 'open', f, -1); eye(g, 46, -6, f.eyes || 'open', f, 1); brows(g, f.brows, f);
  // nose + mouth
  if (K.ears === 'bear') oval(g, 0, 14, 17, 11, { fill: K.nose, w: C.lw * 0.6, seed: 76 });
  else if (K.ears === 'bunny') oval(g, 0, 15, 9, 6.5, { fill: K.nose, w: C.lw * 0.6, seed: 76 });
  else shape(g, [[-10, 10], [10, 10], [0, 20]], { fill: K.nose, w: C.lw * 0.6, step: 8, seed: 76 });
  if (K.teeth && (f.mouth || 'w') === 'w') { shape(g, [[-7, 33], [7, 33], [7, 45], [-7, 45]], { fill: '#fff', w: C.lw * 0.55, step: 8, seed: 77 }); wline(g, [[0, 34], [0, 44]], { w: C.lw * 0.4, seed: 78 }); }
  mouth(g, f.mouth || 'w', f, t);
  if (K.ears === 'cat') for (const sd of [-1, 1]) { wline(g, [[sd * 92, 18], [sd * 132, 12]], { w: C.lw * 0.5, seed: 80 + sd }); wline(g, [[sd * 92, 30], [sd * 130, 34]], { w: C.lw * 0.5, seed: 82 + sd }); }
  if (f.sweat) sweat(g, 96, -52, 1.1);
}

// ---------------------------------------------------------------- full body
function tail(g, K, p, t) {
  const sw = Math.sin(t * 2.4) * 14;
  if (K.tail === 'cat') {
    const pts = p.loaf ? curve([[110, -40], [120, -8], [60, 6], [-30, 8], [-96, -6]], 10) : curve([[54, -44], [118, -64], [150 + sw * 0.4, -130], [128 + sw, -196]], 10);
    tube(g, pts, 30, K.fur, { seed: 90 });
    for (let i = 3; i < pts.length - 2; i += 7) { const a = pts[i], b = pts[Math.min(pts.length - 1, i + 2)]; tube(g, [a, b], 22, K.dark, { line: false, seed: 91 + i }); }
  } else if (K.tail === 'puff') oval(g, p.loaf ? 120 : 76, p.loaf ? -40 : -52, 28, 26, { fill: '#fff', seed: 92 });
  else oval(g, p.loaf ? 118 : 80, p.loaf ? -36 : -46, 18, 16, { fill: K.fur, seed: 93 });
}
function arm(g, K, px, py, a, side) {
  const r = side < 0 ? a : -a, c = Math.cos(r), s = Math.sin(r);
  const cx = px - s * 24, cy = py + c * 24;
  oval(g, cx, cy, 21, 34, { fill: K.fur, rot: r, seed: 95 + side });
  return [px - s * 52, py + c * 52];
}
export function critter(g, kind, x, y, s = 1, o = {}) {
  const K = KINDS[kind] || kind; const p = { ...P0, ...(typeof o.pose === 'string' ? POSES[o.pose] : o.pose || {}) };
  const f = typeof o.face === 'string' ? EXPR[o.face] : (o.face || EXPR.calm), t = o.t ?? C.now, flip = o.flip || 1;
  const [bx, by] = K.body; let A = {};
  at(g, x, y, s, (g) => {
    if (o.shadow !== false) oval(g, 0, 0, p.loaf ? 150 : 104, 16, { fill: 'rgba(70,40,25,.18)', line: false });
    if (p.loaf) {
      g.save(); g.scale(p.squash, 1 / p.squash); g.translate(0, 0);
      oval(g, 0, -64, 132, 66, { fill: K.fur, seed: 100 }); oval(g, 6, -44, 76, 30, { fill: K.belly, line: false, seed: 101 });
      if (K.stripes) for (const sx of [-70, -40, 40, 70]) tube(g, [[sx, -124], [sx * 1.05, -100]], 10, K.dark, { line: false, seed: 102 + sx });
      tail(g, K, p, t);
      for (const sd of [-1, 1]) oval(g, sd * 44 - 20, -8, 28, 15, { fill: K.fur, seed: 104 + sd });
      g.restore();
      g.save(); g.translate(-26, -150 + p.bob); g.rotate(p.tilt - 0.12); critterHead(g, K, f, t); g.restore();
      A = { head: [-26, -150], hL: [-64, -8], hR: [24, -8], mouth: [-26, -120], top: [-26, -260] };
      return;
    }
    tail(g, K, p, t);
    for (const [sd, lift] of [[-1, p.liftL], [1, p.liftR]]) oval(g, sd * 44, -14 - lift, 30, 20, { fill: K.fur, seed: 110 + sd });
    g.save(); g.translate(0, -30 + p.bob); g.rotate(p.lean); g.scale(p.squash, 1 / p.squash); g.translate(0, 30);
    oval(g, 0, -bx * 0.92, bx, by, { fill: K.fur, seed: 112 }); oval(g, 0, -bx * 0.82, bx * 0.6, by * 0.6, { fill: K.belly, line: false, seed: 113 });
    if (K.stripes) for (const sd of [-1, 1]) { tube(g, [[sd * (bx - 6), -96], [sd * (bx - 28), -92]], 9, K.dark, { line: false, seed: 114 + sd }); tube(g, [[sd * (bx - 4), -70], [sd * (bx - 24), -68]], 8, K.dark, { line: false, seed: 116 + sd }); }
    const hy = -K.neck;
    const armsBehind = o.armsBehind; let hL, hR;
    if (armsBehind) { hL = arm(g, K, -bx * 0.78, -128, p.armL, -1); hR = arm(g, K, bx * 0.78, -128, p.armR, 1); }
    g.save(); g.translate(0, hy); g.rotate(p.tilt); critterHead(g, K, f, t); g.restore();
    if (!armsBehind) { hL = arm(g, K, -bx * 0.78, -128, p.armL, -1); hR = arm(g, K, bx * 0.78, -128, p.armR, 1); }
    g.restore();
    A = { head: [0, hy - 30 + p.bob], hL: [hL[0], hL[1] + p.bob], hR: [hR[0], hR[1] + p.bob], mouth: [0, hy - 30 + 30 + p.bob], top: [0, hy - 30 - K.head[1] - 40 + p.bob] };
  }, { flip });
  // local -> world (ignores lean, which is small)
  const W = (pt) => [x + pt[0] * s * flip, y + pt[1] * s];
  return { head: W(A.head), hL: W(flip > 0 ? A.hL : A.hR), hR: W(flip > 0 ? A.hR : A.hL), mouth: W(A.mouth), top: W(A.top), headR: K.head[0] * s };
}
// tiptoe walk cycle: returns pose for phase (0..1 per two steps)
export function tiptoe(phase, base = 'sneak') {
  const s = Math.sin(phase * Math.PI * 2);
  return { ...POSES[base], liftL: Math.max(0, s) * 22, liftR: Math.max(0, -s) * 22, bob: -Math.abs(s) * 14, tilt: s * 0.06, lean: 0.06 + s * 0.03 };
}
// sleeping under a blanket on a futon (head on the pillow, blanket breathing). x,y = pillow centre. blanket colour.
export function sleeper(g, kind, x, y, s = 1, o = {}) {
  const t = o.t ?? C.now, br = Math.sin(t * 1.6 + (o.phase || 0)) * 0.03, K = KINDS[kind];
  at(g, x, y, s, (g) => {
    g.save(); g.translate(0, -10); g.rotate(-0.22 * (o.flip || 1)); critterHead(g, K, { ...EXPR.sleepy, ...(o.face || {}) }, t); g.restore();
    const bw = o.bw || 300; g.save(); g.translate(150, 40); g.scale(1, 1 + br);
    shape(g, [[-120, -60], [bw * 0.5, -78], [bw, -40], [bw + 10, 60], [-130, 70], [-150, 0]], { fill: o.blanket || PAL.sage, step: 40, seed: 130 });
    for (let i = 0; i < 3; i++) wline(g, [[-60 + i * 110, -50], [-40 + i * 110, 40]], { w: C.lw * 0.6, line: 'rgba(91,58,41,.35)', seed: 131 + i });
    g.restore();
  }, { flip: o.flip || 1 });
}
