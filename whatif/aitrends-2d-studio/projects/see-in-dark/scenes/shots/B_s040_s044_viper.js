// B_s040_s044_viper.js — batch B: the pit viper's heat pinhole, TRPA1, Nature 2010, the strike, the remote gag.
import { E, V, S, registerShot, layer, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake } from '/engine/core.js';
import { POSES, breathe, posesAt } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat, mouse, snake } from '../sets/actors.js';
import { forest, forestFg } from '../sets/forest.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { thermalView, heatActor, heatCat, heatMouse, heatSnake, heatBlob, heatRect } from '../sets/thermal.js';
import { chip } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { W, push, scr, hand, blinkAt, remote, journal, pinholeMask } from './B_lib.js';

// s040 — "It works like a pinhole camera for heat."  THERMAL snake's-eye POV through a pinhole
registerShot('s040', { draw(g, t, info) {
  const cam = push(t, info, { z: 1.05, x: -40, y: 10 }, { z: 1.16, x: 30, y: -6 });
  const tPin = W('pinhole', info, 0.84), sharp = ease.inOut(prog(t, tPin - 0.2, tPin + 0.9));   // the blob focuses as the word lands
  const GY = E.H * 0.8, mx = E.W / 2 + 60 + Math.sin(t * 2.4) * 40, my = GY - 30;
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true, torch: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatBlob(c, mx, my - 10, lerp(170, 60, sharp), lerp(120, 40, sharp), lerp(0.55, 0.3, sharp), 0.95);   // unfocused heat smear
      c.save(); c.globalAlpha = sharp; heatMouse(c, { x: mx, y: my, s: 3.2, facing: Math.sin(t * 2.4) > 0 ? 1 : -1, t, heat: 0.9 }); c.restore();
    }),
    halo: lerp(30, 14, sharp),
    hud: { label: 'PIT ORGAN', temp: sharp > 0.6 ? '33 C  MOUSE' : null, track: sharp > 0.4 ? scr(cam, mx, my - 30) : null },
  });
  const [px, py] = scr(cam, mx, my - 30), r = lerp(E.H * 0.7, E.H * 0.42, ease.out(prog(t, 0, 1.2)));
  pinholeMask(g, lerp(E.W / 2, px, 0.4), lerp(E.H * 0.48, py, 0.4), r, 0.96);
  FX.dust(g, t, { count: 18, color: '#ffb070', a: 0.18 });
  chip(g, t, { str: 'Pinhole camera for heat', at: tPin, x: E.W / 2, y: E.H * 0.88, dur: info.dur - 0.15 });
} });

// s041 — "Its nerves use a heat-sensitive protein called TRPA1."  BLUEPRINT: the TRPA1 gate opens under heat
registerShot('s041', { draw(g, t, info) {
  const ui = S().ui, sc = 1 + 0.035 * ease.inOut(t / info.dur);
  const tNerve = W('nerves', info, 0.28), tHeat = W('heat', info, 1.06), tTr = W('TRPA1', info, 2.5);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2 - 20 * t, -E.H / 2);
  BP.board(g, t, { title: 'PIT ORGAN, NERVE ENDING', fig: 'FIG 4 - HEAT-GATED CHANNEL' });
  const my = E.H * 0.6, mx0 = E.W * 0.26, mx1 = E.W * 0.86, gx = E.W * 0.58;
  // the nerve fibre grows in from the left and branches up to the membrane
  const kN = ease.out(prog(t, tNerve - 0.1, tNerve + 1.1));
  BP.draw(g, [[E.W * 0.06, E.H * 0.86], [E.W * 0.22, E.H * 0.8], [E.W * 0.38, E.H * 0.74], [gx - 40, my + 60]], kN, { w: 9, color: alpha(ui.blueprint, 0.8) });
  BP.draw(g, [[E.W * 0.38, E.H * 0.74], [E.W * 0.44, my + 30]], kN, { w: 5, color: alpha(ui.blueprint, 0.6) });
  // the membrane: two lines with the channel in the middle
  const kM = ease.out(prog(t, 0.1, 0.9)), open = ease.inOut(prog(t, tHeat + 0.3, tHeat + 1.0)), gap = lerp(6, 46, open);
  for (const dy of [-14, 14]) { BP.draw(g, [[mx0, my + dy], [gx - 70, my + dy]], kM, { w: 4 }); BP.draw(g, [[gx + 70, my + dy], [mx1, my + dy]], kM, { w: 4 }); }
  g.save(); g.globalAlpha *= kM; for (const d of [-1, 1]) { rr(g, gx + d * gap / 2 - (d < 0 ? 56 : 0), my - 46, 56, 92, 20); g.fillStyle = alpha(ui.bpBg, 0.95); g.fill(); g.strokeStyle = open > 0.5 ? ui.gold : ui.blueprint; g.lineWidth = 4; g.stroke(); } g.restore();
  // heat arrives as wavy orange arrows from above
  for (let i = 0; i < 4; i++) { const ph = ((t - tHeat) * 0.9 + i * 0.25) % 1; if (t < tHeat) break; const x = gx - 150 + i * 100, y0 = E.H * 0.2 + ph * (my - E.H * 0.26), a = Math.sin(ph * Math.PI);
    const pts = Array.from({ length: 12 }, (_, j) => [x + Math.sin(j * 1.1 + t * 6) * 10, y0 + j * 9]); seg(g, pts, 5, alpha('#ff8a40', 0.85 * a)); poly(g, [[x - 12, y0 + 104], [x + 12, y0 + 104], [x, y0 + 124]], alpha('#ff8a40', 0.85 * a)); }
  // ions stream through once it is open, and the nerve fires (a pulse runs down the fibre)
  if (open > 0.3) { for (let i = 0; i < 9; i++) { const ph = (t * 1.3 + i / 9) % 1; circle(g, gx + Math.sin(i * 2.1) * 10, lerp(my - 120, my + 120, ph), 6, alpha(ui.cream, 0.8 * open)); }
    const pp = ((t - tHeat - 0.8) * 0.8) % 1; if (pp > 0) { const px = lerp(gx - 40, E.W * 0.06, pp), py = lerp(my + 60, E.H * 0.86, pp); glow(g, px, py, 60, ui.gold, 0.7 * open); } }
  text(g, 'HEAT', gx - 210, E.H * 0.2, { size: 30, color: '#ff8a40', font: FONTS.ui, weight: 900, alpha: clamp((t - tHeat) * 3), spacing: 4 });
  BP.label(g, t, { at: [gx + 60, my - 40], to: [gx + 260, my - 230], str: 'TRPA1', start: tTr, size: 54 });
  BP.label(g, t, { at: [gx - 200, my + 80], to: [gx - 420, my + 200], str: 'NERVE', start: tNerve + 0.6 });
  g.restore();
  chip(g, t, { str: 'Heat opens the gate', at: tHeat + 0.6, x: E.W * 0.3, y: E.H * 0.2, tone: 'blue', dur: tTr - 0.1 });
} });

// s042 — "Scientists pinned that down in 2010."  DATA CARD: Nature 2010 journal page + stamp
registerShot('s042', { draw(g, t, info) {
  const ui = S().ui, t10 = W('2010', info, 1.52), tPin = W('pinned', info, 0.44);
  UI.blueprint(g); FX.dust(g, t, { count: 30, color: '#9fb6ff', a: 0.2 });
  const aIn = ease.out(prog(t, 0, 0.35)) * clamp((info.dur - t) / 0.3), sc = 0.94 + 0.06 * ease.outBack(prog(t, 0, 0.45)) + 0.02 * t / info.dur;
  g.save(); g.globalAlpha *= aIn; g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
  const cw = 1300, ch = 700, cx = (E.W - cw) / 2, cy = (E.H - ch) / 2;
  rr(g, cx, cy, cw, ch, 28); g.fillStyle = ui.card; g.fill(); g.strokeStyle = ui.cardLine; g.lineWidth = 2.5; g.stroke();
  text(g, 'TRPA1', cx + 70, cy + 100, { size: 72, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', glow: 18, glowColor: alpha(ui.gold, 0.5) });
  text(g, 'Nature 2010', cx + 72, cy + 168, { size: 40, color: ui.text, font: FONTS.ui, weight: 900, align: 'left', alpha: clamp((t - tPin) * 3) });
  text(g, 'THE SNAKE HEAT SENSOR', cx + 72, cy + 214, { size: 22, color: ui.sub, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
  // the journal page slides in from the right, then a stamp slams on "2010"
  const jp = ease.out(prog(t, 0.15, 0.85)); journal(g, lerp(cx + cw + 300, cx + cw - 330, jp), cy + ch / 2 + 20, 430, 560, { k: ease.out(prog(t, 0.4, 1.6)), rot: lerp(0.08, -0.04, jp) });
  const sk = prog(t, t10, t10 + 0.18), sx = cx + cw - 330, sy = cy + ch / 2 + 150;
  if (sk > 0) { const ss = lerp(2.4, 1, ease.out(sk)); const [kx, ky] = sk < 1 ? [0, 0] : shake(t * 20, Math.max(0, 6 - (t - t10 - 0.18) * 30)); g.save(); g.translate(sx + kx, sy + ky); g.rotate(-0.18); g.scale(ss, ss); g.globalAlpha *= clamp(sk * 3);
    ring(g, 0, 0, 92, 9, ui.accent); ring(g, 0, 0, 74, 3, ui.accent); text(g, '2010', 0, 4, { size: 58, color: ui.accent, font: FONTS.ui, weight: 900 }); g.restore(); }
  // a gold underline sweeps under the year
  g.restore();
} });

// s043 — "A snake finds a mouse in total darkness."  THERMAL medium: the strike
registerShot('s043', { draw(g, t, info) {
  const tMouse = W('mouse', info, 1.28), tDark = W('darkness', info, 2.14), tS = tDark - 0.45;
  const strike = key(t, [[tS - 0.05, 0], [tS + 0.12, 1, ease.out], [tS + 0.55, 0.65]]);
  const [kx, ky] = shake(t * 16, prog(t, tS, tS + 0.1) * (1 - prog(t, tS + 0.1, tS + 0.5)) * 10);
  const cam = push(t, info, { z: 1.12, x: -80, y: 0 }, { z: 1.22, x: 40, y: -10 }); cam.x += kx; cam.y += ky;
  const GY = E.H * 0.8, sx = E.W / 2 - 330;
  const dart = ease.inOut(prog(t, tMouse - 0.1, tMouse + 0.5)), caught = t > tS + 0.1, headX = sx + 1.8 * (strike * 90 + 30);
  const mx = caught ? headX + 20 : lerp(E.W / 2 + 300, sx + 250, dart) + Math.sin(t * 9) * 6;
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true, torch: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatSnake(c, { x: sx, y: GY - 4, s: 1.8, facing: 1, t, strike, len: 220, heat: 0.38 });
      heatMouse(c, { x: mx, y: GY - (caught ? 40 : 2), s: 2.8, facing: -1, t: caught ? 0 : t, heat: 0.92 });
      heatBlob(c, mx, GY - 20, 90, 50, 0.3, 0.9);
    }),
    hud: { label: 'THERMAL', temp: caught ? 'STRIKE' : '33 C  MOUSE', track: scr(cam, mx, GY - 26) },
  });
  if (t > tS && t < tS + 0.25) FX.speedLines(g, t, { cx: scr(cam, mx, GY)[0], cy: scr(cam, mx, GY)[1], count: 40, a: 0.35 });
  FX.rain(g, t, { count: 70, color: '#8a6aff', a: 0.12 });
} });

// s044 — "You? The mouse... and the remote."  the hero sees the remote glow, then grabs it, triumphant
registerShot('s044', { draw(g, t, info) {
  const tYou = W('You', info, 0.12), tMouse = W('mouse', info, 1.82), tRem = W('remote', info, 3.04), tAnd = W('and', info, 2.6);
  const thermal = t < tAnd + 0.05, cam = push(t, info, { z: 1.18, x: -120, y: 30 }, { z: 1.3, x: -60, y: 10 });
  const A0 = { GY: E.H * 0.8 }, GY = A0.GY, CX = E.W / 2, sofaX = CX - 150, tableX = CX - 120, tableTop = GY - 24;
  const lift = ease.outBack(prog(t, tRem - 0.35, tRem + 0.25));
  const heroPose = breathe(posesAt(t, [[0, POSES.sit], [tAnd + 0.1, POSES.reach], [tRem - 0.3, POSES.cheer]], 0.3), t, 0.8);
  const hero = { x: sofaX - 60, y: lerp(GY - 40, GY, ease.inOut(prog(t, tRem - 0.5, tRem - 0.1))), s: 1.45, facing: 1, pose: heroPose, t };
  const remX = lerp(tableX + 90, hand(hero)[0], lift), remY = lerp(tableTop - 4, hand(hero)[1], lift);
  const mx = CX + 520 + Math.sin(t * 3) * 30;
  if (thermal) {
    thermalView(g, t, {
      cold: (c) => apartment(c, t, cam, { power: 0 }),
      hot: (c) => layer(c, cam, 1, (c) => {
        heatActor(c, 'HERO', { ...hero, expr: 'thinking' });
        heatMouse(c, { x: mx, y: GY - 2, s: 2.4, facing: -1, t, heat: t > tMouse - 0.2 ? 0.9 : 0.6 });
        remote(c, remX, remY, 2.4, { fill: '#c8c8c8', flat: true, rot: -1.4 }); heatBlob(c, remX, remY - 20, 70, 40, 0.55, 0.9);   // still warm from his hand
        heatCat(c, { x: sofaX - 330, y: GY - 120, s: 1.2, facing: 1, pose: 'loaf', t, heat: 0.72 });
      }),
      hud: { label: 'THERMAL', temp: t > tMouse - 0.1 ? '33 C  MOUSE' : '31 C  REMOTE', track: t > tMouse - 0.1 ? scr(cam, mx, GY - 20) : scr(cam, remX, remY - 20) },
    });
  } else {
    const A = apartment(g, t, cam, { power: 0 });
    layer(g, cam, 1, (g) => {
      cat(g, { x: sofaX - 330, y: GY - 120, s: 1.2, facing: 1, pose: 'loaf', t, eyes: t > tRem + 0.3 ? 'offended' : 'glint', rim: A.rim });
      actor(g, 'HERO', { ...hero, expr: t > tRem - 0.1 ? 'happy' : 'smirk', rim: A.rim, blink: blinkAt(t, 1) });
      remote(g, remX, remY, 2.4, { rot: lerp(-1.4, -0.3, lift) }); glow(g, remX, remY - 20, 90, '#ffb070', 0.25 * lift);
    });
    apartmentFg(g, t, cam);
    if (t > tRem) FX.sparkle(g, scr(cam, remX, remY - 50)[0], scr(cam, remX, remY - 50)[1], 34 * ease.outBack(prog(t, tRem, tRem + 0.3)), '#ffe6a8', 0.9);
  }
  FX.dust(g, t, { count: 22, color: thermal ? '#ffb070' : '#c9d4ff', a: 0.2 });
} });
