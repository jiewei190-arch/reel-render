// DEMO_fx5.js — look-dev sheet for sets/fx5.js (temporary demo_* ids, not bound to the voice). 16:9.
// The figure here is a LOCAL PLACEHOLDER silhouette in the STYLE.md outfit (navy bomber with cyan trim, white tee, charcoal joggers, white
// trainers, chestnut hair with a front swoop) so the effects can be judged; the real hero is H1's rig5.js hero5().
//   demo_fx_aura     night park on the hill road: low angle push-in, STEAM AURA, cyan + violet rim light, heat haze, bloom, night grade
//   demo_fx_lift     the lawn lift: slow-mo raise with motion streaks, the feet sink into the soil, impact frame + ground crack + dust,
//                    patio tile crack, focus speed lines (clear of the figure), hit shake
//   demo_fx_levelup  the level-up beat on its own: hush, a glowing placeholder panel (NOT the Stat Card: H2 owns that), smash flash,
//                    5-frame freeze, 3 px shake, gold focus lines, then cyan streaks; bloom + grade
import { E, registerShot, layer, ease, prog, clamp, lerp, rng, seg, circle, rr, poly, glow, alpha, shade, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { P5, bloom, nightGrade, heatHaze, glowDraw, rimLight, trail, slowMo, freeze, hitShake, smashFlash, impactFrame, groundCrack, soilSink, soilLip, tileCrack, dustBurst, steamAura, speedLines5, lowAngle, lowAngleWrap } from '../sets/fx5.js';

// ---------- local placeholder figure (feet at x, y; ~7 heads tall at s = 1: 440 px) ----------
function figure(g, x, y, s = 1, o = {}) {
  const arms = o.arms ?? 0, bend = o.bend ?? 0, J = '#1C2A44', Jd = '#121c30', SK = '#e8b48e', HAIR = '#5a3420';
  g.save(); g.translate(x, y); g.scale(s, s);
  const hip = [0, -205 + bend * 30], sh = [0, -345 + bend * 30], head = [0, -400 + bend * 30];
  // legs (charcoal joggers) + white trainers
  for (const sd of [-1, 1]) { seg(g, [[sd * 14, hip[1]], [sd * (18 + bend * 16), -100 + bend * 10], [sd * 20, -18]], 30, sd < 0 ? '#3a3d44' : '#43464e'); rr(g, sd * 20 - 24, -22, 52, 22, 10); g.fillStyle = '#f4f4f0'; g.fill(); g.fillStyle = '#9a9ca4'; g.fillRect(sd * 20 - 24, -6, 52, 6); }
  // torso: white tee under an open navy bomber, cyan zip pull + cuff stripes
  poly(g, [[-46, sh[1] + 6], [46, sh[1] + 6], [40, hip[1] + 12], [-40, hip[1] + 12]], J);
  poly(g, [[-14, sh[1] + 10], [14, sh[1] + 10], [12, hip[1] + 2], [-12, hip[1] + 2]], '#f2f2ee');
  seg(g, [[-15, sh[1] + 14], [-14, hip[1] + 8]], 3, Jd); seg(g, [[15, sh[1] + 14], [14, hip[1] + 8]], 3, Jd); rr(g, -48, hip[1] - 4, 96, 22, 8); g.fillStyle = Jd; g.fill();
  rr(g, 10, sh[1] + 70, 6, 18, 3); g.fillStyle = P5.cyan; g.fill();
  // arms: arms 0 = down, 1 = overhead
  for (const sd of [-1, 1]) { const el = [sd * lerp(56, 62, arms), lerp(sh[1] + 80, sh[1] - 50, arms)], hd = [sd * lerp(58, 44, arms), lerp(sh[1] + 150, sh[1] - 130, arms)];
    seg(g, [[sd * 42, sh[1] + 14], el, hd], 24, sd < 0 ? Jd : J); const cu = [lerp(el[0], hd[0], 0.82), lerp(el[1], hd[1], 0.82)]; seg(g, [cu, [cu[0] + 0.1, cu[1] + 0.1]], 26, P5.cyan2); circle(g, hd[0], hd[1], 12, SK); }
  // head: skin, ear, chestnut hair with the stubborn front swoop, warm brown eyes (never glowing)
  seg(g, [[0, sh[1] + 6], [0, sh[1] - 18]], 18, shade(SK, -0.1)); g.fillStyle = SK; g.beginPath(); g.ellipse(head[0], head[1], 30, 37, 0, 0, 7); g.fill();
  g.fillStyle = HAIR; g.beginPath(); g.ellipse(head[0] - 2, head[1] - 18, 33, 24, 0, Math.PI, 0); g.fill(); poly(g, [[-30, head[1] - 14], [-8, head[1] - 46], [26, head[1] - 52 - (o.swoop ?? 0) * 18], [18, head[1] - 26]], HAIR);
  for (const sd of [-1, 1]) { circle(g, sd * 11 + 4, head[1] + 2, 5, '#ffffff'); circle(g, sd * 11 + 5, head[1] + 3, 3.2, '#6a3e22'); seg(g, [[sd * 11 - 3, head[1] - 10], [sd * 11 + 11, head[1] - 11]], 3, HAIR); }
  seg(g, [[-4, head[1] + 20], [10, head[1] + 19]], 2.5, '#9a5a48');
  g.restore();
}

// ---------- local night set: the park on the hill road (placeholder backdrop; H4 owns town5.js) ----------
function nightPark(g, t, cam) {
  const GY = E.H * 0.8;
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, -300, 0, E.H, ['#070a14', P5.ink, P5.navy, '#1c2440']); g.fillRect(-600, -600, E.W + 1200, E.H + 1200);
    const r = rng(3); for (let i = 0; i < 90; i++) circle(g, r() * E.W * 1.4 - 200, r() * E.H * 0.5 - 100, r() * 1.6 + 0.3, alpha('#cfe0ff', 0.25 + r() * 0.4)); });
  layer(g, cam, 0.25, (g) => { const r = rng(7); g.fillStyle = '#10162a'; g.beginPath(); g.moveTo(-600, GY - 160); for (let x = -600; x <= E.W + 600; x += 80) g.lineTo(x, GY - 200 - Math.sin(x * 0.004) * 50 - r() * 12); g.lineTo(E.W + 600, GY); g.lineTo(-600, GY); g.fill();
    rr(g, E.W * 0.72, GY - 520, 260, 360, 6); g.fillStyle = '#121a30'; g.fill(); for (let j = 0; j < 9; j++) for (let i = 0; i < 6; i++) if (r() > 0.45) { rr(g, E.W * 0.72 + 22 + i * 40, GY - 500 + j * 36, 22, 18, 2); g.fillStyle = r() > 0.3 ? '#ffcf7a' : '#9ad8ff'; g.fill(); } });
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, E.H + 300, ['#1a2238', '#0f1526']); g.fillRect(-800, GY - 40, E.W + 1600, 900);       // wet path
    g.fillStyle = '#16243a'; g.fillRect(-800, GY - 70, E.W + 1600, 34);                                                         // kerb / grass edge
    for (const lx of [E.W * 0.12, E.W * 0.88]) { seg(g, [[lx, GY - 50], [lx, GY - 560], [lx + 40, GY - 580]], 10, '#0a0e18'); rr(g, lx + 24, GY - 590, 60, 20, 8); g.fillStyle = '#ffd59a'; g.fill();
      glow(g, lx + 54, GY - 575, 300, P5.sodium, 0.45); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 260, [alpha(P5.sodium, 0.35), alpha(P5.sodium, 0)]); g.fillRect(lx + 30, GY - 40, 48, 300); g.restore(); }   // reflection on the wet path
    rr(g, E.W * 0.68, GY - 130, 260, 18, 6); g.fillStyle = '#2a2030'; g.fill(); for (const bx of [E.W * 0.69, E.W * 0.68 + 240]) seg(g, [[bx, GY - 112], [bx, GY - 50]], 8, '#1a1420');  // a bench
  });
  return GY;
}

// demo_fx_aura: the night-park steam aura, low angle push-in
registerShot('demo_fx_aura', { draw(g, t, info) {
  const cam = lowAngle(t, info.dur, { z: [1.0, 1.1], lift: 120 });
  let GY; lowAngleWrap(g, 1, E.H * 0.8, () => { GY = nightPark(g, t, cam); });
  const hx = E.W * 0.47, k = ease.out(prog(t, 0.4, 2.0)), br = Math.sin(t * 2.2) * 2;
  layer(g, cam, 1, (g) => lowAngleWrap(g, 1, GY, () => {
    glow(g, hx, GY - 10, 260, P5.cyan, 0.12 * k);                                                             // the card's underlight on the path
    rimLight(g, (x) => figure(x, hx, GY + br * 0, 1.15, { bend: 0 }), { dir: [1, -0.25], width: 7, a: 0.95 * (0.4 + 0.6 * k), back: { width: 5, a: 0.4 } });
    steamAura(g, t, { x: hx, y: GY, h: 440 * 1.15, k, cyan: 0.85, amber: 0.35 });
  }));
  heatHaze(g, t, E.W * 0.36, E.H * 0.06, E.W * 0.22, E.H * 0.55, { amp: 2.5 * k });
  bloom(g, { threshold: 0.6, strength: 0.9, radius: 24 }); nightGrade(g, { k: 1, vignette: 0.7, violet: 0.4 });
} });

// demo_fx_lift: the lawn lift (slow-mo raise + streaks, sink, impact frame, cracks, dust, speed lines, shake)
registerShot('demo_fx_lift', { draw(g, t, info) {
  const tI = 2.2, sh = hitShake(t, tI, { amp: 3, dur: 0.3 }), tt = slowMo(t, { at: 0.8, dur: 1.2, factor: 0.3 }), cam = { z: 1.04, x: sh[0], y: -40 + sh[1] };
  const GY = nightPark(g, t, cam), hx = E.W * 0.42, raise = ease.inOut(prog(tt, 0.4, 1.3)), sink = ease.out(prog(t, tI - 0.1, tI + 0.5));
  layer(g, cam, 1, (g) => {
    g.fillStyle = '#1f3a26'; g.beginPath(); g.ellipse(hx, GY + 10, 420, 60, 0, 0, 7); g.fill();               // a patch of lawn under him
    tileCrack(g, t, E.W * 0.78, GY + 40, { k: prog(t, tI, tI + 0.6), cols: 5, rows: 3, tw: 120, th: 40 });
    const S = soilSink(g, t, hx, GY, { k: sink, w: 220 });
    groundCrack(g, t, hx, GY + 6, { k: prog(t, tI, tI + 0.4), glow: 0.6, len: 420 });
    if (raise > 0.02 && t > 0.8 && t < 2.0) speedLines5(g, t, { mode: 'focus', cx: hx, cy: GY - 300, inner: 420, a: 0.35, color: P5.cyan });
    const drawAt = (x, ttt) => { const rz = ease.inOut(prog(ttt, 0.4, 1.3)), by = GY + S.dy - 200 - rz * 360; rr(x, hx - 150, by - 90, 300, 110, 14); x.fillStyle = '#5a4a3a'; x.fill(); x.fillStyle = '#7a6550'; x.fillRect(hx - 140, by - 84, 280, 12); };
    figure(g, hx, GY + S.dy, 1.0, { arms: 0.55 + 0.45 * raise, bend: 0.3 * (1 - raise) });
    if (t > 0.8 && t < 2.1) trail(g, tt, drawAt, { n: 5, dt: 0.05, a: 0.4 }); else drawAt(g, tt);
    soilLip(g, t, hx, GY + 4, { k: sink, w: 220 });
    dustBurst(g, t, tI, hx, GY + 10, { s: 1.1 });
  });
  bloom(g, { threshold: 0.62, strength: 0.7 }); nightGrade(g, { k: 1, vignette: 0.6 });
  impactFrame(g, t, tI, { x: hx, y: GY - 250 });
} });

// demo_fx_levelup: the level-up beat (hush, flash, freeze, shake, gold focus lines, cyan streaks)
registerShot('demo_fx_levelup', { draw(g, t0, info) {
  const tF = 1.2, t = freeze(t0, tF, 5), sh = hitShake(t0, tF, { amp: 3, dur: 0.25 }), cam = { z: 1.0 + 0.06 * ease.inOut(prog(t0, 0, tF)), x: sh[0], y: sh[1] };
  layer(g, cam, 0.3, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, [P5.ink, P5.navy]); g.fillRect(-200, -200, E.W + 400, E.H + 400); glow(g, E.W * 0.5, E.H * 0.45, 700, P5.cyan2, 0.18); });
  if (t0 > tF && t0 < tF + 1.4) speedLines5(g, t0, { mode: 'focus', cx: E.W * 0.5, cy: E.H * 0.42, inner: 330, color: P5.gold, a: 0.55 * (1 - prog(t0, tF + 0.8, tF + 1.4)) });
  if (t0 > tF + 1.6) speedLines5(g, t0, { mode: 'streak', angle: -0.08, color: P5.cyan, a: 0.35, count: 50 });
  layer(g, cam, 1, (g) => {
    const p = ease.outBack(prog(t, 0.2, 0.7)), bob = Math.sin(t * 2) * 6;
    glowDraw(g, (x) => { x.save(); x.translate(E.W * 0.5, E.H * 0.42 + bob); x.rotate(-0.06); x.scale(p, p); rr(x, -260, -110, 520, 220, 40); x.fillStyle = alpha(P5.glass, 0.6); x.fill(); x.strokeStyle = P5.cyan; x.lineWidth = 4; x.stroke();
      rr(x, -230, 50, 460 * prog(t, 0.6, tF), 22, 11); x.fillStyle = P5.cyan2; x.fill(); x.restore(); }, { blur: 16, strength: 0.9 });
    const pk = ease.outBack(prog(t0, tF + 0.1, tF + 0.45)); if (pk > 0) { g.save(); g.translate(E.W * 0.5, E.H * 0.42); g.scale(pk * 1.0, pk * 1.0); glow(g, 0, 0, 320, P5.gold, 0.4);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + t0 * 0.4; poly(g, [[Math.cos(a - 0.05) * 80, Math.sin(a - 0.05) * 80], [Math.cos(a) * 300, Math.sin(a) * 300], [Math.cos(a + 0.05) * 80, Math.sin(a + 0.05) * 80]], alpha(P5.goldHi, 0.5)); } g.restore(); }
  });
  bloom(g, { threshold: 0.55, strength: 1.0, radius: 26 }); nightGrade(g, { k: 0.8, vignette: 0.6, violet: 0.3, cool: 0.3 });
  smashFlash(g, t0, tF, { a: 0.7 });
} });
