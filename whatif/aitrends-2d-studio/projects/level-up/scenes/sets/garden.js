// sets/garden.js — the family GARDEN + SHED (What If ep 4 "What If You Had Spider Powers?"), 16:9.
// LEGAL: an ordinary back garden; nothing here references any famous web-slinging hero (no city skyline swinging, no web logos).
//
//   const G = garden(g, t, cam, { view, mood: 'morning'|'day'|'dusk'|'night', storm: 0..1, flash: 0..1, ...view opts })   // BEFORE characters
//   gardenFg(g, t, cam, { view, storm })   blurred foreground (leaves / a shed shelf edge / fence post) + rain in front + motes, AFTER characters
//   Returns { GY, CX, M, rim, pos, gust, view }   gust = the current wind bend (-1..1, use it for hair, scarf, Biscuit's fur)
//   storm 0..1: dark clouds, rain at the wind angle, gusts that bend the apple tree, flap the washing and shake the fence; flash 0..1 = a
//   lightning frame (sky + set flash white-blue, a bolt behind the house). lightningAt(t, times) -> 0..1 flash envelope for `flash`.
//
//   view 'shed'    shed interior: plank walls, dusty shelves (paint tins, jars, flowerpots), a pegboard of tools (rake, spade, shears),
//                  the BIKE PUMP (red barrel, black hose) on the bottom shelf, Mina's small bike leaning, the window with a corner COBWEB
//                  and a dusty sunbeam (godRays), dust motes.   { door: 0..1 (open, daylight spills in) }
//                  pos: { pumpX, pumpY, windowX, windowY, webX, webY (the cobweb corner: where Pip lives), shelfY, benchX, benchTop, doorX }
//   view 'garden'  the back garden wide: the house's back wall (left) with the back step + door, the lawn, the wooden fence at the back,
//                  the washing line across, the APPLE TREE (right of centre), the shed (right), a bird feeder, flower bed, a ball.
//                  pos: { stepX, stepTop, doorX, fenceTop, fenceX0, fenceX1, lineY, treeX, branchX, branchY, shedX, pipeX }
//   view 'wall'    close on the house back wall for climbing: brick, the DRAINPIPE (brackets, a kink, the gutter at the top), two windows
//                  (one lit warm), ivy, a downpipe shoe at the bottom.   pos: { pipeX, pipeTop, pipeBottom, gutterY, winX[], winY, sillY }
//   view 'tree'    the apple tree close: trunk, forks, apples; the branch where Biscuit gets stuck (pos.branchX/Y, the cat sits there),
//                  { scarf: true } snags Mina's red scarf on a higher twig (flaps with the gust).   pos: { trunkX, branchX, branchY, scarfX, scarfY, groundY }
// Scale: figures at s 1.9 = 1.75 m (1 m = 260 units). Deterministic (t, rng, noise).
import { E, mood, layer, backdrop, rr, seg, circle, poly, ring, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const gardenGround = () => E.H * 0.8;
function moodOf(name, storm) {
  let m;
  if (name === 'morning') m = { ...mood('golden'), sky: ['#7a90c8', '#c8d8ee', '#fbe6c8'], key: '#fff0d0', rim: '#ffe0b0' };
  else if (name === 'night') m = { ...mood('night') };
  else if (name === 'dusk') m = { ...mood('dusk') };
  else m = { ...mood('day') };
  if (storm > 0) { const k = storm; m = { ...m, sky: m.sky.map((c) => mix(c, '#2a3040', 0.75 * k)), key: mix(m.key, '#aab8d0', k), rim: mix(m.rim, '#c8d4ee', k), grass: mix(m.grass, '#2a4030', 0.5 * k) }; }
  return m;
}
export function lightningAt(t, times = []) { let k = 0; for (const t0 of times) { const u = t - t0; if (u >= 0 && u < 0.5) k = Math.max(k, u < 0.06 ? 1 : u < 0.12 ? 0.3 : u < 0.18 ? 0.85 : Math.exp(-(u - 0.18) * 12) * 0.6); } return k; }
const gustOf = (t, storm) => storm <= 0 ? Math.sin(t * 0.8) * 0.05 : storm * (0.55 + 0.35 * Math.sin(t * 0.9) + 0.3 * noise(t * 1.7, 4));

// ---------- props ----------
function appleTree(g, x, gy, s, t, gust, M, o = {}) {
  const bark = shade('#5a4030', o.dark ? -0.3 : 0), leaf = mix(M.grass || '#4f8a55', '#3a6a3a', 0.4), bend = gust * 22 * s;
  // trunk + forks (the branch where the cat gets stuck goes out to the right)
  seg(g, [[x - 24 * s, gy], [x - 10 * s, gy - 200 * s], [x + 6 * s, gy - 330 * s]], 44 * s, bark);
  seg(g, [[x, gy - 300 * s], [x - 120 * s + bend * 0.5, gy - 470 * s]], 22 * s, bark);
  seg(g, [[x, gy - 290 * s], [x + 210 * s + bend * 0.6, gy - 390 * s], [x + 320 * s + bend, gy - 400 * s]], 16 * s, bark);   // THE branch
  seg(g, [[x + 6 * s, gy - 330 * s], [x + 60 * s + bend * 0.7, gy - 560 * s]], 18 * s, bark);
  // canopy blobs, bending with the wind, apples
  const R = rng(5);
  for (let i = 0; i < 14; i++) { const a = R() * Math.PI, r = (110 + R() * 140) * s, cx = x + Math.cos(a) * r * 1.3 + bend * (1.2 + R()), cy = gy - 520 * s - Math.sin(a) * r * 0.7; circle(g, cx, cy, (80 + R() * 50) * s, shade(leaf, -0.15 + R() * 0.2)); }
  for (let i = 0; i < 10; i++) { const cx = x - 200 * s + R() * 420 * s + bend * 1.4, cy = gy - 420 * s - R() * 260 * s; circle(g, cx, cy, 13 * s, '#c8302a'); circle(g, cx - 4 * s, cy - 4 * s, 4 * s, alpha('#fff', 0.5)); }
  // a few fallen apples
  for (let i = 0; i < 3; i++) circle(g, x - 90 * s + i * 70 * s, gy - 8 * s, 12 * s, '#a82a22');
  return { branchX: x + 250 * s + bend * 0.75, branchY: gy - 395 * s, scarfX: x + 60 * s + bend * 0.9, scarfY: gy - 600 * s };
}
function scarfSnag(g, x, y, t, gust) {
  const c = '#d4262e', fl = Math.sin(t * 9) * 10 * (0.3 + Math.abs(gust));
  seg(g, [[x - 20, y], [x + 10, y + 6]], 14, c);
  seg(g, [[x + 6, y + 4], [x + 60 + gust * 60, y + 30 + fl], [x + 130 + gust * 110, y + 40 - fl], [x + 190 + gust * 150, y + 60 + fl]], 12, c);
  for (let i = 0; i < 4; i++) seg(g, [[x + 186 + gust * 150, y + 60 + fl], [x + 200 + gust * 160 + i * 5, y + 82 + fl]], 3, c);
}
function washingLine(g, x0, x1, y, t, gust, R) {
  const sag = 40, my = (x) => y + sag * Math.sin((x - x0) / (x1 - x0) * Math.PI);
  seg(g, [[x0, y], [(x0 + x1) / 2, y + sag], [x1, y]], 3, '#d8d4c8');
  const items = [['#e8e4d8', 150, 170], ['#5a8ac8', 90, 110], ['#d86a6a', 70, 60], ['#f2c230', 120, 90], ['#e8e4d8', 60, 80], ['#7ab07a', 100, 120]];
  let x = x0 + 80;
  items.forEach(([c, w, h], i) => {
    const yy = my(x + w / 2), fl = (Math.sin(t * (5 + i) + i) * 0.5 + 0.5) * gust;
    g.fillStyle = c; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.lineTo(x + w + fl * 70, yy + h * (1 - fl * 0.35)); g.lineTo(x + fl * 80, yy + h * (1 - fl * 0.3)); g.closePath(); g.fill();
    g.fillStyle = alpha('#000', 0.12); g.fillRect(x, yy, w, 8); for (const px of [x + 8, x + w - 8]) rr(g, px - 4, yy - 10, 8, 22, 3), g.fillStyle = '#b08a5a', g.fill();
    x += w + 40 + R() * 30;
  });
}
function fence(g, x0, x1, gy, h, gust, col = '#7a5a40') {
  for (let x = x0; x < x1; x += 34) { const wob = gust * Math.sin(x * 0.05) * 2; poly(g, [[x, gy], [x + 30, gy], [x + 30 + wob, gy - h], [x + 15 + wob, gy - h - 12], [x + wob, gy - h]], shade(col, ((x / 34) % 3) * 0.04 - 0.04)); }
  seg(g, [[x0, gy - h * 0.25], [x1, gy - h * 0.25]], 10, shade(col, -0.25)); seg(g, [[x0, gy - h * 0.8], [x1, gy - h * 0.8]], 10, shade(col, -0.25));
}
function brickWall(g, x0, x1, top, gy, col = '#8a5040') {
  g.fillStyle = col; g.fillRect(x0, top, x1 - x0, gy - top);
  g.strokeStyle = alpha('#000', 0.22); g.lineWidth = 2; for (let y = top, r = 0; y < gy; y += 26, r++) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); for (let x = x0 + (r % 2) * 40; x < x1; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); } }
}
function houseWindow(g, x, y, w, h, lit, M) {
  g.fillStyle = '#e8e4dc'; g.fillRect(x - 12, y - 12, w + 24, h + 24); g.fillStyle = lit ? linGrad(g, 0, y, 0, y + h, ['#ffe0a0', '#f0b060']) : mix('#2a3448', M.sky[1], 0.4); g.fillRect(x, y, w, h);
  if (lit) glow(g, x + w / 2, y + h / 2, w * 1.2, '#ffd59a', 0.25); seg(g, [[x + w / 2, y], [x + w / 2, y + h]], 6, '#e8e4dc'); seg(g, [[x, y + h / 2], [x + w, y + h / 2]], 6, '#e8e4dc');
  rr(g, x - 24, y + h + 10, w + 48, 18, 4); g.fillStyle = '#d8d4cc'; g.fill();
}
function drainpipe(g, x, top, gy, s = 1) {
  const c = '#3a3e44'; seg(g, [[x, top], [x, top + 120], [x - 30, top + 170], [x - 30, gy - 60], [x - 10, gy - 10], [x + 30, gy - 4]], 22 * s, c);
  seg(g, [[x - 6, top], [x - 6, top + 110]], 4, alpha('#fff', 0.25)); seg(g, [[x - 36, top + 180], [x - 36, gy - 70]], 4, alpha('#fff', 0.25));
  for (let y = top + 240; y < gy - 80; y += 210) { rr(g, x - 52, y - 8, 44, 16, 3); g.fillStyle = '#2a2e32'; g.fill(); circle(g, x - 46, y, 3, '#5a5e64'); }
  rr(g, x - 140, top - 30, 300, 34, 8); g.fillStyle = '#3a3e44'; g.fill();   // gutter
}

// =====================================================================================================
export function garden(g, t, cam, o = {}) {
  const view = o.view || 'garden', storm = clamp(o.storm ?? 0), flash = clamp(o.flash ?? 0), M = moodOf(o.mood || 'day', storm), GY = gardenGround(), CX = E.W / 2;
  const gust = gustOf(t, storm), rim = { color: M.rim, dir: [-0.8, -0.5] };
  let pos = {};
  if (view === 'shed') pos = shed(g, t, cam, o, GY, CX, M);
  else {
    // sky + clouds + lightning (outdoor views)
    layer(g, cam, 0.1, (g) => {
      backdrop(g, M.sky, [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]);
      if (storm > 0) { FX.clouds(g, { y: E.H * 0.05, h: 260, count: 9, color: '#141822', a: 0.55 * storm, seed: 3 }); FX.clouds(g, { y: E.H * 0.18, h: 200, count: 7, color: '#1c2230', a: 0.45 * storm, seed: 8 }); }
      else FX.clouds(g, { y: E.H * 0.12, h: 140, color: '#ffffff', a: 0.18, seed: 2 });
      if (flash > 0.5) FX.lightning(g, { seed: Math.floor(t * 3) + 11, x1: E.W * 0.7, y1: -40, x2: E.W * 0.62, y2: E.H * 0.5, a: flash });
    });
    layer(g, cam, 0.3, (g) => { g.fillStyle = mix('#3a4a5a', M.sky[M.sky.length - 1], 0.35); for (let i = -2; i < 6; i++) { const x = i * 420 - 200; poly(g, [[x, GY - 260], [x, GY - 480], [x + 180, GY - 600], [x + 360, GY - 480], [x + 360, GY - 260]], shade(mix('#4a5468', M.sky[1], 0.3), -0.25)); } });   // neighbours' roofs
    if (view === 'wall') pos = wall(g, t, cam, o, GY, CX, M, gust);
    else if (view === 'tree') pos = tree(g, t, cam, o, GY, CX, M, gust);
    else pos = yard(g, t, cam, o, GY, CX, M, gust);
    if (storm > 0) FX.rain(g, t, { angle: 0.12 + gust * 0.35, count: Math.round(220 * storm), a: 0.28 * storm, color: '#c8d4ee', seed: 5 });
  }
  if (flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#dfe8ff', 0.45 * flash); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  return { GY, CX, M, rim, pos, gust, view };
}

// ---------- the back garden (wide) ----------
function yard(g, t, cam, o, GY, CX, M, gust) {
  const pos = { stepX: CX - 760, stepTop: GY - 60, doorX: CX - 760, fenceTop: GY - 330, fenceX0: CX - 560, fenceX1: CX + 1300, lineY: GY - 520, treeX: CX + 360, shedX: CX + 920, pipeX: CX - 500 };
  const R = rng(4);
  layer(g, cam, 0.55, (g) => fence(g, pos.fenceX0 - 400, pos.fenceX1 + 400, GY - 130, 300, gust * 0.6));
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 140, 0, GY + 500, [shade(M.grass, 0.08), M.grass, shade(M.grass, -0.35)]); g.fillRect(-E.W, GY - 140, E.W * 3, 900);
    g.strokeStyle = alpha(shade(M.grass, 0.25), 0.4); g.lineWidth = 2; for (let i = 0; i < 160; i++) { const x = -400 + R() * (E.W + 800), y = GY - 120 + R() * 600; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 + gust * 8, y - 14); g.stroke(); }
    for (let i = 0; i < 7; i++) { const x = CX - 300 + i * 70; circle(g, x, GY - 120, 22, ['#d84a6a', '#f2c230', '#9a5ad6', '#e8e4d8'][i % 4]); seg(g, [[x, GY - 100], [x, GY - 60]], 4, '#3a6a3a'); }   // flower bed
  });
  layer(g, cam, 1, (g) => {
    // the house back wall (left): brick, back door, the back step, the drainpipe, a window
    brickWall(g, -E.W, CX - 480, GY - 1300, GY, '#8a5040');
    houseWindow(g, CX - 1060, GY - 760, 200, 220, false, M);
    rr(g, pos.doorX - 90, GY - 420, 180, 420, 6); g.fillStyle = '#3a5a7a'; g.fill(); circle(g, pos.doorX + 60, GY - 210, 8, '#d8c060');
    rr(g, pos.stepX - 130, pos.stepTop, 260, 60, 4); g.fillStyle = '#9a948a'; g.fill();
    drainpipe(g, pos.pipeX, GY - 1280, GY);
    // the washing line from the wall to a post
    seg(g, [[CX + 620, GY], [CX + 620, pos.lineY - 20]], 10, '#8a7a60');
    washingLine(g, CX - 480, CX + 620, pos.lineY, t, gust, rng(9));
    // the apple tree + the shed (right)
    const T = appleTree(g, pos.treeX, GY - 40, 1.0, t, gust, M); Object.assign(pos, T);
    const sx = pos.shedX; poly(g, [[sx - 240, GY - 400], [sx, GY - 520], [sx + 240, GY - 400]], '#4a3a2c'); g.fillStyle = '#6a5038'; g.fillRect(sx - 220, GY - 400, 440, 400);
    for (let x = sx - 220; x < sx + 220; x += 30) seg(g, [[x, GY - 400], [x, GY]], 2, alpha('#000', 0.2)); rr(g, sx - 70, GY - 300, 140, 300, 4); g.fillStyle = '#4a3828'; g.fill(); g.fillStyle = '#b8c8d8'; g.fillRect(sx + 100, GY - 340, 90, 70);
    // bird feeder, a ball
    seg(g, [[CX - 120, GY - 80], [CX - 120, GY - 420]], 6, '#5a4a3a'); rr(g, CX - 150, GY - 450, 60, 50, 6); g.fillStyle = '#c86a3a'; g.fill();
    circle(g, CX + 100, GY + 60, 30, '#2f6fd0'); circle(g, CX + 92, GY + 52, 8, alpha('#fff', 0.5));
  });
  return pos;
}

// ---------- the house wall (climbing) ----------
function wall(g, t, cam, o, GY, CX, M, gust) {
  const pos = { pipeX: CX + 160, pipeTop: GY - 1500, pipeBottom: GY, gutterY: GY - 1530, winX: [CX - 480, CX + 520], winY: GY - 1100, sillY: GY - 860 };
  layer(g, cam, 0.9, (g) => { g.fillStyle = M.grass; g.fillRect(-E.W, GY - 20, E.W * 3, 900); rr(g, -E.W, GY - 30, E.W * 3, 40, 0); g.fillStyle = '#7a746a'; g.fill(); });
  layer(g, cam, 1, (g) => {
    brickWall(g, -E.W, E.W * 2, GY - 1700, GY - 20, '#8a5040');
    for (const x of pos.winX) houseWindow(g, x - 120, pos.winY, 240, 240, x > CX, M);
    // ivy creeping up the left
    const R = rng(12); for (let i = 0; i < 70; i++) { const x = CX - 760 + R() * 260 + Math.sin(i) * 30, y = GY - 40 - R() * 900; g.fillStyle = shade('#3a6a3a', R() * 0.3 - 0.15); g.beginPath(); g.ellipse(x + gust * 6, y, 16, 10, R() * 3, 0, 7); g.fill(); }
    drainpipe(g, pos.pipeX, pos.pipeTop, GY - 20, 1.2);
    rr(g, pos.pipeX - 20, GY - 60, 90, 50, 8); g.fillStyle = '#2a2e32'; g.fill();                                 // pipe shoe + a puddle
    g.fillStyle = alpha('#9ab0c8', 0.35); g.beginPath(); g.ellipse(pos.pipeX + 60, GY + 10, 120, 18, 0, 0, 7); g.fill();
  });
  return pos;
}

// ---------- the apple tree (close) ----------
function tree(g, t, cam, o, GY, CX, M, gust) {
  const pos = { trunkX: CX - 260, groundY: GY };
  layer(g, cam, 0.55, (g) => fence(g, -E.W, E.W * 2, GY - 100, 300, gust * 0.6));
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 110, 0, GY + 500, [shade(M.grass, 0.08), shade(M.grass, -0.35)]); g.fillRect(-E.W, GY - 110, E.W * 3, 900); });
  layer(g, cam, 1, (g) => { const T = appleTree(g, pos.trunkX, GY, 1.25, t, gust, M); Object.assign(pos, T); if (o.scarf) scarfSnag(g, pos.scarfX, pos.scarfY, t, gust); });
  return pos;
}

// ---------- the shed interior ----------
function shed(g, t, cam, o, GY, CX, M) {
  const pos = { pumpX: CX + 380, pumpY: GY - 40, windowX: CX - 300, windowY: GY - 820, webX: CX - 470, webY: GY - 830, shelfY: GY - 520, benchX: CX - 300, benchTop: GY - 330, doorX: CX + 760 };
  const day = M.key, beam = o.mood === 'night' ? 0 : 1;
  layer(g, cam, 0.6, (g) => {
    // plank walls
    g.fillStyle = '#4a3828'; g.fillRect(-E.W, GY - 1300, E.W * 3, 1300);
    for (let x = -E.W; x < E.W * 2; x += 90) { g.fillStyle = shade('#4a3828', ((x / 90) % 3) * 0.04 - 0.04); g.fillRect(x, GY - 1300, 86, 1300); seg(g, [[x, GY - 1300], [x, GY]], 3, alpha('#000', 0.35)); }
    // the window: dusty glass, garden outside, the COBWEB in the top-left corner
    const wx = pos.windowX, wy = pos.windowY; g.fillStyle = '#2a2018'; g.fillRect(wx - 190, wy - 20, 380, 300);
    g.fillStyle = linGrad(g, 0, wy, 0, wy + 260, [mix(M.sky[0], '#ffffff', 0.2), M.grass]); g.fillRect(wx - 170, wy, 340, 260);
    g.fillStyle = alpha('#e8dcc0', 0.22); g.fillRect(wx - 170, wy, 340, 260); seg(g, [[wx, wy], [wx, wy + 260]], 8, '#2a2018'); seg(g, [[wx - 170, wy + 130], [wx + 170, wy + 130]], 8, '#2a2018');
    const cx = wx - 170, cy = wy; g.strokeStyle = alpha('#f4f0e8', 0.6); g.lineWidth = 1.5;                                                   // cobweb (a plain garden-spider web in a corner)
    for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 130, cy + Math.sin(a) * 130); g.stroke(); }
    for (let r = 24; r <= 120; r += 22) { g.beginPath(); for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2, rr2 = r + Math.sin(i * 2 + r) * 4; i ? g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2) : g.moveTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } g.stroke(); }
    // shelves with paint tins, jars, flowerpots
    const R = rng(31); for (const sy of [GY - 980, GY - 760, pos.shelfY]) { g.fillStyle = '#6a5038'; g.fillRect(CX + 80, sy, 720, 22); for (let x = CX + 100; x < CX + 780;) { const w = 50 + R() * 50, h = 60 + R() * 80, k = R(); if (k < 0.4) { rr(g, x, sy - h, w, h, 6); g.fillStyle = ['#c8c4b8', '#d84a3a', '#3a6aa8', '#e8c040'][Math.floor(R() * 4)]; g.fill(); g.fillStyle = alpha('#000', 0.2); g.fillRect(x, sy - h, w, 8); } else if (k < 0.7) { poly(g, [[x, sy - h * 0.7], [x + w, sy - h * 0.7], [x + w * 0.85, sy], [x + w * 0.15, sy]], '#b8643a'); } else { rr(g, x, sy - h, w * 0.8, h, 10); g.fillStyle = alpha('#c8d8c8', 0.55); g.fill(); } x += w + 14; } }
    // pegboard of tools
    rr(g, CX - 900, GY - 1100, 420, 520, 6); g.fillStyle = '#8a7058'; g.fill(); for (let y = GY - 1080; y < GY - 600; y += 30) for (let x = CX - 880; x < CX - 500; x += 30) circle(g, x, y, 2.5, '#5a4838');
    seg(g, [[CX - 840, GY - 1060], [CX - 840, GY - 620]], 10, '#8a6a40'); for (let i = 0; i < 6; i++) seg(g, [[CX - 880 + i * 16, GY - 1080], [CX - 880 + i * 16, GY - 1040]], 5, '#6a6e74');      // rake
    seg(g, [[CX - 740, GY - 1060], [CX - 740, GY - 700]], 12, '#8a6a40'); poly(g, [[CX - 770, GY - 700], [CX - 710, GY - 700], [CX - 715, GY - 620], [CX - 765, GY - 620]], '#8a9098');           // spade
    seg(g, [[CX - 610, GY - 1000], [CX - 560, GY - 860]], 10, '#d84a3a'); seg(g, [[CX - 560, GY - 1000], [CX - 610, GY - 860]], 10, '#d84a3a'); seg(g, [[CX - 600, GY - 880], [CX - 640, GY - 760]], 6, '#9aa0a8'); seg(g, [[CX - 570, GY - 880], [CX - 530, GY - 760]], 6, '#9aa0a8');   // shears
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, ['#5a4632', '#2a2018']); g.fillRect(-E.W, GY, E.W * 3, 900); for (let x = -E.W; x < E.W * 2; x += 140) seg(g, [[x, GY], [x - 80, GY + 500]], 2, alpha('#000', 0.25)); });
  layer(g, cam, 1, (g) => {
    // workbench under the window, Mina's small bike leaning, the BIKE PUMP on the floor by the shelves
    rr(g, pos.benchX - 300, pos.benchTop, 600, 30, 4); g.fillStyle = '#6a5038'; g.fill(); seg(g, [[pos.benchX - 270, pos.benchTop + 30], [pos.benchX - 270, GY]], 16, '#5a4430'); seg(g, [[pos.benchX + 270, pos.benchTop + 30], [pos.benchX + 270, GY]], 16, '#5a4430');
    rr(g, pos.benchX - 120, pos.benchTop - 60, 90, 60, 6); g.fillStyle = '#3a6aa8'; g.fill(); circle(g, pos.benchX + 100, pos.benchTop - 20, 22, '#c8c4b8');
    const bx = CX - 860; ring(g, bx, GY - 70, 70, 10, '#2a2a2a'); ring(g, bx + 200, GY - 70, 70, 10, '#2a2a2a'); seg(g, [[bx, GY - 70], [bx + 90, GY - 170], [bx + 200, GY - 70], [bx + 70, GY - 70], [bx + 90, GY - 170]], 10, '#d84a8a'); seg(g, [[bx + 90, GY - 170], [bx + 70, GY - 210]], 8, '#2a2a2a'); seg(g, [[bx + 170, GY - 160], [bx + 200, GY - 190]], 8, '#2a2a2a');
    const px = pos.pumpX, py = pos.pumpY; rr(g, px - 26, py - 200, 52, 200, 12); g.fillStyle = '#c8302a'; g.fill(); g.fillStyle = alpha('#fff', 0.3); g.fillRect(px - 18, py - 190, 8, 180);
    seg(g, [[px, py - 200], [px, py - 250]], 8, '#9aa0a8'); seg(g, [[px - 50, py - 250], [px + 50, py - 250]], 14, '#2a2a2a'); rr(g, px - 60, py - 10, 120, 16, 4); g.fillStyle = '#2a2a2a'; g.fill();
    seg(g, [[px + 20, py - 30], [px + 70, py - 60], [px + 90, py - 10], [px + 130, py - 20]], 6, '#1a1a1a');
    // the open door: daylight spills in
    const dk = clamp(o.door ?? 0.3); g.fillStyle = mix('#2a2018', '#f8f0d8', dk); g.fillRect(pos.doorX - 130, GY - 760, 260 * dk, 760);
  });
  // the sunbeam through the window + dust in it (the key light)
  if (beam) { FX.godRays(g, pos.windowX + 60 - cam.x, pos.windowY + 120 - cam.y, { angle: Math.PI * 0.32, spread: 0.35, len: 1300, color: day, a: 0.12, t, count: 5 }); }
  return pos;
}

// =====================================================================================================
export function gardenFg(g, t, cam, o = {}) {
  const view = o.view || 'garden', storm = clamp(o.storm ?? 0), GY = gardenGround(), gust = gustOf(t, storm);
  layer(g, cam, 1.6, (g) => {
    g.save(); g.filter = 'blur(10px)';
    if (view === 'shed') { rr(g, E.W - 260, GY - 200, 500, 60, 10); g.fillStyle = '#2a2018'; g.fill(); for (let i = 0; i < 3; i++) { rr(g, E.W - 220 + i * 90, GY - 330, 70, 130, 8); g.fillStyle = ['#3a6aa8', '#c8c4b8', '#d84a3a'][i]; g.fill(); } }
    else { const R = rng(17); for (let i = 0; i < 9; i++) { g.fillStyle = shade('#2f5a32', -0.3 + R() * 0.2); g.beginPath(); g.ellipse(-60 + R() * 260 + gust * 40, E.H - R() * 400, 90, 40, R() * 3, 0, 7); g.fill(); } seg(g, [[E.W - 40, E.H + 100], [E.W - 10, E.H * 0.2]], 46, '#3a2c20'); }
    g.restore();
  });
  if (view !== 'shed' && storm > 0) FX.rain(g, t * 1.2, { angle: 0.12 + gust * 0.35, count: Math.round(70 * storm), a: 0.45 * storm, len: 90, w: 2.4, color: '#dfe8ff', seed: 9 });
  FX.dust(g, t * 0.5, { count: view === 'shed' ? 40 : 18, color: view === 'shed' ? '#fff0d0' : '#ffffff', a: view === 'shed' ? 0.35 : 0.15, seed: 21 });
}
