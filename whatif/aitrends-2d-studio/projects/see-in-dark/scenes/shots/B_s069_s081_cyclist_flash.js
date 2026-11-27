// B_s069_s081_cyclist_flash.js — batch B: RULE 4 (light is now your enemy): the ghost cyclist, the lamp, the white-out, a minute blind, home, the rule recap.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, shade, mix, rng, talkAmount } from '/engine/core.js';
import { headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { street, streetFg, streetGround } from '../sets/street.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { forest, forestFg } from '../sets/forest.js';
import { thermalView, heatActor, heatBlob, heatRect, heat, whiteOut, PALETTE } from '../sets/thermal.js';
import { chip, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, talkGesture, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { W, handWorld, scr, punch, cyclist, devBeanie } from './B_lib.js';

const CX = E.W / 2, roadY = () => streetGround() + 140;
const RIDER = { top: 'jersey', color: '#3aa05a', legs: '#223a30', head: 'cap', headColor: '#e0e0d0' };   // background rider: green jersey (not a cast colour)
const sleeve = (g, a, b) => seg(g, [a, b], 7, '#3c4058');                                                 // a grabbed sleeve, stretched between two hands

// s069 — "Rule four: light is now your enemy."  RULE 4 over the midnight street drawn dim, one sodium lamp flaring behind the banner
registerShot('s069', { draw(g, t, info) {
  const tL = W('light', info, 1.11), cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-40, 20] });
  ruleCard(g, t, info, { n: 4, title: 'LIGHT IS THE ENEMY', accent: '#ffd47e', bg: (g, t) => {
    street(g, t, cam, { power: 0.08 });
    const f = ease.out(prog(t, tL - 0.2, tL + 0.1)) * (0.88 + 0.12 * Math.sin(t * 13)), [lx, ly] = scr(cam, CX - 150 + 34, streetGround() - 330);
    if (f > 0) { glow(g, lx, ly, 560 * f, '#ffd59a', 0.5 * f); FX.lensStreak(g, lx, ly, E.W * 1.5, '#ffe6cc', 0.45 * f, 4); circle(g, lx, ly, 14 * f, '#fff6dc'); FX.godRays(g, lx, ly, { count: 6, angle: Math.PI / 2, spread: 0.5, len: 900, color: '#ffd59a', a: 0.08 * f, t }); }
    streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffe6b0' });
  } });
} });

// s070 — "You step off the kerb at midnight, and a cyclist with no lamp"  two-shot stepping off the kerb; an unlit cyclist rushes in, barely visible
registerShot('s070', { draw(g, t, info) {
  const tStep = W('step', info, 0.35), tMid = W('midnight', info, 1.35), tCyc = W('cyclist', info, 2.31), tNo = W('no', info, 3.07), GY = streetGround(), RY = roadY();
  const cam = camMove(t, info.dur, { z: [1.3, 1.38], x: [-60, -10], y: [140, 130] });
  const A = street(g, t, cam, { power: 0.15 });
  const step = ease.inOut(prog(t, tStep, tStep + 0.7)), hx = CX - 80 + 90 * step, dx = hx - 260;
  const heroPose = step > 0 && step < 1 ? walkAlong(hx, 1.9).pose : idle(poseAt(t, [[0, 'relaxed'], [tCyc + 0.3, reaction('lookUp', t, tCyc + 0.3, 'relaxed')]], 0.3), t, 1);
  const devPose = step > 0 && step < 1 ? walkAlong(dx, 1.9).pose : idle(poseAt(t, [[0, 'explain'], [tMid, 'shrug'], [tCyc, 'explain']], 0.35), t, 4);
  const bx = lerp(CX - 1500, CX - 420, ease.out(prog(t, tCyc - 0.1, info.dur)));
  layer(g, cam, 1, (g) => {
    if (t > tCyc - 0.1) { g.save(); g.globalAlpha *= 0.55; cyclist(g, bx, RY + 40, 1.6, t, { facing: 1, draw: (o) => actor(g, RIDER, { ...o, t, rim: { color: '#6a7aaa' }, expr: 'neutral' }) }); g.restore(); }
    actor(g, 'DEV', { x: dx, y: GY + 40 + 80 * step, s: 1.9, facing: 1, pose: devPose, t, rim: A.rim, expr: exprAt(t, [[0, 'happy'], [tMid, 'smile']]), blink: blinkFlag(t, 2.9, 2), look: lookToward(1, 0) });
    actor(g, 'HERO', { x: hx, y: GY + 40 + 80 * step, s: 1.9, facing: -1, pose: heroPose, t, rim: A.rim, expr: exprAt(t, [[0, 'smile'], [tCyc + 0.2, 'surprised']]), blink: blinkFlag(t, 3.4, 5), look: t > tCyc + 0.1 ? lookToward(-1, 0.2) : lookToward(-1, 0) });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#c9d4ff' });
  if (t > tNo) chip(g, t, { str: 'No lamp', at: tNo, x: E.W * 0.22, y: E.H * 0.2, tone: 'coral', dur: info.dur - 0.06 });
} });

// s071 — "glows like a ghost. You yank Dev back."  THERMAL: the cyclist streaks past as a white-orange ghost; HERO yanks Dev back by the sleeve
registerShot('s071', { draw(g, t, info) {
  const tGh = W('ghost', info, 0.85), tYank = W('yank', info, 1.83), GY = streetGround(), RY = roadY();
  const cam = camMove(t, info.dur, { z: [1.25, 1.32], x: [-40, 30], y: [140, 130] });
  const bx = lerp(CX - 1300, CX + 1500, ease.inOut(prog(t, 0, info.dur * 0.95))), yk = ease.out(prog(t, tYank, tYank + 0.3));
  const hero = { x: CX - 520, y: GY + 60, s: 1.9, facing: 1 }, dev = { x: CX - 220 - 150 * yk, y: GY + 110 - 40 * yk, s: 1.9, facing: 1 };
  const heroPose = idle(poseAt(t, [[0, 'stand'], [tYank - 0.2, 'reach'], [tYank + 0.4, 'ready']], 0.22), t, 2), devPose = t < tYank ? walkAlong(dev.x, 1.9).pose : reaction('shock', t, tYank);
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      for (let i = 1; i < 7; i++) heatBlob(c, bx - 40 - i * 90, RY - 150, 120, 150, 0.09 * (7 - i), 0.95);   // ghostly heat smear behind him
      cyclist(c, bx, RY + 40, 1.6, t, { flat: true, frame: heat(0.2), tyre: heat(0.05), hubs: heat(0.62), draw: (o) => heatActor(c, RIDER, { ...o, t, heat: 0.9 }) });
      heatActor(c, 'DEV', { ...dev, pose: devPose, rot: -0.15 * yk * (1 - prog(t, tYank + 0.6, tYank + 1.2)), t, expr: exprAt(t, [[0, 'neutral'], [tYank, 'shocked']]) });
      heatActor(c, 'HERO', { ...hero, pose: heroPose, t, expr: exprAt(t, [[0, 'surprised'], [tYank, 'determined']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.2) });
      if (t > tYank - 0.15 && t < tYank + 0.6) c.save(), (() => { seg(c, [handWorld(hero, heroPose), [dev.x - 10, dev.y - 150 * 1.9]], 12, heat(0.55)); })(), c.restore();
    }),
    hud: { label: 'THERMAL', temp: t > tGh - 0.3 ? '35 C  CYCLIST' : null, track: scr(cam, bx + 20, RY - 260) },
  });
  if (t > tYank && t < tYank + 0.4) FX.speedLines(g, t, { cx: scr(cam, dev.x, dev.y - 200)[0], cy: scr(cam, dev.x, dev.y - 200)[1], count: 26, a: 0.25, inner: 160 });
} });

// s072 — '"How did you SEE that?" Dev asks.'  GIANT FACE Dev, shocked, cold street rim; punch-in on SEE
registerShot('s072', { draw(g, t, info) {
  const tSee = W('SEE', info, 0.53), pk = punch(t, tSee, 0.08, 0.45), cam = camMove(t, info.dur, { z: [1.0, 1.06] }); cam.z += 0.06 * pk; { const sk = shake(t * 4, 12 * pk, 5, 6); cam.x += sk[0]; cam.y += sk[1]; }
  blurLayer(g, 16, (c) => street(c, t, { z: 2.0, x: 260, y: -60 }, { power: 0.1 }), null, 1); veil(g, '#05060f', 0.42);
  const f = faceAt(t, [[0, 'shocked'], [tSee + 0.2, 'worried'], [1.3, 'suspicious']], 0.14), talk = talkAmount(info.globalT, info.shot.start, info.shot.start + 1.25);
  layer(g, cam, 1, (g) => { const cx = E.W * 0.55, cy = E.H * 0.58, r = 320;
    giantFace(g, cx, cy, r, { who: 'DEV', f: { ...f, open: Math.max(f.open * 0.5, talk * 0.95) }, rimSide: 1, rimColor: '#9fb6ff', blink: blinkAmt(t, 3.1, 4), breath: Math.sin(t * 3), tilt: -0.04 * Math.sin(t * 1.6) });
    devBeanie(g, cx, cy, r, { tilt: -0.04 * Math.sin(t * 1.6) }); });
  atmos(g, t, cam, { color: '#9fb6ff' });
} });

// s073 — "And right then, the cyclist's lamp snaps on."  street medium: the cyclist up the road turns; his lamp snaps on straight at camera
registerShot('s073', { draw(g, t, info) {
  const tSnap = W('snaps', info, 2.05), on = t > tSnap, k = ease.out(prog(t, tSnap, tSnap + 0.1)), GY = streetGround(), RY = roadY();
  const cam = camMove(t, info.dur, { z: [1.22, 1.3], x: [120, 160], y: [100, 92] }); if (on) { const sk = shake(t * 5, 8 * punch(t, tSnap, 0.06, 0.5), 5, 2); cam.x += sk[0]; cam.y += sk[1]; }
  const A = street(g, t, cam, { power: 0.12 });
  const bxw = CX + 820, turn = ease.inOut(prog(t, 0.4, 1.4));
  let lamp = null;
  layer(g, cam, 1, (g) => {
    lamp = cyclist(g, bxw, RY + 20, 1.25, 0.3, { facing: turn > 0.5 ? -1 : 1, draw: (o) => actor(g, RIDER, { ...o, t, rim: on ? { color: '#fff6dc', dir: [0.8, -0.3] } : A.rim, expr: 'neutral' }) });
    const look = on ? lookToward(1, -0.1) : lookToward(1, 0);
    actor(g, 'DEV', { x: CX - 120, y: GY + 60, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'relaxed'], [tSnap, reaction('shock', t, tSnap, 'relaxed')]], 0.2), t, 2), t, rim: on ? { color: '#fff6dc', dir: [1, -0.2] } : A.rim, expr: exprAt(t, [[0, 'neutral'], [tSnap, 'shocked']]), blink: blinkFlag(t, 3.0, 3), look });
    actor(g, 'HERO', { x: CX - 400, y: GY + 60, s: 1.95, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tSnap, reaction('wince', t, tSnap)]], 0.2), t, 6), t, rim: on ? { color: '#fff6dc', dir: [1, -0.2] } : A.rim, expr: exprAt(t, [[0, 'neutral'], [tSnap, 'shocked']]), blink: on && t < tSnap + 0.6, look });
    if (on) { FX.lightCone(g, lamp[0], lamp[1], { angle: Math.PI + 0.08, spread: 0.32, len: 1700, color: '#fff6dc', a: 0.32 * k }); glow(g, lamp[0], lamp[1], 160, '#ffffff', 0.9 * k); }
  });
  if (on) { const [lx, ly] = scr(cam, lamp[0], lamp[1]); glow(g, lx, ly, E.W * 0.6 * k, '#fff6dc', 0.5 * k); FX.lensStreak(g, lx, ly, E.W * 1.6, '#fff1d0', 0.6 * k, 5); if (t < tSnap + 0.1) veil(g, '#ffffff', 0.35); }
  streetFg(g, t, cam); atmos(g, t, cam, { color: on ? '#fff6dc' : '#c9d4ff' });
} });

// s074 — "One bright flash, your thermal view whites out,"  THERMAL whites out on "flash"; HUD glitches and the palette bar burns out on "whites out"
registerShot('s074', { draw(g, t, info) {
  const tFl = W('flash', info, 0.71), tWh = W('whites', info, 2.27), GY = streetGround(), RY = roadY();
  const cam = camMove(t, info.dur, { z: [1.24, 1.3], x: [200, 230], y: [100, 96] });
  const wo = Math.max(ease.inOut(prog(t, tFl - 0.4, tFl + 0.05)) * 0.75, ease.in(prog(t, tWh - 0.3, tWh + 0.25))), glitch = t > tFl && Math.floor(t * 17) % 3 === 0, burnt = t > tWh;
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => { cyclist(c, CX + 820, RY + 20, 1.25, 0.3, { facing: -1, flat: true, frame: heat(0.2), tyre: heat(0.05), draw: (o) => heatActor(c, RIDER, { ...o, t: 0.3, heat: 0.88 }) });
      heatBlob(c, CX + 900, RY - 170, 300 * (0.4 + wo), 260 * (0.4 + wo), clamp(0.55 + wo), 0.6); }),
    hud: { label: glitch ? 'TH3RM#L' : 'THERMAL', temp: t > tFl ? (glitch ? '### C' : 'SENSOR OVERLOAD') : '35 C', scale: !burnt, track: scr(cam, CX + 900, RY - 170) },
    noise: 0.03 + 0.25 * wo,
  });
  whiteOut(g, wo, { x: scr(cam, CX + 900, RY - 170)[0], y: scr(cam, CX + 900, RY - 170)[1] });
  if (glitch) { const R = rng(Math.floor(t * 17)); for (let i = 0; i < 7; i++) { g.fillStyle = alpha(R() > 0.5 ? '#ff3b7a' : '#ffe048', 0.25 + 0.3 * R()); g.fillRect((R() - 0.5) * 80, R() * E.H, E.W, 4 + R() * 22); } }
  if (burnt) { const bk = ease.out(prog(t, tWh, tWh + 0.4)), x = E.W - 110, y0 = E.H * 0.3, y1 = E.H * 0.7; g.save(); g.fillStyle = alpha('#2a2020', 0.8 * bk); g.fillRect(x, y0, 16, y1 - y0); seg(g, [[x - 6, y0 + 40], [x + 22, y0 + 90]], 3, alpha('#000', bk)); g.restore(); }
  if (t > tWh + 0.3) { g.save(); g.globalAlpha = 0.18; heatActor(g, 'HERO', { x: CX - 300, y: GY + 60, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'wince']]), t, 1), t, heat: 0.3, halo: false }); g.restore(); }   // a faint silhouette in the glare
} });

// s075 — "and your old eyes aren't ready either. Total blindness."  GIANT FACE in white glare: shocked -> squeezed shut, hand shielding, fade to white-grey
registerShot('s075', { draw(g, t, info) {
  const tOld = W('old', info, 0.43), tReady = W('ready', info, 1.15), tTot = W('Total', info, 2.47), cam = camMove(t, info.dur, { z: [1.02, 1.1] }); { const sk = shake(t * 2, 5, 1.4, 8); cam.x += sk[0]; cam.y += sk[1]; }
  blurLayer(g, 16, (c) => street(c, t, { z: 2.0, x: -200, y: -60 }, { power: 0.2 }), null, 1); veil(g, '#05060f', 0.25);
  glow(g, E.W * 0.9, E.H * 0.3, 1100, '#fff6dc', 0.5);
  const f = faceAt(t, [[0, 'shocked'], [tOld + 0.2, 'worried'], [tReady, { eye: 0.12, brow: -0.3, tilt: -0.6, smile: -0.6, w: 0.9, sweat: 0.8 }]], 0.14);
  layer(g, cam, 1, (g) => { const cx = E.W * 0.46, cy = E.H * 0.6;
    giantFace(g, cx, cy, 320, { who: 'HERO', f, rimSide: 1, rimColor: '#fff6dc', blink: t > tReady ? 1 : blinkAmt(t, 3.2, 2), breath: Math.sin(t * 3), tilt: -0.05 });
  });
  const hk = ease.out(prog(t, tReady - 0.2, tReady + 0.3)); if (hk > 0) blurLayer(g, 10, (c) => { c.save(); c.translate(lerp(E.W * 1.1, E.W * 0.72, hk), E.H * 0.42); c.rotate(-0.5); rr(c, -120, -60, 240, 380, 100); c.fillStyle = S().ink; c.fill(); for (let i = 0; i < 4; i++) { rr(c, -110 + i * 56, -200, 50, 170, 25); c.fill(); } c.restore(); }, null, 1);   // hand shielding the eyes
  const fade = ease.inOut(prog(t, tTot - 0.2, info.dur)); veil(g, '#e8e6ea', 0.85 * fade);
  whiteOut(g, 0.25 * (1 - fade) + 0.2 * fade, { x: E.W * 0.85, y: E.H * 0.3 });
  if (t > tTot) text(g, 'TOTAL BLINDNESS', E.W / 2, E.H * 0.2, { size: 64, color: '#8a8690', font: FONTS.title, weight: 700, alpha: ease.out(prog(t, tTot, tTot + 0.4)), spacing: 6 });
} });

// s076 — "Bright light floods your rods, which normally need twenty to thirty minutes to recover."  BLUEPRINT: rods flood; 20-30 minutes; RECOVERY
registerShot('s076', { draw(g, t, info) {
  const ui = S().ui, tFl = W('floods', info, 0.61), tTw = W('twenty', info, 2.45), tRec = W('recover', info, 3.57), z = 1 + 0.03 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'BLEACHED RODS', fig: 'FIG 10 - DARK ADAPTATION' });
  const flood = ease.out(prog(t, tFl - 0.1, tFl + 0.5)) * (1 - 0.5 * ease.inOut(prog(t, tTw, info.dur)));
  BP.retina(g, t, { x: E.W / 2, y: E.H * 0.44, w: 1000, h: 440, rods: true, cones: false, flood });
  if (flood > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W / 2, E.H * 0.36, 560, '#ffffff', 0.25 * flood); g.restore(); for (let i = 0; i < 7; i++) { const ph = (t * 1.3 + i / 7) % 1; seg(g, [[E.W * (0.3 + i * 0.07), E.H * 0.1 + ph * 120], [E.W * (0.3 + i * 0.07), E.H * 0.1 + ph * 120 + 60]], 6, alpha('#fff6dc', 0.7 * (1 - ph) * flood)); } }
  const bk = ease.out(prog(t, tTw - 0.2, tTw + 0.2)); if (bk > 0) { const x = E.W * 0.2, y = E.H * 0.8, w = E.W * 0.6; g.save(); g.globalAlpha *= bk; rr(g, x, y, w, 34, 17); g.strokeStyle = ui.blueprint; g.lineWidth = 3; g.stroke();
    const p = 0.04 + 0.2 * ease.inOut(prog(t, tTw, info.dur)); rr(g, x + 4, y + 4, (w - 8) * p, 26, 13); g.fillStyle = ui.gold; g.fill(); glow(g, x + (w - 8) * p, y + 17, 50, ui.gold, 0.6); text(g, 'RECOVERY', x, y - 28, { size: 28, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 4 }); g.restore(); }
  BP.label(g, t, { at: [E.W / 2 - 220, E.H * 0.3], to: [E.W / 2 - 440, E.H * 0.16], str: 'RODS FLOODED', start: tFl + 0.2 });
  g.restore();
  chip(g, t, { str: '20-30 minutes', at: tTw, x: E.W * 0.75, y: E.H * 0.7, dur: info.dur - 0.1 });
} });

// s077 — "Your new sight takes about a minute, a long, shaky minute,"  THERMAL rebooting: smeared, wobbling, contrast returning; RECALIBRATING
registerShot('s077', { draw(g, t, info) {
  const tMin = W('minute', info, 1.39), tShk = W('shaky', info, 2.15), GY = streetGround();
  const back = ease.inOut(prog(t, 0, info.dur)), wob = 1 + prog(t, tShk - 0.3, tShk + 0.3);
  const cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [-200, -160], y: [120, 112] }); cam.x += Math.sin(t * 3.1) * 14 * wob; cam.y += Math.cos(t * 2.3) * 9 * wob; cam.r = Math.sin(t * 1.9) * 0.012 * wob;
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => { heatActor(c, 'DEV', { x: CX - 120, y: GY + 60, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'reach']]), t, 2), t }); heatActor(c, 'HERO', { x: CX - 440, y: GY + 60, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'handsUp']]), t, 4), t, expr: 'worried' }); }),
    halo: lerp(60, 16, back), noise: lerp(0.3, 0.04, back), coldGain: lerp(1.6, 0.55, back),
    hud: { label: Math.floor(t * 2) % 2 ? 'RECALIBRATING' : 'RECALIBRATING...', temp: null },
  });
  whiteOut(g, 0.6 * (1 - back) ** 1.5);
  const sk = ease.outBack(prog(t, tMin - 0.1, tMin + 0.3)); if (sk > 0) { const p = clamp((t - tMin) / 2.0); g.save(); g.translate(E.W * 0.82, E.H * 0.28); g.scale(sk, sk); circle(g, 0, 0, 104, alpha('#0b1324', 0.85)); ring(g, 0, 0, 90, 6, alpha('#9fb6ff', 0.4)); g.strokeStyle = S().ui.gold; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 90, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.05 + 0.25 * p)); g.stroke(); text(g, '~1 min', 0, 4, { size: 36, color: S().ui.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
  chip(g, t, { str: 'About 1 minute', at: tMin, x: E.W / 2, y: E.H * 0.88, dur: info.dur - 0.08 });
} });

// s078 — "with Dev leading you home by the sleeve."  two-shot walk: Dev leads (patient-smug), Hero eyes shut, free arm groping
registerShot('s078', { draw(g, t, info) {
  const tLead = W('leading', info, 0.59), tSlv = W('sleeve', info, 1.53), GY = streetGround(), SP = 150;
  const dx = CX - 60 + SP * t, hx = dx - 270;
  const cam = camMove(t, info.dur, { z: [1.3, 1.36], y: [130, 124] }); cam.x = (dx + hx) / 2 - CX + 40;
  const A = street(g, t, cam, { power: 0.15 });
  const devW = walkAlong(dx, 1.9), heroW = walkAlong(hx, 1.9), hp = { ...heroW.pose }; hp.hB = [-30, -190 + Math.sin(t * 3) * 10]; hp.eB = [-20, -160]; hp.hF = [44, -136]; hp.eF = [26, -150];
  const dp = { ...devW.pose }; dp.hB = [-40, -128]; dp.eB = [-24, -146];
  const dev = { x: dx, y: GY + 60, s: 1.9, facing: 1 }, hero = { x: hx, y: GY + 60, s: 1.9, facing: 1 };
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...hero, pose: hp, t, rim: A.rim, expr: 'worried', blink: true });
    sleeve(g, handWorld(hero, hp, 'hF'), handWorld(dev, dp, 'hB'));
    actor(g, 'DEV', { ...dev, pose: dp, t, rim: A.rim, expr: exprAt(t, [[0, 'smile'], [tSlv, 'smirk']]), blink: blinkFlag(t, 2.9, 3), look: lookToward(-1, 0.1) });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#c9d4ff' });
} });

// s079 — "It's amazing and awful, usually both at once."  sofa, warm lamp on: ice pack over his eyes, Biscuit on his lap; delighted -> wince -> lopsided smirk
registerShot('s079', { draw(g, t, info) {
  const tAm = W('amazing', info, 0.41), tAw = W('awful', info, 0.89), tBoth = W('both', info, 1.95), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.5, 1.58], x: [-130, -110], y: [150, 142] });
  const A = apartment(g, t, cam, { power: 1 });
  const hero = { x: A.pos.sofaX - 20, y: GY - 34, s: 1.9, facing: 1 }, pose = idle(poseAt(t, [[0, 'sitBack'], [tAw, 'sit'], [tBoth, 'sitBack']], 0.3), t, 2);
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...hero, pose, t, rim: A.rim, expr: exprAt(t, [[0, 'happy'], [tAw, 'sad'], [tBoth, 'smirk']]), look: [0.4, -0.2] });
    const [hx, hy, hr] = headPos({ ...hero, pose }); g.save(); g.translate(hx + hr * 0.3, hy - hr * 0.12); g.rotate(-0.12 + 0.05 * Math.sin(t * 2)); rr(g, -hr * 0.9, -hr * 0.36, hr * 1.8, hr * 0.62, hr * 0.28); g.fillStyle = '#8fd0ff'; g.fill(); g.strokeStyle = '#d8f0ff'; g.lineWidth = 3; g.stroke(); circle(g, -hr * 0.4, -hr * 0.12, hr * 0.1, alpha('#fff', 0.7)); g.restore();   // the ice pack
    cat(g, { x: hero.x + 60, y: GY - 34 - 72 * 1.9 + 10, s: 1.8, facing: 1, pose: 'loaf', t, eyes: t > tBoth ? 'offended' : 'auto', rim: A.rim });
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
} });

// s080 — "So remember: dark is your friend,"  BLUEPRINT: a crescent moon draws on; gold label DARK = FRIEND
registerShot('s080', { draw(g, t, info) {
  const ui = S().ui, tDark = W('dark', info, 1.35), tFr = W('friend', info, 1.77), z = 1 + 0.04 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'REMEMBER', fig: 'FIG 11 - THE RULE' });
  const mx = E.W / 2, my = E.H * 0.46, r = 230, k = ease.out(prog(t, 0.1, 1.4));
  // crescent: outer arc of a circle, inner arc of an offset circle, meeting at the horns
  const off = r * 0.55, ha = Math.acos(off / (2 * r)), outer = Array.from({ length: 60 }, (_, i) => { const a = lerp(Math.PI - ha + Math.PI * 2, ha + Math.PI, i / 59) ; return [mx + Math.cos(a) * r, my + Math.sin(a) * r]; });
  const inner = Array.from({ length: 60 }, (_, i) => { const p0 = outer[59], p1 = outer[0], u = i / 59, a0 = Math.atan2(p0[1] - my, p0[0] - mx - off), a1 = Math.atan2(p1[1] - my, p1[0] - mx - off) + (Math.atan2(p1[1] - my, p1[0] - mx - off) < a0 ? Math.PI * 2 : 0); const a = lerp(a0, a1, u); return [mx + off + Math.cos(a) * r, my + Math.sin(a) * r]; });
  if (k > 0.6) { g.save(); g.globalAlpha *= (k - 0.6) / 0.4; g.beginPath(); [...outer, ...inner].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = alpha(ui.cream, 0.18); g.fill(); g.restore(); }
  BP.draw(g, [...outer, ...inner], k, { w: 6, color: ui.cream, close: true });
  if (k > 0.95) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, mx - 60, my, 320, '#c8d8ff', 0.18); g.restore(); }
  for (let i = 0; i < 9; i++) { const sx = E.W * (0.2 + (i * 0.37) % 0.6), sy = E.H * (0.18 + (i * 0.23) % 0.5); FX.sparkle(g, sx, sy, (10 + (i % 3) * 5) * ease.out(prog(t, 0.4 + i * 0.08, 0.8 + i * 0.08)) * (0.8 + 0.2 * Math.sin(t * 3 + i)), '#e8f0ff', 0.7); }
  g.restore();
  const lk = ease.outBack(prog(t, tFr - 0.1, tFr + 0.3)); if (lk > 0) { g.save(); g.translate(E.W / 2, E.H * 0.82); g.scale(lk, lk); text(g, 'DARK = FRIEND', 0, 0, { size: 88, color: ui.gold, font: FONTS.title, weight: 700, glow: 26, glowColor: alpha(ui.gold, 0.6), stroke: 10, strokeColor: 'rgba(0,0,0,.55)' }); g.restore(); }
  else if (t > tDark) text(g, 'DARK', E.W / 2, E.H * 0.82, { size: 88, color: ui.gold, font: FONTS.title, weight: 700, alpha: ease.out(prog(t, tDark, tDark + 0.25)), stroke: 10, strokeColor: 'rgba(0,0,0,.55)' });
} });

// s081 — "light is a punch. You're about to need that."  a torch beam punches into the lens, LIGHT = PUNCH; hard cut to the rainy dark forest, thunder
registerShot('s081', { draw(g, t, info) {
  const tPun = W('punch', info, 0.53), tNeed = W('need', info, 1.67), cut = t > tNeed - 0.12;
  if (!cut) {
    const cam = camMove(t, info.dur, { z: [1.1, 1.2] }), pk = punch(t, tPun - 0.05, 0.06, 0.4);
    g.fillStyle = '#05060f'; g.fillRect(0, 0, E.W, E.H); FX.stars(g, t, { count: 40, area: [0, 0, E.W, E.H * 0.5] });
    const reach = ease.in(prog(t, 0, tPun)); FX.lightCone(g, -100, E.H * 0.7, { angle: lerp(-0.6, -0.05, reach), spread: lerp(0.2, 0.9, reach), len: lerp(600, 2400, reach), color: '#fff6dc', a: 0.3 + 0.4 * reach });
    glow(g, E.W / 2, E.H / 2, 900 * reach, '#fff6dc', 0.6 * reach); whiteOut(g, 0.2 + 0.5 * pk);
    { const sk = shake(t * 5, 18 * pk, 5, 2); g.save(); g.translate(sk[0], sk[1]); chip(g, t, { str: 'LIGHT = PUNCH', at: tPun, x: E.W / 2, y: E.H * 0.5, tone: 'coral', dur: tNeed - 0.15 }); g.restore(); }
  } else {
    const cam = camMove(t - tNeed, info.dur - tNeed, { z: [1.05, 1.12], x: [-40, 20] }), flash = Math.max(0, Math.sin((t - tNeed) * 22)) * (1 - prog(t, tNeed + 0.05, tNeed + 0.55));
    forest(g, t, cam, { view: 'camp', rain: true }); forestFg(g, t, cam);
    FX.rain(g, t, { count: 160, color: '#b8c8ff', a: 0.25 });
    if (flash > 0.05) { veil(g, '#dfe6ff', 0.45 * flash); FX.lightning?.(g, { x: E.W * 0.7, y: 0, seed: 81, a: flash }); }
    veil(g, '#05060f', 0.25);
  }
} });
