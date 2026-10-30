// sets/zombies.js — What If SHORT "Zombie Apocalypse With Zero Experience", HORROR version (owner Oct 31: dark, horror). 9:16.
// HORROR BAR (projects/rules-01/HANDOFF.md): the zombies are SILHOUETTES you never see clearly. No gore, no blood, no bites, no weapons.
//   zombieSil(g, x, y, s, { t, sway: 0..1, eyes: 0..1 (two pale glints that catch a flashlight), tilt, facing, rim: 0..1 (moon rim),
//                           arms: 'hang'|'reach', step: world x (slow drag-walk phase, null = standing), seed, color })
//       a dark slumped figure: hunched shoulders, head tilted too far, ragged/torn coat edges, long hanging arms, uneven stance.
//       Returns { head: [x, y], eyes: [x, y] } (world).
//   handsOnGlass(g, t, x, y, s, { press: 0..1, slide: 0..1 (drags down, leaving a condensation smear), rot, seed, fog: 0..1 })
//       a palm and spread fingers pressed on glass, seen from inside: dark hand, pale blanched contact pads, a fog halo of breath
//       around it, a streak where it slides. No blood.
//   glassHorde(g, t, { x, y, w, h (the window rect), n, press: 0..1, hits: [t...], moon: 0..1, seed, back: bool, frame: bool })
//       the store-front window from inside: the moonlit lot behind (back: true draws it), a packed crowd of silhouettes at several depths
//       (the nearest are cropped by the frame and press against the glass), hands slapping the glass on each `hits` time (thud
//       flashes + shake), condensation smears that build up, glass streaks + mullions. Returns { shake: [dx, dy], k } — apply the
//       shake to your camera for the thuds.
//   thudShake(t, hits, amp) -> [dx, dy]   the decaying shake for a list of hit times
import { E, S, clamp, lerp, ease, prog, rng, noise, rr, seg, circle, poly, alpha, shade, mix, glow, linGrad, radGrad } from '/engine/core.js';

const INK = '#07080c';

// ---------- one silhouette ----------
export function zombieSil(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, f = o.facing ?? 1, seed = o.seed ?? 1, r = rng(Math.floor(seed * 97) + 3), col = o.color ?? INK;
  const sway = (o.sway ?? 0.6) * Math.sin(t * 0.7 + seed) * 8, tilt = o.tilt ?? (0.35 + 0.15 * Math.sin(seed * 3)), drag = o.step != null ? Math.sin((o.step / (90 * s)) * Math.PI) : 0;
  const reach = o.arms === 'reach';
  g.save(); g.translate(x, y); g.scale(s * f, s);
  // legs: uneven, one knee bent, a foot dragging
  seg(g, [[-10, -100], [-14 + drag * 10, -52], [-18 + drag * 16, 0]], 15, col); seg(g, [[12, -100], [20, -54], [16 - drag * 8, -2]], 15, col);
  // torso: hunched, shoulders slumped forward, coat with a torn ragged hem
  const sh = [6 + sway * 0.3, -186], hip = [0, -100];
  g.fillStyle = col; g.beginPath(); g.moveTo(-26 + sway * 0.2, -184); g.quadraticCurveTo(8, -206, 34 + sway * 0.3, -180); g.lineTo(32, -120);
  for (let i = 0; i <= 8; i++) { const u = i / 8, hx = lerp(34, -30, u), hy = -78 + (i % 2 ? 14 : -4) + r() * 12; g.lineTo(hx, hy); }            // torn hem
  g.lineTo(-30, -130); g.closePath(); g.fill();
  for (let i = 0; i < 3; i++) { const px = -20 + r() * 44, py = -170 + r() * 70; poly(g, [[px, py], [px + 6, py + 10], [px - 2, py + 14]], alpha('#000', 0.6)); }  // rips
  // arms: long, hanging past the knees (or reaching forward)
  const handF = reach ? [86 + sway * 0.3, -170 + Math.sin(t * 1.3 + seed) * 4] : [30 + sway * 0.5, -40 + Math.sin(t * 0.9 + seed) * 4];
  const handB = reach ? [74, -160] : [-24 + sway * 0.3, -46];
  seg(g, [[28 + sway * 0.3, -180], reach ? [58, -176] : [36, -120], handF], 12, col); seg(g, [[-22, -180], reach ? [40, -168] : [-30, -122], handB], 12, col);
  for (const [hx, hy] of [handF, handB]) { circle(g, hx, hy, 9, col); for (let k = 0; k < 4; k++) seg(g, [[hx, hy], [hx + (k - 1.5) * 4 + (reach ? 10 : 0), hy + (reach ? -2 + k * 2 : 14 + k % 2 * 3)]], 3.5, col); }
  // neck + head, tilted too far
  g.save(); g.translate(14 + sway * 0.4, -200); g.rotate(tilt + Math.sin(t * 0.4 + seed) * 0.05);
  seg(g, [[0, 6], [6, -10]], 11, col); g.beginPath(); g.ellipse(10, -28, 17, 21, 0.1, 0, 7); g.fill();
  for (let k = 0; k < 5; k++) seg(g, [[2 + k * 4, -46], [-2 + k * 4 + r() * 6, -60 - r() * 10]], 2.5, col);                                          // a few strands
  const ey = clamp(o.eyes ?? 0); if (ey > 0.01) { for (const ex of [6, 18]) { circle(g, ex, -30, 2.6, alpha('#f2f0e0', ey)); glow(g, ex, -30, 14, '#e8f0ff', 0.45 * ey); } }
  g.restore();
  // moon rim along the top edges
  const rm = clamp(o.rim ?? 0); if (rm > 0) { g.strokeStyle = alpha('#9ab0d8', 0.55 * rm); g.lineWidth = 2.5; g.beginPath(); g.moveTo(-26 + sway * 0.2, -184); g.quadraticCurveTo(8, -206, 34 + sway * 0.3, -180); g.stroke(); }
  g.restore();
  const hx = x + (14 + sway * 0.4 + 12) * s * f, hy = y - 228 * s;
  return { head: [hx, hy], eyes: [hx, hy - 2 * s] };
}

// ---------- a hand on the glass ----------
export function handsOnGlass(g, t, x, y, s = 1, o = {}) {
  const pr = clamp(o.press ?? 1), sl = clamp(o.slide ?? 0), r = rng(o.seed ?? 5), dy = sl * 160;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  // smear left behind as it slides (condensation, not blood)
  if (sl > 0) { g.fillStyle = linGrad(g, 0, -20, 0, dy + 40, ['rgba(200,215,235,.0)', 'rgba(200,215,235,.18)', 'rgba(200,215,235,.05)']); for (let k = 0; k < 4; k++) { rr(g, -38 + k * 20, -30 - k * 6, 12, dy + 30, 6); g.fill(); } }
  g.translate(0, dy);
  // breath / warmth fog halo
  const fg = clamp(o.fog ?? 0.6); if (fg > 0) { g.fillStyle = radGrad(g, 0, -20, 20, 130, [`rgba(210,222,240,${0.22 * fg})`, 'rgba(210,222,240,0)']); g.beginPath(); g.arc(0, -20, 130, 0, 7); g.fill(); }
  // palm + fingers (spread); a hard press flattens the pads (pale contact)
  const sp = 1 + 0.06 * pr, fingers = [[-34, -70, 52, -0.35], [-12, -86, 62, -0.12], [10, -88, 64, 0.06], [30, -78, 56, 0.24], [44, -20, 42, 0.95]];
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 40 * sp, 46 * sp, 0, 0, 7); g.fill();
  for (const [fx, fy, L, a] of fingers) { g.save(); g.translate(fx * 0.6, fy * 0.3); g.rotate(a); rr(g, -8 * sp, -L * sp, 16 * sp, L * sp + 10, 8); g.fill(); g.restore(); }
  if (pr > 0.05) { g.fillStyle = radGrad(g, -6, 10, 2, 30, [alpha('#aeb8c8', 0.16 * pr), alpha('#aeb8c8', 0)]); g.beginPath(); g.ellipse(-6, 10, 30, 30, 0, 0, 7); g.fill(); g.fillStyle = alpha('#aeb8c8', 0.14 * pr); for (const [fx, fy, L, a] of fingers) { g.save(); g.translate(fx * 0.6, fy * 0.3); g.rotate(a); g.beginPath(); g.ellipse(0, -L * sp + 12, 4, 6, 0, 0, 7); g.fill(); g.restore(); } }   // faint blanched pads where the skin presses
  g.restore();
}

export function thudShake(t, hits = [], amp = 12) { let dx = 0, dy = 0; for (const h of hits) { const u = t - h; if (u < 0 || u > 0.6) continue; const d = amp * Math.exp(-u * 8); dx += noise(t * 40, h * 7) * d; dy += noise(t * 40, h * 11) * d; } return [dx, dy]; }

// ---------- the horde on the store-front glass ----------
export function glassHorde(g, t, o = {}) {
  const x = o.x ?? 0, y = o.y ?? E.H * 0.18, w = o.w ?? E.W, h = o.h ?? E.H * 0.55, n = o.n ?? 18, pr = clamp(o.press ?? 1), moon = clamp(o.moon ?? 1), hits = o.hits || [], r = rng(o.seed ?? 13);
  const shake = thudShake(t, hits, 10);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (o.back !== false) {                                                                                 // the moonlit lot behind them
    g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#1a2436', '#2a3a52', '#141a26']); g.fillRect(x, y, w, h);
    glow(g, x + w * 0.75, y + h * 0.12, w * 0.5, '#c8d8ff', 0.35 * moon); circle(g, x + w * 0.75, y + h * 0.12, 26, alpha('#e8eeff', 0.9 * moon));
    for (let i = 0; i < 3; i++) { const lx = x + w * (0.15 + i * 0.32); seg(g, [[lx, y + h * 0.75], [lx, y + h * 0.3]], 5, '#0c1018'); }        // dead lot lamps
    g.fillStyle = '#10141c'; g.fillRect(x, y + h * 0.76, w, h * 0.24);
  }
  // crowd in depth: far (small, faint), mid, near (big, cropped, pressing)
  const crowd = [];
  for (let i = 0; i < n; i++) { const d = i < n * 0.35 ? 0 : i < n * 0.7 ? 1 : 2; crowd.push({ d, x: x + r() * w, seed: r() * 10, f: r() < 0.5 ? 1 : -1 }); }
  crowd.sort((a, b) => a.d - b.d);
  for (const c of crowd) {
    const sc = [0.9, 1.5, 2.6][c.d] * (h / 1000), base = y + h * [0.82, 0.95, 1.25][c.d], lean = c.d === 2 ? pr * 0.25 : 0;
    g.save(); g.globalAlpha *= [0.5, 0.8, 1][c.d];
    zombieSil(g, c.x, base, sc, { t, seed: c.seed, facing: c.f, rim: moon * [0.3, 0.6, 0.9][c.d], arms: c.d === 2 ? 'reach' : 'hang', tilt: 0.3 + lean, sway: 0.8 });
    g.restore();
  }
  // hands pressed on the glass: a fixed set; each one slaps in on its hit and stays, sliding slowly
  const hs = rng((o.seed ?? 13) + 7), nh = o.hands ?? 9;
  for (let i = 0; i < nh; i++) { const hx = x + w * (0.08 + hs() * 0.84), hy = y + h * (0.25 + hs() * 0.5), hitT = hits.length ? hits[i % hits.length] : -1, on = hits.length ? clamp((t - hitT) / 0.08) : pr, rot = (hs() - 0.5) * 0.6, sz = 0.55 + hs() * 0.35;
    if (on <= 0) continue; const sl = hits.length ? clamp((t - hitT - 0.4) / 6) * hs() : 0;
    handsOnGlass(g, t, hx, hy, sz * (1 + 0.15 * Math.exp(-(t - hitT) * 12)), { press: pr * on, slide: sl, rot, seed: i, fog: 0.7 }); }
  // the glass itself: reflection streaks, condensation, a thud flash on every hit
  g.globalCompositeOperation = 'lighter';
  for (const [u, wd] of [[0.12, 0.1], [0.28, 0.035], [0.66, 0.07]]) { g.fillStyle = 'rgba(190,210,255,.05)'; g.beginPath(); g.moveTo(x + w * u, y); g.lineTo(x + w * (u + wd), y); g.lineTo(x + w * (u + wd - 0.3), y + h); g.lineTo(x + w * (u - 0.3), y + h); g.closePath(); g.fill(); }
  for (const hT of hits) { const u = t - hT; if (u >= 0 && u < 0.18) { g.fillStyle = `rgba(200,215,240,${0.12 * (1 - u / 0.18)})`; g.fillRect(x, y, w, h); } }
  g.globalCompositeOperation = 'source-over';
  const cr = rng(31); for (let i = 0; i < 70; i++) { const px = x + cr() * w, py = y + h * (0.6 + cr() * 0.4), rad = 1.5 + cr() * 3.5; circle(g, px, py, rad, alpha('#d8e2f0', 0.25)); }
  g.restore();
  if (o.frame !== false) { g.strokeStyle = '#1a1c22'; g.lineWidth = 26; g.strokeRect(x, y, w, h); for (const u of [0.34, 0.67]) seg(g, [[x + w * u, y], [x + w * u, y + h]], 16, '#1a1c22'); seg(g, [[x, y + h * 0.5], [x + w, y + h * 0.5]], 10, '#16181e'); }
  return { shake, k: pr };
}
