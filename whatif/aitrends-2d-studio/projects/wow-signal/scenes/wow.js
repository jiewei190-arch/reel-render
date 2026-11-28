// The Wow! signal — 26 shots, Toon 3D + BEANMEN FX. Deadpan narrator; the comedy is in the pictures. Every gag shows a real fact.
// s01 = frame 1 (printout already chattering, the red circle already being drawn, 2-line top caption 0-3.5 s).
// s26 (closer) lands on frame 1's exact camera over a fresh, unmarked sheet with the pen arriving at the circle's start -> loop.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, shake, tremble } from '/kits/toon3d/rig.js';
import { shakeCam, anchor, project } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { softTint } from '/kits/toon3d/sky.js';
import {
  at, fxr, THREE, toonStage, printout, printer, astronomer, colleague, headphones, labRoom, bigEarSet, bigEarEar, stars, NIGHT, comet, hcloud, star, dishSet,
  topCaption, chip, stamp, chatter, barCard, cobwebs, decades, bubbles, glowAt, nightLook, TXT, CARD_INK, RED, GOLD, cyl, ball, rbox, toon, flat, sph, M,
} from './_lib.js';

const gt = (info, t) => info.shot.start + t;
const TOP = (g, info, t) => topCaption(g, gt(info, t));
const LAB = { light: 'warm', bg: ['#2a4a44', '#3a6a5a'], ambient: 1.15, exposure: 1.02 };

// ---------------------------------------------------------------- the printer room (frame 1 lives here)
function printScene(T, o = {}) {
  const st = toonStage(T, { ...LAB, fov: 36, shadowSize: 7, target: [0, 1.5, 0] });
  const room = labRoom(st, { winX: -2.6, calX: 2.4 });
  room.group.children.forEach(c => { if (c.position && Math.abs(c.position.x) < 2 && c.position.z > -1 && c.position.y < 1.2) {} });
  const pr = printer(); pr.position.set(0.2, 0, -1.6); st.add(pr);
  const p = printout({ seed: o.seed || 7 }); p.position.set(0.2, pr.topY + 1.6 - 0.05, -1.5); p.rotation.x = -0.12; st.add(p);
  const A = astronomer(); A.position.set(-1.5, 0, -0.4); A.rotation.y = 0.55; st.add(A);
  room.group.visible = true;
  return { stage: st, room, pr, p, A };
}
// hide the lab desk for the printer shots (keeps the room, frees the floor)
const F1 = { pos: [0.0, 3.05, 1.15], look: [0.02, 2.98, -1.45], fov: 34 };
const F1b = { pos: [0.0, 3.02, 0.95], look: [0.02, 2.98, -1.45], fov: 33 };
// screen point of a paper uv
const scr = (s, u, v) => project(s.stage, s.p.uvWorld(u, v));
// 2D red marker drawn at the pen tip
function pen(g, x, y, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(-0.75);
  g.fillStyle = '#5a1a14'; g.beginPath(); g.moveTo(0, 0); g.lineTo(18, -10); g.lineTo(18, 10); g.closePath(); g.fill();
  g.fillStyle = '#d42a22'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.roundRect(18, -22, 200, 44, 10); g.fill(); g.stroke();
  g.fillStyle = '#f2efe8'; g.beginPath(); g.roundRect(160, -24, 70, 48, 10); g.fill(); g.stroke(); g.restore(); }
function paperDraw(s, t, u = {}) { s.pr.update(t); s.p.update(u); s.A.pose(addPose(POSE.stand, idle(t, 2))); s.A.face(EXPR.neutral, t); }
const jitter = (s, t, amp = 0.006) => shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp, dur: 99 }]);

// s01 — FRAME 1 "In 1977, a telescope caught a signal": the printout chatters up out of the printer, the red circle is already being drawn
registerShot('s01', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { const k = 0.18 + 0.82 * ease.inOut(prog(t, 0, info.dur + 0.2)); paperDraw(s, t, { circle: k, scroll: t * 60 });
    camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); jitter(s, t); s.k = k; },
  overlay(g, t, info, s) { nightLook(g, 0.08); const [u, v] = s.p.penUV(s.k); const q = scr(s, u, v); pen(g, q.x, q.y); chatter(g, t, { x: 540, y: 1560, r: 300, size: 54 }); TOP(g, info, t); },
});
// s02 — "so weird": the astronomer leans in, double take
registerShot('s02', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { s.pr.update(t); s.p.update({ circle: 1, scroll: 0 });
    const d = ease.outBack(prog(t, 0.35, 0.55)), back = ease.out(prog(t, 0.55, 0.75));
    s.A.pose(addPose(POSE.stand, { ...idle(t, 2), lean: 0.25 * (1 - back) - 0.18 * back, headTurn: lerp(0.5, 0, d) * (1 - back) + back * 0.1, bob: back * 0.08 }));
    s.A.face(t < 0.5 ? EXPR.bored : EXPR.shocked, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 4.6], look: [-0.7, 2.1, -0.8], fov: 40 }], [info.dur, { pos: [0.15, 2.55, 4.2], look: [-0.7, 2.1, -0.8], fov: 39 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.55, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { nightLook(g, 0.08); TOP(g, info, t); fxr(g, t, s, [{ fx: 'question', on: 'A', at: 0.1, until: 0.5 }, { fx: 'exclaim', on: 'A', at: 0.55, color: RED }]); },
});
// s03 — "someone wrote 'Wow!'": back on the paper; "Wow!" lands on the word
registerShot('s03', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { const w = at(info, 'Wow', 0.3) - 0.05; s.w = w; paperDraw(s, t, { circle: 1, wow: prog(t, w, w + 0.3) });
    camMove(s.stage, t, [[0, { pos: [-0.25, 3.05, 0.6], look: [-0.25, 2.95, -1.45], fov: 32 }], [info.dur, { pos: [-0.25, 3.03, 0.4], look: [-0.25, 2.95, -1.45], fov: 32 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: w + 0.1, amp: 0.03, dur: 0.3 }]); },
  overlay(g, t, info, s) { nightLook(g, 0.06); const [u, v] = s.p.wowUV(); const q = scr(s, u, v); pen(g, q.x + 120, q.y + 40, clamp((t - s.w + 0.4) / 0.2) * clamp((s.w + 0.6 - t) / 0.2));
    TOP(g, info, t); fxr(g, t, s, [{ fx: 'sparkle', on: s.p.uvWorld(u, v), at: s.w + 0.15, scale: 1.2 }]); },
});

// ---------------------------------------------------------------- Big Ear field (night)
function earScene(T, o = {}) { const st = toonStage(T, { ...NIGHT, ambient: 1.7, key: ['#d4dcff', 2.0, [6, 12, 8]], fov: 46, shadowSize: 30, target: [0, 0, 0] }); const set = bigEarSet(st, {});
  const ear = bigEarEar(); ear.scale.setScalar(1.5); ear.position.set(-6, -12, -14); ear.rotation.y = 0.25; st.add(ear);
  const A = astronomer({ color: '#8a5a32' }); A.position.set(2, 0.03, 4); st.add(A); return { stage: st, set, ear, A }; }
// s04 — "Ohio's Big Ear radio telescope": the field at night; on "Ear" a giant cartoon ear pops up behind it (the name, made literal)
registerShot('s04', { kind: '3d',
  init(T) { return earScene(T); },
  draw(s, t, info) { const e = at(info, 'Ear', 0.8); const k = ease.outBack(prog(t, e, e + 0.45)); s.ear.position.y = lerp(-12, 9, k); s.ear.rotation.z = Math.sin(t * 3) * 0.05 * k; s.A.visible = false; s.e = e;
    camMove(s.stage, t, [[0, { pos: [6, 7, 30], look: [-2, 5, -6], fov: 50 }], [info.dur, { pos: [4, 6.5, 26], look: [-2, 5.5, -6], fov: 50 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: e + 0.3, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { nightLook(g); chip(g, 'OHIO, USA', E.W / 2, 520, t - 0.05, { size: 56, color: '#ffffff', rot: -3 }); chip(g, 'BIG EAR', E.W / 2, 1180, t - at(info, 'Big', 0.5), { size: 80, rot: 2 });
    fxr(g, t, s, [{ fx: 'sparkle', on: s.ear, at: s.e + 0.4, scale: 1.4 }]); },
});
// s05 — "was listening for alien signals": a tiny astronomer on the ground plane cups his ear at the sky
const CUP = { ...POSE.stand, armR: [0.5, 1.25, 0.6], elbowR: 2.5, headTilt: 0.25, headNod: -0.25 };
registerShot('s05', { kind: '3d',
  init(T) { return earScene(T); },
  draw(s, t, info) { s.ear.visible = false; s.A.position.set(0, 0.03, 4); s.A.rotation.y = 0.2; s.A.pose(addPose(CUP, idle(t, 3))); s.A.face({ ...EXPR.suspicious, pupil: [0.2, 0.7] }, t);
    camMove(s.stage, t, [[0, { pos: [1.5, 1.6, 10.5], look: [0, 2.6, 2], fov: 40 }], [info.dur, { pos: [1.2, 1.5, 9.4], look: [0, 2.8, 2], fov: 40 }]]); },
  overlay(g, t, info, s) { nightLook(g); chip(g, 'LISTENING FOR ALIENS', E.W / 2, 520, t - at(info, 'alien', 0.6), { size: 60, color: '#9fe8ff', rot: -2 });
    fxr(g, t, s, [{ fx: 'question', on: 'A', at: 0.2 }, { fx: 'sparkle', on: [-3, 9, -6], at: 0.4, scale: 0.8, color: '#9fe8ff' }]); },
});

// ---------------------------------------------------------------- the code
// s06 — "Its printout was code:" printer chattering, paper scrolling up; THE CODE chip
registerShot('s06', { kind: '3d',
  init(T) { return printScene(T, { seed: 9 }); },
  draw(s, t, info) { paperDraw(s, t, { quiet: true, scroll: t * 120 }); s.p.position.y = 3.0 + Math.sin(t * 40) * 0.004;
    camMove(s.stage, t, [[0, { pos: [1.6, 2.6, 2.8], look: [0.2, 2.2, -1.5], fov: 40 }], [info.dur, { pos: [1.3, 2.6, 2.4], look: [0.2, 2.3, -1.5], fov: 40 }]]); jitter(s, t, 0.01); },
  overlay(g, t, info, s) { nightLook(g, 0.06); chatter(g, t, { x: 560, y: 1250, r: 300, size: 60, rate: 9 }); chip(g, 'THE CODE', E.W / 2, 520, t - at(info, 'code', 0.4), { size: 76 }); },
});
// s07 — "numbers meant weak," close on a quiet column of 1s; zzz
registerShot('s07', { kind: '3d',
  init(T) { return printScene(T, { seed: 9 }); },
  draw(s, t, info) { paperDraw(s, t, { quiet: true });
    camMove(s.stage, t, [[0, { pos: [0.35, 3.0, 0.5], look: [0.35, 2.92, -1.45], fov: 32 }], [info.dur, { pos: [0.35, 3.0, 0.35], look: [0.35, 2.92, -1.45], fov: 32 }]]); },
  overlay(g, t, info, s) { nightLook(g, 0.06); chip(g, '1  2  3 ... 9  =  WEAK', E.W / 2, 520, t - at(info, 'weak', 0.4) + 0.2, { size: 62, color: '#c9d4e0' });
    fxr(g, t, s, [{ fx: 'zzz', on: s.p.uvWorld(0.6, 0.35), at: at(info, 'weak', 0.4), scale: 1.1 }]); },
});
// s08 — "letters meant strong." the alphabet bounces in, big and loud
registerShot('s08', { kind: '3d',
  init(T) { return printScene(T, { seed: 9 }); },
  draw(s, t, info) { paperDraw(s, t, { quiet: true }); camMove(s.stage, t, [[0, { pos: [0.35, 3.0, 0.35], look: [0.35, 2.92, -1.45], fov: 32 }], [info.dur, { pos: [0.35, 3.0, 0.2], look: [0.35, 2.92, -1.45], fov: 31 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'strong', 0.6), amp: 0.04, dur: 0.3 }]); },
  overlay(g, t, info, s) { nightLook(g, 0.06); dimScene(g, 3, 0.25); const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 26; i++) { const k = ease.outBack(clamp((t - 0.05 - i * 0.03) / 0.25)); if (k <= 0) continue; const x = 140 + (i % 7) * 133, y = 760 + Math.floor(i / 7) * 150 + Math.sin(t * 9 + i) * 12; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(Math.sin(t * 7 + i) * 0.12);
      TXT(g, L[i], 0, 0, 110, { color: ['#ff5a4a', GOLD, '#ffffff', '#9fe8ff'][i % 4], stroke: CARD_INK }); g.restore(); }
    chip(g, 'A ... Z  =  STRONG', E.W / 2, 520, t - at(info, 'strong', 0.6) + 0.2, { size: 66, color: '#ff5a4a', ink: '#ffffff' }); },
});

// ---------------------------------------------------------------- the reading
// s09 — "Then, on August 15," the printer suddenly jolts; date stamp
registerShot('s09', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { paperDraw(s, t, { circle: 0, scroll: t * 200 }); const j = Math.max(0, Math.sin(t * 38)) * 0.04 * clamp(t / 0.2); s.pr.position.y = j; s.pr.rotation.z = Math.sin(t * 31) * 0.02;
    s.A.pose(addPose(POSE.panic, idle(t, 2))); s.A.face(EXPR.shocked, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.5, 4.6], look: [-0.3, 1.8, -1.2], fov: 42 }], [info.dur, { pos: [0.3, 2.4, 4.0], look: [-0.3, 1.8, -1.2], fov: 41 }]]); jitter(s, t, 0.03); },
  overlay(g, t, info, s) { nightLook(g, 0.06); chatter(g, t, { x: 600, y: 1150, r: 330, size: 70, rate: 12, word: 'CHK!', color: GOLD });
    stamp(g, 'AUG 15, 1977', E.W / 2, 520, t - at(info, 'August', 0.3) + 0.1, { size: 88 }); fxr(g, t, s, [{ fx: 'exclaim', on: 'A', at: 0.15, color: RED }]); },
});
// s10/s11 — "it printed: 6, E, Q, U, J, 5." + "That U was about 30 standard deviations above the noise." the code as a bar chart (insert)
const barTimes = (info) => ['6', 'E', 'Q', 'U', 'J', '5'].map((w, i) => at(info, w, 0.25 + i * 0.3));
registerShot('s10', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { paperDraw(s, t, { circle: 0 }); camMove(s.stage, t, [[0, F1], [info.dur, F1b]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.55); barCard(g, t, barTimes(info), { title: 'WHAT IT PRINTED' }); },
});
registerShot('s11', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { paperDraw(s, t, { circle: 0 }); camMove(s.stage, t, [[0, F1b], [info.dur, F1]]); s.b = at(info, '30', 0.6);
    shakeCam(s.stage, t, [{ fx: 'shake', at: s.b, amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.55); const bust = prog(t, s.b - 0.05, s.b + 0.35); barCard(g, t + 1, [-9, -9, -9, -9, -9, -9], { title: 'WHAT IT PRINTED', bust, noiseLabel: t > at(info, 'noise', 1.6) - 0.2 });
    chip(g, '≈ 30 STANDARD DEVIATIONS', E.W / 2, 1330, t - s.b - 0.1, { size: 52, color: GOLD }); if (t > s.b) { const k = ease.outBack(clamp((t - s.b) / 0.25)); g.save(); g.translate(720, 300); g.scale(k, k); g.rotate(0.2); TXT(g, 'CRACK!', 0, 0, 90, { color: '#ffffff', stroke: CARD_INK }); g.restore(); } },
});
// s11b — "standard deviations above the noise." the astronomer's reaction: eyes pop, sweat; WAY ABOVE THE NOISE
registerShot('s11b', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { s.pr.update(t); s.p.update({ circle: 0 }); const k = ease.outBack(prog(t, 0.1, 0.35));
    s.A.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, lean: -0.15, armL: [0.6, 0.5, 0], armR: [0.6, 0.5, 0], elbowL: 1.2, elbowR: 1.2 }, k), { ...idle(t, 2), ...tremble(t, 0.6) })); s.A.face({ ...EXPR.shocked, pupil: [0.5, 0.2] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.9, 2.45, 2.2], look: [-1.45, 2.1, -0.4], fov: 36 }], [info.dur, { pos: [-0.95, 2.45, 1.9], look: [-1.45, 2.1, -0.4], fov: 35 }]]); },
  overlay(g, t, info, s) { nightLook(g, 0.06); chip(g, 'WAY ABOVE THE NOISE', E.W / 2, 520, t - at(info, 'above', 0.6) + 0.1, { size: 62, color: GOLD });
    fxr(g, t, s, [{ fx: 'sweat', on: 'A', at: 0.2 }, { fx: 'exclaim', on: 'A', at: 0.15, color: RED }]); },
});
// s12 — "Days later, Jerry Ehman": at the desk with a stack of printouts, coffee
function deskScene(T, o = {}) { const st = toonStage(T, { ...LAB, fov: 38, shadowSize: 7, target: [0, 1.2, 0] }); const room = labRoom(st, { winX: -2.4, calX: 2.2 });
  const A = astronomer({ beard: o.beard }); A.position.set(0, -0.12, -1.0); A.rotation.y = 0; st.add(A);
  const chair = rbox(1.0, 0.12, 0.9, '#5a3a22', 0, 0.62, -1.1, 0.04); st.add(chair);
  if (o.phones) headphones(A);
  return { stage: st, room, A }; }
registerShot('s12', { kind: '3d',
  init(T) { const s = deskScene(T); s.A.rotation.y = 0.2; return s; },
  draw(s, t, info) { s.A.pose(addPose(POSE.sit, { ...idle(t, 4, 0.5), armR: [1.1, 0.2, 0.3], elbowR: 1.6, headNod: 0.25 })); s.A.face(EXPR.bored, t);
    camMove(s.stage, t, [[0, { pos: [1.2, 2.5, 4.4], look: [0, 1.5, -0.6], fov: 40 }], [info.dur, { pos: [1.0, 2.45, 3.9], look: [0, 1.5, -0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { softTint(g, '#ffb070', 0.12); stamp(g, 'DAYS LATER', E.W / 2, 520, t - 0.05, { size: 92, color: '#2f6ad0' });
    chip(g, 'astronomer Jerry Ehman', E.W / 2, 1600 - 260, t - at(info, 'Jerry', 0.8), { size: 50, color: '#ffffff' }); },
});
// s13 — "circled it and wrote: Wow!" the signature: the circle draws on, then "Wow!" — flash, stars
registerShot('s13', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { const c0 = at(info, 'circled', 0.1) - 0.05; s.w = at(info, 'Wow', info.dur - 0.6) - 0.05; s.k = ease.inOut(prog(t, c0, c0 + 0.75));
    paperDraw(s, t, { circle: s.k, wow: prog(t, s.w, s.w + 0.3) }); camMove(s.stage, t, [[0, F1], [info.dur, { pos: [-0.1, 3.0, 0.55], look: [-0.12, 2.96, -1.45], fov: 32 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: s.w + 0.1, amp: 0.05, dur: 0.35 }]); },
  overlay(g, t, info, s) { nightLook(g, 0.06); const drawing = t < s.w + 0.4; if (s.k < 1) { const [u, v] = s.p.penUV(s.k); const q = scr(s, u, v); pen(g, q.x, q.y); } else if (drawing) { const [u, v] = s.p.wowUV(); const q = scr(s, u, v); pen(g, q.x + 140, q.y + 30, clamp((s.w + 0.6 - t) / 0.2)); }
    const [u, v] = s.p.wowUV(); fxr(g, t, s, [{ fx: 'flash', at: s.w + 0.1, dur: 0.2 }, { fx: 'stars', on: s.p.uvWorld(u, v), at: s.w + 0.15, scale: 1.3 }]); },
});

// ---------------------------------------------------------------- 72 seconds
// s14 — "It lasted 72 seconds," INSERT counter over the blurred field
const fieldBehind = { init(T) { return earScene(T); }, draw(s, t) { s.ear.visible = false; s.A.visible = false; s.set.sky.rotation.y = t * 0.02;
  camMove(s.stage, t, [[0, { pos: [6, 6, 30], look: [0, 4, -2], fov: 50 }], [3, { pos: [5, 6, 27], look: [0, 4, -2], fov: 50 }]]); } };
registerShot('s14', { kind: '3d', init: fieldBehind.init, draw: fieldBehind.draw,
  overlay(g, t, info, s) { dimScene(g, 8, 0.5); drawInsert(g, { type: 'counter', value: 72, from: 0, suffix: ' s', title: 'IT LASTED', lines: ['seventy-two seconds'], color: GOLD }, t);
    // a toon stopwatch ring
    const k = ease.out(clamp(t / 1.3)); g.save(); g.translate(E.W / 2, 1290); g.lineWidth = 22; g.strokeStyle = CARD_INK; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.stroke(); g.strokeStyle = GOLD; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 90, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2 * 0.98); g.stroke(); g.restore(); },
});
// s15 — "exactly as long as Big Ear could watch one spot." the sky slides past the fixed beam; a glowing spot crosses it
registerShot('s15', { kind: '3d',
  init(T) { const s = earScene(T); const beam = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 0.6, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.set(6, 20, 0); beam.rotation.z = 0.05; beam.userData.noOutline = true; s.stage.add(beam); s.beam = beam;
    const spot = ball(1.2, '#ffd23a', 0, 34, 0, 16); spot.material = flat('#ffe680'); spot.userData.noOutline = true; s.stage.add(spot); s.spot = spot; return s; },
  draw(s, t, info) { s.ear.visible = false; s.A.visible = false; const k = t / info.dur; s.set.sky.rotation.y = 0.2 + k * 0.25; s.spot.position.set(lerp(-26, 34, k), 36, 0);
    camMove(s.stage, t, [[0, { pos: [28, 4, 40], look: [6, 20, 0], fov: 54 }], [info.dur, { pos: [26, 4, 38], look: [6, 20, 0], fov: 54 }]]); },
  overlay(g, t, info, s) { nightLook(g); const q = anchor(s.stage, s.spot.position.toArray()); const inB = Math.abs(s.spot.position.x - 7) < 10; glowAt(g, q.x, q.y, 160, '#ffe680', inB ? 0.7 : 0.25);
    chip(g, 'EARTH TURNS: 1 SPOT = 72 s', E.W / 2, 520, t - 0.15, { size: 54, color: '#ffffff' }); if (inB) { g.save(); g.globalAlpha = 0.8; TXT(g, 'IN VIEW', q.x, q.y - 120, 54, { color: GOLD, stroke: CARD_INK }); g.restore(); } },
});

// ---------------------------------------------------------------- decades of nothing
const DEC = ['1980s', '1990s', '2000s', '2010s', '2020s'];
// s16 — "They listened again for decades." headphones at the desk; years flip; cobwebs; the beard grows in
registerShot('s16', { kind: '3d',
  init(T) { const a = deskScene(T, { phones: true }); const B = astronomer({ beard: true }); headphones(B); B.position.copy(a.A.position); B.rotation.y = a.A.rotation.y; a.stage.add(B); a.B = B; return a; },
  draw(s, t, info) { const sw = t > info.dur * 0.55; s.A.visible = !sw; s.B.visible = sw; for (const b of [s.A, s.B]) { b.rotation.y = 0.05; b.pose(addPose(POSE.sit, { ...idle(t, 4, 0.5), armL: [0.9, 0.3, 0.6], elbowL: 2.2, headTilt: 0.15 })); b.face(EXPR.bored, t); }
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.4, 4.6], look: [0, 2.0, -0.7], fov: 40 }], [info.dur, { pos: [-0.4, 2.3, 4.0], look: [0, 2.0, -0.7], fov: 40 }]]); },
  overlay(g, t, info, s) { softTint(g, '#9fb0e0', 0.12); cobwebs(g, t / info.dur); decades(g, t - 0.1, DEC, { step: Math.max(0.25, (info.dur - 0.2) / DEC.length), y: 430 }); },
});
// s17 — "Nothing." the bearded astronomer, deadpan, a printout of quiet 1s; a beat of silence
registerShot('s17', { kind: '3d',
  init(T) { const s = printScene(T, { seed: 12 }); const B = astronomer({ beard: true }); B.position.copy(s.A.position); B.rotation.y = 0.35; s.stage.add(B); s.A.visible = false; s.B = B; return s; },
  draw(s, t, info) { s.pr.update(t); s.p.update({ quiet: true }); s.B.pose(addPose(shrug(POSE.stand, ease.outBack(prog(t, 0.35, 0.65))), idle(t, 3))); s.B.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [-0.9, 2.5, 2.4], look: [-1.3, 2.1, -0.4], fov: 38 }], [info.dur, { pos: [-0.95, 2.5, 2.2], look: [-1.3, 2.1, -0.4], fov: 38 }]]); },
  overlay(g, t, info, s) { nightLook(g, 0.06); chip(g, 'SIGNALS FOUND: 0', E.W / 2, 520, t - 0.15, { size: 64, color: '#c9d4e0' }); fxr(g, t, s, [{ fx: 'sweat', on: 'B', at: 0.5 }]); },
});
// space stage
function spaceScene(T, o = {}) { const st = toonStage(T, { ...NIGHT, bg: ['#04061a', '#0c1036', '#1c1a4a'], fov: 40, shadowSize: 10, target: [0, 0, 0], key: ['#e8ecff', 1.6, [-5, 6, 8]] }); const sk = stars(st, { n: 900, R: 80, seed: o.seed || 3, size: 0.7 });
  sk.position.y = -40; return { stage: st, sk }; }
// s18 — "Comets got blamed." two toon comets with faces, giant arrows point at them; sweat
registerShot('s18', { kind: '3d',
  init(T) { const s = spaceScene(T); s.c1 = comet({ seed: 1 }); s.c1.position.set(-1.6, 1.3, 0); s.c1.rotation.z = 0.2; s.c2 = comet({ seed: 2, color: '#d0f0ff' }); s.c2.position.set(1.6, -0.9, -0.5); s.c2.rotation.z = -0.15; s.stage.add(s.c1, s.c2); return s; },
  draw(s, t, info) { const b = at(info, 'blamed', 0.5); s.c1.update(t, { lid: 0.2, look: [0.5, 0], mouth: t > b ? 'o' : 'smile' }); s.c2.update(t, { lid: 0.2, look: [-0.5, 0], mouth: t > b ? 'o' : 'smile' });
    s.c1.position.y = 1.3 + Math.sin(t * 2) * 0.08; s.c2.position.y = -0.9 + Math.sin(t * 2 + 1) * 0.08;
    camMove(s.stage, t, [[0, { pos: [-0.3, 0, 14], look: [-0.1, 0, 0], fov: 40 }], [info.dur, { pos: [-0.3, 0, 13], look: [-0.1, 0, 0], fov: 40 }]]); s.b = b; },
  overlay(g, t, info, s) { const k = ease.outBack(clamp((t - s.b) / 0.3)); if (k > 0) for (const [c, sx] of [[s.c1, -1], [s.c2, 1]]) { const q = project(s.stage, c.position); g.save(); g.translate(q.x + sx * 30, q.y - 250); g.rotate(Math.PI / 2 + sx * 0.25); g.scale(k, k);
      g.fillStyle = RED; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-90, -24); g.lineTo(30, -24); g.lineTo(30, -60); g.lineTo(100, 0); g.lineTo(30, 60); g.lineTo(30, 24); g.lineTo(-90, 24); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    chip(g, 'THE 2017 COMET IDEA', E.W / 2, 1230, t - 0.1, { size: 60, color: '#9fe8ff' }); fxr(g, t, s, [{ fx: 'sweat', on: 'c1', at: s.b + 0.1 }, { fx: 'sweat', on: 'c2', at: s.b + 0.2 }]); },
});
// s19 — "Astronomers said nope." two astronomers shake their heads; NOPE stamp
registerShot('s19', { kind: '3d',
  init(T) { const st = toonStage(T, { ...LAB, fov: 38, shadowSize: 7, target: [0, 1.2, 0] }); const room = labRoom(st, {}); room.group.children.forEach(() => {});
    const A = astronomer(); A.position.set(-0.75, 0, 1.6); A.rotation.y = 0.15; const C = colleague(); C.position.set(0.75, 0, 1.6); C.rotation.y = -0.15; st.add(A, C); return { stage: st, A, C }; },
  draw(s, t, info) { const n = at(info, 'nope', 0.5); const k = prog(t, n - 0.25, n + 0.6);
    for (const [b, sd] of [[s.A, 1], [s.C, 2]]) { b.pose(addPose(POSE.handsHips, { ...idle(t, sd), ...(k > 0 && k < 1 ? shake(t, 0.3, 3) : {}) })); b.face(k > 0 ? EXPR.deadpan : EXPR.suspicious, t); }
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 7.2], look: [0, 1.8, 1.2], fov: 38 }], [info.dur, { pos: [0, 2.3, 6.6], look: [0, 1.8, 1.2], fov: 38 }]]); s.n = n; },
  overlay(g, t, info, s) { softTint(g, '#ffb070', 0.12); stamp(g, 'NOPE.', E.W / 2, 560, t - s.n, { size: 130 }); },
});

// ---------------------------------------------------------------- the reveal
// s20 — "But here's the part..." slow push into deep space, quiet; a faint cloud far away
function cloudScene(T) { const s = spaceScene(T, { seed: 8 }); s.h = hcloud({ seed: 4 }); s.stage.add(s.h); s.st = star({ r: 0.6 }); s.st.position.set(4.2, 2.6, -3); s.stage.add(s.st); return s; }
registerShot('s20', { kind: '3d',
  init(T) { return cloudScene(T); },
  draw(s, t, info) { s.h.update(t, { lid: 0.85, mouth: 'smile' }); s.st.update(t, 0);
    camMove(s.stage, t, [[0, { pos: [0, 0.5, 30], look: [0, 0.3, 0], fov: 40 }], [info.dur, { pos: [0, 0.4, 20], look: [0, 0.2, 0], fov: 40 }]], ease.inOut); },
  overlay(g, t, info, s) { nightLook(g, 0.25); },
});
// s21 — "a 2024 study says" wide: the cloud far off in deep space; 2024 STUDY stamp
registerShot('s21', { kind: '3d',
  init(T) { return cloudScene(T); },
  draw(s, t, info) { s.h.update(t, { lid: 0.6, mouth: 'smile' }); s.st.update(t, 0);
    camMove(s.stage, t, [[0, { pos: [0, 0.5, 19], look: [0, 0.3, 0], fov: 40 }], [info.dur, { pos: [0, 0.45, 16.5], look: [0, 0.25, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { nightLook(g, 0.15); stamp(g, '2024 STUDY', E.W / 2, 520, t - at(info, '2024', 0.1) + 0.05, { size: 92, color: '#2f6ad0' });
    chip(g, 'a hypothesis', E.W / 2, 660, t - at(info, 'study', 0.5), { size: 50, color: '#ffffff' }); },
});
// s21b — "a cold hydrogen cloud" close: the cloud, shivering; COLD HYDROGEN CLOUD chip, brrr
registerShot('s21b', { kind: '3d',
  init(T) { return cloudScene(T); },
  draw(s, t, info) { s.h.update(t, { lid: 0.45, mouth: 'frown', shiver: 1, look: [0.2, 0.1] }); s.st.update(t, 0);
    camMove(s.stage, t, [[0, { pos: [0.4, 0.4, 9.5], look: [0, 0.2, 0], fov: 40 }], [info.dur, { pos: [0.3, 0.3, 8.7], look: [0, 0.2, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { chip(g, 'COLD HYDROGEN CLOUD', E.W / 2, 520, t - 0.05, { size: 58, color: '#9fe8ff' });
    const k = ease.outBack(clamp((t - 0.25) / 0.25)); if (k > 0) { g.save(); g.translate(270, 760); g.rotate(-0.2); g.scale(k, k); TXT(g, 'brrr', 0, 0, 74, { color: '#ffffff', stroke: CARD_INK }); g.restore(); } },
});
// s22 — "may have suddenly flared." a star flashes, the cloud lights up hot pink-white, shocked; MAYBE? chip
registerShot('s22', { kind: '3d',
  init(T) { return cloudScene(T); },
  draw(s, t, info) { const f = at(info, 'flared', 0.6) - 0.15; s.f = f; const gl = ease.out(prog(t, f, f + 0.25)); s.h.update(t, { glow: gl, lid: gl > 0.3 ? 0 : 0.4, mouth: gl > 0.3 ? 'o' : 'frown' }); s.st.update(t, ease.out(prog(t, f - 0.25, f)) * (1 - prog(t, f + 0.3, f + 0.8)));
    camMove(s.stage, t, [[0, { pos: [1.6, 1.0, 11.5], look: [1.2, 0.8, 0], fov: 42 }], [info.dur, { pos: [1.4, 0.9, 10.5], look: [1.0, 0.7, 0], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: f + 0.05, amp: 0.08, dur: 0.4 }]); },
  overlay(g, t, info, s) { const q = anchor(s.stage, s.h.position.toArray()); glowAt(g, q.x, q.y, 700, '#ff9ad8', 0.75 * ease.out(prog(t, s.f, s.f + 0.25)));
    chip(g, 'MAYBE?', E.W / 2, 520, t - at(info, 'may', 0.2), { size: 80, color: GOLD, rot: -4 }); fxr(g, t, s, [{ fx: 'flash', at: s.f + 0.05, dur: 0.2 }, { fx: 'exclaim', on: 'h', at: s.f + 0.15, color: RED }]); },
});

// ---------------------------------------------------------------- the reply
// s23 — "Still unconfirmed." the astronomer at the printout, shrug, ???
registerShot('s23', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { s.pr.update(t); s.p.update({ circle: 1, wow: 1 }); s.A.pose(addPose(shrug(POSE.stand, ease.outBack(prog(t, 0.2, 0.5))), idle(t, 2))); s.A.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.5, 5.0], look: [-0.5, 2.0, -0.8], fov: 40 }], [info.dur, { pos: [0.3, 2.5, 4.6], look: [-0.5, 2.0, -0.8], fov: 40 }]]); },
  overlay(g, t, info, s) { nightLook(g, 0.06); stamp(g, 'UNCONFIRMED', E.W / 2, 520, t - at(info, 'unconfirmed', 0.4) + 0.1, { size: 92, color: '#7a7a8a' }); fxr(g, t, s, [{ fx: 'question', on: 'A', at: 0.3 }]); },
});
// s24 — "But in 2012, someone replied anyway..." a big radio dish in a valley at dusk; a beam goes up; 2012 stamp
function dishScene(T) { const st = toonStage(T, { light: 'dusk', bg: ['#2a2f6a', '#8a6aa0', '#f2a87a'], fov: 46, shadowSize: 30, target: [0, 0, 0] }); const set = dishSet(st); return { stage: st, set }; }
registerShot('s24', { kind: '3d',
  init(T) { return dishScene(T); },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 16, 40], look: [0, 4, 0], fov: 46 }], [info.dur, { pos: [0, 15, 34], look: [0, 5, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { const q = anchor(s.stage, [0, 1, 0]); const r = at(info, 'replied', 0.8); if (t > r) { const k = ease.out(clamp((t - r) / 0.4)); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(0, q.y, 0, 0); gr.addColorStop(0, 'rgba(160,232,255,0.7)'); gr.addColorStop(1, 'rgba(160,232,255,0)'); g.fillStyle = gr; g.fillRect(q.x - 60 * k, 0, 120 * k, q.y); g.restore(); }
    stamp(g, '2012', E.W / 2, 480, t - at(info, '2012', 0.4) + 0.05, { size: 110, color: '#2f6ad0' }); },
});
// s25 — PAYOFF "with over 10,000 tweets." speech bubbles stream up out of the dish; counter
registerShot('s25', { kind: '3d',
  init(T) { return dishScene(T); },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 22, 30], look: [0, 6, 0], fov: 48 }], [info.dur, { pos: [0, 24, 28], look: [0, 10, 0], fov: 48 }]]); },
  overlay(g, t, info, s) { const q = anchor(s.stage, [0, 1, 0]); bubbles(g, t, q.x, q.y, { n: 46, spread: info.dur, w: 420 });
    const k = ease.outBack(clamp((t - at(info, 'tweets', 0.6) + 0.35) / 0.3)); if (k > 0) { g.save(); g.translate(E.W / 2, 560); g.scale(k, k); TXT(g, '10,000+', 0, 0, 190, { color: GOLD, stroke: CARD_INK }); TXT(g, 'TWEETS', 0, 140, 90, { color: '#ffffff', stroke: CARD_INK }); g.restore(); } },
});
// s26 — closer "Subscribe for more." back to frame 1: a fresh sheet chatters up, the pen arrives at the circle's start -> loops into s01
registerShot('s26', { kind: '3d',
  init(T) { return printScene(T); },
  draw(s, t, info) { const k = 0.18 * ease.out(prog(t, info.dur - 0.5, info.dur)); s.k = k; paperDraw(s, t, { circle: k, scroll: (t - info.dur) * 60 });
    camMove(s.stage, t, [[0, { pos: [0.4, 3.2, 2.2], look: [0.1, 2.9, -1.45], fov: 36 }], [info.dur, F1]], ease.inOut); jitter(s, t); },
  overlay(g, t, info, s) { nightLook(g, 0.08); const [u, v] = s.p.penUV(s.k); const q = scr(s, u, v); pen(g, q.x, q.y, clamp((t - 0.2) / 0.3)); chatter(g, t, { x: 540, y: 1560, r: 300, size: 54 }); },
});
