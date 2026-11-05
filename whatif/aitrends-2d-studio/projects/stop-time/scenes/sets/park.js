// sets/park.js — ep 3 "What If You Trained Every Day for 3 Years?": THE 10 KM RUNNING ROUTE along the river.
//   const P = park(g, t, cam, { season: 'spring'|'summer'|'autumn'|'winter', mood: 'dawn'|'day'|'dusk'|'night',
//                               rain: 0..1, snow: 0..1 (winter default 0.6), puddles: bool (default rain > 0),
//                               km: 1..10 (the marker at pos.markerX; markers repeat every pos.kmStep, numbered on from there),
//                               finish: 0|1 (toilet-paper finish line on two posts at pos.finishX), tape: 0..1 (ribbon breaks),
//                               sign: bool (the "10 km (6.2 mi)" route board), bridge: bool (default true), fountain, bench });
//   Draw BEFORE characters (runners on P.GY, the path). Everything along the path tiles with the camera, so long running pans
//   never run out of park (trees, lamps, km markers, bins).
//   parkFg(g, t, cam, { season, rain, snow })   blurred foreground grass/branches + the weather (rain streaks, snowflakes,
//       falling leaves in autumn, blossom petals in spring). Draw AFTER characters.
//   kmMarker(g, x, gy, n, o)   a stone km post with a gold "KM n" plaque
//   finishLine(g, t, { a: [x, y], b: [x, y], tape: 0..1, roll: 'a'|'b'|null })   a toilet-paper ribbon (perforations, sag, flutter);
//       tape 0..1 tears it in the middle and the two ends fall away. Use it with Dev holding one end.
//   bike(g, t, { x, gy, s, facing, speed, rider: 'MINA', expr, blink, look, rim, bell })   Mina on her small bike: wheels spin,
//       pedals turn, streamers on the handlebars, a basket. Pedal phase follows x so the feet never slide.
//   routeSign(g, x, gy, o)   the "10 km (6.2 mi)" route board with the river loop drawn on it
// Scale: 1 m = 260 units at the character plane (figure s 1.9 = 1.75 m). Returns { GY, CX, M, rim, pos }.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix, rng, clamp, lerp, ease, prog, text, FONTS, noise } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor } from './actors.js';

export const M2U = 260;
export const parkGround = () => E.H * V(0.8, 0.68);

// ---------- seasons + moods ----------
const SEASON = {
  spring: { grass: '#7ab85a', crowns: ['#f2b8c8', '#f6cad6', '#8ac46a', '#e8a0b8'], ground: '#6aa850', path: '#cbb898', leaf: '#f6c2d0', snow: 0 },
  summer: { grass: '#4f9a42', crowns: ['#2e7a32', '#3a8a3a', '#4a9a3e', '#2a6a2e'], ground: '#4a8a3a', path: '#d0bc96', leaf: '#5a9a3a', snow: 0 },
  autumn: { grass: '#8a9a4a', crowns: ['#d8722a', '#c8442a', '#e8b03a', '#b85a28'], ground: '#7a8a42', path: '#bfa888', leaf: '#e08a30', snow: 0 },
  winter: { grass: '#dfe6ee', crowns: [], ground: '#e8eef6', path: '#b8bcc8', leaf: '#ffffff', snow: 1 },
};
function moodOf(name) {
  if (name === 'dawn') { const m = mood('golden'); return { ...m, sky: ['#5a5a8e', '#d88aa0', '#f8c8a0', '#fde6c0'], key: '#ffd8b0', rim: '#ffc8a8', practical: '#ffe2b0', fog: '#f0d0d8', lampsOn: 0.6 }; }
  if (name === 'night') return { ...mood('night'), lampsOn: 1 };
  if (name === 'dusk') return { ...mood('dusk'), lampsOn: 1 };
  return { ...mood('day'), lampsOn: 0 };
}
// world-x range visible on a layer of `depth` (with margin) so tiled props are drawn only where the camera can see
const visRange = (cam, depth, pad = 600) => { const z = 1 + ((cam.z ?? 1) - 1) * depth, half = E.W / 2 / z; const cx = E.W / 2 + (cam.x || 0) * depth; return [cx - half - pad, cx + half + pad]; };
const tiles = (cam, depth, step, f, pad) => { const [a, b] = visRange(cam, depth, pad); for (let k = Math.floor(a / step); k <= Math.ceil(b / step); k++) f(k, k * step); };

// ---------- props ----------
function parkTree(g, x, gy, s, Se, seed, t, snowy) {
  const r = rng(seed), trunk = '#4a3628', sw = Math.sin(t * 0.9 + seed) * 4 * s;
  seg(g, [[x, gy], [x + 6 * s, gy - 200 * s], [x + sw, gy - 330 * s]], 26 * s, trunk);
  seg(g, [[x + 4 * s, gy - 180 * s], [x - 90 * s + sw, gy - 300 * s]], 12 * s, trunk); seg(g, [[x + 6 * s, gy - 220 * s], [x + 100 * s + sw, gy - 320 * s]], 11 * s, trunk);
  if (!Se.crowns.length) {                                                         // winter: bare branches, snow on top
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.2, L = (80 + r() * 90) * s, bx = x + sw, by = gy - 300 * s; seg(g, [[bx, by], [bx + Math.cos(a) * L, by + Math.sin(a) * L]], 5 * s, trunk); if (snowy) seg(g, [[bx + Math.cos(a) * L * 0.3, by + Math.sin(a) * L * 0.3 - 4], [bx + Math.cos(a) * L, by + Math.sin(a) * L - 4]], 4 * s, '#f4f8ff'); }
    return;
  }
  for (let i = 0; i < 9; i++) { const dx = (r() - 0.5) * 260 * s, dy = -(300 + r() * 170) * s, rr2 = (70 + r() * 50) * s; circle(g, x + dx + sw * 1.4, gy + dy, rr2, Se.crowns[i % Se.crowns.length]); }
  for (let i = 0; i < 4; i++) { const dx = (r() - 0.5) * 200 * s, dy = -(380 + r() * 120) * s; circle(g, x + dx + sw * 1.4 - 14 * s, gy + dy - 14 * s, 40 * s, alpha('#ffffff', 0.12)); }   // top light
}
export function kmMarker(g, x, gy, n, o = {}) {
  const ui = S().ui, s = o.s ?? 1;
  poly(g, [[x - 34 * s, gy], [x + 34 * s, gy], [x + 28 * s, gy - 150 * s], [x, gy - 170 * s], [x - 28 * s, gy - 150 * s]], '#8a8a92');
  poly(g, [[x + 4 * s, gy], [x + 34 * s, gy], [x + 28 * s, gy - 150 * s], [x, gy - 170 * s], [x + 4 * s, gy - 160 * s]], '#6a6a74');
  rr(g, x - 30 * s, gy - 140 * s, 60 * s, 64 * s, 8 * s); g.fillStyle = '#1a1622'; g.fill(); g.strokeStyle = ui.gold; g.lineWidth = 3 * s; g.stroke();
  text(g, 'KM', x, gy - 126 * s, { size: 16 * s, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 2 });
  text(g, String(n), x, gy - 98 * s, { size: 34 * s, color: ui.gold, font: FONTS.ui, weight: 900 });
  if (o.snow) { g.fillStyle = '#f4f8ff'; g.beginPath(); g.ellipse(x, gy - 166 * s, 26 * s, 9 * s, 0, 0, 7); g.fill(); }
}
function bench(g, x, gy, snow) {
  for (const dx of [-90, 90]) { seg(g, [[x + dx, gy], [x + dx, gy - 60]], 8, '#2a2630'); seg(g, [[x + dx, gy - 60], [x + dx - 10, gy - 130]], 7, '#2a2630'); }
  for (let i = 0; i < 3; i++) { rr(g, x - 120, gy - 66 - i * 9, 240, 9, 3); g.fillStyle = shade('#a8703a', -0.1 * i); g.fill(); }
  for (let i = 0; i < 3; i++) { rr(g, x - 124, gy - 100 - i * 14, 240, 10, 3); g.fillStyle = shade('#a8703a', -0.15 - 0.05 * i); g.fill(); }
  rr(g, x - 30, gy - 132, 60, 14, 3); g.fillStyle = '#c8b070'; g.fill();                                           // memorial plaque
  if (snow) { g.fillStyle = '#f4f8ff'; rr(g, x - 122, gy - 92, 244, 10, 5); g.fill(); rr(g, x - 126, gy - 138, 244, 8, 4); g.fill(); }
}
function fountain(g, t, x, gy, winter) {
  rr(g, x - 26, gy - 120, 52, 120, 8); g.fillStyle = '#6a7a8a'; g.fill(); rr(g, x - 46, gy - 140, 92, 26, 10); g.fillStyle = '#7a8a9a'; g.fill();
  circle(g, x + 20, gy - 146, 6, '#c8d0d8');
  if (winter) { for (let i = 0; i < 5; i++) poly(g, [[x - 40 + i * 20, gy - 114], [x - 32 + i * 20, gy - 114], [x - 36 + i * 20, gy - 114 + 14 + (i % 2) * 12]], '#dff2ff'); rr(g, x - 44, gy - 80, 88, 26, 4); g.fillStyle = '#f4f1e8'; g.fill(); text(g, 'FROZEN', x, gy - 67, { size: 16, color: '#3a5a8a', font: FONTS.ui, weight: 900 }); }
  else { g.strokeStyle = alpha('#bfe4ff', 0.85); g.lineWidth = 4; g.beginPath(); g.moveTo(x + 20, gy - 150); g.quadraticCurveTo(x + 40, gy - 196 + Math.sin(t * 20) * 2, x + 60, gy - 150); g.stroke(); for (let i = 0; i < 3; i++) { const u = (t * 2 + i / 3) % 1; circle(g, x + 60 + u * 4, gy - 150 + u * 20, 3, alpha('#e8f6ff', 1 - u)); } }
}
function bin(g, x, gy) { rr(g, x - 26, gy - 90, 52, 90, 6); g.fillStyle = '#2f5a3a'; g.fill(); rr(g, x - 30, gy - 98, 60, 12, 4); g.fillStyle = '#244a2e'; g.fill(); seg(g, [[x - 16, gy - 60], [x + 16, gy - 60]], 3, alpha('#fff', 0.25)); }
export function routeSign(g, x, gy, o = {}) {
  const ui = S().ui; seg(g, [[x - 100, gy], [x - 100, gy - 300]], 12, '#3a2a22'); seg(g, [[x + 100, gy], [x + 100, gy - 300]], 12, '#3a2a22');
  rr(g, x - 150, gy - 420, 300, 200, 14); g.fillStyle = '#1f4a34'; g.fill(); g.strokeStyle = '#f4f1e8'; g.lineWidth = 5; g.stroke();
  text(g, 'RIVER LOOP', x, gy - 396, { size: 24, color: '#f4f1e8', font: FONTS.ui, weight: 900, spacing: 3 });
  g.strokeStyle = alpha('#7ac8ff', 0.9); g.lineWidth = 8; g.beginPath(); g.ellipse(x, gy - 330, 100, 38, 0, 0, 7); g.stroke();
  g.strokeStyle = ui.gold; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.ellipse(x, gy - 330, 118, 52, 0, 0, 7); g.stroke(); g.setLineDash([]); circle(g, x - 118, gy - 330, 9, ui.accent);
  rr(g, x - 120, gy - 262, 240, 34, 8); g.fillStyle = '#0e0a14'; g.fill(); text(g, o.label || '10 km  (6.2 mi)', x, gy - 245, { size: 26, color: ui.gold, font: FONTS.ui, weight: 900 });
  if (o.snow) { g.fillStyle = '#f4f8ff'; rr(g, x - 154, gy - 430, 308, 16, 8); g.fill(); }
}
function lamp(g, x, gy, on, light) { FX.lampPost(g, x, gy, 380, { color: '#1c1a24', light, on: on > 0.05, a: 0.22 * on }); }

// ---------- the toilet-paper finish line ----------
export function finishLine(g, t, o = {}) {
  const [ax, ay] = o.a, [bx, by] = o.b, tape = clamp(o.tape ?? 0), n = 26, W = o.w ?? 34, sag = o.sag ?? 60;
  const P = (u) => { const fl = Math.sin(t * 6 + u * 9) * 6 * Math.sin(u * Math.PI); return [lerp(ax, bx, u), lerp(ay, by, u) + Math.sin(u * Math.PI) * sag + fl]; };
  const strip = (u0, u1, drop, side) => {
    const pts = []; for (let i = 0; i <= n; i++) { const u = lerp(u0, u1, i / n); let [x, y] = P(u); const d = side ? Math.abs(u - 0.5) : 0; if (drop > 0) { const k = clamp(1 - d * 2.2); x += (side < 0 ? -1 : 1) * drop * 40 * k; y += drop * drop * 520 * k * k; } pts.push([x, y]); }
    g.fillStyle = '#fbfaf6'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - W / 2) : g.moveTo(x, y - W / 2))); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1] + W / 2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.stroke();
    g.save(); g.setLineDash([3, 5]); for (let i = 2; i < pts.length - 1; i += 3) seg(g, [[pts[i][0], pts[i][1] - W / 2 + 3], [pts[i][0], pts[i][1] + W / 2 - 3]], 1.5, 'rgba(120,110,100,.55)'); g.restore();   // perforations
    for (let i = 1; i < pts.length; i += 2) circle(g, pts[i][0], pts[i][1], 2.4, 'rgba(160,190,220,.5)');                                    // quilted dots
  };
  if (tape <= 0.001) strip(0, 1, 0, 0);
  else { const gap = 0.02 + tape * 0.04; strip(0, 0.5 - gap, tape, -1); strip(0.5 + gap, 1, tape, 1); }
  const rollAt = o.roll === 'a' ? [ax, ay] : o.roll === 'b' ? [bx, by] : null;                                                      // the roll
  if (rollAt) { const [rx, ry] = rollAt; g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(rx, ry, 30, W * 0.9, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.15)'; g.stroke(); g.fillStyle = '#c8b090'; g.beginPath(); g.ellipse(rx, ry, 10, W * 0.32, 0, 0, 7); g.fill(); }
}

// ---------- Mina on her bike ----------
export function bike(g, t, o = {}) {
  const x = o.x ?? E.W / 2, gy = o.gy ?? parkGround(), s = (o.s ?? 2.0) * 0.72, f = o.facing ?? 1, R = 30, ph = (o.phase ?? x * f / (2 * Math.PI * R * s)) * Math.PI * 2;
  const L = (px, py) => [x + px * f * s, gy + py * s], frame = o.color || '#d4262e';
  const wB = L(-48, -R), wF = L(50, -R), crank = L(0, -R - 2), seat = L(-14, -96), bar = L(40, -112), cr = 14;
  // wheels (spokes spin), frame, chain, basket, streamers
  for (const w of [wB, wF]) { ring(g, w[0], w[1], R * s, 6 * s, '#1c1822'); ring(g, w[0], w[1], (R - 4) * s, 2 * s, '#9aa0aa'); for (let k = 0; k < 6; k++) { const a = ph + k * Math.PI / 3; seg(g, [[w[0], w[1]], [w[0] + Math.cos(a) * (R - 4) * s, w[1] + Math.sin(a) * (R - 4) * s]], 1.5 * s, '#c8ccd4'); } circle(g, w[0], w[1], 4 * s, '#5a5a66'); }
  const fr = (a, b, w = 5) => seg(g, [a, b], w * s, frame);
  fr(wB, crank); fr(crank, seat); fr(seat, wB); fr(seat, L(34, -86)); fr(L(34, -86), crank); fr(L(34, -86), wF, 4.5); fr(L(34, -86), bar, 4);
  seg(g, [[bar[0] - 12 * f * s, bar[1]], [bar[0] + 10 * f * s, bar[1] - 4 * s]], 4 * s, '#1c1822');
  rr(g, seat[0] - 16 * s, seat[1] - 6 * s, 32 * s, 9 * s, 4 * s); g.fillStyle = '#1c1822'; g.fill();
  const bk = L(58, -106); rr(g, bk[0] - 18 * s, bk[1] - 4 * s, 36 * s, 26 * s, 4 * s); g.fillStyle = '#c8a060'; g.fill(); for (let k = 1; k < 4; k++) seg(g, [[bk[0] - 18 * s + k * 9 * s, bk[1] - 4 * s], [bk[0] - 18 * s + k * 9 * s, bk[1] + 22 * s]], 1.5 * s, '#8a6a3a');
  for (let k = 0; k < 3; k++) { const w = Math.sin(t * 12 + k) * 5; seg(g, [[bar[0] - 10 * f * s, bar[1]], [bar[0] - (26 + k * 4) * f * s, bar[1] + (8 + k * 6) * s + w]], 2.5 * s, ['#f2c21a', '#2f6fd0', '#f4f1e8'][k]); }
  if (o.bell) { const bb = L(30, -116); circle(g, bb[0], bb[1], 6 * s, '#d8d8e0'); if (o.bell > 0 && o.bell < 1) for (let k = 0; k < 3; k++) seg(g, [[bb[0] + (8 + k * 6) * f * s, bb[1] - 10 * s - k * 4 * s], [bb[0] + (14 + k * 6) * f * s, bb[1] - 16 * s - k * 4 * s]], 2 * s, alpha('#fff1dc', 1 - o.bell)); }
  // rider: hips on the saddle, hands on the bars, feet on the pedals (local rig units: kid figure, facing handled by actor)
  const pedal = (a) => [cr * Math.cos(a), -R - 2 + cr * Math.sin(a)], pF = pedal(ph), pB = pedal(ph + Math.PI);
  const knee = (hip, ft) => { const mx = (hip[0] + ft[0]) / 2, my = (hip[1] + ft[1]) / 2, dx = ft[0] - hip[0], dy = ft[1] - hip[1], d = Math.hypot(dx, dy), L0 = 46, h = Math.sqrt(Math.max(0, L0 * L0 - (d / 2) ** 2)); return [mx - dy / d * h * -1 + 0, my + dx / d * h * -1]; };
  const hip = [-12, -104], lean = o.lean ?? 0.1, sh = [4 + 40 * lean, -168], head = [10 + 50 * lean, -200];
  const pose = { head, sh, hip, eF: [26, -142], hF: [40, -114], eB: [22, -140], hB: [36, -112], kF: knee(hip, pF), fF: pF, kB: knee(hip, pB), fB: pB };
  if (o.wave) { pose.eB = [10, -196]; pose.hB = [24, -236 + Math.sin(t * 10) * 6]; }
  if (o.rider !== null) actor(g, o.rider || 'MINA', { x, y: gy, s: o.s ?? 2.0, facing: f, pose, expr: o.expr || 'smile', blink: o.blink, look: o.look, rim: o.rim, shadow: false, t });
  g.save(); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, gy + 2, 90 * s, 8 * s, 0, 0, 7); g.fill(); g.restore();
  return { seat, bar, basket: bk };
}

// =====================================================================================================
export function park(g, t, cam, o = {}) {
  const season = o.season || 'summer', Se = SEASON[season] || SEASON.summer, M = moodOf(o.mood || 'day'), GY = parkGround(), CX = E.W / 2, U = M2U;
  const winter = season === 'winter', rain = clamp(o.rain ?? 0), snowAmt = winter ? clamp(o.snow ?? 0.6) : 0, puddles = o.puddles ?? rain > 0, lampOn = M.lampsOn + (rain > 0 ? 0.3 : 0);
  const kmStep = o.kmStep ?? 2600, pos = { pathY: GY, markerX: CX + 420, kmStep, benchX: CX - 520, fountainX: CX + 980, binX: CX - 980, lampStep: 1300, bridgeX: CX + 200, finishX: CX + 300, signX: CX - 1250, riverY: GY - 230 };
  const wet = rain > 0 ? 0.25 : 0, night = o.mood === 'night';
  // 0.12 sky: gradient, sun/moon, clouds (grey under rain/snow)
  layer(g, cam, 0.12, (g) => {
    const sky = rain > 0 || snowAmt > 0.3 ? M.sky.map(c => mix(c, '#8a90a0', 0.45)) : M.sky; backdrop(g, sky, [-E.W * 2, -E.H * 3, E.W * 5, E.H * 5]);
    if (night) { FX.stars(g, t * 0.3, { area: [-E.W, -E.H * 2, E.W * 3, E.H * 2], count: 160 }); FX.moon(g, CX + 560, GY - 640, 40, '#dfe6ff'); }
    else if (rain < 0.3) { const sy = o.mood === 'dawn' ? GY - 330 : o.mood === 'dusk' ? GY - 300 : GY - 760; FX.sun(g, CX + 620, sy, o.mood === 'day' ? 50 : 70, '#fff3dc', M.key, 4); }
    FX.clouds(g, { y: GY - 1000, h: 420, count: rain > 0 ? 12 : 6, color: rain > 0 ? '#9aa0b0' : '#ffffff', a: rain > 0 ? 0.35 : 0.16, seed: 31 });
  });
  // 0.3 far bank: hills + town skyline across the river, morning fog
  layer(g, cam, 0.3, (g) => {
    FX.hills(g, { y: GY - 330, amp: 120, color: mix(winter ? '#c8d0dc' : Se.ground, M.sky[0], 0.5), seed: 6 });
    FX.skyline(g, { x: -E.W * 2, y: GY - 300, w: E.W * 6, minH: 60, maxH: 220, color: mix(M.wall, M.sky[0], 0.45), windowColor: alpha(M.practical, 0.5 * lampOn), lit: 0.2 * lampOn, seed: 12 });
    if (winter) { g.fillStyle = alpha('#f4f8ff', 0.5); g.fillRect(-E.W * 2, GY - 300, E.W * 6, 10); }
    FX.fog(g, GY - 380, 220, M.fog, o.mood === 'dawn' ? 0.5 : 0.25);
  });
  // 0.5 the river: water band with sky reflection + shimmer, rain rings / ice floes, far-bank reeds; the footbridge
  layer(g, cam, 0.5, (g) => {
    const top = GY - 290, bot = GY - 150;
    g.fillStyle = linGrad(g, 0, top, 0, bot, [mix(M.sky[M.sky.length - 1], '#2a5a7a', 0.45), mix(M.sky[0], '#1a3a5a', 0.6)]); g.fillRect(-E.W * 2, top, E.W * 6, bot - top);
    tiles(cam, 0.5, 90, (k, x) => { const r = rng(k * 7 + 3), y = top + 10 + r() * (bot - top - 20), w = 30 + r() * 70, sh = Math.sin(t * 1.5 + k) * 10; seg(g, [[x + sh, y], [x + w + sh, y]], 3, alpha('#ffffff', (winter ? 0.25 : 0.18) + 0.1 * Math.sin(t * 2 + k))); });
    if (rain > 0) tiles(cam, 0.5, 120, (k, x) => { const r = rng(k * 5 + 9), u = (t * 1.4 + r()) % 1, y = top + 14 + r() * (bot - top - 28); g.strokeStyle = alpha('#e8f4ff', 0.5 * rain * (1 - u)); g.lineWidth = 2; g.beginPath(); g.ellipse(x + r() * 80, y, 6 + u * 26, 2 + u * 6, 0, 0, 7); g.stroke(); });
    if (winter) tiles(cam, 0.5, 340, (k, x) => { const r = rng(k * 3 + 1); if (r() < 0.5) return; g.fillStyle = alpha('#f4f8ff', 0.85); g.beginPath(); g.ellipse(x + r() * 200 + Math.sin(t * 0.3 + k) * 20, top + 30 + r() * 80, 60 + r() * 60, 12, 0, 0, 7); g.fill(); });
    // the footbridge (arched steel + timber deck), with its own lamps
    if (o.bridge !== false) { const bx = pos.bridgeX, deck = top - 30, w = 900;
      g.strokeStyle = '#3a3a48'; g.lineWidth = 16; g.beginPath(); g.moveTo(bx - w / 2, deck + 20); g.quadraticCurveTo(bx, deck - 240, bx + w / 2, deck + 20); g.stroke();
      for (let i = 1; i < 12; i++) { const u = i / 12, xx = bx - w / 2 + u * w, ay = deck + 20 - Math.sin(u * Math.PI) * 130; seg(g, [[xx, ay], [xx, deck]], 3, '#4a4a58'); }
      g.fillStyle = shade('#8a6a4a', -0.25); g.fillRect(bx - w / 2 - 60, deck, w + 120, 18); seg(g, [[bx - w / 2 - 60, deck - 40], [bx + w / 2 + 60, deck - 40]], 4, '#3a3a48');
      for (const px of [bx - w / 2, bx + w / 2]) { g.fillStyle = '#5a5a66'; g.fillRect(px - 20, deck, 40, bot - deck + 10); }
      if (winter) { g.fillStyle = '#f4f8ff'; g.fillRect(bx - w / 2 - 60, deck - 6, w + 120, 7); }
      if (lampOn > 0.05) for (const px of [bx - w / 2 + 40, bx + w / 2 - 40]) { glow(g, px, deck - 70, 90, M.practical, 0.35 * lampOn); circle(g, px, deck - 70, 6, '#fff2d6'); }
      // reflection of the arch
      g.save(); g.globalAlpha = 0.18; g.strokeStyle = '#3a3a48'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx - w / 2, deck + 40); g.quadraticCurveTo(bx, deck + 200, bx + w / 2, deck + 40); g.stroke(); g.restore(); }
    // near riverbank edge (stone) + reeds
    g.fillStyle = shade('#8a8478', -0.3); g.fillRect(-E.W * 2, bot - 4, E.W * 6, 26);
    tiles(cam, 0.5, 70, (k, x) => { const r = rng(k * 11 + 5); if (r() < 0.45 || winter) return; for (let j = 0; j < 4; j++) seg(g, [[x + j * 8, bot + 2], [x + j * 8 + Math.sin(t * 1.2 + k + j) * 6, bot - 40 - r() * 30]], 3, shade(Se.grass, -0.35)); });
  });
  // 0.75 tree line behind the path (season)
  layer(g, cam, 0.75, (g) => { tiles(cam, 0.75, 520, (k, x) => { const r = rng(k * 13 + 2); parkTree(g, x + r() * 200, GY - 140, 0.85 + r() * 0.3, Se, k + 40, t, winter); }); });
  // 1.0 the path: verge, gravel path with edging, puddles/snow; lamps, km markers, bench, fountain, bin, sign, finish posts
  layer(g, cam, 1, (g) => {
    const vTop = GY - 150;
    g.fillStyle = linGrad(g, 0, vTop, 0, GY - 30, [shade(Se.grass, -0.08), shade(Se.grass, -0.25)]); g.fillRect(-E.W * 8, vTop, E.W * 18, 130);
    g.fillStyle = linGrad(g, 0, GY - 34, 0, GY + 90, [mix(Se.path, '#000', 0.05 + wet), mix(Se.path, '#000', 0.22 + wet)]); g.fillRect(-E.W * 8, GY - 34, E.W * 18, 124);
    seg(g, [[-E.W * 8, GY - 34], [E.W * 10, GY - 34]], 5, shade(Se.path, -0.3)); seg(g, [[-E.W * 8, GY + 90], [E.W * 10, GY + 90]], 5, shade(Se.path, -0.35));
    g.fillStyle = linGrad(g, 0, GY + 90, 0, GY + 420, [shade(Se.ground, -0.1), shade(Se.ground, -0.45)]); g.fillRect(-E.W * 8, GY + 90, E.W * 18, 600);
    tiles(cam, 1, 60, (k, x) => { const r = rng(k * 17 + 4); circle(g, x + r() * 60, GY - 20 + r() * 100, 2 + r() * 2.5, alpha(shade(Se.path, -0.4), 0.5)); });    // gravel
    if (!winter) tiles(cam, 1, 46, (k, x) => { const r = rng(k * 19 + 6); for (let j = 0; j < 3; j++) seg(g, [[x + j * 6, vTop + 4], [x + j * 6 + Math.sin(t + k + j) * 3, vTop - 10 - r() * 14]], 2.5, shade(Se.grass, -0.2)); });   // grass tufts on the verge
    if (winter) { g.fillStyle = '#f4f8ff'; g.fillRect(-E.W * 8, GY - 40, E.W * 18, 12); tiles(cam, 1, 300, (k, x) => { const r = rng(k * 23 + 7); g.beginPath(); g.ellipse(x + r() * 200, GY + 4 + r() * 60, 60 + r() * 50, 9, 0, 0, 7); g.fillStyle = alpha('#f4f8ff', 0.7); g.fill(); }); }   // snow drifts on the path
    if (puddles) tiles(cam, 1, 640, (k, x) => { const r = rng(k * 29 + 8), px = x + r() * 300, py = GY + 20 + r() * 50, w = 90 + r() * 80; g.fillStyle = alpha(mix(M.sky[0], '#6a8aa8', 0.5), 0.75); g.beginPath(); g.ellipse(px, py, w, 14, 0, 0, 7); g.fill(); g.fillStyle = alpha('#ffffff', 0.25); g.beginPath(); g.ellipse(px - w * 0.3, py - 3, w * 0.3, 3, 0, 0, 7); g.fill();
      if (rain > 0) for (let j = 0; j < 2; j++) { const u = (t * 1.6 + r() + j * 0.5) % 1; g.strokeStyle = alpha('#e8f4ff', 0.6 * (1 - u)); g.lineWidth = 2; g.beginPath(); g.ellipse(px + (r() - 0.5) * w, py, 4 + u * 24, 1 + u * 4, 0, 0, 7); g.stroke(); } });
    // lamp posts (practical light) + bins, tiled
    tiles(cam, 1, pos.lampStep, (k, x) => { lamp(g, x + 200, GY - 40, lampOn, M.practical); if (k % 2) bin(g, x + 290, GY - 36); });
    // km markers every kmStep, numbered from o.km at markerX
    if (o.km != null) tiles(cam, 1, kmStep, (k, x) => { const n = o.km + k - Math.floor(pos.markerX / kmStep); if (n >= 0 && n <= 10) kmMarker(g, x + (pos.markerX % kmStep), GY - 30, n, { snow: winter }); });
    if (o.bench !== false) bench(g, pos.benchX, GY - 40, winter);
    if (o.fountain !== false) fountain(g, t, pos.fountainX, GY - 36, winter);
    if (o.sign) routeSign(g, pos.signX, GY - 36, { snow: winter });
    if (o.finish) { const fx = pos.finishX; for (const dx of [-220, 220]) { seg(g, [[fx + dx, GY + 40], [fx + dx, GY - 210]], 12, '#c8a070'); circle(g, fx + dx, GY - 214, 9, '#d8b080'); }
      text(g, 'FINISH', fx, GY - 290, { size: 40, color: S().ui.gold, font: FONTS.ui, weight: 900, spacing: 4, stroke: 8, strokeColor: '#1a1020' });
      finishLine(g, t, { a: [fx - 220, GY - 190], b: [fx + 220, GY - 190], tape: o.tape ?? 0, sag: 30 }); }
  });
  if (!winter && !rain) FX.dust(g, t, { count: 18, color: season === 'spring' ? '#ffe0ea' : M.key, a: 0.14, seed: 23 });
  const rim = { color: M.rim, dir: o.mood === 'dusk' || o.mood === 'dawn' ? [0.9, -0.4] : [0.7, -0.6] };
  return { GY, CX, M, rim, pos, season: Se };
}

// foreground: blurred grass tufts and a hanging branch (season), then the weather
export function parkFg(g, t, cam, o = {}) {
  const season = o.season || 'summer', Se = SEASON[season] || SEASON.summer, winter = season === 'winter', rain = clamp(o.rain ?? 0), snow = winter ? clamp(o.snow ?? 0.6) : 0;
  layer(g, cam, 1.35, (g) => {
    const gy = parkGround() + 330;
    tiles(cam, 1.35, 420, (k, x) => { const r = rng(k * 31 + 2); if (r() < 0.5) return; g.fillStyle = alpha(shade(winter ? '#c8d4e4' : Se.grass, -0.45), 0.92); g.beginPath(); g.ellipse(x, gy, 160 + r() * 80, 90, 0, Math.PI, 0); g.fill(); }, 900);
    const bx = (cam.x || 0) * 1.35 + E.W * 0.08; seg(g, [[bx - 400, -60], [bx + 120, 60 + Math.sin(t * 0.8) * 6]], 18, '#3a2a22');
    if (Se.crowns.length) for (let i = 0; i < 6; i++) circle(g, bx - 300 + i * 80, 40 + (i % 2) * 40 + Math.sin(t * 0.8 + i) * 6, 60, alpha(Se.crowns[i % Se.crowns.length], 0.9));
    else for (let i = 0; i < 4; i++) seg(g, [[bx - 250 + i * 90, 0], [bx - 220 + i * 90, 80]], 6, '#3a2a22');
  });
  if (rain > 0) FX.rain(g, t, { count: Math.round(320 * rain), a: 0.28 + 0.2 * rain, angle: 0.16, seed: 3 });
  if (snow > 0) { const r = rng(41); for (let i = 0; i < Math.round(160 * snow); i++) { const sp = 60 + r() * 90, x0 = r() * (E.W + 200) - 100, y = ((r() * E.H + t * sp) % (E.H + 60)) - 30, x = x0 + Math.sin(t * (0.6 + r()) + i) * 24, rad = 2 + r() * 4.5; circle(g, x, y, rad, alpha('#ffffff', 0.55 + r() * 0.4)); } }
  if (season === 'autumn' || season === 'spring') { const r = rng(43); for (let i = 0; i < 18; i++) { const sp = 70 + r() * 80, x0 = r() * (E.W + 300) - 150, y = ((r() * E.H + t * sp) % (E.H + 80)) - 40, x = x0 + Math.sin(t * 1.3 + i) * 50 - t * 30 % 60, a = t * 2 + i; g.save(); g.translate(x, y); g.rotate(a); g.scale(1, 0.4 + 0.6 * Math.abs(Math.sin(a))); g.fillStyle = season === 'autumn' ? ['#e08a30', '#c8442a', '#e8b03a'][i % 3] : ['#f6c2d0', '#fbe0e8'][i % 2]; g.beginPath(); g.ellipse(0, 0, season === 'autumn' ? 12 : 7, season === 'autumn' ? 7 : 5, 0, 0, 7); g.fill(); g.restore(); } }
}
