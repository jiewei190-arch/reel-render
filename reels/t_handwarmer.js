// t_handwarmer.js: "How do hand warmers get hot with no battery?" in template #23 Recipe card (demo t23). Canvas2D 1080x1920, pure function of t.
// The demo's recipe grammar carries the explanation: the maker's safety-sheet recipe goes into the pouch like a cocktail into a glass (step header +
// big counter + % scale + checklist card + progress bar), then the steps "air", "rust", "fast", "heat", then a second card for the click warmer,
// and the "Good drink." sign-off becomes "Good rust." Batch N layout: captions at y ~1290, content inside y 250-1130, x < 900 below y 840.
import { create, W, H, TAU, P, clamp, lerp, seg, ss, eo, bo, hash, paper, hand, mono, line, rectPts, circPts, fill, shade, progress, header, card, scale, splats, caption } from './styles/recipe/recipe.js';
await Promise.all([document.fonts.load('700 60px Caveat'), document.fonts.load('500 22px Mono')]);
const g = create(document.getElementById('c'));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, r = (i, d) => s(i) + d, TOT = TL.total;
const win = (t, a, b, f = .4) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const STEPS = ['RECIPE', 'AIR', 'RUST', 'FAST', 'HEAT', 'CLICK'];
const ROWS = [{ amt: '50-60%', item: 'iron powder' }, { amt: '30-40%', item: 'water' }, { amt: '1-5%', item: 'salt' }, { amt: '5-10%', item: 'charcoal' }, { amt: '5-10%', item: 'vermiculite' }];
const ROWS2 = [{ amt: 'lots of', item: 'dissolved salt' }, { amt: 'some', item: 'water' }, { amt: '1', item: 'metal clicker' }];
// ingredient word times inside phrase 4 ("Then water, a pinch of salt, activated charcoal, and vermiculite.")
const TW = [r(3, .4), r(4, .25), r(4, 1.25), r(4, 2.1), r(4, 3.2)];

// ---------- the pouch (the demo's glass) ----------
const PX = 190, PY = 860, PW = 500, PH2 = 260;              // pouch body (cloth) inside y 860-1120
function pouch(t, { fill: f = 0, layers = 0, glow = 0, wrapper = 0, tear = 0, open = 0, k = 1, x = PX, y = PY, w = PW, h = PH2 } = {}) {
  if (k <= 0) return; const c = g;
  if (glow > 0) { const gr = c.createRadialGradient(x + w / 2, y + h / 2, 20, x + w / 2, y + h / 2, w * .9); gr.addColorStop(0, `rgba(232,133,74,${.45 * glow})`); gr.addColorStop(1, 'rgba(232,133,74,0)'); c.fillStyle = gr; c.fillRect(x - w * .4, y - h, w * 1.8, h * 3);
    for (let i = 0; i < 4; i++) { const xx = x + w * (.2 + i * .2), ph = t * 2 + i; line(c, Array.from({ length: 8 }, (_, j) => [xx + 10 * Math.sin(ph + j * .9), y - 20 - j * 14]), { w: 3, col: P.heat, a: glow * .8, seed: 300 + i, wob: .3 }); } }
  const body = rectPts(x, y, w, h, 8);
  fill(c, body, '#f1ebe2', k);
  // contents fill from the bottom up, layer by layer (iron grey, water tint, salt specks, charcoal flecks, vermiculite flakes)
  if (f > 0) { const fy = y + h - h * .92 * f; c.save(); c.beginPath(); c.rect(x + 4, fy, w - 8, y + h - fy - 4); c.clip();
    c.fillStyle = '#6b6560'; c.fillRect(x, fy, w, h); if (layers >= 2) { c.fillStyle = 'rgba(150,190,215,.35)'; c.fillRect(x, fy, w, h); }
    for (let i = 0; i < 260; i++) { const px = x + hash(i * 1.3) * w, py = fy + hash(i * 2.7) * (y + h - fy); c.fillStyle = 'rgba(40,36,34,.6)'; c.fillRect(px, py, 2, 2); }
    if (layers >= 3) for (let i = 0; i < 40; i++) { c.fillStyle = '#fbfbf7'; c.fillRect(x + hash(i * 4.1) * w, fy + hash(i * 5.3) * (y + h - fy), 5, 5); }
    if (layers >= 4) for (let i = 0; i < 50; i++) { c.fillStyle = '#1c1916'; c.beginPath(); c.arc(x + hash(i * 6.1) * w, fy + hash(i * 7.3) * (y + h - fy), 3.5, 0, TAU); c.fill(); }
    if (layers >= 5) for (let i = 0; i < 26; i++) { c.save(); c.translate(x + hash(i * 8.1) * w, fy + hash(i * 9.3) * (y + h - fy)); c.rotate(hash(i) * 3); c.fillStyle = '#c9a24a'; c.fillRect(-7, -3, 14, 6); c.restore(); }
    c.restore(); }
  shade(c, body, 'rgba(59,42,31,.08)', 10, k);
  // non-woven cloth: dotted pores (air gets in here)
  for (let i = 0; i < 80; i++) { c.fillStyle = 'rgba(59,42,31,.22)'; c.fillRect(x + 10 + hash(i * 3.7) * (w - 20), y + 10 + hash(i * 1.9) * (h - 20), 2, 2); }
  line(c, body, { w: 3.4, k, close: true, seed: 310 });
  if (open > 0) line(c, Array.from({ length: 12 }, (_, i) => [x + i * w / 11, y - (i % 2) * 14 * open]), { w: 3, k: open, seed: 311 });
  if (wrapper > 0) { const wx = x - 40, wy = y - 40, ww = w + 80, wh = h + 80; c.save(); c.globalAlpha *= wrapper; c.fillStyle = 'rgba(207,224,234,.35)'; c.fillRect(wx, wy + 60 * tear, ww, wh - 60 * tear); c.restore();
    line(c, rectPts(wx, wy + 60 * tear, ww, wh - 60 * tear, 8), { w: 3, col: '#6f8fa3', close: true, seed: 312, a: wrapper });
    for (let i = 0; i < 2; i++) line(c, [[wx + 30 + i * 30, wy + 90], [wx + 60 + i * 30, wy + 40 + 60 * tear]], { w: 4, col: 'rgba(255,255,255,.9)', a: wrapper, seed: 313 + i, wob: .3 });
    if (tear > 0) line(c, Array.from({ length: 12 }, (_, i) => [wx + i * ww / 11, wy + 60 * tear + ((i % 2) ? -10 : 8)]), { w: 3, col: '#6f8fa3', a: wrapper * (1 - tear * .3), seed: 314 }); }
}
function thermo(x, y, h, lev, a = 1) { if (a <= 0) return; const c = g; line(c, rectPts(x - 16, y, 32, h, 6), { w: 3, close: true, seed: 330, a }); line(c, circPts(x, y + h + 22, 26, 20), { w: 3, close: true, seed: 331, a });
  c.save(); c.globalAlpha *= a; c.fillStyle = P.heat; c.beginPath(); c.arc(x, y + h + 22, 18, 0, TAU); c.fill(); c.fillRect(x - 8, y + h - (h - 10) * lev, 16, (h - 10) * lev + 10); c.restore(); }
function o2(x, y, a = 1) { const c = g; c.save(); c.globalAlpha *= a; c.strokeStyle = '#5f86a6'; c.lineWidth = 2.6; c.beginPath(); c.arc(x - 8, y, 9, 0, TAU); c.stroke(); c.beginPath(); c.arc(x + 8, y, 9, 0, TAU); c.stroke(); c.restore(); }
function grain(x, y, r, rust, seed = 1) { const col = `rgb(${Math.round(lerp(120, 168, rust))},${Math.round(lerp(116, 82, rust))},${Math.round(lerp(112, 46, rust))})`; fill(g, circPts(x, y, r, 16).map(([a, b], i) => [a + (hash(seed + i) - .5) * r * .2, b + (hash(seed + i * 2) - .5) * r * .2]), col);
  line(g, circPts(x, y, r, 16), { w: 2.6, close: true, seed, wob: r * .06 }); }
function salt(x, y, sz, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = '#fbfbf7'; g.fillRect(x, y, sz, sz); g.restore(); line(g, rectPts(x, y, sz, sz, 2), { w: 2, close: true, seed: x, wob: .3, a }); }
function clockDoodle(x, y, rr, t, a = 1) { line(g, circPts(x, y, rr, 30), { w: 3, close: true, seed: 340, a }); const an = -Math.PI / 2 + t * 3; line(g, [[x, y], [x + Math.cos(an) * rr * .75, y + Math.sin(an) * rr * .75]], { w: 3.4, seed: 341, wob: 0, a }); const an2 = -Math.PI / 2 + t * .4; line(g, [[x, y], [x + Math.cos(an2) * rr * .5, y + Math.sin(an2) * rr * .5]], { w: 4.4, seed: 342, wob: 0, a }); }

// ---------- scenes ----------
function hook(t) { const a = 1 - ss(seg(t, s(2) - .4, s(2))); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const op = ss(seg(t, r(1, .3), r(1, 1.2)));
  pouch(t, { fill: 1, layers: 5, glow: (1 - op * .6) * (.8 + .2 * Math.sin(t * 4)), x: 190 - 60 * (1 - op), y: 620 + 120 * op, w: 640 - 140 * op, h: 360 - 100 * op, open: op });
  if (op > 0) { for (let i = 0; i < 60; i++) { const px = 300 + hash(i) * 380, py = 640 + hash(i * 3) * 120 * op; g.fillStyle = 'rgba(70,64,60,.85)'; g.beginPath(); g.arc(px, py - op * 30, 3 + 2 * hash(i * 5), 0, TAU); g.fill(); } hand(g, 'just dark powder?', 540, 1110, { size: 52, align: 'center', write: seg(t, r(1, .6), r(1, 1.6)) }); }
  hand(g, 'Hot.', 70, 430, { size: 128 }); hand(g, 'No battery.', 70, 560, { size: 128, col: P.rust });
  // crossed-out battery (the "no battery" proof), top right
  const bx = 760, by = 380; line(g, rectPts(bx, by, 170, 86, 4), { w: 3.4, close: true, seed: 350 }); line(g, rectPts(bx + 170, by + 26, 16, 34, 2), { w: 3, close: true, seed: 351 }); line(g, [[bx + 30, by + 43], [bx + 70, by + 43]], { w: 4, seed: 352 }); line(g, [[bx + 50, by + 23], [bx + 50, by + 63]], { w: 4, seed: 353 });
  line(g, [[bx - 14, by - 14], [bx + 196, by + 100]], { w: 7, col: P.rust, k: seg(t, .3, .8), seed: 354 }); line(g, [[bx + 196, by - 14], [bx - 14, by + 100]], { w: 7, col: P.rust, k: seg(t, .6, 1.1), seed: 355 });
  // the search question (typed)
  const q = 'how do hand warmers get hot', n = Math.floor(q.length * seg(t, r(1, 1.8), r(1, 3.6))); if (n > 0) { g.save(); g.fillStyle = '#fffaf2'; g.shadowColor = 'rgba(80,50,20,.15)'; g.shadowBlur = 16; g.beginPath(); g.roundRect(70, 640, 880, 84, 42); g.fill(); g.restore();
    line(g, circPts(118, 682, 16, 16), { w: 3, close: true, seed: 356 }); line(g, [[130, 694], [144, 708]], { w: 3.6, seed: 357, wob: 0 }); hand(g, q.slice(0, n) + (n < q.length && (t * 2) % 1 < .5 ? '|' : ''), 160, 698, { size: 50 }); }
  g.restore(); }

function recipe(t) { const a = win(t, s(2) - .3, s(13) + .2, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const nd = TW.filter(x => t >= x).length, cur = Math.min(ROWS.length - 1, nd), tickK = nd ? seg(t, TW[nd - 1], TW[nd - 1] + .35) : 0;
  const slide = eo(seg(t, s(2) - .3, s(2) + .5)); g.save(); g.translate((1 - slide) * 520, 0);
  card(g, { meta: 'AIR-ACTIVATED · 1 POUCH', title: ['Hand', 'Warmer'], rows: ROWS, done: nd, cur: t > s(2) + .6 && nd < 5 ? cur : -1, footer: "FROM A MAKER'S SAFETY SHEET", t, tickK }); g.restore();
  // what the bottom area shows, by phrase
  if (t < s(5) - .2) { const f = nd === 0 ? 0 : nd === 1 ? .55 * ss(seg(t, TW[0], TW[0] + .9)) : lerp(.55, 1, (nd - 1 + seg(t, TW[nd - 1], TW[nd - 1] + .6)) / 4);
    pouch(t, { fill: f, layers: nd, open: 1, k: seg(t, s(2) - .2, s(2) + .4) });
    scale(g, PX - 30, PY + PH2 - 6, PY + 20, [[0, '0'], [.27, '25'], [.55, '50'], [.82, '75'], [1, '100%']], f > 0 ? f * .92 + .03 : null, { a: seg(t, s(2), s(2) + .4) });
    if (nd > 0) { const powder = [P.ink, '#7fa6c0', '#fbfbf7', '#1c1916', '#c9a24a'][nd - 1]; for (let i = 0; i < 18; i++) { const u = (t * 1.4 + i / 18) % 1, px = 440 + 26 * Math.sin(i * 2.1), py = lerp(700, PY + 80, u); g.fillStyle = powder; g.globalAlpha = a * (1 - seg(t, TW[nd - 1] + 1.2, TW[nd - 1] + 1.6)) * .9; g.beginPath(); g.arc(px, py, 4, 0, TAU); g.fill(); } g.globalAlpha = a; }
    const H0 = nd === 0 ? { title: "the maker's recipe", note: 'safety data sheet' } : { step: nd, of: 5, title: ['Add iron powder', 'Add water', 'A pinch of salt', 'Activated charcoal', 'Vermiculite'][nd - 1], num: ROWS[nd - 1].amt.replace('%', ''), unit: '%', sub: 'BY WEIGHT', note: ['more than half', 'the wet part', 'speeds it up', 'spreads the heat', 'holds the water'][nd - 1] };
    header(g, { ...H0, k: 1, numSize: 150 }); }
  else if (t < s(6) - .2) { const tear = ss(seg(t, r(5, 2.5), r(5, 3.1))); pouch(t, { fill: 1, layers: 5, wrapper: 1 - seg(t, r(5, 3.6), r(5, 4.4)) * .85, tear });
    for (let i = 0; i < 14; i++) { const u = seg(t, r(5, 3.0) + i * .08, r(5, 4.4) + i * .08); if (u <= 0) continue; const sx = 110 + hash(i) * 700, sy = 760 + hash(i * 3) * 60, tx = PX + 40 + hash(i * 5) * (PW - 80), ty = PY + 40 + hash(i * 7) * (PH2 - 80); o2(lerp(sx, tx, u), lerp(sy, ty, u), 1 - u * .5); }
    thermo(860, 880, 180, .05, 1); header(g, { title: tear < .5 ? 'Sealed: nothing' : 'Tear it open', note: tear < .5 ? 'no air, no heat' : 'air gets in through the cloth' }); }
  else if (t < s(8) - .2) { const ru = ss(seg(t, r(6, .4), r(6, 1.6)));
    if (t < s(7) - .2) { [[300, 960, 80], [450, 1000, 64], [580, 950, 88], [720, 1010, 58]].forEach(([x, y, rr], i) => grain(x, y, rr, ss(seg(ru, i * .1, .7 + i * .1)), 360 + i)); for (let i = 0; i < 6; i++) o2(260 + i * 100, 860 + 10 * Math.sin(t * 3 + i), 1 - ru * .6);
      header(g, { title: 'The iron rusts', note: 'iron + oxygen = iron oxide' }); }
    else { const k = seg(t, s(7) - .2, s(7) + .4); line(g, [[170, 1000], [560, 980]], { w: 18, col: '#9a5a32', k, seed: 370 }); line(g, [[150, 970], [150, 1030]], { w: 18, col: '#9a5a32', k, seed: 371 }); hand(g, 'an old rusty nail', 200, 1080, { size: 44, col: P.soft, write: k });
      // the snail: "so slow you never feel it"
      const sx = 640 + 40 * seg(t, s(7), e(7)); line(g, Array.from({ length: 22 }, (_, i) => { const a2 = i * .6, rr = 6 + i * 2.2; return [sx + Math.cos(a2) * rr, 960 + Math.sin(a2) * rr]; }), { w: 3, seed: 372, k }); line(g, [[sx - 60, 1012], [sx + 70, 1012], [sx + 90, 990]], { w: 3, seed: 373, k }); hand(g, 'so slow', sx, 1080, { size: 44, align: 'center', write: seg(t, r(7, 2.2), r(7, 2.8)) });
      thermo(860, 880, 180, .06, k); header(g, { title: 'Rust makes heat', note: 'normally, too slowly to feel' }); } }
  else if (t < s(9) - .2) { const k = seg(t, s(8) - .2, s(8) + .5); grain(270, 990, 110, 0, 380); hand(g, 'one lump', 270, 1130 - 10, { size: 44, align: 'center', write: k });
    for (let i = 0; i < 26; i++) { const x = 520 + (i % 6) * 58 + (Math.floor(i / 6) % 2) * 26, y = 900 + Math.floor(i / 6) * 50; grain(x, y, 20, 0, 390 + i); line(g, circPts(x, y, 23, 12), { w: 3, col: P.rust, close: true, seed: 420 + i, k: seg(t, r(8, 1.6) + i * .03, r(8, 2.2) + i * .03), wob: .5 }); }
    hand(g, 'fine powder', 670, 1130 - 10, { size: 44, align: 'center', write: k }); header(g, { title: 'Fine powder', note: 'a huge surface touching the air' }); }
  else if (t < s(10) - .2) { const k = seg(t, s(9) - .2, s(9) + .4); for (let i = 0; i < 18; i++) { const x = 230 + (i % 6) * 90, y = 920 + Math.floor(i / 6) * 70; grain(x, y, 24, ss(seg(t, r(9, .6) + i * .03, r(9, 1.6) + i * .03)), 440 + i); }
    for (let i = 0; i < 12; i++) salt(250 + hash(i) * 520, 880 + hash(i * 3) * 200 - 60 * (1 - seg(t, s(9) + i * .05, s(9) + .5 + i * .05)), 14, k);
    for (let i = 0; i < 4; i++) line(g, [[150, 900 + i * 50], [200 + 20 * i, 900 + i * 50]], { w: 3, col: P.rust, seed: 470 + i, k: seg(t, r(9, 1.0), r(9, 1.4)) });
    header(g, { title: 'Salt speeds it up', note: 'rust, but much faster' }); }
  else if (t < s(11) - .2) { const k = seg(t, s(10) - .2, s(10) + .4); pouch(t, { fill: 1, layers: 5, glow: .4, x: 140, w: 330, h: 230, y: 880 });
    for (let i = 0; i < 6; i++) { const a2 = i * TAU / 6, cx = 305, cy = 995; line(g, [[cx + Math.cos(a2) * 40, cy + Math.sin(a2) * 30], [cx + Math.cos(a2) * 150, cy + Math.sin(a2) * 100]], { w: 3.4, col: P.heat, seed: 480 + i, k: seg(t, r(10, .3) + i * .05, r(10, .9) + i * .05) }); }
    hand(g, 'charcoal spreads the heat', 305, 1130 - 6, { size: 40, align: 'center', write: seg(t, r(10, .3), r(10, 1.2)) });
    for (let i = 0; i < 6; i++) { const x = 600 + (i % 3) * 90, y = 930 + Math.floor(i / 3) * 90; g.save(); g.translate(x, y); g.rotate(i); fill(g, rectPts(-28, -11, 56, 22, 2), '#c9a24a'); g.restore(); const dk = seg(t, r(10, 2.0) + i * .08, r(10, 2.5) + i * .08); if (dk > 0) { fill(g, circPts(x + 26, y - 22, 9 * dk, 12), '#8fb7d0'); } }
    hand(g, 'vermiculite holds water', 690, 1130 - 6, { size: 40, align: 'center', write: seg(t, r(10, 2.0), r(10, 2.9)) }); header(g, { title: 'The helpers', note: 'heat spread out, water kept in' }); }
  else if (t < s(12) - .2) { pouch(t, { fill: 1, layers: 5, glow: .8 + .2 * Math.sin(t * 4) }); clockDoodle(820, 960, 70, t); thermo(860 - 160, 860, 0, 0, 0); header(g, { title: 'Fast rust', num: 'hours', unit: '', note: 'of warm hands', numSize: 120 }); }
  else { pouch(t, { fill: 1, layers: 5, glow: .7 }); const k = seg(t, s(12) - .2, s(12) + .4); line(g, rectPts(720, 900, 120, 200, 4), { w: 3.4, close: true, seed: 500, k }); line(g, rectPts(745, 950, 70, 100, 3), { w: 3, close: true, seed: 501, k }); hand(g, 'OFF', 780, 1080 + 30, { size: 40, align: 'center', a: k });
    line(g, [[700, 880], [860, 1120]], { w: 7, col: P.rust, seed: 502, k: seg(t, r(12, .8), r(12, 1.3)) }); header(g, { title: 'No off switch', note: 'once it starts, it runs' }); }
  g.restore(); }

function click(t) { const a = win(t, s(13) - .3, s(17) + .1, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const nd = t > r(14, .4) ? 1 + (t > r(14, 1.6) ? 1 : 0) + (t > r(15, .6) ? 1 : 0) : 0, slide = eo(seg(t, s(13) - .3, s(13) + .5)); g.save(); g.translate((1 - slide) * 520, 0);
  card(g, { meta: 'REUSABLE · CLICK TYPE', title: ['Click', 'Warmer'], rows: ROWS2, done: nd, cur: nd < 3 ? nd : -1, footer: 'BOIL TO RESET', t, tickK: 1, h: 400 }); g.restore();
  const x = 200, y = 870, w = 480, h = 240, cr = ss(seg(t, r(15, .8), r(15, 3.4))) * (1 - ss(seg(t, r(16, .6), r(16, 2.4))));
  if (t > s(16) - .2) { const k = seg(t, s(16) - .2, s(16) + .3); line(g, [[x - 40, y + 20], [x - 20, y + h + 40], [x + w + 20, y + h + 40], [x + w + 40, y + 20]], { w: 4, seed: 520, k }); for (let i = 0; i < 10; i++) { const u = (t * .8 + hash(i)) % 1; line(g, circPts(x + 20 + hash(i * 3) * (w - 40), y + h + 20 - u * (h + 40), 7, 10), { w: 2, col: '#5f86a6', close: true, seed: 530 + i, a: 1 - u }); } hand(g, 'boil = reset', 880, 1130 - 6, { size: 44, align: 'right' }); }
  fill(g, rectPts(x, y, w, h, 8), 'rgba(207,224,234,.6)'); shade(g, rectPts(x, y, w, h, 8), 'rgba(59,42,31,.06)', 12);
  // dissolved salt as dense dots (more than it "should" hold)
  const dd = seg(t, r(14, .3), r(14, 2.0)); for (let i = 0; i < 160 * dd; i++) { g.fillStyle = 'rgba(80,110,130,.5)'; g.fillRect(x + 10 + hash(i * 1.7) * (w - 20), y + 10 + hash(i * 2.9) * (h - 20), 3, 3); }
  // metal clicker + crystals growing out from it
  const cx = x + w * .3, cy = y + h * .55, flex = t > r(15, .5) && t < r(15, .9) ? 1 : 0; fill(g, circPts(cx, cy, 30, 20, flex ? .7 : 1), '#b8bcc2'); line(g, circPts(cx, cy, 30, 20, flex ? .7 : 1), { w: 3, close: true, seed: 540 });
  if (t > r(15, .5) && t < r(15, 1.6)) hand(g, 'click!', cx, cy - 50, { size: 50, col: P.rust, align: 'center' });
  if (cr > 0) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); for (let i = 0; i < 140; i++) { const a2 = hash(i) * TAU, d = hash(i * 3) * w * cr; const px = cx + Math.cos(a2) * d, py = cy + Math.sin(a2) * d * .6; g.save(); g.translate(px, py); g.rotate(a2); g.fillStyle = '#fdfdfb'; g.fillRect(-12, -2.5, 24, 5); g.restore(); line(g, [[px - 10 * Math.cos(a2), py - 10 * Math.sin(a2)], [px + 10 * Math.cos(a2), py + 10 * Math.sin(a2)]], { w: 2.4, col: 'rgba(59,42,31,.85)', seed: 550 + i, wob: 0 }); } g.restore();
    const gr = g.createRadialGradient(cx, cy, 10, cx, cy, w); gr.addColorStop(0, `rgba(232,133,74,${.35 * cr})`); gr.addColorStop(1, 'rgba(232,133,74,0)'); g.fillStyle = gr; g.fillRect(x - 100, y - 100, w + 200, h + 200); }
  line(g, rectPts(x, y, w, h, 8), { w: 3.4, close: true, seed: 560 }); thermo(780, 880, 180, .1 + .8 * cr, t < s(16) - .2 ? 1 : 0);
  const H0 = t < s(14) - .2 ? { title: 'The click kind', note: 'a different trick' } : t < s(15) - .2 ? { title: 'Overloaded liquid', note: 'more salt dissolved than it normally could hold' } : t < s(16) - .2 ? { title: 'Click: crystals', note: 'crystallising releases stored heat' } : { title: 'Boil to reset', note: 'crystals melt back to liquid' };
  header(g, { ...H0, k: 1 }); g.restore(); }

function signoff(t) { const a = win(t, s(17) - .3, s(19) - .1, .4); if (a <= 0) return; g.save(); g.globalAlpha = a;
  if (t < s(18) - .2) { const k = seg(t, s(17) + .2, s(17) + 1.6); hand(g, 'Good rust.', 540, 640, { size: 180, align: 'center', write: k }); splats(g, 880, 520, seg(t, s(17) + 1.5, s(17) + 2), 7); splats(g, 200, 700, seg(t, s(17) + 1.7, s(17) + 2.2), 13);
    mono(g, 'IRON + AIR · RUSTING ON PURPOSE · FAST', 540, 740, { size: 22, col: P.soft, align: 'center', track: 4, a: seg(t, s(17) + 1.2, s(17) + 1.8) });
    pouch(t, { fill: 1, layers: 5, glow: .7, x: 290, w: 500 }); }
  else { hand(g, 'Did you know', 540, 520, { size: 110, align: 'center' }); hand(g, 'it was rust?', 540, 640, { size: 110, align: 'center', col: P.rust });
    [['yes', 360], ['no', 700]].forEach(([w, x], i) => { const k = seg(t, s(18) + .8 + i * .3, s(18) + 1.3 + i * .3); line(g, circPts(x - 70, 860, 30, 20), { w: 3.4, close: true, seed: 600 + i, k }); hand(g, w, x - 20, 885, { size: 90, a: k }); }); }
  g.restore(); }

function endcard(t) { const t0 = s(19) - .25, a = ss(seg(t, t0, t0 + .5)); if (a <= 0) return; g.save(); g.globalAlpha = a;
  mono(g, 'HOW IT REALLY WORKS · RECIPE CARD', 540, 560, { size: 20, col: P.rust, align: 'center', track: 5 });
  hand(g, 'Follow for more of', 540, 700, { size: 92, align: 'center', write: seg(t, t0 + .1, t0 + .8) }); hand(g, 'how it really works.', 540, 820, { size: 110, align: 'center', write: seg(t, t0 + .5, t0 + 1.3) });
  line(g, [[300, 850], [540, 846], [780, 842]], { w: 3, seed: 610, k: seg(t, t0 + 1.0, t0 + 1.5) });
  hand(g, "A new 'wait, really?' every day.", 540, 930, { size: 50, align: 'center', col: P.soft, w: 500, a: seg(t, t0 + 1.2, t0 + 1.6) });
  mono(g, '@howitreallyworkstudio', 540, 1010, { size: 26, col: P.ink, align: 'center', track: 2, a: seg(t, t0 + 1.4, t0 + 1.8) });
  splats(g, 860, 640, seg(t, t0 + 1.3, t0 + 1.8), 21); g.restore(); }

function stepIndex(t) { if (t < s(5)) return [0, seg(t, s(2), s(5))]; if (t < s(6)) return [1, seg(t, s(5), s(6))]; if (t < s(8)) return [2, seg(t, s(6), s(8))]; if (t < s(11)) return [3, seg(t, s(8), s(11))]; if (t < s(13)) return [4, seg(t, s(11), s(13))]; return [5, seg(t, s(13), s(17))]; }
function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(paper(), 0, 0);
  hook(t); recipe(t); click(t); signoff(t); endcard(t);
  if (t > s(2) - .3 && t < s(17)) { const [i, u] = stepIndex(t); g.save(); g.globalAlpha = seg(t, s(2) - .3, s(2) + .2) * (1 - seg(t, s(17) - .4, s(17))); progress(g, STEPS, i, u); g.restore(); }
  const ph = PH.findLast(p => t >= p.start - .1); if (ph && ph.i < PH.length - 1) { const nx = PH[ph.i + 1].start; caption(g, ph.cap, seg(t, ph.start - .1, ph.start + .12) * (1 - seg(t, nx - .2, nx - .05)), 1290); }
}
window.CUES = [['sparkle', .3], ['pop', .6], ['pop', .9], ['slide', r(1, .3)], ['scribble', r(1, 1.8), r(1, 3.6)], ['slide', s(2) - .3], ['pop', TW[0]], ['pop', TW[1]], ['pop', TW[2]], ['pop', TW[3]], ['pop', TW[4]],
  ['scribble', TW[0], TW[0] + .9], ['whoosh', s(5) - .2], ['snap', r(5, 2.6)], ['whoosh', s(6) - .2], ['chime', r(6, .6), 76], ['whoosh', s(7) - .2], ['whoosh', s(8) - .2], ['scribble', r(8, 1.6), r(8, 2.6)], ['whoosh', s(9) - .2], ['tick', s(9) + .2],
  ['whoosh', s(10) - .2], ['whoosh', s(11) - .2], ['tick', r(11, .5)], ['tick', r(11, 1.0)], ['whoosh', s(12) - .2], ['thud', r(12, .9)], ['slide', s(13) - .3], ['pop', r(14, .4)], ['pop', r(14, 1.6)], ['snap', r(15, .5)], ['sparkle', r(15, .9)],
  ['bubbles', s(16) + .2], ['scribble', s(17) + .2, s(17) + 1.6], ['pop', s(17) + 1.5], ['pop', s(18) + .8], ['pop', s(18) + 1.1], ['scribble', s(19) - .1, s(19) + 1.3]];
window.DUR = TOT;
// loop: blend the frame-0 hook back in over the last 0.5 s (max 40%)
window.seek = t => { scene(t); const lp = seg(t, TOT - .5, TOT); if (lp > 0) { const keep = g.getImageData(0, 0, W, H); scene(0); const f0 = g.getImageData(0, 0, W, H); const k = .3 * ss(lp), A = keep.data, B = f0.data; for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } g.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paper(), 0, 0); pouch(2, { fill: 1, layers: 5, glow: 1, x: 190, y: 980, w: 640, h: 360 });
  mono(g, 'STEP 1 / 5 · THE RECIPE', 90, 360, { size: 26, col: P.rust, track: 5 }); hand(g, 'Hot with', 80, 520, { size: 170 }); hand(g, 'no battery?', 80, 700, { size: 170, col: P.rust }); hand(g, 'it’s just rust', 540, 1480, { size: 70, align: 'center' }); splats(g, 900, 560, 1, 3); };
window.seek(0); window.ready = true; window.READY = true;
