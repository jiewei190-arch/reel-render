// B_s043_s052_notes_silk.js — ep 4 batch B: Mina's sticky notes ("Forty percent,"), "It does not help", DAY 3 THE SILK (palms do nothing,
// spinnerets, the back-end puff, Dev films the backwards walk, the shiny line, Dev never happier).
// LEGAL: silk ONLY from the back end (silkAnchor/silkPuff), never wrists; palms up = a hopeful magician, never a wrist flick. QUALITY_BAR.md.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, rr, poly, text, FONTS, rng, talkAmount } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { garden, gardenFg } from '../sets/garden.js';
import { pip, wallCling, stickMarks, silkLine, silkPuff, silkAnchor, gloves } from '../sets/spider.js';
import { dayCard, devPhone } from '../sets/spiderprops.js';
import { filmFrame } from '../sets/home3.js';
import { board, label } from '../sets/bp.js';
import { silkGland } from '../sets/spiderbp.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt, FACE } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, W, stickyNote } from './B_lib.js';

const CX = E.W / 2, GY = () => E.H * 0.8;
// sticky-note spots on the hoodie (local rig coords, on the torso + arms)
const NOTES = [[4, -160, -0.2], [-10, -130, 0.15], [16, -118, -0.1], [2, -146, 0.25], [-14, -164, 0.1], [20, -150, -0.3], [8, -106, 0.2], [-6, -116, -0.25], [30, -140, 0.05]];
const noteBeats = (info) => [wt(info, 'covers', 0.36), wt(info, 'hoodie', 0.9), wt(info, 'sticky', 1.3, 1.1), wt(info, 'notes', 1.56, 1.4)];

// s043 — MINA on an upturned flower pot slaps sticky notes all over his hoodie, one per beat; he holds his arms out, patient
registerShot('s043', { draw(g, t, info) {
  const B = noteBeats(info), cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-420, -400], y: [-40, -50] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' });
  layer(g, cam, 1, (g) => {
    const o = { x: CX - 400, y: G.GY + 10, s: 1.9, facing: 1 }, p = idle({ ...POSES.stand, eF: [40, -170], hF: [74, -176], eB: [-36, -170], hB: [-70, -176] }, t, 3);
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'neutral'], [B[2], 'sheepish']]), blink: blinkFlag(t, 3.4, 3), look: lookToward(0.6, 0.6), rim: G.rim, t }); gloves(g, o, p, { t });
    const n = B.filter(b => t >= b).length * 2 + (t > B[3] ? 1 : 0); NOTES.slice(0, n).forEach(([lx, ly, r]) => { const [x, y] = W(o, [lx, ly]); stickyNote(g, x, y, 1.2, r); });
    rr(g, CX - 150, G.GY - 60, 130, 80, 10); g.fillStyle = '#b8603a'; g.fill(); rr(g, CX - 160, G.GY - 70, 150, 20, 8); g.fillStyle = '#a0502e'; g.fill();   // the upturned flower pot
    const slap = B.some(b => t > b - 0.12 && t < b + 0.08), mp = slap ? { ...POSES.stand, eF: [-22, -170], hF: [-50, -164] } : { ...POSES.stand, eF: [-14, -150], hF: [-10, -120], eB: [18, -140], hB: [30, -120] };
    actor(g, 'MINA', { x: CX - 90, y: G.GY - 70, s: 2.0, facing: -1, pose: idle(mp, t, 1), expr: exprAt(t, [[0, 'determined'], [B[3], 'smirk']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0), rim: G.rim, t });
    stickyNote(g, CX - 90 + 12 * 1.44, G.GY - 70 - 120 * 1.44, 1.3, 0.1);                                    // the pad in her other hand
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
} });

// s044 — GIANT FACE MINA: lip-sync on "Forty percent," only; a firm nod on "she" (mouth closed); a sticky-note pad with "40%" in gold
registerShot('s044', { draw(g, t, info) {
  const st = info.shot.start, tSh = wt(info, 'she', 0.86, 0.6), D = FACE.determined, O = (k) => ({ ...D, open: k, smile: 0.1 });
  const z = 1 + 0.04 * ease.inOut(t / info.dur), cam = { z: 1.1, x: -300, y: -40 };
  blurLayer(g, 10, (g) => garden(g, t, cam, { view: 'garden', mood: 'day' }), null, 1); veil(g, '#140f18', 0.15);
  const nod = Math.sin(clamp((t - tSh) / 0.4) * Math.PI) * 18;
  const f = faceAt(t, [[0, 'determined'], [0.15, O(0.55)], [0.3, O(0.15)], [0.42, O(0.6)], [0.6, O(0.2)], [0.75, 'smirk']], 0.08);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  giantFace(g, E.W * 0.45, E.H * 0.5 + nod, 320, { who: 'MINA', f, rimSide: 1, rimColor: '#fff1d8', blink: blinkAmt(t, 3.0, 1), breath: Math.sin(t * 2) });
  // the pad of notes in her hand: "40%" in gold marker
  g.save(); g.translate(E.W * 0.78, E.H * 0.66); g.rotate(-0.1); rr(g, -110, -110, 220, 220, 6); g.fillStyle = '#fbf0a0'; g.fill(); g.strokeStyle = '#3a3420'; g.lineWidth = 4; g.stroke(); for (let i = 1; i < 4; i++) seg(g, [[-110, 110 + i * 4], [110, 110 + i * 4]], 3, alpha('#c8b860', 0.8));
  text(g, '40%', 0, 6, { size: 96, color: S().ui.gold, font: FONTS.title, weight: 700, stroke: 6, strokeColor: '#5a4020' }); g.restore();
  g.restore();
  atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#fff4dc', far: 10, near: 4 });
} });

// s045 — IT DOES NOT HELP: covered in notes, he tries the drainpipe and slides straight down; the notes flutter off; he lands in the flower bed
registerShot('s045', { draw(g, t, info) {
  const tDo = wt(info, 'does', 0.33), tNot = wt(info, 'not', 0.47, 0.4, true), tLand = 1.21;
  const slide = ease.in(prog(t, tDo, tLand)), R = wallCling(t, { slide, slideDist: 560 }), landed = t >= tLand;
  const ox = CX + 160 - 44 * 1.9 - 90, oy = GY() - 560 + R.dy, o = { x: ox, y: landed ? GY() + 20 : oy, s: 1.9, facing: 1 };
  const cam = { z: 1.0, x: ox - CX + 160, y: lerp(GY() - 560 - 820, GY() - 860, ease.inOut(prog(t, tDo, tLand + 0.2))) + (landed && t < tLand + 0.3 ? Math.sin(t * 60) * 6 : 0) };
  const G = garden(g, t, cam, { view: 'wall', mood: 'day' });
  layer(g, cam, 1, (g) => {
    const p = landed ? idle(POSES.sit, t, 3) : R.pose;
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'determined'], [tDo, 'worried'], [tLand, 'sheepish']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(0.2, landed ? -0.2 : 0.8), rim: G.rim, t }); gloves(g, o, p, { t });
    const r = rng(7); NOTES.forEach(([lx, ly, rot], i) => { const off = tNot + i * 0.06, u = t - off; const [x0, y0] = W({ ...o, y: oy }, [lx, ly]);
      if (u < 0) { const [x, y] = W(o, [lx, ly]); stickyNote(g, x, y, 1.2, rot); return; }
      const dx = (r() - 0.5) * 300 * u + Math.sin(u * 6 + i) * 30, dy = u * 120 + u * u * 90; stickyNote(g, x0 + dx, y0 - 60 + dy, 1.2, rot + u * 4 * (i % 2 ? 1 : -1)); });
    pip(g, CX + 200, GY() - 900, 1.4, { t, wave: 1, blink: 1, tilt: 0.3 });                                            // on a pipe bracket, covering its eyes
    if (landed) for (let i = 0; i < 6; i++) { const u = prog(t, tLand, tLand + 0.6); circle(g, ox + (i - 2.5) * 40 * (1 + u), GY() + 10 - u * 40 * (i % 2), 10 * (1 - u), alpha('#c8a878', 0.6 * (1 - u))); }
  });
  gardenFg(g, t, cam, { view: 'wall' }); atmos(g, t, cam, { color: G.M.key });
} });

// s046 — DAY 3 THE SILK: a single dewy garden thread between the washing-line post and the fence glints; he steps in and looks at it
registerShot('s046', { draw(g, t, info) {
  const tDay = wt(info, 'day', 0.23), tSilk = wt(info, 'silk', 1.61, 1.2);
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-120, -100], y: [-140, -150] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  layer(g, cam, 1, (g) => {
    const a = [CX - 380, GY() - 480], b = [CX + 260, GY() - 330];
    silkLine(g, a, b, { t, sag: 30, k: 1, w: 2 });
    for (let i = 1; i < 14; i++) { const u = i / 14; circle(g, lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * 30 + 3, 3.2, alpha('#e8f4ff', 0.8)); }   // dew drops
    const sk = prog(t, tSilk, tSilk + 0.8); if (sk > 0 && sk < 1) { const x = lerp(a[0], b[0], sk), y = lerp(a[1], b[1], sk) + Math.sin(sk * Math.PI) * 30; glow(g, x, y, 60, '#fff4d0', 0.8); FX.sparkle(g, x, y, 20, '#fff4d0', 0.9); }
    const hx = lerp(CX - 1000, CX - 560, ease.out(prog(t, 0.2, 1.4))), walking = t < 1.4;
    const o = { x: hx, y: G.GY + 20, s: 1.9, facing: 1 }, p = walking ? walkAlong(hx, 1.9, { facing: 1 }).pose : idle(POSES.lookUp ?? POSES.stand, t, 2);
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'neutral'], [tSilk, 'awe']]), blink: blinkFlag(t, 3.4, 4), look: lookToward(1, -0.5), rim: G.rim, t }); gloves(g, o, p, { t });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
  chip(g, t, { str: 'Silk', at: tSilk, x: E.W * 0.62, y: E.H * 0.2, dur: info.dur - 0.05 });
  dayCard(g, t, { day: 3, title: 'THE SILK', at: tDay, x: E.W * 0.15, y: E.H * 0.15, s: 0.55 });
} });

// s047 — BAD NEWS: palms up and open like a hopeful magician (never a wrist flick); nothing; a sad little puff on "make"; a glove flops off on "hands"
registerShot('s047', { draw(g, t, info) {
  const tMake = wt(info, 'make', 1.73, 1.4), tHands = wt(info, 'hands', 2.27, 2.0);
  const cam = camMove(t, info.dur, { z: [1.25, 1.3], x: [-200, -180], y: [40, 36] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  layer(g, cam, 1, (g) => {
    const wig = Math.sin(t * 14) * 3, o = { x: CX - 300, y: G.GY + 20, s: 1.9, facing: 1 };
    const p = idle({ ...POSES.stand, eF: [34, -128], hF: [66, -132 + wig], eB: [28, -126], hB: [60, -130 - wig] }, t, 2);
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'happy'], [tMake, 'confused'], [tHands, 'sheepish']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(1, 0.5), rim: G.rim, t });
    const Gl = gloves(g, o, p, { t, slip: prog(t, tHands, tHands + 0.15) + (t > tHands + 0.15 ? 1 : 0) * 0, tSlip: tHands + 0.15 });
    const pk = prog(t, tMake, tMake + 0.6); if (pk > 0 && pk < 1) { const [hx, hy] = W(o, p.hF); for (let i = 0; i < 3; i++) circle(g, hx + 10 + i * 14, hy - 30 - pk * 30 - i * 6, (8 - i * 2) * (1 - pk), alpha('#c8c8d0', 0.7 * (1 - pk))); }
    pip(g, CX + 120, GY() - 330, 1.5, { t, tilt: t > tMake ? Math.sin(t * 9) * 1 : 0, look: [-1, 0.3], blink: blinkFlag(t, 2.6, 2) ? 1 : 0 });   // on the fence, shaking its head
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
} });

// s048 — BLUEPRINT FIG 3 - SPINNERETS: the spider-body cutaway, SPINNERETS on "spinnerets", "back end" on "back"
registerShot('s048', { draw(g, t, info) {
  const tSp = wt(info, 'spinnerets', 0.75), tBk = wt(info, 'back', 1.55, 1.2);
  board(g, t, { title: 'FIG 3 - SILK', fig: 'SPINNERETS' });
  const z = 1 + 0.035 * ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const Gd = silkGland(g, t, { x: E.W * 0.45, y: E.H * 0.45, s: 1.1, k: ease.out(prog(t, 0.05, 1.0)), pull: 0 });
  label(g, t, { at: Gd.spinneret, to: [Gd.spinneret[0] + 220, Gd.spinneret[1] - 220], str: 'SPINNERETS', start: tSp, size: 46 });
  label(g, t, { at: Gd.spinneret, to: [Gd.spinneret[0] + 160, Gd.spinneret[1] + 160], str: 'back end', start: tBk });
  const ak = ease.out(prog(t, tSp, tSp + 0.3)); if (ak > 0) { glow(g, Gd.spinneret[0], Gd.spinneret[1], 90, S().ui.gold, 0.4 * ak); }
  g.restore();
} });

// s049 — SO THAT'S WHERE YOURS COMES FROM: he looks over his shoulder at his own behind; a comic silk puff on "comes"; Mina giggles
registerShot('s049', { draw(g, t, info) {
  const tWh = wt(info, 'where', 0.56), tCo = wt(info, 'comes', 0.9, 0.7), tToo = wt(info, 'too', 1.46, 1.2, true);
  const cam = camMove(t, info.dur, { z: [1.3, 1.34], x: [-160, -140], y: [40, 36] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: CX + 380, y: G.GY + 10, s: 2.0, facing: -1, pose: idle(t > tCo ? { ...POSES.stand, eF: [14, -150], hF: [22, -178], eB: [10, -148], hB: [18, -176] } : POSES.stand, t, 1), expr: exprAt(t, [[0, 'smile'], [tCo + 0.1, 'joy']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0), rim: G.rim, t });
    const o = { x: CX - 220, y: G.GY + 20, s: 1.9, facing: 1 }, p = idle({ ...POSES.stand, head: [-6, -206] }, t, 2);
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'neutral'], [tWh, 'worried'], [tCo + 0.05, 'shocked'], [tToo, 'sheepish']]), blink: blinkFlag(t, 3.3, 3), look: t > tWh - 0.1 ? lookToward(-1, 0.6) : lookToward(1, 0), rim: G.rim, t }); gloves(g, o, p, { t });
    const a = silkAnchor(o, p); g.save(); g.translate(a[0], a[1]); g.scale(1.8, 1.8); silkPuff(g, t, tCo, 0, 0, { dir: -1 }); g.restore();   // bigger so the puff reads at phone size
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
} });

// s050 — DEV FILMS: Dev crouches with his phone (DEV CAM); he walks BACKWARDS across the lawn trailing a silk line back to the shed door
const backWalk = (t, t0, info) => lerp(CX - 300, CX + 380, ease.inOut(prog(t, t0, info.dur + 1.0)));
registerShot('s050', { draw(g, t, info) {
  const tFi = wt(info, 'films', 0.31), tWa = wt(info, 'walking', 0.95);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [0, 60], y: [-40, -44] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  layer(g, cam, 1, (g) => {
    const hx = backWalk(t, tWa - 0.2, info), o = { x: hx, y: G.GY + 20, s: 1.9, facing: -1 }, p = t > tWa - 0.2 ? walkAlong(hx, 1.9, { facing: -1 }).pose : POSES.stand;
    const a = silkAnchor(o, p); silkLine(g, a, [CX + 980, G.GY - 160], { t, sag: 20, k: 1 });
    actor(g, 'HERO', { ...o, pose: p, expr: exprAt(t, [[0, 'determined'], [tWa + 0.6, 'smirk']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(-1, 0.1), rim: G.rim, t }); gloves(g, o, p, { t });
    const dO = { x: CX - 760, y: G.GY + 20, s: 1.9, facing: 1 }, dp = { ...POSES.kneel, eF: [30, -150], hF: [54, -160], eB: [24, -146], hB: [48, -158] };
    actor(g, 'DEV', { ...dO, pose: idle(dp, t, 2), expr: exprAt(t, [[0, 'smirk'], [tWa + 0.4, 'delighted' in FACE ? 'joy' : 'joy']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, -0.1), rim: G.rim, t });
    const [px, py] = W(dO, [58, -170]);
    devPhone(g, t, { x: px + 40, y: py - 40, s: 0.3, rot: -0.05, at: tFi, sec0: 3, tag: 'DEV CAM' }, (g, w, h) => { g.fillStyle = '#9ab868'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8e0f0'; g.fillRect(0, 0, w, h * 0.5); actor(g, 'HERO', { x: w * 0.5, y: h * 0.9, s: 1.3, facing: -1, pose: p, expr: 'smirk', t }); });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
} });

// s051 — DEV'S PHONE VIEW (full frame): the dragline glints behind the backwards-walking hero; the glint runs on "shiny"; Pip ziplines toward camera
registerShot('s051', { draw(g, t, info) {
  const tSh = wt(info, 'shiny', 0.99), tLi = wt(info, 'line', 1.29, 1.1), zoom = lerp(1, 1.3, ease.inOut(prog(t, 0.3, info.dur)));
  const cam = { z: 1.2 * zoom, x: -60 + t * 30, y: 40 };
  const G = garden(g, t, cam, { view: 'garden', mood: 'morning' });
  layer(g, cam, 1, (g) => {
    const hx = CX - 200 + t * 160, o = { x: hx, y: G.GY + 20, s: 1.9, facing: -1 }, p = walkAlong(hx, 1.9, { facing: -1 }).pose;
    const a = silkAnchor(o, p), end = [CX - 1100, G.GY - 140];
    silkLine(g, a, end, { t: t * 1.5, sag: 6, k: 1, w: 3 });
    const gk = prog(t, tSh, tSh + 0.5); if (gk > 0 && gk < 1) { const x = lerp(a[0], end[0], gk), y = lerp(a[1], end[1], gk); glow(g, x, y, 90, '#fff4d0', 0.8); FX.sparkle(g, x, y, 26, '#fff4d0', 1); }
    actor(g, 'HERO', { ...o, pose: p, expr: 'smirk', blink: blinkFlag(t, 3.3, 3), look: lookToward(-1, 0.1), rim: G.rim, t }); gloves(g, o, p, { t });
    const zk = ease.in(prog(t, tLi - 0.3, info.dur)); if (zk > 0) { const x = lerp(end[0] + 300, a[0] - 80, zk), y = lerp(end[1], a[1], zk) + 16; pip(g, x, y, 1.4 + zk * 2.2, { t, tilt: 0.4, look: [1, 0.2], wave: 1 }); }   // Pip riding the line
  });
  atmos(g, t, cam, { color: G.M.key });
  filmFrame(g, t, { at: 0, sec0: 7, label: 'DEV CAM' });
} });

// s052 — GIANT FACE DEV: never happier: delighted > joy, a happy-tear sparkle, his phone beside his face, hearts floating up
registerShot('s052', { draw(g, t, info) {
  const tNe = wt(info, 'never', 0.35), tHa = wt(info, 'happier', 0.85, 0.6), z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  const cam = { z: 1.1, x: -500, y: -40 };
  blurLayer(g, 10, (g) => garden(g, t, cam, { view: 'garden', mood: 'morning' }), null, 1); veil(g, '#140f18', 0.12);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  giantFace(g, E.W * 0.42, E.H * 0.52, 320, { who: 'DEV', f: faceAt(t, [[0, 'delighted'], [tHa, 'joy']], 0.14), rimSide: 1, rimColor: '#ffe8c0', blink: blinkAmt(t, 3.2, 2), breath: Math.sin(t * 2.2) });
  const tk = ease.out(prog(t, tHa, tHa + 0.4)); if (tk > 0) { FX.sparkle(g, E.W * 0.42 - 150, E.H * 0.52 + 40 + tk * 30, 18 * tk, '#cfeeff', 0.9); circle(g, E.W * 0.42 - 150, E.H * 0.52 + 40 + tk * 30, 8 * tk, alpha('#a8dcff', 0.9)); }   // a happy tear
  devPhone(g, t, { x: E.W * 0.78, y: E.H * 0.5, s: 0.6, rot: 0.08, at: 0, sec0: 31, hearts: ease.out(prog(t, tNe, tNe + 1.4)), tag: 'DEV CAM' }, (g, w, h) => { g.fillStyle = '#9ab868'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8e0f0'; g.fillRect(0, 0, w, h * 0.5); seg(g, [[w * 0.1, h * 0.55], [w * 0.9, h * 0.6]], 3, '#ffffff'); });
  g.restore();
  atmos(g, t, { z: 1, x: 0, y: 0 }, { color: '#fff4dc', far: 10, near: 4 });
} });
