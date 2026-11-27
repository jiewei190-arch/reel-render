// C_s077_s087_rule4.js — batch C (H3): RULE 4 'YOUR BRAIN CAN STOP A CLOCK.' + FIG 8 (eyes don't glide, ~3 jumps a second, the blur hidden,
// the gap filled, the first tick too long, 2001 / UCL London: the moment stretched back to just before the eyes moved), giant face DEV, the
// split second. Sets: bp.js board/label, stopprops.js wallClock, hud ruleCard/chip, faces giantFace, morning.js kitchen. Real people only as
// plain text ('Yarrow et al., 2001'). LEGAL: original.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, seg, circle, ring, rr, glow, alpha, text, blurLayer, veil, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { camMove, lookToward } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, draw, label } from '../sets/bp.js';
import { wallClock } from '../sets/stopprops.js';
import { hero, kitchen, cast3, goldPop, cTxt, creamChip, bracket, bpArrow, bpKitchen, cuteBrain, push, blinkF, morningFg } from './C_lib.js';

const U = () => S().ui;
const FIG8 = (g, t) => board(g, t, { title: 'FIG 8 - HOW EYES MOVE', fig: 'STOPPED CLOCK ILLUSION' });

// s077 RULE 4 CARD
registerShot('s077', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 4, title: 'YOUR BRAIN CAN STOP A CLOCK.', bg: (g, t) => { blurLayer(g, 9, (g) => kitchen(g, t, { z: 1.6, x: 360, y: -420, r: 0 }, { sec: 44 })); veil(g, '#0c0a18', 0.35); } });
  chip(g, t, { str: 'STOPPED CLOCK ILLUSION', at: 1.96, x: E.W * 0.26, y: E.H * 0.91, tone: 'gold' });
} });

// the board picture used by s078-s080 (cream kitchen line drawing)
const PIC = { x: E.W * 0.5, y: E.H * 0.5, w: 1080 };
function pathGlide(g, A, k, col) { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([lerp(A.win[0], A.tst[0], u), lerp(A.win[1], A.tst[1], u) - Math.sin(u * Math.PI) * 120]); } g.save(); g.setLineDash([16, 12]); draw(g, pts, k, { w: 6, color: col }); g.restore(); return pts; }

// s078 FIG 8 - YOUR EYES DON'T GLIDE
registerShot('s078', { draw(g, t, info) {
  FIG8(g, t);
  push(g, t, info.dur, () => {
    const A = bpKitchen(g, PIC.x, PIC.y, PIC.w, ease.out(prog(t, 0, 0.4)));
    const pts = pathGlide(g, A, ease.inOut(prog(t, 0.15, 0.8)), U().blueprint);
    const head = pts[Math.round(clamp(ease.inOut(prog(t, 0.15, 0.8))) * 40)]; ring(g, head[0], head[1], 16, 4, U().cream);
    cTxt(g, 'SMOOTH GLIDE?', A.x0 + A.w * 0.5, A.y0 - 40, { size: 34, alpha: prog(t, 0.2, 0.5) });
    const x = ease.outBack(prog(t, 0.83, 1.1)); if (x > 0.01) { const cx = A.x0 + A.w * 0.5, cy = A.y0 + A.h * 0.3; g.save(); g.translate(cx, cy); g.scale(x, x); seg(g, [[-90, -90], [90, 90]], 22, U().accent); seg(g, [[90, -90], [-90, 90]], 22, U().accent); g.restore(); }
  }, 0.03);
} });

// s079 THEY JUMP, ~3 TIMES A SECOND
registerShot('s079', { draw(g, t, info) {
  FIG8(g, t);
  push(g, t, info.dur, () => {
    const A = bpKitchen(g, PIC.x, PIC.y, PIC.w, 1), stops = [A.clk, A.win, A.tst], at = [0.28, 0.54, 0.8], c = U().cream;
    let prev = [A.x0 + A.w * 0.45, A.y0 + A.h * 0.55];
    stops.forEach((p, i) => { const k = ease.out(prog(t, at[i] - 0.14, at[i])); if (k <= 0) return; const mid = [(prev[0] + p[0]) / 2, Math.min(prev[1], p[1]) - 110];
      const pts = []; for (let j = 0; j <= 20; j++) { const u = j / 20; pts.push([(1 - u) * (1 - u) * prev[0] + 2 * u * (1 - u) * mid[0] + u * u * p[0], (1 - u) * (1 - u) * prev[1] + 2 * u * (1 - u) * mid[1] + u * u * p[1]]); }
      draw(g, pts, k, { w: 5, color: U().blueprint }); if (k >= 1) { circle(g, p[0], p[1], 18, U().gold); ring(g, p[0], p[1], 30, 4, alpha(U().gold, 0.6)); } prev = p; });
    circle(g, A.x0 + A.w * 0.45, A.y0 + A.h * 0.55, 12, c);
    goldPop(g, t, '~3 JUMPS / s', 0.8, E.W * 0.5, A.y0 - 62, 78);
    label(g, t, { at: [A.clk[0] - 30, A.clk[1] + 60], to: [A.clk[0] - 250, A.y0 + A.h + 70], str: 'SACCADES', start: 1.58, color: U().cream });
  }, 0.03);
} });

// s080 THE BLUR, HIDDEN
registerShot('s080', { draw(g, t, info) {
  FIG8(g, t);
  push(g, t, info.dur, () => {
    const sm = ease.out(prog(t, 0.45, 0.8)), cur = ease.inOut(prog(t, 2.69, 3.29)), x = PIC.x, y = PIC.y - 30;
    // the view smears during the jump
    g.save(); g.beginPath(); g.rect(x - PIC.w / 2 - 10, y - 330, PIC.w + 20, 660); g.clip();
    for (let i = 0; i < 9; i++) { g.save(); g.globalAlpha *= sm > 0.05 ? 0.28 : (i === 0 ? 1 : 0); bpKitchen(g, x + (i - 4) * 60 * sm, y, PIC.w, 1); g.restore(); }
    if (sm > 0.05) cTxt(g, 'BLUR', x, y + 345, { size: 34, alpha: sm * (1 - cur), color: U().accent });
    // the brain slides a curtain over the blur, then the clean view
    if (cur > 0) { g.fillStyle = U().bpBg || '#0b1a33'; g.fillRect(x - PIC.w / 2 - 10, y - 330, (PIC.w + 20) * cur, 660); seg(g, [[x - PIC.w / 2 - 10 + (PIC.w + 20) * cur, y - 330], [x - PIC.w / 2 - 10 + (PIC.w + 20) * cur, y + 330]], 8, U().cream); }
    if (t > 3.29) { g.fillStyle = U().bpBg || '#0b1a33'; g.fillRect(x - PIC.w / 2 - 10, y - 330, PIC.w + 20, 660); bpKitchen(g, x, y, PIC.w, 1); }
    g.restore();
    const bk = ease.outBack(prog(t, 2.5, 2.9)); if (bk > 0.01) { g.save(); g.translate(x - PIC.w / 2 + (PIC.w + 20) * cur, y - 400); g.scale(bk, bk); cuteBrain(g, 0, 0, 1.0); g.restore(); }
    label(g, t, { at: [x + 200, y + 300], to: [x + 380, y + 400], str: 'THE BRAIN HIDES IT', start: 3.29 });
  }, 0.03);
} });

// the view-frame timeline used by s081 (frames: window window | blur blur | clock clock)
function frame(g, x, y, w, kind, k = 1) {
  const h = w * 0.7, c = U().cream; g.save(); g.globalAlpha *= k; rr(g, x - w / 2, y - h / 2, w, h, 10); g.fillStyle = 'rgba(8,16,34,.7)'; g.fill(); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
  if (kind === 'win') { g.strokeRect(x - w * 0.28, y - h * 0.3, w * 0.56, h * 0.6); seg(g, [[x, y - h * 0.3], [x, y + h * 0.3]], 3, c); seg(g, [[x - w * 0.28, y], [x + w * 0.28, y]], 3, c); }
  if (kind === 'clock') { ring(g, x, y, h * 0.3, 4, c); seg(g, [[x, y], [x, y - h * 0.22]], 4, U().gold); seg(g, [[x, y], [x + h * 0.14, y]], 4, c); }
  if (kind === 'blur') for (let i = 0; i < 5; i++) seg(g, [[x - w * 0.36, y - h * 0.3 + i * h * 0.15], [x + w * 0.36, y - h * 0.3 + i * h * 0.15 + 6]], 6, alpha(c, 0.35));
  g.restore();
}
// s081 IT FILLS THE GAP
registerShot('s081', { draw(g, t, info) {
  FIG8(g, t);
  push(g, t, info.dur, () => {
    const fw = 230, gap = 26, x0 = E.W / 2 - 2.5 * (fw + gap), y = E.H * 0.5, kinds = ['win', 'win', 'blur', 'blur', 'clock', 'clock'];
    cTxt(g, 'WHAT YOUR EYES SEND', E.W / 2, y - 300, { size: 30, alpha: prog(t, 0, 0.3) });
    kinds.forEach((kd, i) => { const x = x0 + i * (fw + gap), fill = (i === 2 || i === 3) ? ease.out(prog(t, 0.24 + (i - 2) * 0.5, 0.74 + (i - 2) * 0.6)) : 0;
      frame(g, x, y, fw, kd, 1 - fill * 0.999); if (fill > 0) { frame(g, x, y, fw, 'clock', fill); g.save(); g.globalAlpha *= fill; rr(g, x - fw / 2 - 4, y - fw * 0.35 - 4, fw + 8, fw * 0.7 + 8, 12); g.strokeStyle = U().gold; g.lineWidth = 5; g.stroke(); g.restore(); } });
    bpArrow(g, x0 - fw / 2, y + 150, x0 + 5 * (fw + gap) + fw / 2 + 30, y + 150, ease.out(prog(t, 0, 0.5)), U().cream, 5); cTxt(g, 'TIME', x0 + 5 * (fw + gap) + fw / 2 + 30, y + 190, { size: 24 });
    bracket(g, x0 + 2 * (fw + gap) - fw / 2, x0 + 3 * (fw + gap) + fw / 2, y - fw * 0.35 - 20, ease.out(prog(t, 0.66, 1.0)), 'FILLED IN', { up: true });
    if (t > 1.9) goldPop(g, t, 'WHATEVER THE EYES LAND ON', 1.9, E.W / 2, y + 270, 46);
  }, 0.03);
} });

// s082 THE FIRST TICK LASTS TOO LONG
registerShot('s082', { draw(g, t, info) {
  FIG8(g, t);
  push(g, t, info.dur, () => {
    const st = ease.inOut(prog(t, 1.4, 1.95)), unit = 230, x0 = E.W * 0.5 - 2.5 * unit - 80, y = E.H * 0.7, c = U().cream;
    wallClock(g, t, { x: E.W * 0.5, y: E.H * 0.33, r: 210, h: 7.72, sec: 20 + (t > 0.66 ? 1 : 0) + (t > 2.3 ? 1 : 0) });
    let x = x0; for (let i = 0; i < 5; i++) { const w = (i === 0 ? unit * (1 + 0.75 * st) : unit) - 14; rr(g, x, y - 46, w, 92, 14); g.fillStyle = alpha(i === 0 ? U().gold : U().blueprint, i === 0 ? 0.55 + 0.25 * st : 0.45); g.fill(); g.strokeStyle = c; g.lineWidth = 3; g.stroke(); cTxt(g, i === 0 ? '1st TICK' : 'TICK', x + w / 2, y, { size: 30, color: i === 0 ? '#1a1406' : undefined }); x += w + 14; }
    bracket(g, x0, x0 + unit * (1 + 0.75 * st) - 14, y + 62, ease.out(prog(t, 2.26, 2.6)), 'TOO LONG');
  }, 0.03);
} });

// s083 IN 2001
registerShot('s083', { draw(g, t, info) {
  FIG8(g, t);
  const k = ease.out(prog(t, 0.0, 0.3)), x = lerp(E.W * 1.2, E.W * 0.5, k), y = E.H * 0.52, c = U().cream;
  g.save(); g.translate(x, y); g.rotate(-0.04); rr(g, -330, -220, 660, 440, 16); g.fillStyle = '#f2ead8'; g.fill(); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
  text(g, 'NATURE, 2001', 0, -150, { size: 50, color: '#20283a', font: FONTS.title, weight: 700, spacing: 3 }); for (let i = 0; i < 6; i++) { rr(g, -260, -80 + i * 34, i % 3 === 2 ? 360 : 520, 12, 6); g.fillStyle = 'rgba(32,40,58,.25)'; g.fill(); }
  g.restore();
  goldPop(g, t, '2001', 0.29, E.W * 0.5 + 160, E.H * 0.52 + 140, 140, { rot: -0.12 });
} });

// the saccade timeline used by s084-s085: [before | saccade | the new view] with the new view's bar stretching back
function stretchLine(g, t, o) {
  const c = U().cream, x0 = E.W * 0.12, x1 = E.W * 0.88, y = E.H * 0.6, sac0 = lerp(x0, x1, 0.38), sac1 = lerp(x0, x1, 0.5), back = o.back ?? 0;
  seg(g, [[x0, y + 80], [x1, y + 80]], 4, c); bpArrow(g, x1 - 40, y + 80, x1 + 10, y + 80, 1, c, 4); cTxt(g, 'TIME', x1 - 40, y + 116, { size: 26 });
  rr(g, x0, y - 55, sac0 - x0 - 10, 110, 14); g.fillStyle = alpha(U().blueprint, 0.45); g.fill(); cTxt(g, 'LOOKING AT THE WINDOW', (x0 + sac0) / 2, y, { size: 30 });
  g.save(); g.setLineDash([10, 8]); rr(g, sac0, y - 55, sac1 - sac0, 110, 14); g.strokeStyle = alpha(c, 0.7); g.lineWidth = 3; g.stroke(); g.restore(); cTxt(g, 'JUMP', (sac0 + sac1) / 2, y, { size: 30, alpha: 1 - back });
  seg(g, [[sac0, y - 120], [sac0, y + 100]], 5, alpha(U().accent, o.marker ?? 1)); circle(g, sac0, y - 120, 9, alpha(U().accent, o.marker ?? 1));
  const bx = lerp(sac1 + 10, sac0 + 6, ease.inOut(back)); rr(g, bx, y - 55, x1 - bx, 110, 14); g.fillStyle = alpha(U().gold, 0.6 + 0.2 * (o.glow ?? 0)); g.fill(); cTxt(g, 'SEEING THE CLOCK', (sac1 + x1) / 2, y, { size: 30, color: '#1a1406' });
  if (o.glow) glow(g, (bx + x1) / 2, y, 700, U().gold, 0.15 * o.glow);
  return { sac0, sac1, y, bx };
}
// s084 SCIENTISTS IN LONDON
registerShot('s084', { draw(g, t, info) {
  FIG8(g, t);
  push(g, t, info.dur, () => {
    const back = ease.inOut(prog(t, 2.03, 3.71)), L = stretchLine(g, t, { back, marker: ease.out(prog(t, 0.2, 0.6)) });
    if (back > 0.02) bpArrow(g, L.sac1 + 60, L.y - 80, L.bx - 10, L.y - 80, 1, U().gold, 8);
    if (t > 2.03) cTxt(g, 'BACK IN TIME', (L.sac0 + L.sac1) / 2 + 80, L.y - 130, { size: 34, color: U().gold, alpha: prog(t, 2.03, 2.4) });
  }, 0.03);
  chip(g, t, { str: 'UCL, LONDON', at: 0.89, x: E.W * 0.24, y: E.H * 0.24, tone: 'gold' });
  cTxt(g, 'Yarrow et al., 2001', E.W * 0.24, E.H * 0.24 + 62, { size: 24, alpha: prog(t, 1.1, 1.4) });
} });

// s085 TO JUST BEFORE YOUR EYES MOVED
registerShot('s085', { draw(g, t, info) {
  FIG8(g, t);
  push(g, t, info.dur, () => {
    const L = stretchLine(g, t, { back: 0.92 + 0.08 * ease.out(prog(t, 0.2, 0.73)), glow: ease.out(prog(t, 1.4, 2.2)) });
    goldPop(g, t, 'JUST BEFORE', 0.73, L.sac0 + 210, L.y - 160, 56);
    label(g, t, { at: [L.sac0, L.y - 120], to: [L.sac0 - 260, L.y - 230], str: 'EYES MOVE', start: 1.23, color: U().cream });
  }, 0.04);
  chip(g, t, { str: 'UCL, LONDON', at: -1, x: E.W * 0.24, y: E.H * 0.24, tone: 'gold' });
} });

// s086 GIANT FACE DEV, 'everyone has frozen a clock'
registerShot('s086', { draw(g, t, info) {
  blurLayer(g, 10, (g) => kitchen(g, t, { z: 1.3, x: -500, y: -200, r: 0 }, { sec: 50 })); veil(g, '#1a1020', 0.15);
  const z = 1 + 0.04 * ease.inOut(t / info.dur), J = 0.66; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const f = faceAt(t, [[0, 'neutral'], [J, 'awe'], [1.14, 'delighted']]); f.look = t < J ? [-0.45, -0.55] : [0.4, -0.65];   // a visible eye jump on 'frozen'
  giantFace(g, E.W / 2, E.H * 0.5, 330, { who: 'DEV', f, rimColor: '#ffc68a', rimSide: -1 });
  for (const sd of [-1, 1]) { const ex = E.W / 2 + sd * 330 * 0.34 + f.look[0] * 26, ey = E.H * 0.5 - 330 * 0.04 + f.look[1] * 22 - 14; ring(g, ex + 10, ey, 9, 2.5, alpha('#f6f1e6', 0.8)); seg(g, [[ex + 10, ey], [ex + 10, ey - 6]], 1.6, '#d4262e'); }
  g.restore();
} });

// s087 JUST FOR A SPLIT SECOND
registerShot('s087', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.16, 1.2], drift: 0.3 }), x: 40, y: -40 }, M = kitchen(g, t, cam, { sec: 50 + (t > 0.7 ? 1 : 0) + (t > 1.7 ? 1 : 0), stick: t > 0.2 && t < 0.7 ? 0.7 : 0, cocoa: 1 }), P = M.pos;
  const up = t > 0.15, BL = 1.25;
  layer(g, cam, 1, (g) => {
    cast3(g, t, M, { blinkAt: BL, minaLook: up ? [0.75, -0.66] : [1, 0.1], devLook: up ? [0.8, -0.6] : [1, 0], devPose: up ? POSES.stand : POSES.phone, devExpr: up ? 'surprised' : 'happy', minaExpr: up ? 'surprised' : 'happy' });
    hero(g, { x: P.heroSeatX + 60, y: M.GY, facing: -1, pose: POSES.sit, expr: up ? 'surprised' : 'smile', blink: Math.abs(t - BL - 0.03) < 0.09 ? 1 : 0, look: up ? lookToward(1, -1.4) : lookToward(-1, 0), rim: { color: M.rim, dir: [1, -0.5] }, t });
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });
