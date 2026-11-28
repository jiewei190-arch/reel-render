// The Bloop — 24 shots, Toon 3D + BEANMEN FX. Deadpan narrator; the jokes are in the pictures. Every gag shows a real fact.
// s01 = frame 1: deep dark water, the toon sea monster looming, sound rings pulsing out (the synthesized low sweep plays from 0 s),
// a little fish does a double take, 2-line top caption 0-3.5 s. s24 (closer) ends on frame 1's exact camera with the monster back
// in place -> loop. The reveal (s18-s22): the "monster" drops its tentacles: it was an iceberg all along.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, shake, tremble } from '/kits/toon3d/rig.js';
import { shakeCam, anchor, project } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { softTint } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, seaStage, waterLook, fish, chip, stamp, fxr, richLine, seaMonster, iceberg, hydrophone, volcano, blueWhale, scientist, headphones,
  tapeMachine, labSet, glacierSet, penguin, topCaption, rings, scopeCard, pacificCard, glowAt, vignette, TXT, CARD_INK, RED, GOLD, ICE, cyl, ball, rbox, toon, flat,
} from './_lib.js';

const gt = (info, t) => info.shot.start + t;
const TOP = (g, info, t) => topCaption(g, gt(info, t), richLine);
const DEEP = { bg: ['#0a2a58', '#051a3a', '#020814'], fog: [14, 60, '#041634'], ambient: 0.95, key: ['#9fd0ff', 1.6, [-4, 12, 6]], fill: ['#3a8aff', 0.5, [6, 3, 8]] };

// ---------------------------------------------------------------- the deep (frame 1 lives here)
function deepScene(T, o = {}) {
  const s = seaStage(T, { dark: true, fov: 42, seed: o.seed || 4, weeds: 10, clear: 6, shadowSize: 16, target: [0, 3, -6], stage: DEEP });
  s.m = seaMonster(); s.m.position.set(0, 0, -7); s.stage.add(s.m);
  s.ice = iceberg(); s.ice.position.set(0, -0.6, -7); s.ice.visible = false; s.stage.add(s.ice);
  s.f = fish({ color: '#ffb03a', seed: 3 }); s.f.position.set(1.4, 2.4, 2.2); s.f.rotation.y = -Math.PI / 2 - 0.3; s.stage.add(s.f);
  return s;
}
const F1 = { pos: [0, 3.0, 9.0], look: [0, 4.2, -6], fov: 44 }, F1b = { pos: [0, 3.0, 8.2], look: [0, 4.3, -6], fov: 44 };
const fishTake = (s, t, t0) => { const k = ease.outBack(prog(t, t0, t0 + 0.25)); s.f.update(t, { lid: k > 0.5 ? 0 : 0.3, look: [k > 0.5 ? -1 : 0, 0] }); s.f.rotation.y = -Math.PI / 2 - 0.3 + k * 1.0; s.f.position.x = 1.4 + Math.sin(t * 1.2) * 0.1 + k * 0.4; };

// s01 — FRAME 1 "In 1997, the ocean made a noise": the monster looms, rings pulse, the fish double-takes
registerShot('s01', { kind: '3d',
  init(T) { return deepScene(T); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t, { lid: 0.1, mouth: 'grin' }); fishTake(s, t, 0.9);
    camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.012, dur: 99 }]); },
  overlay(g, t, info, s) { waterLook(g, t, { k: 0.08 }); const q = anchor(s.stage, s.m); rings(g, t, q.cx, q.cy, { period: 1.0, r1: 900, a: 0.6 }); vignette(g, 0.4); TOP(g, info, t);
    fxr(g, t, s, [{ fx: 'exclaim', on: 'f', at: 1.0, color: RED }]); },
});
// s02 — "nobody could explain." a scientist with headphones: ??? and a shrug
function labScene(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 7, target: [0, 1.2, -0.5] }); const set = labSet(st);
  const S = scientist(); headphones(S); S.position.set(0.2, 0, 0.4); st.add(S); const tm = tapeMachine(); tm.position.set(-1.0, 0.97, -1.3); tm.rotation.y = 0.2; st.add(tm); return { stage: st, set, S, tm }; }
registerShot('s02', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.tm.update(t); s.S.pose(addPose(shrug(POSE.stand, ease.outBack(prog(t, 0.25, 0.55))), idle(t, 3))); s.S.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 5.6], look: [0.1, 2.25, -0.3], fov: 38 }], [info.dur, { pos: [0.4, 2.35, 5.1], look: [0.1, 2.25, -0.3], fov: 38 }]]); },
  overlay(g, t, info, s) { TOP(g, info, t); fxr(g, t, s, [{ fx: 'question', on: 'S', at: 0.15 }]); },
});

// ---------------------------------------------------------------- the hydrophone
function phoneScene(T, o = {}) { const s = seaStage(T, { dark: true, fov: 40, seed: o.seed || 7, weeds: 14, clear: 3, stage: { ...DEEP, ambient: 1.15 } });
  s.h = hydrophone(); s.h.position.set(0, 0, 0); s.stage.add(s.h); s.v = volcano(); s.v.position.set(4.5, 0, -5); s.stage.add(s.v);
  s.fs = [0, 1, 2].map(i => { const f = fish({ color: ['#ffb03a', '#ff7a8a', '#7ad0ff'][i], seed: i + 5 }); f.position.set(-2 + i * 1.6, 3 + i * 0.5, -1 - i); f.rotation.y = Math.PI / 2; s.stage.add(f); return f; }); return s; }
// s03 — "Underwater microphones were listening" the hydrophone on its cable, HYDROPHONE chip
registerShot('s03', { kind: '3d',
  init(T) { return phoneScene(T); },
  draw(s, t, info) { s.sea.update(t); s.h.update(t); s.fs.forEach((f, i) => { f.update(t); f.position.x = -3 + ((t * 0.6 + i * 1.6) % 7); });
    camMove(s.stage, t, [[0, { pos: [2.0, 2.8, 8.0], look: [0, 2.8, 0], fov: 40 }], [info.dur, { pos: [1.6, 2.7, 7.0], look: [0, 2.8, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { waterLook(g, t, { k: 0.1 }); vignette(g, 0.25); chip(g, 'HYDROPHONE = UNDERWATER MIC', E.W / 2, 520, t - 0.1, { size: 50, color: GOLD }); },
});
// s04 — "for volcanoes in the Pacific." a tiny undersea volcano burps bubbles; LISTENING FOR VOLCANOES
registerShot('s04', { kind: '3d',
  init(T) { return phoneScene(T, { seed: 9 }); },
  draw(s, t, info) { s.sea.update(t); s.h.update(t); s.fs.forEach(f => (f.visible = false));
    camMove(s.stage, t, [[0, { pos: [1.6, 2.6, 3.6], look: [4.2, 1.3, -5], fov: 40 }], [info.dur, { pos: [1.9, 2.5, 2.8], look: [4.3, 1.3, -5], fov: 40 }]]); },
  overlay(g, t, info, s) { waterLook(g, t, { k: 0.1 }); vignette(g, 0.25); const q = project(s.stage, [4.5, 1.9, -5]);
    for (let i = 0; i < 8; i++) { const a = ((t * 0.8 + i / 8) % 1); g.save(); g.globalAlpha = 1 - a; g.strokeStyle = '#e8fbff'; g.lineWidth = 4; g.beginPath(); g.arc(q.x + Math.sin(i * 7 + t * 3) * 25, q.y - a * 420, 10 + i % 3 * 6, 0, 7); g.stroke(); g.restore(); }
    chip(g, 'LISTENING FOR VOLCANOES', E.W / 2, 520, t - at(info, 'volcanoes', 0.5) + 0.15, { size: 56, color: '#ff9a5a' }); },
});
// s05 — "Instead, they caught... this." giant rings slam the hydrophone; fish scatter; the sweep plays in the beat
registerShot('s05', { kind: '3d',
  init(T) { return phoneScene(T); },
  draw(s, t, info) { s.sea.update(t); const hit = at(info, 'this', 0.9) - 0.1; s.hit = hit; const k = prog(t, hit, hit + 0.3); s.h.update(t, { shake: k });
    s.fs.forEach((f, i) => { f.update(t, { lid: k > 0 ? 0 : 0.3 }); f.rotation.y = k > 0 ? -Math.PI / 2 : Math.PI / 2; f.position.x = -2 + i * 1.6 - Math.max(0, t - hit) * 6 * (k > 0 ? 1 : 0); });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 6.0], look: [0, 2.4, 0], fov: 42 }], [info.dur, { pos: [0.3, 2.4, 5.2], look: [0, 2.4, 0], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.05, dur: 2.5 }]); },
  overlay(g, t, info, s) { waterLook(g, t, { k: 0.1 }); vignette(g, 0.25); if (t > s.hit) { rings(g, t - s.hit, E.W * 0.15, E.H * 0.42, { period: 1.1, r1: 1300, w: 22, a: 0.8 }); }
    fxr(g, t, s, [{ fx: 'exclaim', on: 'h', at: s.hit + 0.1, color: RED }]); },
});

// ---------------------------------------------------------------- the sound
// s06 — "Ultra-low, extremely loud," INSERT 1: oscilloscope — a slow wave that grows huge
registerShot('s06', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.tm.update(t); s.S.pose(addPose(POSE.stand, idle(t, 3))); s.S.face(EXPR.shocked, t); camMove(s.stage, t, [[0, { pos: [0, 2.3, 5.0], look: [0, 1.8, -0.5], fov: 40 }], [info.dur, { pos: [0, 2.3, 4.6], look: [0, 1.8, -0.5], fov: 40 }]]);
    s.L = at(info, 'loud', 0.8); shakeCam(s.stage, t, [{ fx: 'shake', at: s.L, amp: 0.04, dur: 0.4 }]); },
  overlay(g, t, info, s) { dimScene(g, 8, 0.5); const amp = lerp(0.2, 1.25, ease.outBack(prog(t, s.L - 0.1, s.L + 0.3))); scopeCard(g, t, { amp, freq: 1.1, y: 900 });
    chip(g, 'ULTRA-LOW', E.W / 2 - 200, 480, t - 0.1, { size: 58, color: '#9fe8ff', rot: -4 }); chip(g, 'EXTREMELY LOUD', E.W / 2 + 150, 1215, t - s.L, { size: 62, color: RED, ink: '#ffffff', rot: 3 }); },
});
// s07 — "and about a minute long." the scientist taps a stopwatch-y wall clock; ~1 MINUTE
registerShot('s07', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.tm.update(t); s.S.pose(addPose(POSE.thinking, idle(t, 3))); s.S.face(EXPR.suspicious, t);
    camMove(s.stage, t, [[0, { pos: [1.4, 2.3, 4.2], look: [0.2, 2.0, 0], fov: 38 }], [info.dur, { pos: [1.3, 2.3, 3.8], look: [0.2, 2.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { const k = clamp(t / Math.max(0.5, info.dur - 0.2)); g.save(); g.translate(E.W / 2, 560); g.lineWidth = 26; g.strokeStyle = CARD_INK; g.fillStyle = '#f6f1e0'; g.beginPath(); g.arc(0, 0, 150, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = RED; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 150, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.stroke(); g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-Math.PI / 2 + k * Math.PI * 2) * 110, Math.sin(-Math.PI / 2 + k * Math.PI * 2) * 110); g.stroke(); g.restore();
    chip(g, '~1 MINUTE', E.W / 2, 780, t - at(info, 'minute', 0.5) + 0.1, { size: 64 }); },
});
// s08 — "Sped up 16 times so humans could hear it," fast-forward on the tape machine; ►► x16
registerShot('s08', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.tm.update(t, t > 0.3 ? 9 : 1); s.S.position.set(-0.4, 0, -0.3); s.S.rotation.y = -0.4; s.S.pose(addPose(POSE.stand, { ...idle(t, 3), armR: [1.2, 0.1, 0.2], elbowR: 0.6 })); s.S.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 1.9, 2.4], look: [-1.0, 1.4, -1.3], fov: 38 }], [info.dur, { pos: [-0.65, 1.85, 2.1], look: [-1.0, 1.4, -1.3], fov: 37 }]]); },
  overlay(g, t, info, s) { const k = ease.outBack(clamp((t - at(info, '16', 0.4)) / 0.25)); if (k > 0) { g.save(); g.translate(E.W / 2, 520); g.scale(k, k); g.rotate(-0.06); TXT(g, '►► x16', 0, 0, 150, { color: GOLD, stroke: CARD_INK }); g.restore(); }
    chip(g, 'SO HUMANS CAN HEAR IT', E.W / 2, 690, t - at(info, 'humans', 0.9), { size: 52, color: '#ffffff' }); },
});
// s09 — "it went... bloop." deadpan close on the scientist; a single bubble pops out of the speaker: BLOOP
registerShot('s09', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.tm.update(t); s.S.pose(addPose(POSE.stand, idle(t, 3))); s.b = at(info, 'bloop', info.dur - 0.7) - 0.05; s.S.face(t > s.b + 0.2 ? { ...EXPR.deadpan, pupil: [0, 0] } : EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.35, 2.6], look: [0.2, 2.1, 0.4], fov: 36 }], [info.dur, { pos: [0.3, 2.35, 2.4], look: [0.2, 2.1, 0.4], fov: 36 }]]); },
  overlay(g, t, info, s) { const a = t - s.b; if (a > 0) { const k = ease.outBack(clamp(a / 0.35)); const y = 1150 - a * 260; g.save(); g.globalAlpha = clamp(1.6 - a); g.translate(330, y); g.scale(k, k);
      g.fillStyle = 'rgba(200,240,255,0.45)'; g.strokeStyle = '#e8fbff'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 120, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(-40, -45, 26, 16, -0.6, 0, 7); g.fill(); g.restore();
      stamp(g, 'BLOOP', E.W / 2, 520, a - 0.1, { size: 140, color: '#2f8ad0' }); } },
});

// ---------------------------------------------------------------- where
// s10 — "Sensors about 3,000 miles apart picked it up," INSERT 2: the Pacific map card, two sensors, ~3,000 MILES
registerShot('s10', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.S.pose(addPose(POSE.stand, idle(t, 3))); s.S.face(EXPR.neutral, t); camMove(s.stage, t, [[0, { pos: [0, 2.3, 5.0], look: [0, 1.8, -0.5], fov: 40 }], [info.dur, { pos: [0, 2.3, 4.6], look: [0, 1.8, -0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.6); pacificCard(g, t, { ringAt: 0.2, distAt: at(info, '3,000', 0.6) - 0.1 }); },
});
// s11 — "from the remote South Pacific." the map zooms to the X
registerShot('s11', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.S.pose(addPose(POSE.stand, idle(t, 3))); camMove(s.stage, t, [[0, { pos: [0, 2.3, 4.6], look: [0, 1.8, -0.5], fov: 40 }], [info.dur, { pos: [0, 2.3, 4.4], look: [0, 1.8, -0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.6); const z = lerp(1, 1.45, ease.inOut(clamp(t / 0.8))); pacificCard(g, t + 2, { ringAt: 0, distAt: 0, xAt: 2.05, zoom: z, pan: [lerp(0, 20, z - 1), lerp(0, 160, (z - 1) / 0.45)] });
    chip(g, 'REMOTE SOUTH PACIFIC', E.W / 2, 1225, t - at(info, 'remote', 0.4), { size: 56, color: GOLD }); },
});

// ---------------------------------------------------------------- louder than a whale
function whaleScene(T) { const s = seaStage(T, { fov: 40, seed: 11, weeds: 8, clear: 8 }); s.w = blueWhale(); s.w.position.set(-0.5, 4.0, -4); s.w.rotation.y = -0.25; s.stage.add(s.w); return s; }
// s12 — "Reportedly, it was far louder than a blue whale," the whale sings proudly, a little ring
registerShot('s12', { kind: '3d',
  init(T) { return whaleScene(T); },
  draw(s, t, info) { s.sea.update(t); s.w.update(t, { lid: 0.35, mouth: 'o' }); camMove(s.stage, t, [[0, { pos: [6.5, 3.8, 9], look: [2.4, 4.0, -4], fov: 44 }], [info.dur, { pos: [6.0, 3.9, 8.2], look: [2.4, 4.0, -4], fov: 44 }]]); },
  overlay(g, t, info, s) { waterLook(g, t); const q = project(s.stage, [4.2, 3.7, -3]); rings(g, t, q.x, q.y, { n: 3, period: 0.8, r1: 180, w: 10, color: '#ffffff' });
    chip(g, 'REPORTEDLY', E.W / 2, 480, t - 0.1, { size: 50, color: '#ffffff' }); chip(g, 'BLUE WHALE', E.W / 2, 1225, t - at(info, 'blue', 1.2), { size: 60, color: '#7ad0ff' }); },
});
// s13 — "the loudest known animal." a giant BLOOP ring dwarfs the whale's; the whale sweats, jaw drops
registerShot('s13', { kind: '3d',
  init(T) { return whaleScene(T); },
  draw(s, t, info) { s.sea.update(t); s.w.update(t, { lid: t > 0.3 ? 0 : 0.35, mouth: 'o', look: [-0.5, 0.2] });
    camMove(s.stage, t, [[0, { pos: [5.0, 4.2, 4.0], look: [2.4, 4.0, -3.5], fov: 40 }], [info.dur, { pos: [4.6, 4.2, 3.4], look: [2.4, 4.0, -3.5], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.25, amp: 0.04, dur: 0.5 }]); },
  overlay(g, t, info, s) { waterLook(g, t); rings(g, t, -200, 700, { n: 4, period: 1.2, r1: 1700, w: 28, a: 0.7, color: '#bfeaff' });
    chip(g, 'LOUDEST KNOWN ANIMAL', E.W / 2, 480, t - at(info, 'loudest', 0.4) + 0.05, { size: 56, color: GOLD }); fxr(g, t, s, [{ fx: 'sweat', on: 'w', at: 0.35 }]); },
});

// ---------------------------------------------------------------- the guess
// s14 — "So people guessed:" three people with a thought bubble ???
registerShot('s14', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 7, target: [0, 1.2, 0] }); labSet(st); const P = [0, 1, 2].map(i => { const b = scientist({ skin: ['light', 'tan', 'brown'][i], hair: ['swoop', 'bob', 'horseshoe'][i], glasses: i !== 1, seed: 50 + i }); b.position.set(-1.3 + i * 1.3, 0, 1.0 - (i % 2) * 0.4); b.rotation.y = (1 - i) * 0.2; st.add(b); return b; }); return { stage: st, P }; },
  draw(s, t, info) { s.P.forEach((b, i) => { b.pose(addPose(POSE.thinking, idle(t, i + 2))); b.face(EXPR.suspicious, t); }); camMove(s.stage, t, [[0, { pos: [0, 2.3, 6.4], look: [0, 1.9, 0.6], fov: 40 }], [info.dur, { pos: [0, 2.3, 5.8], look: [0, 1.9, 0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'question', on: s.P[0], at: 0.1 }, { fx: 'question', on: s.P[1], at: 0.25 }, { fx: 'question', on: s.P[2], at: 0.4 }]); },
});
// s15 — "a giant sea creature nobody had ever seen." the monster, dramatic low angle, lightning-ish flash; GIANT SEA CREATURE?
registerShot('s15', { kind: '3d',
  init(T) { return deepScene(T, { seed: 6 }); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t, { lid: 0, mouth: 'grin', wave: 1.6 }); s.f.visible = false;
    camMove(s.stage, t, [[0, { pos: [1.5, 0.8, 4.5], look: [0, 5.2, -7], fov: 50 }], [info.dur, { pos: [1.2, 0.7, 3.6], look: [0, 5.4, -7], fov: 50 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'giant', 0.1), amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { waterLook(g, t, { k: 0.06 }); vignette(g, 0.45); chip(g, 'GIANT SEA CREATURE?', E.W / 2, 1225, t - at(info, 'creature', 0.4), { size: 58, color: '#7affb0' });
    fxr(g, t, s, [{ fx: 'flash', at: at(info, 'giant', 0.1), dur: 0.15 }]); },
});

// ---------------------------------------------------------------- the reveal
// s16 — "But here's the part..." slow push on the monster in the dark (silence beat)
registerShot('s16', { kind: '3d',
  init(T) { return deepScene(T, { seed: 6 }); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t, { lid: 0.3, mouth: 'line', wave: 0.6 }); s.f.visible = false;
    camMove(s.stage, t, [[0, { pos: [0, 4.6, 14], look: [0, 4.8, -7], fov: 42 }], [info.dur, { pos: [0, 4.8, 10.5], look: [0, 5.0, -7], fov: 42 }]], ease.inOut); },
  overlay(g, t, info, s) { vignette(g, 0.6); },
});
// s17 — "in 2005, NOAA found the source." the scientist with a magnifier at the spectrogram; 2005 stamp; FOUND IT
registerShot('s17', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { s.tm.update(t); const f = at(info, 'found', 0.8); const k = ease.outBack(prog(t, f, f + 0.3)); s.S.pose(addPose(mixPose(POSE.thinking, { ...POSE.stand, armR: [2.6, 0.2, 0], elbowR: 0.2 }, k), idle(t, 3))); s.S.face(k > 0.5 ? EXPR.happy : EXPR.suspicious, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 5.0], look: [0.1, 1.9, -0.3], fov: 38 }], [info.dur, { pos: [0.5, 2.35, 4.4], look: [0.1, 1.9, -0.3], fov: 38 }]]); s.fd = f; },
  overlay(g, t, info, s) { stamp(g, '2005', E.W / 2, 480, t - at(info, '2005', 0.2) + 0.05, { size: 120, color: '#2f6ad0' }); fxr(g, t, s, [{ fx: 'exclaim', on: 'S', at: s.fd + 0.05, color: GOLD }, { fx: 'sparkle', on: 'S', at: s.fd + 0.1 }]); },
});
// s18 — "Not a sea monster." light hits the monster: its tentacles drop away — it's an iceberg wearing them
registerShot('s18', { kind: '3d',
  init(T) { const s = deepScene(T, { seed: 6 }); return s; },
  draw(s, t, info) { s.sea.update(t); s.f.visible = false; const c = ease.in(prog(t, 0.25, 0.9)); s.m.update(t, { lid: lerp(0, 0.9, c), mouth: 'frown', costume: c, wave: 1 - c });
    s.m.body.children.forEach(ch => { if (ch !== s.m.head && !s.m.tents.some(tn => tn.root === ch)) ch.visible = c < 0.6; }); s.m.head.material.opacity = 1;
    s.ice.visible = c > 0.5; s.m.head.visible = c < 0.6; s.ice.update(t, { eyes: 1 });
    camMove(s.stage, t, [[0, { pos: [0, 4.0, 11], look: [0, 4.8, -7], fov: 44 }], [info.dur, { pos: [0, 4.0, 10], look: [0, 4.8, -7], fov: 44 }]]); },
  overlay(g, t, info, s) { const q = anchor(s.stage, s.m); glowAt(g, q.cx, q.cy, 700, '#bfeaff', 0.55 * clamp((t - 0.2) / 0.3)); stamp(g, 'NOT A SEA MONSTER', E.W / 2, 480, t - at(info, 'monster', 0.6) + 0.1, { size: 76 }); },
});
// s19 — "An icequake." the iceberg shakes; ICEQUAKE stamp
registerShot('s19', { kind: '3d',
  init(T) { const s = deepScene(T, { seed: 6 }); s.m.visible = false; s.ice.visible = true; return s; },
  draw(s, t, info) { s.sea.update(t); s.f.visible = false; s.ice.update(t, { eyes: 1, shake: prog(t, 0.1, 0.3), crack: prog(t, 0.2, 0.9) });
    camMove(s.stage, t, [[0, { pos: [0.5, 3.6, 8.5], look: [0, 4.8, -7], fov: 44 }], [info.dur, { pos: [0.4, 3.6, 7.6], look: [0, 4.8, -7], fov: 44 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.1, amp: 0.05, dur: 1.2 }]); },
  overlay(g, t, info, s) { vignette(g, 0.3); stamp(g, 'ICEQUAKE', E.W / 2, 480, t - at(info, 'icequake', 0.3) + 0.05, { size: 120, color: '#2f8ad0' }); },
});
// s20 — "An iceberg, cracking" Antarctica: the glacier front; a crack runs; penguins double-take
function iceScene(T) { const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 20, target: [0, 2, -4], bg: ['#5aa8e8', '#a8d8f4', '#eaf6ff'] }); const set = glacierSet(st);
  const P = [0, 1, 2].map(i => { const p = penguin({ seed: i + 1 }); p.position.set(-5.2 + i * 0.9, 0.6, 6 + (i % 2) * 0.4); p.rotation.y = 0.6; st.add(p); return p; }); return { stage: st, set, P }; }
registerShot('s20', { kind: '3d',
  init(T) { return iceScene(T); },
  draw(s, t, info) { const c = at(info, 'cracking', 0.4); s.P.forEach((p, i) => { p.update(t, { lid: t > c + 0.1 ? 0 : 0.3, turn: t > c + 0.15 + i * 0.05 ? 0.8 : 0 }); });
    camMove(s.stage, t, [[0, { pos: [-6, 4, 16], look: [0, 5, -4], fov: 46 }], [info.dur, { pos: [-5.5, 3.8, 14.5], look: [0, 5, -4], fov: 46 }]]); s.c = c; },
  overlay(g, t, info, s) { const q = project(s.stage, [2, 10.4, -1.7]), q2 = project(s.stage, [2, 0.5, -1.7]); const k = clamp((t - s.c) / 0.5);
    if (k > 0) { g.save(); g.strokeStyle = '#0a2a4a'; g.lineWidth = 8; g.beginPath(); g.moveTo(q.x, q.y); for (let i = 1; i <= 8; i++) { const y = lerp(q.y, q2.y, i / 8 * k); g.lineTo(q.x + (i % 2 ? 22 : -18), y); } g.stroke(); g.restore(); }
    fxr(g, t, s, [{ fx: 'exclaim', on: s.P[1], at: s.c + 0.15, color: RED }]); chip(g, 'ANTARCTICA', E.W / 2, 480, t - 0.1, { size: 60, color: '#ffffff' }); },
});
// s21 — "and breaking away from an Antarctic glacier." the chunk tips and crashes into the sea: CRACK! SPLASH; penguins hop
registerShot('s21', { kind: '3d',
  init(T) { return iceScene(T); },
  draw(s, t, info) { const k = ease.in(prog(t, 0.15, 1.1)); s.set.chunk.rotation.x = k * 1.25; s.set.chunk.position.z = -4.2 + k * 3.0; s.set.chunk.position.y = -k * 3.0;
    s.P.forEach((p, i) => p.update(t, { lid: 0, turn: 0.8, jump: prog(t, 1.0 + i * 0.08, 1.4 + i * 0.08) }));
    camMove(s.stage, t, [[0, { pos: [-4, 3.5, 14], look: [1.5, 4, -4], fov: 46 }], [info.dur, { pos: [-3.6, 3.4, 12.8], look: [1.5, 4, -4], fov: 46 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 1.05, amp: 0.07, dur: 0.5 }]); },
  overlay(g, t, info, s) { const a = t - 1.05; if (a > 0) { const q = project(s.stage, [2, 0.5, 0]); for (let i = 0; i < 16; i++) { const an = -Math.PI * (0.1 + 0.8 * i / 15), sp = 500 + (i % 4) * 160; const x = q.x + Math.cos(an) * sp * a, y = q.y + Math.sin(an) * sp * a + 900 * a * a;
      g.save(); g.globalAlpha = clamp(1.2 - a); g.fillStyle = '#e8fbff'; g.strokeStyle = CARD_INK; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 18 + (i % 3) * 8, 0, 7); g.fill(); g.stroke(); g.restore(); }
      const k = ease.outBack(clamp(a / 0.2)); g.save(); g.translate(E.W / 2, 520); g.scale(k, k); g.rotate(-0.08); TXT(g, 'CRACK!', 0, 0, 140, { color: '#ffffff', stroke: CARD_INK }); g.restore(); }
    fxr(g, t, s, [{ fx: 'sweat', on: s.P[0], at: 1.2 }]); },
});
// s22 — PAYOFF "The monster... was ice." back underwater: the iceberg sits exactly where the monster was, crack-eyes glowing
registerShot('s22', { kind: '3d',
  init(T) { const s = deepScene(T); s.m.visible = false; s.ice.visible = true; return s; },
  draw(s, t, info) { s.sea.update(t); s.ice.update(t, { eyes: 1, crack: 1 }); fishTake(s, t, at(info, 'ice', info.dur - 0.6));
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 10.5], look: [0, 4.4, -6], fov: 44 }], [info.dur, F1]], ease.out); },
  overlay(g, t, info, s) { waterLook(g, t, { k: 0.08 }); vignette(g, 0.4); const w = at(info, 'ice', info.dur - 0.6);
    chip(g, 'THE MONSTER = ICE', E.W / 2, 480, t - w + 0.05, { size: 70, color: ICE }); fxr(g, t, s, [{ fx: 'question', on: 'f', at: w + 0.1 }]); },
});
// s23 — closer "Subscribe for more." frame 1's camera; the monster slides back into place over the iceberg -> loops into s01
registerShot('s23', { kind: '3d',
  init(T) { return deepScene(T); },
  draw(s, t, info) { s.sea.update(t); const k = ease.inOut(prog(t, 0.1, info.dur - 0.15)); s.ice.visible = k < 0.5; s.ice.update(t, { eyes: 1 }); s.m.visible = k >= 0.5; s.m.update(t, { lid: 0.1, mouth: 'grin' });
    s.f.update(t, { lid: 0.3 }); s.f.rotation.y = -Math.PI / 2 - 0.3; s.f.position.x = 1.4 + Math.sin(t * 1.2) * 0.1;
    camMove(s.stage, t, [[0, F1], [info.dur, F1]]); },
  overlay(g, t, info, s) { waterLook(g, t, { k: 0.08 }); vignette(g, 0.4); },
});
