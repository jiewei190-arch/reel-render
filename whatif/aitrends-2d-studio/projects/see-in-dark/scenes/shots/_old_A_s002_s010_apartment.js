// A_s002_s010_apartment.js — batch A, cold open in the flat (s002-s007, s009, s010). s001 and s008 are stage-1 shots (not here).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake, talkAmount, text, FONTS, rr, seg, circle, poly, linGrad, radGrad, shade, backdrop } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { thermalView, heatActor, heatBlob, heatRect, heatCat } from '../sets/thermal.js';
import { chip } from '../sets/hud.js';
import { HERO } from '../cast.js';

const W = (word, st, fb) => (wordTime(word, st) ?? st + fb) - st;     // shot-local time of a spoken word (fallback: fb s into the shot)

// s002 — "Round the coffee table. Over the shoe."  top-down plan of the flat, HERO's path draws on as a glowing ink line
registerShot('s002', { draw(g, t, info) {
  const st = info.shot.start, tTable = W('coffee', st, 0.5), tShoe = W('shoe', st, 1.9), k = ease.inOut(t / info.dur);
  const ui = S().ui, cx = E.W / 2, cy = E.H / 2;
  backdrop(g, ['#0a0d1c', '#05060f']);
  g.save(); g.translate(cx, cy); g.rotate(-0.05 + 0.04 * k); g.scale(1.02 + 0.08 * k, 1.02 + 0.08 * k); g.translate(-cx - 40 * k, -cy);
  // floor plan: walls, furniture as dark shapes with a faint moonlight edge
  const fl = '#121831', edge = alpha('#9fb6ff', 0.35);
  rr(g, 260, 150, 1400, 780, 18); g.fillStyle = fl; g.fill(); g.strokeStyle = alpha('#9fb6ff', 0.5); g.lineWidth = 10; g.stroke();
  g.strokeStyle = alpha('#9fb6ff', 0.08); g.lineWidth = 1; for (let x = 300; x < 1660; x += 60) { g.beginPath(); g.moveTo(x, 160); g.lineTo(x, 920); g.stroke(); }
  const furn = (x, y, w, h, r, col = '#1d2442') => { rr(g, x, y, w, h, r); g.fillStyle = col; g.fill(); g.strokeStyle = edge; g.lineWidth = 2.5; g.stroke(); };
  furn(330, 200, 160, 420, 26, '#232b4e');           // sofa
  furn(700, 430, 300, 170, 30, '#2a2440');            // coffee table
  furn(1380, 190, 230, 110, 10);                      // counter
  furn(1450, 640, 150, 150, 12);                      // fridge
  // door (top-left) as a quarter-circle swing
  g.strokeStyle = alpha('#9fb6ff', 0.4); g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.arc(270, 860, 150, -Math.PI / 2, 0); g.stroke(); g.setLineDash([]);
  seg(g, [[270, 860], [270, 710]], 9, alpha('#9fb6ff', 0.7));
  // the shoe on the floor
  g.save(); g.translate(1100, 760); g.rotate(-0.35); rr(g, -38, -16, 76, 32, 14); g.fillStyle = '#3a2a36'; g.fill(); g.strokeStyle = edge; g.stroke(); g.restore();
  // HERO's path: from the door, round the table, a hop over the shoe, to the fridge
  const path = []; for (let i = 0; i <= 80; i++) { const u = i / 80; let x, y;
    if (u < 0.55) { const a = lerp(Math.PI * 0.95, Math.PI * 2.15, u / 0.55); x = 850 + Math.cos(a) * 260; y = 515 + Math.sin(a) * 175 + (1 - u / 0.55) * 120; }
    else { const v = (u - 0.55) / 0.45; x = lerp(850 + Math.cos(Math.PI * 2.15) * 260, 1440, v); y = lerp(515 + Math.sin(Math.PI * 2.15) * 175, 740, v) - Math.sin(clamp((v - 0.25) / 0.4) * Math.PI) * 60; }
    path.push([x, y]); }
  const pk = ease.inOut(prog(t, 0.15, info.dur - 0.25)), n = Math.max(2, Math.round(pk * path.length));
  g.save(); g.setLineDash([2, 14]); g.lineCap = 'round'; seg(g, path.slice(0, n), 7, alpha('#ffd47e', 0.9)); g.setLineDash([]); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; seg(g, path.slice(0, n), 16, alpha('#ffb04a', 0.12)); g.restore();
  const [hx, hy] = path[n - 1], hop = n > 46 && n < 70 ? Math.sin(((n - 46) / 24) * Math.PI) : 0;
  glow(g, hx, hy, 70 + hop * 30, '#ffb04a', 0.55); circle(g, hx, hy + 6, 22 * (1 - hop * 0.2), alpha('#000', 0.35)); circle(g, hx, hy - hop * 16, 20 + hop * 5, HERO.color); circle(g, hx, hy - hop * 16, 11, shade(HERO.color, -0.35));
  g.restore();
  UI.callout(g, t, { at: [cx - 120, cy + 10], to: [cx - 260, cy - 230], str: 'COFFEE TABLE', start: tTable });
  UI.callout(g, t, { at: [cx + 150, cy + 220], to: [cx + 330, cy + 330], str: 'SHOE', start: tShoe });
  FX.dust(g, t, { count: 22, color: '#c9d4ff', a: 0.18 });
} });

// s003 — "Past the door that always eats your knee."  macro: the door edge swings in, the knee glides past by a centimetre
registerShot('s003', { draw(g, t, info) {
  const st = info.shot.start, tKnee = W('knee', st, 1.8), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.08 * k, x: lerp(-30, 30, k), y: 0 }, M = mood('night');
  layer(g, cam, 0.6, (g) => { backdrop(g, ['#0c1024', '#151a33', '#090b16']); g.fillStyle = alpha('#9fb6ff', 0.05); for (let x = -200; x < E.W + 200; x += 140) g.fillRect(x, 0, 3, E.H); });
  layer(g, cam, 0.6, (g) => glow(g, E.W * 0.2, E.H * 0.2, 700, '#7f9cff', 0.18));       // moonlight from the window, upper left
  // the knee (dark-teal trousers) slides left -> right, a little dip as it squeezes past
  const kx = key(t, [[0, E.W * 0.12], [tKnee, E.W * 0.58 - 150], [info.dur, E.W * 0.58 + 260]], ease.inOut), ky = E.H * 0.6 + Math.sin(t * 6) * 4;
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(kx, ky); g.rotate(-0.12);
    rr(g, -520, -80, 520, 170, 80); g.fillStyle = shade(HERO.legs, -0.15); g.fill();                 // thigh
    g.beginPath(); g.ellipse(0, 0, 120, 110, 0, 0, Math.PI * 2); g.fillStyle = HERO.legs; g.fill();   // knee cap
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha('#9fb6ff', 0.55); g.lineWidth = 8; g.beginPath(); g.ellipse(0, 0, 120, 110, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke(); g.restore();
    rr(g, -60, 40, 140, 600, 60); g.fillStyle = shade(HERO.legs, -0.1); g.fill();                    // shin going down out of frame
    seg(g, [[-30, -30], [40, 20]], 3, alpha('#ffffff', 0.12)); seg(g, [[-80, 60], [10, 90]], 3, alpha('#ffffff', 0.08));   // fabric creases
    g.restore();
    // the door edge swings in from the right, stopping a hair short of the knee
    const sw = ease.out(prog(t, 0.0, Math.max(0.6, tKnee - 0.2))), dx = lerp(E.W + 200, E.W * 0.58, sw) + Math.sin(t * 3) * 4, near = Math.abs(kx + 120 - dx) < 140;
    g.fillStyle = linGrad(g, dx, 0, dx + 160, 0, ['#3a2a36', '#24182a']); g.fillRect(dx, -100, 520, E.H + 200);
    g.fillStyle = alpha('#cfe0ff', 0.4); g.fillRect(dx, -100, 6, E.H + 200);                                 // lit edge
    rr(g, dx + 60, E.H * 0.5 - 10, 26, 90, 10); g.fillStyle = '#b8a27a'; g.fill();                         // handle
    if (near || (t > tKnee - 0.2 && t < tKnee + 0.6)) { for (let i = 0; i < 4; i++) seg(g, [[dx - 30 - i * 16, ky - 60 + i * 34], [dx - 120 - i * 26, ky - 60 + i * 34]], 3, alpha('#e8ecff', 0.35)); }
    // "1 cm" gap marker
    const gm = ease.outBack(prog(t, tKnee - 0.1, tKnee + 0.3)) * clamp((info.dur - t) / 0.3);
    if (gm > 0.02) { g.save(); g.globalAlpha *= clamp(gm); seg(g, [[dx - 2, ky - 150], [dx - 2, ky - 120]], 3, S().ui.gold); text(g, '1 cm', dx - 70, ky - 170, { size: 40, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 12, glowColor: alpha(S().ui.gold, 0.5) }); g.restore(); }
  });
  // dust puffs where the air moves
  FX.dust(g, t, { count: 40, color: '#dfe6ff', a: 0.28 });
  layer(g, cam, 1, (g) => { const pk = prog(t, tKnee - 0.2, tKnee + 1); if (pk > 0 && pk < 1) for (let i = 0; i < 9; i++) circle(g, E.W * 0.58 - 40 - pk * 140 * (1 + i % 3), E.H * 0.6 + (i - 4) * 26 - pk * 40, 6 + pk * 14, alpha('#dfe6ff', 0.18 * (1 - pk))); });
} });

// s004 — "You find the cat on top of the fridge."  medium two-shot: HERO looks up at Biscuit on the fridge
registerShot('s004', { draw(g, t, info) {
  const st = info.shot.start, tCat = W('cat', st, 1.2), k = ease.inOut(t / info.dur);
  const cam = { z: 1.22 + 0.08 * k, x: lerp(520, 560, k), y: lerp(60, 40, k) };
  const A = apartment(g, t, cam, { power: 0 }), P = A.pos;
  layer(g, cam, 1, (g) => {
    const pose = breathe(posesAt(t, [[0, 'stand'], [Math.max(0.3, tCat - 0.2), 'pointUp'], [tCat + 1.1, 'relaxed']]), t, 1);
    actor(g, 'HERO', { x: P.fridgeX - 230, y: A.GY, s: 1.6, facing: 1, pose, expr: t < tCat ? 'neutral' : 'smile', look: [0.5, -0.9], rim: A.rim, t });
    cat(g, { x: P.fridgeX + 20, y: P.fridgeTop, s: 1.25, facing: -1, pose: 'loaf', eyes: t > tCat - 0.2 && (t % 2.2) > 0.1 ? 'glint' : 'blink', t, rim: A.rim });
    if (t > tCat - 0.2) { glow(g, P.fridgeX - 12, P.fridgeTop - 58, 40, '#c8f07a', 0.55 * clamp((t - tCat + 0.2) * 3)); FX.sparkle(g, P.fridgeX - 14, P.fridgeTop - 60, 16 + 4 * Math.sin(t * 6), '#e8ffb0', 0.6); }
  });
  apartmentFg(g, t, cam);
  FX.dust(g, t, { count: 30, color: '#c9d4ff', a: 0.22 });
} });

// s005 — "Biscuit blinks. She looks offended."  giant close-up of Biscuit
registerShot('s005', { draw(g, t, info) {
  const st = info.shot.start, tBlink = W('blinks', st, 0.6), tOff = W('offended', st, 2.2), k = ease.inOut(t / info.dur);
  const cam = { z: 1 + 0.06 * k, x: 0, y: 0 };
  layer(g, cam, 0.5, (g) => { backdrop(g, ['#101532', '#0a0d20', '#06070f']); glow(g, E.W * 0.25, E.H * 0.15, 900, '#7f9cff', 0.2); });
  const eyes = t < tBlink ? 'open' : t < tBlink + 0.22 ? 'blink' : t < tOff ? 'open' : (t - tOff) % 2.6 < 0.12 ? 'blink' : 'offended';
  layer(g, cam, 1, (g) => {
    const sw = Math.sin(t * 1.3) * 6;
    const cs = 15; cat(g, { x: E.W * 0.5 + 12 * cs + sw, y: E.H * 0.52 + 72 * cs, s: cs, facing: -1, pose: 'sit', eyes, t, rim: { color: '#9fb6ff', dir: [-0.7, -0.7] } });
  });
  // whisker twitch + a tiny offended "hmph" tilt read through the eyeshine glow
  const ga = eyes === 'blink' ? 0.05 : eyes === 'offended' ? 0.18 : 0.32;
  layer(g, cam, 1, (g) => { for (const dx of [-3, -14]) glow(g, E.W * 0.5 + (dx - 0) * 15 + 0, E.H * 0.52 - 3 * 15, 160, '#c8f07a', ga); });
  FX.dust(g, t, { count: 24, color: '#c9d4ff', a: 0.2 });
} });

// s006 — "Your little sister Mina stumbles in, torch first."  doorway: Mina stumbles in, phone-torch beam swinging; HERO smirks in front
registerShot('s006', { draw(g, t, info) {
  const st = info.shot.start, tMina = W('mina', st, 1.1), tTorch = W('torch', st, 2.4), k = ease.inOut(t / info.dur);
  const cam = { z: 1.6 + 0.06 * k, x: lerp(-640, -540, k), y: 120 };
  const A = apartment(g, t, cam, { power: 0 }), P = A.pos;
  const mx = lerp(P.doorX - 40, P.doorX + 280, ease.out(prog(t, 0.3, 2.4))), stum = Math.max(0, Math.sin(prog(t, 1.0, 1.7) * Math.PI));
  const beamA = -0.15 + Math.sin(t * 3.1) * 0.35 + stum * 0.5, bx = mx + 40, by = A.GY - 120;
  layer(g, cam, 1, (g) => {
    // the door, bumped open as she comes through
    const dOpen = 0.6 + 0.4 * ease.out(prog(t, 0.2, 0.7)) - 0.08 * stum;
    g.fillStyle = '#0b0a12'; g.fillRect(P.doorX - 70, A.GY - 300, 150, 300);
    g.save(); g.translate(P.doorX - 70, A.GY - 300); g.scale(1 - dOpen * 0.85, 1); g.fillStyle = '#3a2a36'; g.fillRect(0, 0, 150, 300); g.restore();
    FX.lightCone(g, bx, by, { angle: beamA, spread: 0.32, len: 1100, color: '#fff2d6', a: 0.26 });
    const pose = t < 2.5 ? walkPose(t * Math.PI * 2 * 1.1, { stride: 22 }) : posesAt(t, [[0, 'stand'], [2.5, 'phone']]);
    const p2 = stum > 0.05 ? blendPose(pose, POSES.fall, stum * 0.6) : pose;
    actor(g, 'MINA', { x: mx, y: A.GY, s: 1.6, facing: 1, pose: breathe(p2, t, 0.6), expr: stum > 0.3 ? 'surprised' : 'worried', look: [0.6, -0.2], rim: A.rim, t });
    glow(g, bx, by, 60, '#ffffff', 0.7); circle(g, bx, by, 6, '#ffffff');
  });
  // HERO in the foreground right, lit by the torch rim, smirking
  layer(g, cam, 1.25, (g) => {
    const hp = breathe(posesAt(t, [[0, 'relaxed'], [tTorch, 'crossArms']]), t, 1, 2);
    actor(g, 'HERO', { x: P.doorX + 470, y: A.GY + 40, s: 1.7, facing: -1, pose: hp, expr: t > tMina ? 'smirk' : 'neutral', look: [-0.8, 0], rim: { color: '#fff2d6', dir: [-1, -0.2] }, t });
  });
  apartmentFg(g, t, cam);
  FX.dust(g, t, { count: 36, color: '#fff2d6', a: 0.22 });
} });

// s007 — "How are you doing this? You shrug."  over the shoulder: Mina asks (quoted line, may talk), HERO shrugs
registerShot('s007', { draw(g, t, info) {
  const st = info.shot.start, tShrug = W('shrug', st, 2.0), tYou = W('you', st, 1.4), k = ease.inOut(t / info.dur);
  const cam = { z: 1.9 + 0.07 * k, x: lerp(-470, -430, k), y: 150 };
  const A = apartment(g, t, cam, { power: 0 }), P = A.pos;
  const mx = P.doorX + 380;
  layer(g, cam, 1, (g) => {
    FX.lightCone(g, mx + 30, A.GY - 110, { angle: Math.PI * 0.95 + Math.sin(t * 2) * 0.15, spread: 0.3, len: 700, color: '#fff2d6', a: 0.18 });
    const mp = breathe(posesAt(t, [[0, 'phone'], [0.4, 'explain'], [tYou + 0.3, 'phone']]), t, 0.8, 1);
    const talk = talkAmount(info.globalT, st, st + Math.max(0.8, tShrug - 0.4) + 0);
    actor(g, 'MINA', { x: mx, y: A.GY, s: 1.7, facing: 1, pose: mp, expr: 'confused', talk, look: [0.8, -0.3], rim: { color: '#fff2d6', dir: [1, -0.3] }, t });
    if (t < tShrug) FX.rings(g, mx + 30, A.GY - 190, t, { count: 2, r0: 24, r1: 90, color: '#fff2d6', a: 0.35 });
    glow(g, mx + 30, A.GY - 110, 70, '#ffffff', 0.45);
  });
  // big blurred HERO shoulder in the foreground (left); the shoulders lift on "You shrug"
  const sh = ease.outBack(prog(t, tShrug - 0.1, tShrug + 0.35)) * (1 - ease.inOut(prog(t, tShrug + 1.0, tShrug + 1.6)));
  blurLayer(g, 10, (g) => {
    const p = blendPose(POSES.relaxed, POSES.shrug, clamp(sh));
    actor(g, 'HERO', { x: E.W * 0.16 + Math.sin(t * 0.8) * 10, y: E.H + 760, s: 5.2, facing: 1, pose: breathe(p, t, 0.5), expr: 'neutral', rim: { color: '#fff2d6', dir: [1, -0.2] }, t });
  });
  FX.dust(g, t, { count: 30, color: '#fff2d6', a: 0.22 });
} });

// s009 — "You still cannot find your phone charger."  THERMAL insert: warm hands pat the side table, the charger stays a cold black brick
registerShot('s009', { draw(g, t, info) {
  const st = info.shot.start, tChg = W('charger', st, 1.6), k = ease.inOut(t / info.dur);
  const cam = { z: 2.1 + 0.12 * k, x: lerp(250, 300, k), y: 150 };
  const GY = apartmentGround(), CX = E.W / 2, sideX = CX + 330, top = GY - 120;
  const pat = (i) => Math.abs(Math.sin(t * 5.2 + i * 1.7)) * (t < tChg + 0.6 ? 1 : 0.2);
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      const pose = posesAt(t, [[0, 'reach'], [tChg + 0.7, 'sad']], 0.5);
      heatActor(c, 'HERO', { x: sideX - 210, y: GY, s: 1.25, facing: 1, pose: breathe(pose, t, 0.6), t, expr: t > tChg + 0.7 ? 'sad' : 'neutral' });
      for (const i of [0, 1]) { const hx = sideX - 70 + i * 90 + Math.sin(t * 2 + i) * 30, hy = top - 18 - pat(i) * 26; heatBlob(c, hx, hy, 38, 22, 0.86, 0.5); heatRect(c, hx - 26, hy - 10, 52, 22, 0.9, 10); }
      heatBlob(c, sideX - 10, top - 4, 180, 30, 0.12 + 0.12 * pat(0), 0.9);       // the table warms a touch where the hands touch it
      // the charger: nothing (cold) — its cable and brick stay purple-black
    }),
    hud: { label: 'THERMAL', temp: t > tChg - 0.3 ? 'CHARGER  21 C' : '34 C  HAND', track: t > tChg - 0.3 ? [(sideX + 60 - E.W / 2 - cam.x) * cam.z + E.W / 2, (top - 14 - E.H / 2 - cam.y) * cam.z + E.H / 2] : null },
  });
  // the charger outline, barely there: a cold black brick (drawn on top so it reads)
  layer(g, cam, 1, (g) => { rr(g, sideX + 34, top - 30, 54, 30, 6); g.fillStyle = '#05010c'; g.fill(); g.strokeStyle = alpha('#5a2a8a', 0.6); g.lineWidth = 1.5; g.stroke(); seg(g, [[sideX + 88, top - 14], [sideX + 160, top - 6], [sideX + 210, top + 40]], 2, alpha('#3a1a5a', 0.7)); });
  chip(g, t, { dur: info.dur - 0.05, str: 'Cold things stay dark', at: tChg + 0.3, x: E.W / 2, y: E.H * 0.86, tone: 'coral', dur: info.dur - 0.05 });
} });

// s010 — "What if you could see in complete darkness?"  TITLE CARD fading up over the night skyline
registerShot('s010', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), up = ease.out(prog(t, 0.0, 1.2));
  backdrop(g, ['#03040a', '#0a0f22', '#141a36']);
  g.save(); g.globalAlpha *= up; FX.stars(g, t, { count: 180, area: [0, 0, E.W, E.H * 0.75] });
  g.save(); g.translate(0, 30 * (1 - k)); FX.skyline(g, { y: E.H * 0.82, color: '#0b0d18', seed: 21 }); g.restore();
  glow(g, E.W / 2, E.H * 0.55, 900, '#ff9a4a', 0.18 * up); g.restore();
  UI.titleCard(g, t, { lines: ['WHAT IF YOU COULD SEE', 'IN COMPLETE DARKNESS?'], dur: info.dur + 0.4, y: E.H * 0.45 });
  FX.dust(g, t, { count: 30, color: '#ffd59a', a: 0.25 });
} });
