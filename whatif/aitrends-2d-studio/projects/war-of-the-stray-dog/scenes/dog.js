// War of the Stray Dog — 21 shots, Toon 3D + BEANMEN effects. LOL tone about the absurd cause; plain about the cost.
// Nobody is shown hurt: the shot is a flash + birds off the ridge; the "dozens of lives lost" beat is plain text on an empty border.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod, walk, run } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, dog, greek, bulgar, general, diplomat, borderPass, squad, warRoom, leagueHall, town, gavel, signpost, watchBox,
  hookText, stamp, plainText, bang, birds, PR, rbox, cyl, ball,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const soft = { rays: { from: [-70, -60], strength: 0.4 }, tint: '#ffe0b0' };
const GOLD = '#ffd25a', RED = '#ff5a4a', WHITE = '#ffffff';

// ---- the hero set: the border pass with two glaring squads (frame 1 and the payoff share it, so the loop is seamless)
function heroSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, -3] });
  const env = borderPass(st, { seed: 3 });
  const gk = squad(st, greek, 4, { seed: 50, pos: (i) => [-0.9 - (i % 2) * 0.7 - i * 0.15, 0, -2.4 - i * 1.3], face: 1.25 });
  const bg = squad(st, bulgar, 4, { seed: 60, pos: (i) => [0.9 + (i % 2) * 0.7 + i * 0.15, 0, -2.6 - i * 1.3], face: -1.25 });
  const d = dog({ seed: 2, scale: 1.0 }); st.add(d);
  return { stage: st, env, gk, bg, d };
}
const HERO0 = { pos: [0.0, 2.3, 6.6], look: [0, 1.3, -3.0], fov: 46 }, HERO1 = { pos: [0.0, 2.1, 5.8], look: [0, 1.2, -2.6], fov: 44 };
const glare = (s, t, k = 1) => { [...s.gk, ...s.bg].forEach((b, i) => { b.pose(addPose(POSE.attention, idle(t, i + 1, 0.4))); b.face(mixExpr(EXPR.suspicious, EXPR.angry, k * (0.5 + 0.5 * Math.sin(i))), t); }); };
const DOG_X0 = -1.6, DOG_X1 = 1.9, DOG_Z = 1.6;

// s01 — HOOK (frame 1, already moving): the dog trots right across the border line between two glaring squads.
registerShot('s01', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) {
    s.env.update(t); glare(s, t, prog(t, 0.6, 1.4));
    const k = t / info.dur; s.d.position.set(lerp(DOG_X0, DOG_X1 - 0.4, k), 0, DOG_Z); s.d.rotation.y = Math.PI / 2 - 0.25;
    s.d.update(t, { trot: 1, wag: 0.9, earsUp: 0.5, tongue: 0.8, lid: 0.15, look: [0.5, 0], headTurn: 0.55 });
    s.gk.concat(s.bg).forEach(b => { b.parts.head.rotation.y += 0; });
    camMove(s.stage, t, [[0, HERO0], [info.dur, HERO1]], ease.out);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookText(g, t, [[['they started a ', WHITE], ['WAR', RED]], [['over a ', WHITE], ['DOG', GOLD]]], { y: 300, size: 92 });
    stamp(g, t, '1925', { at: 0.15, x: 180, y: 560, size: 70, color: '#ffffff', fill: '#b8322a', rot: -0.1 });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.gk[0], at: 0.9, color: RED, scale: 0.8 }, { fx: 'exclaim', on: s.bg[0], at: 1.05, color: RED, scale: 0.8 }]);
  },
});

// s02 — "...accidentally started a war." Punch-in: a Greek soldier sprints in after the dog, arms out; the squads stiffen.
registerShot('s02', { kind: '3d',
  init(T) { const s = heroSet(T); s.sd = greek({ seed: 77 }); s.stage.add(s.sd); return s; },
  draw(s, t, info) {
    s.env.update(t); glare(s, t, 1);
    s.d.position.set(lerp(0.6, 2.6, t / info.dur), 0, DOG_Z); s.d.rotation.y = Math.PI / 2;
    s.d.update(t, { run: 1, wag: 1, earsUp: 0.2, tongue: 1, lid: 0.1 });
    s.sd.position.set(lerp(-3.4, -0.4, t / info.dur), 0, DOG_Z - 0.9); s.sd.rotation.y = Math.PI / 2 - 0.2;
    s.sd.pose(addPose(run(t), { armL: [1.4, 0.5, 0], armR: [1.4, 0.5, 0] })); s.sd.face(EXPR.panic, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 1.9, 7.4], look: [0, 1.2, 0.6], fov: 42 }], [info.dur, { pos: [0.6, 1.9, 6.8], look: [0.6, 1.2, 0.6], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookText(g, t, [[['they started a ', WHITE], ['WAR', RED]], [['over a ', WHITE], ['DOG', GOLD]]], { y: 300, size: 92, until: Math.max(0.3, 3.6 - info.shot.start) });
    reactions(g, t, s, [{ fx: 'speedlines', at: 0, until: info.dur }, { fx: 'sweat', on: s.sd, at: 0.2 }]);
  },
});

// s03 — "At least, that's the classic account." The dog sits, tilts its head at us, one brow up. Stamp + asterisk.
registerShot('s03', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) {
    s.env.update(t); glare(s, t, 0.5);
    s.d.position.set(0, 0, DOG_Z + 1.2); s.d.rotation.y = 0.15;
    const tilt = ease.inOut(prog(t, 0.5, 0.9));
    s.d.update(t, { sit: 1, wag: 0.4, earsUp: lerp(0.3, 0.8, tilt), lid: 0.3, headTilt: tilt * 0.35, browUp: tilt, look: [0, 0.05], tongue: 0 });
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 6.6], look: [0, 0.8, DOG_Z + 1.2], fov: 34 }], [info.dur, { pos: [0, 1.35, 6.1], look: [0, 0.8, DOG_Z + 1.2], fov: 33 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    stamp(g, t, 'THE CLASSIC ACCOUNT*', { at: 0.1, x: 540, y: 300, size: 66, color: '#ffffff', fill: '#2e4a6a', rot: -0.05 });
    plainText(g, t, '*there is another version', { at: at(info, 'account.', 1.0) - 0.1, y: 1560, size: 58 });
  },
});

// s04 — "A Greek soldier's dog ran across the Bulgarian border," Low angle at the line: the dog bolts across between the signs.
registerShot('s04', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 10, target: [0, 1, -2] }); const env = borderPass(st, { seed: 5 }); const d = dog({ seed: 2 }); st.add(d); return { stage: st, env, d }; },
  draw(s, t, info) {
    s.env.update(t);
    const b = at(info, 'border,', 1.6); const k = clamp(t / (b + 0.4));
    s.d.position.set(lerp(-5, 4, ease.inOut(k)), 0, -0.6); s.d.rotation.y = Math.PI / 2;
    s.d.update(t, { run: 1, wag: 1, earsUp: 0.1, tongue: 1, lid: 0.05 });
    camMove(s.stage, t, [[0, { pos: [0, 0.55, 3.6], look: [0, 1.2, -2], fov: 46 }], [info.dur, { pos: [0, 0.5, 3.2], look: [0, 1.2, -2], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'speedlines', at: 0.2, until: info.dur - 0.1 }]);
    stamp(g, t, 'BORDER', { at: at(info, 'border,', 1.4) - 0.1, x: 540, y: 470, size: 74, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
  },
});

// s05 — "and he chased after it." The soldier runs across the line after it, arms flailing; a Bulgarian watch box beyond.
registerShot('s05', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 12, target: [1, 1, -3] }); const env = borderPass(st, { seed: 5 });
    const wb = watchBox(); wb.position.set(6, 0, -9); wb.rotation.y = -0.6; st.add(wb);
    const sd = greek({ seed: 77 }); st.add(sd); const d = dog({ seed: 2 }); st.add(d); return { stage: st, env, sd, d }; },
  draw(s, t, info) {
    s.env.update(t);
    s.sd.position.set(lerp(-3.5, 2.2, t / info.dur), 0, 0); s.sd.rotation.y = Math.PI / 2 - 0.15;
    s.sd.pose(addPose(run(t), { armL: [1.6, 0.6, 0], armR: [1.2, 0.9, 0] })); s.sd.face(mixExpr(EXPR.worried, EXPR.panic, 0.6), t);
    s.d.position.set(lerp(1.5, 5.5, t / info.dur), 0, -1.2); s.d.rotation.y = Math.PI / 2 - 0.3; s.d.update(t, { run: 1, wag: 1, earsUp: 0.2, tongue: 1, lid: 0.1 });
    camMove(s.stage, t, [[0, { pos: [-0.5, 1.8, 6.6], look: [0, 1.3, -1], fov: 42 }], [info.dur, { pos: [0.6, 1.8, 6.2], look: [1.2, 1.3, -1], fov: 42 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sweat', on: s.sd, at: 0.1 }]);
    stamp(g, t, 'WAIT!', { at: 0.15, x: 260, y: 520, size: 70, color: '#ffffff', fill: '#1f4f86', rot: -0.1 }); },
});

// s06 — "A Bulgarian sentry saw him..." The sentry at his watch box: eyes narrow, "!".
registerShot('s06', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 34, shadowSize: 8, target: [0, 1.4, 0] }); const env = borderPass(st, { seed: 5 });
    const wb = watchBox(); wb.position.set(0.9, 0, -0.9); st.add(wb); const sn = bulgar({ seed: 23 }); sn.position.set(-0.4, 0, 0.2); sn.rotation.y = 0.2; st.add(sn); return { stage: st, env, sn }; },
  draw(s, t, info) {
    s.env.update(t);
    const see = ease.out(prog(t, 0.25, 0.5));
    s.sn.pose(addPose(POSE.attention, { ...idle(t, 3, 0.4), headTurn: lerp(-0.4, 0.35, see), lean: see * 0.08 }));
    s.sn.face(mixExpr(EXPR.bored, EXPR.suspicious, see), t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 3.6], look: [-0.3, 2.0, 0], fov: 34 }], [info.dur, { pos: [0.2, 2.25, 3.0], look: [-0.3, 2.05, 0], fov: 33 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); reactions(g, t, s, [{ fx: 'exclaim', on: s.sn, at: 0.45, color: RED }]);
    stamp(g, t, 'BULGARIAN SENTRY', { at: 0.05, x: 540, y: 330, size: 60, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 }); },
});

// s07 — "...and shot him." Far from the ridge: a flash + BANG, birds burst out of the pines; the dog in the foreground drops flat, ears down.
registerShot('s07', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, -2] }); const env = borderPass(st, { seed: 7 }); const d = dog({ seed: 2 }); d.position.set(0.6, 0, 1.2); d.rotation.y = -0.5; st.add(d); return { stage: st, env, d }; },
  draw(s, t, info) {
    s.env.update(t);
    const shot = at(info, 'shot', 0.4) - 0.05, dn = ease.out(prog(t, shot + 0.05, shot + 0.35));
    s.d.update(t, { crouch: dn, earsUp: lerp(0.5, 0, dn), wag: lerp(0.5, 0, dn), lid: lerp(0.15, 0.05, dn), headTurn: lerp(0, -0.6, dn), look: [-0.6, 0.2], tongue: 0, lidAngle: -0.25 * dn });
    camMove(s.stage, t, [[0, { pos: [0.8, 1.2, 4.4], look: [-0.6, 1.4, -6], fov: 40 }], [info.dur, { pos: [0.8, 1.15, 4.0], look: [-0.6, 1.4, -6], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: shot, amp: 0.04, dur: 0.4 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); const shot = at(info, 'shot', 0.4) - 0.05; birds(g, t, shot + 0.05, { x: 300, y: 560 }); bang(g, t, shot, { x: 300, y: 470 }); },
});

// s08 — "The Greek version is different:" VERSUS card: THE DOG vs A RAID.
registerShot('s08', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) { s.env.update(t); glare(s, t, 1); s.d.position.set(0, 0, DOG_Z); s.d.rotation.y = 0; s.d.update(t, { sit: 1, lid: 0.3 }); camMove(s.stage, t, [[0, HERO0], [info.dur, HERO1]]); },
  overlay(g, t, info, s) { dimScene(g, 8, 0.2); drawInsert(g, { type: 'versus', title: 'TWO VERSIONS', lines: ['A STRAY DOG', 'A RAID'], colorL: '#c8894a', color: '#1f4f86' }, t); },
});

// s09 — "Bulgarian troops crossed over and attacked a Greek outpost." Dusk: silhouettes cross the stones toward a Greek outpost hut.
registerShot('s09', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: 12, target: [-1, 1, -3] }); const env = borderPass(st, { seed: 8, noSky: true, grass: '#5e7448' });
    const hut = watchBox(); hut.position.set(-3.6, 0, -3.5); hut.rotation.y = 0.5; st.add(hut);
    const sg = signpost('GREEK OUTPOST', { bg: '#e8eef6', fg: '#1f4f86', w: 1.6 }); sg.position.set(-0.75, 0, -1.8); sg.rotation.y = 0.2; st.add(sg);
    const sil = []; for (let i = 0; i < 4; i++) { const b = bulgar({ seed: 90 + i, over: { silhouette: true } }); st.add(b); sil.push(b); }
    return { stage: st, env, sil }; },
  draw(s, t, info) {
    s.sil.forEach((b, i) => { const k = t / info.dur; b.position.set(lerp(1.8, -0.8, k) + i * 0.5, 0, -2.8 - i * 0.9); b.rotation.y = -Math.PI / 2 + 0.2; b.pose(walk(t + i * 0.3, { speed: 1.4 })); b.face(EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 6.6], look: [0, 1.3, -2.5], fov: 42 }], [info.dur, { pos: [-0.5, 2.0, 5.8], look: [-0.8, 1.3, -2.5], fov: 42 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ff9a6a', tintAmount: 0.15 });
    stamp(g, t, 'THE GREEK VERSION', { at: 0.05, x: 540, y: 330, size: 64, color: '#ffffff', fill: '#1f4f86', rot: -0.05 });
    stamp(g, t, 'RAID', { at: at(info, 'attacked', 1.6) - 0.1, x: 760, y: 560, size: 80, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: 0.1 }); },
});

// s10 — "But here's where it gets wild." Greek general slams the desk: shake + "!!".
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.5, 0] }); const set = warRoom(st);
    const gn = general({ seed: 5 }); gn.position.set(0, 0, -0.6); st.add(gn); return { stage: st, set, gn }; },
  draw(s, t, info) {
    const slam = at(info, 'wild.', 0.9) - 0.05, k = ease.out(prog(t, slam - 0.25, slam)), up = prog(t, slam - 0.5, slam - 0.25);
    s.gn.pose(addPose(POSE.stand, { armR: [lerp(0.4, 2.2, up) * (1 - k) + 1.0 * k, 0.2, 0], elbowR: 0.3, lean: k * 0.25, ...idle(t, 2, 0.3) }));
    s.gn.face(mixExpr(EXPR.suspicious, EXPR.angry, prog(t, 0.1, 0.4)), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 5.4], look: [0, 2.0, 0], fov: 38 }], [info.dur, { pos: [0, 2.4, 4.0], look: [0, 2.0, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: slam, amp: 0.06, dur: 0.4 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); const slam = at(info, 'wild.', 0.9) - 0.05;
    reactions(g, t, s, [{ fx: 'exclaim', on: s.gn, at: slam, color: RED }, { fx: 'flash', at: slam, dur: 0.15 }]);
    stamp(g, t, 'BUT...', { at: 0.05, x: 220, y: 330, size: 86, color: '#ffffff', fill: '#b8322a', rot: -0.1 }); },
});

// s11 — "Greece gave Bulgaria 48 hours:" counter card over the war room.
registerShot('s11', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.5, 0] }); const set = warRoom(st); const gn = general({ seed: 5 }); gn.position.set(0, 0, -0.6); st.add(gn); return { stage: st, set, gn }; },
  draw(s, t, info) { s.gn.pose(addPose(point(POSE.stand, 'R', 1, { up: 0.3 }), idle(t, 5, 0.4))); s.gn.face(EXPR.angry, t); camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 4.4], look: [0, 2, 0], fov: 36 }], [info.dur, { pos: [0.3, 2.4, 4.0], look: [0, 2, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { dimScene(g, 6, 0.5); drawInsert(g, { type: 'counter', title: 'ULTIMATUM', value: 48, from: 0, suffix: '', lines: ['HOURS'], color: '#ffcf4a' }, t + 0.2); },
});

// s12 — "apologize, punish those responsible, and pay 2 million francs." Ticked list; the last line ticked red.
registerShot('s12', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.5, 0] }); const set = warRoom(st); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 3.4, 5.6], look: [0, 3.6, -3], fov: 40 }], [info.dur, { pos: [0, 3.4, 5.0], look: [0, 3.6, -3], fov: 40 }]]); },
  overlay(g, t, info, s) { dimScene(g, 6, 0.45);
    const a = at(info, 'apologize,', 0.1), p = at(info, 'punish', 0.9), m = at(info, 'pay', 2.2);
    const shown = 1 + (t > p - 0.1) + (t > m - 0.1);
    drawInsert(g, { type: 'list', title: 'GREECE DEMANDS', lines: ['APOLOGIZE', 'PUNISH THOSE RESPONSIBLE', 'PAY 2,000,000 FRANCS'].slice(0, shown), highlight: 2 }, t - a + 0.35); },
});

// s13 — "Then Greek troops marched into Bulgaria," A column marches over the stones, past the BULGARIA sign.
registerShot('s13', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [1, 1, -2] }); const env = borderPass(st, { seed: 3 });
    const col = []; for (let i = 0; i < 8; i++) { const b = greek({ seed: 100 + i, skin: ['olive', 'fair', 'tan'][i % 3] }); st.add(b); col.push(b); } return { stage: st, env, col }; },
  draw(s, t, info) { s.env.update(t);
    s.col.forEach((b, i) => { const row = Math.floor(i / 2), side = i % 2; b.position.set(-2.6 + t * 1.3 - row * 1.4, 0, -0.5 + side * 1.0); b.rotation.y = Math.PI / 2; b.pose(walk(t, { speed: 1.5, amp: 1.1 })); b.face(EXPR.deadpan, t); });
    camMove(s.stage, t, [[0, { pos: [7.5, 2.2, 1.2], look: [-1, 1.4, 0], fov: 44 }], [info.dur, { pos: [7.0, 2.1, 1.0], look: [-1, 1.4, 0], fov: 44 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t, 'INVASION', { at: at(info, 'marched', 0.4) - 0.05, x: 540, y: 380, size: 78, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.08 }); },
});

// s14 — "toward the town of Petrich." Signpost PETRICH ->, red-roofed town in the valley ahead.
registerShot('s14', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, -4] }); const env = borderPass(st, { seed: 6 });
    const tw = town(st, { seed: 4 }); tw.group.position.set(2, 0, -22); tw.group.scale.setScalar(1.4);
    const sp = signpost('PETRICH', { arrow: true, w: 2.0 }); sp.position.set(-1.4, 0, -0.6); sp.rotation.y = 0.1; st.add(sp);
    const col = []; for (let i = 0; i < 6; i++) { const b = greek({ seed: 120 + i }); st.add(b); col.push(b); } return { stage: st, env, col }; },
  draw(s, t, info) { s.env.update(t);
    s.col.forEach((b, i) => { b.position.set(0.3 + (i % 2) * 1.0, 0, -0.5 - Math.floor(i / 2) * 1.4 - t * 1.4); b.rotation.y = Math.PI; b.pose(walk(t, { speed: 1.5 })); b.face(EXPR.deadpan, t); });
    camMove(s.stage, t, [[0, { pos: [-0.6, 3.2, 7.4], look: [1, 1.4, -10], fov: 42 }], [info.dur, { pos: [-0.4, 3.3, 6.8], look: [1.2, 1.4, -12], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); },
});

// s15 — "Bulgaria appealed to the League of Nations..." Telegram card over a Bulgarian minister.
registerShot('s15', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] }); const set = warRoom(st, { wall: '#5a4a5a' });
    const m = diplomat({ seed: 33, color: '#3a3a44' }); m.position.set(0, 0, -0.6); st.add(m); return { stage: st, set, m }; },
  draw(s, t, info) { s.m.pose(addPose(POSE.holdFront, idle(t, 4, 0.4))); s.m.face(EXPR.worried, t); camMove(s.stage, t, [[0, { pos: [0, 2.4, 4.6], look: [0, 2, 0], fov: 36 }], [info.dur, { pos: [0, 2.4, 4.1], look: [0, 2, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { dimScene(g, 6, 0.45); drawInsert(g, { type: 'document', title: 'TELEGRAM', lines: ['FROM: BULGARIA', 'TO: LEAGUE OF NATIONS', 'PLEASE INTERVENE'], highlight: 2, color: '#e8c25a' }, t + 0.1); },
});

// s16 — "...which ordered a ceasefire" The council chair bangs a gavel; CEASEFIRE stamp.
registerShot('s16', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 10, target: [0, 1.5, -1] }); const set = leagueHall(st);
    const ds = []; [[-1.15, '#2e3442', 'horseshoe', 'light'], [0, '#3a2e2a', 'bald', 'fair'], [1.15, '#2a3a44', 'swoop', 'tan']].forEach(([x, c, h, sk], i) => { const d = diplomat({ seed: 40 + i, color: c, hair: h, skin: sk }); d.position.set(x, 0, -1.2 - (x ? 0.3 : 0)); st.add(d); ds.push(d); });
    const gv = gavel(); st.add(gv); return { stage: st, set, ds, gv }; },
  draw(s, t, info) {
    const hit = at(info, 'ceasefire', 0.8) - 0.05, up = prog(t, hit - 0.35, hit - 0.1), dn = ease.in(prog(t, hit - 0.1, hit));
    s.ds.forEach((d, i) => { if (i === 1) d.pose(addPose(POSE.stand, { armR: [lerp(0.6, 2.3, up) - dn * 1.7, 0.25, 0], elbowR: 0.4, ...idle(t, 2, 0.3) })); else d.pose(addPose(POSE.holdFront, idle(t, i, 0.4))); d.face(i === 1 ? EXPR.deadpan : EXPR.bored, t); });
    s.ds[1].hand.R.getWorldPosition(s.gv.position); s.gv.rotation.set(0, 0, Math.PI / 2 - 0.3);
    camMove(s.stage, t, [[0, { pos: [0, 2.9, 6.6], look: [0, 1.7, -1], fov: 38 }], [info.dur, { pos: [0, 2.8, 6.0], look: [0, 1.7, -1], fov: 37 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.04, dur: 0.3 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffe4b0' }); const hit = at(info, 'ceasefire', 0.8) - 0.05;
    stamp(g, t, 'CEASEFIRE', { at: hit, x: 540, y: 440, size: 110, color: '#ffffff', fill: '#2f6a3a', rot: -0.08 }); },
});

// s17 — "hours before the attack." Troops freeze mid-step outside Petrich; one raises a finger. Clock stamp.
registerShot('s17', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, -3] }); const env = borderPass(st, { seed: 6 });
    const tw = town(st, { seed: 4 }); tw.group.position.set(0, 0, -14); tw.group.scale.setScalar(1.2);
    const col = []; for (let i = 0; i < 5; i++) { const b = greek({ seed: 130 + i }); b.position.set(-1.6 + i * 0.8, 0, -3 + (i % 2) * 0.9); b.rotation.y = Math.PI + (i - 2) * 0.12; st.add(b); col.push(b); } return { stage: st, env, col }; },
  draw(s, t, info) { s.env.update(t); const stop = ease.out(prog(t, 0.0, 0.35));
    s.col.forEach((b, i) => { b.pose(mixPose(walk(t, { speed: 1.5 }), addPose(POSE.attention, { headTurn: 0.8 * (i % 2 ? 1 : -1) * stop * 0.5 }), stop)); b.face(mixExpr(EXPR.deadpan, EXPR.shocked, stop), t); });
    camMove(s.stage, t, [[0, { pos: [0.6, 3.0, 7.0], look: [0, 1.5, -6], fov: 44 }], [info.dur, { pos: [0.5, 2.9, 6.4], look: [0, 1.5, -6], fov: 43 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t, 'HOURS BEFORE THE ATTACK', { at: at(info, 'hours', 0.2) - 0.05, x: 540, y: 360, size: 56, color: '#ffffff', fill: '#b8322a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'question', on: s.col[2], at: 0.3, scale: 0.8 }]); },
});

// s18 — "Greece had to pull out" The column trudges back across the stones, heads down.
registerShot('s18', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [0, 1, -2] }); const env = borderPass(st, { seed: 3 });
    const col = []; for (let i = 0; i < 6; i++) { const b = greek({ seed: 140 + i }); st.add(b); col.push(b); } return { stage: st, env, col }; },
  draw(s, t, info) { s.env.update(t);
    s.col.forEach((b, i) => { const row = Math.floor(i / 2), side = i % 2; b.position.set(2.6 - t * 1.1 + row * 1.4, 0, -0.5 + side * 1.0); b.rotation.y = -Math.PI / 2; b.pose(addPose(walk(t, { speed: 1.1, amp: 0.8 }), { headNod: 0.25, lean: 0.1 })); b.face(EXPR.sad, t); });
    camMove(s.stage, t, [[0, { pos: [-7.5, 2.2, 1.0], look: [1, 1.4, 0], fov: 44 }], [info.dur, { pos: [-7.0, 2.1, 0.8], look: [1, 1.4, 0], fov: 44 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); stamp(g, t, 'WITHDRAW', { at: 0.1, x: 540, y: 380, size: 80, color: '#ffffff', fill: '#2e4a6a', rot: -0.06 }); },
});

// s19 — "and pay Bulgaria 45,000 pounds." Big number over the war room.
registerShot('s19', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.5, 0] }); const set = warRoom(st); const gn = general({ seed: 5 }); gn.position.set(0, 0, -0.6); st.add(gn); return { stage: st, set, gn }; },
  draw(s, t, info) { s.gn.pose(addPose(shrug(POSE.stand, 1), idle(t, 2, 0.3))); s.gn.face(EXPR.sad, t); camMove(s.stage, t, [[0, { pos: [0, 2.4, 4.6], look: [0, 2, 0], fov: 36 }], [info.dur, { pos: [0, 2.4, 4.0], look: [0, 2, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { dimScene(g, 6, 0.5); const p = at(info, 'pounds.', 1.0) - 0.6;
    drawInsert(g, { type: 'bigtext', kicker: 'GREECE PAYS BULGARIA', title: '£45,000', size: 190, color: '#7fd06a' }, t - Math.max(0, Math.min(p, 0.2))); },
});

// s20 — "Ten days. Dozens of lives lost..." PLAIN: the empty border at dusk, cool tint, quiet text. No gag.
registerShot('s20', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: 12, target: [0, 1, -3] }); const env = borderPass(st, { seed: 3, noSky: true, grass: '#64784e' }); return { stage: st, env }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 1.6, 6.0], look: [0, 1.4, -6], fov: 42 }], [info.dur, { pos: [0, 1.6, 5.2], look: [0, 1.4, -6], fov: 41 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#9fb0d0', tintAmount: 0.25 });
    plainText(g, t, '10 DAYS', { at: 0.05, y: 420, size: 110 });
    plainText(g, t, 'Dozens of lives lost', { at: at(info, 'Dozens', 0.9) - 0.1, y: 560, size: 62, color: '#e8e4dc' }); },
});

// s21 — PAYOFF: "...and history calls it the War of the Stray Dog." Same set + framing as frame 1. The dog trots back in from the
// left at the end, landing on frame 1's start position, so the cut back to s01 loops.
registerShot('s21', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) {
    s.env.update(t); glare(s, t, 0.3);
    const tt = at(info, 'Stray', 1.2), back = prog(t, info.dur - 0.9, info.dur);
    if (back <= 0) { s.d.position.set(0, 0, DOG_Z); s.d.rotation.y = 0.1; s.d.update(t, { sit: 1, wag: 1, earsUp: 0.7, lid: 0.2, tongue: 1, look: [0, 0.05] }); }
    else { s.d.position.set(lerp(-3.4, DOG_X0, back), 0, DOG_Z); s.d.rotation.y = Math.PI / 2 - 0.25; s.d.update(t, { trot: 1, wag: 0.9, earsUp: 0.5, tongue: 0.8, lid: 0.15, look: [0.5, 0], headTurn: 0.55 }); }
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 5.4], look: [0, 1.1, DOG_Z - 0.8], fov: 40 }], [Math.max(0.1, info.dur - 0.9), { pos: [0, 2.0, 6.0], look: [0, 1.2, -1.5], fov: 44 }], [info.dur, HERO0]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const w = at(info, 'War', 1.0) - 0.1;
    stamp(g, t, 'THE WAR OF THE', { at: w, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#b8322a', rot: -0.05, until: info.dur - 0.85 });
    stamp(g, t, 'STRAY DOG', { at: w + 0.25, x: 540, y: 460, size: 104, color: '#2a1c15', fill: '#ffd25a', rot: -0.05, until: info.dur - 0.85 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'd', at: w, until: info.dur - 0.9, scale: 0.8 }]); },
});
