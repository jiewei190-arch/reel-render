// E_orbit.js — batch E part 1: s089-s098 "Day 21 ... the long falls" (low orbit, ISS pass, Newton's cannonball blueprint, Rule 5, counter run, higher and higher, long fall, snacks).
//   s089 Day 21, 500 km: hero rises into frame        s090 ISS passes behind him, eyes first        s091 astronauts wave through the cupola, he waves back
//   s092 BP cannonball: arcs land, last wraps          s093 orbit completes, 7.8 km/s arrow          s094 RULE 5 card over dimmed orbit
//   s095 counter run 21 > 24                           s096 globe shrinks 1,000 / 2,000 / 4,000 km  s097 lying on his back, stopwatch racing
//   s098 giant face munching crisps in zero-g
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, wordTime, alpha, glow, shade, rng, seg, circle, ring, poly, rr, text, measure, FONTS, linGrad, radGrad, mood } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, headPos } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { orbit, orbitFg, iss as issDraw } from '../sets/orbit.js';
import { chip, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { dayCounter, heightMeter, fmtHeight } from '../sets/devices.js';
import { JPOSE } from '../sets/jump.js';
import * as BP from '../sets/bp.js';

const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };
const GOLD = () => S().ui.gold;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------------
// the space hero: no hoodie. Mustard T-shirt + diving mask + a fishbowl helmet with a 'DEV' shell band, collar ring, blinking antenna.
// ---------------------------------------------------------------------------------------------------
const HERO_SPACE = { top: 'tshirt', color: '#E1AD01', legs: '#1f5f66', head: 'none' };

// drawn in the head-centred frame; 1 unit = head radius / 26. front = giant-face front view. Caller supplies position, scale u, facing f, screen roll.
function helmet(g, hx, hy, u, o = {}) {
  const f = o.front ? 1 : (o.f ?? 1), front = !!o.front, t = o.t ?? 0, lit = o.lit ?? [-0.7, -0.7];
  g.save(); g.translate(hx, hy); if (o.rot) g.rotate(o.rot * f); g.scale(f * u, u);
  const mc = front ? [0, -1] : [10, -8], mw = front ? 38 : 30, mh = front ? 19 : 17;
  // diving mask: strap, frame, tinted glass, nose pocket
  if (front) { seg(g, [[-mw / 2, -2], [-36, -6]], 3.6, '#16222e'); seg(g, [[mw / 2, -2], [36, -6]], 3.6, '#16222e'); }
  else { seg(g, [[mc[0] - mw / 2, mc[1] - 1], [-18, -12], [-33, -6]], 3.4, '#16222e'); seg(g, [[-18, -12], [-30, 4]], 2.4, alpha('#16222e', 0.8)); }
  rr(g, mc[0] - mw / 2, mc[1] - mh / 2, mw, mh, 7); g.fillStyle = alpha('#a6e6ff', 0.2); g.fill();
  g.strokeStyle = '#14303a'; g.lineWidth = 3.6; g.stroke(); g.strokeStyle = '#2fb8c8'; g.lineWidth = 1.2; rr(g, mc[0] - mw / 2 + 1.8, mc[1] - mh / 2 + 1.8, mw - 3.6, mh - 3.6, 5); g.stroke();
  g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.moveTo(mc[0] - mw / 2 + 4, mc[1] - mh / 2 + 3); g.lineTo(mc[0] - mw / 2 + 11, mc[1] - mh / 2 + 3); g.lineTo(mc[0] - mw / 2 + 6, mc[1] + mh / 2 - 3); g.lineTo(mc[0] - mw / 2 + 3, mc[1] + mh / 2 - 3); g.closePath(); g.fill();
  // collar ring (under the chin)
  g.strokeStyle = '#0d1320'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 30, 23, 7, 0, 0, TAU); g.stroke();
  g.strokeStyle = '#dfe5f0'; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 30, 23, 7, 0, 0, TAU); g.stroke();
  // glass bubble
  g.fillStyle = radGrad(g, -10, -14, 4, 40, [alpha('#e8f6ff', 0.2), alpha('#bfe4ff', 0.06), alpha('#8fc8ff', 0.1)]); g.beginPath(); g.arc(0, 0, 36, 0, TAU); g.fill();
  g.strokeStyle = alpha('#e8f4ff', 0.6); g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, 36, 0, TAU); g.stroke();
  // shell band across the top with the DEV plate
  g.beginPath(); g.arc(0, 0, 40, Math.PI * 1.1, Math.PI * 1.9); g.arc(0, 0, 29, Math.PI * 1.9, Math.PI * 1.1, true); g.closePath();
  g.fillStyle = linGrad(g, 0, -40, 0, -29, ['#fbfcff', '#aab4c8']); g.fill(); g.strokeStyle = '#6d788e'; g.lineWidth = 1.4; g.stroke();
  g.save(); g.translate(front ? 0 : -3, -34.4); g.scale(f, 1); text(g, 'DEV', 0, 0, { size: 10.5, color: '#1f5f66', font: FONTS.ui, weight: 900, spacing: 1.5 }); g.restore();
  // antenna with a blinking light
  seg(g, [[-16, -38], [-20, -49]], 2.2, '#cfd6e4'); const bl = Math.floor(t * 1.7) % 2; circle(g, -20, -50, 3, bl ? '#ff4a3a' : '#7a2a2a'); if (bl) glow(g, -20, -50, 14, '#ff4a3a', 0.6);
  // sheen + earthlight rim on the lit side
  g.strokeStyle = alpha('#ffffff', 0.55); g.lineWidth = 2.6; g.beginPath(); const la = Math.atan2(lit[1], lit[0] * f); g.arc(0, 0, 33, la - 0.5, la + 0.5); g.stroke();
  g.strokeStyle = alpha(o.rimColor || '#9fd8ff', 0.5); g.lineWidth = 1.8; g.beginPath(); g.arc(0, 0, 37.5, la - 0.9, la + 0.9); g.stroke();
  g.restore();
}
function spaceHero(g, o) {
  actor(g, HERO_SPACE, { shadow: false, ...o });
  const [hx, hy] = headPos({ pose: o.pose, s: o.s, facing: o.facing ?? 1, rot: o.rot, x: o.x, y: o.y });
  helmet(g, hx, hy, o.s ?? 1, { rot: o.rot, f: o.facing ?? 1, t: o.t, rimColor: o.rim?.color });
  return [hx, hy];
}

// shared: a deep-space backdrop with no Earth (used by the globe shot)
function deepSpace(g, t, cam) {
  layer(g, cam, 0.04, (g) => { g.fillStyle = '#020209'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    glow(g, E.W * 0.7, E.H * 0.3, 700, '#2a2a5a', 0.35); glow(g, E.W * 0.2, E.H * 0.7, 600, '#3a2050', 0.25);
    FX.stars(g, t * 0.1, { count: 160, area: [-E.W * 0.5, -E.H * 0.5, E.W * 2, E.H * 2], seed: 21 }); });
  layer(g, cam, 0.18, (g) => FX.stars(g, t * 0.3, { count: 70, area: [-E.W * 0.3, -E.H * 0.3, E.W * 1.6, E.H * 1.6], seed: 33 }));
}
// a lit globe with rotating continents/clouds, terminator, thin blue atmosphere. Fully inside (cx,cy,R).
function globe(g, t, cx, cy, R, o = {}) {
  const rot = t * (o.spin ?? 0.12);
  glow(g, cx, cy, R * 1.55, '#4a9aff', 0.2);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
  g.fillStyle = radGrad(g, cx - R * 0.35, cy - R * 0.4, R * 0.1, R * 1.25, ['#5aa6e8', '#2a6ab0', '#0b2250']); g.fillRect(cx - R, cy - R, R * 2, R * 2);
  const r = rng(41);
  for (let i = 0; i < 16; i++) { const lon = r() * TAU + rot, lat = (r() - 0.5) * 2.0, c = Math.cos(lon) * Math.cos(lat); if (c < -0.05) continue;
    const x = cx + Math.sin(lon) * Math.cos(lat) * R, y = cy - Math.sin(lat) * R, w = (0.1 + r() * 0.2) * R * Math.max(0.2, c), h = (0.05 + r() * 0.1) * R;
    g.fillStyle = alpha(i % 4 ? '#5a8a4a' : '#b89a6a', 0.7); g.beginPath(); g.ellipse(x, y, w, h, (r() - 0.5) * 1.2, 0, TAU); g.fill(); }
  const r2 = rng(53);
  for (let i = 0; i < 26; i++) { const lon = r2() * TAU + rot * 1.3, lat = (r2() - 0.5) * 2.3, c = Math.cos(lon) * Math.cos(lat); if (c < 0) continue;
    const x = cx + Math.sin(lon) * Math.cos(lat) * R, y = cy - Math.sin(lat) * R; g.fillStyle = alpha('#ffffff', 0.35 + 0.35 * r2()); g.beginPath(); g.ellipse(x, y, (0.1 + r2() * 0.18) * R * Math.max(0.25, c), (0.02 + r2() * 0.03) * R, (r2() - 0.5) * 0.5, 0, TAU); g.fill(); }
  g.fillStyle = linGrad(g, cx - R * 0.2, 0, cx + R * 1.0, 0, [alpha('#02040c', 0), alpha('#02040c', 0.78)]); g.fillRect(cx - R, cy - R, R * 2, R * 2);        // terminator on the right
  g.restore();
  for (const [w, a] of [[R * 0.06, 0.16], [R * 0.028, 0.4], [R * 0.01, 0.9]]) { g.strokeStyle = alpha('#8acfff', a); g.lineWidth = Math.max(1, w); g.beginPath(); g.arc(cx, cy, R + w * 0.4, 0, TAU); g.stroke(); }
}

// ===================================================================================================
// s089 — "Day twenty-one. Over five hundred kilometres."  Low orbit; the hero rises into frame at the apex.
// ===================================================================================================
registerShot('s089', { draw(g, t, info) {
  const st = info.shot.start, tDay = shotWord('day', st, 0.15), tTw = shotWord('twenty-one', st, 0.7), tFive = shotWord('five', st, 1.8), tKm = shotWord('kilometres', st, 3.0);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [-50, 40], y: [24, -14] });
  const O = orbit(g, t, cam, { iss: 0, wave: 0, night: 0.3 });
  const rise = ease.out(prog(t, 0.0, 1.7)), bob = Math.sin(t * 1.1) * 9;
  const hx = E.W * 0.4 + Math.sin(t * 0.7) * 12, hy = lerp(E.H * 1.42, E.H * 0.76, rise) + bob;
  const pose = idle(poseAt(t, [[0, JPOSE.rise], [1.0, JPOSE.apex], [tFive, 'relaxed']], 0.55), t, 3);
  layer(g, cam, 1, (g) => {
    glow(g, hx + 90, hy - 260, 360, '#fff6e0', 0.1 * rise);
    spaceHero(g, { x: hx, y: hy, s: 1.9, facing: 1, pose, rot: -0.1 + 0.07 * Math.sin(t * 0.8), t, rim: O.rim,
      expr: exprAt(t, [[0, 'surprised'], [tTw, 'awe'], [tKm, 'happy']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(0.5, 0.9) });
  });
  orbitFg(g, t, cam);
  atmos(g, t, cam, { color: '#e8e8ff', far: 12, near: 4 });
  // devices
  dayCounter(g, t, { x: E.W * 0.17, y: E.H * 0.15, s: 0.66, keys: [[0, 19], [tDay, 21]] });
  const lv = Math.exp(lerp(Math.log(150e3), Math.log(500e3), ease.inOut(prog(t, 0, tFive + 0.5))));
  heightMeter(g, t, { y0: E.H * 0.21, y1: E.H * 0.85, value: lv, span: 1.6 });
  const pu = prog(t, tFive, tFive + 0.9); if (pu > 0 && pu < 1) { ring(g, E.W - 330, E.H * 0.5, 40 + 220 * pu, 4, alpha(GOLD(), 0.6 * (1 - pu))); }
  chip(g, t, { str: 'OVER 500 KM', at: tFive, x: E.W * 0.2, y: E.H * 0.91, dur: info.dur - 0.1 });
} });

// ===================================================================================================
// s090 — "You pass the International Space Station."  The ISS drifts across behind him; eyes first, then the head turn.
// ===================================================================================================
registerShot('s090', { draw(g, t, info) {
  const st = info.shot.start, tPass = shotWord('international', st, 0.7), tStation = shotWord('station', st, 1.7);
  const cam = camMove(t, info.dur, { z: [1.08, 1.16], x: [30, -40], y: [10, 0] });
  const iss = lerp(0, 0.6, ease.inOut(prog(t, 0, info.dur)));
  const O = orbit(g, t, cam, { iss, wave: 0, night: 0.3 });
  const hx = E.W * 0.6 + Math.sin(t * 0.6) * 10, hy = E.H * 0.9 + Math.sin(t * 1.1) * 8;
  const tTurn = tStation - 0.05, facing = t < tTurn ? 1 : -1, sq = 1 - 0.9 * Math.max(0, 1 - Math.abs(t - tTurn) / 0.1);
  const look = lookToward(O.pos.issX - hx, O.pos.issY - (hy - 330)), eyes = ease.out(prog(t, tPass - 0.2, tPass + 0.1));
  const pose = idle(poseAt(t, [[0, 'relaxed'], [tPass, 'reach'], [tStation + 0.6, 'relaxed']], 0.45), t, 5);
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(hx, 0); g.scale(sq, 1); g.translate(-hx, 0);
    spaceHero(g, { x: hx, y: hy, s: 1.9, facing, pose, rot: 0.06 * Math.sin(t * 0.7), t, rim: O.rim,
      expr: exprAt(t, [[0, 'neutral'], [tPass, 'awe'], [tStation + 0.5, 'happy']]), blink: blinkFlag(t, 3.2, 4), look: [look[0] * eyes * (facing > 0 ? 1 : -1), look[1] * eyes] });
    g.restore();
  });
  orbitFg(g, t, cam);
  atmos(g, t, cam, { color: '#e8e8ff', far: 12, near: 4 });
  heightMeter(g, t, { y0: E.H * 0.21, y1: E.H * 0.85, value: 500e3, span: 1.6 });
  chip(g, t, { str: 'ISS ~400 KM', at: tStation, x: E.W * 0.36, y: E.H * 0.13, dur: info.dur - 0.1 });
} });

// ===================================================================================================
// s091 — "The astronauts wave. They're not floating because they're high."  Cupola close-up; he waves back.
// ===================================================================================================
registerShot('s091', { draw(g, t, info) {
  const st = info.shot.start, tWave = shotWord('wave', st, 0.9), tNot = shotWord('not', st, 2.0);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-30, 30], y: [0, 10] });
  const O = orbit(g, t, cam, { iss: 2, wave: 0, night: 0.3 });                                       // Earth, with the small ISS parked off-screen
  const wv = ease.out(prog(t, tWave - 0.1, tWave + 0.25));
  const ISS = (g) => { const s = 2.6, ix = E.W * 0.38 + Math.sin(t * 0.4) * 16, iy = E.H * 0.44 - 170 * s + Math.cos(t * 0.5) * 8;
    import_iss(g, ix, iy, s, t, wv); cupola(g, ix, iy + 170 * s, 84 * s, t, wv); glow(g, ix, iy + 170 * s, 520, '#ffd59a', 0.12 + 0.1 * wv); };
  layer(g, cam, 0.7, ISS);
  const hx = E.W * 0.64, hy = E.H * 1.0 + Math.sin(t * 0.9) * 8;
  const wp = poseAt(t, [[0, 'relaxed'], [tWave + 0.1, 'wave']], 0.25), wob = wv * 1;
  const pose = idle({ ...wp, hF: [wp.hF[0] + Math.sin(t * 9) * 9 * wob, wp.hF[1] + Math.cos(t * 9) * 5 * wob], eF: [wp.eF[0] + Math.sin(t * 9) * 3 * wob, wp.eF[1]] }, t, 1);
  layer(g, cam, 1.12, (g) => {
    spaceHero(g, { x: hx, y: hy, s: 2.15, facing: -1, pose, rot: 0.05 * Math.sin(t * 0.7), t, rim: O.rim,
      expr: exprAt(t, [[0, 'smile'], [tWave, 'joy']]), blink: blinkFlag(t, 3.5, 3), look: [-0.7, -0.3] });
  });
  orbitFg(g, t, cam);
  atmos(g, t, cam, { color: '#e8e8ff', far: 12, near: 6 });
  chip(g, t, { str: 'NOT BECAUSE HIGH', at: tNot, x: E.W * 0.3, y: E.H * 0.9, dur: info.dur - 0.1 });
  heightMeter(g, t, { y0: E.H * 0.21, y1: E.H * 0.85, value: 500e3, span: 1.6 });
} });

// bigger, readable astronauts inside the cupola (drawn over the set's tiny ones): helmets, torsos, arms waving high
function cupola(g, wx, wy, WR, t, wv) {
  g.save(); g.beginPath(); g.arc(wx, wy, WR - 3, 0, TAU); g.clip();
  g.fillStyle = radGrad(g, wx, wy, 10, WR, ['#fff3d2', '#ffd896', '#d9a45a']); g.fillRect(wx - WR, wy - WR, WR * 2, WR * 2);
  for (const [dx, c, ph] of [[-0.36, '#f0f0f4', 0], [0.4, '#e6e2f0', 1.7]]) {
    const x = wx + dx * WR, sd = dx < 0 ? -1 : 1, hr = WR * 0.27, hy2 = wy - WR * 0.06 + Math.sin(t * 1.2 + ph) * 5;
    rr(g, x - hr * 1.5, hy2 + hr * 0.9, hr * 3, WR * 0.9, hr * 0.8); g.fillStyle = c; g.fill(); g.strokeStyle = '#9aa0b4'; g.lineWidth = 3; g.stroke();             // torso + suit seam
    rr(g, x - hr * 0.5, hy2 + hr * 1.5, hr, hr * 0.7, 4); g.fillStyle = '#4a6ab0'; g.fill();                                                                              // chest panel
    const a = -1.25 - 0.45 * Math.sin(t * 9 + ph) * wv, L = WR * 0.62, sx = x + sd * hr * 1.4, sy = hy2 + hr * 1.5;
    const armUp = wv > 0.05 ? a : 0.9, ex = sx + Math.cos(armUp) * L * sd * 0.8, ey = sy + Math.sin(armUp) * L;
    seg(g, [[sx, sy], [ex, ey]], hr * 0.7, c); circle(g, ex, ey, hr * 0.42, '#ffffff'); ring(g, ex, ey, hr * 0.42, 2, '#9aa0b4');
    circle(g, x, hy2, hr, c); ring(g, x, hy2, hr, 3, '#9aa0b4'); g.fillStyle = alpha('#2a4a8a', 0.9); g.beginPath(); g.ellipse(x + sd * -hr * 0.1, hy2 + hr * 0.05, hr * 0.7, hr * 0.55, 0, 0, TAU); g.fill();
    circle(g, x - hr * 0.3, hy2 - hr * 0.2, hr * 0.14, alpha('#ffffff', 0.7));
  }
  g.restore(); g.strokeStyle = '#4a4a58'; g.lineWidth = 12; g.beginPath(); g.arc(wx, wy, WR, 0, TAU); g.stroke(); g.strokeStyle = '#8a8a98'; g.lineWidth = 3; g.beginPath(); g.arc(wx, wy, WR + 5, 0, TAU); g.stroke();
}
// thin wrapper so the cupola ISS (iss() from the set) is drawn at a custom scale
function import_iss(g, x, y, s, t, wave) { issDraw(g, x, y, s, t, { wave, rot: -0.03 + Math.sin(t * 0.3) * 0.01 }); }

// ===================================================================================================
// Newton's cannonball figure (shared by s092 / s093)
// ===================================================================================================
const CF = (() => {
  const cx = E.W * 0.46, cy = E.H * 0.58, R = 320, Rm = R + 52, P0 = [cx, cy - Rm];
  const onE = (th) => [cx + R * Math.sin(th), cy - R * Math.cos(th)];
  const E1 = onE(0.5), E2 = onE(1.25);
  const parab = (Ep, n = 40) => { const pts = []; for (let i = 0; i <= n; i++) { const s = i / n; pts.push([lerp(P0[0], Ep[0], s), P0[1] + s * s * (Ep[1] - P0[1])]); } return pts; };
  const parabAt = (Ep, s) => [lerp(P0[0], Ep[0], s), P0[1] + s * s * (Ep[1] - P0[1])];
  const orb = (f0 = 0, f1 = 1, n = 160) => { const pts = []; for (let i = 0; i <= n; i++) { const th = lerp(f0, f1, i / n) * TAU; pts.push([cx + Rm * Math.sin(th), cy - Rm * Math.cos(th)]); } return pts; };
  const orbAt = (f) => [cx + Rm * Math.sin(f * TAU), cy - Rm * Math.cos(f * TAU)];
  return { cx, cy, R, Rm, P0, E1, E2, onE, parab, parabAt, orb, orbAt };
})();
function cannonFig(g, t, o) {
  const { cx, cy, R, Rm, P0, E1, E2 } = CF, ui = S().ui, c = ui.blueprint;
  const ke = o.earth ?? 1, k1 = o.k1 ?? 0, k2 = o.k2 ?? 0, f3a = o.f3a ?? 0, f3b = o.f3b ?? 0;
  // Earth: wireframe globe, meridians turning slowly
  const ph = t * 0.35;
  g.save(); g.globalAlpha *= clamp(ke * 1.4);
  BP.draw(g, Array.from({ length: 121 }, (_, i) => [cx + R * Math.cos(i / 120 * TAU), cy + R * Math.sin(i / 120 * TAU)]), ke, { w: 4.5, color: c });
  g.save(); g.beginPath(); g.arc(cx, cy, R - 2, 0, TAU); g.clip(); g.globalAlpha *= 0.35; g.strokeStyle = c; g.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) { const rx = R * Math.abs(Math.cos(ph + i * Math.PI / 4)); g.beginPath(); g.ellipse(cx, cy, Math.max(1, rx), R, 0, 0, TAU); g.stroke(); }
  for (const la of [-0.6, -0.3, 0, 0.3, 0.6]) { const y = cy + R * Math.sin(la), w = R * Math.cos(la); g.beginPath(); g.ellipse(cx, y, w, w * 0.14, 0, 0, TAU); g.stroke(); }
  g.restore();
  seg(g, [[cx - 14, cy], [cx + 14, cy]], 2, alpha(c, 0.8)); seg(g, [[cx, cy - 14], [cx, cy + 14]], 2, alpha(c, 0.8));
  // mountain + cannon
  const m = ease.out(prog(ke, 0.4, 1)); if (m > 0) { g.globalAlpha *= m;
    BP.draw(g, [[cx - 58, cy - R + 20], [cx - 22, cy - R - 24], [cx - 6, cy - R - 38], [cx + 8, cy - R - 40], [cx + 24, cy - R - 24], [cx + 60, cy - R + 20]], 1, { w: 4, color: c });
    for (const [a, b] of [[[cx - 22, cy - R - 24], [cx - 12, cy - R - 4]], [[cx + 24, cy - R - 24], [cx + 14, cy - R - 2]], [[cx - 6, cy - R - 38], [cx + 2, cy - R - 12]]]) seg(g, [a, b], 2, alpha(c, 0.6)); }
  g.restore();
  // cannon barrel (aimed sideways)
  g.save(); g.globalAlpha *= clamp(ke * 1.4); const rec = o.recoil ?? 0; g.translate(P0[0] - rec * 6, P0[1] + 4); rr(g, -22, -8, 52, 16, 4); g.fillStyle = '#0d1a38'; g.fill(); g.strokeStyle = c; g.lineWidth = 3.4; g.stroke(); circle(g, -10, 10, 9, '#0d1a38'); ring(g, -10, 10, 9, 3, c); g.restore();
  // orbit guide (dashed) once the last shot is under way
  if (f3b > 0.001) { g.save(); g.setLineDash([10, 14]); g.strokeStyle = alpha(c, 0.22); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, Rm, 0, TAU); g.stroke(); g.setLineDash([]); g.restore(); }
  // arcs 1 and 2 (they land), arc 3 (wraps all the way round)
  const trail = (pts, k, col, w) => BP.draw(g, pts, k, { w, color: col });
  trail(CF.parab(E1), k1, alpha('#ffffff', 0.85), 4); trail(CF.parab(E2), k2, alpha('#ffffff', 0.85), 4);
  if (f3b > f3a + 0.0005) BP.draw(g, CF.orb(f3a, f3b, Math.max(8, Math.round(160 * (f3b - f3a)))), 1, { w: 5.5, color: GOLD() });
  // cannonballs + impact rings
  const ball = (x, y, col) => { glow(g, x, y, 34, col, 0.55); circle(g, x, y, 9, '#ffffff'); circle(g, x, y, 5, col); };
  if (k1 > 0 && k1 < 1) { const [x, y] = CF.parabAt(E1, k1); ball(x, y, '#cfe8ff'); }
  if (k1 >= 1) { const u = prog(o.u1 ?? 99, 0, 0.7); circle(g, E1[0], E1[1], 6, '#ffffff'); ring(g, E1[0], E1[1], 10 + 46 * u, 3, alpha('#ffffff', 0.7 * (1 - u))); }
  if (k2 > 0 && k2 < 1) { const [x, y] = CF.parabAt(E2, k2); ball(x, y, '#cfe8ff'); }
  if (k2 >= 1) { const u = prog(o.u2 ?? 99, 0, 0.7); circle(g, E2[0], E2[1], 6, '#ffffff'); ring(g, E2[0], E2[1], 10 + 46 * u, 3, alpha('#ffffff', 0.7 * (1 - u))); }
  if (o.ball3 !== false && f3b > 0.001) { const [x, y] = CF.orbAt(f3b); ball(x, y, GOLD()); }
}
const bpZoom = (g, z, px, py, fn) => { g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + px, -E.H / 2 + py); fn(); g.restore(); };
const F3_MID = 0.42;                                                                                  // how far round the last shot has got at the s092 / s093 cut

registerShot('s092', { draw(g, t, info) {
  const st = info.shot.start, tFall = shotWord('falling', st, 1.4), tSide = shotWord('sideways', st, 1.8);
  const z = lerp(1.0, 1.03, ease.inOut(t / info.dur));
  bpZoom(g, z, Math.sin(t * 0.5) * 3, -z * 4 * (t / info.dur), () => {
    BP.board(g, t, { title: "NEWTON'S CANNONBALL", fig: 'FIG 4 - ORBIT' });
    const k1 = ease.inOut(prog(t, 0.2, 0.75)), k2 = ease.inOut(prog(t, 0.6, 1.3)), f3 = F3_MID * ease.inOut(prog(t, tFall, info.dur - 0.02));
    cannonFig(g, t, { earth: ease.out(prog(t, 0, 0.7)), k1, k2, f3a: 0, f3b: f3, u1: t - 0.75, u2: t - 1.3, recoil: Math.exp(-(t - 0.2) * 10) * (t > 0.2 ? 1 : 0) });
    BP.label(g, t, { at: CF.E1, to: [CF.cx + CF.Rm + 60, CF.E1[1] - 20], str: 'LANDS CLOSE', start: 0.85 });
    BP.label(g, t, { at: CF.E2, to: [CF.cx + CF.Rm + 60, CF.E2[1] + 10], str: 'LANDS FAR', start: 1.35 });
    const a3 = CF.orbAt(0.27); BP.label(g, t, { at: a3, to: [a3[0] + 70, a3[1] + 90], str: 'FALLING SIDEWAYS', start: tSide - 0.05 });
  });
  FX.dust(g, t * 0.5, { count: 14, color: '#9fc8ff', a: 0.18, seed: 5 });
} });

registerShot('s093', { draw(g, t, info) {
  const st = info.shot.start, tEarth = shotWord('earth', st, 0.9), tEight = shotWord('eight', st, 1.8), tSec = shotWord('second', st, 3.0);
  const z = lerp(1.03, 1.065, ease.inOut(t / info.dur));
  const done = ease.inOut(prog(t, 0, tEarth + 0.15)), f3 = lerp(F3_MID, 1, done);
  const th = TAU * (done >= 1 ? 1 + (t - tEarth - 0.15) * 0.1 : 1), issF = 1 + (t - tEarth - 0.15) * 0.1;
  bpZoom(g, z, Math.sin(t * 0.5) * 3, -z * 6 - 4 * (t / info.dur), () => {
    BP.board(g, t, { title: "NEWTON'S CANNONBALL", fig: 'FIG 4 - ORBIT' });
    cannonFig(g, t, { earth: 1, k1: 1, k2: 1, f3a: 0, f3b: Math.min(1, f3), ball3: done < 1 });
    // the full orbit pulses gold once it closes
    const close = prog(t, tEarth + 0.1, tEarth + 0.8); if (close > 0 && close < 1) { g.save(); g.strokeStyle = alpha(GOLD(), 0.5 * (1 - close)); g.lineWidth = 6 + 12 * close; g.beginPath(); g.arc(CF.cx, CF.cy, CF.Rm, 0, TAU); g.stroke(); g.restore(); }
    // the ISS icon rides the circle with a gold tangent velocity arrow
    if (t > tEarth + 0.1) {
      const f = issF % 1, [ix, iy] = CF.orbAt(f), ang = f * TAU, tx = Math.cos(ang), ty = Math.sin(ang), appear = ease.out(prog(t, tEarth + 0.1, tEarth + 0.5));
      g.save(); g.translate(ix, iy); g.rotate(ang); g.scale(appear, appear);
      rr(g, -10, -8, 20, 16, 3); g.fillStyle = '#0d1a38'; g.fill(); g.strokeStyle = S().ui.blueprint; g.lineWidth = 2.4; g.stroke();
      for (const sx of [-1, 1]) { rr(g, sx * 21 - 8, -12, 16, 24, 2); g.fillStyle = alpha(S().ui.blueprint, 0.25); g.fill(); g.stroke(); } seg(g, [[-12, 0], [12, 0]], 2, S().ui.blueprint); g.restore();
      glow(g, ix, iy, 40, '#9fd8ff', 0.3);
      const ak = ease.out(prog(t, tEight - 0.05, tEight + 0.45)); if (ak > 0) {
        const L = 190 * ak, ex = ix + tx * L, ey = iy + ty * L, gold = GOLD();
        seg(g, [[ix + tx * 22, iy + ty * 22], [ex, ey]], 6, gold); poly(g, [[ex + tx * 22, ey + ty * 22], [ex - ty * 13, ey + tx * 13], [ex + ty * 13, ey - tx * 13]], gold); glow(g, ex, ey, 40, gold, 0.4);
        const lx = E.W * 0.80, ly = E.H * 0.3; seg(g, [[ex, ey], [lx - 130 * ak, ly + 30]], 2, alpha(gold, 0.55));
        g.save(); const pop = ease.outBack(prog(t, tEight, tEight + 0.45)); g.translate(lx, ly); g.scale(pop, pop);
        text(g, '7.8 km/s', 0, 0, { size: 70, color: gold, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(gold, 0.6), stroke: 8, strokeColor: '#0a1328' }); g.restore();
      }
    }
  });
  FX.dust(g, t * 0.5, { count: 14, color: '#9fc8ff', a: 0.18, seed: 7 });
} });

// ===================================================================================================
// s094 — RULE 5 "UP ISN'T ORBIT." over the dimmed orbit set; a tiny hero goes straight up and straight back down.
// ===================================================================================================
registerShot('s094', { draw(g, t, info) {
  const st = info.shot.start, tSo = shotWord('so', st, 1.2), tCome = shotWord('come', st, 1.9);
  const bg = (g, tt) => {
    const cam = camMove(tt, info.dur, { z: [1.0, 1.06], x: [-20, 20] });
    blurLayer(g, 9, (g) => { orbit(g, tt, cam, { iss: lerp(0.3, 0.45, tt / info.dur), night: 0.3 }); }, null, 1);
    veil(g, '#05060f', 0.38);
    // straight up, straight back down
    const gy = E.H * 0.9, hx = E.W * 0.13, top = E.H * 0.34;
    const up = ease.out(prog(tt, 0.15, tSo + 0.25)), dn = prog(tt, tCome - 0.05, info.dur - 0.12), lift = (gy - top) * up * (1 - dn * dn);
    const y = gy - lift;
    if (lift > 4) { g.save(); g.setLineDash([8, 12]); g.strokeStyle = alpha(GOLD(), 0.5); g.lineWidth = 3; g.beginPath(); g.moveTo(hx + 70, gy); g.lineTo(hx + 70, y); g.stroke(); g.setLineDash([]);
      const arr = dn > 0 ? -1 : 1; poly(g, [[hx + 70, y - arr * 14 + (arr > 0 ? 0 : 28)], [hx + 60, y + (arr > 0 ? 14 : 0)], [hx + 80, y + (arr > 0 ? 14 : 0)]], alpha(GOLD(), 0.8)); g.restore(); }
    if (dn > 0.1) FX.speedLines(g, tt, { cx: hx, cy: y - 120, count: 14, a: 0.12 * dn, inner: 120 });
    spaceHero(g, { x: hx, y, s: 0.8, facing: 1, pose: idle(dn > 0 ? JPOSE.flail : (up < 1 ? JPOSE.rise : JPOSE.apex), tt, 2), t: tt, rot: dn > 0 ? Math.sin(tt * 9) * 0.1 : 0,
      expr: dn > 0 ? 'shocked' : 'happy', blink: blinkFlag(tt, 3, 1), alpha: 0.95, rim: { color: '#fff6e0', dir: [-0.8, -0.6] } });
    atmos(g, tt, cam, { color: '#e8e8ff', far: 10, near: 3 });
  };
  ruleCard(g, t, info, { n: 5, title: "UP ISN'T ORBIT.", bg });
} });

// ===================================================================================================
// s095 — "Days twenty-two, twenty-three, twenty-four."  Big counter flips 21 > 22 > 23 > 24 over the dimmed, slowly turning Earth.
// ===================================================================================================
registerShot('s095', { draw(g, t, info) {
  const st = info.shot.start, t22 = shotWord('twenty-two', st, 1.07), t23 = shotWord('twenty-three', st, 1.7), t24 = shotWord('twenty-four', st, 2.33);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], x: [-30, 30], y: [0, 10] });
  blurLayer(g, 8, (g) => { orbit(g, t * 1.6, cam, { iss: lerp(0.5, 0.8, t / info.dur), night: 0.45 }); }, null, 1); veil(g, '#05060f', 0.4);
  const keys = [[0, 21], [t22, 22], [t23, 23], [t24, 24]], cxp = E.W * 0.38, cyp = E.H * 0.5;
  const z = lerp(1.0, 1.05, ease.inOut(t / info.dur)); g.save(); g.translate(cxp, cyp); g.scale(z, z); g.translate(-cxp, -cyp);
  dayCounter(g, t, { x: cxp, y: cyp, s: 1.65, keys });
  g.restore();
  // each flip: a gold shockwave and a x2 glyph pops up beside the counter
  [t22, t23, t24].forEach((tf, i) => {
    const u = prog(t, tf, tf + 0.9); if (u > 0 && u < 1) { ring(g, cxp + 250, cyp, 60 + 520 * u, 5, alpha(GOLD(), 0.5 * (1 - u))); }
    const pu = prog(t, tf, tf + 0.6); if (pu > 0 && pu < 1) { const px = cxp + 90, py = cyp - 230 - 70 * ease.out(pu); g.save(); g.globalAlpha *= (1 - ease.in(pu)) ; g.translate(px, py); const s = ease.outBack(prog(pu, 0, 0.3)); g.scale(s, s);
      text(g, '×2', 0, 0, { size: 120, color: GOLD(), font: FONTS.ui, weight: 900, glow: 20, glowColor: alpha(GOLD(), 0.6), stroke: 10, strokeColor: '#1a1020' }); g.restore(); }
  });
  // right side: the hero climbs a step higher on each day, ghosts of his earlier positions fading behind him
  const lv = [0.8, 0.62, 0.44, 0.26], hxx = E.W * 0.78;
  const hyAt = (tt) => { let y = lv[0]; for (let i = 1; i < 4; i++) y = lerp(y, lv[i], ease.out(prog(tt, keys[i][0], keys[i][0] + 0.45))); return E.H * y; };
  layer(g, cam, 1, (g) => {
    for (let k = 4; k >= 1; k--) { const tt = t - k * 0.11; if (tt < 0) continue; const gy = hyAt(tt); g.save(); g.globalAlpha *= 0.14 * (1 - k / 5); spaceHero(g, { x: hxx, y: gy, s: 1.2, facing: -1, pose: JPOSE.apex, t, rim: false, expr: 'happy' }); g.restore(); }
    const hy2 = hyAt(t) + Math.sin(t * 1.2) * 7, pop = Math.max(...[t22, t23, t24].map((tf) => Math.exp(-(t - tf) * 5) * (t >= tf ? 1 : 0)));
    spaceHero(g, { x: hxx, y: hy2, s: 1.2, facing: -1, pose: idle(poseAt(t, [[0, JPOSE.apex], [t22, 'cheer'], [t22 + 0.5, JPOSE.apex], [t23, 'cheer'], [t23 + 0.5, JPOSE.apex], [t24, 'cheer'], [t24 + 0.5, JPOSE.apex]], 0.2), t, 2), rot: 0.08 * Math.sin(t * 0.8), t, rim: { color: '#fff6e0', dir: [-0.8, -0.6] },
      expr: exprAt(t, [[0, 'awe'], [t22, 'joy'], [t22 + 0.5, 'awe'], [t23, 'joy'], [t23 + 0.5, 'awe'], [t24, 'joy']]), blink: blinkFlag(t, 3.3, 2), look: [-0.4, 0.5] });
    void pop;
  });
  FX.dust(g, t, { count: 24, color: '#ffe3a8', a: 0.3, seed: 8 });
  atmos(g, t, cam, { color: '#e8e8ff', far: 10, near: 4 });
  orbitFg(g, t, cam);
} });

// ===================================================================================================
// s096 — "A thousand kilometres. Two thousand. Four thousand."  The Earth shrinks in steps into a full globe.
// ===================================================================================================
registerShot('s096', { draw(g, t, info) {
  const st = info.shot.start, T = [shotWord('thousand', st, 0.78), shotWord('two', st, 2.04), shotWord('four', st, 3.29)];
  const cam = camMove(t, info.dur, { z: [1.06, 0.97], x: [-24, 24], y: [-10, 0] });
  deepSpace(g, t, cam);
  // step animation: each spoken number snaps the globe to a smaller size
  const step = (i) => ease.outBack(prog(t, T[i] - 0.05, T[i] + 0.5));
  const A = [[980, E.H * 0.72 + 980], [600, E.H * 0.7 + 600], [370, E.H * 0.95], [230, E.H * 0.78]];
  let R = A[0][0], cyG = A[0][1]; for (let i = 0; i < 3; i++) { const k = clamp(step(i), 0, 1.15); R = lerp(R, A[i + 1][0], k); cyG = lerp(cyG, A[i + 1][1], k); }
  layer(g, cam, 0.5, (g) => globe(g, t, E.W * 0.56, cyG, R, { spin: 0.14 }));
  const fy = E.H * 0.47 + Math.sin(t * 1.0) * 9, fx = E.W * 0.56 + Math.sin(t * 0.6) * 14, last = t > T[2] - 0.05;
  const pose = idle(poseAt(t, [[0, JPOSE.apex], [T[0], 'relaxed'], [T[2], 'handsUp']], 0.5), t, 7);
  layer(g, cam, 1, (g) => {
    spaceHero(g, { x: fx, y: fy + 40, s: 1.25, facing: -1, pose, rot: 0.1 * Math.sin(t * 0.7), t, rim: { color: '#9fd8ff', dir: [0.6, 0.7] },
      expr: exprAt(t, [[0, 'awe'], [T[1], 'surprised'], [T[2], 'shocked']]), blink: blinkFlag(t, 3.3, 5), look: lookToward(0, 1) });
  });
  // the spoken numbers, gold, big on the left; earlier ones stack small above
  const names = ['1,000 km', '2,000 km', '4,000 km'];
  const curI = t >= T[2] ? 2 : t >= T[1] ? 1 : t >= T[0] ? 0 : -1;
  for (let i = 0; i <= curI; i++) { const u = prog(t, T[i], T[i] + 0.4), p = ease.outBack(u), cur = i === curI, y = E.H * 0.3 - (cur ? 0 : 84 * (curI - i)), sc = cur ? 1 : 0.55;
    g.save(); g.translate(E.W * 0.2, y); g.scale(p * sc, p * sc); g.globalAlpha *= cur ? 1 : 0.55;
    text(g, names[i], 0, 0, { size: 112, color: GOLD(), font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(GOLD(), 0.55), stroke: 10, strokeColor: '#0a0714' }); g.restore(); }
  atmos(g, t, cam, { color: '#e8e8ff', far: 10, near: 4 });
  const vals = [1000e3, 2000e3, 4000e3]; let mv = 700e3; for (let i = 0; i < 3; i++) mv = Math.exp(lerp(Math.log(mv), Math.log(vals[i]), ease.out(prog(t, T[i] - 0.05, T[i] + 0.4))));
  heightMeter(g, t, { y0: E.H * 0.21, y1: E.H * 0.85, value: mv, span: 2.2 });
  if (last) FX.sparkle(g, E.W * 0.56 + 140, fy - 230, 18 + 6 * Math.sin(t * 6), '#ffd8a0', 0.8);
} });

// ===================================================================================================
// s097 — "Every fall takes longer than the last."  Bored, lying on his back like on a sofa; the stopwatch races 00:12:00 > 00:31:00.
// ===================================================================================================
function stopwatch(g, t, x, y, r, secs, o = {}) {
  const gold = GOLD(); g.save(); g.translate(x, y); g.scale(o.sc ?? 1, o.sc ?? 1);
  glow(g, 0, 0, r * 2.2, gold, 0.18);
  rr(g, -r * 0.14, -r * 1.34, r * 0.28, r * 0.3, 6); g.fillStyle = '#a8841c'; g.fill(); g.save(); g.rotate(0.78); rr(g, -r * 0.1, -r * 1.34, r * 0.2, r * 0.26, 5); g.fillStyle = '#a8841c'; g.fill(); g.restore();
  circle(g, 0, 0, r * 1.12, '#6e5410'); circle(g, 0, 0, r * 1.06, linGrad(g, -r, -r, r, r, ['#ffe9a0', '#c99a22', '#8a6a14'])); circle(g, 0, 0, r * 0.9, '#14101c');
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0, r0 = r * (big ? 0.7 : 0.78), r1 = r * 0.86; seg(g, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], big ? 3.4 : 1.6, alpha('#fff1dc', big ? 0.9 : 0.5)); }
  const ha = (secs % 60) / 60 * TAU - Math.PI / 2;
  for (let k = 3; k >= 1; k--) { const a = ha - k * (o.blur ?? 0) * 0.18; seg(g, [[0, 0], [Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78]], 4, alpha('#ff6a4a', 0.18 / k)); }
  seg(g, [[-Math.cos(ha) * r * 0.16, -Math.sin(ha) * r * 0.16], [Math.cos(ha) * r * 0.78, Math.sin(ha) * r * 0.78]], 5, '#ff6a4a'); circle(g, 0, 0, r * 0.07, gold);
  const S2 = Math.floor(secs), hh = Math.floor(S2 / 3600), mm = Math.floor(S2 / 60) % 60, ss = S2 % 60, pad = (n) => String(n).padStart(2, '0'), str = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  rr(g, -r * 0.72, r * 0.2, r * 1.44, r * 0.4, 8); g.fillStyle = '#05040a'; g.fill(); g.strokeStyle = alpha(gold, 0.8); g.lineWidth = 2.5; g.stroke();
  text(g, str, 0, r * 0.4 + 2, { size: r * 0.32, color: gold, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(gold, 0.6), spacing: 1 });
  g.restore();
}
registerShot('s097', { draw(g, t, info) {
  const st = info.shot.start, tTakes = shotWord('takes', st, 0.62), tLonger = shotWord('longer', st, 0.98);
  const cam = camMove(t, info.dur, { z: [1.0, 1.1], x: [-30, 30], y: [10, -8], r: [-0.01, 0.012] });
  const O = orbit(g, t, cam, { iss: 2, night: 0.4 });
  const hx = E.W * lerp(0.4, 0.5, t / info.dur) + Math.sin(t * 0.5) * 10, hy = E.H * 0.52 + Math.sin(t * 0.9) * 12;
  // hands behind the head, legs crossed: the sofa pose
  const sofa = { head: [8, -208], sh: [3, -176], hip: [0, -100], eF: [-6, -192], hF: [-2, -224], eB: [-22, -190], hB: [-10, -220], kF: [14, -54], fF: [26, -12], kB: [-10, -50], fB: [28, -22] };
  const pose = idle({ ...sofa, fF: [sofa.fF[0] + Math.sin(t * 1.3) * 3, sofa.fF[1]] }, t, 4), rot = -1.4 + 0.07 * Math.sin(t * 0.8);
  layer(g, cam, 1, (g) => {
    // a floating cushion under his head
    g.save(); g.translate(hx - 190, hy - 36); g.rotate(-0.25 + Math.sin(t * 0.7) * 0.06); rr(g, -70, -42, 140, 84, 26); g.fillStyle = '#7a4aa8'; g.fill(); g.strokeStyle = '#a77ad8'; g.lineWidth = 4; g.stroke(); circle(g, 0, 0, 7, '#a77ad8'); g.restore();
    glow(g, hx, hy - 20, 340, '#9fd8ff', 0.1);
    spaceHero(g, { x: hx, y: hy + 70, s: 2.3, facing: 1, pose, rot, t, rim: O.rim,
      expr: exprAt(t, [[0, 'neutral'], [tTakes, 'sleepy'], [tLonger + 0.3, 'smirk']]), blink: blinkFlag(t, 3.8, 6), look: [0.2, -0.8] });
  });
  orbitFg(g, t, cam);
  atmos(g, t, cam, { color: '#e8e8ff', far: 12, near: 4 });
  // the stopwatch races on 'longer'
  const race = ease.inOut(prog(t, tLonger, tLonger + 1.05)), secs = lerp(12 * 60, 31 * 60, race) + (race > 0 && race < 1 ? Math.sin(t * 40) * 0 : 0), pop = ease.outBack(prog(t, tTakes - 0.1, tTakes + 0.4));
  const sec2 = race > 0 && race < 1 ? secs + Math.floor(t * 60) % 60 * 0.99 : secs;
  g.save(); g.translate(E.W * 0.8, E.H * 0.3 + Math.sin(t * 1.1) * 6); g.scale(pop, pop); g.rotate(Math.sin(t * 0.8) * 0.04);
  stopwatch(g, t, 0, 0, 150, sec2, { blur: race > 0 && race < 1 ? 1 : 0 }); g.restore();
  void fmtHeight;
} });

// ===================================================================================================
// s098 — "You've started bringing snacks."  Giant face munching crisps in zero-g.
// ===================================================================================================
function crisp(g, x, y, rot, s, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#f2c14e'; g.beginPath(); g.ellipse(0, 0, 40, 28, 0, 0, TAU); g.fill(); g.strokeStyle = '#c98f1e'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = alpha('#c98f1e', 0.7); g.lineWidth = 2; for (const dx of [-18, 0, 18]) { g.beginPath(); g.ellipse(dx, 0, 8, 22, 0, 0, TAU); g.stroke(); }
  g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.ellipse(-14, -12, 14, 5, -0.3, 0, TAU); g.fill();
  if (o.rim) { g.strokeStyle = alpha(o.rim, 0.6); g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, 40, 28, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); }
  g.restore();
}
function packet(g, t, x, y, w, h, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const zig = (yy, dir) => { const pts = []; for (let i = 0; i <= 14; i++) pts.push([-w / 2 + (i / 14) * w, yy + (i % 2 ? dir * 12 : 0)]); return pts; };
  const body = [...zig(-h / 2, 1), [w / 2 + 14, -h * 0.1], [w / 2 + 6, h * 0.25], [w / 2 + 14, h / 2 - 10], ...zig(h / 2, -1).reverse(), [-w / 2 - 14, h / 2 - 10], [-w / 2 - 6, h * 0.25], [-w / 2 - 14, -h * 0.1]];
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.moveTo(body[0][0] + 10, body[0][1] + 14); for (const p of body) g.lineTo(p[0] + 10, p[1] + 14); g.fill();
  g.fillStyle = linGrad(g, -w / 2, 0, w / 2, 0, ['#b82e22', '#e24a34', '#f0624a', '#c93a28', '#8e2018']); g.beginPath(); g.moveTo(body[0][0], body[0][1]); for (const p of body) g.lineTo(p[0], p[1]); g.closePath(); g.fill();
  g.strokeStyle = '#6a140e'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(0, h * 0.02, w * 0.38, h * 0.2, -0.08, 0, TAU); g.fill(); g.strokeStyle = '#a8841c'; g.lineWidth = 4; g.stroke();
  text(g, 'CRISPS', 0, h * 0.0, { size: 74, color: '#b82e22', font: FONTS.title, weight: 700, stroke: 0 });
  text(g, 'SALT & VINEGAR', 0, h * 0.11, { size: 22, color: '#6a140e', font: FONTS.ui, weight: 900, spacing: 3 });
  for (let i = 0; i < 7; i++) seg(g, [[-w / 2 + 14, -h / 2 + 40 + i * 6], [w / 2 - 14, -h / 2 + 40 + i * 6]], 1.4, alpha('#6a140e', 0.25));     // crimp lines
  seg(g, [[-w * 0.36, -h * 0.4], [-w * 0.3, h * 0.38]], 14, alpha('#ffffff', 0.18));                                                           // foil sheen
  g.restore();
}
registerShot('s098', { draw(g, t, info) {
  const st = info.shot.start, tSnack = shotWord('snacks', st, 1.14);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], x: [-14, 14], y: [0, -8] });
  blurLayer(g, 10, (g) => { orbit(g, t, cam, { iss: 0.6, night: 0.3 }); }, null, 1); veil(g, '#05060f', 0.22);
  glow(g, E.W * 0.5, E.H * 1.05, 1000, '#4a9aff', 0.3);
  const cx = E.W * 0.48 + Math.sin(t * 0.7) * 10, cy = E.H * 0.5 + Math.sin(t * 1.0) * 6, R = 255;
  const chew = Math.pow(Math.sin(t * 10.5) * 0.5 + 0.5, 1.2), eating = prog(t, 0.45, 0.6) * (1 - prog(t, info.dur - 0.25, info.dur - 0.1) * 0.5);
  const f0 = faceAt(t, [[0, 'cheeky'], [1.0, 'joy'], [1.8, 'cheeky']], 0.16);
  const f = { ...f0, open: lerp(f0.open, 0.06 + 0.5 * chew, eating), smile: lerp(f0.smile, 0.55, eating * 0.5), w: lerp(f0.w, 0.9 + 0.15 * chew, eating), blush: Math.max(f0.blush, 0.5) };
  const br = Math.sin(t * 2.2), tilt = lerp(-0.03, 0.05, ease.inOut(t / info.dur)) + 0.012 * chew * eating;
  layer(g, cam, 1, (g) => {
    // T-shirt shoulders (no hoodie in space)
    g.fillStyle = shade('#E1AD01', -0.12); g.beginPath(); g.ellipse(cx, cy + R * 1.78, R * 1.45, R * 0.95, 0, Math.PI, TAU); g.fill();
    g.fillStyle = '#E1AD01'; g.beginPath(); g.moveTo(cx - R * 1.9, cy + R * 2.4); g.quadraticCurveTo(cx - R * 1.7, cy + R * 1.2, cx - R * 0.7, cy + R * 1.04); g.lineTo(cx + R * 0.7, cy + R * 1.04); g.quadraticCurveTo(cx + R * 1.7, cy + R * 1.2, cx + R * 1.9, cy + R * 2.4); g.closePath(); g.fill();
    g.strokeStyle = shade('#E1AD01', -0.3); g.lineWidth = R * 0.05; g.beginPath(); g.moveTo(cx - R * 0.7, cy + R * 1.04); g.quadraticCurveTo(cx, cy + R * 1.34, cx + R * 0.7, cy + R * 1.04); g.stroke();
    giantFace(g, cx, cy, R, { who: 'SPACE', f, rimSide: 1, rimColor: '#8fd0ff', breath: br, blink: blinkAmt(t, 3.1, 0.4), glint: '#9fd8ff', tilt });
    helmet(g, cx, cy + br * R * 0.012, R / 26, { front: true, rot: tilt, t, rimColor: '#9fd8ff', lit: [0.7, -0.5] });
    glow(g, cx + 250, cy + 80, 360, '#8fd0ff', 0.1);
  });
  // crisps floating toward his mouth, crumbs drifting in zero-g, the packet at the bottom
  layer(g, cam, 1.15, (g) => {
    const mx = cx, my = cy + R * 0.33;
    const flyIn = (t0, fromX, fromY, rotv) => { const u = prog(t, t0, t0 + 0.45); if (u <= 0 || u >= 1) return; const e = ease.inOut(u), x = lerp(fromX, mx, e), y = lerp(fromY, my, e) - Math.sin(e * Math.PI) * 90; crisp(g, x, y, rotv + u * 3, lerp(1.0, 0.6, e), { rim: '#bfe4ff' }); };
    flyIn(0.0, E.W * 0.78, E.H * 0.98, 0.3); flyIn(tSnack - 0.35, E.W * 0.3, E.H * 1.0, -0.4); flyIn(1.55, E.W * 0.72, E.H * 1.0, 0.8);
    const R2 = rng(19);
    for (let i = 0; i < 8; i++) { const bx = lerp(E.W * 0.1, E.W * 0.95, R2()), by = lerp(E.H * 0.2, E.H * 0.95, R2()), sp = 0.3 + R2() * 0.5, ph = R2() * TAU, cs = 0.35 + R2() * 0.35;
      if (Math.abs(bx - cx) < R * 0.9 && by < cy + R * 0.9) continue;
      crisp(g, bx + Math.sin(t * sp + ph) * 22, by + Math.cos(t * sp * 0.8 + ph) * 18, t * sp * 0.8 + ph, cs, { rim: '#bfe4ff' }); }
    for (const [tp, k] of [[0.4, 0], [tSnack - 0.05, 1], [1.5, 2]]) { const u = t - tp; if (u < 0) continue; const R3 = rng(60 + k);
      for (let i = 0; i < 12; i++) { const a = R3() * TAU, v = 70 + R3() * 170, life = 1.6, uu = u / life; if (uu > 1) continue; const x = mx + Math.cos(a) * v * u * 0.8 + Math.sin(t * 2 + i) * 6, y = my + Math.sin(a) * v * u * 0.8 - 10 * u;
        g.save(); g.globalAlpha *= 1 - uu; circle(g, x, y, 3 + R3() * 4, i % 3 ? '#f2c14e' : '#c98f1e'); g.restore(); } }
    packet(g, t, E.W * 0.76 + Math.sin(t * 0.6) * 12, E.H * 0.88 + Math.cos(t * 0.8) * 8, 360, 470, -0.32 + Math.sin(t * 0.5) * 0.04);
  });
  FX.lensStreak(g, E.W * 0.5, E.H * 0.3, E.W * 1.2, '#bfe4ff', 0.1);
  atmos(g, t, cam, { color: '#e8e8ff', far: 12, near: 5 });
  orbitFg(g, t, cam);
} });
