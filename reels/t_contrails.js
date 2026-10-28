// t_contrails.js: "Why do planes leave white trails in the sky?" in the silkscreen-poster style (#7), same engine and layout as skyblue/cranberries.
// Grammar kept: print table, squeegee pulls (one ink, one beat), split-fountain bead, screen lift, stepped bands, paper as a colour (the trails),
// info band, silhouette wipes (cloud edge here), wall lockup, end card printed in two pulls. Vertical 1080x1920, deterministic in t.
// Safe zones: posters framed in y 250-1150, printed caption strip at y 1170-1410 (text inside x 190-890), nothing written top 250 / right column.
// Motion: each poster carries a jet crossing its sky; the trail behind it is the explanation (droplets -> ice, dry = gone, humid = stays + spreads).
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

// ------------------------------------------------------------------ palettes (<= 6 inks + glow; a new palette per poster, same template)
const PAPER = '#F2E8D2', TABLE = '#6B4E36';
const PAL = {
  banner: { sky1: '#BFDCEB', sky2: '#4F86B3', far: '#173A5C', mid: '#7FB3D5', near: '#0F1E30', sun: '#F2B134', glow: '#FFFFFF' },
  cold: { sky1: '#2F5F8A', sky2: '#1B3D63', far: '#3E5873', mid: '#A9CBDD', near: '#14202E', sun: '#F2B134', glow: '#FFFFFF', red: '#E8553D' },
  dry: { sky1: '#F6E3C2', sky2: '#D9822B', far: '#B3562F', mid: '#7A4A2A', near: '#2A1A12', sun: '#FFE08A', glow: '#FFFFFF', red: '#C7243A' },
  humid: { sky1: '#3F5D82', sky2: '#2A4466', far: '#2C3D5E', mid: '#C9D6E2', near: '#161D2E', sun: '#F2B134', glow: '#FFFFFF', red: '#E8553D' },
  survey: { sky1: '#F4E9D8', sky2: '#C7243A', far: '#7E1A2C', mid: '#3A6FA0', near: '#24161E', sun: '#F2B134', glow: '#FFFFFF', red: '#C7243A' },
  end: { sky1: '#F2EEE4', sky2: '#24507A', far: '#173A5C', mid: '#2F6E9E', near: '#14202E', sun: '#F2B134', glow: '#FFFFFF' },
};
const T = makeTextures(PAPER, 7);
const BANNER_C = { title: 'Why do planes leave white trails?', footer: 'Ice, cold air and a humid sky' };
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
// ------------------------------------------------------------------ the jet (side view, nose right), built once and placed with a matrix
const JET = (() => {
  const p = new Path2D();
  p.moveTo(-150, -12); p.lineTo(112, -12); p.bezierCurveTo(140, -12, 160, -4, 163, 4); p.bezierCurveTo(158, 12, 140, 16, 112, 16); p.lineTo(-118, 16); p.lineTo(-160, -2); p.closePath();
  p.moveTo(-146, -10); p.lineTo(-172, -80); p.lineTo(-148, -80); p.lineTo(-98, -10); p.closePath();       // fin
  p.moveTo(-140, 0); p.lineTo(-186, 10); p.lineTo(-176, 16); p.lineTo(-128, 10); p.closePath();         // tailplane
  p.moveTo(18, 6); p.lineTo(-58, 50); p.lineTo(-34, 50); p.lineTo(52, 8); p.closePath();                // wing
  p.moveTo(42, 30); p.ellipse(16, 30, 28, 11, 0, 0, Math.PI * 2);                                         // engine pod
  const win = new Path2D(); for (let x = -112; x <= 96; x += 15) { win.moveTo(x + 3.4, -2); win.arc(x, -2, 3.4, 0, Math.PI * 2); }
  win.moveTo(132, -4); win.lineTo(150, -4); win.lineTo(154, 2); win.lineTo(132, 2); win.closePath();     // cockpit
  return { body: p, win, ex: -14, ey: 30 };
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
const THERMO = { x: 110, top: 500, bot: 880 }, LOUPE = { x: 735, y: 770, r: 150 }, BREATH = { x: 400, y: 800, r: 112 }, GAUGE = { x: 300, y: 790, r: 130 }, CLOCK = { x: 735, y: 760, r: 118 };
function scene1() {   // ICE, NOT SMOKE: deep high sky, the jet close, a thermometer at -70 F, a loupe on the trail, a breath on a cold day
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 500); top.addPath(bandSteps(-60, PW + 120, 440, 600, 6, 10));
  const tube = new Path2D(); tube.addPath(rectPath(THERMO.x - 22, THERMO.top, 44, THERMO.bot - THERMO.top)); tube.addPath(circlePath(THERMO.x, THERMO.bot + 26, 40)); tube.addPath(circlePath(THERMO.x, THERMO.top, 22));
  const chan = new Path2D(); chan.addPath(rectPath(THERMO.x - 9, THERMO.top, 18, THERMO.bot - THERMO.top + 10)); chan.addPath(circlePath(THERMO.x, THERMO.bot + 26, 27));
  const ticks = new Path2D(); for (let i = 0; i < 9; i++) ticks.addPath(rectPath(THERMO.x + 26, THERMO.top + 20 + i * 42, i % 2 ? 18 : 30, 6));
  const loupe = ringPath(LOUPE.x, LOUPE.y, LOUPE.r, LOUPE.r + 16); loupe.addPath(line(LOUPE.x - 70, LOUPE.y - LOUPE.r - 6, 560, 420, 12)); loupe.addPath(line(LOUPE.x + 100, LOUPE.y + 120, LOUPE.x + 150, LOUPE.y + 210, 30));
  const lens = circlePath(LOUPE.x, LOUPE.y, LOUPE.r);
  const bring = ringPath(BREATH.x, BREATH.y, BREATH.r, BREATH.r + 12), bdisc = circlePath(BREATH.x, BREATH.y, BREATH.r);
  const head = new Path2D(); head.addPath(circlePath(BREATH.x - 30, BREATH.y - 12, 46)); head.addPath(polyPath([[BREATH.x + 8, BREATH.y - 20], [BREATH.x + 30, BREATH.y + 4], [BREATH.x + 8, BREATH.y + 8]]));
  head.addPath(rectPath(BREATH.x - 46, BREATH.y + 26, 30, 30));
  const coat = new Path2D(); coat.moveTo(BREATH.x - 120, BREATH.y + 140); coat.quadraticCurveTo(BREATH.x - 112, BREATH.y + 46, BREATH.x - 30, BREATH.y + 44); coat.quadraticCurveTo(BREATH.x + 44, BREATH.y + 46, BREATH.x + 52, BREATH.y + 140); coat.closePath();
  const hat = new Path2D(); hat.moveTo(BREATH.x - 80, BREATH.y - 30); hat.quadraticCurveTo(BREATH.x - 30, BREATH.y - 100, BREATH.x + 18, BREATH.y - 30); hat.closePath(); hat.addPath(circlePath(BREATH.x - 30, BREATH.y - 84, 14));
  const hills = hillsPath(1000, 60, 1.1), near = hillsPath(1080, 34, 2.7);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'low', parts: [{ ink: 'mid', path: lowSky(640), sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'mid', path: halftone(-20, PW + 20, 470, 600, 24, 8, false), sub: 0 }] },
    { id: 'hills', parts: [{ ink: 'far', path: hills, sub: 0 }, { ink: 'near', path: near, sub: 1 }] },
    { id: 'thermo', parts: [{ ink: 'near', path: tube, sub: 0 }, { ink: 'glow', path: chan, sub: 1 }, { ink: 'near', path: ticks, sub: 1 }, { paint: label('-70°F', THERMO.x + 6, THERMO.top - 46, 62, 'center', 'BigShoulders', 900, 1), sub: 1, ink: 'glow' }] },
    { id: 'loupe', parts: [{ ink: 'sky2', path: lens, sub: 0 }, { ink: 'near', path: loupe, sub: 1 }] },
    { id: 'breath', parts: [{ ink: 'sky2', path: bdisc, sub: 0 }, { ink: 'near', path: bring, sub: 0 }, { ink: 'mid', path: head, sub: 1 }, { ink: 'red', path: coat, sub: 1 }, { ink: 'red', path: hat, sub: 1 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit('ICE, NOT SMOKE', 1110, 180), sub: 0 }] },
  ] };
}
function scene2() {   // GONE IN SECONDS: dry orange sky, sun, mesas, the humidity dial pointing DRY
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 460); top.addPath(bandSteps(-60, PW + 120, 400, 600, 6, 10));
  const sun = circlePath(820, 600, 92), sunRing = ringPath(820, 600, 112, 124);
  const mesas = polyPath([[-60, 1300], [-60, 900], [120, 900], [150, 860], [330, 860], [370, 930], [520, 930], [560, 830], [760, 830], [790, 900], [1060, 900], [1060, 1300]]);
  const ground = hillsPath(1030, 18, .4);
  const cactus = new Path2D(); [[160, 1040, 1], [880, 1050, .8]].forEach(([x, y, k]) => { cactus.addPath(rectPath(x - 14 * k, y - 120 * k, 28 * k, 130 * k)); cactus.addPath(circlePath(x, y - 120 * k, 14 * k)); cactus.addPath(rectPath(x - 50 * k, y - 80 * k, 40 * k, 16 * k)); cactus.addPath(rectPath(x - 50 * k, y - 110 * k, 16 * k, 40 * k)); cactus.addPath(rectPath(x + 14 * k, y - 64 * k, 36 * k, 16 * k)); cactus.addPath(rectPath(x + 34 * k, y - 96 * k, 16 * k, 40 * k)); });
  const g = dialFace(GAUGE.x, GAUGE.y, GAUGE.r);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'sun', parts: [{ ink: 'sun', path: sun, sub: 0 }, { ink: 'sun', path: sunRing, sub: 1 }] },
    { id: 'mesas', parts: [{ ink: 'far', path: mesas, sub: 0 }] },
    { id: 'ground', parts: [{ ink: 'mid', path: ground, sub: 0 }, { ink: 'near', path: cactus, sub: 1 }] },
    { id: 'gauge', parts: [{ ink: 'glow', path: g.face, sub: 0 }, { ink: 'near', path: g.rim, sub: 0 }, { ink: 'near', path: g.ticks, sub: 1 }, { ink: 'far', paint: label('DRY', GAUGE.x - 78, GAUGE.y - 30, 30), sub: 1 }, { ink: 'mid', paint: label('HUMID', GAUGE.x + 66, GAUGE.y - 30, 26), sub: 1 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit('GONE IN SECONDS', 1110, 180), sub: 0 }] },
  ] };
}
function cirrusSheet(y0, slope, n, th, seed) { const p = new Path2D(); for (let i = 0; i < n; i++) { const yy = y0 + i * th * 1.5; p.addPath(wavePath(-80 + 30 * hash(seed + i), PW + 80, yy, 6 + 4 * hash(seed * 3 + i), 260 + 60 * hash(i + seed), th * (.6 + .5 * hash(seed + i * 7)))); } const q = new Path2D(); q.addPath(p, new DOMMatrix().translate(PW / 2, y0).rotate(slope).translate(-PW / 2, -y0)); return q; }
function scene3() {   // STAYS + SPREADS: humid blue-grey sky, old trails spread into cirrus, a clock running hours, the dial pointing HUMID
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 500); top.addPath(bandSteps(-60, PW + 120, 440, 620, 6, 10));
  const cirrus = new Path2D(); cirrus.addPath(cirrusSheet(225, -6, 5, 12, 3)); cirrus.addPath(cirrusSheet(470, 4, 4, 10, 9));
  const corridor = new Path2D(); [[240, -10], [300, -11], [560, -9], [610, -10]].forEach(([y, sl], i) => { const q = new Path2D(); q.addPath(wavePath(-80, PW + 80, y, 3, 400, 10 + 4 * (i % 2))); corridor.addPath(q, new DOMMatrix().translate(PW / 2, y).rotate(sl).translate(-PW / 2, -y)); });
  const g = dialFace(GAUGE.x, GAUGE.y, GAUGE.r);
  const cface = circlePath(CLOCK.x, CLOCK.y, CLOCK.r), crim = ringPath(CLOCK.x, CLOCK.y, CLOCK.r, CLOCK.r + 14);
  const cticks = new Path2D(); for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6, c = Math.cos(an), s = Math.sin(an); cticks.addPath(line(CLOCK.x + c * CLOCK.r * .78, CLOCK.y + s * CLOCK.r * .78, CLOCK.x + c * CLOCK.r * .93, CLOCK.y + s * CLOCK.r * .93, i % 3 ? 5 : 10)); }
  cticks.addPath(rectPath(CLOCK.x - 16, CLOCK.y - CLOCK.r - 38, 32, 26)); cticks.addPath(rectPath(CLOCK.x - 34, CLOCK.y - CLOCK.r - 50, 68, 14));
  const hills = hillsPath(1010, 50, 3.3), near = hillsPath(1080, 26, .9);
  const trees = new Path2D(); for (let i = 0; i < 10; i++) pine(trees, 30 + i * 108, 1060 + (i % 2) * 12, 140 + (i % 3) * 30, 70, 3);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'low', parts: [{ ink: 'mid', path: lowSky(660), sub: 0 }] },
    { id: 'hills', parts: [{ ink: 'far', path: hills, sub: 0 }, { ink: 'near', path: near, sub: 1 }] },
    { id: 'trees', parts: [{ ink: 'near', path: trees, sub: 0 }] },
    { id: 'gauge', parts: [{ ink: 'glow', path: g.face, sub: 0 }, { ink: 'near', path: g.rim, sub: 0 }, { ink: 'near', path: g.ticks, sub: 1 }, { ink: 'far', paint: label('DRY', GAUGE.x - 78, GAUGE.y - 30, 26), sub: 1 }, { ink: 'sky2', paint: label('HUMID', GAUGE.x + 66, GAUGE.y - 30, 30), sub: 1 }] },
    { id: 'clock', parts: [{ ink: 'glow', path: cface, sub: 0 }, { ink: 'near', path: crim, sub: 0 }, { ink: 'near', path: cticks, sub: 1 }] },
    { id: 'cirrus', parts: [{ ink: 'glow', path: cirrus, sub: 0 }] },
    { id: 'corridor', parts: [{ ink: 'glow', path: corridor, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit('STAYS + SPREADS', 1110, 180), sub: 0 }] },
  ] };
}
const CROWD = []; for (let r = 0; r < 7; r++) for (let c = 0; c < 11; c++) CROWD.push([95 + c * 81, 500 + r * 72]);
function scene4() {   // NOT CHEMTRAILS: a 2016 survey, 77 scientists printed as a crowd of figures, 76 in one ink
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 300); top.addPath(bandSteps(-60, PW + 120, 260, 420, 6, 10));
  const base = rectPath(-60, 1010, PW + 120, 400);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'base', parts: [{ ink: 'far', path: base, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'glow', paint: slabFit('NOT CHEMTRAILS', 1110, 180), sub: 0 }] },
  ] };
}
const mkP = (sc, name, idx, items, n = 3) => ({ sc, trail: { name }, items, idx, n, paper: PAPER, park: 'How it really works', trailPts: [], trailLen: 0, seed: idx * 13 + 5 });
const POS = [
  mkP(scene1(), 'How a trail forms', 0, [{ key: 'a', label: 'EXHAUST', value: 'WATER VAPOR' }, { key: 'b', label: 'AIR', value: '-70°F' }, { key: 'c', label: 'MAKES', value: 'ICE' }]),
  mkP(scene2(), 'Dry sky', 1, [{ key: 'a', label: 'AIR', value: 'DRY' }, { key: 'b', label: 'ICE', value: 'EVAPORATES' }, { key: 'c', label: 'TRAIL', value: 'SECONDS' }]),
  mkP(scene3(), 'Humid sky', 2, [{ key: 'a', label: 'AIR', value: 'HUMID' }, { key: 'b', label: 'TRAIL', value: 'HOURS' }, { key: 'c', label: 'CLOUD', value: 'UP TO +20%' }]),
  mkP(scene4(), 'The 2016 survey', 3, [{ key: 'a', label: 'SURVEY', value: '2016' }, { key: 'b', label: 'ASKED', value: '77' }, { key: 'c', label: 'NO EVIDENCE', value: '76' }], 4),
];
const PALS = [PAL.cold, PAL.dry, PAL.humid, PAL.survey];

// ------------------------------------------------------------------ timeline (all anchored to the voice; phrase numbers by name)
const Q = { hook: 0, but: 1, fuel: 2, cold: 3, ice: 4, breath: 5, why: 6, sky: 7, dry: 8, short: 9, humid: 10, hours: 11, shear: 12, corr: 13, chem: 14, survey: 15, payoff: 16, ask: 17, follow: 18 };
const BAN = [-900, -220], PO = [-500, 560], SPEC = [-700, 300, 1400, 210], BCY = 330;
const S1 = { t0: 0, t1: a(Q.fuel) - .55 }, S2 = { t0: a(Q.fuel) - .55, t1: a(Q.why) - .1 }, S3 = { t0: a(Q.why) - .1, t1: a(Q.humid) - .1 }, S4 = { t0: a(Q.humid) - .1, t1: a(Q.chem) - .1 }, S5 = { t0: a(Q.chem) - .1, t1: a(Q.payoff) - .1 }, S6 = { t0: a(Q.payoff) - .1, t1: a(Q.follow) - .15 };
const PR = [
  { sky: [a(Q.fuel) + .05, .45], top: [a(Q.fuel) + .35, .45], low: [a(Q.fuel) + .6, .45], halftone: [a(Q.fuel) + .9, .4], hills: [a(Q.fuel) + 1.2, .45], thermo: [a(Q.cold) + .1, .5], loupe: [a(Q.ice) + .15, .5], head: [a(Q.ice) + 2.4, .5], breath: [a(Q.breath) + .1, .5] },
  { sky: [a(Q.why) + .1, .4], top: [a(Q.why) + .4, .45], sun: [a(Q.why) + .8, .35], mesas: [a(Q.why) + 1.1, .4], ground: [a(Q.why) + 1.5, .45], gauge: [a(Q.sky) + .2, .5], head: [a(Q.short) + .2, .5] },
  { sky: [a(Q.humid) + .1, .4], top: [a(Q.humid) + .4, .45], low: [a(Q.humid) + .6, .45], hills: [a(Q.humid) + .9, .4], trees: [a(Q.humid) + 1.2, .4], gauge: [a(Q.humid) + 1.5, .5], clock: [a(Q.hours) + .05, .5], cirrus: [a(Q.shear) + 2.2, .7], head: [a(Q.shear) + 3.2, .5], corridor: [a(Q.corr) + .4, .8] },
  { sky: [a(Q.chem) + .1, .4], top: [a(Q.chem) + .4, .45], base: [a(Q.chem) + .8, .4], head: [a(Q.chem) + .9, .5] },
];
const ITEMS = [[a(Q.fuel) + 2.6, a(Q.cold) + 1.6, a(Q.ice) + 2.9], [a(Q.dry) + .4, a(Q.dry) + 1.6, a(Q.short) + .9], [a(Q.humid) + 2.6, a(Q.hours) + .9, a(Q.corr) + 3.0], [a(Q.survey) + .6, a(Q.survey) + 2.6, a(Q.survey) + 4.6]];
const BAND = [a(Q.fuel) + .9, a(Q.why) + .5, a(Q.humid) + .3, a(Q.chem) + .4], NAME = [a(Q.fuel) + 1.3, a(Q.why) + .9, a(Q.humid) + .7, a(Q.chem) + .7];
const INKOF = { sky: 'sky1', top: 'sky2', low: 'mid', hills: 'far', thermo: 'near', loupe: 'near', breath: 'sky2', sun: 'sun', mesas: 'far', ground: 'mid', gauge: 'near', trees: 'near', clock: 'near', cirrus: 'glow', corridor: 'glow', base: 'far', head: 'glow' };
const SQUEEGEE_IDS = [['sky', 'top', 'low', 'hills', 'thermo', 'loupe', 'breath'], ['sky', 'top', 'mesas', 'ground', 'gauge'], ['sky', 'top', 'low', 'hills', 'gauge', 'clock', 'cirrus', 'corridor'], ['sky', 'top', 'base']];
// the jet crossing each poster: scene y, scale, entry/exit x, time window, trail mode
const FLY = [
  { y: 330, s: 1.15, x0: -260, x1: 1320, t0: a(Q.fuel) + 1.5, t1: a(Q.why) - .2, mode: 'form' },
  { y: 320, s: .8, x0: -160, x1: 1000, t0: a(Q.sky) + .3, t1: a(Q.humid) - .1, mode: 'dry' },
  { y: 340, s: .62, x0: -140, x1: 1200, t0: a(Q.humid) + .7, t1: a(Q.chem) - .3, mode: 'wet' },
  { y: 200, s: .5, x0: -140, x1: 1200, t0: a(Q.chem) + .6, t1: a(Q.payoff) + .2, mode: 'plain' },
];
const WALLX = [700, 640, 760, 600];   // where the jet sits on the wall copies
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
// ------------------------------------------------------------------ the moving layer on each poster: jet, trail, gauges (printed inks, drawn per frame)
function addC(p, x, y, r) { p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); }
function addE(p, x, y, rx, ry) { p.moveTo(x + rx, y); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
function trailPath(F, ex, ey, t) {
  const p = new Path2D(), s = F.s, G = 8;
  const each = (gap, fn) => { for (let px = Math.floor((ex - gap) / G) * G; px > -120; px -= G) fn(px, ex - px); };
  if (F.mode === 'form') {          // clear hot exhaust, then droplets, then a growing band of ice
    const gap = 46 * s, drop = 200 * s;
    each(gap, (px, d) => { if (d < drop) { if (px % 16) return; const r = s * (3 + 3 * hash(px * .37)); addC(p, px, ey + (hash(px * .11) - .5) * 14 * s, r); } else addC(p, px, ey, s * (6 + 10 * clamp((d - drop) / 700))); });
  } else if (F.mode === 'dry') {    // a short line that shrinks to nothing
    const L = 420 * s;
    each(30 * s, (px, d) => { if (d > L) return; const u = d / L; if (u > .6 && px % 16) return; addC(p, px, ey, s * 13 * Math.pow(1 - u, .8)); });
  } else if (F.mode === 'wet') {    // a trail that keeps growing; after the shear beat it smears into a sheet
    const sh = ss(seg(t, a(Q.shear) + .2, a(Q.shear) + 2.4));
    each(30 * s, (px, d) => { const r = s * (9 + 22 * clamp(d / 900)), k = sh * clamp(d / 500); addE(p, px, ey + k * s * 34 * Math.sin(px * .011), r * 1.25, r * (1 + 1.9 * k)); });
  } else each(30 * s, (px, d) => addC(p, px, ey, s * (8 + 6 * clamp(d / 600))));
  return p;
}
function overlay(k, t, pal, onWall) {
  const F = FLY[k], done = id => onWall || (PR[k][id] && t >= PR[k][id][0] + PR[k][id][1]);
  ctx.save(); ctx.beginPath(); ctx.rect(ARTV[0], ARTV[1], ARTV[2], ARTV[3]); ctx.clip(); ctx.translate(0, -SHIFT);
  if (k === 0) {
    if (done('thermo')) { const m = onWall ? .1 : lerp(.86, .1, ss(seg(t, a(Q.cold) + .7, a(Q.cold) + 2.6))), yT = THERMO.bot - m * (THERMO.bot - THERMO.top); const q = rectPath(THERMO.x - 9, yT, 18, THERMO.bot - yT + 12); q.addPath(circlePath(THERMO.x, THERMO.bot + 26, 22)); ink(ctx, { path: q }, { color: pal.red, reg: [1, .5], sheen: 1 }); }
    if (done('loupe')) {
      const g = onWall ? 1 : seg(t, a(Q.ice) + .6, a(Q.ice) + 3.0), q = new Path2D();
      [[-70, -60], [62, -78], [0, 8], [-84, 74], [78, 64], [-6, -116], [10, 112]].forEach(([dx, dy], i) => { const x = LOUPE.x + dx + 6 * Math.sin(t * .9 + i), y = LOUPE.y + dy + 6 * Math.cos(t * 1.1 + i * 2);
        if (g < .14) addC(q, x, y, 9 + 3 * (i % 2)); else crystal(q, x, y, 10 + 30 * ss(g) * (i < 5 ? 1 : .7), t * .35 + i * .7, 6); });
      ctx.save(); ctx.clip(circlePath(LOUPE.x, LOUPE.y, LOUPE.r - 4)); ink(ctx, { path: q }, { color: pal.glow, reg: [1, -.5], sheen: 1 }); ctx.restore();
    }
    if (done('breath')) {
      const u = ((t * .62) % 1), q = new Path2D(); [0, .33, .66].forEach(o => { const v = (u + o) % 1; addC(q, BREATH.x + 44 + v * 70, BREATH.y + 4 - v * 26, 8 + 30 * v); });
      ctx.save(); ctx.clip(circlePath(BREATH.x, BREATH.y, BREATH.r)); ink(ctx, { path: q }, { color: pal.glow, reg: [1, -.5], sheen: 1 }); ctx.restore();
    }
  }
  if ((k === 1 || k === 2) && done('gauge')) {
    const an = (k === 1 ? lerp(-Math.PI / 2, -Math.PI + .38, onWall ? 1 : ss(seg(t, a(Q.dry) + .1, a(Q.dry) + 1.0))) : lerp(-Math.PI / 2, -.38, onWall ? 1 : ss(seg(t, a(Q.humid) + 2.0, a(Q.humid) + 2.9)))) + .035 * Math.sin(t * 6.3);
    const q = line(GAUGE.x, GAUGE.y, GAUGE.x + Math.cos(an) * GAUGE.r * .86, GAUGE.y + Math.sin(an) * GAUGE.r * .86, 10); q.addPath(circlePath(GAUGE.x, GAUGE.y, 16));
    ink(ctx, { path: q }, { color: pal.red, reg: [1, .5], sheen: 1 });
  }
  if (k === 2 && done('clock')) {
    const spin = onWall ? t * .4 : Math.max(0, t - (a(Q.hours) + .6)), m = -Math.PI / 2 + spin * Math.PI * 2 * .9, h = -Math.PI / 2 + .9 + spin * Math.PI * 2 * .9 / 12;
    const q = line(CLOCK.x, CLOCK.y, CLOCK.x + Math.cos(m) * CLOCK.r * .8, CLOCK.y + Math.sin(m) * CLOCK.r * .8, 9); q.addPath(line(CLOCK.x, CLOCK.y, CLOCK.x + Math.cos(h) * CLOCK.r * .52, CLOCK.y + Math.sin(h) * CLOCK.r * .52, 14)); q.addPath(circlePath(CLOCK.x, CLOCK.y, 14));
    ink(ctx, { path: q }, { color: pal.near, reg: [1, .5], sheen: 1 });
  }
  if (k === 3) {
    const n = onWall ? 77 : Math.floor(77 * seg(t, a(Q.survey) + 1.0, a(Q.survey) + 4.2) + 1e-6), q = new Path2D(), q1 = new Path2D();
    CROWD.forEach(([x, y], i) => { if (i < Math.min(n, 76)) person(q, x, y); });
    if (n >= 77) person(q1, CROWD[76][0], CROWD[76][1]);
    ink(ctx, { path: q }, { color: pal.mid, reg: [1, .5], sheen: 1 }); if (n >= 77) ink(ctx, { path: q1 }, { color: pal.sun, reg: [1, .5], sheen: 1 });
  }
  let x = onWall ? WALLX[k] : null;
  if (!onWall && t >= F.t0) x = lerp(F.x0, F.x1, (t - F.t0) / (F.t1 - F.t0));
  if (x != null) {
    const ex = x + JET.ex * F.s, ey = F.y + JET.ey * F.s;
    ink(ctx, { path: trailPath(F, ex, ey, onWall ? 1e9 : t) }, { color: pal.glow, reg: [1.2, -.6], sheen: 1 });
    ink(ctx, { path: placed(JET.body, x, F.y, F.s) }, { color: pal.near, sheen: 1 });
    ink(ctx, { path: placed(JET.win, x, F.y, F.s) }, { color: pickInk(pal.near, [pal.sky1, pal.glow], 3), reg: [1, .6] });
  }
  ctx.restore();
}
function posterOnTable(k, P, st, t) { regTape(PO[0], PO[1], PW, PH); sheetShadow(PO[0], PO[1], PW, PH, .22); ctx.save(); ctx.translate(PO[0], PO[1]); drawPoster(ctx, P, { ...st, finish: false }); overlay(k, t, st.pal, false); inkFinish(ctx, T, 0, 0, PW, PH, .6, 1); ctx.restore(); }
// ------------------------------------------------------------------ sections
function bannerTrail() { const p = new Path2D(); for (let x = 0; x < 1400; x += 8) addC(p, x, 70, 7 + 9 * (1 - x / 1400)); return p; }
function bannerStage(t) {
  const sky = seg(t, -.45, 1.0), lift = seg(t, 1.0, 1.45), tt = seg(t, 1.2, 1.5), ff = seg(t, 1.35, 1.6);
  const sqX = wipeFront([BAN[0], BAN[1], BW, BH], 'right', sky, 34);
  const k = eo(seg(t, 1.0, 1.65));
  const down = eio(seg(t, a(Q.but) - .2, a(Q.but) + .6));
  const zc = lerp(1.35, 1.2, ss(seg(t, 0, 1.0))), zw = .58;
  let z = lerp(zc, zw, k), cx = lerp(sqX - 120, 0, k), cy = lerp(0, BCY, k);
  z = lerp(z, .56, down);
  z *= 1 + .02 * ss(seg(t, 1.8, a(Q.fuel)));
  cam(cx, cy, z, lerp(-.03, 0, k)); table();
  const bp = PAL.banner;
  regTape(BAN[0], BAN[1], BW, BH); sheetShadow(BAN[0], BAN[1], BW, BH, .25);
  ctx.save(); ctx.translate(BAN[0], BAN[1]);
  drawBanner(ctx, BANNER_C, { pal: bp, T, sky, title: tt, footer: ff, reg: 1, finish: false });
  // the white trail and its jet, printed with the sky pull (the hook picture), the jet keeps flying across the banner
  if (sky > 0) {
    const clip = sky < 1 ? wipeRegion([0, 0, BW, BH], 'right', sky, 4, 34, 4) : null, jx = 1440 + 60 * Math.sin(t * .8) + 30 * t;
    ctx.save(); ctx.beginPath(); ctx.rect(...BANNER_ART); ctx.clip();
    const tr = new Path2D(); for (let x = 0; x < jx - 60; x += 8) addC(tr, x, 34, 5 + 7 * clamp((jx - x) / 900));
    ink(ctx, { path: tr }, { color: bp.glow, reg: [1.4, -.6], clip, sheen: 1 });
    ink(ctx, { path: placed(JET.body, jx, 16, .42) }, { color: bp.near, reg: [.6, .4], clip, sheen: 1 });
    ctx.restore();
  }
  inkFinish(ctx, T, 0, 0, BW, BH, .6, 1);
  ctx.restore();
  const wet = 1 - seg(t, 1.0, 1.8);
  if (sky > 0 && wet > 0) { ctx.save(); ctx.globalAlpha = wet; ctx.beginPath(); ctx.rect(BAN[0] + 14, BAN[1] + 14, Math.max(0, sqX - BAN[0] - 14), BANNER_ART[3]); ctx.clip(); const g = ctx.createLinearGradient(sqX - 420, 0, sqX, 0); g.addColorStop(0, 'rgba(255,250,235,0)'); g.addColorStop(1, 'rgba(255,250,235,.3)'); ctx.fillStyle = g; ctx.fillRect(sqX - 420, BAN[1], 420, BH); ctx.restore(); }
  const box = [BAN[0] - 90, BAN[1] - 90, BW + 180, BH + 180];
  const emu = new Path2D(); emu.rect(box[0], box[1], box[2], box[3]); emu.rect(BAN[0] + 14, BAN[1] + 14, BW - 28, BANNER_ART[3]);
  if (lift < 1) screenFrame(ctx, box, { lift: ss(seg(t, 1.0, 1.45)), frame: 40, mesh: 'rgba(236,214,128,.03)', emulsion: emu, emulsionAlpha: .55, meshStep: 3.4, meshLine: 'rgba(70,60,30,.16)' });
  if (t < 1.35) {
    const upx = ss(seg(t, 1.0, 1.35)), x = sqX + 14 + upx * 120, y0 = BAN[1] - 38, y1 = BAN[1] + BH + 38, tn = yy => (yy - y0) / (y1 - y0), BB = BANNER_BANDS;
    ctx.save(); ctx.globalAlpha = 1 - upx;
    squeegee(ctx, [x, y0], [x, y1], [1, 0], { beads: [['sky2', bp.sky2], ['sky1', bp.sky1], ['far', bp.far]].map(([kk, c]) => ({ t0: tn(BAN[1] + BB[kk][0] + 16), t1: tn(BAN[1] + BB[kk][1]), color: c })), seed: 3, scale: 1.25, roll: sqX / 30 });
    ctx.restore();
  }
  if (tt > 0 && tt < 1) { const x = wipeFront([BAN[0], BAN[1] + 20, BW, 330], 'right', tt, 40) + 12; squeegee(ctx, [x, BAN[1] - 38], [x, BAN[1] + BH + 38], [1, 0], { color: bp.near, seed: 5, roll: x / 30, scale: 1.25 }); }
  // the but-turn card: a split-fountain pull of sky blues with a trail of ice crystals, "NOT SMOKE. A CLOUD."
  const sp = seg(t, a(Q.but) - .1, a(Q.but) + .9), lb = seg(t, a(Q.but) + .9, a(Q.but) + 1.3), WB = ['#BFDDF0', '#7FB6D9', '#3A6FA0', '#24507A'];
  if (t > a(Q.but) - .4) {
    regTape(SPEC[0], SPEC[1], SPEC[2], SPEC[3]); sheetShadow(SPEC[0], SPEC[1], SPEC[2], SPEC[3], .25);
    ctx.save(); ctx.translate(SPEC[0], SPEC[1]); paperSheet(ctx, T, 0, 0, SPEC[2], SPEC[3]);
    const cl = sp < 1 ? wipeRegion([0, 0, SPEC[2], 160], 'right', sp, 6, 40) : null;
    WB.forEach((c, i) => ink(ctx, { path: rectPath(20, 30 + i * 32, SPEC[2] - 40, 30) }, { color: c, reg: [(i % 2) * 1.4 - .7, .5], clip: cl, sheen: 1 }));
    const cr = new Path2D(); for (let i = 0; i < 11; i++) crystal(cr, 70 + i * 112, 92 + 6 * Math.sin(t * 2 + i), 22 + (i % 3) * 4, t * .4 + i, 5);
    ink(ctx, { path: cr }, { color: '#FFFFFF', reg: [1, -.5], clip: cl, sheen: 1 });
    ink(ctx, { path: rectPath(20, 160, SPEC[2] - 40, 40) }, { color: bp.near, clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
    ink(ctx, { paint: c => { c.font = '600 28px Outfit'; c.letterSpacing = '9px'; c.textAlign = 'center'; c.fillText('NOT SMOKE. A CLOUD.', SPEC[2] / 2, 189); } }, { color: pickInk(bp.near, ['#FFFFFF', bp.sky1], 4.5), clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
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
function cloudWipe(t, t0, color) {   // the demo's silhouette wipe, cut as a cloud edge
  const u = seg(t, t0 - .3, t0 + .3); if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const w = W * 1.25, cxw = lerp(W + w / 2 + 160, -w / 2 - 160, ss(u)), x = cxw - w / 2, p = new Path2D();
  p.moveTo(x, -40); for (let y = -40; y <= H + 40; y += 120) { const r = 60 + 30 * hash(y * .37); p.arc(x - 10, y + 60, 60, -Math.PI / 2, Math.PI / 2, true); }
  p.lineTo(x + w, H + 40); for (let y = H + 40; y >= -40; y -= 120) { p.arc(x + w + 10, y - 60, 60, Math.PI / 2, -Math.PI / 2, true); }
  p.closePath(); ctx.fillStyle = color; ctx.fill(p); ctx.restore();
}
// wall lockup (the three posters hung under the banner)
function wallLayout() {
  const gap = 30, pw = (W - 80 - 2 * gap) / 3, ph = pw * 1.5, bw = 940, bh = BH * bw / BW, top = 330, x0 = 40;
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
  ctx.save(); ctx.beginPath(); ctx.rect(...BANNER_ART); ctx.clip(); const jx = 1440 + 60 * Math.sin(t * .8) + 30 * t, tr = new Path2D(); for (let x = 0; x < jx - 60; x += 8) addC(tr, x, 34, 5 + 7 * clamp((jx - x) / 900));
  ink(ctx, { path: tr }, { color: '#FFFFFF', reg: [1.4, -.6], sheen: 1 }); ink(ctx, { path: placed(JET.body, Math.min(jx, 1700), 16, .42) }, { color: PAL.banner.near, sheen: 1 }); ctx.restore();
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
  const jx = 760 + 40 * (t - t0), tr = new Path2D(); for (let x = -20; x < jx - 40; x += 8) addC(tr, x, 1078 + (jx - x) * .06, 6 + 10 * clamp((jx - x) / 700));
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
  if (t < S1.t1) bannerStage(t);
  else if (t < S2.t1) posterStage(0, t, S2);
  else if (t < S3.t1) posterStage(1, t, S3);
  else if (t < S4.t1) posterStage(2, t, S4);
  else if (t < S5.t1) posterStage(3, t, S5);
  else if (t < S6.t1) wallStage(t);
  else endStage(t);
  cloudWipe(t, S3.t0 + .05, PALS[0].sky2); cloudWipe(t, S4.t0 + .05, PALS[1].sky2); cloudWipe(t, S5.t0 + .05, PALS[2].sky2); cloudWipe(t, S6.t0 + .05, PALS[3].sky2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const f = Math.min(1, (DUR - t) / .35); if (f < 1) { ctx.save(); ctx.globalAlpha = (1 - f) * .3; ctx.fillStyle = '#1a120c'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
window.DUR = DUR;
window.seek = t => render(t); window.render = window.seek;
window.thumb = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); cam(0, 900, .62); table(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.translate(540 - PW * .78 / 2, 560); ctx.scale(.78, .78); ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.fillRect(10, 14, PW, PH); ctx.restore(); drawPoster(ctx, POS[0], { pal: PALS[0], T, finish: false }); overlay(0, FLY[0].t0 + 8.5, PALS[0], true); inkFinish(ctx, T, 0, 0, PW, PH, .6, 1); ctx.restore();
  ctx.save(); ctx.translate(540 - BW * .56 / 2, 290); ctx.scale(.56, .56); ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.fillRect(10, 14, BW, BH); ctx.restore(); drawBanner(ctx, BANNER_C, { pal: PAL.banner, T }); ctx.restore();
};
window.seek(0); window.ready = true; window.READY = true;
