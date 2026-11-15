// sets/devices.js — the recurring on-screen DEVICES of ep 2 "What If Every Day, Your Jump Doubled?".
//   dayCounter(g, t, { x, y, s, keys: [[0, 1], [1.2, 2]] | day, flip })   split-flap "DAY 01" sign; flips on each key
//       flipTimes(keys) -> [t...]  (tick SFX hook)   dayAt(t, keys) -> day   o.onTick(i, tFlip) is called on the flip frame
//   heightMeter(g, t, { value (m), x, y0, y1, marks, danger, span, label })   right-edge log gauge, landmark ticks, gold readout
//       fmtHeight(m) -> '0.5 m' | '16 m' | '8,849 m' | '41 km'      LANDMARKS: the default tick list (hoop .. ISS)
//   gauge(g, t, { preset: 'launch' | 'terminal' | 'escape', x, y, r, at, value, max, unit, label })   dial + needle + readout
//   phone(g, t, { x, y, s, rot, views: [from, to], at, dur, comments, video })   social clip UI: views ticking, FAKE comments
//   newsLowerThird(g, t, { at, kicker, title, channel, ticker, y })   TV news lower-third (slide-in bars, LIVE bug, ticker crawl)
//   tv(g, t, { x, y, w, h }, (g, w, h) => content)   a TV set: bezel, screen glow, scanlines; content drawn in screen space
//   doublingGraph(g, t, { x, y, w, h, values, labels, start, per, runaway, runAt, unit })   bars that double, x2 hops, runaway bar
// All deterministic (t, rng). Numbers and labels in gold (QUALITY_BAR 36).
import { E, V, S, clamp, lerp, prog, ease, rng, rr, seg, circle, ring, poly, alpha, shade, mix, glow, text, measure, FONTS, linGrad, radGrad, noise } from '/engine/core.js';

const ui = () => S().ui;
const INK = '#120d18', CARD = '#1b1622', CREAM = '#fff1dc';
const comma = (n) => Math.round(n).toLocaleString('en-US');

// =====================================================================================================
// DAY COUNTER (split-flap)
// =====================================================================================================
const keysOf = (o) => o.keys || [[-1, o.day ?? 1]];
export const flipTimes = (keys) => keys.slice(1).map(k => k[0]);
export function dayAt(t, keys) { let d = keys[0][1]; for (const [ti, v] of keys) if (t >= ti) d = v; return d; }
// one flap card: draws `ch` top/bottom halves with a folding flap from `from` to `to`
function flapCard(g, x, y, w, h, from, to, k, o) {
  const r = 12, fs = h * 0.78, mid = y + h / 2, digit = (str, clipTop) => {
    g.save(); g.beginPath(); clipTop ? g.rect(x, y, w, h / 2) : g.rect(x, mid, w, h / 2); g.clip();
    rr(g, x, y, w, h, r); g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#2a2433', '#1a1520', '#221c2a', '#141019']); g.fill();
    text(g, str, x + w / 2, mid + fs * 0.04, { size: fs, color: CREAM, font: FONTS.title, weight: 700 }); g.restore(); };
  const half = (str, top, sc) => {                                 // a half folding about the middle line (sc 1..0)
    if (sc <= 0.01) return; g.save(); g.translate(0, mid); g.scale(1, sc); g.translate(0, -mid); digit(str, top);
    g.fillStyle = `rgba(0,0,0,${0.45 * (1 - sc)})`; top ? g.fillRect(x, y, w, h / 2) : g.fillRect(x, mid, w, h / 2); g.restore(); };
  // behind: the new top half + the old bottom half; the flap is the old top (folding down) then the new bottom (unfolding)
  if (k >= 1) { digit(to, true); digit(to, false); }
  else { digit(to, true); digit(from, false); if (k < 0.5) half(from, true, 1 - k * 2); else half(to, false, k * 2 - 1); }
  // split line + hinge pins + gloss
  g.fillStyle = '#07050a'; g.fillRect(x, mid - 2, w, 4); for (const px of [x - 3, x + w - 3]) { rr(g, px, mid - 7, 6, 14, 3); g.fillStyle = '#5a5262'; g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x + 4, y + 4, w - 8, h * 0.18);
  g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; rr(g, x, y, w, h, r); g.stroke();
}
export function dayCounter(g, t, o = {}) {
  const keys = keysOf(o), s = o.s ?? 1, x = o.x ?? E.W * 0.5, y = o.y ?? E.H * 0.2, flip = o.flip ?? 0.34, U = ui();
  let i = 0; for (let j = 0; j < keys.length; j++) if (t >= keys[j][0]) i = j;
  const cur = keys[i][1], prev = i > 0 ? keys[i - 1][1] : cur, k = i > 0 ? clamp((t - keys[i][0]) / flip) : 1;
  if (i > 0 && o.onTick && t - keys[i][0] >= 0 && t - keys[i][0] < 1 / 24) o.onTick(i, keys[i][0]);
  const pad = (n) => String(n).padStart(2, '0'), A = pad(prev), B = pad(cur), cw = 120 * s, ch = 172 * s, gap = 14 * s, lw = 170 * s;
  const W = lw + 2 * cw + gap + 70 * s, H = ch + 56 * s, x0 = x - W / 2, y0 = y - H / 2, bounce = i > 0 ? Math.exp(-(t - keys[i][0] - flip) * 9) * Math.sin((t - keys[i][0] - flip) * 40) * 3 * s * (t > keys[i][0] + flip ? 1 : 0) : 0;
  g.save(); g.translate(0, bounce);
  glow(g, x, y, W * 0.7, U.gold, 0.12);
  rr(g, x0 + 6 * s, y0 + 10 * s, W, H, 26 * s); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();            // drop shadow
  rr(g, x0, y0, W, H, 26 * s); g.fillStyle = linGrad(g, 0, y0, 0, y0 + H, ['#3a3044', '#231c2b']); g.fill(); g.strokeStyle = alpha(U.gold, 0.8); g.lineWidth = 4 * s; g.stroke();
  for (const [bx, by] of [[x0 + 18 * s, y0 + 18 * s], [x0 + W - 18 * s, y0 + 18 * s], [x0 + 18 * s, y0 + H - 18 * s], [x0 + W - 18 * s, y0 + H - 18 * s]]) { circle(g, bx, by, 5 * s, '#8a7a5a'); circle(g, bx - 1.5 * s, by - 1.5 * s, 2 * s, '#e8d8a8'); }
  text(g, o.label || 'DAY', x0 + 32 * s + lw / 2, y + 4 * s, { size: 74 * s, color: U.gold, font: FONTS.title, weight: 700, spacing: 6 * s, stroke: 8 * s, strokeColor: '#1a1020', glow: 14 * s, glowColor: alpha(U.gold, 0.5) });
  const cx0 = x0 + 32 * s + lw + 8 * s;
  for (let d = 0; d < 2; d++) { const kk = A[d] === B[d] ? 1 : clamp(k * 1.15 - d * 0.15); flapCard(g, cx0 + d * (cw + gap), y - ch / 2, cw, ch, A[d], B[d], kk, o); }
  g.restore();
  return { cur, flipping: k < 1, k };
}

// =====================================================================================================
// HEIGHT METER (log scale, landmarks pass by)
// =====================================================================================================
export const LANDMARKS = [
  ['HOOP', 3.05], ['HIGH JUMP', 2.45], ['POLE VAULT', 6.31], ['5 STOREYS', 16], ['NIAGARA', 51], ['BURJ KHALIFA', 828],
  ['CLOUDS', 2000], ['EVEREST', 8849], ['JETS', 11000], ['41 KM SKYDIVE', 41000], ['SPACE  100 KM', 100000], ['ISS', 408000],
];
export function fmtHeight(m) {
  if (m < 10) { const v = Math.round(m * 10) / 10; return `${v % 1 ? v.toFixed(1) : v} m`; }
  if (m < 10000) return `${comma(m)} m`;
  const km = m / 1000; return km < 100 ? `${Math.round(km * 10) / 10 % 1 ? (Math.round(km * 10) / 10).toFixed(1) : Math.round(km)} km` : `${comma(km)} km`;
}
export function heightMeter(g, t, o = {}) {
  const U = ui(), v = Math.max(0.05, o.value ?? 1), x = o.x ?? E.W - V(150, 110), y0 = o.y0 ?? E.H * 0.13, y1 = o.y1 ?? E.H * 0.87, span = o.span ?? 2.0, a = o.alpha ?? 1;
  const L = (m) => Math.log10(Math.max(1e-3, m)), yc = lerp(y1, y0, 0.42), Y = (m) => yc - (L(m) - L(v)) / span * (y1 - y0), marks = o.marks || LANDMARKS, danger = o.danger;
  g.save(); g.globalAlpha *= a;
  // panel + tube
  rr(g, x - 34, y0 - 60, 68, y1 - y0 + 120, 34); g.fillStyle = 'rgba(14,10,20,.72)'; g.fill(); g.strokeStyle = alpha(U.gold, 0.55); g.lineWidth = 3; g.stroke();
  text(g, o.label || 'HEIGHT', x, y0 - 86, { size: 30, color: U.gold, font: FONTS.ui, weight: 900, spacing: 4, stroke: 6, strokeColor: '#140f18' });
  g.save(); rr(g, x - 12, y0 - 30, 24, y1 - y0 + 60, 12); g.clip();
  g.fillStyle = '#231c2b'; g.fillRect(x - 12, y0 - 40, 24, y1 - y0 + 80);
  if (danger != null) { const yd = clamp(Y(danger), y0 - 40, y1 + 40); if (yd > y0 - 40) { g.fillStyle = alpha(U.accent, 0.35 + 0.15 * Math.sin(t * 6)); g.fillRect(x - 12, y0 - 40, 24, yd - y0 + 40); g.strokeStyle = alpha('#2a0a0a', 0.5); g.lineWidth = 5; for (let yy = y0 - 40; yy < yd; yy += 16) { g.beginPath(); g.moveTo(x - 14, yy + 10); g.lineTo(x + 14, yy - 6); g.stroke(); } } }
  const yv = Y(v); g.fillStyle = linGrad(g, 0, yv, 0, y1 + 40, [U.gold, shade(U.gold, -0.45)]); g.fillRect(x - 12, yv, 24, y1 + 40 - yv);
  glow(g, x, yv, 40, '#fff1c8', 0.5);
  g.restore();
  // minor log ticks (1, 2, 5 x 10^n)
  g.strokeStyle = alpha(U.cream, 0.45); g.lineWidth = 2;
  for (let e = -1; e <= 6; e++) for (const m of [1, 2, 5]) { const val = m * 10 ** e, yy = Y(val); if (yy < y0 - 20 || yy > y1 + 20) continue; const big = m === 1; seg(g, [[x + 16, yy], [x + (big ? 34 : 26), yy]], big ? 3 : 2, alpha(U.cream, big ? 0.6 : 0.35)); }
  // landmarks: tick across the tube + name to the left (fade at the window edges)
  for (const [name, m] of marks) { const yy = Y(m); if (yy < y0 - 30 || yy > y1 + 30) continue; const ea = clamp(Math.min(yy - (y0 - 30), y1 + 30 - yy) / 60), passed = v >= m;
    g.save(); g.globalAlpha *= ea; seg(g, [[x - 26, yy], [x + 18, yy]], 3, passed ? U.gold : alpha(U.cream, 0.8));
    text(g, name, x - 40, yy, { size: 28, color: passed ? U.gold : U.cream, font: FONTS.ui, weight: 900, align: 'right', spacing: 2, stroke: 6, strokeColor: '#140f18' }); g.restore(); }
  // gold readout pinned to the current level
  const str = o.text || fmtHeight(v), size = 48, w = measure(g, str, size, FONTS.ui, 900) + 40, ry = clamp(yv, y0, y1);
  poly(g, [[x - 40, ry], [x - 56, ry - 14], [x - 56, ry + 14]], U.gold);
  rr(g, x - 56 - w, ry - 34, w, 68, 20); g.fillStyle = 'rgba(20,14,26,.92)'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke();
  text(g, str, x - 56 - w / 2, ry + 2, { size, color: U.gold, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(U.gold, 0.6) });
  g.restore();
  return { y: yv, Y };
}

// =====================================================================================================
// GAUGES (speedometer dial)
// =====================================================================================================
export const GAUGES = {
  launch:   { max: 120, value: 90, unit: 'km/h', label: 'LAUNCH SPEED', step: 20, red: 100 },
  terminal: { max: 300, value: 200, unit: 'km/h', label: 'TERMINAL VELOCITY', step: 50, red: 250, pinned: true },
  escape:   { max: 12, value: 11.2, unit: 'km/s', label: 'ESCAPE VELOCITY', step: 2, red: 10, decimals: 1, hot: true },
};
export function gauge(g, t, o = {}) {
  const P = { ...(GAUGES[o.preset] || GAUGES.launch), ...o }, U = ui(), x = P.x ?? E.W / 2, y = P.y ?? E.H / 2, r = P.r ?? 200, at = P.at ?? 0.2;
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, A = (v) => lerp(a0, a1, clamp(v / P.max));
  const sweep = prog(t, at, at + (P.sweep ?? 1.3)), spring = sweep >= 1 ? 1 + Math.exp(-(t - at - (P.sweep ?? 1.3)) * 5) * Math.sin((t - at - (P.sweep ?? 1.3)) * 18) * 0.03 : ease.out(sweep) * 1.04 - 0.04 * ease.inOut(sweep);
  let shown = P.value * clamp(spring, 0, 1.08); if (P.pinned && sweep >= 1) shown += noise(t * 9, 4) * P.max * 0.006;
  const pop = ease.outBack(prog(t, 0, 0.35)); if (pop <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(pop, pop);
  if (P.hot && shown > P.value * 0.8) glow(g, 0, 0, r * 1.9, '#ff7a3a', 0.35 * clamp((shown / P.value - 0.8) * 5));
  glow(g, 0, 0, r * 1.5, U.gold, 0.1);
  circle(g, 6, 10, r + 18, 'rgba(0,0,0,.45)');
  g.fillStyle = linGrad(g, 0, -r - 18, 0, r + 18, ['#8a8494', '#3a3444', '#6a6474']); g.beginPath(); g.arc(0, 0, r + 18, 0, 7); g.fill();   // bezel
  g.fillStyle = radGrad(g, 0, -r * 0.3, r * 0.1, r * 1.1, ['#2e2638', '#120d18']); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  // red zone
  if (P.red != null) { g.strokeStyle = alpha(U.accent, 0.85); g.lineWidth = r * 0.07; g.beginPath(); g.arc(0, 0, r * 0.86, A(P.red), a1); g.stroke(); }
  // ticks + numbers
  const n = Math.round(P.max / P.step);
  for (let i = 0; i <= n * 5; i++) { const v = (i / (n * 5)) * P.max, a = A(v), big = i % 5 === 0, r0 = r * (big ? 0.76 : 0.82), r1 = r * 0.92;
    seg(g, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], big ? 4 : 2, big ? CREAM : alpha(CREAM, 0.5));
    if (big) text(g, String(Math.round(v * 10) / 10), Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, { size: r * 0.12, color: CREAM, font: FONTS.ui, weight: 900 }); }
  // target marker
  const at2 = A(P.value); poly(g, [[Math.cos(at2) * r * 0.97, Math.sin(at2) * r * 0.97], [Math.cos(at2 - 0.04) * r * 1.08, Math.sin(at2 - 0.04) * r * 1.08], [Math.cos(at2 + 0.04) * r * 1.08, Math.sin(at2 + 0.04) * r * 1.08]], U.gold);
  // label + readout
  text(g, P.label, 0, r * 0.19, { size: r * 0.11, color: U.gold, font: FONTS.ui, weight: 900, spacing: 3 });
  const dec = P.decimals ?? 0, str = `${dec ? shown.toFixed(dec) : comma(shown)} ${P.unit}`;
  rr(g, -r * 0.52, r * 0.32, r * 1.04, r * 0.3, r * 0.08); g.fillStyle = '#0a0710'; g.fill(); g.strokeStyle = alpha(U.gold, 0.7); g.lineWidth = 2.5; g.stroke();
  text(g, str, 0, r * 0.48, { size: r * 0.19, color: U.gold, font: FONTS.ui, weight: 900, glow: 12, glowColor: alpha(U.gold, 0.6) });
  // needle
  const an = A(shown); g.save(); g.rotate(an); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 10; poly(g, [[-r * 0.14, -r * 0.035], [r * 0.88, 0], [-r * 0.14, r * 0.035]], U.accent); g.restore();
  circle(g, 0, 0, r * 0.08, '#d8d2e0'); circle(g, 0, 0, r * 0.04, '#5a5262');
  g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.ellipse(-r * 0.2, -r * 0.45, r * 0.6, r * 0.3, -0.4, 0, 7); g.fill();  // glass glint
  g.restore();
  return { shown };
}

// =====================================================================================================
// PHONE UI (clip, views ticking, FAKE comments)
// =====================================================================================================
const COMMENTS = [
  { name: 'hoopz_daily', text: 'FAKE', fake: true, color: '#2f6fd0' }, { name: 'mia.k', text: 'no way this is real', color: '#e08aa8' },
  { name: 'vfx_guy', text: 'fake. the shadow is off', fake: true, color: '#3aa05a' }, { name: 'coach_ray', text: 'sign him up', color: '#f08a24' },
  { name: 'ttt', text: 'FAKE FAKE FAKE', fake: true, color: '#9a5ad6' }, { name: 'grandma_jo', text: 'is he ok', color: '#e0e0d0' },
  { name: 'drone_dan', text: 'fake lol, wires', fake: true, color: '#d4262e' }, { name: 'z.k', text: 'do it again', color: '#2f6fd0' },
  { name: 'real_or_not', text: 'FAKE 100%', fake: true, color: '#3aa05a' },
];
function clipVideo(g, w, h, t) {                                    // default clip: dusk court, hoop, a silhouette mid-dunk on a loop
  g.fillStyle = linGrad(g, 0, 0, 0, h, ['#3d3360', '#e8956b']); g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2034'; g.fillRect(0, h * 0.78, w, h * 0.22);
  const hx = w * 0.7, hy = h * 0.34; seg(g, [[hx + 40, h * 0.78], [hx + 40, hy - 30]], 6, '#1a1222'); g.fillStyle = '#f4efe6'; g.fillRect(hx - 10, hy - 50, 56, 40); seg(g, [[hx - 22, hy], [hx + 18, hy]], 4, '#ff6f3a');
  const u = (t * 0.6) % 1, jy = h * 0.78 - Math.sin(u * Math.PI) * h * 0.5, jx = lerp(w * 0.25, hx - 6, u);
  g.fillStyle = '#120d18'; circle(g, jx, jy - 66, 11, '#120d18'); seg(g, [[jx, jy - 54], [jx, jy - 20]], 10, '#120d18'); seg(g, [[jx, jy - 50], [jx + 16, jy - 76]], 6, '#120d18'); seg(g, [[jx, jy - 20], [jx - 10, jy]], 7, '#120d18'); seg(g, [[jx, jy - 20], [jx + 10, jy - 2]], 7, '#120d18');
  circle(g, jx + 18, jy - 82, 8, '#f08a24');
}
export function phone(g, t, o = {}) {
  const U = ui(), s = o.s ?? 1, x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, W = 360, H = 740, at = o.at ?? 0.3, dur = o.dur ?? 2.6;
  const [v0, v1] = o.views || [1200, 1000000], vk = ease.inOut(prog(t, at, at + dur)), views = Math.round(lerp(v0, v1, vk ** 1.6));
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); g.translate(-W / 2, -H / 2);
  glow(g, W / 2, H / 2, 520, '#8fb8ff', 0.18);
  rr(g, 8, 14, W, H, 54); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill();
  rr(g, 0, 0, W, H, 54); g.fillStyle = '#16121c'; g.fill(); g.strokeStyle = '#4a4454'; g.lineWidth = 4; g.stroke();
  rr(g, 14, 14, W - 28, H - 28, 42); g.fillStyle = '#0d0b12'; g.fill();
  g.save(); rr(g, 14, 14, W - 28, H - 28, 42); g.clip(); const sx = 14, sy = 14, sw = W - 28;
  // status bar + notch
  rr(g, W / 2 - 50, 22, 100, 24, 12); g.fillStyle = '#000'; g.fill(); text(g, '9:41', 48, 36, { size: 18, color: '#e8e4ee', font: FONTS.ui, weight: 900 });
  // video
  const vh = sw * 0.62; g.save(); g.translate(sx, sy + 46); g.beginPath(); g.rect(0, 0, sw, vh); g.clip(); (o.video || clipVideo)(g, sw, vh, t); g.restore();
  g.fillStyle = '#ff3b4a'; g.fillRect(sx, sy + 46 + vh - 5, sw * ((t * 0.25) % 1), 5);
  // title + views counter
  const ty = sy + 46 + vh + 34; text(g, o.title || 'guy dunks from the free-throw line??', sx + 18, ty, { size: 21, color: '#f2eef6', font: FONTS.ui, weight: 900, align: 'left' });
  const vp = 1 + 0.12 * Math.max(0, Math.sin(clamp((vk - 0.98) * 50) * Math.PI)) * (vk > 0.98 ? 1 : 0);
  g.save(); g.translate(sx + 18, ty + 40); g.scale(vp, vp); text(g, `${comma(views)} views`, 0, 0, { size: 30, color: U.gold, font: FONTS.ui, weight: 900, align: 'left', glow: vk > 0.98 ? 14 : 0, glowColor: alpha(U.gold, 0.7) }); g.restore();
  // like row
  const likes = Math.round(lerp(40, 86000, vk ** 1.6)); text(g, `♥ ${likes >= 1000 ? (likes / 1000).toFixed(likes > 9999 ? 0 : 1) + 'K' : likes}`, sx + 18, ty + 80, { size: 22, color: '#ff6f8a', font: FONTS.ui, weight: 900, align: 'left' });
  text(g, `${comma(lerp(3, 4200, vk ** 1.6))} comments`, sx + sw - 18, ty + 80, { size: 20, color: '#a8a2b4', font: FONTS.ui, weight: 800, align: 'right' });
  seg(g, [[sx + 14, ty + 104], [sx + sw - 14, ty + 104]], 2, '#2a2532');
  // comments scrolling up, FAKE stamps pop
  const list = o.comments || COMMENTS, rowH = 74, cy0 = ty + 116, scroll = (Math.max(0, t - at) * (o.scroll ?? 46));
  g.save(); g.beginPath(); g.rect(sx, cy0, sw, H - 28 - (cy0 - sy)); g.clip();
  for (let i = 0; i < list.length * 3; i++) { const c = list[i % list.length], yy = cy0 + 20 + i * rowH - scroll % (list.length * rowH) ; if (yy < cy0 - rowH || yy > H) continue;
    circle(g, sx + 36, yy + 14, 18, c.color); circle(g, sx + 36, yy + 8, 7, alpha('#fff', 0.5));
    text(g, '@' + c.name, sx + 64, yy, { size: 16, color: '#a8a2b4', font: FONTS.ui, weight: 800, align: 'left' });
    text(g, c.text, sx + 64, yy + 26, { size: c.fake ? 24 : 21, color: c.fake ? '#ff5a5a' : '#f2eef6', font: FONTS.ui, weight: 900, align: 'left' });
    if (c.fake) { const sp = ease.outBack(clamp((cy0 + 300 - yy) / 60)); if (sp > 0.02) { g.save(); g.translate(sx + sw - 58, yy - 8); g.rotate(-0.14); g.scale(sp, sp); rr(g, -44, -17, 88, 34, 7); g.fillStyle = 'rgba(40,6,10,.85)'; g.fill(); g.strokeStyle = '#ff3b3b'; g.lineWidth = 4; g.stroke(); text(g, 'FAKE', 0, 2, { size: 23, color: '#ff3b3b', font: FONTS.title, weight: 700, spacing: 3 }); g.restore(); } } }
  g.restore();
  g.restore();
  g.fillStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(30, 20); g.lineTo(W * 0.6, 20); g.lineTo(30, H * 0.5); g.closePath(); g.fill();   // glass glint
  g.restore();
  return { views };
}

// =====================================================================================================
// TV + NEWS LOWER-THIRD
// =====================================================================================================
export function tv(g, t, o = {}, content) {
  const x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, w = o.w ?? 1100, h = o.h ?? w * 9 / 16, x0 = x - w / 2, y0 = y - h / 2;
  glow(g, x, y, w * 0.9, o.glow || '#9fc8ff', 0.22);
  rr(g, x0 - 34, y0 - 34, w + 68, h + 68, 30); g.fillStyle = linGrad(g, 0, y0, 0, y0 + h, ['#2a2632', '#121016']); g.fill(); g.strokeStyle = '#3a3644'; g.lineWidth = 3; g.stroke();
  seg(g, [[x - 120, y0 + h + 34], [x - 160, y0 + h + 90]], 12, '#1a1820'); seg(g, [[x + 120, y0 + h + 34], [x + 160, y0 + h + 90]], 12, '#1a1820');
  circle(g, x0 + w + 4, y0 + h + 18, 4, '#5fd39a');
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.translate(x0, y0);
  const sc = w / E.W; g.save(); g.scale(sc, h / E.H); content?.(g, E.W, E.H); g.restore();
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let yy = 0; yy < h; yy += 4) g.fillRect(0, yy, w, 1.5);
  g.fillStyle = linGrad(g, 0, 0, w, h, ['rgba(255,255,255,.08)', 'rgba(255,255,255,0)', 'rgba(0,0,0,.2)']); g.fillRect(0, 0, w, h);
  g.restore();
  return { x0, y0, w, h };
}
export function newsLowerThird(g, t, o = {}) {
  const U = ui(), at = o.at ?? 0.3, y = o.y ?? E.H * 0.76, x0 = o.x ?? 110, kick = o.kicker || 'BREAKING NEWS', title = o.title || "THE BOY WHO WON'T STAY DOWN", red = '#d4262e';
  const a1 = ease.outBack(prog(t, at, at + 0.4)), a2 = ease.out(prog(t, at + 0.2, at + 0.7)), a3 = prog(t, at + 0.35, at + 1.1);
  if (a1 <= 0) return;
  const kw = measure(g, kick, 34, FONTS.ui, 900) + 60, tw = Math.max(900, measure(g, title, 60, FONTS.title, 700) + 90);
  // kicker (red) slides in from the left
  g.save(); g.translate(lerp(-kw - 200, 0, a1), 0); rr(g, x0, y - 108, kw, 56, 8); g.fillStyle = red; g.fill(); text(g, kick, x0 + kw / 2, y - 79, { size: 34, color: '#fff', font: FONTS.ui, weight: 900, spacing: 3 }); g.restore();
  // title bar wipes open
  if (a2 > 0) { g.save(); g.beginPath(); g.rect(x0, y - 50, tw * a2, 104); g.clip(); rr(g, x0, y - 50, tw, 104, 10); g.fillStyle = linGrad(g, 0, y - 50, 0, y + 54, ['#ffffff', '#e4e0ea']); g.fill();
    g.fillStyle = red; g.fillRect(x0, y - 50, 12, 104);
    g.save(); g.beginPath(); g.rect(x0 + 30, y - 50, (tw - 30) * ease.out(a3), 104); g.clip(); text(g, title, x0 + 40, y + 2, { size: 60, color: '#141018', font: FONTS.title, weight: 700, align: 'left' }); g.restore();
    g.restore(); }
  // ticker crawl
  if (a2 > 0.5) { const ty = y + 82, tk = o.ticker || 'LOCAL TEEN CLEARS TOWN HALL  •  DUCKS FILE FORMAL COMPLAINT  •  EXPERTS: "WE HAVE NO IDEA"  •  JUMP HEIGHT DOUBLING DAILY  •  ';
    g.fillStyle = 'rgba(12,10,18,.88)'; g.fillRect(0, ty - 26, E.W, 52); g.fillStyle = U.gold; g.fillRect(0, ty - 26, 150, 52); text(g, 'LIVE', 75, ty + 1, { size: 30, color: '#141018', font: FONTS.ui, weight: 900, spacing: 3 });
    g.save(); g.beginPath(); g.rect(150, ty - 26, E.W - 150, 52); g.clip(); const tw2 = measure(g, tk, 28, FONTS.ui, 900), off = (t * 160) % tw2; for (let k = 0; k < 4; k++) text(g, tk, 170 + k * tw2 - off, ty + 1, { size: 28, color: '#f2eef6', font: FONTS.ui, weight: 900, align: 'left' }); g.restore(); }
  // channel bug + LIVE dot
  const bug = o.channel || 'TOWN NEWS 4', bp = ease.outBack(prog(t, at, at + 0.4)); g.save(); g.globalAlpha *= bp;
  rr(g, E.W - 330, 60, 250, 64, 12); g.fillStyle = 'rgba(12,10,18,.8)'; g.fill(); text(g, bug, E.W - 205, 92, { size: 28, color: '#fff', font: FONTS.ui, weight: 900, spacing: 2 });
  if (Math.floor(t * 1.5) % 2 === 0) circle(g, E.W - 350, 92, 10, red); g.restore();
}

// =====================================================================================================
// DOUBLING BAR GRAPH
// =====================================================================================================
export function doublingGraph(g, t, o = {}) {
  const U = ui(), vals = o.values || [0.5, 1, 2, 4], labels = o.labels || vals.map((_, i) => `DAY ${i + 1}`), unit = o.unit ?? 'm';
  const x = o.x ?? E.W * 0.18, y = o.y ?? E.H * 0.8, w = o.w ?? E.W * 0.62, h = o.h ?? E.H * 0.55, start = o.start ?? 0.3, per = o.per ?? 0.5;
  const n = vals.length + (o.runaway ? 1 : 0), bw = w / n * 0.56, gap = w / n, max = (o.max ?? vals[vals.length - 1]) * 1.18, H = (v) => (v / max) * h;
  // axis + grid
  const ax = ease.out(prog(t, start - 0.3, start + 0.2)); g.save(); g.globalAlpha *= ax;
  for (let k = 1; k <= 4; k++) { const gy = y - (h * k) / 4; seg(g, [[x - 20, gy], [x + w, gy]], 2, alpha(U.cream, 0.12)); }
  seg(g, [[x - 20, y], [x + w + 20, y]], 4, alpha(U.cream, 0.7)); seg(g, [[x - 20, y], [x - 20, y - h - 30]], 4, alpha(U.cream, 0.7));
  text(g, o.title || 'JUMP HEIGHT', x - 20, y - h - 60, { size: 34, color: U.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 4 });
  g.restore();
  const tops = [];
  vals.forEach((v, i) => { const t0 = start + i * per, k = prog(t, t0, t0 + 0.45), e = ease.outBack(k); if (k <= 0) return; const bx = x + i * gap + (gap - bw) / 2, bh = Math.max(4, H(v) * e);
    rr(g, bx + 6, y - bh + 6, bw, bh, 12); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill();
    rr(g, bx, y - bh, bw, bh, 12); g.fillStyle = linGrad(g, 0, y - bh, 0, y, [U.gold, shade(U.gold, -0.4)]); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(bx + 8, y - bh + 8, bw * 0.18, Math.max(0, bh - 16));
    const lp = ease.outBack(prog(t, t0 + 0.25, t0 + 0.6)); if (lp > 0.02) { g.save(); g.translate(bx + bw / 2, y - bh - 36); g.scale(lp, lp); text(g, `${v} ${unit}`, 0, 0, { size: 44, color: U.gold, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#140f18', glow: 10, glowColor: alpha(U.gold, 0.5) }); g.restore(); }
    text(g, labels[i], bx + bw / 2, y + 38, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, spacing: 2, alpha: ease.out(k) });
    tops.push([bx + bw / 2, y - bh]);
    // x2 hop arrow from the previous bar
    if (i > 0 && o.hops !== false) { const [px, py] = tops[i - 1] || [bx - gap + bw / 2, y - H(vals[i - 1])], q = ease.inOut(prog(t, t0, t0 + 0.4)), mx = (px + bx + bw / 2) / 2, my = Math.min(py, y - bh) - 90;
      g.save(); g.globalAlpha *= clamp((t0 + 1.6 - t) / 0.4) * 0.95 + (o.keepHops ? 1 : 0); g.strokeStyle = U.cream; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath();
      const N = 24; for (let j = 0; j <= N * q; j++) { const u = j / N, xx = (1 - u) ** 2 * px + 2 * (1 - u) * u * mx + u * u * (bx + bw / 2), yy = (1 - u) ** 2 * (py - 70) + 2 * (1 - u) * u * my + u * u * (y - bh - 70); j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.stroke(); g.setLineDash([]); if (q > 0.6) text(g, '×2', mx, my - 6, { size: 40, color: U.cream, font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#140f18' }); g.restore(); }
  });
  // runaway bar: shoots off the top of the frame
  if (o.runaway) { const i = vals.length, t0 = o.runAt ?? start + i * per + 0.3, k = prog(t, t0, t0 + 0.9); if (k > 0) {
    const bx = x + i * gap + (gap - bw) / 2, top = lerp(y, -E.H * 0.6, ease.in(k)), bh = y - top;
    rr(g, bx, top, bw, bh, 12); g.fillStyle = linGrad(g, 0, Math.max(0, top), 0, y, ['#fff1c8', U.gold, shade(U.gold, -0.4)]); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; const r = rng(66); for (let j = 0; j < 14; j++) { const lx = bx + r() * bw, ly = (y - ((t * 1400 + r() * 900) % 900)), L = 60 + r() * 120; seg(g, [[lx, ly], [lx, ly + L]], 2 + r() * 2, alpha('#fff6e0', 0.35 * k)); } g.restore();
    glow(g, bx + bw / 2, Math.max(20, top), 220, '#fff1c8', 0.35 * k);
    text(g, labels[i] || `DAY ${i + 1}`, bx + bw / 2, y + 38, { size: 26, color: U.cream, font: FONTS.ui, weight: 900, spacing: 2 });
    if (top < 60) { const p = ease.outBack(prog(t, t0 + 0.5, t0 + 0.9)); g.save(); g.translate(bx + bw / 2, 90); g.scale(p, p); text(g, o.runText || '???', 0, 0, { size: 56, color: U.gold, font: FONTS.title, weight: 700, stroke: 10, strokeColor: '#140f18' }); g.restore(); }
  } }
  return { tops };
}
