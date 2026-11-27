// t_skeleton.js: "What your skeleton really does all day" paper pop-up book reel (template #10), 1080x1920, deterministic.
// Style: lemo-opuscar paper-popup grammar via styles/popup (cut-paper cards with white border + cardboard edge + grain,
// cut-out shadows, cards springing up around their bottom edge back-to-front, page turns between acts, cardboard signs
// dropping on strings, layered paper scenery on the standing back board). Halloween: night board, paper moon, bats,
// jack-o'-lanterns, a little haunted house; the hero is a friendly cut-paper skeleton.
import * as P from './styles/popup/popup.js';
const { PAL, W, H, BOOK, card, pop, foldTab, desk, book, board, sign, label, ink, crescent, wobble, ramp, ease, back, lerp, clamp, hash } = P;

const TL = window.TL, PH = TL.p;
const s = i => PH[i].start, e = i => PH[i].end;
const cv = document.getElementById('c');
const g = P.ctx2d(cv);
const mkc = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const LA = mkc(), la = LA.getContext('2d');

// acts: 0 hook + bone count (p0-3), 1 jobs one-three (p4-6), 2 marrow factory + bank (p7-10), 3 alive + end (p11-15)
const Sa = [0, s(4) - .05, s(7) - .05, s(11) - .05], TW = .85;
const TINT = ['#f3e6cf', '#efe6d6', '#f4e3d6', '#ece7d6'];
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
const spr = (t, t0, d = .5) => back(ramp(t, t0, d));
const rect = (w, h, m = 8) => [[m, m], [w - m, m], [w - m, h - m], [m, h - m]];
function stand(c, key, w, h, art, x, y, k, o = {}, co) { if (k <= .001) return null; const cd = card(key, w, h, art, co); pop(c, cd, x, y, k, o); return cd; }
function standTab(c, key, w, h, art, x, y, k, o = {}, tabW = 90) { foldTab(c, x, y, tabW, k); return stand(c, key, w, h, art, x, y, k, o); }
// a card rotated about a pivot given in art coords (for waving arms, bending forearms, flying cells)
function spin(c, key, w, h, art, x, y, ang, px, py, a = 1, sc = 1) {
  const cd = card(key, w, h, art); c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(ang); c.scale(sc, sc);
  c.globalAlpha *= .25; c.drawImage(cd.shadow, -px - cd.pad - 40 + 8, -py - cd.pad - 40 + 12); c.globalAlpha /= .25;
  c.drawImage(cd.c, -px - cd.pad, -py - cd.pad); c.restore();
}
function tag(c, text, x, y, w, fill, a) { if (a > 0) label(c, text, x, y, { w, col: fill, a }); }
const BONE = '#f6eedb', BONESH = '#ddd0b2', NIGHT = ['#1f2550', '#4a3f7c'];
const font = (c, sz, wt = 700) => { c.font = `${wt} ${sz}px Fredoka`; c.textAlign = 'center'; c.textBaseline = 'middle'; };

// ==================================================== ART ====================================================
function nightBoard(c, w, h, tint = NIGHT) {
  const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, tint[0]); gr.addColorStop(1, tint[1]);
  ink(c, rect(w, h, 6), { fill: gr, w: 7 });
  c.save(); c.beginPath(); c.rect(6, 6, w - 12, h - 12); c.clip();
  const mx = w * .78, my = h * .2; ink(c, wobble(mx, my, 86, 86, 3, .02, 40), { fill: '#f6e7b0', w: 6 });
  [[-24, -18, 16], [22, 20, 12], [30, -30, 8]].forEach(([dx, dy, r]) => { c.fillStyle = '#e4d08a'; c.beginPath(); c.arc(mx + dx, my + dy, r, 0, 7); c.fill(); });
  for (let i = 0; i < 26; i++) { const x = hash(i * 3.1) * w, y = hash(i * 7.7) * h * .7, r = 3 + hash(i) * 5; c.fillStyle = 'rgba(255,246,214,.85)'; c.beginPath(); c.moveTo(x, y - r * 2); c.lineTo(x + r * .6, y); c.lineTo(x, y + r * 2); c.lineTo(x - r * .6, y); c.closePath(); c.fill(); }
  const batS = (x, y, sc) => { c.fillStyle = '#141228'; c.beginPath(); c.moveTo(x, y); [[30, -18], [60, -22], [80, -8], [62, -4], [48, 8], [24, 2], [0, 14], [-24, 2], [-48, 8], [-62, -4], [-80, -8], [-60, -22], [-30, -18]].forEach(([dx, dy]) => c.lineTo(x + dx * sc, y + dy * sc)); c.closePath(); c.fill(); };
  batS(w * .2, h * .18, .9); batS(w * .4, h * .1, .6); batS(w * .58, h * .3, .5);
  c.restore();
}
const HILL_COL = ['#5b4f8c', '#43386e', '#2f2a52'];
function hillArt(i) { return (c, w, h) => {
  const top = 50; c.beginPath(); c.moveTo(0, h);
  for (let x = 0; x <= w; x += 12) c.lineTo(x, top + 40 * Math.sin(x * .006 + i * 2.1) + 18 * Math.sin(x * .017 + i));
  c.lineTo(w, h); c.closePath(); c.fillStyle = HILL_COL[i]; c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.lineJoin = 'round'; c.stroke();
}; }
function houseArt(c, w, h) { // little haunted house, lit windows
  ink(c, [[30, 140], [w - 30, 140], [w - 30, h - 8], [30, h - 8]], { fill: '#3a3060', w: 6 });
  ink(c, [[14, 146], [w / 2, 30], [w - 14, 146]], { fill: '#2a2248', w: 6 });
  ink(c, [[w - 70, 70], [w - 44, 70], [w - 44, 110], [w - 70, 110]], { fill: '#2a2248', w: 5 });
  [[60, 180], [w - 110, 180]].forEach(([x, y]) => { ink(c, [[x, y], [x + 50, y], [x + 50, y + 54], [x, y + 54]], { fill: '#ffd24d', w: 5 }); c.strokeStyle = PAL.ink; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 25, y); c.lineTo(x + 25, y + 54); c.moveTo(x, y + 27); c.lineTo(x + 50, y + 27); c.stroke(); });
  ink(c, [[w / 2 - 28, h - 8], [w / 2 - 28, h - 90], [w / 2 + 28, h - 90], [w / 2 + 28, h - 8]], { fill: '#ffb84d', w: 5 });
}
function pumpkinArt(c, w, h) {
  ink(c, [[w / 2 - 8, 6], [w / 2 + 8, 6], [w / 2 + 10, 40], [w / 2 - 10, 40]], { fill: '#5b7a2a', w: 5 });
  [[w * .32, w * .3], [w * .68, w * .3], [w * .5, w * .34]].forEach(([cx, rx]) => ink(c, wobble(cx, h * .58, rx, h * .38, cx, .02, 30), { fill: '#f08a24', w: 5 }));
  c.fillStyle = '#ffd24d'; c.strokeStyle = PAL.ink; c.lineWidth = 4;
  [[w * .36, h * .5], [w * .64, h * .5]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x - 14, y + 10); c.lineTo(x, y - 14); c.lineTo(x + 14, y + 10); c.closePath(); c.fill(); c.stroke(); });
  c.beginPath(); c.moveTo(w * .3, h * .7); [[.38, .76], [.44, .7], [.5, .78], [.56, .7], [.62, .76], [.7, .7], [.6, .86], [.4, .86]].forEach(([u, v]) => c.lineTo(w * u, h * v)); c.closePath(); c.fill(); c.stroke();
}
function treeArt(c, w, h) { // bare spooky-cute tree
  ink(c, [[w / 2 - 16, h - 6], [w / 2 - 10, h * .45], [w * .2, h * .2], [w * .26, h * .16], [w / 2 - 2, h * .38], [w / 2 + 4, h * .1], [w / 2 + 14, h * .1], [w / 2 + 12, h * .36], [w * .8, h * .22], [w * .84, h * .27], [w / 2 + 14, h * .5], [w / 2 + 18, h - 6]], { fill: '#3b2a3e', w: 5 });
}
// friendly skeleton, front view, right arm separate (it waves). art 360 x 640
function skull(c, cx, cy, r) {
  ink(c, [...wobble(cx, cy, r, r * .95, 7, .02, 40)], { fill: BONE, w: 6 });
  ink(c, [[cx - r * .55, cy + r * .5], [cx + r * .55, cy + r * .5], [cx + r * .45, cy + r * 1.05], [cx - r * .45, cy + r * 1.05]], { fill: BONE, w: 6 });
  c.fillStyle = PAL.ink; [-1, 1].forEach(sd => { c.beginPath(); c.ellipse(cx + sd * r * .38, cy + r * .02, r * .24, r * .28, 0, 0, 7); c.fill(); });
  c.fillStyle = '#fff'; [-1, 1].forEach(sd => { c.beginPath(); c.arc(cx + sd * r * .38 + 6, cy - r * .06, r * .07, 0, 7); c.fill(); });
  c.fillStyle = PAL.ink; c.beginPath(); c.moveTo(cx, cy + r * .3); c.lineTo(cx - r * .1, cy + r * .48); c.lineTo(cx + r * .1, cy + r * .48); c.closePath(); c.fill();
  c.strokeStyle = PAL.ink; c.lineWidth = 4; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(cx + k * r * .17, cy + r * .66); c.lineTo(cx + k * r * .17, cy + r * .98); c.stroke(); }
  c.beginPath(); c.moveTo(cx - r * .5, cy + r * .66); c.lineTo(cx + r * .5, cy + r * .66); c.stroke();
}
function boneSeg(c, x0, y0, x1, y1, wd) {
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * wd / 2, ny = Math.cos(a) * wd / 2;
  ink(c, [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], { fill: BONE, w: 5 });
  [[x0, y0], [x1, y1]].forEach(([x, y]) => [-1, 1].forEach(sd => { c.beginPath(); c.arc(x + nx * sd * 1.1, y + ny * sd * 1.1, wd * .5, 0, 7); c.fillStyle = BONE; c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 5; c.stroke(); }));
}
function skeletonArt(c, w, h) {
  const cx = w / 2;
  // legs
  boneSeg(c, cx - 40, 400, cx - 52, 510, 22); boneSeg(c, cx - 52, 520, cx - 56, 610, 20);
  boneSeg(c, cx + 40, 400, cx + 52, 510, 22); boneSeg(c, cx + 52, 520, cx + 56, 610, 20);
  ink(c, [[cx - 90, 612], [cx - 40, 612], [cx - 40, 632], [cx - 96, 632]], { fill: BONE, w: 5 }); ink(c, [[cx + 40, 612], [cx + 90, 612], [cx + 96, 632], [cx + 40, 632]], { fill: BONE, w: 5 });
  // pelvis
  ink(c, [[cx - 80, 350], [cx + 80, 350], [cx + 60, 410], [cx + 20, 400], [cx, 420], [cx - 20, 400], [cx - 60, 410]], { fill: BONE, w: 6 });
  // spine
  for (let k = 0; k < 9; k++) ink(c, wobble(cx, 180 + k * 19, 16, 9, k, .02, 16), { fill: BONE, w: 4 });
  // ribs
  for (let k = 0; k < 5; k++) { const y = 190 + k * 26, rw = 92 - k * 6; c.strokeStyle = PAL.ink; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 6, y); c.quadraticCurveTo(cx - rw, y - 4, cx - rw + 12, y + 24); c.moveTo(cx + 6, y); c.quadraticCurveTo(cx + rw, y - 4, cx + rw - 12, y + 24); c.stroke(); c.strokeStyle = BONE; c.lineWidth = 8; c.stroke(); }
  // clavicles + left arm (hanging, slight bend)
  boneSeg(c, cx - 96, 168, cx - 10, 160, 14); boneSeg(c, cx + 10, 160, cx + 96, 168, 14);
  boneSeg(c, cx - 104, 174, cx - 132, 290, 18); boneSeg(c, cx - 134, 300, cx - 128, 400, 16);
  ink(c, wobble(cx - 128, 420, 20, 24, 2, .05, 18), { fill: BONE, w: 5 });
  skull(c, cx, 76, 68);
}
// right arm: upper + forearm + hand, raised; pivot at the shoulder (art 20, 30)
function armArt(c, w, h) { boneSeg(c, 20, 30, 40, 140, 18); boneSeg(c, 44, 150, 120, 220, 16); ink(c, wobble(140, 238, 24, 28, 5, .06, 18), { fill: BONE, w: 5 }); [0, 1, 2].forEach(k => boneSeg(c, 140 + (k - 1) * 14, 222, 140 + (k - 1) * 22, 196 - Math.abs(k - 1) * 4, 7)); }
function babyArt(c, w, h) {
  ink(c, wobble(w / 2, h * .62, w * .42, h * .36, 9, .03, 40), { fill: '#bfe4ff', w: 6 });
  ink(c, wobble(w / 2, h * .32, w * .26, w * .26, 4, .02, 36), { fill: '#f6d2b4', w: 6 });
  c.fillStyle = PAL.ink; [-1, 1].forEach(sd => { c.beginPath(); c.arc(w / 2 + sd * 24, h * .32, 7, 0, 7); c.fill(); });
  c.strokeStyle = PAL.ink; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, h * .36, 16, .3, 2.8); c.stroke();
  c.fillStyle = '#f4a58f'; [-1, 1].forEach(sd => { c.beginPath(); c.arc(w / 2 + sd * 44, h * .38, 10, 0, 7); c.fill(); });
}
function smallBoneArt(c, w, h) { boneSeg(c, 22, h / 2, w - 22, h / 2, h * .38); }
function numArt(txt, fill) { return (c, w, h) => { ink(c, wobble(w / 2, h / 2, w * .44, h * .4, txt.length, .03, 36), { fill, w: 6 }); font(c, h * .42); c.fillStyle = PAL.ink; c.fillText(txt, w / 2, h / 2 + 4); }; }
function weightArt(c, w, h) { ink(c, [[w * .25, 30], [w * .75, 30], [w - 10, h - 10], [10, h - 10]], { fill: '#7b7b86', w: 6 }); ink(c, wobble(w / 2, 26, 24, 18, 3, .02, 20), { w: 8 }); font(c, 46); c.fillStyle = '#fff7e6'; c.fillText('body', w / 2, h * .62); }
function skullBrainArt(c, w, h) {
  ink(c, wobble(w / 2, h * .45, w * .44, h * .4, 11, .02, 44), { fill: BONE, w: 7 });
  ink(c, wobble(w / 2, h * .42, w * .32, h * .27, 2, .05, 44), { fill: '#ffb7c4', w: 5 });
  c.strokeStyle = '#c9556f'; c.lineWidth = 5; c.lineCap = 'round'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(w * (.3 + k * .08), h * (.36 + (k % 2) * .1), 20, 3.4, 5.6); c.stroke(); }
  c.beginPath(); c.moveTo(w / 2, h * .18); c.lineTo(w / 2, h * .66); c.stroke();
  ink(c, [[w * .3, h * .8], [w * .7, h * .8], [w * .64, h - 8], [w * .36, h - 8]], { fill: BONE, w: 6 });
}
function ribcageArt(c, w, h) {
  ink(c, wobble(w * .34, h * .48, w * .17, h * .3, 5, .04, 36), { fill: '#ffb7c4', w: 5 }); ink(c, wobble(w * .66, h * .48, w * .17, h * .3, 6, .04, 36), { fill: '#ffb7c4', w: 5 });
  ink(c, wobble(w * .55, h * .6, w * .12, h * .13, 8, .08, 30), { fill: '#e5402b', w: 5 });
  for (let k = 0; k < 6; k++) { const y = 40 + k * (h - 90) / 5, rw = w * (.48 - k * .02); c.strokeStyle = PAL.ink; c.lineWidth = 20; c.lineCap = 'round'; c.beginPath(); c.moveTo(w / 2 - 8, y); c.quadraticCurveTo(w / 2 - rw, y - 6, w / 2 - rw + 20, y + 40); c.moveTo(w / 2 + 8, y); c.quadraticCurveTo(w / 2 + rw, y - 6, w / 2 + rw - 20, y + 40); c.stroke(); c.strokeStyle = BONE; c.lineWidth = 11; c.stroke(); }
  ink(c, [[w / 2 - 14, 20], [w / 2 + 14, 20], [w / 2 + 12, h - 30], [w / 2 - 12, h - 30]], { fill: BONE, w: 5 });
}
function upperArmArt(c, w, h) { // humerus with biceps, vertical; elbow at bottom (art w/2, h-20)
  boneSeg(c, w / 2, 24, w / 2, h - 24, 26);
}
function foreArmArt(c, w, h) { boneSeg(c, 20, h / 2, w - 50, h / 2, 22); ink(c, wobble(w - 30, h / 2, 28, 32, 3, .06, 20), { fill: BONE, w: 5 }); }
function muscleArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .45, h * .42, 4, .04, 36), { fill: '#e5584a', w: 6 }); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 5; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(w * .3, h * (.3 + k * .2)); c.lineTo(w * .7, h * (.3 + k * .2)); c.stroke(); } }
function boneCutArt(c, w, h) { // a long bone cut open: compact wall, spongy marrow inside
  const out = [[40, 60], [w - 40, 60], [w - 40, h - 60], [40, h - 60]];
  boneSeg(c, 70, h / 2, w - 70, h / 2, h * .62);
  ink(c, wobble(w / 2, h / 2, w * .36, h * .2, 12, .05, 50), { fill: '#e8566a', w: 5 });
  c.fillStyle = '#ffb7c4'; for (let k = 0; k < 26; k++) { const x = w * .18 + hash(k) * w * .64, y = h / 2 + (hash(k + 9) - .5) * h * .3; c.beginPath(); c.arc(x, y, 6 + hash(k + 3) * 7, 0, 7); c.fill(); }
  void out;
}
function factoryArt(c, w, h) {
  ink(c, [[20, 120], [w * .35, 60], [w * .35, 120], [w * .65, 60], [w * .65, 120], [w - 20, 60], [w - 20, h - 8], [20, h - 8]], { fill: '#e8566a', w: 6 });
  ink(c, [[w - 90, 0], [w - 50, 0], [w - 50, 70], [w - 90, 70]], { fill: '#c9556f', w: 6 });
  [0, 1, 2].forEach(k => ink(c, [[50 + k * 90, 150], [100 + k * 90, 150], [100 + k * 90, 196], [50 + k * 90, 196]], { fill: '#ffd24d', w: 5 }));
  font(c, 40); c.fillStyle = '#fff7e6'; c.fillText('MARROW', w / 2, h - 40);
}
function rbcArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .44, h * .44, 1, .02, 30), { fill: '#e5402b', w: 5 }); ink(c, wobble(w / 2, h / 2, w * .2, h * .2, 2, .02, 24), { fill: '#c42f20', w: 3 }); }
function wbcArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .44, h * .42, 6, .1, 30), { fill: '#f4f1ff', w: 5 }); c.fillStyle = PAL.ink; [-1, 1].forEach(sd => { c.beginPath(); c.arc(w / 2 + sd * 10, h * .44, 4.5, 0, 7); c.fill(); }); c.strokeStyle = PAL.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2 - 10, h * .62); c.lineTo(w / 2 + 10, h * .58); c.stroke(); }
function plateletArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .44, h * .3, 4, .12, 20), { fill: '#c08ad8', w: 4 }); }
function vaultArt(c, w, h) {
  ink(c, [[20, 110], [w / 2, 20], [w - 20, 110]], { fill: BONE, w: 6 });
  ink(c, [[30, 110], [w - 30, 110], [w - 30, 130], [30, 130]], { fill: BONESH, w: 5 });
  [0, 1, 2, 3].forEach(k => boneSeg(c, 70 + k * (w - 140) / 3, 150, 70 + k * (w - 140) / 3, h - 60, 26));
  ink(c, [[20, h - 50], [w - 20, h - 50], [w - 20, h - 10], [20, h - 10]], { fill: BONESH, w: 5 });
  font(c, 30); c.fillStyle = PAL.ink; c.fillText('BONE BANK', w / 2, 84);
}
function coinArt(c, w, h) { ink(c, wobble(w / 2, h / 2, w * .44, h * .44, 2, .01, 30), { fill: '#ffd24d', w: 5 }); font(c, h * .4); c.fillStyle = PAL.ink; c.fillText('Ca', w / 2, h / 2 + 2); }
function chomperArt(c, w, h) { // osteoclast: purple blob with a big mouth (bone remover)
  ink(c, wobble(w / 2, h / 2, w * .44, h * .42, 13, .12, 40), { fill: '#9b6bd1', w: 6 });
  c.fillStyle = PAL.ink; c.beginPath(); c.moveTo(w * .5, h * .58); c.arc(w * .5, h * .58, h * .2, .2, Math.PI - .2); c.closePath(); c.fill();
  c.fillStyle = '#fff'; [.4, .6].forEach(u => { c.beginPath(); c.arc(w * u, h * .38, 11, 0, 7); c.fill(); }); c.fillStyle = PAL.ink; [.4, .6].forEach(u => { c.beginPath(); c.arc(w * u + 3, h * .38, 5, 0, 7); c.fill(); });
}
function builderArt(c, w, h) { // osteoblast: green blob with a hard hat, carrying a bone brick
  ink(c, wobble(w / 2, h * .58, w * .42, h * .36, 21, .1, 40), { fill: '#6fbf73', w: 6 });
  ink(c, [[w * .2, h * .3], [w * .8, h * .3], [w * .74, h * .14], [w * .26, h * .14]], { fill: '#ffd24d', w: 5 });
  c.fillStyle = PAL.ink; [.4, .6].forEach(u => { c.beginPath(); c.arc(w * u, h * .5, 7, 0, 7); c.fill(); });
  c.strokeStyle = PAL.ink; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, h * .58, 16, .3, 2.8); c.stroke();
}
function brickArt(c, w, h) { ink(c, rect(w, h, 6), { fill: BONE, w: 5 }); c.fillStyle = BONESH; c.fillRect(12, h - 18, w - 24, 8); }
function calArt(c, w, h) {
  ink(c, rect(w, h, 8), { fill: '#fff7e6', w: 6 }); ink(c, [[8, 8], [w - 8, 8], [w - 8, 70], [8, 70]], { fill: '#e5584a', w: 6 });
  font(c, 40); c.fillStyle = '#fff7e6'; c.fillText('EVERY YEAR', w / 2, 42);
  const cx = w / 2, cy = h * .6, r = h * .26; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = BONE; c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 6; c.stroke();
  c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * .1); c.closePath(); c.fillStyle = '#6fbf73'; c.fill(); c.stroke();
  font(c, 46); c.fillStyle = PAL.ink; c.fillText('~10%', cx, cy + r + 34);
}
function vesselArt(c, w, h) { ink(c, [[10, 20], [w - 10, 20], [w - 10, h - 20], [10, h - 20]], { fill: '#e8566a', w: 6 }); c.fillStyle = '#ffb7c4'; c.fillRect(20, 34, w - 40, 10); }
function closetArt(c, w, h) {
  ink(c, rect(w, h, 8), { fill: '#8a5a3a', w: 7 }); ink(c, [[30, 30], [w - 30, 30], [w - 30, h - 20], [30, h - 20]], { fill: '#2a1f3a', w: 6 });
  c.strokeStyle = '#6a4a2a'; c.lineWidth = 8; c.beginPath(); c.moveTo(40, 80); c.lineTo(w - 40, 80); c.stroke();
}
function doorArt(c, w, h) { ink(c, rect(w, h, 8), { fill: '#a8703f', w: 7 }); ink(c, [[30, 40], [w - 30, 40], [w - 30, h / 2 - 20], [30, h / 2 - 20]], { w: 5 }); ink(c, [[30, h / 2 + 20], [w - 30, h / 2 + 20], [w - 30, h - 40], [30, h - 40]], { w: 5 }); c.fillStyle = '#ffd24d'; c.beginPath(); c.arc(w - 46, h / 2, 12, 0, 7); c.fill(); c.strokeStyle = PAL.ink; c.lineWidth = 4; c.stroke(); }
function hatArt(c, w, h) { ink(c, [[10, h - 12], [w - 10, h - 12], [w - 30, h - 34], [w * .74, 14], [w * .26, 14], [30, h - 34]], { fill: '#ffd24d', w: 5 }); }

// ==================================================== scenery (back board + hills + props) ====================================================
const GROUND = 1300;
function scenery(c, t, t0, tint, props = true) {
  const kb = spr(t, t0, .7); board(c, 'night' + (tint ? tint[0] : ''), (cc, w, h) => nightBoard(cc, w, h, tint || NIGHT), kb); foldTab(c, 540, BOOK.fold, 820, kb);
  [0, 1].forEach(i => stand(c, 'hill' + i, 900, 200, hillArt(i), 540, BOOK.fold - 20 + i * 4, spr(t, t0 + .25 + i * .12, .6)));
  if (props) {
    stand(c, 'house', 300, 320, houseArt, 800, BOOK.fold - 40, spr(t, t0 + .45, .6), { scale: .62 });
    stand(c, 'tree', 220, 300, treeArt, 230, BOOK.fold - 30, spr(t, t0 + .55, .6), { scale: .78 });
  }
}
function pumpkins(c, t, t0, xs = [190, 890], y = 1600) { xs.forEach((x, i) => standTab(c, 'pumpkin', 170, 150, pumpkinArt, x, y, spr(t, t0 + i * .12, .5), { scale: .8, sway: Math.sin(t * 2 + i) * .01 }, 70)); }
function title(c, key, text, t, t0, t1, x = 540, y = 330, w = 820, h = 200) { // sign drops on strings, swings, lifts away
  const kd = ramp(t, t0, .8), up = ease(ramp(t, t1, .5)); if (kd <= 0 || up >= 1) return;
  const y1 = lerp(-260, y, ease(kd)) - up * 700; sign(c, key, text, x, y1 - 220, y1, w, h, Math.sin(ease(kd) * 3.5) * (1 - kd) * .14 + Math.sin(t * 1.3) * .012);
}

// ==================================================== ACTS ====================================================
// act 1: p0-p3. Frame 0: the skeleton is already springing up and waving in front of a night-sky pop-up
function act1(c, t) {
  scenery(c, t, -.6);
  const sk = Math.min(1, spr(t, -.35, .6)), wave = Math.sin(t * 6) * .35;
  const sx = lerp(540, 380, ease(ramp(t, s(2) - .3, .6))), ss = lerp(1.0, .62, ease(ramp(t, s(2) - .3, .6)));
  foldTab(c, sx, GROUND + 120, 160, sk);
  stand(c, 'skel', 360, 640, skeletonArt, sx, GROUND + 120, sk, { scale: ss * 1.05, sway: Math.sin(t * 2.2) * .02 });
  if (sk > .5) spin(c, 'arm', 180, 270, armArt, sx + 104 * ss * 1.05, GROUND + 120 - (640 - 174) * ss * 1.05 * Math.min(1, sk), -.35 + wave, 20, 30, 1, ss * 1.05);
  pumpkins(c, t, -.3);
  title(c, 'alive', 'Your skeleton\nis ALIVE', t, -.5, s(1) + 1.4, 540, 330, 760, 220);
  // p1: four job cards pop in a row (only one is "support")
  if (t > s(1) - .1 && t < s(2) + .2) {
    const icons = [['1', '#ffd966'], ['2', '#ffb7c4'], ['3', '#bfe4ff'], ['4', '#c6ecc0']], gone = ease(ramp(t, s(2) - .2, .4));
    icons.forEach(([n, f], i) => { const k = Math.min(1, spr(t, s(1) + .2 + i * .15, .45)) * (1 - gone); if (k > 0) standTab(c, 'job' + n, 150, 150, numArt(n, f), 330 + i * 140, 1590, k, { scale: .72 }, 50); });
    tag(c, 'one of 4 jobs', 540, 1640, 380, '#fff7e6', ramp(t, s(1) + 1.0, .3) * (1 - gone));
  }
  // p2: a baby card and "~300"
  if (t > s(2) - .1 && t < s(3) + .3) {
    const k = Math.min(1, spr(t, s(2) + .1, .5)), out = ease(ramp(t, s(3) - .1, .4));
    standTab(c, 'baby', 260, 260, babyArt, 720, 1300, k * (1 - out), { scale: .95 }, 120);
    if (k > .3) title(c, 'n300', 'about 300\nbones', t, s(2) + .2, s(3) - .2, 720, 560, 460, 200);
  }
  // p3: little bones slide together and fuse; 206 sign
  if (t > s(3) - .1) {
    const f = ease(ramp(t, s(3) + .6, 1.6));
    for (let i = 0; i < 6; i++) { const row = i % 3, side = i < 3 ? -1 : 1, x = 720 + side * lerp(150, 46, f), y = 1000 + row * 90; standTab(c, 'sb', 150, 56, smallBoneArt, x, y, Math.min(1, spr(t, s(3) + .1 + i * .06, .4)), { scale: .9, flip: side }, 40); }
    if (f > .95) tag(c, 'fused!', 720, 1290, 220, '#c6ecc0', 1);
    title(c, 'n206', 'adults: 206', t, s(3) + 2.2, 99, 720, 560, 460, 160);
  }
}
// act 2: p4-p6 jobs one to three
function act2(c, t) {
  scenery(c, t, Sa[1] - .2, ['#273160', '#5a4a8a']);
  pumpkins(c, t, Sa[1], [170, 910]);
  // p4 support: the skeleton holds a heavy "body" weight like a tent pole frame
  if (t < s(5) + .2) {
    const out = ease(ramp(t, s(5) - .2, .4)), k = Math.min(1, spr(t, s(4) + .1, .5)) * (1 - out);
    stand(c, 'skel', 360, 640, skeletonArt, 540, GROUND + 140, k, { scale: .82, sway: Math.sin(t * 2) * .01 });
    if (k > .5) spin(c, 'arm', 180, 270, armArt, 540 + 104 * .82, GROUND + 140 - (640 - 174) * .82, -1.2, 20, 30, 1, .82);
    const wk = ramp(t, s(4) + .9, .5), wy = lerp(-200, 930, back(wk));
    if (wk > 0) { const cd = card('weight', 300, 180, weightArt); c.drawImage(cd.c, 540 - cd.w / 2, wy - cd.h + cd.pad); }
    title(c, 'j1', 'JOB 1: SUPPORT', t, s(4) + .1, s(5) - .3, 540, 300, 760, 150);
  }
  // p5 armour: skull with brain, ribcage with heart and lungs
  if (t > s(5) - .3 && t < s(6) + .2) {
    const out = ease(ramp(t, s(6) - .2, .4));
    standTab(c, 'skullb', 300, 300, skullBrainArt, 320, 1180, Math.min(1, spr(t, s(5) + .2, .5)) * (1 - out), { scale: .95 }, 120);
    standTab(c, 'ribs', 360, 360, ribcageArt, 760, 1240, Math.min(1, spr(t, s(5) + 1.6, .5)) * (1 - out), { scale: .95 }, 140);
    tag(c, 'brain', 320, 1300, 180, '#ffe3e8', ramp(t, s(5) + .9, .3) * (1 - out));
    tag(c, 'heart + lungs', 760, 1340, 300, '#ffe3e8', ramp(t, s(5) + 2.6, .3) * (1 - out));
    title(c, 'j2', 'JOB 2: ARMOUR', t, s(5) + .1, s(6) - .3, 540, 300, 760, 150);
  }
  // p6 movement: muscle pulls, the forearm swings at the elbow
  if (t > s(6) - .3) {
    const k = Math.min(1, spr(t, s(6) + .1, .5)), bend = .5 + .5 * Math.sin((t - s(6)) * 2.6), ang = lerp(.1, -1.1, bend);
    standTab(c, 'upper', 80, 380, upperArmArt, 380, 1420, k, { scale: 1.3 }, 80);
    if (k > .6) {
      const ex = 380, ey = 1420 - 30 * 1.3;
      spin(c, 'fore', 340, 70, foreArmArt, ex, ey, ang, 20, 35, 1, 1.3);
      const mx = ex + 34, my = lerp(1150, 1120, bend);
      spin(c, 'muscle', 120, 240, muscleArt, mx, my, 0, 60, 120, .95, lerp(1.0, 1.15, bend));
      tag(c, 'muscle pulls', 760, 1080, 300, '#ffe3e8', ramp(t, s(6) + 1.2, .3));
      tag(c, 'joint bends', 700, 1420, 280, '#e3f1f2', ramp(t, s(6) + 2.2, .3));
    }
    title(c, 'j3', 'JOB 3: MOVEMENT', t, s(6) + .1, 99, 540, 300, 800, 150);
  }
}
// act 3: p7-p10 the marrow factory and the bone bank
function act3(c, t) {
  scenery(c, t, Sa[2] - .2, ['#3a2450', '#7a3f6a'], false);
  stand(c, 'house', 300, 320, houseArt, 860, BOOK.fold - 40, spr(t, Sa[2] + .2, .6), { scale: .5 });
  if (t < s(10) + .2) {
    const out = ease(ramp(t, s(10) - .2, .4));
    // p7 the cut bone, spongy marrow
    const kb = Math.min(1, spr(t, s(7) + .2, .5)) * (1 - out);
    standTab(c, 'bonecut', 760, 240, boneCutArt, 540, 1180, kb, { scale: .95 }, 300);
    tag(c, 'spongy marrow', 540, 1270, 340, '#ffe3e8', ramp(t, s(7) + 2.4, .3) * (1 - out) * (t < s(8) ? 1 : 0));
    title(c, 'j4', 'JOB 4: ???', t, s(7) + .1, s(8) - .2, 540, 300, 640, 150);
    // p8-p9 factory on top of the bone; cells stream out
    if (t > s(8) - .2) {
      const kf = Math.min(1, spr(t, s(8) + .1, .5)) * (1 - out);
      standTab(c, 'factory', 360, 260, factoryArt, 540, 1030, kf, { scale: .9 }, 160);
      const kinds = [['rbc', rbcArt, 70, 70]]; if (t > s(9)) kinds.push(['wbc', wbcArt, 80, 80]); if (t > s(9) + 1.6) kinds.push(['plt', plateletArt, 44, 30]);
      for (let i = 0; i < 12; i++) {
        const kd = kinds[i % kinds.length], u = ((t - s(8) - .4) * .32 + i / 12) % 1; if (t < s(8) + .4 + i * .08) continue;
        const x = 540 + (i % 2 ? 1 : -1) * (60 + u * 300) + Math.sin(u * 6 + i) * 30, y = 820 - u * 520 + Math.sin(u * 9 + i) * 20;
        spin(c, kd[0], kd[2], kd[3], kd[1], x, y, u * 3 + i, kd[2] / 2, kd[3] / 2, (1 - out) * Math.min(1, (1 - u) * 4), 1.0);
      }
      tag(c, 'red cells', 250, 1360, 230, '#ffe3e8', ramp(t, s(8) + 1.6, .3) * (1 - out));
      tag(c, 'white cells', 540, 1440, 250, '#f4f1ff', ramp(t, s(9) + .6, .3) * (1 - out));
      tag(c, 'platelets', 830, 1360, 220, '#efe0f7', ramp(t, s(9) + 2.0, .3) * (1 - out));
      title(c, 'fac', 'BLOOD FACTORY', t, s(8) + .1, s(10) - .3, 540, 300, 760, 150);
    }
  }
  // p10 the bone bank: Ca coins drop in
  if (t > s(10) - .3) {
    const kv = Math.min(1, spr(t, s(10) + .1, .5));
    standTab(c, 'vault', 420, 380, vaultArt, 540, 1380, kv, { scale: .95 }, 180);
    for (let i = 0; i < 5; i++) { const u = ramp(t, s(10) + .8 + i * .45, .7); if (u <= 0 || u >= 1) continue; spin(c, 'coin', 90, 90, coinArt, 300 + i * 120, lerp(560, 1060, ease(u)), u * 4, 45, 45, 1 - ramp(u, .85, .15), 1); }
    title(c, 'bank', 'CALCIUM BANK', t, s(10) + .1, 99, 540, 300, 760, 150);
  }
}
// act 4: p11-p15 alive: remove and rebuild, 10% a year, calcium to the blood, closet, end card
function act4(c, t) {
  scenery(c, t, Sa[3] - .2, ['#1f2a55', '#3f5a8a']);
  pumpkins(c, t, Sa[3], [170, 910]);
  if (t < s(14) - .1) {
    // a long bone plank on the page; the chomper eats from the left, the builder lays bricks on the right
    const out = ease(ramp(t, s(14) - .4, .4)), kb = Math.min(1, spr(t, s(11) + .1, .5)) * (1 - out);
    standTab(c, 'plank', 760, 120, smallBoneArt, 540, 1460, kb, { scale: 1 }, 400);
    const ph = (t - s(11)) * 1.2;
    if (kb > .5) {
      const cx = 290 + Math.sin(ph) * 30; standTab(c, 'chomp', 200, 200, chomperArt, cx, 1370, Math.min(1, spr(t, s(11) + 1.4, .4)) * (1 - out), { scale: .9, sway: Math.sin(t * 8) * .03 }, 80);
      standTab(c, 'build', 200, 220, builderArt, 790, 1370, Math.min(1, spr(t, s(11) + 2.4, .4)) * (1 - out), { scale: .9, sway: Math.sin(t * 3) * .02 }, 80);
      for (let i = 0; i < 3; i++) { const u = ((t - s(11) - 2.6) * .7 + i / 3) % 1; if (t < s(11) + 2.6) break; spin(c, 'brick', 70, 40, brickArt, 790 - 80, lerp(1200, 1330, u), 0, 35, 20, (1 - out) * (1 - u), 1); }
      tag(c, 'tear down', 290, 1560, 240, '#efe0f7', ramp(t, s(11) + 2.0, .3) * (1 - out));
      tag(c, 'build new', 790, 1560, 240, '#dff5df', ramp(t, s(11) + 3.0, .3) * (1 - out));
    }
    title(c, 'yes', 'ALIVE? YES!', t, s(11) + .1, s(12) - .2, 540, 300, 700, 150);
    // p12 calendar card 10% per year
    if (t > s(12) - .2) standTab(c, 'cal', 360, 380, calArt, 540, 1150, Math.min(1, spr(t, s(12) + .1, .5)) * (1 - ramp(t, s(13) - .2, .4)), { scale: .85 }, 160);
    // p13 coins travel into a blood vessel strip
    if (t > s(13) - .2) {
      const kv = Math.min(1, spr(t, s(13) + .1, .5)) * (1 - out);
      standTab(c, 'vessel', 760, 110, vesselArt, 540, 1100, kv, { scale: 1 }, 400);
      for (let i = 0; i < 5; i++) { const u = ((t - s(13) - .5) * .45 + i / 5) % 1; if (t < s(13) + .5) break; spin(c, 'coin', 90, 90, coinArt, 180 + u * 720, 1040 + Math.sin(u * 8 + i) * 10, u * 3, 45, 45, (1 - out) * Math.min(1, u * 5, (1 - u) * 5), .7); }
      title(c, 'blood', 'calcium -> blood', t, s(13) + .2, s(14) - .3, 540, 300, 780, 150);
    }
  } else {
    // p14 the closet: door swings open, the skeleton waves wearing a hard hat; p15 end sign
    const kc = Math.min(1, spr(t, s(14) - .1, .5));
    standTab(c, 'closet', 420, 620, closetArt, 540, 1520, kc, { scale: .95 }, 200);
    const op = ease(ramp(t, s(14) + .6, .7));
    stand(c, 'skel', 360, 640, skeletonArt, 540, 1500, op, { scale: .78, sway: Math.sin(t * 2.2) * .02 });
    if (op > .6) { spin(c, 'arm', 180, 270, armArt, 540 + 104 * .78, 1500 - (640 - 174) * .78, -.4 + Math.sin(t * 6) * .35, 20, 30, 1, .78); spin(c, 'hat', 160, 90, hatArt, 540, 1500 - 600 * .78, Math.sin(t * 2) * .05, 80, 70, 1, .9); }
    stand(c, 'door', 380, 560, doorArt, 540 - 190 - 190 * (1 - lerp(1, .15, op)) + 0, 1500, kc, { scale: .95 * lerp(1, .18, op), flip: 1 });
    title(c, 'lf', 'a LIVING\nFACTORY', t, s(14) + .8, s(15) - .3, 540, 330, 640, 220);
    title(c, 'end', 'Follow for more of\nhow it really works.', t, s(15) - .05, 99, 540, 330, 860, 220);
  }
}
const ACTS = [act1, act2, act3, act4];

// ==================================================== camera ====================================================
const KEYS = [
  [0, 1.06, 540, 1040], [s(1), 1.0, 540, 960], [s(2) + .5, 1.04, 600, 1020], [Sa[1], 1.0, 540, 960],
  [s(5) + .3, 1.05, 540, 1080], [s(6) + .5, 1.06, 540, 1150], [Sa[2], 1.0, 540, 960], [s(8) + .5, 1.04, 540, 1000],
  [s(10) + .4, 1.06, 540, 1120], [Sa[3], 1.0, 540, 960], [s(12) + .2, 1.05, 540, 1100], [s(14), 1.0, 540, 980], [TL.total, .97, 540, 960],
];
function camAt(t) {
  if (t <= KEYS[0][0]) return { s: KEYS[0][1], cx: KEYS[0][2], cy: KEYS[0][3] };
  for (let i = 1; i < KEYS.length; i++) if (t <= KEYS[i][0]) { const a = KEYS[i - 1], b = KEYS[i], u = ease(ramp(t, a[0], Math.max(.01, b[0] - a[0]))); return { s: lerp(a[1], b[1], u), cx: lerp(a[2], b[2], u), cy: lerp(a[3], b[3], u) }; }
  const l = KEYS[KEYS.length - 1]; return { s: l[1], cx: l[2], cy: l[3] };
}

// ==================================================== frame ====================================================
function drawWorld(t) {
  let a = 0; for (let i = 1; i < 4; i++) if (t >= Sa[i] - TW) a = i;
  const turning = a >= 1 && t < Sa[a];
  book(g, { pageTint: TINT[a] });
  ACTS[a](g, t);
  if (turning) {
    la.setTransform(1, 0, 0, 1, 0, 0); la.clearRect(0, 0, W, H);
    la.fillStyle = TINT[a - 1]; rr(la, 94, 176, 892, 1480, 10); la.fill();
    ACTS[a - 1](la, t);
    const p = ramp(t, Sa[a] - TW, TW), e2 = ease(p), sy = Math.max(.001, 1 - e2), top = 176;
    const edge = top + 1480 * sy; g.save(); g.filter = 'blur(14px)'; g.fillStyle = `rgba(30,12,2,${.32 * (1 - p * .6)})`; g.fillRect(100, edge - 4, 880, 46); g.filter = 'none'; g.restore();
    g.save(); g.translate(0, top); g.scale(1, sy); g.translate(0, -top); g.drawImage(LA, 0, 0); g.restore();
    g.save(); g.globalAlpha = .28 * e2; g.fillStyle = '#2a1608'; g.fillRect(94, top, 892, Math.max(0, 1480 * sy)); g.restore();
  }
}
function sub2(c, text, a) {
  if (!text || a <= 0) return; c.save(); c.globalAlpha = a; c.font = '600 44px Fredoka'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const toks = []; text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach(sg => { const b = sg.startsWith('**'); (b ? sg.slice(2, -2) : sg).split(/(\s+)/).filter(Boolean).forEach(w => toks.push([w, b])); });
  const maxW = 900, lines = [[]]; let lw = 0;
  toks.forEach(([w, b]) => { const sp = /^\s+$/.test(w), ww = c.measureText(w).width; if (!sp && lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (sp && !lines[lines.length - 1].length) return; lines[lines.length - 1].push([w, b, ww]); lw += ww; });
  const lwid = ln => { let q = ln.slice(); while (q.length && /^\s+$/.test(q[q.length - 1][0])) q.pop(); return q.reduce((m, t) => m + t[2], 0); };
  const mw = Math.max(...lines.map(lwid)), wCard = Math.min(980, mw + 90), hCard = 40 + lines.length * 62, x0 = (W - wCard) / 2, y0 = 1862 - hCard;
  c.fillStyle = 'rgba(40,20,8,.35)'; c.filter = 'blur(8px)'; rr(c, x0 + 4, y0 + 12, wCard, hCard, 28); c.fill(); c.filter = 'none';
  c.fillStyle = PAL.cream; c.strokeStyle = PAL.ink; c.lineWidth = 5; rr(c, x0, y0, wCard, hCard, 28); c.fill(); c.stroke();
  lines.forEach((ln, li) => { let x = (W - lwid(ln)) / 2; const y = y0 + 20 + 31 + li * 62; ln.forEach(([w, b, ww]) => { c.fillStyle = b ? PAL.coral : PAL.ink; c.fillText(w, x, y); x += ww; }); });
  c.restore();
}
window.DUR = TL.total;
window.seek = t => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  desk(g);
  const cm = camAt(t);
  g.save(); g.translate(540, 960); g.scale(cm.s, cm.s); g.translate(-cm.cx, -cm.cy);
  drawWorld(t);
  g.restore();
  let ci = 0; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start) ci = i;
  sub2(g, PH[ci].cap, ci === 0 ? 1 : ramp(t, PH[ci].start, .25));
};
// cover: the night pop-up, the skeleton waving, pumpkins, a big sign "Your skeleton is ALIVE"
window.thumb = () => {
  const t = 3.0; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); desk(g);
  g.save(); g.translate(540, 960); g.scale(1.04, 1.04); g.translate(-540, -980);
  book(g, { pageTint: TINT[0] }); scenery(g, 9, 0);
  foldTab(g, 540, GROUND + 160, 160, 1);
  stand(g, 'skel', 360, 640, skeletonArt, 540, GROUND + 160, 1, { scale: 1.1 });
  spin(g, 'arm', 180, 270, armArt, 540 + 104 * 1.1, GROUND + 160 - (640 - 174) * 1.1, -.2, 20, 30, 1, 1.1);
  pumpkins(g, 9, 0);
  sign(g, 'thumbsign', 'Your skeleton\nis ALIVE', 540, 160, 380, 820, 250, 0, { font: '700 92px Fredoka' });
  g.restore();
};

await document.fonts.load('600 60px Fredoka'); await document.fonts.load('700 60px Fredoka'); await document.fonts.load('500 30px Fredoka');
window.seek(0); window.ready = true; window.READY = true;
