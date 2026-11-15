// A_s027_s035_snap2.js — stop-time batch A (H1): SNAP 2 (the snap has learned: the light keeps moving), the beautiful frozen kitchen
// (juice beads, Dev mid-sneeze, Biscuit mid-leap at the butter), the WALL OF AIR (walk into something soft, the invisible mattress),
// giant face HERO gasp, nothing comes in. Read-out 00.0 -> 08.0. LEGAL: original; nothing from any film, show, anime, game or comic.
import { E, S, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rng, seg, circle, ring, rr, poly, alpha, shade, glow, text, FONTS, shake, veil } from '/engine/core.js';
import { POSES, posesAt } from '/engine/rig2d.js';
import { idle, blinkFlag, blinkAmt, exprAt, poseAt, camMove, lookToward, walkAlong } from '../sets/acting.js';
import { faceAt, FACE } from '../sets/faces.js';
import { snapPose, handWorld, snapBurst, snapRipple, freezeGrade, hangingDust, stillMark, frozenGlow, leapCat, sneezeSpray, SNEEZE, SNEEZE_FACE, airWall, PRESS, FACE_HOLD, puffCheeks, heroBigFace, FZ } from '../sets/freeze.js';
import { GOLD, CREAM, CORAL, kitchen, kitchenFg, hero, mina, dev, readout, tueSpill, TUE_TT, CROUCH, sunbeam, photonDust, chipText } from './A_lib.js';

const SWEEP = { head: [8, -206], sh: [3, -173], hip: [0, -100], eF: [30, -150], hF: [64, -160], eB: [-7, -136], hB: [-9, -100], kF: [8, -50], fF: [10, 0], kB: [-6, -50], fB: [-14, 0] };
const SNEEZE_BACK = { ...SNEEZE, head: [2, -214], sh: [0, -176], eF: [26, -150], hF: [24, -176] };
const ro = (t, a, b, dur) => lerp(a, b, clamp(t / dur));            // read-out value across the shot
const DEV2 = { x: 280, s: 1.9, facing: 1 }, MINA2 = { x: 840, facing: -1 };
// the frozen snap-2 kitchen: Mina's refilled glass knocked again (juice beads), Dev mid-sneeze, Biscuit mid-leap at the butter
function frozenKitchen2(g, t, cam, o = {}) {
  const K = kitchen(g, 2.3, cam, { steam: 0 }), P = K.P, GY = K.GY;
  layer(g, cam, 1, (g) => {
    frozenGlow(g, (g) => dev(g, { ...DEV2, y: GY, t: 0, frozen: true, pose: SNEEZE_BACK, face: SNEEZE_FACE, prop: { type: 'phone' } }), { k: 0.5 });
    mina(g, { ...MINA2, y: GY, t: 0, frozen: true, pose: SWEEP, expr: 'shocked', look: lookToward(-0.6, 0.6) });
    if (o.cat !== false) frozenGlow(g, (g) => leapCat(g, { x: P.butterX - 190, y: P.tableTop - 140, s: 1.6, facing: 1, t: 0, eyes: 'wide', rim: K.rim }), { k: 0.6 });
  });
  kitchenFg(g, 2.3, cam);
  return K;
}
function frozenAccents(g, t, K, o = {}) {        // drawn AFTER the grade: the juice and the sneeze keep their sparkle
  const P = K.P, GY = K.GY;
  tueSpill(g, t, { ...P, juiceX: MINA2.x - 120, juiceY: P.tableTop - 14 }, TUE_TT, 1, {});
  const hd = handWorld({ ...DEV2, y: GY }, SNEEZE_BACK, 'head'); sneezeSpray(g, { x: hd[0] + 30, y: hd[1] + 10, dir: 1, tt: 0.3, s: 1.3, frozen: 1, t });
  stillMark(g, hd[0] - 20, hd[1] - 60, 0.9, t, 1); stillMark(g, MINA2.x - 10, GY - 330, 0.8, t, 2);
  if (o.cat !== false) stillMark(g, P.butterX - 120, P.tableTop - 210, 1, t, 3);
}

// ======================================================================= s027 Second snap. The snap seems to have learned.
registerShot('s027', { draw(g, t, info) {
  const SN = 0.48, HO = { x: 1300, y: E.H * 0.8, s: 1.9, facing: -1 }, pose = idle(snapPose(t, SN), t, 1), hand = handWorld(HO, pose);
  const pull = ease.inOut(prog(t, 0.9, 3.2)), z = lerp(1.4, 1.0, pull);
  const cam = camMove(t, info.dur, { drift: 0.6 }); cam.z = z; cam.x += lerp(hand[0] - E.W / 2 - 120, 60, pull); cam.y += lerp(hand[1] - E.H / 2 + 60, 0, pull);
  const K = frozenKitchen2(g, t, cam);
  layer(g, cam, 1, (g) => {
    snapRipple(g, t, { x: hand[0], y: hand[1], t0: SN, dur: 0.45 });
    if (t > SN) frozenAccents(g, t, K);
    hangingDust(g, t, { at: SN, count: 40, seed: 4 });
    hero(g, { ...HO, t, pose, expr: exprAt(t, [[0, 'determined'], [SN + 0.2, 'neutral'], [3.0, 'surprised']]), look: lookToward(-1, 0.1) });
    snapBurst(g, t, { x: hand[0] - 4, y: hand[1] - 10, t0: SN, s: 0.9 });
  });
  chipText(g, t, 'SNAP 2', 0.14, 220, 110);
  readout(g, t, ro(t, 0, 1, info.dur) * (t > SN ? 1 : 0), { k: prog(t, SN, SN + 0.25) });
}});

// ======================================================================= s028 The light keeps moving. And it's beautiful.
registerShot('s028', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.08, 1.12], x: [60, -60] }), K = frozenKitchen2(g, t, cam), P = K.P, GY = K.GY;
  const turn = t > 1.6 ? -1 : 1;
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1); hangingDust(g, t, { at: -1, count: 60, seed: 6 });
    frozenAccents(g, t, K);
    const beam = { x0: P.windowX - 40, y0: P.windowY + 190, x1: P.tableX - 40, y1: P.tableTop - 10 };
    sunbeam(g, beam.x0, beam.y0, beam.x1, beam.y1, 110, 200, 0.12 + 0.04 * Math.sin(t * 5)); photonDust(g, t, { ...beam, w: 140, n: 160, k: 0.8, seed: 9, flow: 1 });
    hero(g, { x: 1180, y: GY, facing: turn, t, pose: idle(t > 2.22 ? POSES.relaxed : POSES.stand, t, 1), expr: exprAt(t, [[0, 'surprised'], [2.22, 'awe']]), look: turn > 0 ? lookToward(1, -0.4) : lookToward(-1, -0.5) });
  });
  readout(g, t, ro(t, 1, 2, info.dur));
}});

// ======================================================================= s029 Juice drops hang like glass beads.
registerShot('s029', { draw(g, t, info) {
  const GY = E.H * 0.8, jx = MINA2.x - 120, jy = GY - 240 - 14;
  const cam = camMove(t, info.dur, { z: [2.3, 2.4], x: [jx - E.W / 2 - 140, jx - E.W / 2 - 160], y: [jy - E.H / 2 + 30, jy - E.H / 2 + 20] });
  const K = frozenKitchen2(g, t, cam, { cat: false });
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1); hangingDust(g, t, { at: -1, count: 30, seed: 8 });
    const pts = tueSpill(g, t, { ...K.P, juiceX: jx, juiceY: jy }, TUE_TT, 1);
    // the hero's finger comes in from the right and taps one drop
    const tx = jx - 162, ty = jy + 29, reach = ease.inOut(prog(t, 0.3, 1.13)), back = ease.inOut(prog(t, 1.5, 2.3));
    const fx = lerp(tx + 120, tx + 10, reach - back * 0.5), fy = lerp(ty - 200, ty - 8, reach - back * 0.5);
    g.save(); g.translate(fx, fy); g.rotate(-1.15); g.scale(0.55, 0.55);
    rr(g, 30, -20, 300, 44, 22); g.fillStyle = '#2f8f8a'; g.fill(); g.save(); g.clip(); for (let i = 0; i < 6; i++) { g.fillStyle = CREAM; g.fillRect(50 + i * 48, -24, 14, 52); } g.restore();
    g.fillStyle = '#14121a'; g.beginPath(); g.ellipse(14, 0, 30, 22, 0, 0, 7); g.fill(); seg(g, [[0, -6], [-26, -10]], 12, '#14121a'); g.restore();
    if (t > 1.13) { const k = prog(t, 1.13, 1.6); glow(g, tx, ty, 40, GOLD, 0.9 * (1 - k * 0.5)); stillMark(g, tx - 4, ty - 4, 0.9, t, 9); ring(g, tx, ty, 10 + 30 * k, 2, alpha(GOLD, 1 - k)); }
  });
  readout(g, t, ro(t, 2, 3, info.dur));
}});

// ======================================================================= s030 Dev is frozen mid-sneeze.
registerShot('s030', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.35, 1.4], x: [-520, -500], y: [-40, -40] }), K = frozenKitchen2(g, t, cam, { cat: false }), GY = K.GY;
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1); hangingDust(g, t, { at: -1, count: 40, seed: 10 });
    frozenAccents(g, t, K, { cat: false });
    const wave = t > 0.6 ? Math.sin((t - 0.6) * 9) : 0, wp = poseAt(t, [[0, POSES.stand], [0.6, { ...POSES.wave, hF: [40 + wave * 14, -220], eF: [30, -186] }]], 0.25);
    hero(g, { x: 560, y: GY, facing: -1, t, pose: idle(wp, t, 1), expr: exprAt(t, [[0, 'smile'], [0.87, 'joy']]), look: lookToward(-1, -0.1) });
  });
  readout(g, t, ro(t, 3, 4, info.dur));
}});

// ======================================================================= s031 Biscuit is mid-leap, aiming at the butter.
registerShot('s031', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [160, 180], y: [-90, -90] }), K = frozenKitchen2(g, t, cam), P = K.P, GY = K.GY;
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1); hangingDust(g, t, { at: -1, count: 40, seed: 12 });
    frozenAccents(g, t, K);
    if (t > 1.64) { const k = ease.outBack(prog(t, 1.64, 1.9)); glow(g, P.butterX, P.butterY - 20, 120 * k, GOLD, 0.35); }
    const cp = poseAt(t, [[0, POSES.stand], [0.62, CROUCH]], 0.35);
    hero(g, { x: P.butterX + 230, y: GY, facing: -1, t, pose: idle(cp, t, 1), expr: exprAt(t, [[0, 'surprised'], [0.62, 'smirk']]), look: lookToward(-1, -0.4) });
  });
  readout(g, t, ro(t, 4, 5, info.dur));
}});

// ======================================================================= s032 You step forward, and walk into something soft.
registerShot('s032', { draw(g, t, info) {
  const HIT = 1.64, sh = t > HIT && t < HIT + 0.25 ? shake(t, 6, 10) : [0, 0];
  const cam = camMove(t, info.dur, { z: [1.15, 1.22], x: [40 + sh[0], 90 + sh[0]], y: [-30 + sh[1], -30 + sh[1]] }), K = frozenKitchen2(g, t, cam, { cat: false }), GY = K.GY;
  const sq = ease.out(prog(t, HIT, HIT + 0.2)) - 0.5 * ease.inOut(prog(t, HIT + 0.25, HIT + 0.8));
  const hx = t < HIT ? lerp(880, 1060, ease.inOut(prog(t, 0.26, HIT))) : 1060 - 22 * ease.out(prog(t, HIT + 0.25, HIT + 0.7));
  const press = { x: 1060 + 58 * 2.0 + 30, y: GY - 360, r: 220, depth: 0.2 + 0.6 * sq };
  layer(g, cam, 1, (g) => {
    freezeGrade(g, 1); hangingDust(g, t, { at: -1, count: 40, seed: 14 });
    frozenAccents(g, t, K, { cat: false });
    const pose = t < HIT ? (t > 0.26 ? walkAlong(hx, 2.0, { facing: 1 }).pose : idle(POSES.stand, t, 1)) : idle(PRESS, t, 2);
    g.save(); g.translate(hx, GY); g.scale(1 - 0.08 * sq, 1 + 0.03 * sq); g.translate(-hx, -GY);
    hero(g, { x: hx, y: GY, s: 2.0, facing: 1, t, pose, expr: exprAt(t, [[0, 'neutral'], [HIT, 'shocked'], [HIT + 0.5, 'confused']]), look: lookToward(1, 0) });
    g.restore();
    if (t > HIT) { const vis = ease.out(prog(t, HIT, HIT + 0.3)); g.save(); g.beginPath(); g.arc(press.x, press.y, 330, 0, 7); g.clip(); airWall(g, t, { k: vis, x: press.x - 330, press, seed: 21, density: 0.9 }); g.restore(); }
  });
  readout(g, t, ro(t, 5, 6, info.dur));
}});

// ======================================================================= s033 Like a mattress you can't see.
registerShot('s033', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.4 }), GY = E.H * 0.8;
  blurLayer(g, 10, (g) => frozenKitchen2(g, t, { z: 1.25, x: 100, y: -40 }, { cat: false }), null, 1);
  freezeGrade(g, 1); veil(g, '#0b1324', 0.25);
  const dent = ease.out(prog(t, 0.39, 0.8)) - 0.45 * ease.inOut(prog(t, 1.15, 1.6)), mx = 1080;
  layer(g, cam, 1, (g) => {
    // the ghost mattress (dashed cream outline) standing on its end, dented where he leans in
    const top = GY - 640, bot = GY + 10, w = 300, dx = 120 * dent, dy = GY - 380;
    g.save(); g.setLineDash([18, 14]); g.strokeStyle = alpha(CREAM, 0.85); g.lineWidth = 6; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(mx, top + 30); g.quadraticCurveTo(mx, top, mx + 30, top); g.lineTo(mx + w - 30, top); g.quadraticCurveTo(mx + w, top, mx + w, top + 30); g.lineTo(mx + w, bot - 30); g.quadraticCurveTo(mx + w, bot, mx + w - 30, bot); g.lineTo(mx + 30, bot); g.quadraticCurveTo(mx, bot, mx, bot - 30);
    g.lineTo(mx, dy + 230); g.bezierCurveTo(mx + dx * 0.4, dy + 150, mx + dx, dy + 110, mx + dx, dy); g.bezierCurveTo(mx + dx, dy - 110, mx + dx * 0.4, dy - 150, mx, dy - 230); g.closePath(); g.stroke();
    g.globalAlpha = 0.35; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(mx + w * i / 4, top + 20); g.lineTo(mx + w * i / 4, bot - 20); g.stroke(); } g.restore();
    g.save(); g.beginPath(); g.ellipse(mx + dx * 0.5, dy, 90 + dx * 0.4, 230, 0, 0, 7); g.clip(); airWall(g, t, { k: 0.5 + 0.5 * dent, x: mx - 80, seed: 33, density: 1.2 }); g.restore();
    const hx = 860 + 60 * dent, pose = idle({ ...PRESS, hF: [58 + 40 * dent, -196], hB: [56 + 40 * dent, -150] }, t, 2);
    hero(g, { x: hx, y: GY, s: 2.0, facing: 1, t, pose, expr: exprAt(t, [[0, 'surprised'], [0.39, 'confused'], [1.15, 'shocked']]), look: lookToward(1, 0) });
  });
  readout(g, t, ro(t, 6, 7, info.dur));
}});

// ======================================================================= s034 GIANT FACE: You try to gasp.
registerShot('s034', { draw(g, t, info) {
  const GASP = 0.63, punch = t > GASP ? 1 + 0.08 * Math.exp(-(t - GASP) * 6) : 1;
  blurLayer(g, 12, (g) => frozenKitchen2(g, t, { z: 1.4, x: 220, y: -60 }, { cat: false }), null, 1);
  freezeGrade(g, 1);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04] }); cam.z *= punch;
  layer(g, cam, 1, (g) => {
    const f = faceAt(t, [[0, { ...FACE.shocked, open: 0.3 }], [GASP, { ...FACE.worried, open: 0.95, w: 0.7, eye: 1.25, sweat: 1, look: [0.3, -0.2] }]]);
    heroBigFace(g, 860, 590, 330, { f, blink: blinkAmt(t, 3.0, 6), rimColor: '#ffd9a0', rimSide: -1 });
    const r = rng(19); for (let i = 0; i < 26; i++) { const an = r() * Math.PI * 2, d = 40 + r() * 120, x = 860 + Math.cos(an) * d * 1.4, y = 590 + 330 * 0.6 + Math.sin(an) * d * 0.5; circle(g, x, y, 3 + r() * 4, alpha(CREAM, 0.85)); circle(g, x - 1, y - 1, 1.2, '#ffffff'); }
  });
  readout(g, t, ro(t, 7, 7.5, info.dur));
}});

// ======================================================================= s035 Nothing comes in.
registerShot('s035', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.02], drift: 0.25 });
  blurLayer(g, 14, (g) => frozenKitchen2(g, t, { z: 1.6, x: 260, y: -120 }, { cat: false }), null, 1);
  freezeGrade(g, 1); veil(g, '#0b1324', 0.2);
  layer(g, cam, 1, (g) => {
    // side profile: the back of the head + hair at left, the face edge at x~860 with the glasses' edge; the striped shoulder below
    const cx = 520, cy = 470, R = 420;
    g.fillStyle = '#2f8f8a'; g.beginPath(); g.ellipse(cx - 60, cy + R + 260, R * 1.1, 300, 0, 0, 7); g.fill(); g.save(); g.clip(); for (let i = 0; i < 5; i++) { g.fillStyle = CREAM; g.fillRect(0, cy + R + 60 + i * 70, 1200, 24); } g.restore();
    circle(g, cx, cy, R, '#14121a');
    g.fillStyle = '#14121a'; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.0 + i * 0.12); g.beginPath(); g.moveTo(cx + Math.cos(a - 0.1) * R * 0.9, cy + Math.sin(a - 0.1) * R * 0.9); g.lineTo(cx + Math.cos(a) * R * 1.1, cy + Math.sin(a) * R * 1.1); g.lineTo(cx + Math.cos(a + 0.12) * R * 0.9, cy + Math.sin(a + 0.12) * R * 0.9); g.fill(); }
    g.save(); g.beginPath(); g.arc(cx, cy, R * 1.03, -0.9, 0.9); g.arc(cx - 14, cy, R, 0.9, -0.9, true); g.fillStyle = alpha('#cfeaff', 0.85); g.fill(); g.restore();   // cool rim on the face edge
    seg(g, [[cx + R * 0.86, cy - 40], [cx + R * 0.98, cy - 44]], 16, '#6a3c1a'); seg(g, [[cx + R * 0.98, cy - 44], [cx + R * 0.3, cy - 70]], 10, '#5a3418');   // glasses edge + arm
    g.fillStyle = '#3a0c18'; g.beginPath(); g.ellipse(cx + R * 0.97, cy + 150, 10, 26, 0, 0, 7); g.fill();            // the held-shut lips
    g.save(); g.beginPath(); g.rect(cx + R + 10, 0, E.W, E.H); g.clip(); airWall(g, 0, { k: 1, x: cx + R, press: { x: cx + R, y: cy + 150, r: 160, depth: 0.15 }, seed: 44, density: 1.0 }); g.restore();
    const ak = ease.out(prog(t, 0.1, 0.44)), ax = cx + R + 420, ay = cy + 150;
    if (ak > 0) { seg(g, [[ax, ay], [lerp(ax, cx + R + 70, ak), ay]], 12, GOLD); if (ak > 0.9) poly(g, [[cx + R + 40, ay], [cx + R + 80, ay - 26], [cx + R + 80, ay + 26]], GOLD); text(g, 'in', ax - 80, ay - 60, { size: 56, color: GOLD, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#0b1324' }); }
    if (t > 0.44) { const k = ease.outBack(prog(t, 0.44, 0.7)), mx = cx + R + 220; g.save(); g.translate(mx, ay); g.scale(k, k); seg(g, [[-60, -60], [60, 60]], 18, CORAL); seg(g, [[-60, 60], [60, -60]], 18, CORAL); g.restore(); }
  });
  readout(g, t, ro(t, 7.5, 8, info.dur));
}});
