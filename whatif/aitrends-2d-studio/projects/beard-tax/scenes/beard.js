// Peter the Great's Beard Tax — 12 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator, nobody hurt.
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, walk, run } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene, voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook, sunnySky } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, bearded, peter, barber, patrol, scissors, token3D, diamondToken3D, drawToken, drawDiamondToken, oldMoscow, barberPole, museum,
  topCaption, yearStamp, stamp, insT, CARD_INK, PR, ball, cyl, rbox, box, floor, toon, outline,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.8 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const v3 = new THREE.Vector3();

// ---- the chase (s01 = frame 1, and s12 cuts straight back into it) ----
function chaseInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 16, target: [0, 1, -2] });
  const env = oldMoscow(st, { seed: 4 });
  const man = bearded({ coat: '#b8432f', hair: '#5a3418', beard: '#6a3e1e', hat: '#3a2a22', seed: 5, size: 0.95 }); st.add(man);
  const brb = barber(); st.add(brb);
  const sc = scissors(); sc.scale.setScalar(0.92); st.add(sc);
  const pole = barberPole(); pole.position.set(4.4, 0, -7); st.add(pole);
  return { stage: st, env, man, brb, sc, pole };
}
// t0 = time already elapsed in the chase (so the loop restarts mid-motion)
function chaseDraw(s, t, info, t0 = 0.6) {
  const T = t + t0; s.env.update(T);
  const zm = lerp(-6, 0.6, T / 3.0);
  s.man.position.set(0.35, 0, zm); s.man.rotation.y = 0;
  s.man.pose(addPose(run(T, { speed: 2.4, amp: 1.25 }), { headTurn: 0.25 + 0.15 * Math.sin(T * 3), armL: [0, 0.6, 0], armR: [0, 0.6, 0] }));
  s.man.face(EXPR.panic, T);
  const zb = zm - 2.9; s.brb.position.set(-1.3, 0, zb); s.brb.rotation.y = 0.05;
  s.brb.pose(addPose(run(T + 0.2, { speed: 2.4, amp: 1.1 }), { armR: [1.4, 0.2, 0], elbowR: 0.1, armL: [1.3, -0.1, 0], elbowL: 0.2, lean: 0.25 }));
  s.brb.face(EXPR.grin, T);
  s.sc.position.set(-1.05, 2.2, zb + 0.7); s.sc.rotation.set(0, -0.92, 0.06);
  s.sc.snap(0.5 + 0.5 * Math.sin(T * 15));
  s.pole.pole.rotation.y = T * 3;
  camMove(s.stage, t, [[0, { pos: [-1.9, 2.2, zm + 5.6], look: [-0.1, 1.85, zm - 1.1], fov: 50 }],
                       [info.dur, { pos: [-1.7, 2.15, zm + 5.1], look: [-0.1, 1.85, zm - 1.1], fov: 48 }]]);
}
const CHASE_FX = [{ fx: 'sweat', on: 'man', at: 0.0 }, { fx: 'speedlines', at: 0.0 }];

// s01 — frame 1: giant barber scissors snapping at a terrified bearded man, already mid-chase. Top caption from frame 1.
registerShot('s01', { kind: '3d',
  init: chaseInit,
  draw(s, t, info) { chaseDraw(s, t, info, 0.6); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.035, dur: 2.3 }]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' });
    reactions(g, t, s, [...CHASE_FX, { fx: 'exclaim', on: 'man', at: 0.0, until: 1.0, scale: 0.8 }]);
    topCaption(g, t, info);
  },
});

// s02 — "In 1698," Peter the Great strides into the street, big and stern. 1698 stamp.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, -2] });
    const env = oldMoscow(st, { seed: 6 });
    const p = peter(); st.add(p);
    return { stage: st, env, p };
  },
  draw(s, t, info) {
    s.env.update(t);
    const z = lerp(-4.5, -2.2, t / info.dur); s.p.position.set(0, 0, z);
    s.p.pose(walk(t, { speed: 1.5, amp: 1 })); s.p.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 0.9, 3.2], look: [0, 2.3, -2.5], fov: 44 }], [info.dur, { pos: [0.2, 0.9, 3.6], look: [0, 2.3, -2.5], fov: 42 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); topCaption(g, t, info); yearStamp(g, t, 1698, { at: at(info, '1698', 0.15) - 0.05, x: 760, y: 470 }); },
});

// s03 — "Peter the Great wanted Russia to look modern." He points at two bearded men; they freeze.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 12, target: [0, 1, -1] });
    const env = oldMoscow(st, { seed: 7, props: false });
    const p = peter(); p.position.set(-1.6, 0, 0.2); p.rotation.y = 0.75; st.add(p);
    const a = bearded({ coat: '#3f6fa8', hair: '#8a5a2a', seed: 21, size: 1.25 }); a.position.set(1.0, 0, -1.2); a.rotation.y = -0.5; st.add(a);
    const b = bearded({ coat: '#5a8a4a', hair: '#cfcac0', hat: '#4a3a2a', seed: 22, size: 1.45 }); b.position.set(2.4, 0, -2.2); b.rotation.y = -0.6; st.add(b);
    return { stage: st, env, p, a, b };
  },
  draw(s, t, info) {
    s.env.update(t);
    const kp = ease.outBack(prog(t, 0.35, 0.7));
    s.p.pose(point(addPose(POSE.stand, idle(t, 3)), 'R', kp, { up: 0.15 }));
    s.p.face(mixExpr(EXPR.deadpan, EXPR.angry, prog(t, 0.4, 0.7)), t);
    const shock = prog(t, 0.6, 0.8);
    for (const [c, sd] of [[s.a, 2], [s.b, 5]]) { c.pose(addPose(mixPose(POSE.stand, POSE.panic, shock * 0.6), idle(t, sd))); c.face(mixExpr(EXPR.neutral, EXPR.shocked, shock), t); }
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.3, 6.4], look: [0.4, 1.8, -0.8], fov: 44 }], [info.dur, { pos: [0.1, 2.25, 5.6], look: [0.6, 1.9, -0.9], fov: 42 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'exclaim', on: 'a', at: 0.75, scale: 0.7 }, { fx: 'sweat', on: 'b', at: 0.8 }]); },
});

// s04 — "So beards got taxed." Three bearded men in a row; a giant red stamp slams down on the word "taxed".
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 10, target: [0, 1, 0] });
    const env = oldMoscow(st, { seed: 8, props: false });
    const men = [['#b8432f', '#5a3418', 1.1, -1.5], ['#3f6fa8', '#8a5a2a', 1.3, 0], ['#7a4a8a', '#2a1a10', 1.2, 1.5]].map(([coat, hair, size, x], i) => {
      const m = bearded({ coat, hair, size, seed: 30 + i }); m.position.set(x, 0, -0.2 - Math.abs(x) * 0.15); st.add(m); return m; });
    return { stage: st, env, men };
  },
  draw(s, t, info) {
    s.env.update(t);
    const tx = at(info, 'taxed', 1.6), hit = clamp((t - tx) / 0.12);
    s.men.forEach((m, i) => { m.pose(addPose(mixPose(POSE.stand, POSE.panic, hit), { ...idle(t, 10 + i), bob: hit * 0.05 * Math.sin(t * 30 + i) })); m.face(mixExpr(EXPR.smug, EXPR.shocked, hit), t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.1, 8.6], look: [0, 1.6, -0.3], fov: 44 }], [info.dur, { pos: [0, 2.0, 7.8], look: [0, 1.6, -0.3], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tx, amp: 0.08, dur: 0.3 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    const tx = at(info, 'taxed', 1.6);
    stamp(g, t - tx, 'BEARD TAX', { y: 430, size: 118 });
    reactions(g, t, s, [{ fx: 'flash', at: tx, dur: 0.16, color: '#ffffff' }]);
  },
});

// s05 — "Pay up, and you got a beard token." Coins rain into an official's box; a token flies into the man's hand, he beams.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1, 0] });
    st.add(floor(30, 20, '#b89a78', 0, -2));
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), toon('#e9d9b8')); wall.position.set(0, 5, -3); wall.userData.noOutline = true; st.add(wall);
    const tb = PR.table({ w: 2.6, d: 1.2, h: 1.0, color: '#8a5a32' }); tb.position.set(0.6, 0, -0.8); st.add(tb);
    const off = bean_official(); off.position.set(0.9, 0, -1.9); st.add(off);
    const chest = rbox(0.8, 0.45, 0.5, '#6a3a1e', 0.2, 1.28, -0.7, 0.04); st.add(chest);
    const man = bearded({ coat: '#3f6fa8', hair: '#8a5a2a', seed: 21, size: 1.25 }); man.position.set(-1.3, 0, 0.3); man.rotation.y = 0.6; st.add(man);
    const coins = [0, 1, 2, 3, 4].map(i => { const c = cyl(0.09, 0.09, 0.025, '#e7c35a', 0, -5, 0, 16); st.add(c); return c; });
    const tk = token3D({ r: 0.2 }); st.add(tk);
    const ban = PR.banner({ txt: '' }); ban.position.set(-2.8, 0, -2.8); st.add(ban);
    return { stage: st, off, man, coins, tk, chest };
  },
  draw(s, t, info) {
    const tPay = at(info, 'Pay', 0.05), tTok = at(info, 'token', 1.9);
    s.coins.forEach((c, i) => { const k = clamp((t - tPay - i * 0.09) / 0.35); c.position.set(0.2 + Math.sin(i * 2.3) * 0.15, lerp(3.4, 1.55, ease.in(k)), -0.7 + Math.cos(i * 1.7) * 0.08); c.rotation.x = t * 9 + i; c.visible = k < 1 && t > tPay + i * 0.09 - 0.01; });
    const fly = clamp((t - tTok + 0.35) / 0.35), got = t > tTok;
    v3.set(0, 0, 0); s.man.hand.R.getWorldPosition(v3);
    if (!got) { s.tk.position.set(lerp(0.9, v3.x, ease.inOut(fly)), lerp(1.4, v3.y + 0.15, ease.inOut(fly)) + Math.sin(fly * Math.PI) * 0.8, lerp(-1.4, v3.z, ease.inOut(fly))); s.tk.rotation.y = t * 10; s.tk.visible = fly > 0; }
    else { s.tk.position.set(v3.x, v3.y + 0.18, v3.z + 0.05); s.tk.rotation.set(0, 0.2, 0); s.tk.visible = true; }
    const raise = ease.outBack(clamp((t - tTok) / 0.3));
    s.man.pose(addPose(mixPose(point(POSE.stand, 'R', 0.6, { up: -0.4 }), { ...POSE.stand, armR: [2.6, 0.1, 0], elbowR: 0.2 }, raise), idle(t, 4)));
    s.man.face(got ? EXPR.grin : mixExpr(EXPR.sad, EXPR.deadpan, 0.5), t);
    s.off.pose(addPose(POSE.stand, idle(t, 6))); s.off.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.3, 7.6], look: [-0.3, 1.6, -0.5], fov: 44 }], [info.dur, { pos: [-0.6, 2.3, 6.8], look: [-0.5, 1.7, -0.4], fov: 42 }]], ease.inOut);
  },
  overlay(g, t, info, s) { const tTok = at(info, 'token', 1.9); reactions(g, t, s, [{ fx: 'sparkle', on: 'man', at: tTok, scale: 0.9 }, { fx: 'stars', on: 'man', at: tTok + 0.1, until: tTok + 0.8 }]); },
});
function bean_official() { return patrol({ seed: 17 }); }

// s06 — "Patrols checked faces in the street." A patrol stops a bearded man mid-step: hand up. He flashes the token.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 12, target: [0, 1, -1] });
    const env = oldMoscow(st, { seed: 9 });
    const pt = patrol(); pt.position.set(1.3, 0, -0.4); pt.rotation.y = -1.2; st.add(pt);
    const man = bearded({ coat: '#b8432f', hair: '#5a3418', seed: 5, size: 1.1 }); man.rotation.y = 1.1; st.add(man);
    const tk = token3D({ r: 0.2 }); st.add(tk);
    return { stage: st, env, pt, man, tk };
  },
  draw(s, t, info) {
    s.env.update(t);
    const stop = 0.55, flash = 1.15;
    const x = lerp(-2.6, -0.75, ease.out(clamp(t / stop)));
    s.man.position.set(x, 0, -0.6);
    const walking = t < stop;
    const showK = ease.outBack(clamp((t - flash) / 0.25));
    const base = walking ? walk(t, { speed: 1.8 }) : mixPose(walk(stop, { speed: 1.8 }), POSE.stand, ease.out(clamp((t - stop) / 0.25)));
    s.man.pose(mixPose(base, { ...base, armL: [2.4, 0.2, 0], elbowL: 0.25 }, showK));
    s.man.face(t < flash ? mixExpr(EXPR.neutral, EXPR.shocked, prog(t, stop - 0.1, stop + 0.1)) : EXPR.smug, t);
    v3.set(0, 0, 0); s.man.hand.L.getWorldPosition(v3); s.tk.position.set(v3.x, v3.y + 0.2, v3.z + 0.05); s.tk.rotation.set(0, 0.9, 0); s.tk.visible = showK > 0.05;
    const halt = ease.outBack(clamp((t - 0.2) / 0.3));
    s.pt.pose(addPose(mixPose(POSE.attention, { ...POSE.attention, armR: [1.7, 0.3, -1.2], elbowR: 0.6 }, halt), { lean: clamp((t - flash - 0.2) / 0.3) * 0.25, headNod: clamp((t - flash - 0.2) / 0.3) * 0.25 }));
    s.pt.face(t < flash + 0.4 ? EXPR.suspicious : mixExpr(EXPR.suspicious, EXPR.deadpan, prog(t, flash + 0.4, flash + 0.7)), t);
    camMove(s.stage, t, [[0, { pos: [0.0, 2.2, 7.0], look: [0.0, 1.7, -0.5], fov: 44 }], [info.dur, { pos: [0.0, 2.15, 6.3], look: [0.0, 1.7, -0.5], fov: 42 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'exclaim', on: 'pt', at: 0.3, until: 1.0, scale: 0.8 }, { fx: 'question', on: 'pt', at: 1.4, until: 2.1, scale: 0.7 }, { fx: 'sparkle', on: 'man', at: 1.2, scale: 0.7 }]); },
});

// s07 — "One token even says..." The later DIAMOND token ("борода лишняя тягота") spins up into a close-up on dark velvet.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 30, shadow: false, bg: ['#4a1e24', '#2a0e14'] });
    const tk = diamondToken3D({ r: 1.15 }); st.add(tk);
    return { stage: st, tk };
  },
  draw(s, t, info) {
    const k = ease.out(clamp(t / info.dur));
    s.tk.rotation.set(0.12 * Math.sin(t * 2), lerp(Math.PI * 4.2, Math.PI * 2.0, k), 0.04);
    s.tk.position.set(0, lerp(-0.4, 0.15, k), 0);
    camMove(s.stage, t, [[0, { pos: [0, 0.2, 7.0], look: [0, 0.1, 0], fov: 30 }], [info.dur, { pos: [0, 0.2, 6.0], look: [0, 0.1, 0], fov: 30 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: [0, 0.2, 0], at: 0.6, scale: 1.4 }, { fx: 'glow', on: [0, 0.1, 0], at: 0.1, scale: 0.8 }]); },
});

// s08 — "The beard is a useless burden." 2D card: the token's text side + the inscription, line by line.
registerShot('s08', {
  draw(g, t, info) {
    voidBg(g, '#4a1e24', '#1e0a10');
    const k = ease.outBack(clamp(t / 0.3)); drawDiamondToken(g, E.W / 2, 700, 340 * k);
    g.save(); g.globalAlpha = clamp((t - 0.05) / 0.2); insT(g, 'A LATER TOKEN SAYS:', E.W / 2, 330, 58, { color: '#f0c890', stroke: CARD_INK }); g.restore();
    const words = [['"THE BEARD IS', 'beard'], ['A USELESS', 'useless'], ['BURDEN"', 'burden']];
    words.forEach(([w, cue], i) => { const t0 = at(info, cue, 0.2 + i * 0.4) - 0.12; const kk = ease.outBack(clamp((t - t0) / 0.22)); if (kk <= 0) return;
      g.save(); g.translate(E.W / 2, 1120 + i * 120); g.scale(kk, kk); g.rotate((i - 1) * 0.02); insT(g, w, 0, 0, 104, { color: i === 1 ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 }); g.restore(); });
  },
});

// s09 — reaction: a very bearded man reads it, deadpan, then mortally offended. Hugs his beard.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 30, shadowSize: 8, target: [0, 1.5, 0] });
    const env = oldMoscow(st, { seed: 12, props: false });
    const man = bearded({ coat: '#5a8a4a', hair: '#cfcac0', hat: '#4a3a2a', seed: 22, size: 1.6 }); man.position.set(0, 0, 0); st.add(man);
    return { stage: st, env, man };
  },
  draw(s, t, info) {
    s.env.update(t);
    const k = prog(t, 0.25, 0.5);
    s.man.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armL: [1.2, -0.35, 0.4], elbowL: 1.7, armR: [1.2, -0.35, -0.4], elbowR: 1.7 }, ease.out(k)), { ...idle(t, 8), headTilt: -0.12 * k }));
    s.man.face(mixExpr(EXPR.deadpan, { ...EXPR.angry, mouth: 'frown' }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 5.6], look: [0, 1.65, 0], fov: 34 }], [info.dur, { pos: [0, 2.0, 5.0], look: [0, 1.7, 0], fov: 32 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sweat', on: 'man', at: 0.2 }]); },
});

// s10 — "The British Museum..." a grand columned museum front, quick push-in.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 18, target: [0, 2, -4] });
    const sky = sunnySky(st, { clouds: 8, seed: 5 });
    st.add(floor(80, 60, '#d8ccb4', 0, -10));
    const tf = PR.templeFront({ w: 13, h: 6.5, n: 8 }); tf.position.set(0, 0, -6); st.add(tf);
    const back = rbox(16, 9, 4, '#ece3d0', 0, 4.5, -9, 0.1); st.add(back);
    const steps = [0, 1, 2].map(i => rbox(15 - i * 0.4, 0.25, 1.2, '#e2d8c2', 0, 0.12 + i * 0.25, -3.6 - i * 0.5, 0.03)); steps.forEach(x => st.add(x));
    const v = bearded({ coat: '#7a4a8a', hair: '#2a1a10', seed: 31, size: 1.2 }); v.position.set(1.2, 0, -1.2); v.rotation.y = Math.PI + 0.2; st.add(v);
    return { stage: st, sky, v };
  },
  draw(s, t, info) {
    s.sky.update(t);
    s.v.position.z = lerp(-0.8, -2.0, t / info.dur); s.v.pose(walk(t, { speed: 1.6 })); s.v.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 9.5], look: [0, 4.0, -6], fov: 46 }], [info.dur, { pos: [0, 1.7, 7.5], look: [0, 4.0, -6], fov: 44 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); },
});

// s11 — "...still has the tokens." The token in a lit glass case; a bearded visitor presses his nose to the glass.
function hallInit(T) {
  const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] });
  const hall = museum(st);
  const v = bearded({ coat: '#7a4a8a', hair: '#2a1a10', seed: 31, size: 1.2 }); v.position.set(-0.75, 0, 1.15); v.rotation.y = 2.5; st.add(v);
  const brb = barber(); brb.position.set(3.2, 0, -2.4); brb.rotation.y = -0.6; st.add(brb);
  const sc = scissors(); sc.scale.setScalar(0.85); st.add(sc);
  return { stage: st, hall, v, brb, sc };
}
registerShot('s11', { kind: '3d',
  init: hallInit,
  draw(s, t, info) {
    s.hall.token.rotation.y = Math.sin(t * 1.5) * 0.35;
    s.brb.visible = false; s.sc.visible = false;
    s.v.pose(addPose({ ...POSE.stand, armL: [-0.3, 0.1, 0], armR: [-0.3, 0.1, 0], elbowL: 0.6, elbowR: 0.6 }, { ...idle(t, 5), lean: 0.22 }));
    s.v.face(mixExpr(EXPR.neutral, EXPR.happy, prog(t, 0.4, 0.8)), t);
    camMove(s.stage, t, [[0, { pos: [0.9, 2.6, 6.0], look: [-0.2, 2.3, 0.3], fov: 38 }], [info.dur, { pos: [0.7, 2.6, 5.2], look: [-0.2, 2.4, 0.3], fov: 36 }]], ease.inOut);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: [0, 2.82, 0.1], at: 0.3, scale: 1.0 }, { fx: 'heartEyes', on: 'v', at: 0.7 }]); },
});

// s12 — "Subscribe for more." The visitor turns to us, smug... behind him the barber leans in, scissors open -> hard cut to s01.
registerShot('s12', { kind: '3d',
  init: hallInit,
  draw(s, t, info) {
    s.hall.token.rotation.y = Math.sin(t * 1.5) * 0.35;
    s.v.position.set(-0.5, 0, 1.6);
    const turn = ease.inOut(prog(t, 0.0, 0.35)); s.v.rotation.y = lerp(2.5, 0.15, turn);
    s.v.pose(addPose(POSE.stand, idle(t, 5))); s.v.face(EXPR.smug, t);
    const k = ease.out(prog(t, 0.55, 1.1)); s.brb.position.set(lerp(3.6, 1.7, k), 0, 0.6); s.brb.rotation.y = -0.5;
    s.brb.pose(addPose(POSE.stand, { armR: [1.4, 0.2, 0], elbowR: 0.1, lean: 0.25 * k })); s.brb.face(EXPR.grin, t);
    s.sc.position.set(s.brb.position.x - 0.5, 2.6, 1.0); s.sc.rotation.set(0, Math.PI - 0.2, -0.25); s.sc.snap(t > 1.2 ? 0.5 + 0.5 * Math.sin((t - 1.2) * 16) : 0);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 8.4], look: [0.5, 1.9, 0.8], fov: 42 }], [info.dur, { pos: [0.4, 2.3, 7.8], look: [0.5, 1.9, 0.8], fov: 41 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'exclaim', on: 'v', at: 1.25, scale: 0.8 }]); },
});
