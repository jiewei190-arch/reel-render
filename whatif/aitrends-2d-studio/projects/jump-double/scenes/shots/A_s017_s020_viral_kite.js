// A_s017_s020_viral_kite.js — batch A (H1), the viral clip and Mina's kite: s017 Dev films -> the phone UI ticks to a million views,
// s018 giant-face HERO reading the "fake" comments, s019 MINA asks about her kite (lip-synced), s020 the kite rescue with a stumble ("For now").
// Built to QUALITY_BAR.md: moving camera, word-synced acting, blink + idle, parallax, atmosphere, rim light.
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, glow, shake, text, FONTS, rr, seg, circle, poly, linGrad, rng, talkAmount } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { court, courtFg } from '../sets/court.js';
import { apartment } from '../sets/apartment.js';
import { roofs, roofsFg, M2U } from '../sets/roofs.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, pointAndLook, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, jumpShake, jumpCam } from '../sets/jump.js';
import { dayCounter, heightMeter, phone } from '../sets/devices.js';

const sw = (w, st, fb) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m)); return (hit ? hit.start : st + fb) - st; };
const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
const corner = (g, t, keys) => dayCounter(g, t, { x: 230, y: 112, s: 0.5, keys });
function heart(g, x, y, s, col, a) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.moveTo(0, 14); g.bezierCurveTo(-30, -6, -16, -30, 0, -14); g.bezierCurveTo(16, -30, 30, -6, 0, 14); g.fill(); g.restore(); }

// ===================================================================================================
// s017 — "Dev films everything. By dinner, the clip has a million views."  DEV films from the sideline (phone up, court blurred behind), then the
// camera pushes into his phone: the dunk clip loops on the screen while the views tick to 1,000,000 on "million" (gold), hearts float up.
registerShot('s017', { draw(g, t, info) {
  const st = info.shot.start, tFilm = sw('films', st, 0.19), tBy = sw('by', st, 1.45), tMil = sw('million', st, 2.81);
  const into = ease.inOut(prog(t, tBy - 0.5, tBy + 0.2));
  // part 1: DEV filming on the court (fades into the phone)
  if (into < 1) { const cam = camMove(t, info.dur, { z: [1.25, 1.35], x: [-260, -230], y: [-120, -140] });
    blurLayer(g, 7, (c) => court(c, t, cam, { mood: 'dusk', hoopFt: 12, crowd: 0.5 }), null, 1);
    layer(g, cam, 1, (g) => { const o = { x: E.W / 2 - 230 + cam.x - 180, y: E.H * 0.8 + 8, s: 1.9, facing: 1 }, pose = idle(poseAt(t, [[0, 'phone'], [tFilm, 'reach']]), t, 2);
      actor(g, 'DEV', { ...o, pose, expr: exprAt(t, [[0, 'happy'], [tFilm, 'joy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.2), rim: { color: '#ffc68a', dir: [1, -0.4] }, prop: { type: 'phone', glow: '#ffffff' }, t });
      const [hx, hy] = handWorld(o, pose); glow(g, hx + 10, hy - 16, 120, '#9fd8ff', 0.4); circle(g, hx + 26, hy - 30, 7, t % 0.8 < 0.4 ? '#ff3a3a' : '#7a1a1a'); });
    atmos(g, t, cam, { color: '#ffd8b0', far: 18, near: 6 });
    if (into > 0) veil(g, '#0c0a14', into); }
  // part 2: the phone, held in a hand that drifts a little, the clip playing, views ticking
  if (into > 0) { g.save(); g.globalAlpha = into;
    backdrop2(g, t);
    const z = lerp(0.9, 1.0, into), hx = E.W * 0.5 + Math.sin(t * 0.9) * 8, hy = E.H * 0.53 + Math.cos(t * 0.7) * 6;
    g.save(); g.translate(hx, hy); g.scale(z, z); g.translate(-hx, -hy);
    phone(g, t, { x: hx, y: hy, s: 1.22, rot: 0.03 * Math.sin(t * 0.8), views: [0, 1000000], at: tBy, dur: tMil - tBy });
    g.restore();
    for (let i = 0; i < 12; i++) { const u = ((t - tBy) * 0.5 + i / 12) % 1; if (t < tBy) break; heart(g, hx + 260 + Math.sin(i * 2 + t) * 40, hy + 260 - u * 640, 1 + 0.5 * (i % 3), i % 2 ? '#ff4a6a' : '#ff8aa8', 0.9 * Math.sin(u * Math.PI)); }
    g.restore(); }
  chip(g, t, { str: '1,000,000 VIEWS', at: tMil, x: E.W * 0.22, y: E.H * 0.24, dur: info.dur - 0.05 });
  corner(g, t, [[0, 3]]);
} });
function backdrop2(g, t) { blurLayer(g, 18, (c) => apartment(c, t, { z: 1.1, x: -120, y: 0 }, { power: 0.8, mood: 'night' }), null, 1); veil(g, '#0a0812', 0.45); glow(g, E.W * 0.5, E.H * 0.5, 800, '#7fb8ff', 0.15); FX.dust(g, t, { count: 20, color: '#c9d4ff', a: 0.18 }); }

// ===================================================================================================
// s018 — "The comments all say the same thing: fake."  GIANT FACE HERO at dinner, lit by the phone (cool blue rim): delighted -> suspicious -> sheepish
// as he reads; FAKE comment bubbles drift up beside him and a FAKE stamp slams on "fake" (punch in).
registerShot('s018', { draw(g, t, info) {
  const st = info.shot.start, tCom = sw('comments', st, 0.23), tSame = sw('same', st, 1.43), tF = sw('fake', st, 2.15);
  const punch = ease.out(prog(t, tF, tF + 0.1)) * (1 - ease.out(prog(t, tF + 0.1, tF + 0.5)));
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] }); cam.z += 0.05 * punch; { const k = shake(t * 3, 12 * punch, 4, 3); cam.x += k[0]; cam.y += k[1]; }
  blurLayer(g, 16, (c) => apartment(c, t, { z: 1.15, x: 80, y: 0 }, { power: 0.5, mood: 'night' }), null, 1); veil(g, '#06060f', 0.4);
  glow(g, E.W * 0.15, E.H * 0.75, 700, '#7fb8ff', 0.35);                                          // the phone, off-screen lower left
  const f = faceAt(t, [[0, 'delighted'], [tCom + 0.6, 'suspicious'], [tSame, 'suspicious'], [tF, 'sheepish']], 0.16);
  layer(g, cam, 1, (g) => {
    giantFace(g, E.W * 0.58, E.H * 0.56, 330, { who: 'HERO', f: { ...f, look: [-0.6, 0.35] }, rimSide: -1, rimColor: '#9fd0ff', glint: '#bfe4ff', breath: Math.sin(t * 2.2), blink: blinkAmt(t, 3.2, 4), tilt: lerp(-0.02, 0.05, ease.inOut(t / info.dur)) });
    // comment bubbles drifting up on the left (he is reading them)
    const C = ['fake', 'FAKE lol', 'cgi', 'nice edit', 'FAKE', 'wires??'];
    for (let i = 0; i < C.length; i++) { const t0 = tCom + i * 0.32, u = t - t0; if (u < 0) continue; const y = E.H * 0.82 - u * 170, x = E.W * 0.17 + (i % 2) * 70, a = clamp(u * 4) * (1 - prog(u, 2.0, 2.6)); if (a <= 0) continue;
      g.save(); g.globalAlpha = a; rr(g, x - 120, y - 32, 240, 64, 22); g.fillStyle = 'rgba(16,14,28,.88)'; g.fill(); g.strokeStyle = alpha('#9fd0ff', 0.6); g.lineWidth = 3; g.stroke();
      text(g, C[i], x, y + 2, { size: 30, color: /FAKE|fake/.test(C[i]) ? '#ff7a5a' : '#e8e4f4', font: FONTS.ui, weight: 900 }); g.restore(); }
  });
  const sk = ease.outBack(prog(t, tF, tF + 0.25)); if (sk > 0.02) { g.save(); g.translate(E.W * 0.3, E.H * 0.32); g.rotate(-0.16); g.scale(sk * 1.0, sk * 1.0);
    rr(g, -190, -66, 380, 132, 16); g.strokeStyle = '#ff4a3a'; g.lineWidth = 12; g.stroke(); text(g, 'FAKE', 0, 6, { size: 104, color: '#ff4a3a', font: FONTS.title, weight: 700, glow: 18, glowColor: 'rgba(255,74,58,.6)' }); g.restore(); }
  atmos(g, t, cam, { color: '#c9d4ff', far: 18, near: 6 });
  corner(g, t, [[0, 3]]);
} });

// ===================================================================================================
// s019 — "Mina just wants to know one thing. \"Can you get my kite out of the tree?\""  Afternoon on the street: MINA tugs HERO's sleeve, then
// points up at the kite stuck in the big tree on "kite" (eyes first), lip-synced on her quote only; HERO looks up (eyes first, then the body).
registerShot('s019', { draw(g, t, info) {
  const st = info.shot.start, tKnow = sw('know', st, 1.17), tCan = sw('can', st, 2.19), tKite = sw('kite', st, 2.83), tTree = sw('tree', st, 3.53);
  // a medium two-shot that tilts up the tree to the kite on "kite", then settles back toward them
  const up = ease.inOut(prog(t, tKite - 0.1, tKite + 0.75)) * (1 - 0.45 * ease.inOut(prog(t, tTree + 0.1, tTree + 0.8)));
  const cam = camMove(t, info.dur, { z: [1.16, 1.12] }); cam.x += lerp(-150, -470, up); cam.y += lerp(-20, -400, up); cam.z = lerp(cam.z, 0.96, up);
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', kite: 1, ladder: 0 }), GY = R.GY;
  layer(g, cam, 1, (g) => {
    const mx = R.pos.treeX + 560, hx = mx + 220;
    const tug = t < tKnow + 0.6 ? Math.sin(t * 9) * (t > 0.3 ? 1 : 0) : 0;
    const pl = pointAndLook(t, tKite - 0.15, [-0.6, -1], { base: 'stand' });
    const mPose = idle(t < tKite - 0.15 ? { ...POSES.reach, hF: [POSES.reach.hF[0] + tug * 6, POSES.reach.hF[1]] } : pl.pose, t, 2);
    actor(g, 'MINA', { x: mx, y: GY + 22, s: 2.1, facing: 1, pose: mPose, expr: exprAt(t, [[0, 'neutral'], [tCan, 'happy'], [tTree + 0.3, 'smile']]), blink: blinkFlag(t, 2.9, 1),
      look: t < tKite - 0.15 ? lookToward(1, -0.6) : pl.look, talk: talkAmount(st + t, st + tCan - 0.05, st + tTree + 0.35), rim: R.rim, t });
    const up = t > tKite + 0.1, hp = idle(up ? reaction('lookUp', t, tKite + 0.35, 'stand') : POSES.relaxed, t, 5);
    actor(g, 'HERO', { x: hx, y: GY + 18, s: 1.95, facing: -1, pose: hp, expr: exprAt(t, [[0, 'neutral'], [tKnow, 'smile'], [tKite + 0.1, 'surprised'], [tTree, 'smirk']]), blink: blinkFlag(t, 3.4, 5),
      look: up ? lookToward(-0.5, -1) : lookToward(-1, 0.3), rim: R.rim, t });
  });
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: '#fff4c8', far: 26, near: 10 });
  corner(g, t, [[0, 3]]);
} });

// ===================================================================================================
// s020 — "You can. Easily. For now."  KITE RESCUE: a 2 m hop on "can" up into the tree (leaves burst), he grabs the kite on "Easily", drops back
// and lands with a little stumble on "now"; MINA claps. Joy -> worried on "now" (foreshadow). Follow cam; the meter reads 2 m.
registerShot('s020', { draw(g, t, info) {
  const st = info.shot.start, tCan = sw('can', st, 0.35), tEz = sw('easily', st, 0.59), tNow = sw('now', st, 1.27);
  const H = 2 * M2U, opt = { up: Math.max(0.2, tEz - tCan), hang: 0.18, down: Math.max(0.3, tNow - tEz - 0.18), landing: 'thud', recover: 'stumble' }, J = jumpPose(t, tCan, H, opt), T = J.times;
  const cam = jumpCam(t, tCan, H, { ...opt, z: 1.04, x: -520, y: -120, follow: 0.65, lag: 0.08, zoomOut: 0.04, shake: 14 });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', kite: t < tEz ? 1 : 0, ladder: 0 }), GY = R.GY, hx = R.pos.kiteX + 40;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: R.pos.treeX + 560, y: GY + 22, s: 2.1, facing: -1, pose: idle(t < T.tL + 0.1 ? POSES.relaxed : reaction('delight', t, T.tL + 0.1, 'relaxed'), t, 2),
      expr: exprAt(t, [[0, 'awe'], [T.tL + 0.1, 'joy']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-0.6, t < T.tL ? -1 : -0.2), rim: R.rim, t });
    jumpFX(g, t, J, { x: hx, gy: GY + 18, s: 1.95, landing: 'thud' });
    const r = jumper(g, 'HERO', J, { x: hx, gy: GY + 18, s: 1.95, facing: 1, expr: exprAt(t, [[0, 'determined'], [tCan, 'joy'], [tNow, 'worried']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(-0.2, -1), rim: R.rim, t });
    // the kite comes down with him after the grab (diamond, red/yellow, tail)
    if (t >= tEz) { const kx = r.head[0] + 60, ky = r.head[1] - 120; g.save(); g.translate(kx, ky); g.rotate(0.2 * Math.sin(t * 5));
      poly(g, [[0, -70], [44, 0], [0, 80], [-44, 0]], '#d4262e'); poly(g, [[0, -70], [44, 0], [0, 0]], '#f2c21a'); poly(g, [[0, 0], [-44, 0], [0, 80]], '#f2c21a');
      g.strokeStyle = '#fff1e0'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 80); for (let i = 1; i < 8; i++) g.lineTo(Math.sin(i + t * 6) * 16, 80 + i * 22); g.stroke(); g.restore(); }
    // leaves burst out of the canopy on the grab
    const lu = t - tEz; if (lu > 0 && lu < 1.6) { const rr2 = rng(17); for (let i = 0; i < 26; i++) { const a = rr2() * Math.PI * 2, v = 160 + rr2() * 260, x = R.pos.kiteX + Math.cos(a) * v * lu, y = R.pos.kiteY + Math.sin(a) * v * lu + 300 * lu * lu;
      g.save(); g.translate(x, y); g.rotate(lu * 6 + i); g.globalAlpha = 1 - lu / 1.6; g.fillStyle = i % 3 ? '#4f8a3a' : '#7ab84a'; g.beginPath(); g.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
  });
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: '#fff4c8', far: 26, near: 10 });
  heightMeter(g, t, { value: Math.max(0.5, 2 * (t < tCan ? 0.25 : t > T.tL ? 1 : Math.max(0.25, J.lift / H))), marks: [['KITE TREE', 4.2], ['HOOP', 3.05], ['HIGH JUMP', 2.45]] });
  corner(g, t, [[0, 3]]);
} });
