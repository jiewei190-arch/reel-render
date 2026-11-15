// MOTION TEST for the owner's bear rig. Render: node render.mjs --project kits/cozy/motion  &&  python3 kits/cozy/tools/cozy_audio.py --project kits/cozy/motion
import * as K from '/kits/cozy/cozy.js';
const { PAL, lerp, ease, clamp, prog } = K;

K.cozyShot('m1_idle', (g, t) => {
  K.bgImage(g, 'bedroom'); K.night(g, 0.25, [{ x: 900, y: 900, r: 700, k: 0.9 }]);
  const look = t > 1.5 ? [0.6, 0] : [0, 0];
  K.bear(g, 520, 1560, 1.25, { face: t > 1.3 && t < 1.6 ? 'o' : 'smile', t, blink: t > 0.6 && t < 0.78 ? Math.sin((t - 0.6) / 0.18 * Math.PI) : (t > 2.1 && t < 2.28 ? Math.sin((t - 2.1) / 0.18 * Math.PI) : 0), look, tilt: Math.sin(t * 1.3) * 0.04 });
}, { bg: PAL.violet });
K.cozyShot('m2_walk', (g, t) => {
  K.bgImage(g, 'kitchen');
  const x = lerp(860, 200, t / 2.5);
  K.bear(g, x, 1560, 1.0, { view: 'side', walk: (t / 0.56) % 1, t });
}, { bg: PAL.violet });
K.cozyShot('m3_stir', (g, t, info) => {
  K.bgImage(g, 'table_empty'); const R = K.ROOM.table;
  const sw = Math.sin(t * 5.5), bx = R.burner[0] + 10 + sw * 60, by = R.burner[1] - 22 + Math.cos(t * 5.5) * 8;
  const A = K.bear(g, 650, 1150, 1.25, { face: 'focus', arms: { L: [1.9 + sw * 0.15, 40], R: [-0.7, 0] }, t, tilt: -0.05 + sw * 0.03, look: [-0.6, 0.4] });
  K.bgOver(g, 'table_empty', R.front);
  K.panSide(g, R.burner[0], R.burner[1] - 10, 0.95, (g) => { g.scale(1, 0.3); K.friedRice(g, 0, -20, 128, { rice: 1, egg: 1, scramble: 1, soy: 0.6, scallion: 1, stir: t * 1.8 }, t); });
  K.stirTool(g, A.pawL[0], A.pawL[1], bx, by);
  K.steam(g, R.burner[0], R.burner[1] - 80, t, { n: 2, h: 300 }); K.sizzle(g, R.burner[0], R.burner[1] - 16, 90, t, 0.4);
}, { bg: PAL.violet });
K.cozyShot('m4_eat', (g, t) => {
  K.bgImage(g, 'table_empty'); K.night(g, 0.3, [{ x: 540, y: 1100, r: 900, k: 0.8 }]);
  // spoon cycle: dip (0-0.4) -> lift to mouth (0.4-1.1) -> chew (1.1-2.5)
  const up = ease.inOut(prog(t, 0.35, 1.05)), chewing = t > 1.1;
  const a = lerp(-1.25, -2.5, up), len = lerp(10, 60, up);
  const face = chewing ? 'chew' : up > 0.75 ? { eyes: 'arc', mouth: 'open', open: 1 } : 'smile';
  const A = K.bear(g, 520, 1720, 1.55, { face, arms: { L: [-1.0, 0], R: [a, len] }, t, headSquash: chewing ? 1 + Math.sin(t * 15) * 0.012 : 1 });
  const bx = A.pawL[0] + 50, by = A.pawL[1] + 10;
  K.bowl(g, bx, by, 0.78, { contents: 'rice' });
  const sx = A.pawR[0] - 10, sy = A.pawR[1] - 40;
  if (!chewing && up > 0.05) K.cheesePull(g, sx - 20, sy - 30, bx + 10, by - 30, up);
  if (!chewing) K.spoon(g, sx, sy, 0.6, lerp(-0.2, -0.7, up), { heap: true });
  if (chewing) { K.hearts(g, A.head[0], A.head[1] - 150, t, { n: 3, t0: 1.1 }); K.spoon(g, sx, sy + 30, 0.6, -0.3); }
}, { bg: PAL.violet });
