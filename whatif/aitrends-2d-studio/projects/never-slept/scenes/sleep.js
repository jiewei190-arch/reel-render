// What If You Never Slept Again? all shots.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, nod, shake, tremble, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, room, randy, friend, scientist, board, calPage, pinball, trophy, PR, THREE, rbox, cyl, toon } from './_lib.js';

const WARM = { rays: false, tint: '#ffcf8a' };
const RAYS = { rays: { from: [70, -80], strength: 0.6 }, tint: '#ffcf8a' };
const WIDE = { ...EXPR.shocked, mouth: 'grin', lower: 0, lid: 0, brow: 0.8, pupilSize: 0.55 };   // forced wide-awake stare
const TIRED = { ...EXPR.deadpan, lid: 0.62, lidAngle: -0.15, brow: -0.1, mouth: 'wavy' };
const V = () => new THREE.Vector3();

// frame 1 / loop: Randy stares wide awake; the calendar tears through the days (DAY 1 -> 11), pages fly at the lens, clock spins
const stare = {
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 7 }); s.r = randy(); s.r.position.set(0, 0, 0.6); s.stage.add(s.r);
    s.pages = []; for (let i = 1; i <= 11; i++) { const p = calPage(i, s.set.cal); s.stage.add(p); p.visible = false; s.pages.push(p); } return s; },
  draw(s, t, info, o = {}) { const rate = o.rate ?? 3.6, day = o.day ?? clamp(Math.floor(t * rate) + 1, 1, 11); s.set.cal.set(day); s.set.clock.update(t, o.clock ?? 0.6);
    s.pages.forEach((p, i) => { const t0 = (i) / rate, a = t - t0; p.visible = !o.still && a > 0 && a < 1.2 && i + 1 < day + 1 && i < 10; if (!p.visible) return; const k = a / 1.2;
      p.position.set(-0.4 + Math.sin(i * 2.1) * 1.6 * k, 3.0 - 0.6 * k + Math.sin(k * 3) * 0.4, -2.3 + k * 6.5); p.rotation.set(k * 3 + i, k * 4, k * 2); });
    s.r.pose(addPose(POSE.attention, { ...tremble(t, 0.8), headNod: -0.05 })); s.r.face({ ...WIDE, pupil: [Math.sin(t * 13) * 0.08, 0] }, t, { blink: false });
    camMove(s.stage, t, o.cam || [[0, { pos: [0, 2.0, 6.4], look: [0, 2.15, 0.4], fov: 36 }], [info.dur, { pos: [0, 2.15, 4.9], look: [0, 2.2, 0.5], fov: 34 }]], ease.inOut); },
};
registerShot('s01', { kind: '3d', init: stare.init, draw: stare.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'exclaim', on: 'r', at: 0.1 }, { fx: 'sweat', on: 'r', at: 1.2 }]); } });
registerShot('s17', { kind: '3d', init: stare.init, draw: (s, t, info) => stare.draw(s, t, info, { day: 1, still: true, cam: [[0, { pos: [0, 2.0, 6.6], look: [0, 2.15, 0.4], fov: 36 }], [info.dur, { pos: [0, 2.0, 6.4], look: [0, 2.15, 0.4], fov: 36 }]] }),
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'sparkle', on: [-0.4, 3.2, -2.3], at: 0.15, scale: 0.8 }]); } });

// s02 "On purpose." Randy turns to camera: smug thumbs-up grin
registerShot('s02', { kind: '3d', init: stare.init,
  draw(s, t, info) { s.set.cal.set(11); s.set.clock.update(t, 0.6); s.pages.forEach(p => (p.visible = false)); const k = ease.out(prog(t, 0.1, 0.4));
    s.r.pose(addPose(mixPose(POSE.attention, { ...POSE.relaxed, armR: [1.2, 0.25, 0.3], elbowR: 1.5 }, k), idle(t, 2))); s.r.face(mixExpr(WIDE, { ...EXPR.grin, lid: 0.1 }, k), t, { blink: false });
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 4.0], look: [0, 2.15, 0.6], fov: 32 }], [info.dur, { pos: [0.3, 2.3, 3.7], look: [0, 2.17, 0.6], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'sparkle', on: 'r', at: 0.3, scale: 0.8 }]); } });

// s03 "For a science fair project." school gym: tri-fold board, ribbon, Randy presents
registerShot('s03', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 7, wall: '#e8d8b0' }); s.set.visible = true; const st = s.stage;
    st.add(PR.table({ w: 2.6, d: 1.0, h: 0.95, color: '#c8a070' }).at(0, 0, -0.9)); const cloth = rbox(2.7, 0.04, 1.1, '#3a6ac8', 0, 0.97, -0.9, 0.02); st.add(cloth);
    const mid = board(['HOW LONG', 'CAN YOU STAY', 'AWAKE?'], { w: 1.3, h: 1.2, trim: '#c0392b' }); mid.position.set(0, 1.62, -1.15); st.add(mid);
    for (const sx of [-1, 1]) { const w = board(sx < 0 ? ['DAY 1', 'DAY 2', 'DAY 3'] : ['TESTS', 'NOTES', '???'], { w: 0.7, h: 1.2, trim: '#3a6ac8' }); w.position.set(sx * 1.0, 1.62, -1.0); w.rotation.y = -sx * 0.5; st.add(w); }
    s.r = randy(); s.r.position.set(1.15, 0, 0.5); s.r.rotation.y = -0.45; st.add(s.r); return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.1); s.set.cal.set(1); const k = ease.out(prog(t, 0.2, 0.6));
    s.r.pose(addPose(point(POSE.attention, 'R', k, { up: 0.15, across: 0.3 }), idle(t, 2))); s.r.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0.7, 2.0, 7.4], look: [0.55, 1.6, -0.4], fov: 38 }], [info.dur, { pos: [0.7, 2.0, 6.6], look: [0.55, 1.65, -0.4], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'stars', on: 'r', at: at(info, 'science', 0.4) }, { fx: 'sparkle', on: [0, 2.3, -1.1], at: 0.6, scale: 0.8 }]); } });

// s04 INSERT 1: the year (over a dark backdrop)
insertShot('s04', { insert: { type: 'bigtext', kicker: 'THE EXPERIMENT', title: '1963', lines: ['Randy Gardner, 17'], color: '#f2c230' }, bg: ['#1e2a5a', '#0e1230'] });

// s05 "Randy Gardner wants the world record for staying awake." a golden trophy on the desk: heart eyes
registerShot('s05', { kind: '3d',
  init(T) { const s = room(T, { target: [-1, 0, 0], shadowSize: 7 }); s.tr = trophy(); s.tr.position.set(-2.3, 1.0, -1.4); s.tr.scale.setScalar(1.3); s.stage.add(s.tr);
    s.r = randy(); s.r.position.set(-0.4, 0, 0.3); s.r.rotation.y = -0.4; s.stage.add(s.r); return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.1); s.set.cal.set(1); s.tr.rotation.y = t * 0.8; const w = at(info, 'world', 1.4);
    s.r.pose(addPose(mixPose(POSE.attention, POSE.holdFront, ease.inOut(prog(t, w, w + 0.4))), idle(t, 2))); s.r.face(mixExpr(EXPR.neutral, { ...EXPR.happy, lid: 0.3 }, prog(t, w, w + 0.3)), t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 5.6], look: [-1.3, 1.7, -0.6], fov: 36 }], [info.dur, { pos: [0.2, 2.1, 4.6], look: [-1.3, 1.75, -0.6], fov: 36 }]]); },
  overlay(g, t, info, s) { const w = at(info, 'world', 1.4); sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'sparkle', on: [-2.3, 2.0, -1.4], at: w - 0.1 }, { fx: 'heartEyes', on: 'r', at: w + 0.1 }, { fx: 'hearts', on: 'r', at: w + 0.2 }]); } });

// s06 "First, he gets moody." Randy snaps at a friend: angry + "!" + shake
registerShot('s06', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 6 }); s.r = randy(); s.r.position.set(-0.75, 0, 0.6); s.r.rotation.y = 0.5; s.f = friend(0); s.f.position.set(0.85, 0, 0.7); s.f.rotation.y = -0.5; s.stage.add(s.r, s.f); return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.1); s.set.cal.set(2); const m = at(info, 'moody', 0.7);
    s.r.pose(addPose(mixPose(POSE.relaxed, POSE.handsHips, ease.out(prog(t, m - 0.1, m + 0.15))), { ...idle(t, 1), lean: 0.1 * prog(t, m, m + 0.2) })); s.r.face(mixExpr(TIRED, EXPR.angry, prog(t, m - 0.1, m + 0.1)), t);
    s.f.pose(addPose(mixPose(POSE.relaxed, { ...POSE.panic, lean: -0.15 }, ease.out(prog(t, m, m + 0.2))), idle(t, 4))); s.f.face(t > m ? EXPR.shocked : EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.6], look: [0, 1.95, 0.6], fov: 36 }], [info.dur, { pos: [0, 2.0, 6.0], look: [0, 2.0, 0.6], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: m, amp: 0.06, dur: 0.35 }]); },
  overlay(g, t, info, s) { const m = at(info, 'moody', 0.7); sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'exclaim', on: 'r', at: m }, { fx: 'sweat', on: 'f', at: m + 0.15 }]); } });

// s07 "Then he can't focus, or remember things." book upside down, "???"
registerShot('s07', { kind: '3d',
  init(T) { const s = room(T, { target: [-2, 0, 0], shadowSize: 6 }); s.r = randy(); s.r.position.set(-3.2, -0.15, -0.7); s.stage.add(s.r);
    s.book = new THREE.Group(); s.book.add(rbox(0.5, 0.65, 0.08, '#2f8a6a', 0, 0, 0, 0.02)); const pg = rbox(0.46, 0.6, 0.06, '#fbf6e6', 0, 0, 0.03, 0.01); s.book.add(pg); s.stage.add(s.book); return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.1); s.set.cal.set(4);
    s.r.pose(addPose(POSE.sit, { armL: [0.75, 0.3, 0.4], armR: [0.75, 0.3, 0.4], elbowL: 0.9, elbowR: 0.9, headTilt: Math.sin(t * 1.5) * 0.15, headNod: 0.05 })); s.r.face({ ...TIRED, pupil: [Math.sin(t * 2) * 0.6, 0.1] }, t);
    const a = V(), b = V(); s.r.hand.L.getWorldPosition(a); s.r.hand.R.getWorldPosition(b); s.book.position.copy(a.add(b).multiplyScalar(0.5)).add(new THREE.Vector3(0, -0.12, 0.15)); s.book.scale.setScalar(0.8); s.book.rotation.set(-1.0, 0, Math.PI + Math.sin(t * 2) * 0.1);
    camMove(s.stage, t, [[0, { pos: [-2.6, 2.0, 4.0], look: [-3.1, 1.5, -0.6], fov: 34 }], [info.dur, { pos: [-2.7, 2.0, 3.3], look: [-3.1, 1.55, -0.6], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'question', on: 'r', at: 0.15 }, { fx: 'stars', on: 'r', at: at(info, 'remember', 1.3) }]); } });

// s08 "Then he starts seeing things that aren't there." night: the coat rack in the corner turns into a "someone" (glowing eyes) — then it's just a coat
registerShot('s08', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 7, light: 'night', night: true, wall: '#6a80a8' }); const st = s.stage;
    s.rack = new THREE.Group(); s.rack.add(cyl(0.04, 0.05, 2.3, '#5a3a22', 0, 1.15, 0, 8), cyl(0.3, 0.35, 0.06, '#5a3a22', 0, 0.03, 0, 12)); const coat = rbox(0.75, 1.1, 0.4, '#5a4a6a', 0, 1.55, 0.05, 0.2); const hat = cyl(0.3, 0.3, 0.3, '#2a2a3a', 0, 2.38, 0, 16); s.rack.add(coat, hat, cyl(0.45, 0.45, 0.04, '#2a2a3a', 0, 2.24, 0, 18));
    s.eyes = [-0.12, 0.12].map(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff6a0', transparent: true, opacity: 0 })); e.position.set(x, 2.05, 0.28); e.userData.noOutline = true; s.rack.add(e); return e; });
    s.rack.position.set(1.3, 0, -1.2); st.add(s.rack); import_outline(s.rack);
    s.r = randy(); s.r.position.set(-0.5, 0, 1.0); s.r.rotation.y = 0.7; st.add(s.r); s.stage.exposure = 1.35; return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.1); s.set.cal.set(6); const k = prog(t, 0.6, 0.9), off = prog(t, 2.0, 2.2);
    s.eyes.forEach(e => (e.material.opacity = k * (1 - off))); s.rack.rotation.z = Math.sin(t * 4) * 0.02 * k * (1 - off);
    s.r.pose(addPose(mixPose(POSE.relaxed, { ...POSE.panic, lean: -0.2 }, ease.out(prog(t, 0.7, 0.95))), tremble(t, 1.5))); s.r.face(mixExpr(TIRED, { ...EXPR.panic, pupil: [0.6, 0.1] }, prog(t, 0.7, 0.85)), t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.1, 7.6], look: [0.3, 1.7, -0.1], fov: 42 }], [info.dur, { pos: [-0.5, 2.0, 6.8], look: [0.35, 1.75, -0.1], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#8aa0ff' }); reactions(g, t, s, [{ fx: 'exclaim', on: 'r', at: 0.75 }, { fx: 'sweat', on: 'r', at: 0.9 }, { fx: 'ripples', on: s.rack, at: 0.65, until: 2.0 }]); } });
import { outline } from '/kits/toon3d/toon.js';
function import_outline(o) { outline(o, { px: 2.4 }); o.traverse(m => m.isMesh && (m.castShadow = true)); }

// s09 "Wait, how is he still awake?" BEANMEN beat: a friend squints at the lens: "???"
registerShot('s09', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 6 }); s.f = friend(1); s.f.position.set(0, 0, 1.0); s.stage.add(s.f); s.r = randy(); s.r.position.set(-1.6, 0, -0.6); s.r.rotation.y = 0.3; s.stage.add(s.r); return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.1); s.set.cal.set(8); s.f.pose(addPose(POSE.thinking, idle(t, 5))); s.f.face({ ...EXPR.suspicious, pupil: [0, 0] }, t);
    s.r.pose(addPose(POSE.attention, tremble(t, 0.6))); s.r.face(WIDE, t, { blink: false });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.25, 4.6], look: [-0.2, 2.0, 0.6], fov: 34 }], [info.dur, { pos: [0.15, 2.25, 3.8], look: [-0.15, 2.05, 0.7], fov: 33 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'question', on: 'f', at: 0.1 }]); } });

// s10 "You see, his friends took shifts keeping him up." friends swap in and out; one rings a bell, one claps
registerShot('s10', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 7 }); s.r = randy(); s.r.position.set(0, 0, 0.4); s.a = friend(0); s.b = friend(1); s.stage.add(s.r, s.a, s.b); return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.15); s.set.cal.set(9); const sw = ease.inOut(prog(t, 1.1, 1.6));
    s.a.position.set(lerp(-1.1, -3.6, sw), 0, lerp(0.8, 1.6, sw)); s.a.rotation.y = lerp(0.6, -1.4, sw); s.a.pose(sw > 0 && sw < 1 ? walk(t) : addPose({ ...POSE.holdFront }, { elbowL: Math.abs(Math.sin(t * 10)) * 0.6, elbowR: Math.abs(Math.sin(t * 10)) * 0.6 })); s.a.face(sw > 0.5 ? TIRED : EXPR.grin, t);
    s.b.position.set(lerp(3.6, 1.1, sw), 0, lerp(1.6, 0.8, sw)); s.b.rotation.y = lerp(-1.4, -0.6, sw); s.b.pose(sw > 0 && sw < 1 ? walk(t) : addPose(POSE.armsUp, { armL: [0, Math.sin(t * 9) * 0.3, 0], armR: [0, Math.sin(t * 9 + 1) * 0.3, 0] })); s.b.face(EXPR.grin, t);
    s.r.pose(addPose(POSE.sleepy, { ...tremble(t, 0.4), headNod: 0.25 + Math.sin(t * 2) * 0.1 - (sw >= 1 ? 0.25 : 0) })); s.r.face(sw >= 1 ? mixExpr(TIRED, WIDE, prog(t, 1.6, 1.8)) : { ...TIRED, lid: 0.8 }, t, { blink: false });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 7.6], look: [0, 1.7, 0.6], fov: 38 }], [info.dur, { pos: [0, 2.2, 7.0], look: [0, 1.75, 0.6], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'zzz', on: 'r', at: 0.1, until: 1.5 }, { fx: 'exclaim', on: 'r', at: 1.7 }, { fx: 'sparkle', on: 'b', at: 1.6, scale: 0.7 }]); } });

// s11 "On day 10, he beats a Stanford sleep scientist at pinball." side by side at the pinball machine; Randy wins
registerShot('s11', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 7, wall: '#c8a0d0' }); s.set.bed.visible = false; const st = s.stage;
    s.pb = [pinball(), pinball()]; s.pb[0].position.set(-1.0, 0, -1.0); s.pb[1].position.set(1.0, 0, -1.0); st.add(...s.pb);
    s.r = randy(); s.r.position.set(-1.0, 0, 0.35); s.d = scientist(); s.d.position.set(1.0, 0, 0.35); st.add(s.r, s.d); return s; },
  draw(s, t, info) { s.set.clock.update(t, 0.1); s.set.cal.set(10); const w = at(info, 'pinball', 3.0); const win = ease.out(prog(t, w, w + 0.3)); const hit = (p) => Math.max(0, Math.sin(t * 14 + p)) * 0.12;
    s.r.pose(t < w ? addPose(POSE.holdFront, { armL: [hit(0), 0, 0], armR: [hit(1.7), 0, 0], headTurn: 0 }) : addPose(POSE.armsUp, { bob: Math.abs(Math.sin(t * 9)) * 0.1 })); s.r.face(t < w ? { ...TIRED, lid: 0.4 } : EXPR.grin, t);
    s.d.pose(t < w ? addPose(POSE.holdFront, { armL: [hit(0.5), 0, 0], armR: [hit(2.4), 0, 0] }) : addPose(POSE.facepalm, idle(t))); s.d.face(t < w ? EXPR.deadpan : EXPR.sad, t);
    for (const b of [s.r, s.d]) { b.rotation.y = t < w ? Math.PI : lerp(Math.PI, Math.PI * 2, win); }
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 6.4], look: [0, 1.6, -0.4], fov: 40 }], [info.dur, { pos: [0, 2.8, 5.6], look: [0, 1.65, -0.4], fov: 40 }]]); },
  overlay(g, t, info, s) { const w = at(info, 'pinball', 3.0); sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'stars', on: 'r', at: w + 0.05 }, { fx: 'sparkle', on: 'r', at: w + 0.1 }, { fx: 'sweat', on: 'd', at: w + 0.2 }]); } });

// s12 INSERT 2: the counter (over the frame-1 room, blurred)
insertShot('s12', { scene: { init: stare.init, draw: (s, t, info) => stare.draw(s, t + 2.6, info, { day: 11, still: true }) },
  insert: { type: 'counter', title: 'DAY 11', value: 264, suffix: ' HOURS', lines: ['awake'], color: '#f2c230' } });

// s13 "Record." trophy raised, sparkle + stars, flash
registerShot('s13', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 6 }); s.r = randy(); s.r.position.set(0, 0, 0.6); s.tr = trophy(); s.stage.add(s.r, s.tr); return s; },
  draw(s, t, info) { s.set.cal.set(11); s.set.clock.update(t, 0.1); const k = ease.out(prog(t, 0, 0.25));
    s.r.pose(addPose(mixPose(POSE.attention, { ...POSE.armsUp, armL: [0.3, 2.9, 0], armR: [0.3, 2.9, 0], elbowL: 0.3, elbowR: 0.3 }, k), { bob: Math.abs(Math.sin(t * 7)) * 0.08 })); s.r.face({ ...EXPR.grin, lid: 0.55 }, t);
    const a = V(), b = V(); s.r.hand.L.getWorldPosition(a); s.r.hand.R.getWorldPosition(b); s.tr.position.copy(a.add(b).multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.05, 0));
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 6.4], look: [0, 2.6, 0.6], fov: 40 }], [info.dur, { pos: [0, 1.6, 5.8], look: [0, 2.7, 0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: s.tr, at: 0.1, height: 1.2 }, { fx: 'stars', on: 'r', at: 0.2 }]); } });

// s14 "Then he sleeps for almost 15 hours." in bed, zzz, clock races, night -> morning
registerShot('s14', { kind: '3d',
  init(T) { const s = room(T, { target: [2, 0, -0.5], shadowSize: 7 }); s.r = randy(); s.r.rotation.x = -Math.PI / 2; s.r.position.set(3.4, 0.98, 0.35); s.stage.add(s.r); return s; },
  draw(s, t, info) { s.set.cal.set(11); s.set.clock.update(t, 3); s.r.pose(POSE.relaxed); s.r.face(EXPR.asleep, t);
    camMove(s.stage, t, [[0, { pos: [0.8, 3.6, 4.8], look: [2.6, 1.0, -0.8], fov: 40 }], [info.dur, { pos: [1.2, 3.3, 4.0], look: [2.7, 1.0, -0.8], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [70, -80], strength: 0.5 * prog(t, 0.5, 2) }, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'zzz', on: [3.4, 1.6, -1.2], at: 0.1 }]); } });

// s15 INSERT 3: Guinness
insertShot('s15', { insert: { type: 'bigtext', kicker: 'GUINNESS WORLD RECORDS', title: 'NOT ACCEPTED', size: 120, lines: ['too dangerous'], color: '#ff5a4a' }, bg: ['#3a1e22', '#120a0e'] });

// s16 "It's too dangerous. Don't try this." the scientist wags a finger at the lens
registerShot('s16', { kind: '3d',
  init(T) { const s = room(T, { target: [0, 0, 0], shadowSize: 6 }); s.d = scientist(); s.d.position.set(0, 0, 0.8); s.stage.add(s.d); return s; },
  draw(s, t, info) { s.set.cal.set(11); s.set.clock.update(t, 0.1); const d = at(info, "don't", 1.6); const k = ease.out(prog(t, d - 0.2, d + 0.1));
    s.d.pose(addPose(mixPose(POSE.relaxed, { ...POSE.relaxed, armR: [1.0, 0.9, 0], elbowR: 1.9 }, k), { armR: [0, Math.sin(t * 12) * 0.12 * k, 0] })); s.d.face(t < d ? EXPR.worried : { ...EXPR.angry, mouth: 'line' }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 5.6], look: [0, 2.0, 0.8], fov: 34 }], [info.dur, { pos: [0, 2.2, 4.6], look: [0, 2.05, 0.8], fov: 34 }]]); },
  overlay(g, t, info, s) { const d = at(info, "don't", 1.6); sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'sweat', on: 'd', at: 0.2 }, { fx: 'exclaim', on: 'd', at: d }]); } });
