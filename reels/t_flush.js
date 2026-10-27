// t_flush.js: "How a toilet flushes (the siphon)" in template #18 handdrawn "Japan heat wave" (demo101) grammar.
// 1080x1920 Canvas2D, deterministic. Field-sketchbook pages; water levels are computed from one state function.
import { createFB, W, H, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const F = createFB(document.getElementById('c')), g = F.g;
const R = ramp;

// ---------- pages: [start, end, page no] ; ink fades off before each change ----------
const PG = [[0, s(2) - .05, 1], [s(2) - .05, s(6) - .1, 2], [s(6) - .1, s(13) - .1, 3], [s(13) - .1, s(15) - .1, 4], [s(15) - .1, s(16) - .1, 5], [s(16) - .1, s(18) - .1, 6], [s(18) - .1, TL.total + 1, 7]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
const inkA = (t, p) => p[2] === 1 ? 1 : ss(R(t, p[0], .35));

// ---------- toilet geometry (base units, about x 145..910, y 420..1400) ----------
const BODY = [[150, 815], [612, 815], [770, 905], [775, 1400], [300, 1400], [322, 1262], [232, 1162], [166, 1012], [146, 892]];
const BOWL_L = [[200, 832], [214, 905], [244, 985], [290, 1062], [340, 1118], [378, 1146]];          // front wall (rim -> bottom)
const BOWL_B = [[440, 1106], [478, 1052], [518, 982], [548, 908], [562, 832]];                       // back wall (outlet -> rim)
const BOWL = BOWL_L.concat([[405, 1160]], BOWL_B);
const CL = [[395, 1132], [470, 1172], [542, 1150], [592, 1090], [622, 1028], [652, 1000], [690, 1018], [716, 1078], [726, 1180], [726, 1300], [726, 1400]];
const HW = 30, HUMP = 5, WEIR = 1000 + HW;                       // pipe half-width; centreline index of the hump; inner bottom of the hump = rest level
const TANK = [600, 452, 900, 790];
const dense = F.dense, walk = F.walk;
const CLd = dense(CL, 6), humpI = CLd.findIndex(p => p[0] >= 652);
const cum = P => { const L = [0]; for (let i = 1; i < P.length; i++) L[i] = L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
const sub = (P, a, b) => { const L = cum(P), T = L[L.length - 1], A = a * T, B = b * T, o = []; for (let i = 0; i < P.length; i++) { if (L[i] >= A && L[i] <= B) o.push(P[i]); } if (!o.length) return o; return o; };
const offs = (P, d) => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * d, p[1] + dx / l * d]; });
const UP = CLd.slice(0, humpI + 1), DOWN = CLd.slice(humpI);
const WALL_A = offs(CLd, HW), WALL_B = offs(CLd, -HW);
const stroke = (P, w, style, a = 1) => { if (P.length < 2) return; g.save(); g.globalAlpha = F.S.A * a; g.lineCap = 'butt'; g.lineJoin = 'round'; g.strokeStyle = style; g.lineWidth = w; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); };

// st: {k draw-on 0..1, L bowl level y, up top-of-water in the rising leg, dA,dB down-leg filled span, tank y, flap 0..1, rim 0..1, t}
function toilet(st) {
  const k = st.k ?? 1, t = st.t || 0;
  // ceramic body: light graphite hatching (like the demo's shaded Fuji flank) then outline
  F.hatch(BODY, 'graph', { k: ss(R(k, .25, .5)), alpha: .35, dir: 'up' });
  const pa = ss(R(k, .08, .25)); stroke(CLd, HW * 2 + 2, F.paperPat(), pa);                                             // hollow trapway
  g.save(); F.path(BOWL.concat([[562, 815], [200, 815]])); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * pa; g.fill(); g.restore();
  // tank interior
  const [tx0, ty0, tx1, ty1] = TANK; g.save(); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * ss(R(k, .5, .2)); g.fillRect(tx0, ty0, tx1 - tx0, ty1 - ty0); g.restore();
  // ---- water ----
  const wa = ss(R(k, .55, .3));
  if (wa > 0) {
    const tank = st.tank ?? 520; F.hatch([[tx0 + 4, tank], [tx1 - 4, tank], [tx1 - 4, ty1 - 3], [tx0 + 4, ty1 - 3]], 'navyL', { alpha: .8 * wa });
    F.pencil([[tx0 + 6, tank], [tx1 - 6, tank]], { col: C.navy, w: 1.6, alpha: .8 * wa, wob: .8, seed: 3 });
    const L = st.L ?? WEIR; g.save(); F.path(BOWL); g.clip(); g.globalAlpha = F.S.A * wa; g.fillStyle = F.pat('navy'); g.fillRect(150, L, 450, 400); g.restore();
    g.save(); F.path(BOWL); g.clip(); F.pencil([[180, L + Math.sin(t * 5) * 2], [580, L - Math.sin(t * 5) * 2]], { col: C.navy, w: 2, alpha: wa, wob: 1, seed: 9 }); g.restore();
    const up = st.up ?? L; g.save(); g.beginPath(); g.rect(300, up, 400, 400); g.clip(); stroke(UP, HW * 2 - 4, F.pat('navy'), wa); g.restore();
    const dA = st.dA ?? 0, dB = st.dB ?? 0; if (dB > dA) stroke(sub(DOWN, dA, dB), HW * 2 - 4, F.pat('navy'), wa);
  }
  // ---- line work (drafting order: body, bowl, pipe, tank, fittings) ----
  const ow = { col: C.ink, w: 2.4 };
  F.pencil(BODY, { ...ow, close: true, draw: ss(R(k, 0, .45)), seed: 1 });
  F.pencil(BOWL_L, { ...ow, draw: ss(R(k, .1, .3)), seed: 2 }); F.pencil(BOWL_B, { ...ow, draw: ss(R(k, .12, .3)), seed: 4 });
  F.pencil([[140, 812], [618, 812]], { ...ow, w: 3, draw: ss(R(k, .05, .3)), seed: 5 });                 // seat/rim line
  F.pencil(WALL_A, { ...ow, w: 2.1, draw: ss(R(k, .2, .4)), seed: 6 }); F.pencil(WALL_B, { ...ow, w: 2.1, draw: ss(R(k, .22, .4)), seed: 7 });
  F.rect(tx0, ty0, tx1 - tx0, ty1 - ty0, { ...ow, draw: ss(R(k, .3, .35)), seed: 8 });
  F.rect(tx0 - 14, ty0 - 30, tx1 - tx0 + 28, 30, { ...ow, draw: ss(R(k, .34, .3)), seed: 10 });         // lid
  // rim channel with holes
  const rk = ss(R(k, .45, .3)); F.pencil([[205, 850], [556, 850]], { col: C.graph, w: 1.6, draw: rk, seed: 11 });
  for (let i = 0; i < 7; i++) { const x = 225 + i * 52; if (rk > i / 7) F.circ(x, 842, 4, { col: C.graph, w: 1.4, seed: 20 + i }); }
  // flush valve: drop pipe from the tank into the rim
  F.pencil([[660, 790], [640, 832], [560, 842]], { col: C.graph, w: 1.8, draw: rk, seed: 12 }); F.pencil([[700, 790], [690, 852], [560, 856]], { col: C.graph, w: 1.8, draw: rk, seed: 13 });
  // flapper (hinged at its left edge), chain, handle
  const fl = st.flap || 0, fa = -fl * 1.05, hx = 652, hy = 786; const fp = [[hx, hy], [hx + Math.cos(fa) * 58, hy + Math.sin(fa) * 58]];
  F.pencil(fp, { col: C.red, w: 5, alpha: rk, wob: .3, seed: 14 }); F.pencil([fp[1], [640, 520 - fl * 22]], { col: C.graph, w: 1.2, alpha: rk * .9, dash: [4, 5] });
  F.pencil([[640, 520 - fl * 22], [598, 500]], { col: C.ink, w: 3, alpha: rk }); F.pencil([[598, 500], [566, 492 + fl * 18]], { col: C.ink, w: 6, alpha: rk });
  // overflow tube, fill valve, float and refill tube
  F.rect(718, 560, 20, 226, { col: C.graph, w: 1.6, draw: rk, seed: 15 });
  F.rect(846, 520, 22, 266, { col: C.graph, w: 1.6, draw: rk, seed: 16 });
  const fy = clamp((st.tank ?? 520) - 4, 500, 760), fx = 800; F.pencil([[857, 528], [fx, fy]], { col: C.graph, w: 1.6, alpha: rk });
  F.hatch([[fx - 22, fy - 18], [fx + 22, fy - 18], [fx + 22, fy + 18], [fx - 22, fy + 18]], 'ochre', { alpha: .9 * rk }); F.rect(fx - 22, fy - 18, 44, 36, { col: C.ink, w: 1.8, alpha: rk, seed: 17 });
  F.pencil([[857, 520], [857, 498], [790, 492], [732, 520], [728, 556]], { col: C.graph, w: 1.4, draw: rk, seed: 18 });
  // floor
  F.pencil([[90, 1402], [990, 1402]], { col: C.ink, w: 1.6, draw: ss(R(k, 0, .5)), seed: 19 });
  // flow arrows from tank into rim and down the bowl walls
  if (st.rim > 0) { const a = st.rim; F.arrow([[680, 760], [670, 836], [600, 848]], { draw: a, w: 2.4, seed: 30 }); for (let i = 0; i < 6; i++) { const x = 238 + i * 52, u = (t * 1.6 + i * .17) % 1; F.pencil([[x, 856 + u * 40], [x - 4, 856 + u * 40 + 26]], { col: C.navy, w: 2.2, alpha: a * (1 - u) }); } }
}
const flowArrows = (t, a, P, n = 4, col = C.red) => { if (a <= 0) return; for (let i = 0; i < n; i++) { const u = (t * .45 + i / n) % 1; const seg = sub(P, Math.max(0, u - .09), u); if (seg.length > 2) F.arrow(seg, { col, w: 3, alpha: a * Math.sin(u * Math.PI), wob: .2 }); } };
// annotation with leader in Kalam (the demo's small handwritten notes)
const note = (txt, x, y, tx, ty, k, o = {}) => { if (k <= 0) return; const { col = C.ink, size = 36, align = 'left' } = o; F.pencil([[x + (align === 'left' ? -10 : 10), y - size * .3], [tx, ty]], { col: C.graph, w: 1.2, draw: ss(clamp(k * 2)), wob: .3 }); F.txt(txt, x, y, { size, f: 'hand', col, write: ss(R(k, .3, .7)), align }); };

// ---------- water state machine for the flush (absolute time) ----------
function water(t) {
  const st = { L: WEIR, up: WEIR, dA: 0, dB: 0, tank: 520, flap: 0, rim: 0, t };
  if (t < s(6)) return st;
  const press = s(6) + 1.0;
  st.flap = ss(R(t, press, .4)) * (1 - ss(R(t, s(9) + 1.4, .6)));
  const drain = R(t, press + .3, s(9) + 1.4 - press - .3); st.tank = lerp(520, 762, ss(drain));
  st.rim = ss(R(t, press + .3, .4)) * (1 - ss(R(t, s(9) + 1.2, .6)));
  const rise = ss(R(t, s(7) + .2, s(8) + 1.2 - s(7) - .2)); st.L = lerp(WEIR, 905, rise); st.up = st.L;
  if (st.L < 1000 - HW + 2) st.dB = clamp((1000 - HW - st.L) / 50) * .12;       // a trickle spills over the hump
  if (t > s(9)) { const f = ss(R(t, s(9) + .2, 1.6)); st.up = lerp(st.L, 0, f); st.dB = lerp(st.dB, 1, f); }
  if (t > s(10) + .4) { const d = ss(R(t, s(10) + .4, s(12) + .3 - s(10) - .4)); st.L = lerp(905, 1142, d); st.up = 0; st.dB = 1; }
  if (t > s(12) + .3) { const a = ss(R(t, s(12) + .3, 1.6)); st.up = lerp(900, 1150, a); st.dA = a; st.dB = 1; st.L = lerp(1142, 1150, a); }
  if (t > s(13)) { const r = ss(R(t, s(13) + .4, e(14) - s(13))); st.tank = lerp(762, 520, r); st.flap = 0; st.rim = 0; st.dA = 0; st.dB = 0; const b = ss(R(t, s(13) + 1.2, s(14) + 1.8 - s(13) - 1.2)); st.L = lerp(1150, WEIR, b); st.up = st.L; }
  return st;
}

// ---------- pages ----------
const TOP = 160, HEAD = 268, CAPY = 1545;
function caption(t, x = 80, y = CAPY, o = {}) { if (PREV) return; let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci < 0) return; const p = pageAt(t); if (PH[ci].start < p[0] - .1) return; F.body(PH[ci].cap, x, y, o.maxW || 920, t - PH[ci].start + .05, o); }
function chapter(t, p, label, head, t0) { F.label(label, 80, TOP, t - t0); F.head(head, 76, HEAD, t - t0 - .35); }

function page1(t) {
  F.txt('A FIELD SKETCHBOOK  ·  PLUMBING NOTES', 80, TOP, { size: 25, f: 'mono', wt: 700, ls: 3, col: '#45454c', alpha: .9 });
  F.line(80, TOP + 16, 760, TOP + 16, { w: 1, alpha: .5, wob: .3 });
  F.txt('The Flush', 74, 330, { size: 150, f: 'hand', rot: -.015, write: t < .02 ? 1 : 1 });
  F.line(84, 372, 640, 366, { col: C.red, w: 2.6, draw: ss(R(t, .2, .8)), wob: .6 });
  F.seal('FLUSH', 830, 262, ss(R(t, .5, .35)), { size: 38, f: 'mono', fs: 40 });
  caption(t, 80, 466, { size: 50 });
  // big red hatched circle behind the drawing (the demo's sun), then the toilet draws on in front
  const cx = 600, cy = 1220, r = 310 * eo(R(t, -.6, 1.2)); const ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2; ring.push([cx + Math.cos(a) * r * (1 + Math.sin(a * 5) * .01), cy + Math.sin(a) * r]); }
  if (r > 5) { F.hatch(ring, 'red', { alpha: .75 }); F.pencil(ring, { col: C.red, w: 2.2, seed: 2 }); }
  g.save(); g.translate(190, 610); g.scale(.75, .75); const st = { ...water(0), k: ss(R(t, -.2, 2.6)), t };
  if (t > s(1)) { const pour = ss(R(t, s(1) + 1.2, 2.2)); st.L = lerp(WEIR, 915, pour) ; st.up = st.L; if (t > s(1) + 2.6) { const f = ss(R(t, s(1) + 2.6, 1.2)); st.up = lerp(st.L, 0, f); st.dB = f; st.L = lerp(915, 1100, ss(R(t, s(1) + 3.2, 1.6))); } }
  toilet(st); g.restore();
  // the bucket: tips over the bowl and pours
  if (t > s(1) - .2) { const k = ss(R(t, s(1) - .2, .7)), tip = ss(R(t, s(1) + .8, .6)) * (1 - ss(R(t, s(2) - .6, .4)) * .0);
    g.save(); g.translate(lerp(-160, 250, k), 1010); g.rotate(tip * 1.25); const bk = [[-70, -90], [70, -90], [52, 60], [-52, 60]];
    F.hatch([[-64, -40 + tip * 40], [64, -40 + tip * 30], [50, 56], [-50, 56]], 'navy', { alpha: .85 * (1 - ss(R(t, s(1) + 2.0, 1.2)) * .7) }); g.save(); F.path(bk); g.globalAlpha = .0; g.restore();
    F.pencil(bk, { close: true, w: 2.6, seed: 31 }); F.pencil([[-70, -90], [-40, -150], [40, -150], [70, -90]], { w: 1.8, col: C.graph, seed: 32 }); g.restore();
    if (tip > .5) { const a = ss(R(t, s(1) + 1.1, .3)) * (1 - ss(R(t, s(1) + 3.6, .5))); for (let i = 0; i < 7; i++) { const u = (t * 2.2 + i / 7) % 1; F.pencil([[350 + i * 4, 1060 + u * 170], [342 + i * 5, 1080 + u * 170]], { col: C.navy, w: 3, alpha: a * (1 - u * .5) }); } }
    F.box(80, 640, 330, 160, ss(R(t, s(1) + 1.6, .6))); F.txt('handles used', 106, 692, { size: 24, f: 'mono', col: '#5d5d62', type: (t - s(1) - 1.9) * 30 }); F.txt('0', 106, 772, { size: 72, f: 'hand', col: C.red, write: ss(R(t, s(1) + 2.2, .4)) });
    F.txt('★', 790, 596, { size: 1, alpha: 0 }); F.txt('just a fast pour', 160, 764, { size: 22, f: 'hand', col: '#5d5d62', write: ss(R(t, s(1) + 2.6, .8)) }); }
}

function page2(t, p) {
  chapter(t, p, 'NO. 01 — THE TRAPWAY  ·  fig. a', 'The hidden pipe.', p[0]);
  const k = ss(R(t, s(2) + .3, 3.0)); const st = { ...water(t), k, t };
  if (t < s(4)) { st.L = 1220; st.up = 1220; }
  else { const f = ss(R(t, s(4) + .2, 2.0)); st.L = lerp(1220, WEIR, f); st.up = st.L; }
  g.save(); g.translate(14, 0); toilet(st);
  // highlight the path: red arrow along the trapway
  if (t > s(3) - .2) F.arrow(CLd.slice(0, CLd.length - 20), { col: C.red, w: 3.4, draw: ss(R(t, s(3), 2.4)) * (1 - ss(R(t, s(4) + .2, .4))), alpha: .9, wob: .2 });
  note('trapway', 800, 1180, 735, 1180, R(t, s(2) + 2.2, .8), { size: 40 });
  note('the hump', 780, 960, 668, 990, R(t, s(3) + .9, .8), { col: C.red, size: 40 });
  note('to the drain', 790, 1340, 740, 1350, R(t, s(3) + 2.0, .8), { size: 34 });
  // rest level: dashed line through bowl and hump
  if (t > s(4) + 1.6) { const a = ss(R(t, s(4) + 1.6, .6)); F.pencil([[180, WEIR], [700, WEIR]], { col: C.red, w: 1.6, dash: [10, 8], draw: a, wob: .2 }); note('rest level = top of the hump', 110, 1250, 300, WEIR + 4, R(t, s(4) + 1.9, .8), { col: C.red, size: 32 }); }
  // sewer gas squiggles rise up the drain and stop at the water
  if (t > s(5) + .5) { const a = ss(R(t, s(5) + .5, .5)); for (let i = 0; i < 3; i++) { const u = (t * .35 + i / 3) % 1; F.squig(712 + i * 13, 1390 - u * 200, 70, t + i, { col: C.ochre, alpha: a * Math.sin(u * Math.PI), amp: 6 }); }
    F.pencil([[690, 1100], [762, 1150]], { col: C.red, w: 4, draw: ss(R(t, s(5) + 1.2, .3)) }); F.pencil([[762, 1100], [690, 1150]], { col: C.red, w: 4, draw: ss(R(t, s(5) + 1.4, .3)) });
    note('sewer gas', 800, 1290, 745, 1250, R(t, s(5) + .8, .8), { size: 34, col: '#8a6a22' }); }
  g.restore();
  if (t > s(5) - .1) { F.box(90, 400, 380, 170, ss(R(t, s(5), .6))); F.seal('SEAL', 150, 486, ss(R(t, s(5) + .3, .3)), { size: 50, rot: -.08, round: true, f: 'mono', fs: 21 }); F.txt('water seal', 210, 470, { size: 40, f: 'hand', col: C.red, write: ss(R(t, s(5) + .5, .6)) }); }
  caption(t);
}

function page3(t, p) {
  const sw = s(10) - .2; const a1 = 1 - ss(R(t, sw, .3)), a2 = ss(R(t, sw + .35, .2));
  if (a1 > 0) { F.alpha(F.S.A * a1); chapter(t, p, 'NO. 02 — THE FLUSH  ·  fig. b', 'Too fast to spill over.', p[0]); F.alpha(BASE); }
  if (a2 > 0) { chapter(t, p, 'NO. 03 — THE SIPHON  ·  fig. c', 'A full pipe pulls.', sw + .3); }
  const st = { ...water(t), k: ss(R(t, p[0] + .2, 1.6)) };
  g.save(); g.translate(14, 0); toilet(st);
  note('flapper', 470, 700, 650, 770, R(t, s(6) + .4, .8) * (1 - R(t, s(7) + 2, .4)), { col: C.red, size: 38 });
  note('holes under the rim', 150, 760, 330, 842, R(t, s(7) + .8, .8) * (1 - R(t, s(9), .4)), { size: 34 });
  // level gauge (demo's rain-gauge scale): bowl level vs the hump
  if (t > s(8) - .2 && t < s(10)) { const a = ss(R(t, s(8) - .2, .5)) * (1 - ss(R(t, s(10) - .4, .3))); F.pencil([[180, WEIR], [700, WEIR]], { col: C.red, w: 1.5, dash: [10, 8], alpha: a });
    F.txt('hump', 120, WEIR + 10, { size: 30, f: 'hand', col: C.red, alpha: a }); const lv = ((WEIR - st.L) / 40 * 2.54 / 2.54).toFixed(1); }
  if (t > s(9) + .2 && t < s(12) + .3) flowArrows(t, ss(R(t, s(9) + .4, .5)) * (1 - ss(R(t, s(12), .3))), CLd, 5);
  if (t > s(11)) { const a = ss(R(t, s(11), .4)) * (1 - ss(R(t, s(12) + .3, .3))); F.arrow([[380, 960], [380, 1080]], { col: C.red, w: 3.4, draw: a }); F.arrow([[470, 960], [455, 1060]], { col: C.red, w: 3.4, draw: a }); }
  // gurgle: air bubbles climb into the trap, the siphon breaks
  if (t > s(12)) { const a = ss(R(t, s(12), .3)) * (1 - ss(R(t, s(13) - .5, .4))); for (let i = 0; i < 9; i++) { const u = (t * .9 + i / 9) % 1; const P = UP[Math.floor((1 - u) * (UP.length - 1))]; if (t > s(12) + .2) F.circ(P[0] + Math.sin(i * 3 + t * 4) * 10, P[1], 5 + hash(i) * 6, { col: C.navy, w: 1.6, alpha: a, seed: i }); }
    F.txt('gurgle!', 300, 1290, { size: 64, f: 'hand', col: C.red, rot: -.08, write: ss(R(t, s(12) + .7, .5)) * a }); }
  g.restore();
  if (t > s(10) + .2 && t < s(13)) { const a = ss(R(t, s(10) + .2, .5)) * (1 - ss(R(t, s(13) - .5, .3))); F.box(80, 390, 400, 170, a); F.alpha(F.S.A * a);
    F.txt(t < s(12) + .3 ? 'pipe: FULL' : 'pipe: AIR IN', 108, 450, { size: 30, f: 'mono', wt: 700, col: t < s(12) + .3 ? C.navy : C.red });
    F.txt(t < s(12) + .3 ? 'siphon running' : 'siphon broken', 108, 520, { size: 40, f: 'hand', col: t < s(12) + .3 ? C.ink : C.red }); F.alpha(BASE); }
  if (t > s(12) + 1.2) F.seal('AIR', 430, 400, ss(R(t, s(12) + 1.2, .3)), { size: 46, round: true, f: 'mono', fs: 24 });
  caption(t);
}

function page4(t, p) {
  chapter(t, p, 'NO. 04 — REFILL  ·  fig. d', 'The seal comes back.', p[0]);
  const st = { ...water(t), k: ss(R(t, p[0] + .2, 1.5)) };
  g.save(); g.translate(14, 0); toilet(st);
  const fl = ss(R(t, s(13) + .4, 2.5)) * (1 - ss(R(t, e(14), .4)));
  flowArrows(t, fl, [[857, 470], [857, 498], [790, 492], [732, 520], [728, 600]], 2, C.navy);
  note('float', 930, 700, 822, clamp(st.tank, 500, 760), R(t, s(13) + .6, .8), { col: C.red, size: 34 });
  note('fill valve', 880, 420 - 20, 858, 520, R(t, s(13) + 1.3, .8), { size: 30 });
  note('refill tube', 690, 395, 760, 494, R(t, s(14) + .1, .8), { size: 30 });
  g.restore();
  // tank / bowl counters (demo's measurement boxes)
  const lv = Math.round(clamp((762 - st.tank) / (762 - 520)) * 100), bl = Math.round(clamp((1150 - st.L) / (1150 - WEIR)) * 100);
  F.box(80, 360, 440, 260, ss(R(t, p[0] + .6, .6))); F.txt('TANK', 112, 412, { size: 24, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.txt(lv + '%', 112, 500, { size: 84, f: 'hand', col: C.navy });
  F.txt('BOWL SEAL', 300, 412, { size: 24, f: 'mono', wt: 700, ls: 2, col: '#5d5d62' }); F.txt(bl + '%', 300, 500, { size: 84, f: 'hand', col: bl >= 99 ? C.red : C.navy });
  if (t > s(14) + 1.6) { F.seal('SEAL', 470, 580, ss(R(t, s(14) + 1.6, .3)), { size: 44, round: true, f: 'mono', fs: 19 }); F.txt('sealed again', 112, 584, { size: 40, f: 'hand', col: C.red, write: ss(R(t, s(14) + 1.8, .6)) }); }
  caption(t);
}

function page5(t, p) {
  chapter(t, p, 'NO. 05 — HOW MUCH  ·  US', 'Gallons per flush.', p[0]);
  // two measuring cylinders, the demo's rain gauge chart
  const base = 1340, top = 520, gal = v => base - v / 4 * (base - top);
  const cyl = (x, v, kind, lab, sub, t0, col) => { const k = ss(R(t, t0, .8)); const w = 210; F.pencil([[x, top - 20], [x, base], [x + w, base], [x + w, top - 20]], { w: 2.2, draw: k, seed: x }); F.pencil([[x - 6, top - 20], [x + w + 6, top - 20]], { w: 1.4, col: C.graph, draw: k });
    const f = ss(R(t, t0 + .5, 1.4)); const y = lerp(base, gal(v), f); F.hatch([[x + 4, y], [x + w - 4, y], [x + w - 4, base - 3], [x + 4, base - 3]], kind, { alpha: .85 });
    F.txt((v * f).toFixed(1), x + w / 2, top - 70, { size: 96, f: 'hand', col, align: 'center', alpha: ss(R(t, t0 + .4, .3)) }); F.txt('gal', x + w / 2 + 100, top - 70, { size: 34, f: 'hand', col, alpha: ss(R(t, t0 + .4, .3)) });
    F.txt(lab, x + w / 2, base + 60, { size: 40, f: 'hand', align: 'center', write: ss(R(t, t0 + .8, .6)) }); F.txt(sub, x + w / 2, base + 102, { size: 21, f: 'mono', align: 'center', col: '#5d5d62', type: (t - t0 - 1.2) * 34 }); };
  // scale
  const sk = ss(R(t, p[0] + .3, .8)); F.pencil([[930, top - 20], [930, base]], { w: 1.4, col: C.graph, draw: sk }); for (let v = 0; v <= 4; v++) { F.line(930, gal(v), 946, gal(v), { w: 1.2, col: C.graph, alpha: sk }); F.txt(String(v), 958, gal(v) + 8, { size: 24, f: 'mono', col: '#5d5d62', alpha: sk }); }
  cyl(560, 1.6, 'red', 'today (max)', 'US federal limit', s(15) + .2, C.red);
  cyl(200, 3.5, 'navy', 'older toilets', 'often 3.5 or more', s(15) + 3.2, C.navy);
  if (t > s(15) + 1.6) { const a = ss(R(t, s(15) + 1.6, .6)); F.pencil([[150, gal(1.6)], [820, gal(1.6)]], { col: C.red, w: 1.5, dash: [10, 8], draw: a }); }
  F.txt('Energy Policy Act, 1992', 80, 1530 + 8, { size: 24, f: 'mono', col: '#5d5d62', type: (t - s(15) - 1.4) * 30 });
  caption(t, 80, CAPY + 70, { size: 42 });
}

function page6(t, p) {
  chapter(t, p, 'NO. 06 — PULL OR PUSH  ·  fig. e', 'Not every toilet pulls.', p[0]);
  // left: siphonic (mini). right: washdown (wide, short trap; water pushed over the weir)
  g.save(); g.translate(20, 330); g.scale(.5, .5); const st = { ...water(0), k: ss(R(t, p[0] + .3, 1.5)), t }; toilet(st); flowArrows(t, ss(R(t, p[0] + 1.5, .5)), CLd, 3); g.restore();
  F.txt('siphonic', 80, 1180, { size: 54, f: 'hand', write: ss(R(t, p[0] + 1.0, .6)) }); F.txt('PULLS · common in', 80, 1225, { size: 21, f: 'mono', col: '#5d5d62', type: (t - p[0] - 1.5) * 34 });
  // washdown sketch
  const k2 = ss(R(t, s(16) + 1.2, 1.4)); g.save(); g.translate(600, 560); g.scale(.95, .95);
  const body = [[0, 40], [380, 40], [400, 110], [392, 640], [110, 640], [130, 520], [40, 400], [10, 200]];
  const fw = [[22, 52], [42, 200], [92, 330], [150, 400]], bot = [[150, 400], [232, 402], [262, 382]], bw = [[332, 382], [336, 300], [342, 52]];
  const bowl = fw.concat(bot, bw), trL = [[262, 382], [264, 470], [302, 520], [302, 640]], trR = [[332, 382], [342, 452], [372, 502], [372, 640]];
  F.hatch(body, 'graph', { k: ss(R(k2, .4, .6)), alpha: .3 });
  g.save(); F.path(bowl); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A; g.fill(); F.path(trL.concat(trR.slice().reverse())); g.fill(); g.restore();
  g.save(); F.path(bowl); g.clip(); g.globalAlpha = F.S.A * ss(R(k2, .5, .5)); g.fillStyle = F.pat('navy'); g.fillRect(0, 352, 400, 100); g.restore();
  F.pencil(body, { close: true, w: 2.2, draw: k2, seed: 3 }); F.pencil([[-8, 38], [388, 38]], { w: 3, draw: k2 });
  F.pencil(fw.concat(bot), { w: 2.2, draw: k2, seed: 4 }); F.pencil(bw.slice().reverse(), { w: 2.2, draw: k2, seed: 5 }); F.pencil(trL, { w: 2, draw: k2, seed: 6 }); F.pencil(trR, { w: 2, draw: k2, seed: 7 });
  F.pencil([[-30, 642], [440, 642]], { w: 1.4, draw: k2 });
  if (t > s(16) + 2.4) F.arrow([[60, 90], [82, 240], [160, 350], [282, 392], [310, 480], [338, 620]], { col: C.red, w: 3.4, draw: ss(R(t, s(16) + 2.5, 1.2)) });
  g.restore();
  F.txt('N. America', 80, 1255, { size: 21, f: 'mono', col: '#5d5d62', type: (t - p[0] - 2.0) * 34 }); F.txt('washdown', 600, 1180, { size: 54, f: 'hand', write: ss(R(t, s(16) + 2.0, .6)) }); F.txt('PUSHES · common outside', 600, 1225, { size: 21, f: 'mono', col: '#5d5d62', type: (t - s(16) - 2.4) * 34 }); F.txt('the Americas', 600, 1255, { size: 21, f: 'mono', col: '#5d5d62', type: (t - s(16) - 3.3) * 34 });
  // the question, tally boxes like the demo's day counters
  if (t > s(17) - .1) { const k = ss(R(t, s(17) - .1, .5)); [['puller', 120], ['pusher', 590]].forEach(([w, x], i) => { F.box(x, 1400, 360, 110, ss(R(t, s(17) + i * .3, .6))); F.rect(x + 30, 1430, 50, 50, { w: 2.4, col: C.red, draw: ss(R(t, s(17) + .2 + i * .3, .5)) }); F.txt(w + '?', x + 110, 1478, { size: 54, f: 'hand', col: C.red, write: ss(R(t, s(17) + .4 + i * .3, .6)) }); }); }
  caption(t, 80, CAPY + 60, { size: 42 });
}

function page7(t, p) {
  const t0 = p[0];
  F.body('Siphons **pull.** Washdowns **push.**', 540, 520, 940, t - t0, { size: 50, align: 'center', cps: 40 });
  F.txt('Follow for more of', 540, 700, { size: 92, f: 'hand', align: 'center', write: ss(R(t, t0 + .15, .6)) });
  F.txt('how it really works.', 540, 810, { size: 92, f: 'hand', align: 'center', col: C.red, write: ss(R(t, t0 + .6, .7)) });
  F.txt('@howitreallyworkstudio', 540, 900, { size: 30, f: 'mono', align: 'center', col: '#5d5d62', type: (t - t0 - 1.5) * 34 });
  F.seal('END', 880, 1060, ss(R(t, t0 + 1.4, .3)), { size: 54, round: true, f: 'mono', fs: 28 });
  // setting half-disc on a horizon (demo end page), now a water drop
  const k = ss(R(t, t0 + .2, 1.2)); const y0 = 1260, P = []; for (let i = 0; i <= 30; i++) { const a = Math.PI + i / 30 * Math.PI; P.push([540 + Math.cos(a) * 120, y0 + Math.sin(a) * 120 * k]); }
  if (k > .05) { F.hatch(P, 'red', { alpha: .75 }); F.pencil(P, { col: C.red, w: 2.2 }); } F.line(260, y0, 820, y0, { w: 1.6, draw: ss(R(t, t0, .8)) }); for (let i = 1; i < 4; i++) F.line(420 + i * 20, y0 + i * 14, 660 - i * 20, y0 + i * 14, { w: 1, col: C.redL, alpha: .6 * k });
  F.txt('SOURCES', 80, 1520, { size: 20, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', type: (t - t0 - .6) * 40 });
  ['Wikipedia: Flush toilet; Low-flush toilet', 'US EPA WaterSense toilet documents', 'Explain That Stuff: How toilets work', 'Plumbing guides on bucket flushing'].forEach((l, i) => F.txt(l, 80, 1560 + i * 32, { size: 20, f: 'mono', col: '#6a6a6e', type: (t - t0 - .9 - i * .3) * 50 }));
}

// bottom margin device (the demo's thin timeline strips): the flush cycle with a red marker riding along in time
const CYC = [['REST', s(2)], ['FLUSH', s(6)], ['FULL PIPE', s(9)], ['SIPHON', s(10)], ['GURGLE', s(12)], ['REFILL', s(13)], ['SEALED', s(14) + 1.6]];
function cycleStrip(t, a) { if (a <= 0) return; F.alpha(a); const x0 = 90, x1 = 990, y = 1772, n = CYC.length;
  F.txt('THE FLUSH CYCLE', x0, y - 46, { size: 21, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.line(x0, y, x1, y, { w: 1.4, col: C.graph, wob: .3 });
  let k = 0; CYC.forEach(([, t0], i) => { if (t >= t0) k = i; });
  CYC.forEach(([lab], i) => { const x = lerp(x0, x1, i / (n - 1)); F.line(x, y - 9, x, y + 9, { w: 1.4, col: C.graph, wob: .2 }); F.txt(lab, x, y + 42, { size: 26, f: 'hand', align: 'center', col: i === k ? C.red : '#6a6a70' }); });
  const nx = k < n - 1 ? CYC[k + 1][1] : CYC[k][1] + 1, u = k < n - 1 ? clamp((t - CYC[k][1]) / (nx - CYC[k][1])) : 0, mx = lerp(lerp(x0, x1, k / (n - 1)), lerp(x0, x1, Math.min(k + 1, n - 1) / (n - 1)), u);
  F.hatch([[mx - 13, y - 34], [mx + 13, y - 34], [mx, y - 12]], 'red', { alpha: 1 }); F.pencil([[mx - 13, y - 34], [mx + 13, y - 34], [mx, y - 12]], { close: true, col: C.red, w: 1.8, wob: .3 }); F.alpha(1); }
let BASE = 1, PREV = false;
const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6, 7: page7 };

function scene(t) {
  F.begin(); const p = pageAt(t); F.footer(p[2]);
  const pi = PG.indexOf(p); if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; BASE = 1 - ss(R(t, p[0], .35)); F.alpha(BASE); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01), q); PREV = false; F.alpha(1); }
  BASE = inkA(t, p); F.alpha(BASE); PAGES[p[2]](t, p); F.alpha(1); BASE = 1;
  if (p[2] >= 2 && p[2] <= 4) cycleStrip(t, p[2] === 2 ? ss(R(t, p[0] + .3, .5)) : p[2] === 4 ? 1 - ss(R(t, p[1] - .3, .25)) : 1);
  // end: the sheet darkens at the edges like the demo's last page
  if (t > s(18)) { const a = ss(R(t, s(18) + .5, 3)) * .28; const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(40,30,15,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
}
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, .9 + t / .4 * .1) * Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.save(); g.globalAlpha = 1 - fade; g.fillStyle = C.dark; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
