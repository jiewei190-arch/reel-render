// C_s045_s048_pond_news.js — batch C: day 9 the town pond + the ducks' complaint, day 10 the TV news.
//   s045 wide: calm pond, DAY 08 -> 09, HERO falls out of the sky (speck growing), ducks look up one by one, meter 128 m
//   s046 med: SPLASH on 'land', ducks fly up outraged, HERO surfaces with pond weed, one duck quacks a COMPLAINT in his face
//   s047 insert: the TV in the flat at night (DEV + MINA on the sofa), aerial news footage of the jumper, DAY 09 -> 10, meter 256 m
//   s048 insert: full-frame news, lower-third "THE BOY WHO WON'T STAY DOWN" lands on 'boy', school photo in the box
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, poly, glow, alpha, shade, mix, text, FONTS, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, headPos } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { apartment } from '../sets/apartment.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, splash, jumpShake } from '../sets/jump.js';
import { tv, newsLowerThird } from '../sets/devices.js';
import { wt, TEE, dayC, meter, duckBig } from './C_lib.js';

// a falling-figure state for jumper(): the fall phase of a big jump, with the screen height set directly
function fallJ(t, tL, y, gy) { const J = jumpPose(t, tL - 4.8, 2000, { up: 1, hang: 0.2, down: 3.6 }); return { ...J, lift: gy - y }; }

registerShot('s045', { draw(g, t, info) {
  const tDay = wt(info, 'Day', 0.15), tHun = wt(info, 'hundred', 1.04), tL = info.dur + 0.31;
  const cam = camMove(t, info.dur, { z: [0.9, 0.97], x: [-30, 20], y: [70, 90] });
  const R = roofs(g, t, cam, { view: 'pond', mood: 'day', ducks: 0 }), wy = R.pos.waterY, gy = wy + 150;
  const k = clamp(t / (info.dur + 0.31)), hx = E.W * 0.56, hs = lerp(0.5, 1.5, k * k), hy = lerp(40, gy - 120, k ** 1.6);
  layer(g, cam, 1, (g) => {
    // ducks notice one by one: a little "!" pops over each head, eyes up
    R.pos.ducks.forEach(([dx, dy], i) => { const ti = 0.8 + i * 0.36, p = ease.outBack(prog(t, ti, ti + 0.25)); if (p <= 0.01) return;
      g.save(); g.translate(dx + 30, dy - 90 - 10 * Math.sin((t - ti) * 6) * Math.exp(-(t - ti) * 3)); g.scale(p, p); text(g, '!', 0, 0, { size: 64, color: '#ffffff', font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#14301f' }); g.restore(); });
    // the falling hero: speck -> figure, shadow grows on the water
    const sh = clamp((k - 0.3) / 0.7); g.fillStyle = `rgba(10,30,50,${0.35 * sh})`; g.beginPath(); g.ellipse(hx, gy, 40 + 120 * sh, 8 + 20 * sh, 0, 0, 7); g.fill();
    const J = fallJ(t, tL, hy, gy);
    jumper(g, TEE, J, { x: hx, gy, s: hs, facing: -1, expr: exprAt(t, [[0, 'surprised'], [tDay + 0.3, 'scared']]), blink: blinkFlag(t, 3.3, 5), rim: R.rim, t, shadow: false, look: [0, 1] });
  });
  roofsFg(g, t, cam, { view: 'pond' });
  atmos(g, t, cam, { color: R.M.key });
  dayC(g, t, [[0, 8], [tDay, 9]]);
  meter(g, t, 128, { at: tHun });
} });

registerShot('s046', { draw(g, t, info) {
  const tL = wt(info, 'land', 0.31), tDucks = wt(info, 'ducks', 1.87), tC = wt(info, 'complaint', 2.73);
  const cam = camMove(t, info.dur, { z: [1.42, 1.5], x: [-80, -40], y: [190, 180] }); const [sx, sy] = jumpShake(t, tL, 16); cam.x += sx; cam.y += sy;
  const flap = ease.out(prog(t, tL + 0.08, tL + 0.45)) * (1 - 0.85 * ease.inOut(prog(t, 2.0, 2.8)));
  const hx = E.W * 0.47, R = roofs(g, t, cam, { view: 'pond', mood: 'day', splash: { x: hx, k: prog(t, tL, tL + 1.5) }, ducks: flap }), wy = R.pos.waterY, wl = wy + 150;
  // body height above the water: plunge (under), then surface at ~1.0 s with a bob
  const surf = ease.outBack(prog(t, tL + 0.55, tL + 1.05)), bob = Math.sin(t * 2.6) * 6 * surf, hyFoot = wl + 380 - 230 * surf + bob;
  const pose = idle(t < tL ? POSES.jump : poseAt(t, [[0, 'relaxed'], [tDucks, 'sheepish'], [tC + 0.1, 'handsUp']], 0.25), t, 4);
  const look = t < tDucks ? lookToward(-0.3, -0.6) : lookToward(1, -0.1);
  layer(g, cam, 1, (g) => {
    if (t < tL) { const J = fallJ(t, tL, lerp(-200, wl, ease.in(prog(t, -0.25, tL))), wl); jumper(g, TEE, J, { x: hx, gy: wl, s: 1.9, facing: 1, expr: 'scared', blink: false, rim: R.rim, t, shadow: false }); }
    else if (surf > 0.01) {
      g.save(); g.beginPath(); g.rect(-E.W, -E.H * 2, E.W * 3, wl + E.H * 2 - 4); g.clip();
      const o = { x: hx, y: hyFoot, s: 1.9, facing: 1, pose, expr: exprAt(t, [[0, 'shocked'], [tL + 1.1, 'surprised'], [tDucks, 'worried'], [tC, 'sheepish']]), blink: blinkFlag(t, 3.1, 4), look, rim: R.rim, t, shadow: false };
      actor(g, TEE, o);
      // pond weed draped over his head, dripping
      const [hX, hY, hr] = headPos({ ...o, outfit: TEE }); const dr = rng(8);
      for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.36, x0 = hX + Math.cos(a) * hr * 0.9, y0 = hY + Math.sin(a) * hr * 0.9, L = 30 + dr() * 50, sw = Math.sin(t * 3 + i) * 6;
        g.strokeStyle = i % 2 ? '#3a7a3a' : '#5a9a3a'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + (Math.cos(a) * 20) + sw, y0 + L * 0.4, x0 + Math.cos(a) * 26 + sw, y0 + L); g.stroke(); }
      g.fillStyle = '#4a8a3a'; g.beginPath(); g.ellipse(hX - 4, hY - hr * 0.92, hr * 0.8, hr * 0.26, -0.1, 0, 7); g.fill();
      for (let i = 0; i < 4; i++) { const u = ((t * 1.4 + i * 0.27) % 1), dx = hX - hr + i * hr * 0.66; circle(g, dx, hY + hr * 0.4 + u * 240, 5, alpha('#cfeaff', 0.8 * (1 - u))); }
      g.restore();
      // water in front of him: a soft band + rings at the waist
      g.fillStyle = alpha('#2a5878', 0.55); g.fillRect(hx - 160, wl - 4, 320, 40); for (let i = 0; i < 2; i++) { const u = (t * 0.7 + i * 0.5) % 1; g.strokeStyle = alpha('#e8f4ff', 0.55 * (1 - u)); g.lineWidth = 3; g.beginPath(); g.ellipse(hx + 6, wl, 90 + u * 120, 14 + u * 14, 0, 0, 7); g.stroke(); }
    }
    splash(g, t, tL, hx, wl, { s: 1.9, size: 1.7 });
    // feathers drifting down after the flap-up
    const fr = rng(31); for (let i = 0; i < 12; i++) { const t0 = tL + 0.3 + fr() * 0.6, u = t - t0; if (u < 0) continue; const fx = E.W * (0.15 + fr() * 0.7) + Math.sin(u * 3 + i) * 40, fy = wy - 420 + fr() * 200 + u * 120;
      if (fy > wl + 80) continue; g.save(); g.translate(fx, fy); g.rotate(Math.sin(u * 4 + i) * 0.8); g.fillStyle = alpha('#f4efe2', 0.9); g.beginPath(); g.ellipse(0, 0, 18, 6, 0, 0, 7); g.fill(); seg(g, [[-18, 0], [18, 0]], 1.5, '#b8b0a0'); g.restore(); }
    // the one duck that squares up: swims in from the right, quacks the COMPLAINT into his face
    const din = ease.out(prog(t, tDucks - 0.2, tDucks + 0.6)), dX = lerp(E.W * 1.15, hx + 300, din);
    if (din > 0) { const q = t > tC ? Math.abs(Math.sin((t - tC) * 9)) * Math.exp(-(t - tC) * 1.2) : t > tDucks + 0.4 ? 0.3 * Math.abs(Math.sin(t * 7)) : 0;
      duckBig(g, dX, wl - 30, 2.6, t, { facing: -1, quack: q, angry: true, water: true, flap: t > tC ? 0.4 * Math.exp(-(t - tC) * 2) : 0, paper: ease.outBack(prog(t, tC, tC + 0.3)) });
      if (t > tC) for (let i = 0; i < 3; i++) { const u = clamp((t - tC - i * 0.12) / 0.5); seg(g, [[dX - 170 - u * 40, wl - 160 + (i - 1) * 40], [dX - 200 - u * 70, wl - 170 + (i - 1) * 56]], 5, alpha('#ffffff', 0.9 * (1 - u))); } }
  });
  roofsFg(g, t, cam, { view: 'pond' });
  atmos(g, t, cam, { color: R.M.key });
  dayC(g, t, [[0, 9]]);
} });

// aerial news footage: the town from a helicopter, a tiny jumper arcing over the roofs (inside the TV, screen space)
function newsFootage(g, t, k = 0) {
  const c2 = { z: 0.5 + 0.02 * t, x: -200 + t * 30, y: -320 };
  const R = roofs(g, t, c2, { view: 'houses', mood: 'day', ladder: 0 });
  const u = (t * 0.32 + 0.15) % 1, ax = lerp(-E.W * 0.2, E.W * 1.2, u), ay = R.GY - 900 - Math.sin(u * Math.PI) * 1200;
  layer(g, c2, 1, (g) => { for (let i = 1; i < 10; i++) { const uu = u - i * 0.012; if (uu < 0) break; circle(g, lerp(-E.W * 0.2, E.W * 1.2, uu), R.GY - 900 - Math.sin(uu * Math.PI) * 1200 + 120, 18 - i, alpha('#fff6e0', 0.5 - i * 0.05)); }
    actor(g, TEE, { x: ax, y: ay + 240, s: 2.4, facing: 1, pose: POSES.jump, expr: 'joy', t, shadow: false, rim: R.rim }); });
  // camera reticle + REC
  g.strokeStyle = alpha('#ffffff', 0.7); g.lineWidth = 4; for (const [x, y, dx, dy] of [[80, 80, 1, 1], [E.W - 80, 80, -1, 1], [80, E.H - 80, 1, -1], [E.W - 80, E.H - 80, -1, -1]]) { g.beginPath(); g.moveTo(x, y + dy * 70); g.lineTo(x, y); g.lineTo(x + dx * 70, y); g.stroke(); }
  if (Math.floor(t * 1.5) % 2 === 0) circle(g, 130, 130, 14, '#ff3a3a'); text(g, 'AIR 1', 210, 131, { size: 34, color: '#ffffff', font: FONTS.ui, weight: 900 });
  return { ax, ay };
}

registerShot('s047', { draw(g, t, info) {
  const tDay = wt(info, 'Day', 0.15), tTwo = wt(info, 'Two', 0.77);
  const cam = camMove(t, info.dur, { z: [1.14, 1.24], x: [40, 20] });
  blurLayer(g, 6, (g) => apartment(g, t, cam, { power: 0.25 }), null, 1); veil(g, '#0a0812', 0.5);
  const tz = lerp(1.0, 1.1, ease.inOut(t / info.dur)), flick = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 5.3);
  const T = tv(g, t, { x: E.W * 0.52, y: E.H * 0.44, w: 1060 * tz, glow: '#9fc8ff' }, (g) => newsFootage(g, t + 3));
  glow(g, E.W * 0.52, E.H * 0.95, 760, '#9fc8ff', 0.2 * flick);
  // the sofa in front: DEV (orange beanie) and MINA (bun + red scarf) watching, TV light on their backs
  blurLayer(g, 4, (g) => {
    const sy = E.H * 0.93; rr(g, -40, sy - 40, E.W + 80, 260, 60); g.fillStyle = '#2a2030'; g.fill(); rr(g, -40, sy - 40, E.W + 80, 40, 20); g.fillStyle = '#3a2c40'; g.fill();
    const lean = ease.inOut(prog(t, tTwo, tTwo + 0.4)) * 18;
    // DEV
    const dx = E.W * 0.26 + lean, dy = sy - 120; g.fillStyle = '#3c4058'; g.beginPath(); g.ellipse(dx, sy + 30, 150, 120, 0, Math.PI, 0); g.fill(); circle(g, dx, dy, 78, '#1a1522'); g.fillStyle = '#f08a24'; g.beginPath(); g.arc(dx, dy - 10, 82, Math.PI, 0); g.fill(); rr(g, dx - 86, dy - 22, 172, 26, 10); g.fillStyle = shade('#f08a24', -0.2); g.fill();
    g.strokeStyle = alpha('#bfe0ff', 0.6 * flick); g.lineWidth = 6; g.beginPath(); g.arc(dx, dy, 80, -2.6, -0.6); g.stroke();
    // MINA (smaller, bouncing a little on the cushion)
    const mx = E.W * 0.74 - lean * 0.6, my = sy - 70 + Math.abs(Math.sin(t * 5)) * -6 * (t > tTwo ? 1 : 0); g.fillStyle = '#34293f'; g.beginPath(); g.ellipse(mx, sy + 40, 110, 90, 0, Math.PI, 0); g.fill(); seg(g, [[mx - 60, my + 56], [mx + 60, my + 56]], 22, '#d4262e');
    circle(g, mx, my, 58, '#1a1522'); circle(g, mx + 6, my - 62, 26, '#1a1522'); g.strokeStyle = alpha('#bfe0ff', 0.6 * flick); g.lineWidth = 5; g.beginPath(); g.arc(mx, my, 60, -2.6, -0.5); g.stroke();
  }, null, 1);
  atmos(g, t, cam, { color: '#c9d4ff', far: 16, near: 6 });
  dayC(g, t, [[0, 9], [tDay, 10]]);
  meter(g, t, 256, { at: tTwo });
} });

registerShot('s048', { draw(g, t, info) {
  const tBoy = wt(info, 'boy', 1.73), tNews = wt(info, 'news', 0.57), at = Math.max(0.2, tBoy - 1.0);
  const z = lerp(1.0, 1.05, ease.inOut(t / info.dur));
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  tv(g, t, { x: E.W / 2, y: E.H / 2, w: E.W + 40, glow: '#9fc8ff' }, (g) => {
    newsFootage(g, t + 6);
    // file-photo box (top-left): the school portrait, still in the old hoodie
    const pk = ease.outBack(prog(t, tNews, tNews + 0.4)); if (pk > 0.01) { g.save(); g.translate(300, 330); g.scale(pk, pk);
      rr(g, -190, -220, 380, 440, 16); g.fillStyle = '#f4f0e8'; g.fill(); g.save(); rr(g, -170, -200, 340, 340, 8); g.clip(); g.fillStyle = linGrad(g, 0, -200, 0, 140, ['#7aa0d8', '#3a5a9a']); g.fillRect(-170, -200, 340, 340);
      giantFace(g, 0, -40, 100, { who: 'HERO', f: faceAt(t, [[0, 'smirk']]), rimSide: 1, rimColor: '#dfe8ff', blink: 0, breath: 0 }); g.restore();
      text(g, 'FILE PHOTO', 0, 182, { size: 36, color: '#141018', font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); }
    newsLowerThird(g, t, { at, kicker: 'LOCAL NEWS', title: "THE BOY WHO WON'T STAY DOWN", channel: 'TOWN NEWS 4', ticker: 'DAY 10: 256 M  •  DUCKS FILE FORMAL COMPLAINT  •  POND CLOSED FOR REPAIRS  •  EXPERTS: "WE HAVE NO IDEA"  •  ' });
    // a quick flash on the word 'boy' as the title lands
    const fl = clamp(1 - Math.abs(t - tBoy) / 0.12); if (fl > 0) { g.fillStyle = alpha('#ffffff', 0.25 * fl); g.fillRect(0, 0, E.W, E.H); }
  });
  g.restore();
  glow(g, E.W * 0.5, E.H * 0.5, E.W * 0.7, '#9fc8ff', 0.06);
  FX.dust(g, t, { count: 14, color: '#c9d4ff', a: 0.12, seed: 48 });
} });
