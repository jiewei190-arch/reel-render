// B_s027_s032_record.js — ep 5 batch B: LEVEL 11 THE RECORD (pop LV 10->11, 403->508 kg, DEV lip-sync), DEV goes quiet, FIG 2 501 kg,
// the name card (plain text only), you beat it at breakfast, "Bones: not included." (dutch).
// LEGAL: our own rounded Stat Card only; no series words; hero eyes never glow; Hafþór Björnsson = plain text on a plate, no likeness.
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, seg, circle, rr, poly, alpha, text, FONTS, talkAmount } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { home3 } from '../sets/home3.js';
import { chip } from '../sets/hud.js';
import { board, label } from '../sets/bp.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { statCard, levelFlash, levelShake, freeze, sparks } from '../sets/statcard.js';
import { CREAM, GOLD, CORAL, CYAN, hero, bowl, kitchenPop, goldTag, creamCard, barbell, fmtK } from './B_lib.js';

const kitchen = (g, t, cam, mood = 'day') => home3(g, t, cam, { room: 'kitchen', mood, cereal: 0, plate: 0 });

// s027 — the morning pop LV 10 -> 11, STR 403 -> 508 (lands on 'eight' 2.16 s); DEV reads it aloud (lip-sync 0.82-2.60 s)
registerShot('s027', { draw(g, t0, info) {
  const t = freeze(t0, 1.2, 5), cm = camMove(t, info.dur, { z: [1.0, 1.05] });
  const sh = levelShake(t0, 1.2, 3), cam = { ...cm, x: cm.x + sh[0], y: cm.y + sh[1] };
  const H = kitchen(g, t, cam), P = H.pos, GY = H.GY ?? E.H * 0.8;
  layer(g, cam, 1, (g) => {
    hero(g, { x: P.tableX - 430, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront']]), t, 1), expr: exprAt(t, [[0, 'surprised'], [1.3, 'happy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.4), t });
    actor(g, 'DEV', { x: P.tableX + 780, y: GY, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'phone']]), t, 3), expr: exprAt(t, [[0, 'surprised'], [0.8, 'awe']]), talk: talkAmount(info.shot.start + t0, info.shot.start + 0.82, info.shot.start + 2.6), blink: blinkFlag(t, 3.4, 1), look: lookToward(-1, -0.3), t });
    bowl(g, P.tableX, P.tableTop - 6, 1);
    kitchenPop(g, t, P, { lv: [10, 11], str: [403, 508], strLand: 2.16 });
  });
  chip(g, t0, { str: 'LEVEL 11: THE RECORD', at: 0.24, y: E.H * 0.88, dur: info.dur });
  levelFlash(g, t0, 1.2);
} });

// s028 — GIANT FACE DEV goes quiet (not lip-synced); phone lowering; the card's cyan on his cheek
registerShot('s028', { draw(g, t, info) {
  const z = 1 + 0.04 * ease.inOut(t / info.dur);
  blurLayer(g, 10, (g) => kitchen(g, t, { z: 1.2, x: 300, y: -60 }), null, 1); veil(g, '#1a1020', 0.25);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const cx = E.W * 0.5, cy = E.H * 0.5, r = 330;
  giantFace(g, cx, cy, r, { who: 'DEV', f: faceAt(t, [[0, 'delighted'], [0.36, 'awe']], 0.14), rimSide: -1, rimColor: CYAN, blink: Math.max(blinkAmt(t, 9, 0), Math.sin(clamp((t - 0.56) / 0.3) * Math.PI)), breath: Math.sin(t * 2), look: [-0.3, -0.1] });
  glow(g, cx - r * 0.55, cy + r * 0.2, 160, CYAN, 0.35);
  // his phone lowering at the frame bottom
  const py = lerp(E.H * 0.86, E.H * 1.1, ease.inOut(prog(t, 0.2, 1.4)));
  g.save(); g.translate(cx + r * 0.75, py); g.rotate(-0.15); rr(g, -90, -160, 180, 320, 26); g.fillStyle = '#1b1d24'; g.fill(); rr(g, -76, -144, 152, 280, 16); g.fillStyle = alpha(CYAN, 0.35); g.fill(); g.restore();
  g.restore();
} });

// s029 — FIG 2: the heaviest deadlift, gold 501 kg on 'kilos.' (3.15 s)
function fig2(g, t, title, o = {}) {
  const z = 1 + 0.04 * ease.inOut(t / (o.dur || 4));
  board(g, t, { title, fig: 'GUINNESS WORLD RECORDS' });
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  barbell(g, E.W / 2, E.H * 0.52, 1.3, o.k ?? 1);
  // a simple platform under the bar
  seg(g, [[E.W / 2 - 660, E.H * 0.52 + 190], [E.W / 2 + 660, E.H * 0.52 + 190]], 5, alpha(CREAM, 0.6));
  const v = o.v ?? 501; if (o.showNum !== false) { const k = ease.outBack(prog(t, o.numAt ?? 0, (o.numAt ?? 0) + 0.3)); if (k > 0.01) { g.save(); g.translate(E.W / 2, E.H * 0.25); g.scale(k, k); text(g, `${Math.round(v)} kg`, 0, 0, { size: 140, color: GOLD, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(GOLD, 0.6) }); g.restore(); } }
  g.restore();
}
registerShot('s029', { draw(g, t, info) {
  const v = lerp(0, 501, ease.out(prog(t, 2.27, 3.15)));
  fig2(g, t, 'FIG 2 - THE HEAVIEST DEADLIFT', { k: ease.inOut(prog(t, 0.15, 1.6)), v, numAt: 2.27, dur: info.dur });
  label(g, t, { at: [E.W / 2 + 330, E.H * 0.52 + 120], to: [E.W / 2 + 120, E.H * 0.86], str: 'heaviest deadlift ever recorded', start: 0.67 });
  if (t > 3.15) sparks(g, t, 3.15, E.W / 2, E.H * 0.25, { n: 18, s: 0.8, seed: 3 });
} });

// s030 — THE NAME CARD: plain text on a cream record plate (no photo, no likeness)
registerShot('s030', { draw(g, t, info) {
  fig2(g, t, 'FIG 2 - THE HEAVIEST DEADLIFT', { v: 501, numAt: -1, dur: info.dur });
  const name = 'HAFÞÓR JÚLÍUS BJÖRNSSON', n = Math.ceil(name.length * prog(t, 0.15, 1.0));
  creamCard(g, E.W / 2, E.H * 0.8, 1080, 150, { rot: -0.015 });
  text(g, name.slice(0, n), E.W / 2 - 500, E.H * 0.8 - 18, { size: 64, color: '#2a2418', font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  const pk = ease.outBack(prog(t, 1.25, 1.55));
  if (pk > 0.01) { g.save(); g.translate(E.W / 2 - 440, E.H * 0.8 + 38); g.scale(pk, pk); circle(g, 0, -12, 14, CORAL); poly(g, [[-10, -4], [10, -4], [0, 16]], CORAL); circle(g, 0, -12, 5, CREAM); g.restore(); text(g, 'ICELAND', E.W / 2 - 410, E.H * 0.8 + 38, { size: 40, color: '#2a2418', font: FONTS.ui, weight: 900, align: 'left', alpha: clamp(pk) }); }
  goldTag(g, t, 2.05, '2020', E.W / 2 + 380, E.H * 0.8 + 40, { size: 50 });
} });

// s031 — YOU BEAT IT AT BREAKFAST: '501 kg' inset vs the Stat Card 508; gold '>' on 'beat' (0.27); then the card dips, a coral underline blinks (1.93-2.57), dutch tilt
registerShot('s031', { draw(g, t, info) {
  const uh = prog(t, 1.93, 2.57), cam = camMove(t, info.dur, { z: [1.04, 1.08], r: [0, 0.04 * ease.inOut(prog(t, 1.93, info.dur))] });
  const H = kitchen(g, t, cam), P = H.pos, GY = H.GY ?? E.H * 0.8;
  layer(g, cam, 1, (g) => {
    hero(g, { x: P.tableX - 300, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [0.6, 'shrug'], [1.6, 'holdFront']]), t, 1), expr: exprAt(t, [[0, 'smile'], [2.2, 'worried']]), blink: blinkFlag(t, 3.1, 2), talk: 0, look: lookToward(1, -0.3), t });
    bowl(g, P.tableX, P.tableTop - 6, 1);
  });
  // the two numbers side by side (screen space)
  creamCard(g, E.W * 0.3, E.H * 0.26, 360, 170); text(g, '501 kg', E.W * 0.3, E.H * 0.26 - 10, { size: 80, color: '#2a2418', font: FONTS.ui, weight: 900 }); text(g, 'the record', E.W * 0.3, E.H * 0.26 + 52, { size: 30, color: '#5a5040', font: FONTS.ui, weight: 800 });
  const dip = 24 * ease.inOut(uh), cool = 0.18 * uh;
  const card = statCard(g, t, { x: E.W * 0.68, y: E.H * 0.27 + dip, s: 0.75, lv: 11, str: 508 });
  goldTag(g, t, 0.27, '<', E.W * 0.47, E.H * 0.26, { size: 96 });
  if (uh > 0 && card) { const on = Math.sin(t * 20) > -0.2 ? 1 : 0.3; g.save(); g.globalAlpha *= on * clamp(uh * 3); g.shadowColor = CORAL; g.shadowBlur = 14; rr(g, E.W * 0.68 - 220, E.H * 0.27 + dip + 100, 440, 8, 4); g.fillStyle = CORAL; g.fill(); g.restore(); }
  if (cool > 0) veil(g, '#1a3a6a', cool, 'multiply');
} });

// s032 — "BONES: NOT INCLUDED." close on the card, coral line types on 0.15-0.76, dutch, slow push; the spoon drops in the soft background on 0.76
registerShot('s032', { draw(g, t, info) {
  const z = lerp(1.1, 1.18, ease.inOut(t / info.dur));
  blurLayer(g, 8, (g) => { const H = kitchen(g, t, { z: 1.25, x: -120, y: 60 }); const P = H.pos, GY = H.GY ?? E.H * 0.8;
    layer(g, { z: 1.25, x: -120, y: 60 }, 1, (g) => { hero(g, { x: P.tableX - 300, y: GY, s: 1.9, facing: 1, pose: poseAt(t, [[0, 'holdFront'], [0.76, 'shock']]), expr: exprAt(t, [[0, 'worried'], [0.76, 'shocked']]), t }); bowl(g, P.tableX, P.tableTop - 6, 1, { spoonDrop: ease.in(prog(t, 0.76, 1.0)) }); }); }, null, 1);
  veil(g, '#120a1c', 0.3);
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(0.05); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  statCard(g, t, { x: E.W * 0.52, y: E.H * 0.48, s: 1.3, lv: 11, str: 508, warn: 'Bones: not included.', warnAt: 0.15 });
  glow(g, E.W * 0.52, E.H * 0.48 + 100, 360, CORAL, 0.12 * prog(t, 0.15, 0.8));
  g.restore();
} });
