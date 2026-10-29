// A_s022_s039_rule2.js — batch A (v2): the photon experiment, upside/downside gags, "nothing has to shine", Rule 2, Dr Lin's lab,
// long-wave infrared, warm eyes, the torch gag (s022-s028, s030-s039). (s029 giant face is a showcase shot in S_showcase.js.) Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, talkAmount, alpha, glow, shake, text, FONTS, rr, seg, circle, ring, poly, linGrad, radGrad, shade, mix, backdrop, rng } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { cinema, cinemaFg, cinemaGround } from '../sets/cinema.js';
import { lab, labFg, labGround } from '../sets/lab.js';
import { thermalView, heatActor, heatBlob, heatRect, heatCat } from '../sets/thermal.js';
import { chip, darkness, ruleCard } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, talkGesture, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { HERO } from '../cast.js';

const sw = (w, st, fb, exact = false) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && (exact ? x.word.toLowerCase().replace(/[^\w']/g, '') === m : x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m))); return (hit ? hit.start : st + fb) - st; };
const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
const toScreen = (x, y, cam) => [(x - E.W / 2 - (cam.x || 0)) * cam.z + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * cam.z + E.H / 2];
const bpZoom = (g, t, dur, f) => { const z = 1 + 0.035 * ease.inOut(t / dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2); f(); g.restore(); };
const VOL = { top: 'hoodie', color: '#2f6fd0', legs: '#26304a', head: 'none' };                          // the volunteer: one signature colour (blue hoodie)
function popcorn(g, x, y, s = 1, tip = 0) { g.save(); g.translate(x, y); g.rotate(tip); g.scale(s, s); poly(g, [[-24, -40], [24, -40], [18, 14], [-18, 14]], '#f2ece0'); for (const sx of [-16, 0, 16]) poly(g, [[sx - 4, -40], [sx + 4, -40], [sx * 0.75 + 3, 14], [sx * 0.75 - 3, 14]], '#d8433a'); for (let i = 0; i < 8; i++) circle(g, -21 + i * 6, -44 - (i % 2) * 7, 7.5, '#fff3c4'); g.restore(); }
// Dev's orange beanie for giantFace (faces.js does not draw it yet): ribbed dome + fold-up band + pom
function beanie(g, cx, cy, r, tilt = 0) {
  g.save(); g.translate(cx, cy); g.rotate(tilt); const c = '#f08a24';
  g.fillStyle = shade(c, -0.05); g.beginPath(); g.arc(0, -r * 0.08, r * 1.04, Math.PI * 1.04, Math.PI * 1.96); g.closePath(); g.fill();
  g.strokeStyle = alpha(shade(c, -0.35), 0.6); g.lineWidth = r * 0.03; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * r * 0.2, -r * 0.3); g.quadraticCurveTo(i * r * 0.22, -r * 0.7, i * r * 0.12, -r * 1.05); g.stroke(); }
  rr(g, -r * 1.08, -r * 0.42, r * 2.16, r * 0.3, r * 0.12); g.fillStyle = shade(c, -0.18); g.fill(); g.fillStyle = alpha('#fff', 0.12); g.fillRect(-r * 1.0, -r * 0.4, r * 2.0, r * 0.06);
  circle(g, 0, -r * 1.18, r * 0.2, shade(c, 0.15)); g.restore();
}

// s022 — "And humans aren't hopeless. In a 2016 experiment,"  dim lab: a volunteer (blue hoodie) in a dark booth with chin rest + button; HERO beside the tripod
registerShot('s022', { draw(g, t, info) {
  const st = info.shot.start, tHope = sw('hopeless', st, 1.0), tYear = sw('2016', st, 2.15);
  const cam = camMove(t, info.dur, { z: [1.32, 1.4], x: [-150, -90], y: [110, 100] });
  const L = lab(g, t, cam, { lights: 0.2 }), GY = L.GY, bx = L.CX - 380;
  layer(g, cam, 1, (g) => {
    // the booth: dark panels, chin rest and a big button
    rr(g, bx - 260, GY - 620, 520, 620, 14); g.fillStyle = '#0b0d16'; g.fill(); g.strokeStyle = alpha('#9fc0ff', 0.25); g.lineWidth = 3; g.stroke();
    seg(g, [[bx + 140, GY - 300], [bx + 140, GY - 120]], 8, '#3a3a48'); rr(g, bx + 110, GY - 330, 70, 24, 10); g.fillStyle = '#5a5a6a'; g.fill();   // chin rest
    rr(g, bx - 120, GY - 210, 120, 70, 10); g.fillStyle = '#20202c'; g.fill(); circle(g, bx - 60, GY - 210, 22, '#d4262e'); glow(g, bx - 60, GY - 210, 50, '#ff5a5a', 0.3);   // the button
    glow(g, bx + 190, GY - 360, 160, '#3a4a8a', 0.25);                                                           // the faint test light
    const vp = idle(poseAt(t, [[0, 'sit'], [tHope - 0.15, { ...POSES.sit, eF: [24, -150], hF: [34, -190] }], [tHope + 1.2, 'sit']], 0.25), t, 4);
    actor(g, VOL, { x: bx + 60, y: GY - 10, s: 1.9, facing: 1, pose: vp, expr: exprAt(t, [[0, 'neutral'], [tHope - 0.1, 'happy'], [tHope + 1.2, 'thinking']]), blink: blinkFlag(t, 3.5, 6), look: [1, -0.1], rim: { color: '#9fc0ff', dir: [1, -0.4] }, t });
    if (t > tHope - 0.1 && t < tHope + 1.2) { const [hx, hy] = handWorld({ x: bx + 60, y: GY - 10, s: 1.9, facing: 1 }, vp, 'hF'); seg(g, [[hx, hy], [hx, hy - 24]], 9, S().ink); }   // thumbs-up
    const hp = idle(poseAt(t, [[0, 'crossArms'], [tYear - 0.3, 'think']], 0.35), t, 7);
    actor(g, 'HERO', { x: L.CX + 330, y: GY + 20, s: 1.85, facing: -1, pose: hp, expr: exprAt(t, [[0, 'neutral'], [tYear, 'thinking']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(-1, 0.1), rim: { color: '#9fc0ff', dir: [-1, -0.4] }, t });
  });
  labFg(g, t, cam);
  atmos(g, t, cam, { color: '#9fc0ff' });
  chip(g, t, { str: '2016', at: tYear, x: E.W * 0.5, y: E.H * 0.86, tone: 'gold', dur: info.dur - 0.05 });
} });

// s023 — "volunteers spotted single photons,"  macro on the volunteer's eye: one photon zips in on "single", the pupil twitches, a finger presses the button on "photons"
registerShot('s023', { draw(g, t, info) {
  const st = info.shot.start, tSin = sw('single', st, 0.9), tPh = sw('photons', st, 1.33);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] }); backdrop(g, ['#05060c', '#090b16', '#04050a']);
  layer(g, cam, 1, (g) => {
    const ex = E.W * 0.42, ey = E.H * 0.46, ink = S().ink;
    circle(g, ex + 40, ey + 60, 520, ink);                                                                        // the head fills the frame
    g.save(); g.beginPath(); g.arc(ex + 40, ey + 60, 520, 0, Math.PI * 2); g.clip(); glow(g, ex - 300, ey - 200, 600, '#2a3a6a', 0.35); g.restore();
    const hit = ease.out(prog(t, tSin + 0.25, tSin + 0.35)) * (1 - ease.out(prog(t, tSin + 0.35, tSin + 0.9)));
    g.fillStyle = '#e8e4dc'; g.beginPath(); g.ellipse(ex, ey, 210, 120, 0, 0, Math.PI * 2); g.fill();                            // eye white (lit by nothing but the test light)
    circle(g, ex + 10, ey, 100, '#2f5fa0'); circle(g, ex + 10, ey, lerp(66, 50, hit), '#05050a'); circle(g, ex - 18, ey - 30, 14, '#ffffff');   // iris, pupil twitch
    g.fillStyle = ink; g.beginPath(); g.ellipse(ex, ey - 120, 230, 70, 0, 0, Math.PI * 2); g.fill();                             // heavy upper lid
    seg(g, [[ex - 200, ey - 150], [ex + 190, ey - 170]], 18, '#1a1622');                                                     // brow
    // the single photon: a gold dot with a trail zipping in from the left
    const pk = ease.inOut(prog(t, tSin - 0.2, tSin + 0.3)), px = lerp(-80, ex + 10, pk), py = lerp(ey - 160, ey, pk);
    if (pk > 0 && pk < 1) { for (let i = 1; i <= 8; i++) circle(g, px - i * 26, py - i * 5, 9 - i * 0.9, alpha('#ffd47e', 0.6 - i * 0.07)); glow(g, px, py, 60, '#ffd47e', 0.9); circle(g, px, py, 9, '#fff3c4'); }
    if (hit > 0.01) glow(g, ex + 10, ey, 130, '#ffd47e', 0.6 * hit);
    // finger on the button (lower right)
    const pr = ease.out(prog(t, tPh - 0.08, tPh)) * (1 - ease.out(prog(t, tPh + 0.25, tPh + 0.5)));
    rr(g, E.W * 0.68, E.H * 0.8, 360, 160, 24); g.fillStyle = '#16161e'; g.fill(); circle(g, E.W * 0.68 + 180, E.H * 0.8 + 10, 70, shade('#d4262e', -0.25 * pr)); glow(g, E.W * 0.68 + 180, E.H * 0.8, 120, '#ff5a5a', 0.25 + 0.4 * pr);
    rr(g, E.W * 0.68 + 134, E.H * 0.8 - 306 + pr * 40, 92, 312, 44); g.fillStyle = alpha('#ff9a9a', 0.55); g.fill(); rr(g, E.W * 0.68 + 140, E.H * 0.8 - 300 + pr * 40, 80, 300, 40); g.fillStyle = ink; g.fill();   // finger, rim-lit by the red button rr(g, E.W * 0.68 + 120, E.H * 0.8 - 340 + pr * 40, 140, 150, 50); g.fillStyle = VOL.color; g.fill();
    if (pr > 0.5) text(g, 'CLICK', E.W * 0.68 + 340, E.H * 0.78, { size: 40, color: '#fff3dc', font: FONTS.ui, weight: 900, glow: 12 });
  });
  atmos(g, t, cam, { color: '#ffd47e', far: 14, near: 6 });
} });

// s024 — "the tiniest bits of light, a little better than chance."  blueprint: one photon -> one rod flashes -> signal to the nerve cells; a score bar edges past CHANCE
registerShot('s024', { draw(g, t, info) {
  const st = info.shot.start, tBet = sw('better', st, 1.85), ui = S().ui, x = E.W * 0.38, y = E.H * 0.5, w = 980, h = 540;
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'ONE PHOTON, ONE ROD', fig: 'FIG 6 - SINGLE-PHOTON TEST' });
    BP.retina(g, t, { x, y, w, h, rods: true, cones: false });
    const n = Math.max(8, Math.round(w / 52)), gap = w / (n + 1), rx = x - w / 2 + gap * 7, base = y - h / 2 + h - 44, topR = y - h / 2 + 128;
    const pk = ease.inOut(prog(t, 0.1, 0.8)), px = lerp(rx - 260, rx, pk), py = lerp(y - h / 2 - 120, base - 40, pk);
    if (pk < 1) { glow(g, px, py, 50, '#ffd47e', 0.9); circle(g, px, py, 7, '#fff3c4'); }
    const fl = ease.out(prog(t, 0.8, 0.95)) * (1 - 0.6 * prog(t, 1.4, 2.4)); if (fl > 0) { glow(g, rx, (base + topR) / 2, 120, '#ffd47e', 0.8 * fl); rr(g, rx - 8, topR, 16, base - topR, 8); g.strokeStyle = alpha(ui.gold, fl); g.lineWidth = 4; g.stroke(); }
    const sk = ease.inOut(prog(t, 0.95, 1.7)); if (sk > 0) { const sy = lerp(topR, y - h / 2 + 40, sk); glow(g, rx, sy, 40, '#ffd47e', 0.8); BP.draw(g, [[rx, topR], [rx, y - h / 2 + 40]], sk, { w: 4, color: alpha(ui.gold, 0.8) }); }
    // score bar vs chance
    const bx = E.W * 0.76, by = E.H * 0.24, bh = 520, ch = 0.5, val = lerp(0, 0.6, ease.inOut(prog(t, 0.4, tBet + 0.2)));
    rr(g, bx - 60, by, 120, bh, 16); g.strokeStyle = alpha(ui.blueprint, 0.9); g.lineWidth = 3; g.stroke(); if (bh * val > 24) { rr(g, bx - 52, by + bh - bh * val + 8, 104, bh * val - 16, 10); g.fillStyle = alpha(ui.gold, 0.8); g.fill(); }
    g.save(); g.setLineDash([12, 10]); seg(g, [[bx - 110, by + bh * (1 - ch)], [bx + 110, by + bh * (1 - ch)]], 4, ui.cream); g.restore();
    text(g, 'CHANCE', bx + 120, by + bh * (1 - ch) - 26, { size: 28, color: ui.cream, font: FONTS.ui, weight: 900, align: 'right' }); text(g, 'HITS', bx, by + bh + 44, { size: 30, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3 });
  });
  chip(g, t, { str: 'A little better than chance', at: tBet, x: E.W * 0.38, y: E.H * 0.88, tone: 'gold', dur: info.dur - 0.05 });
} });

// s025 — "Upside, no more stubbed toes."  foot-level insert in the dark flat: the bare foot glides over a table leg and a toy brick and lands softly
registerShot('s025', { draw(g, t, info) {
  const st = info.shot.start, tUp = sw('upside', st, 0.15), tToes = sw('toes', st, 1.7), CX = E.W / 2, GY = apartmentGround();
  const tableX = CX - 120, legX = tableX + 150, brickX = tableX + 520;
  const fx = key(t, [[0, tableX - 480], [tToes, legX + 160], [info.dur, brickX + 330]], ease.inOut);
  // low, foot-level camera sliding with the foot through the real flat (sofa, bookcase, window, plant behind; parallax from the set)
  const cam = { z: 2.15, x: lerp(tableX - CX - 160, brickX - CX - 60, ease.inOut(t / info.dur)) + Math.sin(t * 0.7) * 5, y: GY - E.H / 2 - 150 + Math.cos(t * 0.6) * 4, r: Math.sin(t * 0.5) * 0.004 };
  apartment(g, t, cam, { power: 0, moon: 1.2 });
  layer(g, cam, 1, (g) => {
    // floor clutter (the set's own coffee table is behind): a rug edge, a stray toy brick, a sock, a magazine
    g.fillStyle = alpha('#5a3a5a', 0.55); g.fillRect(tableX - 700, GY - 2, 1100, 8);
    rr(g, brickX, GY - 30, 60, 30, 4); g.fillStyle = '#d4262e'; g.fill(); for (let i = 0; i < 2; i++) { rr(g, brickX + 8 + i * 26, GY - 40, 18, 12, 3); g.fill(); }
    g.save(); g.translate(brickX + 170, GY - 6); g.rotate(0.2); rr(g, -40, -10, 80, 18, 8); g.fillStyle = '#6a7aa0'; g.fill(); g.restore();
    g.save(); g.translate(tableX - 260, GY - 4); g.rotate(-0.08); rr(g, -60, -8, 120, 10, 2); g.fillStyle = '#c9c2d6'; g.fill(); g.restore();
    // the bare foot (ink like the rig, moonlit rim) with the trouser hem, hopping the leg and the brick
    const hop = Math.max(Math.sin(prog(t, 0.35, 1.0) * Math.PI), Math.sin(prog(t, tToes - 0.15, tToes + 0.5) * Math.PI)) * 70;
    g.save(); g.translate(fx, GY - hop); g.scale(0.55, 0.55); rr(g, -220, -170, 130, 190, 54); g.fillStyle = shade(HERO.legs, -0.1); g.fill();
    const foot = () => { g.beginPath(); g.ellipse(-60, -26, 150, 48, 0, 0, Math.PI * 2); for (let i = 0; i < 5; i++) { const tx = 80 - i * 7, ty = -52 + i * 13, tr = 19 - i * 1.8; g.moveTo(tx + tr, ty); g.arc(tx, ty, tr, 0, Math.PI * 2); } };
    g.save(); g.translate(-6, -6); g.scale(1.03, 1.06); foot(); g.fillStyle = alpha('#cfe0ff', 0.75); g.fill(); g.restore(); foot(); g.fillStyle = S().ink; g.fill(); g.restore();
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(fx - 20, GY + 4, 70 * (1 - hop / 140), 8, 0, 0, Math.PI * 2); g.fill();
    if (hop < 6 && t > tToes + 0.3) for (let i = 0; i < 6; i++) circle(g, fx - 40 + (i - 2.5) * 26, GY - 4 - (i % 2) * 4, 3, alpha('#dfe6ff', 0.35));
    FX.pool(g, legX + 200, GY + 4, 420, 40, '#cfe0ff', 0.12);                                                     // moonlight pool on the floor
  });
  // blurred foreground: a sofa cushion corner (left) and plant leaves (right), close to the lens
  blurLayer(g, 10, (g) => {
    rr(g, -80, E.H * 0.62, 420, 520, 90); g.fillStyle = '#3a3050'; g.fill(); g.fillStyle = alpha('#cfe0ff', 0.25); g.fillRect(-80, E.H * 0.62, 420, 8);
    for (let i = 0; i < 5; i++) { g.save(); g.translate(E.W - 60, E.H + 40); g.rotate(-2.2 + i * 0.28 + Math.sin(t * 0.8 + i) * 0.03); g.fillStyle = i % 2 ? '#1f3a2a' : '#284a34'; g.beginPath(); g.ellipse(0, -220, 50, 230, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  }, null, 1);
  atmos(g, t, cam, { color: '#c9d4ff' });
  chip(g, t, { str: 'UPSIDE', at: tUp, x: E.W * 0.3, y: E.H * 0.18, tone: 'blue', dur: info.dur - 0.05 });
} });

// s026 — "Downside, Dev wants to know why you keep staring at him in the dark."  dark cinema row: Dev turns, finds HERO staring with a faint orange glint
registerShot('s026', { draw(g, t, info) {
  const st = info.shot.start, tDown = sw('downside', st, 0.15), tStare = sw('staring', st, 2.33), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.42, 1.5], x: [-200, -160], y: [150, 140] });
  const C = cinema(g, t, cam, { screen: 0.22 });
  layer(g, cam, 1, (g) => {
    const turn = ease.inOut(prog(t, 1.0, 2.0)), chew = t < tStare - 0.2 ? Math.abs(Math.sin(t * 9)) : 0;
    actor(g, 'DEV', { x: CX - 380, y: C.GY - 20, s: 1.9, facing: turn > 0.5 ? 1 : -1, pose: idle({ ...POSES.sit, hF: [30, -120], eF: [18, -104] }, t, 2), expr: exprAt(t, [[0, 'neutral'], [tStare, 'angry'], [tStare + 0.5, 'confused']]), talk: chew * 0.35, blink: blinkFlag(t, 3.0, 3), look: turn > 0.5 ? [1, 0] : [-0.6, -0.4], rim: C.rim, t });
    popcorn(g, CX - 380 + (turn > 0.5 ? 34 : -34) * 1.9, C.GY - 210, 1.6, 0);
    actor(g, 'HERO', { x: CX - 40, y: C.GY - 20, s: 1.9, facing: -1, pose: idle(POSES.sit, t, 5), expr: 'awe', blink: blinkFlag(t, 6.0, 1) && t < 1.0, look: [-1, 0], rim: C.rim, t });
    const hx = CX - 40 - 8 * 1.9, hy = C.GY - 20 - 182 * 1.9; for (const dx of [-12, 12]) glow(g, hx + dx, hy, 22, '#ff9a40', 0.5 + 0.2 * Math.sin(t * 4));      // the faint orange glint in his eyes
  });
  cinemaFg(g, t, cam);
  atmos(g, t, cam, { color: '#cfe0ff' });
  chip(g, t, { str: 'DOWNSIDE', at: tDown, x: E.W * 0.78, y: E.H * 0.2, tone: 'coral', dur: info.dur - 0.05 });
} });

// s027 — "Fair question, honestly."  GIANT FACE DEV in the blue screen flicker: suspicious -> squint, a kernel stuck on the beanie, two orange dots in his pupils
registerShot('s027', { draw(g, t, info) {
  const st = info.shot.start, tHon = sw('honestly', st, 0.85), fl = 0.8 + 0.2 * Math.sin(t * 11) * Math.sin(t * 4.1);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07] });
  backdrop(g, ['#05070f', '#0a0f22', '#04050b']); glow(g, E.W * 0.1, E.H * 0.4, 900, '#5a7aff', 0.18 * fl);
  const f = faceAt(t, [[0, 'suspicious'], [0.6, { ...{ eye: 0.5, brow: -0.1, tilt: 0.55, smile: -0.1, asym: -0.3, w: 0.8, look: [0.8, 0] } }], [tHon, 'squint']], 0.16);
  layer(g, cam, 1, (g) => {
    const cx = E.W * 0.52, cy = E.H * 0.58, r = 320;
    giantFace(g, cx, cy, r, { who: 'DEV', f, rimSide: -1, rimColor: mix('#5a7aff', '#9fc0ff', fl), blink: blinkAmt(t, 3.3, 2), breath: Math.sin(t * 2.2) });
    beanie(g, cx, cy, r, 0); circle(g, cx + r * 0.42, cy - r * 0.62, 18, '#fff3c4'); circle(g, cx + r * 0.42 + 6, cy - r * 0.64, 10, '#ffe39a');   // the stuck kernel
    for (const dx of [-0.32, 0.32]) { glow(g, cx + dx * r + r * 0.06, cy - r * 0.04, 26, '#ff9a40', 0.7); circle(g, cx + dx * r + r * 0.06, cy - r * 0.04, 4, '#ffb070'); }
  });
  atmos(g, t, cam, { color: '#9fc0ff', far: 18, near: 6 });
} });

// s028 — "So how do you see where nothing shines?"  pitch-black flat: HERO's moonlit silhouette studies an open hand, head tilted
registerShot('s028', { draw(g, t, info) {
  const st = info.shot.start, tNoth = sw('nothing', st, 1.27), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.4, 1.5], x: [-80, -40], y: [130, 120] });
  const A = apartment(g, t, cam, { power: 0, moon: 0.6 });
  layer(g, cam, 1, (g) => {
    const pose = idle(poseAt(t, [[0, 'relaxed'], [0.35, { ...POSES.think, hF: [40, -196], eF: [30, -156] }], [tNoth, { ...POSES.think, head: [12, -204], hF: [44, -200], eF: [30, -158] }]], 0.35), t, 3);
    actor(g, 'HERO', { x: CX - 80, y: A.GY + 30, s: 1.9, facing: 1, pose, expr: exprAt(t, [[0, 'neutral'], [tNoth, 'thinking']]), blink: blinkFlag(t, 3.1, 5), look: lookToward(0.7, -0.5), rim: { color: '#cfe0ff', dir: [-0.6, -1] }, t });
  });
  darkness(g, 0.8, { x: E.W * 0.47, y: E.H * 0.45, r: 620 });
  FX.godRays(g, E.W * 0.2, -40, { count: 4, angle: Math.PI / 2 - 0.35, spread: 0.18, len: 1400, color: '#cfe0ff', a: 0.05, t });
  atmos(g, t, cam, { color: '#cfe0ff', far: 24, near: 8 });
} });

// s030 — RULE 2 card "THE DARK ISN'T EMPTY" over the dim flat, faint warm thermal glows breathing behind the banner
registerShot('s030', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-30, 30] });
  ruleCard(g, t, info, { n: 2, title: "THE DARK ISN'T EMPTY", accent: '#ff9a4a', bg: (g, t) => {
    apartment(g, t, cam, { power: 0, moon: 0.5 }); const br = 0.5 + 0.5 * Math.sin(t * 2.2), GY = apartmentGround();
    layer(g, cam, 1, (g) => { glow(g, E.W / 2 - 150, GY - 110, 420, '#ff6a20', 0.12 + 0.1 * br); glow(g, E.W / 2 + 640, GY - 470, 170, '#ffb040', 0.1 + 0.08 * br); });
    apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#ffb070' });
  } });
} });

// s031 — "Anything warmer than absolute zero glows with infrared."  blueprint: thermometer drops to -273 C; everything above it gets a red IR wave
registerShot('s031', { draw(g, t, info) {
  const st = info.shot.start, tAbs = sw('absolute', st, 1.0), tZero = sw('zero', st, 1.4), tIR = sw('infrared', st, 2.47), ui = S().ui;
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'EVERYTHING GLOWS', fig: 'FIG 7 - INFRARED' });
    // thermometer on the left
    const tx = 300, ty0 = 200, ty1 = 820, lvl = key(t, [[0, 0.75], [tZero + 0.1, 0.02]], ease.inOut);
    rr(g, tx - 28, ty0, 56, ty1 - ty0, 28); g.strokeStyle = alpha(ui.blueprint, 0.9); g.lineWidth = 4; g.stroke(); circle(g, tx, ty1 + 30, 48, alpha('#ff5a3a', 0.85)); rr(g, tx - 16, lerp(ty1, ty0 + 10, lvl), 32, (ty1 - ty0 - 10) * lvl + 20, 16); g.fillStyle = alpha('#ff5a3a', 0.85); g.fill();
    const az = ease.outBack(prog(t, tZero - 0.05, tZero + 0.3)); if (az > 0.01) { g.save(); g.translate(tx + 70, ty1 - 20); g.scale(az, az); text(g, 'ABSOLUTE ZERO', 0, -26, { size: 34, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 }); text(g, '-273 C', 0, 22, { size: 48, color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', glow: 12, glowColor: alpha(ui.gold, 0.6) }); g.restore(); }
    // objects above zero all glow: a mug, a rock, a person
    const objs = [[760, 0.6, 'mug'], [1110, 0.35, 'rock'], [1470, 0.9, 'you']], y0 = 720, on = ease.out(prog(t, tIR - 0.9, tIR));
    objs.forEach(([x, warm, kind]) => {
      if (kind === 'mug') { BP.draw(g, [[x - 70, y0 - 160], [x - 60, y0], [x + 60, y0], [x + 70, y0 - 160]], 1, { w: 5, color: ui.blueprint }); BP.draw(g, [[x + 70, y0 - 120], [x + 115, y0 - 110], [x + 112, y0 - 50], [x + 64, y0 - 40]], 1, { w: 5, color: ui.blueprint }); }
      else if (kind === 'rock') BP.draw(g, [[x - 130, y0], [x - 110, y0 - 80], [x - 40, y0 - 120], [x + 60, y0 - 110], [x + 120, y0 - 60], [x + 130, y0]], 1, { w: 5, color: ui.blueprint, close: true });
      else UI.lineFigure(g, { x, y: y0, s: 1.5, pose: POSES.stand, color: ui.blueprint });
      for (let j = 0; j < 4; j++) { const ph = (t * 0.7 + j / 4) % 1, r = 60 + ph * 220; g.save(); g.globalAlpha *= on * (1 - ph) * (0.35 + 0.65 * warm); g.strokeStyle = '#ff6a3a'; g.lineWidth = 4; g.beginPath(); for (let a = -1.2; a <= 1.2; a += 0.05) { const rr2 = r + Math.sin(a * 14 + t * 6) * 8, px = x + Math.sin(a) * rr2, py = y0 - 120 - Math.cos(a) * rr2; a === -1.2 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); g.restore(); }
    });
    BP.label(g, t, { at: [1110, y0 - 260], to: [1110, y0 - 430], str: 'INFRARED', start: tIR });
  });
} });

// s032 — "Your couch, your cat, you."  THERMAL pan: warm cushion on "couch", Biscuit on "cat", HERO brightest on "you"; the crosshair hops to each
registerShot('s032', { draw(g, t, info) {
  const st = info.shot.start, tCouch = sw('couch', st, 0.3), tCat = sw('cat', st, 1.4), tYou = sw('you', st + 1.6, 0.5, true) + 1.6, CX = E.W / 2, GY = apartmentGround();
  const sofaX = CX - 150, catX = CX + 70, heroX = CX + 380;
  const cam = { z: 1.32 + 0.04 * ease.inOut(t / info.dur), x: key(t, [[0, sofaX - CX - 80], [tCat, catX - CX], [tYou, heroX - CX - 60], [info.dur, heroX - CX - 30]], ease.inOut), y: 70 };
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatRect(c, sofaX - 240, GY - 150, 480, 120, 0.3, 26); heatRect(c, sofaX - 60, GY - 170, 160, 60, 0.55, 20); heatBlob(c, sofaX + 20, GY - 140, 150, 50, 0.4, 0.9);   // couch + the warm seat
      heatCat(c, { x: catX, y: GY - 150, s: 2.0, facing: -1, pose: 'loaf', t, heat: 0.62 });                                                                                   // Biscuit curled on the arm
      heatActor(c, 'HERO', { x: heroX, y: GY + 20, s: 1.9, facing: -1, pose: idle(POSES.relaxed, t, 2), t, heat: 0.98 });
    }),
    hud: { label: 'THERMAL', temp: t < tCat ? '24 C  COUCH' : t < tYou ? '38 C  CAT' : '37 C  YOU', track: t < tCat ? toScreen(sofaX, GY - 150, cam) : t < tYou ? toScreen(catX + 20, GY - 210, cam) : toScreen(heroX, GY - 330, cam) },
  });
  const lab2 = (str, at, x, y) => { const p = ease.outBack(prog(t, at, at + 0.3)); if (p <= 0.01) return; const [sx, sy] = toScreen(x, y, cam); g.save(); g.translate(sx, sy); g.scale(p, p); text(g, str, 0, 0, { size: 48, color: '#fff3dc', font: FONTS.ui, weight: 900, spacing: 6, stroke: 10, strokeColor: '#2a0838', glow: 16, glowColor: 'rgba(255,170,80,.9)' }); g.restore(); };
  lab2('COUCH', tCouch, sofaX, GY - 300); lab2('CAT', tCat, catX + 10, GY - 330); lab2('YOU', tYou, heroX, GY - 540);
} });

// s033 — "Dr. Lin, in her green lanyard, kills every light in the lab"  LIN grins at the switch, slaps it on "kills", the strips die one by one
registerShot('s033', { draw(g, t, info) {
  const st = info.shot.start, tLany = sw('lanyard', st, 1.5), tKill = sw('kills', st, 2.0), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.32, 1.38], x: [-330, -290], y: [110, 100] });
  const lights = key(t, [[tKill + 0.05, 1], [tKill + 1.0, 0.03]], ease.inOut);
  const L = lab(g, t, cam, { lights }), GY = L.GY, swX = CX - 640;
  layer(g, cam, 1, (g) => {
    rr(g, swX - 30, GY - 360, 60, 90, 8); g.fillStyle = '#e8e4dc'; g.fill(); rr(g, swX - 11, GY - 342 + (t > tKill ? 30 : 0), 22, 24, 4); g.fillStyle = '#8a8690'; g.fill();
    if (t > tKill && t < tKill + 0.25) FX.sparkle(g, swX, GY - 320, 26, '#ffffff', 0.8);
    const lp = idle(poseAt(t, [[0, 'stand'], [tLany - 0.3, 'holdFront'], [tKill - 0.3, 'reachHigh'], [tKill + 0.05, 'reach'], [tKill + 0.6, 'delight']], 0.22), t, 3);
    const Lo = { x: swX + 170, y: GY + 30, s: 1.9, facing: -1 };
    actor(g, 'LIN', { ...Lo, pose: lp, expr: exprAt(t, [[0, 'smile'], [tKill - 0.3, 'happy'], [tKill + 0.5, 'joy']]), blink: blinkFlag(t, 3.4, 4), look: t < tKill ? lookToward(-1, -0.4) : lookToward(1, -0.6), rim: { color: mix('#7fb0ff', '#e8f0ff', lights), dir: [-1, -0.4] }, t });
    if (t > tLany - 0.2 && t < tLany + 0.9) glow(g, Lo.x - 4 * 1.9, GY + 30 - 160 * 1.9, 60, '#2fb85a', 0.55 * Math.sin(prog(t, tLany - 0.2, tLany + 0.9) * Math.PI));
    actor(g, 'HERO', { x: CX + 230, y: GY + 30, s: 1.85, facing: -1, pose: idle(poseAt(t, [[0, 'relaxed'], [tKill + 0.4, 'lookUp']], 0.3), t, 5), expr: exprAt(t, [[0, 'neutral'], [tKill + 0.4, 'surprised'], [tKill + 1.2, 'smirk']]), blink: blinkFlag(t, 3.1, 1), look: t > tKill + 0.3 ? lookToward(-0.2, -1) : lookToward(-1, 0), rim: { color: '#7fb0ff', dir: [-1, -0.4] }, t });
  });
  labFg(g, t, cam);
  atmos(g, t, cam, { color: '#cfe0ff' });
} });

// s034 — "and tells you to hold up a hand. You count five warm fingers."  THERMAL hand: fingers counted 1-5 in gold, big gold 5 on "five"
registerShot('s034', { draw(g, t, info) {
  const st = info.shot.start, tHand = sw('hand', st, 1.4), tCount = sw('count', st, 2.45), tFive = sw('five', st, 2.69);
  const rise = ease.out(prog(t, 0.2, Math.max(0.8, tHand))), hx = E.W * 0.5 + Math.sin(t * 1.1) * 12, hy = E.H * 0.6 + (1 - rise) * 560, z = 1 + 0.06 * ease.inOut(t / info.dur);
  const fing = [[-150, -200, -0.32], [-75, -270, -0.12], [0, -290, 0], [75, -265, 0.12], [150, -210, 0.75]];
  thermalView(g, t, {
    cold: (c) => lab(c, t, { z: 2.0, x: -200, y: -80 }, { lights: 0 }),
    hot: (c) => { c.save(); c.translate(E.W / 2, E.H / 2); c.scale(z, z); c.translate(-E.W / 2, -E.H / 2);
      heatRect(c, hx - 110, hy + 130, 220, 420, 0.6, 40);                               // hoodie sleeve (clothes ~0.6)
      heatRect(c, hx - 125, hy - 125, 250, 280, 0.9, 70);                                // palm (skin ~0.9)
      fing.forEach(([fx, fy, a], i) => { c.save(); c.translate(hx + fx, hy + (i === 4 ? 0 : -80)); c.rotate(a); heatRect(c, -30, fy * 0.62, 60, -fy * 0.62 + 20, 0.93, 30); c.restore(); });
      heatBlob(c, hx, hy - 80, 320, 340, 0.25, 0.9); c.restore(); },
    hud: { label: 'THERMAL', temp: '34 C  HAND', track: [(hx - E.W / 2) * z + E.W / 2, (hy - E.H / 2) * z + E.H / 2] },
  });
  fing.forEach(([fx, fy, a], i) => { const at = i < 4 ? lerp(tCount - 0.5, tFive - 0.1, i / 4) : tFive, p = ease.outBack(prog(t, at, at + 0.3)); if (p <= 0.01) return;
    const ty = fy * 0.62, bx = hx + fx, by = hy + (i === 4 ? 0 : -80), wx = bx - ty * Math.sin(a), wy = by + ty * Math.cos(a), sx = (wx - E.W / 2) * z + E.W / 2, sy = (wy - E.H / 2) * z + E.H / 2 - 50;
    g.save(); g.translate(sx, sy); g.scale(p, p); text(g, String(i + 1), 0, 0, { size: 64, color: S().ui.gold, font: FONTS.title, weight: 700, stroke: 10, strokeColor: '#2a0838', glow: 18, glowColor: 'rgba(255,170,80,.9)' }); g.restore(); });
  const big = ease.outBack(prog(t, tFive + 0.1, tFive + 0.45)); if (big > 0.01) { g.save(); g.translate(E.W * 0.18, E.H * 0.45); g.scale(big, big); text(g, '5', 0, 0, { size: 260, color: S().ui.gold, font: FONTS.title, weight: 700, stroke: 16, strokeColor: '#2a0838', glow: 40, glowColor: 'rgba(255,170,80,.9)' }); g.restore(); }
} });

// s035 — ""Not magic," she whispers, thrilled. "Physics.""  dark lab lit from below by the orange thermal monitor: Lin whispers, finger to lips, then beams "Physics!"
registerShot('s035', { draw(g, t, info) {
  const st = info.shot.start, tNot = sw('not', st, 0.15), tPhy = sw('physics', st, 2.6), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.42, 1.5], x: [-210, -180], y: [120, 110] }); const pk = ease.out(prog(t, tPhy, tPhy + 0.1)) * (1 - ease.out(prog(t, tPhy + 0.1, tPhy + 0.45))); cam.z += 0.04 * pk;
  const L = lab(g, t, cam, { lights: 0.02 }), GY = L.GY;
  layer(g, cam, 1, (g) => {
    glow(g, CX - 230, GY - 60, 520, '#ff7a30', 0.32 + 0.05 * Math.sin(t * 7));                                          // monitor glow from below
    const pose = t < tPhy - 0.1 ? idle({ ...POSES.talk, eF: [22, -170], hF: [10, -214], head: [10, -204] }, t, 2) : idle(reaction('delight', t, tPhy, 'stand'), t, 2);
    const talk = talkAmount(info.globalT, st + tNot - 0.05, st + tNot + 0.8) * 0.5 + talkAmount(info.globalT, st + tPhy - 0.05, info.shot.end);
    actor(g, 'LIN', { x: CX - 340, y: GY + 60, s: 2.1, facing: 1, pose, expr: exprAt(t, [[0, 'smile'], [tPhy - 0.05, 'joy']]), talk: clamp(talk), blink: blinkFlag(t, 3.2, 4), look: lookToward(1, 0.1), rim: { color: '#ff9a50', dir: [0.3, 1] }, t });
    actor(g, 'HERO', { x: CX + 140, y: GY + 60, s: 2.0, facing: -1, pose: idle(poseAt(t, [[0, { ...POSES.stand, head: [14, -202] }], [tPhy, 'stand']], 0.3), t, 7), expr: exprAt(t, [[0, 'thinking'], [tPhy + 0.1, 'happy']]), blink: blinkFlag(t, 3.6, 2), look: lookToward(-1, 0), rim: { color: '#ff9a50', dir: [-0.3, 1] }, t });
    if (t < tPhy) for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; text(g, '~', CX - 230 + ph * 120, GY - 470 - ph * 30, { size: 40, color: alpha('#ffd8b0', 0.6 * (1 - ph)), font: FONTS.ui, weight: 900 }); }
    if (t > tPhy) for (let i = 0; i < 4; i++) { const ph = (t * 1.2 + i * 0.25) % 1; FX.sparkle(g, CX - 340 + (i - 1.5) * 90, GY - 520 - ph * 40, 18 * Math.sin(ph * Math.PI), '#ffd8a0', 0.9); }
  });
  labFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffb070' });
} });

// s036 — "Human skin glows most strongly near nine and a half micrometres,"  blueprint: skin curve peaks at 9.5 um (gold label on "nine")
registerShot('s036', { draw(g, t, info) {
  const st = info.shot.start, tNine = sw('nine', st, 1.8);
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'WHAT SKIN GIVES OFF', fig: 'FIG 8 - EMISSION SPECTRUM' });
    BP.wavelength(g, t, { x: 300, y: 210, w: 1240, h: 560, k: ease.inOut(prog(t, 0.15, Math.max(1.0, tNine))), peak: 9.5 });
    UI.lineFigure(g, { x: 1700, y: 780, s: 1.2, pose: POSES.stand, color: alpha(S().ui.blueprint, 0.85) });
    BP.label(g, t, { at: [300 + 9.5 / 20 * 1240, 250], to: [300 + 9.5 / 20 * 1240 + 260, 140], str: '9.5 micrometres', start: tNine });
  });
} });

// s037 — "and thermal cameras read exactly that."  the lab tripod camera: its monitor shows Dr Lin waving in thermal; the reticle locks on "exactly"
const MON = { c: null };
registerShot('s037', { draw(g, t, info) {
  const st = info.shot.start, tEx = sw('exactly', st, 1.37), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.85, 1.95], x: [440, 470], y: [60, 50] });
  // the real scene behind (soft): Lin waving at the camera in the dark lab
  blurLayer(g, 6, (g) => { const L = lab(g, t, cam, { lights: 0.03 }); layer(g, cam, 1, (g) => actor(g, 'LIN', { x: L.CX + 760, y: L.GY + 30, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'wave'], [0.4, 'wave']]), t, 4), expr: 'happy', blink: blinkFlag(t, 3.0, 2), rim: { color: '#7fb0ff', dir: [-1, -0.3] }, t })); }, null, 1);
  // the camera's monitor: a real thermal image of Lin waving, rendered off-screen and drawn into the screen
  const mw = 760, mh = 428, mx = E.W * 0.32, my = E.H * 0.42;
  if (!MON.c) { MON.c = document.createElement('canvas'); MON.c.width = 960; MON.c.height = 540; }
  const mc = MON.c.getContext('2d'); mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, 960, 540); mc.scale(960 / E.W, 540 / E.H);
  const tc = { z: 1.5, x: 300, y: 80 }, wave = Math.sin(t * 7) * 0.5;
  thermalView(mc, t, { res: 0.4, cold: (c) => lab(c, t, tc, { lights: 0.03 }), hot: (c) => layer(c, tc, 1, (c) => heatActor(c, 'LIN', { x: E.W / 2 + 300, y: labGround() + 30, s: 1.9, facing: -1, pose: { ...POSES.wave, hF: [36 + wave * 20, -236], eF: [28, -196] }, t })), hud: { label: 'LWIR', temp: t > tEx ? '35 C  LOCK' : '35 C', track: [E.W / 2 + 30, E.H * 0.42] } });
  g.save(); rr(g, mx - mw / 2 - 26, my - mh / 2 - 26, mw + 52, mh + 52, 26); g.fillStyle = '#20202a'; g.fill(); g.strokeStyle = alpha('#9fc0ff', 0.35); g.lineWidth = 3; g.stroke();
  rr(g, mx - mw / 2, my - mh / 2, mw, mh, 10); g.clip(); g.drawImage(MON.c, mx - mw / 2, my - mh / 2, mw, mh); g.restore();
  seg(g, [[mx, my + mh / 2 + 26], [mx - 180, E.H + 40]], 16, '#1a1a24'); seg(g, [[mx, my + mh / 2 + 26], [mx + 180, E.H + 40]], 16, '#1a1a24'); seg(g, [[mx, my + mh / 2 + 26], [mx, E.H + 40]], 16, '#1a1a24');
  const lk = ease.outBack(prog(t, tEx - 0.1, tEx + 0.25)); if (lk > 0.01) { g.save(); g.translate(mx + 20, my - 10); g.scale(1.6 - 0.6 * lk, 1.6 - 0.6 * lk); g.strokeStyle = alpha(S().ui.gold, clamp(lk)); g.lineWidth = 4; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.beginPath(); g.moveTo(sx * 70, sy * 40); g.lineTo(sx * 70, sy * 70); g.lineTo(sx * 40, sy * 70); g.stroke(); } g.restore(); }
  glow(g, mx, my, 520, '#ff7a30', 0.12);
  atmos(g, t, cam, { color: '#ffb070', far: 18, near: 6 });
} });

// s038 — "Your eyes can't, and one reason is that they're warm too."  blueprint eye glows warm; incoming IR rays get lost in its own glow
registerShot('s038', { draw(g, t, info) {
  const st = info.shot.start, tCant = sw("can't", st, 0.5), tWarm = sw('warm', st, 2.29), ui = S().ui;
  bpZoom(g, t, info.dur, () => {
    BP.board(g, t, { title: 'WHY YOUR EYES CANNOT', fig: 'FIG 9 - A WARM EYE' });
    const gk = ease.inOut(prog(t, tWarm - 1.3, tWarm + 0.3)), ex = E.W * 0.48, ey = E.H * 0.5, r = 280;
    const A = BP.eye(g, t, { x: ex, y: ey, r, k: 1, rays: false, glowK: gk });
    const rk = ease.out(prog(t, tCant - 0.4, tCant + 0.4)); for (let i = -2; i <= 2; i++) { const ph = (t * 0.55 + i * 0.17) % 1, x0 = ex - r * 2.4 + ph * r * 1.1, y = ey + i * 46; seg(g, [[x0, y], [x0 + 150, y + Math.sin(t * 6 + i) * 6]], 4, alpha('#ff7a3a', 0.75 * rk * (1 - ph * (0.4 + 0.6 * gk)))); }
    BP.label(g, t, { at: A.retina, to: [A.retina[0] + 160, A.retina[1] - 200], str: 'RETINA', start: 0.3 });
    text(g, '37 C', ex + 60, ey + 30, { size: 56, color: alpha('#ffb070', gk), font: FONTS.ui, weight: 900, glow: 20, glowColor: 'rgba(255,120,40,.8)' });
  });
  chip(g, t, { str: 'Your eyes glow too', at: tWarm, x: E.W * 0.5, y: E.H * 0.88, tone: 'coral', dur: info.dur - 0.05 });
} });

// s039 — "It's like reading a dim screen with a torch in your face."  gag two-shot: HERO squints at a dim phone, Dev (grinning) shines a torch in his face; wince on "face"
registerShot('s039', { draw(g, t, info) {
  const st = info.shot.start, tTorch = sw('torch', st, 1.75), tFace = sw('face', st, 2.25), CX = E.W / 2;
  const cam = camMove(t, info.dur, { z: [1.45, 1.52], x: [-120, -90], y: [140, 130] });
  const A = apartment(g, t, cam, { power: 0, moon: 0.6 }), GY = A.GY;
  const on = ease.out(prog(t, tTorch - 0.25, tTorch + 0.05));
  layer(g, cam, 1, (g) => {
    const H = { x: CX - 250, y: GY + 30, s: 1.9, facing: 1 }, hp = idle(t < tFace ? POSES.phone : reaction('wince', t, tFace, 'phone'), t, 3);
    actor(g, 'HERO', { ...H, pose: hp, expr: exprAt(t, [[0, 'thinking'], [tTorch, 'worried'], [tFace, 'angry']]), blink: on > 0.5 && (t % 0.5) < 0.2, look: [0.5, 0.5], rim: { color: mix('#9fb6ff', '#fff6dc', on), dir: [1, -0.2] }, t });
    const [px, py] = handWorld(H, hp, 'hF'); rr(g, px - 10, py - 30, 34, 54, 7); g.fillStyle = '#0c0c14'; g.fill(); rr(g, px - 6, py - 26, 26, 46, 4); g.fillStyle = alpha('#9fc0ff', 0.3 * (1 - on * 0.8)); g.fill();   // the dim phone
    const D = { x: CX + 300, y: GY + 30, s: 1.9, facing: -1 }, dp = idle(poseAt(t, [[0, 'relaxed'], [tTorch - 0.4, 'point']], 0.25), t, 6);
    actor(g, 'DEV', { ...D, pose: dp, expr: exprAt(t, [[0, 'neutral'], [tTorch - 0.2, 'happy']]), blink: blinkFlag(t, 3.4, 4), look: lookToward(-1, -0.1), rim: { color: '#9fb6ff', dir: [-1, -0.3] }, t });
    const [tx, ty] = handWorld(D, dp, 'hF'); rr(g, tx - 30, ty - 12, 60, 24, 8); g.fillStyle = '#3a3a48'; g.fill();
    if (on > 0) { FX.lightCone(g, tx - 30, ty, { angle: Math.PI + 0.18, spread: 0.24, len: 760, color: '#fff6dc', a: 0.45 * on }); glow(g, tx - 30, ty, 130, '#ffffff', 0.85 * on); }
  });
  apartmentFg(g, t, cam);
  veil(g, '#fff6e0', 0.16 * on * (0.85 + 0.15 * Math.sin(t * 20)), 'lighter');
  atmos(g, t, cam, { color: '#fff6dc' });
} });
