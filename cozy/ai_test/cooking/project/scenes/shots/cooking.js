// COOKING TEST: 5 shots, ~14 s. AI bear layers (Wan 2.2 5B, first+last frame = owner's drawings, DINOv2 auto-reject, palette lock)
// drawn BETWEEN the owner's room and the owner's own foreground props (stove, bowl, table), so the bear stands behind the table.
import * as K from '/kits/cozy/cozy.js';
const { PAL, lerp, ease, clamp, prog } = K;
const img = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => { console.log('ERROR missing', src); res(null); }; im.src = src; });
const seq = (dir, n) => Promise.all([...Array(n)].map((_, i) => img(`/project/${dir}/f_${String(i).padStart(5, '0')}.png`)));
const AI = { s1: await seq('ai/s1', 73), s4: await seq('ai/s4', 73), s5: await seq('ai/s5', 73) };
const FG = { table: await img('/project/fg/fg_table.png'), plate: await img('/project/fg/fg_plate.png'), off: await img('/project/fg/fg_plate_off.png') };

// AI layer: 640x640 RGBA frame, top-left at (x, y), scale s
function ai(g, frames, t, x, y, s) { const im = frames[Math.min(frames.length - 1, Math.max(0, Math.round(t * 24)))]; if (!im) return; g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(im, x, y, 640 * s, 640 * s); g.restore(); }
const full = (g, im, a = 1) => { if (!im) return; g.save(); g.globalAlpha *= a; g.drawImage(im, 0, 0, K.E.W, K.E.H); g.restore(); };
const clipRects = (g, rects, fn) => { g.save(); g.beginPath(); rects.forEach(([x, y, w, h]) => g.rect(x, y, w, h)); g.clip(); fn(); g.restore(); };

// 1. wide: bear behind the low table, burner clicks on, blue flame
K.cozyShot('s1_wide_burner', (g, t) => {
  K.camera(g, { z: lerp(1.0, 1.05, ease.inOut(t / 3)), fx: 540, fy: 1000 });
  K.bgImage(g, 'table_empty');
  ai(g, AI.s1, t, 600 - 320 * 1.45, 1230 - 614 * 1.45, 1.45);
  const on = t >= 1.0 ? clamp((t - 1.0) / 0.12) * (0.85 + 0.15 * Math.sin(t * 40) * Math.exp(-(t - 1.0) * 3)) : 0;
  full(g, FG.off); full(g, FG.plate, on); full(g, FG.table);
  if (t >= 1.0) { K.warmGlow(g, 340, 1040, 220, '#7fb6ff', 0.25 * on); K.sparkles(g, 340, 1000, t, { n: 3, t0: 1.0 }); }
  if (t > 0.9 && t < 1.15) K.pop(g, 520, 1120, ease.outBack(prog(t, 0.9, 1.05)), '!', {});
}, { bg: PAL.violet });

// 2. insert: the egg cracks into the buttered pan (kit, no bear)
K.cozyShot('s2_egg_crack', (g, t) => {
  K.camera(g, { z: lerp(1.0, 1.06, t / 2.5), fx: 540, fy: 1100 });
  K.tableTop(g); const P = K.panTop(g, 540, 1120, 330);
  const egg = ease.out(prog(t, 1.05, 1.45));
  K.panClip(g, 540, 1120, P.r, (g) => K.friedRice(g, 540, 1120, P.r, { oil: 1, butter: 1, melt: 1, egg }, t));
  K.sizzle(g, 540, 1120, P.r, t, 0.5 + egg * 0.5); if (egg > 0) K.spits(g, 540, 1120, P.r, t, egg);
  const drop = ease.inOut(prog(t, 0.0, 0.5)), crack = prog(t, 0.45, 0.7), split = ease.out(prog(t, 0.9, 1.3));
  if (t < 1.9) K.egg(g, 470, lerp(560, 780, drop) - split * 40, 1.25, { crack, split, rot: lerp(-0.2, 0.05, drop) });
  if (split > 0 && split < 1) { g.save(); g.globalAlpha = 1 - split; K.oval(g, 470, 860, 40, 60 * split, { fill: '#fffdf6' }); g.restore(); }
  K.steam(g, 540, 900, t, { n: 2, h: 260, a: 0.35 });
}, { bg: PAL.woodLt });

// 3. money shot: rice sizzles, egg scrambles, cheese slice melts (kit food helpers)
K.cozyShot('s3_money_shot', (g, t) => {
  K.camera(g, { z: lerp(1.05, 1.16, ease.inOut(t / 3)), fx: 540, fy: 1100, r: lerp(0, 0.03, t / 3) });
  K.tableTop(g); const P = K.panTop(g, 540, 1120, 330);
  const scr = ease.inOut(prog(t, 0.1, 1.3)), drop = ease.outBack(prog(t, 1.3, 1.6)), melt = ease.inOut(prog(t, 1.6, 2.9));
  K.panClip(g, 540, 1120, P.r, (g) => K.friedRice(g, 540, 1120, P.r, { oil: 1, rice: 1, spread: 1, egg: 1, scramble: scr, soy: 0.55, scallion: 1, ham: 1, sesame: prog(t, 2.2, 2.6), cheese: drop, cheeseMelt: melt, stir: t * 1.1 }, t));
  if (t < 1.3) K.spatula(g, 540 + Math.sin(t * 6) * 120, 1080 + Math.cos(t * 6) * 60, 0.9, 0.4 + Math.sin(t * 6) * 0.2);
  K.sizzle(g, 540, 1120, P.r, t, 0.9); K.spits(g, 540, 1120, P.r, t, 0.7);
  K.steam(g, 540, 880, t, { n: 3, h: 340, a: 0.45 });
}, { bg: PAL.woodLt });

// 4. the bear stirs (AI take seed 11). Steam rises from the pot RIM; stove front, bowl and table drawn over the bear.
const S4 = 1.3, X4 = 330 - 205 * S4, Y4 = 1045 - 585 * S4;
K.cozyShot('s4_stir', (g, t) => {
  K.camera(g, { z: lerp(1.02, 1.06, t / 2.5), fx: 420, fy: 1040 });
  K.bgImage(g, 'table_empty');
  ai(g, AI.s4, t, X4, Y4, S4);
  clipRects(g, [[0, 1050, 1080, 870], [620, 0, 460, 1920]], () => full(g, FG.plate));
  full(g, FG.table);
  K.steam(g, X4 + 140 * S4, Y4 + 478 * S4, t, { n: 2, h: 200, spread: 60, a: 0.55, w: 24 });
}, { bg: PAL.violet });

// 5. the bear tastes from the spoon (owner's eat_spoon drawing, eyes closed in bliss), hearts pop
K.cozyShot('s5_taste', (g, t) => {
  K.camera(g, { z: lerp(1.0, 1.06, ease.inOut(t / 3)), fx: 560, fy: 800 });
  K.bgImage(g, 'table_empty');
  ai(g, AI.s5, t, 560 - 320 * 1.4, 1200 - 614 * 1.4, 1.4);
  full(g, FG.plate); full(g, FG.table);
  K.hearts(g, 830, 600, t, { n: 4, t0: 0.6, spread: 160 });
  if (t > 0.7) K.sparkles(g, 300, 640, t, { n: 3 });
}, { bg: PAL.violet });
