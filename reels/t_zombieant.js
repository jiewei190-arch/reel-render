// t_zombieant.js: "The fungus that turns ants into zombies" in template #19 handdrawn "Sketch music" (demo 102). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: one thin pencil line building every scene in real time (pen tip leads), pastel lavender->rose->peach sky washes laid in
// after the line, a peach sun crossed by thin strokes, perspective ground lines running to a vanishing point, bare tall trunks, glassy
// raindrops drifting over the drawing (here they become the humid air and, later, the drifting spores), the walker with the red umbrella,
// old-film grain/flicker/vignette, a copperplate script title, slow camera glide, and the dim-to-dark ending. Stylised and non-gory throughout.
import { createSM, W, H, TAU, P, clamp, lerp, ramp, ss, eo, hash, FONTS } from './styles/sketchmusic/sketchmusic.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const SM = createSM(document.getElementById('c')), g = SM.g, R = ramp, L = SM.line, E = SM.ell;

// ---------- the ant (side view, facing right; x,y = ground under the middle legs; k = how much of the line is drawn) ----------
function ant(x, y, sc, t, o = {}) { const k = o.k ?? 1, wk = o.walk ?? null, fill = o.fill ?? 1; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(sc * (o.flip ? -1 : 1), sc);
  const part = i => R(k, i * .08, .3); const lw = 2.6 / Math.sqrt(sc) * 1.2;
  // legs (behind the body): hip on the thorax, knee up, foot on the ground; walking shifts the feet
  [[-5, 0], [20, 2.1], [42, 4.2]].forEach(([hx, ph], i) => { const sw = wk == null ? 0 : Math.sin(wk * TAU + ph), lift = wk == null ? 0 : Math.max(0, Math.cos(wk * TAU + ph)) * 10;
    for (const side of [0, 1]) { const off = side ? 14 : 0, fx = hx + (i - 1) * 46 + sw * 22 + off, kx = hx + (i - 1) * 30 + sw * 10 + off;
      L([[hx + off, -50], [kx, -78 - (side ? 0 : 6)], [fx, -lift - (o.hang ? 40 : 0)]], part(i), { seed: 10 + i * 2 + side, lw: lw * .85, a: side ? .55 : 1 }); } });
  const parts = [E(-95, -62, 56, 38, 40), E(20, -60, 50, 21, 32, 0, TAU, -.12), E(-38, -58, 9, 9, 12), E(94, -64, 34, 30, 32, 0, TAU, .15)];
  if (fill > 0) { SM.wash(parts[0], o.body || P.brown, fill * R(k, .45, .3)); SM.wash(parts[1], o.body || P.brown, fill * R(k, .5, .3)); SM.wash(parts[3], o.body || P.brown, fill * R(k, .55, .3)); }
  parts.forEach((p, i) => L(p, part(3 + i), { seed: 30 + i, lw }));
  L(E(108, -72, 6, 5, 10), part(7), { seed: 40, lw: lw * .8 });                                                         // eye
  L([[104, -90], [128, -138], [172, -128]], part(7), { seed: 41, lw: lw * .8 }); L([[96, -92], [112, -146], [150, -150]], part(8), { seed: 42, lw: lw * .7, a: .6 });  // antennae
  L(o.bite ? [[122, -52], [140, -64], [150, -80]] : [[122, -52], [146, -46], [152, -38]], part(8), { seed: 43, lw }); L(o.bite ? [[120, -44], [142, -54], [154, -72]] : [[118, -44], [140, -36], [144, -28]], part(9), { seed: 44, lw: lw * .8 });
  if (o.brain) { SM.wash(E(92, -68, 15, 12, 18), '#f3d2d6', o.brain, { op: .9 }); L(E(92, -68, 15, 12, 18), o.brain, { seed: 45, lw: lw * .7 }); }
  if (o.net) { const n = Math.floor(o.net * 46); for (let i = 0; i < n; i++) { const a = hash(i * 3.3) * TAU, inG = i % 2, cx = inG ? -95 : 20, cy = inG ? -62 : -60, rx = inG ? 44 : 38, ry = inG ? 28 : 14;
      const px = cx + Math.cos(a) * rx * Math.sqrt(hash(i * 5.1)), py = cy + Math.sin(a) * ry * Math.sqrt(hash(i * 5.1)); SM.wash(E(px, py, 4, 4, 8), P.lav, 1, { op: .95, blur: .5, dx: 0, dy: 0 });
      if (i > 1) { const j = i - 2, a2 = hash(j * 3.3) * TAU, ig2 = j % 2, cx2 = ig2 ? -95 : 20, cy2 = ig2 ? -62 : -60, rx2 = ig2 ? 44 : 38, ry2 = ig2 ? 28 : 14; L([[px, py], [cx2 + Math.cos(a2) * rx2 * Math.sqrt(hash(j * 5.1)), cy2 + Math.sin(a2) * ry2 * Math.sqrt(hash(j * 5.1))]], 1, { seed: 50 + i, lw: 1.4, col: '#7d6aa8', a: .7, tip: false }); } } }
  g.restore(); }
// rainforest bits
const trunk = (x, y0, y1, w, k, seed) => { L([[x - w / 2, y0], [x - w / 2 + 4, y1]], k, { seed, lw: 2.6 }); L([[x + w / 2, y0], [x + w / 2 - 3, y1]], R(k, .1, .9), { seed: seed + 1, lw: 2.6 }); };
const fern = (x, y, sc, k, seed, flip = 1) => { const st = SM.bez([x, y], [x + 30 * sc * flip, y - 120 * sc], [x + 110 * sc * flip, y - 190 * sc], [x + 190 * sc * flip, y - 170 * sc], 20); L(st, k, { seed, lw: 2 });
  for (let i = 2; i < 19; i += 2) { const [px, py] = st[i], kk = R(k, i / 20, .3), l = (22 - i) * 3.2 * sc; L([[px, py], [px + l * .4 * flip, py - l * .9]], kk, { seed: seed + i, lw: 1.6 }); L([[px, py], [px + l * flip, py + l * .1]], kk, { seed: seed + i + 1, lw: 1.6 }); } };
const leafShape = (cx, cy, l, w, rot) => { const c = Math.cos(rot), sn = Math.sin(rot), P2 = (u, v) => [cx + u * c - v * sn, cy + u * sn + v * c]; const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push(P2(u * l, Math.sin(u * Math.PI) * w * (1 - u * .3))); } for (let i = 20; i >= 0; i--) { const u = i / 20; pts.push(P2(u * l, -Math.sin(u * Math.PI) * w * (1 - u * .3))); } return { pts, mid: [P2(0, 0), P2(l, 0)], P2 }; };
function leaf(cx, cy, l, w, rot, k, seed, o = {}) { const lf = leafShape(cx, cy, l, w, rot); SM.wash(lf.pts, o.col || P.leaf, R(k, .5, .4)); L(lf.pts, k, { seed, lw: o.lw || 2.4 }); L(lf.mid, R(k, .3, .6), { seed: seed + 1, lw: (o.lw || 2.4) * .8 });
  for (let i = 1; i < 6; i++) { const u = i / 6; L([lf.P2(u * l, 0), lf.P2(u * l + l * .12, w * .55 * Math.sin(u * Math.PI))], R(k, .5 + i * .05, .3), { seed: seed + 2 + i, lw: 1.3, a: .7 }); L([lf.P2(u * l, 0), lf.P2(u * l + l * .12, -w * .55 * Math.sin(u * Math.PI))], R(k, .5 + i * .05, .3), { seed: seed + 9 + i, lw: 1.3, a: .7 }); } return lf; }
// perspective ground lines to a vanishing point (the demo's road)
const ground = (k, hz = 980, vx = 600) => { [[-200, 1920], [260, 1920], [900, 1920], [1400, 1920]].forEach(([x, y], i) => L([[vx + (x - vx) * .02, hz + 4], [x, y]], R(k, i * .1, .6), { seed: 300 + i, lw: 2, a: .75 })); L([[0, hz], [W, hz]], R(k, 0, .5), { seed: 305, lw: 1.6, a: .6 }); };
const bareTree = (x, y, h, k, seed) => { L([[x, y], [x + 8, y - h]], k, { seed, lw: 3 }); for (let i = 0; i < 6; i++) { const by = y - h * (.45 + i * .09), d = i % 2 ? 1 : -1, l = 140 - i * 14; L([[x + 5, by], [x + d * l * .6, by - l * .5], [x + d * l, by - l * .55]], R(k, .3 + i * .08, .3), { seed: seed + 1 + i, lw: 2 }); L([[x + d * l * .6, by - l * .5], [x + d * l * .5, by - l * .95]], R(k, .4 + i * .08, .3), { seed: seed + 8 + i, lw: 1.6 }); } };

// ---------- A: hook: the ant walking on the forest floor; lens on the head: brain untouched ----------
function sceneA(t) { SM.begin(t, { hz: 900 }); SM.cam(1 + .03 * ss(t / 7), 540, 960);
  SM.sun(300, 640, 70, R(t, 0, 1.6)); ground(R(t, 0, 2)); bareTree(110, 1500, 1200, R(t, .2, 2.4), 400); trunk(960, 1450, 120, 46, R(t, .4, 2.2), 420);
  fern(780, 1520, .9, R(t, 1, 1.8), 430, -1); fern(160, 1700, .8, R(t, 1.4, 1.8), 450, 1);
  const wx = lerp(470, 640, t / 7.5); ant(wx, 1330, 2.3, t, { walk: t * 1.6, k: 1, brain: R(t, s(1) + .6, .6) });
  if (t > s(1)) { const lk = R(t, s(1), 1.1), hx = wx + 94 * 2.3, hy = 1330 - 64 * 2.3; L(E(hx, hy, 140, 140, 48), lk, { seed: 470, lw: 2.2 }); L([[hx + 100, hy + 100], [hx + 160, hy + 180]], R(lk, .7, .3), { seed: 471, lw: 6 });
    SM.text('brain: untouched', 640, 1000, { size: 58, write: R(t, s(1) + 1.2, .9), col: P.red }); }
  SM.reset(); SM.text('The Zombie Ant', 540, 300, { f: 'script', size: 150 }); SM.text('a true Halloween story', 540, 380, { size: 52, a: R(t, .3, .6), col: '#6a5f70' });
  SM.rain(t, { n: 10, a: .7 }); }

// ---------- B: the name, written on, with a rainforest building around it ----------
function sceneB(t) { const t0 = s(2); SM.begin(t, { hz: 1180, sky0: '#c3bfdc', sky1: '#d9c7d6', sky2: '#eed2b8' }); SM.cam(1.02 - .02 * R(t, t0, 4), 540, 960);
  [[120, 60], [330, 40], [760, 54], [960, 70]].forEach(([x, w], i) => trunk(x, 1500, 80, w, R(t, t0 - .3 + i * .2, 2), 500 + i * 3));
  for (let i = 0; i < 7; i++) leaf(80 + i * 150, 150 + (i % 2) * 70, 200, 50, .4 + i * .5, R(t, t0 + .4 + i * .15, 1), 520 + i * 20);
  fern(60, 1560, 1, R(t, t0 + .2, 1.6), 600, 1); fern(1020, 1580, 1.1, R(t, t0 + .5, 1.6), 640, -1); fern(520, 1600, .8, R(t, t0 + .9, 1.6), 680, 1);
  SM.text('Ophiocordyceps', 540, 860, { f: 'script', size: 128, write: R(t, t0 + .1, 1.6) }); L([[180, 900], [900, 890]], R(t, t0 + 1.6, .6), { seed: 700, lw: 2.4, col: P.red });
  SM.text('a fungus of tropical rainforests', 540, 990, { size: 56, write: R(t, t0 + 1.8, 1.2), col: '#5a5060' });
  for (let i = 0; i < 9; i++) SM.drop(200 + hash(i * 3) * 680, 1080 + hash(i * 5) * 180 - ((t - t0) * 20 % 40), 7 + hash(i) * 5, R(t, t0 + 2.4 + i * .1, .4) * .8);
  SM.reset(); SM.rain(t, { n: 8, a: .6 }); }

// ---------- C: the nest high in the trees, ~20 m up (camera tilts down the trunk) ----------
function sceneC(t) { const t0 = s(3), tilt = ss(R(t, t0, 3.6)); SM.begin(t, { hz: 1880, sky0: '#b6b8da', sky1: '#d8c4d8', sky2: '#f1d2b6' }); SM.cam(1, 540, lerp(700, 1220, tilt));
  trunk(540, 2300, 160, 90, R(t, t0 - .3, 1.4), 720); for (let i = 0; i < 9; i++) leaf(540 + (i % 2 ? 40 : -40), 200 + i * 28, 260, 60, (i % 2 ? -.3 : Math.PI + .3) + (i - 4) * .08, R(t, t0 + i * .08, .8), 740 + i * 20);
  const nk = R(t, t0 + .3, .8); SM.wash(E(560, 360, 110, 80, 30), '#cfb39a', nk); L(E(560, 360, 110, 80, 30), nk, { seed: 760, lw: 2.4 }); SM.text('nest', 720, 340, { size: 56, write: R(t, t0 + .9, .5) });
  for (let i = 0; i < 4; i++) { const u = ((t - t0) * .12 + i * .22) % 1; ant(590, lerp(500, 1400, u), .42, t, { rot: Math.PI / 2, walk: t * 2 + i, fill: .8 }); }
  const mk = R(t, t0 + 1.2, 1.4); L([[300, 300], [300, lerp(300, 2100, mk)]], mk, { seed: 770, lw: 2.2 }); L([[280, 330], [300, 300], [320, 330]], mk, { seed: 771, lw: 2.2 });
  if (mk >= 1) L([[280, 2070], [300, 2100], [320, 2070]], 1, { seed: 772, lw: 2.2 }); SM.text('about 20 m', 250, lerp(700, 1300, tilt), { size: 70, write: R(t, t0 + 1.8, .7), col: P.red, rot: -Math.PI / 2 });
  ground(R(t, t0 + 1.5, 1.5), 1880); SM.reset(); SM.rain(t, { n: 8, a: .6 }); }

// ---------- D: a random, drunken walk across the forest floor (dotted trail draws on) ----------
function sceneD(t) { const t0 = s(4); SM.begin(t, { hz: 760 }); SM.cam(1, 540, 960, 0, 0); ground(R(t, t0 - .2, 1.2), 760); bareTree(930, 1300, 700, R(t, t0, 1.6), 800); fern(80, 1560, 1, R(t, t0 + .3, 1.4), 820, 1);
  SM.sun(240, 520, 54, R(t, t0, 1.2));
  const path = []; for (let i = 0; i <= 80; i++) { const u = i / 80; path.push([lerp(120, 940, u) + Math.sin(u * 19) * 90 + Math.sin(u * 7.3) * 60, lerp(1500, 900, u) + Math.cos(u * 13) * 70]); }
  const pk = R(t, t0 + .2, 3.6), n = Math.floor(pk * 80); for (let i = 0; i < n; i += 2) SM.wash(E(path[i][0], path[i][1], 5, 3, 8), P.ink, 1, { op: .55, blur: .5, dx: 0, dy: 0 });
  const [ax, ay] = path[Math.max(0, n - 1)], [bx, by] = path[Math.min(80, n + 2)]; ant(ax, ay, .9, t, { walk: t * 2.4, flip: bx < ax, rot: Math.sin(t * 5) * .12 });
  SM.text('random "drunken walk"', 540, 1660, { size: 66, write: R(t, t0 + 1.4, 1), col: '#5a5060' }); SM.reset(); SM.rain(t, { n: 8, a: .6, rings: true, ry: 1300 }); }

// ---------- E: spasms: it tumbles and can't climb back ----------
function sceneE(t) { const t0 = s(5), u = R(t, t0 + .4, 1.4); SM.begin(t, { hz: 1350 }); SM.cam(1, 540, 960); ground(1, 1350); trunk(820, 1500, 100, 120, 1, 830);
  L([[820, 520], [560, 600], [380, 580]], 1, { seed: 840, lw: 3 }); leaf(380, 580, 160, 40, Math.PI + .3, 1, 850);
  const fx = lerp(560, 470, ss(u)), fy = lerp(560, 1340, u * u), rot = u * 4.2 + Math.sin(t * 30) * .08 * (1 - u);
  if (u < 1) for (let i = 0; i < 3; i++) L([[fx - 70 + i * 40, fy - 140 - i * 10], [fx - 70 + i * 40, fy - 220 - i * 10]], 1, { seed: 860 + i, lw: 1.6, a: .5 * (u > 0 ? 1 : 0) });
  ant(fx, fy, .9, t, { rot, walk: t * 6 });
  SM.text('can\'t climb back up', 540, 300, { size: 72, write: R(t, t0 + 1.2, 1), col: P.red }); L([[700, 1300], [780, 640]], R(t, t0 + 1.8, .6), { seed: 870, lw: 2, a: .6 }); SM.text('✕', 760, 820, { size: 80, a: R(t, t0 + 2.1, .3), col: P.red });
  SM.reset(); SM.rain(t, { n: 8, a: .6 }); }

// ---------- F: noon: up a small plant, bite the vein under a leaf ----------
function sceneF(t) { const t0 = s(6); SM.begin(t, { hz: 1500, sky0: '#c7c8e0', sky1: '#e8cdd0', sky2: '#f6dcbc' }); const z = lerp(1, 1.5, ss(R(t, t0 + 2.4, 1.8))); SM.cam(z, lerp(540, 600, ss(R(t, t0 + 2.4, 1.8))), lerp(960, 820, ss(R(t, t0 + 2.4, 1.8))));
  const sy = lerp(700, 260, ss(R(t, t0, 1.6))); SM.sun(820, sy, 80, 1); SM.text('noon', 820, sy + 150, { size: 60, write: R(t, t0 + .6, .5), col: '#8a6a50' });
  ground(1, 1500); const st = SM.bez([520, 1500], [500, 1200], [560, 1000], [540, 760], 30); L(st, R(t, t0, 1.2), { seed: 880, lw: 3 });
  const lf = leaf(540, 760, 300, 80, -.35, R(t, t0 + .5, 1), 890); leaf(530, 1100, 220, 60, Math.PI + .5, R(t, t0 + .8, 1), 910);
  const cl = ss(R(t, t0 + .6, 2.2)), [px, py] = st[Math.floor(lerp(0, 30, cl))];
  if (cl < 1) ant(px, py, .6, t, { rot: -Math.PI / 2 + .1, walk: t * 3, fill: .9 });
  else { const [vx, vy] = lf.P2(170, 0); ant(vx - 6, vy + 70, .6, t, { rot: Math.PI - .35, bite: true, hang: true, fill: .9 }); if (t > t0 + 3.1) SM.text('bite!', vx + 120, vy + 150, { size: 60, col: P.red, a: R(t, t0 + 3.1, .3) }); }
  SM.reset(); SM.text('under the leaf, on the vein', 540, 1420, { size: 58, write: R(t, t0 + 2.8, 1), col: '#5a5060' }); SM.rain(t, { n: 8, a: .6 }); }

// ---------- G: ~25 cm above the ground, humid air (ruler + hanging droplets) ----------
function sceneG(t) { const t0 = s(7); SM.begin(t, { hz: 1500, sky0: '#c2c6dc', sky1: '#dcd0dc', sky2: '#eedcca' }); SM.cam(1, 540, 960);
  ground(1, 1500); const st = SM.bez([620, 1500], [600, 1200], [660, 1000], [640, 760], 30); L(st, 1, { seed: 880, lw: 3 }); const lf = leaf(640, 760, 300, 80, -.35, 1, 890);
  const [vx, vy] = lf.P2(170, 0); ant(vx - 6, vy + 70, .6, t, { rot: Math.PI - .35, bite: true, hang: true, fill: .9 });
  const rk = R(t, t0 + .2, 1.2); L([[300, 1500], [300, lerp(1500, 800, rk)]], rk, { seed: 920, lw: 3 }); for (let i = 0; i <= 10; i++) L([[300, 1500 - i * 70], [i % 5 ? 330 : 350, 1500 - i * 70]], R(rk, i / 11, .2), { seed: 921 + i, lw: 2 });
  SM.text('~25 cm', 200, 1160, { size: 80, write: R(t, t0 + 1.2, .6), col: P.red, rot: -Math.PI / 2 });
  // humid air: mist washes + hanging drops on the leaf
  for (let i = 0; i < 4; i++) SM.wash(E(200 + i * 230, 1300 + Math.sin(t + i) * 20, 220, 40, 20), '#ffffff', R(t, t0 + 1.4, 1) * .6, { op: .5, blur: 12 });
  for (let i = 0; i < 5; i++) { const [x, y] = lf.P2(40 + i * 55, 30 + (i % 2) * 15); SM.drop(x, y + 14 + Math.sin(t * 2 + i) * 2, 8 + (i % 3) * 2, R(t, t0 + 1.6 + i * .15, .4)); }
  SM.text('humid', 860, 1250, { size: 66, write: R(t, t0 + 1.8, .5), col: '#6a7aa0' }); SM.reset(); SM.rain(t, { n: 10, a: .7, rings: true, ry: 1560 }); }

// ---------- H: jaw muscles waste away; the bite locks (close-up) ----------
function sceneH(t) { const t0 = s(8); SM.begin(t, { wash: .5, hz: 1920 }); SM.cam(1, 540, 960);
  const lf = leafShape(80, 560, 980, 210, .05); SM.wash(lf.pts, P.leaf, 1); L(lf.pts, 1, { seed: 940, lw: 3 }); L([[60, 560], [1080, 610]], 1, { seed: 941, lw: 9, col: P.leafD });
  ant(520, 1160, 3.0, t, { rot: Math.PI * .5 - .25, bite: true, hang: true, fill: .8 });
  const lk = R(t, t0 + 1.4, .8); if (lk > 0) { const x = 820, y = 1180; SM.wash(SM.ell(x, y + 30, 60, 50, 24), '#e6c27a', lk); L(SM.ell(x, y + 30, 60, 50, 24), lk, { seed: 950, lw: 3 }); L(SM.ell(x, y - 30, 38, 46, 20, Math.PI, TAU), lk, { seed: 951, lw: 6 }); }
  SM.text('jaw muscles waste away', 540, 300, { size: 68, write: R(t, t0, 1.2) }); SM.text('locked on', 820, 1360, { size: 64, write: R(t, t0 + 1.8, .6), col: P.red });
  SM.reset(); SM.rain(t, { n: 6, a: .55 }); }

// ---------- I: the question ----------
function sceneI(t) { const t0 = s(9); SM.begin(t, { hz: 1500 }); SM.cam(1, 540, 960); ground(1, 1500);
  ant(500, 1250, 2.2, t, { k: R(t, t0 - .2, 1.6), brain: 1 }); SM.text('?', 760, 820, { f: 'script', size: 260, a: R(t, t0 + .8, .4), col: P.red });
  SM.text('steering an ant', 540, 360, { f: 'script', size: 110, write: R(t, t0, 1.1) }); SM.text('without its brain?', 540, 500, { f: 'script', size: 110, write: R(t, t0 + .9, 1.1) });
  SM.reset(); SM.rain(t, { n: 8, a: .6 }); }

// ---------- J: 2017: fungal cells wrapped around the muscles, in a network; brain clear ----------
function sceneJ(t) { const t0 = s(10); SM.begin(t, { wash: .45, hz: 1920 }); SM.cam(1 + .03 * R(t, t0, 6), 540, 960);
  SM.text('Fredericksen et al., 2017', 540, 260, { size: 52, a: R(t, t0, .5), col: '#6a5f70' }); SM.text('inside the ant', 540, 360, { f: 'script', size: 110, write: R(t, t0 + .2, 1) });
  ant(560, 1180, 3.0, t, { fill: .45, brain: 1, net: R(t, t0 + 1.2, 3.6) });
  // muscle fibres in the legs/jaw (striped bundles), net reaches them
  for (let i = 0; i < 5; i++) L([[470 + i * 22, 1020], [430 + i * 30, 1100]], R(t, t0 + .6 + i * .1, .5), { seed: 960 + i, lw: 1.6, col: '#b0605a', a: .8 });
  SM.text('muscles + fungal network', 380, 1420, { size: 60, write: R(t, t0 + 2.6, 1), col: '#6d5a9a' }); L([[400, 1380], [520, 1180]], R(t, t0 + 2.8, .5), { seed: 970, lw: 2, a: .7 });
  SM.text('brain: no fungus', 800, 860, { size: 58, write: R(t, t0 + 4.2, .8), col: P.red }); L([[800, 880], [830, 960]], R(t, t0 + 4.6, .4), { seed: 971, lw: 2, a: .7 });
  SM.reset(); SM.rain(t, { n: 6, a: .5 }); }

// ---------- K: how it pulls the strings: still being worked out (puppet cross, fading strings) ----------
function sceneK(t) { const t0 = s(11); SM.begin(t, { hz: 1500, sky0: '#bdb6d4', sky1: '#d6c6d6', sky2: '#ead6c6' }); SM.cam(1, 540, 960); ground(1, 1500);
  const ck = R(t, t0, 1); L([[340, 520], [740, 520]], ck, { seed: 980, lw: 5 }); L([[540, 440], [540, 640]], ck, { seed: 981, lw: 5 }); const sw = Math.sin(t * 2) * 8;
  ant(560, 1300, 1.9, t, { walk: Math.sin(t * 2) * .1, rot: sw * .004, net: 1, brain: 1, fill: .6 });
  [[360, 520, 470, 1180], [540, 640, 560, 1150], [720, 520, 760, 1190], [450, 520, 330, 1180]].forEach(([a, b, c, d], i) => L([[a, b], [c + sw, d]], ck, { seed: 985 + i, lw: 1.4, a: .3 + .3 * Math.sin(t * 3 + i) ** 2, tip: false }));
  SM.text('?', 260, 760, { f: 'script', size: 180, a: R(t, t0 + .8, .4), col: P.red }); SM.text('?', 860, 820, { f: 'script', size: 140, a: R(t, t0 + 1.2, .4), col: P.red });
  SM.text('still being worked out', 540, 300, { size: 72, write: R(t, t0 + .4, 1.2) }); SM.reset(); SM.rain(t, { n: 8, a: .6 }); }

// ---------- L: within days, a stalk grows from the back of the head (plant-like line, non-gory) ----------
function sceneL(t) { const t0 = s(12); SM.begin(t, { hz: 1600, sky0: '#b4b0d2', sky1: '#d8c0cc', sky2: '#efcfb2' }); SM.cam(1.25, 560, 860);
  const st = SM.bez([620, 1600], [600, 1300], [660, 1100], [640, 860], 30); L(st, 1, { seed: 880, lw: 3 }); const lf = leaf(640, 860, 300, 80, -.35, 1, 890);
  const [vx, vy] = lf.P2(170, 0), ax = vx - 6, ay = vy + 70; ant(ax, ay, .6, t, { rot: Math.PI - .35, bite: true, hang: true, fill: .7, body: '#bfa294' });
  const days = Math.min(3, 1 + Math.floor(R(t, t0 + .4, 2.6) * 3)); SM.text('day ' + days, 360, 560, { size: 90, a: R(t, t0 + .4, .3), col: '#8a6a50' });
  // head position for the hanging ant: rotate the local head offset (94,-64)*.6 by (PI-.35)
  const r = Math.PI - .35, hx = ax + (94 * Math.cos(r) + 64 * Math.sin(r)) * .6, hy = ay + (94 * Math.sin(r) - 64 * Math.cos(r)) * .6;
  const gk = R(t, t0 + 1.0, 3.2), stalk = SM.bez([hx, hy], [hx - 40, hy + 80], [hx + 30, hy + 150], [hx - 10, hy + 240], 24);
  L(stalk, gk, { seed: 990, lw: 3.4, col: '#7d6aa8' }); if (gk > .95) { SM.wash(E(hx - 10, hy + 250, 16, 22, 16), P.lav, R(t, t0 + 4.2, .4), { op: .9 }); L(E(hx - 10, hy + 250, 16, 22, 16), R(t, t0 + 4.2, .4), { seed: 991, lw: 2.4, col: '#7d6aa8' }); }
  SM.text('a stalk grows', 820, 1300, { size: 62, write: R(t, t0 + 2.2, .8), col: '#6d5a9a' }); SM.reset(); SM.rain(t, { n: 6, a: .55 }); }

// ---------- M: spores drift down over the forest floor (the demo's raindrops, tinted) ----------
function sceneM(t) { const t0 = s(13); SM.begin(t, { hz: 1180, sky0: '#b4b0d2', sky1: '#d8c0cc', sky2: '#efcfb2' }); SM.cam(lerp(1.25, 1, ss(R(t, t0, 2))), lerp(560, 540, ss(R(t, t0, 2))), lerp(860, 960, ss(R(t, t0, 2))));
  ground(1, 1180); const st = SM.bez([620, 1180], [600, 1000], [660, 900], [640, 760], 30); L(st, 1, { seed: 880, lw: 3 }); const lf = leaf(640, 760, 300, 80, -.35, 1, 890);
  const [vx, vy] = lf.P2(170, 0), ax = vx - 6, ay = vy + 70; ant(ax, ay, .6, t, { rot: Math.PI - .35, bite: true, hang: true, fill: .7, body: '#bfa294' });
  const r = Math.PI - .35, hx = ax + (94 * Math.cos(r) + 64 * Math.sin(r)) * .6, hy = ay + (94 * Math.sin(r) - 64 * Math.cos(r)) * .6;
  L(SM.bez([hx, hy], [hx - 40, hy + 80], [hx + 30, hy + 150], [hx - 10, hy + 240], 24), 1, { seed: 990, lw: 3.4, col: '#7d6aa8' }); SM.wash(E(hx - 10, hy + 250, 16, 22, 16), P.lav, 1, { op: .9 });
  for (let i = 0; i < 26; i++) { const st0 = t0 + .3 + hash(i * 2.1) * 2.5, u = (t - st0) / 3; if (u <= 0) continue; const x = hx - 10 + (hash(i * 3.7) - .5) * 700 * Math.min(1, u * 1.4), y = hy + 260 + Math.min(u, 1.2) * 700;
    g.save(); g.globalAlpha = .9; SM.wash(E(x, y, 9, 9, 10), P.lav, 1, { op: .85, blur: .8, dx: 0, dy: 0 }); g.restore(); L(E(x, y, 9, 9, 10), 1, { seed: 1000 + i, lw: 1.3, col: '#7d6aa8', a: .7, tip: false }); }
  ant(lerp(100, 360, R(t, t0 + 1.4, 3)), 1700, .8, t, { walk: t * 2, fill: .9 }); SM.text('spores', 880, 1000, { f: 'script', size: 96, write: R(t, t0 + .8, .8), col: '#6d5a9a' });
  SM.text('to infect more ants', 640, 1840, { size: 58, write: R(t, t0 + 2.6, 1), col: '#5a5060' }); SM.reset(); SM.rain(t, { n: 6, a: .5 }); }

// ---------- N: a 48-million-year-old fossil leaf with the same bite marks ----------
function sceneN(t) { const t0 = s(14); SM.begin(t, { wash: .35, hz: 1920 }); SM.cam(1, 540, 960);
  const slab = [[130, 520], [960, 470], [1000, 1380], [100, 1420]]; SM.wash(slab, '#b8b0a8', R(t, t0, .8), { op: .8 }); L([...slab, slab[0]], R(t, t0, 1.2), { seed: 1100, lw: 3 });
  for (let i = 0; i < 9; i++) L([[180 + hash(i) * 700, 560 + hash(i * 3) * 760], [240 + hash(i) * 700, 580 + hash(i * 3) * 760]], R(t, t0 + .6, .6), { seed: 1110 + i, lw: 1.4, a: .5 });
  const lf = leafShape(200, 960, 700, 220, -.08); L(lf.pts, R(t, t0 + .5, 1.4), { seed: 1120, lw: 2.2, col: '#5d5550' }); L(lf.mid, R(t, t0 + .9, 1), { seed: 1121, lw: 4, col: '#5d5550' });
  for (let i = 0; i < 4; i++) { const [x, y] = lf.P2(200 + i * 100, 0), k = R(t, t0 + 2.0 + i * .2, .3); L(E(x - 14, y, 20, 14, 14), k, { seed: 1130 + i, lw: 4.5, col: P.red }); L(E(x + 20, y, 20, 14, 14), k, { seed: 1140 + i, lw: 4.5, col: P.red }); }
  SM.text('bite scars on the vein', 620, 1250, { size: 60, write: R(t, t0 + 2.6, .9), col: P.red });
  SM.text('48 million years old', 540, 300, { f: 'script', size: 110, write: R(t, t0, 1.4) }); SM.text('Messel Pit, Germany', 540, 400, { size: 56, a: R(t, t0 + 1.2, .5), col: '#6a5f70' });
  SM.reset(); SM.rain(t, { n: 6, a: .5 }); }

// ---------- O: it can't infect you: the walker with the red umbrella strolls through the rain ----------
function walker(x, y, sc, t, k) { g.save(); g.translate(x, y); g.scale(sc, sc); const st = Math.sin(t * 5) * 10;
  const can = SM.bez([-110, -330], [-60, -400], [60, -400], [110, -330], 20); SM.wash([...can, [110, -330], [-110, -330]], P.red, R(k, .3, .4), { op: .85 }); L(can, k, { seed: 1200, lw: 2.4 }); L([[-110, -330], [110, -330]], k, { seed: 1201, lw: 2 });
  for (let i = -2; i <= 2; i++) L([[0, -395], [i * 52, -332]], R(k, .2, .5), { seed: 1202 + i, lw: 1.4, a: .7 }); L([[0, -395], [6, -200]], k, { seed: 1210, lw: 2 });
  L(E(-10, -262, 20, 22, 18), k, { seed: 1211, lw: 2.2 }); const dress = [[-14, -238], [-46, -90], [34, -90], [8, -238]]; SM.wash(dress, '#b9b2cf', R(k, .4, .4), { op: .8 }); L([...dress, dress[0]], k, { seed: 1212, lw: 2.2 });
  L([[-20, -90], [-24 + st, 0]], k, { seed: 1213, lw: 2.2 }); L([[16, -90], [18 - st, 0]], k, { seed: 1214, lw: 2.2 }); L([[0, -210], [8, -180], [6, -200]], k, { seed: 1215, lw: 2 }); g.restore(); }
function sceneO(t) { const t0 = s(15); SM.begin(t, { hz: 1020 }); SM.cam(1, 540, 960); ground(1, 1020); bareTree(140, 1700, 1300, 1, 1300); trunk(960, 1600, 200, 60, 1, 1320);
  SM.sun(700, 760, 66, 1); walker(lerp(380, 620, R(t, t0 - .4, 4.2)), 1500, 1.25, t, R(t, t0 - .3, 1.2));
  // thermometer
  const th = R(t, t0 + .8, 1); L(SM.bez([840, 1500], [840, 1200], [840, 1200], [840, 1100], 8), th, { seed: 1330, lw: 3 }); L(SM.bez([880, 1500], [880, 1200], [880, 1200], [880, 1100], 8), th, { seed: 1331, lw: 3 }); L(E(860, 1540, 40, 40, 24), th, { seed: 1332, lw: 3 });
  SM.wash(E(860, 1540, 34, 34, 20), P.red, th, { op: .85 }); SM.wash([[848, 1510], [872, 1510], [872, lerp(1500, 1180, th)], [848, lerp(1500, 1180, th)]], P.red, th, { op: .85 }); SM.text('37 °C', 860, 1060, { size: 60, write: R(t, t0 + 1.6, .5), col: P.red });
  SM.text('too warm for it', 540, 300, { f: 'script', size: 110, write: R(t, t0 + .4, 1.2) }); SM.reset(); SM.rain(t, { n: 14, a: .8, rings: true, ry: 1560 }); }

// ---------- P: end card: script line written on, film dims to dark (demo ending) ----------
function sceneP(t) { const t0 = s(16) - .3; SM.begin(t, { hz: 1180 }); SM.cam(1, 540, 960); ground(1, 1180); SM.sun(540, 980, 74, 1); leaf(150, 1500, 240, 60, -.4, 1, 1400); ant(760, 1560, .9, t, { walk: t * 1.6, fill: .9 });
  SM.text('Follow for more of', 540, 520, { f: 'script', size: 110, write: R(t, t0, 1) }); SM.text('how it really works.', 540, 680, { f: 'script', size: 124, write: R(t, t0 + .8, 1.2), col: P.red });
  SM.text('@howitreallyworkstudio', 540, 800, { size: 54, a: R(t, t0 + 1.6, .5), col: '#6a5f70' }); SM.reset(); SM.rain(t, { n: 10, a: .7 }); }

// ---------- compositor: the demo cross-dissolves gently between drawings (no hard cuts) ----------
const SC = [[0, sceneA], [s(2) - .3, sceneB], [s(3) - .3, sceneC], [s(4) - .3, sceneD], [s(5) - .3, sceneE], [s(6) - .3, sceneF], [s(7) - .3, sceneG], [s(8) - .3, sceneH],
  [s(9) - .3, sceneI], [s(10) - .3, sceneJ], [s(11) - .3, sceneK], [s(12) - .3, sceneL], [s(13) - .3, sceneM], [s(14) - .3, sceneN], [s(15) - .3, sceneO], [s(16) - .4, sceneP]];
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; const bg = buf.getContext('2d');
const idx = t => { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; };
function scene(t) { const i = idx(t), u = R(t, SC[i][0], .5);
  if (i > 0 && u < 1) { SC[i - 1][1](t); bg.setTransform(1, 0, 0, 1, 0, 0); bg.drawImage(g.canvas, 0, 0); SC[i][1](t); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - ss(u); g.drawImage(buf, 0, 0); g.restore(); }
  else SC[i][1](t);
  const dark = clamp((t - (TOT - 1.6)) / 1.6) * .55; SM.finish(t, { dark });
  const ph = PH.findLast(p => t >= p.start - .2); if (ph && ph.i < PH.length - 1) SM.caption(ph, t, { out: PH[ph.i + 1].start - .12 }); }
window.DUR = TOT; window.seek = t => scene(t); window.render = window.seek;
// thumbnail / cover: the ant hanging from the leaf vein, stalk growing, script "Zombie Ants?"
window.thumb = () => { sceneL(s(12) + 4.4); SM.reset(); g.save(); g.globalAlpha = .97; g.filter = 'blur(10px)'; g.fillStyle = '#f1e8dc'; g.fillRect(50, 290, 980, 380); g.restore();
  SM.text('Zombie', 540, 470, { f: 'script', size: 210 }); SM.text('Ants', 540, 620, { f: 'script', size: 190, col: P.red }); SM.finish(1.3); };
window.seek(0); window.ready = true; window.READY = true;
