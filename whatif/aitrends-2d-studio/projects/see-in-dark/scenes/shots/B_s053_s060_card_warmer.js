// B_s053_s060_card_warmer.js — batch B: RULE 3 (heat has no colour), the birthday card that says get well soon, the hand-warmer PLANT (paid off in C s099-s101).
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, shade, mix, rng, talkAmount } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { thermalView, heatActor, heatBlob, heatRect, heat } from '../sets/thermal.js';
import { chip, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, talkGesture, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { W, handWorld, scr, punch, card, warmer, WARMER } from './B_lib.js';

const CX = E.W / 2;
const pocketOf = (o) => [o.x + 8 * (o.facing ?? 1) * o.s, o.y - 122 * o.s];          // hoodie front pocket (world), o = HERO actor opts
// Mina's phone lying on the table, screen up: the key light of the table scenes
function tablePhone(g, x, y, t, a = 1) { rr(g, x - 26, y - 8, 52, 10, 3); g.fillStyle = '#1a1a22'; g.fill(); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - 8, 4, x, y - 260, 380); gr.addColorStop(0, `rgba(220,236,255,${0.3 * a})`); gr.addColorStop(1, 'rgba(220,236,255,0)'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x - 24, y - 8); g.lineTo(x - 330, y - 520); g.lineTo(x + 330, y - 520); g.lineTo(x + 24, y - 8); g.fill(); g.restore(); glow(g, x, y - 8, 60, '#e8f2ff', 0.7 * a); }

// s053 — "Rule three. Heat has no colour."  RULE 3 over the kitchen table drawn dim; a blank birthday card catches the banner glow
registerShot('s053', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.28, 1.36], x: [-130, -90], y: [130, 124] });
  ruleCard(g, t, info, { n: 3, title: 'HEAT HAS NO COLOUR', accent: '#ffd47e', bg: (g, t) => {
    const A = apartment(g, t, cam, { power: 0 });
    layer(g, cam, 1, (g) => { const tx = A.pos.tableX + 40, ty = A.pos.tableTop; card(g, tx, ty - 10, 200, 40, { text: 0, rot: 0.04 }); glow(g, tx, ty - 40, 220, '#ffd47e', 0.22 + 0.08 * Math.sin(t * 2)); tablePhone(g, tx - 200, ty - 2, t, 0.6); });
    apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#ffe6b0' });
  } });
} });

// s054 — "Mina slides a birthday card across the table, and in the dark it's a"  two-shot at the table; Mina's phone is the key light
registerShot('s054', { draw(g, t, info) {
  const tSl = W('slides', info, 0.27), tAc = W('across', info, 1.19), tDark = W('dark', info, 2.65), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.32, 1.4], x: [-130, -100], y: [130, 120] });
  const A = apartment(g, t, cam, { power: 0 }), T = { x: A.pos.tableX, top: A.pos.tableTop };
  const mina = { x: T.x - 380, y: GY + 30, s: 2.1, facing: 1, kid: true }, hero = { x: T.x + 370, y: GY + 30, s: 1.9, facing: -1 };
  const minaPose = idle(poseAt(t, [[0, 'stand'], [tSl - 0.15, 'reach'], [tAc + 0.6, 'holdFront']], 0.3), t, 1);
  const heroPose = idle(poseAt(t, [[0, 'stand'], [tAc, 'reach'], [tDark, 'think']], 0.35), t, 3);
  const slide = ease.inOut(prog(t, tSl, tAc + 0.5)), cx = lerp(T.x - 180, T.x + 130, slide);
  layer(g, cam, 1, (g) => {
    tablePhone(g, T.x - 40, T.top, t);
    actor(g, 'MINA', { ...mina, pose: minaPose, t, rim: { color: '#dceaff', dir: [0.8, -0.3] }, expr: exprAt(t, [[0, 'smile'], [tSl, 'happy'], [tAc + 0.4, 'smirk']]), blink: blinkFlag(t, 2.8, 9), look: lookToward(1, 0.25) });
    actor(g, 'HERO', { ...hero, pose: heroPose, t, rim: { color: '#dceaff', dir: [-0.8, -0.3] }, rot: -0.1 * ease.inOut(prog(t, tAc, tAc + 0.6)), expr: exprAt(t, [[0, 'neutral'], [tAc, 'surprised'], [tDark, 'thinking']]), blink: blinkFlag(t, 3.4, 3), look: lookToward(-0.6, 0.6) });
    card(g, cx, T.top - 8, 190, 34, { text: 0, rot: 0.02 }); card(g, cx, T.top - 30, 170, 30, { text: 0, fill: '#e8d6f4', rot: -0.05 });   // a lilac card in its envelope sleeve
    for (let i = 0; i < 5; i++) circle(g, cx - 70 + i * 34, T.top - 34, 5, ['#e0453a', '#f08a24', '#e9c12e', '#3fae5a', '#3f7fd6'][i]);
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: '#dceaff' });
} });

// s055 — "blank, warm rectangle, because ink and paper are the same temperature."  THERMAL insert: one even warm rectangle in warm hands
registerShot('s055', { draw(g, t, info) {
  const tBl = W('blank', info, 0.15), tInk = W('ink', info, 1.75), tSame = W('same', info, 2.83), cam = camMove(t, info.dur, { z: [1.0, 1.07], y: [0, -10] });
  thermalView(g, t, {
    cold: (c) => { c.fillStyle = '#2a2236'; c.fillRect(0, 0, E.W, E.H); c.fillStyle = '#3a3048'; c.fillRect(0, E.H * 0.72, E.W, E.H); for (let i = 0; i < 6; i++) { c.fillStyle = '#463a56'; c.fillRect(i * 340 + 40, E.H * 0.1, 260, 18); } },
    hot: (c) => layer(c, cam, 1, (c) => {
      const w = 860, h = 540, x = CX - w / 2, y = E.H * 0.47 - h / 2;
      heatRect(c, x, y, w, h, 0.5, 14);                                                                                 // the card: one even temperature, no words
      for (const s of [-1, 1]) { const hx = CX + s * (w / 2 + 10), hy = E.H * 0.62 + Math.sin(t * 1.4 + s) * 6;    // his warm hands hold the edges
        c.save(); c.translate(hx, hy); c.rotate(s * -0.2); rr(c, -70, -70, 140, 170, 60); c.fillStyle = heat(0.9); c.fill(); for (let i = 0; i < 4; i++) { rr(c, -s * 40 - 26 + 0, -150 + i * 44, 80, 34, 17); c.fillStyle = heat(0.86); c.fill(); } c.restore();
        heatBlob(c, hx, hy, 160, 160, 0.4, 0.9); heatRect(c, hx - 80 + s * 60, hy + 80, 160, 300, 0.55, 40); }
    }),
    hud: { label: 'THERMAL', temp: t > tBl ? '30 C  CARD' : null, track: scr(cam, CX - 330, E.H * 0.3) },
  });
  if (t > tBl) { const k = ease.out(prog(t, tBl, tBl + 0.4)) * clamp((info.dur - t) / 0.3); g.save(); g.globalAlpha = 0.55 * k; g.setLineDash([14, 12]); g.strokeStyle = '#ffffff'; g.lineWidth = 3; const [x0, y0] = scr(cam, CX - 430, E.H * 0.47 - 270), [x1, y1] = scr(cam, CX + 430, E.H * 0.47 + 270); g.strokeRect(x0, y0, x1 - x0, y1 - y0); g.restore(); }
  if (t > tInk) text(g, '?', CX, E.H * 0.46, { size: 150, color: alpha('#fff6e0', 0.75), font: FONTS.title, weight: 700, alpha: ease.out(prog(t, tInk, tInk + 0.4)) * clamp((info.dur - t) / 0.3), stroke: 10, strokeColor: 'rgba(80,20,40,.5)' });
  chip(g, t, { str: 'Ink = paper = same temp', at: tSame, x: CX, y: E.H * 0.88, dur: info.dur - 0.1 });
} });

// s056 — 'You guess "happy birthday."'  quick comic beat: HERO holds the card up proudly in the dark, confident smile
registerShot('s056', { draw(g, t, info) {
  const tHap = W('happy', info, 0.85), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.42, 1.5], x: [150, 170], y: [150, 140] });
  const A = apartment(g, t, cam, { power: 0 });
  const hero = { x: CX + 140, y: GY + 30, s: 1.95, facing: -1 }, pose = idle(poseAt(t, [[0, 'holdFront'], [tHap - 0.2, 'reach']], 0.22), t, 2);
  const [hx, hy] = handWorld(hero, pose);
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...hero, pose, t, rim: A.rim, expr: exprAt(t, [[0, 'smirk'], [tHap, 'happy']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(-0.6, -0.6) });
    card(g, hx - 50, hy - 20, 190, 130, { text: 0, rot: 0.12 });                                                          // the front: just confetti dots, he can't read it
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#c9d4ff' });
  chip(g, t, { str: 'Happy birthday?', at: tHap, x: E.W * 0.22, y: E.H * 0.4, dur: info.dur - 0.06 });
} });

// s057 — 'It says "get well soon."'  GIANT FACE in Mina's phone light: cheeky -> sheepish with a sweat drop; the card now readable beside him
registerShot('s057', { draw(g, t, info) {
  const tGet = W('get', info, 0.83), tSoon = W('soon', info, 1.25), pk = punch(t, tGet, 0.08, 0.4);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] }); cam.z += 0.03 * pk;
  blurLayer(g, 16, (c) => apartment(c, t, { z: 2.2, x: -360, y: -60 }, { power: 0 }), null, 1); veil(g, '#05060f', 0.45);
  FX.lightCone(g, -60, E.H * 0.55, { angle: 0, spread: 0.7, len: 1500, color: '#e8f2ff', a: 0.16 });                  // Mina's phone torch from the left
  const f = faceAt(t, [[0, 'cheeky'], [tGet, 'shocked'], [tSoon, 'sheepish']], 0.14);
  layer(g, cam, 1, (g) => {
    const cx = E.W * 0.34, cy = E.H * 0.58;
    giantFace(g, cx, cy, 320, { who: 'HERO', f, rimSide: -1, rimColor: '#e8f2ff', blink: blinkAmt(t, 3.3, 1), breath: Math.sin(t * 2.2), tilt: lerp(0.03, -0.05, ease.inOut(prog(t, tGet, tSoon + 0.3))) });
    const rk = ease.outBack(prog(t, 0.05, 0.45)); g.save(); g.translate(E.W * 0.74, E.H * 0.5); g.scale(rk, rk); card(g, 0, 0, 560, 400, { rot: -0.06, text: ease.out(prog(t, tGet - 0.1, tGet + 0.25)) }); g.restore();
    glow(g, E.W * 0.74, E.H * 0.5, 420, '#e8f2ff', 0.12);
  });
  atmos(g, t, cam, { color: '#e8f2ff' });
} });

// s058 — "Then she tucks a hand warmer into your hoodie pocket."  two-shot: Mina tucks the glowing warmer in; HERO looks down, surprised
registerShot('s058', { draw(g, t, info) {
  const tTuck = W('tucks', info, 0.59), tHW = W('hand', info, 0.95), tPock = W('pocket', info, 2.21), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.42, 1.54], x: [-10, 30], y: [160, 150] });
  const A = apartment(g, t, cam, { power: 0 });
  const hero = { x: CX + 140, y: GY + 30, s: 1.95, facing: -1 }, mina = { x: CX - 110, y: GY + 30, s: 2.2, facing: 1, kid: true };
  const heroPose = idle(poseAt(t, [[0, 'stand'], [tHW, 'sheepish'], [tPock + 0.2, 'relaxed']], 0.3), t, 2);
  const minaPose = idle(poseAt(t, [[0, 'holdFront'], [tTuck, 'reach'], [tPock + 0.15, 'stand']], 0.3), t, 1);
  const P = pocketOf(hero), [mx, my] = handWorld(mina, minaPose), into = ease.inOut(prog(t, tTuck + 0.2, tPock));
  const wx = lerp(mx + 10, P[0], into), wy = lerp(my - 6, P[1], into);
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...hero, pose: heroPose, t, rim: A.rim, expr: exprAt(t, [[0, 'neutral'], [tHW, 'surprised'], [tPock + 0.1, 'smile']]), blink: blinkFlag(t, 3.5, 2), look: lookToward(-0.3, 1) });
    if (into < 1) warmer(g, wx, wy, 1.7, { lit: 0.6 }); else { glow(g, P[0], P[1], 80, '#ff9a50', 0.35 + 0.05 * Math.sin(t * 5)); }
    actor(g, 'MINA', { ...mina, pose: minaPose, t, rim: A.rim, expr: exprAt(t, [[0, 'smile'], [tPock, 'happy']]), blink: blinkFlag(t, 2.7, 4), look: lookToward(1, -0.2) });
    if (t > tPock) FX.rings(g, P[0], P[1], t, { count: 2, r0: 12, r1: 70, color: '#ffb070', a: 0.45 * (1 - prog(t, tPock, tPock + 0.6)) });
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
} });

// s059 — '"Keep it," she says, "I've got the twin."'  Mina medium: talks, holds up the identical warmer, winks on "twin"; fairy-light bokeh
registerShot('s059', { draw(g, t, info) {
  const tKeep = W('Keep', info, 0.15), tTwin = W('twin', info, 1.79), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.62, 1.72], x: [-200, -170], y: [210, 200] });
  const A = apartment(g, t, cam, { power: 0 });
  blurLayer(g, 10, (c) => { for (let i = 0; i < 14; i++) { const x = 120 + i * 130, y = E.H * 0.2 + Math.sin(i * 1.7) * 40; glow(c, x, y, 50, ['#ffd47e', '#ff8ab0', '#9fd8ff'][i % 3], 0.55 + 0.25 * Math.sin(t * 2 + i)); } }, null, 1);   // fairy-light bokeh
  const mina = { x: CX - 190, y: GY + 30, s: 2.25, facing: 1, kid: true };
  const pose = t < tTwin - 0.3 ? talkGesture(t, 2) : idle(poseAt(t, [[0, 'talk'], [tTwin - 0.3, 'reach']], 0.25), t, 2);
  const [hx, hy] = handWorld(mina, pose);
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { ...mina, pose, t, rim: A.rim, expr: exprAt(t, [[0, 'smile'], [tTwin, 'smirk']]), talk: talkAmount(info.globalT, info.shot.start + tKeep - 0.05, info.shot.end), blink: t > tTwin && t < tTwin + 0.35 ? true : blinkFlag(t, 2.9, 3), look: lookToward(1, -0.1) });
    if (t > tTwin - 0.35) warmer(g, hx + 12, hy - 18, 1.7, { lit: 0.5 + 0.1 * Math.sin(t * 5), rot: 0.15 });
    if (t > tTwin) FX.sparkle(g, hx + 60, hy - 70, 26 * ease.outBack(prog(t, tTwin, tTwin + 0.3)), '#fff3c4', 0.9);
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
} });

// s060 — "To you, it burns like a tiny coal. Hold on to that."  THERMAL close on the pocket: a white-hot spark through the fabric (PLANT)
registerShot('s060', { draw(g, t, info) {
  const tCoal = W('coal', info, 1.65), tHold = W('Hold', info, 2.29), GY = apartmentGround();
  const hero = { x: CX + 60, y: GY + 30, s: 1.95, facing: -1 }, P = pocketOf(hero);
  const cam = camMove(t, info.dur, { z: [2.1, 2.6], x: [P[0] - CX + 30, P[0] - CX], y: [P[1] - E.H / 2 + 20, P[1] - E.H / 2] });
  const pulse = 0.96 + 0.04 * Math.sin(t * 7), shimmer = ease.out(prog(t, tHold - 0.1, tHold + 0.3));
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatActor(c, 'HERO', { ...hero, pose: idle(poseAt(t, [[0, 'relaxed']]), t, 2), t, expr: 'smile', heat: 0.72, halo: false });
      heatRect(c, P[0] - WARMER.w * 0.55, P[1] - WARMER.h * 0.55, WARMER.w * 1.1, WARMER.h * 1.1, 1.0 * pulse, 10);       // the warmer: white-hot, like a coal
      heatBlob(c, P[0], P[1], 70, 52, 0.32 + 0.12 * shimmer * Math.sin(t * 9), 0.8);
    }),
    hud: { label: 'THERMAL', temp: t > tCoal - 0.3 ? '54 C  HAND WARMER' : null, track: scr(cam, P[0], P[1]) },
  });
  const [sx, sy] = scr(cam, P[0], P[1]);
  if (t > tCoal - 0.2) FX.sparkle(g, sx, sy, 60 * ease.outBack(prog(t, tCoal - 0.2, tCoal + 0.2)) * (0.85 + 0.15 * Math.sin(t * 8)), '#ffffff', 0.9);
  if (shimmer > 0) FX.rings(g, sx, sy, t, { count: 3, r0: 40, r1: 220, color: '#fff6d8', a: 0.4 * shimmer });
  FX.dust(g, t, { count: 22, color: '#ffd8a0', a: 0.25 });
} });
