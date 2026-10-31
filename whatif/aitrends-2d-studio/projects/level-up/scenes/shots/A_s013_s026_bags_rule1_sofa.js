// A_s013_s026_bags_rule1_sofa.js — ep 5 batch A (38.89-85.80): LEVEL 1 THE BAGS (street at dusk, every bag on one hand), Dev "They look
// exactly the same.", giant face HERO, RULE 1 card + FIG 1 (muscle barely grows, the wiring, more fibres at once, Moritani & deVries 1979,
// mostly nerves, muscle takes over after weeks 3-5), LEVEL 6 THE SOFA (morning pop LV 5->6 127->160 kg, remote under the sofa, one-hand lift,
// Biscuit asleep on top). LEGAL: STYLE.md DON'T list (no series names, no System/Player/Quest words, no portals, eyes never glow).
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, text, FONTS, rr, seg, circle, ring, linGrad } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, draw, label } from '../sets/bp.js';
import { home3, home3Fg } from '../sets/home3.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { street, streetFg } from '../sets/street.js';
import { PAL, statCard, levelFlash, freeze, morningPop, sparks } from '../sets/statcard.js';
import { speedLines5, lowAngleWrap } from '../sets/fx5.js';
import { sw, hero, handAt, bowl, spoon, mug, bags, eggBox, remote, sofa, ceilingLamp, CYAN } from './A_lib.js';

const GOLD = '#ffc93c', CREAM = '#e8f0ff';
const KIT = (g, t, cam, o = {}) => { const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0, ...o }); return { H, P: H.pos, GY: H.GY ?? E.H * 0.8, CX: H.CX ?? E.W / 2 }; };
const push = (g, t, dur, fn, amt = 0.035) => { g.save(); const z = 1 + amt * t / dur; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const T = (g, s, x, y, o = {}) => text(g, s, x, y, { size: 34, color: CREAM, font: FONTS.ui, weight: 800, ...o });

// s013 — "Level one. You carry all the shopping home in one hand."  street at dusk: HERO walks home with EVERY shopping bag hooked on one
// hand (other hand in his pocket), easy smile on 'shopping'; a small Stat Card bobs at his shoulder; MINA trots behind with one egg box.
registerShot('s013', { draw(g, t, info) {
  const st = info.shot.start, tS = sw('shopping', st, 2.26);
  const hx = lerp(E.W * 0.36, E.W * 0.62, t / info.dur), cam = camMove(t, info.dur, { z: [1.0, 1.02], x: [-150, 150], y: [-30, -30] });
  const S = street(g, t, cam, { power: 1, mood: 'dusk' });
  layer(g, cam, 1, (g) => {
    const W = walkAlong(hx, 1.9), hp = { ...W.pose, hF: [22, -92], eF: [16, -128], hB: [-4, -106], eB: [-10, -132] }, ho = { x: hx, y: S.GY + 30, s: 1.9, facing: 1 };
    const mx = hx - 330, MW = walkAlong(mx, 2.0, { kid: true });
    actor(g, 'MINA', { x: mx, y: S.GY + 30, s: 2.0, facing: 1, pose: { ...MW.pose, hF: [26, -118], eF: [20, -140], hB: [20, -118], eB: [8, -140] }, expr: 'determined', blink: blinkFlag(t, 2.9, 3), look: lookToward(1, 0.2), t, rim: S.rim });
    eggBox(g, mx + 40, S.GY + 30 - 118 * 2.0 * 0.72, 1.2);
    hero(g, { ...ho, pose: hp, expr: exprAt(t, [[0, 'neutral'], [tS, 'smile']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0), t, rim: S.rim });
    const h = handAt(ho, hp, 'F'); bags(g, h[0], h[1], 1.15, t);
    statCard(g, t, { x: hx + 230, y: S.GY - 470, s: 0.45, lv: 1, str: 50, xp: 0.15 });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffd0a0' });
  chip(g, t, { str: 'LEVEL 1: THE BAGS', at: sw('level', st, 0.2), x: 330, y: 110, dur: info.dur });
} });

// s014 — "Dev squints at your arms. "They look exactly the same.""  kitchen, bags dumped on the counter: DEV leans in squinting at HERO's
// flexed arm, phone filming; lip-sync DEV on the quote; HERO flexes harder on 'exactly'; inset MONDAY vs TODAY arm outlines, gold '='.
registerShot('s014', { draw(g, t, info) {
  const st = info.shot.start, tTh = sw('they', st, 1.91), tEx = sw('exactly', st, 2.29), tSa = sw('same', st, 3.01);
  const cam = camMove(t, info.dur, { z: [1.02, 1.07], x: [-80, -60], y: [-60, -70] });
  const K = KIT(g, t, cam), P = K.P, hx = P.tableX - 300;
  layer(g, cam, 1, (g) => {
    bags(g, P.counterL + 380, P.counterTop - 60, 0.9, 0);
    const flex = { ...POSES.stand, eF: [34, -150], hF: [24, -196] }, hard = { ...flex, eF: [38, -154], hF: [22, -200], head: [6, -206] };
    hero(g, { x: hx, y: K.GY, s: 1.9, facing: 1, pose: idle(t > tEx ? hard : flex, t, 2), expr: t > tEx ? 'determined' : 'smile', blink: blinkFlag(t, 3.4, 2), look: lookToward(1, -0.2), t });
    const dp = idle({ ...POSES.phone, head: [16, -196], sh: [8, -168] }, t, 4);
    actor(g, 'DEV', { x: hx + 270, y: K.GY, s: 1.9, facing: -1, pose: dp, expr: exprAt(t, [[0, 'thinking'], [tTh, 'neutral']]), talk: t > tTh && t < info.dur - 0.12, blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, -0.3), t });
    const ph = handAt({ x: hx + 270, y: K.GY, s: 1.9, facing: -1 }, dp, 'F'); rr(g, ph[0] - 16, ph[1] - 50, 32, 56, 6); g.fillStyle = '#16121c'; g.fill();
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
  // the split inset (top-right): two identical cream arm outlines, MONDAY vs TODAY, gold '=' on 'same.'
  const ip = ease.outBack(prog(t, 0.25, 0.65)); if (ip > 0) { g.save(); g.translate(E.W - 420, 250); g.scale(ip, ip); rr(g, -330, -150, 660, 300, 26); g.fillStyle = alpha('#0b1a33', 0.9); g.fill(); g.strokeStyle = alpha(CREAM, 0.5); g.lineWidth = 3; g.stroke();
    for (const [sx, lab] of [[-170, 'MONDAY'], [170, 'TODAY']]) { g.save(); g.translate(sx, 20); g.strokeStyle = CREAM; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-90, 60); g.lineTo(-10, 60); g.quadraticCurveTo(30, 40, 20, -10); g.lineTo(10, -70); g.moveTo(-90, 30); g.lineTo(-20, 30); g.quadraticCurveTo(-30, -20, -10, -40); g.stroke(); circle(g, 14, -84, 22, 'rgba(0,0,0,0)'); ring(g, 14, -84, 20, 5, CREAM); g.restore(); T(g, lab, sx, -112, { size: 28, color: GOLD }); }
    const q = ease.outBack(prog(t, tSa, tSa + 0.3)); if (q > 0) text(g, '=', 0, 10, { size: 120 * q, color: GOLD, font: FONTS.ui, weight: 900 });
    g.restore(); }
} });

// s015 — "He's right. And that's real life, too."  GIANT FACE HERO: surprised -> sheepish -> small smile; looks down at his arm, then back to
// camera; the Stat Card glows cyan at the frame edge (two small cyan rectangles on his cheek, eyes never glow); cyan zip pull at the collar.
registerShot('s015', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04] });
  blurLayer(g, 12, (g) => KIT(g, t, cam), null, 1); veil(g, '#0b0f1a', 0.2);
  glow(g, E.W + 60, E.H * 0.4, 520, CYAN, 0.35);
  const cx = E.W * 0.46, cy = E.H * 0.5, r = 330, f = faceAt(t, [[0, 'surprised'], [0.34, 'sheepish'], [1.86, 'smile']]);
  f.look = t < 1.6 ? [0.4, 0.6] : [0, 0];
  g.save(); const z = 1 + 0.03 * t / info.dur; g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  giantFace(g, cx, cy, r, { who: 'HERO', f, rimColor: '#ffc68a', rimSide: -1, breath: Math.sin(t * 2) });
  rr(g, cx + r * 0.1, cy + r * 1.1, 14, 34, 5); g.fillStyle = CYAN; g.fill();
  for (const [dx, dy] of [[0.5, 0.28], [0.68, 0.2]]) { rr(g, cx + r * dx - 16, cy + r * dy - 7, 32, 14, 4); g.fillStyle = alpha(CYAN, 0.75); g.fill(); }
  g.restore();
} });

// s016 — "When people start lifting weights, they get stronger fast."  RULE 1 CARD over the dimmed kitchen with the card glowing on the table;
// the small Stat Card peeks in at the lower-right and bobs.
registerShot('s016', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 1, title: 'STRONGER STARTS IN YOUR BRAIN.', bg: (g, t) => { const cam = { z: 1.05, x: 0, y: -40, r: 0 }; blurLayer(g, 10, (g) => { const K = KIT(g, t, cam); layer(g, cam, 1, (g) => { bowl(g, K.P.tableX, K.P.tableTop - 6, 1); glow(g, K.P.tableX + 200, K.P.tableTop - 200, 300, CYAN, 0.35); }); }, null, 1); veil(g, '#0b0f1a', 0.3); } });
  statCard(g, t, { x: E.W - 230, y: E.H - 150 + (1 - ease.out(prog(t, 0.8, 1.4))) * 260, s: 0.45, lv: 1, str: 50, xp: 0.2 });
} });

// ---------- FIG 1: the muscle cross-section, nerve, motor units, chart ----------
const MX = 1180, MY = E.H * 0.52;
function muscle(g, k = 1, lit = 0, t = 0, o = {}) {
  draw(g, Array.from({ length: 41 }, (_, i) => { const a = i / 40 * Math.PI * 2; return [MX + Math.cos(a) * 300, MY + Math.sin(a) * 190]; }), k, { w: 5, color: CREAM });
  if (o.bundles) { const n = 20; for (let i = 0; i < n; i++) { const a = i * 2.39996, rr2 = Math.sqrt((i + 0.5) / n), x = MX + Math.cos(a) * rr2 * 240, y = MY + Math.sin(a) * rr2 * 145, on = i < lit; circle(g, x, y, 28, on ? alpha(GOLD, 0.85) : 'rgba(0,0,0,0)'); ring(g, x, y, 28, 3, on ? GOLD : alpha(CREAM, 0.7)); if (on) glow(g, x, y, 50, GOLD, 0.25); } }
}
function nerve(g, k, pulse = -1) { const pts = [[260, 200], [260, 880]], n2 = [[300, 420], [520, 400], [760, 470], [880, MY]]; seg(g, pts, 26, alpha(CREAM, 0.35)); T(g, 'spinal cord', 260, 920, { size: 26 }); draw(g, n2, k, { w: 6, color: CREAM }); if (pulse >= 0) { const P = n2, L = P.length - 1, u = clamp(pulse) * L, i = Math.min(L - 1, Math.floor(u)), f = u - i, x = lerp(P[i][0], P[i + 1][0], f), y = lerp(P[i][1], P[i + 1][1], f); glow(g, x, y, 60, GOLD, 0.9); circle(g, x, y, 10, GOLD); draw(g, n2, pulse, { w: 7, color: GOLD }); } }

// s017 — "But at first, their muscles barely grow."  the muscle cross-section draws on; a gold calliper beside it barely moves ('muscle size:
// barely grows' on 'barely') while a strength bar next to it climbs fast.
registerShot('s017', { draw(g, t, info) {
  const st = info.shot.start, tM = sw('muscles', st, 0.84), tB = sw('barely', st, 1.12);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 1 - THE WIRING', fig: 'STRENGTH = NERVES + MUSCLE' });
    muscle(g, ease.out(prog(t, 0.06, 1.06)));
    const grow = 6 * ease.out(prog(t, tM, info.dur)); seg(g, [[MX - 300 - grow, MY + 240], [MX + 300 + grow, MY + 240]], 5, GOLD); seg(g, [[MX - 300 - grow, MY + 215], [MX - 300 - grow, MY + 265]], 5, GOLD); seg(g, [[MX + 300 + grow, MY + 215], [MX + 300 + grow, MY + 265]], 5, GOLD);
    label(g, t, { at: [MX, MY + 240], to: [MX, MY + 330], str: 'muscle size: barely grows', start: tB });
    const sb = ease.out(prog(t, tM, tM + 1.4)); rr(g, 380, E.H * 0.8 - 420 * sb, 120, 420 * sb, 10); g.fillStyle = alpha(GOLD, 0.85); g.fill(); T(g, 'STRENGTH', 440, E.H * 0.84, { color: GOLD }); if (sb > 0.5) text(g, '↑', 440, E.H * 0.8 - 420 * sb - 50, { size: 80, color: GOLD, font: FONTS.ui, weight: 900 });
  });
} });

// s018 — "What changes is the wiring."  the nerve from the spinal cord to the muscle draws on; on 'wiring.' it lights up gold end to end.
registerShot('s018', { draw(g, t, info) {
  const st = info.shot.start, tW = sw('wiring', st, 1.05);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 1 - THE WIRING', fig: 'STRENGTH = NERVES + MUSCLE' });
    muscle(g, 1); nerve(g, ease.out(prog(t, 0.05, 0.9)), t > tW ? ease.inOut(prog(t, tW, tW + 0.7)) : -1);
    label(g, t, { at: [620, 420], to: [560, 260], str: 'the wiring', start: tW });
  }, 0.03);
} });

// s019 — "Your nervous system learns to switch on more muscle fibres at once."  ~20 bundles (motor units); 6 lit at first; a wave on
// 'switch', nearly all glowing together on 'more'-'once.' with a gold flash on 'once.'
registerShot('s019', { draw(g, t, info) {
  const st = info.shot.start, tN = sw('nervous', st, 0.30), tSw = sw('switch', st, 1.66), tO = sw('once', st, 3.52);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 1 - MORE FIBRES AT ONCE', fig: 'STRENGTH = NERVES + MUSCLE' });
    const lit = Math.round(6 + 13 * ease.inOut(prog(t, tSw, tO)));
    nerve(g, 1, (t * 0.8) % 1); muscle(g, 1, lit, t, { bundles: true });
    label(g, t, { at: [760, 450], to: [800, 250], str: 'nervous system recruits more fibres', start: tN });
    const f = Math.max(0, 1 - (t - tO) * 3); if (t > tO && f > 0) glow(g, MX, MY, 420, GOLD, 0.5 * f);
    T(g, `${lit} / 20 working`, MX, MY + 250, { color: GOLD, size: 40 });
  });
} });

// s020 — "A classic study from 1979"  a cream journal card slides onto the board ('MORITANI & deVRIES, 1979'), gold '1979' pops; a tiny
// 8-week calendar strip draws on 'study'.
registerShot('s020', { draw(g, t, info) {
  const st = info.shot.start, tS = sw('study', st, 0.65), t79 = sw('1979', st, 1.35);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 1 - THE EVIDENCE', fig: 'A CLASSIC STUDY' });
    const k = ease.out(prog(t, 0.13, 0.6)), x = lerp(E.W + 500, E.W / 2, k);
    g.save(); g.translate(x, E.H * 0.42); g.rotate(-0.03); rr(g, -420, -190, 840, 380, 20); g.fillStyle = '#f2ead8'; g.fill(); g.strokeStyle = '#8a7a60'; g.lineWidth = 4; g.stroke();
    for (let i = 0; i < 5; i++) seg(g, [[-360, -60 + i * 40], [360 - (i % 2) * 120, -60 + i * 40]], 6, alpha('#8a7a60', 0.35));
    text(g, 'MORITANI & deVRIES', 0, -130, { size: 50, color: '#2a2418', font: FONTS.ui, weight: 900 });
    const p = ease.outBack(prog(t, t79, t79 + 0.35)); if (p > 0) text(g, '1979', 220, 120, { size: 110 * p, color: GOLD, font: FONTS.ui, weight: 900, stroke: 10, strokeColor: '#2a2418' });
    g.restore();
    for (let i = 0; i < 8; i++) { const q = ease.out(prog(t, tS + i * 0.08, tS + i * 0.08 + 0.2)); if (q <= 0) continue; rr(g, 560 + i * 104, E.H * 0.8, 90 * q, 70, 8); g.strokeStyle = CREAM; g.lineWidth = 3; g.stroke(); T(g, `W${i + 1}`, 605 + i * 104, E.H * 0.8 + 36, { size: 26 }); }
  });
} });

// ---------- FIG 1b chart: where the early strength gain came from (8 weeks) ----------
const CX0 = 330, CX1 = 1450, CY0 = E.H * 0.8, CH = 460, wk = (w) => CX0 + (CX1 - CX0) * w / 8;
const nerv = (w) => 0.62 * (1 - Math.exp(-w / 1.4)), musc = (w) => w < 2 ? 0.03 * w : 0.06 + 0.05 * Math.pow(w - 2, 1.3);
function chart(g, t, upto, showM) {
  seg(g, [[CX0, CY0], [CX1, CY0]], 4, CREAM); seg(g, [[CX0, CY0], [CX0, CY0 - CH - 20]], 4, CREAM);
  for (let w = 0; w <= 8; w++) { seg(g, [[wk(w), CY0], [wk(w), CY0 + 12]], 3, CREAM); if (w) T(g, `${w}`, wk(w), CY0 + 40, { size: 26 }); }
  T(g, 'WEEKS OF TRAINING', (CX0 + CX1) / 2, CY0 + 80, { size: 26 }); T(g, 'STRENGTH GAIN', CX0 - 10, CY0 - CH - 50, { size: 26, align: 'left' });
  const n = 60, W = 8 * clamp(upto);
  const band = (f0, f1, col) => { g.beginPath(); for (let i = 0; i <= n; i++) { const w = W * i / n; g.lineTo(wk(w), CY0 - f1(w) * CH); } for (let i = n; i >= 0; i--) { const w = W * i / n; g.lineTo(wk(w), CY0 - f0(w) * CH); } g.closePath(); g.fillStyle = col; g.fill(); };
  if (W > 0) { band(() => 0, nerv, alpha(CREAM, 0.75)); if (showM > 0) band(nerv, (w) => nerv(w) + musc(w) * showM, alpha(GOLD, 0.8)); }
  if (W > 1.2) T(g, 'NERVES', wk(Math.min(W, 4) * 0.6), CY0 - nerv(2) * CH * 0.45, { color: '#0b1a33', size: 34 });
  if (showM > 0.3 && W > 6) T(g, 'MUSCLE GROWTH', wk(6.8), CY0 - (nerv(6.8) + musc(6.8) * 0.5) * CH, { color: '#0b1a33', size: 30 });
}
// s021 — "found most early strength gain came from the nerves."  the stacked chart draws on: the cream NERVES band fills most of the early
// weeks; a gold arrow points at the first weeks on 'most'; gold 'mostly nerves' on 'nerves.'
registerShot('s021', { draw(g, t, info) {
  const st = info.shot.start, tM = sw('most', st, 1.09), tN = sw('nerves', st, 3.51);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 1b - WHERE THE EARLY GAIN CAME FROM', fig: 'MORITANI & deVRIES, 1979' });
    chart(g, t, ease.inOut(prog(t, 0.15, 3.2)) * 0.62, 0.15);
    if (t > tM) { const p = ease.out(prog(t, tM, tM + 0.4)); seg(g, [[wk(1.4), CY0 - CH - 40 + 60 * (1 - p)], [wk(1.4), CY0 - nerv(1.4) * CH - 30]], 6, GOLD); g.fillStyle = GOLD; g.beginPath(); g.moveTo(wk(1.4) - 18, CY0 - nerv(1.4) * CH - 40); g.lineTo(wk(1.4) + 18, CY0 - nerv(1.4) * CH - 40); g.lineTo(wk(1.4), CY0 - nerv(1.4) * CH - 10); g.closePath(); g.fill(); }
    label(g, t, { at: [wk(2.5), CY0 - nerv(2.5) * CH * 0.6], to: [wk(3.6), CY0 - CH - 30], str: 'mostly nerves', start: tN });
  });
} });

// s022 — "Muscle growth took over later, after weeks."  the MUSCLE GROWTH band rises and takes over after weeks 3-5 ('after weeks (3-5)' on
// 'after'); a cream arm outline beside it finally gets a bit bigger on 'weeks.'; footnote.
registerShot('s022', { draw(g, t, info) {
  const st = info.shot.start, tA = sw('after', st, 1.49), tW = sw('weeks', st, 1.87);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 1b - MUSCLE TAKES OVER', fig: 'MORITANI & deVRIES, 1979' });
    chart(g, t, 0.62 + 0.38 * ease.inOut(prog(t, 0, 2.2)), ease.out(prog(t, 0.77, 2.4)));
    label(g, t, { at: [wk(4), CY0 - (nerv(4) + musc(4)) * CH], to: [wk(3.4), CY0 - CH - 40], str: 'after weeks (3-5)', start: tA });
    const big = 1 + 0.18 * ease.outBack(prog(t, tW, tW + 0.5)); g.save(); g.translate(1690, E.H * 0.45); g.scale(big, big); g.strokeStyle = CREAM; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-90, 60); g.lineTo(-10, 60); g.quadraticCurveTo(40, 40, 24, -20); g.lineTo(10, -70); g.moveTo(-90, 26); g.lineTo(-24, 26); g.quadraticCurveTo(-36, -24, -12, -44); g.stroke(); ring(g, 14, -86, 20, 5, CREAM); g.restore();
    T(g, 'muscle starts growing early too, just slowly (Folland & Williams 2007)', E.W / 2, E.H * 0.93, { size: 24, color: alpha(CREAM, 0.7), weight: 600 });
  });
} });

// s023 — "Level six. A hundred and sixty kilos."  LEVEL 6 THE SOFA, the morning pop: Zip on the cut, card unfolds, bar snaps, badge 5 -> 6,
// LEVEL UP! at 1.2 s, STR rolls 127 -> 160 kg (gold '160 kg' on 'kilos.'); freeze + shake, the flash LAST; HERO's spoon bends a little.
registerShot('s023', { draw(g, t, info) {
  const st = info.shot.start, tK = sw('kilos', st, 2.49), at = 0.05, tp = at + 1.15, tf = freeze(t, tp, 5);
  const cam = camMove(tf, info.dur, { z: [1.0, 1.06], x: [0, 0], y: [-40, -50] });
  const K = KIT(g, tf, cam), P = K.P;
  let sh = [0, 0];
  layer(g, cam, 1, (g) => {
    bowl(g, P.tableX, P.tableTop - 6, 1); mug(g, P.tableX + 120, P.tableTop - 2, tf);
    const hp = idle({ ...POSES.sit, eF: [40, -126], hF: [66, -142] }, tf, 2), ho = { x: P.tableX - 190, y: K.GY, s: 1.9, facing: 1 };
    hero(g, { ...ho, pose: hp, expr: exprAt(tf, [[0, 'surprised'], [tp, 'joy']]), blink: blinkFlag(tf, 3.4, 2), look: lookToward(0.8, -0.8), t: tf });
    const hd = handAt(ho, hp, 'F'); spoon(g, hd[0], hd[1], 0.15, 1.05, 0.35 * ease.out(prog(tf, tp, tp + 0.8)));
    const R = morningPop(g, tf, { at, zipX: P.tableX, zipY: P.tableTop - 140, cardX: P.tableX + 330, cardY: P.tableTop - 310, s: 1, lv: [5, 6], str: [127, 160], popX: P.tableX - 400, popY: P.tableTop - 380, popS: 0.75 });
    sh = R.shake; if (R.card) { const q = ease.out(prog(tf, tK, tK + 0.2)) * (1 - prog(tf, tK + 0.7, tK + 1.2)); if (q > 0) glow(g, R.card.str[0], R.card.str[1], 130, PAL.gold, 0.6 * q); }
  });
  void sh; home3Fg(g, tf, cam, { room: 'kitchen' });
  chip(g, t, { str: 'LEVEL 6: THE SOFA', at: sw('level', st, 0.21), x: 330, y: 110, dur: info.dur });
  levelFlash(g, t, tp);
} });

// s024 — "The TV remote is under the sofa."  living room at dusk: Biscuit asleep on the sofa cushion; HERO on hands and knees peering
// under the sofa; the remote glints (tiny cyan sparkle) in the dark gap on 'remote'; DEV in an armchair filming.
registerShot('s024', { draw(g, t, info) {
  const st = info.shot.start, tR = sw('remote', st, 0.53);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-60, -60], y: [-20, -30] });
  const A = apartment(g, t, cam, { power: 1, mood: 'dusk' }), sx = A.pos.sofaX, GY = A.GY;
  layer(g, cam, 1, (g) => {
    cat(g, { x: sx + 90, y: GY - 118, s: 1.6, facing: -1, pose: 'loaf', eyes: 'blink', t });
    remote(g, sx - 60, GY - 12, 1, 0.1);
    if (t > tR) { const k = Math.max(0, Math.sin((t - tR) * 5)); glow(g, sx - 60, GY - 14, 40, CYAN, 0.7 * k); seg(g, [[sx - 72, GY - 14], [sx - 48, GY - 14]], 3, alpha('#fff', k)); seg(g, [[sx - 60, GY - 26], [sx - 60, GY - 2]], 3, alpha('#fff', k)); }
    const kp = { ...POSES.kneel, head: [24, -112], sh: [16, -100], hF: [52, -8], eF: [40, -50], hB: [40, -6], eB: [28, -48] };
    hero(g, { x: sx - 420, y: GY + 20, s: 1.9, facing: 1, pose: idle(kp, t, 2), expr: t > tR ? 'surprised' : 'thinking', blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0.6), t, rim: A.rim });
    const ax = A.pos.lampX + 330; rr(g, ax - 120, GY - 210, 240, 200, 30); g.fillStyle = '#4a3a2a'; g.fill(); rr(g, ax - 140, GY - 130, 280, 110, 26); g.fillStyle = '#5a4632'; g.fill();
    const dp = idle({ ...POSES.sit, eF: [24, -150], hF: [40, -176] }, t, 4); actor(g, 'DEV', { x: ax, y: GY - 30, s: 1.8, facing: -1, pose: dp, expr: 'happy', blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, 0.2), t, rim: A.rim });
    const ph = handAt({ x: ax, y: GY - 30, s: 1.8, facing: -1 }, dp, 'F'); rr(g, ph[0] - 15, ph[1] - 48, 30, 52, 6); g.fillStyle = '#16121c'; g.fill(); circle(g, ph[0] + 6, ph[1] - 38, 4, '#ff3b30');
  });
  apartmentFg(g, t, cam);
} });

// the living room seen from low and looking UP (the floor sofa is below the frame): a ceiling band with a lamp above the wall
function upRoom(g, t, cam) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a2230', '#3a3040']); g.fillRect(0, 0, E.W, E.H);
  const A = apartment(g, t, cam, { power: 1, mood: 'dusk' });
  layer(g, cam, 0.55, (g) => { g.fillStyle = '#e8dcc8'; g.fillRect(-E.W, A.GY - 912, E.W * 3.2, 14); ceilingLamp(g, A.pos.sofaX + 40, A.GY - 760, t); });
  glow(g, E.W + 80, E.H * 0.5, 600, CYAN, 0.18);                                                                       // the TV off to the right
  return A;
}
// s025 — "You lift the sofa with one hand."  low angle: HERO stands and lifts the whole sofa overhead with ONE hand; cyan focus lines on
// 'sofa'; a cyan rim from the TV; his free hand picks up the remote on 'hand.'
registerShot('s025', { draw(g, t, info) {
  const st = info.shot.start, tL = sw('lift', st, 0.25), tSo = sw('sofa', st, 0.74), tH = sw('hand', st, 1.28);
  const k = ease.out(prog(t, tL, tSo + 0.3)), cam = { z: lerp(1.28, 1.34, t / info.dur), x: -80, y: -300 + Math.sin(t * 0.6) * 4, r: 0 };
  const A = upRoom(g, t, cam), hx = A.pos.sofaX - 40, GY = A.GY;
  speedLines5(g, t, { mode: 'focus', cx: E.W * 0.48, cy: E.H * 0.42, color: CYAN, a: 0.45 * ease.out(prog(t, tSo, tSo + 0.3)), inner: 560 });
  layer(g, cam, 1, (g) => lowAngleWrap(g, 0.9, GY, (g) => {
    const up = { ...POSES.stand, eF: [16, -200 - 40 * k], hF: [22, -230 - 90 * k], head: [4, -210] }, pick = { ...up, hB: [-30, -116], eB: [-20, -140] };
    const hp = idle(t > tH ? blendPose(up, pick, ease.out(prog(t, tH, tH + 0.3))) : up, t, 2), ho = { x: hx, y: GY + 20, s: 1.9, facing: 1 };
    const h = handAt(ho, hp, 'F'); sofa(g, h[0] + 10, h[1] + 6, 1, -0.06 + Math.sin(t * 2) * 0.01);
    hero(g, { ...ho, pose: hp, expr: exprAt(t, [[0, 'determined'], [tH, 'happy']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(0.3, -1), t, rim: { color: CYAN, dir: [1, -0.2] } });
    if (t > tH) { const hb = handAt(ho, hp, 'B'); remote(g, hb[0], hb[1] - 6, 1, -0.4); }
  }));
} });

// s026 — "Biscuit stays asleep on it."  on top of the raised sofa near the ceiling lamp: Biscuit curled on the cushion, unbothered; one ear
// twitches on 'asleep', a tiny 'z' floats up on 'on'; slow pull back reveals the sofa held up by one hand, HERO pointing the remote at the TV.
registerShot('s026', { draw(g, t, info) {
  const st = info.shot.start, tA = sw('asleep', st, 0.71), tO = sw('on', st + 0.9, 1.09);
  const k = ease.inOut(prog(t, 0.6, info.dur)), cam = { z: lerp(1.9, 1.3, k), x: lerp(0, -80, k), y: lerp(-560, -300, k), r: 0 };
  const A = upRoom(g, t, cam), hx = A.pos.sofaX - 40, GY = A.GY;
  layer(g, cam, 1, (g) => lowAngleWrap(g, 0.9, GY, (g) => {
    const hp = idle({ ...POSES.stand, eF: [16, -240], hF: [22, -320], hB: [78, -160], eB: [40, -152], head: [4, -210] }, t, 2), ho = { x: hx, y: GY + 20, s: 1.9, facing: 1 };
    const h = handAt(ho, hp, 'F'), sy = h[1] + 6; sofa(g, h[0] + 10, sy, 1, -0.04);
    cat(g, { x: h[0] + 100, y: sy - 118, s: 2.0, facing: -1, pose: 'loaf', eyes: 'blink', t, tilt: t > tA && t < tA + 0.3 ? 0.12 : 0 });
    if (t > tO) { const u = t - tO; text(g, 'z', h[0] + 60 + u * 30, sy - 230 - u * 60, { size: 46, color: '#fff', font: FONTS.ui, weight: 900, alpha: clamp(1 - u / 1.6) }); }
    hero(g, { ...ho, pose: hp, expr: 'smile', blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0), t, rim: { color: CYAN, dir: [1, -0.2] } });
    const hb = handAt(ho, hp, 'B'); remote(g, hb[0] + 14, hb[1], 1, 0);
  }));
} });
