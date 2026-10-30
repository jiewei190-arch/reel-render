// C_s058_s060_burj.js — batch C: day 12, one kilometre, over the Burj Khalifa at sunset.
//   s058 wide: golden skyline, DAY 11 -> 12, meter 1 km on 'One'; HERO launches from the lakeside promenade on 'sail', the camera starts rising up the supertall
//   s059 med: the rise continues past the spire, gold '828 m' marker on 'eight'; HERO crests ABOVE the spire on 'metres', sunset glint
//   s060 face: giant face at the apex, awe -> joy -> worried, eyes flick DOWN on 'landing'; an inset bubble shows the splash ring on the lake far below
import { E, S, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rr, seg, circle, ring, glow, alpha, shade, text, FONTS, veil } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { VOLUNTEER } from '../cast.js';
import { skyline, skylineFg, skylineGround } from '../sets/skyline.js';
import { faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, jumpStreaks } from '../sets/jump.js';
import { wt, TEE, teeFace, dayC, meter, PEDS } from './C_lib.js';

const GY = () => skylineGround();
const towerTop = () => GY() - 40 - E.H * 1.95;
const camTop = () => (towerTop() - E.H / 2 + 120) / 0.55;          // camera y that puts the spire tip just above centre

registerShot('s058', { draw(g, t, info) {
  const tDay = wt(info, 'Day', 0.15), tOne = wt(info, 'One', 0.83), tSail = wt(info, 'sail', 2.13), gy = GY() + 30;
  const J = jumpPose(t, tSail, 2600, { up: 4, hang: 1, down: 3 }), rise = ease.in(prog(t, tSail, info.dur + 0.4)) * 0.3;
  const cam = camMove(t, info.dur, { z: [0.94, 1.0], x: [-80, -20] }); cam.y = lerp(20, camTop(), rise);
  const K = skyline(g, t, cam, { mood: 'golden', sun: 1, label: 0 });
  const hx = E.W / 2 - 220, heroY = t < tSail ? gy : Math.min(gy, lerp(gy, cam.y + E.H * 0.56, ease.out(prog(t, tSail, tSail + 0.9))));
  layer(g, cam, 1, (g) => {
    // tourists on the promenade, phones up at the sunset (then at him)
    [[hx - 520, 1, 0], [hx + 380, -1, 2], [hx + 660, -1, 4]].forEach(([x, f, i]) => { const noticed = t > tSail + 0.15 + i * 0.05;
      actor(g, { ...VOLUNTEER, color: PEDS[i], head: ['cap', 'bun', 'none'][i % 3], headColor: PEDS[(i + 3) % PEDS.length] }, { x, y: gy + 10, s: 1.7, facing: f, pose: idle(noticed ? POSES.pointUp : POSES.phone, t, i), expr: noticed ? 'surprised' : 'smile', blink: blinkFlag(t, 2.8 + i * 0.4, i), look: noticed ? lookToward(f * 0.2, -1) : lookToward(f, -0.2), rim: K.rim, t, prop: noticed ? null : { type: 'phone' } }); });
    jumpFX(g, t, J, { x: hx, gy, s: 1.9, landing: 'soft', dustColor: '#ffd8a8' });
    jumper(g, TEE, { ...J, lift: gy - heroY }, { x: hx, gy, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'neutral'], [tOne, 'determined'], [tSail, 'joy']]), blink: blinkFlag(t, 3.3, 2), look: t < tSail ? lookToward(0.5, -0.8) : [0.4, -0.6], rim: K.rim, t, shadow: t < tSail + 0.2 });
  });
  skylineFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffd8a8' });
  dayC(g, t, [[0, 11], [tDay, 12]]);
  meter(g, t, t < tSail ? 1000 : 1000, { at: tOne, text: '1 km' });
} });

registerShot('s059', { draw(g, t, info) {
  const tEight = wt(info, 'eight', 1.13), tMet = wt(info, 'metres', 3.24), rise = lerp(0.3, 1.04, ease.inOut(prog(t, 0, info.dur)));
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [120, 180] }); cam.y = lerp(20, camTop(), rise);
  const K = skyline(g, t, cam, { mood: 'golden', sun: 1, label: ease.out(prog(t, tEight - 0.1, tEight + 0.6)) });
  const [sx, sy] = K.pos.screenTop(cam), crest = ease.inOut(prog(t, tMet - 0.9, tMet)), hsy = lerp(E.H * 0.7, sy - 260, crest), hx = lerp(E.W * 0.36, sx - 60, crest);
  // hero rides the camera; in screen space so he can clear the spire exactly on 'metres'
  const pose = idle(poseAt(t, [[0, 'jump'], [tMet - 0.3, 'delight']], 0.3), t, 2);
  jumpStreaks(g, t, hx, hsy - 40, { s: 1.9, dir: 1, a: 0.35 * (1 - crest), count: 14, seed: 4 });
  layer(g, { x: 0, y: 0, z: 1 }, 1, (g) => actor(g, TEE, { x: hx, y: hsy + 230, s: 1.9, facing: 1, pose, rot: 0.06 * Math.sin(t * 1.3), expr: exprAt(t, [[0, 'determined'], [tEight, 'awe'], [tMet, 'joy']]), blink: blinkFlag(t, 3.3, 2), look: crest > 0.5 ? [0.6, 0.4] : [0.6, -0.4], rim: K.rim, t, shadow: false }));
  // shirt flutter streaks + the sunset glint across his face on 'metres'
  const gl = ease.out(prog(t, tMet, tMet + 0.25)) * clamp((info.dur - t) / 0.2); if (gl > 0) { FX.sparkle(g, hx + 30, hsy - 10, 44 * gl, '#fff3d0', 0.95); glow(g, hx + 30, hsy, 260, '#ffb070', 0.35 * gl); FX.lensStreak(g, hx + 30, hsy, E.W, '#ffd8a8', 0.3 * gl, 3); }
  skylineFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffd8a8' });
  dayC(g, t, [[0, 12]]);
  meter(g, t, lerp(620, 1000, ease.inOut(prog(t, 0.2, info.dur))), { marks: [['BURJ KHALIFA', 828], ['NIAGARA', 51], ['CLOUDS', 2000], ['EVEREST', 8849], ['5 STOREYS', 16]] });
} });

registerShot('s060', { draw(g, t, info) {
  const tInc = wt(info, 'incredible', 0.75), tLand = wt(info, 'landing', 1.79), tLake = wt(info, 'lake', 2.53);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-30, 30] }); cam.y = camTop() * 1.12;
  blurLayer(g, 8, (g) => skyline(g, t, cam, { mood: 'golden', sun: 1, label: 0 }), null, 1); veil(g, '#2a1020', 0.2);
  const f0 = faceAt(t, [[0, 'awe'], [tInc + 0.15, 'joy'], [tLand, 'worried']]), down = ease.out(prog(t, tLand - 0.05, tLand + 0.2));
  const f = { ...f0, look: [lerp(0.25, 0, down), lerp(-0.25, 1, down)], glint: Math.max(f0.glint || 0, 0.8 * (1 - down)) };
  const z = lerp(1.0, 1.05, ease.inOut(t / info.dur)), cx = E.W * 0.42, cy = E.H * 0.54 + Math.sin(t * 1.6) * 6;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  teeFace(g, cx, cy, 320, { f, rimSide: 1, rimColor: '#ffb060', glint: '#ffd08a', blink: blinkAmt(t, 3.0, 2), breath: Math.sin(t * 2.2), tilt: Math.sin(t * 0.8) * 0.02 + down * 0.04 });
  // the city reflected in his eyes: tiny gold spire glints
  for (const ex of [-1, 1]) { const px = cx + ex * 320 * 0.34 + f.look[0] * 22, py = cy - 12 + f.look[1] * 20; seg(g, [[px - 6, py + 10], [px - 6, py - 12]], 3, alpha('#ffd08a', 0.8 * (1 - down))); }
  g.restore();
  // inset bubble: the lake far below, the splash ring on 'lake'
  const bk = ease.outBack(prog(t, tLake - 0.35, tLake - 0.05)); if (bk > 0.01) { const bx = E.W * 0.8, by = E.H * 0.72, br = 210 * bk;
    seg(g, [[cx + 140, cy + 250], [bx - br * 0.7, by - br * 0.5]], 5, alpha('#fff1dc', 0.6)); circle(g, cx + 190, cy + 290, 12 * bk, '#fff1dc'); circle(g, cx + 230, cy + 330, 18 * bk, '#fff1dc');
    g.save(); g.beginPath(); g.arc(bx, by, br, 0, 7); g.clip();
    g.translate(bx, by); g.scale(0.42, 0.42); g.translate(-E.W / 2, -E.H / 2);
    skyline(g, t, { x: 0, y: 400, z: 1 }, { mood: 'golden', sun: 1, label: 0, splash: prog(t, tLake, tLake + 1.0), splashX: E.W / 2 }); g.restore();
    ring(g, bx, by, br, 8, '#fff1dc'); glow(g, bx, by, br * 1.4, '#ffd8a8', 0.12); }
  atmos(g, t, cam, { color: '#ffd8a8', far: 10, near: 4 });
} });
