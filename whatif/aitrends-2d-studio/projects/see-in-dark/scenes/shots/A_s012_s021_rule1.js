// A_s012_s021_rule1.js — batch A (v2), Rule 1 "your eyes quit first": cones, the cinema, Dev, the cat's eye (s012-s021).
// (s010 RULE 1 card and s011 rods blueprint are showcase shots in S_showcase.js.) Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shake, text, FONTS, rr, seg, circle, ring, poly, linGrad, shade, mix, backdrop, rng } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { cinema, cinemaFg, cinemaGround } from '../sets/cinema.js';
import { thermalView, heatActor, heatBlob, heatRect } from '../sets/thermal.js';
import { chip, darkness } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';

const sw = (w, st, fb, exact = false) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && (exact ? x.word.toLowerCase().replace(/[^\w']/g, '') === m : x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m))); return (hit ? hit.start : st + fb) - st; };
const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
const toScreen = (x, y, cam) => [(x - E.W / 2 - (cam.x || 0)) * cam.z + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * cam.z + E.H / 2];
const bpZoom = (g, t, dur, f) => { const z = 1 + 0.035 * ease.inOut(t / dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2); f(); g.restore(); };
// cone positions inside BP.retina (same layout maths as bp.js), for highlights drawn on top
const conesOf = (x, y, w, h) => { const x0 = x - w / 2, y0 = y - h / 2, base = y0 + h - 44, top = y0 + 128, n = Math.max(8, Math.round(w / 52)), gap = w / (n + 1); const out = []; for (let i = 0; i < n; i++) if (i % 3 === 1) out.push([x0 + gap * (i + 1), base - (base - top - 70), base, i]); return out; };
// popcorn tub (red-and-cream stripes) at a hand
function popcorn(g, x, y, s = 1, tip = 0) {
  g.save(); g.translate(x, y); g.rotate(tip); g.scale(s, s);
  poly(g, [[-24, -40], [24, -40], [18, 14], [-18, 14]], '#f2ece0'); for (const sx of [-16, 0, 16]) poly(g, [[sx - 4, -40], [sx + 4, -40], [sx * 0.75 + 3, 14], [sx * 0.75 - 3, 14]], '#d8433a');
  for (let i = 0; i < 8; i++) circle(g, -21 + i * 6, -44 - (i % 2) * 7, 7.5, '#fff3c4'); g.restore();
}
const kernel = (g, x, y, r, lit) => { circle(g, x, y, r, mix('#e8dcc0', '#fff3c4', lit)); circle(g, x + r * 0.4, y - r * 0.3, r * 0.6, mix('#d8c8a0', '#ffe39a', lit)); if (lit > 0.3) glow(g, x, y, r * 4, '#ffd47e', 0.35 * lit); };

// s012 — "and about six million cones for colour,"  blueprint: the camera slides along the retina inset, the cones light up in a gold wave
registerShot('s012', { draw(g, t, info) {
  const st = info.shot.start, tSix = sw('six', st, 0.7), tMil = sw('million', st, 1.0), tCol = sw('colour', st, 2.0);
  const x = E.W * 0.5 - lerp(-60, 60, ease.inOut(t / info.dur)), y = E.H * 0.5, w = 1500, h = 560;
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'THE HUMAN EYE', fig: 'FIG 2 - RETINA, CONE CELLS' });
    BP.retina(g, t, { x, y, w, h, rods: true, cones: true });
    conesOf(x, y, w, h).forEach(([cx, ctop, base], j) => { const on = ease.out(prog(t, tSix + j * 0.07, tSix + 0.25 + j * 0.07)) * (1 - 0.4 * prog(t, tSix + 1.2 + j * 0.07, tSix + 1.8)); if (on > 0.01) { glow(g, cx, (ctop + base) / 2, 90, '#ffd47e', 0.55 * on); g.strokeStyle = alpha('#ffd47e', on); g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 17, base); g.lineTo(cx - 4, ctop); g.lineTo(cx + 4, ctop); g.lineTo(cx + 17, base); g.stroke(); } });
    const c0 = conesOf(x, y, w, h)[2]; BP.label(g, t, { at: [c0[0], c0[1]], to: [c0[0] + 60, y - h / 2 - 50], str: 'CONES = COLOUR', start: tCol });
  });
  chip(g, t, { str: 'About 6 million cones', at: tMil, x: E.W * 0.5, y: E.H * 0.88, tone: 'gold', dur: info.dur - 0.05 });
} });

// s013 — "and at night, the cones basically clock out."  blueprint retina at night: cones fade to grey one by one, rods stay lit; punch-clock stamp
registerShot('s013', { draw(g, t, info) {
  const st = info.shot.start, tNight = sw('night', st, 0.5), tClock = sw('clock', st, 1.9), x = E.W * 0.47, y = E.H * 0.5, w = 1300, h = 520;
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'THE RETINA AT NIGHT', fig: 'FIG 3 - CONES OFF DUTY' });
    const dim = ease.inOut(prog(t, tNight, tClock + 0.4));
    BP.retina(g, t, { x, y, w, h, rods: true, cones: true, dim });
    // night sky strip over the inset
    g.fillStyle = alpha('#0a1030', 0.5 * dim); g.fillRect(x - w / 2, y - h / 2 - 60, w, 50); FX.moon(g, x + w / 2 - 50, y - h / 2 - 35, 16 * dim + 0.01, '#e8ecff');
    // the punch clock: a little card goes in and gets stamped OFF DUTY
    const cx = x + w / 2 - 120, cy = y + h / 2 + 110, pk = ease.outBack(prog(t, tClock - 0.15, tClock + 0.25));
    rr(g, cx - 90, cy - 70, 180, 140, 14); g.fillStyle = alpha('#0d1530', 0.95); g.fill(); g.strokeStyle = S().ui.blueprint; g.lineWidth = 3; g.stroke(); FX.clock(g, cx, cy - 10, 44, 23 * 3600 + t * 120, { face: '#d8e4ff' });
    if (pk > 0.01) { g.save(); g.translate(cx - 230, cy - 10); g.rotate(-0.12); g.scale(pk, pk); rr(g, -110, -36, 220, 72, 10); g.strokeStyle = S().ui.accent; g.lineWidth = 5; g.stroke(); text(g, 'OFF DUTY', 0, 2, { size: 40, color: S().ui.accent, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); }
  });
  chip(g, t, { str: 'Cones: off duty', at: tClock + 0.1, x: E.W * 0.4, y: E.H * 0.9, tone: 'coral', dur: info.dur - 0.05 });
} });

// s014 — "That sounds fine, until you walk out of sunshine"  cinema lobby: HERO strolls in from the blazing daylight doorway, camera tracks
registerShot('s014', { draw(g, t, info) {
  const st = info.shot.start, tSun = sw('sunshine', st, 2.3), CX = E.W / 2, V0 = 165;
  const heroX = (u) => CX - 980 + V0 * (u + 0.6);
  const cam = camMove(t, info.dur, { z: [1.2, 1.26], y: [70, 60] }); cam.x = heroX(t) - CX + 300;
  const C = cinema(g, t, cam, { view: 'lobby', screen: 0.3, door: 1 });
  layer(g, cam, 1, (g) => {
    const f = { x: heroX(t), y: C.GY + 30, s: 1.9, facing: 1, t, rim: { color: '#fff1d0', dir: [-1, -0.3] } };
    actor(g, 'HERO', { ...f, pose: walkAlong(f.x, f.s, {}).pose, expr: exprAt(t, [[0, 'smile'], [tSun - 0.5, 'smirk']]), blink: blinkFlag(t, 3.1, 2), look: [1, -0.1] });
    // a pair of sunglasses pushed up on the hood (attitude)
    const hx = f.x + POSES.stand.head[0] * f.s, hy = f.y + (POSES.stand.head[1] - 34) * f.s; rr(g, hx - 30, hy - 8, 26, 14, 6); g.fillStyle = '#0a0a12'; g.fill(); rr(g, hx + 2, hy - 8, 26, 14, 6); g.fill(); seg(g, [[hx - 4, hy - 2], [hx + 2, hy - 2]], 3, '#0a0a12');
  });
  // daylight spilling in from behind (the doorway is off to the left now)
  FX.lightCone(g, -40, E.H * 0.55, { angle: 0, spread: 0.5, len: 1400, color: '#fff3d6', a: 0.16 * (1 - prog(t, tSun, info.dur)) + 0.06 });
  cinemaFg(g, t, cam);
  atmos(g, t, cam, { color: '#fff1d0' });
} });

// s015 — "into a cinema and can't see a thing."  GIANT FACE in the pitch-black hall, only the screen's blue flicker on one side
registerShot('s015', { draw(g, t, info) {
  const st = info.shot.start, tCant = sw("can't", st, 1.3), tThing = sw('thing', st, 1.85);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08] }), fl = 0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 5.3);
  backdrop(g, ['#020308', '#05070f', '#020308']); glow(g, E.W * 0.95, E.H * 0.45, 900, '#5a7aff', 0.16 * fl);
  const f = faceAt(t, [[0, 'neutral'], [tCant, 'squint'], [tThing, 'worried'], [tThing + 0.4, { eye: 1.1, brow: 0.5, tilt: -0.8, smile: -0.4, look: [-0.8, 0], sweat: 0.6 }], [tThing + 0.7, { eye: 1.1, brow: 0.5, tilt: -0.8, smile: -0.4, look: [0.8, -0.1], sweat: 0.6 }]], 0.15);
  layer(g, cam, 1, (g) => giantFace(g, E.W * 0.47, E.H * 0.56, 320, { who: 'HERO', f, rimSide: 1, rimColor: mix('#3a5aaa', '#7fa8ff', fl), blink: blinkAmt(t, 2.8, 4), breath: Math.sin(t * 2.4) }));
  darkness(g, 0.6, { x: E.W * 0.5, y: E.H * 0.52, r: 620 });
  atmos(g, t, cam, { color: '#7fa8ff', far: 18, near: 6 });
} });

// s016 — "Your rods need twenty to thirty minutes to catch up."  blueprint: rods refill with light while a gold dial sweeps 20 -> 30 min
registerShot('s016', { draw(g, t, info) {
  const st = info.shot.start, tTw = sw('twenty', st, 0.95), tTh = sw('thirty', st, 1.4);
  const mins = key(t, [[0.1, 0], [tTw, 20], [tTh + 0.8, 30]], ease.inOut), flood = 0.6 * clamp(mins / 30);
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'DARK ADAPTATION', fig: 'FIG 4 - RODS RECHARGING' });
    BP.retina(g, t, { x: E.W * 0.38, y: E.H * 0.5, w: 960, h: 520, rods: true, cones: false, flood });
    BP.label(g, t, { at: [E.W * 0.38 - 200, E.H * 0.5 - 120], to: [E.W * 0.38 - 200, E.H * 0.5 - 340], str: 'DARK ADAPTATION', start: 0.4 });
    const cx = E.W * 0.8, cy = E.H * 0.47, r = 190, ui = S().ui;
    ring(g, cx, cy, r, 5, alpha(ui.blueprint, 0.9)); for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 - Math.PI / 2, L = i % 5 ? 10 : 22; seg(g, [[cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12)], [cx + Math.cos(a) * (r - 12 - L), cy + Math.sin(a) * (r - 12 - L)]], i % 5 ? 2 : 4, alpha(ui.blueprint, 0.7)); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(ui.gold, 0.22); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r - 36, -Math.PI / 2, -Math.PI / 2 + mins / 60 * Math.PI * 2); g.closePath(); g.fill(); g.restore();
    const band = ease.out(prog(t, tTw, tTh + 0.6)); if (band > 0) { g.strokeStyle = alpha(ui.gold, 0.95); g.lineWidth = 18; g.beginPath(); g.arc(cx, cy, r - 46, -Math.PI / 2 + Math.PI * 2 / 3, -Math.PI / 2 + lerp(20, 30, band) / 60 * Math.PI * 2); g.stroke(); }
    const ha = -Math.PI / 2 + mins / 60 * Math.PI * 2; seg(g, [[cx, cy], [cx + Math.cos(ha) * (r - 50), cy + Math.sin(ha) * (r - 50)]], 7, ui.cream); circle(g, cx, cy, 11, ui.cream);
    text(g, `${Math.round(mins)} MIN`, cx, cy + r + 60, { size: 54, color: ui.gold, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(ui.gold, 0.6) });
  });
  chip(g, t, { str: '20-30 minutes', at: tTw, x: E.W * 0.38, y: E.H * 0.88, tone: 'gold', dur: info.dur - 0.05 });
} });

// s017 — "Your best mate Dev shuffles in, orange beanie on,"  DEV shuffles in from the aisle steps arms out like a zombie, popcorn tub in hand
registerShot('s017', { draw(g, t, info) {
  const st = info.shot.start, tDev = sw('dev', st, 0.7), tBean = sw('beanie', st, 2.4), CX = E.W / 2, V0 = 120;
  const devX = (u) => CX - 560 + V0 * u, cam = camMove(t, info.dur, { z: [1.12, 1.2], y: [80, 70] }); cam.x = devX(t) - CX + 170;
  const C = cinema(g, t, cam, { screen: 0.35 });
  layer(g, cam, 1, (g) => {
    // two seated audience members in the row behind (signature colours)
    actor(g, { top: 'hoodie', color: '#9a5ad6', legs: '#2a2438', head: 'ponytail' }, { x: devX(t) + 430, y: C.GY - 40, s: 1.5, facing: -1, pose: idle(POSES.sit, t, 6), expr: 'neutral', blink: blinkFlag(t, 3.7, 6), rim: C.rim, t, look: [0, -0.3] });
    actor(g, { top: 'tshirt', color: '#3aa05a', legs: '#223a30', head: 'cap', headColor: '#e0e0d0' }, { x: devX(t) - 380, y: C.GY - 40, s: 1.5, facing: 1, pose: idle(POSES.sit, t, 8), expr: 'neutral', blink: blinkFlag(t, 3.2, 8), rim: C.rim, t, look: [0.3, -0.3] });
    const f = { x: devX(t), y: C.GY + 36, s: 1.9, facing: 1 }, wk = walkAlong(f.x, f.s, {}).pose;
    const pose = { ...wk, eF: [26, -150], hF: [56, -158], eB: [22, -148], hB: [50, -154] };   // arms out like a zombie
    actor(g, 'DEV', { ...f, pose, t, rim: C.rim, expr: exprAt(t, [[0, 'confused'], [tBean, 'worried']]), blink: blinkFlag(t, 3.0, 3), look: [Math.sin(t * 1.6) * 0.8, -0.1] });
    const [hx, hy] = handWorld(f, pose, 'hF'); popcorn(g, hx + 10, hy + 30, 1.5, 0.15 + Math.sin(t * 5) * 0.05);
    if (t > tBean - 0.2 && t < tBean + 0.9) glow(g, f.x + 8 * f.s, f.y - 238 * f.s, 90, '#f08a24', 0.35 * Math.sin(prog(t, tBean - 0.2, tBean + 0.9) * Math.PI));
  });
  cinemaFg(g, t, cam);
  atmos(g, t, cam, { color: '#cfe0ff' });
} });

// s018 — "popcorn flying. "Where's row F?""  DEV catches a step, popcorn arcs through the projector beam, he flails, then asks (talks) with a pleading face
registerShot('s018', { draw(g, t, info) {
  const st = info.shot.start, tTrip = 0.2, tWhere = sw("where's", st, 1.55), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.32, 1.4], x: [-180, -150], y: [120, 110] }); const pk = ease.out(prog(t, tTrip, tTrip + 0.12)) * (1 - ease.out(prog(t, tTrip + 0.12, tTrip + 0.5))); cam.z += 0.04 * pk; const sk = shake(t * 3, 10 * pk, 4, 2); cam.x += sk[0]; cam.y += sk[1];
  const C = cinema(g, t, cam, { screen: 0.4 });
  FX.lightCone(g, E.W * 0.55, -80, { angle: Math.PI / 2 + 0.05, spread: 0.18, len: 1300, color: '#cfe0ff', a: 0.12 });      // projector beam overhead
  layer(g, cam, 1, (g) => {
    const f = { x: CX - 200, y: C.GY + 36, s: 1.9, facing: 1 };
    const pose = idle(t < tWhere - 0.2 ? reaction('shock', t, tTrip, 'stand') : poseAt(t, [[tWhere - 0.2, 'handsUp'], [tWhere + 0.4, 'explain']], 0.3), t, 3);
    actor(g, 'DEV', { ...f, pose, t, rim: C.rim, rot: -0.06 * Math.sin(prog(t, tTrip, tTrip + 0.8) * Math.PI), expr: exprAt(t, [[0, 'surprised'], [tTrip + 0.1, 'shocked'], [tWhere - 0.1, 'worried']]), talk: talkAmount(info.globalT, st + tWhere - 0.05, info.shot.end), blink: blinkFlag(t, 2.9, 5), look: t < tWhere ? [0.2, -1] : [1, -0.2] });
    const [hx, hy] = handWorld(f, pose, 'hB'); popcorn(g, hx - 6, hy + 30, 1.5, -0.4);
    // kernels arc up through the beam (lit gold where the beam is), then rain down
    const r = rng(23); for (let i = 0; i < 34; i++) { const u = t - tTrip - r() * 0.25; if (u < 0) continue; const vx = -160 + r() * 520, vy = -620 - r() * 380; const x = hx + vx * u * 0.6, y = hy + vy * u * 0.6 + 520 * u * u * 0.55; if (y > C.GY + 40) continue; const lit = clamp(1 - Math.abs(x - (E.W * 0.55 + cam.x)) / 260); kernel(g, x, y, 7 + r() * 4, lit); }
  });
  cinemaFg(g, t, cam);
  atmos(g, t, cam, { color: '#cfe0ff' });
} });

// s019 — "he groans, and you walk him straight to it."  THERMAL cinema: HERO calmly leads glowing Dev by the sleeve to row F
registerShot('s019', { draw(g, t, info) {
  const st = info.shot.start, tWalk = sw('walk', st, 1.0), CX = E.W / 2, GY = cinemaGround(), rowX = CX + 260;
  const go = ease.inOut(prog(t, tWalk - 0.2, info.dur - 0.1)), hx = lerp(CX - 300, rowX - 60, go), dx = hx - 280;
  const cam = camMove(t, info.dur, { z: [1.15, 1.22], y: [90, 80] }); cam.x = lerp(-260, rowX - CX - 260, go);
  thermalView(g, t, {
    cold: (c) => cinema(c, t, cam, { screen: 0.2 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      const r = rng(5); for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) { const x = CX - 1100 + i * 280 + row * 120 + r() * 40, y = GY - 220 - row * 160; heatBlob(c, x, y, 30, 36, 0.55, 0.6); heatRect(c, x - 26, y + 30, 52, 50, 0.32, 14); }   // audience heads: warm dots
      const walking = t > tWalk - 0.2 && t < info.dur - 0.15;
      heatActor(c, 'HERO', { x: hx, y: GY + 36, s: 1.85, facing: 1, pose: walking ? walkAlong(hx, 1.85, {}).pose : idle(POSES.relaxed, t, 1), t, expr: 'smirk' });
      const dp = walking ? { ...walkAlong(dx, 1.85, {}).pose, eF: [26, -150], hF: [60, -150] } : idle(poseAt(t, [[0, 'reach']]), t, 2);
      heatActor(c, 'DEV', { x: dx, y: GY + 36, s: 1.85, facing: 1, pose: dp, t, expr: 'confused' });
      heatRect(c, rowX - 40, GY - 150, 80, 60, 0.25, 8);                                                                                    // the row F seat end
    }),
    hud: { label: 'THERMAL', temp: '36 C  DEV', track: toScreen(dx + 60, GY - 230, cam) },
  });
  chip(g, t, { str: 'ROW F', at: info.dur - 1.0, x: toScreen(rowX, GY - 300, cam)[0], y: E.H * 0.3, tone: 'gold', dur: info.dur - 0.05 });
} });

// s020 — "A cat needs roughly a sixth of the light you do,"  blueprint: human eye vs cat eye, two light meters; the cat's fills at 1/6
registerShot('s020', { draw(g, t, info) {
  const st = info.shot.start, tSix = sw('sixth', st, 1.3), ui = S().ui, k = ease.out(prog(t, 0.05, 1.0));
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'HUMAN vs CAT', fig: 'FIG 5 - LIGHT NEEDED TO SEE' });
    BP.eye(g, t, { x: E.W * 0.27, y: E.H * 0.42, r: 180, k, rays: false });
    BP.eye(g, t, { x: E.W * 0.68, y: E.H * 0.42, r: 180, k, rays: false });
    // cat eye extras: slit pupil + tapetum glow behind the retina
    g.save(); g.globalAlpha *= k; seg(g, [[E.W * 0.68 - 180 * 0.62, E.H * 0.42 - 70], [E.W * 0.68 - 180 * 0.62, E.H * 0.42 + 70]], 7, ui.cream); glow(g, E.W * 0.68 + 150, E.H * 0.42, 140, '#c8f07a', 0.35 + 0.15 * Math.sin(t * 3)); g.restore();
    text(g, 'YOU', E.W * 0.27, E.H * 0.42 - 250, { size: 40, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 4 }); text(g, 'CAT', E.W * 0.68, E.H * 0.42 - 250, { size: 40, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 4 });
    // light meters: horizontal bars under each eye (light needed). Human = full, cat = one sixth
    const meter = (x, frac, lab) => { const w = 520, y = E.H * 0.72; rr(g, x - w / 2, y, w, 44, 12); g.strokeStyle = alpha(ui.blueprint, 0.9); g.lineWidth = 3; g.stroke(); for (let i = 1; i < 6; i++) seg(g, [[x - w / 2 + w * i / 6, y + 6], [x - w / 2 + w * i / 6, y + 38]], 2, alpha(ui.blueprint, 0.5)); rr(g, x - w / 2 + 4, y + 4, (w - 8) * frac, 36, 9); g.fillStyle = alpha(ui.gold, 0.8); g.fill(); text(g, lab, x, y + 84, { size: 30, color: ui.gold, font: FONTS.ui, weight: 900 }); };
    meter(E.W * 0.27, ease.inOut(prog(t, 0.3, 1.2)), 'LIGHT NEEDED'); meter(E.W * 0.68, ease.inOut(prog(t, tSix - 0.4, tSix + 0.1)) / 6, '1/6');
  });
  chip(g, t, { str: '1/6 of the light', at: tSix, x: E.W * 0.5, y: E.H * 0.86, tone: 'gold', dur: info.dur - 0.05 });
} });

// s021 — "but even a cat is helpless in true darkness."  pitch-black flat: Biscuit pads forward eyes wide, bumps into a sofa cushion on "helpless", sits offended
registerShot('s021', { draw(g, t, info) {
  const st = info.shot.start, tHelp = sw('helpless', st, 1.05), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.7, 1.78], x: [-260, -230], y: [190, 180] }); const pk = ease.out(prog(t, tHelp, tHelp + 0.1)) * (1 - ease.out(prog(t, tHelp + 0.1, tHelp + 0.5))); const sk = shake(t * 3, 8 * pk, 4, 3); cam.x += sk[0]; cam.y += sk[1];
  const A = apartment(g, t, cam, { power: 0, moon: 0.3 }), GY = A.GY, sofaX = A.pos.sofaX;
  const catX = key(t, [[0, sofaX - 360], [tHelp, sofaX - 150], [tHelp + 0.25, sofaX - 170]], ease.inOut), walking = t < tHelp;
  layer(g, cam, 1, (g) => {
    cat(g, { x: catX, y: GY + 10, s: 2.4, facing: 1, pose: walking ? 'stand' : 'sit', walk: walking ? catX / 60 : undefined, eyes: t < tHelp ? 'wide' : t < tHelp + 0.4 ? 'blink' : 'offended', t, rim: { color: '#9fb6ff', dir: [-0.5, -1] } });
    if (t > tHelp && t < tHelp + 0.7) for (let i = 0; i < 3; i++) { const a = t * 7 + i * 2.1; FX.sparkle(g, sofaX - 110 + Math.cos(a) * 34, GY - 120 + Math.sin(a) * 14, 10, '#ffe9b0', 0.7); }
  });
  darkness(g, 0.85, { x: E.W * 0.48, y: E.H * 0.62, r: 760 });
  atmos(g, t, cam, { color: '#9fb6ff', far: 14, near: 5 });
} });
