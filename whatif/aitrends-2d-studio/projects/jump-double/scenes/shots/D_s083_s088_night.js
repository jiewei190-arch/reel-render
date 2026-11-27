// D_s083_s088_night.js — batch D: that night. MINA can't sleep, sits on the end of the bed, asks "What happens when it doesn't stop?";
// HERO has no answer, does the maths instead; the notebook: doubling table, DAY 25 circled, 'escape?'.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, poly, linGrad, radGrad, text, FONTS, talkAmount } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { giantFace, faceAt, FACE } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { shotWord, notebook, NOTE_ROWS } from './D_lib.js';

const MOON = { color: '#a9c4ff', dir: [-0.8, -0.5] };
// ---- the bed (local prop): headboard on the left, mattress, pillow, blanket with a body lump; a bedside table with DEV's helmet ----
const BED = { x0: -560, x1: 360, top: -118 };                       // relative to CX / GY
function bedBack(g, CX, GY) { const x0 = CX + BED.x0, x1 = CX + BED.x1, top = GY + BED.top;
  rr(g, x0 - 40, top - 170, 46, 230, 12); g.fillStyle = '#2a2238'; g.fill(); rr(g, x0 - 30, top - 160, 26, 210, 8); g.fillStyle = '#3a3050'; g.fill();          // headboard
  g.fillStyle = '#231c2e'; g.fillRect(x0, top + 30, x1 - x0, 90); g.fillStyle = '#d8d4e8'; rr(g, x0, top, x1 - x0, 44, 14); g.fill();                        // frame + sheet
  rr(g, x0 + 14, top - 34, 170, 46, 20); g.fillStyle = '#eceaf6'; g.fill();                                                                                    // pillow
  for (const lx of [x0 + 10, x1 - 30]) { g.fillStyle = '#1a1424'; g.fillRect(lx, top + 110, 20, 10); } }
function blanket(g, CX, GY, from, t, lump = 1) { const x1 = CX + BED.x1 + 14, top = GY + BED.top, br = Math.sin(t * 1.3) * 3;
  g.fillStyle = linGrad(g, 0, top - 60, 0, top + 60, ['#5a62a8', '#3a3f78']); g.beginPath(); g.moveTo(from, top + 50); g.lineTo(from, top - 20 - 30 * lump - br); g.quadraticCurveTo(from + 160, top - 62 * lump - br, from + 320, top - 40 * lump); g.quadraticCurveTo(x1 - 120, top - 34 * lump, x1, top - 6); g.lineTo(x1 + 6, top + 60); g.closePath(); g.fill();
  g.strokeStyle = alpha('#8a92d8', 0.5); g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(from + 120 + i * 180, top - 30 * lump); g.quadraticCurveTo(from + 180 + i * 180, top + 10, from + 160 + i * 180, top + 46); g.stroke(); } }
function bedside(g, CX, GY) { const x = CX + BED.x0 - 190, y = GY; rr(g, x - 70, y - 150, 140, 150, 8); g.fillStyle = '#2e2438'; g.fill(); g.fillStyle = '#3a2e46'; g.fillRect(x - 76, y - 156, 152, 14);
  g.save(); g.translate(x - 10, y - 156); g.scale(1.6, 1.6); g.fillStyle = '#f4f1e8'; g.beginPath(); g.arc(0, 0, 31, Math.PI, 0); g.closePath(); g.fill(); seg(g, [[-31, -1], [31, -1]], 4, '#2a2632'); text(g, 'DEV', 0, -14, { size: 14, color: '#f08a24', font: FONTS.title, weight: 700 }); g.restore();
  seg(g, [[x + 46, y - 156], [x + 46, y - 230]], 4, '#4a3a50'); poly(g, [[x + 22, y - 262], [x + 70, y - 262], [x + 60, y - 230], [x + 32, y - 230]], '#6a5470'); }
// HERO lying on his back (rot -90 deg: head to the left on the pillow), `prop` 0..1 props him up on an elbow
function heroInBed(g, CX, GY, t, o = {}) { const s = 1.9, top = GY + BED.top, p = o.prop ?? 0, pose = idle({ ...POSES.lie, eF: [24, -150], hF: [36, -118] }, t * 0.6, 7);
  g.save(); g.beginPath(); g.rect(CX - E.W * 2, -E.H * 3, E.W * 4, top + 30 + E.H * 3); g.clip();   // legs under the mattress line stay hidden
  actor(g, 'HERO', { x: CX + BED.x0 + 200 + 100 * s, y: top + 4 + 100 * s, s, facing: 1, pose, rot: -Math.PI / 2 + 0.75 * ease.inOut(p), shadow: false, t, rim: MOON, expr: o.expr, blink: o.blink, look: o.look }); g.restore(); }

// s083 — "That night, Mina can't sleep."  bedroom establishing, moonlight; HERO asleep; MINA peeks in at the door
registerShot('s083', { draw(g, t, info) {
  const st = info.shot.start, tSleep = shotWord('sleep', st, 1.39);
  const cam = camMove(t, info.dur, { z: [1.08, 1.12], x: [-330, -310], y: [40, 40] });
  const A = apartment(g, t, cam, { mood: 'night', power: 0.15 }), GY = A.GY, CX = A.CX;
  layer(g, cam, 1, (g) => {
    FX.pool(g, CX - 100, GY + BED.top, 520, 90, '#a9c4ff', 0.25);
    bedside(g, CX, GY); bedBack(g, CX, GY);
    heroInBed(g, CX, GY, t, { expr: 'sleepy', blink: true });
    blanket(g, CX, GY, CX + BED.x0 + 240, t);
    const mx = A.pos.doorX + 120, peek = ease.out(prog(t, 0.1, 0.7));
    actor(g, 'MINA', { x: mx - 60 * (1 - peek), y: GY + 16, s: 2.05, facing: 1, pose: idle({ ...EXTRA.sheepish, hF: [10, -176] }, t, 3), t, rim: MOON, expr: exprAt(t, [[0, 'sleepy'], [tSleep - 0.2, 'worried']]), blink: blinkFlag(t, 2.8, 3), look: lookToward(1, 0.2) });
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#c9d4ff', far: 18, near: 5 });
} });

// s084 — "She sits on the end of your bed and asks the question nobody else will."  MINA pads in and sits; HERO props up on an elbow
registerShot('s084', { draw(g, t, info) {
  const st = info.shot.start, tBed = shotWord('bed', st, 1.31), tAsk = shotWord('asks', st, 1.75), tNob = shotWord('nobody', st, 2.69);
  const cam = camMove(t, info.dur, { z: [1.5, 1.58], x: [-90, -60], y: [110, 116] });
  const A = apartment(g, t, cam, { mood: 'night', power: 0.15 }), GY = A.GY, CX = A.CX;
  layer(g, cam, 1, (g) => {
    FX.pool(g, CX - 100, GY + BED.top, 520, 90, '#a9c4ff', 0.25);
    bedside(g, CX, GY); bedBack(g, CX, GY);
    const prop = ease.inOut(prog(t, tAsk - 0.4, tAsk + 0.5));
    heroInBed(g, CX, GY, t, { prop, expr: exprAt(t, [[0, 'sleepy'], [tAsk - 0.3, 'neutral'], [tNob, 'worried']]), blink: blinkFlag(t, 3.6, 2), look: lookToward(1, 0.3) });
    blanket(g, CX, GY, CX + BED.x0 + 240, t, 1 - 0.3 * prop);
    const sEnd = CX + BED.x1 - 110, wx = lerp(CX - 120, sEnd, ease.inOut(prog(t, 0, tBed - 0.1))), sit = ease.inOut(prog(t, tBed - 0.15, tBed + 0.35)), s = 2.05, k = s * 0.72;
    const walk = walkAlong(wx, s, { kid: true, facing: 1 }).pose, seatY = GY + BED.top + 6 + 72 * k;
    const pose = sit > 0 ? idle(blendPose(walk, { ...POSES.sit, head: [8, -178], hF: [30, -92] }, sit), t, 4) : walk;
    actor(g, 'MINA', { x: wx, y: lerp(GY + 16, seatY, sit), s, facing: sit > 0.5 ? -1 : 1, pose, t, rim: MOON, expr: exprAt(t, [[0, 'sleepy'], [tAsk, 'worried']]), blink: blinkFlag(t, 2.8, 3), look: sit > 0.5 ? lookToward(1, -0.2) : lookToward(1, 0) });
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#c9d4ff', far: 18, near: 5 });
} });

// s085 — GIANT FACE MINA: "What happens when it doesn't stop?"  lip-synced, worried -> sad, moonlit eyes glistening, a tear
registerShot('s085', { draw(g, t, info) {
  const st = info.shot.start, tWhat = shotWord('what', st, 0.15), tStop = shotWord('stop', st, 1.37);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] });
  blurLayer(g, 16, (g) => apartment(g, t, { z: 1.3, x: -300, y: 40 }, { mood: 'night', power: 0.1 }), null, 1); veil(g, '#0a0c1e', 0.35);
  const sad = { ...FACE.worried, eye: 1.15, smile: -0.75, tilt: -1, brow: 0.7 };
  const f0 = faceAt(t, [[0, 'worried'], [tWhat + 0.5, { ...FACE.worried, tilt: -1.1 }], [tStop, sad]], 0.25), talk = talkAmount(info.globalT, st + tWhat - 0.05, st + tStop + 0.3), f = talk > 0 ? { ...f0, open: 0.08 + 0.55 * talk } : f0;
  const cx = E.W * 0.5, cy = E.H * 0.56, r = 320, tilt = lerp(-0.02, 0.06, ease.inOut(t / info.dur));
  glow(g, E.W * 0.1, E.H * 0.1, 900, '#a9c4ff', 0.18);
  giantFace(g, cx, cy, r, { who: 'MINA', f, rimSide: -1, rimColor: '#a9c4ff', glint: '#e8f0ff', blink: blinkAmt(t, 2.6, 4), breath: Math.sin(t * 1.5), tilt });
  const tear = prog(t, tStop + 0.1, info.dur); if (tear > 0) { g.save(); g.translate(cx, cy); g.rotate(tilt); const ty = lerp(r * 0.14, r * 0.5, ease.in(tear)); g.fillStyle = alpha('#bfe0ff', 0.9); g.beginPath(); g.moveTo(-r * 0.4, ty - r * 0.07); g.quadraticCurveTo(-r * 0.36, ty, -r * 0.4, ty + r * 0.04); g.quadraticCurveTo(-r * 0.44, ty, -r * 0.4, ty - r * 0.07); g.fill(); g.restore(); }
  atmos(g, t, cam, { color: '#c9d4ff', far: 10, near: 3 });
} });

// s086 — GIANT FACE HERO: "You don't have an answer. You do the maths instead."  worried -> suspicious -> determined on 'maths';
// his hand slides in at the bottom for the notebook and the lamp clicks on (cool moon rim -> warm key)
registerShot('s086', { draw(g, t, info) {
  const st = info.shot.start, tAns = shotWord('answer', st, 0.89), tMaths = shotWord('maths', st, 1.97), lamp = t >= tMaths ? 1 : 0, lk = ease.out(prog(t, tMaths, tMaths + 0.25));
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] });
  blurLayer(g, 16, (g) => apartment(g, t, { z: 1.3, x: -300, y: 40 }, { mood: 'night', power: 0.1 + 0.7 * lk }), null, 1); veil(g, '#0a0c1e', 0.35 - 0.2 * lk);
  const cx = E.W * 0.46, cy = E.H * 0.52, r = 310;
  const f = faceAt(t, [[0, 'worried'], [tAns, 'suspicious'], [tMaths, 'determined']], 0.2);
  if (lk > 0) glow(g, E.W * 0.95, E.H * 0.85, 1000, '#ffc070', 0.45 * lk);
  giantFace(g, cx, cy, r, { who: 'HERO', f, rimSide: lamp ? 1 : -1, rimColor: lamp ? '#ffcf8a' : '#a9c4ff', glint: lamp ? '#ffe0b0' : '#dfe8ff', blink: blinkAmt(t, 3.3, 6), breath: Math.sin(t * 1.4), tilt: lerp(0, 0.04, prog(t, tAns, tMaths)), look: [0.5, 0.4] });
  // the notebook corner + his hand sliding in from the bottom right
  const hk = ease.out(prog(t, tMaths - 0.5, tMaths + 0.2)); g.save(); g.translate(E.W * 0.8, E.H * 1.04 - 120 * hk); g.rotate(-0.12); rr(g, -220, -90, 440, 300, 10); g.fillStyle = '#efe4cc'; g.fill(); for (let i = 0; i < 4; i++) seg(g, [[-200, -50 + i * 44], [200, -50 + i * 44]], 2, alpha('#8aa8d8', 0.5)); text(g, 'DAY 1  0.5 m', -150, -60, { size: 34, color: '#4a4650', font: FONTS.title, weight: 600, align: 'left' }); g.restore();
  const hx = lerp(E.W * 0.98, E.W * 0.76, hk), hy = lerp(E.H * 1.15, E.H * 0.9, hk); seg(g, [[E.W * 1.05, E.H * 1.2], [hx, hy]], 46, S().ink); circle(g, hx, hy, 30, S().ink); seg(g, [[E.W * 1.05, E.H * 1.2], [lerp(E.W * 1.0, E.W * 0.85, hk), E.H * 1.1]], 60, '#E1AD01');
  if (lk > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#ffb060', 0.12 * (1 - prog(t, tMaths, tMaths + 0.12))); g.fillRect(0, 0, E.W, E.H); g.restore(); }
  atmos(g, t, cam, { color: lamp ? '#ffd8b0' : '#c9d4ff', far: 10, near: 3 });
} });

// pencil (local prop): tip at (x, y)
function pencil(g, x, y, a = -0.7) { g.save(); g.translate(x, y); g.rotate(a); poly(g, [[0, 0], [26, -9], [26, 9]], '#e8c89a'); poly(g, [[0, 0], [9, -3], [9, 3]], '#2a2630'); rr(g, 26, -10, 320, 20, 4); g.fillStyle = '#f2c230'; g.fill(); g.fillStyle = '#d8a820'; g.fillRect(26, 2, 320, 8); rr(g, 346, -11, 40, 22, 4); g.fillStyle = '#e08aa8'; g.fill(); g.restore(); }

// s087 — NOTEBOOK INSERT: "And the maths says there's a day when you go up,"  the doubling table writes itself on, a gold arrow down the page
registerShot('s087', { draw(g, t, info) {
  const st = info.shot.start, reveal = prog(t, 0.05, info.dur - 0.25), z = lerp(1.0, 1.05, ease.inOut(t / info.dur));
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.rotate(-0.03 + 0.01 * Math.sin(t * 0.6)); g.translate(-E.W / 2, -E.H / 2 + 40);
  const N = notebook(g, t, { reveal, lamp: 1 });
  const n = NOTE_ROWS.length, i = Math.min(n - 1, Math.floor(reveal * n)), fr = clamp(reveal * n - i), wob = Math.sin(t * 30) * 3;
  if (reveal < 1) pencil(g, N.x0 + 210 + 600 * fr + wob, N.rows[i] + 18 + Math.cos(t * 26) * 4);
  g.restore();
  atmos(g, t, { z: 1 }, { color: '#ffd8b0', far: 14, near: 4 });
} });

// s088 — "and gravity can't bring you back."  slow push into DAY 25; the pencil circles it in gold on 'gravity', 'escape?' underneath; lamp flickers; heartbeat
registerShot('s088', { draw(g, t, info) {
  const st = info.shot.start, tGrav = shotWord('gravity', st, 0.41), tBack = shotWord('back', st, 1.67);
  const beat = (u) => Math.max(0, Math.sin(Math.max(0, u) * Math.PI * 2 * 0.9)) ** 8, pulse = beat(t - tGrav + 0.05) * (t > tGrav - 0.05 ? 1 : 0);
  const z = lerp(1.12, 1.42, ease.inOut(t / info.dur)) * (1 + 0.012 * pulse), flick = 1 - 0.35 * (Math.sin(t * 47) > 0.92 ? 1 : 0) * prog(t, 1.2, 1.4) * (t < 2.2 ? 1 : 0);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.rotate(-0.03); g.translate(-E.W / 2 + 120, -E.H / 2 - 330);
  const ck = ease.inOut(prog(t, tGrav, tGrav + 0.9)), ek = prog(t, tGrav + 0.8, tBack + 0.4);
  const N = notebook(g, t, { reveal: 1, lamp: flick, circle: ck, escape: ek });
  if (ck < 1) { const a = -2.6 + ck * Math.PI * 2.15; pencil(g, N.x0 + 330 + Math.cos(a) * 190, N.rows[NOTE_ROWS.length - 1] + Math.sin(a) * 58, -0.8); }
  else if (ek < 1) pencil(g, N.x0 + 240 + 400 * ek, N.rows[NOTE_ROWS.length - 1] + 120, -0.8);
  g.restore();
  g.save(); g.fillStyle = alpha('#000', 0.25 * (1 - flick)); g.fillRect(0, 0, E.W, E.H); g.restore();
  atmos(g, t, { z: 1 }, { color: '#ffd8b0', far: 12, near: 4 });
} });
