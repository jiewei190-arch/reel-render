// Sticks After Dark #3 "Head Count". Set + helpers in _camp.js (this project only).
import * as C from '/project/scenes/shots/_camp.js';
const K = C.K, { clamp, lerp, prog, ease, noise } = K;

// voice timings (timeline/words.json)
const T = { one: 5.742, two: 6.838, three: 7.97, four: 9.133, five: 10.292, six: 13.117, laughed: 14.1, again: 15.66, five2: 17.27, good: 19.21, then: 22.19, myself: 23.98, end: 25.9 };
const POPS = [1.25, 13.1, 21.25, 25.15];
const OUT = 25.3;   // the fire goes out

// one call draws the whole camp through a camera. o: { c, fire, me, sixth, friends:{...}, seatDark, turn }
function world(g, t, o) {
  const gt = K.K.now, c = o.c;
  const [jx, jy] = K.drift(o.drift ?? 5);
  g.save(); C.cam(g, { ...c, dx: (c.dx || 0) + jx, dy: (c.dy || 0) + jy });
  C.woods(g, gt); C.tents(g);
  const fk = o.fire ?? 1;
  // sixth (behind the ring, at the edge of the light)
  // back half of the ring first, fire, then front half (simple depth)
  C.friends(g, gt, { ...(o.friends || {}), skip: (i) => (o.friends?.skip?.(i)) || (o.turn != null && i === 4) });
  C.fire(g, gt, { k: fk, pops: POPS });
  if (o.turn != null) { const f = C.FRIENDS[4]; const pose = { ...C.SIT_SIDE }; const R = K.stickFigure(g, pose, { eyes: 'none', mouth: 'none' }, { x: f.x, y: f.y, s: f.s, flip: -1, anchor: 'hip', seed: f.seed }); C.turningHead(g, R.head[0], R.head[1], R.headR, o.turn, { dir: -1 }); C.logs(g, [[f.x, f.y + 12 * f.s, 150 * f.s]]); }
  if (o.me) C.me(g, gt);
  else if (o.seatDark) C.logs(g, [[C.ME.x, C.ME.y + 14, 150]]);
  const L = C.glow(g, gt, { k: fk, pops: POPS });
  C.dark(g, gt, { k: Math.max(fk, 0.05), pops: POPS, amt: o.darkAmt ?? 0.84, r: o.darkR });
  // the sixth stands at the very edge of the light: drawn over the veil, only its rim catches the fire
  if (o.sixth) { K.lightPool(g, C.SIXTH.x - 60, C.SIXTH.y - 220, 300, C.ORANGE, 0.14); K.tallFigure(g, C.SIXTH.x, C.SIXTH.y, o.sixth.h || 400, { tilt: o.sixth.tilt ?? 0.42, lean: 0.03, rim: 1.1, a: 0.9, seed: 960 }); }
  g.restore();
  return L;
}
const lerpC = (a, b, k) => ({ z: lerp(a.z, b.z, k), fx: lerp(a.fx ?? C.FIRE[0], b.fx ?? C.FIRE[0], k), fy: lerp(a.fy ?? C.FIRE[1], b.fy ?? C.FIRE[1], k), dx: lerp(a.dx || 0, b.dx || 0, k), dy: lerp(a.dy || 0, b.dy || 0, k) });
const heads = C.FRIENDS.map(f => C.headOf(f));
const countLight = (times) => (i) => { const d = K.K.now - times[i]; return d >= 0 && d < 0.7 ? 1 - d / 0.7 : 0; };
// fingertip path through a list of [time, headIndex]
function fingerAt(c, keys) { let p = null; for (let i = 0; i < keys.length; i++) { const [tt, hi] = keys[i]; const tgt = C.under(heads[hi], c, C.FRIENDS[hi].s); if (!p) { p = tgt; continue; } const k = ease.inOut(prog(K.K.now, tt - 0.28, tt)); p = [lerp(p[0], tgt[0], k), lerp(p[1], tgt[1], k)]; } return p; }

// s01 0-2.5  wide woods, fire already going, five round it. slow push-in
K.stickShot('s01', (g, t) => { world(g, t, { c: { z: lerp(1.25, 1.38, t / 2.5), dy: -20 } }); });
// s02 2.5-4.0  the fire, close; sparks
K.stickShot('s02', (g, t) => { world(g, t, { c: { z: lerp(2.0, 2.2, t / 1.5), fy: 900, dy: 140 } }); });
// s03 4.0-5.6  my arm comes up to count
K.stickShot('s03', (g, t) => {
  const c = { z: 1.3, dy: 90, dx: 30 }; world(g, t, { c, friends: { lookAtMe: true } });
  const k = ease.out(prog(t, 0.6, 1.5)), tgt = C.under(heads[0], c, C.FRIENDS[0].s);
  C.hand(g, [lerp(tgt[0] + 200, tgt[0], k), lerp(tgt[1] + 700, tgt[1], k)]);
});
// s04 5.6-8.0  "One. Two."
K.stickShot('s04', (g, t) => { const c = { z: 1.35, dy: 90, dx: 120 }; world(g, t, { c, friends: { lookAtMe: true, light: countLight([T.one, T.two, T.three, T.four, T.five]) } }); C.hand(g, fingerAt(c, [[T.one, 0], [T.two, 1], [T.three, 2]])); });
// s05 8.0-10.2  "Three. Four."
K.stickShot('s05', (g, t) => { const c = { z: 1.5, dy: 110, dx: -40 }; world(g, t, { c, friends: { lookAtMe: true, light: countLight([T.one, T.two, T.three, T.four, T.five]) } }); C.hand(g, fingerAt(c, [[T.three, 2], [T.four, 3], [T.five, 4]])); });
// s06 10.2-11.6  "Five." close on the fifth
K.stickShot('s06', (g, t) => { const h = heads[4], c = { z: lerp(2.3, 2.45, t / 1.4), fx: h[0], fy: h[1], dx: -90, dy: -120 }; world(g, t, { c, friends: { lookAtMe: true, light: countLight([0, 0, 0, 0, T.five]) } }); C.hand(g, C.under(h, c, C.FRIENDS[4].s)); });
// s07 11.6-12.9  "On night three" — wider, tents, fire lower
K.stickShot('s07', (g, t) => { world(g, t, { c: { z: lerp(1.12, 1.18, t / 1.3), dy: -40, dx: -30 }, fire: 0.7 }); });
// s08 12.9-14.05  "I counted six." the sixth at the edge of the light
K.stickShot('s08', (g, t) => {
  const c = { z: lerp(1.25, 1.45, ease.out(t / 1.15)), fx: 470, fy: 880, dx: 40, dy: 60 };
  world(g, t, { c, fire: 0.75, sixth: { h: 500, tilt: 0.42 + 0.06 * ease.inOut(prog(t, 0.2, 1.1)) }, friends: { lookAtMe: true } });
  const tip = C.toScreen(c, [C.SIXTH.x, C.SIXTH.y - 260]), k = ease.out(prog(t, 0.0, 0.25)), from = C.under(heads[4], c, C.FRIENDS[4].s);
  C.hand(g, [lerp(from[0], tip[0], k), lerp(from[1], tip[1], k)], { base: [300, 1980] });
});
// s09 14.05-15.6  "Everyone laughed." the edge is empty now
K.stickShot('s09', (g, t) => { world(g, t, { c: { z: 1.6, fx: 560, fy: 900, dy: 120 }, fire: 0.8, friends: { lookAtMe: true, faces: () => ({ eyes: 'closed', mouth: 'grin' }), hop: (i) => Math.abs(Math.sin((t * 7 + i * 1.3))) * 10, tilt: (i) => Math.sin(t * 6 + i) * 0.1 } }); });
// s10 15.6-17.2  "I counted again." quick sweep
K.stickShot('s10', (g, t) => { const c = { z: 1.32, dy: 90, dx: 40 }; const ts = [15.95, 16.25, 16.55, 16.85, T.five2]; world(g, t, { c, friends: { lookAtMe: true, light: countLight(ts) } }); C.hand(g, fingerAt(c, ts.map((tt, i) => [tt, i]))); });
// s11 17.2-19.1  "Five." lands on five, the arm lowers
K.stickShot('s11', (g, t) => { const c = { z: lerp(1.32, 1.22, t / 1.9), dy: 90, dx: 40 }; world(g, t, { c, friends: { lookAtMe: true, light: countLight([0, 0, 0, 0, T.five2]) } }); const p = C.under(heads[4], c, C.FRIENDS[4].s), k = ease.inOut(prog(t, 1.0, 1.9)); C.hand(g, [lerp(p[0], p[0] + 250, k), lerp(p[1], p[1] + 800, k)]); });
// s12 19.1-20.6  "Good." the circle of five, calm
K.stickShot('s12', (g, t) => { world(g, t, { c: { z: lerp(1.36, 1.3, t / 1.5), dy: -20 }, friends: { faces: () => ({ mouth: 'smile' }) } }); });
// s13 20.6-22.15  held, silent: a log at the front, in the dark where I can't see it (my own seat)
K.stickShot('s13', (g, t) => { world(g, t, { c: { z: lerp(1.3, 1.24, t / 1.55), fy: 1150, dy: -180 }, seatDark: true, drift: 2 }); });
// s14 22.15-23.9  "Then I realized I never count..." camera pulls back: me, from behind. six round the fire
K.stickShot('s14', (g, t) => { world(g, t, { c: lerpC({ z: 1.45, fy: 1150, dy: -260 }, { z: 1.08, fy: 1100, dy: -230 }, ease.inOut(t / 1.75)), me: true, turn: 0 }); });
// s15 23.9-25.9  "...myself." the one on the right slowly turns its head to the camera. pop, the fire goes out.
K.stickShot('s15', (g, t) => {
  const gt = K.K.now, h = heads[4], k = ease.inOut(prog(gt, 24.05, 25.05)), fk = 1 - ease.in(prog(gt, OUT - 0.15, OUT + 0.12));
  world(g, t, { c: { z: lerp(1.6, 1.85, ease.out(t / 2)), fx: h[0], fy: h[1], dx: -170, dy: -160 }, me: true, turn: k, fire: fk, darkAmt: gt > OUT ? 0.95 : 0.84, drift: 3 });
}, { jitter: [T.myself] });
// s16 end card
K.stickShot('s16', (g, t) => K.endCard(g, t), { captions: false, fx: false });
