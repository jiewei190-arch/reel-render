// 1987 Chicago TV signal hijack — 21 shots, Toon 3D. Deadpan narrator; the comedy is in the reactions and literal visuals.
// s01 = frame 1 (already moving, 2-line top caption 0-3.5 s); s21 ends on frame 1's camera + pose -> loop.
// Facts only (see sources.md). The intruder is a generic rubber mask; no crude content is shown or described.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, tremble } from '/kits/toon3d/rig.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot, drawInsert, dimScene } from '/kits/toon3d/insert.js';
import {
  at, fxr, THREE, toonStage, livingRoom, armchair, headphones, broadcastScene, jerk, roomScene, popcornFly, studio, controlRoom, towerRoom, caseOffice, magnifier,
  sportscaster, engineer, investigator, crtTV, vhs, staticFlash, buzzText, callout, chip, stamp, clockCard, topCaption, ball, plane, toon, rbox, cyl, outline,
} from './_lib.js';

const gt = (info, t) => info.shot.start + t;
// ---------------------------------------------------------------- broadcast set (frame 1 / reveal / payoff)
const F1 = { pos: [0, 2.15, 6.2], look: [0, 2.05, 0], fov: 34 }, F1b = { pos: [0, 2.12, 5.5], look: [0, 2.08, 0], fov: 34 };
const manPose = (s, t, k = 1) => s.man.pose(addPose(POSE.stand, jerk(t, k)));
function bcDraw(s, t, k = 1, sw = 1) { s.sh.update(t, sw); manPose(s, t, k); }

// s01 "A masked stranger hijacked Chicago TV" — FRAME 1: the intruder bops in front of the swiveling sheet, VHS look, buzz
registerShot('s01', { kind: '3d',
  init(T) { return broadcastScene(T); },
  draw(s, t, info) { bcDraw(s, t); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.01, dur: info.dur }]); },
  overlay(g, t, info, s) { vhs(g, t, 1); topCaption(g, gt(info, t)); buzzText(g, t, { x: 540, y: 1330, r: 330, size: 64, on: 0.85 }); },
});
// s02 "in 1987. Twice." — a living room TV shows him; "1987" stamp, "x2"
registerShot('s02', { kind: '3d',
  init(T) { const s = roomScene(T, livingRoom, armchair); return s; },
  draw(s, t, info) { s.tv.setScreen('mask', t + 3); s.V.pose(addPose(POSE.sit, idle(t, 2, 0.5))); s.V.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 1.75, 0.35], look: [1.6, 1.22, 1.6], fov: 40 }], [info.dur, { pos: [0.15, 1.6, 0.65], look: [1.6, 1.22, 1.6], fov: 40 }]]); },
  overlay(g, t, info, s) { topCaption(g, gt(info, t)); const tw = at(info, 'Twice.', 0.9);
    stamp(g, 'NOV 22, 1987', 540, 1150, t - 0.05, { size: 76 }); chip(g, 'TWICE', 540, 560, t - tw, { size: 80, color: '#ff5a4a', rot: 4, ink: '#ffffff' }); },
});
// s03 "The nine o'clock news. The sports report..." — the newsroom, a generic sportscaster mid-report
function studioScene(T) { const st = toonStage(T, { light: 'warm', fov: 30, shadowSize: 6, target: [0, 1.5, 0], exposure: 1.05 }); const set = studio(st);
  const S = sportscaster(); S.position.set(0, 0, 0.1); st.add(S); return { stage: st, set, S }; }
registerShot('s03', { kind: '3d',
  init(T) { return studioScene(T); },
  draw(s, t, info) { s.set.mon.setScreen('sports', t); s.S.pose(addPose(POSE.stand, { ...idle(t, 4, 0.6), armL: [0.7, 0.2, 0.3], elbowL: 1.4, armR: [0.7 + Math.sin(t * 5) * 0.08, 0.2, 0.3], elbowR: 1.5 }));
    s.S.face({ ...EXPR.happy, talk: 0.8 }, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.1, 7.4], look: [0.4, 1.75, 0], fov: 30 }], [info.dur, { pos: [0.4, 2.05, 6.6], look: [0.3, 1.8, 0], fov: 30 }]]); },
  overlay(g, t, info) { chip(g, "9 O'CLOCK NEWS", 540, 330, t - 0.1, { size: 58, color: '#ffffff' }); chip(g, 'SPORTS', 540, 470, t - at(info, 'sports', 1.0), { size: 64, color: '#ffd23a', rot: -3 }); },
});
// s04 "and then, this." — beat; the studio monitor (and the picture) flip to the intruder: static flash + buzz
registerShot('s04', { kind: '3d',
  init(T) { return broadcastScene(T); },
  draw(s, t, info) { bcDraw(s, t + 1.3, 1.2); camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 7.8], look: [0, 2.0, 0], fov: 36 }], [info.dur, { pos: [0.2, 2.2, 6.8], look: [0, 2.05, 0], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.05, dur: 0.35 }]); },
  overlay(g, t, info) { vhs(g, t + 1, 1); staticFlash(g, t, 1 - clamp(t / 0.25)); buzzText(g, t, { x: 540, y: 1150, r: 360, size: 70 }); },
});
// s05 "A man in a rubber mask and sunglasses," — close-up, labels pop on the mask and the shades
registerShot('s05', { kind: '3d',
  init(T) { return broadcastScene(T); },
  draw(s, t, info) { bcDraw(s, t + 2.2, 0.6); camMove(s.stage, t, [[0, { pos: [0.1, 2.25, 3.3], look: [0, 2.15, 0], fov: 32 }], [info.dur, { pos: [0.05, 2.2, 2.9], look: [0, 2.15, 0], fov: 32 }]]); },
  overlay(g, t, info, s) { vhs(g, t + 2, 0.8); const a = anchor(s.stage, s.man);
    callout(g, 'RUBBER MASK', 300, 380, a.cx - a.r * 0.6, a.cy - a.r * 0.6, t - at(info, 'rubber', 0.3), { rot: -4 });
    callout(g, 'SUNGLASSES', 780, 1180, a.cx + a.r * 0.35, a.cy - a.r * 0.15, t - at(info, 'sunglasses', 1.0), { rot: 3, color: '#7ad0ff' }); },
});
// s06 "dressed as an 80s TV character." — the viewer at home: slow double-take, popcorn flies, "???"
registerShot('s06', { kind: '3d',
  init(T) { const s = roomScene(T, livingRoom, armchair); s.pops = []; for (let i = 0; i < 9; i++) { const b = ball(0.05, '#fff6d8'); outline(b, { px: 1.6 }); s.stage.add(b); s.pops.push(b); } return s; },
  draw(s, t, info) { s.tv.setScreen('mask', t + 5); const d = at(info, 'character.', info.dur * 0.55) - 0.1; const j = ease.outBack(prog(t, d, d + 0.25));
    const look1 = prog(t, 0.1, 0.4) * (1 - prog(t, 0.55, 0.75));
    s.V.pose(addPose(POSE.sit, { ...idle(t, 2, 0.5), headTurn: -0.5 * look1, bob: j * 0.18, lean: -j * 0.2, armL: [0.55 + j * 0.9, 0.3 + j * 0.6, 0], armR: [0.55 + j * 0.9, 0.3 + j * 0.6, 0] }));
    s.V.face(mixExpr(EXPR.bored, EXPR.shocked, j), t); s.bowl.position.set(-0.05, 0.98 + j * 0.25, 0.75); s.bowl.rotation.z = j * 0.8; popcornFly(s.stage, s.pops, [-0.05, 1.2, 0.75], Math.max(0, t - d) * 1.0);
    camMove(s.stage, t, [[0, { pos: [3.0, 2.0, 4.6], look: [-0.5, 1.45, 0.2], fov: 30 }], [info.dur, { pos: [2.7, 1.95, 4.1], look: [-0.5, 1.5, 0.2], fov: 30 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: d, amp: 0.04, dur: 0.3 }]); },
  overlay(g, t, info, s) { const d = at(info, 'character.', info.dur * 0.55) - 0.1; chip(g, '80s TV CHARACTER', 540, 360, t - at(info, '80s', 0.3), { size: 58, color: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'question', on: 'V', at: 0.2, until: d }, { fx: 'exclaim', on: 'V', at: d, until: d + 0.8 }, { fx: 'sweat', on: 'V', at: d + 0.2 }]); },
});
// s07 "Behind him, a swiveling sheet of metal," — wide: the background is literally a sheet of corrugated metal, swiveling
registerShot('s07', { kind: '3d',
  init(T) { return broadcastScene(T); },
  draw(s, t, info) { bcDraw(s, t + 3.4, 0.8, 1.5); camMove(s.stage, t, [[0, { pos: [4.6, 3.0, 9.0], look: [0, 2.3, -1.5], fov: 40 }], [info.dur, { pos: [3.6, 2.9, 8.6], look: [0, 2.4, -1.8], fov: 40 }]]); },
  overlay(g, t, info, s) { vhs(g, t + 3, 0.45); const p = anchor(s.stage, [-2.2, 3.4, -3.2]); callout(g, 'SHEET METAL', 300, 340, p.x, p.y, t - at(info, 'sheet', 0.5), { rot: -3, color: '#c9ccd2' }); },
});
// s08 "mimicking the character's fancy background." — INSERT (versus): FANCY HIGH-TECH BACKGROUND vs ONE SHEET OF METAL
insertShot('s08', { scene: { init: (T) => broadcastScene(T), draw: (s, t) => { bcDraw(s, t + 5, 0.8, 1.5); camMove(s.stage, t, [[0, { pos: [0, 2.4, 9], look: [0, 2.4, -1], fov: 40 }], [3, { pos: [0, 2.4, 8.4], look: [0, 2.4, -1], fov: 40 }]]); } },
  insert: { type: 'versus', title: 'THE BACKGROUND', lines: ['FANCY HIGH-TECH', 'SHEET OF METAL'], colorL: '#2a6fd6', color: '#7a7e8a' } });
// s09 "No voice. Just a loud buzz." — the viewer plugs his ears as the TV buzzes; BZZZT bursts
registerShot('s09', { kind: '3d',
  init(T) { return roomScene(T, livingRoom, armchair); },
  draw(s, t, info) { s.tv.setScreen('mask', t + 7); const k = ease.out(prog(t, at(info, 'buzz.', 0.8) - 0.2, at(info, 'buzz.', 0.8) + 0.1));
    s.V.pose(addPose(mixPose(POSE.sit, { ...POSE.sit, armL: [0.3, 1.6, 0.4], elbowL: 2.4, armR: [0.3, 1.6, 0.4], elbowR: 2.4, headNod: 0.1 }, k), tremble(t, k)));
    s.V.face(mixExpr(EXPR.suspicious, { ...EXPR.panic, mouth: 'teeth' }, k), t); s.bowl.position.set(-0.05, 0.98, 0.75);
    camMove(s.stage, t, [[0, { pos: [2.9, 2.0, 4.2], look: [-0.5, 1.5, 0.2], fov: 28 }], [info.dur, { pos: [2.6, 1.95, 3.8], look: [-0.5, 1.55, 0.2], fov: 28 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.02, dur: info.dur }]); },
  overlay(g, t, info, s) { chip(g, 'NO VOICE', 540, 360, t - 0.05, { size: 66, color: '#ffffff', rot: -4 }); buzzText(g, t - at(info, 'buzz.', 0.8) + 0.3, { x: 540, y: 820, r: 320, size: 84, on: t > at(info, 'loud', 0.5) ? 1 : 0 }); },
});
// s10 "Then engineers switched frequencies, and he vanished." — control room: SLAM the frequency lever, monitors flip back, sweat wipe
function ctlScene(T) { const st = toonStage(T, { light: 'warm', fov: 32, shadowSize: 6, target: [0.5, 1.2, 0], exposure: 1.0 }); const set = controlRoom(st);
  const En = engineer(); headphones(En); En.position.set(2.15, 0, 0.35); En.rotation.y = -0.5; st.add(En); return { stage: st, set, En }; }
registerShot('s10', { kind: '3d',
  init(T) { return ctlScene(T); },
  draw(s, t, info) { s.set.update(t); const sw = at(info, 'switched', 0.6), v = at(info, 'vanished.', info.dur - 0.6);
    const pull = ease.outBack(prog(t, sw, sw + 0.3)); s.set.lever.rotation.x = lerp(-0.6, 0.7, pull);
    s.set.mons.forEach((m, i) => m.setScreen(t < v - 0.1 ? 'mask' : (t < v + 0.15 ? 'static' : 'sports'), t + i));
    const wipe = prog(t, v + 0.25, v + 0.8);
    s.En.pose(addPose(mixPose({ ...POSE.stand, armR: [1.0, 0.1, 0], elbowR: 0.6 }, { ...POSE.stand, armR: [0.4, 0.1, 0], elbowR: 0.4, lean: 0.15 }, pull), { armL: [wipe > 0 ? 1.3 : 0.05, 0.3, 0.3], elbowL: wipe > 0 ? 2.2 : 0.1, headNod: wipe * 0.1, ...idle(t, 5, 0.4) }));
    s.En.face(t < v ? mixExpr(EXPR.worried, EXPR.angry, pull) : EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [3.6, 2.6, 5.6], look: [0.8, 1.4, -0.4], fov: 34 }], [info.dur, { pos: [3.2, 2.5, 5.0], look: [0.9, 1.45, -0.4], fov: 33 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: sw + 0.15, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { const v = at(info, 'vanished.', info.dur - 0.6); const sw = at(info, 'switched', 0.6); chip(g, 'ENGINEERS', 540, 340, t - 0.05, { size: 62, color: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'exclaim', on: 'En', at: sw, until: sw + 0.6 }, { fx: 'flash', at: sw + 0.15, dur: 0.2 }, { fx: 'sweat', on: 'En', at: v + 0.25 }]); stamp(g, 'GONE', 540, 1240, t - v - 0.1, { size: 96, color: '#2fa84f' }); },
});
// s11 "The sportscaster, live: Well, if you're wondering what's happened... so am I." — back at the desk; shrug + "???" + sweat
registerShot('s11', { kind: '3d',
  init(T) { return studioScene(T); },
  draw(s, t, info) { s.set.mon.setScreen('sports', t + 4); const so = at(info, 'so', info.dur - 0.8), sh = ease.out(prog(t, so - 0.1, so + 0.3));
    s.S.pose(addPose(shrug(POSE.stand, sh), idle(t, 4, 0.5))); s.S.face(mixExpr({ ...EXPR.happy, talk: 0.7 }, { ...EXPR.worried, talk: 0.5 }, prog(t, at(info, 'wondering', 1.2), at(info, 'wondering', 1.2) + 0.4)), t);
    const cut = so - 0.15;
    const c1 = at(info, 'well,', 1.2) - 0.1;
    if (t < c1) camMove(s.stage, t, [[0, { pos: [0.2, 2.1, 7.0], look: [0.1, 1.8, 0], fov: 30 }], [c1, { pos: [0.15, 2.1, 6.6], look: [0.1, 1.85, 0], fov: 30 }]]);
    else if (t < cut) camMove(s.stage, t - c1, [[0, { pos: [-1.6, 2.3, 5.4], look: [0.1, 1.95, 0], fov: 30 }], [cut - c1, { pos: [-1.4, 2.3, 5.0], look: [0.1, 1.95, 0], fov: 30 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0.05, 2.25, 3.6], look: [0, 2.05, 0], fov: 30 }], [info.dur - cut, { pos: [0.05, 2.25, 3.3], look: [0, 2.05, 0], fov: 30 }]]); },
  overlay(g, t, info, s) { const so = at(info, 'so', info.dur - 0.8); chip(g, 'LIVE', 540, 330, t - 0.05, { size: 60, color: '#ff5a4a', ink: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'question', on: 'S', at: so, scale: 1.1 }, { fx: 'sweat', on: 'S', at: so + 0.25 }]); },
});
// s12 "But here's the part... two hours later," — a wall clock whizzes forward two hours; "2 HOURS LATER" stamp
registerShot('s12', {
  draw(g, t, info) { const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#1a1e3a'); gr.addColorStop(1, '#3a2a4a'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
    const tw = at(info, 'two', info.dur * 0.5); const spin = ease.inOut(prog(t, tw - 0.1, tw + 1.0));
    const pulse = 1 + Math.sin(t * 3) * 0.01; g.save(); g.translate(540, 860); g.scale(pulse, pulse); g.translate(-540, -860); clockCard(g, t, 540, 860, 300, { spin, h0: 9.23, dh: 2.1 }); g.restore();
    stamp(g, '2 HOURS LATER', 540, 1330, t - tw - 0.2, { size: 80, color: '#ffd23a' }); },
});
// s13 "he came back. On another station, during Doctor Who." — late night: a sleepy viewer, a sci-fi show... then HIM again
registerShot('s13', { kind: '3d',
  init(T) { return roomScene(T, livingRoom, armchair, { night: true, viewer: { colors: { main: '#6a5aa8', legs: '#3a3a5a' }, seed: 25 } }); },
  draw(s, t, info) { const cb = at(info, 'came', 0.15) + 0.05, dw = at(info, 'Doctor', info.dur - 0.9); const back = t >= dw + 0.35 || t < cb + 0.5 && t >= cb;
    s.tv.setScreen(back ? 'mask' : (t < cb ? 'mask' : 'scifi'), t + 9); const j = ease.outBack(prog(t, dw + 0.4, dw + 0.65));
    s.V.pose(addPose(POSE.sit, { ...idle(t, 7, 0.4), headNod: 0.25 * (1 - j), headTilt: 0.2 * (1 - j), bob: j * 0.2, lean: -j * 0.25, armL: [0.55 + j, 0.2 + j * 0.8, 0], armR: [0.55 + j, 0.2 + j * 0.8, 0] }));
    s.V.face(mixExpr(EXPR.asleep, EXPR.shocked, j), t); s.bowl.position.set(-0.05, 0.98, 0.75);
    const cut = at(info, 'On', 0.9) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [-0.2, 1.75, 0.35], look: [1.6, 1.22, 1.6], fov: 40 }], [cut, { pos: [0.1, 1.62, 0.6], look: [1.6, 1.22, 1.6], fov: 40 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [3.0, 2.0, 4.6], look: [-0.5, 1.45, 0.2], fov: 30 }], [info.dur - cut, { pos: [2.8, 1.95, 4.2], look: [-0.5, 1.5, 0.2], fov: 30 }]]); },
  overlay(g, t, info, s) { const dw = at(info, 'Doctor', info.dur - 0.9), cut = at(info, 'On', 0.9) - 0.1; chip(g, 'HE CAME BACK', 540, 350, t - at(info, 'came', 0.15), { size: 64, color: '#ff5a4a', ink: '#ffffff', rot: -3, });
    if (t > cut) { chip(g, 'LATE-NIGHT SCI-FI', 540, 530, t - cut - 0.1, { size: 52, color: '#ffffff', rot: 2 }); fxr(g, t, s, [{ fx: 'zzz', on: 'V', at: cut, until: dw + 0.4 }, { fx: 'exclaim', on: 'V', at: dw + 0.4, until: dw + 1.2 }]); } },
});
// s14 "This time with sound." — he is TALKING now: sound rings + distortion
registerShot('s14', { kind: '3d',
  init(T) { return broadcastScene(T); },
  draw(s, t, info) { bcDraw(s, t + 7, 1.3); s.man.mask.scale.set(1 + Math.sin(t * 9) * 0.03, 1 - Math.sin(t * 9) * 0.03, 1); camMove(s.stage, t, [[0, { pos: [-0.5, 2.3, 4.6], look: [0, 2.1, 0], fov: 32 }], [info.dur, { pos: [-0.3, 2.25, 4.0], look: [0, 2.1, 0], fov: 32 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.3, amp: 0.02, dur: info.dur }]); },
  overlay(g, t, info, s) { vhs(g, t + 7, 1); const a = anchor(s.stage, s.man); g.save(); g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const k = (t * 1.6 + i / 4) % 1; g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = i % 2 ? '#ffd25a' : '#ff5a4a'; g.lineWidth = 16; for (const sd of [-1, 1]) { g.beginPath(); g.arc(a.cx, a.cy + a.r * 0.3, a.r * (1.3 + k * 2.2), sd > 0 ? -0.6 : Math.PI - 0.6, sd > 0 ? 0.6 : Math.PI + 0.6); g.stroke(); } }
    g.restore(); chip(g, 'WITH SOUND', 540, 340, t - at(info, 'sound.', 0.6), { size: 70, color: '#ffd23a', rot: -4 }); },
});
// s15 "About 90 seconds of distorted, bizarre nonsense." — INSERT (counter): 90 SECONDS of nonsense
insertShot('s15', { scene: { init: (T) => broadcastScene(T), draw: (s, t) => { bcDraw(s, t + 9, 1.4); camMove(s.stage, t, [[0, { pos: [0, 2.3, 6], look: [0, 2.1, 0], fov: 34 }], [3, { pos: [0, 2.3, 5.4], look: [0, 2.1, 0], fov: 34 }]]); }, overlay: (g, t) => vhs(g, t, 1) },
  insert: { type: 'counter', value: 90, from: 0, title: 'ABOUT', suffix: ' SEC', lines: ['of bizarre nonsense'], color: '#ffd23a' }, after: (g, t) => buzzText(g, t, { x: 540, y: 1250, r: 300, size: 56, word: 'BLAH', on: 0.9 }) });
// s16 "And nobody could stop him." — the second station's staff mash buttons; nothing works
registerShot('s16', { kind: '3d',
  init(T) { const s = ctlScene(T); const E2 = engineer({ skin: 'dark', hair: 'bun', hairColor: '#1a1210', colors: { main: '#a85a8a', legs: '#3a3a4a' }, glasses: false, seed: 36 }); E2.position.set(-1.0, 0, 0.5); E2.rotation.y = 0.3; s.stage.add(E2); s.E2 = E2; return s; },
  draw(s, t, info) { s.set.update(t); s.set.mons.forEach((m, i) => m.setScreen('maskTalk', t + i * 0.7)); s.set.lever.rotation.x = -0.6 + Math.abs(Math.sin(t * 9)) * 1.2;
    s.En.pose(addPose(POSE.stand, { armR: [0.9 + Math.sin(t * 18) * 0.25, 0.1, 0], elbowR: 0.7, lean: 0.12, ...tremble(t, 1) })); s.En.face(EXPR.panic, t);
    s.E2.pose(addPose(POSE.panic, tremble(t, 1.2))); s.E2.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.9, 8.6], look: [0.5, 1.4, -0.2], fov: 40 }], [info.dur, { pos: [0.5, 2.8, 8.0], look: [0.5, 1.4, -0.2], fov: 40 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'sweat', on: 'En', at: 0.2 }, { fx: 'sweat', on: 'E2', at: 0.4 }, { fx: 'question', on: 'E2', at: 0.6 }]); stamp(g, "CAN'T STOP HIM", 540, 1250, t - at(info, 'stop', 0.6), { size: 80 }); },
});
// s17 "No engineers were on duty at the tower." — the transmitter room up the tower: an empty chair spins, a tumbleweed rolls by
registerShot('s17', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'night', fov: 34, shadowSize: 6, target: [0, 1, 0], exposure: 1.25, ambient: 1.3 }); const set = towerRoom(st); return { stage: st, set }; },
  draw(s, t, info) { s.set.update(t); s.set.chair.rotation.y = t * 1.6; const x = lerp(-4.5, 4.5, prog(t, 0.2, info.dur)); s.set.tw.position.set(x, 0.34 + Math.abs(Math.sin(t * 5)) * 0.25, 1.4); s.set.tw.rotation.z = -t * 5;
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 7.5], look: [0, 1.4, 0], fov: 34 }], [info.dur, { pos: [0, 2.15, 6.9], look: [0, 1.45, 0], fov: 34 }]]); },
  overlay(g, t, info) { chip(g, 'THE TOWER', 540, 340, t - 0.05, { size: 62, color: '#ffffff', rot: -3 }); stamp(g, 'NO ENGINEERS ON DUTY', 540, 1250, t - at(info, 'duty', 0.9), { size: 64 }); },
});
// s18 "The FCC investigated." — a generic investigator with a magnifying glass at a corkboard of "?" notes
function caseScene(T) { const st = toonStage(T, { light: 'warm', fov: 32, shadowSize: 6, target: [0, 1.4, 0], exposure: 1.0 }); const set = caseOffice(st);
  const I = investigator(); I.position.set(-0.6, 0, -1.2); st.add(I); const mg = magnifier(); st.add(mg); return { stage: st, set, I, mg }; }
const v3 = new THREE.Vector3();
function holdMag(s) { s.I.updateWorldMatrix(true, true); s.I.parts.arms ? null : null; const h = s.I.hand?.R || s.I.parts.arms?.R?.hand; h.getWorldPosition(v3); s.mg.position.set(v3.x, v3.y + 0.42, v3.z + 0.05); }
registerShot('s18', { kind: '3d',
  init(T) { return caseScene(T); },
  draw(s, t, info) { s.I.rotation.y = Math.PI + Math.sin(t * 1.2) * 0.25; s.I.pose(addPose(POSE.stand, { armR: [1.3, -0.1, 0], elbowR: 0.9, headTurn: Math.sin(t * 2) * 0.3, lean: 0.1, ...idle(t, 6, 0.4) })); s.I.face(EXPR.suspicious, t); holdMag(s);
    camMove(s.stage, t, [[0, { pos: [2.2, 2.4, 5.6], look: [-0.3, 2.3, -2.0], fov: 34 }], [info.dur, { pos: [1.8, 2.4, 5.0], look: [-0.3, 2.35, -2.0], fov: 34 }]]); },
  overlay(g, t, info) { chip(g, 'FCC INVESTIGATES', 540, 340, t - at(info, 'FCC', 0.1), { size: 60, color: '#ffd23a', rot: -3 }); },
});
// s19 "To this day..." — comic beat of silence: he turns to camera, shrugs, "???"
registerShot('s19', { kind: '3d',
  init(T) { return caseScene(T); },
  draw(s, t, info) { const k = ease.inOut(prog(t, 0.1, 0.6)), sh = ease.out(prog(t, 0.7, 1.0)); s.I.rotation.y = lerp(Math.PI, 0.2, k); s.I.position.set(-0.6, 0, lerp(-1.2, -0.6, k));
    s.I.pose(addPose(shrug(POSE.stand, sh), idle(t, 6, 0.4))); s.I.face(mixExpr(EXPR.suspicious, EXPR.deadpan, k), t); holdMag(s);
    camMove(s.stage, t, [[0, { pos: [0.8, 2.3, 4.6], look: [-0.5, 2.0, -0.6], fov: 32 }], [info.dur, { pos: [0.7, 2.3, 4.2], look: [-0.5, 2.05, -0.6], fov: 32 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'question', on: 'I', at: 0.8, scale: 1.1 }]); chip(g, 'STILL UNSOLVED', 540, 1260, t - 0.9, { size: 64, color: '#ff5a4a', ink: '#ffffff', rot: -3 }); },
});
// s20 "nobody knows who was under the mask." — PAYOFF: back to him; push in on the mask; "???" over HIS head too
registerShot('s20', { kind: '3d',
  init(T) { return broadcastScene(T); },
  draw(s, t, info) { bcDraw(s, t - info.dur - 1.3, 1); camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 8.6], look: [0, 2.1, 0], fov: 36 }], [info.dur, { pos: [0.15, 2.2, 7.0], look: [0, 2.07, 0], fov: 35 }]], ease.out); },
  overlay(g, t, info, s) { vhs(g, t, 1); const m = at(info, 'mask.', info.dur - 0.6); stamp(g, 'WHO?', 540, 1240, t - m, { size: 110, color: '#ff5a4a' }); fxr(g, t, s, [{ fx: 'question', on: 'man', at: m + 0.05, until: info.dur - 0.05, scale: 0.9 }]); },
});
// s21 "Subscribe for more." — closer, lands on frame 1's camera + pose -> loop
registerShot('s21', { kind: '3d',
  init(T) { return broadcastScene(T); },
  draw(s, t, info) { const tl = t - info.dur; bcDraw(s, tl); camMove(s.stage, t, [[0, { pos: [0.15, 2.2, 7.0], look: [0, 2.07, 0], fov: 35 }], [info.dur, F1]], ease.inOut); shakeCam(s.stage, tl, [{ fx: 'shake', at: 0, amp: 0.01, dur: 1 }]); },
  overlay(g, t, info) { vhs(g, t - info.dur, 1); },
});
