// A_s001_s012_open.js — ep 4 batch A, COLD OPEN (0.00-37.52): Saturday, the shed, Pip, the tilt, the hop, the staring contest, the ceiling,
// the drop, "nobody knows", Pip's shrug, the title. LEGAL: no famous-hero anything (no red-and-blue, no web patterns, no wrist silk).
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, shade, glow, text, FONTS, rr, seg, circle, ring, poly, linGrad, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, walkAlong, pointAndLook, lookToward, camMove, atmos } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { garden, gardenFg } from '../sets/garden.js';
import { home3 } from '../sets/home3.js';
import { pip, pipFace, drawCeiling, stickMarks, silkLine, gloves } from '../sets/spider.js';
import { sw, bedroom, titleText } from './A_lib.js';

const SUN = { color: '#ffd8a8', dir: [-0.8, -0.5] };
const LEGS_OUT = { head: [6, -128], sh: [2, -94], hip: [0, -22], eF: [16, -56], hF: [28, -22], eB: [-12, -56], hB: [-22, -22], kF: [46, -30], fF: [96, -14], kB: [40, -28], fB: [90, -12] };   // sitting up on the bed, legs out
const shedBg = (g, t, cam, amt = 8) => blurLayer(g, amt, (g) => garden(g, t, cam, { view: 'shed', mood: 'morning', door: 0.4 }), null, 1);
const bokeh = (g, t) => { const R = rng(5); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const x = R() * E.W, y = R() * E.H * 0.7; glow(g, x + Math.sin(t * 0.3 + i) * 10, y, 60 + R() * 80, '#ffe8c0', 0.12); } g.restore(); };

// ===================================================================================================
// s001 — "Saturday. You're in the garden shed looking for Mina's bike pump,"  the back garden on a Saturday morning, a slow push toward the
// shed; Biscuit sunning on the back step; HERO walks from the step toward the shed; MINA holds up her bike with a flat tyre and points.
registerShot('s001', { draw(g, t, info) {
  const st = info.shot.start, tYou = sw("you're", st, 1.52), tShed = sw('shed', st, 2.46), tMina = sw("mina's", st, 3.52);
  const cam = camMove(t, info.dur, { z: [0.92, 1.04], x: [-260, 120], y: [-110, -120] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  const P = G.pos, x0 = P.stepX + 160, x1 = G.CX + 120, k = ease.inOut(prog(t, tYou, tShed + 0.7)), hx = lerp(x0, x1, k), moving = k > 0 && k < 1;
  layer(g, cam, 1, (g) => {
    cat(g, { x: P.stepX - 60, y: P.stepTop + 4, s: 1.6, facing: 1, pose: 'loaf', t, rim: G.rim });
    // birds at the feeder
    for (let i = 0; i < 2; i++) { const bx = G.CX - 150 + i * 46, by = G.GY - 455 + Math.sin(t * 6 + i) * 3; g.fillStyle = '#5a4a3a'; g.beginPath(); g.ellipse(bx, by, 16, 11, 0, 0, 7); g.fill(); circle(g, bx + 12, by - 8, 8, '#5a4a3a'); poly(g, [[bx + 18, by - 8], [bx + 26, by - 6], [bx + 18, by - 4]], '#e8a040'); }
    const hp = moving ? walkAlong(hx, 1.9).pose : idle(POSES.stand, t, 2);
    actor(g, 'HERO', { x: hx, y: (k <= 0 ? P.stepTop : G.GY + 30), s: 1.9, facing: 1, pose: hp, expr: exprAt(t, [[0, 'sleepy'], [tYou, 'smile']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0), rim: G.rim, t });
    gloves(g, { x: hx, y: (k <= 0 ? P.stepTop : G.GY + 30), s: 1.9, facing: 1 }, hp, { t });
    // MINA with her little bike (flat front tyre), points at the shed on "Mina's"
    const mx = G.CX + 560, P2 = pointAndLook(t, tMina, [1, -0.1], { base: 'stand' });
    const bx = mx - 210; ring(g, bx, G.GY + 10, 46, 8, '#2a2a2a'); g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(bx + 150, G.GY + 40, 46, 16, 0, 0, 7); g.fill();   // flat tyre: squashed
    seg(g, [[bx, G.GY + 10], [bx + 70, G.GY - 60], [bx + 150, G.GY + 30], [bx + 50, G.GY + 10], [bx + 70, G.GY - 60]], 8, '#d84a8a'); seg(g, [[bx + 70, G.GY - 60], [bx + 54, G.GY - 92]], 6, '#2a2a2a');
    actor(g, 'MINA', { x: mx, y: G.GY + 40, s: 2.0, facing: 1, pose: idle(t < tMina ? { ...POSES.stand, eB: [-20, -120], hB: [-40, -110] } : P2.pose, t, 3), expr: exprAt(t, [[0, 'sad'], [tMina, 'determined']]), blink: blinkFlag(t, 2.9, 3), look: t > tMina ? P2.look : lookToward(-1, 0.2), rim: G.rim, t });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
  chip(g, t, { str: 'SATURDAY', at: 0.0, x: 260, y: 110, dur: info.dur });
} });

// ===================================================================================================
// s002 — "and something is looking back at you."  in the shed: HERO crouches for the bike pump; on "something" the camera drifts up-left to the
// cobwebbed window corner, where two tiny glossy eyes glint (Pip, half hidden). On "back" he freezes and looks up.
registerShot('s002', { draw(g, t, info) {
  const st = info.shot.start, tSom = sw('something', st, 0.65), tBack = sw('back', st, 1.51);
  const k = ease.inOut(prog(t, tSom, info.dur)), cam = { z: lerp(1.08, 1.16, t / info.dur), x: lerp(180, -330, k) + Math.sin(t * 0.6) * 6, y: lerp(-30, -210, k), r: 0 };
  const G = garden(g, t, cam, { view: 'shed', mood: 'morning', door: 0.4 });
  const P = G.pos, hx = P.pumpX - 250;
  layer(g, cam, 1, (g) => {
    const hp = idle(poseAt(t, [[0, { ...POSES.crouch, hF: [60, -40] }], [tBack, { ...POSES.crouch, head: [12, -156], hF: [58, -46] }]]), t, 2);
    actor(g, 'HERO', { x: hx, y: G.GY + 20, s: 1.95, facing: 1, pose: hp, expr: exprAt(t, [[0, 'neutral'], [tBack, 'surprised']]), blink: t > tBack ? false : blinkFlag(t, 3.3, 2), look: t > tBack - 0.2 ? lookToward(-1, -0.7) : lookToward(1, 0.5), rim: G.rim, t });
    gloves(g, { x: hx, y: G.GY + 20, s: 1.95, facing: 1 }, hp, { t });
    pip(g, P.webX + 46, P.webY + 44, 0.8, { t, look: [0.6, 0.5], blink: blinkAmt(t, 3, 1) });
    if (t > tSom) { const gl = 0.5 + 0.5 * Math.sin(t * 6); glow(g, P.webX + 40, P.webY + 38, 26, '#ffffff', 0.35 * gl); }
  });
  gardenFg(g, t, cam, { view: 'shed' });
} });

// ===================================================================================================
// s003 — "A tiny, fuzzy spider. Two enormous eyes."  PIP macro at the window corner: steps out of the cobweb onto the frame on "A"; on "Two"
// the push lands on the two huge front eyes (the window reflected). Cute, warm, never scary.
registerShot('s003', { draw(g, t, info) {
  const st = info.shot.start, tA = 0.15, tTwo = sw('two', st, 2.25);
  const z = lerp(1.6, 1.7, t / info.dur) * (1 + 0.06 * ease.inOut(prog(t, tTwo, tTwo + 0.6)));
  const G0 = { webX: E.W / 2 - 470, webY: E.H * 0.8 - 830 };
  const cam = { z, x: G0.webX - E.W / 2 + 140, y: G0.webY - E.H / 2 + 110, r: 0 };
  const G = garden(g, t, cam, { view: 'shed', mood: 'morning', door: 0.4 });
  bokeh(g, t);
  const P = G.pos, step = ease.inOut(prog(t, tA, tA + 0.9));
  layer(g, cam, 1, (g) => {
    seg(g, [[P.webX - 40, P.webY + 168], [P.webX + 420, P.webY + 168]], 18, '#2a2018');                     // the window frame Pip walks onto
    pip(g, lerp(P.webX + 46, P.webX + 140, step), lerp(P.webY + 44, P.webY + 150, step), 2.5, { t, look: [-0.6, 0.1], blink: blinkAmt(t, 2.8, 1), tilt: Math.sin(t * 1.1) * 0.15 });
  });
  atmos(g, t, cam, { color: '#fff0d0', far: 16, near: 6 });
} });

// ===================================================================================================
// s004 — "It tilts its head. You tilt yours."  over Pip's shoulder: Pip (left third, sharp) on the shelf edge; HERO's face behind in soft focus
// (right). Pip tilts on "tilts"; on "tilt" HERO tilts his head the same way. Both hold it; Pip blinks once.
registerShot('s004', { draw(g, t, info) {
  const st = info.shot.start, tP = sw('tilts', st, 0.29), tH = sw('tilt', st + 1.2, 1.93);
  const z = lerp(1.0, 1.05, ease.inOut(t / info.dur));
  shedBg(g, t, { z: 1.4, x: -200, y: -180 }, 10);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // HERO, big and soft behind
  blurLayer(g, 3, (g) => {
    const tilt = 0.2 * ease.outBack(prog(t, tH, tH + 0.4)), hp = idle({ ...POSES.stand, eF: [40, -150], hF: [70, -130] }, t, 2);
    g.save(); g.translate(1340, 560); g.rotate(-tilt); g.translate(-1340, -560);
    actor(g, 'HERO', { x: 1320, y: 1230, s: 3.2, facing: -1, pose: hp, expr: exprAt(t, [[0, 'surprised'], [tH, 'smile']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(-1, 0.2), rim: SUN, t });
    g.restore();
  }, null, 1);
  // the shelf edge + Pip, sharp
  rr(g, -40, E.H * 0.66, E.W * 0.62, 34, 6); g.fillStyle = '#6a5038'; g.fill(); g.fillStyle = '#3a2a1c'; g.fillRect(-40, E.H * 0.66 + 34, E.W * 0.62, 400);
  const tk = ease.outBack(prog(t, tP, tP + 0.4)), bl = t > 2.5 && t < 2.7 ? 1 : 0;
  pip(g, E.W * 0.3, E.H * 0.66 - 4, 3.0, { t, tilt: tk, look: [0.8, -0.1], blink: bl });
  g.restore();
  glow(g, E.W * 0.15, E.H * 0.1, 700, '#fff0d0', 0.25); atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#fff0d0', far: 14, near: 5 });
} });

// ===================================================================================================
// s005 — "It hops onto your thumb. No bite."  macro on HERO's bare hand held out flat (the other hand still gloved, at the edge); Pip hops on
// "hops" and lands on the thumb on "thumb" (squash); 'NO BITE' chip on "No"; Pip just sits there, palps twitching.
function openHand(g, x, y, s) {                                                   // a big bare hand, palm up, thumb raised (rig ink colour), mustard cuff
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = S().ink; g.beginPath(); g.ellipse(0, 0, 150, 70, -0.08, 0, 7); g.fill();
  for (let i = 0; i < 4; i++) { rr(g, -210 - i * 6, -60 + i * 34, 120, 40, 20); g.fill(); }
  rr(g, 70, -190, 56, 170, 28); g.fill();                                                                                     // thumb, straight up
  g.fillStyle = '#E1AD01'; rr(g, 110, -70, 340, 160, 60); g.fill(); g.fillStyle = alpha('#000', 0.2); g.fillRect(110, -70, 30, 160);
  g.strokeStyle = alpha('#ffd8a8', 0.45); g.lineWidth = 5; g.beginPath(); g.ellipse(0, -6, 150, 70, -0.08, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
  g.restore();
  return [x + 98 * s, y - 186 * s];                                                                                         // thumb tip (world)
}
registerShot('s005', { draw(g, t, info) {
  const st = info.shot.start, tHop = sw('hops', st, 0.35), tThumb = sw('thumb', st, 0.97), tNo = sw('no', st + 1.5, 2.03);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  shedBg(g, t, { z: 1.6, x: -300, y: -260 }, 12); bokeh(g, t);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const tip = openHand(g, E.W * 0.55, E.H * 0.7, 1.5);
  // the other hand, still in its purple glove, at the frame edge
  g.fillStyle = '#7b4bb3'; g.beginPath(); g.ellipse(E.W * 0.06, E.H * 0.95, 180, 120, 0.4, 0, 7); g.fill();
  const k = prog(t, tHop, tThumb), from = [E.W * 0.2, E.H * 0.42], land = [tip[0] - 4, tip[1] + 8];
  const x = lerp(from[0], land[0], ease.inOut(k)), y = lerp(from[1], land[1], k) - Math.sin(k * Math.PI) * 180;
  const sq = t > tThumb ? Math.exp(-(t - tThumb) * 8) * Math.sin((t - tThumb) * 30) * 0.12 : 0;
  g.save(); g.translate(x, y); g.scale(1 + sq, 1 - sq); pip(g, 0, 0, 1.7, { t, look: [-0.4, 0.3], blink: blinkAmt(t, 3.1, 2), tilt: t > tThumb + 0.6 ? Math.sin(t * 2) * 0.2 : 0 }); g.restore();
  g.restore();
  chip(g, t, { str: 'NO BITE  ✓', at: tNo, x: E.W * 0.24, y: E.H * 0.84, dur: info.dur });
} });

// ===================================================================================================
// s006 — "Just a very long stare. Mina names it Pip."  THE STARING CONTEST: HERO's giant face (left) vs Pip big on the thumb (right). Nobody
// blinks; his eyes narrow, a sweat bead. MINA pops into the doorway behind on "Mina" and points; a cream 'PIP' tag swings onto the spider.
registerShot('s006', { draw(g, t, info) {
  const st = info.shot.start, tSt = sw('stare', st, 0.67), tMina = sw('mina', st, 2.15), tPip = sw('pip', st + 2.4, 2.79);
  const z = lerp(1.0, 1.05, ease.inOut(t / info.dur));
  shedBg(g, t, { z: 1.2, x: 520, y: -60 }, 10);
  // MINA in the soft doorway between them
  if (t > tMina - 0.1) blurLayer(g, 3, (g) => { const k = ease.outBack(prog(t, tMina - 0.1, tMina + 0.25)); actor(g, 'MINA', { x: E.W * 0.52, y: E.H * 0.98 + (1 - k) * 200, s: 1.5, facing: 1, pose: idle(POSES.point, t, 3), expr: 'joy', blink: blinkFlag(t, 2.9, 3), rim: SUN, t }); }, null, 1);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const f = faceAt(t, [[0, 'awe'], [tSt, { eye: 0.38, pupil: 0.9, brow: -0.3, tilt: 0.5, smile: -0.05, w: 0.7, sweat: 0.7, look: [0.9, 0] }]], 0.2);
  giantFace(g, 560, 560, 300, { who: 'HERO', f, rimSide: -1, rimColor: '#ffd8a8', glint: '#fff0d0', blink: 0, breath: Math.sin(t * 2) * 0.3 });
  // Pip big on a thumb tip (bottom right)
  g.fillStyle = S().ink; rr(g, 1300, 760, 160, 400, 80); g.fill();
  pip(g, 1380, 760, 5, { t, look: [-0.9, 0], blink: 0, tilt: Math.sin(t * 0.7) * 0.06 });
  // the PIP name tag swings on
  if (t > tPip - 0.05) { const u = t - tPip, sw2 = Math.exp(-u * 3) * Math.sin(u * 9) * 0.5; g.save(); g.translate(1480, 600); g.rotate(sw2 + 0.15); seg(g, [[0, 0], [0, 70]], 3, '#c8b898'); rr(g, -70, 70, 140, 64, 10); g.fillStyle = '#f4ead4'; g.fill(); g.strokeStyle = '#8a6a40'; g.lineWidth = 3; g.stroke(); text(g, 'PIP', 0, 102, { size: 42, color: '#5a3a20', font: FONTS.title, spacing: 4 }); g.restore(); }
  g.restore();
  atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#fff0d0', far: 12, near: 4 });
} });

// ===================================================================================================
// s007 — "Next morning, you wake up stuck to the ceiling."  the camera starts on the empty bed (Biscuit asleep on the pillow) and tilts up on
// "wake" to find HERO spread flat on the ceiling; sleepy, then surprised on "stuck". The alarm rattles at the start.
registerShot('s007', { draw(g, t, info) {
  const st = info.shot.start, tWake = sw('wake', st, 1.03), tStuck = sw('stuck', st, 1.39);
  const up = ease.inOut(prog(t, tWake - 0.1, tWake + 0.8)), cam = { z: lerp(1.0, 1.04, t / info.dur), x: Math.sin(t * 0.5) * 6, y: lerp(260, -40, up), r: 0 };
  const B = bedroom(g, t, cam, { ring: t < 0.8 ? 1 : 0 });
  layer(g, cam, 1, (g) => {
    cat(g, { x: B.pillowX, y: B.bedTop - 30, s: 1.4, facing: 1, pose: 'loaf', eyes: 'blink', t, rim: SUN });
    drawCeiling(g, 'HERO', { t, x: E.W * 0.5, ceilY: B.ceilY + 10, s: 1.7, peel: 0, expr: t < tStuck ? 'sleepy' : 'surprised', blink: t < tStuck ? true : blinkFlag(t, 3, 1), rim: SUN });
  });
  atmos(g, t, cam, { color: '#ffe8c8', far: 14, near: 5 });
} });

// ===================================================================================================
// s008 — "For about two seconds."  tight on HERO on the ceiling, eyes huge; a stopwatch chip ticks 0:01 on "two", 0:02 on "seconds", and his
// limbs start to peel (a hand comes away, the stick rings fading). 2 px shake.
registerShot('s008', { draw(g, t, info) {
  const st = info.shot.start, tTwo = sw('two', st, 0.55), tSec = sw('seconds', st, 0.79);
  const sh = (Math.sin(t * 50) * 2), cam = { z: lerp(1.6, 1.66, t / info.dur), x: sh, y: -300 + sh * 0.5, r: 0 };
  const B = bedroom(g, t, cam, {});
  layer(g, cam, 1, (g) => drawCeiling(g, 'HERO', { t, x: E.W * 0.5, ceilY: B.ceilY + 10, s: 1.7, peel: lerp(0, 0.34, prog(t, tSec, info.dur)), expr: 'shocked', blink: false, rim: SUN }));
  atmos(g, t, cam, { color: '#ffe8c8', far: 12, near: 4 });
  chip(g, t, { str: t < tSec ? '0:01' : '0:02', at: tTwo, x: E.W * 0.82, y: E.H * 0.82, dur: info.dur });
} });

// ===================================================================================================
// s009 — "Then you're on the bed, and Biscuit isn't."  he peels off and drops onto the bed on "Then"-"on" (the duvet bounces, shake), and
// Biscuit is launched off the pillow on "and" (arched, eyes wide, fur puffed, out of frame right); on "isn't" a few cat hairs drift down.
registerShot('s009', { draw(g, t, info) {
  const st = info.shot.start, tLand = sw('on', st + 0.3, 0.49), tAnd = sw('and', st + 0.6, 0.97), tIsnt = sw("isn't", st, 1.65);
  const u = t - tLand, shk = u > 0 && u < 0.5 ? Math.exp(-u * 8) * Math.sin(u * 60) * 5 : 0;
  const cam = { z: 1.02, x: shk, y: 60 + shk, r: 0 };
  const B = bedroom(g, t, cam, { bounce: u > 0 ? Math.exp(-u * 6) * Math.sin(u * 22) * 14 : 0 });
  layer(g, cam, 1, (g) => {
    if (t < tLand) drawCeiling(g, 'HERO', { t, x: E.W * 0.5, ceilY: B.ceilY + 10, s: 1.7, peel: lerp(0.4, 1, ease.in(prog(t, 0, tLand))), dropTo: B.bedTop - B.ceilY - 160, expr: 'shocked', blink: false, rim: SUN });
    else actor(g, 'HERO', { x: E.W * 0.5, y: B.bedTop + 10, s: 1.7, facing: 1, pose: idle(poseAt(t, [[tLand, LEGS_OUT], [tLand + 0.7, { ...LEGS_OUT, eF: [30, -100], hF: [12, -128] }]]), t, 2), expr: exprAt(t, [[0, 'shocked'], [tIsnt - 0.3, 'sheepish']]), blink: blinkFlag(t, 3, 1), look: lookToward(1, -0.2), rim: SUN, t });
    // Biscuit: asleep, then launched (arch, wide eyes) off to the right on "and"
    const k = prog(t, tAnd, tAnd + 0.6);
    if (k <= 0) cat(g, { x: B.pillowX, y: B.bedTop - 30, s: 1.4, facing: 1, pose: 'loaf', eyes: t > tLand ? 'wide' : 'blink', t, rim: SUN });
    else if (k < 1) cat(g, { x: lerp(B.pillowX, E.W + 300, k), y: B.bedTop - 30 - Math.sin(k * Math.PI) * 420, s: 1.5, facing: 1, pose: 'arch', eyes: 'wide', t, rim: SUN });
    if (t > tAnd + 0.2) { const R = rng(4); for (let i = 0; i < 6; i++) { const v = t - tAnd - 0.2 - i * 0.05; if (v < 0) continue; seg(g, [[B.pillowX + R() * 120 - 60 + Math.sin(v * 3 + i) * 20, B.bedTop - 260 + v * 120 + R() * 60], [B.pillowX + R() * 120 - 50 + Math.sin(v * 3 + i) * 20, B.bedTop - 256 + v * 120 + R() * 60]], 2, '#2a2230'); } }
  });
  atmos(g, t, cam, { color: '#ffe8c8', far: 14, near: 5 });
} });

// ===================================================================================================
// s010 — "Nobody knows how a staring contest gives you spider powers."  a corkboard over the dimmed bedroom: a polaroid of Pip, a polaroid of
// HERO on the ceiling, a cream '?' card; on "staring" a string pulls tight; on "spider" a gold strip 'STARE -> ??? -> POWERS'; a second '?' on
// "powers". Mina's crayon doodle of Pip pinned beside. Desk lamp warm.
function polaroid(g, x, y, rot, draw) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-122, -132, 252, 290); rr(g, -130, -140, 260, 300, 4); g.fillStyle = '#f8f4ec'; g.fill(); g.save(); g.beginPath(); g.rect(-110, -120, 220, 210); g.clip(); draw(); g.restore(); circle(g, 0, -150, 10, '#c8a040'); g.restore(); }
registerShot('s010', { draw(g, t, info) {
  const st = info.shot.start, tStare = sw('staring', st, 1.16), tSpi = sw('spider', st, 2.54), tPow = sw('powers', st, 2.86);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  blurLayer(g, 12, (g) => home3(g, t, { z: 1.1, x: 0, y: -60 }, { room: 'bedroom', mood: 'day', marks: 0 }), null, 1); veil(g, '#140e18', 0.4);
  glow(g, E.W * 0.86, E.H * 0.2, 500, '#ffd59a', 0.35);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  rr(g, 260, 120, 1400, 780, 18); g.fillStyle = '#6a4a2c'; g.fill(); rr(g, 284, 144, 1352, 732, 10); g.fillStyle = '#c8a070'; g.fill();
  const R = rng(9); g.fillStyle = alpha('#8a6a40', 0.4); for (let i = 0; i < 300; i++) circle(g, 290 + R() * 1340, 150 + R() * 720, 2, alpha('#8a6a40', 0.4));
  const A = [560, 420], B = [1360, 420];
  const tk = ease.out(prog(t, tStare - 0.1, tStare + 0.3)); g.strokeStyle = '#e8c860'; g.lineWidth = 4; g.beginPath(); g.moveTo(A[0] + 120, A[1] - 120); g.quadraticCurveTo((A[0] + B[0]) / 2, A[1] - 120 + 90 * (1 - tk), B[0] - 120, B[1] - 120); g.stroke();
  polaroid(g, A[0], A[1], -0.06, () => { g.fillStyle = '#d8c8a8'; g.fillRect(-110, -120, 220, 210); pip(g, 0, 10, 2.0, { t, look: [0.4, 0] }); });
  polaroid(g, B[0], B[1], 0.05, () => { g.fillStyle = '#efe8dc'; g.fillRect(-110, -120, 220, 210); g.fillStyle = '#d8ccb8'; g.fillRect(-110, -70, 220, 160); drawCeiling(g, 'HERO', { t, x: 0, ceilY: -110, s: 0.5, peel: 0, expr: 'shocked', blink: false }); });
  const q = (x, y, at, rot) => { const k = ease.outBack(prog(t, at, at + 0.35)); if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); rr(g, -60, -70, 120, 140, 6); g.fillStyle = '#f4ead4'; g.fill(); text(g, '?', 0, 4, { size: 100, color: '#5a3a20', font: FONTS.title }); g.restore(); };
  q(960, 330, 0.2, 0.04); q(1150, 700, tPow, -0.1);
  const ak = ease.out(prog(t, tSpi, tSpi + 0.5)); if (ak > 0) { g.save(); g.beginPath(); g.rect(420, 620, 1080 * ak, 120); g.clip(); rr(g, 420, 640, 1000, 90, 12); g.fillStyle = '#1a140c'; g.fill(); text(g, 'STARE  →  ???  →  POWERS', 920, 686, { size: 50, color: S().ui.gold, font: FONTS.title, spacing: 3 }); g.restore(); }
  // Mina's crayon doodle of Pip
  g.save(); g.translate(1540, 760); g.rotate(0.08); rr(g, -110, -100, 220, 200, 4); g.fillStyle = '#fbf7ee'; g.fill(); g.strokeStyle = '#6a6a6a'; g.lineWidth = 6; g.beginPath(); g.arc(0, 10, 40, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = Math.PI * (1.1 + (i % 4) * 0.12) + (i >= 4 ? Math.PI * -0.75 : 0); seg(g, [[Math.cos(a) * 40, 10 + Math.sin(a) * 40], [Math.cos(a) * 80, 30 + Math.sin(a) * 60]], 5, '#6a6a6a'); } circle(g, -14, 0, 12, '#3a3a3a'); circle(g, 14, 0, 12, '#3a3a3a'); text(g, 'pip', 0, 80, { size: 30, color: '#d84a8a', font: FONTS.title }); g.restore();
  g.restore();
  atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#ffe8c8', far: 12, near: 4 });
} });

// ===================================================================================================
// s011 — "Not even Pip."  Pip's giant face: on "even" a tiny shrug (front legs up + tilt), on "Pip" a slow blink. Window in its eyes.
registerShot('s011', { draw(g, t, info) {
  const st = info.shot.start, tEven = sw('even', st, 0.39), tPip = sw('pip', st, 0.65);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#c8b89a', '#8a7a60']); g.fillRect(0, 0, E.W, E.H); glow(g, E.W * 0.3, E.H * 0.2, 900, '#fff4dc', 0.3); bokeh(g, t);
  const sh = ease.outBack(prog(t, tEven, tEven + 0.35)), bl = t > tPip ? Math.sin(clamp((t - tPip) / 0.45) * Math.PI) : 0;
  pipFace(g, E.W * 0.5 + Math.sin(t * 0.5) * 10, E.H * 0.55, E.H * 0.42, { t, look: [0, 0.1], blink: bl, tilt: -sh, wave: sh });
} });

// ===================================================================================================
// s012 — "Let's see what one week does to you."  TITLE over the back garden at sunrise behind the apple tree: HERO on the back step (gloved hands
// in his hoodie pocket), PIP on his shoulder waving on "one". Title pops on "see", a gold '1 WEEK' chip on "week". A dew-glinting garden
// thread drifts across (between the washing-line post and the fence; NOT from the hero).
registerShot('s012', { draw(g, t, info) {
  const st = info.shot.start, tSee = sw('see', st, 0.41), tOne = sw('one', st, 0.69), tWeek = sw('week', st, 0.91);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [-320, -280], y: [-60, -80] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  layer(g, cam, 0.2, (g) => { glow(g, G.pos.treeX + 40, G.GY - 520, 700, '#ffcf80', 0.35); });
  const P = G.pos;
  layer(g, cam, 1, (g) => {
    silkLine(g, [G.CX + 620, P.lineY - 10], [G.CX + 900, G.GY - 330], { t, sag: 60, k: 1, w: 1.5 });
    const hp = idle({ ...POSES.stand, eF: [20, -130], hF: [16, -118], eB: [14, -128], hB: [10, -116] }, t, 2), o = { x: P.stepX + 40, y: P.stepTop + 4, s: 1.9, facing: 1 };
    actor(g, 'HERO', { ...o, pose: hp, expr: exprAt(t, [[0, 'smile'], [tWeek, 'smirk']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(1, -0.1), rim: SUN, t });
    const shx = o.x + hp.sh[0] * 1.9 - 10, shy = o.y + hp.sh[1] * 1.9 - 6;
    pip(g, shx, shy, 0.9, { t, wave: prog(t, tOne, tOne + 0.2) * (1 - prog(t, tOne + 1.4, tOne + 1.6)), look: [0.5, -0.2], blink: blinkAmt(t, 3, 3) });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
  titleText(g, t, tSee, ['WHAT IF YOU HAD', 'SPIDER POWERS?'], E.H * 0.27);
  chip(g, t, { str: '1 WEEK', at: tWeek, x: E.W / 2, y: E.H * 0.47, dur: info.dur });
} });
