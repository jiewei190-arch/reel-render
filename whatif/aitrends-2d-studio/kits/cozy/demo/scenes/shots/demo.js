// DEMO sheet for the Cozy 2D kit (owner's bear). Render:  node render.mjs --project kits/cozy/demo --sheet --scale 0.5
import * as K from '/kits/cozy/cozy.js';
const { PAL } = K;
const tag = (g, s, x, y, c = PAL.line) => K.text(g, s, x, y, { size: 30, font: 'Nunito', weight: 900, color: c });
const paper = (g) => { g.fillStyle = '#f7ecdc'; g.fillRect(0, 0, K.E.W, K.E.H); };

K.cozyShot('d01_bear_poses', (g, t) => {
  paper(g);
  const P = [['smile', 'rest', 'idle'], ['happy', 'up', 'arms up'], ['o', 'chest', 'surprised'], ['focus', 'stir', 'stir'], ['bliss', 'spoon', 'spoon'], ['smile', 'hold', 'hold bowl']];
  P.forEach(([f, a, n], i) => { const x = 220 + (i % 3) * 320, y = 900 + Math.floor(i / 3) * 620; const A = K.bear(g, x, y, 0.62, { face: f, arms: a, t: t + i });
    if (a === 'spoon') K.spoon(g, A.pawR[0], A.pawR[1] - 30, 0.45, -0.5, { heap: true });
    if (a === 'hold') K.bowl(g, x, A.pawL[1] - 10, 0.45, { contents: 'rice' });
    if (a === 'stir') K.spatula(g, A.pawR[0], A.pawR[1] - 20, 0.45, 0.3);
    tag(g, n, x, y + 45); });
  K.label(g, "bear(g, x, y, s, {face, arms, hat})", 500, 470, t, -1, { size: 34 });
}, { bg: '#f7ecdc' });
K.cozyShot('d02_expressions', (g, t) => {
  paper(g);
  const F = ['smile', 'happy', 'grumpy', 'o', 'alarm', 'bliss', 'chew', 'yawn', 'sleep', 'drowsy', 'sip', 'love', 'sweat', 'focus'];
  F.forEach((f, i) => { const x = 150 + (i % 4) * 260, y = 720 + Math.floor(i / 4) * 330; K.bear(g, x, y, 0.5, { face: f, t, blink: 0 }); tag(g, f, x, y + 36); });
}, { bg: '#f7ecdc' });
K.cozyShot('d03_turnaround', (g, t) => {
  paper(g);
  [['front', 0], ['q', 0], ['side', null], ['back', 0]].forEach(([v], i) => { const x = 170 + i * 250, y = 900;
    if (v === 'front') K.bear(g, x, y, 0.45, { t }); else K.bear(g, x, y, 0.45, { view: v, t }); tag(g, v, x, y + 40); });
  for (let i = 0; i < 4; i++) { const x = 170 + i * 250; K.bear(g, x, 1500, 0.45, { view: 'side', walk: i / 4, t }); tag(g, `walk ${i}/4`, x, 1545); }
  tag(g, 'views + waddle walk (feet animated in code)', 520, 1650);
}, { bg: '#f7ecdc' });
K.cozyShot('d04_bedroom', (g, t) => {
  K.bgImage(g, 'bedroom'); const R = K.ROOM.bedroom;
  K.bear(g, R.pillow[0], R.pillow[1] + 190, 0.8, { face: 'sleep', tilt: -0.2, hat: { tilt: -0.35 }, t, breathe: 1.5 });
  K.bgOver(g, 'bedroom', R.quilt); K.zzz(g, R.pillow[0] + 60, R.pillow[1] - 200, t);
  tag(g, "bgImage('bedroom') + bgOver(quilt)", 540, 1750, '#fff');
}, { bg: PAL.violet });
K.cozyShot('d05_kitchen_walk', (g, t) => {
  K.bgImage(g, 'kitchen'); K.bear(g, 520, 1560, 1.0, { view: 'side', walk: (t * 1.6) % 1, t });
  tag(g, "bgImage('kitchen') + view:'side', walk", 540, 1750, '#fff');
}, { bg: PAL.violet });
K.cozyShot('d06_fridge', (g, t) => {
  K.bgImage(g, 'kitchen'); const L = K.kitchenFridge(g, 1);
  K.warmGlow(g, L[0], L[1], 500, '#fff1c8', 0.5);
  const A = K.bear(g, 600, 1640, 1.0, { view: 'q', t }); K.sparkles(g, 240, 1150, t, { n: 5, r: 160 });
  tag(g, 'kitchenFridge(open) = sage under-counter unit', 540, 1750, '#fff');
}, { bg: PAL.violet });
K.cozyShot('d07_table_stir', (g, t) => {
  K.bgImage(g, 'table_empty'); const R = K.ROOM.table;
  const A = K.bear(g, 650, 1150, 1.25, { face: 'focus', arms: { L: [1.9, 40], R: [-0.7, 0] }, t, tilt: -0.05, look: [-0.6, 0.4] });
  K.bgOver(g, 'table_empty', R.front);
  K.panSide(g, R.burner[0], R.burner[1] - 10, 0.95, (g) => { g.scale(1, 0.3); K.friedRice(g, 0, -20, 128, { rice: 1, egg: 1, scramble: 1, soy: 0.6, scallion: 1 }, t); });
  K.stirTool(g, A.pawL[0], A.pawL[1], R.burner[0] + 10, R.burner[1] - 22);
  K.steam(g, R.burner[0], R.burner[1] - 80, t, { n: 2, h: 260 });
  tag(g, "table_empty + bgOver(front) + panSide + stirTool", 540, 1750, '#fff');
}, { bg: PAL.violet });
K.cozyShot('d08_pan_topdown', (g, t) => {
  K.tableTop(g); const P = K.panTop(g, 500, 980, 330);
  K.panClip(g, 500, 980, P.r, (g) => K.friedRice(g, 500, 980, P.r, { rice: 1, egg: 1, scramble: 1, scallion: 1, ham: 1, soy: 0.7, cheese: 1, cheeseMelt: 0.7, sesame: 1 }, t));
  K.sizzle(g, 500, 980, P.r, t, 0.6); K.steam(g, 500, 800, t, { n: 3 }); K.label(g, 'cheese', 760, 620, t, -1);
  tag(g, 'panTop (sage) + friedRice(state) + sizzle + steam', 520, 1500);
}, { bg: PAL.woodLt });
K.cozyShot('d09_eat_pull', (g, t) => {
  K.bgImage(g, 'table_empty'); K.night(g, 0.3, [{ x: 540, y: 1000, r: 900, k: 0.8 }]);
  const A = K.bear(g, 520, 1700, 1.5, { face: 'bliss', arms: 'spoon', t });
  K.bowl(g, A.pawL[0] + 40, A.pawL[1] + 10, 0.75, { contents: 'rice' });
  K.cheesePull(g, A.mouth[0] + 30, A.mouth[1] + 40, A.pawL[0] + 50, A.pawL[1] - 10, 0.7);
  K.spoon(g, A.mouth[0] + 40, A.mouth[1] + 30, 0.6, -0.7, { heap: true });
  tag(g, 'eat: bliss + spoon + cheesePull + lilac bowl', 540, 1800, '#fff');
}, { bg: PAL.violet });
K.cozyShot('d10_doze_lamp_off', (g, t) => {
  K.bgImage(g, 'table_empty', { lamp: 0.15 }); const R = K.ROOM.table;
  K.bear(g, 520, 1240, 0.95, { face: 'sleep', arms: 'doze', hat: { slide: 0.9 }, tilt: 0.12, t, breathe: 1.6 });
  K.bgOver(g, 'table_empty', R.front, { lamp: 0.15 });
  K.zzz(g, 650, 760, t);
  tag(g, "bgImage(lamp:0.15) + hat.slide (nightcap over eyes)", 540, 1750, '#fff');
}, { bg: PAL.violetDk });
