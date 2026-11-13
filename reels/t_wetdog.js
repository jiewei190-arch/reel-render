// t_wetdog.js: "Why do wet dogs smell so bad?" in template #8 urban-sketch (lemo-opuscar urban-sketch demo), in-house engine reels/styles/urbansketch.
// Grammar kept: sepia fineliner first, transparent wash after (misregistered, pooled edges), paper white reserved, figures boil at 12 fps,
// "the one coloured thing" (the dog in an ink-only park), "colour as arrival" (water and the final lawn bloom in with a wet front),
// "invisible forces are drawn" (the smell is ink curls that draw on and erase from the tail), handwritten corner note + margin notes,
// page turns between spreads, a slow hand-held camera. Batch N: drawings inside y 250-1130, handwritten captions in the lower margin (y ~1180-1400),
// nothing written right of x 900 below y 840.
import { createUS, W, H, clamp, lerp, seg, ss, eo, eio, backOut, hash, PAPER, INK, INK2, PAL, mix, rgba } from './styles/urbansketch/urbansketch.js';
await document.fonts.load('600 60px Caveat');
const R = createUS(document.getElementById('c')), g = R.g;
const TL = window.TL, PH = TL.p, s = i => PH[i].start, r = (i, d) => s(i) + d, TOT = TL.total;
const C = { fur: '#e0a94a', ear: '#9a6a3a', collar: PAL.brick, water: PAL.slate, smell: '#8fa64a', mol: '#8d6bb0', bact: '#9bb07a', yeast: '#d9b24a', lawn: '#c3c96f', leaf: '#7fa04a', sky: '#bcd0dc', skin: '#e8b48f', shirt: '#7fa6b8' };

// ---------- camera (a hand-held drift on every page) ----------
function cam(z, x, y, t) { const dx = 6 * Math.sin(t * .37), dy = 5 * Math.sin(t * .29 + 1); g.setTransform(z, 0, 0, z, 540 - (x + dx) * z, 960 - (y + dy) * z); }
const screen = () => g.setTransform(1, 0, 0, 1, 0, 0);
const close = p => p.concat([p[0]]);
const ell = (cx, cy, rx, ry, n = 30, a0 = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(a0 + i / n * 6.2832) * rx, cy + Math.sin(a0 + i / n * 6.2832) * ry]);

// ---------- the dog: ink first, then the one colour on the page ----------
function dog(t, { x = 420, y = 1060, sc = 1, wet = 0, shake = 0, prog = 1, col = 1, seed = 1, tail = 1 } = {}) {
  if (prog <= 0) return; const T = (px, py) => [x + px * sc, y + py * sc], sh = shake * Math.sin(t * 34) * .14;
  g.save(); const cx = x, cy = y - 120 * sc; g.translate(cx, cy); g.rotate(sh); g.translate(-cx, -cy);
  const body = ell(0, 0, 1, 1, 26).map(([a, b]) => T(a * 92, -96 + b * 84)), haunch = ell(0, 0, 1, 1, 22).map(([a, b]) => T(-42 + a * 74, -50 + b * 52)),
    head = ell(0, 0, 1, 1, 24).map(([a, b]) => T(72 + a * 62, -196 + b * 58)), snout = ell(0, 0, 1, 1, 18).map(([a, b]) => T(128 + a * 44, -176 + b * 28)),
    ear = [T(36, -232), T(66, -240), T(52, -170), T(34, -150), T(22, -176)];
  const wag = Math.sin(t * (wet > .5 ? 4 : 9)) * .5 * tail, ta = -1.9 + wag - wet * .9, t0 = T(-88, -70), tl = 90 * sc;
  const tailP = [t0, [t0[0] + Math.cos(ta) * tl * .55, t0[1] + Math.sin(ta) * tl * .55 - 10 * sc], [t0[0] + Math.cos(ta) * tl, t0[1] + Math.sin(ta) * tl]];
  // wash (the one coloured thing): misregistered, darker when wet
  if (col > 0) { const fc = wet > .5 ? mix(C.fur, '#b07a3a', .25) : C.fur, o = { a: .7 * col, smooth: true, step: 1e4, blooms: 2, br: 60 * sc };
    [body, haunch, head, snout].forEach((p, i) => R.wash(p, fc, { ...o, seed: seed + i, shade: .6 }));
    R.wash(ear, C.ear, { ...o, seed: seed + 9, a: .7 * col, dens: false }); R.wash([T(14, -150), T(60, -140), T(100, -146), T(100, -132), T(60, -126), T(14, -136)], C.collar, { ...o, seed: seed + 11, a: .8 * col, dens: false });
    if (wet > 0) [body, haunch, head].forEach((p, i) => R.wash(p, C.water, { ...o, a: .16 * wet * col, seed: seed + 20 + i, blooms: 1 })); }
  const po = { w: 3.4 * Math.min(1, sc + .2), boil: true, closed: true, over: 0, gaps: false };
  R.pen(tailP, { ...po, closed: false, over: 6, prog: clamp(prog * 5 - 4), seed: seed + 30 });
  [body, haunch, head, snout].forEach((p, i) => R.pen(close(p), { ...po, prog: clamp(prog * 5 - i), seed: seed + 31 + i }));
  R.pen(close(ear), { ...po, prog: clamp(prog * 5 - 3), seed: seed + 36 });
  // legs, paws, eye, nose, fur flicks (flat and dripping when wet)
  if (prog >= .8) { R.pen([T(40, -30), T(46, 2)], { ...po, closed: false, seed: seed + 40 }); R.pen([T(62, -30), T(66, 2)], { ...po, closed: false, seed: seed + 41 });
    R.pen(close(ell(0, 0, 1, 1, 14).map(([a, b]) => T(56 + a * 22, 2 + b * 10))), { ...po, seed: seed + 42 }); R.pen(close(ell(0, 0, 1, 1, 14).map(([a, b]) => T(-30 + a * 30, 0 + b * 12))), { ...po, seed: seed + 43 });
    g.save(); g.fillStyle = rgba(INK, .9); g.beginPath(); g.arc(...T(92, -210), 6 * sc, 0, 6.29); g.fill(); g.beginPath(); g.ellipse(...T(170, -184), 11 * sc, 8 * sc, 0, 0, 6.29); g.fill(); g.restore();
    R.pen([T(150, -160), T(132, -152), T(112, -158)], { ...po, closed: false, w: 2.6, seed: seed + 44 });
    body.concat(head).forEach(([px, py], i) => { if (i % 3) return; const c0 = i < body.length ? T(0, -96) : T(72, -196), dx = px - c0[0], dy = py - c0[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, len = 12 * sc * (1 - wet * .4), dr = wet * .9;
      R.pen([[px, py], [px + ux * (1 - dr) * len, py + (uy * (1 - dr) + dr) * len]], { w: 2.2, boil: true, over: 0, gaps: false, seed: seed + 50 + i }); }); }
  g.restore();
  if (shake > 0) { for (let i = 0; i < 3; i++) { const sd = i % 2 ? 1 : -1; R.pen(Array.from({ length: 8 }, (_, j) => { const an = -1.1 + j * .32; return [x + sd * (60 + 150 * sc + i * 18) * Math.cos(an) * .55 + sd * 90 * sc, y - 120 * sc + (150 + i * 18) * sc * Math.sin(an) * .6]; }), { w: 2.4, a: .7 * shake, boil: true, seed: seed + 70 + i, over: 0 }); }
    for (let i = 0; i < 22; i++) { const an = hash(i) * 6.28, u = (t * 1.5 + hash(i * 3)) % 1, d = (90 + 240 * u) * sc; R.fillCirc(x + Math.cos(an) * d, y - 130 * sc + Math.sin(an) * d * .8 + 110 * u * u * sc, (9 - 5 * u) * sc, C.water, { a: .8 * shake * (1 - u), seed: i, blooms: 0, edge: 1.4 }); } }
  if (wet > 0 && shake <= 0) for (let i = 0; i < 5; i++) { const u = (t * .9 + hash(i * 7)) % 1; R.fillCirc(x + (-70 + hash(i) * 150) * sc, y - 30 * sc + u * 60 * sc, 5 * sc, C.water, { a: .7 * wet * (1 - u), seed: 90 + i, blooms: 0, edge: 1.2 }); }
}
// the smell, drawn: an ink curl that draws on at the head and erases from the tail, with green dabs trailing
function curl(t, x0, y0, x1, y1, t0, dur, seed, o = {}) {
  const u = (t - t0) / dur; if (u <= 0) return; const uu = (o.loop ?? true) ? u % 1 : clamp(u), head = clamp(uu * 1.4), tail = clamp(uu * 1.4 - .55); if (head <= tail) return;
  const n = 40, P = Array.from({ length: n + 1 }, (_, i) => { const k = i / n, bx = lerp(x0, x1, k), by = lerp(y0, y1, k) - (o.arc ?? 120) * Math.sin(k * Math.PI), a = k * (o.turns ?? 3) * 6.28 + seed, rr = (o.rad ?? 22) * (.4 + k);
    return [bx + Math.cos(a) * rr, by + Math.sin(a) * rr * .8]; });
  const sub = P.slice(Math.floor(tail * n), Math.ceil(head * n) + 1); if (sub.length < 2) return;
  R.pen(sub, { w: o.w ?? 3, col: o.col ?? INK, a: (o.a ?? .85), over: 0, gaps: false, seed, boil: true });
  for (let i = 0; i < sub.length; i += 6) R.fillCirc(sub[i][0] + 10, sub[i][1] + 6, (o.dab ?? 9) * (.6 + .4 * hash(seed + i)), o.dabCol ?? C.smell, { a: .5 * (o.a ?? 1), seed: seed + i, blooms: 0, edge: 1.2 });
}
function nose(x, y, react = 0, prog = 1, seed = 1) { R.pen([[x - 26, y - 80], [x - 8, y - 36], [x + 18, y], [x + 4, y + 16], [x - 16, y + 12]], { w: 3.2, prog, boil: true, seed, over: 4, gaps: false });
  if (react > 0) R.text('!!', x - 60, y - 70, { size: 70, col: PAL.accent, reveal: react }); }
function person(x, y, t, react = 0, prog = 1) {   // a sitter on the bench: head mass + torso + legs, face blank, one nose tick in profile (style rule)
  const hd = ell(x, y - 150, 30, 34, 18); R.wash(hd, '#6b4a33', { a: .6, smooth: true, step: 1e4, seed: 401 }); R.pen(close(hd), { w: 3, prog, boil: true, seed: 402, closed: true, over: 0, gaps: false });
  const torso = [[x - 34, y - 110], [x + 30, y - 110], [x + 40, y - 20], [x - 40, y - 20]]; R.wash(torso, C.shirt, { a: .55, seed: 403, dens: false }); R.pen(close(torso), { w: 3, prog, boil: true, seed: 404, closed: true, over: 0, gaps: false });
  R.pen([[x - 30, y - 20], [x - 70, y - 10], [x - 74, y + 60]], { w: 3, prog, boil: true, seed: 405 }); R.pen([[x + 10, y - 20], [x - 36, y - 6], [x - 40, y + 62]], { w: 3, prog, boil: true, seed: 406 });
  const arm = react > 0 ? [[x - 20, y - 96], [x - 40, y - 140], [x - 34, y - 142]] : [[x - 20, y - 96], [x - 50, y - 60], [x - 60, y - 40]]; R.pen(arm, { w: 3, prog, boil: true, seed: 407 });
  R.pen([[x - 30, y - 152], [x - 38, y - 146], [x - 30, y - 142]], { w: 2.4, prog, boil: true, seed: 408, over: 0 });
  if (react > 0) R.text('ew!', x - 10, y - 200, { size: 54, col: PAL.accent, reveal: react, rot: -.1 }); }
// ---------- page A: the park by the pond (ink only, the dog is the coloured thing; the lawn arrives at the end) ----------
function park(t, { dogO = {}, lawn = 0, curls = 0, react = 0, pondCol = 1, prog = 1 } = {}) {
  g.save(); g.translate(0, -100);
  const BL = [[30, 140, 220], [180, 110, 160], [300, 150, 300], [460, 120, 200], [590, 160, 260], [760, 110, 190], [880, 150, 240]];   // the demo's skyline behind the trees
  BL.forEach(([x, w, h], i) => { const y0 = 540; if (lawn > 0) R.wash(R.rectPts(x, y0 - h, w, h), [PAL.ochre, PAL.steel, PAL.rose, PAL.sky][i % 4], { a: .35, seed: 560 + i, dens: false, bloom: { x: 540, y: 300, r: clamp(lawn * 1.3 - .3) * 1400 } });
    R.rect(x, y0 - h, w, h, { w: 2.2, prog, seed: 570 + i, a: .8 }); for (let k = 0; k < 6; k++) R.pen([[x + 18 + (k % 3) * (w - 36) / 2, y0 - h + 30 + Math.floor(k / 3) * 46], [x + 18 + (k % 3) * (w - 36) / 2, y0 - h + 44 + Math.floor(k / 3) * 46]], { w: 2, a: .6, seed: 580 + i * 7 + k, over: 0, gaps: false }); });
  if (lawn > 0) { R.wash([[-40, 640], [1120, 620], [1120, 1180], [-40, 1180]], C.lawn, { a: .45, seed: 501, bloom: { x: 420, y: 980, r: lawn * 1300 }, blooms: 4, br: 200 });
    R.wash([[-40, 250], [1120, 250], [1120, 640], [-40, 660]], C.sky, { a: .35, seed: 502, bloom: { x: 540, y: 300, r: clamp(lawn * 1.3 - .3) * 1200 }, blooms: 3, br: 220 }); }
  for (let i = 0; i < 7; i++) { const x = 60 + i * 160 + 20 * hash(i), y = 600 - 40 * hash(i * 3), rr = 70 + 30 * hash(i * 5);   // trees: scalloped crowns + trunks
    const crown = Array.from({ length: 14 }, (_, k) => { const a = Math.PI + k / 13 * Math.PI; return [x + Math.cos(a) * rr * (1 + .12 * Math.sin(k * 2.7)), y - 60 + Math.sin(a) * rr * .9]; });
    if (lawn > 0) R.wash(close(crown).concat([[x + rr, y - 40], [x - rr, y - 40]]), C.leaf, { a: .45, seed: 510 + i, bloom: { x: 420, y: 980, r: clamp(lawn * 1.2 - .2) * 1400 }, blooms: 3 });
    R.pen(crown, { w: 2.6, prog, seed: 520 + i, over: 3 }); R.pen([[x, y - 50], [x + 4, y + 30]], { w: 2.6, prog, seed: 530 + i }); }
  R.pen([[-40, 660], [400, 640], [1120, 650]], { w: 2.4, prog, seed: 540 });
  for (let i = 0; i < 46; i++) { const x = 40 + hash(i * 1.7) * 1000, y = 700 + hash(i * 2.3) * 430; if (Math.hypot((x - 300) / 300, (y - 1010) / 90) < 1) continue; R.pen([[x, y], [x + 2, y - 14]], { w: 2, a: .7, seed: 550 + i, over: 0, gaps: false }); R.pen([[x + 7, y], [x + 8, y - 11]], { w: 2, a: .7, seed: 600 + i, over: 0, gaps: false }); }
  const pond = ell(300, 1010, 280, 80, 34); if (pondCol > 0) R.wash(pond, C.water, { a: .45 * pondCol, smooth: true, step: 1e4, seed: 650 }); R.pen(close(pond), { w: 2.8, prog, seed: 651, closed: true, over: 0, gaps: false });
  for (let i = 0; i < 4; i++) R.pen([[120 + i * 110, 1000 + (i % 2) * 20], [180 + i * 110, 1000 + (i % 2) * 20]], { w: 2, a: .6, seed: 660 + i, over: 0 });
  // bench + sitter (x < 900)
  R.pen([[650, 800], [880, 800]], { w: 3, prog, seed: 670 }); R.pen([[650, 760], [880, 760]], { w: 3, prog, seed: 671 }); R.pen([[660, 800], [660, 860]], { w: 3, prog, seed: 672 }); R.pen([[870, 800], [870, 860]], { w: 3, prog, seed: 673 });
  person(800, 790, t, react, prog);
  dog(t, { x: 430, y: 1080, sc: 1, ...dogO });
  if (curls > 0) for (let i = 0; i < 4; i++) curl(t, 500 + i * 30, 900 - i * 20, 740, 660 + i * 10, i * .45 - 5, 1.9, 700 + i * 7, { a: curls, arc: 90 + i * 20 });
  g.restore();
}
// ---------- page B: fur, up close (hairs, microbes living on them, molecules; water arrives as colour) ----------
const HAIRS = Array.from({ length: 6 }, (_, i) => ({ x0: -140 + i * 230, y0: 1130, x1: 120 + i * 230, y1: 400, w: 60 + 14 * hash(i) }));
const MIC = Array.from({ length: 18 }, (_, i) => { const h = HAIRS[i % 6], u = .15 + .7 * hash(i * 3.3); return { x: lerp(h.x0, h.x1, u) + (hash(i * 5) - .5) * 90, y: lerp(h.y0, h.y1, u), kind: i % 3 === 1 ? 1 : 0, a: hash(i) * 3 }; });
const MOL = Array.from({ length: 22 }, (_, i) => { const m = MIC[i % 18]; return { x: m.x + 40 * Math.cos(i * 2.1), y: m.y + 30 * Math.sin(i * 1.7) }; });
function fur(t, { micro = 1, mol = 0, loose = 0, water = 0, prog = 1 } = {}) {
  if (water > 0) R.wash([[-60, 380], [1140, 380], [1140, 1140], [-60, 1140]], C.water, { a: .42, seed: 801, bloom: { x: 80, y: 280, r: water * 1700 }, blooms: 4, br: 240 });
  HAIRS.forEach((h, i) => { const dx = h.x1 - h.x0, dy = h.y1 - h.y0, L = Math.hypot(dx, dy), nx = -dy / L * h.w / 2, ny = dx / L * h.w / 2, sag = water * 26;
    const side = k => Array.from({ length: 9 }, (_, j) => { const u = j / 8; return [h.x0 + dx * u + k * nx + sag * Math.sin(u * Math.PI), h.y0 + dy * u + k * ny]; });
    const A = side(1), B = side(-1).reverse(); R.wash(A.concat(B), C.fur, { a: .5, seed: 810 + i, dens: false, shade: .5 });
    R.pen(A, { w: 3.2, prog, seed: 820 + i, over: 6 }); R.pen(B, { w: 3.2, prog, seed: 830 + i, over: 6 });
    for (let k = 0; k < 4; k++) { const u = .15 + k * .22; R.pen([[h.x0 + dx * u - nx * .5, h.y0 + dy * u - ny * .5], [h.x0 + dx * (u + .05) + nx * .4, h.y0 + dy * (u + .05) + ny * .4]], { w: 2, a: .6, seed: 840 + i * 5 + k, over: 0, gaps: false }); } });
  MIC.forEach((m, i) => { const k = clamp(micro * 18 - i); if (k <= 0) return; const j = 3 * Math.sin(t * 4 + i), x = m.x + j, y = m.y + 2 * Math.cos(t * 3 + i);
    if (m.kind === 0) { const a = m.a, cap = ell(0, 0, 1, 1, 20).map(([p, q]) => [x + p * 44 * Math.cos(a) - q * 18 * Math.sin(a), y + p * 44 * Math.sin(a) + q * 18 * Math.cos(a)]);
      R.wash(cap, C.bact, { a: .75 * k, smooth: true, step: 1e4, seed: 860 + i, blooms: 0 }); R.pen(close(cap), { w: 2.6, prog: k, boil: true, seed: 880 + i, closed: true, over: 0, gaps: false }); }
    else { const b = ell(x, y, 36, 30, 18), bud = ell(x + 36, y - 26, 18, 16, 12); R.wash(b, C.yeast, { a: .75 * k, smooth: true, step: 1e4, seed: 900 + i, blooms: 0 }); R.wash(bud, C.yeast, { a: .75 * k, smooth: true, step: 1e4, seed: 920 + i, blooms: 0 });
      R.pen(close(b), { w: 2.6, prog: k, boil: true, seed: 940 + i, closed: true, over: 0, gaps: false }); R.pen(close(bud), { w: 2.4, prog: k, boil: true, seed: 960 + i, closed: true, over: 0, gaps: false }); } });
  MOL.forEach((m, i) => { const k = clamp(mol * 22 - i); if (k <= 0) return; const u = clamp(loose * 1.3 - hash(i) * .3), x = m.x + 26 * Math.sin(t * 1.6 + i) * u, y = m.y - u * 420;
    R.fillCirc(x, y, 14, C.mol, { a: .8 * k, seed: 980 + i, blooms: 0, edge: 1.4 }); R.fillCirc(x + 18, y - 10, 9, C.mol, { a: .8 * k, seed: 1010 + i, blooms: 0, edge: 1.2 }); R.pen([[x, y], [x + 18, y - 10]], { w: 2.4, prog: k, seed: 1040 + i, over: 0, gaps: false }); });
}
// ---------- page C: smell notes (tallies, four little studies, the x32 bars, everything curling into one cloud) ----------
function mushroom(x, y, k, sd) { const cap = Array.from({ length: 14 }, (_, i) => { const a = Math.PI + i / 13 * Math.PI; return [x + Math.cos(a) * 60, y - 40 + Math.sin(a) * 44]; }), st = [[x - 18, y - 40], [x + 18, y - 40], [x + 14, y + 14], [x - 16, y + 14]];
  R.wash(cap, PAL.brick, { a: .6 * k, seed: sd, dens: false }); R.wash(st, '#ead9b8', { a: .7 * k, seed: sd + 1, dens: false }); R.pen(close(cap), { w: 3, prog: k, boil: true, seed: sd + 2, closed: true, over: 0, gaps: false }); R.pen(close(st), { w: 3, prog: k, boil: true, seed: sd + 3, closed: true, over: 0, gaps: false }); }
function cherry(x, y, k, sd) { [[-22, 0], [22, 8]].forEach(([dx, dy], i) => { const c = ell(x + dx, y + dy, 26, 26, 18); R.wash(c, '#b33a3a', { a: .65 * k, smooth: true, step: 1e4, seed: sd + i }); R.pen(close(c), { w: 3, prog: k, boil: true, seed: sd + 2 + i, closed: true, over: 0, gaps: false }); R.pen([[x + dx, y + dy - 24], [x + 4, y - 80]], { w: 2.6, prog: k, boil: true, seed: sd + 4 + i }); });
  R.wash([[x + 4, y - 80], [x + 40, y - 92], [x + 18, y - 70]], C.leaf, { a: .7 * k, seed: sd + 6, dens: false }); }
function flower(x, y, k, sd) { for (let i = 0; i < 6; i++) { const an = i * 1.047, p = ell(x + Math.cos(an) * 28, y - 40 + Math.sin(an) * 28, 20, 20, 14); R.wash(p, PAL.rose, { a: .6 * k, smooth: true, step: 1e4, seed: sd + i }); R.pen(close(p), { w: 2.4, prog: k, boil: true, seed: sd + 10 + i, closed: true, over: 0, gaps: false }); }
  R.fillCirc(x, y - 40, 14, PAL.gold, { a: .8 * k, seed: sd + 20 }); R.pen([[x, y - 20], [x - 4, y + 16]], { w: 3, prog: k, boil: true, seed: sd + 21 }); }
function poop(x, y, k, sd) { [[0, 0, 52, 18], [0, -24, 40, 16], [2, -46, 26, 13]].forEach(([dx, dy, rx, ry], i) => { const p = ell(x + dx, y + dy, rx, ry, 20); R.wash(p, '#8a5a34', { a: .65 * k, smooth: true, step: 1e4, seed: sd + i }); R.pen(close(p), { w: 3, prog: k, boil: true, seed: sd + 5 + i, closed: true, over: 0, gaps: false }); });
  R.pen([[x + 2, y - 59], [x + 10, y - 72], [x + 2, y - 80]], { w: 2.6, prog: k, boil: true, seed: sd + 9 }); }
// ---------- page D: the bath ----------
function bath(t) { const k = seg(t, s(16) - .2, s(16) + .6), tub = [[160, 900], [760, 900], [720, 1100], [200, 1100]];
  for (let i = 0; i < 6; i++) R.pen([[60, 420 + i * 80], [880, 420 + i * 80]], { w: 2, a: .5, prog: k, seed: 1590 + i, over: 3 }); for (let i = 0; i < 9; i++) R.pen([[80 + i * 100, 420], [80 + i * 100, 820]], { w: 2, a: .5, prog: k, seed: 1580 + i, over: 3 });
  R.pen([[820, 420], [820, 520], [760, 560]], { w: 4, prog: k, seed: 1575 }); R.circle(740, 580, 34, { w: 3, prog: k, seed: 1576 });
  dog(t, { x: 430, y: 1000, sc: .85, wet: 1, prog: 1, seed: 1600 });
  R.wash(tub, '#eef3f5', { a: .9, seed: 1610, dens: false }); R.wash([[170, 920], [750, 920], [714, 1090], [206, 1090]], C.water, { a: .5, seed: 1611, dens: false, bloom: { x: 460, y: 960, r: seg(t, s(16), r(16, 1.4)) * 600 } });
  R.pen(close(tub), { w: 3.4, prog: k, seed: 1612, closed: true, over: 0, gaps: false }); R.pen([[200, 1100], [190, 1130]], { w: 4, prog: k, seed: 1613 }); R.pen([[720, 1100], [730, 1130]], { w: 4, prog: k, seed: 1614 });
  for (let i = 0; i < 9; i++) R.circle(220 + hash(i) * 480, 905 + 12 * Math.sin(t * 2 + i), 10 + 10 * hash(i * 3), { w: 2.2, seed: 1620 + i, boil: true });
  for (let i = 0; i < 4; i++) curl(t, 340 + i * 60, 820, 300 + i * 90, 420, r(16, 1.0) + i * .4, 2.0, 1650 + i * 7, { a: .85, arc: 60 });
  R.text('+ water', 760, 520, { size: 64, col: PAL.accent, reveal: seg(t, r(16, 2.4), r(16, 3.0)) }); }

// ---------- pages, notes, captions ----------
function pageA(t) {   // hook, the drying scene, the payoff
  if (t < s(2)) { const out = eio(seg(t, .9, 2.1)), push = eio(seg(t, r(1, .6), r(1, 2.0)));
    cam(lerp(lerp(2.4, 1.05, out), 1.7, push), lerp(lerp(470, 560, out), 450, push), lerp(lerp(900, 830, out), 900, push), t);
    park(t, { dogO: { wet: 1, shake: 1 - ss(seg(t, 2.4, 3.1)) }, curls: 1, react: seg(t, 1.5, 1.9) * (1 - seg(t, r(1, .4), r(1, .8))) });
    screen(); if (push > .3) { const k = seg(t, r(1, 1.4), r(1, 2.2)); R.circle(525, 935, 150, { w: 4, prog: k, seed: 1700 }); R.text('who lives on it?', 525, 750, { size: 56, col: PAL.accent, reveal: seg(t, r(1, 1.8), r(1, 2.4)) }); } }
  else if (t < s(17) - .4) { cam(1.0 + .03 * seg(t, s(9), s(10)), 540, 860, t);
    park(t, { dogO: { wet: 1 - .5 * seg(t, r(9, .5), r(9, 3)) }, curls: seg(t, r(9, .6), r(9, 1.2)), react: seg(t, r(9, 2.6), r(9, 3.1)) }); }
  else { const pb = eio(seg(t, s(17) - .3, r(17, 1.5))); cam(lerp(1.08, .94, pb), 540, 860, t); park(t, { dogO: { wet: .3 }, lawn: seg(t, r(17, .4), r(17, 3.6)), curls: 1 }); }
}
function margin(t) {   // handwritten notes in the top margin (screen space, inside the safe band)
  const N = [[0, s(2) - .3, 'Sat. 4:10 pm, by the pond, after a swim'], [s(2) - .3, s(3) - .2, 'fur, up close'], [s(3) - .2, s(4) - .2, '1. a dog: skin + fur = bacteria + yeast'], [s(4) - .2, s(5) - .2, 'Texas A&M vet study: furry skin, richest mix'],
    [s(5) - .2, s(6) - .2, '2. microbes give off smelly molecules'], [s(6) - .2, s(7) - .2, 'dry: they stay put'], [s(7) - .2, s(8) - .2, '3. add water'], [s(8) - .2, s(9) - .2, 'knocked loose'], [s(9) - .2, s(10) - .3, '4. let it dry: up to your nose'],
    [s(10) - .3, s(12) - .2, 'how many smells?'], [s(12) - .2, s(14) - .2, 'what they smell like'], [s(14) - .2, s(15) - .2, 'one jumped x32 when wet'], [s(15) - .2, s(16) - .3, 'no single molecule'], [s(16) - .3, s(17) - .3, 'bath time'], [s(17) - .3, s(18) - .2, 'wet dog = microbes + water + your nose'], [s(18) - .2, s(19) - .3, 'does yours stink when wet?']];
  screen(); N.forEach(([a, b, txt], i) => { if (t < a || t >= b) return; R.text(txt, 80, 330, { size: i === 0 ? 46 : 54, col: i === 0 ? INK2 : INK, reveal: seg(t, a + .1, a + .1 + Math.min(1.2, txt.length * .03)), align: 'left', weight: i === 0 ? 500 : 600 }); });
  if (t >= s(18) - .2 && t < s(19) - .3) [['yes', 300], ['no', 600]].forEach(([w, x], i) => { const k = seg(t, r(18, .8) + i * .3, r(18, 1.3) + i * .3); R.rect(x - 60, 400, 40, 40, { w: 3, prog: k, seed: 1800 + i }); R.text(w, x + 30, 438, { size: 64, reveal: k, align: 'left' }); }); }
function parse(c) { const o = []; c.split('**').forEach((x, i) => x && x.split(/(\s+)/).forEach(w => w && o.push({ w, b: i % 2 === 1 }))); return o; }
function caption(t) {   // handwritten subtitle in the lower margin, written on left to right
  const ph = PH.findLast(p => t >= p.start - .1); if (!ph || ph.i === PH.length - 1) return; const nx = PH[ph.i + 1].start, k = seg(t, ph.start - .1, ph.start + .5), out = 1 - seg(t, nx - .2, nx - .05); if (k <= 0 || out <= 0) return;
  screen(); g.save(); const size = 58; g.font = `600 ${size}px "Caveat"`; const words = parse(ph.cap), lines = [[]]; let cw = 0;
  for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > 820 && !/^\s+$/.test(w.w) && lines.at(-1).length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines.at(-1).push(w); cw += m; } }
  const lh = 64, y0 = 1290 - (lines.length - 1) * lh / 2 + 18, total = lines.reduce((a, l) => a + l.length, 0); let idx = 0; g.globalAlpha = out;
  lines.forEach((ln, li) => { const tw = ln.reduce((a, w) => a + g.measureText(w.w).width, 0); let x = 540 - tw / 2; ln.forEach(w => { const show = idx / total < k * 1.05; idx++; if (show) { g.lineJoin = 'round'; g.strokeStyle = rgba(PAPER, .9); g.lineWidth = 12; g.strokeText(w.w, x, y0 + li * lh); g.fillStyle = w.b ? PAL.accent : rgba(INK, .95); g.fillText(w.w, x, y0 + li * lh); } x += g.measureText(w.w).width; }); });
  g.restore(); }
function endcard(t) { const t0 = s(19) - .3; screen();
  R.text('Follow for more of', 540, 700, { size: 92, reveal: seg(t, t0 + .1, t0 + .8) }); R.text('how it really works.', 540, 820, { size: 110, reveal: seg(t, t0 + .5, t0 + 1.3), col: PAL.accent });
  R.pen([[300, 852], [540, 848], [780, 844]], { w: 3, prog: seg(t, t0 + 1.0, t0 + 1.5), seed: 1900 });
  R.text("A new 'wait, really?' every day.", 540, 930, { size: 52, col: INK2, reveal: seg(t, t0 + 1.2, t0 + 1.6), weight: 500 }); R.text('@howitreallyworkstudio', 540, 1010, { size: 44, reveal: seg(t, t0 + 1.4, t0 + 1.8), weight: 500 });
  cam(1, 540, 960, t); dog(t, { x: 470, y: 1150, sc: .38, wet: .3, seed: 1950 }); curl(t, 520, 1080, 620, 1000, t0, 1.8, 1960, { a: .8, arc: 30, rad: 10, dab: 6 }); }

// page turn: the new page slides over from the right with a curled shadowed edge
function turn(t, t0, oldF, newF) { const u = eio(seg(t, t0, t0 + .55)); if (u <= 0) { oldF(t); return; } if (u >= 1) { newF(t); return; }
  oldF(t); const ex = W * (1 - u); screen(); g.save(); g.beginPath(); g.rect(ex, 0, W - ex + 10, H); g.clip(); g.drawImage(R.paperImg, 0, 0); newF(t); g.restore();
  screen(); const gr = g.createLinearGradient(ex - 60, 0, ex + 20, 0); gr.addColorStop(0, 'rgba(60,40,20,0)'); gr.addColorStop(1, 'rgba(60,40,20,.28)'); g.fillStyle = gr; g.fillRect(ex - 60, 0, 80, H); g.fillStyle = 'rgba(255,250,240,.6)'; g.fillRect(ex, 0, 3, H); }
// shared little drawings, scalable
function bug(t, x, y, kind, sc, seed, k = 1) { if (k <= 0) return; const xx = x + 3 * Math.sin(t * 4 + seed), yy = y + 2 * Math.cos(t * 3 + seed), po = { w: 2.6, prog: k, boil: true, closed: true, over: 0, gaps: false };
  if (kind === 0) { const a = hash(seed) * 3, cap = ell(0, 0, 1, 1, 20).map(([p, q]) => [xx + p * 26 * sc * Math.cos(a) - q * 11 * sc * Math.sin(a), yy + p * 26 * sc * Math.sin(a) + q * 11 * sc * Math.cos(a)]);
    R.wash(cap, C.bact, { a: .75 * k, smooth: true, step: 1e4, seed, blooms: 0 }); R.pen(close(cap), { ...po, seed: seed + 1 }); }
  else { const b = ell(xx, yy, 22 * sc, 18 * sc, 18), bud = ell(xx + 22 * sc, yy - 16 * sc, 11 * sc, 10 * sc, 12); R.wash(b, C.yeast, { a: .75 * k, smooth: true, step: 1e4, seed, blooms: 0 }); R.wash(bud, C.yeast, { a: .75 * k, smooth: true, step: 1e4, seed: seed + 2, blooms: 0 });
    R.pen(close(b), { ...po, seed: seed + 3 }); R.pen(close(bud), { ...po, seed: seed + 4 }); } }
function molecule(x, y, k, seed, sc = 1) { if (k <= 0) return; R.fillCirc(x, y, 14 * sc, C.mol, { a: .8 * k, seed, blooms: 0, edge: 1.4 }); R.fillCirc(x + 18 * sc, y - 10 * sc, 9 * sc, C.mol, { a: .8 * k, seed: seed + 1, blooms: 0, edge: 1.2 }); R.pen([[x, y], [x + 18 * sc, y - 10 * sc]], { w: 2.4, prog: k, seed: seed + 2, over: 0, gaps: false }); }
function sized(f, x, y, sc, k, sd) { g.save(); g.translate(x, y); g.scale(sc, sc); f(0, 0, k, sd); g.restore(); }
// B1: the fur, then a push-in on one hair with bacteria and yeast living on it
const M2 = MIC.filter((_, i) => i % 6 === 2), M2X = M2.reduce((a, m) => a + m.x, 0) / M2.length, M2Y = M2.reduce((a, m) => a + m.y, 0) / M2.length;
const pageB1 = t => { const pz = eio(seg(t, r(3, .3), r(3, 3.0))), hx = M2X, hy = M2Y;
  cam(lerp(1, 2.0, pz), lerp(540, hx, pz) + 30 * Math.sin(t * .3), lerp(960, hy, pz), t); fur(t, { micro: seg(t, r(3, 1.4), r(3, 3.6)) }); };
// B2: Texas A&M: furry skin has the richest mix (two sample circles, a small dog between them)
function sample(t, cx, cy, rr, n, seed, k) { R.wash(ell(cx, cy, rr, rr, 32), '#fbf3e4', { a: .9, smooth: true, step: 1e4, seed, blooms: 0 }); g.save(); g.beginPath(); g.arc(cx, cy, rr - 4, 0, 6.29); g.clip();
  for (let i = 0; i < 3; i++) { const x0 = cx - rr + i * rr * .8, A = [[x0 - 40, cy + rr], [x0 + 80, cy - rr]], th = 34; R.wash([[A[0][0] - th, A[0][1]], [A[1][0] - th, A[1][1]], [A[1][0] + th, A[1][1]], [A[0][0] + th, A[0][1]]], C.fur, { a: .45, seed: seed + 40 + i, dens: false }); R.pen([[A[0][0] - th, A[0][1]], [A[1][0] - th, A[1][1]]], { w: 2.6, seed: seed + 50 + i }); R.pen([[A[0][0] + th, A[0][1]], [A[1][0] + th, A[1][1]]], { w: 2.6, seed: seed + 60 + i }); }
  for (let i = 0; i < n; i++) bug(t, cx + (hash(seed + i) - .5) * rr * 1.4, cy + (hash(seed + i * 3) - .5) * rr * 1.4, i % 3 === 1 ? 1 : 0, 1.1, seed + 10 + i * 7, clamp(k * n - i));
  g.restore(); R.circle(cx, cy, rr, { w: 4, seed }); }
const pageB2 = t => { cam(1.0 + .14 * ss(seg(t, s(4) - .4, s(5))), 540 + 10 * Math.sin(t * .4), 900, t); const k = seg(t, s(4) - .2, r(4, 3.5));
  sample(t, 300, 640, 220, 16, 2100, k); sample(t, 740, 700, 140, 4, 2200, k);
  R.text('furry skin', 300, 930, { size: 66, col: PAL.accent, reveal: seg(t, r(4, 1.2), r(4, 1.8)) }); R.text('most kinds', 300, 990, { size: 50, col: INK2, reveal: seg(t, r(4, 1.8), r(4, 2.4)) });
  R.text('bare, moist spots', 690, 900, { size: 50, reveal: seg(t, r(4, 2.4), r(4, 3.0)) }); R.text('fewer kinds', 690, 955, { size: 46, col: INK2, reveal: seg(t, r(4, 3.0), r(4, 3.6)) });
  dog(t, { x: 470, y: 1135, sc: .42, wet: 1, seed: 2300 }); };
// B3: side view: two hairs lying flat, bugs on top, molecules appear, stay put dry, the water front sweeps across and lifts them off
const SIDE = [[150, 0], [330, 1], [520, 0], [700, 1], [850, 0]];
const pageB3 = t => { cam(1.01 + .06 * ss(seg(t, s(5), s(9))), 540 + 14 * Math.sin(t * .45), 960 - 60 * ss(seg(t, s(5), s(9))) + 8 * Math.sin(t * .35), t);
  const wf = seg(t, r(7, .3), r(7, 2.2)); if (wf > 0) R.wash([[-60, 330], [1140, 330], [1140, 1140], [-60, 1140]], C.water, { a: .42, seed: 2400, bloom: { x: -300, y: 760, r: wf * 1700 }, blooms: 3, br: 240 });
  [[790, 74], [1020, 56]].forEach(([y, th], i) => { const top = Array.from({ length: 12 }, (_, j) => [-60 + j * 110, y - th / 2 + 6 * Math.sin(j * 1.3 + i)]), bot = top.map(([x, yy]) => [x, yy + th]).reverse();
    R.wash(top.concat(bot), C.fur, { a: .55, seed: 2410 + i, dens: false, shade: .5 }); R.pen(top, { w: 3.4, seed: 2420 + i, over: 6 }); R.pen(bot, { w: 3.4, seed: 2430 + i, over: 6 });
    for (let k = 0; k < 9; k++) R.pen([[40 + k * 120, y - th * .2], [80 + k * 120, y + th * .2]], { w: 2, a: .55, seed: 2440 + i * 10 + k, over: 0, gaps: false }); });
  SIDE.forEach(([x, kind], i) => bug(t, x, 722, kind, 1.7, 2500 + i * 5, seg(t, s(5) - .3, s(5) + .4)));
  for (let i = 0; i < 15; i++) { const bx = SIDE[i % 5][0] + (i < 5 ? -24 : i < 10 ? 26 : 0), by0 = 650 - Math.floor(i / 5) * 42, k = seg(t, r(5, .6) + i * .1, r(5, 1.0) + i * .1);
    const up = seg(t, r(8, .2) + hash(i) * .6, r(8, 2.4) + hash(i) * .6), x = bx + up * 40 * Math.sin(i + t * 1.5), y = by0 - up * (240 + 60 * hash(i * 3)); molecule(x, y, k, 2600 + i * 3, 1); }
  if (t > s(6) - .2 && t < s(7) - .2) { nose(780, 470, 0, seg(t, r(6, .4), r(6, 1.2)), 2700); R.text('zzz', 850, 400, { size: 56, col: INK2, reveal: seg(t, r(6, 1.0), r(6, 1.6)) }); }
  if (t > s(7)) for (let i = 0; i < 14; i++) { const u = (t * 1.1 + hash(i)) % 1; R.fillCirc(80 + hash(i * 7) * 820, lerp(340, 700, u), 8, C.water, { a: .7 * (1 - u) * (1 - seg(t, r(8, 1), r(8, 2))), seed: 2800 + i, blooms: 0, edge: 1.2 }); } };
// C1-C4: smell notes as full sketchbook spreads
function tallyBig(x, y, n, k, seed) { for (let i = 0; i < n; i++) { const kk = clamp(k * n - i); if (kk <= 0) break; const grp = Math.floor(i / 5), j = i % 5, gx = x + grp * 148;
    if (j < 4) R.pen([[gx + j * 26, y], [gx + j * 26 + 5, y - 82]], { w: 4, prog: kk, seed: seed + i, over: 4, gaps: false }); else R.pen([[gx - 12, y - 14], [gx + 100, y - 66]], { w: 4, prog: kk, seed: seed + i, over: 4, gaps: false }); } }
const drift = t => cam(1.01 + .01 * Math.sin(t * .4), 540 + 12 * Math.sin(t * .6), 960 + 10 * Math.sin(t * .5), t);
const pageC1 = t => { drift(t); const cu = seg(t, s(10) - .2, s(10) + 1.2);
  R.wash(ell(540, 480, 280, 90, 26), C.smell, { a: .35, smooth: true, step: 1e4, seed: 1440, bloom: { x: 540, y: 480, r: 320 * cu } });
  for (let j = 0; j < 4; j++) curl(t, 360 + j * 110, 560, 400 + j * 120, 430, s(10) + j * .4, 2.0, 1430 + j, { a: .8, arc: 50, rad: 18, dab: 9 }); R.text('?', 860, 520, { size: 150, col: PAL.accent, reveal: cu });
  const k1 = seg(t, r(11, .4), r(11, 2.6)), k2 = seg(t, r(11, 4.2), r(11, 5.8));
  R.text('wet hair', 80, 720, { size: 62, col: PAL.accent, reveal: seg(t, r(11, .1), r(11, .5)), align: 'left' }); tallyBig(90, 860, 22, k1, 1100);
  if (k1 >= 1) R.text('22', 440, 728, { size: 120, col: PAL.accent, reveal: seg(t, r(11, 2.6), r(11, 3.0)), align: 'left' });
  R.text('dry hair', 80, 960, { size: 62, col: INK2, reveal: seg(t, r(11, 3.8), r(11, 4.2)), align: 'left' }); tallyBig(90, 1100, 16, k2, 1200);
  if (k2 >= 1) R.text('16', 440, 968, { size: 110, col: INK2, reveal: seg(t, r(11, 5.8), r(11, 6.2)), align: 'left' }); };
const STUDY = [[mushroom, 'mushroom'], [cherry, 'fruity'], [flower, 'floral'], [poop, 'poop']];
const pageC2 = t => { drift(t); const P = [[300, 700], [760, 700], [300, 1040], [760, 1040]];
  STUDY.forEach(([f, lab], i) => { const t0 = i < 3 ? r(12, .3 + i * 1.0) : r(13, .9), k = seg(t, t0, t0 + .7); if (k <= 0) return; const [x, y] = P[i];
    sized(f, x, y - 60, 2.0, k, 1300 + i * 40); R.text(lab, x, y + 20, { size: 60, col: i === 3 ? PAL.accent : INK2, reveal: seg(t, t0 + .3, t0 + .8) });
    if (i === 3) for (let j = 0; j < 3; j++) curl(t, x - 40 + j * 40, y - 200, x - 20 + j * 50, y - 330, t0 + j * .5, 2.0, 1400 + j, { a: .8, arc: 30, rad: 14, dab: 8 }); }); };
const pageC3 = t => { drift(t); const k = seg(t, r(14, .6), r(14, 2.6)), base = 1060, top = 440;
  R.pen([[120, base], [700, base]], { w: 3.4, seed: 1500 }); R.wash(R.rectPts(200, base - (base - top) / 32 - 2, 130, (base - top) / 32 + 2), INK2, { a: .55, seed: 1501, dens: false }); R.rect(200, base - (base - top) / 32 - 2, 130, (base - top) / 32 + 2, { w: 3, seed: 1504 });
  if (k > 0) { const hh = (base - top) * k; R.wash(R.rectPts(420, base - hh, 130, hh), PAL.accent, { a: .6, seed: 1502, dens: false }); R.rect(420, base - hh, 130, hh, { w: 3.4, seed: 1503 }); }
  R.text('dry', 265, base + 60, { size: 56, col: INK2 }); R.text('wet', 485, base + 60, { size: 56, col: PAL.accent });
  R.text('×32', 610, 720, { size: 170, col: PAL.accent, reveal: seg(t, r(14, 1.6), r(14, 2.2)), align: 'left' }); R.text('benzaldehyde', 616, 800, { size: 52, col: INK2, reveal: seg(t, r(14, 2.0), r(14, 2.6)), align: 'left' });
  nose(790, 980, seg(t, r(14, 2.4), r(14, 2.9)), seg(t, r(14, .2), r(14, .8)), 1510); };
const pageC4 = t => { drift(t); const mixU = ss(seg(t, r(15, .1), r(15, 1.8)));
  R.wash(ell(540, 520, 330 * (.3 + .7 * mixU), 110 * (.3 + .7 * mixU), 26), C.smell, { a: .42, smooth: true, step: 1e4, seed: 1450, bloom: { x: 540, y: 520, r: 400 * mixU + 20 } });
  R.text('= wet dog', 540, 550, { size: 110, col: PAL.accent, reveal: seg(t, r(15, 1.4), r(15, 2.2)) });
  STUDY.forEach(([f], i) => { const x = 150 + i * 230, y = 1000; sized(f, x, y, 1.5, 1, 1300 + i * 40); for (let j = 0; j < 2; j++) curl(t, x - 10 + j * 20, y - 120, lerp(x, 540, mixU), lerp(y - 300, 560, mixU), s(15) - .3 + j * .6 + i * .2, 2.0, 1460 + i * 9 + j, { a: .85, arc: 40, rad: 16, dab: 8 }); }); };
const pageD = t => { cam(1, 540, 960, t); bath(t); };
const pageE = t => { endcard(t); };
const PAGES = () => [[0, pageA], [s(2) - .4, pageB1], [s(4) - .4, pageB2], [s(5) - .4, pageB3], [s(9) - .3, pageA], [s(10) - .4, pageC1], [s(12) - .4, pageC2], [s(14) - .4, pageC3], [s(15) - .4, pageC4], [s(16) - .4, pageD], [s(17) - .4, pageA], [s(19) - .4, pageE]];
function scene(t) {
  R.begin(t);
  const L = PAGES(); let i = 0; for (let k = 0; k < L.length; k++) if (t >= L[k][0]) i = k;
  if (i > 0) turn(t, L[i][0], L[i - 1][1], L[i][1]); else L[0][1](t);
  if (t < s(19) - .4) margin(t);
  caption(t); screen(); R.finish();
}
window.DUR = TOT;
// loop: blend the frame-0 page back in over the last 0.5 s (max 30%)
window.seek = t => { scene(t); const lp = seg(t, TOT - .5, TOT); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); scene(0); const f0 = g.getImageData(0, 0, W, H); const k = .3 * ss(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { R.begin(.37); cam(1.25, 470, 900, .37); park(.37, { dogO: { wet: 1, shake: 1 }, curls: 1, react: 1, lawn: .6 }); screen();
  R.text('Wet dog', 80, 420, { size: 170, align: 'left' }); R.text('smell?', 80, 580, { size: 170, align: 'left', col: PAL.accent }); R.text('the microbes did it', 540, 1500, { size: 76 }); R.finish(); };
window.seek(0); window.ready = true; window.READY = true;
