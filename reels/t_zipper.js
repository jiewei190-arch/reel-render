// How a zipper locks. Style: "Papercut" (lemo-opuscar styles/papercut-red/STYLE.md): every visible thing is cut paper laid on paper; China-red hero pieces on a different (indigo) paper family; paper grain, cut-edge wobble, light/dark cut rims, tight shadows, inset yin contour on figures; subtitles as a paper strip; gold foil kept for one accent (the slider); pieces step at 12 fps.
import { W, H, clamp, lerp, ramp, eo, E, bk, rnd, hash, S, En, cur, caption, boot } from './r2lib.js';
const C = { g0: '#1b2450', g1: '#24306a', g2: '#2f3d82', red: '#d2201f', redD: '#a8181a', redL: '#e4483d', cream: '#f3e7cf', gold: '#f2b632', goldD: '#c58a14', strip: '#8f1517' };
const D = (t, a, b) => eo((t - a) / (b - a));
let G, TD = 0;
// grain pattern
let grain = null; function getGrain() { if (grain) return grain; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const r = rnd(5); const im = x.createImageData(128, 128); for (let i = 0; i < 128 * 128; i++) { const v = 118 + r() * 40 + (hash(i * .013) - .5) * 30; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255 } x.putImageData(im, 0, 0); grain = G.createPattern(c, 'repeat'); return grain }
const rw = (p, k, a = 1.1) => [p[0] + (hash(k * 3.1 + 1) - .5) * a * 2, p[1] + (hash(k * 5.7 + 2) - .5) * a * 2];
function pathOf(pts, seed = 0, wob = 1.1) { return g => { g.beginPath(); pts.forEach((p, i) => { const q = rw(p, i + seed, wob); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]) }); g.closePath() } }
// cut-paper piece
function piece(pts, col, o = {}) {
  const pf = pathOf(pts, o.seed ?? 0, o.wob ?? 1.0); G.save(); if (o.a !== undefined) G.globalAlpha = o.a;
  if (!o.noShadow) { G.save(); G.translate(2.5, 4.5); pf(G); G.fillStyle = 'rgba(0,0,0,.38)'; G.shadowColor = 'rgba(0,0,0,.45)'; G.shadowBlur = 6; G.fill(); G.restore() }
  pf(G); G.fillStyle = col; G.fill();
  G.save(); pf(G); G.clip(); G.globalCompositeOperation = 'soft-light'; G.globalAlpha = (o.a ?? 1) * .55; G.fillStyle = getGrain(); G.fillRect(-20, -20, W + 40, H + 40); G.restore();
  G.save(); G.lineWidth = 1.4; G.strokeStyle = 'rgba(255,255,255,.28)'; G.translate(-.8, -.8); pf(G); G.stroke(); G.restore();
  G.save(); G.lineWidth = 1.4; G.strokeStyle = 'rgba(0,0,0,.4)'; G.translate(.9, .9); pf(G); G.stroke(); G.restore();
  if (o.inset) { const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length; const k = o.inset; G.save(); G.strokeStyle = 'rgba(0,0,0,.35)'; G.lineWidth = 1.5; G.beginPath(); pts.forEach((p, i) => { const q = [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k]; i ? G.lineTo(q[0], q[1]) : G.moveTo(q[0], q[1]) }); G.closePath(); G.stroke(); G.restore() }
  G.restore();
}
const rr = (x, y, w, h, r = 6) => { const p = []; const seg = 5; [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]].forEach(([cx, cy, a0]) => { for (let i = 0; i <= seg; i++) { const a = a0 + (Math.PI / 2) * i / seg; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]) } }); return p };
const circ = (cx, cy, r, n = 16) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
function tx(s, x, y, o = {}) { G.save(); G.font = `${o.w ?? 700} ${o.z ?? 30}px Bodoni`; G.textAlign = o.al ?? 'center'; G.textBaseline = 'middle'; G.globalAlpha = o.a ?? 1; G.fillStyle = 'rgba(0,0,0,.4)'; G.fillText(s, x + 2, y + 3); G.fillStyle = o.col ?? C.cream; G.fillText(s, x, y); G.restore() }
function tag(s, x, y, o = {}) { G.save(); G.font = `700 ${o.z ?? 24}px Bodoni`; const w = G.measureText(s).width + 30, h = (o.z ?? 24) + 20; G.restore(); G.save(); G.globalAlpha = o.a ?? 1; piece(rr(x - w / 2, y - h / 2, w, h, 6), o.col ?? C.cream, { seed: s.length, a: o.a }); tx(s, x, y, { z: o.z ?? 24, col: o.tc ?? C.strip, a: o.a, w: 800 }); G.restore() }
// zipper
function teethPos(k, y, sy, cx, m = 1) { const d = sy - y, o = clamp(d / 150); const half = lerp(10 * m, 96 * m, E(o)); return half }
function zip(cx, y0, y1, sy, m = 1, o = {}) {
  const pitch = 30 * m, n = Math.floor((y1 - y0) / pitch); const L = [], Rr = [];
  for (let k = 0; k <= n; k++) { const y = y0 + k * pitch, h = teethPos(k, y, sy, cx, m); L.push([cx - h, y]); Rr.push([cx + h, y + 15 * m]) }
  // tapes
  [[L, -1], [Rr, 1]].forEach(([row, s]) => { const pts = []; row.forEach(p => pts.push([p[0] + s * 12 * m, p[1]])); const out = row.map(p => [p[0] + s * 74 * m, p[1]]); piece([...pts, ...out.reverse()], s < 0 ? C.redD : C.redD, { noShadow: false, wob: .5, a: o.a }) });
  // teeth
  row_teeth(L, -1, m, o); row_teeth(Rr, 1, m, o);
}
function row_teeth(row, s, m, o) { row.forEach((p, k) => { const w = 26 * m, h = 22 * m; piece(rr(p[0] - w / 2, p[1] - h / 2, w, h, 7 * m), C.redL, { seed: k, wob: .5, inset: .62, noShadow: false, a: o.a }) }) }
function slider(x, y, m = 1, ang = 0, a = 1) { G.save(); G.translate(x, y); G.rotate(ang); G.scale(m, m); G.globalAlpha = a;
  piece([[-34, -50], [34, -50], [26, 8], [10, 46], [-10, 46], [-26, 8]], C.gold, { inset: .72, wob: .6 }); piece(circ(0, 66, 18), C.gold, { wob: .5, inset: .6 });
  G.save(); G.beginPath(); G.moveTo(0, -18); G.lineTo(-12, -42); G.lineTo(12, -42); G.closePath(); G.fillStyle = C.goldD; G.fill(); G.restore(); G.restore() }
function view(sc, cx, cy, fn) { G.save(); G.translate(W / 2, 560); G.scale(sc, sc); G.translate(-cx, -cy); fn(); G.restore() }
function draw(g, t) {
  G = g; const i = cur(t); TD = Math.floor(t * 12) / 12; const td = TD;
  // ground papers (far lighter -> near darker)
  g.fillStyle = C.g1; g.fillRect(0, 0, W, H);
  piece([[0, 520], [180, 470], [360, 530], [540, 480], [540, 960], [0, 960]], C.g0, { noShadow: false, wob: 3, seed: 5 });
  piece([[0, 760], [140, 730], [300, 770], [540, 720], [540, 960], [0, 960]], '#161d42', { wob: 3, seed: 8 });
  g.textBaseline = 'middle';
  const sw = (a, b, T0 = 0) => lerp(a, b, E(((td - T0) % 6) / 6)); // helper unused
  // zipper animation: slider position
  const cx = 270;
  if (i === 0) { const sy = 760 - D(td, 0.6, 4) * 380 + 0; // opens upward? slider goes up = closing; show it moving down to open
    const syy = lerp(330, 700, E(clamp(td / 3.4))); zip(cx, 280, 820, syy, 1); slider(cx, syy - 30, 1);
    tx('?', 90, 560, { z: 90, col: C.cream, a: D(td, 2.4, 3) }) }
  if (i === 1) { const k = D(td, S(1), S(1) + 1.2); view(lerp(1, 2.3, k), 270, 560, () => zip(cx, 280, 820, 300, 1)); tag('TEETH', 270, 800, { a: D(td, S(1) + 1.4, S(1) + 2) }) }
  if (i === 2 || i === 3) { // macro teeth
    const sn = i === 3 ? D(td, S(3) + .5, S(3) + 1.5) : 0;
    const lx = 150, rxa = lerp(420, 288, sn) + (i === 3 && td > S(3) + 1.5 ? Math.sin((td - S(3) - 1.5) * 18) * 3 * ramp(td, S(3) + 1.5, S(3) + 1.5) * clamp(1 - (td - S(3) - 1.5) * 3) : 0);
    // left tooth with bump on right face
    const lt = [...rr(lx - 90, 420, 180, 130, 20)]; piece(lt, C.redL, { inset: .8, seed: 3 }); piece(circ(lx + 100, 485, 36, 20), C.redL, { seed: 4, inset: .6 });
    // right tooth with hollow on left face
    const rt = rr(rxa - 10, 420, 180, 130, 20); piece(rt, C.red, { inset: .8, seed: 5 }); piece(circ(rxa + 2, 485, 38, 20), C.g0, { seed: 6, noShadow: true, wob: .3 });
    if (i === 2) { tag('BUMP', lx + 60, 380, { a: D(td, S(2) + 1.2, S(2) + 1.8) }); tag('HOLLOW', 400, 380, { a: D(td, S(2) + 2.6, S(2) + 3.2) }); }
    if (i === 3 && sn >= 1) { const a = D(td, S(3) + 1.6, S(3) + 2.2); tx('SNAP!', 270, 640, { z: 78, col: C.gold, a, w: 800 }) }
  }
  if (i === 4) { const sy = 560; zip(cx, 280, 820, sy, 1); const p = bk((td - S(4) - 1) / .5); slider(cx, sy - 30, 1.0 * (1 + .15 * Math.sin(td * 6))); tag('SLIDER', 270, 860, { a: D(td, S(4) + 1.2, S(4) + 1.8), col: C.gold }) }
  if (i === 5) { // Y channel cutaway
    const a = D(td, S(5) + .3, S(5) + 1);
    piece([[130, 340], [200, 340], [270, 520], [340, 340], [410, 340], [310, 560], [310, 760], [230, 760], [230, 560]], C.gold, { a, inset: .8, wob: .8 });
    piece([[170, 350], [196, 350], [270, 540], [344, 350], [370, 350], [292, 560], [292, 750], [248, 750], [248, 560]], '#161d42', { a, noShadow: true, wob: .6 });
    // rows entering
    const e = D(td, S(5) + 1.4, S(5) + 2.6); G.globalAlpha = e; for (let k = 0; k < 4; k++) { const yy = 330 - k * 40 + e * 0; piece(rr(100, yy - 70 - 0, 56, 26, 6), C.redL, { inset: .6 }); piece(rr(384, yy - 55, 56, 26, 6), C.redL, { inset: .6 }) } G.globalAlpha = 1;
    tag('Y-SHAPED CHANNEL', 270, 840, { a: D(td, S(5) + 1.6, S(5) + 2.2), col: C.gold }) }
  if (i === 6) { const sy = lerp(760, 380, D(td, S(6), S(6) + 3.8)); zip(cx, 280, 820, sy, 1); slider(cx, sy - 30, 1); tag('one pair at a time', 270, 880, { a: D(td, S(6) + .6, S(6) + 1.2) }) }
  if (i === 7) { const k = clamp((td - S(7) - .6) / 1.6), sq = Math.sin(k * Math.PI * 5) * (1 - k) * (k > 0 ? 1 : 0), sn = 1 - Math.abs(sq) * .5;
    const lx = 150, rxa = 288; piece(rr(lx - 90, 420, 180, 130, 20), C.redL, { inset: .8, seed: 3 }); piece(circ(lx + 100, 485, 36 * (1 - Math.abs(sq) * .3), 20), C.redL, { seed: 4, inset: .6 });
    G.save(); G.translate(Math.abs(sq) * 10, 0); piece(rr(rxa - 10, 420, 180, 130, 20), C.red, { inset: .8, seed: 5 }); piece(circ(rxa + 2, 485, 38, 20), C.g0, { seed: 6, noShadow: true, wob: .3 }); G.restore();
    tx('boing!', 270, 330, { z: 58, col: C.gold, a: D(td, S(7) + 1.8, S(7) + 2.4), w: 800 }); tag('bends, then springs back', 270, 700, { a: D(td, S(7) + .6, S(7) + 1.2) }) }
  if (i === 8) { zip(cx, 280, 820, 300, 1); const a = D(td, S(8) + .4, S(8) + 1); G.save(); G.globalAlpha = a; G.translate(270, 560); piece(rr(-70, -10, 140, 110, 12), C.gold, { inset: .8 }); piece([[-45, -10], [-45, -60], [-20, -90], [20, -90], [45, -60], [45, -10], [25, -10], [25, -50], [10, -66], [-10, -66], [-25, -50], [-25, -10]], C.goldD, { wob: .5 }); piece(circ(0, 40, 14), '#161d42', { noShadow: true, wob: .3 }); G.restore(); tag('STABLE', 270, 880, { a: D(td, S(8) + 1.4, S(8) + 2), col: C.gold }) }
  if (i === 9) { const sy = lerp(300, 700, E(clamp((td - S(9) - .3) / 3))); zip(cx, 280, 820, sy, 1); slider(cx, sy - 30, 1); tag('reverse: pushes apart', 270, 880, { a: D(td, S(9) + .8, S(9) + 1.4) }) }
  if (i === 10) { // drawstring bag vs zipper
    const a = D(td, S(10) + .3, S(10) + 1); G.save(); G.globalAlpha = a; piece([[60, 520], [250, 520], [270, 800], [40, 800]], C.redD, { inset: .85 }); piece([[40, 520], [270, 520], [270, 560], [40, 560]], C.redL, { wob: .5 });
    G.strokeStyle = C.cream; G.lineWidth = 5; G.beginPath(); G.moveTo(70, 540); G.quadraticCurveTo(155, 600, 240, 540); G.stroke(); G.beginPath(); G.moveTo(155, 576); G.quadraticCurveTo(120, 640, 145, 650); G.stroke(); G.restore();
    const b = D(td, S(10) + 1.6, S(10) + 2.4); G.save(); G.globalAlpha = b; piece(rr(300, 520, 190, 280, 14), C.redD, { inset: .88 }); for (let k = 0; k < 8; k++) { piece(rr(385, 530 + k * 32, 22, 18, 5), C.redL, { wob: .4 }); piece(rr(396, 545 + k * 32, 22, 18, 5), C.redL, { wob: .4 }) } G.restore();
    tag('tension', 150, 860, { a: D(td, S(10) + 2.2, S(10) + 2.8), col: C.cream }); tag('lock & key', 395, 860, { a: D(td, S(10) + 2.6, S(10) + 3.2), col: C.gold }) }
  if (i === 11) { const a = bk((td - S(11) - .2) / .6); G.save(); G.translate(270, 520); G.scale(a, a); '1893'.split('').forEach((ch, k) => tx(ch, -105 + k * 70, 0, { z: 130, col: C.red, w: 800 })); G.restore(); tag('Whitcomb Judson', 270, 650, { a: D(td, S(11) + 1.2, S(11) + 1.8) }); tag('"clasp locker"', 270, 730, { a: D(td, S(11) + 1.8, S(11) + 2.4), col: C.gold }) }
  if (i === 12) { const a = bk((td - S(12) - .2) / .6); G.save(); G.translate(270, 500); G.scale(a, a); '1913'.split('').forEach((ch, k) => tx(ch, -105 + k * 70, 0, { z: 130, col: C.red, w: 800 })); G.restore(); tag('Gideon Sundbäck', 270, 620, { a: D(td, S(12) + 1, S(12) + 1.6) }); tag('zipper goes on sale', 270, 700, { a: D(td, S(12) + 2.2, S(12) + 2.8), col: C.gold }) }
  if (i === 13) { const a = bk((td - S(13) - .2) / .6); G.save(); G.translate(270, 500); G.scale(a, a); '1923'.split('').forEach((ch, k) => tx(ch, -105 + k * 70, 0, { z: 130, col: C.red, w: 800 })); G.restore();
    const b = D(td, S(13) + 1, S(13) + 1.8); G.save(); G.globalAlpha = b; G.translate(270, 700); piece([[-60, -90], [10, -90], [14, -20], [90, 20], [95, 60], [-60, 60]], C.redD, { inset: .88 }); piece([[-65, 60], [100, 60], [100, 85], [-65, 85]], C.cream, { wob: .5 }); for (let k = 0; k < 5; k++) piece(rr(-30 + (k % 2) * 8, -80 + k * 26, 22, 16, 4), C.redL, { wob: .3 }); G.restore(); tag('rubber boots: "zipper"', 270, 850, { a: D(td, S(13) + 2, S(13) + 2.6), col: C.gold }) }
  if (i === 14) { const sy = 300; view(1.0, 270, 560, () => zip(cx, 300, 860, sy, 1)); const n = Math.floor((td - S(14) - .3) * 3); for (let k = 0; k < Math.max(0, Math.min(n, 12)); k++) { const y = 330 + k * 30 + 40; piece(circ(270, y + 7, 5 + (k === n - 1 ? 3 : 0)), C.gold, { wob: .3, noShadow: true }) } slider(cx, sy - 30, 1) }
  if (i === 15) { const sy = 340; zip(cx, 280, 820, sy + 120, 1); const k = Math.sin(td * 20) * 4; slider(cx + k, sy + 90, 1, k * .01); tx('STUCK!', 270, 830, { z: 64, col: C.gold, a: D(td, S(15) + 1, S(15) + 1.6), w: 800 }) }
  if (i >= 16) { const a = bk((td - S(16)) / .5); G.save(); G.translate(270, 560); G.scale(a, a); piece([[-200, -60], [200, -60], [210, 0], [200, 60], [-200, 60], [-210, 0]], C.red, { inset: .9 }); for (let k = -6; k <= 6; k++) piece([[k * 30 - 8, 60], [k * 30 + 8, 60], [k * 30, 78]], C.red, { noShadow: true, wob: .2 }); tx('FOLLOW', 0, 2, { z: 76, col: C.cream, w: 800 }); G.restore(); piece(circ(100, 420, 26, 10), C.gold, { inset: .6 }) }
  if (i === 0) tx('HOW IT REALLY WORKS', 270, 60, { z: 22, col: C.cream, a: ramp(td, 0, .3) * .8 });
  caption(g, t, { font: 'Bodoni', size: 33, y: 140, w: 440, weight: 700, hlWeight: 800, color: C.cream, hl: C.gold, lh: 1.18, bg: (g2, y, h, wd) => { piece([[20, y - 6], [520, y - 6], [520, y + h + 4], [20, y + h + 4]], C.strip, { wob: .5, noShadow: false }); for (let k = 0; k < 24; k++) piece([[20 + k * 21, y + h + 4], [20 + k * 21 + 21, y + h + 4], [20 + k * 21 + 10, y + h + 14]], C.strip, { noShadow: true, wob: .2 }) } });
}
boot({ draw, fonts: ['700 30px Bodoni', '800 30px Bodoni'] });
