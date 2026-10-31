// E_s112_s123_last_morning.js — ep 5 batch E (343.95-380.76): LEVEL 30 THE LAST MORNING: day 30 breakfast hush, the Zip, LV 29 -> 30,
// 32,508 -> 40,960 kg 'OVER 40 t', the biggest LEVEL UP!, the card flips: "Trial over. Levels returned.", giant face HERO back to 40 kg,
// Dev stops filming, the blink, STR 40 -> 44 '+4 kg', the memory of the night park, RULE 1 chip, the card zips away, the tiny Zip over
// Biscuit + her mini card LV 1. LEGAL: STYLE.md DON'T list (no series names, no System/Player/Quest words, no portals, eyes never glow).
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, text, FONTS, rr, seg, circle } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { home3, home3Fg } from '../sets/home3.js';
import { park, parkFg } from '../sets/park.js';
import { PAL, zip, zipOpen, statCard, roll, levelSpin, xpFill, levelUp, levelFlash, levelShake, freeze, sparks, miniCard } from '../sets/statcard.js';
import { bloom, nightGrade, steamAura, speedLines5, slowMo } from '../sets/fx5.js';
import { sw, hero, handAt, bowl, spoon, mug, CYAN } from './A_lib.js';

const KIT = (g, t, cam, o = {}) => { const H = home3(g, t, cam, { room: 'kitchen', mood: 'dawn', cereal: 0, plate: 0, ...o }); return { H, P: H.pos, GY: H.GY ?? E.H * 0.8, CX: H.CX ?? E.W / 2 }; };
// the giant pumpkin from the truck (on the counter / on one finger)
export function pumpkin(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 150, 18, 0, 0, 7); g.fill();
  for (const [dx, w, c] of [[-90, 80, '#d8641c'], [90, 80, '#d8641c'], [-45, 85, '#ee7a26'], [45, 85, '#ee7a26'], [0, 80, '#f58a30']]) { g.fillStyle = c; g.beginPath(); g.ellipse(dx, -100, w, 102, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-30, -150, 30, 40, -0.3, 0, 7); g.fill();
  rr(g, -12, -230, 24, 40, 8); g.fillStyle = '#5a7a2a'; g.fill(); g.restore();
}
const SIT = { ...POSES.sit, eF: [40, -126], hF: [66, -142] };
// the cast around the breakfast table (dawn): HERO sitting, MINA + DEV standing, Biscuit on the windowsill
function table(g, t, K, o = {}) {
  const { P, GY, CX } = K;
  bowl(g, P.tableX, P.tableTop - 6, 1); pumpkin(g, P.counterL + 260, P.counterTop, 0.55);
  const hp = idle(o.heroPose || SIT, t, 2), ho = { x: P.tableX - 190, y: GY, s: 1.9, facing: 1 };
  hero(g, { ...ho, pose: hp, expr: o.heroExpr || 'neutral', blink: blinkFlag(t, 3.4, 2), look: o.look || lookToward(1, -0.5), t });
  const hd = handAt(ho, hp, 'F'); spoon(g, hd[0], hd[1], 0.15, 1.05);
  actor(g, 'MINA', { x: P.tableX + 250, y: GY, s: 2.0, facing: -1, pose: idle(POSES.stand, t, 3), expr: o.minaExpr || 'neutral', blink: blinkFlag(t, 2.9, 3), look: o.look2 || lookToward(-1, -0.6), t });
  const dp = idle(o.devPose || POSES.phone, t, 4), dO = { x: P.tableX + 520, y: GY, s: 1.9, facing: -1 };
  actor(g, 'DEV', { ...dO, pose: dp, expr: o.devExpr || 'neutral', blink: blinkFlag(t, 3.1, 5), look: o.look2 || lookToward(-1, -0.5), t });
  const ph = handAt(dO, dp, 'F'); rr(g, ph[0] - 16, ph[1] - 50, 32, 56, 6); g.fillStyle = '#16121c'; g.fill(); if ((o.rec ?? 1) > 0.5 && Math.floor(t * 2) % 2 === 0) circle(g, ph[0] + 6, ph[1] - 40, 4, '#ff3b30');
  if (o.cat !== false) cat(g, { x: CX - 760, y: GY - 468, s: 1.6, facing: 1, pose: 'loaf', t, eyes: o.catEyes || 'auto' });
  return { zipX: P.tableX, zipY: P.tableTop - 150 };
}

// s112 — "Day thirty. Breakfast."  LEVEL 30 THE LAST MORNING: dawn kitchen, the giant pumpkin on the counter; everyone watching the air above
// the bowl on 'Breakfast.' (the hush). Slow push.
registerShot('s112', { draw(g, t, info) {
  const st = info.shot.start, tB = sw('breakfast', st, 1.51);
  const cam = camMove(t, info.dur, { z: [0.96, 1.04], x: [20, 40], y: [-40, -50] });
  const K = KIT(g, t, cam);
  layer(g, cam, 1, (g) => { const w = t > tB; table(g, t, K, { heroExpr: w ? 'surprised' : 'neutral', minaExpr: w ? 'awe' : 'neutral', devExpr: w ? 'surprised' : 'happy', catEyes: w ? 'wide' : 'auto', look: lookToward(0.8, w ? -0.2 : -0.6) }); });
  home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#ffd8a8' });
  chip(g, t, { str: 'LEVEL 30: THE LAST MORNING', at: sw('day', st, 0.17), x: 400, y: 110, dur: info.dur });
} });

// s113 — "The air unzips, and the screen floats out."  close on the bowl: the Zip opens on 'unzips,' with gold sparks; the Stat Card unfolds
// out on 'screen'-'out.', bigger and brighter than ever; cyan light on the faces at the frame edge.
registerShot('s113', { draw(g, t, info) {
  const st = info.shot.start, tU = sw('unzips', st, 0.44), tS = sw('screen', st, 1.20), tO = sw('out', st, 1.76);
  const tx = E.W / 2 - 60, ty = E.H * 0.8 - 250, z = lerp(1.4, 1.5, t / info.dur), cam = { z, x: tx - E.W / 2 + 80, y: ty - 330 - E.H / 2 + 120, r: 0 };
  blurLayer(g, 7, (g) => KIT(g, t, cam), null, 1);
  const K = { P: { tableX: tx, tableTop: ty, counterL: E.W / 2 - 1150, counterTop: E.H * 0.8 - 300 }, GY: E.H * 0.8, CX: E.W / 2 };
  layer(g, cam, 1, (g) => {
    const B = table(g, t, K, { heroExpr: 'awe', minaExpr: 'awe', devExpr: 'awe', cat: false });
    const zo = zipOpen(t, tU), Z = zip(g, t, B.zipX, B.zipY, { w: 300, open: zo, seam: 1 }); sparks(g, t, tU, B.zipX, B.zipY, { n: 22, s: 0.8, seed: 3 });
    statCard(g, t, { x: B.zipX + 40, y: B.zipY - 230, s: 0.9, from: Z.mouth, unfold: ease.out(prog(t, tS, tO)), lv: 29, str: 32508, xp: 0.6 });
    glow(g, B.zipX, B.zipY - 160, 520, CYAN, 0.22 * ease.out(prog(t, tS, tO)));
  });
} });

// s114 — "Level thirty. Over forty tonnes."  close on the card: badge flips 29 -> 30 on 'thirty.'; the STR odometer rolls to gold
// '40,960 kg' on 'tonnes.'; gold chip 'OVER 40 t'; the XP bar fills; a touch of slow-mo.
registerShot('s114', { draw(g, t, info) {
  const st = info.shot.start, tTh = sw('thirty', st, 0.40), tTo = sw('tonnes', st, 2.56), ts = slowMo(t, { at: 1.6, dur: 1.0, factor: 0.6 });
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  blurLayer(g, 9, (g) => KIT(g, t, cam), null, 1); veil(g, '#0b0f1a', 0.3);
  const sp = levelSpin(ts, tTh, 0.5);
  layer(g, cam, 1, (g) => {
    const C = statCard(g, ts, { x: E.W / 2, y: E.H * 0.5, s: 1.35, tilt: -0.04, lv: sp >= 0.5 ? 30 : 29, lvPrev: 29, spin: sp > 0 && sp < 1 ? sp : 0, str: roll(ts, 32508, 40960, 1.58, 1.2), xp: lerp(0.6, 0.96, ease.inOut(prog(ts, 0.3, 2.6))) });
    if (C) { sparks(g, t, tTh, C.badge[0], C.badge[1], { n: 26, s: 1, seed: 8 }); const q = ease.out(prog(t, tTo, tTo + 0.25)); if (q > 0) glow(g, C.str[0], C.str[1], 160, PAL.gold, 0.55 * q * (1 - prog(t, tTo + 0.5, tTo + 1))); }
  });
  chip(g, t, { str: 'OVER 40 t', at: tTo, x: E.W * 0.5, y: E.H * 0.82, dur: info.dur });
} });

// s115 — ""LEVEL UP!" Then it flips over."  THE BIGGEST POP: the bar snaps, LEVEL UP! s 1.2, freeze 6 frames, shake, gold focus lines, the flash
// LAST; on 'flips' the card spins over like a coin to show a plain glass back.
function cardBack(g, t, x, y, s, o = {}) {
  const w = 808, h = 300; g.save(); g.translate(x, y + Math.sin(t * 1.7) * 7); g.rotate(-0.04); g.scale(s * (o.sx ?? 1), s);
  glow(g, 0, 0, w * 0.7, CYAN, 0.18 * (o.glow ?? 1));
  rr(g, -w / 2, -h / 2, w, h, h * 0.18); g.fillStyle = alpha(PAL.glass, 0.6); g.fill();
  g.save(); g.shadowColor = CYAN; g.shadowBlur = 18 * (o.glow ?? 1); g.strokeStyle = alpha(CYAN, 0.6 + 0.4 * (o.glow ?? 1)); g.lineWidth = 4; g.stroke(); g.restore();
  g.fillStyle = alpha('#ffffff', 0.06); g.beginPath(); g.moveTo(-w / 2 + 40, -h / 2); g.lineTo(-w / 2 + 220, -h / 2); g.lineTo(-w / 2 + 40, h / 2 - 20); g.closePath(); g.fill();
  o.content?.(g);
  g.restore();
}
registerShot('s115', { draw(g, t, info) {
  const st = info.shot.start, at = 0.13, tFl = sw('flips', st, 1.73), tf = freeze(t, at, 6), sh = levelShake(t, at, 3);
  const cam = camMove(tf, info.dur, { z: [1.02, 1.08] }); cam.x += sh[0]; cam.y += sh[1];
  blurLayer(g, 8, (g) => KIT(g, tf, cam), null, 1); veil(g, '#0b0f1a', 0.35);
  speedLines5(g, tf, { mode: 'focus', cx: E.W / 2, cy: E.H * 0.6, color: PAL.gold, a: 0.55 * clamp((tf - at) * 4) * (1 - prog(tf, 1.4, 1.8)), inner: 560 });
  layer(g, cam, 1, (g) => {
    const f = prog(t, tFl, tFl + 0.4), sx = Math.cos(f * Math.PI);
    if (sx >= 0) { g.save(); g.translate(E.W / 2, E.H * 0.62); g.scale(Math.max(0.02, sx), 1); g.translate(-E.W / 2, -E.H * 0.62); const X = xpFill(tf, { from: 0.96, to: 1, at0: 0, at1: 0.1, snap: 0.12 }); statCard(g, tf, { x: E.W / 2, y: E.H * 0.62, s: 1.0, lv: 30, str: 40960, xp: X.xp, xpSnap: X.xpSnap }); g.restore(); }
    else cardBack(g, t, E.W / 2, E.H * 0.62, 1.0, { sx: -sx });
    levelUp(g, tf, at, { x: E.W / 2, y: E.H * 0.28, s: 1.2, hold: 1.4 });
  });
  levelFlash(g, t, at, { a: 0.8 });
} });

// s116 — ""Trial over. Levels returned.""  the BACK of the card: cream 'Trial over.' types on on 'Trial', 'Levels returned.' on 'Levels'; the
// cyan glow dims a notch on 'returned.'; dutch angle, slow push.
registerShot('s116', { draw(g, t, info) {
  const st = info.shot.start, tT = sw('trial', st, 0.15), tL = sw('levels', st, 1.66), tR = sw('returned', st, 1.97);
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], r: [0, 0.04] });
  blurLayer(g, 10, (g) => KIT(g, t, cam), null, 1); veil(g, '#0b0f1a', 0.4);
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(cam.r); g.translate(-E.W / 2, -E.H / 2);
  const type = (s, a, cps = 22) => s.slice(0, Math.max(0, Math.floor((t - a) * cps)));
  cardBack(g, t, E.W / 2, E.H * 0.5, 1.6, { glow: 1 - 0.45 * ease.out(prog(t, tR, tR + 0.4)), content: (g) => {
    text(g, type('Trial over.', tT), 0, -48, { size: 64, color: '#fbf3dc', font: FONTS.ui, weight: 800 });
    text(g, type('Levels returned.', tL), 0, 48, { size: 64, color: '#fbf3dc', font: FONTS.ui, weight: 800 }); } });
  g.restore();
} });

// s117 — "You're back to forty kilos."  GIANT FACE HERO: shocked -> worried, shoulders drop; beside him the card (front again) rolls its STR
// odometer DOWN to gold '40 kg' on 'forty'-'kilos.', the badge flipping to '0'. Cool, dimmer key light.
registerShot('s117', { draw(g, t, info) {
  const st = info.shot.start, tF = sw('forty', st, 0.69), tK = sw('kilos', st, 0.97);
  const cam = camMove(t, info.dur, { z: [1.0, 1.03] });
  blurLayer(g, 12, (g) => KIT(g, t, cam, { mood: 'dawn' }), null, 1); veil(g, '#1a2236', 0.35);
  const cx = E.W * 0.36, cy = E.H * 0.55, r = 300, drop = ease.inOut(prog(t, tF, tK + 0.4)) * 30;
  giantFace(g, cx, cy + drop, r, { who: 'HERO', f: faceAt(t, [[0, 'shocked'], [tF, 'worried']]), rimColor: '#9ab8ff', rimSide: 1 });
  rr(g, cx + r * 0.1, cy + drop + r * 1.1, 14, 34, 5); g.fillStyle = CYAN; g.fill();
  const sp = levelSpin(t, tF, 0.45);
  statCard(g, t, { x: E.W * 0.76, y: E.H * 0.42, s: 0.85, lv: sp >= 0.5 ? 0 : 30, lvPrev: 30, spin: sp > 0 && sp < 1 ? sp : 0, str: roll(t, 40960, 40, 0.49, 0.6), xp: 0 });
  const q = ease.out(prog(t, tK, tK + 0.2)); if (q > 0) glow(g, E.W * 0.76 + 80, E.H * 0.42, 140, PAL.gold, 0.45 * q);
} });

// s118 — "Dev stops filming. Then the screen blinks once more."  kitchen two-shot: DEV slowly lowers his phone on 'stops' (REC off), sad;
// quiet; on 'blinks' the half-faded card above the bowl flickers back on (on-off-on) and every head turns to it on 'more.'
registerShot('s118', { draw(g, t, info) {
  const st = info.shot.start, tSt = sw('stops', st, 0.27), tBl = sw('blinks', st, 2.39), tM = sw('more', st, 2.95);
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], x: [60, 70], y: [-40, -40] });
  const K = KIT(g, t, cam), P = K.P;
  layer(g, cam, 1, (g) => {
    const low = ease.inOut(prog(t, tSt, tSt + 1.2)), dp = blendPose(POSES.phone, POSES.phoneLow || POSES.stand, low);
    const turn = t > tM ? lookToward(-0.5, -0.8) : lookToward(-1, 0.1);
    table(g, t, K, { heroExpr: t > tM ? 'surprised' : 'sad', minaExpr: t > tM ? 'surprised' : 'sad', devExpr: t > tM ? 'surprised' : 'sad', devPose: dp, rec: 1 - low, look: t > tM ? lookToward(0.8, -0.8) : lookToward(1, 0.3), look2: turn });
    const fl = t < tBl ? 0.25 : (t < tBl + 0.12 ? 1 : t < tBl + 0.3 ? 0.2 : 1);
    g.save(); g.globalAlpha *= fl; statCard(g, t, { x: P.tableX + 40, y: P.tableTop - 330, s: 0.75, lv: 0, str: 40, xp: 0 }); g.restore();
    if (t > tBl) glow(g, P.tableX + 40, P.tableTop - 330, 300, CYAN, 0.2 * fl);
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// s119 — ""Strength, forty-four." Four extra kilos."  close on the card front: STR ticks 40 -> 44 on 'forty-four.'; a gold '+4 kg' chip pops
// on 'Four' and pulses on 'kilos.'; HERO's face in the soft background lights up.
registerShot('s119', { draw(g, t, info) {
  const st = info.shot.start, tF = sw('four', st + 1.6, 2.02), tK = sw('kilos', st, 2.57);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] });
  blurLayer(g, 9, (g) => { KIT(g, t, cam); layer(g, cam, 1, (g) => { const P = { tableX: E.W / 2 - 60 }; giantFace(g, P.tableX - 260, E.H * 0.42, 190, { who: 'HERO', f: faceAt(t, [[0, 'worried'], [0.5, 'awe'], [tF, 'delighted']]) }); }); }, null, 1);
  veil(g, '#0b0f1a', 0.25);
  const C = statCard(g, t, { x: E.W * 0.56, y: E.H * 0.52, s: 1.3, tilt: -0.04, lv: 0, str: roll(t, 40, 44, 0.15, 0.6), xp: 0.04 });
  if (C) { const p = ease.outBack(prog(t, tF, tF + 0.35)), pu = 1 + 0.12 * Math.max(0, Math.sin((t - tK) * 10)) * (t > tK && t < tK + 0.6 ? 1 : 0); if (p > 0) { g.save(); g.translate(C.str[0] + 330, C.str[1] - 120); g.scale(p * pu, p * pu); rr(g, -110, -40, 220, 80, 40); g.fillStyle = alpha('#0b1324', 0.92); g.fill(); g.strokeStyle = PAL.gold; g.lineWidth = 3; g.stroke(); text(g, '+4 kg', 0, 2, { size: 46, color: PAL.gold, font: FONTS.ui, weight: 900, glow: 12, glowColor: alpha(PAL.gold, 0.6) }); g.restore(); } }
} });

// s120 — "Not from the screen. From those nights in the park."  inset: the card's glow crossed out by a soft cream line on 'Not'; on 'From'
// the night park: HERO doing push-ups under the sodium streetlight, MINA timing, DEV filming with his ring light, breath steaming.
const PLANK = (k) => ({ head: [-112, -38 - k * 10], sh: [-80, -36 - k * 12], hip: [0, -30 - k * 6], eF: [-80, -18 + k * 2], hF: [-84, 0], eB: [-74, -18], hB: [-78, 0], kF: [50, -18], fF: [100, 0], kB: [52, -16], fB: [102, 0] });
registerShot('s120', { draw(g, t, info) {
  const st = info.shot.start, tN = sw('not', st, 0.14), tFr = sw('from', st + 1.0, 1.76);
  if (t < tFr) {
    blurLayer(g, 10, (g) => KIT(g, t, { z: 1.05, x: 0, y: -40, r: 0 }), null, 1); veil(g, '#0b0f1a', 0.3);
    statCard(g, t, { x: E.W / 2, y: E.H * 0.5, s: 1.1, lv: 0, str: 44, xp: 0 });
    const k = ease.out(prog(t, tN, tN + 0.5)); if (k > 0) { g.save(); g.globalAlpha = 0.85; seg(g, [[E.W / 2 - 460, E.H * 0.5 + 140], [lerp(E.W / 2 - 460, E.W / 2 + 460, k), lerp(E.H * 0.5 + 140, E.H * 0.5 - 140, k)]], 16, '#fbf3dc'); g.restore(); }
    return;
  }
  const u = t - tFr, cam = camMove(u, info.dur - tFr, { z: [1.0, 1.04], x: [-120, -100], y: [-20, -20] });
  const Pk = park(g, t, cam, { season: 'autumn', mood: 'night', bench: true }), GY = Pk.GY, hx = (Pk.pos.benchX ?? E.W / 2 - 520) + 380;
  layer(g, cam, 1, (g) => {
    glow(g, hx + 60, GY - 700, 420, '#FF9F43', 0.28);
    const k = 0.5 + 0.5 * Math.sin(t * 4.2);
    hero(g, { x: hx, y: GY + 10, s: 1.9, facing: 1, pose: PLANK(k), expr: 'determined', blink: blinkFlag(t, 3.4, 2), look: lookToward(-1, 0.2), t, rim: { color: '#FF9F43', dir: [0.3, -1] } });
    steamAura(g, t, { x: hx - 40, y: GY + 10, h: 220, k: 0.4, cyan: 0.3, amber: 0.6 });
    actor(g, 'MINA', { x: hx - 420, y: GY + 10, s: 2.0, facing: 1, pose: idle({ ...POSES.stand, eF: [20, -140], hF: [34, -160] }, t, 3), expr: 'determined', blink: blinkFlag(t, 2.9, 3), look: lookToward(1, 0.3), t, rim: Pk.rim });
    circle(g, hx - 420 + 34 * 1.44, GY + 10 - 160 * 1.44, 14, '#e8e4da');
    const dO = { x: hx + 520, y: GY + 10, s: 1.9, facing: -1 }, dp = idle(POSES.phone, t, 4);
    actor(g, 'DEV', { ...dO, pose: dp, expr: 'happy', blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, 0.3), t, rim: Pk.rim });
    const ph = handAt(dO, dp, 'F'); circle(g, ph[0], ph[1] - 30, 34, 'rgba(0,0,0,0)'); g.strokeStyle = '#fff6e0'; g.lineWidth = 6; g.beginPath(); g.arc(ph[0], ph[1] - 30, 34, 0, 7); g.stroke(); glow(g, ph[0], ph[1] - 30, 160, '#fff6e0', 0.35);
  });
  parkFg(g, t, cam, { season: 'autumn' });
  bloom(g, { threshold: 0.66, strength: 0.6 }); nightGrade(g, { k: 0.7 });
  g.fillStyle = alpha('#ffb070', 0.08); g.fillRect(0, 0, E.W, E.H);
} });

// s121 — "Rule one. The screen zips away."  gold chip 'RULE 1: STRONGER STARTS IN YOUR BRAIN.' on 'Rule'; back in the kitchen the card folds
// back into the Zip and the Zip zips shut on 'away.' with a last gold spark.
registerShot('s121', { draw(g, t, info) {
  const st = info.shot.start, tR = sw('rule', st, 0.21), tA = sw('away', st, 2.09);
  const tx = E.W / 2 - 60, ty = E.H * 0.8 - 250, cam = { z: lerp(1.2, 1.26, t / info.dur), x: tx - E.W / 2 + 60, y: ty - 220 - E.H / 2 + 60, r: 0 };
  const K = KIT(g, t, cam);
  layer(g, cam, 1, (g) => {
    const B = table(g, t, K, { heroExpr: 'smile', minaExpr: 'smile', devExpr: 'smile', cat: false, devPose: POSES.stand, rec: 0 });
    const zo = zipOpen(t, -1, { close: 1.79 }), Z = zip(g, t, B.zipX, B.zipY, { w: 280, open: zo, seam: 1 });
    statCard(g, t, { x: B.zipX + 40, y: B.zipY - 220, s: 0.8, from: Z.mouth, unfold: 1 - ease.in(prog(t, 1.53, 1.95)), lv: 0, str: 44, xp: 0 });
    sparks(g, t, tA, B.zipX + 140, B.zipY, { n: 16, s: 0.7, seed: 6 });
  });
  chip(g, t, { str: 'RULE 1: STRONGER STARTS IN YOUR BRAIN.', at: tR, x: 600, y: E.H - 120, dur: info.dur });
} });

// s122 — "Then a tiny new one opens above Biscuit's head."  BISCUIT on the table by the empty bowl; a tiny Zip opens above her head on 'one';
// her eyes go wide on 'Biscuit's', head tilts up; HERO, MINA and DEV lean in from the edges, jaws open.
registerShot('s122', { draw(g, t, info) {
  const st = info.shot.start, tO = sw('one', st, 0.83), tB = sw("biscuit's", st, 1.83);
  const cam = { ...camMove(t, info.dur, { z: [1.25, 1.32] }), y: 60 };
  const K = KIT(g, t, cam), P = K.P, bx = P.tableX + 40, by = P.tableTop, hy = by - 230;
  layer(g, cam, 1, (g) => {
    bowl(g, P.tableX - 160, P.tableTop - 6, 0.8);
    hero(g, { x: bx - 640, y: K.GY + 60, s: 1.9, facing: 1, pose: idle({ ...POSES.stand, head: [22, -196], sh: [12, -170] }, t, 2), expr: t > tO ? 'shocked' : 'neutral', blink: blinkFlag(t, 3.4, 2), look: lookToward(1, -0.3), t });
    actor(g, 'MINA', { x: bx + 470, y: K.GY + 60, s: 2.0, facing: -1, pose: idle({ ...POSES.stand, head: [18, -200] }, t, 3), expr: t > tO ? 'shocked' : 'smile', blink: blinkFlag(t, 2.9, 3), look: lookToward(-1, -0.4), t });
    actor(g, 'DEV', { x: bx + 720, y: K.GY + 60, s: 1.9, facing: -1, pose: idle(POSES.phone, t, 4), expr: t > tO ? 'shocked' : 'neutral', blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, -0.4), t });
    cat(g, { x: bx, y: by, s: 1.9, facing: -1, pose: 'sit', eyes: t > tB ? 'wide' : 'auto', t, tilt: t > tB ? -0.12 : 0 });
    const zo = zipOpen(t, tO, { dur: 0.3 }); zip(g, t, bx - 10, hy, { w: 110, open: zo, seam: clamp(zo * 4) });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// s123 — ""Level one.""  close on BISCUIT: her mini card pops out of the tiny Zip, gold 'LV 1' on 'Level'; a tiny sparkle; she stares at it,
// then slowly looks at camera (eyes 'glint').
registerShot('s123', { draw(g, t, info) {
  const st = info.shot.start, tL = sw('level', st, 0.23);
  const cam = { ...camMove(t, info.dur, { z: [1.3, 1.36] }), x: -20, y: 100 };
  const K = KIT(g, t, cam), P = K.P, bx = P.tableX + 40, by = P.tableTop, hy = by - 210;
  layer(g, cam, 1, (g) => {
    cat(g, { x: bx, y: by, s: 1.9, facing: -1, pose: 'sit', eyes: t > 1.4 ? 'glint' : 'wide', t, tilt: t > 1.4 ? 0.05 : -0.12 });
    const Z = zip(g, t, bx - 10, hy, { w: 110, open: 1, seam: 1 });
    miniCard(g, t, { x: bx - 170, y: hy - 95, s: 0.95, from: Z.mouth, unfold: ease.out(prog(t, 0.1, 0.6)), lv: 1, str: 0.4 });
    sparks(g, t, tL, bx - 230, hy - 95, { n: 12, s: 0.6, seed: 4 });
  });
} });
