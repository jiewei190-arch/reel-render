// Sticks After Dark #1 "Mirror Lag". Bathroom at night, one accent: sickly yellow bulb.
import * as K from '/kits/sticks/sticks.js';
const { INK, stickFigure, stickHead, POSES, ease, prog, key, clamp, lerp } = K;
K.setAccent('yellow');

const MIRROR = [330, 560, 420, 430];
const BULB_DIES = 23.75;
const light = (seed = 3, extra = {}) => K.flicker({ seed, depth: 0.16, dips: 0.5, ...extra });
const brushPose = (t) => ({ ...POSES.brush, aR: [0.55 + 0.05 * Math.sin(t * 17), 2.55 + 0.16 * Math.sin(t * 17)] });
function toothbrush(g, hand, k = 1) { K.chalk(g, [[hand[0] - 6 * k, hand[1] + 4 * k], [hand[0] - 40 * k, hand[1] - 6 * k]], { w: 5 * k, double: false, seed: 77 }); }

// the over-the-shoulder bathroom: real figure from the back, reflection inside the mirror
function bathroomOTS(g, t, o = {}) {
  const { realPose, reflPose, reflFace = {}, swing = Math.sin(t * 1.7 + 0.6) * 0.14, on = light(), z = 1, brushing = true } = o;
  g.save(); K.camera(g, z, 540, 820, ...K.drift(5));
  const L = K.bathroom(g, t, { mirror: MIRROR });
  const [bx, by] = K.bulb(g, 540, -40, { len: 360, swing, on, glowR: 620 });
  K.mirror(g, L.mirror, (m) => {
    const r = stickFigure(m, reflPose, reflFace, { x: 545, y: 1225, s: 1.25, flip: -1, a: 0.95, seed: 31 });
    if (brushing) toothbrush(m, r.hR, 1.0);
    K.lightPool(m, 540 - (bx - 540) * 0.6, 470, 420, K.K.accent, on * 0.5);
  });
  const r = stickFigure(g, realPose, {}, { x: 560, y: 1930, s: 1.95, back: true, seed: 11 });
  K.darkness(g, 0.25 + 0.45 * (1 - on), [{ x: bx, y: by + 300, r: 1100, k: 0.9 }]);
  g.restore();
}
// split close-up: real face on the left, the mirror (and the reflection) on the right
function split(g, t, real, refl, o = {}) {
  const { on = light(5), z = 1 } = o;
  g.save(); K.camera(g, z, 540, 860, ...K.drift(3, 0.3, 9));
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  for (let i = 0; i < 8; i++) K.line(g, -40, 1180 + i * 110, 560, 1180 + i * 110, { w: 1.6, a: 0.22, seed: 600 + i, double: false });
  stickHead(g, 290, 860, 175, real, { seed: 5 });
  K.mirror(g, [560, -80, 620, 1900], (m) => { stickHead(m, 830, 860, 175, refl, { seed: 7 }); K.lightPool(m, 760, 300, 600, K.K.accent, on * 0.35); }, { frame: false });
  K.line(g, 560, 220, 560, 1800, { w: 6, seed: 610 }); K.line(g, 548, 220, 548, 1800, { w: 2.5, a: 0.6, seed: 611 });
  K.lightPool(g, 540, 140, 900, K.K.accent, on * 0.55);
  K.darkness(g, 0.2 + 0.5 * (1 - on), [{ x: 540, y: 600, r: 1300, k: 0.85 }]);
  g.restore();
}

// s01 0-1.75 frame 1: over the shoulder, swinging bulb, brushing (the reflection is already staring at us)
K.stickShot('s01', (g, t, info) => {
  const T = info.globalT;
  bathroomOTS(g, T, { realPose: brushPose(T), reflPose: brushPose(T), reflFace: { eyes: 'dot', look: [0.2, 0.3], mouth: 'flat' }, z: lerp(1.12, 1.08, info.p), swing: Math.sin(T * 1.7 + 1.1) * 0.22 });
});
// s02 1.75-3.5 wider: same mirror, every night
K.stickShot('s02', (g, t, info) => {
  const T = info.globalT; const on = light(3);
  g.save(); K.camera(g, lerp(0.86, 0.92, info.p), 540, 900);
  const L = K.bathroom(g, T, { mirror: MIRROR }); const [bx, by] = K.bulb(g, 540, -40, { len: 360, swing: Math.sin(T * 1.7 + 1.1) * 0.18, on, glowR: 640 });
  K.mirror(g, L.mirror, (m) => { const r = stickFigure(m, brushPose(T), { mouth: 'flat' }, { x: 545, y: 1120, s: 0.95, flip: -1, seed: 31 }); toothbrush(m, r.hR, 0.8); });
  const r = stickFigure(g, brushPose(T), {}, { x: 555, y: 1640, s: 1.2, back: true, seed: 11 });
  K.darkness(g, 0.3 + 0.45 * (1 - on), [{ x: bx, y: by + 300, r: 1000, k: 0.9 }]);
  g.restore();
});
// s03 3.5-4.9 close on the mirror: the reflection, brushing, looking at us
K.stickShot('s03', (g, t, info) => {
  const T = info.globalT; const on = light(4);
  g.save(); K.camera(g, lerp(1.0, 1.05, info.p), 540, 800, ...K.drift(4));
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  K.mirror(g, [120, 300, 840, 1100], (m) => {
    const r = stickFigure(m, brushPose(T), { eyes: 'dot', mouth: 'flat' }, { x: 560, y: 1830, s: 2.3, flip: -1, seed: 31 }); toothbrush(m, r.hR, 2.2);
    K.lightPool(m, 540, 300, 700, K.K.accent, on * 0.5);
  });
  K.chalk(g, [[60, 1500], [1020, 1500]], { w: 6, seed: 700 });
  K.lightPool(g, 540, 120, 800, K.K.accent, on * 0.6);
  K.darkness(g, 0.2 + 0.5 * (1 - on), [{ x: 540, y: 700, r: 1100, k: 0.85 }]);
  g.restore();
});
// s04 4.9-6.9 the blink: real blinks on "blinked", the reflection a beat later
K.stickShot('s04', (g, t, info) => {
  const T = info.globalT;
  const bl = (t0) => { const x = prog(T, t0, t0 + 0.09) - prog(T, t0 + 0.16, t0 + 0.26); return clamp(x); };
  split(g, T, { eyes: 'dot', blink: bl(5.0), mouth: 'flat' }, { eyes: 'dot', blink: bl(5.62), mouth: 'flat' }, { z: lerp(1.0, 1.06, info.p) });
});
// s05 6.9-8.4 "Just once." the reflection alone, holding our eyes; the bulb dips
K.stickShot('s05', (g, t, info) => {
  const T = info.globalT; const on = light(6, { depth: 0.3, dips: 1.4 });
  g.save(); K.camera(g, lerp(1.0, 1.1, ease.inOut(info.p)), 540, 820);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  K.mirror(g, [60, 180, 960, 1400], (m) => { stickHead(m, 540, 820, 250, { eyes: 'dot', look: [0, 0], mouth: 'flat' }, { seed: 7 }); K.lightPool(m, 540, 260, 800, K.K.accent, on * 0.45); });
  K.darkness(g, 0.15 + 0.6 * (1 - on), [{ x: 540, y: 700, r: 1100, k: 0.85 }]);
  g.restore();
});
// s06 8.4-10.9 "I told myself I was tired." wider, rubbing eyes, the tap drips
K.stickShot('s06', (g, t, info) => {
  const T = info.globalT; const on = light(7);
  const pose = K.poseAt(t, [[0, 'slump'], [0.5, 'rubEyes'], [1.7, 'rubEyes'], [2.3, 'slump']]);
  g.save(); K.camera(g, lerp(0.92, 0.97, info.p), 540, 1000);
  const L = K.bathroom(g, T, { mirror: MIRROR }); const [bx, by] = K.bulb(g, 540, -40, { len: 360, swing: Math.sin(T * 1.2) * 0.06, on, glowR: 600 });
  K.mirror(g, L.mirror, (m) => stickFigure(m, pose, { eyes: 'half', mouth: 'flat' }, { x: 545, y: 1120, s: 0.95, flip: -1, seed: 31 }));
  stickFigure(g, pose, {}, { x: 555, y: 1640, s: 1.2, back: true, seed: 11 });
  K.darkness(g, 0.35 + 0.45 * (1 - on), [{ x: bx, y: by + 300, r: 950, k: 0.9 }, { x: L.tap[0] + 34, y: L.tap[1] + 40, r: 160, k: 0.5 }]);
  g.restore();
});
// s07 10.9-12.6 "I leaned in close." push in over the shoulder; the reflection leans a hair late
K.stickShot('s07', (g, t, info) => {
  const T = info.globalT; const P = (tt) => K.poseAt(tt, [[0, 'stand'], [0.35, 'stand'], [1.0, 'leanIn']]);
  bathroomOTS(g, T, { realPose: P(t), reflPose: P(K.lag(t, 0.28)), reflFace: { eyes: 'dot', mouth: 'flat' }, z: lerp(1.08, 1.32, ease.inOut(info.p)), swing: Math.sin(T * 1.2) * 0.08, brushing: false });
});
// s08 12.6-15.2 "I smiled, to prove I was fine." the reflection's smile arrives half a beat late
K.stickShot('s08', (g, t, info) => {
  const T = info.globalT; const sm = (t0) => K.posesMix ? key(T, [[t0, K.MOUTHS.flat], [t0 + 0.3, K.MOUTHS.smile]]) : 'smile';
  split(g, T, { eyes: 'dot', mouth: sm(13.0) }, { eyes: 'dot', mouth: sm(13.55) }, { z: lerp(1.04, 1.1, info.p) });
});
// s09 15.2-18.1 "My reflection smiled too." it keeps smiling, a little wider than it should
K.stickShot('s09', (g, t, info) => {
  const T = info.globalT; const on = light(9, { depth: 0.25, dips: 0.9 });
  g.save(); K.camera(g, lerp(1.0, 1.14, ease.inOut(info.p)), 540, 820);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  K.mirror(g, [60, 180, 960, 1400], (m) => { stickHead(m, 540, 820, 250, { eyes: 'dot', mouth: key(t, [[0, K.MOUTHS.smile], [2.9, { w: 1.15, c: 0.45, o: 0 }]]) }, { seed: 7 }); K.lightPool(m, 540, 260, 800, K.K.accent, on * 0.45); });
  K.darkness(g, 0.15 + 0.6 * (1 - on), [{ x: 540, y: 700, r: 1100, k: 0.85 }]);
  g.restore();
});
// s10 18.1-21.95 "Then I stopped smiling." + the held, silent frame. Real face goes flat; the reflection does not.
K.stickShot('s10', (g, t, info) => {
  const T = info.globalT;
  const real = { eyes: 'dot', mouth: key(T, [[18.7, K.MOUTHS.smile], [18.95, K.MOUTHS.flat]]), brows: T > 19.9 ? 'worried' : null, look: [0, 0] };
  const refl = { eyes: 'dot', mouth: { w: 1.15, c: 0.45, o: 0 } };
  split(g, T, real, refl, { z: lerp(1.06, 1.12, ease.out(prog(t, 0, 1.6))), on: K.flicker({ seed: 5, depth: 0.08, dips: 0 }) });
}, { vignette: 0.85 });
// s11 21.95-24.25 "It didn't." the grin keeps going, past the edge of its head. 1-frame jitter. The bulb dies.
K.stickShot('s11', (g, t, info) => {
  const T = info.globalT; const on = K.flicker({ seed: 11, depth: 0.1, dips: 0.2, dies: BULB_DIES });
  const grin = key(T, [[22.15, { w: 1.15, c: 0.45, o: 0 }], [22.43, { w: 1.9, c: 0.55, o: 0 }], [23.0, { w: 2.3, c: 0.66, o: 0 }]]);
  g.save(); K.camera(g, lerp(1.08, 1.2, ease.out(info.p)), 540, 800);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  K.mirror(g, [-20, 120, 1120, 1600], (m) => { stickHead(m, 540, 800, 280, { eyes: T > 22.43 ? 'pin' : 'dot', mouth: grin }, { seed: 7 }); K.lightPool(m, 540, 230, 900, K.K.accent, on * 0.5); }, { frame: false });
  K.darkness(g, 0.12 + 0.88 * (1 - on), [{ x: 540, y: 650, r: 1200, k: on }]);
  g.restore();
  // after the bulb dies: the too-wide grin lingers in the dark for a few frames
  if (T >= BULB_DIES) { const a = 1 - prog(T, BULB_DIES + 0.15, BULB_DIES + 0.5); if (a > 0) { g.save(); K.camera(g, 1.2, 540, 800); g.globalAlpha = a * 0.55; g.beginPath(); g.rect(-100, -100, 1300, 2200); g.arc(540, 800, 280, 0, Math.PI * 2, true); g.clip(); K.face(g, 540, 800, 280, { eyes: 'none', mouth: grin }); g.restore(); } }
}, { vignette: 0.9 });
// s12 end card
K.stickShot('s12', (g, t) => K.endCard(g, t), { captions: false, fx: false });
