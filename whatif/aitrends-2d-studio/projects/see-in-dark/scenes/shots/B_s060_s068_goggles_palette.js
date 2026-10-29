// B_s060_s068_goggles_palette.js — batch B: night-vision goggles vs thermal, the gecko, the three-colour palette, hide and seek, the menu.
import { E, V, S, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, rng, mix } from '/engine/core.js';
import { POSES, breathe, posesAt, bigFace, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { lab, labFg, labGround } from '../sets/lab.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { cinema, cinemaFg, cinemaGround } from '../sets/cinema.js';
import { thermalView, heatActor, heatCat, heatBlob, heatRect, heat, heatColor } from '../sets/thermal.js';
import { chip } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { HERO } from '../cast.js';
import { W, push, scr, hand, blinkAt, goggles, gecko } from './B_lib.js';

const CX = E.W / 2;

// s060 — "Night-vision goggles work differently."  macro: goggles on the lab bench, green lenses, dust in the beam
registerShot('s060', { draw(g, t, info) {
  const tG = W('goggles', info, 1.22), GY = labGround(), cam = push(t, info, { z: 2.3, x: 720, y: 20 }, { z: 2.55, x: 760, y: 10 });
  const L = lab(g, t, cam, { lights: 0 });
  layer(g, cam, 1, (g) => {
    const bx = L.pos.benchX - 120, by = L.pos.benchTop;
    FX.lightCone(g, bx - 420, by - 420, { angle: 0.75, spread: 0.32, len: 700, color: '#cfe0ff', a: 0.12 });
    goggles(g, bx, by, 1.1, t, { lens: 0.4 + 0.6 * ease.out(prog(t, tG - 0.3, tG + 0.3)) });
    FX.dust(g, t, { count: 40, color: '#e8f0ff', a: 0.35, area: [bx - 400, by - 400, 600, 400] });
  });
  labFg(g, t, cam);
  FX.dust(g, t, { count: 20, color: '#c9d4ff', a: 0.2 });
} });

// s061 — "They amplify the faint light already there."  BLUEPRINT: goggle tube, faint starlight in, bright green image out
registerShot('s061', { draw(g, t, info) {
  const ui = S().ui, tAmp = W('amplify', info, 0.22), tFaint = W('faint', info, 0.9), tThere = W('there', info, 1.78), sc = 1 + 0.035 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'NIGHT-VISION GOGGLES', fig: 'FIG 8 - IMAGE INTENSIFIER' });
  const y = E.H * 0.52, x0 = E.W * 0.34, x1 = E.W * 0.66, k = ease.out(prog(t, 0.05, 1.0));
  BP.draw(g, [[x0, y - 130], [x1, y - 130], [x1, y + 130], [x0, y + 130]], k, { w: 5, close: true });          // the tube
  BP.draw(g, [[x0 + 90, y - 130], [x0 + 90, y + 130]], k, { w: 3 }); BP.draw(g, [[x1 - 90, y - 130], [x1 - 90, y + 130]], k, { w: 3 });
  // faint photons in from the left (a few, dim); many bright green ones out on the right
  for (let i = 0; i < 5; i++) { const ph = (t * 0.7 + i / 5) % 1; if (t < tFaint - 0.4) break; BP.photon(g, t, { from: [E.W * 0.08, y - 90 + i * 45], to: [x0 + 90, y - 90 + i * 45], k: ph }); }
  const amp = ease.out(prog(t, tAmp + 0.2, tAmp + 0.8));
  for (let i = 0; i < 14; i++) { const ph = (t * 1.1 + i / 14) % 1, yy = y - 110 + (i % 7) * 36; if (amp <= 0) break; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, lerp(x1 - 90, E.W * 0.92, ph), yy, 26, '#5cff7a', 0.7 * amp); g.restore(); }
  const gain = 0.5 + 0.5 * Math.sin(t * 5); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W / 2, y, 180, '#5cff7a', 0.25 * amp * (0.8 + 0.2 * gain)); g.restore();
  // the green image: a little landscape seen through the eyepiece
  const ia = ease.out(prog(t, tThere - 0.4, tThere + 0.2)); if (ia > 0) { g.save(); g.globalAlpha *= ia; circle(g, E.W * 0.86, y - 260, 110, '#06210d'); g.beginPath(); g.arc(E.W * 0.86, y - 260, 108, 0, 7); g.clip();
    g.fillStyle = '#1e7a34'; g.beginPath(); g.moveTo(E.W * 0.86 - 120, y - 210); for (let i = 0; i <= 12; i++) g.lineTo(E.W * 0.86 - 120 + i * 20, y - 230 - Math.abs(Math.sin(i * 1.3)) * 50); g.lineTo(E.W * 0.86 + 120, y - 140); g.lineTo(E.W * 0.86 - 120, y - 140); g.fill(); FX.stars(g, t, { count: 20, area: [E.W * 0.86 - 110, y - 370, 220, 120], color: '#bfffcc' }); g.restore(); ring(g, E.W * 0.86, y - 260, 110, 4, alpha('#5cff7a', 0.6 * ia)); }
  BP.label(g, t, { at: [E.W / 2, y - 130], to: [E.W / 2 - 120, y - 300], str: 'AMPLIFIER', start: tAmp + 0.1 });
  BP.label(g, t, { at: [x0 - 60, y + 40], to: [x0 - 240, y + 250], str: 'FAINT LIGHT IN', start: tFaint, size: 28 });
  g.restore();
} });

// s062 — "Starlight. Moonlight. In true darkness? Nothing to amplify."  night sky through a goggle-green vignette that drains to black
registerShot('s062', { draw(g, t, info) {
  const tStar = W('Starlight', info, 0.12), tMoon = W('Moonlight', info, 1.0), tTrue = W('true', info, 2.04), tNo = W('Nothing', info, 3.5);
  const cam = push(t, info, { z: 1.0, x: -40, y: -60 }, { z: 1.08, x: 40, y: -20 }), drain = ease.inOut(prog(t, tTrue, tNo + 0.3));
  g.save(); forest(g, t, cam, { view: 'camp', rain: false }); g.restore();
  // goggle view: everything goes monochrome green, brightened, then the light drains away
  g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = '#3cff6a'; g.fillRect(0, 0, E.W, E.H); g.restore();
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = alpha('#1a7a30', 0.35 * (1 - drain)); g.fillRect(0, 0, E.W, E.H); g.restore();
  const R = rng(62); for (let i = 0; i < 90; i++) { const x = R() * E.W, y = R() * E.H * 0.55, tw = 0.5 + 0.5 * Math.sin(t * 3 + i); circle(g, x, y, 1.5 + R() * 2, alpha('#d8ffe0', (0.5 + 0.5 * tw) * clamp(1 - drain * 1.3) * ease.out(prog(t, tStar - 0.1, tStar + 0.5)))); }
  if (t > tMoon - 0.2) glow(g, E.W * 0.3 - cam.x * 0.1, E.H * 0.18, 200, '#c8ffd4', 0.5 * ease.out(prog(t, tMoon - 0.2, tMoon + 0.3)) * (1 - drain));
  for (let y = 0; y < E.H; y += 3) { g.fillStyle = `rgba(0,0,0,${0.12 + 0.05 * Math.sin(y * 0.7 + t * 40)})`; g.fillRect(0, y, E.W, 1); }   // intensifier noise
  g.save(); g.fillStyle = `rgba(0,0,0,${0.2 + 0.8 * drain})`; g.fillRect(0, 0, E.W, E.H); g.restore();
  // twin-tube vignette
  g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(-10, -10, E.W + 20, E.H + 20); for (const dx of [-0.21, 0.21]) { g.moveTo(E.W / 2 + dx * E.W + E.H * 0.46, E.H / 2); g.arc(E.W / 2 + dx * E.W, E.H / 2, E.H * 0.46, 0, Math.PI * 2, true); } g.fill('evenodd'); g.restore();
  for (const dx of [-0.21, 0.21]) ring(g, E.W / 2 + dx * E.W, E.H / 2, E.H * 0.46, 4, alpha('#5cff7a', 0.3 * (1 - drain)));
  chip(g, t, { str: 'No light, nothing to amplify', at: tNo, x: E.W / 2, y: E.H * 0.86, tone: 'blue', dur: info.dur - 0.1 });
} });

// s063 — "So thermal wins the pitch black... but only for warm things."  TOP-DOWN thermal map of the flat
registerShot('s063', { draw(g, t, info) {
  const tWins = W('wins', info, 0.98), tOnly = W('only', info, 2.84), tWarm = W('warm', info, 3.32), rot = 0.04 * Math.sin(t * 0.4), sc = 1.02 + 0.06 * ease.inOut(t / info.dur);
  const cold = (c) => { c.save(); c.translate(E.W / 2, E.H / 2); c.rotate(rot); c.scale(sc, sc); c.translate(-E.W / 2, -E.H / 2);
    c.fillStyle = '#2c2838'; c.fillRect(260, 100, 1400, 880); c.strokeStyle = '#4a4458'; c.lineWidth = 18; c.strokeRect(260, 100, 1400, 880);    // walls
    rr(c, 360, 640, 520, 220, 40); c.fillStyle = '#45405a'; c.fill(); rr(c, 520, 460, 260, 140, 12); c.fillStyle = '#3a3448'; c.fill();       // sofa, table
    rr(c, 1380, 140, 240, 160, 8); c.fillStyle = '#504a60'; c.fill(); rr(c, 1200, 760, 420, 180, 8); c.fillStyle = '#3e384c'; c.fill();       // fridge, counter
    c.restore(); };
  const P = (x, y) => [x, y];   // map coordinates (pre-transform)
  thermalView(g, t, {
    cold,
    hot: (c) => { c.save(); c.translate(E.W / 2, E.H / 2); c.rotate(rot); c.scale(sc, sc); c.translate(-E.W / 2, -E.H / 2);
      // warm things glow: the hero (seen from above), Biscuit on the fridge, a mug on the table
      const hx = 900 + Math.sin(t * 0.8) * 30, hy = 560; heatBlob(c, hx, hy, 70, 70, 0.9, 0.5); circle(c, hx, hy, 34, heat(0.92)); heatBlob(c, hx + 40, hy + 10, 80, 46, 0.5, 0.7);
      c.save(); c.translate(1500, 220); c.rotate(0.3); c.beginPath(); c.ellipse(0, 0, 54, 32, 0, 0, 7); c.fillStyle = heat(0.78); c.fill(); circle(c, 54, -6, 22, heat(0.8)); c.restore();
      circle(c, 650, 520, 22, heat(0.8)); heatBlob(c, 650, 520, 60, 60, 0.45, 0.8);
      c.restore(); },
    hud: { label: 'THERMAL  TOP VIEW', track: null },
  });
  // labels: warm things in gold, cold things in grey (shoe, charger, sofa)
  const lab = (str, x, y, at, col) => { const a = ease.out(prog(t, at, at + 0.35)); if (a <= 0) return; text(g, str, x, y, { size: 32, color: col, font: FONTS.ui, weight: 900, alpha: a, spacing: 3, stroke: 6, strokeColor: 'rgba(0,0,0,.6)' }); };
  lab('YOU', 900, 470, tWins, '#ffd47e'); lab('CAT', 1520, 330, tWins + 0.3, '#ffd47e'); lab('MUG', 650, 590, tWins + 0.6, '#ffd47e');
  lab('SOFA', 620, 900, tOnly, '#9a96a8'); lab('SHOE', 340, 500, tOnly + 0.2, '#9a96a8'); lab('CHARGER', 1410, 680, tOnly + 0.4, '#9a96a8');
  chip(g, t, { str: 'Only warm things show', at: tWarm, x: E.W / 2, y: E.H * 0.9, dur: info.dur - 0.1 });
} });

// s064 — "Colour is a bigger ask."  giant face of HERO squinting at a grey world (scope bars)
registerShot('s064', { draw(g, t, info) {
  const tB = W('bigger', info, 1.48), cam = push(t, info, { z: 1.04, x: -20, y: 0 }, { z: 1.12, x: 20, y: -10 });
  apartment(g, t, { z: 2.0, x: -300 + t * 20, y: -40 }, { power: 0 });
  g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, E.W, E.H); g.restore();    // the world has no colour
  g.save(); g.fillStyle = 'rgba(10,10,14,.5)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  layer(g, cam, 1, (g) => bigFace(g, E.W * 0.5, E.H * 0.6, E.H * 0.3, { outfit: HERO, expr: t > tB ? 'confused' : 'thinking', rimColor: '#c8c8d0', rimSide: -1, look: [0.6 * Math.sin(t * 1.5), -0.4], blink: blinkAt(t, 0.9), face: { brows: 'raised' } }));
  const q = ease.outBack(prog(t, tB, tB + 0.35)); if (q > 0) { g.save(); g.translate(E.W * 0.72, E.H * 0.28); g.scale(q, q); g.rotate(0.1 * Math.sin(t * 3));
    for (const [i, c] of ['#e0453a', '#3fae5a', '#3f7fd6'].entries()) { circle(g, -70 + i * 70, 0, 26, mix(c, '#808080', 0.75)); } text(g, '?', 0, -80, { size: 90, color: '#e8e4f0', font: FONTS.title, weight: 700 }); g.restore(); }
  FX.dust(g, t, { count: 20, color: '#c8c8d0', a: 0.2 });
} });

// s065 — "Helmet geckos told blue from grey at moonlight levels in 2004. You?"  macro: a gecko on a rock, picks the blue swatch
registerShot('s065', { draw(g, t, info) {
  const tGeck = W('geckos', info, 0.32), tBlue = W('blue', info, 0.92), tGrey = W('grey', info, 1.4), t04 = W('2004', info, 2.64), tYou = W('You', info, 4.14);
  const cam = push(t, info, { z: 1.9, x: 120, y: 160 }, { z: 2.15, x: 180, y: 150 });
  forest(g, t, cam, { view: 'cave', rain: false }); g.save(); g.fillStyle = 'rgba(20,30,70,.25)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  const GY = forestGround();
  layer(g, cam, 1, (g) => {
    const rx = CX + 120, ry = GY - 40;
    g.fillStyle = '#2e2a38'; g.beginPath(); g.ellipse(rx, ry + 40, 320, 80, 0, Math.PI, 0); g.fill(); g.fillStyle = alpha('#b8c8ff', 0.15); g.beginPath(); g.ellipse(rx - 60, ry - 20, 200, 26, -0.1, Math.PI, 0); g.fill();
    glow(g, rx - 200, ry - 300, 420, '#b8c8ff', 0.12);                                                                     // moonlight
    const pick = ease.inOut(prog(t, tGrey + 0.2, tGrey + 0.9)), gx = rx - 60 + 70 * pick;
    gecko(g, gx, ry - 24, 1.3, t, { facing: 1 });
    // two swatches the gecko chooses between: blue (correct) and grey
    for (const [i, c, lab] of [[0, '#3f6fd6', 'BLUE'], [1, '#6a6a72', 'GREY']]) { const sx = rx + 120 + i * 120, sy = ry - 58, a = ease.outBack(prog(t, i ? tGrey - 0.2 : tBlue - 0.2, (i ? tGrey : tBlue) + 0.2));
      if (a <= 0) continue; g.save(); g.translate(sx, sy); g.scale(a, a); rr(g, -40, -40, 80, 80, 10); g.fillStyle = c; g.fill(); g.restore();
      if (i === 0 && pick > 0.9) { ring(g, sx, sy, 62, 5, '#ffd47e'); glow(g, sx, sy, 90, '#ffd47e', 0.3); } }
  });
  chip(g, t, { str: 'Gecko colour vision, 2004', at: t04 - 0.3, x: E.W / 2, y: E.H * 0.86, dur: tYou - 0.05 });
  // "You?" - the hero in a small inset, shrugging at the grey swatch
  const ik = ease.outBack(prog(t, tYou - 0.1, tYou + 0.25)); if (ik > 0) { g.save(); g.translate(E.W * 0.16, E.H * 0.26); g.scale(ik, ik); circle(g, 0, 0, 130, alpha('#0b1324', 0.92)); ring(g, 0, 0, 130, 4, alpha('#ffd47e', 0.6)); g.beginPath(); g.arc(0, 0, 126, 0, 7); g.clip(); bigFace(g, 0, 26, 86, { outfit: HERO, expr: 'confused', rimColor: '#c8c8d0' }); g.restore(); }
} });

// s066 — "Hot, warm, cold. That is your entire palette."  BLUEPRINT: three swatches slide in on the words
registerShot('s066', { draw(g, t, info) {
  const ui = S().ui, tH = W('Hot', info, 0.12), tW = W('warm', info, 0.9), tC = W('cold', info, 1.38), tPal = W('palette', info, 3.32), sc = 1 + 0.035 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'YOUR NEW PALETTE', fig: 'FIG 9 - THREE COLOURS, TOTAL' });
  [[tH, 'HOT', 0.95], [tW, 'WARM', 0.66], [tC, 'COLD', 0.2]].forEach(([tt, lab, v], i) => {
    const k = ease.outBack(prog(t, tt - 0.05, tt + 0.4)); if (k <= 0) return; const x = E.W * (0.3 + i * 0.2) + (1 - k) * 600, y = E.H * 0.5;
    g.save(); g.globalAlpha *= clamp(k); rr(g, x - 140, y - 200, 280, 320, 24); g.fillStyle = `rgb(${heatColor(v).map(Math.round)})`; g.fill(); g.strokeStyle = alpha(ui.cream, 0.6); g.lineWidth = 4; g.stroke();
    glow(g, x, y - 40, 180, `rgb(${heatColor(v).map(Math.round)})`, 0.2); text(g, lab, x, y + 180, { size: 50, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 6 }); g.restore(); });
  // a bracket under all three on "entire palette"
  const bk = ease.out(prog(t, tPal - 0.5, tPal + 0.2)); if (bk > 0) BP.draw(g, [[E.W * 0.22, E.H * 0.82], [E.W * 0.22, E.H * 0.86], [E.W * 0.78, E.H * 0.86], [E.W * 0.78, E.H * 0.82]], bk, { w: 4, color: ui.gold });
  if (bk > 0.9) text(g, 'THAT IS ALL', E.W / 2, E.H * 0.91, { size: 34, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 6, alpha: clamp((bk - 0.9) * 10) });
  g.restore();
} });

// s067 — "Upside, you win hide and seek forever."  THERMAL medium: Dev behind the curtain glows like a lantern; HERO points
registerShot('s067', { draw(g, t, info) {
  const tUp = W('Upside', info, 0.12), tHide = W('hide', info, 2.06), tFor = W('forever', info, 2.92), GY = apartmentGround();
  const cam = push(t, info, { z: 1.35, x: -60, y: 80 }, { z: 1.48, x: 20, y: 70 });
  const curX = CX - 120, devX = curX + 10 + Math.sin(t * 1.2) * 6;
  const heroPose = breathe(posesAt(t, [[0, POSES.stand], [tHide - 0.3, POSES.point]], 0.25), t, 1, 2);
  thermalView(g, t, {
    cold: (c) => { apartment(c, t, cam, { power: 0 }); layer(c, cam, 1, (c) => { for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#7a6a8a' : '#6a5a7a'; c.fillRect(curX - 160 + i * 36 + Math.sin(t * 1.3 + i) * 3, GY - 640, 34, 640); } }); },
    hot: (c) => layer(c, cam, 1, (c) => {
      c.save(); c.filter = 'blur(6px)'; heatActor(c, 'DEV', { x: devX, y: GY, s: 1.5, facing: 1, pose: breathe(POSES.crossArms, t, 1, 1), t, heat: 0.78 }); c.restore();   // glowing through the curtain like a lantern
      heatActor(c, 'HERO', { x: CX + 420, y: GY, s: 1.5, facing: -1, pose: heroPose, t, expr: t > tHide ? 'smirk' : 'neutral' });
    }),
    hud: { label: 'THERMAL', temp: t > tHide ? '35 C  FOUND YOU' : null, track: t > tHide - 0.2 ? scr(cam, devX, GY - 280) : null },
  });
  if (t > tFor) layer(g, cam, 1, (g) => FX.sparkle(g, devX + 80, GY - 420, 30 * ease.outBack(prog(t, tFor, tFor + 0.3)), '#ffe6a8', 0.8));
  chip(g, t, { str: 'Hide and seek: undefeated', at: tFor - 0.2, x: E.W / 2, y: E.H * 0.88, dur: info.dur - 0.1 });
} });

// s068 — "Downside, you can't read a menu."  cinema lobby: HERO squints at the blank menu, Dev waits with a wallet
registerShot('s068', { draw(g, t, info) {
  const tDown = W('Downside', info, 0.12), tRead = W('read', info, 1.4), tMenu = W('menu', info, 1.66), GY = cinemaGround();
  const cam = push(t, info, { z: 1.4, x: -230, y: 60 }, { z: 1.52, x: -190, y: 50 });
  const C = cinema(g, t, cam, { view: 'lobby', screen: 0.2 });
  layer(g, cam, 1, (g) => {
    const mx = C.pos.menuX, my = C.pos.menuY; g.save(); rr(g, mx - 330, my - 40, 660, 300, 10); g.fillStyle = '#1c1b2a'; g.fill(); g.strokeStyle = alpha('#ffd59a', 0.45); g.lineWidth = 4; g.stroke(); glow(g, mx, my + 110, 380, '#ffd59a', 0.08); g.restore();   // the menu: a cold blank slab to him
    const lean = ease.inOut(prog(t, tRead - 0.4, tRead + 0.2));
    actor(g, 'HERO', { x: mx - 120, y: GY, s: 1.4, facing: 1, pose: breathe(posesAt(t, [[0, POSES.stand], [tRead - 0.3, POSES.think]], 0.35), t, 1, 1), rot: -0.1 * lean, expr: t > tMenu ? 'confused' : 'determined', look: [0.5, -0.8], rim: C.rim, t });
    actor(g, 'DEV', { x: mx - 420, y: GY, s: 1.4, facing: 1, pose: breathe(POSES.holdFront, t, 1, 3), expr: t > tMenu + 0.3 ? 'confused' : 'neutral', look: [0.8, 0], rim: C.rim, t, prop: { type: 'paper' }, blink: blinkAt(t, 1.1) });
    if (t > tMenu) { for (let i = 0; i < 3; i++) text(g, '?', mx + 30 + i * 60, my - 80 - i * 24 - Math.sin(t * 4 + i) * 8, { size: 56 + i * 10, color: '#ffd47e', font: FONTS.title, weight: 700, alpha: ease.out(prog(t, tMenu + i * 0.12, tMenu + 0.3 + i * 0.12)) }); }
  });
  cinemaFg(g, t, cam);
  FX.dust(g, t, { count: 22, color: '#ffe6b0', a: 0.2 });
} });
