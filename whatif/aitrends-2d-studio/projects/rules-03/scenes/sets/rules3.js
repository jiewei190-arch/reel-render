// sets/rules3.js — THE RULES #3 "The Alert": props + UI (vertical 9:16, 1080x1920). FX: reuse sets/horror.js. Generic alert only
// (no real agency names, logos or real alert wording beyond the script's rules).
//   alertPhone(g, x, y, s, { t, rules: 0..3 (float: each rule types on), buzz: 0..1, at: alert pop-in time, time: '3:00', glow: 0..1, tilt })
//       a phone whose screen is taken over by a full-screen EMERGENCY ALERT: red/black header, warning triangle, "EXTREME ALERT"
//       sub-line, the three rules typing on one by one, an OK button. buzz shakes the phone (vibration lines). Lights the room cold white.
//       Returns { screen: [x, y, w, h] } (world).
//   alertPulse(t, t0) -> 0..1   the alert's scream pattern (3 long pulses then a repeat), to sync glow/shake with the SFX
//   alertCues(at) -> sfx cues for shots.json (kit names: phonebuzz + buzz + high blips), the scream at `at`
//   phonesWindow(g, t, x, y, w, h, { k: 0..1 lit, seed, people: 0..3, frame })   a house window at night with phone glows lighting faces
//       (silhouettes holding phones, cold-blue screen light), lit in a staggered order as k rises
//   tapeRoll(g, x, y, s, { rot, pull: 0..1 (strip pulled out), t })   brown packing tape roll with a strip
//   cardboard(g, t, x, y, w, h, { gaps: 0..1, tape: 0..1 (how many strips are on), light: 0..1 (blades of the outside light), seed, cover: 0..1 })
//       flattened boxes taped over a window: panels, flaps, printed arrows, the tape strips, and warm light leaking through the gaps
//       (light blades fall into the room toward +y). cover 0..1 slides the panels in (taping it up).
//   doorKnob(g, x, y, s, { t, turn: 0..1, strain: 0..1, under: 0..1 (warm light from under the door catching the brass; the shot draws the floor strip) })   a brass knob close-up
//   fingerCount(g, t, n, { x, y, s, rim, facing, tremble })   a hand in the dark raising fingers 1..4 (n float animates the next finger),
//       soft cold rim light along the edges, the palm toward camera; returns tip positions
// Captions are burned in at y ~1330: keep key action out of y 1270-1400 when words are up, and out of the bottom 480 / right 180 px.
import { E, S, clamp, lerp, ease, prog, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, text, measure, FONTS, linGrad, radGrad } from '/engine/core.js';

export const RULES3 = ['Stay inside. Cover every window.', "If it looks like morning outside, it isn't. Don't look.", 'If someone knocks, count your family before you answer.'];
export const OUTSIDE = ['#fff3d6', '#ffd9a0'];                                                     // the light that is not the sun
const wrapUI = (g, str, maxW, size, weight = 800) => { g.save(); g.font = `${weight} ${size}px "${FONTS.ui}"`; const out = []; let line = ''; for (const w of str.split(' ')) { const tst = line ? line + ' ' + w : w; if (g.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; } if (line) out.push(line); g.restore(); return out; };

// ---------- the alert ----------
export function alertPulse(t, t0 = 0) { const u = t - t0; if (u < 0) return 0; const p = u % 4.2; return p < 3.0 ? (p % 1.0 < 0.78 ? 1 : 0.15) : 0.1; }
export const alertCues = (at) => [{ at, name: 'phonebuzz', gain: -8, dur: 3.0 }, { at, name: 'buzz', gain: -12, dur: 3.0 }, ...[0, 1, 2].map(i => ({ at: at + i, name: 'blip', gain: -10, pitch: 2.2, dur: 0.78 }))];
export function alertPhone(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, at = o.at ?? 0, on = t >= at, pop = ease.outBack(prog(t, at, at + 0.25)), buzz = clamp(o.buzz ?? (on ? alertPulse(t, at) : 0));
  const W = 420, H = 860, jx = buzz * Math.sin(t * 90) * 5, jy = buzz * Math.cos(t * 77) * 3, U = S().ui;
  if (on) glow(g, x, y, 700 * s, '#dfe8ff', 0.22 * (o.glow ?? 1) * (0.7 + 0.3 * buzz));
  g.save(); g.translate(x + jx, y + jy); g.rotate((o.tilt ?? 0) + buzz * Math.sin(t * 60) * 0.01); g.scale(s, s);
  if (buzz > 0.3) for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) seg(g, [[sd * (W / 2 + 24 + i * 16), -60 + i * 10], [sd * (W / 2 + 24 + i * 16), 60 - i * 10]], 5, alpha('#e8f0ff', 0.6 - i * 0.15));
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 12; rr(g, -W / 2, -H / 2, W, H, 56); g.fillStyle = '#121216'; g.fill(); g.restore();
  rr(g, -W / 2 + 14, -H / 2 + 14, W - 28, H - 28, 44); g.fillStyle = '#05070c'; g.fill();
  const sx = -W / 2 + 14, sy = -H / 2 + 14, sw = W - 28, sh = H - 28;
  g.save(); rr(g, sx, sy, sw, sh, 44); g.clip();
  // lock screen underneath (big clock), dimmed by the alert
  g.fillStyle = linGrad(g, 0, sy, 0, sy + sh, ['#1a2240', '#0a0e1c']); g.fillRect(sx, sy, sw, sh);
  text(g, o.time || '3:00', 0, sy + 150, { size: 120, color: alpha('#e8eeff', 0.85), font: FONTS.ui, weight: 800 });
  if (on) {
    g.save(); g.globalAlpha = clamp(pop * 1.2); g.translate(0, (1 - pop) * 40);
    g.fillStyle = 'rgba(8,8,12,.94)'; g.fillRect(sx, sy, sw, sh);
    g.fillStyle = buzz > 0.5 ? '#d8222a' : '#a8181e'; g.fillRect(sx, sy, sw, 210);                                          // red header
    poly(g, [[0, sy + 40], [44, sy + 116], [-44, sy + 116]], '#fff'); text(g, '!', 0, sy + 92, { size: 52, color: '#a8181e', font: FONTS.ui, weight: 900 });
    text(g, 'EMERGENCY ALERT', 0, sy + 160, { size: 32, color: '#fff', font: FONTS.ui, weight: 900, spacing: 2 });
    text(g, 'EXTREME THREAT · YOUR AREA', 0, sy + 250, { size: 19, color: '#ff8a8a', font: FONTS.ui, weight: 900, spacing: 2 });
    let yy = sy + 320; const R = o.rules ?? 0;
    RULES3.forEach((rule, i) => { const k = clamp(R - i); if (k <= 0) return; const L = wrapUI(g, `${i + 1}. ${rule}`, sw - 70, 30, 800), n = L.join(' ').length; let used = 0;
      L.forEach((ln, j) => { const kk = clamp((k * n - used) / ln.length); used += ln.length + 1; const str = ln.slice(0, Math.ceil(kk * ln.length)); text(g, str, sx + 36, yy + j * 40, { size: 30, color: '#f2f2f2', font: FONTS.ui, weight: 800, align: 'left' }); if (kk > 0 && kk < 1 && Math.sin(t * 12) > 0) { g.font = `800 30px "${FONTS.ui}"`; g.fillStyle = '#f2f2f2'; g.fillRect(sx + 36 + g.measureText(str).width + 4, yy + j * 40 - 16, 3, 32); } });
      yy += L.length * 40 + 28; });
    rr(g, sx + 40, sy + sh - 130, sw - 80, 76, 20); g.fillStyle = '#2a2a32'; g.fill(); text(g, 'OK', 0, sy + sh - 92, { size: 34, color: '#f2f2f2', font: FONTS.ui, weight: 900 });
    g.restore();
  }
  g.fillStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + sw * 0.5, sy); g.lineTo(sx, sy + sh * 0.4); g.closePath(); g.fill();   // glass glint
  g.restore();
  rr(g, -60, -H / 2 + 26, 120, 26, 13); g.fillStyle = '#000'; g.fill();                                                      // notch
  g.restore();
  return { screen: [x - (W / 2 - 14) * s, y - (H / 2 - 14) * s, (W - 28) * s, (H - 28) * s] };
}

// ---------- a window full of phone glows ----------
export function phonesWindow(g, t, x, y, w, h, o = {}) {
  const k = clamp(o.k ?? 1), r = rng(o.seed ?? 3), n = o.people ?? 2, ink = '#05060a';
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#06080e'; g.fillRect(x, y, w, h);
  const any = k > 0.02; if (any) { g.fillStyle = `rgba(150,180,255,${0.18 * k})`; g.fillRect(x, y, w, h); }
  for (let i = 0; i < n; i++) { const th = r() * 0.6, on = k > th, px = x + w * (0.25 + i * (0.5 / Math.max(1, n - 1))) + (r() - 0.5) * w * 0.1, py = y + h * (0.55 + r() * 0.15), sc = h / 520;
    g.fillStyle = ink; g.beginPath(); g.ellipse(px, py + 120 * sc, 70 * sc, 110 * sc, 0, Math.PI, 0); g.fill(); circle(g, px, py - 20 * sc, 40 * sc, ink);
    if (on) { const fl = 0.85 + 0.15 * noise(t * 8, i), sx = px + (r() - 0.5) * 30 * sc, sy = py + 40 * sc; rr(g, sx - 14 * sc, sy - 22 * sc, 28 * sc, 44 * sc, 5 * sc); g.fillStyle = '#e8f0ff'; g.fill(); glow(g, sx, sy - 30 * sc, 160 * sc, '#bcd0ff', 0.55 * fl);
      g.fillStyle = alpha('#9ab8ff', 0.35 * fl); g.beginPath(); g.ellipse(px, py - 14 * sc, 30 * sc, 34 * sc, 0, 0, 7); g.fill(); } }   // the face lit from below
  g.restore();
  if (o.frame !== false) { g.strokeStyle = '#1a1c24'; g.lineWidth = 14; g.strokeRect(x, y, w, h); seg(g, [[x + w / 2, y], [x + w / 2, y + h]], 8, '#1a1c24'); seg(g, [[x, y + h / 2], [x + w, y + h / 2]], 8, '#1a1c24'); }
}

// ---------- tape + cardboard ----------
export function tapeRoll(g, x, y, s = 1, o = {}) {
  const pull = clamp(o.pull ?? 0), rot = o.rot ?? 0;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  circle(g, 0, 0, 70, '#a8783a'); circle(g, 0, 0, 66, '#c8955a'); for (let i = 0; i < 5; i++) ring(g, 0, 0, 44 + i * 4, 1.5, alpha('#8a5a2a', 0.35)); circle(g, 0, 0, 40, '#d8c8a8'); circle(g, 0, 0, 30, '#1a1418');
  glow(g, -22, -30, 40, '#fff1d0', 0.25);
  if (pull > 0) { const L = 40 + pull * 360; g.fillStyle = alpha('#c8955a', 0.92); g.beginPath(); g.moveTo(0, -70); g.lineTo(L, -70 + L * 0.12); g.lineTo(L + 8, -30 + L * 0.12); g.lineTo(0, -30 + 10); g.closePath(); g.fill(); for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6 * L; seg(g, [[u, -64 + u * 0.12], [u - 6, -38 + u * 0.12]], 1, alpha('#ffffff', 0.25)); } }
  g.restore();
}
export function cardboard(g, t, x, y, w, h, o = {}) {
  const gaps = clamp(o.gaps ?? 0.5), tapeK = clamp(o.tape ?? 1), lt = clamp(o.light ?? 1), cov = clamp(o.cover ?? 1), r = rng(o.seed ?? 8);
  const panels = [[x, y, w * 0.56, h * 0.52], [x + w * 0.56, y, w * 0.44, h * 0.48], [x, y + h * 0.52, w * 0.5, h * 0.48], [x + w * 0.5, y + h * 0.48, w * 0.5, h * 0.52]];
  const gapLines = [];                                                                                                  // where the seams leak
  // the light first (behind the panels): the window itself glowing
  if (lt > 0) { g.fillStyle = radGrad(g, x + w / 2, y + h / 2, 10, Math.max(w, h) * 0.8, [alpha(OUTSIDE[0], 0.95 * lt), alpha(OUTSIDE[1], 0.7 * lt), alpha(OUTSIDE[1], 0.3 * lt)]); g.fillRect(x, y, w, h); }
  panels.forEach(([px, py, pw, ph], i) => {
    const k = clamp(cov * 4 - i); if (k <= 0) return; const off = (1 - ease.out(k)) * (i % 2 ? 1 : -1) * w * 0.6, g2 = gaps * (6 + r() * 14);
    const X = px + off + g2 * 0.5, Y = py + g2 * 0.5, Wp = pw - g2, Hp = ph - g2;
    g.fillStyle = shade('#b08a5a', -0.25 - 0.05 * i); g.fillRect(X, Y, Wp, Hp);
    for (let j = 0; j < 6; j++) seg(g, [[X, Y + Hp * (j + 0.5) / 6], [X + Wp, Y + Hp * (j + 0.5) / 6 + (r() - 0.5) * 6]], 1.5, alpha('#5a4020', 0.12));    // corrugation
    if (i === 1) { seg(g, [[X + Wp * 0.3, Y + Hp * 0.5], [X + Wp * 0.3, Y + Hp * 0.25]], 8, alpha('#2a2020', 0.6)); poly(g, [[X + Wp * 0.3 - 18, Y + Hp * 0.28], [X + Wp * 0.3 + 18, Y + Hp * 0.28], [X + Wp * 0.3, Y + Hp * 0.18]], alpha('#2a2020', 0.6)); text(g, 'THIS SIDE UP', X + Wp * 0.62, Y + Hp * 0.36, { size: 20, color: alpha('#2a2020', 0.6), font: FONTS.ui, weight: 900 }); }
    if (i === 2) text(g, 'FRAGILE', X + Wp * 0.5, Y + Hp * 0.55, { size: 34, color: alpha('#8a2a20', 0.55), font: FONTS.ui, weight: 900, spacing: 4 });
    gapLines.push([X, Y, Wp, Hp]);
  });
  // light blades through the seams (cast into the room)
  if (lt > 0 && gaps > 0.02 && cov > 0.95) { g.save(); g.globalCompositeOperation = 'lighter';
    for (const [sx0, sy0, ex, ey, wd] of [[x + w * 0.5, y + h * 0.1, x + w * 0.6, y + h * 2.2, 0.06], [x + w * 0.15, y + h * 0.5, x + w * 0.3, y + h * 2.4, 0.05], [x + w * 0.8, y + h * 0.48, x + w * 1.0, y + h * 2.3, 0.04]]) {
      const fl = 0.85 + 0.15 * noise(t * 0.7, sx0); g.fillStyle = linGrad(g, sx0, sy0, ex, ey, [alpha(OUTSIDE[0], 0.32 * lt * gaps * fl), alpha(OUTSIDE[1], 0)]); g.beginPath(); g.moveTo(sx0 - w * 0.01, sy0); g.lineTo(sx0 + w * 0.01, sy0); g.lineTo(ex + w * wd, ey); g.lineTo(ex - w * wd, ey); g.closePath(); g.fill(); }
    for (let i = 0; i < 26; i++) { const u = (t * 0.05 + i * 0.137) % 1, px = lerp(x + w * 0.5, x + w * 0.62, u) + Math.sin(t + i) * 20, py = lerp(y + h * 0.2, y + h * 1.8, (i * 0.37 + t * 0.03) % 1); circle(g, px, py, 2 + (i % 3), alpha(OUTSIDE[0], 0.35 * lt * gaps)); }   // dust motes in the blade
    g.restore(); }
  // tape strips: X across the middle + edges
  const strips = [[x - 10, y + h * 0.5, x + w + 10, y + h * 0.5], [x + w * 0.53, y - 10, x + w * 0.53, y + h + 10], [x - 10, y + 20, x + w + 10, y + 30], [x - 10, y + h - 20, x + w + 10, y + h - 30], [x + 20, y - 10, x + 30, y + h + 10], [x + w - 20, y - 10, x + w - 30, y + h + 10]];
  strips.forEach(([ax, ay, bx, by], i) => { const k = clamp(tapeK * strips.length - i); if (k <= 0) return; const ex = lerp(ax, bx, k), ey = lerp(ay, by, k); g.strokeStyle = alpha('#c8955a', 0.88); g.lineWidth = 34; g.lineCap = 'butt'; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = alpha('#ffffff', 0.18); g.lineWidth = 6; g.beginPath(); g.moveTo(ax, ay - 8); g.lineTo(ex, ey - 8); g.stroke(); });
  // seam glow (thin bright lines where the panels don't meet)
  if (lt > 0 && gaps > 0.02) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha(OUTSIDE[0], 0.5 * lt * gaps); g.lineWidth = 3 + gaps * 4; g.filter = 'blur(2px)'; for (const [px, py, pw, ph] of gapLines) g.strokeRect(px, py, pw, ph); g.filter = 'none'; g.restore(); }
}

// ---------- the doorknob ----------
export function doorKnob(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, turn = clamp(o.turn ?? 0), strain = clamp(o.strain ?? 0), under = clamp(o.under ?? 0), jit = strain * noise(t * 40, 3) * 0.04;
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -90, -260, 180, 520, 40); g.fillStyle = linGrad(g, -90, 0, 90, 0, ['#8a6a30', '#c8a050', '#7a5a28']); g.fill();          // backplate
  circle(g, 0, 150, 22, '#2a1c10'); poly(g, [[-10, 150], [10, 150], [6, 200], [-6, 200]], '#2a1c10');                             // keyhole
  g.save(); g.rotate(turn * 0.6 + jit);
  circle(g, 6, 12, 120, 'rgba(0,0,0,.35)'); g.fillStyle = radGrad(g, -40, -40, 10, 130, ['#f8e2a0', '#c8a050', '#6a4a20']); g.beginPath(); g.arc(0, 0, 118, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-40, -46, 40, 22, -0.6, 0, 7); g.fill();
  g.restore();
  if (under > 0) glow(g, 0, 260, 260, OUTSIDE[1], 0.18 * under);                                   // the warm light from below catching the brass
  g.restore();
}

// ---------- counting on fingers ----------
// local hand space: palm centre at (0,0), fingers point up (-y), palm facing the camera, thumb on the left (facing 1)
const FINGERS = [[-30, 34], [-8, 38], [14, 36], [34, 30]];                         // index, middle, ring, pinky: base x, length scale
export function fingerCount(g, t, n, o = {}) {
  const x = o.x ?? E.W / 2, y = o.y ?? E.H * 0.5, s = o.s ?? 3, f = o.facing ?? 1, rim = o.rim ?? '#9ab8ff', ink = '#0a0a10', tr = (o.tremble ?? 0.3) * noise(t * 14, 5) * 2;
  const tips = [];
  g.save(); g.translate(x + tr, y); g.scale(s * f, s);
  const shape = () => {
    g.beginPath(); g.moveTo(-46, 30); g.quadraticCurveTo(-50, -20, -40, -30); g.lineTo(44, -30); g.quadraticCurveTo(52, 0, 44, 40); g.quadraticCurveTo(10, 70, -30, 60); g.closePath(); g.fill();   // palm
    g.beginPath(); g.ellipse(-8, 92, 34, 52, 0, 0, 7); g.fill(); g.fillRect(-36, 60, 56, 90);                                  // wrist
    // thumb folded across the palm
    g.save(); g.translate(-44, 20); g.rotate(-0.9); rr(g, -10, -42, 22, 50, 11); g.fill(); g.restore();
    FINGERS.forEach(([bx, L], i) => { const up = clamp(n - i), len = lerp(14, L * 2.1, ease.outBack(up)), w = i === 3 ? 15 : 18; rr(g, bx - w / 2, -30 - len, w, len + 8, w / 2); g.fill(); tips[i] = [bx, -30 - len]; });
  };
  // rim: draw the shape slightly offset in the rim colour, then the dark hand over it
  g.save(); g.translate(-3, -2); g.fillStyle = alpha(rim, 0.75); shape(); g.restore();
  g.fillStyle = ink; shape();
  g.restore();
  glow(g, x - 30 * s * f, y - 40 * s, 180 * s, rim, 0.06);
  return tips.map(([tx, ty]) => [x + tx * s * f, y + ty * s]);
}
