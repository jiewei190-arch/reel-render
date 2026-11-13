// A_open.js — THE RULES #1 batch A (s001-s010, 0-25.17 s), vertical 9:16. Word beats are the times written in the shot texts
// (seconds from shot start; words.json drifts on a few lines). Faces and text stay above y 1440 and left of x 900 (Instagram UI).
//   s001 wide: the Hale house at night, Mrs. Hale's tail-lights slide away, the porch light blinks off by itself on 'Mrs.'; a curtain settles upstairs
//   s002 med: kitchen, $50 + keys on the counter, headlights sweep the window on 'Hale', she picks up the bill on 'fifty', glances at the ceiling on 'tonight'
//   s003 med: the fridge: the folded note under a tiny house magnet (its upstairs window painted black); she slides it out on 'note'
//   s004 insert: the note in her hands, the numbers 1-4 ink in on 'Four'; the 4 is pressed hard at the bottom edge, a different hand
//   s005 insert: rule 1 writes on on 'one'; the lamp flickers once on 'Rule'
//   s006 med: the basement door, bolt shot home, the gap underneath breathes; she turns her head to it on 'basement'
//   s007 face: "Whatever you hear." eyes slide toward the door on 'hear'; after it the gap under the door goes a shade darker
//   s008 insert: rule 2 writes on on 'two'; 'wait.' underlined twice; the lamp a little dimmer
//   s009 med: the hallway bulb, she stops by the switch on 'light', reaches on 'off', snaps back on "don't"; child-height fingerprints on the plate
//   s010 face: back to the wall, she swallows on 'wait' and stops breathing; the bulb's light stops at the bottom step like a wall
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad } from '/engine/core.js';
import { POSES, headPos } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, walkAlong, camMove } from '../sets/acting.js';
import { house, houseFg } from '../sets/house.js';
import { note, scrawl, grain, vignette, coldGrade, breathe, flicker, motes } from '../sets/horror.js';
import { chip } from '../sets/hud.js';

const HS = 2.3, MOON = '#9fb8ff', WARM = '#ffcf8a';
const look = (g, t, a = 1) => { coldGrade(g, 0.4 * a); vignette(g, 0.78); breathe(g, t, 0.25); grain(g, t, 0.08); };
const blinkH = (t) => blinkFlag(t, 3.3, 7);

registerShot('s001', { draw(g, t, info) {
  const tMrs = 0.44, cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [-160, -180], drift: 0.5 });
  const H = house(g, t, cam, { room: 'exterior', lit: 'up' }), GY = H.GY, p = H.pos;
  layer(g, cam, 1, (g) => {
    // the porch light: on, then it blinks off by itself on 'Mrs.'
    const on = t < tMrs ? 1 : t < tMrs + 0.06 ? 0.4 : t < tMrs + 0.1 ? 0.8 : 0;
    rr(g, p.doorX + 90, GY - 330, 28, 40, 6); g.fillStyle = on > 0.1 ? mix('#3a3022', '#ffe0a0', on) : '#1a1a20'; g.fill(); if (on > 0.1) glow(g, p.doorX + 104, GY - 310, 260, WARM, 0.45 * on);
    // the curtain in the lit window settles back, as if just let go
    const cx = p.houseX + 170, cy = GY - 860, sw = Math.exp(-t * 1.6) * Math.sin(t * 5.5) * 26 + 18 * Math.exp(-t * 2.2);
    g.save(); g.beginPath(); g.rect(cx - 64, cy - 94, 128, 188); g.clip(); g.fillStyle = alpha('#6a3a22', 0.85); g.beginPath(); g.moveTo(cx - 64, cy - 94); g.lineTo(cx - 8 + sw, cy - 94); g.quadraticCurveTo(cx - 20 + sw * 1.6, cy, cx - 30 + sw * 0.6, cy + 94); g.lineTo(cx - 64, cy + 94); g.closePath(); g.fill(); g.restore();
    // Mrs. Hale's car: pulling out of the drive, red tail-lights sliding off frame left
    const k = ease.in(prog(t, 0.2, 1.5)), carX = lerp(p.houseX - 200, -E.W * 0.6, k), cy2 = GY + 130;
    rr(g, carX - 230, cy2 - 60, 460, 110, 36); g.fillStyle = '#080a12'; g.fill(); rr(g, carX - 120, cy2 - 120, 260, 80, 26); g.fill();
    for (const dx of [200, 214]) { rr(g, carX + dx, cy2 - 40, 18, 30, 6); g.fillStyle = '#ff2a2a'; g.fill(); } glow(g, carX + 214, cy2 - 26, 220, '#ff2a2a', 0.55); glow(g, carX + 220, cy2 + 40, 300, '#ff2a2a', 0.15);
  });
  houseFg(g, t, cam, { room: 'exterior' }); look(g, t);
} });

// a folded $50 bill + a ring of house keys on the counter (local props)
function bill(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -60, -24, 120, 48, 4); g.fillStyle = '#7fae7a'; g.fill(); g.strokeStyle = '#4a6a46'; g.lineWidth = 3; g.stroke(); circle(g, 0, 0, 14, '#5a8a56'); text(g, '50', -38, -8, { size: 18, color: '#2a4a26', font: FONTS.ui, weight: 900 }); text(g, '50', 38, 10, { size: 18, color: '#2a4a26', font: FONTS.ui, weight: 900 }); g.restore(); }
function keys(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); ring(g, 0, 0, 18, 4, '#b8b8c0'); for (const [a, l] of [[-0.6, 50], [0.3, 44], [1.1, 38]]) { g.save(); g.rotate(a); rr(g, 14, -7, l, 14, 4); g.fillStyle = '#c8c0a0'; g.fill(); g.restore(); } g.restore(); }

registerShot('s002', { draw(g, t, info) {
  const tHale = 0.17, tFifty = 0.91, tTon = 2.73;
  const cam = camMove(t, info.dur, { z: [1.02, 1.08], x: [-120, -100], y: [300, 290], drift: 0.4 });
  const H = house(g, t, cam, { room: 'kitchen', lights: { lamp: 1, hall: 0.6 }, clock: '11:10' }), p = H.pos, GY = H.GY;
  // headlights sweep across the window behind her on 'Hale'
  const hk = prog(t, tHale, tHale + 1.3); if (hk > 0 && hk < 1) layer(g, cam, 0.6, (g) => { g.save(); g.beginPath(); g.rect(p.windowX - 220, GY - 1050, 440, 470); g.clip(); glow(g, lerp(p.windowX + 320, p.windowX - 320, hk), GY - 820, 260, '#fff4d8', 0.6 * Math.sin(hk * Math.PI)); g.restore(); });
  layer(g, cam, 1, (g) => {
    // the crayon drawing on the fridge (a house, a stick child) in a home with no high chair, no toys
    g.save(); g.translate(p.fridgeX - 60, p.fridgeTop + 420); g.rotate(0.05); rr(g, -70, -90, 140, 180, 3); g.fillStyle = '#f4f0e6'; g.fill(); seg(g, [[-40, 40], [-40, -10], [0, -40], [40, -10], [40, 40], [-40, 40]], 4, '#d8402a'); seg(g, [[50, 60], [50, 20]], 4, '#2a4ad8'); circle(g, 50, 12, 8, '#2a4ad8'); circle(g, 30, -70, 6, '#e8c020'); g.restore();
    const hx = p.counterL + 420, taken = t > tFifty + 0.15;
    if (!taken) bill(g, hx + 190, p.counterTop - 8, 1.4, 0.08); keys(g, hx + 330, p.counterTop - 8, 1.3);
    const o = { x: hx, y: GY + 40, s: 2.6, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tFifty, 'holdFront']], 0.3), t, 7), expr: exprAt(t, [[0, 'neutral'], [tTon, 'worried']]), blink: blinkH(t), look: t > tTon ? lookToward(-0.4, -1) : lookToward(1, 0.2), rim: H.rim, t };
    actor(g, 'HERO', o);
    if (taken) bill(g, hx + 46 * 2.6 * 0.9, GY + 40 - 150 * 2.6, 1.3, -0.3);
  });
  houseFg(g, t, cam, { room: 'kitchen' }); look(g, t);
  chip(g, t, { str: '$50', at: tFifty, x: 300, y: 380 });
} });

// the tiny plastic house magnet: its upstairs window painted black
function houseMagnet(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-26, -20, 56, 50); poly(g, [[-30, -10], [0, -40], [30, -10]], '#c84a3a'); g.fillStyle = '#f0e8d8'; g.fillRect(-26, -10, 52, 40); g.fillStyle = '#0a0a0e'; g.fillRect(-16, -4, 12, 12); g.fillStyle = '#8ab8e8'; g.fillRect(6, -4, 12, 12); g.fillStyle = '#6a4a32'; g.fillRect(-5, 14, 10, 16); g.restore(); }

registerShot('s003', { draw(g, t, info) {
  const tNote = 1.29, cam = camMove(t, info.dur, { z: [1.0, 1.12], x: [360, 220], y: [-30, -60], drift: 0.4 });
  const H = house(g, t, cam, { room: 'kitchen', note: false, lights: { lamp: 1 }, clock: '11:10' }), p = H.pos, GY = H.GY;
  const slide = ease.inOut(prog(t, tNote + 0.05, tNote + 0.8)), enter = ease.out(prog(t, 0, 1.0)), hx = lerp(p.fridgeX - 760, p.fridgeX - 380, enter);
  layer(g, cam, 1, (g) => {
    note(g, lerp(p.noteX, p.noteX - 120, slide), lerp(p.noteY, p.noteY + 60, slide), 0.24, { t, rules: 0, magnet: false, rot: lerp(-0.04, -0.2, slide) });
    houseMagnet(g, p.magnetX, p.magnetY + 30, 1.5);
    actor(g, 'HERO', { x: hx, y: GY + 40, s: HS, facing: 1, pose: idle(poseAt(t, [[0, enter < 1 ? 'stand' : 'stand'], [tNote - 0.2, 'reach']], 0.3), t, 7), expr: exprAt(t, [[0, 'neutral'], [tNote, 'nervous']]), blink: blinkH(t), look: lookToward(1, -0.4), rim: { color: WARM, dir: [-0.9, -0.3] }, t });
  });
  houseFg(g, t, cam, { room: 'kitchen' }); look(g, t);
} });

// the note insert: her grey hoodie cuffs + thumbs at the edges; overlays the numbers 1-4 (the set's note only numbers a rule as it writes)
const INK = '#1f2a4a';
function noteInsert(g, t, info, o) {
  const z = lerp(o.z[0], o.z[1], ease.inOut(t / info.dur)), x = 540, y = 760, s = 0.95, tr = Math.sin(t * 23) * 1.2 + Math.sin(t * 31) * 0.8;
  blurLayer(g, 12, (g) => house(g, t, { z: 1.4, x: 200, y: -200 }, { room: 'kitchen', lights: { lamp: o.lamp ?? 1 }, clock: '11:10' }), null, 1); veil(g, '#04060c', 0.45);
  glow(g, 0, y - 200, 900, WARM, 0.28 * (o.lamp ?? 1) * (o.flick ?? 1));
  g.save(); g.translate(x, y); g.scale(z, z); g.translate(-x + tr, -y + tr * 0.6);
  const N = note(g, x, y, s, { t, rules: o.rules, magnet: false, rot: -0.03, hl: o.hl });
  // numbers that are not written yet as rules, in the same hand; the 4 sits low, pressed hard, a different hand
  g.save(); g.translate(x, y); g.rotate(-0.03); g.scale(s, s);
  if (o.numbers > 0) { const loc = N.lines.map(([lx, ly]) => [(lx - x) / s, (ly - y) / s]);
    if ((o.rules ?? 0) < 0.01) scrawl(g, "While I'm out:", -760 / 2 + 110, -980 / 2 + 100, { size: 50, seed: 1, k: clamp(o.numbers * 3), color: INK });
    loc.forEach(([lx, ly], i) => { const k = clamp(o.numbers * 4 - i * 0.32); if (k > 0 && (o.rules ?? 0) <= i) scrawl(g, `${i + 1}.`, lx - 10, ly, { size: 52, seed: 20 + i, k, color: INK }); });
    const k4 = clamp(o.numbers * 4 - 3 * 0.32); if (k4 > 0) scrawl(g, '4.', -760 / 2 + 100, 980 / 2 - 90, { size: 66, seed: 77, k: k4, color: '#2a1a24', wobble: 2.2 }); }
  if (o.under2) { const [lx, ly] = N.lines[2] || [x, y]; const yy = (ly - y) / s - 108 + 22; seg(g, [[-760 / 2 + 160, yy], [-760 / 2 + 160 + 200, yy + 3]], 4, alpha('#a02a2a', 0.85 * o.under2)); }
  g.restore();
  // hands: grey hoodie cuffs + thumbs on the paper edges
  for (const sd of [-1, 1]) { const hx = x + sd * 380 * s, hy = y + 200; g.save(); g.translate(hx, hy); g.scale(sd, 1); rr(g, -40, 20, 150, 300, 40); g.fillStyle = '#7d8494'; g.fill(); rr(g, -40, 20, 150, 40, 18); g.fillStyle = shade('#7d8494', -0.25); g.fill(); g.fillStyle = '#3a2a26'; g.beginPath(); g.ellipse(-20, 0, 30, 46, -0.3, 0, 7); g.fill(); g.fillStyle = '#4a3630'; g.beginPath(); g.ellipse(-26, -40, 16, 28, -0.2, 0, 7); g.fill(); g.restore(); }
  g.restore();
  if (o.flick != null && o.flick < 1) veil(g, '#000', 0.35 * (1 - o.flick));
  look(g, t);
}

registerShot('s004', { draw(g, t, info) { noteInsert(g, t, info, { z: [1.0, 1.05], rules: 0, numbers: ease.out(prog(t, 0.15, 0.7)) }); } });
registerShot('s005', { draw(g, t, info) { const fl = t > 0.08 && t < 0.18 ? 0.35 : 1; noteInsert(g, t, info, { z: [1.12, 1.16], rules: ease.out(prog(t, 0.3, 1.3)), numbers: 1, flick: fl }); } });
registerShot('s008', { draw(g, t, info) { noteInsert(g, t, info, { z: [1.10, 1.14], rules: 1 + ease.out(prog(t, 0.3, 1.35)), numbers: 1, lamp: 0.85, hl: 2, under2: prog(t, 1.35, 1.5) }); } });

registerShot('s006', { draw(g, t, info) {
  const tBase = 0.99, cam = camMove(t, info.dur, { z: [1.0, 1.1], y: [-160, -170], drift: 0.35 });
  const seep = 0.45 + 0.25 * Math.sin(t * Math.PI * 2 * 0.25);
  const H = house(g, t, cam, { room: 'basement', knock: 0, bolt: 1, seep, lights: { lamp: 0.5 } }), GY = H.GY;
  // over the shoulder: her back, ponytail, the note at her side (slightly soft)
  blurLayer(g, 2, (g) => { const o = { x: H.CX - 330, y: GY + 300, s: 3.0, facing: 1, pose: idle({ ...POSES.stand, hF: [14, -96] }, t, 7), expr: exprAt(t, [[0, 'neutral'], [tBase, 'worried']]), blink: blinkH(t), look: t > tBase - 0.15 ? lookToward(1, -0.1) : lookToward(-0.3, 0.2), rim: H.rim, t };
    actor(g, 'HERO', o); note(g, o.x + 20 * 3.0, o.y - 80 * 3.0, 0.14, { t, rules: 1, magnet: false, rot: 0.3 }); }, cam, 1);
  houseFg(g, t, cam, { room: 'basement' });
  motes(g, t, { x: E.W * 0.15, y: E.H * 0.2, w: 500, h: 700, count: 40 });
  look(g, t);
} });

registerShot('s007', { draw(g, t, info) {
  const tHear = 0.69, tScrape = 1.79, cam = camMove(t, info.dur, { z: [1.15, 1.2], x: [140, 150], y: [-160, -160] });
  blurLayer(g, 10, (g) => house(g, t, cam, { room: 'basement', knock: 0, bolt: 1, seep: t > tScrape ? 1 : 0.45, lights: { lamp: 0.5 } }), null, 1); veil(g, '#04060c', 0.3);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur)), cx = 420, cy = 760, f = faceAt(t, [[0, 'neutral'], [0.19, 'worried'], [tHear, 'suspicious']]);
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  glow(g, cx - 260, cy + 40, 300, WARM, 0.22);                                                     // the warm lamp kiss on her left cheek
  giantFace(g, cx, cy, 320, { who: 'HERO', f: { ...f, look: t > tHear ? [0.9, 0.1] : [0.1, 0] }, rimSide: 1, rimColor: MOON, blink: blinkAmt(t, 3.4, 7), breath: Math.sin(t * 1.9), tilt: Math.sin(t * 0.7) * 0.015 });
  g.restore();
  look(g, t);
} });

registerShot('s009', { draw(g, t, info) {
  const tLight = 0.69, tOff = 1.27, tDont = 1.87, tSw = 2.47;
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [240, 290], y: [-60, -70], drift: 0.35 });
  const H = house(g, t, cam, { room: 'hallway', lights: { hall: 1 } }), p = H.pos, GY = H.GY, s = HS;
  const stopX = p.switchX - 190, hx = lerp(stopX - 420, stopX, ease.out(prog(t, 0, tLight)));
  layer(g, cam, 1, (g) => {
    // small dirty fingerprints around the switch plate, at a child's height
    const r = rng(6); for (let i = 0; i < 9; i++) { g.fillStyle = alpha('#2a2018', 0.35 + 0.2 * r()); g.beginPath(); g.ellipse(p.switchX - 30 + r() * 60, p.switchY + 220 + r() * 90, 8, 11, r() * 3, 0, 7); g.fill(); }
    const walking = t < tLight, reachK = ease.out(prog(t, tOff, tOff + 0.4));
    let pose; if (walking) pose = walkAlong(hx, s, { facing: 1 }).pose; else if (t < tDont) pose = idle(poseAt(t, [[tLight, 'stand'], [tOff, 'reach']], 0.35), t, 7); else pose = reaction('wince', t, tDont, 'stand');
    actor(g, 'HERO', { x: hx, y: GY + 300, s, facing: 1, pose, expr: exprAt(t, [[0, 'neutral'], [tOff, 'nervous'], [tSw, 'scared']]), blink: blinkH(t), look: t > tOff - 0.2 && t < tDont + 0.4 ? lookToward(1, -0.5) : lookToward(1, 0), rim: H.rim, t });
    void reachK;
  });
  houseFg(g, t, cam, { room: 'hallway' }); look(g, t);
} });

registerShot('s010', { draw(g, t, info) {
  const tWait = 0.38, cam = camMove(t, info.dur, { z: [1.7, 1.76], x: [-100, -90], y: [360, 370], drift: 0.25 });
  const H = house(g, t, cam, { room: 'hallway', lights: { hall: 1 } }), p = H.pos, GY = H.GY;
  // the bulb's light stops at the bottom step at the end of the hall like a wall (hard edge, black beyond)
  layer(g, cam, 0.7, (g) => { const y0 = p.vpY + 150; g.fillStyle = linGrad(g, 0, y0, 0, y0 + 160, ['#020306', 'rgba(2,3,6,0)']); g.fillRect(p.vpX - 120, y0, 240, 160); rr(g, p.vpX - 90, y0 - 26, 180, 26, 3); g.fillStyle = '#3a3026'; g.fill(); seg(g, [[p.vpX - 90, y0 - 26], [p.vpX + 90, y0 - 26]], 4, alpha(WARM, 0.85)); });
  layer(g, cam, 1, (g) => {
    const frozen = t > tWait + 0.3, tt = frozen ? tWait + 0.3 : t, dip = t > tWait && t < tWait + 0.4 ? Math.sin((t - tWait) / 0.4 * Math.PI) * 4 : 0;
    const pose = idle({ ...POSES.stand, hF: [-6, -96], hB: [-18, -98], eF: [4, -136], eB: [-12, -138] }, tt, 7); pose.head = [pose.head[0], pose.head[1] + dip / 2.6];
    actor(g, 'HERO', { x: H.CX - 170, y: GY + 340, s: 3.0, facing: 1, pose, expr: exprAt(t, [[0, 'scared'], [tWait, 'nervous'], [tWait + 0.5, 'scared']]), blink: blinkH(t), look: lookToward(1, -0.2), rim: H.rim, t });
  });
  houseFg(g, t, cam, { room: 'hallway' }); look(g, t);
} });
