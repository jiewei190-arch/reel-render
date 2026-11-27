// B_s061_s068_goggles_palette.js — batch B: night-vision goggles vs thermal, the 2004 gecko colour test, the three-colour palette, hide and seek, the menu.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, shade, mix, rng, talkAmount } from '/engine/core.js';
import { headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat, gecko } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { cinema, cinemaFg, cinemaGround } from '../sets/cinema.js';
import { thermalView, heatActor, heatCat, heatBlob, heatRect, heat, heatColor, PALETTE } from '../sets/thermal.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, talkGesture, reaction, pointAndLook, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { W, handWorld, scr, punch, swatch } from './B_lib.js';

const CX = E.W / 2, rgbOf = (v) => `rgb(${heatColor(v).map(Math.round)})`;
// green night-vision treatment over whatever is already drawn: monochrome green, intensifier grain, twin-tube vignette
function nvView(g, t, k = 1, o = {}) {
  g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = '#3cff6a'; g.globalAlpha = k; g.fillRect(0, 0, E.W, E.H); g.restore();
  const R = rng(Math.floor(t * 24) + 7); g.save(); for (let i = 0; i < 900; i++) { const x = R() * E.W, y = R() * E.H; g.fillStyle = `rgba(150,255,170,${0.05 + 0.12 * R()})`; g.fillRect(x, y, 2, 2); } g.restore();
  for (let y = 0; y < E.H; y += 3) { g.fillStyle = `rgba(0,0,0,${0.1 + 0.04 * Math.sin(y * 0.7 + t * 40)})`; g.fillRect(0, y, E.W, 1); }
  if (o.tubes !== false) { g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(-10, -10, E.W + 20, E.H + 20); for (const dx of [-0.21, 0.21]) { g.moveTo(E.W / 2 + dx * E.W + E.H * 0.47, E.H / 2); g.arc(E.W / 2 + dx * E.W, E.H / 2, E.H * 0.47, 0, Math.PI * 2, true); } g.fill('evenodd'); g.restore();
    for (const dx of [-0.21, 0.21]) ring(g, E.W / 2 + dx * E.W, E.H / 2, E.H * 0.47, 4, alpha('#5cff7a', 0.3)); }
}
// night-vision goggles worn on a head (head centre hx,hy, head radius hr, facing f)
function nvGoggles(g, hx, hy, hr, f = 1) { g.save(); g.translate(hx, hy); g.scale(f, 1); seg(g, [[-hr * 1.05, -hr * 0.2], [hr * 0.2, -hr * 0.45]], hr * 0.22, '#24242c');
  for (const dy of [-0.18, 0.18]) { rr(g, hr * 0.5, -hr * 0.42 + dy * hr * 1.6, hr * 0.9, hr * 0.5, hr * 0.14); g.fillStyle = '#34363e'; g.fill(); circle(g, hr * 1.42, -hr * 0.17 + dy * hr * 1.6, hr * 0.2, '#5cff7a'); glow(g, hr * 1.42, -hr * 0.17 + dy * hr * 1.6, hr * 0.8, '#5cff7a', 0.6); } g.restore(); }
// popcorn box (red/white stripes, kernels on top)
function popcorn(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-30, -70], [30, -70], [22, 0], [-22, 0]], '#f4efe4'); for (const dx of [-18, 0, 18]) poly(g, [[dx - 5, -70], [dx + 5, -70], [dx * 0.75 + 4, 0], [dx * 0.75 - 4, 0]], '#d4262e');
  for (let i = 0; i < 9; i++) circle(g, -24 + (i % 5) * 12, -76 - Math.floor(i / 5) * 10 - (i % 2) * 4, 9, '#fff4cc'); g.restore(); }

// s061 — "Night-vision goggles amplify faint light that's already there,"  BLUEPRINT: image intensifier, a few photons in, a shower of green out
registerShot('s061', { draw(g, t, info) {
  const ui = S().ui, tAmp = W('amplify', info, 1.39), tFaint = W('faint', info, 1.99), tThere = W('there', info, 3.03), z = 1 + 0.035 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'NIGHT-VISION GOGGLES', fig: 'FIG 8 - IMAGE INTENSIFIER TUBE' });
  const y = E.H * 0.52, x0 = E.W * 0.34, x1 = E.W * 0.68, k = ease.out(prog(t, 0.05, 1.1));
  BP.draw(g, [[x0, y - 140], [x1, y - 140], [x1, y + 140], [x0, y + 140]], k, { w: 5, close: true });
  BP.draw(g, [[x0 + 90, y - 140], [x0 + 90, y + 140]], k, { w: 3 }); BP.draw(g, [[x1 - 90, y - 140], [x1 - 90, y + 140]], k, { w: 3 });
  for (let i = 0; i < 6; i++) BP.draw(g, [[x0 + 130 + i * 50, y - 120], [x0 + 130 + i * 50, y + 120]], k, { w: 2, color: alpha(ui.blueprint, 0.4) });   // microchannel plate
  BP.draw(g, [[x0 - 200, y - 110], [x0 - 120, y], [x0 - 200, y + 110], [x0 - 280, y]], k, { w: 4, close: true });                  // objective lens
  for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i / 4) % 1; BP.photon(g, t, { from: [E.W * 0.05, y - 80 + i * 52], to: [x0 + 90, y - 80 + i * 52], k: ph }); }
  const amp = ease.out(prog(t, tAmp - 0.1, tAmp + 0.5));
  if (amp > 0) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { const ph = (t * 1.2 + i / 22) % 1, yy = y - 120 + (i % 11) * 24; glow(g, lerp(x1 - 90, E.W * 0.94, ph), yy + Math.sin(i * 3) * 6, 26, '#5cff7a', 0.75 * amp); } glow(g, (x0 + x1) / 2, y, 220, '#5cff7a', 0.22 * amp); g.restore(); }
  BP.label(g, t, { at: [(x0 + x1) / 2, y - 140], to: [(x0 + x1) / 2 - 140, y - 320], str: 'AMPLIFIES EXISTING LIGHT', start: tAmp + 0.1, size: 30 });
  BP.label(g, t, { at: [x0 - 200, y + 60], to: [x0 - 330, y + 270], str: 'FAINT LIGHT IN', start: tFaint - 0.1, size: 28 });
  BP.label(g, t, { at: [x1 + 80, y + 60], to: [x1 + 220, y + 270], str: 'BRIGHT GREEN OUT', start: tThere - 0.3, size: 28 });
  g.restore();
} });

// s062 — "so in true darkness, they've got nothing."  through Dev's goggles: grainy black, arms out, he bumps into the bookcase on "nothing"
registerShot('s062', { draw(g, t, info) {
  const tTrue = W('true', info, 0.55), tNot = W('nothing', info, 1.83), GY = apartmentGround(), bump = t > tNot - 0.05, pk = punch(t, tNot - 0.05, 0.08, 0.5);
  const cam = camMove(t, info.dur, { z: [1.45, 1.52], x: [-520, -560], y: [150, 140] }); { const sk = shake(t * 4, 16 * pk, 5, 3); cam.x += sk[0]; cam.y += sk[1]; }
  const A = apartment(g, t, cam, { power: 0, moon: 0.4 });
  const dx = lerp(CX - 360, CX - 470, ease.inOut(prog(t, 0, tNot))) + (bump ? 30 * ease.out(prog(t, tNot, tNot + 0.3)) : 0);
  const pose = idle(poseAt(t, [[0, 'handsUp'], [tNot - 0.05, reaction('wince', t, tNot - 0.05, 'handsUp')], [tNot + 0.5, 'handsUp']], 0.2), t, 3);
  const dev = { x: dx, y: GY + 30, s: 1.9, facing: -1 };
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { ...dev, pose, t, rim: { color: '#7aff9a', dir: [0.8, -0.4] }, expr: exprAt(t, [[0, 'confused'], [tTrue, 'worried'], [tNot, 'shocked']]), blink: blinkFlag(t, 3.0, 2), look: [-1, 0] });
    const [hx, hy, hr] = headPos({ ...dev, pose }); nvGoggles(g, hx, hy, hr, -1);
    if (bump) for (let i = 0; i < 3; i++) FX.sparkle(g, dx - 120 + i * 20, GY - 380 + i * 30, 20 * (1 - prog(t, tNot, tNot + 0.6)), '#d8ffe0', 0.8);
  });
  darkness(g, 0.28); nvView(g, t, 1, { tubes: false }); g.save(); const vg = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.35, E.W / 2, E.H / 2, E.H * 0.85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.92)'); g.fillStyle = vg; g.fillRect(0, 0, E.W, E.H); g.restore();
  chip(g, t, { str: 'NO LIGHT = NOTHING', at: tNot + 0.05, x: CX, y: E.H * 0.88, tone: 'blue', dur: info.dur - 0.06 });
} });
const darkness = (g, k) => { g.save(); g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(0, 0, E.W, E.H); g.restore(); };

// s063 — "Thermal wins the pitch black, but only for warm things."  split: goggles (black noise) vs thermal (Hero + Biscuit glow, cold mug purple)
registerShot('s063', { draw(g, t, info) {
  const tWin = W('wins', info, 0.15), tWarm = W('warm', info, 2.01), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [60, 90], y: [130, 124] });
  const div = lerp(E.W * 0.5, E.W * 0.14, ease.inOut(prog(t, tWin, tWin + 0.9)));
  const hero = { x: CX + 60, y: GY + 30, s: 1.9, facing: -1 }, mug = [CX - 200, A0Top()];
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatActor(c, 'HERO', { ...hero, pose: idle(poseAt(t, [[0, 'relaxed'], [tWarm, 'shrug']], 0.3), t, 2), t, expr: exprAt(t, [[0, 'neutral'], [tWin, 'smirk']]), blink: blinkFlag(t, 3.3, 3) });
      heatCat(c, { x: CX + 420, y: GY - 2, s: 2.0, facing: -1, pose: 'sit', t, heat: 0.58 });
      // the mug is cold: draw nothing hot for it (it stays purple)
    }),
    hud: { label: 'THERMAL', temp: '12 C  MUG', track: scr(cam, mug[0], mug[1] - 30) },
  });
  // left of the divider: what the goggles see in true darkness
  g.save(); g.beginPath(); g.rect(0, 0, div, E.H); g.clip(); g.fillStyle = '#020403'; g.fillRect(0, 0, E.W, E.H); nvView(g, t, 1, { tubes: false }); g.restore();
  seg(g, [[div, 0], [div, E.H]], 4, alpha('#fff6d8', 0.7)); glow(g, div, E.H / 2, 120, '#fff6d8', 0.2);
  if (div > E.W * 0.2) text(g, 'GOGGLES', div / 2, E.H * 0.14, { size: 34, color: '#7aff9a', font: FONTS.ui, weight: 900, spacing: 5, alpha: 0.8 });
  text(g, 'THERMAL', (div + E.W) / 2, E.H * 0.14, { size: 34, color: '#ffd47e', font: FONTS.ui, weight: 900, spacing: 5, alpha: 0.85 });
  chip(g, t, { str: 'Only warm things', at: tWarm, x: (div + E.W) / 2, y: E.H * 0.88, dur: info.dur - 0.08 });
} });
function A0Top() { return apartmentGround() - 24; }

// s064 — "Colour is a much bigger ask. In 2004,"  BLUEPRINT: a colour wheel draws on with a gold question mark, then a field-note card: 2004
registerShot('s064', { draw(g, t, info) {
  const ui = S().ui, tBig = W('bigger', info, 1.57), t04 = W('2004', info, 2.71), z = 1 + 0.035 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'COLOUR VISION', fig: 'FIG 9 - WHAT CONES DO' });
  const wx = E.W * 0.36, wy = E.H * 0.5, r = 250, k = ease.out(prog(t, 0.1, 1.5)), flip = ease.inOut(prog(t, t04 - 0.5, t04));
  g.save(); g.translate(wx, wy); g.scale(1 - flip * 0.3, 1 - flip * 0.3); g.translate(-wx, -wy);
  const cols = ['#e0453a', '#f08a24', '#e9c12e', '#3fae5a', '#3f9ad6', '#5a5ad6', '#9a5ad6', '#d65aa0'];
  for (let i = 0; i < 8; i++) { const a0 = i / 8 * Math.PI * 2 - Math.PI / 2, a1 = a0 + Math.PI * 2 / 8 * clamp(k * 8 - i); if (a1 <= a0) continue; g.beginPath(); g.moveTo(wx, wy); g.arc(wx, wy, r, a0, a1); g.closePath(); g.fillStyle = alpha(cols[i], 0.75); g.fill(); g.strokeStyle = ui.bpBg; g.lineWidth = 4; g.stroke(); }
  circle(g, wx, wy, r * 0.42, ui.bpBg); ring(g, wx, wy, r + 6, 4, alpha(ui.blueprint, 0.6 * k));
  const q = ease.outBack(prog(t, tBig - 0.1, tBig + 0.3)); if (q > 0) { g.save(); g.translate(wx, wy); g.scale(q, q); text(g, '?', 0, 6, { size: 200, color: ui.gold, font: FONTS.title, weight: 700, glow: 30, glowColor: alpha(ui.gold, 0.6) }); g.restore(); }
  g.restore();
  // field-note card flips in: 2004
  if (flip > 0) { g.save(); g.translate(E.W * 0.7, E.H * 0.5); g.scale(flip, 1); rr(g, -260, -190, 520, 380, 20); g.fillStyle = '#f2ecd8'; g.fill(); g.strokeStyle = alpha('#000', 0.25); g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 5; i++) seg(g, [[-220, -60 + i * 48], [220 - (i % 2) * 60, -60 + i * 48]], 2, alpha('#3f7fd6', 0.35)); text(g, 'FIELD NOTE', -220, -130, { size: 30, color: '#3a3448', font: FONTS.ui, weight: 900, align: 'left', spacing: 4 });
    text(g, '2004', 0, 40, { size: 150, color: ui.gold, font: FONTS.title, weight: 700, stroke: 10, strokeColor: '#3a3448', glow: 16, glowColor: alpha(ui.gold, 0.5) }); g.restore(); }
  g.restore();
} });

// s065 — "helmet geckos told blue from grey at about moonlight levels."  moonlit rock macro: the gecko turns and taps the BLUE card
registerShot('s065', { draw(g, t, info) {
  const tBlue = W('blue', info, 1.05), tGrey = W('grey', info, 1.65), tMoon = W('moonlight', info, 2.51), GY = forestGround();
  const cam = camMove(t, info.dur, { z: [1.8, 1.95], x: [60, 110], y: [200, 190] });
  forest(g, t, cam, { view: 'cave', rain: false }); veil(g, '#101a40', 0.2);
  layer(g, cam, 1, (g) => {
    const rx = CX + 110, ry = GY - 40;
    glow(g, rx - 360, ry - 420, 520, '#b8c8ff', 0.18);                                                                      // moonlight
    g.fillStyle = '#2e2a38'; g.beginPath(); g.ellipse(rx, ry + 40, 420, 90, 0, Math.PI, 0); g.fill(); g.fillStyle = alpha('#b8c8ff', 0.18); g.beginPath(); g.ellipse(rx - 80, ry - 34, 260, 22, -0.06, Math.PI, 0); g.fill();
    const tap = ease.inOut(prog(t, tBlue - 0.25, tBlue + 0.15)) * (1 - ease.inOut(prog(t, tBlue + 0.5, tBlue + 0.9))), turn = ease.inOut(prog(t, 0.3, tBlue - 0.2));
    swatch(g, rx + 150, ry - 40, 110, 120, '#3f6fd6', { rot: -0.06, ring: ease.out(prog(t, tBlue, tBlue + 0.3)) });
    swatch(g, rx + 310, ry - 40, 110, 120, '#77777f', { rot: 0.05 });
    gecko(g, { x: rx - 40 + 40 * tap, y: ry - 46, s: 3.0, facing: 1, t, rot: -0.08 * turn - 0.12 * tap, rim: { color: '#b8c8ff', dir: [-0.6, -1] } });
    if (t > tBlue) text(g, 'BLUE', rx + 150, ry - 200, { size: 40, color: '#9fc0ff', font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, tBlue, tBlue + 0.3)) });
    if (t > tGrey) text(g, 'GREY', rx + 310, ry - 200, { size: 40, color: '#b8b8c0', font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, tGrey, tGrey + 0.3)) });
  });
  forestFg(g, t, cam); atmos(g, t, cam, { color: '#b8c8ff' });
  chip(g, t, { str: 'Blue vs grey, by moonlight', at: tMoon - 0.2, x: CX, y: E.H * 0.88, dur: info.dur - 0.08 });
} });

// s066 — "You? Hot, warm, cold. That's your whole palette."  THERMAL: Hero shrugs; the HUD palette collapses to three swatches
registerShot('s066', { draw(g, t, info) {
  const tYou = W('You', info, 0.15), tH = W('Hot', info, 0.59), tW = W('warm', info, 1.19), tC = W('cold', info, 1.65), tPal = W('palette', info, 2.63), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.5, 1.6], x: [-180, -150], y: [160, 150] });
  const hero = { x: CX - 220, y: GY + 30, s: 1.95, facing: 1 };
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => heatActor(c, 'HERO', { ...hero, pose: idle(poseAt(t, [[0, 'relaxed'], [tYou + 0.2, 'shrug'], [tPal, 'shrug']], 0.3), t, 4), t, expr: exprAt(t, [[0, 'neutral'], [tYou, 'confused'], [tPal, 'smirk']]), blink: blinkFlag(t, 3.2, 2) })),
    hud: { label: 'THERMAL', scale: false },
  });
  // the palette bar: full gradient that collapses into three swatches
  const bx = E.W * 0.66, by = E.H * 0.2, col = ease.inOut(prog(t, tH - 0.2, tC + 0.2));
  g.save(); g.globalAlpha *= 1 - col * 0.9; const gr = g.createLinearGradient(bx, 0, bx + 520, 0); PALETTE.forEach(([p, c]) => gr.addColorStop(p, `rgb(${c})`)); g.fillStyle = gr; g.fillRect(bx, by, 520, 40); g.restore();
  [[tH, 'HOT', 0.95], [tW, 'WARM', 0.7], [tC, 'COLD', 0.2]].forEach(([tt, lab, v], i) => { const k = ease.outBack(prog(t, tt - 0.05, tt + 0.35)); if (k <= 0) return; const x = bx + 80 + i * 180, y = E.H * 0.42;
    g.save(); g.translate(x, y); g.scale(k, k); rr(g, -70, -90, 140, 180, 18); g.fillStyle = rgbOf(v); g.fill(); g.strokeStyle = alpha('#fff6e0', 0.7); g.lineWidth = 4; g.stroke();
    text(g, lab, 0, 130, { size: 40, color: '#fff6e0', font: FONTS.ui, weight: 900, spacing: 4, stroke: 8, strokeColor: 'rgba(0,0,0,.6)' }); g.restore(); });
  chip(g, t, { str: 'Your whole palette', at: tPal - 0.2, x: bx + 260, y: E.H * 0.86, dur: info.dur - 0.08 });
} });

// s067 — "Upside, you win hide and seek forever."  THERMAL: Dev glows behind the curtain + sofa, Hero points straight at him with a smirk
registerShot('s067', { draw(g, t, info) {
  const tUp = W('Upside', info, 0.15), tHide = W('hide', info, 1.23), tFor = W('forever', info, 1.89), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.32, 1.42], x: [-60, 0], y: [130, 120] });
  const curX = CX - 260, devX = curX + 20 + Math.sin(t * 1.3) * 5;
  const pl = pointAndLook(t, tHide - 0.25, [-1, -0.15], { base: 'stand' });
  thermalView(g, t, {
    cold: (c) => { apartment(c, t, cam, { power: 0 }); layer(c, cam, 1, (c) => { for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#8a7a9a' : '#7a6a8a'; c.fillRect(curX - 160 + i * 36 + Math.sin(t * 1.3 + i) * 3, GY - 700, 34, 700); } }); },
    hot: (c) => layer(c, cam, 1, (c) => {
      c.save(); c.filter = 'blur(5px)'; heatActor(c, 'DEV', { x: devX, y: GY + 20, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'crossArms']]), t, 1), t, heat: 0.8 }); c.restore();   // glows straight through the curtain
      heatRect(c, curX - 220, GY - 120, 440, 140, 0.18, 14);                                                                                       // the sofa back hides his legs
      heatActor(c, 'HERO', { x: CX + 380, y: GY + 30, s: 1.95, facing: -1, pose: idle(pl.pose, t, 3), look: pl.look, t, expr: exprAt(t, [[0, 'neutral'], [tHide, 'smirk']]), blink: blinkFlag(t, 3.4, 5) });
    }),
    hud: { label: 'THERMAL', temp: t > tHide ? '35 C  FOUND YOU' : null, track: t > tHide - 0.1 ? scr(cam, devX, GY - 330) : null },
  });
  if (t > tFor) FX.sparkle(g, ...scr(cam, devX + 100, GY - 500), 34 * ease.outBack(prog(t, tFor, tFor + 0.3)), '#ffe6a8', 0.8);
  chip(g, t, { str: 'UPSIDE', at: tUp + 0.05, x: E.W * 0.2, y: E.H * 0.2, tone: 'blue', dur: info.dur - 0.08 });
} });

// s068 — "Downside, you can't read a menu."  cinema lobby: Hero squints at a menu that is flat even rectangles to him; Dev reads it happily with popcorn
registerShot('s068', { draw(g, t, info) {
  const tDown = W('Downside', info, 0.15), tRead = W('read', info, 1.33), tMenu = W('menu', info, 1.63), GY = cinemaGround();
  const cam = camMove(t, info.dur, { z: [1.16, 1.23], x: [-100, -70], y: [-10, -20] });
  const C = cinema(g, t, cam, { view: 'lobby', screen: 0.3 });
  const mx = CX + 140, my = GY - 640;
  layer(g, cam, 1, (g) => {
    // the menu board, readable to everyone else
    rr(g, mx - 340, my - 50, 680, 320, 12); g.fillStyle = '#1c1a2a'; g.fill(); g.strokeStyle = alpha('#ffd59a', 0.6); g.lineWidth = 4; g.stroke(); glow(g, mx, my + 100, 420, '#ffd59a', 0.1);
    ['POPCORN', 'NACHOS', 'SODA', 'HOT DOG'].forEach((it, i) => { text(g, it, mx - 290, my + 10 + i * 62, { size: 40, color: '#ffe6b0', font: FONTS.ui, weight: 900, align: 'left' }); text(g, ['4.50', '5.00', '3.00', '4.00'][i], mx + 290, my + 10 + i * 62, { size: 40, color: '#ffd47e', font: FONTS.ui, weight: 900, align: 'right' }); });
    const hero = { x: CX - 40, y: GY + 30, s: 1.9, facing: 1 }, dev = { x: CX - 380, y: GY + 30, s: 1.9, facing: 1 };
    const lean = ease.inOut(prog(t, tRead - 0.4, tRead + 0.2));
    actor(g, 'HERO', { ...hero, pose: idle(poseAt(t, [[0, 'stand'], [tRead - 0.3, 'think']], 0.35), t, 1), rot: -0.08 * lean, t, rim: C.rim, expr: exprAt(t, [[0, 'neutral'], [tRead, 'determined'], [tMenu + 0.2, 'confused']]), blink: blinkFlag(t, 3.3, 1), look: lookToward(0.6, -1) });
    const devPose = idle(poseAt(t, [[0, 'holdFront']]), t, 3), [px, py] = handWorld(dev, devPose);
    actor(g, 'DEV', { ...dev, pose: devPose, t, rim: C.rim, expr: exprAt(t, [[0, 'happy'], [tMenu + 0.3, 'smile']]), blink: blinkFlag(t, 2.9, 4), look: lookToward(0.7, -0.9) });
    popcorn(g, px + 6, py + 10, 1.3);
  });
  cinemaFg(g, t, cam);
  // what the menu looks like to HIM: flat even rectangles (thermal inset)
  const ik = ease.outBack(prog(t, tRead - 0.1, tRead + 0.25)); if (ik > 0) { const ix = E.W * 0.82, iy = E.H * 0.62; g.save(); g.translate(ix, iy); g.scale(ik, ik);
    circle(g, 0, 0, 170, rgbOf(0.3)); ring(g, 0, 0, 170, 5, alpha('#ffd47e', 0.8)); g.beginPath(); g.arc(0, 0, 166, 0, 7); g.clip(); rr(g, -130, -100, 260, 200, 10); g.fillStyle = rgbOf(0.42); g.fill(); for (let i = 0; i < 4; i++) { rr(g, -110, -80 + i * 44, 220, 26, 6); g.fillStyle = rgbOf(0.43); g.fill(); }
    g.restore(); text(g, 'HIS VIEW', ix, iy + 200, { size: 28, color: '#ffd47e', font: FONTS.ui, weight: 900, spacing: 4, alpha: ik }); }
  chip(g, t, { str: 'DOWNSIDE', at: tDown + 0.05, x: E.W * 0.2, y: E.H * 0.2, tone: 'coral', dur: info.dur - 0.08 });
  atmos(g, t, cam, { color: '#ffe6b0' });
} });
