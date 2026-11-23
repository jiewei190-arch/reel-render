// Why you can't tickle yourself. Style: "Flat cartoon" (awesome-opus-5-5-video-styles): bold rounded shapes, thick dark outlines, flat fills with one shade tone, squash-and-stretch on every move, big eyes, saturated palette, layered backgrounds.
import { W, H, clamp, lerp, ramp, eo, E, bk, rnd, hash, S, En, cur, caption, boot } from './r2lib.js';
const C = { bg: '#ffe9a8', bg2: '#ffd66b', ink: '#2b2d42', bean: '#ff6b6b', beanS: '#e24e55', pip: '#4dabf7', pipS: '#2f86d6', brain: '#ff9ecb', brainS: '#ee74ac', cb: '#9b72e8', cbS: '#7a52c9', teal: '#2ec4b6', white: '#fff', gold: '#ffbe0b', green: '#37b24d' };
const fnt = (w, s, f = 'Inter') => `${w} ${s}px ${f}`;
const D = (t, a, b) => eo((t - a) / (b - a));
const OW = 6;
// flat shape with one shade tone (shade = crescent at lower right) and thick outline
function flat(g, path, fill, shade, ox = 14, oy = 14) {
  g.save(); path(g); g.fillStyle = shade || fill; g.fill(); if (shade) { g.clip(); g.translate(-ox, -oy); path(g); g.fillStyle = fill; g.fill() } g.restore();
  g.save(); path(g); g.lineWidth = OW; g.strokeStyle = C.ink; g.lineJoin = 'round'; g.stroke(); g.restore();
}
const ell = (x, y, rx, ry, rot = 0) => g => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7) };
function tube(g, pts, w, col) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = C.ink; g.lineWidth = w + OW * 2; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); g.restore() }
function eyes(g, x, y, sp, mood, look = [0, 0], blink = false) {
  [-1, 1].forEach(k => { const ex = x + k * sp;
    if (mood === 'laugh' || blink) { g.strokeStyle = C.ink; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(ex, y + 4, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return }
    g.fillStyle = C.white; g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.ellipse(ex, y, 17, mood === 'meh' ? 12 : 21, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = C.ink; g.beginPath(); g.arc(ex + look[0] * 6, y + look[1] * 6 + (mood === 'meh' ? 3 : 0), 9, 0, 7); g.fill(); g.fillStyle = C.white; g.beginPath(); g.arc(ex + look[0] * 6 + 3, y + look[1] * 6 - 3, 3, 0, 7); g.fill();
    if (mood === 'meh') { g.fillStyle = 'rgba(0,0,0,0)'; g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(ex - 18, y - 6); g.lineTo(ex + 18, y - 6); g.stroke() } });
}
function mouth(g, x, y, mood, t) {
  g.strokeStyle = C.ink; g.lineWidth = 5; g.lineCap = 'round';
  if (mood === 'meh') { g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.stroke() }
  else if (mood === 'laugh') { const o = 12 + Math.abs(Math.sin(t * 16)) * 10; g.fillStyle = '#7a1f3d'; g.beginPath(); g.ellipse(x, y + 8, 26, o, 0, 0, Math.PI); g.fill(); g.stroke(); g.fillStyle = '#ff8fa3'; g.beginPath(); g.ellipse(x, y + 8 + o * .6, 12, o * .35, 0, 0, Math.PI); g.fill() }
  else if (mood === 'smile') { g.beginPath(); g.arc(x, y - 6, 16, .15 * Math.PI, .85 * Math.PI); g.stroke() }
  else if (mood === 'o') { g.fillStyle = '#7a1f3d'; g.beginPath(); g.ellipse(x, y + 6, 10, 14, 0, 0, 7); g.fill(); g.stroke() }
}
// blob character; returns hand anchor points
function blob(g, x, y, s, col, shade, mood, o = {}) {
  const sx = o.sx ?? 1, sy = o.sy ?? 1; g.save(); g.translate(x, y); g.scale(s * sx, s * sy);
  flat(g, ell(0, 0, 88, 100), col, shade);
  flat(g, ell(-38, 100, 26, 12), col, shade, 6, 6); flat(g, ell(38, 100, 26, 12), col, shade, 6, 6);
  eyes(g, 0, -28, 32, mood, o.look, o.blink); mouth(g, 0, 22, mood, o.t ?? 0);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-56, 4, 12, 8, 0, 0, 7); g.ellipse(56, 4, 12, 8, 0, 0, 7); g.fill();
  g.restore();
}
function feather(g, x, y, rot, s = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  flat(g, g2 => { g2.beginPath(); g2.moveTo(0, 0); g2.quadraticCurveTo(-26, -50, 0, -110); g2.quadraticCurveTo(26, -50, 0, 0) }, C.teal, '#1f9e92', 8, 0);
  g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 14); g.lineTo(0, -96); g.stroke(); g.restore() }
function sparkle(g, x, y, r, col = C.gold, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? r * .38 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) } g.closePath(); g.fill(); g.stroke(); g.restore() }
function bubble(g, x, y, w, h, text, z = 20, col = '#fff', tail = null) {
  g.save(); flat(g, g2 => { g2.beginPath(); g2.roundRect(x - w / 2, y - h / 2, w, h, 22) }, col, null); if (tail) { g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = OW; g.beginPath(); g.moveTo(x - 14, y + h / 2 - 2); g.lineTo(tail[0], tail[1]); g.lineTo(x + 14, y + h / 2 - 2); g.fill(); g.stroke(); g.fillStyle = col; g.fillRect(x - 12, y + h / 2 - 6, 24, 8) }
  g.fillStyle = C.ink; g.font = fnt(800, z); g.textAlign = 'center'; g.textBaseline = 'middle'; const ls = text.split('\n'); ls.forEach((l, i) => g.fillText(l, x, y + (i - (ls.length - 1) / 2) * z * 1.15)); g.restore() }
function brain(g, x, y, s, o = {}) { g.save(); g.translate(x, y); g.scale(s, s);
  const bp = g2 => { g2.beginPath(); g2.moveTo(-150, 20); g2.bezierCurveTo(-190, -40, -140, -120, -60, -110); g2.bezierCurveTo(-20, -150, 70, -150, 110, -100); g2.bezierCurveTo(180, -90, 200, -20, 150, 30); g2.bezierCurveTo(130, 60, 60, 70, 20, 60); g2.bezierCurveTo(-30, 90, -110, 80, -150, 20); g2.closePath() };
  flat(g, bp, C.brain, C.brainS, 16, 16);
  g.strokeStyle = C.brainS; g.lineWidth = 6; g.lineCap = 'round'; [[-110, -20, -60, -50], [-40, -80, 10, -40], [30, -90, 90, -60], [60, -10, 130, -30], [-60, 20, -10, 10], [-120, 30, -100, 0]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 + 10, (b + d) / 2 - 20, c, d); g.stroke() });
  // cerebellum
  const pulse = o.cbPulse ? 1 + Math.sin(o.cbPulse * 7) * .06 : 1; g.save(); g.translate(120, 66); g.scale(pulse, pulse);
  flat(g, ell(0, 0, 58, 40, -.15), C.cb, C.cbS, 8, 8); g.strokeStyle = C.cbS; g.lineWidth = 4; for (let k = -2; k <= 2; k++) { g.beginPath(); g.arc(0, 0, 14 + (k + 2) * 8, Math.PI * .1, Math.PI * .9); g.globalAlpha = .6; g.stroke(); g.globalAlpha = 1 } g.restore();
  g.restore() }
function bgLayers(g, t, i) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.fillStyle = C.bg2; [[60, 700, 220], [480, 560, 260], [300, 900, 300]].forEach(([x, y, r], k) => { g.beginPath(); g.arc(x + Math.sin(t * .3 + k) * 8, y, r, 0, 7); g.fill() });
  g.fillStyle = '#ffc247'; g.beginPath(); g.ellipse(270, 905, 340, 120, 0, 0, 7); g.fill();
}
function meter(g, x, y, w, label, v, col) { g.save(); g.fillStyle = '#fff'; g.strokeStyle = C.ink; g.lineWidth = OW; g.beginPath(); g.roundRect(x, y, w, 30, 15); g.fill(); g.stroke(); g.save(); g.beginPath(); g.roundRect(x + 3, y + 3, w - 6, 24, 12); g.clip(); g.fillStyle = col; g.fillRect(x, y, w * clamp(v), 30); g.restore(); g.fillStyle = C.ink; g.font = fnt(800, 17); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(label, x + 4, y - 16); g.restore() }
function robot(g, x, y, ext, s = 1) { g.save(); g.translate(x, y); g.scale(s, s);
  flat(g, g2 => { g2.beginPath(); g2.roundRect(-46, 0, 92, 70, 14) }, '#adb5bd', '#868e96'); g.fillStyle = C.gold; g.beginPath(); g.arc(0, 35, 10, 0, 7); g.fill(); g.stroke();
  tube(g, [[0, 0], [-10, -60 - ext * 40], [-20, -120 - ext * 60]], 20, '#adb5bd'); flat(g, ell(-20, -126 - ext * 60, 16, 16), C.gold, '#e6a100', 4, 4); feather(g, -20, -134 - ext * 60, -.2, .6); g.restore() }

function draw(g, t) {
  const i = cur(t); bgLayers(g, t, i); g.textBaseline = 'middle';
  const bt = (t * 88 / 60) % 1; const bob = Math.sin(t * 5) * 3;
  // --- scene A: bean + feather (0,1,8,15)
  if (i === 0) {
    const a = D(t, .1, .6);
    const sw = Math.sin(t * 7), sqy = 1 + .02 * Math.sin(t * 3);
    blob(g, 270, 600, 1.6, C.bean, C.beanS, 'meh', { sy: sqy, look: [0, .6], t });
    // arm with feather tickling own tummy
    tube(g, [[140, 650], [185, 740 + sw * 8], [250 + sw * 20, 685]], 24, C.bean); feather(g, 252 + sw * 20, 685, -.9 + sw * .3, 1.2);
    // squiggle where touching
    g.strokeStyle = C.ink; g.lineWidth = 4; g.setLineDash([6, 8]); g.beginPath(); g.arc(270, 690, 44 + Math.sin(t * 7) * 6, 0, 7); g.stroke(); g.setLineDash([]);
    const q = D(t, 1.4, 2.0); if (q > 0) { g.globalAlpha = q; bubble(g, 410, 400, 120, 70, '...', 40, '#fff', [350, 470]); g.globalAlpha = 1 }
    const q2 = D(t, 2.6, 3.2); if (q2 > 0) { g.globalAlpha = q2; g.fillStyle = C.ink; g.font = fnt(800, 70); g.textAlign = 'center'; g.fillText('?', 120, 440); g.globalAlpha = 1 }
  }
  if (i === 1) {
    const a = D(t, S(1) + .1, S(1) + .7);
    // two touch sources equal
    [[150, 'your finger', C.bean], [390, 'their finger', C.pip]].forEach(([x, lab, col], k) => { const sc = bk((t - S(1) - .2 - k * .25) / .5);
      g.save(); g.translate(x, 580); g.scale(sc, sc); tube(g, [[0, 140], [0, 20]], 46, col); flat(g, ell(0, 14, 23, 20), col, null); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-4, 8, 10, 7, 0, 0, 7); g.fill(); g.restore();
      g.font = fnt(800, 24); g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText(lab, x, 770); });
    g.font = fnt(800, 80); g.fillStyle = C.ink; g.textAlign = 'center'; g.globalAlpha = D(t, S(1) + .8, S(1) + 1.3); g.fillText('=', 270, 590); g.globalAlpha = 1;
    g.globalAlpha = D(t, S(1) + 1.2, S(1) + 1.8); bubble(g, 270, 440, 300, 64, 'same softness!', 26, '#fff'); g.globalAlpha = 1;
  }
  // --- brain scenes 2..7
  if (i >= 2 && i <= 7) {
    const pop = bk((t - S(2) - .1) / .6), shift = i >= 4 ? -90 : 0;
    const cbp = (i === 3 || i === 4) ? t : 0;
    brain(g, 270, 560, 1.4 * pop, { cbPulse: cbp });
    if (i === 2) { g.globalAlpha = D(t, S(2) + .5, S(2) + 1); bubble(g, 270, 350, 200, 60, 'YOUR BRAIN', 26, '#fff'); g.globalAlpha = 1 }
    if (i === 3) { const a = D(t, S(3) + .8, S(3) + 1.4); g.globalAlpha = a; bubble(g, 330, 760, 300, 64, 'cerebellum', 32, '#e5d9ff', [438, 686]); g.font = fnt(700, 19); g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText('tracks your movements', 270, 830);
      const k = D(t, S(3) + 1.8, S(3) + 2.5); g.globalAlpha = k; for (let j = 0; j < 3; j++) { const ax = 90 + j * 12, ay = 440; g.strokeStyle = C.cb; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax + 20, ay + 10 + j * 28); g.lineTo(ax + 100 + Math.sin(t * 5 + j) * 12, ay + 10 + j * 28); g.stroke() } g.globalAlpha = 1 }
    if (i === 4) { const a = D(t, S(4) + .3, S(4) + .9); g.globalAlpha = a;
      bubble(g, 270, 340, 400, 100, 'PREDICTION:\nsoft touch on my tummy', 24, '#e5d9ff', [420, 560]); g.globalAlpha = 1;
      const hand = D(t, S(4) + 1.6, S(4) + 2.2); g.globalAlpha = hand; blob(g, 90, 800, .55, C.bean, C.beanS, 'smile', { t }); g.strokeStyle = C.ink; g.lineWidth = 6; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(130, 750); g.quadraticCurveTo(160, 640, 200, 600); g.stroke(); g.setLineDash([]); g.globalAlpha = 1 }
    if (i === 5) { const a = D(t, S(5) + .3, S(5) + .8), b = D(t, S(5) + 1.4, S(5) + 2.1);
      g.globalAlpha = a; bubble(g, 150, 330, 230, 70, 'expected: soft', 22, '#e5d9ff'); bubble(g, 390, 330, 230, 70, 'arrived: soft', 22, '#fff'); g.globalAlpha = b; g.fillStyle = C.green; g.strokeStyle = C.ink; g.lineWidth = OW; g.beginPath(); g.arc(270, 440, 44, 0, 7); g.fill(); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(248, 440); g.lineTo(265, 458); g.lineTo(294, 420); g.stroke(); g.globalAlpha = 1;
      g.globalAlpha = D(t, S(5) + 2.2, S(5) + 2.8); g.font = fnt(900, 40); g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText('no surprise 😴'.replace(' 😴', ''), 270, 790); g.globalAlpha = 1 }
    if (i === 6) { const a = D(t, S(6) + .3, S(6) + .9), v = 1 - D(t, S(6) + 1.2, S(6) + 2.6) * .8; g.globalAlpha = a; meter(g, 90, 350, 360, 'TICKLE FEELING', v, C.gold); bubble(g, 270, 790, 360, 64, 'cerebellum: "turn it down"', 21, '#e5d9ff'); g.globalAlpha = 1 }
    if (i === 7) { const a = D(t, S(7) + .3, S(7) + .9), dim = D(t, S(7) + 1.6, S(7) + 2.4);
      [[160, 'touch area', C.teal], [380, 'pleasant-feeling area', '#ffa94d']].forEach(([x, l, col], k) => { g.globalAlpha = a * (1 - dim * .65); flat(g, ell(x, 400, 70, 56), col, null); g.fillStyle = C.ink; g.font = fnt(800, 18); g.textAlign = 'center'; g.fillText(l, x, 482); });
      g.globalAlpha = D(t, S(7) + 2.4, S(7) + 3); g.font = fnt(900, 30); g.fillStyle = C.ink; g.fillText('less active ↓', 270, 790); g.globalAlpha = 1 }
  }
  if (i === 8) {
    const k = t - S(8), laugh = k > 1.5, sx = laugh ? 1 + .06 * Math.sin(t * 22) : 1, sy = laugh ? 1 - .06 * Math.sin(t * 22) : 1;
    blob(g, 215, 600, 1.3, C.bean, C.beanS, laugh ? 'laugh' : 'o', { sx, sy, t, look: [.5, 0] });
    const pa = D(t, S(8) + .2, S(8) + 1);
    blob(g, 440 + (1 - pa) * 120, 640, .8, C.pip, C.pipS, 'smile', { t });
    tube(g, [[400 + (1 - pa) * 120, 650], [340 + (1 - pa) * 100, 640], [300 + Math.sin(t * 20) * 6, 625]], 20, C.pip); feather(g, 300 + Math.sin(t * 20) * 6, 625, -1.2 + Math.sin(t * 20) * .25, 1);
    if (laugh) { ['HA', 'HA!', 'HEE'].forEach((s, j) => { g.save(); g.translate(120 + j * 150, 380 - ((t * 60 + j * 40) % 40)); g.rotate((j - 1) * .2); g.font = fnt(900, 44); g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText(s, 0, 0); g.restore() }) }
    g.globalAlpha = D(t, S(8) + 2.2, S(8) + 2.9); bubble(g, 270, 800, 420, 64, 'no prediction = full signal', 24, '#fff'); g.globalAlpha = 1;
  }
  // --- robot scenes 9..12
  if (i >= 9 && i <= 12) {
    const delay = i === 9 ? 0 : i === 10 ? D(t, S(10) + 1.5, S(10) + 3.5) * .5 : i === 11 ? .5 + D(t, S(11) + .4, S(11) + 2) * .5 : 1;
    const press = Math.sin(t * 2.4) > 0 ? 1 : 0, mv = (Math.sin(t * 2.4) * .5 + .5);
    // person's hand moves handle on left; robot touches palm on right
    blob(g, 130, 700, .8, C.bean, C.beanS, i >= 12 ? 'o' : i >= 10 ? 'smile' : 'smile', { t });
    // handle
    flat(g, g2 => { g2.beginPath(); g2.roundRect(90, 560, 80, 22, 11) }, '#adb5bd', '#868e96'); const hx = 100 + mv * 55; flat(g, ell(hx, 571, 16, 16), C.gold, '#e6a100', 4, 4);
    tube(g, [[130, 700], [hx, 590]], 18, C.bean);
    // robot + palm
    const tdel = Math.sin((t - delay * 1.2) * 2.4) * .5 + .5;
    robot(g, 400, 650, tdel, 1);
    flat(g, ell(400, 520, 54, 22), C.pip, C.pipS, 6, 6); g.fillStyle = C.ink; g.font = fnt(700, 16); g.textAlign = 'center'; g.fillText('palm', 400, 560);
    if (i === 9) { g.globalAlpha = D(t, S(9) + .5, S(9) + 1.1); bubble(g, 270, 380, 360, 66, 'you move → robot touches', 22, '#fff'); g.globalAlpha = 1 }
    if (i >= 10) { g.globalAlpha = D(t, S(i) + .3, S(i) + .9); meter(g, 60, 360, 200, 'DELAY', delay, '#74c0fc'); meter(g, 280, 360, 200, 'TICKLISH', delay * .95, C.bean); g.globalAlpha = 1 }
    if (i === 12) { const a = D(t, S(12) + .4, S(12) + 1); g.globalAlpha = a; bubble(g, 150, 470, 200, 56, 'expected: now', 20, '#e5d9ff'); bubble(g, 390, 470, 200, 56, 'arrived: late', 20, '#fff'); sparkle(g, 270, 790, 60 * bk((t - S(12) - 1.2) / .4), C.gold, t); g.font = fnt(900, 34); g.fillStyle = C.ink; g.textAlign = 'center'; g.globalAlpha = D(t, S(12) + 1.2, S(12) + 1.8); g.fillText('SURPRISE!', 270, 870); g.globalAlpha = 1 }
  }
  if (i === 13) {
    const a = bk((t - S(13) - .1) / .6);
    g.save(); g.translate(270, 640); g.scale(a, a);
    flat(g, g2 => { g2.beginPath(); g2.moveTo(-120, 200); g2.quadraticCurveTo(-130, 80, -60, 70); g2.lineTo(60, 70); g2.quadraticCurveTo(130, 80, 120, 200); g2.closePath() }, '#f1f3f5', '#ced4da');
    flat(g, ell(0, -10, 78, 90), '#f4c9a0', '#e0a678'); // head
    flat(g, g2 => { g2.beginPath(); g2.moveTo(-70, 20); g2.quadraticCurveTo(-60, 150, 0, 160); g2.quadraticCurveTo(60, 150, 70, 20); g2.quadraticCurveTo(40, 80, 0, 80); g2.quadraticCurveTo(-40, 80, -70, 20) }, '#e9ecef', '#adb5bd', 8, 8); // beard
    eyes(g, 0, -30, 30, 'smile'); g.strokeStyle = C.green; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.arc(0, -40, 84, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.restore();
    g.globalAlpha = D(t, S(13) + 1.2, S(13) + 1.8); bubble(g, 270, 380, 400, 104, 'laughter comes from\nsurprise', 25, '#fff', [270, 470]); g.globalAlpha = 1;
    g.globalAlpha = D(t, S(13) + 3.4, S(13) + 4); g.font = fnt(800, 22); g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText('(and you can\'t surprise yourself)', 270, 880); g.globalAlpha = 1;
  }
  if (i === 14) {
    const a = bk((t - S(14) - .1) / .5), b = D(t, S(14) + 1.2, S(14) + 1.8), c = D(t, S(14) + 2, S(14) + 2.7);
    g.save(); g.translate(120, 580); g.scale(a, a); feather(g, 0, 60, -.4, 1.6); g.font = fnt(800, 22); g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText('touch', 0, 100); g.restore();
    g.globalAlpha = b; g.font = fnt(900, 80); g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText('+', 230, 580); sparkle(g, 340, 570, 56 * b, C.gold, t); g.font = fnt(800, 22); g.fillText('surprise', 340, 650); g.globalAlpha = c; g.font = fnt(900, 80); g.fillText('=', 430, 580); g.font = fnt(900, 50); g.fillText('tickle!', 400, 720); g.globalAlpha = 1;
  }
  if (i === 15) { const k = t - S(15); blob(g, 190, 640, 1.1, C.bean, C.beanS, 'laugh', { t, sx: 1 + .04 * Math.sin(t * 18), sy: 1 - .04 * Math.sin(t * 18) }); blob(g, 400, 680, .9, C.pip, C.pipS, 'smile', { t }); tube(g, [[350, 700], [310, 680], [270, 660]], 18, C.pip); feather(g, 268, 660, -1.1 + Math.sin(t * 18) * .25, .9) }
  if (i >= 16) { const a = bk((t - S(16)) / .5); g.save(); g.translate(270, 640); g.scale(a, a); flat(g, g2 => { g2.beginPath(); g2.roundRect(-190, -60, 380, 120, 40) }, C.bean, C.beanS, 10, 10); g.fillStyle = '#fff'; g.font = fnt(900, 70); g.textAlign = 'center'; g.fillText('FOLLOW', 0, 4); g.restore(); sparkle(g, 110, 520, 30, C.gold, t); sparkle(g, 440, 790, 26, C.gold, -t) }
  if (i <= 0) { g.globalAlpha = ramp(t, 0, .3); g.fillStyle = C.ink; g.font = fnt(800, 14); g.textAlign = 'center'; g.fillText('HOW IT REALLY WORKS', W / 2, 70); g.globalAlpha = 1 }
  caption(g, t, { size: 32, y: 135, w: 470, weight: 800, hlWeight: 900, color: C.ink, hl: '#e03e4a', stroke: 'rgba(255,255,255,.85)', strokeW: 7 });
}
boot({ draw, fonts: ['700 16px Inter', '800 16px Inter', '900 16px Inter'] });
