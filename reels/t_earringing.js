// t_earringing.js: "Why do your ears ring after a concert?" in the silkscreen-poster style (#7), on the contrails engine and layout (H1).
// Grammar kept: print table, squeegee pulls (one ink, one beat), split-fountain bead, screen lift, stepped bands, paper as a colour,
// info band, silhouette wipes, wall lockup, end card printed in two pulls. A gig poster for a concert reel. Vertical 1080x1920, deterministic in t.
// Safe zones: posters framed in y 250-1150, printed caption strip at y 1170-1410 (text inside x 190-890), nothing written top 250 / right column.
// Motion: a music note rides the banner with sound waves behind it; each poster carries its moving print (swaying hair cells, a climbing dB needle,
// ringing waves over flattened cells, regrow arrows that the human ear doesn't get).
import { makeTextures, squeegee, screenFrame, wipeFront, wipeRegion, ink, rectPath, polyPath, circlePath, ringPath, clamp, lerp, mix, hash, mulberry, paperSheet, inkFinish, bandSteps } from './styles/silkscreen-poster/engine/silk.js';
import { drawPoster, drawBanner, pickInk, PW, PH, ART, BW, BH, BANNER_ART, BANNER_BANDS, ARTV, SHIFT } from './styles/silkscreen-poster/engine/poster.js';
import { pine, range } from './styles/silkscreen-poster/engine/scenes.js';
await Promise.all(['900 40px BigShoulders', '800 40px BigShoulders', '500 40px Outfit', '600 40px Outfit', '700 40px Outfit', '800 40px Outfit'].map(f => document.fonts.load(f)));

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; cv.style.width = '540px'; cv.style.height = '960px';
const ctx = cv.getContext('2d');
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const TLp = window.TL.p, DUR = window.TL.total;
const a = i => TLp[i].start, e = i => TLp[i].end;

// ------------------------------------------------------------------ palettes (<= 6 inks + glow; a new palette per poster, same template; gig-poster night colours)
const PAPER = '#F2E8D2', TABLE = '#4A3A4E';
const PAL = {
  banner: { sky1: '#4A2A78', sky2: '#E8467C', far: '#1A0F2E', mid: '#F2B134', near: '#0E0A18', sun: '#FFD166', glow: '#FFFFFF' },
  cells: { sky1: '#FCE3D0', sky2: '#E8467C', far: '#8E2C5A', mid: '#F2A7B8', near: '#2A1222', sun: '#F2B134', glow: '#FFFFFF', red: '#C7243A' },
  loud: { sky1: '#24306A', sky2: '#4A7BE0', far: '#121A44', mid: '#8FB8F2', near: '#0A0E22', sun: '#FFD166', glow: '#FFFFFF', red: '#FF5A3D' },
  ring: { sky1: '#F6E3A0', sky2: '#E8862B', far: '#8A3B1E', mid: '#F2C14E', near: '#2A1A12', sun: '#FFF2B0', glow: '#FFFFFF', red: '#C7243A' },
  regrow: { sky1: '#D9F0E0', sky2: '#2E8A6A', far: '#1E5A44', mid: '#8FD1B0', near: '#0F2A20', sun: '#F2B134', glow: '#FFFFFF', red: '#C7243A' },
  end: { sky1: '#F2EEE4', sky2: '#E8467C', far: '#4A2A78', mid: '#4A2A78', near: '#14102A', sun: '#FFD166', glow: '#FFFFFF' },
};
const T = makeTextures(PAPER, 7);
const BANNER_C = { title: 'Why do your ears ring?', footer: 'Hair cells, decibels and earplugs' };
// ------------------------------------------------------------------ shape helpers (shared with the cranberries reel)
function wavePath(x0, x1, y, amp, wl, th) {
  const up = [], dn = [];
  for (let x = x0; x <= x1; x += 4) { const yy = y + amp * Math.sin((x - x0) / wl * Math.PI * 2); up.push([x, yy - th / 2]); dn.push([x, yy + th / 2]); }
  return polyPath(up.concat(dn.reverse()));
}
function rays(cx, cy, n, r0, r1, th, rot = 0, jit = 0, seed = 1) {
  const p = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const an = rot + i / n * Math.PI * 2 + (r() - .5) * jit, l1 = r1 * (.75 + .25 * r());
    const c = Math.cos(an), s = Math.sin(an), nx = -s * th / 2, ny = c * th / 2;
    p.addPath(polyPath([[cx + c * r0 + nx, cy + s * r0 + ny], [cx + c * l1 + nx, cy + s * l1 + ny], [cx + c * l1 - nx, cy + s * l1 - ny], [cx + c * r0 - nx, cy + s * r0 - ny]]));
  }
  return p;
}
function line(x0, y0, x1, y1, th) { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * th / 2, ny = dx / L * th / 2; return polyPath([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]); }
function dashes(x0, y0, x1, y1, th, dash, gap) { const p = new Path2D(), L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L; for (let s = 0; s < L; s += dash + gap) { const s1 = Math.min(L, s + dash); p.addPath(line(x0 + ux * s, y0 + uy * s, x0 + ux * s1, y0 + uy * s1, th)); } return p; }
// scalloped cloud: touching semicircles on a flat base (single non-self-intersecting outline, safe for even-odd knock-outs)
function cloud(x0, yb, radii, hs) {
  const p = new Path2D(); let x = x0; p.moveTo(x0, yb);
  radii.forEach((r, i) => { const cx = x + r, cy = yb - hs[i]; p.lineTo(x, cy); p.arc(cx, cy, r, Math.PI, 0); x += 2 * r; });
  p.lineTo(x, yb); p.closePath(); return { path: p, x0, x1: x, yb };
}
function bottomStrip(c, th) { return rectPath(c.x0, c.yb - th, c.x1 - c.x0, th); }

function halftone(x0, x1, y0, y1, step, rmax, up = true) {
  const p = new Path2D(); let row = 0;
  for (let y = y0; y <= y1; y += step * .87, row++) { const k = (y - y0) / (y1 - y0), r = rmax * (up ? 1 - k : k); if (r < 1.2) continue; for (let x = x0 + (row % 2) * step / 2; x <= x1; x += step) p.addPath(circlePath(x, y, r)); }
  return p;
}
function slab(text, y, size = 190) { return c => { c.font = `900 ${size}px BigShoulders`; c.letterSpacing = '6px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(text, PW / 2 + 3, y); }; }
function cloudRow(list) { const p = new Path2D(); list.forEach(([x, y, k]) => p.addPath(cloud(x, y, [38 * k, 52 * k, 40 * k], [22 * k, 46 * k, 20 * k]).path)); return p; }
function slabFit(text, y, maxSize = 190, maxW = 880) {
  return c => { let s = maxSize; for (; s > 80; s -= 4) { c.font = `900 ${s}px BigShoulders`; c.letterSpacing = '6px'; if (c.measureText(text).width <= maxW) break; } c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(text, PW / 2 + 3, y); };
}
function label(text, x, y, size = 30, align = 'center', font = 'Outfit', weight = 700, ls = 4) { return c => { c.font = `${weight} ${size}px ${font}`; c.letterSpacing = ls + 'px'; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(text, x, y); }; }
// ------------------------------------------------------------------ the music note (the hook's flyer; kept under the JET name the shared stages use)
const JET = (() => {
  const p = new Path2D();
  p.ellipse(-30, 40, 46, 32, -.4, 0, Math.PI * 2);                                         // note head
  p.moveTo(8, 30); p.lineTo(8, -150); p.lineTo(24, -150); p.lineTo(24, 30); p.closePath();   // stem
  p.moveTo(24, -150); p.bezierCurveTo(70, -120, 96, -90, 80, -30); p.bezierCurveTo(74, -70, 54, -96, 24, -104); p.closePath();   // flag
  const win = new Path2D(); win.ellipse(-44, 28, 14, 8, -.4, 0, Math.PI * 2);
  return { body: p, win, ex: -60, ey: 40 };
})();
function placed(path, x, y, s) { const q = new Path2D(); q.addPath(path, new DOMMatrix([s, 0, 0, s, x, y])); return q; }
function crystal(p, x, y, L, rot, th) {   // six-armed ice crystal: three bars + side branches
  for (let i = 0; i < 3; i++) { const an = rot + i * Math.PI / 3, c = Math.cos(an), s = Math.sin(an); p.addPath(line(x - c * L, y - s * L, x + c * L, y + s * L, th)); }
  for (let i = 0; i < 6; i++) { const an = rot + i * Math.PI / 3, c = Math.cos(an), s = Math.sin(an), bx = x + c * L * .55, by = y + s * L * .55;
    for (const sg of [-1, 1]) { const b2 = an + sg * Math.PI / 3; p.addPath(line(bx, by, bx + Math.cos(b2) * L * .32, by + Math.sin(b2) * L * .32, th * .8)); } }
}
function person(p, x, y, k = 1) { p.addPath(circlePath(x, y - 17 * k, 12 * k)); const b = new Path2D(); b.moveTo(x - 22 * k, y + 24 * k); b.quadraticCurveTo(x - 22 * k, y, x, y); b.quadraticCurveTo(x + 22 * k, y, x + 22 * k, y + 24 * k); b.closePath(); p.addPath(b); }
function dialFace(cx, cy, r) {   // half dial: face, rim, ticks (shared by the dry and humid posters: same geometry, new inks)
  const face = new Path2D(); face.moveTo(cx - r, cy); face.arc(cx, cy, r, Math.PI, 0); face.closePath();
  const rim = new Path2D(); rim.moveTo(cx - r - 14, cy); rim.arc(cx, cy, r + 14, Math.PI, 0); rim.lineTo(cx + r, cy); rim.arc(cx, cy, r, 0, Math.PI, true); rim.closePath(); rim.addPath(rectPath(cx - r - 14, cy, 2 * r + 28, 16));
  const ticks = new Path2D(); for (let i = 0; i <= 8; i++) { const an = Math.PI + i * Math.PI / 8, c = Math.cos(an), s = Math.sin(an); ticks.addPath(line(cx + c * r * .8, cy + s * r * .8, cx + c * r * .96, cy + s * r * .96, i % 4 ? 5 : 9)); }
  ticks.addPath(circlePath(cx, cy, 14));
  return { face, rim, ticks };
}
function lowSky(y0) { const p = rectPath(-60, y0, PW + 120, 1300 - y0); for (let i = 0; i < 6; i++) p.addPath(rectPath(-60, y0 - (i + 1) * 26, PW + 120, 22 * (1 - (i + .5) / 6) * .95 + 1.5)); return p; }
function hillsPath(y0, amp, seed) { const pts = [[-60, 1300], [-60, y0]]; for (let x = -60; x <= PW + 60; x += 20) pts.push([x, y0 - amp * Math.abs(Math.sin(x * .004 + seed)) - amp * .4 * Math.abs(Math.sin(x * .013 + seed * 2))]); pts.push([PW + 60, 1300]); return polyPath(pts); }
// ------------------------------------------------------------------ four posters
const SEED = 11;
const COCH = { x: 330, y: 700 }, ROW = { x0: 560, x1: 900, y: 930 }, DB = { x: 330, y: 820, r: 150 }, CLOCK = { x: 760, y: 760, r: 110 };
function spiralPath(cx, cy, r0, turns, th) { const up = [], dn = []; for (let i = 0; i <= 160; i++) { const u = i / 160, an = u * turns * Math.PI * 2, r = r0 * (1 - .82 * u), w = th * (1 - .6 * u); up.push([cx + Math.cos(an) * (r + w / 2), cy + Math.sin(an) * (r + w / 2)]); dn.push([cx + Math.cos(an) * (r - w / 2), cy + Math.sin(an) * (r - w / 2)]); } return polyPath(up.concat(dn.reverse())); }
function speakerStack(x, y, w, h) { const box = rectPath(x, y, w, h), cones = new Path2D(); const n = Math.floor(h / w); for (let i = 0; i < n; i++) { cones.addPath(ringPath(x + w / 2, y + w * (i + .5), w * .3, w * .4)); cones.addPath(circlePath(x + w / 2, y + w * (i + .5), w * .1)); } return { box, cones }; }
function bird(x, y, k) { const p = new Path2D(); p.ellipse(x, y, 60 * k, 34 * k, -.1, 0, Math.PI * 2); p.addPath(circlePath(x + 56 * k, y - 30 * k, 24 * k)); p.addPath(polyPath([[x + 78 * k, y - 34 * k], [x + 110 * k, y - 26 * k], [x + 78 * k, y - 20 * k]])); p.addPath(polyPath([[x - 50 * k, y - 6 * k], [x - 110 * k, y - 30 * k], [x - 96 * k, y + 6 * k]])); p.addPath(rectPath(x - 4 * k, y + 30 * k, 6 * k, 40 * k)); p.addPath(rectPath(x + 14 * k, y + 30 * k, 6 * k, 40 * k)); return p; }
function frog(x, y, k) { const p = new Path2D(); p.ellipse(x, y, 80 * k, 50 * k, 0, 0, Math.PI * 2); p.addPath(circlePath(x - 40 * k, y - 50 * k, 22 * k)); p.addPath(circlePath(x + 40 * k, y - 50 * k, 22 * k)); p.addPath(polyPath([[x - 80 * k, y + 20 * k], [x - 120 * k, y + 60 * k], [x - 60 * k, y + 50 * k]])); p.addPath(polyPath([[x + 80 * k, y + 20 * k], [x + 120 * k, y + 60 * k], [x + 60 * k, y + 50 * k]])); return p; }
function ear(x, y, k) { const p = new Path2D(); p.moveTo(x, y - 110 * k); p.bezierCurveTo(x + 90 * k, y - 120 * k, x + 100 * k, y + 10 * k, x + 40 * k, y + 50 * k); p.bezierCurveTo(x + 10 * k, y + 80 * k, x + 20 * k, y + 120 * k, x - 20 * k, y + 120 * k); p.bezierCurveTo(x - 60 * k, y + 120 * k, x - 60 * k, y + 60 * k, x - 50 * k, y); p.bezierCurveTo(x - 46 * k, y - 70 * k, x - 30 * k, y - 106 * k, x, y - 110 * k); p.closePath(); return p; }
function earIn(x, y, k) {   // the ear's inner fold (helix rim + the opening), printed in a second ink
  const p = new Path2D(), o = new Path2D(); o.arc(x + 4 * k, y - 20 * k, 62 * k, -2.4, 1.1); o.arc(x + 4 * k, y - 20 * k, 46 * k, 1.1, -2.4, true); o.closePath(); p.addPath(o); p.addPath(circlePath(x + 2 * k, y + 10 * k, 16 * k)); return p; }
function scene1() {   // HAIR CELLS: peach night, a big cochlea spiral, a row of hair cells standing in a line
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 420); top.addPath(bandSteps(-60, PW + 120, 360, 520, 6, 10));
  const coch = spiralPath(COCH.x, COCH.y, 230, 2.6, 70), cochRim = spiralPath(COCH.x, COCH.y, 230, 2.6, 92);
  const base = rectPath(-60, 1010, PW + 120, 400);
  const sockets = new Path2D(); for (let i = 0; i < 6; i++) sockets.addPath(rectPath(ROW.x0 + i * 62 - 18, ROW.y, 36, 70));
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'mid', path: halftone(-20, PW + 20, 420, 560, 24, 8, false), sub: 0 }] },
    { id: 'coch', parts: [{ ink: 'far', path: cochRim, sub: 0 }, { ink: 'mid', path: coch, sub: 1 }] },
    { id: 'base', parts: [{ ink: 'near', path: base, sub: 0 }, { ink: 'far', path: sockets, sub: 1 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit('HAIR CELLS', 1110, 190), sub: 0 }] },
  ] };
}
function scene2() {   // 94-110 dB: a stage at night, speaker stacks, the crowd, a decibel dial
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 380); top.addPath(bandSteps(-60, PW + 120, 320, 500, 6, 10));
  const L = speakerStack(40, 380, 150, 600), Rr = speakerStack(PW - 190, 380, 150, 600);
  const spk = new Path2D(); spk.addPath(L.box); spk.addPath(Rr.box); const cones = new Path2D(); cones.addPath(L.cones); cones.addPath(Rr.cones);
  const crowd = new Path2D(); for (let i = 0; i < 14; i++) person(crowd, 40 + i * 70, 1070 + (i % 2) * 18, 1.5);
  const g = dialFace(DB.x + 170, DB.y - 80, DB.r);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'spk', parts: [{ ink: 'near', path: spk, sub: 0 }, { ink: 'mid', path: cones, sub: 1 }] },
    { id: 'gauge', parts: [{ ink: 'glow', path: g.face, sub: 0 }, { ink: 'near', path: g.rim, sub: 0 }, { ink: 'near', path: g.ticks, sub: 1 }, { ink: 'far', paint: label('60', DB.x + 170 - 110, DB.y - 110, 28), sub: 1 }, { ink: 'red', paint: label('110', DB.x + 170 + 110, DB.y - 110, 28), sub: 1 }] },
    { id: 'crowd', parts: [{ ink: 'far', path: crowd, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit('94–110 dB', 1110, 200), sub: 0 }] },
  ] };
}
function scene3() {   // EEEEEE: amber, the hair cells bent flat, ringing waves, a clock for "a day or two"
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 420); top.addPath(bandSteps(-60, PW + 120, 360, 540, 6, 10));
  const base = rectPath(-60, 1010, PW + 120, 400);
  const cface = circlePath(CLOCK.x, CLOCK.y, CLOCK.r), crim = ringPath(CLOCK.x, CLOCK.y, CLOCK.r, CLOCK.r + 14);
  const cticks = new Path2D(); for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6, c = Math.cos(an), s = Math.sin(an); cticks.addPath(line(CLOCK.x + c * CLOCK.r * .78, CLOCK.y + s * CLOCK.r * .78, CLOCK.x + c * CLOCK.r * .93, CLOCK.y + s * CLOCK.r * .93, i % 3 ? 5 : 9)); }
  const e = ear(260, 640, 1.6);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'ear', parts: [{ ink: 'far', path: e, sub: 0 }, { ink: 'mid', path: earIn(260, 640, 1.6), sub: 1 }] },
    { id: 'clock', parts: [{ ink: 'glow', path: cface, sub: 0 }, { ink: 'near', path: crim, sub: 0 }, { ink: 'near', path: cticks, sub: 1 }, { ink: 'far', paint: label('1–2 DAYS', CLOCK.x, CLOCK.y + CLOCK.r + 60, 34), sub: 1 }] },
    { id: 'base', parts: [{ ink: 'near', path: base, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit('EEEEEEEE', 1110, 200), sub: 0 }] },
  ] };
}
function scene4() {   // NO REGROW: mint, a bird and a frog regrow theirs, the human ear doesn't; the 85 dB line
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 360); top.addPath(bandSteps(-60, PW + 120, 300, 460, 6, 10));
  const base = rectPath(-60, 1010, PW + 120, 400);
  const animals = new Path2D(); animals.addPath(bird(230, 560, 1.1)); animals.addPath(frog(230, 840, 1.0));
  const e = ear(700, 690, 1.5);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'animals', parts: [{ ink: 'far', path: animals, sub: 0 }] },
    { id: 'ear', parts: [{ ink: 'near', path: e, sub: 0 }, { ink: 'mid', path: earIn(700, 690, 1.5), sub: 1 }] },
    { id: 'base', parts: [{ ink: 'far', path: base, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit("DON'T GROW BACK", 1110, 170), sub: 0 }] },
  ] };
}
const mkP = (sc, name, idx, items, n = 3) => ({ sc, trail: { name }, items, idx, n, paper: PAPER, park: 'How it really works', trailPts: [], trailLen: 0, seed: idx * 13 + 5 });
const POS = [
  mkP(scene1(), 'Inside the cochlea', 0, [{ key: 'a', label: 'WHERE', value: 'COCHLEA' }, { key: 'b', label: 'SOUND', value: 'SWAY' }, { key: 'c', label: 'SIGNAL', value: 'BRAIN' }]),
  mkP(scene2(), 'A loud night', 1, [{ key: 'a', label: 'CONCERT', value: '94–110 dB' }, { key: 'b', label: 'SIREN', value: '110+ dB' }, { key: 'c', label: '+10 dB', value: '×10' }]),
  mkP(scene3(), 'After the show', 2, [{ key: 'a', label: 'RINGING', value: 'TINNITUS' }, { key: 'b', label: 'CELLS', value: 'STRAINED' }, { key: 'c', label: 'MUFFLED', value: '1–2 DAYS' }]),
  mkP(scene4(), 'The long run', 3, [{ key: 'a', label: 'BIRDS', value: 'REGROW' }, { key: 'b', label: 'HUMANS', value: 'NO' }, { key: 'c', label: 'RISK', value: '85+ dB' }]),
];
const PALS = [PAL.cells, PAL.loud, PAL.ring, PAL.regrow];

// ------------------------------------------------------------------ timeline (all anchored to the voice; phrase numbers by name)
const Q = { hook: 0, but: 1, coch: 2, sway: 3, conc: 4, siren: 5, katch: 6, dmg: 7, tinn: 8, muff: 9, scary: 10, birds: 11, add: 12, payoff: 13, plugs: 14, ask: 15, follow: 16 };
const BAN = [-900, -220], PO = [-500, 560], SPEC = [-700, 300, 1400, 210], BCY = 330;
const S1 = { t0: 0, t1: a(Q.coch) - .55 }, S2 = { t0: a(Q.coch) - .55, t1: a(Q.conc) - .1 }, S3 = { t0: a(Q.conc) - .1, t1: a(Q.dmg) - .1 }, S4 = { t0: a(Q.dmg) - .1, t1: a(Q.scary) - .1 }, S5 = { t0: a(Q.scary) - .1, t1: a(Q.payoff) - .1 }, S6 = { t0: a(Q.payoff) - .1, t1: a(Q.follow) - .15 };
const PR = [
  { sky: [a(Q.coch) + .05, .45], top: [a(Q.coch) + .35, .45], halftone: [a(Q.coch) + .65, .4], coch: [a(Q.coch) + .9, .5], base: [a(Q.coch) + 1.6, .45], head: [a(Q.sway) + 2.0, .5] },
  { sky: [a(Q.conc) + .05, .4], top: [a(Q.conc) + .35, .45], spk: [a(Q.conc) + .7, .45], gauge: [a(Q.conc) + 1.1, .5], crowd: [a(Q.conc) + 1.5, .4], head: [a(Q.siren) + .3, .5] },
  { sky: [a(Q.dmg) + .1, .4], top: [a(Q.dmg) + .4, .45], ear: [a(Q.dmg) + .7, .45], base: [a(Q.dmg) + 1.0, .4], head: [a(Q.tinn) + .4, .5], clock: [a(Q.muff) + .1, .5] },
  { sky: [a(Q.scary) + .1, .4], top: [a(Q.scary) + .4, .45], ear: [a(Q.scary) + .7, .45], base: [a(Q.scary) + 1.0, .4], animals: [a(Q.birds) + .1, .5], head: [a(Q.birds) + 1.6, .5] },
];
const ITEMS = [[a(Q.coch) + 2.4, a(Q.sway) + .6, a(Q.sway) + 2.2], [a(Q.conc) + 2.0, a(Q.siren) + .6, a(Q.katch) + 3.0], [a(Q.tinn) + 1.0, a(Q.dmg) + 2.6, a(Q.muff) + 1.0], [a(Q.birds) + .3, a(Q.birds) + 2.0, a(Q.add) + 3.4]];
const BAND = [a(Q.coch) + .9, a(Q.conc) + .5, a(Q.dmg) + .3, a(Q.scary) + .4], NAME = [a(Q.coch) + 1.3, a(Q.conc) + .9, a(Q.dmg) + .7, a(Q.scary) + .7];
const INKOF = { sky: 'sky1', top: 'sky2', halftone: 'mid', coch: 'far', base: 'near', spk: 'near', gauge: 'near', crowd: 'far', ear: 'far', clock: 'near', animals: 'far', head: 'glow' };
const SQUEEGEE_IDS = [['sky', 'top', 'coch', 'base'], ['sky', 'top', 'spk', 'gauge', 'crowd'], ['sky', 'top', 'ear', 'clock'], ['sky', 'top', 'ear', 'animals']];
// ------------------------------------------------------------------ drawing helpers
function cam(cx, cy, z, rot = 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2, H / 2); if (rot) ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); }
let TB = null;
function buildTable() {
  const r = mulberry(21), planks = [], stains = [], tapes = [];
  const x0 = -2200, x1 = 2200, y0 = -1400, y1 = 2800, ph = 170, tones = ['#6E5039', '#664A34', '#73553C', '#6A4C35', '#5F4430'];
  for (let y = y0, k = 0; y < y1; y += ph, k++) {
    const grain = new Path2D(), knots = new Path2D();
    for (let g = 0; g < 7; g++) { const gy = y + 14 + g * 22 + r() * 8, amp = 3 + r() * 5, f = .002 + r() * .003, ph0 = r() * 6; grain.moveTo(x0, gy); for (let x = x0; x <= x1; x += 40) grain.lineTo(x, gy + amp * Math.sin(x * f + ph0) + 2 * Math.sin(x * f * 3.7)); }
    for (let q = 0; q < 3; q++) knots.ellipse(x0 + r() * (x1 - x0), y + 30 + r() * (ph - 60), 22 + r() * 18, 7 + r() * 5, 0, 0, 7);
    planks.push({ y, color: tones[k % tones.length], grain, knots });
  }
  const cols = ['#4F9FD0', '#E8553D', '#F2B134', '#2F6E8E', '#7C3E5F', '#D8613F'];
  const avoid = (x, y) => (x > PO[0] - 80 && x < PO[0] + PW + 80 && y > PO[1] - 80 && y < PO[1] + PH + 80) || (x > BAN[0] - 80 && x < BAN[0] + BW + 80 && y > BAN[1] - 80 && y < SPEC[1] + SPEC[3] + 80);
  for (let i = 0; i < 14; i++) {
    let x, y, n = 0; do { x = x0 + 300 + r() * (x1 - x0 - 600); y = y0 + 200 + r() * (y1 - y0 - 400); n++; } while (avoid(x, y) && n < 40);
    const R = 50 + r() * 70, pts = [], m = 11;
    for (let j = 0; j < m; j++) { const an = j / m * 6.283, rr = R * (.65 + .5 * r()) * (j % 3 === 0 ? 1.3 : 1); pts.push([x + Math.cos(an) * rr * 1.25, y + Math.sin(an) * rr * .8]); }
    const path = new Path2D(); pts.forEach((q, j) => { const nq = pts[(j + 1) % m]; if (!j) path.moveTo((q[0] + nq[0]) / 2, (q[1] + nq[1]) / 2); else path.quadraticCurveTo(q[0], q[1], (q[0] + nq[0]) / 2, (q[1] + nq[1]) / 2); });
    path.closePath(); stains.push({ path, col: mix(cols[i % cols.length], TABLE, .5), a: .7 });
  }
  for (let i = 0; i < 9; i++) { let x, y, n = 0; do { x = x0 + 300 + r() * (x1 - x0 - 600); y = y0 + 200 + r() * (y1 - y0 - 400); n++; } while (avoid(x, y) && n < 40); tapes.push({ x, y, w: 60 + r() * 120, h: 22 + r() * 8, a: (r() - .5) * .6, torn: r() < .6, dirty: r() < .5 }); }
  return { planks, stains, tapes, x0, x1, ph };
}
function table() {
  if (!TB) TB = buildTable();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = TABLE; ctx.fillRect(0, 0, W, H); ctx.restore();
  for (const p of TB.planks) {
    ctx.fillStyle = p.color; ctx.fillRect(TB.x0, p.y, TB.x1 - TB.x0, TB.ph);
    ctx.fillStyle = 'rgba(35,22,12,.55)'; ctx.fillRect(TB.x0, p.y, TB.x1 - TB.x0, 5); ctx.fillStyle = 'rgba(255,230,190,.07)'; ctx.fillRect(TB.x0, p.y + 5, TB.x1 - TB.x0, 3);
    ctx.save(); ctx.strokeStyle = 'rgba(40,24,12,.22)'; ctx.lineWidth = 2; ctx.stroke(p.grain); ctx.fillStyle = 'rgba(40,24,12,.25)'; ctx.fill(p.knots); ctx.restore();
  }
  for (const s0 of TB.stains) { ctx.save(); ctx.globalAlpha = s0.a; ctx.fillStyle = s0.col; ctx.fill(s0.path); ctx.globalAlpha = s0.a * .5; ctx.translate(-2, -2); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(s0.path); ctx.restore(); }
  for (const tp of TB.tapes) {
    ctx.save(); ctx.translate(tp.x, tp.y); ctx.rotate(tp.a); ctx.fillStyle = tp.dirty ? 'rgba(205,184,140,.75)' : 'rgba(222,204,160,.8)';
    ctx.beginPath(); ctx.moveTo(-tp.w / 2, -tp.h / 2); ctx.lineTo(tp.w / 2, -tp.h / 2);
    if (tp.torn) { for (let k = 0; k <= 5; k++) ctx.lineTo(tp.w / 2 + (k % 2 ? -6 : 3), -tp.h / 2 + tp.h * k / 5); } else ctx.lineTo(tp.w / 2, tp.h / 2);
    ctx.lineTo(-tp.w / 2, tp.h / 2); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
function regTape(x, y, w, h) {
  ctx.fillStyle = '#D9C38A'; const L = 60, th = 16;
  for (const [px, py, sx, sy] of [[x, y, -1, -1], [x + w, y, 1, -1], [x, y + h, -1, 1], [x + w, y + h, 1, 1]]) { ctx.fillRect(Math.min(px, px + sx * L), py + (sy < 0 ? -th : 0) - sy * 2, L, th); ctx.fillRect(px + (sx < 0 ? -th : 0) - sx * 2, Math.min(py, py + sy * L), th, L); }
}
function sheetShadow(x, y, w, h, al = .3) { ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = '#000'; ctx.fillRect(x + 8, y + 12, w, h); ctx.restore(); }

// ------------------------------------------------------------------ captions: a printed strip (the poster style's subtitle rule)
function wrap(text, maxW) {
  const parts = text.split(/(\*\*)/); let bold = false; const words = [];
  parts.forEach(p => { if (p === '**') { bold = !bold; return; } p.split(/(\s+)/).forEach(w => { if (w && !/^\s+$/.test(w)) words.push({ w, b: bold }); }); });
  const lines = []; let cur = [], cw = 0;
  for (const wd of words) { const m = ctx.measureText(wd.w + ' ').width; if (cw + m > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; } cur.push(wd); cw += m; }
  if (cur.length) lines.push(cur); return lines;
}
function caption(t, pal, stripP) {
  const SX = 120, SY = 1170, SW = 840, SH = 240;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (stripP > 0) {
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.fillRect(SX + 8, SY + 12, SW, SH); ctx.restore();
    ink(ctx, { path: rectPath(SX, SY, SW, SH) }, { color: pal.near, reg: [1, .5], clip: stripP < 1 ? wipeRegion([SX, SY, SW, SH], 'right', stripP, 4, 40) : null, sheen: 1 });
  }
  let i = 0; for (let k = 0; k < TLp.length; k++) if (t >= TLp[k].start - .05) i = k;
  if (stripP < 1 || i === TLp.length - 1) return;
  const tp = i === 0 ? 1 : seg(t, TLp[i].start - .05, TLp[i].start + .3); if (tp <= 0) return;
  ctx.save(); ctx.font = '700 48px Outfit'; ctx.letterSpacing = '0px';
  const lines = wrap(TLp[i].cap, 700), lh = 60, y0 = SY + SH / 2 - (lines.length - 1) * lh / 2 + 17;
  const c1 = pickInk(pal.near, ['#FFFFFF', pal.sky1], 4.5), c2 = pickInk(pal.near, [pal.sun, '#F2B134', '#FFD166'], 4.5);
  const clip = tp < 1 ? wipeRegion([SX, SY, SW, SH], 'right', tp, 7, 30) : null;
  [[c1, false], [c2, true]].forEach(([col, bold]) => {
    ink(ctx, { paint: c => {
      c.font = '700 48px Outfit'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      lines.forEach((ln, li) => { const tw = ln.reduce((s, wd) => s + c.measureText(wd.w + ' ').width, 0); let x = SX + SW / 2 - tw / 2; ln.forEach(wd => { const w = c.measureText(wd.w + ' ').width; if (wd.b === bold) c.fillText(wd.w, x, y0 + li * lh); x += w; }); });
    } }, { color: col, reg: [1, .5], clip });
  });
  ctx.restore();
}
// ------------------------------------------------------------------ the moving layer on each poster (printed inks, drawn per frame)
function addC(p, x, y, r) { p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); }
function addE(p, x, y, rx, ry) { p.moveTo(x + rx, y); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
function hairRow(x0, y, n, gap, bend, t, sway = 1) {   // hair cells: a body + a bundle of three stalks, swaying (bend 0) or knocked flat (bend 1)
  const p = new Path2D();
  for (let i = 0; i < n; i++) { const x = x0 + i * gap, sw = sway * .28 * Math.sin(t * 5 + i * .8), an = -Math.PI / 2 + sw + bend * 1.25 * (i % 2 ? 1 : .85);
    p.addPath(rectPath(x - 14, y - 20, 28, 40)); for (let j = -1; j <= 1; j++) { const bx = x + j * 8, L = 90 - Math.abs(j) * 14; p.addPath(line(bx, y - 20, bx + Math.cos(an) * L, y - 20 + Math.sin(an) * L, 7)); } }
  return p;
}
function waveArcs(cx, cy, n, r0, gap, phase, span = .7, th = 10) { const p = new Path2D(); for (let i = 0; i < n; i++) { const r = r0 + ((i * gap + phase) % (n * gap)); const q = new Path2D(); q.arc(cx, cy, r + th / 2, -span, span); q.arc(cx, cy, r - th / 2, span, -span, true); q.closePath(); p.addPath(q); } return p; }
function overlay(k, t, pal, onWall) {
  const done = id => onWall || (PR[k][id] && t >= PR[k][id][0] + PR[k][id][1]);
  ctx.save(); ctx.beginPath(); ctx.rect(ARTV[0], ARTV[1], ARTV[2], ARTV[3]); ctx.clip(); ctx.translate(0, -SHIFT);
  if (k === 0 && done('base')) {   // the hair cells sway; each sway sends a signal dot up toward the brain
    ink(ctx, { path: hairRow(ROW.x0, ROW.y, 6, 62, 0, t) }, { color: pal.glow, reg: [1, -.5], sheen: 1 });
    if (onWall || t > a(Q.sway) + .5) { const q = new Path2D(); for (let i = 0; i < 6; i++) { const u = ((t * .7 + i / 6) % 1); addC(q, ROW.x0 + 150 + Math.sin(u * 6) * 20, ROW.y - 140 - u * 420, 10); } ink(ctx, { path: q }, { color: pal.sun, reg: [1, .5], sheen: 1 }); }
  }
  if (k === 0 && done('coch')) { const q = waveArcs(COCH.x - 300, COCH.y, 4, 60, 60, (t * 90) % 240, .5, 8); ink(ctx, { path: q }, { color: pal.glow, reg: [1, -.5], sheen: 1 }); }
  if (k === 1) {
    if (done('spk')) { const pulse = 1 + .08 * Math.abs(Math.sin(t * 9)); const q = new Path2D(); [[115, 455], [115, 605], [115, 755], [115, 905], [PW - 115, 455], [PW - 115, 605], [PW - 115, 755], [PW - 115, 905]].forEach(([x, y]) => addC(q, x, y, 30 * pulse)); ink(ctx, { path: q }, { color: pal.red, reg: [1, .5], sheen: 1 });
      ink(ctx, { path: waveArcs(190, 680, 4, 40, 50, (t * 120) % 200, .6, 8) }, { color: pal.glow, reg: [1, -.5], sheen: 1 }); }
    if (done('gauge')) { const g = onWall ? 1 : ss(seg(t, a(Q.conc) + 1.6, a(Q.conc) + 3.0)), an = lerp(-Math.PI + .2, -.25, g) + .05 * Math.sin(t * 11), cx = DB.x + 170, cy = DB.y - 80;
      const q = line(cx, cy, cx + Math.cos(an) * DB.r * .86, cy + Math.sin(an) * DB.r * .86, 10); q.addPath(circlePath(cx, cy, 16)); ink(ctx, { path: q }, { color: pal.red, reg: [1, .5], sheen: 1 }); }
    if (onWall || t > a(Q.katch) + 1.0) { const q = new Path2D(); [1, 10, 100].forEach((v, i) => { const hgt = [16, 60, 180][i] * (onWall ? 1 : ss(seg(t, a(Q.katch) + 1.0 + i * .5, a(Q.katch) + 1.5 + i * .5))); q.addPath(rectPath(380 + i * 90, 1000 - hgt, 60, hgt)); }); ink(ctx, { path: q }, { color: pal.sun, reg: [1, .5], sheen: 1 }); }
  }
  if (k === 2) {
    const bend = onWall ? 1 : ss(seg(t, a(Q.dmg) + 1.2, a(Q.dmg) + 2.6)); ink(ctx, { path: hairRow(470, 970, 7, 64, bend, t, 1 - bend * .8) }, { color: pal.glow, reg: [1, -.5], sheen: 1 });
    if (onWall || t > a(Q.tinn) - .2) ink(ctx, { path: waveArcs(330, 600, 5, 160, 46, (t * 160) % 230, .55, 9) }, { color: pal.red, reg: [1, .5], sheen: 1 });
    if (done('clock')) { const spin = onWall ? t * .4 : Math.max(0, t - (a(Q.muff) + .6)), m = -Math.PI / 2 + spin * Math.PI * 2 * .9, h = -Math.PI / 2 + .9 + spin * Math.PI * 2 * .9 / 12;
      const q = line(CLOCK.x, CLOCK.y, CLOCK.x + Math.cos(m) * CLOCK.r * .8, CLOCK.y + Math.sin(m) * CLOCK.r * .8, 9); q.addPath(line(CLOCK.x, CLOCK.y, CLOCK.x + Math.cos(h) * CLOCK.r * .52, CLOCK.y + Math.sin(h) * CLOCK.r * .52, 14)); ink(ctx, { path: q }, { color: pal.near, reg: [1, .5], sheen: 1 }); }
  }
  if (k === 3) {
    if (done('animals')) { const q = new Path2D(); [[230, 560], [230, 840]].forEach(([x, y], i) => { const an0 = t * 2 + i; const arc = new Path2D(); arc.arc(x, y, 150, an0, an0 + 4.4); arc.arc(x, y, 136, an0 + 4.4, an0, true); arc.closePath(); q.addPath(arc); }); ink(ctx, { path: q }, { color: pal.sky2, reg: [1, .5], sheen: 1 }); }
    if (done('ear')) { const kx = onWall ? 1 : ss(seg(t, a(Q.birds) + 2.2, a(Q.birds) + 2.8)); if (kx > 0) { const q = new Path2D(); q.addPath(line(560, 540, 560 + 280 * kx, 540 + 300 * kx, 30)); q.addPath(line(840, 540, 840 - 280 * kx, 540 + 300 * kx, 30)); ink(ctx, { path: q }, { color: pal.red, reg: [1, .5], sheen: 1 }); } }
    if (onWall || t > a(Q.add) + .5) { const q = dashes(40, 990, PW - 40, 990, 8, 30, 18); ink(ctx, { path: q }, { color: pal.red, reg: [1, .5], sheen: 1 }); ink(ctx, { paint: label('85 dB', PW - 140, 970, 40, 'center', 'BigShoulders', 900, 1) }, { color: pal.red }); }
  }
  ctx.restore();
}
function posterOnTable(k, P, st, t) { regTape(PO[0], PO[1], PW, PH); sheetShadow(PO[0], PO[1], PW, PH, .22); ctx.save(); ctx.translate(PO[0], PO[1]); drawPoster(ctx, P, { ...st, finish: false }); overlay(k, t, st.pal, false); inkFinish(ctx, T, 0, 0, PW, PH, .6, 1); ctx.restore(); }
// ------------------------------------------------------------------ sections
const jetX = t => 330 + 430 * t;   // banner units: the hook note crosses the banner's sky band and leaves on the right
function bannerTrail(jx) {   // sound waves rippling out behind the note: nested arcs along the band between the two title lines
  const p = new Path2D(), ex = jx - 70; for (let i = 0; i < 9; i++) { const x = ex - i * 70; if (x < 30) break; if (jx >= 1190 && x > 380 && x < 1420) continue; /* once the title is printed (t >= 2 s, and on the wall), keep the arcs clear of its lettering */ const r = 46 + i * 9, th = 10 - i * .6, q = new Path2D(); q.arc(x, 161, r + th / 2, Math.PI * .65, Math.PI * 1.35); q.arc(x, 161, r - th / 2, Math.PI * 1.35, Math.PI * .65, true); q.closePath(); p.addPath(q); } return p; }
function bannerStage(t) {
  // hook: the camera rides with a big jet across the printed sky band, the trail drawing behind it, then pulls back to the whole banner and the title pulls
  const sky = 1, lift = 1, tt = seg(t, 2.0, 2.35), ff = seg(t, 2.2, 2.5), sqX = BAN[0] + BW;
  const k = eio(seg(t, 1.1, 2.3));
  const down = eio(seg(t, a(Q.but) - .2, a(Q.but) + .6));
  const jw = BAN[0] + Math.min(jetX(t), 1500) - 90, jy = BAN[1] + 205;
  let z = Math.exp(lerp(Math.log(4.0), Math.log(.58), k)), cx = lerp(jw, 0, k), cy = lerp(jy, BCY, k);
  z = lerp(z, .56, down);
  z *= 1 + .02 * ss(seg(t, 2.4, a(Q.coch)));
  cam(cx, cy, z, 0); table();
  const bp = PAL.banner;
  regTape(BAN[0], BAN[1], BW, BH); sheetShadow(BAN[0], BAN[1], BW, BH, .25);
  ctx.save(); ctx.translate(BAN[0], BAN[1]);
  drawBanner(ctx, BANNER_C, { pal: bp, T, sky, title: tt, footer: ff, reg: 1, finish: false });
  // the white trail and its jet, printed with the sky pull (the hook picture), the jet keeps flying across the banner
  { const jx = jetX(t); ctx.save(); ctx.beginPath(); ctx.rect(...BANNER_ART); ctx.clip();
    ink(ctx, { path: bannerTrail(jx) }, { color: bp.glow, reg: [1.4, -.6], sheen: 1 });
    if (jx < BW + 400) { ink(ctx, { path: placed(JET.body, jx, 140, .7) }, { color: bp.near, reg: [.6, .4], sheen: 1 }); ink(ctx, { path: placed(JET.win, jx, 140, .7) }, { color: bp.sky1, reg: [.8, .4] }); }
    ctx.restore(); }
  inkFinish(ctx, T, 0, 0, BW, BH, .6, 1);
  ctx.restore();
  const wet = 0;
  if (sky > 0 && wet > 0) { ctx.save(); ctx.globalAlpha = wet; ctx.beginPath(); ctx.rect(BAN[0] + 14, BAN[1] + 14, Math.max(0, sqX - BAN[0] - 14), BANNER_ART[3]); ctx.clip(); const g = ctx.createLinearGradient(sqX - 420, 0, sqX, 0); g.addColorStop(0, 'rgba(255,250,235,0)'); g.addColorStop(1, 'rgba(255,250,235,.3)'); ctx.fillStyle = g; ctx.fillRect(sqX - 420, BAN[1], 420, BH); ctx.restore(); }
  const box = [BAN[0] - 90, BAN[1] - 90, BW + 180, BH + 180];
  const emu = new Path2D(); emu.rect(box[0], box[1], box[2], box[3]); emu.rect(BAN[0] + 14, BAN[1] + 14, BW - 28, BANNER_ART[3]);
  if (lift < 1) screenFrame(ctx, box, { lift: ss(seg(t, 1.0, 1.45)), frame: 40, mesh: 'rgba(236,214,128,.03)', emulsion: emu, emulsionAlpha: .55, meshStep: 3.4, meshLine: 'rgba(70,60,30,.16)' });
  if (sky < 1) {
    const upx = ss(seg(t, 1.0, 1.35)), x = sqX + 14 + upx * 120, y0 = BAN[1] - 38, y1 = BAN[1] + BH + 38, tn = yy => (yy - y0) / (y1 - y0), BB = BANNER_BANDS;
    ctx.save(); ctx.globalAlpha = 1 - upx;
    squeegee(ctx, [x, y0], [x, y1], [1, 0], { beads: [['sky2', bp.sky2], ['sky1', bp.sky1], ['far', bp.far]].map(([kk, c]) => ({ t0: tn(BAN[1] + BB[kk][0] + 16), t1: tn(BAN[1] + BB[kk][1]), color: c })), seed: 3, scale: 1.25, roll: sqX / 30 });
    ctx.restore();
  }
  if (tt > 0 && tt < 1) { const x = wipeFront([BAN[0], BAN[1] + 20, BW, 330], 'right', tt, 40) + 12; squeegee(ctx, [x, BAN[1] - 38], [x, BAN[1] + BH + 38], [1, 0], { color: bp.near, seed: 5, roll: x / 30, scale: 1.25 }); }
  // the but-turn card: a split-fountain pull of night colours with a row of swaying hair cells, "NOT STUCK SOUND. TIRED HAIR CELLS."
  const sp = seg(t, a(Q.but) - .1, a(Q.but) + .9), lb = seg(t, a(Q.but) + .9, a(Q.but) + 1.3), WB = ['#BFDDF0', '#7FB6D9', '#3A6FA0', '#24507A'];
  if (t > a(Q.but) - .4) {
    regTape(SPEC[0], SPEC[1], SPEC[2], SPEC[3]); sheetShadow(SPEC[0], SPEC[1], SPEC[2], SPEC[3], .25);
    ctx.save(); ctx.translate(SPEC[0], SPEC[1]); paperSheet(ctx, T, 0, 0, SPEC[2], SPEC[3]);
    const cl = sp < 1 ? wipeRegion([0, 0, SPEC[2], 160], 'right', sp, 6, 40) : null;
    WB.forEach((c, i) => ink(ctx, { path: rectPath(20, 30 + i * 32, SPEC[2] - 40, 30) }, { color: c, reg: [(i % 2) * 1.4 - .7, .5], clip: cl, sheen: 1 }));
    const cr = new Path2D(); for (let i = 0; i < 16; i++) { const x = 60 + i * 82, an = -Math.PI / 2 + .35 * Math.sin(t * 5 + i * .7); cr.addPath(rectPath(x - 10, 116, 20, 26)); for (let j = -1; j <= 1; j++) cr.addPath(line(x + j * 6, 116, x + j * 6 + Math.cos(an) * 66, 116 + Math.sin(an) * 66, 5)); }
    ink(ctx, { path: cr }, { color: '#FFFFFF', reg: [1, -.5], clip: cl, sheen: 1 });
    ink(ctx, { path: rectPath(20, 160, SPEC[2] - 40, 40) }, { color: bp.near, clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
    ink(ctx, { paint: c => { c.font = '600 28px Outfit'; c.letterSpacing = '9px'; c.textAlign = 'center'; c.fillText('NOT STUCK SOUND. TIRED HAIR CELLS.', SPEC[2] / 2, 189); } }, { color: pickInk(bp.near, ['#FFFFFF', bp.sky1], 4.5), clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
    inkFinish(ctx, T, 0, 0, SPEC[2], SPEC[3], .6, 1);
    ctx.restore();
    if (sp > 0 && sp < 1) { const x = SPEC[0] + wipeFront([0, 0, SPEC[2], 160], 'right', sp, 40) + 10; squeegee(ctx, [x, SPEC[1] + 6], [x, SPEC[1] + 170], [1, 0], { beads: WB.map((c, i) => ({ t0: (24 + i * 32) / 164, t1: Math.min(1, (24 + i * 32 + 30) / 164), color: c })), scale: 1.1, seed: 6, roll: x / 30 }); }
  }
  caption(t, bp, 1);
}
function posterStage(k, t, S) {
  const P = POS[k], pl = PALS[k], PRk = PR[k];
  const tilt = eio(seg(t, S.t0, S.t0 + .85));
  const z0 = .62, cy0 = PO[1] + 750 + 260 / z0;
  let cx = 0, cy = k === 0 ? lerp(BCY, cy0, tilt) : cy0, z = k === 0 ? lerp(.56, z0, tilt) : z0;
  z *= 1 + .02 * seg(t, S.t0, S.t1);
  cam(cx, cy, z); table();
  if (k === 0 && tilt < 1) { ctx.save(); ctx.translate(BAN[0], BAN[1]); sheetShadow(0, 0, BW, BH, .25); drawBanner(ctx, BANNER_C, { pal: PAL.banner, T }); ctx.restore(); }
  const gp = id => { const q = PRk[id]; return q ? seg(t, q[0], q[0] + q[1]) : 0; };
  const st = { pal: pl, T, prog: gp, band: seg(t, BAND[k], BAND[k] + .3), name: seg(t, NAME[k], NAME[k] + .3), header: seg(t, S.t0 + 1.2, S.t0 + 1.7), trail: 0, items: ITEMS[k].map(x => seg(t, x, x + .18)) };
  posterOnTable(k, P, st, t);
  { const q = PRk.sky, lift = seg(t, q[0] + 1.0, q[0] + 1.45), box = [PO[0] - 70, PO[1] - 70, PW + 140, PH + 140];
    if (t > S.t0 + .3 && lift < 1) screenFrame(ctx, box, { lift: ss(lift), frame: 44 }); }
  SQUEEGEE_IDS[k].forEach(id => {
    const q = PRk[id]; if (!q) return; const p = seg(t, q[0], q[0] + q[1]);
    if (p > 0 && p < 1) { const y = PO[1] + wipeFront([0, ART[1] - 60, PW, ART[3] + 120], 'down', clamp(p * 1.35), 30) - 60 + 14; squeegee(ctx, [PO[0] - 30, y], [PO[0] + PW + 30, y], [0, 1], { color: pl[INKOF[id]] || pl.near, seed: q[0] * 10, roll: y / 30, scale: 1.3 }); }
  });
  caption(t, pl, 1);
}
function cloudBand(x1, band, color) {   // a cloud-edged band of ink between the outgoing and incoming stage
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const x0 = x1 - band, p = new Path2D(); p.moveTo(x0, -40);
  for (let y = -40; y <= H + 40; y += 120) p.arc(x0 + 10, y + 60, 60, -Math.PI / 2, Math.PI / 2, true);
  p.lineTo(x1, H + 40); for (let y = H + 40; y >= -40; y -= 120) p.arc(x1 - 10, y - 60, 60, Math.PI / 2, -Math.PI / 2, true);
  p.closePath(); ctx.fillStyle = color; ctx.fill(p); ctx.restore();
}
// wall lockup (the three posters hung under the banner)
function wallLayout() {
  const gap = 24, x0 = 60, pw = (900 - x0 - 2 * gap) / 3, ph = pw * 1.5, bw = 940, bh = BH * bw / BW, top = 330;   // posters stay left of x 900 (right UI column)
  return { pw, ph, s: pw / PW, bs: bw / BW, bw, bh, banner: [(W - bw) / 2, top], posters: [0, 1, 2].map(i => [x0 + i * (pw + gap), top + bh + 40]) };
}
function wall(t, hi) {
  const L = wallLayout(), wp = { board: '#5E4432', groove: '#3F2C21', rail: '#8A6547' };
  ctx.fillStyle = wp.board; ctx.fillRect(-2000, -2000, 6000, 6000);
  ctx.fillStyle = wp.groove; for (let x = -1200; x < 3200; x += 96) ctx.fillRect(x, -2000, 5, 6000);
  ctx.fillStyle = mix(wp.board, '#ffffff', .07); for (let x = -1200; x < 3200; x += 96) ctx.fillRect(x + 5, -2000, 3, 6000);
  const [bx, by] = L.banner;
  ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#1a120c'; ctx.fillRect(bx + 10, by + 12, L.bw, L.bh); ctx.restore();
  ctx.save(); ctx.translate(bx, by); ctx.scale(L.bs, L.bs); drawBanner(ctx, BANNER_C, { pal: PAL.banner, T, finish: false });
  ctx.save(); ctx.beginPath(); ctx.rect(...BANNER_ART); ctx.clip();
  ink(ctx, { path: bannerTrail(jetX(t)) }, { color: '#FFFFFF', reg: [1.4, -.6], sheen: 1 }); ctx.restore();
  inkFinish(ctx, T, 0, 0, BW, BH, .6, 1); ctx.restore();
  [0, 1, 2].forEach(i => {
    const P = POS[i], [x, y] = L.posters[i], g = 1 + .05 * hi[i];
    ctx.save(); ctx.translate(x + L.pw / 2, y + L.ph / 2); ctx.scale(g, g); ctx.translate(-L.pw / 2, -L.ph / 2);
    ctx.save(); ctx.globalAlpha = .35 + .1 * hi[i]; ctx.fillStyle = '#1a120c'; ctx.fillRect(12, 14, L.pw, L.ph); ctx.restore();
    ctx.save(); ctx.scale(L.s, L.s); drawPoster(ctx, P, { pal: PALS[i], T, finish: false }); overlay(i, t, PALS[i], true); inkFinish(ctx, T, 0, 0, PW, PH, .6, 1); ctx.restore();
    ctx.fillStyle = '#C9C2B2'; for (const dx of [18, L.pw - 18]) { ctx.beginPath(); ctx.arc(dx, 16, 5, 0, 7); ctx.fill(); }
    ctx.restore();
  });
  return L;
}
function wallStage(t) {
  const L = wallLayout(), k = eio(seg(t, S6.t0 + .3, S6.t0 + 1.9)), [wx, wy] = L.posters[2];
  const from = [wx + L.pw / 2, wy + L.ph * .4, 2.4];
  const cx = lerp(from[0], W / 2, k), cy = lerp(from[1], 800, k), z = Math.exp(lerp(Math.log(from[2]), 0, k));
  cam(cx, cy, z * (1 + .012 * seg(t, S6.t0 + 2, S6.t1)));
  const win = (t0, t1) => ss(seg(t, t0, t0 + .25)) * (1 - ss(seg(t, t1 - .2, t1)));
  const hi = [win(a(Q.payoff) + .3, a(Q.payoff) + 2.2), win(a(Q.ask) + 1.0, a(Q.follow) + .1), Math.max(win(a(Q.payoff) + 2.3, a(Q.ask) + .2), win(a(Q.ask) + .3, a(Q.ask) + 1.0))];
  wall(t, hi);
  const pk = seg(t, a(Q.plugs) - .1, a(Q.plugs) + .6);
  if (pk > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); const R0 = [60, 318, 840, 136]; sheetShadow(R0[0], R0[1], R0[2], R0[3], .3); const cl = pk < 1 ? wipeRegion(R0, 'right', pk, 5, 40) : null;
    ink(ctx, { path: rectPath(...R0) }, { color: PAL.banner.sky2, clip: cl, sheen: 1 });
    const plugs = new Path2D(); [[150, 386], [250, 386]].forEach(([x, y], i) => { const q = new Path2D(); q.ellipse(x, y, 36, 52, (i ? .4 : -.4), 0, Math.PI * 2); plugs.addPath(q); });
    ink(ctx, { path: plugs }, { color: PAL.banner.sun, reg: [1, .5], clip: cl, sheen: 1 });
    ink(ctx, { paint: c => { c.font = '900 72px BigShoulders'; c.letterSpacing = '3px'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('EARPLUGS + STAND BACK', 320, 412); } }, { color: '#FFFFFF', clip: cl });
    if (pk < 1) { const x = wipeFront(R0, 'right', pk, 40) + 10; squeegee(ctx, [x, R0[1] - 20], [x, R0[1] + R0[3] + 20], [1, 0], { color: PAL.banner.sky2, seed: 9, roll: x / 30, scale: .9 }); } }
  caption(t, PALS[0], 1);
}
// end card printed in two pulls: art (sky bands, a blue field with a trail and its jet) then the standard closing lines, all inside y 300-1150
function endStage(t) {
  const t0 = a(Q.follow) - .15, p1 = seg(t, t0, t0 + .8), p2 = seg(t, t0 + .75, t0 + 1.3), pl = PAL.end;
  cam(W / 2, 800, 1.012); wall(t, [0, 0, 0]);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const M = 40;
  const c1 = wipeRegion([0, 0, W, H], 'right', p1, 3, 60, 8);
  ctx.save(); ctx.clip(c1); paperSheet(ctx, T, 0, 0, W, H, 1.1);
  ctx.save(); ctx.beginPath(); ctx.rect(M, M, W - 2 * M, H - 2 * M); ctx.clip();
  ink(ctx, { path: rectPath(0, 0, W, H) }, { color: pl.sky1, sheen: 1 });
  const top = new Path2D(); top.rect(0, 0, W, 120); top.addPath(bandSteps(0, W, 120, 300, 7, 12));
  ink(ctx, { path: top }, { color: pl.sky2, reg: [1.5, .8], sheen: 1, trap: .4 });
  ink(ctx, { path: rectPath(0, 960, W, 960) }, { color: pl.mid, reg: [-1, 1], sheen: 1, trap: 1 });
  const jx = 760 + 40 * (t - t0), tr = new Path2D(); for (let i = 0; i < 8; i++) { const r = 60 + i * 70 + ((t - t0) * 60) % 70, q = new Path2D(); q.arc(jx - 40, 1090, r + 6, Math.PI * .7, Math.PI * 1.3); q.arc(jx - 40, 1090, r - 6, Math.PI * 1.3, Math.PI * .7, true); q.closePath(); tr.addPath(q); }
  ink(ctx, { path: tr }, { color: pl.glow, reg: [2, -1], sheen: 1 });
  ink(ctx, { path: placed(JET.body, jx + 24, 1060, .62) }, { color: pl.near, reg: [1, .5], sheen: 1 });
  ctx.restore(); ctx.restore();
  if (p2 > 0) {
    const c2 = p2 < 1 ? wipeRegion([0, 360, W, 560], 'right', p2, 9, 50, 8) : null;
    ink(ctx, { paint: c => { c.textAlign = 'center'; c.font = '900 104px BigShoulders'; c.letterSpacing = '2px'; c.fillStyle = pl.near; c.fillText('FOLLOW FOR MORE OF', W / 2, 500); c.fillStyle = pl.sky2; c.fillText('HOW IT REALLY WORKS.', W / 2, 620);
      c.fillStyle = pl.near; c.fillRect(W / 2 - 330, 665, 660, 6); c.font = '600 44px Outfit'; c.letterSpacing = '1px'; c.fillText("A new 'wait, really?' every day.", W / 2, 750); c.font = '600 38px Outfit'; c.letterSpacing = '5px'; c.fillStyle = pl.mid; c.fillText('@HOWITREALLYWORKSTUDIO', W / 2, 822); } }, { color: pl.near, clip: c2, reg: [1.2, .6] });
  }
  inkFinish(ctx, T, 0, 0, W, H, 1.1, p1 >= 1 ? 1 : 0);
  if (p1 > 0 && p1 < 1) { const x = wipeFront([0, 0, W, H], 'right', p1, 60); const BB = [[pl.sky2, 0, .15], [pl.sky1, .15, .5], [pl.mid, .5, .99]]; squeegee(ctx, [x + 10, -40], [x + 10, H + 40], [1, 0], { beads: BB.map(([c, aa, b]) => ({ t0: aa + .02, t1: b, color: c })), scale: 1.6, seed: 9, roll: x / 30 }); }
  if (p2 > 0 && p2 < 1) { const x = wipeFront([0, 360, W, 560], 'right', p2, 50); squeegee(ctx, [x + 10, 340], [x + 10, 940], [1, 0], { color: pl.near, scale: 1.2, seed: 4, roll: x / 30 }); }
}
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = TABLE; ctx.fillRect(0, 0, W, H);
  const STG = [bannerStage, t => posterStage(0, t, S2), t => posterStage(1, t, S3), t => posterStage(2, t, S4), t => posterStage(3, t, S5), wallStage, endStage];
  let idx = [S1.t1, S2.t1, S3.t1, S4.t1, S5.t1, S6.t1].findIndex(b => t < b); if (idx < 0) idx = 6;
  // silhouette wipes as a moving cloud band: the old stage stays on its left, the new one is already there on its right (never a blank frame)
  const w = [[S3.t0, 1, 2, PALS[0].sky2], [S4.t0, 2, 3, PALS[1].sky2], [S5.t0, 3, 4, PALS[2].sky2], [S6.t0, 4, 5, PALS[3].sky2]].find(([t0]) => t > t0 - .35 && t < t0 + .35);
  if (!w) STG[idx](t);
  else { const [t0, o, nw, col] = w, band = W * .4, cx = lerp(W + band + 120, -120, ss(seg(t, t0 - .35, t0 + .35)));
    STG[o](t); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(cx, 0, W + 200, H); ctx.clip(); STG[nw](t); ctx.restore(); cloudBand(cx, band, col); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const f = Math.min(1, (DUR - t) / .35); if (f < 1) { ctx.save(); ctx.globalAlpha = (1 - f) * .3; ctx.fillStyle = '#1a120c'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
window.DUR = DUR;
// loop: blend the frame-0 banner back in over the last 0.5 s (max 30%), on top of the 30% end darkening
window.seek = t => { render(t); const lp = seg(t, DUR - .5, DUR); if (lp > 0) { const keep = ctx.getImageData(0, 0, W, H); render(0); const f0 = ctx.getImageData(0, 0, W, H); const k = .3 * ss(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } ctx.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); cam(0, 900, .62); table(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.translate(540 - PW * .78 / 2, 560); ctx.scale(.78, .78); ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.fillRect(10, 14, PW, PH); ctx.restore(); drawPoster(ctx, POS[0], { pal: PALS[0], T, finish: false }); overlay(0, 30, PALS[0], true); inkFinish(ctx, T, 0, 0, PW, PH, .6, 1); ctx.restore();
  ctx.save(); ctx.translate(540 - BW * .56 / 2, 290); ctx.scale(.56, .56); ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.fillRect(10, 14, BW, BH); ctx.restore(); drawBanner(ctx, BANNER_C, { pal: PAL.banner, T }); ctx.restore();
};
window.seek(0); window.ready = true; window.READY = true;
