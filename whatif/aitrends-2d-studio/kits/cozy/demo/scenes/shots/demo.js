// DEMO sheet for the Cozy 2D kit: one shot per helper group. Render:
//   node render.mjs --project kits/cozy/demo --sheet --scale 0.5
import * as K from '/kits/cozy/cozy.js';
const { PAL } = K;
const tag = (g, s, x, y) => K.text(g, s, x, y, { size: 30, font: 'Nunito', weight: 900, color: PAL.line });

K.cozyShot('d01_cast', (g, t) => {
  K.rug(g, 540, 1300, 480, 120);
  K.critter(g, 'pebble', 230, 1250, 0.9, { pose: 'wave', face: 'happy', t }); tag(g, 'PEBBLE (bunny)', 230, 1330);
  K.critter(g, 'mango', 540, 1300, 1.05, { pose: 'cheer', face: 'blush', t }); tag(g, 'MANGO (tabby)', 540, 1380);
  K.critter(g, 'biscuit', 850, 1250, 0.9, { pose: 'hold', face: 'calm', t }); tag(g, 'BISCUIT (bear)', 850, 1330);
  K.critter(g, 'mango', 300, 1750, 0.7, { pose: K.tiptoe(t * 1.5), face: 'sneaky', t }); tag(g, 'tiptoe()', 300, 1800);
  K.critter(g, 'mango', 760, 1760, 0.7, { pose: 'loaf', face: 'sleepy', t }); tag(g, "pose 'loaf'", 760, 1800);
  K.label(g, 'critter(kind, x, y, s, {pose, face})', 520, 520, t, -1, { size: 34 });
}, { bg: PAL.cream });
const grid = (names, kinds) => (g, t) => names.forEach((n, i) => { const x = 190 + (i % 3) * 350, y = 520 + Math.floor(i / 3) * 360; K.at(g, x, y, 0.95, (g) => K.critterHead(g, kinds[i % kinds.length], K.EXPR[n], t)); tag(g, n, x, y + 150); });
K.cozyShot('d02_expr', grid(['calm', 'sleepy', 'drowsy', 'hungry', 'happy', 'blush', 'spicy', 'sweat', 'heart'], ['mango', 'pebble', 'biscuit']), { bg: PAL.paper });
K.cozyShot('d03_expr2', (g, t) => { grid(['sparkle', 'beg', 'chew', 'sneaky', 'focus', 'sip', 'shock', 'content'], ['biscuit', 'mango', 'pebble'])(g, t);
  K.pop(g, 890, 1300, 1, '!'); K.zzz(g, 840, 1620, t); K.sweat(g, 980, 1500, 1.4); K.hearts(g, 700, 1700, t); }, { bg: PAL.paper });
K.cozyShot('d04_loft_night', (g, t) => {
  const L = K.loft(g, t, {});
  K.sleeper(g, 'pebble', L.futonL[0], L.futonL[1], 0.55, { blanket: PAL.sage, t });
  K.sleeper(g, 'biscuit', L.futonR[0], L.futonR[1], 0.55, { blanket: '#f2b8a0', t, phase: 1 });
  K.critter(g, 'mango', L.cushion[0], L.cushion[1] - 6, 0.62, { pose: 'loaf', face: 'sleepy', t });
  K.night(g, 0.88, L.lights);
  K.zzz(g, L.cushion[0] + 30, L.cushion[1] - 170, t, { size: 44 });
  tag(g, 'loft() + sleeper() + night(lights)', 500, 1750);
}, { bg: PAL.tealDk });
K.cozyShot('d05_fridge', (g, t) => {
  const L = K.loft(g, t, { fridgeOpen: 1 });
  K.critter(g, 'mango', 640, 1300, 0.7, { pose: 'reach', face: 'sparkle', t });
  K.night(g, 0.88, L.lights); K.cone(g, 900, 1000, 700, 200, 900, 0.9, PAL.fridgeLight, 0.25);
  tag(g, 'miniFridge({open}) light', 500, 1750);
}, { bg: PAL.tealDk });
K.cozyShot('d06_pan', (g, t) => {
  K.tableTop(g); const P = K.panTop(g, 540, 1000, 330);
  K.panClip(g, 540, 1000, P.r, (g) => K.friedRice(g, 540, 1000, P.r, { rice: 1, egg: 1, scramble: 1, scallion: 1, ham: 1, soy: 0.8, cheese: 1, cheeseMelt: 0.6, sesame: 1 }, t));
  K.sizzle(g, 540, 1000, P.r, t, 0.6); K.steam(g, 540, 820, t, { n: 3 });
  K.label(g, 'cheese', 800, 640, t, -1); tag(g, 'panTop + friedRice(state) + sizzle + steam', 520, 1500);
}, { bg: PAL.woodLt });
K.cozyShot('d07_cook_props', (g, t) => {
  K.tableTop(g);
  K.egg(g, 220, 560, 1, { crack: 1 }); K.egg(g, 520, 560, 1, { split: 0.6 }); K.cheeseSlice(g, 820, 560, 170);
  K.board(g, 80, 800, 660, 300); K.scallionStalk(g, 120, 900, 420, 0.4); K.knife(g, 640, 1060, 0.9, 0.2);
  K.hamSlice(g, 900, 980, 90);
  K.spatula(g, 240, 1420, 1, -0.5); K.soyBottle(g, 520, 1500, 1.3); K.milkCarton(g, 760, 1500, 1.3); K.riceTub(g, 920, 1500, 1.1);
  K.pour(g, 520, 1170, 600, 1340, 12);
  tag(g, 'egg / board / knife / scallion / ham / soy / milk', 520, 1660);
}, { bg: PAL.woodLt });
K.cozyShot('d08_eat', (g, t) => {
  g.fillStyle = '#f7dcc0'; g.fillRect(0, 0, K.E.W, K.E.H);
  const A = K.critter(g, 'mango', 540, 1560, 1.3, { pose: 'hold', face: { ...K.EXPR.happy, open: 1 }, t });
  K.bowl(g, 540, A.hL[1] - 20, 0.9, { contents: 'rice' });
  K.cheesePull(g, 780, 900, 560, A.hL[1] - 50, 0.7); K.spoon(g, 790, 880, 0.8, 0.5, { heap: true });
  tag(g, 'bowl / spoon / cheesePull', 540, 1640);
}, { bg: '#f7dcc0' });
K.cozyShot('d09_fx', (g, t) => {
  g.fillStyle = PAL.tealDk; g.fillRect(0, 0, K.E.W, K.E.H);
  K.warmGlow(g, 540, 900, 400, PAL.lamp, 0.4); K.stringLights(g, 40, 500, 1040, 520, { sag: 120, t });
  const a = K.critter(g, 'pebble', 330, 1350, 0.9, { pose: 'hold', face: 'beg', t }), b = K.critter(g, 'biscuit', 750, 1350, 0.9, { pose: 'hold', face: 'beg', t });
  K.bowl(g, 330, a.hL[1] - 10, 0.5); K.bowl(g, 750, b.hL[1] - 10, 0.5); K.sparkles(g, 540, 1000, t, { n: 7, r: 300 });
  tag(g, 'warmGlow / stringLights / sparkles / beg', 540, 1650);
}, { bg: PAL.tealDk });
K.cozyShot('d10_final_warm', (g, t) => {
  const L = K.loft(g, t, { futons: false, cushion: false, table: [540, 1400, 420] });
  K.critter(g, 'pebble', 290, 1400, 0.7, { pose: 'eat', face: 'chew', t }); K.critter(g, 'biscuit', 790, 1400, 0.72, { pose: 'hold', face: 'happy', t });
  K.critter(g, 'mango', 540, 1330, 0.72, { pose: 'sip', face: 'content', t }); K.bowl(g, 540, 1395, 0.5, { contents: 'rice' });
  K.night(g, 0.6, [...L.lights, { x: 540, y: 1300, r: 600, k: 0.9, color: PAL.lamp, glow: 0.3 }]); K.hearts(g, 540, 1080, t);
  tag(g, 'final: night(0.6) + warm lamp pool', 540, 1750);
}, { bg: PAL.tealDk });
