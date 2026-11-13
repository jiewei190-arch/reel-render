// sets/rules2.js — THE RULES #2 "The Night Shift": props + UI (vertical 9:16, 1080x1920). The FX layer is sets/horror.js (reuse it).
//   stickyNote(g, x, y, s, { t, rules: 0..3 (float write-on), rot, hl: rule to underline, shake 0..1 }) -> { w, h, lines }
//       a yellow sticky note on the register, the manager's three rules in marker (scrawl from horror.js), a curled corner.
//   cctv(g, x, y, w, h, { t, cams: 4, focus: 0..1 (CAM 4 grows to fill the whole monitor), static: 0..1, time: '03:00:12',
//                         feed: (g, i, w, h, t) => {...} draw your own content per camera (i = 1..4), bezel: true })
//       a 2x2 grid of grainy green-grey feeds labelled CAM 1-4, REC dot, a ticking timestamp, scanlines, roll bar, vignette.
//       Default feeds: CAM 1 pumps, CAM 2 the aisle, CAM 3 the front door, CAM 4 the counter from behind the clerk (o.behind 0..1 adds
//       the tall shape standing right behind him, never lit: only the smile).
//   wallPhone(g, x, y, s, { t, ring: 0..1, offHook: 0..1, handTo: [x, y] })   beige wall phone: the handset rattles in the cradle while
//       ringing (ring lines), a coiled cord; offHook lifts the handset to handTo (world) with the coiled cord stretched.
//   stranger(g, x, y, s, { t, smile: 0..1, lit: 0..1 (cold rim only, the face stays black), tap: 0..1 knuckle phase, tapAt: [x, y],
//                          facing, lean })   tall thin long-coat silhouette (~1.15x the cast), never blinks; the too-wide pale smile.
//   glassPane(g, t, x, y, w, h, { fog: 0..1, cond: 0..1, reflect: (g) => {}, reflectA, frame, drawer: bool, grille: bool })
//       the night pay window: frame, a speaker grille + pass-through drawer, reflection (your callback, drawn faint), streaks,
//       condensation droplets and a fog patch (a breath on the glass).
//   tapRings(g, t, t0, x, y)   three small impact rings on the glass for a knuckle tap at t0 (sync with the knock SFX)
// Captions are burned in at y ~1330: keep key action out of y 1270-1400 when a caption is up, and out of the bottom 480 / right 180 px.
import { E, S, clamp, lerp, ease, prog, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, text, FONTS, linGrad, radGrad } from '/engine/core.js';
import { scrawl } from './horror.js';

export const RULES2 = ['At 2 a.m., lock the door. Serve customers through the window.', "If someone asks for the usual, tell them we're out.", 'Never look at camera four.'];
const wrap = (g, str, maxW, size) => { g.save(); g.font = `600 ${size}px "${FONTS.title}"`; const out = []; let line = ''; for (const w of str.split(' ')) { const tst = line ? line + ' ' + w : w; if (g.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; } if (line) out.push(line); g.restore(); return out; };

// ---------- the sticky note ----------
export function stickyNote(g, x, y, s = 1, o = {}) {
  const W = 640, H = 700, t = o.t ?? 0, sh = (o.shake ?? 0) * 3, r = rng(4), lines = [], ink = '#1a2240';
  g.save(); g.translate(x + noise(t * 20, 2) * sh, y + noise(t * 20, 7) * sh); g.rotate(o.rot ?? 0.04); g.scale(s, s);
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = '#f2d84a'; g.beginPath(); g.moveTo(-W / 2, -H / 2); g.lineTo(W / 2, -H / 2); g.lineTo(W / 2, H / 2 - 90); g.quadraticCurveTo(W / 2 - 20, H / 2 - 10, W / 2 - 110, H / 2); g.lineTo(-W / 2, H / 2); g.closePath(); g.fill(); g.restore();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-W / 2, -H / 2, W, 70);                                                     // adhesive strip sheen
  g.fillStyle = linGrad(g, W / 2 - 110, H / 2 - 90, W / 2, H / 2, [shade('#f2d84a', -0.25), shade('#f2d84a', 0.1)]); g.beginPath(); g.moveTo(W / 2, H / 2 - 90); g.quadraticCurveTo(W / 2 - 60, H / 2 - 70, W / 2 - 110, H / 2); g.quadraticCurveTo(W / 2 - 40, H / 2 - 40, W / 2, H / 2 - 90); g.fill();   // curl
  for (let i = 0; i < 3; i++) { g.fillStyle = alpha('#8a6a10', 0.05 + r() * 0.05); g.beginPath(); g.ellipse((r() - 0.5) * W * 0.8, (r() - 0.5) * H * 0.8, 50 + r() * 60, 20 + r() * 30, r() * 3, 0, 7); g.fill(); }
  scrawl(g, 'NIGHT SHIFT', -W / 2 + 50, -H / 2 + 80, { size: 46, seed: 2, color: ink, k: clamp((o.rules ?? 0) * 4) });
  seg(g, [[-W / 2 + 50, -H / 2 + 96], [-W / 2 + 330, -H / 2 + 100]], 3, alpha(ink, 0.6 * clamp((o.rules ?? 0) * 4)));
  let yy = -H / 2 + 180;
  RULES2.forEach((rule, i) => {
    const k = clamp((o.rules ?? 0) - i), L = wrap(g, rule, W - 150, 42), n = rule.length; let used = 0; lines.push([-W / 2 + 50, yy]);
    if (k > 0) scrawl(g, `${i + 1}.`, -W / 2 + 46, yy, { size: 46, seed: 10 + i, k: clamp(k * 6), color: ink });
    L.forEach((ln, j) => { const kk = clamp((k * n - used) / ln.length); used += ln.length + 1; if (kk > 0) scrawl(g, ln, -W / 2 + 96, yy + j * 54, { size: 42, seed: 30 + i * 5 + j, k: kk, color: ink }); });
    if (o.hl === i + 1 && k >= 1) seg(g, [[-W / 2 + 96, yy + (L.length - 1) * 54 + 14], [-W / 2 + 96 + Math.min(W - 160, L[L.length - 1].length * 20), yy + (L.length - 1) * 54 + 18]], 4, alpha('#b02020', 0.85));
    yy += L.length * 54 + 44;
  });
  g.restore();
  return { w: W * s, h: H * s, lines: lines.map(([lx, ly]) => [x + lx * s, y + ly * s]) };
}

// ---------- CCTV ----------
const FEED_BG = '#2a3430';
function defaultFeed(g, i, w, h, t, o) {
  const fl = '#3a4640', dk = '#151c18', lt = '#8a9a90';
  g.fillStyle = linGrad(g, 0, 0, 0, h, ['#1c2420', '#2e3a34']); g.fillRect(0, 0, w, h);
  if (i === 1) {                                                                                         // pumps under the canopy
    g.fillStyle = dk; g.fillRect(0, 0, w, h * 0.22); for (let k = 0; k < 4; k++) { g.fillStyle = alpha('#d8e8d8', 0.6); g.fillRect(w * (0.1 + k * 0.22), h * 0.18, w * 0.12, h * 0.03); }
    g.fillStyle = fl; g.fillRect(0, h * 0.75, w, h * 0.25); for (const px of [0.3, 0.7]) { rr(g, w * px - w * 0.06, h * 0.42, w * 0.12, h * 0.34, 6); g.fillStyle = '#4a5650'; g.fill(); rr(g, w * px - w * 0.04, h * 0.48, w * 0.08, h * 0.08, 3); g.fillStyle = lt; g.fill(); }
    g.fillStyle = '#05080a'; g.fillRect(0, h * 0.3, w, h * 0.06);
  } else if (i === 2) {                                                                                  // aisle in perspective
    g.fillStyle = fl; poly(g, [[w * 0.35, h * 0.45], [w * 0.65, h * 0.45], [w, h], [0, h]], fl);
    for (const sd of [-1, 1]) { poly(g, [[w * 0.5 + sd * w * 0.15, h * 0.25], [w * 0.5 + sd * w * 0.15, h * 0.48], [w * 0.5 + sd * w * 0.5, h * 0.95], [w * 0.5 + sd * w * 0.5, 0]], '#38443e'); for (let k = 0; k < 5; k++) seg(g, [[w * 0.5 + sd * w * 0.15, h * (0.28 + k * 0.045)], [w * 0.5 + sd * w * 0.5, h * (0.05 + k * 0.18)]], 2, alpha(lt, 0.4)); }
  } else if (i === 3) {                                                                                  // the front door, locked
    g.fillStyle = '#323e38'; g.fillRect(0, 0, w, h); rr(g, w * 0.3, h * 0.12, w * 0.4, h * 0.8, 4); g.fillStyle = '#0a0e0c'; g.fill(); seg(g, [[w * 0.5, h * 0.12], [w * 0.5, h * 0.92]], 3, '#4a5650');
    rr(g, w * 0.36, h * 0.22, w * 0.12, h * 0.07, 3); g.fillStyle = alpha('#c8e0c8', 0.6); g.fill(); circle(g, w * 0.66, h * 0.55, 5, lt);
  } else {                                                                                                // CAM 4: the counter from behind the clerk (high angle)
    g.fillStyle = '#2a3430'; g.fillRect(0, 0, w, h); g.fillStyle = '#3e4a44'; g.fillRect(0, h * 0.55, w, h * 0.45);
    rr(g, w * 0.05, h * 0.5, w * 0.9, h * 0.12, 4); g.fillStyle = '#4a5852'; g.fill(); rr(g, w * 0.55, h * 0.36, w * 0.2, h * 0.16, 4); g.fillStyle = '#5a6a62'; g.fill();   // counter + register
    rr(g, w * 0.08, h * 0.08, w * 0.84, h * 0.34, 4); g.fillStyle = '#0a0e0c'; g.fill();                                                 // the pay window (dark outside)
    // the clerk from behind: shoulders + head
    g.fillStyle = '#1a2420'; g.beginPath(); g.ellipse(w * 0.42, h * 0.86, w * 0.16, h * 0.2, 0, Math.PI, 0); g.fill(); circle(g, w * 0.42, h * 0.62, w * 0.065, '#141c18');
    const b = clamp(o.behind ?? 0); if (b > 0) {                                                        // the thing behind him: tall, dark, the smile
      g.save(); g.globalAlpha = b; g.fillStyle = '#05070a'; g.beginPath(); g.moveTo(w * 0.58, h * 1.02); g.lineTo(w * 0.63, h * 0.5); g.lineTo(w * 0.64, h * 0.3); g.quadraticCurveTo(w * 0.7, h * 0.25, w * 0.76, h * 0.3); g.lineTo(w * 0.77, h * 0.5); g.lineTo(w * 0.83, h * 1.02); g.closePath(); g.fill();   // long coat, narrow shoulders
      seg(g, [[w * 0.64, h * 0.32], [w * 0.61, h * 0.62], [w * 0.6, h * 0.8]], w * 0.022, '#05070a'); seg(g, [[w * 0.76, h * 0.32], [w * 0.79, h * 0.62], [w * 0.8, h * 0.8]], w * 0.022, '#05070a');   // arms hanging too long
      seg(g, [[w * 0.7, h * 0.27], [w * 0.7, h * 0.22]], w * 0.025, '#05070a'); g.beginPath(); g.ellipse(w * 0.7, h * 0.16, w * 0.038, h * 0.06, 0, 0, 7); g.fill();
      g.strokeStyle = alpha('#e8f0e8', 0.85 * b); g.lineWidth = Math.max(1.5, w * 0.004); g.beginPath(); g.arc(w * 0.7, h * 0.15, w * 0.034, 0.25, Math.PI - 0.25); g.stroke(); g.restore(); }
  }
}
export function cctv(g, x, y, w, h, o = {}) {
  const t = o.t ?? 0, foc = ease.inOut(clamp(o.focus ?? 0)), st = clamp(o.static ?? 0.15), r = rng(Math.floor(t * 24) * 3 + 1), U = S().ui;
  g.save(); g.translate(x, y);
  if (o.bezel !== false) { rr(g, -40, -40, w + 80, h + 120, 26); g.fillStyle = '#1a1a20'; g.fill(); rr(g, -40, -40, w + 80, h + 120, 26); g.strokeStyle = '#2e2e36'; g.lineWidth = 4; g.stroke(); circle(g, w - 10, h + 44, 9, '#4aff6a'); text(g, 'NIGHTWATCH', 30, h + 44, { size: 26, color: '#5a5a66', font: FONTS.ui, weight: 900, align: 'left', spacing: 3 }); }
  g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h);
  const gap = 8, cw = (w - gap) / 2, ch = (h - gap) / 2, rect = (i) => { const c = (i - 1) % 2, rw = Math.floor((i - 1) / 2); return [c * (cw + gap), rw * (ch + gap), cw, ch]; };
  const cams = o.cams ?? 4, feed = o.feed || ((g, i, w, h, t) => defaultFeed(g, i, w, h, t, o));
  for (let i = 1; i <= cams; i++) {
    let [fx, fy, fw, fh] = rect(i); if (i === 4 && foc > 0) { fx = lerp(fx, 0, foc); fy = lerp(fy, 0, foc); fw = lerp(fw, w, foc); fh = lerp(fh, h, foc); }
    if (i !== 4 && foc > 0.98) continue;
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip(); g.translate(fx, fy);
    feed(g, i, fw, fh, t);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#a8c8b0'; g.fillRect(0, 0, fw, fh); g.globalCompositeOperation = 'source-over';            // green-grey tint
    for (let yy = 0; yy < fh; yy += 4) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, yy, fw, 1.5); }                                            // scanlines
    const rb = ((t * 0.35 + i * 0.27) % 1.3) * fh; g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, rb, fw, fh * 0.12);                       // roll bar
    const n = Math.round(fw * fh / 900 * (0.3 + st)); for (let k = 0; k < n; k++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.25 * r()})`; g.fillRect(r() * fw, r() * fh, 2, 2); }
    if (st > 0.6) { g.fillStyle = `rgba(200,210,200,${(st - 0.6) * 1.2})`; for (let k = 0; k < 40; k++) g.fillRect(0, r() * fh, fw, 1 + r() * 3); }
    g.fillStyle = radGrad(g, fw / 2, fh / 2, Math.min(fw, fh) * 0.3, Math.max(fw, fh) * 0.7, ['rgba(0,0,0,0)', 'rgba(0,0,0,.55)']); g.fillRect(0, 0, fw, fh);
    const ts = Math.max(18, Math.min(34, fw * 0.045));
    text(g, `CAM ${i}`, 16, 24, { size: ts, color: '#e8f0e8', font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
    if (Math.sin(t * 5) > -0.2) { circle(g, fw - 24, 24, ts * 0.32, '#ff3a3a'); } text(g, 'REC', fw - 40, 24, { size: ts * 0.8, color: '#e8f0e8', font: FONTS.ui, weight: 900, align: 'right' });
    text(g, o.time || '03:00:12', fw - 16, fh - 22, { size: ts * 0.85, color: '#e8f0e8', font: FONTS.ui, weight: 800, align: 'right' });
    g.restore();
    g.strokeStyle = '#0a0c0e'; g.lineWidth = 3; g.strokeRect(fx, fy, fw, fh);
  }
  glow(g, w / 2, h / 2, Math.max(w, h) * 0.6, '#9ad8b0', 0.08);
  g.restore();
}
// timestamp helper: base 'HH:MM:SS' + seconds
export const stamp = (h, m, s) => { const T = Math.floor(h * 3600 + m * 60 + s); const p = (n) => String(n).padStart(2, '0'); return `${p(Math.floor(T / 3600) % 24)}:${p(Math.floor(T / 60) % 60)}:${p(T % 60)}`; };

// ---------- the wall phone ----------
export function wallPhone(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, ring = clamp(o.ring ?? 0), off = clamp(o.offHook ?? 0), shake = ring > 0 && Math.sin(t * 9) > 0 ? ring : 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.shadowOffsetY = 8; rr(g, -90, -170, 180, 340, 26); g.fillStyle = '#d8ccb0'; g.fill(); g.restore();
  rr(g, -90, -170, 180, 340, 26); g.fillStyle = linGrad(g, -90, 0, 90, 0, ['#e4d8bc', '#c0b498']); g.fill();
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { rr(g, -48 + j * 34, 10 + i * 34, 26, 24, 5); g.fillStyle = '#efe6d0'; g.fill(); }        // keypad
  rr(g, -62, -150, 124, 22, 8); g.fillStyle = '#b8ac90'; g.fill();                                                                         // cradle hooks
  // handset: in the cradle (rattling) or lifted to handTo (local)
  const hs = o.handTo ? [(o.handTo[0] - x) / s, (o.handTo[1] - y) / s] : [160, -40], jx = shake * Math.sin(t * 60) * 5, jy = shake * Math.sin(t * 47) * 4;
  const hx = lerp(0, hs[0], ease.inOut(off)) + jx, hy = lerp(-120, hs[1], ease.inOut(off)) + jy;
  // the coiled cord from the bottom of the base to the handset end
  const cx0 = 70, cy0 = 150, cx1 = hx + 20, cy1 = hy + 80, n = 26; g.strokeStyle = '#b8ac90'; g.lineWidth = 5; g.beginPath();
  for (let i = 0; i <= n * 6; i++) { const u = i / (n * 6), px = lerp(cx0, cx1, u) + Math.sin(u * n * Math.PI * 2) * 9, py = lerp(cy0, cy1, u) + Math.sin(u * Math.PI) * (90 - off * 40) + Math.cos(u * n * Math.PI * 2) * 6; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
  g.save(); g.translate(hx, hy); g.rotate(lerp(0, -0.5, off) + shake * Math.sin(t * 55) * 0.04); rr(g, -26, -120, 52, 240, 24); g.fillStyle = '#dcd0b4'; g.fill(); rr(g, -38, -128, 76, 56, 22); g.fill(); rr(g, -38, 72, 76, 56, 22); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2; g.stroke(); g.restore();
  if (ring > 0) for (let i = 0; i < 3; i++) { const u = (t * 2.2 + i / 3) % 1, rr2 = 120 + u * 90; for (const sd of [-1, 1]) { g.strokeStyle = alpha('#fff1dc', ring * (1 - u) * 0.8); g.lineWidth = 5; g.beginPath(); g.arc(0, -60, rr2, sd > 0 ? -0.5 : Math.PI - 0.5 + 1, sd > 0 ? 0.5 : Math.PI + 0.5); g.stroke(); } }
  if (ring > 0) { circle(g, 60, -100, 8, Math.sin(t * 9) > 0 ? '#ff4a3a' : '#5a2a22'); if (Math.sin(t * 9) > 0) glow(g, 60, -100, 40, '#ff4a3a', 0.6); }
  g.restore();
}

// ---------- the stranger ----------
export function stranger(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, f = o.facing ?? 1, sm = clamp(o.smile ?? 1), lit = clamp(o.lit ?? 0), tap = clamp(o.tap ?? 0), sway = Math.sin(t * 0.6) * 3 + (o.lean ?? 0) * 30;
  const S2 = s * 1.15, col = '#0c0b10', rim = '#a8c0e8';
  g.save(); g.translate(x, y); g.scale(S2 * f, S2);
  // coat: long, narrow, flared hem to the ankles; thin legs below; long arms
  const coat = [[-34 + sway * 0.2, -190], [34 + sway * 0.2, -190], [44, -60], [52, -14], [-52, -14], [-44, -60]];
  seg(g, [[-14, -16], [-16, 0]], 10, col); seg(g, [[14, -16], [16, 0]], 10, col);
  poly(g, coat, col); seg(g, [[0 + sway * 0.2, -188], [4, -20]], 2, alpha('#2a2834', 0.9));                                           // coat seam
  const sh = [24 + sway * 0.2, -184], elb = [lerp(44, 58, tap), lerp(-130, -170, tap)], hand = o.tapAt ? [((o.tapAt[0] - x) / S2) * f, (o.tapAt[1] - y) / S2] : [lerp(40, 70, tap), lerp(-70, -200, tap)];
  seg(g, [sh, elb, hand], 11, col); circle(g, hand[0], hand[1], 8, col);
  seg(g, [[-24 + sway * 0.2, -184], [-34, -120], [-30, -64]], 11, col);
  // neck + small head (too small for the body), slight tilt
  seg(g, [[sway * 0.3, -192], [sway * 0.4, -206]], 12, col); g.save(); g.translate(sway * 0.45, -228); g.rotate(0.08 * Math.sin(t * 0.4)); g.beginPath(); g.ellipse(0, 0, 16, 21, 0, 0, 7); g.fillStyle = col; g.fill();
  // the smile: too wide, pale, catches the light (no eyes, no other features, never blinks)
  if (sm > 0.01) { g.strokeStyle = alpha('#f0ece6', 0.92 * sm); g.lineWidth = 2.6; g.beginPath(); g.moveTo(-17 * sm, 6); g.quadraticCurveTo(0, 6 + 14 * sm, 17 * sm, 6); g.stroke(); g.lineWidth = 1.2; for (let i = -3; i <= 3; i++) { const xx = i * 4.6 * sm, yy = 6 + 14 * sm * (1 - (i / 3.7) ** 2) * 0.5; seg(g, [[xx, yy - 2.4], [xx, yy + 2.4]], 1, alpha('#c8c4be', 0.7 * sm)); } glow(g, 0, 10, 26, '#e8f0ff', 0.12 * sm); }
  g.restore();
  // cold rim light along one edge (the face stays dark)
  if (lit > 0) { g.globalAlpha = lit; seg(g, [[34 + sway * 0.2, -190], [44, -60], [52, -14]], 3, alpha(rim, 0.7)); seg(g, [sh, elb, hand], 2.5, alpha(rim, 0.6)); g.beginPath(); g.arc(sway * 0.45, -228, 25, -1.2, 0.6); g.strokeStyle = alpha(rim, 0.5); g.lineWidth = 2; g.stroke(); g.globalAlpha = 1; }
  g.restore();
  return { head: [x + sway * 0.45 * S2 * f, y - 228 * S2], hand: [x + hand[0] * S2 * f, y + hand[1] * S2] };
}
export function tapRings(g, t, t0, x, y) { for (let i = 0; i < 3; i++) { const u = (t - t0 - i * 0.28) / 0.45; if (u < 0 || u > 1) continue; g.strokeStyle = alpha('#e8f0ff', 0.6 * (1 - u)); g.lineWidth = 3; g.beginPath(); g.arc(x, y, 10 + u * 50, 0, 7); g.stroke(); } }

// ---------- the pay window glass ----------
export function glassPane(g, t, x, y, w, h, o = {}) {
  const fog = clamp(o.fog ?? 0), cond = clamp(o.cond ?? 0.4), r = rng(o.seed ?? 6);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (o.reflect) { g.save(); g.globalAlpha = o.reflectA ?? 0.18; o.reflect(g); g.restore(); }
  g.globalCompositeOperation = 'lighter';
  for (const [u, wd] of [[0.18, 0.09], [0.32, 0.03], [0.7, 0.06]]) { g.fillStyle = 'rgba(200,220,255,.06)'; g.beginPath(); g.moveTo(x + w * u, y); g.lineTo(x + w * (u + wd), y); g.lineTo(x + w * (u + wd - 0.25), y + h); g.lineTo(x + w * (u - 0.25), y + h); g.closePath(); g.fill(); }   // streaks
  g.globalCompositeOperation = 'source-over';
  if (fog > 0) { g.fillStyle = radGrad(g, o.fogX ?? x + w * 0.5, o.fogY ?? y + h * 0.45, 10, w * 0.35, [`rgba(220,230,240,${0.35 * fog})`, 'rgba(220,230,240,0)']); g.fillRect(x, y, w, h); }
  const n = Math.round(90 * cond); for (let i = 0; i < n; i++) { const px = x + r() * w, py = y + h * (0.55 + r() * 0.45), rr2 = 1.5 + r() * 4, run = r() < 0.1 ? ((t * 20 + r() * 400) % 300) : 0; circle(g, px, py + run, rr2, alpha('#dfe8f4', 0.35)); circle(g, px - rr2 * 0.3, py + run - rr2 * 0.3, rr2 * 0.35, alpha('#ffffff', 0.5)); if (run) seg(g, [[px, py], [px, py + run]], 1.2, alpha('#dfe8f4', 0.2)); }
  g.restore();
  if (o.frame !== false) { g.strokeStyle = '#3a3a44'; g.lineWidth = 22; g.strokeRect(x, y, w, h); g.strokeStyle = alpha('#9aa0b0', 0.4); g.lineWidth = 3; g.strokeRect(x + 10, y + 10, w - 20, h - 20); }
  if (o.grille) { const gx = x + w / 2, gy = y + h * (o.grilleY ?? 0.66); circle(g, gx, gy, 48, '#4a4a54'); for (let i = 0; i < 4; i++) ring(g, gx, gy, 12 + i * 10, 3, '#2a2a32'); }
  if (o.drawer) { rr(g, x + w * 0.2, y + h - 30, w * 0.6, 70, 8); g.fillStyle = '#5a5a64'; g.fill(); rr(g, x + w * 0.25, y + h - 10, w * 0.5, 30, 6); g.fillStyle = '#2a2a32'; g.fill(); }
}
