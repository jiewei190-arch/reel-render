import { createSP, cfg, W, H, TAU, clamp, lerp, ramp, win, hash, mixc, DYE, dye, hidePiece, at, rod, inkText, plaque, tag, sun, moon, earth, hill, circ, ring, ell, poly, star, trem, placard, puppet, cutPlaque, stage, rivet, FONT } from './styles/shadowpuppet/shadowpuppet.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"')]);
cfg.hide = true;
const canvas = document.getElementById('c'), R = createSP(canvas), g = R.g;
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end;
const r = (i, d) => T(i) + d, ease = x => 1 - Math.pow(1 - clamp(x), 3);
const cam = (s, cx, cy) => R.cam(s, cx, cy);
const GOLD = 'rgba(255,205,110,1)';
function coverage(mx, sx, Rr) { return ramp(Rr * 2.1 - Math.abs(mx - sx), 0, Rr * 2.0); }
const fade = (t, a, b, f = .45) => win(t, a, b, f);
const label = (t, ti, fn) => { const k = ramp(t, ti, ti + .45); if (k > 0) { g.save(); g.globalAlpha *= k; fn(k); g.restore(); } };

// ---------- p0-p1 hook: audience seat, dark moon slides over the lamp-sun ----------
function sceneHook(t) {
  const a = 1 - ramp(t, E(1) + .1, E(1) + .6); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const sx = 540, sy = 760, Rr = 200; cam(1, 540, 760);
  const mx = t < r(1, 0) ? lerp(1250, 540, ease(ramp(t, T(0) + .1, T(0) + 2.2))) : lerp(540, -330, ramp(t, r(1, .1), r(1, 2.4)));
  const cov = coverage(mx, sx, Rr);
  R.glow(sx, sy, Rr * 2.4, GOLD, (.22 + .55 * cov) * a);
  sun(g, sx, sy, Rr, t, { rot: .2 }); rod(g, sx, sy + Rr, .8);
  const my = sy + 8 * Math.sin(t * 2.1); rod(g, mx, my + Rr * 1.06, .85); moon(g, mx, my, Rr * 1.07, t, { dark: 1 });
  R.dim = Math.max(R.dim, cov * .93 * a);
  cutPlaque(g, 540, 1290, 900, 250, ['HOW AN ECLIPSE', 'REALLY WORKS'], 74, ramp(t, r(1, 1.2), r(1, 1.9)) * (1 - ramp(t, E(1) - .2, E(1) + .45)));
  g.restore();
}
// ---------- p2-p4 lineup + shadow cone ----------
function sceneLineup(t) {
  const a0 = T(2) - .3, a1 = E(4) + .35, a = win(t, a0, a1, .5); if (a <= 0) return; g.save();
  const pan = ramp(t, r(3, 0), r(4, 3)), z = ramp(t, E(4) - .5, E(4) + .15); let s = 1 + .1 * pan, cx = 540 + 90 * pan, cy = 820;
  s = lerp(s, 9, z * z); cx = lerp(cx, 760, z); g.globalAlpha = a * (1 - ramp(t, E(4) - .3, E(4) + .2)); cam(s, cx, cy);
  const sx = 190, mx = 610, ex = 880, Y = 820, rm = 52;
  const gp = ramp(t, r(3, 1.0), r(3, 3.2)), ge = lerp(mx, 900, gp);
  if (gp > 0) {
    const k = .576; dye(g, p => poly(p, [[mx, Y - rm], [ge, Y - rm - (ge - mx) * k], [ge, Y + rm + (ge - mx) * k], [mx, Y + rm]]), ['#7d5f7e'], { a: .5, edge: false });
    const gu = ramp(t, r(4, .5), r(4, 2.0)); if (gu > 0) dye(g, p => poly(p, [[mx, Y - rm], [mx + 159 * gu, Y - rm * (1 - gu)], [mx + 159 * gu, Y + rm * (1 - gu)], [mx, Y + rm]]), ['#1c0f2c'], { a: .92, edge: false });
  }
  sun(g, sx, Y, 190, t, { rot: .1 }); rod(g, sx, Y + 190); moon(g, mx, Y, rm, t); rod(g, mx, Y + rm); earth(g, ex, Y, 120, t); rod(g, ex, Y + 120);
  R.glow(sx, Y, 420, GOLD, .28 * g.globalAlpha);
  [['SUN', sx, 0.7], ['MOON', mx, 1.2], ['EARTH', ex, 1.7]].forEach(([s2, x, d]) => { const k = ramp(t, r(2, d), r(2, d + .4)); if (k > 0) { g.save(); g.globalAlpha *= k; inkText(g, s2, x, 500 - (1 - k) * 14, 54, '#3a1608', { ls: 6 }); g.restore(); } });
  label(t, r(4, 1.3), () => { dye(g, p => poly(p, [[689, 1130], [691, 1130], [691, 868], [689, 868]]), ['#3a1608'], { edge: false }); tag(g, 'UMBRA', 690, 1180, 44); });
  label(t, r(4, 3.4), () => { dye(g, p => poly(p, [[799, 1262], [801, 1262], [801, 985], [799, 985]]), ['#3a1608'], { edge: false }); tag(g, 'PENUMBRA', 800, 1310, 44); inkText(g, 'only partly covered', 800, 1400, 38, '#5a2a1a', { ls: 2 }); });
  g.restore();
}
// ---------- p5 totality: jointed watcher under the covered sun, crash zoom ----------
function sceneTotality(t) {
  const a = win(t, T(5) - .2, E(5) + .75, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const hit = r(5, 1.75), cz = (t > hit && t < hit + .17) ? 1 + .14 * Math.sin((t - hit) / .17 * Math.PI) : 1;
  cam((1 + .05 * ramp(t, T(5), E(5))) * cz, 540, 700);
  const sx = 540, sy = 600, Rr = 175, mx = lerp(1010, 540, ease(ramp(t, T(5) + .1, r(5, 1.75)))), cov = coverage(mx, sx, Rr);
  R.glow(sx, sy, Rr * 2.4, GOLD, (.2 + .6 * cov) * a);
  sun(g, sx, sy, Rr, t, { rot: .5 }); rod(g, sx, sy + Rr); rod(g, mx, sy + Rr * 1.05); moon(g, mx, sy, Rr * 1.07, t, { dark: 1 });
  hill(g, 1500);
  const pk = ramp(t, r(5, 1.9), r(5, 2.6)), ha = lerp(0, -1.0, pk);
  puppet(g, 540, 1560, 3.0, t, { hand: [lerp(26, 46, pk), lerp(-60, -240, pk)], hand2: [-22, -58], head: -.28 * pk });
  R.dim = Math.max(R.dim, cov * .6 * a);
  cutPlaque(g, 540, 330, 700, 150, ['TOTALITY'], 92, ramp(t, r(5, 2.9), r(5, 3.5)) * (1 - ramp(t, E(5) - .1, E(5) + .3)));
  g.restore();
}
// ---------- p6 narrow path + hourglass ----------
function sceneEarthPath(t) {
  const a = win(t, T(6) - .8, E(6) + .3, .6); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(lerp(1.5, 1.0, ease(ramp(t, T(6) - .8, r(6, 3)))), 540, 860);
  const ex = 540, ey = 760, er = 300; earth(g, ex, ey, er, t); rod(g, ex, ey + er);
  const sw = ramp(t, r(6, .5), r(6, 5.6)), x0 = 300, y0 = 560, x1 = 790, y1 = 960, px = lerp(x0, x1, sw), py = lerp(y0, y1, sw);
  dye(g, p => circ(p, px, py, 210), ['#7d5f7e'], { a: .3, edge: false });
  for (let i = 0; i < 22; i++) { const u = i / 21; if (u > sw) break; dye(g, p => circ(p, lerp(x0, x1, u), lerp(y0, y1, u), 11), ['#2a1038'], { a: .9, edge: false }); }
  dye(g, p => circ(p, px, py, 17), ['#12081c'], { edge: false });
  label(t, r(6, 2.3), () => tag(g, 'under 50 miles wide', 530, 1215, 44));
  const hk = ramp(t, r(6, 4.4), r(6, 5.0)); if (hk > 0) {
    g.save(); g.globalAlpha *= hk; const hx = 400, hy = 1360, sd = ramp(t, r(6, 4.7), r(6, 6.4));
    dye(g, p => poly(p, [[hx - 70, hy - 110], [hx + 70, hy - 110], [hx + 6, hy], [hx + 70, hy + 110], [hx - 70, hy + 110], [hx - 6, hy]]), ['#cde8e0', '#9fd0c8'], { a: .7, r: 100 });
    dye(g, p => poly(p, [[hx - 56 * (1 - sd), hy - 100 + 90 * sd], [hx + 56 * (1 - sd), hy - 100 + 90 * sd], [hx, hy - 6]]), DYE.sun, { edge: false });
    dye(g, p => poly(p, [[hx - 60 * sd, hy + 100], [hx + 60 * sd, hy + 100], [hx, hy + 100 - 80 * sd]]), DYE.sun, { edge: false });
    dye(g, p => { poly(p, [[hx - 84, hy - 126], [hx + 84, hy - 126], [hx + 84, hy - 108], [hx - 84, hy - 108]]); poly(p, [[hx - 84, hy + 108], [hx + 84, hy + 108], [hx + 84, hy + 126], [hx - 84, hy + 126]]); }, DYE.red, { r: 90 });
    inkText(g, 'a few minutes', hx + 130, hy, 48, '#3a1608', { ls: 2, align: 'left' }); g.restore();
  }
  g.restore();
}
// ---------- p7 sizes ----------
function sceneSizes(t) {
  const a1 = win(t, T(7) - .2, r(7, 3.6), .45), a2 = win(t, r(7, 3.3), E(7) + .3, .45);
  if (a1 > 0) {
    g.save(); g.globalAlpha = a1; cam(1, 540 + 40 * ramp(t, T(7), r(7, 3.4)), 700);
    sun(g, 480, 640, 240, t, { rot: .3 }); rod(g, 480, 880); R.glow(480, 640, 520, GOLD, .25 * a1); moon(g, 900, 560, 11, t, { dark: 1 }); rod(g, 900, 571);
    label(t, r(7, 1.1), () => { dye(g, p => poly(p, [[898, 600], [902, 600], [902, 740], [898, 740]]), ['#3a1608'], { edge: false }); tag(g, 'Moon', 900, 790, 40); inkText(g, '(not to scale)', 900, 860, 32, '#6a3a20', { ls: 1 }); });
    label(t, r(7, 1.9), () => plaque(g, 480, 1190, 640, 150, ['400 × wider'], 76)); g.restore();
  }
  if (a2 > 0) {
    g.save(); g.globalAlpha = a2; cam(1, 540, 700); earth(g, 170, 740, 80, t); rod(g, 170, 820); moon(g, 330, 740, 18, t); rod(g, 330, 758);
    sun(g, 1010, 740, 130, t, { rot: .1 }); rod(g, 1010, 870);
    const k = ramp(t, r(7, 4.2), r(7, 5.4)); for (let i = 0; i < 18; i++) { const u = i / 18; if (u > k) break; dye(g, p => poly(p, [[360 + u * 600, 736], [360 + u * 600 + 22, 736], [360 + u * 600 + 22, 744], [360 + u * 600, 744]]), ['#5a2a1a'], { edge: false }); }
    label(t, r(7, 4.9), () => plaque(g, 540, 1090, 700, 150, ['400 × farther'], 76)); g.restore();
  }
}
// ---------- p8 corona (reuse v1 look) ----------
function sceneCorona(t) {
  const a = win(t, T(8) - .2, E(8) + .35, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const z = 1 + .2 * ramp(t, r(8, 1.6), E(8)), sx = 540, sy = 700, Rr = 170; cam(z, 540, 760); const sky = ramp(t, T(8), r(8, 1.2));
  R.glow(sx, sy, Rr * 3.4, 'rgba(255,214,150,1)', .55 * sky * a);
  sun(g, sx, sy, Rr, t, { rot: 1.1 }); moon(g, sx, sy, Rr * 1.07, t, { dark: 1 });
  const crown = new Path2D(); star(crown, Rr * 1.25, Rr * 2.1, 40, 0.1, sx, sy, .55);
  g.save(); g.globalAlpha = a * sky;
  dye(g, p => { p.rect(-3000, -3000, 7000, 8000); p.addPath(crown);
    for (let i = 0; i < 30; i++) { const x = -150 + hash(i * 3.1) * 1380, y = -100 + hash(i * 5.7) * 1350; if (Math.hypot(x - sx, y - sy) < 400) continue; const sz = 7 + hash(i * 9.3) * 12 * ramp(t, r(8, 1 + i * .09), r(8, 1.6 + i * .09)); if (sz > 7.3) star(p, sz * .28, sz, 4, 0, x, y); }
    p.roundRect(130 - 36, 650, 72, 460, 30); }, ['#1d1236', '#0a0618'], { edge: false, r: 800, hide: false });
  g.restore();
  dye(g, p => { p.addPath(crown); for (let i = 0; i < 40; i++) { const an = i * TAU / 40, rr = Rr * (1.45 + .35 * hash(i)); circ(p, sx + Math.cos(an) * rr, sy + Math.sin(an) * rr, 4); } }, ['#fff0c4', '#ffd98a'], { edge: false, a: .55 * sky, r: 400, hide: false });
  const th = clamp((t - r(8, 1)) / 2.6), mer = lerp(.92, .22, ramp(th, 0, 1)); g.save(); g.globalAlpha = a * sky;
  dye(g, p => p.roundRect(130 - 22, 670, 44, 420, 22), ['#d6ece6'], { a: .55, r: 200 });
  dye(g, p => { p.roundRect(130 - 11, 690 + 380 * (1 - mer), 22, 380 * mer + 8, 10); circ(p, 130, 1140, 36); }, DYE.red, { r: 200, edge: '#7a1c1c' }); g.restore();
  g.save(); g.globalAlpha = a; cutPlaque(g, 540, 1215, 640, 140, ['THE CORONA'], 70, ramp(t, r(8, 3.0), r(8, 3.6))); g.restore();
  g.restore();
}
// ---------- p9 flip: Earth in the middle, its shadow on the Moon ----------
function sceneFlip(t) {
  const a = win(t, T(9) - .3, E(9) + .3, .5); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const f = ease(ramp(t, T(9) + .1, r(9, 1.3))), Y = 820;
  const sx = 150, ex = lerp(880, 540, f), mx = lerp(610, 920, f);
  const sh = ramp(t, r(9, 3.0), r(9, 4.3)), ge = lerp(ex, mx + 40, sh);
  if (sh > 0) { dye(g, p => poly(p, [[ex, Y - 110], [ge, Y - 62], [ge, Y + 62], [ex, Y + 110]]), ['#1c0f2c'], { a: .9, edge: false }); }
  sun(g, sx, Y, 130, t, { rot: .1 }); rod(g, sx, Y + 130); R.glow(sx, Y, 360, GOLD, .26 * a);
  earth(g, ex, Y, 110, t); rod(g, ex, Y + 110);
  moon(g, mx, Y, 58, t, { dark: sh * .75 }); rod(g, mx, Y + 58);
  label(t, r(9, 4.3), () => cutPlaque(g, 540, 1250, 760, 150, ['LUNAR ECLIPSE'], 78, 1));
  inkText(g, 'SUN', sx, 560, 48, '#3a1608', { ls: 6, a: ramp(t, T(9), T(9) + .4) }); inkText(g, 'EARTH', ex, 580, 48, '#3a1608', { ls: 6, a: ramp(t, r(9, 1.4), r(9, 1.9)) });
  g.restore();
}
// ---------- p10 blue scattered away, red gets through ----------
function sceneRed(t) {
  const a = win(t, T(10) - .3, E(10) + .3, .5); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const Y = 800, ex = 330, mx = 830, red = ramp(t, r(10, 2.4), r(10, 3.6));
  R.glow(60, Y, 420, GOLD, .22 * a);
  earth(g, ex, Y, 150, t); rod(g, ex, Y + 150);
  dye(g, p => { circ(p, ex, Y, 172); circ(p, ex, Y, 150); }, ['#9fe6ff', '#6fb8e8'], { edge: false, a: .55, hide: false });
  // blue dashes scatter off in all directions
  for (let i = 0; i < 12; i++) { const u = ramp(t, r(10, .5 + i * .06), r(10, 1.8 + i * .06)), an = -Math.PI * .5 + (i / 11) * Math.PI + (i % 2 ? .12 : -.12), d = 180 + u * 150;
    if (u <= 0 || u >= 1) continue; at(g, ex + Math.cos(an) * d, Y + Math.sin(an) * d, an, 1, () => dye(g, p => poly(p, [[-14, -3], [14, -3], [14, 3], [-14, 3]]), ['#3d8cf0'], { edge: false, a: 1 - u * .8, hide: false })); }
  // red arcs bend round the limb to the Moon
  const dr = ramp(t, r(10, 1.4), r(10, 3.0));
  [[-1, 1], [1, 1]].forEach(([s2]) => { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; if (u > dr) break; const an = lerp(-Math.PI * .9, -Math.PI * .1, u) * s2 * -1 + (s2 < 0 ? Math.PI : 0); }
  });
  for (let i = 0; i <= 30; i++) { const u = i / 30; if (u > dr) break; const x = lerp(ex + 60, mx - 70, u), curve = Math.sin(u * Math.PI); [-1, 1].forEach(sd => dye(g, p => circ(p, x, Y + sd * (172 + 18 * curve) * (1 - u * .78), 6), ['#e8452c'], { edge: false, hide: false })); }
  moon(g, mx, Y, 85, t); dye(g, p => circ(p, mx, Y, 85), ['#e8452c', '#b02a14'], { a: .75 * red, r: 85, edge: false });
  label(t, r(10, 1.0), () => tag(g, 'blue scattered away', ex, 1130, 40)); label(t, r(10, 3.0), () => tag(g, 'dim red glow', mx, 1000, 42));
  g.restore();
}
// ---------- p11 every month? ----------
function sceneMonthly(t) {
  const a = win(t, T(11) - .2, E(11) + .3, .35); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 900);
  cutPlaque(g, 540, 360, 860, 150, ['EVERY MONTH?'], 84, ramp(t, T(11) + .1, T(11) + .6));
  const M = 'JFMAMJJASOND';
  for (let i = 0; i < 12; i++) { const c = i % 4, rr = (i / 4) | 0, x = 205 + c * 223, y = 700 + rr * 250, kk = ramp(t, T(11) + .4 + i * .06, T(11) + .75 + i * .06); if (kk <= 0) continue;
    g.save(); g.globalAlpha *= kk; at(g, x, y, 0, .8 + .2 * kk, () => { dye(g, p => { p.roundRect(-85, -90, 170, 180, 18); p.roundRect(-76, -81, 152, 162, 12); p.roundRect(-71, -76, 142, 152, 9); }, DYE.card, { r: 100, edge: '#7a3a14' });
      dye(g, p => circ(p, 0, -10, 48), ['#22123a', '#100820'], { r: 50, edge: '#07030c' }); inkText(g, M[i], 0, 56, 36, '#3a1608', { ls: 0 }); }); g.restore(); }
  g.restore();
}
// ---------- p12 tilt ----------
function sceneTilt(t) {
  const a = win(t, T(12) - .2, E(12) + .3, .5); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 820);
  const ex = 590, Y = 820, tilt = .26;
  sun(g, -20, Y, 230, t, { rot: .1 }); R.glow(-20, Y, 520, GOLD, .28 * a);
  for (let i = 0; i < 16; i++) dye(g, p => poly(p, [[300 + i * 48, Y - 3], [300 + i * 48 + 26, Y - 3], [300 + i * 48 + 26, Y + 3], [300 + i * 48, Y + 3]]), ['#6a2050'], { edge: false, a: .9 });
  g.save(); g.translate(ex, Y); g.rotate(-tilt); dye(g, p => { ell(p, 0, 0, 330, 80, 0); ell(p, 0, 0, 324, 74, 0); }, ['#4a5f9a'], { edge: false, a: .95 }); g.restore();
  earth(g, ex, Y, 62, t); rod(g, ex, Y + 62);
  const th = lerp(.5, Math.PI, ease(ramp(t, r(12, .4), r(12, 3.4))));
  const mp = ang => { const lx = Math.cos(ang) * 327, ly = Math.sin(ang) * 77, c = Math.cos(-tilt), s = Math.sin(-tilt); return [ex + lx * c - ly * s, Y + lx * s + ly * c]; };
  const [mx, my] = mp(th); moon(g, mx, my, 34, t); rod(g, mx, my + 34);
  label(t, r(12, .5), () => tag(g, 'orbit tilted about 5°', 650, 500, 42));
  label(t, r(12, 3.7), () => tag(g, 'passes below', 330, 1010, 42)); label(t, r(12, 4.6), () => tag(g, 'or above', 330, 600, 42));
  label(t, r(12, 1.0), () => inkText(g, 'Earth–Sun line', 790, Y + 40, 36, '#6a2050', { ls: 1 }));
  g.restore();
}
// ---------- p13 seasons ----------
function sceneSeasons(t) {
  const a = win(t, T(13) - .2, E(13) + .3, .5); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const sx = 540, sy = 800, rr = 330; sun(g, sx, sy, 90, t, { rot: 0 }); R.glow(sx, sy, 300, GOLD, .3 * a);
  dye(g, p => { circ(p, sx, sy, rr + 3); circ(p, sx, sy, rr - 3); }, ['#4a5f9a'], { edge: false });
  const ph = lerp(-.3, 3.6, ease(ramp(t, T(13) + .3, E(13)))), ea = ang => [sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr];
  [0, Math.PI].forEach((an, i) => { const kk = ramp(t, r(13, .6 + i * .9), r(13, 1.2 + i * .9)); if (kk <= 0) return; const [x, y] = ea(an), near = ramp(.55 - Math.abs(Math.atan2(Math.sin(ph - an), Math.cos(ph - an))), 0, .5);
    g.save(); g.globalAlpha *= kk; dye(g, p => { p.moveTo(sx + Math.cos(an - .28) * (rr + 20), sy + Math.sin(an - .28) * (rr + 20)); p.arc(sx, sy, rr + 20, an - .28, an + .28); p.arc(sx, sy, rr - 20, an + .28, an - .28, true); p.closePath(); }, DYE.sun, { edge: '#8a3a12' });
    R.glow(x, y, 160, 'rgba(255,214,130,1)', (.2 + .5 * near) * kk * a); tag(g, 'eclipse season', x, 1130, 40); g.restore(); });
  const [ex, ey] = ea(ph); earth(g, ex, ey, 46, t); moon(g, ex + 62, ey - 30, 14, t);
  label(t, r(13, 2.2), () => plaque(g, 540, 1330, 700, 130, ['about twice a year'], 62));
  g.restore();
}
function glasses(x, y, s, o = {}) {
  at(g, x, y, o.rot || 0, s, () => {
    dye(g, p => { p.roundRect(-190, -62, 150, 124, 26); p.roundRect(40, -62, 150, 124, 26); poly(p, [[-40, -20], [40, -20], [40, 6], [-40, 6]]); poly(p, [[-190, -34], [-228, -50], [-228, -30], [-190, -14]]); poly(p, [[190, -34], [228, -50], [228, -30], [190, -14]]);
      p.roundRect(-172, -44, 114, 88, 16); p.roundRect(58, -44, 114, 88, 16); }, o.frame || ['#e9b075', '#c98a4a'], { r: 200, edge: '#6a3a14' });
    dye(g, p => { p.roundRect(-172, -44, 114, 88, 16); p.roundRect(58, -44, 114, 88, 16); }, o.lens || ['#241338', '#0c0618'], { r: 100, edge: false, a: o.la ?? 1 });
  });
}

// ---------- p14 safety ----------
function sceneGlasses(t) {
  const a = win(t, T(14) - .2, E(14) + .3, .5); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  cutPlaque(g, 540, 330, 900, 150, ['SAFETY FIRST'], 80, ramp(t, T(14) + .1, T(14) + .7));
  const solar = 1 - ramp(t, r(14, 5.2), r(14, 5.8));
  g.save(); g.globalAlpha *= solar;
  const k1 = ramp(t, r(14, 1.6), r(14, 2.2)); g.save(); g.globalAlpha *= k1; glasses(320, 820 + (1 - k1) * 20, 1.15, {}); rod(g, 320, 900); tag(g, 'eclipse glasses', 320, 1030, 40); g.restore();
  const k2 = ramp(t, r(14, 4.0), r(14, 4.6)); g.save(); g.globalAlpha *= k2; glasses(790, 820, 1.05, { lens: ['#7a6a82', '#4a3c58'], frame: ['#c0c8d8', '#8a96b0'], la: .8 }); rod(g, 790, 890);
  const xk = ramp(t, r(14, 4.5), r(14, 5.0)); g.save(); g.globalAlpha *= xk; dye(g, p => { poly(p, [[690, 740], [718, 730], [890, 910], [862, 920]]); poly(p, [[862, 730], [890, 740], [718, 920], [690, 910]]); }, DYE.red, { r: 150, edge: '#7a1c1c' }); g.restore();
  tag(g, 'not sunglasses', 790, 1030, 40); g.restore(); g.restore();
  const lk = ramp(t, r(14, 5.6), r(14, 6.3)); if (lk > 0) { g.save(); g.globalAlpha *= lk; moon(g, 540, 800, 150, t); dye(g, p => circ(p, 540, 800, 150), ['#e8452c', '#b02a14'], { a: .5, r: 150, edge: false }); rod(g, 540, 950);
    tag(g, 'lunar eclipse: no special glasses', 540, 1060, 42); g.restore(); }
  g.restore();
}
// ---------- p15-16 echo + end card ----------
function sceneEnd(t) {
  const a = win(t, T(15) - .3, TL.total + 1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const sx = 540, sy = 700, Rr = 200; cam(1, 540, 700);
  const mx = t < r(15, 2.0) ? lerp(-300, 540, ease(ramp(t, T(15) + .2, r(15, 1.8)))) : lerp(540, 1400, ramp(t, r(15, 2.2), r(15, 4.0))), cov = coverage(mx, sx, Rr);
  const sy2 = lerp(700, 560, ramp(t, T(16) - .5, T(16) + .3));
  R.glow(sx, sy2, Rr * 2.4, GOLD, (.22 + .55 * cov) * a);
  sun(g, sx, sy2, Rr, t, { rot: .2 }); rod(g, sx, sy2 + Rr); const my = sy2 + 8 * Math.sin(t * 2.1); rod(g, mx, my + Rr * 1.06, .85); moon(g, mx, my, Rr * 1.07, t, { dark: 1 });
  R.dim = Math.max(R.dim, cov * .93 * a);
  cutPlaque(g, 540, 1180, 900, 270, ['Follow for more of', 'how it really works.'], 68, ramp(t, T(16) + .1, T(16) + .8), { ls: 3 });
  g.restore();
}
const kStage = t => Math.max(1 - ramp(t, r(1, 1.5), r(2, .2)), ramp(t, r(15, 2.6), r(15, 4.0)) * .0);
function scene(t) { R.dim = 0; R.hot = [540, 860]; sceneHook(t); sceneLineup(t); sceneTotality(t); sceneEarthPath(t); sceneSizes(t); sceneCorona(t); sceneFlip(t); sceneRed(t); sceneMonthly(t); sceneTilt(t); sceneSeasons(t); sceneGlasses(t); sceneEnd(t); }
function subtitle(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], hold = Math.max(1.8, (p.end - p.start) + .6), a = ramp(t, p.start - .05, p.start + .2) * (1 - ramp(t, p.start + hold - .15, p.start + hold));
  placard(R.main, p.cap, a);
}
// cues for the mix
const C = [['whoosh', T(0) + .1], ['thud', r(0, 2.0)]];
for (let i = 2; i < PH.length; i++) C.push(['whoosh', T(i) - .1]);
C.push(['pop', r(1, 1.3)], ['sparkle', r(1, 1.5)], ['pop', r(2, .8)], ['pop', r(2, 1.3)], ['pop', r(2, 1.8)], ['pop', r(4, 1.4)], ['pop', r(4, 3.5)], ['silence', r(5, 1.2), r(5, 3.2)], ['thud', r(5, 1.8)], ['chime', r(5, 3.0), 84], ['pop', r(6, 2.4)], ['pop', r(6, 4.5)], ['pop', r(7, 1.2)], ['pop', r(7, 2.0)], ['pop', r(7, 5.0)], ['sparkle', r(8, 1.4)], ['sparkle', r(8, 2.0)], ['chime', r(8, 3.0), 88], ['thud', r(9, 3.0)], ['chime', r(9, 4.4), 79], ['pop', r(10, 1.0)], ['pop', r(10, 3.0)], ['pop', r(11, .2)], ['pop', r(12, .5)], ['pop', r(12, 3.7)], ['pop', r(12, 4.6)], ['pop', r(13, .7)], ['pop', r(13, 1.6)], ['pop', r(13, 2.2)], ['chime', r(14, .2), 72], ['pop', r(14, 1.7)], ['pop', r(14, 4.1)], ['pop', r(14, 5.8)], ['chime', T(16) + .1, 86]);
window.CUES = C; window.DUR = TL.total;
window.seek = t => { R.begin(t); scene(t); R.finish(); stage(R.main, kStage(t), t); subtitle(t); };
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
