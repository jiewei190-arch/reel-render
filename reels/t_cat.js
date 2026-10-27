// t_cat.js: "Why does a cat always land on its feet?" in the cel-boil style, 1080x1920 portrait.
// Every frame is a pure function of t (seek). Drawing uses the cel-boil engine primitives (boiled ink, flat fills, hatching).
import { PAL, clamp, lerp, sstep, E, circlePts, resample, inkStroke, inkLoop, fillShape } from './styles/celboil/js/engine.js';

const W = 1080, H = 1920, CX = 540;
const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const SEG = window.TL.p;

// ---------------------------------------------------------------- paper (static, cached)
const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
await document.fonts.load('700 80px Caveat');
const PAPER_IMG = await load('styles/celboil/assets/paper_base.jpg');
const TOOTH_IMG = await load('styles/celboil/assets/paper_tooth.png');
const DUST = [await load('styles/celboil/assets/dust_ink_01.png'), await load('styles/celboil/assets/dust_ink_02.png'), await load('styles/celboil/assets/dust_ink_03.png'), await load('styles/celboil/assets/dust_ink_04.png')];
const PAPER = document.createElement('canvas'); PAPER.width = W; PAPER.height = H;
{
  const p = PAPER.getContext('2d');
  p.fillStyle = PAL.cream; p.fillRect(0, 0, W, H);
  const s = Math.max(W / PAPER_IMG.width, H / PAPER_IMG.height);
  p.globalAlpha = 0.85;
  p.drawImage(PAPER_IMG, (W - PAPER_IMG.width * s) / 2, (H - PAPER_IMG.height * s) / 2, PAPER_IMG.width * s, PAPER_IMG.height * s);
  p.globalAlpha = 0.5; p.globalCompositeOperation = 'multiply';
  p.drawImage(TOOTH_IMG, 0, 0, W, H);
  p.globalAlpha = 1; p.globalCompositeOperation = 'source-over';
  for (let k = 0; k < 26; k++) { const d = DUST[k % DUST.length]; const sc = 0.5 + ((k * 37) % 10) / 14; const x = ((k * 421) % W) - 40, y = ((k * 673) % H) - 40; p.globalAlpha = 0.22; p.drawImage(d, x, y, d.width * sc, d.height * sc); }
  p.globalAlpha = 1;
}

// ---------------------------------------------------------------- helpers
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ell = (cx, cy, rx, ry, n = 80) => circlePts(cx, cy, ry, n, rx);
const line = (P, o = {}) => inkStroke(ctx, P, { w: 9, amp: 2.2, seed: 11, color: PAL.ink, ...o });
const loop = (pts, o = {}) => inkLoop(ctx, pts, { w: 9, amp: 2.4, seed: 5, color: PAL.ink, ...o });
const blob = (pts, color, o = {}) => fillShape(ctx, pts, color, { amp: 2.6, seed: 7, ...o });
function text(s, x, y, size, color = PAL.ink, weight = 700) {
  ctx.save(); ctx.font = `${weight} ${size}px Caveat`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y); ctx.restore();
}
function arcPts(cx, cy, r, a0, a1, n = 40) { const P = []; for (let k = 0; k <= n; k++) { const a = lerp(a0, a1, k / n); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; }
function arrowOn(P, col = PAL.ink, seed = 21) {
  const a = P[P.length - 2], b = P[P.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 46;
  line([[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b], { w: 10, color: col, seed });
  line([[b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L], b], { w: 10, color: col, seed: seed + 1 });
}
const ease = (u) => E.io3(clamp(u));
const SHADE = '#e8a01c'; // shade side of the cel fill

// A cat in the cel style, origin at the body centre. bend = front-half rotation about the waist (radians).
function cat(x, y, s = 1, rot = 0, o = {}) {
  const { seed = 3, blink = 0, legs = 'sit', tail = true, bend = 0, fill = PAL.yel } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (tail) line([[90, 110], [170, 120], [200, 40], [190, -30]], { w: 15, seed: seed + 1 });
  const back = ell(0, 80, 118, 140);
  blob(back, SHADE, { seed: seed + 2 }); blob(ell(-12, 70, 104, 126), fill, { seed: seed + 2.5 }); loop(back, { seed: seed + 3 });
  // front half: head, ears, chest; rotates about the waist for bending
  ctx.save(); ctx.translate(0, 10); ctx.rotate(bend); ctx.translate(0, -10);
  const head = ell(0, -110, 100, 92, 70);
  blob(head, SHADE, { seed: seed + 5 }); blob(ell(-10, -118, 88, 80, 60), fill, { seed: seed + 5.5 });
  const earL = [[-86, -158], [-96, -256], [-18, -188]], earR = [[86, -158], [96, -256], [18, -188]];
  blob(resample(earL, 3, true), fill, { seed: seed + 6 }); loop(resample(earL, 3, true), { seed: seed + 7, w: 8 });
  blob(resample(earR, 3, true), fill, { seed: seed + 8 }); loop(resample(earR, 3, true), { seed: seed + 9, w: 8 });
  loop(head, { seed: seed + 10 });
  for (const ex of [-38, 38]) {
    if (blink > 0.5) line([[ex - 16, -118], [ex + 16, -118]], { w: 8, seed: seed + 11 });
    else { blob(ell(ex, -118, 12, 17, 30), PAL.ink, { seed: seed + 12 }); ctx.fillStyle = PAL.hi; ctx.beginPath(); ctx.arc(ex + 4, -124, 4, 0, 6.3); ctx.fill(); }
  }
  blob(resample([[-7, -92], [7, -92], [0, -82]], 3, true), PAL.red, { seed: seed + 13, amp: 1 });
  line([[0, -82], [0, -72]], { w: 6, seed: seed + 14 });
  line([[-18, -66], [0, -72], [18, -66]], { w: 6, seed: seed + 15 });
  ctx.restore();
  // legs
  const L = legs === 'out' ? [[[-80, 140], [-150, 200]], [[80, 140], [150, 200]], [[-40, 200], [-50, 250]], [[40, 200], [50, 250]]]
    : [[[-70, 180], [-74, 215]], [[70, 180], [74, 215]]];
  for (const P of L) line(P, { w: 14, seed: seed + 4 });
  ctx.restore();
}

// Kid on a trampoline for the flip (not used in this cut; kept for the sixth scene variant)
function kidFlip(x, y, rot, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const head = ell(0, -120, 46, 46, 40); blob(head, '#f2c7a2', { seed: 41 }); loop(head, { seed: 42, w: 8 });
  line([[0, -72], [0, 40]], { w: 16, seed: 43 });
  line([[0, -40], [-70, -10]], { w: 14, seed: 44 }); line([[0, -40], [70, -10]], { w: 14, seed: 45 });
  line([[0, 40], [-50, 130]], { w: 16, seed: 46 }); line([[0, 40], [50, 130]], { w: 16, seed: 47 });
  ctx.restore();
}

// Spine: vertebrae along a column. twist = rotation of the top half (radians); stiff = 0..1 (how much the lower column resists)
function spine(n, cx, cy, shown, twist = 0) {
  for (let k = 0; k < n; k++) {
    if (k > shown) continue;
    const u = k / (n - 1);
    const tw = u > 0.5 ? twist * (u - 0.5) * 2 : 0;
    const x = cx + Math.sin(tw) * 30, y = cy + (u - 0.5) * 780;
    const v = ell(x, y, 40, 22, 26);
    blob(v, k % 2 ? PAL.yel : PAL.cream, { seed: 60 + k });
    loop(v, { seed: 70 + k, w: 7 });
  }
}

// ---------------------------------------------------------------- scenes (lt = seconds into phrase, u = 0..1)
const SC = [];

// 0 hook: a cat falls upside down and rights itself
SC[0] = (lt, u) => {
  // upside down at the first frame, rights itself within the first ~1.8 s, so the hook is visible at once
  const k = ease(clamp(lt / 1.8));
  cat(CX, lerp(700, 860, k), 1.2, lerp(Math.PI, 0, k), { seed: 3, legs: 'out' });
  for (let k = 0; k < 4; k++) line([[160 + k * 30, 640 + k * 90], [60 + k * 30, 600 + k * 90]], { w: 10, seed: 80 + k, color: PAL.red });
};

// 1 the name
SC[1] = (lt) => {
  const a = sstep(0, 0.6, lt);
  text('THE FALLING', CX, 620, 150 * a + 40, PAL.ink, 700);
  text('CAT PROBLEM', CX, 800, 128 * a + 40, PAL.red, 700);
  line([[180, 900], [900, 905]], { w: 14, seed: 101 });
  cat(CX, 1200, 1.0, 0, { seed: 4, blink: lt % 2.4 > 2.2 ? 1 : 0 });
};

// 2 no spin, nothing pushes it: straight drop with arrows showing zero spin and no push
SC[2] = (lt, u) => {
  const y = lerp(560, 1000, ease(u));
  cat(CX, y, 1.0, 0, { seed: 9, legs: 'out' });
  text('no spin', 230, 760, 110, PAL.red, 700);
  text('no push', 850, 760, 110, PAL.red, 700);
  arrowOn([[330, 800], [420, 900]], PAL.red, 30);
  arrowOn([[760, 800], [680, 900]], PAL.red, 31);
};

// 3 Marey 1894: a film strip of falling cat frames
SC[3] = (lt, u) => {
  const frames = 5, fw = 180;
  line([[60, 700], [1020, 700]], { w: 12, seed: 120 }); line([[60, 1040], [1020, 1040]], { w: 12, seed: 121 });
  for (let k = 0; k < frames; k++) {
    const x = 60 + k * (fw + 20) + 10;
    const on = sstep(k * 0.03, k * 0.03 + 0.08, u);
    const r = rect(x, 760, fw, 240); blob(resample(r, 3, true), PAL.cream, { seed: 130 + k }); loop(resample(r, 3, true), { seed: 140 + k, w: 6 });
    if (on > 0) cat(x + fw / 2, 880, 0.4, lerp(Math.PI * 0.8, 0, k / (frames - 1)), { seed: 150 + k, legs: 'out' });
  }
  text('1894', CX, 560, 170, PAL.red, 700);
  text('Marey photographed them', CX, 1200, 100, PAL.ink, 700);
};

// 4 not a rigid block: the cat bends in the middle
SC[4] = (lt, u) => {
  const bend = Math.sin(u * Math.PI * 2) * 0.35;
  cat(CX, 880, 1.15, 0, { seed: 160, bend, legs: 'out' });
  text('a flexible body', CX, 1290, 120, PAL.red, 700);
};

// 5 senses which way is down: inner-ear loops and a down arrow
SC[5] = (lt, u) => {
  const head = ell(CX, 760, 230, 260, 100); blob(head, PAL.cream, { seed: 170 }); loop(head, { seed: 171 });
  const canals = [[0.2, PAL.red], [-0.9, PAL.yel], [1.1, PAL.ink]];
  canals.forEach(([r, col], k) => {
    const g = sstep(k * 0.15, k * 0.15 + 0.35, u);
    if (g > 0) { ctx.save(); ctx.translate(CX, 760); ctx.rotate(r); ctx.translate(-CX, -760); loop(ell(CX, 760, 150 * g, 60 * g, 50), { seed: 180 + k, w: 14, color: col }); ctx.restore(); }
  });
  arrowOn([[CX, 1080], [CX, 1180]], PAL.red, 190);
  text('which way is down', CX, 1290, 110, PAL.ink, 700);
};

// 6 bends in the middle, front half turns first
SC[6] = (lt, u) => {
  const bend = lerp(0, 0.9, ease(u));
  cat(CX, 860, 1.15, 0, { seed: 200, bend, legs: 'out' });
  text('front first', CX, 1290, 130, PAL.red, 700);
};

// 7 front swings up to 90 degrees, back only about 10
SC[7] = (lt, u) => {
  const a = sstep(0, 0.5, u);
  cat(CX, 860, 1.0, 0, { seed: 210, bend: 0.6 * a, legs: 'out' });
  line(arcPts(CX, 860, 300, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * a), { w: 12, seed: 220, color: PAL.red });
  line(arcPts(CX, 860, 360, Math.PI / 2, Math.PI / 2 + 0.18 * a), { w: 12, seed: 221, color: PAL.ink });
  text('90°', 820, 520, 120, PAL.red, 700);
  text('about 10°', 820, 1080, 100, PAL.ink, 700);
};

// 8 reverses: front legs out, back legs tucked
SC[8] = (lt, u) => {
  const flip = sstep(0, 0.6, u);
  cat(CX, 860, 1.0, 0, { seed: 230, bend: lerp(0.6, -0.6, flip), legs: 'out' });
  text('then reverse', CX, 1290, 120, PAL.red, 700);
};

// 9 repeat until a full 180 degrees
SC[9] = (lt, u) => {
  const rot = lerp(Math.PI, 0, ease(u));
  line(arcPts(CX, 860, 330, Math.PI * 1.02, Math.PI * 0.02, 60), { w: 12, seed: 240, color: PAL.red });
  arrowOn(arcPts(CX, 860, 330, Math.PI * 1.02, Math.PI * 0.02 + 0.02, 60), PAL.red, 241);
  cat(CX, 860, 0.95, rot, { seed: 242, legs: 'out' });
  text('180°', CX, 1290, 150, PAL.red, 700);
};

// 10 a flexible spine
SC[10] = (lt, u) => {
  spine(9, CX, 880, Math.floor(9 * clamp(u * 1.3)));
  text('a flexible spine', CX, 1290, 120, PAL.ink, 700);
};

// 11 Japanese researchers twisted spines and dropped live cats
SC[11] = (lt, u) => {
  spine(9, 330, 760, 9);
  const y = lerp(520, 960, ease(clamp(u * 1.4)));
  cat(760, y, 0.75, lerp(Math.PI * 0.6, 0, ease(clamp(u * 1.4))), { seed: 250, legs: 'out' });
  text('Japan study', CX, 1300, 120, PAL.red, 700);
};

// 12 upper spine twists more and is less stiff
SC[12] = (lt, u) => {
  spine(9, CX, 720, 9, 0.5 * sstep(0, 0.6, u));
  text('upper: twists more', CX, 1250, 96, PAL.red, 700);
  text('lower: stiffer', CX, 1345, 96, PAL.ink, 700);
};

// 13 tails help, but tailless cats still land on their feet
SC[13] = (lt, u) => {
  cat(300, 860, 0.8, 0, { seed: 260, legs: 'sit', tail: true });
  cat(780, 860, 0.8, 0, { seed: 270, legs: 'sit', tail: false });
  text('with tail', 300, 1200, 100, PAL.ink, 700);
  text('no tail', 780, 1200, 100, PAL.ink, 700);
};

// 14 reflex starts at 3 to 4 weeks old
SC[14] = (lt, u) => {
  const a = sstep(0, 0.4, u);
  cat(CX, 880, 0.55 * a + 0.01, 0, { seed: 280, legs: 'sit' });
  text('3 to 4 weeks old', CX, 1220, 130, PAL.red, 700);
};

// 15 next time a cat drops off a shelf
SC[15] = (lt, u) => {
  line([[120, 620], [960, 620]], { w: 16, seed: 350 });
  const drop = ease(clamp((u - 0.35) / 0.4));
  cat(CX, lerp(470, 1120, drop), 0.85, drop * 0.5, { seed: 360, legs: drop > 0.95 ? 'sit' : 'out' });
  if (drop > 0.95) for (let k = -2; k <= 2; k++) line([[CX + k * 80, 1190], [CX + k * 120, 1160]], { w: 7, seed: 370 + k });
  text('you know why', CX, 1290, 120, PAL.ink, 700);
};

// 16 closing card
SC[16] = (lt) => {
  const a = sstep(0, 0.5, lt);
  text('Follow for more of', CX, 760, 110 * a + 30, PAL.ink, 700);
  text('how it really works.', CX, 880, 130 * a + 30, PAL.red, 700);
  line([[160, 980], [920, 985]], { w: 12, seed: 380 });
  cat(CX, 1210, 0.8, 0, { seed: 390, blink: lt % 2.2 > 2.0 ? 1 : 0 });
};

// ---------------------------------------------------------------- caption
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = [];
  for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  const size = 86, maxW = 900, lines = []; let cur = [], cw = 0;
  for (const wd of words) {
    ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`;
    const ww = ctx.measureText(wd.w).width;
    if (!wd.sp && cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; }
    if (wd.sp && cur.length === 0) continue;
    cur.push({ ...wd, ww }); cw += ww;
  }
  if (cur.length) lines.push(cur);
  const lh = size * 1.05, bh = lines.length * lh + 44, bw = 980, bx = (W - bw) / 2, by = 1420;
  ctx.save(); ctx.globalAlpha = alpha;
  const box = rect(bx, by, bw, bh);
  blob(resample(box, 3, true), PAL.cream, { seed: 400, amp: 1.2 });
  loop(resample(box, 3, true), { seed: 401, w: 7, amp: 1.4 });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, x) => s + x.ww, 0);
    let x = CX - tw / 2; const y = by + 22 + lh * li + lh / 2;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const wd of ln) { ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`; ctx.fillStyle = wd.b ? PAL.red : PAL.ink; ctx.fillText(wd.w, x, y); x += wd.ww; }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- frame function
function locate(t) {
  for (let i = 0; i < SEG.length; i++) if (t < SEG[i].end || i === SEG.length - 1) {
    const d = SEG[i].end - SEG[i].start;
    return { i, lt: clamp(t - SEG[i].start, 0, d), u: clamp((t - SEG[i].start) / d) };
  }
}
window.DUR = window.TL.total;
window.seek = (t) => {
  const L = locate(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(PAPER, 0, 0);
  ctx.save();
  SC[L.i](L.lt, L.u, t);
  ctx.restore();
  caption(SEG[L.i].cap, sstep(0, 0.2, L.lt));
};
window.ready = true;
