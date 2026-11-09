// DEMO sheet for the Sticks After Dark kit: one shot per helper group. Render:
//   node render.mjs --project kits/sticks/demo --sheet --scale 0.5
import * as K from '/kits/sticks/sticks.js';
const { INK, stickFigure, stickHead, POSES, walk } = K;

const label = (g, s) => K.text(g, s, 540, 120, { size: 44, font: 'Nunito', weight: 900, color: '#8a8778' });

K.stickShot('d01_poses', (g, t) => {
  label(g, 'stickFigure(pose, face)');
  const names = ['stand', 'idle', 'slump', 'brush', 'rubEyes', 'lean', 'leanIn', 'scared', 'freeze'];
  names.forEach((n, i) => { const x = 180 + (i % 3) * 360, y = 640 + Math.floor(i / 3) * 560; stickFigure(g, n, { mouth: i === 7 ? 'o' : 'flat', eyes: i === 7 ? 'wide' : 'dot' }, { x, y, s: 1 }); K.text(g, n, x, y + 50, { size: 34, font: 'Nunito', weight: 800, color: INK.dim }); });
}, { captions: false });
K.stickShot('d02_poses2', (g, t) => {
  label(g, 'more poses + walk(phase)');
  const names = ['reach', 'point', 'handsUp', 'hug', 'phone', 'sit', 'crouch', 'peek'];
  names.forEach((n, i) => { const x = 180 + (i % 3) * 360, y = 640 + Math.floor(i / 3) * 560; stickFigure(g, n, { eyes: 'dot', mouth: 'flat' }, { x, y, s: 1 }); K.text(g, n, x, y + 50, { size: 34, font: 'Nunito', weight: 800, color: INK.dim }); });
  stickFigure(g, walk(t * 1.2), {}, { x: 900, y: 1760, s: 1 }); K.text(g, 'walk', 900, 1810, { size: 34, font: 'Nunito', weight: 800, color: INK.dim });
}, { captions: false });
K.stickShot('d03_faces', (g, t) => {
  label(g, 'face(): eyes / brows / mouth');
  const F = [['neutral', {}], ['smile', { mouth: 'smile' }], ['grin', { mouth: 'grin' }], ['scared', { eyes: 'wide', brows: 'worried', mouth: 'o' }], ['pin', { eyes: 'pin', brows: 'raised', mouth: 'flat' }], ['half', { eyes: 'half', mouth: 'frown' }],
    ['closed', { eyes: 'closed', mouth: 'flat' }], ['angry', { brows: 'angry', mouth: 'frown' }], ['glow', { eyes: 'glow', mouth: 'none' }], ['look left', { look: [-1, 0] }], ['blink .6', { blink: 0.6 }], ['tooWide', { mouth: 'tooWide', eyes: 'pin' }]];
  F.forEach(([n, f], i) => { const x = 190 + (i % 3) * 350, y = 330 + Math.floor(i / 3) * 400; stickHead(g, x, y, 95, f, { neck: false, seed: i * 3 + 1 }); K.text(g, n, x, y + 145, { size: 32, font: 'Nunito', weight: 800, color: INK.dim }); });
}, { captions: false });
K.stickShot('d04_bathroom', (g, t, info) => {
  const L = K.bathroom(g, t); const on = K.flicker({ seed: 3 }); const [bx, by] = K.bulb(g, 540, -20, { len: 330, swing: Math.sin(t * 2) * 0.12, on });
  K.mirror(g, L.mirror, (m) => stickFigure(m, 'brush', { mouth: 'flat' }, { x: 540, y: 1300, s: 1.05, flip: -1, a: 0.92 }));
  stickFigure(g, 'brush', {}, { x: 540, y: 1700, s: 1.6, back: true });
  K.darkness(g, 0.55 * (1.2 - on), [{ x: bx, y: by, r: 900 }]);
  label(g, 'bathroom() + bulb() + mirror()');
}, { captions: false });
K.stickShot('d05_bedroom_eyes', (g, t) => {
  K.setAccent('blue'); const L = K.bedroom(g, t, { doorOpen: 0.55 }); const [dx, dy, dw, dh] = L.door;
  K.eyesInDark(g, dx + dw * 0.25, dy + 150, { gap: 18, size: 5, blink: (t % 1) > 0.85 ? 1 : 0 });
  stickFigure(g, 'scared', { eyes: 'wide', mouth: 'o', look: [1, 0] }, { x: 330, y: 1600, s: 1.2 });
  K.darkness(g, 0.5, [{ x: 330, y: 700, r: 700 }]); K.setAccent('yellow');
  label(g, 'bedroom() + eyesInDark()');
}, { captions: false });
K.stickShot('d06_hall_tall', (g, t) => {
  const L = K.hallway(g, t, { endOpen: 1, endLit: 1 }); const [x, y, w, h] = L.endDoor; K.lightPool(g, x + w / 2, y + h / 2, 500, K.K.accent, 0.6);
  K.tallFigure(g, x + w / 2, y + h - 4, h * 1.05, { rim: 0.4 });
  label(g, 'hallway() + tallFigure()');
}, { captions: false });
K.stickShot('d07_kitchen_hand', (g, t) => {
  const L = K.kitchen(g, t); const [fx, fy, fw, fh] = L.fridge; K.handOnFrame(g, fx, fy + 300, { side: 'right', curl: 0.6 + 0.4 * Math.sin(t * 3) });
  K.darkness(g, 0.4, [{ x: 400, y: 700, r: 600 }]);
  label(g, 'kitchen() + handOnFrame()');
}, { captions: false });
K.stickShot('d08_living_peek', (g, t) => {
  K.setAccent('red'); const L = K.livingRoom(g, t, { tv: 1 }); K.peek(g, 930, 820, { side: 'left', amount: K.prog(t, 0, 0.8) });
  stickFigure(g, 'phone', { eyes: 'dot', look: [0, 1] }, { x: 450, y: L.couchY + 40, s: 1, anchor: 'hip' });
  K.phone(g, 470, L.couchY - 180, { s: 0.7 }); K.setAccent('yellow');
  label(g, 'livingRoom() + peek() + phone()');
}, { captions: false });
K.stickShot('d09_stairs_dark', (g, t) => {
  K.stairs(g, t); K.eyesInDark(g, 620, 500, { gap: 20, size: 5 });
  K.darkness(g, 0.85, [{ x: 400, y: 1500, r: 700 }]);
  label(g, 'stairs() + darkness()');
}, { captions: false });
K.stickShot('d10_outside', (g, t) => {
  K.outside(g, t, { litWindow: true });
  stickFigure(g, walk(t), {}, { x: 900, y: 1420, s: 0.6, back: true });
  label(g, 'outside()');
}, { captions: false });
K.stickShot('d11_captions', (g, t) => {
  K.bathroom(g, t); K.darkness(g, 0.6, []); K.safeZones(g); K.text(g, 'captions(): safe zones in red', 540, 120, { size: 44, font: 'Nunito', weight: 900, color: '#8a8778' });
});
K.stickShot('d12_endcard', (g, t) => K.endCard(g, t), { captions: false, fx: false });
