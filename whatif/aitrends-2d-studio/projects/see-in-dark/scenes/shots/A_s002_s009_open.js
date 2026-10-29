// A_s002_s009_open.js — batch A (v2), cold open: s002 apartment walk, s004 giant-face shrug, s006 Biscuit insert, s007 thermal charger,
// s008 title card, s009 the five rule tokens. (s001 s003 s005 are showcase shots in S_showcase.js.) Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake, text, FONTS, rr, seg, circle, poly, linGrad, shade, mix, backdrop, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { thermalView, heatActor, heatBlob, heatRect, whiteOut } from '../sets/thermal.js';
import { chip, darkness } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';

// shot-local seconds of a spoken word; `exact` avoids prefix hits ("you" vs "your")
const sw = (w, st, fb, exact = false) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && (exact ? x.word.toLowerCase().replace(/[^\w']/g, '') === m : x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m))); return (hit ? hit.start : st + fb) - st; };
const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
const toScreen = (x, y, cam) => [(x - E.W / 2 - (cam.x || 0)) * cam.z + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * cam.z + E.H / 2];

// s002 — "Round the coffee table, over the shoe, past the door that always eats your knee."
// Side-on follow cam in the dark flat (moonlight key from the window): HERO strolls past the coffee table, steps high over the shoe on "shoe",
// swerves past a half-open door edge on "door", smug smirk on "knee". Foot phase locked to x.
function s002Normal(g, t, info) {   // the pitch-dark normal view (first ~0.8 s of s002)
  const st = info.shot.start, tShoe = sw('shoe', st, 1.6), tDoor = sw('door', st, 2.6), tKnee = sw('knee', st, 3.7), CX = E.W / 2;
  const V0 = 175, heroX = (u) => CX - 420 - V0 * tShoe + V0 * u;                           // reaches the shoe exactly on "shoe"
  const cam = camMove(t, info.dur, { z: [1.12, 1.18], y: [60, 50] }); cam.x = heroX(t) - CX + 260;
  const A = apartment(g, t, cam, { power: 0 }), GY = A.GY, P = A.pos;
  const doorX = heroX(tDoor) + 120, swerve = Math.sin(prog(t, tDoor - 0.35, tDoor + 0.45) * Math.PI);
  const hop = Math.sin(prog(t, tShoe - 0.28, tShoe + 0.28) * Math.PI);
  layer(g, cam, 1, (g) => {
    // the lone shoe on the floor
    g.save(); g.translate(P.shoeX, GY + 20); g.rotate(-0.12); rr(g, -46, -26, 92, 30, 14); g.fillStyle = '#4a3446'; g.fill(); rr(g, -46, -8, 92, 12, 6); g.fillStyle = '#e8e2d8'; g.fill(); seg(g, [[-10, -22], [14, -22]], 3, '#d8d0c4'); g.restore();
    // the half-open door that "eats your knee": its edge pokes into the walkway; the hero leans round it (door behind him, edge highlit)
    g.fillStyle = '#20182a'; g.fillRect(doorX + 40, GY - 470, 70, 470); g.fillStyle = '#3a2a3a'; g.fillRect(doorX, GY - 460, 46, 460); g.fillStyle = alpha('#cfe0ff', 0.45); g.fillRect(doorX, GY - 460, 5, 460); rr(g, doorX + 12, GY - 250, 20, 50, 8); g.fillStyle = '#c9b38a'; g.fill();
    if (swerve > 0.3) for (let i = 0; i < 3; i++) seg(g, [[doorX - 30, GY - 130 + i * 26], [doorX - 90 - i * 20, GY - 130 + i * 26]], 3, alpha('#e8ecff', 0.4 * swerve));
    const f = { x: heroX(t), y: GY + 30 - hop * 34, s: 1.9, facing: 1, t, rim: A.rim };
    const wk = walkAlong(f.x, f.s, {}).pose, pose = hop > 0.05 ? { ...wk, kF: [wk.kF[0] + 14 * hop, wk.kF[1] - 26 * hop], fF: [wk.fF[0] + 10 * hop, wk.fF[1] - 30 * hop] } : wk;
    actor(g, 'HERO', { ...f, pose, rot: -0.12 * swerve, expr: exprAt(t, [[0, 'neutral'], [tShoe - 0.2, 'smile'], [tKnee, 'smirk']]), blink: blinkFlag(t, 3.3, 4), look: hop > 0.2 ? lookToward(0.6, 0.8) : swerve > 0.2 ? lookToward(1, 0.3) : [1, 0] });
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: '#c9d4ff' });
  const [shx, shy] = toScreen(P.shoeX, GY + 4, cam); if (t < tShoe + 1.4) UI.callout(g, t, { at: [shx, shy], to: [shx + 140, shy - 260], str: 'SHOE', start: tShoe - 0.1 });
}
registerShot('s002', { draw(g, t, info) {
  const st = info.shot.start, tShoe = sw('shoe', st, 1.6), tDoor = sw('door', st, 2.6), tKnee = sw('knee', st, 3.7), CX = E.W / 2, GY = apartmentGround();
  const tFlip = Math.max(0.8, sw('round', st, 0.15) + 0.65);
  if (t < tFlip) { s002Normal(g, t, info); darkness(g, 0.55, { x: E.W * 0.38, y: E.H * 0.55, r: 700 }); whiteOut(g, ease.in(prog(t, tFlip - 0.12, tFlip)) * 0.9); return; }
  // THERMAL POV: the camera is the hero's eyes, gliding round the coffee table; the shoe is faintly warm (worn), the door edge is cold
  const u = t - tFlip, k = ease.inOut(prog(t, tFlip, info.dur));
  const cam = { z: 1.55 + 0.08 * k + Math.sin(t * 5.6) * 0.004, x: lerp(-560, 120, k) + Math.sin(t * 5.6) * 6, y: 150 + Math.abs(Math.sin(t * 5.6)) * 5, r: Math.sin(t * 0.9) * 0.01 };
  const shoeX = CX - 420, doorScr = key(t, [[tDoor - 0.5, E.W + 300], [tDoor + 0.6, -400]], ease.inOut);
  thermalView(g, t, {
    cold: (c) => { apartment(c, t, cam, { power: 0 });
      if (t > tDoor - 0.6 && t < tDoor + 0.8) { c.fillStyle = '#4a4a5a'; c.fillRect(doorScr, -40, 150, E.H + 80); c.fillStyle = '#6a6a7a'; c.fillRect(doorScr, -40, 14, E.H + 80); } },     // the door edge sliding past, close to the lens (cold)
    hot: (c) => {
      layer(c, cam, 1, (c) => { heatRect(c, shoeX - 46, GY - 6, 92, 30, 0.42 + 0.12 * ease.out(prog(t, tShoe - 0.1, tShoe + 0.3)), 14); heatBlob(c, shoeX, GY + 8, 80, 26, 0.25, 0.9); });   // the shoe, still a bit warm
      for (const sd of [-1, 1]) { const ph = Math.sin(t * 5.6 + (sd > 0 ? Math.PI : 0)); heatBlob(c, E.W * 0.5 + sd * 470 + ph * 30, E.H - 20 - Math.max(0, ph) * 60, 130, 100, 0.85, 0.5); }      // own hands swinging at the bottom edge
    },
    hud: { label: 'THERMAL', temp: t > tShoe - 0.1 && t < tDoor - 0.3 ? '27 C  SHOE' : null, track: t > tShoe - 0.1 && t < tDoor - 0.3 ? toScreen(shoeX, GY + 4, cam) : null },
  });
  whiteOut(g, (1 - ease.out(prog(u, 0, 0.35))) * 0.9);
  chip(g, t, { str: 'Door: dodged', at: tDoor + 0.1, x: E.W * 0.5, y: E.H * 0.86, tone: 'blue', dur: info.dur - 0.05 });
  if (t > tKnee) FX.sparkle(g, E.W * 0.2, E.H * 0.5, 22 * Math.sin(prog(t, tKnee, info.dur) * Math.PI), '#ffe9b0', 0.8);
} });

// s004 — "she asks, and you shrug, because honestly, you have no idea."  GIANT FACE: neutral -> sheepish on "shrug" -> cheeky on "idea"
registerShot('s004', { draw(g, t, info) {
  const st = info.shot.start, tShrug = sw('shrug', st, 1.2), tIdea = sw('idea', st, 3.6), tHon = sw('honestly', st, 2.3);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [10, -10] });
  blurLayer(g, 16, (c) => apartment(c, t, { ...cam, x: cam.x - 300 }, { power: 0 }), null, 1); veil(g, '#05060f', 0.4);
  FX.lightCone(g, -60, E.H * 0.45, { angle: 0.05, spread: 0.6, len: 1500, color: '#e8f0ff', a: 0.16 });       // Mina's phone torch from screen-left
  const f = faceAt(t, [[0, 'neutral'], [tShrug, 'sheepish'], [tHon, { eye: 0.8, brow: 0.6, tilt: -0.4, smile: 0.1, look: [0.5, -0.5], w: 0.8 }], [tIdea, 'cheeky']], 0.18);
  const lift = ease.outBack(prog(t, tShrug - 0.05, tShrug + 0.3)) * (1 - ease.inOut(prog(t, tShrug + 0.9, tShrug + 1.4)));
  layer(g, cam, 1, (g) => {
    giantFace(g, E.W * 0.5, E.H * 0.56 - lift * 26, 320, { who: 'HERO', f, rimSide: -1, rimColor: '#e8f0ff', blink: blinkAmt(t, 3.2, 1), breath: Math.sin(t * 2.1), tilt: lerp(0, -0.07, lift) + Math.sin(t * 0.8) * 0.015 });
    glow(g, E.W * 0.18, E.H * 0.45, 300, '#e8f0ff', 0.12);
  });
  atmos(g, t, cam, { color: '#e8f0ff' });
} });

// s006 — "Biscuit the cat blinks down at you from the fridge like you've insulted her."  low-angle creature insert on the fridge top
registerShot('s006', { draw(g, t, info) {
  const st = info.shot.start, tBlink = sw('blinks', st, 0.8), tIns = sw('insulted', st, 2.2);
  const GY = apartmentGround(), CX = E.W / 2, fx = CX + 640, ftop = GY - 440;
  const cam = camMove(t, info.dur, { z: [1.85, 1.95], y: [-200, -225] }); cam.x += fx - CX - 40;
  const A = apartment(g, t, cam, { power: 0 });
  const eyes = t < tBlink ? 'open' : t < tBlink + 0.32 ? 'blink' : t < tIns ? (t > tIns - 0.5 ? 'wide' : 'open') : ((t - tIns) % 2.4 < 0.1 ? 'blink' : 'offended');
  layer(g, cam, 1, (g) => {
    // fridge magnets + a kid's drawing on the door (frame dressing)
    rr(g, fx - 70, ftop + 70, 90, 70, 4); g.fillStyle = '#e8e2d0'; g.fill(); seg(g, [[fx - 60, ftop + 120], [fx - 40, ftop + 90], [fx - 20, ftop + 118]], 3, '#d4262e'); circle(g, fx + 2, ftop + 86, 8, '#ffd24a');
    for (const [dx, dy, c] of [[50, 90, '#2f6fd0'], [70, 150, '#3aa05a'], [-90, 180, '#f08a24']]) circle(g, fx + dx, ftop + dy, 9, c);
    cat(g, { x: fx + 10, y: ftop - 2, s: 2.6, facing: -1, pose: 'sit', eyes, t, tilt: t > tIns ? -0.06 : Math.sin(t * 1.4) * 0.04, rim: { color: A.rim.color, dir: [-0.4, -1] } });
  });
  // blurred pendant lamp in the foreground (top-left)
  blurLayer(g, 9, (g) => { seg(g, [[E.W * 0.12, -20], [E.W * 0.12, E.H * 0.16]], 6, '#1a1622'); poly(g, [[E.W * 0.05, E.H * 0.3], [E.W * 0.19, E.H * 0.3], [E.W * 0.15, E.H * 0.16], [E.W * 0.09, E.H * 0.16]], '#2a2433'); }, null, 1);
  atmos(g, t, cam, { color: '#c9d4ff' });
} });

// s007 — "And you still can't find your phone charger. So,"  THERMAL insert: glowing hands pat a cold side table; the charger is invisible; head shake on "charger"
registerShot('s007', { draw(g, t, info) {
  const st = info.shot.start, tChg = sw('charger', st, 1.45), CX = E.W / 2, GY = apartmentGround(), sideX = CX + 330, top = GY - 120;
  const up = ease.inOut(prog(t, tChg - 0.3, tChg + 0.5));
  const cam = { z: lerp(2.4, 1.6, up), x: lerp(sideX - CX - 40, sideX - CX - 160, up) + Math.sin(t * 0.7) * 6, y: lerp(top - E.H / 2 + 20, GY - 260 - E.H / 2, up) };
  const pat = (i) => Math.abs(Math.sin(t * 5.4 + i * 1.9)) * (1 - up * 0.8);
  const shakeHead = t > tChg ? Math.sin((t - tChg) * 16) * 10 * (1 - prog(t, tChg + 0.9, tChg + 1.4)) : 0;
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      const pose = poseAt(t, [[0, 'reach'], [tChg - 0.1, 'stand']], 0.35); pose.head = [pose.head[0] + shakeHead, pose.head[1]];
      heatActor(c, 'HERO', { x: sideX - 240, y: GY, s: 1.9, facing: 1, pose: idle(pose, t, 2), t, expr: t > tChg ? 'sad' : 'neutral' });
      for (const i of [0, 1]) { const hx = sideX - 60 + i * 110 + Math.sin(t * 2.1 + i * 2) * 40, hy = top - 16 - pat(i) * 30; heatBlob(c, hx, hy, 44, 26, 0.9, 0.5); heatRect(c, hx - 30, hy - 12, 60, 26, 0.92, 12); }
      heatBlob(c, sideX + 10, top, 210, 26, 0.18, 0.9);                   // the tabletop warms faintly where the hands touch it; the charger: nothing (cold)
    }),
    hud: { label: 'THERMAL', temp: up < 0.5 ? 'CHARGER  21 C' : '37 C', track: up < 0.5 ? toScreen(sideX + 120, top - 14, cam) : toScreen(sideX - 240, GY - 210 * 1.9 + 10, cam) },
  });
  chip(g, t, { str: 'CHARGER: NOT FOUND', at: Math.max(0.35, tChg - 0.4), x: E.W * 0.5, y: E.H * 0.86, tone: 'coral', dur: info.dur - 0.05 });
} });

// s008 — "what if you could see in complete darkness? Stay with me,"  TITLE over the night skyline that warms into thermal colours
registerShot('s008', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), heatK = ease.inOut(prog(t, 0.4, 2.6)), z = 1 + 0.05 * k;
  backdrop(g, ['#03040a', '#0a0f22', '#141a36']);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  FX.stars(g, t, { count: 200, area: [0, 0, E.W, E.H * 0.7] });
  // thermal bloom rising behind the skyline (purple -> magenta -> orange)
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, E.H * 0.45, 0, E.H, [alpha('#540078', 0), alpha('#b81250', 0.45 * heatK), alpha('#ff9600', 0.5 * heatK)]); g.fillRect(0, E.H * 0.45, E.W, E.H * 0.55); g.restore();
  FX.skyline(g, { y: E.H * 0.84, color: mix('#0b0d18', '#2a0838', heatK), seed: 21 });
  const r = rng(31); for (let i = 0; i < 46; i++) { const x = r() * E.W, y = E.H * (0.64 + r() * 0.18); glow(g, x, y, 18, mix('#ffcf8a', '#ffe448', heatK), 0.35 + 0.3 * Math.sin(t * 2 + i)); }   // warm windows
  g.restore();
  UI.titleCard(g, t, { lines: ['WHAT IF YOU COULD SEE', 'IN COMPLETE DARKNESS?'], dur: info.dur + 0.4, y: E.H * 0.42 });
  FX.dust(g, t, { count: 34, color: '#ffd59a', a: 0.28 }); FX.dust(g, t * 1.6, { count: 10, color: '#ffb070', a: 0.35, seed: 7, size: 3 });
} });

// s009 — "because there are five rules, and the fifth one decides whether you find her."
// Five gold rule tokens drop onto a dark shelf on "five rules"; token 5 rattles on "fifth" and its glow shrinks to one white spark; on "her" Mina's silhouette flickers in the rain behind it.
function token(g, n, x, y, s, a, glowK) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
  glow(g, 0, -60, 170, '#ffb84a', 0.25 * glowK);
  for (let d = 12; d >= 1; d--) text(g, String(n), d * 1.2, -60 + d * 1.6, { size: 190, color: shade('#c98a1c', -0.35 - d * 0.02), font: FONTS.title, weight: 700 });   // extrusion
  text(g, String(n), 0, -60, { size: 190, color: '#ffd47e', font: FONTS.title, weight: 700, stroke: 10, strokeColor: '#3a2408', glow: 26 * glowK, glowColor: 'rgba(255,170,80,.85)' });
  g.restore();
}
registerShot('s009', { draw(g, t, info) {
  const st = info.shot.start, tFive = sw('five', st, 0.7), tFifth = sw('fifth', st, 1.8), tHer = sw('her', st, 3.4, true);
  const cam = camMove(t, info.dur, { z: [1.0, 1.22], x: [-40, 330], y: [0, 30] });
  backdrop(g, ['#05060f', '#0b0f20', '#06070e']);
  layer(g, cam, 0.4, (g) => { const mk = ease.inOut(prog(t, tHer - 0.5, tHer + 0.3)); if (mk > 0) { g.save(); g.globalAlpha *= mk * (0.6 + 0.4 * Math.abs(Math.sin(t * 9))); glow(g, E.W * 0.82, E.H * 0.5, 380, '#d4262e', 0.18); actor(g, 'MINA', { x: E.W * 0.82, y: E.H * 1.02, s: 3.8, facing: -1, pose: idle(POSES.sad, t, 3), expr: 'worried', rim: { color: '#ff5a5a', dir: [-1, -0.3] }, t, blink: blinkFlag(t, 2.9, 2), alpha: 0.85 }); g.restore(); FX.rain(g, t, { count: 120, a: 0.25 * mk }); } });
  layer(g, cam, 1, (g) => {
    const sy = E.H * 0.6; rr(g, 120, sy, 1680, 34, 8); g.fillStyle = '#2a1e18'; g.fill(); g.fillStyle = alpha('#ffcf8a', 0.25); g.fillRect(120, sy, 1680, 4);   // the shelf
    for (let i = 0; i < 5; i++) {
      const t0 = tFive - 0.15 + i * 0.22, d = ease.outBack(prog(t, t0, t0 + 0.35)), x = 330 + i * 330, y = sy - (1 - d) * 420;
      if (d <= 0.01) continue;
      let rx = 0, gk = 1; if (i === 4 && t > tFifth - 0.1) { rx = Math.sin((t - tFifth) * 40) * 7 * (1 - prog(t, tFifth + 0.6, tFifth + 1.0)); gk = 1 - ease.inOut(prog(t, tFifth + 0.2, tFifth + 1.1)); }
      token(g, i + 1, x + rx, y, 1.3, clamp(d * 2), i === 4 ? gk : 0.8);
      if (i === 4 && t > tFifth + 0.3) { const sp = ease.out(prog(t, tFifth + 0.3, tFifth + 1.0)), pulse = t > tHer ? 1 + 0.5 * Math.abs(Math.sin((t - tHer) * 6)) : 1; glow(g, x, y - 270, 90 * sp * pulse, '#ffffff', 0.8); circle(g, x, y - 270, 9 * sp * pulse, '#ffffff'); FX.sparkle(g, x, y - 270, 30 * sp * pulse, '#ffffff', 0.9); }
    }
  });
  atmos(g, t, cam, { color: '#ffd59a' });
} });
