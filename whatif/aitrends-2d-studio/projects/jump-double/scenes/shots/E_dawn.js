// E_dawn.js — batch E, day 25 at dawn: s099-s106. Quiet, tender, tense. Every beat is bound to the spoken words (shotWord / wordTime).
//   s099 UNTIL DAY 25     DAY counter flips 24 -> 25 slowly over the dimmed dawn backyard, '25' glows gold, heartbeat pulse
//   s100 LEAVE THE GROUND HERO looks up at the last stars, helmet under his arm, neutral -> determined on 'faster'
//   s101 11.2 KM/S        big escape gauge over the blurred dawn, needle sweeps to a gold 11.2 km/s with heat glow
//   s102 FIG 5 BLUEPRINT  Earth + three launch arcs: slow falls back, orbit circles, gold escape arc leaves the sheet
//   s103 MINA'S HAND      two-shot: Mina takes his hand, lip-synced "Don't" / "Please", glistening eyes
//   s104 DEV'S SIGN       Dev raises a cardboard BRING ME A MOON ROCK sign, then a thumbs up (mouth closed)
//   s105 BISCUIT          the cat on the garden wall lifts her head for the first time, eyes glint
//   s106 YOU BEND KNEES   giant determined face, frame dips with the crouch, heartbeat quickens, HARD CUT TO BLACK
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shade, mix, seg, circle, rr, poly, linGrad, text, FONTS, rng } from '/engine/core.js';
import { POSES, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { dayCounter, gauge } from '../sets/devices.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import * as BP from '../sets/bp.js';

const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };
const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
const GOLD = () => S().ui.gold;

// ---------------------------------------------------------------------------------------------------
// shared: the backyard at dawn = roofs 'houses' dusk palette + a pale-blue / peach screen tint, a low sun glow and drifting mist
function dawnWorld(g, t, cam, o = {}) {
  const R = roofs(g, t, cam, { view: 'houses', mood: 'dusk', kite: 0, ladder: o.ladder ?? 1 });
  g.save(); g.globalCompositeOperation = 'screen';                                                          // pale dawn lift: cool sky, warm horizon
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['rgba(140,170,230,.30)', 'rgba(255,196,170,.20)', 'rgba(255,224,196,.10)']); g.fillRect(0, 0, E.W, E.H);
  g.restore();
  glow(g, E.W * 0.16 - (cam.x || 0) * 0.1, R.GY - 120 - (cam.y || 0) * 0.2, 640 * (cam.z || 1), '#ffd2a0', 0.20 + 0.04 * Math.sin(t * 0.5));
  layer(g, cam, 0.85, (g) => {                                                                              // low mist banks
    FX.fog(g, R.GY - 190, 330, '#ffe6d6', 0.30);
    for (let i = 0; i < 7; i++) { const x = ((i * 463 + t * (12 + i * 3.5)) % (E.W * 2.6)) - E.W * 0.8; glow(g, x, R.GY - 60 + (i % 3) * 34, 360 + (i % 2) * 120, '#fff0e2', 0.075); }
  });
  return R;
}
function frontMist(g, t, cam, R) {                                                                          // thin mist rolling over the lawn, in front of the feet
  layer(g, cam, 1.25, (g) => { for (let i = 0; i < 4; i++) { const x = ((i * 611 - t * (22 + i * 5)) % (E.W * 2.6) + E.W * 2.6) % (E.W * 2.6) - E.W * 0.8; glow(g, x, R.GY + 60 + (i % 2) * 40, 420, '#fff2e6', 0.07); } });
}
const DAWN_RIM = { color: '#ffd6a8', dir: [-0.9, -0.35] };
function lastStars(g, t, cam, fade, area) {                                                                  // the last few stars of the night, twinkling, fading out with the dawn
  if (fade <= 0.01) return;
  layer(g, cam, 0.12, (g) => { g.save(); g.globalAlpha *= fade; FX.stars(g, t, { count: 40, area, seed: 17, color: '#f2f0ff' }); g.restore(); });
}
const fadeBlack = (g) => { g.save(); g.fillStyle = '#000'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); };

// ===================================================================================================
// s099 — "Until day twenty-five. Day twenty-five."
registerShot('s099', { draw(g, t, info) {
  const st = info.shot.start, tFlip = shotWord('twenty-five', st, 0.59), tAgain = shotWord('day', st + 2.0, 3.09);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-40, 20], y: [0, -10] });
  blurLayer(g, 9, (g) => dawnWorld(g, t, cam), null, 1); veil(g, '#150f24', 0.36);
  FX.fog(g, E.H * 0.62, 300, '#ffe0cc', 0.14);
  const beat = t < tAgain ? 0 : Math.pow(Math.max(0, Math.sin(((t - tAgain) % 1.0) * Math.PI * 2 * 1.0 + 1.0)), 6) * 0.5 + Math.exp(-((t - tAgain) % 1.0) * 9) * 0.5;   // heartbeat double thump
  const flipEnd = tFlip + 0.9, thud = Math.exp(-Math.max(0, t - tFlip) * 7) * (t >= tFlip ? 1 : 0);
  const z = lerp(1.0, 1.12, ease.inOut(t / info.dur)) + thud * 0.018 + beat * 0.008, sx = E.W * 0.5, sy = E.H * 0.43;
  g.save(); g.translate(E.W / 2, E.H / 2 + Math.sin(t * 0.7) * 4); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const s = 1.55, x = sx, y = sy;
  dayCounter(g, t, { x, y, s, keys: [[0, 24], [tFlip, 25]], flip: 0.9 });
  // '25' goes gold on the second 'Day twenty-five'
  const W = (170 + 240 + 14 + 70) * s, cx0 = x - W / 2 + 32 * s + 170 * s + 8 * s, cw = 120 * s, gap = 14 * s, ch = 172 * s, gk = ease.out(prog(t, tAgain - 0.05, tAgain + 0.7));
  if (gk > 0) {
    const gx = cx0 + cw + gap / 2;
    glow(g, gx, y, 430 * s, GOLD(), 0.30 * gk * (0.85 + beat * 0.5));
    for (let d = 0; d < 2; d++) { rr(g, cx0 + d * (cw + gap) - 3, y - ch / 2 - 3, cw + 6, ch + 6, 14 * s); g.strokeStyle = alpha('#ffe9a8', 0.85 * gk * (0.7 + beat * 0.3)); g.lineWidth = 5 * s; g.stroke(); }
    g.save(); g.globalCompositeOperation = 'lighter'; for (let d = 0; d < 2; d++) { g.fillStyle = alpha(GOLD(), 0.20 * gk * (0.8 + beat * 0.6)); g.fillRect(cx0 + d * (cw + gap), y - ch / 2, cw, ch); } g.restore();
    for (let i = 0; i < 8; i++) { const a = i * 0.9 + t * 0.7, u = ((t * 0.5 + i * 0.37) % 1), r2 = 260 * s * (0.5 + u); circle(g, gx + Math.cos(a) * r2, y + Math.sin(a) * r2 * 0.55, 3 + 3 * (1 - u), alpha('#fff2c0', 0.8 * (1 - u) * gk)); }
  }
  g.restore();
  atmos(g, t, cam, { color: '#ffe0c8', far: 26, near: 8 });
} });

// ===================================================================================================
// s100 — "To jump this high, you'd have to leave the ground faster than"
registerShot('s100', { draw(g, t, info) {
  const st = info.shot.start, tFast = shotWord('faster', st, 2.55), tGround = shotWord('ground', st, 2.2);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], x: [-30, 40], y: [-30, -190] });                        // the camera tilts up with his gaze
  const R = dawnWorld(g, t, cam);
  lastStars(g, t, cam, 0.85 - 0.3 * (t / info.dur), [E.W * 0.05, 40, E.W * 0.9, E.H * 0.22]);
  const hx = R.CX - 40, f = { x: hx, y: R.GY + 24, s: 1.95, facing: 1 };
  const look = ease.inOut(prog(t, 0.0, 0.9)), set = ease.inOut(prog(t, tFast - 0.2, tFast + 0.35));
  const base = { ...EXTRA.lookUp, eB: [10, -128], hB: [24, -112], eF: [8, -134], hF: [10, -104] };            // far hand holds the helmet at the hip
  const clench = { ...base, hF: [14, -112], hip: [0, -97], kF: [8, -50], head: [4, -212] };
  const pose = idle(poseAt(t, [[0, POSES.stand], [0.15, base], [tFast - 0.1, clench]], 0.7), t, 3);
  actor(g, 'HERO', { ...f, pose, expr: exprAt(t, [[0, 'neutral'], [tFast, 'determined']]), blink: blinkFlag(t, 3.4, 3), look: lookToward(0.25 + 0.3 * look, -1), rim: DAWN_RIM, t });
  const [hbx, hby] = handWorld(f, pose, 'hB');                                                              // helmet under his arm
  g.save(); g.translate(hbx + 6, hby + 12); g.rotate(-0.2); g.fillStyle = '#f2ede2'; g.beginPath(); g.ellipse(0, 0, 42, 36, 0, Math.PI, 0); g.lineTo(34, 18); g.lineTo(-40, 18); g.closePath(); g.fill();
  g.fillStyle = '#d4602a'; g.fillRect(-6, -36, 12, 36); seg(g, [[-38, 14], [38, 14]], 6, '#9a948a'); g.fillStyle = alpha('#2a3a5a', 0.9); g.beginPath(); g.ellipse(20, -2, 20, 11, 0, 0, 7); g.fill(); glow(g, 28, -16, 22, '#fff', 0.35); g.restore();
  frontMist(g, t, cam, R);
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: '#ffe3cc' });
} });

// ===================================================================================================
// s101 — "eleven point two kilometres a second."
registerShot('s101', { draw(g, t, info) {
  const st = info.shot.start, tEl = shotWord('eleven', st, 0.15), tTwo = shotWord('two', st, 0.96);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [30, -30], y: [-40, -90] });
  blurLayer(g, 8, (g) => dawnWorld(g, t, cam), null, 1); veil(g, '#120c22', 0.42);
  layer(g, cam, 0.2, (g) => FX.stars(g, t, { count: 50, area: [0, 0, E.W, E.H * 0.3], seed: 6, color: '#e8e8ff' }));
  layer(g, cam, 0.7, (g) => FX.speedLines(g, t, { count: 34, a: 0.07 + 0.10 * ease.out(prog(t, tEl, tTwo + 0.5)), inner: 520 }));
  const z = lerp(1.0, 1.07, ease.inOut(t / info.dur)), p = ease.out(prog(t, tTwo, tTwo + 0.6));
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const gx = E.W * 0.5, gy = E.H * 0.5 + Math.sin(t * 0.8) * 4, r = 330;
  gauge(g, t, { preset: 'escape', x: gx, y: gy, r, at: tEl, sweep: Math.max(0.6, tTwo - tEl + 0.25) });
  if (p > 0) { glow(g, gx, gy, r * 1.35, '#ffb040', 0.18 * p * (0.8 + 0.2 * Math.sin(t * 7))); for (let i = 0; i < 10; i++) { const a = i * 0.63 + t * 0.4, u = ((t * 0.8 + i * 0.29) % 1); circle(g, gx + Math.cos(a) * r * (1.05 + u * 0.45), gy + Math.sin(a) * r * (1.05 + u * 0.45), 4 * (1 - u) + 1, alpha('#ffe0a0', 0.8 * (1 - u) * p)); } }
  g.restore();
  atmos(g, t, cam, { color: '#ffe0c8', far: 20, near: 6 });
} });

// ===================================================================================================
// s102 — BLUEPRINT FIG 5: escape velocity
registerShot('s102', { draw(g, t, info) {
  const st = info.shot.start, tEsc = shotWord('escape', st, 0.61), tVel = shotWord('velocity', st, 0.93), tNever = shotWord('never', st, 3.03);
  const U = S().ui, z = 1 + 0.035 * (t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 4, -E.H / 2 + Math.cos(t * 0.4) * 3);
  BP.board(g, t, { title: 'ESCAPE VELOCITY', fig: 'FIG 5 - LAUNCH SPEEDS' });
  const R = 400, C = [E.W * 0.31, E.H * 0.97], a0 = -Math.PI / 2 - 0.12, pt = (a, rad) => [C[0] + Math.cos(a) * rad, C[1] + Math.sin(a) * rad], top = pt(a0, R);
  const earthK = ease.out(prog(t, 0.0, 1.0));
  const earth = []; for (let i = 0; i <= 90; i++) earth.push(pt(lerp(Math.PI * 0.97, Math.PI * 2.03, i / 90), R));
  g.save(); g.fillStyle = alpha(U.blueprint, 0.07); g.beginPath(); g.arc(C[0], C[1], R, 0, 7); g.fill(); g.restore();
  BP.draw(g, earth, earthK, { w: 6, color: U.blueprint });
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 - 0.9 + i * 0.3, p1 = pt(a, R * 0.9), p2 = pt(a + 0.12, R * 0.78); BP.draw(g, [p1, [lerp(p1[0], p2[0], 0.5) + 16, lerp(p1[1], p2[1], 0.5) + 8], p2], earthK * 0.8, { w: 3, color: alpha(U.blueprint, 0.4) }); }   // continents hint
  // 1) slow: a short hop that falls back
  const slow = []; for (let i = 0; i <= 50; i++) { const u = i / 50; slow.push(pt(a0 + u * 0.75, R + Math.sin(u * Math.PI) * 95)); }
  BP.draw(g, slow, ease.out(prog(t, 0.35, 1.5)), { w: 5, color: '#c9dcff' });
  // 2) orbit speed: a ring that circles the planet
  const ring = []; for (let i = 0; i <= 160; i++) { const u = i / 160; ring.push(pt(a0 + u * Math.PI * 1.8, R + 140 * ease.out(clamp(u * 7)))); }
  BP.draw(g, ring, ease.out(prog(t, 0.5, 2.0)), { w: 4, color: alpha('#c9dcff', 0.85) });
  // 3) escape: gold, never returns, leaves the sheet
  const esc = []; for (let i = 0; i <= 80; i++) { const u = i / 80; esc.push(pt(a0 + u * 0.95, R + 1500 * Math.pow(u, 1.45))); }
  const ek = ease.inOut(prog(t, tEsc, tEsc + 1.9));
  BP.draw(g, esc, ek, { w: 7, color: U.gold });
  if (ek > 0 && ek < 0.999) { const p = esc[Math.min(80, Math.floor(ek * 80))]; glow(g, p[0], p[1], 60, '#fff2c0', 0.8); circle(g, p[0], p[1], 9, '#fff6d8'); }
  else if (ek >= 0.999) { const k2 = ((t - tEsc - 1.9) * 0.8) % 1; const p = esc[Math.floor(clamp(0.5 + k2 * 0.45) * 80)]; glow(g, p[0], p[1], 50, '#fff2c0', 0.6 * (1 - k2)); circle(g, p[0], p[1], 6, '#fff6d8'); }
  circle(g, top[0], top[1], 11, U.gold); glow(g, top[0], top[1], 70, U.gold, 0.35);
  // labels (<= 3): FALLS BACK, ESCAPE 11.2 km/s, GRAVITY NEVER PULLS BACK
  const sa = slow[30]; BP.label(g, t, { at: sa, to: [sa[0] + 190, sa[1] + 170], str: 'FALLS BACK', start: 1.2 });
  const pe = esc[44]; BP.label(g, t, { at: pe, to: [pe[0] + 150, pe[1] + 150], str: 'ESCAPE: 11.2 km/s', start: tVel });
  const gk = ease.out(prog(t, tNever - 0.1, tNever + 0.5));
  if (gk > 0) { const sP = pt(a0 - 0.42, R + 6), s0 = pt(a0 - 0.42, R + 300), ax = lerp(s0[0], sP[0], gk), ay = lerp(s0[1], sP[1], gk);
    BP.draw(g, [s0, sP], gk, { w: 5, color: alpha(U.gold, 0.9) }); const an = Math.atan2(sP[1] - s0[1], sP[0] - s0[0]); poly(g, [[ax + Math.cos(an) * 14, ay + Math.sin(an) * 14], [ax + Math.cos(an + 2.5) * 22, ay + Math.sin(an + 2.5) * 22], [ax + Math.cos(an - 2.5) * 22, ay + Math.sin(an - 2.5) * 22]], U.gold);
    BP.label(g, t, { at: s0, to: [s0[0] + 30, s0[1] - 160], str: 'GRAVITY NEVER PULLS BACK', start: tNever }); }
  g.restore();
} });

// ===================================================================================================
// s103 — "Mina holds your hand. 'Don't,' she says. 'Please.'"
// worried / sad brows: inner ends raised (engine rig2d.js brow slants fixed by the lead)
const SAD_BROWS = { brows: 'worried' };

registerShot('s103', { draw(g, t, info) {
  const st = info.shot.start, tHold = shotWord('holds', st, 1.05), tDont = shotWord("don't", st, 2.23), tPlease = shotWord('please', st, 3.03);
  const cam = camMove(t, info.dur, { z: [1.28, 1.5], x: [-50, -30], y: [-70, -100] });
  const R = dawnWorld(g, t, cam);
  const hs = 1.95, ms = 2.0, mk = 0.72, GYh = R.GY + 24, hx = R.CX + 70;
  const H = { x: hx, y: GYh, s: hs, facing: -1 };
  const holdK = ease.inOut(prog(t, tHold, tHold + 0.6));
  const hpose = idle(poseAt(t, [[0, { ...POSES.relaxed, head: [8, -204] }], [tHold, { ...POSES.relaxed, eF: [34, -140], hF: [66, -98], head: [10, -202] }]], 0.7), t, 3);
  // hero faces left so his front hand is toward her: world x = hx - hF.x * hs  ->  put Mina so her hand (local x = 58) reaches that point
  const hHandW = handWorld(H, hpose, 'hF');
  const mx = hHandW[0] - 72 * ms * mk, M = { x: mx, y: GYh - 6, s: ms, facing: 1, kid: true };
  const reachY = (hHandW[1] - M.y) / (ms * mk);
  const mReach = ease.inOut(prog(t, tHold - 0.05, tHold + 0.55));
  const mpose0 = idle({ ...POSES.stand }, t, 2), mpose = { ...mpose0, eF: [lerp(mpose0.eF[0], 40, mReach), lerp(mpose0.eF[1], (reachY - 174) * 0.5 + 10, mReach)], hF: [lerp(mpose0.hF[0], 72, mReach), lerp(mpose0.hF[1], reachY, mReach)], head: [mpose0.head[0] + 4 * mReach, mpose0.head[1] - 4 * mReach] };
  const dPlease = ease.out(prog(t, tPlease, tPlease + 0.5));
  const talk = Math.max(talkAmount(info.globalT, st + tDont - 0.02, st + tDont + 0.38), talkAmount(info.globalT, st + tPlease - 0.02, st + tPlease + 0.55));
  actor(g, 'HERO', { ...H, pose: hpose, expr: exprAt(t, [[0, 'worried'], [tHold + 0.4, 'sad'], [tPlease, 'worried']]), face: SAD_BROWS, blink: blinkFlag(t, 3.6, 5), look: lookToward(0.55, 0.75), rim: DAWN_RIM, t });
  actor(g, 'MINA', { ...M, pose: mpose, expr: exprAt(t, [[0, 'worried'], [tDont, 'sad'], [tPlease, 'cry']]), face: SAD_BROWS, talk, blink: blinkFlag(t, 3.0, 1) && t < tPlease, look: lookToward(0.5, -0.85), rim: DAWN_RIM, t });
  // clasped hands: a small warm knot where they meet
  if (mReach > 0.9) { const cx = hHandW[0], cy = hHandW[1]; glow(g, cx, cy, 70, '#ffd9a8', 0.32 * holdK); circle(g, cx, cy, 11, S().ink); circle(g, cx - 3, cy - 3, 3.2, alpha('#ffd6a8', 0.8)); }
  // Mina's eyes glisten, then a tear on 'Please'
  const [mhx, mhy, mhr] = headPos({ ...M, pose: mpose }); const eyes = [[mhx + mhr * 0.08, mhy - mhr * 0.16], [mhx + mhr * 0.66, mhy - mhr * 0.16]];
  const gl = ease.out(prog(t, tHold + 0.3, tHold + 1.0));
  for (const [ex, ey] of eyes) { glow(g, ex, ey + mhr * 0.04, mhr * 0.5, '#bfe4ff', 0.28 * gl * (0.8 + 0.2 * Math.sin(t * 5 + ex))); circle(g, ex - 2, ey - 3, 2.4, alpha('#ffffff', 0.9 * gl)); }
  if (dPlease > 0) { const e2 = eyes[1], u = clamp((t - tPlease - 0.15) / 1.0), ty = e2[1] + mhr * 0.12 + u * mhr * 1.1; g.fillStyle = alpha('#bfe4ff', 0.9 * (1 - u * 0.5) * dPlease); g.beginPath(); g.moveTo(e2[0] + 2, ty - 10); g.quadraticCurveTo(e2[0] + 9, ty + 4, e2[0] + 2, ty + 8); g.quadraticCurveTo(e2[0] - 5, ty + 4, e2[0] + 2, ty - 10); g.fill(); }
  frontMist(g, t, cam, R);
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: '#ffe3cc' });
} });

// ===================================================================================================
// s104 — "Dev holds up a sign: 'Bring me a moon rock.'"
registerShot('s104', { draw(g, t, info) {
  const st = info.shot.start, tUp = shotWord('holds', st, 0.15), tSign = shotWord('sign', st, 0.85), tRock = shotWord('rock', st, 1.95);
  const cam = camMove(t, info.dur, { z: [1.1, 1.2], x: [10, -10], y: [-170, -185] });
  const R = dawnWorld(g, t, cam);
  const D = { x: R.CX - 90, y: R.GY + 30, s: 1.9, facing: 1 }, UP = { head: [3, -208], sh: [0, -174], hip: [0, -100], eF: [50, -206], hF: [60, -252], eB: [-46, -206], hB: [-52, -250], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] };
  const thumbs = ease.out(prog(t, tRock, tRock + 0.4));
  const TH = { ...UP, eF: [34, -150], hF: [62, -182] };
  const pose = idle(poseAt(t, [[0, POSES.stand], [tUp + 0.05, UP], [tRock, TH]], 0.55), t, 4);
  const rim = DAWN_RIM;
  actor(g, 'DEV', { ...D, pose, expr: exprAt(t, [[0, 'neutral'], [tUp, 'smirk'], [tRock, 'joy']]), blink: blinkFlag(t, 2.9, 4) && t > 0.3, look: lookToward(0.6, -0.1), rim, t });
  // the cardboard sign, gold lettering
  const ph = ease.outBack(prog(t, tUp + 0.1, tUp + 0.55));
  if (ph > 0.01) {
    const hF = handWorld(D, pose, 'hF'), hB = handWorld(D, pose, 'hB'), mid = [(hF[0] + hB[0]) / 2, (hF[1] + hB[1]) / 2], anc = [lerp(mid[0], hB[0] + 120, thumbs), lerp(mid[1], hB[1], thumbs)];
    const rot = lerp(0.015 * Math.sin(t * 1.3), -0.13, thumbs), W = 400, Hh = 270;
    g.save(); g.translate(anc[0], anc[1] + 8); g.rotate(rot); g.scale(ph, ph);
    g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, -W / 2 + 8, -Hh + 10, W, Hh, 8); g.fill();
    g.fillStyle = linGrad(g, 0, -Hh, 0, 0, ['#cfa772', '#b98d58']); rr(g, -W / 2, -Hh, W, Hh, 8); g.fill();
    g.strokeStyle = '#6a4a28'; g.lineWidth = 6; rr(g, -W / 2, -Hh, W, Hh, 8); g.stroke();
    g.strokeStyle = alpha('#8a6a3a', 0.4); g.lineWidth = 2; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(-W / 2 + 6, -Hh + i * 33); g.lineTo(W / 2 - 6, -Hh + i * 33 + 3); g.stroke(); }   // corrugation
    for (const [tx, ty, tr] of [[-W / 2 + 28, -Hh + 6, -0.5], [W / 2 - 28, -Hh + 6, 0.5]]) { g.save(); g.translate(tx, ty); g.rotate(tr); g.fillStyle = alpha('#f2ead0', 0.75); g.fillRect(-26, -9, 52, 18); g.restore(); }
    const lt = (str, y, size) => text(g, str, 0, y, { size, color: GOLD(), font: FONTS.title, weight: 900, stroke: 11, strokeColor: '#3a2410', glow: 8, glowColor: alpha(GOLD(), 0.5), spacing: 2 });
    lt('BRING ME', -Hh + 62, 74); lt('A MOON', -Hh + 134, 74); lt('ROCK', -Hh + 206, 74);
    circle(g, W / 2 - 62, -Hh + 214, 28, '#f4ead0'); circle(g, W / 2 - 70, -Hh + 206, 6, alpha('#b8a888', 0.8)); circle(g, W / 2 - 52, -Hh + 220, 8, alpha('#b8a888', 0.8)); glow(g, W / 2 - 62, -Hh + 214, 60, '#fff2d0', 0.25);   // a tiny moon rock doodle
    g.restore();
  }
  if (thumbs > 0.05) { const [fx, fy] = handWorld(D, pose, 'hF'); circle(g, fx, fy, 15 * D.s * 0.62, S().ink); seg(g, [[fx - 3, fy - 8], [fx + 2, fy - 8 - 30 * thumbs]], 13, S().ink); circle(g, fx - 3, fy - 4, 3, alpha('#ffd6a8', 0.7)); glow(g, fx, fy - 20, 90, '#ffe8c0', 0.2 * thumbs); }
  frontMist(g, t, cam, R);
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: '#ffe3cc' });
} });

// ===================================================================================================
// s105 — "Biscuit finally looks up."
registerShot('s105', { draw(g, t, info) {
  const st = info.shot.start, tLook = shotWord('looks', st, 0.63);
  const cam = camMove(t, info.dur, { z: [1.5, 1.62], x: [-30, -10], y: [-10, -60] });
  const R = dawnWorld(g, t, cam);
  const cx = R.CX + 20, wy = R.GY - 20;
  layer(g, cam, 1, (g) => {
    // the garden wall: stone courses, coping, ivy, a flowerpot
    g.fillStyle = linGrad(g, 0, wy, 0, wy + 360, ['#7a6f7e', '#4a4252']); g.fillRect(-E.W * 1.2, wy, E.W * 3.4, 380);
    g.fillStyle = '#9a8f9c'; g.fillRect(-E.W * 1.2, wy - 14, E.W * 3.4, 22); g.fillStyle = alpha('#fff0e0', 0.35); g.fillRect(-E.W * 1.2, wy - 14, E.W * 3.4, 4);
    const r = rng(41); for (let row = 0; row < 5; row++) for (let col = -20; col < 28; col++) { const bx = col * 170 + (row % 2) * 85, by = wy + 14 + row * 66; g.strokeStyle = alpha('#2a2230', 0.5); g.lineWidth = 3; g.strokeRect(bx, by, 170, 66); if (r() < 0.25) { g.fillStyle = alpha('#fff', 0.05); g.fillRect(bx + 4, by + 4, 162, 58); } }
    for (let i = 0; i < 26; i++) { const x = cx - 700 + i * 52 + (i % 3) * 8, h = 40 + (i * 53) % 150; seg(g, [[x, wy], [x + Math.sin(t * 0.9 + i) * 3, wy + h]], 4, '#2f5a3a'); circle(g, x + Math.sin(t * 0.9 + i) * 3, wy + h, 11, i % 2 ? '#3a7a46' : '#2a5a38'); }
    rr(g, cx + 360, wy - 80, 70, 66, 8); g.fillStyle = '#b8603a'; g.fill(); rr(g, cx + 352, wy - 94, 86, 20, 6); g.fillStyle = '#c8704a'; g.fill();
    for (const [dx, dy, c] of [[386, -118, '#f4ead8'], [405, -134, '#ffb0c0'], [420, -112, '#f4ead8']]) { seg(g, [[cx + 395, wy - 92], [cx + dx, wy + dy]], 4, '#3a6a3a'); circle(g, cx + dx, wy + dy, 11, c); }
  });
  layer(g, cam, 1, (g) => {
    const k = ease.inOut(prog(t, tLook - 0.12, tLook + 0.7)), tilt = lerp(0.42, -0.52, k) + Math.sin(t * 0.7) * 0.02;
    const o = { x: cx, y: wy - 12, s: 2.5, facing: 1, pose: 'sit', t, tilt, eyes: t < tLook - 0.05 ? 'offended' : 'glint', rim: DAWN_RIM };
    cat(g, o);
    if (t >= tLook - 0.05) { const gk = ease.out(prog(t, tLook, tLook + 0.35)), hx = cx + 12 * o.s, hy = wy - 12 - 74 * o.s; glow(g, hx + 22, hy - 8, 120, '#c8f07a', 0.20 * gk); for (let i = 0; i < 5; i++) { const a = i * 1.26 + t * 0.6; circle(g, hx + 20 + Math.cos(a) * 70 * gk, hy - 10 + Math.sin(a) * 50 * gk, 2.6, alpha('#f2ffd0', 0.7 * gk * (0.5 + 0.5 * Math.sin(t * 6 + i)))); } }
  });
  frontMist(g, t, cam, R);
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: '#ffe3cc', far: 18, near: 8 });
} });

// ===================================================================================================
// s106 — "You bend your knees." giant determined face, the frame drops with the crouch, HARD CUT TO BLACK
registerShot('s106', { draw(g, t, info) {
  const st = info.shot.start, tBend = shotWord('bend', st, 0.33), tKnees = shotWord('knees', st, 0.69), tCut = info.dur - 0.5;
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [0, 0], y: [0, 0] });
  blurLayer(g, 12, (g) => dawnWorld(g, t, cam), null, 1); veil(g, '#160f24', 0.32);
  layer(g, cam, 0.5, (g) => { glow(g, E.W * 0.78, E.H * 0.52, 760, '#ffcf9a', 0.34); });                       // the sun behind his shoulder
  const dip = ease.inOut(prog(t, tBend, tKnees + 0.35)) * 40;                                                  // the crouch: the frame drops 40 px with him
  const beatP = lerp(0.78, 0.52, prog(t, 0, tCut)), bph = (t / beatP) % 1, pulse = Math.exp(-bph * 8) + 0.5 * Math.exp(-Math.abs(bph - 0.3) * 18);
  const r = lerp(330, 392, ease.inOut(t / tCut)) * (1 + 0.006 * pulse * (0.6 + t / tCut));
  const f = faceAt(t, [[0, 'worried'], [0.4, 'determined'], [1.6, 'determined'], [1.95, 'squint']], 0.2);
  giantFace(g, E.W * 0.5 + Math.sin(t * 0.6) * 3, E.H * 0.5 + dip + Math.sin(t * 2.0) * 2, r, { who: 'HERO', f, rimColor: '#ffd29a', rimSide: 1, glint: '#ffb870', blink: blinkAmt(t, 2.8, 2) * (t < 1.9 ? 1 : 0), breath: Math.sin(t * 2.1), tilt: -0.012 + 0.01 * Math.sin(t * 0.5) });
  // dust lifting at the bottom of the frame as he crouches
  const du = ease.out(prog(t, tBend, tBend + 0.5)); if (du > 0) { for (let i = 0; i < 26; i++) { const u = ((t - tBend) * 0.55 + i * 0.173) % 1, x = ((i * 389) % E.W), y = E.H + 20 - u * E.H * 0.34 - (i % 5) * 14; circle(g, x + Math.sin(t * 1.5 + i) * 18, y, 5 + (i % 4) * 4, alpha('#e8d6c4', 0.28 * (1 - u) * du)); } glow(g, E.W * 0.5, E.H + 30, 720, '#e8d2bc', 0.22 * du); }
  FX.fog(g, E.H * 0.72, 360, '#ffe6d6', 0.12);
  atmos(g, t, cam, { color: '#ffe0c8', far: 18, near: 8 });
  // closing in: a vignette tightens on the beat before the cut
  const vg = ease.in(prog(t, 1.2, tCut)); if (vg > 0) { const gr = g.createRadialGradient(E.W / 2, E.H / 2 + dip, E.H * (0.75 - 0.35 * vg), E.W / 2, E.H / 2 + dip, E.H * 1.0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${0.55 * vg})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }
  if (t >= tCut) fadeBlack(g);                                                                                 // HARD CUT TO BLACK for the last ~0.5 s
} });
