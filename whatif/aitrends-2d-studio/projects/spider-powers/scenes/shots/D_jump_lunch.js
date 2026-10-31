// D_jump_lunch.js — ep 4 batch D (s077-s098, 241.98-314.91 s): Biscuit's failed ambush, DAY 5 THE JUMP (fence, "Clean.", water-balloon
// knees), RULE 5 + FIG 5 (flexor only, fluid pressure, hydraulic, Pip's 6x leap, 6 vs ~1.5, STILL DEBATED, the Manchester spider, muscle
// alone?), Dev's tape: 1 BODY LENGTH + Pip's '6', DAY 6 LUNCH (the burger, the idea face, FIG 6 no chewing / soup / slurp, the burger
// looks back, milkshake instead).
// LEGAL: original hero only (sandy hair, mustard hoodie, purple gloves, grey cargos, green wellies); no franchise anything; fence height only.
// Local pieces: kneeWobble, gloveHand (purple glove + mustard sleeve entering frame), gauge, digger, spiderHead/teeth/blob/bowl (FIG 6),
// stamp, sign6, labSpider (the Manchester spider: Pip's rig, darker colourway + cream stripe, never named), creamShrug.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, linGrad, radGrad, text, FONTS, wordTime } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { HERO } from '../cast.js';
import { blinkFlag, exprAt, poseAt, idle, walkAlong, lookToward, camMove } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { home3, home3Fg } from '../sets/home3.js';
import { garden, gardenFg } from '../sets/garden.js';
import { pip, airHairs, gloves } from '../sets/spider.js';
import { cat } from '../sets/creatures.js';
import { ruleCard, chip } from '../sets/hud.js';
import { board, label as bpLabel } from '../sets/bp.js';
import { legPump, jumpBars } from '../sets/spiderbp.js';
import { burger, milkshake, waterBalloon, fence, fenceJump, bodyLength, lab, dayCard } from '../sets/spiderprops.js';

const ui = () => S().ui;
const shotWord = (w, st, fb) => { const g = wordTime(w, st - 0.1); return (g == null || g > st + 10 ? st + fb : g) - st; };
const gold = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 40, color: ui().gold, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1, glow: 12, glowColor: alpha(ui().gold, 0.5) });
const cream = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 30, color: ui().cream, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1 });
const pop = (t, at, d = 0.35) => ease.outBack(prog(t, at, at + d));
const KIT = { room: 'kitchen', mood: 'day', cereal: 0, plate: 0, steam: 0.2 };
const HS = 1.9;
const hand = (p, x, y, s, f) => [x + p.hF[0] * s * f, y + p.hF[1] * s];

// ---------- local pieces ----------
function gloveHand(g, x, y, s, rot, o = {}) {                                                            // a purple glove on a mustard sleeve, entering from off-frame
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -38, 30, 76, 700, 30); g.fillStyle = shade(HERO.color, -0.1); g.fill(); rr(g, -42, 24, 84, 36, 14); g.fillStyle = shade(HERO.color, -0.25); g.fill();
  const c = HERO.gloves; g.fillStyle = shade(c, -0.25); rr(g, -30, 0, 60, 34, 10); g.fill(); g.fillStyle = c;
  g.beginPath(); g.ellipse(0, -16, 36, 32, 0, 0, 7); g.fill();
  if (o.thumb) { rr(g, -16, -96, 30, 70, 14); g.fill(); for (let i = 0; i < 4; i++) { rr(g, 18, -40 + i * 14, 34, 14, 7); g.fill(); } }
  else for (let i = 0; i < 4; i++) { rr(g, -32 + i * 17, -78 + Math.abs(i - 1.5) * 5, 15, 48, 7); g.fill(); }
  g.restore();
}
function sign6(g, x, y, s, k) {                                                                          // Pip's tiny score sign
  if (k <= 0.01) return; g.save(); g.translate(x, y); g.scale(s * k, s * k); g.rotate(0.06);
  seg(g, [[0, 30], [0, 90]], 5, '#8a6a4a'); rr(g, -34, -30, 68, 60, 8); g.fillStyle = ui().cream; g.fill(); g.strokeStyle = '#1a1622'; g.lineWidth = 3; g.stroke();
  text(g, '6', 0, 2, { size: 46, color: ui().gold, font: FONTS.title, weight: 700, stroke: 5, strokeColor: '#1a1622' }); g.restore();
}
function stamp(g, x, y, s, k, str = 'STILL DEBATED') {
  if (k <= 0.01) return; g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(s * k, s * k);
  rr(g, -220, -46, 440, 92, 12); g.strokeStyle = ui().gold; g.lineWidth = 6; g.stroke(); text(g, str, 0, 4, { size: 54, color: ui().gold, font: FONTS.title, weight: 700, spacing: 4 }); g.restore();
}
function gauge(g, x, y, r, k) {
  const U = ui(); ring(g, x, y, r, 5, U.cream); for (let i = 0; i <= 6; i++) { const a = Math.PI * (0.8 + i * 1.4 / 6); seg(g, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95]], 3, alpha(U.cream, 0.8)); }
  const a = Math.PI * (0.8 + 1.4 * clamp(k)); seg(g, [[x, y], [x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8]], 5, U.gold); circle(g, x, y, 7, U.gold);
  cream(g, 'PRESSURE', x, y + r + 30, { size: 22 });
}
function digger(g, x, y, s, k, fill) {                                                                    // a cream outline digger arm with a hydraulic ram; k 0 bent -> 1 straight
  const U = ui(), a1 = -0.9, a2 = lerp(1.6, 0.25, ease.inOut(clamp(k)));
  const base = [x, y], elbow = [x + Math.cos(a1) * 300 * s, y + Math.sin(a1) * 300 * s], tip = [elbow[0] + Math.cos(a1 + a2) * 260 * s, elbow[1] + Math.sin(a1 + a2) * 260 * s];
  rr(g, x - 140 * s, y, 280 * s, 110 * s, 16 * s); g.strokeStyle = U.cream; g.lineWidth = 4; g.stroke(); circle(g, x - 90 * s, y + 130 * s, 30 * s, 'rgba(0,0,0,0)'); ring(g, x - 90 * s, y + 130 * s, 30 * s, 4, U.cream); ring(g, x + 90 * s, y + 130 * s, 30 * s, 4, U.cream);
  seg(g, [base, elbow], 30 * s, alpha(U.cream, 0.25)); seg(g, [elbow, tip], 24 * s, alpha(U.cream, 0.25));
  g.strokeStyle = U.cream; g.lineWidth = 4; for (const [p, q] of [[base, elbow], [elbow, tip]]) { g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  ring(g, ...elbow, 16 * s, 4, U.cream); poly(g, [[tip[0] - 30 * s, tip[1]], [tip[0] + 40 * s, tip[1] + 10 * s], [tip[0] + 10 * s, tip[1] + 60 * s]], alpha(U.cream, 0.6));
  const r0 = [lerp(base[0], elbow[0], 0.45) + 30 * s, lerp(base[1], elbow[1], 0.45)], r1 = [lerp(elbow[0], tip[0], 0.35), lerp(elbow[1], tip[1], 0.35) - 20 * s];   // the ram
  seg(g, [r0, r1], 16 * s, fill > 0 ? mix('#3a4a66', U.gold, fill) : alpha(U.cream, 0.3)); seg(g, [r0, [lerp(r0[0], r1[0], 0.55), lerp(r0[1], r1[1], 0.55)]], 24 * s, fill > 0 ? mix('#3a4a66', U.gold, fill) : alpha(U.cream, 0.45));
  if (fill > 0) glow(g, ...r0, 120 * s, U.gold, 0.25 * fill);
  return { ram: r0, elbow };
}
function labSpider(g, x, y, s, o) {                                                                      // a different jumping spider: darker, cream stripe
  g.save(); g.filter = 'brightness(0.62) contrast(1.25)'; const P = pip(g, x, y, s, o); g.restore();
  const lift = P?.lift ?? 0, f = o.facing ?? 1; g.save(); g.translate(x, y - lift * s); g.scale(s * f, s); g.strokeStyle = alpha('#f2e6c8', 0.9); g.lineWidth = 5; g.beginPath(); g.moveTo(-34, -40); g.quadraticCurveTo(-18, -54, 0, -48); g.stroke(); g.restore();
}
function creamShrug(g, x, y, s, k) {
  const U = ui(), up = 12 * k; g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = U.cream; g.lineWidth = 6; g.lineCap = 'round';
  ring(g, 0, -150 - up * 0.3, 22, 5, U.cream); g.beginPath(); g.moveTo(0, -126); g.lineTo(0, -60); g.lineTo(-20, 0); g.moveTo(0, -60); g.lineTo(20, 0);
  g.moveTo(0, -112); g.lineTo(-30, -100 - up); g.lineTo(-44, -124 - up * 1.5); g.moveTo(0, -112); g.lineTo(30, -100 - up); g.lineTo(44, -124 - up * 1.5); g.stroke(); g.restore();
}

// ============================== s077 BISCUIT'S AMBUSH ==============================
registerShot('s077', { draw(g, t, info) {
  const st = info.shot.start, ts = shotWord('sneak', st, 1.07), ty = shotWord('you', st, 1.69), tf = shotWord('first', st, 2.17);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [60, 70], x: [40, 60], drift: 0.3 });
  const H = home3(g, t, cam, KIT), GY = H.GY;
  const hx = 380, turn = ease.inOut(prog(t, ty - 0.25, ty + 0.05)), f = turn > 0.5 ? 1 : -1;
  const pose = idle(turn > 0.5 ? blendPose('crossArms', 'relaxed', 0.3) : POSES.holdFront, t, 2);
  // Biscuit: low stalk -> bum wiggle -> pounce -> startled sit
  let cx, cy = GY, cpose = 'stand', ceyes = 'auto', walk = 0, cf = -1, tilt = 0;
  if (t < ts) { cx = lerp(1500, 1000, ease.out(t / ts)); walk = t * 9; }
  else if (t < ty) { cx = 1000 + Math.sin(t * 40) * 4; tilt = Math.sin(t * 30) * 0.06; cpose = 'loaf'; }
  else if (t < tf) { const k = clamp((t - ty) / (tf - ty)); cx = lerp(1000, 640, k); cy = GY - Math.sin(k * Math.PI) * 170; cpose = 'arch'; }
  else { cx = 640; cpose = 'sit'; ceyes = 'wide'; cy = GY - Math.max(0, Math.sin((t - tf) * 18) * 14 * Math.exp(-(t - tf) * 6)); }
  layer(g, cam, 1, (g) => {
    const o = { x: hx, y: GY, s: HS, facing: f, pose, expr: exprAt(t, [[0, 'neutral'], [ty - 0.1, 'smirk']]), blink: blinkFlag(t, 3.2, 2), look: f > 0 ? lookToward(1, 0.4) : lookToward(-1, 0.1), rim: H.rim, t };
    actor(g, 'HERO', o); gloves(g, o, pose, { t });
    if (f < 0) { rr(g, hx - 150, GY - 330, 60, 30, 6); g.fillStyle = '#e8b870'; g.fill(); }                    // toast on the counter
    airHairs(g, t, hx + 6 * f, GY - 196 * HS, clamp(1 - Math.abs(t - ty + 0.15) / 0.55));
    cat(g, { x: cx, y: cy, s: 1.8, facing: cf, pose: cpose, eyes: ceyes, walk, tilt, t, rim: H.rim });
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
} });

// ============================== s078 SHE TAKES IT PERSONALLY ==============================
registerShot('s078', { draw(g, t, info) {
  const st = info.shot.start, tt = shotWord('takes', st, 0.26), tp = shotWord('personally', st, 0.66);
  const cam = camMove(t, info.dur, { z: [1.7, 1.76], x: [-260, -250], y: [180, 175], drift: 0.2 });
  g.save(); g.filter = 'blur(9px)'; home3(g, t, cam, KIT); g.restore();
  const GY = E.H * 0.86, turned = t > tt + 0.12, sq = Math.abs(Math.cos(clamp((t - tt) / 0.25) * Math.PI));
  const reach = ease.inOut(prog(t, 1.2, 1.9)), lean = reach * 0.18;
  g.save(); g.translate(820, GY); g.scale(t > tt && t < tt + 0.25 ? Math.max(0.3, sq) : 1, 1);
  cat(g, { x: 0, y: 0, s: 3.4, facing: turned ? 1 : -1, pose: 'sit', eyes: 'offended', tilt: -lean + (t > tp && t < tp + 0.2 ? 0.04 : 0), t: t + (t > tp ? 1.7 : 0) });
  g.restore();
  if (t > tp && t < tp + 0.25) { const k = (t - tp) / 0.25; g.strokeStyle = alpha('#ffffff', 0.6 * (1 - k)); g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(640, GY - 120, 90 + i * 18, -2.6, -1.9); g.stroke(); } }   // the hard tail flick
  gloveHand(g, lerp(1500, 1180, reach), lerp(1250, 720, reach), 1.6, -0.6);
} });

// ============================== s079 DAY 5 - THE JUMP ==============================
function jumpScene(g, t, cam, J, o = {}) {
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' }), P = G.pos, GY = G.GY;
  layer(g, cam, 1, (g) => {
    fence(g, P.fenceX0, GY, { w: 700, h: GY - P.fenceTop, t, wobble: o.wobble ?? 0 });
    if (o.pipX != null) pip(g, o.pipX, P.fenceTop, 0.9, { t, tilt: o.pipTilt ?? Math.sin(t) * 0.3, look: [-1, 0.2], blink: blinkFlag(t, 3.6, 4) ? 1 : 0 });
    if (J) { const oo = { x: J.x, y: J.y, s: HS, facing: 1, pose: J.pose, expr: o.expr || 'determined', blink: blinkFlag(t, 3.1, 2), look: o.look || lookToward(1, 0.1), rim: G.rim, t }; actor(g, 'HERO', oo); gloves(g, oo, J.pose, { t }); }
    if (o.after) o.after(g, G);
  });
  if (!o.noFg) gardenFg(g, t, cam, { view: 'garden' });
  return G;
}
registerShot('s079', { draw(g, t, info) {
  const st = info.shot.start, tl = shotWord('leap', st, 1.59), tf = shotWord('fence', st, 3.43);
  const k = ease.inOut(prog(t, tl, tf)), cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.3 }); cam.x += lerp(-140, 60, k); cam.y -= 110 * Math.sin(k * Math.PI);
  const P0 = { stepX: E.W / 2 - 760, stepTop: E.H * 0.8 - 60 }, fx = E.W / 2 - 560 + 240, ftop = E.H * 0.8 - 330;
  const J = fenceJump(t, { from: [P0.stepX + 30, P0.stepTop], to: [fx, ftop], at: tl - 0.25, dur: tf - tl, h: 70 });
  jumpScene(g, t, cam, J, { wobble: t > tf ? Math.exp(-(t - tf) * 4) : 0, expr: exprAt(t, [[0, 'determined'], [tf, 'happy']]), look: lookToward(1, -0.2) });
  g.save(); g.globalAlpha *= 1 - prog(t, 1.25, 1.55); dayCard(g, t, { day: 5, title: 'THE JUMP', at: 0.17, y: E.H * 0.3 }); g.restore();
} });

// ============================== s080 CLEAN. BUT YOUR KNEES ==============================
function kneeWobble(p, t, k) { const w = Math.sin(t * 24) * 7 * k, q = { ...p }; q.kF = [p.kF[0] + w, p.kF[1]]; q.kB = [p.kB[0] - w, p.kB[1]]; q.hip = [p.hip[0] + w * 0.3, p.hip[1]]; return q; }
registerShot('s080', { draw(g, t, info) {
  const st = info.shot.start, tc = shotWord('clean', st, 0.15), tk = shotWord('knees', st, 1.55);
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-180, -170], y: [-90, -95], drift: 0.3 });
  const fx = E.W / 2 - 320, ftop = E.H * 0.8 - 330, wk = ease.out(prog(t, tk, tk + 0.4));
  let pose = blendPose('crouch', { ...POSES.stand, eF: [40, -170], hF: [80, -176], eB: [-30, -170], hB: [-70, -176] }, 0.55);
  pose = kneeWobble(idle(pose, t, 3), t, wk); pose.head = [pose.head[0] + Math.sin(t * 2.4) * 3, pose.head[1]];
  jumpScene(g, t, cam, { x: fx + Math.sin(t * 2.4) * 2, y: ftop, pose }, { wobble: 1 - prog(t, 0, 1.2) * 0.8, pipX: fx + 300, expr: exprAt(t, [[0, 'neutral'], [tc, 'happy'], [tk, 'worried']]), look: t > tk ? lookToward(0.3, 1) : lookToward(1, -0.1) });
  chip(g, t, { str: '✓ CLEAN', at: tc, x: E.W * 0.68, y: E.H * 0.2, dur: tk + 0.3 });
} });

// ============================== s081 LIKE WATER BALLOONS ==============================
registerShot('s081', { draw(g, t, info) {
  const st = info.shot.start, tw = shotWord('water', st, 0.33), tb = shotWord('balloons', st, 0.63);
  const z = lerp(1, 1.04, ease.inOut(clamp(t / info.dur))), wob = Math.sin(t * 22), k = 0.6 + 0.4 * prog(t, tw, tw + 0.2);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#9cc8e8', '#cfe6c0', '#5a9a52']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // left: the cargo knees on the fence top, wobbling
  g.save(); g.beginPath(); g.rect(0, 0, E.W / 2 - 6, E.H); g.clip(); g.filter = 'blur(6px)'; g.fillStyle = '#8a9a6a'; g.fillRect(0, 0, E.W / 2, E.H); g.filter = 'none';
  rr(g, -20, 760, E.W / 2 + 40, 60, 6); g.fillStyle = '#b4824e'; g.fill();                                                    // the fence top rail
  for (const [x0, ph] of [[300, 0], [600, 1.3]]) { const w = Math.sin(t * 22 + ph) * 26 * k;
    const knee = [x0 + 40 + w, 470], hip = [x0 - 60, 170], foot = [x0 - 10, 740];
    seg(g, [hip, knee, foot], 120, '#6b6f78'); seg(g, [hip, knee], 120, '#6b6f78'); circle(g, knee[0], knee[1], 66, shade('#6b6f78', 0.06));
    rr(g, foot[0] - 80, 680, 170, 90, 24); g.fillStyle = HERO.boots; g.fill(); rr(g, x0 - 20 + w * 0.5, 430, 120, 70, 12); g.fillStyle = shade('#6b6f78', -0.12); g.fill(); }   // wellies + cargo pockets
  g.restore();
  seg(g, [[E.W / 2, 0], [E.W / 2, E.H]], 10, '#fbf6ea');
  // right: two water balloons in exact sync
  g.save(); g.beginPath(); g.rect(E.W / 2 + 6, 0, E.W / 2, E.H); g.clip(); g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#fbf6ea', '#e8dcc4']); g.fillRect(E.W / 2, 0, E.W / 2, E.H);
  const bk = k * (t > tb ? 1.2 : 1); waterBalloon(g, E.W * 0.64, 480, 3.2, { t, wobble: bk }); waterBalloon(g, E.W * 0.86, 480, 3.2, { t, wobble: bk });
  const ek = pop(t, tw - 0.05); if (ek > 0.01) { g.save(); g.translate(E.W * 0.75, 480); g.scale(ek, ek); for (const dy of [-16, 16]) { rr(g, -40, dy - 8, 80, 16, 8); g.fillStyle = ui().cream; g.fill(); g.strokeStyle = '#1a1622'; g.lineWidth = 3; g.stroke(); } g.restore(); }
  g.restore(); g.restore();
} });

// ============================== s082 RULE 5 CARD ==============================
registerShot('s082', { draw(g, t, info) {
  const st = info.shot.start, tb = shotWord('bend', st, 1.47);
  ruleCard(g, t, info, { n: 5, title: 'SPIDER LEGS RUN ON PRESSURE.', bg: (g, t) => {
    const cam = camMove(t, info.dur, { z: [1.12, 1.14], x: [-180, -180], y: [-60, -60], drift: 0.2 }), fx = E.W / 2 - 320, ftop = E.H * 0.8 - 330;
    jumpScene(g, t, cam, { x: fx, y: ftop, pose: kneeWobble(blendPose('crouch', 'stand', 0.55), t, 1) }, { wobble: 0.6, expr: 'worried' }); g.fillStyle = 'rgba(10,14,30,.35)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  } });
  const k = pop(t, tb), bend = Math.sin(clamp((t - tb) / 0.8) * Math.PI) * 0.9; if (k > 0.01) { g.save(); g.translate(E.W / 2, E.H * 0.93); g.scale(k, k); const U = ui(), j = [0, -10], end = [Math.cos(0.2 + bend) * 110, -10 + Math.sin(0.2 + bend) * 110];
    seg(g, [[-120, -50], j], 22, U.cream); seg(g, [j, end], 18, U.cream); circle(g, ...j, 14, U.gold); g.restore(); }
} });

// ============================== s083-s085 FIG 5 THE LEG ==============================
const LEG = { x: E.W * 0.45, y: E.H * 0.42 };
registerShot('s083', { draw(g, t, info) {
  const st = info.shot.start, tb = shotWord('but', st, 0.15), tt = shotWord('two', st, 0.49), tn = shotWord('no', st, 2.19);
  board(g, t, { title: 'FIG 5 - THE JUMP', fig: 'FLUID PRESSURE' });
  const L = legPump(g, t, { ...LEG, s: 1, k: ease.out(prog(t, 0, 0.8)), press: 0 });
  bpLabel(g, t, { at: L.flexor, to: [L.flexor[0] - 200, L.flexor[1] - 200], str: 'muscle bends it', start: tb });
  const pk = pop(t, tt); if (pk > 0) { g.save(); g.translate(L.joint[0] + 140, L.joint[1] - 160); g.scale(pk, pk); gold(g, '2 JOINTS', 0, 0, { size: 56 }); g.restore(); }
  const xk = ease.out(prog(t, tn, tn + 0.3)); if (xk > 0) { const cx = LEG.x + 120, cy = LEG.y - 90, d = 50 * xk; seg(g, [[cx - d, cy - d], [cx + d, cy + d]], 12, ui().gold); seg(g, [[cx + d, cy - d], [cx - d, cy + d]], 12, ui().gold);
    bpLabel(g, t, { at: [cx + 30, cy - 30], to: [cx + 260, cy - 200], str: 'no muscle to straighten', start: tn + 0.15 }); }
} });
registerShot('s084', { draw(g, t, info) {
  const st = info.shot.start, tf = shotWord('fluid', st, 2.21), pr = 0.6 * ease.inOut(prog(t, 0.93, 2.57));
  board(g, t, { title: 'FIG 5 - THE JUMP', fig: 'FLUID PRESSURE' });
  const L = legPump(g, t, { ...LEG, s: 1, k: 1, press: pr });
  if (pr > 0.02) glow(g, ...L.fluid, 160, ui().gold, 0.3 * pr / 0.6);
  gauge(g, E.W * 0.8, E.H * 0.3, 90, pr / 0.6 * 0.85);
  bpLabel(g, t, { at: L.fluid, to: [L.fluid[0] - 120, L.fluid[1] - 230], str: 'fluid straightens it', start: tf });
} });
registerShot('s085', { draw(g, t, info) {
  const st = info.shot.start, th = shotWord('hydraulic', st, 0.55), tp = shotWord('pushes', st, 2.35), ts = shotWord('straight', st, 3.25);
  const snap = ease.out(prog(t, tp, ts)), fill = ease.out(prog(t, th, th + 0.4));
  board(g, t, { title: 'FIG 5 - LIKE A HYDRAULIC MACHINE', fig: 'FLUID PRESSURE' });
  const L = legPump(g, t, { x: E.W * 0.3, y: E.H * 0.45, s: 0.7, k: 1, press: lerp(0.6, 1, snap) });
  if (fill > 0) glow(g, ...L.fluid, 130, ui().gold, 0.35 * fill);
  digger(g, E.W * 0.7, E.H * 0.62, 0.9, snap, fill);
  const hk = pop(t, th); if (hk > 0) { g.save(); g.translate(E.W * 0.5, E.H * 0.16); g.scale(hk, hk); gold(g, 'HYDRAULIC', 0, 0, { size: 60 }); g.restore(); }
  if (t > ts && t < ts + 0.2) { g.strokeStyle = alpha(ui().gold, 1 - (t - ts) / 0.2); g.lineWidth = 4; for (const [x, y] of [[E.W * 0.3 + 280, E.H * 0.45 + 30], [E.W * 0.86, E.H * 0.3]]) { g.beginPath(); g.arc(x, y, 40 + (t - ts) * 300, 0, 7); g.stroke(); } }
} });

// ============================== s086 PIP'S LEAP ==============================
registerShot('s086', { draw(g, t, info) {
  const st = info.shot.start, tl = shotWord('leap', st, 1.42), tx = shotWord('times', st, 2.30), tn = shotWord('length', st, 3.32);
  const z = lerp(1, 1.04, ease.inOut(clamp(t / info.dur)));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#a8d0ee', '#d8ecd0', '#6aa060']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.filter = 'blur(14px)'; for (let i = 0; i < 9; i++) { circle(g, 120 + i * 220, 300 + Math.sin(i * 2) * 90, 130, alpha('#4f8a55', 0.7)); } g.restore();
  g.save(); g.translate(E.W / 2, E.H * 0.6); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.6);
  const RY = 700; rr(g, -40, RY, E.W + 80, 110, 6); g.fillStyle = linGrad(g, 0, RY, 0, RY + 110, ['#c8945e', '#9a6a3e']); g.fill(); for (let i = 0; i < 8; i++) seg(g, [[i * 260, RY + 30 + (i % 3) * 20], [i * 260 + 180, RY + 34 + (i % 3) * 20]], 2, alpha('#5a3a20', 0.4));
  const s = 1.8, PL = 70 * s * 1.05, x0 = 300, x1 = x0 + 6 * PL, k = clamp((t - tl) / (tn - tl)), x = lerp(x0, x1, ease.inOut(k)), arc = Math.sin(k * Math.PI) * 300;
  const rk = ease.out(prog(t, tl, tn)); for (let i = 0; i <= 6; i++) { const tx0 = x0 + i * PL; if (i / 6 > rk + 0.01) break; seg(g, [[tx0, RY + 120], [tx0, RY + 150]], 4, ui().gold); } seg(g, [[x0, RY + 135], [lerp(x0, x1, rk), RY + 135]], 5, ui().gold);
  const crouch = t < tl && t > tl - 0.35 ? 0.1 : 0; pip(g, x, RY - arc, s, { t, hop: t >= tl && t < tn ? 0.5 : crouch, tilt: t < tl ? 0.2 : 0, look: [1, 0.2], facing: 1 });
  if (t >= tn && t < tn + 0.2) { g.strokeStyle = alpha('#fff', 1 - (t - tn) / 0.2); g.lineWidth = 3; g.beginPath(); g.ellipse(x1, RY, 60 + (t - tn) * 200, 10, 0, 0, 7); g.stroke(); }
  g.restore();
  const gk = pop(t, tx); if (gk > 0) { g.save(); g.translate(E.W / 2, E.H * 0.16); g.scale(gk, gk); gold(g, '6x BODY LENGTH', 0, 0, { size: 72 }); g.restore(); }
} });

// ============================== s087-s088 FIG 5b ==============================
const BARS = { x: E.W * 0.5, y: E.H * 0.5, w: 1300 };
function bars(g, t, ks, kh, debate) {
  g.save(); g.beginPath(); g.rect(0, 0, E.W, BARS.y - 45); g.clip(); jumpBars(g, t, { ...BARS, k: ks, debate: 0 }); g.restore();
  g.save(); g.beginPath(); g.rect(0, BARS.y - 45, E.W, E.H); g.clip(); jumpBars(g, t, { ...BARS, k: kh, debate }); g.restore();
}
registerShot('s087', { draw(g, t, info) {
  const st = info.shot.start, ts = shotWord('standing', st, 0.53), th = shotWord('humans', st, 2.33), to = shotWord('one', st, 3.49), tf = shotWord('half', st, 3.91);
  board(g, t, { title: 'FIG 5b - FROM A STANDING START', fig: 'BODY LENGTHS' });
  const ks = ease.out(prog(t, 0.15, 1.2)), kh = ease.out(prog(t, th, th + 0.9)), x0 = BARS.x - BARS.w / 2, BL = BARS.w / 7;
  bars(g, t, ks, kh, 0);
  bpLabel(g, t, { at: [x0 + BL * 3, BARS.y - 88], to: [x0 + BL * 3.4, BARS.y - 290], str: 'standing start', start: ts });
  bpLabel(g, t, { at: [x0 + BL * 0.8, BARS.y + 42], to: [x0 + BL * 1.6, BARS.y + 240], str: 'the best humans', start: to });
  if (kh > 0.95) creamShrug(g, x0 + BL * 1.5 + 230, BARS.y + 80, 0.8, ease.out(prog(t, tf, tf + 0.2)) * (1 - prog(t, tf + 0.5, tf + 0.7)) + (t > tf + 0.7 ? 0.3 : 0));
} });
registerShot('s088', { draw(g, t, info) {
  const st = info.shot.start, ta = shotWord('argue', st, 0.96), tp = shotWord('pressure', st, 2.94);
  board(g, t, { title: 'FIG 5b - STILL DEBATED', fig: 'BODY LENGTHS' });
  bars(g, t, 1, 1, prog(t, ta, ta + 0.35));
  const L = legPump(g, t, { x: E.W * 0.2, y: E.H * 0.78, s: 0.3, k: 1, press: 0.5 + 0.5 * Math.sin(t * 2) });
  const qk = pop(t, tp); if (qk > 0) { const b = Math.abs(Math.sin((t - tp) * 7)) * 20 * Math.exp(-(t - tp) * 2); g.save(); g.translate(L.joint[0] + 30, L.joint[1] - 70 - b); g.scale(qk, qk); gold(g, '?', 0, 0, { size: 90 }); g.restore(); }
} });

// ============================== s089 THE MANCHESTER SPIDER ==============================
registerShot('s089', { draw(g, t, info) {
  const st = info.shot.start, tj = shotWord('jump', st, 1.47), tc = shotWord('cue', st, 2.03), tm = shotWord('manchester', st, 2.47);
  const j0 = tc - 0.08, j1 = tc + 0.3, k = clamp((t - j0) / (j1 - j0)), cam = camMove(t, info.dur, { z: [1.9, 1.95], y: [10, 10], drift: 0.2 }); cam.x += lerp(-600, -480, ease.inOut(k));
  const L = lab(g, t, cam, { mood: 'day' }), top = L.GY - 300;
  layer(g, cam, 1, (g) => {
    for (const px of [330, 530]) { rr(g, px - 50, top - 46, 100, 30, 6); g.fillStyle = '#f4f6f8'; g.fill(); g.strokeStyle = '#1a1622'; g.lineWidth = 2.5; g.stroke(); seg(g, [[px, top - 16], [px, top - 2]], 10, '#9aa0aa'); }
    const x = lerp(330, 530, ease.inOut(k)), y = top - 46 - Math.sin(k * Math.PI) * 90;
    labSpider(g, x, y, 0.9, { t, hop: k > 0 && k < 1 ? 0.5 : 0, look: [1, 0], facing: 1, tilt: 0.15 });
    const ck = t > tj && t < tj + 0.12 ? 1 : 0; g.save(); g.translate(660, top - 170 + ck * 6); g.rotate(-0.5); rr(g, -18, 0, 36, 300, 14); g.fillStyle = '#f4f6f8'; g.fill(); g.strokeStyle = '#9aa0aa'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#e8c8a8'; g.beginPath(); g.ellipse(0, -6, 22, 26, 0, 0, 7); g.fill(); rr(g, -14, -38, 28, 20, 5); g.fillStyle = '#2f6fd0'; g.fill(); circle(g, 0, -40 + ck * 3, 5, '#c8ccd4'); g.restore();   // the clicker hand
    if (ck) { g.strokeStyle = alpha('#1a1622', 0.6); g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(620 + i * 10, top - 230); g.lineTo(610 + i * 16, top - 250); g.stroke(); } }
  });
  const mk = pop(t, tm); if (mk > 0) { g.save(); g.translate(E.W * 0.72, E.H * 0.2); g.rotate(-0.04); g.scale(mk, mk); rr(g, -200, -40, 400, 80, 12); g.fillStyle = ui().cream; g.fill(); g.strokeStyle = '#1a1622'; g.lineWidth = 4; g.stroke(); text(g, 'MANCHESTER', 0, 3, { size: 44, color: '#1a1622', font: FONTS.ui, weight: 900, spacing: 4 }); g.restore(); }
} });

// ============================== s090 MUSCLE ALONE? ==============================
registerShot('s090', { draw(g, t, info) {
  const st = info.shot.start, tm = shotWord('muscle', st, 1.03), ta = shotWord('alone', st, 1.43), tc = shotWord('could', st, 1.97);
  const z = lerp(1, 1.04, ease.inOut(clamp(t / info.dur)));
  board(g, t, { title: 'FIG 5b - MUSCLE ALONE?', fig: 'BODY LENGTHS' });
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const L = legPump(g, t, { x: E.W * 0.46, y: E.H * 0.46, s: 0.9, k: 1, press: lerp(1, 0.3, ease.inOut(prog(t, tm, ta))) });
  const mg = ease.out(prog(t, tm, ta)); if (mg > 0) { glow(g, ...L.flexor, 170, ui().gold, 0.45 * mg); seg(g, [[L.flexor[0] - 120, L.flexor[1] - 30], [L.flexor[0] + 40, L.flexor[1] + 10], [L.flexor[0] + 130, L.flexor[1] + 70]], 18, alpha(ui().gold, 0.8 * mg)); }
  bpLabel(g, t, { at: L.flexor, to: [L.flexor[0] - 60, L.flexor[1] - 260], str: 'muscle alone could be enough', start: tc });
  g.restore();
  stamp(g, E.W * 0.8, E.H * 0.8, 0.6, 1);
} });

// ============================== s091 DEV MEASURES ==============================
registerShot('s091', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.07], x: [-120, -90], y: [-20, -20], drift: 0.3 }), fx = E.W / 2 - 320, ftop = E.H * 0.8 - 330, GY = E.H * 0.8;
  const tk = ease.inOut(prog(t, 0.29, 1.05)), dx = lerp(260, 640, tk);
  jumpScene(g, t, cam, { x: fx, y: ftop, pose: idle({ ...POSES.stand, hF: [30, -100], eF: [24, -140] }, t, 3) }, { pipX: fx + 300, expr: 'happy', look: lookToward(-0.6, 1), after: (g) => {
    bodyLength(g, 163, GY + 60, 455 * tk, { k: 1, label: '' });
    const pose = idle(blendPose('reach', 'stand', 0.3), t, 2), o = { x: dx - 60, y: GY + 40, s: HS, facing: -1, pose, expr: 'happy', blink: blinkFlag(t, 3.3, 1), look: lookToward(-0.4, 0.8), rim: null, t };
    actor(g, 'DEV', o);
  } });
} });

// ============================== s092 ONE BODY LENGTH. VERY HUMAN. ==============================
registerShot('s092', { draw(g, t, info) {
  const st = info.shot.start, tb = shotWord('body', st, 0.34), tv = shotWord('very', st, 1.70), th = shotWord('human', st, 2.0), GY = E.H * 0.8;
  const cam = camMove(t, info.dur, { z: [2.1, 2.2], x: [-420, -410], y: [250, 245], drift: 0.15 });
  jumpScene(g, t, cam, null, { noFg: true, after: (g) => {
    bodyLength(g, 163, GY + 60, 455, { k: 0.85 + 0.15 * prog(t, tb - 0.1, tb + 0.1), label: '1 BODY LENGTH' });
    const sk = pop(t, tv), px = 690, py = GY - 330 * 0.22 - 10;
    pip(g, px, py, 0.75, { t, tilt: t > tv ? 0.8 : 0.1, wave: sk, look: [-1, 0.3], blink: blinkFlag(t, 3.5, 2) ? 1 : 0 });
    sign6(g, px + 40, py - 95, 0.8, sk);
  } });
  const tk = ease.out(prog(t, th - 0.2, th + 0.1)); gloveHand(g, E.W - 120 + 200 * (1 - tk), E.H * 0.58, 1.2, -0.25, { thumb: true });
} });

// ============================== s093 DAY 6 - LUNCH ==============================
function kitchenDuo(g, t, cam, o) {
  const H = home3(g, t, cam, KIT), P = H.pos, GY = H.GY;
  layer(g, cam, 1, (g) => {
    const ho = { x: o.hx ?? P.tableX - 330, y: GY, s: HS, facing: 1, pose: o.hpose, expr: o.hexpr, blink: blinkFlag(t, 3.1, 2), look: o.hlook || lookToward(1, 0.2), rim: H.rim, t };
    const dv = { x: o.dx ?? P.tableX + 340, y: GY, s: HS, facing: -1, pose: o.dpose, expr: o.dexpr, blink: blinkFlag(t, 3.4, 1), look: o.dlook || lookToward(-1, 0.2), rim: H.rim, t };
    actor(g, 'DEV', dv); actor(g, 'HERO', ho); gloves(g, ho, o.hpose, { t });
    if (o.after) o.after(g, H, ho, dv);
  });
  home3Fg(g, t, cam, { room: 'kitchen' });
  return H;
}
function plateBurger(g, x, y, s, o) { g.fillStyle = '#f4f2f6'; g.beginPath(); g.ellipse(x, y + 4 * s, 130 * s, 20 * s, 0, 0, 7); g.fill(); g.strokeStyle = '#1a1622'; g.lineWidth = 3; g.stroke(); burger(g, x, y, s, o); }
registerShot('s093', { draw(g, t, info) {
  const st = info.shot.start, th = shotWord('hands', st, 1.64), tb = shotWord('burger', st, 2.28);
  const cam = camMove(t, info.dur, { z: [1.02, 1.05], drift: 0.3 }), k = ease.inOut(prog(t, th, tb));
  const hpose = idle(k > 0.6 ? POSES.holdFront : POSES.relaxed, t, 2), dpose = idle(k > 0 && k < 1 ? POSES.reach : POSES.holdFront, t, 1);
  kitchenDuo(g, t, cam, { hpose, dpose, hexpr: exprAt(t, [[0, 'neutral'], [tb - 0.2, 'surprised']]), dexpr: 'happy', after: (g, H, ho, dv) => {
    const [hx, hy] = hand(hpose, ho.x, ho.y, HS, 1), [dx, dy] = hand(dpose, dv.x, dv.y, HS, -1);
    plateBurger(g, lerp(dx - 30, hx + 40, k), lerp(dy, hy, k) - 6, 0.42, { t, look: 0 });
  } });
  g.save(); g.globalAlpha *= 1 - prog(t, 1.4, 1.7); dayCard(g, t, { day: 6, title: 'LUNCH', at: 0.30, y: E.H * 0.3 }); g.restore();
} });

// ============================== s094 GIANT FACE: YOUR BODY HAS AN IDEA ==============================
registerShot('s094', { draw(g, t, info) {
  const z = lerp(1, 1.05, ease.inOut(clamp(t / info.dur))), cx = E.W * 0.42, cy = E.H * 0.47, r = 330;
  g.save(); g.filter = 'blur(10px)'; home3(g, t, { z: 1.5, x: 0, y: -40, r: 0 }, KIT); g.restore();
  g.fillStyle = 'rgba(20,14,10,.25)'; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  const f = faceAt(t, [[0, 'neutral'], [0.73, 'suspicious'], [1.45, 'shocked']]), hungry = ease.out(prog(t, 1.45, 1.7));
  const gur = t > 1.0 && t < 1.4 ? Math.sin(t * 50) * (1 - (t - 1.0) / 0.4) : 0;
  giantFace(g, cx + gur * 4, cy, r, { who: 'HERO', f: { ...f, pupil: lerp(f.pupil ?? 1, 1.7, hungry), look: [0.5, 0.45] }, rimSide: -1, rimColor: '#ffd9a0', blink: blinkFlag(t, 3.4, 1) ? 1 : 0, breath: Math.sin(t * 2) });
  plateBurger(g, cx + 420, cy + 330, 0.85, { t, look: 0, wobble: Math.abs(gur) });
  gloveHand(g, cx + 560, cy + 380, 1.0, 0.5);
  g.restore();
} });

// ============================== s095-s096 FIG 6 LUNCH ==============================
function spiderHead(g, x, y, s) { const U = ui(); g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = U.cream; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 0, 170, 140, 0, 0, 7); g.stroke();
  for (const ex of [-55, 55]) { ring(g, ex, -20, 44, 5, U.cream); circle(g, ex + 8, -30, 10, alpha(U.cream, 0.8)); } for (const ex of [-120, 120]) ring(g, ex, -60, 16, 4, U.cream);
  for (const fx of [-30, 30]) { g.beginPath(); g.moveTo(fx - 14, 120); g.quadraticCurveTo(fx, 170, fx + 10, 150); g.lineTo(fx + 14, 120); g.stroke(); } g.restore(); }
function tooth(g, x, y, s) { const U = ui(); g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = U.cream; g.lineWidth = 5; g.beginPath(); g.moveTo(-50, -50); g.quadraticCurveTo(-60, 40, -30, 70); g.lineTo(-14, 20); g.lineTo(14, 20); g.lineTo(30, 70); g.quadraticCurveTo(60, 40, 50, -50); g.quadraticCurveTo(0, -80, -50, -50); g.stroke(); g.restore(); }
function blob(g, x, y, s, melt = 0) { const U = ui(); g.save(); g.translate(x, y); g.scale(s * (1 + melt * 0.4), s * (1 - melt * 0.55)); g.fillStyle = alpha(U.cream, 0.18); g.strokeStyle = U.cream; g.lineWidth = 5; g.beginPath(); g.moveTo(-90, 0); g.quadraticCurveTo(-100, -90, 0, -100); g.quadraticCurveTo(100, -90, 90, 0); g.closePath(); g.fill(); g.stroke();
  if (melt < 0.3) for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-40 + i * 26, -94); g.lineTo(-30 + i * 22, -60); g.stroke(); } g.restore(); }
function xMark(g, x, y, k, d = 46) { if (k <= 0) return; const e = d * k; seg(g, [[x - e, y - e], [x + e, y + e]], 12, ui().gold); seg(g, [[x + e, y - e], [x - e, y + e]], 12, ui().gold); }
const FOOD = { x: E.W * 0.62, y: E.H * 0.72 };
registerShot('s095', { draw(g, t, info) {
  const st = info.shot.start, tch = shotWord('chew', st, 1.10), tco = shotWord('cover', st, 2.28), tj = shotWord('juices', st, 3.82);
  board(g, t, { title: 'FIG 6 - LUNCH', fig: 'DIGESTIVE JUICES' });
  const dk = ease.out(prog(t, 0, 0.6)); g.save(); g.globalAlpha *= dk; spiderHead(g, E.W * 0.26, E.H * 0.45, 1); tooth(g, E.W * 0.62, E.H * 0.3, 1); blob(g, FOOD.x, FOOD.y, 1); g.restore();
  xMark(g, E.W * 0.62, E.H * 0.3, ease.out(prog(t, tch, tch + 0.25)), 70);
  if (t > tch) gold(g, "can't chew", E.W * 0.62 + 140, E.H * 0.3, { align: 'left', alpha: prog(t, tch + 0.1, tch + 0.4) });
  const R = rng(5), n = Math.round(14 * prog(t, tco, tj)); for (let i = 0; i < n; i++) { const ti = tco + i * (tj - tco) / 14, u = clamp((t - ti) / 0.4), px = FOOD.x - 80 + R() * 160, py = lerp(FOOD.y - 300, FOOD.y - 90 + R() * 70, ease.in(u));
    g.fillStyle = ui().gold; g.beginPath(); g.moveTo(px, py - 16); g.quadraticCurveTo(px + 11, py + 2, px, py + 8); g.quadraticCurveTo(px - 11, py + 2, px, py - 16); g.fill(); }
  bpLabel(g, t, { at: [FOOD.x + 80, FOOD.y - 60], to: [FOOD.x + 260, FOOD.y - 200], str: 'digestive juices', start: tco + 0.3 });
} });
registerShot('s096', { draw(g, t, info) {
  const st = info.shot.start, tf = shotWord('for', st, 0.29), ts = shotWord('soup', st, 0.55), tl = shotWord('slurp', st, 1.11);
  board(g, t, { title: 'FIG 6 - LUNCH', fig: 'DIGESTIVE JUICES' });
  const U = ui(), m = ease.inOut(prog(t, tf - 0.1, ts + 0.1)), lvl = 1 - ease.inOut(prog(t, tl, tl + 0.55));
  spiderHead(g, E.W * 0.26, E.H * 0.45, 1);
  if (m < 1) { g.save(); g.globalAlpha *= 1 - m; blob(g, FOOD.x, FOOD.y - 20, 1, m); g.restore(); }
  const bx = FOOD.x, by = FOOD.y; g.save(); g.globalAlpha *= m; g.strokeStyle = U.cream; g.lineWidth = 5; g.beginPath(); g.moveTo(bx - 150, by - 70); g.quadraticCurveTo(bx - 140, by + 60, bx, by + 60); g.quadraticCurveTo(bx + 140, by + 60, bx + 150, by - 70); g.closePath(); g.stroke();
  if (lvl > 0.02) { g.save(); g.beginPath(); g.moveTo(bx - 150, by - 70); g.quadraticCurveTo(bx - 140, by + 60, bx, by + 60); g.quadraticCurveTo(bx + 140, by + 60, bx + 150, by - 70); g.closePath(); g.clip(); g.fillStyle = alpha(U.gold, 0.6); g.fillRect(bx - 160, lerp(by + 60, by - 60, lvl) + Math.sin(t * 20) * 3 * (t > tl ? 1 : 0), 320, 200); g.restore(); }
  g.restore();
  const dip = ease.out(prog(t, tl - 0.25, tl)); if (dip > 0) { const wig = t > tl ? Math.sin(t * 22) * 4 : 0; seg(g, [[bx + 60 + wig, by - 300 + 230 * dip], [bx + 120, by - 520 + 230 * dip]], 14, U.cream); }
  if (t > tl + 0.6 && t < tl + 1.0) { const k = (t - tl - 0.6) / 0.4; for (let i = 0; i < 5; i++) { const a = i * 1.25; circle(g, bx + Math.cos(a) * 60 * k, by - 120 + Math.sin(a) * 40 * k, 6 * (1 - k), U.gold); } }
  bpLabel(g, t, { at: [bx - 120, by - 40], to: [bx - 340, by - 240], str: 'wait for soup', start: ts });
} });

// ============================== s097 THE BURGER LOOKS BACK ==============================
registerShot('s097', { draw(g, t, info) {
  const st = info.shot.start, tl = shotWord('look', st, 0.35), tb = shotWord('burger', st, 1.97, ), ta = shotWord('at', st + 2.2, 0.27) + 2.2;
  const cam = camMove(t, info.dur, { z: [2.2, 2.32], x: [-60, -60], y: [-120, -125], drift: 0.15 });
  g.save(); g.filter = 'blur(8px)'; home3(g, t, cam, KIT); g.restore();
  g.save(); g.filter = 'blur(5px)'; giantFace(g, E.W * 0.3, E.H * 0.36, 300, { who: 'HERO', f: { ...faceAt(t, [[0, 'neutral'], [tl, 'suspicious']]), look: [0.8, 0.5] }, rimSide: 1, rimColor: '#ffd9a0', blink: 0 }); g.restore();
  const lk = ease.outBack(prog(t, tb, tb + 0.25));
  g.fillStyle = '#8a5a3a'; g.fillRect(0, E.H * 0.8, E.W, E.H * 0.2);
  plateBurger(g, E.W * 0.6, E.H * 0.8, 1.9, { t, look: lk, blink: t > ta + 0.5 && t < ta + 0.6, sweat: prog(t, ta, ta + 0.2), wobble: prog(t, tb, tb + 0.1) * (1 - prog(t, tb + 0.4, tb + 0.6)) });
} });

// ============================== s098 MILKSHAKE INSTEAD ==============================
registerShot('s098', { draw(g, t, info) {
  const st = info.shot.start, tm = shotWord('milkshake', st, 0.59);
  const cam = camMove(t, info.dur, { z: [1.06, 1.1], y: [-30, -40], drift: 0.3 }), slide = ease.inOut(prog(t, 0, 0.4)), lift = ease.out(prog(t, 0.35, tm));
  const hpose = idle(lift > 0.5 ? { ...POSES.holdFront, hF: [34, -176], eF: [26, -136] } : POSES.reach, t, 2), dpose = idle(POSES.holdFront, t, 1);
  kitchenDuo(g, t, cam, { hpose, dpose, hexpr: exprAt(t, [[0, 'neutral'], [tm, 'joy']]), dexpr: exprAt(t, [[0, 'happy'], [0.4, 'surprised']]), hlook: lookToward(0.3, 0.3), after: (g, H, ho, dv) => {
    const P = H.pos, [dx, dy] = hand(dpose, dv.x, dv.y, HS, -1), [hx, hy] = hand(hpose, ho.x, ho.y, HS, 1);
    const bx = lerp(P.tableX - 60, P.tableX + 200, slide), by = P.tableTop - 14;
    if (t < 0.9) plateBurger(g, lerp(bx, dx - 20, prog(t, 0.6, 0.9)), lerp(by, dy, prog(t, 0.6, 0.9)), 0.42, { t, look: 1 });
    else plateBurger(g, dx - 20, dy, 0.42, { t, look: 1, blink: t > 1.8 && t < 1.9 });
    const mx = lerp(P.tableX - 160, hx + 6, lift), my = lerp(P.tableTop - 14, hy + 60, lift), lvl = 1 - 0.5 * ease.inOut(prog(t, tm, info.dur));
    milkshake(g, mx, my, 0.42, { t, level: lvl, sip: t > tm ? 1 : 0, cherry: true });
    pip(g, mx + 52 * 0.42 + 4, my - 340 * 0.42, 0.32, { t, tilt: 0.3, look: [-1, 0.4] });
  } });
} });
