// B_s045_s051_kitten_window.js — batch B: the kitten under the car, then face-first into the shop window (and Dev's verdict).
import { E, V, S, wordTime, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, rng, mix } from '/engine/core.js';
import { POSES, breathe, posesAt, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { street, streetFg, streetGround } from '../sets/street.js';
import { thermalView, heatActor, heatCat, heatBlob, heatRect } from '../sets/thermal.js';
import { chip } from '../sets/hud.js';
import { HERO } from '../cast.js';
import { W, push, scr, hand, blinkAt } from './B_lib.js';

const CX = E.W / 2, car = () => ({ x: CX + 380, y: streetGround() + 140 - 14 });       // street.js parked car centre / wheel line (pos.carX, roadY - 14)
const SHOP = () => ({ x: CX - 760, w: 540, top: streetGround() - 330 });                // street.js corner shop window

// s045 — "Out on the dark street, you spot a kitten under a parked car."  THERMAL wide, slow push
registerShot('s045', { draw(g, t, info) {
  const cam = push(t, info, { z: 1.0, x: -60, y: 0 }, { z: 1.3, x: 260, y: 60 }), GY = streetGround(), C = car();
  const tSpot = W('spot', info, 1.38), tKit = W('kitten', info, 1.8), walkK = clamp(1 - prog(t, tSpot - 0.2, tSpot + 0.2));
  const hx = lerp(CX - 760, CX - 280, ease.out(prog(t, 0, tSpot + 0.1))), dx = hx - 190;
  const heroPose = walkK > 0.5 ? walkPose(t * Math.PI * 2 * 0.9) : breathe(posesAt(t, [[0, POSES.stand], [tSpot, POSES.point]], 0.25), t);
  const devPose = t < tSpot + 0.3 ? walkPose(t * Math.PI * 2 * 0.9 + 1.3) : breathe(POSES.stand, t, 1, 2);
  const kx = C.x - 10 + Math.sin(t * 1.6) * 8, ky = C.y + 30;
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatActor(c, 'DEV', { x: dx, y: GY, s: 1.05, facing: 1, pose: devPose, t });
      heatActor(c, 'HERO', { x: hx, y: GY, s: 1.05, facing: 1, pose: heroPose, t });
      heatCat(c, { x: kx, y: ky, s: 0.5, facing: -1, pose: 'loaf', t, heat: lerp(0.6, 0.84, prog(t, tKit - 0.4, tKit)) }); heatBlob(c, kx, ky - 14, 70, 34, 0.35, 0.9);
      heatRect(c, C.x - 220, C.y - 70, 440, 12, 0.18, 4);     // the engine is long cold: just a faint warm strip
    }),
    hud: { label: 'THERMAL', temp: t > tKit - 0.2 ? '36 C  KITTEN' : null, track: t > tKit - 0.4 ? scr(cam, kx, ky - 16) : null },
  });
  FX.dust(g, t, { count: 20, color: '#ffb070', a: 0.18 });
} });

// s046 — "A small orange glow. You rescue it."  insert: kneeling on the kerb, a kitten cupped in both hands, tender smile
registerShot('s046', { draw(g, t, info) {
  const tGlow = W('glow', info, 1.44), tRes = W('rescue', info, 2.66), GY = streetGround();
  const cam = push(t, info, { z: 1.85, x: 260, y: 150 }, { z: 2.05, x: 300, y: 120 });
  const St = street(g, t, cam, { power: 0 }), C = car();
  const scoop = ease.inOut(prog(t, tRes - 0.6, tRes + 0.2)), hx = C.x - 330, hy = GY + 70;
  const pose = breathe(posesAt(t, [[0, POSES.crouch], [tRes - 0.5, POSES.kneel], [tRes + 0.1, POSES.holdFront]], 0.4), t, 0.7);
  const hero = { x: hx, y: hy, s: 1.15, facing: 1, pose, t };
  const [px, py] = hand(hero), kx = lerp(C.x - 40, px + 10, scoop), ky = lerp(C.y + 30, py + 6, scoop);
  layer(g, cam, 1, (g) => {
    FX.pool(g, kx, ky + 10, 160, 40, '#ffb070', 0.25 + 0.15 * scoop);
    actor(g, 'HERO', { ...hero, expr: t > tRes ? 'happy' : t > tGlow ? 'awe' : 'smile', rim: { color: '#ffb070', dir: [0.7, 0.2] }, look: [0.6, 0.4], blink: blinkAt(t, 0.5) });
    cat(g, { x: kx, y: ky, s: 0.46, facing: -1, pose: scoop > 0.5 ? 'sit' : 'loaf', t, eyes: t > tRes + 0.5 ? 'blink' : 'wide', collar: null, fill: '#d0763a', rim: { color: '#ffd59a' } });
    glow(g, kx, ky - 20, 150, '#ff9a4a', 0.28 + 0.06 * Math.sin(t * 4));                               // the warm little glow lights his face
    glow(g, hx + 30, hy - 200, 150, '#ffb070', 0.22 * scoop);
  });
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 24, color: '#ffd59a', a: 0.2 });
} });

// s047 — "Then you walk face first into a shop window."  two-shot: confident stride, BONK, Dev flinches
registerShot('s047', { draw(g, t, info) {
  const tWin = W('window', info, 2.6), tHit = tWin - 0.12, GY = streetGround(), Sh = SHOP(), glassX = Sh.x + Sh.w + 30;
  const hit = t > tHit, rec = ease.out(prog(t, tHit, tHit + 0.35));
  const [kx, ky] = shake(t * 22, hit ? Math.max(0, 9 - (t - tHit) * 24) : 0);
  const cam = push(t, info, { z: 1.32, x: -520, y: 30 }, { z: 1.45, x: -560, y: 20 }); cam.x += kx; cam.y += ky;
  street(g, t, cam, { power: 0 });
  const hx = hit ? glassX - 40 - 26 * rec : lerp(glassX - 640, glassX - 40, ease.linear(t / tHit)), dx = hx - 220;
  const heroPose = hit ? breathe(posesAt(t, [[0, POSES.fall], [tHit + 0.4, POSES.facepalm]], 0.25), t) : walkPose(t * Math.PI * 2 * 1.0, { stride: 32, arm: 22 });
  const devPose = hit ? breathe(posesAt(t, [[0, POSES.handsOnHead]], 0.2), t) : walkPose(t * Math.PI * 2 * 1.0 + 1.4);
  layer(g, cam, 1, (g) => {
    // the invisible glass: a pane standing edge-on, only its glints give it away
    g.save(); g.fillStyle = alpha('#c9d8ff', 0.05); g.fillRect(glassX - 4, Sh.top + 20, 10, GY - Sh.top - 30); seg(g, [[glassX, Sh.top + 30], [glassX, GY - 12]], 2, alpha('#d8e4ff', 0.25 + 0.4 * (hit ? 1 - rec : 0)));
    seg(g, [[glassX - 2, Sh.top + 80], [glassX + 2, Sh.top + 150]], 4, alpha('#ffffff', 0.35)); g.restore();
    actor(g, 'DEV', { x: hit ? dx - 20 * rec : dx, y: GY, s: 1.35, facing: 1, pose: devPose, expr: hit ? 'shocked' : 'happy', rim: { color: '#9fb6ff' }, t, blink: blinkAt(t, 2) });
    actor(g, 'HERO', { x: hx, y: GY, s: 1.35, facing: 1, pose: heroPose, expr: hit ? 'shocked' : 'smirk', rim: { color: '#9fb6ff' }, t, rot: hit ? -0.08 * (1 - rec) : 0 });
    if (hit) { const sp = ease.outBack(prog(t, tHit, tHit + 0.3)) * clamp(1 - prog(t, tHit + 0.7, tHit + 1.0)); for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.256; FX.sparkle(g, glassX - 20 + Math.cos(a) * 50, GY - 300 + Math.sin(a) * 16, 16 * sp, '#ffe6a8', 0.9 * sp); }
      seg(g, [[glassX - 6, GY - 316], [glassX + 2, GY - 290]], 3, alpha('#ffffff', 0.6 * (1 - rec))); }
  });
  if (hit && t < tHit + 0.08) { g.save(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 22, color: '#c9d4ff', a: 0.2 });
} });

// s048 — "Ordinary glass blocks thermal infrared."  THERMAL: the window is a flat cold slab; the warm people inside are hidden
registerShot('s048', { draw(g, t, info) {
  const tGlass = W('glass', info, 0.44), tBlk = W('blocks', info, 0.8), GY = streetGround(), Sh = SHOP();
  const cam = push(t, info, { z: 1.22, x: -420, y: 20 }, { z: 1.32, x: -380, y: 0 });
  const peek = ease.inOut(prog(t, tBlk - 0.1, tBlk + 0.5));   // a quick "x-ray" ghost shows who is really inside, then the glass hides them again
  thermalView(g, t, {
    cold: (c) => street(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatRect(c, Sh.x, Sh.top, Sh.w, GY - Sh.top - 30, 0.16, 2);                                             // the glass: flat, even, cold
      c.save(); c.globalAlpha = 0.5; heatActor(c, 'HERO', { x: Sh.x + Sh.w - 120, y: GY - 20, s: 1.2, facing: -1, pose: breathe(POSES.facepalm, t), t, heat: 0.36, halo: false }); c.restore();   // his own faint reflection
      heatActor(c, 'HERO', { x: Sh.x + Sh.w + 40, y: GY, s: 1.3, facing: -1, pose: breathe(POSES.facepalm, t), t });
      heatActor(c, 'DEV', { x: Sh.x + Sh.w + 230, y: GY, s: 1.3, facing: -1, pose: breathe(POSES.handsOnHead, t, 1, 2), t });
    }),
    hud: { label: 'THERMAL', temp: '12 C  GLASS', track: scr(cam, Sh.x + Sh.w * 0.45, Sh.top + 160) },
  });
  // the people inside the shop, shown as dashed ghost outlines only while "blocks" is spoken
  const ghostA = peek * clamp(1 - prog(t, tBlk + 0.9, tBlk + 1.3));
  if (ghostA > 0) layer(g, cam, 1, (g) => { g.save(); g.globalAlpha *= ghostA; g.setLineDash([8, 10]); g.strokeStyle = alpha('#ffd47e', 0.8); g.lineWidth = 3;
    for (const [x, s] of [[Sh.x + 150, 1.0], [Sh.x + 330, 0.9]]) { g.beginPath(); g.arc(x, GY - 200 * s, 26 * s, 0, 7); g.moveTo(x, GY - 174 * s); g.lineTo(x, GY - 100 * s); g.stroke(); }
    g.setLineDash([]); text(g, '?', Sh.x + 240, GY - 260, { size: 70, color: '#ffd47e', font: FONTS.ui, weight: 900 }); g.restore(); });
  chip(g, t, { str: 'Glass blocks thermal infrared', at: tGlass, x: E.W / 2, y: E.H * 0.86, dur: info.dur - 0.1 });
} });

// squished face against glass (shared by s049 and s051): bigFace scaled flat on the right, glass plane + smudge
function squishedFace(g, t, cx, cy, r, squish, o = {}) {
  g.save(); g.translate(cx, cy); g.scale(1 - 0.14 * squish, 1 + 0.08 * squish); g.translate(-cx, -cy);
  bigFace(g, cx, cy, r, { outfit: HERO, expr: o.expr || 'shocked', rimColor: '#9fb6ff', rimSide: -1, look: [0.6, 0], blink: o.blink, face: squish > 0.5 ? { mouth: 'o' } : null });
  g.restore();
  const gx = cx + r * (0.94 - 0.14 * squish);   // the glass: a cool slab with a smudge where the face is
  g.save(); g.fillStyle = linG(g, gx, 0, E.W, 0); g.fillRect(gx, 0, E.W - gx, E.H); seg(g, [[gx, 0], [gx, E.H]], 4, alpha('#d8e4ff', 0.5));
  for (let i = 0; i < 4; i++) seg(g, [[gx + 60 + i * 70, E.H * 0.1 + i * 40], [gx + 160 + i * 70, E.H * 0.1 + i * 40 - 90]], 6, alpha('#ffffff', 0.08));
  g.fillStyle = alpha('#e8f0ff', 0.12 * squish); g.beginPath(); g.ellipse(gx + 6, cy, 40, r * 0.7, 0, 0, 7); g.fill(); g.restore();
}
const linG = (g, x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(120,150,220,.28)'); gr.addColorStop(1, 'rgba(40,50,90,.12)'); return gr; };

// s049 — "To you, it is a flat, cold wall."  FREEZE-FRAME (scope bars): face squished on the glass, particles hanging
registerShot('s049', { draw(g, t, info) {
  const tCold = W('cold', info, 1.48), tWall = W('wall', info, 1.92), sc = 1 + 0.06 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.rotate(0.012 * Math.sin(t * 0.7)); g.translate(-E.W / 2, -E.H / 2);
  street(g, 0, { z: 1.9, x: -470, y: -60 }, { power: 0 });
  g.save(); g.fillStyle = 'rgba(8,10,24,.45)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  squishedFace(g, t, E.W * 0.47, E.H * 0.5, E.H * 0.3, 1, { expr: 'shocked' });
  const R = rng(49); for (let i = 0; i < 46; i++) { const x = R() * E.W, y = R() * E.H, s = 1 + R() * 3; circle(g, x + Math.sin(t * 0.4 + i) * 3, y + t * 2 * (R() - 0.5), s, alpha('#e8f0ff', 0.35 + R() * 0.3)); }   // hanging particles (barely drifting)
  g.restore();
  // freeze-frame treatment: cool tint + a thin frame line
  g.save(); g.strokeStyle = alpha('#e8f0ff', 0.25); g.lineWidth = 3; g.strokeRect(60, 150, E.W - 120, E.H - 300); g.restore();
  chip(g, t, { str: 'COLD WALL', at: tCold, x: E.W * 0.72, y: E.H * 0.3, tone: 'blue', dur: info.dur - 0.1 });
  if (t > tWall) text(g, '12 C', E.W * 0.72, E.H * 0.42, { size: 54, color: '#cfe0ff', font: FONTS.ui, weight: 900, alpha: clamp((t - tWall) * 4), glow: 14, glowColor: 'rgba(120,160,255,.6)' });
} });

// s050 — "Dev wheezes with laughter. Mate... that was a window."  two-shot: Dev doubled over, HERO rubs his nose
registerShot('s050', { draw(g, t, info) {
  const GY = streetGround(), Sh = SHOP(), tMate = W('Mate', info, 1.2), tWin = W('window', info, 3.28);
  const cam = push(t, info, { z: 1.55, x: -360, y: 70 }, { z: 1.68, x: -320, y: 60 });
  street(g, t, cam, { power: 0 });
  const laugh = Math.abs(Math.sin(t * 9)), bend = 0.42 + 0.06 * laugh;
  layer(g, cam, 1, (g) => {
    const hx = Sh.x + Sh.w + 40, dx = hx + 300;
    actor(g, 'HERO', { x: hx, y: GY, s: 1.5, facing: 1, pose: breathe(POSES.facepalm, t, 1.4), expr: t > tWin ? 'angry' : 'sad', rim: { color: '#9fb6ff' }, t, look: [0.8, -0.2], blink: blinkAt(t, 0.4) });
    circle(g, hx + 46 * 1.5, GY - 300 * 1.5 / 1.45, 10, alpha('#ff7a6a', 0.55));                                   // a red nose
    actor(g, 'DEV', { x: dx, y: GY, s: 1.5, facing: -1, pose: breathe(t < W('that', info, 2.76) - 0.1 ? POSES.crouch : POSES.point, t, 2), rot: t < W('that', info, 2.76) - 0.1 ? bend : 0.1, expr: 'joy', rim: { color: '#9fb6ff' }, t,
      talk: t > tMate - 0.05 ? 0.3 + 0.7 * laugh * (t < tMate + 0.9 || t > W('that', info, 2.76) - 0.05 ? 1 : 0.2) : 0.6 * laugh });
    if (t < tMate + 0.4) for (let i = 0; i < 3; i++) { const ph = (t * 1.4 + i / 3) % 1; text(g, 'ha', dx - 60 - i * 30, GY - 340 - ph * 120, { size: 36 + i * 6, color: '#ffd47e', font: FONTS.title, weight: 700, alpha: Math.sin(ph * Math.PI) }); }
  });
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 22, color: '#c9d4ff', a: 0.2 });
} });

// s051 — "Ten out of ten."  a big gold 10/10 stamp slaps down over the squished-face freeze; confetti sparkle
registerShot('s051', { draw(g, t, info) {
  const tTen = W('Ten', info, 0.12), tTen2 = (() => { const w = wordTime('ten', info.shot.start + 0.6); return w == null ? 1.14 : w - info.shot.start; })(), ui = S().ui, sc = 1.04 + 0.04 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
  street(g, 0, { z: 1.9, x: -470, y: -60 }, { power: 0 }); g.save(); g.fillStyle = 'rgba(8,10,24,.5)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  squishedFace(g, t, E.W * 0.47, E.H * 0.5, E.H * 0.3, 1, { expr: 'sad' });
  g.restore();
  const sk = prog(t, tTen + 0.05, tTen + 0.25), [kx, ky] = shake(t * 24, sk >= 1 ? Math.max(0, 10 - (t - tTen - 0.25) * 40) : 0);
  if (sk > 0) { const ss = lerp(3, 1, ease.out(sk)); g.save(); g.translate(E.W * 0.62 + kx, E.H * 0.5 + ky); g.rotate(-0.16); g.scale(ss, ss); g.globalAlpha *= clamp(sk * 3) * clamp((info.dur - t) / 0.25);
    rr(g, -260, -130, 520, 260, 30); g.strokeStyle = ui.gold; g.lineWidth = 14; g.stroke(); rr(g, -236, -106, 472, 212, 20); g.lineWidth = 4; g.stroke();
    text(g, '10/10', 0, 8, { size: 170, color: ui.gold, font: FONTS.title, weight: 700, glow: 30, glowColor: alpha(ui.gold, 0.7) }); g.restore(); }
  if (t > tTen + 0.2) { const R = rng(51); for (let i = 0; i < 70; i++) { const a = R() * Math.PI * 2, v = 300 + R() * 700, tt = t - tTen - 0.2, x = E.W * 0.62 + Math.cos(a) * v * tt, y = E.H * 0.5 + Math.sin(a) * v * tt + 500 * tt * tt;
    g.save(); g.translate(x, y); g.rotate(tt * 8 + i); g.fillStyle = ['#ffd47e', '#ff7a6a', '#9fb6ff', '#7adf8a'][i % 4]; g.globalAlpha *= clamp(1.6 - tt); g.fillRect(-8, -4, 16, 8); g.restore(); } }
  if (t > tTen2) FX.sparkle(g, E.W * 0.8, E.H * 0.3, 40 * ease.outBack(prog(t, tTen2, tTen2 + 0.3)), '#fff3c4', 0.9);
} });
