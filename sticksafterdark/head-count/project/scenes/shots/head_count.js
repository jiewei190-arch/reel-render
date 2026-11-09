// Sticks After Dark #3 "Head Count" (Instagram cut, ~69.5 s). Set + helpers in _camp.js (this project only).
import * as C from '/project/scenes/shots/_camp.js';
const K = C.K, { INK, clamp, lerp, prog, ease, noise, alpha, mix, rng } = K;

// voice timings (timeline/words.json)
const T = {
  c1: [11.78, 12.88, 14.01, 15.17, 16.33],        // first count
  n1: 18.39, n2: 20.15,                            // "Night one, five." / "Night two, five."
  c2: [32.78, 33.88, 35.01, 36.17, 37.33],        // night three count
  six: 39.27, five3: 47.54, myself: 64.84,
};
const POPS = [3.0, 39.27, 62.6, 65.95];
const OUT = 66.15;   // the fire goes out; end card at 66.7

// ------------------------------------------------------------------ the camp through a camera
// o: { c, fire, fog, me, sixth, friends:{...}, seatDark, turn, drift, darkAmt }
function world(g, t, o) {
  const gt = K.K.now, c = o.c;
  const [jx, jy] = K.drift(o.drift ?? 5);
  g.save(); C.cam(g, { ...c, dx: (c.dx || 0) + jx, dy: (c.dy || 0) + jy });
  C.woods(g, gt); C.tents(g);
  const fk = o.fire ?? 1;
  C.friends(g, gt, { ...(o.friends || {}), skip: (i) => (o.friends?.skip?.(i)) || (o.turn != null && i === 4) });
  C.fire(g, gt, { k: fk, pops: POPS });
  if (o.turn != null) { const f = C.FRIENDS[4]; const R = K.stickFigure(g, { ...C.SIT_SIDE }, { eyes: 'none', mouth: 'none' }, { x: f.x, y: f.y, s: f.s, flip: -1, anchor: 'hip', seed: f.seed }); C.turningHead(g, R.head[0], R.head[1], R.headR, o.turn, { dir: -1 }); C.logs(g, [[f.x, f.y + 12 * f.s, 150 * f.s]]); }
  if (o.me) C.me(g, gt);
  else if (o.seatDark) C.logs(g, [[C.ME.x, C.ME.y + 14, 150]]);
  if (o.extra) o.extra(g, gt);
  const L = C.glow(g, gt, { k: fk, pops: POPS });
  if (o.fog) C.fog(g, gt, o.fog);
  C.dark(g, gt, { k: Math.max(fk, 0.05), pops: POPS, amt: o.darkAmt ?? 0.84, r: o.darkR });
  // the sixth stands at the very edge of the light: drawn over the veil, only its rim catches the fire
  if (o.sixth) { K.lightPool(g, C.SIXTH.x - 60, C.SIXTH.y - 220, 300, C.ORANGE, 0.14); K.tallFigure(g, C.SIXTH.x, C.SIXTH.y, o.sixth.h || 400, { tilt: o.sixth.tilt ?? 0.42, lean: 0.03, rim: 1.1, a: o.sixth.a ?? 0.9, seed: 960 }); if (o.fog) C.fog(g, gt, o.fog * 0.6); }
  g.restore();
  return L;
}
const lerpC = (a, b, k) => ({ z: lerp(a.z, b.z, k), fx: lerp(a.fx ?? C.FIRE[0], b.fx ?? C.FIRE[0], k), fy: lerp(a.fy ?? C.FIRE[1], b.fy ?? C.FIRE[1], k), dx: lerp(a.dx || 0, b.dx || 0, k), dy: lerp(a.dy || 0, b.dy || 0, k) });
const heads = C.FRIENDS.map(f => C.headOf(f));
const countLight = (times) => (i) => { const d = K.K.now - times[i]; return d >= 0 && d < 0.7 ? 1 - d / 0.7 : 0; };
function fingerAt(c, keys) { let p = null; for (let i = 0; i < keys.length; i++) { const [tt, hi] = keys[i]; const tgt = C.under(heads[hi], c, C.FRIENDS[hi].s); if (!p) { p = tgt; continue; } const k = ease.inOut(prog(K.K.now, tt - 0.28, tt)); p = [lerp(p[0], tgt[0], k), lerp(p[1], tgt[1], k)]; } return p; }
const sweep = (t0, dt) => [0, 1, 2, 3, 4].map(i => t0 + i * dt);
const N3 = { fire: 0.6, fog: 1 };     // night three look: fire low, fog in

// ------------------------------------------------------------------ extra sets (this story only)
// the hike in: five of us walking in a line through the trees, a lantern up front
function hike(g, t, o = {}) {
  const gt = K.K.now, z = o.z ?? 1, gy = 1150, scroll = gt * 90;
  g.save(); K.camera(g, z, 540, gy - 200, 0, o.dy || 0);
  g.fillStyle = INK.bg; g.fillRect(-3000, -3000, 7000, 7000); g.fillStyle = '#0b0b0f'; g.fillRect(-3000, gy, 7000, 3000);
  K.chalk(g, [[-3000, gy], [4000, gy + 6]], { w: 3, a: 0.45, seed: 1201, double: false });
  const layer = (n, par, a, w, seed) => { const r = rng(seed); for (let i = 0; i < n; i++) { const span = 3400, x = ((r() * span - scroll * par) % span + span) % span - 1150; K.chalk(g, [[x, gy + 10 * par], [x + (r() - 0.5) * 40, -1600]], { w: w * (0.7 + r() * 0.6), a, seed: seed + i, double: false }); } };
  layer(o.dense ? 60 : 30, 0.4, 0.2, 2.5, 1300); layer(o.dense ? 30 : 14, 1.0, 0.45, 5, 1400);
  let lamp = null;
  for (let i = 0; i < 5; i++) {
    const x = 800 - i * 150, ph = gt * 1.15 + i * 0.27, R = K.stickFigure(g, K.walk(ph), { eyes: 'dot', mouth: 'flat', look: [1, 0] }, { x, y: gy, s: 0.85, seed: 1500 + i * 7 });
    // backpack
    const bx = lerp(R.hip[0], R.neck[0], 0.6) - 26, by = lerp(R.hip[1], R.neck[1], 0.6);
    K.rect(g, bx - 26, by - 40, 34, 70, { w: 3.5, seed: 1550 + i, a: 0.9 });
    if (i === 0) lamp = R.hR;
  }
  if (lamp) { g.fillStyle = mix(INK.bg, C.ORANGE, 0.9); g.beginPath(); g.arc(lamp[0], lamp[1] + 14, 9, 0, Math.PI * 2); g.fill(); K.lightPool(g, lamp[0], lamp[1] + 14, 520, C.ORANGE, 0.7 * C.fireLight(gt)); }
  K.darkness(g, 0.8, lamp ? [{ x: lamp[0] - 250, y: lamp[1], r: 900, k: 1 }] : []);
  g.restore();
}
// no signal: my hand holding a phone, empty bars + an X
function phoneShot(g, t) {
  const gt = K.K.now; g.save(); K.camera(g, 1, 540, 900, ...K.drift(8));
  C.woods(g, gt); K.darkness(g, 0.9, []);
  const px = 540, py = 860, w = 300, h = 560, tilt = -0.06 + noise(gt * 0.6, 3) * 0.03;
  g.save(); g.translate(px, py); g.rotate(tilt);
  g.fillStyle = mix(INK.bg, C.ORANGE, 0.22); g.fillRect(-w / 2 + 16, -h / 2 + 30, w - 32, h - 60);
  K.rect(g, -w / 2, -h / 2, w, h, { w: 6, seed: 1601 });
  for (let i = 0; i < 4; i++) K.rect(g, -70 + i * 30, -120 - i * 26, 18, 30 + i * 26, { w: 3.5, seed: 1610 + i, a: 0.9 });
  const xk = (Math.floor(gt * 2) % 2) ? 1 : 0.55;   // the X blinks
  K.line(g, 60, -190, 110, -140, { w: 7, seed: 1620, a: xk }); K.line(g, 110, -190, 60, -140, { w: 7, seed: 1621, a: xk });
  K.blob(g, 0, h / 2 + 40, 120, 70, INK.head, { seed: 1630 });   // hand
  for (let i = 0; i < 3; i++) K.chalk(g, [[-w / 2 - 4, 40 + i * 70], [-w / 2 + 30, 50 + i * 70]], { w: 9, seed: 1640 + i });
  g.restore();
  K.lightPool(g, px, py, 620, C.ORANGE, 0.55);
  g.restore();
}
// a big close-up of my own head in the firelight
function myFace(g, t, f, o = {}) {
  const gt = K.K.now; g.save(); K.camera(g, 1, 540, 900, ...K.drift(6));
  C.woods(g, gt); K.darkness(g, 0.86, []);
  const L = C.fireLight(gt);
  K.stickHead(g, 540 + (o.dx || 0), 780 + (o.dy || 0), 230, f, { tilt: o.tilt || 0, seed: 1701 });
  K.lightPool(g, 200, 1150, 900, C.ORANGE, 0.75 * L);
  g.restore();
}
// inside my tent: sloped walls glowing with the fire outside. shadows: number of figures cast on the wall
function tentInside(g, t, o = {}) {
  const gt = K.K.now, L = C.fireLight(gt, { k: 0.75 }), z = o.z ?? 1;
  g.save(); K.camera(g, z, 540, o.fy ?? 900, ...(o.d || [0, 0]));
  g.fillStyle = INK.bg; g.fillRect(-1000, -1000, 3000, 4000);
  const apex = [540, 220], bl = [-420, 1760], br = [1500, 1760];
  g.fillStyle = '#0a090b'; g.fillRect(-1000, 1560, 3000, 1000);
  K.fillPoly(g, [apex, br, bl], mix(INK.bg, C.ORANGE, 0.1 + 0.05 * L));
  K.lightPool(g, 540, 1050, 900, C.ORANGE, 0.45 * L);
  // shadows of people round the fire outside (heads + shoulders), wobbling with the flames
  const n = o.shadows || 0;
  for (let i = 0; i < n; i++) {
    const x = 250 + i * 145, y = (o.shY ?? 930) + (i % 2) * 26, s = 1 + 0.06 * noise(gt * 4, i), lean = noise(gt * 0.7, i + 30) * 8;
    g.save(); g.translate(x + lean, y); g.scale(s, s);
    g.fillStyle = alpha('#020203', 0.82); g.beginPath(); g.moveTo(-70, 150); g.quadraticCurveTo(-62, 52, -14, 40); g.lineTo(14, 40); g.quadraticCurveTo(62, 52, 70, 150); g.closePath(); g.fill();
    K.blob(g, 0, 0, 40, 42, alpha('#020203', 0.82), { seed: 1800 + i });
    g.restore();
  }
  // seams + door zip
  for (const k of [-0.62, -0.3, 0.3, 0.62]) K.chalk(g, [apex, [540 + k * 960, 1760]], { w: 2.5, a: 0.4, seed: 1810 + Math.round(k * 10), double: false });
  K.chalk(g, [apex, bl], { w: 5, seed: 1820 }); K.chalk(g, [apex, br], { w: 5, seed: 1821 });
  K.chalk(g, [[540, 260], [540, 1560]], { w: 3, a: 0.55, seed: 1822 }); K.chalk(g, [[-400, 1560], [1480, 1564]], { w: 4, a: 0.7, seed: 1823 });
  if (o.me) {
    // me lying on my back (head to the right), eyes open, looking up
    g.save(); g.translate(60, o.meY ?? 1200); g.rotate(Math.PI / 2);
    g.fillStyle = alpha('#030304', 0.7); g.fillRect(-80, -330, 160, 340);                 // sleeping bag
    const RR = K.stickFigure(g, 'freeze', { eyes: 'none', mouth: 'none' }, { x: 0, y: 0, s: 1.55, seed: 1830 });
    K.rect(g, -82, -330, 164, 340, { w: 4, seed: 1831, a: 0.8 });
    g.restore();
    const hx = 60 - RR.head[1], hy = (o.meY ?? 1200) + RR.head[0];   // rig coords -> rotated world (rot +90)
    K.face(g, hx, hy, RR.headR, { eyes: o.eyes || 'dot', mouth: 'flat', look: [0, -1], brows: o.brows || null, blink: o.blink || 0 }, { seed: 1832 });
  }
  K.darkness(g, 0.35, [{ x: 540, y: 1000, r: 900, k: 1 }]);
  g.restore();
}

// ------------------------------------------------------------------ shots
// h01 0-2.35  "Five of us went camping." the five of us hiking in, a lantern up front
K.stickShot('h01', (g, t) => hike(g, t, { z: lerp(1.05, 1.15, t / 2.35), dy: 120 }));
// h02 2.35-4.0  "Way out in the woods." tiny in a lot of trees
K.stickShot('h02', (g, t) => hike(g, t, { z: lerp(0.5, 0.45, t / 1.65), dy: 260, dense: true }));
// h03 4.0-5.7  "No signal."
K.stickShot('h03', (g, t) => phoneShot(g, t));
// h04 5.7-7.0  "I'm the one who worries,"
K.stickShot('h04', (g, t) => myFace(g, t, { eyes: 'dot', brows: 'worried', mouth: 'frown', look: [noise(K.K.now * 1.3, 2), 0.1] }));
// h05 7.0-8.5  "so I made a rule." me standing, one finger up, the others round the fire
K.stickShot('h05', (g, t) => world(g, t, { c: { z: 1.2, dy: -60 }, friends: { lookAtMe: true }, extra: (g2, gt) => { const k = ease.out(prog(t, 0.1, 0.6)); const R = K.stickFigure(g2, { ...K.POSES.stand, aR: [lerp(0.2, 2.95, k), 0.05] }, {}, { x: C.ME.x + 250, y: C.ME.y + 330, s: 1.45, back: true, seed: 1901, w: 9 }); K.chalk(g2, [R.hR, [R.hR[0] + 4, R.hR[1] - 30]], { w: 6, seed: 1902 }); } }));
// h06 8.5-10.1  "Every night by the fire," the fire, close
K.stickShot('h06', (g, t) => world(g, t, { c: { z: lerp(2.0, 2.2, t / 1.6), fy: 900, dy: 140 } }));
// h07 10.1-11.6  "I counted heads." my arm comes up
K.stickShot('h07', (g, t) => { const c = { z: 1.3, dy: 90, dx: 30 }; world(g, t, { c, friends: { lookAtMe: true } }); const k = ease.out(prog(t, 0.5, 1.4)), tgt = C.under(heads[0], c, C.FRIENDS[0].s); C.hand(g, [lerp(tgt[0] + 200, tgt[0], k), lerp(tgt[1] + 700, tgt[1], k)]); });
// h08-h10  "One. Two. Three. Four. Five."
K.stickShot('h08', (g, t) => { const c = { z: 1.35, dy: 90, dx: 120 }; world(g, t, { c, friends: { lookAtMe: true, light: countLight(T.c1) } }); C.hand(g, fingerAt(c, [[T.c1[0], 0], [T.c1[1], 1], [T.c1[2], 2]])); });
K.stickShot('h09', (g, t) => { const c = { z: 1.5, dy: 110, dx: -40 }; world(g, t, { c, friends: { lookAtMe: true, light: countLight(T.c1) } }); C.hand(g, fingerAt(c, [[T.c1[2], 2], [T.c1[3], 3], [T.c1[4], 4]])); });
K.stickShot('h10', (g, t) => { const h = heads[4], c = { z: lerp(2.3, 2.45, t / 1.4), fx: h[0], fy: h[1], dx: -90, dy: -120 }; world(g, t, { c, friends: { lookAtMe: true, light: countLight([0, 0, 0, 0, T.c1[4]]) } }); C.hand(g, C.under(h, c, C.FRIENDS[4].s)); });
// h11 17.6-19.4  "Night one, five." quick count, wide
K.stickShot('h11', (g, t) => { const c = { z: 1.22, dy: 40 }, ts = sweep(17.85, 0.13); world(g, t, { c, friends: { light: countLight(ts) } }); C.hand(g, fingerAt(c, ts.map((tt, i) => [tt, i]))); });
// h12 19.4-21.1  "Night two, five." another night, another angle
K.stickShot('h12', (g, t) => { const c = { z: 1.42, dy: 70, dx: 60, fx: 480 }, ts = sweep(19.62, 0.12); world(g, t, { c, friends: { light: countLight(ts), faces: (i) => i === 1 ? { mouth: 'smile', look: [0, 0.2] } : null } }); C.hand(g, fingerAt(c, ts.map((tt, i) => [tt, i]))); });
// h13 21.1-22.6  "Everyone made fun of me." laughing at me
K.stickShot('h13', (g, t) => world(g, t, { c: { z: 1.6, fx: 560, fy: 900, dy: 120 }, friends: { lookAtMe: true, faces: () => ({ eyes: 'closed', mouth: 'grin' }), hop: (i) => Math.abs(Math.sin(t * 7 + i * 1.3)) * 10, tilt: (i) => Math.sin(t * 6 + i) * 0.1 } }));
// h14 22.6-23.9  me, embarrassed
K.stickShot('h14', (g, t) => myFace(g, t, { eyes: 'dot', brows: 'worried', mouth: { w: 0.4, c: -0.05, o: 0 }, look: [-0.8, 0.6] }, { tilt: -0.12 }));
// h15 23.9-26.3  "Night three, the fog rolled in." wide, fog drifts in
K.stickShot('h15', (g, t) => world(g, t, { c: { z: lerp(1.0, 1.08, t / 2.4), dy: -20 }, fog: ease.inOut(prog(t, 0, 2.0)), fire: lerp(1, 0.8, t / 2.4), friends: { faces: () => ({ look: [0, -0.2] }) } }));
// h16 26.3-28.0  "The fire got low." close on the fire, sinking
K.stickShot('h16', (g, t) => world(g, t, { c: { z: lerp(2.0, 2.1, t / 1.7), fy: 900, dy: 140 }, fire: lerp(0.8, 0.55, ease.inOut(t / 1.7)), fog: 0.8 }));
// h17 28.0-29.4  "Someone told a ghost story." torch under the chin
const STORY_POSE = { aL: [-0.45, -2.3], aR: [0.45, 2.3] };
K.stickShot('h17', (g, t) => { const h = heads[2]; world(g, t, { c: { z: lerp(2.5, 2.7, t / 1.4), fx: h[0], fy: h[1], dx: 0, dy: -60 }, ...N3, friends: { pose: (i) => i === 2 ? STORY_POSE : null, faces: (i) => i === 2 ? { eyes: 'wide', mouth: 'grin', look: [0, 0] } : null, after: (g2, i, R) => { if (i !== 2) return; const hx = (R.hL[0] + R.hR[0]) / 2, hy = (R.hL[1] + R.hR[1]) / 2; K.rect(g2, hx - 9, hy - 4, 18, 30, { w: 3, seed: 1950 }); K.lightPool(g2, hx, hy - 20, 160, '#ffffff', 0.9 * (0.85 + 0.15 * noise(K.K.now * 9, 4))); } } }); });
// h18 29.4-30.4  the listeners lean in
K.stickShot('h18', (g, t) => world(g, t, { c: { z: 1.75, fx: 330, fy: 900, dy: 120, dx: 120 }, ...N3, friends: { pose: (i) => i === 2 ? STORY_POSE : (i < 2 ? { lean: 0.12 } : null), faces: (i) => i === 2 ? { eyes: 'wide', mouth: 'grin' } : { eyes: 'wide', mouth: 'o', look: [(C.FRIENDS[2].x - C.FRIENDS[i].x) / 300, 0] } } }));
// h19 30.4-32.6  "I counted, like always."
K.stickShot('h19', (g, t) => { const c = { z: 1.3, dy: 90, dx: 30 }; world(g, t, { c, ...N3, friends: { lookAtMe: true } }); const k = ease.out(prog(t, 0.8, 1.9)), tgt = C.under(heads[0], c, C.FRIENDS[0].s); C.hand(g, [lerp(tgt[0] + 200, tgt[0], k), lerp(tgt[1] + 700, tgt[1], k)]); });
// h20-h22  the night-three count
K.stickShot('h20', (g, t) => { const c = { z: 1.35, dy: 90, dx: 120 }; world(g, t, { c, ...N3, friends: { lookAtMe: true, light: countLight(T.c2) } }); C.hand(g, fingerAt(c, [[T.c2[0], 0], [T.c2[1], 1], [T.c2[2], 2]])); });
K.stickShot('h21', (g, t) => { const c = { z: 1.5, dy: 110, dx: -40 }; world(g, t, { c, ...N3, friends: { lookAtMe: true, light: countLight(T.c2) } }); C.hand(g, fingerAt(c, [[T.c2[2], 2], [T.c2[3], 3]])); });
K.stickShot('h22', (g, t) => { const h = heads[4], c = { z: lerp(2.3, 2.45, t / 1.4), fx: h[0], fy: h[1], dx: -90, dy: -120 }; world(g, t, { c, ...N3, friends: { lookAtMe: true, light: countLight([0, 0, 0, 0, T.c2[4]]) } }); C.hand(g, C.under(h, c, C.FRIENDS[4].s)); });
// h23 38.6-41.0  ...silence... "Six." the sixth at the edge of the light, in the fog
K.stickShot('h23', (g, t) => {
  const gt = K.K.now, c = { z: lerp(1.25, 1.45, ease.out(t / 2.4)), fx: 470, fy: 880, dx: 40, dy: 60 };
  world(g, t, { c, ...N3, sixth: { h: 500, a: 0.9 * ease.inOut(prog(gt, 38.7, 39.25)), tilt: 0.42 + 0.06 * ease.inOut(prog(gt, 39.3, 40.6)) }, friends: { lookAtMe: true } });
  const tip = C.toScreen(c, [C.SIXTH.x, C.SIXTH.y - 260]), k = ease.inOut(prog(gt, 38.75, 39.25)), from = C.under(heads[4], c, C.FRIENDS[4].s);
  C.hand(g, [lerp(from[0], tip[0], k), lerp(from[1], tip[1], k)], { base: [300, 1980] });
});
// h24 41.0-42.6  "Everyone laughed." the edge is empty now
K.stickShot('h24', (g, t) => world(g, t, { c: { z: 1.6, fx: 560, fy: 900, dy: 120 }, ...N3, friends: { lookAtMe: true, faces: () => ({ eyes: 'closed', mouth: 'grin' }), hop: (i) => Math.abs(Math.sin(t * 7 + i * 1.3)) * 10, tilt: (i) => Math.sin(t * 6 + i) * 0.1 } }));
// h25 42.6-45.2  "They said I counted someone twice." one head, doubled
K.stickShot('h25', (g, t) => { const h = heads[1]; world(g, t, { c: { z: lerp(2.0, 2.2, t / 2.6), fx: h[0], fy: h[1], dx: 60, dy: -40 }, ...N3, friends: { lookAtMe: true, faces: (i) => i === 1 ? { mouth: 'smile' } : { mouth: 'grin', eyes: 'closed' }, after: (g2, i, R) => { if (i !== 1) return; const off = R.headR * (1.1 + 0.5 * Math.sin(K.K.now * 2.2)); K.stickHead(g2, R.head[0] + off, R.head[1] - 4, R.headR, { mouth: 'smile', look: [0, 0.2] }, { neck: false, a: 0.45, seed: 1960 }); } } }); });
// h26 45.2-47.4  "So I counted again, slowly."
K.stickShot('h26', (g, t) => { const c = { z: 1.32, dy: 90, dx: 40 }, ts = [45.5, 45.95, 46.4, 46.85, T.five3]; world(g, t, { c, ...N3, friends: { lookAtMe: true, light: countLight(ts) } }); C.hand(g, fingerAt(c, ts.map((tt, i) => [tt, i]))); });
// h27 47.4-49.3  "Five." lands on five, the arm lowers
K.stickShot('h27', (g, t) => { const c = { z: lerp(1.32, 1.22, t / 1.9), dy: 90, dx: 40 }; world(g, t, { c, ...N3, friends: { lookAtMe: true, light: countLight([0, 0, 0, 0, T.five3]) } }); const p = C.under(heads[4], c, C.FRIENDS[4].s), k = ease.inOut(prog(t, 1.0, 1.9)); C.hand(g, [lerp(p[0], p[0] + 250, k), lerp(p[1], p[1] + 800, k)]); });
// h28 49.3-51.2  "Good." the circle of five, calm
K.stickShot('h28', (g, t) => world(g, t, { c: { z: lerp(1.36, 1.3, t / 1.9), dy: -20 }, ...N3, friends: { faces: () => ({ mouth: 'smile' }) } }));
// h29 51.2-53.0  "I felt stupid."
K.stickShot('h29', (g, t) => myFace(g, t, { eyes: 'half', mouth: 'frown', look: [0.2, 1] }, { tilt: 0.1 + 0.05 * ease.inOut(t / 1.8), dy: 20 * ease.inOut(t / 1.8) }));
// h30 53.0-55.0  "I went back to my spot." I walk back to my log at the front, in the dark
K.stickShot('h30', (g, t) => world(g, t, { c: { z: 1.3, fy: 1150, dy: -180 }, ...N3, drift: 3, seatDark: t >= 1.5, me: t >= 1.5, extra: t < 1.5 ? (g2) => { const x = lerp(C.ME.x - 380, C.ME.x, ease.out(t / 1.5)); K.stickFigure(g2, K.walk(t * 1.2), {}, { x, y: C.ME.y + 230, s: 1.15, back: true, seed: 1970 }); C.logs(g2, [[C.ME.x, C.ME.y + 14, 150]]); } : null }));
// h31 55.0-56.9  "Later," the tents, the fire down to embers
K.stickShot('h31', (g, t) => world(g, t, { c: { z: lerp(1.3, 1.38, t / 1.9), fx: 420, fy: 900, dx: 100, dy: 40 }, fire: 0.3, fog: 1, darkAmt: 0.86, darkR: 1200, friends: { skip: () => true } }));
// h32 56.9-58.6  "lying in my tent, I went over it again."
K.stickShot('h32', (g, t) => tentInside(g, t, { me: true, meY: 1150, z: lerp(1.0, 1.06, t / 1.7), eyes: 'dot', blink: ((K.K.now - 57.6) > 0 && (K.K.now - 57.6) < 0.15) ? 1 : 0 }));
// h33 58.6-60.1  "Five of us." five shadows on the tent wall
K.stickShot('h33', (g, t) => tentInside(g, t, { shadows: 5, z: lerp(1.35, 1.42, t / 1.5), fy: 1000 }));
// h34 60.1-61.6  "Four friends, and me." my eyes open wide under the five shadows
K.stickShot('h34', (g, t) => tentInside(g, t, { shadows: 5, shY: 640, me: true, meY: 1150, eyes: 'wide', brows: 'worried', z: lerp(1.0, 1.05, t / 1.5) }));
// h35 61.6-63.75  held, silent: my log at the front, in the dark where I can't see it. the fire pops
K.stickShot('h35', (g, t) => world(g, t, { c: { z: lerp(1.3, 1.24, t / 2.15), fy: 1150, dy: -180 }, ...N3, seatDark: true, drift: 2 }));
// h36 63.75-64.8  "And I never count..." pull back: me, from behind. six round the fire
K.stickShot('h36', (g, t) => world(g, t, { c: lerpC({ z: 1.45, fy: 1150, dy: -260 }, { z: 1.08, fy: 1100, dy: -230 }, ease.inOut(t / 1.05)), ...N3, me: true, turn: 0 }));
// h37 64.8-66.7  "...myself." the one on the right slowly turns its head to the camera. pop, the fire goes out.
K.stickShot('h37', (g, t) => {
  const gt = K.K.now, h = heads[4], k = ease.inOut(prog(gt, 64.95, 65.95)), fk = 0.6 * (1 - ease.in(prog(gt, OUT - 0.15, OUT + 0.12)));
  world(g, t, { c: { z: lerp(1.6, 1.85, ease.out(t / 1.9)), fx: h[0], fy: h[1], dx: -170, dy: -160 }, fog: 0.7, me: true, turn: k, fire: fk, darkAmt: gt > OUT ? 0.95 : 0.84, drift: 3 });
}, { jitter: [T.myself] });
// h38 end card
K.stickShot('h38', (g, t) => K.endCard(g, t), { captions: false, fx: false });
