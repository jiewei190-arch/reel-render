// B_s069_s081_cyclist_flash.js — batch B: RULE 4 (light is the enemy): the ghost cyclist, the lamp flash, total blindness, the walk home.
import { E, V, S, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, rng, mix, talkAmount } from '/engine/core.js';
import { POSES, breathe, posesAt, bigFace, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { street, streetFg, streetGround } from '../sets/street.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { thermalView, heatActor, heatBlob, heatRect, heat, whiteOut } from '../sets/thermal.js';
import { chip, ruleCard, darkness } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { HERO, DEV, MINA } from '../cast.js';
import { W, push, scr, hand, blinkAt, bike, stopwatch, clockTower, lightSwitch } from './B_lib.js';

const CX = E.W / 2, roadY = () => streetGround() + 140;
// a rider on a bike: the bike, then a seated figure pedalling (pose built from sit with pedalling feet)
function riderPose(t) { const p = { ...POSES.sit }, a = t * 7; p.fF = [Math.cos(a) * 18 + 6, -14 + Math.sin(a) * 18]; p.fB = [Math.cos(a + Math.PI) * 18 + 6, -14 + Math.sin(a + Math.PI) * 18]; p.kF = [30, -60 + Math.sin(a) * 8]; p.kB = [26, -60 - Math.sin(a) * 8]; p.hF = [58, -112]; p.eF = [36, -132]; p.hB = [56, -110]; p.eB = [30, -130]; return p; }
function rider(g, who, x, y, s, t, o = {}) { const top = bike(g, x, y, s, t, { facing: o.facing ?? 1, lamp: o.lamp || 0, flat: o.flat, frame: o.frame, tyre: o.tyre }); const f = o.facing ?? 1;
  (o.heat ? (gg, w, oo) => heatActor(gg, w, oo) : actor)(g, who, { x: x - 22 * s * f, y: y - 58 * s, s: s * 1.0, facing: f, pose: riderPose(t), t, expr: o.expr || 'neutral', rim: o.rim, heat: o.heat, shadow: false }); return top; }

// s069 — "Rule four... light is the enemy."  RULE 4 card over the dark street, one lamp flaring behind the title
registerShot('s069', { draw(g, t, info) {
  const tL = W('light', info, 1.2);
  ruleCard(g, t, info, { n: 4, title: 'LIGHT IS THE ENEMY', accent: '#ffd47e', bg: (g, t) => {
    street(g, t, { z: 1.05 + 0.04 * t / info.dur, x: 20 * t }, { power: 0 });
    const f = ease.out(prog(t, tL - 0.15, tL + 0.1)) * (0.85 + 0.15 * Math.sin(t * 13)); if (f > 0) { glow(g, CX + 40, E.H * 0.32, 520 * f, '#fff3d0', 0.55 * f); FX.lensStreak(g, CX + 40, E.H * 0.32, E.W * 1.4, '#ffe6cc', 0.4 * f, 3); circle(g, CX + 40, E.H * 0.32, 16 * f, '#ffffff'); }
    FX.dust(g, t, { count: 40, color: '#ffe6b0', a: 0.25 });
  } });
} });

// s070 — "You step off the kerb at midnight."  wide: HERO and DEV at the kerb, a clock tower reads 12:00, empty road. Slow push.
registerShot('s070', { draw(g, t, info) {
  const tStep = W('step', info, 0.2), tMid = W('midnight', info, 1.24), GY = streetGround();
  const cam = push(t, info, { z: 1.0, x: -80, y: -40 }, { z: 1.1, x: -20, y: -20 });
  street(g, t, cam, { power: 0 });
  layer(g, cam, 0.3, (g) => clockTower(g, CX + 520, GY - 150, 0.95, t, { color: '#0c0a14', lit: 0.6 + 0.4 * ease.out(prog(t, tMid - 0.3, tMid + 0.2)) }));
  const step = ease.inOut(prog(t, tStep, tStep + 0.6));
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: CX - 420, y: GY, s: 1.1, facing: 1, pose: breathe(POSES.stand, t, 1, 2), expr: 'neutral', rim: { color: '#9fb6ff' }, t, blink: blinkAt(t, 1.2) });
    actor(g, 'HERO', { x: CX - 240 + 60 * step, y: GY + 60 * step, s: 1.1, facing: 1, pose: step > 0 && step < 1 ? walkPose(t * Math.PI * 2) : breathe(POSES.stand, t), expr: 'smirk', rim: { color: '#9fb6ff' }, t });
  });
  if (t > tMid) { const k = ease.outBack(prog(t, tMid, tMid + 0.3)); const [x, y] = scr({ ...cam, z: 1 + (cam.z - 1) * 0.3, x: cam.x * 0.3, y: cam.y * 0.3 }, CX + 520, GY - 150 - 430 * 0.95); FX.rings(g, x, y, t, { count: 2, r0: 50, r1: 120, color: '#ffd59a', a: 0.4 * k }); }
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 20, color: '#c9d4ff', a: 0.2 });
} });

// s071 — "A cyclist, no lamp, glows like a ghost."  THERMAL: a white-orange ghost on a faint purple frame; camera pans with them
registerShot('s071', { draw(g, t, info) {
  const tNo = W('no', info, 1.08), tGhost = W('ghost', info, 2.64), RY = roadY(), u = t / info.dur;
  const bx = lerp(CX - 900, CX + 700, u), cam = { z: 1.25, x: lerp(-700, 520, ease.sine(u)), y: 120 };
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      rider(c, { top: 'tshirt', head: 'none' }, bx, RY + 40, 1.3, t, { heat: 0.9, flat: true, frame: heat(0.2), tyre: heat(0.0) });   // frame barely warm, tyres stone cold
      heatBlob(c, bx - 10, RY - 180, 230, 160, 0.3, 0.9);
      for (let i = 1; i < 6; i++) heatBlob(c, bx - i * 70, RY - 130, 80, 60, 0.08 * (6 - i), 0.9);                               // a ghostly heat trail
    }),
    hud: { label: 'THERMAL', temp: t > tNo ? 'NO LAMP' : '35 C', track: scr(cam, bx - 20, RY - 150) },
  });
  if (t > tGhost) chip(g, t, { str: 'Glows like a ghost', at: tGhost, x: E.W / 2, y: E.H * 0.88, dur: info.dur - 0.1 });
} });

// s072 — "You yank Dev back. Saved him."  medium: HERO grabs Dev's sleeve; the cyclist whips past; Dev's beanie flies
registerShot('s072', { draw(g, t, info) {
  const tYank = W('yank', info, 0.46), tSaved = W('Saved', info, 2.08), GY = streetGround(), RY = roadY();
  const [kx, ky] = shake(t * 20, prog(t, tYank + 0.2, tYank + 0.35) * (1 - prog(t, tYank + 0.35, tYank + 0.9)) * 8);
  const cam = push(t, info, { z: 1.45, x: -160, y: 130 }, { z: 1.55, x: -120, y: 120 }); cam.x += kx; cam.y += ky;
  street(g, t, cam, { power: 0 });
  const yank = ease.out(prog(t, tYank, tYank + 0.35)), passT = tYank + 0.35, bx = lerp(CX - 1600, CX + 1700, prog(t, passT - 0.4, passT + 0.5));
  const dev = { x: CX - 40 - 170 * yank, y: lerp(GY + 50, GY, yank), s: 1.45, facing: 1, t, rot: -0.18 * yank * (1 - prog(t, tYank + 0.6, tYank + 1.3)) };
  layer(g, cam, 1, (g) => {
    if (t > passT - 0.4 && t < passT + 0.5) { g.save(); g.globalAlpha *= 0.9; rider(g, { top: 'tshirt', color: '#2a2834', legs: '#1c1a24', head: 'none' }, bx, RY + 40, 1.45, t * 1.6, { rim: { color: '#9fb6ff' } }); g.restore(); FX.speedLines(g, t, { cx: scr(cam, bx, RY)[0], cy: scr(cam, bx, RY - 100)[1], count: 30, a: 0.25, inner: 200 }); }
    actor(g, { ...DEV, head: t > tYank + 0.2 ? 'none' : DEV.head }, { ...dev, pose: breathe(posesAt(t, [[0, walkPose(t * 6)], [tYank, POSES.fall], [tYank + 0.8, POSES.handsOnHead]], 0.25), t), expr: t > tYank ? 'shocked' : 'neutral', rim: { color: '#9fb6ff' } });
    const hero = { x: CX - 360, y: GY, s: 1.45, facing: 1, t, pose: breathe(posesAt(t, [[0, POSES.stand], [tYank - 0.2, POSES.reach], [tYank + 0.5, POSES.ready], [tSaved, POSES.crossArms]], 0.25), t) };
    actor(g, 'HERO', { ...hero, expr: t > tSaved ? 'smirk' : 'determined', rim: { color: '#9fb6ff' } });
    if (t > tYank - 0.1 && t < tYank + 0.5) seg(g, [hand(hero), [dev.x - 10, dev.y - 150 * 1.45]], 6, '#3c4058');              // the sleeve grab
    // the beanie flies off and spins away
    if (t > tYank + 0.2) { const ft = t - tYank - 0.2, hx = dev.x + 30 + ft * 700, hy = dev.y - 300 - ft * 420 + ft * ft * 600; g.save(); g.translate(hx, hy); g.rotate(ft * 9); g.fillStyle = '#f08a24'; g.beginPath(); g.arc(0, 0, 30, Math.PI, 0); g.fill(); g.fillRect(-32, -2, 64, 12); circle(g, 0, -32, 8, '#f08a24'); g.restore(); }
  });
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 20, color: '#c9d4ff', a: 0.2 });
} });

// s073 — "Dev stares at you. How did you see that?"  giant face of Dev, wide-eyed; Dev speaks the quoted line
registerShot('s073', { draw(g, t, info) {
  const tHow = W('How', info, 1.36), cam = push(t, info, { z: 1.04, x: 0, y: 0 }, { z: 1.12, x: -20, y: -10 });
  street(g, t, { z: 2.3, x: 400, y: -120 }, { power: 0 }); g.save(); g.fillStyle = 'rgba(6,8,20,.5)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  layer(g, cam, 1, (g) => bigFace(g, E.W * 0.52, E.H * 0.6, E.H * 0.3, { outfit: { ...DEV, head: 'none' }, expr: t > tHow ? 'surprised' : 'shocked', rimColor: '#9fb6ff', rimSide: -1, look: [-0.3, 0], talk: talkAmount(info.globalT, info.shot.start + tHow - 0.05, info.shot.end), tilt: -0.04 * Math.sin(t * 1.6) }));
  FX.dust(g, t, { count: 22, color: '#c9d4ff', a: 0.2 });
} });

// s074 — "Then the cyclist's lamp snaps on."  insert: the bike lamp snaps on - a hard starburst, lens streak, flash
registerShot('s074', { draw(g, t, info) {
  const tSnap = W('snaps', info, 1.66), on = t > tSnap, k = ease.out(prog(t, tSnap, tSnap + 0.12)), cam = push(t, info, { z: 2.6, x: 0, y: 0 }, { z: 2.8, x: 10, y: -6 });
  const [kx, ky] = shake(t * 18, on ? Math.max(0, 7 - (t - tSnap) * 18) : 0);
  g.fillStyle = '#05050a'; g.fillRect(0, 0, E.W, E.H);
  layer(g, { ...cam, x: cam.x + kx, y: cam.y + ky }, 1, (g) => {
    const lx = CX + 60, ly = E.H / 2;
    seg(g, [[lx - 700, ly + 40], [lx - 120, ly + 10], [lx - 40, ly + 18]], 22, '#2a2632'); seg(g, [[lx - 320, ly + 20], [lx - 360, ly + 260]], 18, '#2a2632');   // handlebar + stem
    rr(g, lx - 60, ly - 34, 90, 64, 18); g.fillStyle = '#3a3642'; g.fill(); circle(g, lx + 30, ly - 2, 28, on ? '#ffffff' : '#3a3a48'); ring(g, lx + 30, ly - 2, 30, 6, '#55505e');
    if (!on) { const hand = ease.inOut(prog(t, 0.3, tSnap - 0.05)); circle(g, lx - 30, ly - 60 + 20 * hand, 22, S().ink); seg(g, [[lx - 30, ly - 60 + 20 * hand], [lx - 200, ly - 260]], 30, '#2a2834'); }   // a thumb finds the switch
  });
  if (on) { const x = CX + 60 + (cam.x - CX + CX) * 0, y = E.H / 2; glow(g, CX + 90, y, E.W * 0.9 * k, '#fff6dc', 0.9 * k); FX.lensStreak(g, CX + 90, y, E.W * 1.6, '#fff1d0', 0.7 * k, 6);
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.2; seg(g, [[CX + 90, y], [CX + 90 + Math.cos(a) * 900 * k, y + Math.sin(a) * 900 * k]], 5, alpha('#fff3c4', 0.35 * k)); } g.restore();
    if (t < tSnap + 0.12) { g.save(); g.fillStyle = `rgba(255,255,255,${0.8 * (1 - (t - tSnap) / 0.12)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); } }
} });

// s075 — "It is one bright flash. Your thermal view whites out."  THERMAL: palette blooms to total white, readout glitches
registerShot('s075', { draw(g, t, info) {
  const tFl = W('flash', info, 1.02), tWh = W('whites', info, 2.8), RY = roadY(), cam = push(t, info, { z: 1.2, x: 200, y: 100 }, { z: 1.32, x: 240, y: 90 });
  const bloom = ease.inOut(prog(t, tFl - 0.7, tFl + 0.05)) * (1 - 0.5 * ease.inOut(prog(t, tFl + 0.2, tWh - 0.4))), wo = Math.max(0.5 * bloom, ease.in(prog(t, tWh - 0.4, tWh + 0.35)));
  const glitch = t > tFl - 0.1 && Math.floor(t * 17) % 3 === 0;
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => { rider(c, { top: 'tshirt', head: 'none' }, CX + 300, RY + 40, 1.3, 0.6, { heat: 0.9, flat: true, frame: heat(0.2), tyre: heat(0) }); heatBlob(c, CX + 380, RY - 100, 400 * (0.4 + wo), 300 * (0.4 + wo), clamp(0.6 + wo), 0.6); }),
    hud: { label: glitch ? 'TH3RM#L' : 'THERMAL', temp: t > tFl - 0.1 ? (glitch ? '### C' : 'SENSOR OVERLOAD') : '35 C', track: scr(cam, CX + 380, RY - 100) },
    noise: 0.025 + 0.2 * wo,
  });
  whiteOut(g, wo, { x: scr(cam, CX + 380, RY - 100)[0], y: scr(cam, CX + 380, RY - 100)[1] });
  if (glitch) { g.save(); const R = rng(Math.floor(t * 17)); for (let i = 0; i < 7; i++) { const y = R() * E.H, h = 4 + R() * 22; g.fillStyle = alpha(R() > 0.5 ? '#ff3b7a' : '#ffe048', 0.25 + 0.3 * R()); g.fillRect((R() - 0.5) * 80, y, E.W, h); } g.restore(); }
} });

// s076 — "Your old eyes are not ready either. Total blindness."  giant face: pupils shrink, squeeze shut, white then black
registerShot('s076', { draw(g, t, info) {
  const tOld = W('old', info, 0.72), tNot = W('not', info, 1.42), tTot = W('Total', info, 2.92), cam = push(t, info, { z: 1.05, x: 0, y: 0 }, { z: 1.16, x: 0, y: -14 });
  street(g, t, { z: 2.2, x: -200, y: -80 }, { power: 0 }); g.save(); g.fillStyle = 'rgba(6,8,20,.4)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  const shut = t > tNot, sq = ease.out(prog(t, tNot, tNot + 0.25));
  layer(g, cam, 1, (g) => { g.save(); g.translate(E.W / 2, E.H * 0.6); g.scale(1 + 0.04 * sq, 1 - 0.05 * sq); g.translate(-E.W / 2, -E.H * 0.6);
    bigFace(g, E.W / 2, E.H * 0.6, E.H * 0.3, { outfit: HERO, expr: shut ? 'cry' : t > tOld ? 'scared' : 'shocked', rimColor: '#fff3d0', rimSide: 1, look: [0, 0], blink: shut, face: shut ? { tears: false } : { eyes: 'ring' } }); g.restore(); });
  const white = ease.out(prog(t, 0, 0.3)) * (1 - ease.inOut(prog(t, 0.3, tNot))) * 0.3 + ease.out(prog(t, tNot - 0.1, tNot + 0.1)) * (1 - prog(t, tNot + 0.1, tTot - 0.1)) * 0.32;
  whiteOut(g, white, { x: E.W * 0.85, y: E.H * 0.3 });
  darkness(g, ease.inOut(prog(t, tTot - 0.4, tTot + 0.3)));
  if (t > tTot + 0.3) FX.dust(g, t, { count: 12, color: '#2a2a40', a: 0.4 });          // nothing but floaters
} });

// s077 — "Bright light floods your rods. They need twenty to thirty minutes to recover."  BLUEPRINT: rods flood white; recovery bar
registerShot('s077', { draw(g, t, info) {
  const ui = S().ui, tFl = W('floods', info, 0.52), tNeed = W('need', info, 2.08), tRec = W('recover', info, 3.44), sc = 1 + 0.03 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'RULE 4 - BLEACHED RODS', fig: 'FIG 10 - DARK ADAPTATION' });
  const flood = ease.out(prog(t, tFl - 0.2, tFl + 0.3)) * (1 - 0.6 * ease.inOut(prog(t, tNeed, info.dur)));
  BP.retina(g, t, { x: E.W / 2, y: E.H * 0.42, w: 980, h: 420, rods: true, cones: false, flood });
  if (flood > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W / 2, E.H * 0.36, 520, '#ffffff', 0.25 * flood); g.restore(); }
  // recovery bar: creeps from 0 toward "20-30 min"
  const bk = ease.out(prog(t, tNeed - 0.2, tNeed + 0.2)); if (bk > 0) { const x = E.W * 0.22, y = E.H * 0.76, w = E.W * 0.56; g.save(); g.globalAlpha *= bk; rr(g, x, y, w, 34, 17); g.strokeStyle = ui.blueprint; g.lineWidth = 3; g.stroke();
    const p = 0.05 + 0.18 * ease.inOut(prog(t, tNeed, info.dur)); rr(g, x + 4, y + 4, (w - 8) * p, 26, 13); g.fillStyle = ui.gold; g.fill(); glow(g, x + (w - 8) * p, y + 17, 50, ui.gold, 0.6);
    text(g, '0', x, y + 66, { size: 26, color: ui.blueprint, font: FONTS.ui, weight: 900 }); text(g, '20-30 MIN', x + w, y + 66, { size: 26, color: ui.gold, font: FONTS.ui, weight: 900, align: 'right' }); text(g, 'RECOVERY', x, y - 26, { size: 26, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 4 }); g.restore(); }
  BP.label(g, t, { at: [E.W / 2 - 200, E.H * 0.3], to: [E.W / 2 - 420, E.H * 0.16], str: 'RODS FLOODED', start: tFl + 0.2 });
  g.restore();
  chip(g, t, { str: 'Recovery: 20-30 minutes', at: tRec - 0.6, x: E.W / 2, y: E.H * 0.9, dur: info.dur - 0.1 });
} });

// s078 — "Your new sight takes about a minute. A long, shaky minute."  medium: HERO blind, hands out; a 60-second ring ticks
registerShot('s078', { draw(g, t, info) {
  const tMin = W('minute', info, 1.52), tShaky = W('shaky', info, 3.08), GY = streetGround();
  const wob = 1 + 2 * prog(t, tShaky - 0.3, tShaky + 0.3), [kx, ky] = shake(t * 2.2, 6 * wob, 1.3, 7);
  const cam = { ...push(t, info, { z: 1.5, x: -120, y: 110 }, { z: 1.62, x: -80, y: 100 }) }; cam.x += kx; cam.y += ky; cam.r = 0.01 * Math.sin(t * 1.4) * wob;
  street(g, t, cam, { power: 0 }); darkness(g, 0.35);
  layer(g, cam, 1, (g) => {
    const p = { ...POSES.reach }, sw = Math.sin(t * 1.6); p.hF = [p.hF[0] + sw * 8, p.hF[1] + Math.cos(t * 2) * 6]; p.hB = [54, -170 + sw * 6]; p.eB = [28, -160];
    actor(g, 'HERO', { x: CX - 140 + Math.sin(t * 0.7) * 30, y: GY, s: 1.5, facing: 1, pose: breathe(p, t, 1.6), expr: 'worried', blink: true, rim: { color: '#9fb6ff' }, t });
  });
  // the minute: a stopwatch ring ticking in the corner
  const sk = ease.outBack(prog(t, tMin - 0.4, tMin)); if (sk > 0) { g.save(); g.translate(E.W * 0.82, E.H * 0.3); g.scale(sk, sk); stopwatch(g, 0, 0, 120, (t - tMin + 0.4) / 60 * 9 + 0.02, t, { label: `${Math.min(60, Math.floor((t - tMin + 0.4) * 9 + 1))} s` }); g.restore(); }
  FX.dust(g, t, { count: 20, color: '#c9d4ff', a: 0.15 });
} });

// s079 — "Dev guides you home by the sleeve."  over the shoulder: Dev leads, HERO eyes shut, blurred lamp light in front
registerShot('s079', { draw(g, t, info) {
  const GY = streetGround(), cam = push(t, info, { z: 1.55, x: 40, y: 120 }, { z: 1.68, x: 120, y: 110 }), walk = t * Math.PI * 2 * 0.7;
  street(g, t, cam, { power: 0.2 });
  layer(g, cam, 1, (g) => {
    const dx = CX + 120 + t * 60, hx = dx - 230;
    const dev = { x: dx, y: GY, s: 1.5, facing: 1, pose: walkPose(walk), t }, hero = { x: hx, y: GY, s: 1.5, facing: 1, pose: (() => { const p = walkPose(walk + 1.6); return { ...p, hF: [54, -150], eF: [30, -146] }; })(), t };
    actor(g, 'HERO', { ...hero, expr: 'worried', blink: true, rim: { color: '#ffd59a' } });
    seg(g, [hand(hero), [dx - 18, GY - 160 * 1.5]], 6, '#3c4058');
    actor(g, 'DEV', { ...dev, expr: 'determined', look: [-0.6, 0], rim: { color: '#ffd59a' } });
  });
  blurLayer(g, 14, (g) => { glow(g, CX - 520, E.H * 0.42, 320, '#ffd59a', 0.55); circle(g, CX - 520, E.H * 0.42, 30, '#fff3d0'); seg(g, [[CX - 520, E.H * 0.46], [CX - 520, E.H * 1.2]], 30, '#0c0a14'); }, { z: 1.9, x: -60 + t * 40, y: 0 }, 1.4);
  FX.dust(g, t, { count: 20, color: '#ffd59a', a: 0.2 });
} });

// s080 — "Amazing. And awful. Usually both at once."  wide: two figures walk home, lamps flicker on in order, camera pulls back
registerShot('s080', { draw(g, t, info) {
  const tAm = W('Amazing', info, 0.12), tAw = W('awful', info, 1.48), tBoth = W('both', info, 3.28), GY = streetGround();
  const cam = push(t, info, { z: 1.32, x: 60, y: 60 }, { z: 0.98, x: 120, y: -10 });
  const power = key(t, [[0.4, 0], [tBoth + 0.4, 1]], ease.linear) * (0.9 + 0.1 * Math.sin(t * 23) * (t < tBoth ? 1 : 0));   // the lights come back house by house
  street(g, t, cam, { power });
  const walk = t * Math.PI * 2 * 0.8, x0 = CX - 200 + t * 70;
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: x0 - 180, y: GY, s: 0.95, facing: 1, pose: walkPose(walk + 1.6), expr: t > tAw ? 'sad' : 'happy', blink: t < tAm + 0.8 ? true : blinkAt(t), rim: { color: '#ffd59a' }, t });
    actor(g, 'DEV', { x: x0, y: GY, s: 0.95, facing: 1, pose: walkPose(walk), expr: 'smile', rim: { color: '#ffd59a' }, t });
  });
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 22, color: '#ffd59a', a: 0.18 });
  if (power > 0.2) FX.lensStreak(g, E.W * 0.7, E.H * 0.3, E.W, '#ffd59a', 0.15 * power);
} });

// s081 — "So the rule is simple. Dark is your friend."  medium: HERO and MINA in the dark flat; his hand flicks the switch OFF
registerShot('s081', { draw(g, t, info) {
  const tRule = W('rule', info, 0.62), tDark = W('Dark', info, 2.2), tFr = W('friend', info, 2.74), GY = apartmentGround();
  const off = t > tDark, cam = push(t, info, { z: 1.5, x: -560, y: 120 }, { z: 1.62, x: -520, y: 110 });
  const A = apartment(g, t, cam, { power: off ? 0 : 0.7 });
  const swx = CX - 680, swy = GY - 330;
  layer(g, cam, 1, (g) => {
    lightSwitch(g, swx, swy, off ? 0 : 1, 1.3);
    const hero = { x: swx + 120, y: GY, s: 1.55, facing: -1, t, pose: breathe(posesAt(t, [[0, POSES.stand], [tRule, POSES.reach], [tDark + 0.4, POSES.relaxed]], 0.35), t) };
    actor(g, 'HERO', { ...hero, expr: off ? 'smile' : 'neutral', rim: A.rim, blink: blinkAt(t, 0.6) });
    actor(g, 'MINA', { x: swx + 420, y: GY, s: 1.55, facing: -1, pose: breathe(POSES.stand, t, 1, 2), expr: t > tFr ? 'happy' : 'smile', look: [-0.6, -0.5], rim: A.rim, t, blink: blinkAt(t, 2.2) });
    if (t > tDark && t < tDark + 0.5) FX.rings(g, swx, swy, t, { count: 2, r0: 10, r1: 70, color: '#ffd59a', a: 0.5 * (1 - prog(t, tDark, tDark + 0.5)) });
  });
  apartmentFg(g, t, cam);
  FX.dust(g, t, { count: 24, color: off ? '#c9d4ff' : '#ffd59a', a: 0.2 });
} });
