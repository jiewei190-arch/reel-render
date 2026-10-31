// B_s043_s051_car.js — ep 5 batch B: "Bones: upgraded." (LV 12, 640 kg), giant face HERO "no update"; LEVEL 16 THE CAR (pop LV 15->16,
// 1,280->1,613 kg), Mina's football under the LOCAL car on the lawn, ~1.5 t, the slow-mo lift, ankle deep in the lawn, the patio "Crack.",
// giant face MINA "Mum's tiles."
// LEGAL: only our rounded Stat Card; hero eyes never glow (HUD light = two small cyan rectangles on the cheeks); no series words.
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, seg, circle, rr, poly, alpha, text, FONTS } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { home3 } from '../sets/home3.js';
import { garden, gardenFg } from '../sets/garden.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, walkAlong, atmos } from '../sets/acting.js';
import { zip, zipOpen, statCard, levelFlash, levelShake, freeze, sparks } from '../sets/statcard.js';
import { P5, slowMo, trail, hitShake, impactFrame, groundCrack, soilSink, soilLip, tileCrack, dustBurst, speedLines5, lowAngle, rimLight } from '../sets/fx5.js';
import { CREAM, GOLD, CORAL, CYAN, W, hero, heroTrim, bowl, kitchenPop, goldTag, car, football, fmtK } from './B_lib.js';

const CX = E.W / 2;
const kitchen = (g, t, cam, mood = 'day') => home3(g, t, cam, { room: 'kitchen', mood, cereal: 0, plate: 0 });
// the car held overhead on the hero's hands (o = actor opts, pose = current pose); k 0..1 = how far up (0 = on the ground behind him)
function carOver(g, o, pose, len = 900, tilt = 0) { const [ax, ay] = W(o, pose.hF), [bx, by] = W(o, pose.hB); car(g, (ax + bx) / 2, Math.min(ay, by) - 4, len, { rot: tilt, noShadow: 1 }); }

// s043 — NEXT MORNING: "BONES: UPGRADED." (dawn kitchen; the Zip at 0.2, the card LV 12 / 640 kg; a GOLD line types on 1.36-1.76 + a gold tick)
registerShot('s043', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.02, 1.07] }), H = kitchen(g, t, cam, 'dawn'), P = H.pos, GY = H.GY ?? E.H * 0.8;
  let card;
  layer(g, cam, 1, (g) => {
    hero(g, { x: P.tableX - 430, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [1.76, 'delight']]), t, 1), expr: exprAt(t, [[0, 'worried'], [1.76, 'joy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.4), t });
    bowl(g, P.tableX, P.tableTop - 6, 1);
    const zo = zipOpen(t, 0.2, { dur: 0.32 }), Z = zip(g, t, P.tableX, P.tableTop - 140, { open: zo, seam: clamp(zo * 4) });
    card = statCard(g, t, { x: P.tableX + 330, y: P.tableTop - 310, s: 0.9, from: Z.mouth, unfold: ease.out(prog(t, 0.5, 1.05)), lv: 12, str: 640, xp: 0.05, xpSnap: clamp(1 - (t - 0.9) / 0.35) * (t > 0.9 ? 1 : 0) });
  });
  // the gold line under STR (types on 1.36-1.76) + a gold tick on 1.76 (drawn in screen space over the card's position)
  if (card && t > 1.36) { const [sx, sy] = [(card.str[0] - CX - cam.x) * cam.z + CX, (card.str[1] - E.H / 2 - cam.y) * cam.z + E.H / 2], s = 'Bones: upgraded.', n = Math.ceil(s.length * prog(t, 1.36, 1.76));
    text(g, s.slice(0, n), sx - 80 * cam.z, sy + 64 * cam.z, { size: 30 * cam.z, color: GOLD, font: FONTS.title, weight: 600, align: 'left', glow: 10, glowColor: alpha(GOLD, 0.6) });
    const tk = ease.outBack(prog(t, 1.76, 2.0)); if (tk > 0.01) { g.save(); g.translate(sx - 112 * cam.z, sy + 64 * cam.z); g.scale(tk, tk); seg(g, [[-12, 0], [-3, 10], [14, -12]], 6, GOLD); g.restore(); sparks(g, t, 1.76, sx - 112 * cam.z, sy + 64 * cam.z, { n: 10, s: 0.5, seed: 6 }); } }
} });

// s044 — GIANT FACE HERO 'real life has no update': joy -> sheepish -> smirk; a cream 'update' bar fills, stalls, greys out on 'update.' (1.02)
registerShot('s044', { draw(g, t, info) {
  const z = 1 + 0.04 * ease.inOut(t / info.dur);
  blurLayer(g, 10, (g) => kitchen(g, t, { z: 1.2, x: -200, y: -60 }, 'dawn'), null, 1); veil(g, '#1a1020', 0.2);
  g.save(); g.translate(CX, E.H / 2); g.scale(z, z); g.translate(-CX, -E.H / 2);
  const cx = E.W * 0.44, cy = E.H * 0.52, r = 330;
  giantFace(g, cx, cy, r, { who: 'HERO', f: faceAt(t, [[0, 'joy'], [0.6, 'sheepish'], [1.02, 'smirk']], 0.14), rimSide: 1, rimColor: '#ffd9a8', blink: blinkAmt(t, 2.6, 1), breath: Math.sin(t * 2), look: [0.15, 0] });
  // the cyan zip pull at the collar
  g.save(); g.fillStyle = CYAN; g.shadowColor = CYAN; g.shadowBlur = 10; rr(g, cx - 7, cy + r * 1.02, 14, 30, 5); g.fill(); g.restore();
  // the 'update' bar
  const bx = E.W * 0.74, by = E.H * 0.42, fill = Math.min(0.62, ease.out(prog(t, 0.1, 0.9)) * 0.62), grey = prog(t, 1.02, 1.3);
  g.save(); g.globalAlpha *= ease.out(prog(t, 0.05, 0.3)); rr(g, bx - 10, by - 70, 400, 140, 20); g.fillStyle = alpha(CREAM, 0.92); g.fill();
  text(g, 'update', bx + 20, by - 32, { size: 36, color: '#3a3020', font: FONTS.ui, weight: 900, align: 'left' });
  rr(g, bx + 20, by + 6, 340, 30, 15); g.fillStyle = '#d8ccb0'; g.fill(); rr(g, bx + 20, by + 6, 340 * fill, 30, 15); g.fillStyle = grey > 0 ? `rgb(${Math.round(lerp(255, 150, grey))},${Math.round(lerp(201, 150, grey))},${Math.round(lerp(60, 150, grey))})` : GOLD; g.fill();
  if (grey > 0.5) text(g, 'no update', bx + 190, by + 54, { size: 26, color: '#7a6a50', font: FONTS.ui, weight: 800 });
  g.restore();
  g.restore();
} });

// s045 — LEVEL 16 THE CAR: the morning pop LV 15 -> 16, STR 1,280 -> 1,613 (passes 1,600 on 'hundred' 2.32, lands on 'kilos.' 2.68); bigger flash, slow-mo push
registerShot('s045', { draw(g, t0, info) {
  const t = freeze(t0, 1.2, 5), sh = levelShake(t0, 1.2, 4), zz = lerp(1.0, 1.1, ease.inOut(prog(slowMo(t0, { at: 0.9, dur: 0.9, factor: 0.35 }), 0, info.dur)));
  const cm = camMove(t, info.dur, { z: [zz, zz] }), cam = { ...cm, x: cm.x + sh[0] + 60 * (zz - 1) * 6, y: cm.y + sh[1] - 40 * (zz - 1) * 6 };
  const H = kitchen(g, t, cam), P = H.pos, GY = H.GY ?? E.H * 0.8;
  layer(g, cam, 1, (g) => {
    hero(g, { x: P.tableX - 430, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [1.3, 'delight']]), t, 1), expr: exprAt(t, [[0, 'surprised'], [1.3, 'joy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.4), t });
    bowl(g, P.tableX, P.tableTop - 6, 1);
    kitchenPop(g, t, P, { lv: [15, 16], str: [1280, 1613], strLand: 2.68, shake: 4 });
  });
  chip(g, t0, { str: 'LEVEL 16: THE CAR', at: 0.24, y: E.H * 0.88, dur: info.dur });
  levelFlash(g, t0, 1.2, { a: 0.9, dur: 0.38 });
} });

// ---------- the garden shots ----------
const CAR_X = CX + 120, CAR_LEN = 1000;
function lawn(g, t, cam) { return garden(g, t, cam, { view: 'garden', mood: 'day' }); }

// s046 — MINA'S FOOTBALL UNDER THE CAR: Mina on her tummy pointing under it on 'football' (0.49); HERO walks in from the back door on 'car,' (1.31)
registerShot('s046', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.96, 1.02] }), G = lawn(g, t, cam), GY = G.GY;
  layer(g, cam, 1, (g) => {
    car(g, CAR_X, GY - 10, CAR_LEN);
    football(g, CAR_X + 400, GY - 30, 34);
    // MINA on her tummy (the stand pose laid flat, head toward the car), pointing under it on 'football' (0.49)
    const pt = ease.out(prog(t, 0.49, 0.8)), mp = { ...poseAt(t, [[0, 'stand']]), hF: [lerp(13, 60, pt), lerp(-101, -200, pt)], eF: [lerp(9, 30, pt), lerp(-137, -170, pt)] };
    g.save(); g.translate(CAR_X + 560, GY + 40); g.rotate(-Math.PI / 2 + 0.08); actor(g, 'MINA', { x: 0, y: 0, s: 2.0, facing: 1, pose: mp, expr: exprAt(t, [[0, 'sad']]), blink: blinkFlag(t, 2.9, 3), look: [1, 0.2], t }); g.restore();
    const hx = lerp(G.pos.doorX + 40, CX - 520, ease.inOut(prog(t, 1.31, info.dur))), walking = t > 1.31 && t < info.dur - 0.2;
    if (t > 1.2) hero(g, { x: hx, y: GY, s: 1.9, facing: 1, pose: walking ? walkAlong(hx, 1.9, { facing: 1 }).pose : idle(poseAt(t, [[0, 'stand']]), t, 1), expr: 'determined', blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0), t });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: '#fff4dc' });
} });

// s047 — ABOUT ONE AND A HALF TONNES: a dashed blueprint outline + a gold '~1.5 t' tag (counter 1.56 -> 2.56); HERO squats at the back bumper on 'tonnes.' (2.56)
registerShot('s047', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [60, 60] }), G = lawn(g, t, cam), GY = G.GY;
  layer(g, cam, 1, (g) => {
    car(g, CAR_X, GY - 10, CAR_LEN);
    const dk = ease.out(prog(t, 0.2, 1.2)); if (dk > 0) { g.save(); g.globalAlpha *= dk; car(g, CAR_X, GY - 10, CAR_LEN, { dash: CREAM }); g.restore(); }
    hero(g, { x: CAR_X - CAR_LEN / 2 - 110, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [2.3, 'crouch']]), t, 1), expr: exprAt(t, [[0, 'smile'], [2.3, 'determined']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.2), t });
  });
  const v = lerp(0, 1.5, ease.out(prog(t, 1.56, 2.56))), tk = ease.outBack(prog(t, 1.56, 1.9));
  if (tk > 0.01) { const y = lerp(E.H * 0.05, E.H * 0.28, ease.out(prog(t, 1.56, 1.9))); goldTag(g, t, 1.56, `~${v.toFixed(1)} t`, CX + 120, y, { size: 70 }); }
  if (t > 2.56) sparks(g, t, 2.56, CX + 120, E.H * 0.28, { n: 14, s: 0.7, seed: 8 });
  text(g, 'small family car', CX + 120, E.H * 0.38, { size: 32, color: CREAM, font: FONTS.ui, weight: 800, alpha: ease.out(prog(t, 2.0, 2.4)) });
  gardenFg(g, t, cam, { view: 'garden' });
} });

// s048 — YOU LIFT. THE CAR GOES UP: low angle, slow-mo from 'lift.' (0.25), the car rises overhead 'car' 1.47 -> 'up.' 1.87; cyan focus lines + rim; MINA dives for the ball
registerShot('s048', { draw(g, t, info) {
  const tt = slowMo(t, { at: 0.25, dur: 0.8, factor: 0.3 }), cam = lowAngle(t, info.dur, { z: [1.0, 1.08], lift: 140 }), G = lawn(g, t, cam), GY = G.GY;
  const hx = CX - 140, up = ease.inOut(prog(tt, 0.3, 1.87)), pose = poseAt(tt, [[0, 'crouch'], [0.5, 'reachHigh'], [1.3, 'handsUp']]), o = { x: hx, y: GY, s: 1.9, facing: 1 };
  layer(g, cam, 1, (g) => {
    if (t > 0.25 && t < 2.3) speedLines5(g, t, { mode: 'focus', cx: hx, cy: GY - 420, inner: 520, a: 0.3, color: P5.cyan });
    football(g, CX + 520 - 200 * ease.out(prog(t, 0.6, 1.4)), GY - 30, 32);
    actor(g, 'MINA', { x: lerp(CX + 900, CX + 520, ease.out(prog(t, 0.5, 1.3))), y: GY + 10, s: 2.0, facing: -1, pose: poseAt(t, [[0, 'stand'], [0.5, 'dive']]), expr: 'determined', t });
    const drawCar = (x, ttt) => { const u = ease.inOut(prog(ttt, 0.3, 1.87)), p = poseAt(ttt, [[0, 'crouch'], [0.5, 'reachHigh'], [1.3, 'handsUp']]), [ax, ay] = W(o, p.hF), [bx, by] = W(o, p.hB), hy = Math.min(ay, by);
      car(x, lerp(hx + 600, (ax + bx) / 2, u), lerp(GY - 10, hy, u), 900, { rot: lerp(-0.06, 0, u), noShadow: u > 0.2 }); };
    if (t > 0.25 && t < 1.9) trail(g, tt, drawCar, { n: 4, dt: 0.06, a: 0.35, tint: P5.cyan }); else drawCar(g, tt);
    rimLight(g, (x) => hero(x, { ...o, pose, expr: 'determined', blink: blinkFlag(t, 3.4, 1), look: [0, -1], t }), { dir: [1, -0.3], width: 6, a: 0.7 });
  });
  gardenFg(g, t, cam, { view: 'garden' });
} });

// s049 — YOU GO DOWN, ANKLE DEEP: close on the trainers sinking (0.25 -> 1.89), dust + clods on 'down.' (0.47), cracks; tilt up on 'Ankle' (1.63) to him holding the car
registerShot('s049', { draw(g, t, info) {
  const tilt = ease.inOut(prog(t, 1.63, 2.6)), sh = hitShake(t, 0.47, { amp: 3, dur: 0.3 }), hx = CX, Gy0 = E.H * 0.8;
  const cam = { z: lerp(2.3, 1.15, tilt), x: sh[0] + 0, y: lerp(Gy0 - 80 - E.H / 2, Gy0 - 420 - E.H / 2, tilt) + sh[1] };
  const G = lawn(g, t, cam), GY = G.GY, k = ease.out(prog(t, 0.25, 1.89)), o = { x: hx, y: GY, s: 1.9, facing: 1 }, pose = poseAt(t, [[0, 'handsUp']]);
  layer(g, cam, 1, (g) => {
    groundCrack(g, t, hx, GY + 4, { k: 0.6 * prog(t, 0.47, 1.2) });
    const S = soilSink(g, t, hx, GY, { k, w: 220 });
    const oo = { ...o, y: GY + S.dy };
    hero(g, { ...oo, pose, expr: exprAt(t, [[0, 'determined'], [1.63, 'worried']]), blink: blinkFlag(t, 3.2, 1), look: [0, 0.6], t });
    carOver(g, oo, pose, 900);
    soilLip(g, t, hx, GY + 4, { k, w: 220 });
    dustBurst(g, t, 0.47, hx, GY + 6, { s: 1, count: 12 });
  });
  gardenFg(g, t, cam, { view: 'garden' });
} });

// s050 — THE PATIO INSTEAD -> CRACK: he lugs the car three steps onto Mum's patio (feet set on 'patio' 0.59); 'Crack.' 2.22: tiles spider out, impact frame, shake 4, dutch
registerShot('s050', { draw(g, t, info) {
  const sh = hitShake(t, 2.22, { amp: 4, dur: 0.3 }), dutch = 0.05 * ease.out(prog(t, 2.22, 2.5));
  const cam = { ...camMove(t, info.dur, { z: [1.05, 1.1], x: [-380, -420] }), r: dutch }; cam.x += sh[0]; cam.y += sh[1];
  const G = lawn(g, t, cam), GY = G.GY, x0 = CX - 320, x1 = G.pos.stepX + 380, hx = lerp(x0, x1, ease.inOut(prog(t, 0, 0.59))), walking = t < 0.59;
  const pose = walking ? { ...walkAlong(hx, 1.9, { facing: -1 }).pose, hF: [30, -252], hB: [-20, -252], eF: [24, -210], eB: [-16, -210] } : poseAt(t, [[0, 'handsUp']]), o = { x: hx, y: GY, s: 1.9, facing: -1 };
  layer(g, cam, 1, (g) => {
    tileCrack(g, t, x1, GY + 30, { k: ease.out(prog(t, 2.22, 2.7)), cols: 5, rows: 3, tw: 120, th: 40 });
    hero(g, { ...o, pose, expr: exprAt(t, [[0, 'determined'], [2.22, 'shocked']]), blink: blinkFlag(t, 3.2, 1), look: [0, t > 2.22 ? 0.8 : 0], t });
    carOver(g, o, pose, 900);
  });
  impactFrame(g, t, 2.22, { x: (x1 - CX - cam.x) * cam.z + CX, y: (GY + 20 - E.H / 2 - cam.y) * cam.z + E.H / 2, frames: 3 });
  gardenFg(g, t, cam, { view: 'garden' });
} });

// s051 — GIANT FACE MINA 'Mum's tiles.': shocked -> worried, football hugged, eyes darting down; a cracked-tile icon on 'tiles.' (0.43)
registerShot('s051', { draw(g, t, info) {
  const z = 1 + 0.04 * ease.inOut(t / info.dur);
  blurLayer(g, 10, (g) => lawn(g, t, { z: 1.2, x: -400, y: 40 }), null, 1); veil(g, '#1a1020', 0.12);
  g.save(); g.translate(CX, E.H / 2); g.scale(z, z); g.translate(-CX, -E.H / 2);
  const cx = E.W * 0.45, cy = E.H * 0.48, r = 330;
  giantFace(g, cx, cy, r, { who: 'MINA', f: faceAt(t, [[0, 'shocked'], [0.43, 'worried']], 0.12), rimSide: 1, rimColor: '#fff1d8', blink: blinkAmt(t, 2.6, 2), breath: Math.sin(t * 2.4), look: [0.1 * Math.sin(t * 6), t > 0.3 ? 0.7 : 0] });
  football(g, cx + r * 0.75, cy + r * 1.2, 120);
  const k = ease.outBack(prog(t, 0.43, 0.7)); if (k > 0.01) { g.save(); g.translate(E.W * 0.78, E.H * 0.36); g.scale(k, k); rr(g, -90, -60, 180, 120, 10); g.fillStyle = CREAM; g.fill(); g.strokeStyle = '#3a3020'; g.lineWidth = 5; g.stroke(); seg(g, [[-30, -60], [-6, -10], [-40, 20], [-10, 60]], 5, '#3a3020'); seg(g, [[-6, -10], [50, 10], [90, -6]], 4, '#3a3020'); g.restore(); }
  g.restore();
} });
