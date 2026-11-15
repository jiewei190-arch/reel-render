// B_night.js — THE RULES #3 "The Alert", batch B (s013-s018, 29.30-42.90 s): taping cardboard over the window (THIS SIDE UP points down),
// the little brother falls asleep (the TV reflection shows an empty blanket), the lock screen at 4:00 (a warm rim on the door side),
// the light pours in under the front door (the shoes cast no shadows), "White and warm, like sunrise" (the light rises from the floor),
// the silence before the knock (the dust motes stop). Vertical 1080x1920; captions at y ~1330: key action above y 1270.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, poly, text, FONTS, rng, noise, shade, linGrad, radGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { HERO } from '../cast.js';
import { giantFace, faceAt, FACE } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { home4, home4Fg, outsideLight } from '../sets/home4.js';
import { alertPhone, tapeRoll, cardboard } from '../sets/rules3.js';
import { grain, vignette, coldGrade, breathe, motes } from '../sets/horror.js';

const WARM = '#ffd9a0', WARM2 = '#fff3d6';
const finish = (g, t, o = {}) => { coldGrade(g, o.cold ?? 0.45); vignette(g, o.vig ?? 0.82); breathe(g, t, o.breathe ?? 0.3); grain(g, t, 0.085); };
const CALM = { ...FACE.neutral, eye: 0.45, brow: 0.25, smile: 0.12, open: 0.18, w: 0.8 };

// s013 — "You tape cardboard over the windows."  panels go up on the words; tape torn from the roll; THIS SIDE UP arrows point at the floor
registerShot('s013', { draw(g, t, info) {
  const tTape = 0.37, tCard = 0.64, tOver = 1.13, tWin = 1.62, cam = camMove(t, info.dur, { z: [1.0, 1.05], y: [-60, -70], drift: 0.3 });
  const boarded = key(t, [[0, 0.1], [tCard, 0.35], [tOver, 0.6], [tWin, 0.85]], ease.out);
  const H = home4(g, t, cam, { view: 'window', glow: 0, boarded }), p = H.pos;
  layer(g, cam, 1, (g) => {
    // printed arrows on the nearest panel: THIS SIDE UP, pointing down
    g.save(); g.globalAlpha *= clamp(boarded * 2); g.translate(p.x + p.w * 0.32, p.y + p.h * 0.5); g.rotate(Math.PI); g.fillStyle = alpha('#3a2a1a', 0.75);
    for (const dx of [-36, 36]) poly(g, [[dx, -40], [dx - 22, -10], [dx - 8, -10], [dx - 8, 30], [dx + 8, 30], [dx + 8, -10], [dx + 22, -10]], alpha('#3a2a1a', 0.75));
    text(g, 'THIS SIDE UP', 0, 60, { size: 26, color: alpha('#3a2a1a', 0.8), font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
    const reach = t < tWin ? (Math.floor(t / 0.42) % 2 ? 'reach' : 'holdFront') : 'holdFront', o = { x: H.CX - 300, y: H.GY + 280, s: 2.6, facing: 1 };
    const pose = idle(poseAt(t, [[0, 'holdFront'], [tTape, 'reach'], [tCard + 0.1, 'holdFront'], [tOver, 'reach'], [tWin, { ...POSES.holdFront, head: [10, -200] }]], 0.18), t, 7);
    actor(g, 'HERO', { ...o, pose, t, rim: H.rim, expr: exprAt(t, [[0, 'determined'], [tWin, 'worried']]), blink: blinkFlag(t, 3.3, 7), look: lookToward(1, -0.4) });
    const hx = o.x + pose.hF[0] * o.s, hy = o.y + pose.hF[1] * o.s; tapeRoll(g, hx + 10, hy + 6, 0.42, { t, rot: 0.3, pull: (t * 2.4) % 1 });
  });
  home4Fg(g, t, cam, { view: 'window' });
  finish(g, t);
} });

// s014 — "Your little brother falls asleep on the couch."  every window boarded; HERO on the floor against the couch watching the door;
// his hand slips off the couch on 'asleep', she pulls the blanket over it on 'couch'; the black TV reflects the blanket with nothing under it
registerShot('s014', { draw(g, t, info) {
  const tLit = 0.41, tAsl = 1.44, tCouch = 2.17, cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-60, -50], y: [-40, -50], drift: 0.25 });
  const H = home4(g, t, cam, { view: 'living', glow: 0, creep: 0, boarded: 1 }), p = H.pos, GY = H.GY;
  layer(g, cam, 1, (g) => {
    // the TV (off): a black mirror on a low stand at the left wall, reflecting the couch: the blanket, flat, empty
    const tx = p.couchX - 560, ty = GY - 640; rr(g, tx - 10, ty - 10, 300, 200, 10); g.fillStyle = '#0c0d12'; g.fill(); rr(g, tx, ty, 280, 180, 6); g.fillStyle = '#020306'; g.fill();
    g.save(); g.beginPath(); g.rect(tx, ty, 280, 180); g.clip(); g.fillStyle = alpha('#3a4868', 0.35); g.beginPath(); g.moveTo(tx + 40, ty + 150); g.quadraticCurveTo(tx + 150, ty + 130, tx + 250, ty + 150); g.lineTo(tx + 250, ty + 165); g.lineTo(tx + 40, ty + 165); g.closePath(); g.fill(); g.fillStyle = alpha('#c8d8ff', 0.06); g.fillRect(tx + 20, ty + 10, 60, 160); g.restore();
    rr(g, tx + 40, ty + 190, 200, 450, 6); g.fillStyle = '#16171c'; g.fill();
    // his hand slips off the couch edge on 'asleep'; the blanket goes over it on 'couch'
    const slip = ease.inOut(prog(t, tAsl, tAsl + 0.4)), cover = ease.inOut(prog(t, tCouch, tCouch + 0.4)), ex = p.headX + 110, ey = p.couchTop + 70;
    if (slip > 0 && cover < 0.6) { seg(g, [[ex, ey], [ex + 16, ey + 70 * slip]], 14, '#1a1418'); circle(g, ex + 16, ey + 70 * slip + 6, 10, '#1a1418'); }
    if (cover > 0) { g.fillStyle = '#5a6880'; g.beginPath(); g.moveTo(ex - 40, ey - 10); g.quadraticCurveTo(ex + 20, ey + 10 + 50 * cover, ex + 60, ey - 10); g.closePath(); g.fill(); }
    // HERO on the floor against the couch, knees up, watching the door
    const reachOut = t > tCouch - 0.2 && t < tCouch + 0.6, pose = idle(reachOut ? { ...POSES.sit, hip: [0, -40], kF: [40, -90], fF: [70, 0], kB: [34, -86], fB: [62, 0], eB: [-20, -120], hB: [-50, -150], head: [4, -150], sh: [0, -116] } : { ...POSES.sit, hip: [0, -40], kF: [40, -90], fF: [70, 0], kB: [34, -86], fB: [62, 0], eF: [30, -90], hF: [44, -80], head: [6, -150], sh: [0, -116] }, t, 7);
    actor(g, 'HERO', { x: p.couchX + 40, y: GY + 120, s: 1.7, facing: 1, pose, t, rim: H.rim, expr: exprAt(t, [[0, 'sleepy'], [tCouch, 'worried']]), blink: blinkFlag(t, 3.3, 7), look: reachOut ? lookToward(-1, -0.4) : lookToward(1, -0.1) });
  });
  home4Fg(g, t, cam, { view: 'living' });
  finish(g, t, { breathe: 0.35 });
} });

// s015 — "Four a.m."  the alert phone on the coffee table lights up by itself: 3:59 -> 4:00 on 'Four'; then a faint warm rim on its door-side edge
registerShot('s015', { draw(g, t, info) {
  const tFour = 0.15, z = lerp(1.03, 1.07, ease.inOut(t / info.dur));
  blurLayer(g, 10, (g) => home4(g, t, { z: 1.6, x: -40, y: 160 }, { view: 'living', glow: 0, boarded: 1 }), null, 1); veil(g, '#02040a', 0.4);
  g.save(); g.translate(E.W / 2, 760); g.scale(z, z); g.translate(-E.W / 2, -760);
  rr(g, -100, 1140, E.W + 200, 600, 20); g.fillStyle = '#2a2420'; g.fill(); g.fillStyle = '#3a3028'; g.fillRect(-100, 1140, E.W + 200, 10);   // coffee table top
  const on = ease.out(prog(t, 0, 0.12));
  g.save(); g.globalAlpha *= 0.25 + 0.75 * on; alertPhone(g, 540, 700, 1.15, { t, rules: 3, buzz: 0, at: -5, time: t < tFour ? '3:59' : '4:00', glow: on }); g.restore();
  const clk = t < tFour ? '3:59' : '4:00', pop = t >= tFour ? 1 + 0.06 * Math.exp(-(t - tFour) * 10) : 1; g.save(); g.translate(540, 150); g.scale(pop, pop); text(g, clk, 0, 0, { size: 150, color: alpha('#f4f6ff', 0.25 + 0.7 * on), font: FONTS.ui, weight: 800, glow: 18, glowColor: 'rgba(200,220,255,.35)' }); g.restore();
  const rim = ease.out(prog(t, tFour, tFour + 0.8)); if (rim > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 540 + 230, 0, 540 + 150, 0, [alpha(WARM, 0.5 * rim), alpha(WARM, 0)]); g.fillRect(540 + 120, 700 - 420, 120, 840); g.restore(); }
  g.restore();
  finish(g, t);
} });

// s016 — "Light pours in under the front door."  the gap ignites on 'Light', the glow spills across the floor on 'pours'; motes turn gold; the keyhole glows;
// the light pools round the shoes on the rack - and they cast no shadows
registerShot('s016', { draw(g, t, info) {
  const tL = 0.15, tP = 0.42, cam = camMove(t, info.dur, { z: [1.0, 1.07], y: [40, 60], drift: 0.25 });
  const under = ease.out(prog(t, tL, tL + 0.3)), creep = lerp(0, 0.25, ease.out(prog(t, tP, info.dur)));
  const H = home4(g, t, cam, { view: 'door', glow: under, creep, boarded: 1 }), p = H.pos;
  layer(g, cam, 1, (g) => {
    const rx = p.doorX - p.doorW / 2 - 260, fy = p.floorY;                                      // shoe rack at the left of the door
    g.fillStyle = '#2a2220'; g.fillRect(rx - 10, fy - 150, 240, 12); g.fillRect(rx - 10, fy - 70, 240, 12); g.fillRect(rx - 10, fy - 150, 12, 150); g.fillRect(rx + 218, fy - 150, 12, 150);
    const shoes = [['#c84a3a', 0, -150], ['#e8e4dc', 110, -150], ['#3a5a8a', 20, -70], ['#7a2630', 120, -70]];
    for (const [c, dx, dy] of shoes) { g.fillStyle = c; g.beginPath(); g.ellipse(rx + dx + 50, fy + dy - 16, 46, 18, 0, Math.PI, 0); g.fill(); g.fillStyle = '#e8e4dc'; g.fillRect(rx + dx + 4, fy + dy - 6, 92, 6); }
    if (under > 0) { g.save(); g.globalCompositeOperation = 'lighter'; for (const [c, dx, dy] of shoes) glow(g, rx + dx + 50, fy + dy - 10, 90, WARM, 0.18 * under * (dy > -100 ? 1 : 0.4)); g.restore();
      glow(g, p.knobX, p.knobY + 6, 40, WARM2, 0.6 * under); circle(g, p.knobX, p.knobY + 26, 4, alpha(WARM2, under)); }
    motes(g, t, { x: p.doorX - 300, y: fy - 260, w: 600, h: 300, count: Math.round(30 * under), color: WARM });
  });
  home4Fg(g, t, cam, { view: 'door' });
  finish(g, t, { cold: 0.4 });
} });

// s017 — GIANT FACE: "White and warm, like sunrise."  warm floor light rises over her face from BELOW; on 'warm' her face softens (the light pulls);
// on 'sunrise' her eyes snap open; blades of light through the cardboard gaps cross the wall behind her with dust in them
registerShot('s017', { draw(g, t, info) {
  const tWarm = 0.71, tSun = 1.27, z = lerp(1.0, 1.07, ease.inOut(t / info.dur));
  blurLayer(g, 12, (g) => home4(g, t, { z: 1.5, x: -120, y: -60 }, { view: 'living', glow: 1, creep: 0.4, boarded: 1 }), null, 1); veil(g, '#02040a', 0.4);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const x0 = 80 + i * 230; g.fillStyle = alpha(WARM2, 0.07); g.beginPath(); g.moveTo(x0, 80); g.lineTo(x0 + 40, 80); g.lineTo(x0 + 420, 1200); g.lineTo(x0 + 340, 1200); g.closePath(); g.fill(); } g.restore();
  motes(g, t, { x: 60, y: 120, w: 960, h: 1000, count: 40, color: WARM });
  const rise = ease.inOut(prog(t, 0, info.dur)), f = faceAt(t, [[0, 'worried'], [tWarm, CALM], [tSun, { ...FACE.shocked, open: 0.3 }]], 0.25);
  g.save(); g.translate(450, 740); g.scale(z, z); g.translate(-450, -740);
  giantFace(g, 450, 740, 330, { who: 'HERO', f, rimSide: 1, rimColor: WARM, glint: WARM2, blink: t > tSun ? 0 : blinkAmt(t, 3.3, 7), breath: Math.sin(t * 1.3) });
  // the light climbing the face from below, like a sunrise from the floor
  g.save(); g.beginPath(); g.arc(450, 740, 330, 0, 7); g.clip(); g.globalCompositeOperation = 'lighter'; const ly = lerp(740 + 330, 740 - 120, rise);
  g.fillStyle = linGrad(g, 0, ly - 160, 0, 740 + 330, [alpha(WARM, 0), alpha(WARM, 0.22), alpha(WARM2, 0.32)]); g.fillRect(100, ly - 160, 700, 740 + 330 - ly + 160); g.restore();
  g.restore();
  finish(g, t, { cold: 0.35 });
} });

// s018 — "Then a knock."  the silence: the glow under the door has crept a third of the way to the couch; HERO between, back to us;
// her shoulders lift on 'knock'; the dust motes in the light stop and hang in the air
registerShot('s018', { draw(g, t, info) {
  const tK = 0.55, cam = camMove(t, info.dur, { z: [1.02, 1.04], y: [-40, -42], drift: 0.15 });
  const H = home4(g, t, cam, { view: 'living', glow: 1, creep: 0.45, boarded: 1 }), p = H.pos, GY = H.GY;
  layer(g, cam, 1, (g) => {
    const lift = ease.out(prog(t, tK, tK + 0.2)) * 10, base = { ...POSES.stand, eB: [-8, -136], hB: [-10, -104] }, pose = { ...base, sh: [base.sh[0], base.sh[1] - lift], head: [base.head[0], base.head[1] - lift * 0.6], eF: [base.eF[0], base.eF[1] - lift], eB: [base.eB[0], base.eB[1] - lift] };
    actor(g, 'HERO', { x: p.youX - 60, y: GY + 200, s: 2.2, facing: 1, pose, t, rim: H.warmRim, expr: exprAt(t, [[0, 'worried'], [tK, 'scared']]), blink: false, look: lookToward(1, 0.3) });
    motes(g, 0.3, { x: p.doorX - 380, y: GY - 120, w: 520, h: 220, count: 30, color: WARM });     // frozen: the same instant every frame
  });
  home4Fg(g, t, cam, { view: 'living' });
  finish(g, t, { breathe: 0.25 });
} });
