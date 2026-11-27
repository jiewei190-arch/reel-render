// B_s046_s052_kitten_window.js — batch B: the kitten under the car, face-first into the shop window, glass blocks thermal IR, Dev's verdict.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, shade, mix, rng, talkAmount } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { street, streetFg, streetGround } from '../sets/street.js';
import { thermalView, heatActor, heatCat, heatBlob, heatRect, heat } from '../sets/thermal.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { W, handWorld, scr, punch, devBeanie, stamp, glassPane } from './B_lib.js';

const CX = E.W / 2, CAR = () => ({ x: CX + 380, y: streetGround() + 140 - 14 }), SHOP = () => ({ x: CX - 760, w: 540, top: streetGround() - 330 });
const kitten = (g, o) => cat(g, { collar: null, fill: '#e08a3a', pose: 'sit', ...o });     // a tiny ginger kitten (no collar)

// s046 — "Out on the dark street, you spot a small orange glow"  THERMAL: hero walks in, a glow pulses under the parked car, crosshair slides to it
registerShot('s046', { draw(g, t, info) {
  const tSpot = W('spot', info, 1.47), tGlow = W('glow', info, 2.53), GY = streetGround(), C = CAR();
  const cam = camMove(t, info.dur, { z: [1.12, 1.24], x: [-80, 140], y: [60, 70] });
  const hx = CX - 700 + 165 * Math.min(t, tSpot + 0.2), wk = walkAlong(hx, 1.7, {}), stop = t > tSpot + 0.2;
  const pose = stop ? idle(poseAt(t, [[0, 'stand'], [tSpot + 0.25, 'point']], 0.25), t, 3) : wk.pose;
  const kx = C.x - 20, ky = C.y + 26, pulse = 0.5 + 0.5 * Math.sin(t * 5), on = ease.out(prog(t, tGlow - 0.7, tGlow));
  const [ax, ay] = scr(cam, hx + 40, GY - 360), [bx, by] = scr(cam, kx, ky - 20), slide = ease.inOut(prog(t, tSpot, tGlow));
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatActor(c, 'HERO', { x: hx, y: GY + 30, s: 1.7, facing: 1, pose, t, expr: exprAt(t, [[0, 'neutral'], [tSpot, 'surprised'], [tGlow, 'smile']]), blink: blinkFlag(t, 3.3, 4), look: lookToward(1, t > tSpot ? 0.5 : 0) });
      heatCat(c, { x: kx, y: ky, s: 1.0, facing: -1, pose: 'loaf', t, heat: lerp(0.35, 0.62 + 0.06 * pulse, on), collar: null }); heatBlob(c, kx, ky - 14, 120, 60, (0.22 + 0.12 * pulse) * on, 0.9);
    }),
    hud: { label: 'THERMAL', temp: t > tGlow - 0.3 ? '38 C' : null, track: t > tSpot ? [lerp(ax, bx, slide), lerp(ay, by, slide)] : null },
  });
  FX.dust(g, t, { count: 26, color: '#ffb070', a: 0.2 }); FX.dust(g, t * 1.6, { count: 10, color: '#ffd8a0', a: 0.3, seed: 8 });
} });

// s047 — "under a parked car and rescue a kitten."  normal dark street: crouch by the car, lift out the kitten, cradle it, smile
registerShot('s047', { draw(g, t, info) {
  const tRes = W('rescue', info, 1.47), tKit = W('kitten', info, 1.97), GY = streetGround(), C = CAR();
  const cam = camMove(t, info.dur, { z: [1.42, 1.52], x: [130, 190], y: [150, 140] });
  const A = street(g, t, cam, { power: 0.08 });
  const hero = { x: C.x - 330, y: GY + 60, s: 1.9, facing: 1 };
  const pose = idle(poseAt(t, [[0, 'crouch'], [0.35, 'reach'], [tRes + 0.1, 'crouch'], [tKit - 0.1, 'holdFront']], 0.3), t, 2);
  const [hx, hy] = handWorld(hero, pose), lift = ease.inOut(prog(t, tRes, tKit)), kx = lerp(C.x - 60, hx + 8, lift), ky = lerp(C.y + 34, hy + 10, lift);
  layer(g, cam, 1, (g) => {
    glow(g, hero.x - 260, GY - 520, 300, '#ffd59a', 0.12);                                                          // the one lit window's spill
    actor(g, 'HERO', { ...hero, pose, t, rim: A.rim, expr: exprAt(t, [[0, 'worried'], [tRes, 'surprised'], [tKit, 'happy']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, lift > 0.6 ? 0.2 : 0.6) });
    kitten(g, { x: kx, y: ky, s: 1.0, facing: -1, t, eyes: t > tKit + 0.3 ? 'blink' : 'wide', rim: { color: '#ffd59a', dir: [0.6, -1] } });
    if (t > tKit) { const mk = Math.sin(prog(t, tKit, tKit + 0.6) * Math.PI); text(g, 'mew', kx + 60, ky - 150, { size: 38, color: '#ffe6b0', font: FONTS.title, weight: 700, alpha: mk }); glow(g, kx, ky - 50, 120, '#ffb070', 0.18); }
  });
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: '#c9d4ff' });
} });

// s048 — "Then you walk face first into a shop window,"  medium tracking: confident walk with the kitten, SMACK into the glass on "window"
registerShot('s048', { draw(g, t, info) {
  const tWin = W('window', info, 1.99), tHit = tWin - 0.06, GY = streetGround(), Sh = SHOP(), glassX = Sh.x + Sh.w + 46;
  const hit = t > tHit, pk = punch(t, tHit, 0.08, 0.5), rec = ease.out(prog(t, tHit, tHit + 0.4));
  const hx = hit ? glassX - 46 - 30 * rec : glassX - 46 - 168 * (tHit - t);
  const cam = camMove(t, info.dur, { z: [1.32, 1.38], y: [70, 64] }); cam.x = hx - CX + 120; cam.z += 0.09 * pk; { const sk = shake(t * 4, 16 * pk, 5, 2); cam.x += sk[0]; cam.y += sk[1]; }
  const A = street(g, t, cam, { power: 0.05 + (hit ? 0.12 * Math.abs(Math.sin(t * 40)) * (1 - rec) : 0) });   // the neon OPEN flickers on impact
  const wk = walkAlong(hx, 1.9, {}), pose = hit ? idle(poseAt(t, [[0, reaction('wince', t, tHit)], [tHit + 0.45, 'holdFront']], 0.25), t, 1) : (() => { const p = { ...wk.pose }; p.hF = [34, -108]; p.eF = [20, -136]; return p; })();
  const hero = { x: hx, y: GY + 40, s: 1.9, facing: 1 }, [kx, ky] = handWorld(hero, pose);
  layer(g, cam, 1, (g) => {
    glassPane(g, glassX, Sh.top + 10, GY + 20, { shudder: hit ? 1 - rec : 0, t });
    actor(g, 'HERO', { ...hero, pose, t, rim: A.rim, rot: hit ? -0.06 * (1 - rec) : 0, expr: exprAt(t, [[0, 'smirk'], [tHit, 'shocked'], [tHit + 0.5, 'worried']]), blink: hit && t < tHit + 0.3 ? true : blinkFlag(t, 3.5, 6), look: [1, 0] });
    kitten(g, { x: kx + 6, y: ky + 26, s: 0.9, facing: 1, t, eyes: hit && t < tHit + 0.5 ? 'blink' : 'open', rim: { color: '#ff8ab0', dir: [-0.8, -0.5] } });
    if (hit) { const sp = ease.outBack(prog(t, tHit, tHit + 0.25)) * clamp(1 - prog(t, tHit + 0.5, tHit + 0.62)); for (let i = 0; i < 5; i++) { const a = t * 4 + i * 1.256; FX.sparkle(g, glassX - 30 + Math.cos(a) * 60, GY - 390 + Math.sin(a) * 18, 18 * sp, '#ffe6a8', 0.9 * sp); } }
  });
  if (hit && t < tHit + 0.07) veil(g, '#ffffff', 0.3);
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffb0c8' });
} });

// s049 — "because ordinary glass blocks thermal infrared."  BLUEPRINT: light rays pass through the pane, thermal IR bounces off
registerShot('s049', { draw(g, t, info) {
  const ui = S().ui, tGl = W('glass', info, 0.87), tBl = W('blocks', info, 1.19), z = 1 + 0.035 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'ORDINARY WINDOW GLASS', fig: 'FIG 7 - LIGHT VS THERMAL IR' });
  const gx = E.W * 0.52, k = ease.out(prog(t, 0, 0.9));
  g.save(); g.globalAlpha *= k; rr(g, gx - 34, E.H * 0.18, 68, E.H * 0.64, 6); g.fillStyle = alpha(ui.blueprint, 0.16); g.fill(); g.strokeStyle = ui.blueprint; g.lineWidth = 5; g.stroke();
  for (let i = 0; i < 8; i++) seg(g, [[gx - 30, E.H * 0.22 + i * 80], [gx + 30, E.H * 0.22 + i * 80 + 40]], 2, alpha(ui.blueprint, 0.4)); g.restore();
  // visible light (cream): straight through
  const vk = ease.inOut(prog(t, 0.3, 1.2)); for (const y of [E.H * 0.3, E.H * 0.38]) { BP.draw(g, [[E.W * 0.1, y], [E.W * 0.9, y]], vk, { w: 5, color: ui.cream }); if (vk > 0.95) poly(g, [[E.W * 0.9, y - 12], [E.W * 0.93, y], [E.W * 0.9, y + 12]], ui.cream); }
  text(g, 'VISIBLE LIGHT', E.W * 0.12, E.H * 0.26, { size: 28, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: vk });
  // thermal IR (red wavy): hits the glass and bounces back on "blocks"
  const ik = prog(t, tGl - 0.4, tBl + 0.1), bk = ease.out(prog(t, tBl, tBl + 0.7));
  for (const [y, d] of [[E.H * 0.6, 0], [E.H * 0.7, 1]]) {
    const inPts = Array.from({ length: 40 }, (_, j) => { const x = lerp(E.W * 0.1, gx - 36, j / 39); return [x, y + Math.sin(j * 1.3 - t * 8) * 12]; });
    BP.draw(g, inPts, ik, { w: 5, color: '#ff5a3a' });
    if (bk > 0) { const back = Array.from({ length: 30 }, (_, j) => { const x = lerp(gx - 36, E.W * 0.16, j / 29); return [x, y + 30 + j * (2 + d) + Math.sin(j * 1.3 - t * 8) * 10]; }); BP.draw(g, back, bk, { w: 5, color: alpha('#ff5a3a', 0.85) }); }
  }
  if (bk > 0) { glow(g, gx - 36, E.H * 0.65, 110, '#ff5a3a', 0.45 * bk); text(g, 'X', gx + 110, E.H * 0.65, { size: 90, color: '#ff5a3a', font: FONTS.title, weight: 700, alpha: bk }); }
  text(g, 'THERMAL IR', E.W * 0.12, E.H * 0.55, { size: 28, color: '#ff8a6a', font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: clamp(ik * 3) });
  g.restore();
  chip(g, t, { str: 'GLASS BLOCKS THERMAL IR', at: tBl, x: E.W / 2, y: E.H * 0.9, dur: info.dur - 0.1 });
} });

// s050 — "To you, it's a flat, cold wall."  THERMAL POV of the shop window: one even purple slab, a faint reflection of his own heat
registerShot('s050', { draw(g, t, info) {
  const tFlat = W('flat', info, 1.05), tWall = W('wall', info, 1.65), GY = streetGround(), Sh = SHOP();
  const cam = camMove(t, info.dur, { z: [1.7, 1.82], x: [Sh.x + Sh.w / 2 - CX - 20, Sh.x + Sh.w / 2 - CX + 20], y: [GY - 170 - E.H / 2, GY - 180 - E.H / 2] });
  const shim = 0.5 + 0.5 * Math.sin(t * 3);
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatRect(c, Sh.x, Sh.top, Sh.w, GY - Sh.top - 30, 0.2, 2);                                                        // the glass: flat, even, cold
      c.save(); c.globalAlpha = 0.45 + 0.1 * shim; heatActor(c, 'HERO', { x: Sh.x + Sh.w * 0.52, y: GY - 10, s: 1.45, facing: -1, pose: idle(poseAt(t, [[0, 'stand']]), t, 2), t, heat: 0.42, halo: false }); c.restore();   // his own heat, mirrored faintly
    }),
    hud: { label: 'THERMAL', temp: t > tFlat ? '12 C  GLASS' : null, track: scr(cam, Sh.x + Sh.w * 0.3, Sh.top + 120) },
  });
  if (t > tFlat) { const k = ease.out(prog(t, tFlat, tFlat + 0.4)); g.save(); g.globalAlpha = 0.6 * k; g.setLineDash([16, 12]); g.strokeStyle = '#cfe0ff'; g.lineWidth = 3; const [x0, y0] = scr(cam, Sh.x + 6, Sh.top + 6), [x1, y1] = scr(cam, Sh.x + Sh.w - 6, GY - 36); g.strokeRect(x0, y0, x1 - x0, y1 - y0); g.restore(); }
  chip(g, t, { str: 'COLD WALL', at: tWall, x: E.W * 0.5, y: E.H * 0.86, tone: 'blue', dur: info.dur - 0.08 });
} });

// s051 — Dev wheezes. "Mate, that was a window."  medium: Dev doubled over laughing and pointing; HERO behind rubbing his nose, kitten peeking out
registerShot('s051', { draw(g, t, info) {
  const tMate = W('Mate', info, 1.35), tWin = W('window', info, 2.45), GY = streetGround(), Sh = SHOP();
  const cam = camMove(t, info.dur, { z: [1.4, 1.48], x: [-300, -260], y: [120, 112] });
  const A = street(g, t, cam, { power: 0.06 });
  const laugh = Math.abs(Math.sin(t * 9));
  const devPose = idle(poseAt(t, [[0, 'crouch'], [tMate - 0.1, 'point']], 0.3), t, 4), dev = { x: CX - 120, y: GY + 50, s: 1.9, facing: -1 };
  const heroPose = idle(poseAt(t, [[0, 'facepalm']], 0.3), t, 7), hero = { x: CX - 560, y: GY + 30, s: 1.75, facing: 1 };
  const [kx, ky] = [hero.x + 8 * 1.75, GY + 30 - 118 * 1.75];
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...hero, pose: heroPose, t, rim: A.rim, expr: exprAt(t, [[0, 'sad'], [tWin, 'angry']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0) });
    kitten(g, { x: kx, y: ky + 26, s: 0.95, facing: 1, t, eyes: 'open', rim: { color: '#ff8ab0' } });                    // peeking out of the hoodie front
    circle(g, hero.x + 40 * 1.75, GY + 30 - 205 * 1.75, 9, alpha('#ff6a6a', 0.7));                                     // a red nose
    actor(g, 'DEV', { ...dev, pose: devPose, t, rim: { color: '#ff8ab0', dir: [-0.8, -0.4] }, rot: t < tMate - 0.1 ? -0.42 - 0.06 * laugh : -0.1 * laugh, expr: 'joy', blink: blinkFlag(t, 2.9, 5), look: lookToward(-1, 0),
      talk: t > tMate - 0.05 ? talkAmount(info.globalT, info.shot.start + tMate - 0.05, info.shot.end) : 0.5 * laugh });
    if (t < tMate + 0.2) for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; text(g, 'ha', dev.x + 90 + i * 34, GY - 380 - ph * 120, { size: 40 + i * 6, color: '#ffd47e', font: FONTS.title, weight: 700, alpha: Math.sin(ph * Math.PI) }); }
  });
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffb0c8' });
} });

// s052 — "Ten out of ten."  GIANT FACE Dev: tears of laughter under the neon OPEN glow; a gold 10/10 stamp slams in on "Ten"
registerShot('s052', { draw(g, t, info) {
  const tTen = W('Ten', info, 0.15), tTen2 = W('ten', info, 1.09, 0.6), ui = S().ui;
  const pk = punch(t, tTen + 0.15, 0.08, 0.5), cam = camMove(t, info.dur, { z: [1.0, 1.06] }); cam.z += 0.05 * pk; { const sk = shake(t * 4, 14 * pk, 5, 4); cam.x += sk[0]; cam.y += sk[1]; }
  blurLayer(g, 16, (c) => street(c, t, { z: 2.0, x: -420, y: -40 }, { power: 0.3 }), null, 1); veil(g, '#05060f', 0.4);
  glow(g, E.W * 0.12, E.H * 0.3, 700, '#ff6a8a', 0.3 + 0.08 * Math.sin(t * 9));                                       // neon OPEN glow from the left
  const f = faceAt(t, [[0, 'joy'], [tTen + 0.3, 'delighted'], [tTen2, 'joy']], 0.14), talk = talkAmount(info.globalT, info.shot.start, info.shot.end);
  layer(g, cam, 1, (g) => {
    const cx = E.W * 0.36, cy = E.H * 0.58 + Math.sin(t * 8) * 5, r = 320;
    giantFace(g, cx, cy, r, { who: 'DEV', f: { ...f, open: Math.max(f.open * 0.6, talk * 0.9) }, rimSide: -1, rimColor: '#ff6a8a', blink: blinkAmt(t, 3.0, 2), breath: Math.sin(t * 6), tilt: 0.05 * Math.sin(t * 7) });
    devBeanie(g, cx, cy, r, { tilt: 0.05 * Math.sin(t * 7) });
    for (const s of [-1, 1]) { const ph = (t * 1.2 + (s > 0 ? 0.5 : 0)) % 1; g.fillStyle = alpha('#a8dcff', 0.9 * (1 - ph)); g.beginPath(); g.ellipse(cx + s * r * 0.5, cy + r * (0.12 + ph * 0.5), 10, 16, 0, 0, 7); g.fill(); }   // tears of laughter
  });
  stamp(g, E.W * 0.74, E.H * 0.48, '10/10', prog(t, tTen + 0.05, tTen + 0.25), { color: ui.gold });
  if (t > tTen + 0.25) { const R = rng(52); for (let i = 0; i < 60; i++) { const a = R() * 6.28, v = 300 + R() * 600, tt = t - tTen - 0.25, x = E.W * 0.74 + Math.cos(a) * v * tt, y = E.H * 0.48 + Math.sin(a) * v * tt + 520 * tt * tt;
    g.save(); g.translate(x, y); g.rotate(tt * 8 + i); g.fillStyle = ['#ffd47e', '#ff7a6a', '#9fb6ff', '#7adf8a'][i % 4]; g.globalAlpha *= clamp(1.7 - tt); g.fillRect(-8, -4, 16, 8); g.restore(); } }
  FX.dust(g, t, { count: 26, color: '#ffb0c8', a: 0.3 });
} });
