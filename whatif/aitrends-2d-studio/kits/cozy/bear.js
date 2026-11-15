// kits/cozy/bear.js — the owner's hero (cream bear cub with a blue nightcap), rigged from the owner's own PNGs.
// Layers cut by tools/prep_owner.py into kits/cozy/owner/: head (face erased), body, nightcap; turnaround views q / side / back.
// Face, arms/paws, walking feet and expressions are drawn in code in the same style (thick warm-brown outline, cream fill).
//
//   bear(g, x, y, s, {view:'front'|'q'|'side'|'back', face, arms, t, walk, flip, hat:{slide, tilt}, breathe, squash, tilt, bob, prop})
//     x,y = floor point under the feet. s = 1 -> ~450 units tall (1080x1920 stage).
//     returns anchors {head:[x,y], mouth:[x,y], pawL:[x,y], pawR:[x,y], top:[x,y], hatTip:[x,y]}
import { C, tube, oval, wline, shape, heart, sweat, sparkle, dot } from './base.js';
import { E, clamp, lerp, ease, noise, alpha, mix } from '/engine/core.js';

const IMG = {}; const NAMES = ['bear_head', 'bear_body', 'bear_hat', 'bear_q', 'bear_side', 'bear_back', 'bear_front', 'bg_bedroom', 'bg_kitchen', 'bg_table', 'bg_table_empty'];
await Promise.all(NAMES.map(n => new Promise((res) => { const im = new Image(); im.onload = () => { IMG[n] = im; res(); }; im.onerror = () => { console.log('ERROR missing sprite', n); res(); }; im.src = `/kits/cozy/owner/${n}.png`; })));
export const SPRITES = IMG;

export const BEAR = { out: '#6b3612', cream: '#feeacc', creamDk: '#f7d7aa', peach: '#fcc795', blush: '#f7a39a', eye: '#5e2e10', hat: '#9fbae0', tongue: '#f08c84', mouthIn: '#8a3b2a' };
const K0 = 0.42;                 // main_pose px -> stage units at s = 1
const FEET = [627, 1192];        // main_pose ground point
const LW = 15;                   // outline width in main_pose px (matches the owner's line)
const TURN = 1.74;               // turnaround px -> main_pose px

// ---------------------------------------------------------------- expressions (owner sheet + extras)
export const FACES = {
  smile:  { eyes: 'dot', mouth: 'smile' },
  happy:  { eyes: 'dot', mouth: 'open' },
  grumpy: { eyes: 'lid', mouth: 'frown' },          // sleepy-grumpy
  o:      { eyes: 'dot', mouth: 'o' },              // surprised
  alarm:  { eyes: 'big', mouth: 'o', blush: 0.3 },  // "!" moment
  bliss:  { eyes: 'arc', mouth: 'open', blush: 0.6 },// eating, blissful closed eyes
  chew:   { eyes: 'arc', mouth: 'chew', blush: 0.6, cheeks: 1 },
  yawn:   { eyes: 'squint', mouth: 'yawn' },        // >o<
  sleep:  { eyes: 'closed', mouth: 'small' },
  drowsy: { eyes: 'half', mouth: 'small' },
  sip:    { eyes: 'closed', mouth: 'sip', blush: 0.4 },
  love:   { eyes: 'heart', mouth: 'open', blush: 0.6 },
  sweat:  { eyes: 'dot', mouth: 'wavy', sweat: true },
  focus:  { eyes: 'dot', mouth: 'tongue' },
};

function eye(g, x, y, st, blink, look) {
  const lx = x + (look?.[0] || 0) * 14, ly = y + (look?.[1] || 0) * 10, w = LW * 0.95;
  if ((st === 'dot' || st === 'big') && blink > 0.75) st = 'closed';
  const sy = 1 - blink * 0.85;
  switch (st) {
    case 'dot': g.save(); g.translate(lx, ly); g.scale(1, sy); dot(g, 0, 0, 25, BEAR.eye, { wob: 0.4 }); g.restore(); break;
    case 'big': g.save(); g.translate(lx, ly); g.scale(1, sy); dot(g, 0, 0, 32, BEAR.eye, { wob: 0.4 }); dot(g, 9, -11, 9, '#fff', { wob: 0.3 }); g.restore(); break;
    case 'arc': wline(g, [[x - 30, y + 12], [x - 12, y - 10], [x + 12, y - 10], [x + 30, y + 12]], { w, line: BEAR.eye, wob: 0.6 }); break;           // ^
    case 'closed': wline(g, [[x - 30, y - 6], [x - 12, y + 12], [x + 12, y + 12], [x + 30, y - 6]], { w, line: BEAR.eye, wob: 0.6 }); break;         // u
    case 'lid': wline(g, [[x - 34, y + 2], [x + 34, y + 2]], { w: w * 1.1, line: BEAR.eye, wob: 0.6 }); wline(g, [[x - 26, y + 14], [x + 26, y + 14]], { w: w * 0.6, line: BEAR.eye, wob: 0.6 }); break;
    case 'half': g.save(); g.beginPath(); g.rect(x - 40, y, 80, 60); g.clip(); dot(g, lx, ly, 25, BEAR.eye, { wob: 0.4 }); g.restore(); wline(g, [[x - 32, y], [x + 32, y]], { w: w * 0.9, line: BEAR.eye, wob: 0.6 }); break;
    case 'squint': { const d = x < 620 ? 1 : -1; wline(g, [[x - 26 * d, y - 20], [x + 20 * d, y], [x - 26 * d, y + 20]], { w, line: BEAR.eye, wob: 0.6 }); break; }
    case 'heart': heart(g, x, y, 40, '#ff7d94', { w: LW * 0.7, line: BEAR.out }); break;
  }
}
function mouth(g, st, t, o) {
  const x = 622, y = 742, w = LW * 0.9;
  switch (st) {
    case 'smile': wline(g, [[x - 54, y - 12], [x - 24, y + 14], [x + 24, y + 14], [x + 54, y - 12]], { w, line: BEAR.out, wob: 0.6 }); break;
    case 'small': wline(g, [[x - 22, y - 2], [x, y + 8], [x + 22, y - 2]], { w, line: BEAR.out, wob: 0.6 }); break;
    case 'frown': wline(g, [[x - 26, y + 12], [x, y], [x + 26, y + 12]], { w, line: BEAR.out, wob: 0.6 }); break;
    case 'o': oval(g, x, y + 8, 20, 24, { fill: BEAR.mouthIn, w: w * 0.8, line: BEAR.out, wob: 0.6 }); oval(g, x, y + 20, 10, 6, { fill: BEAR.tongue, line: false }); break;
    case 'sip': oval(g, x + 4, y + 4, 14, 15, { fill: BEAR.mouthIn, w: w * 0.8, line: BEAR.out, wob: 0.5 }); break;
    case 'open': { const k = o.open ?? 1; shape(g, [[x - 56, y - 14], [x + 56, y - 14], [x + 40, y + 20 * k + 6], [x, y + 40 * k + 8], [x - 40, y + 20 * k + 6]], { fill: BEAR.mouthIn, w: w * 0.85, line: BEAR.out, step: 16, wob: 0.6 }); oval(g, x, y + 22 * k + 4, 26, 12 * k + 2, { fill: BEAR.tongue, line: false }); break; }
    case 'yawn': oval(g, x, y + 30, 40, 62, { fill: BEAR.mouthIn, w: w * 0.85, line: BEAR.out, wob: 0.6 }); oval(g, x, y + 66, 26, 18, { fill: BEAR.tongue, line: false }); break;
    case 'chew': { const k = Math.sin(t * 15); wline(g, [[x - 30, y + 4 + k * 4], [x - 10, y + 14], [x + 10, y + 2 - k * 4], [x + 30, y + 10]], { w, line: BEAR.out, wob: 0.6 }); break; }
    case 'wavy': wline(g, [[x - 40, y + 10], [x - 20, y], [x, y + 10], [x + 20, y], [x + 40, y + 10]], { w, line: BEAR.out, wob: 0.6 }); break;
    case 'tongue': wline(g, [[x - 40, y - 6], [x, y + 14], [x + 40, y - 6]], { w, line: BEAR.out, wob: 0.6 }); oval(g, x + 22, y + 20, 16, 18, { fill: BEAR.tongue, w: w * 0.7, line: BEAR.out, wob: 0.5 }); break;
  }
}
function face(g, f, t, o) {
  const blink = o.blink ?? autoBlink(t, o.seed || 1);
  if (f.cheeks) for (const cx of [355, 890]) oval(g, cx, 740, 120, 80, { fill: alpha(BEAR.blush, 0.35 * f.cheeks), line: false });
  if (f.blush) for (const cx of [355, 890]) oval(g, cx, 730, 95, 62, { fill: alpha('#f78a8a', 0.35 * f.blush), line: false });
  eye(g, 478, 652, f.eyes || 'dot', blink, o.look); eye(g, 768, 652, f.eyes || 'dot', blink, o.look);
  mouth(g, f.mouth || 'smile', t, o);
  if (f.sweat) sweat(g, 980, 520, 2.6, { line: BEAR.out, w: LW * 0.7 });
}
// natural blink: quick close every ~3 s (deterministic)
export function autoBlink(t, seed = 1) { const per = 2.6 + (seed % 3) * 0.7, ph = ((t + seed * 0.37) % per); return ph < 0.14 ? Math.sin(ph / 0.14 * Math.PI) : 0; }

// ---------------------------------------------------------------- arms
// arms: [angle, extra length]. angle measured from straight DOWN toward the OUTSIDE (L: screen-left, R: screen-right);
//   0 = down, PI/2 = straight out, PI = straight up, negative = across the body (-1.2 tummy, -2.4 up by the chin).
export const ARMS = {
  rest:  { L: [-0.5, -10], R: [-0.5, -10] },
  up:    { L: [2.6, 40], R: [2.6, 40] },           // cheer / "!"
  chest: { L: [-2.3, 10], R: [-2.3, 10] },          // paws up by the chin (surprised)
  hold:  { L: [-1.15, 10], R: [-1.15, 10] },        // both paws in front of the tummy (bowl / pan)
  spoon: { L: [-1.0, 0], R: [-2.5, 60] },           // right paw raised to the mouth with a spoon
  sip:   { L: [-1.0, 0], R: [-2.3, 30] },
  stir:  { L: [-0.7, 0], R: [-1.0, 40] },
  wave:  { L: [-0.5, -10], R: [2.7, 50] },
  pat:   { L: [-1.35, -5], R: [-1.35, -5] },
  reach: { L: [-0.5, -10], R: [1.6, 80] },
  doze:  { L: [-0.9, 0], R: [-0.9, 0] },
};
const SH = { L: [470, 1000], R: [784, 1000] };
export function armPt(side, a, len) { const base = SH[side], L = 70 + len, sd = side === 'L' ? -1 : 1; return [base[0] + sd * Math.sin(a) * L, base[1] + Math.cos(a) * L]; }
function drawArm(g, side, a, len) {
  const base = SH[side], p = armPt(side, a, len);
  tube(g, [base, p], 74, BEAR.cream, { line: BEAR.out, lw: LW * 0.9, wob: 0.6 });
  oval(g, p[0], p[1], 44, 40, { fill: BEAR.cream, line: BEAR.out, w: LW * 0.9, wob: 0.6 });
  wline(g, [[p[0] - 18, p[1] + 10], [p[0], p[1] + 22], [p[0] + 18, p[1] + 10]], { w: LW * 0.55, line: BEAR.out, wob: 0.4 });
  return p;
}

// ---------------------------------------------------------------- bear
export function bear(g, x, y, s = 1, o = {}) {
  const t = o.t ?? C.now, view = o.view || 'front', flip = o.flip || 1, k = K0 * s;
  const br = o.breathe ?? 1, breath = Math.sin(t * 2.3) * 0.018 * br;
  const sq = o.squash ?? 1;
  const lw0 = C.lw, wb = C.wob; C.lw = LW; C.wob = 0.7;
  let A = {};
  g.save(); g.translate(x, y); g.scale(k * flip, k);
  try {
    if (view === 'front') A = front(g, t, o, breath, sq);
    else A = turn(g, view, t, o, breath, sq);
  } finally { g.restore(); C.lw = lw0; C.wob = wb; }
  const W = (p) => [x + p[0] * k * flip, y + p[1] * k];
  const out = {}; for (const kk in A) out[kk] = W(A[kk]); return out;
}
function front(g, t, o, breath, sq) {
  const f = typeof o.face === 'string' ? FACES[o.face] : (o.face || FACES.smile);
  const bob = (o.bob || 0) - Math.max(0, breath) * 40;
  const arms = typeof o.arms === 'string' ? ARMS[o.arms] : (o.arms || ARMS.rest);
  g.translate(0, 0); g.scale(1 / sq, sq * (1 + breath));          // squash & stretch from the floor
  g.translate(-FEET[0], -FEET[1]);
  oval(g, FEET[0], FEET[1] - 4, 300, 34, { fill: 'rgba(60,30,40,.18)', line: false });
  const B = IMG.bear_body, H = IMG.bear_head, HT = IMG.bear_hat;
  if (o.armsBehind) { drawArm(g, 'L', arms.L[0], arms.L[1]); drawArm(g, 'R', arms.R[0], arms.R[1]); }
  if (B) g.drawImage(B, 380, 890);
  // head
  const tilt = (o.tilt || 0) + noise(t * 0.4, 5) * 0.015;
  const hs = o.headSquash ?? 1;
  g.save(); g.translate(627, 990 + bob); g.rotate(tilt); g.scale(1 / hs, hs); g.translate(-627, -990);
  if (H) g.drawImage(H, 140, 250);
  face(g, f, t, o);
  // nightcap: pivots on the band, sways (pom-pom) with head motion, can slide down over the eyes
  const hat = o.hat || {}; const slide = hat.slide || 0, sway = (hat.sway ?? 1) * (Math.sin(t * 1.9) * 0.035 + noise(t * 0.8, 9) * 0.03);
  if (HT && hat.off !== true) { g.save(); g.translate(625, 372 + slide * 300); g.rotate((hat.tilt || 0) + sway + slide * 0.12); g.scale(1 + slide * 0.12, 1 + slide * 0.12); g.translate(-625, -372); g.drawImage(HT, 440, 100); g.restore(); }
  g.restore();
  let pL = null, pR = null;
  if (!o.armsBehind) { pL = drawArm(g, 'L', arms.L[0], arms.L[1]); pR = drawArm(g, 'R', arms.R[0], arms.R[1]); }
  else { pL = armPt('L', arms.L[0], arms.L[1]); pR = armPt('R', arms.R[0], arms.R[1]); }
  const sc = (p) => [(p[0] - FEET[0]) / sq, (p[1] - FEET[1]) * sq * (1 + breath)];
  return { head: sc([627, 650 + bob]), mouth: sc([622, 750 + bob]), pawL: sc(pL), pawR: sc(pR), top: sc([627, 120 + bob]), hatTip: sc([855, 232 + bob]) };
}
// turnaround views (q = 3/4, side = profile facing left, back). walk = phase (0..1 per step pair) for a waddle with real feet.
function turn(g, view, t, o, breath, sq) {
  const im = IMG['bear_' + view]; if (!im) return {};
  const gx = view === 'side' ? 225 : im.width / 2, gy = view === 'side' ? 667 : 677;
  const walking = o.walk != null; const ph = walking ? o.walk : 0, s2 = Math.sin(ph * Math.PI * 2);
  const bob = walking ? -Math.abs(s2) * 22 : 0, rock = walking ? s2 * 0.06 : noise(t * 0.4, 3) * 0.01;
  g.scale(TURN, TURN); g.scale(1 / sq, sq * (1 + breath));
  oval(g, 0, -3, 170, 18, { fill: 'rgba(60,30,40,.18)', line: false });
  // walking feet (side view): peach ovals stepping under the body
  const feet = (front) => { if (view !== 'side' && !walking) return; for (const [i, sd] of [[0, 1], [1, -1]]) { if ((i === 1) !== front) continue;
      const sw = walking ? Math.sin((ph + i * 0.5) * Math.PI * 2) : 0, lift = walking ? Math.max(0, Math.cos((ph + i * 0.5) * Math.PI * 2)) * 16 : 0;
      oval(g, -60 + sw * -38 + i * 46 - (view === 'side' ? 0 : 0), -14 - lift, 38, 20, { fill: front ? BEAR.peach : mix(BEAR.peach, '#c08060', 0.25), line: BEAR.out, w: 9, wob: 0.5 }); } };
  if (view === 'side') feet(false);
  g.save(); g.translate(0, bob); g.rotate(rock); g.drawImage(im, -gx, -gy); g.restore();
  if (view === 'side') feet(true);
  return view === 'side' ? { head: [-60, -640], top: [0, -1060], mouth: [-300, -560], pawL: [-120, -260], pawR: [-120, -260] } : { head: [0, -640], top: [0, -1060], mouth: [0, -560], pawL: [-140, -300], pawR: [140, -300] };
}

// ---------------------------------------------------------------- owner backgrounds (1080x1920)
// bgImage(g, 'bedroom'|'kitchen'|'table'|'table_empty', {lamp: 0..1}) draws the owner's room. lamp < 1 dims the warm glow (lamp click).
export function bgImage(g, name, o = {}) {
  const im = IMG['bg_' + name]; if (im) g.drawImage(im, 0, 0, E.W, E.H);
  const lamp = o.lamp ?? 1;
  if (lamp < 1) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = alpha('#3d3a72', (1 - lamp) * 0.75); g.fillRect(0, 0, E.W, E.H); g.restore(); }
}
// anchors inside the owner's rooms (stage units)
export const ROOM = {
  bedroom: { pillow: [430, 905], quilt: [[0, 1085], [120, 1040], [330, 1000], [520, 985], [700, 990], [700, 1500], [0, 1500]], lamp: [900, 900], window: [480, 400], floor: 1450 },
  kitchen: { counter: 960, floor: 1520, sink: [770, 920], light: [300, 650], fridge: [44, 1018, 392, 312] },   // fridge = the sage under-counter unit (x,y,w,h)
  table: { burner: [330, 1022], bowl: [810, 1050], top: 1100, front: [[0, 1092], [1080, 1092], [1080, 1920], [0, 1920]], floor: 1450 },
};
// redraw part of a background on top (to put the bear behind the quilt / the table): clip polygon in stage units
export function bgOver(g, name, poly, o = {}) { g.save(); g.beginPath(); poly.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); bgImage(g, name, o); g.restore(); }
// the sage under-counter fridge (kitchen): open 0..1 swings the door, lit interior with leftovers
export function kitchenFridge(g, open = 0, o = {}) {
  if (open <= 0) return null; const [x, y, w, h] = ROOM.kitchen.fridge;
  g.save(); g.fillStyle = '#fff3d2'; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + 10, y + 10, w - 20, h * 0.35); g.restore();
  shape(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { fill: null, w: 9, line: BEAR.out });
  wline(g, [[x + 10, y + h * 0.5], [x + w - 10, y + h * 0.5]], { w: 7, line: '#d6c09a' });
  if (o.items !== false) {
    // rice tub, eggs, cheese, milk, ham, scallions (owner-style chunky shapes)
    shape(g, [[x + 40, y + h * 0.5], [x + 170, y + h * 0.5], [x + 160, y + h * 0.5 - 70], [x + 50, y + h * 0.5 - 70]], { fill: '#fbfaf2', w: 7, line: BEAR.out });
    shape(g, [[x + 34, y + h * 0.5 - 70], [x + 176, y + h * 0.5 - 70], [x + 176, y + h * 0.5 - 88], [x + 34, y + h * 0.5 - 88]], { fill: '#a8bf8c', w: 7, line: BEAR.out });
    for (let i = 0; i < 3; i++) oval(g, x + 230 + i * 40, y + h * 0.5 - 28, 18, 24, { fill: '#fffaf0', w: 6, line: BEAR.out });
    shape(g, [[x + 40, y + h - 10], [x + 120, y + h - 10], [x + 120, y + h - 90], [x + 80, y + h - 120], [x + 40, y + h - 90]], { fill: '#fdfcf6', w: 7, line: BEAR.out });
    shape(g, [[x + 40, y + h - 70], [x + 120, y + h - 70], [x + 120, y + h - 45], [x + 40, y + h - 45]], { fill: '#9fbae0', line: false });
    shape(g, [[x + 150, y + h - 10], [x + 250, y + h - 10], [x + 250, y + h - 40], [x + 150, y + h - 40]], { fill: '#ffc93d', w: 7, line: BEAR.out });
    oval(g, x + 320, y + h - 30, 44, 22, { fill: '#f4a0a6', w: 7, line: BEAR.out });
  }
  const dw = w * Math.cos(open * Math.PI * 0.45);                 // door swings toward camera-left
  shape(g, [[x, y], [x - (w - dw) * 0.7, y - 30 * open], [x - (w - dw) * 0.7, y + h + 30 * open], [x, y + h]], { fill: '#c9d3a6', w: 9, line: BEAR.out, step: 60 });
  return [x + w / 2, y + h * 0.4];
}
