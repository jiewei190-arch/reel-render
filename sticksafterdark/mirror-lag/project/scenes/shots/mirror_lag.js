// Sticks After Dark #1 "Mirror Lag" (extended, ~61 s). Bathroom at night, one accent: sickly yellow bulb.
import * as K from '/kits/sticks/sticks.js';
import { wordTime } from '/engine/core.js';
const { INK, stickFigure, stickHead, POSES, ease, prog, key, clamp, lerp } = K;
K.setAccent('yellow');

// word anchors (global seconds) from timeline/words.json
const WT = (w, after = 0) => wordTime(w, after) ?? after;
const T_BLINK = WT('blinked'), T_RINSED = WT('rinsed'), T_SPAT = WT('spat'), T_LOOKED = WT('looked'), T_LEFT = WT('left', 26),
  T_RIGHT = WT('right', 28.5), T_TILT1 = WT('tilted', 32), T_TILT2 = WT('tilted', T_TILT1 + 1), T_LAUGH = WT('laughed', 35), T_OFF = WT('off', 41),
  T_SMILE = WT('smiled', 46), T_STOP = WT('stopped', 51), T_DIDNT = WT("didn't", 55);
const BULB_DIES = T_DIDNT + 1.32;

const MIRROR = [330, 560, 420, 430];
const light = (seed = 3, extra = {}) => K.flicker({ seed, depth: 0.16, dips: 0.5, ...extra });
const brushPose = (t) => ({ ...POSES.brush, aR: [0.55 + 0.05 * Math.sin(t * 17), 2.55 + 0.16 * Math.sin(t * 17)] });
const raiseR = (k) => K.posesMix('stand', { ...POSES.stand, aR: [2.75, 0.15] }, k);   // screen-right arm up (the real one's LEFT hand)
const LAUGH = { w: 0.75, c: 0.42, o: 0.3 };
function toothbrush(g, hand, k = 1) { K.chalk(g, [[hand[0] - 6 * k, hand[1] + 4 * k], [hand[0] - 40 * k, hand[1] - 6 * k]], { w: 5 * k, double: false, seed: 77 }); }

// over-the-shoulder bathroom: real figure from the back (dy pushes it down = bent over the sink), reflection in the mirror
function bathroomOTS(g, t, o = {}) {
  const { realPose, reflPose, reflFace = {}, swing = Math.sin(t * 1.7 + 0.6) * 0.14, on = light(), z = 1, brushing = true, dy = 0, reflDy = 0 } = o;
  g.save(); K.camera(g, z, 540, 820, ...K.drift(5));
  const L = K.bathroom(g, t, { mirror: MIRROR, drip: o.drip });
  const [bx, by] = K.bulb(g, 540, -40, { len: 360, swing, on, glowR: 620 });
  K.mirror(g, L.mirror, (m) => {
    const r = stickFigure(m, reflPose, reflFace, { x: 545, y: 1225 + reflDy, s: 1.25, flip: -1, a: 0.95, seed: 31 });
    if (brushing) toothbrush(m, r.hR, 1.0);
    K.lightPool(m, 540 - (bx - 540) * 0.6, 470, 420, K.K.accent, on * 0.5);
  });
  stickFigure(g, realPose, {}, { x: 560, y: 1930 + dy, s: 1.95, back: true, seed: 11 });
  K.darkness(g, 0.25 + 0.45 * (1 - on), [{ x: bx, y: by + 300, r: 1100, k: 0.9 }]);
  g.restore();
}
// wide front view of the bathroom (figure from the back, reflection small in the mirror)
function bathroomWide(g, t, o = {}) {
  const { pose = 'stand', reflPose = pose, reflFace = { mouth: 'flat' }, z = 0.9, on = light(3), swing = Math.sin(t * 1.7 + 1.1) * 0.18, brushing = false, drip = true } = o;
  g.save(); K.camera(g, z, 540, 900);
  const L = K.bathroom(g, t, { mirror: MIRROR, drip }); const [bx, by] = K.bulb(g, 540, -40, { len: 360, swing, on, glowR: 640 });
  K.mirror(g, L.mirror, (m) => { const r = stickFigure(m, reflPose, reflFace, { x: 545, y: 1120, s: 0.95, flip: -1, seed: 31 }); if (brushing) toothbrush(m, r.hR, 0.8); });
  stickFigure(g, pose, {}, { x: 555, y: 1640, s: 1.2, back: true, seed: 11 });
  K.darkness(g, (o.dark ?? 0.3) + 0.45 * (1 - on), [{ x: bx, y: by + 300, r: 1000, k: 0.9 }, { x: L.tap[0] + 34, y: L.tap[1] + 40, r: 160, k: 0.4 }]);
  g.restore(); return L;
}
// split close-up: real face (left) | mirror with the reflection (right)
function split(g, t, real, refl, o = {}) {
  const { on = light(5), z = 1, tiltL = 0, tiltR = 0, bobL = 0, bobR = 0 } = o;
  g.save(); K.camera(g, z, 540, 860, ...K.drift(3, 0.3, 9));
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  for (let i = 0; i < 8; i++) K.line(g, -40, 1180 + i * 110, 560, 1180 + i * 110, { w: 1.6, a: 0.22, seed: 600 + i, double: false });
  stickHead(g, 290, 860 + bobL, 175, real, { seed: 5, tilt: tiltL });
  K.mirror(g, [560, -80, 620, 1900], (m) => { stickHead(m, 830, 860 + bobR, 175, refl, { seed: 7, tilt: tiltR }); K.lightPool(m, 760, 300, 600, K.K.accent, on * 0.35); }, { frame: false });
  K.line(g, 560, -40, 560, 1960, { w: 6, seed: 610 }); K.line(g, 548, -40, 548, 1960, { w: 2.5, a: 0.6, seed: 611 });
  K.lightPool(g, 540, 140, 900, K.K.accent, on * 0.55);
  K.darkness(g, 0.2 + 0.5 * (1 - on), [{ x: 540, y: 600, r: 1300, k: 0.85 }]);
  g.restore();
}
// split full bodies: real figure facing us (left) | reflection in the mirror (right), mirrored
function splitBody(g, t, realPose, reflPose, real = {}, refl = {}, o = {}) {
  const { on = light(8), z = 1 } = o;
  g.save(); K.camera(g, z, 540, 900, ...K.drift(3, 0.3, 12));
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  stickFigure(g, realPose, real, { x: 285, y: 1640, s: 2.35, seed: 11 });
  K.mirror(g, [560, -80, 620, 1900], (m) => { stickFigure(m, reflPose, refl, { x: 835, y: 1640, s: 2.35, flip: -1, seed: 31 }); K.lightPool(m, 760, 300, 600, K.K.accent, on * 0.35); }, { frame: false });
  K.line(g, 560, -40, 560, 1960, { w: 6, seed: 610 }); K.line(g, 548, -40, 548, 1960, { w: 2.5, a: 0.6, seed: 611 });
  K.lightPool(g, 540, 140, 900, K.K.accent, on * 0.55);
  K.darkness(g, 0.25 + 0.5 * (1 - on), [{ x: 540, y: 700, r: 1300, k: 0.85 }]);
  g.restore();
}
// the reflection alone, big, in the mirror
function reflClose(g, t, f, o = {}) {
  const { on = light(6), z = 1, r = 250, tilt = 0, y = 820, frame = true } = o;
  g.save(); K.camera(g, z, 540, 820);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  K.mirror(g, [60, 180, 960, 1400], (m) => { stickHead(m, 540, y, r, f, { seed: 7, tilt }); K.lightPool(m, 540, 260, 800, K.K.accent, on * 0.45); }, { frame });
  K.darkness(g, 0.15 + 0.6 * (1 - on), [{ x: 540, y: 700, r: 1100, k: 0.85 }]);
  g.restore();
}
// close on the basin and tap: water 0..1, hand on the tap handle, head bowing in from the top (0..1), spit drops
function sinkClose(g, t, o = {}) {
  const { water = 0, hand = 0, head = 0, spit = -1, on = light(4), z = 1, turn = 0, drip = true } = o;
  g.save(); K.camera(g, z, 540, 900, ...K.drift(3));
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  for (let i = 0; i < 6; i++) K.line(g, -40, 260 + i * 90, 1120, 260 + i * 90, { w: 1.5, a: 0.18, seed: 700 + i, double: false });
  g.fillStyle = INK.bg; g.fillRect(-60, 820, 1200, 1200);
  K.chalk(g, [[-40, 820], [1120, 820]], { w: 7, seed: 710 }); K.chalk(g, [[-40, 880], [1120, 880]], { w: 4, seed: 711, a: 0.7 });
  K.ellipse(g, 540, 1030, 380, 150, { w: 5, seed: 712 }); K.ellipse(g, 540, 1060, 300, 105, { w: 3, seed: 713, a: 0.6 });
  K.circleLine(g, 540, 1120, 22, { w: 3, seed: 714, a: 0.7 });
  // tap: spout from the back, handle on top (turns)
  K.chalk(g, [[540, 820], [540, 640], [640, 640], [660, 700]], { w: 9, seed: 715 });
  const ha = -0.2 + turn * 1.2; K.chalk(g, [[540, 620], [540 + Math.cos(ha) * 70, 620 - Math.sin(ha) * 20 - 20]], { w: 8, seed: 716 });
  if (water > 0) { for (let i = 0; i < 3; i++) K.chalk(g, [[652 + i * 6, 705], [655 + i * 5 + Math.sin(t * 30 + i) * 3, 900], [650 + i * 6, 1060]], { w: 3, seed: 720 + i, a: water * (0.8 - i * 0.2), step: 30 }); for (let i = 0; i < 6; i++) { const r = K.rng(K.K.frame * 5 + i)(); K.circleLine(g, 650 + (r - 0.5) * 80, 1060 + (r - 0.5) * 20, 6 + r * 10, { w: 2, a: water * 0.5, seed: 730 + i, n: 8 }); } }
  else if (drip) { const p = (t * 0.7) % 1, dy = 705 + ease.in(p) * 340; if (p < 0.95) { g.fillStyle = alpha(INK.chalk, 0.85); g.beginPath(); g.ellipse(656, dy, 5, 7, 0, 0, Math.PI * 2); g.fill(); } }
  if (spit >= 0 && spit < 0.8) { for (let i = 0; i < 5; i++) { const r = K.rng(90 + i); const x = 470 + r() * 120, y = 640 + ease.in(spit) * (380 + r() * 60) + r() * 40; g.fillStyle = alpha(INK.chalk, 0.85 * (1 - spit)); g.beginPath(); g.arc(x, y, 4 + r() * 4, 0, Math.PI * 2); g.fill(); } }
  if (hand > 0) { const hx = lerp(1200, 600 + Math.cos(ha) * 70, ease.out(hand)), hy = 640; K.chalk(g, [[1200, 1350], [900, 1000], [hx, hy]], { w: 10, seed: 740 }); }
  if (head > 0) { const hy = lerp(-260, 230, ease.inOut(head)); K.blob(g, 540, hy, 230, 230, INK.head, { seed: 750, wob: 4 }); K.chalk(g, [[540, hy - 230], [540, -200]], { w: 12, seed: 751 }); }
  K.lightPool(g, 540, 0, 1000, K.K.accent, on * 0.5);
  K.darkness(g, 0.2 + 0.5 * (1 - on), [{ x: 560, y: 700, r: 1100, k: 0.85 }]);
  g.restore();
}
const alpha = K.alpha;

// ---------------------------------------------------------------- shots
// s01 frame 1: over the shoulder, swinging bulb, brushing (the reflection already staring at us)
K.stickShot('s01', (g, t, info) => { const T = info.globalT; bathroomOTS(g, T, { realPose: brushPose(T), reflPose: brushPose(T), reflFace: { eyes: 'dot', look: [0.2, 0.3], mouth: 'flat' }, z: lerp(1.12, 1.08, info.p), swing: Math.sin(T * 1.7 + 1.1) * 0.22 }); });
// s02 wide: the same mirror
K.stickShot('s02', (g, t, info) => { const T = info.globalT; bathroomWide(g, T, { pose: brushPose(T), brushing: true, z: lerp(0.86, 0.92, info.p) }); });
// s03 "Same sink." close on the basin, the drip
K.stickShot('s03', (g, t, info) => sinkClose(g, info.globalT, { z: lerp(1.0, 1.05, info.p) }));
// s04 "Same yellow bulb." the bulb, swinging close
K.stickShot('s04', (g, t, info) => {
  const T = info.globalT, on = light(4, { depth: 0.22 }); g.save(); K.camera(g, lerp(1.0, 1.08, info.p), 540, 700);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040); K.line(g, -40, 120, 1120, 120, { w: 4, seed: 800 });
  g.save(); g.translate(540, 120); g.scale(3, 3); g.translate(-540, -120); K.bulb(g, 540, 120, { len: 160, swing: Math.sin(T * 1.6) * 0.16, on, glowR: 330 }); g.restore();
  K.darkness(g, 0.25 + 0.55 * (1 - on), [{ x: 540 + Math.sin(Math.sin(T * 1.6) * 0.16) * 480, y: 600, r: 1100, k: 0.9 }]); g.restore();
});
// s05 "Same tired face." the reflection, heavy-lidded
K.stickShot('s05', (g, t, info) => reflClose(g, info.globalT, { eyes: 'half', mouth: 'flat', blink: info.p > 0.7 && info.p < 0.78 ? 1 : 0 }, { z: lerp(1.02, 1.08, info.p) }));
// s07 "Tonight, my reflection blinked a little late." split faces: real blinks, the reflection a beat later
K.stickShot('s07', (g, t, info) => {
  const T = info.globalT; const bl = (t0) => clamp(prog(T, t0, t0 + 0.09) - prog(T, t0 + 0.16, t0 + 0.26));
  split(g, T, { eyes: 'dot', blink: bl(T_BLINK + 0.02), mouth: 'flat' }, { eyes: 'dot', blink: bl(T_BLINK + 0.64), mouth: 'flat' }, { z: lerp(1.0, 1.07, info.p) });
});
// s08 "Just once." the reflection alone, holding our eyes; the bulb dips
K.stickShot('s08', (g, t, info) => reflClose(g, info.globalT, { eyes: 'dot', mouth: 'flat' }, { z: lerp(1.0, 1.1, ease.inOut(info.p)), on: light(6, { depth: 0.3, dips: 1.4 }) }));
// s09 "I told myself I was tired." wide, rubbing eyes
K.stickShot('s09', (g, t, info) => { const pose = K.poseAt(t, [[0, 'slump'], [0.5, 'rubEyes'], [1.7, 'rubEyes'], [2.3, 'slump']]); bathroomWide(g, info.globalT, { pose, reflFace: { eyes: 'half', mouth: 'flat' }, z: lerp(0.92, 0.97, info.p), swing: Math.sin(info.globalT * 1.2) * 0.06, dark: 0.35 }); });
// s10 "I'd been up since five." over the shoulder, slumped, the bulb hums
K.stickShot('s10', (g, t, info) => { const T = info.globalT; bathroomOTS(g, T, { realPose: 'slump', reflPose: 'slump', reflFace: { eyes: 'half', mouth: 'frown' }, z: lerp(1.05, 1.12, info.p), swing: Math.sin(T * 1.1) * 0.05, brushing: false, on: light(10, { depth: 0.25, dips: 1 }) }); });
// s11 "I rinsed." tap running, hand in the stream
K.stickShot('s11', (g, t, info) => sinkClose(g, info.globalT, { water: clamp(prog(info.globalT, T_RINSED - 0.3, T_RINSED)), z: lerp(1.04, 1.0, info.p) }));
// s12 "I spat." my head bows into frame, spit falls
K.stickShot('s12', (g, t, info) => { const T = info.globalT; sinkClose(g, T, { water: 0.6, head: clamp(prog(T, T_SPAT - 0.6, T_SPAT - 0.1)), spit: prog(T, T_SPAT, T_SPAT + 0.6) * 0.99, z: 1.03 }); });
// s13 "I looked up." over the shoulder: I straighten up... it is already upright, staring
K.stickShot('s13', (g, t, info) => {
  const T = info.globalT, k = ease.inOut(prog(T, T_LOOKED, T_LOOKED + 0.55));
  bathroomOTS(g, T, { realPose: K.posesMix('slump', 'stand', k), dy: lerp(330, 0, k), reflPose: 'freeze', reflFace: { eyes: 'dot', look: [0, 0], mouth: 'flat' }, z: 1.12, swing: Math.sin(T * 1.1) * 0.05, brushing: false });
});
// s14 "It was already looking at me." the reflection's face, still, a slow push
K.stickShot('s14', (g, t, info) => reflClose(g, info.globalT, { eyes: 'dot', mouth: 'flat' }, { z: lerp(1.0, 1.22, ease.inOut(info.p)), on: light(14, { depth: 0.12, dips: 0.3 }) }), { jitter: [] });
// s15 "So I tried a test." wide, standing still, facing the mirror
K.stickShot('s15', (g, t, info) => bathroomWide(g, info.globalT, { pose: 'freeze', reflPose: 'freeze', reflFace: { eyes: 'dot', mouth: 'flat' }, z: lerp(0.95, 1.0, info.p), swing: 0.02 }));
// s16 "I raised my left hand." split bodies: both arms go up together
K.stickShot('s16', (g, t, info) => { const k = ease.inOut(prog(info.globalT, T_LEFT - 0.1, T_LEFT + 0.5)); splitBody(g, info.globalT, raiseR(k), raiseR(k), { eyes: 'dot', mouth: 'flat' }, { eyes: 'dot', mouth: 'flat' }, { z: lerp(1.0, 1.04, info.p) }); });
// s17 "It raised its right." the reflection alone, hand up, in the mirror
K.stickShot('s17', (g, t, info) => {
  const T = info.globalT, on = light(17); g.save(); K.camera(g, lerp(1.0, 1.06, info.p), 540, 900);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  K.mirror(g, [100, 200, 880, 1500], (m) => { stickFigure(m, raiseR(1), { eyes: 'dot', mouth: 'flat' }, { x: 560, y: 1850, s: 2.4, flip: -1, seed: 31 }); K.lightPool(m, 540, 260, 800, K.K.accent, on * 0.45); });
  K.darkness(g, 0.2 + 0.5 * (1 - on), [{ x: 540, y: 700, r: 1100, k: 0.85 }]); g.restore();
});
// s18 "Like it should." over the shoulder: both hands up, in sync
K.stickShot('s18', (g, t, info) => { const T = info.globalT, k = 1 - ease.inOut(prog(T, info.shot.end - 0.7, info.shot.end - 0.1)); bathroomOTS(g, T, { realPose: raiseR(k), reflPose: raiseR(k), reflFace: { eyes: 'dot', mouth: 'flat' }, z: 1.1, brushing: false, swing: 0.03 }); });
// s19 "I tilted my head." split faces tilt together (mirrored)
K.stickShot('s19', (g, t, info) => { const k = ease.inOut(prog(info.globalT, T_TILT1, T_TILT1 + 0.5)) * 0.3; split(g, info.globalT, { eyes: 'dot', mouth: 'flat' }, { eyes: 'dot', mouth: 'flat' }, { tiltL: k, tiltR: -k, z: lerp(1.0, 1.05, info.p) }); });
// s20 "It tilted too." the reflection alone, tilted
K.stickShot('s20', (g, t, info) => reflClose(g, info.globalT, { eyes: 'dot', mouth: 'flat' }, { tilt: -0.3, z: lerp(1.0, 1.06, info.p) }));
// s21 "I laughed at myself, and it laughed with me." both laugh, heads bobbing in sync
K.stickShot('s21', (g, t, info) => {
  const T = info.globalT, l = clamp(prog(T, T_LAUGH - 0.1, T_LAUGH + 0.2)) * (1 - prog(T, info.shot.end - 0.5, info.shot.end)), bob = Math.abs(Math.sin(T * 9)) * 18 * l;
  const f = { eyes: l > 0.5 ? 'closed' : 'dot', mouth: K.mixVal ? K.MOUTHS.flat : 'flat' }; const m = { w: lerp(0.55, LAUGH.w, l), c: lerp(0, LAUGH.c, l), o: LAUGH.o * l };
  split(g, T, { ...f, mouth: m }, { ...f, mouth: m }, { bobL: -bob, bobR: -bob, tiltL: 0.08 * l, tiltR: -0.08 * l, z: lerp(1.04, 1.0, info.p) });
});
// s22 "Right on time." wide, both settle, in sync
K.stickShot('s22', (g, t, info) => bathroomWide(g, info.globalT, { pose: 'idle', reflPose: 'idle', reflFace: { eyes: 'dot', mouth: 'smile' }, z: lerp(0.9, 0.94, info.p), swing: Math.sin(info.globalT * 1.3) * 0.05 }));
// s23 "I turned off the tap." the hand turns it, the water stops
K.stickShot('s23', (g, t, info) => { const T = info.globalT, k = ease.inOut(prog(T, T_OFF - 0.35, T_OFF + 0.1)); sinkClose(g, T, { water: 1 - k, hand: clamp(prog(T, info.shot.start, info.shot.start + 0.5)), turn: k, drip: false, z: 1.05 }); });
// s24 "The quiet felt wrong." the room holds still: no swing, no drip; the dark creeps in
K.stickShot('s24', (g, t, info) => bathroomWide(g, info.globalT, { pose: 'freeze', reflPose: 'freeze', reflFace: { eyes: 'dot', mouth: 'flat' }, z: lerp(0.92, 1.05, ease.inOut(info.p)), swing: 0, drip: false, dark: lerp(0.3, 0.5, info.p), on: K.flicker({ seed: 24, depth: 0.05, dips: 0 }) }), { vignette: 0.85 });
// s25 "I leaned in close." push in over the shoulder; the reflection leans a hair late
K.stickShot('s25', (g, t, info) => { const T = info.globalT; const P = (tt) => K.poseAt(tt, [[0, 'stand'], [0.35, 'stand'], [1.0, 'leanIn']]); bathroomOTS(g, T, { realPose: P(t), reflPose: P(K.lag(t, 0.28)), reflFace: { eyes: 'dot', mouth: 'flat' }, z: lerp(1.08, 1.32, ease.inOut(info.p)), swing: 0.01, brushing: false, drip: false }); });
// s26 "I smiled, to prove I was fine." the reflection's smile arrives half a beat late
K.stickShot('s26', (g, t, info) => { const T = info.globalT; const sm = (t0) => key(T, [[t0, K.MOUTHS.flat], [t0 + 0.3, K.MOUTHS.smile]]); split(g, T, { eyes: 'dot', mouth: sm(T_SMILE + 0.05) }, { eyes: 'dot', mouth: sm(T_SMILE + 0.6) }, { z: lerp(1.04, 1.1, info.p) }); });
// s27 "My reflection smiled too." it keeps smiling, a little wider than it should
K.stickShot('s27', (g, t, info) => reflClose(g, info.globalT, { eyes: 'dot', mouth: key(t, [[0, K.MOUTHS.smile], [info.dur, { w: 1.15, c: 0.45, o: 0 }]]) }, { z: lerp(1.0, 1.14, ease.inOut(info.p)), on: light(9, { depth: 0.25, dips: 0.9 }) }));
// s28 "Then I stopped smiling." + the held, silent frame. Real face goes flat; the reflection does not.
K.stickShot('s28', (g, t, info) => {
  const T = info.globalT;
  const real = { eyes: 'dot', mouth: key(T, [[T_STOP - 0.02, K.MOUTHS.smile], [T_STOP + 0.25, K.MOUTHS.flat]]), brows: T > T_STOP + 1.2 ? 'worried' : null };
  split(g, T, real, { eyes: 'dot', mouth: { w: 1.15, c: 0.45, o: 0 } }, { z: lerp(1.06, 1.12, ease.out(prog(t, 0, 1.6))), on: K.flicker({ seed: 5, depth: 0.08, dips: 0 }) });
}, { vignette: 0.85 });
// s29 "It didn't." the grin keeps going, past the edge of its head. 1-frame jitter. The bulb dies.
K.stickShot('s29', (g, t, info) => {
  const T = info.globalT; const on = K.flicker({ seed: 11, depth: 0.1, dips: 0.2, dies: BULB_DIES });
  const grin = key(T, [[T_DIDNT - 0.28, { w: 1.15, c: 0.45, o: 0 }], [T_DIDNT, { w: 1.9, c: 0.55, o: 0 }], [T_DIDNT + 0.57, { w: 2.3, c: 0.66, o: 0 }]]);
  g.save(); K.camera(g, lerp(1.08, 1.2, ease.out(info.p)), 540, 800);
  g.fillStyle = INK.bg2; g.fillRect(-60, -60, 1200, 2040);
  K.mirror(g, [-20, 120, 1120, 1600], (m) => { stickHead(m, 540, 800, 280, { eyes: T > T_DIDNT ? 'pin' : 'dot', mouth: grin }, { seed: 7 }); K.lightPool(m, 540, 230, 900, K.K.accent, on * 0.5); }, { frame: false });
  K.darkness(g, 0.12 + 0.88 * (1 - on), [{ x: 540, y: 650, r: 1200, k: on }]);
  g.restore();
  if (T >= BULB_DIES) { const a = 1 - prog(T, BULB_DIES + 0.15, BULB_DIES + 0.5); if (a > 0) { g.save(); K.camera(g, 1.2, 540, 800); g.globalAlpha = a * 0.55; g.beginPath(); g.rect(-100, -100, 1300, 2200); g.arc(540, 800, 280, 0, Math.PI * 2, true); g.clip(); K.face(g, 540, 800, 280, { eyes: 'none', mouth: grin }); g.restore(); } }
}, { vignette: 0.9 });
// s30 end card
K.stickShot('s30', (g, t) => K.endCard(g, t), { captions: false, fx: false });
