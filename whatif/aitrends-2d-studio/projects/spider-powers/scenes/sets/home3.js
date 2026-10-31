// sets/home3.js — HOME sets for ep 3 "What If You Trained Every Day for 3 Years?" + the home props.
//   const H = home3(g, t, cam, { room: 'bathroom' | 'kitchen' | 'bedroom', mood: 'dawn' | 'day' | 'dusk' | 'night', lights: 0..1, ...room opts })
//     bathroom: { hair: 0..1 (hair clump in the shower drain), steam: 0..1, drip: true }
//        pos: { mirrorX, mirrorY, sinkX, sinkTop, showerX, showerL, showerR, drainX, drainY, towelX, windowX }
//     kitchen:  { cereal: 1 (box hidden on top of the fridge) | 0, plate: 1 | 0, kcal: 0..1 (the "700 kcal" tag pops), steam: 0..1 }
//        pos: { fridgeX, fridgeTop, cerealX, cerealY, tableX, tableTop, plateX, plateY, counterL, counterR, counterTop, windowX }
//     bedroom:  { marks: 0..31 (X marks on the wall calendar), month: 'MARCH', alarm: 0..1 (ringing), clock: '5:30', mat: 1 }
//        pos: { calX, calY, matX, matL, matR, bedX, bedTop, standX, standTop, clockX, clockY, windowX, posterXs[] }
//   home3Fg(g, t, cam, { room })   blurred foreground (towel / chair back / plant) after characters
//   All rooms: back wall (0.55) with a window to the sky (0.12-ish inside the frame), floor (0.9), furniture on the character plane (1.0),
//   one key light per room (bathroom mirror bar, kitchen pendant, bedroom window/dawn + desk lamp), mood sets sky + light level.
// Props (also usable on their own):
//   hairClump(g, x, y, s, t)  cerealBox(g, x, y, s, rot)  plate700(g, x, y, s, { kcal })  calendar(g, x, y, s, { marks, month, hl })
//   alarmClock(g, x, y, s, t, { time, ring })   hairLog(g, t, { x, y, s, rot, reveal, rows })   tapeMeasure(g, x, y, len, { s, ext, rot })
//   timeSkip(g, t, { keys: [[t, 'WEEK 1'], [t, 'MONTH 3']], x, y, s, flip, onTick })   skipTimes(keys) -> flip times (tick SFX hook)
//   filmFrame(g, t, { at, sec0, label })   full-frame camera viewfinder (REC dot, timer, brackets, battery, focus box)
//   filmPhone(g, t, { x, y, s, rot, at, sec0 }, (g, w, h) => content)   Dev's phone filming: the content inside + the same REC UI
import { E, V, S, mood, layer, blurLayer, veil, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, clamp, lerp, ease, prog, text, measure, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const home3Ground = () => E.H * V(0.8, 0.68);
const MOODS = { dawn: 'golden', day: 'day', dusk: 'dusk', night: 'night' };
const LIGHT = { dawn: 0.72, day: 1, dusk: 0.66, night: 0.38 };
const ui = () => S().ui;

// ---------- shared shell: wall + window + floor ----------
function shell(g, t, cam, o) {
  const { M, GY, CX, wall, floor, win } = o;
  layer(g, cam, 0.55, (g) => {
    const top = GY - 1000;
    g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(wall, 0.06), wall, shade(wall, -0.3)]); g.fillRect(-E.W, top, E.W * 3.2, GY - top + 6);
    if (win) FX.windowFrame(g, { x: win.x, y: win.y, w: win.w, h: win.h, cols: win.cols ?? 2, rows: win.rows ?? 2, frame: shade(wall, -0.55), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
      if (o.night) { FX.stars(g, t * 0.3, { area: [x, y, w, h * 0.6], count: 30, seed: 7 }); FX.moon(g, x + w * 0.75, y + h * 0.25, 22, '#e8ecff'); }
      else if (o.dawn) { glow(g, x + w * 0.3, y + h * 0.95, w * 0.9, '#ffb070', 0.7); circle(g, x + w * 0.3, y + h * 0.98, 34, '#fff0c8'); }
      else FX.clouds(g, { y: y + h * 0.25, count: 3, h: 50, a: 0.35, seed: 3 });
      FX.skyline(g, { x: x - 20, y: y + h + 4, w: w + 40, minH: 40, maxH: 150, color: mix(M.sky[1] || M.sky[0], '#0a0812', 0.7), windowColor: alpha(M.practical, 0.7), lit: o.night ? 0.35 : 0.05, seed: 17 });
      if (win.frosted) { g.fillStyle = alpha('#e8f0f8', 0.55); g.fillRect(x, y, w, h); for (let i = 0; i < 18; i++) circle(g, x + (i * 53) % w, y + (i * 37) % h, 3, alpha('#ffffff', 0.5)); }
    });
    if (win) { g.fillStyle = shade(wall, -0.45); g.fillRect(win.x - 14, win.y + win.h, win.w + 28, 14); }
    g.fillStyle = shade(wall, -0.5); g.fillRect(-E.W, GY - 14, E.W * 3.2, 16);                       // skirting
    o.wallFn?.(g);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(floor, -0.05), shade(floor, -0.5)]); g.fillRect(-E.W, GY, E.W * 3.2, E.H * 2);
    o.floorFn?.(g);
    if (win && !win.frosted) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, GY, 0, GY + 320, [alpha(o.dawn ? '#ffb070' : M.key, 0.16 * o.L), alpha(M.key, 0)]);
      g.beginPath(); g.moveTo(win.x + win.w * 0.1, GY + 4); g.lineTo(win.x + win.w * 0.9, GY + 4); g.lineTo(win.x + win.w * 1.3, GY + 300); g.lineTo(win.x + win.w * 0.3, GY + 300); g.closePath(); g.fill(); g.restore(); }
  });
}

// =====================================================================================================
export function home3(g, t, cam, o = {}) {
  const room = o.room || 'bedroom', md = o.mood || 'day', M = { ...mood(MOODS[md] || 'day') }, GY = home3Ground(), CX = E.W / 2, L = LIGHT[md] ?? 1;
  const P = clamp(o.lights ?? (md === 'night' ? 1 : md === 'day' ? 0.3 : 0.75)), night = md === 'night', dawn = md === 'dawn';
  const base = { M, GY, CX, L, night, dawn };
  let pos = {}, after = [];
  if (room === 'bathroom') pos = bathroom(g, t, cam, o, base, P, after);
  else if (room === 'kitchen') pos = kitchen(g, t, cam, o, base, P, after);
  else pos = bedroom(g, t, cam, o, base, P, after);
  // light level for the mood (set only, before the characters), then practicals glow on top
  if (L < 1) veil(g, night ? '#0a0a1e' : dawn ? '#2a1a28' : '#1a1020', (1 - L) * 0.55);
  layer(g, cam, 1, (g) => after.forEach(fn => fn(g)));
  const rim = night ? { color: '#a9c4ff', dir: [-0.8, -0.5] } : dawn ? { color: '#ffc080', dir: [-0.8, -0.4] } : { color: '#fff1d6', dir: [-0.8, -0.5] };
  return { GY, CX, M, rim, pos };
}

// ---------- BATHROOM ----------
function bathroom(g, t, cam, o, B, P, after) {
  const { GY, CX } = B, pos = { mirrorX: CX - 430, mirrorY: GY - 590, sinkX: CX - 430, sinkTop: GY - 330, showerX: CX + 450, showerL: CX + 170, showerR: CX + 740, drainX: CX + 450, drainY: GY - 26, towelX: CX - 40, windowX: CX + 450 };
  const wall = '#9ab8c0', tile = '#c8dce0';
  shell(g, t, cam, { ...B, wall, floor: '#7a8a96', win: { x: CX + 330, y: GY - 900, w: 240, h: 170, frosted: true, cols: 1, rows: 1 },
    wallFn: (g) => {
      // tiles to 2/3 height with grout, a mosaic border
      const ty = GY - 640; g.fillStyle = tile; g.fillRect(-E.W, ty, E.W * 3.2, GY - ty); g.strokeStyle = alpha('#6a8a94', 0.55); g.lineWidth = 2;
      for (let y = ty; y < GY; y += 60) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2.2, y); g.stroke(); } for (let x = -E.W; x < E.W * 2.2; x += 60) { g.beginPath(); g.moveTo(x, ty); g.lineTo(x, GY); g.stroke(); }
      for (let x = -E.W; x < E.W * 2.2; x += 30) { g.fillStyle = ['#3a7a8a', '#5aa0aa', '#2e5a6a'][Math.abs(Math.round(x / 30)) % 3]; g.fillRect(x, ty - 22, 28, 18); }
      // mirror with a light bar (the key light), a cabinet shelf with bottles
      const mx = pos.mirrorX, my = pos.mirrorY; rr(g, mx - 170, my - 50, 340, 30, 10); g.fillStyle = '#e8e4ea'; g.fill(); glow(g, mx, my - 36, 300, '#fff4dc', 0.4 + 0.3 * P);
      rr(g, mx - 160, my, 320, 260, 14); g.fillStyle = '#c0c8d0'; g.fill(); rr(g, mx - 150, my + 10, 300, 240, 10); g.fillStyle = linGrad(g, mx - 150, my, mx + 150, my + 240, ['#dfe8f0', '#9ab0c0', '#c8d8e4']); g.fill();
      g.fillStyle = alpha('#ffffff', 0.35); poly(g, [[mx - 120, my + 30], [mx - 70, my + 30], [mx - 150, my + 150], [mx - 150, my + 90]], alpha('#ffffff', 0.35));
      if ((o.steam ?? 0) > 0) { g.fillStyle = alpha('#ffffff', 0.45 * o.steam); rr(g, mx - 150, my + 10, 300, 240, 10); g.fill(); }
      g.fillStyle = '#e8e4ea'; g.fillRect(mx - 200, my + 290, 400, 14); const bc = ['#3f9a4a', '#e08aa8', '#2f6fd0', '#f2c230', '#d4262e'];
      bc.forEach((c, i) => { const bx = mx - 180 + i * 80, bh = 50 + (i % 3) * 16; rr(g, bx, my + 290 - bh, 34, bh, 8); g.fillStyle = c; g.fill(); rr(g, bx + 10, my + 290 - bh - 12, 14, 14, 3); g.fillStyle = '#e8e4ea'; g.fill(); g.fillStyle = alpha('#fff', 0.7); g.fillRect(bx + 6, my + 300 - bh, 22, 10); });
      // towel rail with the hero's green towel + Mina's small red one
      const tx = pos.towelX; seg(g, [[tx - 120, GY - 520], [tx + 120, GY - 520]], 8, '#c8ccd4');
      rr(g, tx - 110, GY - 524, 120, 240, 10); g.fillStyle = '#3f9a4a'; g.fill(); g.fillStyle = '#f4f1e8'; g.fillRect(tx - 110, GY - 330, 120, 12);
      rr(g, tx + 20, GY - 524, 80, 150, 10); g.fillStyle = '#d4262e'; g.fill();
      // shower: tiled back, head + hose, a shelf with a duck
      const sl = pos.showerL, sr = pos.showerR; g.fillStyle = alpha('#2a4a5a', 0.15); g.fillRect(sl, GY - 760, sr - sl, 760);
      seg(g, [[pos.showerX + 120, GY - 780], [pos.showerX + 120, GY - 680], [pos.showerX + 40, GY - 680]], 8, '#c8ccd4'); poly(g, [[pos.showerX + 10, GY - 690], [pos.showerX + 70, GY - 690], [pos.showerX + 60, GY - 660], [pos.showerX + 20, GY - 660]], '#b8bcc4');
      g.fillStyle = '#e8e4ea'; g.fillRect(sl + 30, GY - 460, 140, 12); circle(g, sl + 80, GY - 478, 16, '#f2c230'); circle(g, sl + 92, GY - 494, 10, '#f2c230'); poly(g, [[sl + 100, GY - 494], [sl + 112, GY - 490], [sl + 100, GY - 486]], '#f08a24');
    },
    floorFn: (g) => { g.strokeStyle = alpha('#000', 0.18); g.lineWidth = 2; for (let x = -E.W; x < E.W * 2.2; x += 90) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x - (x - CX) * 0.4, GY + 400); g.stroke(); } for (const y of [GY + 40, GY + 110, GY + 220]) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2.2, y); g.stroke(); }
      g.save(); g.translate(CX - 380, GY + 70); g.scale(1, 0.2); rr(g, -180, -120, 360, 240, 60); g.fillStyle = '#5a9ac0'; g.fill(); g.restore(); } });       // bath mat
  layer(g, cam, 1, (g) => {
    // sink pedestal + basin + tap + toothbrush cup
    const sx = pos.sinkX, st = pos.sinkTop; rr(g, sx - 50, st, 100, GY - st, 18); g.fillStyle = '#e8e4ea'; g.fill(); g.fillStyle = '#f4f2f6'; g.beginPath(); g.ellipse(sx, st, 200, 46, 0, 0, Math.PI); g.lineTo(sx - 200, st - 20); g.lineTo(sx + 200, st - 20); g.closePath(); g.fill();
    seg(g, [[sx + 40, st - 20], [sx + 40, st - 70], [sx + 10, st - 70]], 10, '#c8ccd4'); rr(g, sx - 160, st - 80, 40, 60, 8); g.fillStyle = '#9ac0e0'; g.fill(); seg(g, [[sx - 150, st - 80], [sx - 156, st - 130]], 6, '#3f9a4a'); seg(g, [[sx - 136, st - 80], [sx - 128, st - 122]], 6, '#d4262e');
    if (o.drip !== false) { const u = (t * 0.8) % 1; circle(g, sx + 10, st - 62 + u * 50, 4, alpha('#bfe4ff', 1 - u)); }
    // toilet at the left edge, laundry basket
    const lx = CX - 900; rr(g, lx - 70, GY - 330, 140, 180, 14); g.fillStyle = '#eceaf0'; g.fill(); g.fillStyle = '#f4f2f6'; g.beginPath(); g.ellipse(lx + 10, GY - 150, 120, 30, 0, 0, 7); g.fill(); rr(g, lx - 40, GY - 150, 100, 150, 20); g.fill();
    rr(g, CX + 20, GY - 150, 120, 150, 14); g.fillStyle = '#c8a070'; g.fill(); for (let i = 0; i < 5; i++) seg(g, [[CX + 30, GY - 130 + i * 28], [CX + 130, GY - 130 + i * 28]], 2, alpha('#6a4a2a', 0.5)); rr(g, CX + 40, GY - 172, 70, 30, 10); g.fillStyle = '#3f9a4a'; g.fill();
    // shower tray + drain + hair clump, glass door (drawn after, translucent)
    const sl = pos.showerL, sr = pos.showerR; rr(g, sl, GY - 40, sr - sl, 40, 6); g.fillStyle = '#eceaf0'; g.fill(); g.fillStyle = '#d8dce4'; g.beginPath(); g.ellipse((sl + sr) / 2, GY - 40, (sr - sl) / 2 - 10, 12, 0, 0, 7); g.fill();
    g.fillStyle = '#8a929c'; g.beginPath(); g.ellipse(pos.drainX, pos.drainY, 34, 9, 0, 0, 7); g.fill(); g.strokeStyle = '#5a626c'; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(pos.drainX + i * 11, pos.drainY - 7); g.lineTo(pos.drainX + i * 11, pos.drainY + 7); g.stroke(); }
    if ((o.hair ?? 0) > 0) hairClump(g, pos.drainX, pos.drainY - 2, 1.0 + 0.9 * o.hair, t);
  });
  after.push((g) => {
    const sl = pos.showerL, sr = pos.showerR; g.fillStyle = alpha('#cfe8f0', 0.16); g.fillRect(sl, GY - 780, sr - sl, 740); g.strokeStyle = alpha('#e8f4f8', 0.7); g.lineWidth = 5; g.strokeRect(sl, GY - 780, sr - sl, 740);
    poly(g, [[sl + 40, GY - 760], [sl + 120, GY - 760], [sl + 20, GY - 460], [sl + 20, GY - 620]], alpha('#ffffff', 0.18));
    if ((o.steam ?? 0) > 0) FX.dust(g, t * 0.4, { count: 14, color: '#ffffff', a: 0.25 * o.steam, seed: 6 });
    glow(g, pos.mirrorX, pos.mirrorY - 36, 260, '#fff4dc', 0.25 * P);
  });
  return pos;
}

// ---------- KITCHEN ----------
function kitchen(g, t, cam, o, B, P, after) {
  const { GY, CX } = B, pos = { fridgeX: CX + 600, fridgeTop: GY - 640, cerealX: CX + 560, cerealY: GY - 640, tableX: CX - 60, tableTop: GY - 250, plateX: CX - 60, plateY: GY - 262, counterL: CX - 1150, counterR: CX - 380, counterTop: GY - 300, windowX: CX - 760 };
  shell(g, t, cam, { ...B, wall: '#e0c89a', floor: '#8a6a52', win: { x: CX - 960, y: GY - 760, w: 400, h: 280 },
    wallFn: (g) => {
      // backsplash tiles, upper cabinets, a wall clock, fridge drawings area
      g.fillStyle = '#f0e8d8'; g.fillRect(pos.counterL, pos.counterTop - 200, pos.counterR - pos.counterL, 200); g.strokeStyle = alpha('#c8b898', 0.6); g.lineWidth = 2; for (let x = pos.counterL; x < pos.counterR; x += 40) { g.beginPath(); g.moveTo(x, pos.counterTop - 200); g.lineTo(x, pos.counterTop); g.stroke(); } for (let y = pos.counterTop - 200; y < pos.counterTop; y += 40) { g.beginPath(); g.moveTo(pos.counterL, y); g.lineTo(pos.counterR, y); g.stroke(); }
      for (let i = 0; i < 2; i++) { const cx = CX - 1150 + i * 140; rr(g, cx, GY - 860, 130, 220, 6); g.fillStyle = '#7a9a6a'; g.fill(); seg(g, [[cx + 112, GY - 680], [cx + 112, GY - 650]], 5, '#e8e0c8'); }
      for (let i = 0; i < 2; i++) { const cx = CX - 520 + i * 140; rr(g, cx - 130, GY - 860, 130, 220, 6); g.fillStyle = '#7a9a6a'; g.fill(); seg(g, [[cx - 112, GY - 680], [cx - 112, GY - 650]], 5, '#e8e0c8'); }
      FX.clock(g, CX + 160, GY - 760, 50, t * 60, { face: '#f4efe6', ink: '#1a1622', red: '#d4262e' });
      // pendant lamp (key light) over the table
      seg(g, [[pos.tableX, GY - 1000], [pos.tableX, GY - 700]], 4, '#2a2230'); g.fillStyle = '#3a3a3a'; g.beginPath(); g.moveTo(pos.tableX - 90, GY - 620); g.quadraticCurveTo(pos.tableX, GY - 730, pos.tableX + 90, GY - 620); g.closePath(); g.fill(); circle(g, pos.tableX, GY - 616, 18, P > 0.2 ? '#fff4dc' : '#8a8070');
      // shelf with jars + a plant
      g.fillStyle = '#8a6a4a'; g.fillRect(CX + 180, GY - 560, 240, 12); for (let i = 0; i < 4; i++) { rr(g, CX + 196 + i * 56, GY - 620, 40, 60, 8); g.fillStyle = ['#e8c25a', '#c86a3a', '#e8e0c8', '#8a5a3a'][i]; g.fill(); }
      circle(g, CX + 380, GY - 600, 30, '#4a8a4a');
    },
    floorFn: (g) => { g.strokeStyle = alpha('#000', 0.2); g.lineWidth = 2; for (let x = -E.W; x < E.W * 2.2; x += 120) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x - (x - CX) * 0.4, GY + 400); g.stroke(); } } });
  layer(g, cam, 1, (g) => {
    // counter: cupboards, kettle (steam), toaster, fruit bowl
    const cl = pos.counterL, cr = pos.counterR, ct = pos.counterTop; g.fillStyle = '#6a8a5a'; g.fillRect(cl, ct, cr - cl, GY - ct); g.fillStyle = '#e8e0d0'; g.fillRect(cl - 10, ct - 16, cr - cl + 20, 18);
    for (let x = cl + 10; x < cr - 100; x += 190) { rr(g, x, ct + 20, 180, GY - ct - 40, 6); g.strokeStyle = alpha('#000', 0.25); g.lineWidth = 3; g.stroke(); seg(g, [[x + 150, ct + 50], [x + 150, ct + 100]], 5, '#e8e0c8'); }
    rr(g, cl + 80, ct - 110, 90, 96, 22); g.fillStyle = '#d4262e'; g.fill(); seg(g, [[cl + 170, ct - 80], [cl + 200, ct - 100]], 8, '#d4262e'); rr(g, cl + 100, ct - 124, 50, 16, 6); g.fillStyle = '#2a2230'; g.fill();
    if ((o.steam ?? 0.5) > 0) for (let i = 0; i < 4; i++) { const u = (t * 0.5 + i / 4) % 1; circle(g, cl + 205 + u * 20, ct - 110 - u * 90, 10 + u * 18, alpha('#ffffff', 0.3 * (1 - u) * (o.steam ?? 0.5))); }
    rr(g, cl + 300, ct - 80, 140, 66, 14); g.fillStyle = '#c8ccd4'; g.fill(); g.fillStyle = '#2a2230'; g.fillRect(cl + 330, ct - 80, 30, 6); g.fillRect(cl + 380, ct - 80, 30, 6);
    g.fillStyle = '#c87a3a'; g.beginPath(); g.ellipse(cl + 580, ct - 20, 80, 26, 0, 0, Math.PI); g.fill(); for (const [dx, c] of [[-40, '#f2c230'], [0, '#d4262e'], [40, '#5aa04a']]) circle(g, cl + 580 + dx, ct - 36, 24, c);
    // fridge with magnets, a drawing, a list; the cereal box hidden on top
    const fx = pos.fridgeX, ft = pos.fridgeTop; rr(g, fx - 160, ft, 320, GY - ft, 18); g.fillStyle = linGrad(g, fx - 160, 0, fx + 160, 0, ['#e8ecf0', '#c8ccd4']); g.fill(); seg(g, [[fx - 160, ft + 220], [fx + 160, ft + 220]], 4, '#9aa0a8'); seg(g, [[fx + 120, ft + 60], [fx + 120, ft + 170]], 8, '#9aa0a8'); seg(g, [[fx + 120, ft + 260], [fx + 120, ft + 380]], 8, '#9aa0a8');
    g.save(); g.translate(fx - 60, ft + 320); g.rotate(-0.06); g.fillStyle = '#fff'; g.fillRect(-70, -60, 140, 120); circle(g, -20, -10, 22, '#f2c230'); seg(g, [[-50, 40], [50, 40]], 6, '#3a9a4a'); g.restore(); circle(g, fx - 60, ft + 256, 9, '#d4262e');
    g.save(); g.translate(fx + 40, ft + 470); g.rotate(0.05); g.fillStyle = '#fffbe8'; g.fillRect(-50, -70, 100, 140); for (let i = 0; i < 5; i++) seg(g, [[-38, -44 + i * 24], [30 - (i % 2) * 20, -44 + i * 24]], 3, '#4a4650'); g.restore(); circle(g, fx + 40, ft + 404, 9, '#2f6fd0');
    if ((o.cereal ?? 1) > 0) cerealBox(g, pos.cerealX + 40, ft + 4, 0.95, -0.04);
    // table + two chairs + the plate
    const tx = pos.tableX, tt = pos.tableTop; g.fillStyle = '#8a5a3a'; rr(g, tx - 300, tt - 16, 600, 26, 8); g.fill(); seg(g, [[tx - 260, tt], [tx - 250, GY]], 14, '#6a4028'); seg(g, [[tx + 260, tt], [tx + 250, GY]], 14, '#6a4028');
    FX.chair(g, tx - 380, GY, 1.6, '#5a3a28');
    if ((o.plate ?? 1) > 0) plate700(g, pos.plateX, pos.plateY, 1.2, { kcal: o.kcal ?? 1 });
    rr(g, tx + 150, tt - 70, 40, 56, 8); g.fillStyle = alpha('#bfe4ff', 0.7); g.fill();                                       // glass of water
  });
  after.push((g) => { glow(g, pos.tableX, GY - 600, 520, '#ffd9a0', 0.32 * P); FX.pool(g, pos.tableX, pos.tableTop, 420, 60, '#ffd9a0', 0.25 * P); });
  return pos;
}

// ---------- BEDROOM (training corner) ----------
function bedroom(g, t, cam, o, B, P, after) {
  const { GY, CX } = B, pos = { calX: CX + 160, calY: GY - 700, matX: CX + 200, matL: CX - 80, matR: CX + 480, bedX: CX - 700, bedTop: GY - 170, standX: CX - 300, standTop: GY - 190, clockX: CX - 300, clockY: GY - 214, windowX: CX - 640, posterXs: [CX + 560, CX + 820] };
  shell(g, t, cam, { ...B, wall: '#6a7aa0', floor: '#7a5a48', win: { x: CX - 860, y: GY - 820, w: 440, h: 320 },
    wallFn: (g) => {
      calendar(g, pos.calX, pos.calY, 1, { marks: o.marks ?? 12, month: o.month || 'MARCH', hl: o.hl });
      // posters: a mountain with KEEP GOING, a runner silhouette, a curls doodle
      const [p1, p2] = pos.posterXs; rr(g, p1 - 110, GY - 820, 220, 300, 6); g.fillStyle = '#2a3a5a'; g.fill(); poly(g, [[p1 - 90, GY - 560], [p1 - 20, GY - 720], [p1 + 30, GY - 640], [p1 + 60, GY - 690], [p1 + 95, GY - 560]], '#e8e4f0'); text(g, 'KEEP GOING', p1, GY - 790, { size: 30, color: '#f2c230', font: FONTS.title, weight: 700 });
      rr(g, p2 - 90, GY - 780, 180, 250, 6); g.fillStyle = '#d4262e'; g.fill(); const r = '#1a1020'; circle(g, p2 + 10, GY - 720, 16, r); seg(g, [[p2 + 4, GY - 702], [p2 - 10, GY - 650]], 10, r); seg(g, [[p2 - 10, GY - 650], [p2 + 26, GY - 614], [p2 + 10, GY - 580]], 9, r); seg(g, [[p2 - 10, GY - 650], [p2 - 40, GY - 610], [p2 - 66, GY - 616]], 9, r); seg(g, [[p2 + 2, GY - 690], [p2 + 36, GY - 676]], 8, r); seg(g, [[p2 + 2, GY - 690], [p2 - 32, GY - 700]], 8, r);
      text(g, '10 km', p2, GY - 560, { size: 30, color: '#fff1dc', font: FONTS.ui, weight: 900 });
      // hooks: the spare sweatband + a towel; a shelf with textbooks and a trophy
      seg(g, [[CX + 640, GY - 480], [CX + 920, GY - 480]], 6, '#3a2a28'); ring(g, CX + 700, GY - 440, 26, 9, '#f4f1e8'); seg(g, [[CX + 680, GY - 444], [CX + 720, GY - 444]], 4, '#3f9a4a'); rr(g, CX + 800, GY - 476, 70, 160, 10); g.fillStyle = '#e8a03a'; g.fill();
      g.fillStyle = '#5a3a2a'; g.fillRect(pos.windowX - 220, GY - 420, 0, 0);
    },
    floorFn: (g) => { g.strokeStyle = alpha('#000', 0.22); g.lineWidth = 2; for (let y = GY + 30; y < GY + 420; y += 34 + (y - GY) * 0.15) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2.2, y); g.stroke(); }
      g.save(); g.translate(CX - 380, GY + 120); g.scale(1, 0.16); circle(g, 0, 0, 360, '#4a3a5a'); circle(g, 0, 0, 280, '#5a4a6a'); g.restore(); } });
  layer(g, cam, 1, (g) => {
    // bed (edge of frame left), nightstand with the alarm clock + lamp, books
    const bx = pos.bedX; g.fillStyle = '#3a2a28'; g.fillRect(bx - 400, GY - 110, 640, 110); rr(g, bx - 410, GY - 170, 650, 70, 16); g.fillStyle = '#e8e4f0'; g.fill(); rr(g, bx - 390, GY - 200, 630, 80, 24); g.fillStyle = '#3f6a8a'; g.fill(); rr(g, bx + 120, GY - 210, 110, 40, 16); g.fillStyle = '#f4f1e8'; g.fill();
    rr(g, bx + 240, GY - 420, 30, 420, 8); g.fillStyle = '#4a3430'; g.fill();
    const sx = pos.standX; rr(g, sx - 70, pos.standTop, 140, GY - pos.standTop, 8); g.fillStyle = '#5a4038'; g.fill(); g.fillStyle = '#6a4a40'; g.fillRect(sx - 76, pos.standTop - 8, 152, 12); seg(g, [[sx - 40, pos.standTop + 70], [sx + 40, pos.standTop + 70]], 4, '#c8a070');
    alarmClock(g, pos.clockX + 10, pos.standTop - 8, 1, t, { time: o.clock || '5:30', ring: o.ring ?? o.alarm ?? 0 });
    seg(g, [[sx - 46, pos.standTop - 8], [sx - 46, pos.standTop - 90]], 4, '#3a3030'); poly(g, [[sx - 72, pos.standTop - 126], [sx - 20, pos.standTop - 126], [sx - 30, pos.standTop - 90], [sx - 62, pos.standTop - 90]], '#e8c890');
    // exercise mat (green) + water bottle + running shoes + the backpack of textbooks
    if ((o.mat ?? 1) > 0) { g.save(); g.translate(pos.matX, GY + 40); g.scale(1, 0.22); rr(g, -(pos.matR - pos.matL) / 2, -110, pos.matR - pos.matL, 220, 30); g.fillStyle = '#3f9a4a'; g.fill(); g.strokeStyle = shade('#3f9a4a', -0.3); g.lineWidth = 8; g.stroke(); g.restore(); }
    rr(g, pos.matR + 40, GY - 90, 44, 96, 12); g.fillStyle = '#2f6fd0'; g.fill(); rr(g, pos.matR + 50, GY - 104, 24, 18, 4); g.fillStyle = '#e8e4ea'; g.fill();
    for (const dx of [0, 70]) { g.fillStyle = '#9aa0a8'; g.beginPath(); g.ellipse(pos.matR + 170 + dx, GY - 14, 34, 16, 0, Math.PI, 0); g.fill(); g.fillStyle = '#e8e4ea'; g.fillRect(pos.matR + 136 + dx, GY - 6, 68, 8); }
    rr(g, pos.matL - 260, GY - 180, 150, 180, 30); g.fillStyle = '#5a4a8a'; g.fill(); rr(g, pos.matL - 240, GY - 210, 110, 40, 6); g.fillStyle = '#c86a3a'; g.fill(); rr(g, pos.matL - 230, GY - 222, 90, 20, 4); g.fillStyle = '#2f6fd0'; g.fill();
  });
  after.push((g) => { if (B.dawn) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { g.fillStyle = alpha('#ffc080', 0.06); g.beginPath(); g.moveTo(pos.windowX - 180 + i * 90, GY - 800); g.lineTo(pos.windowX - 120 + i * 90, GY - 800); g.lineTo(pos.windowX + 520 + i * 140, GY + 60); g.lineTo(pos.windowX + 380 + i * 140, GY + 60); g.closePath(); g.fill(); } g.restore(); }
    glow(g, pos.standX - 46, pos.standTop - 110, 220, '#ffd9a0', 0.35 * P); if ((o.ring ?? o.alarm ?? 0) > 0) glow(g, pos.clockX, pos.clockY, 120, '#ff4a3a', 0.4 * (0.5 + 0.5 * Math.sin(t * 20))); });
  return pos;
}

export function home3Fg(g, t, cam, o = {}) {
  const GY = home3Ground(), CX = E.W / 2, room = o.room || 'bedroom';
  blurLayer(g, 12, (g) => {
    if (room === 'bathroom') { rr(g, CX + 820, GY - 600, 200, 900, 20); g.fillStyle = '#2f6a3a'; g.fill(); g.fillStyle = '#e8e4ea'; g.fillRect(CX + 820, GY + 40, 200, 30); }
    else if (room === 'kitchen') { seg(g, [[CX - 980, GY + 400], [CX - 960, GY - 60], [CX - 700, GY - 60], [CX - 680, GY + 400]], 30, '#4a2a1a'); }
    else { const c = shade('#1f4a3c', -0.4); for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.25 + Math.sin(t * 0.6 + i) * 0.03; g.save(); g.translate(CX + 960, GY + 160); g.rotate(a); g.fillStyle = c; g.beginPath(); g.ellipse(0, -140, 36, 150, 0, 0, 7); g.fill(); g.restore(); } }
  }, cam, 1.6);
}

// =====================================================================================================
// PROPS
// =====================================================================================================
export function hairClump(g, x, y, s = 1, t = 0) {
  const r = rng(91); g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round';
  g.fillStyle = alpha('#140f14', 0.85); g.beginPath(); g.ellipse(0, 0, 30, 10, 0, 0, 7); g.fill();
  for (let i = 0; i < 26; i++) { const a0 = r() * 7, rx = 6 + r() * 26, ry = 3 + r() * 9, cx = (r() - 0.5) * 30, cy = (r() - 0.5) * 8; g.strokeStyle = i % 3 ? '#1a1418' : '#2e2228'; g.lineWidth = 1.6 + r() * 1.6; g.beginPath(); g.ellipse(cx, cy, rx * 0.5, ry * 0.5, a0, 0, Math.PI * (1.2 + r())); g.stroke(); }
  for (let i = 0; i < 5; i++) { const a = r() * Math.PI - Math.PI, L = 16 + r() * 20; g.strokeStyle = '#1a1418'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * L * 0.6 + 6, Math.sin(a) * L * 0.3 - 6, Math.cos(a) * L, Math.sin(a) * L * 0.3 + Math.sin(t * 2 + i) * 1.5); g.stroke(); }
  g.fillStyle = alpha('#bfe4ff', 0.5); circle(g, 14, -4, 3, alpha('#ffffff', 0.6)); g.restore();
}
export function cerealBox(g, x, y, s = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -70, -200, 140, 200, 6); g.fillStyle = linGrad(g, 0, -200, 0, 0, ['#f08a24', '#d45a1a']); g.fill(); g.fillStyle = '#c84a14'; g.fillRect(52, -200, 18, 200);
  rr(g, -58, -184, 104, 46, 10); g.fillStyle = '#fff1dc'; g.fill(); text(g, 'CRUNCH', -6, -160, { size: 26, color: '#d4262e', font: FONTS.title, weight: 700 });
  g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(-6, -66, 50, 20, 0, 0, Math.PI); g.fill(); for (let i = 0; i < 7; i++) circle(g, -40 + i * 12, -72 - (i % 2) * 6, 7, '#e8a03a');
  circle(g, -30, -106, 10, '#fff'); circle(g, -30, -106, 5, '#1a1020'); text(g, '★', 26, -110, { size: 30, color: '#f2c230', font: FONTS.ui, weight: 900 });
  g.restore();
}
export function plate700(g, x, y, s = 1, o = {}) {
  const U = ui(); g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = alpha('#000', 0.25); g.beginPath(); g.ellipse(4, 8, 120, 28, 0, 0, 7); g.fill();
  g.fillStyle = '#f4f1ec'; g.beginPath(); g.ellipse(0, 0, 120, 28, 0, 0, 7); g.fill(); g.fillStyle = '#e4e0da'; g.beginPath(); g.ellipse(0, -2, 90, 19, 0, 0, 7); g.fill();
  g.fillStyle = '#f4eee0'; g.beginPath(); g.ellipse(-36, -12, 44, 18, 0, Math.PI, 0); g.fill();                                               // rice
  g.fillStyle = '#c87a3a'; g.beginPath(); g.ellipse(24, -14, 40, 16, -0.1, Math.PI, 0); g.fill(); seg(g, [[6, -18], [40, -22]], 3, '#8a4a1a');   // chicken
  for (let i = 0; i < 4; i++) { circle(g, -10 + i * 14, -6 - (i % 2) * 6, 9, '#3a8a3a'); seg(g, [[-10 + i * 14, 0], [-10 + i * 14, -6]], 3, '#5aa04a'); }   // broccoli
  const k = ease.outBack(clamp(o.kcal ?? 1)); if (k > 0.02) { seg(g, [[110, -6], [150, -60]], 2, alpha(U.cream, 0.8)); g.save(); g.translate(170, -80); g.scale(k, k); g.rotate(-0.08); rr(g, -74, -26, 148, 52, 10); g.fillStyle = '#140f18'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); text(g, '700 kcal', 0, 2, { size: 30, color: U.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
  g.restore();
}
export function calendar(g, x, y, s = 1, o = {}) {
  const marks = o.marks ?? 0, W = 320, H = 300; g.save(); g.translate(x, y); g.scale(s, s);
  seg(g, [[0, -20], [0, 0]], 3, '#2a2230'); circle(g, 0, -22, 5, '#5a5260');
  rr(g, -W / 2 + 6, 8, W, H, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill(); rr(g, -W / 2, 0, W, H, 8); g.fillStyle = '#fbf7ee'; g.fill();
  g.fillStyle = '#d4262e'; g.fillRect(-W / 2, 0, W, 54); text(g, o.month || 'MARCH', 0, 28, { size: 30, color: '#fff', font: FONTS.title, weight: 700, spacing: 3 });
  for (let i = 0; i < 6; i++) circle(g, -W / 2 + 30 + i * 52, 0, 6, '#5a5260');
  for (let d = 0; d < 31; d++) { const c = d % 7, r = Math.floor(d / 7), cx = -W / 2 + 26 + c * 44.5, cy = 76 + r * 44;
    text(g, String(d + 1), cx, cy, { size: 16, color: '#4a4650', font: FONTS.ui, weight: 800 });
    if (d < marks) { g.strokeStyle = '#d4262e'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 13, cy - 12); g.lineTo(cx + 13, cy + 12); g.moveTo(cx + 13, cy - 12); g.lineTo(cx - 13, cy + 12); g.stroke(); }
    if (o.hl === d + 1) { g.strokeStyle = ui().gold; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.stroke(); } }
  g.restore();
}
export function alarmClock(g, x, y, s = 1, t = 0, o = {}) {
  const ring = clamp(o.ring ?? 0), sh = ring * Math.sin(t * 60) * 4; g.save(); g.translate(x + sh, y); g.scale(s, s); g.rotate(ring * Math.sin(t * 47) * 0.05);
  seg(g, [[-30, 0], [-38, 12]], 5, '#2a2230'); seg(g, [[30, 0], [38, 12]], 5, '#2a2230');
  rr(g, -54, -58, 108, 62, 12); g.fillStyle = '#2a2a34'; g.fill(); rr(g, -46, -50, 92, 42, 6); g.fillStyle = '#0a0606'; g.fill();
  text(g, o.time || '5:30', 0, -28, { size: 30, color: '#ff3b2e', font: FONTS.ui, weight: 900, glow: 10, glowColor: 'rgba(255,60,40,.8)' });
  if (ring > 0) { g.strokeStyle = alpha('#fff1dc', ring); g.lineWidth = 3; for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(sd * 60, -30, 12 + i * 12, sd < 0 ? Math.PI * 0.7 : -Math.PI * 0.3, sd < 0 ? Math.PI * 1.3 : Math.PI * 0.3); g.stroke(); } }
  g.restore();
}

// Mina's HAIR LOG notebook: open spread, red-marker title, rows of dates + counts with doodles; reveal 0..1 writes the rows on
export const HAIR_ROWS = [['WEEK 1', 'curls: big'], ['MONTH 3', 'still curly'], ['YEAR 1', '100 hairs/day'], ['YEAR 2', 'normal!'], ['DAY 1,095', 'STILL HERE']];
export function hairLog(g, t, o = {}) {
  const U = ui(), x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, s = o.s ?? 1, rows = o.rows || HAIR_ROWS, rv = o.reveal ?? 1, W = 920, H = 600;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.04); g.scale(s, s);
  rr(g, -W / 2 + 14, -H / 2 + 18, W, H, 14); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();
  rr(g, -W / 2 - 12, -H / 2 - 10, W + 24, H + 20, 16); g.fillStyle = '#d4262e'; g.fill();                                          // red cover
  for (const side of [-1, 1]) { g.fillStyle = linGrad(g, side * W / 2, 0, 0, 0, ['#f8f0dc', '#efe4c8']); g.fillRect(side < 0 ? -W / 2 : 0, -H / 2, W / 2, H); }
  g.fillStyle = linGrad(g, -30, 0, 30, 0, ['rgba(0,0,0,0)', 'rgba(0,0,0,.25)', 'rgba(0,0,0,0)']); g.fillRect(-30, -H / 2, 60, H);
  for (let i = 0; i < 10; i++) { const ly = -H / 2 + 90 + i * 50; seg(g, [[-W / 2 + 20, ly], [-30, ly]], 1.5, alpha('#8aa8d8', 0.5)); seg(g, [[30, ly], [W / 2 - 20, ly]], 1.5, alpha('#8aa8d8', 0.5)); }
  // left page: title + a curls doodle + the tape measure strip taped in
  text(g, 'HAIR LOG', -W / 4, -H / 2 + 54, { size: 58, color: '#d4262e', font: FONTS.title, weight: 700, spacing: 4 });
  text(g, 'by Mina', -W / 4 + 120, -H / 2 + 100, { size: 24, color: '#4a4650', font: FONTS.serif, weight: 900, italic: true });
  const dx = -W / 4, dy = -10; circle(g, dx, dy + 60, 56, '#1a1418'); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.0 + i * 0.125); circle(g, dx + Math.cos(a) * 58, dy + 60 + Math.sin(a) * 58, 22, '#1a1418'); }
  seg(g, [[dx - 30, dy + 62], [dx - 14, dy + 62]], 4, '#f4efe6'); seg(g, [[dx + 14, dy + 62], [dx + 30, dy + 62]], 4, '#f4efe6'); g.strokeStyle = '#3f9a4a'; g.lineWidth = 9; g.beginPath(); g.arc(dx, dy + 60, 62, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
  for (const [hx, hy] of [[dx - 120, dy - 60], [dx + 130, dy + 130]]) text(g, '♥', hx, hy, { size: 34, color: '#e08aa8', font: FONTS.ui, weight: 900 });
  tapeMeasure(g, -W / 2 + 40, H / 2 - 70, W / 2 - 90, { s: 0.7, ext: 1, rot: 0 });
  // right page rows
  rows.forEach(([a, b], i) => { const k = clamp(rv * rows.length - i); if (k <= 0) return; const ly = -H / 2 + 120 + i * 92;
    g.save(); g.beginPath(); g.rect(40, ly - 40, (W / 2 - 60) * k, 80); g.clip(); g.rotate(-0.01 * (i % 2));
    text(g, a, 60, ly, { size: 36, color: '#2a2630', font: FONTS.title, weight: 700, align: 'left' }); text(g, b, 260, ly, { size: 32, color: i === rows.length - 1 ? shade(U.gold, -0.3) : '#4a4650', font: FONTS.title, weight: 600, align: 'left' });
    if (k >= 1) { g.strokeStyle = '#3f9a4a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(W / 2 - 70, ly); g.lineTo(W / 2 - 58, ly + 12); g.lineTo(W / 2 - 36, ly - 14); g.stroke(); }
    g.restore(); });
  g.restore();
}
// a yellow tape measure: case at (x, y), tape extended to the right by len * ext
export function tapeMeasure(g, x, y, len, o = {}) {
  const s = o.s ?? 1, ext = clamp(o.ext ?? 1), L = len * ext / s; g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  g.fillStyle = linGrad(g, 0, -18, 0, 18, ['#ffe066', '#f2c230', '#d8a820']); g.fillRect(40, -18, L, 36); g.strokeStyle = '#a07a10'; g.lineWidth = 2; g.strokeRect(40, -18, L, 36);
  for (let i = 0; i * 12 < L; i++) { const xx = 40 + i * 12, big = i % 10 === 0; seg(g, [[xx, -18], [xx, big ? 2 : i % 5 === 0 ? -6 : -10]], big ? 2.5 : 1.5, '#2a2018'); if (big && i) text(g, String(i), xx + 2, 8, { size: 14, color: '#2a2018', font: FONTS.ui, weight: 900, align: 'left' }); }
  rr(g, 36 + L, -22, 10, 44, 2); g.fillStyle = '#8a8a92'; g.fill();
  rr(g, -50, -50, 100, 100, 28); g.fillStyle = '#2a2a34'; g.fill(); circle(g, 0, 0, 30, '#f2c230'); circle(g, 0, 0, 12, '#2a2a34'); rr(g, 30, -22, 22, 44, 4); g.fillStyle = '#3a3a44'; g.fill();
  g.restore();
}

// =====================================================================================================
// TIME-SKIP CARD (tear-off calendar page that flips up and away)
// =====================================================================================================
export const skipTimes = (keys) => keys.slice(1).map(k => k[0]);
function skipPage(g, w, h, label, sub) {
  const U = ui(); rr(g, -w / 2, 0, w, h, 14); g.fillStyle = linGrad(g, 0, 0, 0, h, ['#fffaf0', '#efe6d4']); g.fill(); g.strokeStyle = alpha('#000', 0.15); g.lineWidth = 2; g.stroke();
  g.fillStyle = '#d4262e'; rr(g, -w / 2, 0, w, h * 0.2, 14); g.fill(); g.fillRect(-w / 2, h * 0.12, w, h * 0.08); text(g, sub || 'TRAINING', 0, h * 0.1, { size: h * 0.09, color: '#fff', font: FONTS.ui, weight: 900, spacing: 6 });
  const fs = Math.min(h * 0.36, (w * 0.86) / Math.max(1, measure(g, label, 100, FONTS.title, 700) / 100));
  text(g, label, 4, h * 0.6 + 6, { size: fs, color: 'rgba(0,0,0,.25)', font: FONTS.title, weight: 700 });
  text(g, label, 0, h * 0.6, { size: fs, color: '#1a1420', font: FONTS.title, weight: 700 });
  seg(g, [[-w * 0.3, h * 0.86], [w * 0.3, h * 0.86]], 3, alpha(U.gold, 0.9));
}
export function timeSkip(g, t, o = {}) {
  const keys = o.keys || [[0, o.label || 'WEEK 1']], x = o.x ?? E.W / 2, y = o.y ?? E.H * 0.2, s = o.s ?? 1, w = 620, h = 520, flip = o.flip ?? 0.45, U = ui();
  let i = 0; for (let j = 0; j < keys.length; j++) if (t >= keys[j][0]) i = j;
  if (i > 0 && o.onTick && t - keys[i][0] >= 0 && t - keys[i][0] < 1 / 24) o.onTick(i, keys[i][0]);
  const k = i > 0 ? clamp((t - keys[i][0]) / flip) : 1, pop = ease.outBack(prog(t, keys[0][0], keys[0][0] + 0.4));
  if (pop <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(s * pop, s * pop);
  glow(g, 0, h * 0.5, w * 0.9, U.gold, 0.14);
  rr(g, -w / 2 + 10, 14, w, h, 14); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();                               // shadow + backing pad
  for (let p = 3; p >= 1; p--) { rr(g, -w / 2 + p * 3, p * 5, w, h, 14); g.fillStyle = shade('#efe6d4', -0.08 * p); g.fill(); }
  skipPage(g, w, h, keys[i][1], keys[i][2]);                                                                    // the new page
  if (k < 1) {                                                                                                  // the old page flips up over the binding and away
    const a = ease.in(k), sy = Math.cos(a * Math.PI * 0.95), lift = -a * 80;
    g.save(); g.translate(a * 120, lift); g.rotate(-a * 0.5); g.scale(1, Math.max(0.02, Math.abs(sy))); if (sy < 0) g.scale(1, -1);
    g.globalAlpha *= 1 - clamp((k - 0.75) * 4); skipPage(g, w, h, keys[i - 1][1], keys[i - 1][2]); g.fillStyle = `rgba(0,0,0,${0.3 * a})`; rr(g, -w / 2, 0, w, h, 14); g.fill(); g.restore();
  }
  for (let r = 0; r < 7; r++) { const rx = -w / 2 + 60 + r * (w - 120) / 6; ring(g, rx, 0, 14, 6, '#5a5262'); circle(g, rx, 10, 5, '#1a1420'); }  // binding rings
  g.restore();
  return { label: keys[i][1], flipping: k < 1 };
}

// =====================================================================================================
// FILMING UI (Dev's phone)
// =====================================================================================================
const pad2 = (n) => String(Math.floor(n)).padStart(2, '0');
const tc = (sec) => `${pad2(sec / 3600)}:${pad2((sec / 60) % 60)}:${pad2(sec % 60)}`;
function recUI(g, t, W, H, o) {
  const U = ui(), m = Math.min(W, H) * 0.05, sec = (o.sec0 ?? 0) + Math.max(0, t - (o.at ?? 0)), on = t >= (o.at ?? 0), sz = Math.min(W, H) * 0.06;
  g.strokeStyle = alpha('#ffffff', 0.9); g.lineWidth = Math.max(2, sz * 0.12); const L = sz * 1.6;
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke(); }
  if (on && Math.floor(t * 1.6) % 2 === 0) circle(g, m + sz * 1.2, m + sz * 1.6, sz * 0.38, '#ff3b30');
  text(g, on ? 'REC' : 'READY', m + sz * 1.9, m + sz * 1.62, { size: sz * 0.8, color: '#fff', font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  rr(g, W / 2 - sz * 3.4, m + sz * 0.9, sz * 6.8, sz * 1.4, sz * 0.3); g.fillStyle = on ? 'rgba(220,40,40,.85)' : 'rgba(0,0,0,.5)'; g.fill();
  text(g, tc(sec), W / 2, m + sz * 1.62, { size: sz * 0.85, color: '#fff', font: FONTS.ui, weight: 900, spacing: 2 });
  rr(g, W - m - sz * 2.6, m + sz * 1.1, sz * 1.8, sz * 0.9, sz * 0.15); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#5fd39a'; g.fillRect(W - m - sz * 2.45, m + sz * 1.25, sz * 1.1, sz * 0.6);
  text(g, '4K · 60', W - m - sz * 0.4, H - m - sz * 0.9, { size: sz * 0.6, color: '#fff', font: FONTS.ui, weight: 900, align: 'right' });
  const fx = W * (o.focusX ?? 0.5), fy = H * (o.focusY ?? 0.5), fk = 1 + 0.25 * Math.max(0, 1 - (t - (o.at ?? 0)) * 3); g.strokeStyle = alpha(U.gold, 0.9); g.lineWidth = 2; g.strokeRect(fx - sz * 1.4 * fk, fy - sz * 1.4 * fk, sz * 2.8 * fk, sz * 2.8 * fk);
  g.strokeStyle = alpha('#ffffff', 0.18); g.lineWidth = 1; for (const u of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(W * u, 0); g.lineTo(W * u, H); g.moveTo(0, H * u); g.lineTo(W, H * u); g.stroke(); }
}
export function filmFrame(g, t, o = {}) { g.save(); recUI(g, t, E.W, E.H, o); g.restore(); }
export function filmPhone(g, t, o = {}, content) {
  const x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, s = o.s ?? 1, W = 760, H = 430;                        // phone held landscape (filming)
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); g.translate(-W / 2, -H / 2);
  rr(g, 10, 14, W, H, 48); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill(); rr(g, 0, 0, W, H, 48); g.fillStyle = '#16121c'; g.fill(); g.strokeStyle = '#4a4454'; g.lineWidth = 4; g.stroke();
  const sx = 40, sy = 18, sw = W - 80, sh = H - 36; g.save(); rr(g, sx, sy, sw, sh, 30); g.clip(); g.translate(sx, sy);
  g.fillStyle = '#0a0a12'; g.fillRect(0, 0, sw, sh); if (content) { g.save(); g.scale(sw / E.W, sh / E.H); content(g, E.W, E.H); g.restore(); }
  recUI(g, t, sw, sh, o); g.restore();
  circle(g, W - 18, H / 2, 10, '#2a2632'); circle(g, W - 18, H / 2, 4, '#5a6a8a');                               // lens bump
  g.fillStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + sw * 0.4, sy); g.lineTo(sx, sy + sh * 0.7); g.closePath(); g.fill();
  g.restore();
}
